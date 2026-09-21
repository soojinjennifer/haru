# Stage 1 Handoff — Frontend Foundation + Shared UI + Router/Layout + Design Tokens + Mock Infrastructure

Status: IMPLEMENTED (2026-09-21, development-agent) — stage-qa-agent 검증 대기
Scope: `docs/plans/stage-1-plan.md` (APPROVED 2026-09-18) · `docs/design/stage-1-design-spec.md` (APPROVED 2026-09-18)
구현 단계: 1-A → 1-B → 1-C → 1-D1 → 1-D2 → 1-E → 1-F → **1-G** → **1-G 수정 (승인 결정 4건 반영, 마지막)**

> 이 문서가 `.claude/rules/workflow.md` §6 이 요구하는 **development-agent → stage-qa-agent 정식 인계 파일**이다 (이월 `S1-C-1` 해소).
> 단계별 상세는 아래 §12 의 원본 문서에 그대로 남아 있다. 충돌 시 **이 문서가 우선**한다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` = `APPROVED` | 충족 (2026-09-18, user) |
| `docs/design/stage-1-design-spec.md` = `APPROVED` | 충족 (2026-09-18, user) |
| 이전 Stage QA PASS | Stage 0 사용자 승인으로 대체 (2026-09-14) |
| Plan ↔ PRD / Figma 모순 | 없음 |
| In Scope 에 Backend 구현 | 없음 — `apps/api/` · `supabase/` · `apps/mobile/` 미생성 |

---

## 2. 검증 명령과 결과 (2026-09-21 실행)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` | exit 0 (Node v24.21.0 · pnpm 12.4.2 · `preinstall` 가드 통과) |
| `pnpm typecheck` | **통과** — root(`tsconfig.json`) + `tsconfig.e2e.json` + 5 workspace 프로젝트 |
| `pnpm lint` | **통과** (error 0 / warning 0) |
| `pnpm lint:boundaries` | **통과** — `no dependency violations found (236 modules, 593 dependencies cruised)` |
| `pnpm test` | **통과** — `Test Files 58 passed (58) · Tests 440 passed (440)` |
| `pnpm build` (`VITE_API_MODE=http`) | **통과** — `index.html 0.98 kB` · `index-*.css 75.38 kB` · `index-*.js 390.44 kB` · `assets/fonts/inter-latin-wght-normal.woff2 48.25 kB` |
| `pnpm build` (`VITE_API_MODE=mock`) | **통과** — 위 + `mocks-*.js 90.34 kB` (Mock 이 **별도 청크**로 분리됨) |
| `pnpm assert:no-mocks` (http 빌드 대상) | **통과** — sentinel 3종 전부 0건 (§4) |
| `pnpm format:check` | **통과** — `All matched files use Prettier code style!` |
| `pnpm test:e2e` (Playwright 1.63.0 / Chromium) | **통과** — `50 passed`. **확정 임계값**(`maxDiffPixelRatio 0.002` + `maxDiffPixels 200`, `S1-D2-6`)에서 **2회 연속 전체 통과** (§5) |

테스트 수 추이: 1-A 이후 313 → 1-F 403 → 1-G 441 → **1-G 수정 440**.
감소 1건은 회귀가 아니다: 결정 `S1-G-1`(PageIndicator `interactive` variant 폐기)로 해당 variant 테스트 **2건을 삭제**하고 "인터랙티브 컨트롤이 렌더되지 않는다" 테스트 **1건을 추가**했다 (−2 +1 = −1). 그 외 회귀 0.

---

## 3. Acceptance Criteria 대응 (AC-1-01 … AC-1-45)

> 판정은 stage-qa-agent 가 한다. 아래는 **구현 위치와 증거 경로**다.

### 3.1 빌드 · 툴체인

| AC | 구현 · 증거 |
|---|---|
| AC-1-01 | `pnpm-lock.yaml` 커밋 · `--frozen-lockfile` exit 0 |
| AC-1-02 | `pnpm typecheck` 통과. 신규 `any` / `@ts-ignore` 0건 (`@typescript-eslint/no-explicit-any` · `ban-ts-comment` error) |
| AC-1-03 | `pnpm lint` error 0 |
| AC-1-04 | `pnpm test` 440건 — contracts · Mock · 상태 컴포넌트 · 정적 규칙 테스트 포함 |
| AC-1-05 | 두 모드 빌드 모두 성공 (§2) |
| AC-1-06 | `.nvmrc 24.21.0` · `engines.node ">=24.21.0 <25"` · `packageManager pnpm@12.4.2` · `scripts/check-node-version.mjs` preinstall 가드 |

### 3.2 Scope 준수

| AC | 구현 · 증거 |
|---|---|
| AC-1-07 | `apps/` 하위는 `apps/web` 뿐. `apps/api` · `supabase` · `apps/mobile` 없음 |
| AC-1-08 | route 는 `/`(placeholder) · `*`(NotFound) + **dev 전용** `/__dev/ui/*`. 도메인 Mock 은 `health` 하나 (D-8) |
| AC-1-09 | `pnpm lint:boundaries` — D-1 규칙 6종 위반 0 |

### 3.3 Design Token · Figma 정합

| AC | 구현 · 증거 |
|---|---|
| AC-1-10 | eslint `no-restricted-syntax` 4종(HEX · rgb/hsl · arbitrary value · arbitrary variant). dev gallery 도 예외 아님 |
| AC-1-11 | `packages/design-tokens/scripts/build-tokens.mjs` 가 3-tier 참조 방향 · `@theme` = semantic 전용 · 네임스페이스 초기화를 **빌드 실패로 강제**. primitive 65 · semantic 193 · component 48 |
| AC-1-12 | `provisional 71개 토큰 / 15 항목` (P-10 은 토큰 아님). `packages/design-tokens/__tests__/provisional.test.ts` 가 §4 표와 1:1 대조 |
| AC-1-13 | `--font-sans` 단일 정의 · `system-ui` 가 Inter 앞에 없음 · SF Pro 파일 0 (`__tests__/fonts.test.ts`) |
| AC-1-14 | Inter self-host + preload. Playwright 네트워크 로그 **외부 도메인 요청 0건** (`e2e/scenarios.spec.ts` "외부 네트워크 요청 0건") |
| AC-1-15 | capability 색 4종 토큰 + `/__dev/ui/components` Tag 4 tone + `/__dev/ui/a11y` 대비 실측 |
| AC-1-16 | dark mode 토큰 0 · `color-scheme: light` (`src/color-scheme.css`) |
| AC-1-17 | **Accent 흰 라벨 실측 2.07:1** — `/__dev/ui/a11y` 표 `A-1`. 토큰에 `accepted deviation: D-01` 주석. QA 는 `PASS (accepted: D-01)` 로 기록 |

### 3.4 Shared UI · 공통 상태 · 접근성

| AC | 구현 · 증거 |
|---|---|
| AC-1-18 | 22종 전부 `packages/ui/src/index.ts` export. `/__dev/ui/components` 가 variant × state 매트릭스를 렌더 (Playwright baseline 20종) |
| AC-1-19 | `/__dev/ui/states` — §5.1 Loading(Skeleton) · §5.2 Empty · §5.3 Error+Retry · §5.4 Offline Banner · §5.5 Toast · §5.6 Dialog 를 **AppColumn + TopBar 컨텍스트**에서 렌더. baseline 4건 + live 블록 |
| AC-1-20 | `e2e/a11y.spec.ts` — focus tour 를 Tab 으로 순회하며 ① 접근성 이름 비어 있지 않음 ② `outline-style ≠ none` ③ 마우스 클릭에는 링을 그리지 않음(`:focus-visible` 만) 을 검증 |
| AC-1-21 | `elementFromPoint` 로 **실제 hit 범위**를 측정 (§7 표). IconButton 시각 38 → hit **44×44** 확인. 미달은 **1건**(TextField 행 42px)이며 사용자 수용 예외 `S1-G-2` → `PASS (accepted: S1-G-2)` 로 기록한다. PageIndicator dot 3건은 `S1-G-1` 로 인터랙티브가 아니게 되어 대상에서 빠졌다 |
| AC-1-22 | reduced-motion: `reduce` 에서 실행 중 애니메이션 **0**, `no-preference` 에서 > 0 (규칙이 실제로 동작함을 양방향 확인). 200% 확대: 320px 에서 가로 스크롤 0 + baseline `frame-320-text-200.png` |
| AC-1-23 | Playwright viewport 4종 실측 — 320/272 · 393/345 · 600(480)/432 · 1024(480)/432, 좌우 여백 대칭 ±1px, 가로 스크롤 0 |
| AC-1-24 | 시각 baseline **27건** 생성 (§5). Figma 대조 10건 + 명세 기준 12건 + 반응형 5건 |
| AC-1-25 | `TAB_ITEMS` = Library / Home(center) / Progress. Session 탭 없음. `items` 는 gallery(앱 측)가 주입하고 `packages/ui` 는 도메인을 모른다 |

