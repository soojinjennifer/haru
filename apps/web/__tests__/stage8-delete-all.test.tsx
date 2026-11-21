/**
 * Stage 8 `S8-C` — 전체 데이터 삭제 요청 (Spec §2.4-② · §2.5 · §6.2 · §9.1 · §10.2, AC-8-26 · 27 · 28 · 29 · 30 · 31 화면 부분).
 *
 * 실제 앱과 같은 조립(`createHarness` + `AppRoutes`)으로 연다. 폴링(5s)은 가짜 시계로 흘린다 (`shouldAdvanceTime` —
 * Testing Library 의 대기도 함께 흐른다). 기대 문구는 copy 모듈 · Mock 상수에서 읽는다.
 */
import { HaruApiError, type DeletionRequest } from '@haru/contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import {
  DELETION_POLL_INTERVAL_MS,
  DELETION_POLL_MAX_READS,
  selectDeletionRefetchInterval,
} from '../src/entities/data-management';
import { dataManagementCopy as copy } from '../src/features/data-management';
import {
  resolveDeletionSurface,
  trackedDeletionRequest,
} from '../src/features/data-management/model/deletionSurface';
import { MOCK_CHILD_FIRST_NAME } from '../src/mocks/fixtures/me';
import { ACTIVITY_CARD_CACHE_STORAGE_KEY } from '../src/shared/lib/activity-card-cache';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '../src/shared/lib/onboarding-draft';
import { appCopy } from '../src/shared/copy/app-copy';
import {
  deletionPendingCopy,
  errorCopyForCode,
  networkErrorCopy,
  sessionStartBlockedCopy,
} from '../src/shared/copy/error-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

const CREATE_OP = 'POST /v1/data-deletion-requests';
const POLL_OP = 'GET /v1/data-deletion-requests/:id';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent;

async function signIn(harness: Harness): Promise<void> {
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
}

async function renderData(
  scenarios: readonly string[] = [],
  prepare?: (harness: Harness) => void,
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [ROUTES.settingsData] });
  await signIn(harness);
  prepare?.(harness);
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
  await screen.findByRole('list', { name: copy.deleteData.listLabel });
  return harness;
}

const ops = (harness: Harness, operation: string) =>
  harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation);

const deleteRow = () =>
  within(screen.getByRole('list', { name: copy.deleteData.listLabel })).getByRole('button', {
    name: copy.deleteData.rowLabel,
  });

async function openDialog(): Promise<HTMLElement> {
  const trigger = deleteRow();
  trigger.focus();
  fireEvent.click(trigger);
  return screen.findByRole('alertdialog');
}

async function confirm(): Promise<void> {
  const dialog = await openDialog();
  fireEvent.click(within(dialog).getByRole('button', { name: copy.dialog.confirmLabel }));
}

const progressAlert = () => screen.queryByText(copy.progress.title)?.closest('.haru-alert') ?? null;

async function advancePoll(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(DELETION_POLL_INTERVAL_MS);
  });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

