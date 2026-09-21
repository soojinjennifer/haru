/**
 * 주입 가능한 ID 생성기 — Plan §8.3 "Mock 은 `Math.random()` 을 직접 호출하지 않고
 * 주입된 `idFactory`(scenario key 시드 기반)를 쓴다".
 *
 * Mock 이 만드는 모든 식별자(`X-Request-Id`, Error Envelope `requestId` 등)는 seed 와
 * 호출 순서만으로 결정된다. 같은 scenario 를 다시 실행하면 같은 ID 가 같은 순서로 나온다
 * (AC-1-39).
 *
 * `Math.random()` / `crypto.randomUUID()` 를 호출하는 곳은 이 파일의
 * `createRandomIdFactory()` 하나뿐이며, Mock 경로에서는 쓰지 않는다.
 */
export interface IdFactory {
  /** uuid 형식(`packages/contracts` 의 `IdSchema`)을 만족하는 식별자를 만든다. */
  next(): string;
}

/** FNV-1a 32bit — 짧고 결정적인 해시. 암호용이 아니다. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash >>> 0;
}

/** mulberry32 — seed 하나로 재현 가능한 의사난수 수열. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const HEX = '0123456789abcdef';

/** RFC 4122 v4 형태(version 4 · variant 10xx)의 uuid 문자열을 의사난수 수열로 만든다. */
function formatUuid(random: () => number): string {
  let out = '';

  for (let index = 0; index < 32; index += 1) {
    if (index === 8 || index === 12 || index === 16 || index === 20) out += '-';

    if (index === 12) {
      out += '4';
      continue;
    }

    const nibble = Math.floor(random() * 16) & 0xf;
    out += index === 16 ? HEX[(nibble & 0x3) | 0x8] : HEX[nibble];
  }

  return out;
}

/**
 * seed 로부터 결정적인 uuid 수열을 만든다. Mock 의 기본 ID 생성기다.
 * 같은 seed → 같은 수열(1번째·2번째… 호출이 항상 같은 값).
 */
export function createSeededIdFactory(seed: string): IdFactory {
  const random = mulberry32(fnv1a(seed));
  return { next: () => formatUuid(random) };
}

/** 실제 난수 uuid. Mock 이 아닌 경로(Http Adapter 의 `X-Request-Id`)에서 쓴다. */
export function createRandomIdFactory(): IdFactory {
  return {
    next: () =>
      typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : formatUuid(() => Math.random()),
  };
}
