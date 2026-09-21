# Stage 1-E Handoff — `apps/web` 기반 (Vite · Tailwind · Router · Layout · Error Boundary)

Status: IMPLEMENTED (2026-09-20, development-agent) — stage-qa-agent 검증 대기
Scope: `docs/workflow/stage-1/stage-1-E.md` (Required Work 1–9) + 이월 `S1-B-1` · `S1-B-2`
근거 문서: `docs/plans/stage-1-plan.md` (APPROVED) §5.3·§5.4·§5.5·§5.6·§9.0·§9.5·§11.5·§16.1 ·
`docs/design/stage-1-design-spec.md` (APPROVED) §2·§2.4·§3.4·§7 ·
`docs/decisions/stage-1-approvals.md` §4.1·§6 · `.claude/rules/frontend.md` §1·§2·§3·§6·§9 ·
`.claude/rules/architecture.md` §2·§3

> **1-F(API Client · Mock · TanStack Query) 와 1-G(Dev UI Gallery · Scenario Panel · Playwright) 는 시작하지 않았다.**
> Stage 2 이후의 실제 화면 내용도 만들지 않았다 — `/` 는 임시 placeholder 다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` = `APPROVED` | 충족 (2026-09-18, user) |
| `docs/design/stage-1-design-spec.md` = `APPROVED` | 충족 (2026-09-18, user) |
| 이전 단계 산출물 회귀 없음 | 충족 — 루트 테스트 285 → **313** (파일 37 → 44), 감소 0 |
| Plan 이 PRD / Figma 와 모순되지 않음 | 모순 없음. Stage 1-E 는 화면 콘텐츠가 없는 앱 셸이다 |
| In Scope 에 Backend 구현 없음 | 없음. `apps/api/` · `supabase/` 미생성 (§5 증거) |
| 선행 결정 대기 항목 | `S1-D2-5` · `S1-D2-6` 은 1-G 항목이라 이 Step 을 막지 않음 (WORKFLOW_STATE §3) |

---

## 2. 구현 결과

### 2.1 Required Work 대응표

| # | 요구 | 결과 |
|---|---|---|
| 1 | 승인 버전 패키지 설치 | `vite 8.3.0` · `@vitejs/plugin-react 6.1.1` · `tailwindcss 4.3.3` + `@tailwindcss/vite 4.3.3` · `react-router 8.4.0` — **§16.1 표와 정확히 일치**하며 2026-09-20 registry latest 와도 동일(공통 원칙 5 재확인) |
| 2 | 앱 셸 | `index.html`(`lang="en"` · `viewport-fit=cover` · Inter preload) · `vite.config.ts` · `src/main.tsx` · `src/styles/index.css` |
| 3 | Router | `/` placeholder · `*` NotFound. `/__dev/ui/*` 는 추가하지 않음 (1-G) |
| 4 | Layout 3종 | `app/layouts/{TabLayout,FullscreenLayout,StackLayout}.tsx` + 공통 골격 `AppShell.tsx`. `AppColumn` 은 `@haru/ui` 것을 사용 (재구현 0) |
| 5 | Error Boundary 2단 | `AppErrorBoundary` · `RouteErrorBoundary` (+ 공통 class `ErrorBoundary.tsx`). 둘 다 `@haru/ui` 의 `ErrorState` 렌더, 로깅은 PII 금지 logger 경유 |
| 6 | RouteGuard shell | `app/guards/RouteGuard.tsx` + 주입 가능한 `useGuardDecision()` — Stage 1 구현은 **항상 `allow`**. 판정 순서 로직 없음 |
| 7 | `shared/lib` | `logger.ts`(화이트리스트 · dev 전용) · `env.ts`. `clock.ts` · `idFactory.ts` 는 **1-F 로 이월** (사용처가 Mock/요청 계층이라 겹침) |
| 8 | 이월 `S1-B-1` Tailwind 컴파일 검증 | **해소** — §3 |
| 9 | design-tokens prebuild 연결 | `apps/web` 의 `prebuild` · `predev` = `pnpm --filter @haru/design-tokens run build`. pnpm 12 가 pre/post script 를 실행함을 빌드 로그로 확인 |

### 2.2 파일 — 신규

```
apps/web/
├── index.html                       lang=en · viewport-fit=cover · preload 주입 지점
├── package.json                     @haru/web
├── tsconfig.json                    react preset — src/**
├── tsconfig.node.json               node preset — vite/vitest config · scripts/*.mjs · __tests__/**
├── vite.config.ts                   react · tailwindcss · haru:inter-preload · 폰트 고정 파일명
├── vitest.config.ts                 project "web" (jsdom)
├── __tests__/tailwind-compile.test.ts        S1-B-1 회귀 방지
├── scripts/tailwind-probe.css                검증 전용 probe (앱 번들 미포함)
├── scripts/verify-tailwind.mjs               `pnpm --filter @haru/web run verify:tailwind`
└── src/
    ├── main.tsx                     StrictMode → AppErrorBoundary → AppRouter
    ├── vite-env.d.ts                ImportMetaEnv (VITE_API_MODE · VITE_API_BASE_URL · VITE_MOCK_SCENARIO)
    ├── styles/index.css             tailwindcss → @haru/design-tokens → @haru/ui/styles.css
    ├── app/
    │   ├── router.tsx               AppRoutes(테스트용) · AppRouter(BrowserRouter 포함)
    │   ├── layouts/                 AppShell · StackLayout · TabLayout · FullscreenLayout
    │   ├── guards/RouteGuard.tsx    GuardDecision(allow|pending|redirect) · useGuardDecision
    │   └── error/                   ErrorBoundary · AppErrorBoundary · RouteErrorBoundary
    ├── pages/
    │   ├── placeholder/PlaceholderPage.tsx   Stage 2 에서 Home 골격으로 교체
    │   └── not-found/NotFoundPage.tsx
    ├── shared/
    │   ├── config/routes.ts         ROUTES = { home, notFound }
    │   ├── copy/app-copy.ts         앱 셸 영어 문구 (진단·판정 표현 없음)
    │   └── lib/                     logger.ts · env.ts
    ├── features/README.md           Stage 1 은 비어 있음 (경계 규칙 메모)
    └── test/setup.ts                RTL cleanup
```

### 2.3 파일 — 수정 (기존 산출물)

| 파일 | 변경 | 이유 |
|---|---|---|
| `package.json` (root) | `build` = `pnpm -r --if-present run build`, `dev` = `pnpm --filter @haru/web run dev`, `test:e2e` pending 문구 "Stage 1-C" → "Stage 1-G" | `apps/web` 이 생겨 pending no-op 이 더 이상 사실이 아니다. script 이름 목록(Plan §9.0)은 그대로 |
| `eslint.config.js` (root) | `haru/web-logger-console` 블록 추가 — `apps/web/src/shared/lib/logger.ts` 한 파일만 `no-console: off` | `console` 직접 접근 지점을 PII 금지 logger 한 곳으로 고정. 나머지 앱 코드는 `no-console` 로 계속 차단 |
| `pnpm-lock.yaml` | `@haru/web` 의존 추가 | 설치 |

### 2.4 구현 판단 (Design Spec 대비 — QA 확인 요망)

| 항목 | 구현 | 근거 |
|---|---|---|
| 화면 높이 | `AppShell` = `relative grid h-dvh` 한 칸 → AppColumn 이 세로로 stretch, 내부 `flex h-full flex-col` | Design Spec §7.2 "`100dvh` 사용, `100vh` 금지" |
| 하단 CTA | 스크롤 컨테이너 **내부** 마지막 블록 (`StackLayout.footer`) | §2.2 (키보드 가림 방지) |
| BottomTabBar | `TabLayout` 의 **마지막 flex 행** (`position: fixed` 미사용) | §2.2 "TabBar 도 앱 컬럼 폭 안에 정렬". flex 배치로 같은 결과를 얻으면서 `콘텐츠 하단 padding = tabbar+safe` 계산용 신규 토큰이 필요 없다. Stage 3 에서 실제 탭이 붙을 때 재확인 필요 |
| safe-area | `AppColumn` 이 상·하·좌·우를 모두 처리하므로 Layout 에서 `pt-safe`/`pb-safe` 를 **중복 적용하지 않았다** | `packages/ui/src/layout/AppColumn.css` |
| `main` 랜드마크 | 각 Layout 이 `<main aria-label="Main content">` 하나를 렌더 | rules/frontend §9 |
| `RouteErrorBoundary` 위치 | Layout 의 콘텐츠 슬롯 안 (`children ?? <Outlet/>` 을 감쌈) → 모든 route 가 자동 적용, Layout chrome 은 유지 | Plan §5.4 "route-level + app-level 2단" |
| 공통 class `ErrorBoundary.tsx` | Plan §9.5 파일 목록에 없는 **추가 1파일**. React 는 class 로만 boundary 를 만들 수 있어 두 boundary 가 같은 class 를 공유한다 | 중복 구현 회피. 외부로 export 하지 않음 |

---

## 3. 이월 `S1-B-1` — Tailwind `@theme` / `@utility` 컴파일 검증 (해소)

### 3.1 검증 방법

두 경로로 확인했다.

1. **probe 컴파일** (`apps/web/scripts/verify-tailwind.mjs`)
   `scripts/tailwind-probe.css` 를 실제 `@tailwindcss/vite` 파이프라인으로 빌드한다.
   `@import 'tailwindcss' source(none)` 로 파일 스캔을 끄고 `@source inline(...)` 후보만 검사하므로
   **결정적**이다. 긍정 후보(HARU semantic)와 부정 후보(기본 팔레트 · `sm:`/`xl:`/`2xl:`)를 한 파일에 둔다.
   - 실행: `pnpm --filter @haru/web run verify:tailwind`
   - 회귀 방지: `apps/web/__tests__/tailwind-compile.test.ts` 가 `pnpm test` 에서 같은 검사를 수행한다.
2. **실제 앱 빌드 산출물 grep** (`apps/web/dist/assets/*.css`) — 아래 3.3.

### 3.2 결과 — probe (`pnpm --filter @haru/web run verify:tailwind`)

```
[verify-tailwind] probe CSS 27740 bytes
[verify-tailwind] 기대 유틸리티 50 종 · 금지 후보 7 종 검사
[verify-tailwind] OK — @theme / @utility 가 의도대로 컴파일됩니다 (S1-B-1).
```

**① 생성됨 — `@theme` (semantic 노출)**

| 그룹 | 확인된 유틸리티 |
|---|---|
| color | `.text-fg-primary{color:var(--color-fg-primary)}` · `.bg-surface-glass` · `.bg-capability-emotion-bg` · `.text-fg-on-accent` · `.border-border-subtle` |
| typography | `.font-sans{font-family:var(--font-sans)}` · `.text-body` · `.text-caption-2` · `.font-semibold` |
| radius / shadow | `.rounded-card{border-radius:var(--radius-card)}` · `.rounded-pill` · `.shadow-glass-rest` · `.inset-shadow-highlight` |
| blur / ease / animate | `.backdrop-blur-material-md` · `.ease-standard` · `.animate-skeleton{animation:var(--animate-skeleton)}` |
| spacing | `.p-4{padding:calc(var(--spacing) * 4)}` · `.gap-2` |

**② 생성됨 — `@utility` (v4 네임스페이스가 없는 11 그룹)**

`.z-base` `.z-sticky` `.z-tabbar` `.z-sheet` `.z-dialog` `.z-toast` ·
`.duration-instant` `.duration-fast` `.duration-base` `.duration-slow` ·
`.material-glass-rest` `.material-glass-raised` `.material-glass-pressed` `.material-glass-strong`
(각각 `@supports not (backdrop-filter)` · `prefers-reduced-transparency` fallback 포함) ·
`.app-column` `.px-gutter` `.max-w-app` `.min-w-app` `.h-tabbar` ·
`.pt-safe` `.pb-safe` `.pl-safe` `.pr-safe` `.mb-safe` ·
`.bg-app` · `.min-touch` · `.focus-ring:focus-visible` · `.opacity-disabled` ·
`.size-icon-sm` `.size-icon-md` `.size-icon-lg`

**③ 생성되지 않음 (핵심 — 네임스페이스 초기화가 실제로 동작한다)**

| 후보 | 결과 |
|---|---|
| `bg-blue-500` · `text-red-600` · `border-gray-200` · `bg-slate-50` | **0 건** (`@source inline` 으로 강제 후보에 넣었는데도 생성 안 됨 = `--color-*: initial` 유효) |
| `sm:p-4` · `xl:p-4` · `2xl:p-4` | **0 건** |
| `@theme` 변수 `--color-blue-500` · `--color-gray-200` · `--breakpoint-sm` | **0 건** |

**④ breakpoint 는 승인된 2개만**

```
@layer theme{:root,:host{ … --breakpoint-md:600px;--breakpoint-lg:1024px; … }}
@media (width>=600px){.md\:p-4{padding:calc(var(--spacing) * 4)}}
@media (width>=1024px){.lg\:p-4{padding:calc(var(--spacing) * 4)}}
```

`@layer theme` 블록에는 HARU semantic 토큰만 있고 Tailwind 기본 팔레트·타입 스케일·easing·
breakpoint 는 전부 사라져 있다 (Design Spec §3.4 · §7.1, AC-1-11).

### 3.3 결과 — 실제 앱 빌드 (`pnpm build` → `apps/web/dist/assets/index-*.css`, 74.70 kB)

- 화면 코드에서 실제로 쓴 유틸리티가 생성됨:
  `.relative .grid .h-dvh .min-h-dvh .flex .flex-col .flex-1 .min-h-0 .grow .shrink-0 .items-center .justify-center .overflow-y-auto .overscroll-contain .overflow-hidden .min-h-40 .gap-3 .gap-4 .py-8 .pt-3 .pt-4 .pt-6 .pb-6` + `@utility` `.z-tabbar{z-index:var(--z-tabbar)}`
- 기본 팔레트 / `sm:` / `xl:` / `2xl:` — **0 건**
- `--breakpoint-md:600px` · `--breakpoint-lg:1024px` 만 존재, media 조건도 `(width>=600px)` · `(width>=1024px)` 뿐

### 3.4 검증 중 발견한 문서 오류 (Non-blocking)

`docs/design/stage-1-design-spec.md` §3.4 표의 `@theme --color-*` 생성 유틸리티 예시에
`border-subtle` 이 적혀 있으나, 토큰 이름이 `--color-border-subtle` 이므로 Tailwind v4 가 만드는
클래스는 **`border-border-subtle`** 이다 (`.border-subtle` 은 생성되지 않음을 컴파일로 확인).
토큰 값·구현에는 영향이 없고 **Design Spec 예시 문구만 부정확**하다 → `S1-E-1` 로 보고 (design-agent 소관).

---

## 4. 이월 `S1-B-2` — Inter woff2 preload (해소)

`@font-face` 가 실제로 요청하는 URL 과 preload href 가 **같은 URL** 이어야 중복 다운로드가 없다.
dev 와 build 의 URL 이 다르므로 `vite.config.ts` 의 `haru:inter-preload` 플러그인이 각각 계산해 주입한다.
build 에서는 `assetFileNames` 로 woff2 만 해시 없는 `assets/fonts/[name][extname]` 로 고정했다.

| 환경 | `index.html` preload href | CSS `@font-face` url | 일치 |
|---|---|---|---|
| build (`pnpm build`) | `/assets/fonts/inter-latin-wght-normal.woff2` | `url(/assets/fonts/inter-latin-wght-normal.woff2)` | ✅ |
| dev (`vite`, :5199) | `/@fs/Users/soojin/dev/haru/packages/design-tokens/dist/assets/inter-latin-wght-normal.woff2` | 동일 문자열 | ✅ (해당 URL `200`, 48,256 bytes) |

- 외부 요청 **0건**: `dist/index.html` + `dist/assets/*.css` 의 `http(s)://` 검색 결과는
  Tailwind 라이선스 **주석**(`https://tailwindcss.com`) 1건뿐이며 네트워크 요청이 아니다.
  Google Fonts · CDN 참조 없음.
- 산출물 크기: `dist/assets/fonts/inter-latin-wght-normal.woff2` 48.25 kB (latin · wght · normal 단일 파일).

---

## 5. 실행한 검증 명령과 결과

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ `Lockfile is up to date` (6 projects) |
| `pnpm typecheck` | ✅ config · design-tokens · contracts · ui · **web(2 tsconfig)** 전부 Done |
| `pnpm lint` | ✅ 오류 0 · 경고 0 |
| `pnpm lint:boundaries` | ✅ `no dependency violations found (171 modules, 388 dependencies cruised)` — 레이어 역방향·형제 feature·순환 0 |
| `pnpm test` | ✅ **Test Files 44 passed / Tests 313 passed** (이전 37 / 285 → 회귀 0, 신규 7 파일 · 28 테스트) |
| `pnpm build` | ✅ design-tokens → web. `vite build` 370 ms, `2007 modules transformed`, CSS 74.70 kB · JS 275.10 kB (gzip 88.08 kB) |
| `pnpm format:check` | ✅ `All matched files use Prettier code style!` |
| `pnpm assert:no-mocks` | ✅ `__HARU_MOCK_SENTINEL__` 0건 (Mock 자체가 아직 없음 — 실질 검증은 1-F) |
| `pnpm --filter @haru/web run verify:tailwind` | ✅ §3.2 |
| dev 서버 (`vite --port 5199`) | ✅ `ready in 286 ms` · `/` 200 · `/does-not-exist` 200(SPA fallback) · `/src/main.tsx` 200 · 폰트 200 |

### 5.1 Scope · 규칙 grep 증거

| 검사 | 결과 |
|---|---|
| `apps/api/` · `supabase/` | 존재하지 않음 (`ls` 오류 확인). `apps/` 하위는 `web` 하나 |
| `apps/mobile/` | 미생성 (Stage 4) |
| 신규 `any` / `@ts-ignore` / `@ts-nocheck` | 0건 |
| 임의 HEX / `rgb()` / Tailwind arbitrary value | 0건 (`apps/web/src`, `index.html`) |
| Mock · fixture · TanStack Query · adapter 선행 구현 | 0건 (검색 결과는 `vi.mockImplementation` 뿐) |
| Secret (`service_role` · api key · token) | 0건. `.env.example` 변경 없음 |
| 광고 · 제3자 분석 SDK | 의존성 0건 |
| `console` 직접 사용 | `shared/lib/logger.ts` 1파일 (eslint 예외도 그 파일만) |
| Page 의 API 호출 / 복잡한 로직 / Mock Data | 없음. `PlaceholderPage` 는 UI 조립만, `NotFoundPage` 는 `navigate` 1줄 |

---

## 6. 테스트 목록 (신규 28건 / 7파일)

| 파일 | 내용 |
|---|---|
| `apps/web/__tests__/tailwind-compile.test.ts` | S1-B-1 — 유틸리티 생성 / 기본 팔레트·`sm`·`xl`·`2xl` 미생성 / CLI 통과 (2) |
| `src/app/__tests__/router.test.tsx` | `/` placeholder · `*` NotFound · main 랜드마크 (3) |
| `src/app/guards/__tests__/RouteGuard.test.tsx` | 기본 판정 allow · allow/pending/redirect 렌더 (4) |
| `src/app/error/__tests__/ErrorBoundary.test.tsx` | App/Route 2단, ErrorState 렌더, 재시도 복구, 정상 렌더 비간섭 (4) |
| `src/app/layouts/__tests__/layouts.test.tsx` | 3 Layout 슬롯·탭 없음 기본값·AppColumn/AppBackground 포함 (6) |
| `src/shared/lib/__tests__/logger.test.ts` | 화이트리스트 밖 키·비 primitive 제거, prod no-op, 이벤트 이름 규격, `errorName` (7) |
| `src/shared/lib/__tests__/env.test.ts` | env 노출 · dev 전용 기능 조건 (2) |

---

## 7. Mock 시나리오

**이번 Step 에는 없다.** Mock Adapter · fixture · scenario 스위치는 Stage 1-F 범위다
(`docs/workflow/stage-1/stage-1-F.md`). `apps/web/src/mocks/` 는 생성하지 않았다.

---

## 8. `BACKEND_INTEGRATION_PENDING` 예상 항목

**0 건.** Plan §10 과 동일하다. Stage 1-E 산출물(앱 셸 · Router · Layout · Error Boundary · Guard shell)은
전부 Frontend 정적 검사와 단위 테스트로 검증된다. 새 Backend 요구를 만들지 않았다.

---

## 9. Scope 경계에서 보류한 항목

| 항목 | 이유 | 처리 시점 |
|---|---|---|
| `shared/lib/clock.ts` · `idFactory.ts` | 사용처(요청 id · 지연 Mock)가 1-F 계층이라 겹친다 — 1-E Required Work 7 의 단서에 따라 넘김 | 1-F |
| `app/providers/*` (ApiClientProvider · QueryProvider · AppProviders) | Adapter 선택 지점 = 1-F | 1-F |
| `entities/health`, `shared/api`, `mocks/` | 1-F | 1-F |
| `/__dev/ui/*` route · dev gallery · scenario panel · Playwright | 1-G | 1-G |
| `BottomTabBar` 실제 마운트 · 탭 항목/route | Stage 3 | Stage 3 |
| RouteGuard 판정 순서 (미인증 → 동의 → VPC → 온보딩 → …) | `GET /v1/me` 계약 의존 | Stage 2 |
| `VITE_API_MODE` 두 모드 빌드 (AC-1-05) | 모드 분기 코드가 1-F 에서 생긴다. 현재는 단일 빌드만 존재 | 1-F 이후 |
| `apps/mobile` | Stage 4 (결정 #7) | Stage 4 |

---

## 10. 발견한 문제

### Blocking

없음.

### Non-blocking (보고 · 후속)

| ID | 내용 | 소관 |
|---|---|---|
| `S1-E-1` | Design Spec §3.4 예시의 `border-subtle` → 실제 생성 클래스는 `border-border-subtle` (§3.4) | design-agent (문서 수정) |
| `S1-E-2` | 반응형 320 / 393 / 600 / 1024px 의 **실측**은 레이아웃 엔진이 필요해 이번 Step 에서 못 했다. CSS 규칙 수준으로는 확인됨: `.haru-app-column{min-inline-size:var(--layout-min-width);max-inline-size:var(--layout-app-max-width);margin-inline:auto}` + `--layout-min-width:320px` · `--layout-app-max-width:480px` · `--layout-gutter:var(--space-6)`(24px), breakpoint `md 600` · `lg 1024` 2개뿐 | 1-G (Playwright 뷰포트 측정) → AC-1-22 · AC-1-23 |
| `S1-E-3` | `TabLayout` 이 BottomTabBar 를 `fixed` 가 아니라 마지막 flex 행으로 둔다 (§2.4 표). 시각 결과는 같고 신규 토큰이 필요 없지만 Design Spec §2.2 문구와 구현 방식이 다르다 | Stage 3 에서 실제 탭 마운트 시 재확인 |
| `S1-E-4` | `eslint-plugin-jsx-a11y@6.10.2` 의 peer 경고(eslint 10 미지원 표기)는 Stage 1-A 부터 그대로다. `pnpm peers check` 의 유일한 경고 | 기존 기록 유지 |
| `S1-E-5` | `dist/` 는 `.gitignore` 대상이므로 `@haru/design-tokens/dist` 가 없는 클린 체크아웃에서는 `pnpm build`(또는 `apps/web` 의 `prebuild`/`predev`)를 먼저 돌려야 `apps/web` 이 폰트를 resolve 한다. `vite.config.ts` 가 `require.resolve` 로 폰트를 찾기 때문 | 정보 (QA 는 `pnpm build` 로 실행) |

### NEEDS_DECISION

없음. (`S1-D2-5` 탭 아이콘 · `S1-D2-6` 시각 비교 임계값은 1-G 항목으로 그대로 남아 있다.)

---

## 11. Stage 1-E 로 확정된 사실 (다음 Step 이 의존)

| 대상 | 확정 사실 |
|---|---|
| 패키지 | `@haru/web` (`apps/web`). dependency = `@haru/design-tokens` · `@haru/ui` · `react` · `react-dom` · `react-router` |
| CSS 진입점 | `src/styles/index.css` — `tailwindcss` → `@haru/design-tokens` → `@haru/ui/styles.css` **이 순서 고정** |
| Tailwind 사용 범위 | `apps/web` 화면 코드는 Tailwind 유틸리티, `packages/ui` 는 컴포넌트 CSS + `var(--token)` (1-D1 결정 유지) |
| 폰트 자산 경로 | build 산출물의 woff2 만 해시 없이 `assets/fonts/` 로 나간다 (`build.rollupOptions.output.assetFileNames`) |
| Router 모드 | react-router 8 **declarative(library) mode** — `BrowserRouter` + `Routes`/`Route`. framework mode · data router 미사용. 테스트는 `AppRoutes` + `MemoryRouter` |
| Error Boundary | route 경계는 Layout 의 콘텐츠 슬롯에 이미 들어 있다. 새 Layout 을 만들면 같은 자리에 `RouteErrorBoundary` 를 넣는다 |
| Guard 주입 | `RouteGuard`(`useDecision` prop). Stage 2 는 `useGuardDecision` 구현만 교체한다 |
| 로깅 | `shared/lib/logger.ts` 만 `console` 에 접근한다. 새 context 키가 필요하면 `ALLOWED_CONTEXT_KEYS` 에 추가하고 PII 여부를 검토한다 |
| root script | `pnpm build` = `pnpm -r --if-present run build`(design-tokens → web), `pnpm dev` = `pnpm --filter @haru/web run dev` |
| 테스트 배치 | `src/**/__tests__/*.test.tsx` = jsdom 컴포넌트, `apps/web/__tests__/*.test.ts` = Node 도구 테스트(tsconfig.node.json 범위) |
