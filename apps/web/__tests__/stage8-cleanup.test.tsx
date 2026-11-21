/**
 * Stage 8 `S8-F` — 앱 공통 정리 (Plan rev 2.2 `S8-F` · §5.4 · §5.7 · AC-8-40 · 97 · 98 · 99 화면 부분).
 *
 * - `N8-31` ⓐ (`D8-2` ①): 전체 삭제 요청 **기기 표시**(요청 id 만) + `app/providers` 감시자 1곳이 화면 밖 완료를 감지해 로컬 정리 +
 *   Toast 1회. 화면은 상태만 표시한다.
 * - `VG6-D-12` (`N8-14` · `Q8-17`): 앱 안 기록이 없으면 Back = 논리적 부모로 replace (Spec §6.3 부모 표).
 * - `VG8-C-08` · `VG8-C-09` ②: Toast 1줄 표면 = 차단 설명만 · PDF 요청 거절만 차단 문구 (contract 변경 0).
 *
 * 실제 앱과 같은 조립(`createHarness` — `AppProviders` 에 감시자 포함)으로 연다. 폴링(5s)은 가짜 시계로 흘린다.
 */
import { type DeletionRequest, type OnboardingDraftAnswers } from '@haru/contracts';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import {
  DELETION_POLL_INTERVAL_MS,
  DELETION_POLL_MAX_READS,
} from '../src/entities/data-management';
import { dataManagementCopy as copy } from '../src/features/data-management';
import { DEFAULT_ONBOARDING_INSTRUMENT } from '../src/features/onboarding-survey';
import { reportPdfReducer } from '../src/features/report-pdf/model/reportPdfState';
import { applyDataDeletionMarkerSeed } from '../src/mocks';
import { MOCK_SEEDED_DELETION_REQUEST_ID } from '../src/mocks/fixtures/data-management';
import { createChildInfoDraftAnswers } from '../src/mocks/fixtures/onboarding';
import { appCopy } from '../src/shared/copy/app-copy';
import { deletionPendingToastMessage } from '../src/shared/copy/error-copy';
import { BACK_PARENT_ROUTES, ROUTES, logicalParentPath } from '../src/shared/config/routes';
import { useBackNavigation } from '../src/shared/hooks/useBackNavigation';
import { ACTIVITY_CARD_CACHE_STORAGE_KEY } from '../src/shared/lib/activity-card-cache';
import { createFixedClock } from '../src/shared/lib/clock';
import {
  DATA_DELETION_MARKER_STORAGE_KEY,
  createDataDeletionMarkerStore,
  dataDeletionMarkerStore,
} from '../src/shared/lib/data-deletion-marker';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '../src/shared/lib/onboarding-draft';
import { createHarness, type Harness } from '../src/test/harness';

const CREATE_OP = 'POST /v1/data-deletion-requests';
const POLL_OP = 'GET /v1/data-deletion-requests/:id';
const NOW = '2026-01-01T00:00:00.000Z';
const OTHER_ID = 'd8d8d8d8-3333-4333-8333-000000000001';

/** 경로가 바뀔 때마다 기록한다 — 정리 전에 온보딩(draft resume) 화면이 그려졌는지 본다. */
const visited: string[] = [];
function LocationProbe() {
  const location = useLocation();
  useEffect(() => {
    visited.push(location.pathname);
  }, [location.pathname]);
  return <span data-testid="pathname">{location.pathname}</span>;
}
const pathname = () => screen.getByTestId('pathname').textContent;

async function signIn(harness: Harness): Promise<void> {
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
}

async function renderApp(
  path: string,
  scenarios: readonly string[] = [],
  prepare?: (harness: Harness) => void,
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [path] });
  await signIn(harness);
  prepare?.(harness);
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  return harness;
}

const ops = (harness: Harness, operation: string) =>
  harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation);

const markerRaw = () => globalThis.localStorage.getItem(DATA_DELETION_MARKER_STORAGE_KEY);

function seedResumableDraft(): void {
  const answers: OnboardingDraftAnswers = { child_info: createChildInfoDraftAnswers() };
  globalThis.localStorage.setItem(
    ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      instrument: {
        code: DEFAULT_ONBOARDING_INSTRUMENT.code,
        version: DEFAULT_ONBOARDING_INSTRUMENT.version,
      },
      currentStep: 'reading_together',
      answers,
      updatedAt: NOW,
    }),
  );
}

