/**
 * Stage 8 `S8-G` — 전 route 접근성 감사 (Plan §12.4 · Spec §9.4 · §8.2).
 *
 * AC-8-46 규칙 엔진(`@axe-core/playwright`) · AC-8-47 키보드 순회 · focus 표시 · 가려짐 · AC-8-49 이름(규칙 엔진)
 * · AC-8-51 터치 타깃 · AC-8-52 텍스트 200% · AC-8-53 reduced-motion · AC-8-54 대비 측정표 · AC-8-96 Text spacing.
 *
 * ── 판정 원칙 ──
 * - `color-contrast` 규칙을 **끄지 않는다**. 미달 노드는 전부 장부(`D-01` · `P-xx`)에 매핑돼야 하고, 매핑되지
 *   않으면 실패다. axe 가 배경을 판정하지 못한 노드(그래디언트 · glass · 반투명 표면)는 **렌더 픽셀**로 잰다.
 * - 예외 목록은 **정확히 일치**시킨다 — 새 위반이 생기면 이 파일이 깨진다 (`a11y.spec.ts` `KNOWN_BELOW_44` 선례).
 * - `PENDING` 은 **사용자 결정 전**인 항목이다(handoff `H8-6.6`). 수용이 아니다 — QA 가 해당 AC 를 판정한다.
 *   `D8-3`(2026-11-21 사용자 결정) 이후: `H8-6-N1` · `N2` · `N4`(링크 3종) · `N6` = **수정으로 해소 → 목록에서 제거**,
 *   `N3` = 가값 `P-43` 장부 · `N4`(회고 입력칸 40) = **수용 예외(근거 `D8-3`)** 로 옮겼다.
 *
 * 측정 로직은 `support/a11y.ts` 한 곳에 있다. 화면 상태는 `support/a11y-stops.ts` 가 연다.
 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';

import {
  focusTour,
  layoutIssues,
  measureRendered,
  measureTargets,
  ROOT_200_CSS,
  runAxe,
  runningAnimations,
  TEXT_SPACING_CSS,
  type LayoutIssues,
} from './support/a11y';
import { A11Y_STOPS, type A11yStop } from './support/a11y-stops';
import { hideDevPanel } from './support/gallery';

// ── 대비 장부 ────────────────────────────────────────────────────────────────

type Channels = readonly [number, number, number];

/** 측정값(`#rrggbb` — axe · 렌더 픽셀 출력)을 채널로 푼다. 기대값은 HEX 로 적지 않는다(lint — 채널 배열). */
function channels(measured: string): number[] {
  const value = measured.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

/** 렌더 합성 · 안티에일리어싱 오차(채널당 ≤ 3)를 같은 색으로 본다. */
function near(measured: string, expected: Channels, tolerance = 3): boolean {
  return channels(measured).every(
    (value, index) => Math.abs(value - (expected[index] ?? 0)) <= tolerance,
  );
}

const INK_500: Channels = [125, 146, 145]; // --color-fg-secondary (P-01)
const INK_400: Channels = [154, 171, 170]; // --color-fg-tertiary (P-24) · Stage 7 보조 텍스트 (P-35)
const INK_300: Channels = [179, 192, 191]; // --color-fg-quaternary (P-35)
const TEXT_BUTTON: Channels = [94, 115, 112]; // glass · tinted 위 라벨 (P-11)
const WHITE: Channels = [255, 255, 255];
const ACCENT: Channels = [133, 191, 182]; // --color-action-primary-bg (D-01)
const INK_700: Channels = [74, 95, 92]; // --color-fg-primary
const NEUTRAL_ACTION: Channels = [174, 174, 178]; // 세션 Discard (P-25)

/**
 * 대비 미달 → 장부 id. 판정 근거는 `docs/decisions/stage-0-approvals.md` §3 · §4 와 각 Stage 결정.
 * 반환 `null` = 미매핑(결함).
 */
function contrastLedger(fg: string, bg: string, ratio: number, ancestry: string): string | null {
  if (near(fg, WHITE) && near(bg, ACCENT)) return 'D-01';
  if (ancestry.includes('haru-tag')) {
    // Prompt 단계 · 페이지 배지 (cyan 위 흰 라벨) = P-23 · 그 밖 배지 글자 = P-02
    return ancestry.includes('prompt') ? 'P-23' : 'P-02';
  }
  if (near(fg, WHITE) && near(bg, NEUTRAL_ACTION)) return 'P-25';
  if (ancestry.includes('haru-notable-quote')) return 'P-37';
  if (ancestry.includes('haru-bar-chart') || near(fg, INK_300)) return 'P-35';
  if (near(fg, INK_400)) {
    return /haru-weekly-reading|haru-report-|haru-growth-theme|haru-progress/.test(ancestry)
      ? 'P-35'
      : 'P-24';
  }
  if (near(fg, INK_500)) return 'P-01';
  if (near(fg, TEXT_BUTTON) && ratio >= 4.1) return 'P-11';
  // `D8-3` (`H8-6-N3`) — 가값 `P-43`: *Create an account* (ink-700, Figma 선언 색) 가 앱 배경 그래디언트
  // **아래 끝**(렌더 rgb 194 199 210 부근)에 놓여 4.0–4.2:1. 디자이너 확인 대기.
  if (near(fg, INK_700) && ancestry.includes('haru-auth-inline-prompt')) return 'P-43';
  return null;
}

/** 사용자 결정 전 대비 미달 — `D8-3` 이후 **없음** (`H8-6-N3` → `P-43` 장부). 새 항목은 결정 후에만 넣는다. */
function contrastPending(fg: string, ancestry: string): string | null {
  void fg;
  void ancestry;
  return null;
}

// ── 터치 타깃 예외 ──────────────────────────────────────────────────────────

/** 승인된 44 미만 → 결정 id. `null` = 미승인. */
function targetException(
  name: string,
  width: number,
  height: number,
  ancestry: string,
): string | null {
  // S1-G-2 — TextField 행 42 (Figma `76:364`)
  if (ancestry.includes('haru-text-field') && height >= 42) return 'S1-G-2';
  // P-29 — StarRating 별 히트 38×44
  if (ancestry.includes('haru-star-rating') && width >= 38 && height >= 44) return 'P-29';
  // D5-6 · D6-9 — 칩 줄 사이 겹친 히트를 중간선에서 분할 (보이는 배치는 Figma 그대로)
  if (ancestry.includes('haru-chip') && height >= 40) return 'D5-6/D6-9';
  // Stage 2 Spec §4.6 · §9.3 — 본문 **안** 링크(default)는 주변 문장 높이를 따른다 (WCAG 2.5.8 inline 예외)
  // Welcome 법적 고지 한 줄(`haru-auth-legal` — "By continuing … Terms … Privacy Policy" 문장 안 링크)도 같은 inline 이다.
  // `D8-3` 전에는 `targetPending`(`haru-text-link--default` 전체)에 함께 묻혀 있었다 — 목록을 비우며 드러나 여기로 옮겼다.
  if (
    ancestry.includes('haru-auth-inline-prompt') ||
    ancestry.includes('haru-legal-links') ||
    ancestry.includes('haru-auth-legal')
  )
    return 'inline';
  // `D8-3` (`H8-6-N4`) 수용 예외 — 회고 입력칸 높이 40 = Figma `91:715` 선언값(`T5-10`).
  // WCAG 2.5.8 AA(24) 충족 · `S1-G-2` 선례. 40 미만이면 예외 밖이다.
  if (ancestry.includes('haru-text-input') && height >= 40) return 'D8-3';
  void name;
  return null;
}

/**
 * 사용자 결정 전 44 미만 — `D8-3` 이후 **없음**. 단독 줄 · 행 안 링크 3종(consent *View* · 아이 정보 *Done* ·
 * 녹음 목록 *Show more*)은 `TextLink hitArea="touch"` 로 44 가 되어 목록에서 빠졌다(`e2e/text-link-hit.spec.ts`).
 */
function targetPending(ancestry: string): string | null {
  void ancestry;
  return null;
}

// ── 규칙 엔진 serious · critical 결정 대기 ──────────────────────────────────

/**
 * label-in-name(2.5.3) — 승인된 Spec 이 접근성 이름을 정해 둔 곳. 사용자 결정 전. `D8-4` 이후 **없음**.
 * `D8-3` 으로 해소되어 제거: `progress`(`H8-6-N1` — 리포트 카드 링크 aria-label 제거) ·
 * `session-ready`(`H8-6-N2` — 이름 *Tap to recording, Start recording*).
 * `D8-4` 로 해소되어 제거: `session-paused`(`D8-3-N1` — 이름 *Tap to resume, Resume recording*).
 * `D8-5` — `permission-denied` 녹음 버튼(`D8-3-N2` · `D8-4-N1`) 이름을 보이는 캡션과 같은 *Mic is off* 로 맞췄다
 *   (목록 등재 이력 없음 — 정합 기록만).
 */
const AXE_PENDING: Readonly<Record<string, readonly string[]>> = {};

// ── 텍스트 확대 · 간격 ──────────────────────────────────────────────────────

/**
 * 기본 상태 대비 **새로** 생긴 잘림 · 겹침 · 기능 손실. Figma 줄 수 제한(말줄임)은 기본 상태에도 있으므로
 * 차이만 본다. 말줄임(`ellipsis`)이 새로 생긴 것은 `H8-6-N5`(결정 전) 로 따로 모은다.
 */
function regressions(base: LayoutIssues, after: LayoutIssues) {
  const fresh = (list: readonly string[], before: readonly string[]) =>
    list.filter((entry) => !before.includes(entry));
  const clipped = fresh(after.clipped, base.clipped);
  return {
    hardClip: clipped.filter((entry) => entry.startsWith('clip ')),
    ellipsis: clipped.filter((entry) => entry.startsWith('ellipsis ')),
    overlaps: fresh(after.overlaps, base.overlaps),
    unclickable: fresh(after.unclickable, base.unclickable),
    horizontalOverflow: after.horizontalOverflow,
  };
}

async function withStyle<T>(page: Page, css: string, run: () => Promise<T>): Promise<T> {
  const handle = await page.addStyleTag({ content: css });
  try {
    return await run();
  } finally {
    await handle.evaluate((node) => {
      (node as Element).remove();
    });
  }
}

async function attach(testInfo: TestInfo, name: string, body: unknown): Promise<void> {
  await testInfo.attach(name, {
    body: JSON.stringify(body, null, 2),
    contentType: 'application/json',
  });
}

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function audit(page: Page, stop: A11yStop, testInfo: TestInfo): Promise<void> {
  // ① 규칙 엔진 (AC-8-46 · 49)
  const axe = await runAxe(page);
  const blocking = axe.blocking.map((finding) => finding.rule);
  const pending = (AXE_PENDING[stop.id] ?? []).map((entry) => entry.split(' · ')[0]);
  expect
    .soft(blocking.sort(), 'axe serious/critical (color-contrast 제외)')
    .toStrictEqual([...pending].sort());

  // ② 대비 (AC-8-54) — axe 판정 + 렌더 픽셀
  const rendered = await measureRendered(page, axe.contrastIncomplete);
  const rows = [
    ...axe.contrast.map((node) => ({ source: 'axe', ...node })),
    ...rendered
      .filter((row) => row.ratio < row.expected)
      .map((row) => ({ source: 'pixel', ...row })),
  ].map((row) => ({
    source: row.source,
    fg: row.fg,
    bg: row.bg,
    ratio: row.ratio,
    ledger: contrastLedger(row.fg, row.bg, row.ratio, row.ancestry),
    pending: contrastPending(row.fg, row.ancestry),
    target: row.target,
  }));
  await attach(testInfo, 'contrast.json', rows);
  expect
    .soft(
      rows.filter((row) => row.ledger === null && row.pending === null),
      '장부에 매핑되지 않은 대비 미달 (AC-8-54)',
    )
    .toStrictEqual([]);

  // ③ reduced-motion (AC-8-53) — 기본 설정이 `reducedMotion: 'reduce'`
  const running = (await runningAnimations(page)).filter((name) => !name.includes('haru-spinner'));
  expect.soft(running, '진행 중 애니메이션 (reduced-motion)').toStrictEqual([]);

  // ④ 터치 타깃 (AC-8-51)
  const targets = (await measureTargets(page))
    .filter((target) => !target.edge && (target.width < 44 || target.height < 44))
    .map((target) => ({
      ...target,
      exception: targetException(target.name, target.width, target.height, target.ancestry),
      pending: targetPending(target.ancestry),
    }));
  await attach(testInfo, 'targets-below-44.json', targets);
  expect
    .soft(
      targets
        .filter((target) => target.exception === null && target.pending === null)
        .map(({ name, width, height }) => `${name} ${String(width)}×${String(height)}`),
      '승인 예외 밖 44 미만 (AC-8-51)',
    )
    .toStrictEqual([]);

  // ⑤ 키보드 순회 — 정방향 · 역방향 (AC-8-47 · 48 · 2.4.7 · 2.4.11)
  for (const direction of ['forward', 'backward'] as const) {
    const steps = await focusTour(page, 60, direction);
    expect.soft(steps.length, `${direction} Tab 정지점 수`).toBeGreaterThan(0);
    expect
      .soft(
        steps.filter((step) => !step.visibleRing).map((step) => step.name),
        `${direction} focus 표시 없음`,
      )
      .toStrictEqual([]);
    expect
      .soft(
        steps.filter((step) => step.obscured).map((step) => step.name),
        `${direction} focus 가 완전히 가려짐 (2.4.11)`,
      )
      .toStrictEqual([]);
    if (stop.modal !== undefined) {
      expect
        .soft(
          steps.filter((step) => !step.inModal).map((step) => step.name),
          `${direction} focus 가 모달 밖으로 나감`,
        )
        .toStrictEqual([]);
    }
  }

  // ⑥ Text spacing · 200% (AC-8-96 · AC-8-52)
  const base = await layoutIssues(page);
  const spacing = regressions(
    base,
    await withStyle(page, TEXT_SPACING_CSS, () => layoutIssues(page)),
  );
  const root200 = regressions(base, await withStyle(page, ROOT_200_CSS, () => layoutIssues(page)));
  const viewport = page.viewportSize() ?? { width: 393, height: 852 };
  await page.setViewportSize({ width: 196, height: 426 });
  const zoom = regressions(base, await layoutIssues(page));
  await page.setViewportSize(viewport);
  await attach(testInfo, 'text-resize.json', { spacing, root200, zoom });

  for (const [label, result] of [
    ['text spacing', spacing],
    ['root 200%', root200],
    ['viewport 196 (zoom 200%)', zoom],
  ] as const) {
    expect.soft(result.hardClip, `${label} — 잘림`).toStrictEqual([]);
    expect.soft(result.overlaps, `${label} — 겹침`).toStrictEqual([]);
    // `H8-6-N6` 196 폭 Activity Card 뒤집기 버튼 — `D8-3` 수정(헤더 Tag 줄어듦)으로 해소, 예외 없음
    expect.soft(result.unclickable, `${label} — 기능 손실`).toStrictEqual([]);
    expect.soft(result.horizontalOverflow, `${label} — 가로 넘침`).toBeLessThanOrEqual(0);
  }
}

test.describe('S8-G 전 route 접근성 감사 (AC-8-46 · 47 · 51~54 · 96)', () => {
  for (const stop of A11Y_STOPS) {
    test(`${stop.id} — ${stop.route}`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      await stop.open(page);
      await audit(page, stop, testInfo);
    });
  }
});
