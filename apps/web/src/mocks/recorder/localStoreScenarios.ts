/**
 * `recorder` 그룹 중 **로컬 저장소 seed** 가 필요한 key 의 해석 (Stage 4 `S4-E`).
 *
 * | key | seed |
 * |---|---|
 * | `crash-recovered` | 끝나지 못한 녹음 1건 (`seedCrashedRecording`) → 복구 → `completed(recovered_after_crash)` → 업로드 (AC-4-65) |
 * | `local-retention-exceeded` | 14일 넘은 미업로드 녹음 1건 (`seedStaleRecording`) → 로컬 삭제 (`D4-29`) |
 * | 그 밖 | 없음 |
 *
 * `RecorderScenarioPlan`(녹음기 계획)과 분리한다 — 둘 다 어댑터가 아니라 **저장소**의 일이다.
 * 7일 안내(`retention_notice`)는 key 를 따로 두지 않는다: 주입 clock 으로 재현한다 (단위 테스트).
 */
import type { ScenarioStore } from '../scenarios';

import { recorderScenarioGroup } from './recorderScenarios';

export type LocalStoreSeed = 'none' | 'crash-recovered' | 'local-retention-exceeded';

export function resolveLocalStoreSeed(store: ScenarioStore): LocalStoreSeed {
  const key = store.resolve(recorderScenarioGroup);
  if (key === 'crash-recovered' || key === 'local-retention-exceeded') return key;
  return 'none';
}
