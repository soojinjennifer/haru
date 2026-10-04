import { defineConfig } from 'vitest/config';

const R = '/Users/soojin/dev/haru/node_modules/.pnpm/react@19.3.0/node_modules/react';

export default defineConfig({
  root: '/Users/soojin/dev/haru/apps/web',
  define: { 'import.meta.env.VITE_API_MODE': JSON.stringify('mock') },
  resolve: {
    alias: [
      { find: /^react\/jsx-dev-runtime$/, replacement: `${R}/jsx-dev-runtime.js` },
      { find: /^react\/jsx-runtime$/, replacement: `${R}/jsx-runtime.js` },
      {
        find: /^@testing-library\/react$/,
        replacement:
          '/Users/soojin/dev/haru/node_modules/.pnpm/@testing-library+react@16.3.3_@testing-library+dom@10.4.2_@types+react-dom@19.3.0_@type_7c75ab20cc4ac7e43eae238a37408170/node_modules/@testing-library/react/dist/index.js',
      },
    ],
  },
  test: {
    name: 'qa-probe',
    environment: 'jsdom',
    setupFiles: ['/Users/soojin/dev/haru/apps/web/src/test/setup.ts'],
    include: ['/Users/soojin/dev/haru/docs/qa/evidence/*.probe.test.tsx'],
    globals: false,
  },
});
