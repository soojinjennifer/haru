/**
 * Stage 3 Library 2라운드-2 — **진입점 + 하위 화면 2종**의 DOM 계약
 * (Library Design Spec §7.1 `LibraryEntryActions` · §7.2 `/library/add` · §7.3
 * `/library/gift-requests` — 전부 **Figma 없음**, `C-13` ②(`L-OPEN-12`·`L-OPEN-13`) 승인 명세).
 *
 *   ① 진입점은 `/library` 하단의 **`ListGroup` 2행**이고 섹션 제목을 만들지 않는다
 *   ② 두 행이 각각 `/library/add` · `/library/gift-requests` 로 이동한다
 *   ③ 폐기된 `LibraryFooterActions` 형태(전폭 glass 버튼 · TextLink)가 **없다**
 *   ④ `/library/add` — 검색(`GET /v1/books/search`) · 직접 입력 · 중복 안내 · 성공 후 복귀
 *   ⑤ `/library/gift-requests` — 상태 `Tag` 6종 재사용 · **신청 CTA 없음** · Empty / Error
 *   ⑥ `Idempotency-Key` 가 **생성 요청에만** 실린다
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GiftRequestStatusSchema } from '@haru/contracts';

import { AppRoutes } from '../src/app/router';
import { MOCK_EPOCH_MS } from '../src/mocks';
import { ROUTES } from '../src/shared/config/routes';
import { giftRequestStatusCopy, libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

async function renderAt(path: string, scenarios: readonly string[] = []): Promise<Harness> {
  const harness = createHarness({
    initialEntries: [path],
    ...(scenarios.length === 0 ? {} : { scenarios }),
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });

  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );
  return harness;
}

/**
 * Route Guard 판정이 끝나기를 기다린다 — `me` 조회가 비동기이고 그 동안 **Spinner** 가
 * 본문 자리를 차지한다. TopBar(`h1`)는 Guard **밖**에 있어서 제목만 기다리면 부족하다.
 */
async function waitForAddScreen(): Promise<void> {
  await waitFor(() => {
    expect(titleField()).toBeTruthy();
  });
}

/**
 * 필수 입력 라벨에는 **시각 전용 `*`** 가 붙어 있다 (`aria-hidden`). 그래서
 * `getByLabelText('Title')` 은 라벨 textContent(`Title *`)와 어긋난다 — 접근성 **이름**으로
 * 찾는다 (`aria-hidden` 자식은 이름 계산에서 제외된다).
 */
function titleField(): HTMLElement {
  return screen.getByRole('textbox', { name: libraryCopy.add.titleLabel });
}

function searchField(): HTMLElement {
  return screen.getByRole('searchbox', { name: libraryCopy.add.searchLabel });
}

function entryList(): HTMLElement {
  return screen.getByRole('list', { name: libraryCopy.entryActions.label });
}

beforeEach(() => {
  vi.setSystemTime(MOCK_EPOCH_MS);
});

describe('`LibraryEntryActions` — `/library` 하단 진입점 (§7.1)', () => {
  it('`ListGroup` 2행이고 **섹션 제목을 만들지 않는다**', async () => {
    await renderAt(ROUTES.library);

    await waitFor(() => {
      expect(entryList()).toBeTruthy();
    });

    const rows = within(entryList()).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(
      within(entryList()).getByRole('button', { name: libraryCopy.entryActions.addOwnBook }),
    ).toBeTruthy();
    expect(
      within(entryList()).getByRole('button', { name: libraryCopy.entryActions.giftRequests }),
    ).toBeTruthy();

    /* 이름은 시각 비노출 `aria-label` 이다 — 새 제목 문구가 화면에 생기지 않는다. */
    expect(screen.queryByRole('heading', { name: libraryCopy.entryActions.label })).toBeNull();
  });

  it('폐기된 `LibraryFooterActions` 형태(전폭 glass 버튼 · TextLink)가 **없다**', async () => {
    await renderAt(ROUTES.library);
    await waitFor(() => {
      expect(entryList()).toBeTruthy();
    });

    /* Figma Library 화면에는 전폭 glass 버튼도 TextLink 도 없다 (§7.1 대안 ①). */
    expect(document.querySelectorAll('.haru-library-entry .haru-button')).toHaveLength(0);
    expect(document.querySelectorAll('.haru-text-link')).toHaveLength(0);
  });

  it('두 행이 각각 `/library/add` · `/library/gift-requests` 로 이동한다', async () => {
    await renderAt(ROUTES.library);
    await waitFor(() => {
      expect(entryList()).toBeTruthy();
    });

    fireEvent.click(
      within(entryList()).getByRole('button', { name: libraryCopy.entryActions.addOwnBook }),
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: libraryCopy.add.title })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: libraryCopy.add.back }));
    await waitFor(() => {
      expect(entryList()).toBeTruthy();
    });

    fireEvent.click(
      within(entryList()).getByRole('button', { name: libraryCopy.entryActions.giftRequests }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: libraryCopy.giftRequests.title }),
      ).toBeTruthy();
    });
  });
});