### 3.5 Router · Layout · Adapter

| AC | 구현 · 증거 |
|---|---|
| AC-1-26 | `app/router.tsx` · Layout 3종 · Error Boundary 2단 · `RouteGuard`. 단위 테스트 + e2e |
| AC-1-27 | `app/providers/apiClients.ts` 가 **저장소에서 유일하게** `VITE_API_MODE` 를 읽는다 — `apps/web/__tests__/mock-source-rules.test.ts` 가 파일 목록을 정확히 고정 |
| AC-1-28 | Page 2종(`PlaceholderPage` · `NotFoundPage`)은 조립만. API 호출·Mock 데이터 0 |
| AC-1-29 | `UI → useHealth → healthApi → Mock|Http`. gallery 의 live 블록은 `ApiClientProvider` 가 준 Adapter 를 그대로 쓴다 (Mock 직접 생성 0) |
| AC-1-30 | `HttpHealthApi` + `httpClient` — `https:` 강제, contracts parse. 단위 테스트 |

### 3.6 contracts

AC-1-31 … AC-1-36 — Stage 1-C 에서 구현·검증 완료 (`docs/qa/stage-1c-handoff.md`). 1-G 에서 변경 없음.

### 3.7 Mock Infrastructure

| AC | 구현 · 증거 |
|---|---|
| AC-1-37 | `MockHealthApi` 요청·응답 contracts parse (`mocks/__tests__/MockHealthApi.test.ts`) |
| AC-1-38 | scenario 5종 → UI 상태를 **브라우저에서** 확인 (`e2e/scenarios.spec.ts`): success → 콘텐츠 / loading → Skeleton / error → ErrorState+Retry / retry → error → Retry 클릭 → success / offline → Offline Banner |
| AC-1-39 | 같은 scenario 재실행 시 동일 출력 — 단위 테스트 + e2e(재로드 후 텍스트 동일, `serverTime` 이 고정 epoch `2026-01-01`) |
| AC-1-40 | scenario key 가 API_CONTRACTS §5.4 machine key 뿐임을 테스트로 고정 (`dev/__tests__/scenario-selection.test.ts`) |
| AC-1-41 | fixture 는 `mocks/fixtures/` 에만. 정적 테스트가 앱 코드 하드코딩 0건을 강제 |
| AC-1-42 | §4 — sentinel 3종 0건 + dist 파일 목록 |

### 3.8 Privacy · Security

| AC | 구현 · 증거 |
|---|---|
| AC-1-43 | `.env.example` 에 `VITE_API_BASE_URL` · `VITE_API_MODE` · `VITE_MOCK_SCENARIO` 3개뿐. Secret 0 |
| AC-1-44 | 광고·분석 SDK 의존 0. Playwright 네트워크 로그 외부 도메인 0건 |
| AC-1-45 | `shared/lib/logger.ts` 만 `console` 접근(eslint 예외 1곳). context key allow-list 로 PII 차단 |

---

## 4. Production(`VITE_API_MODE=http`) 빌드 배제 증거 (AC-1-42)

```
$ pnpm assert:no-mocks
[assert:no-mocks] OK — __HARU_MOCK_SENTINEL__ 0건 (4개 파일 검사).
[assert:no-mocks] OK — __HARU_DEV_SENTINEL__ 0건 (4개 파일 검사).
[assert:no-mocks] OK — haru-dev- 0건 (4개 파일 검사).
```

`dist` 전체 파일 목록 (5개):
`index.html` · `assets/index-*.css` · `assets/index-*.js` · `assets/index-*.js.map` · `assets/fonts/inter-latin-wght-normal.woff2`
→ **mock 청크도 dev 청크도 없다.** (`mock` 모드 빌드에서는 `assets/mocks-*.js` 가 추가로 생성되므로 검사가 헛돌지 않음이 증명된다.)

문자열 grep (js + css + html):

| 표식 | http 빌드 |
|---|---|
| `__HARU_MOCK_SENTINEL__` | 0 |
| `__HARU_DEV_SENTINEL__` | 0 |
| `haru-dev-` (dev CSS 클래스 접두어) | 0 |
| `__dev/ui` (gallery route) | 0 |
| `0.0.0-mock` (fixture 값) | 0 |
| `__states` (gallery scenario 그룹) | 0 |

제거가 보장되는 구조:

1. `vite.config.ts` 가 `import.meta.env.VITE_API_MODE` 를 **문자열 리터럴로 define** 한다 (dev 기본 `mock`, build 기본 `http`).
2. `app/providers/apiClients.ts` 가 그 값을 **인라인 비교**하므로 `http` 빌드에서 `await import('../../mocks')` 가 도달 불가능해진다.
3. `app/router.tsx` 가 `import.meta.env.DEV ? lazy(() => import('../dev/…')) : null` 로만 dev 모듈에 진입한다. Production 에서 `DEV` 는 `false` 리터럴이라 dev 청크(JS + `dev.css`)가 통째로 사라진다.
4. **dev gallery 는 Tailwind 유틸리티를 쓰지 않는다.** Tailwind v4 는 소스를 스캔하므로 유틸리티를 쓰면 JS 가 사라져도 클래스가 Production CSS 에 남는다. 그래서 gallery 는 `apps/web/src/dev/dev.css` 의 `haru-dev-*` 평문 CSS(토큰 값만)로 구현했고, 정적 테스트가 이를 강제한다.
5. dev route 경로 문자열도 `shared/config/routes.ts` 가 아니라 가드 안에 인라인했다 (그 객체는 번들에 남기 때문).

---

## 5. Playwright 시각 baseline (AC-1-24)

- 패키지: `@playwright/test@1.63.0` (patch 고정, D-10)
- 설정: `playwright.config.ts` — Chromium 1종(번들 브라우저) · viewport 393×852 · `deviceScaleFactor: 1` · `reducedMotion: 'reduce'` · `colorScheme: 'light'` · `locale en-US` · `timezone UTC` · `workers: 1` · `animations: 'disabled'` · `caret: 'hide'` · `scale: 'css'`
- 대상 서버: **dev 서버** (`pnpm --filter @haru/web run dev --port 4319 --strictPort`). gallery 는 dev 전용이므로 Production 빌드로는 열 수 없다.
- 안정화: 매 이동마다 `.haru-dev-root` attach 대기 → `document.fonts.ready` → `requestAnimationFrame` 2회
- 저장 경로: `e2e/__screenshots__/{platform}/{testFileName}/{arg}.png` (플랫폼별 분리 — 다른 OS 에서는 재생성 필요)

생성 개수 **27건**:

| 그룹 | 개수 | 파일 |
|---|---|---|
| Figma 대조 (V-1…V-8) | 10 | `v1-button` · `v2-surface` · `v2-material` · `v3-tab-bar` · `v4-tag-chip` · `v5-field` · `v6-bubble` · `v7-progress` · `v8-color-semantic` · `v8-typography` |
| 명세 기준 (V-9, Figma 없음) | 12 | `v9-text` · `v9-icon` · `v9-icon-button` · `v9-top-bar` · `v9-spinner-skeleton` · `v9-state-cards` · `v9-toast` · `v9-state-loading` · `v9-state-empty` · `v9-state-error` · `v9-state-offline` · `v9-focus` |
| 반응형 | 5 | `frame-320` · `frame-393` · `frame-600` · `frame-1024` · `frame-320-text-200` |

