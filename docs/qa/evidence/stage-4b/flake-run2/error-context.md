# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session-regression.spec.ts >> AC-4-97 — 터치 타깃 ≥ 44 (실제 hit-test · 세션 상태별) >> 완료 화면 (4b `S4-H1`) — 닫기
- Location: e2e/session-regression.spec.ts:351:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.haru-toast')
Expected: 0
Received: 1
Timeout:  8000ms

Call log:
  - Expect "toHaveCount" locator('.haru-toast') with timeout 8000ms
  - waiting for locator('.haru-toast')
    12 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- main "Main content" [ref=e7]:
  - generic [ref=e8]:
    - button "Close session" [ref=e10] [cursor=pointer]
    - heading "Session Complete" [level=1] [ref=e15]
    - status [ref=e17]:
      - generic [ref=e22]:
        - generic [ref=e23]: Attendance sticker
        - generic [ref=e24]: You read together today
    - generic [ref=e32]:
      - paragraph [ref=e33]: Storytime success! Emma did wonderfully.
      - paragraph [ref=e34]: 14 min together · sticker earned
```

# Test source

```ts
  1   | /**
  2   |  * Stage 4b `S4-K2` — 회귀 · 시각 (AC-4-97 · 98 · 99 · 100). `S4-K1` 이 끝내지 않은 것만 본다.
  3   |  *
  4   |  *  - **AC-4-97** 터치 타깃 ≥ 44 — 세션 화면 상태마다 **보이는 인터랙티브 요소 전부**를 실제 hit-test 로 잰다.
  5   |  *    요소 가운데에서 ±21.5 의 8점 + 가운데가 전부 **같은 요소**로 해석돼야 44×44 hit area 다 (`::before` 확장 포함).
  6   |  *    4b 신규 UI(마이크 시트 · 공지 슬롯 · Discard 다이얼로그 · 완료 · 조회 실패 · 7일 배너 · 48h Toast)를 함께 쓴다.
  7   |  *  - **AC-4-98** reduce — 세션 상태마다 실행 중인 애니메이션 중 **무한 반복 0** · **이동(transform 류) 0**.
  8   |  *    소스 1:1 대조는 `apps/web/__tests__/stage4-motion-guards.test.ts`.
  9   |  *  - **AC-4-99** 320 / 393 / 600 / 1024 — 앱 컬럼 ≤ 480 가운데 · 가로 넘침 0 · 요소가 컬럼 안 · 852 에서 세로 스크롤 0.
  10  |  *  - **AC-4-100** computed `overflow` 목록 (Tailwind 유틸리티 포함 — `R-FIGMA-1` ④) + 4b 신규 그림자 양축 프로브.
  11  |  *
  12  |  * `R-BASELINE-1`: 새 baseline 없음 — 전부 수치 단정이다. dev 패널은 `hideDevPanel`.
  13  |  */
  14  | import { inflateSync } from 'node:zlib';
  15  | 
  16  | import { expect, test, type Locator, type Page } from '@playwright/test';
  17  | 
  18  | import { gotoApp, hideDevPanel, settle } from './support/gallery';
  19  | import { firstStartSession, logInToHome, READY_TITLE, startSession } from './support/session';
  20  | 
  21  | test.beforeEach(async ({ page }) => {
  22  |   await hideDevPanel(page);
  23  | });
  24  | 
  25  | const VIEWPORT = '[data-app-shell-viewport]';
  26  | 
  27  | async function startRecording(page: Page): Promise<void> {
  28  |   await page.getByRole('button', { name: 'Start recording' }).click();
  29  |   await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  30  | }
  31  | 
  32  | async function openPopup(page: Page): Promise<void> {
  33  |   await page.getByRole('button', { name: 'Prompts', exact: true }).click();
  34  |   await expect(page.getByRole('region', { name: 'Try this prompt!' })).toBeVisible();
  35  |   await settle(page);
  36  | }
  37  | 
  38  | async function openDrawer(page: Page): Promise<void> {
  39  |   await openPopup(page);
  40  |   await page.getByRole('button', { name: 'See all prompts' }).click();
  41  |   await expect(page.getByRole('dialog', { name: 'Prompts of this session' })).toBeVisible();
  42  |   await expect(page.locator('.haru-scrim')).toHaveCount(1);
  43  |   await settle(page);
  44  | }
  45  | 
  46  | async function submitToComplete(page: Page): Promise<void> {
  47  |   await startRecording(page);
  48  |   await page.getByRole('button', { name: 'Submit' }).click();
  49  |   await expect(page).toHaveURL(/\/complete$/);
  50  |   await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
  51  |   // 제출 Toast 가 사라진 뒤 (완료 화면 단독)
> 52  |   await expect(page.locator('.haru-toast')).toHaveCount(0, { timeout: 8_000 });
      |                                             ^ Error: expect(locator).toHaveCount(expected) failed
  53  |   await settle(page);
  54  | }
  55  | 
  56  | /** 시계를 멈추고 녹음 → Mock 녹음기의 백그라운드 경고(3번째 청크 뒤)가 공지 슬롯에 뜰 때까지. */
  57  | async function recordUntilNotice(page: Page): Promise<void> {
  58  |   for (let attempt = 0; ; attempt += 1) {
  59  |     const now = await page.evaluate(() => Date.now());
  60  |     try {
  61  |       await page.clock.pauseAt(now + 250);
  62  |       break;
  63  |     } catch (error) {
  64  |       if (attempt >= 5) throw error;
  65  |     }
  66  |   }
  67  |   await startRecording(page);
  68  |   await page.clock.runFor(5_000);
  69  |   await expect(page.locator('.haru-session__notice')).toBeVisible();
  70  |   await page.clock.runFor(300);
  71  | }
  72  | 
  73  | async function startFromHome(page: Page, scenario: string): Promise<void> {
  74  |   await logInToHome(page, scenario);
  75  |   await firstStartSession(page).click();
  76  |   const sheet = page.getByRole('dialog', { name: READY_TITLE });
  77  |   await sheet.getByText('Bedtime', { exact: true }).click();
  78  |   await sheet.getByRole('button', { name: 'Continue' }).click();
  79  |   await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
  80  |   await expect(page.locator('.haru-record')).toBeVisible();
  81  | }
  82  | 
  83  | /* ===== AC-4-97 — 실제 hit area ============================================================== */
  84  | 
  85  | interface HitResult {
  86  |   name: string;
  87  |   width: number;
  88  |   height: number;
  89  |   misses: string[];
  90  |   corners: string[];
  91  | }
  92  | 
  93  | /**
  94  |  * `scope` 안의 보이는 인터랙티브 요소마다 가운데 · 상하좌우 ±21.5 의 5점을 hit-test 한다 — 두 축 모두 44 이상이면
  95  |  * 통과다. 모서리 4점(±21.5, ±21.5)은 **기록만** 한다: `IconButton` 의 hit 확장(`::before`)은 Stage 1 부터
  96  |  * `--radius-pill` 원형 44 라 모서리가 원 밖이다(설계 — a11y gallery `button · Back` 44x44 와 같은 기준).
  97  |  * 모달이 열려 있으면 scope 를 그 모달로 둔다 (뒤 화면은 탭 대상이 아니다).
  98  |  */
  99  | async function probeTouchTargets(page: Page, scope: string): Promise<HitResult[]> {
  100 |   return page.evaluate((scopeSelector) => {
  101 |     const half = 21.5;
  102 |     const roots = [...document.querySelectorAll(scopeSelector)];
  103 |     const interactive = roots.flatMap((root) => [
  104 |       ...root.querySelectorAll<HTMLElement>(
  105 |         'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [tabindex="0"]',
  106 |       ),
  107 |     ]);
  108 |     const unique = [...new Set(interactive)].filter((element) => {
  109 |       if (element.closest('.haru-dev-panel, [inert], [aria-hidden="true"]') !== null) return false;
  110 |       const rect = element.getBoundingClientRect();
  111 |       if (rect.width === 0 || rect.height === 0) return false;
  112 |       const style = getComputedStyle(element);
  113 |       return style.visibility !== 'hidden' && style.display !== 'none';
  114 |     });
  115 |     return unique.map((element) => {
  116 |       const rect = element.getBoundingClientRect();
  117 |       const cx = rect.x + rect.width / 2;
  118 |       const cy = rect.y + rect.height / 2;
  119 |       const points: [string, number, number][] = [
  120 |         ['c', cx, cy],
  121 |         ['n', cx, cy - half],
  122 |         ['s', cx, cy + half],
  123 |         ['w', cx - half, cy],
  124 |         ['e', cx + half, cy],
  125 |       ];
  126 |       const cornerPoints: [string, number, number][] = [
  127 |         ['nw', cx - half, cy - half],
  128 |         ['ne', cx + half, cy - half],
  129 |         ['sw', cx - half, cy + half],
  130 |         ['se', cx + half, cy + half],
  131 |       ];
  132 |       const missed = (x: number, y: number): string | null => {
  133 |         const hit = document.elementFromPoint(x, y);
  134 |         if (hit !== null && (hit === element || element.contains(hit))) return null;
  135 |         return hit === null ? 'null' : `${hit.tagName.toLowerCase()}.${hit.className.toString()}`;
  136 |       };
  137 |       const missesOf = (list: readonly [string, number, number][]) =>
  138 |         list
  139 |           .map(([label, x, y]) => [label, missed(x, y)] as const)
  140 |           .filter(([, hit]) => hit !== null)
  141 |           .map(([label, hit]) => `${label}→${hit ?? ''}`);
  142 |       const name =
  143 |         element.getAttribute('aria-label') ??
  144 |         (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40) ??
  145 |         element.tagName;
  146 |       return {
  147 |         name: `${element.tagName.toLowerCase()} · ${name || element.className}`,
  148 |         width: Math.round(rect.width * 10) / 10,
  149 |         height: Math.round(rect.height * 10) / 10,
  150 |         misses: missesOf(points),
  151 |         corners: missesOf(cornerPoints),
  152 |       };
```