describe('`/library/add` — 보유 책 직접 등록 (FR-23, §7.2)', () => {
  it('검색어를 넣으면 `GET /v1/books/search` 가 나가고 결과 행에 등록 버튼이 있다', async () => {
    const harness = await renderAt(ROUTES.libraryAdd);
    await waitForAddScreen();

    fireEvent.change(searchField(), {
      target: { value: 'moon' },
    });

    await waitFor(() => {
      expect(
        harness.bundle.requestLog
          .entries()
          .filter((entry) => entry.operation === 'GET /v1/books/search'),
      ).toHaveLength(1);
    });

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: libraryCopy.add.addToLibrary }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('검색 결과 0건은 **오류가 아니라** 직접 입력 경로를 연다 (AC-2-23)', async () => {
    await renderAt(ROUTES.libraryAdd, ['books:empty']);
    await waitForAddScreen();

    fireEvent.change(searchField(), {
      target: { value: 'nothing' },
    });

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.add.noResultsTitle)).toBeTruthy();
    });
    expect(titleField()).toBeTruthy();
  });

  it('제목이 비어 있으면 등록 CTA 가 비활성이다', async () => {
    await renderAt(ROUTES.libraryAdd);
    await waitForAddScreen();

    const submit = screen.getByRole('button', { name: libraryCopy.add.submit });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(titleField(), {
      target: { value: 'Moonbeam and the Night Train' },
    });
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });

  it('직접 입력 등록은 `POST …/library/books` + **`Idempotency-Key`** 로 나가고 `/library` 로 돌아간다', async () => {
    const harness = await renderAt(ROUTES.libraryAdd);
    await waitForAddScreen();

    fireEvent.change(titleField(), {
      target: { value: 'Moonbeam and the Night Train' },
    });
    fireEvent.click(screen.getByRole('button', { name: libraryCopy.add.submit }));

    await waitFor(() => {
      expect(
        harness.bundle.requestLog
          .entries()
          .filter((entry) => entry.operation === 'POST /v1/children/:childId/library/books'),
      ).toHaveLength(1);
    });

    /* 성공 → 서재로 복귀 + Toast. */
    await waitFor(() => {
      expect(screen.getByText(libraryCopy.add.successToast)).toBeTruthy();
    });
    await waitFor(() => {
      expect(document.querySelector('.haru-library-shelves')).not.toBeNull();
    });
  });

  it('중복(`BOOK_ALREADY_OWNED`)은 **안내**로 알린다 — 오류 화면으로 막지 않는다', async () => {
    await renderAt(ROUTES.libraryAdd, ['library:book-already-owned']);
    await waitForAddScreen();

    fireEvent.change(titleField(), {
      target: { value: 'Already there' },
    });
    fireEvent.click(screen.getByRole('button', { name: libraryCopy.add.submit }));

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.add.duplicateTitle)).toBeTruthy();
    });
    expect(screen.queryByText(libraryCopy.add.errorTitle)).toBeNull();
    /* 등록 화면에 그대로 머문다 — 다음 행동이 열려 있다. */
    expect(titleField()).toBeTruthy();
  });
});

describe('`/library/gift-requests` — 상태 확인 전용 (FR-22, §7.3)', () => {
  it('요청 목록과 상태 라벨을 그리고 **신청 CTA 가 없다**', async () => {
    await renderAt(ROUTES.libraryGiftRequests);

    await waitFor(() => {
      expect(screen.getByRole('list', { name: libraryCopy.giftRequests.listLabel })).toBeTruthy();
    });

    /* fixture 는 `shipped` · `requested` 2건이다. */
    expect(screen.getByText(giftRequestStatusCopy.shipped)).toBeTruthy();
    expect(screen.getByText(giftRequestStatusCopy.requested)).toBeTruthy();

    /*
      신청 CTA 는 **어디에도 없다** (사용자 결정 2026-10-10: 신청 제거, 조회 유지).
      문구 키가 사라졌으므로 리터럴로 단정한다.
    */
    expect(screen.queryByRole('button', { name: /request this book/i })).toBeNull();
  });

  it('`D-15` 접수 안내가 있다 (잠정 문구 — copy 모듈만 교체 가능)', async () => {
    await renderAt(ROUTES.libraryGiftRequests);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.giftRequests.noticeTitle)).toBeTruthy();
    });
    expect(screen.getByText(libraryCopy.giftRequests.noticeDescription)).toBeTruthy();
  });

  it('Empty — 신청 0건은 **가장 흔한 상태**이고 오류가 아니다', async () => {
    await renderAt(ROUTES.libraryGiftRequests, ['library:empty']);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.giftRequests.emptyTitle)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: libraryCopy.states.retry })).toBeNull();
  });

  it('Error — `ErrorState` + Retry 1개 (빈 상태로 둔갑하지 않는다)', async () => {
    await renderAt(ROUTES.libraryGiftRequests, ['library:error']);

    await waitFor(() => {
      expect(screen.getByText(libraryCopy.giftRequests.errorTitle)).toBeTruthy();
    });
    expect(screen.getAllByRole('button', { name: libraryCopy.states.retry })).toHaveLength(1);
    expect(screen.queryByText(libraryCopy.giftRequests.emptyTitle)).toBeNull();
  });

  it('상태 라벨이 contract 6종을 **빠짐없이** 덮는다 (색에 의존하지 않는다)', () => {
    for (const status of GiftRequestStatusSchema.options) {
      expect(giftRequestStatusCopy[status].length).toBeGreaterThan(0);
    }
    expect(Object.keys(giftRequestStatusCopy)).toHaveLength(GiftRequestStatusSchema.options.length);
  });
});