function request(status: DeletionRequest['status'], id = MOCK_SEEDED_DELETION_REQUEST_ID) {
  return {
    id,
    scope: 'all_data' as const,
    sessionId: null,
    status,
    requestedAt: NOW,
    completedAt: status === 'completed' || status === 'failed' ? NOW : null,
  } satisfies DeletionRequest;
}

async function advancePoll(times = 1): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DELETION_POLL_INTERVAL_MS);
    });
  }
}

beforeEach(() => {
  visited.length = 0;
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

// ── 기기 표시 저장소 (AC-8-97) ───────────────────────────────────────────────

describe('전체 삭제 기기 표시 — 저장 형식 (`N8-31` ⓐ · AC-8-97)', () => {
  it('요청 id · scope · 시각 3필드만 (PII 0) · 같은 id 재저장 = 변화 0 · clear', () => {
    const store = createDataDeletionMarkerStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.save(MOCK_SEEDED_DELETION_REQUEST_ID, createFixedClock(Date.parse(NOW)));
    expect(JSON.parse(markerRaw() ?? 'null')).toStrictEqual({
      requestId: MOCK_SEEDED_DELETION_REQUEST_ID,
      scope: 'all_data',
      savedAt: NOW,
    });
    store.save(MOCK_SEEDED_DELETION_REQUEST_ID, createFixedClock(Date.parse(NOW) + 1));
    expect(listener).toHaveBeenCalledTimes(1);
    store.clear();
    expect(markerRaw()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('읽을 수 없는 값 · uuid 아닌 id 는 표시로 보지 않고 지운다', () => {
    const store = createDataDeletionMarkerStore();
    globalThis.localStorage.setItem(DATA_DELETION_MARKER_STORAGE_KEY, '{"requestId":"emma"}');
    expect(store.read()).toBeNull();
    expect(markerRaw()).toBeNull();
    store.save('not-a-uuid', createFixedClock(Date.parse(NOW)));
    expect(markerRaw()).toBeNull();
  });
});

describe('표시 수명 — 쓰는 때 · 지우는 때 (AC-8-97)', () => {
  it('`POST` 성공 → 표시 1개(그 요청 id) → 폴링 완료 · 정리 성공 후 표시 0 · 정리 실행 1회 · Toast 1회', async () => {
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderApp(ROUTES.settingsData, [], (h) => {
      clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
    });
    const row = await screen.findByRole('button', { name: copy.deleteData.rowLabel });
    fireEvent.click(row);
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: copy.dialog.confirmLabel }));
    await waitFor(() => expect(markerRaw()).not.toBeNull());
    const created = ops(harness, CREATE_OP);
    expect(created).toHaveLength(1);
    const marker = JSON.parse(markerRaw() ?? '{}') as Record<string, unknown>;
    expect(Object.keys(marker).sort()).toStrictEqual(['requestId', 'savedAt', 'scope']);
    expect(marker['scope']).toBe('all_data');

    await advancePoll(2);
    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.start));
    expect(markerRaw()).toBeNull();
    expect(clearRecordings).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(copy.completedToast)).toBeDefined();
    expect(screen.getAllByText(copy.completedToast)).toHaveLength(1);
    // 폴링 주체 1곳 — 화면 + 감시자 중복 요청 0 (생성 응답 received → 조회 3회로 completed)
    expect(ops(harness, POLL_OP)).toHaveLength(3);
  });

  it('`/settings/data` 요약에 진행 중 `all_data` 요청(다른 기기 · 이전 방문) → 표시', async () => {
    await renderApp(ROUTES.settingsData, ['data-management:deletion-already-requested']);
    await screen.findByText(copy.progress.title);
    await waitFor(() => {
      expect(JSON.parse(markerRaw() ?? '{}')).toMatchObject({
        requestId: MOCK_SEEDED_DELETION_REQUEST_ID,
        scope: 'all_data',
      });
    });
  });

  it('`failed` → 표시 0 (실패 표면은 화면 몫)', async () => {
    await renderApp(ROUTES.settingsData, ['data-management:deletion-failed']);
    fireEvent.click(await screen.findByRole('button', { name: copy.deleteData.rowLabel }));
    fireEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: copy.dialog.confirmLabel,
      }),
    );
    await waitFor(() => expect(markerRaw()).not.toBeNull());
    await advancePoll(2);
    expect(await screen.findByText(copy.failed.title)).toBeDefined();
    await waitFor(() => expect(markerRaw()).toBeNull());
  });

  it('`RESOURCE_NOT_FOUND` (서버에 없는 요청) → 표시 0 · 정리 0 · Toast 0', async () => {
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderApp(ROUTES.home, [], (h) => {
      clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
      dataDeletionMarkerStore.save(OTHER_ID, createFixedClock(Date.parse(NOW)));
    });
    await waitFor(() => expect(ops(harness, POLL_OP)).toHaveLength(1));
    await waitFor(() => expect(markerRaw()).toBeNull());
    expect(clearRecordings).not.toHaveBeenCalled();
    expect(screen.queryByText(copy.completedToast)).toBeNull();
  });

  it('`scope=account` 진행 요청은 표시하지 않는다 (탈퇴 완료 = 요청 성공 즉시 정리)', async () => {
    await renderApp(ROUTES.settingsData, [], (h) => {
      vi.spyOn(h.bundle.clients.dataManagement, 'summary').mockResolvedValue({
        retentionPolicy: { rawAudioDays: 90 },
        recordingsCount: 0,
        activeDeletionRequest: { ...request('processing', OTHER_ID), scope: 'account' },
      });
    });
    await screen.findByText(copy.accountProgress.title);
    expect(markerRaw()).toBeNull();
  });

  it('로그아웃 정리 → 표시 0', async () => {
    await renderApp(ROUTES.settings, [], () => {
      dataDeletionMarkerStore.save(OTHER_ID, createFixedClock(Date.parse(NOW)));
    });
    // 로그아웃 확인 → 정리 (`performSessionCleanup` 에 표시 포함)
    fireEvent.click(await screen.findByRole('button', { name: 'Log out' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(pathname()).toBe(ROUTES.auth.welcome));
    expect(markerRaw()).toBeNull();
  });
});

