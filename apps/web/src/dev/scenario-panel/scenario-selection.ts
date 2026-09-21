/**
 * Scenario Panel 의 순수 로직 — 선택 읽기 / 직렬화 / URL·sessionStorage 동기화 (Plan §16 D-5 ②).
 *
 * 우선순위는 Mock 과 **같은 해석기**(`createScenarioStoreFrom`)를 재사용한다.
 * 패널이 따로 우선순위를 구현하면 화면에 표시되는 값과 Mock 이 실제로 쓰는 값이 갈라진다.
 *   URL query > dev Scenario Panel(session) > `VITE_MOCK_SCENARIO` > `success`
 *
 * 부작용(저장소 쓰기·페이지 이동)은 이 모듈이 하지 않는다. 호출자가 결정한다.
 */
import {
  createScenarioStoreFrom,
  SCENARIO_QUERY_PARAM,
  SCENARIO_SESSION_KEY,
  type ScenarioGroupDefinition,
} from '../../mocks/scenarios';

/** group → key */
export type ScenarioSelection = Readonly<Record<string, string>>;

export interface SelectionInput {
  search?: string | undefined;
  panelValue?: string | null | undefined;
  envValue?: string | null | undefined;
}

/** 각 그룹이 지금 어떤 key 로 동작하는지 (Mock 과 동일한 해석 결과). */
export function resolveSelection(
  groups: readonly ScenarioGroupDefinition<string>[],
  input: SelectionInput,
): ScenarioSelection {
  const store = createScenarioStoreFrom(input);

  return Object.fromEntries(groups.map((group) => [group.group, store.resolve(group)]));
}

/** 선택을 `scenario` 파라미터 문자열로 만든다. 그룹 기본값도 명시해 URL 만으로 재현되게 한다. */
export function serializeSelection(selection: ScenarioSelection): string {
  return Object.entries(selection)
    .map(([group, key]) => `${group}:${key}`)
    .join(',');
}

/** 현재 URL 에 `?scenario=` 를 반영한 새 URL 문자열. */
export function withScenarioParam(href: string, param: string): string {
  const url = new URL(href);

  if (param.length === 0) {
    url.searchParams.delete(SCENARIO_QUERY_PARAM);
  } else {
    url.searchParams.set(SCENARIO_QUERY_PARAM, param);
  }

  return url.toString();
}

/** 한 그룹만 바꾼 새 선택. */
export function withGroupKey(
  selection: ScenarioSelection,
  group: string,
  key: string,
): ScenarioSelection {
  return { ...selection, [group]: key };
}

/** sessionStorage 에 패널 선택을 저장한다. 접근이 막혀 있으면 조용히 넘어간다. */
export function persistSelection(param: string, storage?: Storage | undefined): void {
  const target = storage ?? globalThis.sessionStorage;

  try {
    if (param.length === 0) target?.removeItem(SCENARIO_SESSION_KEY);
    else target?.setItem(SCENARIO_SESSION_KEY, param);
  } catch {
    // Safari private mode 등.
  }
}

export { SCENARIO_QUERY_PARAM, SCENARIO_SESSION_KEY };
