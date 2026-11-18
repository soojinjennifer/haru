/**
 * 재응답 draft → `POST /v1/children/:childId/survey-update/submit` payload — **순수 함수** (Stage 6 Plan §7 C-6 · C-7).
 *
 * 온보딩 `buildSubmitRequest` 와 같은 규칙에서 Step 1(아이 정보)만 뺐다 (C-7 — 아이 정보는 `PATCH` 경로):
 * - 필수 문항(질문지 Q1 · Q4 · Q2 — `S2-ONB-1`)이 비어 있으면 그 **단계**를 `missing` 에 담아 막는다. 무엇이 필수인지는
 *   **instrument** 가 정한다 (`stepsMissingRequiredAnswers`) — 필수 목록을 여기에 옮겨 적지 않는다.
 * - 선택 문항(Q3 · Q5 · 좋아하는 책)은 응답이 없어도 제출된다 — **빈 배열**로 채운다 ("응답 없음" ≠ "필드 누락").
 * - 역량 문항은 instrument 문항 **전부**가 있어야 한다 (`not_observed` 포함).
 * - 수집에 쓰인 instrument 참조를 함께 보낸다 (결정 **D-A** 구조 제약 ④).
 */
import {
  instrumentRefOf,
  stepsMissingRequiredAnswers,
  SubmitSurveyUpdateRequestSchema,
  SurveyUpdateStepSchema,
  type OnboardingInstrument,
  type SubmitSurveyUpdateRequest,
  type SurveyUpdateDraftAnswers,
  type SurveyUpdateStep,
} from '@haru/contracts';

import { unansweredCount } from '../../../entities/survey';

import { SURVEY_UPDATE_STEPS } from './steps';

export type SurveyUpdateSubmitBuildResult =
  | { ok: true; request: SubmitSurveyUpdateRequest }
  | { ok: false; missing: readonly SurveyUpdateStep[] };

export function buildSurveyUpdateSubmitRequest(
  instrument: OnboardingInstrument,
  answers: SurveyUpdateDraftAnswers,
): SurveyUpdateSubmitBuildResult {
  const missing: SurveyUpdateStep[] = [];

  for (const step of stepsMissingRequiredAnswers(instrument, answers)) {
    const parsed = SurveyUpdateStepSchema.safeParse(step);
    if (parsed.success && !missing.includes(parsed.data)) missing.push(parsed.data);
  }

  const capabilityItems = answers.capability_items;
  if (capabilityItems === undefined || unansweredCount(instrument, answers) > 0) {
    missing.push('capability_items');
  }

  if (missing.length > 0) {
    return {
      ok: false,
      missing: SURVEY_UPDATE_STEPS.filter((step) => missing.includes(step)),
    };
  }

  const parsed = SubmitSurveyUpdateRequestSchema.safeParse({
    instrument: instrumentRefOf(instrument),
    answers: {
      reading_together: answers.reading_together ?? {},
      books_and_interests: {
        favoriteBooks: answers.books_and_interests?.favoriteBooks ?? [],
        ownedBooks: answers.books_and_interests?.ownedBooks ?? [],
        topicTags: answers.books_and_interests?.topicTags ?? [],
      },
      growing_together: { growthGoals: answers.growing_together?.growthGoals ?? [] },
      capability_items: capabilityItems,
    },
  });

  // schema 가 거부하면 응답 묶음 자체가 불완전하다 — 첫 단계부터 다시 보게 한다.
  return parsed.success
    ? { ok: true, request: parsed.data }
    : { ok: false, missing: [SURVEY_UPDATE_STEPS[0] ?? 'reading_together'] };
}
