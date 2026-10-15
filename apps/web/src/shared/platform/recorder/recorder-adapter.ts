/**
 * `RecorderAdapter` — 녹음 캡처의 **플랫폼 경계** (`docs/ARCHITECTURE.md` §10.4, Plan §9.4).
 *
 * ```
 * RecordingController (features/recording, 순수 TS)
 *   → RecorderAdapter  ← WebRecorderAdapter (Stage 4) | MockRecorderAdapter (테스트·Mock) | NativeRecorderAdapter (후속 S4N-B)
 * ```
 *
 * ⭐ **`R4-01` 완화 — 이 파일에는 `MediaRecorder` · `MediaStream` · `Blob` · `BlobEvent` · `Event` ·
 * `DOMException` · `AbortSignal` 같은 DOM 타입이 나오지 않는다.** 청크 본문은 ECMAScript 타입
 * `Uint8Array`, MIME 은 원문 `string`, 인터럽션 원인은 플랫폼 중립 enum 이다. 그래서 후속 단계가
 * `NativeRecorderAdapter` 를 **추가만** 하면 된다 (`D4-1`, Plan §0.4 · §5.2-2).
 * 이 성질은 `__tests__/recorder-adapter-surface.test.ts` 가 소스 grep 으로 고정한다.
 *
 * 플랫폼 차이(예: WebKit 청크 거동 — `D4-27`)는 **구현 안에만** 둔다. Controller 는 아래 약속만 믿는다.
 *
 * ── 약속 ──
 * 1. `start()` 가 resolve 되면 캡처가 시작된 것이다. 청크는 `onChunk` 로 **순서대로** 온다.
 * 2. 청크의 `mimeType` 은 **그 청크가 실제로 담고 온 원문**이다 (`M-3` — 시작 직후 값이 아니다).
 * 3. `stop()` 은 마지막 청크까지 전달한 **뒤에** resolve 한다.
 * 4. 캡처가 의도와 무관하게 끊기면 `onInterruption({ captureStopped: true })` 가 **반드시** 온다.
 *    구현은 그 감지를 플랫폼 이벤트 하나에 맡기지 않는다 (`M-7` — Web `track.onended` 는 오지 않았다).
 * 5. `captureStopped: true` 뒤의 캡처 재개는 `resume()` 이 아니라 **새 `start()`** (= 새 part) 다.
 */

/** 녹음 캡처가 일어나는 플랫폼. Stage 4 는 `web` 만 구현한다 (`D4-1`). */
export type RecorderPlatform = 'web' | 'ios' | 'android';

/** 마이크 권한 — `unavailable` = 기기·브라우저에 녹음 수단이 없다 (권한 문제가 아니다). */
export type MicPermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable';

/** 권한 요청 결과 — 요청 후에는 `prompt` 가 남지 않는다. */
export type MicPermissionResult = Exclude<MicPermissionState, 'prompt'>;

export interface RecorderCapabilities {
  readonly platform: RecorderPlatform;
  /** 앱이 백그라운드여도 캡처가 유지되는가. Web = `false` (보장 불가 — `D4-4`·`D4-26`). */
  readonly backgroundCapture: boolean;
  /** 화면 잠금 중에도 캡처가 유지되는가. Web = `false`. */
  readonly screenLockCapture: boolean;
  /** 캡처를 끊지 않고 일시정지·재개할 수 있는가. */
  readonly nativePause: boolean;
}

export interface RecorderStartOptions {
  /** 청크 간격 (ms). 기본값은 `RECORDER_TIMESLICE_MS` (`D4-28`). */
  readonly timesliceMs: number;
}

/** 캡처된 청크 1개. */
export interface RecorderChunk {
  /** 같은 캡처(part) 안의 순번 — 1부터. */
  readonly seq: number;
  readonly bytes: Uint8Array;
  /** 이 청크가 실제로 담고 온 MIME 원문 (`D4-23` — 정규화하지 않는다). 모르면 빈 문자열. */
  readonly mimeType: string;
  /** 캡처 시작부터 이 청크가 도착할 때까지의 경과 (ms). */
  readonly offsetMs: number;
  /** 캡처가 끝나며 나온 마지막 조각인가. */
  readonly final: boolean;
}

