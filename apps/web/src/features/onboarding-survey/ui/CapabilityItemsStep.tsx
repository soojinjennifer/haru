/**
 * Step 5 — Design Spec §2.10 Step 5 (Figma `179:1770` + `C13-08`).
 *
 * **문항 문구·척도 라벨은 전부 instrument 응답 값이다** (AC-2-24). 이 파일에는 문항이 없다.
 *
 * 접근성 (결정 **D-9**, WCAG 2.5.1)
 * - `SwipeDeck controls="none"` 으로 쓰되, **같은 동작의 버튼을 TopBar 에 둔다**
 *   (`OnboardingWizard` 가 렌더). 제스처 없이 버튼·키보드만으로 10문항 전부에 도달한다.
 * - 덱 안에서 `ArrowLeft`/`ArrowRight` 가 카드 이동이다. 단, `RadioGroup` 위에서는
 *   라디오 이동이 우선이므로 (SwipeDeck 의 `KEY_OWNING_SELECTOR`) 옵션 선택과 충돌하지 않는다.
 *
 * 비채점 6번째 옵션 (`C13-08`)
 * - `variant='muted'` + 위쪽 구분선 + "This one isn't scored." caption (`haru-survey-options`).
 * - **선택 상태 표시는 1~5 와 완전히 같다** — 결측이지 낮은 점수가 아니다 (C-8).
 */
import { RadioGroup, SwipeDeck } from '@haru/ui';
import { useId } from 'react';
import {
  SURVEY_ANSWER_NOT_OBSERVED,
  SurveyAnswerValueSchema,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type SurveyAnswerValue,
  type SurveyItem,
} from '@haru/contracts';

import { SurveyQuestionCard } from '../../../entities/character';
import { onboardingCopy } from '../copy';
import { clearSurveyAnswer, setSurveyAnswer, surveyAnswerFor } from '../model/surveyAnswers';

export interface CapabilityItemsStepProps {
  instrument: OnboardingInstrument;
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
  index: number;
  onIndexChange: (index: number) => void;
}

/** `SurveyAnswerValue` ↔ `RadioGroup` 문자열 값 변환. 숫자 응답도 DOM 에서는 문자열이다. */
function toRadioValue(value: SurveyAnswerValue | undefined): string | null {
  return value === undefined ? null : String(value);
}

function fromRadioValue(raw: string): SurveyAnswerValue {
  // DOM 은 문자열만 다루므로 여기에서 contracts schema 로 되돌린다 (캐스팅하지 않는다).
  return SurveyAnswerValueSchema.parse(
    raw === SURVEY_ANSWER_NOT_OBSERVED ? raw : Number.parseInt(raw, 10),
  );
}

export function CapabilityItemsStep({
  instrument,
  answers,
  onChange,
  index,
  onIndexChange,
}: CapabilityItemsStepProps) {
  const copy = onboardingCopy.survey;
  const captionId = useId();
  const eyebrowId = useId();
  const { survey } = instrument;
  const total = survey.items.length;

  function renderCard(item: SurveyItem, cardIndex: number) {
    const current = surveyAnswerFor(answers, item.itemCode);

    return (
      <SurveyQuestionCard
        counter={copy.counter(cardIndex + 1, total)}
        eyebrow={survey.stem}
        eyebrowId={eyebrowId}
        question={item.prompt}
        clearLabel={copy.clearAnswer}
        onClear={
          current === undefined
            ? undefined
            : () => {
                onChange(clearSurveyAnswer(answers, instrument, item.itemCode));
              }
        }
      >
        <div className="haru-survey-options">
          <RadioGroup
            legend={item.prompt}
            name={`survey-${item.itemCode}`}
            variant="card"
            value={toRadioValue(current)}
            describedBy={`${eyebrowId} ${captionId}`}
            options={survey.scaleLabels.map((scale) => ({
              value: String(scale.value),
              label: scale.label,
              // 6번째(비채점)만 재질을 달리한다 — 위계를 낮추지 않는다 (C13-08).
              ...(scale.value === SURVEY_ANSWER_NOT_OBSERVED ? { variant: 'muted' as const } : {}),
            }))}
            onChange={(raw) => {
              onChange(setSurveyAnswer(answers, instrument, item.itemCode, fromRadioValue(raw)));
            }}
          />
          <p className="haru-survey-caption" id={captionId}>
            {copy.notScoredCaption}
          </p>
        </div>
      </SurveyQuestionCard>
    );
  }

  return (
    <SwipeDeck
      items={survey.items}
      index={index}
      onIndexChange={onIndexChange}
      renderItem={renderCard}
      label={copy.deckLabel}
      prevLabel={copy.prevQuestion}
      nextLabel={copy.nextQuestion}
      statusLabel={copy.questionOf(index + 1, total)}
      /* 이전/다음 버튼은 TopBar 에 있다 (Figma `179:1772`/`179:1775`). 덱 안에 중복 배치하지 않는다. */
      controls="none"
    />
  );
}
