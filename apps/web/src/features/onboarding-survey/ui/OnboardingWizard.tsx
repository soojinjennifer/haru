/**
 * 온보딩 위저드 — 재구성 Design Spec §3 (공통 chrome) + §4 (프로필 입력).
 *
 * 화면 골격만 담당한다. 문항·저장·전송은 `useOnboardingWizard` 가 가지고 있고, 문항 목록은
 * instrument 에서 온다 (결정 **D-A**).
 *
 * 두 종류의 화면이 이 컴포넌트를 공유한다.
 *
 * | | `child_info` | 카드 4단계 |
 * |---|---|---|
 * | 본문 | 입력 폼 (`ChildInfoStep`) | 카드 덱 (`SurveyCardDeck`) |
 * | ProgressBar | **없음** (Figma `248:1159` 에 없다) | 단계 비율 구간 |
 * | 하단 CTA | `Next` | **없다.** 마지막 카드에만 제출 CTA (`§11.7` · §3.2) |
 * | 전진 | CTA | 스와이프 · TopBar chevron · 단일 선택 자동 전진 |
 *
 * 카드 단계에 CTA 를 두지 않는 근거: Figma `179:1770` 트리에 Button 노드가 **0건**이고,
 * `179:1767` 이 "Swipe each card away to move on" 으로 전진 수단을 명시한다. CTA 블록(≈90px)을
 * 유지하면 16장 중 대부분이 뷰포트를 넘는다 (Design Spec §5).
 */
import { Button, Icon, IconButton, InlineAlert, ProgressBar, Text, TopBar } from '@haru/ui';
import { useState } from 'react';
import type { OnboardingStep } from '@haru/contracts';

