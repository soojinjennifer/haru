/**
 * 완료 화면 — Figma `29:62` (Stage 4 Spec §2.7 = y 0~468 · Stage 5 Spec §2.1 = y 521~823 회고 카드).
 *
 * 하단 `footer` 슬롯 (Stage 5 Plan §5.4 R-1): y 521~823 은 회고 카드 `91:691` 이고, 조립은 Page 가 한다
 * (`features/reflection` — feature 간 import 금지). **본체 상태에서만** 그린다 (로딩·오류·이탈 화면에는 없다).
 * 슬롯은 버블 **뒤 흐름**에 둔다 (`N5-29`) — 위쪽(y 0~468)의 요소·좌표는 바꾸지 않는다 (AC-5-19).
 * Stage 4 의 *"y 468 아래는 의도적 공백"*(AC-4-61 · 104, `D4-43`)은 Stage 4 한정 기록이었고 AC-5-18 · 19 로
 * 승계됐다 (`N5-21`).
 *
 * 스크롤: 세션 화면과 뷰포트(`AppShell`)를 공유해 `scrollTop` 이 승계되므로 진입 시 맨 위로 돌린다
 * (`VG-K1S-02` — 627 이하에서는 스크롤해야 `Submit` 을 누를 수 있어 항상 재현된다).
 *
 * 닫기 = 홈으로 `replace` (`D4-86`) — 세션 전이는 없다.
 *
 * Toast inset (`D4-89`): 완료 화면은 `Submit` 의 Toast 를 안고 들어온다. 닫기 줄(48)을 inset 으로 등록한다 — 등록
 * 지점이 `AppShellTopBar` 가 아닌 이유는 `CompleteCloseBar` 주석.
 *
 * 끝난 적 없는 세션의 직접 진입(`ready` · `abandoned` — `D4-91`, `recording` · `paused` — `D4-113`)은 홈으로
 * 돌려보낸다 (`StorytimeSessionScreen` 선례).
 *
 * 스티커 입장 (`D4-100`): `useStickerEntrance`. 칩은 항상 렌더하고 CSS 가 숨기므로 슬롯·아래 요소의 좌표가 불변이다.
 */
import {
  Icon,
  IconButton,
  Spinner,
  Text,
  useScrollContainerRef,
  useToastTopBarInset,
} from '@haru/ui';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { CharacterMedallion } from '../../../entities/character';
import {
  AttendanceStickerChip,
  SessionCompleteBubble,
  useSessionCompletion,
} from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { storytimeSessionCopy as copy } from '../copy';

import { SessionLoadError } from './SessionLoadError';
import { useStickerEntrance } from './useStickerEntrance';

export interface SessionCompleteScreenProps {
  sessionId: string;
  /** 버블 아래 슬롯 — 회고 카드 (Stage 5 `S5-B`). 본체 상태에서만 렌더한다. */
  footer?: ReactNode;
}

function scrollToTop(viewport: HTMLElement): void {
  viewport.scrollTop = 0;
}

/**
 * 닫기 줄. Spec §2.5.1 은 TopBar 를 `FullscreenLayout` `topBar` 슬롯으로 넘기라 했으나, 슬롯은 layout 소유라
 * 로딩·오류 화면에도 제목이 뜨고(오류 화면 `h1` 2개) `position: sticky` 라 짧은 세로에서 내용을 덮으며, 띠 48 이
 * 스티커(y 44)와 겹쳐 Figma 좌표를 깬다. 그래서 **완료 본체가 있을 때만** 이 줄을 inset 으로 등록한다 — `Visual Gap H1`
 * 결정 4 의 "inset 등록만" 경로다. 컴포넌트로 분리한 이유: 등록 시점 = 이 줄이 마운트될 때여야 한다.
 */
function CompleteCloseBar() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useToastTopBarInset(ref);

  return (
    <div ref={ref} className="haru-session-complete__close">
      <IconButton
        icon={<Icon name="haru:session-close" size="md" decorative />}
        label={copy.close}
        variant="glass"
        onPress={() => {
          void navigate(ROUTES.home, { replace: true });
        }}
      />
    </div>
  );
}

export function SessionCompleteScreen({ sessionId, footer }: SessionCompleteScreenProps) {
  const scrollContainerRef = useScrollContainerRef();
  useLayoutEffect(() => {
    const viewport = scrollContainerRef?.current;
    if (viewport !== null && viewport !== undefined) scrollToTop(viewport);
  }, [scrollContainerRef]);

  const completion = useSessionCompletion(sessionId);
  const stickerEntrance = useStickerEntrance();

  if (completion.isPending) {
    return (
      <div className="haru-session haru-session--pending" aria-busy="true">
        <Spinner size="md" />
      </div>
    );
  }

  if (completion.isError) {
    return <SessionLoadError onRetry={completion.refetch} />;
  }

  if (completion.leave) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return (
    <div className="haru-session-complete">
      <CompleteCloseBar />
      <Text as="h1" variant="subheadline" weight="semibold" tone="primary" align="center">
        {copy.complete.title}
      </Text>
      {/* 스티커가 없어도 자리(64)는 남긴다 — 메달리온·버블 y 불변 */}
      <div className="haru-session-complete__sticker-slot" data-entrance={stickerEntrance}>
        {completion.sticker === null ? null : (
          <AttendanceStickerChip sticker={completion.sticker} />
        )}
      </div>
      <div className="haru-session-complete__medallion">
        <span className="haru-session-complete__ring" aria-hidden="true" />
        <CharacterMedallion asset="headphones" size="sm" />
      </div>
      {completion.bubble === null ? null : (
        <div className="haru-session-complete__bubble">
          <SessionCompleteBubble
            text={completion.bubble.text}
            subtext={completion.bubble.subtext}
          />
        </div>
      )}
      {footer}
    </div>
  );
}
