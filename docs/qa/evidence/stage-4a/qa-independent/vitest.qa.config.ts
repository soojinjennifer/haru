import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const repo = fileURLToPath(new URL('../../../../../', import.meta.url));

export default defineConfig({
  root: repo,
  define: { 'import.meta.env.VITE_API_MODE': JSON.stringify('mock') },
  resolve: { alias: { '@haru/contracts': `${repo}packages/contracts/src/index.ts` } },
  test: {
    environment: 'jsdom',
    include: ['docs/qa/evidence/stage-4a/qa-independent/*.test.ts'],
  },
});
