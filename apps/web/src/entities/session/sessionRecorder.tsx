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
}

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

export interface SessionRecorderEnvironment {
  create(input: SessionRecorderInput): SessionRecorder;
  /**
   * 이 기기의 로컬 녹음·업로드 큐·미전송 전이를 전부 지운다 — 로그아웃 정리 (AC-4-72).
   * 런타임 메모리 상태까지 비운다 (`S4-E` handoff E-8 ②).
   */
  clearLocalRecordings(): Promise<void>;
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
