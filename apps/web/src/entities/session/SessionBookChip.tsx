/**
 * `SessionBookChip` — recording · paused 중앙 책 칩 (Figma `296:1203`, 4b Spec §2.2 · §4 #7 · AC-4-126).
 *
 * ```
 * hug × 40 · radius pill · white 74% · --shadow-bubble · pad 15 · gap 8   (가운데 — `AD-S4-13`)
 * ├ 표지 16×22 radius 3   coverUrl 있으면 이미지 / 없으면 `T-5` 그라디언트
 * └ 제목  Footnote 13 · semibold · primary · **1줄 말줄임**
 * ```
 *
 * - **`book.title` 을 그대로** 표시한다 — 가공·대체 문구 0 (`SessionSummary.book`).
 * - `book === null` 이면 렌더하지 않는다. 자리(40 + 23)는 **부모가** 유지한다 — 상태 블록 y 가 움직이지
 *   않는다 (Spec §2.1 구현 지시).
 * - 비인터랙티브. 표지는 장식(`alt=""`) — 제목이 이름이다. 말줄임은 CSS 로만 한다 (Spec §9.1).
 */
import type { BookSummary } from '@haru/contracts';

export interface SessionBookChipProps {
  book: BookSummary | null;
}

export function SessionBookChip({ book }: SessionBookChipProps) {
  if (book === null) return null;

  return (
    <span className="haru-session-book-chip">
      {book.coverUrl === undefined ? (
        <span
          className="haru-session-book-chip__cover haru-session-book-chip__cover--placeholder"
          aria-hidden="true"
        />
      ) : (
        <img className="haru-session-book-chip__cover" src={book.coverUrl} alt="" />
      )}
      <span className="haru-session-book-chip__title">{book.title}</span>
    </span>
  );
}
