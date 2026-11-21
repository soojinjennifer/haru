/**
 * 녹음 목록 행 표시값 — Spec §2.3 · §2.3.1 (`uploadStatus` → meta 문구 · *Delete* 유무). 순수 함수다.
 *
 * | `uploadStatus` | meta | *Delete* |
 * |---|---|---|
 * | `uploaded` | *Saved* | 있음 |
 * | `pending` | *Uploading* | 있음 |
 * | `failed` | *Not uploaded yet* | 있음 |
 * | `expired` | *Removed after {n} days* (`{n}` = 응답 `rawAudioDays`) | 없음 |
 * | `deleted` | *Deleted* | 없음 |
 *
 * 날짜 = `completedAt ?? readyAt` (기기 시간대 · 절대 날짜 — `formatMonthDay`), 길이 = `recordedSeconds` 의 분.
 */
import type { SessionListItem, UploadStatus } from '@haru/contracts';

import { formatMonthDay } from '../../../shared/lib/date-format';
import { recordingDeletionCopy as copy } from '../copy';

export interface RecordingRowView {
  readonly sessionId: string;
  readonly title: string;
  readonly dateLabel: string;
  readonly subtitle: string;
  readonly meta: string;
  readonly deletable: boolean;
  /** *Delete* 접근성 이름. */
  readonly deleteName: string;
}

const DELETABLE: ReadonlySet<UploadStatus> = new Set<UploadStatus>([
  'uploaded',
  'pending',
  'failed',
]);

export function statusMeta(status: UploadStatus, rawAudioDays: number): string {
  switch (status) {
    case 'uploaded':
      return copy.status.uploaded;
    case 'pending':
      return copy.status.pending;
    case 'failed':
      return copy.status.failed;
    case 'expired':
      return copy.status.expired(rawAudioDays);
    case 'deleted':
      return copy.status.deleted;
  }
}

/** 녹음 분 — 초가 있으면 최소 1분 (0 min 표기를 피한다). */
export function recordedMinutes(seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.max(1, Math.round(seconds / 60));
}

/** `recording` 이 없는 항목은 목록 대상이 아니다 (`hasRecording=true`) — `null` 을 돌려준다. */
export function toRecordingRowView(
  item: SessionListItem,
  rawAudioDays: number,
  nowMs: number,
): RecordingRowView | null {
  if (item.recording === null) return null;
  const title = item.book?.title ?? copy.untitled;
  const dateLabel = formatMonthDay(Date.parse(item.completedAt ?? item.readyAt), nowMs);
  return {
    sessionId: item.id,
    title,
    dateLabel,
    subtitle: copy.subtitle(dateLabel, recordedMinutes(item.recordedSeconds)),
    meta: statusMeta(item.recording.uploadStatus, rawAudioDays),
    deletable: DELETABLE.has(item.recording.uploadStatus),
    deleteName: copy.deleteName(title, dateLabel),
  };
}
