/**
 * Stage 8 `S8-D` — 계정 · 탈퇴 + 미가입 기기 draft 삭제 (Spec §2.4-③ · §2.5 `VG8-C-12` · §2.6 · §2.7 · §6.2 · §10.4 · §10.5,
 * AC-8-33 · 34 · 35 · 36 · 37 · 38 · 39 화면 부분).
 *
 * 실제 앱과 같은 조립(`createHarness` + `AppRoutes`)으로 연다. 기대 문구는 copy 모듈 · Mock 상수에서 읽는다.
 */
import { HaruApiError, type DeletionRequest, type OnboardingDraftAnswers } from '@haru/contracts';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { DEV_SCENARIO_GROUPS } from '../src/dev/scenario-panel/devScenarios';
import { accountDeletionCopy as copy } from '../src/features/account-deletion';
import { DeletionStatusAlert, dataManagementCopy } from '../src/features/data-management';
import { deviceDataCopy } from '../src/features/device-data';
import { DEFAULT_ONBOARDING_INSTRUMENT, onboardingCopy } from '../src/features/onboarding-survey';
import { MOCK_REQUIRED_CONSENT_TYPES } from '../src/mocks/fixtures/consent';
import { MOCK_CAREGIVER_EMAIL, MOCK_CHILD_FIRST_NAME } from '../src/mocks/fixtures/me';
import { createChildInfoDraftAnswers } from '../src/mocks/fixtures/onboarding';
import { appCopy } from '../src/shared/copy/app-copy';
import { accountDeletionStatusCopy } from '../src/shared/copy/deletion-status-copy';
import { errorCopyForCode, networkErrorCopy } from '../src/shared/copy/error-copy';
import { ROUTES, onboardingStepPath } from '../src/shared/config/routes';
import { ACTIVITY_CARD_CACHE_STORAGE_KEY } from '../src/shared/lib/activity-card-cache';
import { ONBOARDING_DRAFT_STORAGE_KEY } from '../src/shared/lib/onboarding-draft';
import { returnPathStore } from '../src/shared/lib/return-path';
import { createHarness, type Harness } from '../src/test/harness';

const DELETE_ME_OP = 'DELETE /v1/me';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent;

const ops = (harness: Harness, operation: string) =>
  harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation);

function mount(harness: Harness): void {
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
}

async function renderAccount(
  scenarios: readonly string[] = [],
  prepare?: (harness: Harness) => void,
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [ROUTES.settingsAccount] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  prepare?.(harness);
  mount(harness);
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
  await screen.findByRole('list', { name: copy.deleteAccount.listLabel });
  return harness;
}

