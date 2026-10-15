/**
 * `activity-cards:offline-cached-card` 의 **기기 쪽 전제** — "최근 Activity Card 캐시가 있다"
 * (이월 `QA-3-002`, AC-4-82, Catalogue §5.4 *"`offline` + 최근 Activity Card 캐시 존재"*).
 *
 * API 쪽(`MockActivityApi`)은 `offline` 과 같이 `NetworkError` 를 낸다. 캐시는 서버가 아니라 **이 기기**의
 * 상태이므로 Mock Adapter 가 아니라 브라우저 조립 지점(`createBrowserMockApiClients`)이 seed 한다 —
 * `S4-E` 의 로컬 녹음 seed(`localStoreScenarios.ts`)와 같은 구조다.
 *
 * seed 는 **앱과 같은 저장 경로**(`shared/lib/activity-card-cache` 의 `write` — schema parse 포함)로 쓴다.
 * 저장 형식을 Mock 이 따로 흉내 내지 않는다.
 *
 * 카드 날짜는 **기기 시계의 오늘**이다(주입 `deviceClock`). Mock 서버 시계(`MOCK_EPOCH_MS`)를 쓰면 캐시가
 * 폐기 규칙("2일 이상 과거", `D-11`)에 걸려 버려지므로 "최근 카드" 라는 전제가 성립하지 않는다.
 * Mock 소스는 시계를 직접 읽지 않는다 — 조립 지점이 넘긴다.
 */
import {
  createActivityCardCache,
  type ActivityCardCache,
} from '../../shared/lib/activity-card-cache';
import type { Clock } from '../../shared/lib/clock';
import { createActivityCardFixture } from '../fixtures/activity-cards';
import { MOCK_CHILD_ID } from '../fixtures/me';
import type { ScenarioStore } from '../scenarios';

import { activityScenarioGroup } from './MockActivityApi';

export interface ActivityCardCacheSeedOptions {
  store: ScenarioStore;
  /** 기기 시계 — 캐시 카드의 날짜와 폐기 판정 기준. */
  deviceClock: Clock;
  /** 기본은 브라우저 `localStorage` 의 앱 캐시. 테스트는 메모리 저장소 캐시를 넣는다. */
  cache?: ActivityCardCache;
}

/** scenario 가 `offline-cached-card` 이면 캐시를 넣고 `true`. 아니면 아무것도 하지 않는다. */
export function applyActivityCardCacheSeed(options: ActivityCardCacheSeedOptions): boolean {
  if (options.store.resolve(activityScenarioGroup) !== 'offline-cached-card') return false;

  const cache = options.cache ?? createActivityCardCache({ clock: options.deviceClock });
  cache.write(MOCK_CHILD_ID, createActivityCardFixture(options.deviceClock, 'books'));
  return true;
}