/**
 * 인터럽션 원인 — **플랫폼 중립**. Web 매핑(`WebRecorderAdapter`):
 * - `background` ← `visibilitychange`(hidden)
 * - `input_changed` ← `devicechange`
 * - `capture_lost` ← 트랙 `readyState === 'ended'` · 레코더가 스스로 멈춤 · 레코더 오류 (iOS 전화 수신 포함)
 * - `chunk_stalled` ← 청크 watchdog (마지막 청크 이후 기대 간격을 크게 넘김 — `M-7`, `D4-27`)
 */
export type RecorderInterruptionCause =
  'background' | 'input_changed' | 'capture_lost' | 'chunk_stalled';

export interface RecorderInterruption {
  readonly cause: RecorderInterruptionCause;
  /**
   * 캡처가 실제로 멈췄는가. `true` 면 그때까지의 청크는 이미 전달됐고, 이어서 녹음하려면 새 `start()` 가
   * 필요하다. `false` 면 **알림만** 이다 (예: 탭이 숨겨졌지만 청크는 계속 온다 — `D4-26`).
   */
  readonly captureStopped: boolean;
}

export interface RecorderStopResult {
  readonly chunkCount: number;
  readonly byteLength: number;
  /** 마지막으로 관측된 청크 MIME 원문. 청크가 없었으면 빈 문자열. */
  readonly mimeType: string;
}

export type RecorderUnsubscribe = () => void;

export interface RecorderAdapter {
  capabilities(): RecorderCapabilities;
  /** 현재 권한 상태 — 사용자에게 묻지 않는다. */
  checkPermission(): Promise<MicPermissionState>;
  /** 권한을 요청한다 — 필요하면 OS·브라우저 프롬프트가 뜬다. */
  requestPermission(): Promise<MicPermissionResult>;
  /** 새 캡처(part)를 시작한다. 권한이 없으면 `RecorderStartError('permission_denied')` 로 reject. */
  start(options: RecorderStartOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  /** 캡처를 끝낸다. 이미 끝났으면 빈 결과로 resolve 한다. */
  stop(): Promise<RecorderStopResult>;
  onChunk(listener: (chunk: RecorderChunk) => void): RecorderUnsubscribe;
  onInterruption(listener: (interruption: RecorderInterruption) => void): RecorderUnsubscribe;
  /** 리스너·장치를 전부 놓는다. 이후 호출은 하지 않는다. */
  dispose(): void;
}

export type RecorderStartFailure = 'permission_denied' | 'unavailable' | 'busy' | 'failed';

/** `start()` 실패 — 원인을 플랫폼 중립 값으로 싣는다. */
export class RecorderStartError extends Error {
  override readonly name = 'RecorderStartError';
  readonly reason: RecorderStartFailure;

  constructor(reason: RecorderStartFailure, message: string, options: { cause?: unknown } = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.reason = reason;
  }
}

export function isRecorderStartError(value: unknown): value is RecorderStartError {
  return value instanceof RecorderStartError;
}

/**
 * timeslice 기본값 — **1000ms** (`D4-28`, 2026-10-15). 크래시 시 최대 손실 ≈1초, 30분 ≈1766 청크.
 * 값을 바꿀 때는 **이 상수 하나만** 고친다.
 */
export const RECORDER_TIMESLICE_MS = 1000;

/**
 * 청크 watchdog 배수 — 마지막 청크 이후 `timeslice × 이 값` 동안 청크가 없으면 정체로 본다 (`M-7`).
 * 3 = 정상 지터(spike 실측 gap ≤ timeslice + 수십 ms)와 실제 정체를 구분하는 여유.
 */
export const RECORDER_WATCHDOG_FACTOR = 3;
