#!/usr/bin/env node
/**
 * HARU Design Tokens — Inter woff2 로컬 동기화 (Stage 1 Plan §16 D-3, AC-1-14).
 *
 * `@fontsource-variable/inter` (SIL OFL) 에서 **latin subset · wght variable · normal**
 * woff2 **1개만** 빌드 산출물(`dist/assets/`)로 복사한다.
 *   - italic · latin-ext · cyrillic · greek · vietnamese 는 복사하지 않는다.
 *   - 저장소에는 폰트 바이너리를 커밋하지 않는다 (dist 는 .gitignore 대상).
 *   - 외부 CDN 을 호출하지 않는다.
 *
 * LICENSE 파일도 함께 복사해 배포 산출물에 라이선스가 남도록 한다.
 */

import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { DIST_DIR, PACKAGE_ROOT } from './token-sources.mjs';

const require = createRequire(import.meta.url);

/** 복사 대상 — latin / wght / normal 단 하나. */
const FONT_FILE = 'inter-latin-wght-normal.woff2';

function main() {
  let fontPackageJson;
  try {
    fontPackageJson = require.resolve('@fontsource-variable/inter/package.json');
  } catch {
    console.error(
      '[sync-fonts] @fontsource-variable/inter 를 찾을 수 없습니다. `pnpm install` 을 먼저 실행하세요.',
    );
    return process.exit(1);
  }

  const fontPackageDir = path.dirname(fontPackageJson);
  const source = path.join(fontPackageDir, 'files', FONT_FILE);
  const license = path.join(fontPackageDir, 'LICENSE');

  let bytes;
  try {
    bytes = statSync(source).size;
  } catch {
    console.error(`[sync-fonts] 폰트 파일이 없습니다: ${source}`);
    return process.exit(1);
  }

  const assetsDir = path.join(DIST_DIR, 'assets');
  mkdirSync(assetsDir, { recursive: true });
  copyFileSync(source, path.join(assetsDir, FONT_FILE));
  copyFileSync(license, path.join(assetsDir, 'Inter-LICENSE.txt'));

  const rel = path.relative(PACKAGE_ROOT, path.join(assetsDir, FONT_FILE));
  console.log(`[sync-fonts] ${FONT_FILE} → ${rel} (${bytes} bytes, latin · wght · normal)`);
  console.log('[sync-fonts] italic / latin-ext / cyrillic / greek / vietnamese 는 복사하지 않음');
}

main();
