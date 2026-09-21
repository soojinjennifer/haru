/**
 * Gallery 공통 조립 요소 — Design Spec §11-5.
 *
 * dev 전용이므로 `packages/ui` 에 넣지 않는다(제품 컴포넌트가 아니다).
 * 스타일은 `src/dev/dev.css` 의 `haru-dev-*` 평문 CSS 만 쓴다 (Tailwind 유틸리티 금지 —
 * Production CSS 에 클래스가 새지 않게 하기 위함).
 */
import { AppColumn } from '@haru/ui';
import type { ReactNode } from 'react';

export interface SectionProps {
  /** Playwright 시각 비교 대상 id (`docs/design/stage-1-design-spec.md` §10.2 V-1 … V-9). */
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}

/** 시각 비교 단위. `data-demo` 로 Playwright 가 이 블록만 스냅샷한다. */
export function Section({ id, title, note, children }: SectionProps) {
  return (
    <section className="haru-dev-section" aria-labelledby={`${id}-title`}>
      <h2 className="haru-dev-section__title" id={`${id}-title`}>
        {title}
      </h2>
      {note === undefined ? null : <p className="haru-dev-section__note">{note}</p>}
      <div data-demo={id}>{children}</div>
    </section>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return <h3 className="haru-dev-subhead">{children}</h3>;
}

export function Row({ children, top = false }: { children: ReactNode; top?: boolean }) {
  return <div className={top ? 'haru-dev-row haru-dev-row--top' : 'haru-dev-row'}>{children}</div>;
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="haru-dev-stack">{children}</div>;
}

export function Grid({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'haru-dev-grid haru-dev-grid--wide' : 'haru-dev-grid'}>{children}</div>
  );
}

/** 앱 gradient 위에 올린 데모 무대 — glass 재질을 실제 조건에서 본다. */
export function Stage({ children, plain = false }: { children: ReactNode; plain?: boolean }) {
  return (
    <div className={plain ? 'haru-dev-stage haru-dev-stage--plain' : 'haru-dev-stage'}>
      <div className="haru-dev-column">{children}</div>
    </div>
  );
}

export interface ScreenFrameProps {
  /** TopBar 슬롯 — 공통 상태 6종은 전부 TopBar 컨텍스트에서 확인한다 (Design Spec §5). */
  topBar?: ReactNode;
  children: ReactNode;
  /** 콘텐츠 영역 세로 가운데 정렬 (Empty · Error — §5.2 · §5.3). */
  center?: boolean;
  footer?: ReactNode;
}

/**
 * 화면 프레임 — `AppColumn` + TopBar + 콘텐츠 영역.
 * `AppShell` 과 같은 구조지만 viewport 를 차지하지 않고 gallery 안에 박스로 들어간다.
 */
export function ScreenFrame({ topBar, children, center = false, footer }: ScreenFrameProps) {
  return (
    <div className="haru-dev-frame">
      <AppColumn as="div">
        <div className="haru-dev-frame__inner">
          {topBar}
          <div
            className={
              center
                ? 'haru-dev-frame__content haru-dev-frame__content--center'
                : 'haru-dev-frame__content'
            }
          >
            {children}
          </div>
          {footer}
        </div>
      </AppColumn>
    </div>
  );
}
