import { defineConfig } from 'vitest/config';

import { defineHaruTestProject } from '@haru/config/vitest/base';

// contracts 는 순수 TypeScript + zod 다. React·DOM 이 필요 없으므로 node 환경에서 실행한다
// (Stage 1 Plan §12 "contracts 단위 — Vitest (Node 환경, React 불필요)").
export default defineConfig({
  ...defineHaruTestProject({
    name: 'contracts',
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  }),
});
