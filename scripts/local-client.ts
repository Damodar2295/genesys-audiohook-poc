import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createClientSession, StreamDuration } from '../vendor/audiohook';
import { createClientWebSocket } from '../vendor/clientwebsocket';
import { createToneMediaSource } from '../vendor/mediasource-tone';
import { quietLogger } from '../src/audiohook/session';

export async function runClient(uri: string, apiKey: string, secret: Buffer, seconds = 2, probe = false) {
  const session = createClientSession({
    uri, organizationId: randomUUID(), conversationId: probe ? '00000000-0000-0000-0000-000000000000' : randomUUID(),
    mediaSource: createToneMediaSource(StreamDuration.fromSeconds(probe ? 0 : seconds)),
    createWebSocket: createClientWebSocket, authInfo: { apiKey, clientSecret: secret }, logger: quietLogger,
    initialPingDelay: 100, pingInterval: 200, closeTimeout: 1000
  });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { void session.close(); reject(new Error('Client timed out')); }, (seconds + 8) * 1000);
    session.once('disconnected', () => {
      clearTimeout(timer);
      if (!session.openedMsg || !session.closedMsg) reject(new Error('Protocol session did not complete'));
      else resolve();
    });
  });
  return session;
}
if (require.main === module) {
  void runClient(process.env.AUDIOHOOK_URL ?? `ws://127.0.0.1:${process.env.PORT ?? 3000}/api/v1/audiohook/ws`, process.env.API_KEY ?? '', Buffer.from(process.env.CLIENT_SECRET ?? '', 'base64'), 2, process.argv.includes('--probe'))
    .then(() => console.log('Official reference client completed. Inspect recordings/ and play the WAV with afplay.'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
