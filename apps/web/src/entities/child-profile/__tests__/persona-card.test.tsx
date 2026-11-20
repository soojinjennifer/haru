/**
 * `PersonaCard` Stage 7 확장 (`eyebrow?` · `footnote?` · `nameAs?` — Spec §2.3.2 · §3.8) — **미지정 시 Stage 6 DOM 불변**
 * (AC-7-81). HEAD(Stage 6) 컴포넌트와의 innerHTML 동일성은 `S7-D` 구현 때 1회 대조했다 (H7-4).
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PersonaCard } from '../PersonaCard';
import { childProfileCopy } from '../copy';

const persona = { name: 'The Quiet Noticer', description: 'Settles into a story.' } as const;

describe('PersonaCard — 기본값 불변', () => {
  it('미지정 = 기본 eyebrow · h2 이름 · description · footnote 0 (Stage 6 그대로)', () => {
    const { container } = render(<PersonaCard firstName="Emma" persona={persona} />);
    const stack = container.querySelector('.haru-surface > div');
    const children = [...(stack?.children ?? [])];
    expect(children.map((node) => node.tagName)).toStrictEqual(['P', 'H2', 'P']);
    expect(children[0]?.textContent).toBe(childProfileCopy.persona.eyebrow('Emma'));
    expect(children[1]?.textContent).toBe(persona.name);
    expect(children[2]?.textContent).toBe(persona.description);
  });

  it('`undefined` 를 명시로 넘겨도 미지정과 같은 DOM', () => {
    const a = render(<PersonaCard firstName="Emma" persona={persona} />).container.innerHTML;
    const b = render(
      <PersonaCard
        firstName="Emma"
        persona={persona}
        eyebrow={undefined}
        footnote={undefined}
        nameAs={undefined}
      />,
    ).container.innerHTML;
    expect(b).toBe(a);
  });

  it('확장 — eyebrow override · footnote 1줄(caption-1 secondary) · 이름 h3', () => {
    const { container } = render(
      <PersonaCard
        firstName="Emma"
        persona={persona}
        eyebrow="NOW"
        footnote="From your storytimes"
        nameAs="h3"
      />,
    );
    const children = [...(container.querySelector('.haru-surface > div')?.children ?? [])];
    expect(children.map((node) => node.tagName)).toStrictEqual(['P', 'H3', 'P', 'P']);
    expect(children[0]?.textContent).toBe('NOW');
    expect(children[3]?.textContent).toBe('From your storytimes');
    expect(children[3]?.className).toContain('haru-text--caption-1');
    expect(children[3]?.className).toContain('haru-text--tone-secondary');
  });
});
