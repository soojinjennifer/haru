// @vitest-environment node
/**
 * `pnpm assert:preview` 검사 자체의 회귀 테스트 (Stage 8 `S8-I` · Plan §5.6 · AC-8-66 · 67 · 68).
 *
 * 실제 프리뷰 산출물 검사는 `pnpm build:preview && pnpm assert:preview` 로 한다. 여기서는
 * **가짜 산출물 디렉토리**를 만들어 각 검사가 위반을 실제로 잡는지(헛돌지 않는지) 확인한다.
 * 프리뷰 빌드 설정(`vite.config.ts`)과 root script 연결도 함께 고정한다.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const REPO = join(import.meta.dirname, '..', '..', '..');
const SCRIPT = join(REPO, 'scripts', 'assert-preview.mjs');

const CLEAN_JS = 'const a="__HARU_MOCK_SENTINEL__";const e="sam@example.com";';

const dirs: string[] = [];

function fakeDist(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'haru-preview-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    const full = join(dir, name);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

function run(dir: string): { status: number | null; out: string } {
  const result = spawnSync(process.execPath, [SCRIPT, dir], {
    encoding: 'utf8',
    env: { PATH: process.env['PATH'] ?? '' },
  });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('assert:preview', () => {
  it('깨끗한 Mock 산출물은 통과한다', () => {
    const { status, out } = run(
      fakeDist({ 'index.html': '<!doctype html>', 'assets/index.js': CLEAN_JS }),
    );
    expect(out).toContain('통과');
    expect(status).toBe(0);
  });

  it.each([
    ['⓪ Mock 표식 없음 (http 빌드)', { 'assets/index.js': 'const a=1;' }, '⓪'],
    ['① .map 파일', { 'assets/index.js.map': '{}' }, '①'],
    ['① sourceMappingURL 주석', { 'assets/x.js': '//# sourceMappingURL=x.js.map' }, '①'],
    ['② dev sentinel', { 'assets/dev.js': '__HARU_DEV_SENTINEL__' }, '②'],
    ['② dev CSS', { 'assets/dev.css': '.haru-dev-panel{}' }, '②'],
    ['③ service role', { 'assets/s.js': 'service_role' }, '③'],
    ['③ AWS 키', { 'assets/s.js': 'AKIAABCDEFGHIJKLMNOP' }, '③'],
    ['⑤ 최상위 404.html', { '404.html': '<p>404</p>' }, '⑤'],
    ['⑤ _redirects', { _redirects: '/* /index.html 200' }, '⑤'],
    ['⑥ 실제 도메인 이메일', { 'assets/m.js': 'real.parent@gmail.com' }, '⑥'],
  ])('%s → 실패', (_label, extra, mark) => {
    const files: Record<string, string> = {
      'index.html': '<!doctype html>',
      'assets/index.js': CLEAN_JS,
      ...extra,
    };
    if (mark === '⓪') files['assets/index.js'] = 'const a=1;';
    const { status, out } = run(fakeDist(files));
    expect(status).toBe(1);
    expect(out).toContain(`FAIL — ${mark}`);
  });

  it('⑥ 책 표지 에셋은 실패가 아니라 목록으로 출력한다 (D8-7)', () => {
    const { status, out } = run(
      fakeDist({
        'index.html': '<!doctype html>',
        'assets/index.js': CLEAN_JS,
        'assets/where-the-wild-things-are-abc.png': 'x',
      }),
    );
    expect(status).toBe(0);
    expect(out).toContain('⑥ 책 표지 에셋 (1개');
    expect(out).toContain('where-the-wild-things-are-abc.png');
  });

  it('index.html 이 없으면 실패한다 (빌드 전)', () => {
    expect(run(fakeDist({ 'assets/index.js': CLEAN_JS })).status).toBe(1);
  });
});

describe('프리뷰 빌드 설정', () => {
  const vite = readFileSync(join(REPO, 'apps', 'web', 'vite.config.ts'), 'utf8');
  const root = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };
  const web = JSON.parse(readFileSync(join(REPO, 'apps', 'web', 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };

  it('sourcemap 은 프리뷰에서만 끈다 (S1-G-7) · 산출물은 dist-preview', () => {
    expect(vite).toContain('sourcemap: !preview');
    expect(vite).toContain("outDir: preview ? PREVIEW_OUT_DIR : 'dist'");
    expect(vite).toContain("const PREVIEW_OUT_DIR = 'dist-preview'");
  });

  it('root script 가 연결돼 있다', () => {
    expect(root.scripts['build:preview']).toBe('pnpm --filter @haru/web run build:preview');
    expect(root.scripts['assert:preview']).toBe('node scripts/assert-preview.mjs');
    expect(web.scripts['build:preview']).toContain('vite build --mode preview');
  });
});
