/**
 * `SessionTransitionPort` 의 `sessionApi` 직결 구현 — 요청 1회 = `sessionApi.transition` 1회.
 *
 * 호출 경로는 그대로다: `RecordingController → SessionTransitionPort → sessionApi(interface) → Mock|Http`.
 * Adapter 를 고르지 않는다 — 넘겨받은 interface 만 쓴다 (선택 지점은 `app/providers`).
 *
 * ⚠️ 오프라인 적재·재전송(같은 Idempotency-Key 재사용)은 이 구현이 하지 않는다 → **`S4-E` `SessionOutbox`**
 * 가 이 포트를 감싼다. 여기서는 요청마다 새 키를 만든다 (재시도 없음).
 */
import type { SessionApi } from '../../../shared/api';
import { createIdempotencyKey } from '../../../shared/lib/idempotency';

import type { SessionTransitionPort } from './ports';

export interface SessionApiTransitionPortOptions {
  sessionApi: Pick<SessionApi, 'transition' | 'getDetail'>;
  sessionId: string;
  /** 테스트가 결정적인 키를 넣는다. */
  createKey?: () => string;
}

export function createSessionApiTransitionPort(
  options: SessionApiTransitionPortOptions,
): SessionTransitionPort {
  const { sessionApi, sessionId } = options;
  const createKey = options.createKey ?? createIdempotencyKey;
  return {
    send: (body) => sessionApi.transition({ sessionId, body }, { idempotencyKey: createKey() }),
    async fetchState() {
      const detail = await sessionApi.getDetail({ sessionId });
      return { status: detail.status, recordedSeconds: detail.recordedSeconds };
    },
  };
}
