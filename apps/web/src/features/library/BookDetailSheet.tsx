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
 * └ ActionBar  ★ Save + Start Session(Stage 4 `S4-F1` — 활성, `D-3` 해제)
 * ```
 *
 * ── ⚠️ `ActivityOptionCard` 를 **재사용하지 못했다** (보고 대상, 2라운드-2 그대로) ──
 * Design Spec §3.8 은 "같은 규격이므로 `ActivityOptionCard` 재사용" 을 적지만, 그 컴포넌트는
 * `ActivityCardOption` 을 받는다. 서재가 가진 데이터는 `LibraryBook` + `BookPromptsResponse`
 * 이고 **`position` · `kind` 가 없다**. 그래서 **같은 하위 부품**(`BookCover` · `PromptPill` ·
 * `CoachingNote` · `SaveButton`)으로 같은 구성을 만든다.
 *
 * ── 추천 이유 줄 (**해소됨** — 사용자 결정 2026-10-09) ──
 * 2라운드-2 는 `reason` 이 contract 에 없어 이 줄을 **빼고** 보고했다. 사용자 결정으로
 * **`BookPromptsResponse.reason`** 이 추가되었다 (선정 근거는 `packages/contracts/src/books/
 * prompts.ts` 주석). 서버 문장을 **그대로** 그리고, `null` 이면 **줄 자체를 생략**한다 —
 * 빈 문자열·대체 문구를 만들지 않는다 (`rules/frontend.md` §8).
 *
 * ── 헤더에 들어가는 것 ──
 * Figma 카드의 `Cardtitle` 행에는 역량 Tag 와 flip 아이콘이 있고 제목은 본문에 있다.
 * 시트에서는 그 행이 `Sheet` 헤더(제목 + trailing)이고 trailing 은 **닫기 `IconButton`** 로
 * 확정되어 있다 (Design Spec §4.5 · `stage-3-design-spec.md` §2.8). 그래서
 *   ① 책 제목을 헤더로 올리고(타이포는 Figma 카드 제목과 같은 `headline`),
 *   ② 역량은 본문 부제에서 `저자 · 역량` 으로 보인다 (`ReadingNowCard` 와 같은 규칙),
 *   ③ trailing 에 **flip + 닫기 2개**를 둔다 (아래).
 *
 * ── 코칭 노트 = **뒤집기** (사용자 결정 2026-10-09) ──
 * `Prompt.coachingNote` 를 Home 카드 뒷면(`86:482`)과 **같은 방식**으로 보여 준다.
 *
 * **어포던스**: `Sheet.trailing` 은 `ReactNode` 라 **Shared UI 수정 없이** 두 개를 넣을 수
 * 있다. `[flip][닫기]` 순서이며 **닫기는 바깥쪽(모서리) 자리를 그대로 지킨다** — 닫는 방법을
 * 없애지 않는다. 두 버튼 다 `IconButton`(38×38 · hit 44) 이라 헤더 높이가 변하지 않는다.
 * flip 은 `aria-pressed` 로 상태를 알리고, 뒷면에서도 **같은 자리의 같은 버튼**으로 되돌아온다
 * (audit §11.5 "뒷면에도 같은 자리에 같은 아이콘"). 아이콘은 Home 과 같은 `haru:flip-to-back`.
 * ⚠️ Figma `145:1085` 에는 이 두 번째 헤더 아이콘이 **없다** — 승인된 추가다.
 *
 * **뒷면 내용**: 앞면 pill 목록과 **같은 순서·같은 개수**로 `[pill, 코칭 노트]` 를 그린다.
 * `coachingNote` 는 `kind === 'question'` 에만 강제되므로(`createPromptCoachingRefine`)
 * `follow_up` 은 **pill 만** 남는다 — Figma `86:482` 의 마지막 항목도 노트 없는 pill 이고
 * Home 뒷면도 같은 규칙이다. 목록을 **거르지 않는다**(`D-21` 과 같은 이유: 서버 배열을
 * 프론트가 줄이지 않는다). 노트가 하나도 없으면 뒤집을 것이 없으므로 **flip 버튼을 내지 않는다**.
 *
 * **높이**: 뒷면은 `position: absolute; inset: 0` 으로 **앞면 높이를 그대로** 쓴다.
 * 목록이 그 높이를 넘으면 **뒷면 본문만** 스크롤한다 (Home 뒷면과 같은 처리).
 *
 * ── 뒷면 = **면 전체가 초록 + ActionBar 없음** (사용자 결정 2026-10-09 ① · ②) ──
 * Figma `86:482` 뒷면은 면이 `color/spring green/86` 이고 ActionBar 가 **없다**. 둘 다
 * 시트 본문 **밖**의 사실이므로 `Sheet` 가 받는다: 면 색은 `surface="spring"`(opt-in),
 * ActionBar 는 footer 를 뒤집힌 동안 레이아웃에서 빼서(`library.css`) 처리한다.
 * ⚠️ 그래서 **뒤집으면 시트 높이가 57(45 + gap 12) 줄어든다** — 높이 상한에 걸리지 않은
 * 화면(393×852)에서는 윗변이 그만큼 내려오고, 상한에 걸린 화면(320×568)에서는 높이가 그대로이고
 * **본문이 57 늘어난다**(뒷면 목록이 그만큼 더 보인다). 두 경우 모두 음수 margin 전환이라
 * 400ms 에 걸쳐 움직인다. 수치는 e2e 가 고정한다.
 *
 * ── `contentShadowInset="cover"` (`R-SHADOW-1` ③, 사용자 결정 2026-10-09 ③) ──
 * 본문 자식 중 drop shadow 를 가진 것은 **표지 하나**다 (`PromptPill` 은 outline/면, `CoachingNote`
 * 는 `material="none"`). 표지 자리의 아래·위(20 / 8)는 `library.css` `.haru-book-sheet__cover` 가
 * 갖지만, **좌우 14 는 본문 밖**이라 거기서 만들 수 없다 — 2라운드-2 부터 좌측 14 가
 * `.haru-sheet__content` 경계에서 전면 절단되어 있었다(실측 Δ `0 0 0 …`). 그래서 본문에
 * `cover` 자리(좌우 14)를 켠다. `true`(`--shadow-bubble` 기준 4)로는 모자란다.
 *
 * 뒷면 목록은 **새 `overflow` 박스**이므로 `R-SHADOW-1` 을 다시 적용했다 — 자리는
 * `library.css` `.haru-book-sheet__notes` 가 만들고, 번짐 실측과 보정 전/후 프로브는
 * `e2e/shadow.spec.ts` 가 고정한다.
 */
import {
  Icon,
  IconButton,
  InlineAlert,
  Sheet,
  Skeleton,
  Tag,
  Text,
  TextLink,
  useToast,
} from '@haru/ui';
import { useState } from 'react';
import type { LibraryBook, Prompt } from '@haru/contracts';

import { BookCover, useBookPrompts } from '../../entities/book';
import { CoachingNote, PromptPill, SaveButton } from '../../entities/activity-card';
import { useToggleLibrarySave } from '../../entities/library';
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
    앞면 pill 목록 = 뒷면 항목 목록이다 (같은 배열, 같은 순서). `followUps` 를 `questions`
    뒤에 이어 붙이는 것은 `PromptSet` 의 순서 그대로다.
  */
  const promptList: readonly Prompt[] =
    prompts.promptSet === undefined
      ? []
      : [...prompts.promptSet.questions, ...prompts.promptSet.followUps];
  /* 노트가 하나도 없으면 뒤집을 것이 없다 → flip 버튼도, 뒷면도 내지 않는다. */
  const hasNotes = promptList.some(
    (prompt) => prompt.coachingNote !== undefined && prompt.coachingNote !== null,
  );
  /*
    `★ Save` 라벨은 누른 **즉시** 바뀐다 — Figma 에 로딩 표현이 없어 지연을 숨기는 것이
    Figma 를 지키는 방법이다 (`G-13`, `useToggleSavedBook` 주석과 같은 근거).

    상태를 `{ bookId, saved }` 로 두는 이유: **effect 로 동기화하지 않기 위해서다.**
    교체 전환으로 다른 책이 들어오면 `bookId` 가 어긋나므로 서버 값으로 **자동 폴백**된다
    (`useEffect` + `setState` 는 cascading render 를 만든다 — eslint `set-state-in-effect`).
    목록 재조회가 끝나면 서버 값이 다시 내려오고, 실패하면 낙관값을 버린다.
  */
  const [pending, setPending] = useState<{ bookId: string; saved: boolean } | null>(null);
  /*
    저장 실패는 **Toast** 로 알린다 (사용자 지적 2026-10-10). 인라인 알림은 두 가지를 동시에
    틀렸다:
      ① ActionBar 아래에 자리를 차지해 **다른 내용을 밀어낸다** — 사용자 요청은 "떴다가 사라져
         다른 컨텐츠를 방해하지 않는" 형태였다.
      ② `save.isError` 는 mutation 상태라 **책에 묶이지 않는다.** 이 시트는 `LibraryShelves` 가
         단일 인스턴스로 들고 `book` prop 만 갈아 끼우므로(`:133` 교체 전환), 한 번 실패하면
         **이후 어떤 책을 열어도** 알림이 남았다. `pending`·`face` 는 `bookId` 로 키를 걸어
         자동 폴백되는데 `isError` 에는 그 장치가 없었다.
    Toast 는 **그 시점의 사건**이라 렌더 상태가 아니다 — 교체 전환으로 새어 나갈 상태 자체가
    없어지고, 호출 1회 = 알림 1회가 된다. Home `ActivityCardDeck` 과 **같은 방식**이다.
  */
  const toast = useToast();
  const save = useToggleLibrarySave(() => {
    setPending(null);
    toast.show({ message: libraryCopy.bookSheet.saveFailed, tone: 'error' });
  });
  const saved =
    pending !== null && pending.bookId === bookId ? pending.saved : (book?.saved ?? false);

  /*
    뒤집힌 면도 **책에 묶어** 둔다 — `pending` 과 같은 이유다. 교체 전환으로 다른 책이
    들어오면 id 가 어긋나 **앞면으로 자동 폴백**되므로 effect 로 동기화하지 않는다.
    노트가 사라진 경우(조회 실패·재조회)에도 `hasNotes` 가 앞면을 강제한다.
  */
  const [face, setFace] = useState<{ bookId: string; back: boolean } | null>(null);
  const back = hasNotes && face !== null && face.bookId === book?.id && face.back;

  function close(): void {
    setFace(null);
    onClose();
  }

  const title = book === undefined ? libraryCopy.title : bookTitle(book);

  return (
    <Sheet
      open={open}
      onClose={close}
      title={title}
      variant="inset-card"
      /*
        면 색 — 뒤집힌 동안 **시트 면 전체**가 Figma `86:482` 뒷면 색이 된다 (사용자 결정
        2026-10-09 ①). 가운데(본문)만 칠하면 헤더·ActionBar 자리가 흰 채로 남아 "가운데만
        초록" 이 되므로 면을 `Sheet` 가 받는다. 주지 않으면 기존 면 색 그대로다.
      */
      surface={back ? 'spring' : undefined}
      /*
        `R-SHADOW-1` ③ — 표지(`--shadow-cover`) **좌우 자리 14**. 2라운드-2 부터 좌측 14 가
        `.haru-sheet__content` 경계에서 **전면 절단**되어 있었다 (실측 좌 Δ `0 0 0 …`).
        `true`(= `--shadow-bubble` 기준 좌우 4 + 아래 10)로는 모자란다 — 번짐이 다르다.
      */
      contentShadowInset="cover"
      /*
        trailing 은 `ReactNode` 다 — Shared UI 를 고치지 않고 **한 요소 안에 두 버튼**을 둔다
        (`.haru-sheet__trailing` 의 레이아웃 선언을 바꾸면 Stage 2 시트 baseline 이 움직인다).
        닫기는 **바깥쪽 자리 그대로**이고 flip 이 그 안쪽에 붙는다.
      */
      trailing={
        <div className="haru-book-sheet__header-actions">
          {book !== undefined && hasNotes ? (
            <IconButton
              icon={<Icon name="haru:flip-to-back" size="md" decorative />}
              label={back ? libraryCopy.bookSheet.showBook : libraryCopy.bookSheet.showNotes}
              variant="plain"
              aria-pressed={back}
              onPress={() => {
                if (book === undefined) return;
                setFace({ bookId: book.id, back: !back });
              }}
            />
          ) : null}
          <IconButton
            icon={<Icon name="x" size="md" decorative />}
            label={libraryCopy.closeSheet}
            variant="plain"
            onPress={close}
          />
        </div>
      }
      /*
        ActionBar 는 **본문 밖 고정**이다 (`Sheet.footer` 주석 — Figma `Button/card`).
        Figma `86:482` **뒷면에는 ActionBar 가 없다** → 뒤집힌 동안 레이아웃에서 빼고
        (`library.css` 가 음수 margin 으로 400ms 에 걸쳐 접는다) 포커스·스크린리더에서도
        제외한다. 앞면으로 돌아오면 그대로 돌아온다. 닫기·flip 은 헤더라 영향이 없다.
      */
      footer={
        book === undefined ? undefined : (
          <div
            className="haru-book-sheet__action-bar"
            data-hidden={back}
            inert={back}
            aria-hidden={back}
          >
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
              <StartSessionAction id="book-sheet" book={book} />
            </div>
          </div>
        )
      }
    >
      {book === undefined ? null : (
        <div className="haru-book-sheet__flip" data-face={back ? 'back' : 'front'}>
          <div className="haru-book-sheet__flip-inner">
            <div
              className="haru-book-sheet__face haru-book-sheet__face--front"
              inert={back}
              aria-hidden={back}
            >
              <div className="haru-book-sheet__book">
                <span className="haru-book-sheet__cover">
                  <BookCover
                    title={bookTitle(book)}
                    author={bookAuthor(book)}
                    coverUrl={book.book?.coverUrl ?? undefined}
                    decorative
                  />
                </span>
                <div className="haru-book-sheet__book-text">
                  {bookSubtitle(book) === undefined ? null : (
                    <Text as="span" variant="caption-1" tone="secondary" truncate={2}>
                      {bookSubtitle(book)}
                    </Text>
                  )}
                  {/*
                    추천 이유 — **서버 문장 그대로**. `null` 이면 줄이 없다 (대체 문구 금지).
                    Figma 카드 `145:1085` 의 책 블록 3번째 줄과 같은 자리다.
                  */}
                  {prompts.reason === null ? null : (
                    <Text variant="footnote">{prompts.reason}</Text>
                  )}
                </div>
              </div>

              <PromptBlock hasCatalogueBook={bookId !== undefined} prompts={prompts} />

              {/*
                `key` 로 책마다 **새로 마운트**한다 — 신청 결과(`isSuccess`·`isError`)가 교체
                전환 뒤의 다른 책에 남지 않는다. effect 로 초기화하지 않는 이유와 같다.
              */}
              <GiftBlock key={book.id} book={book} />
            </div>

            {hasNotes ? <NotesFace prompts={promptList} hidden={!back} /> : null}
          </div>
        </div>
      )}
    </Sheet>
  );
}

interface NotesFaceProps {
  prompts: readonly Prompt[];
  hidden: boolean;
}

/**
 * 뒷면 — Figma `86:482` (`Prompt Card/Home` `flip=back`) 의 구성을 시트 본문 자리에 그린다.
 *
 * - 제목은 Figma 문구 그대로 **단수형** `Prompt of this book`. 시트 헤더는 책 제목을
 *   그대로 들고 있으므로 dialog 의 접근성 이름은 바뀌지 않는다.
 * - `[pill, 코칭 노트]` 를 **앞면과 같은 순서·같은 개수**로 그린다. 노트가 없는 Prompt
 *   (`follow_up`)는 **pill 만** 남는다 — Figma 뒷면의 마지막 항목도 그 모양이다.
 * - 목록이 앞면 높이를 넘으면 **이 블록만** 스크롤한다. 그래서 `R-SHADOW-1` 의 inset 설계가
 *   `library.css` 에 함께 있다.
 * - 배경: 이 면은 **색을 갖지 않는다.** Figma 뒷면 색(`color/spring green/86`)은 시트 면
 *   전체(`Sheet surface="spring"`)가 갖는다 — 가운데만 칠하면 헤더·ActionBar 자리가 흰
 *   채로 남는다 (사용자 결정 2026-10-09 ①).
 */
function NotesFace({ prompts, hidden }: NotesFaceProps) {
  return (
    <div
      className="haru-book-sheet__face haru-book-sheet__face--back"
      inert={hidden}
      aria-hidden={hidden}
    >
      <Text as="h3" variant="headline" weight="bold">
        {libraryCopy.bookSheet.notesTitle}
      </Text>
      {/* 스크롤 영역의 키보드 도달 — Home 뒷면과 같은 사유다 (WCAG 2.1.1). */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="haru-book-sheet__notes"
        tabIndex={0}
        role="group"
        aria-label={libraryCopy.bookSheet.notesTitle}
      >
        {prompts.map((prompt) => (
          <div key={prompt.id} className="haru-book-sheet__note-item">
            <PromptPill prompt={prompt} tone="tinted" />
            {prompt.coachingNote === undefined || prompt.coachingNote === null ? null : (
              <CoachingNote>{prompt.coachingNote}</CoachingNote>
            )}
          </div>
        ))}
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
    </div>
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
 * ── 신청 제거 (사용자 결정 2026-10-10) ───────────────────────────────────
 * 증정 **신청**은 프론트에서 하지 않는다. 남는 것은 **조회**(상태 표시)뿐이다.
 * 따라서 `favorite_only` 의 신청 CTA 와 그 뮤테이션 사용(`useCreateGiftRequest`)을 지웠다.
 * contract(`createGiftRequest`) · Mock · hook 파일은 **그대로 둔다** — Backend 인터페이스다.
 *
 * | ownership | 표시 |
 * |---|---|
 * | `owned` · `gifted` | 없음 |
 * | `favorite_only` | (`purchaseUrl` 있으면) `Where to buy` — 없으면 아무것도 없다 |
 * | `gift_pending` | 상태 `Tag` + `D-15` 접수 안내 (`InlineAlert tone=info`) |
 *
 * ⚠️ `L-OPEN-14`(보유·증정 **표식** 금지)와 충돌하지 않는다 — 금지된 것은 서재 **목록**의
 * 구분 표식이고, 여기 표시는 `FR-22` **기능 자체**다 (approvals §17.1).
 *
 * Figma 의 ActionBar(`Button/card` 329×45)는 **1행**이므로 이 블록을 그 안에 끼우지 않고
 * 본문 마지막 블록으로 둔다 — §2.9 트리와 배치가 다르며 **보고 대상**이다.
 */
function GiftBlock({ book }: GiftBlockProps) {
  const status = book.giftRequestStatus ?? null;

  if (book.ownership === 'gift_pending') {
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

  /*
    신청 CTA 가 사라졌으므로 이 분기에 남는 것은 외부 구매 링크 하나다. 링크가 없으면
    빈 상자를 남기지 않는다 (`gap` 만 더해져 본문 간격이 벌어진다).
  */
  const purchaseUrl = book.purchaseUrl ?? null;
  if (purchaseUrl === null) return null;

  return (
    <div className="haru-book-sheet__gift">
      <TextLink
        href={purchaseUrl}
        tone="standalone"
        external
        externalHint={libraryCopy.bookSheet.whereToBuyHint}
      >
        {libraryCopy.bookSheet.whereToBuy}
      </TextLink>
    </div>
  );
}
