/**
 * `childDraft` — **`R-01` Privacy Critical 경로의 단위 테스트** (`§11.19` Orchestrator 지적).
 *
 * 가입 화면에서 받은 아이 정보는 "화면에서 입력받는 것" 과 "서버로 전송하는 것" 이 분리되어야
 * 한다 (`stage-3-approvals.md` §11.5). 이 파일이 고정하는 것:
 *
 * 1. `saveChildDraft` 가 **네트워크 호출을 하지 않는다** (서버 전송 0건)
 * 2. 저장 → 읽기 왕복이 값을 보존한다
 * 3. `store.clear()` 후 `readChildDraft` 가 비어 있다 (로그아웃·데이터 삭제 정리 보장)
 * 4. 가입 요청 payload 에 아이 필드가 **0건** (`findChildDataKeys` 재사용)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ONBOARDING_INSTRUMENT_CODE,
  OnboardingDraftSchema,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import { createMockApiClientsBundle } from '../../../../mocks';
import { CHILD_DATA_KEYS, findChildDataKeys } from '../../../../mocks/request-log';
import { createImmediateTimer } from '../../../../shared/api/helpers';
import { EMPTY_CHILD_INFO_FORM, partialChildInfoAnswers } from '../../../../shared/lib/child-info';
import { createFixedClock } from '../../../../shared/lib/clock';
import {
  createMemoryStorage,
  createOnboardingDraftStore,
  ONBOARDING_DRAFT_STORAGE_KEY,
  type OnboardingDraftStore,
} from '../../../../shared/lib/onboarding-draft';
import { hasChildDraftValues, readChildDraft, saveChildDraft } from '../childDraft';

const NOW_MS = Date.parse('2026-10-03T00:00:00.000Z');
const NOW = new Date(NOW_MS).toISOString();
const CLOCK = createFixedClock(NOW_MS);

/** 가상 아이 정보 — 실제 아동 데이터가 아니다. */
const CHILD: NonNullable<OnboardingDraftAnswers['child_info']> = {
  firstName: 'Nova',
  lastName: 'Kim',
  birthYearMonth: '2021-04',
  gender: 'girl',
};

function makeStore(): { store: OnboardingDraftStore; storage: Storage } {
  const storage = createMemoryStorage();

  return { store: createOnboardingDraftStore({ clock: CLOCK, storage }), storage };
}

describe('1. 서버로 나가지 않는다 (`R-01` · `AC-2R-05`)', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    fetchSpy.mockReset();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('`saveChildDraft` 가 `fetch` 를 호출하지 않는다', () => {
    const { store } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('`readChildDraft` 도 `fetch` 를 호출하지 않는다', () => {
    const { store } = makeStore();
    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });
    fetchSpy.mockReset();

    expect(readChildDraft(store)?.firstName).toBe('Nova');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('값은 **로컬 저장소 한 경로**에만 들어간다 (신규 저장소 0건)', () => {
    const { store, storage } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });

    expect(storage.length).toBe(1);
    expect(storage.key(0)).toBe(ONBOARDING_DRAFT_STORAGE_KEY);
  });
});

