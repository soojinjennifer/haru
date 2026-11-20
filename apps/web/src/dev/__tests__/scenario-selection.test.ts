/**
 * Scenario Panel 로직 — 우선순위 해석 · 직렬화 · URL 동기화 (Plan §16 D-5 ②).
 *
 * 패널이 보여 주는 값과 Mock 이 실제로 쓰는 값이 **같은 해석기**에서 나오는지 확인한다.
 */
import { describe, expect, it } from 'vitest';

import { healthScenarioGroup } from '../../mocks/health/MockHealthApi';
import { SCENARIO_SESSION_KEY } from '../../mocks/scenarios';
import { DEV_SCENARIO_GROUPS, statesScenarioGroup } from '../scenario-panel/devScenarios';
import {
  persistSelection,
  resolveSelection,
  serializeSelection,
  withGroupKey,
  withScenarioParam,
} from '../scenario-panel/scenario-selection';

describe('resolveSelection — 우선순위 (URL > panel > env > success)', () => {
  it('아무것도 없으면 전 그룹이 기본값이다', () => {
    expect(resolveSelection(DEV_SCENARIO_GROUPS, {})).toStrictEqual({
      health: 'success',
      home: 'success',
      'activity-cards': 'success',
      library: 'success',
      books: 'success',
      'session-completion': 'success',
      reflections: 'success',
      analysis: 'success',
      children: 'success',
      progress: 'success',
      reports: 'success',
      'report-pdf': 'success',
      'highlight-clips': 'success',
      __states: 'success',
    });
  });

  it('URL 이 패널·env 를 이긴다', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, {
      search: '?scenario=health:error',
      panelValue: 'health:loading',
      envValue: 'health:offline',
    });

    expect(selection['health']).toBe('error');
  });

  it('패널 값이 env 를 이긴다', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, {
      panelValue: 'health:loading',
      envValue: 'health:offline',
    });

    expect(selection['health']).toBe('loading');
  });

  it('그룹을 생략한 wildcard 는 전 그룹에 적용된다', () => {
    expect(resolveSelection(DEV_SCENARIO_GROUPS, { search: '?scenario=error' })).toStrictEqual({
      health: 'error',
      home: 'error',
      'activity-cards': 'error',
      library: 'error',
      books: 'error',
      // `session-completion` 에는 `error` 가 없다 — 그룹 기본값으로 떨어진다.
      'session-completion': 'success',
      reflections: 'error',
      analysis: 'error',
      children: 'error',
      progress: 'error',
      reports: 'error',
      'report-pdf': 'error',
      'highlight-clips': 'error',
      __states: 'error',
    });
  });

  it('그룹별 다중 지정을 함께 해석한다', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, {
      search: '?scenario=health:retry,__states:empty',
    });

    expect(selection).toStrictEqual({
      health: 'retry',
      home: 'success',
      'activity-cards': 'success',
      library: 'success',
      books: 'success',
      'session-completion': 'success',
      reflections: 'success',
      analysis: 'success',
      children: 'success',
      progress: 'success',
      reports: 'success',
      'report-pdf': 'success',
      'highlight-clips': 'success',
      __states: 'empty',
    });
  });

  it('그룹에 없는 key 는 그룹 기본값으로 떨어진다 (health 에는 empty 가 없다)', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, { search: '?scenario=empty' });

    expect(selection['health']).toBe('success');
    expect(selection['__states']).toBe('empty');
  });
});

describe('serializeSelection / withGroupKey', () => {
  it('선택을 group:key 목록으로 직렬화한다', () => {
    expect(serializeSelection({ health: 'error', __states: 'empty' })).toBe(
      'health:error,__states:empty',
    );
  });

  it('한 그룹만 바꾼 새 선택을 만든다 (원본 불변)', () => {
    const before = { health: 'success', __states: 'success' };
    const after = withGroupKey(before, 'health', 'offline');

    expect(after).toStrictEqual({ health: 'offline', __states: 'success' });
    expect(before['health']).toBe('success');
  });

  it('직렬화 → 재해석이 같은 선택을 만든다 (URL 공유 재현성)', () => {
    const selection = {
      health: 'retry',
      home: 'error',
      'activity-cards': 'books-exhausted',
      library: 'retry',
      books: 'no-reason',
      'session-completion': 'reflection-submitted',
      reflections: 'invalid-transition',
      analysis: 'analysis-pending',
      children: 'survey-update-draft',
      progress: 'progress-multi-week',
      reports: 'report-deferred-first',
      'report-pdf': 'share-unsupported',
      'highlight-clips': 'clip-url-expired',
      __states: 'error',
    };
    const restored = resolveSelection(DEV_SCENARIO_GROUPS, {
      search: `?scenario=${serializeSelection(selection)}`,
    });

    expect(restored).toStrictEqual(selection);
  });
});

