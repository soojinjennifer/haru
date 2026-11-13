import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';

/**
 * 하이라이트 클립 (PRD FR-18 · §7.9) — `docs/API_CONTRACTS.md` §3.12 (Rev 9), Stage 5 Plan §7 C-9.
 *
 * ⚠️ Stage 5 범위는 **schema + fixture + parse 테스트만**이다 (`N5-22`). API Client 메서드·호출자는 없다 —
 * 재생 UI 와 `GET /v1/highlight-clips/:clipId/playback-url` 호출은 Stage 7 이 만든다.
 * 추출(10~15초)·private 저장·만료는 Backend 요구사항이다 (`P5-BIP-14`, 보관 기간 `OAQ-13` 법무 대기).
 */
export const HighlightClipSummarySchema = z.object({
  id: IdSchema,
  sessionId: IdSchema,
  /** 클립 길이(초). 10~15초는 추출 측 가이드이며 schema 는 1 이상 정수만 강제한다. */
  durationSeconds: z.int().min(1),
  /** 보관 만료 시각. `OAQ-13` 결정 전에는 `null` 일 수 있다. */
  expiresAt: IsoDateTimeSchema.nullable(),
});

export type HighlightClipSummary = z.infer<typeof HighlightClipSummarySchema>;

/**
 * 만료가 있는 재생 URL (private Storage signed URL — `P5-BIP-14`). URL 은 로그에 남기지 않는다.
 */
export const SignedMediaUrlSchema = z.object({
  url: z.url(),
  expiresAt: IsoDateTimeSchema,
});

export type SignedMediaUrl = z.infer<typeof SignedMediaUrlSchema>;
