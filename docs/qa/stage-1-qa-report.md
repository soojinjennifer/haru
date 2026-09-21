# Stage 1 QA Report — Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure

Agent: `stage-qa-agent` · Step: `docs/workflow/stage-1/stage-1-QA.md`
판정 기준: `.claude/rules/qa.md` §1·§2 · `docs/plans/stage-1-plan.md` §11 (AC-1-01 ~ AC-1-45) · `docs/design/stage-1-design-spec.md` §10.2·§10.3 · `docs/decisions/stage-0-approvals.md` §3·§4 · `docs/decisions/stage-1-approvals.md` §8

---

## 1. Summary

| 항목 | 값 |
|---|---|
| **Stage Verdict (2회차 · 최신)** | **`PASS (accepted: D-01, S1-G-2)`** |
| 근거 | `FAIL` 0건 · `PARTIAL` 0건 · `NOT VERIFIED` 0건 · `BACKEND_INTEGRATION_PENDING` 0건. 유일한 미달이던 **AC-1-45(QA-1-001)** 가 해소되어 `PASS`. AC-1-17 은 사전 수용 예외 `D-01`, AC-1-21 은 `S1-G-2` 로 Stage Verdict 계산에서 사용자 수용 항목으로 처리했다 (`.claude/rules/qa.md` §2) |
| 1회차 Verdict | `INCOMPLETE` (FAIL 0 · PARTIAL 1 · NOT VERIFIED 0) — §12 재검증 이력 |
| 실행 일시 | 1회차 2026-09-21 · **2회차(재검증) 2026-09-21** |
| 대상 상태 | working tree (HEAD `d9a6927` + Stage 1-B~1-G + QA-1-001 수정분, 미커밋). `apps/`, `e2e/`, `playwright.config.ts` 등은 untracked 상태로 검증했다 |
| 판정 집계 (2회차) | PASS **44** · PASS (accepted) **2** · PARTIAL **0** · FAIL **0** · NOT VERIFIED **0** · BACKEND_INTEGRATION_PENDING **0** (합계 45 + 예외 2 중복 계상 없음: AC-1-17·AC-1-21 이 accepted 2건) |
| 미해결 Finding | `QA-1-002` (Low, 사용자/design-agent 결정 대기) · `QA-1-003` (Low) · `QA-1-004` (Low, 신규) — 셋 다 해당 AC 를 FAIL 로 만들지 않는다 |

> Stage 1 은 `health` 도메인까지 전부 Mock 으로 닫히므로 `BACKEND_INTEGRATION_PENDING` 항목이 **0건**이다 (Plan §11 "PENDING 예상 전부 No" 와 일치).

**2회차 판정 근거 요약**

- QA-1-001 은 development-agent 보고를 신뢰하지 않고 **QA 가 1회차와 같은 프로브를 다시 실행**해 확인했다 (§3.2 C-11b · §5 QA-1-001).
- 이번 수정이 건드린 영역(lint 설정 · `packages/ui` Icon 경고 · `packages/ui` 테스트 include · e2e/baseline)에 회귀가 없음을 §8 에서 별도로 확인했다.
- `.claude/rules/qa.md` §4 공통 실행 명령 8종을 전부 **다시 직접 실행**했다 (§3.2).

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (Darwin 25.5.0, arm64) |
| Node | v24.21.0 (`.nvmrc` = 24.21.0, `engines.node` = `>=24.21.0 <25`) |
| pnpm | 12.4.2 (`packageManager` = `pnpm@12.4.2`) |
| 브라우저 | Chromium (Playwright ~1.63.0), viewport 기본 393×852, `reducedMotion: 'reduce'`, `animations: 'disabled'` |
| 실기기 | 없음 — Stage 1 은 웹 전용이며 실기기 요구 AC 가 없다 (Capacitor 는 Stage 4) |
| Mock 시나리오 | `health` 그룹 5종 (`success` · `loading` · `error` · `retry` · `offline`) + `__states` 데모 그룹. 전환은 `?scenario=` URL 파라미터 / dev Scenario Panel |
| 시각 비교 임계값 | `maxDiffPixelRatio: 0.002` + `maxDiffPixels: 200` (결정 `S1-D2-6`), baseline 경로 `{testDir}/__screenshots__/{platform}/…` |

---

## 3. Commands Executed

QA 가 직접 실행한 명령이다. 모든 명령이 실행되었으며 `NOT VERIFIED` 로 남은 명령은 없다.

### 3.1 1회차

| # | 명령 | Exit | 결과 요약 |
|---|---|---|---|
| C-1 | `pnpm install --frozen-lockfile` | 0 | 6 workspace projects, lockfile up to date, resolution skipped |
| C-2 | `pnpm typecheck` | 0 | root `tsconfig.json` + `tsconfig.e2e.json` + 전 패키지(`config`·`design-tokens`·`contracts`·`ui`·`web`) 통과 |
| C-3 | `pnpm lint` | 0 | eslint 오류 0 · **warning 0** |
| C-4 | `pnpm lint:boundaries` | 0 | dependency-cruiser — `✔ no dependency violations found (236 modules, 593 dependencies cruised)` |
| C-5 | `pnpm test` | 0 | vitest — **Test Files 58 passed (58) / Tests 440 passed (440)**, 9.50s |
| C-6 | `VITE_API_MODE=mock pnpm build` | 0 | `index` 300.84 kB + `mocks` 90.54 kB (별도 청크) + css 74.98 kB + woff2 48.25 kB |
| C-7 | `VITE_API_MODE=http pnpm build` | 0 | `index` 390.32 kB 단일 청크 — **mocks 청크 없음** |
| C-8 | `pnpm assert:no-mocks` | 0 | `__HARU_MOCK_SENTINEL__` 0건 · `__HARU_DEV_SENTINEL__` 0건 · `haru-dev-` 0건 (4개 파일 검사) |
| C-9 | `pnpm test:e2e` | 0 | Playwright — **50 passed (50.0s)**: a11y 4 · responsive 7 · scenarios 11 · visual 28 |
| C-10 | `node <scratchpad>/qa-shots.mjs` (QA 자체 Playwright 스크립트) | 0 | Dialog·Toast 상태 직접 캡처, 6개 gallery route 순회 중 **외부 도메인 요청 0건**, 콘솔에 PII 0건 |
| C-11 | `eslint --stdin --stdin-filename apps/web/src/features/probe.ts` | 1 | **QA-1-001 재현** — `console.log` 만 차단되고 `console.error`/`console.warn` 은 통과 |

보조 증거 수집: `git ls-files` / `git status --porcelain` (Scope), 토큰·contracts·mocks 대상 grep 다수, Figma MCP screenshot 7건 (`17:20` · `25:87` · `76:417` · `76:440` · `88:721` · `88:789` · `17:343`).

QA 산출 증거 파일: `/Users/soojin/dev/haru/docs/qa/evidence/qa-dialog.png` · `qa-toast.png` · `qa-home-placeholder.png`

### 3.2 2회차 (재검증 — QA-1-001 Fix Loop 1)

공통 실행 명령 8종을 **전부 다시 직접 실행**했다. 1회차 결과를 재사용한 명령은 없다.

