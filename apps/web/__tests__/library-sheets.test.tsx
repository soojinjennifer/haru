/**
 * Stage 3 Library 2라운드-2 — **시트 2종**의 DOM 계약
 * (`LibraryShelfSheet` §3.7 · `BookDetailSheet` §3.8 · 전환 §6.1 · 상태 §7.4).
 *
 * 기하·그림자 클리핑·시각 비교는 `e2e/library.spec.ts` · `e2e/shadow.spec.ts` ·
 * `e2e/visual.spec.ts` 가 덮는다. 여기는 **DOM 수준의 계약**이다:
 *   ① "See all" 이 섹션 제목을 가진 `dialog` 를 열고 **전체 목록**(섹션 노출 수보다 많다)을 담는다
 *   ② Shelf 시트 ActionBar 의 두 버튼은 **둘 다 `aria-disabled`** 다 (대상 책이 없다)
 *   ③ Shelf 행 탭 → `BookDetailSheet` **교체 전환**, 닫으면 **Shelf 복귀** (들어온 경로 = 나가는 경로)
 *   ④ 캐러셀 항목 · Book List 행 · `Reading now` 카드 탭 → `BookDetailSheet`, 닫으면 시트 0개
 *   ⑤ `BookDetailSheet` 가 `GET /v1/books/:bookId/prompts` 를 **1회** 부르고 서버 Prompt 를 그린다
 *   ⑥ `★ Save` 는 즉시 `Saved` 가 되고 `PUT …/saved-books` 뒤 **overview 를 재조회**한다 (`P3-BIP-15`)
 *   ⑦ `Start Session` 은 두 시트에서 모두 `aria-disabled` 다 (`D-3`)
 *   ⑧ 카탈로그에 없는 책은 Prompt 를 **조회하지 않는다** (`bookId` 가 없다)
 *   ⑨ 증정(FR-22) 분기 — `favorite_only` 신청 CTA · `gift_pending` 접수 안내 · 중복 안내
 *   ⑩ Shelf 시트의 Loading / Empty / Error(+Retry)
 *
 * 2라운드-3 (사용자 결정 2026-10-09) 추가
 *   ⑪ **추천 이유 줄** — 서버 문장(`BookPromptsResponse.reason`)을 그대로, `null` 이면 **없다**
 *   ⑫ **뒤집기** — 헤더 `[flip][닫기]`, 뒷면이 `[pill, 코칭 노트]` 를 앞면과 1:1 로 그린다
 *
 * 클릭은 `fireEvent` 다 — 이 저장소는 `@testing-library/user-event` 를 쓰지 않는다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { LibraryShelfSheet } from '../src/features/library';
import { MOCK_EPOCH_MS } from '../src/mocks';
import { ROUTES } from '../src/shared/config/routes';
import { createBookReasonFixture } from '../src/mocks/fixtures/books';
import { MOCK_CARD_PROMPTS } from '../src/mocks/fixtures/prompt-sets';
import { DECK_BOOKS } from '../src/mocks/fixtures/saved-books';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

async function renderLibrary(scenarios: readonly string[] = []): Promise<Harness> {
  const harness = createHarness({
    initialEntries: [ROUTES.library],
    ...(scenarios.length === 0 ? {} : { scenarios }),
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });

  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );

  await waitFor(() => {
    const node = document.querySelector('.haru-library-shelves');
    expect(node).not.toBeNull();
    expect(node?.getAttribute('aria-busy')).toBeNull();
  });

  return harness;
}

function dialog(): HTMLElement {
  return screen.getByRole('dialog');
}

function operations(harness: Harness, needle: string): readonly string[] {
  return harness.bundle.requestLog
    .entries()
    .map((entry) => entry.operation)
    .filter((operation) => operation.includes(needle));
}

/** 섹션 헤더의 "See all" — 접근성 이름이 `See all {섹션 제목}` 이다 (`SectionHeader` §9.4). */
function seeAll(section: string): HTMLElement {
  return screen.getByRole('button', { name: `See all ${section}` });
}

beforeEach(() => {
  vi.setSystemTime(MOCK_EPOCH_MS);
});

