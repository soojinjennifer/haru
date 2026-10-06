/**
 * `CharacterBubble` — Home 캐릭터 말풍선 (Figma `261:1293` = `Bubble` `type=Type2`).
 *
 * **주 문구는 `HomeSummary.characterLine` 값만** 표시한다. Frontend 가 문장을 만들거나 접두어를
 * 붙이지 않는다 (`rules/frontend.md` §8). 값이 없으면 **버블 자체를 렌더하지 않는다** — 그 판단은
 * 소비자가 하고 여기에서는 placeholder 를 만들지 않는다 (Stage 2 `S2-COPY-1` 빈 슬롯 규칙).
 *
 * **보조 한 줄(`hint`)은 화면이 소유하는 고정 안내**다 (`A-7`, approvals §12.8). Figma 슬롯이
 * 실재하므로 비워 두지 않는다 (최우선 규칙 3). 서버 값이 아니므로 copy 모듈에서 주입받는다.
 *
 * tail 은 **`bottom-right`** 다 (Figma 76.32%). 1차의 `bottom-left` 는 방향이 반대였다.
 *
 * ⚠ **닫기(x) 버튼은 Figma 에 없다** — 사용자 지시(2026-10-05)로 추가했다. 닫힘 범위를 이
 * 컴포넌트가 정하지 않는다: `onDismiss` 를 주는 쪽(`HomeStage`)이 소유한다.
 *
 * 이 문구가 **캐릭터의 의미를 전달하는 유일한 수단**이다 (일러스트는 `aria-hidden`).
 * 그래서 `aria-hidden` 을 걸지 않는다 (§10).
 *
 * 주 문구는 **4줄에서 말줄임**한다 (`clampContent`, `W-5` — approvals §13.3): 캐릭터 눈 상단
 * y=183 실측 기준으로 5줄(193)부터 얼굴을 덮는다. 길이는 서버(Mock) 값이라 Frontend 가
 * 보장할 수 없으므로 **"약 120자 이내" 는 Contract 요구사항으로 등록**하고(`docs/API_CONTRACTS.md`
 * §Home) 런타임은 말줄임으로 흡수한다 — schema 로 거부하면 긴 문구 하나가 Home 전체를
 * 빈 화면으로 만든다.
 */
import { SpeechBubble, Text } from '@haru/ui';

export interface CharacterBubbleProps {
  line: string;
  /** 보조 한 줄. 없으면 슬롯을 렌더하지 않는다. */
  hint?: string;
  /** 닫기. 주지 않으면 닫기 버튼을 렌더하지 않는다. */
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function CharacterBubble({ line, hint, onDismiss, dismissLabel }: CharacterBubbleProps) {
  return (
    <SpeechBubble
      tail="bottom-right"
      clampContent
      {...(hint === undefined ? {} : { hint: <span>{hint}</span> })}
      {...(onDismiss === undefined || dismissLabel === undefined
        ? {}
        : { onDismiss, dismissLabel })}
    >
      <Text variant="subheadline" weight="semibold">
        {line}
      </Text>
    </SpeechBubble>
  );
}
