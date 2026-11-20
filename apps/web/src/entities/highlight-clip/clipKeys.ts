/**
 * `highlight-clips` query key factory — `.claude/rules/frontend.md` §4 · Stage 7 Plan §5.2.
 *
 * | key | 재사용 | 무효화 |
 * |---|---|---|
 * | `playback(clipId)` | `expiresAt − 30s` 전까지 (`isSignedUrlReusable`) | 만료 · 미디어 오류 시 1회 재발급 (`usePlaybackUrl.fetch`) |
 *
 * 로그아웃(`useSignOut` → `QueryClient.clear()`)이 함께 지운다 — 클립 URL 이 메모리에 남지 않는다 (Plan §5.6).
 */
export const clipKeys = {
  all: ['highlight-clips'] as const,
  /** `GET /v1/highlight-clips/:clipId/playback-url` (C7-8). */
  playback: (clipId: string) => [...clipKeys.all, 'playback', clipId] as const,
} as const;

export type ClipPlaybackQueryKey = ReturnType<typeof clipKeys.playback>;