describe('`LibraryShelfSheet` — "See all" 전체 목록 (§3.7)', () => {
  it('섹션 제목을 가진 `dialog` 를 열고 **전체 목록**을 담는다 (캐러셀 1페이지보다 많다)', async () => {
    await renderLibrary();

    fireEvent.click(seeAll(libraryCopy.sectionTitles.curated));

    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });
    expect(
      within(dialog()).getByRole('heading', { name: libraryCopy.sectionTitles.curated }),
    ).toBeTruthy();

    /*
      본 화면 캐러셀은 한 페이지에 3권만 보이고(§3.3), 시트는 **전체 목록**이다
      (`L-OPEN-21` — 섹션 안 "Show more" 를 만들지 않는 대가다).
    */
    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-list-row').length).toBeGreaterThan(3);
    });
  });

  it('`GET …/library?filter=` 를 섹션의 **쿼리 축**으로 부른다 (`L-OPEN-14` — 표시 축과 1:1 아님)', async () => {
    const harness = await renderLibrary();

    fireEvent.click(seeAll(libraryCopy.sectionTitles.favorites));

    const listCalls = () =>
      harness.bundle.requestLog
        .entries()
        .filter((entry) => entry.operation === 'GET /v1/children/:childId/library');

    await waitFor(() => {
      expect(listCalls()).toHaveLength(1);
    });
    /* `favorites`(표시 축) → `saved`(쿼리 축). 프론트가 변환표를 소유한다. */
    expect(listCalls()[0]?.payload).toMatchObject({ filter: 'saved' });
  });

  it('ActionBar 의 ★ Save 와 Start Session 이 **둘 다 `aria-disabled`** 다 (대상 책이 없다)', async () => {
    await renderLibrary();

    fireEvent.click(seeAll(libraryCopy.sectionTitles.curated));
    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });

    const sheet = dialog();
    const save = within(sheet).getByRole('button', { name: libraryCopy.bookSheet.save });
    const start = within(sheet).getByRole('button', {
      name: libraryCopy.bookSheet.startSession.label,
    });

    expect(save.getAttribute('aria-disabled')).toBe('true');
    expect(start.getAttribute('aria-disabled')).toBe('true');
    // native `disabled` 를 쓰지 않는다 — 포커스를 잃으면 존재를 전달할 수 없다.
    expect((save as HTMLButtonElement).disabled).toBe(false);
    expect((start as HTMLButtonElement).disabled).toBe(false);
  });

  it('닫기 버튼으로 닫히고 시트가 DOM 에서 사라진다', async () => {
    await renderLibrary();

    fireEvent.click(seeAll(libraryCopy.sectionTitles.finished));
    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });

    fireEvent.click(within(dialog()).getByRole('button', { name: libraryCopy.closeSheet }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});

describe('`LibraryShelfSheet` 상태 화면 (§7.4) — 컴포넌트 직접 렌더', () => {
  /*
    scenario key 는 그룹 단위라 `error` 를 주면 **overview 도 함께** 실패해 "See all" 자체가
    사라진다. 그래서 시트만 직접 띄워 목록 조회의 상태 분기를 확인한다.
  */
  async function renderSheet(scenarios: readonly string[]): Promise<Harness> {
    const harness = createHarness({
      initialEntries: [ROUTES.library],
      ...(scenarios.length === 0 ? {} : { scenarios }),
    });
    /* 조회는 아이 id 가 있어야 시작된다 (`useCurrentChildId`) — 실제 화면과 같은 전제다. */
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <LibraryShelfSheet
          open
          section="curated"
          onClose={() => undefined}
          onSelectBook={() => undefined}
        />
      </Wrapper>,
    );
    return harness;
  }

  it('Empty — 목록 0건이면 안내가 뜬다 (오류가 아니다)', async () => {
    await renderSheet(['library:empty']);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.shelfSheet.emptyTitle)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: libraryCopy.states.retry })).toBeNull();
  });

  it('Error — `ErrorState` + Retry 가 **1개** 뜨고 빈 상태로 둔갑하지 않는다', async () => {
    await renderSheet(['library:error']);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.shelfSheet.errorTitle)).toBeTruthy();
    });
    expect(screen.getAllByRole('button', { name: libraryCopy.states.retry })).toHaveLength(1);
    expect(screen.queryByText(libraryCopy.shelfSheet.emptyTitle)).toBeNull();
  });

  it('Offline — Error 와 **같은 경로**다 (사전 차단 UI 를 만들지 않는다)', async () => {
    await renderSheet(['library:offline']);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.shelfSheet.errorTitle)).toBeTruthy();
    });
  });
});

