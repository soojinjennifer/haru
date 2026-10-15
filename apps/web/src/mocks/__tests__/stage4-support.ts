/**
 * Stage 4 Mock 테스트 공통 준비물 (`S4-C`). 테스트 전용 — 앱 코드가 import 하지 않는다.
 *
 * 값은 **가상 데이터**다. 바이트는 내용이 아니라 크기만 의미가 있다 (Mock 은 `Blob.size` 만 본다).
 */
import type {
  CreateSessionRequest,
  RecordingUploadCompleteRequest,
  RecordingUploadInitRequest,
  SessionTransitionRequest,
} from '@haru/contracts';

import { createImmediateTimer } from '../../shared/api/helpers';
import { MOCK_CHILD_ID } from '../fixtures/me';
import { DECK_BOOKS } from '../fixtures/saved-books';
import { createMockApiClientsBundle, type MockApiClientsOptions } from '../index';

export const T0 = '2026-01-01T00:00:00.000Z';
export const T1 = '2026-01-01T00:01:00.000Z';
export const T2 = '2026-01-01T00:15:00.000Z';

/** 결정적 IK — 테스트마다 이름으로 구분한다 (uuid 형식일 필요는 없다: interface 는 문자열). */
export function ik(name: string): { idempotencyKey: string } {
  return { idempotencyKey: `ik-${name}` };
}

export function bundle(scenario = '', options: MockApiClientsOptions = {}) {
  return createMockApiClientsBundle({
    search: scenario.length > 0 ? `?scenario=${scenario}` : '',
    timer: createImmediateTimer(),
    ...options,
  });
}

export function sessionBody(overrides: Partial<CreateSessionRequest> = {}): CreateSessionRequest {
  return {
    childId: MOCK_CHILD_ID,
    mode: 'recorded',
    activityCardOptionId: null,
    bookId: DECK_BOOKS[0]?.id ?? null,
    childBookId: null,
    readingContext: 'bedtime',
    clientSessionKey: 'client-session-key-0001',
    readyAt: T0,
    ...overrides,
  };
}

export function to(
  target: SessionTransitionRequest['to'],
  extra: Partial<SessionTransitionRequest> = {},
): SessionTransitionRequest {
  return {
    to: target,
    occurredAt: T1,
    ...(target === 'completed'
      ? { completedReason: 'user_done' as const, recordedSeconds: 840 }
      : {}),
    ...extra,
  };
}

export const PART_BYTES = 1_000;

export function initBody(partNos: readonly number[] = [1]): RecordingUploadInitRequest {
  return {
    parts: partNos.map((partNo) => ({
      partNo,
      mimeType: 'audio/webm;codecs=opus',
      container: 'webm' as const,
      bytes: PART_BYTES,
    })),
    totalDurationSeconds: 840,
  };
}

export function completeBody(partNos: readonly number[] = [1]): RecordingUploadCompleteRequest {
  return {
    parts: partNos.map((partNo) => ({
      partNo,
      bytes: PART_BYTES,
      sha256: 'a'.repeat(64),
      durationSeconds: 840 / partNos.length,
    })),
  };
}

export function partData(bytes = PART_BYTES): Blob {
  return new Blob([new Uint8Array(bytes)]);
}

/** 세션을 만들고 `recording → completed` 까지 진행한 번들. */
export async function completedSession(scenario = '', options: MockApiClientsOptions = {}) {
  const b = bundle(scenario, options);
  const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('create'));
  await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('rec'));
  await b.clients.sessions.transition({ sessionId: session.id, body: to('completed') }, ik('done'));
  return { b, sessionId: session.id };
}
