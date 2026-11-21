/**
 * 세션 화면 ↔ 녹음 상태 머신 **구독 경계** (Stage 4 Plan §5.2-4 — "`entities/session` 의 구독 hook 을
 * 경유한다").
 *
 * ```
 * app/providers ── createRecordingController(features/recording) + 포트 선택(Web | Mock)
 *      │                  ↓ 구조적으로 아래 interface 를 만족한다
 *      └─ <SessionRecorderProvider value={{ create, clearLocalRecordings }}>
 *                         ↓
 * features/storytime-session → useSessionRecorder(…) → SessionRecorder (getSnapshot / subscribe / 명령)
 * ```
 *
 * - `features/storytime-session` 이 `features/recording` 을 **import 하지 않게** 하는 장치다
 *   (feature 간 직접 import 금지 — `rules/architecture.md` §3). 그래서 여기 타입은
 *   `RecordingController` 의 **부분 집합**이며 구현을 모른다. 조립 지점에서 tsc 가 일치를 검사한다.
 * - 컴포넌트는 **구독만** 한다 (`rules/frontend.md` §4). 상태 전이·타이머·저장은 컨트롤러가 소유한다.
 * - 클라이언트 전용 상태라 `packages/contracts` 에 두지 않는다 (Plan §5.2-6).
 *
 * Stage 4b `S4-F1` 은 ready 의 `start` 를, `S4-F2` 는 일시정지·재개·제출·폐기를 노출한다.
 */
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type {
  CompletedReason,
  ConsentStatus,
  SessionMode,
  SessionStatus,
  SessionTransitionResult,
} from '@haru/contracts';

import { useMe } from '../me';

export interface SessionRecorderSnapshot {
  readonly sessionId: string;
  /** 클라이언트가 보는 세션 상태 — 녹음 중에는 서버보다 앞설 수 있다. */
  readonly status: SessionStatus;
  /** 클라이언트 전용 단계 (`idle` · `requesting_permission` · `capturing` …). */
  readonly phase: string;
  readonly recordedSeconds: number;
  /** ready 리마인드를 이미 냈는가 — 세션당 한 번 (`D4-46`, AC-4-46). */
  readonly readyReminderShown: boolean;
  /** 응답을 기다리는 전이 요청 수. */
  readonly pendingTransitions: number;
  /** 세션 모드 — `conversation_only` 면 녹음 수단이 없다 (`D4-44`, `S4-H2`). */
  readonly mode: SessionMode;
  /** 완료 사유 — 30분 자동 종료(`auto_timeout`)를 화면이 구분한다 (AC-4-64). 완료 전 `null`. */
  readonly completedReason: CompletedReason | null;
}

/**
 * 화면이 안내로 바꿔야 하는 사건 (`S4-H2`). 컨트롤러 이벤트의 **부분 집합**이며 조립 지점이 옮겨 준다.
 *
 * | type | 뜻 | 화면 |
 * |---|---|---|
 * | `background` | 녹음 중 탭이 숨겨졌다 — 캡처는 계속됐다 (`D4-26` web-background-warning) | 공지 슬롯 `InlineAlert info` |
 * | `auto_timeout` | 누적 30분 도달 → `completed(auto_timeout)` 전이를 보냈다. `result` = 서버 확정(전송 실패면 `null`) | Toast + 완료 화면 (AC-4-64) |
 */
export type SessionRecorderNotice =
  | { readonly type: 'background' }
  | { readonly type: 'auto_timeout'; readonly result: SessionTransitionResult | null };

/** 기기 연결 상태 — `AppStatePort` 값 그대로 (세션 화면 오프라인 Toast, 4b Spec §7.1). */
export type SessionConnectivity = 'online' | 'offline';

export type SessionRecorderOutcome =
  | {
      readonly ok: true;
      /** 서버 확정 응답. 전송이 실패했으면 `null` — 전이는 SessionOutbox 가 다시 보낸다. */
      readonly result?: SessionTransitionResult | null;
    }
  | { readonly ok: false; readonly reason: string };

