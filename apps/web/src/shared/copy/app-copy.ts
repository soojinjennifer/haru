/**
 * 앱 셸 문구 — `.claude/rules/frontend.md` §8.
 *
 * - 사용자 노출 언어는 영어다.
 * - 진단·판정·비교 표현을 쓰지 않는다. 관찰·안내 언어만 사용한다.
 * - 화면·기능 문구는 해당 Stage 의 feature copy 모듈이 소유한다. 여기에는
 *   route 와 무관한 **앱 셸 공통 문구**만 둔다.
 */
export const appCopy = {
  appName: 'HARU',

  /** 앱 전체가 실패했을 때 (AppErrorBoundary) */
  appError: {
    title: 'Something went wrong',
    description: 'The app ran into an unexpected problem. Reloading usually helps.',
    retryLabel: 'Reload HARU',
  },

  /** 한 화면만 실패했을 때 (RouteErrorBoundary) */
  routeError: {
    title: 'This screen could not load',
    description: 'You can try again. Nothing you have saved is affected.',
    retryLabel: 'Try again',
  },

  notFound: {
    title: 'Page not found',
    description: 'The page you were looking for is not available.',
    actionLabel: 'Go to home',
  },

  /** RouteGuard 가 판정을 기다리는 동안 (Stage 2에서 실제 판정이 붙는다) */
  guard: {
    loadingLabel: 'Loading',
  },

  /** Stage 2 에서 Home 화면 골격으로 교체되는 임시 화면 (Plan §3.1) */
  placeholder: {
    title: 'HARU',
    description: 'The app shell is ready. Screens arrive in the next stages.',
    note: 'Stage 1 — Frontend Foundation',
  },

  /** 스킵 링크 · 랜드마크 이름 */
  landmarks: {
    mainContent: 'Main content',
  },
} as const;
