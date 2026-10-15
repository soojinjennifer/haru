/**
 * `recorder` scenario 그룹 — **`RecorderAdapter` mock 이 읽을 재현 계획**의 유일한 정의 위치.
 *
 * `RecorderAdapter` interface 와 그 mock 은 `S4-D` 가 만든다. 이 파일은 `S4-C` 범위로
 * **무엇을 재현할지**만 결정적으로 정한다 — mock 은 `resolveRecorderScenario(store)` 의 결과를 따른다.
 * Catalogue §5.4 의 "sessions (RecorderAdapter mock)" key 를 이 그룹이 담는다.
 *
 * ── key ──
 * | key | 계획 |
 * |---|---|
 * | `success` | 권한 허용 · 사건 없음 |
 * | `mic-permission-denied` | 권한 거부 → 안내 · 대화만 하기 (AC-4-63) |
 * | `recording-interrupted` | 인터럽션 → 일시정지 · 재개 안내, 로컬 청크 보존 (AC-4-68). 원인은 아래 |
 * | `web-background-warning` | ⭐ `D4-4` · **`D4-26`** — 녹음 중 탭이 1회 **숨겨졌다 돌아온다**. 녹음은 멈추지 않는다 |
 * | `auto-timeout` | 누적 30분 도달 → `completed(auto_timeout)` (AC-4-64) — 시간 진행은 S4-D 의 주입 clock |
 * | `crash-recovered` | 미완료 로컬 녹음 발견 → `completed(recovered_after_crash)` (AC-4-65) — 로컬 저장소 seed 는 `localStoreScenarios.ts` (S4-E) |
 * | `local-retention-exceeded` | ⭐ `D4-29` (S4-E) — 14일이 지난 미업로드 로컬 녹음 → 로컬 삭제. 어댑터 무관 — seed 는 `localStoreScenarios.ts` |
 *
 * ── 인터럽션 3종 구분 (`D4-1` · `D4-4`, Plan §8.3) ──
 * Catalogue Rev 8 판단대로 **key 를 쪼개지 않는다** (사용자 대면 동작이 같다). 원인은 **메서드 자리**로 고른다:
 *   `?scenario=recorder.visibilitychange:recording-interrupted`  — 탭 비활성
 *   `?scenario=recorder.devicechange:recording-interrupted`      — 오디오 입력 변경
 *   `?scenario=recorder.track-ended:recording-interrupted`       — OS 가 마이크 회수 (iOS Safari 전화 수신 포함)
 * 그룹 지정 `?scenario=recorder:recording-interrupted` 은 **3종을 정해진 순서로 모두** 낸다.
 * 이렇게 하면 QA 가 **어느 경로가 깨졌는지** 원인 하나씩 재현할 수 있다.
 *
 * ── `web-background-warning` 의 범위 (`D4-26`, 2026-10-14) ──
 * 안내는 **조건 없는 안내**다 — "Web 에서는 화면을 켜 두어야 녹음이 보장된다" 수준. 이 계획은 **언제 몇 초
 * 뒤에 끊긴다** 같은 측정값을 담지 않는다 (실기기 측정 전, AC-4-108 `NOT VERIFIED`). 측정 후 조건이 생기면
 * **이 파일의 이 key 하나만** 고친다. 사용자 문구는 여기 두지 않는다 — 문구는 feature copy 모듈
 * (`rules/frontend.md` §8)이 소유하고 `S4-F` 에서 design-agent 명세(`D4-8`)로 들어간다.
 */
import type { ScenarioGroupDefinition, ScenarioStore } from '../scenarios';

export const RECORDER_SCENARIO_KEYS = [
  'success',
  'mic-permission-denied',
  'recording-interrupted',
  'web-background-warning',
  'auto-timeout',
  'crash-recovered',
  'local-retention-exceeded',
] as const;

export type RecorderScenarioKey = (typeof RECORDER_SCENARIO_KEYS)[number];

export const recorderScenarioGroup: ScenarioGroupDefinition<RecorderScenarioKey> = {
  group: 'recorder',
  keys: RECORDER_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Web 인터럽션 3종 — 정해진 순서 (그룹 지정 시 이 순서로 낸다). */
export const INTERRUPTION_CAUSES = ['visibilitychange', 'devicechange', 'track-ended'] as const;

export type InterruptionCause = (typeof INTERRUPTION_CAUSES)[number];

/**
 * 사건을 내는 시점 — 녹음 시작 후 **몇 번째 청크 뒤**인지. 시간이 아니라 청크 수라서 결정적이다.
 * (S4-D 가 다른 기준이 필요하면 이 값만 바꾼다.)
 */
export const RECORDER_EVENT_AFTER_CHUNKS = 3;

export interface RecorderScenarioPlan {
  /** 그룹 지정 key (메서드 지정만 있으면 `recording-interrupted`). */
  readonly key: RecorderScenarioKey;
  readonly permission: 'granted' | 'denied';
  /** 낼 인터럽션 원인 — 순서대로. 비어 있으면 인터럽션 없음. */
  readonly interruptions: readonly InterruptionCause[];
  /** `web-background-warning` — 녹음 중 탭이 1회 숨겨졌다 돌아온다. 녹음은 계속된다. */
  readonly backgroundOnce: boolean;
  readonly autoTimeout: boolean;
  readonly crashRecovered: boolean;
  readonly eventAfterChunks: number;
}

/** scenario store 에서 RecorderAdapter mock 의 재현 계획을 만든다 (결정적 — 시간·난수 없음). */
export function resolveRecorderScenario(store: ScenarioStore): RecorderScenarioPlan {
  const groupKey = store.resolve(recorderScenarioGroup);

  const byMethod = INTERRUPTION_CAUSES.filter((cause) => {
    const scoped = store.resolveScoped(recorderScenarioGroup, cause);
    return scoped.scope === 'method' && scoped.key === 'recording-interrupted';
  });

  const interruptions: readonly InterruptionCause[] =
    byMethod.length > 0
      ? byMethod
      : groupKey === 'recording-interrupted'
        ? INTERRUPTION_CAUSES
        : [];

  return {
    key: byMethod.length > 0 && groupKey === 'success' ? 'recording-interrupted' : groupKey,
    permission: groupKey === 'mic-permission-denied' ? 'denied' : 'granted',
    interruptions,
    backgroundOnce: groupKey === 'web-background-warning',
    autoTimeout: groupKey === 'auto-timeout',
    crashRecovered: groupKey === 'crash-recovered',
    eventAfterChunks: RECORDER_EVENT_AFTER_CHUNKS,
  };
}
