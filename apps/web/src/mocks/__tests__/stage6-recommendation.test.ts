/**
 * Stage 6 `S6-A` — `activity-cards` 그룹 `cold-to-warm` · `difficulty-lowered` (Plan §8 · AC-6-12 · Spec §2.8).
 *
 * 두 key 는 **세션·회고 서버 상태**로 덱을 고른다 — 시간이 아니라 기록 기준이라 결정적이다.
 * 카드 contract·구조는 그대로이고 책과 `reason` 문장만 바뀐다 (`N6-09` ⓐ · `PF6-1`).
 */
import { ActivityCardSchema, type ActivityCard } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_SCENARIO_KEYS,
  MOCK_WARM_MIN_COMPLETED_SESSIONS,
} from '../activities/MockActivityApi';
import { COLD_DECK_REASONS, STAGE6_DECK_REASONS } from '../fixtures/activity-cards';
import { MOCK_CHILD_ID } from '../fixtures/me';
import { DECK_BOOKS } from '../fixtures/saved-books';

import { bundle, ik, sessionBody, to } from './stage4-support';

type Bundle = ReturnType<typeof bundle>;

const CHILD = { childId: MOCK_CHILD_ID };
/** Stage 5 AC-5-44 금칙어 + Stage 6 AC-6-42 추가분. */
const FORBIDDEN = [
  'diagnos',
  'delay',
  'behind',
  'normal',
  'score',
  'worse',
  'better than',
  'peers',
  'weak',
  'lowest',
  'below',
];

/** 세션 하나를 만들어 `completed` 까지 진행한다. `n` 은 clientSessionKey 구분용. */
async function completeOne(b: Bundle, n: number): Promise<string> {
  const { session } = await b.clients.sessions.create(
    { body: sessionBody({ clientSessionKey: `client-session-key-s6-${String(n)}` }) },
    ik(`create-${String(n)}`),
  );
  await b.clients.sessions.transition(
    { sessionId: session.id, body: to('recording') },
    ik(`rec-${String(n)}`),
  );
  await b.clients.sessions.transition(
    { sessionId: session.id, body: to('completed') },
    ik(`done-${String(n)}`),
  );
  return session.id;
}

const reasons = (card: ActivityCard) => card.options.map((option) => option.reason);
const structure = (card: ActivityCard) =>
  card.options.map((option) => ({
    id: option.id,
    position: option.position,
    kind: option.kind,
    keys: Object.keys(option),
  }));

describe('activity-cards — Stage 6 key 등록', () => {
  it('`cold-to-warm` · `difficulty-lowered` 가 그룹에 있다', () => {
    expect(ACTIVITY_SCENARIO_KEYS).toContain('cold-to-warm');
    expect(ACTIVITY_SCENARIO_KEYS).toContain('difficulty-lowered');
    expect(MOCK_WARM_MIN_COMPLETED_SESSIONS).toBe(4);
  });
});

describe('`cold-to-warm` (FR-07 · PRD §8.3 · AC-6-39 Mock 부분)', () => {
  it('완료 세션 ≤ 3 → cold 덱 · 4번째 완료 후 → warm 문장 · 카드 구조·책·역량 동일', async () => {
    const b = bundle('activity-cards:cold-to-warm');
    // 지난 세션 seed = 완료 계열 2개 (analyzed · analyzing)
    const cold = await b.clients.activities.getTodayCard(CHILD);
    expect(reasons(cold)).toStrictEqual(COLD_DECK_REASONS);

    await completeOne(b, 3);
    const stillCold = await b.clients.activities.getTodayCard(CHILD);
    expect(reasons(stillCold)).toStrictEqual(COLD_DECK_REASONS);

    await completeOne(b, 4);
    const warm = await b.clients.activities.getTodayCard(CHILD);
    expect(ActivityCardSchema.safeParse(warm).success).toBe(true);
    expect(reasons(warm)).toStrictEqual(STAGE6_DECK_REASONS.slice(0, 3));
    expect(structure(warm)).toStrictEqual(structure(cold));
    expect(warm.options.map((option) => option.book.id)).toStrictEqual(
      cold.options.map((option) => option.book.id),
    );
    expect(warm.options.map((option) => option.capability)).toStrictEqual(
      cold.options.map((option) => option.capability),
    );
  });

  it('같은 기록이면 같은 덱 — 다시 만들어도 바이트가 같다 (결정성)', async () => {
    const run = async () => {
      const b = bundle('activity-cards:cold-to-warm');
      await completeOne(b, 3);
      await completeOne(b, 4);
      return JSON.stringify(await b.clients.activities.getTodayCard(CHILD));
    };
    expect(await run()).toBe(await run());
  });

  it('선택 응답도 같은 덱에서 옵션을 찾는다', async () => {
    const b = bundle('activity-cards:cold-to-warm');
    await completeOne(b, 3);
    await completeOne(b, 4);
    const card = await b.clients.activities.getTodayCard(CHILD);
    const first = card.options[0];
    if (first === undefined) throw new Error('deck is empty');
    const selection = await b.clients.activities.selectOption({
      cardId: card.id,
      selection: { optionId: first.id, readingContext: 'bedtime' },
    });
    expect(selection.option.reason).toBe(first.reason);
  });
});

