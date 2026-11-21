// HARU shared ESLint flat config — base (Stage 1 Plan §9.1)
//
// Stage 1 에 반드시 포함되는 규칙 (Plan §9.1):
//   1. 임의 HEX / rgb() / rgba() 리터럴 금지          (rules/frontend.md §6)
//   2. Tailwind arbitrary value 금지 (bg-[#…], p-[13px], rounded-[28px])
//   3. @typescript-eslint/no-explicit-any
//   4. @typescript-eslint/ban-ts-comment
// 예외: packages/design-tokens 내부 · 일러스트/에셋 파일 (rules/frontend.md §6)

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * 토큰 강제 규칙의 예외 경로.
 * rules/frontend.md §6 — "예외: packages/design-tokens 내부 정의, 일러스트/캐릭터 에셋".
 *
 * `packages/ui/src/icon/brand/**` 는 **공식 브랜드 에셋**이다 (결정 `D-15`,
 * `docs/decisions/stage-2-approvals.md` §4). Google · Apple 브랜드 가이드라인이
 * 색값·비율을 고정하므로 semantic token 으로 치환하면 **가이드라인 위반**이 된다.
 * 에셋 파일에는 수정 금지 주석이 있고, 값 자체는
 * `packages/ui/src/icon/brand/__tests__/brand-marks.test.tsx` 가 고정한다.
 */
export const DESIGN_TOKEN_EXCEPTION_PATHS = [
  'packages/design-tokens/**',
  '**/assets/**',
  '**/*.assets.ts',
  'packages/ui/src/icon/brand/**',
];

const HEX_LITERAL =
  '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_])';
const RGB_FUNCTION = '\\b(?:rgb|rgba|hsl|hsla)\\s*\\(';
const TW_ARBITRARY_VALUE = '[a-zA-Z0-9]-\\[[^\\]]+\\]';
const TW_ARBITRARY_VARIANT = '(?:^|\\s)\\[[^\\]]+\\]:';

const HEX_MESSAGE =
  '임의 HEX 색상 금지. packages/design-tokens 의 semantic token(CSS variable / Tailwind token)만 사용한다. (rules/frontend.md §6)';
const RGB_MESSAGE =
  '임의 rgb()/rgba()/hsl() 색상 금지. packages/design-tokens 의 semantic token만 사용한다. (rules/frontend.md §6)';
const TW_MESSAGE =
  'Tailwind arbitrary value 금지 (예: bg-[#85bfb6], p-[13px], rounded-[28px]). 필요한 값이 없으면 design-agent 에 신규 토큰을 요청한다. (rules/frontend.md §6)';

/**
 * Design Token 강제용 no-restricted-syntax selector 목록.
 * 문자열 리터럴 · 템플릿 리터럴 양쪽을 검사한다.
 */
export const DESIGN_TOKEN_RESTRICTED_SYNTAX = [
  { selector: `Literal[value=/${HEX_LITERAL}/]`, message: HEX_MESSAGE },
  { selector: `TemplateElement[value.raw=/${HEX_LITERAL}/]`, message: HEX_MESSAGE },
  { selector: `Literal[value=/${RGB_FUNCTION}/]`, message: RGB_MESSAGE },
  { selector: `TemplateElement[value.raw=/${RGB_FUNCTION}/]`, message: RGB_MESSAGE },
  { selector: `Literal[value=/${TW_ARBITRARY_VALUE}/]`, message: TW_MESSAGE },
  { selector: `TemplateElement[value.raw=/${TW_ARBITRARY_VALUE}/]`, message: TW_MESSAGE },
  { selector: `Literal[value=/${TW_ARBITRARY_VARIANT}/]`, message: TW_MESSAGE },
  { selector: `TemplateElement[value.raw=/${TW_ARBITRARY_VARIANT}/]`, message: TW_MESSAGE },
];

/** 저장소 전역 ignore 목록 (빌드 산출물 · 의존성 · 리포트). */
export const HARU_IGNORES = [
  '**/node_modules/**',
  '**/dist/**',
  '**/dist-preview/**',
  '**/build/**',
  '**/coverage/**',
  '**/.pnpm-store/**',
  '**/playwright-report/**',
  '**/test-results/**',
  '**/blob-report/**',
  '**/*.tsbuildinfo',
];

export const haruBaseConfig = tseslint.config(
  { ignores: HARU_IGNORES },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    name: 'haru/language-options',
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.es2023 },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  {
    name: 'haru/type-safety',
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // `console.*` 는 **전부** 차단한다 (`warn`/`error` 도 예외가 아니다 — QA-1-001).
      // PII(아이 이름 · transcript · 오디오 경로)가 가장 쉽게 새는 경로이므로,
      // 허용은 아래 `haru/tooling-files` 와 루트 eslint.config.js 의 **경로 단위 명시 예외**로만 둔다.
      // (rules/architecture.md §9 · AC-1-45)
      'no-console': 'error',
      'no-debugger': 'error',
    },
  },

  {
    name: 'haru/design-tokens',
    rules: {
      'no-restricted-syntax': ['error', ...DESIGN_TOKEN_RESTRICTED_SYNTAX],
    },
  },

  // 툴체인/설정 파일: Node 전역 허용, console 허용.
  {
    name: 'haru/tooling-files',
    files: [
      '**/*.config.{js,cjs,mjs,ts}',
      '**/*.workspace.{js,cjs,mjs,ts}',
      'eslint.config.js',
      '.dependency-cruiser.cjs',
      // 루트 `scripts/` 와 각 패키지의 `packages/*/scripts/` 빌드 스크립트 (Stage 1-B 에서 범위 확장).
      '**/scripts/**/*.{js,cjs,mjs}',
      'packages/config/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },

  {
    name: 'haru/commonjs-files',
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.commonjs },
    },
  },

  // 규칙 정의 자체(예시 문자열 포함)와 그 규칙을 검증하는 테스트는 검사 대상에서 제외한다.
  {
    name: 'haru/rule-definition-exception',
    files: ['packages/config/eslint/**/*.js', 'packages/config/__tests__/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },

  // rules/frontend.md §6 예외: design-tokens 정의부와 일러스트/에셋 파일.
  {
    name: 'haru/design-tokens-exception',
    files: DESIGN_TOKEN_EXCEPTION_PATHS,
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
);

export default haruBaseConfig;
