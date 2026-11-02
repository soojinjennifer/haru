/**
 * `StorytimeSessionScreen` — 세션 화면 **ready · recording · paused** (Figma `300:1309` · `298:1262` ·
 * `298:1340`). Stage 4 Design Spec §2.2 · §2.5 + 4b Spec §2.1~§2.5 · §3.3 · §3.4
 * (`D4-12`·`D4-13`·`D4-17`·`D4-51`·`D4-56`·`D4-57`).
 *
 * ```
 * 위 묶음 (위에 앵커)                                    아래 묶음 (아래에 앵커)
 * ├ 상단 줄  [Prompts 칩 117×36]* · 닫기 38 · +10        ├ RecordControl 150 (idle → recording ⇄ paused)
 * ├ 메달리온 링 190 + 아바타 174 · +76                    ├ ↕ 18
 * └ ready     버블 `139:2803` · ring + 5                  └ SessionActionBar 279 · ↕ 18 (+ safe-area)
 *   recording/paused  책 칩 40 · ring + 15  →  상태 블록 111 · +23
 *                          ↕ 유연 간격                      * = recording · paused 에서만 (`300:1309` 에는 없다)
 * ```
 *
 * - **조립만 한다.** 표시 데이터 = `useSessionDetail`, 녹음 상태 = `useSessionRecorder` 구독
 *   (`RecordingController` 소유 — 이 feature 는 `features/recording` 을 import 하지 않는다).
 * - 닫기: ready = **확인 없이** `ready → abandoned` → `/` (`D4-57`). recording·paused = `Discard` 와 **같은**
 *   확인 다이얼로그 (`D4-56`). 다이얼로그가 열려 있는 동안 녹음은 계속된다.
 * - `Discard` 확인 → 컨트롤러 `discard()`(→ abandoned · 서버 확정 뒤에만 로컬 삭제 · 실패/오프라인이면 보존 +
 *   outbox — `D4-13`) 가 끝난 뒤 `/`. `Submit` → `submit()`(로컬 확정 → completed(`user_done`)) 뒤
 *   Toast + 완료 화면(`29:62`, 본체는 `S4-H1`).
 * - 재개 = Record Control `paused` 변형 탭 (`D4-51`) — 별도 `Resume` 버튼 없음.
 * - `RecordControl` · `SessionActionBar` · 메달리온 · 닫기는 상태가 바뀌어도 **같은 노드**다 (AC-4-125).
 * - Prompts 칩 = **disclosure 트리거**(4b Spec §3.3 · §9.1). 칩과 열림 상태는 이 화면이, 팝업 본체
 *   (`296:1257`)는 Page 가 `PromptsPopover` 슬롯으로 넣는 `features/session-prompts` 가 소유한다(`S4-G1`).
 *   슬롯이 없으면 칩은 `aria-expanded` 를 달지 않는다(열리는 것이 없는데 "열림" 을 읽히지 않도록).
 *   팝업은 녹음 상태를 바꾸지 않는다(`D4-53`) — 열려 있는 동안 recording ⇄ paused 전이에도 유지되고,
 *   `Submit`·`Discard` 확인·30분 자동 종료(= recording·paused 가 아닌 상태)에서 닫힌다(AC-4-133).
 * - Prompt 가 0개면 칩은 `aria-disabled` + 사유(`aria-describedby`)이고 팝업을 렌더하지 않는다(`D4-58` NB-2).
 * - 조회 실패 = `SessionLoadError` (`D4-96`·`D4-99` — 완료 화면과 공유, `Back to Home` 출구).
 * - 세션이 ready 가 아닌 상태로 열리면(이미 끝난 세션 등) 홈으로 돌아간다 — 재진입·복귀(AC-4-35)는 다음 단위.
 */
import { MAX_RECORDED_SECONDS } from '@haru/contracts';
import {
  Button,
  ConfirmDialog,
  Icon,
  IconButton,
  RecordControl,
  Spinner,
  useToast,
} from '@haru/ui';
import { useCallback, useId, useRef, useState, type ComponentType } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { CharacterMedallion } from '../../../entities/character';
import {
  formatSessionClock,
  selectRecordControlState,
  SessionBookChip,
  SessionReadyBubble,
  SessionStatusBlock,
  useCloseReadySession,
  useRememberSessionCompletion,
  useSessionDetail,
  useSessionRecorder,
  type SessionPromptsPopoverContext,
  type SessionRecordControlState,
} from '../../../entities/session';
import { ROUTES, sessionCompletePath } from '../../../shared/config/routes';
import { storytimeSessionCopy } from '../copy';

