import { Surface } from '../surface/Surface';
import { Text } from '../text/Text';

export interface StatTileProps {
  /** 표시할 값 — **포맷된 문자열**이다 (예: `"5"` · `"62m"`). 숫자 포맷은 호출부가 한다. */
  value: string;
  /** 값 아래 라벨 (예: `"sessions"`). 값과 이어 읽힌다 → SR *"5 sessions"*. */
  label: string;
}

/**
 * StatTile — Stage 7 Design Spec §3.1 (Figma `163:2545` · `163:2548`, `D7-5`).
 *
 * 도메인 비의존 — 값의 의미(세션 수 · 분)를 모른다. 행(2열 flex-1 · gap 10 · 높이 84)은 호출 측이 배치한다
 * (`--stat-tile-row-block-size`). 이 컴포넌트의 루트가 flex 아이템이 될 수 있게 `flex: 1 1 0` 을 갖는다.
 *
 * 구조
 * ```
 * div.haru-stat-tile                       (flex 아이템 — 폭은 행이 정한다)
 * └─ Surface fill="strong" material="bubble" radius="surface"   (163:2607 과 같은 인스턴스 렌더 — V-10 선례)
 *    └─ p.haru-stat-tile__body             (pad 13/8 · gap 5 · 가운데 정렬)
 *       ├─ span 값   Heavy 24 · primary
 *       └─ Text 라벨 caption-2 · medium · secondary (P-01)
 * ```
 *
 * - radius Figma 20 → `--radius-surface` 22 (Δ+2, Spec §3.1).
 * - **`overflow` 없음** — Figma 행 `163:2544` 의 `overflow-clip` 은 재현하지 않는다 (`M7-9` · `R-SHADOW-1` ①).
 *   `--shadow-bubble` 번짐은 좌우 4 · 위 0 · 아래 10 이다.
 * - 값과 라벨은 한 `<p>` 안의 순서 텍스트라 SR 이 *"5 sessions"* 로 이어 읽는다 (장식 없음).
 */
export function StatTile({ value, label }: StatTileProps) {
  return (
    <div className="haru-stat-tile">
      <Surface fill="strong" material="bubble" radius="surface">
        <p className="haru-stat-tile__body">
          <span className="haru-stat-tile__value">{value}</span>{' '}
          <Text as="span" variant="caption-2" weight="medium" tone="secondary">
            {label}
          </Text>
        </p>
      </Surface>
    </div>
  );
}
