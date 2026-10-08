/**
 * `BookDetailSheet` — 책 1권 + **책별 Prompt 보기** (FR-20 4번째 기능).
 * Library Design Spec §3.8 (Figma `145:1085` = Home 카드 `163:2649` 와 동일 규격 `[실측]`) +
 * `stage-3-design-spec.md` §2.9.
 *
 * ```
 * Sheet variant="inset-card"   좌우 inset 14 · radius 28 · grabber 없음 · pad 18 / 하 16
 * ├ 헤더   책 제목 + 닫기 IconButton          (Figma `Cardtitle` 행)
 * ├ 책     BookCover(md 58×82) + 저자 · 역량 라벨
 * ├ Prompt PromptPill(tinted) × promptSet.questions (+ followUps)
 * ├ (증정) 신청 CTA | 접수 안내                 ownership 에 따라 (§2.9)
 * └ ActionBar  ★ Save + Start Session(비활성)
 * ```
 *
 * ── ⚠️ `ActivityOptionCard` 를 **재사용하지 못했다** (보고 대상) ──
 * Design Spec §3.8 은 "같은 규격이므로 `ActivityOptionCard` 재사용" 을 적지만, 그 컴포넌트는
 * `ActivityCardOption` 을 받는다. 서재가 가진 데이터는 `LibraryBook` + `BookPromptsResponse`
 * 이고 **`reason`(추천 이유 1~2문장) · `position` · `kind` 가 없다**. `reason` 은 서버가 만든
 * 문장이라 Frontend 가 지어낼 수 없다 (`rules/frontend.md` §8 — 생성 문구는 API 값만 표시).
 * 그래서 **같은 하위 부품**(`BookCover` · `PromptPill` · `SaveButton`)으로 같은 구성을 만들되
 * 추천 이유 줄은 **렌더하지 않는다**. → Figma 에 있는 요소 1개를 빼는 것이므로 보고한다
 * (최우선 규칙 #3). contract 에 `reason` 을 추가할지는 사용자 결정 사항이다.
 *
 * ── 헤더에 들어가는 것 ──
 * Figma 카드의 `Cardtitle` 행에는 역량 Tag 와 flip 아이콘이 있고 제목은 본문에 있다.
 * 시트에서는 그 행이 `Sheet` 헤더(제목 + trailing)이고 trailing 은 **닫기 `IconButton`** 로
 * 확정되어 있다 (Design Spec §4.5 · `stage-3-design-spec.md` §2.8). 그래서
 *   ① 책 제목을 헤더로 올리고(타이포는 Figma 카드 제목과 같은 `headline`),
 *   ② 역량은 본문 부제에서 `저자 · 역량` 으로 보인다 (`ReadingNowCard` 와 같은 규칙),
 *   ③ flip 아이콘은 **넣지 않는다** — 24×24 슬롯이 하나이고 닫기가 그 자리를 쓴다.
 * ①·③ 도 Figma 와의 차이이므로 보고한다.
 *
 * ── 코칭 노트 ──
 * `Prompt.coachingNote` 는 Home 카드 **뒷면**이 1:1 로 그리는 데이터다 (§12.14). 이 시트에는
 * 뒤집기 면이 없으므로(③) 노트를 렌더하지 않는다 — 접힌 자리를 만들어 Figma 에 없는 UI 를
 * 추가하지 않는다. → 보고 대상.
 *
 * ── `contentShadowInset` 을 켜지 않는다 ──
 * 본문의 자식 중 **drop shadow 를 가진 것이 없다**: `PromptPill` 은 `inset` 전용(outline) 또는
 * 면(tinted)이고, `BookCover md` 는 `--shadow-cover` 를 갖지만 본문이 스크롤될 만큼 길지 않을
 * 때는 잘릴 자리가 없다… 는 가정을 쓰지 않는다 — 실제로는 `--shadow-cover` 번짐(아래 20)이
 * 세로 스크롤 시 잘릴 수 있으므로 **표지 자리에 inset 을 직접 준다** (`library.css`
 * `.haru-book-sheet__cover`). 시트 본문 전체 inset(`contentShadowInset`)은 `ListGroup` 처럼
 * **본문 폭을 꽉 채우는** 그림자 상자를 위한 것이라 이 시트에는 맞지 않는다.
 */
