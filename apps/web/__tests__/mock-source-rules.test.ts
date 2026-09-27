// @vitest-environment node
/**
 * Mock 계층의 **정적** 규칙을 테스트로 고정한다 (AC-1-39 · AC-1-41 · AC-1-12).
 * QA 의 grep 증거와 같은 것을 CI 에서 자동으로 강제한다.
 * 소스 파일을 직접 읽으므로 Node 환경에서 돌린다.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const WEB_SRC = join(import.meta.dirname, '..', 'src');
const MOCKS_DIR = join(WEB_SRC, 'mocks');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry: string) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const isSource = (file: string): boolean =>
  /\.tsx?$/.test(file) && !/\.d\.ts$/.test(file) && !file.includes(`${'__tests__'}`);

/**
 * 주석을 제거하고 **실행되는 코드만** 남긴다.
 * 이 파일들의 주석에는 금지 패턴이 규칙 설명으로 등장하므로, 주석까지 검사하면
 * "규칙을 문서화한 것" 이 위반으로 잡힌다.
 */
function codeOf(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const mockSources = walk(MOCKS_DIR).filter(isSource);

const appSources = walk(WEB_SRC)
  .filter(isSource)
  .filter((file) => !file.includes(`${'/mocks/'}`));

/**
 * dev 전용 소스인지. **저장소 절대 경로에 `/dev/` 가 들어갈 수 있으므로**
 * (`~/dev/haru`) 반드시 `src` 기준 상대 경로로 판정한다.
 */
const isDevSource = (file: string): boolean => relative(WEB_SRC, file).startsWith(`dev${'/'}`);

/**
 * 테스트 지원 코드(`src/test/**`)인지.
 *
 * `__tests__` 밖에 있지만 **테스트에서만** 쓰이는 조립 헬퍼다 (`ApiClientProvider` 의
 * `clients` · `authGateway` 주입 경로 — Plan §5.2). 앱 코드가 이 파일을 import 하면
 * Mock 이 Production 경로로 새므로, 아래에서 **역방향 import 를 따로 금지**한다.
 */
const isTestSupportSource = (file: string): boolean =>
  relative(WEB_SRC, file).startsWith(`test${'/'}`);

describe('Mock 결정성 — 시간·난수 직접 호출 금지 (Plan §8.3, AC-1-39)', () => {
  it('Mock 소스가 하나 이상 존재한다 (검사가 헛돌지 않도록)', () => {
    expect(mockSources.length).toBeGreaterThan(0);
  });

  it('`Date.now()` / `new Date()` / `Math.random()` / `setTimeout` 을 직접 호출하지 않는다', () => {
    const offenders = mockSources.filter((file) =>
      /Date\.now\(|new Date\(|Math\.random\(|setTimeout\(|setInterval\(/.test(codeOf(file)),
    );

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });
});

describe('Mock Data 위치 (AC-1-41)', () => {
  it('fixture 상수가 mocks/ 밖(Component · Page · Feature · entities)에 하드코딩되지 않았다', () => {
    const offenders = appSources.filter((file) => {
      const source = codeOf(file);
      return source.includes('0.0.0-mock') || source.includes('__HARU_MOCK_SENTINEL__');
    });

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });
});

describe('Adapter 선택 지점 1곳 (AC-1-12)', () => {
  it('`VITE_API_MODE` 로 분기하는 파일은 app/providers/apiClients.ts 뿐이다', () => {
    const offenders = [...appSources, ...mockSources].filter((file) =>
      codeOf(file).includes('VITE_API_MODE'),
    );

    expect(offenders.map((file) => relative(WEB_SRC, file)).sort()).toStrictEqual([
      'app/providers/apiClients.ts',
    ]);
  });

  it('`src/mocks` 를 import 하는 앱 코드는 Adapter 선택 지점과 테스트 지원 코드뿐이다', () => {
    const offenders = appSources
      .filter((file) => !isTestSupportSource(file))
      .filter((file) => /['"][^'"]*\/mocks['"]/.test(codeOf(file)));

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([
      'app/providers/apiClients.ts',
    ]);
  });

  it('앱 코드(dev · 테스트 지원 제외)는 `src/test/**` 를 import 하지 않는다', () => {
    const offenders = appSources
      .filter((file) => !isTestSupportSource(file) && !isDevSource(file))
      .filter((file) => /['"][^'"]*\/test\//.test(codeOf(file)));

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });

  /**
   * Mock **하위 모듈**(scenario 정의 등)은 dev 도구도 쓴다.
   * dev Scenario Panel 과 gallery 는 Mock 과 **같은 scenario 해석기**를 써야 표시값과
   * 실제 동작이 갈라지지 않는다. 대신 dev 모듈은 `import.meta.env.DEV` 가드 + 동적 import
   * 로만 진입하므로 Production 산출물에는 남지 않는다 (AC-1-42).
   */
  it('`src/mocks/**` 하위를 import 하는 곳은 Adapter 선택 지점 · src/dev · 테스트 지원뿐이다', () => {
    const offenders = appSources.filter(
      (file) =>
        /['"][^'"]*\/mocks\//.test(codeOf(file)) &&
        !isDevSource(file) &&
        !isTestSupportSource(file),
    );

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });
});

describe('dev 전용 코드의 Production 제거 경계 (AC-1-42)', () => {
  const devSources = appSources.filter(isDevSource);

  it('dev 소스가 존재한다 (검사가 헛돌지 않도록)', () => {
    expect(devSources.length).toBeGreaterThan(0);
  });

  it('`src/dev` 를 import 하는 앱 코드는 app/router.tsx 뿐이다', () => {
    const offenders = appSources
      .filter((file) => !isDevSource(file))
      .filter((file) => /['"][^'"]*\/dev\//.test(codeOf(file)));

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual(['app/router.tsx']);
  });

  it('app/router.tsx 는 dev 모듈을 정적 import 하지 않는다 (동적 import 만)', () => {
    const source = codeOf(join(WEB_SRC, 'app', 'router.tsx'));
    const staticImports = source.match(/^import[^\n]*from\s*['"][^'"]*\/dev\/[^'"]*['"]/gm);

    expect(staticImports).toBeNull();
    expect(source).toContain("import.meta.env.DEV ? lazy(() => import('../dev/DevGallery'))");
    expect(source).toContain("import.meta.env.DEV ? lazy(() => import('../dev/DevOverlay'))");
  });

  it('dev sentinel 이 dev 모듈 밖에 하드코딩되지 않았다', () => {
    const offenders = appSources
      .filter((file) => !isDevSource(file))
      .filter((file) => codeOf(file).includes('__HARU_DEV_SENTINEL__'));

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });

  it('dev 화면은 Tailwind 유틸리티 대신 haru-dev-* 평문 CSS 를 쓴다', () => {
    // Tailwind 는 소스를 스캔하므로 dev 가 유틸리티를 쓰면 클래스가 Production CSS 에 남는다.
    const offenders = devSources.filter((file) => {
      const classNames = codeOf(file).match(/className="([^"]*)"/g) ?? [];
      return classNames.some((attribute) =>
        attribute
          .replace(/className="|"/g, '')
          .split(/\s+/)
          .some((name) => name.length > 0 && !name.startsWith('haru-')),
      );
    });

    expect(offenders.map((file) => relative(WEB_SRC, file))).toStrictEqual([]);
  });
});
