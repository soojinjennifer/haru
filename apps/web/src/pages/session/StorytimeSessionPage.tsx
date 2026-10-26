import { useParams } from 'react-router';

import { StorytimeSessionScreen } from '../../features/storytime-session';

/**
 * `/session/:sessionId` Storytime Session — Stage 4 Plan §9.1 (Figma `300:1309` ready).
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3) — route param 을 넘길 뿐이다.
 * 녹음·전이·타이머는 `RecordingController`(조립 = `app/providers`)가, 화면 조립은
 * `features/storytime-session` 이 소유한다. Layout(`FullscreenLayout`)은 `app/router.tsx` 가 씌운다.
 */
export function StorytimeSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (sessionId === undefined) return null;
  return <StorytimeSessionScreen key={sessionId} sessionId={sessionId} />;
}
