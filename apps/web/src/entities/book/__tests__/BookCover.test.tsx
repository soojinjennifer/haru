/**
 * `BookCover` — `AC-3-21` (의미 있는 `alt` · 로드 실패 시 placeholder 전환) · Design Spec §5.3.
 *
 * `QA-2-004` 재발 방지의 CSS 쪽(고정 aspect + `object-fit: cover`)은 jsdom 이 외부 CSS 를
 * 적용하지 않으므로 `__tests__/stage3-css-guards.test.ts` 가 소스로 고정한다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BookCover, coverAlt, coverInitials } from '../BookCover';

describe('alt 문구 (AC-3-21)', () => {
  it('"{제목} by {저자}" 형식이다', () => {
    expect(coverAlt('Goodnight Moon', 'Margaret Wise Brown')).toBe(
      'Goodnight Moon by Margaret Wise Brown',
    );
  });

  it('저자가 없으면 제목만 쓴다', () => {
    expect(coverAlt('Corduroy')).toBe('Corduroy');
    expect(coverAlt('Corduroy', '')).toBe('Corduroy');
  });

  it('표지가 있으면 img 의 접근성 이름이 된다', () => {
    render(<BookCover title="Corduroy" author="Don Freeman" coverUrl="/cover.png" />);

    expect(screen.getByRole('img', { name: 'Corduroy by Don Freeman' })).toBeDefined();
  });

  it('`decorative` 면 alt 가 비어 같은 정보를 두 번 읽지 않는다', () => {
    render(<BookCover title="Corduroy" coverUrl="/cover.png" decorative />);

    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('placeholder (AC-3-21 · §5.3)', () => {
  it('표지가 없으면 제목 이니셜을 그린다 — 판정 문구를 넣지 않는다', () => {
    render(<BookCover title="Goodnight Moon" author="Margaret Wise Brown" />);

    expect(screen.getByText('GM')).toBeDefined();
    expect(screen.queryByText(/no cover/i)).toBeNull();
    // 이미지가 아니라 라벨이 붙은 박스다 (접근성 이름은 유지된다).
    expect(
      screen.getByRole('img', { name: 'Goodnight Moon by Margaret Wise Brown' }),
    ).toBeDefined();
  });

  it('로드에 실패하면 placeholder 로 전환된다', () => {
    render(<BookCover title="Corduroy" author="Don Freeman" coverUrl="/missing.png" />);

    const image = screen.getByRole('img', { name: 'Corduroy by Don Freeman' });
    expect(image.tagName).toBe('IMG');

    fireEvent.error(image);

    expect(screen.getByText('C')).toBeDefined();
    expect(document.querySelector('img')).toBeNull();
  });

  it('이니셜은 1–2자다', () => {
    expect(coverInitials('Corduroy')).toBe('C');
    expect(coverInitials('The Very Hungry Caterpillar')).toBe('TV');
    expect(coverInitials('"Brown Bear, Brown Bear"')).toBe('BB');
  });
});
