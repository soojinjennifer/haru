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
];