const deleteRow = () =>
  within(screen.getByRole('list', { name: copy.deleteAccount.listLabel })).getByRole('button', {
    name: copy.deleteAccount.rowLabel,
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

const activeAccountRequest: DeletionRequest = {
  id: '0e0e0e0e-0000-4000-8000-000000000001',
  scope: 'account',
  sessionId: null,
  status: 'processing',
  requestedAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

describe('계정 화면 (AC-8-33)', () => {
  it('이메일 = `Me.caregiver.email` 응답 값 · 표시 전용(버튼 · chevron 0) · 요금제 행 0 · 탈퇴 진입 1행', async () => {
    await renderAccount();
    const signedIn = screen.getByRole('list', { name: copy.signedIn.listLabel });
    const rows = within(signedIn).getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.textContent).toBe(MOCK_CAREGIVER_EMAIL);
    expect(within(signedIn).queryByRole('button')).toBeNull();
    expect(signedIn.querySelector('svg')).toBeNull();
    expect(screen.queryByText(/plan|beta|free|price/i)).toBeNull();
    expect(screen.getByText(copy.deleteAccount.notice(MOCK_CHILD_FIRST_NAME))).toBeDefined();
    expect(deleteRow()).toBeDefined();
  });

  it('fixture 값을 바꾸면 화면이 바뀐다 (응답 값만 표시)', async () => {
    const harness = createHarness({ initialEntries: [ROUTES.settingsAccount] });
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    const original = harness.bundle.clients.me.get.bind(harness.bundle.clients.me);
    vi.spyOn(harness.bundle.clients.me, 'get').mockImplementation(async (request) => {
      const me = await original(request);
      return { ...me, caregiver: { ...me.caregiver, email: 'other.parent@example.com' } };
    });
    mount(harness);
    expect(await screen.findByText('other.parent@example.com')).toBeDefined();
    expect(screen.queryByText(MOCK_CAREGIVER_EMAIL)).toBeNull();
  });

  it('copy — 이름을 모르면 *your child* · 금칙어(진단 · 수치) 0', () => {
    expect(copy.deleteAccount.notice(undefined)).toContain("your child's");
    expect(copy.dialog.description(undefined)).toContain("your child's");
    const all = [
      copy.deleteAccount.notice('Emma'),
      copy.dialog.title,
      copy.dialog.description('Emma'),
      copy.deleteAccount.alreadyRequested.title,
      copy.deleteAccount.alreadyRequested.description,
      copy.deleteAccount.notDeleted,
      copy.deletedToast,
      accountDeletionStatusCopy.progress.description('Emma'),
      accountDeletionStatusCopy.failed.description,
    ].join(' ');
    expect(all).not.toMatch(/\d|score|behind|delay|normal|problem|permanently/i);
  });
});

describe('탈퇴 확인 · 요청 (AC-8-34)', () => {
  it('Dialog ③ — 제목 · 설명(first name) · 초기 포커스 = Cancel · Cancel = 요청 0 · 포커스 = 행', async () => {
    const harness = await renderAccount();
    const trigger = deleteRow();
    const dialog = await openDialog();
    expect(within(dialog).getByText(copy.dialog.title)).toBeDefined();
    expect(within(dialog).getByText(copy.dialog.description(MOCK_CHILD_FIRST_NAME))).toBeDefined();
    const cancel = within(dialog).getByRole('button', { name: copy.dialog.cancelLabel });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
    fireEvent.click(cancel);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(ops(harness, DELETE_ME_OP)).toHaveLength(0);
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('확인 → DELETE /v1/me 1회 · IK · payload = confirmation 만 · 연타 = 1건', async () => {
    let call: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderAccount(['account:loading'], (h) => {
      call = vi.spyOn(h.bundle.clients.account, 'deleteAccount');
    });
    const dialog = await openDialog();
    const confirmButton = within(dialog).getByRole('button', { name: copy.dialog.confirmLabel });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(pathname()).toBe(ROUTES.auth.welcome));
    expect(ops(harness, DELETE_ME_OP)).toHaveLength(1);
    expect(ops(harness, DELETE_ME_OP)[0]?.payload).toEqual({ confirmation: true });
    expect(call).toHaveBeenCalledTimes(1);
    const [request, options] = call?.mock.calls[0] ?? [];
    expect(request).toEqual({ body: { confirmation: true } });
    expect(typeof (options as { idempotencyKey?: unknown }).idempotencyKey).toBe('string');
  });
});

describe('탈퇴 성공 (AC-8-35 · AC-8-62)', () => {
  it('로컬 정리(draft · 카드 캐시 · 녹음 · Query 캐시 · 복귀 경로) → 세션 종료 → /auth/welcome replace · Toast neutral 1회', async () => {
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    let signOut: ReturnType<typeof vi.spyOn> | undefined;
    const harness = await renderAccount([], (h) => {
      clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
      signOut = vi.spyOn(h.bundle.authGateway, 'signOut');
      globalThis.localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, '{"schemaVersion":1}');
      globalThis.localStorage.setItem(ACTIVITY_CARD_CACHE_STORAGE_KEY, '{"schemaVersion":1}');
    });
    returnPathStore.remember('/progress');

    await confirm();

    await waitFor(() => expect(pathname()).toBe(ROUTES.auth.welcome));
    expect(await screen.findByText(copy.deletedToast)).toBeDefined();
    expect(screen.getAllByText(copy.deletedToast)).toHaveLength(1);
    expect(screen.getByText(copy.deletedToast).closest('.haru-toast')?.className).toContain(
      'haru-toast--neutral',
    );
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(clearRecordings).toHaveBeenCalledTimes(1);
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(globalThis.localStorage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
    expect(returnPathStore.peek()).toBeNull();
    expect(await harness.bundle.authGateway.getSession()).toBeNull();
    // 아동 데이터가 담긴 Query 캐시 0 (`me` 포함 전부 비운다 — 세션이 끝났다)
    const keys = harness.queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => query.state.data !== undefined);
    expect(keys).toHaveLength(0);
    // Toast 문구에 이메일 0 (Plan §5.5)
    expect(copy.deletedToast).not.toContain('@');
  });
});

describe('탈퇴 실패 · 오프라인 · 이미 요청됨 (AC-8-36 · Q8-09)', () => {
  it('실패 → 행 위 error 알림 · 로컬 보존 · 세션 유지 · 다시 확인 = 같은 IK', async () => {
    let call: ReturnType<typeof vi.spyOn> | undefined;
    let clearRecordings: ReturnType<typeof vi.spyOn> | undefined;
    await renderAccount(['account:error'], (h) => {
      call = vi.spyOn(h.bundle.clients.account, 'deleteAccount');
      clearRecordings = vi.spyOn(h.sessionRecorder, 'clearLocalRecordings');
      globalThis.localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, '{"schemaVersion":1}');
    });
    await confirm();
    const alert = await screen.findByRole('alert');
    const message = errorCopyForCode('INTERNAL_ERROR');
    expect(alert.textContent).toContain(message.title);
    // 설명 = 무엇이 바뀌었는가 (Spec §10.4 `VG8-D-03`) — 일반 설명(*Please try again in a moment.*) 아님
    expect(alert.textContent).toContain('Nothing was deleted. You can try again.');
    expect(alert.textContent).not.toContain(message.description);
    expect(pathname()).toBe(ROUTES.settingsAccount);
    expect(clearRecordings).not.toHaveBeenCalled();
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).not.toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(deleteRow()));

    await confirm();
    await waitFor(() => expect(call).toHaveBeenCalledTimes(2));
    const key = (index: number) =>
      (call?.mock.calls[index]?.[1] as { idempotencyKey: string }).idempotencyKey;
    expect(key(1)).toBe(key(0));
  });

  it('기기 오프라인 → 요청 0 · offline 알림(*Nothing was sent.*) · 로컬 보존', async () => {
    const harness = await renderAccount();
    vi.spyOn(globalThis.navigator, 'onLine', 'get').mockReturnValue(false);
    await confirm();
    const alert = (await screen.findByText(copy.deleteAccount.notSent)).closest(
      '.haru-alert',
    ) as HTMLElement;
    expect(alert.textContent).toContain(networkErrorCopy.title);
    expect(ops(harness, DELETE_ME_OP)).toHaveLength(0);
    expect(pathname()).toBe(ROUTES.settingsAccount);
  });

  it('진행 중 전체 삭제 — 행은 활성 · 서버 `DELETION_ALREADY_REQUESTED` → info 알림 (오류 0)', async () => {
    await renderAccount(['account:deletion-pending-write-blocked']);
    expect(deleteRow().hasAttribute('disabled')).toBe(false);
    expect(deleteRow().getAttribute('aria-disabled')).not.toBe('true');
    await confirm();
    const info = (await screen.findByText(copy.deleteAccount.alreadyRequested.title)).closest(
      '.haru-alert',
    ) as HTMLElement;
    expect(info.getAttribute('role')).toBe('status');
    // 제목 + 설명 2줄 표면 (Spec §10.4 `VG8-D-04`) — 단어 변경 0
    expect(within(info).getByText('Your data is already being deleted')).toBeDefined();
    expect(within(info).getByText('You can delete your account after it finishes.')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(pathname()).toBe(ROUTES.settingsAccount);
  });

  it('DELETION_ALREADY_REQUESTED (API 스텁) → 같은 info 알림', async () => {
    await renderAccount([], (h) => {
      vi.spyOn(h.bundle.clients.account, 'deleteAccount').mockRejectedValue(
        new HaruApiError('DELETION_ALREADY_REQUESTED', 'already'),
      );
    });
    await confirm();
    expect(await screen.findByText(copy.deleteAccount.alreadyRequested.title)).toBeDefined();
    expect(screen.getByText(copy.deleteAccount.alreadyRequested.description)).toBeDefined();
  });
});

