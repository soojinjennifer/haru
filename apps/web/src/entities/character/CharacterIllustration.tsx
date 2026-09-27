/**
 * `CharacterIllustration` — Design Spec §5.2 (Figma `179:1819`, 307×415).
 *
 * medallion 과 달리 **원형 클리핑이 없고 세로비를 유지**한다. 고정 높이를 주지 않는다 —
 * 200% 텍스트 확대에서 reflow 를 막지 않기 위해서다 (§5.2, AC-2-59).
 *
 * **장식이다** — `aria-hidden`. 의미는 주변 텍스트가 전달한다.
 */
import { CHARACTER_ASSETS, type CharacterAssetName } from '../../shared/assets/character';

export interface CharacterIllustrationProps {
  asset: CharacterAssetName;
}

export function CharacterIllustration({ asset }: CharacterIllustrationProps) {
  return (
    <div className="haru-character-illustration" aria-hidden="true">
      <img src={CHARACTER_ASSETS[asset]} alt="" decoding="async" />
    </div>
  );
}
