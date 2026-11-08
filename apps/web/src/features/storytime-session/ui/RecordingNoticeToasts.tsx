/**
 * 앱 수준 녹음 안내 Toast — 14일 삭제 · 48h 미확정 · 크래시 복구 (`S4-H3` · `D4-117`, 4b Spec §18.3).
 *
 * ```
 * app/providers (ToastProvider 안에 1번 마운트)
 *  └ RecordingNoticeToasts → entities/session useRecordingAppNotices
 *                              → SessionRecorderEnvironment.notices (런타임 안내 센터 — features/recording)
 * ```
 *
 * - **한 번에 1개, 앞 Toast 가 사라진 뒤 다음** — 순서 14일 → 48h → 크래시 복구 (`D4-120` Q14). 순서는 센터가,
 *   "앞 Toast 가 사라졌다" 는 `useToastPresent` 가 정한다. `ToastProvider` 는 바꾸지 않는다 (큐 없음 그대로).
 *   다른 화면의 Toast 가 떠 있어도 기다린다.
 * - **녹음 중(recording · paused)에는 띄우지 않는다** — 세션 화면을 떠난 뒤 표시 (`D4-120` Q13, PRD §7.5).
 *   보류는 녹음에 들어간 세션 화면을 **떠날 때** 풀린다 — 그때 떠 있는 완료 Toast(`Recording submitted`)가 사라진 뒤
 *   위 순차 규칙으로 꺼낸다 (`D4-134` · `VG-H3-02`, 보류 판정은 조립 환경 `capturing`).
 * - 안내는 꺼내는 순간 소비된다 — 같은 실행에서 다시 붙여도(재마운트 · StrictMode) 다시 뜨지 않는다.
 * - 48h `Try again` = 큐 즉시 처리 1회 · Toast 닫힘. 오프라인이면 요청 0 + 오프라인 안내 (AC-4-149 ③ ④).
 *   성공 Toast 는 없다 (`D4-119` CP-12).
 * - 기존 `Toast`(상단 · `neutral`) 그대로 — 새 UI 없음. 아무것도 렌더하지 않는다.
 */
import { useToast, useToastPresent } from '@haru/ui';
import { useEffect, useRef } from 'react';

import { useRecordingAppNotices } from '../../../entities/session';
import { storytimeSessionCopy as copy } from '../copy';

export function RecordingNoticeToasts(): null {
  const toast = useToast();
  const present = useToastPresent();
  const { next, capturing, take, retryUploads } = useRecordingAppNotices();
  /** 방금 띄운 Toast 가 아직 화면에 잡히지 않았다 — 그 사이 다음 안내를 꺼내지 않는다. */
  const awaitingPresence = useRef(false);

  useEffect(() => {
    if (awaitingPresence.current) {
      if (present) awaitingPresence.current = false;
      return;
    }
    if (next === null || capturing || present) return;
    const notice = take();
    if (notice === null) return;
    awaitingPresence.current = true;
    if (notice === 'retention_expired') {
      toast.show({ message: copy.uploads.retentionExpired, tone: 'neutral' });
      return;
    }
    if (notice === 'recovered') {
      toast.show({ message: copy.recovered, tone: 'neutral' });
      return;
    }
    toast.show({
      message: copy.uploads.stalled,
      tone: 'neutral',
      dismissLabel: copy.notices.dismiss,
      action: {
        label: copy.states.retry,
        onPress: () => {
          toast.dismiss();
          if (retryUploads() === 'offline') {
            toast.show({ message: copy.connectivity.offline, tone: 'neutral' });
          }
        },
      },
    });
  }, [next, capturing, present, take, retryUploads, toast]);

  return null;
}
