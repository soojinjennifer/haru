/**
 * `LibraryShelfSheet` — "See all" 전체 목록 시트 (Library Design Spec §3.7 · §4.3 · §7.4,
 * Figma `163:1898` `type=shelf` · 인스턴스 `163:2347` `[실측]`).
 *
 * ```
 * Sheet variant="inset-card"        364×425 · 좌우 inset 14 · radius 28 · grabber 없음
 * ├ 헤더      섹션 제목 + 닫기 IconButton            (Sheet 헤더 = Figma `Cardtitle` 행)
 * ├ 본문      ListGroup + BookListRow × 전체          ← overflow-y: auto (스크롤)
 * └ ActionBar ★ Save + Start Session                  둘 다 aria-disabled (아래 근거)
 * ```
 *
 * ── ⭐ `Sheet contentShadowInset` 의 **첫 실사용처** (`R-SHADOW-1`) ──
 * `.haru-sheet__content { overflow-y: auto }` 는 **기존 선언**이고 "See all" 은 전체 목록이라
 * 실제로 스크롤한다 → 그 박스가 `ListGroup` 의 `--shadow-bubble` 을 자른다.
 * 번짐은 **픽셀 프로브 실측**이다 (빌드 산출물 CSS · 흰 배경 · dSF 1 · 순백 대비 채널차 합):
 * **아래 10 · 위 0 · 좌우 4** — `--shadow-bubble` 은 drop **1겹**(`0 6px 4px`)이라 누락할 겹이
 * 없고 산술(6+4 / −6+4 / ±4)과도 일치한다. 1라운드가 등록한
 * `--sheet-content-shadow-inset-*` 과 같은 값이다.
 * 보정 전/후 실증: 보정 없으면 **네 방향 Δ 프로파일이 전부 0**(완전 클립), 보정하면
 * 아래 10 · 좌우 4 가 **완전 복원**된다. 회귀는 `e2e/shadow.spec.ts` 가 양방향으로 고정한다.
 *
 * 시트 **자신**에게는 inset 이 필요 없다 (approvals §19.5) — `createPortal(body)` +
 * `position: fixed` 이고 조상에 `transform`/`filter`/`contain` 이 없다. 393 에서 좌우 번짐
 * 50 중 36 이 뷰포트 밖으로 나가지만 클립 선이 **화면 가장자리**라 보이지 않는다.
 *
 * ── ActionBar 의 두 버튼이 **둘 다 `aria-disabled`** 인 이유 ──
 * Figma `163:1898`(`type=shelf`)에 ActionBar 가 실재하므로 **빼지 않고 그린다**
 * (approvals §17.2 "Figma 대로 ActionBar 를 넣는다"). 그런데 이 변형에는 **선택된 책이 없다**:
 * 행 탭은 선택이 아니라 `BookDetailSheet` **교체 전환**이고(§6.1), `type=selected` 변형은
 * **미구현**(확정 결정)이다. 저장 대상이 정해지지 않으므로 `★ Save` 도 `Start Session` 과
 * 같은 방식으로 `aria-disabled` + 누름 무시다 (`D-3` — "설명 슬롯이 비면 설명 없이
 * `aria-disabled` 만 적용한다"). 실제 저장은 `BookDetailSheet` 에서 한다. → **보고 대상**.
 *
 * ── 더 보기 (`L-OPEN-21` · `paged`) ──
 * 섹션 안에 "Show more" 를 만들지 않고 **시트 하단에 닿으면 추가로 받는다** (§7.4).
 * 감지는 목록 끝의 sentinel + `IntersectionObserver`(root = 뷰포트)다 — 스크롤 박스는
 * `Sheet` 안에 있어 ref 를 받을 수 없고, 시트가 뷰포트 안에서 스크롤하므로 기본 root 로 충분하다.
 *
 * 상태 (§7.4): Loading(`Skeleton` 행 4) · Empty · Error/Offline(+Retry) · 추가 로드(`Skeleton` 행 2).
 */
