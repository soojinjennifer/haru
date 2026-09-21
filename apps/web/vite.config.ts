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
 *   Mock 데모 프리뷰(Stage 8 C-18)는 `VITE_API_MODE=mock pnpm build` 로 만든다.
 */
function resolveApiMode(command: 'serve' | 'build', mode: string): 'mock' | 'http' {
  const fromEnv = loadEnv(mode, import.meta.dirname, 'VITE_')['VITE_API_MODE'];

  if (fromEnv === 'mock' || fromEnv === 'http') return fromEnv;

  return command === 'serve' ? 'mock' : 'http';
}

// Stage 1-E — apps/web 앱 셸 (Plan §9.5) / Stage 1-F — API Client · Mock Layer.
// dev UI gallery 는 Stage 1-G 에서 추가한다.
export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss(), interPreload()],
  define: {
    'import.meta.env.VITE_API_MODE': JSON.stringify(resolveApiMode(command, mode)),
  },
  server: {
    // 워크스페이스 링크(`packages/*`)를 dev 에서 그대로 읽는다.
    fs: { allow: [path.resolve(import.meta.dirname, '../..')] },
  },
  build: {
    sourcemap: true,
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
}));
