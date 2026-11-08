/**
 * `/__dev/ui/recording-measure` — **AC-4-108 재현 경로** (Stage 4 `S4-E`, **dev 전용**).
 *
 * 제품 파이프라인(`WebRecorderAdapter` → `LocalRecordingStore` + `WebAppStatePort` → `CaptureTimeline`)으로
 * Web 백그라운드·탭 비활성·화면 잠금 중 **청크 수신이 계속되는지**를 사람이 기기에서 잰다. 결과는 화면에
 * 그대로 띄운다(기기에서는 콘솔을 볼 수 없다). 측정 코어는 `measure-core.ts`.
 *
 * 스타일은 `dev.css` 평문 CSS 다 — Tailwind 유틸리티를 쓰면 클래스가 Production CSS 에 남는다 (AC-1-42).
 *
 * ⭐ Stage 4b `S4-H4` (`D4-144`) — 실기기 확인 항목 2개 추가 (`latency-core.ts`):
 *   ⑧ 녹음 시작 지연 (AC-4-154 · AC-4-50 `NV-4B-1`) — 탭 → `start` 이벤트 · 첫 `dataavailable`, 5회 표 + 중위값
 *   ⑨ 판정 스트림 해제 (AC-4-155 · AC-4-146 `NV-4B-3`) — 실제 `resolveSessionMode` 동안 열린 트랙의 상태
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { createWebRecordingPlatform } from '../../app/providers/apiClients';
import { createSessionRecorderEnvironment } from '../../app/providers/sessionRecorderEnvironment';
import { useApiClients } from '../../shared/api/context';
import { createSystemScheduler } from '../../shared/lib/scheduler';
import { createSystemClock } from '../../shared/lib/clock';
import { RECORDER_TIMESLICE_MS, createWebRecorderAdapter } from '../../shared/platform/recorder';
import { wipeWebRecordingStorage } from '../../shared/platform/recording-storage';
import { __HARU_DEV_SENTINEL__ } from '../devSentinel';

import {
  START_LATENCY_RUNS,
  measureStartLatency,
  observeSessionModeStreams,
  summarizeStartLatency,
  type RecorderPrototypeLike,
  type StartLatencySample,
  type StreamReleaseObservation,
} from './latency-core';

import {
  clearMeasure,
  installRecordingMeasure,
  liveMeasure,
  preparePlayback,
  recoverMeasure,
  selfTest,
  startMeasure,
  stopMeasure,
  storageState,
  type PlaybackPart,
} from './measure-core';

import '../dev.css';

function format(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

interface PreparedPart extends Omit<PlaybackPart, 'blob'> {
  readonly url: string;
}

interface Playback {
  readonly bytesIn: string;
  readonly parts: readonly PreparedPart[];
}

/** `<audio>.duration` 원값 — Infinity / NaN 도 그대로 적는다 (비탐색 스트림 신호, RU-3). */
function formatDuration(value: number | null): string {
  if (value === null) return '(메타데이터 전)';
  return String(value);
}

/**
 * part 하나의 플레이어. iOS Safari 는 사용자 제스처 안에서만 재생하므로 `controls` 로 사람이 직접 누른다.
 */
function PartPlayer({ part }: { readonly part: PreparedPart }): React.JSX.Element {
  const [duration, setDuration] = useState<number | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  return (
    <div className="haru-dev-stack" data-measure-part={part.partNo}>
      <p className="haru-dev-section__note haru-dev-mono">
        {`part ${String(part.partNo)} · chunks ${String(part.chunks)} · ${String(part.bytes)} bytes · ${part.mimeType === '' ? '(mimeType 없음)' : part.mimeType}`}
        <br />
        {`decodeAudioData: ${part.decodedSeconds === null ? '실패' : `${String(part.decodedSeconds)}s`} · <audio>.duration: ${formatDuration(duration)}`}
        {errorCode === null ? null : ` · audio error.code ${String(errorCode)}`}
      </p>
      {/* dev 측정용 원음 확인 — 자막 원본이 없다 (Production 에 포함되지 않는 화면). */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        className="haru-dev-measure-audio"
        controls
        preload="metadata"
        src={part.url}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
        }}
        onDurationChange={(event) => {
          setDuration(event.currentTarget.duration);
        }}
        onError={(event) => {
          setErrorCode(event.currentTarget.error?.code ?? -1);
        }}
      />
    </div>
  );
}

