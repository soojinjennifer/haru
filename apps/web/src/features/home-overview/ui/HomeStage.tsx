/**
 * `HomeStage` — Home 본문 조립 (Figma `26:21` 실측 2026-10-05).
 *
 * ```
 * 393×852 기준 확정 좌표 (audit §11.1 + §16.0)
 *   0                                     뷰포트 상단
 *  48  헤더 끝                            (HomeTopBar 소유)
 *  51  Bubble (39, 51) 303 폭
 *      ─ spacer (flex) ─
 * 296  카드 앞면 상단 (뒷면은 290 — 두 면이 하단 정렬이라 **하단 705 가 같다**)
 * 705  카드 하단
 * 717  PageIndicator (174, 717) 46×7      ← 간격 12
 * 766  BottomTabBar (24, 766) 345×70      ← 간격 42
 * 852                                     ← 하단 간격 16
 * ```
 *
 * [레이어 0] 캐릭터 `26:22` — (24, 29) 357×442. 흐름 밖 배경이며 **장식**(`aria-hidden`)이다.
 * [레이어 1] 흐름 — 버블 → spacer → 덱(트랙 + dots)
 *
 * **Figma 에 없는 블록을 두지 않는다** (최우선 규칙 2):
 *  - `HomeFooterNote`(지난 세션 하이라이트 한 줄) — 자리가 없다 (audit §19-10)
 *  - `ActiveSessionNotice`(이어하기 안내) — **제거**했다 (`V-15`, approvals §12.14). 진행 중
 *    세션은 **버블의 `characterLine`(서버 값)이 말한다** → 신규 UI 0건이고 캐릭터 얼굴을
 *    가리지 않는다. `AC-3-15` 의 검증 지점이 버블로 이동한다.
 *
 * ⚠ **예외 1건 — 버블 닫기(x) 버튼은 Figma 에 없다.** 사용자 지시(2026-10-05)로 추가했으며
 * **허용 차이 등록 + 디자이너 확인** 대상이다. 버블은 **내용에 따라 2줄 이상으로 자라며**,
 * 늘어난 높이는 spacer 가 흡수하므로 트랙(290)·dots(717)·탭바(766)는 움직이지 않는다.
 *
 * 덱은 **슬롯으로 받는다** — `features/A → features/B` 직접 import 금지(`AC-3-03`)이므로
 * 조립은 Page 가 한다 (`rules/architecture.md` §3).
 */
import { Skeleton } from '@haru/ui';
import { useState, type ReactNode } from 'react';

import { CharacterIllustration } from '../../../entities/character';
import { CharacterBubble, useHomeSummary } from '../../../entities/home';
import { homeOverviewCopy } from '../copy';

export interface HomeStageProps {
  /** Activity Card 덱 (Page 가 주입한다). */
  deck: ReactNode;
}

export function HomeStage({ deck }: HomeStageProps) {
  const { summary, isPending } = useHomeSummary();
  /*
    ── 닫기 범위: **지금 그 문구에 한정** (사용자 지시 2026-10-05) ──
    닫은 **문구 자체**를 기억한다. 그래서
     ① 저장소를 쓰지 않는다 — `localStorage`/`sessionStorage` 는 범위·Privacy 확대라
        승인 대상이다 (`rules/architecture.md` §9).
     ② `characterLine` 이 **바뀌면 다시 보인다** — `home:session-already-active` 처럼
        상태를 알리는 문구가 닫힌 채로 묻히지 않는다 (`AC-3-15` 검증 지점이 버블이다).
     ③ 선례와 같은 모양이다 (`onboarding-survey` 의 `TrialNotice` `dismissed` state).
    렌더 중 비교라 effect 가 필요 없다.
  */
  const [dismissedLine, setDismissedLine] = useState<string | null>(null);

  const characterLine = summary?.characterLine ?? null;
  const showBubble =
    characterLine !== null && characterLine.length > 0 && characterLine !== dismissedLine;

  return (
    <div className="haru-home-stage">
      <div className="haru-home-stage__character">
        <CharacterIllustration asset="home-character" variant="stage" />
      </div>

      <div className="haru-home-stage__content">
        <div className="haru-home-stage__bubble">
          {isPending ? (
            <Skeleton shape="text" lines={2} />
          ) : !showBubble || characterLine === null ? null : (
            <CharacterBubble
              line={characterLine}
              hint={homeOverviewCopy.bubbleHint}
              dismissLabel={homeOverviewCopy.bubbleDismiss}
              onDismiss={() => {
                setDismissedLine(characterLine);
              }}
            />
          )}
        </div>

        <div className="haru-home-stage__spacer" />

        {deck}
      </div>
    </div>
  );
}