export interface SessionRecorder {
  getSnapshot(): SessionRecorderSnapshot;
  subscribe(listener: () => void): () => void;
  /** ready → recording. 동의 → 권한 → 캡처 → 전이 요청 순서 (컨트롤러 소유). */
  start(): Promise<SessionRecorderOutcome>;
  /** recording → paused (캡처 일시정지 + 전이 요청 1건). */
  pause(): Promise<SessionRecorderOutcome>;
  /** paused → recording — Record Control `paused` 변형 탭 (`D4-51`, AC-4-42). */
  resume(): Promise<SessionRecorderOutcome>;
  /** `Submit` — recording|paused → completed(`user_done`). 로컬 녹음을 먼저 확정한 뒤 전이한다. */
  submit(): Promise<SessionRecorderOutcome>;
  /**
   * `Discard` · 닫기 확인 — → abandoned (`D4-13`). **서버 확정 응답 뒤에만** 로컬 녹음을 지운다.
   * 전송이 실패하면 로컬을 보존하고 SessionOutbox 가 다시 보낸다 (오프라인 포함).
   */
  discard(): Promise<SessionRecorderOutcome>;
  /** 안내 사건 구독 (`S4-H2`). 돌려준 함수로 해제한다. */
  onNotice(listener: (notice: SessionRecorderNotice) => void): () => void;
  /** 지금 연결 상태. */
  connectivity(): SessionConnectivity;
  /** 연결 상태가 **바뀔 때만** 알린다 (같은 값 반복 0 — `AppStatePort` 약속). */
  onConnectivity(listener: (value: SessionConnectivity) => void): () => void;
  /** 타이머·구독을 놓는다. 진행 중 캡처는 멈추고 로컬에 보존한다. */
  dispose(): Promise<void>;
}

export interface SessionRecorderInput {
  readonly sessionId: string;
  readonly mode: SessionMode;
  /** 서버 `readyAt` — 10분 방치·5분 리마인드의 기준 시각 (`D4-46`). */
  readonly readyAt: string;
  /** 녹음 직전 동의 확인 — 호출 시점의 최신 상태를 돌려준다 (fail-closed, AC-4-62). */
  readonly readConsentStatus: () => ConsentStatus | null | undefined;
}

/**
 * 앱 수준 Toast 로 알릴 녹음 사건 (`S4-H3`, 4b Spec §18.3). 꺼내는 순서 = 14일 → 48h → 크래시 복구 (`D4-120` Q14).
 *
 * | 값 | 뜻 |
 * |---|---|
 * | `retention_expired` | 14일 동안 올라가지 못한 녹음을 이 기기에서 지웠다 (`D4-29`) |
 * | `upload_stalled` | 48시간 동안 업로드가 확정되지 않았다 — 큐는 계속 재시도 중이다 (AC-4-32 · 67) |
 * | `recovered` | 앱 시작 시 끝나지 못한 녹음을 복구했다 (`D4-117`, AC-4-65) |
 */
export type RecordingAppNotice = 'retention_expired' | 'upload_stalled' | 'recovered';

/** Home 7일 보관 배너 (`S4-H3`, 4b Spec §18.4 · §18.5). */
export interface RetentionNotice {
  /** 가장 이른 로컬 삭제 예정 시각 (첫 part 시작 + 14일). */
  readonly deleteAtMs: number;
  /** 이 값을 계산한 시각 — 날짜 표기의 기준(연도 생략 여부). */
  readonly asOfMs: number;
}

/** `Try again` 결과 — 오프라인이면 요청 0 이고 화면이 오프라인 안내를 낸다 (AC-4-149 ④). */
export type UploadRetryResult = 'started' | 'offline';

/**
 * 업로드 · 보관 안내 상태 (`S4-H3`). 조립 지점이 런타임 안내 센터를 옮겨 준다 — 구현은 `features/recording`.
 * 안내는 **저장된 상태에서 파생**되므로 구독이 늦어도 잃지 않는다 (4b Spec §18.10 ④).
 */
