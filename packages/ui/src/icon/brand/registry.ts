/**
 * 브랜드 마크 레지스트리 — **공식 에셋만** (결정 `D-15`).
 *
 * 일반 아이콘(`Icon` · Lucide · `haru:*`)과 **분리**되어 있다. 브랜드 마크는
 * 토큰화·재색상·크기 임의 변경이 금지되므로 `Icon` 레지스트리에 섞지 않는다.
 */
import type { ComponentType } from 'react';

import { AppleMark } from './AppleMark';
import { GoogleMark } from './GoogleMark';

export const BRAND_MARKS = {
  'brand:google': GoogleMark,
  'brand:apple': AppleMark,
} satisfies Record<`brand:${string}`, ComponentType>;

export type BrandMarkName = keyof typeof BRAND_MARKS;
