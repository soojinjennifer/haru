/**
 * `child-profile` · `survey-update` query key factory — `.claude/rules/frontend.md` §4 (Stage 6 Plan §5.2).
 *
 * 무효화 범위도 여기서 정한다. 로그아웃은 Query 캐시 **전체**를 비운다(기존 `useSignOut`) — 이 key 들도 함께 사라진다.
 */
export const childProfileKeys = {
  all: ['child-profile'] as const,
  /** `GET /v1/children/:childId/profile` — 아이별 캐시. 프로필 화면 2모드의 유일한 데이터 출처 (`D6-5`). */
  detail: (childId: string) => [...childProfileKeys.all, 'detail', childId] as const,
  /** `PATCH /v1/children/:childId` mutation 식별 (진행 중 여부 조회). */
  update: (childId: string) => [...childProfileKeys.all, 'update', childId] as const,
  /** `PUT /v1/children/:childId/growth-capability` mutation 식별. */
  growthCapability: (childId: string) =>
    [...childProfileKeys.all, 'growth-capability', childId] as const,
} as const;

export type ChildProfileQueryKey = ReturnType<typeof childProfileKeys.detail>;

export const surveyUpdateKeys = {
  all: ['survey-update'] as const,
  /** `GET /v1/children/:childId/survey-update` — 서버 draft(정본). 제출 성공 시 제거한다. */
  state: (childId: string) => [...surveyUpdateKeys.all, 'state', childId] as const,
  /** `POST …/survey-update/submit` mutation 식별. */
  submit: (childId: string) => [...surveyUpdateKeys.all, 'submit', childId] as const,
} as const;

export type SurveyUpdateStateQueryKey = ReturnType<typeof surveyUpdateKeys.state>;
