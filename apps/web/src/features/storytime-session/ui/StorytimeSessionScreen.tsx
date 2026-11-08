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
 * - 예외·안내 (`S4-H2`, 4b Spec §7): Record Control 변형 = `selectSessionRecordGate` → `selectRecordControlState`
 *   (AC-4-134). `permission-denied` 탭 · 권한 거부 직후 1회 → 마이크 안내 시트(§7.3). 대화 전용 ready =
 *   `permission-denied` + `Submit` 활성 · `Discard` 비활성(`D4-58` CP-6). 녹음 중 탭이 숨겨지면 공지 슬롯
 *   `InlineAlert`(§7.2, `D4-26`) — 들어가지 않으면 Toast. 연결이 끊기고 돌아올 때 Toast 1회씩(§7.1). 30분 자동
 *   종료 → Toast + 완료 화면(AC-4-64).
 * - ⭐ `S4-H2R` (`D4-119` CP-10 · `D4-120` Q15): 대화 전용 세션 ready 에 **처음** 들어오면 마이크 시트를 1회 자동으로
 *   연다(앱 실행당 세션별 — 기록은 조립 환경). 시트 문단은 모드별(§18.2 ③). 시트가 닫히면 포커스 = Record Control
 *   (자동으로 열릴 때는 연 요소가 없다 — §18.10 ⑤).
 * - ⭐ `D4-121` (`VG-H2-02`): 상단 줄(칩·닫기)을 Toast 상단 보정에 등록한다 — 완료 화면 `D4-103` 과 같은 방식.
 *   Toast 가 칩·닫기를 덮거나 탭을 가로채지 않는다.
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
  useToastTopBarInset,
} from '@haru/ui';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { Navigate, useNavigate } from 'react-router';

import { CharacterMedallion } from '../../../entities/character';
import {
  formatSessionClock,
  selectRecordControlState,
  selectSessionRecordGate,
  SessionBookChip,
  SessionReadyBubble,
  SessionStatusBlock,
  useCloseReadySession,
  useConversationEntryNotice,
  useRememberSessionCompletion,
  useSessionDetail,
  useSessionRecorder,
  type SessionPromptsPopoverContext,
  type SessionRecordControlState,
} from '../../../entities/session';
import { ROUTES, sessionCompletePath } from '../../../shared/config/routes';
import { storytimeSessionCopy } from '../copy';

