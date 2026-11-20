/**
 * `MockFileSharePort` — 파일 저장·공유 포트의 Mock (Stage 7 `S7-A`, Plan §5.5 `N7-19` · §8 그룹 `report-pdf`).
 *
 * | `report-pdf` key | `canShareFile` | `shareFile` |
 * |---|---|---|
 * | `share-cancelled` | `true` | `'cancelled'` (사용자 취소 — 오류 아님, AC-7-59) |
 * | `share-unsupported` | **`false`** | 부르면 `FileShareRejectedError('NotSupportedError')` |
 * | 그 밖 (`success` …) | `true` | `'shared'` |
 *
 * `saveFile` 은 호출을 기록하고, `saveDelegate` 가 있으면 **그대로 넘긴다** — 브라우저 Mock 조립(`app/providers`)은
 * Web 포트의 저장을 넘겨 실제 다운로드가 일어나게 한다(e2e `download` 이벤트 계수 — AC-7-56). 공유만 Mock 이다
 * (OS 공유 시트는 자동화할 수 없다). 단위 테스트는 delegate 없이 "탭 1회 = 저장 1회 · ready 도달 시 자동 저장 0" 을 단정한다.
 * 파일명은 기록하지만 로그로 내보내지 않는다. 시간·난수 없음.
 */
import {
  FileShareRejectedError,
  type FileShareOutcome,
  type FileSharePort,
} from '../../shared/platform/file-share';
import { reportPdfScenarioGroup } from '../reports/reportScenarios';
import type { ScenarioStore } from '../scenarios';

export interface MockFileShareRecord {
  readonly kind: 'share' | 'save';
  readonly fileName: string;
  readonly size: number;
  readonly outcome?: FileShareOutcome | 'rejected';
}

export interface MockFileSharePort extends FileSharePort {
  /** 지금까지의 공유·저장 호출 (테스트 확인용). */
  records(): readonly MockFileShareRecord[];
}

export interface MockFileSharePortDeps {
  store: ScenarioStore;
  /** 실제 저장을 맡길 포트 (브라우저 조립 = Web 포트). 없으면 기록만 한다. */
  saveDelegate?: Pick<FileSharePort, 'saveFile'> | undefined;
}

export function createMockFileSharePort(deps: MockFileSharePortDeps): MockFileSharePort {
  const calls: MockFileShareRecord[] = [];
  const scenario = () => deps.store.resolve(reportPdfScenarioGroup);

  return {
    canShareFile: () => scenario() !== 'share-unsupported',

    shareFile(file: File): Promise<FileShareOutcome> {
      const key = scenario();
      if (key === 'share-unsupported') {
        calls.push({ kind: 'share', fileName: file.name, size: file.size, outcome: 'rejected' });
        return Promise.reject(new FileShareRejectedError('NotSupportedError'));
      }
      const outcome: FileShareOutcome = key === 'share-cancelled' ? 'cancelled' : 'shared';
      calls.push({ kind: 'share', fileName: file.name, size: file.size, outcome });
      return Promise.resolve(outcome);
    },

    saveFile(blob: Blob, fileName: string): void {
      calls.push({ kind: 'save', fileName, size: blob.size });
      deps.saveDelegate?.saveFile(blob, fileName);
    },

    records: () => calls.slice(),
  };
}
