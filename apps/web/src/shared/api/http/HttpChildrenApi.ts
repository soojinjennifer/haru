/**
 * `HttpChildrenApi` — 아이 프로필 · 수정 · 발전 역량 · 설문 재응답 endpoint 의 Http Adapter **골격**
 * (Stage 1 `D-7`, Stage 6 Plan §5.1 · §7).
 *
 * 실제 연동(소유권 · RLS · 스냅샷 갱신 규칙 · 버전 행 · 페르소나 재생성 · 동의 강제)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P6-BIP-01`·`02`·`07`·`08`·`09`·`10`·`12`).
 *
 * 여기에서 코드로 고정하는 규약: ① 경로·method ② `submitSurveyUpdate` 는 **`Idempotency-Key` 필수**
 * ③ 요청·응답 contracts parse (아이 정보 수정은 형식 schema — 나이 범위는 호출 feature 와 서버가 본다).
 */
import {
  ChildProfileSchema,
  ProfileResultSchema,
  SaveSurveyUpdateStepRequestSchema,
  SetGrowthCapabilityRequestSchema,
  SubmitSurveyUpdateRequestSchema,
  SurveyUpdateStateSchema,
  UpdateChildRequestSchema,
  type SaveSurveyUpdateStepRequest,
  type SetGrowthCapabilityRequest,
  type SubmitSurveyUpdateRequest,
  type SurveyUpdateStep,
  type UpdateChildRequest,
} from '@haru/contracts';

import type { ChildrenApi, SurveyUpdateSaveOptions } from '../children-api';
import type { ApiRequestOptions } from '../health-api';
import type { ApiMutationOptions } from '../options';

import type { HttpClient } from './httpClient';

export function childPath(childId: string): string {
  return `/children/${childId}`;
}

export function childProfilePath(childId: string): string {
  return `${childPath(childId)}/profile`;
}

export function childGrowthCapabilityPath(childId: string): string {
  return `${childPath(childId)}/growth-capability`;
}

export function surveyUpdatePath(childId: string): string {
  return `${childPath(childId)}/survey-update`;
}

export function surveyUpdateStepPath(childId: string, step: SurveyUpdateStep): string {
  return `${surveyUpdatePath(childId)}/steps/${step}`;
}

export function surveyUpdateSubmitPath(childId: string): string {
  return `${surveyUpdatePath(childId)}/submit`;
}

export function createHttpChildrenApi(client: HttpClient): ChildrenApi {
  return {
    getProfile: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: childProfilePath(request.childId),
        schema: ChildProfileSchema,
        signal: options.signal,
      }),

    update: (
      request: { childId: string; body: UpdateChildRequest },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'PATCH',
        path: childPath(request.childId),
        body: UpdateChildRequestSchema.parse(request.body),
        schema: ChildProfileSchema,
        signal: options.signal,
      }),

    setGrowthCapability: (
      request: { childId: string; body: SetGrowthCapabilityRequest },
      options: ApiRequestOptions = {},
    ) =>
      client.request({
        method: 'PUT',
        path: childGrowthCapabilityPath(request.childId),
        body: SetGrowthCapabilityRequestSchema.parse(request.body),
        schema: ChildProfileSchema,
        signal: options.signal,
      }),

    getSurveyUpdate: (request: { childId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: surveyUpdatePath(request.childId),
        schema: SurveyUpdateStateSchema,
        signal: options.signal,
      }),

    saveSurveyUpdateStep: (
      request: { childId: string; body: SaveSurveyUpdateStepRequest },
      options: SurveyUpdateSaveOptions = {},
    ) =>
      client.request({
        method: 'PUT',
        path: surveyUpdateStepPath(request.childId, request.body.step),
        body: SaveSurveyUpdateStepRequestSchema.parse(request.body),
        schema: SurveyUpdateStateSchema,
        signal: options.signal,
        // Rev 10.1 — `pagehide` best-effort 저장 (`D6-9` ②)
        ...(options.keepalive === true ? { keepalive: true } : {}),
      }),

    submitSurveyUpdate: (
      request: { childId: string; body: SubmitSurveyUpdateRequest },
      options: ApiMutationOptions,
    ) =>
      client.request({
        method: 'POST',
        path: surveyUpdateSubmitPath(request.childId),
        body: SubmitSurveyUpdateRequestSchema.parse(request.body),
        schema: ProfileResultSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),
  };
}
