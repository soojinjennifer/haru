/**
 * Trial 구간의 **기본 instrument** — 결정 **D-A** 구조 제약 ②·③.
 *
 * ```
 * contracts 구조(코드·순서·선택 규칙)  +  copy 모듈 문구  =  OnboardingInstrument
 * ```
 *
 * 왜 필요한가: 가입 전(Trial) 구간은 **서버 요청이 0건**이라(C-12 · AC-2-27)
 * `GET /v1/onboarding` 으로 문항을 받아올 수 없다. 그 구간에서도 화면이 "문항을 데이터로"
 * 다루도록, 같은 `OnboardingInstrument` 모양을 기기에서 조립한다.
 *
 * **서버 값이 있으면 언제나 서버 값이 이긴다** (`useOnboardingInstrument`). 그래서 화면 입장에서
 * 문항의 출처는 항상 instrument 하나이고, Backend 가 문항을 교체해도 화면 코드는 바뀌지 않는다.
 *
 * 이 파일은 **문항 목록을 다시 쓰지 않는다** — `ONBOARDING_CHOICE_QUESTIONS` ·
 * `BASELINE_ITEM_BLUEPRINT` 를 그대로 쓰고 문구만 붙인다.
 */
import {
  BASELINE_INSTRUMENT_CODE,
  BASELINE_ITEM_BLUEPRINT,
  buildOnboardingQuestions,
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  OnboardingInstrumentSchema,
  SURVEY_ANSWER_VALUES,
  type OnboardingInstrument,
} from '@haru/contracts';

import { onboardingCopy } from '../copy';

/** Baseline instrument 문구 버전. contracts 구조 버전과 별개로 움직인다. */
export const DEFAULT_BASELINE_VERSION = '1.0.0';

/**
 * Trial 구간 소요 시간 안내값 (`R-03`). 서버 instrument 가 있으면 그 값이 이긴다.
 * Figma `243:1147` "About 1 minutes"(오타) · `179:1748` "About 3 minutes" 실측.
 */
export const DEFAULT_ONBOARDING_ESTIMATES = { profileMinutes: 1, surveyMinutes: 3 } as const;

function buildDefaultInstrument(): OnboardingInstrument {
  const fallback = onboardingCopy.baselineFallback;

  return OnboardingInstrumentSchema.parse({
    code: ONBOARDING_INSTRUMENT_CODE,
    version: ONBOARDING_INSTRUMENT_VERSION,
    /**
     * Q5(`books_and_interests.owned_books`)는 선택지가 **책 카탈로그**이고 Trial 구간에는
     * 서버 요청이 0건이라(AC-2-27) 카탈로그를 받아올 수 없다. 그래서 가입 전에는 Q5 카드가
     * 없고, 카드 수는 파생값이라 자동으로 하나 줄어든다 (`§11.11` · Design Spec §10-3).
     * 가입·동의 이후 `GET /v1/onboarding` 이 카탈로그를 포함한 instrument 를 내려준다.
     */
    questions: buildOnboardingQuestions(),
    estimates: DEFAULT_ONBOARDING_ESTIMATES,
    survey: {
      code: BASELINE_INSTRUMENT_CODE,
      version: DEFAULT_BASELINE_VERSION,
      stem: fallback.stem,
      scaleLabels: SURVEY_ANSWER_VALUES.map((value) => ({
        value,
        label: fallback.scaleLabels[value],
      })),
      items: BASELINE_ITEM_BLUEPRINT.map((item) => ({
        ...item,
        prompt: fallback.items[item.itemCode],
      })),
    },
  });
}

/**
 * Trial 기본 instrument. 모듈 로드 시 한 번 parse 하므로, 문구·구조가 어긋나면
 * 테스트가 즉시 실패한다 (화면이 깨진 instrument 를 만나지 않는다).
 */
export const DEFAULT_ONBOARDING_INSTRUMENT: OnboardingInstrument = buildDefaultInstrument();
