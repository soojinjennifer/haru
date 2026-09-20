import { defineConfig } from 'vitest/config';

import { defineHaruTestProject } from '@haru/config/vitest/base';

// 토큰 패키지는 CSS 전용이다. 테스트는 CSS 소스와 빌드 산출물을 Node 에서 정적 검증한다.
export default defineConfig({
  ...defineHaruTestProject({
    name: 'design-tokens',
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  }),
});