import { isHaruApiError } from '../../../shared/api/helpers';
import { errorCopyForCode } from '../../../shared/copy/error-copy';
import type { Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { onboardingCopy } from '../copy';
import {
  cardCountsByStep,
  cardPosition,
  cardsForStep,
  surveyCards,
  type SurveyCard,
} from '../model/instrumentView';
import { CARD_STEPS, isCardStep, LAST_STEP, previousStep } from '../model/steps';
import { unansweredCount } from '../model/surveyAnswers';
import { useOnboardingSession } from '../model/onboardingSession';
import { useOnboardingWizard } from '../model/useOnboardingWizard';

import { ChildInfoStep } from './ChildInfoStep';
import { SurveyCardDeck } from './SurveyCardDeck';
import { DraftDiscardNotice, TrialNotice } from './OnboardingNotices';

export interface OnboardingWizardProps {
  step: OnboardingStep;
  /** 테스트 주입 지점 (기본은 `localStorage` + 시스템 시계). */
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

/** 단계 제목 — copy 에 없는 단계(instrument 확장)는 제목 없이 렌더한다 (§10-3). */
function stepTitle(step: OnboardingStep): string | undefined {
  const titles: Record<string, string> = onboardingCopy.steps;
  return titles[step];
}

export function OnboardingWizard({ step, store, clock }: OnboardingWizardProps) {
  const copy = onboardingCopy.wizard;
  const wizard = useOnboardingWizard({ step, store, clock });
  const session = useOnboardingSession();
  const [showErrors, setShowErrors] = useState(false);

  /**
   * 단계 안에서의 카드 위치. 단계가 바뀌면 0 으로 돌아간다 — props 변화에 state 를 맞추는
   * 패턴이므로 effect 를 쓰지 않는다.
   *
   * **뒤로 와서 도착했으면 그 단계의 마지막 카드에서 시작한다** (§14.2-1 — 카드 흐름이 하나다).
   * `handlePrevious` 가 `setCursor` 로 직접 넣을 수 없다: 그 직후의 navigate 가
   * `RouteErrorBoundary`(`key={location.key}`)를 바꿔 이 컴포넌트를 재마운트시켜 state 가
   * 사라지기 때문이다. 그래서 복귀 지점을 재마운트 밖(`OnboardingSession`)에 두고 **초기값으로
   * 한 번 읽어 소비**한다 — effect 에서 `setCursor` 하면 첫 카드가 그려졌다 바뀌고,
   * `react-hooks/set-state-in-effect` 도 그것을 금지한다.
   *
   * StrictMode 가 초기화 함수를 두 번 부르지만, 두 호출이 **같은 마운트 안**에서 연달아 일어나고
   * 둘 중 하나의 결과만 쓰이므로 복귀 지점은 그대로 반영된다 (dev StrictMode e2e 로 확인).
   */
  const [cursor, setCursor] = useState<{ step: OnboardingStep; index: number }>(() => ({
    step,
    index: session.takeReturnIndex(step) ?? 0,
  }));
  const cardIndex = cursor.step === step ? cursor.index : 0;

  const allCards: readonly SurveyCard[] = surveyCards(wizard.instrument, CARD_STEPS);
  const cards = cardsForStep(allCards, step);
  const onCardStep = isCardStep(step);
  const currentCard = cards[cardIndex];

  /** 통산 번호 — 단계가 바뀌어도 끊기지 않는다 (`R-02`). 숫자는 전부 파생값이다. */
  const globalIndex = currentCard === undefined ? 0 : cardPosition(allCards, currentCard.key);

  const title = stepTitle(step);
  const announcement =
    title === undefined || !onCardStep
      ? undefined
      : onboardingCopy.survey.cardAnnouncement(title, globalIndex, allCards.length);

  const submitFailure = wizard.submitError === null ? undefined : wizard.submitError;
  const submitCode = isHaruApiError(submitFailure) ? submitFailure.code : undefined;

  /**
   * 필수 문항이 남았는가 (`S2-ONB-1`). **이 화면은 무엇이 필수인지 모른다** — instrument 가
   * 판정한 결과(`wizard.missingRequired`)만 읽는다.
   */
  const blocked = wizard.missingRequired.length > 0;
  /** 현재 카드가 필수 미응답인가 — 전진 어포던스만 막는다 (카드 밖으로 나가지 못하게). */
  const currentCardBlocked =
    currentCard?.kind === 'choice' &&
    wizard.missingRequired.includes(currentCard.question.questionId);

  const isLastCardStep = step === LAST_STEP;
  const onLastCard = onCardStep && cardIndex === cards.length - 1;
  /** 제출 CTA 는 **전체 마지막 카드**에서만 나온다 (§3.2). */
  const showSubmitCta = (onCardStep && isLastCardStep && onLastCard) || !onCardStep;
  const remaining = unansweredCount(wizard.instrument, wizard.answers);

  function handleNext(): void {
    // `child_info` 는 항목별 인라인 에러가 더 정확하다 — 필드 위치를 가리킬 수 있기 때문이다.
    if (step === 'child_info' && wizard.answers.child_info?.firstName === undefined) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    // CTA 는 `aria-disabled` 라 포커스·클릭이 가능하다 — 진행은 여기(와 컨트롤러)에서 막는다.
    if (blocked) return;

    wizard.goNext();
  }

  /** TopBar leading — 카드 안이면 이전 카드, 첫 카드면 이전 화면 (§14.2-1). */
  function handlePrevious(): void {
    if (onCardStep && cardIndex > 0) {
      setCursor({ step, index: cardIndex - 1 });
      return;
    }

    const previous = previousStep(step);
    if (onCardStep && previous !== null && isCardStep(previous)) {
      /*
        이전 단계의 **마지막 카드**로 돌아간다 — 카드 흐름이 하나이기 때문이다.
        `setCursor` 로는 안 된다: 바로 아래 `goBack()` 의 navigate 가 이 컴포넌트를
        재마운트시켜 state 가 사라진다. 요청만 남기고 새 위저드가 읽는다 (§14.2-1).
      */
      const previousCards = cardsForStep(allCards, previous);
      session.requestReturnTo(previous, Math.max(previousCards.length - 1, 0));
    }

    wizard.goBack();
  }

  /** TopBar trailing — 다음 카드. 마지막 카드에서는 다음 단계로 넘긴다. */
  function handleNextCard(): void {
    if (currentCardBlocked) return;

    if (cardIndex < cards.length - 1) {
      setCursor({ step, index: cardIndex + 1 });
      return;
    }

    if (!isLastCardStep) wizard.goNext();
  }

  const ctaLabel = !onCardStep ? copy.next : wizard.isTrial ? copy.saveProfile : copy.finish;

  return (
    /*
      세로 간격이 두 종류다 (Design Spec §3.1): `TopBar → ProgressBar` = `--space-4`(16),
      `ProgressBar → 카드` = `--space-6`(24). 단일 `gap` 으로는 한 값만 표현할 수 있어
      상단 묶음과 본문을 분리한다 (`QA-2R-002`).
    */
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4">
        <TopBar
          variant="centered"
          {...(title === undefined ? {} : { title })}
          leading={
            <IconButton
              icon={<Icon name="chevron-left" decorative />}
              label={onCardStep && cardIndex > 0 ? onboardingCopy.survey.prevQuestion : copy.back}
              variant="plain"
              onPress={handlePrevious}
            />
          }
          trailing={
            onCardStep ? (
              <IconButton
                icon={<Icon name="chevron-right" decorative />}
                label={onboardingCopy.survey.nextQuestion}
                variant="plain"
                /* 필수 미응답은 native `disabled` 가 아니라 `aria-disabled` 다 — 사유가 카드 안에
                 1행으로 함께 있어야 스크린리더에 전달된다 (§3.2). */
                aria-disabled={currentCardBlocked ? true : undefined}
                disabled={isLastCardStep && onLastCard}
                onPress={handleNextCard}
              />
            ) : undefined
          }
        />

        {onCardStep ? (
          <ProgressBar
            value={globalIndex}
            max={allCards.length}
            tone="accent"
            size="sm"
            label={copy.progressLabel}
            /* 구간 비율은 단계별 카드 수 파생값이다 — 배열을 코드에 박지 않는다 (§3.3). */
            segments={cardCountsByStep(allCards, CARD_STEPS)}
            valueText={announcement}
          />
        ) : null}
      </div>

      <div
        className={`flex flex-1 flex-col gap-4 ${
          onCardStep ? 'haru-wizard-body' : 'haru-wizard-body--compact'
        }`}
      >
        <DraftDiscardNotice
          reason={wizard.draft.discarded}
          onDismiss={wizard.draft.dismissDiscardNotice}
        />
        {/* Trial 안내는 **미로그인일 때만** 렌더한다 (`R-07`). */}
        {step === 'child_info' ? <TrialNotice isTrial={wizard.isTrial} /> : null}

        {onCardStep ? (
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
            /*
              단계의 마지막 카드에서 자동 전진하면 **다음 단계의 첫 카드**로 간다 — chevron 과
              같은 경로다 (`handleNextCard`). 덱은 단계 안의 번호만 알아서 이 전환을 할 수 없다.
            */
            onAdvanceStep={handleNextCard}
            missingRequired={wizard.missingRequired}
            {...(announcement === undefined ? {} : { announcement })}
          />
        ) : (
          <ChildInfoStep
            answers={wizard.answers}
            onChange={wizard.setAnswers}
            relationship={wizard.relationship}
            onRelationshipChange={wizard.setRelationship}
            now={wizard.now}
            showErrors={showErrors}
          />
        )}

        {wizard.saveFailed ? (
          <InlineAlert
            tone="warning"
            title={copy.saveFailedTitle}
            description={copy.saveFailedDescription}
          />
        ) : null}

        {submitCode === 'CHILD_LIMIT_REACHED' ? (
          <InlineAlert tone="warning" title={onboardingCopy.survey.childLimit} />
        ) : submitFailure === undefined || submitFailure === null ? null : (
          <InlineAlert
            tone="error"
            title={onboardingCopy.survey.submitFailedTitle}
            description={errorCopyForCode(submitCode).description}
          />
        )}

        {/*
          하단 CTA — 카드 단계에서는 **마지막 카드에서만** 그린다 (§3.2).
          스크롤 컨테이너 **내부** 마지막 블록이다 (키보드 가림 방지 — §2.2). 아래 여백 44 는
          `AppShell bottomGap="cta"` 가 담당한다 (`S2-FIX-1`).
        */}
        {showSubmitCta ? (
          <div className="mt-auto flex flex-col gap-2 pt-8">
            {onCardStep && remaining > 0 ? (
              <Text variant="caption-1" tone="secondary">
                {onboardingCopy.survey.remaining(remaining)}
              </Text>
            ) : null}
            <Button
              variant="accent"
              size="lg"
              fullWidth
              loading={wizard.submitPending}
              onPress={handleNext}
              aria-disabled={blocked ? true : undefined}
            >
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
