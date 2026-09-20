#!/usr/bin/env node
/**
 * HARU Design Tokens — 빌드.
 *
 * 산출물 (`dist/`)
 *   index.css             src/index.css 의 상대 `@import` 를 전부 펼친 단일 CSS
 *                         (fonts → color-scheme → Tier1 → theme 초기화 → Tier2 → @utility)
 *   component.css         Tier 3 component 토큰 — `packages/ui` 전용 (index.css 에 미포함)
 *   assets/*.woff2        sync-fonts.mjs 가 복사한 Inter latin variable + LICENSE
 *   tokens-manifest.json  토큰 이름 · tier · 파일 · 블록 · provisional / accepted deviation 목록
 *
 * 빌드는 다음 불변 규칙을 위반하면 **실패**한다 (AC-1-10 · AC-1-11 · AC-1-13 · AC-1-14 · AC-1-16).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { inlineImports, stripCssComments } from './parse-tokens.mjs';
import {
  COMPONENT_CSS,
  DIST_DIR,
  ENTRY_CSS,
  PACKAGE_ROOT,
  TOKEN_SOURCES,
  ALL_CSS_FILES,
  collectDeclarations,
  readSource,
} from './token-sources.mjs';

/** @type {string[]} */
const failures = [];

/** @param {boolean} condition @param {string} message */
function check(condition, message) {
  if (!condition) failures.push(message);
}

// ── 1. CSS 펼치기 ───────────────────────────────────────────────────────────
/** @type {{ readFile: (p: string) => string; resolve: (from: string, spec: string) => string }} */
const io = {
  readFile: (p) => readFileSync(p, 'utf8'),
  resolve: (from, spec) => path.resolve(path.dirname(from), spec),
};

const bundled = inlineImports(ENTRY_CSS, io);
const componentCss = readFileSync(COMPONENT_CSS, 'utf8');

// ── 2. 토큰 수집 ────────────────────────────────────────────────────────────
const declarations = collectDeclarations();
const byTier = {
  primitive: declarations.filter((d) => d.tier === 'primitive'),
  semantic: declarations.filter((d) => d.tier === 'semantic'),
  component: declarations.filter((d) => d.tier === 'component'),
};

// ── 3. 불변 규칙 검사 ───────────────────────────────────────────────────────

// 3-1. 토큰 이름 중복 금지 (네임스페이스 초기화 `--x-*: initial` 은 선언이 아니라 지시자)
const realTokens = declarations.filter((d) => !d.name.endsWith('-*'));
const seen = new Map();
for (const decl of realTokens) {
  const prev = seen.get(decl.name);
  if (prev) {
    failures.push(`토큰 이름 중복: ${decl.name} (${prev.file}, ${decl.file})`);
  } else {
    seen.set(decl.name, decl);
  }
}

// 3-2. 의존 방향 — Primitive 는 다른 토큰을 참조하지 않는다
for (const decl of byTier.primitive) {
  check(
    decl.references.length === 0,
    `Tier1 역전: ${decl.name} (${decl.file}) 가 ${decl.references.join(', ')} 를 참조한다`,
  );
}

// 3-3. 의존 방향 — Semantic 은 Tier 3 component 토큰을 참조하지 않는다
const componentNames = new Set(byTier.component.map((d) => d.name));
for (const decl of byTier.semantic) {
  for (const ref of decl.references) {
    check(
      !componentNames.has(ref),
      `Tier2 역전: semantic ${decl.name} 가 component 토큰 ${ref} 를 참조한다`,
    );
  }
}

// 3-4. 의존 방향 — Component 는 Primitive 를 건너뛰어 참조하지 않는다
for (const decl of byTier.component) {
  for (const ref of decl.references) {
    check(
      !ref.startsWith('--haru-'),
      `Tier3 건너뛰기: component ${decl.name} 가 primitive ${ref} 를 직접 참조한다`,
    );
  }
}

// 3-5. `@theme` 에는 Semantic 만 (AC-1-11)
for (const decl of declarations) {
  if (!decl.block.startsWith('@theme')) continue;
  check(
    decl.tier === 'semantic',
    `@theme 에 Tier${decl.tier === 'primitive' ? '1' : '3'} 토큰이 노출됐다: ${decl.name}`,
  );
  check(
    !decl.name.startsWith('--haru-'),
    `@theme 에 primitive 네임스페이스가 샜다: ${decl.name} (${decl.file})`,
  );
}
for (const decl of [...byTier.primitive, ...byTier.component]) {
  check(
    !decl.block.startsWith('@theme'),
    `Tier1/Tier3 토큰은 @theme 에 넣지 않는다: ${decl.name} (${decl.file})`,
  );
}

