/**
 * `/__dev/ui/recording-spike` — `S4-A` Web 녹음 spike 조작판 (**dev 전용**)
 *
 * 두 가지 쓰임이 있다.
 *   1. **Playwright 드라이버**(`apps/web/scripts/recording-spike-measure.mjs`)의 대상 페이지.
 *      드라이버는 `#spike-activate` 를 눌러 **user activation** 을 얻고(WebKit 의 AudioContext
 *      autoplay 제약) 그 다음부터는 `window.__haruRecordingSpike` 를 직접 호출한다.
 *   2. **실기기 수동 측정** — iOS Safari 화면 잠금처럼 **자동화로 만들 수 없는 상황**
 *      (Plan `S4-A` ⑥ · AC-4-108 ③)은 사람이 기기에서 이 화면을 눌러 재야 한다.
 *      그래서 결과를 화면에 그대로 띄운다(기기에서는 콘솔을 볼 수 없다).
 *
 * `console` 을 쓰지 않는다 (저장소 전역 `no-console` — PII 유출 경로 차단). 화면에 찍히는 값은
 * 청크 크기·시각·mimeType·저장소 용량뿐이며 **오디오는 합성 사인파**다 (`spike-core.ts`).
 *
 * 스타일은 `dev.css` 평문 CSS 다 — Tailwind 유틸리티를 쓰면 클래스가 Production CSS 에 남는다
 * (`dev.css` 머리말 · AC-1-42).
 */
import { useEffect, useRef, useState } from 'react';

import { __HARU_DEV_SENTINEL__ } from '../devSentinel';

import {
  installRecordingSpike,
  listRuns,
  probeEnvironment,
  recover,
  snapshot,
  startRun,
  stopRun,
  storageEstimate,
  clearStore,
} from './spike-core';

import '../dev.css';

const TIMESLICE_CHOICES = [1000, 3000, 5000] as const;

function format(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function RecordingSpikePage(): React.JSX.Element {
  const [readout, setReadout] = useState('아래 버튼을 눌러 측정을 시작한다.');
  const [running, setRunning] = useState(false);
  const [timesliceMs, setTimesliceMs] = useState<number>(1000);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    installRecordingSpike();
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
    };
  }, []);

  const run = (label: string, task: () => Promise<unknown> | unknown): void => {
    void (async () => {
      try {
        const result = await task();
        setReadout(`${label}\n${format(result)}`);
      } catch (error) {
        setReadout(`${label}\nERROR ${error instanceof Error ? error.message : String(error)}`);
      }
    })();
  };

  return (
    <div className="haru-dev-root" data-dev-sentinel={__HARU_DEV_SENTINEL__}>
      <main className="haru-dev-main">
        <h1 className="haru-dev-section__title">S4-A — Web 녹음 spike</h1>
        <p className="haru-dev-lede">
          dev 전용 측정 도구다. 오디오는 440Hz 합성 사인파이며 마이크를 쓰지 않는다. 자동 측정은{' '}
          <span className="haru-dev-mono">apps/web/scripts/recording-spike-measure.mjs</span> 가
          돌린다. 이 화면은 실기기(iOS Safari 화면 잠금 등) 수동 측정용이다.
        </p>

        <div className="haru-dev-row">
          <button
            type="button"
            id="spike-activate"
            className="haru-dev-nav__link"
            onClick={() => {
              setReadout('user activation 확보됨 (AudioContext 재생 제약 해제).');
            }}
          >
            ① user activation
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            onClick={() => {
              run('probeEnvironment()', probeEnvironment);
            }}
          >
            ② 환경 조사
          </button>
          {TIMESLICE_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              className="haru-dev-nav__link"
              aria-pressed={timesliceMs === choice}
              onClick={() => {
                setTimesliceMs(choice);
              }}
            >
              timeslice {choice}ms
            </button>
          ))}
          <button
            type="button"
            className="haru-dev-nav__link"
            disabled={running}
            onClick={() => {
              setRunning(true);
              run('startRun()', async () => {
                const first = await startRun({ timesliceMs, source: 'synthetic' });
                pollRef.current = window.setInterval(() => {
                  try {
                    const live = snapshot();
                    setReadout(
                      `녹음 중 — 청크 ${String(live.chunks.length)}개\n${format({
                        recorderMimeType: live.recorderMimeType,
                        state: live.state,
                        audioContextState: live.audioContextState,
                        startLatencyMs: live.startLatencyMs,
                        lastChunks: live.chunks.slice(-5),
                        writes: live.writes.slice(-5),
                        events: live.events,
                        timers: live.timers,
                      })}`,
                    );
                  } catch {
                    // 종료된 뒤의 폴링은 무시한다.
                  }
                }, 1000);
                return first;
              });
            }}
          >
            ③ 녹음 시작
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            disabled={!running}
            onClick={() => {
              if (pollRef.current !== null) window.clearInterval(pollRef.current);
              setRunning(false);
              run('stopRun()', stopRun);
            }}
          >
            ④ 녹음 종료
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            onClick={() => {
              run('recover()', () => recover());
            }}
          >
            ⑤ 복구 검사
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            onClick={() => {
              run('listRuns() + storageEstimate()', async () => ({
                runs: await listRuns(),
                storage: await storageEstimate(),
              }));
            }}
          >
            ⑥ 저장 상태
          </button>
          <button
            type="button"
            className="haru-dev-nav__link"
            onClick={() => {
              run('clearStore()', clearStore);
            }}
          >
            ⑦ 저장소 비우기
          </button>
        </div>

        <section className="haru-dev-section">
          <h2 className="haru-dev-section__title">결과</h2>
          <p className="haru-dev-section__note">
            화면 잠금 측정: ③ 을 누르고 바로 기기를 잠근 뒤 60초 후 깨워 ④ → ⑤ 를 누른다.
            <span className="haru-dev-mono"> chunks</span> 의
            <span className="haru-dev-mono"> gapMs</span> 가 끊긴 구간이 중단 구간이다.
          </p>
          <pre className="haru-dev-spike-readout haru-dev-mono">{readout}</pre>
        </section>
      </main>
    </div>
  );
}

export default RecordingSpikePage;
