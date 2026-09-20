import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { FieldGroup } from '../FieldGroup';
import { TextField } from '../TextField';

describe('TextField', () => {
  it('connects the visible label to the input', () => {
    render(<TextField label="Email" value="" onChange={() => {}} type="email" />);

    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('type')).toBe('email');
  });

  it('reports typed values through onChange', () => {
    const onChange = vi.fn();
    render(<TextField label="First name" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Mina' } });

    expect(onChange).toHaveBeenCalledWith('Mina');
  });

  it('marks the input invalid and links the error message', () => {
    render(
      <TextField
        label="Email"
        value="not-an-email"
        onChange={() => {}}
        errorText="Enter a valid email address."
      />,
    );

    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const message = document.getElementById(describedBy ?? '');
    expect(message?.textContent).toBe('Enter a valid email address.');
  });

  it('links helper text and error message together', () => {
    render(
      <TextField
        label="Password"
        value=""
        onChange={() => {}}
        type="password"
        helperText="At least 8 characters."
        errorText="Password is too short."
      />,
    );

    const describedBy = screen.getByLabelText('Password').getAttribute('aria-describedby') ?? '';
    const ids = describedBy.split(' ');
    expect(ids).toHaveLength(2);
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
      'Password is too short.',
      'At least 8 characters.',
    ]);
  });

  it('disables the input and its trailing action when disabled', () => {
    const onPress = vi.fn();
    render(
      <TextField
        label="Password"
        value="secret"
        onChange={() => {}}
        type="password"
        disabled
        trailingAction={{ label: 'Show', onPress }}
      />,
    );

    expect(screen.getByLabelText('Password')).toHaveProperty('disabled', true);

    const action = screen.getByRole('button', { name: 'Show' });
    expect(action).toHaveProperty('disabled', true);
    fireEvent.click(action);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes required state to assistive technology', () => {
    render(<TextField label="Email" value="" onChange={() => {}} required />);

    expect(screen.getByLabelText(/Email/)).toHaveProperty('required', true);
  });
});

describe('FieldGroup', () => {
  it('renders its rows and announces a group level error', () => {
    render(
      <FieldGroup error="Check the fields above.">
        <TextField label="First name" value="" onChange={() => {}} />
        <TextField label="Last name" value="" onChange={() => {}} />
      </FieldGroup>,
    );

    expect(screen.getByLabelText('First name')).toBeTruthy();
    expect(screen.getByLabelText('Last name')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe('Check the fields above.');
  });
});