// 3-6. 외부 폰트 / CDN 요청 0건 (AC-1-14)
for (const rel of ALL_CSS_FILES) {
  const source = stripCssComments(readSource(rel));
  const externalUrl = /url\(\s*['"]?(https?:)?\/\//i.exec(source);
  check(externalUrl === null, `외부 URL 참조 금지: ${rel} → ${externalUrl?.[0] ?? ''}`);
  check(!/fonts\.(googleapis|gstatic)\.com/i.test(source), `Google Fonts 참조 금지: ${rel}`);
}

// 3-7. `@font-face` 는 fonts.css 한 곳에서만 (AC-1-13)
const fontFaceFiles = ALL_CSS_FILES.filter((rel) =>
  stripCssComments(readSource(rel)).includes('@font-face'),
);
check(
  fontFaceFiles.length === 1 && fontFaceFiles[0] === 'src/fonts.css',
  `@font-face 는 src/fonts.css 한 곳에서만 선언한다 (발견: ${fontFaceFiles.join(', ') || '없음'})`,
);

// 3-8. Dark mode 없음 + color-scheme: light (AC-1-16)
check(
  readSource('src/color-scheme.css').includes('color-scheme: light'),
  'color-scheme: light 누락',
);
for (const rel of ALL_CSS_FILES) {
  check(
    !/prefers-color-scheme/.test(stripCssComments(readSource(rel))),
    `Dark mode 토큰 금지 (Stage 0 #20): ${rel} 에 prefers-color-scheme 이 있다`,
  );
}

// 3-9. SF Pro 폰트 파일 미포함 (AC-1-13)
for (const rel of ALL_CSS_FILES) {
  check(
    !/SF-?Pro/i.test(stripCssComments(readSource(rel))),
    `SF Pro 폰트 파일은 저장소·빌드에 포함하지 않는다: ${rel}`,
  );
}

// 3-10. breakpoint 리터럴 동기화 (theme.css `--breakpoint-*` ↔ layout.css `--bp-*`)
/** @param {string} name */
const find = (name) => realTokens.find((d) => d.name === name)?.value;
check(find('--breakpoint-md') === find('--bp-md'), '--breakpoint-md 와 --bp-md 값이 다르다');
check(find('--breakpoint-lg') === find('--bp-lg'), '--breakpoint-lg 와 --bp-lg 값이 다르다');

// 3-11. 펼친 결과에 실제 CSS 변수가 나오는지
const bundledCode = stripCssComments(bundled);
check(bundledCode.includes('--haru-palette-teal'), 'dist/index.css 에 Tier1 변수가 없다');
check(bundledCode.includes('--color-action-primary-bg'), 'dist/index.css 에 Tier2 변수가 없다');
check(!bundledCode.includes('--tabbar-icon-size'), 'dist/index.css 에 Tier3 토큰이 섞였다');
check(
  !/^\s*@import\s+['"]\./m.test(bundled),
  'dist/index.css 에 펼쳐지지 않은 상대 @import 가 있다',
);

if (failures.length > 0) {
  console.error('[build-tokens] 불변 규칙 위반:');
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

// ── 4. 산출물 쓰기 ──────────────────────────────────────────────────────────
mkdirSync(DIST_DIR, { recursive: true });

/** @param {string} title */
const banner = (title) =>
  `/*\n * HARU Design Tokens — ${title}\n * 생성 파일입니다. 수정하지 마세요. 원본: packages/design-tokens/src/**\n */\n`;

writeFileSync(
  path.join(DIST_DIR, 'index.css'),
  `${banner('bundle (Tier1 + Tier2 + @utility)')}${bundled}`,
  'utf8',
);
writeFileSync(
  path.join(DIST_DIR, 'component.css'),
  `${banner('Tier3 component tokens (packages/ui 전용)')}${componentCss}`,
  'utf8',
);

const manifest = {
  generatedFrom: TOKEN_SOURCES.map((s) => s.file),
  counts: {
    primitive: byTier.primitive.length,
    semantic: byTier.semantic.filter((d) => !d.name.endsWith('-*')).length,
    component: byTier.component.length,
    provisional: realTokens.filter((d) => d.provisional !== null).length,
    acceptedDeviation: realTokens.filter((d) => d.acceptedDeviation !== null).length,
  },
  provisionalByItem: Object.fromEntries(
    [...new Set(realTokens.filter((d) => d.provisional).map((d) => d.provisional))]
      .sort()
      .map((p) => [p, realTokens.filter((d) => d.provisional === p).map((d) => d.name)]),
  ),
  tokens: realTokens.map((d) => ({
    name: d.name,
    tier: d.tier,
    file: d.file,
    block: d.block,
    provisional: d.provisional,
    acceptedDeviation: d.acceptedDeviation,
    references: d.references,
  })),
};

writeFileSync(
  path.join(DIST_DIR, 'tokens-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(
  `[build-tokens] ${path.relative(PACKAGE_ROOT, DIST_DIR)}/index.css · component.css · tokens-manifest.json`,
);
console.log(
  `[build-tokens] primitive ${manifest.counts.primitive} · semantic ${manifest.counts.semantic} · component ${manifest.counts.component}`,
);
console.log(
  `[build-tokens] provisional ${manifest.counts.provisional} 개 토큰 / ${Object.keys(manifest.provisionalByItem).length} 항목 · accepted deviation ${manifest.counts.acceptedDeviation}`,
);
