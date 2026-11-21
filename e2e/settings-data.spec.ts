/**
 * Stage 8 `S8-B` — 설정 확장 (`C13-S8-1`) · 데이터 관리 `/settings/data` (`C13-S8-2`) · 세션 녹음 목록
 * `/settings/data/recordings` (`C13-S8-3`) · 세션 녹음 삭제 (§2.4-①). Figma 없음 — design-agent 명세
 * Spec §2.1~§2.4 · §2.9 · §6.2 · §9.1 · §10 (AC-8-13~25 · AC-8-94 화면 부분).
 *
 * `S8-C` — 전체 데이터 삭제 요청 (§2.4-② · §2.5 · §2.9 쓰기 차단, AC-8-26~32 화면 부분).
 *
 * 로그인 후 앱 안 이동으로 연다 (새로고침은 Mock 인증을 지운다). scenario 는 첫 진입 URL 에 붙인다.
 * `R-BASELINE-1`: dev 패널은 가린다 · settle 후 촬영 · 임계값은 `playwright.config.ts` 상수.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { REGION_SNAPSHOT } from '../playwright.config';
import { hideDevPanel, settle } from './support/gallery';
import {
  firstStartSession,
  logInToHome,
  requestOperations,
  requestPayloads,
} from './support/session';

const DELETE_OP = 'DELETE /v1/sessions/:sessionId/recording';
const LIST_OP = 'GET /v1/children/:childId/sessions?hasRecording=true';
const UPLOAD_INIT_OP = 'POST /v1/sessions/:sessionId/recordings';
const CREATE_OP = 'POST /v1/data-deletion-requests';
const POLL_OP = 'GET /v1/data-deletion-requests/:id';
/** 폴링 5s × 2 (received → processing → completed) + 여유. */
const POLL_TO_FINAL_MS = 20_000;
const RETENTION =
  'Storytime recordings are kept for 90 days, then removed automatically. Conversation notes and growth signals stay so your reports keep working.';
const SCOPE =
  'Deleting a recording removes the audio and its highlight clip. Your conversation notes stay.';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function openSettings(page: Page, scenario?: string): Promise<void> {
  await logInToHome(page, scenario);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('list', { name: 'Your child' })).toBeVisible();
}

