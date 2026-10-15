import { describe, expect, it } from 'vitest';

import { type SessionMode, type SessionStatus, SessionStatusSchema } from '../enums/index.js';
import {
  SESSION_TRANSITIONS,
  type SessionTransitionActor,
  canTransition,
} from '../rules/session-transitions.js';

/** 허용 전이 14행 (API_CONTRACTS §3.1 — CONFIRMED #16, Stage 4 `D4-13` 으로 +2행) — modes 전개 16 조합. */
const ALLOWED: ReadonlyArray<[SessionStatus, SessionStatus, SessionTransitionActor, SessionMode]> =
  [
    ['ready', 'recording', 'caregiver', 'recorded'],
    ['ready', 'completed', 'caregiver', 'conversation_only'],
    ['ready', 'abandoned', 'caregiver', 'recorded'],
    ['ready', 'abandoned', 'caregiver', 'conversation_only'],
    ['ready', 'abandoned', 'server', 'recorded'],
    ['ready', 'abandoned', 'server', 'conversation_only'],
    ['recording', 'paused', 'caregiver', 'recorded'],
    ['paused', 'recording', 'caregiver', 'recorded'],
    ['recording', 'completed', 'caregiver', 'recorded'],
    ['paused', 'completed', 'caregiver', 'recorded'],
    ['completed', 'analyzing', 'server', 'recorded'],
    ['analyzing', 'analyzed', 'worker', 'recorded'],
    ['analyzing', 'failed', 'worker', 'recorded'],
    ['failed', 'analyzing', 'worker', 'recorded'],
    // Stage 4 `D4-13` 안 A — 사용자 `Discard`
    ['recording', 'abandoned', 'caregiver', 'recorded'],
    ['paused', 'abandoned', 'caregiver', 'recorded'],
  ];

/** 대표 비허용 전이 (AC-1-32). */
const DENIED: ReadonlyArray<
  [string, SessionStatus, SessionStatus, SessionTransitionActor, SessionMode]
> = [
  ['완료된 세션을 다시 녹음으로 되돌릴 수 없다', 'completed', 'recording', 'caregiver', 'recorded'],
  [
    '분석 완료 세션을 다시 녹음으로 되돌릴 수 없다',
    'analyzed',
    'recording',
    'caregiver',
    'recorded',
  ],
  [
    'conversation_only 세션은 녹음을 시작할 수 없다',
    'ready',
    'recording',
    'caregiver',
    'conversation_only',
  ],
  [
    'caregiver 는 분석을 시작시킬 수 없다 (actor 불일치)',
    'completed',
    'analyzing',
    'caregiver',
    'recorded',
  ],
  [
    'worker 는 녹음을 일시정지할 수 없다 (actor 불일치)',
    'recording',
    'paused',
    'worker',
    'recorded',
  ],
  [
    'recorded 세션은 ready 에서 바로 completed 가 될 수 없다',
    'ready',
    'completed',
    'caregiver',
    'recorded',
  ],
  ['abandoned 는 종단 상태다', 'abandoned', 'ready', 'caregiver', 'recorded'],
  ['analyzed 는 종단 상태다', 'analyzed', 'analyzing', 'worker', 'recorded'],
  ['paused 에서 바로 analyzing 으로 갈 수 없다', 'paused', 'analyzing', 'server', 'recorded'],
  ['같은 상태로의 자기 전이는 허용되지 않는다', 'recording', 'recording', 'caregiver', 'recorded'],
];

/**
 * 전이 표 **14 행 전수 스냅샷** (AC-4-07 · `R4-16`).
 *
 * 앞 12 행은 Stage 1 (#16) 원본이며 **문자 단위로 불변**이어야 한다. 마지막 2 행이 `D4-13` 이
 * 승인한 추가분의 전부다 — `abandonedReason` 같은 필드나 `discarded` 상태는 없다.
 */
