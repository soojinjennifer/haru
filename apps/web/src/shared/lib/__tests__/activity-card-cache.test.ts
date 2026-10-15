/**
 * Activity Card 오프라인 캐시 — 결정 `D-11` (이월 `QA-3-002`, AC-4-83 유효기간·폐기 규칙 고정).
 */
import { describe, expect, it } from 'vitest';

import { createActivityCardFixture } from '../../../mocks/fixtures/activity-cards';
import { MOCK_CHILD_ID } from '../../../mocks/fixtures/me';
import {
  ACTIVITY_CARD_CACHE_MAX_AGE_DAYS,
  ACTIVITY_CARD_CACHE_SCHEMA_VERSION,
  ACTIVITY_CARD_CACHE_STORAGE_KEY,
  activityCardAgeDays,
  createActivityCardCache,
} from '../activity-card-cache';
import { createFixedClock, type Clock } from '../clock';
import { createMemoryStorage } from '../onboarding-draft';

const DAY = 86_400_000;
/** 로컬 정오 — 시간대와 무관하게 달력 날짜가 안정적이다. */
const NOON = new Date(2026, 9, 15, 12, 0, 0).getTime();
const OTHER_CHILD = '99999999-9999-4999-8999-999999999999';

function setup(clock: Clock = createFixedClock(NOON)) {
  const storage = createMemoryStorage();
  const cache = createActivityCardCache({ clock, storage });
  return { storage, cache, clock };
}

/** `days` 일 전 날짜의 카드. */
function cardFrom(days: number) {
  return createActivityCardFixture(createFixedClock(NOON - days * DAY));
}

describe('activity-card-cache (D-11)', () => {
  it('키 · 버전 · 상한이 D-11 그대로다', () => {
    expect(ACTIVITY_CARD_CACHE_STORAGE_KEY).toBe('haru.activity-card.v1');
    expect(ACTIVITY_CARD_CACHE_SCHEMA_VERSION).toBe(1);
    expect(ACTIVITY_CARD_CACHE_MAX_AGE_DAYS).toBe(2);
  });

  it('쓰고 읽는다 — 저장 내용은 { schemaVersion, childId, card } 뿐이다', () => {
    const { storage, cache } = setup();
    const card = cardFrom(0);
    cache.write(MOCK_CHILD_ID, card);

    const raw = JSON.parse(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY) ?? 'null') as Record<
      string,
      unknown
    >;
    expect(Object.keys(raw).sort()).toStrictEqual(['card', 'childId', 'schemaVersion']);
    expect(storage.length).toBe(1);
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card, discarded: null });
  });

  it('1일 전 카드는 유지, 2일 전 카드는 폐기 (stale) 하고 지운다', () => {
    const { storage, cache } = setup();
    cache.write(MOCK_CHILD_ID, cardFrom(1));
    expect(cache.read(MOCK_CHILD_ID).card).not.toBeNull();

    cache.write(MOCK_CHILD_ID, cardFrom(ACTIVITY_CARD_CACHE_MAX_AGE_DAYS));
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card: null, discarded: 'stale' });
    expect(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
  });

  it('나이는 로컬 달력 날짜 차이다 (같은 날 = 0)', () => {
    const clock = createFixedClock(NOON);
    expect(activityCardAgeDays(cardFrom(0).date, clock)).toBe(0);
    expect(activityCardAgeDays(cardFrom(3).date, clock)).toBe(3);
  });

  it('schemaVersion 불일치 → unreadable + 삭제', () => {
    const { storage, cache } = setup();
    storage.setItem(
      ACTIVITY_CARD_CACHE_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 2, childId: MOCK_CHILD_ID, card: cardFrom(0) }),
    );
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card: null, discarded: 'unreadable' });
    expect(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
  });

  it.each([
    ['JSON 아님', '{not json'],
    [
      'card 가 contract 를 통과하지 못함',
      JSON.stringify({ schemaVersion: 1, childId: MOCK_CHILD_ID, card: { id: 'x' } }),
    ],
    ['childId 없음', JSON.stringify({ schemaVersion: 1, card: cardFrom(0) })],
    ['배열', '[]'],
  ])('parse 실패(%s) → unreadable + 삭제', (_name, raw) => {
    const { storage, cache } = setup();
    storage.setItem(ACTIVITY_CARD_CACHE_STORAGE_KEY, raw);
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card: null, discarded: 'unreadable' });
    expect(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
  });

  it('다른 아이의 캐시 → other-child + 삭제', () => {
    const { storage, cache } = setup();
    cache.write(OTHER_CHILD, cardFrom(0));
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card: null, discarded: 'other-child' });
    expect(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
  });

  it('clear (로그아웃) 가 지운다', () => {
    const { storage, cache } = setup();
    cache.write(MOCK_CHILD_ID, cardFrom(0));
    cache.clear();
    expect(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card: null, discarded: null });
  });

  it('쓰기에서도 parse 한다 — 잘못된 카드는 저장되지 않는다', () => {
    const { storage, cache } = setup();
    expect(() => {
      cache.write(MOCK_CHILD_ID, { ...cardFrom(0), date: 'yesterday' });
    }).toThrow();
    expect(storage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
  });

  it('저장소가 던져도 던지지 않는다 (사생활 보호 모드)', () => {
    const throwing = {
      ...createMemoryStorage(),
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    } as Storage;
    const cache = createActivityCardCache({ clock: createFixedClock(NOON), storage: throwing });
    expect(() => {
      cache.write(MOCK_CHILD_ID, cardFrom(0));
    }).not.toThrow();
    expect(cache.read(MOCK_CHILD_ID)).toStrictEqual({ card: null, discarded: null });
    expect(() => {
      cache.clear();
    }).not.toThrow();
  });
});