// ── 화면 밖 완료 (AC-8-98 · 99) ───────────────────────────────────────────────

describe('화면 밖 완료 — `data-management:deletion-completed-offscreen` (AC-8-98 ③ 앱 재시작 · AC-8-99)', () => {
  it('앱 시작 → 감시자가 완료 감지 → 로컬 정리(draft · 카드 캐시 · 녹음 · Query) → 표시 0 → Toast 1회 → `/onboarding/start` · 정리 전 온보딩 resume 화면 0', async () => {
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderApp(
      ROUTES.home,
      ['data-management:deletion-completed-offscreen'],
      (h) => {
        clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
        // 이 기기에 남은 아동 데이터 + 요청 id 표시 (브라우저 조립 지점 seed 와 같은 경로)
        seedResumableDraft();
        globalThis.localStorage.setItem(ACTIVITY_CARD_CACHE_STORAGE_KEY, '{"schemaVersion":1}');
        expect(
          applyDataDeletionMarkerSeed({
            store: h.bundle.store,
            deviceClock: createFixedClock(Date.parse(NOW)),
          }),
        ).toBe(true);
      },
    );

    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.start));
    expect(await screen.findByText(copy.completedToast)).toBeDefined();
    expect(screen.getAllByText(copy.completedToast)).toHaveLength(1);
    expect(clearRecordings).toHaveBeenCalledTimes(1);
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(globalThis.localStorage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
    expect(markerRaw()).toBeNull();
    // draft 가 남은 채 Guard 가 판정했다면 resume 경로(`/onboarding/reading-together`)를 거쳤을 것이다
    expect(
      visited.filter((path) => path.startsWith('/onboarding/') && path !== ROUTES.onboarding.start),
    ).toStrictEqual([]);
    // 결정적: 요청 조회 1회(첫 조회 = completed) · 생성 0 · 요약에 진행 요청 0
    expect(ops(harness, POLL_OP)).toHaveLength(1);
    expect(ops(harness, CREATE_OP)).toHaveLength(0);
    await advancePoll(3);
    expect(ops(harness, POLL_OP)).toHaveLength(1);
  });

  it('Mock key 단독(표시 없음) → 정리 · Toast 0, Guard 는 `me` 대로 온보딩 (다른 기기 한계 — R8-15)', async () => {
    const harness = await renderApp(ROUTES.home, ['data-management:deletion-completed-offscreen']);
    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.start));
    expect(screen.queryByText(copy.completedToast)).toBeNull();
    expect(ops(harness, POLL_OP)).toHaveLength(0);
    const summary = await harness.bundle.clients.dataManagement.summary();
    expect(summary.activeDeletionRequest).toBeNull();
    const polled = await harness.bundle.clients.dataManagement.getDeletionRequest({
      requestId: MOCK_SEEDED_DELETION_REQUEST_ID,
    });
    expect(polled.status).toBe('completed');
  });

  it('정리 실패 → 표시 유지 · Toast 0 · Guard 대기는 풀린다 (다음 시작 때 재시도)', async () => {
    await renderApp(ROUTES.home, ['data-management:deletion-completed-offscreen'], (h) => {
      vi.spyOn(h.sessionRecorder, 'clearLocalRecordings').mockRejectedValue(new Error('storage'));
      applyDataDeletionMarkerSeed({
        store: h.bundle.store,
        deviceClock: createFixedClock(Date.parse(NOW)),
      });
    });
    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.start));
    await waitFor(() => {
      expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
    });
    expect(markerRaw()).not.toBeNull();
    expect(screen.queryByText(copy.completedToast)).toBeNull();
  });
});

