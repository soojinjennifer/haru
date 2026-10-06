/**
 * `WeekSummaryChip` — Design Spec §5.7 (`CONFIRMED (D-6 · stage-3-approvals §8.5 ④)`).
 *
 * Figma 의 두 칩(`26:40` clock + "12-day/115 Min", `30:91` star + "12-day streak")을 하나로
 * 통합하고 **표시 항목을 이번 주 세션 수 1개**로 바꾼 것이다 (`AD-S3-9`).
 *
 * 표시하지 않는 것: 누적 읽기 분(PRD 보조 요소에 없음) · 연속 일수(`D-6` 미채택, contract 에서
 * `streakDays` **삭제**). 이름이 `StreakChip` 에서 바뀐 이유가 그것이다.
 *
 * 문구는 **feature copy 모듈이 소유**한다 (`rules/frontend.md` §8). 이 컴포넌트는 포맷팅을
 * 하지 않는다 — "{n} this week" 인지 "None yet this week" 인지는 copy 가 정한다.
 *
 * 아이콘은 **Figma `50:161` 글리프**(`haru:session-history`)다. 한때 Lucide `star` 였다.
 *
 * ⚠️ `star` 역시 **Figma 근거가 있었다** — `30:91` 에 5각성 단일 채움 path 가 실재하고 fill
 * `#D0CCA1` · 13×13 으로 `50:161` 과 색·크기가 같다 (approvals §13.2 `A-23`-icon 판정 근거
 * 정정, 2026-10-06 실측). *"임의 변경"* 이 아니었다. `history` 를 택한 근거는 다음 4가지다.
 *  1. 이 칩이 표시하는 것은 **이번 주 세션 수**(`AD-S3-9`) 로 두 원본 칩의 내용(`115 Min` ·
 *     `12-day streak`) 어느 쪽도 아니다 → 어느 아이콘도 내용상 정확히 맞지 않는다.
 *  2. `star` 가 대표한 streak 는 **`D-6` 미채택**으로 contract 에서 `streakDays` 가 삭제됐다 —
 *     기각된 쪽의 표식이다.
 *  3. `star` 는 **성취·평점 언어**다. `rules/frontend.md` §8 이 진단·판정·비교 표현을 금지하고
 *     `D-7` 이 Figma 의 평점 기능을 같은 이유로 기각했다. 세션 수에 별을 붙이면 달성률 표식이 된다.
 *  4. `history`(시계 + 반시계 화살표)는 **지나간 활동**을 가리켜 "이번 주에 한 세션"과 맞는다.
 *
 * 크기 13×13 과 색은 사용 지점(`home-overview.css`)이 Tier 3 토큰으로 준다.
 */
import { Icon, Tag } from '@haru/ui';

export interface WeekSummaryChipProps {
  /** 보이는 라벨 (예: `3 this week`). */
  label: string;
  /** 아이콘만으로 의미를 전달하지 않기 위한 접근성 이름 (예: `3 storytimes this week`). */
  accessibleLabel: string;
}

export function WeekSummaryChip({ label, accessibleLabel }: WeekSummaryChipProps) {
  return (
    <Tag
      label={label}
      accessibleLabel={accessibleLabel}
      tone="neutral"
      size="sm"
      leadingIcon={<Icon name="haru:session-history" size="sm" decorative />}
    />
  );
}
