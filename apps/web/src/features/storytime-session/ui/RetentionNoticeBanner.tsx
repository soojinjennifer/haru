/**
 * Home 7일 보관 배너 — `S4-H3` (4b Spec §18.3 · §18.4 · §18.5, C13-4B-13 · `AD-S4-25` 후보, `D4-119` CP-13 ·
 * `D4-120` Q10 · Q11 · Q12).
 *
 * - 업로드되지 못한 녹음이 7일 구간에 들어오면 **닫거나 업로드가 확정될 때까지** 보인다 (놓치면 14일에 유실 — R4-11).
 * - 구성 = **제목 한 문장(삭제 예정일 포함) + 닫기**. `Try again` 은 없다 (Q10 — Home 밀림을 `AD-S4-11` 수준으로).
 * - 자리 = Home 헤더 밴드 밑 — 오프라인 캐시 배너와 **같은 슬롯**이고 오프라인 배너가 우선한다 (Q11). 그래서 이
 *   컴포넌트는 Page 가 오프라인 배너의 `fallback` 으로 조립한다 (feature 간 import 0).
 * - 날짜 = 절대 날짜 `Nov 17` (해가 다르면 연도) — 형식화는 `shared/lib/date-format` 1곳 (Q12).
 * - 표시는 **저장된 레코드에서 파생**한다 — 앱 시작 정리가 이 화면보다 먼저 끝나도 보인다 (§18.10 ④).
 * - `tone="warning"` → `role="alert"` (유실 위험 안내 — §18.5). 기존 `InlineAlert banner` 그대로, 새 토큰 0.
 * - ⭐ `D4-134` (`VG-H3-04`): `Dismiss` 로 닫으면 포커스를 **문서 순서에서 배너 다음 Tab 대상**으로 옮긴다 — 배너가
 *   사라지며 포커스가 `BODY` 로 떨어지면 키보드 사용자의 다음 Tab 이 문서 처음부터 시작한다 (WCAG 2.4.3).
 *   Home 에서는 버블 닫기(버블이 없으면 카드 트랙)다 — 닫기 전 `Tab` 을 눌렀을 때 가는 곳과 같다(2026-11-04 실측).
 *   대상을 이름으로 고르지 않는다(feature 간 import 0). 닫기 버튼에 포커스가 없었으면(포인터 · Safari) 옮기지 않는다.
 */
import { InlineAlert } from '@haru/ui';

import { useRetentionNotice } from '../../../entities/session';
import { formatMonthDay } from '../../../shared/lib/date-format';
import { nextTabbableAfter } from '../../../shared/lib/focus';
import { storytimeSessionCopy as copy } from '../copy';

export function RetentionNoticeBanner() {
  const { notice, dismiss } = useRetentionNotice();
  if (notice === null) return null;

  const dismissAndMoveFocus = () => {
    const active = document.activeElement;
    const banner = active instanceof HTMLElement ? active.closest('[role="alert"]') : null;
    const next = banner === null ? null : nextTabbableAfter(banner);
    dismiss();
    next?.focus({ preventScroll: true });
  };

  return (
    <InlineAlert
      tone="warning"
      placement="banner"
      title={copy.uploads.retentionNotice(formatMonthDay(notice.deleteAtMs, notice.asOfMs))}
      onDismiss={dismissAndMoveFocus}
      dismissLabel={copy.notices.dismiss}
    />
  );
}
