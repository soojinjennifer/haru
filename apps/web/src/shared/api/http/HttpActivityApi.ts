/**
 * `HttpActivityApi` — Activity Card 조회·선택의 Http Adapter 골격 (Stage 1 `D-7`).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다
 * (`P3-BIP-01` 카드 생성 잡 · `P3-BIP-02` 추천 로직 · `P3-BIP-03` Prompt 라이브러리).
 */
import {
  ActivityCardSchema,
  ActivityCardSelectionSchema,
  SelectActivityOptionRequestSchema,
  type SelectActivityOptionRequest,
} from '@haru/contracts';

import type { ActivityApi } from '../activity-api';
import type { ApiRequestOptions } from '../health-api';

import type { HttpClient } from './httpClient';

export function todayActivityCardPath(childId: string): string {
  return `/children/${encodeURIComponent(childId)}/activity-cards/today`;
}

export function activityCardSelectionPath(cardId: string): string {
  return `/activity-cards/${encodeURIComponent(cardId)}/selection`;
}

export function createHttpActivityApi(client: HttpClient): ActivityApi {
  return {
    getTodayCard: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: todayActivityCardPath(request.childId),
        schema: ActivityCardSchema,
        signal: options.signal,
      }),

    selectOption: (
      request: { cardId: string; selection: SelectActivityOptionRequest },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'POST',
        path: activityCardSelectionPath(request.cardId),
        body: SelectActivityOptionRequestSchema.parse(request.selection),
        schema: ActivityCardSelectionSchema,
        signal: options.signal,
      }),
  };
}