import { MicPermissionSheet } from './MicPermissionSheet';
import { SessionActionBar, type SessionActionBarState } from './SessionActionBar';
import { SessionLoadError } from './SessionLoadError';
import { SessionNoticeSlot, type SessionNotice } from './SessionNoticeSlot';
import { useSessionToast } from './useSessionToast';
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
  /** 완료 화면에서 보이는 Toast(`Submit` · 30분 자동 종료) — 기본 4000 (`D4-128` 대상 아님). */
  const toast = useToast();
  /** 세션 화면에 머무는 Toast — 문구 전용 3000 (`D4-128`). */
  const sessionToast = useSessionToast();
  const reasonId = useId();
  const popupId = useId();
  const noPromptsId = useId();
  const recordReasonId = useId();
  const recordId = useId();
  const chipRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  /** 같은 이벤트 루프의 재탭까지 막는 잠금 — 상태 갱신 전에 들어온 두 번째 탭도 거른다 (AC-4-129 ⑤). */
  const exitLock = useRef(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exit, setExit] = useState<{ kind: SessionExit; view: SessionView } | null>(null);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [micSheetOpen, setMicSheetOpen] = useState(false);
  /** 시트가 한 번이라도 열렸다가 닫혔는가 — 닫힌 뒤 Record Control 로 포커스를 옮긴다. */
  const micSheetShown = useRef(false);
  const [notice, setNotice] = useState<SessionNotice | null>(null);
  const focusChip = useCallback(() => {
    chipRef.current?.focus();
  }, []);
  const closePrompts = useCallback(() => {
    setPromptsOpen(false);
  }, []);

  const rememberCompletion = useRememberSessionCompletion();
  const detail = useSessionDetail(sessionId);
  const session = detail.session;

  // 대화 전용 세션 첫 진입 안내 (`D4-119` CP-10 · AC-4-147 ①) — ready 로 열린 경우에만, 세션별 1회.
  const openMicSheet = useCallback(() => {
    setMicSheetOpen(true);
  }, []);
  useConversationEntryNotice(
    session !== undefined && session.mode === 'conversation_only' && session.status === 'ready'
      ? session.id
      : null,
    openMicSheet,
  );

  // 시트가 닫히면 포커스 = Record Control (AC-4-147 ③). `Sheet` 포커스 트랩의 복귀(연 요소)는 같은 커밋의
  // 정리 단계에서 먼저 돌고, 이 effect 가 뒤에 돈다 — 자동으로 열렸을 때도 Record Control 로 간다.
  // `preventScroll` (`D4-125`, `VG-H2R-02`) — 짧은 세로에서 사용자가 누르지 않은 요소로 화면이 움직이지 않게 한다.
  // Record Control 은 그 크기에서도 이미 화면 안에 있다.
  useEffect(() => {
    if (micSheetOpen) {
      micSheetShown.current = true;
      return;
    }
    if (!micSheetShown.current) return;
    document.getElementById(recordId)?.focus({ preventScroll: true });
  }, [micSheetOpen, recordId]);
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
      sessionToast.show({ message: copy.closeFailed, tone: 'error' });
    },
  });

  // 안내 사건 (`S4-H2`) — 백그라운드 경고는 공지 슬롯, 30분 자동 종료는 Toast + 완료 화면 (AC-4-64).
  useEffect(() => {
    if (recorder === null) return undefined;
    return recorder.onNotice((event) => {
      if (event.type === 'background') {
        setNotice('background');
        return;
      }
      // 사용자가 이미 Submit/Discard 를 시작했다면 그쪽이 이동을 맡는다.
      if (exitLock.current) return;
      exitLock.current = true;
      setPromptsOpen(false);
      rememberCompletion(sessionId, event.result);
      toast.show({ message: copy.autoTimeout(RECORD_LIMIT), tone: 'neutral' });
      void navigate(sessionCompletePath(sessionId), { replace: true, state: SUBMIT_ENTRY });
    });
  }, [recorder, rememberCompletion, sessionId, toast, navigate, copy]);

  // 연결 끊김 · 복구 — 바뀔 때 Toast 1회씩, 레이아웃 이동 0 (4b Spec §7.1 · §7.2 넷째 줄).
  useEffect(() => {
    if (recorder === null) return undefined;
    return recorder.onConnectivity((value) => {
      sessionToast.show({
        message: value === 'offline' ? copy.connectivity.offline : copy.connectivity.online,
        tone: 'neutral',
      });
    });
  }, [recorder, sessionToast, copy]);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);
  const noticeOverflowed = useCallback(() => {
    setNotice(null);
    sessionToast.show({ message: copy.notices.background.toast, tone: 'neutral' });
  }, [sessionToast, copy]);

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
  // 대화 전용 ready — 녹음 없이 `Submit` 으로 끝낸다 (`D4-44` · `D4-58` CP-6).
  const conversation = session.mode === 'conversation_only' && view === 'ready';
  const gate = selectSessionRecordGate({ phase: snapshot?.phase, mode: session.mode });
  const controlState: SessionRecordControlState = selectRecordControlState({
    status: view,
    ...gate,
  });
  const barState: SessionActionBarState = conversation ? 'conversation' : view;

  const beginExit = (kind: SessionExit): boolean => {
    if (recorder === null || exitLock.current || !(active || (conversation && kind === 'submit'))) {
      return false;
    }
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
      // 대화 전용은 녹음이 없다 — `Recording submitted` 대신 별도 문구 (`D4-118`).
      toast.show({
        message: conversation ? copy.conversationSubmitted : copy.submitted,
        tone: 'success',
      });
      void navigate(sessionCompletePath(sessionId), { replace: true, state: SUBMIT_ENTRY });
    });
  };

  const requestDiscard = () => {
    if (!active || exit !== null) return;
    setConfirmOpen(true);
  };

  const toggleRecording = () => {
    if (recorder === null || exit !== null) return;
    if (controlState === 'permission-denied') {
      setMicSheetOpen(true);
      return;
    }
    // 권한 거부 직후 1회 자동으로 안내한다 (§7.3). 그 뒤로는 `permission-denied` 탭이 연다.
    // 재개(새 캡처 part)가 거부돼도 같다 — 지금까지 녹음은 `Submit` 으로 낼 수 있다 (§18.2 ④, AC-4-148 ③).
    const openSheetIfDenied = (outcome: { ok: boolean; reason?: string }) => {
      if (
        !outcome.ok &&
        (outcome.reason === 'permission_denied' || outcome.reason === 'mic_unavailable')
      ) {
        setMicSheetOpen(true);
      }
    };
    if (status === 'ready') void recorder.start().then(openSheetIfDenied);
    else if (status === 'recording') void recorder.pause();
    else if (status === 'paused') void recorder.resume().then(openSheetIfDenied);
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
        <SessionTopRow>
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
        </SessionTopRow>

        <div className="haru-session__medallion">
          <span className="haru-session__medallion-ring" aria-hidden="true" />
          <CharacterMedallion asset="headphones" size="session" />
        </div>

        <div
          ref={stageRef}
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
              {notice === null ? null : (
                <SessionNoticeSlot
                  notice={notice}
                  stageRef={stageRef}
                  onDismiss={dismissNotice}
                  onOverflow={noticeOverflowed}
                />
              )}
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
            id={recordId}
            state={controlState}
            label={recordLabel(controlState)}
            caption={recordCaption(controlState)}
            {...(controlState === 'permission-denied'
              ? { 'aria-haspopup': 'dialog' as const }
              : {})}
            {...(controlState === 'disabled' && gate.consentBlocked
              ? { 'aria-describedby': recordReasonId }
              : {})}
            onToggle={toggleRecording}
          />
          {gate.consentBlocked ? (
            <span className="haru-visually-hidden" id={recordReasonId}>
              {copy.record.consentReason}
            </span>
          ) : null}
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

        <MicPermissionSheet
          open={micSheetOpen}
          conversation={session.mode === 'conversation_only'}
          onClose={() => {
            setMicSheetOpen(false);
          }}
        />
      </div>
    </div>
  );
}