async function openData(page: Page, scenario?: string): Promise<void> {
  await openSettings(page, scenario);
  await page.getByRole('button', { name: 'Data & privacy' }).click();
  await expect(page).toHaveURL(/\/settings\/data$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Data & privacy' })).toBeVisible();
}

const recordingList = (page: Page) => page.getByRole('list', { name: 'Session recordings' });

async function openRecordings(page: Page, scenario?: string): Promise<void> {
  await openData(page, scenario);
  await page.getByRole('button', { name: /Session recordings/ }).click();
  await expect(page).toHaveURL(/\/settings\/data\/recordings$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Session recordings' })).toBeVisible();
}

async function readyRecordings(page: Page, scenario?: string): Promise<Locator> {
  await openRecordings(page, scenario);
  const list = recordingList(page);
  await expect(list).toBeVisible();
  await settle(page);
  return list;
}

/** 상태 meta 문구로 행을 찾는다 (제목은 fixture 책끼리 겹칠 수 있다). */
const rowWithMeta = (list: Locator, meta: string) =>
  list.getByRole('listitem').filter({
    has: list.page().locator('.haru-list-row__meta', { hasText: new RegExp(`^${meta}$`) }),
  });

/** 가짜 시계 아래에서의 settle — rAF 도 가짜이므로 시계를 조금 흘린다 (Mock 지연 1.5s 는 넘지 않는다). */
async function settleFakeClock(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.clock.runFor(100);
}

/** 상태 meta 가 `meta` 인 첫 행의 위치 — 삭제 뒤 meta 가 바뀌어도 같은 행을 가리키도록 index 로 고정한다. */
async function rowIndexWithMeta(list: Locator, meta: string): Promise<number> {
  const metas = await list
    .locator('.haru-list-row')
    .evaluateAll((rows) =>
      rows.map((row) => row.querySelector('.haru-list-row__meta')?.textContent ?? ''),
    );
  const index = metas.indexOf(meta);
  if (index < 0) throw new Error(`no row with meta ${meta}`);
  return index;
}

/** 행 날짜 라벨 — *Delete* 접근성 이름 `Delete recording, {title}, {date}` 의 끝(`Mon D` | `Mon D, YYYY`) (`VG8-B-07`). */
function rowDateOf(accessibleName: string): string {
  const match = /([A-Z][a-z]{2} \d{1,2}(?:, \d{4})?)$/.exec(accessibleName);
  expect(match).not.toBeNull();
  return match?.[1] ?? '';
}

const count = async (page: Page, op: string) =>
  (await requestOperations(page)).filter((entry) => entry === op).length;

test.describe('설정 목록 ACCOUNT (AC-8-13 · 14)', () => {
  test('Data & privacy · Account · Log out 순서 · 이동 행 → route · Back → /settings', async ({
    page,
  }) => {
    await openSettings(page);
    const account = page.getByRole('list', { name: 'Account' });
    await expect(account.getByRole('button')).toHaveText(['Data & privacy', 'Account', 'Log out']);

    await account.getByRole('button', { name: 'Account', exact: true }).click();
    await expect(page).toHaveURL(/\/settings\/account$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Account' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    await account.getByRole('button', { name: 'Data & privacy' }).click();
    await expect(page).toHaveURL(/\/settings\/data$/);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    // 로그아웃 동작 회귀 0 (Dialog 까지)
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });
});

test.describe('데이터 관리 (AC-8-15 · 16 · 17 · 18)', () => {
  test('보관 문장 = 응답 값 · 녹음 행 = 삭제 가능 6 · 전체 삭제 = 동작 행(chevron 0)', async ({
    page,
  }) => {
    await openData(page);
    await expect(page.getByText(RETENTION)).toBeVisible();
    await expect(page.getByRole('list', { name: 'Recordings' }).getByRole('button')).toContainText(
      '6 recordings',
    );
    const row = page.getByRole('list', { name: 'Delete data' }).getByRole('listitem');
    await expect(row).toHaveText('Delete all data');
    await expect(row.locator('svg')).toHaveCount(0);
  });

  test('`retry` → ErrorState → Try again → 본문', async ({ page }) => {
    await openSettings(page, 'data-management:retry');
    await page.getByRole('button', { name: 'Data & privacy' }).click();
    await expect(page.getByRole('alert')).toContainText('Something went wrong');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText(RETENTION)).toBeVisible();
  });

  test('`offline` → 오프라인 ErrorState', async ({ page }) => {
    await openSettings(page, 'data-management:offline');
    await page.getByRole('button', { name: 'Data & privacy' }).click();
    await expect(page.getByRole('alert')).toContainText('You are offline');
  });

  test('진행 중 삭제 요청 → 상단 info 알림 · 진행률 0 · Delete all data 비활성', async ({
    page,
  }) => {
    await openData(page, 'data-management:deletion-processing');
    await expect(
      page.getByRole('status').filter({ hasText: "We're deleting your data" }),
    ).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(
      page.getByRole('list', { name: 'Delete data' }).locator('.haru-list-row--disabled'),
    ).toHaveCount(1);
  });
});

test.describe('세션 녹음 목록 (AC-8-19 · 20 · 25 · 94)', () => {
  test('5행 → Show more → 8행 · 상태 5종 meta · Delete 는 삭제 가능 행만 · Storytime · 40자 제목 줄바꿈', async ({
    page,
  }) => {
    const list = await readyRecordings(page);
    await expect(page.getByText(SCOPE)).toBeVisible();
    await expect(list.getByRole('listitem')).toHaveCount(5);
    const firstPageCalls = await count(page, LIST_OP);
    await page.getByRole('button', { name: 'Show more' }).click();
    await expect(list.getByRole('listitem')).toHaveCount(8);
    await expect(page.getByRole('button', { name: 'Show more' })).toHaveCount(0);
    // 다음 페이지 요청 1건 (cursor)
    expect(await count(page, LIST_OP)).toBe(firstPageCalls + 1);
    const cursors = (await requestPayloads(page, LIST_OP)).map(
      (payload) => (payload as { cursor?: string }).cursor,
    );
    expect(cursors.filter((cursor) => cursor !== undefined)).toHaveLength(1);

    for (const meta of [
      'Saved',
      'Uploading',
      'Not uploaded yet',
      'Removed after 90 days',
      'Deleted',
    ]) {
      await expect(rowWithMeta(list, meta).first()).toBeVisible();
    }
    await expect(rowWithMeta(list, 'Deleted').getByRole('button')).toHaveCount(0);
    await expect(rowWithMeta(list, 'Removed after 90 days').getByRole('button')).toHaveCount(0);
    await expect(list.getByRole('button', { name: /^Delete recording, / })).toHaveCount(6);
    await expect(list.getByText('Storytime', { exact: true })).toBeVisible();
    await expect(list.locator('.haru-tag, img')).toHaveCount(0);

    // 40자 제목 — 말줄임 0 (줄바꿈)
    const longTitle = list.getByText('The Little Owl Who Counted All the Stars', { exact: true });
    expect(
      await longTitle.evaluate(
        (node) => getComputedStyle(node.closest('.haru-list-row__title') ?? node).textOverflow,
      ),
    ).not.toBe('ellipsis');
  });

  test('`empty` → EmptyState · 범위 문장 0', async ({ page }) => {
    await openRecordings(page, 'data-management:empty');
    await expect(
      page.getByRole('heading', { level: 2, name: 'No recordings to manage' }),
    ).toBeVisible();
    await expect(page.getByText(SCOPE)).toHaveCount(0);
  });

  test('`error` → ErrorState', async ({ page }) => {
    // 목록만 실패 (메서드 단위 scenario) — 요약은 성공한다
    await openRecordings(page, 'data-management.listrecordingsessions:error');
    await expect(page.getByRole('alert')).toContainText('Something went wrong');
  });
});

/**
 * `metaWrap` (`D8-2` ② · `VG8-B-08`, Spec §8.1) — 안 들어가면 **meta 가 통째로 다음 줄 시작**으로. subtitle(날짜 · 길이)은
 * 단어마다 끊기지 않는다(한 줄). 경계값 행은 글리프 폭에 따라 뒤집힐 수 있으므로 **분절 0** 을 모든 행에서 보고, 줄 나눔은
 * 계산 여유가 큰 행(320 *Not uploaded yet* — 221/150)과 한 줄 행(393 *Saved* — 159/223)만 단정한다.
 */
for (const width of [320, 393] as const) {
  test(`metaWrap ${String(width)} — subtitle 한 줄(분절 0) · 줄이 나뉘면 meta 는 subtitle 아래 시작 정렬`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1400 });
    const list = await readyRecordings(page);
    await page.getByRole('button', { name: 'Show more' }).click();
    await expect(list.getByRole('listitem')).toHaveCount(8);
    const rows = await list.locator('.haru-list-row__meta-row').evaluateAll((nodes) =>
      nodes.map((node) => {
        const subtitle = node.querySelector('.haru-list-row__subtitle') as HTMLElement;
        const meta = node.querySelector('.haru-list-row__meta') as HTMLElement;
        const s = subtitle.getBoundingClientRect();
        const m = meta.getBoundingClientRect();
        return {
          meta: meta.textContent,
          wrapClass: node.classList.contains('haru-list-row__meta-row--wrap'),
          subtitleLines: Math.round(s.height / parseFloat(getComputedStyle(subtitle).lineHeight)),
          metaLines: Math.round(m.height / parseFloat(getComputedStyle(meta).lineHeight)),
          wrapped: m.top >= s.bottom - 1,
          sameLeft: Math.abs(m.left - s.left) <= 1,
          metaRightAligned: Math.abs(m.right - node.getBoundingClientRect().right) <= 1,
        };
      }),
    );
    expect(rows).toHaveLength(8);
    for (const row of rows) {
      expect(row.wrapClass).toBe(true);
      expect(row.subtitleLines).toBe(1);
      expect(row.metaLines).toBe(1);
      if (row.wrapped) expect(row.sameLeft).toBe(true);
      else expect(row.metaRightAligned).toBe(true);
    }
    if (width === 320) {
      expect(rows.find((row) => row.meta === 'Not uploaded yet')?.wrapped).toBe(true);
    } else {
      expect(rows.filter((row) => row.meta === 'Saved').every((row) => !row.wrapped)).toBe(true);
    }
  });
}

