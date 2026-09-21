#!/usr/bin/env node
/**
 * 이월 `S1-B-1` — Tailwind v4 `@theme` / `@utility` 컴파일 검증.
 *
 * `scripts/tailwind-probe.css` 를 실제 Tailwind 파이프라인(@tailwindcss/vite)으로 컴파일하고
 *   ① HARU semantic 유틸리티가 **생성되는지**
 *   ② Tailwind 기본 팔레트(`bg-blue-500` 등)와 `sm:` / `xl:` / `2xl:` variant 가
 *      **생성되지 않는지** (= `@theme` 네임스페이스 초기화가 실제로 동작하는지, AC-1-11)
 * 를 확인한다.
 *
 * 실행: pnpm --filter @haru/web run verify:tailwind
 * 같은 검사를 `__tests__/tailwind-compile.test.ts` 가 `pnpm test` 에서도 수행한다.
 */

import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WEB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBE_CSS = path.join(WEB_ROOT, 'scripts', 'tailwind-probe.css');

/** 생성되어야 하는 유틸리티 클래스. */
export const EXPECTED_UTILITIES = [
  // @theme — color / typography / radius / shadow / blur / ease / animate / spacing
  '.text-fg-primary',
  '.bg-surface-glass',
  '.border-border-subtle',
  '.bg-capability-emotion-bg',
  '.font-sans',
  '.text-body',
  '.text-caption-2',
  '.font-semibold',
  '.rounded-card',
  '.rounded-pill',
  '.shadow-glass-rest',
  '.inset-shadow-highlight',
  '.backdrop-blur-material-md',
  '.ease-standard',
  '.animate-skeleton',
  '.p-4',
  '.gap-2',
  // @utility — z / motion / material / layout / safe-area / gradient / touch / focus / icon
  '.z-base',
  '.z-sticky',
  '.z-tabbar',
  '.z-sheet',
  '.z-dialog',
  '.z-toast',
  '.duration-instant',
  '.duration-fast',
  '.duration-base',
  '.duration-slow',
  '.material-glass-rest',
  '.material-glass-raised',
  '.material-glass-pressed',
  '.material-glass-strong',
  '.app-column',
  '.px-gutter',
  '.max-w-app',
  '.min-w-app',
  '.h-tabbar',
  '.pt-safe',
  '.pb-safe',
  '.pl-safe',
  '.pr-safe',
  '.mb-safe',
  '.bg-app',
  '.min-touch',
  '.focus-ring',
  '.opacity-disabled',
  '.size-icon-sm',
  '.size-icon-md',
  '.size-icon-lg',
];

/** 승인된 breakpoint 2개(md 600 / lg 1024)는 생성되어야 한다. */
export const EXPECTED_BREAKPOINTS = [
  { candidate: '.md\\:p-4', media: '600px' },
  { candidate: '.lg\\:p-4', media: '1024px' },
];

/** 생성되면 안 되는 후보 — Tailwind 기본 팔레트와 제거된 breakpoint. */
export const FORBIDDEN_CANDIDATES = [
  '.bg-blue-500',
  '.text-red-600',
  '.border-gray-200',
  '.bg-slate-50',
  '.sm\\:p-4',
  '.xl\\:p-4',
  '.2xl\\:p-4',
];

/** Tailwind 기본 팔레트 변수가 `@theme` 에 남아 있으면 초기화가 실패한 것이다. */
export const FORBIDDEN_THEME_VARS = ['--color-blue-500', '--color-gray-200', '--breakpoint-sm'];

/** probe CSS 를 실제 빌드 파이프라인으로 컴파일해 결과 CSS 문자열을 돌려준다. */
export async function compileProbeCss() {
  const [{ build }, { default: tailwindcss }] = await Promise.all([
    import('vite'),
    import('@tailwindcss/vite'),
  ]);

  const outDir = mkdtempSync(path.join(tmpdir(), 'haru-tailwind-probe-'));

  try {
    await build({
      configFile: false,
      root: WEB_ROOT,
      logLevel: 'silent',
      plugins: [tailwindcss()],
      build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: { input: PROBE_CSS },
      },
    });

    const files = readdirSync(path.join(outDir, 'assets'));
    const cssFile = files.find((file) => file.endsWith('.css'));
    if (cssFile === undefined) {
      throw new Error(`probe 빌드 산출물에 CSS 가 없습니다: ${files.join(', ')}`);
    }

    return readFileSync(path.join(outDir, 'assets', cssFile), 'utf8');
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

/** @param {string} css @returns {string[]} 위반 목록 (비어 있으면 통과) */
export function findViolations(css) {
  /** @type {string[]} */
  const failures = [];

  for (const utility of EXPECTED_UTILITIES) {
    if (!css.includes(utility)) failures.push(`생성되지 않음: ${utility}`);
  }

  for (const { candidate, media } of EXPECTED_BREAKPOINTS) {
    if (!css.includes(candidate)) failures.push(`생성되지 않음: ${candidate}`);
    if (!css.includes(media)) failures.push(`breakpoint media 조건 누락: ${media}`);
  }

  for (const candidate of FORBIDDEN_CANDIDATES) {
    if (css.includes(candidate)) failures.push(`생성되면 안 되는 유틸리티: ${candidate}`);
  }

  for (const variable of FORBIDDEN_THEME_VARS) {
    if (css.includes(`${variable}:`)) failures.push(`초기화되지 않은 기본 theme 변수: ${variable}`);
  }

  return failures;
}

export async function verifyTailwindCompilation() {
  const css = await compileProbeCss();
  return { css, failures: findViolations(css) };
}

const isCli =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isCli) {
  const { css, failures } = await verifyTailwindCompilation();

  console.log(`[verify-tailwind] probe CSS ${css.length} bytes`);
  console.log(
    `[verify-tailwind] 기대 유틸리티 ${EXPECTED_UTILITIES.length + EXPECTED_BREAKPOINTS.length} 종 · 금지 후보 ${FORBIDDEN_CANDIDATES.length} 종 검사`,
  );

  if (failures.length > 0) {
    console.error('[verify-tailwind] 실패:');
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exit(1);
  }

  console.log('[verify-tailwind] OK — @theme / @utility 가 의도대로 컴파일됩니다 (S1-B-1).');
}
