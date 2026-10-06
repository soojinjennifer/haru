import type { ComponentType } from 'react';

import { FlipToBack } from './FlipToBack';
import { SaveStar } from './SaveStar';
import { SessionHistory } from './SessionHistory';
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
 */
export const HARU_ICONS = {
  'haru:tab-center-home': TabCenterHome,
  'haru:flip-to-back': FlipToBack,
  'haru:save-star': SaveStar,
  'haru:session-history': SessionHistory,
} satisfies Record<`haru:${string}`, ComponentType>;

export type HaruIconName = keyof typeof HARU_ICONS;