describe('폴링 간격 · 상한 · 종료 (순수 — AC-8-27)', () => {
  it('진행 중 = 5s · 종착(`completed` · `failed`) = 정지 · 상한 도달 = 정지 · 되묻지 않는 오류 = 정지', () => {
    expect(DELETION_POLL_INTERVAL_MS).toBe(5_000);
    expect(selectDeletionRefetchInterval(undefined, undefined, 0)).toBe(5_000);
    expect(selectDeletionRefetchInterval({ status: 'received' }, undefined, 1)).toBe(5_000);
    expect(selectDeletionRefetchInterval({ status: 'processing' }, undefined, 2)).toBe(5_000);
    expect(selectDeletionRefetchInterval({ status: 'completed' }, undefined, 3)).toBe(false);
    expect(selectDeletionRefetchInterval({ status: 'failed' }, undefined, 3)).toBe(false);
    expect(
      selectDeletionRefetchInterval({ status: 'processing' }, undefined, DELETION_POLL_MAX_READS),
    ).toBe(false);
    expect(selectDeletionRefetchInterval(undefined, 'INTERNAL_ERROR', 4)).toBe(5_000);
    expect(selectDeletionRefetchInterval(undefined, 'RESOURCE_NOT_FOUND', 1)).toBe(false);
  });

  it('표면 판정 — 추적 = 이 화면에서 만든 요청 > 요약 · 상태 = 폴링 > 생성 · 이미 요청됨 = 진행 중', () => {
    const base: DeletionRequest = {
      id: 'a',
      scope: 'all_data',
      sessionId: null,
      status: 'received',
      requestedAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
    };
    const other = { ...base, id: 'b' };
    expect(trackedDeletionRequest(null, null, undefined)).toBeNull();
    expect(trackedDeletionRequest(base, other, undefined)?.id).toBe('a');
    expect(trackedDeletionRequest(null, other, undefined)?.id).toBe('b');
    expect(trackedDeletionRequest(base, null, { ...base, status: 'processing' })?.status).toBe(
      'processing',
    );
    // 다른 id 의 폴링 결과는 무시한다 (새 요청으로 바뀐 직후)
    expect(trackedDeletionRequest(base, null, { ...other, status: 'failed' })?.status).toBe(
      'received',
    );
    expect(resolveDeletionSurface(null, false)).toBe('none');
    expect(resolveDeletionSurface(null, true)).toBe('progress');
    expect(resolveDeletionSurface({ ...base, status: 'processing' }, false)).toBe('progress');
    expect(resolveDeletionSurface({ ...base, status: 'failed' }, false)).toBe('failed');
    expect(
      resolveDeletionSurface(
        { ...base, status: 'completed', completedAt: '2026-01-01T00:00:01.000Z' },
        false,
      ),
    ).toBe('completed');
  });
});

describe('확인 다이얼로그 ② (AC-8-26 · Spec §2.4)', () => {
  it('제목 = 아이 first name · 초기 포커스 = Cancel · Cancel = 요청 0 · 포커스 = 행', async () => {
    const harness = await renderData();
    const dialog = await openDialog();
    expect(within(dialog).getByRole('heading').textContent).toBe(
      copy.dialog.title(MOCK_CHILD_FIRST_NAME),
    );
    expect(dialog.textContent).toContain(copy.dialog.description);
    await waitFor(() => {
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: copy.dialog.cancelLabel }),
      );
    });
    fireEvent.click(within(dialog).getByRole('button', { name: copy.dialog.cancelLabel }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(ops(harness, CREATE_OP)).toHaveLength(0);
    await waitFor(() => {
      expect(document.activeElement).toBe(deleteRow());
    });
  });

  it('copy — 이름을 모르면 *your child* · 영향 안내 = 계정 유지', () => {
    expect(copy.dialog.title(undefined)).toBe("Delete all of your child's data?");
    expect(copy.dialog.description).toContain('Your account stays.');
  });

  it('처리 중에는 Esc · Cancel 로 닫히지 않는다 · 연타 = 요청 1건', async () => {
    const harness = await renderData(['data-management.createdeletionrequest:loading']);
    const dialog = await openDialog();
    const confirmButton = within(dialog).getByRole('button', { name: copy.dialog.confirmLabel });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.click(within(dialog).getByRole('button', { name: copy.dialog.cancelLabel }));
    expect(screen.getByRole('alertdialog')).toBeDefined();
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(ops(harness, CREATE_OP)).toHaveLength(1);
  });
});