describe('폴링 상한 후 완료 (AC-8-98 ② — 가짜 타이머 · `P-42` 5s × 60)', () => {
  it('상한(60회) 도달 → 조회 정지 · 화면 복귀(`visibilitychange`) 때 1회 조회로 완료 감지 → 정리 + Toast 1회', async () => {
    let flip = false;
    let reads = 0;
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    await renderApp(ROUTES.home, [], (h) => {
      clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
      vi.spyOn(h.bundle.clients.dataManagement, 'getDeletionRequest').mockImplementation(() => {
        reads += 1;
        if (!flip) return Promise.resolve(request('processing'));
        // 서버가 끝냈다 — Mock 서버 아동 데이터도 지워진 상태 (`me` = 온보딩 전)
        h.bundle.deletionState.childDataDeleted = true;
        return Promise.resolve(request('completed'));
      });
      dataDeletionMarkerStore.save(
        MOCK_SEEDED_DELETION_REQUEST_ID,
        createFixedClock(Date.parse(NOW)),
      );
    });
    await waitFor(() => expect(reads).toBe(1));
    // 진행 중 = Guard 대기 풀림 → 홈
    await waitFor(() => expect(pathname()).toBe(ROUTES.home));

    await advancePoll(DELETION_POLL_MAX_READS + 5);
    expect(reads).toBe(DELETION_POLL_MAX_READS);
    expect(markerRaw()).not.toBeNull();
    expect(clearRecordings).not.toHaveBeenCalled();

    // 상한 뒤 서버가 완료 → 화면 복귀 때 1회 조회
    flip = true;
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(0);
    });
    await waitFor(() => expect(reads).toBe(DELETION_POLL_MAX_READS + 1));
    await waitFor(() => expect(markerRaw()).toBeNull());
    expect(clearRecordings).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(copy.completedToast)).toBeDefined();
    expect(screen.getAllByText(copy.completedToast)).toHaveLength(1);
    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.start));
    // 더 묻지 않는다 (표시 0 → 감시 종료). Toast 는 자동으로 닫히므로 개수는 위에서 셌다
    await advancePoll(3);
    expect(reads).toBe(DELETION_POLL_MAX_READS + 1);
  });
});

// ── Back fallback (AC-8-40) ─────────────────────────────────────────────────

