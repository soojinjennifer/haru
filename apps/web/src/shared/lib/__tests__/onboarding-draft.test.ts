/**
 * Trial 로컬 draft 저장소 — 결정 **D-3** 검증 (AC-2-20 · AC-2-30).
 *
 * Plan §8.3: "Trial 로컬 draft 는 scenario key 가 아니라 **로컬 저장소 테스트**" —
 * 저장 / 복원 / 만료 / `schemaVersion` 불일치 / 손상 / 삭제.
 */
import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_DRAFT_MAX_AGE_DAYS,
  ONBOARDING_DRAFT_SCHEMA_VERSION,
  ONBOARDING_INSTRUMENT_CODE,
  ONBOARDING_INSTRUMENT_VERSION,
  type OnboardingDraft,
} from '@haru/contracts';

import { createFixedClock } from '../clock';
import {
  createMemoryStorage,
  createOnboardingDraftStore,
  ONBOARDING_DRAFT_STORAGE_KEY,
} from '../onboarding-draft';

const NOW = Date.UTC(2026, 8, 26, 12, 0, 0);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DRAFT: OnboardingDraft = {
  schemaVersion: ONBOARDING_DRAFT_SCHEMA_VERSION,
  instrument: { code: ONBOARDING_INSTRUMENT_CODE, version: ONBOARDING_INSTRUMENT_VERSION },
  currentStep: 'books',
  answers: { child_info: { firstName: 'Nova' }, goals: { growthGoals: ['emotion_regulation'] } },
  updatedAt: new Date(NOW).toISOString(),
};

function makeStore(initial: Readonly<Record<string, string>> = {}, nowMs = NOW) {
  const storage = createMemoryStorage(initial);
  const store = createOnboardingDraftStore({ clock: createFixedClock(nowMs), storage });

  return { storage, store };
}

describe('저장 · 복원 (AC-2-20)', () => {
  it('결정 D-3 이 정한 키를 쓴다', () => {
    expect(ONBOARDING_DRAFT_STORAGE_KEY).toBe('haru.onboarding.draft.v1');
  });

  it('쓴 draft 를 같은 단계·같은 응답으로 되읽는다', () => {
    const { store } = makeStore();
    store.write(DRAFT);

    const result = store.read();
    expect(result.discarded).toBeNull();
    expect(result.draft?.currentStep).toBe('books');
    expect(result.draft?.answers.child_info?.firstName).toBe('Nova');
    expect(result.draft?.answers.goals?.growthGoals).toStrictEqual(['emotion_regulation']);
  });

  it('저장된 값이 없으면 draft 도 폐기 사유도 없다', () => {
    expect(makeStore().store.read()).toStrictEqual({ draft: null, discarded: null });
  });

  it('쓰기에서도 schema parse 한다 — 잘못된 값은 저장소에 들어가지 않는다', () => {
    const { store, storage } = makeStore();

    expect(() => {
      store.write({ ...DRAFT, currentStep: 'profile' } as unknown as OnboardingDraft);
    }).toThrow();
    expect(storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
  });
});

describe('폐기 시점 ③④⑤ (AC-2-30)', () => {
  it('보관 상한(30일)을 넘기면 폐기하고 사유를 돌려준다', () => {
    const stale = {
      ...DRAFT,
      updatedAt: new Date(NOW - (ONBOARDING_DRAFT_MAX_AGE_DAYS * MS_PER_DAY + 1)).toISOString(),
    };
    const { store, storage } = makeStore({
      [ONBOARDING_DRAFT_STORAGE_KEY]: JSON.stringify(stale),
    });

    expect(store.read()).toStrictEqual({ draft: null, discarded: 'expired' });
    // 폐기는 저장소에서도 지운다 — 다음 진입에서 같은 안내가 반복되지 않는다.
    expect(storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('보관 상한 경계(정확히 30일)는 아직 유효하다', () => {
    const edge = {
      ...DRAFT,
      updatedAt: new Date(NOW - ONBOARDING_DRAFT_MAX_AGE_DAYS * MS_PER_DAY).toISOString(),
    };
    const { store } = makeStore({ [ONBOARDING_DRAFT_STORAGE_KEY]: JSON.stringify(edge) });

    expect(store.read().discarded).toBeNull();
  });

  it('schemaVersion 이 다르면 폐기한다', () => {
    const { store, storage } = makeStore({
      [ONBOARDING_DRAFT_STORAGE_KEY]: JSON.stringify({ ...DRAFT, schemaVersion: 99 }),
    });

    expect(store.read()).toStrictEqual({ draft: null, discarded: 'unreadable' });
    expect(storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('JSON 이 깨져 있으면 폐기한다', () => {
    const { store } = makeStore({ [ONBOARDING_DRAFT_STORAGE_KEY]: '{not json' });

    expect(store.read()).toStrictEqual({ draft: null, discarded: 'unreadable' });
  });

  it('schema 를 통과하지 못하는 응답이 섞여 있으면 폐기한다', () => {
    const { store } = makeStore({
      [ONBOARDING_DRAFT_STORAGE_KEY]: JSON.stringify({
        ...DRAFT,
        answers: { goals: { growthGoals: ['not_a_capability'] } },
      }),
    });

    expect(store.read().discarded).toBe('unreadable');
  });
});

describe('폐기 시점 ①② — 명시 삭제', () => {
  it('clear() 가 키를 제거한다 (제출 성공 · 로그아웃)', () => {
    const { store, storage } = makeStore();
    store.write(DRAFT);
    store.clear();

    expect(storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(store.read().draft).toBeNull();
  });
});

describe('저장소를 쓸 수 없는 환경', () => {
  it('읽기·쓰기가 던지더라도 화면을 막지 않는다', () => {
    const broken: Storage = {
      length: 0,
      clear: () => undefined,
      key: () => null,
      getItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const store = createOnboardingDraftStore({ clock: createFixedClock(NOW), storage: broken });

    expect(store.read()).toStrictEqual({ draft: null, discarded: null });
    expect(() => {
      store.write(DRAFT);
    }).not.toThrow();
    expect(() => {
      store.clear();
    }).not.toThrow();
  });
});

describe('instrument 참조 (결정 D-A 구조 제약 ④)', () => {
  it('draft 가 수집에 쓰인 instrument code·version 을 함께 보관한다', () => {
    const { store } = makeStore();
    store.write(DRAFT);

    expect(store.read().draft?.instrument).toStrictEqual({
      code: ONBOARDING_INSTRUMENT_CODE,
      version: ONBOARDING_INSTRUMENT_VERSION,
    });
  });
});
