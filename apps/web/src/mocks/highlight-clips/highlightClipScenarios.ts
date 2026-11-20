/**
 * `highlight-clips` scenario 그룹 — Stage 7 Plan §8 · `docs/API_CONTRACTS.md` §5.4 (Rev 11).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | signed URL = 런타임 합성 WAV(`data:` URL, 클립 길이만큼) |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`deliver`) |
 * | `clip-expired` | **두 번째 클립**: 리포트 상세의 `expiresAt` = 과거 + playback `RECORDING_DELETED{reason:'expired'}` · 나머지 클립 = success |
 * | `recording-deleted` | 모든 클립 playback `RECORDING_DELETED{reason:'deleted'}` |
 * | `clip-url-expired` | 클립마다 **첫** URL 이 이미 만료(`expiresAt` 과거 · 빈 오디오 → 재생 실패) → 두 번째 조회부터 정상 |
 */
import type { ScenarioGroupDefinition } from '../scenarios';

export const HIGHLIGHT_CLIP_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'clip-expired',
  'recording-deleted',
  'clip-url-expired',
] as const;

export type HighlightClipScenarioKey = (typeof HIGHLIGHT_CLIP_SCENARIO_KEYS)[number];

export const highlightClipScenarioGroup: ScenarioGroupDefinition<HighlightClipScenarioKey> = {
  group: 'highlight-clips',
  keys: HIGHLIGHT_CLIP_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 `loading` "1.5–3s". */
export const HIGHLIGHT_CLIP_LOADING_DELAY_MS = 1_500;
