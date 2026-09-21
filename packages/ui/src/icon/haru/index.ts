import type { ComponentType } from 'react';

import { TabCenterHome } from './TabCenterHome';

/**
 * HARU 전용 아이콘 — Design Spec §8.2.
 *
 * Stage 1 export 대상은 `tab-center-home` **1건뿐**이다 (§11-6).
 * 나머지 14 symbol 은 해당 Stage 에서 export 한다.
 */
export const HARU_ICONS = {
  'haru:tab-center-home': TabCenterHome,
} satisfies Record<`haru:${string}`, ComponentType>;

export type HaruIconName = keyof typeof HARU_ICONS;
