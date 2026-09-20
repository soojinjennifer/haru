# Stage 1-C Handoff — `packages/contracts`

Status: IMPLEMENTED (2026-09-20, development-agent) — stage-qa-agent 검증 대기
Scope: Stage 1 Plan §7.1(contracts 경로 ↔ API_CONTRACTS 대응표) · §7.2(health endpoint 계약) · §7.3(contracts 사용 규약) · §6(상수 근거) · §9.4(`packages/contracts` 구조) · §11.6 AC-1-31~AC-1-36 · §12 "contracts 단위" 행
근거 문서: `docs/plans/stage-1-plan.md` (APPROVED 2026-09-18) · `docs/API_CONTRACTS.md` §1·§2·§3.1·§3.5·§4 Stage 1 · `docs/ARCHITECTURE.md` §1.2·§5·§6 · `docs/decisions/stage-1-approvals.md` · `.claude/rules/architecture.md` §5·§6 · `backend.md`

> **Stage 1-D1 (`shared/api` · `healthApi` · `MockHealthApi` · `HttpHealthApi` · scenario store · `apps/web`) 은 시작하지 않았다.**
> Stage 1-A(툴체인) · Stage 1-B(design-tokens) 산출물은 아래 §6 F-1 한 건(경계 규칙 오탐 보정)을 제외하고 변경하지 않았다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` Status: APPROVED | OK — `APPROVED (2026-09-18, user)` |
| `docs/design/stage-1-design-spec.md` Status: APPROVED | OK (Stage 1-C 는 UI 없음 — contracts 는 Design Spec 영향 없음) |
| 이전 Stage QA PASS | Stage 1 은 Stage 0 사용자 승인(2026-09-14)으로 대체 |
| Plan ↔ PRD / Figma 모순 | 없음 |
| Plan In Scope 에 Backend 구현 작업 | 없음 — contracts 는 `.claude/rules/backend.md` §2 가 허용하는 "API Contract 정의" 범위 |

---

## 2. 구현한 AC

| AC | 내용 | 구현 증거 |
|---|---|---|
| AC-1-31 | enum 23 종이 API_CONTRACTS §2 와 정확히 일치 | `src/enums/*.ts` + `src/__tests__/enums.test.ts` (값·순서 스냅샷 23 건 + 제외값 검사) |
| AC-1-32 | `SESSION_TRANSITIONS` 12 행 · `canTransition` 허용/비허용 | `src/rules/session-transitions.ts` + `session-transitions.test.ts` (허용 14 조합 · 대표 비허용 10 건 · 384 조합 전수 검사) |
| AC-1-33 | `isReportEligible` 경계 동작 | `src/rules/report-eligibility.ts` + `report-eligibility.test.ts` (3599/3600 × 2/3 + 4 반환값 전부) |
| AC-1-34 | 상수 5 종이 결정 #17 과 일치 | `recording-limits.test.ts` · `report-eligibility.test.ts` |
| AC-1-35 | Error Code 28 종 · Error Envelope parse/reject · `TRIAL_ACCOUNT_RESTRICTED` 부재 | `src/common/error-codes.ts` · `error-envelope.ts` + `error-envelope.test.ts` |
| AC-1-36 | 런타임 의존이 `zod` 뿐 | `package.json` `dependencies: { "zod": "^4.6.5" }` + `pnpm lint:boundaries` (§5) |

AC-1-36 의 "API 타입이 `apps/web` 에 재선언되지 않았다" 는 `apps/web` 이 아직 없어 **Stage 1-D1 이후 재확인 대상**이다.

---

## 3. 생성 / 수정 파일

### `packages/contracts` (신규)

```
packages/contracts/
├── package.json            @haru/contracts — dependencies: zod 만
├── tsconfig.json           @haru/config/tsconfig/base.json 확장
├── vitest.config.ts        defineHaruTestProject({ name: 'contracts', environment: 'node' })
└── src/
    ├── index.ts            도메인별 re-export (deep import 금지)
    ├── common/   id.ts · datetime.ts · pagination.ts · error-codes.ts · error-envelope.ts · index.ts
    ├── enums/    capability · session-status · session-mode · completed-reason · analysis-outcome ·
    │             upload-status · reading-context · consent · gender · survey · parent-verification ·
    │             analysis-job · report · activity · book · gift-request · caregiver · onboarding-step ·
    │             deletion · notification (+ index.ts)
    ├── rules/    session-transitions.ts · recording-limits.ts · report-eligibility.ts · index.ts
    ├── health/   health.ts · index.ts
    └── __tests__/ enums · session-transitions · report-eligibility · recording-limits ·
                   error-envelope · pagination · health · common-primitives  (8 파일 / 106 테스트)
```

### 수정 (기존 산출물)

| 파일 | 변경 | 이유 |
|---|---|---|
| `.dependency-cruiser.cjs` | `CONTRACTS_NON_RUNTIME` 상수 추가 후 `contracts-runtime-deps-zod-only` · `contracts-no-workspace-deps` 의 `from.pathNot` 에 적용 | §6 F-1 — Stage 1-A 규칙이 패키지 **자체 툴체인 설정 파일**(`vitest.config.ts`)까지 런타임 코드로 보아 오탐 |
| `pnpm-lock.yaml` | `zod@4.6.5` 추가 | 신규 의존 |
| `docs/API_CONTRACTS.md` | §1.2 · §2.2 · §3.1 · §3.5 · §4 Stage 1 에 "구현 반영" 주석 추가 | rules/workflow.md §5 — 구현으로 확정된 contract 반영은 development-agent 소관 |
| `docs/decisions/stage-1-approvals.md` | §5 추가 | Stage 1-C 구현 확정 사실 기록 |

### 명시적 비생성 (Plan §9.6 · §3.1 · AC-1-07)

`apps/` · `apps/api/` · `apps/mobile/` · `supabase/` · `packages/ui` · `packages/validation` · `packages/shared-types` — **전부 없음** (§4 증거).
Stage 2~8 도메인 contract(`rules/capability-score`, §3.2 `CreateSession*`, §3.3 `RecordingUpload*`, §3.4 Consent/ChildInfo/Onboarding) 는 **빈 stub 포함 생성하지 않았다** (D-8).

---

## 4. 실행한 검증 명령과 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **PASS** (exit 0) — root + `packages/config` · `design-tokens` · `contracts` |
| `pnpm lint` | **PASS** (exit 0, 오류 0) |
| `pnpm test` | **PASS** — Test Files 12 / Tests **166** (Stage 1-A·1-B 기존 **60** 유지 + Stage 1-C 신규 **106**) |
| `pnpm lint:boundaries` | **PASS** — `no dependency violations found (68 modules, 114 dependencies cruised)` |
| `pnpm build` | **PASS** — `@haru/design-tokens` 재빌드 정상 (`primitive 65 · semantic 192 · component 48`, `provisional 71 / 15 항목`). `apps/web` 빌드는 Stage 1-D1 대기(NO-OP) |
| `pnpm format:check` | **PASS** — `All matched files use Prettier code style!` |

Scope 확인:

```
$ ls -d apps supabase packages/ui   → 3건 모두 No such file or directory
$ ls packages                        → config  contracts  design-tokens
```

Type safety: `packages/contracts/src` 내 `any` / `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` **0 건**.
브라우저 안전성: `node:` builtin · `require(` · `process.` · `__dirname` 사용 **0 건**.

---

## 5. `contracts-runtime-deps-zod-only` 검증 (Stage 1-A 미검증 항목)

### 5.1 허용 방향 — `contracts → zod`

dependency-cruiser JSON 출력 분석 결과:

```
contracts/src modules cruised: 42
contracts/src -> zod edges (실제 해석됨): 28
zod 를 제외한 node_modules 의존: 없음 (0건)
예시 edge: packages/contracts/src/common/id.ts
           -> node_modules/.pnpm/zod@4.6.5/node_modules/zod/index.d.cts [npm,import]
총 violations: 0
```

Stage 1-A 에서 zod 미설치로 확인하지 못했던 **허용 방향이 실제로 해석되고 통과**함을 확인했다.

### 5.2 차단 방향 — 음성 테스트 (임시 위반 파일 주입 → 확인 → 삭제)

`packages/contracts/src/__negative_check__.ts` 에 위반 import 를 하나씩 넣고 `depcruise` 를 실행했다.
`packages/ui` · `apps/web` 는 아직 없으므로 검사용 임시 타깃(`packages/ui/src/index.ts`, `apps/web/src/main.ts`)을 만들고 **검사 직후 전부 삭제**했다 (§4 Scope 확인으로 잔여 없음 증명).

| # | 위반 import | 발화한 규칙 | 결과 |
|---|---|---|---|
| N1 | `import type ts from 'typescript'` (zod 외 npm 의존) | `contracts-runtime-deps-zod-only` | **차단 확인** |
| N2 | `import { useState } from 'react'` | `not-to-unresolvable` | **차단 확인** (아래 §6 F-2 참조) |
| N3 | `packages/design-tokens/scripts/token-sources.mjs` (상대 경로) | `contracts-no-workspace-deps` | **차단 확인** |
| N4 | `packages/ui/src/index.ts` (상대 경로) | `contracts-no-workspace-deps` | **차단 확인** |
| N5 | `apps/web/src/main.ts` (상대 경로) | `contracts-no-workspace-deps` + `no-package-to-app` | **차단 확인** (2 규칙 동시 발화) |

임시 파일 삭제 후 `pnpm lint:boundaries` 재실행 → `no dependency violations found`.

### 5.3 런타임 의존 · 실행 환경

- `packages/contracts/package.json` `dependencies` = `{ "zod": "^4.6.5" }` (설치 `4.6.5` — Plan §16.1 D-10 승인값과 동일, 2026-09-20 registry latest 재확인 결과도 `4.6.5`).
- `devDependencies` = `@haru/config`(workspace) · `typescript` · `vitest` — 모두 툴체인 전용이며 `exports`(`./src/index.ts`) · `files`(`src`) 밖이다.
- **Node 동작 확인**: `tsc --module nodenext --moduleResolution nodenext` 로 컴파일한 산출물을 Node 24 에서 `import` 하여 `canTransition` · `isReportEligible` · `HealthResponseSchema.parse` 실행 성공 (export 55 개 로드).
  이를 위해 패키지 내부 상대 import 에 **확장자 `.js` 를 명시**했다 (확장자 없으면 Node ESM 에서 `ERR_UNSUPPORTED_DIR_IMPORT`).
- **브라우저 동작**: Node builtin·`process` 미사용, zod 자체가 브라우저 안전. 실제 번들 검증은 `apps/web` 이 생기는 Stage 1-D1 에서 수행한다.

---

## 6. 발견 사항

### F-1 (Medium, 수정 완료) — `contracts-*` 경계 규칙이 패키지 자체 툴체인 설정 파일을 오탐

Stage 1-A 의 `contracts-runtime-deps-zod-only` 는 `from.pathNot` 이 테스트 파일(`*.test.ts`)만 제외해서,
`packages/contracts/vitest.config.ts` 의 `vitest/config` · `@haru/config/vitest/base` import 를
"런타임 의존" 으로 잡아 2 건의 오탐 error 를 냈다. 두 규칙의 의도는 **배포되는 런타임 코드**(`exports`/`files` = `src/**`)이므로
`from.pathNot` 에 패키지 루트의 `*.config.*` / `*.setup.*` 를 추가했다. **규칙의 적용 대상·강도는 약화되지 않았다** —
§5.2 N1~N5 가 `src/**` 에서 정상 발화함을 확인했다.

### F-2 (Low, 조치 불요) — 미설치 패키지 import 는 `not-to-unresolvable` 이 잡는다

`contracts → react` 는 `contracts-runtime-deps-zod-only` 가 아니라 `not-to-unresolvable` 로 차단된다.
`react` 가 `packages/contracts` 에서 해석되지 않아 dependency type 이 `npm` 으로 분류되지 않기 때문이다.
pnpm 의 isolated `node_modules` 구조상 `apps/web` 이 react 를 설치해도 `packages/contracts` 에서는 계속 해석되지 않으므로
**차단은 유지**되며(추가로 `tsc` · 빌드도 실패), 규칙 변경이 필요하지 않다.

### F-3 (Low, 정보) — contracts 는 빌드 산출물이 없다

`exports` 가 `./src/index.ts` 를 직접 가리킨다. `apps/web`(Vite)·Vitest 는 TS 소스를 그대로 소비한다.
향후 Backend 가 Node 런타임에서 재사용하려면 **컴파일 단계가 필요**하다 (§5.3 에서 동작 확인 완료).
Stage 8 `BACKEND_HANDOFF.md` 에 "contracts 재사용 시 `--module nodenext` 컴파일" 을 기록 대상으로 남긴다.

### F-4 (Low, 정보) — `ErrorEnvelope.requestId` 의 형식

API_CONTRACTS §1 Conventions 는 `X-Request-Id` 를 uuid 로 규정하지만, `ErrorEnvelopeSchema` 의 `requestId` 는
`z.string().min(1)` 로 구현했다. 오류 처리 경로가 requestId 형식 불일치 때문에 **다시 실패하지 않게** 하기 위함이다.
요청 헤더로 보내는 값은 Stage 1-D1 의 `shared/api/helpers/requestId.ts` 에서 `IdSchema`(uuid)로 생성한다.

---

## 7. Mock 시나리오

**Stage 1-C 범위에 없음.** contracts 는 schema·rule 정의만 제공한다.
`health` 의 5 scenario(`success`·`loading`·`error`·`retry`·`offline`)와 전환 스위치는 **Stage 1-D1** (`apps/web/src/mocks/`) 범위다 (Plan §8.1, D-5).
contracts 가 Mock 에 제공하는 재료: `HealthResponseSchema`(응답 parse) · `ErrorEnvelopeSchema` + `ErrorCode`(error scenario) · `HaruApiError`(throw) · `SESSION_TRANSITIONS`/`canTransition`(Stage 4 `invalid-transition` scenario).

---

## 8. `BACKEND_INTEGRATION_PENDING` 예상 항목

**Stage 1-C: 0 건** (Plan §10 과 일치).
`GET /v1/health` 는 계약만 정의했고 Frontend 검증은 Stage 1-D1 의 Mock 으로 전부 가능하다.

Stage 8 Handoff 에 반영할 **재사용 요구사항**(PENDING 아님, 기록 대상):
향후 Backend 는 `packages/contracts` 의 enum 23 종 · Error Code 28 종 + HTTP status 매핑 · Error Envelope · Pagination 규약 ·
`SESSION_TRANSITIONS` 12 행 · `MAX_RECORDED_SECONDS` / `READY_ABANDON_SECONDS` / `MIN_REPORT_RECORDED_*` / `REPORT_CYCLE_DAYS` 를
**그대로 import** 해야 하며 별도 schema/type 을 재선언하지 않는다 (rules/backend.md §4).

---

## 9. Scope 경계에서 보류한 항목

| 항목 | 보류 이유 | 대상 |
|---|---|---|
| `rules/capability-score` | API_CONTRACTS §4 가 Stage 2 로 명시 | Stage 2 |
| §3.2 `CreateSession*` · §3.3 `RecordingUpload*` · §3.4 Consent/ChildInfo/Onboarding schema | 도메인 Stage 범위, 빈 stub 도 금지 (D-8) | Stage 2·4 |
| Stage 2 이상 도메인 Error Code | §1.2 표의 공통 코드 28 종까지만 | 해당 Stage |
| `healthApi` interface · Mock/Http Adapter · scenario store · `apps/web` | Stage 1-D1 | Stage 1-D1 |
| `packages/ui` Shared UI 22 종 | Stage 1-D2 (Plan §9.3) | 후속 |
