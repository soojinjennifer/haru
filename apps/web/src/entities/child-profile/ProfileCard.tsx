/**
 * `ProfileCard` — Stage 6 Spec §3.4 "ProfileCard recipe" (Figma `163:2607` Report "Growth themes" 카드 근거).
 *
 * | 항목 | 값 |
 * |---|---|
 * | 면 | white 90% → `Surface fill="strong"` |
 * | radius | 24 → **22 흡수** (`P-12` 확정 규칙) → `radius="surface"` |
 * | padding · gap | 16 · 12 → `padding="4"` · 내부 `gap-3` |
 * | 그림자 | 인스턴스 렌더 1겹 + inset 2겹 → `material="bubble"` (`--shadow-bubble`, `T6-9`) |
 *
 * 긴 이름(40자)은 줄바꿈한다 — `overflow-wrap: break-word` (Spec §11.2, Stage 5 `D5-14` 교훈).
 *
 * 표시 전용 (Domain recipe). 번짐 좌우 4 · 아래 10 이라 `AppShell` 뷰포트 안에서 inset 이 필요 없다 (Spec §9.5).
 */
import { Surface } from '@haru/ui';
import type { ReactNode } from 'react';

export interface ProfileCardProps {
  children: ReactNode;
  /** 카드 묶음의 접근성 이름 연결 (`aria-labelledby` 는 내부 heading 이 맡는다). */
  as?: 'section' | 'div';
}

export function ProfileCard({ children, as = 'section' }: ProfileCardProps) {
  return (
    <Surface as={as} material="bubble" fill="strong" radius="surface" padding="4">
      <div className="flex flex-col gap-3 break-words">{children}</div>
    </Surface>
  );
}
