/**
 * HARU Shared UI — CSS 의 `provisional` 주석 회귀 방지 (AC-1-12 보강).
 *
 * `packages/design-tokens` 의 주석은 `__tests__/provisional.test.ts` 가 1:1 로 대조한다.
 * `packages/ui` 의 컴포넌트 CSS 에도 같은 형식의 주석이 붙어 있으므로, 2026-09-22 승인
 * (`docs/decisions/stage-1-approvals.md` §9.1) 으로 **확정된 10 항목이 다시 가값으로
 * 표시되는 것**을 여기에서 막는다. 토큰 값과는 무관한 주석 검사다.
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const UI_SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * 확정 — 주석이 있으면 안 된다.
 * 2026-09-22 10건 (stage-1-approvals §9.1) + 2026-10-06 **`P-05`**(scrim — 근거가 Figma
 * 실측값이 되어 해제, stage-3-approvals §20.2 `L-NEW-09`).
 */
const CONFIRMED = [
  'P-03',
  'P-05',
  'P-06',
  'P-07',
  'P-08',
  'P-09',
  'P-11',
  'P-12',
  'P-13',
  'P-14',
  'P-15',
];

/**
 * 디자이너 대기 유지 항목 (stage-1-approvals §9.2) + Stage 2 신규 `P-17` +
 * Library 1라운드 신규 **`P-24`**.
 * `P-17` = TextField `trailingAction` 이 밑줄 없이 색만으로 구분되는 상태
 * (결정 `D-14`, stage-2-approvals §4).
 * `P-24` = `--color-fg-tertiary`(`#9aabaa`) 대비 1.56–2.38:1 — Book List 메타·`See all` 등
 * (stage-3-approvals §20.4). 디자이너 결정 전까지 주석이 남아 있어야 한다.
 * `P-25` = 세션 `Discard` 흰 라벨 on `#aeaeb2` 2.211:1 — `Button` `neutral` 변형 (Stage 4 `D4-16`).
 */
const REMAINING = ['P-01', 'P-02', 'P-04', 'P-16', 'P-17', 'P-24', 'P-25'];

const MARKER_RE = /provisional:\s*(P-\d{2})/g;

/** @returns `src/**\/*.css` 전부 (경로는 src 기준 상대). */
function listCssFiles(dir: string, base = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return listCssFiles(path.join(dir, entry.name), rel);
    return entry.name.endsWith('.css') ? [rel] : [];
  });
}

const markers = listCssFiles(UI_SRC).flatMap((file) => {
  const source = readFileSync(path.join(UI_SRC, file), 'utf8');
  return [...source.matchAll(MARKER_RE)].map((match) => ({ file, item: match[1] as string }));
});

describe('packages/ui CSS 의 provisional 주석 (approvals §9)', () => {
  it('CSS 를 실제로 읽어 주석을 수집한다 (검사가 빈 배열로 통과하지 않는다)', () => {
    expect(listCssFiles(UI_SRC).length).toBeGreaterThan(20);
    expect(markers.length).toBeGreaterThan(0);
  });

  it('확정 11건은 하나도 남아 있지 않다 (되돌아오면 실패)', () => {
    const regressed = markers
      .filter((marker) => CONFIRMED.includes(marker.item))
      .map((marker) => `${marker.item} ${marker.file}`)
      .sort();
    expect(regressed).toEqual([]);
  });

  it('Stage 2 신규 가값 P-17 이 TextField CSS 에 등록되어 있다 (결정 D-14)', () => {
    expect(markers.filter((marker) => marker.item === 'P-17').map((marker) => marker.file)).toEqual(
      ['field/TextField.css'],
    );
  });

  it('Stage 4 가값 P-25 가 Button neutral 변형 CSS 에 등록되어 있다 (D4-16)', () => {
    expect(markers.filter((marker) => marker.item === 'P-25').map((marker) => marker.file)).toEqual(
      ['button/Button.css'],
    );
  });

  it('남아 있는 항목은 디자이너 대기 7건 안에만 있다', () => {
    const items = [...new Set(markers.map((marker) => marker.item))].sort();
    expect(items.filter((item) => !REMAINING.includes(item))).toEqual([]);
  });

  /** Library 1라운드 — 3차 회색이 붙은 자리를 고정한다 (`LT-1` 재매핑 범위). */
  it('P-24 가 Book List 메타와 SectionHeader CSS 에 등록되어 있다', () => {
    expect(
      markers
        .filter((marker) => marker.item === 'P-24')
        .map((marker) => marker.file)
        .sort(),
    ).toEqual(['list/List.css', 'section/SectionHeader.css', 'section/SectionHeader.css']);
  });
});
