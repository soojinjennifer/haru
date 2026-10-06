/**
 * Prompt 단계 배지 라벨 — `CONFIRMED (D-8, stage-3-approvals.md §8.1)`.
 *
 * Figma `Pagetag1`/`Pagetag2` 가 `PRE` / `POST` 다. **대문자는 copy 값 자체**이며
 * `text-transform: uppercase` 를 쓰지 않는다 — 스크린리더가 철자 단위로 읽는 문제를 피한다
 * (Design Spec §5.4.1 타이포 행).
 *
 * `pageRef` 는 **서버 문자열을 그대로** 출력한다 (예: `P.6`). Frontend 가 페이지 번호를
 * 계산·추정·포맷하지 않으므로 여기에 형식 문자열을 두지 않는다.
 */
import type { PromptPhase } from '@haru/contracts';

export const promptPhaseCopy: Readonly<Record<PromptPhase, string>> = {
  pre: 'PRE',
  post: 'POST',
};
