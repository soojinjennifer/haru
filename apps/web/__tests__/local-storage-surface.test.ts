// @vitest-environment node
/**
 * `S4-E` 완료 판정의 **정적** 증거 — 로컬 저장 · network/appState 포트 (`R4-01` 과 같은 원칙).
 *
 * 1. 포트 interface 파일에 DOM · 브라우저 저장소 타입이 **실행 코드로** 나오지 않는다 → 후속 단계가 Native
 *    구현을 **추가만** 하면 된다.
 * 2. `features/recording` 은 브라우저 저장소 API(`indexedDB` · `navigator.storage` · `OfflineAudioContext`)
 *    를 직접 부르지 않고, Web 구현 모듈도 import 하지 않는다 (선택 지점은 `app/providers`).
 * 3. AC-4-20 — 클라이언트 전용 업로드 상태 이름이 `packages/contracts` 에 없다.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const WEB_SRC = join(import.meta.dirname, '..', 'src');
const CONTRACTS_SRC = join(import.meta.dirname, '..', '..', '..', 'packages', 'contracts', 'src');
const PORT_FILES = [
  join(WEB_SRC, 'shared', 'platform', 'app-state', 'app-state-port.ts'),
  join(WEB_SRC, 'shared', 'platform', 'recording-storage', 'recording-storage.ts'),
];
const FEATURE_DIR = join(WEB_SRC, 'features', 'recording');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry: string) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function codeOf(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const DOM_TYPES = [
  'Blob',
  'Event',
  'EventTarget',
  'DOMException',
  'Navigator',
  'Document',
  'Window',
  'MediaDevices',
  'StorageManager',
  'IDBDatabase',
  'IDBObjectStore',
  'IDBKeyRange',
  'FileSystemDirectoryHandle',
  'FileSystemFileHandle',
  'AudioContext',
  'OfflineAudioContext',
  'AudioBuffer',
];

describe.each(PORT_FILES)('포트 interface 에 DOM 타입이 없다 — %s', (file) => {
  const code = codeOf(file);

  it('실행 코드가 있다 (검사가 헛돌지 않도록)', () => {
    expect(code).toMatch(/export interface/);
  });

  it.each(DOM_TYPES)('`%s` 0건', (name) => {
    expect(code).not.toMatch(new RegExp(`\\b${name}\\b`));
  });

  it('다른 모듈을 import 하지 않는다', () => {
    expect(code).not.toMatch(/^\s*import\b/m);
  });
});

describe('features/recording 은 브라우저 저장소를 직접 만지지 않는다', () => {
  const production = walk(FEATURE_DIR).filter(
    (file) => /\.ts$/.test(file) && !file.includes(`${'__tests__'}`),
  );

  it('소스가 있다', () => {
    expect(production.length).toBeGreaterThanOrEqual(10);
  });

  it('indexedDB · navigator.storage · OfflineAudioContext · crypto.subtle 호출 0건', () => {
    const offenders = production.filter((file) =>
      /\bindexedDB\b|navigator\.storage|OfflineAudioContext|AudioContext|crypto\.subtle/.test(
        codeOf(file),
      ),
    );
    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });

  it('Web 구현 모듈 · 생성 함수를 import 하지 않는다', () => {
    const offenders = production.filter((file) =>
      /web-opfs|web-indexeddb|web-recording-storage|web-app-state|createWeb[A-Z]\w*|wipeWebRecordingStorage/.test(
        codeOf(file),
      ),
    );
    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });
});

describe('AC-4-20 — 클라이언트 전용 업로드 상태는 contracts 에 없다', () => {
  const contracts = walk(CONTRACTS_SRC)
    .filter((file) => /\.ts$/.test(file) && !file.includes(`${'__tests__'}`))
    .map(codeOf)
    .join('\n');
  const uploadStatusFile = codeOf(join(CONTRACTS_SRC, 'enums', 'upload-status.ts'));

  // `queued` 는 서버 분석 Job 상태(`AnalysisJobStatus`)에 **다른 뜻으로** 있다 — 업로드 큐와 무관하다.
  it.each(['local_only', 'uploading', 'failed_retrying', 'stalled_48h'])('`%s` 0건', (state) => {
    expect(contracts).not.toMatch(new RegExp(`['"]${state}['"]`));
  });

  it.each(['local_only', 'queued', 'uploading', 'failed_retrying', 'stalled_48h'])(
    '서버 `UploadStatus` enum 에 `%s` 없음',
    (state) => {
      expect(uploadStatusFile).toContain('z.enum');
      expect(uploadStatusFile).not.toMatch(new RegExp(`['"]${state}['"]`));
    },
  );
});
