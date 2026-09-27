/**
 * 캐릭터 에셋 — Figma export (Stage 1 D-4 파이프라인), 사용 권리 `CONFIRMED (C-17)`.
 *
 * | key                | Figma node                      | 원본     | 표시 크기 | 배율 |
 * |--------------------|---------------------------------|----------|-----------|------|
 * | `hello-heart`      | `179:1704` (232² ellipse)       | 464²     | 232 (lg)  | 2.0x |
 * | `headphones`       | `179:1823` (188² ellipse)       | 376²     | 188 (md)  | 2.0x |
 * | `hello-heart-full` | `163:2529` → `179:1819` 배치    | 614×830  | 307 (w)   | 2.0x |
 *
 * **medallion 계열(`hello-heart` · `headphones`)은 정사각형이 정상이다.** 소스 노드가
 * 지름 232 / 188 의 **원형 ellipse** 이고, 파일에 들어 있는 image fill 비트맵이 각각
 * 464² · 376² 라서 표시 크기의 정확히 2배 래스터가 된다. 원본 PNG 를 더 키우지 않는다.
 *
 * `hello-heart-full` 은 `CharacterIllustration` 전용이다 (`QA-2-004`). 배치 노드 `179:1819`
 * 는 medallion 과 **다른 노드**이며 307×415(비율 0.74)로 캐릭터 전신을 담는다.
 *
 * **2026-09-27 갱신 — 1.0x 제약이 해소되었다.** 이전에는 `179:1819` 의 image fill 이
 * **294×373 JPEG**(표시 크기보다 작다)라서 2배 래스터가 업스케일이 되어 1.0x 로 두었다.
 * 사용자가 Figma `221:1147`("Chracter" 섹션)에 같은 아트워크의 **941×1672 투명 PNG**
 * (`163:2529` fill, 캐릭터 실체 847×997)를 올려 두었으므로, 그 원본을 `179:1819` 의
 * 프레이밍(object-cover 307×415)에 맞춰 **614×830 = 정확히 2배**로 다운샘플해 교체했다.
 * 업스케일이 아니라 다운샘플이므로 없는 정보를 지어내지 않는다.
 *
 * 새 원본은 **배경이 투명**하다 — 기존 JPEG 에 구워져 있던 세로 그라데이션 사각형이
 * 사라지고 캐릭터가 앱 배경(`AppBackground`) 위에 바로 얹힌다. Figma `179:1809` 에서도
 * 그 사각형은 프레임 배경과 거의 같은 색이라 보이지 않는 것이 의도된 모습이다.
 * 기하(위치·크기)는 교체 전과 동일하다 — 캐릭터 bounds 를 원본 JPEG 에 맞춰 정렬했다.
 */
import headphones from './headphones.png';
import helloHeartFull from './hello-heart-full.png';
import helloHeart from './hello-heart.png';

export const CHARACTER_ASSETS = {
  'hello-heart': helloHeart,
  'hello-heart-full': helloHeartFull,
  headphones,
} as const;

export type CharacterAssetName = keyof typeof CHARACTER_ASSETS;
