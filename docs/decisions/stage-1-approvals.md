# Stage 1 Approval Log

사용자 결정 기록 (Orchestrator 작성). 항목 번호는 `docs/plans/stage-1-plan.md` §16 (D-1~D-10) 기준이며,
Stage 1-A 구현 이후 추가로 발생한 결정은 §2 (S1A-xx) 에 기록한다.
결정과 기존 문서 내용이 다르면 **이 기록이 우선**하며, 해당 문서는 결정 반영 시 갱신한다.
Stage 0 결정(#·C-·D-·P-·L- 계열)은 `docs/decisions/stage-0-approvals.md` 를 그대로 유지한다.

## 1. Stage 1 Plan §16 세부 결정 — 전부 승인 (O)

승인 일자: **2026-09-18, user** (Stage 1 Plan + Stage 1 Design Spec 승인 체크포인트, rules/workflow.md §3).
각 항목은 Plan §16 표의 **권장안 그대로** 확정되었다. 별도 수정·대안 채택은 없다.

| ID | 결정 항목 | 결과 | 확정 내용 (Plan §16 권장안) | 근거 |
|---|---|---|---|---|
| D-1 | import 경계 lint 도구 | **O 승인** | dependency-cruiser 단일 도구 + `.dependency-cruiser.cjs` 규칙 6종 + `pnpm lint:boundaries` | Plan §16 D-1 (사용자가 이번 세션에서 "dependency-cruiser 사용" 명시) |
| D-2 | Lucide 버전 고정 방식 | **O 승인** | `packages/ui` 에 정확 버전 `lucide-react` 고정 + lockfile 커밋 + root `pnpm.overrides` | Plan §16 D-2 |
| D-3 | Inter self-host 방식 | **O 승인** | `@fontsource-variable/inter` (variable, latin subset, woff2) 를 `packages/design-tokens` dependency로 추가, `@font-face` 는 `src/fonts.css` 단일 지점, preload 1개, 외부 CDN 미사용 | Plan §16 D-3 (사용자가 이번 세션에서 "Inter self-host" 명시) |
| D-4 | 이미지 최적화 포맷·해상도 (C-17) | **O 승인** | 벡터 SVG / 래스터 AVIF + WebP + PNG fallback, `<picture>`+`srcset`, 해상도 상한(1440 / 696 / 360 / 216), `pnpm assets:optimize` (devDependency `sharp`) 로 산출물 커밋, Stage 1 범위 = 정책·스크립트·SVG 파이프라인 | Plan §16 D-4 (사용자가 이번 세션에서 "sharp 추가" 명시) |
| D-5 | Mock scenario 전환 방식 | **O 승인** | 3계층 + 우선순위 (URL query > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`), 주입 `clock`·`idFactory`·timer 로 결정성 확보 | Plan §16 D-5 |
| D-6 | Production 빌드의 Mock 처리 (OAQ-21) | **O 승인** | `VITE_API_MODE` = `mock` \| `http`, Mock은 동적 import 경계, sentinel + `pnpm assert:no-mocks` 로 `http` 빌드 산출물 검증 | Plan §16 D-6 |
| D-7 | Http Adapter 골격 작성 시점 (OAQ-20) | **O 승인** | 각 Stage에서 Mock과 동시에 작성. Stage 1은 `httpClient` + `HttpHealthApi` | Plan §16 D-7 |
| D-8 | 도메인별 `Mock<Domain>Api` 골격의 Stage 1 범위 | **O 승인** | Stage 1은 `health` 도메인만 완전 구현(레퍼런스) + 공통 helper 완성, 나머지 11개 도메인 stub 파일 생성 금지 | Plan §16 D-8 |
| D-9 | Component 테스트 DOM 환경 | **O 승인** | `jsdom` 기본, 성능 문제 관측 시 `happy-dom` 재검토 | Plan §16 D-9 |
| D-10 | Node LTS / pnpm / 라이브러리 버전 정책 | **O 승인** | **Plan §16.1 버전 표 전체가 승인 범위**에 포함된다 (아래 §1.1) | Plan §16 D-10 · §16.1 |

### 1.1 D-10 — §16.1 버전 표 승인 범위

- Plan `docs/plans/stage-1-plan.md` §16.1 의 **버전 표 전체**와 그 아래 **공통 원칙 1~5**가 승인되었다.
- 사용자가 이번 승인 세션에서 **명시적으로 확인한 항목**:
  - **Vitest 4.1.11** (major 5 미채택)
  - **React Router 8.4.0** (§16.1의 보수적 대안 `7.18.4` 는 채택하지 않음)
  - **sharp 추가** (devDependency, 에셋 최적화 스크립트 전용 — D-4)
  - **dependency-cruiser 사용** (import 경계 검증 — D-1)
  - **Inter self-host** (`@fontsource-variable/inter` — D-3)
- 나머지 행(Node.js, pnpm, TypeScript, typescript-eslint, ESLint, React/React DOM, TanStack Query, Zod, Vite, @vitejs/plugin-react, Tailwind CSS, @testing-library/react, jsdom, Playwright, lucide-react, Prettier, eslint-plugin-react-hooks)도 표에 기재된 권장 버전·고정 방식대로 승인되었다.
- §16.1 공통 원칙 5에 따라 **구현 착수 시점에 registry를 재확인**하고 차이가 있으면 Handoff 메모에 기록한다. 실제 설치된 고정 버전의 최종 기록 위치는 development-agent의 `docs/qa/stage-1-handoff.md` 다.

## 2. 2026-09-19 추가 결정 (Stage 1-A 구현 후 발견 항목)

Stage 1-A 구현 이후 발견된 항목(Finding **F-1~F-4**)에 대한 사용자 결정. 일자: **2026-09-19, user**.
**출처**: `docs/qa/stage-1a-handoff.md` — development-agent가 Stage 1-A 구현 후 작성한 인계 문서. F-1~F-4 는 그 문서의 Finding ID이며, 해당 문서는 후속 구현으로 갱신되어 **§11 이 신설**되었다.
이 결정들은 §1 의 승인 내용을 **뒤집지 않으며**, Plan §16 승인값은 그대로 유지된다.

| ID | 발견 항목 (출처 Finding) | 결정 | 근거 / 확인 |
|---|---|---|---|
| **S1A-1** | **F-1** (`docs/qa/stage-1a-handoff.md`) — Node 버전 고정의 실효성. pnpm 12가 루트 프로젝트의 `engines.node` 를 강제하지 않아 승인된 Node 고정이 실효 없음이 확인됨 (Node v24.16.0 환경에서 `pnpm install --frozen-lockfile` 이 exit 0 으로 통과) | **preinstall 가드 스크립트 추가 + 로컬 Node를 24.21.0 으로 업그레이드.** 승인값(`.nvmrc` = `24.21.0`, `engines.node` = `">=24.21.0 <25"`)은 **변경하지 않는다**. Node 업그레이드는 **사용자가 직접 수행**하며 **Stage 1-B의 선결 조건**이다 | Plan §16.1 D-10 (Node 행) · §9.0 루트 구성. 실행 확인 2026-09-19 |
| **S1A-2** | **F-3** (`docs/qa/stage-1a-handoff.md`) — `eslint-plugin-jsx-a11y` 가 Plan §9.1 에서 "선택"으로만 표기되어 도입 여부가 미확정 | **도입 승인.** §16.1 버전 표에 없던 **신규 devDependency** 이며, 실제 고정 버전은 **development-agent가 Handoff 문서에 기록**한다 | Plan §9.1 (`eslint/react.js` — "react-hooks, jsx-a11y(선택)") · rules/frontend.md §9 접근성. 결정 2026-09-19 |
| **S1A-3** | **F-2** (`docs/qa/stage-1a-handoff.md`) — root script `install`. npm/pnpm에서 `install` 은 설치 라이프사이클 훅이므로 root script로 정의하면 재귀 호출이 된다 | **Plan §9.0 문구를 수정**하고 **코드는 현 상태 유지**. `pnpm install --frozen-lockfile` 은 pnpm **내장 명령**으로 정상 동작함이 확인되었으며, rules/qa.md §4 가 참조하는 명령 자체는 그대로 유효하다 | Plan §9.0 root scripts 목록 · rules/qa.md §4. 확인·결정 2026-09-19 |
| **S1A-4** | **F-4** (`docs/qa/stage-1a-handoff.md`) — Plan 머리말이 참조하는 `docs/decisions/stage-1-approvals.md` 파일이 저장소에 없음 | **이 문서(`docs/decisions/stage-1-approvals.md`)의 생성 승인** | Plan 머리말 Status 줄의 참조. 결정 2026-09-19 |

### 2.1 구현 확정 사실 (2026-09-19, development-agent 구현 완료 · 사용자 재검증)

S1A-1 · S1A-2 의 결정이 구현으로 확정된 내용. 상세는 `docs/qa/stage-1a-handoff.md` §11.

| 대상 | 확정 사실 | 알려진 제약 / 동작 특성 |
|---|---|---|
| **S1A-2** — `eslint-plugin-jsx-a11y` | 고정 버전 **`^6.10.2`** (`packages/config` devDependency, 2026-09-19 registry latest) | 이 플러그인의 peer 범위가 `eslint ^9` 까지라 **ESLint 10 에서 peer 경고 1건**이 발생한다. 실동작은 음성 테스트로 확인됨 (alt 없는 `img`, `onClick` 만 있는 `div` 등에서 규칙 정상 발화) |
| **S1A-1** — preinstall 가드 | **`scripts/check-node-version.mjs`** 를 루트 `package.json` 의 `preinstall` 로 연결. `engines.node` 를 읽어 판정하므로 **버전 하드코딩 없음**, 외부 semver 의존 없음, 우회 옵션 없음 | pnpm 12 는 `node_modules` 가 이미 최신이면 설치 작업과 함께 `preinstall` 도 **건너뛴다**. 따라서 가드는 실제 설치가 발생할 때(fresh clone, lockfile 변경, `--force`, `node_modules` 부재) 발화한다 |

## 3. 반영 상태

- `docs/plans/stage-1-plan.md` §9.0 root scripts 목록: S1A-3 반영 — 나열에서 `install` 제거 + 내장 명령 주석 추가 (2026-09-19)
- `docs/plans/stage-1-plan.md` 머리말 Status 줄: 이 문서 참조가 실제 파일을 가리키며 §2 추가 결정(S1A-1~S1A-4)이 여기에 기록되었음을 명시 (2026-09-19)
- S1A-1 preinstall 가드 스크립트: **구현 완료** (`scripts/check-node-version.mjs` — §2.1). 로컬 Node 24.21.0 업그레이드는 **Stage 1-B 선결 조건**이며 사용자가 직접 수행
- S1A-2 `eslint-plugin-jsx-a11y` 고정 버전: **확정 `^6.10.2`** (§2.1, 출처 `docs/qa/stage-1a-handoff.md` §11)

## 4. 2026-09-20 추가 결정 (Stage 1-B 구현 착수 시점)

사용자 결정 일자: **2026-09-20, user**. Stage 1 Design Spec §13.3-c 의 승인 대기 항목에 대한 확정이다.
§1 · §2 의 승인 내용을 뒤집지 않는다.

| ID | 항목 | 결정 | 출처 |
|---|---|---|---|
| **S1-D3** | 신규 토큰 3종 도입 | **O 승인**. ① `--material-glass-fill-fallback` = `--haru-white-a90` (**알파 유지** — 불투명 합성 `#f9f9fb` 아님) ② `--tabbar-icon-size` = **21** 고정 (아이콘 3단계 16/20/24 의 예외) ③ `--layout-tabbar-center-overhang` = **35** | Design Spec §13.3-c S1-D3 · §3.2.4 · §3.3 · §3.2.3 |
| **S1-D2 (일부)** | 가값 채택값 확정 | `--radius-surface` = **22** (Stage 1 대상 기준) · `--layout-gutter` = **24** · `--gradient-app` 중간 stop = **46%** · primary button height(`--size-button-lg`) = **56** · medallion = **136 / 188 / 232** + ring-offset **8** | Design Spec §12.2 |

> 위 값이 확정되었다고 해서 해당 항목의 **가값(provisional) 상태가 해제되는 것은 아니다.**
> P-12 · P-13 · P-14 · P-15 · P-16 은 여전히 디자이너 승인 대기이며 토큰 정의의 `provisional` 주석을 유지한다.
> `--size-medallion-ring-offset`(8) 은 Design Spec §3.6 provisional 위치표에 없으므로 주석 대상이 아니다.

### 4.1 Stage 1-B 구현으로 확정된 사실

| 대상 | 확정 사실 |
|---|---|
| 패키지 | `@haru/design-tokens` 생성. 소스 `packages/design-tokens/src/**`, 산출물 `packages/design-tokens/dist/**` (`.gitignore` 대상, `pnpm build` 로 재생성) |
| 3-tier 위치 | Tier 1 `src/primitive/*.css` · Tier 2 `src/semantic/*.css` + `src/theme.css` · Tier 3 `src/component/index.css` |
| Tier 3 경계 | Tier 3 는 진입점 `index.css` 에 **포함하지 않고** `@haru/design-tokens/component.css` 로만 export 한다. `packages/ui` 전용 (Design Spec §3.3) |
| `@theme` 구성 | 네임스페이스 초기화(11종)는 `src/theme.css`, 개별 semantic 선언은 각 `semantic/*.css` 의 `@theme static` 블록. Design Spec §3.6 의 "토큰 ↔ 파일" 매핑을 지키기 위한 배치다. `static` 은 `packages/ui` 가 utility 가 아닌 `var()` 로도 참조하므로 미사용 tree-shaking 을 막기 위함 |
| Inter self-host | `@fontsource-variable/inter` **5.3.0** (`~5.3.0`, `packages/design-tokens` dependency). `files/inter-latin-wght-normal.woff2` (48,256 bytes, latin · wght · normal) 1개만 `scripts/sync-fonts.mjs` 가 `dist/assets/` 로 복사하고 `Inter-LICENSE.txt`(SIL OFL)를 동봉한다. `@font-face` 단일 선언 지점 = `src/fonts.css`, `font-display: swap`, family 이름 `Inter` |
| Inter preload | `apps/web/index.html` 의 woff2 `<link rel="preload">` 는 `apps/web` 이 없으므로 **Stage 1-C 로 유예** |
| eslint 범위 | `packages/config/eslint/base.js` 의 `haru/tooling-files` glob 을 `scripts/**` → `**/scripts/**` 로 확장 (패키지 빌드 스크립트가 Node 전역을 쓰도록). Stage 1-A 설정의 범위 보완이며 규칙 내용 변경은 없다 |
| root script 문구 | `build` / `dev` / `test:e2e` 의 pending 메시지에서 "Stage 1-B" → "Stage 1-C" 로 정정 (apps/web 은 Stage 1-C). 동작 변경 없음 |

## 5. Stage 1-C 구현으로 확정된 사실 (2026-09-20, development-agent)

Stage 1-C = `packages/contracts` 구현. **새 결정이 아니라 승인된 값의 구현 확정 기록**이며,
§1 · §2 · §4 의 승인 내용을 뒤집지 않는다. 상세는 `docs/qa/stage-1c-handoff.md`.

| 대상 | 확정 사실 |
|---|---|
| 패키지 | `@haru/contracts` 생성. 진입점 `exports: { ".": "./src/index.ts" }` (빌드 산출물 없음 — 소비자가 번들/컴파일한다). deep import 금지 |
| 런타임 의존 | **`zod` 하나뿐** — `^4.6.5` (설치 `4.6.5`). Plan §16.1 D-10 승인값과 일치하며 registry latest 와도 동일(2026-09-20 재확인, 공통 원칙 5) |
| 범위 | common 5 파일 · enum 23 종(20 파일) · rules 3 파일 · health 1 파일 + `src/index.ts`. Stage 2~8 도메인 schema 는 **생성하지 않았다** (D-8) |
| 상수 배치 | `MAX_RECORDED_SECONDS`(1800) · `READY_ABANDON_SECONDS`(600) = `src/rules/recording-limits.ts` (Plan §7.1 · §18-①). `rules/index.ts` 가 3 파일을 함께 re-export |
| 리포트 기준 | `MIN_REPORT_RECORDED_SESSIONS`=**3** · `MIN_REPORT_RECORDED_SECONDS`=**3600** · `REPORT_CYCLE_DAYS`=**28** (결정 #17). `isReportEligible` 은 `cycle_in_progress` 를 반환하지 않는다 (주기 판정은 Stage 7 호출부) |
| 상대 import 표기 | `packages/contracts` 내부 상대 import 는 **확장자 `.js` 를 명시**한다 (`'./error-codes.js'`). Plan §7.3 "브라우저·Node 양쪽에서 동작" 을 만족시키기 위함 — 확장자가 없으면 tsc 로 컴파일한 산출물이 Node ESM 에서 로드되지 않는다. 검증: `--module nodenext` 컴파일 산출물을 Node 24 에서 import 성공 |
| 경계 규칙 보정 | `.dependency-cruiser.cjs` 의 `contracts-runtime-deps-zod-only` · `contracts-no-workspace-deps` 의 `from.pathNot` 에 **패키지 자체 툴체인 설정 파일**(`vitest.config.ts` 등)을 추가했다. 두 규칙은 배포되는 런타임 코드(`src/**`)에만 적용되며, 규칙의 **의도·적용 대상은 변경되지 않았다** (Stage 1-A 설정의 오탐 보정) |

## 6. Stage 1-D1 구현으로 확정된 사실 (2026-09-20, development-agent)

Stage 1-D1 = `packages/ui` 최초 생성 + Shared UI 8종. 상세는 `docs/qa/stage-1d1-handoff.md`.
§1 · §2 · §4 · §5 의 승인 내용을 뒤집지 않는다.

| 대상 | 확정 사실 |
|---|---|
| 범위 확정 (사용자, 2026-09-20) | Stage 1-D1 구현 대상은 **8종**: Button + ButtonGroup(§4.4) · IconButton(§4.5) · TextField + FieldGroup(§4.13) · Checkbox + CheckboxGroup(§4.14) · RadioGroup(§4.17) · Chip(§4.16) · Tag(§4.15) · ProgressBar(§4.18) |
| 범위 제외 (사용자, 2026-09-20) | **Textarea · Select · Avatar 3종은 Stage 1 범위 밖**으로 확정. 근거: Textarea = Stage 5, SelectTrigger = Stage 2(COMPONENT_MAP), Avatar 는 Figma·Design Spec 어디에도 없음 |
| Chip ↔ Tag 역할 | Chip = 선택·인터랙션(`<button aria-pressed>`), Tag = 상태·정보 표시(비인터랙티브 `<span>`). 하나로 합치지 않는다 |
| 패키지 | `@haru/ui` 생성. 진입점 `exports: { ".": "./src/index.ts", "./styles.css": "./src/styles.css" }`. dependency = `@haru/design-tokens` 하나, react·react-dom 은 peer + dev |
| 설치 버전 | react 19.3.0 · react-dom 19.3.0 · @testing-library/react 16.3.3 (전부 Plan §16.1 승인값과 일치). §16.1 표에 없던 신규 devDependency: `@types/react` 19.3.0 · `@types/react-dom` 19.3.0 · `@testing-library/dom` 10.4.2 (RTL 16 의 필수 peer) |
| 미설치 | `lucide-react` · `sharp` · `tailwindcss` — 이번 범위에 불필요하여 설치하지 않았다 |
| **스타일링 방식 (되돌리기 어려운 결정)** | `packages/ui` 는 **Tailwind 유틸리티가 아니라 컴포넌트 CSS + `var(--token)`** 으로 구현한다. 근거: ① Tier 3 component 토큰은 `@theme` 에 없어 유틸리티가 생성되지 않는다 (Design Spec §3.3·§3.4·§11-2) ② Stage 1-B 가 `@theme static` 을 택한 이유가 "packages/ui 의 `var()` 참조" 다 ③ Tailwind 없이도 독립 빌드·테스트가 가능하다. 소비 순서 = `@haru/design-tokens` → `@haru/ui/styles.css`. 클래스 네이밍 `haru-<component>[__part][--modifier]`, 외부 `className`·`style` 주입 불가 |
| eslint react 연결 | Stage 1-A/1-B 가 유예했던 `@haru/config/eslint/react` 를 루트 `eslint.config.js` 에 연결 (glob `packages/ui/**/*.{ts,tsx}` · `apps/web/**/*.{ts,tsx}`). react-hooks · jsx-a11y 발화를 음성 테스트로 확인 |
| 경계 규칙 보정 | `.dependency-cruiser.cjs` 의 `ui-only-design-tokens` 에 `UI_NON_RUNTIME`(테스트 · 패키지 루트 config/setup · `src/test/`) `pathNot` 추가. Stage 1-C 의 contracts 보정과 동일한 패턴이며 규칙의 의도·적용 대상은 불변. `no-ui-to-contracts` 는 제외 없이 전면 적용 |

### 6.1 후속 결정 대기 (development-agent 발견)

| ID | 항목 | 내용 |
|---|---|---|
| **S1-D1-1** | Tag `neutral` tone 배경 토큰 | Design Spec §4.15 가 Tier 1 `--haru-dusk-200` 을 직접 지정한다. 대응 semantic 토큰이 없어 `packages/ui` 가 참조하는 유일한 Tier 1 토큰이 되었다. ① semantic 토큰 신설 ② 현행 유지 중 결정 필요 (신규 토큰 요청은 design-agent 소관 — rules/frontend.md §6) |
| **S1-D1-2** | `IconButton.size` prop | Design Spec §4.5 props 목록에 있으나 치수 표에 단계 값이 없다. 추측 구현을 하지 않고 prop 을 두지 않았다. 필요 시 Design Spec 에 값 추가 후 구현 |

---

## 7. 2026-09-20 사용자 결정 — §6.1 후속 항목 해소

| ID | 결정 | 내용 | 반영 시점 |
|---|---|---|---|
| **S1-D1-1** | **semantic 토큰 신설** | `packages/design-tokens` 의 Tier 2 에 **`--color-tag-neutral-bg: var(--haru-dusk-200)`** 를 추가하고, `packages/ui` 의 Tag `neutral` 은 이 semantic 토큰만 참조한다. **색 값(`#c7c9d7`)은 변경하지 않으며 참조 경로만 바뀐다.** 이로써 `packages/ui` → Tier 1 직접 참조가 **0건**이 되어 Primitive → Semantic → Component 규율이 예외 없이 유지된다. 이름은 Tag 전용 범위를 그대로 드러내는 `--color-tag-neutral-bg` 로 하며, `--color-capability-*-bg` 계열에 넣지 않는다 (neutral 은 역량이 아니다) | **Stage 1-D2** |
| **S1-D1-2** | **`size` prop 유지 · `md`(38) 한 값만** | Design Spec §4.5 의 props 목록을 지키되 Spec 에 없는 치수를 만들지 않는다. 타입은 `size?: 'md'`, 치수는 시각 38×38 · 아이콘 `--size-icon-md`(20) · hit area 44×44 로 §4.5 표 그대로다. **다른 크기가 실제로 필요한 화면이 나오는 Stage 에서** Figma 치수를 받아 단계를 늘린다(optional prop 에 값 추가이므로 비파괴적 변경). 아이콘 토큰 3단계(16/20/24)에서 버튼 크기를 파생하지 않는다 — 결정 #10 "값은 Figma 만 기준" 과 충돌하기 때문 | **Stage 1-D2** |

두 항목 모두 **Stage 1-D2 의 선행 조건이었으며 해소되었다.** `docs/workflow/WORKFLOW_STATE.md` §3 과 `docs/workflow/stage-1/stage-1-D2.md` 에 반영되어 있다.

> 참고 — `--color-bg-app-end` 가 이미 `--haru-dusk-200` 을 참조하지만, 그 토큰의 의미는 "앱 배경 그라디언트 끝"이므로 Tag 배경으로 재사용하지 않는다. 값이 같다는 이유로 의미가 다른 토큰을 공유하면 한쪽 값을 바꿀 때 다른 쪽이 따라 바뀐다.

---

## 8. 2026-09-21 사용자 결정 — Stage 1-G 종료 시점 4건

| ID | 결정 | 내용 | 반영 |
|---|---|---|---|
| **S1-G-1** | **`interactive` variant 폐기** | `PageIndicator` 를 **표시 전용**으로 확정하고 dot 클릭 기능을 제거한다. Design Spec 내부 충돌(§9.3 터치 44 요구 ↔ §4.19 dot 7 + gap 6)은 **§4.19 기하를 유지하고 인터랙션을 없애는 방향**으로 해소한다. Figma 근거가 있는 것은 표시용 dot 뿐이고, 캐러셀 페이지 이동은 스와이프·버튼이 담당한다. Stage 1 제품 화면에 미마운트 상태라 회귀 위험 없음. 필요해지면 Stage 3 캐러셀 설계 시 디자이너 입력을 받아 재도입한다 | 코드 |
| **S1-G-2** | **42px 유지 + 수용 예외** | `--field-row-height: 42px`(Figma `76:364`) 를 **그대로 둔다.** 터치 타깃 44 기준에 2px 미달이나 ① 라벨·헬퍼를 포함한 세로 영역이 넓고 ② 인접 타깃과 겹치지 않아 오조작 위험이 낮으며 ③ Visual Source of Truth 를 흔들지 않는 편이 낫다. **QA 는 이 항목을 `PASS (accepted: S1-G-2)` 로 기록한다.** Design Spec §9.3 터치 표에 TextField 행을 추가하는 것은 design-agent 소관 | 문서 |
| **S1-D2-5** | **`book` + `chart-no-axes-column-increasing`** | 탭 아이콘 Lucide 글리프를 확정한다. 1-G 가 Figma `25:87` 을 16배 확대해 대조한 결과 기존 후보 4종이 모두 불일치했고, lucide-react 1.47.0 의 path 대조로 이 둘이 Figma 형태와 1:1 대응함을 확인했다 — `book` = 사각형 + 책등 + 선반선, `chart-no-axes-column-increasing` = 축 없는 좌→우 증가 막대 3개. 함께 검토할 것: Figma 막대가 21px 기준 두꺼워 **탭 아이콘 한정 `LUCIDE_STROKE_WIDTH` 상향**이 필요한지 (구현이 판단해 보고) | 코드 + baseline 재생성 |
| **S1-D2-6** | **`maxDiffPixelRatio: 0.002` + `maxDiffPixels: 200`** | 시각 비교 임계값을 확정한다. 잠정값 0.02 는 가장 작은 baseline 에서도 23×23 블록, `frame-1024` 에서는 125×125 변화를 통과시켜 **아이콘 하나가 통째로 바뀌어도 탐지하지 못한다.** 실측 diff 가 0 픽셀이므로 0.2% 로 낮춰도 여유가 충분하고, 절대 픽셀 상한을 병기해 큰 화면에서 허용량이 비례 증가하는 문제를 막는다. `provisional` 주석을 제거한다. 플랫폼별 baseline 분리(`{platform}`)는 이미 적용됨 | 코드 |

> `S1-G-1` 과 `S1-D2-5` 는 Design Spec 갱신이 뒤따라야 한다(§4.19 interactive 삭제, §8.1 아이콘 대응표). **문서 갱신은 design-agent 소관**이며 Stage 1 QA 이후 별도로 처리한다.

---

## 9. 2026-09-22 가값(P-01~P-16) 승인 절차 결과

Stage 0 결정 #10-④ · Stage 1 Plan §17 에 따라 Stage 1 QA 완료 후 · Stage 2 착수 전에 16항목을 하나씩 제시하고 받은 결정이다.

### 9.0 일반 원칙 (P-02 답변에서 사용자가 제시 — 이후 동종 충돌에 적용)

> **접근성 기준에 미달하는 값은 Figma 를 우선해 그대로 두되, `provisional` 표시를 유지해 나중에 "접근성을 맞춰라"는 지시가 오면 토큰만 교체할 수 있게 한다.**

- 적용 대상: Figma 값과 WCAG 기준이 충돌하는 모든 항목. Visual Source of Truth 를 임의로 흔들지 않으면서 교체 경로를 열어둔다.
- 이 원칙에 따라 **P-01 · P-02 는 값 변경 없이 `provisional` 유지**한다.
- `QA-1-002`(TextField `trailingAction` 밑줄 — Figma 에는 없고 WCAG 1.4.1 관점에서는 개선) 도 같은 원칙으로 판단한다.

### 9.1 확정 10건 — `provisional` 주석 제거 대상

| P | 항목 | 확정값 | 확정 근거 |
|---|---|---|---|
| **P-03** | focus ring | `--haru-ink-700` · width 2px · offset 2px | QA 실측 3.28~6.81:1 로 세 배경 모두 WCAG 3:1 충족. Figma 에 focus 상태가 없어(M-34) 대기해도 비교 기준이 생기지 않는다 |
| **P-06** | z-index | base 0 · sticky 10 · tabbar 20 · sheet 40 · dialog 50 · toast 60 | 디자인 도구에 z-index 개념이 없어 디자이너가 정할 수 있는 값이 아니다. 10 단위 간격은 레이어 삽입 여지를 두는 표준 관례 |
| **P-07** | motion duration / easing | instant 100 · fast 180 · base 240 · slow 400 · pulse 1200ms / standard `cubic-bezier(.32,.72,.28,1)` · spring · linear | 단계 구조만 제공하므로 화면별 튜닝은 Stage 2~4 에서 단계 선택으로 처리 가능 |
| **P-08** | safe-area inset | `env(safe-area-inset-*, 0px)` 4종 | 값을 정하는 항목이 아니라 OS 제공값을 읽는 플랫폼 API 연결이다 |
| **P-09** | 아이콘 크기 | sm 16 · md 20 · lg 24px | 4px 그리드·Lucide 기본 그리드와 일치. 예외(탭바 21 = `--tabbar-icon-size`)는 이미 별도 토큰으로 승인됨 |
| **P-11** | glass·tinted 표면 위 라벨 | `--haru-ink-600` (Figma `#5e7370`) | QA 실측 4.47~4.81:1 로 Design Spec 기재값(4.18~4.48)보다 양호. 하단 4.47 구간은 수용 |
| **P-12** | `--radius-surface` | **22px** | Figma 혼재(22/24/26) 중 Stage 1-B 채택값. 육안 구분이 어렵고 baseline 27건에 이미 반영됨 |
| **P-13** | `--layout-gutter` | **24px** (= `--space-6`) | 4px 그리드와 정확히 일치(26 은 그리드 밖). e2e 가 4개 폭에서 좌우 대칭 ±1px 로 검증 중 |
| **P-14** | `--gradient-app` 중간 stop | **46%** | Figma 혼재(46/52) 중 Stage 1-B 채택값. 시각 인상 차이가 작고 변경 시 토큰 한 줄 |
| **P-15** | `--size-button-lg` | **56px** | 4px 그리드와 일치(58 은 그리드 밖), 터치 타깃 44 를 여유 있게 상회. Button baseline 8종에 반영됨 |

### 9.2 디자이너 대기 유지 5건 — `provisional` 주석 유지

| P | 항목 | 현재 가값 | 대기 사유 |
|---|---|---|---|
| **P-01** | `--color-fg-secondary` / `-tertiary` | `--haru-ink-500` (실측 2.91~3.13:1) | WCAG AA 4.5:1 미달이 확인됨. §9.0 원칙에 따라 Figma 값 유지 + 교체 가능 상태로 둔다 |
| **P-02** | 비텍스트 요소 색 (진행 바·별점·칩 경계·배지 글자 4종) | Figma 값 | 일부 3:1 미달(배지 흰 글자 1.56~1.86:1). §9.0 원칙 적용. 실제 사용 화면이 Stage 2~5 에 나오므로 그때 맥락과 함께 판단 |
| **P-04** | status 색 info/success/warning/error (8 primitive + 18 semantic) | DESIGN_TOKEN_MAP 제안값 | Figma 에 status 팔레트 자체가 없다. 오류·경고는 양육자가 불안을 만나는 지점이라 톤 결정이 서비스 성격과 직결된다 |
| **P-05** | `--color-scrim` | `#29293a3b` (약 23%) | 일반적인 40~50% 보다 연해 분리감 판단에 실제 Sheet 내용이 필요하다. 첫 실사용처는 Stage 2 동의·선택 Sheet |
| **P-16** | medallion sm/md/lg + ring-offset | 136 / 188 / 232 + 8 | **sm 136 · md 188 은 2026-09-18 Figma 재조회 범위 밖**이라 실측 근거가 없다(lg 232 만 확인됨). CharacterMedallion 컴포넌트가 Stage 2 이므로 그때 design-agent 실측 후 확정 |

### 9.3 검토 중 1건

| P | 항목 | 상태 |
|---|---|---|
| **P-10** | 공통 상태 화면·컴포넌트 상태 디자인 (Loading · Empty · Error+Retry · Offline Banner · Toast · Dialog + focus·error·loading) | **확정 (2026-09-23, user)** — 실기기(모바일)와 `/__dev/ui/states` 에서 직접 확인 후 승인. design-agent 명세가 그대로 Stage 2~8 의 공통 상태 기준이 된다. 토큰이 아니라 화면이므로 `provisional` 주석 대상이 아니다 |

**P-10 확인 중 발견·수정된 결함 (2026-09-23)**: 카드·Sheet·Dialog 그림자가 직사각형으로 잘리던 문제. 원인은 스크롤 컨테이너(`main`)가 `AppColumn` 안쪽에 있어 클리핑 박스가 콘텐츠 폭이 된 것이었다(`overflow-y: auto` → `overflow-x` 가 `visible` 로 남을 수 없음). **Figma 값 문제가 아니라 레이아웃 조립 문제**였으므로 `--shadow-glass-*` 토큰을 바꾸지 않고 `AppShell` 구조를 뒤집어 해결했다(스크롤 컨테이너를 앱 컬럼 바깥으로). BottomTabBar·TopBar 는 `sticky` 로 전환. 상세는 `docs/qa/stage-1-handoff.md` §18.

### 9.4 후속 작업

1. **development-agent** — §9.1 의 10건에서 `/* provisional: P-xx */` 주석 제거. §9.2 의 5건은 **그대로 유지**한다. 토큰 **값은 변경하지 않는다**(확정 = 현재 값 그대로)
2. **design-agent** — `docs/DESIGN_TOKEN_MAP.md` §4.1 과 `docs/decisions/stage-0-approvals.md` §4 표의 상태 열 갱신
3. 남은 가값은 **`P-01 · P-02 · P-04 · P-05 · P-16` 5건**이다. `P-10` 은 2026-09-23 확정되었다. 남은 5건은 Stage 2 이후 해당 화면이 나올 때 재제시한다
