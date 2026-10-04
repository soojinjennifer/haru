# Stage 1 Plan — Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure

Status: APPROVED (2026-09-18, user) — 승인 체크포인트 통과. §16 D-1~D-10 결과는 `docs/decisions/stage-1-approvals.md` §1 (D-1~D-10 전부 O 승인, §16.1 버전 표 포함). Stage 1-A 구현 후 추가 결정(S1A-1~S1A-4, 2026-09-19)도 같은 문서 §2 에 기록되어 있다.
Based on:
- PRD v1.4 — `docs/source/HARU_PRD_v1.5.md` (FR-25, §11 NFR 접근성·프라이버시·보안, §13 공통 상태)
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `8:2` Design Guide, page `16:2` MVP_KeyScreen_V.2 (node 목록은 §15)
- Scope — `CLAUDE.md` Development Scope, `docs/source/prompts/01-stage0-1-1-frontend-scope.md`
- 승인 문서 — `PLANNING.md` (APPROVED 2026-09-14, Rev 6) §5 Stage 1 · §9 · §10 · §11, `docs/decisions/stage-0-approvals.md` (§1 결정 · §3 D-01~D-04 · §4 P-01~P-16 · §6 L-01~L-07), `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_TOKEN_MAP.md`, `docs/COMPONENT_MAP.md`, `docs/FIGMA_SCREEN_MAP.md`, `docs/FRONTEND_IMPLEMENTATION_PLAN.md` §1.0–§1.7
- Rules — `.claude/rules/workflow.md` · `architecture.md` · `frontend.md` · `backend.md` · `qa.md`

라벨: `CONFIRMED` (PRD/Figma/사용자 결정으로 확정) · `RECOMMENDED` (근거 있는 권장안, 승인 필요) · `NEEDS DECISION` (사용자/법무/비즈니스 결정 필요)