import {
  Button,
  Icon,
  IconButton,
  InlineAlert,
  Sheet,
  Skeleton,
  Tag,
  Text,
  TextLink,
} from '@haru/ui';
import { useState } from 'react';
import type { LibraryBook, Prompt } from '@haru/contracts';

import { BookCover, useBookPrompts } from '../../entities/book';
import { PromptPill, SaveButton } from '../../entities/activity-card';
import { useCreateGiftRequest, useToggleLibrarySave } from '../../entities/library';
import { ERROR_COPY, networkErrorCopy } from '../../shared/copy/error-copy';
import { giftRequestStatusCopy, libraryCopy } from '../../shared/copy/library-copy';

import { StartSessionAction } from './StartSessionAction';
import { bookAuthor, bookSubtitle, bookTitle } from './bookDisplay';

export interface BookDetailSheetProps {
  open: boolean;
  /** 열려 있는 책. 닫혀 있으면 `undefined` 다. */
  book: LibraryBook | undefined;
  /** 닫기 — 들어온 경로가 Shelf 시트면 호출 측이 Shelf 복귀를 수행한다 (§2.9). */
  onClose: () => void;
}

export function BookDetailSheet({ open, book, onClose }: BookDetailSheetProps) {
  const bookId = book?.book?.id;
  const prompts = useBookPrompts(bookId, { enabled: open });
  /*
    `★ Save` 라벨은 누른 **즉시** 바뀐다 — Figma 에 로딩 표현이 없어 지연을 숨기는 것이
    Figma 를 지키는 방법이다 (`G-13`, `useToggleSavedBook` 주석과 같은 근거).

    상태를 `{ bookId, saved }` 로 두는 이유: **effect 로 동기화하지 않기 위해서다.**
    교체 전환으로 다른 책이 들어오면 `bookId` 가 어긋나므로 서버 값으로 **자동 폴백**된다
    (`useEffect` + `setState` 는 cascading render 를 만든다 — eslint `set-state-in-effect`).
    목록 재조회가 끝나면 서버 값이 다시 내려오고, 실패하면 낙관값을 버린다.
  */
  const [pending, setPending] = useState<{ bookId: string; saved: boolean } | null>(null);
  const save = useToggleLibrarySave(() => {
    setPending(null);
  });
  const saved =
    pending !== null && pending.bookId === bookId ? pending.saved : (book?.saved ?? false);

  const title = book === undefined ? libraryCopy.title : bookTitle(book);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      variant="inset-card"
      trailing={
        <IconButton
          icon={<Icon name="x" size="md" decorative />}
          label={libraryCopy.closeSheet}
          variant="plain"
          onPress={onClose}
        />
      }
      /* ActionBar 는 **본문 밖 고정**이다 (`Sheet.footer` 주석 — Figma `Button/card`). */
      footer={
        book === undefined ? undefined : (
          <>
            <div className="haru-book-sheet__actions">
              <SaveButton
                saved={saved}
                busy={save.isPending}
                copy={{ save: libraryCopy.bookSheet.save, saved: libraryCopy.bookSheet.saved }}
                onToggle={() => {
                  if (bookId === undefined) return;
                  setPending({ bookId, saved: !saved });
                  save.toggle({ bookId, saved: !saved });
                }}
              />
              <StartSessionAction id="book-sheet" />
            </div>
            {save.isError ? (
              <InlineAlert tone="error" title={libraryCopy.bookSheet.saveFailed} />
            ) : null}
          </>
        )
      }
    >
      {book === undefined ? null : (
        <>
          <div className="haru-book-sheet__book">
            <span className="haru-book-sheet__cover">
              <BookCover
                title={bookTitle(book)}
                author={bookAuthor(book)}
                coverUrl={book.book?.coverUrl ?? undefined}
                decorative
              />
            </span>
            {bookSubtitle(book) === undefined ? null : (
              <Text as="span" variant="caption-1" tone="secondary" truncate={2}>
                {bookSubtitle(book)}
              </Text>
            )}
          </div>

          <PromptBlock hasCatalogueBook={bookId !== undefined} prompts={prompts} />

          {/*
            `key` 로 책마다 **새로 마운트**한다 — 신청 결과(`isSuccess`·`isError`)가 교체
            전환 뒤의 다른 책에 남지 않는다. effect 로 초기화하지 않는 이유와 같다.
          */}
          <GiftBlock key={book.id} book={book} />
        </>
      )}
    </Sheet>
  );
}

