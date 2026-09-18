# Stage 1-A Handoff — 툴체인 / 워크스페이스 기반

Status: IMPLEMENTED (2026-09-18, development-agent) — stage-qa-agent 검증 대기
후속: 2026-09-19 사용자 승인 후속 조치 2건 반영 (F-3 jsx-a11y 도입 · F-1 Node 버전 preinstall 가드) — **§11** 참조
Scope: Stage 1 Plan §9.0(루트 구조·root scripts) · §9.1(`packages/config`) · §9.6(명시적 비생성) · §11.1 AC-1-01~AC-1-06 · §11.2 AC-1-07~AC-1-09 · §16 D-1·D-9·D-10 · §12 "정적 검사" 행
근거 문서: `docs/plans/stage-1-plan.md` (APPROVED 2026-09-18) · `docs/design/stage-1-design-spec.md` (lint 예외 경로 확인 목적만) · `.claude/rules/architecture.md` §2 · `frontend.md` §1·§6 · `backend.md` §1 · `qa.md` §4

> Stage 1-B(design-tokens · ui · contracts · apps/web · Mock Layer)는 **시작하지 않았다.**

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` Status: APPROVED | OK — `APPROVED (2026-09-18, user)` |
| `docs/design/stage-1-design-spec.md` Status: APPROVED | OK |
| 이전 Stage QA PASS | OK — Stage 1은 Stage 0 사용자 승인(2026-09-14)으로 대체 |
| Plan ↔ PRD / Figma 모순 | 없음 (Stage 1-A는 툴체인 범위로 UI 무관) |
| Plan In Scope 에 Backend 구현 작업 | 없음 |

참고: Plan 머리말이 참조하는 `docs/decisions/stage-1-approvals.md` 는 저장소에 아직 없다. D-1~D-10 승인 사실은 호출 지시와 Plan Status 로 확인했다. 파일 생성은 plan-agent 소관이므로 development-agent 가 만들지 않았다.

---

## 2. 구현한 AC

| AC | 내용 | 결과 | 증거 |
|---|---|---|---|
| AC-1-01 | `pnpm install --frozen-lockfile` 성공 (lockfile 커밋 대상) | PASS | `node_modules` 삭제 후 clean install 성공 (§4) |
| AC-1-02 | `pnpm typecheck` 통과 · 신규 `any` / `@ts-ignore` 0건 | PASS | exit 0 + grep 0건 |
| AC-1-03 | `pnpm lint` 오류 0 | PASS | exit 0, warning 0 |
| AC-1-04 | `pnpm test` (Vitest) 통과 | PARTIAL (Stage 1-A 범위 한정) | 11 tests / 1 file. contracts·Mock·상태 컴포넌트 테스트는 Stage 1-B 대상 |
| AC-1-05 | `pnpm build` 가 `apps/web` 프로덕션 빌드 성공 | 해당 없음 (Stage 1-B) | `apps/web` 미생성. `build` 는 no-op 이며 그 사실을 출력한다 |
| AC-1-06 | Node / pnpm 버전 고정이 §16.1 과 일치 | PARTIAL — §7 F-1 / §11.2 참조 (가드로 기계적 강제 추가, 로컬 Node 업그레이드는 사용자 조치 대기) | `.nvmrc`=24.21.0, `engines.node`=">=24.21.0 <25", `packageManager`="pnpm@12.4.2" 는 승인값 그대로. 다만 pnpm 12 가 루트 프로젝트 자체의 engines 를 강제하지 않음 |
| AC-1-07 | `apps/api/` · `supabase/` · `apps/mobile/` 부재 | PASS | `ls` 결과 4개 경로 모두 "No such file or directory" |
| AC-1-08 | Out of Scope 기능 미구현 | PASS | `packages/` 하위는 `config` 1개뿐, `apps/` 자체가 없음 |
| AC-1-09 | import 경계 위반 0건 + 규칙 6종 정의 | PASS | `pnpm lint:boundaries` exit 0 + 음성 테스트로 6종 전부 발화 확인 (§5) |

---

## 3. 생성 / 수정 파일

### 루트 (신규)
- `/Users/soojin/dev/haru/pnpm-workspace.yaml` — `apps/*`, `packages/*` + pnpm 12 설정(`engineStrict`, `preferWorkspacePackages`, `linkWorkspacePackages`, `minimumReleaseAgeExclude`)
- `/Users/soojin/dev/haru/package.json` — private, `type: module`, `packageManager: pnpm@12.4.2`, `engines.node: ">=24.21.0 <25"`, root scripts, toolchain devDependencies
- `/Users/soojin/dev/haru/pnpm-lock.yaml` — 커밋 대상 (lockfileVersion 9.0, 262 packages)
- `/Users/soojin/dev/haru/.nvmrc` — `24.21.0`
- `/Users/soojin/dev/haru/.npmrc` — `engine-strict=true` (+ pnpm 12 동작 주석)
- `/Users/soojin/dev/haru/tsconfig.base.json` — `@haru/config/tsconfig/base.json` 재노출
- `/Users/soojin/dev/haru/tsconfig.json` — 루트 TS 파일(`vitest.config.ts`) 타입 검사용
- `/Users/soojin/dev/haru/eslint.config.js` — flat config, `@haru/config/eslint/base` 확장
- `/Users/soojin/dev/haru/prettier.config.js` — `@haru/config/prettier` 재노출
- `/Users/soojin/dev/haru/.prettierignore`
- `/Users/soojin/dev/haru/.dependency-cruiser.cjs` — D-1 규칙 6종 (named rule 13개)
- `/Users/soojin/dev/haru/vitest.config.ts` — `test.projects: ['packages/*', 'apps/*']`
- `/Users/soojin/dev/haru/.env.example` — `VITE_API_BASE_URL` · `VITE_API_MODE` · `VITE_MOCK_SCENARIO` 만
- `/Users/soojin/dev/haru/scripts/lint-boundaries.mjs`
- `/Users/soojin/dev/haru/scripts/pending-script.mjs`
- `/Users/soojin/dev/haru/scripts/assert-no-mocks.mjs`
- `/Users/soojin/dev/haru/scripts/check-node-version.mjs` — **2026-09-19 추가** Node 버전 preinstall 가드 (§11.2)

### 루트 (수정)
- `/Users/soojin/dev/haru/.gitignore` — pnpm / vitest / dependency-cruiser 로컬 산출물 4줄 추가

### `packages/config` (신규)
- `/Users/soojin/dev/haru/packages/config/package.json` — `@haru/config`, private, exports map
- `/Users/soojin/dev/haru/packages/config/tsconfig/base.json` — strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (+ `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- `/Users/soojin/dev/haru/packages/config/tsconfig/react.json` — `jsx: react-jsx`, DOM lib
- `/Users/soojin/dev/haru/packages/config/tsconfig/node.json` — `types: ["node"]`
- `/Users/soojin/dev/haru/packages/config/eslint/base.js` — Stage 1 필수 규칙 4종 + 예외
- `/Users/soojin/dev/haru/packages/config/eslint/react.js` — `eslint-plugin-react-hooks` + **`eslint-plugin-jsx-a11y` (2026-09-19 추가, §11.1)**. 루트 `eslint.config.js` 연결은 Stage 1-B 유예 유지
- `/Users/soojin/dev/haru/packages/config/types/eslint-plugin-jsx-a11y.d.ts` — **2026-09-19 추가** 로컬 ambient 타입 선언 (§11.1)
- `/Users/soojin/dev/haru/packages/config/prettier/index.js`
- `/Users/soojin/dev/haru/packages/config/vitest/base.ts` — `defineHaruTestProject()`, jsdom(D-9), coverage 임계
- `/Users/soojin/dev/haru/packages/config/tsconfig.json` · `vitest.config.ts`
- `/Users/soojin/dev/haru/packages/config/__tests__/shared-config.test.ts` — 공통 설정 자체 검증 11건 → **13건** (2026-09-19 react/jsx-a11y 2건 추가)

### 명시적 비생성 (Plan §9.6 · AC-1-07)
`apps/` (따라서 `apps/api`, `apps/web`, `apps/mobile`) · `supabase/` · `packages/design-tokens` · `packages/ui` · `packages/contracts` · `packages/validation` · `packages/shared-types` · Storybook · MSW · Supabase JS Client · `playwright.config.ts`

---

## 4. 실행한 검증 명령과 결과

Node `v24.16.0` / pnpm `12.4.2` 환경. **engine 우회 플래그는 사용하지 않았다** — pnpm 12 가 루트 프로젝트 자체의 `engines.node` 를 강제하지 않아 설치가 그대로 성공했다 (§6 F-1).

| 명령 | Exit | 요약 |
|---|---|---|
| `pnpm install` | 0 | 262 packages, lockfile 생성 |
| `rm -rf node_modules && pnpm install --frozen-lockfile` | 0 | reused 262, downloaded 0 — lockfile 재현성 확인 |
| `pnpm typecheck` | 0 | 루트 `tsc --noEmit` + `packages/config` 통과 |
| `pnpm lint` | 0 | error 0 / warning 0 |
| `pnpm test` | 0 | Test Files 1 passed (1), Tests 11 passed (11) |
| `pnpm lint:boundaries` | 0 | `✔ no dependency violations found (12 modules, 12 dependencies cruised)` |
| `pnpm build` | 0 | NO-OP 안내 출력 후 `pnpm -r --if-present run build` |
| `pnpm format:check` | 0 | `All matched files use Prettier code style!` |
| `pnpm assert:no-mocks` | 0 | `apps/web 이 아직 없습니다 (Stage 1-B 에서 생성). 검사 대상 없음.` |
| `pnpm test:e2e` | 0 | NO-OP 안내 (Playwright 유예) |
| `ls -d apps supabase apps/api apps/mobile` | 1 | 4개 경로 전부 부재 |
| `grep -rn "@ts-ignore\|@ts-nocheck\|: any" packages scripts *.ts *.js` | — | 0건 |

---

## 5. Lint / 경계 규칙 음성 테스트 (규칙이 실제로 잡는지 확인)

### 5.1 ESLint — Stage 1 필수 규칙 4종

임시 파일 `packages/__lint_probe__/probe.ts` 에 위반 코드를 넣고 `eslint --no-ignore` 실행 → **7 errors**.

| 위반 입력 | 발화한 규칙 |
|---|---|
| `'#85bfb6'` | `no-restricted-syntax` (임의 HEX 금지) |
| `'rgba(0, 0, 0, 0.12)'` | `no-restricted-syntax` (rgb/rgba/hsl 금지) |
| `'bg-[#85bfb6] p-[13px] rounded-[28px]'` | `no-restricted-syntax` (HEX + Tailwind arbitrary value, 2건) |
| `` `text-[color:var(--x)] …` `` (template literal) | `no-restricted-syntax` (Tailwind arbitrary value) |
| `// @ts-ignore` | `@typescript-eslint/ban-ts-comment` |
| `value: any` | `@typescript-eslint/no-explicit-any` |

### 5.2 ESLint — 예외 경로 (rules/frontend.md §6)

동일 파일을 `packages/design-tokens/probe.ts` 로 복사해 실행 → **2 errors** (`ban-ts-comment`, `no-explicit-any` 만).
즉 토큰 강제 규칙은 `packages/design-tokens/**` 안에서 꺼지고, 타입 안전 규칙은 유지된다. 의도대로 동작.

### 5.3 dependency-cruiser — D-1 규칙 6종

임시 위반 파일 세트(`packages/ui`, `packages/contracts`, `apps/web/src/...`)로 실행 → **7 violations**, 6종 전부 발화.

| D-1 규칙 | 발화한 named rule | 검출 예 |
|---|---|---|
| ① `packages/* → apps/*` 금지 | `no-package-to-app` | `packages/ui/src/bad-app.ts → apps/web/src/shared/s.ts` |
| ② `packages/ui → contracts` 금지 | `no-ui-to-contracts`, `ui-only-design-tokens` | `packages/ui/src/button.ts → packages/contracts/src/index.ts` |
| ③ `contracts → zod 외` 금지 | `contracts-runtime-deps-zod-only` | `packages/contracts/src/index.ts → node_modules/.pnpm/prettier@3.9.8/…` |
| ④ 형제 feature 직접 import 금지 | `no-sibling-feature-import` | `features/alpha/a.ts → features/beta/b.ts` |
| ⑤ 레이어 역방향 금지 | `no-layer-upward-from-shared` (+ pages/features/entities 변형 3종) | `shared/s.ts → features/alpha/a.ts` |
| ⑥ 순환 의존 금지 | `no-circular` | `entities/c1.ts ⇄ entities/c2.ts` |

**모든 임시 probe 파일·디렉토리는 삭제했고, 삭제 후 `ls packages` = `config` 1개, `apps/` 부재를 확인했다.**

미검증 1건: ③ 규칙의 **허용 방향**(`contracts → zod` 는 통과해야 함)은 `zod` 가 아직 설치되지 않아 확인하지 못했다. `pathNot: 'node_modules/zod/'` 가 pnpm 가상 스토어 경로(`node_modules/.pnpm/zod@x/node_modules/zod/…`)를 포함하므로 통과가 예상되며, Stage 1-B 에서 `packages/contracts` 생성 직후 재확인이 필요하다.

---

## 6. 승인 표(§16.1) 대비 registry 재확인 결과 (2026-09-18 실행 시점)

§16.1 공통 원칙 5에 따라 npm registry / nodejs.org 를 재확인했다.

| 대상 | 승인값 | 2026-09-18 확인값 | 조치 |
|---|---|---|---|
| Node.js | 24.21.0 (Active LTS "Krypton") | `v24.21.0` (2026-09-07 릴리스, lts=Krypton) — **존재 확인**. 24.x 최신 = 24.21.0 | 승인값 유지 |
| pnpm | 12.4.2 | latest 12.4.2 | 일치 |
| TypeScript | ~6.0.3 | 6.0.3 존재. registry latest = **7.0.2** | 승인값 유지 (typescript-eslint 8.70.0 peer = `>=4.8.4 <6.1.0` → TS 7 미지원 재확인) |
| typescript-eslint | ^8.70.0 | latest 8.70.0 | 일치 |
| ESLint | ^10.10.0 | latest 10.10.0 | 일치 |
| Prettier | ^3.9.8 | latest 3.9.8 | 일치 |
| Vitest | ~4.1.11 | 4.1.11 존재. latest = **5.0.1** | 승인값 유지 (D-10: major 5 미채택) |
| jsdom | ^30.1.0 | latest 30.1.0 | 일치 |
| dependency-cruiser | ^18.3.1 | latest 18.3.1 | 일치 |
| eslint-plugin-react-hooks | ^7.1.1 | latest 7.1.1 (peer: eslint `^3~^10`) | 일치 |

**표에 없어 새로 고정한 toolchain devDependency 3종** (모두 위 승인 패키지를 쓰기 위한 필수 보조 의존이며 런타임·번들에 포함되지 않는다. QA 확인 요청 대상):

| 패키지 | 고정 | 사유 |
|---|---|---|
| `@eslint/js` | `^10.0.1` | ESLint 10 flat config 의 `js.configs.recommended` 제공. **주의: eslint 코어(10.10.0)와 버전이 다르다** — `@eslint/js` latest 는 10.0.1 |
| `@types/node` | `^24.13.5` | `tsconfig/node.json` 의 `types: ["node"]` 가 실제로 해석되도록. Node 24 계열에 맞춤 (registry latest 는 26.6.1이나 런타임과 맞춘다) |
| `@vitest/coverage-v8` | `~4.1.11` | `vitest/base.ts` 의 coverage 임계 설정이 실제로 동작하도록 (vitest 버전과 동일 고정) |
| `globals` | `^17.12.0` | flat config 의 `languageOptions.globals` (browser / node / es2023) |

**2026-09-19 추가 승인 의존 1종** (§16.1 D-10 표에 없던 신규 의존 — 사용자 승인 2026-09-19):

| 패키지 | 고정 | registry 확인 (2026-09-19) | 사유 |
|---|---|---|---|
| `eslint-plugin-jsx-a11y` | `^6.10.2` (`packages/config` devDependency) | dist-tags latest = **6.10.2** (그 외 태그: `v5-backport` 5.1.1). 6.10.2 가 최신 안정판 | 접근성 AC(Plan §11.4 / rules/frontend.md §9)를 lint 로 강제. `packages/config/eslint/react.js` 에 권장 세트(34개 규칙) 연결 |

> `eslint-plugin-jsx-a11y@6.10.2` 의 `peerDependencies.eslint` 는 `^3 || … || ^9` 라서 **ESLint 10 에서 peer 경고**가 난다 (`pnpm peers check` 에 1건 표시). 실제 동작은 음성 테스트로 확인했다 (§11.1). 상위 버전은 아직 없다.
> 타입 선언을 제공하지 않아 `tsc --noEmit` 이 TS7016 으로 실패했다. 승인 범위가 플러그인 1종이므로 `@types/eslint-plugin-jsx-a11y` 를 추가하지 않고 `packages/config/types/eslint-plugin-jsx-a11y.d.ts` 로컬 ambient 선언(사용 표면만, `any` 없음)으로 해결했다.

---

## 7. 발견 사항 / Stage 1-B 선결 조건

### F-1 (High) — pnpm 12 는 `.npmrc` 를 읽지 않고, 루트 프로젝트의 `engines.node` 를 강제하지 않는다

- 사실 1: pnpm 공식 문서(pnpm.io/settings, 2026-09-18 확인) — "Only auth and registry settings are read from `.npmrc` files." 나머지 설정은 `pnpm-workspace.yaml` 또는 `~/.config/pnpm/config.yaml` 에서 읽는다. 실제로 `pnpm config list` 에 `.npmrc` 의 `engine-strict` 가 나타나지 않았다.
- 사실 2: 실측 — 로컬 Node `v24.16.0` 에서 `engines.node` 를 `">=99.0.0"` 으로 바꾸고 `pnpm install --frozen-lockfile` 을 실행해도 **성공**했다. `--config.engine-strict=true` CLI 플래그를 줘도 동일. 즉 pnpm 12 는 워크스페이스 루트 자신의 `engines` 를 강제하지 않는다 (의존 패키지의 engines 에만 적용).
- 조치: 승인값을 **낮추지 않았다.** `.nvmrc`=24.21.0, `engines.node`=">=24.21.0 <25", `.npmrc engine-strict=true` 는 그대로 두고, pnpm 12 의 실제 설정 지점인 `pnpm-workspace.yaml` 에 `engineStrict: true` 를 함께 선언했다. 그 결과 engine 우회 플래그 없이 설치가 성공했다.
- **2026-09-19 후속 조치(승인 완료)**: `preinstall` Node 버전 가드를 도입했다 — §11.2. 이제 버전 불일치 시 설치가 종료 코드 1 로 중단된다.
- **Stage 1-B 전 사용자 조치 필요 (선결 조건)**: 로컬 Node 를 `24.21.0` 이상(<25)으로 올려야 한다 (현재 `v24.16.0`). 가드 도입 이후에는 업그레이드 전까지 **의존성 설치 자체가 불가능**하다. 에이전트는 사용자 머신을 변경하지 않았다.

### F-2 (Medium) — root script `install` 은 정의하지 않았다

Plan §9.0 의 root script 목록에 `install` 이 있으나, npm/pnpm 에서 `"install"` 은 **설치 라이프사이클 훅**이다. `"install": "pnpm install --frozen-lockfile"` 로 정의하면 매 설치마다 자기 자신을 재귀 호출한다.
`rules/qa.md` §4 가 요구하는 `pnpm install --frozen-lockfile` 은 pnpm 내장 명령으로 스크립트 없이 그대로 동작하며, §4 표에서 exit 0 을 확인했다. **Plan 문구 조정(목록에서 `install` 제거 또는 "내장 명령" 명시)을 plan-agent 에 요청한다.**

### F-3 (Low) — `format` / `format:check` 분리

`"format": "prettier --write ."` 하나만 두면 `pnpm format --check` 가 `prettier --write . --check` 로 전달되어 충돌한다. `format`(write) / `format:check`(verify) 로 분리했다. `rules/qa.md` §4 공통 명령에는 `format` 이 없으므로 충돌 없음.

### F-4 (Low) — Stage 1-A 에서 유예한 항목

| 항목 | 사유 | 담당 Stage |
|---|---|---|
| `playwright.config.ts` + `@playwright/test ~1.63.0` 설치 | 서빙할 앱(`apps/web`)이 없어 E2E·시각 비교 baseline 을 만들 수 없다. `test:e2e` 스크립트 자리만 만들고 NO-OP 안내를 출력한다 | Stage 1-B / 1-C |
| `sharp@0.35.4` (D-4) · `pnpm assets:optimize` | 지시에 따라 Stage 1-A 에서는 의존성을 추가하지 않았다 | Stage 1-B |
| `@fontsource-variable/inter ~5.3.0` (D-3) · `lucide-react 1.47.0` (D-2) | `packages/design-tokens` · `packages/ui` 생성 시점에 설치 | Stage 1-B |
| type-aware ESLint (`projectService`) | 패키지별 tsconfig 가 아직 없어 프로젝트 서비스를 붙일 대상이 없다. 현재는 비타입인식 `tseslint.configs.recommended` | Stage 1-B (도입 시 보고) |
| ~~`eslint-plugin-jsx-a11y`~~ | **해소됨 (2026-09-19 사용자 승인 → §11.1)**. `^6.10.2` 를 `packages/config` 에 설치하고 `eslint/react.js` 에 권장 세트를 연결했다 | 완료 |
| `packages/config/eslint/react.js` 의 루트 config 연결 | React 대상 파일(`apps/web`, `packages/ui`)이 없어 `eslint.config.js` 에서 확장하지 않았다. **유예 유지 (2026-09-19 확인).** 모듈은 4 blocks 로 독립 로드되며 ESLint 10 실행 검증까지 완료 (§11.1) | Stage 1-B |

### F-5 (Low) — pnpm 12 supply-chain 정책으로 `pnpm-workspace.yaml` 에 항목이 자동 추가됨

pnpm 12 의 `minimumReleaseAge` 기본 정책 때문에 설치 중 `minimumReleaseAgeExclude: [prettier@3.9.8]` 가 자동으로 추가되었다. 승인된 Prettier 버전을 그대로 설치하기 위해 필요하므로 주석과 함께 유지했다. Stage 1-B 에서 신규 패키지를 설치할 때 항목이 늘어날 수 있다.

### F-6 (Low) — 루트 `scripts/` 디렉토리 추가

Plan §9.0 트리에는 없으나, root script 중 조건부 동작이 필요한 3개(`lint:boundaries`, `assert:no-mocks`, NO-OP 안내)를 `package.json` 인라인 명령으로 넣으면 가독성·유지보수가 나빠진다. `scripts/` 3개 파일로 분리했다. 구조 변경이 아니라 root script 구현 위치다.

### F-7 (정보) — `docs/decisions/stage-1-approvals.md` 부재

Plan 머리말이 이 파일을 D-1~D-10 결과 기록처로 지목하지만 저장소에 없다. plan-agent 소관이므로 생성하지 않았다. QA 시점에 D 결정 근거가 필요하면 이 파일 생성을 요청해야 한다.

---

## 8. Mock 시나리오

Stage 1-A 범위에는 **없다.** Mock Layer(`apps/web/src/mocks/**`), scenario 전환(D-5), `health` 도메인 레퍼런스 구현(D-8)은 전부 Stage 1-B 다.
다만 D-6 의 산출물 검증 스크립트 `pnpm assert:no-mocks` 는 지금 완성했고, sentinel 문자열은 `__HARU_MOCK_SENTINEL__` 로 고정했다. `apps/web` 이 생기면 `apps/web/src/mocks/index.ts` 가 이 문자열을 export 해야 한다.

---

## 9. BACKEND_INTEGRATION_PENDING 예상 항목

**0건.** Stage 1 Plan §10 과 동일하다. Stage 1-A 는 툴체인 범위로 Backend 의존 동작이 없다.

---

## 10. Scope 경계에서 보류한 항목

- `packages/design-tokens` · `packages/ui` · `packages/contracts` · `apps/web` — 디렉토리·`package.json`·stub 어느 것도 만들지 않았다 (지시된 Stage 1-A Out of Scope).
- `apps/api` · `supabase` · `apps/mobile` — 생성 금지 (CLAUDE.md, Plan §9.6).
- git commit / push — 수행하지 않았다.

---

## 11. Stage 1-A 후속 조치 (2026-09-19, 사용자 승인 2건)

Stage 1-B 는 **시작하지 않았다.** 아래 2건만 수행했다. 순서는 ① F-3(jsx-a11y) 완료·검증 → ② F-1(Node 가드) 였다.

### 11.1 F-3 — `eslint-plugin-jsx-a11y` 도입 (승인 완료)

- 버전: **`^6.10.2`** — npm registry 확인(2026-09-19) 결과 `latest` = 6.10.2. `packages/config` 의 devDependency 로 caret 고정. §6 표 갱신 완료.
- 연결 위치: `packages/config/eslint/react.js` → flat config block `haru/react-a11y` (`plugins: { 'jsx-a11y': jsxA11y }`, `jsxA11y.flatConfigs.recommended.rules` 34개). 상수 `JSX_A11Y_RECOMMENDED_RULES` 로 export 해 테스트에서 검증한다.
- **루트 `eslint.config.js` 연결은 하지 않았다** (Stage 1-A 유예 유지). 대상 파일(`apps/web`, `packages/ui`)이 생기는 Stage 1-B 에서 연결한다. 이번 범위는 "react.js 모듈이 jsx-a11y 를 포함해 정상 로드·동작하는지" 까지다.
- 부수 수정 2건 (필수, 최소 범위):
  1. **`packages/config/eslint/react.js` 의 react-hooks config 선택 오류** — `eslint-plugin-react-hooks@7.1.1` 은 `configs.recommended` / `configs['recommended-latest']` 가 아직 **eslintrc 형식**(`plugins: string[]`)이고 flat 형식은 `configs.flat.*` 아래에 있다. 기존 코드는 eslintrc 쪽을 먼저 선택해, ESLint 10 이 이 설정을 실제로 적용하면 `A config object has a "plugins" key defined as an array of strings` 예외로 **즉시 종료**했다 (Stage 1-A 는 모듈 로드만 검증해 드러나지 않았던 잠복 결함). `configs.flat['recommended-latest']` 를 우선 선택하도록 고치고, `files: REACT_FILES` 로 스코프를 명시했다.
  2. **타입 선언 부재** — 위 §6 주석 참조. `packages/config/types/eslint-plugin-jsx-a11y.d.ts` 추가 + `packages/config/tsconfig.json` `include` 에 `types/**/*.d.ts`, `package.json` `files` 에 `types` 추가.
- 회귀 방지 테스트 2건 추가 (`packages/config/__tests__/shared-config.test.ts`, 총 11 → 13건):
  - `wires the jsx-a11y recommended rule set` — `haru/react-a11y` block 존재, `jsx-a11y` 플러그인 등록, 권장 규칙 20개 초과.
  - `only contains flat-format blocks` — 모든 block 의 `plugins` 가 배열이 아님(위 ①의 재발 방지).

**음성 테스트 (규칙이 실제로 발화하는지)** — 임시 디렉토리(스크래치패드)에 `base + react` flat config 와 위반 TSX 를 만들어 저장소 `eslint` 바이너리로 실행했고, 확인 후 임시 파일을 **삭제**했다.

| 입력 | 결과 |
|---|---|
| `<img src="/cover.png" />` (alt 없음) | `error jsx-a11y/alt-text` |
| `<div onClick={…}>Start</div>` | `error jsx-a11y/click-events-have-key-events`, `error jsx-a11y/no-static-element-interactions` |
| `<a>no content</a>` (href 없음) | `error jsx-a11y/anchor-is-valid` |
| 위반 파일 전체 | **4 errors, exit 1** |
| 동일 구조의 정상 파일(alt·button·href) | **0 problems, exit 0** |

→ ESLint 10 + jsx-a11y 6.10.2 조합에서 **peer 경고와 무관하게 규칙이 정상 발화**한다.

### 11.2 F-1 — Node 버전 `preinstall` 가드 (승인 완료)

- 파일: `/Users/soojin/dev/haru/scripts/check-node-version.mjs`, root `package.json` `"preinstall": "node scripts/check-node-version.mjs"` (scripts 최상단).
- 판정 기준은 **`package.json` 의 `engines.node` 를 읽어서** 계산한다. 범위를 스크립트에 하드코딩하지 않았다 (이중 관리 없음). `.nvmrc`·`engines.node`·`packageManager` 등 **승인값은 변경하지 않았다.**
- 외부 semver 라이브러리를 추가하지 않았다. Node 내장(`node:fs`, `node:url`, 정규식)만 사용한다. 지원 형식은 공백 AND 비교자(`>=`, `>`, `<=`, `<`, `=`). `^`/`~`/`||`/와일드카드는 **조용히 통과시키지 않고 예외로 중단**한다(스크립트 동반 갱신 안내).
- **우회 경로 없음** — 환경변수·CLI 플래그 bypass 를 만들지 않았다. 직접 실행 시에는 항상 `process.version` 을 검사한다. (순수 함수 `satisfiesEngineRange` / `checkNodeVersion` 을 export 하지만, 이는 테스트용이며 설치 경로를 우회시키지 못한다.)
- 실패 메시지는 **한국어**로 ① 현재 Node 버전 ② 요구 범위(+출처 `package.json → engines.node`) ③ 해결 방법(nodejs.org 공식 pkg / `fnm` · `nvm` + `.nvmrc`) ④ 우회 옵션 없음·승인 근거(§16.1 D-10)를 출력한다.

검증:

| 검사 | 명령 | 결과 |
|---|---|---|
| 차단 경로 (현재 머신) | `node scripts/check-node-version.mjs` | **exit 1** + 한국어 가드 메시지 (현재 `v24.16.0`, 요구 `>=24.21.0 <25`) |
| 차단 경로 (실제 설치) | `pnpm install --force` | **exit 1** — `ERR_PNPM_EXECUTOR_LIFECYCLE_SCRIPT_FAILED` … `preinstall: exited with exit status: 1` |
| 차단 경로 (fresh clone 모사) | 스크래치패드에 `node_modules` 없는 동일 구성으로 `pnpm install` | **exit 1** (의존성 다운로드 전에 중단). 확인 후 삭제 |
| 통과 경로 (직접 실행) | 스크래치패드 fixture(`engines.node` = `">=24.16.0 <25"`)로 스크립트 복사 실행 | **exit 0** + `[check-node-version] OK — Node v24.16.0 은(는) ">=24.16.0 <25" 를 만족합니다.` 확인 후 삭제 |
| 통과 경로 (로직) | `satisfiesEngineRange(v, ">=24.21.0 <25")` | `24.21.0`·`24.22.3` → PASS / `24.20.9`·`24.16.0`·`25.0.0`·`26.0.0` → BLOCK |
| 미지원 표기 | `satisfiesEngineRange('v24.21.0','^24.21.0')` | 예외 발생(조용한 통과 없음) |

**알려진 동작 특성 (QA 참고)**: pnpm 12 는 `node_modules` 가 이미 최신이면 설치 작업 자체를 건너뛰며, 이때 `preinstall` 도 실행되지 않는다 (`pnpm install` / `pnpm install --frozen-lockfile` 이 "Lockfile is up to date, resolution step is skipped" 로 exit 0). 가드는 **실제 설치 작업이 발생하는 경우**(fresh clone, lockfile 변경, `--force`, `node_modules` 부재)에 발화한다. Stage 1-B 는 새 패키지 설치가 필수이므로 Node 업그레이드 없이는 진행할 수 없다.

### 11.3 검증 명령 — 가드 추가 전 / 후

가드 도입 후에는 재설치가 막히므로, 도입 **전** 결과를 먼저 기록해 둔다. 모든 실행은 Node `v24.16.0` / pnpm `12.4.2`.

| 명령 | 가드 추가 **전** (jsx-a11y 반영 후) | 가드 추가 **후** |
|---|---|---|
| `pnpm install` | exit 0 (`eslint-plugin-jsx-a11y@6.10.2` 설치, lockfile 갱신) | exit 0 (up-to-date 라 설치 작업·preinstall 모두 skip) / `--force` 시 exit 1 = 가드 작동 |
| `pnpm typecheck` | exit 0 | exit 0 |
| `pnpm lint` | exit 0 (error 0 / warning 0) | exit 0 |
| `pnpm test` | exit 0 — Test Files 1 passed, **Tests 13 passed** | exit 0 — 동일 |
| `pnpm lint:boundaries` | exit 0 — `✔ no dependency violations found (13 modules, 14 dependencies cruised)` | exit 0 |
| `pnpm format:check` | exit 0 (`pnpm format` 적용 후) | exit 0 |
| `pnpm peers check` | unmet peer 1건 — `eslint-plugin-jsx-a11y@6.10.2` ↔ `eslint@10.10.0` (§6 주석) | 동일 |

### 11.4 Stage 1-B 선결 조건 (사용자 조치)

1. **로컬 Node 를 `24.21.0` 이상 `<25` 로 업그레이드** (`.nvmrc` = `24.21.0`). 업그레이드 전에는 `pnpm install` 이 가드에 의해 차단되어 Stage 1-B 의 신규 패키지 설치가 불가능하다. 에이전트는 사용자 머신을 변경하지 않았다.
2. Stage 1-B 에서 `apps/web` · `packages/ui` 생성 시 루트 `eslint.config.js` 에 `@haru/config/eslint/react` 를 대상 glob 과 함께 연결한다 (§11.1).
3. `eslint-plugin-jsx-a11y` 의 ESLint 10 peer 경고는 상위 버전 출시 전까지 남는다. Stage 1-B 설치 로그에서 이 1건 외 신규 peer 경고가 생기면 보고 대상이다.
