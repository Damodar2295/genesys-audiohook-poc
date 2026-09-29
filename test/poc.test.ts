import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { startServer, endpoint } from '../src/server';
import { runClient } from '../scripts/local-client';
import { AudioWriter } from '../src/audiohook/audioWriter';
import { mediaDataFrameFromMessage, MediaParameter } from '../vendor/audiohook';

test('signed official client: open, stereo audio, ping/pong, close and probe', { timeout: 15000 }, async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'audiohook-test-'));
  const secret = randomBytes(32), apiKey = randomBytes(24).toString('base64');
  const app = await startServer({ port: 0, dir, secret, apiKey });
  try {
    const session = await runClient(`ws://127.0.0.1:${app.port}${endpoint}`, apiKey, secret);
    assert.ok(session.pongMsg);
    const wav = readFileSync(path.join(dir, readdirSync(dir).find(n => n.endsWith('.wav'))!));
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.readUInt32LE(4), wav.length - 8);
    assert.equal(wav.readUInt16LE(20), 1); assert.equal(wav.readUInt16LE(22), 2);
    assert.equal(wav.readUInt32LE(24), 8000); assert.equal(wav.readUInt32LE(40), 64000);
    assert.ok(wav.subarray(44).some(v => v !== 0));
    const meta = JSON.parse(readFileSync(path.join(dir, readdirSync(dir).find(n => n.endsWith('.json'))!), 'utf8'));
    assert.equal(meta.audio.durationSeconds, 2); assert.equal(meta.failed, false);
    await runClient(`ws://127.0.0.1:${app.port}${endpoint}`, apiKey, secret, 0, true);
    await assert.rejects(runClient(`ws://127.0.0.1:${app.port}${endpoint}`, apiKey, randomBytes(32), 0));
  } finally { await app.stop(); }
});

test('PCM samples and mono channel metadata preserved', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'audiohook-pcm-'));
  const media: MediaParameter = { type: 'audio', format: 'L16', rate: 8000, channels: ['external'] };
  const file = path.join(dir, 'mono.wav');
  const writer = new AudioWriter(file, media);
  writer.write(mediaDataFrameFromMessage(Buffer.from([0x34, 0x12, 0xcc, 0xed]), media));
  writer.close(); writer.close();
  const wav = readFileSync(file);
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readInt16LE(44), 0x1234); assert.equal(wav.readInt16LE(46), -0x1234);
  const stereo: MediaParameter = { ...media, channels: ['external', 'internal'] };
  assert.throws(() => mediaDataFrameFromMessage(Buffer.alloc(2), stereo));
  const unaligned = Buffer.from([0, 0x34, 0x12]).subarray(1);
  assert.equal(mediaDataFrameFromMessage(unaligned, media).as('L16').audio.data[0], 0x1234);
});

test('shutdown finalizes an active recording', { timeout: 15000 }, async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'audiohook-stop-'));
  const secret = randomBytes(32), apiKey = randomBytes(24).toString('base64');
  const app = await startServer({ port: 0, dir, secret, apiKey });
  const client = runClient(`ws://127.0.0.1:${app.port}${endpoint}`, apiKey, secret, 10);
  await new Promise(resolve => setTimeout(resolve, 500));
  await app.stop(); await client;
  const wav = readFileSync(path.join(dir, readdirSync(dir).find(n => n.endsWith('.wav'))!));
  assert.equal(wav.readUInt32LE(40), wav.length - 44); assert.ok(wav.length > 44);
});
