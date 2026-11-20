/**
 * `entities/reflection` 회고 체크 라벨 copy — Stage 5 회고 카드 칩 문구의 **단일 정의**.
 *
 * Stage 7 `M7-4` → `N7-43` (`D7-5`): 원래 `features/reflection/copy.ts` 에 있었으나, 리포트 상세
 * (`features/report-detail` — 부모 피드백 요약 `checkTrends`)도 같은 라벨을 쓴다. feature 간 import 는
 * 금지(`rules/architecture.md` §3)이므로 두 feature 가 함께 의존할 수 있는 entity 로 옮겼다.
 * 문구 · 순서는 Stage 5 그대로 (Figma `91:710`~`714` override 원문 — 대소문자 포함, `N5-20` ⓐ).
 */
import type { ReflectionCheckKey } from '@haru/contracts';

/** Figma `91:709` 칩 순서 (왼쪽 위 → 오른쪽 아래). */
export const REFLECTION_CHECK_ORDER: readonly ReflectionCheckKey[] = [
  'engaged',
  'big_feelings',
  'asked_questions',
  'stayed_focused',
  'tricky_today',
];

/** 키 = contracts `ReflectionCheckKey`. */
export const reflectionCheckLabels = {
  engaged: 'Engaged',
  big_feelings: 'Big feelings',
  asked_questions: 'Ask Questions',
  stayed_focused: 'Stay Focus',
  tricky_today: 'Tricky today',
} as const satisfies Readonly<Record<ReflectionCheckKey, string>>;
