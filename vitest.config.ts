import { defineConfig } from 'vitest/config';

// Stage 1-A: workspace project 목록.
// Stage 1-B 에서 packages/contracts · packages/ui · apps/web 가 추가되면
// 각 패키지의 vitest.config.ts 가 자동으로 포함된다.
export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/*'],
  },
});
