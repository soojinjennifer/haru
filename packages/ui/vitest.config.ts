import { defineConfig } from 'vitest/config';

import { defineHaruTestProject } from '@haru/config/vitest/base';

// packages/ui 는 React 컴포넌트다. DOM 환경(jsdom — Plan §16 D-9)에서 실행하고,
// Testing Library 의 cleanup 을 setup 파일에서 명시적으로 등록한다
// (`globals: false` 라 RTL 의 자동 cleanup 이 동작하지 않는다).
export default defineConfig({
  ...defineHaruTestProject({
    name: 'ui',
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.tsx'],
  }),
});
