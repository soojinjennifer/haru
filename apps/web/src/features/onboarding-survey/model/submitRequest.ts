/**
 * draft 응답 → `POST /v1/onboarding/submit` payload — **순수 함수**.
 *
 * - Trial 로컬 draft 도 **같은 요청 1회**로 전송된다 (C-12 · AC-2-26·AC-2-28).
 * - 필수 문항(질문지 Q1 · Q4 · Q2 — `S2-ONB-1`)이 비어 있으면 그 **단계**를 `missing` 에 담아
 *   제출을 막는다. 무엇이 필수인지는 이 파일이 아니라 **instrument** 가 정한다
 *   (`unansweredRequiredQuestions`) — 필수 목록을 여기에 옮겨 적지 않는다.
 * - 선택 문항(Q3 · Q5 · 좋아하는 책)은 응답이 없어도 제출된다. 서버 schema 가 배열 필드를 요구하므로
 *   **빈 배열**로 채운다 — "응답 없음" 과 "필드 누락" 을 구분한다.
 * - Step 1 의 **언어 환경은 선택**이며, 비어 있으면 `DEFAULT_LANGUAGE_ENVIRONMENT`(영어)로 채운다
 *   (사용자 결정 2026-10-04). 채우는 곳은 **여기 한 곳**이다 — draft 저장은 해제 상태를 보존한다.
 * - Step 5 는 10문항 **전부**가 있어야 한다 (`not_observed` 포함).
 * - 수집에 쓰인 instrument 참조를 함께 보낸다 (결정 **D-A** 구조 제약 ④).
 */
import {
  DEFAULT_LANGUAGE_ENVIRONMENT,
  createSubmitOnboardingRequestSchema,
  instrumentRefOf,
  stepsMissingRequiredAnswers,
  SURVEY_ITEM_COUNT,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
  type OnboardingStep,
  type SubmitOnboardingRequest,
} from '@haru/contracts';

export type SubmitBuildResult =
  | { ok: true; request: SubmitOnboardingRequest }
  | { ok: false; missing: readonly OnboardingStep[] };

export function buildSubmitRequest(
  instrument: OnboardingInstrument,
  answers: OnboardingDraftAnswers,
  now: Date,
): SubmitBuildResult {
  const missing: OnboardingStep[] = [];

  const childInfo = answers.child_info;
  if (
    childInfo?.firstName === undefined ||
    childInfo.birthYearMonth === undefined ||
    childInfo.gender === undefined
  ) {
    missing.push('child_info');
  }

  // 필수 문항이 비어 있는 단계 (`S2-ONB-1`) — 단계 순서대로 온다.
  for (const step of stepsMissingRequiredAnswers(instrument, answers)) {
    if (!missing.includes(step)) missing.push(step);
  }

  const capabilityItems = answers.capability_items;
  if (capabilityItems === undefined || capabilityItems.answers.length < SURVEY_ITEM_COUNT) {
    missing.push('capability_items');
  }

  if (missing.length > 0) return { ok: false, missing };

  const candidate = {
    instrument: instrumentRefOf(instrument),
    answers: {
      child_info: {
        ...childInfo,
        /*
          언어는 **선택 항목**이다 (사용자 결정 2026-10-04). 비어 있으면 여기 — **제출 경계** —
          에서만 기본값으로 채운다. 로컬 draft 저장 시점에 채우면 사용자가 해제한 상태를
          저장소가 영어로 되돌려 해제가 불가능해진다.
        */
        languageEnvironment:
          childInfo?.languageEnvironment === undefined || childInfo.languageEnvironment.length === 0
            ? [...DEFAULT_LANGUAGE_ENVIRONMENT]
            : childInfo.languageEnvironment,
      },
      reading_together: answers.reading_together ?? {},
      books_and_interests: {
        favoriteBooks: answers.books_and_interests?.favoriteBooks ?? [],
        ownedBooks: answers.books_and_interests?.ownedBooks ?? [],
        topicTags: answers.books_and_interests?.topicTags ?? [],
      },
      growing_together: { growthGoals: answers.growing_together?.growthGoals ?? [] },
      capability_items: capabilityItems,
    },
  };

  const parsed = createSubmitOnboardingRequestSchema(now).safeParse(candidate);

  // 여기서 실패하면 Step 1 값이 범위를 벗어난 경우다 — 해당 단계로 되돌린다.
  return parsed.success
    ? { ok: true, request: parsed.data }
    : { ok: false, missing: ['child_info'] };
}
