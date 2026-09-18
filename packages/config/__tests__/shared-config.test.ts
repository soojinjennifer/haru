import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import baseEslintConfig, { DESIGN_TOKEN_RESTRICTED_SYNTAX } from '../eslint/base.js';
import reactEslintConfig, { JSX_A11Y_RECOMMENDED_RULES } from '../eslint/react.js';
import prettierConfig from '../prettier/index.js';
import { COVERAGE_THRESHOLDS, defineHaruTestProject } from '../vitest/base';

function readJson(relativePath: string): Record<string, unknown> {
  const url = new URL(relativePath, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as Record<string, unknown>;
}

describe('@haru/config — tsconfig', () => {
  const base = readJson('../tsconfig/base.json');
  const compilerOptions = base['compilerOptions'] as Record<string, unknown>;

  it.each(['strict', 'noUncheckedIndexedAccess', 'exactOptionalPropertyTypes'])(
    'enables %s (Plan §9.1)',
    (flag) => {
      expect(compilerOptions[flag]).toBe(true);
    },
  );

  it('exposes react and node variants extending the base', () => {
    expect(readJson('../tsconfig/react.json')['extends']).toBe('./base.json');
    expect(readJson('../tsconfig/node.json')['extends']).toBe('./base.json');
    expect(
      (readJson('../tsconfig/react.json')['compilerOptions'] as Record<string, unknown>)['jsx'],
    ).toBe('react-jsx');
  });
});

describe('@haru/config — eslint base', () => {
  const rulesOf = (name: string): Record<string, unknown> => {
    const entry = baseEslintConfig.find((item) => item.name === name);
    expect(entry, `flat config block "${name}" must exist`).toBeDefined();
    return (entry?.rules ?? {}) as Record<string, unknown>;
  };

  it('enforces the four Stage 1 mandatory rules', () => {
    const typeSafety = rulesOf('haru/type-safety');
    expect(typeSafety['@typescript-eslint/no-explicit-any']).toBe('error');
    expect(Array.isArray(typeSafety['@typescript-eslint/ban-ts-comment'])).toBe(true);

    const designTokens = rulesOf('haru/design-tokens');
    expect(Array.isArray(designTokens['no-restricted-syntax'])).toBe(true);
  });

  it('restricts raw HEX, rgb()/hsl() and Tailwind arbitrary values', () => {
    const selectors = DESIGN_TOKEN_RESTRICTED_SYNTAX.map((item) => item.selector).join('\n');
    expect(selectors).toContain('0-9a-fA-F');
    expect(selectors).toContain('rgb');
    expect(selectors).toMatch(/\\\[/);
    // 문자열 리터럴 · 템플릿 리터럴 양쪽을 검사한다.
    expect(selectors).toContain('Literal[value=');
    expect(selectors).toContain('TemplateElement[value.raw=');
  });

  it('turns the token rules off inside packages/design-tokens (rules/frontend.md §6)', () => {
    const exception = baseEslintConfig.find((item) => item.name === 'haru/design-tokens-exception');
    expect(exception?.files).toContain('packages/design-tokens/**');
    expect(exception?.rules?.['no-restricted-syntax']).toBe('off');
  });
});

describe('@haru/config — prettier', () => {
  it('pins the shared formatting contract', () => {
    expect(prettierConfig.singleQuote).toBe(true);
    expect(prettierConfig.printWidth).toBe(100);
    expect(prettierConfig.endOfLine).toBe('lf');
  });
});

describe('@haru/config — vitest base', () => {
  it('defaults to the node environment and never hides missing tests', () => {
    const project = defineHaruTestProject({ name: 'sample' });
    expect(project.test?.environment).toBe('node');
    expect(project.test?.passWithNoTests).toBe(false);
  });

  it('uses jsdom for component tests (Plan D-9)', () => {
    const project = defineHaruTestProject({ name: 'sample-dom', environment: 'jsdom' });
    expect(project.test?.environment).toBe('jsdom');
  });

  it('carries the shared coverage thresholds', () => {
    const project = defineHaruTestProject({ name: 'sample' });
    expect(project.test?.coverage).toMatchObject({ thresholds: COVERAGE_THRESHOLDS });
  });
});

describe('@haru/config — eslint react (Stage 1-A 후속 F-3)', () => {
  it('wires the jsx-a11y recommended rule set', () => {
    const a11y = reactEslintConfig.find((item) => item.name === 'haru/react-a11y');
    expect(a11y, 'flat config block "haru/react-a11y" must exist').toBeDefined();
    expect(Object.keys(a11y?.plugins ?? {})).toContain('jsx-a11y');
    expect(JSX_A11Y_RECOMMENDED_RULES['jsx-a11y/alt-text']).toBeDefined();
    expect(JSX_A11Y_RECOMMENDED_RULES['jsx-a11y/click-events-have-key-events']).toBeDefined();
    expect(Object.keys(JSX_A11Y_RECOMMENDED_RULES).length).toBeGreaterThan(20);
  });

  it('only contains flat-format blocks (ESLint 10 rejects eslintrc "plugins" arrays)', () => {
    for (const block of reactEslintConfig) {
      expect(
        Array.isArray(block.plugins),
        `block "${block.name}" must not use a plugins array`,
      ).toBe(false);
    }
  });
});
