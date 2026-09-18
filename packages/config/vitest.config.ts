import { defineConfig } from 'vitest/config';

import { defineHaruTestProject } from './vitest/base.ts';

// packages/config 자체 검증 테스트 — 공통 설정이 실제로 로드·적용되는지 확인한다.
export default defineConfig({
  ...defineHaruTestProject({
    name: 'config',
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  }),
});