**결정성 측정 (이월 `S1-D2-6` 근거):**

| 실행 | 결과 |
|---|---|
| 생성 직후 재실행 (run A) | 50 passed |
| 연속 재실행 (run B) | 50 passed |
| `--update-snapshots` 강제 재생성 후 SHA-256 비교 | **27/27 바이트 동일** (diff 0) |
| prettier 포맷 후 재실행 | 50 passed (baseline 변경 없음) |
| **확정 임계값 적용 후 2회 연속 전체 실행** | **50 passed × 2**, 실행 후 27개 baseline SHA 전부 동일 |

즉 **같은 환경에서 반복 측정한 실제 diff 는 0 픽셀 / 0.0000 ratio** 다.

**1-G 수정에서 재생성한 baseline 8건** — 사유는 ①탭 아이콘 글리프 교체(`S1-D2-5`) ②`interactive` variant 폐기(`S1-G-1`) 뿐이다.
판별은 임계값 0 설정으로 전수 재비교해 **실제 픽셀이 바뀐 파일만** 다시 썼다 (SHA 대조로 8건 외 19건은 바이트 동일 확인).

| baseline | 0 임계 diff | 사유 |
|---|---|---|
| `visual.spec.ts/v3-tab-bar.png` | 6,099 px (높이 472→456) | 탭 아이콘 2종 교체 + gallery 주석 문구 1줄 감소 |
| `visual.spec.ts/v9-icon.png` | 346 px | 아이콘 갤러리의 Library / Progress 글리프 교체 |
| `visual.spec.ts/frame-320.png` | 113 px | 프레임 화면 하단 탭바 아이콘 |
| `visual.spec.ts/frame-393.png` | 110 px | 〃 |
| `visual.spec.ts/frame-600.png` | 178 px | 〃 |
| `visual.spec.ts/frame-1024.png` | 177 px | 〃 |
| `responsive.spec.ts/frame-320-text-200.png` | 113 px | 〃 (200% 확대 화면) |
| `visual.spec.ts/v7-progress.png` | 973 px (높이 204→185) | `interactive` PageIndicator 예시 제거 |

---

## 6. Mock 시나리오와 전환 방법

### 6.1 그룹 · key

| 그룹 | key | Mock 동작 | 화면 결과 |
|---|---|---|---|
| `health` | `success` | 성공 fixture | 정상 콘텐츠 |
| | `loading` | 주입 timer 1500ms 지연 | Skeleton (§5.1) |
| | `error` | `INTERNAL_ERROR` Error Envelope | ErrorState + Retry (§5.3) |
| | `retry` | 1회차 실패 → 이후 성공 | Error → Retry 클릭 → 정상 |
| | `offline` | `NetworkError` throw | Offline Banner (§5.4) |
| `__states` (gallery 전용) | `success`(기본) | — | 공통 상태 6종 **전부** 표시 |
| | `loading` `empty` `error` `retry` `offline` | — | 해당 상태 **하나만** 표시 (Design Spec §5.7) |

`health` 에는 `empty` 가 **없다** (Plan §8.1 ④). EmptyState 는 `__states:empty` 로 확인한다.

### 6.2 전환 방법 (우선순위: URL > dev 패널 > env > `success`)

```
# 1) URL (1순위, Playwright·버그 리포트 공유용)
http://localhost:5173/__dev/ui/states?scenario=health:error
http://localhost:5173/__dev/ui/states?scenario=health:retry,__states:empty
http://localhost:5173/__dev/ui/states?scenario=loading          # 그룹 생략 = 전 그룹

# 2) dev Scenario Panel (화면 우하단 `scenario` 버튼)
#    클릭 → sessionStorage['haru:scenario'] 기록 + URL 동기화 + 새로고침
#    `reset` 버튼이 둘 다 지운다

# 3) 빌드 기본값
VITE_MOCK_SCENARIO=health:error pnpm --filter @haru/web run dev
```

### 6.3 결정성

- Mock 은 `Date.now()` / `new Date()` / `Math.random()` / `setTimeout` 을 **직접 호출하지 않는다** (정적 테스트가 강제). 주입된 `clock`(고정 epoch `2026-01-01T00:00:00Z`) · `idFactory`(seed) · `timer` 만 쓴다.
- **취소된 요청은 시도 횟수를 소비하지 않는다** — `mocks/scenarios/scenario-store.ts` 의 `consumeAttempt()` 가 `AbortSignal` 에 rollback 을 건다. 이것이 없으면 React StrictMode 이중 마운트(dev)가 `retry` 1회차를 조용히 소비해 화면이 곧바로 success 로 보인다. (1-G 에서 실제로 관측되어 수정)
- `QueryClient` 기본값에 `retryOnMount: false` 를 추가했다. 기본값 `true` 이면 재마운트만으로 자동 재요청이 일어나 ErrorState 가 스쳐 지나간다. 재시도는 Retry 버튼으로만 일어난다 (Design Spec §5.3).

---

## 7. 접근성 실측값 (QA 가 그대로 인용 가능)

### 7.1 터치 타깃 — `/__dev/ui/a11y`, `elementFromPoint` 실측

| 요소 | 시각 크기 | 실제 hit | 판정 |
|---|---|---|---|
| IconButton (glass, Back) | 38×38 | **44×44** | reaches |
| IconButton (plain, Close) | 38×38 | **44×44** | reaches |
| Chip | 50×31 | 45×44 | reaches |
| Button md | 131×45 | 45×45 | reaches |
| Checkbox 행 (label) | 327×44 | 45×44 | reaches |
| TextField 행 (label+input) | 275×36 | 45×36 | **below** → **`PASS (accepted: S1-G-2)`** |
| TextField trailingAction "Show" | 44×44 | 44×44 | reaches |

> **수용 예외 `S1-G-2` (approvals §8, 2026-09-21 user)** — `--field-row-height: 42px`(Figma `76:364`)를 유지한다.
> 토큰 정의 위에 `/* accepted deviation: S1-G-2 (field row 42 < touch 44, approvals §8) */` 주석이 있고,
> `packages/design-tokens/dist/tokens-manifest.json` 의 `counts.acceptedDeviation` 이 **3** (D-01 ×2 + S1-G-2) 으로 집계한다.
> QA 는 이 항목을 `PASS (accepted: S1-G-2)` 로 기록한다.
>
> PageIndicator dot 행은 결정 `S1-G-1` 로 **표시 전용**이 되어 인터랙티브 요소가 아니다 → 측정 대상에서 제외.
> `e2e/a11y.spec.ts` 의 `KNOWN_BELOW_44` 는 이제 `['div · Password']` 1건이며, 새 위반이 생기면 테스트가 깨진다.

### 7.2 대비 — 렌더된 색에서 계산 (Design Spec §9.4 대조)

| # | 대상 | 측정 | 기준 | 표시 |
|---|---|---|---|---|
| A-1 | Accent 버튼 흰 라벨 | **2.07:1** | 4.5 | D-01 수용 예외 (문서값과 일치) |
| B-1 | 보조 텍스트 on glass (배경 시작) | 3.13:1 | 4.5 | 가값 P-01 |
| B-2 | 보조 텍스트 on strong | 3.23:1 | 4.5 | 가값 P-01 |
| B-3 | 3차 텍스트 on solid | 3.29:1 | 4.5 | 가값 P-01 |
| B-4 | 보조 텍스트 on glass (배경 끝) | **2.91:1** | 4.5 | 가값 P-01 |
| C-1 | ProgressBar fill / track | 1.50:1 | 3.0 | 가값 P-02 |
| C-2 | border-subtle on solid | 1.26:1 | 3.0 | 가값 P-02 |
| C-3 | Tag 글자 (emotion) | 1.56:1 | 4.5 | 가값 P-02 |
| C-4 | Tag 글자 (agency) | 2.05:1 | 4.5 | 가값 P-02 |
| D-1 | Glass 버튼 라벨 (배경 시작) | 4.81:1 | 4.5 | 가값 P-11 |
| D-2 | Glass 버튼 라벨 (배경 끝) | **4.47:1** | 4.5 | 가값 P-11 |
| E-1 | 본문 텍스트 on solid | 6.81:1 | 4.5 | 통과 |
| E-2 | focus ring on solid | 6.81:1 | 3.0 | 가값 P-03 · 통과 |
| E-3 | focus ring on glass | 6.49:1 | 3.0 | 가값 P-03 · 통과 |
| E-4 | focus ring on accent | 3.28:1 | 3.0 | 가값 P-03 · 통과 |

