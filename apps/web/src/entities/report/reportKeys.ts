/** `reports` query key factory — `.claude/rules/frontend.md` §4 · Stage 7 Plan §5.2. */
export const reportKeys = {
  all: ['reports'] as const,
  /** `GET /v1/children/:childId/reports/overview` (C7-2). */
  overview: (childId: string) => [...reportKeys.all, 'overview', childId] as const,
  /** `GET /v1/children/:childId/reports` (C7-3, cursor). */
  list: (childId: string) => [...reportKeys.all, 'list', childId] as const,
  /** `GET /v1/reports/:reportId` (C7-4) — 발행 리포트는 불변 스냅샷이라 stale = Infinity (Plan §5.2). */
  detail: (reportId: string) => [...reportKeys.all, 'detail', reportId] as const,
  /**
   * `POST /v1/reports/:reportId/viewed` (C7-7) **시도 표식** — 요청을 이미 보냈는지만 담는다 (`S7-D`, AC-7-44).
   * 서버 응답이 아니다. StrictMode 이중 effect · 빠른 재진입에서 같은 화면이 두 번 보내지 않게 한다.
   * 로그아웃(`useSignOut` → `QueryClient.clear()`)이 함께 지운다.
   */
  viewed: (reportId: string) => [...reportKeys.all, 'viewed', reportId] as const,
  /**
   * 리포트 PDF 작업 (C7-6 · `S7-F`) — **카드 · 상세 두 진입점이 같은 키**를 본다 (Plan §5.2 · §5.3 · `N7-24`).
   * 서버 응답 캐시가 아니라 `features/report-pdf` 상태 머신이 소유하는 메모리 기록이다 (폴링 중 stale 0 —
   * 조회는 상태 머신이 직접 한다). 준비된 PDF `File` 도 여기(메모리)에만 있다 — 영속 저장 0 (Plan §5.6).
   * 로그아웃(`QueryClient.clear()`)이 함께 지운다.
   */
  pdf: (reportId: string) => [...reportKeys.all, 'pdf', reportId] as const,
} as const;

export type ReportOverviewQueryKey = ReturnType<typeof reportKeys.overview>;
export type ReportListQueryKey = ReturnType<typeof reportKeys.list>;
export type ReportDetailQueryKey = ReturnType<typeof reportKeys.detail>;
export type ReportPdfQueryKey = ReturnType<typeof reportKeys.pdf>;
