import { z } from 'zod';

/**
 * 회고 카드 체크 칩 키 — Stage 5 `N5-01` ⓐ (`D5-4`, 2026-11-08). 근거: PRD §7.6 · FR-12,
 * Figma `91:710`~`714` (`G-06` / `M-15` 해소), `docs/API_CONTRACTS.md` §2.2.
 *
 * PRD 체크 5종 ↔ Figma 칩 5종 **1:1** (`PF5-3` — on/off, 척도 아님):
 *
 * | 키 | PRD 항목 | Figma 칩 라벨 (`N5-20` ⓐ — 표시는 copy 모듈) |
 * |---|---|---|
 * | `engaged` | 아이 반응 | `Engaged` |
 * | `big_feelings` | 감정 표현 | `Big feelings` |
 * | `asked_questions` | 질문 여부 | `Ask Questions` |
 * | `stayed_focused` | 집중 시간 | `Stay Focus` |
 * | `tricky_today` | 어려웠던 점 | `Tricky today` |
 *
 * - 코드 키는 불변이다. 화면 라벨은 contracts 에 두지 않는다 (feature copy 모듈).
 * - 서버 폼 정의(`GET /v1/reflection-form`)는 없다 (`N5-03` ⓐ) — 칩 목록의 출처는 이 enum 하나다.
 * - 제출 값은 **선택된 키 배열**이다 (`SubmitReflectionRequest.checks`). 미선택 = false 로 해석한다.
 */
export const ReflectionCheckKeySchema = z.enum([
  'engaged',
  'big_feelings',
  'asked_questions',
  'stayed_focused',
  'tricky_today',
]);

export type ReflectionCheckKey = z.infer<typeof ReflectionCheckKeySchema>;