> 반투명 색은 앱 배경 위에 합성해 계산하며 blur·그림자는 반영하지 않는다 (Design Spec §9.4 와 동일한 방법).
> 측정 경로 검증: A-1 **2.07** = §9.4(A) 기재값. B-1·B-4 **2.91–3.13** = §9.4(B) 기재 범위 `2.92–3.14`. D-1·D-2 **4.47–4.81** = §9.4(D) 기재 범위 `4.18–4.48` 과 정합(합성 기준색 차이로 상한이 조금 높다). E-2~E-4 **6.81 / 6.49 / 3.28** = §9.3 기재값과 일치.

---

## 8. QA 가 그대로 적용해야 할 허용 차이

Design Spec §10.3 의 **AD-1 … AD-10 전체**를 적용한다. 특히:

- **AD-1** 폰트 metric — Figma 는 SF Pro, Playwright(Chromium)는 Inter. 텍스트 글리프 차이 허용, **행 수 증가로 레이아웃이 깨지는 것은 불허**.
- **AD-3** 그림자 — 구현은 명명된 Effect Style, Figma instance 는 raw 2-layer. blur/offset 차이 허용, fill·radius·크기는 불허.
- **AD-4** blur — Button hover Figma 6 → 구현 12 통일.
- **AD-7** 기기 크롬(상태바·Dynamic Island·Home Indicator) 미구현 — 비교 시 crop.
- **탭 아이콘 선 굵기** (1-G 수정 추가) — Figma `25:87` 의 탭 글리프는 Lucide 가 아니라 채워진 도형에 가깝다. 21px 기준 실측으로 Figma 는 Library 외곽선 ≈2.0px · Progress 막대 ≈3.2px 인데, HARU 규격 `LUCIDE_STROKE_WIDTH = 1.5` 의 렌더 두께는 1.31px 다. **형태(글리프 종류)는 일치하고 선 굵기·막대 간격만 다르다** — 이 차이는 허용한다. 근거는 §10.

---

## 9. 발견한 문제

### Blocking

없음.

### NEEDS_DECISION (사용자 / design-agent 결정 대상)

| ID | 내용 |
|---|---|
| **S1-D2-5** | **해소됨** (2026-09-21 user, approvals §8) — `book` / `chart-no-axes-column-increasing` 확정. 코드·baseline 반영 완료. §10 참조 |
| **S1-D2-6** | **해소됨** (2026-09-21 user, approvals §8) — `maxDiffPixelRatio 0.002` + `maxDiffPixels 200` 확정, `provisional` 주석 제거. §11 참조 |
| **S1-G-1** | **해소됨** (2026-09-21 user, approvals §8) — `interactive` variant 폐기. PageIndicator 는 표시 전용이며 `variant` · `onSelect` · `itemLabels` prop 과 hit area 확장 CSS 를 제거했다. §16 참조 |
| **S1-G-2** | **해소됨** (2026-09-21 user, approvals §8) — 42px 유지 + 수용 예외. QA 판정은 `PASS (accepted: S1-G-2)`. §7.1 참조 |
| **S1-D1-F2** | Tag `neutral` tone 이 Tier 1 `--haru-dusk-200` 을 직접 참조한다 (Tier 2 대응 토큰 없음). semantic 토큰 신설 여부 결정 대기 |

### Non-blocking (기록)

| ID | 내용 |
|---|---|
| `S1-A-F1` | pnpm 12 는 `.npmrc` 를 읽지 않는다. 실제 적용 지점은 `pnpm-workspace.yaml` + `preinstall` 가드 |
| `S1-A-F2` | root script `install` 은 정의하지 않았다 (설치 라이프사이클 훅과 충돌). Plan §9.0 문구 조정 필요 — plan-agent |
| `S1-C-F3` | contracts 는 빌드 산출물이 없다(`exports` = `./src/index.ts`). Backend 재사용 시 `--module nodenext` 컴파일 필요 — Stage 8 Handoff 기록 대상 |
| `S1-C-F4` | `ErrorEnvelope.requestId` 는 `z.string().min(1)` (uuid 강제 아님) — 오류 처리 경로가 형식 불일치로 다시 실패하지 않게 하기 위함 |
| `S1-D2-1` | pnpm 12 는 `package.json` 의 `pnpm.overrides` 를 읽지 않는다 → `pnpm-workspace.yaml` 의 `overrides` 로 충족 |
| `S1-D2-2` | Figma `140:2971` export 의 drop shadow 는 제거하고 CSS `--shadow-rest` 로 대체 (AD-3 범위) |
| `S1-D2-3` | `<ul role="list">` 는 lint 규칙과 충돌해 `role` 을 뺐다. Safari VoiceOver 확인 필요 |
| `S1-D2-4` | Skeleton `text` 줄 높이에 CSS `lh` 단위 사용 (Chrome 109+ / Safari 16.4+ / Firefox 120+) |
| `S1-E-1` | Design Spec §3.4 예시 `border-subtle` → 실제 클래스는 `border-border-subtle` — design-agent 문서 수정 |
| `S1-E-2` | **해소됨** — 반응형 실측을 1-G Playwright 가 수행 (§3.4 AC-1-23) |
| `S1-E-3` | `TabLayout` 은 BottomTabBar 를 `fixed` 가 아니라 마지막 flex 행으로 둔다 (시각 동일). Stage 3 에서 재확인 |
| `S1-E-4` | `eslint-plugin-jsx-a11y@6.10.2` 의 peer 경고(eslint 10 미지원 표기) — 기존 기록 유지 |
| `S1-E-5` | 클린 체크아웃에서는 `pnpm build`(또는 `prebuild`/`predev`)를 먼저 돌려야 `@haru/design-tokens/dist` 폰트가 resolve 된다 |
| `S1-F-1` | `vite.config.ts` 가 `VITE_API_MODE` 를 명시적으로 `define` 한다 (dead-code elimination 보장) |
| `S1-F-2` | `offline` 은 Error Code 가 아니다 — `NetworkError` 로 구분 |
| `S1-F-3` | `httpClient` 는 `https:` 만 허용한다. 로컬 Backend 연동이 필요해지면 별도 승인 |
| `S1-F-4` | QueryClient `retry: false` + **`retryOnMount: false`** (1-G 추가) |
| `S1-G-3` | **Spinner 가 `prefers-reduced-motion: reduce` 에서도 회전하고 있었다** (Design Spec §9.2 위반). 1-G 에서 `Spinner.css` reduce 블록에 `animation: none` 1줄 추가로 수정. e2e 가 양방향으로 회귀를 막는다 |
| `S1-G-4` | `scripts/pending-script.mjs` 삭제 — 유일한 소비자였던 `test:e2e` NO-OP 이 실제 Playwright 실행으로 바뀌어 사용처가 0 이 되었다 |
| `S1-G-5` | dev gallery 는 Tailwind 유틸리티를 쓰지 않고 `dev.css` 평문 CSS 를 쓴다 (§4-4 이유). `mock-source-rules.test.ts` 가 강제 |
| `S1-G-6` | **확정 임계값 `maxDiffPixels: 200` 은 전체 화면 baseline 에서 21px 아이콘 교체를 놓친다.** 실측: 탭 아이콘 2종을 바꿨을 때 `frame-320/393/600/1024` · `frame-320-text-200` 의 diff 는 **110–178 px** 로, 200 상한 아래라 전부 **통과했다**(0 임계로 재비교해야 탐지됨). 요소 단위 baseline(`v9-icon` 346px, `v7-progress` 973px, `v3-tab-bar` 6,099px)은 비율 0.002 가 먼저 걸려 정상 탐지된다. → **프레임 회귀는 요소 단위 baseline 이 담당**한다고 보고 확정값을 그대로 적용했다. 상한을 더 낮출지는 사용자·design-agent 결정 대상 (§11) |
| `S1-G-7` | `packages/design-tokens/scripts/parse-tokens.mjs` 의 `ACCEPTED_RE` 가 `D-\d{2}` 만 인식해 `S1-G-2` 주석을 집계하지 못했다. ID 패턴을 `D-\d{2}` \| `S\d+-[A-Z0-9]+-\d+` 로 넓혀 manifest `acceptedDeviation` 이 3 으로 집계된다 |

