/**
 * draft 응답 → `POST /v1/onboarding/submit` payload — **순수 함수**.
 *
 * - Trial 로컬 draft 도 **같은 요청 1회**로 전송된다 (C-12 · AC-2-26·AC-2-28).
 * - 필수 문항(질문지 Q1 · Q4 · Q2 — `S2-ONB-1`)이 비어 있으면 그 **단계**를 `missing` 에 담아
 *   제출을 막는다. 무엇이 필수인지는 이 파일이 아니라 **instrument** 가 정한다
 *   (`unansweredRequiredQuestions`) — 필수 목록을 여기에 옮겨 적지 않는다.
 * - 선택 문항(Q3)은 응답이 없어도 제출된다. 서버 schema 가 배열 필드를 요구하므로
 *   **빈 배열**로 채운다 — "응답 없음" 과 "필드 누락" 을 구분한다.
 * - Step 5 는 10문항 **전부**가 있어야 한다 (`not_observed` 포함).
 * - 수집에 쓰인 instrument 참조를 함께 보낸다 (결정 **D-A** 구조 제약 ④).
 */
import {
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
    childInfo.gender === undefined ||
    childInfo.languageEnvironment === undefined
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
      child_info: childInfo,
      temperament: answers.temperament ?? {},
      books: {
        favoriteBooks: answers.books?.favoriteBooks ?? [],
        homeBooks: answers.books?.homeBooks ?? [],
        topicTags: answers.books?.topicTags ?? [],
      },
      goals: { growthGoals: answers.goals?.growthGoals ?? [] },
      capability_items: capabilityItems,
    },
  };

  const parsed = createSubmitOnboardingRequestSchema(now).safeParse(candidate);

  // 여기서 실패하면 Step 1 값이 범위를 벗어난 경우다 — 해당 단계로 되돌린다.
  return parsed.success
    ? { ok: true, request: parsed.data }
    : { ok: false, missing: ['child_info'] };
}
