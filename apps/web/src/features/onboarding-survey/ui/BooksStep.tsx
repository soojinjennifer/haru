/**
 * Step 3 — Design Spec §2.10 Step 3 (`C13-06`, 결정 **D-17**).
 *
 * 세 블록으로 이루어진다.
 * 1. 좋아하는 책 — `GET /v1/books/search` 검색 + **결과 없음 시 제목 직접 입력** (AC-2-23)
 * 2. 집에 있는 책 — 제목 입력 누적
 * 3. 책에서 끌리는 것 — instrument 문항 (`ChoiceQuestionList`)
 *
 * 표지 이미지(`ListRow media`)는 **Stage 3** 이므로 Stage 2 행에는 넣지 않는다.
 * 검색 결과가 없는 것은 오류가 아니다 — 그 자리에서 직접 입력 경로를 연다 (PRD §7.2).
 */
import {
  EmptyState,
  Icon,
  IconButton,
  InlineAlert,
  ListGroup,
  ListRow,
  Skeleton,
  Text,
  TextField,
} from '@haru/ui';
import { useState } from 'react';
import {
  FAVORITE_BOOKS_MAX,
  type FavoriteBook,
  type OnboardingDraftAnswers,
  type OnboardingInstrument,
} from '@haru/contracts';

import { useBookSearch } from '../../../entities/book';
import { errorCopyForCode, networkErrorCopy } from '../../../shared/copy/error-copy';
import { onboardingCopy } from '../copy';

import { ChoiceQuestionList } from './ChoiceQuestionList';

export interface BooksStepProps {
  instrument: OnboardingInstrument;
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
}

function titleOf(book: FavoriteBook): string {
  return book.title ?? book.bookId ?? '';
}

export function BooksStep({ instrument, answers, onChange }: BooksStepProps) {
  const copy = onboardingCopy.books;
  const [query, setQuery] = useState('');
  const [homeTitle, setHomeTitle] = useState('');

  const favorites = answers.books?.favoriteBooks ?? [];
  const homeBooks = answers.books?.homeBooks ?? [];
  const full = favorites.length >= FAVORITE_BOOKS_MAX;

  const search = useBookSearch(query);

  function updateBooks(next: Partial<NonNullable<OnboardingDraftAnswers['books']>>): void {
    onChange({ ...answers, books: { ...answers.books, ...next } });
  }

  function addFavorite(book: FavoriteBook): void {
    if (full) return;
    if (favorites.some((existing) => titleOf(existing) === titleOf(book))) return;

    updateBooks({ favoriteBooks: [...favorites, book] });
    setQuery('');
  }

  const searchFailure = search.isOffline
    ? networkErrorCopy
    : search.isError
      ? errorCopyForCode(search.errorCode)
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Text variant="caption-1" tone="secondary" weight="semibold">
          {copy.favoritesSection}
        </Text>

        <TextField
          label={copy.searchLabel}
          value={query}
          onChange={setQuery}
          type="search"
          inputMode="search"
          helperText={copy.favoritesHint}
          {...(query.length === 0
            ? {}
            : {
                trailingAction: {
                  label: copy.searchClear,
                  onPress: () => {
                    setQuery('');
                  },
                },
              })}
        />

        {search.isPending ? (
          <div role="status" aria-busy="true" aria-label={copy.searchLoading}>
            <Skeleton shape="text" lines={3} />
          </div>
        ) : null}

        {searchFailure === undefined ? null : (
          <InlineAlert
            tone="error"
            title={searchFailure.title}
            description={searchFailure.description}
            action={{ label: copy.tryAgain, onPress: search.refetch }}
          />
        )}

        {search.isEmpty ? (
          <EmptyState
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={{
              label: copy.addTyped(query.trim()),
              onPress: () => {
                addFavorite({ title: query.trim() });
              },
            }}
          />
        ) : null}

        {search.books !== undefined && search.books.length > 0 ? (
          <ListGroup>
            {search.books.map((book) => (
              <ListRow
                key={book.id}
                title={book.title}
                subtitle={book.author}
                disabled={full}
                onPress={() => {
                  addFavorite({ bookId: book.id, title: book.title });
                }}
              />
            ))}
          </ListGroup>
        ) : null}

        {full ? (
          <Text variant="caption-1" tone="secondary">
            {copy.limitReached}
          </Text>
        ) : null}

        {favorites.length > 0 ? (
          <ListGroup label={copy.selectedLabel}>
            {favorites.map((book) => (
              <ListRow
                key={titleOf(book)}
                title={titleOf(book)}
                trailing={
                  <IconButton
                    icon={<Icon name="x" decorative />}
                    label={copy.remove(titleOf(book))}
                    variant="plain"
                    onPress={() => {
                      updateBooks({
                        favoriteBooks: favorites.filter(
                          (existing) => titleOf(existing) !== titleOf(book),
                        ),
                      });
                    }}
                  />
                }
              />
            ))}
          </ListGroup>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <Text variant="caption-1" tone="secondary" weight="semibold">
          {copy.homeSection}
        </Text>
        <TextField
          label={copy.homeLabel}
          value={homeTitle}
          onChange={setHomeTitle}
          {...(homeTitle.trim().length === 0
            ? {}
            : {
                trailingAction: {
                  label: copy.homeAdd,
                  onPress: () => {
                    updateBooks({ homeBooks: [...homeBooks, { title: homeTitle.trim() }] });
                    setHomeTitle('');
                  },
                },
              })}
        />
        {homeBooks.length > 0 ? (
          <ListGroup label={copy.homeListLabel}>
            {homeBooks.map((book) => (
              <ListRow
                key={book.title}
                title={book.title}
                trailing={
                  <IconButton
                    icon={<Icon name="x" decorative />}
                    label={copy.remove(book.title)}
                    variant="plain"
                    onPress={() => {
                      updateBooks({
                        homeBooks: homeBooks.filter((existing) => existing.title !== book.title),
                      });
                    }}
                  />
                }
              />
            ))}
          </ListGroup>
        ) : null}
      </section>

      <ChoiceQuestionList
        instrument={instrument}
        step="books"
        answers={answers}
        onChange={onChange}
      />
    </div>
  );
}
