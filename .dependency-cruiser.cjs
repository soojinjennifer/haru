/**
 * HARU import 경계 규칙 — Stage 1 Plan §16 D-1 (dependency-cruiser 단일 도구)
 * 실행: pnpm lint:boundaries
 *
 * D-1 규칙 6종
 *   ① packages/* → apps/*            금지   (rules/architecture.md §2)
 *   ② packages/ui → @haru/contracts  금지   (packages/ui 는 도메인 지식을 갖지 않는다)
 *   ③ packages/contracts → zod 외    금지   (contracts 의 유일한 런타임 의존은 zod)
 *   ④ features/A → features/B        금지   (형제 feature 직접 import 금지, 조합은 pages 에서)
 *   ⑤ 레이어 역방향                  금지   (app → pages → features → entities → shared)
 *   ⑥ 순환 의존                      금지   (to.circular)
 *
 * Stage 1-A 시점에는 apps/web · packages/ui · packages/contracts 가 아직 없다.
 * 규칙은 지금 전부 정의해 두고, 대상 코드가 추가되는 Stage 1-B 부터 동일 설정으로 검사된다.
 */

/**
 * `packages/contracts` 에서 **런타임 코드가 아닌** 파일.
 * 규칙 ③ (`zod` 외 런타임 의존 금지)·`contracts-no-workspace-deps` 는 배포되는 런타임 코드에만 적용된다.
 * 테스트와 툴체인 설정(`vitest.config.ts` 등)은 `vitest`·`@haru/config` 를 import 하는 것이 정상이며,
 * `package.json` 의 `exports`(`./src/index.ts`)·`files`(`src`) 에도 포함되지 않는다.
 * (Stage 1-C 발견 — Stage 1-A 규칙은 테스트 파일만 제외하고 있어 패키지 자체 설정 파일에서 오탐이 났다.)
 */
const CONTRACTS_NON_RUNTIME =
  '(\\.(test|spec)\\.tsx?$)|(^packages/contracts/[^/]+\\.(config|setup)\\.(ts|js|cjs|mjs)$)';

/**
 * `packages/ui` 에서 **배포되는 런타임 코드가 아닌** 파일 (테스트 · 패키지 자체 툴체인 설정).
 * `ui-only-design-tokens`(workspace 의존 제한)만 여기에서 제외한다. 이 파일들은 `exports`
 * 로 노출되지 않으며 `vitest.config.ts` 가 `@haru/config` 를 쓰는 것은 정상이다
 * (Stage 1-C 에서 contracts 에 적용한 것과 같은 보정 — 규칙의 의도·적용 대상은 그대로다).
 * 도메인 경계 규칙인 `no-ui-to-contracts` 는 **제외하지 않는다** (테스트에서도 금지).
 */
const UI_NON_RUNTIME =
  '(\\.(test|spec)\\.tsx?$)|(^packages/ui/[^/]+\\.(config|setup)\\.(ts|js|cjs|mjs)$)|(^packages/ui/src/test/)';

/** apps/web 레이어 순서 (상위 → 하위). 상위만 하위를 import 할 수 있다. */
const WEB_LAYERS = ['app', 'pages', 'features', 'entities', 'shared'];

/** ⑤ 레이어 역방향 금지 규칙을 레이어 순서표에서 기계적으로 생성한다. */
const layerUpwardRules = WEB_LAYERS.flatMap((layer, index) => {
  const higher = WEB_LAYERS.slice(0, index);
  if (higher.length === 0) return [];
  return [
    {
      name: `no-layer-upward-from-${layer}`,
      comment: `apps/web/src/${layer} 는 상위 레이어(${higher.join(', ')})를 import 할 수 없다 (rules/architecture.md §3).`,
      severity: 'error',
      from: { path: `^apps/web/src/${layer}/` },
      to: { path: `^apps/web/src/(${higher.join('|')})/` },
    },
  ];
});

module.exports = {
  forbidden: [
    // ① packages/* → apps/*
    {
      name: 'no-package-to-app',
      comment: 'packages/* 는 apps/* 를 import 할 수 없다 (rules/architecture.md §2 의존 방향표).',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },

    // ② packages/ui → contracts (도메인 지식 금지)
    {
      name: 'no-ui-to-contracts',
      comment:
        'packages/ui 는 도메인 지식을 갖지 않는다. contracts 를 import 할 수 없다 (rules/architecture.md §2).',
      severity: 'error',
      from: { path: '^packages/ui/' },
      to: { path: '(^packages/contracts/)|(node_modules/@haru/contracts)' },
    },

    // ②-b packages/ui → apps/web 도메인 (design-tokens 만 허용)
    {
      name: 'ui-only-design-tokens',
      comment:
        'packages/ui 는 packages/design-tokens 외의 workspace 패키지를 import 할 수 없다 (rules/architecture.md §2).',
      severity: 'error',
      from: { path: '^packages/ui/', pathNot: UI_NON_RUNTIME },
      to: {
        path: '^packages/(?!ui/|design-tokens/)',
      },
    },

    // ③ packages/contracts → zod 외 런타임 의존 금지
    {
      name: 'contracts-runtime-deps-zod-only',
      comment: 'packages/contracts 의 유일한 런타임 의존은 zod 다 (rules/architecture.md §2, §5).',
      severity: 'error',
      from: { path: '^packages/contracts/', pathNot: CONTRACTS_NON_RUNTIME },
      to: {
        dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled'],
        pathNot: 'node_modules/zod/',
      },
    },
    {
      name: 'contracts-no-workspace-deps',
      comment: 'packages/contracts 는 다른 workspace 패키지를 import 하지 않는다.',
      severity: 'error',
      from: { path: '^packages/contracts/', pathNot: CONTRACTS_NON_RUNTIME },
      to: { path: '^(apps/|packages/(?!contracts/))' },
    },

    // ④ 형제 feature 직접 import 금지 (group matching — $1 역참조)
    {
      name: 'no-sibling-feature-import',
      comment:
        'features/A 는 features/B 를 직접 import 할 수 없다. 조합은 pages 에서 한다 (rules/architecture.md §3).',
      severity: 'error',
      from: { path: '^apps/web/src/features/([^/]+)/' },
      to: {
        path: '^apps/web/src/features/([^/]+)/',
        pathNot: '^apps/web/src/features/$1/',
      },
    },

    // ⑤ 레이어 역방향 금지
    ...layerUpwardRules,

    // ⑥ 순환 의존 금지
    {
      name: 'no-circular',
      comment: '순환 의존 금지 (rules/architecture.md §2).',
      severity: 'error',
      from: {},
      to: { circular: true },
    },

    // 보조: 해결되지 않는 import / orphan 조기 발견
    {
      name: 'not-to-unresolvable',
      comment: '존재하지 않는 모듈을 import 하고 있다.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-deprecated-core',
      comment: 'deprecated Node core 모듈 사용 금지.',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['core'], path: '^(punycode|domain|sys)$' },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: '(^|/)(dist|build|coverage|playwright-report|test-results)(/|$)',
    },
    tsPreCompilationDeps: true,
    combinedDependencies: false,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'],
      mainFields: ['module', 'main', 'types'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
