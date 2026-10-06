import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

export interface ListRowProps {
  title: ReactNode;
  /** 보조 1행 (예: 저자 · `{n} sessions · finished {date}`). */
  subtitle?: ReactNode;
  /**
   * 행 앞 미디어 — Library Design Spec §3.5 (Figma `30:141` 표지 34×48).
   * media 가 있으면 행 최소 높이가 56 → **74**(`--book-list-row-height-min`) 가 된다.
   * 같은 정보(제목)가 옆에 텍스트로 있으므로 호출 측이 장식으로 넘긴다 (`alt=""`).
   */
  media?: ReactNode;
  /**
   * 보조 1행의 **우측** 값 (예: `Rated 4.5`). `subtitle` 과 같은 줄에서 양끝 정렬된다.
   * 값이 없으면(`unrated`) **넘기지 않는다** — 빈 자리에 대체 문구를 넣지 않고 좌측 메타의
   * 좌측 정렬을 유지한다 (`L-OPEN-22`).
   */
  meta?: ReactNode;
  /**
   * 행 우측 요소 — chevron · IconButton · Checkbox.
   * `onPress` 를 함께 주면 행 전체가 `<button>` 이 되므로 **인터랙티브 요소를 넣지 않는다**
   * (중첩 버튼 금지). 인터랙티브 trailing 이 필요하면 `onPress` 없이 쓴다.
   */
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** trailing Checkbox 등으로 선택된 행 (§4.3 state `selected`). */
  selected?: boolean;
}

/**
 * ListRow — Stage 2 Design Spec §4.3 (Figma `163:2145`) + Library Design Spec §3.5 (`30:141`).
 *
 * 변형은 `media` 유무로만 갈린다: `basic`(최소 56) / `media`(최소 74).
 * `onPress` 가 있으면 행 전체가 버튼이 되고 접근성 이름은 title(+subtitle+meta) 이다.
 *
 * ── 제목 타이포에 `titleVariant` 를 두지 않는다 (`L-NEW-07`) ──
 * Stage 2 가 추정한 기본값 `footnote`(13) 를 Figma 실측(`text-[14px]` → `subheadline` 15 흡수,
 * Library Design Spec §3.5)으로 **정규화**했으므로 Library 전용 타이포 슬롯이 필요 없다
 * (`stage-3-approvals.md` §20.3 ③).
 */
export function ListRow({
  title,
  subtitle,
  media,
  meta,
  trailing,
  onPress,
  disabled = false,
  selected = false,
}: ListRowProps) {
  const subtitleNode =
    subtitle === undefined ? null : <span className="haru-list-row__subtitle">{subtitle}</span>;

  const body = (
    <>
      {media === undefined ? null : <span className="haru-list-row__media">{media}</span>}
      <span className="haru-list-row__text">
        <span className="haru-list-row__title">{title}</span>
        {/*
          `meta` 가 없으면 래퍼를 만들지 않는다 — 기존 `subtitle` 전용 행의 DOM 과 레이아웃이
          1px 도 바뀌지 않아야 한다 (Settings · 온보딩).
        */}
        {meta === undefined ? (
          subtitleNode
        ) : (
          <span className="haru-list-row__meta-row">
            {subtitleNode}
            <span className="haru-list-row__meta">{meta}</span>
          </span>
        )}
      </span>
      {trailing === undefined ? null : <span className="haru-list-row__trailing">{trailing}</span>}
    </>
  );

  return (
    <li
      className={cx(
        'haru-list-row',
        media !== undefined && 'haru-list-row--media',
        selected && 'haru-list-row--selected',
        disabled && 'haru-list-row--disabled',
      )}
    >
      {onPress === undefined ? (
        <div className="haru-list-row__content">{body}</div>
      ) : (
        <button
          type="button"
          className="haru-list-row__content haru-list-row__content--pressable haru-focus-ring"
          disabled={disabled}
          aria-current={selected ? true : undefined}
          onClick={onPress}
        >
          {body}
        </button>
      )}
    </li>
  );
}
