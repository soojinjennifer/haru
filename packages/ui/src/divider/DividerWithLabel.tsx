export interface DividerWithLabelProps {
  /** 예: "or with email". 문구는 소비자가 소유한다. */
  label: string;
}

/**
 * DividerWithLabel — Stage 2 Design Spec §4.5 (Figma `179:1839–1841`).
 *
 * 장식 rule 은 `aria-hidden` 이고 라벨은 일반 텍스트다.
 * `role="separator"` 를 쓰지 않는다 — 폼 안에 들어가는 구분 문구이며 폼 구조를 깨지 않는다.
 */
export function DividerWithLabel({ label }: DividerWithLabelProps) {
  return (
    <div className="haru-divider-with-label">
      <span className="haru-divider-with-label__rule" aria-hidden="true" />
      <span className="haru-divider-with-label__label">{label}</span>
      <span className="haru-divider-with-label__rule" aria-hidden="true" />
    </div>
  );
}
