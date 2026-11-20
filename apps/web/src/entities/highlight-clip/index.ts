/** `entities/highlight-clip` 공개 진입점 — Stage 7 하이라이트 클립 (C7-5 · C7-8, `S7-E`). 상태 머신은 `features/highlight-clip-player`. */
export { clipKeys } from './clipKeys';
export type { ClipPlaybackQueryKey } from './clipKeys';
export {
  isClipRetentionExpired,
  isSignedUrlExpired,
  isSignedUrlReusable,
  SIGNED_URL_REUSE_MARGIN_MS,
} from './signedUrl';
export { usePlaybackUrl } from './usePlaybackUrl';
export type { PlaybackUrlHandle } from './usePlaybackUrl';
export { HighlightClipRow } from './HighlightClipRow';
export type { HighlightClipRowMessageTone, HighlightClipRowProps } from './HighlightClipRow';
