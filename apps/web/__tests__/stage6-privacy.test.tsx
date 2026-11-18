/**
 * Stage 6 `S6-F` privacy 프로브 (Plan §11.10 · AC-6-43 · AC-6-44 의 컴포넌트 부분).
 *
 * - AC-6-44 (`N6-07`): 아이 정보 수정(mutation cache) · 프로필 조회(query cache) · 재응답 상태 조회(query cache)가 남은
 *   상태에서 로그아웃 → `child-profile` · `survey-update` key 0 · 저장소에 수정·재응답 흔적 0.
 *   로그아웃 정리 순서 자체는 `shared/lib/__tests__/session-cleanup.test.ts`(AC-2-29) 가 고정한다 — 여기서는
 *   **Stage 6 key 가 실제로 그 정리에 포함되는지**를 실제 조립(`createHarness` + `AppRoutes`)으로 본다.
 * - AC-6-43: contract parse 실패 경로(Mock Adapter 가 요청을 거부) · 화면 저장 실패 경로에서 콘솔에 아이 이름 ·
 *   응답 값 0. 브라우저 경로(pageerror 포함)는 `e2e/stage6-cross-cutting.spec.ts`.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { childInfoEditCopy } from '../src/features/child-profile-edit';
import { surveyUpdateCopy } from '../src/features/survey-update';
import { MOCK_CHILD_ID } from '../src/mocks';
import { appCopy } from '../src/shared/copy/app-copy';
import { childCopy } from '../src/shared/copy/child-copy';
import { ROUTES } from '../src/shared/config/routes';
import { createHarness, type Harness } from '../src/test/harness';

/** 실제 아동 이름이 아닌 프로브 문자열 — 저장소 · 콘솔에서 찾는다. */
const PROBE_NAME = 'Probelina';
const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug'] as const;

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
}

async function renderAt(
  entries: readonly string[],
  scenarios: readonly string[] = [],
): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [...entries] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  return harness;
}

/** Stage 6 가 만드는 캐시 key 의 첫 마디 (`childProfileKeys.all` · `surveyUpdateKeys.all`). */
function stage6Entries(harness: Harness): { queries: unknown[]; mutations: unknown[] } {
  const isStage6 = (key: readonly unknown[] | undefined) =>
    key !== undefined && (key[0] === 'child-profile' || key[0] === 'survey-update');
  return {
    queries: harness.queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => isStage6(query.queryKey))
      .map((query) => query.queryKey),
    mutations: harness.queryClient
      .getMutationCache()
      .getAll()
      .filter((mutation) => isStage6(mutation.options.mutationKey))
      .map((mutation) => mutation.options.mutationKey),
  };
}

function storageDump(): string {
  return [
    ...Object.entries({ ...window.localStorage }),
    ...Object.entries({ ...window.sessionStorage }),
  ]
    .flat()
    .join('\n');
}

function spyConsole() {
  return CONSOLE_METHODS.map((method) => vi.spyOn(console, method).mockImplementation(() => {}));
}

function logged(spies: ReturnType<typeof spyConsole>): string {
  return spies.flatMap((spy) => spy.mock.calls.flat().map(String)).join('\n');
}

function firstNameInput(): HTMLInputElement {
  return screen.getByLabelText(new RegExp(childCopy.firstName)) as HTMLInputElement;
}

async function editReady(): Promise<void> {
  await waitFor(() => {
    expect(document.querySelector('.haru-child-info-edit [data-state="ready"]')).not.toBeNull();
  });
}

