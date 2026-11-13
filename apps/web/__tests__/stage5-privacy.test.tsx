/**
 * Stage 5 `S5-D` privacy 프로브 (Plan §5.5 · AC-5-46 · AC-5-47 의 컴포넌트 부분).
 *
 * - AC-5-47: 회고 제출(mutation cache) · 분석 조회(query cache) 가 남은 상태에서 로그아웃 → 둘 다 0 · 저장소에 회고 흔적 0.
 *   로그아웃 정리 순서 자체는 `shared/lib/__tests__/session-cleanup.test.ts`(AC-2-29) 가 고정한다 — 여기서는
 *   **Stage 5 key 가 실제로 그 정리에 포함되는지**를 실제 조립(`createHarness`)으로 본다.
 * - AC-5-46: contract parse 실패 경로(Mock Adapter 가 요청을 거부) 에서도 콘솔에 `note` 가 남지 않는다.
 *   제출 실패(`error`) 경로는 `reflection-card.test.tsx` "Privacy", 브라우저 경로는 `e2e/stage5-cross-cutting.spec.ts`.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { reflectionCopy } from '../src/features/reflection';
import { sessionFeedbackCopy } from '../src/features/session-feedback';
import { appCopy } from '../src/shared/copy/app-copy';
import { createHarness, type Harness } from '../src/test/harness';

const HISTORY_ANALYZED = '77777777-7777-4777-8777-000000000001';
const HISTORY_ANALYZING = '77777777-7777-4777-8777-000000000002';
const NOTE = 'private-stage5-probe-note';

const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug'] as const;

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(
      screen
        .queryAllByRole('status', { name: appCopy.guard.loadingLabel })
        .filter((node) => node.closest('.haru-session') === null),
    ).toHaveLength(0);
  });
}

async function renderAt(path: string, scenarios: readonly string[] = []): Promise<Harness> {
  const harness = createHarness({ scenarios, initialEntries: [path] });
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

/** Stage 5 가 만드는 캐시 key 의 첫 마디 (`reflectionKeys.all` · `analysisKeys.all`). */
function stage5Entries(harness: Harness): { queries: unknown[]; mutations: unknown[] } {
  const isStage5 = (key: readonly unknown[] | undefined) =>
    key !== undefined && (key[0] === 'reflections' || key[0] === 'analysis');
  return {
    queries: harness.queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => isStage5(query.queryKey))
      .map((query) => query.queryKey),
    mutations: harness.queryClient
      .getMutationCache()
      .getAll()
      .filter((mutation) => isStage5(mutation.options.mutationKey))
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

describe('로그아웃 → 회고 · 분석 캐시 0 · 저장소 흔적 0 (AC-5-47)', () => {
  it('회고 제출 성공(mutation cache) 후 로그아웃 → Stage 5 mutation · query 0', async () => {
    const harness = await renderAt(`/session/${HISTORY_ANALYZED}/complete`);
    await screen.findByRole('region', { name: reflectionCopy.title('Emma') });
    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    fireEvent.change(screen.getByRole('textbox', { name: reflectionCopy.notePlaceholder }), {
      target: { value: NOTE },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: reflectionCopy.save }));
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(stage5Entries(harness).mutations.length).toBeGreaterThan(0);
    });
    expect(storageDump()).not.toContain(NOTE);

    await act(async () => {
      await harness.bundle.authGateway.signOut();
    });

    await waitFor(() => {
      expect(stage5Entries(harness)).toStrictEqual({ queries: [], mutations: [] });
    });
    const dump = storageDump();
    expect(dump).not.toContain(NOTE);
    expect(dump.toLowerCase()).not.toContain('reflection');
  });

  it('피드백 화면 분석 조회(query cache) 후 로그아웃 → Stage 5 query 0', async () => {
    const harness = await renderAt(`/session/${HISTORY_ANALYZING}/feedback`, [
      'analysis:analysis-completed',
    ]);
    await screen.findByRole('heading', { level: 1, name: sessionFeedbackCopy.title });
    await waitFor(() => {
      expect(stage5Entries(harness).queries.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await harness.bundle.authGateway.signOut();
    });

    await waitFor(() => {
      expect(stage5Entries(harness)).toStrictEqual({ queries: [], mutations: [] });
    });
    const dump = storageDump().toLowerCase();
    expect(dump).not.toContain('analysis');
    expect(dump).not.toContain('feedback');
  });
});

describe('콘솔 — contract parse 실패 경로에도 note 0 (AC-5-46)', () => {
  it('Mock Adapter 가 schema 위반 요청(note 501자)을 거부해도 note 원문이 콘솔에 남지 않는다', async () => {
    const spies = CONSOLE_METHODS.map((method) =>
      vi.spyOn(console, method).mockImplementation(() => {}),
    );
    const harness = createHarness();
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    const note = `${NOTE}-${'x'.repeat(501 - NOTE.length - 1)}`;
    expect(note.length).toBe(501);

    await expect(
      harness.bundle.clients.reflections.submit(
        { sessionId: HISTORY_ANALYZED, body: { rating: 3, checks: [], note } },
        { idempotencyKey: '11111111-1111-4111-8111-111111111111' },
      ),
    ).rejects.toBeDefined();

    const logged = spies.flatMap((spy) => spy.mock.calls.flat().map(String)).join('\n');
    expect(logged).not.toContain(NOTE);
  });
});
