/**
 * `/settings/child/survey/:step` — 설문 재응답 카드 (Stage 6 `C13-S6-3`, Spec §2.6.2 · `N6-48`).
 *
 * Page 는 **조립만** 한다: route param 을 contracts 의 재응답 단계 값으로 바꿔 위저드에 넘긴다.
 * 재응답 단계가 아닌 slug(`child-info` 포함 — 아이 정보는 `/settings/child`, C-7)는 진입 화면으로 되돌린다.
 */
import { Navigate, useParams } from 'react-router';

import { SurveyUpdateWizard, surveyUpdateStepFromSlug } from '../../features/survey-update';
import { ROUTES } from '../../shared/config/routes';

export function SurveyUpdateStepPage() {
  const { step: slug } = useParams();
  const step = slug === undefined ? null : surveyUpdateStepFromSlug(slug);

  if (step === null) return <Navigate to={ROUTES.settingsChildSurvey} replace />;

  return <SurveyUpdateWizard step={step} />;
}
