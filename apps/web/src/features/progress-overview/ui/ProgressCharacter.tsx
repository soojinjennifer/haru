/**
 * `ProgressCharacter` — Figma `163:2642` (Spec §2.1.1 · `N7-27` · `N7-30`).
 *
 * 393 기준 347×422 @ (24, 14) — 앱 컬럼 leading edge 에서 시작해 trailing edge 를 2 넘는다(`--progress-character-overhang`).
 * 흐름 밖 **장식 배경 레이어**다 (`aria-hidden` · `alt=""` — `CharacterIllustration`). 본문 스택이 아래 34.6% 위에 겹친다.
 *
 * - 크롭: Figma 의 이미지 배치(h 146.15% · top −15.82%)를 **에셋에 미리 적용**했다(`shared/assets/character` `bookworm`,
 *   941×1144 = 347/422). 그래서 프레임에 `overflow: clip` 을 선언하지 않는다 — Spec 이 예정한 새 overflow 1건이 0건이 됐다
 *   (`R-SHADOW-1` ① · H7-3).
 * - 프레임 gradient fill(`#daebe5 → #d0e1dc`)은 그리지 않는다 (`N7-30` ⓐ · 허용 차이 후보 `AD7-5`).
 * - 모션 없음.
 */
import { CharacterIllustration } from '../../../entities/character';

export function ProgressCharacter() {
  return (
    <div className="haru-progress-overview__character">
      <CharacterIllustration asset="bookworm" variant="stage" />
    </div>
  );
}
