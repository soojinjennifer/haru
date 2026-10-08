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
 * ── `onPress` (시트 라운드에서 연결) ──
 * §6.1 "행 탭 → `BookDetailSheet`(행 전체가 `<button>`)". `ListRow` 가 `onPress` 를 받으면
 * `__content` 가 `<button>` 이 되고 그 선택자는 이미 UA 기본값을 되돌려 두었으므로 rest 상태의
 * 렌더가 바뀌지 않는다 (`--pressable` 은 `cursor` · hover/active 전환만 더한다).
 * chevron 은 Figma 요소이므로 **빼지 않고** 장식(`aria-hidden`)으로 둔다 — `ListRow` 규칙대로
 * trailing 에 인터랙티브 요소를 넣지 않으므로 중첩 버튼이 생기지 않는다.
 *
 * `onPress` 를 주지 않으면 비대화형 `<div>` 그대로다 (Skeleton·읽기 전용 목록 경로).
 */
import { Icon, ListRow, Text } from '@haru/ui';

import { BookCover } from './BookCover';

export interface BookListRowProps {
  title: string;
  author?: string | undefined;
  coverUrl?: string | undefined;
  /**
   * 좌측 보조 1행 — `4 sessions · finished Mar 3`. 문구는 호출 측(copy 모듈)이 만든다.
   *
   * **없으면 넘기지 않는다**: 아직 읽지 않은 책(`Our curated shelf` 전체 목록)에 `0 sessions`
   * 를 찍지 않기 위해서다. 호출 측이 저자명 같은 다른 보조 문구를 넘길 수도 있다.
   */
  meta?: string | undefined;
  /** 1–5 또는 `null`. `null` 이면 우측 meta 를 렌더하지 않는다. */
  averageRating: number | null;
  /** `Rated ` 접두 — copy 모듈이 소유한다. */
  ratedPrefix: string;
  /** 서버 값을 그대로 쓴 표시 문자열 (`4.5`). Frontend 가 가공하지 않는다. */
  ratingText?: string | undefined;
  /** 주면 행 전체가 `<button>` 이 된다 (§6.1 — `BookDetailSheet` 열기). */
  onPress?: (() => void) | undefined;
}

export function BookListRow({
  title,
  author,
  coverUrl,
  meta,
  averageRating,
  ratedPrefix,
  ratingText,
  onPress,
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
      {...(meta === undefined
        ? {}
        : {
            subtitle: (
              <Text as="span" variant="caption-2" tone="tertiary">
                {meta}
              </Text>
            ),
          })}
      meta={rating}
      trailing={
        <span className="haru-book-row__chevron">
          <Icon name="chevron-right" size="sm" tone="inherit" decorative />
        </span>
      }
      {...(onPress === undefined ? {} : { onPress })}
    />
  );
}
