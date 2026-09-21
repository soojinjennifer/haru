import haruBaseConfig from '@haru/config/eslint/base';
import haruReactConfig from '@haru/config/eslint/react';

/**
 * React 레이어 규칙(react-hooks · jsx-a11y)의 적용 대상.
 * Stage 1-A/1-B 에서 "packages/ui 생성 시 연결"로 유예했던 항목을 Stage 1-D1 에서 연결한다.
 * `apps/web` 은 Stage 1-E 에서 생성되며 같은 glob 으로 자동 포함된다.
 */
const REACT_PACKAGE_FILES = ['packages/ui/**/*.{ts,tsx}', 'apps/web/**/*.{ts,tsx}'];

export default [
  {
    ignores: ['docs/**', 'My Prompt/**', '.omc/**', '.claude/**'],
  },
  ...haruBaseConfig,
  // react.js 의 기본 glob 은 저장소 전체이므로 React 패키지로 좁혀서 적용한다.
  ...haruReactConfig.map((config) => ({ ...config, files: REACT_PACKAGE_FILES })),
  {
    // 제품 코드에서 `console` 에 직접 접근할 수 있는 **유일한 두 파일** (QA-1-001).
    // `no-console` 은 `warn`/`error` 를 포함해 전부 차단되며(@haru/config `haru/type-safety`),
    // 예외는 이 경로 목록으로만 열린다. 두 파일 모두 출력 전에 값을 살균한다.
    //   - apps/web  … PII 금지 logger (Plan §5.6 · 화이트리스트 context 키)
    //   - packages/ui … 개발자 경고 (경계 규칙상 앱 logger 를 import 할 수 없다 —
    //                    rules/architecture.md §2. 고정 문구 + 토큰 살균으로 PII 차단)
    name: 'haru/console-allowlist',
    files: ['apps/web/src/shared/lib/logger.ts', 'packages/ui/src/lib/devWarn.ts'],
    rules: { 'no-console': 'off' },
  },
];
