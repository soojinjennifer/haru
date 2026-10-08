/**
 * `SaveButton` — `★ Save` (Figma `I86:373;117:973` `Button/White`, 87×45).
 *
 * ── 토글이다 (`G-13`, approvals §12.10) ──
 * 다시 누르면 해제된다. **저장됨 상태의 시각 변형이 Figma 에 없다** — 별이 이미 채워진 금색
 * 이라 채움/윤곽으로 상태를 만들 수 없다. 그래서 상태는 **라벨 `Save` → `Saved`**(색과 무관한
 * 1급 수단, `rules/frontend.md` §9)와 `aria-pressed` 로만 전달하고, **면 색·테두리를 임의로
 * 추가하지 않는다** (최우선 규칙 2 — Figma 에 없는 것을 만들지 않는다). `D-REQ-1a` 대기.
 *
 * ── 폭 ──
 * Figma 87 은 **고정이 아니라 `min-inline-size`** 다. `Saved` 로 한 글자 길어져도 잘리지
 * 않아야 하고, 늘어난 만큼은 `flex:1` 인 `Start Session` 이 흡수해 **ActionBar 1행**이 유지된다.
 *
 * ── 왜 `packages/ui` 의 `Button` 이 아닌가 ──
 * `Button` 은 `--button-padding-x`(24) · 라벨 17 을 쓰는 다른 Figma 인스턴스(`17:20`)의
 * 규격이다. 이 버튼은 padding 14 · gap 7 · 라벨 15/13 이라 공유 토큰을 덮어써야 하는데,
 * 그러면 모든 화면의 Button 이 바뀐다. Shared UI 신규 0건 원칙(audit §16.8)을 지키면서
 * 도메인 규격을 갖는 방법은 도메인 버튼이다 (`.haru-activity-card__context-trigger` 선례).
 *
 * ── `disabled` (Library 2라운드-2) ──
 * `LibraryShelfSheet` 의 ActionBar 는 **대상 책이 없다**: Figma `163:1898`(`type=shelf`)에
 * ActionBar 가 실재해 그리지만(approvals §17.2 — "Figma 대로 넣는다"), 행 탭은 선택이 아니라
 * `BookDetailSheet` **교체 전환**이고 `type=selected` 변형은 **미구현**(확정 결정)이라
 * 저장할 책이 정해지지 않는다. 그래서 그 자리에서는 `Start Session` 과 **같은 방식**으로
 * `aria-disabled` + 누름 무시다 (`D-3` 의 "설명 슬롯이 비면 설명 없이 `aria-disabled` 만").
 * native `disabled` 를 쓰지 않는 이유도 같다 — 포커스를 잃으면 존재를 전달할 수 없다.
 */
import { Icon } from '@haru/ui';

export interface SaveButtonCopy {
  /** 미저장 라벨 (Figma `Save`). */
  save: string;
  /** 저장됨 라벨 (`Saved` — Figma 에 문구가 없다, `D-REQ-1b`). */
  saved: string;
}

export interface SaveButtonProps {
  saved: boolean;
  copy: SaveButtonCopy;
  /** 전송 중 — 낙관적 갱신이 이미 라벨을 바꿨으므로 **비활성화하지 않는다**. */
  busy?: boolean;
  /** 대상 책이 없는 자리 (`LibraryShelfSheet` ActionBar) — `aria-disabled` + 누름 무시. */
  disabled?: boolean;
  onToggle: () => void;
}

export function SaveButton({
  saved,
  copy,
  busy = false,
  disabled = false,
  onToggle,
}: SaveButtonProps) {
  return (
    <button
      type="button"
      className="haru-activity-card__save haru-focus-ring"
      aria-pressed={saved}
      {...(busy ? { 'aria-busy': true } : {})}
      {...(disabled ? { 'aria-disabled': true } : {})}
      onClick={() => {
        if (disabled) return;
        onToggle();
      }}
    >
      <Icon name="haru:save-star" decorative />
      <span className="haru-activity-card__save-label">{saved ? copy.saved : copy.save}</span>
    </button>
  );
}
