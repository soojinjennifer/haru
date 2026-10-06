/**
 * `LibraryShelves` — `/library` 본문 4섹션 조립 (Library Design Spec §2.2 · §3 · §7.4).
 *
 * ```
 * Frame 15  y=56  h=1039   (content x=24 w=345)
 * ├ SectionHeader  Reading now        + meta `3 of 5 nights`
 * ├ ReadingNowCard                                            ← readingNow 가 null 이면 블록 전체 생략
 * ├ SectionHeader  Our curated shelf  + See all
 * ├ BookShelfCarousel
 * ├ SectionHeader  Favorites          + See all
 * ├ BookShelfCarousel
 * ├ SectionHeader  Finished together  + See all
 * └ Book List 4행
 * ```
 * **섹션 간격은 전부 16** (`--space-4`) `[실측 L-1·L-2 공통]` — 헤더와 본문도 같은 16 이므로
 * 하나의 세로 flex 에 일정 gap 으로 둔다. 그러면 Figma 의 y 가 전부 맞는다
 * (20+16+118+16+20+16+216+16+20+16+216+16+20+16+297 = 1039 ✓).
 *
 * ── 섹션 순서는 **서버가 정한다** (`L-OPEN-01`) ──
 * `overview.sections` 배열 순서를 그대로 따르고 프론트가 재정렬하지 않는다. 섹션 key 는
 * **렌더 방식**만 고른다 (`curated`·`favorites` = 캐러셀 / `finished` = Book List).
 *
 * ── 상태 (§7.4) ──
 * - **Loading**: 헤더는 실제 텍스트, 본문만 Skeleton. 1회 조회라 4-way 깜빡임이 없다 (`P3-BIP-18`).
 * - **Empty**: 섹션은 사라지지 않는다 — 헤더를 남기고 본문 자리에 안내를 넣으며 "See all" 을
 *   비활성한다. `Favorites` 0건은 **처음 쓰는 사용자의 정상 화면**이다.
 * - **`readingNow === null`**: 유일한 "섹션 사라짐" 예외 — 블록 전체(헤더+카드+간격)를 렌더하지
 *   않고 간격을 회수한다. 그 상태의 디자인이 Figma `30:74`(L-1) 에 **실재한다**.
 * - **Error / Offline**: 같은 경로다(`NetworkError`) — 사전 차단 UI 를 만들지 않는다.
 *
 * ⚠️ **Error 처리의 명세 차이 (보고 대상)**: §7.4 는 "섹션 본문 자리에 `ErrorState` + Retry,
 * 헤더 유지" 로 적혀 있는데, 서재는 **단일 조회**라 실패하면 네 섹션이 동시에 비어 있다.
 * 섹션마다 `ErrorState` 를 두면 같은 refetch 를 가리키는 Retry 가 4개 생기고
 * `announce="alert"` 가 네 번 울린다. 그래서 **ErrorState 를 한 번만** 그리고 헤더를 렌더하지
 * 않는다 — 헤더의 "See all"·`meta` 가 둘 다 없는 데이터를 가리키기 때문이다. 승인 필요.
 *
 * ── 시트는 이번 라운드 범위가 아니다 ──
 * "See all" 은 **Figma 에 있는 요소이므로 버튼으로 렌더**하고(빼지 않는다), 시트를 여는 동작은
 * 다음 작업이다. `onSeeAll` 을 넘기지 않으면 아무 일도 하지 않는다.
 */
import {
  EmptyState,
  ErrorState,
  ListGroup,
  SectionHeader,
  Skeleton,
  type IconName,
  type SectionHeaderAction,
} from '@haru/ui';
import { Fragment, useState } from 'react';
import type { LibraryBook, LibraryOverviewSection, LibrarySectionKey } from '@haru/contracts';

import {
  BookListRow,
  BookShelfCarousel,
  BookShelfItem,
  SHELF_PAGE_SIZE,
} from '../../entities/book';
import { ReadingNowCard, useLibraryOverview } from '../../entities/library';
import { capabilityCopy } from '../../shared/copy/capability-copy';
import {
  finishedMeta,
  lastReadMeta,
  libraryCopy,
  librarySectionEmpty,
  librarySectionTitle,
  nightsMeta,
  ratingText,
} from '../../shared/copy/library-copy';

/** `Finished together` 는 **4행 고정**이다 `[실측]` — 섹션 안 "Show more" 를 만들지 않는다 (`L-OPEN-21`). */
const FINISHED_ROWS = 4;

/** Loading 중 헤더에 쓸 순서. 데이터가 없으므로 Figma 순서를 쓴다 (서버 순서를 알 수 없다). */
const SKELETON_SECTIONS: readonly LibrarySectionKey[] = ['curated', 'favorites', 'finished'];