describe('`difficulty-lowered` (PLANNING Exit · PRD §7.6 · AC-6-40 Mock 부분)', () => {
  it('회고 없음 → cold 덱 · 직전 세션 회고에 `tricky_today` → 첫 장 = 더 쉬운 책 + 그 문장', async () => {
    const b = bundle('activity-cards:difficulty-lowered');
    expect(reasons(await b.clients.activities.getTodayCard(CHILD))).toStrictEqual(
      COLD_DECK_REASONS,
    );

    const sessionId = await completeOne(b, 3);
    await b.clients.reflections.submit(
      { sessionId, body: { rating: 2, checks: ['tricky_today'], note: null } },
      ik('reflect'),
    );

    const lowered = await b.clients.activities.getTodayCard(CHILD);
    expect(ActivityCardSchema.safeParse(lowered).success).toBe(true);
    expect(lowered.options[0]?.book.id).toBe(DECK_BOOKS[2]?.id);
    expect(lowered.options[0]?.reason).toBe(STAGE6_DECK_REASONS[3]);
    // 덱의 역량 3종은 그대로 순환한다 (D-5)
    expect(new Set(lowered.options.map((option) => option.capability)).size).toBe(3);
  });

  it('`tricky_today` 없는 회고 → cold 덱 · 그 뒤 새 세션 완료(회고 전) → 다시 cold (직전 세션 기준)', async () => {
    const b = bundle('activity-cards:difficulty-lowered');
    const first = await completeOne(b, 3);
    await b.clients.reflections.submit(
      { sessionId: first, body: { rating: 5, checks: ['engaged'], note: null } },
      ik('r-engaged'),
    );
    expect(reasons(await b.clients.activities.getTodayCard(CHILD))).toStrictEqual(
      COLD_DECK_REASONS,
    );

    const tricky = await completeOne(b, 4);
    await b.clients.reflections.submit(
      { sessionId: tricky, body: { rating: null, checks: ['tricky_today'], note: null } },
      ik('r-tricky'),
    );
    expect((await b.clients.activities.getTodayCard(CHILD)).options[0]?.reason).toBe(
      STAGE6_DECK_REASONS[3],
    );

    await completeOne(b, 5);
    expect(reasons(await b.clients.activities.getTodayCard(CHILD))).toStrictEqual(
      COLD_DECK_REASONS,
    );
  });
});

describe('Stage 6 덱 문장 — 길이·언어 (Spec §2.8 · AC-6-42)', () => {
  it('warm·하향 문장은 cold 문장 길이 범위 안이다 (Figma 박스 2줄 — 카드 높이 불변)', () => {
    const lengths = COLD_DECK_REASONS.map((reason) => reason.length);
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    for (const reason of STAGE6_DECK_REASONS) {
      expect(reason.length).toBeGreaterThanOrEqual(min);
      expect(reason.length).toBeLessThanOrEqual(max);
    }
  });

  it('진단·판정·비교 금칙어 0', () => {
    for (const reason of STAGE6_DECK_REASONS) {
      for (const word of FORBIDDEN) {
        expect(reason.toLowerCase()).not.toContain(word);
      }
    }
  });
});
