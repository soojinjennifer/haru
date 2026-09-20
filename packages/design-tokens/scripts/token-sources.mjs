/**
 * HARU Design Tokens — 소스 파일 목록과 3-tier 분류.
 * build-tokens.mjs 와 테스트가 공유한다.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseTokenFile } from './parse-tokens.mjs';

export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC_DIR = path.join(PACKAGE_ROOT, 'src');
export const DIST_DIR = path.join(PACKAGE_ROOT, 'dist');

/** 패키지 진입점 (Tier 3 component 는 포함하지 않는다). */
export const ENTRY_CSS = path.join(SRC_DIR, 'index.css');

/** Tier 3 component 토큰 — packages/ui 전용 별도 진입점. */
export const COMPONENT_CSS = path.join(SRC_DIR, 'component', 'index.css');

/** 폰트 @font-face 단일 선언 지점. */
export const FONTS_CSS = path.join(SRC_DIR, 'fonts.css');

/** @type {{ file: string; tier: 'primitive' | 'semantic' | 'component' }[]} */
export const TOKEN_SOURCES = [
  { file: 'src/primitive/color.css', tier: 'primitive' },
  { file: 'src/primitive/typography.css', tier: 'primitive' },
  { file: 'src/semantic/color.css', tier: 'semantic' },
  { file: 'src/semantic/typography.css', tier: 'semantic' },
  { file: 'src/semantic/space.css', tier: 'semantic' },
  { file: 'src/semantic/radius.css', tier: 'semantic' },
  { file: 'src/semantic/shadow.css', tier: 'semantic' },
  { file: 'src/semantic/material.css', tier: 'semantic' },
  { file: 'src/semantic/motion.css', tier: 'semantic' },
  { file: 'src/semantic/layout.css', tier: 'semantic' },
  { file: 'src/semantic/z-index.css', tier: 'semantic' },
  { file: 'src/theme.css', tier: 'semantic' },
  { file: 'src/component/index.css', tier: 'component' },
];

/** `@import` 로 index.css 에 묶이는 모든 CSS (utilities·fonts·color-scheme 포함). */
export const ALL_CSS_FILES = [
  'src/index.css',
  'src/fonts.css',
  'src/color-scheme.css',
  'src/theme.css',
  'src/utilities.css',
  'src/primitive/color.css',
  'src/primitive/typography.css',
  'src/semantic/color.css',
  'src/semantic/typography.css',
  'src/semantic/space.css',
  'src/semantic/radius.css',
  'src/semantic/shadow.css',
  'src/semantic/material.css',
  'src/semantic/motion.css',
  'src/semantic/layout.css',
  'src/semantic/z-index.css',
  'src/component/index.css',
];

/** @param {string} relPath */
export function readSource(relPath) {
  return readFileSync(path.join(PACKAGE_ROOT, relPath), 'utf8');
}

/**
 * 모든 소스 파일의 토큰 선언을 한 배열로 모은다.
 * @returns {import('./parse-tokens.mjs').TokenDeclaration[]}
 */
export function collectDeclarations() {
  return TOKEN_SOURCES.flatMap((source) =>
    parseTokenFile(readSource(source.file), { file: source.file, tier: source.tier }),
  );
}
