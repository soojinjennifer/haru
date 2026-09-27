import { z } from 'zod';

import { CapabilitySchema } from '../enums/capability.js';
import { ChildSchema } from '../children/child.js';
import { PersonaSchema } from '../children/persona.js';
import { CapabilitySnapshotSchema } from '../children/snapshot.js';
import { CompleteOnboardingAnswersSchema } from './answers.js';
import { createChildInfoAnswersSchema } from './child-info.js';
import { InstrumentRefSchema } from './instrument.js';

/**
 * `POST /v1/onboarding/submit` — Idempotency-Key 필수.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, PRD FR-03 · FR-04 · FR-05 · FR-06 · FR-24.
 *
 * Trial 로컬 draft 도 **같은 요청 1회**로 전송한다 (C-12) — 동의 기록 전에는
 * 어떤 아동 데이터도 서버로 나가지 않는다 (AC-2-13).
 */
export const SubmitOnboardingRequestSchema = z.object({
  /**
   * 응답을 수집한 문항 집합 (결정 D-A 구조 제약 ④). 문항·선택지가 바뀐 뒤에도 과거 응답을
   * 해석할 수 있도록 버전을 함께 보낸다. **기존 응답과의 호환 처리는 Backend 책임**이다
   * (`P2-BIP-06`) — Frontend 는 담아 보내기만 한다.
   */
  instrument: InstrumentRefSchema,
  answers: CompleteOnboardingAnswersSchema,
});

export type SubmitOnboardingRequest = z.infer<typeof SubmitOnboardingRequestSchema>;

/** 나이 범위(3~9세)까지 검증하는 제출 schema. clock 주입 팩토리다 (D-10 · C-10). */
export function createSubmitOnboardingRequestSchema(now: Date) {
  return z.object({
    instrument: InstrumentRefSchema,
    answers: CompleteOnboardingAnswersSchema.extend({
      child_info: createChildInfoAnswersSchema(now),
    }),
  });
}

/**
 * `POST /v1/onboarding/submit` 응답 — 프로필 결과.
 *
 * - `snapshot.scores` 는 4대 역량 전부를 포함하며, 전부 결측인 역량은 `score: null` 이다 (D-2 ①).
 * - `persona` 는 AI 생성이 실패해도 fallback 문구로 항상 채워진다
 *   (`PROVIDER_UNAVAILABLE` 이어도 200 — `docs/API_CONTRACTS.md` §4 Stage 2).
 * - `suggestedCapability` 는 전 역량이 결측이면 `null` 이고, 발전 역량 화면에서 사용자가
 *   직접 고른다 (D-2 ④·⑤).
 */
export const ProfileResultSchema = z.object({
  child: ChildSchema,
  snapshot: CapabilitySnapshotSchema,
  persona: PersonaSchema,
  suggestedCapability: CapabilitySchema.nullable(),
});

export type ProfileResult = z.infer<typeof ProfileResultSchema>;
