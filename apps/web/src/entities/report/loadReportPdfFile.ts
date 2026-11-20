/**
 * `loadReportPdfFile` — `ready` 응답의 signed URL 에서 PDF 바이트를 받아 `File` 로 만든다 (Stage 7 Plan §5.3 · `S7-F`).
 *
 * 왜 미리 받는가 (`R7-04` · `N7-40`): `navigator.share()` 와 저장은 **사용자 탭(transient activation) 안에서** `await`
 * 선행 없이 불러야 한다. 그래서 `ready` 에 도달하는 순간 바이트를 메모리에 받아 두고, 탭 핸들러는 준비된 `File` 만 쓴다.
 *
 * - 메모리 전용 — `localStorage` · IndexedDB · Cache Storage 저장 0 (Plan §5.6). 담는 곳은 `reportKeys.pdf` 기록뿐.
 * - Mock = `data:` URL(H7-1.6 ⑧), Http = private Storage signed URL (`P7-BIP-09`). 둘 다 `fetch` 로 읽는다.
 * - URL · 파일명은 오류 메시지 · 로그에 넣지 않는다 (아이 이름 포함 가능).
 */
import type { ReportPdfStatus } from '@haru/contracts';

const PDF_MIME = 'application/pdf';

export type ReadyReportPdfStatus = ReportPdfStatus & {
  status: 'ready';
  downloadUrl: string;
  fileName: string;
};

export function isReadyReportPdfStatus(status: ReportPdfStatus): status is ReadyReportPdfStatus {
  return status.status === 'ready' && status.downloadUrl !== null && status.fileName !== null;
}

/** PDF 를 받지 못했다. 메시지에 URL · 파일명 0. */
export class ReportPdfDownloadError extends Error {
  override readonly name = 'ReportPdfDownloadError';
}

export type FetchLike = (input: string, init?: { signal?: AbortSignal }) => Promise<Response>;

export async function loadReportPdfFile(
  status: ReadyReportPdfStatus,
  options: { signal?: AbortSignal | undefined; fetcher?: FetchLike | undefined } = {},
): Promise<File> {
  const fetcher: FetchLike = options.fetcher ?? ((input, init) => globalThis.fetch(input, init));
  const response = await fetcher(
    status.downloadUrl,
    options.signal === undefined ? undefined : { signal: options.signal },
  );
  if (!response.ok) throw new ReportPdfDownloadError('The PDF could not be downloaded.');
  // 바이트로 받아 만든다 — 응답 Blob 의 구현(realm)과 무관하게 같은 `File` 이 된다.
  const bytes = await response.arrayBuffer();
  return new File([bytes], status.fileName, { type: PDF_MIME });
}