describe('요청 → 진행 → 완료 (AC-8-26 · 27 · 31)', () => {
  it('POST 1회(IK · payload = scope · confirmation 만) → 상단 info 알림 · 포커스 = 알림 · 행 비활성 · 진행률 0', async () => {
    let create: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderData([], (h) => {
      create = vi.spyOn(h.bundle.clients.dataManagement, 'createDeletionRequest');
    });
    await confirm();
    await waitFor(() => {
      expect(progressAlert()).not.toBeNull();
    });
    expect(ops(harness, CREATE_OP)).toHaveLength(1);
    expect(ops(harness, CREATE_OP)[0]?.payload).toStrictEqual({
      scope: 'all_data',
      confirmation: true,
    });
    expect(create).toHaveBeenCalledTimes(1);
    const [, options] = create?.mock.calls[0] ?? [];
    expect(typeof (options as { idempotencyKey?: unknown }).idempotencyKey).toBe('string');

    expect(progressAlert()?.getAttribute('role')).toBe('status');
    await waitFor(() => {
      expect(document.activeElement).toBe(progressAlert()?.parentElement);
    });
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(
      deleteRow().closest('.haru-list-row')?.classList.contains('haru-list-row--disabled'),
    ).toBe(true);
  });

  it('폴링 `received → processing → completed` — 같은 문구라 알림 DOM 은 그대로(재낭독 0) · 완료 → 로컬 정리 → Guard = 온보딩 · Toast 1회 · 폴링 종료', async () => {
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderData([], (h) => {
      clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
      // 이 기기에 남은 아동 데이터 (draft · 카드 캐시)
      globalThis.localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, '{"schemaVersion":1}');
      globalThis.localStorage.setItem(ACTIVITY_CARD_CACHE_STORAGE_KEY, '{"schemaVersion":1}');
    });
    await confirm();
    await waitFor(() => {
      expect(progressAlert()).not.toBeNull();
    });
    const alertNode = progressAlert();
    const textBefore = alertNode?.textContent;
    await waitFor(() => {
      expect(ops(harness, POLL_OP).length).toBeGreaterThanOrEqual(1);
    });

    await advancePoll(); // 2회 = processing
    await waitFor(() => {
      expect(ops(harness, POLL_OP)).toHaveLength(2);
    });
    expect(progressAlert()).toBe(alertNode);
    expect(progressAlert()?.textContent).toBe(textBefore);

    await advancePoll(); // 3회 = completed
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.onboarding.start);
    });
    expect(await screen.findByText(copy.completedToast)).toBeDefined();
    expect(screen.getAllByText(copy.completedToast)).toHaveLength(1);
    expect(clearRecordings).toHaveBeenCalledTimes(1);
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(globalThis.localStorage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
    // Query 캐시: 삭제 전 서버 상태(데이터 관리 · 세션 · 리포트 등) 0 — `me` 는 삭제 후 상태로 다시 읽혔다
    const keys = harness.queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => query.state.data !== undefined)
      .map((query) => String(query.queryKey[0]));
    expect(keys.filter((key) => key === 'data-management' || key === 'sessions')).toStrictEqual([]);
    const pollsAfter = ops(harness, POLL_OP).length;
    await advancePoll();
    await advancePoll();
    expect(ops(harness, POLL_OP)).toHaveLength(pollsAfter);
  });

  it('`deletion-processing` — 다시 들어오면 요약의 진행 요청으로 같은 알림 · 폴링으로 완료 → 온보딩', async () => {
    const harness = await renderData(['data-management:deletion-processing']);
    expect(progressAlert()).not.toBeNull();
    await waitFor(() => {
      expect(ops(harness, POLL_OP)).toHaveLength(1);
    });
    await advancePoll();
    await advancePoll();
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.onboarding.start);
    });
    expect(ops(harness, CREATE_OP)).toHaveLength(0);
  });
});

