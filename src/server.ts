import 'dotenv/config';
import { createServer, IncomingMessage } from 'node:http';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { httpsignature, isUuid } from '../vendor/audiohook';
import { attachSession } from './audiohook/session';

export const endpoint = '/api/v1/audiohook/ws';
export type Config = { port: number; dir: string; apiKey: string; secret: Buffer; debug?: boolean };
export async function startServer(config: Config) {
  if (!config.apiKey || config.secret.length < 32) throw new Error('Set API_KEY and a base64 CLIENT_SECRET of at least 32 bytes in .env');
  mkdirSync(config.dir, { recursive: true, mode: 0o700 });
  const server = createServer((req, res) => { res.writeHead(req.url === endpoint ? 426 : 404); res.end(); });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024, perMessageDeflate: false });
  const active = new Set<ReturnType<typeof attachSession>>();
  let stopping = false;
  const nonces = new Map<string, number>();
  async function authorized(req: IncomingMessage) {
    const apiKey = req.headers['x-api-key'];
    if (typeof apiKey !== 'string') return false;
    const supplied = Buffer.from(apiKey), expected = Buffer.from(config.apiKey);
    const correct = supplied.length === expected.length && timingSafeEqual(supplied, expected);
    let nonce = '';
    const result = await httpsignature.verifySignature({
      headerFields: req.headers,
      requiredComponents: ['@request-target', '@authority', 'audiohook-organization-id', 'audiohook-session-id', 'audiohook-correlation-id', 'x-api-key'],
      maxSignatureAge: 10,
      derivedComponentLookup: name => name === '@request-target' ? req.url ?? null : null,
      keyResolver: async params => {
        if (!params.nonce || params.nonce.length < 22 || params.keyid !== apiKey) return { code: 'BADKEY', key: randomBytes(32) };
        nonce = params.nonce;
        return { code: correct ? 'GOODKEY' : 'BADKEY', key: correct ? config.secret : randomBytes(32) };
      }
    });
    const now = Date.now();
    for (const [key, expires] of nonces) if (expires < now) nonces.delete(key);
    if (result.code !== 'VERIFIED' || !nonce || nonces.has(nonce) || nonces.size >= 10000) return false;
    nonces.set(nonce, now + 60000); return true;
  }
  server.on('upgrade', (req, socket, head) => {
    const reject = (code: number) => { socket.end(`HTTP/1.1 ${code} Rejected\r\nConnection: close\r\n\r\n`); };
    socket.on('error', () => {});
    void (async () => {
      if (req.url !== endpoint) return reject(404);
      if (stopping || active.size >= 10) return reject(503);
      const ids = ['audiohook-session-id', 'audiohook-organization-id', 'audiohook-correlation-id'].map(k => req.headers[k]);
      if (!ids.every(id => typeof id === 'string' && isUuid(id))) return reject(400);
      if (!await authorized(req)) return reject(401);
      if (stopping || active.size >= 10) return reject(503);
      wss.handleUpgrade(req, socket, head, ws => {
        const entry = attachSession(ws, ids[0] as string, ids[1] as string, config.dir, config.debug ?? false);
        active.add(entry); void entry.done.then(() => active.delete(entry));
      });
    })().catch(() => reject(400));
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(config.port, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No listening port');
  console.log(`Listening: ws://127.0.0.1:${address.port}${endpoint}`);
  let shutdown: Promise<void> | undefined;
  return { port: address.port, stop: () => shutdown ??= (async () => {
    stopping = true;
    const closed = new Promise<void>(resolve => server.close(() => resolve()));
    const entries = [...active];
    for (const entry of entries) entry.session.disconnect('completed', 'Server shutting down');
    const force = setTimeout(() => { for (const entry of entries) entry.ws.terminate(); }, 1500);
    await Promise.all(entries.map(entry => entry.done)); clearTimeout(force);
    wss.close(); await closed;
  })() };
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const secret = process.env.CLIENT_SECRET ?? '';
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(secret)) throw new Error('CLIENT_SECRET must be base64');
  void startServer({ port, dir: path.resolve(process.env.RECORDINGS_DIR ?? './recordings'), apiKey: process.env.API_KEY ?? '', secret: Buffer.from(secret, 'base64'), debug: process.env.LOG_LEVEL === 'debug' }).then(app => {
    const stop = () => { void app.stop().catch(() => { process.exitCode = 1; }); };
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
