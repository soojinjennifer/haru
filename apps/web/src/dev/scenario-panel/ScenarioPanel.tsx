/**
 * dev Scenario Panel — Plan §16 D-5 ②.
 *
 * 역할은 하나다: **현재 scenario 를 보여 주고 바꾼다.** 우선순위 해석은 Mock 과 같은
 * `resolveSelection`(= `createScenarioStoreFrom`)을 쓴다.
 *
 *   URL query > 이 패널(sessionStorage) > `VITE_MOCK_SCENARIO` > `success`
 *
 * 전환은 sessionStorage 에 기록하고 **URL 을 함께 바꾼 뒤 전체 새로고침**한다.
 * Mock Adapter 는 앱 조립 시점에 한 번 만들어지므로(ApiClientProvider), 새로고침해야
 * 선택이 결정적으로 반영된다. URL 이 함께 바뀌므로 그 주소를 공유하면 같은 상태가 재현된다.
 */
import { useState } from 'react';

import { readScenarioPanelValue } from '../../mocks/scenarios';
import { env } from '../../shared/lib/env';

import { DEV_SCENARIO_GROUPS } from './devScenarios';
import {
  persistSelection,
  resolveSelection,
  serializeSelection,
  withGroupKey,
  withScenarioParam,
  type ScenarioSelection,
} from './scenario-selection';

function currentSelection(): ScenarioSelection {
  return resolveSelection(DEV_SCENARIO_GROUPS, {
    search: globalThis.location?.search ?? '',
    panelValue: readScenarioPanelValue(),
    envValue: env.mockScenario,
  });
}

function applySelection(selection: ScenarioSelection): void {
  const param = serializeSelection(selection);
  persistSelection(param);
  globalThis.location.assign(withScenarioParam(globalThis.location.href, param));
}

export function ScenarioPanel() {
  const [open, setOpen] = useState(false);
  const selection = currentSelection();
  const param = serializeSelection(selection);

  return (
    <aside className="haru-dev-panel" aria-label="Mock scenario">
      <button
        type="button"
        className="haru-dev-panel__toggle"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        scenario
      </button>

      {open ? (
        <div className="haru-dev-panel__body">
          {DEV_SCENARIO_GROUPS.map((group) => (
            <div className="haru-dev-panel__group" key={group.group}>
              <span className="haru-dev-panel__legend">{group.group}</span>
              <div className="haru-dev-panel__keys" role="group" aria-label={group.group}>
                {group.keys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="haru-dev-panel__key"
                    aria-pressed={selection[group.group] === key}
                    onClick={() => {
                      applySelection(withGroupKey(selection, group.group, key));
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <p className="haru-dev-panel__hint">?scenario={param}</p>

          <button
            type="button"
            className="haru-dev-panel__toggle"
            onClick={() => {
              persistSelection('');
              globalThis.location.assign(withScenarioParam(globalThis.location.href, ''));
            }}
          >
            reset
          </button>
        </div>
      ) : null}
    </aside>
  );
}
