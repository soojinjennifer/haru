/**
 * 설문 재응답 카드 `/settings/child/survey/:step` — Stage 6 Spec §2.6.2 · §2.6.3 (Figma `179:1770` 재사용, `C13-S6-3`).
 *
 * **온보딩 카드 단계와 같은 화면 구성**이다 (AC-6-24 — 카운터·진행바·카드·옵션·뒤로/앞으로 = 동일 컴포넌트·동일 규칙):
 * TopBar(단계 제목 · 이전/다음) → ProgressBar(단계 비율 구간) → `SurveyCardDeck`(`entities/survey`, `R-5`) →
 * 마지막 카드에만 CTA. 마크업·클래스는 `OnboardingWizard` 의 카드 단계 분기와 같다.
 *
 * 온보딩과 다른 점 (Spec §2.6):
 * - 단계 = 온보딩 Step **2~5** 만 (C-7). Trial 안내 · 로컬 draft 안내 **없음** (`N6-07`).
 * - 단계 저장 실패는 **시각 변화 없음** (Spec §2.6.3 — 온보딩의 저장 실패 안내를 그리지 않는다).
 * - 마지막 카드 CTA 라벨 *Save answers* · 제출 실패 = CTA 위 `InlineAlert tone="error"` (§10.3, 오프라인 문구 분리).
 * - 첫 카드에서 뒤로 = 진입 화면.
 *
 * 상태: Loading = TopBar + 카드 자리 `Skeleton shape="card"` · 조회 실패 = `ErrorState` + *Try again* (Spec §2.6.3).
 * `R-SHADOW-1`: 새 overflow 0 — 카드는 온보딩과 같은 recipe·같은 `AppShell` 뷰포트. 조회 실패 `ErrorState` 는
 * `e2e/shadow.spec.ts` 가 393·600 양축 프로브로 본다.
 */
import type { SurveyUpdateStep } from '@haru/contracts';
import {
  Button,
  ErrorState,
  Icon,
  IconButton,
  InlineAlert,
  ProgressBar,
  Skeleton,
  Text,
  TopBar,
} from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  cardCountsByStep,
  cardPosition,
  cardsForStep,
  SurveyCardDeck,
  surveyCardCopy,
  surveyCards,
  unansweredCount,
  useSurveyDeckSession,
  type SurveyCard,
} from '../../../entities/survey';
import { ROUTES } from '../../../shared/config/routes';
import {
  deletionPendingCopy,
  errorCopyForCode,
  networkErrorCopy,
  retryLabel,
} from '../../../shared/copy/error-copy';
import { surveyUpdateCopy as copy } from '../copy';
import {
  LAST_SURVEY_UPDATE_STEP,
  previousSurveyUpdateStep,
  SURVEY_UPDATE_STEPS,
} from '../model/steps';
import { useSurveyUpdateData, type SurveyUpdateLoad } from '../model/useSurveyUpdateData';
import { useSurveyUpdateWizard } from '../model/useSurveyUpdateWizard';

export interface SurveyUpdateWizardProps {
  step: SurveyUpdateStep;
}

const deckCopy = surveyCardCopy.deck;

function stepTitle(step: SurveyUpdateStep): string {
  return surveyCardCopy.steps[step];
}

/** 조회 전·실패 화면의 TopBar — 뒤로 = 진입 화면 (첫 카드의 뒤로와 같은 목적지). */
function PlainTopBar({ step }: { step: SurveyUpdateStep }) {
  const navigate = useNavigate();
  return (
    <TopBar
      variant="centered"
      title={stepTitle(step)}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" decorative />}
          label={deckCopy.back}
          variant="plain"
          onPress={() => {
            void navigate(ROUTES.settingsChildSurvey, { replace: true });
          }}
        />
      }
    />
  );
}

