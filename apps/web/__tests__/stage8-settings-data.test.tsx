/**
 * Stage 8 `S8-B` — 설정 확장 · 데이터 관리 · 세션 녹음 목록 (Spec §2.1~§2.4-① · §2.9 · §6.2 · §9.1 · §10.1~10.3,
 * AC-8-13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 22 · 23 · 24 · 25 · 94 화면 부분).
 *
 * 실제 앱과 같은 조립(`createHarness` + `AppRoutes`)으로 연다. 기대값은 같은 Mock 번들 · fixture 상수에서 읽는다.
 * 로컬 녹음 삭제 순서(서버 확정 후 — AC-8-23)는 조립의 `deleteLocalRecording` 을 감시해 요청 로그와 비교한다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { dataManagementCopy } from '../src/features/data-management';
import {
  recordedMinutes,
  recordingDeletionCopy as copy,
  RecordingList,
  statusMeta,
} from '../src/features/recording-deletion';
import { settingsCopy } from '../src/features/settings/copy';
import {
  MOCK_RAW_AUDIO_DAYS,
  MOCK_RECORDING_SESSION_IDS,
} from '../src/mocks/fixtures/data-management';
import { MOCK_LONG_BOOK_TITLE } from '../src/mocks/fixtures/data-management';
import { appCopy } from '../src/shared/copy/app-copy';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

const DELETE_OP = 'DELETE /v1/sessions/:sessionId/recording';
const LIST_OP = 'GET /v1/children/:childId/sessions?hasRecording=true';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent;

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
}

async function signIn(harness: Harness): Promise<void> {
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
}

async function renderAt(
  entries: readonly string[],
  scenarios: readonly string[] = [],
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [...entries] });
  await signIn(harness);
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  return harness;
}

const ops = (harness: Harness, operation: string) =>
  harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation);

async function recordingList(): Promise<HTMLElement> {
  return screen.findByRole('list', { name: copy.listLabel });
}

function rowByTitle(list: HTMLElement, title: string): HTMLElement {
  const row = within(list)
    .getAllByRole('listitem')
    .find((item) => item.querySelector('.haru-list-row__title')?.textContent === title);
  if (row === undefined) throw new Error(`row not found: ${title}`);
  return row;
}

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

describe('설정 목록 ACCOUNT 확장 (AC-8-13 · 14)', () => {
  it('Data & privacy → `/settings/data` · Account → `/settings/account` (TopBar "Account")', async () => {
    await renderAt([ROUTES.settings]);
    fireEvent.click(
      await screen.findByRole('button', { name: settingsCopy.accountRows.dataPrivacy }),
    );
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsData));
    expect(
      await screen.findByRole('heading', { level: 1, name: dataManagementCopy.title }),
    ).toBeTruthy();
  });

  it('Account 행 → `/settings/account` (S8-B 는 route 만 — TopBar h1 "Account")', async () => {
    await renderAt([ROUTES.settings]);
    fireEvent.click(await screen.findByRole('button', { name: settingsCopy.accountRows.account }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsAccount));
    expect(screen.getByRole('heading', { level: 1, name: 'Account' })).toBeTruthy();
  });
});

describe('데이터 관리 `/settings/data` (AC-8-15 · 16 · 17 · 18)', () => {
  it('보관 문장 = 응답 `rawAudioDays` · 녹음 행 subtitle = 삭제 가능 녹음 수 6 (`VG8-A-04`) · 전체 삭제 = 동작 행', async () => {
    await renderAt([ROUTES.settingsData]);
    expect(
      await screen.findByText(dataManagementCopy.recordings.retention(MOCK_RAW_AUDIO_DAYS)),
    ).toBeTruthy();
    const recordings = screen.getByRole('list', { name: dataManagementCopy.recordings.listLabel });
    expect(within(recordings).getByRole('button').textContent).toContain('6 recordings');

    const deleteData = screen.getByRole('list', { name: dataManagementCopy.deleteData.listLabel });
    const row = within(deleteData).getByRole('listitem');
    expect(row.textContent).toBe(dataManagementCopy.deleteData.rowLabel);
    expect(row.querySelector('svg')).toBeNull(); // chevron 0 (동작 행)
    expect(row.classList.contains('haru-list-row--disabled')).toBe(false);
    // 아이 이름 = first name (Me fixture) — 안내 문장
    expect(screen.getByText(/profile, recordings, notes, and reports from HARU/)).toBeTruthy();
  });

  it('copy 는 보관 일수를 인자로만 만든다 — 값이 바뀌면 문장이 바뀐다 (AC-8-15)', () => {
    expect(dataManagementCopy.recordings.retention(30)).toContain('kept for 30 days');
    expect(dataManagementCopy.recordings.retention(1)).toContain('kept for 1 day,');
    expect(statusMeta('expired', 45)).toBe('Removed after 45 days');
    expect(dataManagementCopy.recordings.rowSubtitle(0)).toBe('No recordings');
    expect(dataManagementCopy.recordings.rowSubtitle(1)).toBe('1 recording');
  });

  it('화면 코드 · copy 에 보관 일수 리터럴(90) 0 (AC-8-15 grep)', () => {
    const roots = ['src/features/data-management', 'src/features/recording-deletion'];
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
          if (name !== '__tests__') walk(full);
        } else if (/\.(ts|tsx|css)$/.test(name)) files.push(full);
      }
    };
    for (const root of roots) walk(join(__dirname, '..', root));
    expect(files.length).toBeGreaterThan(4);
    for (const file of files) {
      // 주석(근거 문서 번호 등)은 제외하고 코드만 본다
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      expect(code).not.toMatch(/\b90\b/);
    }
  });

  it('`empty` — subtitle *No recordings* · 행은 남는다', async () => {
    await renderAt([ROUTES.settingsData], ['data-management:empty']);
    const recordings = await screen.findByRole('list', {
      name: dataManagementCopy.recordings.listLabel,
    });
    expect(within(recordings).getByRole('button').textContent).toContain('No recordings');
  });

  it('`error` → ErrorState + Try again · `retry` → 다시 시도 성공', async () => {
    await renderAt([ROUTES.settingsData], ['data-management:retry']);
    const message = errorCopyForCode('INTERNAL_ERROR');
    expect(await screen.findByText(message.title)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: retryLabel }));
    expect(
      await screen.findByText(dataManagementCopy.recordings.retention(MOCK_RAW_AUDIO_DAYS)),
    ).toBeTruthy();
  });

  it('`offline` → 오프라인 ErrorState', async () => {
    await renderAt([ROUTES.settingsData], ['data-management:offline']);
    expect(await screen.findByText(networkErrorCopy.title)).toBeTruthy();
  });

  it('진행 중 삭제 요청 → 상단 InlineAlert info (진행률 0) · *Delete all data* 비활성 (AC-8-18)', async () => {
    await renderAt([ROUTES.settingsData], ['data-management:deletion-processing']);
    const alert = await screen.findByText(dataManagementCopy.progress.title);
    expect(alert.closest('[role="status"]')).not.toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
    const deleteData = screen.getByRole('list', { name: dataManagementCopy.deleteData.listLabel });
    expect(
      within(deleteData).getByRole('listitem').classList.contains('haru-list-row--disabled'),
    ).toBe(true);
  });

  it('녹음 행 → `/settings/data/recordings`', async () => {
    await renderAt([ROUTES.settingsData]);
    fireEvent.click(
      await screen.findByRole('button', {
        name: new RegExp(dataManagementCopy.recordings.rowTitle),
      }),
    );
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsDataRecordings));
    expect(await recordingList()).toBeTruthy();
  });
});

describe('세션 녹음 목록 `/settings/data/recordings` (AC-8-19 · 20 · 25 · 94)', () => {
  it('1페이지 5행 · 상태 = meta 문구 · Storytime 대체 제목 · *Delete* 는 삭제 가능 행만 · Show more → 8행', async () => {
    const harness = await renderAt([ROUTES.settingsDataRecordings]);
    const list = await recordingList();
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText(copy.scope)).toBeTruthy();

    expect(rowByTitle(list, copy.untitled).textContent).toContain(copy.status.uploaded);
    const metas = [...list.querySelectorAll('.haru-list-row__meta')].map(
      (node) => node.textContent,
    );
    expect(metas).toEqual(
      expect.arrayContaining([copy.status.pending, copy.status.failed, copy.status.uploaded]),
    );
    expect(within(list).getAllByRole('button', { name: /^Delete recording, / })).toHaveLength(5);
    // Tag · 썸네일 0
    expect(list.querySelector('.haru-tag, img, .haru-list-row--media')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: copy.showMore }));
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(8));
    expect(ops(harness, LIST_OP)).toHaveLength(2);
    expect(screen.queryByRole('button', { name: copy.showMore })).toBeNull();

    const expired = list.querySelectorAll('.haru-list-row')[7] as HTMLElement;
    expect(expired.textContent).toContain(copy.status.expired(MOCK_RAW_AUDIO_DAYS));
    expect(within(expired).queryByRole('button')).toBeNull();
    const deleted = list.querySelectorAll('.haru-list-row')[6] as HTMLElement;
    expect(deleted.textContent).toContain(copy.status.deleted);
    expect(within(deleted).queryByRole('button')).toBeNull();
    expect(rowByTitle(list, MOCK_LONG_BOOK_TITLE)).toBeTruthy();
    // 행 텍스트 순서 = 제목 → 날짜 · 길이 → 상태
    expect(rowByTitle(list, MOCK_LONG_BOOK_TITLE).textContent).toMatch(
      new RegExp(`^${MOCK_LONG_BOOK_TITLE}.+ · 15 min${copy.status.uploaded}${copy.deleteLabel}$`),
    );
  });

  it('`empty` → EmptyState (CTA 0) · 범위 문장 0 (AC-8-20 · `D4-40`)', async () => {
    await renderAt([ROUTES.settingsDataRecordings], ['data-management:empty']);
    expect(await screen.findByRole('heading', { level: 2, name: copy.empty.title })).toBeTruthy();
    expect(screen.getByText(copy.empty.description)).toBeTruthy();
    expect(screen.queryByText(copy.scope)).toBeNull();
    expect(
      screen.queryAllByRole('button').filter((b) => b.getAttribute('aria-label') !== 'Back'),
    ).toHaveLength(0);
  });

  it('`error` → ErrorState · `offline` → 오프라인', async () => {
    await renderAt([ROUTES.settingsDataRecordings], ['data-management:error']);
    expect(await screen.findByText(errorCopyForCode('INTERNAL_ERROR').title)).toBeTruthy();
  });

  it('진행 중 전체 삭제 → 행 *Delete* 비활성 (요청 0)', async () => {
    const harness = await renderAt(
      [ROUTES.settingsDataRecordings],
      ['data-management:deletion-processing'],
    );
    const list = await recordingList();
    for (const button of within(list).getAllByRole('button')) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
    expect(ops(harness, DELETE_OP)).toHaveLength(0);
  });

  it('분 표기 — 초가 있으면 최소 1분', () => {
    expect(recordedMinutes(0)).toBe(0);
    expect(recordedMinutes(20)).toBe(1);
    expect(recordedMinutes(15 * 60)).toBe(15);
  });
});

describe('세션 녹음 삭제 (AC-8-21 · 22 · 23 · 24 · 25)', () => {
  /** 행 날짜 라벨 — *Delete* 접근성 이름 `Delete recording, {title}, {date}` 에서 읽는다 (`VG8-B-07`). */
  function dateLabelOf(trigger: HTMLElement, title: string): string {
    const name = trigger.getAttribute('aria-label') ?? '';
    const prefix = `Delete recording, ${title}, `;
    expect(name.startsWith(prefix)).toBe(true);
    return name.slice(prefix.length);
  }

  async function openDialogFor(
    title: string,
  ): Promise<{ list: HTMLElement; trigger: HTMLElement }> {
    const list = await recordingList();
    const trigger = within(rowByTitle(list, title)).getByRole('button');
    trigger.focus();
    fireEvent.click(trigger);
    expect(await screen.findByRole('alertdialog', { name: copy.dialog.title })).toBeTruthy();
    return { list, trigger };
  }

  it('Keep → 요청 0 · 다이얼로그 닫힘 · 포커스 = 그 행 Delete (AC-8-21)', async () => {
    const harness = await renderAt([ROUTES.settingsDataRecordings]);
    const { trigger } = await openDialogFor(copy.untitled);
    expect(screen.getByText(copy.dialog.description)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: copy.dialog.cancelLabel }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(ops(harness, DELETE_OP)).toHaveLength(0);
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('확인 → DELETE 1회(IK) → **그 뒤에** 로컬 삭제 → 행 *Deleted* · Delete 0 · 위치 그대로 · live 1회 · 포커스 = 행 · 요약 수 감소 (AC-8-22 · 23 · 25)', async () => {
    const harness = await renderAt([ROUTES.settingsDataRecordings]);
    const localDeletes: { sessionId: string; requestsAtCall: number }[] = [];
    vi.spyOn(harness.sessionRecorder, 'deleteLocalRecording').mockImplementation((sessionId) => {
      localDeletes.push({ sessionId, requestsAtCall: ops(harness, DELETE_OP).length });
      return Promise.resolve();
    });

    const { list } = await openDialogFor(copy.untitled);
    const before = within(list)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('.haru-list-row__title')?.textContent);
    const confirm = screen.getByRole('button', { name: copy.dialog.confirmLabel });
    fireEvent.click(confirm);
    fireEvent.click(confirm); // 연타

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    const deleteCalls = ops(harness, DELETE_OP);
    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0]?.payload).toStrictEqual({
      sessionId: MOCK_RECORDING_SESSION_IDS.untitled,
    });
    expect(localDeletes).toStrictEqual([
      { sessionId: MOCK_RECORDING_SESSION_IDS.untitled, requestsAtCall: 1 },
    ]);

    const row = rowByTitle(list, copy.untitled);
    await waitFor(() => expect(row.textContent).toContain(copy.status.deleted));
    expect(within(row).queryByRole('button')).toBeNull();
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.querySelector('.haru-list-row__title')?.textContent),
    ).toEqual(before);
    expect(screen.getByText(copy.deletedAnnouncement).getAttribute('role')).toBe('status');
    await waitFor(() => expect(document.activeElement).toBe(row));
    expect(row.getAttribute('tabindex')).toBe('-1');

    // 요약 무효화 → 삭제 가능 녹음 수 6 → 5 (`VG8-A-04`)
    expect((await harness.bundle.clients.dataManagement.summary()).recordingsCount).toBe(5);
  });

  it('`recording-deleted` → 오류가 아니라 *Deleted* 반영 · 로컬 사본도 정리 (AC-8-24)', async () => {
    const harness = await renderAt(
      [ROUTES.settingsDataRecordings],
      ['data-management:recording-deleted'],
    );
    const local = vi
      .spyOn(harness.sessionRecorder, 'deleteLocalRecording')
      .mockResolvedValue(undefined);
    const { list } = await openDialogFor(copy.untitled);
    fireEvent.click(screen.getByRole('button', { name: copy.dialog.confirmLabel }));
    const row = rowByTitle(list, copy.untitled);
    await waitFor(() => expect(row.textContent).toContain(copy.status.deleted));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(local).toHaveBeenCalledOnce();
  });

  it('실패 → InlineAlert(행 이름) · 행 변화 0 · 로컬 보존(호출 0) · 포커스 = Delete · 다시 시도는 같은 IK', async () => {
    const harness = await renderAt(
      [ROUTES.settingsDataRecordings],
      ['data-management.deletesessionrecording:error'],
    );
    const local = vi.spyOn(harness.sessionRecorder, 'deleteLocalRecording');
    const { list, trigger } = await openDialogFor(copy.untitled);
    fireEvent.click(screen.getByRole('button', { name: copy.dialog.confirmLabel }));

    const alert = await screen.findByRole('alert');
    // 설명 = 행 제목 + 행 날짜 라벨 (`VG8-B-07`) — 날짜는 그 행 *Delete* 접근성 이름에서 읽는다
    expect(alert.textContent).toContain(
      copy.failure.notDeleted(copy.untitled, dateLabelOf(trigger, copy.untitled)),
    );
    expect(rowByTitle(list, copy.untitled).textContent).toContain(copy.status.uploaded);
    expect(local).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('button', { name: copy.dialog.confirmLabel }));
    await waitFor(() => expect(ops(harness, DELETE_OP)).toHaveLength(2));
    // 요청 로그는 IK 를 남기지 않는다 — 같은 키 재사용은 hook 단위 테스트(아래)가 본다
  });

  it('기기 오프라인 → 요청 0 · 오프라인 안내(Nothing was sent) · 로컬 보존', async () => {
    const harness = createHarness({ initialEntries: [ROUTES.settingsDataRecordings] });
    await signIn(harness);
    const local = vi.fn(() => Promise.resolve());
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <RecordingList deletion={{ deleteLocalRecording: local, isOnline: () => false }} />
      </Wrapper>,
    );
    const { trigger } = await openDialogFor(copy.untitled);
    const notSent = copy.failure.notSent(copy.untitled, dateLabelOf(trigger, copy.untitled));
    fireEvent.click(screen.getByRole('button', { name: copy.dialog.confirmLabel }));
    // offline tone = role status (InlineAlert 기존 규칙)
    const alert = (await screen.findByText(notSent)).closest('.haru-alert') as HTMLElement;
    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.textContent).toContain(networkErrorCopy.title);
    expect(alert.textContent).toContain(notSent);
    expect(ops(harness, DELETE_OP)).toHaveLength(0);
    expect(local).not.toHaveBeenCalled();
  });

  it('같은 세션 재시도 = 같은 Idempotency-Key (실패 후) · 성공 후 다른 세션은 새 키', async () => {
    const harness = createHarness({
      scenarios: ['data-management.deletesessionrecording:retry'],
      initialEntries: [ROUTES.settingsDataRecordings],
    });
    await signIn(harness);
    const keys: string[] = [];
    const original = harness.bundle.clients.dataManagement.deleteSessionRecording.bind(
      harness.bundle.clients.dataManagement,
    );
    vi.spyOn(harness.bundle.clients.dataManagement, 'deleteSessionRecording').mockImplementation(
      (request, options) => {
        keys.push(options.idempotencyKey);
        return original(request, options);
      },
    );
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <RecordingList deletion={{ deleteLocalRecording: () => Promise.resolve() }} />
      </Wrapper>,
    );
    const { trigger, list } = await openDialogFor(copy.untitled);
    fireEvent.click(screen.getByRole('button', { name: copy.dialog.confirmLabel }));
    await screen.findByRole('alert');
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('button', { name: copy.dialog.confirmLabel }));
    await waitFor(() => expect(rowByTitle(list, copy.untitled).textContent).toContain('Deleted'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  });
});
