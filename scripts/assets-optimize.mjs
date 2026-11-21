#!/usr/bin/env node
// `pnpm assets:optimize` — 래스터 에셋 파이프라인 (Stage 1 `D-4` · Stage 3 `D-13` · Stage 4 `S4-J`).
//
// 이월 `QA-3-003` (`docs/qa/stage-3-qa-report.md`), AC-4-84 · AC-4-85, 결정 `D4-31`.
//
// 하는 일 — 그룹마다 마스터 PNG 를 읽어 **같은 디렉토리에** 세 포맷을 만든다.
//   <name>.png   PNG fallback — 해상도 상한을 넘으면 상한으로 줄인다. 넘지 않으면 **다시 쓰지 않는다**
//   <name>.webp  WebP
//   <name>.avif  AVIF
// 화면은 `<picture>` + `<source type srcset>` 로 AVIF → WebP → PNG 순서로 고른다.
//
// ⭐ 품질 — **무손실(lossless)** 이 기본이다 (2026-10-15, development-agent 판단 — 보고 대상).
//   실측(이 저장소 캐릭터 4종): AVIF 무손실은 디코드 픽셀이 PNG 와 **바이트 단위로 같다**(diff 0).
//   WebP 무손실은 `exact: true` 로 알파 0 픽셀의 RGB 까지 보존한다. 그래서 `<picture>` 로 바꿔도
//   **렌더 결과가 바뀌지 않아** 시각 baseline 이 그대로 유효하다 (R-BASELINE-1 — 원인 없는 diff 를
//   만들지 않는다). 손실 압축(AVIF q70 ≈ PNG 의 8%)은 용량을 훨씬 줄이지만 픽셀이 바뀐다 →
//   표지 교체(`P3-BIP-19`, Stage 8)와 함께 baseline 재생성 절차를 거쳐 `QUALITY` 만 바꾼다.
//
// 해상도 상한 (`D-4`: 1440 / 696 / 360 / 216) — 그룹별로 하나를 쓴다. **업스케일하지 않는다.**
//
// 범위
//   character   캐릭터 에셋 (`apps/web/src/shared/assets/character`) — PNG + WebP + AVIF
//   book-covers Mock 전용 **중립 대체 표지** (Stage 8 `S8-I` · `N8-13` ⓐ · `P3-BIP-19` · `QA-3-003`).
//               상용 그림책 표지를 저장소·프리뷰에서 걷어내고, 마스터 PNG 를 **이 스크립트가 생성**한다
//               (`COVER_SPECS` — 무늬·글자 없는 단색 면, 색 = design-tokens palette 원시값을 읽어 온다).
//               포맷은 **PNG 하나**다: 표지는 contract `BookSummary.coverUrl` **단일 URL** 로 전달되어
//               화면이 `<picture>` 로 포맷을 고를 수 없다 (실제 포맷은 서버 몫). 쓰이지 않을 변형을
//               저장소에 쌓지 않는다.
//
// 사용
//   pnpm assets:optimize            산출물을 만든다 (이미 최신이면 그대로 둔다)
//   pnpm assets:optimize --check    만들지 않고 검사만 한다 — 누락·상한 초과·크기 불일치면 종료 코드 1
//
// `sharp` 는 **빌드 전용 root devDependency** 다 (`D4-31`). 이 스크립트 밖(apps/web/src 등)에서
// import 하지 않으며, `pnpm assert:no-mocks` 가 http 빌드 산출물에 sharp 흔적이 없음을 검사한다.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** `D-4` 해상도 상한 단계. */
export const RESOLUTION_CAPS = [1440, 696, 360, 216];

/**
 * 처리 그룹. `maxWidth` 는 `RESOLUTION_CAPS` 중 하나여야 한다.
 * 캐릭터 = 1440 (`D-13 ②` — 전면 상한은 캐릭터·일러스트에만).
 */
export const ASSET_GROUPS = [
  {
    name: 'character',
    dir: 'apps/web/src/shared/assets/character',
    maxWidth: 1440,
    formats: ['webp', 'avif'],
  },
  {
    // 표시 최대 = 서재 캐러셀 `lg` 약 107px 폭 → 2배 214 ≤ 216 (`D-4` 최소 단계)
    name: 'book-covers',
    dir: 'apps/web/src/shared/assets/book-covers',
    maxWidth: 216,
    formats: [],
  },
];

/**
 * 중립 대체 표지 (Stage 8 `S8-I` · `N8-13` ⓐ). 크기 = 216 × 309 (`--book-cover-aspect` 7/10).
 * `palette` = `packages/design-tokens/src/primitive/color.css` 의 `--haru-palette-<palette>` —
 * HEX 를 여기에 다시 적지 않는다 (값의 기준은 Figma → design-tokens 한 곳).
 */
export const COVER_SPECS = [
  { name: 'neutral-cover-teal', palette: 'teal' },
  { name: 'neutral-cover-orange', palette: 'orange' },
  { name: 'neutral-cover-indigo', palette: 'indigo' },
];
export const COVER_SIZE = { width: 216, height: 309 };

const PALETTE_CSS = 'packages/design-tokens/src/primitive/color.css';

