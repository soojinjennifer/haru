import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Checkbox } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';

describe('Checkbox', () => {
  it('renders a native checkbox named by its label', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I agree to the Terms" />);

    const input = screen.getByRole('checkbox', { name: /I agree to the Terms/ });
    expect(input.getAttribute('type')).toBe('checkbox');
  });

  it('toggles when the label text is clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="I agree to the Terms" />);

    fireEvent.click(screen.getByText('I agree to the Terms'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects the checked state and reports unchecking', () => {
    const onChange = vi.fn();
    render(<Checkbox checked onChange={onChange} label="Marketing emails" />);

    const input = screen.getByRole('checkbox', { name: 'Marketing emails' });
    expect(input).toHaveProperty('checked', true);

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('is keyboard reachable — focus lands on the native input', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Pilot programme" />);

    const input = screen.getByRole('checkbox', { name: 'Pilot programme' });
    input.focus();

    expect(document.activeElement).toBe(input);
    // 시각 대체는 CSS 이고 인터랙션은 native 요소가 담당한다 — tabindex 를 덮어쓰지 않는다.
    expect(input.hasAttribute('tabindex')).toBe(false);
  });

  it('exposes the mixed state through the native indeterminate property', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Select all" indeterminate />);

    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveProperty(
      'indeterminate',
      true,
    );
  });

  it('links the error message and marks the input invalid', () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        label="Required consent"
        error="This consent is required."
      />,
    );

    const input = screen.getByRole('checkbox', { name: /Required consent/ });
    expect(input.getAttribute('aria-invalid')).toBe('true');

    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe('This consent is required.');
  });

  it('disables the native input so the browser blocks interaction', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Disabled option" disabled />);

    // 브라우저는 disabled 폼 컨트롤에서 click/키보드 활성화를 막는다.
    // jsdom 은 프로그래밍 방식 dispatch 를 그대로 전달하므로 속성 자체를 검증한다.
    expect(screen.getByRole('checkbox', { name: 'Disabled option' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});

describe('CheckboxGroup', () => {
  it('names the group with a legend and announces the group error', () => {
    render(
      <CheckboxGroup legend="Consents" error="Accept the required consents.">
        <Checkbox checked={false} onChange={() => {}} label="Terms" />
        <Checkbox checked={false} onChange={() => {}} label="Privacy Policy" />
      </CheckboxGroup>,
    );

    expect(screen.getByRole('group', { name: 'Consents' })).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(screen.getByRole('alert').textContent).toBe('Accept the required consents.');
  });
});
