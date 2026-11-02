import { useParams } from 'react-router';

import { SessionCompleteScreen } from '../../features/storytime-session';

/**
 * `/session/:sessionId/complete` — 완료 화면 (Figma `29:62` y 0~468, Stage 4 Design Spec §2.7).
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3). Layout(`FullscreenLayout`)은 `app/router.tsx` 가 씌운다.
 * y 468 아래를 비워 두는 이유는 `SessionCompleteScreen` 머리 주석 (AC-4-104).
 */
export function SessionCompletePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (sessionId === undefined) return null;
  return <SessionCompleteScreen key={sessionId} sessionId={sessionId} />;
}
