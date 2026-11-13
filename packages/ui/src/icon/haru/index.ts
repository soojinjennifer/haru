import type { ComponentType } from 'react';

import { CarouselNext } from './CarouselNext';
import { CarouselPrevious } from './CarouselPrevious';
import { FlipToBack } from './FlipToBack';
import { RatingStar } from './RatingStar';
import { RecordMic } from './RecordMic';
import { RecordMicOff } from './RecordMicOff';
import { RecordPause } from './RecordPause';
import { SaveStar } from './SaveStar';
import { SessionClose } from './SessionClose';
import { SessionHistory } from './SessionHistory';
import { StickerThumb } from './StickerThumb';
import { TabCenterHome } from './TabCenterHome';

/**
 * HARU 전용 아이콘 — Design Spec §8.2.
 *
 * Stage 1 = `tab-center-home` 1건.
 * Stage 3 Home 재구현(2026-10-05, Figma 재대조)에서 **2건 추가**했다 — 둘 다 Lucide 에 같은
 * 글리프가 없어 Figma SVG export 가 유일한 경로다 (Stage 0 #21, audit §16.8).
 *  - `flip-to-back` — 카드 앞/뒷면 전환 (`I163:2649;85:588`, 에셋명 `flip_to_back`)
 *  - `save-star`    — `★ Save` 의 14×13 별 (`I86:373;117:973`)
 *
 * Visual Gap 3차 결정(2026-10-06, approvals §13.2 `A-23`-icon)에서 **1건 추가** — 역시 Lucide
 * 에 같은 채움 글리프가 없다.
 *  - `session-history` — Home 헤더 칩의 13×13 `history` 글리프 (`50:161`)
 *
 * Stage 4 `S4-F1`(세션 ready)에서 **2건 추가** — Record Control 의 40×40 글리프 (Stage 4 Design Spec
 * §2.6.3). Lucide 의 같은 이름 글리프는 외곽선·둥근 끝이라 Figma 채움 도형과 다르다.
 *  - `record-mic`   — `Record` 변형 마이크 (`139:2838`)
 *  - `record-pause` — `Pause` 변형 막대 2개, radius 0 (`140:2866`)
 *
 * Stage 4b `S4-F1R`(Visual Gap `VG-F1-01`)에서 **1건 추가** — Lucide `x` 와 기하가 다르다.
 *  - `session-close` — 세션 닫기 X 15×15 (`29:77` = `300:1319`, 4b Spec §16.4)
 *
 * Stage 4b `S4-F2` 후속(Visual Gap `VG-F2-01`)에서 **1건 추가** — path 는 Lucide `mic-off` 와 같으나
 * stroke 가 24 기준 2(Figma) ↔ HARU Lucide 규격 1.5 로 달라 Figma export 로 교체했다.
 *  - `record-mic-off` — `PermissionDenied` 변형 마이크 끔 40×40 (`298:1254`)
 *
 * Stage 4b `S4-G2`(Prompt Drawer `88:960`)에서 **2건 추가** — 채움 chevron 이라 Lucide 외곽선과 도형이 다르다.
 *  - `carousel-previous` · `carousel-next` — 캐러셀 좌우 화살표 24×24 (`88:708` · `86:324`)
 *
 * Stage 4b `S4-H1`(완료 화면 `29:62`)에서 **1건 추가** — Figma 는 채움, Lucide `thumbs-up` 은 외곽선이다.
 *  - `sticker-thumb` — 출석 스티커 타일 엄지 20×20 (`90:602`)
 *
 * Stage 5 `S5-B`(회고 카드 `91:691`)에서 **1건 추가** — Lucide `star` 는 외곽선이고 `117:879` 와도 도형이 다르다.
 *  - `rating-star` — 별점 30×30 (`91:694`, Stage 5 Spec §3.1 · M-1)
 */
export const HARU_ICONS = {
  'haru:tab-center-home': TabCenterHome,
  'haru:flip-to-back': FlipToBack,
  'haru:save-star': SaveStar,
  'haru:session-history': SessionHistory,
  'haru:record-mic': RecordMic,
  'haru:record-mic-off': RecordMicOff,
  'haru:record-pause': RecordPause,
  'haru:session-close': SessionClose,
  'haru:carousel-previous': CarouselPrevious,
  'haru:carousel-next': CarouselNext,
  'haru:sticker-thumb': StickerThumb,
  'haru:rating-star': RatingStar,
} satisfies Record<`haru:${string}`, ComponentType>;

export type HaruIconName = keyof typeof HARU_ICONS;
