import { createRequire } from 'node:module';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const require = createRequire(import.meta.url);

/**
 * design-tokens 가 self-host 하는 Inter woff2 의 실제 경로.
 * `@haru/design-tokens/assets/*` 는 `dist/assets/*` 로 export 된다 — `dist` 는
 * `prebuild` / `predev` 에서 `@haru/design-tokens` 의 build 로 생성된다 (1-B 이월).
 */
const INTER_WOFF2 = require.resolve('@haru/design-tokens/assets/inter-latin-wght-normal.woff2');

/** 폰트만 해시 없는 고정 경로로 내보낸다 — preload href 와 CSS `url()` 을 일치시키기 위함. */
const FONT_OUT_DIR = 'assets/fonts';

/**
 * Inter woff2 preload 주입 (이월 `S1-B-2`).
 *
 * preload 의 href 는 `@font-face` 가 실제로 요청하는 URL 과 **같아야** 한다.
 * dev 는 Vite 가 root 바깥 파일을 `/@fs/<절대경로>` 로 서빙하고,
 * build 는 아래 `assetFileNames` 규칙으로 `<base>assets/fonts/<이름>.woff2` 가 된다.
 */
function interPreload(): Plugin {
  let base = '/';
  let serve = false;

  return {
    name: 'haru:inter-preload',
    configResolved(config) {
      base = config.base;
      serve = config.command === 'serve';
    },
    transformIndexHtml() {
      const href = serve
        ? path.posix.join('/@fs', INTER_WOFF2)
        : `${base}${FONT_OUT_DIR}/${path.basename(INTER_WOFF2)}`;

      return [
        {
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

/**
 * Stage 8 `S8-I` — Mock 데모 웹 프리뷰 빌드 (`pnpm build:preview` = `vite build --mode preview`).
 *
 * - API 모드 = `mock` 강제 (`resolveApiMode`)
 * - **sourcemap 끔** — 프리뷰에서만 (`S1-G-7` 방침). 로컬 · CI 빌드는 그대로 켠다
 * - 산출물 = `dist-preview/` — http 빌드(`dist/`, `assert:no-mocks` 대상)와 섞이지 않게 분리한다
 * - `import.meta.env.DEV` 는 빌드이므로 `false` → dev gallery · Scenario Panel 은 빠진다
 *   (`assert:preview` 가 산출물에서 표식 0 을 검사한다)
 */
const PREVIEW_MODE = 'preview';
const PREVIEW_OUT_DIR = 'dist-preview';

/**
 * API Adapter 모드 해석 (Stage 1-F · Plan §16 D-6).
 *
 * `import.meta.env.VITE_API_MODE` 를 **명시적으로 define** 해서 빌드 산출물에 문자열
 * 리터럴이 박히도록 보장한다. 환경 변수가 설정되지 않으면 Vite 는 `import.meta.env` 를
 * 런타임 객체 조회로 남기고, 그러면 `app/providers/apiClients.ts` 의
 * `await import('../../mocks')` 가 도달 가능한 코드로 남아 Mock 이 산출물에 섞인다.
 *
 * 기본값
 * - `vite dev` (serve) → `mock`  : Backend 없이 개발한다 (Frontend-only Scope).
 * - `vite build`       → `http`  : 명시하지 않은 빌드에 가상 데이터가 남지 않게 한다.
 *   Mock 데모 프리뷰(Stage 8 C-18)는 `pnpm build:preview` (`--mode preview`, 아래)로 만든다.
 */
function resolveApiMode(command: 'serve' | 'build', mode: string): 'mock' | 'http' {
  const fromEnv = loadEnv(mode, import.meta.dirname, 'VITE_')['VITE_API_MODE'];

  // Stage 8 `S8-I` — Mock 데모 웹 프리뷰(C-18)는 **Mock 강제**다. 실수로 `http` 를 주면
  // 빌드를 멈춘다 (프리뷰 호스트에는 Backend 가 없다 — 빈 base URL 로 요청이 나가면 안 된다).
  if (mode === PREVIEW_MODE) {
    if (fromEnv !== undefined && fromEnv !== '' && fromEnv !== 'mock') {
      throw new Error(
        `[vite] --mode ${PREVIEW_MODE} 는 VITE_API_MODE=mock 전용입니다 (받은 값: ${fromEnv}).`,
      );
    }
    return 'mock';
  }

  if (fromEnv === 'mock' || fromEnv === 'http') return fromEnv;

  return command === 'serve' ? 'mock' : 'http';
}

// Stage 1-E — apps/web 앱 셸 (Plan §9.5) / Stage 1-F — API Client · Mock Layer.
// dev UI gallery 는 Stage 1-G 에서 추가한다.
export default defineConfig(({ command, mode }) => {
  // `command` 를 보지 않는다 — `vite preview --mode preview` 도 같은 `dist-preview/` 를 서빙해야 한다
  // (command = serve 로 판정하면 http 빌드 `dist/` 를 서빙한다 — 2026-11-21 실측).
  const preview = mode === PREVIEW_MODE;

  return {
    plugins: [react(), tailwindcss(), interPreload()],
    define: {
      'import.meta.env.VITE_API_MODE': JSON.stringify(resolveApiMode(command, mode)),
    },
    server: {
      // 워크스페이스 링크(`packages/*`)를 dev 에서 그대로 읽는다.
      fs: { allow: [path.resolve(import.meta.dirname, '../..')] },
    },
    build: {
      outDir: preview ? PREVIEW_OUT_DIR : 'dist',
      sourcemap: !preview,
      // Mock 표지(`shared/assets/book-covers`, 단색 0.6 KB)는 기본 4 KB 한도 아래라 data: URI 로 인라인된다.
      // 실제 표지는 서버 URL(`BookSummary.coverUrl`)이므로 Mock 도 **파일 URL** 로 내보내 dev 와 같은 경로를 탄다.
      assetsInlineLimit: (file: string) =>
        file.includes('/shared/assets/book-covers/') ? false : undefined,
      rollupOptions: {
        output: {
          assetFileNames: (asset) => {
            const name = asset.names?.[0] ?? '';
            return name.endsWith('.woff2')
              ? `${FONT_OUT_DIR}/[name][extname]`
              : 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
});
