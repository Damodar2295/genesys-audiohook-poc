# Genesys AudioHook laptop POC

Receive AudioHook Monitor audio through a temporary WSS tunnel, and save playable PCM WAV plus JSON metadata locally. No transcription, AI, database, Docker, or cloud deployment.

## Setup on macOS

Prerequisites: Node.js 22+ (tested with 24), npm, Git if obtaining the project from a repository, and ngrok for real Genesys access. This folder is self-contained: copy it to your Mac or use it within your existing checkout; there is no separate published repository to clone.

```sh
cd /Users/damodar/Desktop/AMEX/sedric/genesys-audiohook-poc
npm install
cp .env.example .env
openssl rand -base64 32
openssl rand -base64 32
```

Paste the first generated value into `API_KEY` in `.env`, and the second into `CLIENT_SECRET`. Keep the base64 value intact. Both are required; unsigned requests are rejected. Set `PORT`, `RECORDINGS_DIR`, and `LOG_LEVEL=debug` or `info` as needed. Relative recording paths resolve from the working directory. Credentials and recordings are gitignored.

```sh
npm run build
npm run typecheck
npm test
npm run dev
```

Expected startup: `Listening: ws://127.0.0.1:3000/api/v1/audiohook/ws`. The service binds only to IPv4 loopback. `npm start` runs the compiled build. Ctrl+C/SIGTERM stops admission, requests protocol disconnect, allows 1.5 seconds for clients to close, then terminates remaining sockets and finalizes recordings.

## Test without Genesys

Leave `npm run dev` running. In another terminal in this folder:

```sh
npm run test:local
npm run test:local -- --probe
ls -lt recordings
afplay recordings/<generated-file>.wav
```

The sender uses the vendored **official Genesys reference client**, signing utility and tone generator, with a small command wrapper. The normal test sends two seconds of a 1 kHz stereo tone. The probe uses the all-zero conversation ID and no audio; a header-only WAV is expected for that probe. `npm test` creates isolated temporary recording directories and asserts protocol completion, ping/pong, signature rejection, PCM headers/sample values and shutdown finalization.

Expected normal console lifecycle (UUIDs vary):

```text
AudioHook session started
Conversation ID: <uuid>
Session ID: <uuid>
Audio format: PCMU -> PCM16LE
Channels: external, internal
Sample rate: 8000
[<uuid>] -> opened seq=1
Audio packets arriving: <uuid>
...
WAV finalized: .../recordings/<conversation>-<timestamp>-<random>.wav (10 packets)
```

The paired JSON contains session/conversation IDs, negotiated media, timestamps, packet count, duration and bounded lifecycle records. Credentials, participant telephone numbers and arbitrary customConfig are not logged or saved. `debug` logs only control types and sequence numbers; `info` keeps session summaries.

## Tunnel and Genesys configuration

```sh
ngrok http 3000
```

If ngrok gives `https://abc123.ngrok.app`, configure:

```text
wss://abc123.ngrok.app/api/v1/audiohook/ws
```

TLS terminates at ngrok; its local hop goes to loopback HTTP/WebSocket. TLS validation is never disabled. Keep the original public Host header intact: **do not enable ngrok Host-header rewriting**, since Genesys signs the authority. Temporary tunnel hostnames can change on restart. You can first test the tunnel with the same official client:

```sh
AUDIOHOOK_URL=wss://<public-host>/api/v1/audiohook/ws npm run test:local
```

In your Genesys Cloud organization, have an administrator verify AudioHook Monitor availability/licensing, permissions, supported region and the current queue/flow activation procedure. Following the official configuration guide:

1. Install/add an AudioHook Monitor integration for this endpoint.
2. Set **Connection URI** to the public WSS URL, including the full path.
3. Select the required **Channel** (`both` for customer and agent).
4. Set **API Key** and **Client Secret** to the exact `.env` values.
5. Leave **Reconnections** disabled; this POC does not restore sessions.
6. Save and activate; Genesys runs a connectivity probe.
7. Assign/enable the monitor for the intended test queue/flow using your tenant's current configuration options.

These field names are documented by Genesys, but navigation and queue/flow assignment must be verified against the current docs rather than assumed:

- [Configure and activate AudioHook Monitor](https://help.genesys.cloud/articles/configure-and-activate-audiohook-monitor-in-genesys-cloud/)
- [Add and manage AudioHook Monitors](https://help.genesys.cloud/422434/)
- [Protocol introduction/specification](https://developer.genesys.cloud/devapps/audiohook/introduction)
- [Reference code and original test suite](https://github.com/purecloudlabs/audiohook-reference-implementation)

Place a test call through the configured queue/flow, speak on both sides, end the call, then play the generated WAV. Connection establishment, `open`/`opened`, binary audio, `ping`/`pong` and `close`/`closed` use the official state machines. Incoming HTTP signatures are verified by the official verifier with the API key, decoded client secret, signed identifiers, target and authority. Additional nonce replay protection is applied locally.

## Audio and scope

The receiver selects an offered PCMU or L16 format accepted by the reference validators. The pinned implementation supports **8000 Hz**; unsupported rates are rejected, never relabeled. Header sample rate and channel count come from selected media. PCMU is decoded with the reference utility; AudioHook L16 follows that implementation's little-endian sample interpretation on Macs. All output is standard interleaved 16-bit little-endian PCM WAV, with exact RIFF/data sizes patched at close. Channel order is preserved from negotiated metadata (normally external/customer left, internal/agent right for `both`).

Paused/discarded intervals are omitted from the WAV, not filled with synthetic silence. Lifecycle stream positions preserve evidence of those gaps. The POC has a 1 MiB WebSocket message cap, 10 concurrent session cap, 10-second opening timeout, bounded lifecycle history and classic WAV's approximately 4 GiB limit. Synchronous disk writes intentionally avoid unbounded in-memory queues, so this is a small laptop POC, not a high-throughput service. Force-kill or power loss cannot guarantee finalization. A lost connection finalizes the audio received so far.

## Troubleshooting

| Symptom | Check |
|---|---|
| HTTP 404 | Exact `/api/v1/audiohook/ws` path; no trailing slash/query. |
| HTTP 426 in browser/curl | Expected: endpoint requires a WebSocket upgrade. |
| HTTP 400 | Valid WebSocket handshake and three AudioHook UUID headers. |
| HTTP 401 / handshake failure | API key, base64 secret, request signature, clock skew and unchanged public Host header. |
| HTTP 503 | Server shutting down or 10-session cap reached. |
| TLS/certificate failure | Public `wss://` URL, valid tunnel certificate and reachable ngrok; keep TLS validation enabled. |
| Opens then closes | Check metadata-only control logs; malformed sequence/session ID/media, unsupported reconnection, or failure to open within 10 seconds. |
| No audio packets | A connectivity probe contains no audio. For calls, verify queue/flow assignment, selected channels and pause state. |
| Invalid protocol message | Use the provided reference client, not an arbitrary WebSocket text sender; check schema, IDs and sequence numbers. |
| WAV cannot play | Wait for finalization; probe WAVs have no samples. Check disk space, permissions and whether the process was force-killed. |
| Incorrect speed | Inspect JSON media rate and WAV header; do not reinterpret/resample payloads manually. |
| Incorrect channel mapping | Inspect ordered media.channels in JSON and test distinct speech on each side. |
| Tunnel unreachable | Keep server and ngrok running, confirm port 3000 and update changed public hostname in Genesys. |

## Layout and verification boundaries

```text
genesys-audiohook-poc/
  src/server.ts
  src/audiohook/{session,audioWriter}.ts
  scripts/local-client.ts
  test/poc.test.ts
  vendor/audiohook/           # reference protocol, signing, codecs and client
  vendor/{clientwebsocket,mediasource-tone}.ts
  vendor/{LICENSE,NOTICE.md}
  recordings/                # generated WAV + JSON; ignored by Git
  .env.example
  .gitignore
  package.json
  package-lock.json
  tsconfig.json
  README.md
```

Vendored source is pinned; see `vendor/NOTICE.md` for commit and small compatibility fixes. No AWS/CDK deployment components are included.

**Verified locally:** see `VERIFICATION.md` for executed build, tests, development server and WAV checks.

**Requires Genesys environment testing:** actual tenant licensing/permissions, activation probe, public tunnel reachability, live customer/agent audio, transfer/hold/privacy-pause behavior and call-end finalization. Local reference-client tests do not prove a real Genesys connection. The full upstream conformance suite is not claimed as executed.
