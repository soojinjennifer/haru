import { useId, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePresence } from '../hooks/usePresence';
import { cx } from '../lib/cx';
import { MOTION_DURATION_MS } from '../lib/motion';
import { Text } from '../text/Text';

import { Scrim } from './Scrim';

/**
 * Design Spec §4.21 — `full` 은 전체 높이.
 *
 * `inset-card` 는 Library Design Spec §3.7–§3.9 (`L-OPEN-04`) 의 **떠 있는 카드**다:
 * 좌·우·아래 14 inset(`L-NEW-03`) · radius 28 **네 모서리** · grabber 없음 · padding 18.
 * `bottom` · `full` 의 외형은 바뀌지 않는다.
 *
 * `floating` 은 Stage 4b `S4-G2` Prompt Drawer `88:960` 의 **핸들 있는 떠 있는 카드**다: 폭 = 컬럼 100%
 * (좌·우·아래 gutter 24 — `AD-S4-7`) · radius 28 **네 모서리** · 핸들 40×4 · padding 10 / 20 / 18 ·
 * 세로 gap 10 · 제목 Bold. 다른 variant 의 외형은 바뀌지 않는다.
 */
export type SheetVariant = 'bottom' | 'full' | 'inset-card' | 'floating';

/**
 * 시트 **면 색**. 지정하지 않으면 `--color-surface-strong` 이다 (기존 외형 그대로).
 *
 * `spring` 은 Figma `86:482`(`Prompt Card/Home` 뒷면)의 면 `color/spring green/86`
 * (= semantic `--color-surface-spring`) 이다. **면 전체**가 바뀌어야 하는 경우에만 쓴다 —
 * 카드 뒷면처럼 헤더·본문·ActionBar 자리가 **한 장의 뒷면**이어야 할 때다. 가운데만 칠하면
 * 헤더·하단이 뒤집히지 않아 "가운데만 초록" 이 된다 (사용자 지시 2026-10-09 ①).
 *
 * `drawer` 는 Prompt Drawer `88:960` 의 면 `color/white/-86%` + blur 12 (Stage 4 Spec §5.2 `T-1` —
 * `--color-surface-drawer`). 기본 0.90 과 Δ0.04 라 재사용하지 않는다.
 */
export type SheetSurface = 'spring' | 'drawer';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: SheetVariant;
  /**
   * 면 색 — **opt-in**. 지정하지 않으면 `--color-surface-strong` 이고, 기존 시트의 외형은
   * 1픽셀도 바뀌지 않는다. 값이 바뀔 때는 `--motion-duration-slow` 로 **전환**된다
   * (뒤집기와 같은 길이 — 중간 프레임에서 색이 튀지 않는다. `prefers-reduced-motion` 에서는
   * 전환하지 않는다).
   */
  surface?: SheetSurface | undefined;
  /**
   * 헤더 **왼쪽** 슬롯 (뒤로 IconButton 등 — `D4-64`, 4b Spec §16.7). `[leading] [title] … [trailing]`.
   * 주지 않으면 렌더 0 — 기존 시트의 DOM·외형은 그대로다 (`trailing` 과 대칭).
   */
  leading?: ReactNode;
  /** 헤더 우측 슬롯 (닫기 IconButton 등). */
  trailing?: ReactNode;
  /**
   * 본문 **아래에 고정**되는 슬롯 — 스크롤 영역 밖이다.
   *
   * Figma `163:1898`(`type=shelf`)·`145:1085` 의 `Button/card` ActionBar 는 카드 **하단에
   * 고정**되어 있고 목록만 스크롤한다 `[실측]`. 그래서 본문(`overflow-y: auto`) 안에 두지
   * 않는다 — 본문에 넣으면 스크롤할 때 CTA 가 함께 사라지고, 목록 그림자가 잘릴 자리도
   * 사라져 `contentShadowInset` 이 무의미해진다.
   *
   * 주지 않으면 **아무것도 렌더하지 않는다** — `bottom`·`full` 시트의 외형은 그대로다.
   */
  footer?: ReactNode;
  /** 열릴 때 포커스를 받을 요소. 없으면 시트 안 첫 포커스 대상. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** false 면 Esc·배경 탭으로 닫히지 않는다. */
  dismissible?: boolean;
  /**
   * `R-SHADOW-1` — 본문(`overflow-y: auto`) 안에 drop shadow 요소가 있을 때 켠다. 그림자 자리를
   * padding 으로 만들고 음수 margin 으로 레이아웃 점유를 되돌린다 (Library Design Spec §8.1 ①).
   * 기본값 `false` — 켜지 않은 시트의 외형은 그대로다.
   *
   * | 값 | 대상 그림자 | 자리 (**픽셀 프로브 실측**) |
   * |---|---|---|
   * | `true` | `--shadow-bubble` (`ListGroup`) | 아래 10 · 좌우 4 |
   * | `'cover'` | `--shadow-cover` (`BookCover`) | **좌우 14** (아래·위는 표지 자리가 따로 갖는다) |
   *
   * ⚠️ 번짐이 다르면 값도 다르다 — 한쪽 값을 다른 쪽에 쓰면 잘린다. 겹을 전부 합산하고
   * 브라우저에서 재측정한 값만 쓴다 (`rules/frontend.md` §6-1 `R-SHADOW-1` ③).
   */
  contentShadowInset?: boolean | 'cover';
}

