/**
 * Stage 4b QA 독립 단정 (stage-qa-agent) — AC-4-124 ③:
 * 오프라인 캐시(`isCached`) → 온라인 복구(조회 성공)로 바뀌면 Start Session 이 활성 규칙(AC-4-38)으로 돌아가고
 * `aria-describedby` 가 배너를 더 이상 가리키지 않는다 (dangling id 0). 구현자 테스트에는 이 전환 단정이 없다.
 * Product Code 수정 0 — 앱 조립(`createHarness` + `AppRoutes`)을 그대로 쓰고, 조회 성공은 같은 Mock 의
 * 기본 scenario 응답으로 바꿔 끼운다.
 */
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { AppRoutes } from '/Users/soojin/dev/haru/apps/web/src/app/router';
import { activityDeckCopy } from '/Users/soojin/dev/haru/apps/web/src/features/activity-card-deck';
import { applyActivityCardCacheSeed } from '/Users/soojin/dev/haru/apps/web/src/mocks';
import { createSystemClock } from '/Users/soojin/dev/haru/apps/web/src/shared/lib/clock';
import { createHarness } from '/Users/soojin/dev/haru/apps/web/src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

afterEach(() => {
  globalThis.localStorage.clear();
});

function startButton(): HTMLElement {
  const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
  return within(front).getByRole('button', { name: activityDeckCopy.card.startSession.label });
}

it('AC-4-124 ③ offline-cached → 온라인 조회 성공: Start Session 활성 · describedby 해제 · dangling id 0', async () => {
  // 정상 응답 공급원 — 같은 Mock 번들의 기본 scenario
  const online = createHarness();
  await online.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const me = await online.bundle.clients.me.get();
  const freshCard = await online.bundle.clients.activities.getTodayCard({
    childId: me.child?.id ?? '',
  });

  const harness = createHarness({ scenarios: ['activity-cards:offline-cached-card'] });
  applyActivityCardCacheSeed({ store: harness.bundle.store, deviceClock: createSystemClock() });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );
  await screen.findByText(activityDeckCopy.states.cachedTitle);
  await waitFor(() => {
    expect(startButton().getAttribute('aria-disabled')).toBe('true');
  });
  const cachedDescribedBy = startButton().getAttribute('aria-describedby');
  expect(cachedDescribedBy).not.toBeNull();

  // 온라인 복구 — 조회가 성공한다
  vi.spyOn(harness.bundle.clients.activities, 'getTodayCard').mockResolvedValue(freshCard);
  await act(async () => {
    await harness.queryClient.invalidateQueries();
  });

  await waitFor(() => {
    expect(screen.queryByText(activityDeckCopy.states.cachedTitle)).toBeNull();
  });
  const button = startButton();
  expect(button.getAttribute('aria-disabled')).toBeNull();
  const describedBy = button.getAttribute('aria-describedby');
  for (const id of (describedBy ?? '').split(/\s+/).filter(Boolean)) {
    expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
  }
  expect(describedBy === null || !describedBy.includes(cachedDescribedBy ?? '__none__')).toBe(true);
});
