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
import type { GiftRequestStatus, LibrarySectionKey } from '@haru/contracts';

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

  /* ===== 시트 (§3.7 · §3.8) ============================================== */

  /**
   * 시트 헤더 우상단 닫기 버튼의 접근성 이름. Figma 글리프는 `확인 불가` 이고
   * `stage-3-design-spec.md` §2.8 이 **닫기 `IconButton`** 으로 확정했다.
   */
  closeSheet: 'Close',

  shelfSheet: {
    /** 전체 목록 블록의 접근성 이름 — 보이는 제목(섹션 이름)은 시트 헤더가 갖는다. */
    listLabel: 'All books in this shelf',
    /** 추가 페이지를 받는 중 (`paged`). 목록 자리에 Skeleton 2행이 들어간다. */
    loadingMore: 'Loading more books',
    emptyTitle: 'Nothing here yet',
    emptyDescription: 'Books will show up here as you save and read together.',
    errorTitle: 'We could not load this shelf',
  },

  bookSheet: {
    /** Prompt 목록 블록의 접근성 이름 (`PromptPreview` 와 같은 역할). */
    promptsLabel: 'Prompts for this book',
    /** Prompt 를 아직 받는 중. */
    promptsLoading: 'Loading prompts',
    /** Prompt 조회 실패 — 시트의 나머지(책·액션)는 그대로 보인다. */
    promptsErrorTitle: 'We could not load the prompts',
    /**
     * 카탈로그에 없는 책(`book === null`)에는 Prompt 세트가 **존재할 수 없다**.
     * 판정 문구를 쓰지 않고 다음에 할 일만 알린다.
     */
    promptsUnavailable: 'Prompts arrive once this book is in our catalogue.',
    /** `★ Save` — Home 과 **같은 문구**다 (같은 `SaveButton` 을 쓴다). */
    save: 'Save',
    saved: 'Saved',
    saveFailed: "We couldn't save that book. Try again.",
    /**
     * 주 CTA — Stage 4 `S4-F1` 에서 **책이 정해진 시트에서 활성**이다 (`D-3` 해제, AC-4-38).
     * 대상 책이 없는 Shelf 시트에서만 비활성이며, `reason` 이 비어 있는 이유는 Home 과 같다.
     */
    startSession: { label: 'Start Session', reason: null as string | null },
    /** 세션 생성 실패 (Toast). ⚠️ 문구 승인 대상 — Home 시트와 같은 문장. */
    startFailed: "We couldn't start the session. Please try again.",
    /*
     * 증정 **신청** CTA 는 없다 (사용자 결정 2026-10-10: 신청 제거, 조회 유지).
     * `requestBook` 문구를 되살리지 않는다 — 조회는 `giftRequestStatusCopy` 와
     * `giftRequests.*` 가 담당한다.
     */
    /** 외부 구매 링크 — `purchaseUrl` 이 있을 때만 보인다. */
    whereToBuy: 'Where to buy',
    whereToBuyHint: 'Opens in a new tab',

    /* ── 뒤집기 (사용자 결정 2026-10-09) ──────────────────────────────────
     * Home 활동 카드 뒷면과 **같은 문구**를 쓴다
     * (`features/activity-card-deck/copy.ts` `card.showBack` · `showFront` · `backTitle`).
     * 같은 동작에 다른 이름을 붙이면 두 화면이 다른 기능처럼 읽힌다. 모듈을 가로질러
     * import 하지 않고 값을 명시한다 — copy 는 feature 단위로 모은다 (`rules/frontend.md` §8).
     */
    /** 앞면 → 뒷면 (헤더 flip `IconButton` 의 접근성 이름). */
    showNotes: 'Show prompts and coaching notes',
    /** 뒷면 → 앞면. 같은 자리의 같은 버튼이다. */
    showBook: 'Show the book',
    /** 뒷면 제목 — Figma `86:482` 문구 그대로 (**단수형**). */
    notesTitle: 'Prompt of this book',
  },

  /* ===== 진입점 · 하위 화면 (§7.1 · §7.2 · §7.3) ========================== */

  entryActions: {
    /** 목록 자체의 접근성 이름 — 섹션 제목을 새로 만들지 않는다 (§7.1). */
    label: 'Library actions',
    addOwnBook: 'Add a book you own',
    giftRequests: 'Gift requests',
  },

  add: {
    title: 'Add a book',
    back: 'Go back',
    searchLabel: 'Search by title',
    clear: 'Clear',
    /** 검색 결과 행의 등록 버튼. */
    addToLibrary: 'Add',
    resultsLabel: 'Search results',
    searching: 'Searching',
    noResultsTitle: 'No matches yet',
    noResultsDescription: 'You can add the book by typing its title below.',
    searchErrorTitle: 'We could not search right now',
    /** 직접 입력 블록 — Figma 가 없고 Stage 2 부품을 그대로 쓴다 (§7.2). */
    dividerLabel: 'or',
    manualTitle: 'Not finding it?',
    titleLabel: 'Title',
    authorLabel: 'Author',
    submit: 'Add to library',
    /** 등록 성공 — `/library` 로 돌아가며 Toast 로 알린다. */
    successToast: 'Added to your library',
    duplicateTitle: 'Already in your library',
    duplicateDescription: 'This book is already on your shelf.',
    errorTitle: 'We could not add that book',
  },

  giftRequests: {
    title: 'Gift requests',
    back: 'Go back',
    /**
     * `D-15` 접수 안내 — **잠정 문구**다 (approvals §8.2). 수치·기한·배송 소요일을 넣지
     * 않는다. 운영 표현이 확정되면 **이 값만** 교체한다.
     */
    noticeTitle: 'Your request is in',
    noticeDescription: "We'll reach out with delivery details.",
    listLabel: 'Gift requests',
    emptyTitle: 'No gift requests yet',
    /**
     * `QA-3-013` — **신청 경로를 안내하지 않는다.** 증정 **신청**은 Frontend 에 없고(사용자
     * 결정 2026-10-10, §29.4 — 상세 시트의 `Request this book` 제거) 이 화면은 증정받은 책의
     * **배송 상태를 보는 곳**이다. 목록은 운영 쪽에서 증정이 생길 때 채워지므로, 빈 상태는
     * **무엇이 이 자리를 채우는지**만 말한다. 없는 동작을 권하지 않고, 결핍처럼 읽히지 않게
     * 쓴다 (`rules/frontend.md` §8).
     */
    emptyDescription: 'When a book is gifted to you, its delivery status shows up here.',
    errorTitle: 'We could not load your gift requests',
    loading: 'Loading your gift requests',
  },
} as const;

