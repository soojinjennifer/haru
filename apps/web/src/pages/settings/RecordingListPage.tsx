/**
 * `/settings/data/recordings` — 세션 녹음 목록 (Stage 8 `C13-S8-3`, Spec §2.3). TopBar 는 router 가 `RecordingListTopBar` 로 씌운다.
 * Page 는 Composition 만 한다 (rules/frontend §3).
 */
import { RecordingList } from '../../features/recording-deletion';

export function RecordingListPage() {
  return <RecordingList />;
}
