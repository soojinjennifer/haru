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
 * ── `onPress` (시트 라운드에서 연결) ──
 * §6.1 "카드 탭 → `BookDetailSheet`". 주면 root 가 `<button>` 이 된다 — `.haru-reading-now`
 * 는 1라운드부터 `border: 0` · `background-color` · `font-family` · `color: inherit` ·
 * `text-align: start` 를 갖고 있어 UA 기본값이 이미 되돌려져 있고, rest 상태의 렌더가 바뀌지
 * 않는다. 면·테두리를 새로 입히지 않는다 (Figma 에 눌림 상태 표현이 없다).
 *
 * 접근성 이름(§9.4)은 **카드 안의 텍스트**(제목·부제·메타)로 계산된다 — 진행 바는 자체 이름을
 * 갖고 `aria-hidden` 이 아니므로 `aria-label` 로 덮지 않는다.
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
  /** 주면 카드 전체가 `<button>` 이 된다 (§6.1 — `BookDetailSheet` 열기). */
  onPress?: (() => void) | undefined;
}

export function ReadingNowCard({
  book,
  title,
  subtitle,
  meta,
  progressLabel,
  progressValueText,
  onPress,
}: ReadingNowCardProps) {
  const ratio = book.readingProgress?.progressRatio ?? null;
  /*
    진행 바는 `role="progressbar"` 다 — 버튼 **안**에 두면 대화형 요소 안의 ARIA 구조가
    되지만 포커스 대상이 아니므로 중첩 버튼 문제는 없다. `<button>` 경로에서도 같은 DOM 을
    쓰는 이유는 rest 렌더를 1px 도 바꾸지 않기 위해서다.
  */
  const Root = onPress === undefined ? 'div' : 'button';

  return (
    <Root
      className="haru-reading-now haru-focus-ring"
      {...(onPress === undefined ? {} : { type: 'button' as const, onClick: onPress })}
    >
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
    </Root>
  );
}
