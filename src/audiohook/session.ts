import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { WebSocket } from 'ws';
import { createServerSession, Logger } from '../../vendor/audiohook';
import { AudioWriter } from './audioWriter';

export const quietLogger: Logger = {
  fatal() {}, error() {}, warn() {}, info() {}, debug() {}, trace() {}
};

export function attachSession(ws: WebSocket, id: string, organizationId: string, dir: string, debug: boolean) {
  // Reference debug logging dumps control bodies; use metadata-only logging here.
  const session = createServerSession({ ws, id, logger: quietLogger });
  let writer: AudioWriter | undefined;
  let finalized = false;
  let opened = false;
  let failed = false;
  let sidecar = '';
  const metadata: Record<string, unknown> = { sessionId: id, organizationId, startedAt: new Date().toISOString() };
  const lifecycle: object[] = [];
  let lifecycleDropped = 0;
  const record = (entry: object) => { if (lifecycle.length < 10000) lifecycle.push({ at: new Date().toISOString(), ...entry }); else lifecycleDropped++; };
  let resolveDone!: () => void;
  const done = new Promise<void>(resolve => { resolveDone = resolve; });
  let packets = 0;
  const finalize = () => {
    if (finalized) return;
    finalized = true;
    try {
      const audio = writer?.close();
      if (sidecar) writeFileSync(sidecar, JSON.stringify({ ...metadata, endedAt: new Date().toISOString(), packets, audio, failed, lifecycle, lifecycleDropped }, null, 2), { mode: 0o600 });
      if (writer) console.log(`WAV finalized: ${writer.filename} (${packets} packets)`);
    } catch (error) { console.error('Recording finalization failed:', error instanceof Error ? error.message : 'unknown error'); }
  };
  const timer = setTimeout(() => { if (!opened) ws.terminate(); }, 10000);
  session.addAuthenticator((_s, params) => params.organizationId === organizationId || 'Organization mismatch');
  session.addMediaSelector((_s, offered) => offered.filter(m => (m.format === 'PCMU' || m.format === 'L16') && m.channels.length > 0));
  session.addOpenHandler(({ openParams, selectedMedia }) => {
    if (openParams.continuedSessions?.length) throw new Error('Reconnections are not supported by this POC');
    if (!selectedMedia) throw new Error('No supported audio format offered');
    const conversationId = openParams.conversationId;
    const safeId = conversationId.replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 64);
    const base = path.join(dir, `${safeId}-${Date.now()}-${randomUUID()}`);
    writer = new AudioWriter(`${base}.wav`, selectedMedia); sidecar = `${base}.json`;
    Object.assign(metadata, { conversationId, media: selectedMedia, outputFormat: 'PCM16LE', gaps: 'Paused/discarded audio is omitted; see lifecycle positions.' });
    opened = true; clearTimeout(timer);
    console.log(`AudioHook session started\nConversation ID: ${conversationId}\nSession ID: ${id}\nAudio format: ${selectedMedia.format} -> PCM16LE\nChannels: ${selectedMedia.channels.join(', ')}\nSample rate: ${selectedMedia.rate}`);
    return () => { finalize(); };
  });
  session.on('audio', frame => {
    try { writer?.write(frame); packets++; if (packets === 1) console.log(`Audio packets arriving: ${id}`); }
    catch { failed = true; session.disconnect('error', 'Audio recording failed'); ws.close(); }
  });
  session.on('error', () => { failed = true; record({ type: 'client-error' }); });
  session.on('clientMessage', m => {
    record({ direction: 'in', type: m.type, seq: m.seq, position: m.position });
    if (debug) console.log(`[${id}] <- ${m.type} seq=${m.seq}`);
  });
  session.on('serverMessage', m => {
    record({ direction: 'out', type: m.type, seq: m.seq });
    if (m.type === 'disconnect') failed = true;
    if (debug) console.log(`[${id}] -> ${m.type} seq=${m.seq}`);
  });
  ws.on('error', () => { failed = true; });
  ws.on('close', code => { clearTimeout(timer); record({ type: 'websocket-close', code }); });
  session.addFiniHandler(() => { finalize(); resolveDone(); });
  return { session, ws, done };
}