describe('`BookDetailSheet` — 책별 Prompt 보기 (FR-20, §3.8)', () => {
  it('캐러셀 항목 탭으로 열리고 닫으면 시트가 **0개**가 된다', async () => {
    await renderLibrary();

    const shelfItem = document.querySelector('.haru-shelf-item--pressable');
    expect(shelfItem).not.toBeNull();
    fireEvent.click(shelfItem as HTMLElement);

    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });

    fireEvent.click(within(dialog()).getByRole('button', { name: libraryCopy.closeSheet }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('`Reading now` 카드 탭으로도 열린다 (§6.1)', async () => {
    await renderLibrary();

    const card = document.querySelector('button.haru-reading-now');
    expect(card).not.toBeNull();
    fireEvent.click(card as HTMLElement);

    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });
  });

  it('`GET /v1/books/:bookId/prompts` 를 부르고 **서버 Prompt 문구**를 그린다', async () => {
    const harness = await renderLibrary();

    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);

    await waitFor(() => {
      expect(operations(harness, '/prompts')).toStrictEqual(['GET /v1/books/:bookId/prompts']);
    });

    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-prompt-pill').length).toBeGreaterThan(0);
    });
  });

  it('`Start Session` 이 `aria-disabled` 다 (`D-3`)', async () => {
    await renderLibrary();

    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);
    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });

    expect(
      within(dialog())
        .getByRole('button', { name: libraryCopy.bookSheet.startSession.label })
        .getAttribute('aria-disabled'),
    ).toBe('true');
  });

  it('카탈로그에 없는 책은 Prompt 를 **조회하지 않는다**', async () => {
    const harness = await renderLibrary(['library:user-entered-book']);

    /*
      직접 등록 책은 `Finished together` 의 **5번째**다 (fixture `extraFinished`). 본 화면은
      4행 고정이라 그 행이 없으므로 "See all" 전체 목록에서 마지막 행을 연다.
    */
    fireEvent.click(seeAll(libraryCopy.sectionTitles.finished));
    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-list-row button').length).toBeGreaterThan(4);
    });
    const rows = dialog().querySelectorAll('.haru-list-row button');
    fireEvent.click(rows[rows.length - 1] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.bookSheet.promptsUnavailable)).toBeTruthy();
    });
    expect(operations(harness, '/prompts')).toStrictEqual([]);
  });

  it('추천 이유 줄을 **서버 문장 그대로** 그린다 (`BookPromptsResponse.reason`)', async () => {
    await renderLibrary();

    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);

    /* 첫 캐러셀 항목 = `DECK_BOOKS[0]`. 이유는 그 `bookId` 로 결정된다. */
    const reason = createBookReasonFixture(DECK_BOOKS[0]?.id ?? '');
    await waitFor(() => {
      expect(within(dialog()).getByText(reason)).toBeTruthy();
    });
    /* 책 블록 안이다 — Prompt 목록이 아니라 표지 옆 텍스트 열이다 (Figma `145:1085`). */
    expect(dialog().querySelector('.haru-book-sheet__book-text')?.textContent).toContain(reason);
  });

  it('`reason` 이 없으면 **줄을 생략**한다 (대체 문구를 만들지 않는다)', async () => {
    await renderLibrary(['books:no-reason']);

    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);

    /* Prompt 는 그대로 도착한다 — 이유만 없다. */
    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-prompt-pill').length).toBeGreaterThan(0);
    });
    const reason = createBookReasonFixture(DECK_BOOKS[0]?.id ?? '');
    expect(within(dialog()).queryByText(reason)).toBeNull();
    /* 텍스트 열에는 `저자 · 역량` 한 줄만 남는다. */
    expect(dialog().querySelector('.haru-book-sheet__book-text')?.childElementCount).toBe(1);
  });

  it('`★ Save` 는 즉시 `Saved` 가 되고 저장 뒤 **overview 를 재조회**한다 (`P3-BIP-15`)', async () => {
    const harness = await renderLibrary();

    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);
    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });

    const before = operations(harness, 'library/overview').length;
    fireEvent.click(within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.save }));

    /* 라벨은 응답을 기다리지 않는다 — Figma 에 로딩 표현이 없다 (`G-13`). */
    await waitFor(() => {
      expect(
        within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.saved }),
      ).toBeTruthy();
    });

    await waitFor(() => {
      expect(operations(harness, 'PUT /v1/children/:childId/saved-books')).toHaveLength(1);
    });
    await waitFor(() => {
      expect(operations(harness, 'library/overview').length).toBeGreaterThan(before);
    });
  });
});

