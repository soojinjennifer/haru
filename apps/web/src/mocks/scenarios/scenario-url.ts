/**
 * `?scenario=` 파서 — Plan §8.3 · §16 D-5.
 *
 * 표기
 * - `?scenario=health:loading`            그룹 지정
 * - `?scenario=loading`                   전 그룹 적용 (wildcard)
 * - `?scenario=health:error,__states:empty`  쉼표로 다중 지정
 * - `?scenario=library.savebook:error`     그룹 안 **메서드 하나만** 지정 (Stage 4 `S4-C`)
 *
 * URL 이 1순위여야 Playwright·수동 재현·버그 리포트 공유가 결정적이다.
 */
import { createScenarioSource, WILDCARD_GROUP, type ScenarioSource } from './types';

export const SCENARIO_QUERY_PARAM = 'scenario';

/** 그룹·key 에 허용하는 문자 — Catalogue 의 machine key 형태(kebab-case, `__` 접두 그룹 포함). */
const TOKEN = /^[a-z_][a-z0-9_-]*$/;

/** 그룹 자리에는 `group.method` 도 올 수 있다 (`types.ts` `METHOD_SEPARATOR`). */
const GROUP_TOKEN = /^[a-z_][a-z0-9_-]*(\.[a-z][a-z0-9-]*)?$/;

/**
 * `scenario` 파라미터 문자열 하나를 한 계층의 선택값으로 바꾼다.
 * 형식에 맞지 않는 항목은 조용히 버린다 (잘못된 URL 로 앱이 죽지 않게).
 */
export function parseScenarioParam(
  raw: string | null | undefined,
  name: ScenarioSource['name'],
): ScenarioSource {
  if (raw === null || raw === undefined || raw.trim().length === 0) {
    return createScenarioSource(name);
  }

  const explicit: Record<string, string> = {};
  let wildcard: string | undefined;

  for (const rawEntry of raw.split(',')) {
    const entry = rawEntry.trim().toLowerCase();
    if (entry.length === 0) continue;

    const separator = entry.indexOf(':');

    if (separator === -1) {
      if (TOKEN.test(entry)) wildcard = entry;
      continue;
    }

    const group = entry.slice(0, separator);
    const key = entry.slice(separator + 1);

    if (group === WILDCARD_GROUP && TOKEN.test(key)) {
      wildcard = key;
      continue;
    }

    if (!GROUP_TOKEN.test(group) || !TOKEN.test(key)) continue;

    // 같은 그룹이 여러 번 나오면 **마지막** 지정이 이긴다.
    explicit[group] = key;
  }

  return createScenarioSource(name, explicit, wildcard);
}

/** `location.search` 문자열에서 scenario 계층을 만든다. */
export function parseScenarioSearch(search: string): ScenarioSource {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return parseScenarioParam(params.get(SCENARIO_QUERY_PARAM), 'url');
}

/** 선택값을 다시 `scenario` 파라미터 문자열로 직렬화한다 (dev 패널 ↔ URL 동기화용). */
export function serializeScenarioSource(source: ScenarioSource): string {
  const parts = Object.entries(source.explicit).map(([group, key]) => `${group}:${key}`);
  if (source.wildcard !== undefined) parts.unshift(source.wildcard);
  return parts.join(',');
}
