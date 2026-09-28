/**
 * Step 2~4 본문 — **instrument 를 순회해 렌더한다** (결정 **D-A** 구조 제약 ②·③).
 *
 * 이 컴포넌트에는 문항이 하나도 적혀 있지 않다. 문항이 늘거나 줄거나 순서가 바뀌어도
 * 여기를 고치지 않는다. 선택 규칙(단일/복수·상한·배타)도 contracts 의 순수 함수가 판단한다.
 *
 * - 단일 선택 → `RadioGroup variant="card"` (Design Spec §2.10 Step 2)
 * - 복수 선택 → `Chip` wrap (선택 시 check 아이콘 병행 — 색 단독 구분 금지, Stage 1 §4.16)
 */
import { Chip, RadioGroup, Text } from '@haru/ui';
import {
  applyChoiceAnswer,
  readChoiceAnswer,
  toggleChoiceSelection,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type OnboardingStep,
} from '@haru/contracts';

import { questionsForStep, type ResolvedChoiceQuestion } from '../model/instrumentView';

export interface ChoiceQuestionListProps {
  instrument: OnboardingInstrument;
  step: OnboardingStep;
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
}

function QuestionBlock({
  question,
  answers,
  onChange,
}: {
  question: ResolvedChoiceQuestion;
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
}) {
  const selected = readChoiceAnswer(answers, question.questionId);

  function commit(codes: readonly string[]): void {
    onChange(applyChoiceAnswer(answers, question.questionId, codes));
  }

  return (
    <div className="flex flex-col gap-3">
      {question.selection === 'single' ? (
        <RadioGroup
          legend={question.prompt}
          name={question.questionId}
          variant="card"
          /*
            필수 문항이면 `aria-required` 로 알린다 (`S2-ONB-1`, §2.9). 필수 목록을 여기에
            적지 않는다 — instrument 의 `required` 값만 읽는다. Chip 그룹(아래)은
            `role="group"` 이라 `aria-required` 가 유효하지 않아 보조 문구가 대신한다.
          */
          required={question.required}
          value={selected[0] ?? null}
          options={question.options.map((option) => ({
            value: option.code,
            label: option.label,
          }))}
          onChange={(value) => {
            commit(toggleChoiceSelection(question.question, selected, value));
          }}
        />
      ) : (
        <fieldset className="haru-choice-group">
          <legend className="haru-choice-group__legend">
            <Text variant="headline" tone="strong" as="span">
              {question.prompt}
            </Text>
          </legend>
          <div className="haru-choice-group__chips">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.code);

              return (
                <Chip
                  key={option.code}
                  label={option.label}
                  selected={isSelected}
                  onToggle={() => {
                    commit(toggleChoiceSelection(question.question, selected, option.code));
                  }}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {question.description === undefined ? null : (
        <Text variant="caption-1" tone="secondary">
          {question.description}
        </Text>
      )}
    </div>
  );
}

export function ChoiceQuestionList({
  instrument,
  step,
  answers,
  onChange,
}: ChoiceQuestionListProps) {
  const questions = questionsForStep(instrument, step);

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {questions.map((question) => (
        <QuestionBlock
          key={question.questionId}
          question={question}
          answers={answers}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