---

## 10. `S1-D2-5` — 탭 아이콘 글리프 (**확정 · 반영 완료**, 2026-09-21 user)

**비교 자료** (저장 위치 `docs/qa/assets/stage-1-tab-icons/`)

| 파일 | 내용 |
|---|---|
| `figma-25-87-tabbar.png` | Figma `25:87` Screen/Tab Bar 3 variant 원본 |
| `figma-25-35-library-icon-16x.png` | Figma Library 탭 아이콘 (21px → 16배 확대) |
| `figma-25-46-progress-icon-16x.png` | Figma Progress 탭 아이콘 (21px → 16배 확대) |
| `impl-v3-tab-bar.png` | 구현 Playwright baseline `v3-tab-bar` (**확정 글리프로 갱신**) |
| `stroke-figma-vs-1_5-vs-2.png` | 탭바 4배 확대 3단 비교 — 위 Figma `25:87` / 가운데 `stroke 1.5`(채택) / 아래 `stroke 2`. §10.1 근거 |

**관측 결과**

| 탭 | Figma 글리프 형태 | 1-G 당시 구현 (`book-open` / `chart-column`) | Design Spec 대안 | 일치 여부 |
|---|---|---|---|---|
| Library | **닫힌 책** — 세로 직사각형 외곽선 + 왼쪽 책등(세로선) + 아래쪽 가로 선반선 | 펼친 책(가운데 접힘선 + 좌우 페이지) | `library-big`(세로 막대 더미 + 기울어진 책) | **둘 다 불일치** |
| Progress | **막대 3개, 축 없음, 왼→오 단조 증가**(짧음·중간·김), 둥근 끝 | 막대 + **L자 축선**(x/y축) | `trending-up`(꺾은선 화살표) | **둘 다 불일치** |

**확정값 (approvals §8 — 코드 반영 완료)**

| 탭 | 확정 Lucide 이름 | 근거 (lucide-react 1.47.0 path 대조) |
|---|---|---|
| Library | **`book`** ✅ 적용 | `M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20` = 외곽 사각형 + 좌측 책등 + 하단 선반선. Figma 글리프의 세 요소와 1:1 대응 |
| Progress | **`chart-no-axes-column-increasing`** ✅ 적용 | `M5 21v-6` · `M12 21V9` · `M19 21V3` = 축 없는 막대 3개, 왼→오 증가. `chart-no-axes-column` 은 짧음-가장김-중간 순이라 불일치, `chart-column` 은 L자 축이 추가돼 불일치 |

### 10.1 `LUCIDE_STROKE_WIDTH` 상향 여부 — **상향하지 않는다** (실측 근거)

사용자 요청에 따라 **실제 렌더를 보고** 판단했다.

| 측정 (21px 아이콘 박스, 배경 246 / 잉크 88 기준 서브픽셀 커버리지 합) | 값 |
|---|---|
| Figma `25:87` Library 외곽선 두께 | **≈2.0 px** |
| Figma `25:87` Progress 막대 두께 / 막대 중심 간격 | **≈3.2 px** / **5.5 px** |
| 구현 `stroke-width 1.5` 렌더 두께 (24 viewBox → 21px, `×0.875`) | **1.31 px** |
| 구현 `stroke-width 2` 렌더 두께 | **1.75 px** |
| Lucide `chart-no-axes-column-increasing` 막대 중심 간격 | **6.1 px** |

판단:

1. **한 값으로 둘 다 맞출 수 없다.** Figma 두 글리프의 선 굵기가 서로 다르다(2.0 vs 3.2). Library 를 맞추려면 `≈2.3`, Progress 를 맞추려면 `≈3.7` 이 필요하다. Figma 의 Progress 는 stroke 가 아니라 **채워진 막대**이고 간격도 더 좁다(5.5 vs 6.1) — 굵기만 올려도 형태는 수렴하지 않는다.
2. **1.5 → 2 의 실제 시각 변화가 거의 없다.** `v3-tab-bar` demo(탭바 4개 · Lucide 글리프 8개, 361×456 = 164,616 px) 전체에서 두 설정의 diff 는 **839 px (0.51 %)** 이고, 글리프당 ≈105 px 의 옅은 안티에일리어싱 변화다. 3배 확대 비교에서도 Figma 와의 잔여 격차는 **글리프 기하**(Figma 쪽이 더 작고 막대가 두껍고 촘촘)가 지배하며 stroke 로는 좁혀지지 않는다.
3. **비용이 이득보다 크다.** Design Spec §4.2 · §8.3 은 Lucide stroke **1.5 단일 규격**이다. 탭 전용 예외를 두면 같은 화면의 TopBar 아이콘(20px · 1.5)과 굵기가 어긋나고, 아이콘 시스템에 축이 하나 늘어난다.

→ **`LUCIDE_STROKE_WIDTH = 1.5` 유지.** 다른 컴포넌트의 stroke 도 건드리지 않았다.
Figma 수준의 굵기가 필요하다면 올바른 해법은 stroke 예외가 아니라 두 글리프를 **HARU 전용 SVG**(`haru:tab-center-home` 방식)로 export 하는 것이며, 이는 디자이너·design-agent 결정 사항이다 (§8 허용 차이에 기록).

### 10.2 반영 내용

`packages/ui/src/icon/registry.ts` (`book` / `chart-no-axes-column-increasing` 로 교체, `book-open` · `chart-column` 은 등록 해제) →
`apps/web/src/dev/ui-gallery/TabBarDemo.tsx` 의 `TAB_ITEMS` →
`apps/web/src/dev/ui-gallery/ComponentsPage.tsx` 아이콘 갤러리 →
`packages/ui/src/tab-bar/__tests__/BottomTabBar.test.tsx` fixture →
baseline 7건 재생성 (§5).
**Design Spec §8.1 · `docs/COMPONENT_MAP.md` 갱신은 design-agent 소관이며 1-G 수정 범위 밖이다.**

---

## 11. `S1-D2-6` — 시각 비교 임계값 (**확정 · 반영 완료**, 2026-09-21 user)

**확정 적용값**: `maxDiffPixelRatio: 0.002` + `maxDiffPixels: 200` — `playwright.config.ts` 의 `VISUAL_MAX_DIFF_PIXEL_RATIO` · `VISUAL_MAX_DIFF_PIXELS` 상수. `provisional` 주석은 제거했다. Playwright 는 두 값 중 **엄격한 쪽**을 적용한다.

아래 §11 본문은 확정의 근거로 남긴 1-G 실측 자료다.

**실측 근거**

| 측정 | 값 |
|---|---|
| 동일 환경 2회 연속 실행 diff | **0 픽셀 / 0.0000 ratio** (50 tests × 2회 모두 통과) |
| `--update-snapshots` 재생성 후 SHA-256 | **27/27 바이트 동일** — 렌더 자체가 비트 단위로 재현된다 |
| prettier 포맷 변경 후 재실행 | 변화 없음 |
| baseline 픽셀 수 | 최소 `v9-icon-button` 25,992px · 최대 `frame-1024` 786,432px · 합계 6,024,233px |

**0.02 가 실제로 허용하는 변화량**

| baseline | 픽셀 | 0.02 허용 | 0.005 허용 | 0.001 허용 |
|---|---|---|---|---|
| `v9-icon-button` (최소) | 25,992 | 519 px (≈23×23 블록) | 129 | 25 |
| `v8-typography` | 30,324 | 606 px | 151 | 30 |
| `v6-bubble` | 98,914 | 1,978 px (≈44×44 블록) | 494 | 98 |
| `v1-button` | 251,978 | 5,039 px (≈71×71 블록) | 1,259 | 251 |
| `frame-1024` (최대) | 786,432 | 15,728 px (≈125×125 블록) | 3,932 | 786 |

