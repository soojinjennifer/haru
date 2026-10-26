/**
 * `StorytimeSessionScreen` — 세션 화면 **ready** (Figma `300:1309` = `28:51` + 닫기 `300:1318`).
 * Stage 4 Design Spec §2.2 · 4b Spec §2.1 · §2.4 · §3.4 (`D4-14`·`D4-18`·`D4-19`·`D4-57`).
 *
 * ```
 * 위 묶음 (위에 앵커)                         아래 묶음 (아래에 앵커)
 * ├ 상단 줄  닫기 38 @ 우 gutter · +10        ├ RecordControl 150 (`Record` → 탭하면 `Pause`)
 * ├ 메달리온 링 190 + 아바타 174 · +76         ├ ↕ 18
 * └ ready 버블 `139:2803` · ring + 5           └ SessionActionBar 279 · ↕ 18 (+ safe-area)
 *                          ↕ 유연 간격
 * ```
 *
 * - **조립만 한다.** 세션 표시 데이터 = `useSessionDetail`, 녹음 상태 = `useSessionRecorder` 구독
 *   (`RecordingController` 가 소유 — 이 feature 는 `features/recording` 을 import 하지 않는다).
 * - ready 닫기 = **확인 없이** `ready → abandoned` 1건 → `/` (`D4-57`). 실패하면 화면에 머물고
 *   Toast 로 알린다 (AC-4-136 ④).
 * - `RecordControl` · `SessionActionBar` 는 상태가 바뀌어도 **같은 노드**다 (AC-4-111 ④).
 * - ⚠ `S4-F1` 범위: ready. recording·paused 의 책 칩·상태 블록·Prompts 칩·닫기 다이얼로그·
 *   `Discard`/`Submit` 동작은 `S4-F2` 가 이 화면에 더한다. 지금 recording 에서는 버블이 사라지고
 *   Record Control 이 `Pause` 변형이 되며 바가 활성화되는 데까지다.
 * - 세션이 ready 가 아닌 상태로 열리면(이미 끝난 세션 등) 홈으로 돌아간다 — 복귀 경로
 *   (`session-already-active`, AC-4-35)와 재진입은 다음 단위다.
 */
import { ErrorState, Icon, IconButton, RecordControl, Spinner, useToast } from '@haru/ui';
import { useId } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { CharacterMedallion } from '../../../entities/character';
import {
  SessionReadyBubble,
  useCloseReadySession,
  useSessionDetail,
  useSessionRecorder,
} from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { storytimeSessionCopy } from '../copy';

import { SessionActionBar, type SessionActionBarState } from './SessionActionBar';

export interface StorytimeSessionScreenProps {
  sessionId: string;
}

export function StorytimeSessionScreen({ sessionId }: StorytimeSessionScreenProps) {
  const copy = storytimeSessionCopy;
  const navigate = useNavigate();
  const toast = useToast();
  const reasonId = useId();

  const detail = useSessionDetail(sessionId);
  const session = detail.session;
  const { recorder, snapshot } = useSessionRecorder(
    session === undefined || session.status !== 'ready'
      ? null
      : { sessionId: session.id, mode: session.mode, readyAt: session.readyAt },
  );
  const close = useCloseReadySession(sessionId, {
    onClosed: () => {
      void navigate(ROUTES.home, { replace: true });
    },
    onFailed: () => {
      toast.show({ message: copy.closeFailed, tone: 'error' });
    },
  });

  if (detail.isPending) {
    return (
      <div className="haru-session haru-session--pending" aria-busy="true">
        <Spinner size="md" />
      </div>
    );
  }

  if (detail.isError || session === undefined) {
    return (
      <div className="haru-session haru-session--error">
        <ErrorState
          title={copy.states.errorTitle}
          onRetry={detail.refetch}
          retryLabel={copy.states.retry}
          announce="alert"
          titleAs="h1"
        />
      </div>
    );
  }

  const status = snapshot?.status ?? session.status;
  if (session.status !== 'ready' || status === 'abandoned') {
    return <Navigate to={ROUTES.home} replace />;
  }

  const recording = status === 'recording' || status === 'paused';
  const barState: SessionActionBarState =
    status === 'recording' ? 'recording' : status === 'paused' ? 'paused' : 'ready';

  return (
    <div className="haru-session">
      <div className="haru-session__top-row">
        <IconButton
          icon={<Icon name="haru:session-close" size="md" decorative />}
          label={copy.close}
          variant="glass"
          loading={close.isPending}
          onPress={() => {
            if (status === 'ready') close.close();
          }}
        />
      </div>

      <div className="haru-session__medallion">
        <span className="haru-session__medallion-ring" aria-hidden="true" />
        <CharacterMedallion asset="headphones" size="session" />
      </div>

      <div className="haru-session__stage">
        {recording ? null : (
          <SessionReadyBubble
            bubble={session.bubble}
            reminderBubble={session.reminderBubble}
            reminderActive={snapshot?.readyReminderShown ?? false}
            prompts={session.prompts}
          />
        )}
      </div>

      <div className="haru-session__controls">
        <RecordControl
          state={recording ? 'recording' : 'idle'}
          label={recording ? copy.record.pause : copy.record.start}
          caption={copy.record.caption}
          onToggle={() => {
            if (recorder === null || status !== 'ready') return;
            void recorder.start();
          }}
        />
        <SessionActionBar
          state={barState}
          reasonId={reasonId}
          onDiscard={() => {
            /* `S4-F2` — 확인 다이얼로그(`D4-17`) → `→ abandoned` → 서버 확정 후 로컬 삭제 → `/` */
          }}
          onSubmit={() => {
            /* `S4-F2`·`S4-H1` — `→ completed` + Toast + 완료 화면 */
          }}
        />
      </div>
    </div>
  );
}