/** 품질 — 위 머리말 "품질" 참고. 손실로 바꾸면 시각 baseline 재생성 절차가 필요하다. */
export const QUALITY = {
  webp: { lossless: true, exact: true, effort: 6 },
  avif: { lossless: true, effort: 6 },
};

const check = process.argv.includes('--check');

/** @param {string} file */
function rel(file) {
  return relative(repoRoot, file);
}

/** @param {number} bytes */
function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

let failed = false;
const rows = [];

/** @param {string} name */
function paletteHex(name) {
  const css = readFileSync(join(repoRoot, PALETTE_CSS), 'utf8');
  const match = css.match(new RegExp(`--haru-palette-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (match === null) {
    console.error(`[assets:optimize] ${PALETTE_CSS} 에 --haru-palette-${name} 가 없습니다.`);
    process.exit(1);
  }
  return match[1];
}

// ── 중립 대체 표지 마스터 생성 (book-covers) ──
// 같은 픽셀이면 다시 쓰지 않는다 — 실행을 반복해도 git 변화가 없다. `--check` 는 쓰지 않고 비교만 한다.
{
  const coverDir = join(repoRoot, 'apps/web/src/shared/assets/book-covers');
  for (const spec of COVER_SPECS) {
    const outPath = join(coverDir, `${spec.name}.png`);
    const expected = await sharp({
      create: { ...COVER_SIZE, channels: 3, background: paletteHex(spec.palette) },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const same =
      existsSync(outPath) &&
      (await sharp(outPath).raw().toBuffer()).equals(await sharp(expected).raw().toBuffer());

    if (same) continue;
    if (check) {
      failed = true;
      console.error(
        `[assets:optimize] 표지 마스터가 없거나 사양과 다릅니다: ${rel(outPath)} — pnpm assets:optimize 를 실행하세요.`,
      );
      continue;
    }
    writeFileSync(outPath, expected);
  }
}

for (const group of ASSET_GROUPS) {
  if (!RESOLUTION_CAPS.includes(group.maxWidth)) {
    console.error(
      `[assets:optimize] ${group.name}: maxWidth ${group.maxWidth} 는 D-4 상한이 아닙니다.`,
    );
    process.exit(1);
  }

  const dir = join(repoRoot, group.dir);
  if (!existsSync(dir)) {
    console.error(`[assets:optimize] ${group.dir} 가 없습니다.`);
    process.exit(1);
  }

  const masters = readdirSync(dir)
    .filter((entry) => entry.endsWith('.png'))
    .sort();

  for (const entry of masters) {
    const pngPath = join(dir, entry);
    const stem = basename(entry, '.png');
    const meta = await sharp(pngPath).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const overCap = width > group.maxWidth;

    // ── PNG fallback ── 상한을 넘을 때만 줄여서 다시 쓴다 (마스터를 이유 없이 재인코딩하지 않는다).
    let target = { width, height };
    if (overCap) {
      if (check) {
        failed = true;
        console.error(`[assets:optimize] ${rel(pngPath)} 폭 ${width} > 상한 ${group.maxWidth}`);
        continue;
      }
      const resized = await sharp(pngPath)
        .resize({ width: group.maxWidth, withoutEnlargement: true })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer({ resolveWithObject: true });
      writeFileSync(pngPath, resized.data);
      target = { width: resized.info.width, height: resized.info.height };
    }

    const sizes = { png: statSync(pngPath).size };

    for (const format of group.formats) {
      const outPath = join(dir, `${stem}.${format}`);

      if (check) {
        if (!existsSync(outPath)) {
          failed = true;
          console.error(
            `[assets:optimize] 누락: ${rel(outPath)} — pnpm assets:optimize 를 실행하세요.`,
          );
          continue;
        }
        const outMeta = await sharp(outPath).metadata();
        if (outMeta.width !== target.width || outMeta.height !== target.height) {
          failed = true;
          console.error(
            `[assets:optimize] 크기 불일치: ${rel(outPath)} ${outMeta.width}×${outMeta.height} ≠ PNG ${target.width}×${target.height}`,
          );
          continue;
        }
        sizes[format] = statSync(outPath).size;
        continue;
      }

      const encoded = await sharp(pngPath)[format](QUALITY[format]).toBuffer();
      // 이미 같은 바이트면 다시 쓰지 않는다 — 실행을 반복해도 git 변화가 없다.
      if (!existsSync(outPath) || !readFileSync(outPath).equals(encoded)) {
        writeFileSync(outPath, encoded);
      }
      sizes[format] = encoded.length;
    }

    rows.push({
      file: rel(pngPath),
      size: `${target.width}×${target.height}`,
      png: kb(sizes.png),
      webp: sizes.webp === undefined ? '—' : kb(sizes.webp),
      avif: sizes.avif === undefined ? '—' : kb(sizes.avif),
      resized: overCap ? `→ ${group.maxWidth}` : 'no',
    });
  }
}

console.table(rows);

if (failed) {
  console.error('[assets:optimize] 실패.');
  process.exit(1);
}

console.log(`[assets:optimize] OK — ${rows.length}개 마스터 ${check ? '검사' : '처리'} 완료.`);