> 이 Plan은 **Frontend Plan**이다. Backend는 구현 계획을 쓰지 않고 Integration Requirement와 Contract만 정의한다.
> 사용자의 "Stage 1을 시작해주세요" 요청은 **Plan/Design Spec 승인이 아니다** (rules/workflow.md §3, 결정 #24). 이 문서 + `docs/design/stage-1-design-spec.md` 가 나온 뒤 승인 체크포인트에서 사용자 승인을 받아야 development-agent가 시작한다.

---

## 1. Goal

이후 Stage 2–8의 모든 화면·기능이 그 위에 올라갈 **기반 레이어**를 만든다. Stage 1이 끝나면 다음이 성립해야 한다.

1. `pnpm install → typecheck → lint → test → build` 가 재현 가능하게 통과하는 pnpm workspaces monorepo (`apps/web`, `packages/config`, `packages/design-tokens`, `packages/ui`, `packages/contracts`).
2. Figma 값만을 기준으로 한 3-tier Design Token이 CSS Variables → Tailwind v4 `@theme` 로 노출되고, 화면·컴포넌트 코드에 임의 HEX / arbitrary value가 **한 건도** 없다.
3. Stage 2–8이 필요로 하는 Shared UI 22종(공통 상태 컴포넌트 포함)이 `packages/ui` 에 존재하고 dev 전용 UI gallery에서 variant·state를 눈으로 확인할 수 있다.
4. Router / Layout / Error Boundary / Route Guard 골격이 있고, 320 / 393 / 600 / 1024px 에서 앱 컬럼(최대 480px 가운데 정렬) 규칙이 적용된다.
5. `packages/contracts` 에 common · 전체 enum · rules(전이 표·리포트 발행 기준·녹음 상한)가 정의되고 단위 테스트로 보증된다.
6. `UI → Query/Mutation hook → API Client Interface → Mock | Http Adapter` 경로가 `health` 도메인에서 end-to-end로 동작하고, scenario 전환이 **결정적**이며, Adapter 선택 지점이 **한 곳**이다.
7. Backend 런타임 코드(`apps/api/`, `supabase/`)와 Stage 4 산출물(`apps/mobile`)이 **존재하지 않는다**.

**Non-Goal**: 실제 화면(Auth·동의·온보딩·Home 콘텐츠·세션·리포트)은 만들지 않는다. Stage 2 이후 기능의 선행 구현은 QA에서 `FAIL` Finding이다 (rules/qa.md §2).

---

## 2. In Scope

표기: **[FE]** Frontend 구현 · **[C·M]** contracts 정의 + Mock · **[기술 요구사항]** PRD에 직접 문장은 없으나 근거 요구사항 ID를 위해 필요한 항목.

### 2.1 요구사항 ID별

| ID | 근거 | Stage 1에서 하는 부분 | Stage 1에서 하지 않는 부분 |
|---|---|---|---|
| **FR-25** (웹 반응형, P1) | PRD FR-25, §1.6 / 결정 #12 | [FE] breakpoint 토큰 `--bp-md` 600 · `--bp-lg` 1024, 최소 폭 320, 앱 컬럼 최대 480px 가운데 정렬 컨테이너, 다단 레이아웃 없음, 세로 고정(웹 가로 = 앱 컬럼). Shared UI·Layout이 이 규칙을 따름 | 각 Stage 화면별 준수 확인(각 Stage), 전체 반응형 QA(Stage 8), Capacitor portrait lock(Stage 4) |
| **NFR 접근성** (WCAG AA, 터치 타깃, 텍스트 의존 최소화) | PRD §11 / 결정 #18-①·D-01, 가값 P-01·P-02·P-03·P-11 | [FE] Shared UI 기준 확립: focus 표시(P-03), 접근성 이름, 44×44 터치 타깃(`--size-touch-min`), 대비 토큰, `prefers-reduced-motion` 존중, 200% 텍스트 확대 reflow, 키보드 조작(제스처 전용 금지) | 화면 단위 감사(Stage 8), 스크린리더 실기기 검증(Stage 8) |
| **NFR 프라이버시 — 제3자 광고 목적 사용 금지** | PRD §11 | [FE] 광고·제3자 분석 SDK 미도입, 외부 CDN 폰트·아이콘 요청 없음(Inter self-host), 콘솔·에러 로그 PII 금지 규칙과 logger helper | 번들 최종 검사(Stage 8) |
| **NFR 보안 — TLS, Secret 미노출** | PRD §11 | [FE] Http Adapter는 `https:` 전용(비-HTTPS base URL 거부), `VITE_*` 는 공개 값만(API base URL, api mode), Secret grep 0 | 서버·저장소 암호화(Handoff) |
| **NFR 오프라인 (기반)** | PRD §11 | [FE] `offline` scenario로 network error → Offline Banner 표시 경로 확립 | 녹음 로컬 영속·UploadQueue(Stage 4), Activity Card 캐시(Stage 3) |
| **PRD §13 예외 처리 (공통 상태)** | PRD §13 / 결정 #22, 가값 P-10 | [FE] Loading · Empty · Error+Retry · Offline Banner · Toast · Dialog + 컴포넌트 focus·error·loading 상태를 design-agent 명세로 선구현 | 마이크 권한·업로드 실패·저품질·리포트 미충족 등 도메인별 예외 화면(해당 Stage) |
| **기술 요구사항 — Monorepo·Toolchain** | 결정 #4·#5·#6·#9·#28·#29, ARCHITECTURE §1 | [FE] pnpm workspaces, Node LTS 고정, TypeScript strict, Vite, React Router, TanStack Query, Tailwind v4 CSS-first `@theme`, Vitest, Playwright, import 경계 lint, dev 전용 UI gallery route | `apps/mobile`·Capacitor(Stage 4), Storybook(미도입), MSW(미사용 #8), Supabase JS Client(미사용 #27) |
| **기술 요구사항 — Design Token** | 결정 #10·#11·#12·#19·#20·#21, DESIGN_TOKEN_MAP | [FE] 3-tier primitive → semantic → component, 값은 Figma만 기준, 가값 토큰에 `provisional` 주석, font stack 1곳 정의 + Inter self-host, Light 전용, Lucide + HARU 전용 SVG 아이콘 | Figma Variable rename(디자이너), 가값 확정(Stage 1 QA 후 승인 절차 §17) |
| **기술 요구사항 — contracts 공통부** | API_CONTRACTS §1·§2·§3.1·§3.5·§4 Stage 1, 결정 #13·#16·#17, C-1·C-4·C-7·C-8 | [C·M] common(ErrorEnvelope, ErrorCode, Pagination, id, datetime), 전체 enum 23종, rules 3종 + 단위 테스트, `health` schema | onboarding·children·sessions 등 도메인 schema(해당 Stage), `rules/capability-score`(Stage 2) |
| **기술 요구사항 — API Client / Adapter 구조** | 사용자 지시(Frontend Architecture), rules/architecture §4, API_CONTRACTS §5 | [C·M] `shared/api` 공통 helper, `healthApi` interface + `MockHealthApi` + `HttpHealthApi` 골격, `app/providers` Adapter 선택 지점 1곳 | 도메인별 Mock(해당 Stage), `AuthGateway`·`recordingApi`·`UploadTransport` 구현(Stage 2·4) |
| **기술 요구사항 — Mock Infrastructure** | rules/frontend §5, API_CONTRACTS §5.3·§5.4 | [C·M] scenario store + 전환 스위치 + 결정적 clock/id 주입, health 5 scenario (`success`·`loading`·`error`·`retry`·`offline`), fixture 위치 규칙 | Stage 2–8 scenario key(해당 Stage) |

### 2.2 산출물 요약

- `packages/config`, `packages/design-tokens`, `packages/ui`, `packages/contracts`, `apps/web` — 상세 구조 §9
- `docs/plans/stage-1-plan.md` (이 문서), `docs/design/stage-1-design-spec.md` (design-agent), `docs/qa/stage-1-handoff.md` (development-agent), `docs/qa/stage-1-qa-report.md` (stage-qa-agent)

---

## 3. Out of Scope

### 3.1 다음 Stage로 넘기는 항목 (선행 구현 금지)

| 항목 | 이관 Stage | 근거 |
|---|---|---|
| Auth 화면·`AuthGateway`·`MockAuthGateway`·Route Guard **판정 로직** | 2 | PLANNING §5 Stage 2 |
| 동의 화면·VPC 슬롯·온보딩 위저드·프로필/페르소나·다이아몬드 차트 | 2 | C-1~C-3, C-8, C-9 |
| `/` Home skeleton (워드마크·설정 아이콘 `26:44`·빈 상태 안내), 설정 목록 | 2 | 결정 #33, C-16 — Stage 1의 `/` 는 임시 placeholder |
| BottomTabBar **마운트**(TabLayout 실사용), Activity Card, Library, Home 콘텐츠 | 3 | 결정 #33 — Stage 1은 컴포넌트만 만들고 gallery에서만 렌더 |
| `apps/mobile` Capacitor 셸·네이티브 Recorder/Auth/Push Adapter·portrait lock | 4 | 결정 #7 — **Stage 1에서 생성 금지** |
| RecordingController·LocalRecordingStore·UploadQueue·`recordingApi`·`UploadTransport` | 4 | ARCHITECTURE §10 |
| Reflection·분석 상태·리포트·PDF·데이터 관리·탈퇴 | 5·7·8 | PLANNING §5 |
| 도메인별 `Mock<Domain>Api` 구현체 (auth/children/onboarding/activities/library/sessions/recordings/analysis/reports/notifications/data-management) | 각 도메인 Stage | 빈 stub 파일도 만들지 않는다 — §16 D-8 |
| SwipeDeck · SelectTrigger · ListGroup/ListRow · TextArea · StarRating · StatTile · Carousel · Toggle · SectionHeader · InfoRow · DividerWithLabel · TextLink | 2·3·5·7 | FRONTEND_IMPLEMENTATION_PLAN §1.2 "S2 이후로 미룸" |
| 가값 P-01~P-16 **확정** | Stage 1 QA 후 승인 절차 | 결정 #10-④, §17 |
| Mock 모드 웹 프리뷰 정적 배포 | 8 | C-18 |

### 3.2 Backend 구현 항목 (이 프로젝트에서 구현하지 않음)

`apps/api/`, `supabase/migrations`, `supabase/seed`, RLS Policy, Storage Server Logic, Express route/controller/service/repository, STT/AI Backend, Analysis Worker, Background/Cron Job, Render Backend 배포, Production DB schema 적용 — 전부 **생성 금지** (CLAUDE.md Development Scope, rules/backend.md §1). Stage 1에는 Backend Handoff 요구사항 **[HO] 항목이 없다** (§10).

---

## 4. Dependencies

| 구분 | 항목 | 상태 |
|---|---|---|
| 선행 Stage | Stage 0 산출물 사용자 승인 (#1) | **완료** (2026-09-14) |
| 선행 결정 | #4 저장소 · #5 패키지 구조 · #6 pnpm+Node LTS · #7 Capacitor Stage 4 · #8 Mock 구조·MSW 미사용 · #9 Stack 외 라이브러리 · #10 토큰 3-tier · #11 폰트 · #12 반응형 · #13 Capability 키 · #14 라벨 · #15 내비게이션 · #16 Session 상태 모델 · #17 contracts 상수 · #18-① 대비 · #19 Capability 색 · #20 Dark mode 제외 · #21 아이콘 · #22 공통 상태 · #26 hook · #27 Supabase JS Client 미사용 · #28 Playwright · #29 Tailwind v4 · C-1 · C-4 · C-7 · C-8 · C-17 | **완료** |
| 디자인 | Figma 누락 화면 **없음** — Stage 1 대상은 공통 상태·컴포넌트 상태뿐이고 결정 #22로 **design-agent 명세 선구현이 이미 승인**되어 있다. C-13(화면별 디자이너 vs design-agent 선택) 질문 절차는 Stage 1에 **해당 없음** | 차단 아님 |
| 디자인 | 가값 P-01~P-16 — 디자이너 결정 대기. 결정 #10-④에 따라 **가값으로 Stage 1 진행** | 차단 아님 |
| 법무 | L-01~L-07 — 전부 Stage 2 이후 항목 | Stage 1 무관 |
| 미결정 사항 | §16의 D-1~D-10 — 이 Plan이 권장안을 제시하며 승인 체크포인트에서 O/X 판단 | 승인 필요 |
| 에셋 | 캐릭터·책 표지 사용 권리 (C-17) 확보됨. Stage 1에 필요한 에셋은 **HARU 전용 아이콘 SVG export**와 배경 gradient(CSS)뿐 | 차단 아님 |

**Blocking decisions (Stage 1 착수를 실제로 차단하는 항목): 없음.**
근거 — PLANNING §5 Stage 1 "Blocking decisions: 없음", FRONTEND_IMPLEMENTATION_PLAN §1.5 "디자인 차단 요인: 없음", `BACKEND_INTEGRATION_PENDING` 0건(health 포함 전부 Mock). §16의 항목은 "Stage 1 Plan에서 확정" 으로 위임된 세부 사항이며, 이 Plan이 권장안을 제시하므로 승인만 받으면 된다.

---

## 5. Frontend Architecture Impact

Stage 1은 ARCHITECTURE.md의 구조를 **처음 실체화**한다. 새로운 구조 결정은 §16 외에는 없다.

### 5.1 레이어 경계 (ARCHITECTURE §2.2, §4)

```
apps/web/src:  app → pages → features → entities → shared        (상위 → 하위만)
packages:      apps/web → {ui, design-tokens, contracts, config}
               packages/ui → design-tokens                        (contracts·도메인 import 금지)
               packages/contracts → zod 만
               packages/design-tokens → 의존 없음
금지:          packages/* → apps/*, features/A → features/B, 순환 의존
```

Stage 1에서 이 경계를 **자동 검증**한다 (§16 D-1). 위반 0건이 AC-1-07.

### 5.2 Adapter 선택 지점 — 1곳

`apps/web/src/app/providers/ApiClientProvider.tsx` 한 곳에서 `import.meta.env.VITE_API_MODE` 로 Mock/Http를 고른다. Component·Page·Feature·Query hook에서 분기 금지 (ARCHITECTURE §2.3). AC-1-12.

### 5.3 Layout 소유권 (문서 간 불일치 해소)

`FRONTEND_IMPLEMENTATION_PLAN §1.2` 는 Layouts를 `packages/ui` 우선순위 7로 두었고, `ARCHITECTURE §2.2` 는 `apps/web/src/app/layouts` 에 둔다. **해소안 (RECOMMENDED)**:

| 대상 | 위치 | 이유 |
|---|---|---|
| `AppColumn` (최소 320 / 최대 480 가운데 정렬 + safe-area + gutter) | `packages/ui` | 도메인·라우팅 지식 없음, 순수 레이아웃 primitive |
| `TabLayout` / `FullscreenLayout` / `StackLayout` | `apps/web/src/app/layouts` | router outlet·탭 항목·네비게이션을 알아야 함 (ARCHITECTURE §2.2 우선) |

### 5.4 Router / Route Guard 골격

- Stage 1 route: `/` (임시 placeholder — Stage 2에서 Home skeleton으로 교체), `*` NotFound, `/__dev/ui/*` UI gallery(**dev 전용, Production 빌드 제외**).
- `RouteGuard` 는 **shell만** 만든다: `<RouteGuard>` + 주입 가능한 `useGuardDecision()` (Stage 1 구현은 항상 `allow`). ARCHITECTURE §2.4의 판정 순서(미인증 → 동의 → VPC → 온보딩 → 프로필 결과 → Home)는 `GET /v1/me` 계약에 의존하므로 **Stage 2에서 구현**한다. Stage 1에서 순서 로직을 미리 구현하면 Out of Scope 선행 구현이다.
- Error Boundary: route-level + app-level 2단, `ErrorState` 컴포넌트 사용, 에러 로깅은 PII 금지 logger 경유.

### 5.5 Design Token 파이프라인 (DESIGN_TOKEN_MAP §1.1)

```
Figma 값 (유일 기준)
→ packages/design-tokens/src/*.css   (Tier1 primitive · Tier2 semantic, :root)
→ @theme { … }                        (Tailwind v4, semantic만 노출 + 기본 네임스페이스 초기화)
→ packages/ui 컴포넌트 (Tier3 component 토큰은 ui 내부 전용)
→ apps/web 화면
```

- 로컬 `_ds` CSS(`fig-tokens.css`, `haru-material.css` 등) 참조 금지 (#10).
- z-index · motion · material blur · layout · safe-area는 `@theme` 네임스페이스가 없으므로 CSS Var 직접 참조 또는 Tailwind v4 `@utility` 로 노출 — **`@utility` 로 노출 (RECOMMENDED)**: 화면 코드에 `style={{ zIndex: 'var(--z-dialog)' }}` 같은 inline 수치·변수 직접 사용을 막고 lint 대상(arbitrary value 금지)과 일관되게 한다.
- 폰트: `--font-sans` = `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` 를 `packages/design-tokens` **한 곳에서만** 정의. `system-ui` 를 Inter 앞에 두지 않는다. `SF-Pro.ttf` 는 저장소·빌드에 포함하지 않는다 (#11).

### 5.6 Privacy (Architecture Requirement, ARCHITECTURE §13 — Stage 1 해당분)

| 통제 | Stage 1 Frontend 책임 |
|---|---|
| 광고·제3자 분석 SDK 금지 | 의존성 추가 금지, `package.json` 검사 |
| 외부 요청 최소화 | 폰트·아이콘 CDN 요청 0 (Inter self-host, Lucide npm) |
| 로그 PII 금지 | `shared/lib/logger.ts` — dev 전용 출력, 허용 필드 화이트리스트, 아이 이름·transcript·오디오 경로 금지 규칙을 코드 주석과 QA grep 대상으로 고정 |
| Secret 미노출 | `.env.example` 에 `VITE_API_BASE_URL`, `VITE_API_MODE`, `VITE_MOCK_SCENARIO` 만. Service Role Key / AI Key / STT Secret 금지 |
| 아동 데이터 | Stage 1에는 아동 데이터 경로 자체가 없다. fixture도 health뿐 |

---

## 6. Data Requirement Delta (Backend Handoff용)

**Stage 1의 Data Requirement Delta: 없음.**

- 새로 생기는 테이블·필드·소유권·보관 요구가 없다. `docs/DATA_MODEL.md` 변경 없음.
- `health` endpoint는 데이터 저장을 요구하지 않는다.
- Stage 1이 확정하는 enum·상수(`SessionStatus`, `SESSION_TRANSITIONS`, `MIN_REPORT_RECORDED_SESSIONS=3`, `MIN_REPORT_RECORDED_SECONDS=3600`, `REPORT_CYCLE_DAYS=28`, `MAX_RECORDED_SECONDS=1800`, `READY_ABANDON_SECONDS=600`)는 **이미 Stage 0에서 승인된 값**(#16, #17)이며, 이 Plan은 그 값을 코드로 옮길 뿐 새 요구를 추가하지 않는다. 향후 Backend는 동일 상수를 `packages/contracts` 에서 import 해야 한다 (Handoff 요구사항으로 Stage 8 `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` 에 기록).

---

## 7. API Contract Delta

### 7.1 `packages/contracts` Stage 1 범위 ↔ `docs/API_CONTRACTS.md` 1:1 대응

| contracts 경로 | 내용 | API_CONTRACTS 근거 | 결정 |
|---|---|---|---|
| `src/common/id.ts` | `IdSchema` (uuid 문자열) | §1 Conventions "ID" | RECOMMENDED |
| `src/common/datetime.ts` | `IsoDateTimeSchema` (ISO 8601 UTC), `occurredAt` 규약 | §1 Conventions "시간" | RECOMMENDED |
| `src/common/pagination.ts` | `CursorPageRequestSchema` (`limit` 1–50 기본 20, `cursor`), `paginated(T)` → `{ items, nextCursor }` | §1 Conventions "Pagination" | RECOMMENDED |
| `src/common/error-codes.ts` | `ErrorCodeSchema` — **28개 코드** (§1.2 표 전체. `TRIAL_ACCOUNT_RESTRICTED` 제외 — C-12) + 코드 → HTTP status 매핑 상수 | §1.2 Error Code Catalogue | RECOMMENDED |
| `src/common/error-envelope.ts` | `ErrorEnvelopeSchema` = `{ error: { code, message, requestId?, details? } }`, `isErrorEnvelope`, `HaruApiError` 클래스 | §1.1 Error Envelope | RECOMMENDED |
| `src/enums/capability.ts` | `CapabilitySchema` = `emotion_regulation` · `self_directed_agency` · `cognitive_flexibility` · `intrinsic_motivation` | §2.1 | **CONFIRMED (#13)** — 표시 라벨은 contracts가 아니라 `apps/web/src/shared/copy` (#14) |
| `src/enums/*.ts` | §2.2 표의 **22개 enum 전부**: `SessionStatus`(8), `SessionMode`, `CompletedReason`, `AnalysisOutcome`, `UploadStatus`, `ReadingContext`, `ConsentType`(5, C-1), `ConsentAction`(`granted` 만, C-4), `Gender`(C-7, 필드 nullable), `SurveyAnswerValue`(1–5 \| `not_observed`, C-8), `ParentVerificationStatus`, `AnalysisJobStatus`, `ReportEligibility`, `ReportStatus`, `ActivityOptionKind`, `BookOwnership`, `GiftRequestStatus`, `CaregiverRelationship`, `OnboardingStep`, `DeletionScope`, `DeletionRequestStatus`, `NotificationKind` | §2.2 | `SessionStatus`·`SessionMode`·`CompletedReason`·`AnalysisOutcome`·`UploadStatus` = **CONFIRMED (#16)** / `ConsentType`·`ConsentAction` = **CONFIRMED (C-1, C-4)** / `Gender` = **CONFIRMED (C-7)** / `SurveyAnswerValue` 척도 = **CONFIRMED (C-8)**, 인코딩 RECOMMENDED / 나머지 RECOMMENDED |
| `src/rules/session-transitions.ts` | `SESSION_TRANSITIONS` **12행** (from/to/actor/modes), `canTransition(from,to,actor,mode)` | §3.1 | **CONFIRMED (#16)** |
| `src/rules/recording-limits.ts` | `MAX_RECORDED_SECONDS = 1800` (실제 녹음 시간 기준, 일시정지 제외), `READY_ABANDON_SECONDS = 600` | §3.1 코드블록 말미 / PLANNING §5 Stage 1 "rules/recording-limits" | **CONFIRMED (#17-②)** — 배치 위치는 §18 보고 항목 ① |
| `src/rules/report-eligibility.ts` | `MIN_REPORT_RECORDED_SESSIONS = 3`, `MIN_REPORT_RECORDED_SECONDS = 3600`, `REPORT_CYCLE_DAYS = 28`, `isReportEligible({recordedSeconds, recordedSessions})` → `ReportEligibility` | §3.5 | **CONFIRMED (#17)** |
| `src/health/health.ts` | `HealthResponseSchema` = `{ status: 'ok', version: string, serverTime: IsoDateTime }` | §4 Stage 1 `GET /v1/health` → `Health` | RECOMMENDED (필드 구성) |
| `src/index.ts` | 도메인별 re-export (deep import 금지) | ARCHITECTURE §1.2 | CONFIRMED |

**Stage 1에서 하지 않는 contracts 작업**: `rules/capability-score`, `§3.2 CreateSession*`, `§3.3 RecordingUpload*`, `§3.4 Consent/ChildInfo/Onboarding` — 전부 Stage 2 이후 (API_CONTRACTS §4 Stage 1 명시).

### 7.2 Endpoint Delta

| Method | Path | Request | Response | Error | 인증 | PRD |
|---|---|---|---|---|---|---|
| GET | `/v1/health` | — | `Health` | `INTERNAL_ERROR`, `RATE_LIMITED` | **공개** (API_CONTRACTS §1 Auth) | 기술 요구사항 |

- 부작용 없음, Idempotency-Key 불필요, 동의 가드 불필요.
- Http Adapter는 이 계약에 맞춘 골격(`HttpHealthApi`)만 둔다. 실제 Backend 연동 검증은 전 Stage `BACKEND_INTEGRATION_PENDING` 이지만, **Stage 1에는 QA가 판정해야 할 PENDING 항목이 없다** — health는 Mock으로 전부 검증 가능하다 (§10, §11 AC-1-30 참조).

### 7.3 contracts 사용 규약 (Stage 1에 고정)

- 타입은 `z.infer` 로만 파생. 같은 모양의 타입을 `apps/web` 에 재선언하지 않는다 (QA grep 대상).
- 응답 schema는 Zod 기본 `strip` (필드 추가 = non-breaking, §1 "버전").
- Mock/Http **양쪽** Adapter가 요청·응답을 parse. parse 실패는 `VALIDATION_FAILED` Error Envelope으로 변환.
- `zod` 외 런타임 의존 없음. `packages/contracts` 는 브라우저·Node 양쪽에서 동작해야 한다(향후 Backend 재사용).

---

## 8. Mock Scenarios

### 8.1 Stage 1 대상 (API_CONTRACTS §5.3 `health` 행 / §5.4 Catalogue)

| Machine key | rules 표시명 | Mock 동작 | 검증 대상 |
|---|---|---|---|
| `success` | SUCCESS | `HealthResponse` 성공 fixture | 정상 렌더 |
| `loading` | LOADING | 성공 응답을 주입된 timer로 지연 | Spinner / Skeleton, 버튼 loading 상태 |
| `error` | ERROR | Error Envelope (`INTERNAL_ERROR`, code 지정 가능) | ErrorState + Retry |
| `retry` | RETRY | 1회차 `error` → 2회차 `success` | 재시도 UX, 입력 보존 경로 |
| `offline` | — | Adapter가 network error throw | Offline Banner (InlineAlert tone=offline) |

`empty` 는 health에 해당 항목이 없어 **적용하지 않는다** (API_CONTRACTS §5.3 health 행과 일치). `empty` 컴포넌트(EmptyState)는 UI gallery의 공통 상태 데모로 검증한다.

### 8.2 공통 상태 컴포넌트 데모 (FRONTEND_IMPLEMENTATION_PLAN §1.4)

UI gallery의 "States" 섹션에서 `loading`(Skeleton) · `empty` · `error` → `retry` · `offline`(Banner) 를 **실제 화면 컨텍스트**(AppColumn + TopBar + 콘텐츠 영역)에서 결정적으로 재현한다.

### 8.3 Scenario 전환 방식 (§16 D-5 권장안)

- 조합 표기: `?scenario=health:loading` (그룹 지정) / `?scenario=loading` (전 그룹 적용) / 쉼표 구분 다중 지정 `?scenario=health:error,__states:empty`.
- 우선순위: **URL query > dev Scenario Panel(session) > `VITE_MOCK_SCENARIO` 빌드 기본값 > `success`**.
- 결정성: Mock은 `Date.now()` / `Math.random()` 을 직접 호출하지 않고 주입된 `clock`·`idFactory`(scenario key 시드 기반)를 쓴다. 지연도 주입 timer → 테스트에서 0ms. **같은 scenario = 항상 같은 응답 바이트** (AC-1-11).
- Catalogue 준수: scenario key는 API_CONTRACTS §5.4 machine key만 사용. deprecated alias(`default`, `slow` 등) 사용 금지 — lint/테스트로 검사.

### 8.4 Stage 1에서 만들지 않는 scenario

`consent-missing`, `invalid-transition`, `recording-upload-*`, `analysis-*`, `report-*` 등 Stage 2–8 key는 **정의도 fixture도 만들지 않는다**. Scenario key 타입은 catalogue 전체를 union으로 미리 선언하지 않고, 도메인 Mock이 추가될 때 확장 가능한 형태(`type ScenarioKey = string & {}` 아님 — 그룹별 리터럴 union을 도메인 모듈이 기여하는 구조)로 둔다.

---

## 9. Frontend Scope — Deliverables (패키지별 파일·디렉토리 구조)

> 상세 UI(variant·state·치수·토큰 매핑)는 design-agent `docs/design/stage-1-design-spec.md` 가 확정한다. 아래는 **존재해야 할 것의 목록**이다.

### 9.0 Repository 루트

```
~/dev/haru/
├── pnpm-workspace.yaml          apps/*, packages/*
├── package.json                 packageManager: "pnpm@<D-10>", engines.node, root scripts
├── pnpm-lock.yaml               커밋 (재현성)
├── .nvmrc                       Node LTS 버전 (D-10)
├── .npmrc                       engine-strict=true, 기타 설정
├── tsconfig.base.json           packages/config 참조
├── eslint.config.js             flat config (packages/config 확장)
├── prettier.config.js
├── .dependency-cruiser.cjs      경계 규칙 (D-1)
├── playwright.config.ts
├── vitest.workspace.ts          (또는 각 패키지 vitest.config)
├── .env.example                 VITE_API_BASE_URL · VITE_API_MODE · VITE_MOCK_SCENARIO 만
├── .gitignore                   node_modules, dist, playwright-report, test-results, .env*
├── apps/  packages/  docs/  .claude/
└── (apps/api, supabase 는 생성하지 않는다 — hook + QA 검증)
```

root scripts (rules/qa.md §4가 참조하는 이름으로 고정):
`typecheck` · `lint` · `lint:boundaries` · `test` · `test:e2e` · `build` · `dev` · `format` · `assert:no-mocks`

> `install` 은 root script로 정의하지 않는다. npm/pnpm에서 `install` 은 **설치 라이프사이클 훅**이므로 같은 이름의 script를 두면 설치 시 재귀 호출이 된다. `pnpm install --frozen-lockfile` 은 pnpm **내장 명령**으로 script 정의 없이 정상 동작하므로, rules/qa.md §4 가 참조하는 명령 자체는 그대로 유효하다. (결정 S1A-3, 2026-09-19 — `docs/decisions/stage-1-approvals.md` §2)

### 9.1 `packages/config`

```
packages/config/
├── package.json                 name @haru/config, private
├── tsconfig/base.json           strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, target/lib
├── tsconfig/react.json          jsx: react-jsx
├── tsconfig/node.json
├── eslint/base.js               flat config: typescript-eslint, import 규칙, no-restricted-syntax
├── eslint/react.js              react-hooks, jsx-a11y(선택 — D-1 참조)
├── prettier/index.js
└── vitest/base.ts               공통 vitest 설정 (환경·coverage 임계)
```

lint 규칙 중 Stage 1에 반드시 포함:
- `no-restricted-syntax` — 화면·컴포넌트 코드의 임의 HEX / `rgb()` / `rgba()` 리터럴 금지
- Tailwind arbitrary value 금지 (`bg-[#…]`, `p-[13px]`, `rounded-[28px]`) — 문자열 패턴 규칙
- `@typescript-eslint/no-explicit-any`, `ban-ts-comment` (신규 `any` / `@ts-ignore` 0)
- `packages/design-tokens` 내부와 일러스트/에셋 파일은 예외 (rules/frontend §6)

### 9.2 `packages/design-tokens`

```
packages/design-tokens/
├── package.json                 name @haru/design-tokens (CSS 전용 export)
└── src/
    ├── index.css                아래 파일 import + @theme 선언 + 기본 네임스페이스 초기화
    ├── primitive/
    │   ├── color.css            palette 12 (violet 미사용 #19), ink/mist/dusk/paper, white alpha 3단계, ink alpha 3단계
    │   └── typography.css       iOS text style 11종(최소 11px) + weight 5종(400/510/590/700/860)
    ├── semantic/
    │   ├── color.css            fg/bg/surface/border/action/status/focus/scrim/capability  ← TOKEN_MAP §2.6·§2.7
    │   ├── typography.css       --font-sans (#11, 단일 정의 지점), --text-* 스케일
    │   ├── space.css            spacing scale, --layout-gutter(P-13), --size-touch-min 44
    │   ├── radius.css           6단계 (--radius-surface = P-12)
    │   ├── shadow.css           glass-rest/raised/pressed, rest, icon-chip
    │   ├── material.css         glass fill/blur/fallback (§5.4)
    │   ├── motion.css           duration 5종 · easing 3종 (P-07) + prefers-reduced-motion 처리
    │   ├── layout.css           --layout-min-width 320, --layout-app-max-width 480, --bp-md 600, --bp-lg 1024, safe-area(P-08), tabbar height
    │   └── z-index.css          base/sticky/tabbar/sheet/dialog/toast (P-06)
    ├── theme.css                @theme { --color-* --font-* --text-* --radius-* --shadow-* --breakpoint-* --spacing }
    ├── utilities.css            @utility (z-index, motion, material, layout, safe-area 노출)
    ├── fonts.css                Inter self-host @font-face (D-3) — 유일한 @font-face 선언 위치
    └── color-scheme.css         color-scheme: light (Dark mode 없음 #20)
```

- 가값 토큰 정의 **바로 위**에 `/* provisional: P-xx (docs/decisions/stage-0-approvals.md §4) */` 주석. 대상: P-01, P-02, P-03, P-04, P-05, P-06, P-07, P-08, P-09, P-11, P-12, P-13, P-14, P-15, P-16 (P-10은 토큰이 아니라 화면 디자인 — 주석 대상 아님). AC-1-16.
- Capability 색 (#19): `--color-capability-{emotion,agency,flexibility,motivation}-bg` = Tag 색 `#efc3d4` / `#90bfad` / `#a0ccdd` / `#c9b8d4`, `-chart` 동일, `-fg` = P-02.
- `--color-action-primary-bg` = teal `#85bfb6` + 흰 라벨 유지 (D-01). 토큰 옆에 `/* accepted deviation: D-01 */` 주석 (AC-1-17).

### 9.3 `packages/ui` — Shared UI 22종

빌드 순서는 FRONTEND_IMPLEMENTATION_PLAN §1.2 우선순위를 따른다.

```
packages/ui/
├── package.json                 name @haru/ui, dependency: @haru/design-tokens, lucide-react(정확 버전 — D-2)
└── src/
    ├── text/Text.tsx                        (1) variant·tone·weight·as·truncate
    ├── icon/Icon.tsx  icon/haru/*.svg       (2) Lucide name | HARU 전용 name, size(P-09), label/decorative
    ├── surface/Surface.tsx  AppBackground.tsx  (3) material rest/raised/pressed, fill glass/strong, fallback
    ├── button/Button.tsx  ButtonGroup.tsx   (4) variant glass|accent × size md|lg × rest/hover/pressed/disabled/focus/loading
    ├── button/IconButton.tsx                (5) 시각 38px + hit area 44
    ├── top-bar/TopBar.tsx                   (6) large|inline|centered|pill
    ├── layout/AppColumn.tsx                 (7) 320–480 컨테이너 + safe-area + gutter  ※ TabLayout 등은 apps/web (§5.3)
    ├── tab-bar/BottomTabBar.tsx             (8) items config 주입, center 강조 (#15 D-02)
    ├── feedback/Spinner.tsx  Skeleton.tsx   (9)
    ├── feedback/ErrorState.tsx  EmptyState.tsx (10)
    ├── feedback/InlineAlert.tsx             (11) tone info|success|warning|error|offline
    ├── feedback/Toast.tsx  ToastProvider.tsx (12) aria-live, z-toast
    ├── field/TextField.tsx  FieldGroup.tsx  (13) label·trailingAction·trailingAccessory·helper·error·disabled
    ├── field/Checkbox.tsx  CheckboxGroup.tsx (14) checked/unchecked/error/focus
    ├── tag/Tag.tsx                          (15) tone 4 + size sm|xs
    ├── chip/Chip.tsx                        (16) selected, filled|outline|glass
    ├── field/RadioGroup.tsx                 (17) variant=card
    ├── progress/ProgressBar.tsx             (18) value·max·tone·size·label
    ├── progress/PageIndicator.tsx           (19)
    ├── bubble/SpeechBubble.tsx              (20) tail top|bottom-right (시각만)
    ├── sheet/Sheet.tsx  Scrim.tsx           (21)
    ├── dialog/Dialog.tsx  ConfirmDialog.tsx (22)
    ├── hooks/  (useReducedMotion, useFocusTrap, useId 래퍼 등)
    └── index.ts
```

- `packages/ui` 는 `@haru/contracts` 를 import 하지 않는다 (도메인 지식 없음). BottomTabBar 항목은 `items` prop으로 주입한다.
- 모든 인터랙티브 컴포넌트에 focus-visible 표시(P-03), 접근성 이름, 키보드 조작, 44×44 터치 타깃을 적용한다.
- 공통 상태 컴포넌트(9–12, 22)와 focus/error/loading 상태 = design-agent 명세 기준 (#22, P-10).

### 9.4 `packages/contracts`

```
packages/contracts/
├── package.json                 name @haru/contracts, dependency: zod 만
└── src/
    ├── common/      id.ts  datetime.ts  pagination.ts  error-codes.ts  error-envelope.ts
    ├── enums/       capability.ts  session-status.ts  session-mode.ts  completed-reason.ts
    │                analysis-outcome.ts  upload-status.ts  reading-context.ts  consent.ts
    │                gender.ts  survey.ts  parent-verification.ts  analysis-job.ts
    │                report.ts  activity.ts  book.ts  gift-request.ts  caregiver.ts
    │                onboarding-step.ts  deletion.ts  notification.ts
    ├── rules/       session-transitions.ts  recording-limits.ts  report-eligibility.ts
    ├── health/      health.ts
    ├── __tests__/   enums.test.ts  session-transitions.test.ts  report-eligibility.test.ts
    │                recording-limits.test.ts  error-envelope.test.ts  pagination.test.ts
    └── index.ts
```

### 9.5 `apps/web`

```
apps/web/
├── index.html                   Inter woff2 preload, lang="en", viewport-fit=cover
├── vite.config.ts               @vitejs/plugin-react, @tailwindcss/vite, alias, define
├── package.json
└── src/
    ├── main.tsx
    ├── app/
    │   ├── router.tsx           / (placeholder) · * NotFound · /__dev/ui/* (dev only, 동적 import)
    │   ├── providers/
    │   │   ├── ApiClientProvider.tsx     ★ Adapter 선택 지점 1곳 (VITE_API_MODE)
    │   │   ├── QueryProvider.tsx         TanStack Query client
    │   │   └── AppProviders.tsx
    │   ├── layouts/             TabLayout.tsx  FullscreenLayout.tsx  StackLayout.tsx
    │   ├── guards/              RouteGuard.tsx (shell만 — §5.4)
    │   └── error/               AppErrorBoundary.tsx  RouteErrorBoundary.tsx
    ├── pages/
    │   ├── placeholder/PlaceholderPage.tsx   (Stage 2에서 Home skeleton으로 교체)
    │   └── not-found/NotFoundPage.tsx
    ├── entities/
    │   └── health/              healthKeys.ts  useHealth.ts
    ├── features/                (Stage 1 비어 있음 — 디렉토리와 README만)
    ├── shared/
    │   ├── api/
    │   │   ├── types.ts                  ApiClients interface 집합
    │   │   ├── health-api.ts             interface HealthApi
    │   │   ├── helpers/                  parseResponse.ts  toErrorEnvelope.ts  withDelay.ts  requestId.ts
    │   │   └── http/                     httpClient.ts (https 전용·X-Request-Id·Authorization 훅)  HttpHealthApi.ts
    │   ├── lib/                          logger.ts (PII 금지)  clock.ts  idFactory.ts  env.ts
    │   ├── hooks/  config/  assets/
    │   └── copy/                         copy 모듈 구조 + errorCode → 사용자 문구 매핑 (영어)
    ├── mocks/                   ※ Production(http) 빌드에서 완전히 제외 (D-6)
    │   ├── index.ts             __HARU_MOCK_SENTINEL__ export (빌드 검증용)
    │   ├── health/MockHealthApi.ts
    │   ├── fixtures/health.ts
    │   └── scenarios/           scenario-store.ts  scenario-url.ts  types.ts
    ├── dev/                     ※ dev 전용, 동적 import
    │   ├── ui-gallery/          토큰 swatch · Shared UI 22종 · 공통 상태 데모 · 반응형 프리뷰
    │   └── scenario-panel/      ScenarioPanel.tsx
    └── styles/                  index.css (@import @haru/design-tokens)
```

### 9.6 명시적 비생성

- `apps/mobile` — **생성하지 않는다** (#7, Stage 4).
- `apps/api`, `supabase/` — **생성하지 않는다** (hook + QA 파일 목록 증거).
- `packages/validation`, `packages/shared-types` — **생성하지 않는다** (#5).
- Storybook 설정 — 도입하지 않는다 (#9, dev UI gallery로 대체).
- MSW, Supabase JS Client — 설치하지 않는다 (#8, #27).

---

## 10. Backend Integration Requirements

| 항목 | 내용 |
|---|---|
| Contract로 표현되는 기대 동작 | `GET /v1/health` 는 인증 없이 `{ status:'ok', version, serverTime }` 를 반환한다. 오류는 §1.1 Error Envelope + §1.2 코드. 향후 Backend는 `packages/contracts` 의 `HealthResponseSchema` 를 그대로 구현한다 |
| 향후 Backend가 재사용해야 할 Stage 1 산출물 | `packages/contracts` 의 enum 23종 · Error Code 28종 · Error Envelope · Pagination 규약 · `SESSION_TRANSITIONS` 12행 · `MAX_RECORDED_SECONDS` / `READY_ABANDON_SECONDS` / `MIN_REPORT_RECORDED_*` / `REPORT_CYCLE_DAYS`. Backend 모듈에서 별도 schema/type 재선언 금지 (rules/backend.md §4) |
| `BACKEND_INTEGRATION_PENDING` 예상 항목 | **없음 (0건)**. Stage 1의 모든 In Scope 항목은 Mock·정적 검사·Playwright로 검증 가능하다. `HttpHealthApi` 골격의 실제 서버 연동은 Stage 1 AC에 포함하지 않으므로 PENDING 판정 대상이 아니다 (AC-1-30에서 "골격 존재 + Mock↔Http 교체 시 UI/Query 코드 변경 0" 만 검증) |
| Stage 8 Handoff 문서 대상 | `BACKEND_HANDOFF.md`(health endpoint, contracts 재사용 요구), `ERROR_CODES.md`(28 코드 최종화) — Stage 8에서 반영. Stage 1은 새 Handoff 요구를 추가하지 않는다 |

---

## 11. Acceptance Criteria

판정 규칙: rules/qa.md §1. PASS는 QA가 직접 실행한 증거 필요. 각 AC의 "PENDING 예상" 은 전부 **No**(Stage 1에는 PENDING 항목 없음).

### 11.1 빌드 · 툴체인

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-01** | `pnpm install --frozen-lockfile` 이 커밋된 `pnpm-lock.yaml` 로 성공한다 | 명령 실행 로그 | #6, rules/qa §4 |
| **AC-1-02** | `pnpm typecheck` 가 전 패키지에서 통과하고, 신규 `any` / `@ts-ignore` / `@ts-expect-error`(사유 주석 없는 것)가 0건이다 | 명령 로그 + grep | rules/qa 체크리스트 |
| **AC-1-03** | `pnpm lint` 가 오류 0으로 통과한다 (warning 허용 기준은 QA 리포트에 기록) | 명령 로그 | rules/qa §4 |
| **AC-1-04** | `pnpm test` (Vitest) 가 통과하고 contracts·Mock·상태 컴포넌트 테스트가 포함되어 있다 | 명령 로그 + 테스트 목록 | rules/frontend §10 |
| **AC-1-05** | `pnpm build` 가 `apps/web` 프로덕션 빌드를 성공시킨다 (`VITE_API_MODE=http` 와 `=mock` 두 모드 모두) | 명령 로그 ×2 | D-6 |
| **AC-1-06** | Node 버전이 `.nvmrc` · `engines` 로 고정되고 `packageManager` 필드로 pnpm 버전이 고정되어 있으며, 승인된 버전 정책(§16 D-10)과 일치한다 | 파일 내용 + `node -v` / `pnpm -v` | #6 |

### 11.2 Scope 준수

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-07** | `apps/api/`, `supabase/`, `apps/mobile/` 이 저장소에 **존재하지 않는다** | `git ls-files` / `ls` 출력 | CLAUDE.md, #7 |
| **AC-1-08** | Out of Scope 기능(Auth·동의·온보딩·Home 콘텐츠·Activity Card·세션·녹음·리포트 화면, 도메인 Mock Api)이 구현되지 않았다 | 디렉토리·라우트 목록 | §3.1 |
| **AC-1-09** | import 경계 위반 0건 — `packages/* → apps/*`, `ui → contracts`, `features/A → features/B`, 레이어 역방향(`shared → features` 등), 순환 의존 | `pnpm lint:boundaries` 로그 (D-1 도구) | ARCHITECTURE §4, rules/architecture §2·§3 |

### 11.3 Design Token · Figma 정합

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-10** | `packages/design-tokens` 외부 코드에 임의 HEX / `rgb()` / `rgba()` / Tailwind arbitrary value / inline 수치 스타일이 **0건**이다 (예외: design-tokens 내부, 일러스트·아이콘 SVG 에셋) | grep 증거 + lint 규칙 통과 | rules/frontend §6, rules/qa 체크리스트 |
| **AC-1-11** | 토큰이 3-tier(primitive → semantic → component)로 정의되고 참조 방향이 지켜지며, Tailwind v4 `@theme` 에는 **semantic만** 노출되고 기본 팔레트 네임스페이스가 초기화되어 있다 | 파일 검사 + `@theme` 블록 | #10, #29, TOKEN_MAP §1.1 |
| **AC-1-12** | 가값 토큰 정의에 `provisional` 주석이 있고, 그 목록이 `docs/decisions/stage-0-approvals.md` §4 의 **P-01~P-09, P-11~P-16** 와 1:1로 일치한다 (P-10은 토큰 아님 — 디자인 명세) | grep `provisional` 결과 ↔ §4 표 대조 | #10-④, §4 운영 규칙 1 |
| **AC-1-13** | `--font-sans` 가 `packages/design-tokens` **한 곳에서만** 정의되고, stack에서 `system-ui` 가 `"Inter"` 앞에 오지 않으며, 저장소·빌드 산출물에 SF Pro 폰트 파일이 **없다** | grep(`--font-sans`, `system-ui`, `SF-Pro`, `.ttf`/`.otf` 목록) | #11 |
| **AC-1-14** | Inter가 self-host 되고 런타임에 외부 폰트 CDN 요청이 **0건**이다 | 빌드 산출물 내 woff2 존재 + Playwright network log(외부 도메인 요청 0) | #11, NFR 프라이버시 |
| **AC-1-15** | Capability 색이 결정 #19 값과 일치한다 (`emotion_regulation` `#efc3d4` · `self_directed_agency` `#90bfad` · `cognitive_flexibility` `#a0ccdd` · `intrinsic_motivation` `#c9b8d4`), 배지와 차트가 같은 토큰을 참조한다 | 토큰 파일 + gallery 스크린샷 | #19 |
| **AC-1-16** | Dark mode 토큰이 없고 `color-scheme: light` 가 선언되어 있다 | grep | #20 |
| **AC-1-17** | 주요 버튼(Accent) 대비 2.07:1 이 유지되고, 토큰에 D-01 수용 예외 주석이 있다. QA는 이 항목을 요구사항 `FAIL` 로 기록하되 Stage Verdict에서는 `PASS (accepted: D-01)` 로 처리한다 | 대비 계산 + 주석 + QA 리포트 기록 형식 | #18-①, D-01, rules/qa §2 |

### 11.4 Shared UI · 공통 상태 · 접근성

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-18** | Shared UI 22종이 `packages/ui` 에 존재하고, Design Spec이 정의한 variant·state를 모두 제공한다 (Button 8 state 포함) | 컴포넌트 목록 + gallery 렌더 + 단위 테스트 | FRONTEND_IMPLEMENTATION_PLAN §1.2 |
| **AC-1-19** | 공통 상태 6종(Loading/Skeleton · Empty · Error+Retry · Offline Banner · Toast · Dialog)이 구현되고 dev UI gallery에서 실제 화면 컨텍스트로 확인된다 | gallery 스크린샷 | #22, P-10 |
| **AC-1-20** | 모든 인터랙티브 Shared UI가 키보드로 조작 가능하고 focus 표시가 보이며 접근성 이름이 있다. 제스처 전용 조작이 없다 | 키보드 탐색 스크립트 + axe 또는 수동 점검 | PRD §11, WCAG 2.5.1 |
| **AC-1-21** | 터치 타깃이 최소 44×44 (시각 38px IconButton도 hit area 44 확보) | 컴포넌트 CSS + Playwright bounding box 측정 | rules/frontend §9 |
| **AC-1-22** | `prefers-reduced-motion: reduce` 에서 모션이 비활성화/축소되고, 텍스트 200% 확대에서 320px 폭 reflow가 깨지지 않는다 | Playwright emulate + 스크린샷 | PRD §11, FRONTEND_IMPLEMENTATION_PLAN §1.6 |
| **AC-1-23** | 320 / 393 / 600 / 1024px 에서 앱 컬럼 규칙이 성립한다 — 600px 이상에서 최대 폭 480px 가운데 정렬, 다단 레이아웃 없음, 가로 화면도 앱 컬럼 | Playwright viewport 4종 스크린샷 + 폭 측정 | #12, FR-25 |
| **AC-1-24** | Figma 시각 비교 8건이 수행되고 차이가 기록된다: `17:20` Button · `17:332`/`16:24` Material · `25:87` BottomTabBar · `76:440` Tag / `90:626`·`40:316` Chip · `76:417` TextField · `88:721` SpeechBubble · `88:789` PageIndicator · `17:366` 토큰 swatch | Figma screenshot ↔ Playwright screenshot 대조 (Playwright 미설정 시 `NOT VERIFIED`) | #28, FRONTEND_IMPLEMENTATION_PLAN §1.6 |
| **AC-1-25** | BottomTabBar 항목이 Library / Home(가운데) / Progress 이며 Session 탭이 없다. `items` 는 config 주입이고 `packages/ui` 가 도메인을 알지 않는다 | 컴포넌트 props + gallery | #15, D-02 |

### 11.5 Router · Layout · Adapter

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-26** | Router(`/`, `*`, dev gallery), 3개 Layout, Error Boundary 2단, RouteGuard shell이 동작한다. Error Boundary가 던져진 오류를 `ErrorState` 로 렌더한다 | e2e + 단위 테스트 | ARCHITECTURE §2.2·§2.4 |
| **AC-1-27** | Adapter 선택 지점이 `app/providers/ApiClientProvider.tsx` **한 곳**이다. Component·Page·Feature·Query hook에 Mock/Http 분기가 없다 | grep(`MockHealthApi`, `HttpHealthApi`, `VITE_API_MODE` 참조 위치) | ARCHITECTURE §2.3, rules/architecture §4 |
| **AC-1-28** | Page에 API 호출 / fetch / AI / Recording / 복잡한 로직 / Mock Data가 없다 | 코드 검사 + grep | rules/frontend §3 |
| **AC-1-29** | `UI → useHealth → healthApi → MockHealthApi | HttpHealthApi` 경로가 성립하고, Mock ↔ Http 교체 시 UI·Feature·Query 코드 변경이 **0줄**이다 | 두 모드 빌드·기동 + diff 증거 | ARCHITECTURE §2.3 |
| **AC-1-30** | `HttpHealthApi` 골격이 존재하고 contracts schema를 parse하며, base URL이 `https:` 가 아니면 거부한다. 실제 서버 연동은 검증 대상이 아니다 | 단위 테스트 | NFR 보안 |

### 11.6 contracts

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-31** | enum 23종(Capability + §2.2 22종)이 `packages/contracts/src/enums` 에 정의되고, 값이 API_CONTRACTS §2와 **정확히** 일치한다 (`ConsentAction` = `granted` 만, `AnalysisOutcome` 에 `skipped_*` 없음, `Gender` 3값 + nullable) | 단위 테스트(값 배열 스냅샷) + 문서 대조 | #13, #16, C-1, C-4, C-7, C-8 |
| **AC-1-32** | `SESSION_TRANSITIONS` 12행이 정의되고 `canTransition` 단위 테스트가 **허용 전이 12건 전부 true**, **대표 비허용 전이(예: `completed→recording`, `analyzed→recording`, `ready→recording` in `conversation_only`, actor 불일치) false** 를 보증한다 | 테스트 로그 | #16, API_CONTRACTS §3.1 |
| **AC-1-33** | `isReportEligible` 이 경계 fixture에서 정확히 동작한다: 3599초/3600초, 세션 2/3, 4가지 반환값(`eligible`·`insufficient_recorded_minutes`·`insufficient_recorded_sessions`·`insufficient_both`) | 테스트 로그 | #17, API_CONTRACTS §3.5 |
| **AC-1-34** | `MAX_RECORDED_SECONDS = 1800`, `READY_ABANDON_SECONDS = 600`, `MIN_REPORT_RECORDED_SESSIONS = 3`, `MIN_REPORT_RECORDED_SECONDS = 3600`, `REPORT_CYCLE_DAYS = 28` 값이 결정 #17과 일치한다 | 테스트 로그 | #17 |
| **AC-1-35** | Error Code 28종이 정의되고 Error Envelope schema가 `{ error: { code, message, requestId?, details? } }` 를 parse/reject 한다. `TRIAL_ACCOUNT_RESTRICTED` 가 **없다** | 단위 테스트 | API_CONTRACTS §1.1·§1.2, C-12 |
| **AC-1-36** | `packages/contracts` 의 런타임 의존이 `zod` 뿐이고, API 타입이 `apps/web` 에 재선언되지 않았다 | `package.json` + grep | ARCHITECTURE §1.2, rules/architecture §5 |

### 11.7 Mock Infrastructure

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-37** | `MockHealthApi` 의 요청·응답이 contracts schema parse를 통과한다 | 테스트 로그 | rules/qa 체크리스트 |
| **AC-1-38** | health scenario 5종(`success`·`loading`·`error`·`retry`·`offline`)이 재현되고, 각 scenario가 대응 UI 상태(정상 / Skeleton / ErrorState+Retry / 재시도 성공 / Offline Banner)를 만든다 | e2e 또는 컴포넌트 테스트 + 스크린샷 | API_CONTRACTS §5.3 health 행 |
| **AC-1-39** | scenario 전환이 **결정적**이다 — 같은 scenario key로 반복 실행 시 응답이 동일하고, `Date.now()` / `Math.random()` 직접 호출이 Mock 코드에 없다 | 반복 실행 테스트 + grep | API_CONTRACTS §5.2 "결정성" |
| **AC-1-40** | scenario key가 API_CONTRACTS §5.4 machine key만 사용하고 deprecated alias(`default`, `slow`, `upload-success` 등)가 없다 | grep | §5.4 Single Source |
| **AC-1-41** | Mock fixture가 `apps/web/src/mocks/fixtures/` 에만 있고 Component·Page·Feature 내부에 하드코딩되지 않았다 | grep 증거 | rules/frontend §5 |
| **AC-1-42** | `VITE_API_MODE=http` 프로덕션 빌드 산출물에 `src/mocks/**` 코드와 dev UI gallery·Scenario Panel이 **포함되지 않는다** (sentinel 문자열 검색 0건) | `pnpm assert:no-mocks` 로그 + `dist` grep | D-6, OAQ-21 |

### 11.8 Privacy · Security

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-1-43** | 번들·`VITE_*`·저장소에 Secret(Service Role Key, AI Key, STT Secret, 기타 Credential)이 **0건**이다 | grep 증거 + `.env.example` 검사 | rules/qa Privacy |
| **AC-1-44** | 광고·제3자 분석 SDK 의존성이 **0건**이고, 런타임 외부 도메인 요청이 0건이다 | `package.json` 검사 + Playwright network log | PRD §11 |
| **AC-1-45** | 콘솔·에러 로그 경로에 PII(아이 이름·transcript·오디오 경로)를 남기지 않는 규칙이 logger로 강제되고, `console.*` 직접 호출이 lint로 제한된다 | lint 규칙 + 코드 검사 | rules/architecture §9 |

**AC 총 45건.** In Scope 항목별 매핑: FR-25 → AC-1-23 · NFR 접근성 → AC-1-17·20·21·22 · NFR 프라이버시/보안 → AC-1-14·43·44·45 · §13 공통 상태 → AC-1-19·38 · 기술 요구사항(툴체인) → AC-1-01~06·09 · (토큰) → AC-1-10~16·24 · (contracts) → AC-1-31~36 · (Adapter/Mock) → AC-1-27~30·37~42 · Scope → AC-1-07·08.

---

## 12. Test Strategy

| 계층 | 도구 | Stage 1 범위 |
|---|---|---|
| **contracts 단위** | Vitest (Node 환경, React 불필요) | enum 값 스냅샷 23종 · `canTransition` 허용 12 / 비허용 대표 8건 이상 · `isReportEligible` 경계 6 케이스(3599/3600초 × 2/3세션 조합) · 상수 값 · Error Envelope parse/reject · Pagination limit 경계(1/20/50/51) |
| **Mock 단위** | Vitest | `MockHealthApi` × scenario 5종 × contracts parse · 결정성(동일 입력 2회 호출 → 동일 출력) · scenario URL 파서(그룹 표기·우선순위) |
| **Component** | Vitest + Testing Library (+ jsdom 또는 happy-dom — D-10) | Shared UI 22종 중 상태·접근성이 있는 것 우선: Button(disabled/loading/focus), TextField(error/helper/label 연결), Checkbox, RadioGroup, Dialog(focus trap·ESC), Sheet, Toast(aria-live), InlineAlert, ErrorState(onRetry), EmptyState, ProgressBar(aria), BottomTabBar(items/activeKey), AppColumn(폭 규칙) |
| **Feature/Query** | Vitest + Testing Library | `useHealth` × scenario 5종 → Loading / Success / Error+Retry / Offline UI 전이 |
| **Router/Guard** | Vitest | `/` · `*` 라우팅, Error Boundary fallback, RouteGuard shell이 `allow` 를 통과시킴 |
| **E2E / 시각 비교** | Playwright (#28) | ① UI gallery 전 섹션 스크린샷 ② Figma 비교 8건(§11.4 AC-1-24) ③ viewport 4종(320/393/600/1024) 앱 컬럼 ④ 200% 텍스트 확대 ⑤ `prefers-reduced-motion` ⑥ scenario 5종 UI 상태 ⑦ 외부 네트워크 요청 0건 ⑧ 키보드 탐색·focus 표시 |
| **정적 검사** | eslint / dependency-cruiser / grep 스크립트 | arbitrary value·HEX 0 · 경계 위반 0 · `provisional` 목록 대조 · Secret grep · mock sentinel |

- **Playwright 시각 비교 대상 컴포넌트 목록** (Stage 1 baseline 스냅샷 생성 대상): Button(8 variant×state) · Surface/Material(3) · BottomTabBar(3 active) · Tag(4 tone × 2 size) · Chip(selected/unselected × 3 variant) · TextField(4 상태) · Checkbox(3) · RadioGroup(card 6옵션 렌더) · ProgressBar · PageIndicator · SpeechBubble(2 tail) · Spinner/Skeleton · EmptyState · ErrorState · InlineAlert(5 tone) · Toast · Dialog · TopBar(4 variant) · IconButton · AppColumn(4 viewport) · 토큰 swatch 페이지.
- 스냅샷은 **1개 브라우저(Chromium) · 고정 DPR · 폰트 로드 대기** 조건으로 결정적으로 생성한다. baseline 갱신은 Design Spec 변경 시에만.
- 기기 수동 테스트: Stage 1은 **불필요** (웹 전용, 녹음 없음). 실기기 QA는 Stage 4부터 (#7).

---

## 13. Risks & Mitigations

| # | 위험 | 영향 | 완화 |
|---|---|---|---|
| S1-R1 | 편의상 Stage 2 화면·도메인 Mock을 선행 구현 (Scope 위반) | QA `FAIL` Finding | §3.1 목록을 Design Spec·Handoff에 그대로 싣고, QA가 라우트·디렉토리 목록으로 검증 (AC-1-08) |
| S1-R2 | Tailwind v4 `@theme` 로 노출되지 않는 토큰(z-index·motion·material·layout)을 화면에서 inline 수치로 사용 | arbitrary value 금지 위반, 토큰 우회 | `@utility` 로 노출(§5.5) + lint 규칙 + AC-1-10 |
| S1-R3 | Lucide 버전 drift로 아이콘 글리프가 바뀌어 Playwright 시각 비교가 흔들림 | 시각 회귀 오탐 | 정확 버전 고정(D-2) + lockfile 커밋 + 아이콘 대응표를 Design Spec에 고정 |
| S1-R4 | 최신 major(Vite 8 / Vitest 5 / TypeScript 7 / React Router 8)의 생태계 미성숙 | 빌드·lint 불안정 | §16 D-10 버전 정책 — typescript-eslint가 지원하는 TS 범위 확인 후 TS 6 고정, Vitest는 major 직후 5.x 대신 성숙한 4.x, 나머지는 최신 stable |
| S1-R5 | 가값(P-01~P-16)이 많아 Stage 2–8에서 값 교체 시 컴포넌트 수정이 발생 | 재작업 | 컴포넌트는 **토큰만** 참조(값 직접 사용 금지) — AC-1-10·AC-1-11로 강제. 값 교체는 design-tokens 1줄 수정으로 끝나야 함 |
| S1-R6 | Figma에 없는 공통 상태 디자인이 이후 디자이너 Figma와 충돌 | 재작업 | #22 승인 절차대로 기존 토큰·컴포넌트만 사용, Stage 1 QA 후 P-10 승인 요청(§17) |
| S1-R7 | Mock이 Production 빌드에 남아 데모·배포 시 의도치 않게 동작 | 신뢰성·보안 | D-6 동적 import 분리 + sentinel 빌드 검증(AC-1-42) |
| S1-R8 | 대비 미달 항목(D-01 수용 + P-01/P-02/P-11 가값)이 Stage 8 접근성 감사에서 대량 Finding으로 재등장 | Stage 8 일정 | Stage 1 QA 리포트에 미달 지점·측정값을 전부 기록하고, §17 가값 승인에서 사용자에게 대비 수치와 함께 제시 |
| S1-R9 | `SF-Pro` 를 기본 지정한 Figma 디자인과 실제 Inter 렌더의 metric 차이로 시각 비교 차이 다수 발생 | 시각 비교 노이즈 | 시각 비교는 **Chromium(비-Apple 렌더 = Inter)** 기준으로 baseline을 잡고, 문자 metric 차이는 "허용 차이"로 Design Spec에 명시 |
| S1-R10 | dev UI gallery가 Production 라우터에 남음 | 정보 노출 | `import.meta.env.DEV` 가드 + 동적 import + AC-1-42 |

---

## 14. Open Decisions

| ID | 항목 | 라벨 | 처리 |
|---|---|---|---|
| §16 D-1 ~ D-10 | Stage 1 세부 확정 항목 (lint 도구 · Lucide 고정 · Inter self-host · 이미지 최적화 · scenario 전환 · Production Mock · Http 골격 시점 · 도메인 Mock stub · 테스트 환경 · 버전 정책) | **RECOMMENDED** (권장안 제시) | 승인 체크포인트에서 O/X |
| P-01 ~ P-16 | 가값 토큰·공통 상태 디자인 | 가값 (결정 #10-④) | Stage 1 구현·QA 후 항목별 승인 (§17) |
| D-01 | 주요 버튼 대비 2.07:1 | 사용자 수용 예외 (CONFIRMED) | AC-1-17 처리 방식 유지 |
| M-32 잔여 / M-09 / M-10 / M-11 / M-12 / M-14 / M-15 / M-25 / M-26 / M-29 / M-30 / M-31 | PRD ↔ Figma 불일치 | NEEDS DECISION | **Stage 1과 무관** — 해당 Stage(3~7)에서 결정 |
| L-01 ~ L-07 | 법무 검토 | NEEDS DECISION (법무) | Stage 2 이후 |
| OAQ-10 / OAQ-11 / OAQ-13 / OAQ-14 / OAQ-15 / OAQ-16 / OAQ-17 / OAQ-19 | 아키텍처 미결 | NEEDS DECISION | Stage 3~8 / 비차단 |

---

## 15. Handoff to design-agent

design-agent는 `docs/design/stage-1-design-spec.md` 에 다음을 **반드시** 명세한다. (Figma 수정은 하지 않는다. Figma에 없는 항목은 결정 #22에 따라 명세로 확정하며, C-13 화면별 질문 절차는 Stage 1에 해당하지 않는다.)

### 15.1 3-tier 토큰 정의표
- Tier1 primitive 전체 (색 12 palette + ink/mist/dusk/paper + white alpha 3 + ink alpha 3, typography 11 style + weight 5) — Figma node 근거 포함 (`17:129`, `17:367`, `17:298`, `17:332`, `16:24`, `17:366`).
- Tier2 semantic 전체 이름 → 값 → 참조 primitive (TOKEN_MAP §2.6·§2.7 확정판).
- Tier3 component 토큰이 필요한 컴포넌트와 이름 규칙.
- **가값 P-01~P-09, P-11~P-16 이 적용되는 정확한 토큰 이름과 위치** (development-agent가 `provisional` 주석을 어디에 달지 판단 가능한 수준).
- Tailwind v4 `@theme` 노출 목록과 `@utility` 로 내보낼 항목 구분.

### 15.2 Shared UI 22종 — 컴포넌트별 variant / state 표
각 컴포넌트에 대해: variant 목록 · state 목록(rest/hover/pressed/disabled/**focus**/**loading**/**error**/selected) · 치수(높이·padding·radius·gap) · 사용 토큰 · 접근성 요구(role, 접근성 이름, 키보드 조작, 터치 타깃) · Figma node 근거 또는 "Figma 없음 → 명세".
특히 다음은 Figma에 없으므로 명세가 유일한 기준이다: **Spinner · Skeleton · EmptyState · ErrorState(+Retry) · InlineAlert(5 tone) · Toast · Dialog/ConfirmDialog**, 그리고 **모든 인터랙티브 컴포넌트의 focus·error·loading 상태** (#22, P-10).

### 15.3 공통 상태 화면 패턴 (P-10)
- Loading(전체 화면 vs 인라인 vs Skeleton 선택 기준), Empty(일러스트 유무·액션), Error+Retry(문구 톤·재시도 버튼 위치), Offline Banner(표시 위치·지속 시간·해제 조건), Toast(위치·지속·aria-live), Dialog(scrim·focus trap·destructive 스타일).
- 각 패턴을 AppColumn + TopBar 컨텍스트에서 본 레이아웃.

### 15.4 TopBar / BottomTabBar
- TopBar 4 variant(large · inline · centered · pill)의 구성 요소·정렬·safe-area 처리, 설정 아이콘 `26:44` 배치 규칙(Stage 2에서 사용).
- BottomTabBar: Library / Home(가운데 강조 `140:2971`) / Progress, active 표시, 중앙 항목 크기, safe-area, `items` config 스키마. Figma variant 이름 `Report` ↔ 표시 라벨 `Progress` 차이 명시 (#15, D-02). `110:522` 탭바는 사용하지 않음.

### 15.5 Layout / 반응형
- AppColumn 규칙: 최소 320, 최대 480 가운데 정렬, gutter(P-13), safe-area(P-08), 600/1024 breakpoint 동작, 가로 화면 처리 (#12).
- TabLayout / FullscreenLayout / StackLayout 각각의 영역 구성(TopBar 영역·콘텐츠·하단 CTA·TabBar).

### 15.6 Icon
- **Lucide ↔ Figma 아이콘 대응표** (settings, close, back, forward, chevron, refresh, mail, download, list, check, alert, wifi-off, trash, play/pause, share, lock, info, calendar, plus, search …).
- HARU 전용 SVG export 목록 (`Icon 50:157` 의 attend, thumb_gold/white, record, flip_to_back/front, star, clock 등)과 export 규격(viewBox·stroke·currentColor 처리).
- 크기 단계 `--size-icon-sm/md/lg` (P-09) 적용 기준.
- 브랜드 로고(Google `179:1710`, Apple)는 Stage 2 사용 예정 — Stage 1에서는 에셋 취급 규칙만 명시.

### 15.7 Motion / Accessibility
- motion duration·easing(P-07) 사용처 매핑, `prefers-reduced-motion` 대체 동작.
- focus ring(P-03) 시각 규격(색·굵기·offset)과 배경별 대비 근거.
- 대비 측정표: D-01 수용 범위(Accent 위 흰 라벨)와 P-01·P-02·P-11 가값 지점의 실제 측정값.

### 15.8 Figma node 참조 목록 (시각 비교 기준)
`17:20` · `17:332` · `16:24` · `25:87` · `140:2971` · `76:440` · `90:626` · `40:316` · `76:417` · `179:1742` · `179:1788` · `179:1779/1780` · `88:721` · `88:789` · `139:2734` · `78:158` · `26:44` · `163:1807` · `17:366` · `17:298` · `17:129` · `17:367`

### 15.9 design-agent가 판단해 보고할 것
- Figma 값이 혼재된 항목(P-12 radius 22/24, P-13 gutter 24/26, P-14 gradient stop 46/52%, P-15 버튼 높이 56/58, P-16 medallion)의 가값 채택 근거 재확인.
- Stage 1 컴포넌트 구현이 Figma와 다를 수밖에 없는 지점(폰트 metric 차이 R-S1-R9 등)을 "허용 차이"로 사전 기록.

---

## 16. Stage 1에서 확정해야 할 세부 결정 (승인 체크포인트 O/X)

> PLANNING §5 Stage 1 "Blocking decisions: 없음 — Stage 1 Plan에서 확정할 세부: lint 도구, Lucide 버전 고정, Inter self-host 방식, 이미지 최적화 포맷·해상도(C-17), scenario 전환 방식, Production Mock 처리(OAQ-21)" + ARCHITECTURE OAQ-20 에 대한 plan-agent 권장안이다. 전부 **RECOMMENDED** 이며 승인 전에는 구현하지 않는다.

| ID | 결정 항목 | 권장안 | 근거 | 대안 (기각 사유) | O/X |
|---|---|---|---|---|---|
| **D-1** | import 경계 lint 도구 (#9, ARCHITECTURE §4) | **dependency-cruiser 18.3.1 단일 도구** — `.dependency-cruiser.cjs` 에 ① `packages/* → apps/*` 금지 ② `packages/ui → @haru/contracts` 금지 ③ `packages/contracts → zod 외` 금지 ④ `features/([^/]+) → features/(?!$1)` 금지 ⑤ 레이어 역방향(`shared→features` 등) 금지 ⑥ `to.circular: true` 순환 금지. `pnpm lint:boundaries` 로 CI·QA에서 실행 | 규칙 6종을 **한 설정**으로 표현 가능. sibling-feature 금지는 group matching(`$1` 역참조)으로 정확히 표현됨 — dependency-cruiser 공식 rules-reference "Don't allow relations between business components" 예시로 확인(2026-09-18). 순환 탐지 내장(`to.circular`). 그래프 출력으로 문서화 가능 | ① `eslint-plugin-import` `import/no-restricted-paths` — zone 기반이라 "형제 feature만 금지, 자기 자신은 허용" 을 표현하지 못함 ② `eslint-plugin-boundaries` 7.2.0 — element-type 규칙은 좋으나 monorepo 패키지 경계·순환 탐지를 함께 못 다뤄 결국 2개 도구 필요. (에디터 즉시 피드백이 필요해지면 Stage 2 이후 추가 도입을 별도 승인) | ☐ |
| **D-2** | Lucide 버전 고정 방식 (#21) | **`packages/ui/package.json` 에 정확 버전(range 기호 없음) `"lucide-react": "1.47.0"`** + `pnpm-lock.yaml` 커밋 + root `pnpm.overrides` 로 중복 설치 방지. 업그레이드는 design-agent가 아이콘 대응표를 갱신하고 Playwright baseline을 재생성하는 작업과 **함께만** 수행 | Lucide는 minor/patch에서 아이콘 글리프를 변경·추가한다. caret(`^`)이면 lockfile 갱신 시 시각 회귀가 조용히 발생해 AC-1-24 시각 비교가 흔들린다. npm registry 확인(2026-09-18): `lucide-react` latest `1.47.0`, 라이선스 ISC | `^1.47.0` (글리프 drift 위험) / SVG 전량 export 후 라이브러리 미사용 (아이콘 유지보수 비용·#21 결정과 불일치) | ☐ |
| **D-3** | Inter self-host 방식 (#11) | **`@fontsource-variable/inter@5.3.0` (variable, wght 축, latin subset, woff2)** 를 `packages/design-tokens` 의 **devDependency가 아닌 dependency**로 추가하고, `packages/design-tokens/src/fonts.css` 에서만 `@font-face` 를 선언(패키지가 제공하는 CSS를 import). `font-display: swap`, `apps/web/index.html` 에서 해당 woff2 1개를 `<link rel="preload" as="font" crossorigin>`. italic·non-latin subset은 포함하지 않는다 | ① 외부 CDN 요청 0 (NFR 프라이버시) ② npm 버전 고정으로 재현성 ③ variable 1파일로 weight 400/510/590/700/860 전부 커버(#11 weight 5종) → 요청·용량 최소 ④ SIL OFL 라이선스 파일이 패키지에 동봉 ⑤ `@font-face` 단일 선언 지점이 "font stack은 design-tokens 한 곳" 규칙과 일치. npm 확인(2026-09-18): `@fontsource-variable/inter` latest `5.3.0`. *구체 import 경로(`/latin.css` 등)는 구현 시 패키지 exports map으로 확인* | ① Google Fonts CDN (제3자 요청 — 프라이버시 원칙 위반) ② woff2 수동 다운로드 커밋 (버전 추적·라이선스 관리 수동) ③ static weight 5개 파일 (요청 5회·용량 증가) | ☐ |
| **D-4** | 이미지 최적화 포맷·해상도 (C-17) | **정책**: 벡터(아이콘·단순 도형) = SVG(SVGO 정리, `currentColor`), 래스터(캐릭터 일러스트·medallion·책 표지) = **AVIF 우선 + WebP fallback + PNG 최후 fallback**, `<picture>` + `srcset` 1x/2x/3x. **해상도 상한**: 전폭 이미지 = 앱 컬럼 480 × 3 = **1440px**, medallion = 232 × 3 = **696px**, 책 표지 카드 = 120 × 3 = **360px**, 목록 썸네일 = 72 × 3 = **216px**. **파이프라인**: Figma export(3x PNG 또는 SVG)를 마스터로 커밋 → `pnpm assets:optimize`(devDependency `sharp@0.35.4`) 로 AVIF(q≈50)·WebP(q≈75)·PNG 생성물을 커밋 → Vite는 정적 자산으로 취급(빌드 플러그인 추가 없음). **Stage 1 적용 범위 = 정책·스크립트·SVG 아이콘 파이프라인까지**, 실제 캐릭터·표지 래스터 자산 반영은 Stage 2–4 | ① 빌드 플러그인을 늘리지 않아 빌드 결정성·속도 유지 ② 산출물이 커밋되므로 Playwright 시각 비교가 결정적 ③ 자산 수가 적다(초기 20권 표지 + 캐릭터 소수) ④ 해상도 상한이 결정 #12(앱 컬럼 480)에서 기계적으로 도출됨 ⑤ `sharp` 는 devDependency라 번들 미포함. npm 확인(2026-09-18): `sharp` latest `0.35.4` | ① `vite-plugin-image-optimizer@2.0.3` 빌드 시 변환 (빌드 의존·CI 시간 증가, 산출물 비결정성 우려) ② 원본 PNG 그대로 사용 (용량·성능 NFR 불리) ③ 전량 SVG (사진성 일러스트·표지에 부적합) | ☐ |
| **D-5** | Mock scenario 전환 방식 | **3계층 + 우선순위**: ① URL query `?scenario=<group>:<key>[,…]` (그룹 생략 시 전 그룹) ② dev 전용 Scenario Panel(`import.meta.env.DEV`, sessionStorage 반영 + URL 동기화) ③ 빌드 기본값 `VITE_MOCK_SCENARIO`. 우선순위 **① > ② > ③ > `success`**. 결정성: Mock은 주입된 `clock`(scenario 설정 시 고정 epoch)·`idFactory`(scenario key 시드)·주입 timer만 사용, `Date.now()`/`Math.random()` 직접 호출 금지 | ① URL이 1순위여야 Playwright·수동 재현·버그 리포트 공유가 결정적(rules/frontend §5 "결정적") ② dev 패널은 사람이 빠르게 훑기 위한 보조 ③ env 기본값은 Stage 8 Mock 데모 프리뷰(C-18)에서 전체 `success` 로 고정하는 용도 ④ 조합 표기(`group:key`)는 API_CONTRACTS §5.4 "조합 표기 방식은 Stage 1 Plan에서 확정" 요구를 충족 | ① 패널만 (Playwright 재현 어려움·URL 공유 불가) ② env만 (런타임 전환 불가, 시나리오마다 재빌드) ③ localStorage 기반 (테스트 간 상태 누수 — 결정성 위반) | ☐ |
| **D-6** | Production 빌드의 Mock 처리 (OAQ-21) | **빌드 모드 분리 + 동적 import 경계 + 산출물 검증**: `VITE_API_MODE` = `mock` \| `http`. `ApiClientProvider` 가 `import.meta.env.VITE_API_MODE === 'mock'` 조건에서만 `await import('../../mocks')` 로 Mock 번들을 로드 → Rollup이 `http` 빌드에서 `src/mocks/**` 와 fixture를 **완전히 제거**. dev UI gallery·Scenario Panel도 `import.meta.env.DEV` 가드 + 동적 import. `mocks/index.ts` 가 sentinel 문자열 `__HARU_MOCK_SENTINEL__` 을 export하고, `pnpm assert:no-mocks` 가 `http` 빌드 `dist/**` 에서 sentinel 검색 결과 0건을 강제(발견 시 종료 코드 1) | ① Adapter 선택 지점 1곳 원칙(ARCHITECTURE §2.3)을 유지하면서 코드 분리 ② tree-shaking 결과를 **기계적으로 검증**할 수 있어 QA 증거가 됨(AC-1-42) ③ Stage 8 웹 프리뷰(C-18)는 `VITE_API_MODE=mock` 빌드를 그대로 배포하므로 별도 코드 경로 불필요 | ① 별도 entry/앱 2벌 (중복·drift) ② 런타임 플래그만(`if (mode==='mock')` 정적 import) — 번들에 Mock·fixture 잔존, 프리뷰 외 빌드에 가상 아동 데이터가 남음 ③ 별도 패키지로 Mock 분리 (경계 복잡, apps/web 내부 도메인 지식 필요) | ☐ |
| **D-7** | Http Adapter 골격 작성 시점 (OAQ-20) | **각 Stage에서 Mock과 동시에 작성.** Stage 1에서는 `shared/api/http/httpClient.ts`(base URL·`https:` 강제·`X-Request-Id`·`Authorization` 주입 훅·contracts parse·Error Envelope 매핑·타임아웃)와 `HttpHealthApi` 를 만든다 | ARCHITECTURE OAQ-20 RECOMMENDED와 동일. "Mock ↔ Http 교체 시 UI·Query 코드 변경 0" 을 각 Stage에서 검증할 수 있어야 R-07(Mock↔Backend drift)이 누적되지 않는다 | Stage 8 일괄 작성 (교체 가능성 검증이 마지막에 몰려 재작업 위험) | ☐ |
| **D-8** | 도메인별 `Mock<Domain>Api` 골격의 Stage 1 범위 (#8) | **Stage 1은 `health` 도메인만 완전 구현**(interface + Mock + Http + fixture + 5 scenario)하고, 이를 **레퍼런스 구현**으로 문서화한다. 나머지 11개 도메인(auth/children/onboarding/activities/library/sessions/recordings/analysis/reports/notifications/data-management)의 **빈 stub 파일은 만들지 않는다**. 공통 helper(지연·scenario 조회·error envelope 생성·`canTransition` 래퍼)는 Stage 1에서 완성 | 빈 stub 11개는 ① 사용되지 않는 dead code ② "다음 Stage 기능 선행 구현 금지"(rules/workflow §2)의 경계에 걸림 ③ 도메인 schema가 없으므로 의미 있는 타입을 가질 수 없음. PLANNING §5 Stage 1 의 "도메인별 `Mock<Domain>Api` 골격 (#8)" 은 **패턴 확립**으로 해석 | 11개 도메인 stub 생성 (dead code·타입 없는 껍데기) | ☐ |
| **D-9** | Component 테스트 DOM 환경 | **`jsdom@30.1.0`** 를 기본으로 하고, 성능 문제가 관측되면 `happy-dom` 을 후보로 재검토 | jsdom이 Testing Library·Vitest 조합의 기본 경로이고 CSS/포커스 동작 재현이 더 충실하다(focus-visible·focus trap 테스트가 Stage 1 AC에 있음). npm 확인(2026-09-18): `jsdom` 30.1.0, `happy-dom` 20.14.5 | happy-dom (빠르지만 focus/레이아웃 관련 재현 편차) | ☐ |
| **D-10** | Node LTS / pnpm / 라이브러리 버전 정책 | 아래 §16.1 표 | npm registry + nodejs.org 확인 (2026-09-18) | — | ☐ |

### 16.1 D-10 — 버전 정책 (2026-09-18 기준, 출처 = npm registry dist-tags / nodejs.org 릴리스 일정)

| 대상 | 권장 버전 | 고정 방식 | 근거 / 비고 |
|---|---|---|---|
| **Node.js** | **24.x LTS ("Krypton")** — 확인 시점 최신 `24.21.0` | `.nvmrc` = `24.21.0`, root `engines.node` = `">=24.21.0 <25"`, `.npmrc` `engine-strict=true` | nodejs.org 릴리스 일정 기준 현재 Active LTS. 로컬 환경 `v24.16.0` 확인 — 개발 전 `24.21.0` 로 맞춘다 |
| **pnpm** | **12.4.2** | root `package.json` `"packageManager": "pnpm@12.4.2"` + corepack | corepack이 해석한 latest(2026-09-18). packageManager 필드로 전 기기 동일 버전 강제 (#4 다기기 동기화) |
| **TypeScript** | **6.0.3** (major 7 미채택) | `~6.0.3` | **중요**: `typescript-eslint@8.70.0` 의 peer 범위가 `typescript >=4.8.4 <6.1.0` 로, 최신 `typescript@7.0.2`(2026-07-08 릴리스)를 **지원하지 않는다**(npm 메타데이터 확인 2026-09-18). TS 7 채택 시 lint 파이프라인이 깨진다 |
| **typescript-eslint** | **8.70.0** | `^8.70.0` | peer: `eslint ^8.57 \|\| ^9 \|\| ^10` |
| **ESLint** | **10.10.0** | `^10.10.0` | flat config. major 10은 2026-02 릴리스로 성숙 |
| **React / React DOM** | **19.3.0** | `^19.3.0` | |
| **React Router** | **8.4.0** (declarative/library mode, framework mode 미사용) | `~8.4.0` | major 8 = 2026-06-17 릴리스. 신규 프로젝트이므로 마이그레이션 비용 없음. 보수적 대안 `7.18.4` 도 가능 — O/X 시 선택 가능 |
| **TanStack Query** | **5.103.1** | `^5.103.1` | persist 플러그인은 필요 시 Stage 3에서 추가 (#9) |
| **Zod** | **4.6.5** | `^4.6.5` | `packages/contracts` 의 유일한 런타임 의존 |
| **Vite** | **8.3.0** | `^8.3.0` | major 8 = 2026-03-12 릴리스, 6개월 경과 |
| **@vitejs/plugin-react** | **6.1.1** | `^6.1.1` | |
| **Tailwind CSS** | **4.3.3** + `@tailwindcss/vite@4.3.3` | `^4.3.3` | v4 CSS-first `@theme` (#29). v3 config 방식 사용 금지 |
| **Vitest** | **4.1.11** (major 5 미채택) | `~4.1.11` | Vitest 5.0.x는 2026-09-03 릴리스(2주 경과)로 생태계 미성숙. major 4는 2025-10 릴리스로 안정. Stage 1은 기반 Stage이므로 안정성 우선 |
| **@testing-library/react** | **16.3.3** | `^16.3.3` | |
| **jsdom** | **30.1.0** | `^30.1.0` | D-9 |
| **Playwright** | **@playwright/test 1.63.0** | `~1.63.0` | 시각 비교 baseline 안정성을 위해 patch 범위 고정 (#28) |
| **lucide-react** | **1.47.0** | **정확 버전** | D-2 |
| **@fontsource-variable/inter** | **5.3.0** | `~5.3.0` | D-3 |
| **dependency-cruiser** | **18.3.1** | `^18.3.1` (devDependency) | D-1 |
| **sharp** | **0.35.4** | `^0.35.4` (devDependency, 에셋 스크립트 전용) | D-4 |
| **Prettier** | **3.9.8** | `^3.9.8` | |
| **eslint-plugin-react-hooks** | **7.1.1** | `^7.1.1` | |

**공통 원칙 (RECOMMENDED)**
1. `pnpm-lock.yaml` 을 커밋하고 CI·QA는 `--frozen-lockfile` 로 설치한다.
2. 런타임 의존은 최소로 유지한다. Stack 외 라이브러리 추가는 이유 보고 + 승인 후 도입 (rules/frontend §1).
3. **시각 결정성에 영향을 주는 패키지**(`lucide-react`, `@playwright/test`, `@fontsource-variable/inter`, `tailwindcss`)는 caret 대신 정확/patch 고정.
4. major 업그레이드는 Stage 경계에서만, 승인 후 수행한다. Stage 중간 업그레이드 금지.
5. 위 버전은 2026-09-18 확인값이다. 구현 착수 시점에 registry를 재확인하고 차이가 있으면 Handoff 메모에 기록한다.

---

## 17. 가값(P-01~P-16) 후속 승인 절차

결정 #10-④ · #22 · `docs/decisions/stage-0-approvals.md` §4 운영 규칙에 따른다.

1. **Stage 1 구현 중** — development-agent가 `packages/design-tokens` 의 해당 토큰 정의에 `/* provisional: P-xx */` 주석을 남긴다 (P-10은 토큰이 아니므로 Design Spec·gallery 화면으로 대체).
2. **Stage 1 QA 중** — stage-qa-agent가 ① `provisional` 주석 목록 ↔ §4 P 목록 1:1 일치(AC-1-12) ② 남은 가값 목록을 QA 리포트에 기록한다. **가값 자체는 FAIL 사유가 아니다.**
3. **Stage 1 Verdict 보고 후 · Stage 2 착수 전** — Orchestrator가 dev UI gallery 화면(`/__dev/ui`)을 근거로 P-01 → P-16 순서(FRONTEND_IMPLEMENTATION_PLAN §1.7 표 순서)로 **하나씩** 사용자에게 제시하고 `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지` 중 하나를 받는다. 대비 관련 항목(P-01·P-02·P-11)은 측정 대비값을 함께 제시한다.
4. **반영** — 확정된 항목은 `docs/decisions/stage-0-approvals.md` §4 와 `docs/DESIGN_TOKEN_MAP.md` §4.1 을 갱신하고 `provisional` 주석을 제거한다(토큰 값 변경은 development-agent, 문서 반영은 design-agent/plan-agent 소관 문서에 따름). "디자이너 대기 유지" 항목은 그대로 둔다.
5. **신규 가값** — Stage 1 구현·QA 중 디자이너 확인이 필요한 값이 새로 발견되면 같은 규칙으로 `P-17…` 을 추가하고 §4 표에 기록한다.

---

## 18. 보고 항목 — Stage 0 이후 발견한 문서 불일치 · 확인 요청

> 승인된 결정을 뒤집는 제안이 아니라, 구현 전에 **표기·배치 수준의 정합**을 맞추기 위한 보고다. 전부 Stage 1을 차단하지 않는다.

| # | 항목 | 내용 | 이 Plan의 처리 |
|---|---|---|---|
| ① | `MAX_RECORDED_SECONDS` / `READY_ABANDON_SECONDS` 배치 | `API_CONTRACTS §3.1` 코드 스케치는 두 상수를 `rules/session-transitions.ts` 에 두었으나, `PLANNING §5 Stage 1` 과 `ARCHITECTURE §1.2` 는 `rules/recording-limits` 를 별도 파일로 나열한다 | `rules/recording-limits.ts` 에 정의하고 `rules/index` 에서 함께 re-export (§7.1). API_CONTRACTS 문서 수정은 development-agent가 구현 확정 시 동기화 (rules/workflow §5 문서 소유) |
| ② | Layout 소유 패키지 | `FRONTEND_IMPLEMENTATION_PLAN §1.2` 는 Layouts를 `packages/ui` 우선순위 7로, `ARCHITECTURE §2.2` 는 `apps/web/src/app/layouts` 로 둔다 | §5.3 해소안 — `AppColumn` 은 `packages/ui`, `TabLayout`/`FullscreenLayout`/`StackLayout` 은 `apps/web/src/app/layouts` |
| ③ | Stage 1 Shared UI 목록 차이 | `PLANNING §5 Stage 1` 의 나열(21개 언급)과 `FRONTEND_IMPLEMENTATION_PLAN §1.2`(22행, AppBackground·ButtonGroup·FieldGroup·Scrim 포함)가 정확히 같지 않다 | §1.2 표(22행)를 기준으로 삼는다 (§9.3). 차이는 세분화 표기 차이일 뿐 범위 확대가 아니다 |
| ④ | health scenario 에 `empty` 없음 | `PLANNING §5 Stage 1` "Mock scenarios: health — `success`, `loading`, `error`, `retry`, `offline`" 과 `API_CONTRACTS §5.3` health 행이 일치하며 `empty` 를 포함하지 않는다. 반면 §5.4 catalogue의 `empty` 최초 Stage는 1 | `empty` 는 health API가 아니라 **공통 상태 컴포넌트 데모**로 Stage 1에서 검증한다 (§8.1·§8.2) |
| ⑤ | `typescript@7.0.2` 와 lint 도구 비호환 | Stage 0 문서에는 TypeScript 버전 정책이 없다. 2026-09-18 확인 결과 `typescript-eslint@8.70.0` 의 peer 범위가 `>=4.8.4 <6.1.0` 이어서 최신 TS 7을 지원하지 않는다 | §16.1 D-10 — TypeScript **6.0.3** 고정 권장. 승인 대상 |
| ⑥ | Figma `SF Pro` ↔ 구현 `Inter` 렌더 차이 | 결정 #11에 따라 Apple 외 환경은 Inter로 렌더되므로, Chromium 기준 Playwright 시각 비교에서 Figma(SF Pro) 대비 문자 metric 차이가 필연적으로 발생한다 | design-agent가 Design Spec에 "허용 차이"로 사전 명시 (§15.9). QA는 이 차이를 FAIL로 처리하지 않는다 |
| ⑦ | `docs/design/` · `docs/qa/` 디렉토리 부재 | 현재 저장소에 `docs/design/`, `docs/qa/`, `docs/plans/` 가 없었다 (`docs/plans/` 는 이 문서로 생성) | design-agent·development-agent·stage-qa-agent가 각자 산출물 작성 시 생성한다 |

**PRD ↔ Figma 불일치 (Stage 1 범위):** 신규 발견 **없음**. Stage 1은 Figma의 컴포넌트 라이브러리(`17:x`, `25:87`, `76:x`, `88:x`)만 사용하며, 관련 불일치 M-33(대비)·M-34(focus 부재)는 이미 결정 #18·D-01·P-01~P-03으로 처리되어 있다. M-08(내비게이션)은 #15·D-02로 해소, M-13(역량 명칭)은 #13·#14·#19로 해소되었다.

---

## 19. 요약 — 승인 체크포인트 제시용

- **In Scope**: FR-25(기반) · NFR 접근성/프라이버시/보안(기반) · PRD §13 공통 상태 · 기술 요구사항 5종(툴체인·토큰·contracts 공통부·Adapter 구조·Mock 인프라)
- **Out of Scope**: Stage 2–8 화면·도메인 Mock 전부, `apps/mobile`, Backend 전부
- **Deliverables**: `packages/config` · `packages/design-tokens` · `packages/ui`(Shared UI 22종) · `packages/contracts`(common + enum 23 + rules 3 + health) · `apps/web`(router/layout/providers/health 도메인/mocks/dev gallery)
- **Acceptance Criteria**: **45건** (AC-1-01 ~ AC-1-45)
- **확정 필요 결정**: **D-1 ~ D-10** (§16) — 전부 RECOMMENDED, 승인 체크포인트에서 O/X
- **Blocking**: 없음
- **`BACKEND_INTEGRATION_PENDING` 예상**: **0건**
- **가값**: P-01~P-16 유지, Stage 1 QA 후 항목별 승인 (§17)
