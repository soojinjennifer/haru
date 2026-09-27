/**
 * `Idempotency-Key` 생성 — `docs/API_CONTRACTS.md` §1 Conventions.
 *
 * Mock 경로가 아니라 **앱 경로**의 생성기다. Mock 내부 ID 는 여전히 주입된 seed 기반
 * `idFactory` 가 만든다 (결정성 — AC-2-52). 여기는 "사용자가 지금 제출한다" 는 행위마다
 * 새 키가 필요한 자리이므로 실제 난수 uuid 를 쓴다.
 *
 * 재시도는 **같은 키**를 다시 보내야 한다 (중복 제출 방지 — S2-R12). 그래서 키를 만드는
 * 시점은 "요청을 보낼 때" 가 아니라 "제출 의도가 생길 때" 이며, 이를 관리하는 것은
 * Mutation hook 의 책임이다 (`entities/consent/useRecordConsents.ts`).
 */
import { createRandomIdFactory } from './idFactory';

const idFactory = createRandomIdFactory();

export function createIdempotencyKey(): string {
  return idFactory.next();
}
