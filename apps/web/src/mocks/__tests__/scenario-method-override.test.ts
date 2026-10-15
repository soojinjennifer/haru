/**
 * 메서드 단위 override — Stage 4 `S4-C` (Plan §8.3 · `R4-10` · AC-4-87 수단).
 * `stage-3-approvals.md` §30.7: 그룹 단위 key 로는 "목록 성공 + 저장만 실패" 를 만들 수 없었다.
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer } from '../../shared/api/helpers';
import { DECK_BOOKS } from '../fixtures/saved-books';
import { createMockApiClients } from '../index';
import { libraryScenarioGroup } from '../library/MockLibraryApi';
import {
  beginScenarioCall,
  createScenarioStoreFrom,
  parseScenarioParam,
  serializeScenarioSource,
} from '../scenarios';

describe('scenario-url — `group.method:key` 표기', () => {
  it('메서드 지정을 그룹 자리에 받는다 (소문자 정규화)', () => {
    const source = parseScenarioParam('library.saveBook:error,health:loading', 'url');
    expect(source.explicit).toStrictEqual({ 'library.savebook': 'error', health: 'loading' });
    expect(serializeScenarioSource(source)).toBe('library.savebook:error,health:loading');
  });

  it('형식이 틀린 메서드 표기는 버린다', () => {
    const source = parseScenarioParam(
      'library..save:error,.save:error,library.save.x:error',
      'url',
    );
    expect(source.explicit).toStrictEqual({});
  });
});

describe('scenario-store — 한 계층 안: 메서드 > 그룹 > wildcard, 계층 순서는 그대로', () => {
  it('메서드 지정이 같은 계층의 그룹 지정을 이긴다', () => {
    const store = createScenarioStoreFrom({
      search: '?scenario=library:loading,library.savebook:error',
    });
    expect(store.resolve(libraryScenarioGroup, 'saveBook')).toBe('error');
    expect(store.resolve(libraryScenarioGroup, 'getOverview')).toBe('loading');
    expect(store.resolve(libraryScenarioGroup)).toBe('loading');
  });

  it('메서드 지정이 wildcard 를 이기고, 메서드를 주지 않으면 무시된다', () => {
    const store = createScenarioStoreFrom({ search: '?scenario=empty,library.savebook:error' });
    expect(store.resolve(libraryScenarioGroup, 'saveBook')).toBe('error');
    expect(store.resolve(libraryScenarioGroup, 'getOverview')).toBe('empty');
  });

  it('윗 계층이 그룹을 언급하면 아랫 계층의 메서드 지정은 쓰지 않는다 (첫 계층에서 결정)', () => {
    const store = createScenarioStoreFrom({
      search: '?scenario=library:success',
      panelValue: 'library.savebook:error',
    });
    expect(store.resolve(libraryScenarioGroup, 'saveBook')).toBe('success');
  });

  it('resolveScoped 가 결정 표기를 알려준다', () => {
    const store = createScenarioStoreFrom({ search: '?scenario=library.savebook:error' });
    expect(store.resolveScoped(libraryScenarioGroup, 'saveBook')).toStrictEqual({
      key: 'error',
      scope: 'method',
    });
    expect(store.resolveScoped(libraryScenarioGroup, 'getOverview')).toStrictEqual({
      key: 'success',
      scope: 'default',
    });
  });

  it('beginScenarioCall — 시도 카운터가 메서드 단위다', () => {
    const store = createScenarioStoreFrom({});
    expect(beginScenarioCall(store, libraryScenarioGroup, 'saveBook', undefined).attempt).toBe(1);
    expect(beginScenarioCall(store, libraryScenarioGroup, 'getOverview', undefined).attempt).toBe(
      1,
    );
    expect(beginScenarioCall(store, libraryScenarioGroup, 'saveBook', undefined).attempt).toBe(2);
    expect(store.attemptCount('library')).toBe(0);
  });
});

describe('MockLibraryApi — "목록 성공 + 저장만 실패" (§30.7 ①, AC-4-87)', () => {
  it('library.savebook:error — getOverview 는 성공하고 saveBook 만 실패한다', async () => {
    const library = createMockApiClients({
      search: '?scenario=library.savebook:error',
      timer: createImmediateTimer(),
    }).library;

    const overview = await library.getOverview({ childId: 'c' });
    expect(overview.sections.length).toBeGreaterThan(0);

    const bookId = DECK_BOOKS[0]?.id ?? '';
    await expect(
      library.saveBook({ childId: 'c', body: { target: { bookId } } }),
    ).rejects.toBeInstanceOf(HaruApiError);
    // 해제는 지정하지 않았으므로 성공
    await expect(library.unsaveBook({ childId: 'c', bookId })).resolves.toMatchObject({
      saved: false,
    });
  });

  it('그룹 지정만 있으면 Stage 3 동작 그대로 — library:error 는 목록도 실패시킨다', async () => {
    const library = createMockApiClients({
      search: '?scenario=library:error',
      timer: createImmediateTimer(),
    }).library;
    await expect(library.getOverview({ childId: 'c' })).rejects.toBeInstanceOf(HaruApiError);
  });
});
