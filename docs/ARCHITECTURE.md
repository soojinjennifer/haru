# HARU Architecture (Frontend-only Scope)

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (Rev 6: #33 · C-19 반영)
Decision log: `docs/decisions/stage-0-approvals.md` — 이 문서와 다르면 결정 기록이 우선한다.
Based on: PRD v1.4 (`docs/source/HARU_PRD_v1.4.md`, 2026-07-18), Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` (page `8:2`, `16:2` — design-agent `docs/FIGMA_SCREEN_MAP.md` · `COMPONENT_MAP.md` · `DESIGN_SYSTEM.md` · `DESIGN_TOKEN_MAP.md` · `FRONTEND_IMPLEMENTATION_PLAN.md` DRAFT 2026-09-14), `CLAUDE.md` Development Scope 및 `.claude/rules/*.md` (Frontend-only 개정 2026-09-14), `docs/source/prompts/01-stage0-1-1-frontend-scope.md`, `docs/decisions/stage-0-technical-research.md`, `docs/source/HARU_Development_Architecture_8Stage_v0.2.md`(참고, 미승인)
Author: plan-agent (2026-09-14)

라벨: `CONFIRMED` = PRD/Figma/사용자 결정으로 확정 · `RECOMMENDED` = 근거 있는 권장안, 승인 필요 · `NEEDS DECISION` = 사용자/법무/비즈니스 결정 필요.
사용자 결정은 `CONFIRMED (사용자 결정 2026-09-14, #id)`, 디자이너 대기 가값은 `가값 (P-xx)`, 법무 대기는 `NEEDS DECISION (법무, L-xx)`, 사용자 수용 예외는 `D-xx` 로 표기한다 (결정 기록 §1, §3, §4, §6).
"기술 요구사항" = PRD에 문구로 없으나 해당 PRD ID를 충족하기 위해 기술적으로 필요한 항목.
**"Backend Handoff 요구사항"** = 향후 Backend Developer가 충족해야 할 요구사항. 이 프로젝트에서 구현하지 않으며, Stage 8 Handoff 문서(대상 문서 명시)로 넘긴다.

---

## 0. Scope Boundary — Frontend-only (CONFIRMED, 사용자 지시 2026-09-14)

원문: `docs/source/prompts/01-stage0-1-1-frontend-scope.md` · 반영: `CLAUDE.md` Development Scope, `.claude/rules/backend.md` §1–§2.

| 구분 | 내용 |
|---|---|
| 구현한다 | `apps/web` (React/Vite Caregiver UI, `src/mocks` 포함), `packages/contracts`, `packages/design-tokens`, `packages/ui`, `packages/config`, `apps/mobile` Capacitor 셸 (Stage 4에서 생성 — CONFIRMED (사용자 결정 2026-09-14, #7)) |
| 구현하지 않는다 | Node/Express API, route/controller/service/repository, Supabase migration·server logic·RLS·Storage server logic, STT/AI backend, Analysis Worker, Background/Cron Job, Render backend 배포, Production DB schema. `apps/api/`, `supabase/` 디렉토리 미생성 |
| Backend에 대해 하는 일 | Contract(Zod) · Request/Response · Error Code · Auth Requirement · Data Requirement · State Definition · Storage Requirement · Recording Upload Contract · Async Analysis Contract · Mock API/Data · Handoff 문서 |
| 검증 | 실제 Backend가 필요한 항목은 `BACKEND_INTEGRATION_PENDING` (rules/qa.md §1). Frontend 부분(UX, Contract 호출, Mock 시나리오)은 별도로 PASS/FAIL |
| 종료 | Stage 8 = Frontend Final QA + 이월 기능(C-15) + Mock 웹 프리뷰 정적 배포(C-18) + Backend Handoff Package → **STOP** |

Handoff 문서 대상 (Stage 8): `docs/BACKEND_HANDOFF.md` · `docs/API_CONTRACTS.md` · `docs/DATA_REQUIREMENTS.md` · `docs/AUTH_REQUIREMENTS.md` · `docs/RECORDING_UPLOAD_SPEC.md` · `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` · `docs/ERROR_CODES.md`.

이 문서의 §3, §8, §9, §11, §12, §14(Backend 부분)는 **Backend Handoff 요구사항**이며 구현 계획이 아니다.

---

## 1. Monorepo Structure

### 1.1 구조 (CONFIRMED (사용자 결정 2026-09-14, #5) — rules/architecture §2와 동일. `apps/api`·`supabase` 미생성은 사용자 지시로 CONFIRMED. 패키지 매니저 pnpm workspaces + Node LTS (#6))

```
~/dev/haru/
├── apps/
│   ├── web/                 React + Vite (Caregiver UI) — src/mocks 포함
│   └── mobile/              Capacitor iOS/Android 셸 — Stage 4에서 생성 (CONFIRMED #7; Stage 1–3은 웹 전용)
├── packages/
│   ├── contracts/           Zod schema · enum · error code · session state · validation rule (Frontend ↔ 향후 Backend 공식 Interface)
│   ├── design-tokens/       Figma Variables → CSS Variables → Tailwind preset
│   ├── ui/                  Shared UI (도메인 지식 없음)
│   └── config/              tsconfig / eslint / prettier / vitest preset
├── docs/                    계획·디자인·QA·Handoff 문서
└── .claude/
```

**만들지 않음**: `apps/api`, `supabase/migrations`, `supabase/seed`, 기타 Backend 런타임 코드 (CONFIRMED).

### 1.2 `contracts` / `shared-types` / `validation` 중복 위험

| 패키지 (v0.2 초안) | 초안 책임 | 문제 |
|---|---|---|
| `packages/contracts` | Zod API schema, enum, error code, session state | Source of Truth. `z.infer` 로 타입 파생 |
| `packages/shared-types` | "생성된 DB 타입 등 공용 타입" | Frontend는 DB 타입을 쓰지 않고, 이 프로젝트에는 DB도 Backend도 없다 → 소비자 없음. "공용 타입" 이름이 API 타입 재선언을 유도 → 이중 타입 소스 |
| `packages/validation` | Front/Back 공용 순수 규칙 함수 | schema `refine` 과 규칙이 갈라짐. 규칙 대부분(전이 허용, eligibility, 녹음 상한)이 contract 상수와 한 몸 |

**CONFIRMED (사용자 결정 2026-09-14, #5)** (rules/architecture §2와 동일):
1. `packages/validation` 을 **`packages/contracts` 에 병합** — `contracts/src/rules/*` (`canTransition`, `isReportEligible`, `MAX_RECORDED_SECONDS`, `READY_ABANDON_SECONDS`). 부수효과 없음, `zod` 외 의존 없음, 시간은 인자 주입.
2. `packages/shared-types` **미생성**. DB 생성 타입은 향후 Backend 저장소의 책임(Handoff 요구사항: repository가 DB row → contracts DTO 매핑).
3. Frontend 전용 View Model은 `apps/web/src/entities/*/model.ts` — API 모양과 같은 타입 재선언 금지 (QA grep 대상).

```
packages/contracts/src/
├── common/        id, pagination, error-envelope, error-codes, datetime
├── enums/         capability, session-status, upload-status, reading-context, consent-type, report-eligibility ...
├── rules/         session-transitions, report-eligibility, recording-limits
├── auth/ consent/ onboarding/ children/ activity-cards/ books/ sessions/ recordings/ reflections/ analysis/ reports/ data-management/ notifications/
└── index.ts       도메인별 re-export (deep import 금지)
```

### 1.3 Repository 위치 — **Resolved** (CONFIRMED (사용자 결정 2026-09-14, #4, C-14))

| 항목 | 결정 |
|---|---|
| 저장소 | 로컬 `~/dev/haru` (OneDrive 밖 ASCII 경로) + origin `https://github.com/soojinjennifer/haru.git` (private). GitHub = 백업·다기기 동기화 |
| 포함 | Stage 0 문서·설정, `docs/source/` 사본 (PRD v1.4 · 8Stage v0.2 · `prompts/` 사용자 지시 원문 · Baseline Survey v1 — C-14). 사본은 수정하지 않고 OneDrive 원본 갱신 시 교체 |
| 미포함 | 원본 기획·디자인 자료 (`$HARU_ONEDRIVE` — CLAUDE.md 정의), `SF-Pro.ttf` (#11) |
| 홈 디렉토리 git | 사용자 홈(`/Users/soojin`)의 다른 프로젝트(Lawservice) git은 그대로 둔다 |
| 이전 폴더 | `$HARU_ONEDRIVE/HARU Dev` 는 보존용, 개발·문서 갱신은 이 저장소에서만 |

해소된 문제: OneDrive 동기화로 인한 `node_modules`·`.git` 부하·placeholder 실패, 홈 디렉토리 git root, 경로의 한글·공백 (PLANNING §8 R-11).

---

## 2. Frontend Architecture

### 2.1 Stack

- `CONFIRMED` (사용자 지시 docs/source/prompts/01-stage0-1-1-frontend-scope.md "Frontend 기술 스택"): React · TypeScript(strict) · Vite · React Router · Tailwind CSS · CSS Variables · TanStack Query · Zod.
- `CONFIRMED (사용자 결정 2026-09-14, #6, #29)`: pnpm workspaces + Node LTS. **Tailwind CSS v4** (CSS-first `@theme`) — `packages/design-tokens` CSS 변수를 `@theme` 에 직접 연결.
- `CONFIRMED (사용자 결정 2026-09-14, #27)`: **Supabase JS Client는 Stage 1–8에서 사용하지 않는다.** 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi`(API 계층) + `UploadTransport`(바이트 전송 계층) interface + Mock Adapter로 구현하고, 실제 Supabase/TUS Adapter는 Backend 연동 시점 또는 사용자 승인 후 추가한다 (시점 OAQ-19, API_CONTRACTS §5.1.1).
- `CONFIRMED (사용자 결정 2026-09-14, #8, #9, #28)`: **MSW 미사용** (도메인별 `Mock<Domain>Api`), **Playwright** (E2E·시각 비교), 차트 inline SVG, 제스처·애니메이션 CSS / Pointer Events 우선 (라이브러리는 필요 시 별도 승인), dev 전용 UI gallery route (Production 제외), import 경계 lint (도구는 Stage 1 Plan), (필요 시) TanStack Query persist.
- `CONFIRMED (사용자 결정 2026-09-14, #21)`: 아이콘 — 일반 아이콘 **Lucide** (`lucide-react`, ISC; 버전 고정 Stage 1 Plan), HARU 전용 아이콘 Figma SVG export, Google·Apple 로고는 공식 브랜드 에셋. 크기 단계 가값 (P-09).
- `CONFIRMED (사용자 결정 2026-09-14, #11)`: 폰트 — Apple 기기 시스템 폰트(SF Pro), 그 외 **Inter** (SIL OFL, self-host 권장). font stack `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` 는 `packages/design-tokens` 한 곳에서 정의, `system-ui` 를 Inter 앞에 두지 않음, `SF-Pro.ttf` 저장소·빌드 포함 금지.
- `CONFIRMED (사용자 결정 2026-09-14, #7)`: **Capacitor** — Stage 4에서 `apps/mobile` 셸 + 네이티브 녹음 플러그인 + 네이티브 Auth/Push Adapter 추가. Stage 1–3은 웹 전용 (§15 #1).
- `CONFIRMED (사용자 결정 2026-09-14, #10, #12, #20)`: 토큰 3-tier (값은 Figma, 신규 토큰 값은 가값 P-04~P-09), breakpoint 600/1024 + 앱 컬럼 최대 480px + 세로 고정, Dark mode 제외 (Light 전용).

### 2.2 디렉토리 (RECOMMENDED — rules/frontend §2와 동일, 전체 승인 #1 대상; `app / pages / features / entities / shared` 레이어와 `mocks/` 는 사용자 지시로 CONFIRMED)

```
apps/web/src/
├── app/          router, providers (API Adapter 선택 지점), layouts (TabLayout, FullscreenLayout, StackLayout), error boundary, route guards
├── pages/        route 단위 composition only
├── features/     auth, consent, onboarding-survey, child-profile, growth-capability, activity-card-deck, book-selection,
│                 reading-context, storytime-session, recording, prompt-drawer, reflection, short-feedback,
│                 library, growth-report, report-pdf, settings, data-management, notification-preferences
├── entities/     caregiver, child, capability, persona, book, prompt, activity-card, session, recording, reflection, report
│                 (query key factory, query/mutation hook, 순수 표시 컴포넌트)
├── shared/
│   ├── api/      도메인별 API Client Interface + 공통 helper (contracts parse, error envelope, token 첨부) + http/ (Http Adapter 골격)
│   ├── platform/ RecorderAdapter / FileStore / Network / Push permission / Permissions (web | capacitor)
│   └── lib/ hooks/ config/ assets/ copy/
└── mocks/        Mock Adapter · fixtures · scenarios (API_CONTRACTS §5)
```

- `features/A` → `features/B` import 금지, 조합은 `pages` (CONFIRMED).
- Shared UI는 `packages/ui` 에만 둔다.

### 2.3 API 호출 구조 (CONFIRMED: 사용자 지시 · rules/architecture §4)

```
UI / Feature Component
↓
Query / Mutation hook            (entities/*, features/*)
↓
API Client Interface             (shared/api — 도메인별)
↓
Mock Adapter | Http Adapter      (mocks/* | shared/api/http/*)
```

사용자 예시 그대로:

```
SessionPage                       pages/session — composition only
↓
useCreateSession()                entities/session — TanStack useMutation
↓
sessionApi.create()               shared/api/session-api.ts — interface SessionApi
↓
MockSessionApi                    mocks/sessions/MockSessionApi.ts   (Stage 2–8)
HttpSessionApi                    shared/api/http/HttpSessionApi.ts  (Contract 기반 골격, 연동 = BACKEND_INTEGRATION_PENDING)
```

```ts
// shared/api/session-api.ts
export interface SessionApi {
  create(req: CreateSessionRequest): Promise<CreateSessionResponse>;
  transition(id: string, req: SessionTransitionRequest, idempotencyKey: string): Promise<SessionTransitionResult>;
  get(id: string): Promise<SessionDetail>;
}

// app/providers/ApiClientProvider.tsx — Adapter 선택은 여기 한 곳
const clients = env.apiMode === 'mock'
  ? { sessionApi: new MockSessionApi(scenarioStore), /* … */ }
  : { sessionApi: new HttpSessionApi(httpClient), /* … */ };

// entities/session/useCreateSession.ts
export const useCreateSession = () => {
  const { sessionApi } = useApiClients();
  return useMutation({ mutationFn: sessionApi.create });
};
```

규칙:
- Component·Page는 API Client나 Adapter를 직접 호출하지 않는다 (CONFIRMED).
- Mock → Http 교체 시 UI·Feature·Query 코드 변경 0 — QA 대상 (CONFIRMED).
- Mock/Http 모두 요청·응답을 contracts schema로 parse (CONFIRMED).
- 도메인별 `Mock<Domain>Api` 는 공통 helper(지연·scenario 조회·error envelope·`canTransition`)를 사용해 중복을 막는다 (CONFIRMED (사용자 결정 2026-09-14, #8)).
- Mock scenario: 공통 `success / loading / empty / error / retry` + HARU 특화 `recording-upload-success/failure`, `analysis-pending/completed/failed`, `report-eligible/not-eligible` 등 (CONFIRMED 목록 — 사용자 지시 docs/source/prompts/01-stage0-1-1-frontend-scope.md "Mock Architecture"). **Scenario machine key의 유일한 기준은 API_CONTRACTS §5.4 Catalogue**, 그룹별 적용은 §5.3. 전환 스위치 방식·Production 빌드 처리는 Stage 1 Plan 결정.
- MSW(Service Worker mock)는 사용하지 않는다 (CONFIRMED (사용자 결정 2026-09-14, #8)) — Capacitor WebView 제약, Adapter 계층으로 충분.

### 2.4 Route Guard 순서 (기술 요구사항, FR-01/02/03)

```
unauthenticated                                   → /auth/*  또는 Trial /onboarding/* (기기 로컬 draft만, 서버 전송 없음 — C-12)
authenticated && requiredConsents missing         → /auth/consent  (모든 가입 경로 — C-2, §7.3.1)
consented && parentVerification pending|failed    → /auth/verify-parent (VPC 단계 슬롯 — C-3, 경로명 RECOMMENDED; Mock은 기본 통과)
consented && onboarding incomplete                → /onboarding/:step (중도 저장 복귀, FR-03; Trial draft가 있으면 submit)
onboarding complete && profile result 미확인       → /onboarding/profile
else (Stage 2)                                    → `/` Home skeleton — 워드마크·설정 아이콘 `26:44`(최종 위치)·빈 상태 안내, 하단 탭바 없음 (CONFIRMED #33)
else (Stage 3 이후)                               → `/` Home 콘텐츠 + app routes (탭 Library / Home / Progress — #15)
```

Guard 판단 데이터는 `GET /v1/me` (Mock) 한 번으로 받는다 (API_CONTRACTS `MeResponse`). 탭 구조는 CONFIRMED (#15, D-02), 개별 경로명은 PLANNING §9.2 (RECOMMENDED).

---

## 3. Backend Handoff 요구사항 — Backend Architecture (구현 안 함 → `BACKEND_HANDOFF.md`)

rules/backend.md §4를 향후 Backend가 충족해야 할 구조 요구사항으로 기록한다.

```
(향후 Backend 저장소 — 이 프로젝트 밖)
src/ app, server, worker 엔트리 분리 · config(env Zod 검증) · middleware(auth, request-id, consent-guard, error, rate-limit)
     modules/ me, consents, onboarding, children, capabilities, personas, books, library, prompts, activity-cards,
              recommendations, sessions, recordings, reflections, rewards, analysis, reports, notifications, data-management
     jobs/ analysis-worker, retention-sweeper, report-scheduler, activity-card-generator, abandoned-session-sweeper
     infrastructure/ supabase, storage, ai, stt, pdf, push, logging, queue
```

- 계층 `route → controller → service → repository → infrastructure`, 입력은 `packages/contracts` schema 검증, 모듈 내 별도 schema/type 선언 금지.
- Recommendation(Cold/Warm, 역량 순환)은 룰 기반 service, LLM은 Prompt 슬롯 변형에만 (PRD §8.2).
- 공통 Error Envelope + contracts Error Code (`ERROR_CODES.md`).

---

## 4. Dependency Boundary (CONFIRMED (사용자 결정 2026-09-14, #5, #9) — rules/architecture §2와 동일)

| From | 허용 import | 금지 |
|---|---|---|
| `apps/web` | `@haru/ui`, `@haru/design-tokens`, `@haru/contracts`, `@haru/config` | 다른 앱, DB 타입, AI/STT/Supabase SDK |
| `apps/mobile` | `apps/web` 빌드 산출물 (코드 import 아님) | 소스 import |
| `packages/ui` | `@haru/design-tokens` | `@haru/contracts`, 도메인 개념 |
| `packages/contracts` | `zod` | 그 외 모든 런타임 의존 |
| `packages/design-tokens` | 없음 | — |

금지: `packages/*` → `apps/*` import, 순환 의존. 경계 자동 검증(import 경계 lint)은 승인됨 (#9) — 도구(ESLint `import/no-restricted-paths` 또는 dependency-cruiser)는 Stage 1 Plan에서 확정.

## 5. State Management

| 상태 종류 | 소유자 | 도구 |
|---|---|---|
| Server State (카드, 책, 세션 요약, 리포트, me) | `entities/*` query hook | TanStack Query (CONFIRMED) |
| Session lifecycle 영속 상태 | 향후 서버가 최종 권한 — **현재는 Mock Adapter가 contracts 전이 표로 서버 역할을 재현**. 클라이언트는 낙관적 반영 + outbox | TanStack Query mutation + SessionOutbox (§10.5) |
| Recording 캡처 상태 | `features/recording` RecordingController 상태 머신 | 순수 TS reducer (RECOMMENDED) — XState 등은 Stack 확장이므로 비권장 |
| Upload Queue | `features/recording` UploadQueue (IndexedDB / 네이티브 저장소 영속) | 순수 TS |
| Onboarding wizard draft | `features/onboarding-survey` | 동의 후: Mock draft 저장(FR-03). 가입 전 Trial: 기기 로컬 draft만 (C-12, §7.4) |
| UI State (시트, 카드 덱 index) | component state | React state |
| 인증 세션 | `AuthGateway` (§7.2) — Mock | Provider context |

전역 상태 라이브러리(Zustand/Redux)는 도입하지 않는다 (RECOMMENDED). RecordingController·UploadQueue는 React 밖 싱글톤 서비스로 두고 `useSyncExternalStore` 로 구독한다 — 페이지 이동과 무관하게 녹음·업로드가 유지되어야 하기 때문 (기술 요구사항, NFR 안정성).

## 6. Server State + Data Access Path

### 6.1 Frontend 규칙 (API Client 경유: CONFIRMED — 사용자 지시 / Supabase 직접 접근·JS Client 미사용: CONFIRMED (사용자 결정 2026-09-14, #27))

Frontend는 도메인 데이터를 **API Client Interface 경유로만** 읽고 쓴다 (§2.3). Supabase 직접 쿼리, DB 타입 import, Supabase JS Client 사용은 이 프로젝트 단계에서 하지 않는다 (rules/frontend §1).

### 6.2 향후 Backend의 데이터 노출 방식 — Backend Handoff 요구사항 (`BACKEND_HANDOFF.md`, RECOMMENDED)

| 기준 | A. API only (Supabase는 Auth + 서명된 Storage 업로드만) | B. 읽기는 클라이언트가 Supabase 직접(RLS) |
|---|---|---|
| 동의 강제 (FR-02) | 서비스 한 곳에서 강제 | RLS 정책에 동의 조건 중복 구현 |
| contracts 단일 소스 | 모든 응답이 contracts DTO | DB row 모양이 Frontend로 노출 |
| 이미 구현된 Frontend 구조와의 호환 | Http Adapter만 연결하면 됨 | Frontend 데이터 계층 재작성 필요 |
| 파생 데이터(리포트 집계·eligibility) | 서버 | 혼재 |

**RECOMMENDED: A** — Frontend가 API Client Interface로 구현되므로 A가 아니면 Handoff 이후 Frontend 재작업이 생긴다. RLS는 2차 방어선으로 유지 (`DATA_REQUIREMENTS.md`).

### 6.3 TanStack Query 규약 (RECOMMENDED)

- Query key factory per entity: `sessionKeys.all / list(filters) / detail(id) / analysis(id)`.
- 분석 상태: `GET /v1/sessions/:id/analysis` 를 `analyzing` 동안만 폴링(foreground 60초 간격, 백오프). push deep link 진입 시 invalidate. 실시간 채널은 도입하지 않는다 (PRD 분석 SLA 24시간).
- Activity Card 오프라인 캐시 (NFR 오프라인): TanStack Query persist 플러그인은 필요 시 사용 승인됨 (#9 — 사용 여부는 Stage 3 Plan). 대안은 `activityCardKeys.today` 결과만 IndexedDB 수동 저장. 아동 이름·전사 등 민감 데이터 캐시 제외.
- Mutation은 응답 contracts parse 성공 후 cache update. 세션 전이는 낙관적 업데이트 + 실패 시 롤백 대신 **서버(Mock) 상태로 재동기화**.

## 7. Authentication

### 7.1 요구와 구현 범위

- `CONFIRMED` (PRD FR-01, §7.1): 이메일·Google·Apple 가입/로그인, 비밀번호 재설정, Apple/Google은 모바일 필수.
- **Frontend (이 프로젝트)**: 화면, `AuthGateway` interface, `MockAuthGateway`, Route Guard, 토큰 만료 UX, 토큰 첨부.
- **Backend Handoff 요구사항 (`AUTH_REQUIREMENTS.md`)**: 인증 제공자 설정, 토큰 발급·검증, OAuth·nonce, 재설정 메일. 연동 시 실제 Adapter 구현 방식 (RECOMMENDED, research §9):

| 플랫폼 | Email/Password | Google | Apple |
|---|---|---|---|
| Web | Supabase Auth email + reset 링크 | OAuth redirect (PKCE) | OAuth redirect (Services ID 필요) |
| iOS/Android (Capacitor) | 동일 | 네이티브 SDK → `signInWithIdToken` (nonce: Supabase에는 raw, SDK에는 SHA-256) | 네이티브 Sign in with Apple → `signInWithIdToken` |

Apple Guideline 4.8 원문은 제출 시 재확인. Figma `179:1701`/`179:1820` 에 Apple 버튼 없음 (M-16) → **Apple 공식 가이드 버튼 사용** (CONFIRMED (사용자 결정 2026-09-14, C-13)).

플랫폼 단계 (CONFIRMED (사용자 결정 2026-09-14, #7)): Stage 1–3은 Web `AuthGateway` + `MockAuthGateway` 만. Stage 4에서 Capacitor 네이티브 Apple/Google 로그인 Adapter를 추가한다 (토큰 교환·검증은 Mock, 실제 연동 PENDING).

### 7.2 AuthGateway (interface + Mock: CONFIRMED (#27) · 시그니처: RECOMMENDED)

```ts
interface AuthGateway {
  getSession(): Promise<AuthSession | null>;
  onChange(cb: (s: AuthSession | null) => void): Unsubscribe;
  signUpWithEmail(input): Promise<AuthResult>;
  signInWithEmail(input): Promise<AuthResult>;
  signInWithProvider(p: 'google' | 'apple'): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  signOut(): Promise<void>;
}
// Stage 2–3: MockAuthGateway (Web) — signUpWithEmail input = 보호자 이름·이메일·비밀번호만 (아이 정보 없음, C-5)
// Stage 4: 네이티브 provider 로그인 Adapter 추가 (#7), 토큰 교환은 Mock
// 연동 시점 또는 사용자 승인 후: SupabaseWebAuthGateway / SupabaseNativeAuthGateway (BACKEND_INTEGRATION_PENDING)
```

API 호출은 `Authorization: Bearer <token>` (Mock에서는 가짜 토큰). 토큰 갱신은 Gateway 책임, API helper는 `AUTH_TOKEN_EXPIRED` 수신 시 1회 refresh 후 재시도.

### 7.3 동의(Consent)와 계정 생성의 순서 (기술 요구사항, FR-01·FR-02, PRD §7.1)

- OAuth 가입은 Provider 콜백 시점에 계정이 생성되므로 "동의 전 가입 차단"을 계정 생성 자체로 강제할 수 없다.
- 따라서 **"필수 동의 완료 전에는 어떤 아동 데이터도 생성·수집하지 않는다"** 를 규칙으로 둔다:
  - Frontend (구현): Route Guard가 `/auth/consent` 로 보내고, 동의 기록 Contract 호출 성공 전에는 아동 데이터를 Contract로 전송하지 않는다. Mock은 동의 없이 아동 데이터 쓰기 시 `CONSENT_REQUIRED` 를 반환한다.
  - Backend Handoff 요구사항 (`AUTH_REQUIREMENTS.md`): 필수 동의가 없으면 `children`, `onboarding_responses`, 세션 관련 모든 쓰기 endpoint가 `CONSENT_REQUIRED` 반환.
- **모든 가입 경로(Email · Google · Apple)는 계정 생성 직후 같은 동의 화면을 거친다** — CONFIRMED (사용자 결정 2026-09-14, C-2). 가입 화면은 보호자 이름·이메일·비밀번호만 받는다 (C-5). 동의는 `POST /v1/consents` 로 항목별 문서 버전과 함께 기록.
- 동의 항목 — CONFIRMED (사용자 결정 2026-09-14, C-1): 필수 ① 이용약관 `terms_of_service` ② 개인정보처리방침 `privacy_policy` ③ 아동 음성·성장 데이터 처리 보호자 동의 `child_voice_data` (별도 체크), 선택 ④ 마케팅 수신 `marketing`, 추가 ⑤ 파일럿(베타) 참여 동의 `pilot_participation` — 필수/선택 여부·문구 NEEDS DECISION (법무, L-02). Frontend는 `CurrentConsentDocuments` 의 `required` 플래그로 필수 여부를 받아 화면을 그린다 (값 변경 시 코드 수정 없음).
- **VPC (Verifiable Parental Consent)** — 방식 NEEDS DECISION (법무, L-01). Stage 2 Frontend는 동의 화면 뒤에 VPC 단계를 끼울 수 있는 슬롯을 두고 Mock으로 진행 (C-3).
- **동의 철회 = MVP 제외** — CONFIRMED (사용자 결정 2026-09-14, C-4). 탈퇴·전체 데이터 삭제 요청(FR-21, Stage 8)만 제공. COPPA 보호자 권리와의 관계는 NEEDS DECISION (법무, L-03).
- 개정 COPPA **제3자 제공 분리 동의**는 C-1 항목에 없다 — 필요 여부는 법무 검토 (L-06 벤더 조건과 함께) NEEDS DECISION.

#### 7.3.1 Figma 가입 흐름의 동의 공백 (design-agent 확인 — M-27, M-28)

| ID | Figma | 문제 | 근거 |
|---|---|---|---|
| M-27 | Welcome `179:1701` "Continue with Google" `179:1709` — 체크박스 없이 하단 문구 `179:1722` "By continuing you agree to our Terms and Privacy Policy." 만 존재. OAuth 이후 동의·온보딩으로 가는 frame 없음 | Google 경로에는 약관·방침에 대한 수동 고지만 있고 **아동 음성 데이터 보호자 동의(필수·별도 체크)를 받는 단계가 없다** | FR-02, §7.1 "보호자 동의 미체크 시 가입 진행 불가" |
| M-28 | Create account `179:1724` "YOUR CHILD" 그룹 `179:1740`: 아이 **성+이름** ("Child's last name \| first name"), 성별, 생년월 — 동의 체크박스 `179:1742` 와 같은 화면에서 제출 | 동의가 기록되기 전(또는 동시에) 아동 개인정보가 전송된다. 성(last name)은 PRD §7.2 "이름(닉네임)" 범위를 넘어 최소 수집 원칙과 충돌. 성별은 PRD상 선택 입력 (M-38) | FR-02, FR-03, NFR 최소 수집 |

M-27 **Resolved (C-2)**, M-28 **Resolved (C-5, C-6, D-03)**, M-38 **Resolved (C-7)**. 결정된 Guard — CONFIRMED (사용자 결정 2026-09-14):

```
Email | Google | Apple 가입 (보호자 이름·이메일·비밀번호만 — C-5)
 → /auth/consent  동의 5항목 (C-1), 항목별 문서 버전 → POST /v1/consents
 → [VPC 단계 슬롯 — Mock, 방식 L-01] (C-3)
 → /onboarding Step 1 아이 정보 → 2 기질 카드 → 3 책·선호 주제 → 4 성장 목표 → 5 역량 문항 (C-9, C-8)
 → POST /v1/onboarding/submit → /onboarding/profile → `/` Home skeleton (Stage 2 착지 — #33)

Trial (C-12): /onboarding Step 1–5 (기기 로컬 draft만) → 프로필 저장 → 가입 → /auth/consent → VPC 슬롯 → POST /v1/onboarding/submit (draft 그대로)
```

1. **모든 가입 경로 뒤 동일한 `/auth/consent` 단계** (C-2). 계정이 생성되더라도 `Me.consentStatus.missing` 이 비어 있지 않으면 Route Guard가 `/auth/consent` 와 법률 문서 외 모든 화면을 차단한다. Welcome 화면의 수동 고지 문구는 동의 기록으로 간주하지 않는다.
2. 동의 화면은 항목별 체크 (C-1). Figma `179:1724` 단일 체크박스는 사용하지 않고 디자이너에게 수정 요청. 화면 디자인 방식은 Stage 2에서 C-13 절차로 결정.
3. **아이 정보는 가입 요청에 포함하지 않는다** (C-5). 아이 정보는 동의 기록(`POST /v1/consents` 성공 응답) 이후 온보딩 Step 1에서 수집해 `PUT /v1/onboarding/steps/child_info` 로 전송한다. Mock과 향후 서버는 동의 없는 `child_info` 저장을 `CONSENT_REQUIRED` 로 거부한다. Trial은 같은 데이터를 기기 로컬 draft로만 보관한다 (§7.4).
4. 아이 이름은 **성(last name)·이름(first name) 두 칸** (Figma `179:1740` 유지 — C-6). PRD "이름(닉네임)"·최소 수집과 다름 → 사용자 수용 예외 D-03, 법무 NEEDS DECISION (L-07). 화면·알림 호칭은 first name만 사용.
5. 성별은 선택 입력 (C-7): Girl / Boy / Prefer not to say, 기본 미선택, 미응답으로 진행 가능. 값 `girl` · `boy` · `prefer_not_to_say`, 미응답 `null`.
6. Stage 2 AC 후보 (Frontend 검증 가능): Email·Google·Apple(Mock) 가입 직후 동의 전 요청 로그에 아동 데이터 요청 0건; 가입 요청 body에 아이 필드 없음; 동의 전 `child_info` 저장 시도 → Mock `CONSENT_REQUIRED` 처리 UX; 필수 동의 ①②③ 미체크면 진행 불가; VPC 슬롯 Mock 통과·대기(`vpc-pending`) 표시. 서버 측 거부·VPC 실제 검증 = PENDING.

### 7.4 Trial → 계정 전환 (FR-24, P1)

**CONFIRMED (사용자 결정 2026-09-14, C-12) — 기기에만 저장하는 체험 (이전 옵션 A)**

- 가입 전 온보딩 응답(Step 1–5)은 기기 로컬 draft로만 저장한다 (contracts `OnboardingDraftSchema` 로 검증). 서버 전송 없음.
- "프로필 저장" 시 가입 → 동의(C-2) → (VPC 슬롯, C-3) → `POST /v1/onboarding/submit` 에 draft를 그대로 제출 → 프로필 산출.
- 동의 전 아이 정보는 서버로 보내지 않는다. 다른 기기에서 이어하기는 지원하지 않는다 (기기 변경 시 draft 유실을 화면에서 안내 — copy는 Stage 2).
- 익명 계정(Anonymous Sign-in) 방식은 쓰지 않는다 → `TRIAL_ACCOUNT_RESTRICTED`, `created_via='anonymous_trial'`, 익명 RLS 조건은 불필요.
- 로컬 draft 보관 상한·로그아웃/가입 완료 시 삭제 시점은 Stage 2 Plan.

## 8. Backend Handoff 요구사항 — Supabase Responsibility (구현 안 함 → `DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md`, `RECORDING_UPLOAD_SPEC.md`)

| 영역 | 향후 Supabase가 담당 (RECOMMENDED) | 담당하지 않음 |
|---|---|---|
| Auth | 계정·세션·JWT, Email/Google/Apple, 비밀번호 재설정 메일 | 동의·온보딩 상태 판단 (API) |
| PostgreSQL | 영속 데이터, FK·제약, **RLS(2차 방어선)**, 트랜잭션 | 비즈니스 규칙, 상태 전이 판단 |
| Storage | private bucket `recordings`, `highlight-clips`, `report-pdfs`; resumable(TUS) 업로드 수신; 만료 signed URL | TTL 자동 삭제(기능 없음 → Retention Job, research §8) |
| Queue/Cron (선택) | pg-boss 사용 시 Postgres를 큐 저장소로 사용 | Edge Functions에 도메인 로직 두지 않음 |

암호화: 관리형 at-rest + TLS. "녹음 원본 암호화 저장"(NFR)을 관리형 at-rest로 충족하는지, 앱 레벨 추가 암호화가 필요한지는 NEEDS DECISION (보안·법무, OAQ-14).

## 9. Backend Handoff 요구사항 — Node API Responsibility (구현 안 함 → `BACKEND_HANDOFF.md`)

현재 Frontend에서는 이 책임을 **Mock Adapter가 결정적으로 흉내** 낸다 (§2.3). 향후 Backend가 충족할 요구사항:

- 모든 도메인 읽기·쓰기 (§6.2 A)
- 소유권 확인(caregiver → child → session → recording), 동의 확인(consent guard)
- Session 상태 전이 판정 (contracts `SESSION_TRANSITIONS` 사용)
- 업로드 초기화(경로·업로드 토큰)와 업로드 완료 확정(Storage 객체 존재·크기·해시 검증) (`RECORDING_UPLOAD_SPEC.md`)
- Analysis Job enqueue, 결과 저장, 짧은 피드백 생성 (`ANALYSIS_PIPELINE_REQUIREMENTS.md`)
- 온보딩 룰 기반 스코어링(즉시) + 페르소나 생성(LLM 슬롯 + 금지어 검증, 3초 목표, 실패 시 기본 풀)
- Activity Card 일일 생성(07:00 로컬, 설정 가능), 추천(Cold/Warm, 역량 순환)
- 리포트 eligibility 판정·생성·PDF·발행 알림
- Push 발송(Context 기반 invitational, 48h 업로드 실패 안내, 리포트 도착/이월 독려)
- Retention(90일), 세션 녹음 삭제, 전체 데이터 삭제, audit log
- 금지: Secret을 클라이언트에 노출, 로그에 PII

## 10. Recording Client Architecture + Session State Model

범위: RecordingController·RecorderAdapter·LocalRecordingStore·SessionOutbox·UploadQueue는 **Frontend 구현** (Stage 4). 서버 측 전이 판정·업로드 수신·검증은 **Backend Handoff 요구사항** (`RECORDING_UPLOAD_SPEC.md`, `API_CONTRACTS.md`)이며, 현재는 Mock Adapter가 contracts 전이 표로 재현한다.

### 10.1 PRD §12.2 상태 모델의 문제점

PRD: `ready → recording ⇄ paused → completed → analyzing → analyzed / failed(재시도 대상)`

| # | 문제 | 모델 (CONFIRMED (사용자 결정 2026-09-14, #16) — OAQ-17 의존 값은 결정 전 enum 제외) |
|---|---|---|
| 1 | `failed → retry → analyzing` 에서 **retry는 상태가 아니라 행위** | enum에 `retry` 넣지 않음. `failed → analyzing` 은 System(Job 재큐잉)만 수행 |
| 2 | 대화 전용 세션(§7.4 "책 없이 대화만 하기", §13 마이크 거부, §8.1 DB에 없는 책)은 녹음이 없어 `analyzing` 불가 | `mode: recorded \| conversation_only` 필드. conversation_only는 `completed` 가 종착 |
| 3 | §13 "세션 준비 후 10분 방치 시 정리" 를 표현할 상태 없음 | 종착 상태 `abandoned` (기술 요구사항, §13). 재시작은 새 세션 |
| 4 | 업로드 상태가 세션 상태와 섞임 | 별도 upload status 필드 (rules/architecture §6). `completed → analyzing` 은 업로드 확정 시에만 |
| 5 | STT 저품질(§13)은 실패가 아니라 "정량 분석 제외 + 기록 보존" | `analyzed` + `analysisOutcome: excluded_low_quality` |
| 6 | `recording ⇄ paused` 는 오프라인 중에도 일어남 | 캡처 중 상태는 **클라이언트 권한**, 서버(현재 Mock)에는 `occurredAt` 포함 이벤트로 사후 동기화(outbox). `completed` 전이는 반드시 동기화 |
| 7 | 30분 자동 종료(FR-09, §13), 크래시 복구(NFR) 종료 사유 구분 없음 | `completedReason: user_done \| auto_timeout \| recovered_after_crash` |
| 8 | 녹음 삭제로 분석 불가 | `analysisOutcome: skipped_audio_deleted` 후보 — 표현 방식 NEEDS DECISION (OAQ-17), 결정 전 enum 제외 (#16). 동의 철회 값(`skipped_consent_revoked`)은 제거 (C-4) |

### 10.2 `SessionStatus` (PRD 7개 값 + `abandoned` — CONFIRMED (사용자 결정 2026-09-14, #16), `packages/contracts/enums/session-status`)

`ready | recording | paused | completed | analyzing | analyzed | failed | abandoned`

보조 필드 (CONFIRMED #16): `mode` (`recorded | conversation_only`), `completedReason` (`user_done | auto_timeout | recovered_after_crash`), `analysisOutcome` (`full | excluded_low_quality` — skipped 값은 OAQ-17 결정 전 제외), `recordings[].uploadStatus`.

분석 표시 상태 매핑 (RECOMMENDED — COMPONENT_MAP `AnalysisStatusCard` 상태 `pending · analyzed · excluded_low_quality · failed` 와 정합; design 문서 동기화는 Orchestrator):

| 표시 상태 (AnalysisStatusCard) | `sessionStatus` | `analysisOutcome` | Mock key |
|---|---|---|---|
| pending | `analyzing` (또는 `completed` + 업로드 대기) | null | `analysis-pending` |
| analyzed | `analyzed` | `full` | `analysis-completed` |
| excluded_low_quality | `analyzed` | `excluded_low_quality` | `analysis-low-quality` |
| failed | `failed` | null | `analysis-failed` |
| not_available (추가 제안) | `completed` (mode=`conversation_only`) | null | `analysis-not-available` |
| skipped (추가 제안, OAQ-17 결정 시에만) | `analyzed` | `skipped_audio_deleted` 후보 | `recording-deleted` |

### 10.3 전이 표 (contracts `SESSION_TRANSITIONS` 로 한 번만 정의 — Frontend·Mock·향후 Backend 공유)

| From | To | Trigger | Actor | Guard (거부 시 error code — Mock이 재현, 서버 강제는 Handoff) |
|---|---|---|---|---|
| (없음) | `ready` | 세션 화면 진입 `POST /v1/sessions` | Caregiver | 온보딩 완료, child 소유 (`CHILD_NOT_FOUND`, `ONBOARDING_INCOMPLETE`), Idempotency-Key |
| `ready` | `recording` | 녹음 버튼 탭 | Caregiver (client) | mode=recorded, 필수 동의 + `child_voice_data` 동의 유효 (`CONSENT_REQUIRED`); 마이크 권한은 클라이언트 확인 |
| `ready` | `completed` | 대화 전용 "Done" | Caregiver | mode=conversation_only |
| `ready` | `abandoned` | 10분 미시작 | Client timer (+ Handoff: server sweeper) | 종착 |
| `recording` | `paused` | Pause | Client | — |
| `paused` | `recording` | Resume | Client | 누적 녹음 < 30분 |
| `recording`/`paused` | `completed` | Done Reading / 30분 자동 / 크래시 복구 | Client | `completedReason` 필수, `endedAt ≥ startedAt` |
| `completed` | `analyzing` | 녹음 업로드 확정 | Server (현재 Mock) | mode=recorded, 동의 유효, 모든 part 업로드 검증 (`RECORDING_INCOMPLETE`) |
| `analyzing` | `analyzed` | Job 성공(저품질 제외 포함) | Worker (현재 Mock scenario) | — |
| `analyzing` | `failed` | Job attempts 소진 | Worker (현재 Mock scenario) | — |
| `failed` | `analyzing` | 재큐잉 | Worker/Admin (Handoff) | 동의 유효, 원본 오디오 존재 |

그 외 전이는 `SESSION_INVALID_TRANSITION`. 같은 전이의 재요청은 Idempotency-Key로 동일 응답.
Client-only 상태(영속 안 함, RecordingController 내부): `requesting_permission`, `permission_denied`, `starting`, `stopping`, `finalizing_local`, `recovering`, `interrupted`.

### 10.4 RecordingController 구성 (RECOMMENDED — rules/architecture §7과 동일, 전체 승인 #1 대상; "단순 React Hook이 아닌 독립 Domain" 은 사용자 지시로 CONFIRMED)

```
RecordingController (순수 TS 상태 머신, features/recording)
 ├─ ConsentGate          me.consents 확인 → 없으면 시작 불가 (Mock/향후 서버도 거부)
 ├─ PermissionService    마이크 권한 요청·거부 감지 → 설정 딥링크 / "대화만 하기" 전환 (§13)
 ├─ RecorderAdapter      ← WebRecorderAdapter | NativeRecorderAdapter (Capacitor)
 ├─ LocalRecordingStore  청크 영속 + 복구 메타데이터
 ├─ SessionOutbox        전이 이벤트 영속·재전송 (Idempotency-Key)
 └─ UploadQueue          네트워크 복구 감지, 재시도·백오프, 48h 경과 감지
      → recordingApi (API 계층: init / tokens / complete / status) → MockRecordingApi | HttpRecordingApi(골격)
      → UploadTransport (바이트 전송 계층) → MockUploadTransport | TusUploadTransport(골격, 연동 PENDING)
```

```ts
interface RecorderAdapter {
  readonly platform: 'web' | 'ios' | 'android';
  capabilities(): { backgroundCapture: boolean; screenLockCapture: boolean; nativePause: boolean; mimeType: string };
  checkPermission(): Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission(): Promise<'granted' | 'denied'>;
  start(opts: { sessionId: string; chunkMs: number }): Promise<void>;   // NFR 시작 지연 ≤ 1s
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<RecordingPartRef[]>;
  onChunk(cb: (c: LocalChunkRef) => void): Unsubscribe;
  onInterruption(cb: (e: 'call' | 'route_change' | 'os_kill' | 'background') => void): Unsubscribe;
}
```

| 구현 | 캡처 | 로컬 영속 | 백그라운드/잠금 |
|---|---|---|---|
| WebRecorderAdapter | `MediaRecorder` timeslice(예 5–10s) | 청크 → OPFS 파일, 메타데이터·복구 포인터 → IndexedDB | **보장 불가** (iOS Safari/PWA 잠금 시 캡처 중단 — research §2a; Android Chrome 미검증 §2b). Wake Lock + `visibilitychange` 경고로 완화만 |
| NativeRecorderAdapter (Stage 4 — #7) | Capacitor 네이티브 녹음 플러그인 (Capawesome 또는 Cap-go, research §2c — 선택은 Stage 4 spike) | 앱 샌드박스 파일 | iOS `UIBackgroundModes: audio` + AVAudioSession, Android 14+ `microphone` foreground service + 상시 알림 (research §2c/2d) |
| MockRecorderAdapter (테스트) | 가짜 청크 생성, clock 주입 | 메모리 | 인터럽션·권한 거부·크래시 시나리오 주입 (API_CONTRACTS §5.4 `mic-permission-denied`, `auto-timeout`, `crash-recovered`) |

주의 (미검증 → Stage 4 spike 필수): 플러그인 청크 분할 기록 지원, pause 중 백그라운드 세션 유지, 인터럽션 후 재개, Android 16 FGS 제약.

### 10.5 로컬 영속 · 업로드 · 크래시 복구

1. `ready → recording` 시 로컬 레코드 생성: `{sessionId, recordingLocalId, parts[], state}` (IndexedDB / 네이티브 저장소).
2. 청크마다 즉시 flush. 크래시 후 재실행 시 `recovering`: 미완료 레코드 → 마지막 청크 시각을 `endedAt` 으로 `completed(recovered_after_crash)` 이벤트를 outbox에 적재 → 업로드 진행 (NFR 안정성).
3. 업로드 단위: 녹음 1건 = 1..n **part** (정상 1개, 크래시·인터럽션 재시작 시 추가). Web webm 청크 연결 가능, Safari mp4 조각 연결성은 **미검증**.
4. 업로드 흐름 (Contract): `POST /v1/sessions/:id/recordings` (init) → Upload Transport로 part 전송 → `POST /v1/recordings/:id/complete` (part 크기·sha256·duration) → `uploadStatus=uploaded` → 세션 `analyzing`.
   - Frontend: `MockRecordingApi`(init/complete 응답·error code)와 `MockUploadTransport`(part 전송 성공·실패·지연·토큰 만료 주입)가 흐름을 재현한다. 실제 전송 구현 `TusUploadTransport` 는 골격만 (API_CONTRACTS §5.1.1).
   - Backend Handoff 요구사항 (`RECORDING_UPLOAD_SPEC.md`, RECOMMENDED): Supabase Storage resumable(TUS), signed upload token 최대 24h (research §3), 서버 part 검증.
5. 업로드 토큰 만료 시 재발급 (`UPLOAD_TOKEN_EXPIRED`).
6. **확정 응답 전 로컬 삭제 금지** (RECOMMENDED — 기술 요구사항, NFR 안정성·§13 네트워크 끊김; rules/architecture §7과 동일, Mock 확정 응답 포함). 확정 후 로컬 파일 삭제.
7. 업로드 실패 48시간 경과 → 로컬 안내 (Frontend). 서버 push 안내는 Handoff. 기기 보관 상한 NEEDS DECISION (OAQ-11).
8. 세션 녹음 삭제 시 로컬 미업로드 파일도 삭제 (기술 요구사항, FR-21·NFR 프라이버시). 동의 철회 경로는 없다 (C-4).

클라이언트 UploadQueue 상태 (`features/recording` 내부, contracts 아님): `local_only | queued | uploading | uploaded | failed_retrying | stalled_48h`
서버 응답 `uploadStatus` (contracts, CONFIRMED (사용자 결정 2026-09-14, #16)): `pending | uploaded | failed | deleted | expired`

### 10.6 Session 규칙 매핑

| 규칙 | 근거 | Frontend | Backend Handoff |
|---|---|---|---|
| 최대 30분 자동 종료 + 녹음 보존 | FR-09, §7.5, §13 | contracts `MAX_RECORDED_SECONDS=1800` — **실제 녹음 시간 기준, 일시정지 제외** (CONFIRMED (사용자 결정 2026-09-14, #17)), RecordingController 타이머는 `recording` 상태에서만 누적 | 서버 검증 (RU) |
| 10분 방치 정리, 리마인드 버블 1회 | §13 | Client timer + 버블 | server sweeper (BH) |
| 캐릭터 버블은 시작·종료 2회, 녹음 중 개입 없음 | FR-10, FR-11, §7.5 | 응답 값(`SessionBubbleCopy`)만 표시 | 검수 템플릿 (BH) |
| Prompt 모아보기 (무음·무진동) | FR-11, §7.5 | `features/prompt-drawer` | — |
| 출석 스티커 | FR-19, §7.6 | `completed` 응답의 `stickerAward` 표시 | 멱등 지급 (DR) |

## 11. Backend Handoff 요구사항 — Async Analysis (구현 안 함 → `ANALYSIS_PIPELINE_REQUIREMENTS.md`)

**Frontend 부분**: `GET /v1/sessions/:id/analysis` 상태·결과 조회와 표시(Stage 5), 리포트 조회·표시(Stage 7). Mock scenario `analysis-pending/completed/failed/low-quality`, `report-eligible/not-eligible/deferred/delayed`.

### 11.1 Pipeline 요구사항 (rules/backend §4)

```
recording uploaded (complete API)
 → analysis_jobs INSERT (idempotency: session_id + recording_id + pipeline_version UNIQUE)
 → Worker claim (RECOMMENDED: pg-boss, §14)
 → 1 STT (SpeechToTextProvider, diarization)
 → 2 Quality gate ── 저품질 → analysisOutcome=excluded_low_quality, 기록·피드백 보존 (§13)
 → 3 PII Redaction (주소·전화번호 등, §13) → transcripts.redacted_text
 → 4 Sensitive/부적절 발화 감지 → 분석 제외·중립 처리 (§13)
 → 5 Metrics Extraction (발화량, turn-taking, 감정 어휘, 새 단어, 반복 주제)
 → 6 Capability Signal Analysis
 → 7 Highlight clip 후보 선택 (10–15초, FR-18) → 클립 저장
 → 8 Short Feedback 생성 (템플릿 + LLM 슬롯) → Safety Validation → 실패 시 검수 기본 문구
 → 9 Profile update trigger (FR-15)
 → session.status=analyzed, push "short feedback" (FR-13)
```

- SLA 24시간 (FR-14, NFR). attempts·지수 백오프·최종 `failed` + `error_code`. 단계별 결과 분리 저장으로 단계별 재실행.
- 하나의 완벽한 Transcript에 의존하지 않는다: 발화량·turn-taking은 diarization 타임스탬프로, 감정 어휘는 전사 품질 의존 (PRD §14.2).

### 11.2 리포트 생성 요구사항 (FR-16, FR-17, §7.7, §13)

- 일 1회 스케줄러: 4주 주기 종료 가정 조회 → eligibility. Frontend는 같은 규칙을 contracts `isReportEligible` 로 진행도 표시에만 사용.
- 발행 기준 상수 — CONFIRMED (사용자 결정 2026-09-14, #17):
  - `MIN_REPORT_RECORDED_SESSIONS = 3` AND `MIN_REPORT_RECORDED_SECONDS = 3600` (누적 녹음 1시간, PRD §7.7)
  - `recordedSeconds` = 실제 녹음 시간 (일시정지 제외), 세션당 최대 `MAX_RECORDED_SECONDS = 1800`
  - STT 실패·저품질 세션 (`analysisOutcome: excluded_low_quality`)은 세션 수·누적 시간 모두에서 **제외**
  - 주기 = **첫 세션 완료일부터 28일 단위 반복** (`REPORT_CYCLE_DAYS = 28`)
  - 미결 세부 (Stage 7 Plan): 대화 전용 세션이 "첫 세션 완료일"에 포함되는지, 시간대 경계
- 미충족: `deferred` + 다음 주기 이월 + 독려 알림. 생성 실패: 재시도 3회 → 익일 재생성, 지연 안내 (§13).

## 12. Backend Handoff 요구사항 — AI / STT Provider (구현 안 함 → `ANALYSIS_PIPELINE_REQUIREMENTS.md`)

Frontend는 AI/STT를 호출하지 않고, 생성 문구는 API(Mock) 응답 값만 표시한다 (CONFIRMED — 사용자 지시 docs/source/prompts/01-stage0-1-1-frontend-scope.md: STT Backend·AI Backend는 구현 금지 범위).

```ts
// 향후 Backend 요구사항 (contracts에 두지 않음)
interface SpeechToTextProvider { transcribe(input: { audioRef: SignedAudioRef; language: 'en'; diarize: true }): Promise<SttResult>; }
interface AIProvider {
  generatePersona(input: PersonaInput): Promise<PersonaDraft>;                  // FR-05, 3초 목표
  generateShortFeedback(input: ShortFeedbackInput): Promise<FeedbackDraft>;     // FR-13
  generateRecommendation(input: PromptSlotInput): Promise<PromptSlotDraft>;     // §8.2 슬롯 변형만
  generateReportNarrative(input: ReportNarrativeInput): Promise<NarrativeDraft>; // FR-16
}
interface ContentSafetyValidator { validate(text: string, ctx: SafetyContext): SafetyResult; } // 금지어 + 안전 필터 (§8.4)
```

- Mock provider 기본값, 모든 호출 `ai_generation_logs` (원문 미저장·마스킹), AI에 아이 이름 미전송(서버에서 슬롯 치환).
- Provider 선택·ZDR 계약: §15 #4, #5.

## 13. Privacy (Architecture Requirement)

| 통제 | 근거 | Frontend 책임 (구현·검증) | Backend Handoff 요구사항 (문서) |
|---|---|---|---|
| Caregiver 계정 소유, 아이 로그인 없음, Child 1명 | §1.6, §3.1 (CONFIRMED) | 1 child 전제 UI, 아이용 로그인 없음 | `children` unique(caregiver) (DR) |
| 보호자 동의 + 이력 | FR-02, NFR | 항목별 동의 UI (C-1 5항목), 모든 가입 경로 뒤 동의 (C-2), 동의 기록 전 아동 데이터 미전송, 동의 없음 시 녹음 차단 (§7.3.1), 동의 이력 보기 Stage 8 선택 기능 (C-19, 미구현 시 QA FAIL 아님). 동의 철회 없음 (C-4, 법무 L-03) | 서버 강제, append-only consent history (AR, DR) |
| 검증 가능한 보호자 동의(VPC), 제3자 제공 분리 동의 | NFR, 개정 COPPA (research §12) | 동의 화면 뒤 VPC 단계 슬롯 + Mock (C-3) | VPC 방식·기록 (AR) — **NEEDS DECISION (법무, L-01)**; 제3자 제공 분리 동의 필요 여부 **NEEDS DECISION (법무)** |
| 최소 수집 | NFR | 동의 후 온보딩 Step 1에서만 아이 정보 입력 (C-5): 성·이름 두 칸 (D-03, 법무 L-07, 호칭은 first name) · 생년월 · 성별 선택 (C-7). 콘솔·에러 로그 PII 금지 | 저장 최소화, AI에 이름 미전송 (DR, AP) |
| 광고 목적 제3자 사용 금지 | NFR | 광고·제3자 분석 SDK 미도입 (번들 검사) | 벤더 제공 범위, push payload PII 최소화 (BH) |
| Raw Audio ↔ Derived 분리 | rules/architecture §9 | — | `recordings` / `transcripts` / `session_metrics` / `observations` / `capability_signals` / `reports` 분리 (DR) |
| Raw audio 90일 자동 파기, 전사·지표 유지 | NFR | 보관 정책 안내, `expiresAt`·expired 표시 | Retention Job — Storage API 삭제 + audit (DR) |
| 보호자 요청 시 즉시 삭제 | NFR, FR-21 | 세션별·전체 삭제 요청·탈퇴 UX (Stage 8, C-15), 로컬 녹음·캐시 정리 | 삭제 파이프라인·SLA (DR, BH) |
| 하이라이트 클립 보관 | FR-18 ↔ NFR 90일 | 만료 클립 표시 | 보관 기간 — **NEEDS DECISION** (OAQ-13) |
| 접근 최소화 + 감사 로그, 암호화 | NFR 보안 | HTTPS 전용, Secret 미포함 | service role 제한, audit_logs, at-rest/앱 레벨 암호화 (DR, OAQ-14) |
| 서면 Data Retention Policy, Information Security Program | 개정 COPPA | — | 법무·운영 문서 (출시 전 필수) |
| 로컬 데이터 | 기술 요구사항 | 로컬 녹음은 앱 샌드박스/OPFS, 로그아웃·녹음 삭제·전체 삭제 시 삭제. Trial 로컬 draft는 제출 완료·로그아웃 시 삭제 (C-12, 보관 상한은 Stage 2 Plan) | — |
| Mock 웹 프리뷰 | C-18 | Mock 모드 빌드만 배포 — 실제 아동 데이터·Secret 없음, fixture는 가상 데이터 | — |

## 14. Deployment

**이 프로젝트에서는 Backend를 배포하지 않는다** (CONFIRMED, 사용자 지시 2026-09-14).

| 구성 | 이 프로젝트 (Frontend) | Backend Handoff 요구사항 (`BACKEND_HANDOFF.md`) |
|---|---|---|
| Web | **Stage 8: Mock 모드 웹 프리뷰를 정적 호스팅에 배포** — CONFIRMED (사용자 결정 2026-09-14, C-18). 시연·Backend Developer 인계용, 실제 아동 데이터 없음, API mode = mock 빌드. 호스팅 서비스는 Stage 8 Plan에서 확인 | — |
| iOS/Android | 앱 테스트 빌드(TestFlight / Play Internal Testing) **배포하지 않음** (C-18). Stage 4 이후 실기기 QA용 로컬 빌드만 (#7) | — |
| API | 없음 — 앱은 Mock Adapter로 동작, Http Adapter는 골격 | RECOMMENDED: Render Web Service |
| Worker / Cron | 없음 | RECOMMENDED: Render Background Worker (pg-boss on Supabase Postgres) + Cron (retention, report scheduler, activity card generator, abandoned sweeper) |
| DB / Auth / Storage | 없음 | RECOMMENDED: Supabase `dev` / `staging` / `prod` 분리 |
| Secrets | `VITE_*` 공개 값만 (API base URL, api mode 등) | 환경 변수 / env groups |

## 15. Technical Decisions — 12개 이슈 (Frontend-only 기준 재라벨)

근거 조사: `docs/decisions/stage-0-technical-research.md`. 가격·정책은 결정 시점 재확인. "NEEDS DECISION (Backend Developer)" = Handoff 문서에 권장안과 함께 기록하고 Backend Developer·사용자가 결정. 각 칸은 `LABEL — 권장안` 형식의 라벨 1개, `—` = 해당 측 요구사항 없음. Frontend·Backend Handoff 두 칸은 PLANNING §7과 동일하다.

| # | 이슈 | Frontend 결정 | Backend Handoff 요구사항 | 근거 |
|---|---|---|---|---|
| 1 | Web-first + Wrapper vs Native | **CONFIRMED (사용자 결정 2026-09-14, #7)** — React/Vite + Capacitor 셸 + 네이티브 녹음 플러그인, **Stage 4에서 추가** (Stage 1–3 웹 전용) | — | PRD §1.6 iOS/Android 앱 요구. 대안: Expo/RN(재작성), Swift/Kotlin(이중 개발), Web/PWA only(NFR 미충족) (research §1) |
| 2 | Background Recording 범위 | **RECOMMENDED** — 백그라운드·잠금 녹음은 네이티브 RecorderAdapter로만 충족, Web은 foreground 전용 + 경고 (Web 녹음 허용 여부 OAQ-10) | — | NFR 안정성. iOS Safari/PWA 불가, Android PWA 미검증=불가 간주 (research §2) |
| 3 | Offline Recording Persistence | **RECOMMENDED** — 청크 로컬 영속 + SessionOutbox + UploadQueue(`MockUploadTransport`), 확정 전 로컬 삭제 금지 | **RECOMMENDED** — Supabase Storage resumable(TUS) 수신·part 검증·토큰 재발급 (RU) | NFR 오프라인. Web OPFS+IndexedDB / Native 샌드박스 (research §3) |
| 4 | STT Provider | **CONFIRMED** — Frontend 영향 없음, 분석 상태 Contract만 사용 (사용자 지시: STT Backend는 이 프로젝트 범위 밖) | **NEEDS DECISION** — Deepgram vs AssemblyAI 아동 샘플 파일럿 권장, Deepgram `mip_opt_out=true` (Backend Developer + 제품·법무, AP) | research §4 (신뢰도 Medium) |
| 5 | AI Provider | **CONFIRMED** — Frontend 영향 없음, 생성 문구는 응답 값만 표시 (사용자 지시: AI Backend는 범위 밖) | **NEEDS DECISION** — ZDR 계약 확보 Provider 권장, 아이 이름 미전송 (Backend Developer + 법무, AP) | research §5 |
| 6 | Push Provider | **RECOMMENDED** — 권한 요청·기기 등록·deep link 진입 UX (Stage 3 Web + Mock), 네이티브 Push Adapter는 Stage 4 (#7 CONFIRMED), 네이티브 수신 SDK 선택은 provider 결정 이후로 보류 | **NEEDS DECISION** — OneSignal 권장(대안 FCM/APNs 직접), payload PII 최소화 (Backend Developer, BH) | FR-08 (research §6) |
| 7 | PDF 생성 위치 | **RECOMMENDED** — 서버 제공 파일의 요청·상태 폴링·다운로드·공유 UX (Mock PDF) | **NEEDS DECISION** — 서버 `@react-pdf/renderer` + private 저장 + signed URL 권장 (Backend Developer, BH) | FR-17 (research §7, Medium) |
| 8 | Raw Audio 90일 삭제 | **CONFIRMED** — 90일 보관 정책(NFR) 안내·`expiresAt`/expired 표시 | **RECOMMENDED** — 일일 Cron + Storage API delete + audit, SQL로 `storage.objects` 직접 삭제 금지 (DR) | research §8 |
| 9 | Apple/Google Auth | **CONFIRMED** — Email·Apple·Google 요구(FR-01), `AuthGateway` + `MockAuthGateway`로 화면·흐름 구현 (Figma Apple 버튼 누락 M-16) | **RECOMMENDED** — 네이티브 `signInWithIdToken`(nonce) / Web OAuth PKCE, 토큰 검증 (AR) | research §9 |
| 10 | Trial → Account | **CONFIRMED (사용자 결정 2026-09-14, C-12)** — 기기 로컬 draft만, 가입·동의 후 제출, 익명 계정·다른 기기 이어하기 없음 | — (익명 계정 방식 미채택, C-12) | FR-24 (research §10) |
| 11 | Responsive Breakpoint | **CONFIRMED (사용자 결정 2026-09-14, #12)** — 모바일 레이아웃, `--bp-md` 600 / `--bp-lg` 1024, 앱 컬럼 최대 480px 가운데, 다단 없음, 세로 고정 | — | FR-25 vs §14.1 M3 (M-22), DESIGN_SYSTEM §11 |
| 12 | Deployment Topology | **CONFIRMED (사용자 결정 2026-09-14, C-18)** — Stage 8에 Mock 모드 웹 프리뷰 정적 배포만 (호스팅은 Stage 8 Plan), 앱 테스트 빌드 없음, Backend 배포는 범위 밖 | **NEEDS DECISION** — Render API + Worker(pg-boss) + Cron, Supabase 환경 분리 권장 (Backend Developer, BH) | research §11 (Medium) |

추가: **COPPA 개정 Rule 전면 준수·VPC 방식** — NEEDS DECISION (법무, L-01~L-07 — 결정 기록 §6), 출시 전 미국 변호사 검토 필수 (research §12, PRD §14.2). Handoff 문서(AR, DR)에 요구사항으로 기록.

## 16. Open Architecture Questions

| ID | 질문 | 라벨 | 차단 Stage |
|---|---|---|---|
| OAQ-01 | ~~Delivery Mode~~ | **Resolved** — Frontend-only CONFIRMED (2026-09-14) | — |
| OAQ-02 | Repository 위치·git 저장소 (§1.3) | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #4) | — |
| OAQ-03 | 패키지 구조: `validation` → `contracts` 병합, `shared-types` 미생성 (§1.2) | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #5) | — |
| OAQ-04 | Capacitor 도입 여부·시점 | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #7): 도입, Stage 4에서 추가 | — |
| OAQ-05 | Package manager | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #6): pnpm workspaces + Node LTS | — |
| OAQ-06 | Capability enum 코드 키와 사용자 노출 라벨 (API_CONTRACTS §2.1) | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #13 키 · #14 라벨) | — |
| OAQ-07 | 온보딩 설문 체계 | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, C-8 · C-9; D-04): PRD 5단계 유지, Step 5 = Baseline v1 10문항, 역량 점수 = 응답 평균. 잔여: 한 역량 문항 전부 결측 시 처리 | Stage 2 Plan (잔여) |
| OAQ-08 | VPC 방식, 제3자 제공 동의 분리, pilot 동의, 동의 철회 | **부분 Resolved** — pilot 동의 추가 (C-1), VPC 슬롯 + Mock (C-3), 동의 철회 MVP 제외 (C-4). 잔여 NEEDS DECISION (법무, L-01 VPC 방식 · L-02 pilot 필수/선택 · L-03 철회 미제공 적합성), 제3자 제공 분리 동의 필요 여부 (법무) | Stage 2 문구·필수 여부 (Frontend 구조 비차단) |
| OAQ-09 | 세션 30분 상한에 pause 시간 포함 여부 | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #17): 실제 녹음 시간 기준, 일시정지 제외 | — |
| OAQ-10 | Web 버전에서 녹음 허용(foreground 전용) 또는 대화 전용만 허용 | NEEDS DECISION | Stage 4 |
| OAQ-11 | 기기 로컬 미업로드 녹음 최대 보관 기간 | NEEDS DECISION | Stage 4 |
| OAQ-12 | 리포트 최소 녹음 세션 수, 주기 기준일, 저품질 세션 포함 여부 | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #17): 3회 + 3600초, 저품질 제외, 첫 세션 완료일부터 28일. 잔여: 대화 전용 세션 포함 여부·시간대 경계 | Stage 7 Plan (잔여) |
| OAQ-13 | 하이라이트 클립 보관 기간(원본 90일 규칙 적용 여부) | NEEDS DECISION (법무) | Stage 7 표시 / Handoff |
| OAQ-14 | 녹음 원본 앱 레벨 추가 암호화 필요 여부 | NEEDS DECISION (보안·법무) | Backend Handoff (비차단) |
| OAQ-15 | Activity Card 07:00 갱신 시간대 기준 | RECOMMENDED: caregiver timezone 필드 (Handoff) + Frontend는 기기 TZ 전송 | Stage 3 |
| OAQ-16 | 대화 전용 세션 화면(Figma 없음) 흐름 | NEEDS DECISION (design) — 디자인 방식은 C-13 절차로 Stage 4에서 화면별 결정 | Stage 4 |
| OAQ-17 | 분석 불가(녹음 삭제) 세션의 종결 표현 (§10.1 #8). 동의 철회 경우는 C-4로 제거 | NEEDS DECISION — 결정 전 `skipped_audio_deleted` enum 제외 (#16) | Stage 5 |
| OAQ-18 | Tailwind major version | **Resolved** — CONFIRMED (사용자 결정 2026-09-14, #29): v4 CSS-first `@theme` | — |
| OAQ-19 | 실제 Supabase Adapter(`AuthGateway`, Upload) 추가 시점 — Backend 연동 시 vs 별도 승인 | NEEDS DECISION (Stage 1–8에서는 미사용 CONFIRMED #27) | 비차단 |
| OAQ-20 | Http Adapter 골격 작성 시점 — 각 Stage에서 Mock과 함께 vs Stage 8 일괄 | RECOMMENDED: 각 Stage에서 골격 동시 작성 (Mock↔Http 교체 가능성 QA 대상) | Stage 1 Plan |
| OAQ-21 | Production 빌드에서 Mock Adapter 포함·비활성 방식 | NEEDS DECISION | Stage 1 Plan |

