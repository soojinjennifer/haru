/**
 * 가짜 오디오 — Stage 7 Plan §8 `highlight-clips:success` (`N7-20`, AC-7-17).
 *
 * **합성 톤**(사인파 + 짧은 페이드)으로 만든 PCM WAV 를 런타임에 생성한다. 실제 아동 음성 0 · 바이너리 커밋 0.
 * 8 kHz · 8-bit · mono — 12초 ≈ 96 KB(`data:` URL ≈ 128 KB). 결정적(난수 없음).
 */
import { toDataUrl } from './encoding';

export const MOCK_WAV_MIME_TYPE = 'audio/wav';
export const MOCK_WAV_SAMPLE_RATE = 8_000;
const TONE_HZ = 440;
const FADE_SECONDS = 0.05;

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

/** 8-bit PCM mono WAV 바이트. `durationSeconds` 는 1 이상 정수(클립 schema 와 같다). */
export function createMockWavBytes(durationSeconds: number): Uint8Array<ArrayBuffer> {
  const samples = Math.max(1, Math.round(durationSeconds)) * MOCK_WAV_SAMPLE_RATE;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, MOCK_WAV_SAMPLE_RATE, true);
  view.setUint32(28, MOCK_WAV_SAMPLE_RATE, true); // byte rate (8-bit mono)
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  writeAscii(view, 36, 'data');
  view.setUint32(40, samples, true);

  const fadeSamples = FADE_SECONDS * MOCK_WAV_SAMPLE_RATE;
  for (let index = 0; index < samples; index += 1) {
    const edge = Math.min(index, samples - 1 - index);
    const gain = Math.min(1, edge / fadeSamples) * 0.3;
    const value = Math.sin((2 * Math.PI * TONE_HZ * index) / MOCK_WAV_SAMPLE_RATE) * gain;
    view.setUint8(44 + index, Math.round(128 + value * 127));
  }

  return new Uint8Array(buffer);
}

export function createMockWavDataUrl(durationSeconds: number): string {
  return toDataUrl(MOCK_WAV_MIME_TYPE, createMockWavBytes(durationSeconds));
}
