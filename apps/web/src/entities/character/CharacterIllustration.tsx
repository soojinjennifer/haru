/**
 * `CharacterIllustration` — Design Spec §5.2 (Figma `179:1819`, 307×415).
 *
 * medallion 과 달리 **원형 클리핑이 없고 세로비를 유지**한다. 고정 높이를 주지 않는다 —
 * 200% 텍스트 확대에서 reflow 를 막지 않기 위해서다 (§5.2, AC-2-59).
 *
 * **장식이다** — `aria-hidden`. 의미는 주변 텍스트가 전달한다.
 */
import { CHARACTER_ASSETS, type CharacterAssetName } from '../../shared/assets/character';

/**
 * `default` — 폭 `min(100%, --size-illustration-max)` · 가운데 정렬 (Stage 2 화면).
 * `stage`   — **부모 폭을 그대로 채운다.** Stage 3 Home 의 배경 레이어처럼 bleed 기하를
 *             **부모가** 소유하는 경우다 (Stage 3 Design Spec §2.2). 307px 상한을 두면
 *             441/528 폭의 캐릭터가 나올 수 없다.
 */
export type CharacterIllustrationVariant = 'default' | 'stage';

export interface CharacterIllustrationProps {
  asset: CharacterAssetName;
  variant?: CharacterIllustrationVariant;
}

export function CharacterIllustration({ asset, variant = 'default' }: CharacterIllustrationProps) {
  return (
    <div
      className={`haru-character-illustration haru-character-illustration--${variant}`}
      aria-hidden="true"
    >
      <img src={CHARACTER_ASSETS[asset]} alt="" decoding="async" />
    </div>
  );
}
