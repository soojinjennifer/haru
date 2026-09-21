import { defineConfig } from 'vitest/config';

import { defineHaruTestProject } from '@haru/config/vitest/base';

// apps/web 은 React 앱이다. 기본 환경은 jsdom 이며(Plan §16 D-9),
// Node 전용 테스트(Tailwind 컴파일 검증)는 파일 상단 docblock 으로 환경을 바꾼다.
export default defineConfig({
  // Adapter 선택 지점(`app/providers/apiClients.ts`)이 읽는 값. 테스트는 dev 기본값과 같은
  // `mock` 으로 고정한다 — vite.config.ts 의 define 과 같은 자리다 (Plan §16 D-6).
  define: {
    'import.meta.env.VITE_API_MODE': JSON.stringify('mock'),
  },
  ...defineHaruTestProject({
    name: 'web',
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}', '__tests__/**/*.test.{ts,tsx}'],
  }),
});
