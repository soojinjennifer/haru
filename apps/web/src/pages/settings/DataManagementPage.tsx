/**
 * `/settings/data` — 데이터 관리 (Stage 8 `C13-S8-2`, Spec §2.2). TopBar 는 router 가 `DataManagementTopBar` 로 씌운다.
 * Page 는 Composition 만 한다 (rules/frontend §3). 전체 삭제 흐름(`S8-C` — 확인 · 요청 · 상태 · 완료 정리)은
 * `features/data-management` 가 소유한다.
 */
import { DataManagement } from '../../features/data-management';

export function DataManagementPage() {
  return <DataManagement />;
}
