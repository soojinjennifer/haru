// HARU shared Vitest config (Stage 1 Plan §9.1 — "공통 vitest 설정 (환경·coverage 임계)")
//
// 사용법 (각 패키지 vitest.config.ts):
//   import { defineHaruTestProject } from '@haru/config/vitest/base';
//   export default defineHaruTestProject({ name: 'contracts', environment: 'node' });
//
// DOM 환경은 jsdom 이다 (Plan §16 D-9 / D-10).

import type { ViteUserConfig } from 'vitest/config';

/** Component/DOM 테스트 환경 — D-9 승인값. */
export const HARU_DOM_ENVIRONMENT = 'jsdom' as const;

/** coverage 임계값. Stage 1-B 에서 실제 소스가 들어온 뒤 CI 게이트로 사용한다. */
export const COVERAGE_THRESHOLDS = {
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
} as const;

/** 모든 패키지에 공통 적용되는 coverage 제외 경로. */
export const COVERAGE_EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/dist-preview/**',
  '**/coverage/**',
  '**/*.config.{ts,js,cjs,mjs}',
  '**/*.d.ts',
  '**/__tests__/**',
  '**/*.test.{ts,tsx}',
  // Mock fixture 는 가상 데이터 정의이므로 coverage 대상이 아니다 (rules/frontend.md §5).
  '**/mocks/fixtures/**',
];

export type HaruTestEnvironment = 'node' | typeof HARU_DOM_ENVIRONMENT;

export interface HaruTestProjectOptions {
  /** vitest project 이름 (실행 로그에 표시된다). */
  name: string;
  /** 기본 'node'. Component 테스트는 'jsdom'. */
  environment?: HaruTestEnvironment;
  /** 추가 setup 파일 경로. */
  setupFiles?: string[];
  /** 기본 include 를 대체할 glob. */
  include?: string[];
}

export const DEFAULT_TEST_INCLUDE = [
  'src/**/*.{test,spec}.{ts,tsx}',
  '**/__tests__/**/*.{test,spec}.{ts,tsx}',
];

/**
 * 공통 규약이 적용된 vitest project 설정을 만든다.
 * - 전역 API 미사용 (`globals: false`) — import 를 명시해 레이어 추적이 가능하도록.
 * - 테스트 파일이 없으면 실패한다 (`passWithNoTests` 를 켜지 않는다).
 */
export function defineHaruTestProject(options: HaruTestProjectOptions): ViteUserConfig {
  const { name, environment = 'node', setupFiles = [], include = DEFAULT_TEST_INCLUDE } = options;

  return {
    test: {
      name,
      environment,
      include,
      setupFiles,
      globals: false,
      clearMocks: true,
      restoreMocks: true,
      passWithNoTests: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        exclude: [...COVERAGE_EXCLUDE],
        thresholds: { ...COVERAGE_THRESHOLDS },
      },
    },
  };
}

export default defineHaruTestProject;