export interface SessionRecorderNotices {
  /** 지금 꺼낼 수 있는 앱 Toast 안내 (꺼내지 않는다). */
  peek(): RecordingAppNotice | null;
  /** 다음 앱 Toast 안내를 꺼낸다 — 꺼낸 안내는 다시 나오지 않는다 (녹음당 1회). */
  take(): RecordingAppNotice | null;
  /** Home 7일 배너. 같은 값이면 같은 객체 (구독 snapshot). */
  retention(): RetentionNotice | null;
  /** 배너 닫기 — 지금 7일 구간의 녹음 전부. 기록은 로컬 레코드에 남는다(재시작 후 재표시 0). */
  dismissRetention(): Promise<void>;
  /**
   * 녹음에 들어간(recording · paused) 세션 화면이 아직 열려 있는가 — 앱 Toast 를 보류한다 (`D4-120` Q13).
   * 녹음이 끝나도(`completed` · `abandoned`) 그 화면을 떠날 때까지 `true` 다 (`D4-134` — `Submit` 순간 유실 방지).
   */
  capturing(): boolean;
  /** 업로드 큐를 지금 한 번 돌린다 (`Try again`). 로컬 파일은 지우지 않는다. */
  retryUploads(): UploadRetryResult;
  /** 위 값 중 하나라도 바뀌면 알린다. */
  subscribe(listener: () => void): () => void;
}

export interface SessionRecorderEnvironment {
  create(input: SessionRecorderInput): SessionRecorder;
  /**
   * 이 기기의 로컬 녹음·업로드 큐·미전송 전이를 전부 지운다 — 로그아웃 정리 (AC-4-72).
   * 런타임 메모리 상태까지 비운다 (`S4-E` handoff E-8 ②).
   */
  clearLocalRecordings(): Promise<void>;
  /**
   * 이 기기에 남은 **한 세션의** 로컬 녹음(청크 · 색인)을 지우고 업로드 큐 항목을 취소한다 — 세션 녹음 삭제
   * (Stage 8 FR-21, AC-8-23). 서버 삭제 **확정 응답 뒤에만** 부른다 (rules/architecture §7 — 실패 · 오프라인이면
   * 부르지 않아 로컬을 보존한다). 로컬 녹음이 없으면 아무 일도 하지 않는다. 미전송 세션 전이(outbox)는 건드리지 않는다
   * — 세션 상태는 녹음 삭제와 무관하다.
   */
  deleteLocalRecording(sessionId: string): Promise<void>;
  /** 업로드 · 보관 · 크래시 복구 안내 (`S4-H3` · `D4-117`). */
  readonly notices: SessionRecorderNotices;
  /**
   * Start Session 전 마이크 권한 판정 (`S4-H2R`, `D4-112` · `D4-119` CP-8). 권한이 미정이면 **지금** 묻는다
   * (OS·브라우저 프롬프트). 허용 → `recorded`, 거부·차단·장치 없음 → `conversation_only`.
   * 판정에 연 마이크 스트림은 돌려주기 **전에 닫는다** (AC-4-146 — Home·ready 동안 마이크 표시등 0).
   * 서버 요청이 아니다.
   */
  resolveSessionMode(): Promise<SessionMode>;
  /**
   * 대화 전용 세션 진입 안내(마이크 시트 자동 1회, `D4-119` CP-10 · `D4-120` Q15)를 이 세션에 **처음** 내는가.
   * 처음이면 `true` 를 돌려주고 기록한다 — 같은 앱 실행 안에서 같은 세션은 다시 `false`. 메모리 기록이다.
   */
  takeConversationNotice(sessionId: string): boolean;
}

const SessionRecorderContext = createContext<SessionRecorderEnvironment | null>(null);

export interface SessionRecorderProviderProps {
  environment: SessionRecorderEnvironment;
  children: ReactNode;
}