const latencyClock = createSystemClock();
const latencyScheduler = createSystemScheduler();
/** 첫 `dataavailable` 대기 상한 — timeslice 의 5배 (그 안에 안 오면 `null` 로 기록). */
const FIRST_DATA_TIMEOUT_MS = RECORDER_TIMESLICE_MS * 5;
/** 판정 반환 뒤 다시 보는 시점 (Plan §13.5-⑤ B — +1s). */
const STREAM_SETTLE_MS = 1_000;

function formatMs(value: number | null): string {
  return value === null ? '—' : `${String(value)} ms`;
}

/** 브라우저 이름은 UA 원문을 그대로 보인다 — 기기에서 읽고 결과에 옮겨 적는다. */
function browserLabel(): string {
  return typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent;
}

/**
 * ⑧ · ⑨ — `S4-H4` 실기기 측정 (AC-4-154 · 155). 탭 시각은 버튼 입력 이벤트의 `timeStamp` 다.
 */
function SessionStartMeasure(): React.JSX.Element {
  const clients = useApiClients();
  /**
   * 측정 전용 녹음 조립 — **Web 플랫폼**을 쓴다(앱이 Mock 모드여도 실제 마이크로 판정한다). `resolveSessionMode`
   * 는 제품 함수 그대로이며 `clients` 를 쓰지 않는다(판정은 녹음기·권한만 본다).
   */
  const environment = useMemo(
    () =>
      createSessionRecorderEnvironment({
        clients,
        clock: latencyClock,
        scheduler: latencyScheduler,
        platform: createWebRecordingPlatform,
        wipeDevice: wipeWebRecordingStorage,
      }),
    [clients],
  );
  const [samples, setSamples] = useState<readonly StartLatencySample[]>([]);
  const [busy, setBusy] = useState(false);
  const [streams, setStreams] = useState<StreamReleaseObservation | null>(null);
  const summary = summarizeStartLatency(samples);
  const mimeType = samples.find((sample) => sample.mimeType !== '')?.mimeType ?? '—';
  const full = samples.length >= START_LATENCY_RUNS;

  return (
    <section className="haru-dev-section" id="measure-start-latency">
      <h2 className="haru-dev-section__title">⑧ 녹음 시작 지연 · ⑨ 판정 스트림 (S4-H4)</h2>
      <p className="haru-dev-section__note">
        ⑧ 을 {START_LATENCY_RUNS}번 누른다(마이크 권한을 먼저 허용해 둔다 — 프롬프트 시간이 섞이지
        않게). 회차마다 제품 녹음기로 첫 청크까지 녹음하고 멈춘다. 판정 끝점은{' '}
        <span className="haru-dev-mono">start</span> 이벤트다(CP-16).
      </p>
      <div className="haru-dev-row">
        <button
          type="button"
          id="measure-start-latency-run"
          className="haru-dev-nav__link"
          disabled={busy || full}
          onClick={(event) => {
            const tapAtMs = event.timeStamp;
            setBusy(true);
            void measureStartLatency({
              tapAtMs,
              adapter: createWebRecorderAdapter({
                clock: latencyClock,
                scheduler: latencyScheduler,
              }),
              proto: MediaRecorder.prototype as unknown as RecorderPrototypeLike,
              timesliceMs: RECORDER_TIMESLICE_MS,
              timeoutMs: FIRST_DATA_TIMEOUT_MS,
              now: () => performance.now(),
              scheduler: latencyScheduler,
            }).then((sample) => {
              setSamples((previous) => [...previous, sample]);
              setBusy(false);
            });
          }}
        >
          ⑧ 녹음 시작 지연 1회 ({String(samples.length)}/{String(START_LATENCY_RUNS)})
        </button>
        <button
          type="button"
          className="haru-dev-nav__link"
          disabled={busy}
          onClick={() => {
            setSamples([]);
          }}
        >
          ⑧ 기록 지우기
        </button>
        <button
          type="button"
          id="measure-stream-release"
          className="haru-dev-nav__link"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setStreams(null);
            void observeSessionModeStreams({
              devices: navigator.mediaDevices,
              resolveSessionMode: () => environment.resolveSessionMode(),
              settleMs: STREAM_SETTLE_MS,
              scheduler: latencyScheduler,
            }).then((observed) => {
              setStreams(observed);
              setBusy(false);
            });
          }}
        >
          ⑨ 판정 스트림 관측
        </button>
      </div>
      <p className="haru-dev-section__note haru-dev-mono" id="measure-start-latency-env">
        {`browser ${browserLabel()}`}
        <br />
        {`mimeType ${mimeType} · timeslice ${String(RECORDER_TIMESLICE_MS)} ms`}
      </p>
      <table className="haru-dev-table haru-dev-mono" id="measure-start-latency-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">탭 → start</th>
            <th scope="col">탭 → 첫 dataavailable</th>
            <th scope="col">오류</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((sample, index) => (
            // 회차 순서가 곧 식별자다 (지우기 전에는 추가만 한다)
            <tr key={index} data-measure-run={index + 1}>
              <td>{String(index + 1)}</td>
              <td>{formatMs(sample.tapToStartMs)}</td>
              <td>{formatMs(sample.tapToFirstDataMs)}</td>
              <td>{sample.error ?? '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr data-measure-median="">
            <th scope="row">중위값</th>
            <td>{formatMs(summary.medianStartMs)}</td>
            <td>{formatMs(summary.medianFirstDataMs)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
      {streams === null ? null : (
        <div className="haru-dev-stack" id="measure-stream-release-result">
          <p className="haru-dev-section__note haru-dev-mono">
            {`판정 ${streams.result ?? '—'}${streams.error === null ? '' : ` · 오류 ${streams.error}`} · 스트림 ${String(streams.streamsOpened)} · 트랙 ${String(streams.tracksOpened)} · 감싸기 원복 ${streams.restored ? 'yes' : 'NO'}`}
            <br />
            {`반환 직후 ${streams.afterReturn.map((track) => `${track.kind}:${track.readyState}`).join(', ') || '—'}`}
            <br />
            {`+1s ${streams.afterOneSecond.map((track) => `${track.kind}:${track.readyState}`).join(', ') || '—'}`}
          </p>
          {streams.streamsOpened === 0 ? (
            <p className="haru-dev-section__note">
              판정이 마이크를 열지 않았다 — 권한이 이미 허용(또는 차단)되어 있으면 판정은 상태만
              읽는다. 열린 스트림을 보려면 사이트 마이크 권한을 &quot;묻기&quot; 로 되돌린 뒤 다시
              누른다.
            </p>
          ) : null}
          <p className="haru-dev-section__note">
            모든 트랙이 <span className="haru-dev-mono">ended</span> 면 앱은 마이크를 놓았다. 지금
            OS 마이크 표시등(주소창 · 상태 표시줄)이 꺼졌는지 눈으로 확인해 함께 적는다.
          </p>
        </div>
      )}
    </section>
  );
}

export function RecordingMeasurePage(): React.JSX.Element {
  const [readout, setReadout] = useState('아래 버튼을 눌러 측정을 시작한다.');
  const [recording, setRecording] = useState(false);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const pollRef = useRef<number | null>(null);
  const urlsRef = useRef<string[]>([]);

  const revokeUrls = (): void => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  };

  useEffect(() => {
    installRecordingMeasure();
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
      revokeUrls();
    };
  }, []);

  const run = (label: string, task: () => Promise<unknown>): void => {
    void (async () => {
      try {
        setReadout(`${label}\n${format(await task())}`);
      } catch (error) {
        setReadout(`${label}\nERROR ${error instanceof Error ? error.name : 'unknown'}`);
      }
    })();
  };

  return (
    <div className="haru-dev-root" data-dev-sentinel={__HARU_DEV_SENTINEL__}>
      <main className="haru-dev-main">
        <h1 className="haru-dev-section__title">S4-E — Web 녹음 백그라운드 측정 (AC-4-108)</h1>
        <p className="haru-dev-lede">
          dev 전용 측정 도구다. 실제 마이크 + 제품 저장소(OPFS · IndexedDB)를 쓴다. 측정 후 ⑤ 로
          지운다.
        </p>

        <div className="haru-dev-row">
          <button
            type="button"
            className="haru-dev-nav__link"
            disabled={recording}
            onClick={() => {
              setRecording(true);
              run('startMeasure()', async () => {
                const started = await startMeasure();
                pollRef.current = window.setInterval(() => {
                  setReadout(`녹음 중\n${format(liveMeasure())}`);
                }, 1000);
                return started;
              });
            }}
          >
            ① 녹음 시작
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            disabled={!recording}
            onClick={() => {
              if (pollRef.current !== null) window.clearInterval(pollRef.current);
              setRecording(false);
              run('stopMeasure()', stopMeasure);
            }}
          >
            ② 녹음 종료 · 요약
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            onClick={() => {
              run('recoverMeasure()', recoverMeasure);
            }}
          >
            ③ 되읽기 · 디코드
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            onClick={() => {
              run('storageState()', storageState);
            }}
          >
            ④ 저장 상태
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            disabled={recording}
            onClick={() => {
              revokeUrls();
              setPlayback(null);
              run('clearMeasure()', clearMeasure);
            }}
          >
            ⑤ 로컬 녹음 지우기
          </button>
          <button
            type="button"
            id="measure-self-test"
            className="haru-dev-nav__link"
            disabled={recording}
            onClick={() => {
              run('selfTest()', selfTest);
            }}
          >
            ⑥ 저장소 self-test
          </button>
          <button
            type="button"
            id="measure-prepare-playback"
            className="haru-dev-nav__link"
            disabled={recording}
            onClick={() => {
              revokeUrls();
              setPlayback(null);
              run('preparePlayback()', async () => {
                const prepared = await preparePlayback();
                if (prepared === null) return { session: null };
                const parts = prepared.parts.map(({ blob, ...rest }) => {
                  const url = URL.createObjectURL(blob);
                  urlsRef.current.push(url);
                  return { ...rest, url };
                });
                setPlayback({ bytesIn: prepared.bytesIn, parts });
                return {
                  bytesIn: prepared.bytesIn,
                  parts: parts.map(({ url: _url, ...rest }) => rest),
                };
              });
            }}
          >
            ⑦ 재생 준비
          </button>
        </div>

        {playback === null ? null : (
          <section className="haru-dev-section" id="measure-playback">
            <h2 className="haru-dev-section__title">재생</h2>
            <p className="haru-dev-section__note haru-dev-mono">
              {`저장 계층 ${playback.bytesIn} · part ${String(playback.parts.length)}개`}
            </p>
            {playback.parts.length === 0 ? (
              <p className="haru-dev-section__note">저장된 part 가 없다.</p>
            ) : (
              playback.parts.map((part) => <PartPlayer key={part.url} part={part} />)
            )}
          </section>
        )}

        <SessionStartMeasure />

        <section className="haru-dev-section">
          <h2 className="haru-dev-section__title">결과</h2>
          <p className="haru-dev-section__note">
            ① 을 누른 뒤 탭 전환 · 창 최소화 · 화면 잠금을 하고 60초 뒤 돌아와 ② 를 누른다.
            <span className="haru-dev-mono"> hiddenIntervals[].chunksDuring</span> 이 0 이고
            <span className="haru-dev-mono"> maxChunkGapMs</span> 가 숨긴 시간만큼 벌어졌으면 그
            구간의 녹음이 끊긴 것이다. 기기 · 브라우저 · 버전을 함께 적는다.
          </p>
          <pre className="haru-dev-spike-readout haru-dev-mono">{readout}</pre>
        </section>
      </main>
    </div>
  );
}

export default RecordingMeasurePage;
