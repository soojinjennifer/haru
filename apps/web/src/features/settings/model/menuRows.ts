/**
 * 설정 목록 `YOUR CHILD` 그룹의 행 구성 — Stage 6 `C13-S6-1` (Spec §2.4, `N6-38` · `D6-4`).
 *
 * 행 구성은 route config 로 둔다 (Plan §5.1 *"SettingsMenu 확장 — 행 구성은 route config"*).
 * 화면은 이 표를 그대로 렌더한다 — 행을 추가·삭제할 때 이 파일만 바뀐다.
 *
 * | 행 | 이동 | 화면 등록 단위 |
 * |---|---|---|
 * | Profile | `/settings/profile` | `S6-E1` |
 * | Child info | `/settings/child` | `S6-B` |
 * | Update survey answers | `/settings/child/survey` | `S6-C` |
 * | Growth focus | `/settings/growth-capability` | `S6-D` |
 *
 * 로그아웃(`ACCOUNT` 그룹)은 이동이 아니라 동작 행이라 이 표에 없다 (chevron 없음 — Spec §2.4).
 */
import { ROUTES } from '../../../shared/config/routes';
import { settingsCopy } from '../copy';

export interface SettingsNavRow {
  readonly id: 'profile' | 'childInfo' | 'surveyUpdate' | 'growthFocus';
  readonly label: string;
  readonly to: string;
}

export const CHILD_SETTINGS_ROWS: readonly SettingsNavRow[] = [
  { id: 'profile', label: settingsCopy.rows.profile, to: ROUTES.settingsProfile },
  { id: 'childInfo', label: settingsCopy.rows.childInfo, to: ROUTES.settingsChild },
  { id: 'surveyUpdate', label: settingsCopy.rows.surveyUpdate, to: ROUTES.settingsChildSurvey },
  {
    id: 'growthFocus',
    label: settingsCopy.rows.growthFocus,
    to: ROUTES.settingsGrowthCapability,
  },
];
