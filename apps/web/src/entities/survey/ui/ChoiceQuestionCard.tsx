/**
 * 선택형 문항 카드 1장 — 재구성 Design Spec §3.6.
 *
 * 이 컴포넌트에는 문항이 하나도 적혀 있지 않다. 문항·선택지·선택 규칙(단일/복수·상한·배타)은
 * instrument 와 contracts 순수 함수가 정한다 (결정 **D-A** 구조 제약 ②·③).
 *
 * - 단일 선택 → `RadioGroup variant="card"`
 * - 복수 선택 → `CheckboxGroup variant="card"` (Q2 · Q3 · Q5 가 **같은 variant** 를 공유한다)
 *
 * 상한 초과 처리는 **문항마다 다르고 그것이 의도된 차이다** (`§11.15`): Q2 · Q3 는 가장 오래된
 * 선택을 교체하며(`toggleChoiceSelection`) 나머지 선택지를 `disabled` 로 만들지 않는다.
 */
import { CheckboxGroup, RadioGroup } from '@haru/ui';
import { useId, useRef } from 'react';
import {
  applyChoiceAnswer,
  readChoiceAnswer,
  toggleChoiceSelection,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import { SurveyQuestionCard } from '../../character';
import { surveyCardCopy } from '../copy';
import type { ResolvedChoiceQuestion } from '../instrumentView';

export interface ChoiceQuestionCardProps {
  question: ResolvedChoiceQuestion;
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
  /** 카드 안쪽 통산 카운터 문구. */
  counter: string;
  /** 필수 미응답으로 전진이 막혔을 때의 사유 (§3.2). */
  blockedReason?: string | undefined;
  /**
   * 포인터로 **단일 선택**을 했을 때 호출된다 (자동 전진 — §14.1).
   * 복수 선택·키보드 선택에서는 호출되지 않는다.
   */
  onSingleChoiceCommitted?: (() => void) | undefined;
}

export function ChoiceQuestionCard({
  question,
  answers,
  onChange,
  counter,
  blockedReason,
  onSingleChoiceCommitted,
}: ChoiceQuestionCardProps) {
  const copy = surveyCardCopy.deck;
  const descriptionId = useId();
  const blockedReasonId = useId();
  const selected = readChoiceAnswer(answers, question.questionId);

  /**
   * 마지막 입력이 **포인터**였는가. `RadioGroup` 은 native radio 라 방향키로도 선택이 바뀌는데,
   * 그때 자동 전진하면 키보드 사용자가 선택을 끝낼 수 없다 (§14.3). 그래서 포인터로 눌렀을
   * 때만 전진 신호를 올린다.
   */
  const pointerSelectRef = useRef(false);

  function commit(codes: readonly string[]): void {
    onChange(applyChoiceAnswer(answers, question.questionId, codes));
  }

  const describedBy = [
    question.description === undefined ? undefined : descriptionId,
    blockedReason === undefined ? undefined : blockedReasonId,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <SurveyQuestionCard
      counter={counter}
      question={question.prompt}
      description={question.description}
      descriptionId={descriptionId}
      clearLabel={copy.clearAnswer}
      blockedReason={blockedReason}
      blockedReasonId={blockedReasonId}
      onClear={
        selected.length === 0
          ? undefined
          : () => {
              // 해제는 자동 전진을 유발하지 않는다 (§14.2-4).
              commit([]);
            }
      }
    >
      {question.selection === 'single' ? (
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
            legend={question.prompt}
            name={question.questionId}
            variant="card"
            /*
              필수 문항이면 `aria-required` 로 알린다 (`S2-ONB-1`). 필수 목록을 여기에 적지
              않는다 — instrument 의 `required` 값만 읽는다.
            */
            required={question.required}
            value={selected[0] ?? null}
            describedBy={describedBy.length > 0 ? describedBy : undefined}
            options={question.options.map((option) => ({
              value: option.code,
              label: option.label,
            }))}
            onChange={(value) => {
              const byPointer = pointerSelectRef.current;
              pointerSelectRef.current = false;
              const next = toggleChoiceSelection(question.question, selected, value);
              commit(next);

              // 해제(빈 배열)는 전진을 유발하지 않는다 (§14.2-4).
              if (byPointer && next.length > 0) onSingleChoiceCommitted?.();
            }}
          />
        </div>
      ) : (
        <div className="haru-survey-options">
          <CheckboxGroup
            legend={question.prompt}
            variant="card"
            values={selected}
            describedBy={describedBy.length > 0 ? describedBy : undefined}
            options={question.options.map((option) => ({
              value: option.code,
              label: option.label,
              ...(option.exclusive ? { exclusive: true } : {}),
            }))}
            onToggle={(value) => {
              commit(toggleChoiceSelection(question.question, selected, value));
            }}
          />
        </div>
      )}
    </SurveyQuestionCard>
  );
}
