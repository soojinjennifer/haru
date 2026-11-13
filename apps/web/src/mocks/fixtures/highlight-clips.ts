/**
 * 하이라이트 클립 fixture — Stage 5 Plan §7 C-9 · `N5-22` (FR-18).
 *
 * ⚠️ **schema + fixture + parse 테스트만**이다. Stage 5 에는 이 fixture 를 쓰는 Mock Adapter 메서드도
 * 앱 호출자도 없다 — 재생 UI·`playback-url` 호출은 Stage 7 이 만든다 (AC-5-07).
 * URL 은 실제 Storage 가 아닌 예약 도메인(`.test`)이다.
 */
import {
  HighlightClipSummarySchema,
  SignedMediaUrlSchema,
  type HighlightClipSummary,
  type SignedMediaUrl,
} from '@haru/contracts';

import { shiftedIso, type Clock } from '../../shared/lib/clock';

import { MOCK_HISTORY_SESSION_IDS } from './sessions';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export const MOCK_HIGHLIGHT_CLIP_IDS = [
  'c1c1c1c1-0000-4000-8000-000000000001',
  'c1c1c1c1-0000-4000-8000-000000000002',
] as const;

/** 분석 완료된 지난 세션의 클립 2개 — 하나는 만료 시각 있음, 하나는 `OAQ-13` 결정 전(`null`). */
export function createHighlightClipFixtures(clock: Clock): HighlightClipSummary[] {
  return [
    HighlightClipSummarySchema.parse({
      id: MOCK_HIGHLIGHT_CLIP_IDS[0],
      sessionId: MOCK_HISTORY_SESSION_IDS[0],
      durationSeconds: 12,
      expiresAt: shiftedIso(clock, 87 * DAY_MS),
    }),
    HighlightClipSummarySchema.parse({
      id: MOCK_HIGHLIGHT_CLIP_IDS[1],
      sessionId: MOCK_HISTORY_SESSION_IDS[0],
      durationSeconds: 15,
      expiresAt: null,
    }),
  ];
}

export function createSignedMediaUrlFixture(clock: Clock, clipId: string): SignedMediaUrl {
  return SignedMediaUrlSchema.parse({
    url: `https://media.haru-mock.test/clips/${clipId}?signature=mock`,
    expiresAt: shiftedIso(clock, HOUR_MS),
  });
}
