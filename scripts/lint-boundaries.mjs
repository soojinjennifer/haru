#!/usr/bin/env node
// HARU import 경계 검사 실행기 (Stage 1 Plan §16 D-1)
// dependency-cruiser 는 존재하지 않는 경로를 인자로 받으면 실패하므로,
// 실제로 존재하는 workspace 루트 디렉토리만 전달한다.

import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = ['apps', 'packages'];

const targets = candidates.filter((dir) => {
  const full = join(repoRoot, dir);
  if (!existsSync(full)) return false;
  // 빈 디렉토리는 검사 대상이 없다.
  return readdirSync(full).some((entry) => !entry.startsWith('.'));
});

if (targets.length === 0) {
  console.error('[lint:boundaries] apps/ · packages/ 에 검사할 대상이 없습니다.');
  process.exit(1);
}

console.log(`[lint:boundaries] dependency-cruiser targets: ${targets.join(', ')}`);

const localBin = join(repoRoot, 'node_modules', '.bin', 'depcruise');
const depcruiseBin = existsSync(localBin) ? localBin : 'depcruise';

const result = spawnSync(
  depcruiseBin,
  ['--config', '.dependency-cruiser.cjs', '--output-type', 'err-long', ...targets],
  { cwd: repoRoot, stdio: 'inherit', shell: false },
);

if (result.error) {
  console.error('[lint:boundaries] depcruise 실행 실패:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
