/**
 * `onboardingResumePathFrom` — Guard 가 "중도 복귀" 를 판정하는 근거 (`§11.19` 7-2).
 *
 * 판정 함수(`resolveGuardDecision`)는 저장소를 모른다. 저장소를 읽어 **경로**로 바꾸는 일만
 * 이 함수가 하고, 그래서 순수 함수로 전수 테스트가 가능하다.
 *
 * **새 저장소를 만들지 않았다** — 기존 `OnboardingDraftStore` 를 그대로 읽는다.
 */
import { describe, expect, it } from 'vitest';

import { createFixedClock } from '../../../shared/lib/clock';
import {
  createMemoryStorage,
  createOnboardingDraftStore,
  type OnboardingDraftStore,
} from '../../../shared/lib/onboarding-draft';
import { onboardingResumePathFrom } from '../useGuardDecision';

const NOW_MS = Date.parse('2026-10-03T00:00:00.000Z');
const NOW = new Date(NOW_MS).toISOString();
const CLOCK = createFixedClock(NOW_MS);

function makeStore(): OnboardingDraftStore {
  return createOnboardingDraftStore({ clock: CLOCK, storage: createMemoryStorage() });
}

describe('draft 없음 → null (프로필 안내로 보낸다)', () => {
  it('저장소가 비어 있으면 `null`', () => {
    expect(onboardingResumePathFrom(makeStore())).toBeNull();
  });

  it('응답이 하나도 없는 draft 는 중도 복귀로 보지 않는다', () => {
    const store = makeStore();

    store.write({
      schemaVersion: 1,
      instrument: { code: 'onboarding_v1_1', version: '2.0.0' },
      currentStep: 'reading_together',
      answers: {},
      updatedAt: NOW,
    });

    expect(onboardingResumePathFrom(store)).toBeNull();
  });
});

describe('draft 있음 → 그 지점의 경로', () => {
  it.each([
    ['child_info', '/onboarding/child-info'],
    ['reading_together', '/onboarding/reading-together'],
    ['books_and_interests', '/onboarding/books-and-interests'],
    ['growing_together', '/onboarding/growing-together'],
    ['capability_items', '/onboarding/capability-items'],
  ] as const)('currentStep=%s → %s', (currentStep, expected) => {
    const store = makeStore();

    store.write({
      schemaVersion: 1,
      instrument: { code: 'onboarding_v1_1', version: '2.0.0' },
      currentStep,
      answers: { child_info: { firstName: 'Nova' } },
      updatedAt: NOW,
    });

    expect(onboardingResumePathFrom(store)).toBe(expected);
  });

  it('카드 단계 응답만 있어도 복귀로 본다', () => {
    const store = makeStore();

    store.write({
      schemaVersion: 1,
      instrument: { code: 'onboarding_v1_1', version: '2.0.0' },
      currentStep: 'growing_together',
      answers: { reading_together: { storyComfort: 'wild_ride' } },
      updatedAt: NOW,
    });

    expect(onboardingResumePathFrom(store)).toBe('/onboarding/growing-together');
  });
});
