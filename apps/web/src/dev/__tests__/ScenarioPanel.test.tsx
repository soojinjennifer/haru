/**
 * Scenario Panel 렌더 — dev 전용 전환 UI (Plan §16 D-5 ②).
 *
 * 전환 동작(페이지 이동)은 브라우저 동작이므로 Playwright e2e 에서 확인한다.
 * 여기서는 "현재 scenario 가 정확히 표시되는가" 를 고정한다.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SCENARIO_SESSION_KEY } from '../../mocks/scenarios';
import { ScenarioPanel } from '../scenario-panel/ScenarioPanel';

afterEach(() => {
  window.sessionStorage.clear();
});

function openPanel(): void {
  fireEvent.click(screen.getByRole('button', { name: 'scenario' }));
}

describe('ScenarioPanel', () => {
  it('처음에는 접혀 있고 토글로 펼친다', () => {
    render(<ScenarioPanel />);

    const toggle = screen.getByRole('button', { name: 'scenario' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    openPanel();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('health · __states 그룹의 key 를 모두 보여 준다', () => {
    render(<ScenarioPanel />);
    openPanel();

    const health = within(screen.getByRole('group', { name: 'health' }));
    for (const key of ['success', 'loading', 'error', 'retry', 'offline']) {
      expect(health.getByRole('button', { name: key })).toBeTruthy();
    }

    const states = within(screen.getByRole('group', { name: '__states' }));
    expect(states.getByRole('button', { name: 'empty' })).toBeTruthy();
  });

  it('기본값에서는 success 가 선택 상태다', () => {
    render(<ScenarioPanel />);
    openPanel();

    const health = within(screen.getByRole('group', { name: 'health' }));
    expect(health.getByRole('button', { name: 'success' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(health.getByRole('button', { name: 'error' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
  });

  it('sessionStorage 에 저장된 선택을 반영한다 (URL 이 없을 때)', () => {
    window.sessionStorage.setItem(SCENARIO_SESSION_KEY, 'health:error');

    render(<ScenarioPanel />);
    openPanel();

    const health = within(screen.getByRole('group', { name: 'health' }));
    expect(health.getByRole('button', { name: 'error' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('현재 선택을 URL 표기로 보여 준다 (복사해서 재현할 수 있게)', () => {
    render(<ScenarioPanel />);
    openPanel();

    expect(
      screen.getByText(
        '?scenario=health:success,home:success,activity-cards:success,library:success,books:success,session-completion:success,reflections:success,analysis:success,children:success,__states:success',
      ),
    ).toBeTruthy();
  });

  it('모든 key 버튼이 44px 이상 터치 타깃 클래스를 쓴다 (dev 도구도 키보드·터치로 쓴다)', () => {
    render(<ScenarioPanel />);
    openPanel();

    const keys = screen.getAllByRole('button').filter((button) => button.className.includes('key'));
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(key.className).toContain('haru-dev-panel__key');
    }
  });
});
