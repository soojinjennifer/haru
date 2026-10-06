/**
 * 4대 내적 역량의 **화면 표시 라벨** — `CONFIRMED (Stage 0 #14)`.
 *
 * contracts 는 코드 키만 갖는다 (`emotion_regulation` …). 라벨을 여기에 두는 이유는 라벨
 * 변경이 데이터 migration 을 유발하지 않게 하기 위해서다 (#14).
 *
 * **`" Day"` suffix 를 붙이지 않는다** (`CONFIRMED (N-3)` + `D-22`). Figma `163:2650` 의
 * "Emotion Day  Day"(오타 M-13)와 `163:2651` 의 "Intrinsic Motivation Day" 를 복제하지
 * 않는다 — `D-5` 로 카드마다 역량이 달라져 "오늘의 X Day" 라는 의미 자체가 성립하지 않는다
 * (Stage 3 Design Spec §5.2 · 허용 차이 `AD-S3-2`).
 *
 * 역량 색은 copy 가 아니라 design token 이다 (#19).
 */
import type { Capability } from '@haru/contracts';

export const capabilityCopy: Readonly<Record<Capability, string>> = {
  emotion_regulation: 'Emotion Regulation',
  self_directed_agency: 'Self-Direction',
  cognitive_flexibility: 'Cognitive Flexibility',
  intrinsic_motivation: 'Intrinsic Motivation',
};