describe('실패 · 이미 요청됨 · 오프라인 (AC-8-28 · 29 · 30)', () => {
  it('`deletion-failed` → 상단 error 알림(role alert) + Try again → Dialog ② 재진입 · 행 활성', async () => {
    const harness = await renderData(['data-management:deletion-failed']);
    await confirm();
    await waitFor(() => {
      expect(progressAlert()).not.toBeNull();
    });
    await advancePoll();
    await advancePoll();
    const failed = (await screen.findByText(copy.failed.title)).closest('.haru-alert');
    expect(failed?.getAttribute('role')).toBe('alert');
    expect(failed?.textContent).toContain(copy.failed.description);
    expect(progressAlert()).toBeNull();
    await waitFor(() => {
      expect(
        deleteRow().closest('.haru-list-row')?.classList.contains('haru-list-row--disabled'),
      ).toBe(false);
    });
    expect(pathname()).toBe(ROUTES.settingsData);

    fireEvent.click(
      within(failed as HTMLElement).getByRole('button', { name: copy.failed.action }),
    );
    expect(await screen.findByRole('alertdialog')).toBeDefined();
    expect(ops(harness, CREATE_OP)).toHaveLength(1);
  });

  it('`deletion-retry` (RETRY) — 실패 → Try again → 새 요청(새 IK) → 완료 → 온보딩', async () => {
    let create: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderData(['data-management:deletion-retry'], (h) => {
      create = vi.spyOn(h.bundle.clients.dataManagement, 'createDeletionRequest');
    });
    await confirm();
    await waitFor(() => {
      expect(progressAlert()).not.toBeNull();
    });
    await advancePoll();
    await advancePoll();
    const failed = (await screen.findByText(copy.failed.title)).closest('.haru-alert');
    fireEvent.click(
      within(failed as HTMLElement).getByRole('button', { name: copy.failed.action }),
    );
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: copy.dialog.confirmLabel }));
    await waitFor(() => {
      expect(progressAlert()).not.toBeNull();
    });
    expect(screen.queryByText(copy.failed.title)).toBeNull();
    expect(ops(harness, CREATE_OP)).toHaveLength(2);
    const keys = (create?.mock.calls ?? []).map(
      ([, options]) => (options as { idempotencyKey: string }).idempotencyKey,
    );
    expect(new Set(keys).size).toBe(2);

    await advancePoll();
    await advancePoll();
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.onboarding.start);
    });
  });

  it('POST → `DELETION_ALREADY_REQUESTED` = 진행 중으로 표시 (오류 화면 · error 알림 0)', async () => {
    await renderData([], (h) => {
      vi.spyOn(h.bundle.clients.dataManagement, 'createDeletionRequest').mockRejectedValue(
        new HaruApiError('DELETION_ALREADY_REQUESTED', 'already'),
      );
    });
    await confirm();
    await waitFor(() => {
      expect(progressAlert()).not.toBeNull();
    });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText(errorCopyForCode('DELETION_ALREADY_REQUESTED').title)).toBeNull();
    expect(
      deleteRow().closest('.haru-list-row')?.classList.contains('haru-list-row--disabled'),
    ).toBe(true);
  });

  it('`deletion-already-requested` — 요약의 진행 요청 → info 알림 · 행 비활성 · 폴링해도 그대로', async () => {
    const harness = await renderData(['data-management:deletion-already-requested']);
    expect(progressAlert()).not.toBeNull();
    await advancePoll();
    await advancePoll();
    await advancePoll();
    expect(progressAlert()).not.toBeNull();
    expect(pathname()).toBe(ROUTES.settingsData);
    expect(ops(harness, CREATE_OP)).toHaveLength(0);
  });

  it('POST 실패 → 요청 버튼 바로 위 error 알림 · 다시 누르면 같은 IK', async () => {
    let create: ReturnType<typeof vi.spyOn> | undefined;
    await renderData(['data-management.createdeletionrequest:error'], (h) => {
      create = vi.spyOn(h.bundle.clients.dataManagement, 'createDeletionRequest');
    });
    await confirm();
    const title = errorCopyForCode('INTERNAL_ERROR').title;
    const alert = (await screen.findByText(title)).closest('.haru-alert') as HTMLElement;
    expect(alert.getAttribute('role')).toBe('alert');
    // 설명 = 무엇이 바뀌었는가 (Spec §10.2 `VG8-C-05`) — 일반 설명 아님
    expect(alert.textContent).toContain(copy.deleteData.notDeleted);
    expect(copy.deleteData.notDeleted).toBe('Nothing was deleted. You can try again.');
    expect(alert.textContent).not.toContain(errorCopyForCode('INTERNAL_ERROR').description);
    // 위치 = Delete data ListGroup 바로 앞
    const group = screen.getByRole('list', { name: copy.deleteData.listLabel });
    expect(alert.nextElementSibling?.contains(group) || alert.nextElementSibling === group).toBe(
      true,
    );
    expect(progressAlert()).toBeNull();

    await confirm();
    await waitFor(() => {
      expect(create).toHaveBeenCalledTimes(2);
    });
    const keys = (create?.mock.calls ?? []).map(
      ([, options]) => (options as { idempotencyKey: string }).idempotencyKey,
    );
    expect(keys[0]).toBe(keys[1]);
  });

  it('기기 오프라인 → 요청 0 · offline 알림(*Nothing was sent.*) · 행 활성 (백그라운드 재전송 0)', async () => {
    const harness = await renderData();
    vi.spyOn(globalThis.navigator, 'onLine', 'get').mockReturnValue(false);
    await confirm();
    const alert = (await screen.findByText(copy.deleteData.notSent)).closest(
      '.haru-alert',
    ) as HTMLElement;
    expect(alert.textContent).toContain(networkErrorCopy.title);
    expect(alert.classList.contains('haru-alert--offline')).toBe(true);
    expect(ops(harness, CREATE_OP)).toHaveLength(0);
    expect(
      deleteRow().closest('.haru-list-row')?.classList.contains('haru-list-row--disabled'),
    ).toBe(false);
    vi.spyOn(globalThis.navigator, 'onLine', 'get').mockReturnValue(true);
    globalThis.dispatchEvent(new Event('online'));
    await advancePoll();
    expect(ops(harness, CREATE_OP)).toHaveLength(0);
  });
});

