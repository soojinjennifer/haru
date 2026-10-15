/**
 * `/__dev/ui/recording-measure` — **AC-4-108 재현 경로** (Stage 4 `S4-E`, **dev 전용**).
 *
 * 제품 파이프라인(`WebRecorderAdapter` → `LocalRecordingStore` + `WebAppStatePort` → `CaptureTimeline`)으로
 * Web 백그라운드·탭 비활성·화면 잠금 중 **청크 수신이 계속되는지**를 사람이 기기에서 잰다. 결과는 화면에
 * 그대로 띄운다(기기에서는 콘솔을 볼 수 없다). 측정 코어는 `measure-core.ts`.
 *
 * 스타일은 `dev.css` 평문 CSS 다 — Tailwind 유틸리티를 쓰면 클래스가 Production CSS 에 남는다 (AC-1-42).
 */
import { useEffect, useRef, useState } from 'react';

import { __HARU_DEV_SENTINEL__ } from '../devSentinel';

import {
  clearMeasure,
  installRecordingMeasure,
  liveMeasure,
  recoverMeasure,
  selfTest,
  startMeasure,
  stopMeasure,
  storageState,
} from './measure-core';

import '../dev.css';

function format(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function RecordingMeasurePage(): React.JSX.Element {
  const [readout, setReadout] = useState('아래 버튼을 눌러 측정을 시작한다.');
  const [recording, setRecording] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    installRecordingMeasure();
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
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
        </div>

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
