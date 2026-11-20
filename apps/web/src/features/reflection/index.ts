/**
 * `features/reflection` 공개 진입점 — Stage 5 세션 회고 카드 (Plan §9 · `S5-B`, FR-12).
 * 완료 화면(`features/storytime-session`)과의 조립은 `pages/session` 이 한다 (feature 간 import 금지).
 */
export { ReflectionCard } from './ui/ReflectionCard';
export type { ReflectionCardProps } from './ui/ReflectionCard';
export { reflectionCopy } from './copy';
