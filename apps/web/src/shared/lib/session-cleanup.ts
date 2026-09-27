/**
 * 로그아웃 시 이 기기에 남는 것을 정리한다 — Plan §5.4 · §5.5 "로컬 데이터", **AC-2-29**.
 *
 * `features/settings` 가 `features/auth` 를 import 하지 않도록(= feature 간 직접 의존 금지,
 * `.claude/rules/architecture.md` §3) **순수 오케스트레이션 함수 + 주입**으로 둔다.
 * 여기에는 React · Router · TanStack Query 의존이 없다.
 *
 * 정리 대상 3종
 * | 대상 | 이유 |
 * |---|---|
 * | 인증 세션 (`AuthGateway.signOut()`) | 로그아웃 그 자체 |
 * | 로컬 온보딩 draft (`haru.onboarding.draft.v1`) | **아동 데이터**다 — 결정 `D-3` 삭제 시점 ② |
 * | Query 캐시 | 이전 사용자의 서버 상태가 다음 화면에 비치지 않게 한다 (S2-R6) |
 *
 * **로컬 정리는 `signOut()` 실패와 무관하게 수행한다.** 사용자가 이미 "이 기기에서 나간다"고
 * 확인했고, 남은 아동 데이터를 기기에 두는 쪽이 더 나쁜 결과다. 실패는 그대로 던져서 화면이
 * 안내할 수 있게 한다(세션이 남아 있을 수 있으므로 성공으로 위장하지 않는다).
 */

/** 이 함수가 쓰는 부분만 받는다 — 테스트가 전체 Gateway 를 흉내 낼 필요가 없다. */
export interface SessionCleanupDeps {
  /** `AuthGateway` 의 `signOut` 만 필요하다. */
  signOut: () => Promise<void>;
  /** `OnboardingDraftStore` 의 `clear` 만 필요하다 (결정 `D-3`). */
  clearOnboardingDraft: () => void;
  /** `QueryClient.clear` 만 필요하다. */
  clearQueryCache: () => void;
}

export async function performSessionCleanup(deps: SessionCleanupDeps): Promise<void> {
  try {
    await deps.signOut();
  } finally {
    // 순서 주의: draft(아동 데이터) 를 먼저 지운다. 캐시 정리는 재조회를 유발할 수 있다.
    deps.clearOnboardingDraft();
    deps.clearQueryCache();
  }
}