/**
 * 뒤집기 — 사용자 결정 2026-10-09 (`L-R2B-02`).
 *
 * 어포던스는 **헤더 trailing 의 두 번째 `IconButton`** 이다. 닫기는 바깥쪽 자리를 지킨다 —
 * 시트를 닫을 방법이 사라지면 안 된다. 뒷면은 `inert` + `aria-hidden` 이라 두 면이 모두 DOM 에
 * 있으므로, "보인다" 는 **숨김 속성**으로 단정한다 (Home 뒷면 테스트와 같은 방식).
 */
describe('`BookDetailSheet` 뒤집기 — 코칭 노트 (2라운드-3)', () => {
  async function openFirstBook(): Promise<void> {
    await renderLibrary();
    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);
    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-prompt-pill').length).toBeGreaterThan(0);
    });
  }

  const faces = () => ({
    flip: dialog().querySelector('.haru-book-sheet__flip') as HTMLElement,
    front: dialog().querySelector('.haru-book-sheet__face--front') as HTMLElement,
    back: dialog().querySelector('.haru-book-sheet__face--back'),
  });

  it('Prompt 가 오면 헤더에 flip 버튼이 생기고 **닫기는 그대로** 있다', async () => {
    await openFirstBook();

    const header = dialog().querySelector('.haru-book-sheet__header-actions') as HTMLElement;
    const buttons = within(header).getAllByRole('button');

    expect(buttons.map((button) => button.getAttribute('aria-label'))).toStrictEqual([
      libraryCopy.bookSheet.showNotes,
      libraryCopy.closeSheet,
    ]);
    /* 닫기가 **마지막(모서리)** 자리다. */
    expect(buttons[1]?.getAttribute('aria-label')).toBe(libraryCopy.closeSheet);
  });

  it('누르면 뒤집히고 두 면의 숨김이 뒤바뀐다 (같은 자리의 같은 버튼으로 되돌아온다)', async () => {
    await openFirstBook();

    expect(faces().flip.getAttribute('data-face')).toBe('front');
    expect(faces().back?.getAttribute('aria-hidden')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: libraryCopy.bookSheet.showNotes }));

    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('back');
    });
    expect(faces().front.getAttribute('aria-hidden')).toBe('true');
    expect(faces().back?.getAttribute('aria-hidden')).toBe('false');

    const backButton = screen.getByRole('button', { name: libraryCopy.bookSheet.showBook });
    expect(backButton.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(backButton);
    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('front');
    });
  });

  it('뒷면이 앞면 Prompt 와 **1:1 같은 개수**이고 질문마다 코칭 노트가 붙는다', async () => {
    await openFirstBook();

    const front = faces().front;
    const back = faces().back as HTMLElement;
    const frontPills = front.querySelectorAll('.haru-prompt-pill').length;

    expect(back.querySelectorAll('.haru-prompt-pill')).toHaveLength(frontPills);
    /*
      `coachingNote` 는 `kind === 'question'` 에만 강제된다 — `follow_up` 은 **pill 만** 남는다
      (Figma `86:482` 의 마지막 항목과 같은 모양). 목록을 거르지 않는다.
    */
    expect(back.querySelectorAll('.haru-coaching-note')).toHaveLength(MOCK_CARD_PROMPTS.length);
    expect(frontPills).toBeGreaterThan(MOCK_CARD_PROMPTS.length);
    expect(within(back).getByRole('heading', { level: 3, hidden: true }).textContent).toBe(
      libraryCopy.bookSheet.notesTitle,
    );
    expect(libraryCopy.bookSheet.notesTitle).toBe('Prompt of this book');
  });

  /*
    사용자 결정 2026-10-09 ② — Figma `86:482` **뒷면에는 ActionBar 가 없다**.
    ActionBar 는 `Sheet.footer` 라 뒤집히지 않으므로, 뒤집힌 동안 `inert` + `aria-hidden`
    으로 빼고(레이아웃 제거는 `library.css` 의 음수 margin 이 한다) 앞면에서 되돌린다.
    닫기·flip 은 **헤더**라 그대로 살아 있다.
  */
  it('뒷면에서는 ActionBar 가 사라지고(`inert` + `aria-hidden`) 앞면에서 돌아온다', async () => {
    await openFirstBook();
    const bar = () => dialog().querySelector('.haru-book-sheet__action-bar') as HTMLElement;

    expect(bar().getAttribute('data-hidden')).toBe('false');
    expect(bar().hasAttribute('inert')).toBe(false);
    expect(
      screen
        .getByRole('button', { name: libraryCopy.bookSheet.startSession.label })
        .getAttribute('aria-disabled'),
    ).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: libraryCopy.bookSheet.showNotes }));
    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('back');
    });

    expect(bar().getAttribute('data-hidden')).toBe('true');
    expect(bar().hasAttribute('inert')).toBe(true);
    expect(bar().getAttribute('aria-hidden')).toBe('true');
    /* 접근성 트리에서 빠진다 — 뒷면에서는 ActionBar 버튼을 찾을 수 없다. */
    expect(
      screen.queryByRole('button', { name: libraryCopy.bookSheet.startSession.label }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: libraryCopy.bookSheet.save })).toBeNull();

    /* 앞면으로 돌아오면 그대로 돌아온다. */
    fireEvent.click(screen.getByRole('button', { name: libraryCopy.bookSheet.showBook }));
    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('front');
    });
    expect(bar().getAttribute('data-hidden')).toBe('false');
    expect(
      screen
        .getByRole('button', { name: libraryCopy.bookSheet.startSession.label })
        .getAttribute('aria-disabled'),
    ).toBe('true');
  });

  it('뒷면에서도 닫기는 살아 있다 (헤더는 뒤집히지 않는다)', async () => {
    await openFirstBook();
    fireEvent.click(screen.getByRole('button', { name: libraryCopy.bookSheet.showNotes }));
    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('back');
    });

    fireEvent.click(screen.getByRole('button', { name: libraryCopy.closeSheet }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  /*
    사용자 결정 2026-10-09 ① — Figma `86:482` 뒷면은 **면 전체**가 `color/spring green/86`
    이다. 가운데(본문)만 칠하면 헤더·ActionBar 자리가 흰 채로 남으므로 `Sheet` 가 면 색을
    받는다 (`surface="spring"`). **앞면에서는 지정하지 않는다** — 기존 면 색 그대로다.
  */
  it('뒷면에서만 시트 면이 `spring` 이 된다 (앞면은 클래스 자체가 없다)', async () => {
    await openFirstBook();
    const sheet = () => dialog();

    expect(sheet().classList.contains('haru-sheet--surface-spring')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: libraryCopy.bookSheet.showNotes }));
    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('back');
    });
    expect(sheet().classList.contains('haru-sheet--surface-spring')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: libraryCopy.bookSheet.showBook }));
    await waitFor(() => {
      expect(faces().flip.getAttribute('data-face')).toBe('front');
    });
    expect(sheet().classList.contains('haru-sheet--surface-spring')).toBe(false);
  });

  /*
    `R-SHADOW-1` ③ (사용자 결정 2026-10-09 ③) — 표지 그림자 자리(좌우 14)는 **본문 밖**이라
    시트가 만들어야 한다. `true`(= `--shadow-bubble` 기준 4)가 아니라 `'cover'` 다.
  */
  it('본문에 표지 전용 그림자 자리가 켜져 있다 (`contentShadowInset="cover"`)', async () => {
    await openFirstBook();
    const content = dialog().querySelector('.haru-sheet__content') as HTMLElement;

    expect(content.classList.contains('haru-sheet__content--shadow-inset-cover')).toBe(true);
    /* 버블용 자리(아래 10 · 좌우 4)는 켜지 않는다 — 번짐이 다르다. */
    expect(content.classList.contains('haru-sheet__content--shadow-inset')).toBe(false);
  });

  it('카탈로그에 없는 책에는 flip 버튼도 뒷면도 없다 (노트가 존재할 수 없다)', async () => {
    await renderLibrary(['library:user-entered-book']);

    fireEvent.click(seeAll(libraryCopy.sectionTitles.finished));
    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-list-row button').length).toBeGreaterThan(4);
    });
    const rows = dialog().querySelectorAll('.haru-list-row button');
    fireEvent.click(rows[rows.length - 1] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.bookSheet.promptsUnavailable)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: libraryCopy.bookSheet.showNotes })).toBeNull();
    /* 교체 전환 직후에는 닫히는 Shelf 시트가 남아 있어 `dialog()` 가 2개를 본다 — 문서 전체를 센다. */
    expect(document.querySelectorAll('.haru-book-sheet__face--back')).toHaveLength(0);
  });
});

