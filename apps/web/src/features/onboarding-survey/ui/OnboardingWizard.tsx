/**
 * 온보딩 위저드 — Design Spec §2.9 공통 chrome + §2.10 단계 본문.
 *
 * 화면 골격만 담당한다. 문항·저장·전송은 `useOnboardingWizard` 가 가지고 있고, 문항 목록은
 * instrument 에서 온다 (결정 **D-A**).
 *
 * TopBar 를 여기에서 렌더하는 이유: 제목이 단계마다 바뀌고 Step 5 는 **문항 index** 에 따라
 * "Question n of 10" 이 되며 trailing 버튼도 그때만 있다. layout route 는 정적이라 표현할 수 없다.
 *
 * 진행 표시 (§2.9)
 * - Step 1~4 = `step / 5`, Step 5 = 문항 진행(`n / 10`) + "Step 5 of 5" caption 병기.
 * - 색만으로 값을 전달하지 않는다 — 항상 텍스트를 함께 둔다.
 */
import { Button, Icon, IconButton, InlineAlert, ProgressBar, Text, TopBar } from '@haru/ui';
import { useId, useState } from 'react';
import type { OnboardingStep } from '@haru/contracts';

import { isHaruApiError } from '../../../shared/api/helpers';
import { errorCopyForCode } from '../../../shared/copy/error-copy';
import type { Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { onboardingCopy } from '../copy';
import { ONBOARDING_STEP_COUNT, stepNumber } from '../model/steps';
import { unansweredCount } from '../model/surveyAnswers';
import { useOnboardingWizard } from '../model/useOnboardingWizard';

import { BooksStep } from './BooksStep';
import { CapabilityItemsStep } from './CapabilityItemsStep';
import { ChildInfoStep } from './ChildInfoStep';
import { ChoiceQuestionList } from './ChoiceQuestionList';
import { DraftDiscardNotice, TrialNotice } from './OnboardingNotices';

export interface OnboardingWizardProps {
  step: OnboardingStep;
  /** 테스트 주입 지점 (기본은 `localStorage` + 시스템 시계). */
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export function OnboardingWizard({ step, store, clock }: OnboardingWizardProps) {
  const copy = onboardingCopy.wizard;
  const wizard = useOnboardingWizard({ step, store, clock });
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const isSurvey = step === 'capability_items';
  const surveyTotal = wizard.instrument.survey.items.length;
  const remaining = unansweredCount(wizard.instrument, wizard.answers);

  const title = isSurvey
    ? onboardingCopy.survey.questionOf(surveyIndex + 1, surveyTotal)
    : onboardingCopy.steps[step];

  const progressValue = isSurvey
    ? (surveyIndex + 1) / surveyTotal
    : stepNumber(step) / ONBOARDING_STEP_COUNT;

  const submitFailure = wizard.submitError === null ? undefined : wizard.submitError;
  const submitCode = isHaruApiError(submitFailure) ? submitFailure.code : undefined;

  /**
   * 필수 문항이 남았는가 (`S2-ONB-1`). **이 화면은 무엇이 필수인지 모른다** — instrument 가
   * 판정한 결과(`wizard.missingRequired`)만 읽는다.
   */
  const blocked = wizard.missingRequired.length > 0;

  function handleNext(): void {
    // Step 1 은 항목별 인라인 에러가 더 정확하다 — 필드 위치를 가리킬 수 있기 때문이다.
    if (step === 'child_info' && wizard.answers.child_info?.firstName === undefined) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    // CTA 는 `aria-disabled` 라 포커스·클릭이 가능하다 — 진행은 여기(와 컨트롤러)에서 막는다.
    if (blocked) return;

    wizard.goNext();
  }

  function body() {
    switch (step) {
      case 'child_info':
        return (
          <ChildInfoStep
            answers={wizard.answers}
            onChange={wizard.setAnswers}
            relationship={wizard.relationship}
            onRelationshipChange={wizard.setRelationship}
            now={wizard.now}
            showErrors={showErrors}
          />
        );
      case 'books':
        return (
          <BooksStep
            instrument={wizard.instrument}
            answers={wizard.answers}
            onChange={wizard.setAnswers}
          />
        );
      case 'capability_items':
        return (
          <CapabilityItemsStep
            instrument={wizard.instrument}
            answers={wizard.answers}
            onChange={wizard.setAnswers}
            index={surveyIndex}
            onIndexChange={setSurveyIndex}
          />
        );
      default:
        return (
          <ChoiceQuestionList
            instrument={wizard.instrument}
            step={step}
            answers={wizard.answers}
            onChange={wizard.setAnswers}
          />
        );
    }
  }

  const ctaLabel = !isSurvey ? copy.next : wizard.isTrial ? copy.saveProfile : copy.finish;
  const blockedReasonId = useId();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <TopBar
        variant="centered"
        title={title}
        leading={
          <IconButton
            icon={<Icon name="chevron-left" decorative />}
            label={isSurvey && surveyIndex > 0 ? onboardingCopy.survey.prevQuestion : copy.back}
            variant="plain"
            onPress={() => {
              // Step 5 는 카드 단위 이동이 우선이다 (Figma `179:1772`).
              if (isSurvey && surveyIndex > 0) {
                setSurveyIndex(surveyIndex - 1);
                return;
              }
              wizard.goBack();
            }}
          />
        }
        trailing={
          isSurvey ? (
            <IconButton
              icon={<Icon name="chevron-right" decorative />}
              label={onboardingCopy.survey.nextQuestion}
              variant="plain"
              disabled={surveyIndex >= surveyTotal - 1}
              onPress={() => {
                setSurveyIndex(surveyIndex + 1);
              }}
            />
          ) : undefined
        }
      />

      <div className="flex flex-col gap-1">
        <ProgressBar
          value={progressValue}
          max={1}
          tone="accent"
          size="sm"
          label={copy.progressLabel}
        />
        <Text variant="caption-1" tone="secondary">
          {copy.stepOf(stepNumber(step), ONBOARDING_STEP_COUNT)}
        </Text>
      </div>

      <DraftDiscardNotice
        reason={wizard.draft.discarded}
        onDismiss={wizard.draft.dismissDiscardNotice}
      />
      {step === 'child_info' ? <TrialNotice isTrial={wizard.isTrial} /> : null}

      {body()}

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

      {/* 하단 CTA 는 스크롤 컨테이너 **내부** 마지막 블록이다 (키보드 가림 방지 — §2.2). */}
      <div className="mt-auto flex flex-col gap-2 pt-8">
        {isSurvey && remaining > 0 ? (
          <Text variant="caption-1" tone="secondary">
            {onboardingCopy.survey.remaining(remaining)}
          </Text>
        ) : null}
        {/*
          필수 미충족은 native `disabled` 가 아니라 `aria-disabled` + 이유 텍스트다 (§2.6 · §10).
          native `disabled` 면 버튼이 포커스를 받지 못해 이유가 스크린리더에 전달되지 않는다.
        */}
        {blocked ? (
          <Text id={blockedReasonId} variant="caption-1" tone="secondary">
            {copy.requiredBlockedReason(wizard.missingRequired.length)}
          </Text>
        ) : null}
        <Button
          variant="accent"
          size="lg"
          fullWidth
          loading={wizard.submitPending}
          onPress={handleNext}
          aria-disabled={blocked ? true : undefined}
          aria-describedby={blocked ? blockedReasonId : undefined}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
