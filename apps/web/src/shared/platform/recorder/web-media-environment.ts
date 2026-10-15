/**
 * `WebRecorderAdapter` 가 브라우저에 닿는 **유일한 자리** — `MediaRecorder` · `getUserMedia` ·
 * `navigator.permissions` · `visibilitychange` · `devicechange`.
 *
 * Adapter 본체(`web-recorder-adapter.ts`)는 아래의 작은 handle 만 본다. 그래서
 * ① jsdom 테스트가 가짜 환경을 주입해 Adapter 의 판단(청크 순서 · watchdog · 인터럽션)을 검증하고
 * ② WebKit 차이(`D4-27`)가 드러나면 **이 파일과 Adapter 안에서만** 고친다.
 *
 * DOM 타입은 이 파일과 Adapter 구현 안에만 있다. `recorder-adapter.ts`(interface) 에는 나오지 않는다.
 */

export type WebRecorderState = 'inactive' | 'recording' | 'paused';

/** `BlobEvent.data` 에서 Adapter 가 쓰는 부분. */
export interface WebChunkData {
  readonly size: number;
  /** `Blob.type` — 청크가 실제로 담은 MIME 원문 (`M-3`). */
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface WebStreamHandle {
  /** 오디오 트랙 중 하나라도 `readyState === 'ended'` 인가 (`M-7` 폴링 대상). */
  trackEnded(): boolean;
  /** 트랙을 모두 멈춰 마이크를 놓는다. */
  release(): void;
}

export interface WebRecorderHandle {
  state(): WebRecorderState;
  /** `recorder.mimeType` — ⚠️ `start()` 직후에는 빈 문자열이다 (`M-3`). 청크 시점에만 읽는다. */
  mimeType(): string;
  start(timesliceMs: number): void;
  pause(): void;
  resume(): void;
  stop(): void;
  requestData(): void;
  onData(listener: (data: WebChunkData) => void): void;
  onStop(listener: () => void): void;
  onError(listener: () => void): void;
}

export type WebPermissionQueryResult = 'granted' | 'denied' | 'prompt' | null;

export interface WebMediaEnvironment {
  /** `getUserMedia` 와 `MediaRecorder` 가 모두 있는가. */
  supported(): boolean;
  /** `navigator.permissions.query({ name: 'microphone' })` — 지원하지 않으면 `null`. */
  queryPermission(): Promise<WebPermissionQueryResult>;
  /** 마이크 스트림을 연다. 실패 시 브라우저 오류(`name` 포함)를 그대로 던진다. */
  openStream(): Promise<WebStreamHandle>;
  createRecorder(stream: WebStreamHandle): WebRecorderHandle;
  /** 문서가 숨겨질 때마다 호출. 해제 함수를 돌려준다. */
  onHidden(listener: () => void): () => void;
  /** 오디오 장치 목록이 바뀔 때마다 호출. 해제 함수를 돌려준다. */
  onDeviceChange(listener: () => void): () => void;
}

/** 실제 브라우저 환경. 모듈 로드 시점에는 전역을 만지지 않는다 (SSR·테스트 안전). */
export function createBrowserMediaEnvironment(): WebMediaEnvironment {
  const streams = new WeakMap<WebStreamHandle, MediaStream>();

  const mediaDevices = (): MediaDevices | undefined =>
    typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;

  return {
    supported: () =>
      typeof MediaRecorder !== 'undefined' && typeof mediaDevices()?.getUserMedia === 'function',

    async queryPermission() {
      const permissions = typeof navigator === 'undefined' ? undefined : navigator.permissions;
      if (permissions === undefined || typeof permissions.query !== 'function') return null;
      try {
        // `microphone` 은 TS lib 의 PermissionName 에 있다. Safari 16 미만은 TypeError 를 던진다.
        const status = await permissions.query({ name: 'microphone' });
        return status.state;
      } catch {
        return null;
      }
    },

    async openStream() {
      const devices = mediaDevices();
      if (devices === undefined) throw new Error('mediaDevices unavailable');
      const stream = await devices.getUserMedia({ audio: true });
      const handle: WebStreamHandle = {
        trackEnded: () => stream.getAudioTracks().some((track) => track.readyState === 'ended'),
        release: () => {
          for (const track of stream.getTracks()) track.stop();
        },
      };
      streams.set(handle, stream);
      return handle;
    },

    createRecorder(handle) {
      const stream = streams.get(handle);
      if (stream === undefined) throw new Error('unknown stream handle');
      // mimeType 을 지정하지 않는다 — 엔진 기본값(Chromium webm/opus · WebKit mp4/aac)을 그대로 쓴다.
      const recorder = new MediaRecorder(stream);
      return {
        state: () => recorder.state,
        mimeType: () => recorder.mimeType,
        start: (timesliceMs) => {
          recorder.start(timesliceMs);
        },
        pause: () => {
          recorder.pause();
        },
        resume: () => {
          recorder.resume();
        },
        stop: () => {
          recorder.stop();
        },
        requestData: () => {
          recorder.requestData();
        },
        onData: (listener) => {
          recorder.addEventListener('dataavailable', (event: BlobEvent) => {
            listener(event.data);
          });
        },
        onStop: (listener) => {
          recorder.addEventListener('stop', () => {
            listener();
          });
        },
        onError: (listener) => {
          recorder.addEventListener('error', () => {
            listener();
          });
        },
      };
    },

    onHidden(listener) {
      if (typeof document === 'undefined') return () => undefined;
      const handler = (): void => {
        if (document.visibilityState === 'hidden') listener();
      };
      document.addEventListener('visibilitychange', handler);
      return () => {
        document.removeEventListener('visibilitychange', handler);
      };
    },

    onDeviceChange(listener) {
      const devices = mediaDevices();
      if (devices === undefined || typeof devices.addEventListener !== 'function') {
        return () => undefined;
      }
      devices.addEventListener('devicechange', listener);
      return () => {
        devices.removeEventListener('devicechange', listener);
      };
    },
  };
}