describe('로그아웃 → children · survey-update 캐시 0 · 저장소 흔적 0 (AC-6-44 · N6-07)', () => {
  it('아이 정보 수정 성공(mutation cache) · 프로필 조회(query cache) 후 로그아웃 → Stage 6 key 0', async () => {
    const harness = await renderAt([ROUTES.settings, ROUTES.settingsChild]);
    await editReady();
    fireEvent.change(firstNameInput(), { target: { value: PROBE_NAME } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: childInfoEditCopy.save }));
      await Promise.resolve();
    });
    await waitFor(() => {
      const entries = stage6Entries(harness);
      expect(entries.mutations.length).toBeGreaterThan(0);
      expect(entries.queries.length).toBeGreaterThan(0);
    });
    // 입력 중 · 저장 후 모두 기기 저장 0 (AC-6-21 과 같은 규칙)
    expect(storageDump()).not.toContain(PROBE_NAME);

    await act(async () => {
      await harness.bundle.authGateway.signOut();
    });

    await waitFor(() => {
      expect(stage6Entries(harness)).toStrictEqual({ queries: [], mutations: [] });
    });
    const dump = storageDump();
    expect(dump).not.toContain(PROBE_NAME);
    expect(dump.toLowerCase()).not.toContain('child-profile');
    expect(dump.toLowerCase()).not.toContain('survey-update');
  });

  it('설문 재응답 진입(query cache) 후 로그아웃 → survey-update key 0 · 저장소에 재응답 키 0', async () => {
    const harness = await renderAt(
      [ROUTES.settings, ROUTES.settingsChildSurvey],
      ['children:survey-update-draft'],
    );
    await screen.findByRole('button', { name: surveyUpdateCopy.intro.resume });
    await waitFor(() => {
      expect(stage6Entries(harness).queries.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await harness.bundle.authGateway.signOut();
    });

    await waitFor(() => {
      expect(stage6Entries(harness)).toStrictEqual({ queries: [], mutations: [] });
    });
    const dump = storageDump().toLowerCase();
    expect(dump).not.toContain('survey');
    expect(dump).not.toContain('draft');
  });
});

describe('콘솔 — parse 실패 · 저장 실패 경로에도 아이 이름 · 응답 값 0 (AC-6-43)', () => {
  it('Mock Adapter 가 schema 위반 요청(이름 41자)을 거부해도 이름 원문이 콘솔에 남지 않는다', async () => {
    const spies = spyConsole();
    const harness = createHarness();
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    const name = `${PROBE_NAME}${'x'.repeat(41 - PROBE_NAME.length)}`;
    expect(name.length).toBe(41);

    await expect(
      harness.bundle.clients.children.update({
        childId: MOCK_CHILD_ID,
        body: { firstName: name },
      }),
    ).rejects.toBeDefined();

    expect(logged(spies)).not.toContain(PROBE_NAME);
  });

  it('재응답 제출 schema 위반(빈 body) 거부 경로 — 콘솔에 응답 값 · 이름 0', async () => {
    const spies = spyConsole();
    const harness = createHarness();
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    const profile = await harness.bundle.clients.children.getProfile({ childId: MOCK_CHILD_ID });

    await expect(
      harness.bundle.clients.children.submitSurveyUpdate(
        // 의도적 schema 위반 — Adapter 경계 parse 가 거부해야 한다.
        { childId: MOCK_CHILD_ID, body: {} as never },
        { idempotencyKey: '11111111-1111-4111-8111-111111111111' },
      ),
    ).rejects.toBeDefined();

    const output = logged(spies);
    expect(output).not.toContain(profile.child.firstName);
    expect(output).not.toContain(profile.persona.name);
  });

  for (const scenario of ['children.update:error', 'children.update:offline'] as const) {
    it(`화면 저장 실패 ${scenario} — 콘솔에 바꾼 이름 0`, async () => {
      const spies = spyConsole();
      await renderAt([ROUTES.settings, ROUTES.settingsChild], [scenario]);
      await editReady();
      fireEvent.change(firstNameInput(), { target: { value: PROBE_NAME } });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: childInfoEditCopy.save }));
        await Promise.resolve();
      });
      await screen.findByRole('alert');
      expect(firstNameInput().value).toBe(PROBE_NAME);
      expect(logged(spies)).not.toContain(PROBE_NAME);
      expect(storageDump()).not.toContain(PROBE_NAME);
    });
  }
});
