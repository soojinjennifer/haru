#!/usr/bin/env node
// D-6 — VITE_API_MODE=http 프로덕션 빌드 산출물에 Mock 번들이 남아 있지 않은지 검증한다.
// mocks/index.ts 가 export 하는 sentinel 문자열이 dist 에서 발견되면 종료 코드 1.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SENTINEL = '__HARU_MOCK_SENTINEL__';
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

const offenders = walk(distRoot).filter((file) => {
  if (!/\.(js|mjs|cjs|css|html|map)$/.test(file)) return false;
  return readFileSync(file, 'utf8').includes(SENTINEL);
});

if (offenders.length > 0) {
  console.error(`[assert:no-mocks] Mock sentinel(${SENTINEL})이 http 빌드 산출물에 남아 있습니다:`);
  for (const file of offenders) console.error(`  - ${file}`);
  process.exit(1);
}

console.log(`[assert:no-mocks] OK — http 빌드 산출물에 ${SENTINEL} 0건.`);
