import { z } from 'zod';

/**
 * 책이 서재에 들어온 경로. 근거: `docs/DATA_MODEL.md` §7, `docs/API_CONTRACTS.md` §2.2.
 *
 * | 값 | 경로 |
 * |---|---|
 * | `onboarding_favorite` | 온보딩 Step 3 "아이가 좋아하는 책" |
 * | `library_add` | 서재에서 직접 등록 (FR-23) |
 * | `gift_program` | 책 증정 프로그램 (FR-22) |
 * | `card_save` | Activity Card 의 `★ Save` |
 *
 * 화면은 이 값을 **표식으로 드러내지 않는다** (`L-OPEN-14`). 추천·분석 입력과 Backend 집계용이다.
 */
export const BookSourceSchema = z.enum([
  'onboarding_favorite',
  'library_add',
  'gift_program',
  'card_save',
]);

export type BookSource = z.infer<typeof BookSourceSchema>;
