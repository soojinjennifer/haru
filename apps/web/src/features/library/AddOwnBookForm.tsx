/**
 * `AddOwnBookForm` — `/library/add` 보유 책 직접 등록 (FR-23 · PRD §7.2, AC-2-23).
 * Library Design Spec §7.2 (`C13-17` 명세 — **Figma 없음**, `C-13` ② 승인).
 *
 * ```
 * TextField(search "Search by title", trailingAction=Clear)       ← Stage 2 §4.1 부품 그대로
 * [결과]      ListGroup / ListRow(media=BookCover sm, title, subtitle=author,
 *                                 trailing=Button size=md "Add")
 * [결과 0건]  EmptyState — "제목을 직접 입력" 경로를 연다 (AC-2-23)
 * DividerWithLabel("or")                                          ← Stage 2 §4.5
 * FieldGroup "Not finding it?"  Title(필수) · Author  +  Button(accent, fullWidth)
 * ```
 *
 * ── Figma 에 없는 화면이므로 **Stage 2 에서 이미 확정된 부품만** 조합한다 ──
 * 새 시각 언어를 만들지 않는다. 검색은 `GET /v1/books/search` **Stage 2 재사용**이고
 * (`useBookSearch` — 그 hook 의 "사용처 0건" 주석이 예고한 소비자가 이 화면이다),
 * 직접 입력은 `AddOwnBookRequest`(= `SaveBookTargetSchema` 재사용)다.
 *
 * ── `ownership` 표식을 만들지 않는다 (`L-OPEN-14`) ──
 * 등록 결과는 배지가 아니라 **목록 재조회**로만 반영된다 (`useAddOwnBook` 이 `libraryKeys.all`
 * 을 무효화한다). 성공하면 `/library` 로 돌아가고 `Toast` 로 알린다.
 *
 * ── 상태 (§7.2) ──
 * Loading(`Skeleton` ×3) · Empty(결과 없음) · Error/Offline(+Retry) ·
 * 중복(`BOOK_ALREADY_OWNED` → `InlineAlert tone=info`).
 *
 * `trailing` 에 인터랙티브 `Button` 을 두므로 **행에 `onPress` 를 주지 않는다** — 중첩 버튼
 * 금지 (`ListRow` 규칙). 행 전체를 누르는 경로를 만들지 않는 쪽이 오탭 등록도 막는다.
 *
 * 문구는 전부 `library-copy` 가 소유하며 `RECOMMENDED` 다.
 */
import {
  Button,
  DividerWithLabel,
  EmptyState,
  ErrorState,
  FieldGroup,
  InlineAlert,
  ListGroup,
  ListRow,
  Skeleton,
  Text,
  TextField,
  useToast,
} from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { BookCover, useBookSearch } from '../../entities/book';
import { useAddOwnBook } from '../../entities/library';
import { ROUTES } from '../../shared/config/routes';
import { deletionPendingCopy } from '../../shared/copy/error-copy';
import { libraryCopy } from '../../shared/copy/library-copy';

/** 검색 결과 자리 행 수 (§7.2 "Loading(`Skeleton` ×3)"). */
const SEARCH_SKELETON_ROWS = 3;