→ 0.02 는 **아이콘 하나가 통째로 바뀌어도 통과**하는 수준이다. 반면 같은 환경 반복 측정의 실제 노이즈는 0 이다.

**권고안 (확정하지 마십시오)**

**확정 후 관측 (1-G 수정)**

1. 새 임계값에서 **전체 50건 2회 연속 통과**. baseline 27건 SHA 전부 동일.
2. 요소 단위 baseline 은 비율(0.002)이 먼저 걸린다 — `v9-icon` 은 아이콘 2개 교체(346 px)로 정상 실패했다.
3. 다만 **전체 화면 baseline 에서는 절대 상한 200 이 binding** 이라 같은 아이콘 교체(110–178 px)가 통과했다 → Non-blocking `S1-G-6` 에 기록. 프레임 회귀 탐지는 요소 단위 baseline 이 담당한다고 보고 확정값을 그대로 적용했다.
4. macOS 외 환경(CI Linux)에서 처음 실행할 때는 baseline 을 새로 만든다. `snapshotPathTemplate` 에 `{platform}` 이 들어 있어 섞이지 않는다.
5. Design Spec §10.3 말미 갱신은 **design-agent 소관**이며 1-G 수정 범위 밖이다.

---

## 12. 생성 · 수정 파일 (Stage 1 전체)

### 12.1 Stage 1-G 신규

| 경로 | 역할 |
|---|---|
| `playwright.config.ts` | E2E·시각 비교 설정 (결정성 조건 · **확정 임계값** `0.002` + `200`) |
| `tsconfig.e2e.json` | `playwright.config.ts` + `e2e/**` 타입 검사 (DOM lib 포함) |
| `e2e/support/gallery.ts` | 경로 상수 · 안정화 대기 · scenario 이동 |
| `e2e/visual.spec.ts` | 시각 baseline 27건 |
| `e2e/responsive.spec.ts` | viewport 4종 실측 · 200% 확대 reflow · reduced-motion 양방향 |
| `e2e/a11y.spec.ts` | focus 순회 · 터치 타깃 · 대비 |
| `e2e/scenarios.spec.ts` | scenario 5종 UI · 결정성 · Scenario Panel · 외부 요청 0건 |
| `e2e/__screenshots__/darwin/**` | baseline PNG 27개 (커밋 대상) |
| `apps/web/src/dev/dev.css` | dev 전용 평문 CSS (`haru-dev-*`, 토큰 값만) |
| `apps/web/src/dev/devSentinel.ts` | dev 번들 표식 |
| `apps/web/src/dev/DevGallery.tsx` | gallery route 트리 (동적 import 진입점) |
| `apps/web/src/dev/DevOverlay.tsx` | Scenario Panel 진입점 |
| `apps/web/src/dev/ui-gallery/primitives.tsx` | Section · Stage · ScreenFrame 등 |
| `apps/web/src/dev/ui-gallery/gallery-copy.ts` | gallery 데모 문구 (§5.0 톤) |
| `apps/web/src/dev/ui-gallery/GalleryLayout.tsx` | 상단 내비게이션 |
| `apps/web/src/dev/ui-gallery/TokensPage.tsx` | `/tokens` — 토큰 swatch + 가값 자료 |
| `apps/web/src/dev/ui-gallery/tokenScan.ts` | 적용된 스타일시트에서 `:root` 토큰 수집 (179개) |
| `apps/web/src/dev/ui-gallery/provisionalItems.ts` | P-01…P-16 승인 자료 표 |
| `apps/web/src/dev/ui-gallery/ComponentsPage.tsx` | `/components` — 22종 매트릭스 |
| `apps/web/src/dev/ui-gallery/TabBarDemo.tsx` | BottomTabBar 3 active + 확정 글리프(`book` / `chart-no-axes-column-increasing`) |
| `apps/web/src/dev/ui-gallery/StatesPage.tsx` | `/states` — 공통 상태 6종 + live scenario |
| `apps/web/src/dev/ui-gallery/ResponsivePage.tsx` | `/responsive` — 320/393/600/1024 iframe |
| `apps/web/src/dev/ui-gallery/FramePage.tsx` | `/frame` — 순수 앱 컬럼 화면 (측정 대상) |
| `apps/web/src/dev/ui-gallery/A11yPage.tsx` | `/a11y` — focus · 터치 타깃 · 대비 실측 |
| `apps/web/src/dev/ui-gallery/hitArea.ts` | `elementFromPoint` 기반 hit area 실측 |
| `apps/web/src/dev/ui-gallery/contrast.ts` | 렌더된 색 기반 대비 계산 |
| `apps/web/src/dev/scenario-panel/ScenarioPanel.tsx` | dev 전환 UI |
| `apps/web/src/dev/scenario-panel/devScenarios.ts` | `health` · `__states` 그룹 |
| `apps/web/src/dev/scenario-panel/scenario-selection.ts` | 우선순위 해석 · 직렬화 · URL/세션 동기화 |
| `apps/web/src/dev/__tests__/*` | 3파일 / 38건 |
| `docs/qa/assets/stage-1-tab-icons/*` | S1-D2-5 시각 비교 자료 5건 (1-G 수정에서 stroke 비교 1건 추가, `impl-v3-tab-bar.png` 갱신) |
| `docs/qa/stage-1-handoff.md` | **이 문서** (S1-C-1 통합) |

### 12.2 Stage 1-G 수정

| 경로 | 변경 |
|---|---|
| `package.json` | `test:e2e` = `playwright test` (+`test:e2e:update` · `test:e2e:report`), `typecheck` 에 `tsconfig.e2e.json` 추가, `@playwright/test ~1.63.0` |
| `apps/web/src/app/router.tsx` | dev gallery · overlay 를 `import.meta.env.DEV` 가드 + `lazy` 로 마운트 |
| `apps/web/src/shared/config/routes.ts` | dev 경로는 **넣지 않는다**는 근거 주석 (번들 잔존 방지) |
| `apps/web/src/app/providers/QueryProvider.tsx` | `retryOnMount: false` 추가 (S1-F-4 연장) |
| `apps/web/src/mocks/scenarios/scenario-store.ts` | `releaseAttempt` + `consumeAttempt` (취소된 요청은 시도 미소비) |
| `apps/web/src/mocks/scenarios/index.ts` | `consumeAttempt` export |
| `apps/web/src/mocks/health/MockHealthApi.ts` | `consumeAttempt` 사용 |
| `apps/web/__tests__/mock-source-rules.test.ts` | dev 경계 규칙 5건 추가 (정적 강제) |
| `packages/ui/src/feedback/Spinner.css` | reduced-motion 에서 회전 정지 (`S1-G-3`) |
| `scripts/assert-no-mocks.mjs` | sentinel 3종 검사로 확장 |
| `scripts/pending-script.mjs` | **삭제** (소비자 0) |

### 12.3 단계별 원본 문서 (상세)

| 단계 | 문서 | 범위 |
|---|---|---|
| 1-A | `docs/qa/stage-1a-handoff.md` | 툴체인 · 워크스페이스 · `packages/config` · lint 규칙 |
| 1-C | `docs/qa/stage-1c-handoff.md` | `packages/contracts` (enum 23 · Error Code 28 · 전이 표 · rules) |
| 1-D1 | `docs/qa/stage-1d1-handoff.md` | `packages/ui` 최초 8종 · 스타일링 방식 결정 |
| 1-D2 | `docs/qa/stage-1d2-handoff.md` | Shared UI 나머지 14종 · HARU SVG · Lucide 고정 |
| 1-E | `docs/qa/stage-1e-handoff.md` | `apps/web` 셸 · Vite · Tailwind · Router · Layout · Error Boundary |
| 1-F | `docs/qa/stage-1f-handoff.md` | `shared/api` · Mock Layer · `health` 도메인 · Adapter 선택 지점 |
| 1-G | 이 문서 §10 · §11 · §12.1 | dev gallery · Scenario Panel · Playwright · 통합 |

> `docs/qa/stage-1b-handoff.md` 는 존재하지 않는다. 1-B(`packages/design-tokens`) 결과는 1-E §3 · §4 (Tailwind 컴파일 검증 · Inter preload)에 이월 해소 기록으로 남아 있다.

