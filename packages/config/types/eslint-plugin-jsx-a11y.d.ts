// eslint-plugin-jsx-a11y@6.10.2 는 타입 선언을 포함하지 않는다.
// 승인된 신규 의존은 플러그인 본체 하나뿐이므로(@types/* 추가 없음) 이 패키지에서 쓰는
// 표면만 로컬 ambient 선언으로 좁게 정의한다. (Stage 1-A 후속 F-3)
declare module 'eslint-plugin-jsx-a11y' {
  import type { Linter } from 'eslint';

  interface JsxA11yFlatConfig {
    name?: string;
    languageOptions?: Linter.Config['languageOptions'];
    plugins?: Record<string, unknown>;
    rules: Linter.RulesRecord;
  }

  const jsxA11y: {
    meta: { name: string; version: string };
    rules: Record<string, unknown>;
    configs: Record<string, { plugins: string[]; rules: Linter.RulesRecord }>;
    flatConfigs: {
      recommended: JsxA11yFlatConfig;
      strict: JsxA11yFlatConfig;
    };
  };

  export default jsxA11y;
}