/**
 * Sheet — Design Spec §4.21.
 *
 * `role="dialog"` + `aria-modal` + focus trap + `Esc` + 배경 스크롤 잠금.
 * 닫힐 때 포커스는 트리거로 되돌아간다 (`useFocusTrap`).
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  variant = 'bottom',
  surface,
  leading,
  trailing,
  footer,
  initialFocus,
  dismissible = true,
  contentShadowInset = false,
}: SheetProps) {
  const titleId = useId();
  const { mounted, state } = usePresence(open, MOTION_DURATION_MS.base);
  const containerRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: dismissible ? onClose : undefined,
    initialFocus,
  });
  useBodyScrollLock(open);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="haru-sheet-root">
      {/*
       * 닫힘 중(240ms)에도 scrim 은 탭을 **흡수**하되 `onClose` 를 다시 부르지 않는다 (Stage 4b Spec §20.4 ·
       * `D4-138` Q1). 통과시키면 연속 탭의 두 번째가 scrim 아래(세션 화면의 Record Control · Submit)로 샌다.
       */}
      <Scrim
        level="sheet"
        state={state}
        onClick={dismissible && state === 'open' ? onClose : undefined}
      />
      <div
        ref={containerRef}
        className={cx(
          'haru-sheet',
          `haru-sheet--${variant}`,
          `haru-sheet--${state}`,
          surface === undefined ? undefined : `haru-sheet--surface-${surface}`,
        )}
        role="dialog"
        /*
         * 닫힘 중에는 모달이 아니다 (§20.4 · `D4-138` Q1) — 사라지는 시트가 `[aria-modal="true"]` 로 남으면
         * 다른 레이어가 Escape 를 양보하고(`SessionPromptsPopover` `modalOpen()`), 보조기술이 트리거를 모달 밖으로 본다.
         * `inert` 는 시트 내부 조작(화살표 · 스와이프 · Tab 진입)을 막는다. 포커스는 닫힘 시작에 이미 트리거로 돌아갔다.
         */
        aria-modal={state === 'open' ? 'true' : undefined}
        inert={state === 'closing'}
        aria-labelledby={titleId}
      >
        {/* 떠 있는 카드에는 grabber 가 없다 (Figma `145:1085` · `163:2347` 실측). */}
        {variant === 'inset-card' ? null : (
          <span className="haru-sheet__grabber" aria-hidden="true" />
        )}
        <div className="haru-sheet__header">
          {leading === undefined ? null : <div className="haru-sheet__leading">{leading}</div>}
          <Text as="h2" id={titleId} variant="headline" tone="primary">
            {title}
          </Text>
          {trailing === undefined ? null : <div className="haru-sheet__trailing">{trailing}</div>}
        </div>
        <div
          className={cx(
            'haru-sheet__content',
            contentShadowInset === true && 'haru-sheet__content--shadow-inset',
            contentShadowInset === 'cover' && 'haru-sheet__content--shadow-inset-cover',
          )}
        >
          {children}
        </div>
        {footer === undefined ? null : <div className="haru-sheet__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
