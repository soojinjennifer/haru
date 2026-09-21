/**
 * 주입 가능한 시계 — Plan §8.3 "Mock 은 `Date.now()` 를 직접 호출하지 않고 주입된 clock 을 쓴다".
 *
 * Mock Adapter · fixture 는 **반드시** 주입된 `Clock` 만 사용한다. 그래야 같은 scenario 가
 * 항상 같은 응답 바이트를 만든다 (AC-1-11 · AC-1-39).
 * `Date.now()` 를 호출하는 곳은 이 파일의 `createSystemClock()` 하나뿐이며,
 * 이 함수는 Mock 경로에서 쓰지 않는다.
 */
export interface Clock {
  /** epoch milliseconds */
  now(): number;
  /** ISO 8601 UTC 문자열 (`packages/contracts` 의 `IsoDateTimeSchema` 형식) */
  nowIso(): string;
}

/** 실제 시각. Mock 이 아닌 경로(Http Adapter 로깅 등)에서만 쓴다. */
export function createSystemClock(): Clock {
  return {
    now: () => Date.now(),
    nowIso: () => new Date(Date.now()).toISOString(),
  };
}

/** 항상 같은 시각을 돌려주는 시계. Mock 의 기본 시계다. */
export function createFixedClock(epochMs: number): Clock {
  const iso = new Date(epochMs).toISOString();
  return {
    now: () => epochMs,
    nowIso: () => iso,
  };
}

/**
 * 고정 시작점에서 호출마다 일정 간격으로 전진하는 시계.
 * "경과 시간" 이 필요한 Mock(Stage 4 이후 녹음 시간 등)에서도 결정성을 유지하기 위한 형태다.
 */
export function createSteppedClock(startEpochMs: number, stepMs: number): Clock {
  let current = startEpochMs;

  const advance = (): number => {
    const value = current;
    current += stepMs;
    return value;
  };

  return {
    now: advance,
    nowIso: () => new Date(advance()).toISOString(),
  };
}
