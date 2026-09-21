#!/usr/bin/env node
// D-6 — VITE_API_MODE=http 프로덕션 빌드 산출물에 **dev 전용 코드가 남아 있지 않은지** 검증한다.
// (AC-1-42: Mock Adapter · fixture · dev UI gallery · Scenario Panel 전부)
//
// 검사 대상 표식
//   __HARU_MOCK_SENTINEL__  src/mocks/index.ts   — Mock Adapter 모듈 그래프
//   __HARU_DEV_SENTINEL__   src/dev/devSentinel  — gallery · Scenario Panel 모듈 그래프
//   haru-dev-               src/dev/dev.css      — dev 전용 CSS (JS 가 사라져도 CSS 가 남을 수 있다)
//
// 하나라도 발견되면 종료 코드 1.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SENTINELS = [
  { name: '__HARU_MOCK_SENTINEL__', source: 'apps/web/src/mocks/index.ts' },
  { name: '__HARU_DEV_SENTINEL__', source: 'apps/web/src/dev/devSentinel.ts' },
  { name: 'haru-dev-', source: 'apps/web/src/dev/dev.css' },
];
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = join(repoRoot, 'apps', 'web');

if (!existsSync(webRoot)) {
  console.log('[assert:no-mocks] apps/web 이 아직 없습니다 (Stage 1-B 에서 생성). 검사 대상 없음.');
  process.exit(0);
}

const distRoot = join(webRoot, 'dist');
if (!existsSync(distRoot)) {
  console.error(
    '[assert:no-mocks] apps/web/dist 가 없습니다. VITE_API_MODE=http 빌드를 먼저 실행하세요.',
  );
  process.exit(1);
}

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const artifacts = walk(distRoot).filter((file) => /\.(js|mjs|cjs|css|html|map)$/.test(file));

let failed = false;

for (const sentinel of SENTINELS) {
  const offenders = artifacts.filter((file) => readFileSync(file, 'utf8').includes(sentinel.name));

  if (offenders.length > 0) {
    failed = true;
    console.error(
      `[assert:no-mocks] ${sentinel.name} (${sentinel.source}) 이(가) http 빌드 산출물에 남아 있습니다:`,
    );
    for (const file of offenders) console.error(`  - ${file}`);
  } else {
    console.log(`[assert:no-mocks] OK — ${sentinel.name} 0건 (${artifacts.length}개 파일 검사).`);
  }
}

if (failed) process.exit(1);
