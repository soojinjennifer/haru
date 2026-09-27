/**
 * `HttpOnboardingApi` — 온보딩 endpoint 3종의 Http Adapter 골격 (Plan §16 D-7).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` (P2-BIP-03 · P2-BIP-06 · P2-BIP-11) 이다.
 * 여기에서 코드로 고정하는 규약은 세 가지다.
 *   ① 단계 저장은 `PUT /v1/onboarding/steps/:step` — `step` 이 **경로**에 들어간다
 *   ② 제출은 `Idempotency-Key` 필수 (Trial draft 도 같은 요청 1회로 간다 — C-12)
 *   ③ 요청·응답 모두 contracts schema 로 parse 한다
 */
import {
  OnboardingStateSchema,
  ProfileResultSchema,
  type SaveOnboardingStepRequest,
  type SubmitOnboardingRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { OnboardingApi } from '../onboarding-api';
import type { ApiMutationOptions } from '../options';

import type { HttpClient } from './httpClient';

export const ONBOARDING_PATH = '/onboarding';
export const ONBOARDING_SUBMIT_PATH = '/onboarding/submit';

export function onboardingStepPath(step: SaveOnboardingStepRequest['step']): string {
  return `/onboarding/steps/${step}`;
}

export function createHttpOnboardingApi(client: HttpClient): OnboardingApi {
  return {
    getState: (options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: ONBOARDING_PATH,
        schema: OnboardingStateSchema,
        signal: options.signal,
      }),

    saveStep: (request: SaveOnboardingStepRequest, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'PUT',
        path: onboardingStepPath(request.step),
        schema: OnboardingStateSchema,
        body: request,
        signal: options.signal,
      }),

    submit: (request: SubmitOnboardingRequest, options: ApiMutationOptions) =>
      client.request({
        method: 'POST',
        path: ONBOARDING_SUBMIT_PATH,
        schema: ProfileResultSchema,
        body: request,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),
  };
}