describe('삭제 진행 중 쓰기 차단 문구 (AC-8-32 · Spec §2.9 · `VG8-A-03`)', () => {
  it('`ACCOUNT_DELETION_PENDING` = 제목 *Changes are paused* + Spec 설명 · 다른 code = null (화면 원래 문구)', () => {
    expect(deletionPendingCopy('ACCOUNT_DELETION_PENDING')).toStrictEqual({
      title: 'Changes are paused',
      description: 'Your data is being deleted, so changes are paused.',
    });
    expect(deletionPendingCopy('INTERNAL_ERROR')).toBeNull();
    expect(deletionPendingCopy(undefined)).toBeNull();
    // 세션 시작 표면(홈 시트 · 서재 시트)은 기존 판정 함수가 같은 문구를 고른다
    expect(sessionStartBlockedCopy('ACCOUNT_DELETION_PENDING')).toStrictEqual(
      deletionPendingCopy('ACCOUNT_DELETION_PENDING'),
    );
  });

  it('아이 정보 저장 — `account:deletion-pending-write-blocked` 에서 기존 저장 실패 표면에 차단 문구', async () => {
    const harness = createHarness({
      scenarios: ['account:deletion-pending-write-blocked'],
      initialEntries: [ROUTES.settingsChild],
    });
    await signIn(harness);
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <AppRoutes />
      </Wrapper>,
    );
    const name = await screen.findByRole('textbox', { name: /First name/ });
    fireEvent.change(name, { target: { value: 'Mia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    const alert = (await screen.findByText('Changes are paused')).closest('.haru-alert');
    expect(alert?.textContent).toContain('Your data is being deleted, so changes are paused.');
    expect(screen.queryByText("We couldn't save the changes right now")).toBeNull();
  });
});
