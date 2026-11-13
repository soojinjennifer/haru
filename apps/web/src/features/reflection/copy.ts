/**
 * `features/reflection` 사용자 노출 문구 — 영어 1차 (`rules/frontend.md` §8). Stage 5 `S5-B` 회고 카드 `91:691`.
 *
 * | 키 | 근거 |
 * |---|---|
 * | `title` | Figma `91:692` *"How was storytime with Emma?"* — 이름 슬롯 = `Me.child.firstName` (`N5-04` ⓐ, `PF5-6`) |
 * | `checks` | Figma `91:710`~`714` override 원문 그대로 (`N5-20` ⓐ — 대소문자 포함). 키 = contracts `ReflectionCheckKey` |
 * | `notePlaceholder` | Figma `91:716` 원문. 보이는 라벨이 없어 접근성 이름에도 같은 문구를 쓴다 (Spec §9.1) |
 * | `save` | Figma `91:717` `Save` |
 * | `star` | Spec §3.1 *"1 star"* … *"5 stars"* |
 * | `saved` · `offline` · `saveReason` | Spec §2.2 S5 · S4 · §9.1 초안 → `D5-4` 승인 (`N5-31` · `N5-24` 문구 Spec 초안대로) |
 *
 * 진단·판정·비교 표현 0 (AC-5-44). 이 카드는 아이에 대한 문구를 만들지 않는다 — 버블·피드백은 API 값만.
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

export const reflectionCopy = {
  title: (childFirstName: string) => `How was storytime with ${childFirstName}?`,
  checks: {
    engaged: 'Engaged',
    big_feelings: 'Big feelings',
    asked_questions: 'Ask Questions',
    stayed_focused: 'Stay Focus',
    tricky_today: 'Tricky today',
  } satisfies Readonly<Record<ReflectionCheckKey, string>>,
  notePlaceholder: 'Anything to talk about this time? (optional)',
  save: 'Save',
  star: (count: number) => (count === 1 ? '1 star' : `${String(count)} stars`),
  saved: 'Thanks — saved.',
  offline: "You're offline — your notes are still here. Tap Save when you're back online.",
  saveReason: 'Choose stars, a tag, or add a note to save.',
} as const;
