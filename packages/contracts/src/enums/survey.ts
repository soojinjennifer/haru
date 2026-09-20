import { z } from 'zod';

/**
 * 온보딩 역량 문항 응답 값 — 척도 **CONFIRMED (사용자 결정 2026-09-14, C-8)** / 인코딩 RECOMMENDED.
 * 근거: `docs/API_CONTRACTS.md` §2.2 · §3.4,
 * `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md`.
 *
 * `1 | 2 | 3 | 4 | 5` = Never · Rarely · Sometimes · Often · Almost always
 * `'not_observed'` = "Haven't had the chance to see this yet" (결측 — 점수 집계에서 제외)
 *
 * 표시 문구는 Frontend copy 모듈이 소유한다.
 */
export const SURVEY_ANSWER_SCALE = [1, 2, 3, 4, 5] as const;

/** 결측(관찰 기회 없음) 표기. 척도 점수와 구분된다. */
export const SURVEY_ANSWER_NOT_OBSERVED = 'not_observed';

export const SURVEY_ANSWER_VALUES = [...SURVEY_ANSWER_SCALE, SURVEY_ANSWER_NOT_OBSERVED] as const;

export const SurveyAnswerValueSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(SURVEY_ANSWER_NOT_OBSERVED),
]);

export type SurveyAnswerValue = z.infer<typeof SurveyAnswerValueSchema>;
