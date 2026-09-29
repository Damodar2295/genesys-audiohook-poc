import { closeSync, openSync, writeSync } from 'node:fs';
import { MediaDataFrame, MediaParameter } from '../../vendor/audiohook';

// Synchronous, bounded writes are intentional for a small laptop POC: no growing audio queue.
export class AudioWriter {
  private fd: number;
  private bytes = 0;
  private closed = false;
  constructor(readonly filename: string, readonly media: MediaParameter) {
    this.fd = openSync(filename, 'wx', 0o600);
    try { this.writeAll(this.header(), 0); } catch (error) { closeSync(this.fd); throw error; }
  }
  private writeAll(data: Buffer, position: number) {
    let offset = 0;
    while (offset < data.length) {
      const n = writeSync(this.fd, data, offset, data.length - offset, position + offset);
      if (!n) throw new Error('No progress writing recording');
      offset += n;
    }
  }
  private header() {
    const h = Buffer.alloc(44), channels = this.media.channels.length;
    h.write('RIFF'); h.writeUInt32LE(36 + this.bytes, 4); h.write('WAVEfmt ', 8);
    h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(channels, 22);
    h.writeUInt32LE(this.media.rate, 24); h.writeUInt32LE(this.media.rate * channels * 2, 28);
    h.writeUInt16LE(channels * 2, 32); h.writeUInt16LE(16, 34);
    h.write('data', 36); h.writeUInt32LE(this.bytes, 40); return h;
  }
  write(frame: MediaDataFrame) {
    if (this.closed) throw new Error('Recording already closed');
    // Reference library decodes PCMU or reads AudioHook L16 as native Int16 samples.
    const samples = frame.as('L16').audio.data;
    const data = Buffer.alloc(samples.length * 2);
    samples.forEach((sample, i) => data.writeInt16LE(sample, i * 2));
    if (this.bytes + data.length > 0xffffffff - 36) throw new Error('WAV size limit reached');
    this.writeAll(data, 44 + this.bytes); this.bytes += data.length;
  }
  close() {
    if (!this.closed) {
      this.closed = true;
      try { this.writeAll(this.header(), 0); } finally { closeSync(this.fd); }
    }
    return { bytes: this.bytes, durationSeconds: this.bytes / (2 * this.media.channels.length * this.media.rate) };
  }
}