function WizardPlaceholder({
  step,
  load,
  onRetry,
}: {
  step: SurveyUpdateStep;
  load: Exclude<SurveyUpdateLoad, { kind: 'ready' }>;
  onRetry: () => void;
}) {
  const message =
    load.kind === 'error' ? (load.offline ? networkErrorCopy : errorCopyForCode(load.code)) : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4">
        <PlainTopBar step={step} />
      </div>
      <div className="haru-wizard-body flex flex-1 flex-col gap-4">
        {load.kind === 'loading' ? (
          <div role="status" aria-busy="true" aria-label={copy.loading} data-state="loading">
            <Skeleton shape="card" />
          </div>
        ) : message === null ? null : (
          <div data-state="error">
            <ErrorState
              title={message.title}
              description={message.description}
              tone={load.kind === 'error' && load.offline ? 'offline' : 'error'}
              titleAs="h2"
              retryLabel={retryLabel}
              onRetry={onRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function WizardContent({
  step,
  childId,
  load,
}: {
  step: SurveyUpdateStep;
  childId: string;
  load: Extract<SurveyUpdateLoad, { kind: 'ready' }>;
}) {
  const wizard = useSurveyUpdateWizard({ step, childId, state: load.state });
  const session = useSurveyDeckSession();

  /** 단계 안의 카드 위치 — 뒤로 와서 도착했으면 그 단계의 마지막 카드 (`OnboardingWizard` 와 같은 규칙). */
  const [cursor, setCursor] = useState<{ step: SurveyUpdateStep; index: number }>(() => ({
    step,
    index: session.takeReturnIndex(step) ?? 0,
  }));
  const cardIndex = cursor.step === step ? cursor.index : 0;

  const allCards: readonly SurveyCard[] = surveyCards(wizard.instrument, SURVEY_UPDATE_STEPS);
  const cards = cardsForStep(allCards, step);
  const currentCard = cards[cardIndex];
  const globalIndex = currentCard === undefined ? 0 : cardPosition(allCards, currentCard.key);

  const title = stepTitle(step);
  const announcement = deckCopy.cardAnnouncement(title, globalIndex, allCards.length);

  const blocked = wizard.missingRequired.length > 0;
  const currentCardBlocked =
    currentCard?.kind === 'choice' &&
    wizard.missingRequired.includes(currentCard.question.questionId);

  const isLastStep = step === LAST_SURVEY_UPDATE_STEP;
  const onLastCard = cardIndex === cards.length - 1;
  /** 이전 카드인가, 진입 화면인가 — 통산 번호로 판정한다 (`S2-FIX-4`). */
  const previousIsCard = globalIndex > 1;
  const showSubmitCta = isLastStep && onLastCard;
  const remaining = unansweredCount(wizard.instrument, wizard.answers);

  function handlePrevious(): void {
    if (cardIndex > 0) {
      setCursor({ step, index: cardIndex - 1 });
      return;
    }
    const previous = previousSurveyUpdateStep(step);
    if (previous !== null) {
      // 이전 단계의 **마지막 카드**로 — navigate 가 이 화면을 재마운트하므로 요청만 남긴다 (§14.2-1).
      session.requestReturnTo(previous, Math.max(cardsForStep(allCards, previous).length - 1, 0));
    }
    wizard.goBack();
  }

  function handleNextCard(): void {
    if (currentCardBlocked) return;
    if (cardIndex < cards.length - 1) {
      setCursor({ step, index: cardIndex + 1 });
      return;
    }
    if (!isLastStep) wizard.goNext();
  }

  const failure =
    wizard.submitFailure === null
      ? null
      : wizard.submitFailure.offline
        ? copy.offline
        : (deletionPendingCopy(wizard.submitFailure.code) ?? copy.saveFailed);

  return (
    <div className="flex flex-1 flex-col" data-state="ready">
      <div className="flex flex-col gap-4">
        <TopBar
          variant="centered"
          title={title}
          leading={
            <IconButton
              icon={<Icon name="chevron-left" decorative />}
              label={previousIsCard ? deckCopy.prevQuestion : deckCopy.back}
              variant="plain"
              onPress={handlePrevious}
            />
          }
          trailing={
            <IconButton
              icon={<Icon name="chevron-right" decorative />}
              label={deckCopy.nextQuestion}
              variant="plain"
              aria-disabled={currentCardBlocked ? true : undefined}
              disabled={isLastStep && onLastCard}
              onPress={handleNextCard}
            />
          }
        />
        <ProgressBar
          value={globalIndex}
          max={allCards.length}
          tone="accent"
          size="sm"
          label={copy.a11y.progressLabel}
          segments={cardCountsByStep(allCards, SURVEY_UPDATE_STEPS)}
          valueText={announcement}
        />
      </div>

      <div className="haru-wizard-body flex flex-1 flex-col gap-4">
        <SurveyCardDeck
          instrument={wizard.instrument}
          cards={cards}
          allCards={allCards}
          answers={wizard.answers}
          onChange={wizard.setAnswers}
          index={cardIndex}
          onIndexChange={(next) => {
            setCursor({ step, index: next });
          }}
          onAdvanceStep={handleNextCard}
          onPrevious={handlePrevious}
          onNextCard={handleNextCard}
          canGoPrevious={previousIsCard}
          nextBlocked={currentCardBlocked}
          nextDisabled={isLastStep && onLastCard}
          missingRequired={wizard.missingRequired}
          announcement={announcement}
          label={copy.a11y.deckLabel}
        />

        {showSubmitCta && failure !== null ? (
          <InlineAlert tone="error" title={failure.title} description={failure.description} />
        ) : null}

        {showSubmitCta ? (
          <div className="mt-auto flex flex-col gap-2 pt-8">
            {remaining > 0 ? (
              <Text variant="caption-1" tone="secondary">
                {deckCopy.remaining(remaining)}
              </Text>
            ) : null}
            <Button
              variant="accent"
              size="lg"
              fullWidth
              loading={wizard.submitPending}
              onPress={wizard.submit}
              aria-disabled={blocked ? true : undefined}
            >
              {copy.saveAnswers}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SurveyUpdateWizard({ step }: SurveyUpdateWizardProps) {
  const { load, retry } = useSurveyUpdateData();

  return (
    <div className="haru-survey-update flex flex-1 flex-col">
      {load.kind === 'ready' ? (
        <WizardContent step={step} childId={load.childId} load={load} />
      ) : (
        <WizardPlaceholder step={step} load={load} onRetry={retry} />
      )}
    </div>
  );
}
