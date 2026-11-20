/**
 * Web `FileSharePort` — Web Share API Level 2 + `<a download>` (Stage 7 Plan §5.5, MDN 2026-11-19 조회).
 *
 * - `canShareFile`: `navigator.canShare?.({ files: [file] }) === true` — `application/pdf` 는 "usually shareable" 이지만
 *   런타임 확인 필수(Baseline 아님). `navigator.share` 가 없으면 `false`.
 * - `shareFile`: `AbortError` → `'cancelled'` · 그 밖의 오류 → `FileShareRejectedError`.
 * - `saveFile`: blob URL + 임시 `<a download>` 클릭 → **즉시 제거 · `revokeObjectURL`** (영속 저장 0, AC-7-60).
 *   revoke 를 다음 task 로 미루는 이유: 일부 브라우저는 클릭 직후 동기 revoke 시 다운로드를 시작하지 못한다.
 *
 * 환경 의존(navigator · document · URL)은 주입 가능하다 — 단위 테스트가 실제 DOM 없이 분기를 검증한다.
 */
import {
  FileShareRejectedError,
  type FileShareOutcome,
  type FileSharePort,
} from './file-share-port';

export interface WebFileShareEnvironment {
  navigator: Pick<Navigator, 'share' | 'canShare'> | undefined;
  document: Pick<Document, 'createElement' | 'body'> | undefined;
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  /** revoke 를 다음 task 로 미룬다. */
  defer(task: () => void): void;
}

export function createBrowserFileShareEnvironment(): WebFileShareEnvironment {
  return {
    navigator: typeof navigator === 'undefined' ? undefined : navigator,
    document: typeof document === 'undefined' ? undefined : document,
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => {
      URL.revokeObjectURL(url);
    },
    defer: (task) => {
      globalThis.setTimeout(task, 0);
    },
  };
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

export function createWebFileSharePort(
  environment: WebFileShareEnvironment = createBrowserFileShareEnvironment(),
): FileSharePort {
  const { navigator: nav } = environment;

  return {
    canShareFile(file: File): boolean {
      if (nav === undefined || typeof nav.share !== 'function') return false;
      if (typeof nav.canShare !== 'function') return false;
      try {
        return nav.canShare({ files: [file] });
      } catch {
        return false;
      }
    },

    async shareFile(file: File, title: string): Promise<FileShareOutcome> {
      if (nav === undefined || typeof nav.share !== 'function') {
        throw new FileShareRejectedError('NotSupportedError');
      }
      try {
        await nav.share({ files: [file], title });
        return 'shared';
      } catch (error) {
        if (errorName(error) === 'AbortError') return 'cancelled';
        throw new FileShareRejectedError(errorName(error), { cause: error });
      }
    },

    saveFile(blob: Blob, fileName: string): void {
      const doc = environment.document;
      if (doc === undefined) return;
      const url = environment.createObjectURL(blob);
      const anchor = doc.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = 'noopener';
      anchor.hidden = true;
      doc.body.append(anchor);
      try {
        anchor.click();
      } finally {
        anchor.remove();
        environment.defer(() => {
          environment.revokeObjectURL(url);
        });
      }
    },
  };
}
