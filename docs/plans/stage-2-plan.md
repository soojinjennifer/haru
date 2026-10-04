# Stage 2 Plan — Auth + Consent + Onboarding + Child Profile (Frontend) + Home 화면 골격

Status: APPROVED (2026-09-25, user)
Based on:
- PRD v1.4 — `docs/source/HARU_PRD_v1.5.md` (FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-24, §6.2 · §7.1 · §7.2 · §7.3 · §7.8 · §11 NFR 프라이버시·최소 수집·접근성·보안, §12.1)
- Baseline Survey v1 — `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md` (Step 5 문항 원문 · 척도 · 비채점 응답)
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `16:2` MVP_KeyScreen_V.2 (`179:1700` Signup & Baseline survey, `26:21` Home 헤더), page `8:2` Design Guide (node 목록 §15.7)
- Scope — `CLAUDE.md` Development Scope, `docs/source/prompts/01-stage0-1-1-frontend-scope.md`
- 승인 문서 — `PLANNING.md` §4.1 · §4.2 · §4.3 · §5 Stage 2 · §9.2, `docs/ARCHITECTURE.md` §2.4 · §5 · §6 · §7 · §13, `docs/API_CONTRACTS.md` §1 · §2.2 · §3.4 · §4 Stage 2 · §5.3 · §5.4, `docs/DATA_MODEL.md` §5 · §6, `docs/COMPONENT_MAP.md` §1 · §2 · §3 · §7, `docs/FIGMA_SCREEN_MAP.md` §1.1 · §2, `docs/FRONTEND_IMPLEMENTATION_PLAN.md` §2.1–§2.4
- 결정 기록 — `docs/decisions/stage-0-approvals.md` (#33 · C-1~C-19 · §3 D-01~D-04 · §4 P-01~P-16 · §6 L-01~L-07), `docs/decisions/stage-1-approvals.md` (§1 D-1~D-10 · §7 · §8 · §9 가값 결과)
- 선행 Stage — `docs/plans/stage-1-plan.md` (APPROVED 2026-09-18), `docs/design/stage-1-design-spec.md`, `docs/qa/stage-1-handoff.md`, `docs/qa/stage-1-qa-report.md` (Verdict `PASS (accepted: D-01, S1-G-2)`)
- Rules — `.claude/rules/workflow.md` · `architecture.md` · `frontend.md` · `backend.md` · `qa.md`

라벨: `CONFIRMED` (PRD/Figma/사용자 결정으로 확정) · `RECOMMENDED` (근거 있는 권장안, 승인 필요) · `NEEDS DECISION` (사용자/법무/비즈니스 결정 필요)

> 이 Plan은 **Frontend Plan**이다. Backend는 구현 계획을 쓰지 않고 Integration Requirement와 Contract만 정의한다 (`.claude/rules/backend.md`).
> 사용자의 "Stage 2 착수 승인"(2026-09-23)은 **워크플로 시작 승인**이며 Plan/Design Spec 승인이 아니다 (rules/workflow.md §3, 결정 #24). 이 문서 + `docs/design/stage-2-design-spec.md` 가 나온 뒤 승인 체크포인트에서 사용자 승인을 받아야 development-agent가 시작한다.
> **§16 D-1 ~ D-17 과 §15.1 C-13 화면 13건은 승인 전에 구현·디자인하지 않는다.**

---

## 1. Goal

가입부터 첫 프로필 결과·발전 역량 제시, 그리고 착지 화면(Home 골격)까지를 **Mock 기반 end-to-end**로 성립시킨다. Stage 2가 끝나면 다음이 성립해야 한다.

1. Email · Google · Apple(Mock) **모든 가입 경로**가 가입 직후 동일한 `/auth/consent` 동의 화면을 거치고, 동의 기록이 성공하기 전에는 **아동 데이터가 어떤 Contract로도 전송되지 않는다** (C-2 · C-5 · ARCHITECTURE §7.3.1).
2. `AuthGateway` interface + `MockAuthGateway`(Web)가 동작하고, 토큰 만료·provider 취소·비밀번호 재설정 UX가 Mock 시나리오로 재현된다 (Supabase JS Client 미사용 — #27).
3. `RouteGuard` 가 ARCHITECTURE §2.4 판정 순서(미인증 → 동의 → VPC → 온보딩 → Home)를 `GET /v1/me` 계약 위에서 실제로 수행한다. Stage 1의 "항상 allow" shell이 교체된다.
4. PRD 5단계 온보딩 위저드(C-9)가 진행바·중도 저장·복귀와 함께 동작하고, Step 5가 **Baseline Survey v1 10문항**(빈도 5단계 + 비채점 응답, C-8 · D-04)을 instrument 응답 값으로만 렌더한다.
5. Trial(C-12)이 **기기 로컬 draft만으로** Step 1–5를 진행하고, 가입 → 동의 → `POST /v1/onboarding/submit` 1회 제출로 전환된다. 서버 전송은 동의 이후에만 발생한다.
6. 프로필 결과(다이아몬드 inline SVG · 강점 2 · growing edge 2 · 페르소나 · "판정 아님" 안내)와 발전 역량 제시·변경이 **서버(Mock) 응답 값만** 표시한다 (FR-04 · FR-05 · FR-06).
7. 로그인·온보딩 완료 후 착지 화면이 `/` **Home skeleton**(워드마크 `26:39` + 설정 아이콘 `26:44` 최종 위치 + 빈 상태 안내)이며, 설정 아이콘 → `/settings` → 로그아웃 → 로컬 draft·캐시 정리가 동작한다 (#33 · C-16).
8. `packages/contracts` 에 Stage 2 도메인 schema(auth · me · consent · onboarding · children · books 검색 최소)와 `rules/capability-score` 가 추가되고 단위 테스트로 보증된다.
9. Backend 런타임 코드(`apps/api/`, `supabase/`)와 Stage 4 산출물(`apps/mobile`)이 여전히 **존재하지 않는다**.

**Non-Goal**: Activity Card 덱·Home 콘텐츠·BottomTabBar 마운트·서재·세션·녹음·회고·분석·리포트·데이터 관리·탈퇴는 만들지 않는다. Stage 3 이후 기능의 선행 구현은 QA에서 `FAIL` Finding이다 (rules/qa.md §2).

---

## 2. In Scope

표기: **[FE]** Frontend 구현 · **[C·M]** contracts 정의 + Mock · **[HO]** Backend Handoff 요구사항 기록만 · **[기술 요구사항]** PRD에 직접 문장은 없으나 근거 요구사항 ID를 위해 필요한 항목.

### 2.1 요구사항 ID별

| ID | 근거 | Stage 2에서 하는 부분 | Stage 2에서 하지 않는 부분 |
|---|---|---|---|
| **FR-01** (이메일·Apple/Google 가입·로그인·비밀번호 재설정, P0) | PRD FR-01, §7.1 / C-5 · C-13 · #7 · #27 | [FE] `/auth/welcome` `179:1701` · `/auth/sign-up` `179:1724`(보호자 이름·이메일·비밀번호만) · `/auth/log-in` `179:1820` · `/auth/forgot-password` · `/auth/reset-password`. Apple 로그인 = **Apple 공식 가이드 버튼**, Google = 공식 브랜드 로고 `179:1710`. [C·M] `AuthGateway` 9 메서드 + `MockAuthGateway`(Web) + `authApi` 없음(Gateway가 대체). 토큰 만료 UX(`token-expired` 1회 refresh), provider 취소 UX | 네이티브 Apple/Google Adapter(Stage 4, #7), Supabase Auth Adapter(Backend 연동 시점, #27), 실제 토큰 발급·검증·재설정 메일 발송([HO]) |
| **FR-02** (보호자 동의 수집·기록, P0) | PRD FR-02, §7.1 / C-1 · C-2 · C-3 · C-4 · L-01 · L-02 | [FE] `/auth/consent` 동의 **5항목** 개별 체크(필수 ① `terms_of_service` ② `privacy_policy` ③ `child_voice_data` 별도 체크, 선택 ④ `marketing`, ⑤ `pilot_participation`). 필수 여부는 **서버(Mock) `ConsentDocument.required` 값**으로만 결정(하드코딩 금지). 항목별 문서 버전 기록. 모든 가입 경로(Email·Google·Apple) 뒤 동일 화면(C-2). 동의 기록 전 아동 데이터 미전송. VPC 단계 **슬롯** `/auth/verify-parent` + Mock(C-3). [C·M] `GET /v1/consent-documents/current`, `POST /v1/consents`(IK) | **동의 철회 UI·Contract 없음**(C-4). 동의 이력 보기(Stage 8 선택 기능, C-19). 서버 측 동의 강제·`consent_events` append-only·VPC 실제 방식([HO], L-01) |
| **FR-03** (온보딩 설문 위저드, 중도 저장·복귀, P0) | PRD FR-03, §7.2 / C-6 · C-7 · C-8 · C-9 · C-10 · D-03 · D-04 | [FE] `/onboarding` 소개 `179:1748` → `/onboarding/:step` 5단계(`child-info` · `temperament` · `books` · `goals` · `capability-items`) → `/onboarding/saved` `179:1809`. 진행바 `179:1779/1780`, 이전/다음, 중도 이탈 후 동일 step 복귀. Step 1 = 성·이름 두 칸(D-03, 호칭은 first name) · 생년월(3~9세, C-10) · 성별 3옵션 기본 미선택(C-7) + 관계·언어 환경·독서 루틴. Step 5 = Baseline v1 10문항 `179:1770`, RadioGroup **6옵션**(빈도 5 + 비채점) — 문항 문구는 instrument 응답 값만. [C·M] `GET /v1/onboarding`, `PUT /v1/onboarding/steps/:step`, `POST /v1/onboarding/submit`(IK) | 설정의 설문 재응답(Stage 6, §7.8), Exit 설문(C-11 — MVP 제외), draft 서버 저장·instrument 버전 관리([HO]) |
| **FR-04** (4대 역량 스코어·다이아몬드 그래프, P0) | PRD FR-04, §7.3 / C-8 · #9 · #13 · #14 · #19 | [FE] `/onboarding/profile` — `CapabilityDiamondChart`(**inline SVG**, #9) single 모드, 축 라벨 #14, 축 색 `--color-capability-*-chart`(#19), 대체 텍스트 필수. "잘함/못함 판정이 아니다" 안내 문구(§7.3). 강점 2 · growing edge 2 표시(응답 값만). [C·M] `rules/capability-score`(`scoreCapabilities`) + `ProfileResult.snapshot.scores[4]{capability, score(null 가능), itemCount, missingCount}` | 이전/현재 오버레이(Stage 7), 세션 누적 갱신(Stage 6), 서버 스코어 산출·스냅샷 저장([HO]) |
| **FR-05** (긍정형 페르소나·금지어 검증, P0) | PRD FR-05, §7.3, §8.4 | [FE] `PersonaCard` 표시(default · fallback). 생성 지연 ≤3s = `loading`, 생성 실패 = `persona-fallback`(200 + fallback 페르소나). 문구는 **API 응답 값만** 표시 (rules/frontend §8) | LLM 슬롯 생성·안전 필터·금지어 검증·fallback pool·`ai_generation_logs`([HO]) |
| **FR-06** (발전 역량 제시·양육자 변경, P0) | PRD FR-06, §7.3 | [FE] `/onboarding/growth-capability` — 제시 화면 + 다이아몬드 축 탭으로 변경. 기본 제시값은 응답의 `suggestedCapability`. [C·M] `PUT /v1/children/:childId/growth-capability` | 설정에서 변경(Stage 6, C-16), 서버 기본값(최저 스코어) 산출·`growth_capability_selections` 저장([HO]) |
| **FR-24** (Trial 시작 후 가입 전환, P1) | PRD FR-24 / C-12 · ARCHITECTURE §7.4 | [FE] 미인증 상태에서 `/onboarding/*` 진입 허용, Step 1–5 응답을 **기기 로컬 draft로만** 보관(서버 요청 0건). "프로필 저장" → 가입 → 동의 → (VPC) → submit 1회 제출. 기기 변경 시 draft 유실 안내. draft 보관 상한·삭제 시점(§16 D-3). [C·M] `OnboardingDraftSchema`(로컬 전용, HTTP 아님) | 익명 계정·다른 기기 이어하기 없음(C-12). `TRIAL_ACCOUNT_RESTRICTED` 코드 없음(Stage 1에서 이미 제외) |
| **로그아웃** (FR ID 없음) | PRD §7.8 / C-16 · #33 | [FE] `/settings` 목록 = **로그아웃 1행**. `AuthGateway.signOut()` + 로컬 draft·Query 캐시·저장소 정리. 확인 Dialog는 §16 D-7 | 알림 설정(Stage 3), 아이 프로필 수정·설문 재응답·발전 역량 변경(Stage 6), 데이터 관리·탈퇴·동의 이력(Stage 8) |
| **Home skeleton** (FR ID 없음, 착지 화면) | PRD §6.1 · §7.8 / **#33** · C-16 | [FE] `/` = 상단 워드마크 `26:39` + 설정 아이콘 `26:44`(최종 위치) + 빈 상태 안내(`EmptyState`). **contract 호출 0건** (`HomeSummary` 는 Stage 3). 로그인 후·온보딩 완료 후 착지 화면 | Activity Card 덱·streak·캐릭터·버블·**BottomTabBar 마운트** 전부 Stage 3 |
| **NFR 아동 데이터 최소 수집** | PRD §11 / C-5 · C-6 · C-7 · D-03 · L-07 | [FE] 가입 요청에 아이 필드 0건, 아이 정보는 동의 후 Step 1에서만 입력, 화면·알림 호칭은 first name만, 성별 미응답 `null` 허용. 로컬 draft도 아동 데이터로 취급(로그아웃·제출 시 삭제) | 서버 저장 최소화·AI에 이름 미전송([HO]). 성(last name) 수집 적합성 = **NEEDS DECISION (법무, L-07)** |
| **NFR 검증 가능한 보호자 동의(VPC)** | PRD §11 / C-3 · L-01 | [FE] 동의 화면 뒤 VPC 단계 슬롯 + `Me.parentVerification.status` 기반 Guard 분기 + Mock(`vpc-pending` · `vpc-failed`) | VPC 실제 방식·검증·기록([HO]) — **NEEDS DECISION (법무, L-01)** |
| **NFR 접근성** (WCAG AA, 터치 타깃, 텍스트 의존 최소화) | PRD §11 / D-01 · S1-G-2 · P-01~P-05 · P-16 | [FE] Stage 2 신규 화면·컴포넌트에 Stage 1 기준 적용: focus 표시, 접근성 이름, 44×44 터치, 키보드 조작(**SwipeDeck 제스처 전용 금지** — WCAG 2.5.1), `prefers-reduced-motion`, 200% 텍스트 reflow. 다이아몬드 차트 대체 텍스트 | 전체 화면 감사·스크린리더 실기기(Stage 8) |
| **NFR 보안 — Secret 미노출 / TLS** | PRD §11 | [FE] 비밀번호가 로컬 저장소·draft·Query 캐시·로그에 잔존하지 않음. Http Adapter `https:` 전용 유지(Stage 1 회귀) | 서버·저장소 암호화([HO]) |
| **NFR 프라이버시 — 로그 PII 금지** | PRD §11 / ARCHITECTURE §13 | [FE] 아이 이름·보호자 이메일·비밀번호·동의 증빙을 콘솔·에러 리포트에 남기지 않음. `logger`·`devWarn` 경유 규칙 유지 | 서버 audit log([HO]) |
| **PRD §13 예외 처리 (Stage 2 해당분)** | PRD §13 / rules/frontend §7 | [FE] 이 Stage의 §13 항목은 **없다**(§13 표 10건은 전부 Stage 3~7). 대신 공통 상태(Loading · Empty · Error+Retry · Offline · Toast · Dialog)를 Stage 1 P-10 명세대로 Stage 2 화면에 적용한다 | 마이크 권한·업로드·저품질·리포트 미충족 등 도메인별 예외(해당 Stage) |
| **기술 요구사항 — Route Guard 판정** | ARCHITECTURE §2.4 / FR-01·02·03 | [FE] `useGuardDecision` 를 `GET /v1/me` 기반 실제 판정으로 교체, 판정은 순수 함수로 분리해 전수 단위 테스트(§16 D-5 · D-6) | 서버 측 강제([HO]) |
| **기술 요구사항 — Stage 2 Shared UI / Domain 컴포넌트** | COMPONENT_MAP §1·§2, FRONTEND_IMPLEMENTATION_PLAN §2.1 | [FE] Shared 6종(SelectTrigger · SwipeDeck · ListGroup/ListRow · InfoRow · DividerWithLabel · TextLink) + Domain 6종(CharacterMedallion · CharacterIllustration · SurveyQuestionCard · CharacterBubble · CapabilityDiamondChart · PersonaCard). 범위 근거·판정은 §16 D-8 | TextArea · StarRating(Stage 5), SectionHeader · Carousel · Toggle(Stage 3), StatTile(Stage 7), PasswordToggle(TextField `trailingAction` 으로 흡수 — 신규 컴포넌트 아님) |
| **기술 요구사항 — Stage 1 이월 정리** | stage-1-approvals §8·§9, stage-1-handoff §18.8, WORKFLOW_STATE §3 | [FE] `useScrolledPast` 컨테이너 구독 수정(§16 D-13), 시각 임계값 보강(§16 D-12), `provisionalItems.ts` 를 남은 5건으로 축소, `QA-1-002` 처리(§16 D-14). design-agent 문서 갱신 7항목은 **design 단계 전** 처리(§17) | — |

### 2.2 산출물 요약

- `packages/contracts` Stage 2 도메인 schema + `rules/capability-score` — §7.1
- `packages/ui` Shared UI 6종 추가 — §9.2
- `apps/web` route 15개 · feature 5개 · entity 4개 · Mock 도메인 5개 — §9.3
- `docs/plans/stage-2-plan.md`(이 문서), `docs/design/stage-2-design-spec.md`(design-agent), `docs/qa/stage-2-handoff.md`(development-agent), `docs/qa/stage-2-qa-report.md`(stage-qa-agent)

---

## 3. Out of Scope

### 3.1 다음 Stage로 넘기는 항목 (선행 구현 금지)

| 항목 | 이관 Stage | 근거 |
|---|---|---|
| Home 콘텐츠 — Activity Card 덱, streak, 캐릭터·버블, `GET /v1/children/:childId/home`, `GET .../activity-cards/today` | 3 | #33 — Stage 2 `/` 는 skeleton(헤더 + EmptyState)만 |
| **BottomTabBar 마운트**(TabLayout 실사용), Library / Home / Progress 탭 전환 | 3 | #15 · D-02 · #33 — Stage 1에서 컴포넌트만 만들었고 Stage 2에도 마운트하지 않는다 |
| 서재·책 상세·증정 신청·보유 책 직접 등록, `LibraryBook`·`BookPrompts`·`gift-requests` contract | 3 | FR-20 · FR-22 · FR-23. **예외**: Step 3 책 **검색**(`GET /v1/books/search` + 최소 `BookSummary`)만 Stage 2 — §16 D-17 |
| Context 선택, 알림 설정·push 권한·`notification-preferences` | 3 | FR-08, C-16 설정 목록 확장은 Stage 3 |
| 세션·녹음·Prompt Drawer·업로드, `apps/mobile` Capacitor 셸 | 4 | #7 — **Stage 2에서 생성 금지** |
| 회고·분석 상태·짧은 피드백, TextArea · StarRating | 5 | FR-12 · FR-13 |
| 설정 확장(아이 프로필 수정 `PATCH /v1/children/:childId`, 설문 재응답, 발전 역량 **설정에서** 변경), 세션 누적 프로필 갱신(`cold-to-warm`·`persona-changed`) | 6 | C-16 · FR-15. Stage 2의 발전 역량 변경은 `/onboarding/growth-capability` 화면에서만 |
| 리포트·다이아몬드 **오버레이**·페르소나 히스토리·PDF·하이라이트, `capability-snapshots`·`personas` 목록 endpoint | 7 | FR-15 · FR-16 · FR-17 · FR-18 |
| 데이터 관리·탈퇴·**동의 이력 보기**(`GET /v1/consents`), Mock 웹 프리뷰 배포 | 8 | C-15 · C-19 · C-18 |
| 동의 **철회** UI·Contract·`consent-revoked` scenario key | 없음 (MVP 제외) | **C-4** — 만들지 않는다. COPPA 관계는 법무 L-03 |
| 나머지 도메인 `Mock<Domain>Api`(activities · library · sessions · recordings · analysis · reports · notifications · data-management) | 각 도메인 Stage | Stage 1 §16 D-8 — 빈 stub 파일도 만들지 않는다 |
| Stage 3~8 scenario key(`offline-cached-card`, `invalid-transition`, `analysis-*`, `report-*` …) | 각 Stage | API_CONTRACTS §5.4 최초 FE Stage |
| 가값 P-01 · P-02 · P-04 · P-05 · P-16 **확정** | Stage 2 QA 후 재제시 | stage-1-approvals §9.2·§9.4-3 — §17.3 |

### 3.2 Backend 구현 항목 (이 프로젝트에서 구현하지 않음)

`apps/api/`, `supabase/migrations`, `supabase/seed`, RLS Policy, Storage Server Logic, Express route/controller/service/repository, STT/AI Backend, Analysis Worker, Background/Cron Job, Render Backend 배포, Production DB schema 적용 — 전부 **생성 금지** (CLAUDE.md Development Scope, rules/backend.md §1).

Stage 2는 Stage 1과 달리 **[HO] 항목이 다수 발생한다** (§10). Backend는 `packages/contracts` 와 `docs/API_CONTRACTS.md` 로만 표현하고, 실제 동작 검증은 `BACKEND_INTEGRATION_PENDING` 으로 기록한다.

---

## 4. Dependencies

| 구분 | 항목 | 상태 |
|---|---|---|
| 선행 Stage | Stage 1 QA Verdict `PASS (accepted: D-01, S1-G-2)` (2026-09-21) | **완료** |
| 선행 Stage | 가값 승인 절차 완료 — 확정 11건(P-03·P-06~P-09·P-11~P-15 + P-10) / 잔여 5건(P-01·P-02·P-04·P-05·P-16) | **완료** (2026-09-22 · P-10은 2026-09-23) |
| 선행 결정 | #7 Capacitor Stage 4 · #9 Stack 외 라이브러리 · #13 Capability 키 · #14 표시 라벨 · #15 내비게이션 · #19 Capability 색 · #21 아이콘 · #22 공통 상태 · #27 Supabase JS Client 미사용 · **#33 착지 화면** · C-1~C-13 · C-16 · C-17 · D-01~D-04 | **완료** |
| 선행 구현 | `packages/contracts` common 5 · enum 23 · rules 3 · health / Shared UI 22종 / `apps/web` router·layout·providers·Mock 인프라 | **완료** (Stage 1) |
| 디자인 | **Figma 누락 화면 13건 — C-13 절차 필요** (§15.1). Orchestrator가 화면마다 ① 디자이너 Figma 요청 ② design-agent 명세 중 선택을 사용자에게 묻고 **승인 후에만** 디자인·구현 | **승인 필요 — design 단계 진입 조건** |
| 디자인 | design-agent 문서 갱신 잔여 7항목 (Design Spec §2.2 · §3.6 · §4.19 · §8.1 · §9.3 · §10.3, `COMPONENT_MAP.md`) | **design 단계 전 처리 필요** (§17.1) |
| 디자인 | 가값 P-01 · P-02 · P-04 · P-05 · **P-16** — Stage 2 화면에서 실사용. P-16(medallion sm/md/lg)은 approvals §9.2가 "CharacterMedallion 이 Stage 2 이므로 그때 design-agent 실측 후 확정"으로 명시 | 차단 아님 — §17.3 |
| 에셋 | 캐릭터 일러스트·medallion(`179:1703/1704` · `179:1750/1751` · `179:1819` · `179:1822/1823`) SVG/래스터 export. 권리 확보됨(C-17). Stage 1 D-4 파이프라인(AVIF+WebP+PNG, 1x/2x/3x) 적용 | 차단 아님 |
| 에셋 | **Google 공식 브랜드 로고 · Apple 로그인 공식 가이드 버튼** — 공식 에셋·가이드 준수 필요(rules/frontend §1 "브랜드 로고는 공식 에셋만") | §16 D-15 — 확인 필요 |
| 법무 | **L-01** VPC 방식 · **L-02** 파일럿 동의 필수/선택·문구 · **L-07** 아이 성(last name) 수집 적합성 | **미결 — 차단 아님**. Frontend는 슬롯·서버 값(`required`)·가문구로 진행 (§14) |
| 법무 | L-03 동의 철회 미제공 · L-04 대비 수용 예외 · L-05 · L-06 | 미결 — Stage 2 무관 또는 Handoff 기록 |
| 미결정 사항 | §16 D-1 ~ D-17 — 이 Plan이 권장안과 기각 사유를 제시하며 승인 체크포인트에서 O/X | **승인 필요** |

**Blocking decisions (Stage 2 착수를 실제로 차단하는 항목)**

- **Plan 작성 단계: 없음.** PLANNING §5 Stage 2 "Blocking decisions: 없음 (Stage 2 전 결정 C-1~C-18·#33 완료)".
- **Design 단계: 있음 — C-13 화면별 디자인 소스 선택 13건**(§15.1). 이것은 결정 C-13이 정한 정규 절차이며, 승인 전에는 누락 화면을 디자인·구현하지 않는다. Orchestrator가 승인 체크포인트에서 함께 묻는다.
- **구현 단계: 있음 — §16 D-2**(한 역량 전부 결측 시 처리)**와 D-6**(프로필 결과 Guard 단계). 둘은 contract·Guard 동작을 바꾸므로 구현 착수 전에 O/X가 필요하다. 나머지 D 항목은 권장안대로 진행 가능하다.

---

## 5. Frontend Architecture Impact

Stage 2는 ARCHITECTURE의 **인증·동의·Guard 경로를 처음 실체화**한다. 새로운 구조 결정은 §16 외에는 없다.

### 5.1 Route Guard — Stage 1 shell → 실제 판정 (ARCHITECTURE §2.4)

```
resolveGuardDecision(me, location) : GuardDecision        ← 순수 함수, 전수 단위 테스트 (§16 D-5)
  me === undefined (미해결)                          → { status: 'pending' }
  unauthenticated                                    → /auth/welcome   (단, /auth/* 와 /onboarding/* = Trial 허용)
  authenticated && consentStatus.missing.length > 0  → /auth/consent
  consented && parentVerification.status ∈ {pending, failed} → /auth/verify-parent
  consented && onboardingStatus !== 'completed'      → /onboarding/:step  (currentStep)
  onboardingStatus === 'completed'                   → 요청 경로 허용 (착지 = `/` Home skeleton, #33)
```

- `RouteGuard` **컴포넌트 자체는 Stage 1 그대로** 둔다(`useDecision` 주입 지점 유지). 교체 대상은 `useGuardDecision` 구현뿐이다.
- ARCHITECTURE §2.4의 "**onboarding complete && profile result 미확인 → `/onboarding/profile`**" 단계는 `MeResponse` 에 대응 필드가 없다 → **§16 D-6** 에서 처리(권장: Guard 판정에서 제외하고 제출 흐름의 연속 네비게이션으로 처리).
- Trial(C-12)은 **미인증 상태의 `/onboarding/*` 접근을 허용**해야 하므로, Guard의 "미인증 → `/auth/*`" 규칙에 `/onboarding/*` 예외가 들어간다. 이것은 ARCHITECTURE §2.4 1행 괄호("또는 Trial `/onboarding/*`")와 일치한다.
- 무한 리다이렉트 방지: 판정 결과가 현재 경로와 같으면 `allow` 를 반환한다(순수 함수에서 처리, 단위 테스트 대상).

### 5.2 AuthGateway — Provider 경계 (ARCHITECTURE §7.2, #27)

```
UI/Feature → useSignUp / useSignIn / useSignOut (features/auth)
           → AuthGateway (shared/auth interface)
           → MockAuthGateway (mocks/auth)              ← Stage 2
           ( SupabaseWebAuthGateway — 미구현, 연동 시점 )
```

- `AuthGateway` 는 **HTTP API가 아니다**. `shared/api/types.ts` 의 `ApiClients` 와 **별도 provider**(`AuthProvider`)로 주입하되, **선택 지점은 `app/providers` 한 곳**이라는 규칙은 동일하게 적용한다 (ARCHITECTURE §2.3).
- 토큰: `AuthGateway.getSession()` 이 반환하는 access token을 `httpClient` 의 `Authorization` 주입 훅에 연결한다. `AUTH_TOKEN_EXPIRED` 수신 시 **1회** refresh 후 재시도(Gateway 책임), 2회 실패 시 signOut + `/auth/log-in`.
- Component·Page·Query hook은 `MockAuthGateway` 를 직접 import하지 않는다 (QA grep 대상).

### 5.3 로컬 저장소 경계 — Trial draft (ARCHITECTURE §5 · §7.4, C-12)

```
features/onboarding-survey
  ├─ OnboardingDraftStore (shared/lib/onboarding-draft)   ← 기기 로컬 전용, 아동 데이터
  │    write: 입력 변경 debounce (§16 D-11)
  │    read : 앱 기동 시 1회 (schemaVersion·만료 검사)
  │    clear: submit 성공 · 로그아웃 · schemaVersion 불일치 · 보관 상한 경과
  └─ useOnboardingState / useSaveOnboardingStep (동의 후, 서버 draft)
```

- draft 값은 `OnboardingDraftSchema` 로 **읽을 때·쓸 때 모두 parse** 한다. parse 실패 = 손상 → 폐기 + 안내.
- **draft는 아동 데이터다.** 동의 기록 전 어떤 endpoint로도 전송하지 않으며, 로그아웃 시 삭제한다 (ARCHITECTURE §13 "로컬 데이터"). 저장소·보관 상한은 §16 D-3.
- 비밀번호는 draft에도 Query 캐시에도 넣지 않는다 (form state로만 존재, 제출 후 즉시 폐기).

### 5.4 Feature 경계 (rules/architecture §3 — `features/A → features/B` 금지)

| feature | 책임 | 조합 지점 |
|---|---|---|
| `features/auth` | 가입·로그인·재설정 폼, SocialAuthButtons, 세션 상태 구독 | pages |
| `features/consent` | GuardianConsentForm(5항목), 문서 버전 수집, VpcStep 슬롯 | pages |
| `features/onboarding-survey` | 5단계 위저드, step 네비게이션, 로컬/서버 draft, submit | pages |
| `features/child-profile` | ProfileResultView, PersonaCard 조립, GrowthCapabilityPicker | pages |
| `features/settings` | SettingsMenu(로그아웃), 로컬 정리 오케스트레이션 | pages |

- 로그아웃 시 "`AuthGateway.signOut()` + draft 삭제 + Query 캐시 초기화"는 `features/settings` 가 `features/auth` 를 import하지 않도록 **`shared/lib/session-cleanup.ts`** 에 둔다 (순수 함수 + 주입).
- `entities/*`: `me` · `onboarding` · `child` · `book`(검색 최소) — query key factory + query/mutation hook + 순수 표시 컴포넌트.

### 5.5 Privacy (Architecture Requirement, ARCHITECTURE §13 — Stage 2 해당분)

| 통제 | Stage 2 Frontend 책임 (검증 가능) |
|---|---|
| **동의 기록 전 아동 데이터 미전송** | Mock Adapter가 모든 요청을 기록하고, 동의 성공 이전 구간의 요청 목록에 아동 필드가 0건임을 테스트로 증명 (AC-2-13). Mock은 동의 없는 `child_info` 저장을 `CONSENT_REQUIRED` 로 거부 |
| 가입 요청에 아이 필드 없음 | `SignUpWithEmailInputSchema.strict()` — 추가 키는 parse 실패 (AC-2-05) |
| 최소 수집 | Step 1 입력 항목을 PRD §7.2 + C-5~C-7 범위로 제한. `lastName` 필수 여부는 §16 D-1(권장: 선택) |
| 호칭 | 화면·알림 문구에 `lastName` 사용 금지 — copy 모듈에서 `firstName` 만 노출 (grep 대상) |
| 로그 PII 금지 | 아이 이름·보호자 이메일·비밀번호·토큰·동의 증빙을 `logger`·`devWarn`·에러 바운더리 로그에 넣지 않음 |
| 로컬 데이터 | Trial draft 삭제 시점 고정(§16 D-3), 로그아웃 시 draft·Query 캐시 정리 |
| Secret 미노출 | `.env.example` 에 신규 키 추가 없음. OAuth client id·secret을 Frontend에 두지 않는다(Mock은 값 불필요) |
| 제3자 SDK 없음 | 신규 런타임 의존 0건 권장 (§16 D-15) |

**Backend Handoff 요구사항(문서화만)**: 서버 측 동의 강제, `consent_events` append-only, VPC 기록, RLS, audit log — §10.

### 5.6 Stage 1 이월 구조 수정

| 항목 | 수정 내용 | 결정 |
|---|---|---|
| `useScrolledPast` | `window` 스크롤이 아니라 **AppShell 뷰포트 컨테이너**를 구독. Stage 2에서 TopBar가 실사용되므로 이번에 고친다 | §16 D-13 |
| 시각 비교 임계값 | 전체 프레임 baseline의 `maxDiffPixels: 200` 이 작은 요소 변경을 놓친다 → **영역 클립 baseline** 도입 | §16 D-12 |
| `provisionalItems.ts` | 16항목 → 남은 **5건**(P-01·P-02·P-04·P-05·P-16)으로 축소 | §17.2 |
| `QA-1-002` TextField `trailingAction` 밑줄 | Stage 2 Auth 화면이 실사용 → 이번에 결정 | §16 D-14 |

---

## 6. Data Requirement Delta (Backend Handoff용 — 구현 아님)

Stage 2는 `docs/DATA_MODEL.md` §5·§6에 이미 초안이 있다. 이 Plan은 **새 테이블을 추가하지 않고**, Stage 2 Contract가 요구하는 소유권·제약·보관 조건을 확정 대상으로 정리한다. 실제 migration·RLS는 Backend Developer 몫이다.

| 대상 (DATA_MODEL) | Stage 2 Contract가 요구하는 것 | 라벨 |
|---|---|---|
| `caregiver_profiles` | `display_name`(가입 시 `caregiverName`), `relationship`(Step 1 — `CaregiverRelationship` 7값), `timezone`(클라이언트 `Intl` 감지값 전송 — §16 D-16), `plan='free'` 가입 시 부여(§7.1), `onboarding_status` 3값, `created_via` 3값, `parent_verification_status` 4값 | RECOMMENDED |
| `consent_documents` | `is_required` 를 **서버가 내려주는 값**으로 Frontend 화면이 그려진다 → 문서 버전별 `required` 가 반드시 API에 노출되어야 한다. `pilot_participation` 의 값은 법무 L-02 결과 | **CONFIRMED (C-1)** / 값은 L-02 |
| `consent_events` | append-only, `action='granted'` 만(C-4), `consent_document_id` 로 **항목별 문서 버전** 기록, `source` = `signup_email` \| `signup_oauth` \| `settings` \| `reconsent`, `method`(checkbox 또는 VPC 코드). 필수 동의 3종 유효 전 R1 아동 데이터 쓰기 거부 | **CONFIRMED (C-1·C-2·C-4)** / `source` enum 화는 §16 D-16 관련 **보고 ④** |
| `children` | `caregiver_id` **UNIQUE**(MVP 1명) → 위반 시 `CHILD_LIMIT_REACHED`. `first_name` 필수, `last_name` 필수 여부 = §16 D-1(권장: nullable), `birth_year_month` date(일=1), `gender` nullable 3값, `language_environment` · `reading_routine` · `topic_tags` · `growth_goals` · `current_growth_capability`. **동의 기록 후에만 생성** | **CONFIRMED (C-5·C-6·C-7·C-10)** / `last_name` NULL 허용은 RECOMMENDED |
| `survey_instruments` / `survey_items` | `baseline_v1` 1개 · version · `stem` · scale 6단계 · items 10개(`ER1`,`ER2`,`AG1`~`AG3`,`CF1`,`CF2`,`IM1`~`IM3`) · `capability` 매핑 · `order` · `prompt_text`. **문항 문구를 Frontend에 하드코딩하지 않는다** → instrument 응답으로 내려와야 한다 | **CONFIRMED (C-8, D-04)** |
| `onboarding_responses` | step 5값, `answers` jsonb = step별 contracts schema, `status` draft\|submitted, `administered_at_phase='onboarding'`. **Trial 구간은 서버 행이 생기지 않는다**(로컬 draft) | **CONFIRMED (C-9·C-12)** |
| `capability_snapshots` / `capability_scores` | `source='onboarding_survey'`, `scoring_version`, score `numeric(2,1)` **NULL 허용**(한 역량 전부 결측), `item_count`, `missing_count`. 산식 = 응답 문항 평균(`not_observed` 제외) | **CONFIRMED (C-8)** / NULL 표시 규칙 = §16 D-2 |
| `personas` | `name` · `description` · `template_id` · `generation_mode`(template_only \| llm_slot \| fallback_pool) · `safety_status`(passed \| replaced_by_fallback) · `is_current`. Frontend는 `generation_mode`/`safety_status` 를 화면에 직접 노출하지 않고 **fallback 여부 표현만** 필요 | RECOMMENDED |
| `growth_capability_selections` | insert-only, `selected_by` = `system_suggested` \| `caregiver_changed`, `snapshot_id` | RECOMMENDED |
| **신규 요구 (Stage 2에서 확정)** | ① Idempotency 결과 보관 24h — `POST /v1/consents`, `POST /v1/onboarding/submit` ② `children` 1명 제약의 에러 코드 매핑 ③ Trial draft는 **서버에 존재하지 않는다**는 사실을 Backend가 전제해야 함(제출 시 5단계 전체가 한 번에 도착) | RECOMMENDED |

**보관·삭제 요구 (Handoff)**: `consent_events` 는 append-only로 보존(동의 이력 = PRD §12.1), `children`·`onboarding_responses` 는 전체 삭제 요청(Stage 8, FR-21) 대상에 포함. 로컬 draft는 Frontend 책임(§16 D-3).

`docs/DATA_MODEL.md` 자체는 이 Plan 승인 후 §5·§6의 미결 표기(“필수 여부는 Stage 2 Plan”, “한 역량 문항이 모두 결측일 때 처리는 Stage 2 Plan”)를 D-1·D-2 결과로 갱신한다.

---

## 7. API Contract Delta

### 7.1 `packages/contracts` Stage 2 범위 ↔ `docs/API_CONTRACTS.md` 1:1 대응

Stage 1에서 이미 있는 것: `common/*` 5 · `enums/*` 23 · `rules/session-transitions` · `rules/recording-limits` · `rules/report-eligibility` · `health/*`. **Stage 2는 여기에 도메인 schema를 더한다.**

| contracts 경로 (신규) | 내용 | API_CONTRACTS 근거 | 라벨 |
|---|---|---|---|
| `src/auth/session.ts` | `AuthSessionSchema`(accessToken, refreshToken?, expiresAt, userId), `AuthResultSchema`, `AuthProviderSchema` = `google` \| `apple` | ARCHITECTURE §7.2 (시그니처 RECOMMENDED) | RECOMMENDED |
| `src/auth/sign-up.ts` | `SignUpWithEmailInputSchema` = `{ caregiverName(1–60), email, password(≥8) }.strict()` — **아이 필드 없음** | §3.4 코드블록 | **CONFIRMED (C-5)** |
| `src/auth/sign-in.ts` | `SignInWithEmailInputSchema`, `RequestPasswordResetInputSchema`, `UpdatePasswordInputSchema` | §4 Stage 2 (AuthGateway) | RECOMMENDED |
| `src/me/me.ts` | `MeResponseSchema` = `{ caregiver{id, displayName, relationship?, timezone, plan}, consentStatus{required[], missing[]}, parentVerification{status}, onboardingStatus, child?{id, firstName}, plan }` | §4 Stage 2 `GET /v1/me` → `Me` | RECOMMENDED (필드 구성) |
| `src/me/update-caregiver.ts` | `UpdateCaregiverRequestSchema` = `{ displayName?, relationship?, timezone? }` | §4 Stage 2 `PATCH /v1/me` → `UpdateCaregiver` | RECOMMENDED |
| `src/consent/documents.ts` | `ConsentDocumentSchema` = `{ type, documentId(uuid), version, required, title, url }`, `CurrentConsentDocumentsSchema` = `{ documents[] }` | §3.4 코드블록 · §4 Stage 2 | **CONFIRMED (구조 C-1)** / `required` 값은 L-02 |
| `src/consent/record.ts` | `RecordConsentsRequestSchema` = `{ items[{type, documentId, action:'granted'}], source }`, `ConsentStatusSchema` = `{ required[], missing[], grantedAt }` | §4 Stage 2 `POST /v1/consents` → `RecordConsents` / `ConsentStatus` | **CONFIRMED (C-1·C-4)** / 필드명 RECOMMENDED |
| `src/enums/consent-source.ts` | `ConsentSourceSchema` = `signup_email, signup_oauth, settings, reconsent` | DATA_MODEL §5 `consent_events.source` — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/enums/onboarding-status.ts` | `OnboardingStatusSchema` = `not_started, in_progress, completed` | DATA_MODEL §5 `caregiver_profiles.onboarding_status` — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/enums/plan.ts` | `PlanSchema` = `free` (결제는 FR-26 P2) | PRD §7.1 "가입 완료 시 Free 플랜 자동 부여" — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/onboarding/child-info.ts` | `ChildInfoAnswersSchema` = `{ firstName(1–40), lastName(≤40, 필수 여부 D-1), birthYearMonth(YYYY-MM), gender: Gender \| null, languageEnvironment[], readingRoutine }` + `createBirthYearMonthSchema(now)`(3~9세 refine, D-10) | §3.4 코드블록 (나머지 필드 "Stage 2 Plan" 위임) | **CONFIRMED (C-5·C-6·C-7·C-10, D-03)** / 나머지 필드·길이 RECOMMENDED |
| `src/onboarding/temperament.ts` | `TemperamentAnswersSchema` — 카드 선택형(활동성·낯가림·집중 성향·선호 활동) | PRD §7.2 Step 2 (§3.4 `z.unknown()` → Stage 2 Plan 확정) | RECOMMENDED |
| `src/onboarding/books.ts` | `BooksAnswersSchema` = `{ favoriteBooks[≤5]{bookId? \| title}, homeBooks[]{title}, topicTags[] }` | PRD §7.2 Step 3 ("DB에 없으면 제목 텍스트 저장") | RECOMMENDED |
| `src/onboarding/goals.ts` | `GoalsAnswersSchema` = `{ growthGoals[] }` | PRD §7.2 Step 4 | RECOMMENDED |
| `src/onboarding/survey.ts` | `SurveyItemSchema`(itemCode `^(ER\|AG\|CF\|IM)\d$`, capability, order, prompt), `SurveyInstrumentSchema`(code `baseline_v1`, version, stem, scaleLabels **length 6**, items **length 10**), `CapabilityItemAnswerSchema`, `CapabilityItemsAnswersSchema`(answers ≤10) | §3.4 코드블록 | **CONFIRMED (C-8, D-04)** / 필드명 RECOMMENDED. `SurveyAnswerValue` 는 Stage 1 `enums/survey.ts` 재사용 |
| `src/onboarding/state.ts` | `OnboardingStateSchema` = `{ instrument, steps[5], draftAnswers, currentStep }` | §4 Stage 2 `GET /v1/onboarding` → `OnboardingState` | RECOMMENDED |
| `src/onboarding/save-step.ts` | `SaveOnboardingStepRequestSchema` — `step` 기준 discriminated union(`child_info` → `ChildInfoAnswers`, `capability_items` → `CapabilityItemsAnswers` 일부 허용 …) | §4 Stage 2 `PUT /v1/onboarding/steps/:step` | RECOMMENDED |
| `src/onboarding/submit.ts` | `SubmitOnboardingRequestSchema`(5단계 전체, capability 10문항 전부), `ProfileResultSchema` = `{ child, snapshot{scores[4]}, persona, suggestedCapability }` | §4 Stage 2 `POST /v1/onboarding/submit` → `SubmitOnboarding` / `ProfileResult` | **CONFIRMED (흐름 C-9·C-12)** / 필드 RECOMMENDED |
| `src/onboarding/draft.ts` | `OnboardingDraftSchema` = `{ schemaVersion: 1, instrumentCode, currentStep, answers{…}, updatedAt }` — **로컬 전용, HTTP 아님** | §3.4 코드블록 (보관 상한·삭제 시점 "Stage 2 Plan" → §16 D-3) | **CONFIRMED (C-12)** / 구조 RECOMMENDED |
| `src/rules/capability-score.ts` | `scoreCapabilities(items, answers)` → `{ capability, score(1.0–5.0 \| null), itemCount, missingCount }[]` — `not_observed`·미응답 제외, 소수 1자리 반올림 | §3.4 코드블록 · §4 Stage 1 note("`rules/capability-score` 는 Stage 2") | **CONFIRMED (산식 C-8)** / 반올림·null 처리 = §16 D-2 |
| `src/children/snapshot.ts` | `CapabilityScoreSchema`(capability, score nullable, itemCount, missingCount), `CapabilitySnapshotSchema`(id, source, scoringVersion, createdAt, scores[4]) | §4 Stage 2 `ProfileResult.snapshot` · DATA_MODEL §6 | RECOMMENDED |
| `src/children/persona.ts` | `PersonaSchema` = `{ id, name, description, isFallback, createdAt }` | §4 Stage 2 `ProfileResult.persona` · FR-05 | RECOMMENDED |
| `src/children/profile.ts` | `ChildProfileSchema` = `{ child, latestSnapshot, strengths[2], growingEdges[2], persona, growthCapability }` | §4 Stage 2 `GET /v1/children/:childId/profile` → `ChildProfile` | RECOMMENDED |
| `src/children/growth-capability.ts` | `SetGrowthCapabilityRequestSchema` = `{ capability }` | §4 Stage 2 `PUT /v1/children/:childId/growth-capability` | **CONFIRMED (FR-06)** / 필드 RECOMMENDED |
| `src/books/search.ts` | `BookSummarySchema` = `{ id, title, author, coverUrl? }` — Step 3 검색 **최소 형태** | §4 Stage 2 `GET /v1/books/search` → `Paginated<BookSummary>` | RECOMMENDED — 범위는 §16 D-17 |
| `src/index.ts` (수정) | 신규 도메인 re-export (deep import 금지) | ARCHITECTURE §1.2 | CONFIRMED |

**Stage 2에서 하지 않는 contracts 작업**: `§3.2 CreateSession*`(Stage 4), `§3.3 RecordingUpload*`(Stage 4), `ConsentHistory`(Stage 8), `LibraryBook`·`BookPrompts`·`GiftRequest`(Stage 3), `HomeSummary`·`ActivityCard`(Stage 3), `CapabilitySnapshot` **목록** endpoint(Stage 6/7).

### 7.2 Endpoint Delta

| Method | Path | Request | Response | Key errors | 인증 | IK | CG | Stage 2 |
|---|---|---|---|---|---|---|---|---|
| GET | `/v1/me` | — | `Me` | `AUTH_REQUIRED`, `AUTH_TOKEN_EXPIRED` | 필요 | — | — | **In** |
| PATCH | `/v1/me` | `UpdateCaregiver` | `Me` | `VALIDATION_FAILED` | 필요 | — | — | **In** (Step 1 관계 · timezone — §16 D-16) |
| GET | `/v1/consent-documents/current` | — | `CurrentConsentDocuments` | `INTERNAL_ERROR` | **공개** | — | — | **In** |
| POST | `/v1/consents` | `RecordConsents` | `ConsentStatus` | `CONSENT_VERSION_OUTDATED`, `VALIDATION_FAILED`, `IDEMPOTENCY_KEY_REUSED` | 필요 | **필수** | — | **In** |
| GET | `/v1/onboarding` | — | `OnboardingState` | `CONSENT_REQUIRED`, `AUTH_REQUIRED` | 필요 | — | — | **In** |
| PUT | `/v1/onboarding/steps/:step` | `SaveOnboardingStep` | `OnboardingState` | `CONSENT_REQUIRED`, `VALIDATION_FAILED` | 필요 | — | — | **In** |
| POST | `/v1/onboarding/submit` | `SubmitOnboarding` | `ProfileResult` | `CONSENT_REQUIRED`, `ONBOARDING_INCOMPLETE`, `CHILD_LIMIT_REACHED`, `PROVIDER_UNAVAILABLE`(→ fallback persona로 200), `IDEMPOTENCY_KEY_REUSED` | 필요 | **필수** | — | **In** |
| GET | `/v1/books/search?q=&limit=&cursor=` | — | `Paginated<BookSummary>` | `VALIDATION_FAILED` | 필요 | — | — | **In** (최소 — §16 D-17) |
| GET | `/v1/children/:childId/profile` | — | `ChildProfile` | `CHILD_NOT_FOUND`, `FORBIDDEN` | 필요 | — | — | **In** |
| PUT | `/v1/children/:childId/growth-capability` | `SetGrowthCapability` | `ChildProfile` | `CHILD_NOT_FOUND`, `VALIDATION_FAILED` | 필요 | — | — | **In** |
| — | VPC 단계 (C-3) | — | — | — | — | — | — | **Contract 미정의** — `Me.parentVerification.status` + Mock 슬롯만. 방식 = 법무 L-01 |
| GET | `/v1/consents` | — | `ConsentHistory` | — | 필요 | — | — | **Out → Stage 8** (C-19 선택 기능) |
| PATCH | `/v1/children/:childId` | `UpdateChild` | `ChildProfile` | — | 필요 | — | — | **Out → Stage 6** |
| GET | `/v1/children/:childId/capability-snapshots` \| `/personas` | cursor | `Paginated<…>` | — | 필요 | — | — | **Out → Stage 6·7** |

- **인증(AuthGateway)** 은 HTTP endpoint가 아니다. **9 메서드**: `getSession` · `onChange` · `signUpWithEmail` · `signInWithEmail` · `signInWithProvider` · `requestPasswordReset` · `updatePassword` · `refreshSession` · `signOut` (ARCHITECTURE §7.2). `refreshSession()` 은 만료 토큰을 갱신하고 갱신 불가 시 `null` 을 반환하며, AC-2-07(세션 갱신)을 Gateway 책임으로 구현하는 지점이다. <br>동기화 근거: `2-AUTH` 구현(2026-09-25) · `docs/qa/stage-2-auth-handoff.md` — 실제 구현 `apps/web/src/shared/auth/AuthGateway.ts` 기준으로 §2.1 · AC-2-06(9 메서드)과 일치시켰다.
- **동의 가드(CG)** 가 붙는 endpoint는 Stage 4(녹음 시작·업로드)부터다. Stage 2는 `CONSENT_REQUIRED` 를 **온보딩 쓰기 경로**에서 사용한다 (ARCHITECTURE §7.3.1-3).
- Http Adapter는 Stage 1 D-7 결정대로 **Mock과 동시에 골격을 작성**한다. 실제 서버 연동 검증은 `BACKEND_INTEGRATION_PENDING`(§10).

### 7.3 contracts 사용 규약 (Stage 1에서 고정, Stage 2도 동일)

- 타입은 `z.infer` 로만 파생. `apps/web` 에 같은 모양 재선언 금지 (QA grep).
- 응답 schema는 Zod 기본 `strip`. **요청 schema 중 `SignUpWithEmailInput` 만 `.strict()`** — 아이 필드 혼입을 parse 단계에서 차단하기 위한 의도적 예외 (AC-2-05).
- Mock/Http **양쪽** Adapter가 요청·응답을 parse. 실패는 `VALIDATION_FAILED` Error Envelope으로 변환.
- `packages/contracts` 런타임 의존은 `zod` 하나. `createBirthYearMonthSchema(now)` 처럼 시간이 필요한 검증은 **clock을 인자로 받는 팩토리**로 만들어 순수성을 유지한다 (§16 D-10).
- Error Code는 Stage 1의 28종을 그대로 쓴다. **신규 코드 추가 없음.**

---

## 8. Mock Scenarios

**machine key의 유일한 기준은 `docs/API_CONTRACTS.md` §5.4 Catalogue 다.** 아래 표의 key는 전부 catalogue에 존재하는 값이며, 신규 key를 만들지 않는다. deprecated alias(`default`·`slow`·`active-session-exists` …) 사용 금지.

### 8.1 Scenario 그룹 (Stage 1 `health` 에 Stage 2 그룹 5개 추가)

| 그룹 key | 대상 | §5.3 행 |
|---|---|---|
| `auth` | `AuthGateway`(Mock) | me / consents / auth(AuthGateway) |
| `me` | `GET /v1/me`, `PATCH /v1/me` | 〃 |
| `consents` | `GET /v1/consent-documents/current`, `POST /v1/consents` | 〃 |
| `onboarding` | `GET /v1/onboarding`, `PUT …/steps/:step`, `POST …/submit` | onboarding / children profile |
| `children` | `GET /v1/children/:childId/profile`, `PUT …/growth-capability` | 〃 |
| `books` | `GET /v1/books/search` | library / books / gift-requests (**Stage 2로 당김 — §16 D-17, 보고 ⑤**) |

### 8.2 Stage 2 필수 scenario (§5.4 catalogue)

| Machine key | 적용 그룹 | Mock 동작 | 검증 대상 화면·상태 |
|---|---|---|---|
| `success` | 전체 | contracts parse를 통과하는 성공 fixture | 정상 경로 |
| `loading` | 전체 | 주입 timer 지연 | 버튼 loading, 문서 로딩 Skeleton, **persona 생성 대기 ≤3s**(FR-05) |
| `error` | 전체 | Error Envelope (그룹별 code 지정 가능) | ErrorState + Retry, 폼 필드 에러(`VALIDATION_FAILED`) |
| `retry` | 전체 | 1회차 `error` → 2회차 `success` | 재시도 UX + **입력 보존** |
| `empty` | `books` | `items: []` | Step 3 검색 결과 없음 → **제목 직접 입력 경로**(PRD §7.2 규칙) |
| `offline` | 전체 | Adapter가 network error throw | Offline Banner(InlineAlert tone=offline) |
| `token-expired` | `auth`, `me` | `AUTH_TOKEN_EXPIRED` → refresh 1회 후 성공 | 무중단 재시도, 2회 실패 시 `/auth/log-in` |
| `provider-cancelled` | `auth` | 소셜 로그인 취소 | 오류 화면이 아니라 Welcome 유지 + 안내 |
| `consent-missing` | `me`, `consents`, `onboarding` | `CONSENT_REQUIRED` + `Me.consentStatus.missing` 비어 있지 않음 | Guard → `/auth/consent`, 동의 전 `child_info` 저장 시도 거부 |
| `consent-version-outdated` | `me`, `consents` | `CONSENT_VERSION_OUTDATED` | 재동의 화면 |
| `vpc-pending` | `me`, `onboarding` | `parentVerification.status='pending'` | Guard가 `/auth/verify-parent` 슬롯에 머묾 |
| `vpc-failed` | `me`, `onboarding` | `parentVerification.status='failed'` | 실패 안내·재시도 경로, **온보딩 진입 차단(아동 데이터 쓰기 0건)** |
| `onboarding-incomplete` | `me`, `onboarding` | `onboardingStatus != completed` | Guard → `/onboarding/:step` |
| `draft-resume` | `onboarding` | `OnboardingState.currentStep = n` | 중도 이탈 후 동일 step 복귀 |
| `persona-fallback` | `onboarding`(submit), `children` | `PROVIDER_UNAVAILABLE` → fallback 페르소나로 **200** | PersonaCard fallback 표시(오류 화면 아님) |
| `child-limit-reached` | `onboarding`(submit) | `CHILD_LIMIT_REACHED` | 안내 화면 |
| `capability-all-missing` | `onboarding`(submit), `children` | 한 역량 문항 전부 `not_observed` → 해당 역량 `score: null` | 프로필·다이아몬드 표시 규칙(§16 D-2) |

**총 17 key** (공통 6 + 특화 11). 전부 catalogue 기존 값이며 최초 FE Stage가 1 또는 2다.

### 8.3 Mock API가 아닌 검증 (§5.4 "Key로 만들지 않는 것")

| 항목 | 검증 방법 |
|---|---|
| **Trial 로컬 draft** (C-12) | scenario key가 아니라 **로컬 저장소 테스트** — 저장/복원/만료/schemaVersion 불일치/삭제 시점 (§16 D-3) |
| Idempotency-Key 재생 | 같은 key + 같은 body **replay 테스트** (`POST /v1/consents`, `POST /v1/onboarding/submit`) |
| 단일 error code 재현(`VALIDATION_FAILED` 필드 에러, `CHILD_NOT_FOUND`, `FORBIDDEN`) | `error` + code 지정 |
| 필수 동의 미체크 | 서버 왕복 없이 **클라이언트 disabled 상태** — 컴포넌트 테스트 |

### 8.4 Stage 2에서 만들지 않는 scenario

`offline-cached-card` · `conversation-only-option` · `reread-option` · `books-exhausted` · `session-already-active` · `gift-pending` · `gift-duplicate` · `user-entered-book` · `push-permission-denied` · `invalid-transition` · `mic-permission-denied` · `auto-timeout` · `crash-recovered` · `recording-interrupted` · `abandoned` · `upload-*` · `recording-*` · `reflection-*` · `analysis-*` · `cold-to-warm` · `persona-changed` · `difficulty-lowered` · `report-*` · `pdf-generating` · `clip-expired` · `share-cancelled` · `deletion-*` — **정의도 fixture도 만들지 않는다**.

`books` 그룹의 `user-entered-book` · `gift-pending` · `gift-duplicate` 는 Stage 3다. Stage 2는 같은 그룹의 공통 5종(`success`·`loading`·`empty`·`error`·`retry`)만 쓴다.

### 8.5 Scenario 전환 (Stage 1 D-5 방식 유지)

- 조합 표기 `?scenario=<group>:<key>[,…]`, 우선순위 **URL > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`**.
- 결정성: 주입된 `clock`·`idFactory`·timer만 사용. `Date.now()`/`Math.random()` 직접 호출 금지.
- **Stage 2 신규 요구**: `capability-all-missing` 과 `persona-fallback` 은 submit 응답을 바꾸므로, 같은 key로 반복 실행 시 **동일 점수·동일 페르소나 문구**가 나와야 한다 (AC-2-50).

---

## 9. Frontend Scope — Deliverables

> 상세 UI(variant·state·치수·토큰 매핑·누락 화면 레이아웃)는 design-agent `docs/design/stage-2-design-spec.md` 가 확정한다. 아래는 **존재해야 할 것의 목록**이다.

### 9.1 Route 표 (PLANNING §9.2 slug 확정)

| path | Page | Layout | Guard | Figma |
|---|---|---|---|---|
| `/auth/welcome` | `WelcomePage` | Fullscreen | 미인증 전용 | `179:1701` |
| `/auth/sign-up` | `SignUpPage` | Fullscreen | 미인증 전용 | `179:1724` (아이 섹션·단일 체크박스 **제외**) |
| `/auth/log-in` | `LogInPage` | Fullscreen | 미인증 전용 | `179:1820` |
| `/auth/forgot-password` | `ForgotPasswordPage` | Fullscreen | 미인증 전용 | **없음 — C-13** |
| `/auth/reset-password` | `ResetPasswordPage` | Fullscreen | 미인증 전용 | **없음 — C-13** |
| `/auth/consent` | `GuardianConsentPage` | Fullscreen | 인증 필요 | **없음 — C-13** |
| `/auth/verify-parent` | `ParentVerificationPage` (VPC 슬롯) | Fullscreen | 동의 완료 | **없음 — C-13** |
| `/onboarding` | `OnboardingIntroPage` | Fullscreen | **Trial 허용** | `179:1748` |
| `/onboarding/:step` | `OnboardingStepPage` (`child-info`·`temperament`·`books`·`goals`·`capability-items`) | Fullscreen | **Trial 허용** | `179:1740`(Step 1 일부) · `179:1770`(Step 5) / 나머지 **없음 — C-13** |
| `/onboarding/saved` | `OnboardingSavedPage` | Fullscreen | 인증+동의 | `179:1809` |
| `/onboarding/profile` | `ProfileResultPage` | Fullscreen | 온보딩 완료 | **없음 — C-13** |
| `/onboarding/growth-capability` | `GrowthCapabilityPage` | Fullscreen | 온보딩 완료 | **없음 — C-13** |
| `/` | `HomePage` (**skeleton** — #33) | Stack (탭 없음) | 온보딩 완료 | `26:21` 헤더 영역(`26:39` 워드마크 · `26:44` 설정) |
| `/settings` | `SettingsPage` (로그아웃 1행) | Stack | 온보딩 완료 | **없음 — C-13** |
| `*` | `NotFoundPage` | Stack | — | — |

`/legal/*` 은 **만들지 않는다** — 동의 문서는 `ConsentDocument.url` 로 연다 (§16 D-4).

### 9.2 `packages/ui` — Shared UI 6종 추가 (22 → 28)

```
packages/ui/src/
├── field/SelectTrigger.tsx                 (1) value/placeholder · chevron · Sheet 트리거 (Figma `179:1740` Tag(Boy/Girl/Not selected), `31:118`)
├── deck/SwipeDeck.tsx                      (2) stack depth 3 · index 제어 · **버튼/키보드 대체 조작 필수** (`179:1781–1783`)
├── list/ListGroup.tsx  list/ListRow.tsx    (3) 기본 행(title + chevron/action) — media·meta 변형은 Stage 3 (`163:2145`)
├── list/InfoRow.tsx                        (4) glass pill + icon (`179:1759`, `179:1764`)
├── divider/DividerWithLabel.tsx            (5) (`179:1839–1841`)
└── text/TextLink.tsx                       (6) tone · href/onPress (`--color-fg-link`)
```

- `PasswordToggle` 는 **신규 컴포넌트가 아니다** — 기존 `TextField.trailingAction` 으로 구현한다 (COMPONENT_MAP §1 "TextField trailingAction 로 흡수 가능"). §16 D-14가 이 요소의 시각 규격을 확정한다.
- `packages/ui` 는 여전히 `@haru/contracts` 를 import하지 않는다. `SelectTrigger` 옵션·`SwipeDeck` 아이템은 props 주입.
- 모든 신규 컴포넌트에 focus-visible(P-03 확정값), 접근성 이름, 키보드 조작, 44×44 터치를 적용한다.

### 9.3 `apps/web` 구조 (Stage 1 위에 추가)

```
apps/web/src/
├── app/
│   ├── router.tsx                    ★ route 15개 (§9.1), PlaceholderPage 제거
│   ├── guards/
│   │   ├── RouteGuard.tsx            (Stage 1 유지)
│   │   ├── resolveGuardDecision.ts   ★ 순수 판정 함수 (§5.1, D-5)
│   │   └── useGuardDecision.ts       ★ useMe() 기반 실제 판정
│   └── providers/
│       ├── AuthProvider.tsx          ★ AuthGateway 주입 (Mock | 미구현 실제) — 선택 지점 1곳
│       └── apiClients.ts             (수정) Stage 2 도메인 5개 추가
├── pages/
│   ├── auth/            WelcomePage · SignUpPage · LogInPage · ForgotPasswordPage · ResetPasswordPage
│   │                    GuardianConsentPage · ParentVerificationPage
│   ├── onboarding/      OnboardingIntroPage · OnboardingStepPage · OnboardingSavedPage
│   │                    ProfileResultPage · GrowthCapabilityPage
│   ├── home/            HomePage            ★ skeleton (#33) — PlaceholderPage 대체
│   ├── settings/        SettingsPage
│   └── not-found/       NotFoundPage (유지)
├── features/
│   ├── auth/            SignUpForm · LogInForm · PasswordResetForm · SocialAuthButtons · copy
│   ├── consent/         GuardianConsentForm(5항목) · VpcStep · copy
│   ├── onboarding-survey/  OnboardingWizard · ChildInfoStep · TemperamentStep · BooksStep · GoalsStep
│   │                       CapabilityItemsStep · WizardProgress · useOnboardingDraft · copy
│   ├── child-profile/   ProfileResultView · GrowthCapabilityPicker · copy
│   └── settings/        SettingsMenu · copy
├── entities/
│   ├── me/              meKeys · useMe · useUpdateCaregiver
│   ├── onboarding/      onboardingKeys · useOnboardingState · useSaveOnboardingStep · useSubmitOnboarding
│   ├── child/           childKeys · useChildProfile · useSetGrowthCapability
│   │                    CapabilityDiamondChart(inline SVG) · PersonaCard · CapabilityScoreList
│   ├── book/            bookKeys · useBookSearch · BookSearchResultRow
│   └── character/       CharacterMedallion · CharacterIllustration · CharacterBubble · SurveyQuestionCard
├── shared/
│   ├── auth/            AuthGateway interface · AuthSession 타입 re-export · useAuthSession
│   ├── api/             consent-api · me-api · onboarding-api · children-api · books-api (+ http/ 골격 5개)
│   ├── lib/             onboarding-draft.ts ★ · session-cleanup.ts ★ · idempotencyKey.ts ★
│   └── config/routes.ts (수정) ROUTES 15개
└── mocks/
    ├── auth/            MockAuthGateway
    ├── me/              MockMeApi
    ├── consent/         MockConsentApi
    ├── onboarding/      MockOnboardingApi
    ├── children/        MockChildrenApi
    ├── books/           MockBooksApi
    ├── fixtures/        caregiver · consent-documents · baseline-instrument(10문항) · onboarding-state
    │                    profile-result · persona · books  (**가상 아동 데이터만**)
    └── scenarios/       (수정) 그룹 6개 등록
```

### 9.4 명시적 비생성

- `apps/api`, `supabase/`, `apps/mobile` — **생성하지 않는다** (hook + QA 파일 목록 증거).
- `/legal/*` page, `ConsentHistoryPage`, `DataManagementPage`, `AccountPage`, `NotificationSettingsPage`, `ChildProfileEditPage` — Stage 6·8.
- `mocks/activities` · `library` · `sessions` · `recordings` · `analysis` · `reports` · `notifications` · `data-management` — 빈 stub도 만들지 않는다 (Stage 1 D-8 유지).

---

## 10. Backend Integration Requirements

Stage 1은 `BACKEND_INTEGRATION_PENDING` 이 **0건**이었다. Stage 2는 **11건**이 발생한다. 각 항목은 ① Frontend 부분이 별도 AC로 PASS/FAIL 판정되고 ② 대기 사유와 Handoff 문서 대상이 기록되어야 한다 (rules/qa.md §1).

| # | PENDING 항목 | Contract로 표현되는 기대 동작 | Frontend 부분 (별도 판정) | Handoff 문서 |
|---|---|---|---|---|
| **P2-BIP-01** | 실제 인증 Provider — Email/Google/Apple 계정 생성·로그인, 토큰 발급·검증·refresh | `AuthGateway` 9 메서드 시그니처, `AuthSession{accessToken, expiresAt}`, `Authorization: Bearer` 첨부, `AUTH_TOKEN_EXPIRED` → 1회 refresh | AC-2-04 · AC-2-06 · AC-2-07 · AC-2-08 | `AUTH_REQUIREMENTS.md`, `BACKEND_HANDOFF.md` |
| **P2-BIP-02** | 비밀번호 재설정 **메일 발송**·링크 토큰·만료 | `requestPasswordReset(email)` → void(성공/실패를 계정 존재 여부로 구분하지 않음), `updatePassword(newPassword)` | AC-2-09 | `AUTH_REQUIREMENTS.md` |
| **P2-BIP-03** | **서버 측 필수 동의 강제** — 동의 없이 `children`·`onboarding_responses` 쓰기 거부 | `CONSENT_REQUIRED` (403) on `GET/PUT /v1/onboarding*`, `POST /v1/onboarding/submit` | AC-2-13 · AC-2-14 (Mock 재현) | `AUTH_REQUIREMENTS.md`, `DATA_REQUIREMENTS.md`, `ERROR_CODES.md` |
| **P2-BIP-04** | **`consent_events` append-only 이력**·문서 버전 관리·`current_consents` view | `POST /v1/consents` items[{type, documentId, action:'granted'}], `GET /v1/consent-documents/current` 의 `version`·`required` | AC-2-10 · AC-2-15 · AC-2-16 | `DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md` |
| **P2-BIP-05** | **VPC 실제 방식·검증·기록** (법무 L-01) | `Me.parentVerification.status` 4값만. 검증 endpoint·payload는 **미정의** | AC-2-17 (슬롯·Guard·Mock) | `AUTH_REQUIREMENTS.md` (+ 법무 L-01) |
| **P2-BIP-06** | 온보딩 **서버 draft 저장·복귀**, `survey_instruments` 버전 관리·문항 배포 | `GET /v1/onboarding` → `OnboardingState{instrument, currentStep, draftAnswers}`, `PUT /v1/onboarding/steps/:step` | AC-2-19 · AC-2-20 · AC-2-24 | `DATA_REQUIREMENTS.md` |
| **P2-BIP-07** | **룰 기반 역량 스코어 산출·스냅샷 저장** | `rules/capability-score.scoreCapabilities` 를 서버가 **그대로 재사용**. `capability_scores.score` NULL 허용 | AC-2-31 · AC-2-32 (contracts 단위 테스트 + Mock) | `DATA_REQUIREMENTS.md`, `ANALYSIS_PIPELINE_REQUIREMENTS.md` |
| **P2-BIP-08** | **페르소나 생성**(템플릿+LLM 슬롯)·금지어·안전 필터·fallback pool·`ai_generation_logs`·3초 SLA | `ProfileResult.persona`, 생성 실패 시 `PROVIDER_UNAVAILABLE` 대신 **fallback 페르소나로 200** | AC-2-36 (fallback 표시) | `ANALYSIS_PIPELINE_REQUIREMENTS.md`, `BACKEND_HANDOFF.md` |
| **P2-BIP-09** | **발전 역량 기본값 산출**(최저 스코어) · `growth_capability_selections` 저장 | `ProfileResult.suggestedCapability`, `PUT …/growth-capability` | AC-2-37 | `DATA_REQUIREMENTS.md` |
| **P2-BIP-10** | `children` **caregiver당 1명 UNIQUE** 강제 | `CHILD_LIMIT_REACHED` (409) on submit | AC-2-48(Mock 재현) | `DATA_REQUIREMENTS.md`, `ERROR_CODES.md` |
| **P2-BIP-11** | **Idempotency-Key 서버 보관 24h·재생**, 다른 body → `IDEMPOTENCY_KEY_REUSED` | `POST /v1/consents`, `POST /v1/onboarding/submit` | AC-2-16 (Mock replay) | `BACKEND_HANDOFF.md`, `ERROR_CODES.md` |

**향후 Backend가 재사용해야 할 Stage 2 산출물**: `packages/contracts` 의 auth/me/consent/onboarding/children/books schema + `rules/capability-score` + 신규 enum 3종(`ConsentSource`·`OnboardingStatus`·`Plan`). Backend 모듈에서 별도 schema/type 재선언 금지 (rules/backend.md §4).

**Stage 2가 Handoff에 추가로 남기는 요구**: ① 동의 문서(`consent_documents`)의 `required` 를 **API가 반드시 노출**해야 Frontend가 필수 여부를 그릴 수 있다 ② 설문 문항 문구를 **instrument 응답으로 내려야** 한다(Frontend 하드코딩 금지) ③ Trial 제출은 5단계가 **한 번에** 도착한다.

---

## 11. Acceptance Criteria

판정 규칙: rules/qa.md §1. PASS는 QA가 직접 실행한 증거 필요. **PENDING** 열은 해당 AC가 `BACKEND_INTEGRATION_PENDING` 판정 대상인지를 뜻한다 — 모든 AC는 **Frontend 부분만** 판정하므로 전부 `No` 이며, PENDING은 §10의 P2-BIP-01~11로 **별도 항목**으로 기록한다.

### 11.1 Scope 준수

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-01** | `apps/api/`, `supabase/`, `apps/mobile/` 이 저장소에 **존재하지 않는다** | `git ls-files` / `ls` | CLAUDE.md, #7 |
| **AC-2-02** | Out of Scope(§3.1)가 구현되지 않았다 — Activity Card·Home 콘텐츠·**BottomTabBar 마운트**·서재·세션·회고·리포트·데이터 관리·탈퇴·동의 이력·알림 설정·`PATCH /v1/children/:childId`, Stage 3~8 scenario key, 나머지 도메인 Mock stub | route 목록 · 디렉토리 목록 · scenario 목록 · grep | §3.1, rules/workflow §2 |
| **AC-2-03** | import 경계 위반 0건 — `packages/* → apps/*`, `ui → contracts`, **`features/A → features/B`**(auth·consent·onboarding-survey·child-profile·settings 5개), 레이어 역방향, 순환 | `pnpm lint:boundaries` | ARCHITECTURE §4, §5.4 |

### 11.2 Auth (FR-01)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-04** | `/auth/welcome` · `/auth/sign-up` · `/auth/log-in` · `/auth/forgot-password` · `/auth/reset-password` 5 route가 동작하고, Welcome에 Google(공식 로고 `179:1710`) · **Apple 공식 가이드 버튼** · Email 경로가 모두 있다 | e2e + 스크린샷 | FR-01, C-13 |
| **AC-2-05** | 가입 요청 body에 **아이 필드가 0건**이다. `SignUpWithEmailInputSchema` 가 `.strict()` 라 추가 키가 parse 실패한다 | Mock 요청 로그 전수 + 단위 테스트 | **C-5**, ARCHITECTURE §7.3.1-3 |
| **AC-2-06** | `AuthGateway` 9 메서드가 정의되고 `MockAuthGateway` 가 구현한다. Component·Page·Query hook이 `MockAuthGateway` 를 직접 import하지 않으며 주입 지점이 `app/providers` **한 곳**이다 | grep + 코드 검사 | ARCHITECTURE §7.2, §2.3 |
| **AC-2-07** | `token-expired` 에서 refresh **1회** 후 재시도 성공하고, 재시도도 실패하면 signOut + `/auth/log-in` 으로 이동한다 | 시나리오 테스트 | ARCHITECTURE §7.2 |
| **AC-2-08** | `provider-cancelled` 가 오류 화면이 아니라 Welcome 유지 + 안내로 처리된다 | 시나리오 테스트 | §5.4 |
| **AC-2-09** | 비밀번호 재설정 요청 → 메일 안내 → 링크 만료 → 새 비밀번호 설정 상태가 모두 화면으로 존재하고, **계정 존재 여부를 응답으로 구분하지 않는다** | e2e + 코드 검사 | FR-01, NFR 보안 |

### 11.3 Consent · VPC (FR-02) — Privacy 핵심

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-10** | `/auth/consent` 가 **5항목**을 개별 체크로 표시하고, 필수/선택 표시가 **서버(Mock) `ConsentDocument.required` 값**에서만 나온다 (하드코딩 0건) | 화면 + grep(`required` 하드코딩) | **C-1**, L-02 |
| **AC-2-11** | 필수 항목(`required=true`) 미체크 시 제출 버튼이 disabled이고 이유가 안내된다 | 컴포넌트 테스트 | FR-02, PRD §7.1 |
| **AC-2-12** | **Email · Google · Apple 3경로 모두** 가입 직후 `/auth/consent` 에 도달한다 | e2e 3건 | **C-2** |
| **AC-2-13** | **동의 기록(`POST /v1/consents`) 성공 이전 구간의 모든 요청에 아동 데이터가 0건**이다 (아이 이름·생년월·성별·설문 응답) | Mock 요청 로그 전수 검사 테스트 | **C-2 · C-5**, ARCHITECTURE §7.3.1, rules/qa Privacy |
| **AC-2-14** | 동의 없이 `child_info` 저장 시도 → Mock이 `CONSENT_REQUIRED` 반환 → 동의 화면으로 복귀하는 UX가 동작한다 | `consent-missing` 시나리오 | ARCHITECTURE §7.3.1-3 |
| **AC-2-15** | `consent-version-outdated` 에서 재동의 화면이 뜬다 | 시나리오 테스트 | §5.4 |
| **AC-2-16** | `POST /v1/consents` · `POST /v1/onboarding/submit` 에 `Idempotency-Key`(uuid)가 첨부되고, 동일 key + 동일 body replay 시 **최초 응답이 재생**된다 | Mock replay 테스트 | API_CONTRACTS §1 Idempotency |
| **AC-2-17** | VPC 슬롯 route가 존재하고 `vpc-pending` 에서 머물며, `vpc-failed` 에서 안내·재시도 경로가 표시되고 **온보딩 진입이 차단되어 아동 데이터 쓰기가 0건**이다. 기본 scenario(`success`)는 통과한다 | 시나리오 테스트 3건 | **C-3**, §5.4 |
| **AC-2-18** | 동의 문서 링크가 §16 D-4 승인안대로 열리고, 문서 본문이 Frontend 코드·fixture에 포함되지 않는다 | 코드 검사 + grep | L-02 (문구 미확정) |

### 11.4 Onboarding (FR-03, FR-24)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-19** | `/onboarding` → `/onboarding/:step` 5단계(`child-info`·`temperament`·`books`·`goals`·`capability-items`) → `/onboarding/saved` 가 동작하고 진행바·이전/다음이 있다 | e2e | **C-9**, PLANNING §9.2 |
| **AC-2-20** | 중도 이탈 후 재진입 시 `draft-resume` 의 `currentStep` 으로 복귀하고 입력이 보존된다 | 시나리오 테스트 | FR-03 |
| **AC-2-21** | Step 1이 **성·이름 두 칸**이고, 성별 3옵션(Girl/Boy/Prefer not to say)이 **기본 미선택**이며 미선택으로 진행 시 `gender: null` 이 전송된다 | 컴포넌트 + 요청 로그 | **C-6 · C-7**, D-03 |
| **AC-2-22** | 생년월이 `YYYY-MM` 이고 **3~9세 범위 밖이면 필드 에러**가 뜬다. 나이 표시(`3yr 4mo`)는 입력에서 파생된다 | 단위 테스트(경계: 3세 0개월/9세 11개월/2세 11개월/10세 0개월) + 화면 | **C-10**, §16 D-10 |
| **AC-2-23** | Step 3 책 검색이 `success`·`empty` 를 처리하고, 결과 없음에서 **제목 직접 입력 경로**가 제공된다 | 시나리오 테스트 | PRD §7.2 규칙, §16 D-17 |
| **AC-2-24** | Step 5가 **10문항**이고 RadioGroup이 **6옵션**(빈도 5 + 비채점)이며, 문항 문구·척도 라벨이 **instrument 응답 값에서만** 온다 (하드코딩 0건) | 화면 + grep(문항 문자열) | **C-8, D-04**, DATA_MODEL §6 |
| **AC-2-25** | SwipeDeck이 **제스처 전용이 아니다** — 키보드·버튼만으로 10문항 전체를 이동·응답할 수 있다 | 키보드 e2e | WCAG 2.5.1, COMPONENT_MAP §1 |
| **AC-2-26** | `POST /v1/onboarding/submit` 요청에 5단계 전체 + capability **10문항 전부**(`not_observed` 포함)가 담긴다 | 요청 로그 + 단위 테스트 | API_CONTRACTS §4 Stage 2 |
| **AC-2-27** | **Trial**: 미인증 상태에서 Step 1–5를 진행하는 동안 **네트워크 요청이 0건**이고 응답이 로컬 draft에만 저장된다 | 요청 로그 0건 + 저장소 검사 | **C-12**, ARCHITECTURE §7.4 |
| **AC-2-28** | Trial draft → 가입 → 동의 → **submit 1회**로 제출되고, 제출 성공 후 로컬 draft가 삭제된다 | e2e + 저장소 검사 | **C-12** |
| **AC-2-29** | 로그아웃 시 로컬 draft · Query 캐시 · 관련 저장소 키가 **잔존 0건**이다 | 저장소 전수 grep | ARCHITECTURE §13, C-16 |
| **AC-2-30** | draft 보관 상한 경과 또는 `schemaVersion` 불일치·parse 실패 시 폐기되고 사용자에게 안내된다 | 단위 테스트 | §16 D-3 |

### 11.5 Profile · Capability · Persona · Growth (FR-04 · FR-05 · FR-06)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-31** | `scoreCapabilities` 가 `not_observed`·미응답을 **제외한 평균**을 소수 1자리로 반환하고 `itemCount`·`missingCount` 가 정확하다 (ER 2 · AG 3 · CF 2 · IM 3) | contracts 단위 테스트(전 응답/일부 결측/전부 결측 경계) | **C-8** |
| **AC-2-32** | `capability-all-missing` 에서 해당 역량이 §16 D-2 승인안대로 표시되고, **0 또는 최저값으로 표시되지 않는다** | 시나리오 + 스크린샷 | C-8, PRD §7.3 "판정 아님" |
| **AC-2-33** | `CapabilityDiamondChart` 가 **inline SVG**이고 4축 값을 문장으로 읽어주는 접근성 이름/대체 텍스트를 가진다 | 코드 검사 + 스크린리더 이름 확인 | **#9**, FR-04, rules/frontend §9 |
| **AC-2-34** | 프로필 화면에 "현재 부모가 관찰한 신호의 분포이며 잘함/못함 판정이 아니다" 취지의 안내가 표시된다 | 화면 | PRD §7.3 |
| **AC-2-35** | 강점 2 · growing edge 2 · 페르소나 문구가 **API(Mock) 응답 값만** 표시되고 Frontend가 생성·가공하지 않는다 | 코드 검사 | rules/frontend §8, rules/architecture §8 |
| **AC-2-36** | `persona-fallback` 에서 fallback 페르소나가 표시되고 **오류 화면이 아니다** | 시나리오 테스트 | FR-05, §5.4 |
| **AC-2-37** | 발전 역량 기본값이 응답의 `suggestedCapability` 이고, 다이아몬드 축 탭으로 변경 시 `PUT …/growth-capability` 가 호출된다 | e2e | FR-06, PRD §7.3 |
| **AC-2-38** | Stage 2 전 화면 copy에 진단·판정·비교 표현이 없다 (관찰·신호·성장 힌트 언어) | copy 모듈 리뷰 | rules/frontend §8, PRD §8.4 |

### 11.6 Home skeleton · Settings (#33 · C-16)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-39** | `/` 가 워드마크 + 설정 아이콘 `26:44`(최종 위치) + 빈 상태 안내로만 구성되고, **Activity Card·streak·캐릭터·BottomTabBar가 없으며 contract 호출이 0건**이다 | 화면 + 요청 로그 0건 + DOM 검사 | **#33**, C-16 |
| **AC-2-40** | 설정 아이콘 → `/settings`, 목록 항목은 **로그아웃 1행**이다 | e2e | **C-16** |
| **AC-2-41** | 로그아웃이 §16 D-7 승인안대로 동작하고 `/auth/welcome` 로 이동하며 로컬 정리가 수행된다 | e2e + 저장소 검사 | PRD §7.8, C-16 |

### 11.7 Route Guard

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-42** | `resolveGuardDecision` 가 순수 함수로 분리되고 ARCHITECTURE §2.4 순서 **전수 케이스**(미인증 / 동의 누락 / VPC pending·failed / 온보딩 미완 / 완료)가 단위 테스트로 보증된다 | 테스트 로그 | ARCHITECTURE §2.4, §16 D-5 |
| **AC-2-43** | `onboarding-incomplete` 에서 Guard가 `/onboarding/:step` 으로 이동시킨다 | 시나리오 테스트 | §5.4 |
| **AC-2-44** | `me` 미해결 동안 `pending`(Spinner)이고, **무한 리다이렉트가 발생하지 않는다**(판정 결과 = 현재 경로면 allow) | 단위 + e2e | §5.1 |
| **AC-2-45** | **미인증 상태에서 `/onboarding/*` 접근이 허용된다**(Trial) — 단 서버 요청은 0건 | e2e | C-12, ARCHITECTURE §2.4 |

### 11.8 contracts

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-46** | §7.1 표의 schema가 모두 존재하고 값·필드가 `docs/API_CONTRACTS.md` §3.4·§4 Stage 2와 일치한다. `apps/web` 에 타입 재선언 0건 | 단위 테스트 + 문서 대조 + grep | API_CONTRACTS §3.4·§4 |
| **AC-2-47** | 신규 enum 3종(`ConsentSource`·`OnboardingStatus`·`Plan`)이 정의되고 §18 보고 ④의 문서 동기화가 반영되었다 | 테스트 + 문서 diff | DATA_MODEL §5, PRD §7.1 |
| **AC-2-48** | Stage 2 Error Code 사용이 기존 28종 범위 안이다 — **신규 코드 0건**. `CONSENT_REQUIRED`·`CONSENT_VERSION_OUTDATED`·`ONBOARDING_INCOMPLETE`·`CHILD_LIMIT_REACHED`·`CHILD_NOT_FOUND`·`PROVIDER_UNAVAILABLE`·`IDEMPOTENCY_KEY_REUSED`·`AUTH_TOKEN_EXPIRED` 가 Mock에서 재현된다 | 단위 + 시나리오 테스트 | API_CONTRACTS §1.2, C-12 |
| **AC-2-49** | `packages/contracts` 런타임 의존이 여전히 `zod` 뿐이고, 시간 의존 검증이 clock 주입 팩토리로 구현되었다 | `package.json` + `lint:boundaries` + 코드 검사 | ARCHITECTURE §1.2, §16 D-10 |

### 11.9 Mock Infrastructure

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-50** | Stage 2 Mock Adapter 6종의 요청·응답이 contracts schema parse를 통과한다 | 테스트 로그 | rules/qa 체크리스트 |
| **AC-2-51** | §8.2의 **17 key**가 재현되고 각각 대응 UI 상태를 만든다 | 시나리오별 테스트·스크린샷 | API_CONTRACTS §5.3·§5.4 |
| **AC-2-52** | scenario가 **결정적**이다 — 같은 key 반복 실행 시 응답 동일(특히 `capability-all-missing`·`persona-fallback` 의 점수·문구), Mock 코드에 `Date.now()`/`Math.random()` 직접 호출 0건 | 반복 실행 + grep | §5.2 결정성 |
| **AC-2-53** | scenario key가 §5.4 catalogue만 사용하고 alias·신규 key가 0건이다 | grep + catalogue 대조 | §5.4 Single Source |
| **AC-2-54** | fixture가 `mocks/fixtures/` 에만 있고 Component·Page·Feature에 하드코딩되지 않았으며, 아동 이름이 **가상 이름**이고 Figma placeholder 값을 복사하지 않았다 | grep 증거 | rules/frontend §5, M-36 |
| **AC-2-55** | `VITE_API_MODE=http` 빌드 산출물에 `src/mocks/**` · dev gallery · Scenario Panel이 **0건**이다 (Stage 1 회귀) | `pnpm assert:no-mocks` + `dist` grep | Stage 1 D-6 |

### 11.10 Design · Accessibility · Responsive

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-56** | Figma 시각 비교가 수행·기록된다: `179:1701` · `179:1724`(보호자 영역만) · `179:1748` · `179:1770` · `179:1809` · `179:1820` · `26:21` 헤더 영역. 의도된 차이(아이 섹션·단일 체크박스 제거, 소개 문구 수정, 6번째 옵션)는 **허용 차이**로 사전 기록 | Figma screenshot ↔ Playwright screenshot | C-5, C-8, FRONTEND_IMPLEMENTATION_PLAN §2.4 |
| **AC-2-57** | C-13으로 승인된 디자인 소스(Figma 또는 stage-2 design spec)와 구현이 일치한다. 승인되지 않은 누락 화면이 **구현되어 있지 않다** | Design Spec 대조 + route 목록 | **C-13** |
| **AC-2-58** | 임의 HEX / `rgb()` / Tailwind arbitrary value / inline 수치 스타일이 **0건**이다 (Stage 1 회귀 + 신규 화면) | grep + lint | rules/frontend §6 |
| **AC-2-59** | 320 / 393 / 600 / 1024px 에서 앱 컬럼 규칙이 유지되고, 200% 텍스트 확대에서 320px reflow가 깨지지 않는다 | Playwright viewport + emulate | #12, FR-25 |
| **AC-2-60** | 신규 인터랙티브 컴포넌트·화면이 키보드 조작 가능하고 focus 표시·접근성 이름·44×44 터치를 만족한다 (예외: TextField 42px = `PASS (accepted: S1-G-2)`) | 키보드 e2e + bounding box | PRD §11, stage-1-approvals §8 |
| **AC-2-61** | `TopBar` 의 스크롤 glass 전환이 **실제로 동작**한다 (`useScrolledPast` 컨테이너 구독 수정, §16 D-13) | e2e 스크롤 테스트 | stage-1-handoff §18.8 |
| **AC-2-62** | `PROVISIONAL_ITEMS` 가 남은 **5건**(P-01·P-02·P-04·P-05·P-16)이고, `provisional` 주석 목록이 `stage-0-approvals.md` §4의 미확정 항목과 1:1 일치한다. 신규 가값 발견 시 `P-17…` 로 추가되어 있다 | grep ↔ 문서 대조 | stage-1-approvals §9.4, §17.2 |

### 11.11 Privacy · Security

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-63** | 콘솔·에러 리포트·`devWarn` 출력에 아이 이름·보호자 이메일·비밀번호·토큰·동의 증빙이 **0건**이다 | 로그 프로브 + 코드 검사 | ARCHITECTURE §13, rules/qa Privacy |
| **AC-2-64** | **비밀번호가 로컬 저장소·draft·Query 캐시에 잔존하지 않는다** | 저장소·캐시 전수 검사 | NFR 보안 |
| **AC-2-65** | 화면·알림 문구에 `lastName` 이 사용되지 않는다 (호칭은 `firstName` 만) | grep + copy 리뷰 | **C-6**, D-03 |
| **AC-2-66** | 번들·`VITE_*`·저장소에 Secret이 0건이고, 광고·제3자 분석 SDK 의존성이 0건이며 런타임 외부 도메인 요청이 0건이다 (Stage 1 회귀 + OAuth client id 미노출) | grep + `package.json` + Playwright network log | rules/qa Privacy, §5.5 |

### 11.12 회귀 · 실행

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-2-67** | Stage 1 AC 핵심 경로가 재실행된다 — health 5 scenario, dev gallery 6경로, 기존 baseline 유지(의도된 변경은 사유 기록) | Stage 1 테스트·e2e 재실행 | rules/qa Regression |
| **AC-2-68** | `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries` · `test` · `build`(mock·http 2모드) · `test:e2e` · `assert:no-mocks` 가 모두 통과하고, 신규 `any`/`@ts-ignore` 가 0건이다 | 명령 로그 8종 | rules/qa §4 |

**AC 총 68건 (AC-2-01 ~ AC-2-68).** 요구사항 ID 매핑: FR-01 → AC-2-04~09 · FR-02 → AC-2-10~18 · FR-03 → AC-2-19~26 · FR-24 → AC-2-27~30·45 · FR-04 → AC-2-31~34 · FR-05 → AC-2-35·36 · FR-06 → AC-2-37 · #33·C-16 → AC-2-39~41 · Guard(기술) → AC-2-42~45 · contracts → AC-2-46~49 · Mock → AC-2-50~55 · 디자인/접근성/반응형 → AC-2-56~62 · Privacy/보안 → AC-2-13·63~66 · Scope → AC-2-01~03 · 회귀 → AC-2-67·68.

---

## 12. Test Strategy

| 계층 | 도구 | Stage 2 범위 |
|---|---|---|
| **contracts 단위** | Vitest (Node) | `scoreCapabilities` 경계(전 응답 / 일부 결측 / 한 역량 전부 결측 / 전 역량 결측, 반올림 1.0·3.3·5.0) · `createBirthYearMonthSchema` 경계(3세 0개월·9세 11개월·2세 11개월·10세 0개월·형식 오류) · `SignUpWithEmailInputSchema.strict()` 아이 필드 거부 · `SurveyInstrumentSchema` items 10 / scaleLabels 6 강제 · `CapabilityItemsAnswersSchema` draft(부분) vs submit(10개) · `OnboardingDraftSchema` round-trip · 신규 enum 값 스냅샷 3종 |
| **Mock 단위** | Vitest | Mock Adapter 6종 × scenario 17종 × contracts parse · 결정성(동일 key 2회 호출 → 동일 바이트) · Idempotency replay · `CONSENT_REQUIRED` 거부 로직 · 요청 로그 수집기(AC-2-13용) |
| **Guard 단위** | Vitest | `resolveGuardDecision` 전수 케이스 표 — me 상태 × 현재 경로 조합(미해결·미인증·동의 누락·VPC pending/failed·온보딩 미완·완료 × `/auth/*`·`/onboarding/*`·`/`·`/settings`), 무한 리다이렉트 없음 |
| **Component** | Vitest + Testing Library | SelectTrigger(열기·선택·미선택 유지) · SwipeDeck(키보드·버튼 이동, 제스처 없이 전 항목 도달) · ListRow · InfoRow · DividerWithLabel · TextLink · GuardianConsentForm(필수 미체크 disabled) · ChildInfoStep(성별 null 전송) · CapabilityItemsStep(6옵션·10문항) · CapabilityDiamondChart(대체 텍스트·null 축) · PersonaCard(fallback) |
| **Feature/Query** | Vitest + Testing Library | `useMe` · `useOnboardingState` · `useSaveOnboardingStep` · `useSubmitOnboarding` · `useChildProfile` × scenario → Loading / Success / Error+Retry / Offline 전이 · `useOnboardingDraft`(저장·복원·만료·폐기) |
| **Privacy 회귀 테스트** | Vitest | **동의 성공 이전 요청 목록에 아동 필드 0건**(AC-2-13) — Mock 요청 로그를 수집해 금칙 키(`firstName`·`lastName`·`birthYearMonth`·`gender`·`answers`) 존재 여부를 검사하는 전용 테스트 · 비밀번호 저장소 잔존 0건 · `lastName` copy 사용 0건 |
| **E2E** | Playwright | ① Email·Google·Apple 3경로 → 동의 → VPC → 온보딩 → 프로필 → 발전 역량 → `/` 착지 ② Trial 경로(미인증 Step 1–5 → 가입 → 동의 → submit) ③ 중도 이탈·복귀 ④ 로그아웃 → 로컬 정리 ⑤ Guard 리다이렉트 5종 ⑥ 키보드만으로 설문 10문항 완주 ⑦ 외부 도메인 요청 0건 ⑧ TopBar 스크롤 전환 |
| **시각 비교** | Playwright | AC-2-56 Figma 대조 7건 + Stage 2 화면 baseline. **영역 클립 baseline** 도입(§16 D-12) |
| **정적 검사** | eslint / dependency-cruiser / grep | 경계 위반 0 · arbitrary value 0 · Adapter 직접 import 0 · scenario key catalogue 대조 · Secret grep · mock sentinel · `provisional` 목록 대조 |

- **수동 기기 테스트**: Stage 2는 웹 전용이라 필수는 아니다. 단 P-05(scrim)·P-16(medallion) 가값 재제시를 위해 **모바일 실기기에서 동의 Sheet·프로필 화면 육안 확인**을 권장한다 (P-10 확정 때와 같은 방식).
- Playwright baseline은 Chromium · 고정 DPR · 폰트 로드 대기 조건으로 결정적으로 생성한다.

---

## 13. Risks & Mitigations

| # | 위험 | 영향 | 완화 |
|---|---|---|---|
| S2-R1 | **동의 전 아동 데이터 전송** — Trial draft, 자동 저장, 낙관적 mutation, 로그 출력 중 어느 한 경로가 새면 Critical Finding | rules/qa Severity Critical | 전용 회귀 테스트(AC-2-13)로 **요청 로그 전수 검사**를 CI에 고정. draft 저장은 `OnboardingDraftStore` 한 곳만 통과하도록 경계화(§5.3). Mock이 `CONSENT_REQUIRED` 로 거부 |
| S2-R2 | Figma 누락 화면 13건에 대한 C-13 승인이 늦어져 design 단계가 지연 | 일정 | §15.1 목록을 승인 체크포인트에서 **한 번에** 제시. 화면별로 "Figma 요청 / design-agent 명세"를 표로 받아 부분 승인만으로도 착수 가능한 순서(§15.2)를 제시 |
| S2-R3 | 법무 미결(L-01 VPC · L-02 파일럿 동의 · L-07 성 수집)이 확정되면 화면·contract 변경 | 재작업 | ① VPC는 **슬롯**이라 방식이 정해져도 Guard 분기와 route는 그대로 ② 필수 여부는 서버 `required` 값이라 코드 수정 불필요(AC-2-10) ③ `lastName` 은 선택 필드 권장(D-1)이라 제거 시 파급 최소 |
| S2-R4 | `score: null`(한 역량 전부 결측) 표시를 잘못 정하면 **"판정" 언어**가 되어 PRD §7.3·§8.4 위반 | 제품 원칙 위반 | §16 D-2를 **구현 착수 전 필수 결정**으로 분류. 0·최저값 대체를 명시적으로 기각 |
| S2-R5 | SwipeDeck을 제스처 전용으로 만들면 WCAG 2.5.1 위반 + 키보드 사용자 설문 완주 불가 | 접근성 FAIL | 버튼(`179:1772`/`179:1775`)·키보드 이동을 **1급 경로**로 설계하고 제스처는 보조. AC-2-25로 강제 |
| S2-R6 | `MockAuthGateway` 세션 상태와 TanStack Query 캐시가 어긋나 로그아웃 후 이전 사용자 데이터가 보임 | 프라이버시 | `signOut()` 성공 시 `queryClient.clear()` + draft 삭제를 `session-cleanup.ts` 한 곳에서 수행(§5.4). AC-2-29·AC-2-41 |
| S2-R7 | Guard 판정과 화면 내 네비게이션이 충돌해 **무한 리다이렉트** | 사용 불가 | 판정을 순수 함수로 분리하고 "현재 경로와 동일하면 allow" 규칙을 명시. 전수 단위 테스트(AC-2-42·44) |
| S2-R8 | Step 2–4 answer schema가 Figma 없이 정해져 이후 디자인과 어긋남 | 재작업 | schema를 **최소·확장 가능 형태**(배열 + 코드 키)로 두고, 선택지 목록은 서버(Mock) 응답으로 내린다는 원칙을 §7.1에 고정. 문항·선택지 하드코딩 금지 |
| S2-R9 | Figma `179:1724`·`179:1748` 디자이너 수정이 반영되지 않은 채 시각 비교 → 대량 차이 | QA 노이즈 | AC-2-56에서 해당 차이를 **허용 차이로 사전 기록**하고, 디자이너 수정 요청 목록(§18 ⑥)을 유지 |
| S2-R10 | 신규 가값(P-17…)이 다수 발생해 Stage 3 이후로 누적 | 일정 | Stage 2 화면이 P-01·P-02·P-04·P-05·P-16의 **첫 실사용처**이므로, Stage 2 QA 후 재제시 절차(§17.3)를 Stage 1 §17과 동일하게 수행 |
| S2-R11 | Apple/Google 브랜드 버튼이 공식 가이드를 벗어남 | 스토어 심사·상표 | §16 D-15 — 공식 에셋·가이드 준수 여부를 design-agent가 명세하고 QA가 확인. Apple Guideline 4.8은 제출 시 재확인(ARCHITECTURE §7.1) |
| S2-R12 | Idempotency-Key를 Mock이 무시해 Backend 연동 시 중복 제출 | 데이터 중복 | Mock이 key를 **실제로 저장·재생**하도록 구현(AC-2-16). Handoff P2-BIP-11로 요구 명시 |

---

## 14. Open Decisions

| ID | 항목 | 라벨 | 처리 |
|---|---|---|---|
| §16 D-1 ~ D-17 | Stage 2 세부 확정 항목 | **RECOMMENDED** (권장안 + 기각 사유 제시) | 승인 체크포인트에서 O/X. **D-2 · D-6은 구현 착수 전 필수** |
| §15.1 C-13 화면 13건 | Figma 누락 화면의 디자인 소스 | **CONFIRMED 절차 / 화면별 선택 필요** | Orchestrator가 화면마다 ①·② 질문 → 승인 후 design 착수 |
| P-01 · P-02 · P-04 · P-05 · P-16 | 가값 — Stage 2가 **첫 실사용처** | 가값 (stage-1-approvals §9.2) | Stage 2 QA 후 항목별 재제시 (§17.3) |
| D-01 | Accent 버튼 대비 2.07:1 | 사용자 수용 예외 (CONFIRMED) | Stage 1과 동일 처리 — `PASS (accepted: D-01)` |
| S1-G-2 | TextField 행 높이 42px | 사용자 수용 예외 (CONFIRMED) | `PASS (accepted: S1-G-2)` |
| D-03 | 아이 성·이름 두 칸 | 사용자 수용 예외 (CONFIRMED) | 유지. 필수 여부는 §16 D-1 |
| D-04 | Baseline v1 10문항(역량별 2/3/2/3) | 사용자 수용 예외 (CONFIRMED) | 유지 |
| L-01 · L-02 · L-07 | VPC 방식 · 파일럿 동의 필수 여부·문구 · 성 수집 적합성 | **NEEDS DECISION (법무)** | Frontend는 슬롯·서버 값·선택 필드로 진행. 결정 시 토큰/설정 교체로 흡수 |
| L-03 · L-04 · L-05 · L-06 | 동의 철회 미제공 · 대비 예외 · 서면 정책 · 벤더 조건 | NEEDS DECISION (법무) | Stage 2 무관 또는 Handoff 기록 |
| M-09 · M-10 · M-11 · M-12 · M-14 · M-15 · M-25 · M-26 · M-29 · M-30 · M-31 | PRD ↔ Figma 불일치 | NEEDS DECISION | **Stage 2와 무관** — 해당 Stage(3~7)에서 결정 |
| OAQ-13 · OAQ-14 · OAQ-16 · OAQ-17 · OAQ-19 | 아키텍처 미결 | NEEDS DECISION | Stage 3~8 / 비차단 |

---

## 15. Handoff to design-agent

design-agent는 `docs/design/stage-2-design-spec.md` 를 작성한다. **Figma는 수정하지 않는다.**

### 15.1 ★ C-13 — Figma 누락 화면 13건 (사용자 선택 필요, plan-agent가 고르지 않음)

각 화면에 대해 Orchestrator가 사용자에게 **① 디자이너에게 Figma 디자인 요청 / ② design-agent 명세 작성** 중 무엇으로 할지 묻고, **승인 후에만** 디자인·구현한다.

| # | 화면 / 상태 | Route | PRD | 기존 컴포넌트로 조합 가능? |
|---|---|---|---|---|
| **C13-01** | 비밀번호 재설정 — 요청 폼 · 메일 발송 안내 · 링크 만료 · 새 비밀번호 설정 | `/auth/forgot-password`, `/auth/reset-password` | FR-01, §6.2 | 부분 (TopBar + FieldGroup + Button + InlineAlert). 발송 완료·만료 상태 누락 |
| **C13-02** | 보호자 동의 화면 — 5항목 개별 체크 · 문서 링크 · 필수/선택 표시 | `/auth/consent` | FR-02, §7.1 | 부분 (CheckboxGroup + TextLink + Button). Figma는 단일 체크박스 `179:1745` 뿐 |
| **C13-03** | VPC 단계 슬롯 — 안내 · 진행 중(`vpc-pending`) · 실패(`vpc-failed`) · 재시도 | `/auth/verify-parent` | FR-02, NFR VPC | 부분 (Surface + Button + InlineAlert). 방식 미정(L-01)이라 **내용 없는 슬롯** 디자인 |
| **C13-04** | 온보딩 Step 1 **누락 필드** — 관계(`CaregiverRelationship` 7값) · 언어 환경 · 독서 루틴 | `/onboarding/child-info` | FR-03, §7.2 Step 1 | 부분 (FieldGroup + SelectTrigger + Chip). 이름·성별·생년월은 `179:1740` 소스 |
| **C13-05** | 온보딩 Step 2 — 기질 카드 선택형(활동성·낯가림·집중 성향·선호 활동) | `/onboarding/temperament` | FR-03, §7.2 Step 2 | 부분 (SurveyQuestionCard + RadioGroup/Chip). 카드 선택 UI 누락 |
| **C13-06** | 온보딩 Step 3 — 책 검색(최대 5권) · 집 책 리스트 입력 · 주제 태그 멀티선택 · **검색 결과 없음 → 제목 직접 입력** | `/onboarding/books` | FR-03, §7.2 Step 3 | 부분 (검색 field + ListRow + Chip multi). 검색 UI·태그 선택 누락 |
| **C13-07** | 온보딩 Step 4 — 성장 목표 선택 | `/onboarding/goals` | FR-03, §7.2 Step 4 | 부분 (Chip multi 또는 RadioGroup card) |
| **C13-08** | 온보딩 Step 5 **비채점 6번째 옵션**의 시각 구분 ("Haven't had the chance to see this yet") | `/onboarding/capability-items` | FR-03, C-8 · D-04 | 부분 — `179:1788` 은 5옵션. 6번째 옵션 표현이 Figma에 없음 |
| **C13-09** | 프로필 결과 — 다이아몬드 차트 · 강점 2 · growing edge 2 · 페르소나 카드 · **"판정 아님" 안내** · `score: null` 축 표현 | `/onboarding/profile` | FR-04, FR-05, §7.3 | **불가** (CapabilityDiamondChart · PersonaCard 없음) |
| **C13-10** | 발전 역량 제시 + 다이아몬드 **축 탭 변경** | `/onboarding/growth-capability` | FR-06, §7.3 | **불가** (차트 없음) |
| **C13-11** | Trial 가입 유도 — "프로필 저장" CTA · **기기 변경 시 draft 유실 안내** · draft 만료 안내 | `/onboarding/*` 내 상태 | FR-24, C-12 | 부분 (InlineAlert + Button) |
| **C13-12** | 설정 목록 — 로그아웃 1행 (+ 확인 Dialog 여부는 D-7) | `/settings` | §7.8, C-16 | 부분 (ListGroup + ListRow + ConfirmDialog) |
| **C13-13** | Home skeleton **본문** — 빈 상태 안내(EmptyState) 문구·일러스트 유무 | `/` | §6.1, #33 | 부분 — 헤더(`26:39` 워드마크 + `26:44` 설정)는 `26:21` 소스, 본문은 Figma 없음 |

**C-13 예외 (질문 불필요)**: Apple 로그인 버튼 = **Apple 공식 가이드 버튼**(C-13 확정, 디자인 불필요). 공통 상태(Loading·Empty·Error+Retry·Offline·Toast·Dialog)는 **#22 · P-10 확정 명세**를 그대로 사용한다 (2026-09-23 확정).

### 15.2 C-13 승인 우선순위 (부분 승인 시 착수 순서)

1차(핵심 경로 차단): C13-02 동의 · C13-13 Home skeleton · C13-12 설정 · C13-03 VPC 슬롯
2차(온보딩 완주): C13-04 · C13-05 · C13-06 · C13-07 · C13-08
3차(결과 화면): C13-09 · C13-10
4차(보조): C13-01 · C13-11

### 15.3 Shared UI 6종 — 컴포넌트별 variant / state 표

`SelectTrigger` · `SwipeDeck` · `ListGroup`/`ListRow` · `InfoRow` · `DividerWithLabel` · `TextLink` 각각에 대해: variant · state(rest/hover/pressed/disabled/**focus**/error/selected) · 치수(높이·padding·radius·gap) · 사용 토큰 · 접근성 요구(role · 접근성 이름 · 키보드 조작 · 터치 타깃) · Figma node 근거 또는 "Figma 없음 → 명세".

특히 명세가 유일한 기준인 것:
- **SelectTrigger의 선택 UI** — Sheet인지 인라인인지(§16 D-8 권장: 기존 `Sheet` 재사용), 옵션 목록 레이아웃, 미선택 상태 표현.
- **SwipeDeck의 버튼·키보드 조작** — 이전/다음 버튼 위치(`179:1772`/`179:1775` back/forward IconButton 활용), 카드 스택 깊이 3의 시각 규격, `prefers-reduced-motion` 대체 동작.

### 15.4 Domain 컴포넌트 명세

| 컴포넌트 | 명세 필요 항목 |
|---|---|
| **CapabilityDiamondChart** (Figma 없음) | inline SVG 좌표계(4축 순서·라벨 위치 #14), 축 색 `--color-capability-*-chart`(#19), 1.0–5.0 눈금, **`score: null` 축의 표현**(§16 D-2 결과 반영), 대체 텍스트 문장 형식, 축 탭 인터랙션(FR-06)과 터치 타깃, `prefers-reduced-motion` |
| **PersonaCard** (Figma 없음) | default · **fallback** 변형, 일러스트 배경 유무(에셋 C-17), 문구 길이 2~3문장 대응 |
| **CharacterMedallion** | **P-16 실측 확정** — sm/md/lg + ring-offset. approvals §9.2가 "Stage 2에서 design-agent 실측 후 확정" 으로 지정. 사용처: `179:1703/1704`(Welcome) · `179:1750/1751`(Intro) · `179:1822/1823`(Log in) |
| **CharacterIllustration** | `179:1819`(Baseline saved) 에셋 규격·해상도(Stage 1 D-4 파이프라인) |
| **SurveyQuestionCard** | `179:1783` — counter("Question 1 of 10") · eyebrow("IN THE PAST TWO WEEKS") · question · children(RadioGroup 6옵션). 제목 대비는 P-11 확정값 |
| **CharacterBubble** | Stage 2 사용 범위(Welcome·Intro 인사)만. Type3(Prompt 목록)는 Stage 4 |

### 15.5 화면별 상태 매트릭스

각 Stage 2 화면에 대해 Loading / Empty / Error+Retry / Offline / **Disabled(필수 동의 미체크)** / **Pending(VPC)** / **Fallback(persona)** / **Missing(score null)** 중 해당 상태를 P-10 확정 명세 위에서 배치한다.

### 15.6 접근성 · 반응형

- 다이아몬드 차트 대체 텍스트 문장 형식(값을 "판정" 언어로 읽지 않도록).
- 설문 카드의 스크린리더 순서(counter → eyebrow → question → 옵션), `aria-describedby` 연결.
- 필수 동의 미체크 disabled 버튼의 **이유 안내** 접근성 연결.
- 320 / 393 / 600 / 1024px 에서 5단계 위저드·동의 5항목·다이아몬드 차트 레이아웃.

### 15.7 Figma node 참조 목록 (시각 비교 기준)

`179:1701` · `179:1709` · `179:1710` · `179:1715` · `179:1722` · `179:1724` · `179:1726` · `179:1740` · `179:1742` · `179:1746` · `179:1748` · `179:1759` · `179:1764` · `179:1768` · `179:1770` · `179:1772` · `179:1775` · `179:1779` · `179:1780` · `179:1781–1783` · `179:1788` · `179:1804` · `179:1809` · `179:1814` · `179:1819` · `179:1820` · `179:1822/1823` · `179:1833` · `179:1839–1841` · `179:1843` · `179:1844` · `26:21` · `26:39` · `26:44` · `163:2145` · `31:118` · `76:417` · `76:428`

### 15.8 design-agent가 판단해 보고할 것

1. **P-16 medallion 크기 실측** — sm 136 · md 188의 Figma 근거 확인(현재 lg 232만 확인됨).
2. **§16 D-14(TextField `trailingAction` 밑줄)** 에 대한 design-agent 의견 — §9.0 원칙 적용 결과와 Design Spec §4.13 갱신안.
3. Figma `179:1748` 소개 문구("About 3 minutes · 10 cards")가 **5단계 전체** 소요 시간과 맞지 않는 점 — 대체 문구 제안(카피 확정은 사용자).
4. Figma `179:1724` 의 "YOUR CHILD" 섹션·단일 체크박스를 **사용하지 않는** 것이 시각 비교에서 "허용 차이"임을 Design Spec에 사전 기록.
5. Stage 2 신규 가값 후보(P-17…) 목록과 근거.
6. **Stage 1 design-agent 문서 갱신 7항목**(§17.1) 반영 완료 여부.

---

## 16. Stage 2에서 확정해야 할 세부 결정 (승인 체크포인트 O/X)

> 근거: `PLANNING §5 Stage 2` "Stage 2 Plan 세부: 한 역량 전부 결측 시 처리, 동의 문구(법무), 누락 화면별 C-13 선택", `API_CONTRACTS §3.4` 의 "Stage 2 Plan" 위임 항목, `ARCHITECTURE §7.4` "보관 상한·삭제 시점은 Stage 2 Plan", Stage 1 이월 4건.
> 전부 **RECOMMENDED** 이며 승인 전에는 구현하지 않는다. **D-2 · D-6 은 구현 착수 전 필수 결정**이다.

| ID | 결정 항목 | 권장안 | 근거 | 대안 (기각 사유) | O/X |
|---|---|---|---|---|---|
| **D-1** | `ChildInfoAnswers.lastName` 필수 여부 (API_CONTRACTS §3.4 "필수 여부 Stage 2 Plan", 법무 L-07) | **선택(optional)** — 두 칸은 유지(D-03, Figma `179:1740`)하되 `lastName` 은 `z.string().trim().max(40).optional()`, 빈 값으로 다음 단계 진행 가능. DB도 nullable 권장 | ① L-07(성 수집이 개정 COPPA 최소 수집에 맞는지)이 **미결**이다. 필수로 만들면 법무 결정이 "수집 불가"일 때 이미 수집한 데이터를 삭제해야 한다 ② 성은 화면·알림·AI 입력 어디에도 쓰이지 않는다(C-6 "호칭은 first name만") — 필수로 강제할 제품 근거가 없다 ③ 선택으로 두면 법무 결정이 어느 쪽이든 필드 제거/필수화 모두 비파괴적이다 | ① 필수 (기각 — L-07 미결 상태에서 수집을 강제. 결정이 반대면 데이터 삭제·migration 필요) ② 필드 제거 (기각 — D-03 사용자 수용 예외를 plan-agent가 뒤집는 것) | ☐ |
| **D-2** ★ | **한 역량의 문항이 모두 결측일 때(`score: null`) 처리·표시** (C-8이 명시적으로 Stage 2 Plan에 위임) | **① 점수**: `score: null` 유지(대체값 없음), `itemCount: 0`, `missingCount: n`. **② 다이아몬드**: 해당 축을 값 0이 아니라 **미관찰로 표현**(축 라벨은 표시, 정점은 그리지 않고 점선·중립 처리 — 시각 규격은 design-agent). 대체 텍스트도 "not observed yet" 로 읽는다. **③ 강점 2 / growing edge 2**: null 역량은 **후보에서 제외**. **④ 발전 역량 기본값**: null 역량은 `suggestedCapability` 후보에서 제외. **⑤ 전 역량 null**: `suggestedCapability: null` 을 허용하고 발전 역량 화면에서 사용자가 직접 고르게 한다(기본 미선택). **⑥ copy**: "아직 관찰할 기회가 없었던 영역" 톤, 점수 없음을 부족·미달로 서술하지 않는다 | ① 비채점 응답은 설계상 **"낮은 점수가 아니라 결측"** 이다(Baseline v1 원문: "recorded as missing data, not as a low score") ② 0·최저로 표시하면 PRD §7.3 "잘함/못함 판정이 아니다" 와 §8.4 긍정 언어 규칙을 정면으로 위반한다 ③ null 을 최저로 오인해 발전 역량 기본값으로 제시하면 **관찰되지 않은 영역을 약점으로 지목**하게 된다 ④ contracts가 이미 `score: null` 을 허용하므로 계약 변경이 없다 | ① 중앙값 3.0 대체 (기각 — 관찰되지 않은 것을 관찰값으로 위조. 이후 세션 분석과 비교 시 가짜 baseline) ② 0 또는 1.0 표시 (기각 — 최저 판정 언어) ③ 전 역량 결측 시 프로필 미발행 (기각 — 온보딩 완료가 막혀 Home 착지 불가, FR-03 중도 이탈 복귀와 충돌) ④ 해당 축을 차트에서 **완전히 제거** (기각 — 4축 다이아몬드 형태가 깨져 비교 불가) | ☐ |
| **D-3** | **Trial 로컬 draft 저장소 · 보관 상한 · 삭제 시점** (ARCHITECTURE §7.4 "Stage 2 Plan") | **저장소** `localStorage` 키 `haru.onboarding.draft.v1`(값은 `OnboardingDraftSchema` JSON). **보관 상한 30일**(`updatedAt` 기준, 경과 시 폐기 + "저장된 응답이 만료되었습니다" 안내). **삭제 시점** = ① `POST /v1/onboarding/submit` 성공 직후 ② 로그아웃 ③ `schemaVersion` 불일치 ④ parse 실패(손상) ⑤ 보관 상한 경과. 읽기·쓰기 모두 schema parse | ① draft는 수 KB 텍스트라 IndexedDB의 비동기·복잡도가 불필요하다 ② Guard·앱 기동 경로에서 **동기 읽기**가 가능해야 첫 렌더 깜빡임이 없다 ③ 30일은 "체험 후 며칠 뒤 가입" 을 커버하면서 아동 데이터를 무기한 남기지 않는 절충이다 ④ 삭제 시점 5종이 ARCHITECTURE §13 "로컬 데이터 — 제출 완료·로그아웃 시 삭제" 를 포함한다 | ① IndexedDB (기각 — 비동기 읽기로 Guard 판정 지연, 과한 복잡도) ② `sessionStorage` (기각 — 탭을 닫으면 유실되어 Trial 목적 미달) ③ 보관 무기한 (기각 — 아동 데이터 로컬 무기한 잔존, 최소 수집 원칙 위반) ④ 암호화 저장 (기각 — Frontend에 키를 둘 수 없어 실질 보호가 없다. 대신 삭제 시점을 강제) | ☐ |
| **D-4** | **동의 문서(`ConsentDocument.url`) 열기 방식** | **외부 링크로 연다** — `<a href={doc.url} target="_blank" rel="noopener noreferrer">`. Stage 2는 `/legal/*` page와 문서 본문 fixture를 **만들지 않는다** | ① 약관·방침 문구가 **법무 미확정**(L-02)이라 Frontend가 본문을 보유하면 잘못된 문구가 배포된다 ② PRD·Figma에 문서 뷰어 화면 요구가 없다(PLANNING §9.2의 `/legal/*` 는 Stage 표기가 없는 RECOMMENDED 항목) ③ C-13 질문 대상 화면을 1건 줄인다 ④ `ConsentDocument` 가 이미 `url` 을 제공한다 | ① in-app `LegalDocumentPage` (기각 — 문구 미확정, 본문 소유 주체 불명, C-13 화면 추가) ② Sheet로 본문 표시 (기각 — 같은 이유 + 긴 법률 문서에 부적합) | ☐ |
| **D-5** | **Route Guard 판정 구현 방식** | `useGuardDecision` 를 `useMe()` + **순수 함수 `resolveGuardDecision(me, pathname)`** 로 교체. `RouteGuard` 컴포넌트와 `useDecision` 주입 지점은 Stage 1 그대로 유지. `me` 미해결 = `pending`. 판정 결과가 현재 경로와 같으면 `allow` | ① 판정 순서(ARCHITECTURE §2.4)가 **한 곳**에 모여야 순서 규칙을 전수 테스트할 수 있다(AC-2-42) ② 순수 함수라 TanStack Query·Router 없이 단위 테스트가 가능하다 ③ Stage 1이 `useDecision` 주입 지점을 남겨둔 의도와 정확히 일치한다 | ① route별 개별 guard 컴포넌트 (기각 — 순서 규칙이 흩어져 누락·충돌 탐지 불가) ② loader/`redirect` 기반 (기각 — React Router framework mode 미사용(Stage 1 D-10), Mock Adapter 주입 경로와 어긋남) | ☐ |
| **D-6** ★ | **"온보딩 완료 && 프로필 결과 미확인 → `/onboarding/profile`"** 판정 데이터 (ARCHITECTURE §2.4 5행 — `MeResponse` 에 대응 필드 없음) | **Guard 판정에서 제외한다.** 제출 직후 흐름(`/onboarding/saved` → `/onboarding/profile` → `/onboarding/growth-capability` → `/`)을 **연속 네비게이션**으로 처리하고, Guard는 "온보딩 완료 → 요청 경로 허용" 까지만 판정한다. 프로필·발전 역량 화면은 완료 후에도 `/onboarding/profile` 로 **재진입 가능**(설정 없이도 URL 접근 허용) | ① `Me` 에 `profileResultAcknowledgedAt` 을 추가하면 **PRD 근거 없는 서버 계약·컬럼**이 생긴다(rules: PRD/Figma에 없는 요구사항 임의 추가 금지) ② 제출 성공 응답(`ProfileResult`)이 이미 화면 전환의 트리거이므로 Guard가 관여할 필요가 없다 ③ 로컬 플래그로 Guard를 돌리면 기기 변경 시 화면이 다시 뜨는 등 비결정적이다 ④ ARCHITECTURE §2.4는 **RECOMMENDED 경로 목록**이며 이 항목만 계약 근거가 없다 | ① `Me` 에 필드 추가 (기각 — PRD 근거 없음, Backend 요구 증가) ② 로컬 플래그로 Guard 판정 (기각 — 기기 간 불일치, 아동 관련 로컬 상태 추가) ③ `onboardingStatus` 에 `profile_pending` 값 추가 (기각 — DATA_MODEL 3값 CHECK 변경 + 서버 상태 증가) | ☐ |
| **D-7** | **로그아웃 확인 Dialog 사용 여부** (COMPONENT_MAP §1 Dialog 행: "로그아웃 확인(S2 — RECOMMENDED, PRD·Figma·결정 로그 근거 없음)") | **`ConfirmDialog` 사용** — "로그아웃하면 이 기기에 저장된 온보딩 응답이 삭제됩니다" 취지의 안내 포함 | ① 로그아웃이 **로컬 draft 삭제(비가역)** 를 동반한다(§5.4, AC-2-29). 되돌릴 수 없는 로컬 데이터 삭제를 오탭 한 번으로 실행시키면 안 된다 ② Stage 1에서 `ConfirmDialog` 가 이미 구현·검증되어 추가 비용이 없다 ③ Stage 8 탈퇴·삭제와 동일 패턴을 Stage 2에서 확립한다 | ① 즉시 로그아웃 (기각 — Trial draft 유실 위험) ② Toast로 undo 제공 (기각 — 삭제를 되돌리려면 draft를 지우지 않고 보관해야 해 §5.5 로컬 데이터 원칙과 충돌) | ☐ |
| **D-8** | **Stage 2 신규 Shared UI 범위** (Stage 1 §3.1에서 2·3·5·7로 이관된 12종 중 무엇이 Stage 2 필수인가) | **6종만**: `SelectTrigger`(Step 1 성별) · `SwipeDeck`(Step 5 `179:1770`) · `ListGroup`/`ListRow` **기본 행**(설정 목록) · `InfoRow`(`179:1748`) · `DividerWithLabel`(`179:1820`) · `TextLink`(Auth 전반). `PasswordToggle` 은 **TextField `trailingAction` 으로 흡수**(신규 컴포넌트 아님). **`SelectTrigger` 의 선택 UI는 기존 `Sheet` 재사용**. 제외: `TextArea`·`StarRating`(S5) · `SectionHeader`·`Carousel`·`Toggle`(S3) · `StatTile`(S7) | ① 6종 전부 Stage 2 화면에 **실제 사용처가 있다**(Figma node 근거 명시) ② 제외한 6종은 Stage 2 화면에 사용처가 없어 만들면 "다음 Stage 선행 구현"(rules/workflow §2) ③ `PasswordToggle` 은 COMPONENT_MAP §1이 이미 "TextField trailingAction 로 흡수 가능" 으로 판단했고, Figma `76:428` 도 Input 내부 요소다 ④ `Sheet` 재사용은 새 오버레이 패턴을 만들지 않아 z-index·scrim(P-05) 일관성을 유지한다 | ① FRONTEND_IMPLEMENTATION_PLAN §2.1의 7종 그대로(= `PasswordToggle` 별도 컴포넌트) (기각 — TextField와 중복 구현·상태 이원화) ② `TextArea` 선행 구현 (기각 — Stage 2 사용처 없음. Step 3 집 책 입력은 단일 행 TextField로 충분) ③ `SelectTrigger` 전용 드롭다운 신규 구현 (기각 — Sheet와 중복, 모바일 앱 컬럼에서 드롭다운은 부적합) | ☐ |
| **D-9** | **SwipeDeck 제스처 구현 방식** (#9 Stack 외 라이브러리 승인 필요) | **라이브러리 미도입** — CSS `scroll-snap` + Pointer Events로 구현하고, **이전/다음 버튼과 키보드 조작을 1급 경로**로 제공한다(`179:1772` back / `179:1775` forward IconButton 활용). 모션은 CSS transition + `prefers-reduced-motion` 존중 | ① 결정 #9가 "제스처·애니메이션은 CSS / Pointer Events 우선" 으로 이미 승인되어 있다 ② WCAG 2.5.1(포인터 제스처)은 **단일 포인터 대체 수단**을 요구한다 — 버튼이 1급이면 제스처는 부가 기능이라 구현 난이도가 크게 낮아진다 ③ 번들 증가·시각 결정성 저하(Playwright baseline)를 피한다 | ① `embla-carousel` / `framer-motion` 도입 (기각 — Stack 확장 승인 필요(#9), 번들 증가, 시각 baseline 불안정) ② 제스처 전용 (기각 — WCAG 2.5.1 위반, AC-2-25 FAIL) | ☐ |
| **D-10** | **생년월 입력 UI와 3~9세 검증 위치** (API_CONTRACTS §3.4 "범위 검증은 clock 주입 refine") | **입력**: 년·월 2단 `SelectTrigger`(Figma `179:1740` 은 TextField + age Tag이나, 자유 텍스트는 오입력·로캘 문제가 크다 — 최종 형태는 design-agent). **검증**: contracts에 `createBirthYearMonthSchema(now: Date)` **팩토리**를 두고 형식(`YYYY-MM`) + 3.0세~9.99세 범위를 refine. 범위 밖이면 `VALIDATION_FAILED` 필드 에러. **나이 Tag("3yr 4mo")는 입력에서 파생 표시**(서버 값 아님) | ① `packages/contracts` 는 `zod` 외 런타임 의존이 없고 순수해야 한다 — `new Date()` 를 schema 안에서 직접 부르면 테스트가 비결정적이 된다(Stage 1 결정성 원칙) ② 팩토리는 Mock·테스트·향후 Backend가 같은 규칙을 공유하면서 시간을 주입할 수 있다 ③ C-10(3~9세 가입 허용)을 **입력 단계에서** 막아야 이후 콘텐츠 추천이 범위를 벗어나지 않는다 | ① schema 내부에서 `new Date()` 호출 (기각 — 비결정적, 테스트 불가) ② 범위 검증을 서버에만 맡김 (기각 — Trial 구간은 서버가 없어 검증 자체가 없어진다) ③ 자유 텍스트 입력 유지 (기각 — 로캘·오입력 처리 비용. 단 Figma 대비 의도된 차이로 기록 필요) | ☐ |
| **D-11** | **온보딩 저장 트리거** (중도 저장 FR-03) | **로컬 draft**: 입력 변경 시 debounce **400ms**. **서버 draft**(동의 후): step "다음"/"이전" 이동 시 `PUT /v1/onboarding/steps/:step` **1회**. 키 입력마다 서버 전송하지 않는다 | ① 아동 데이터를 키 입력마다 전송하면 불필요한 네트워크 노출이 늘고(최소 전송), 요청 로그 검사(AC-2-13)도 복잡해진다 ② step 단위 저장이 "중도 이탈 후 동일 step 복귀"(FR-03) 요구를 정확히 충족한다 ③ 400ms debounce는 로컬 쓰기 비용이 낮고 크래시·새로고침 손실을 최소화한다 | ① 키 입력마다 서버 저장 (기각 — 과도한 전송, 동의 경계 검증 복잡) ② 마지막 step에서만 저장 (기각 — 중도 이탈 복귀 불가, FR-03 위반) ③ 자동 저장 없음(명시 버튼) (기각 — PRD §7.2 "중도 이탈 시 이어서 진행") | ☐ |
| **D-12** | **Playwright 시각 임계값 보강** (Stage 1 결정 `S1-D2-6` = `maxDiffPixelRatio: 0.002` + `maxDiffPixels: 200`. 전체 프레임 baseline에서 21px 아이콘 교체를 놓칠 수 있음) | **baseline을 2종으로 분리**한다. ① **영역 클립 baseline**(`clip` 또는 `locator.screenshot()`) — Figma 대조 대상·컴포넌트 단위. 임계값 `maxDiffPixelRatio: 0.002` + **`maxDiffPixels: 20`**. ② **전체 프레임 baseline** — 레이아웃 회귀 전용. 기존 `0.002 / 200` 유지. Stage 2 신규 화면의 Figma 대조(AC-2-56)는 **①로 수행**한다 | ① 작은 요소의 변경이 큰 캔버스 넓이로 희석되는 문제는 **임계값이 아니라 캡처 범위**의 문제다 — 범위를 좁히면 같은 비율로도 민감해진다 ② 전체 프레임 임계값을 20으로 낮추면 폰트 렌더·안티앨리어싱 차이(Stage 1 AD-1·AD-2)로 상시 실패한다 ③ Stage 1이 이미 `v1-button` 등 **영역 baseline 10건**을 만들어 패턴이 검증되어 있다 | ① 전체 프레임 임계값만 낮춤 (기각 — 폰트·안티앨리어싱 노이즈로 상시 FAIL) ② `maxDiffPixels: 0` 전면 적용 (기각 — 플랫폼·DPR 미세차로 재현 불가) ③ 현행 유지 (기각 — 아이콘·라벨 교체를 탐지하지 못한다는 Stage 1 지적이 해소되지 않음) | ☐ |
| **D-13** | **`useScrolledPast` 스크롤 주체 수정** (stage-1-handoff §18.8 — `window` 를 구독하나 실제 스크롤 주체는 AppShell 뷰포트 div. Stage 2에서 TopBar 실사용) | `AppShell` 이 스크롤 컨테이너 ref를 **context로 제공**하고, `useScrolledPast(threshold)` 가 그 컨테이너의 `scrollTop` 을 구독한다. **`getSnapshot` 이 boolean을 반환**하도록 바꿔 스크롤마다 리렌더되지 않게 한다. 컨테이너가 없으면(gallery 등) `window` 로 폴백 | ① 원인이 "구독 대상이 틀렸다" 이므로 대상만 바꾸는 최소 수정이다 ② boolean snapshot은 `useSyncExternalStore` 의 권장 사용법이고, 스크롤 성능 문제를 함께 없앤다 ③ 폴백을 두면 dev gallery·테스트 환경이 깨지지 않는다 | ① `IntersectionObserver` sentinel (기각 — `root` 로 같은 컨테이너 ref가 여전히 필요해 복잡도만 증가) ② TopBar를 항상 glass로 (기각 — Design Spec §6.1 스크롤 전환 규격을 임의 폐기) ③ 수정 보류 (기각 — Stage 2가 TopBar 첫 실사용처. 미수정이면 AC-2-61 FAIL) | ☐ |
| **D-14** | **`QA-1-002` — TextField `trailingAction`("Show") 밑줄** (Figma `76:417` 에는 없음. WCAG 1.4.1 관점에서는 밑줄이 개선). Stage 2 Auth 화면이 실사용 | **`text-decoration: underline` 을 제거해 Figma `76:417` 에 맞춘다.** 동시에 ① Design Spec §4.13에 "색만으로 구분 — WCAG 1.4.1 미달" 을 명시하고 ② **신규 가값 `P-17`(trailingAction 구분 방식)** 로 등록해 디자이너 결정 대기 상태로 둔다 | stage-1-approvals **§9.0 사용자 일반 원칙**을 그대로 적용한 결과다: "접근성 기준에 미달하는 값은 Figma를 우선해 그대로 두되 `provisional` 표시를 유지해 나중에 '접근성을 맞춰라'는 지시가 오면 토큰만 교체할 수 있게 한다." 같은 문서가 `QA-1-002` 를 **명시적으로 이 원칙의 적용 대상**으로 지목했다. 원칙을 적용하면 Figma(밑줄 없음)가 이기고, 교체 경로는 `P-17` 로 열어둔다 | ① 밑줄 유지 (기각 — §9.0 원칙과 반대 방향으로 Visual Source of Truth를 흔든다. **단 사용자가 "여기는 접근성을 맞춰라"로 판단하면 이쪽이 정답이며, 그 경우 §9.0 예외로 기록한다**) ② 밑줄 대신 아이콘 추가 (기각 — Figma에 없는 요소 신규 추가, 차이가 더 커짐) ③ 판단 보류 (기각 — Stage 2 Auth 화면 3개가 실사용하므로 이번에 정해야 baseline이 안정된다) | ☐ |
| **D-15** | **Stage 2 신규 런타임 의존 · 브랜드 에셋** | **신규 런타임 의존 0건.** 차트는 inline SVG(#9), 제스처는 CSS/Pointer Events(D-9), 아이콘은 기존 Lucide 1.47.0. **브랜드 에셋**: Google "G" 로고는 Figma `179:1710` 대신 **Google 공식 브랜드 에셋**을, Apple은 **Apple 공식 "Sign in with Apple" 버튼 가이드**를 따른다(자체 SVG/CSS 구현, 색·여백·문구 규격 준수). 에셋은 `packages/ui/src/icon/brand/` 에 두고 **수정 금지** 주석을 단다 | ① rules/frontend §1 "브랜드 로고는 공식 에셋만 사용한다" ② ARCHITECTURE §7.1이 Apple Guideline 4.8 재확인을 요구하고 C-13이 "Apple 공식 가이드 버튼" 을 확정했다 ③ 의존 0건이면 Stage 1의 시각 결정성·번들 검사(AC-2-66)가 그대로 유지된다 | ① 소셜 로그인 버튼 라이브러리 (기각 — 승인 필요·번들 증가·브랜드 규격 통제 불가) ② Figma 로고 export 사용 (기각 — 브랜드 가이드 위반 가능성. Figma 값이 공식 에셋과 일치하는지 design-agent가 확인해야 함) | ☐ |
| **D-16** | **Step 1의 보호자 관계·타임존 전송 경로** (DATA_MODEL: `relationship`·`timezone` 은 `caregiver_profiles` 컬럼, 아동 데이터 아님) | **`ChildInfoAnswers` 에 넣지 않고 `PATCH /v1/me`(`UpdateCaregiver`)로 별도 전송**한다. `timezone` 은 사용자 입력이 아니라 `Intl.DateTimeFormat().resolvedOptions().timeZone` 감지값으로 **동의 직후 1회** 전송. `languageEnvironment`·`readingRoutine` 은 `children` 컬럼이므로 `ChildInfoAnswers` 에 포함. `consent_events.source` 는 `ConsentSource` enum으로 contracts에 정의 | ① 보호자 소유 데이터와 아동 소유 데이터를 한 payload에 섞으면 **동의 가드 경계가 흐려진다** — "동의 전에는 아동 데이터만 막는다" 는 규칙을 요청 단위로 검증할 수 없게 된다(AC-2-13) ② DATA_MODEL의 테이블 소유권과 1:1로 맞아 Backend가 payload를 분배할 필요가 없다 ③ `PATCH /v1/me` 는 이미 API_CONTRACTS §4 Stage 2 표에 있다 | ① 전부 `ChildInfoAnswers` 에 넣고 서버가 분배 (기각 — 동의 경계 검증 불가, 테이블 소유권과 불일치) ② `relationship` 을 가입 화면에서 수집 (기각 — C-5 "가입 화면은 보호자 이름·이메일·비밀번호만") ③ `timezone` 을 사용자에게 입력받음 (기각 — PRD에 요구 없음, 불필요한 입력 부담) | ☐ |
| **D-17** | **Step 3 책 검색의 Stage 2 범위** (API_CONTRACTS는 `GET /v1/books/search` 를 Stage 2 그룹에 두었으나 PLANNING Stage 2 `[C·M]` 목록에는 books가 없다) | **최소 범위로 Stage 2에 포함**: `GET /v1/books/search` + `BookSummarySchema{id, title, author, coverUrl?}` + `books` Mock 그룹(공통 5종 scenario). **제외**: `LibraryBook`·소유/증정 상태·`BookPrompts`·`gift-requests`·서재 화면 = Stage 3. 검색 결과 없음(`empty`) → **제목 직접 입력** 경로 필수 | ① PRD §7.2 Step 3가 "좋아하는 책 검색 선택(최대 5권)" 을 명시하고 이는 FR-03(Stage 2)의 일부다 — 미구현이면 5단계 온보딩이 완결되지 않는다 ② PRD §7.2 규칙 "자체 DB에 없으면 제목 텍스트로 저장" 이 Step 3의 필수 예외 UX다 ③ `BookSummary` 최소 형태는 Stage 3 `LibraryBook` 의 부분집합이라 확장이 비파괴적이다 | ① Step 3를 검색 없이 자유 입력만으로 (기각 — PRD §7.2 "검색 선택" 명시) ② Step 3 전체를 Stage 3로 이월 (기각 — 온보딩 5단계가 Stage 2 In Scope(FR-03)이고 C-9가 순서를 확정했다) ③ Stage 3 `LibraryBook` 전체를 미리 정의 (기각 — 다음 Stage 선행 구현) | ☐ |

★ = 구현 착수 전 필수 결정.

---

## 17. Stage 1 이월 항목 처리 계획

### 17.1 design-agent 문서 갱신 잔여 7항목 — **Stage 2 design 단계 전 처리**

| # | 대상 | 갱신 내용 | 근거 |
|---|---|---|---|
| 1 | Design Spec **§4.19** | `PageIndicator` 의 `interactive` variant **삭제**(표시 전용 확정) | stage-1-approvals §8 `S1-G-1` |
| 2 | Design Spec **§8.1** | 탭 아이콘 대응표 → `book` · `chart-no-axes-column-increasing` | 〃 `S1-D2-5` |
| 3 | Design Spec **§9.3** | 터치 타깃 표에 **TextField 행(42px) 추가** + `S1-G-2` 수용 예외 표기 | 〃 `S1-G-2` |
| 4 | Design Spec **§10.3** | 시각 임계값 `maxDiffPixelRatio 0.002` / `maxDiffPixels 200` 확정 표기 (+ §16 D-12 승인 시 영역 baseline 임계값 추가) | 〃 `S1-D2-6` |
| 5 | Design Spec **§2.2** | `BottomTabBar` `fixed` → **`sticky`**, 화면 골격 다이어그램의 **스크롤 영역 순서**(스크롤 컨테이너가 `AppColumn` **바깥**) 정정 | stage-1-handoff §18.2 · §18.8 NEEDS_DECISION 1·2 |
| 6 | Design Spec **§3.6** | provisional 항목을 **남은 5건**(P-01·P-02·P-04·P-05·P-16)으로 갱신 | stage-1-approvals §9.4-2 |
| 7 | `docs/COMPONENT_MAP.md` | 위 1·2·3 반영 + Stage 2 신규 6종(D-8) 행 갱신 | 〃 |

추가로 design-agent 소관 정보 항목 3건(`S1-E-1` `border-subtle` → `border-border-subtle`, `S1-B-3` §14 요약 수치, `S1-D2-3` `role="list"` 제거)도 같은 패스에서 정리한다.

> **plan-agent는 Design Spec을 수정하지 않는다.** 이 표는 design-agent에게 전달할 작업 목록이며, Orchestrator는 design 단계 시작 시 이 7항목을 먼저 지시한다.

### 17.2 development-agent 이월 작업

| # | 항목 | 처리 | AC |
|---|---|---|---|
| 1 | `useScrolledPast` 스크롤 주체 | §16 D-13 승인안대로 수정 | AC-2-61 |
| 2 | `apps/web/src/dev/ui-gallery/provisionalItems.ts` | 16항목 → **남은 5건**(P-01·P-02·P-04·P-05·P-16)으로 축소. 확정 11건 제거 | AC-2-62 |
| 3 | `packages/design-tokens` `provisional` 주석 | stage-1-approvals §9.4-1이 이미 지시한 10건 제거가 반영되었는지 확인(미반영 시 Stage 2-A에서 수행) | AC-2-62 |
| 4 | `QA-1-002` TextField `trailingAction` | §16 D-14 승인 결과 반영 + baseline `v5-field` 재생성 | AC-2-56 |
| 5 | 시각 baseline 체계 | §16 D-12 승인 시 영역 클립 baseline 도입 | AC-2-56 |
| 6 | `QA-1-004` `devWarn` | 주석 정정 + `import.meta.env.DEV` 게이트 추가(AC는 PASS였으나 정보 항목으로 남아 있음) | AC-2-63 |
| 7 | `PlaceholderPage` | `HomePage`(skeleton)로 **교체 후 삭제** | AC-2-39 |

### 17.3 가값(P-01 · P-02 · P-04 · P-05 · P-16) 재제시 절차

stage-1-approvals §9.4-3 "남은 5건은 Stage 2 이후 해당 화면이 나올 때 재제시한다" 에 따른다.

| P | Stage 2 첫 실사용처 | 재제시 시 함께 제시할 것 |
|---|---|---|
| **P-01** `--color-fg-secondary/-tertiary` | Auth·온보딩 helper 텍스트, 설문 eyebrow, 프로필 보조 설명 | 실측 대비값(2.91~3.13:1) + 실제 화면 스크린샷 |
| **P-02** 비텍스트(진행 바·별점·칩 경계·배지 글자) | 온보딩 **진행바**, Step 3 주제 태그 Chip, 프로필 **CapabilityBadge**·다이아몬드 축 색 | 배지 흰 글자 1.56~1.86:1 + 실제 화면 |
| **P-04** status 색(info/success/warning/error) | 필드 에러(가입·Step 1), 동의 필수 미체크 안내, **`vpc-failed`** InlineAlert | 오류·경고 톤이 "양육자가 불안을 만나는 지점" 이라는 §9.2 사유 |
| **P-05** `--color-scrim` | **성별 선택 Sheet**(D-8), 로그아웃 ConfirmDialog(D-7) | 실제 Sheet 내용 위 분리감(모바일 실기기 권장) |
| **P-16** medallion sm/md/lg + ring-offset | `CharacterMedallion` — Welcome `179:1703/1704` · Intro `179:1750/1751` · Log in `179:1822/1823` | **design-agent Figma 실측 결과**(§15.8-1). approvals §9.2가 Stage 2 실측을 명시 |

절차: **Stage 2 Verdict 보고 후 · Stage 3 착수 전**에 Orchestrator가 P-01 → P-16 순서로 하나씩 `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지` 를 받는다. 신규 가값은 `P-17…` 로 추가한다(§16 D-14가 `P-17` 후보).

---

## 18. 보고 항목 — 문서 불일치 · 확인 요청

> 승인된 결정을 뒤집는 제안이 아니라, 구현 전에 **표기·범위 수준의 정합**을 맞추기 위한 보고다. ①~③은 Stage 2 구현에 영향이 있고, ④~⑦은 문서 동기화다.

| # | 항목 | 내용 | 이 Plan의 처리 |
|---|---|---|---|
| ① | **ARCHITECTURE §2.4의 "프로필 결과 미확인" 단계에 계약 근거가 없다** | Guard 5번째 단계가 `MeResponse` 필드로 표현되지 않는다 (`onboardingStatus` 3값뿐) | **§16 D-6** — Guard 판정에서 제외하고 연속 네비게이션으로 처리 권장. 승인 시 ARCHITECTURE §2.4 주석 갱신 필요 |
| ② | **`GET /v1/books/search` 의 Stage 배정 불일치** | API_CONTRACTS §4는 **Stage 2** 그룹에 두었고, PLANNING §5 Stage 2 `[C·M]` 목록과 FRONTEND_IMPLEMENTATION_PLAN §2.1에는 books가 **없다**. §5.3 scenario 표의 `books` 그룹 "필요 Frontend Stage" 는 **3** | **§16 D-17** — 최소 범위로 Stage 2 포함 권장. 승인 시 API_CONTRACTS §5.3 `books` 행에 "Stage 2(검색만) / Stage 3(서재)" 표기 추가 |
| ③ | **`PATCH /v1/me` 의 Stage 2 필요성이 문서에 드러나지 않음** | PRD §7.2 Step 1이 **관계**를 수집하는데, `relationship`·`timezone` 은 `caregiver_profiles` 소유라 `ChildInfoAnswers` 로 보낼 수 없다 | **§16 D-16** — `PATCH /v1/me` 를 Stage 2 In Scope로 명시(§7.2 표) |
| ④ | **신규 enum 3종이 API_CONTRACTS §2.2 표(22종)에 없다** | `ConsentSource`(DATA_MODEL `consent_events.source` 4값) · `OnboardingStatus`(`caregiver_profiles.onboarding_status` 3값) · `Plan`(PRD §7.1 Free 부여) | contracts에 추가하고, **API_CONTRACTS §2.2 표 갱신은 Plan 승인 후 plan-agent가 수행**(rules/workflow §5 문서 소유). Stage 1 "enum 23종" 표기는 **26종**이 된다 |
| ⑤ | **API_CONTRACTS §5.3 `books` 행의 최초 Stage** | ②와 동일. §5.4 catalogue의 `empty` 는 Stage 1부터라 key 자체는 문제 없음 | ②의 처리에 포함 |
| ⑥ | **디자이너 수정 요청 (Figma) — Stage 2 해당분** | ⓐ `179:1724` "YOUR CHILD" 섹션 `179:1740` · 단일 동의 체크박스 `179:1742`/`179:1745` 제거 (C-5 · C-1) ⓑ `179:1748` "About 3 minutes · 10 cards" → **5단계 전체** 소요 시간 문구 (C-9) ⓒ `179:1788` 옵션 5개 → **6개**(비채점 옵션 추가) (C-8) | Figma 수정은 **디자이너 몫**. 구현은 수정 없이 진행하고, 차이를 AC-2-56 "허용 차이" 로 사전 기록 (§15.8-4) |
| ⑦ | **`docs/DATA_MODEL.md` 의 "Stage 2 Plan" 위임 표기 2건** | `children.last_name` "필수 여부는 Stage 2 Plan", `capability_scores.score` "한 역량 문항이 모두 결측일 때 처리는 Stage 2 Plan" | **§16 D-1 · D-2** 승인 결과로 DATA_MODEL §6 갱신 (Plan 승인 후 plan-agent 수행) |
| ⑧ | **Stage 1 결정 ID 표기 혼선** | 시각 임계값 결정이 `docs/decisions/stage-1-approvals.md` §8에는 **`S1-D2-6`**, 일부 인계 메모에는 `S1-G-6` 으로 지칭됨 (`WORKFLOW_STATE` §3의 `S1-G-6` 은 StrictMode 이중 마운트 건) | 이 Plan은 **`S1-D2-6`** 을 정본으로 쓴다 (§16 D-12) |

**PRD ↔ Figma 불일치 (Stage 2 범위) — 신규 발견 없음.**
Stage 2 관련 불일치는 전부 이미 해소·기록되어 있다: M-01·M-02·M-27(→ C-1·C-2), M-03(→ C-8·D-04), M-04(→ C-10), M-05(→ C-11), M-06·M-07·M-16(→ C-13·C-9), M-13(→ #14), M-28(→ C-5·C-6·D-03), M-38(→ C-7), M-33·M-34(→ #18·D-01·P-01~P-03). 미결 M-09~M-15·M-25·M-26·M-29~M-31은 Stage 3~7 항목이다.

---

## 19. 요약 — 승인 체크포인트 제시용

- **In Scope**: FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-24 + 로그아웃(§7.8) + **Home skeleton(#33)** + NFR(최소 수집 · VPC 슬롯 · 접근성 · 보안 · 로그 PII) + 기술 요구사항(Route Guard 판정 · Shared UI 6종 · Stage 1 이월 정리)
- **Out of Scope**: Home 콘텐츠·BottomTabBar 마운트·서재·세션·녹음·회고·분석·리포트·데이터 관리·탈퇴·동의 이력·동의 철회(C-4 — MVP 제외), `apps/mobile`, Backend 전부
- **Deliverables**: `packages/contracts` 도메인 schema 22개 파일 + `rules/capability-score` · `packages/ui` 6종 추가(22 → 28) · `apps/web` route 15 / feature 5 / entity 5 / Mock 도메인 6
- **Acceptance Criteria**: **68건** (AC-2-01 ~ AC-2-68)
- **Mock scenario**: **17 key** (§5.4 catalogue만, 신규 key 0)
- **확정 필요 결정**: **D-1 ~ D-17** (§16) — 전부 RECOMMENDED. **D-2(score null 표시) · D-6(프로필 결과 Guard 단계) 는 구현 착수 전 필수**
- **C-13 Figma 누락 화면**: **13건** (§15.1) — 화면별로 ① 디자이너 Figma 요청 / ② design-agent 명세 선택 필요
- **`BACKEND_INTEGRATION_PENDING` 예상**: **11건** (P2-BIP-01 ~ P2-BIP-11, §10)
- **Blocking**: Plan 단계 없음 / **Design 단계 = C-13 13건** / **구현 단계 = D-2 · D-6**
- **신규 라이브러리**: **0건** (§16 D-15). 브랜드 에셋(Google 로고 · Apple 버튼)만 추가
- **가값**: P-01 · P-02 · P-04 · P-05 · P-16 — Stage 2가 첫 실사용처, Stage 2 QA 후 재제시 (§17.3). `P-17` 후보 = §16 D-14