test.describe('세션 녹음 삭제 (AC-8-21 · 22 · 23 · 24 · 25)', () => {
  test('Delete → Keep = 요청 0 · 포커스 = Delete', async ({ page }) => {
    const list = await readyRecordings(page);
    const trigger = rowWithMeta(list, 'Uploading').getByRole('button');
    await trigger.click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete this recording?' });
    await expect(dialog.getByRole('button', { name: 'Keep' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Keep' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await count(page, DELETE_OP)).toBe(0);
  });

  test('확인 → DELETE 1건 → 행 Deleted · Delete 0 · 위치 그대로 · 포커스 = 행 · live 1회 · 요약 6 → 5', async ({
    page,
  }) => {
    const list = await readyRecordings(page);
    const titlesBefore = await list.locator('.haru-list-row__title').allTextContents();
    const row = list.getByRole('listitem').nth(await rowIndexWithMeta(list, 'Uploading'));
    await expect(row).toContainText('Uploading');
    await row.getByRole('button').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();

    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(row).toContainText('Deleted');
    await expect(row.getByRole('button')).toHaveCount(0);
    await expect(row).toBeFocused();
    expect(await list.locator('.haru-list-row__title').allTextContents()).toEqual(titlesBefore);
    expect(await count(page, DELETE_OP)).toBe(1);
    await expect(page.locator('.haru-visually-hidden[role="status"]')).toHaveText(
      'Recording deleted.',
    );

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('list', { name: 'Recordings' }).getByRole('button')).toContainText(
      '5 recordings',
    );
  });

  test('처리 중에는 Esc 로 닫히지 않는다 · 연타 = 요청 1건', async ({ page }) => {
    const list = await readyRecordings(page, 'data-management.deletesessionrecording:loading');
    await list.getByRole('listitem').first().getByRole('button').click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Delete recording' }).click();
    // 처리 중 연타 — 이중 요청 0 (AC-8-22)
    await dialog.getByRole('button', { name: 'Delete recording' }).click({ force: true });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCount(0, { timeout: 10_000 });
    await expect(list.getByRole('listitem').first()).toContainText('Deleted');
    expect(await count(page, DELETE_OP)).toBe(1);
  });

  test('실패 → 목록 위 alert(행 이름) · 행 변화 0 · 포커스 = Delete', async ({ page }) => {
    const list = await readyRecordings(page, 'data-management.deletesessionrecording:error');
    const row = list.getByRole('listitem').nth(await rowIndexWithMeta(list, 'Uploading'));
    const trigger = row.getByRole('button');
    await trigger.click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
    // 설명 = 행 제목 + 행 날짜 (`VG8-B-07`) — 날짜는 그 행 *Delete* 접근성 이름에서 읽는다
    const date = rowDateOf((await trigger.getAttribute('aria-label')) ?? '');
    await expect(page.getByRole('alert')).toContainText(
      `from ${date} wasn't deleted. You can try again.`,
    );
    await expect(page.getByRole('alert')).toContainText('Your recording of ');
    await expect(row).toContainText('Uploading');
    await expect(trigger).toBeFocused();
  });

  test('기기 오프라인 → 요청 0 · 오프라인 안내 · 행 변화 0', async ({ page, context }) => {
    const list = await readyRecordings(page);
    const row = list.getByRole('listitem').nth(await rowIndexWithMeta(list, 'Uploading'));
    await context.setOffline(true);
    const trigger = row.getByRole('button');
    const date = rowDateOf((await trigger.getAttribute('aria-label')) ?? '');
    await trigger.click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
    const notSent = page.getByText(/^Nothing was sent\. Your recording of .+ wasn't deleted\.$/);
    await expect(notSent).toBeVisible();
    await expect(notSent).toContainText(`from ${date} wasn't deleted.`);
    expect(await count(page, DELETE_OP)).toBe(0);
    await expect(row).toContainText('Uploading');
    await context.setOffline(false);
  });

  test('`recording-deleted` → 오류 아님 · 행 Deleted', async ({ page }) => {
    const list = await readyRecordings(page, 'data-management:recording-deleted');
    const row = list.getByRole('listitem').first();
    await row.getByRole('button').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
    await expect(row).toContainText('Deleted');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  /**
   * AC-8-23 — 로컬 미업로드 청크 + 큐 항목(1시간 뒤 재시도)이 있는 세션. 큐는 `online` 전환 시 강제 처리하므로,
   * 연결을 껐다 켜서 **업로드 시도(`POST …/recordings`)가 나는지**로 큐 항목의 존재를 관측한다.
   * 대조군(삭제 안 함) = 시도 있음 · 삭제 후 = 시도 0. 저장소 계수 자체는 단위 테스트(`sessionRecorderEnvironment`).
   */
  test('로컬 미업로드 세션: 대조군 = online 전환 시 업로드 시도', async ({ page, context }) => {
    await readyRecordings(page, 'data-management:recording-delete-local-pending');
    expect(await count(page, UPLOAD_INIT_OP)).toBe(0);
    await context.setOffline(true);
    await context.setOffline(false);
    await expect.poll(() => count(page, UPLOAD_INIT_OP)).toBeGreaterThan(0);
  });

  test('로컬 미업로드 세션: 서버 삭제 확정 → 큐 취소 · 로컬 삭제 → online 전환에도 업로드 시도 0', async ({
    page,
    context,
  }) => {
    const list = await readyRecordings(page, 'data-management:recording-delete-local-pending');
    const row = list.getByRole('listitem').nth(await rowIndexWithMeta(list, 'Uploading'));
    await row.getByRole('button').click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
    await expect(row).toContainText('Deleted');
    expect(await requestPayloads(page, DELETE_OP)).toHaveLength(1);

    await context.setOffline(true);
    await context.setOffline(false);
    // 대조군과 같은 시간만큼 기다린 뒤에도 0
    await page.waitForTimeout(1_000);
    expect(await count(page, UPLOAD_INIT_OP)).toBe(0);
  });
});

test.describe('전체 데이터 삭제 요청 (AC-8-26 · 27 · 28 · 29 · 30 · 31)', () => {
  const deleteDataList = (page: Page) => page.getByRole('list', { name: 'Delete data' });
  const deleteRow = (page: Page) =>
    deleteDataList(page).getByRole('button', { name: 'Delete all data' });
  const progress = (page: Page) =>
    page.getByRole('status').filter({ hasText: "We're deleting your data" });

  async function confirmDeleteAll(page: Page): Promise<void> {
    await deleteRow(page).click();
    const dialog = page.getByRole('alertdialog', { name: "Delete all of Emma's data?" });
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Delete all data' }).click();
  }

  test('Cancel → 요청 0 · 포커스 = 행', async ({ page }) => {
    await openData(page);
    await deleteRow(page).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText(
      "Profile, recordings, notes, and reports will be deleted. Your account stays. This can't be undone.",
    );
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(deleteRow(page)).toBeFocused();
    expect(await count(page, CREATE_OP)).toBe(0);
  });

  test('확인 → POST 1건(scope · confirmation 만) → info 알림 · 포커스 = 알림 · 행 비활성 → 폴링 완료 → 로컬 정리 → 온보딩 + Toast', async ({
    page,
  }) => {
    await openData(page);
    // 이 기기에 남은 아동 데이터 — 카드 캐시는 홈에서 이미 쓰였다. draft 는 넣어 둔다.
    await page.evaluate(() => {
      localStorage.setItem('haru.onboarding.draft.v1', '{"schemaVersion":1}');
    });
    expect(await page.evaluate(() => localStorage.getItem('haru.activity-card.v1'))).not.toBeNull();

    await confirmDeleteAll(page);
    await expect(progress(page)).toBeVisible();
    expect(await requestPayloads(page, CREATE_OP)).toStrictEqual([
      { scope: 'all_data', confirmation: true },
    ]);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(deleteDataList(page).locator('.haru-list-row--disabled')).toHaveCount(1);
    const focusedInAlert = await page.evaluate(
      () => document.activeElement?.querySelector('.haru-alert--info') !== null,
    );
    expect(focusedInAlert).toBe(true);

    await expect(page).toHaveURL(/\/onboarding\/start$/, { timeout: POLL_TO_FINAL_MS });
    await expect(page.getByText('Your data was deleted.')).toBeVisible();
    expect(await count(page, CREATE_OP)).toBe(1);
    expect(await count(page, POLL_OP)).toBe(3);
    const stored = await page.evaluate(() => ({
      draft: localStorage.getItem('haru.onboarding.draft.v1'),
      card: localStorage.getItem('haru.activity-card.v1'),
    }));
    expect(stored).toStrictEqual({ draft: null, card: null });
    // 폴링 종료 — 더 늘지 않는다
    await page.waitForTimeout(6_000);
    expect(await count(page, POLL_OP)).toBe(3);
  });

  test('`deletion-retry` (RETRY) — 실패 → error 알림 + Try again → Dialog ② → 새 요청 → 완료 → 온보딩', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await openData(page, 'data-management:deletion-retry');
    await confirmDeleteAll(page);
    const failed = page
      .getByRole('alert')
      .filter({ hasText: "We couldn't finish deleting your data" });
    await expect(failed).toBeVisible({ timeout: POLL_TO_FINAL_MS });
    await expect(failed).toContainText('Nothing else changed. You can ask again.');
    await expect(progress(page)).toHaveCount(0);
    await expect(deleteDataList(page).locator('.haru-list-row--disabled')).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings\/data$/);

    await failed.getByRole('button', { name: 'Try again' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete all data' }).click();
    await expect(progress(page)).toBeVisible();
    await expect(failed).toHaveCount(0);
    expect(await count(page, CREATE_OP)).toBe(2);
    await expect(page).toHaveURL(/\/onboarding\/start$/, { timeout: POLL_TO_FINAL_MS });
  });

  test('`deletion-already-requested` — 진행 중 info · 오류 표면 0 · 행 비활성 · 폴링해도 그대로', async ({
    page,
  }) => {
    await openData(page, 'data-management:deletion-already-requested');
    await expect(progress(page)).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(deleteDataList(page).locator('.haru-list-row--disabled')).toHaveCount(1);
    await page.waitForTimeout(6_000);
    await expect(progress(page)).toBeVisible();
    await expect(page).toHaveURL(/\/settings\/data$/);
    expect(await count(page, CREATE_OP)).toBe(0);
  });

  test('기기 오프라인 → 요청 0 · offline 알림(Nothing was sent.) · 연결 복구 후에도 재전송 0', async ({
    page,
    context,
  }) => {
    await openData(page);
    await context.setOffline(true);
    await confirmDeleteAll(page);
    const alert = page.locator('.haru-alert--offline');
    await expect(alert).toContainText('You are offline');
    await expect(alert).toContainText('Nothing was sent.');
    expect(await count(page, CREATE_OP)).toBe(0);
    await context.setOffline(false);
    await page.waitForTimeout(1_000);
    expect(await count(page, CREATE_OP)).toBe(0);
    await expect(deleteDataList(page).locator('.haru-list-row--disabled')).toHaveCount(0);
  });
});

test.describe('삭제 진행 중 쓰기 차단 (AC-8-32 — 기존 실패 표면 + 문구만)', () => {
  const BLOCKED = 'account:deletion-pending-write-blocked';

  test('아이 정보 저장 → 저장 실패 표면에 *Changes are paused*', async ({ page }) => {
    await openSettings(page, BLOCKED);
    await page.getByRole('button', { name: 'Child info' }).click();
    await expect(page).toHaveURL(/\/settings\/child$/);
    await page.getByRole('textbox', { name: /First name/ }).fill('Mia');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Changes are paused' });
    await expect(alert).toContainText('Your data is being deleted, so changes are paused.');
    await expect(page.getByText("We couldn't save the changes right now")).toHaveCount(0);
  });

  test('홈 세션 시작 → 시트의 기존 실패 표면에 *Changes are paused*', async ({ page }) => {
    await logInToHome(page, BLOCKED);
    await firstStartSession(page).click();
    const sheet = page.getByRole('dialog', { name: 'When will you read?' });
    await sheet.getByText('Bedtime', { exact: true }).click();
    await sheet.getByRole('button', { name: 'Continue' }).click();
    await expect(sheet).toContainText('Changes are paused');
    await expect(sheet).toContainText('Your data is being deleted, so changes are paused.');
  });
});

/**
 * 신규 baseline — 393 · 320 · `main` 영역 클립 (Visual Gap 자료, Spec §13 `S8-B`).
 */
for (const width of [393, 320] as const) {
  test.describe(`baseline — ${String(width)} (\`R-BASELINE-1\`)`, () => {
    test.use({ viewport: { width, height: 1400 } });
    const name = (id: string) => `s8-${id}-${String(width)}.png`;

    test('settings', async ({ page }) => {
      await openSettings(page);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(name('settings'), REGION_SNAPSHOT);
    });

    test('data', async ({ page }) => {
      await openData(page);
      await expect(page.getByText(RETENTION)).toBeVisible();
      // `S8-C` 부터 *Delete all data* 행이 눌리는 행이다 — 진입 클릭 위치에 남은 포인터가 hover 를 찍지 않게 한다 (`R-BASELINE-1`)
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(name('data'), REGION_SNAPSHOT);
    });

    test('data-deletion-processing', async ({ page }) => {
      await openData(page, 'data-management:deletion-processing');
      await expect(page.getByText("We're deleting your data")).toBeVisible();
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('data-deletion-processing'),
        REGION_SNAPSHOT,
      );
    });

    test('data-deletion-dialog', async ({ page }) => {
      await openData(page);
      await page
        .getByRole('list', { name: 'Delete data' })
        .getByRole('button', { name: 'Delete all data' })
        .click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await settle(page);
      await expect(dialog).toHaveScreenshot(name('data-deletion-dialog'), REGION_SNAPSHOT);
    });

    test('data-deletion-failed', async ({ page }) => {
      await openData(page, 'data-management:deletion-failed');
      await page
        .getByRole('list', { name: 'Delete data' })
        .getByRole('button', { name: 'Delete all data' })
        .click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete all data' }).click();
      await expect(page.getByText("We couldn't finish deleting your data")).toBeVisible({
        timeout: POLL_TO_FINAL_MS,
      });
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await page.locator('body').evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('data-deletion-failed'),
        REGION_SNAPSHOT,
      );
    });

    test('data-deletion-offline', async ({ page, context }) => {
      await openData(page);
      await context.setOffline(true);
      await page
        .getByRole('list', { name: 'Delete data' })
        .getByRole('button', { name: 'Delete all data' })
        .click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete all data' }).click();
      await expect(page.getByText('Nothing was sent.')).toBeVisible();
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await page.locator('body').evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('data-deletion-offline'),
        REGION_SNAPSHOT,
      );
    });

    test('data-error', async ({ page }) => {
      await openSettings(page, 'data-management:error');
      await page.getByRole('button', { name: 'Data & privacy' }).click();
      await expect(page.getByRole('alert')).toBeVisible();
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(name('data-error'), REGION_SNAPSHOT);
    });

    test('data-loading', async ({ page }) => {
      await openSettings(page, 'data-management:loading');
      await page.clock.install();
      await page.getByRole('button', { name: 'Data & privacy' }).click();
      await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
      await settleFakeClock(page);
      await expect(page.locator('main')).toHaveScreenshot(name('data-loading'), REGION_SNAPSHOT);
    });

    test('recordings-all', async ({ page }) => {
      const list = await readyRecordings(page);
      await page.getByRole('button', { name: 'Show more' }).click();
      await expect(list.getByRole('listitem')).toHaveCount(8);
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(name('recordings-all'), REGION_SNAPSHOT);
    });

    test('recordings-deleted-row', async ({ page }) => {
      const list = await readyRecordings(page);
      const row = list.getByRole('listitem').nth(await rowIndexWithMeta(list, 'Uploading'));
      await row.getByRole('button').click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
      await expect(row).toContainText('Deleted');
      await page.locator('body').evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('recordings-deleted-row'),
        REGION_SNAPSHOT,
      );
    });

    test('recordings-delete-failed', async ({ page }) => {
      const list = await readyRecordings(page, 'data-management.deletesessionrecording:error');
      await list
        .getByRole('listitem')
        .nth(await rowIndexWithMeta(list, 'Uploading'))
        .getByRole('button')
        .click();
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      await page.locator('body').evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await page.mouse.move(0, 0);
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('recordings-delete-failed'),
        REGION_SNAPSHOT,
      );
    });

    test('recordings-dialog', async ({ page }) => {
      const list = await readyRecordings(page);
      await list.getByRole('listitem').first().getByRole('button').click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog.getByRole('button', { name: 'Keep' })).toBeFocused();
      await settle(page);
      await expect(dialog).toHaveScreenshot(name('recordings-dialog'), REGION_SNAPSHOT);
    });

    test('recordings-empty', async ({ page }) => {
      await openRecordings(page, 'data-management:empty');
      await expect(
        page.getByRole('heading', { level: 2, name: 'No recordings to manage' }),
      ).toBeVisible();
      await settle(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('recordings-empty'),
        REGION_SNAPSHOT,
      );
    });

    test('recordings-loading', async ({ page }) => {
      await openData(page, 'data-management.listrecordingsessions:loading');
      await page.clock.install();
      await page.getByRole('button', { name: /Session recordings/ }).click();
      await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
      await settleFakeClock(page);
      await expect(page.locator('main')).toHaveScreenshot(
        name('recordings-loading'),
        REGION_SNAPSHOT,
      );
    });
  });
}
