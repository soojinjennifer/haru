/**
 * `onboardingApi` — 온보딩 5단계 (`docs/API_CONTRACTS.md` §4 Stage 2, Plan §7.2).
 *
 * 호출 경로: `OnboardingWizard → useOnboardingState / useSaveOnboardingStep / useSubmitOnboarding
 * → onboardingApi → MockOnboardingApi | HttpOnboardingApi`.
 *
 * | 호출 | endpoint | 인증 | IK | 오류 |
 * |---|---|---|---|---|
 * | `getState` | `GET /v1/onboarding` | 필요 | — | `CONSENT_REQUIRED` |
 * | `saveStep` | `PUT /v1/onboarding/steps/:step` | 필요 | — | `CONSENT_REQUIRED` · `VALIDATION_FAILED` |
 * | `submit` | `POST /v1/onboarding/submit` | 필요 | **필수** | `CONSENT_REQUIRED` · `ONBOARDING_INCOMPLETE` · `CHILD_LIMIT_REACHED` |
 *
 * **Trial(가입 전) 구간은 이 interface 를 호출하지 않는다** (C-12 · AC-2-27). 응답은 기기 로컬
 * draft 에만 쌓이고, 가입 → 동의 이후 `submit` **1회**로 전송된다. 그래서 문항 정의도 Trial
 * 에서는 서버가 아니라 기본 instrument 에서 온다 (`features/onboarding-survey/model`).
 *
 * `getState` 가 돌려주는 `OnboardingState.instrument` 가 **문항의 출처**다 (결정 D-A ③).
 * 화면은 문항 목록·순서·개수를 하드코딩하지 않는다.
 */
import type {
  OnboardingState,
  ProfileResult,
  SaveOnboardingStepRequest,
  SubmitOnboardingRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface OnboardingApi {
  getState(options?: ApiRequestOptions): Promise<OnboardingState>;
  saveStep(
    request: SaveOnboardingStepRequest,
    options?: ApiRequestOptions,
  ): Promise<OnboardingState>;
  submit(request: SubmitOnboardingRequest, options: ApiMutationOptions): Promise<ProfileResult>;
}
