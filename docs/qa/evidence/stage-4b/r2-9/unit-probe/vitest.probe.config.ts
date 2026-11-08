/** R2-9 unit probe — apps/web 와 같은 환경(jsdom · setup · define), include 만 이 폴더 probe. 모듈은 apps/web node_modules 로 해석. */
import { defineConfig } from 'vitest/config';

const W = '/Users/soojin/dev/haru/apps/web';
export default defineConfig({
  root: W,
  define: { 'import.meta.env.VITE_API_MODE': JSON.stringify('mock') },
  resolve: {
    alias: [
      { find: /^@testing-library\/react$/, replacement: `${W}/node_modules/@testing-library/react` },
      { find: /^react$/, replacement: `${W}/node_modules/react` },
      { find: /^react\/(.*)$/, replacement: `${W}/node_modules/react/$1` },
    ],
  },
  test: {
    name: 'web-probe',
    environment: 'jsdom',
    globals: false,
    setupFiles: [`${W}/src/test/setup.ts`],
    include: ['/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/r2-9/unit-probe/*.probe.test.tsx'],
    testTimeout: 60_000,
  },
});
