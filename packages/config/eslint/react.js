// HARU shared ESLint flat config — React 레이어 (Stage 1 Plan §9.1)
//
// base.js 위에 얹어 쓴다. React 자체는 이 패키지의 의존이 아니며,
// eslint-plugin-react-hooks · eslint-plugin-jsx-a11y 만 사용한다 (peer: eslint).
//
// jsx-a11y (Stage 1-A 후속 F-3, 사용자 승인 2026-09-19):
//   접근성 AC(Plan §11.4 / rules/frontend.md §9, WCAG AA)를 lint 단계에서 강제한다.
//   버전 `^6.10.2` (§16.1 D-10 표에 없던 신규 의존 — Handoff §5.1 에 기록).
//   주의: 6.10.2 의 peerDependencies 는 `eslint ^3..^9` 라서 eslint 10 에서 peer 경고가 난다.
//   실제 동작은 negative test 로 확인했다 (Handoff §7 참조).
//
// 이 모듈의 루트 `eslint.config.js` 연결은 Stage 1-B 에서 대상 패키지
// (apps/web, packages/ui)가 생길 때 수행한다 — Stage 1-A 유예 유지.

import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/** apps/web · packages/ui 가 대상으로 삼는 파일 glob. */
export const REACT_FILES = ['**/*.{ts,tsx,js,jsx}'];

/** jsx-a11y 권장 규칙 세트 (flat config). 34개 규칙. */
export const JSX_A11Y_RECOMMENDED_RULES = {
  ...jsxA11y.flatConfigs.recommended.rules,
};

export const haruReactConfig = [
  {
    name: 'haru/react-language-options',
    files: REACT_FILES,
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  // eslint-plugin-react-hooks@7.1.1 은 configs.recommended / configs['recommended-latest'] 가
  // 여전히 eslintrc 형식(plugins: string[])이고, flat config 는 configs.flat.* 아래에 있다.
  // ESLint 10 은 eslintrc 형식 config 객체를 받으면 즉시 예외로 종료하므로 flat 을 먼저 고른다.
  {
    name: 'haru/react-hooks-recommended',
    files: REACT_FILES,
    ...(reactHooks.configs.flat?.['recommended-latest'] ??
      reactHooks.configs.flat?.recommended ??
      reactHooks.configs.recommended),
  },
  {
    name: 'haru/react-a11y',
    files: REACT_FILES,
    plugins: { 'jsx-a11y': jsxA11y },
    rules: JSX_A11Y_RECOMMENDED_RULES,
  },
  {
    name: 'haru/react-rules',
    files: REACT_FILES,
    rules: {
      // Page 는 Composition only (rules/frontend.md §3) — 위반을 눈에 띄게 하기 위한 최소 규칙.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
];

export default haruReactConfig;
