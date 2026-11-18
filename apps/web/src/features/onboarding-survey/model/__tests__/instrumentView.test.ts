/**
 * instrument → 화면 변환 — 결정 **D-A** 구조 제약 ①②③ 검증.
 *
 * 핵심: **문항을 바꿔도 화면 코드를 고치지 않는다.** 여기에서는 그 근거가 되는 순수 함수가
 * 임의의 instrument 를 그대로 받아들이는지 확인한다.
 */
import { describe, expect, it } from 'vitest';
import { ONBOARDING_CHOICE_QUESTIONS, type ChoiceQuestion } from '@haru/contracts';

import { onboardingCopy } from '../../copy';
import { DEFAULT_ONBOARDING_INSTRUMENT } from '../defaultInstrument';
import { questionsForStep, resolveQuestion } from '../../../../entities/survey';

function questionOf(id: string): ChoiceQuestion {
  const found = ONBOARDING_CHOICE_QUESTIONS.find((question) => question.questionId === id);
  if (found === undefined) throw new Error(`missing ${id}`);
  return found;
}

describe('문구 해석 순서 (구조 제약 ①)', () => {
  it('instrument 에 문구가 없으면 copy 모듈에서 가져온다', () => {
    const resolved = resolveQuestion(questionOf('growing_together.growth_goals'));

    expect(resolved?.prompt).toBe(onboardingCopy.questions['growing_together.growth_goals'].prompt);
    expect(resolved?.options[0]?.label).toBe(
      onboardingCopy.choiceOptions['growing_together.growth_goals'].emotion_regulation,
    );
  });

  it('instrument 가 문구를 내려주면 그것이 이긴다 (서버 주도 교체 경로)', () => {
    const resolved = resolveQuestion({
      ...questionOf('growing_together.growth_goals'),
      prompt: 'Server-owned prompt',
      options: [
        { code: 'emotion_regulation', label: 'Server label' },
        { code: 'intrinsic_motivation' },
      ],
    });

    expect(resolved?.prompt).toBe('Server-owned prompt');
    expect(resolved?.options[0]?.label).toBe('Server label');
  });

  it('문구를 해석할 수 없는 선택지는 렌더하지 않는다 (사용자에게 코드를 보이지 않는다)', () => {
    const resolved = resolveQuestion({
      ...questionOf('growing_together.growth_goals'),
      options: [{ code: 'emotion_regulation' }, { code: 'brand_new_code_without_label' }],
    });

    expect(resolved?.options.map((option) => option.code)).toStrictEqual(['emotion_regulation']);
  });

  it('선택지 문구를 모두 해석할 수 없으면 문항 자체를 그리지 않는다', () => {
    const resolved = resolveQuestion({
      ...questionOf('growing_together.growth_goals'),
      options: [{ code: 'unknown_a' }, { code: 'unknown_b' }],
    });

    expect(resolved).toBeNull();
  });
});

describe('단계별 문항 (구조 제약 ②)', () => {
  it('`order` 순으로 돌려준다', () => {
    const questions = questionsForStep(DEFAULT_ONBOARDING_INSTRUMENT, 'reading_together');

    expect(questions.map((question) => question.questionId)).toStrictEqual([
      'reading_together.story_comfort',
      'reading_together.read_aloud_behavior',
    ]);
  });

  it('order 가 뒤섞여 들어와도 정렬해서 돌려준다', () => {
    const questions = questionsForStep(
      {
        ...DEFAULT_ONBOARDING_INSTRUMENT,
        questions: [
          { ...questionOf('reading_together.read_aloud_behavior'), order: 1 },
          { ...questionOf('reading_together.story_comfort'), order: 2 },
        ],
      },
      'reading_together',
    );

    expect(questions.map((question) => question.questionId)).toStrictEqual([
      'reading_together.read_aloud_behavior',
      'reading_together.story_comfort',
    ]);
  });

  it('문항이 없는 단계는 빈 배열이다 (Step 1 · Step 5 는 문항 집합이 아니다)', () => {
    expect(questionsForStep(DEFAULT_ONBOARDING_INSTRUMENT, 'child_info')).toStrictEqual([]);
    expect(questionsForStep(DEFAULT_ONBOARDING_INSTRUMENT, 'capability_items')).toStrictEqual([]);
  });

  it('문항이 늘어난 instrument 도 그대로 반영한다', () => {
    const questions = questionsForStep(
      {
        ...DEFAULT_ONBOARDING_INSTRUMENT,
        questions: [
          ...ONBOARDING_CHOICE_QUESTIONS,
          { ...questionOf('growing_together.growth_goals'), step: 'reading_together', order: 9 },
        ],
      },
      'reading_together',
    );

    expect(questions).toHaveLength(3);
  });
});