export function AddOwnBookForm() {
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const search = useBookSearch(query);
  const add = useAddOwnBook();
  const navigate = useNavigate();
  const toast = useToast();

  function submit(target: { bookId: string } | { title: string; author?: string }): void {
    add.add({ target }, () => {
      toast.show({ tone: 'success', message: libraryCopy.add.successToast });
      void navigate(ROUTES.library);
    });
  }

  const duplicate = add.errorCode === 'BOOK_ALREADY_OWNED';
  // 삭제 진행 중 쓰기 차단 — 같은 표면에 문구만 (AC-8-32 · Spec §2.9).
  const blocked = deletionPendingCopy(add.errorCode);
  const trimmedTitle = title.trim();

  return (
    <div className="haru-library-add">
      {/*
        중복은 **오류 화면이 아니라 안내**다 — 이미 서재에 있다는 사실은 사용자가 되돌릴 일이
        없고, 다음 행동(다른 책 등록 또는 서재로 돌아가기)이 그대로 열려 있다.
      */}
      {duplicate ? (
        <InlineAlert
          tone="info"
          title={libraryCopy.add.duplicateTitle}
          description={libraryCopy.add.duplicateDescription}
        />
      ) : null}
      {add.isError && !duplicate ? (
        <InlineAlert
          tone="error"
          title={blocked?.title ?? libraryCopy.add.errorTitle}
          {...(blocked === null ? {} : { description: blocked.description })}
        />
      ) : null}

      {/*
        `TextField` 는 **`FieldGroup` 카드 안의 한 행**이다 (Stage 2 Design Spec §4.13 — 컴포넌트
        주석이 그렇게 정의한다). 카드 없이 두면 라벨·입력선이 배경 위에 떠서 아래 직접 입력
        블록과 모양이 어긋난다.
      */}
      <FieldGroup>
        <TextField
          label={libraryCopy.add.searchLabel}
          type="search"
          value={query}
          onChange={setQuery}
          {...(query.length === 0
            ? {}
            : {
                trailingAction: {
                  label: libraryCopy.add.clear,
                  onPress: () => {
                    setQuery('');
                  },
                },
              })}
        />
      </FieldGroup>

      <SearchResults
        search={search}
        pending={add.isPending}
        onAdd={(bookId) => {
          submit({ bookId });
        }}
      />

      <DividerWithLabel label={libraryCopy.add.dividerLabel} />

      <div className="haru-library-add__manual">
        <Text as="h2" variant="headline" weight="bold" tone="primary">
          {libraryCopy.add.manualTitle}
        </Text>
        <FieldGroup>
          <TextField
            label={libraryCopy.add.titleLabel}
            value={title}
            onChange={setTitle}
            required
          />
          <TextField label={libraryCopy.add.authorLabel} value={author} onChange={setAuthor} />
        </FieldGroup>
        <Button
          variant="accent"
          fullWidth
          loading={add.isPending}
          disabled={trimmedTitle.length === 0}
          onPress={() => {
            if (trimmedTitle.length === 0) return;
            submit(
              author.trim().length === 0
                ? { title: trimmedTitle }
                : { title: trimmedTitle, author: author.trim() },
            );
          }}
        >
          {libraryCopy.add.submit}
        </Button>
      </div>
    </div>
  );
}

interface SearchResultsProps {
  search: ReturnType<typeof useBookSearch>;
  pending: boolean;
  onAdd: (bookId: string) => void;
}

function SearchResults({ search, pending, onAdd }: SearchResultsProps) {
  /* 검색어가 없으면 결과 영역 자체가 없다 — 빈 상자를 그리지 않는다. */
  if (search.books === undefined && !search.isPending && !search.isError) return null;

  if (search.isPending) {
    return (
      <div
        className="haru-library-add__results"
        role="status"
        aria-busy="true"
        aria-label={libraryCopy.add.searching}
      >
        {Array.from({ length: SEARCH_SKELETON_ROWS }, (_, row) => (
          <Skeleton key={row} shape="text" lines={2} />
        ))}
      </div>
    );
  }

  if (search.isError) {
    return (
      <ErrorState
        title={libraryCopy.add.searchErrorTitle}
        onRetry={search.refetch}
        retryLabel={libraryCopy.states.retry}
        announce="status"
        titleAs="h2"
      />
    );
  }

  if (search.isEmpty) {
    return (
      <EmptyState
        icon="book"
        title={libraryCopy.add.noResultsTitle}
        description={libraryCopy.add.noResultsDescription}
        titleAs="h2"
      />
    );
  }

  return (
    <ListGroup label={libraryCopy.add.resultsLabel}>
      {(search.books ?? []).map((book) => (
        <ListRow
          key={book.id}
          title={book.title}
          subtitle={book.author}
          media={
            <BookCover
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl ?? undefined}
              size="sm"
              decorative
            />
          }
          trailing={
            <Button
              variant="glass"
              loading={pending}
              onPress={() => {
                onAdd(book.id);
              }}
            >
              {libraryCopy.add.addToLibrary}
            </Button>
          }
        />
      ))}
    </ListGroup>
  );
}
