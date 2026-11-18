/**
 * 역량 문항 카드 1장 — Design Spec §2.10 Step 5 (Figma `179:1770` + `C13-08`).
 *
 * **문항 문구·척도 라벨은 전부 instrument 응답 값이다** (AC-2-24). 이 파일에는 문항이 없다.
 *
 * 비채점 6번째 옵션 (`C13-08`)
 * - `variant='muted'` + 위쪽 구분선 + "This one isn't scored." caption (`haru-survey-options`).
 * - **선택 상태 표시는 1~5 와 완전히 같다** — 결측이지 낮은 점수가 아니다 (C-8).
 */
import { RadioGroup } from '@haru/ui';
import { useId, useRef } from 'react';
import {
  SURVEY_ANSWER_NOT_OBSERVED,
  SurveyAnswerValueSchema,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type SurveyAnswerValue,
  type SurveyItem,
} from '@haru/contracts';

import { SurveyQuestionCard } from '../../character';
import { surveyCardCopy } from '../copy';
import { clearSurveyAnswer, setSurveyAnswer, surveyAnswerFor } from '../surveyAnswers';

export interface CapabilityItemCardProps {
  instrument: OnboardingInstrument;
  item: SurveyItem;
  /** 공통 도입 문장 (`instrument.survey.stem`). */
  stem: string;
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
  counter: string;
  /** 포인터로 선택했을 때 (자동 전진 — §14.1). 역량 문항은 전부 단일 선택이다. */
  onSingleChoiceCommitted?: (() => void) | undefined;
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

export function CapabilityItemCard({
  instrument,
  item,
  stem,
  answers,
  onChange,
  counter,
  onSingleChoiceCommitted,
}: CapabilityItemCardProps) {
  const copy = surveyCardCopy.deck;
  const captionId = useId();
  const eyebrowId = useId();
  const pointerSelectRef = useRef(false);
  const current = surveyAnswerFor(answers, item.itemCode);

  return (
    <SurveyQuestionCard
      counter={counter}
      eyebrow={stem}
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
      <div
        className="haru-survey-options"
        /*
          **관찰만** 하는 핸들러다 (이 div 는 상호작용 요소가 아니다). capture 단계로 받아
          native radio 의 `change` 보다 먼저 입력 종류를 기록한다.
        */
        onPointerDownCapture={() => {
          pointerSelectRef.current = true;
        }}
        onKeyDownCapture={() => {
          pointerSelectRef.current = false;
        }}
      >
        <RadioGroup
          legend={item.prompt}
          name={`survey-${item.itemCode}`}
          variant="card"
          value={toRadioValue(current)}
          describedBy={`${eyebrowId} ${captionId}`}
          options={instrument.survey.scaleLabels.map((scale) => ({
            value: String(scale.value),
            label: scale.label,
            // 6번째(비채점)만 재질을 달리한다 — 위계를 낮추지 않는다 (C13-08).
            ...(scale.value === SURVEY_ANSWER_NOT_OBSERVED ? { variant: 'muted' as const } : {}),
          }))}
          onChange={(raw) => {
            const byPointer = pointerSelectRef.current;
            pointerSelectRef.current = false;
            onChange(setSurveyAnswer(answers, instrument, item.itemCode, fromRadioValue(raw)));

            if (byPointer) onSingleChoiceCommitted?.();
          }}
        />
        <p className="haru-survey-caption" id={captionId}>
          {copy.notScoredCaption}
        </p>
      </div>
    </SurveyQuestionCard>
  );
}