import { EmptyState, ErrorState, Icon, IconButton, ListGroup, Sheet, Skeleton } from '@haru/ui';
import { useEffect, useRef } from 'react';
import type { LibraryBook, LibrarySectionKey } from '@haru/contracts';

import { BookListRow } from '../../entities/book';
import { SaveButton } from '../../entities/activity-card';
import { useLibraryList } from '../../entities/library';
import {
  finishedMeta,
  libraryCopy,
  librarySectionTitle,
  ratingText,
} from '../../shared/copy/library-copy';

import { StartSessionAction } from './StartSessionAction';
import { bookAuthor, bookTitle } from './bookDisplay';

/** Loading 자리 행 수 — Figma Book List 가 4행이다 `[실측 163:2256]`. */
const SKELETON_ROWS = 4;

/** 추가 페이지를 받는 중에 보이는 자리 행 수 (§7.4 "`Skeleton` 행 2개"). */
const LOAD_MORE_ROWS = 2;

export interface LibraryShelfSheetProps {
  /** 열림 상태는 `LibraryShelves` 가 소유한다 (§4.3). */
  open: boolean;
  /** 열려 있을 때의 섹션. 닫혀 있으면 `undefined` 일 수 있다. */
  section: LibrarySectionKey | undefined;
  onClose: () => void;
  /** 행 탭 → `BookDetailSheet` **교체 전환** (§6.1). */
  onSelectBook: (book: LibraryBook) => void;
}

export function LibraryShelfSheet({
  open,
  section,
  onClose,
  onSelectBook,
}: LibraryShelfSheetProps) {
  const list = useLibraryList(section, { enabled: open });
  const sentinel = useRef<HTMLDivElement>(null);
  /*
    `loadMore` 는 렌더마다 새로 만들어진다 (쿼리 상태를 닫아 둔 클로저다). 그것을 effect
    의존성에 넣으면 `IntersectionObserver` 가 매 렌더 재생성되므로 **ref 로 최신값만** 넘긴다.
    `loadMore` 자신이 `hasMore`·`isFetchingNextPage` 를 확인하므로 중복 호출이 안전하다.
  */
  const loadMore = useRef(list.loadMore);
  useEffect(() => {
    loadMore.current = list.loadMore;
  });

  /*
    목록 끝이 보이면 다음 페이지를 받는다 (§7.4 — 섹션 안 "Show more" 를 만들지 않는다).
    root 는 **뷰포트**다: 스크롤 박스(`.haru-sheet__content`)는 `Sheet` 안에 있어 ref 를 받을
    수 없고, 시트가 뷰포트 안에서 스크롤하므로 기본 root 로 충분하다.
    `IntersectionObserver` 가 없는 환경(jsdom 등)에서는 아무 일도 하지 않는다 — 첫 페이지는
    그대로 보이고 기능이 깨지지 않는다.
  */
  useEffect(() => {
    const node = sentinel.current;
    if (node === null || !open) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore.current();
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [open, list.hasMore]);

  const title = section === undefined ? libraryCopy.title : librarySectionTitle[section];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      variant="inset-card"
      contentShadowInset
      trailing={
        <IconButton
          icon={<Icon name="x" size="md" decorative />}
          label={libraryCopy.closeSheet}
          variant="plain"
          onPress={onClose}
        />
      }
      /*
        ActionBar 는 **본문 밖**이다 — Figma `Button/card` 가 카드 하단에 고정되어 있고
        목록만 스크롤한다 `[실측 163:1898]`. 본문에 넣으면 스크롤할 때 CTA 가 사라지고
        목록 그림자가 잘릴 자리도 없어져 `contentShadowInset` 이 무의미해진다.
      */
      footer={
        <div className="haru-shelf-sheet__actions">
          {/*
            대상 책이 없다 — 위 주석의 근거로 `Start Session` 과 **같은 방식**으로 비활성이다.
          */}
          <SaveButton
            saved={false}
            disabled
            copy={{ save: libraryCopy.bookSheet.save, saved: libraryCopy.bookSheet.saved }}
            onToggle={() => {
              /* 대상 없음 — `aria-disabled` 가 이미 누름을 막는다. */
            }}
          />
          <StartSessionAction id="shelf-sheet" />
        </div>
      }
    >
      <ShelfSheetBody list={list} onSelectBook={onSelectBook} sentinelRef={sentinel} />
    </Sheet>
  );
}

