// @vitest-environment node
/**
 * `S4-D` 완료 판정의 **정적** 증거 (Plan 작업 단위 표 `S4-D` 행, `R4-01`, AC-4-47).
 *
 * 1. `RecorderAdapter` interface 파일에 DOM · `MediaRecorder` 타입이 **실행 코드로** 나오지 않는다
 *    (주석의 설명 문장은 제외) — 후속 단계가 `NativeRecorderAdapter` 를 **추가만** 하면 된다.
 * 2. `features/recording` 이 React 를 import 하지 않는다 (순수 TS).
 * 3. `features/recording` 이 Web 구현 · Mock 을 직접 import 하지 않는다 (선택 지점은 `app/providers`).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const WEB_SRC = join(import.meta.dirname, '..', 'src');
const INTERFACE_FILE = join(WEB_SRC, 'shared', 'platform', 'recorder', 'recorder-adapter.ts');
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

/** 웹 전용 타입 — 이 중 하나라도 interface 에 나오면 Native 구현이 그 타입을 흉내 내야 한다. */
const DOM_TYPES = [
  'MediaRecorder',
  'MediaStream',
  'MediaStreamTrack',
  'MediaDevices',
  'BlobEvent',
  'Blob',
  'Event',
  'EventTarget',
  'DOMException',
  'AbortSignal',
  'PermissionState',
  'PermissionStatus',
  'Navigator',
  'Document',
  'Window',
  'HTMLElement',
];

describe('R4-01 — RecorderAdapter interface 에 DOM 타입이 노출되지 않는다', () => {
  const code = codeOf(INTERFACE_FILE);

  it('interface 파일에 실행 코드가 있다 (검사가 헛돌지 않도록)', () => {
    expect(code).toContain('export interface RecorderAdapter');
  });

  it.each(DOM_TYPES)('`%s` 0건', (name) => {
    expect(code).not.toMatch(new RegExp(`\\b${name}\\b`));
  });

  it('interface 파일은 다른 모듈을 import 하지 않는다 (DOM 타입이 우회로 들어오지 않는다)', () => {
    expect(code).not.toMatch(/^\s*import\b/m);
  });
});

describe('AC-4-47 — features/recording 은 순수 TS 다', () => {
  const sources = walk(FEATURE_DIR).filter((file) => /\.tsx?$/.test(file));
  const production = sources.filter((file) => !file.includes(`${'__tests__'}`));

  it('소스가 있다 (검사가 헛돌지 않도록)', () => {
    expect(production.length).toBeGreaterThanOrEqual(5);
  });

  it('.tsx 파일이 없다 (테스트 포함)', () => {
    expect(sources.filter((file) => file.endsWith('.tsx'))).toEqual([]);
  });

  it('react · react-dom · @testing-library 를 import 하지 않는다 (테스트 포함)', () => {
    const offenders = sources.filter((file) =>
      /from\s+['"](react|react-dom|react\/[^'"]*|@testing-library\/[^'"]*)['"]/.test(codeOf(file)),
    );
    expect(offenders.map((file) => relative(WEB_SRC, file))).toEqual([]);
  });

  it('Web 구현 · Mock · providers 를 직접 import 하지 않는다 (선택 지점은 app/providers)', () => {
    const offenders = production.filter((file) =>
      /web-recorder-adapter|web-media-environment|\/mocks\/|app\/providers/.test(codeOf(file)),
    );
    expect(offenders.map((file) => relative(WEB_SRC, file))).toEqual([]);
  });
});