describe('Shelf → BookDetail **교체 전환** (§2.9 — 들어온 경로 = 나가는 경로)', () => {
  it('Shelf 행 탭으로 BookDetail 이 열리고, 닫으면 **Shelf 로 복귀**한다', async () => {
    await renderLibrary();

    fireEvent.click(seeAll(libraryCopy.sectionTitles.finished));
    await waitFor(() => {
      expect(dialog()).toBeTruthy();
    });
    await waitFor(() => {
      expect(dialog().querySelectorAll('.haru-list-row button').length).toBeGreaterThan(0);
    });

    const firstRow = dialog().querySelector('.haru-list-row button');
    fireEvent.click(firstRow as HTMLElement);

    /* 시트는 **한 번에 하나**다 — scrim 2겹을 만들지 않는다. */
    await waitFor(() => {
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });
    await waitFor(() => {
      expect(
        within(dialog()).queryByRole('heading', { name: libraryCopy.sectionTitles.finished }),
      ).toBeNull();
    });

    fireEvent.click(within(dialog()).getByRole('button', { name: libraryCopy.closeSheet }));

    /* 닫으면 Shelf 목록으로 되돌아온다 (둘 다 닫히지 않는다). */
    await waitFor(() => {
      expect(
        within(dialog()).getByRole('heading', { name: libraryCopy.sectionTitles.finished }),
      ).toBeTruthy();
    });
  });
});

