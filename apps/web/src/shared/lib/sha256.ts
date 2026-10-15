/**
 * SHA-256 (소문자 hex 64자) — 업로드 확정 요청의 part 무결성 값 (`Sha256HexSchema`, AC-4-16).
 *
 * Web Crypto(`crypto.subtle.digest`)만 쓴다 — 신규 dependency 없음. 브라우저·Node 모두 전역에 있다.
 */
export type Sha256Hasher = (bytes: Uint8Array) => Promise<string>;

export const sha256Hex: Sha256Hasher = async (bytes) => {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === undefined) throw new Error('Web Crypto is not available.');
  const digest = await subtle.digest('SHA-256', bytes.slice());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};
