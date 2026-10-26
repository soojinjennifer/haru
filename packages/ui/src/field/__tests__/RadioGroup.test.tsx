import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { RadioGroup, type RadioOption } from '../RadioGroup';

const options: readonly RadioOption[] = [
  { value: 'never', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'often', label: 'Often' },
  { value: 'not_observed', label: "Haven't had the chance to see this yet", variant: 'muted' },
];

describe('RadioGroup', () => {
  it('names the group and renders one native radio per option', () => {
    render(
      <RadioGroup
        legend="How often does this happen?"
        options={options}
        value={null}
        onChange={() => {}}
        name="q1"
      />,
    );

    expect(screen.getByRole('group', { name: 'How often does this happen?' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(options.length);
  });

  it('puts every option in one native radio group so browser arrow-key navigation applies', () => {
    render(
      <RadioGroup
        legend="Frequency"
        options={options}
        value={null}
        onChange={() => {}}
        name="q1"
      />,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.every((radio) => radio.getAttribute('name') === 'q1')).toBe(true);
    // roving tabindex 를 직접 구현하지 않는다 — native radio 그룹이 담당한다.
    expect(radios.some((radio) => radio.hasAttribute('tabindex'))).toBe(false);

    radios[0]?.focus();
    expect(document.activeElement).toBe(radios[0]);
  });

  it('reflects the selected value', () => {
    render(
      <RadioGroup
        legend="Frequency"
        options={options}
        value="sometimes"
        onChange={() => {}}
        name="q1"
      />,
    );

    expect(screen.getByRole('radio', { name: 'Sometimes' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Never' })).toHaveProperty('checked', false);
  });

  it('selects an option when its label text is clicked', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Frequency"
        options={options}
        value={null}
        onChange={onChange}
        name="q1"
      />,
    );

    fireEvent.click(screen.getByText('Often'));

    expect(onChange).toHaveBeenCalledWith('often');
  });

  it('disables individual options and the whole group', () => {
    const { rerender } = render(
      <RadioGroup
        legend="Frequency"
        options={[{ value: 'never', label: 'Never', disabled: true }]}
        value={null}
        onChange={() => {}}
        name="q1"
      />,
    );

    // 브라우저는 disabled radio 의 활성화를 막는다 (jsdom 은 dispatch 를 그대로 전달한다).
    expect(screen.getByRole('radio', { name: 'Never' })).toHaveProperty('disabled', true);

    rerender(
      <RadioGroup
        legend="Frequency"
        options={options}
        value={null}
        onChange={() => {}}
        name="q1"
        disabled
      />,
    );

    // fieldset[disabled] 는 브라우저에서 포함된 모든 컨트롤을 비활성화한다
    // (input.disabled 속성에는 반영되지 않는다 — HTML 사양).
    expect(screen.getByRole('group', { name: 'Frequency' })).toHaveProperty('disabled', true);
  });

  it('announces a group level error', () => {
    render(
      <RadioGroup
        legend="Frequency"
        options={options}
        value={null}
        onChange={() => {}}
        name="q1"
        error="Choose one option."
      />,
    );

    expect(screen.getByRole('alert').textContent).toBe('Choose one option.');
  });
});

describe('RadioGroup legendVisuallyHidden (D4-63)', () => {
  it('keeps the group name for assistive tech but hides the legend visually', () => {
    const { container } = render(
      <RadioGroup
        legend="When will you read?"
        legendVisuallyHidden
        options={options}
        value={null}
        onChange={() => {}}
        name="q-hidden"
      />,
    );

    expect(screen.getByRole('group', { name: 'When will you read?' })).toBeTruthy();
    const legend = container.querySelector('legend');
    expect(legend?.classList.contains('haru-visually-hidden')).toBe(true);
    expect(legend?.getAttribute('aria-hidden')).toBeNull();
    expect(container.firstElementChild?.classList.contains('haru-radio-group--legend-hidden')).toBe(
      true,
    );
  });

  it('is opt-in — the default legend stays visible', () => {
    const { container } = render(
      <RadioGroup legend="Q" options={options} value={null} onChange={() => {}} name="q-shown" />,
    );

    expect(container.querySelector('legend')?.classList.contains('haru-visually-hidden')).toBe(
      false,
    );
    expect(container.firstElementChild?.classList.contains('haru-radio-group--legend-hidden')).toBe(
      false,
    );
  });
});