describe('진행 중 탈퇴 요청 표시 (Spec §2.5 `VG8-C-12`)', () => {
  it('/settings/account — 요약에 `account` 진행 요청 → 영향 안내 아래 info 알림 · *Delete account* 행 비활성', async () => {
    await renderAccount([], (h) => {
      const original = h.bundle.clients.dataManagement.summary.bind(
        h.bundle.clients.dataManagement,
      );
      vi.spyOn(h.bundle.clients.dataManagement, 'summary').mockImplementation(async (request) => ({
        ...(await original(request)),
        activeDeletionRequest: activeAccountRequest,
      }));
    });
    const info = (await screen.findByText(accountDeletionStatusCopy.progress.title)).closest(
      '.haru-alert',
    ) as HTMLElement;
    expect(info.getAttribute('role')).toBe('status');
    expect(info.textContent).toContain(
      accountDeletionStatusCopy.progress.description(MOCK_CHILD_FIRST_NAME),
    );
    await waitFor(() => {
      const row = deleteRow();
      expect(row.hasAttribute('disabled') || row.getAttribute('aria-disabled') === 'true').toBe(
        true,
      );
    });
  });

  it('DeletionStatusAlert — scope 별 문구 · `account` 실패는 action 0 · `all_data` 실패는 Try again', async () => {
    const onTryAgain = vi.fn();
    const harness = createHarness();
    const Wrapper = harness.wrapper;
    const { rerender } = render(
      <Wrapper>
        <DeletionStatusAlert surface="progress" scope="account" childFirstName="Emma" />
      </Wrapper>,
    );
    expect(screen.getByText(dataManagementCopy.accountProgress.title)).toBeDefined();
    expect(screen.getByText(dataManagementCopy.accountProgress.description('Emma'))).toBeDefined();
    expect(screen.queryByText(dataManagementCopy.progress.title)).toBeNull();

    rerender(
      <Wrapper>
        <DeletionStatusAlert surface="failed" scope="account" onTryAgain={onTryAgain} />
      </Wrapper>,
    );
    const failed = await screen.findByRole('alert');
    expect(failed.textContent).toContain(dataManagementCopy.accountFailed.title);
    expect(failed.textContent).toContain(dataManagementCopy.accountFailed.description);
    expect(
      within(failed).queryByRole('button', { name: dataManagementCopy.failed.action }),
    ).toBeNull();

    rerender(
      <Wrapper>
        <DeletionStatusAlert surface="failed" scope="all_data" onTryAgain={onTryAgain} />
      </Wrapper>,
    );
    expect(
      within(await screen.findByRole('alert')).getByRole('button', {
        name: dataManagementCopy.failed.action,
      }),
    ).toBeDefined();

    rerender(
      <Wrapper>
        <DeletionStatusAlert surface="progress" />
      </Wrapper>,
    );
    expect(screen.getByText(dataManagementCopy.progress.title)).toBeDefined();
  });
});

