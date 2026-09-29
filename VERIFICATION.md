# Local verification — 2026-09-29

Environment: macOS, Node v24.19.0, npm 11.17.0.

- `npm install`: completed; final dependencies exclude the deprecated upstream uuid package.
- `npm run build`: passed (strict TypeScript).
- `npm run typecheck`: passed.
- `npm test`: 3 tests passed, 0 failures. Covers official signed client streaming, open/close, heartbeat, zero-duration probe, invalid signing secret, PCMU stereo WAV, L16 mono values, malformed stereo-frame rejection, unaligned samples and active-session shutdown.
- `npm run dev` + `npm run test:local`: executed against port 3000 with temporary process-only random credentials. Received 10 packets; server stopped with SIGINT. No credentials were persisted.
- macOS `afinfo`: recognizes output as 2-channel 8000 Hz interleaved Int16 WAV, 2 seconds, 64000 audio bytes.
- `afplay -v 0`: muted playback succeeded (exit 0). Initial sandbox playback failed to access AudioQueue; retry with audio access succeeded.

Sample artifacts are in `recordings/`, filename beginning `59ac3bc1-aa3b-4957-af9b-f05479876d1f-1790690703026` (WAV and JSON).

Not tested: real Genesys Cloud tenant, ngrok/public WSS, tenant activation, actual call audio, transfers and privacy/hold behavior, full upstream conformance suite. No live Genesys connection is claimed. The development server was stopped after verification.
