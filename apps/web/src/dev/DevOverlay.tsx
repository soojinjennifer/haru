/**
 * dev 전용 오버레이 진입점 — 모든 dev 화면에 붙는 Scenario Panel.
 *
 * `app/router.tsx` 가 `import.meta.env.DEV` 가드 + 동적 import 로만 불러온다.
 * Production 빌드에서는 이 모듈 그래프가 통째로 사라진다 (AC-1-42).
 */
import { __HARU_DEV_SENTINEL__ } from './devSentinel';
import { ScenarioPanel } from './scenario-panel/ScenarioPanel';

import './dev.css';

export default function DevOverlay() {
  return (
    <div data-dev-sentinel={__HARU_DEV_SENTINEL__}>
      <ScenarioPanel />
    </div>
  );
}