// ── 미가입 기기 draft 삭제 (QA-2R-004 · AC-8-37 · 38) ─────────────────────────────

function seedDraft(answers: OnboardingDraftAnswers, currentStep = 'child_info'): void {
  globalThis.localStorage.setItem(
    ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: 1,
      instrument: {
        code: DEFAULT_ONBOARDING_INSTRUMENT.code,
        version: DEFAULT_ONBOARDING_INSTRUMENT.version,
      },
      currentStep,
      answers,
      updatedAt: new Date().toISOString(),
    }),
  );
}

async function renderOnboarding(
  path: string,
  options: { signIn?: boolean; scenarios?: readonly string[] } = {},
): Promise<Harness> {
  const harness = createHarness({ initialEntries: [path], scenarios: options.scenarios ?? [] });
  if (options.signIn === true) {
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    harness.bundle.consentState.grant(MOCK_REQUIRED_CONSENT_TYPES);
  }
  mount(harness);
  if (options.signIn === true) {
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
    });
  }
  return harness;
}

const removeLink = () => screen.queryByRole('button', { name: deviceDataCopy.link });

describe('미가입 기기 draft 삭제 — 노출 조건 (AC-8-37)', () => {
  it('Step 1 Trial + draft 있음 → Trial 안내 바로 아래 TextLink (같은 묶음 · 안내 다음 형제)', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() });
    await renderOnboarding(onboardingStepPath('child-info'));
    const notice = (await screen.findByText(onboardingCopy.notices.trialTitle)).closest(
      '.haru-trial-notice',
    ) as HTMLElement;
    const link = within(notice).getByRole('button', { name: deviceDataCopy.link });
    expect(link.getAttribute('aria-haspopup')).toBe('dialog');
    expect(link.closest('.haru-trial-notice__footer')?.previousElementSibling?.className).toContain(
      'haru-alert',
    );
  });

  it('/onboarding 소개 Trial + draft 있음 → TextLink', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() }, 'reading_together');
    await renderOnboarding(ROUTES.onboarding.intro);
    await screen.findByText(onboardingCopy.notices.trialTitle);
    expect(removeLink()).not.toBeNull();
  });

  it('/onboarding/start 프로필 소개 Trial + draft 있음 → 안내 바로 아래 TextLink (`VG8-D-07` — `D8-2` ③, Step 1 과 같은 규칙)', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() });
    await renderOnboarding(ROUTES.onboarding.start);
    const notice = (await screen.findByText(onboardingCopy.notices.trialTitle)).closest(
      '.haru-trial-notice',
    ) as HTMLElement;
    const link = within(notice).getByRole('button', { name: deviceDataCopy.link });
    expect(link.closest('.haru-trial-notice__footer')?.previousElementSibling?.className).toContain(
      'haru-alert',
    );
  });

  it('/onboarding/start Trial + draft 없음 → TextLink 0', async () => {
    await renderOnboarding(ROUTES.onboarding.start);
    await screen.findByText(onboardingCopy.notices.trialTitle);
    expect(removeLink()).toBeNull();
  });

  it('draft 없음 → TextLink 0 · 안내 DOM 은 안내 1개뿐', async () => {
    await renderOnboarding(onboardingStepPath('child-info'));
    const notice = (await screen.findByText(onboardingCopy.notices.trialTitle)).closest(
      '.haru-trial-notice',
    ) as HTMLElement;
    expect(removeLink()).toBeNull();
    expect(notice.children).toHaveLength(1);
  });

  it('Step 1 에서 입력하면(draft 생김) TextLink 가 나타난다', async () => {
    await renderOnboarding(onboardingStepPath('child-info'));
    await screen.findByText(onboardingCopy.notices.trialTitle);
    expect(removeLink()).toBeNull();
    fireEvent.change(await screen.findByLabelText(new RegExp(onboardingCopy.childInfo.firstName)), {
      target: { value: 'Yuna' },
    });
    await waitFor(() => expect(removeLink()).not.toBeNull());
  });

  it('Trial 안내를 닫으면 TextLink 도 함께 숨는다', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() });
    await renderOnboarding(onboardingStepPath('child-info'));
    await screen.findByText(onboardingCopy.notices.trialTitle);
    expect(removeLink()).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: onboardingCopy.notices.dismiss }));
    await waitFor(() => expect(screen.queryByText(onboardingCopy.notices.trialTitle)).toBeNull());
    expect(removeLink()).toBeNull();
  });

  it('인증 사용자(온보딩 미완료) + draft 있음 → TextLink 0 (Trial 아님)', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() });
    await renderOnboarding(onboardingStepPath('child-info'), {
      signIn: true,
      scenarios: ['me:onboarding-incomplete'],
    });
    await waitFor(() => {
      expect(screen.queryByText(onboardingCopy.notices.trialTitle)).toBeNull();
    });
    expect(removeLink()).toBeNull();
  });
});

