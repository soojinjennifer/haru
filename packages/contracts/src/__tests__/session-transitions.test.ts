import { describe, expect, it } from 'vitest';

import { type SessionMode, type SessionStatus, SessionStatusSchema } from '../enums/index.js';
import {
  SESSION_TRANSITIONS,
  type SessionTransitionActor,
  canTransition,
} from '../rules/session-transitions.js';

/** 허용 전이 12행 (API_CONTRACTS §3.1 — CONFIRMED #16). */
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

describe('SESSION_TRANSITIONS (CONFIRMED #16)', () => {
  it('전이 표는 12 행이다', () => {
    expect(SESSION_TRANSITIONS).toHaveLength(12);
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

  it('표의 12 행이 modes 전개 기준 14 조합을 허용한다', () => {
    const combinations = SESSION_TRANSITIONS.reduce((sum, t) => sum + t.modes.length, 0);
    expect(combinations).toBe(ALLOWED.length);
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
