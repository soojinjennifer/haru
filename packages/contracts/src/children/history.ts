import type { z } from 'zod';

import { paginated } from '../common/pagination.js';
import { PersonaSchema } from './persona.js';
import { CapabilitySnapshotSchema } from './snapshot.js';

/**
 * 프로필 **히스토리 목록** 응답 — `docs/API_CONTRACTS.md` §4 Stage 2 표 ·
 * Stage 6 Plan §7 C-8 (`N6-12` → `D6-3`).
 *
 * | endpoint | 응답 |
 * |---|---|
 * | `GET /v1/children/:childId/capability-snapshots?limit&cursor` | `CapabilitySnapshotPage` |
 * | `GET /v1/children/:childId/personas?limit&cursor` | `PersonaPage` |
 *
 * ⚠️ **schema + fixture + parse 테스트만** 둔다 — Stage 6 에는 API Client 메서드·호출자가 **0** 이다.
 * 호출자는 Stage 7 리포트 히스토리다 (Stage 5 `N5-22` 선례). 정렬 = 최신 먼저(서버 규칙).
 * 요청 query 는 공통 `CursorPageRequestSchema` 를 쓴다.
 */
export const CapabilitySnapshotPageSchema = paginated(CapabilitySnapshotSchema);

export type CapabilitySnapshotPage = z.infer<typeof CapabilitySnapshotPageSchema>;

export const PersonaPageSchema = paginated(PersonaSchema);

export type PersonaPage = z.infer<typeof PersonaPageSchema>;
