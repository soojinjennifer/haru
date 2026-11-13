/**
 * 분석 응답 → 표시 상태 (Stage 5 Spec §2.3 표 · ARCHITECTURE §10.2, AC-5-36~42) — 순수 함수.
 */
import { SessionAnalysisStatusSchema, type SessionAnalysisStatus } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import {
  isRecordingMissing,
  selectAnalysisDisplayState,
  type AnalysisDisplayInput,
} from '../model/analysisDisplayState';

const SESSION = '77777777-7777-4777-8777-000000000002';

function status(partial: Partial<SessionAnalysisStatus>): SessionAnalysisStatus {
  return SessionAnalysisStatusSchema.parse({
    sessionId: SESSION,
    sessionStatus: 'analyzing',
    mode: 'recorded',
    outcome: null,
    shortFeedback: null,
    ...partial,
  });
}

function input(partial: Partial<AnalysisDisplayInput>): AnalysisDisplayInput {
  return { analysis: undefined, analysisError: null, recordingUploadStatus: undefined, ...partial };
}

describe('selectAnalysisDisplayState', () => {
  it('응답 전 = loading', () => {
    expect(selectAnalysisDisplayState(input({}))).toEqual({ kind: 'loading' });
  });

  it('analyzing = pending', () => {
    expect(selectAnalysisDisplayState(input({ analysis: status({}) }))).toEqual({
      kind: 'pending',
    });
  });

  it('analyzed + full = 응답 text 그대로 (가공 0)', () => {
    const text = 'Today brought lots of feeling words, and a new one — proud.';
    expect(
      selectAnalysisDisplayState(
        input({
          analysis: status({ sessionStatus: 'analyzed', outcome: 'full', shortFeedback: { text } }),
        }),
      ),
    ).toEqual({ kind: 'analyzed', text });
  });

  it('analyzed + text null · 빈 문자열 · shortFeedback null = text null (fallback 0)', () => {
    for (const shortFeedback of [{ text: null }, { text: '' }, null]) {
      expect(
        selectAnalysisDisplayState(
          input({
            analysis: status({ sessionStatus: 'analyzed', outcome: 'full', shortFeedback }),
          }),
        ),
      ).toEqual({ kind: 'analyzed', text: null });
    }
  });

  it('analyzed + excluded_low_quality = low-quality (text 있을 때만)', () => {
    expect(
      selectAnalysisDisplayState(
        input({
          analysis: status({
            sessionStatus: 'analyzed',
            outcome: 'excluded_low_quality',
            shortFeedback: { text: 'Thanks for reading together today.' },
          }),
        }),
      ),
    ).toEqual({ kind: 'low-quality', text: 'Thanks for reading together today.' });
    expect(
      selectAnalysisDisplayState(
        input({
          analysis: status({
            sessionStatus: 'analyzed',
            outcome: 'excluded_low_quality',
            shortFeedback: null,
          }),
        }),
      ),
    ).toEqual({ kind: 'low-quality', text: null });
  });

  it('failed = failed', () => {
    expect(
      selectAnalysisDisplayState(input({ analysis: status({ sessionStatus: 'failed' }) })),
    ).toEqual({ kind: 'failed' });
  });

  it('completed: 녹음 deleted · expired = not-available(no-recording) · 그 밖 = pending · 모름 = loading', () => {
    const completed = status({ sessionStatus: 'completed' });
    for (const uploadStatus of ['deleted', 'expired'] as const) {
      expect(
        selectAnalysisDisplayState(
          input({ analysis: completed, recordingUploadStatus: uploadStatus }),
        ),
      ).toEqual({ kind: 'not-available', reason: 'no-recording' });
      expect(isRecordingMissing(completed, uploadStatus)).toBe(true);
    }
    for (const uploadStatus of ['pending', 'uploaded', 'failed', null] as const) {
      expect(
        selectAnalysisDisplayState(
          input({ analysis: completed, recordingUploadStatus: uploadStatus }),
        ),
      ).toEqual({ kind: 'pending' });
      expect(isRecordingMissing(completed, uploadStatus)).toBe(false);
    }
    expect(selectAnalysisDisplayState(input({ analysis: completed }))).toEqual({
      kind: 'loading',
    });
  });

  it('녹음 판별은 completed 에서만 — analyzing 은 deleted 여도 pending', () => {
    expect(isRecordingMissing(status({}), 'deleted')).toBe(false);
  });

  it('응답 mode = conversation_only → not-available(conversation)', () => {
    expect(
      selectAnalysisDisplayState(
        input({ analysis: status({ sessionStatus: 'completed', mode: 'conversation_only' }) }),
      ),
    ).toEqual({ kind: 'not-available', reason: 'conversation' });
  });

  it('오류: ANALYSIS_NOT_AVAILABLE · RESOURCE_NOT_FOUND · FORBIDDEN · offline · 그 밖', () => {
    const error = (code: AnalysisDisplayInput['analysisError']) =>
      selectAnalysisDisplayState(input({ analysisError: code }));
    expect(error({ code: 'ANALYSIS_NOT_AVAILABLE', offline: false })).toEqual({
      kind: 'not-available',
      reason: 'conversation',
    });
    expect(error({ code: 'RESOURCE_NOT_FOUND', offline: false })).toEqual({
      kind: 'not-found',
      code: 'RESOURCE_NOT_FOUND',
    });
    expect(error({ code: 'FORBIDDEN', offline: false })).toEqual({
      kind: 'not-found',
      code: 'FORBIDDEN',
    });
    expect(error({ code: undefined, offline: true })).toEqual({ kind: 'offline' });
    expect(error({ code: 'INTERNAL_ERROR', offline: false })).toEqual({
      kind: 'error',
      code: 'INTERNAL_ERROR',
    });
  });

  it('받은 응답이 있으면 폴링 중 일시 오류는 표시를 바꾸지 않는다', () => {
    expect(
      selectAnalysisDisplayState(
        input({ analysis: status({}), analysisError: { code: undefined, offline: true } }),
      ),
    ).toEqual({ kind: 'pending' });
  });
});
