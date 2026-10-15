/**
 * `activity-cards:offline-cached-card` — API 는 오프라인, 기기에는 최근 카드 캐시 (이월 `QA-3-002`, AC-4-82).
 */
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { createActivityCardCache } from '../../shared/lib/activity-card-cache';
import { createFixedClock, toCalendarDate } from '../../shared/lib/clock';
import { createMemoryStorage } from '../../shared/lib/onboarding-draft';
import { applyActivityCardCacheSeed } from '../activities/activityCardCacheSeed';
import { ACTIVITY_SCENARIO_KEYS } from '../activities/MockActivityApi';
import { MOCK_ACTIVITY_CARD_ID } from '../fixtures/activity-cards';
import { MOCK_CHILD_ID } from '../fixtures/me';

import { bundle } from './stage4-support';

/** 기기 시계 — Mock 서버 시계(2026-01-01)와 **다른 날**로 둔다. */
const DEVICE_NOW = new Date(2026, 9, 15, 9, 0, 0).getTime();

async function failsOffline(promise: Promise<unknown>): Promise<boolean> {
  try {
    await promise;
    return false;
  } catch (error) {
    return isNetworkError(error);
  }
}

describe('activity-cards:offline-cached-card', () => {
  it('Catalogue key 로 등록돼 있다', () => {
    expect(ACTIVITY_SCENARIO_KEYS).toContain('offline-cached-card');
  });

  it('API — 조회와 선택이 모두 NetworkError (offline 과 같다)', async () => {
    const { clients } = bundle('activity-cards:offline-cached-card');
    expect(await failsOffline(clients.activities.getTodayCard({ childId: MOCK_CHILD_ID }))).toBe(
      true,
    );
    expect(
      await failsOffline(
        clients.activities.selectOption({
          cardId: MOCK_ACTIVITY_CARD_ID,
          selection: {
            optionId: '88888888-8888-4888-8888-000000000001',
            readingContext: 'bedtime',
          },
        }),
      ),
    ).toBe(true);
  });

  it('seed — 기기 시계의 오늘 날짜 카드를 앱과 같은 저장 경로로 넣는다', () => {
    const deviceClock = createFixedClock(DEVICE_NOW);
    const cache = createActivityCardCache({ clock: deviceClock, storage: createMemoryStorage() });
    const { store } = bundle('activity-cards:offline-cached-card');

    expect(applyActivityCardCacheSeed({ store, deviceClock, cache })).toBe(true);

    const read = cache.read(MOCK_CHILD_ID);
    expect(read.discarded).toBeNull();
    expect(read.card?.id).toBe(MOCK_ACTIVITY_CARD_ID);
    expect(read.card?.date).toBe(toCalendarDate(DEVICE_NOW));
    expect(read.card?.options).toHaveLength(3);
  });

  it('seed — 다른 key 에서는 아무것도 하지 않는다', () => {
    const deviceClock = createFixedClock(DEVICE_NOW);
    const storage = createMemoryStorage();
    const cache = createActivityCardCache({ clock: deviceClock, storage });

    for (const scenario of ['', 'activity-cards:offline', 'activity-cards:success']) {
      expect(
        applyActivityCardCacheSeed({ store: bundle(scenario).store, deviceClock, cache }),
      ).toBe(false);
    }
    expect(storage.length).toBe(0);
  });
});
