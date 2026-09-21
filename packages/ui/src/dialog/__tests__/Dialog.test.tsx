import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ConfirmDialog } from '../ConfirmDialog';
import { Dialog } from '../Dialog';

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    render(<Dialog open={false} title="Delete recording" />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is modal, labelled by the title and described by the description (§4.22)', () => {
    render(<Dialog open title="Delete recording" description="This cannot be undone." />);

    const dialog = screen.getByRole('dialog', { name: 'Delete recording' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe(
      'This cannot be undone.',
    );
  });
});

describe('ConfirmDialog', () => {
  const baseProps = {
    open: true,
    title: 'Delete this recording?',
    description: 'The audio will be removed from this device.',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
  };

  it('uses alertdialog and focuses the confirm button by default', () => {
    render(<ConfirmDialog {...baseProps} onConfirm={() => {}} onCancel={() => {}} />);

    expect(screen.getByRole('alertdialog', { name: 'Delete this recording?' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete' }));
  });

  it('focuses cancel first for destructive actions (§4.22)', () => {
    render(<ConfirmDialog {...baseProps} destructive onConfirm={() => {}} onCancel={() => {}} />);

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep' }));
  });

  it('treats Escape as cancel', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('reports work in progress on the confirm button without losing focus', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} confirming onConfirm={onConfirm} onCancel={() => {}} />);

    const confirm = screen.getByRole('button', { name: 'Delete' });
    expect(confirm.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('runs the handlers on press', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