/**
 * 증정 요청 상태 라벨 (`GiftRequestStatusSchema` 6종, FR-22).
 *
 * **색에 의존하지 않는다** — `Tag tone="neutral"` 하나로 그리고 뜻은 라벨 텍스트가 전달한다
 * (WCAG 1.4.1, contract 주석의 "상태 **라벨 텍스트**로 표시한다"). Figma 에 증정 상태 배지
 * 디자인이 없어 색 체계를 발명하지 않는다.
 *
 * `rejected` 는 **`Not approved`** 로 적는다 — 아이·보호자에 대한 판정이 아니라 **요청의
 * 처리 결과**이며, 'Rejected' 보다 중립적인 영어 표현이다. 전부 `RECOMMENDED` 다.
 */
export const giftRequestStatusCopy: Readonly<Record<GiftRequestStatus, string>> = {
  requested: 'Requested',
  approved: 'Approved',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Not approved',
};

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

/** `Requested May 2` — 증정 요청 행의 부제 (§7.3). */
export function requestedMeta(requestedAt: string): string {
  return `Requested ${monthDay.format(new Date(requestedAt))}`;
}

/**
 * 평점 숫자 — `4.5`. 정수면 소수점을 붙이지 않는다(`5`).
 * 반올림·구간화 같은 **가공을 하지 않는다** (서버 값 표시).
 */
export function ratingText(averageRating: number): string {
  return Number.isInteger(averageRating) ? String(averageRating) : averageRating.toFixed(1);
}
