import { useParams } from 'react-router';

import { ReflectionCard } from '../../features/reflection';
import { SessionCompleteScreen } from '../../features/storytime-session';

/**
 * `/session/:sessionId/complete` — 완료 화면 (Figma `29:62`, Stage 4 Design Spec §2.7 + Stage 5 Spec §2.1).
 *
 * Page 는 **Composition 만** 한다 (`rules/frontend.md` §3). Layout(`FullscreenLayout`)은 `app/router.tsx` 가 씌운다.
 * 회고 카드(`features/reflection`)를 완료 화면(`features/storytime-session`)의 하단 슬롯에 끼운다 —
 * 두 feature 는 서로 import 하지 않는다 (Stage 5 Plan §5.4 R-1, `/reflection` route 는 만들지 않는다).
 */
export function SessionCompletePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (sessionId === undefined) return null;
  return (
    <SessionCompleteScreen
      key={sessionId}
      sessionId={sessionId}
      footer={<ReflectionCard sessionId={sessionId} />}
    />
  );
}
