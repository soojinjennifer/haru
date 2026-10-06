import { ActivityCardDeck } from '../../features/activity-card-deck';
import { HomeStage } from '../../features/home-overview';

/**
 * `/` Home — Stage 3 Design Spec §2.2 (Figma `26:21` + 덱 `163:2648`).
 *
 * Stage 2 의 skeleton(`EmptyState` 1개)을 **대체**한다 (`AC-3-09`).
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3). 여기에 API 호출·상태 전이·Mock
 * 데이터가 없다. 덱을 `HomeStage` 의 **슬롯으로 넘기는 이유**도 그것이다 —
 * `features/A → features/B` 직접 import 가 금지(`AC-3-03`)이므로 두 feature 의 조립은
 * Page 에서만 일어난다.
 */
export function HomePage() {
  return <HomeStage deck={<ActivityCardDeck />} />;
}
