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

/**
 * **메서드 단위 override** 구분자 (Stage 4 `S4-C`, Plan §8.3 · `R4-10` · AC-4-87).
 *
 * `?scenario=library.savebook:error` 는 `library` 그룹 안에서 **`saveBook` 만** `error` 로 돌린다.
 * 그룹 단위 key 만으로는 "목록 성공 + 저장만 실패" 같은 **그룹 안 부분 실패**를 만들 수 없었다
 * (`stage-3-approvals.md` §30.7). **새 key 가 아니라 조합 표기**다 — key 는 여전히
 * `docs/API_CONTRACTS.md` §5.4 Catalogue 의 machine key 만 쓴다.
 *
 * URL 값은 소문자로 정규화되므로 메서드 이름도 **소문자**로 적는다 (`saveBook` → `savebook`).
 */
export const METHOD_SEPARATOR = '.';

/** `group` + `method` → store 가 찾는 키 (`library.savebook`). */
export function methodScope(group: string, method: string): string {
  return `${group}${METHOD_SEPARATOR}${method.toLowerCase()}`;
}

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
  /** group(또는 `group.method`) → key */
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
