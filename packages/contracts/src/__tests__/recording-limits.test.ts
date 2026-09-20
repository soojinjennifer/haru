import { describe, expect, it } from 'vitest';

import * as rules from '../rules/index.js';
import { MAX_RECORDED_SECONDS, READY_ABANDON_SECONDS } from '../rules/recording-limits.js';

describe('녹음 상한 상수 (CONFIRMED #17-②)', () => {
  it('MAX_RECORDED_SECONDS = 1800 (30분, 실제 녹음 시간 기준 — 일시정지 제외)', () => {
    expect(MAX_RECORDED_SECONDS).toBe(1800);
  });

  it('READY_ABANDON_SECONDS = 600 (10분 방치 → abandoned)', () => {
    expect(READY_ABANDON_SECONDS).toBe(600);
  });

  it('rules/index 에서 함께 re-export 된다 (Stage 1 Plan §18-①)', () => {
    expect(rules.MAX_RECORDED_SECONDS).toBe(MAX_RECORDED_SECONDS);
    expect(rules.READY_ABANDON_SECONDS).toBe(READY_ABANDON_SECONDS);
    expect(typeof rules.canTransition).toBe('function');
    expect(typeof rules.isReportEligible).toBe('function');
  });
});
