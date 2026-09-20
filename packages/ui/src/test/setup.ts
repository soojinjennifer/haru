import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `globals: false` (packages/config vitest base) 라 Testing Library 의 자동 cleanup 이
// 동작하지 않는다. 테스트 간 DOM 누수를 막기 위해 여기에서 명시적으로 등록한다.
afterEach(() => {
  cleanup();
});