describe('withScenarioParam', () => {
  it('scenario 파라미터를 설정한다', () => {
    expect(withScenarioParam('https://x.invalid/__dev/ui/states', 'health:error')).toBe(
      'https://x.invalid/__dev/ui/states?scenario=health%3Aerror',
    );
  });

  it('기존 값을 덮어쓴다', () => {
    expect(withScenarioParam('https://x.invalid/?scenario=health%3Aerror', 'health:success')).toBe(
      'https://x.invalid/?scenario=health%3Asuccess',
    );
  });

  it('빈 값이면 파라미터를 제거한다 (reset)', () => {
    expect(withScenarioParam('https://x.invalid/?scenario=health%3Aerror&a=1', '')).toBe(
      'https://x.invalid/?a=1',
    );
  });

  it('다른 쿼리 파라미터는 건드리지 않는다', () => {
    expect(withScenarioParam('https://x.invalid/?a=1', 'health:error')).toContain('a=1');
  });
});

describe('persistSelection', () => {
  function createStorage(): Storage {
    const map = new Map<string, string>();

    return {
      get length() {
        return map.size;
      },
      clear: () => {
        map.clear();
      },
      getItem: (key: string) => map.get(key) ?? null,
      key: (index: number) => Array.from(map.keys())[index] ?? null,
      removeItem: (key: string) => {
        map.delete(key);
      },
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
    };
  }

  it('선택을 sessionStorage 에 기록한다', () => {
    const storage = createStorage();
    persistSelection('health:error', storage);

    expect(storage.getItem(SCENARIO_SESSION_KEY)).toBe('health:error');
  });

  it('빈 값이면 키를 지운다', () => {
    const storage = createStorage();
    storage.setItem(SCENARIO_SESSION_KEY, 'health:error');
    persistSelection('', storage);

    expect(storage.getItem(SCENARIO_SESSION_KEY)).toBeNull();
  });

  it('저장소 접근이 막혀도 예외를 던지지 않는다', () => {
    const blocked = {
      ...createStorage(),
      setItem: () => {
        throw new Error('blocked');
      },
    } as Storage;

    expect(() => {
      persistSelection('health:error', blocked);
    }).not.toThrow();
  });
});

