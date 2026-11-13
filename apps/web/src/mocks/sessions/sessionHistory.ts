/**
 * 지난 세션 seed — `MockSessionApi` · `MockReflectionApi` · `MockAnalysisApi` 가 **같은 서버 상태**를 본다.
 *
 * Stage 4 에서는 `MockSessionApi` 안의 함수였다. Stage 5 에서 회고·분석 Mock 도 같은 세션을 찾아야 하므로
 * (deep link 로 피드백 화면에 바로 들어오는 경로 — Plan §9) 공유 모듈로 옮겼다. 동작은 그대로다.
 */
import { shiftedIso, type Clock } from '../../shared/lib/clock';
import { MOCK_SHORT_FEEDBACK } from '../fixtures/analysis';
import { MOCK_CHILD_ID } from '../fixtures/me';
import {
  createSessionHistoryFixture,
  MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
  MOCK_HISTORY_RECORDING_IDS,
  MOCK_RAW_AUDIO_RETENTION_MS,
} from '../fixtures/sessions';

import type { MockSessionState } from './sessionState';

/** 지난 세션 fixture 를 최초 1회 넣는다 (목록 `success` · 상세 · 회고 · 분석 조회가 같은 값을 본다). */
export function ensureSessionHistory(state: MockSessionState, clock: Clock): void {
  if (state.seeded) return;
  state.seeded = true;

  createSessionHistoryFixture(clock).forEach((summary, index) => {
    const recordingId = MOCK_HISTORY_RECORDING_IDS[index] ?? null;
    state.sessions.set(summary.id, {
      summary,
      childId: MOCK_CHILD_ID,
      clientSessionKey: null,
      sticker: null,
      // `sticker: null` — `subtext` 가 `sticker earned` 를 말하면 응답이 스스로 모순된다 (§3.2.3).
      completionBubble: MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
      recordingId,
      reflection: null,
      // 분석이 끝난 세션(`analyzed`)만 피드백을 갖는다 — worker 가 남긴 값.
      shortFeedback: summary.status === 'analyzed' ? MOCK_SHORT_FEEDBACK : null,
    });
    if (recordingId !== null) {
      state.recordings.set(recordingId, {
        recordingId,
        sessionId: summary.id,
        parts: new Map(),
        uploadStatus: 'uploaded',
        expiresAt: shiftedIso(clock, MOCK_RAW_AUDIO_RETENTION_MS),
        deletedAt: null,
      });
    }
  });
}