export function SessionRecorderProvider({ environment, children }: SessionRecorderProviderProps) {
  return <SessionRecorderContext value={environment}>{children}</SessionRecorderContext>;
}

/** 조립되어 있지 않으면 `null` (테스트 트리 등). 로그아웃 정리가 기본값으로 떨어지는 데 쓴다. */
export function useOptionalSessionRecorderEnvironment(): SessionRecorderEnvironment | null {
  return use(SessionRecorderContext);
}

function useSessionRecorderEnvironment(): SessionRecorderEnvironment {
  const environment = use(SessionRecorderContext);
  if (environment === null) {
    throw new Error('useSessionRecorder must be used inside <SessionRecorderProvider>.');
  }
  return environment;
}

const NO_NOTICES: SessionRecorderNotices = {
  peek: () => null,
  take: () => null,
  retention: () => null,
  dismissRetention: () => Promise.resolve(),
  capturing: () => false,
  retryUploads: () => 'started',
  subscribe: () => () => undefined,
};

function useNotices(): SessionRecorderNotices {
  return use(SessionRecorderContext)?.notices ?? NO_NOTICES;
}

export interface UseRecordingAppNoticesResult {
  /** 다음에 보일 앱 Toast 안내. 없으면 `null`. */
  next: RecordingAppNotice | null;
  /** 녹음 중인 세션 화면이 있다 — 이 동안 Toast 를 띄우지 않는다 (`D4-120` Q13). */
  capturing: boolean;
  take(): RecordingAppNotice | null;
  retryUploads(): UploadRetryResult;
}

/**
 * 앱 수준 녹음 안내 (`S4-H3` · `D4-117`) — 14일 · 48h · 크래시 복구 Toast 의 **사건만** 옮긴다. Toast 문구·순차 표시는
 * 호출한 쪽(feature)이 정한다. 조립되지 않은 트리에서는 안내 0.
 */
export function useRecordingAppNotices(): UseRecordingAppNoticesResult {
  const notices = useNotices();
  const subscribe = useCallback((listener: () => void) => notices.subscribe(listener), [notices]);
  const next = useSyncExternalStore(subscribe, notices.peek);
  const capturing = useSyncExternalStore(subscribe, notices.capturing);
  return { next, capturing, take: notices.take, retryUploads: notices.retryUploads };
}

export interface UseRetentionNoticeResult {
  notice: RetentionNotice | null;
  dismiss(): void;
}

/** Home 7일 보관 배너 상태 (`S4-H3`, 4b Spec §18.3 · §18.5). 조립되지 않은 트리에서는 `null`. */
export function useRetentionNotice(): UseRetentionNoticeResult {
  const notices = useNotices();
  const subscribe = useCallback((listener: () => void) => notices.subscribe(listener), [notices]);
  const notice = useSyncExternalStore(subscribe, notices.retention);
  const dismiss = useCallback(() => {
    void notices.dismissRetention();
  }, [notices]);
  return { notice, dismiss };
}

export interface UseResolveSessionModeResult {
  /**
   * 권한을 판정해 생성 body 의 `mode` 를 돌려준다. 판정 중에 다시 부르면 **같은 판정**을 돌려준다 —
   * 프롬프트는 1건이다 (AC-4-145 ⑥). 조립되지 않은 트리에서는 묻지 않고 `recorded`.
   */
  resolve(): Promise<SessionMode>;
  /** 판정 중 — 호출한 쪽이 기존 `Button loading` 을 켠다 (4b Spec §18.2 ①). */
  isResolving: boolean;
}

/**
 * Start Session 전 세션 모드 결정 (`S4-H2R`, Plan §13.3 ②). Home Activity Card · 서재 두 feature 가 같은 규칙을
 * 쓰도록 entity 에 둔다 — 권한 포트는 조립 지점(`app/providers`)이 고른다 (feature 간 import 0, AC-4-145 ⑧).
 * 판정 결과를 쓸지(시트가 아직 열려 있는지)는 호출한 쪽이 정한다.
 */