describe('미가입 기기 draft 삭제 — 확인 · 삭제 (AC-8-38)', () => {
  it('Keep → 변화 0 (draft 그대로 · 경로 그대로 · 포커스 = 링크)', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() });
    const harness = await renderOnboarding(onboardingStepPath('child-info'));
    await screen.findByText(onboardingCopy.notices.trialTitle);
    const link = removeLink() as HTMLElement;
    link.focus();
    fireEvent.click(link);
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(deviceDataCopy.dialog.title)).toBeDefined();
    expect(
      within(dialog).getByText(deviceDataCopy.dialog.description(MOCK_CHILD_FIRST_NAME)),
    ).toBeDefined();
    const keep = within(dialog).getByRole('button', { name: deviceDataCopy.dialog.cancelLabel });
    await waitFor(() => expect(document.activeElement).toBe(keep));
    fireEvent.click(keep);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).not.toBeNull();
    expect(pathname()).toBe(onboardingStepPath('child-info'));
    expect(harness.bundle.requestLog.entries()).toHaveLength(0);
    await waitFor(() => expect(document.activeElement).toBe(link));
  });

  it('Remove → draft 0 · 서버 요청 0 · /onboarding replace(빈 상태) · Toast neutral 1회 · 링크 사라짐', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() });
    const harness = await renderOnboarding(onboardingStepPath('child-info'));
    await screen.findByText(onboardingCopy.notices.trialTitle);
    fireEvent.click(removeLink() as HTMLElement);
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: deviceDataCopy.dialog.confirmLabel }),
    );

    await waitFor(() => expect(pathname()).toBe(ROUTES.onboarding.intro));
    expect(await screen.findByText(deviceDataCopy.removedToast)).toBeDefined();
    expect(screen.getAllByText(deviceDataCopy.removedToast)).toHaveLength(1);
    expect(
      screen.getByText(deviceDataCopy.removedToast).closest('.haru-toast')?.className,
    ).toContain('haru-toast--neutral');
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(harness.bundle.requestLog.entries()).toHaveLength(0);
    // 빈 상태 — 이름 없는 소개 제목 · 이어서 CTA 0 · 링크 0
    expect(await screen.findByText(onboardingCopy.intro.survey.titleWithoutName)).toBeDefined();
    expect(screen.queryByText(onboardingCopy.intro.survey.resume)).toBeNull();
    expect(removeLink()).toBeNull();
  });

  it('/onboarding 에서 Remove → 같은 경로에서 빈 상태로 다시 그린다', async () => {
    seedDraft({ child_info: createChildInfoDraftAnswers() }, 'reading_together');
    await renderOnboarding(ROUTES.onboarding.intro);
    expect(
      await screen.findByText(onboardingCopy.intro.survey.title(MOCK_CHILD_FIRST_NAME)),
    ).toBeDefined();
    fireEvent.click(removeLink() as HTMLElement);
    fireEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: deviceDataCopy.dialog.confirmLabel,
      }),
    );
    expect(await screen.findByText(onboardingCopy.intro.survey.titleWithoutName)).toBeDefined();
    expect(pathname()).toBe(ROUTES.onboarding.intro);
    expect(globalThis.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(removeLink()).toBeNull();
  });

  it('copy — 이름이 없으면 *your child*', () => {
    expect(deviceDataCopy.dialog.description(undefined)).toContain('about your child will');
    expect(deviceDataCopy.dialog.description('  ')).toContain('about your child will');
    expect(deviceDataCopy.dialog.description('Yuna')).toContain('about Yuna will');
  });
});

describe('동의 이력 — 미구현 확인 (AC-8-39)', () => {
  it('/settings/privacy route 0 · consentApi.history 0 · consent Mock 그룹 0', async () => {
    const harness = createHarness({ initialEntries: ['/settings/privacy'] });
    expect('history' in harness.bundle.clients.consents).toBe(false);
    expect(DEV_SCENARIO_GROUPS.map((group) => group.group)).not.toContain('consent');
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    mount(harness);
    expect(await screen.findByText(appCopy.notFound.title)).toBeDefined();
  });
});