describe('증정 (FR-22) — `BookDetailSheet` 분기 (§2.9 · `L-OPEN-14` 경계)', () => {
  it('`favorite_only` 책에는 신청 CTA 가 있다', async () => {
    await renderLibrary();

    /* `Favorites` 캐러셀 항목은 fixture 에서 `ownership: favorite_only` 다. */
    const items = document.querySelectorAll('.haru-shelf-item--pressable');
    fireEvent.click(items[items.length - 1] as HTMLElement);

    await waitFor(() => {
      expect(
        within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.requestBook }),
      ).toBeTruthy();
    });
  });

  it('신청하면 `POST …/gift-requests` 가 1회 나가고 접수 안내로 바뀐다', async () => {
    const harness = await renderLibrary();

    const items = document.querySelectorAll('.haru-shelf-item--pressable');
    fireEvent.click(items[items.length - 1] as HTMLElement);
    await waitFor(() => {
      expect(
        within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.requestBook }),
      ).toBeTruthy();
    });

    fireEvent.click(
      within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.requestBook }),
    );

    await waitFor(() => {
      expect(operations(harness, 'POST /v1/children/:childId/gift-requests')).toHaveLength(1);
    });
    await waitFor(() => {
      expect(screen.getByText(libraryCopy.giftRequests.noticeTitle)).toBeTruthy();
    });
  });

  it('`gift-duplicate` 는 **안내**로 알린다 (오류 화면으로 막지 않는다)', async () => {
    await renderLibrary(['library:gift-duplicate']);

    const items = document.querySelectorAll('.haru-shelf-item--pressable');
    fireEvent.click(items[items.length - 1] as HTMLElement);
    await waitFor(() => {
      expect(
        within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.requestBook }),
      ).toBeTruthy();
    });

    fireEvent.click(
      within(dialog()).getByRole('button', { name: libraryCopy.bookSheet.requestBook }),
    );

    await waitFor(() => {
      expect(screen.getByText('Request already in progress')).toBeTruthy();
    });
  });
});
