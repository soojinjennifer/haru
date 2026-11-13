import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TextInput } from '../TextInput';

describe('TextInput (Stage 5 Spec §3.3)', () => {
  it('한 줄 text input · 접근성 이름 = aria-label · placeholder · maxLength', () => {
    render(
      <TextInput
        value=""
        aria-label="Note"
        placeholder="Anything?"
        maxLength={500}
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Note' }) as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.placeholder).toBe('Anything?');
    expect(input.maxLength).toBe(500);
    expect(input.classList.contains('haru-text-input')).toBe(true);
  });

  it('입력 값을 onChange 로 올린다 · readOnly 면 readOnly 속성', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TextInput value="" aria-label="Note" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'moon' } });
    expect(onChange).toHaveBeenLastCalledWith('moon');
    rerender(<TextInput value="moon" aria-label="Note" readOnly />);
    expect((screen.getByRole('textbox') as HTMLInputElement).readOnly).toBe(true);
  });
});
