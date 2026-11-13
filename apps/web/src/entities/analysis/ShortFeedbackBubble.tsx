/**
 * `ShortFeedbackBubble` — 세션 직후 짧은 피드백 (FR-13, Stage 5 Spec §2.3 · §3.5 `C13-S5-1`).
 *
 * 완료 화면 버블(`SessionCompleteBubble`, Figma `88:929`)을 **그대로** 쓴다 — tail top-center · `--bubble-*` 토큰 ·
 * 주 문구 Bold 16/22. 새 시각 언어 0 (Spec §2.3 원칙).
 *
 * 문구는 응답 `shortFeedback.text` 값만 표시한다 — 조립 · 보간 · 대체 문구 0 (AC-5-37, `rules/frontend.md` §8).
 * 보조 줄은 없다. `text` 가 없을 때 버블을 그리지 않는 판단은 호출자 몫이다.
 */
import { SessionCompleteBubble } from '../session';

export interface ShortFeedbackBubbleProps {
  text: string;
}

export function ShortFeedbackBubble({ text }: ShortFeedbackBubbleProps) {
  return <SessionCompleteBubble text={text} subtext={null} />;
}