/**
 * 상단 줄 (칩 · 닫기) — Toast 상단 보정에 등록한다 (`D4-121`, `useToastTopBarInset`). 세션 조회가 끝난 뒤에야
 * 렌더되므로 이 줄이 마운트될 때 등록해야 한다(화면 첫 렌더는 Spinner 다). 줄 노드는 상태가 바뀌어도 같다.
 */
function SessionTopRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useToastTopBarInset(ref);
  return (
    <div ref={ref} className="haru-session__top-row">
      {children}
    </div>
  );
}

function recordLabel(state: SessionRecordControlState): string {
  const copy = storytimeSessionCopy.record;
  if (state === 'recording') return copy.pause;
  if (state === 'paused') return copy.resume;
  if (state === 'permission-denied') return copy.micOff;
  // `disabled` 이름은 `idle` 과 같다 (4b Spec §9.1) — 사유는 `aria-describedby`.
  return copy.start;
}

/** 시각 라벨 — Figma 변형별 원문 (`163:1589` · `298:1227` · `298:1236` · `298:1245`). */
function recordCaption(state: SessionRecordControlState): string {
  const copy = storytimeSessionCopy.record;
  if (state === 'paused') return copy.resumeCaption;
  if (state === 'permission-denied') return copy.micOffCaption;
  return copy.caption;
}
