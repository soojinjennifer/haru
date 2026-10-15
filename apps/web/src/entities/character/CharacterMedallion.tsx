/**
 * `CharacterMedallion` — Design Spec §5.1 (Figma `179:1703/1704` · `179:1822/1823`).
 *
 * 원형 medallion 안에 캐릭터 정지 이미지를 놓는다. Figma 실측상 ellipse 와 character 의
 * bounds 가 같아 **ring 이 없다** — ring / ring-offset 은 Stage 2 에서 값을 정하지 않는다
 * (`NEEDS DECISION` §13.1 ⑨).
 *
 * 크기: `lg` 232(`/auth/welcome`) · `md` 188(`/auth/log-in`) · `sm` 136(`가값 P-16`, 사용처 없음).
 * 소개 화면의 200 은 `md` 로 흡수한다 (허용 차이 `AD-S2-3`).
 *
 * **장식이다** — `aria-hidden`. 의미가 필요하면 주변 텍스트가 전달한다.
 * Stage 2 는 정지 이미지만 쓴다 (idle / listening / celebrate 는 Stage 4).
 */
import { CHARACTER_ASSETS, type CharacterAssetName } from '../../shared/assets/character';

import { CharacterPicture } from './CharacterPicture';

export type CharacterMedallionSize = 'sm' | 'md' | 'lg';

export interface CharacterMedallionProps {
  asset: CharacterAssetName;
  size?: CharacterMedallionSize;
}

export function CharacterMedallion({ asset, size = 'md' }: CharacterMedallionProps) {
  return (
    <div
      className={`haru-character-medallion haru-character-medallion--${size}`}
      aria-hidden="true"
    >
      <CharacterPicture asset={CHARACTER_ASSETS[asset]} />
    </div>
  );
}
