/**
 * `/settings/child/survey` — 설문 재응답 진입 (Stage 6 `C13-S6-3`, Spec §2.6.1).
 *
 * TopBar 는 router 가 `SurveyUpdateTopBar` 로 씌운다. Page 는 조립만 한다 (rules/frontend §3).
 */
import { SurveyUpdateIntro } from '../../features/survey-update';

export function SurveyUpdatePage() {
  return <SurveyUpdateIntro />;
}
