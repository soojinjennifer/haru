/**
 * `MockHighlightClipApi` — 하이라이트 클립 재생 URL Mock Adapter (Stage 7 Plan §8 그룹 `highlight-clips` · C7-8, FR-18).
 *
 * scenario 표 = `highlightClipScenarios.ts`.
 *
 * ── 서버 규칙 ──
 * - 클립은 **발행 리포트 스냅샷 안의 클립**만 안다 (리포트 Mock 과 같은 상태) — 모르는 id → `RESOURCE_NOT_FOUND`
 * - 삭제·보관 만료 → `RECORDING_DELETED` + `details.reason`(`deleted` | `expired`) — 재시도해도 같다 (`N7-17`)
 * - 유효 URL = 런타임 합성 WAV `data:` URL(클립 길이만큼) · 만료 = `MOCK_SIGNED_URL_EXPIRES_AT`
 * - `clip-url-expired`: 클립별 **첫 조회**는 이미 만료된 URL(`expiresAt` 과거 + 빈 오디오) → 두 번째부터 유효 (재발급 1회 검증 — AC-7-51)
 * - URL 은 요청 로그에 남기지 않는다 (clipId 만). 시간·난수 없음 (결정적).
 */
import {
  RecordingDeletedDetailsSchema,
  SignedMediaUrlSchema,
  type ReportHighlightClip,
  type SignedMediaUrl,
} from '@haru/contracts';

import { parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { HighlightClipApi } from '../../shared/api/highlight-clip-api';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { MOCK_HIGHLIGHT_CLIP_IDS } from '../fixtures/highlight-clips';
import { MOCK_EXPIRED_AT, MOCK_SIGNED_URL_EXPIRES_AT } from '../fixtures/reports';
import { MOCK_WAV_MIME_TYPE, createMockWavDataUrl } from '../media/mock-wav';
import { ensureReportSeed } from '../reports/MockReportApi';
import type { MockReportState } from '../reports/reportState';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';

import {
  HIGHLIGHT_CLIP_LOADING_DELAY_MS,
  highlightClipScenarioGroup,
  type HighlightClipScenarioKey,
} from './highlightClipScenarios';

const PLAYBACK_OPERATION = 'GET /v1/highlight-clips/:clipId/playback-url';

/** 이미 만료된 URL 이 가리키는 빈 오디오 — 로드하면 재생 실패(미디어 오류)가 난다. */
const EXPIRED_MEDIA_URL = `data:${MOCK_WAV_MIME_TYPE};base64,`;

export interface MockHighlightClipApiDeps {
  store: ScenarioStore;
  idFactory: IdFactory;
  timer: Timer;
  state: MockReportState;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockHighlightClipApi(deps: MockHighlightClipApiDeps): HighlightClipApi {
  const { store, idFactory, timer, state, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  /** `clip-url-expired` — 클립별 조회 횟수. */
  const reads = new Map<string, number>();
  /** 같은 길이의 WAV 를 한 번만 만든다 (≈128 KB 문자열). */
  const audio = new Map<number, string>();

  function findClip(clipId: string): ReportHighlightClip | undefined {
    for (const record of state.reports) {
      const clip = record.detail.highlightClips.find((candidate) => candidate.id === clipId);
      if (clip !== undefined) return clip;
    }
    return undefined;
  }

  function audioUrl(durationSeconds: number): string {
    const cached = audio.get(durationSeconds);
    if (cached !== undefined) return cached;
    const created = createMockWavDataUrl(durationSeconds);
    audio.set(durationSeconds, created);
    return created;
  }

  function deleted(reason: 'deleted' | 'expired'): never {
    return fail(
      'RECORDING_DELETED',
      'This clip is no longer available.',
      RecordingDeletedDetailsSchema.parse({ reason }),
    );
  }

  function respond(clip: ReportHighlightClip, scenario: HighlightClipScenarioKey): SignedMediaUrl {
    if (scenario === 'recording-deleted') return deleted('deleted');
    if (scenario === 'clip-expired' && clip.id === MOCK_HIGHLIGHT_CLIP_IDS[1])
      return deleted('expired');

    const count = (reads.get(clip.id) ?? 0) + 1;
    reads.set(clip.id, count);

    const value =
      scenario === 'clip-url-expired' && count === 1
        ? { url: EXPIRED_MEDIA_URL, expiresAt: MOCK_EXPIRED_AT }
        : {
            url: audioUrl(clip.durationSeconds),
            expiresAt: MOCK_SIGNED_URL_EXPIRES_AT,
          };

    return parseResponse(SignedMediaUrlSchema, value, {
      operation: PLAYBACK_OPERATION,
      direction: 'response',
    });
  }

  return {
    getPlaybackUrl(
      request: { clipId: string },
      options: ApiRequestOptions = {},
    ): Promise<SignedMediaUrl> {
      requestLog?.record(PLAYBACK_OPERATION, { clipId: request.clipId });
      const { scenario, attempt } = beginScenarioCall(
        store,
        highlightClipScenarioGroup,
        'getPlaybackUrl',
        options.signal,
      );

      return deliver({
        scenario,
        attempt,
        delayMs: HIGHLIGHT_CLIP_LOADING_DELAY_MS,
        run: () => {
          ensureReportSeed(store, state);
          const clip = findClip(request.clipId);
          if (clip === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown clip.');
          return respond(clip, scenario);
        },
        message: 'Mock highlight clip request failed.',
        errorCode: resolveErrorCode(errorCodes, highlightClipScenarioGroup.group, 'getPlaybackUrl'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
