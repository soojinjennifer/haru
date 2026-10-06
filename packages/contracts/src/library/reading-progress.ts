import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';

/**
 * 다회차 읽기 진행 — `Reading now` 블록 (Figma `145:1142`~`145:1152` `[실측]`).
 * 근거: Library Plan §7.2 (`L-D2`), Library Design Spec §3.2, `stage-3-approvals.md` §18.3.
 *
 * ── 프론트가 계산하지 않는다 (`L-OPEN-16` · `L-OPEN-17`) ──
 * **`progressRatio` 는 서버가 직접 준다.** 회차(`completedNights / plannedNights`)로 프론트가
 * 되계산하지 않는다 — 산식은 Backend 요구사항(`P3-BIP-17`)이고 "무엇을 한 회차로 보는가" 는
 * 서버만 안다. `null` 이면 진행 바를 **렌더하지 않는다**.
 *
 * **`plannedNights` 는 nullable 이다.** 계획 회차의 출처가 PRD·Figma 어느 쪽에도 없다 —
 * `null` 이면 `3 of 5 nights` 같은 회차 문구를 **생략**하고 헤더 높이만 유지한다
 * (Design Spec §3.1 `meta` 모드).
 *
 * ⚠ 응답 필드에 길이·범위 제약을 더 걸지 않는다 — Backend 가 한 번만 벗어나도 parse 가 던져
 * 서재 화면이 통째로 비어 버린다 (`characterLine` 선례, `home/summary.ts`). 아래 제약은
 * **구조적으로 뜻이 없으면 화면을 그릴 수 없는 것**만 남겼다:
 *   - `completedNights` 는 음수일 수 없다 (회차 수다)
 *   - `plannedNights` 는 0 일 수 없다 (`n of 0 nights` 는 문장이 되지 않는다)
 *   - `progressRatio` 는 0–1 밖이면 진행 바 폭이 깨진다
 */
export const ReadingProgressSchema = z.object({
  completedNights: z.number().int().min(0),
  plannedNights: z.number().int().min(1).nullable(),
  /** 0–1. 서버 값만 그린다 (프론트 계산 금지). `null` 이면 진행 바 미렌더. */
  progressRatio: z.number().min(0).max(1).nullable(),
  lastReadAt: IsoDateTimeSchema.nullable(),
  /** `Last read Tue · 12 min` 의 분 (`145:1152`). 없으면 그 조각만 생략한다. */
  lastSessionMinutes: z.number().int().min(0).nullable(),
});

export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;
