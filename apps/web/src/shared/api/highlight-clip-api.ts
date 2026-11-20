/**
 * `highlightClipApi` — 하이라이트 클립 재생 URL (`docs/API_CONTRACTS.md` §4 Stage 7 C7-8, FR-18).
 *
 * | 호출 | endpoint | IK | 주요 오류 |
 * |---|---|---|---|
 * | `getPlaybackUrl` | `GET /v1/highlight-clips/:clipId/playback-url` | — | `RECORDING_DELETED`(`details.reason?: 'deleted' \| 'expired'`) · `RESOURCE_NOT_FOUND` |
 *
 * 응답 = 만료가 있는 signed URL (`SignedMediaUrl`). URL 은 로그·영속 저장 금지 (Plan §5.4 · §5.6).
 * 재생 탭 전에는 호출하지 않는다 (`preload="none"`, AC-7-49) — 호출 시점은 `features/highlight-clip-player`.
 */
import type { SignedMediaUrl } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface HighlightClipApi {
  getPlaybackUrl(request: { clipId: string }, options?: ApiRequestOptions): Promise<SignedMediaUrl>;
}
