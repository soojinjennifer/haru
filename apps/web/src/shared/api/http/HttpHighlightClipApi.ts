/**
 * `HttpHighlightClipApi` — 하이라이트 클립 재생 URL endpoint 의 Http Adapter **골격** (Stage 1 `D-7`, Stage 7 C7-8).
 *
 * 실제 연동(클립 추출 · private Storage · 만료 signed URL · 보관 기간 `OAQ-13` · 삭제 cascade)은
 * `BACKEND_INTEGRATION_PENDING` 이다 (`P7-BIP-10` — `P5-BIP-14` 승계). URL 은 로그에 남기지 않는다.
 */
import { SignedMediaUrlSchema } from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { HighlightClipApi } from '../highlight-clip-api';

import type { HttpClient } from './httpClient';

export function highlightClipPlaybackPath(clipId: string): string {
  return `/highlight-clips/${encodeURIComponent(clipId)}/playback-url`;
}

export function createHttpHighlightClipApi(client: HttpClient): HighlightClipApi {
  return {
    getPlaybackUrl: (request: { clipId: string }, options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: highlightClipPlaybackPath(request.clipId),
        schema: SignedMediaUrlSchema,
        signal: options.signal,
      }),
  };
}
