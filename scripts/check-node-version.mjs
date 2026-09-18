#!/usr/bin/env node
// HARU — Node 버전 가드 (Stage 1-A 후속 F-1, 사용자 승인 2026-09-19)
//
// 왜 필요한가: pnpm 12 는 워크스페이스 **루트 프로젝트 자신의** `engines.node` 를 강제하지 않는다
// (의존 패키지의 engines 에만 적용). 그래서 승인값(.nvmrc 24.21.0 / engines.node ">=24.21.0 <25")
// 이 실효가 없었다. 이 스크립트를 root `preinstall` 로 걸어 직접 검사하고,
// 불일치면 **종료 코드 1 로 설치를 중단**한다.
//
// 원칙:
//   - 판정 기준은 package.json 의 `engines.node` 하나뿐이다. 범위를 여기에 하드코딩하지 않는다.
//   - 외부 semver 의존을 추가하지 않는다 (Node 내장 기능만 사용).
//   - **우회 경로(환경변수 bypass 등)를 두지 않는다.** 기계적 차단이 승인된 동작이다.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const PACKAGE_JSON_URL = new URL('../package.json', import.meta.url);

/** "v24.16.0" · "24.16.0-nightly" → [24, 16, 0] (prerelease 꼬리는 버린다). */
export function parseVersion(raw) {
  const match = /^\s*v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(String(raw));
  if (!match) throw new Error(`버전 문자열을 해석할 수 없습니다: "${raw}"`);
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

/** [major, minor, patch] 비교. a<b → -1, a===b → 0, a>b → 1 */
export function compareVersions(a, b) {
  for (let i = 0; i < 3; i += 1) {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;
    if (left !== right) return left < right ? -1 : 1;
  }
  return 0;
}

/**
 * `engines.node` 범위를 판정한다.
 * 지원 형식: 공백으로 이어진 비교자(AND) — 예 ">=24.21.0 <25".
 * `||`(OR) · `^` · `~` · `x` 와일드카드는 이 프로젝트의 승인 정책(§16.1 D-10)에 없으므로
 * 조용히 통과시키지 않고 예외로 알린다.
 */
export function satisfiesEngineRange(version, range) {
  const current = parseVersion(version);
  const comparators = String(range).trim().split(/\s+/).filter(Boolean);
  if (comparators.length === 0) throw new Error('engines.node 범위가 비어 있습니다.');

  return comparators.every((comparator) => {
    const match = /^(>=|<=|>|<|=)?(.+)$/.exec(comparator);
    if (!match) throw new Error(`지원하지 않는 engines.node 비교자입니다: "${comparator}"`);
    const [, operator = '=', bound] = match;
    if (/[|^~x*]/i.test(bound)) {
      throw new Error(
        `지원하지 않는 engines.node 표기입니다: "${comparator}" — ` +
          'scripts/check-node-version.mjs 를 함께 갱신하세요.',
      );
    }
    const target = parseVersion(bound);
    const result = compareVersions(current, target);
    switch (operator) {
      case '>=':
        return result >= 0;
      case '>':
        return result > 0;
      case '<=':
        return result <= 0;
      case '<':
        return result < 0;
      default:
        return result === 0;
    }
  });
}

/** package.json 의 engines.node 를 읽는다. */
export function readRequiredNodeRange(packageJsonUrl = PACKAGE_JSON_URL) {
  const pkg = JSON.parse(readFileSync(packageJsonUrl, 'utf8'));
  const range = pkg?.engines?.node;
  if (typeof range !== 'string' || range.trim() === '') {
    throw new Error('package.json 에 engines.node 가 정의되어 있지 않습니다.');
  }
  return range;
}

function failureMessage(currentVersion, range) {
  return [
    '',
    '✖ Node 버전이 HARU 요구 범위와 다릅니다. 설치를 중단합니다.',
    '',
    `  현재 Node 버전 : ${currentVersion}`,
    `  요구 범위      : ${range}   (package.json → engines.node)`,
    `  권장 고정 버전 : .nvmrc 참조`,
    '',
    '  해결 방법 (둘 중 하나):',
    '   1) 공식 설치 파일: https://nodejs.org 에서 위 요구 범위에 맞는 LTS(macOS .pkg)를 내려받아 설치',
    '   2) 버전 관리자 사용:',
    '        fnm  →  brew install fnm   후   fnm use --install-if-missing $(cat .nvmrc)',
    '        nvm  →  nvm install $(cat .nvmrc) && nvm use',
    '',
    '  설치 후 `node -v` 로 확인한 다음 `pnpm install` 을 다시 실행하세요.',
    '  (이 검사에는 우회 옵션이 없습니다 — 승인된 버전 정책: docs/plans/stage-1-plan.md §16.1 D-10)',
    '',
  ].join('\n');
}

export function checkNodeVersion(
  currentVersion = process.version,
  range = readRequiredNodeRange(),
) {
  if (satisfiesEngineRange(currentVersion, range)) {
    return { ok: true, currentVersion, range };
  }
  return { ok: false, currentVersion, range, message: failureMessage(currentVersion, range) };
}

const isDirectRun =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = checkNodeVersion();
    if (!result.ok) {
      process.stderr.write(`${result.message}\n`);
      process.exit(1);
    }
    process.stdout.write(
      `[check-node-version] OK — Node ${result.currentVersion} 은(는) "${result.range}" 를 만족합니다.\n`,
    );
  } catch (error) {
    process.stderr.write(
      `\n✖ Node 버전 검사를 수행할 수 없습니다: ${error instanceof Error ? error.message : String(error)}\n\n`,
    );
    process.exit(1);
  }
}
