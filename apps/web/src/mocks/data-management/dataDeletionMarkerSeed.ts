/**
 * `data-management:deletion-completed-offscreen` 의 **기기 쪽 전제** — "이 기기에 전체 삭제 요청 id 가 표시돼 있다"
 * (Stage 8 `N8-31` ⓐ, Plan rev 2.2 §8 "표시는 서버 key 가 아니라 로컬 주입").
 *
 * 표시는 서버가 아니라 **이 기기**의 상태이므로 Mock Adapter 가 아니라 브라우저 조립 지점(`createBrowserMockApiClients`)이
 * seed 한다 — `offline-cached-card` 의 카드 캐시 seed(`activityCardCacheSeed.ts`)와 같은 구조다. 감시자가 첫 렌더에서 읽도록
 * **동기**로 쓴다.
 *
 * seed 는 **앱과 같은 저장 경로**(`shared/lib/data-deletion-marker` 의 `save` — 형식 검증 포함)로 쓴다. 요청 id 는 Mock 서버가
 * 이미 `completed` 로 가진 seed 요청 id 다 (`deletionState.ts` `ensureDeletionSeed`). 가상 값 — PII 0.
 */
import type { Clock } from '../../shared/lib/clock';
import {
  dataDeletionMarkerStore,
  type DataDeletionMarkerStore,
} from '../../shared/lib/data-deletion-marker';
import type { ScenarioStore } from '../scenarios';

import { offscreenCompletedRequestId } from './deletionState';

export interface DataDeletionMarkerSeedOptions {
  store: ScenarioStore;
  /** 기기 시계 — 표시 시각. */
  deviceClock: Clock;
  /** 기본은 앱 공용 표시 저장소(`localStorage`). 테스트는 메모리 저장소를 넣는다. */
  markerStore?: DataDeletionMarkerStore;
}

/** scenario 가 `deletion-completed-offscreen` 이면 표시를 넣고 `true`. 아니면 아무것도 하지 않는다. */
export function applyDataDeletionMarkerSeed(options: DataDeletionMarkerSeedOptions): boolean {
  const requestId = offscreenCompletedRequestId(options.store);
  if (requestId === null) return false;
  (options.markerStore ?? dataDeletionMarkerStore).save(requestId, options.deviceClock);
  return true;
}
