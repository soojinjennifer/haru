/**
 * 주입 가능한 timer — Plan §8.3 "지연도 주입 timer → 테스트에서 0ms".
 *
 * Mock 의 `loading` scenario 는 성공 응답을 지연시켜 Skeleton / 버튼 loading 을 검증한다.
 * 지연이 `setTimeout` 에 직접 묶이면 테스트가 실시간을 기다려야 하므로,
 * timer 를 주입해 테스트에서는 즉시 해소되게 한다.
 */
export interface Timer {
  sleep(ms: number, signal?: AbortSignal | undefined): Promise<void>;
}

/** 실제 시간이 흐르는 timer. 앱 실행(dev 서버 · Mock 프리뷰 빌드)에서 쓴다. */
export function createRealTimer(): Timer {
  return {
    sleep: (ms, signal) =>
      new Promise<void>((resolve, reject) => {
        if (ms <= 0) {
          resolve();
          return;
        }

        if (signal?.aborted === true) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }

        const id = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        }, ms);

        function onAbort(): void {
          clearTimeout(id);
          reject(new DOMException('Aborted', 'AbortError'));
        }

        signal?.addEventListener('abort', onAbort, { once: true });
      }),
  };
}

/** 지연을 즉시 해소하는 timer. 테스트 기본값이다 (0ms). */
export function createImmediateTimer(): Timer {
  return { sleep: () => Promise.resolve() };
}

/** 주입된 timer 로 지연시킨 뒤 값을 돌려준다. */
export async function withDelay<T>(
  timer: Timer,
  ms: number,
  produce: () => T | Promise<T>,
  signal?: AbortSignal | undefined,
): Promise<T> {
  await timer.sleep(ms, signal);
  return produce();
}
