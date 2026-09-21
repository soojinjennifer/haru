// @vitest-environment node
/**
 * `console` 직접 호출 금지 불변 규칙을 자동 검증한다 (QA-1-001 · AC-1-45).
 *
 * 두 방향으로 고정한다.
 *   ① **실제 eslint 실행** — 저장소 루트 설정을 그대로 로드해, 제품 코드 경로에서
 *      `console.log` 뿐 아니라 `console.warn` / `console.error` 도 차단되는지 확인한다.
 *      (QA 재현 C-11 과 같은 입력. `console.error("child", childName)` 형태)
 *   ② **저장소 스캔** — `console` 에 직접 접근하는 제품 소스가 허용 목록과 **정확히**
 *      일치하는지 확인한다. 허용 목록이 늘어나거나 새 우회가 생기면 실패한다.
 *
 * 소스 파일과 eslint 를 직접 다루므로 Node 환경에서 돌린다.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import baseEslintConfig from '../eslint/base.js';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

/**
 * 제품 코드에서 `console` 에 직접 접근할 수 있는 유일한 파일들
 * (루트 `eslint.config.js` 의 `haru/console-allowlist` 와 같은 목록이어야 한다).
 */
const CONSOLE_ALLOWLIST = [
  'apps/web/src/shared/lib/logger.ts',
  'packages/ui/src/lib/devWarn.ts',
] as const;

/** QA 재현(C-11)과 같은 입력 — PII 가 섞일 수 있는 console 직접 호출 5종. */
const LEAK_SOURCE = [
  'export function leak(childName: string): void {',
  '  console.error("child", childName);',
  '  console.warn("transcript", childName);',
  '  console.log("blocked", childName);',
  '  console.info("audio", childName);',
  '  console.debug("token", childName);',
  '}',
  '',
].join('\n');

const eslint = new ESLint({ cwd: REPO_ROOT });

async function noConsoleMessages(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: join(REPO_ROOT, filePath) });

  return (result?.messages ?? [])
    .filter((message) => message.ruleId === 'no-console')
    .map((message) => `${message.line}:${message.column}`);
}

describe('no-console 규칙 설정 (QA-1-001)', () => {
  it('`warn` / `error` 예외 없이 error 로 설정되어 있다', () => {
    const typeSafety = baseEslintConfig.find((entry) => entry.name === 'haru/type-safety');

    // 옵션 객체(`{ allow: [...] }`)가 붙어 있으면 그 자체가 우회 경로다.
    expect(typeSafety?.rules?.['no-console']).toBe('error');
  });
});

describe('eslint 실제 실행 — console 직접 호출 차단 (QA-1-001 재현)', () => {
  it('apps/web 제품 코드에서 log · info · debug · warn · error 5종이 모두 걸린다', async () => {
    const messages = await noConsoleMessages(LEAK_SOURCE, 'apps/web/src/features/probe.ts');

    expect(messages).toHaveLength(5);
  });

  it('packages/ui 제품 코드에서도 5종이 모두 걸린다', async () => {
    const messages = await noConsoleMessages(LEAK_SOURCE, 'packages/ui/src/probe.ts');

    expect(messages).toHaveLength(5);
  });

  it.each(CONSOLE_ALLOWLIST)('허용 경로 %s 에서는 걸리지 않는다', async (filePath) => {
    expect(await noConsoleMessages(LEAK_SOURCE, filePath)).toStrictEqual([]);
  });

  it('허용은 파일 단위다 — 같은 디렉토리의 다른 파일은 걸린다', async () => {
    const sibling = await noConsoleMessages(LEAK_SOURCE, 'apps/web/src/shared/lib/other.ts');
    const uiSibling = await noConsoleMessages(LEAK_SOURCE, 'packages/ui/src/lib/other.ts');

    expect(sibling).toHaveLength(5);
    expect(uiSibling).toHaveLength(5);
  });
});

/** 검사 대상 = 각 workspace 패키지의 `src` 디렉토리 아래 제품 소스. */
function productSourceRoots(): string[] {
  return ['apps', 'packages']
    .flatMap((group) => {
      const groupDir = join(REPO_ROOT, group);
      if (!existsSync(groupDir)) return [];
      return readdirSync(groupDir).map((pkg) => join(groupDir, pkg, 'src'));
    })
    .filter((dir) => existsSync(dir));
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry: string) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** 테스트 · 타입 선언 · 빌드 스크립트는 제품 코드가 아니다 (툴체인은 no-console 예외). */
function isProductSource(file: string): boolean {
  const rel = relative(REPO_ROOT, file);
  if (!/\.tsx?$/.test(rel) || /\.d\.ts$/.test(rel)) return false;
  if (/\.(test|spec)\.tsx?$/.test(rel)) return false;
  return !rel.split(sep).some((segment) => segment === '__tests__' || segment === 'scripts');
}

/** 주석을 제거해, 규칙을 **설명하는** 주석이 위반으로 잡히지 않게 한다. */
function codeOf(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('저장소 스캔 — console 직접 접근 지점 (logger.ts 머리주석 불변 규칙)', () => {
  const sources = productSourceRoots().flatMap(walk).filter(isProductSource);

  it('검사 대상 소스가 존재한다 (스캔이 헛돌지 않도록)', () => {
    expect(sources.length).toBeGreaterThan(0);
  });

  it('`console.*` 에 직접 접근하는 제품 소스는 허용 목록과 정확히 일치한다', () => {
    const offenders = sources
      .filter((file) => /(?<![\w$.])console\s*\./.test(codeOf(file)))
      .map((file) => relative(REPO_ROOT, file).split(sep).join('/'))
      .sort();

    expect(offenders).toStrictEqual([...CONSOLE_ALLOWLIST].sort());
  });
});
