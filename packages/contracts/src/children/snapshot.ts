import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { CapabilitySchema } from '../enums/capability.js';

/**
 * 역량 점수 1건 — `docs/DATA_MODEL.md` §6 `capability_scores`,
 * `docs/API_CONTRACTS.md` §4 Stage 2 `ProfileResult.snapshot.scores`.
 *
 * **`score: null` 은 "낮은 점수" 가 아니라 "관찰 기회 없음(결측)" 이다** (C-8 · D-2 ①).
 * 한 역량의 문항이 모두 `not_observed`·미응답이면 `score: null`, `itemCount: 0` 이 된다.
 * 대체값(3.0 · 0 · 1.0)을 넣지 않는다 — 관찰되지 않은 것을 관찰값으로 위조하게 된다.
 */
export const CapabilityScoreSchema = z.object({
  capability: CapabilitySchema,
  /** 응답 문항 평균 (1.0–5.0, 소수 1자리). 전부 결측이면 `null`. */
  score: z.number().min(1).max(5).nullable(),
  /** 점수 계산에 **사용된** 문항 수 (`not_observed`·미응답 제외). */
  itemCount: z.int().min(0),
  /** 해당 역량 문항 중 결측 수. `itemCount + missingCount` = 역량별 문항 수. */
  missingCount: z.int().min(0),
});

export type CapabilityScore = z.infer<typeof CapabilityScoreSchema>;

/**
 * 역량 스냅샷의 출처. Stage 2 는 온보딩 설문 1종뿐이다.
 * 세션 분석 기반 스냅샷(Stage 6·7)은 해당 Stage 에서 값을 추가한다.
 */
export const CapabilitySnapshotSourceSchema = z.literal('onboarding_survey');

export type CapabilitySnapshotSource = z.infer<typeof CapabilitySnapshotSourceSchema>;

/** 4대 역량 점수 묶음 — 항상 4개 전부 포함한다 (결측도 `score: null` 행으로 존재한다). */
export const CapabilitySnapshotSchema = z.object({
  id: IdSchema,
  source: CapabilitySnapshotSourceSchema,
  /** 산식 버전. 산식이 바뀌면 과거 스냅샷과 구분할 수 있어야 한다. */
  scoringVersion: z.string().min(1),
  createdAt: IsoDateTimeSchema,
  scores: z.array(CapabilityScoreSchema).length(CapabilitySchema.options.length),
});

export type CapabilitySnapshot = z.infer<typeof CapabilitySnapshotSchema>;