---

## 13. `BACKEND_INTEGRATION_PENDING`

**Stage 1 전체 0건** (Plan §10 과 일치). Backend 없이 Mock · 정적 검사 · Playwright 로 모든 In Scope 항목을 검증할 수 있다.

Stage 8 Handoff 에 옮길 **기록 대상** (PENDING 판정 대상 아님):

| 항목 | 내용 | 대상 문서 |
|---|---|---|
| `GET /v1/health` | `{status:'ok', version, serverTime}` · 공개 endpoint · 오류 `INTERNAL_ERROR` · `RATE_LIMITED` | `BACKEND_HANDOFF.md` · `API_CONTRACTS.md` |
| contracts 재사용 | enum 23 · Error Code 28 + HTTP status 매핑 · Error Envelope · Pagination · `SESSION_TRANSITIONS` 12행 · 상수 5종을 **그대로 import**, 재선언 금지 | `BACKEND_HANDOFF.md` |
| contracts 컴파일 | `exports` 가 TS 소스를 가리킨다. Node 런타임 재사용 시 `--module nodenext` 컴파일 필요 | `BACKEND_HANDOFF.md` |
| `X-Request-Id` echo | 서버가 요청 uuid 를 응답 헤더 · Error Envelope `requestId` 로 되돌려야 한다 | `ERROR_CODES.md` |
| Error Envelope 준수 | 형식 불일치 시 Frontend 는 `INTERNAL_ERROR` 로 강등한다 | `ERROR_CODES.md` |
| `https:` 강제 | Http Adapter 가 비-HTTPS base URL 을 생성 시점에 거부한다 | `BACKEND_HANDOFF.md` |
| `Authorization` 주입 훅 | 훅만 존재, 실제 공급자(`AuthGateway`)는 Stage 2 | `AUTH_REQUIREMENTS.md` |
| `Idempotency-Key` | 전송 슬롯만 구현. 서버 측 (caregiverId, key) 24h 보관·재생 규칙 필요 | `BACKEND_HANDOFF.md` |

---

## 14. Scope 경계에서 보류한 항목

