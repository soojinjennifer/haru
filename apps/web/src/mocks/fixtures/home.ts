/**
 * Home 집계 fixture — Stage 3 Design Spec §2.2 · §5.7 · §5.8 · §5.9.
 *
 * - **`streakDays` 가 없다** (`D-6` — contract 에서 삭제). 집계는 이번 주 세션 수 1개뿐이다.
 * - `characterLine` · `lastHighlightLine` 은 **서버가 만든 완성문**이다. 화면은 접두어를 붙이지
 *   않으며, 값이 없으면 해당 요소를 렌더하지 않는다.
 * - **진행 중 세션 안내는 `characterLine` 이 담당한다** (`V-15`, approvals §12.14) — Figma 에
 *   없는 `ActiveSessionNotice` 블록을 제거했기 때문이다.
 * - 금지어(`streak` · `goal` · `on track` · `%` · `{n}/7`)를 쓰지 않는다 (§10).
 */
import { HomeSummarySchema, type HomeSummary } from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';

import { createActivityCardFixture } from './activity-cards';

export const MOCK_ACTIVE_SESSION_ID = '99999999-9999-4999-8999-000000000001';

export interface HomeSummaryFixtureOptions {
  /** 오늘 카드 없음 (§8 `empty`). */
  withoutCard?: boolean;
  /** 진행 중 세션 (§8 `session-already-active`). */
  withActiveSession?: boolean;
  sessionsThisWeek?: number;
}

export function createHomeSummaryFixture(
  clock: Clock,
  options: HomeSummaryFixtureOptions = {},
): HomeSummary {
  return HomeSummarySchema.parse({
    todayCard: options.withoutCard === true ? null : createActivityCardFixture(clock),
    sessionsThisWeek: options.sessionsThisWeek ?? 2,
    /*
      `V-15` (approvals §12.14) — 진행 중 세션은 **별도 안내 블록이 아니라 이 문장**이 말한다.
      화면은 서버 값을 그대로 표시할 뿐이고 조건부로 문구를 만들지 않는다 (rules/frontend §8).
    */
    characterLine:
      options.withActiveSession === true
        ? 'A storytime is still open — you can pick it back up.'
        : 'Fifteen minutes together is plenty for tonight.',
    lastHighlightLine: 'Last time they asked three questions about the ending.',
    ...(options.withActiveSession === true
      ? { activeSession: { sessionId: MOCK_ACTIVE_SESSION_ID, status: 'recording' } }
      : {}),
  });
}
