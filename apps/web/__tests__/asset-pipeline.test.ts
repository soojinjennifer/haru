// @vitest-environment node
/**
 * 에셋 파이프라인 정적 증거 (Stage 4 `S4-J`, 이월 `QA-3-003`, AC-4-84 · 결정 `D4-31`).
 *
 * 1. 캐릭터 마스터 PNG 마다 `pnpm assets:optimize` 산출물(`.webp` · `.avif`)이 커밋돼 있다.
 * 2. `sharp` 는 **root devDependency 에만** 있다 — 앱·패키지 런타임 의존이 아니다.
 * 3. 앱 소스(`apps/web/src`)·Shared UI 가 `sharp` 를 import 하지 않는다.
 *
 * 산출물 **내용**(크기 일치 · 상한)은 `pnpm assets:optimize --check` 가, http 빌드 산출물에
 * sharp 흔적이 없음은 `pnpm assert:no-mocks` 가 검사한다.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO = join(import.meta.dirname, '..', '..', '..');
const CHARACTER_DIR = join(REPO, 'apps', 'web', 'src', 'shared', 'assets', 'character');
const COVER_DIR = join(REPO, 'apps', 'web', 'src', 'shared', 'assets', 'book-covers');

interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

function manifest(path: string): Manifest {
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry: string) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe('assets:optimize 산출물', () => {
  const masters = readdirSync(CHARACTER_DIR).filter((entry) => entry.endsWith('.png'));

  it('캐릭터 마스터 PNG 가 있다 (검사가 헛돌지 않도록)', () => {
    expect(masters.length).toBeGreaterThanOrEqual(4);
  });

  it.each(masters)('%s 에 .webp · .avif 가 있다', (png) => {
    const stem = png.slice(0, -'.png'.length);
    expect(existsSync(join(CHARACTER_DIR, `${stem}.webp`))).toBe(true);
    expect(existsSync(join(CHARACTER_DIR, `${stem}.avif`))).toBe(true);
  });

  it('root 에 assets:optimize 스크립트가 있다', () => {
    expect(manifest(join(REPO, 'package.json')).scripts?.['assets:optimize']).toBe(
      'node scripts/assets-optimize.mjs',
    );
  });
});

describe('D8-7 — 책 표지 (Figma image fill, 중립 대체 번복)', () => {
  const covers = readdirSync(COVER_DIR).filter((entry) => /\.(png|webp|avif|jpe?g)$/.test(entry));

  it('표지 디렉토리에는 D8-7 표지 3종(PNG)만 있다 — 중립 단색 표지는 없다', () => {
    expect(covers.sort()).toEqual([
      'grumpy-monkey-play-all-day.png',
      'the-most-magnificent-idea.png',
      'where-the-wild-things-are.png',
    ]);
  });

  it('D8-7 에서 쓰지 않기로 한 표지는 앱 소스에 없다', () => {
    const images = walk(join(REPO, 'apps', 'web', 'src')).filter((file) =>
      /\.(png|webp|avif|jpe?g|gif|svg)$/.test(file),
    );
    expect(images.filter((file) => /the-most-magnificent-thing|neutral-cover/.test(file))).toEqual(
      [],
    );
  });
});

describe('D4-31 — sharp 는 빌드 전용 devDependency', () => {
  it('root devDependencies 에 정확 버전으로 있다', () => {
    const root = manifest(join(REPO, 'package.json'));
    expect(root.devDependencies?.['sharp']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(root.dependencies?.['sharp']).toBeUndefined();
  });

  it('apps/* · packages/* 매니페스트에는 없다', () => {
    const manifests = ['apps', 'packages'].flatMap((group) =>
      readdirSync(join(REPO, group))
        .map((name) => join(REPO, group, name, 'package.json'))
        .filter((path) => existsSync(path)),
    );
    expect(manifests.length).toBeGreaterThan(0);
    for (const path of manifests) {
      const pkg = manifest(path);
      expect(pkg.dependencies?.['sharp'], path).toBeUndefined();
      expect(pkg.devDependencies?.['sharp'], path).toBeUndefined();
    }
  });

  it('앱·Shared UI 소스가 sharp 를 import 하지 않는다', () => {
    const sources = [
      ...walk(join(REPO, 'apps', 'web', 'src')),
      ...walk(join(REPO, 'packages', 'ui', 'src')),
    ].filter((file) => /\.(ts|tsx|js|mjs)$/.test(file));
    const offenders = sources.filter((file) =>
      /from\s+['"]sharp['"]|require\(\s*['"]sharp['"]\s*\)|import\(\s*['"]sharp['"]\s*\)/.test(
        readFileSync(file, 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });
});