| # | 명령 | Exit | 결과 요약 (1회차 대비) |
|---|---|---|---|
| C-1 | `pnpm install --frozen-lockfile` | **0** | 6 workspace projects · lockfile up to date (변화 없음) |
| C-2 | `pnpm typecheck` | **0** | root + `tsconfig.e2e.json` + 5 패키지 전부 통과 (변화 없음) |
| C-3 | `pnpm lint` | **0** | 출력이 `$ eslint .` **1줄뿐** — 오류 0 · warning 0. `no-console: 'error'` 강화 후에도 제품 코드 위반 0건 |
| C-4 | `pnpm lint:boundaries` | **0** | `✔ no dependency violations found (240 modules, 599 dependencies cruised)` — 1회차 236/593 대비 `lib/devWarn` + 테스트 추가분만 증가, **위반 0 유지**. `packages/ui → apps/web` 역방향 import 없음 |
| C-5 | `pnpm test` | **0** | vitest — **Test Files 60 passed (60) / Tests 452 passed (452)**, 10.18s. 1회차 58/440 대비 **+2 파일 / +12 테스트**(신설 회귀 테스트와 정확히 일치), **실패·skip 0** |
| C-6 | `VITE_API_MODE=mock pnpm build` | **0** | `index` 301.07 kB + `mocks` 90.54 kB 별도 청크 + css 74.98 kB + woff2 48.25 kB (index +0.23 kB = devWarn 추가분) |
| C-7 | `VITE_API_MODE=http pnpm build` | **0** | `index` 390.54 kB 단일 청크 — **mocks 청크 없음** (변화 없음) |
| C-8 | `pnpm assert:no-mocks` | **0** | `__HARU_MOCK_SENTINEL__` 0건 · `__HARU_DEV_SENTINEL__` 0건 · `haru-dev-` 0건 |
| C-9 | `pnpm test:e2e` | **0** | Playwright — **50 passed (50.4s)**. 시각 baseline 27건 전부 통과 (**baseline 재생성 없이** 통과) |
| **C-11b** | `eslint --stdin` 프로브 **12 경로** | — | **QA-1-001 재현 실패 = 해소.** 아래 §5 QA-1-001 참조. 증거: `docs/qa/evidence/qa-1-001-no-console-probe.txt` |
| C-12b | 저장소 전수 grep — 제품 소스의 `console.` 직접 접근 | — | **정확히 2건** (`logger.ts` 3줄 · `devWarn.ts` 1줄), 둘 다 허용 경로. `Icon.tsx` 의 직접 호출은 사라졌다. 증거: `docs/qa/evidence/qa-1-001-console-scan.txt` |
| C-13b | 수정 범위 확인 — 1회차 리포트(08:09) 이후 변경 파일 | — | `eslint.config.js` · `packages/config/eslint/base.js` · `packages/config/__tests__/no-console-invariant.test.ts` · `packages/ui/src/lib/devWarn.ts` · `packages/ui/src/lib/__tests__/devWarn.test.ts` · `packages/ui/src/icon/Icon.tsx` · `packages/ui/vitest.config.ts` · `apps/web/src/shared/lib/logger.ts` + 인계 문서 2건. **e2e spec · baseline PNG · 토큰 · 다른 컴포넌트는 미변경** — 보고된 수정 범위와 일치하며, baseline 을 다시 찍어 통과시킨 흔적이 없다 |
| C-14b | http 빌드 산출물 검사 | — | `MockHealthApi` / `ScenarioPanel` / `__dev/ui` **0건** 유지. `devWarn` 은 번들에 포함되며 production 에서도 실행 가능 — 문구는 고정 리터럴 + 살균 식별자라 PII 없음 (§5 QA-1-004 기록) |

2회차에서 QA 가 저장소에 남긴 파일은 `docs/qa/evidence/**` 와 이 리포트뿐이다. 프로브 소스는 **stdin 으로만** 넣었고 저장소에 파일을 만들지 않았다 (`git status` 확인 — `probe` 경로 0건).



---

## 4. Requirement Matrix — AC-1-01 ~ AC-1-45

### 4.1 빌드 · 툴체인

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-01 | `PASS` | C-1 exit 0. 커밋된 `pnpm-lock.yaml` 로 resolution 생략 성공 |
| AC-1-02 | `PASS` | C-2 exit 0. grep 결과 저장소 전체에서 `any` / `as any` / `@ts-ignore` **0건**. `@ts-expect-error` 1건은 `apps/web/src/shared/lib/logger.test.ts:57` 이며 **사유 주석 동반** — AC 가 허용하는 형태 |
| AC-1-03 | `PASS` | C-3 exit 0. 오류 0 · **warning 0** (허용 warning 기준 적용 불필요) |
| AC-1-04 | `PASS` | C-5 — 440 tests / 58 files. 영역별 테스트 파일 분포: `packages/contracts` 8 · `apps/web/src/mocks` 3 · `packages/ui/src/feedback`(공통 상태) 5 · `packages/design-tokens` 3 · `shared/api` 2 · `app/{router,error,guards,layouts,providers}` 5. contracts·Mock·상태 컴포넌트 테스트가 모두 포함되어 있다 |
| AC-1-05 | `PASS` | C-6 · C-7 — 두 모드 모두 exit 0 |
| AC-1-06 | `PASS` | `.nvmrc` `24.21.0` · `engines.node` `>=24.21.0 <25` · `packageManager` `pnpm@12.4.2`. 실행 환경 `node -v` = v24.21.0, `pnpm -v` = 12.4.2 — 전부 일치 |

### 4.2 Scope 준수

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-07 | `PASS` | `git ls-files \| grep -E '^(apps/api\|supabase\|apps/mobile)'` → 0건. `git status --porcelain` 동일 패턴 → 0건 (untracked 도 없음). `ls -d apps/api supabase apps/mobile` → 3건 모두 "No such file or directory". `ls apps/` = `web` 만 |
| AC-1-08 | `PASS` | `apps/web/src/features/` 는 `README.md` **1개뿐**(구현 0). `apps/web/src/pages/` 는 `placeholder` · `not-found` 2개뿐. `apps/web/src/mocks/` 도메인은 `health` 하나뿐 — auth·children·onboarding·activities·library·sessions·recordings·analysis·reports·notifications·data-management **stub 조차 없음** (§16 D-8 준수). router 는 `/` (placeholder) · `*` (NotFound) · `/__dev/ui/*` (dev 전용) 3개. `TabLayout` 은 존재하나 route 에 **미마운트** (Stage 3 예정) |
| AC-1-09 | `PASS` | C-4 — dependency-cruiser `no dependency violations found (236 modules, 593 dependencies cruised)`. 보강 grep: `packages/ui` 에서 `@haru/contracts` import **0건** |

