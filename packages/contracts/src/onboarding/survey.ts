import { z } from 'zod';

import { CapabilitySchema } from '../enums/capability.js';
import { SurveyAnswerValueSchema } from '../enums/survey.js';

/**
 * 온보딩 Step 5 — 4대 역량 문항 (Baseline v1).
 * 근거: `docs/API_CONTRACTS.md` §3.4, PRD §7.2 Step 5,
 * `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md`.
 *
 * **CONFIRMED (사용자 결정 2026-09-14, C-8 · D-04)** — 척도 6단계, 문항 10개.
 * 필드명은 RECOMMENDED.
 *
 * **문항 문구를 Frontend 에 하드코딩하지 않는다.** `SurveyInstrument` 응답으로 내려온
 * `stem` · `items[].prompt` · `scaleLabels[].label` 만 표시한다 (rules/frontend §8).
 */

/** instrument 식별자 — MVP 는 1종이다. */
export const BASELINE_INSTRUMENT_CODE = 'baseline_v1';

/** 문항 수 — ER1·ER2 · AG1~AG3 · CF1·CF2 · IM1~IM3 (C-8). */
export const SURVEY_ITEM_COUNT = 10;

/** 척도 라벨 수 — 1~5 빈도 + 비채점(`not_observed`) = 6 (C-8). */
export const SURVEY_SCALE_LABEL_COUNT = 6;

/** 문항 코드 형식 — 역량 약어(ER · AG · CF · IM) + 일련번호. */
export const SURVEY_ITEM_CODE_PATTERN = /^(ER|AG|CF|IM)\d$/;

export const SurveyItemCodeSchema = z.string().regex(SURVEY_ITEM_CODE_PATTERN);

export type SurveyItemCode = z.infer<typeof SurveyItemCodeSchema>;

export const SurveyItemSchema = z.object({
  itemCode: SurveyItemCodeSchema,
  capability: CapabilitySchema,
  order: z.int(),
  /** 문항 문구. 서버(Mock 포함)가 제공한다 — 하드코딩 금지. */
  prompt: z.string().min(1),
});

export type SurveyItem = z.infer<typeof SurveyItemSchema>;

/** 척도 라벨 1개 — 값과 표시 문구의 쌍. 6번째가 비채점(`not_observed`) 항목이다. */
export const SurveyScaleLabelSchema = z.object({
  value: SurveyAnswerValueSchema,
  label: z.string().min(1),
});

export type SurveyScaleLabel = z.infer<typeof SurveyScaleLabelSchema>;

export const SurveyInstrumentSchema = z.object({
  code: z.literal(BASELINE_INSTRUMENT_CODE),
  version: z.string().min(1),
  /** 공통 도입 문장 (예: "In the past two weeks…"). */
  stem: z.string().min(1),
  scaleLabels: z.array(SurveyScaleLabelSchema).length(SURVEY_SCALE_LABEL_COUNT),
  items: z.array(SurveyItemSchema).length(SURVEY_ITEM_COUNT),
});

export type SurveyInstrument = z.infer<typeof SurveyInstrumentSchema>;

/**
 * Baseline v1 문항 **구조** — 코드 · 역량 · 순서만 담는다 (문구 없음).
 * 근거: `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md` (ER 2 · AG 3 · CF 2 · IM 3).
 *
 * 문항 **문구**는 서버(Mock 포함)가 `SurveyInstrument.items[].prompt` 로 내려준다 (AC-2-24).
 * 이 표는 그 instrument 를 조립할 때 쓰는 구조 출처이며, 문구 소유권은 바뀌지 않는다.
 */
export const BASELINE_ITEM_BLUEPRINT = [
  { itemCode: 'ER1', capability: 'emotion_regulation', order: 1 },
  { itemCode: 'ER2', capability: 'emotion_regulation', order: 2 },
  { itemCode: 'AG1', capability: 'self_directed_agency', order: 3 },
  { itemCode: 'AG2', capability: 'self_directed_agency', order: 4 },
  { itemCode: 'AG3', capability: 'self_directed_agency', order: 5 },
  { itemCode: 'CF1', capability: 'cognitive_flexibility', order: 6 },
  { itemCode: 'CF2', capability: 'cognitive_flexibility', order: 7 },
  { itemCode: 'IM1', capability: 'intrinsic_motivation', order: 8 },
  { itemCode: 'IM2', capability: 'intrinsic_motivation', order: 9 },
  { itemCode: 'IM3', capability: 'intrinsic_motivation', order: 10 },
] as const satisfies readonly {
  itemCode: string;
  capability: z.infer<typeof CapabilitySchema>;
  order: number;
}[];

/** Baseline v1 문항 코드 목록 (순서 = 표시 순서). */
export const BASELINE_ITEM_CODES = BASELINE_ITEM_BLUEPRINT.map((item) => item.itemCode);

export type BaselineItemCode = (typeof BASELINE_ITEM_BLUEPRINT)[number]['itemCode'];

export const CapabilityItemAnswerSchema = z.object({
  itemCode: SurveyItemCodeSchema,
  value: SurveyAnswerValueSchema,
});

export type CapabilityItemAnswer = z.infer<typeof CapabilityItemAnswerSchema>;

/**
 * Step 5 응답 — **중도 저장(draft) 형태**다. 일부만 응답해도 통과한다.
 * 제출 시점에는 `CompleteCapabilityItemsAnswersSchema` 로 10개 전부를 요구한다.
 */
export const CapabilityItemsAnswersSchema = z.object({
  instrumentCode: z.literal(BASELINE_INSTRUMENT_CODE),
  answers: z.array(CapabilityItemAnswerSchema).max(SURVEY_ITEM_COUNT),
});

export type CapabilityItemsAnswers = z.infer<typeof CapabilityItemsAnswersSchema>;

/**
 * 제출용 Step 5 응답 — 10문항 **전부**가 있어야 한다.
 * `not_observed` 도 유효한 응답이다 (결측이지 낮은 점수가 아니다 — C-8).
 * 부족하면 서버는 `ONBOARDING_INCOMPLETE` 로 거부한다.
 */
export const CompleteCapabilityItemsAnswersSchema = CapabilityItemsAnswersSchema.extend({
  answers: z.array(CapabilityItemAnswerSchema).length(SURVEY_ITEM_COUNT),
});

export type CompleteCapabilityItemsAnswers = z.infer<typeof CompleteCapabilityItemsAnswersSchema>;
