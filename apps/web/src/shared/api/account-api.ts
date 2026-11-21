/**
 * `accountApi` — 탈퇴 (Stage 8 Rev 12 `C8-4` · `C8-9`, `docs/API_CONTRACTS.md` §4 Stage 8, `N8-02` ⓐ = 계정 + 전체 데이터 삭제).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `deleteAccount` | `DELETE /v1/me` | **필수** | `DELETION_ALREADY_REQUESTED` |
 *
 * 응답 = `DeletionRequest`(`scope='account'`). 성공 후 로컬 정리 · 세션 종료는 feature 가 한다 (Plan §5.2).
 * 보호자 이메일 표시는 기존 `meApi.get` 의 `caregiver.email` 을 읽는다 — 이 Client 에 조회 메서드는 없다 (`C8-10`).
 */
import type { DeleteAccountRequest, DeletionRequest } from '@haru/contracts';

import type { ApiMutationOptions } from './options';

export interface AccountApi {
  deleteAccount(
    request: { body: DeleteAccountRequest },
    options: ApiMutationOptions,
  ): Promise<DeletionRequest>;
}