interface ShelfSheetBodyProps {
  list: ReturnType<typeof useLibraryList>;
  onSelectBook: (book: LibraryBook) => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

function ShelfSheetBody({ list, onSelectBook, sentinelRef }: ShelfSheetBodyProps) {
  if (list.isPending) {
    return (
      <div role="status" aria-busy="true" aria-label={libraryCopy.states.loading}>
        <SkeletonRows count={SKELETON_ROWS} />
      </div>
    );
  }

  /* 실패를 빈 상태로 보여 주지 않는다 (`LibraryShelves` 와 같은 규칙). */
  if (list.isError || list.items === undefined) {
    return (
      <ErrorState
        title={libraryCopy.shelfSheet.errorTitle}
        onRetry={list.refetch}
        retryLabel={libraryCopy.states.retry}
        announce="status"
        titleAs="h3"
      />
    );
  }

  if (list.items.length === 0) {
    return (
      <EmptyState
        icon="book"
        title={libraryCopy.shelfSheet.emptyTitle}
        description={libraryCopy.shelfSheet.emptyDescription}
        titleAs="h3"
      />
    );
  }

  return (
    <>
      <ListGroup label={libraryCopy.shelfSheet.listLabel}>
        {list.items.map((item) => (
          <BookListRow
            key={item.id}
            title={bookTitle(item)}
            author={bookAuthor(item)}
            coverUrl={item.book?.coverUrl ?? undefined}
            /*
              아직 읽지 않은 책에는 `0 sessions` 를 찍지 않는다 — 횟수 0 은 유용한 정보가
              아니고 결핍처럼 읽힌다. 그 자리에는 **저자명**을 쓴다 (`bookCaption` 이
              `L-OPEN-15` 에서 쓰는 것과 같은 대체 규칙). 둘 다 없으면 생략한다.
              → Figma 에 "See all" 시트 행의 부제 근거가 없어 **보고 대상**이다.
            */
            meta={
              item.sessionCount === 0
                ? bookAuthor(item)
                : finishedMeta(item.sessionCount, item.lastReadAt ?? null)
            }
            averageRating={item.averageRating}
            ratedPrefix={libraryCopy.ratedPrefix}
            ratingText={item.averageRating === null ? undefined : ratingText(item.averageRating)}
            onPress={() => {
              onSelectBook(item);
            }}
          />
        ))}
      </ListGroup>
      {list.isLoadingMore ? (
        <div role="status" aria-busy="true" aria-label={libraryCopy.shelfSheet.loadingMore}>
          <SkeletonRows count={LOAD_MORE_ROWS} />
        </div>
      ) : null}
      {/* 목록 끝 감지점. 장식이 아니라 **빈 측정 대상**이므로 높이를 갖지 않는다. */}
      {list.hasMore ? <div ref={sentinelRef} aria-hidden="true" /> : null}
    </>
  );
}

/** 자리 행 — 실제 행과 **같은 최소 높이**(74)를 쓰므로 도착 시 들썩이지 않는다. */
function SkeletonRows({ count }: { count: number }) {
  return (
    <ListGroup>
      {Array.from({ length: count }, (_, row) => (
        <li key={row} className="haru-shelf-sheet__skeleton-row">
          <Skeleton shape="text" lines={2} />
        </li>
      ))}
    </ListGroup>
  );
}
