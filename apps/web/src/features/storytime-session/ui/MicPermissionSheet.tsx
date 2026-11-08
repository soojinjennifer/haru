/**
 * 마이크 안내 시트 — 4b Design Spec §7.3 · **§18.2 ②~④** (C13-4B-4 · C13-4B-12, Figma 없음 → 명세 · 허용 차이
 * `AD-S4-16`(범위 개정 후보), `D4-58` CP-5 · `D4-119` CP-10 · CP-11).
 *
 * ```
 * Sheet variant="bottom"  제목 · 안내 문단 (모드별 1개)
 *   Button glass  `Not now`   → 닫기 (요청 0)
 * ```
 *
 * - 여는 시점 (화면이 정한다): `permission-denied` Record Control 탭 · 녹음 세션에서 녹음 시작이 권한 거부로 끝난
 *   직후 1회 · **대화 전용 세션 첫 진입 1회**(`S4-H2R`, 앱 실행당 세션별 — `D4-120` Q15).
 * - 문단: 녹음 세션 = `description`(설정에서 허용 후 이 화면으로 돌아오면 녹음된다) / 대화 전용 세션 =
 *   `conversationDescription`(이 세션은 녹음 없이 계속 · 다음 세션부터 — 권한 거부 · 장치 없음 공통, `D4-120` Q16).
 * - Web 은 설정 딥링크가 없다 → 안내 문단만 둔다 (네이티브 딥링크는 `S4N-*`).
 * - 버튼 = `Not now` 1개. `Talk without recording` 은 **폐기**됐다 (`D4-119` CP-11 — 녹음 세션에서 뒤늦게 거부되면
 *   닫고 다시 시작하면 Start Session 판정이 대화 전용으로 만든다).
 * - 시트는 녹음 상태를 바꾸지 않는다 — 열고 닫는 동안 전이 요청 0.
 * - 닫힌 뒤 포커스는 화면이 Record Control 로 옮긴다 — 자동으로 열릴 때는 연 요소가 없다 (§18.2 ② · §18.10 ⑤).
 */
import { Button, Sheet, Text } from '@haru/ui';

import { storytimeSessionCopy } from '../copy';

export interface MicPermissionSheetProps {
  open: boolean;
  /** 대화 전용 세션인가 — 안내 문단을 고른다. */
  conversation: boolean;
  onClose: () => void;
}

export function MicPermissionSheet({ open, conversation, onClose }: MicPermissionSheetProps) {
  const copy = storytimeSessionCopy.micSheet;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={copy.title}
      variant="bottom"
      // Reading Context 시트와 같은 footer 배치 — 버튼 1개, 폭 가득 (신규 CSS 0)
      footer={
        <Button variant="glass" fullWidth onPress={onClose}>
          {copy.notNow}
        </Button>
      }
    >
      <Text variant="subheadline" tone="secondary">
        {conversation ? copy.conversationDescription : copy.description}
      </Text>
    </Sheet>
  );
}
