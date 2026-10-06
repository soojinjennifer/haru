/**
 * `BookCover` — Design Spec §5.3 (Figma `85:610` 58×83 · `163:2101` 34×48).
 *
 * **고정 `aspect-ratio` + `object-fit: cover`** 로 구현한다 (`CONFIRMED (D-13 ③)`).
 * 원본 비율 편차는 CSS 가 흡수하고 이미지마다 크기를 조정하지 않는다 — Stage 2 `QA-2-004`
 * (표지가 늘어나거나 레이아웃이 흔들리던 결함)의 재발 방지 장치다.
 *
 * | variant | 언제 |
 * |---|---|
 * | `default` | `coverUrl` 이 있고 로드에 성공 |
 * | `placeholder` | 표지가 없거나 **로드 실패**(`onError`) — pastel 배경 + 제목 이니셜 1–2자 |
 *
 * `placeholder` 에 "No cover" 같은 **판정 문구를 넣지 않는다** (§5.3).
 *
 * 접근성: `alt` 는 **"{제목} by {저자}"** 다. `ListRow` 처럼 제목이 이미 텍스트로 있는 자리에서는
 * `decorative` 로 `alt=""` 를 쓴다 (중복 읽기 방지). 장식이 기본값이 아니다.
 *
 * 크기는 Stage 3 Home 이 쓰는 `md`(58) 하나다. `sm`·`lg` 토큰은 **서재 화면이 나오는 시점**에
 * 추가한다 (`D-14` — 해당 화면의 컴포넌트가 나올 때 만든다).
 */
import { Text } from '@haru/ui';
import { useState } from 'react';

export type BookCoverSize = 'md';

export interface BookCoverProps {
  title: string;
  author?: string | undefined;
  coverUrl?: string | undefined;
  size?: BookCoverSize;
  /** `true` 면 `alt=""` — 같은 정보가 옆에 텍스트로 있을 때만 쓴다. */
  decorative?: boolean;
}

/** 제목 이니셜 1–2자. 단어가 하나면 첫 글자만. */
export function coverInitials(title: string): string {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((word) => word.length > 0);

  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';

  return `${first}${second}`.toUpperCase();
}

export function coverAlt(title: string, author?: string | undefined): string {
  return author === undefined || author.length === 0 ? title : `${title} by ${author}`;
}

export function BookCover({
  title,
  author,
  coverUrl,
  size = 'md',
  decorative = false,
}: BookCoverProps) {
  /*
    **실패한 URL 자체**를 기억한다. 단순 boolean 이면 표지가 바뀔 때 effect 로 되돌려야 하는데,
    그러면 렌더가 한 번 더 돌고(그 사이 깨진 이미지가 보인다) effect 안 setState 가 된다.
    값으로 두면 "지금 URL 이 실패한 그 URL 인가" 를 렌더 중에 바로 판정할 수 있다.
  */
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = coverUrl !== undefined && failedUrl === coverUrl;

  const className = `haru-book-cover haru-book-cover--${size}`;

  if (coverUrl === undefined || coverUrl.length === 0 || failed) {
    return (
      <div
        className={`${className} haru-book-cover--placeholder`}
        {...(decorative
          ? { 'aria-hidden': true }
          : { role: 'img', 'aria-label': coverAlt(title, author) })}
      >
        <Text as="span" variant="caption-1" tone="secondary" weight="semibold">
          {coverInitials(title)}
        </Text>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={coverUrl}
        alt={decorative ? '' : coverAlt(title, author)}
        decoding="async"
        loading="lazy"
        onError={() => {
          setFailedUrl(coverUrl);
        }}
      />
    </div>
  );
}
