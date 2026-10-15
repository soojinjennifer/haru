import { describe, expect, it } from 'vitest';

import * as contracts from '../index.js';
import * as notifications from '../notifications/index.js';
import * as recordings from '../recordings/index.js';
import * as sessions from '../sessions/index.js';

/**
 * Stage 4 `S4-B` — 공개 표면 (AC-4-05 · AC-4-20).
 *
 * `sessions/` 4파일 · `recordings/` 2파일 · `notifications/` 2파일의 export 가 **전부**
 * 패키지 진입점(`src/index.ts`)에서 같은 참조로 보인다 (deep import 금지 — ARCHITECTURE §1.2).
 */

const EXPECTED_EXPORTS = {
  sessions: [
    // create-session.ts
    'CLIENT_SESSION_KEY_MAX_LENGTH',
    'CLIENT_SESSION_KEY_MIN_LENGTH',
    'CreateSessionRequestSchema',
    'CreateSessionResponseSchema',
    // list.ts
    'ListSessionsRequestSchema',
    'ListSessionsResponseSchema',
    // session.ts
    'SessionBubbleCopySchema',
    'SessionDetailSchema',
    'SessionSummarySchema',
    'StickerAwardSchema',
    // transition.ts
    'ClientSessionTransitionTargetSchema',
    'SessionTransitionRequestSchema',
    'SessionTransitionResultSchema',
  ],
  recordings: [
    // upload.ts
    'RECORDING_PART_BYTES_MAX',
    'RECORDING_PART_NO_MAX',
    'RECORDING_TOTAL_DURATION_GRACE_SECONDS',
    'RecordingMimeTypeSchema',
    'RecordingPartNoSchema',
    'RecordingPartSchema',
    'RecordingUploadCompletePartSchema',
    'RecordingUploadCompleteRequestSchema',
    'RecordingUploadCompleteResponseSchema',
    'RecordingUploadInitRequestSchema',
    'RecordingUploadInitResponseSchema',
    'RecordingUploadTargetSchema',
    'RefreshUploadTokensRequestSchema',
    'Sha256HexSchema',
    'recordingContainerForMimeType',
    'recordingMimeBaseType',
    // status.ts
    'RecordingStatusSchema',
  ],
  notifications: [
    // preferences.ts
    'NotificationPreferencesSchema',
    'UpdateNotificationPreferencesRequestSchema',
    'WeekdaySchema',
    // push-device.ts
    'PushDeviceSchema',
    'RegisterPushDeviceRequestSchema',
  ],
} as const;

const MODULES = { sessions, recordings, notifications } as const;

describe('Stage 4 contracts — 진입점 re-export (AC-4-05)', () => {
  it.each(Object.keys(EXPECTED_EXPORTS) as (keyof typeof EXPECTED_EXPORTS)[])(
    '%s/index.ts 의 export 목록이 기대와 정확히 같다',
    (domain) => {
      expect(Object.keys(MODULES[domain]).sort()).toEqual([...EXPECTED_EXPORTS[domain]].sort());
    },
  );

  it.each(Object.keys(EXPECTED_EXPORTS) as (keyof typeof EXPECTED_EXPORTS)[])(
    '%s 의 모든 export 가 패키지 진입점에서 같은 참조로 보인다',
    (domain) => {
      const root = contracts as Record<string, unknown>;
      const module = MODULES[domain] as Record<string, unknown>;
      for (const name of EXPECTED_EXPORTS[domain]) {
        expect(root[name], name).toBe(module[name]);
      }
    },
  );

  it('신규 enum 3종이 진입점에서 보인다', () => {
    expect(contracts.PushPlatformSchema.options).toEqual(['ios', 'android', 'web']);
    expect(contracts.StickerTypeSchema.options).toEqual(['attendance']);
    expect(contracts.RecordingContainerSchema.options).toEqual(['webm', 'mp4']);
  });
});

describe('Stage 4 contracts — 승인 밖 식별자가 없다 (R4-16 · AC-4-20)', () => {
  const exported = Object.keys(contracts);

  it('AbandonedReason 류 enum·schema 가 없다 (D4-13 안 A′ 미채택)', () => {
    // READY_ABANDON_SECONDS (Stage 1, #17) 만 있다 — 사유 enum 은 없다
    expect(exported.filter((name) => /abandon/i.test(name))).toEqual(['READY_ABANDON_SECONDS']);
    expect(exported.filter((name) => /discard/i.test(name))).toEqual([]);
  });

  it('클라이언트 전용 상태(업로드 큐 · 마이크 권한 · RecordingController)가 contract 로 노출되지 않는다', () => {
    expect(exported.filter((name) => /queue|permission|controller|recorder/i.test(name))).toEqual(
      [],
    );
  });
});
