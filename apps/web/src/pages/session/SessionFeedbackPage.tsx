import { useParams } from 'react-router';

import { SessionFeedbackScreen } from '../../features/session-feedback';

/**
 * `/session/:sessionId/feedback` — 피드백 · 분석 상태 화면 (Figma 없음 — `C13-S5-1`, Stage 5 Spec §2.3).
 *
 * **deep link 전용** (`N5-10` ⓐ — 앱 안 진입점 없음, push `short_feedback_ready` 도착 URL). Page 는 Composition 만
 * 한다 (`rules/frontend.md` §3). Layout(`FullscreenLayout`)과 Route Guard 는 `app/router.tsx` 가 씌운다 —
 * 미로그인 진입은 기존 Guard 그대로이며 목적지를 보존하지 않는다 (`N5-15` ⓑ).
 */
export function SessionFeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (sessionId === undefined) return null;
  return <SessionFeedbackScreen key={sessionId} sessionId={sessionId} />;
}
