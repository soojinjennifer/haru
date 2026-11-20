/** 분 포맷 — Stage 7 Spec §2.0 · Figma `163:2549` *62m* · `163:2557` *1h 12m* (`S7-C`). */
import { describe, expect, it } from 'vitest';

import { formatMinuteCount, formatMinutes } from '../formatMinutes';

describe('formatMinutes (주간 합계)', () => {
  it.each([
    [0, '0m'],
    [59, '59m'],
    [60, '1h'],
    [72, '1h 12m'],
    [125, '2h 5m'],
  ])('%i → %s', (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });

  it('음수 · 소수는 RangeError', () => {
    expect(() => formatMinutes(-1)).toThrow(RangeError);
    expect(() => formatMinutes(1.5)).toThrow(RangeError);
  });
});

describe('formatMinuteCount (StatTile *together* — Figma 62m)', () => {
  it('60 이상도 분 단위로 쓴다 — Figma `163:2549` *62m*', () => {
    expect(formatMinuteCount(62)).toBe('62m');
    expect(formatMinuteCount(0)).toBe('0m');
  });
});
