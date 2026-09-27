import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { OnboardingStepSchema } from '../enums/onboarding-step.js';
import { OnboardingDraftAnswersSchema } from './answers.js';
import { InstrumentRefSchema } from './instrument.js';

/**
 * 기기 **로컬 전용** 온보딩 draft — HTTP 요청·응답이 아니다.
 * 근거: `docs/API_CONTRACTS.md` §3.4, `docs/ARCHITECTURE.md` §7.4,
 * `docs/decisions/stage-2-approvals.md` §4 **D-3**, C-12.
 *
 * Trial(가입 전) 구간과 동의 기록 전 구간의 응답은 **서버로 보내지 않고** 여기에만 둔다.
 * 가입 → 동의 → (VPC 슬롯) 이후 `SubmitOnboardingRequest` 로 변환해 1회 제출한다.
 *
 * 읽기·쓰기 양쪽에서 이 schema 로 parse 한다. parse 실패(손상)면 폐기한다.
 */

/** draft 구조 버전. 값이 다르면 폐기한다 (D-3 삭제 시점 ③). */
export const ONBOARDING_DRAFT_SCHEMA_VERSION = 1;

/** 로컬 보관 상한 (일) — `updatedAt` 기준. 경과하면 폐기한다 (D-3 삭제 시점 ⑤). */
export const ONBOARDING_DRAFT_MAX_AGE_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const OnboardingDraftSchema = z.object({
  schemaVersion: z.literal(ONBOARDING_DRAFT_SCHEMA_VERSION),
  /**
   * 이 draft 가 **어떤 문항 집합으로** 수집되었는지 (결정 D-A 구조 제약 ④).
   * 제출 시 그대로 `SubmitOnboardingRequest.instrument` 로 전달된다.
   */
  instrument: InstrumentRefSchema,
  currentStep: OnboardingStepSchema,
  answers: OnboardingDraftAnswersSchema,
  updatedAt: IsoDateTimeSchema,
});

export type OnboardingDraft = z.infer<typeof OnboardingDraftSchema>;

/**
 * 보관 상한이 지난 draft 인지 판정한다 — 부수효과 없는 순수 함수다.
 *
 * 기준 시각은 인자로 받는다 (`Date.now()` 직접 호출 금지 — D-10 과 같은 이유).
 * `updatedAt` 을 해석할 수 없으면 만료로 본다 (손상된 draft 를 남기지 않는다).
 */
export function isOnboardingDraftExpired(updatedAt: string, now: Date): boolean {
  const updatedAtMs = Date.parse(updatedAt);
  if (Number.isNaN(updatedAtMs)) return true;

  return now.getTime() - updatedAtMs > ONBOARDING_DRAFT_MAX_AGE_DAYS * MS_PER_DAY;
}
