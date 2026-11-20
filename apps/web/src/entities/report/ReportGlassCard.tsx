/**
 * `ReportGlassCard` — Stage 7 Spec §2.0 "데이터 카드 (Glass Rest)" recipe.
 *
 * Figma `163:2551`(This week's reading) · `110:835`(4-week full report) 는 **HTML import** 형식이라 변수 바인딩이 0 이다
 * (`M7-1` · `R7-09`). raw 값은 Spec §0.3 흡수표로 기존 토큰에 대응된다:
 *
 * | Figma raw | 토큰 |
 * |---|---|
 * | white 82% + backdrop-blur 12 | `Surface fill="card"` (`--color-surface-card` · blur 12, `T7-3`) |
 * | drop `0 2 4 / 0 12 28 / 0 28 56` + inset 2겹 | `material="rest"` = `--shadow-glass-rest` (3겹 전부 일치 — `R-FIGMA-1` ③) |
 * | radius 24 | `radius="surface"` 22 (확정 흡수 규칙 — 허용 차이 후보 `AD7-10`) |
 * | pad 16 | `padding="4"` |
 *
 * ⚠️ `R-SHADOW-1` — Glass Rest 번짐은 **좌우 28~32 · 위 22 · 아래 77**(rules §6-1 ③ 실측)이다. 이 카드를 `overflow` 가
 * `visible` 이 아닌 박스 안에 두면 inset 을 함께 설계해야 한다. `/progress` 는 `AppShell` 뷰포트(앱 컬럼 **바깥**, 뷰포트
 * 전 폭) 하나뿐이라 새 inset 이 필요 없다 — `e2e/progress.spec.ts` 의 세로·가로 프로브가 지킨다.
 */
import { Surface } from '@haru/ui';
import type { ReactNode } from 'react';

export interface ReportGlassCardProps {
  children: ReactNode;
}

export function ReportGlassCard({ children }: ReportGlassCardProps) {
  return (
    <Surface fill="card" material="rest" radius="surface" padding="4">
      {children}
    </Surface>
  );
}