describe('`VG6-D-12` Back 부모 표 (Spec §6.3 · AC-8-40)', () => {
  it.each([
    [ROUTES.settingsProfile, ROUTES.settings],
    [ROUTES.settingsChild, ROUTES.settings],
    [ROUTES.settingsChildSurvey, ROUTES.settings],
    ['/settings/child/survey/reading-together', ROUTES.settingsChildSurvey],
    [ROUTES.settingsGrowthCapability, ROUTES.settings],
    [ROUTES.settingsData, ROUTES.settings],
    [ROUTES.settingsDataRecordings, ROUTES.settingsData],
    [ROUTES.settingsAccount, ROUTES.settings],
    [ROUTES.settings, ROUTES.home],
    [ROUTES.libraryAdd, ROUTES.library],
    [ROUTES.libraryGiftRequests, ROUTES.library],
    ['/progress/reports/11111111-1111-4111-8111-111111111111', ROUTES.progress],
    [ROUTES.auth.signUp, ROUTES.auth.welcome],
    [ROUTES.auth.logIn, ROUTES.auth.welcome],
    [ROUTES.auth.forgotPassword, ROUTES.auth.welcome],
    [ROUTES.auth.resetPassword, ROUTES.auth.welcome],
  ])('%s → %s', (path, parent) => {
    expect(logicalParentPath(path)).toBe(parent);
  });

  it('표의 모든 패턴이 ROUTES 상수다 (경로 문자열 단일 출처)', () => {
    const known = new Set(
      Object.values(ROUTES).flatMap((value) =>
        typeof value === 'string' ? [value] : Object.values(value),
      ),
    );
    for (const [pattern, parent] of BACK_PARENT_ROUTES) {
      expect(known.has(pattern)).toBe(true);
      expect(known.has(parent)).toBe(true);
    }
  });

  function wrapper(initialEntries: string[]) {
    return ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
        <LocationProbe />
      </MemoryRouter>
    );
  }

  it('앱 안 기록 없음(직접 진입) → 부모로 replace', async () => {
    vi.spyOn(globalThis.history, 'state', 'get').mockReturnValue({ idx: 0 });
    const { result } = renderHook(() => useBackNavigation(), {
      wrapper: wrapper([ROUTES.settingsDataRecordings]),
    });
    act(() => {
      result.current();
    });
    await waitFor(() => expect(pathname()).toBe(ROUTES.settingsData));
  });

  it('앱 안 기록 있음 → 이전 화면 (`navigate(-1)`)', async () => {
    vi.spyOn(globalThis.history, 'state', 'get').mockReturnValue({ idx: 1 });
    const { result } = renderHook(() => useBackNavigation(), {
      wrapper: wrapper([ROUTES.library, ROUTES.settingsDataRecordings]),
    });
    act(() => {
      result.current();
    });
    await waitFor(() => expect(pathname()).toBe(ROUTES.library));
  });
});

// ── 쓰기 차단 1줄 표면 · PDF (VG8-C-08 · VG8-C-09 ②) ─────────────────────────

describe('쓰기 차단 — Toast 설명만 · PDF 요청 거절 (Spec §2.9 `VG8-C-08` · `VG8-C-09` ②)', () => {
  it('Toast 문구 = 설명만 · 다른 code = null', () => {
    expect(deletionPendingToastMessage('ACCOUNT_DELETION_PENDING')).toBe(
      'Your data is being deleted, so changes are paused.',
    );
    expect(deletionPendingToastMessage('INTERNAL_ERROR')).toBeNull();
    expect(deletionPendingToastMessage(undefined)).toBeNull();
  });

  it('PDF — 요청(`POST`) 거절만 `blocked` · 조회/파일 실패 · 서버 `failed` 는 아님', () => {
    const requesting = reportPdfReducer(
      { phase: 'idle' },
      { type: 'start', now: 0, freshKey: 'k1' },
    );
    expect(
      reportPdfReducer(requesting, {
        type: 'request-failed',
        key: 'k1',
        offline: false,
        blocked: true,
      }),
    ).toMatchObject({ phase: 'failed', serverFailed: false, blocked: true });
    expect(
      reportPdfReducer(requesting, { type: 'request-failed', key: 'k1', offline: false }),
    ).not.toHaveProperty('blocked');
    expect(
      reportPdfReducer(requesting, { type: 'server-status', key: 'k1', status: 'failed' }),
    ).not.toHaveProperty('blocked');
  });
});
