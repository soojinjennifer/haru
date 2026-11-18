/**
 * `childrenApi` — 아이 프로필 · 아이 정보 수정 · 발전 역량 · 설문 재응답
 * (`docs/API_CONTRACTS.md` §4 Stage 2 표 · Stage 6 절, Stage 6 Plan §7 C-1 · C-4~C-7).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `getProfile` | `GET /v1/children/:childId/profile` | — | `CHILD_NOT_FOUND` |
 * | `update` | `PATCH /v1/children/:childId` | — | `VALIDATION_FAILED`(`details.fields`) · `CHILD_NOT_FOUND` |
 * | `setGrowthCapability` | `PUT /v1/children/:childId/growth-capability` | — (PUT = 상태 설정, 멱등) | `VALIDATION_FAILED` · `CHILD_NOT_FOUND` |
 * | `getSurveyUpdate` | `GET /v1/children/:childId/survey-update` | — | `CONSENT_REQUIRED` · `CHILD_NOT_FOUND` |
 * | `saveSurveyUpdateStep` | `PUT /v1/children/:childId/survey-update/steps/:step` | — | `VALIDATION_FAILED` · `CONSENT_REQUIRED` |
 * | `submitSurveyUpdate` | `POST /v1/children/:childId/survey-update/submit` | **필수** | `VALIDATION_FAILED` · `ONBOARDING_INCOMPLETE` · `IDEMPOTENCY_KEY_REUSED` · `CONSENT_REQUIRED` |
 *
 * 호출 경로: `Component → entities/child-profile hook → childrenApi → MockChildrenApi | HttpChildrenApi`.
 *
 * ⛔ 히스토리 목록(`GET …/capability-snapshots` · `GET …/personas`)은 **메서드를 두지 않는다** —
 * schema 만 있고 호출자는 Stage 7 이다 (`N6-12`).
 */
import type {
  ChildProfile,
  ProfileResult,
  SaveSurveyUpdateStepRequest,
  SetGrowthCapabilityRequest,
  SubmitSurveyUpdateRequest,
  SurveyUpdateState,
  UpdateChildRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

/**
 * 재응답 단계 저장 옵션 — Rev 10.1 (`D6-9` ②). `keepalive` = 탭 닫기·새로고침(`pagehide`) 중 보내는
 * **best-effort** 저장. Http adapter 는 `fetch(..., { keepalive: true })` 로 보내고, Mock 은 무시한다(동기 메모리).
 * 전달 실패 시 그 단계의 저장 안 된 편집 유실은 **수용**한다 — 위치(`currentStep`)는 단계 이동 PUT 이 이미 보존했다.
 */
export interface SurveyUpdateSaveOptions extends ApiRequestOptions {
  keepalive?: boolean;
}

export interface ChildrenApi {
  getProfile(request: { childId: string }, options?: ApiRequestOptions): Promise<ChildProfile>;

  /** PATCH — **바뀐 필드만** 보낸다 (AC-6-19). 응답 = 갱신된 프로필. */
  update(
    request: { childId: string; body: UpdateChildRequest },
    options?: ApiRequestOptions,
  ): Promise<ChildProfile>;

  setGrowthCapability(
    request: { childId: string; body: SetGrowthCapabilityRequest },
    options?: ApiRequestOptions,
  ): Promise<ChildProfile>;

  /** 진행 중 draft 가 없으면 **최근 제출 응답으로 프리필**된 상태를 돌려준다. */
  getSurveyUpdate(
    request: { childId: string },
    options?: ApiRequestOptions,
  ): Promise<SurveyUpdateState>;

  /**
   * 단계 이동 시 1회 (`D-11` 규칙 재사용) — `body.currentStep` = 도착 단계. 카드 화면 이탈 시 미저장 편집이 있으면
   * 1회(`currentStep` 생략) · `pagehide` 는 `keepalive` (Rev 10.1). 서버 draft 가 정본이다 (`N6-07`).
   */
  saveSurveyUpdateStep(
    request: { childId: string; body: SaveSurveyUpdateStepRequest },
    options?: SurveyUpdateSaveOptions,
  ): Promise<SurveyUpdateState>;

  /** `Idempotency-Key` **필수** — 같은 제출의 재시도는 같은 키. 응답 `snapshot.source = 'survey_update'`. */
  submitSurveyUpdate(
    request: { childId: string; body: SubmitSurveyUpdateRequest },
    options: ApiMutationOptions,
  ): Promise<ProfileResult>;
}