export function useResolveSessionMode(): UseResolveSessionModeResult {
  const environment = use(SessionRecorderContext);
  const inFlight = useRef<Promise<SessionMode> | null>(null);
  const [isResolving, setResolving] = useState(false);

  const resolve = useCallback((): Promise<SessionMode> => {
    if (environment === null) return Promise.resolve('recorded');
    if (inFlight.current !== null) return inFlight.current;
    setResolving(true);
    const pending = environment.resolveSessionMode().finally(() => {
      inFlight.current = null;
      setResolving(false);
    });
    inFlight.current = pending;
    return pending;
  }, [environment]);

  return { resolve, isResolving };
}

/**
 * 대화 전용 세션 진입 안내 (`D4-119` CP-10 · `D4-120` Q15) — `sessionId` 세션에 **처음** 들어왔을 때 `onFirstEntry`
 * 를 한 번 부른다. 기록은 조립 환경(앱 실행당, 메모리)이 가진다 — 같은 실행에서 같은 세션은 다시 부르지 않는다.
 * `sessionId` 가 `null` 이면(대상 아님) 아무것도 하지 않는다. 조립되지 않은 트리에서도 부르지 않는다.
 * 안내 표시(시트)는 호출한 쪽이 정한다 — `useRecoveredRecordingsNotice` 와 같은 모양이다.
 */
export function useConversationEntryNotice(
  sessionId: string | null,
  onFirstEntry: () => void,
): void {
  const environment = use(SessionRecorderContext);
  const callback = useRef(onFirstEntry);
  useEffect(() => {
    callback.current = onFirstEntry;
  }, [onFirstEntry]);
  useEffect(() => {
    if (environment === null || sessionId === null) return;
    if (environment.takeConversationNotice(sessionId)) callback.current();
  }, [environment, sessionId]);
}

const noopSubscribe = (): (() => void) => () => undefined;
const nullSnapshot = (): null => null;

export interface UseSessionRecorderResult {
  recorder: SessionRecorder | null;
  snapshot: SessionRecorderSnapshot | null;
}

/**
 * 세션 하나의 녹음 상태 머신을 화면 수명에 묶는다.
 *
 * - 생성은 **effect 안에서** 한다 — StrictMode 의 mount → cleanup → mount 에서 첫 인스턴스가
 *   `dispose()` 된 채 재사용되지 않도록, 마운트마다 새로 만들고 정리한다.
 * - `input` 이 `null` 이면(세션 조회 전) 만들지 않는다.
 * - 같은 노드 유지: 이 hook 은 컨트롤러를 바꾸지 않는 한 같은 인스턴스를 돌려준다.
 */
export function useSessionRecorder(
  input: Omit<SessionRecorderInput, 'readConsentStatus'> | null,
): UseSessionRecorderResult {
  const environment = useSessionRecorderEnvironment();
  const { me } = useMe();
  const consentRef = useRef<ConsentStatus | null | undefined>(undefined);
  useEffect(() => {
    consentRef.current = me === undefined ? undefined : (me?.consentStatus ?? null);
  }, [me]);

  const [recorder, setRecorder] = useState<SessionRecorder | null>(null);
  const sessionId = input?.sessionId ?? null;
  const mode = input?.mode ?? null;
  const readyAt = input?.readyAt ?? null;

  useEffect(() => {
    if (sessionId === null || mode === null || readyAt === null) return undefined;
    const created = environment.create({
      sessionId,
      mode,
      readyAt,
      readConsentStatus: () => consentRef.current,
    });
    setRecorder(created);
    return () => {
      setRecorder((current) => (current === created ? null : current));
      void created.dispose();
    };
  }, [environment, sessionId, mode, readyAt]);

  const subscribe = useCallback(
    (listener: () => void) => (recorder === null ? noopSubscribe() : recorder.subscribe(listener)),
    [recorder],
  );
  const getSnapshot = useCallback(
    () => (recorder === null ? nullSnapshot() : recorder.getSnapshot()),
    [recorder],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  return { recorder, snapshot };
}
