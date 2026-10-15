/**
 * `CharacterPicture` — 캐릭터 래스터 1종을 `<picture>` + `srcset` 으로 그린다
 * (Stage 1 `D-4` · Stage 4 `S4-J`, 이월 `QA-3-003`, AC-4-84).
 *
 * ```
 * <picture>                         display: contents — 레이아웃 상자를 만들지 않는다
 *   <source type="image/avif" srcset=…>
 *   <source type="image/webp" srcset=…>
 *   <img src=…png>                   fallback · 크기·object-fit 은 부모 CSS 가 img 에 건다
 * </picture>
 * ```
 *
 * `<picture>` 는 기본이 inline 상자라 감싸기만 해도 줄 상자가 생길 수 있다 → `display: contents`
 * 로 **기존 레이아웃을 그대로** 둔다 (`.haru-character-* img` 선택자도 그대로 맞는다).
 * 소스 1개당 후보가 1개(같은 해상도)인 이유: 에셋이 이미 표시 크기의 2배 안팎이다 (`index.ts` 표).
 *
 * 장식이다 — `alt=""`. 접근성 숨김은 부모(`aria-hidden`)가 맡는다.
 */
import type { RasterAsset } from '../../shared/assets/character';

export interface CharacterPictureProps {
  asset: RasterAsset;
}

export function CharacterPicture({ asset }: CharacterPictureProps) {
  return (
    <picture className="haru-character-picture">
      <source type="image/avif" srcSet={asset.avif} />
      <source type="image/webp" srcSet={asset.webp} />
      <img src={asset.png} alt="" decoding="async" />
    </picture>
  );
}
