/**
 * `FileSharePort` — 파일 **저장(다운로드)·공유** 플랫폼 포트 (Stage 7 Plan §5.5 `N7-19` → `D7-4`, FR-17).
 *
 * | 구현 | 단계 | 하는 일 |
 * |---|---|---|
 * | Web (`web-file-share.ts`) | Stage 7 | `navigator.canShare({ files })` · `navigator.share()` · `<a download>` + blob URL |
 * | Mock (`mocks/platform/MockFileSharePort.ts`) | Stage 7 | scenario `report-pdf:share-cancelled` · `share-unsupported` 재현 |
 * | Native (Capacitor Share · Filesystem) | 후속 `S4N-A` (`D4-1`) | 이 interface 를 **추가 구현만** 한다 |
 *
 * 교체가 실제로 예정된 경계(Web ↔ Native)라서 Port 로 둔다 (`architecture.md` §1).
 *
 * ── 호출 규칙 (MDN `Navigator.share()` — secure context · transient activation 필수) ──
 * - `shareFile` · `saveFile` 은 **사용자 탭 핸들러 안에서** `await` 선행 없이 부른다 (Plan §5.3 `R7-04` · `N7-40`).
 *   그래서 `File`/`Blob` 은 호출 전에 준비되어 있어야 한다 — 이 포트는 네트워크를 쓰지 않는다.
 * - 공유 취소(`AbortError`)는 오류가 아니다 → `'cancelled'`.
 * - 그 밖의 거절(`NotAllowedError` 등)은 `FileShareRejectedError` 로 던진다 → 화면은 저장 안내.
 * - 파일명·URL 은 로그에 남기지 않는다 (아이 이름 포함 가능 — Plan §5.6).
 */
export type FileShareOutcome = 'shared' | 'cancelled';

export interface FileSharePort {
  /** 이 환경이 이 파일을 공유할 수 있는가. `false` 면 화면은 저장 버튼만 낸다 (`share-unsupported`). */
  canShareFile(file: File): boolean;
  /** OS 공유 시트. 사용자 취소 = `'cancelled'` (오류 아님). */
  shareFile(file: File, title: string): Promise<FileShareOutcome>;
  /** 파일 저장(다운로드). 동기 — 탭 핸들러 안에서 바로 부른다. */
  saveFile(blob: Blob, fileName: string): void;
}

/** 공유가 거절되었다 (`NotAllowedError` · 미지원 등 — 사용자 취소 아님). 원인 메시지에 파일명을 넣지 않는다. */
export class FileShareRejectedError extends Error {
  override readonly name = 'FileShareRejectedError';

  /** 원래 DOMException 이름 (`NotAllowedError` · `TypeError` …). PII 없음. */
  readonly reason: string;

  constructor(reason: string, options?: { cause?: unknown }) {
    super('Sharing was not allowed.', options);
    this.reason = reason;
  }
}

export function isFileShareRejectedError(error: unknown): error is FileShareRejectedError {
  return error instanceof FileShareRejectedError;
}
