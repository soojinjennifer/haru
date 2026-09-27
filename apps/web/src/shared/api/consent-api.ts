/**
 * `consentApi` — 보호자 동의 (`docs/API_CONTRACTS.md` §4 Stage 2, Plan §7.2).
 *
 * 호출 경로: `GuardianConsentForm → useConsentDocuments / useRecordConsents → consentApi
 * → MockConsentApi | HttpConsentApi`. Component 는 Adapter 를 직접 호출하지 않는다.
 *
 * | 호출 | endpoint | 인증 | IK | 오류 |
 * |---|---|---|---|---|
 * | `getCurrentDocuments` | `GET /v1/consent-documents/current` | **공개** | — | `INTERNAL_ERROR` |
 * | `record` | `POST /v1/consents` | 필요 | **필수** | `CONSENT_VERSION_OUTDATED` · `VALIDATION_FAILED` · `IDEMPOTENCY_KEY_REUSED` |
 *
 * 화면은 항목 수·순서·라벨·**필수 여부를 하드코딩하지 않는다** — 전부
 * `ConsentDocument` 응답 값이다 (AC-2-10, C-1).
 *
 * 동의 **철회**(`revoked`)와 **이력 조회**(`GET /v1/consents`)는 이 interface 에 없다.
 * 철회는 MVP 제외(C-4), 이력 보기는 Stage 8 선택 기능이다(C-19).
 */
import type {
  ConsentStatus,
  CurrentConsentDocuments,
  RecordConsentsRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface ConsentApi {
  getCurrentDocuments(options?: ApiRequestOptions): Promise<CurrentConsentDocuments>;
  record(request: RecordConsentsRequest, options: ApiMutationOptions): Promise<ConsentStatus>;
}
