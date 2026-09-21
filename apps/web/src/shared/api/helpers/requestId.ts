/**
 * `X-Request-Id` 규약 — `docs/API_CONTRACTS.md` §1 Conventions.
 *
 * "Client 가 `X-Request-Id`(uuid) 를 전송할 수 있고, 서버는 응답 헤더와 Error Envelope 에
 * 그대로 되돌려준다." Mock 도 같은 규약을 따른다(주입된 `idFactory` 로 결정적으로 생성).
 */
import { IdSchema } from '@haru/contracts';

import type { IdFactory } from '../../lib/idFactory';

export const REQUEST_ID_HEADER = 'X-Request-Id';

/** 주입된 생성기로 uuid 형식 request id 를 만든다. 형식 위반은 개발 중에 즉시 드러낸다. */
export function createRequestId(idFactory: IdFactory): string {
  return IdSchema.parse(idFactory.next());
}

/** 응답 헤더에서 서버가 echo 한 request id 를 꺼낸다 (없으면 클라이언트가 보낸 값 유지). */
export function readRequestId(headers: Headers, fallback: string): string {
  const echoed = headers.get(REQUEST_ID_HEADER);
  return echoed !== null && echoed.length > 0 ? echoed : fallback;
}
