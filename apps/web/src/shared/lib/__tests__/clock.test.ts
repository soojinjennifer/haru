import { IsoDateTimeSchema } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createFixedClock, createSteppedClock, createSystemClock } from '../clock';

const EPOCH = Date.UTC(2026, 0, 1, 0, 0, 0);

describe('clock — 주입 가능한 시계 (Plan §8.3)', () => {
  it('고정 시계는 항상 같은 값을 돌려준다 (결정성)', () => {
    const clock = createFixedClock(EPOCH);

    expect(clock.now()).toBe(EPOCH);
    expect(clock.now()).toBe(EPOCH);
    expect(clock.nowIso()).toBe(clock.nowIso());
  });

  it('고정 시계의 ISO 값은 contracts IsoDateTime 을 통과한다', () => {
    const clock = createFixedClock(EPOCH);

    expect(IsoDateTimeSchema.safeParse(clock.nowIso()).success).toBe(true);
    expect(clock.nowIso()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('stepped 시계는 호출마다 정해진 간격으로 전진한다', () => {
    const clock = createSteppedClock(EPOCH, 1_000);

    expect(clock.now()).toBe(EPOCH);
    expect(clock.now()).toBe(EPOCH + 1_000);
    expect(clock.nowIso()).toBe(new Date(EPOCH + 2_000).toISOString());
  });

  it('system 시계만 실제 시각을 읽는다 (Mock 경로에서는 쓰지 않는다)', () => {
    const clock = createSystemClock();

    expect(clock.now()).toBeGreaterThan(0);
    expect(IsoDateTimeSchema.safeParse(clock.nowIso()).success).toBe(true);
  });
});
