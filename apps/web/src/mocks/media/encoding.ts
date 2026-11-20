/**
 * Mock 미디어 공통 — 바이트 → `data:` URL.
 *
 * `blob:` URL 대신 `data:` URL 을 쓰는 이유: `blob:` 은 브라우저가 매번 다른 uuid 를 붙여 **응답 바이트가
 * 실행마다 달라진다**(결정성 — AC-7-19). `data:` 는 같은 입력이면 같은 문자열이고 `<audio src>` · `fetch()` ·
 * `<a download>` 가 모두 그대로 읽는다. 바이너리 에셋을 저장소에 커밋하지 않는다 (AC-7-17).
 */
const CHUNK = 0x8000;

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK));
  }
  return btoa(binary);
}

export function toDataUrl(mimeType: string, bytes: Uint8Array): string {
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}
