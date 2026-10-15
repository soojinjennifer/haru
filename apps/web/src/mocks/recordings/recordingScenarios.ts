/**
 * `recordings` scenario 그룹 — `MockRecordingApi` 와 `MockUploadTransport` 가 **같은 그룹**을 쓴다.
 *
 * 업로드 실패는 API(`complete` 등)와 바이트 전송(`uploadPart`) 중 어디서든 날 수 있고, Catalogue §5.4
 * 의 HARU 특화 key 는 둘을 묶어 정의한다 (예: `recording-upload-failure` = "업로드 **또는** complete 가
 * 지속 실패"). 한 key 가 두 Adapter 에 함께 걸려야 결정적으로 재현된다.
 * 메서드 단위로 나누려면 `?scenario=recordings.complete:error` · `recordings.uploadpart:offline` 처럼 쓴다.
 */
import type { ScenarioGroupDefinition } from '../scenarios';

export const RECORDING_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'consent-missing',
  'recording-upload-success',
  'recording-upload-failure',
  'upload-retry',
  'upload-token-expired',
  'recording-incomplete',
  'offline-queued',
  'upload-stalled-48h',
  'recording-deleted',
  'recording-discarded',
] as const;

export type RecordingScenarioKey = (typeof RECORDING_SCENARIO_KEYS)[number];

export const recordingScenarioGroup: ScenarioGroupDefinition<RecordingScenarioKey> = {
  group: 'recordings',
  keys: RECORDING_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** 업로드 준비·확정 지연 (Catalogue §5.4 "1.5–3s"). 실제 대기는 주입 timer 가 정한다. */
export const RECORDING_LOADING_DELAY_MS = 1_500;

/** 업로드가 **지속적으로** 실패하는 key — 전송과 확정이 둘 다 성공하지 않는다. */
export function isPersistentUploadFailure(scenario: RecordingScenarioKey): boolean {
  return scenario === 'recording-upload-failure' || scenario === 'upload-stalled-48h';
}

/** 발급 시점부터 만료로 취급할 토큰인지 (토큰 재발급 경로를 타게 한다). */
export function issuesExpiredTokens(scenario: RecordingScenarioKey): boolean {
  return scenario === 'upload-token-expired' || scenario === 'recording-deleted';
}