### 4.3 Design Token · Figma 정합

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-10 | `PASS` | `apps/web/src` + `packages/ui/src` 대상 `#hex` / `rgb()` / `rgba()` grep **0건**. Tailwind arbitrary value(`bg-[`, `p-[`, `rounded-[` 등) grep **0건**. `style={{ }}` 5건은 전부 dev 전용 `ui-gallery/TokensPage.tsx` 이며 값이 `var(--token)` 참조 — 리터럴 수치 0건 |
| AC-1-11 | `PASS` | `src/theme.css` 가 `@theme static` 에서 `--color-*`·`--font-*`·`--text-*`·`--font-weight-*`·`--radius-*`·`--shadow-*`·`--inset-shadow-*`·`--blur-*`·`--ease-*`·`--breakpoint-*`·`--animate-*` **11종 네임스페이스를 `initial` 로 초기화**. `@theme` 선언은 `semantic/*.css`(color·space·material·radius·typography·motion·shadow)에만 존재하고 `primitive/color.css`·`component/index.css` 에는 **없음**. `packages/design-tokens/__tests__/token-tiers.test.ts` 가 tier 참조 방향(Primitive→참조 0 · Semantic→Primitive만 · Component→Semantic만)을 assertion 으로 보증 |
| AC-1-12 | `PASS` | 토큰 내 `provisional: P-xx` 고유 ID = **P-01…P-09, P-11…P-16 (15건)**. `docs/decisions/stage-0-approvals.md` §4 표는 P-01~P-16 (16건)이며 **P-10 은 토큰이 아닌 디자인 명세** — AC 가 명시한 제외 대상. 1:1 일치. 빌드 로그 `[build-tokens] provisional 71 개 토큰 / 15 항목` 이 같은 수를 보고 |
| AC-1-13 | `PASS` | `--font-sans:` **정의는 `packages/design-tokens/src/semantic/typography.css:20` 단 1곳**(나머지 22건은 `var(--font-sans)` 사용). stack = `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` — `system-ui` **미포함**(주석에만 등장). `git ls-files \| grep -iE '\.(ttf\|otf\|woff\|woff2)$'` → **0건** (SF Pro 파일 없음) |
| AC-1-14 | `PASS` | 빌드 산출물에 `apps/web/dist/assets/fonts/inter-latin-wght-normal.woff2` (self-host) 존재. **QA 자체 실행(C-10)**: 6개 gallery route 순회 중 `127.0.0.1` 외 도메인 요청 **0건**. e2e `scenarios.spec.ts:127` 도 동일 결과 |
| AC-1-15 | `PASS` | `primitive/color.css` — `--haru-palette-pink: #efc3d4` · `--haru-palette-green: #90bfad` · `--haru-palette-cyan: #a0ccdd` · `--haru-palette-purple: #c9b8d4` → 결정 #19 와 **정확히 일치**. `semantic/color.css:140-143` 에서 `--color-capability-*-chart: var(--color-capability-*-bg)` 로 **배지와 차트가 같은 토큰**을 본다. `token-tiers.test.ts` 가 이를 assertion 으로 보증 |
| AC-1-16 | `PASS` | `src/color-scheme.css` — `:root { color-scheme: light; }`. `prefers-color-scheme` grep → 토큰·UI·앱 코드 **0건**. `dark` 문자열은 `dev/ui-gallery/contrast.ts` 의 대비 계산 지역변수 2건뿐 |
| AC-1-17 | **`FAIL` → Stage Verdict 는 `PASS (accepted: D-01)`** | `--color-action-primary-bg` = `--haru-palette-teal` = `#85bfb6`. QA 직접 계산: 흰 라벨 대비 = **2.074:1** (< 4.5 AA). 토큰·컴포넌트 CSS 9곳에 `/* accepted deviation: D-01 (white label on teal = 2.07:1, approvals §3) */` 주석 존재. e2e `a11y.spec.ts` 가 A-1 행 ratio < 4.5 를 assertion 으로 고정. Plan §11.3 AC-1-17 및 `.claude/rules/qa.md` §2 지시대로 **요구사항은 FAIL 로 기록하되 Stage Verdict 계산에서는 사용자 사전 수용 항목**으로 처리 |

