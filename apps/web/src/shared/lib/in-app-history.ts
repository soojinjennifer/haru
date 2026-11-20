/**
 * 앱 안 이전 기록이 있는가 — 뒤로 가기 목적지 판단용 (Stage 7 `N7-23` — deep link 진입 시 Back = 탭 루트).
 *
 * React Router 의 browser history 는 `history.state.idx` 에 **이 앱 세션 안의 위치**를 둔다 (첫 진입 = 0,
 * push 마다 +1, replace 는 유지). `idx > 0` 이면 `navigate(-1)` 이 앱 안 이전 화면으로 간다. 0 이거나 값이 없으면
 * (push 알림 · 새 탭 · 새로고침 직후 첫 화면) 뒤로 가면 앱 밖으로 나가므로 호출부가 정한 목적지로 보낸다.
 *
 * ── 로그인 복귀 진입 (`D7-7`, 2026-11-20 — `VG7-R-09` ⓑ) ──
 * 미인증 deep link → Welcome → Log in → 복귀(AC-7-46) 로 들어온 화면은 `idx > 0` 이지만, 앞에 있는 기록은 콘텐츠가 아니라
 * **인증 관문**이다. 복귀 이동이 router state 에 `AUTH_RETURN_STATE` 를 실으면(React Router 는 `history.state.usr` 에 둔다)
 * 이 함수는 그 진입을 "앱 안 기록 없음" 으로 본다 → 호출부의 deep link 목적지(`/progress`).
 * 표식은 플래그 1개뿐이다 — 경로 · id · PII 를 담지 않는다. 이 모듈은 표식 값을 정의할 뿐 `history.state` 에 직접 쓰지 않는다.
 */

/** 로그인 복귀 이동의 router state — `LogInPage` 가 복귀 경로로 보낼 때만 싣는다. */
export const AUTH_RETURN_STATE = { viaAuthReturn: true } as const;

function isAuthReturnState(usr: unknown): boolean {
  return (
    typeof usr === 'object' && usr !== null && 'viaAuthReturn' in usr && usr.viaAuthReturn === true
  );
}

export function hasInAppHistory(state: unknown = globalThis.history?.state): boolean {
  if (typeof state !== 'object' || state === null || !('idx' in state)) return false;
  if ('usr' in state && isAuthReturnState(state.usr)) return false;
  const { idx } = state;
  return typeof idx === 'number' && idx > 0;
}
