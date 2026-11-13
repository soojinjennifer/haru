import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { ReflectionCheckKeySchema } from '../enums/reflection-check.js';

/**
 * 세션 회고 (Figma `91:691` Feedback Card, PRD FR-12 · §7.6) — `docs/API_CONTRACTS.md` §3.10 (Rev 9).
 * 결정: `D5-4` (Stage 5 Plan §7 C-2 · C-3 · C-6, `N5-01` · `N5-02` · `N5-05` · `N5-06` · `N5-16`).
 *
 * `POST /v1/sessions/:sessionId/reflection` (IK)
 *
 * - 입력은 **별점 · 체크 칩 · 메모 한 칸**뿐이다 (`PF5-1`·`PF5-2` — Figma 한 카드 · 한 입력).
 *   ⛔ `revisitTopics[]` · `freeNote` · `skipped` 를 두지 않는다. 건너뛰기 = 요청 없음 (`N5-06` ⓐ).
 * - 세 필드 모두 비어 있는 요청은 **거부**한다 — 빈 회고는 보내지 않는다 (`N5-05` ⓐ).
 * - 허용 세션 상태 = 완료 계열(`completed` · `analyzing` · `analyzed` · `failed`), 두 mode 모두.
 *   그 밖은 `SESSION_INVALID_TRANSITION` (서버 강제 — `P5-BIP-02`).
 * - 세션당 1건. 이미 있으면 `REFLECTION_ALREADY_SUBMITTED`. 같은 key + 같은 body 는 최초 응답 재생,
 *   같은 key + 다른 body 는 `IDEMPOTENCY_KEY_REUSED` (`P5-BIP-01`).
 * - `note` 는 아동 관련 자유 텍스트다 — 클라이언트는 디스크에 저장하지 않고(`N5-17`), 서버는 AI 전송 전
 *   PII redaction · 로그 원문 금지 (`P5-BIP-05`).
 */

/** `note` 상한 — 문자 수(UTF-16 code unit, `String.length`), **trim 이후** 기준 (`N5-16`). */
export const REFLECTION_NOTE_MAX_LENGTH = 500;

/** 별점 범위 (Figma `91:693` 별 5개). */
export const REFLECTION_RATING_MIN = 1;
export const REFLECTION_RATING_MAX = 5;

export const ReflectionRatingSchema = z.int().min(REFLECTION_RATING_MIN).max(REFLECTION_RATING_MAX);

export type ReflectionRating = z.infer<typeof ReflectionRatingSchema>;

/** 선택된 칩 키 배열 — 중복 금지, 순서는 의미 없음 (`N5-01` ⓐ). */
export const ReflectionChecksSchema = z
  .array(ReflectionCheckKeySchema)
  .refine((checks) => new Set(checks).size === checks.length, {
    message: 'checks must not contain duplicates.',
  });

/**
 * 메모 한 칸 — 앞뒤 공백을 지운 뒤 1자 이상 · 500자 이하. 비었으면 `null` 을 보낸다
 * (공백만 있는 문자열은 거부 — 클라이언트가 `null` 로 정규화한다).
 */
export const ReflectionNoteSchema = z.string().trim().min(1).max(REFLECTION_NOTE_MAX_LENGTH);

interface ReflectionFields {
  rating: number | null;
  checks: readonly string[];
  note: string | null;
}

/** 별 · 칩 · 메모 중 하나 이상 있는지 (`N5-05` ⓐ — `Save` 활성 조건과 같은 규칙). */
export function hasReflectionContent(value: ReflectionFields): boolean {
  return value.rating !== null || value.checks.length > 0 || value.note !== null;
}

const EMPTY_REFLECTION_ISSUE = {
  message: 'A reflection needs a rating, a check, or a note.',
} as const;

export const SubmitReflectionRequestSchema = z
  .object({
    rating: ReflectionRatingSchema.nullable(),
    checks: ReflectionChecksSchema,
    note: ReflectionNoteSchema.nullable(),
  })
  .refine(hasReflectionContent, EMPTY_REFLECTION_ISSUE);

export type SubmitReflectionRequest = z.infer<typeof SubmitReflectionRequestSchema>;

/**
 * 저장된 회고 — 제출 응답이자 `SessionDetail.reflection` (재진입 읽기 전용 표시, `N5-08` ⓐ).
 * 수정 API 는 없다 (`N5-08` — ⓒ 수정 허용 미채택).
 */
export const ReflectionSchema = z
  .object({
    id: IdSchema,
    sessionId: IdSchema,
    rating: ReflectionRatingSchema.nullable(),
    checks: ReflectionChecksSchema,
    note: ReflectionNoteSchema.nullable(),
    submittedAt: IsoDateTimeSchema,
  })
  .refine(hasReflectionContent, EMPTY_REFLECTION_ISSUE);

export type Reflection = z.infer<typeof ReflectionSchema>;
