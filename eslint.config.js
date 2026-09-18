import haruBaseConfig from '@haru/config/eslint/base';

// Stage 1-A: React 패키지(apps/web, packages/ui)가 아직 없으므로
// @haru/config/eslint/react 는 Stage 1-B 에서 해당 파일 glob 과 함께 확장한다.
export default [
  {
    ignores: ['docs/**', 'My Prompt/**', '.omc/**', '.claude/**'],
  },
  ...haruBaseConfig,
];
