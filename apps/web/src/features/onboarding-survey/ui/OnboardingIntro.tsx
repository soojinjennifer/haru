/**
 * 소개 화면 2종 — 재구성 Design Spec §2 (Figma `243:1147` · `179:1748`).
 *
 * **두 프레임은 레이아웃이 같고 copy 만 다르다** (`F-2` — y 좌표 110 / 339 / 562 / 619 / 750 이
 * 전부 일치한다). 그래서 한 컴포넌트가 두 화면을 그리고 `variant` 로 문구만 갈린다.
 *
 * | variant | route | 역할 |
 * |---|---|---|
 * | `profile` | `/onboarding/start` | 프로필 입력(`About your child`) 소개 |
 * | `survey` | `/onboarding` | 카드 설문 소개 |
 *
 * **숫자를 copy 에 적지 않는다** (`R-03` · `AC-2R-09`): 소요 시간은 instrument `estimates`,
 * 카드 수는 카드 목록 길이에서 온다. `instrument-v2` 로 문항이 바뀌면 화면 코드를 고치지 않고
 * 수치가 따라 바뀐다.
 */
import { useNavigate } from 'react-router';

import { SurveyIntroLayout, surveyCards } from '../../../entities/survey';
import type { Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { onboardingCopy } from '../copy';
import { DEFAULT_ONBOARDING_INSTRUMENT } from '../model/defaultInstrument';
import { CARD_STEPS, FIRST_CARD_STEP, FIRST_STEP, pathForStep } from '../model/steps';
import { hasAnyAnswers, useOnboardingDraft } from '../model/useOnboardingDraft';

import { DraftDiscardNotice, TrialNotice } from './OnboardingNotices';

export type OnboardingIntroVariant = 'profile' | 'survey';

export interface OnboardingIntroProps {
  /** 어느 소개 화면인가. */
  variant: OnboardingIntroVariant;
  /** 미인증 체험 구간인가 (page 가 세션으로 판단해 넘긴다). */
  isTrial: boolean;
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export function OnboardingIntro({ variant, isTrial, store, clock }: OnboardingIntroProps) {
  const navigate = useNavigate();

  // 소개 화면은 서버를 호출하지 않는다 — draft 를 읽어 "이어서" 여부와 아이 이름만 본다.
  const draft = useOnboardingDraft({
    instrument: DEFAULT_ONBOARDING_INSTRUMENT,
    store,
    clock,
  });

  const resuming = hasAnyAnswers(draft.answers);
  const childFirstName = draft.answers.child_info?.firstName;

  /** 카드 수는 파생값이다 (`R-02` · `R-03`). */
  const cardCount = surveyCards(DEFAULT_ONBOARDING_INSTRUMENT, CARD_STEPS).length;
  const estimates = DEFAULT_ONBOARDING_INSTRUMENT.estimates;

  const profile = onboardingCopy.intro.profile;
  const survey = onboardingCopy.intro.survey;

  const title =
    variant === 'profile'
      ? profile.title
      : childFirstName === undefined
        ? survey.titleWithoutName
        : survey.title(childFirstName);
  const body = variant === 'profile' ? profile.body : survey.body;
  const duration =
    variant === 'profile'
      ? profile.duration(estimates.profileMinutes)
      : survey.duration(estimates.surveyMinutes, cardCount);
  const format = variant === 'profile' ? profile.format : survey.format;

  /** `profile` 은 프로필 입력으로, `survey` 는 첫 카드로 들어간다. */
  const target =
    variant === 'profile'
      ? pathForStep(FIRST_STEP)
      : resuming && draft.currentStep !== FIRST_STEP
        ? pathForStep(draft.currentStep)
        : pathForStep(FIRST_CARD_STEP);

  const cta =
    variant === 'profile'
      ? profile.cta
      : resuming && draft.currentStep !== FIRST_STEP
        ? survey.resume
        : survey.cta;

  /*
    골격은 `entities/survey` 의 `SurveyIntroLayout` 이다 (Stage 6 `R-5` — 설문 재응답 진입과 공용, DOM 변경 0).
    온보딩 전용 안내(Draft · Trial)는 InfoRow 와 CTA 사이 블록으로 넘긴다.
  */
  return (
    <SurveyIntroLayout
      title={title}
      body={body}
      duration={duration}
      format={format}
      ctaLabel={cta}
      onCta={() => {
        void navigate(target);
      }}
    >
      <div className="w-full">
        <DraftDiscardNotice reason={draft.discarded} onDismiss={draft.dismissDiscardNotice} />
      </div>
      <div className="w-full">
        <TrialNotice isTrial={isTrial} />
      </div>
    </SurveyIntroLayout>
  );
}