interface PromptBlockProps {
  hasCatalogueBook: boolean;
  prompts: ReturnType<typeof useBookPrompts>;
}

/**
 * Prompt 목록 — **서버 값만 표시**한다. 자르지 않는다 (`D-21` 상한 없음).
 * `followUps` 는 `questions` 뒤에 이어 붙인다 (`PromptSet` 의 순서 그대로).
 */
function PromptBlock({ hasCatalogueBook, prompts }: PromptBlockProps) {
  if (!hasCatalogueBook) {
    return (
      <Text variant="footnote" tone="secondary">
        {libraryCopy.bookSheet.promptsUnavailable}
      </Text>
    );
  }

  if (prompts.isPending) {
    return (
      <div role="status" aria-busy="true" aria-label={libraryCopy.bookSheet.promptsLoading}>
        <Skeleton shape="text" lines={4} />
      </div>
    );
  }

  if (prompts.isError || prompts.promptSet === undefined) {
    return (
      <InlineAlert
        tone="error"
        title={libraryCopy.bookSheet.promptsErrorTitle}
        action={{ label: libraryCopy.states.retry, onPress: prompts.refetch }}
      />
    );
  }

  const list: readonly Prompt[] = [...prompts.promptSet.questions, ...prompts.promptSet.followUps];

  return (
    <div
      className="haru-book-sheet__prompts"
      role="group"
      aria-label={libraryCopy.bookSheet.promptsLabel}
    >
      {list.map((prompt) => (
        <PromptPill key={prompt.id} prompt={prompt} tone="tinted" />
      ))}
    </div>
  );
}

interface GiftBlockProps {
  book: LibraryBook;
}

/**
 * 증정(FR-22) 블록 — `stage-3-design-spec.md` §2.9 의 ownership 분기다.
 *
 * | ownership | 표시 |
 * |---|---|
 * | `owned` · `gifted` | 없음 |
 * | `favorite_only` | 신청 `Button(glass)` + (`purchaseUrl` 있으면) `Where to buy` |
 * | `gift_pending` | 상태 `Tag` + `D-15` 접수 안내 (`InlineAlert tone=info`) |
 *
 * ⚠️ `L-OPEN-14`(보유·증정 **표식** 금지)와 충돌하지 않는다 — 금지된 것은 서재 **목록**의
 * 구분 표식이고, 여기 표시는 `FR-22` **기능 자체**다 (approvals §17.1).
 *
 * Figma 의 ActionBar(`Button/card` 329×45)는 **1행**이므로 이 블록을 그 안에 끼우지 않고
 * 본문 마지막 블록으로 둔다 — §2.9 트리와 배치가 다르며 **보고 대상**이다.
 */
function GiftBlock({ book }: GiftBlockProps) {
  const gift = useCreateGiftRequest();
  const status = book.giftRequestStatus ?? null;

  if (book.ownership === 'gift_pending' || gift.isSuccess) {
    return (
      <div className="haru-book-sheet__gift">
        {status === null ? null : <Tag label={giftRequestStatusCopy[status]} />}
        <InlineAlert
          tone="info"
          title={libraryCopy.giftRequests.noticeTitle}
          description={libraryCopy.giftRequests.noticeDescription}
        />
      </div>
    );
  }

  if (book.ownership !== 'favorite_only') return null;

  const bookId = book.book?.id;
  const purchaseUrl = book.purchaseUrl ?? null;
  const errorCopy = gift.errorCode === undefined ? networkErrorCopy : ERROR_COPY[gift.errorCode];

  return (
    <div className="haru-book-sheet__gift">
      {gift.isError ? (
        /* 중복 신청(`GIFT_REQUEST_DUPLICATE`)도 같은 자리에서 알린다 — 문구는 코드가 고른다. */
        <InlineAlert tone="info" title={errorCopy.title} description={errorCopy.description} />
      ) : null}
      <Button
        variant="glass"
        fullWidth
        loading={gift.isPending}
        onPress={() => {
          if (bookId === undefined) return;
          gift.request(bookId);
        }}
      >
        {libraryCopy.bookSheet.requestBook}
      </Button>
      {purchaseUrl === null ? null : (
        <TextLink
          href={purchaseUrl}
          tone="standalone"
          external
          externalHint={libraryCopy.bookSheet.whereToBuyHint}
        >
          {libraryCopy.bookSheet.whereToBuy}
        </TextLink>
      )}
    </div>
  );
}