describe('2. 저장 → 읽기 왕복이 값을 보존한다', () => {
  it('이름 · 생년월 · 성별이 그대로 돌아온다', () => {
    const { store } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });

    expect(readChildDraft(store)).toStrictEqual({ ...CHILD });
  });

  it('저장된 값이 `OnboardingDraftSchema` 를 통과한다 (손상된 값을 두지 않는다)', () => {
    const { store, storage } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });
    const raw = storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);

    expect(raw).not.toBeNull();
    const parsed = OnboardingDraftSchema.safeParse(JSON.parse(raw ?? 'null'));
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.instrument.code).toBe(ONBOARDING_INSTRUMENT_CODE);
    expect(parsed.success && parsed.data.currentStep).toBe('child_info');
    expect(parsed.success && parsed.data.updatedAt).toBe(NOW);
  });

  it('기존 draft 의 instrument 참조·진행 단계·다른 단계 응답을 보존한다', () => {
    const { store } = makeStore();

    store.write({
      schemaVersion: 1,
      instrument: { code: 'onboarding_v9', version: '9.0.0' },
      currentStep: 'reading_together',
      answers: { reading_together: { storyComfort: 'wild_ride' } },
      updatedAt: NOW,
    });

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });

    const draft = store.read().draft;
    expect(draft?.instrument).toStrictEqual({ code: 'onboarding_v9', version: '9.0.0' });
    expect(draft?.currentStep).toBe('reading_together');
    expect(draft?.answers.reading_together?.storyComfort).toBe('wild_ride');
    expect(draft?.answers.child_info?.firstName).toBe('Nova');
  });

  /**
   * `QA-2R-009` 회귀 — 가입 화면에는 **언어 입력이 없다**. 그 화면의 저장이 Trial 에서 고른
   * 언어를 지우면 안 된다. 동의 직후 Guard 가 저장된 단계로 되돌리므로(`§11.19` 7-2)
   * 사용자는 `About your child` 를 다시 지나지 않고, 알아챌 방법이 없다.
   */
  it('언어 입력이 없는 화면의 저장이 기존 언어를 지우지 않는다 (`QA-2R-009`)', () => {
    const { store } = makeStore();

    saveChildDraft({
      store,
      clock: CLOCK,
      childInfo: { ...CHILD, languageEnvironment: ['english'], readingRoutine: 'daily' },
    });

    /*
      가입 화면이 실제로 만드는 payload 다 — 그 화면의 폼에는 **언어·독서 루틴 칸이 없어서**
      항상 빈 값이다. 리터럴을 적지 않고 `partialChildInfoAnswers` 를 거쳐야 회귀를 잡는다.
    */
    saveChildDraft({
      store,
      clock: CLOCK,
      childInfo: partialChildInfoAnswers({
        ...EMPTY_CHILD_INFO_FORM,
        firstName: 'Nova',
        birthYear: '2021',
        birthMonth: '04',
        gender: 'girl',
      }),
    });

    expect(readChildDraft(store)?.languageEnvironment).toStrictEqual(['english']);
    expect(readChildDraft(store)?.readingRoutine).toBe('daily');
  });

  it('다시 저장하면 입력한 필드만 덮어쓴다 (나머지는 남는다)', () => {
    const { store } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });
    saveChildDraft({ store, clock: CLOCK, childInfo: { firstName: 'Suri' } });

    expect(readChildDraft(store)?.firstName).toBe('Suri');
    expect(readChildDraft(store)?.birthYearMonth).toBe('2021-04');
  });

  it('입력이 하나도 없으면 draft 를 만들지 않는다 (`§11.19` 7-2 — 첫 도달 판정)', () => {
    const { store, storage } = makeStore();

    // 빈 폼의 `partialChildInfoAnswers` 결과 모양이다.
    saveChildDraft({
      store,
      clock: CLOCK,
      childInfo: { gender: null, languageEnvironment: [] },
    });

    expect(storage.length).toBe(0);
    expect(readChildDraft(store)).toBeUndefined();
    expect(hasChildDraftValues({ gender: null, languageEnvironment: [] })).toBe(false);
    expect(hasChildDraftValues({ firstName: '  ', gender: null })).toBe(false);
    expect(hasChildDraftValues({ gender: 'girl' })).toBe(true);
    expect(hasChildDraftValues({ birthYearMonth: '2021-04' })).toBe(true);
  });
});

describe('3. 로그아웃·데이터 삭제 정리 (`rules/architecture.md` §9)', () => {
  it('`store.clear()` 후 `readChildDraft` 가 비어 있다', () => {
    const { store, storage } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });
    expect(readChildDraft(store)?.firstName).toBe('Nova');

    store.clear();

    expect(readChildDraft(store)).toBeUndefined();
    expect(storage.getItem(ONBOARDING_DRAFT_STORAGE_KEY)).toBeNull();
    expect(storage.length).toBe(0);
  });

  it('아이 이름이 남아 있는 저장 키가 하나도 없다', () => {
    const { store, storage } = makeStore();

    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });
    store.clear();

    const remaining = Array.from({ length: storage.length }, (_unused, index) =>
      storage.getItem(storage.key(index) ?? ''),
    ).join('');

    expect(remaining).not.toContain('Nova');
  });
});

describe('4. 가입 요청 payload 에 아이 필드가 0건 (`AC-2R-13` · Critical)', () => {
  it('`signUpWithEmail` 요청 로그에 아동 데이터 키가 없다 — draft 에는 있다', async () => {
    const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
    const { store } = makeStore();

    // 화면 순서와 같다: 아이 값을 로컬에 먼저 쓰고, 그 다음 가입 요청을 보낸다.
    saveChildDraft({ store, clock: CLOCK, childInfo: { ...CHILD } });

    await bundle.authGateway.signUpWithEmail({
      caregiverName: 'Sam Rivera',
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });

    const entries = bundle.requestLog.entries();

    // 검사가 헛돌지 않도록: 가입 요청이 실제로 기록되어 있다.
    expect(entries.map((entry) => entry.operation)).toContain('AuthGateway.signUpWithEmail');
    expect(findChildDataKeys(entries)).toStrictEqual([]);

    // 같은 값이 **로컬에는** 있다 — 분리가 성립했다는 증거다.
    expect(readChildDraft(store)?.firstName).toBe('Nova');
  });

  it('금칙 키 목록이 아이 필드를 실제로 덮는다 (검사기 자체의 회귀 방지)', () => {
    for (const key of ['firstName', 'lastName', 'birthYearMonth', 'gender']) {
      expect(CHILD_DATA_KEYS as readonly string[]).toContain(key);
    }

    // 같은 값이 요청 payload 에 있었다면 검사기가 잡아낸다.
    expect(
      findChildDataKeys([{ operation: 'POST /x', payload: { ...CHILD } }]).length,
    ).toBeGreaterThan(0);
  });
});
