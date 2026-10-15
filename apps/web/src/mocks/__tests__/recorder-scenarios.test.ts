/**
 * `recorder` scenario 그룹 — Stage 4 `S4-C`: `web-background-warning`(`D4-4` · `D4-26`) ·
 * 인터럽션 3종 구분(`D4-1`). `RecorderAdapter` mock(`S4-D`)이 이 계획을 그대로 따른다.
 */
import { describe, expect, it } from 'vitest';

import {
  INTERRUPTION_CAUSES,
  RECORDER_EVENT_AFTER_CHUNKS,
  RECORDER_SCENARIO_KEYS,
  resolveRecorderScenario,
} from '../recorder/recorderScenarios';
import { createScenarioStoreFrom } from '../scenarios';

function plan(search: string) {
  return resolveRecorderScenario(createScenarioStoreFrom({ search }));
}

describe('recorder scenario 계획', () => {
  it('Catalogue §5.4 key 만 쓴다 — 인터럽션 key 를 쪼개지 않는다', () => {
    expect(RECORDER_SCENARIO_KEYS).toStrictEqual([
      'success',
      'mic-permission-denied',
      'recording-interrupted',
      'web-background-warning',
      'auto-timeout',
      'crash-recovered',
      // D4-29 (2026-10-15) — Catalogue §5.4 등재
      'local-retention-exceeded',
    ]);
    expect(INTERRUPTION_CAUSES).toStrictEqual(['visibilitychange', 'devicechange', 'track-ended']);
  });

  it('기본은 사건 없음 · 권한 허용', () => {
    expect(plan('')).toStrictEqual({
      key: 'success',
      permission: 'granted',
      interruptions: [],
      backgroundOnce: false,
      autoTimeout: false,
      crashRecovered: false,
      eventAfterChunks: RECORDER_EVENT_AFTER_CHUNKS,
    });
  });

  it('web-background-warning — 탭이 1회 숨겨졌다 돌아온다. 인터럽션은 아니다 (`D4-26` 조건 없는 안내)', () => {
    const result = plan('?scenario=recorder:web-background-warning');
    expect(result.backgroundOnce).toBe(true);
    expect(result.interruptions).toStrictEqual([]);
    expect(result.permission).toBe('granted');
    // 측정값처럼 보이는 조건(지연 ms · 중단 초)을 담지 않는다 — 시점은 청크 수뿐이다
    expect(Object.keys(result).sort()).toStrictEqual([
      'autoTimeout',
      'backgroundOnce',
      'crashRecovered',
      'eventAfterChunks',
      'interruptions',
      'key',
      'permission',
    ]);
  });

  it.each(INTERRUPTION_CAUSES)(
    '인터럽션 원인 하나만 — recorder.%s:recording-interrupted',
    (cause) => {
      const result = plan(`?scenario=recorder.${cause}:recording-interrupted`);
      expect(result.interruptions).toStrictEqual([cause]);
      expect(result.key).toBe('recording-interrupted');
    },
  );

  it('그룹 지정은 3종을 정해진 순서로 모두 낸다', () => {
    expect(plan('?scenario=recorder:recording-interrupted').interruptions).toStrictEqual([
      'visibilitychange',
      'devicechange',
      'track-ended',
    ]);
  });

  it('원인 지정은 다른 key 와 함께 쓸 수 있다 (백그라운드 안내 + 기기 변경)', () => {
    const result = plan(
      '?scenario=recorder:web-background-warning,recorder.devicechange:recording-interrupted',
    );
    expect(result.backgroundOnce).toBe(true);
    expect(result.interruptions).toStrictEqual(['devicechange']);
  });

  it('mic-permission-denied · auto-timeout · crash-recovered', () => {
    expect(plan('?scenario=recorder:mic-permission-denied').permission).toBe('denied');
    expect(plan('?scenario=recorder:auto-timeout').autoTimeout).toBe(true);
    expect(plan('?scenario=recorder:crash-recovered').crashRecovered).toBe(true);
  });

  it('결정적 — 같은 입력은 같은 계획', () => {
    const search = '?scenario=recorder.track-ended:recording-interrupted';
    expect(plan(search)).toStrictEqual(plan(search));
  });
});
