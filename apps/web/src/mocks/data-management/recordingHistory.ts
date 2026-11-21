/**
 * 세션별 녹음 목록 seed — `MockDataManagementApi` 와 기기 seed(`recording-delete-local-pending`)가 **같은 서버 상태**에 넣는다.
 *
 * 지난 세션 seed(`ensureSessionHistory`)와 **플래그를 나눈다** — 이 seed 가 `sessions` 목록의 Stage 4–7 결과를 바꾸지 않도록
 * 데이터 관리 endpoint 가 처음 불릴 때만 들어간다. 행은 `MockSessionApi.getDetail` · 하이라이트 클립과 같은 레코드다
 * (교차 일관성 — AC-8-10).
 */
import type { Clock } from '../../shared/lib/clock';
import { createRecordingRowFixtures } from '../fixtures/data-management';
import { MOCK_CHILD_ID } from '../fixtures/me';
import { MOCK_COMPLETION_BUBBLE_NO_SUBTEXT } from '../fixtures/sessions';
import { ensureSessionHistory } from '../sessions/sessionHistory';
import type { MockSessionState } from '../sessions/sessionState';

export function ensureRecordingHistory(state: MockSessionState, clock: Clock): void {
  ensureSessionHistory(state, clock);
  if (state.recordingHistorySeeded) return;
  state.recordingHistorySeeded = true;

  for (const row of createRecordingRowFixtures(clock)) {
    state.sessions.set(row.summary.id, {
      summary: row.summary,
      childId: MOCK_CHILD_ID,
      clientSessionKey: null,
      sticker: null,
      completionBubble: MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
      recordingId: row.recordingId,
      reflection: null,
      shortFeedback: null,
    });
    state.recordings.set(row.recordingId, {
      recordingId: row.recordingId,
      sessionId: row.summary.id,
      parts: new Map(),
      uploadStatus: row.uploadStatus,
      expiresAt: row.expiresAt,
      deletedAt: row.deletedAt,
    });
  }
}