/** 0건 안내 아이콘 (§7.4). `star` 는 등록되지 않은 글리프다 — 아래 사용처 주석 참조. */
const LIBRARY_EMPTY_ICON: Readonly<Record<LibrarySectionKey, IconName>> = {
  curated: 'info',
  favorites: 'book',
  finished: 'book-open',
};

export interface LibraryShelvesProps {
  /**
   * "See all" 을 눌렀을 때 `LibraryShelfSheet` 를 연다 (§6.1).
   * **시트는 다음 작업**이므로 이번 라운드에는 넘기지 않는다.
   */
  onSeeAll?: ((section: LibrarySectionKey) => void) | undefined;
}

/** 표시 제목 — 카탈로그에 없는 책은 보호자가 입력한 제목을 쓴다 (`user-entered-book`). */
function titleOf(item: LibraryBook): string {
  return item.book?.title ?? item.userEnteredTitle ?? '';
}

function authorOf(item: LibraryBook): string | undefined {
  return item.book?.author ?? item.userEnteredAuthor ?? undefined;
}

/**
 * 캐러셀 캡션 2행 — 4대 역량의 **#14 표시 라벨**이고, 역량이 없으면 **저자명**이다
 * (`L-OPEN-15`). 라벨 문구는 `capability-copy.ts` 가 소유한다.
 */
function captionOf(item: LibraryBook): string | undefined {
  return item.capability === null ? authorOf(item) : capabilityCopy[item.capability];
}

export function LibraryShelves({ onSeeAll }: LibraryShelvesProps) {
  const { overview, isPending, isError, refetch } = useLibraryOverview();
  /** 섹션별 캐러셀 페이지. 섹션마다 독립이다. */
  const [pages, setPages] = useState<Partial<Record<LibrarySectionKey, number>>>({});

  if (isPending) return <LibraryShelvesSkeleton />;

  /*
    **실패를 빈 상태로 보여 주지 않는다** — `isError` 를 뒤에 두면 parse 실패·서버 오류가
    "아직 책이 없다" 로 둔갑해 재시도 경로가 사라진다 (`ActivityCardDeck` 선례).
  */
  if (isError || overview === undefined) {
    return (
      <div className="haru-library-shelves">
        <ErrorState
          title={libraryCopy.states.errorTitle}
          onRetry={refetch}
          retryLabel={libraryCopy.states.retry}
          announce="status"
          titleAs="h2"
        />
      </div>
    );
  }

  const readingNow = overview.readingNow;

  function seeAllAction(section: LibraryOverviewSection): SectionHeaderAction {
    return {
      label: libraryCopy.seeAll,
      // 0건 섹션에서는 열 목록이 없다 → 비활성 (§7.4). 포커스는 유지된다.
      disabled: section.items.length === 0,
      onPress: () => {
        onSeeAll?.(section.key);
      },
    };
  }

  return (
    <div className="haru-library-shelves">
      {/*
        `Reading now` — `null` 이면 **블록 전체를 렌더하지 않고 간격을 회수**한다.
        그러면 화면이 Figma L-1(`30:74`) 과 완전히 같아진다 (§7.4 의 유일한 예외).
      */}
      {readingNow === null ? null : (
        <>
          <SectionHeader
            title={libraryCopy.sectionTitles.readingNow}
            meta={nightsMeta(
              readingNow.readingProgress?.completedNights ?? 0,
              readingNow.readingProgress?.plannedNights ?? null,
            )}
          />
          <ReadingNowCard
            book={readingNow}
            title={titleOf(readingNow)}
            subtitle={subtitleOf(readingNow)}
            meta={lastReadMeta(
              readingNow.readingProgress?.lastReadAt ?? null,
              readingNow.readingProgress?.lastSessionMinutes ?? null,
            )}
            progressLabel={libraryCopy.sectionTitles.readingNow}
            progressValueText={nightsMeta(
              readingNow.readingProgress?.completedNights ?? 0,
              readingNow.readingProgress?.plannedNights ?? null,
            )}
          />
        </>
      )}

      {overview.sections.map((section) => (
        <SectionBlock
          key={section.key}
          section={section}
          action={seeAllAction(section)}
          page={pages[section.key] ?? 0}
          onPageChange={(next) => {
            setPages((current) => ({ ...current, [section.key]: next }));
          }}
        />
      ))}
    </div>
  );
}

/** `Ashley Spires · Self-Direction` `[실측 145:1148]`. 조각이 없으면 그 조각만 생략한다. */
function subtitleOf(item: LibraryBook): string | undefined {
  const parts = [
    authorOf(item),
    item.capability === null ? undefined : capabilityCopy[item.capability],
  ].filter((part): part is string => part !== undefined);
  return parts.length === 0 ? undefined : parts.join(' · ');
}

