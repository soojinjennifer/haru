/**
 * 좋아하는 책 카드 — 재구성 Design Spec §6.3 (`§11.13` · `§11.14` · `§11.17`).
 *
 * **검색이 없다.** Figma `30:74`(Library) · `179:1770`(설문 카드) 어디에도 검색 입력·아이콘이
 * 없고, 검색이 하던 `bookId` 매칭은 Q5(`ownedBooks`)가 수행한다. 그래서 이 카드는
 * **제목 직접 입력 + 선택 목록(최대 5)** 뿐이며 서버 호출이 0건이다.
 *
 * 상한 처리는 Q2 · Q3 와 **다르고 그것이 의도된 차이다** (`§11.15`): 사용자가 직접 타이핑해
 * 만들어 넣은 항목이라 임의로 밀어내지 않고 **거절**하며, 입력 필드를 `disabled` 로 두되
 * 숨기지 않는다 (사라지면 "입력이 없어졌다"로 읽힌다).
 *
 * 입력 필드에는 **보이는 라벨을 두지 않는다** (`S2R-OPEN-9` A — `§11.17`): 쓸 수 있는 승인된
 * 문자열이 없고 카드 문항이 이미 같은 말을 한다. 접근성 이름은 `aria-labelledby`(카드 문항) ·
 * `aria-describedby`(helper)로 충족한다. `placeholder` 를 라벨 대신 쓰지 않는다 (WCAG 3.3.2).
 */
import { Icon, IconButton, ListGroup, ListRow, Text, TextField } from '@haru/ui';
import { useState } from 'react';
import {
  FAVORITE_BOOKS_MAX,
  type FavoriteBook,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import { SurveyQuestionCard } from '../../character';
import { surveyCardCopy } from '../copy';

export interface FavoriteBooksCardProps {
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
  counter: string;
}

function titleOf(book: FavoriteBook): string {
  return book.title ?? book.bookId ?? '';
}

export function FavoriteBooksCard({ answers, onChange, counter }: FavoriteBooksCardProps) {
  const copy = surveyCardCopy.books;
  const [draftTitle, setDraftTitle] = useState('');
  const favorites = answers.books_and_interests?.favoriteBooks ?? [];
  const full = favorites.length >= FAVORITE_BOOKS_MAX;
  const trimmed = draftTitle.trim();

  function updateFavorites(next: readonly FavoriteBook[]): void {
    onChange({
      ...answers,
      books_and_interests: { ...answers.books_and_interests, favoriteBooks: [...next] },
    });
  }

  function addTitle(): void {
    // 상한 도달 시 **거절**한다 (`§11.15`). 중복 제목도 추가하지 않는다 (안내 문구를 만들지 않는다).
    if (full || trimmed.length === 0) return;
    if (favorites.some((existing) => titleOf(existing) === trimmed)) return;

    updateFavorites([...favorites, { title: trimmed }]);
    setDraftTitle('');
  }

  return (
    <SurveyQuestionCard
      counter={counter}
      question={copy.favoritesSection}
      clearLabel={surveyCardCopy.deck.clearAnswer}
    >
      <div className="flex flex-col gap-3">
        {/*
          보이는 라벨을 두지 않는다 (§6.4 A). 접근성 이름은 **카드 문항과 같은 문자열**이고
          (`labelHidden` 으로 시각만 숨긴다), 보조 설명은 `helperText` 가 `aria-describedby` 로
          연결된다. 새 문구를 만들지 않으며 카드 높이도 바뀌지 않는다.
        */}
        <TextField
          label={copy.favoritesSection}
          labelHidden
          value={draftTitle}
          onChange={setDraftTitle}
          name="favorite-book-title"
          autoComplete="off"
          disabled={full}
          helperText={copy.favoritesHint(FAVORITE_BOOKS_MAX)}
          {...(trimmed.length === 0 || full
            ? {}
            : { trailingAction: { label: copy.addAction, onPress: addTitle } })}
        />

        {full ? (
          <Text variant="caption-1" tone="secondary">
            {copy.limitReached(FAVORITE_BOOKS_MAX)}
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
                      updateFavorites(
                        favorites.filter((existing) => titleOf(existing) !== titleOf(book)),
                      );
                    }}
                  />
                }
              />
            ))}
          </ListGroup>
        ) : null}
      </div>
    </SurveyQuestionCard>
  );
}
