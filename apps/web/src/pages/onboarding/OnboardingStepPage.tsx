/**
 * `/onboarding/:step` — Design Spec §2.9 · §2.10.
 *
 * Page 는 **조립만** 한다: route param 을 contracts 의 단계 값으로 바꿔 위저드에 넘긴다.
 * 알 수 없는 slug 는 첫 단계로 되돌린다 (없는 화면을 만들지 않는다).
 */
import { Navigate, useParams } from 'react-router';

import {
  OnboardingWizard,
  pathForStep,
  FIRST_STEP,
  stepFromSlug,
} from '../../features/onboarding-survey';

export function OnboardingStepPage() {
  const { step: slug } = useParams();
  const step = slug === undefined ? null : stepFromSlug(slug);

  if (step === null) return <Navigate to={pathForStep(FIRST_STEP)} replace />;

  return <OnboardingWizard step={step} />;
}