### 4.4 Shared UI · 공통 상태 · 접근성

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-18 | `PASS` | Plan §9.3 의 22 그룹 전부 존재 — `packages/ui/src/index.ts` 가 **31개 컴포넌트**를 export (Text · Icon · Surface · AppBackground · Button · ButtonGroup · IconButton · TopBar · AppColumn · BottomTabBar · Spinner · Skeleton · ErrorState · EmptyState · InlineAlert · Toast · ToastProvider · TextField · FieldGroup · Checkbox · CheckboxGroup · Tag · Chip · RadioGroup · ProgressBar · PageIndicator · SpeechBubble · Sheet · Scrim · Dialog · ConfirmDialog). Button 8 state: `variant` accent/glass × `rest`/`hover`(`:hover:not(:disabled)`)/`pressed`(`:active:not(:disabled)`)/`disabled`(`:disabled`)/`focus`(`:focus-visible`)/`loading`(`.haru-button--loading` + `aria-busy`, native disabled 미사용으로 포커스 유지). 컴포넌트 단위 테스트 22개 파일 존재. gallery 렌더 확인: e2e baseline `v1-button.png` 외 |
| AC-1-19 | `PASS` | dev gallery `/__dev/ui/states` 에 6종 전부 존재 (`StatesPage.tsx` — §5.1 Loading(Skeleton) · §5.2 Empty · §5.3 Error · §5.4 Offline Banner · §5.5 Toast · §5.6 Dialog). 정적 4종은 실화면 컨텍스트(TopBar 포함) baseline 으로 고정: `v9-state-loading` · `v9-state-empty` · `v9-state-error` · `v9-state-offline`. **인터랙티브 2종은 QA 가 직접 캡처**(C-10): `docs/qa/evidence/qa-dialog.png` (ConfirmDialog — scrim + `role="alertdialog"` + Delete/Keep), `docs/qa/evidence/qa-toast.png` (Toast — "Saved" + Undo + 닫기, `aria-live` 영역 2개 확인) |
| AC-1-20 | `PASS` | e2e `a11y.spec.ts` 통과 (C-9). focus tour 의 모든 인터랙티브 요소에 대해 ① 접근성 이름 비어있지 않음 ② `outlineStyle !== 'none'` ③ `outlineWidth > 0` 을 루프로 assertion. 별도 테스트로 **마우스 클릭 시 outline 미표시**(`:focus-visible` 만)를 보증해 focus 표시가 형식적이지 않음을 확인. 제스처 전용 조작 없음 — `S1-G-1` 로 PageIndicator `interactive` 가 폐기되어 클릭 전용 잔재도 제거됨 |
| AC-1-21 | **`PASS (accepted: S1-G-2)`** | e2e `a11y.spec.ts` 의 touch-table 검사에서 44×44 미달 요소가 **정확히 `['div · Password']` 1건**(TextField 행, `--field-row-height: 42`). 이 항목은 `docs/decisions/stage-1-approvals.md` §8 `S1-G-2` 로 **사용자가 수용**했고 "QA 는 `PASS (accepted: S1-G-2)` 로 기록한다" 고 명시되어 있다. IconButton 은 시각 38px 이나 `data-hit="44x44"` 로 hit area 44 확보 확인. Checkbox 행은 `min-block-size: var(--size-touch-min)` 으로 통과 |
| AC-1-22 | `PASS` | e2e `responsive.spec.ts` 통과 (C-9). ① `reducedMotion: 'reduce'` 에서 `.haru-skeleton`/`.haru-spinner` 및 하위 요소의 `getAnimations()` 중 `playState === 'running'` 이 **0개** ② **역방향 검증** — `no-preference` 에서는 running > 0 (규칙이 실제로 동작함을 증명, 단순 미적용이 아님) ③ 320px 에서 `html { font-size: 200% }` 적용 후 `scrollWidth - clientWidth <= 0` |
| AC-1-23 | `PASS` | e2e `responsive.spec.ts` 4 viewport 전부 통과 — 320→column 320/content 272 · 393→393/345 · 600→**480**/432 · 1024→**480**/432. 각 폭에서 가로 스크롤 0. 1024px 에서 앱 컬럼 좌우 여백 차 ≤ 1px (가운데 정렬) 이며 `left > 0`. 다단 레이아웃 없음. 시각 baseline `frame-320/393/600/1024.png` 병행 |
| AC-1-24 | `PASS` (차이 2건 기록 → QA-1-002 · QA-1-003) | Figma 대조 baseline **10건** 생성·통과 (`v1-button` · `v2-surface` · `v2-material` · `v3-tab-bar` · `v4-tag-chip` · `v5-field` · `v6-bubble` · `v7-progress` · `v8-color-semantic` · `v8-typography`) + 명세 기준 12건 + 반응형 5건 = **27건**. **QA 가 직접 Figma screenshot 을 받아 대조**(§4.6 표) — V-1 `17:20` · V-2 `17:343`/`17:332` · V-3 `25:87` · V-4 `76:440` · V-5 `76:417` · V-6 `88:721` · V-7 `88:789`. 허용 차이 AD-1·AD-2·AD-9 범위(폰트·weight·더미 문구) 외의 구조·색·radius 불일치는 발견되지 않았고, 범위 밖 차이 1건(QA-1-002)과 baseline 품질 문제 1건(QA-1-003)을 기록했다 |
| AC-1-25 | `PASS` | `TabBarDemo.tsx` items = `library`(Library) · `home`(Home, 가운데) · `progress`(Progress) — **Session 탭 없음** (#15 D-02). `packages/ui/src/tab-bar/BottomTabBar.tsx` 에 `Library`/`Home`/`Progress` 문자열 **0건**, `@haru/contracts` import **0건** → 도메인 지식 없이 `items` prop 주입. 아이콘은 `S1-D2-5` 확정대로 `book` / `chart-no-axes-column-increasing`. Figma `25:87` 대조 결과 3 variant 의 중앙 돌출·활성 라벨 weight·색 일치 |
| AC-1-26 | `PASS` | Router: `/`(StackLayout + RouteGuard + PlaceholderPage) · `*`(NotFoundPage) · `/__dev/ui/*`(dev 전용, `import.meta.env.DEV` 상수 접힘). Layout 3종 + AppShell: `StackLayout` · `TabLayout` · `FullscreenLayout` · `AppShell`. Error Boundary **2단**: `AppErrorBoundary` + `RouteErrorBoundary`(공통 `ErrorBoundary`). RouteGuard shell 존재. 테스트가 동작을 보증 — "AppErrorBoundary 는 오류를 ErrorState 로 렌더한다" · "복구 버튼은 주입된 reload 를 호출한다" · "RouteErrorBoundary 는 화면 내용만 ErrorState 로 바꾸고 재시도로 복구한다" · RouteGuard allow/pending/redirect 3분기. router 테스트 3건 통과 |
| AC-1-27 | `PASS` | `import.meta.env.VITE_API_MODE` 를 **값으로 읽는 곳은 `apps/web/src/app/providers/apiClients.ts:18` 단 1곳**. 나머지 참조는 전부 주석 또는 타입 선언(`vite-env.d.ts`). `MockHealthApi`/`HttpHealthApi` 를 Component·Page·Feature·Query hook 이 직접 참조하는 곳 **0건** — `useHealth` 는 `useApiClients()` 로 주입만 받는다 |
| AC-1-28 | `PASS` | `apps/web/src/pages/` 전체(`PlaceholderPage.tsx`·`NotFoundPage.tsx`)에 `fetch` / `Api` / `useQuery` / `useMutation` grep **0건**. Mock fixture import 0건 |
| AC-1-29 | `PASS` | 경로 성립: `useHealth` → `useApiClients().health` → `MockHealthApi \| HttpHealthApi`. **동일 소스 트리에서 환경 변수만 바꿔 두 모드 빌드 성공**(C-6·C-7) → UI·Feature·Query 코드 변경 0줄. `app/providers/__tests__` 가 "clients 주입이 없으면 선택 지점이 스스로 Adapter 를 고른다" · "Mock 집합도 같은 `ApiClients` 타입으로 들어간다" 를 assertion |
| AC-1-30 | `PASS` | `HttpHealthApi` 가 `HealthResponseSchema` 를 `client.request({ schema })` 로 전달해 parse. `httpClient.ts:65` — `if (url.protocol !== 'https:') throw`. 테스트가 `https://…` 수용 + `http://api.example.invalid/v1` 및 `http://localhost:3000/v1` 거부(`/https:/` 메시지)를 보증 |

### 4.5 Router · Layout · Adapter → §4.4 표에 AC-1-26 ~ AC-1-30 포함

### 4.6 contracts

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-31 | `PASS` | `packages/contracts/src/__tests__/enums.test.ts` 의 `ENUM_SNAPSHOTS` 가 **23종**을 값 배열로 고정: Capability · SessionStatus · SessionMode · CompletedReason · AnalysisOutcome · UploadStatus · ReadingContext · ConsentType · ConsentAction · Gender · SurveyAnswerValue · ParentVerificationStatus · AnalysisJobStatus · ReportEligibility · ReportStatus · ActivityOptionKind · BookOwnership · GiftRequestStatus · CaregiverRelationship · OnboardingStep · DeletionScope · DeletionRequestStatus · NotificationKind. AC 명시 3항목 직접 확인 — `ConsentActionSchema = z.enum(['granted'])` ✓ · `AnalysisOutcomeSchema = z.enum(['full','excluded_low_quality'])` (`skipped_*` 없음) ✓ · `GenderSchema` 3값 + `GenderFieldSchema = GenderSchema.nullable()` ✓. Capability 값은 `emotion_regulation`·`self_directed_agency`·`cognitive_flexibility`·`intrinsic_motivation` (#13 일치) |
| AC-1-32 | `PASS` | `SESSION_TRANSITIONS` **12행** 확인 (ready→recording/completed/abandoned×2 · recording⇄paused · recording/paused→completed · completed→analyzing · analyzing→analyzed/failed · failed→analyzing). 테스트: "전이 표는 12 행이다" · "중복 행이 없다" · "표의 12 행이 modes 전개 기준 14 조합을 허용한다"(전부 true) · **"표에 없는 모든 조합은 false 다 (전수 검사)"** — 대표 비허용 전이뿐 아니라 전 조합을 검사하므로 AC 요구를 초과 충족 |
| AC-1-33 | `PASS` | `report-eligibility.test.ts` 경계 매트릭스: (3599,2)→`insufficient_both` · (3599,3)→`insufficient_recorded_minutes` · (3600,2)→`insufficient_recorded_sessions` · (3600,3)→`eligible` · (0,0)→`insufficient_both`. 4가지 반환값 전부 커버. "반환값은 항상 ReportEligibility enum 값" · "`cycle_in_progress` 는 반환하지 않는다" · 순수 함수성도 assertion |
| AC-1-34 | `PASS` | `MAX_RECORDED_SECONDS = 30 * 60` (=1800) · `READY_ABANDON_SECONDS = 10 * 60` (=600) · `MIN_REPORT_RECORDED_SESSIONS = 3` · `MIN_REPORT_RECORDED_SECONDS = 3600` · `REPORT_CYCLE_DAYS = 28` — 결정 #17 과 일치. 테스트가 상수값을 직접 assertion |
| AC-1-35 | `PASS` | `ERROR_CODES` **28종** (grep count 28). `error-envelope.test.ts` 가 Envelope schema parse/reject 와 `expect(ERROR_CODES).not.toContain('TRIAL_ACCOUNT_RESTRICTED')` + `ErrorCodeSchema.safeParse('TRIAL_ACCOUNT_RESTRICTED').success === false` 를 보증 (C-12). `error-codes.ts` 주석에도 재추가 금지가 명시 |
| AC-1-36 | `PASS` | `packages/contracts/package.json` `dependencies` = **`zod` 단 1개**. `apps/web`·`packages/ui` 에 `z.object(` / `z.enum(` 선언 **0건**(테스트 helper 1건 제외), Health 관련 API 타입 재선언 0건 — `HealthResponse`·`ErrorCode` 는 `@haru/contracts` 에서 import. `HealthApi`(client interface)·`HealthScenarioKey`(mock 전용)·`HealthQueryKey` 는 contract schema 가 아니므로 중복 선언이 아니다 |

### 4.7 Mock Infrastructure

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-37 | `PASS` | `MockHealthApi` 가 성공 응답을 fixture → `parseResponse(HealthResponseSchema)` 로 통과시키고, 오류는 contracts Error Envelope → `HaruApiError` 로 만든다. `mocks/__tests__/MockHealthApi.test.ts` 가 scenario 별 parse 를 검증 |
| AC-1-38 | `PASS` | e2e `scenarios.spec.ts` 5건 전부 통과(C-9) — `success`→정상 콘텐츠 · `loading`→Skeleton · `error`→ErrorState + Retry · `offline`→Offline Banner · `retry`→1회차 실패 후 재시도 성공. 각각이 **UI 상태**를 assertion 하므로 Mock 단독 테스트가 아니다 |
| AC-1-39 | `PASS` | e2e "같은 scenario 를 두 번 열면 같은 응답 바이트가 표시된다" 통과. `apps/web/src/mocks/` 전체에서 `Date.now()` / `Math.random()` / `new Date()` **직접 호출 0건**(주석에서만 언급) — 시간·ID·지연은 `clock`·`idFactory`·`timer` 로 주입. scenario store 는 그룹별 attempt 카운터만 보유해 호출 순서가 같으면 결과가 같다 |
| AC-1-40 | `PASS` | `HEALTH_SCENARIO_KEYS = ['success','loading','error','retry','offline']` — API_CONTRACTS §5.4 machine key 만 사용. `'default'` / `'slow'` / `'upload-success'` grep 결과 **제품 코드 0건**, 유일한 등장은 `MockHealthApi.test.ts:29` 의 **alias 거부 negative test** |
| AC-1-41 | `PASS` | `fixtures` 문자열이 `apps/web/src/mocks/` **밖에서 0건**. fixture 는 `mocks/fixtures/health.ts` 에만 존재하고 Component·Page·Feature 하드코딩 0건 |
| AC-1-42 | `PASS` | C-8 `assert:no-mocks` 3개 sentinel 전부 0건. **QA 자체 grep**: `VITE_API_MODE=http` 빌드의 `dist/**/*.{js,css,html}` 에서 `MockHealthApi`·`ScenarioPanel`·`__dev/ui`·`haru-dev-` **0건**, 나아가 `.js.map` 에서도 `MockHealthApi` **0건**. 빌드 산출물 자체가 mock 청크 없이 단일 index 청크(C-7 vs C-6 비교) |

### 4.8 Privacy · Security

| AC | 판정 | 증거 |
|---|---|---|
| AC-1-43 | `PASS` | 추적되는 env 파일은 `.env.example` 하나뿐이며 내용은 공개 값 3종(`VITE_API_BASE_URL`·`VITE_API_MODE`·`VITE_MOCK_SCENARIO`)과 Secret 금지 주석. 코드에서 사용되는 `VITE_*` 도 정확히 이 3종. `service_role` / `sk-…` / `api_key='…'` / `secret='…'` 패턴 grep **0건** |
| AC-1-44 | `PASS` | 런타임 의존성 전수: `apps/web` = react · react-dom · react-router · @tanstack/react-query · zod + workspace 3종. `packages/ui` = lucide-react 1.47.0 + `@haru/design-tokens`. **광고·제3자 분석 SDK 0건**. **QA 자체 실행(C-10)**: 6개 route 순회 중 외부 도메인 요청 **0건** |
| AC-1-45 | **`PASS`** (1회차 `PARTIAL` → 2회차 해소) | **① logger** — `shared/lib/logger.ts` 가 `ALLOWED_CONTEXT_KEYS` 화이트리스트(11키)로 그 밖의 키를 런타임에서 제거하고 값은 primitive 만 허용하며, 이벤트 이름은 `^[a-z][a-z0-9_]*$` 로 제한한다. 출력은 dev 에서만 하고 원격 transport 가 없다 (`logger.test.ts`). **② `console.*` 직접 호출 lint 제한 — 2회차에 QA 가 직접 재현**(C-11b): `no-console` 이 `packages/config/eslint/base.js:110` 에서 **옵션 없는 `'error'`** 가 되어, `console.error/warn/log/info/debug` **5종 전부**가 `apps/web`(app·pages·features·entities·shared·mocks)·`packages/ui`·`packages/contracts` 어느 경로에서도 **5/5 차단**된다. 허용은 루트 `eslint.config.js` `haru/console-allowlist` 의 **파일 2개**(`apps/web/src/shared/lib/logger.ts`, `packages/ui/src/lib/devWarn.ts`)뿐이며 **같은 디렉토리의 다른 파일은 차단**된다(`shared/lib/other.ts` 5/5, `ui/src/lib/other.ts` 5/5). **③ 우회 호출 제거** — `Icon.tsx:39` 의 직접 `console.warn` 이 `devWarn()` 호출로 바뀌었고, 저장소 전수 grep(C-12b) 결과 제품 소스의 `console.` 접근 지점은 **허용 2개 파일뿐**이다. `devWarn` 은 고정 문구 리터럴 유니온 + `sanitizeToken` 으로 자유 입력을 무력화한다. **④ 자동 고정** — `packages/config/__tests__/no-console-invariant.test.ts` 가 실제 eslint 실행 + 저장소 스캔으로 이 불변 규칙을 테스트로 고정한다(C-5 에 포함, 통과). **⑤ 주석 정정 확인** — `logger.ts` 머리주석이 "예외는 경로 2개" 로 수정되어 **사실과 일치**한다 (1회차 FAIL 근거 소멸). 잔여 Low 관찰 1건은 QA-1-004 |

---

## 5. Findings

| ID | Severity | 1회차 | 2회차 |
|---|---|---|---|
| QA-1-001 | Medium | 미해결 (AC-1-45 `PARTIAL` 원인) | **RESOLVED** — 재현 실패 |
| QA-1-002 | Low | 기록 | **유지** (미수정 · 사용자 결정 대기) |
| QA-1-003 | Low | 기록 | **유지** (미수정) |
| QA-1-004 | Low | — | **신규** (AC 판정 영향 없음) |

### QA-1-001 | Severity: Medium — **RESOLVED (2회차 재검증에서 해소 확인)**

> **2회차 상태: `RESOLVED`.** 아래 1회차 기록은 그대로 보존하고, 재검증 결과를 블록 뒤에 덧붙인다.


```
Requirement: AC-1-45 (PRD §11 NFR 프라이버시 · .claude/rules/architecture.md §9)
Steps to reproduce:
  1. cd /Users/soojin/dev/haru
  2. printf 'export function leak(childName: string) {\n  console.error("child", childName);\n  console.warn("transcript", childName);\n  console.log("blocked", childName);\n}\n' \
       | npx eslint --stdin --stdin-filename apps/web/src/features/probe.ts
Expected:
  PII 가 섞일 수 있는 console 직접 호출이 제품 코드에서 lint 로 차단되고,
  로그는 PII 금지 logger 를 거치도록 강제된다.
Actual:
  3줄 중 `console.log` 1줄만 error 로 보고된다 (exit 1, 1 problem).
  `console.error(...)` · `console.warn(...)` 은 통과한다 —
  packages/config/eslint/base.js:106 의 `'no-console': ['error', { allow: ['warn','error'] }]` 때문.
  그 결과 logger 를 우회하는 직접 호출이 실제로 존재한다:
    packages/ui/src/icon/Icon.tsx:39 → console.warn(`[haru/ui] Icon "${name}" …`)
  이 호출 자체의 인자는 icon name 이라 현재 PII 유출은 아니지만,
  apps/web/src/shared/lib/logger.ts 머리주석이 선언한 불변 규칙
  "저장소에서 console 에 직접 접근하는 곳은 이 파일 하나뿐 / 나머지 앱 코드는 no-console 로 차단된다"
  는 성립하지 않는다. Stage 2 이후 아이 이름·transcript·오디오 경로를 다루기 시작하면
  가장 흔한 누출 경로(console.error(err), console.warn(값))가 무방비로 열려 있다.
Evidence:
  · C-11 eslint --stdin 실행 출력
  · packages/config/eslint/base.js:106
  · packages/ui/src/icon/Icon.tsx:39
  · apps/web/src/shared/lib/logger.ts 머리주석
Suspected area (수정 지시 아님):
  packages/config/eslint/base.js (no-console 허용 목록),
  packages/ui/src/icon/Icon.tsx (logger 우회 호출),
  apps/web/src/shared/lib/logger.ts (주석이 보장하지 못하는 내용을 단언)
```

**2회차 재검증 결과 (QA 직접 실행 — 구현자 보고를 증거로 쓰지 않았다)**

1회차와 **동일한 프로브 소스**(`console.error("child", childName)` · `console.warn("transcript", childName)` · `console.log` · `console.info` · `console.debug` = 5줄)를 `eslint --stdin` 으로 12개 경로에 넣었다. 프로브는 **stdin 으로만** 전달했고 저장소에 파일을 만들지 않았다.

| 경로 | 성격 | no-console 검출 | 기대 |
|---|---|---|---|
| `apps/web/src/features/probe.ts` | 제품 | **5 / 5** | 차단 ✓ |
| `apps/web/src/pages/probe.tsx` | 제품 | **5 / 5** | 차단 ✓ |
| `apps/web/src/app/probe.ts` | 제품 | **5 / 5** | 차단 ✓ |
| `apps/web/src/entities/probe.ts` | 제품 | **5 / 5** | 차단 ✓ |
| `apps/web/src/mocks/probe.ts` | 제품 | **5 / 5** | 차단 ✓ |
| `apps/web/src/shared/lib/other.ts` | 허용 파일의 **형제** | **5 / 5** | 차단 ✓ (허용이 디렉토리 단위가 아님) |
| `packages/ui/src/probe.ts` | 제품 | **5 / 5** | 차단 ✓ |
| `packages/ui/src/lib/other.ts` | 허용 파일의 **형제** | **5 / 5** | 차단 ✓ |
| `packages/ui/src/icon/Icon2.tsx` | 제품(원 위반 지점) | **5 / 5** | 차단 ✓ |
| `packages/contracts/src/probe.ts` | 제품 | **5 / 5** | 차단 ✓ |
| `apps/web/src/shared/lib/logger.ts` | **허용 1** | **0 / 5** | 통과 ✓ |
| `packages/ui/src/lib/devWarn.ts` | **허용 2** | **0 / 5** | 통과 ✓ |

- 1회차 `Actual`("3줄 중 `console.log` 1줄만 error") 은 **재현되지 않는다**. `console.error` · `console.warn` 도 error 로 보고된다.
- 저장소 전수 grep(C-12b): 제품 소스의 `console.` 직접 접근 = `logger.ts` 3줄 + `devWarn.ts` 1줄 = **허용 목록과 정확히 일치**. `Icon.tsx` 의 우회 호출은 사라졌다.
- 1회차 FAIL 의 두 번째 근거였던 **`logger.ts` 머리주석의 허위 단언**도 수정되어 현재 설정과 일치한다.
- 회귀 방지: `packages/config/__tests__/no-console-invariant.test.ts` 가 ① 실제 eslint 실행(제품 경로 5종 차단 / 허용 경로 0 / 형제 파일 차단) ② 저장소 스캔(허용 목록 정확 일치) 을 테스트로 고정한다. QA 가 이 테스트가 **실제로 검증하는지** 파일을 읽어 확인했고, C-5 에서 통과했다.

증거: `docs/qa/evidence/qa-1-001-no-console-probe.txt` · `docs/qa/evidence/qa-1-001-console-scan.txt` · C-3 · C-5.

→ **AC-1-45 = `PASS`.** (1회차의 "사용자 명시 수용" 대안 경로는 더 이상 필요하지 않다.)

### QA-1-002 | Severity: Low

```
Requirement: AC-1-24 (Figma 시각 비교 — V-5 `76:417`)
Steps to reproduce:
  1. Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` node 76:417 screenshot 확인 — "Show" 텍스트 버튼
  2. e2e/__screenshots__/darwin/visual.spec.ts/v5-field.png 의 Password 행 "Show" 확인
Expected:
  Figma 76:417 의 trailingAction "Show" 는 밑줄 없이 teal 계열 색으로만 구분된다.
  Design Spec §4.13 trailingAction 항목도 `--text-footnote` + `--color-fg-link` + hit area 44 만 규정하고
  text-decoration 을 규정하지 않는다.
Actual:
  구현은 packages/ui/src/field/TextField.css:94 에서 `text-decoration: underline` 을 적용한다.
  §10.3 허용 차이 AD-1~AD-10 중 어디에도 해당하지 않는 범위 밖 차이다.
Evidence:
  · Figma screenshot (node 76:417) ↔ v5-field.png 대조
  · packages/ui/src/field/TextField.css:94
  · docs/design/stage-1-design-spec.md §4.13
Suspected area (수정 지시 아님):
  packages/ui/src/field/TextField.css (.haru-text-field__action)
  또는 docs/design/stage-1-design-spec.md §4.13 (의도된 선택이면 명세에 근거 추가 — design-agent 소관)
```

> 판단 보류 사항: 밑줄은 WCAG 1.4.1(색만으로 구분 금지) 관점에서 **개선**일 수 있다. 어느 쪽이 맞는지는 Figma(Visual Source of Truth) vs 접근성 기준의 우선순위 결정이 필요하므로 QA 가 단독 판정하지 않고 기록만 한다. AC-1-24 는 "차이가 기록된다" 를 요구하므로 이 항목 때문에 AC 가 FAIL 이 되지는 않는다.

### QA-1-003 | Severity: Low

```
Requirement: AC-1-24 (시각 baseline 품질)
Steps to reproduce:
  1. e2e/__screenshots__/darwin/visual.spec.ts/v5-field.png 확인
Expected:
  `data-demo` 블록 스크린샷에는 해당 데모만 담겨 회귀 탐지에 쓰인다.
Actual:
  gallery 의 고정(floating) 내비게이션 pill 행("HARU dev / Tokens / Components / States / Responsive /
  Accessibility")과 우하단 "scenario" FAB 가 demo 블록 위에 겹쳐 캡처되어 있다.
  겹친 영역만큼 실제 컴포넌트 픽셀이 가려져 그 부분의 회귀를 탐지하지 못한다.
Evidence:
  · e2e/__screenshots__/darwin/visual.spec.ts/v5-field.png (중앙부 nav 오버레이, 우하단 scenario FAB)
Suspected area (수정 지시 아님):
  apps/web/src/dev/ui-gallery/GalleryLayout.tsx · apps/web/src/dev/scenario-panel/*
  (시각 비교 시 dev chrome 을 숨기는 처리), 또는 e2e/visual.spec.ts 캡처 전처리
```

### QA-1-004 | Severity: Low — **신규 (2회차)**

```
Requirement: AC-1-45 (부수 관찰 — AC 판정을 바꾸지 않는다. AC-1-45 는 PASS)
Steps to reproduce:
  1. packages/ui/src/lib/devWarn.ts 머리주석 "왜 여기에는 PII 가 들어올 수 없는가" ②항과
     sanitizeToken() 의 정규식을 대조한다
  2. VITE_API_MODE=http pnpm build 후
     grep -o '.\{160\}haru/ui.\{160\}' apps/web/dist/assets/index-*.js
Expected:
  주석이 선언한 살균 규칙이 구현과 일치하고, 개발자 경고는 apps/web 의 logger 처럼
  production 에서 무력화된다.
Actual:
  (a) 주석은 "`[A-Za-z0-9:_-]` 밖의 문자를 `_` 로 바꾼다" 고 쓰여 있으나
      실제 구현은 /[^\w:.-]/g 이라 마침표(`.`)도 그대로 통과한다.
  (b) 주석의 "여기에는 PII 가 들어올 수 없다" 는 실제 보장보다 강한 표현이다.
      sanitizeToken 은 PII 필터가 아니라 형식 정규화이며, 공백 없는 단일 토큰
      (예: 아이 이름 "Mia")은 원형 그대로 출력된다. 실질적 보장은
      "고정 문구 리터럴 유니온 + 호출 지점이 개발자 식별자만 넘긴다" 는 호출면 제약이고,
      현재 유일한 호출자 Icon.tsx 는 icon name 만 넘긴다 → 지금 PII 유출은 없다.
  (c) devWarn 은 import.meta.env.DEV 게이트가 없어 production 번들에 포함·실행된다
      (http 빌드 index-*.js 에 console.warn(`[haru/ui] …`) 존재).
      apps/web/src/shared/lib/logger.ts 가 production no-op 인 것과 대비된다.
      단 1회차의 Icon.tsx console.warn 과 동일한 동작이므로 **회귀는 아니다**.
Evidence:
  · packages/ui/src/lib/devWarn.ts (머리주석 ② · sanitizeToken · devWarn 본문)
  · C-14b — http 빌드 번들 내 `[haru/ui]` 문자열과 console.warn 호출 확인
  · packages/ui/src/lib/__tests__/devWarn.test.ts — "Mia said she was scared" →
    "Mia_said_she_was_scared" 로 남는 것을 테스트 스스로 보여준다
Suspected area (수정 지시 아님):
  packages/ui/src/lib/devWarn.ts (주석 문구 정확도 · 허용 문자 집합 · dev 게이트 여부)
```

> 판정에 미치는 영향: 없음. AC-1-45 는 "PII 금지 규칙의 logger 강제 + `console.*` 직접 호출 lint 제한" 을 요구하며 두 조건 모두 충족된다(§4.8). 이 항목은 Stage 2 에서 아이 이름·transcript 를 다루기 시작하기 전에 문구/게이트를 정리할 것을 권고하는 기록이다.


---

## 6. NOT VERIFIED 항목과 수동 테스트 절차

**없음.** Stage 1 의 45개 AC 는 전부 에이전트 환경에서 실행 가능한 범위였고, `.claude/rules/qa.md` §4 의 공통 실행 명령 8종을 모두 직접 실행했다 (§3 C-1 ~ C-9).

참고 — Recording Client 체크리스트(`.claude/rules/qa.md` §5 "Recording Client (Stage 4 이후)")와 실기기(iOS/Android) 검증은 **Stage 1 범위 밖**이므로 판정 대상이 아니다. Stage 1 에는 녹음 코드가 존재하지 않는다(AC-1-08 증거 참조).

---

## 7. BACKEND_INTEGRATION_PENDING 목록

**없음 (0건).**

| 확인 항목 | 결과 |
|---|---|
| Stage 1 Plan §10 | "Stage 1 에는 Backend Handoff 요구사항 [HO] 항목이 없다" |
| Plan §11 머리말 | 각 AC 의 "PENDING 예상" 전부 `No` |
| QA 실측 | `health` 도메인까지 Mock 으로 닫히며, `HttpHealthApi` 는 contracts parse + `https:` 강제 골격으로 단위 테스트까지 완결(AC-1-30). 실제 서버 연동은 Stage 1 AC 의 검증 대상이 아님 |

Stage 8 Handoff 문서에 이월할 Stage 1 발 PENDING 항목은 없다.

---

## 8. Regression 결과

Stage 1 은 **최초 구현 Stage** 이므로 이전 Stage AC 재실행 대상이 없다. 대신 전체 스위트를 직접 실행했다.

### 8.1 1회차

| 대상 | 결과 |
|---|---|
| 전체 단위/컴포넌트 테스트 | `pnpm test` — **440 / 440 통과, 58 / 58 파일** (C-5) |
| 전체 E2E | `pnpm test:e2e` — **50 / 50 통과** (C-9) |
| 시각 baseline 회귀 | 27건 전부 임계값(`maxDiffPixelRatio 0.002` + `maxDiffPixels 200`) 내 통과 |
| 타입·린트·경계 | typecheck 통과 · lint 오류 0/warning 0 · dependency-cruiser 위반 0 (C-2·C-3·C-4) |
| 빌드 재현성 | mock·http 2모드 빌드 성공 + `assert:no-mocks` 통과 (C-6·C-7·C-8) |

### 8.2 2회차 — QA-1-001 수정이 다른 AC 를 깨뜨렸는지 (수정이 건드린 영역 집중)

| 영역 | 확인 방법 | 결과 |
|---|---|---|
| **lint 설정 전반** (`no-console: 'error'` 강화) | C-3 `pnpm lint` 전체 실행 | **오류 0 · warning 0** — 출력이 `$ eslint .` 한 줄. 강화된 규칙이 기존 제품 코드·툴체인 코드를 깨지 않았다. `**/scripts/**` · `*.config.*` 는 `haru/tooling-files` 예외로 계속 허용되며(빌드 스크립트 console 사용) 실제 lint 통과로 확인 |
| 같은 설정의 **다른 규칙** 회귀 | C-3 + C-2 | `no-restricted-syntax`(HEX/rgb/arbitrary value) · `no-explicit-any` · `ban-ts-comment` 전부 위반 0 유지. 신규 `any`/`@ts-ignore` 0건 |
| **`packages/ui` Icon 접근성 경고 동작** | C-5 에 포함된 `packages/ui/src/icon/__tests__/Icon.test.tsx` | "warns at runtime when neither label nor decorative is given (JS consumers)" 가 **여전히 통과** — `devWarn` 경유로 바뀐 뒤에도 `console.warn` 이 정확히 1회 호출된다. 접근성 계약(`role="img"`+`aria-label` / `aria-hidden`)을 검증하는 나머지 Icon 테스트도 통과 |
| Icon 경고 **문구 품질** | `packages/ui/src/lib/__tests__/devWarn.test.ts` (신규 4건) | 고정 문구 + 살균 식별자 + 64자 절단 + subject 생략 케이스가 assertion 으로 고정됨. QA 가 테스트 내용을 읽어 요구사항을 실제로 검증하는지 확인 |
| **`packages/ui` 테스트 실행 범위 확대** (`*.test.tsx` → `*.test.{ts,tsx}`) | `find packages/ui/src -path '*__tests__*' -name '*.test.ts'` | `.ts` 테스트는 **신규 `devWarn.test.ts` 1개뿐**. 즉 **이전에 조용히 실행되지 않던 기존 테스트는 없었다**. 전체 카운트도 58→60 파일 / 440→452 테스트 = 신설분(config 1 + ui 1 파일, 12 테스트)과 **정확히 일치**하며 숨어 있던 실패가 드러나지 않았다 |
| **e2e · 시각 baseline** | C-9 + C-13b(파일 변경 시각 검사) | **50 / 50 통과**, baseline 27건 전부 임계값 내. 1회차 리포트 작성 시각 이후 `e2e/**` 의 spec·PNG 는 **하나도 변경되지 않았다** — baseline 을 다시 찍어 통과시킨 흔적 없음 |
| **경계 규칙** (`packages/ui` 가 앱 logger 를 쓰지 않고 자체 구현한 선택) | C-4 dependency-cruiser | 위반 0 (240 modules / 599 deps). `packages/ui → apps/web` import 0건 — `rules/architecture.md` §2 의존 방향 준수 |
| **번들 영향** | C-6 · C-7 | mock `index` 300.84→301.07 kB (+0.23 kB), http `index` 390.32→390.54 kB. `mocks` 청크 90.54 kB 동일, http 모드 mock 청크 없음 유지. `assert:no-mocks` 통과 |
| **Privacy 관련 AC 재확인** (AC-1-43·44) | grep + C-10 성격의 재확인 | Secret 0건 · 제3자 SDK 0건 유지(런타임 의존성 변화 없음 — 신규 파일은 패키지 내부 모듈). `devWarn` 은 원격 전송 없음 |

결론: **2회차에서 새로 깨진 AC 는 없다.** 1회차 판정은 AC-1-45 를 제외하고 전부 유지된다.

## 9. 남은 가값 (Provisional) 목록

`.claude/rules/qa.md` §2 — **가값은 FAIL 사유가 아니다.** 기록 목적이다.
`docs/decisions/stage-0-approvals.md` §4 운영 규칙 2 에 따라 Stage 1 구현 완료 후 Orchestrator 가 항목별로 사용자에게 `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지` 승인을 요청해야 한다.

| # | 항목 | 코드 반영 상태 |
|---|---|---|
| P-01 | 보조 텍스트 색 `--color-fg-secondary` | `semantic/color.css` — `provisional: P-01` (2곳) |
| P-02 | 비텍스트 요소 (진행 바·별점·칩 경계·배지 글자) | `semantic/color.css` — `provisional: P-02` (7곳) |
| P-03 | focus ring `--color-focus-ring` | `semantic/color.css` · `semantic/space.css` — `provisional: P-03` (3곳) |
| P-04 | status 색 (info/success/warning/error) | `primitive/color.css`(8) · `semantic/color.css`(16) |
| P-05 | scrim | `semantic/color.css` |
| P-06 | z-index 스케일 | `semantic/z-index.css` (5곳) |
| P-07 | motion duration / easing | `semantic/motion.css` |
| P-08 | safe-area inset 토큰 | `semantic/layout.css` |
| P-09 | 아이콘 크기 단계 `--size-icon-sm/md/lg` | `semantic/space.css` (3곳) |
| **P-10** | 공통 상태 화면·컴포넌트 상태 디자인 (#22) | **토큰 아님** — design-agent 명세. Stage 1 구현 완료 → **승인 요청 대상** |
| P-11 | glass·tinted 표면 위 `text-button` 라벨 대비 4.18–4.48:1 | `semantic/color.css` (2곳) |
| P-12 | `--radius-surface` 22 vs 24 | `semantic/radius.css` — Stage 1 채택값 **22** (S1-D2), 가값 유지 |
| P-13 | 화면 좌우 gutter 24 vs 26 | `semantic/space.css` — 채택값 **24** (S1-D2), 가값 유지 |
| P-14 | 배경 gradient stop 46% vs 52% | `semantic/color.css` — 채택값 **46%** (S1-D2), 가값 유지 |
| P-15 | 버튼 높이 56 vs 58 | `semantic/space.css` — 채택값 **56** (S1-D2), 가값 유지 |
| P-16 | 캐릭터 medallion 크기 | `semantic/space.css` (3곳) — 채택값 **136/188/232** (S1-D2), 가값 유지 |

합계: 토큰 반영 **15 항목 / 71 토큰** (빌드 로그 `[build-tokens] provisional 71 개 토큰 / 15 항목 · accepted deviation 3` 와 일치) + 명세 항목 P-10 = **16 항목 미확정**.

`docs/decisions/stage-1-approvals.md` §4 주의: S1-D2 로 값이 확정되어도 P-12~P-16 의 **가값 상태는 해제되지 않는다**(디자이너 승인 대기). 코드 주석 유지가 정상이다.

---

## 10. 수용 예외 적용 내역

| ID | 출처 | 적용 AC | 기록 형식 |
|---|---|---|---|
| **D-01** | `stage-0-approvals.md` §3 | AC-1-17 | 요구사항 `FAIL` (2.074:1 < 4.5) · Stage Verdict 계산은 `PASS (accepted: D-01)` |
| **S1-G-2** | `stage-1-approvals.md` §8 | AC-1-21 | `PASS (accepted: S1-G-2)` — TextField 행 42px, 그 외 44 미달 0건 |

D-02 (BottomTabBar 3탭 구성) 은 AC-1-25 의 판정 근거로 사용했고 별도 예외 처리가 필요 없었다. D-03·D-04 는 Stage 1 AC 대상이 아니다.

---

## 11. 참고 — 기존에 기록된 미결 항목 (신규 Finding 아님)

인계 문서·승인 문서에 이미 기록된 항목으로, QA 가 재확인만 했다.

| ID | 내용 | QA 재확인 결과 |
|---|---|---|
| `S1-D1-F2` | Tag `neutral` 배경 | **해소 확인** — `--color-tag-neutral-bg` semantic 토큰 존재, `token-tiers.test.ts` 가 "Tag neutral 배경이 semantic 을 거친다 (S1-D1-1)" 로 보증 |
| `S1-G-6` | `maxDiffPixels: 200` 이 **전체 프레임** baseline 에서 21px 아이콘 교체(실측 110–178px)를 놓친다. 요소 단위 baseline 은 정상 탐지 | **재확인** — `playwright.config.ts:26-27` 값이 확정값과 일치. 구조적 한계이며 Stage 1 AC 위반은 아니다. Stage 3 에서 탭바가 실제 화면에 마운트될 때 `frame-*` baseline 의 민감도를 재검토할 것을 권고 |
| `S1-G-7` | source map 에 소스 주석 포함 | **재확인 + 보강** — `VITE_API_MODE=http` 빌드의 `dist/**/*.{js,css,html}` 에 dev/mock 문자열 0건이며, QA 가 추가로 `.js.map` 까지 검사해 `MockHealthApi` **0건**을 확인했다. AC-1-42 에 영향 없음 |
| design-agent 문서 갱신 잔여 | Design Spec §4.19(PageIndicator `interactive` 삭제) · §8.1(아이콘 대응표) · §9.3(터치 표에 TextField 행 추가) · §10.3, `COMPONENT_MAP` | **문서 작업이며 Stage 1 AC 대상 아님.** `stage-1-approvals.md` §8 각주가 "문서 갱신은 design-agent 소관이며 Stage 1 QA 이후 별도로 처리한다" 고 명시. Stage 2 design 단계 전 처리를 권고 |

---

## 12. 재검증 이력

| 회차 | 일자 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-09-21 | `INCOMPLETE` | 최초 QA. FAIL 0 · PARTIAL 1 (AC-1-45 / QA-1-001) · NOT VERIFIED 0 · PENDING 0. Finding 3건 (QA-1-001 Medium · QA-1-002 Low · QA-1-003 Low) |
| **2** | **2026-09-21** | **`PASS (accepted: D-01, S1-G-2)`** | QA-1-001 Fix Loop 1 재검증. **AC-1-45 `PARTIAL` → `PASS`** (QA 직접 프로브 재현 실패 = 해소). 공통 명령 8종 전부 재실행 전부 exit 0. 회귀 0. 신규 Finding **QA-1-004 (Low)** 1건 — AC 판정 불변. QA-1-002·QA-1-003 은 미수정이므로 1회차 판정·내용 그대로 유지 |

재검증 시 QA-1-### 번호를 유지하고 판정 변화를 이 표에 추가한다.

---

## 13. 다음 동작

1. **Stage Verdict = `PASS (accepted: D-01, S1-G-2)`** 이므로 `.claude/rules/workflow.md` §4 상 Stage 2 진입이 **가능**하다. 단 진입은 **사용자 지시가 있을 때만** 한다 — QA 는 여기서 멈춘다.
2. **남은 Finding 3건은 Stage Verdict 를 막지 않지만 미결이다.**
   - `QA-1-002` (Low) TextField `trailingAction` 밑줄 — Figma 우선 / 접근성 우선 **사용자 또는 design-agent 결정 대기** (1회차와 동일, 미수정)
   - `QA-1-003` (Low) 일부 baseline 에 gallery nav pill·FAB 겹침 (1회차와 동일, 미수정)
   - `QA-1-004` (Low, 신규) `devWarn` 주석 정확도 · production 게이트 — **Stage 2 에서 PII 를 실제로 다루기 전** 정리 권고
3. 가값 16 항목 승인 절차 (Plan §17, Stage 0 #10-④) 를 Orchestrator 가 항목별로 진행한다 — §9.
4. design-agent 문서 갱신 잔여(§11) 는 Stage 2 design 단계 전에 처리한다.