describe('DEV_SCENARIO_GROUPS — Catalogue 준수 (AC-1-40)', () => {
  /** `docs/API_CONTRACTS.md` §5.4 machine key 중 공통 6종. */
  const CATALOGUE_COMMON = ['success', 'loading', 'empty', 'error', 'retry', 'offline'];

  /**
   * Stage 3 이 쓰는 특화 key (Plan §8.2 — 전부 Catalogue 기존 값, **신규 key 0건**).
   * `offline-cached-card` 는 Stage 4 `S4-J`(이월 `QA-3-002`)에서 `activity-cards` 그룹에 등록됐다.
   * `push-permission-denied` 는 플랫폼 포트 그룹(`push`)이라 이 패널에 없다 (URL 로 전환).
   */
  const CATALOGUE_STAGE_3 = [
    'session-already-active',
    'offline-cached-card',
    'reread-option',
    'books-exhausted',
    'onboarding-incomplete',
    // Home 재구현 — `★ Save` (`API_CONTRACTS.md` §5.4 catalogue 에 등재된 key).
    // `conversation-only-option` 은 그 옵션이 폐지되면서 사라졌다 (approvals §12.12).
    'book-saved',
    /*
     * Library 1라운드 (Library Plan §8.2). **섹션별 EMPTY 가 핵심**이다 —
     * `favorites-empty` 는 "저장 전 기본 상태" 로 가장 흔한 실제 상태다.
     * `shelf-partial` · `unrated` · `reading-now-none` · `favorites-empty` 는
     * **Figma 에 없는 상태**라 Mock 이 유일한 검증 수단이다 (Design Spec §7.4).
     */
    'favorites-empty',
    'finished-empty',
    'curated-empty',
    'reading-now-none',
    'shelf-partial',
    'unrated',
    'user-entered-book',
    'gift-pending',
    'gift-duplicate',
    // Library 2라운드-2 — `/library/add` 중복 등록 (`API_CONTRACTS.md` §5.4 에 등재했다).
    'book-already-owned',
    'paged',
    'unsave',
    // Library 2라운드-3 — 책 상세 prompts 에 `reason` 이 없는 응답 (`L-R2B-01`).
    'no-reason',
  ];

  /**
   * Stage 4b 완료 화면 + Stage 5 (AC-5-16, Plan §5.4 R-8) — 전부 `API_CONTRACTS.md` §5.4 등재 key.
   * 회고 그룹에는 `empty` 가 없다 (`N5-06` ⓐ — 건너뛰기 = 요청 없음).
   */
  const CATALOGUE_STAGE_4_5 = [
    'subtext-missing',
    'bubble-missing',
    'reflection-submitted',
    'reflection-already-submitted',
    'invalid-transition',
    'analysis-pending',
    'analysis-completed',
    'analysis-failed',
    'analysis-low-quality',
    'analysis-not-available',
    'recording-deleted',
    'analysis-pending-then-completed',
    'analysis-feedback-missing',
  ];

  /**
   * Stage 6 (AC-6-14, Plan §8) — `children` 그룹 특화 key + `activity-cards` 추천 key 2종. 전부 `API_CONTRACTS.md` §5.4 등재.
   */
  const CATALOGUE_STAGE_6 = [
    'cold-to-warm',
    'difficulty-lowered',
    'profile-updated',
    'persona-changed',
    'persona-fallback',
    'all-scores-missing',
    'scores-partially-missing',
    'validation-failed',
    'survey-update-draft',
    'survey-update-submitted',
  ];

  /**
   * Stage 7 (`S7-A`, Plan §8 rev 2) — `progress` · `reports` · `report-pdf` · `highlight-clips` 특화 key. 전부 `API_CONTRACTS.md` §5.4 등재 (Rev 11).
   */
  const CATALOGUE_STAGE_7 = [
    'progress-first-week',
    'progress-multi-week',
    'report-eligible',
    'report-not-eligible',
    'report-deferred',
    'report-deferred-first',
    'report-delayed',
    'report-published-unviewed',
    'report-persona-unchanged',
    'report-no-previous',
    'pdf-generating',
    'pdf-failed',
    'pdf-timeout',
    'share-cancelled',
    'share-unsupported',
    'clip-expired',
    'clip-url-expired',
    'recording-deleted',
  ];

  it('패널이 다루는 그룹은 health · home · activity-cards · library · books · session-completion · reflections · analysis · children · progress · reports · report-pdf · highlight-clips · __states 다', () => {
    expect(DEV_SCENARIO_GROUPS.map((group) => group.group)).toStrictEqual([
      'health',
      'home',
      'activity-cards',
      'library',
      'books',
      'session-completion',
      'reflections',
      'analysis',
      'children',
      'progress',
      'reports',
      'report-pdf',
      'highlight-clips',
      '__states',
    ]);
  });

  it('모든 key 가 Catalogue machine key 다 (deprecated alias 없음)', () => {
    for (const group of DEV_SCENARIO_GROUPS) {
      for (const key of group.keys) {
        expect([
          ...CATALOGUE_COMMON,
          ...CATALOGUE_STAGE_3,
          ...CATALOGUE_STAGE_4_5,
          ...CATALOGUE_STAGE_6,
          ...CATALOGUE_STAGE_7,
        ]).toContain(key);
      }
    }
  });

  it('health 그룹에는 empty 가 없고 __states 그룹에는 있다 (Plan §8.1 ④)', () => {
    expect(healthScenarioGroup.keys).not.toContain('empty');
    expect(statesScenarioGroup.keys).toContain('empty');
  });
});
