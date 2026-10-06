/**
 * `BookListRow` — Book List 한 행 (Library Design Spec §3.5, Figma `30:141` · `163:2100` `[실측]`).
 *
 * `ListRow` 를 그대로 조합한다 (새 행 컴포넌트를 만들지 않는다):
 * `media` = `BookCover size="sm"`(34×48) · `subtitle` = 좌측 메타 · `meta` = `Rated 4.5` ·
 * `trailing` = chevron.
 *
 * | 조각 | Figma | 처리 |
 * |---|---|---|
 * | 제목 | 14 / Semibold → `subheadline`(15) 흡수 | `ListRow` 기본값 (`L-NEW-07` 정규화) |
 * | 메타(좌) | 11.5 / Regular / `#9aabaa` | `caption-2` + `tertiary` — 320px 에서 **줄바꿈**(말줄임 금지) |
 * | 메타(우) | `Rated ` 11.5 Regular + `4.5` 12 Bold, 같은 색 | 2-스타일 합성 |
 * | chevron | 15×15 stroke `#9AABAA` | Lucide `chevron-right` + `--size-icon-sm`(16 흡수) · `aria-hidden` |
 *
 * ── `averageRating === null` (`L-OPEN-22`) ──
 * 우측 meta 를 **아예 넘기지 않는다** → `ListRow` 가 meta 래퍼를 만들지 않아 좌측 메타의
 * **좌측 정렬이 유지**된다. 빈 자리에 대체 문구를 넣지 않는다.
 *
 * ── `ownership` 표식을 만들지 않는다 (`L-OPEN-14`) ──
 * `owned` / `gifted` / `gift_pending` 를 드러내는 요소가 **없다**. 데이터는 contract 에 남는다.
 *
 * ── 이번 라운드에는 **비대화형**이다 ──
 * §6.1 은 "행 탭 → `BookDetailSheet`" 를 정하지만 **시트는 다음 작업**이다. 아무 일도 하지 않는
 * `<button>` 을 만들지 않으려고 `onPress` 를 넘기지 않는다. chevron 은 Figma 에 있는 요소이므로
 * **빼지 않고** 그대로 그린다 (장식이며 `aria-hidden`).
 */
import { Icon, ListRow, Text } from '@haru/ui';

import { BookCover } from './BookCover';

export interface BookListRowProps {
  title: string;
  author?: string | undefined;
  coverUrl?: string | undefined;
  /** `4 sessions · finished Mar 3` — 문구는 호출 측(copy 모듈)이 만든다. */
  meta: string;
  /** 1–5 또는 `null`. `null` 이면 우측 meta 를 렌더하지 않는다. */
  averageRating: number | null;
  /** `Rated ` 접두 — copy 모듈이 소유한다. */
  ratedPrefix: string;
  /** 서버 값을 그대로 쓴 표시 문자열 (`4.5`). Frontend 가 가공하지 않는다. */
  ratingText?: string | undefined;
}

export function BookListRow({
  title,
  author,
  coverUrl,
  meta,
  averageRating,
  ratedPrefix,
  ratingText,
}: BookListRowProps) {
  const rating =
    averageRating === null || ratingText === undefined ? undefined : (
      <>
        <Text as="span" variant="caption-2" tone="tertiary">
          {ratedPrefix}
        </Text>
        <Text as="span" variant="caption-1" weight="bold" tone="tertiary" numeric>
          {ratingText}
        </Text>
      </>
    );

  return (
    <ListRow
      title={title}
      media={<BookCover title={title} author={author} coverUrl={coverUrl} size="sm" decorative />}
      subtitle={
        <Text as="span" variant="caption-2" tone="tertiary">
          {meta}
        </Text>
      }
      meta={rating}
      trailing={
        <span className="haru-book-row__chevron">
          <Icon name="chevron-right" size="sm" tone="inherit" decorative />
        </span>
      }
    />
  );
}
