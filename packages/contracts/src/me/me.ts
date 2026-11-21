import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { ConsentStatusSchema } from '../consent/record.js';
import { CaregiverRelationshipSchema } from '../enums/caregiver.js';
import { OnboardingStatusSchema } from '../enums/onboarding-status.js';
import { ParentVerificationStatusSchema } from '../enums/parent-verification.js';
import { PlanSchema } from '../enums/plan.js';
import { CHILD_NAME_MAX_LENGTH } from '../onboarding/child-info.js';

/**
 * `GET /v1/me` · `PATCH /v1/me` 응답 — 현재 보호자 계정의 상태 묶음.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/plans/stage-2-plan.md` §7.1.
 *
 * Route Guard 판정(`resolveGuardDecision` — D-5)이 이 응답 하나로 결정된다:
 * 인증 → 동의(`consentStatus.missing`) → VPC(`parentVerification.status`) →
 * 온보딩(`onboardingStatus`) 순서 (`docs/ARCHITECTURE.md` §2.4).
 *
 * "프로필 결과 확인 여부" 필드는 **의도적으로 없다** (D-6) — Guard 가 판정하지 않고
 * 제출 직후 연속 네비게이션으로 처리한다.
 */

/** 보호자 프로필 — `docs/DATA_MODEL.md` §5 `caregiver_profiles`. */
export const CaregiverSchema = z.object({
  id: IdSchema,
  /** 가입 시 입력한 `caregiverName`. */
  displayName: z.string().min(1).max(60),
  /** 온보딩 Step 1 에서 수집해 `PATCH /v1/me` 로 전송한다 (D-16). 미설정이면 없다. */
  relationship: CaregiverRelationshipSchema.optional(),
  /**
   * IANA 타임존 (예: `America/Los_Angeles`).
   * 클라이언트 `Intl.DateTimeFormat().resolvedOptions().timeZone` 감지값이다 (D-16).
   * contracts 는 목록을 갖지 않는다 — `zod` 외 런타임 의존을 늘리지 않기 위해 형식만 검사한다.
   */
  timezone: z.string().min(1),
  /**
   * 인증 계정의 로그인 이메일 — **읽기 전용** (Stage 8 Rev 12 `C8-10`, `Q8-10` ⓐ · `D8-1`).
   *
   * - 계정은 언제나 로그인 식별자를 가진다(Email · Google · Apple — C-5). Apple 비공개 릴레이면 그 주소 그대로다.
   * - `PATCH /v1/me` 요청(`UpdateCaregiverRequestSchema`)에는 **없다** — 이 값은 바꿀 수 없다.
   * - 계정 화면 표시에만 쓴다. 콘솔 · 에러 리포트 · 요청 로그 · Toast 에 남기지 않는다 (Plan §5.5, `P8-BIP-09`).
   */
  email: z.email(),
});

export type Caregiver = z.infer<typeof CaregiverSchema>;

/** VPC(보호자 신원 확인) 단계 슬롯 — 방식은 법무 L-01 결정 대기다 (C-3). */
export const ParentVerificationSchema = z.object({
  status: ParentVerificationStatusSchema,
});

export type ParentVerification = z.infer<typeof ParentVerificationSchema>;

/**
 * 아이 최소 참조 — 이름은 **first name 만** 노출한다 (C-6).
 * 전체 프로필은 `GET /v1/children/:childId/profile` 이다.
 */
export const MeChildRefSchema = z.object({
  id: IdSchema,
  firstName: z.string().min(1).max(CHILD_NAME_MAX_LENGTH),
});

export type MeChildRef = z.infer<typeof MeChildRefSchema>;

export const MeResponseSchema = z.object({
  caregiver: CaregiverSchema,
  consentStatus: ConsentStatusSchema,
  parentVerification: ParentVerificationSchema,
  onboardingStatus: OnboardingStatusSchema,
  /** 온보딩 제출 전에는 없다. MVP 는 1명이다 (`CHILD_LIMIT_REACHED`). */
  child: MeChildRefSchema.optional(),
  /** 가입 완료 시 `free` 가 자동 부여된다 (PRD §7.1). */
  plan: PlanSchema,
});

export type MeResponse = z.infer<typeof MeResponseSchema>;