import { SessionActionBar, type SessionActionBarState } from './SessionActionBar';
import { SessionLoadError } from './SessionLoadError';
import { SUBMIT_ENTRY } from './useStickerEntrance';

/** 화면 배치 — 컨트롤러 상태가 종착(completed · abandoned)으로 가는 동안에도 마지막 배치를 유지한다. */
type SessionView = 'ready' | 'recording' | 'paused';

/** 종료 동작 — 진행 중이면 다른 명령·재탭을 받지 않는다 (AC-4-129 ⑤). */
type SessionExit = 'discard' | 'submit';

export interface StorytimeSessionScreenProps {
  sessionId: string;
  /**
   * Prompts 팝업 슬롯 (`S4-G1`). DOM 순서상 칩 **바로 다음**에 렌더한다 (Spec §9.1 disclosure).
   * recording · paused 에서만 렌더한다.
   */
  PromptsPopover?: ComponentType<SessionPromptsPopoverContext>;
}

const RECORD_LIMIT = formatSessionClock(MAX_RECORDED_SECONDS);

export function StorytimeSessionScreen({ sessionId, PromptsPopover }: StorytimeSessionScreenProps) {
  const copy = storytimeSessionCopy;
  const navigate = useNavigate();
  const toast = useToast();
  const reasonId = useId();
  const popupId = useId();
  const noPromptsId = useId();
  const chipRef = useRef<HTMLButtonElement | null>(null);
  /** 같은 이벤트 루프의 재탭까지 막는 잠금 — 상태 갱신 전에 들어온 두 번째 탭도 거른다 (AC-4-129 ⑤). */
  const exitLock = useRef(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exit, setExit] = useState<{ kind: SessionExit; view: SessionView } | null>(null);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const focusChip = useCallback(() => {
    chipRef.current?.focus();
  }, []);
  const closePrompts = useCallback(() => {
    setPromptsOpen(false);
  }, []);

  const rememberCompletion = useRememberSessionCompletion();
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
    return <SessionLoadError onRetry={detail.refetch} />;
  }

  const status = snapshot?.status ?? session.status;
  // 10분 방치(`ready → abandoned`)·서버 재동기화로 끝난 세션 → 홈. 사용자 폐기는 아래 `exit` 가 이동을 맡는다.
  if (session.status !== 'ready' || (status === 'abandoned' && exit === null)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const view: SessionView =
    status === 'recording' || status === 'paused'
      ? status
      : (exit?.view ?? (status === 'completed' ? 'paused' : 'ready'));
  const active = view !== 'ready';
  const controlState: SessionRecordControlState = selectRecordControlState({ status: view });
  const barState: SessionActionBarState = view;

  const beginExit = (kind: SessionExit): boolean => {
    if (recorder === null || exitLock.current || !active) return false;
    exitLock.current = true;
    setExit({ kind, view });
    setPromptsOpen(false);
    return true;
  };

  const releaseExit = () => {
    exitLock.current = false;
    setExit(null);
  };

  const confirmDiscard = () => {
    if (recorder === null || !beginExit('discard')) return;
    void recorder.discard().then((outcome) => {
      if (!outcome.ok) {
        // 컨트롤러가 다른 명령을 처리 중이었다 — 다이얼로그를 그대로 두고 다시 누를 수 있게 한다.
        releaseExit();
        return;
      }
      // 서버 확정이면 로컬은 이미 지워졌고, 실패·오프라인이면 보존 + outbox 다 (`D4-13`). 어느 쪽이든 홈으로.
      void navigate(ROUTES.home, { replace: true });
    });
  };

  const submit = () => {
    if (recorder === null || !beginExit('submit')) return;
    void recorder.submit().then((outcome) => {
      if (!outcome.ok) {
        releaseExit();
        return;
      }
      rememberCompletion(sessionId, outcome.result);
      toast.show({ message: copy.submitted, tone: 'success' });
      void navigate(sessionCompletePath(sessionId), { replace: true, state: SUBMIT_ENTRY });
    });
  };

  const requestDiscard = () => {
    if (!active || exit !== null) return;
    setConfirmOpen(true);
  };

  const toggleRecording = () => {
    if (recorder === null || exit !== null) return;
    if (status === 'ready') void recorder.start();
    else if (status === 'recording') void recorder.pause();
    else if (status === 'paused') void recorder.resume();
  };

  // 팝업은 녹음 중·일시정지 중에만 보인다 — 종료 동작이 시작되었거나 30분 자동 종료(`completed`)면 닫는다.
  const promptsLive = (status === 'recording' || status === 'paused') && exit === null;
  const hasPrompts = session.prompts.length > 0;
  const popoverConnected = PromptsPopover !== undefined && hasPrompts;
  const popupOpen = popoverConnected && promptsOpen && promptsLive;
  const chipProps = !hasPrompts
    ? ({ 'aria-disabled': true, 'aria-describedby': noPromptsId } as const)
    : popoverConnected
      ? ({ 'aria-expanded': popupOpen, 'aria-controls': popupId } as const)
      : {};

  return (
    <div className={view === 'recording' ? 'haru-session haru-session--recording' : 'haru-session'}>
      <div className="haru-session__body">
        <div className="haru-session__top-row">
          {active ? (
            <Button
              ref={chipRef}
              variant="glass"
              size="sm"
              leadingIcon={<Icon name="message-square-text" decorative />}
              {...chipProps}
              onPress={() => {
                if (!promptsLive) return;
                setPromptsOpen(!popupOpen);
              }}
            >
              {copy.prompts}
            </Button>
          ) : null}
          {active && !hasPrompts ? (
            <span className="haru-visually-hidden" id={noPromptsId}>
              {copy.noPrompts}
            </span>
          ) : null}
          {active && popoverConnected ? (
            <PromptsPopover
              open={popupOpen}
              live={promptsLive}
              popupId={popupId}
              focusChip={focusChip}
              prompts={session.prompts}
              close={closePrompts}
            />
          ) : null}
          <IconButton
            icon={<Icon name="haru:session-close" size="md" decorative />}
            label={copy.close}
            variant="glass"
            loading={close.isPending || exit?.kind === 'discard'}
            onPress={() => {
              if (status === 'ready') close.close();
              else requestDiscard();
            }}
          />
        </div>

        <div className="haru-session__medallion">
          <span className="haru-session__medallion-ring" aria-hidden="true" />
          <CharacterMedallion asset="headphones" size="session" />
        </div>

        <div
          className={
            active ? 'haru-session__stage haru-session__stage--active' : 'haru-session__stage'
          }
        >
          {active ? (
            <>
              {/* `book: null` 이어도 자리(40)는 남긴다 — 상태 블록 y 불변 (Spec §2.1) */}
              <div className="haru-session__book-slot">
                <SessionBookChip book={session.book} />
              </div>
              <SessionStatusBlock
                state={view}
                recordedSeconds={snapshot?.recordedSeconds ?? 0}
                label={view === 'recording' ? copy.status.recording : copy.status.paused}
                hint={
                  view === 'recording' ? copy.status.upTo(RECORD_LIMIT) : copy.status.pausedHint
                }
              />
            </>
          ) : (
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
            state={controlState}
            label={recordLabel(controlState)}
            caption={controlState === 'paused' ? copy.record.resumeCaption : copy.record.caption}
            onToggle={toggleRecording}
          />
          <SessionActionBar
            state={barState}
            reasonId={reasonId}
            submitting={exit?.kind === 'submit'}
            onDiscard={requestDiscard}
            onSubmit={submit}
          />
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title={copy.discardDialog.title}
          description={copy.discardDialog.description}
          confirmLabel={copy.discardDialog.confirm}
          cancelLabel={copy.discardDialog.cancel}
          destructive
          confirming={exit?.kind === 'discard'}
          onConfirm={confirmDiscard}
          onCancel={() => {
            if (exit !== null) return;
            setConfirmOpen(false);
          }}
        />
      </div>
    </div>
  );
}

function recordLabel(state: SessionRecordControlState): string {
  const copy = storytimeSessionCopy.record;
  if (state === 'recording') return copy.pause;
  if (state === 'paused') return copy.resume;
  return copy.start;
}