const SNAPSHOT_STAGE1_ROWS = [
  { from: 'ready', to: 'recording', actor: 'caregiver', modes: ['recorded'] },
  { from: 'ready', to: 'completed', actor: 'caregiver', modes: ['conversation_only'] },
  { from: 'ready', to: 'abandoned', actor: 'caregiver', modes: ['recorded', 'conversation_only'] },
  { from: 'ready', to: 'abandoned', actor: 'server', modes: ['recorded', 'conversation_only'] },
  { from: 'recording', to: 'paused', actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused', to: 'recording', actor: 'caregiver', modes: ['recorded'] },
  { from: 'recording', to: 'completed', actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused', to: 'completed', actor: 'caregiver', modes: ['recorded'] },
  { from: 'completed', to: 'analyzing', actor: 'server', modes: ['recorded'] },
  { from: 'analyzing', to: 'analyzed', actor: 'worker', modes: ['recorded'] },
  { from: 'analyzing', to: 'failed', actor: 'worker', modes: ['recorded'] },
  { from: 'failed', to: 'analyzing', actor: 'worker', modes: ['recorded'] },
] as const;

const SNAPSHOT_D4_13_ROWS = [
  { from: 'recording', to: 'abandoned', actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused', to: 'abandoned', actor: 'caregiver', modes: ['recorded'] },
] as const;

describe('SESSION_TRANSITIONS (CONFIRMED #16 + D4-13)', () => {
  it('전이 표는 14 행이다 (12 → 14, D4-13)', () => {
    expect(SESSION_TRANSITIONS).toHaveLength(14);
  });

  it('14 행 전수가 스냅샷과 정확히 같다 — 앞 12 행 불변 + D4-13 2 행 (AC-4-07)', () => {
    expect(SESSION_TRANSITIONS).toEqual([...SNAPSHOT_STAGE1_ROWS, ...SNAPSHOT_D4_13_ROWS]);
    expect(SESSION_TRANSITIONS.slice(0, 12)).toEqual(SNAPSHOT_STAGE1_ROWS);
  });

  it('행에는 from · to · actor · modes 외 필드가 없다 (사유 필드 미도입 — R4-16)', () => {
    for (const transition of SESSION_TRANSITIONS) {
      expect(Object.keys(transition).sort()).toEqual(['actor', 'from', 'modes', 'to']);
    }
  });

  it('D4-13 귀결: 방치와 폐기는 같은 전이(→ abandoned, caregiver)라 표만으로 구분되지 않는다', () => {
    expect(canTransition('ready', 'abandoned', 'caregiver', 'recorded')).toBe(true);
    expect(canTransition('recording', 'abandoned', 'caregiver', 'recorded')).toBe(true);
    expect(canTransition('paused', 'abandoned', 'caregiver', 'recorded')).toBe(true);
    // 폐기는 녹음 세션에서만, 사용자만 한다
    expect(canTransition('recording', 'abandoned', 'caregiver', 'conversation_only')).toBe(false);
    expect(canTransition('recording', 'abandoned', 'server', 'recorded')).toBe(false);
    expect(canTransition('paused', 'abandoned', 'worker', 'recorded')).toBe(false);
    // 완료 이후에는 폐기할 수 없다
    expect(canTransition('completed', 'abandoned', 'caregiver', 'recorded')).toBe(false);
  });

  it('모든 행의 from/to 가 SessionStatus enum 값이다', () => {
    for (const transition of SESSION_TRANSITIONS) {
      expect(SessionStatusSchema.options).toContain(transition.from);
      expect(SessionStatusSchema.options).toContain(transition.to);
      expect(transition.modes.length).toBeGreaterThan(0);
    }
  });

  it('중복 행이 없다', () => {
    const keys = SESSION_TRANSITIONS.map(
      (t) => `${t.from}->${t.to}:${t.actor}:${[...t.modes].sort().join('|')}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('canTransition — 허용 전이', () => {
  it.each(ALLOWED)('%s → %s (%s, %s) 는 허용된다', (from, to, actor, mode) => {
    expect(canTransition(from, to, actor, mode)).toBe(true);
  });

  it('표의 14 행이 modes 전개 기준 16 조합을 허용한다', () => {
    const combinations = SESSION_TRANSITIONS.reduce((sum, t) => sum + t.modes.length, 0);
    expect(combinations).toBe(ALLOWED.length);
    expect(combinations).toBe(16);
  });
});

describe('canTransition — 비허용 전이', () => {
  it.each(DENIED)('%s', (_label, from, to, actor, mode) => {
    expect(canTransition(from, to, actor, mode)).toBe(false);
  });

  it('표에 없는 모든 조합은 false 다 (전수 검사)', () => {
    const actors: readonly SessionTransitionActor[] = ['caregiver', 'server', 'worker'];
    const modes: readonly SessionMode[] = ['recorded', 'conversation_only'];
    const allowedKeys = new Set(ALLOWED.map(([f, t, a, m]) => `${f}|${t}|${a}|${m}`));

    let allowedCount = 0;
    for (const from of SessionStatusSchema.options) {
      for (const to of SessionStatusSchema.options) {
        for (const actor of actors) {
          for (const mode of modes) {
            const result = canTransition(from, to, actor, mode);
            expect(result).toBe(allowedKeys.has(`${from}|${to}|${actor}|${mode}`));
            if (result) allowedCount += 1;
          }
        }
      }
    }
    expect(allowedCount).toBe(ALLOWED.length);
  });
});
