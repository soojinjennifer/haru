/**
 * `ReadingNowCard` — Library Design Spec §3.2 (Figma `145:1145` `[실측]`).
 *
 * ```
 * 345×118 · padding 14 · gap 14 · radius 22 · surface-strong · --shadow-bubble
 * ├ BookCover size="xl" (64×90, --shadow-cover)
 * └ 텍스트 열 (gap 3)
 *     제목 16/Bold · 부제 12/Regular secondary · 진행 바 h7 · 메타 11/Medium tertiary
 * ```
 *
 * ── `overflow: clip` 을 걸지 않는다 (사용자 결정 2라운드) ──
 * Figma 는 카드에 clip content 를 걸고 있고 그 결과 **표지 그림자 아래 6px 이 잘린다**
 * (표지 하단 104 + 번짐 20 = 124 > 카드 118 — Design Spec §8.3). 사용자가 **표지 그림자를
 * 살리는 쪽**(§8.3 안 ②)을 택했으므로 `overflow` 를 선언하지 않는다. 그 결과:
 *   - `AppColumn` 안쪽에 새 클리핑 박스가 생기지 않는다 (`R-SHADOW-1` ① 회피가 1순위)
 *   - 표지 그림자가 카드 아래로 6px 번진다 → Figma 와의 차이로 **보고 대상**이다
 *
 * ── 프론트가 계산하지 않는 것 ──
 * `progressRatio` 는 **서버 값만 그린다**. 회차(`completedNights / plannedNights`)로 되계산하지
 * 않는다 (`L-OPEN-16`, `P3-BIP-17`). `null` 이면 진행 바를 **렌더하지 않는다**.
 *
 * 높이를 고정하지 않는다 — 118 은 결과값이고 텍스트 200% 확대에서 늘어나야 한다 (§9.1).
 *
 * ── 이번 라운드에는 **비대화형**이다 ──
 * §6.1 은 "카드 탭 → `BookDetailSheet`" 를 정하지만 **시트는 다음 작업**이다. 아무 일도 하지
 * 않는 `<button>` 을 만들지 않으려고 `<div>` 로 둔다 — 시트가 생기는 라운드에서 함께 버튼이
 * 된다 (§9.4 의 카드 접근성 이름도 그때 붙는다).
 */
import { ProgressBar, Text } from '@haru/ui';
import type { LibraryBook } from '@haru/contracts';

import { BookCover } from '../book/BookCover';

export interface ReadingNowCardProps {
  book: LibraryBook;
  /** 표시 제목 — `book` 이 `null` 인 직접 등록 책을 호출 측이 이미 해석해 넘긴다. */
  title: string;
  /** `Ashley Spires · Self-Direction` 같은 부제. 없으면 생략한다. */
  subtitle?: string | undefined;
  /** `Last read Tue · 12 min`. 없으면 생략한다. */
  meta?: string | undefined;
  /** 진행 바 접근성 이름 (문구는 feature 가 소유한다). */
  progressLabel: string;
  /** 진행 상태를 텍스트로도 전달한다 (`aria-valuetext`). */
  progressValueText?: string | undefined;
}

export function ReadingNowCard({
  book,
  title,
  subtitle,
  meta,
  progressLabel,
  progressValueText,
}: ReadingNowCardProps) {
  const ratio = book.readingProgress?.progressRatio ?? null;

  return (
    <div className="haru-reading-now">
      <BookCover
        title={title}
        author={book.book?.author ?? book.userEnteredAuthor ?? undefined}
        coverUrl={book.book?.coverUrl ?? undefined}
        size="xl"
        decorative
      />
      <span className="haru-reading-now__text">
        <Text as="span" variant="callout" weight="bold" tone="primary" truncate={1}>
          {title}
        </Text>
        {subtitle === undefined ? null : (
          <Text as="span" variant="caption-1" tone="secondary" truncate={1}>
            {subtitle}
          </Text>
        )}
        {/* `progressRatio === null` → 진행 바를 렌더하지 않는다 (서버 값만 그린다). */}
        {ratio === null ? null : (
          <span className="haru-reading-now__progress">
            <ProgressBar
              value={ratio}
              max={1}
              label={progressLabel}
              valueText={progressValueText}
            />
          </span>
        )}
        {meta === undefined ? null : (
          <Text as="span" variant="caption-2" weight="medium" tone="tertiary">
            {meta}
          </Text>
        )}
      </span>
    </div>
  );
}
