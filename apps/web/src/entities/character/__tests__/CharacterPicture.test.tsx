/**
 * AC-4-84 — `<picture>` + `srcset` 적용 지점 (이월 `QA-3-003`).
 *
 * 브라우저가 **AVIF → WebP → PNG** 순서로 고르려면 `<source>` 순서가 그 순서여야 하고,
 * `<img>` 가 마지막 fallback 이어야 한다. 두 사용처(illustration · medallion)가 같은 구조를 쓴다.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CHARACTER_ASSETS } from '../../../shared/assets/character';
import { CharacterIllustration } from '../CharacterIllustration';
import { CharacterMedallion } from '../CharacterMedallion';

function pictureOf(container: HTMLElement) {
  const picture = container.querySelector('picture');
  if (picture === null) throw new Error('picture 가 없다');
  const sources = [...picture.querySelectorAll('source')].map((source) => ({
    type: source.getAttribute('type'),
    srcset: source.getAttribute('srcset'),
  }));
  const img = picture.querySelector('img');
  return { picture, sources, img, lastChild: picture.lastElementChild };
}

describe('CharacterPicture — AVIF → WebP → PNG', () => {
  it('CharacterIllustration 이 picture 로 세 포맷을 순서대로 낸다', () => {
    const { container } = render(<CharacterIllustration asset="home-character" variant="stage" />);
    const { picture, sources, img, lastChild } = pictureOf(container);
    const asset = CHARACTER_ASSETS['home-character'];

    expect(sources).toEqual([
      { type: 'image/avif', srcset: asset.avif },
      { type: 'image/webp', srcset: asset.webp },
    ]);
    expect(img?.getAttribute('src')).toBe(asset.png);
    expect(lastChild).toBe(img);
    // 레이아웃 상자를 만들지 않는다 — 기존 `.haru-character-* img` 규칙이 그대로 맞는다.
    expect(picture.className).toBe('haru-character-picture');
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('CharacterMedallion 도 같은 구조다', () => {
    const { container } = render(<CharacterMedallion asset="hello-heart" size="lg" />);
    const { sources, img } = pictureOf(container);
    const asset = CHARACTER_ASSETS['hello-heart'];

    expect(sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(sources.map((source) => source.srcset)).toEqual([asset.avif, asset.webp]);
    expect(img?.getAttribute('src')).toBe(asset.png);
  });

  it('모든 캐릭터 에셋이 세 포맷을 가진다 (서로 다른 파일)', () => {
    for (const [name, asset] of Object.entries(CHARACTER_ASSETS)) {
      expect(asset.png, name).toMatch(/\.png/);
      expect(asset.webp, name).toMatch(/\.webp/);
      expect(asset.avif, name).toMatch(/\.avif/);
    }
  });
});
