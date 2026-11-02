/**
 * `SessionCompleteBubble` — 완료 버블 (Figma `88:929`, Stage 4 Spec §2.7.2, FR-10 · `D4-87`).
 *
 * 문구는 응답 `completionBubble` 값만 표시한다. 주 문구는 `88:929` 인스턴스 override 대로 **Bold** 16/22 다.
 * 보조 줄(`subtext`)도 응답 값 그대로다 — 녹음 시간으로 조립하지 않는다 (`rules/architecture.md` §8).
 * 값이 없으면 줄을 렌더하지 않는다. 주 문구가 없을 때 버블을 그리지 않는 판단은 호출자 몫이다 (`D4-95`).
 */
import { SpeechBubble, Text } from '@haru/ui';

export interface SessionCompleteBubbleProps {
  text: string;
  subtext: string | null;
}

export function SessionCompleteBubble({ text, subtext }: SessionCompleteBubbleProps) {
  return (
    <div className="haru-session-bubble haru-session-bubble--complete">
      <SpeechBubble tail="top-center" align="center">
        <Text variant="callout" weight="bold" tone="primary">
          {text}
        </Text>
        {subtext === null ? null : <p className="haru-session-bubble__subtext">{subtext}</p>}
      </SpeechBubble>
    </div>
  );
}
