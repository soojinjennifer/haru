/**
 * `LibraryEntryActions` — `/library` 하단 진입점 2행 (Library Design Spec §7.1, `AD-L-06`).
 *
 * ```
 * ListGroup (label="Library actions")
 * ├ ListRow "Add a book you own"  trailing=chevron-right → /library/add            (FR-23)
 * ├ (divider 1px — ListGroup 이 행 사이에만 그린다)
 * └ ListRow "Gift requests"       trailing=chevron-right → /library/gift-requests  (FR-22)
 * ```
 *
 * ── Figma 에 **없다**. `C-13` ②(`L-OPEN-12`, approvals §16.2)로 승인된 design-agent 명세다 ──
 * 설계 원칙은 *"Figma 에 이미 있는 요소만 조합한다"* 이다:
 *   - `Finished together` 목록과 **같은 컴포넌트·같은 idiom**(`ListGroup` + 행 + chevron)이다.
 *   - **섹션 제목을 만들지 않는다** — 새 문구를 발명하지 않는다 (최우선 규칙 #2). 목록 이름은
 *     시각 비노출 `aria-label` 로만 둔다.
 *   - 행 높이는 `--list-row-height-min`(56)이다 — media 가 없으므로 Book List 의 74 를 쓰지
 *     않는다 (`--library-entry-row-height-min` 이 같은 값을 가리킨다).
 *   - 타이포는 `ListRow` 기본값이다. Library 전용 변형을 만들지 않는다 (`L-NEW-07`).
 *
 * 기존 명세의 `LibraryFooterActions`(전폭 glass 버튼 + TextLink)는 **폐기**되었다 — Figma 의
 * Library 화면에 전폭 glass 버튼도 TextLink 도 없어 새 시각 언어가 되기 때문이다 (§7.1 대안 ①).
 *
 * ── 디자이너 판이 오면 **이 파일만 교체**한다 ──
 * `/library` 조립에서 한 줄로 들어가고 route 문자열은 `ROUTES` 가 소유한다 (`L-OPEN-12`).
 *
 * `packages/ui` 는 route 를 모른다 (AC-1-25) — 이동은 이 feature 가 `useNavigate` 로 한다.
 */
import { Icon, ListGroup, ListRow } from '@haru/ui';
import { useNavigate } from 'react-router';

import { ROUTES } from '../../shared/config/routes';
import { libraryCopy } from '../../shared/copy/library-copy';

export function LibraryEntryActions() {
  const navigate = useNavigate();

  const chevron = (
    <span className="haru-library-entry__chevron">
      <Icon name="chevron-right" size="sm" tone="inherit" decorative />
    </span>
  );

  return (
    <ListGroup label={libraryCopy.entryActions.label}>
      <ListRow
        title={libraryCopy.entryActions.addOwnBook}
        trailing={chevron}
        onPress={() => {
          void navigate(ROUTES.libraryAdd);
        }}
      />
      <ListRow
        title={libraryCopy.entryActions.giftRequests}
        trailing={chevron}
        onPress={() => {
          void navigate(ROUTES.libraryGiftRequests);
        }}
      />
    </ListGroup>
  );
}
