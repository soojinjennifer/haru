/**
 * Trial 기본 instrument — 결정 **D-A** 구조 제약 ③ 의 Trial 대응분.
 *
 * Mock 응답과 **구조가 같아야** 한다: Trial 에서 시작한 응답이 가입 후 서버 instrument 로
 * 이어져도 문항 코드가 어긋나지 않는다는 뜻이다. 문구는 서버가 소유하므로 비교하지 않는다.
 */
import { describe, expect, it } from 'vitest';
import {
  BASELINE_ITEM_BLUEPRINT,
  ONBOARDING_CHOICE_QUESTIONS,
  ONBOARDING_INSTRUMENT_CODE,
  OnboardingInstrumentSchema,
  SURVEY_ITEM_COUNT,
  SURVEY_SCALE_LABEL_COUNT,
} from '@haru/contracts';

import { createOnboardingInstrumentFixture } from '../../../../mocks/fixtures/onboarding';
import { DEFAULT_ONBOARDING_INSTRUMENT } from '../defaultInstrument';

const mock = createOnboardingInstrumentFixture();

describe('기본 instrument', () => {
  it('contracts schema 를 통과한다', () => {
    expect(OnboardingInstrumentSchema.safeParse(DEFAULT_ONBOARDING_INSTRUMENT).success).toBe(true);
    expect(DEFAULT_ONBOARDING_INSTRUMENT.code).toBe(ONBOARDING_INSTRUMENT_CODE);
  });

  it('문항 구조를 다시 쓰지 않고 contracts 정의를 그대로 쓴다', () => {
    expect(DEFAULT_ONBOARDING_INSTRUMENT.questions).toStrictEqual(ONBOARDING_CHOICE_QUESTIONS);
  });

  it('Step 5 는 10문항 · 척도 6개다 (C-8)', () => {
    expect(DEFAULT_ONBOARDING_INSTRUMENT.survey.items).toHaveLength(SURVEY_ITEM_COUNT);
    expect(DEFAULT_ONBOARDING_INSTRUMENT.survey.scaleLabels).toHaveLength(SURVEY_SCALE_LABEL_COUNT);
    expect(DEFAULT_ONBOARDING_INSTRUMENT.survey.items.map((item) => item.itemCode)).toStrictEqual(
      BASELINE_ITEM_BLUEPRINT.map((item) => item.itemCode),
    );
  });

  it('모든 문항에 문구가 있다 (빈 문구로 화면에 나가지 않는다)', () => {
    for (const item of DEFAULT_ONBOARDING_INSTRUMENT.survey.items) {
      expect(item.prompt.length).toBeGreaterThan(10);
    }
    for (const scale of DEFAULT_ONBOARDING_INSTRUMENT.survey.scaleLabels) {
      expect(scale.label.length).toBeGreaterThan(0);
    }
  });
});

describe('Mock 응답과의 구조 일치', () => {
  it('선택형 문항 id · 순서 · 선택 규칙이 같다', () => {
    expect(mock.questions).toStrictEqual(DEFAULT_ONBOARDING_INSTRUMENT.questions);
  });

  it('Step 5 문항 코드 · 역량 · 순서가 같다', () => {
    const shape = (items: readonly { itemCode: string; capability: string; order: number }[]) =>
      items.map(({ itemCode, capability, order }) => ({ itemCode, capability, order }));

    expect(shape(mock.survey.items)).toStrictEqual(
      shape(DEFAULT_ONBOARDING_INSTRUMENT.survey.items),
    );
  });

  it('instrument code · 문항 집합 버전이 같다 (Trial → 가입 전환에서 어긋나지 않는다)', () => {
    expect(mock.code).toBe(DEFAULT_ONBOARDING_INSTRUMENT.code);
    expect(mock.version).toBe(DEFAULT_ONBOARDING_INSTRUMENT.version);
  });
});
