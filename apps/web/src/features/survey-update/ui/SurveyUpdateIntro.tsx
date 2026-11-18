/**
 * 설문 재응답 진입 `/settings/child/survey` — Stage 6 Spec §2.6.1 (`C13-S6-3`, Figma `243:1147` 골격 재사용).
 *
 * ```
 * SurveyIntroLayout (entities/survey — OnboardingIntro 와 같은 골격, R-5)
 * ├─ CharacterMedallion headphones md
 * ├─ Surface strong / card / 5 — h1 *Update your answers* + subheadline(secondary, 기존 tone 유지 — Spec §2.6.1)
 * ├─ InfoRow clock      *About N minutes*            (N = instrument `estimates.surveyMinutes`)
 * ├─ InfoRow list-checks *Your earlier answers are filled in*
 * └─ CTA *Start* | 진행 중 draft 가 있으면 *Continue where you left off* → `currentStep` 카드
 * ```
 *
 * - 온보딩 전용 요소(`TrialNotice` · `DraftDiscardNotice`) **없음** (`N6-07` — 로컬 draft 없음).
 * - Loading = CTA `loading` (Spec §2.6.3). 시계 행은 수치가 instrument 에 있으므로 응답 전에는 그리지 않는다.
 * - 조회 실패 · 오프라인 = 진입 화면 대신 `ErrorState` + *Try again* (Spec §2.6.3).
 * - 이동은 **replace** — 흐름이 history 에 한 칸만 남는다 (`useSurveyUpdateWizard` 머리 주석).
 */
import { ErrorState } from '@haru/ui';
import { useNavigate } from 'react-router';

import { SurveyIntroLayout, surveyCardCopy } from '../../../entities/survey';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { surveyUpdateCopy as copy } from '../copy';
import { FIRST_SURVEY_UPDATE_STEP, surveyUpdateStepPath } from '../model/steps';
import { useSurveyUpdateData } from '../model/useSurveyUpdateData';

export function SurveyUpdateIntro() {
  const navigate = useNavigate();
  const { load, retry } = useSurveyUpdateData();

  if (load.kind === 'error') {
    const message = load.offline ? networkErrorCopy : errorCopyForCode(load.code);
    return (
      <div className="haru-survey-update flex flex-1 flex-col">
        <div data-state="error">
          <ErrorState
            title={message.title}
            description={message.description}
            tone={load.offline ? 'offline' : 'error'}
            titleAs="h2"
            retryLabel={retryLabel}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  const ready = load.kind === 'ready' ? load : null;
  const target =
    ready !== null && ready.resuming ? ready.state.currentStep : FIRST_SURVEY_UPDATE_STEP;

  return (
    <div
      className="haru-survey-update flex flex-1 flex-col"
      data-state={ready === null ? 'loading' : 'ready'}
      aria-busy={ready === null ? true : undefined}
    >
      <SurveyIntroLayout
        title={copy.intro.title}
        body={copy.intro.body}
        duration={
          ready === null
            ? undefined
            : surveyCardCopy.minutes(ready.state.instrument.estimates.surveyMinutes)
        }
        format={copy.intro.prefilled}
        ctaLabel={ready !== null && ready.resuming ? copy.intro.resume : copy.intro.start}
        ctaLoading={ready === null}
        onCta={() => {
          void navigate(surveyUpdateStepPath(target), { replace: true });
        }}
      />
    </div>
  );
}