interface SectionBlockProps {
  section: LibraryOverviewSection;
  action: SectionHeaderAction;
  page: number;
  onPageChange: (index: number) => void;
}

/**
 * 섹션 하나 = **헤더 + 본문** 두 flex 행이다. Fragment 로 돌려주어 바깥 flex 의 gap 16 이
 * 헤더↔본문·섹션↔섹션 모두에 똑같이 걸리게 한다 (중간 래퍼를 만들면 gap 이 끊긴다).
 */
function SectionBlock({ section, action, page, onPageChange }: SectionBlockProps) {
  const title = librarySectionTitle[section.key];

  return (
    <>
      <SectionHeader title={title} action={action} />
      {section.items.length === 0 ? (
        <EmptyState
          /*
            Design Spec §7.4 는 `favorites` 에 **`icon=star`** 를 적었지만 `star` 는
            `packages/ui/src/icon/registry.ts` 에서 **의도적으로 제거된 글리프**다 (규칙 ③:
            "`star` 는 성취·평점 언어다 — `rules/frontend.md` §8 이 진단·판정·비교 표현을
            금지하고 `D-7` 이 같은 이유로 Figma 평점 기능을 기각했다"). 되돌리지 않는다는
            결정이 소스에 남아 있으므로 **`book`** 으로 대체했다 (`finished` 의 `book-open` 과
            구분된다). → 보고 대상.
          */
          icon={LIBRARY_EMPTY_ICON[section.key]}
          title={librarySectionEmpty[section.key].title}
          description={librarySectionEmpty[section.key].description}
          titleAs="h3"
        />
      ) : section.key === 'finished' ? (
        <ListGroup>
          {section.items.slice(0, FINISHED_ROWS).map((item) => {
            const meta = finishedMeta(item.sessionCount, item.lastReadAt ?? null);
            return (
              <BookListRow
                key={item.id}
                title={titleOf(item)}
                author={authorOf(item)}
                coverUrl={item.book?.coverUrl ?? undefined}
                meta={meta}
                averageRating={item.averageRating}
                ratedPrefix={libraryCopy.ratedPrefix}
                ratingText={
                  item.averageRating === null ? undefined : ratingText(item.averageRating)
                }
              />
            );
          })}
        </ListGroup>
      ) : (
        <BookShelfCarousel
          label={title}
          statusLabel={libraryCopy.carouselStatus(
            page + 1,
            Math.ceil(section.items.length / SHELF_PAGE_SIZE),
          )}
          index={page}
          onIndexChange={onPageChange}
          items={section.items.map((item) => (
            <BookShelfItem
              key={item.id}
              title={titleOf(item)}
              author={authorOf(item)}
              coverUrl={item.book?.coverUrl ?? undefined}
              caption={captionOf(item)}
            />
          ))}
        />
      )}
    </>
  );
}

/**
 * Loading — 헤더는 **실제 텍스트**, 본문만 Skeleton (§7.4).
 * 캐러셀 자리는 표지 3개 + 캡션 2행이고 **dots 는 표시하지 않는다**.
 * 로딩 안내는 컨테이너가 `aria-busy` + `role="status"` 로 **한 번만** 전달한다 (`Skeleton` 규칙).
 */
function LibraryShelvesSkeleton() {
  return (
    <div
      className="haru-library-shelves"
      role="status"
      aria-busy="true"
      aria-label={libraryCopy.states.loading}
    >
      <SectionHeader title={libraryCopy.sectionTitles.readingNow} />
      {/* 실제 카드와 **같은 셸**(`.haru-reading-now`) 을 쓴다 → 높이 118 이 자동으로 같아진다. */}
      <div className="haru-reading-now">
        <span className="haru-library-shelves__skeleton-cover-xl">
          <Skeleton shape="rect" />
        </span>
        <span className="haru-reading-now__text">
          <Skeleton shape="text" lines={3} />
        </span>
      </div>
      {SKELETON_SECTIONS.map((key) => (
        <Fragment key={key}>
          <SectionHeader title={librarySectionTitle[key]} />
          {key === 'finished' ? (
            <ListGroup>
              {Array.from({ length: FINISHED_ROWS }, (_, row) => (
                <li key={row} className="haru-library-shelves__skeleton-row">
                  <Skeleton shape="text" lines={2} />
                </li>
              ))}
            </ListGroup>
          ) : (
            <div className="haru-library-shelves__skeleton-shelf">
              {Array.from({ length: SHELF_PAGE_SIZE }, (_, slot) => (
                <div key={slot} className="haru-library-shelves__skeleton-slot">
                  <span className="haru-library-shelves__skeleton-cover">
                    <Skeleton shape="rect" />
                  </span>
                  <Skeleton shape="text" lines={2} />
                </div>
              ))}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
