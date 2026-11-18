import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { CapabilitySchema } from '../enums/capability.js';
import { ChildSchema } from './child.js';
import { PersonaSchema } from './persona.js';
import { CapabilitySnapshotSchema } from './snapshot.js';

/**
 * `GET /v1/children/:childId/profile` 응답 — PRD FR-04 · FR-05 · FR-06, §7.3.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2.
 *
 * `strengths` · `growingEdges` 는 **최대 2개**다. `score: null` 인 역량은 후보에서 제외되므로
 * (D-2 ③) 결측이 많으면 개수가 줄거나 비어 있을 수 있다. 화면은 이 경우를 처리해야 한다.
 * 선정 규칙은 `selectStrengths` · `selectGrowingEdges`(`rules/capability-score`)가 소유한다.
 */

/** 강점 · growing edge 로 제시하는 최대 역량 수 (PRD §7.3 "강점 2 / growing edge 2"). */
export const CAPABILITY_HIGHLIGHT_COUNT = 2;

export const ChildProfileSchema = z.object({
  child: ChildSchema,
  latestSnapshot: CapabilitySnapshotSchema,
  strengths: z.array(CapabilitySchema).max(CAPABILITY_HIGHLIGHT_COUNT),
  growingEdges: z.array(CapabilitySchema).max(CAPABILITY_HIGHLIGHT_COUNT),
  persona: PersonaSchema,
  /** 현재 선택된 발전 역량. 전 역량 결측이면 `null` 이고 사용자가 직접 고른다 (D-2 ⑤). */
  growthCapability: CapabilitySchema.nullable(),
  /**
   * 프로필(스냅샷 또는 페르소나)이 **온보딩 이후 마지막으로 갱신된 시각** — PRD FR-15 · Stage 6 Plan §7 C-3.
   *
   * **required + nullable** — 온보딩 직후(갱신 없음)는 `null` 이다. 키 자체가 없는 응답은 거부한다
   * (AC-6-04). 화면은 이 값이 있을 때만 재방문 프로필에 업데이트 안내를 그린다 (`N6-03` ⓐ · Spec §2.2).
   * 산출 시점(최신 스냅샷 · 페르소나 생성 시각)은 서버 규칙이다 (`P6-BIP-01` · `02`).
   */
  profileUpdatedAt: IsoDateTimeSchema.nullable(),
});

export type ChildProfile = z.infer<typeof ChildProfileSchema>;
