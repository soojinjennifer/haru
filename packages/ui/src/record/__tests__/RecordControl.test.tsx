import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { RecordControl } from '../RecordControl';

const css = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'RecordControl.css'),
  'utf8',
);

describe('RecordControl (Stage 4 Design Spec §2.6)', () => {
  it('is a single button named by the action, not the state (§2.6.3)', () => {
    render(<RecordControl state="idle" label="Start recording" caption="Tap to recording" />);
    const button = screen.getByRole('button', { name: 'Start recording' });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBeNull();
  });

  it('idle = Record variant: mic glyph + visual caption (aria-hidden)', () => {
    const { container } = render(
      <RecordControl state="idle" label="Start recording" caption="Tap to recording" />,
    );
    expect(container.querySelector('.haru-record--captioned')).not.toBeNull();
    const caption = container.querySelector('.haru-record__caption');
    expect(caption?.textContent).toBe('Tap to recording');
    expect(caption?.getAttribute('aria-hidden')).toBe('true');
    // mic = 채움 캡슐 path (HARU SVG) — pause 막대 path 가 아니다
    expect(container.querySelector('.haru-record__glyph path')?.getAttribute('d')).toMatch(
      /^M25 10/,
    );
  });

  it('recording = Pause variant: no caption node (Figma `163:1588` has 4 children)', () => {
    const { container } = render(
      <RecordControl state="recording" label="Pause recording" caption="Tap to recording" />,
    );
    expect(container.querySelector('.haru-record__caption')).toBeNull();
    expect(container.querySelector('.haru-record--captioned')).toBeNull();
    expect(container.querySelector('.haru-record__glyph path')?.getAttribute('d')).toMatch(
      /^M10 31\.6667H16\.6667/,
    );
  });

  it('toggling state keeps the same <button> node (no remount — AC-4-111 ④)', () => {
    const { rerender } = render(
      <RecordControl state="idle" label="Start recording" caption="Tap to recording" />,
    );
    const before = screen.getByRole('button');
    rerender(
      <RecordControl state="recording" label="Pause recording" caption="Tap to recording" />,
    );
    expect(screen.getByRole('button')).toBe(before);
    expect(before.getAttribute('aria-label')).toBe('Pause recording');
  });

  it('calls onToggle, but not while aria-disabled (focusable blocked state)', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <RecordControl state="idle" label="Start recording" onToggle={onToggle} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(
      <RecordControl state="idle" label="Start recording" onToggle={onToggle} aria-disabled />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false);
  });

  it('pulse 0% keyframe = Figma declared value and stops under reduced motion (R-BASELINE-1 ②)', () => {
    expect(css).toMatch(
      /@keyframes haru-record-pulse \{\s*0%,\s*100% \{\s*opacity: var\(--record-ring-opacity-outer\);\s*scale: 1;/,
    );
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none;/);
  });

  it('uses tokens only — no raw HEX / px literals in the stylesheet', () => {
    const body = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(body).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(body).not.toMatch(/\b\d+px\b/);
  });
});
