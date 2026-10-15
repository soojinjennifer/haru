/**
 * SHA-256 — 업로드 확정의 part 무결성 값 (`Sha256HexSchema`). Web Crypto 만 쓴다.
 */
import { Sha256HexSchema } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { sha256Hex } from '../sha256';

describe('sha256Hex', () => {
  it('알려진 벡터 — "abc"', async () => {
    expect(await sha256Hex(new TextEncoder().encode('abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('빈 입력도 contract 형식(소문자 hex 64자)이다', async () => {
    const value = await sha256Hex(new Uint8Array(0));
    expect(value).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(Sha256HexSchema.safeParse(value).success).toBe(true);
  });
});
