/**
 * 캐릭터 에셋 — Figma export (Stage 1 D-4 파이프라인), 사용 권리 `CONFIRMED (C-17)`.
 *
 * | key                | Figma node                      | 원본     | 표시 크기 | 배율 |
 * |--------------------|---------------------------------|----------|-----------|------|
 * | `hello-heart`      | `179:1704` (232² ellipse)       | 464²     | 232 (lg)  | 2.0x |
 * | `headphones`       | `179:1823` (188² ellipse)       | 376²     | 188 (md)  | 2.0x |
 * | `hello-heart-full` | `163:2529` → `179:1819` 배치    | 614×830  | 307 (w)   | 2.0x |
 * | `home-character`   | `26:22` (357×442 프레이밍)      | 915×1133 | 357 / 444 | 2.56x / 2.06x |
 * | `bookworm`         | `163:2643` → `163:2642` 크롭    | 941×1144 | 347 / 482 | 2.71x / 1.95x |
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
import bookwormAvif from './bookworm.avif';
import bookworm from './bookworm.png';
import bookwormWebp from './bookworm.webp';
import headphonesAvif from './headphones.avif';
import headphones from './headphones.png';
import headphonesWebp from './headphones.webp';
import homeCharacterAvif from './home-character.avif';
import homeCharacter from './home-character.png';
import homeCharacterWebp from './home-character.webp';
import helloHeartFullAvif from './hello-heart-full.avif';
import helloHeartFull from './hello-heart-full.png';
import helloHeartFullWebp from './hello-heart-full.webp';
import helloHeartAvif from './hello-heart.avif';
import helloHeart from './hello-heart.png';
import helloHeartWebp from './hello-heart.webp';

/**
 * 래스터 에셋 1종의 세 포맷 — `pnpm assets:optimize` 산출물 (Stage 4 `S4-J`, 이월 `QA-3-003`).
 *
 * `png` 이 마스터이자 fallback 이고, `avif` · `webp` 는 스크립트가 같은 디렉토리에 만든다.
 * 화면은 `<picture>` 로 **AVIF → WebP → PNG** 순서로 고른다 (`entities/character`).
 * 현재 품질은 **무손실**이라 세 포맷의 디코드 픽셀이 같다 — `scripts/assets-optimize.mjs` 머리말.
 */
export interface RasterAsset {
  readonly png: string;
  readonly webp: string;
  readonly avif: string;
}

export const CHARACTER_ASSETS = {
  'hello-heart': { png: helloHeart, webp: helloHeartWebp, avif: helloHeartAvif },
  'hello-heart-full': { png: helloHeartFull, webp: helloHeartFullWebp, avif: helloHeartFullAvif },
  'home-character': { png: homeCharacter, webp: homeCharacterWebp, avif: homeCharacterAvif },
  headphones: { png: headphones, webp: headphonesWebp, avif: headphonesAvif },
  bookworm: { png: bookworm, webp: bookwormWebp, avif: bookwormAvif },
} as const satisfies Record<string, RasterAsset>;

export type CharacterAssetName = keyof typeof CHARACTER_ASSETS;

/**
 * `home-character` — Stage 3 Home 배경 레이어 (Design Spec §2.2 · §12.10.1,
 * `CONFIRMED (D-13, stage-3-approvals.md §7.1 — C 안)`).
 *
 * **출처는 투명 원본 `Chracter/Haru_Hello_Heart_t 1.png` (933×1659) 하나뿐이다.** 쓰지 않는 것:
 *  - `Haru_Hello_Heart_t.png`(941 쪽) — 알파가 전부 255 인 **불투명 스크린샷본**
 *  - Figma `163:2532`(294×373) — **민트 배경이 구워져 있고** 현 에셋보다 해상도가 낮다
 *  - `벤치마킹/Moodeboard/HARU_Hello_heart.png`(1536×2752) — **다른 생성본**(눈·입·하트가 다르다)
 *
 * **2026-10-05 재export — 사용자가 Figma `26:22` 를 수정했다** (approvals §12.3 ⑦ · audit §10.2).
 * 박스가 `441×560`(aspect **0.7875**) → `357×442`(aspect **0.8077**) 로 바뀌었다. 단순 축소가
 * 아니라 **재크롭**이므로 기존 에셋을 그대로 쓰면 `object-fit: cover` 가 상하를 11.3px 더
 * 잘라 발끝을 침범한다.
 *
 * 처리: 기존 크롭(915×1162)에서 **상하를 1.21%씩 더 잘라** 915×1133(aspect 0.80759)로 맞췄다.
 * Figma 가 `26:22` 의 image fill 을 `object-fit: cover` 로 쓰므로, 같은 원본을 같은 규칙으로
 * 잘라낸 결과가 Figma 렌더와 일치한다. 원본을 다시 샘플링하지 않았다(정보 손실 없음).
 *
 * **픽셀 밀도**: 393px 뷰포트(표시 폭 357)에서 **2.56x**, ≥600px 의 480 컬럼(표시 폭 444)에서
 * **2.06x** 다 — 두 구간 모두 2x 이상이므로 **허용 차이 `AD-S3-25`(1.73x)는 해소되었다**.
 */

/**
 * `bookworm` — Stage 7 Progress 캐릭터 (Figma `163:2642` 프레임 347×422, 이미지 `163:2643`
 * "안경 쓴 책벌레 민트 하루", Spec §2.1.1 · `N7-27`).
 *
 * 출처: Figma `163:2643` image fill 원본 **941×1672 투명 PNG** (design-agent 가 Spec 작성 시 내려받은 것 —
 * 모서리 알파 0 확인). Figma 는 이 이미지를 프레임 폭 100% · **높이 146.15% · top −15.82%** 로 배치하고
 * 프레임이 `overflow-clip` 으로 자른다 (Spec §0.2 `[ctx]`).
 *
 * 처리: 그 크롭 창을 **에셋에 미리 적용**했다 — 배율 941/347 = 2.7118 → y 181.04 … 1325.43 를 잘라
 * **941×1144** (aspect 0.82227 = Figma 347/422 와 소수 5자리까지 같다). 다운샘플·업스케일 0.
 * 그래서 화면은 `object-fit: cover` 만으로 Figma 와 같은 창을 보이고 **새 `overflow` 선언이 필요 없다**
 * (`R-SHADOW-1` ① overflow 회피 — Spec 은 크롭용 `overflow: clip` 1건을 예정했으나 0건으로 줄였다, H7-3).
 * 프레임 gradient fill(`#daebe5 → #d0e1dc`)은 그리지 않는다 (`N7-30` ⓐ, 허용 차이 후보 `AD7-5`).
 */
