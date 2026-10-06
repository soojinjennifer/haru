/**
 * `activityApi` — Activity Card 조회·선택 (`docs/API_CONTRACTS.md` §4 Stage 3, FR-07 · FR-08).
 *
 * | 호출 | endpoint |
 * |---|---|
 * | `getTodayCard` | `GET /v1/children/:childId/activity-cards/today` |
 * | `selectOption` | `POST /v1/activity-cards/:cardId/selection` |
 *
 * - 둘 다 인증 필요. 선택은 **`Idempotency-Key` 대상이 아니다** (§7.2 IK 열 `—`).
 * - 오류: `ONBOARDING_INCOMPLETE` · `RESOURCE_NOT_FOUND` · `VALIDATION_FAILED`
 * - **`POST /v1/sessions` 는 이 interface 에 없다** — 세션 시작은 Stage 4 다 (`D-3`).
 */
import type {
  ActivityCard,
  ActivityCardSelection,
  SelectActivityOptionRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface ActivityApi {
  getTodayCard(request: { childId: string }, options?: ApiRequestOptions): Promise<ActivityCard>;
  selectOption(
    request: { cardId: string; selection: SelectActivityOptionRequest },
    options?: ApiRequestOptions,
  ): Promise<ActivityCardSelection>;
}