| 항목 | 이유 |
|---|---|
| 실제 제품 화면 (Auth · 동의 · 온보딩 · Home 콘텐츠 · Activity Card · 세션 · 녹음 · 리포트) | Stage 2–7. `/` 는 임시 placeholder 유지 |
| `Mock<Domain>Api` 11종 stub | D-8 — `health` 만 완전 구현, 빈 stub 은 dead code |
| `AuthGateway` · `recordingApi` · `UploadTransport` | Stage 2 · 4 |
| Stage 2–8 scenario key · fixture | Plan §8.4 |
| `BottomTabBar` 실제 마운트 · 탭 route | Stage 3 (gallery 에서만 렌더) |
| RouteGuard 판정 순서 | `GET /v1/me` 계약 의존 — Stage 2 |
| `apps/mobile` (Capacitor) | Stage 4 (결정 #7) |
| Supabase JS Client · MSW | #8 · #27 — 설치하지 않음 |
| 가값 P-01…P-16 확정 | Plan §17 — Stage 1 QA 이후 사용자 항목별 승인. gallery `/tokens` 하단이 자료를 제시한다 |
| 탭 아이콘 글리프 교체 · 시각 임계값 확정 | §10 · §11 — 사용자 결정 대상 |
| git commit / push | 사용자 요청 없음 |

---

## 15. stage-qa-agent 재현 절차

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm lint:boundaries
pnpm test
pnpm format:check

# Production 배제 검증 (이 순서로)
VITE_API_MODE=http pnpm build
pnpm assert:no-mocks

# E2E · 시각 비교 (dev 서버를 Playwright 가 직접 띄운다)
pnpm test:e2e
# 리포트: pnpm test:e2e:report / 스냅샷 갱신: pnpm test:e2e:update

# 수동 확인 (dev 서버)
pnpm dev
#   http://localhost:5173/__dev/ui/tokens
#   http://localhost:5173/__dev/ui/components
#   http://localhost:5173/__dev/ui/states?scenario=__states:empty
#   http://localhost:5173/__dev/ui/responsive
#   http://localhost:5173/__dev/ui/a11y
```

주의:

- gallery 는 **dev 서버에서만** 열린다. `pnpm preview`(Production 빌드)에는 존재하지 않는 것이 정상이며, 그것이 AC-1-42 의 증거다.
- `pnpm assert:no-mocks` 는 **직전 빌드 산출물**을 검사한다. `mock` 모드로 빌드한 뒤 실행하면 (의도대로) 실패한다.
- 시각 baseline 은 macOS/Chromium 기준이다. 다른 OS 에서 처음 실행하면 새 플랫폼 디렉터리에 baseline 이 생성되며, 그 자체는 실패가 아니다.

---

## 16. Stage 1-G 수정 — 승인 결정 4건 반영 (2026-09-21)

`docs/decisions/stage-1-approvals.md` §8 의 사용자 결정만 반영했다. 그 밖의 기능 변경·리팩터링은 없다.

| 결정 | 반영 | 수정 파일 |
|---|---|---|
| **S1-G-1** PageIndicator `interactive` 폐기 | `variant` · `onSelect` · `itemLabels` prop, 버튼 렌더 분기, 키보드 처리, `--interactive` CSS 와 `::before` 44 hit area 확장을 **제거**. 표시 전용으로 확정. §4.19 dot 7 / gap 6 기하는 **그대로 유지**. 타입 `PageIndicatorVariant` 도 제거 | `packages/ui/src/progress/PageIndicator.tsx` · `PageIndicator.css` · `packages/ui/src/index.ts` · `__tests__/PageIndicator.test.tsx` · `apps/web/src/dev/ui-gallery/ComponentsPage.tsx` · `A11yPage.tsx` · `e2e/a11y.spec.ts` |
| **S1-G-2** TextField 42px 유지 | 토큰 값 **변경 없음**. 정의 위에 `/* accepted deviation: S1-G-2 (field row 42 < touch 44, approvals §8) */` 주석 추가. manifest 집계를 위해 `ACCEPTED_RE` ID 패턴 확장 | `packages/design-tokens/src/component/index.css` · `scripts/parse-tokens.mjs` |
| **S1-D2-5** 탭 아이콘 글리프 | `book` / `chart-no-axes-column-increasing` 로 교체. **`LUCIDE_STROKE_WIDTH` 는 1.5 유지** (근거 §10.1) | `packages/ui/src/icon/registry.ts` · `apps/web/src/dev/ui-gallery/TabBarDemo.tsx` · `ComponentsPage.tsx` · `packages/ui/src/tab-bar/__tests__/BottomTabBar.test.tsx` |
| **S1-D2-6** 시각 비교 임계값 | `maxDiffPixelRatio: 0.002` + `maxDiffPixels: 200`, `provisional` 주석 제거 | `playwright.config.ts` · `e2e/visual.spec.ts` (주석) |

**제품 화면 회귀**: 없음. PageIndicator 는 Stage 1 제품 화면에 마운트되지 않으며(gallery 전용), 탭바도 `/` 에 붙지 않는다 (Design Spec §11-8).

**PageIndicator 공개 API (변경 후)**

```ts
interface PageIndicatorProps {
  count: number;
  index: number;   // 0-based
  label?: string;  // 스크린리더용 위치 텍스트 ("2 of 3") — 문구는 앱이 소유
}
```

**문서 갱신이 남은 항목 (design-agent 소관 — Stage 1 QA 이후)**

- Design Spec §4.19 — `interactive` variant 삭제
- Design Spec §9.3 — 터치 타깃 표에서 PageIndicator dot 제거, TextField 행 + `S1-G-2` 수용 예외 추가
- Design Spec §8.1 — 탭 아이콘 대응표를 `book` / `chart-no-axes-column-increasing` 로 갱신
- Design Spec §10.3 — 시각 비교 임계값 확정값 반영
- `docs/COMPONENT_MAP.md` — PageIndicator variant · 탭 아이콘

---

## 17. QA 수정 루프 1회차 — `QA-1-001` (2026-09-21)

`docs/qa/stage-1-qa-report.md` 의 **`QA-1-001` 한 건만** 수정했다. `QA-1-002`(TextField 밑줄, 사용자 결정 대기) · `QA-1-003`(baseline 겹침)은 **건드리지 않았다.**

### 17.1 원인

`packages/config/eslint/base.js` 의 `'no-console': ['error', { allow: ['warn','error'] }]` 때문에 `console.warn` / `console.error` 가 저장소 어디서나 허용됐다. 그 결과 `packages/ui/src/icon/Icon.tsx:39` 가 PII 금지 logger 를 우회해 `console.warn` 을 직접 호출했고, `apps/web/src/shared/lib/logger.ts` 머리주석의 불변 규칙("저장소에서 `console` 에 직접 접근하는 곳은 이 파일 하나뿐")이 **사실이 아니었다**. 현재 인자는 아이콘 이름이라 실제 PII 유출은 아니었으나, Stage 2 부터 아이 이름·transcript 를 다룰 때 가장 흔한 누출 경로가 무방비였다.

### 17.2 수정

| # | 내용 | 파일 |
|---|---|---|
| 1 | `no-console` 을 **`'error'`(예외 옵션 없음)** 으로 변경. `warn`/`error` 포함 `console.*` 전면 차단 | `packages/config/eslint/base.js:106-110` |
| 2 | 제품 코드 예외를 **경로 단위 명시 허용 2개**로 고정 (`haru/console-allowlist`) | `eslint.config.js` |
| 3 | `packages/ui` 전용 개발자 경고 모듈 신설 — `console` 접근은 이 파일 하나 | `packages/ui/src/lib/devWarn.ts` (신규) |
| 4 | `Icon.tsx` 의 `console.warn` → `devWarn('Icon', 'missing-accessible-name', name)` | `packages/ui/src/icon/Icon.tsx` |
| 5 | `logger.ts` 머리주석을 **사실과 일치**하도록 수정 (`apps/web` 기준 + 나머지 1개 경로 + 자동 검증 위치 명시) | `apps/web/src/shared/lib/logger.ts` |
| 6 | 회귀 방지 테스트 2종 추가 | `packages/config/__tests__/no-console-invariant.test.ts` (신규) · `packages/ui/src/lib/__tests__/devWarn.test.ts` (신규) |
| 7 | `packages/ui` vitest include 를 `*.test.{ts,tsx}` 로 확장 (기존 `.tsx` 전용이라 lib 모듈 테스트가 실행되지 않았다) | `packages/ui/vitest.config.ts` |

**`Icon.tsx` 처리 방식 선택 근거** — Design Spec §4.2 가 "`label` 없고 `decorative` 아니면 **런타임 경고 + 타입 에러**" 를 요구하므로 경고를 삭제하면 승인된 명세에서 벗어난다. 한편 `packages/ui` 는 `apps/web` 을 import 할 수 없어(`rules/architecture.md` §2 · dependency-cruiser `no-package-to-app`) 앱 logger 를 쓸 수 없다. 따라서 **logger 와 같은 원칙(화이트리스트 기반 살균)을 `packages/ui` 안에서 독립 구현**하고, eslint 예외를 그 한 파일로 좁혔다. 예외 범위는 넓어지지 않는다 (제품 코드 기준 1개 → 2개이며, 이전에는 **모든 파일**에서 `warn`/`error` 가 허용됐다).

`devWarn` 의 PII 차단 구조:
- 문구는 호출자가 문자열을 넘기지 못하고 `DevWarnIssue` 리터럴 유니온 → 고정 문구 표에서만 고른다. 자유 입력이 출력 경로에 닿지 못한다.
- 유일한 런타임 값 `subject` 는 `[A-Za-z0-9:_-]` 밖 문자를 `_` 로 치환하고 64자로 자른다.
- `packages/ui` 는 도메인 지식이 없어(`no-ui-to-contracts`) 넘어올 수 있는 값이 개발자 식별자뿐이다.

### 17.3 음성(negative) 테스트 — QA C-11 과 같은 입력

```
$ printf 'export function leak(childName: string) {\n  console.error("child", childName);\n  console.warn("transcript", childName);\n  console.log("blocked", childName);\n}\n' \
    | npx eslint --stdin --stdin-filename apps/web/src/features/probe.ts
  2:3  error  Unexpected console statement  no-console   ← console.error
  3:3  error  Unexpected console statement  no-console   ← console.warn
  4:3  error  Unexpected console statement  no-console   ← console.log
✖ 3 problems (3 errors, 0 warnings)      exit=1
```

| 경로 | 결과 |
|---|---|
| `apps/web/src/features/probe.ts` | **3/3 차단** (수정 전 1/3) |
| `packages/ui/src/icon/Other.tsx` | **2/2 차단** |
| `apps/web/src/shared/lib/logger.ts` (허용) | exit 0 |
| `packages/ui/src/lib/devWarn.ts` (허용) | exit 0 |
| `apps/web/src/shared/lib/other.ts` · `packages/ui/src/lib/other.ts` | 차단 — 예외가 **파일 단위**임을 확인 |

### 17.4 남긴 자동 테스트

`packages/config/__tests__/no-console-invariant.test.ts` (8건)
1. `no-console` 규칙 값이 옵션 없는 `'error'` 인지 (설정 shape)
2. **실제 eslint 실행** — 저장소 루트 설정을 그대로 로드해 `log`·`info`·`debug`·`warn`·`error` **5종 전부** 차단 확인 (apps/web · packages/ui 각각)
3. 허용 경로 2개에서는 보고 0건 (`it.each`)
4. 허용이 **파일 단위**임 — 같은 디렉토리의 다른 파일은 차단
5. **저장소 스캔** — `apps/*/src` · `packages/*/src` 제품 소스 중 `console.*` 에 직접 접근하는 파일 집합이 허용 목록과 **정확히 일치**(양방향). 허용 목록이 늘거나 새 우회가 생기면 실패한다 → `logger.ts` 머리주석의 불변 규칙이 자동 검증된다

`packages/ui/src/lib/__tests__/devWarn.test.ts` (4건) — 고정 문구 출력 · 자유 입력 살균(`'Mia said she was scared'` → 원형 미출력) · 64자 절단 · `subject` 생략.

**변이(mutation) 검증**: `no-console` 을 수정 전 값으로 되돌리고 `packages/ui/src/lib/tmpLeak.ts`(console.warn 포함)를 추가한 상태에서 위 테스트 중 **5건이 실패**함을 확인했다 (테스트가 헛돌지 않음). 이후 원상 복구.

### 17.5 검증 명령 결과 (전부 재실행)

| 명령 | Exit | 결과 | 기준선 대비 |
|---|---|---|---|
| `pnpm typecheck` | 0 | root + e2e + 전 패키지 통과 | 동일 |
| `pnpm lint` | 0 | 오류 0 · warning 0 | 동일 |
| `pnpm lint:boundaries` | 0 | `no dependency violations found (240 modules, 599 dependencies cruised)` | 236→240 modules (신규 파일 4) |
| `pnpm test` | 0 | **Test Files 60 passed / Tests 452 passed** | 58/440 → **60/452 (+2 파일 / +12건)** |
| `pnpm build` | 0 | `index` 390.54 kB (http 모드 기본) | 동일 수준 |
| `pnpm assert:no-mocks` | 0 | sentinel 3종 0건 | 동일 |
| `pnpm format:check` | 0 | All matched files use Prettier code style | 동일 |
| `pnpm test:e2e` | 0 | **50 passed (51.1s)**, baseline png **27건 변경 없음** | 동일 |

감소한 항목 없음. 증가분은 전부 이번 회귀 방지 테스트다.

### 17.6 보고

- **Blocking**: 없음
- **Non-blocking**: `packages/ui/vitest.config.ts` 의 include 가 `.tsx` 전용이라 `packages/ui` 의 `.ts` 모듈 테스트가 **조용히 실행되지 않고 있었다**(기존 `lib/cx.ts` · `lib/motion.ts` 는 테스트 자체가 없어 드러나지 않음). include 를 `{ts,tsx}` 로 넓혀 해결했다.
- **NEEDS_DECISION**: 없음
