/**
 * 데이터 관리 query key factory (Stage 8 Plan §5.2 · `API_CONTRACTS.md` §5.4 `deletion-*`).
 *
 * | key | endpoint |
 * |---|---|
 * | `summary()` | `GET /v1/data-management` |
 * | `request(id)` | `GET /v1/data-deletion-requests/:id` (진행 상태 폴링) |
 *
 * 세션별 녹음 목록은 세션 목록 key(`sessionKeys.list(childId, { hasRecording: true })`)를 쓴다 — 같은 endpoint 다.
 */
export const dataManagementKeys = {
  all: ['data-management'] as const,
  summary: () => [...dataManagementKeys.all, 'summary'] as const,
  request: (requestId: string) => [...dataManagementKeys.all, 'request', requestId] as const,
} as const;

export type DataManagementSummaryQueryKey = ReturnType<typeof dataManagementKeys.summary>;
export type DeletionRequestQueryKey = ReturnType<typeof dataManagementKeys.request>;
