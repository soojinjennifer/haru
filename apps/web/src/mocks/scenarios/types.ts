/**
 * Scenario 타입 — key 의 유일한 기준은 `docs/API_CONTRACTS.md` §5.4 Catalogue 다.
 *
 * Stage 1 은 `health` 그룹만 존재한다 (Plan §16 D-8). Stage 2–8 key 는 **정의하지 않는다**
 * (Plan §8.4). 그래서 전체 key union 을 미리 선언하지 않고, 도메인 Mock 모듈이 자기 그룹의
 * 리터럴 union 을 `ScenarioGroupDefinition` 으로 **기여**하는 구조로 둔다.
 *
 * deprecated alias(`default` · `slow` · `upload-success` …) 는 사용하지 않는다 (AC-1-40).
 */

/** 모든 그룹이 공통으로 갖는 기본값. Catalogue 의 `success` 행이다. */
export const DEFAULT_SCENARIO_KEY = 'success';

/** `?scenario=loading` 처럼 그룹을 생략했을 때 쓰는 내부 표기. */
export const WILDCARD_GROUP = '*';

/** 도메인 Mock 모듈이 선언하는 자기 그룹의 scenario 목록. */
export interface ScenarioGroupDefinition<TKey extends string> {
  /** `?scenario=<group>:<key>` 의 `<group>`. */
  readonly group: string;
  readonly keys: readonly TKey[];
  readonly defaultKey: TKey;
}

/** 한 계층(URL · dev 패널 · 빌드 기본값)이 표현하는 선택값. */
export interface ScenarioSource {
  /** 계층 이름 — 로깅·디버깅용. */
  readonly name: 'url' | 'panel' | 'env';
  /** group → key */
  readonly explicit: Readonly<Record<string, string>>;
  /** 그룹을 생략한 지정 (`?scenario=loading`) */
  readonly wildcard: string | undefined;
}

export function createScenarioSource(
  name: ScenarioSource['name'],
  explicit: Readonly<Record<string, string>> = {},
  wildcard: string | undefined = undefined,
): ScenarioSource {
  return { name, explicit, wildcard };
}
