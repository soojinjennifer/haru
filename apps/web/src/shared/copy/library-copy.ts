/**
 * `/library` 문구 — Library Design Spec §6.4 · §7.4.
 *
 * **Figma 문구 그대로** 쓴다: `Reading now` · `Our curated shelf` · `Favorites` ·
 * `Finished together` · `See all` · `Rated ` · `{n} sessions · finished {date}` ·
 * `Last read {day} · {min} min` · `{a} of {b} nights` `[실측]`.
 *
 * 쓰지 않는 문구: **"Books you own"**(Figma 에 없다 — approvals §14.1, `AD-S3-4` 삭제) ·
 * **"My Saved"**(`L-D1` 이 `Favorites` 를 택했다).
 *
 * 상태 화면 문구(§7.4)는 Figma 에 없는 승인된 예외이며 전부 `RECOMMENDED` 다 — 승인 없이
 * 확정 문구로 굳히지 않는다 (Design Spec §14 ⑤).
 *
 * 진단·판정·비교 표현을 쓰지 않는다. 평점은 **서버 값 표시**이고 Frontend 가 등급·우열 문구를
 * 더하지 않는다 (`rules/frontend.md` §8).
 */
import type { LibrarySectionKey } from '@haru/contracts';

/** 날짜 문구는 사용자 노출 언어(영어) 로만 만든다. */
const LOCALE = 'en-US';

/** `finished Mar 3` 의 날짜 조각. Figma 는 `{date}` 자리만 보여 주므로 형식은 `[추정]` 이다. */
const monthDay = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' });

/** `Last read Tue` 의 요일 조각 `[실측 — Figma 가 `{day}` 를 축약 요일로 쓴다]`. */
const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });

export const libraryCopy = {
  title: 'Library',

  /**
   * 섹션 제목 — Figma 순서대로다 (`Reading now` → `Our curated shelf` → `Favorites` →
   * `Finished together`). 순서 자체는 **서버가 정한다** (`L-OPEN-01`) — 이 객체는 제목만 갖는다.
   */
  sectionTitles: {
    readingNow: 'Reading now',
    curated: 'Our curated shelf',
    favorites: 'Favorites',
    finished: 'Finished together',
  },

  /** `SectionHeader` 액션. 접근성 이름은 `SectionHeader` 가 제목과 합쳐 만든다 (§9.4). */
  seeAll: 'See all',

  /** `Rated ` 접두 — 뒤에 숫자가 **다른 타이포**로 붙는다 (§3.5 2-스타일 합성). */
  ratedPrefix: 'Rated ',

  /** 캐러셀 `aria-live` 문구. dots 는 장식이므로 상태는 텍스트가 전달한다 (§9.4). */
  carouselStatus: (page: number, total: number): string =>
    `Page ${String(page)} of ${String(total)}`,

  /** 상태 화면 — Design Spec §7.4. 전부 `RECOMMENDED`. */
  states: {
    /**
     * ⭐ `Favorites` 0건은 **예외 상황이 아니다** — 아직 아무것도 저장하지 않은
     * 처음 쓰는 사용자가 보는 **정상 화면**이다. 그래서 "비어 있다 / 없다" 로 읽히지 않게
     * **다음에 할 일**을 알려주는 문구만 쓴다 (사용자 지시 2라운드).
     */
    favoritesEmpty: {
      title: 'Nothing saved yet',
      description: 'Tap ★ Save on a card to keep a book here.',
    },
    finishedEmpty: {
      title: 'No finished books yet',
      description: 'Books you finish together will show up here.',
    },
    curatedEmpty: {
      title: 'No picks right now',
      description: 'New picks arrive each week.',
    },
    /** Error·Offline 은 같은 경로다 — 사전 차단 UI 를 만들지 않는다 (§7.4). */
    errorTitle: 'We could not load your library',
    retry: 'Try again',
    loading: 'Loading your library',
  },
} as const;

/** 섹션 key → Figma 제목. 섹션이 늘면 컴파일 에러로 누락을 알린다. */
export const librarySectionTitle: Readonly<Record<LibrarySectionKey, string>> = {
  curated: libraryCopy.sectionTitles.curated,
  favorites: libraryCopy.sectionTitles.favorites,
  finished: libraryCopy.sectionTitles.finished,
};

/** 섹션 key → 0건 안내 (§7.4). */
export const librarySectionEmpty: Readonly<
  Record<LibrarySectionKey, { title: string; description: string }>
> = {
  curated: libraryCopy.states.curatedEmpty,
  favorites: libraryCopy.states.favoritesEmpty,
  finished: libraryCopy.states.finishedEmpty,
};

/**
 * `3 of 5 nights` — `SectionHeader` `meta` 모드 (`L-OPEN-17`).
 *
 * `plannedNights === null` 이면 **문구를 만들지 않는다**(`undefined`) — 회차 문구를 생략하고
 * 헤더 높이만 유지한다 (Design Spec §3.1).
 */
export function nightsMeta(
  completedNights: number,
  plannedNights: number | null,
): string | undefined {
  if (plannedNights === null) return undefined;
  return `${String(completedNights)} of ${String(plannedNights)} nights`;
}

/**
 * `Last read Tue · 12 min` — `ReadingNowCard` 메타 (`145:1152`).
 * 조각이 없으면 **그 조각만 생략**한다. 둘 다 없으면 `undefined`.
 */
export function lastReadMeta(
  lastReadAt: string | null,
  lastSessionMinutes: number | null,
): string | undefined {
  const parts: string[] = [];
  if (lastReadAt !== null) parts.push(`Last read ${weekday.format(new Date(lastReadAt))}`);
  if (lastSessionMinutes !== null) parts.push(`${String(lastSessionMinutes)} min`);
  return parts.length === 0 ? undefined : parts.join(' · ');
}

/**
 * `4 sessions · finished Mar 3` — Book List 행의 좌측 메타 (`30:141`).
 * 날짜가 없으면 세션 수만 남긴다.
 */
export function finishedMeta(sessionCount: number, finishedAt: string | null): string {
  const sessions = `${String(sessionCount)} ${sessionCount === 1 ? 'session' : 'sessions'}`;
  if (finishedAt === null) return sessions;
  return `${sessions} · finished ${monthDay.format(new Date(finishedAt))}`;
}

/**
 * 평점 숫자 — `4.5`. 정수면 소수점을 붙이지 않는다(`5`).
 * 반올림·구간화 같은 **가공을 하지 않는다** (서버 값 표시).
 */
export function ratingText(averageRating: number): string {
  return Number.isInteger(averageRating) ? String(averageRating) : averageRating.toFixed(1);
}
