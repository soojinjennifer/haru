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
    // `D8-3` — 이름 = 보이는 캡션 + 동작 (label-in-name, WCAG 2.5.3)
    render(
      <RecordControl
        state="idle"
        label="Tap to recording, Start recording"
        caption="Tap to recording"
      />,
    );
    const button = screen.getByRole('button', { name: 'Tap to recording, Start recording' });
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

  it('paused = `298:1227`: mic glyph + caption `Tap to resume` · no pulse class target', () => {
    const { container } = render(
      <RecordControl
        state="paused"
        label="Tap to resume, Resume recording"
        caption="Tap to resume"
      />,
    );
    const button = screen.getByRole('button', { name: 'Tap to resume, Resume recording' });
    expect(button.classList.contains('haru-record--paused')).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBeNull();
    expect(container.querySelector('.haru-record__caption')?.textContent).toBe('Tap to resume');
    expect(container.querySelector('.haru-record__glyph path')?.getAttribute('d')).toMatch(
      /^M25 10/,
    );
    // pulse 는 idle 에만 걸린다 — paused 는 모션 없음 (4b Spec §6)
    expect(css).toMatch(/\.haru-record--idle \.haru-record__ring--outer \{\s*animation:/);
    expect(css).not.toMatch(/\.haru-record--paused[^{]*\{[^}]*animation/);
  });

  it('disabled = `298:1236`: aria-disabled by itself · focusable · onToggle ignored · mic + caption', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <RecordControl
        state="disabled"
        label="Tap to recording, Start recording"
        caption="Tap to recording"
        onToggle={onToggle}
      />,
    );
    const button = screen.getByRole('button', { name: 'Tap to recording, Start recording' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    fireEvent.click(button);
    expect(onToggle).not.toHaveBeenCalled();
    expect(container.querySelector('.haru-record__caption')?.textContent).toBe('Tap to recording');
  });

  it('disabled CSS = opacity .5 (D4-18) + core shadow removed (F-7), nothing else', () => {
    expect(css).toMatch(/\.haru-record--disabled \{\s*opacity: var\(--opacity-disabled\);\s*\}/);
    expect(css).toMatch(
      /\.haru-record--disabled \.haru-record__core \{\s*box-shadow: var\(--record-core-shadow-disabled\);\s*\}/,
    );
  });

  it('permission-denied = `298:1245`: Figma mic-off glyph `298:1254` (stroke 3.333, VG-F2-01) + `Mic is off` · gray-2 ring/core · P-25 marker', () => {
    const { container } = render(
      <RecordControl state="permission-denied" label="Mic is off" caption="Mic is off" />,
    );
    expect(screen.getByRole('button', { name: 'Mic is off' })).toBeTruthy();
    expect(container.querySelector('.haru-record__glyph svg.lucide-mic-off')).toBeNull();
    const paths = container.querySelectorAll('.haru-record__glyph path');
    expect(paths).toHaveLength(6);
    expect(paths[0]?.getAttribute('d')).toBe('M3.33333 3.33333L36.6667 36.6667');
    for (const path of paths) expect(path.getAttribute('stroke-width')).toBe('3.33333');
    expect(container.querySelector('.haru-record__caption')?.textContent).toBe('Mic is off');
    expect(css).toMatch(
      /\.haru-record--permission-denied \.haru-record__ring \{\s*border-color: var\(--record-tone-denied\);/,
    );
    expect(css).toMatch(
      /\.haru-record--permission-denied \.haru-record__core \{\s*background-color: var\(--record-tone-denied\);/,
    );
    expect(css).toMatch(/provisional: P-25/);
  });

  it('all five states keep the same <button> node across changes (AC-4-125)', () => {
    const { rerender } = render(<RecordControl state="idle" label="a" />);
    const node = screen.getByRole('button');
    for (const state of ['recording', 'paused', 'disabled', 'permission-denied', 'idle'] as const) {
      rerender(<RecordControl state={state} label={state} />);
      expect(screen.getByRole('button')).toBe(node);
      expect(node.classList.contains(`haru-record--${state}`)).toBe(true);
    }
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
