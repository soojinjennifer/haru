# HARU PLANNING

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (Rev 6: #33 · C-19 반영)
Decision log: `docs/decisions/stage-0-approvals.md` — 이 문서와 다르면 결정 기록이 우선한다.
Based on: PRD v1.4 (`docs/source/HARU_PRD_v1.4.md`), Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` (node 확인: design-agent `docs/FIGMA_SCREEN_MAP.md` · `docs/COMPONENT_MAP.md` · `docs/DESIGN_SYSTEM.md` · `docs/DESIGN_TOKEN_MAP.md` · `docs/FRONTEND_IMPLEMENTATION_PLAN.md`, DRAFT 2026-09-14), `CLAUDE.md` Development Scope 및 `.claude/rules/*.md` (Frontend-only 개정, 2026-09-14), `docs/source/prompts/01-stage0-1-1-frontend-scope.md` (사용자 지시 원문), `docs/ARCHITECTURE.md` · `docs/DATA_MODEL.md` · `docs/API_CONTRACTS.md` (DRAFT Rev 5, 2026-09-14), `docs/decisions/stage-0-technical-research.md`
Author: plan-agent (2026-09-14)

라벨: `CONFIRMED` / `RECOMMENDED` / `NEEDS DECISION` (ARCHITECTURE.md 머리말 참조)
- 사용자 결정 항목: `CONFIRMED (사용자 결정 2026-09-14, #id)` — id는 결정 기록 §1의 번호(#n 또는 C-n)
- 디자이너 결정 전 가값: `가값 (P-xx)` (결정 기록 §4) · 법무 검토 대기: `NEEDS DECISION (법무, L-xx)` (결정 기록 §6) · 사용자 수용 예외: `D-xx` (결정 기록 §3)

표기:
- **[FE]** = Frontend 구현 (development-agent)
- **[C·M]** = `packages/contracts` 정의 + `apps/web/src/mocks` Mock Adapter·시나리오
- **[HO]** = **Backend Handoff 요구사항** — 문서화만, 이 프로젝트에서 구현하지 않음. 대상 문서 약어:
  `BH` = `docs/BACKEND_HANDOFF.md` · `AC` = `docs/API_CONTRACTS.md` · `DR` = `docs/DATA_REQUIREMENTS.md` · `AR` = `docs/AUTH_REQUIREMENTS.md` · `RU` = `docs/RECORDING_UPLOAD_SPEC.md` · `AP` = `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` · `EC` = `docs/ERROR_CODES.md`
- **PENDING** = QA에서 `BACKEND_INTEGRATION_PENDING` 으로 판정될 예상 항목 (rules/qa.md §1)

---

## 1. Stage Status

| Stage | 제목 | Backend 처리 | 상태 |
|---|---|---|---|
| 0 | Frontend Architecture + Figma Mapping + Agent Setup + Design System + API Contract Planning | 설계만 | **승인 완료 (2026-09-14)** |
| 1 | Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure (웹 전용, `apps/mobile` 없음 — #7) | 없음 | 시작 전 |
| 2 | Auth + Consent + Onboarding + Child Profile (Frontend) | Mock | 시작 전 |
| 3 | Home + Activity Card + Library + Book Selection + Recommendation (Frontend) | Mock | 시작 전 |
| 4 | Storytime Session + Recording Client + Pause/Resume + Prompt Drawer + Local Recording + Upload UX (+ Capacitor 셸 `apps/mobile`·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter·portrait lock — #7, #12) | Upload Contract + Mock | 시작 전 |
| 5 | Reflection + Async Analysis Status + Short Feedback (Frontend) | Analysis Mock | 시작 전 |
| 6 | Personalization + Profile Update + Recommendation Loop (Frontend) | Recommendation Mock | 시작 전 |
| 7 | 4-Week Report + History + Highlight Audio + PDF UX (Frontend) | Report Mock | 시작 전 |
| 8 | Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능(필수: 데이터 관리·탈퇴, C-15 / 선택: 동의 이력 보기, C-19) + Mock 데모 웹 프리뷰 배포(C-18) + Backend Handoff Package | Handoff 문서 7종 → **STOP** | 시작 전 |

Stage 1 구현은 사용자의 명시적 승인 전까지 시작하지 않는다 (CONFIRMED). Stage 요청은 Plan/Design Spec 승인이 아니다 (rules/workflow.md §3).

## 2. 개발 범위 — Frontend-only (CONFIRMED, 사용자 지시 2026-09-14)

원문 `docs/source/prompts/01-stage0-1-1-frontend-scope.md`, 반영 `CLAUDE.md` Development Scope. **Resolved**: M-24 (내부 문서 범위 충돌), OAQ-01 (Delivery Mode), §10 #2 (Delivery Mode 결정). 이전 Rev의 "Mode F / Mode B" 비교는 폐기했다.

| 구분 | 내용 |
|---|---|
| 최종 목표 | Frontend Complete → Frontend QA PASS → Backend Handoff Package 생성 → **STOP** |
| 이 프로젝트에서 구현 | `apps/web`, `apps/mobile` (Capacitor 셸 — Stage 4에서 생성, CONFIRMED (사용자 결정 2026-09-14, #7)), `packages/contracts`, `packages/design-tokens`, `packages/ui`, `packages/config`, `apps/web/src/mocks` |
| 구현 금지 (사용자 별도 명시 요청 전) | Node/Express API, Backend route/controller/service/repository, Supabase migration·server logic·RLS·Storage server logic, STT/AI backend, Analysis Worker, Background/Cron Job, Render backend 배포, Production DB schema 적용. `apps/api/`, `supabase/` 미생성 |
| Backend 관련 수행 | API Contract, Request/Response Schema, Error Code, Authentication Requirement, Data Requirement, State Definition, Storage Requirement, Recording Upload Contract, Async Analysis Contract, Mock API, Mock Data, Backend Handoff Documentation |
| QA 판정 | 실제 Backend가 필요한 항목은 `BACKEND_INTEGRATION_PENDING` — 그 Frontend 부분은 별도 판정. Contract/Mock 자체 오류는 `FAIL` |
| Stage 8 산출물 | `BACKEND_HANDOFF.md`, `API_CONTRACTS.md`, `DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md`, `RECORDING_UPLOAD_SPEC.md`, `ANALYSIS_PIPELINE_REQUIREMENTS.md`, `ERROR_CODES.md` + `packages/contracts` 최종 검증 + Mock 모드 웹 프리뷰 정적 배포 (CONFIRMED (사용자 결정 2026-09-14, C-18) — 앱 테스트 빌드·Backend 배포 제외, 호스팅 서비스는 Stage 8 Plan) |
| 자동 시작 금지 | Backend implementation, Supabase migration, Node API, STT, AI Analysis, Render deployment |

## 3. 8-Stage 정의

사용 제목은 §1 표 (사용자 지시 2026-09-14, CONFIRMED). 이전 자료의 제목은 이력으로만 기록한다.

| Stage | 이전: `docs/source/prompts/01-stage0-1.md` (Full-Stack 초안) | 이전: `docs/source/prompts/stage-structure-overall.md` | 현재 해석 |
|---|---|---|---|
| 0 | Architecture + Figma Mapping + Design System | 동일 | + Agent Setup + API Contract Planning |
| 1 | Project Foundation + Shared UI | Project Foundation (Monorepo / Router / Layout / UI Components) | + Router + Layout + Design Tokens + **Mock Infrastructure**. 웹 전용 — `apps/mobile` 생성하지 않음 (#7) |
| 2 | Auth + Consent + Onboarding + Child Profile | Auth + Caregiver + Child Profile | Frontend + Mock |
| 3 | Home + Activity Card + Library + Recommendation | Today Card (Context / Capacity / Book Selection) | + Book Selection, 추천은 Mock 응답 표시 |
| 4 | Storytime Session + Recording + Storage | Storytime (Recording + Consent + Storage) | **Recording Client** + Local Recording + Upload UX (Storage는 Upload Contract + Mock) + **Capacitor 셸 `apps/mobile`·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter·portrait lock** (#7, #12) |
| 5 | Reflection + Async Analysis Pipeline | Post Reading / Reflection + Conversation Guide | Reflection + **분석 상태** + Short Feedback (파이프라인은 Handoff) |
| 6 | Personalization + Profile Update + Recommendation Loop | AI Insight / Recommendation Pipeline | 업데이트·추천 결과 표시 (Recommendation Mock) |
| 7 | 4-Week Report + PDF + History | Growth Report / Inner Compass / History | + Highlight Audio + **PDF UX** (생성은 Handoff) |
| 8 | Privacy + Accessibility + Responsive + Regression + Deployment | Privacy / Responsive / Regression / Deploy | Frontend Final QA + Accessibility + Responsive + Regression + **이월 기능** + **Mock 데모 웹 프리뷰 배포** + **Backend Handoff Package → STOP**. 이월 기능 = 이전 "Privacy" Stage의 FR-21 데이터 관리 UI(P0)·탈퇴 — **Stage 8 유지 CONFIRMED (사용자 결정 2026-09-14, C-15)**; 동의 이력 보기는 선택 기능 (C-19, 미구현 시 QA FAIL 아님). 배포 = Mock 모드 웹 정적 호스팅만, 앱 테스트 빌드·Backend 배포 없음 — CONFIRMED (사용자 결정 2026-09-14, C-18) |

"Conversation Guide"(이전 Stage 5 제목)는 PRD의 Prompt(§7.4, §8.2)·Prompt 모아보기(FR-11)에 해당하며 Stage 3/4에 매핑되어 있다.

## 4. Requirement → Stage Mapping

각 행은 **Frontend 부분(Stage)** 과 **Backend Handoff 요구사항(대상 문서)** 을 분리한다.

### 4.1 Functional Requirements (PRD §10)

| ID | 요구사항 (요약) | P | FE Stage | Frontend 부분 [FE]/[C·M] | Backend Handoff 요구사항 [HO] |
|---|---|---|---|---|---|
| FR-01 | 이메일·Apple/Google 가입·로그인·비밀번호 재설정 | P0 | **2** | 가입(보호자 이름·이메일·비밀번호만 — C-5)·로그인·재설정 화면, `AuthGateway` interface + `MockAuthGateway`(Web), Route Guard, 토큰 만료 UX, 모든 가입 경로 뒤 동의 화면(C-2). Apple 버튼 = Apple 공식 가이드 버튼(C-13). 네이티브 Apple/Google Adapter는 **Stage 4** (#7) | 토큰 발급·검증, OAuth provider·nonce·재설정 메일, 실제 Auth Adapter 연동 (AR, BH) — PENDING |
| FR-02 | 보호자 동의 수집·기록 | P0 | **2 → 4 → 8** | S2: 동의 5항목 화면 — 필수 ① 이용약관 ② 개인정보처리방침 ③ 아동 음성·성장 데이터 보호자 동의(별도 체크), 선택 ④ 마케팅, ⑤ 파일럿 참여 동의(필수/선택 NEEDS DECISION (법무, L-02)) — CONFIRMED (사용자 결정 2026-09-14, C-1); 항목별 문서 버전 기록·`POST /v1/consents`; Email·Google·Apple 모든 가입 경로 뒤 같은 동의 화면 (C-2); 동의 뒤 VPC 단계 슬롯 + Mock (C-3, 방식 NEEDS DECISION (법무, L-01)); 동의 전 아동 데이터 미전송(ARCHITECTURE §7.3.1). S4: 동의 없음 시 녹음 시작 UI 차단. S8: 동의 이력 보기 — 선택 기능 (C-19, 미구현 시 QA FAIL 아님; 읽기 전용 목록, PRD 화면 요구 없음). **동의 철회 = MVP 제외** CONFIRMED (사용자 결정 2026-09-14, C-4) — COPPA 보호자 권리와의 관계 NEEDS DECISION (법무, L-03) | 서버 측 동의 강제, append-only consent history(데이터), 버전 관리, VPC 방식 (L-01) (AR, DR, EC) — PENDING |
| FR-03 | 온보딩 설문 위저드, 중도 저장·복귀 | P0 | **2** | 5단계 위저드(Step 1 아이 정보 → 2 기질 카드 → 3 책·선호 주제 → 4 성장 목표 → 5 역량 문항)·진행바·step 저장/복귀(Mock draft) — CONFIRMED (사용자 결정 2026-09-14, C-9). Step 5 = Baseline Survey v1 10문항(ER2·AG3·CF2·IM3, 빈도 5단계 + 비채점 응답) — CONFIRMED (C-8, D-04). Step 1–4 화면 디자인 방식은 C-13 | draft 저장, 설문 instrument 버전 관리 (AC, DR) |
| FR-04 | 4대 역량 스코어·다이아몬드 그래프 | P0 | **2 → 7** | S2: 다이아몬드(단일) 표시·대체 텍스트 (역량 점수 = 응답 문항 평균 1.0–5.0, C-8). S7: 이전/현재 오버레이 | 룰 기반 스코어 산출(응답 문항 평균, 결측 제외 — 한 역량 전부 결측 시 처리는 Stage 2 Plan), 스냅샷 저장 (BH, DR) |
| FR-05 | 긍정형 페르소나(템플릿+LLM 슬롯)·금지어 검증 | P0 | **2** | 페르소나 카드 표시, 생성 지연(≤3s)·fallback 표시 (Mock `PROVIDER_UNAVAILABLE`) | LLM 슬롯 생성, 금지어·안전 필터, 기본 풀 fallback, 생성 로그 (AP, BH) |
| FR-06 | 발전 역량 제시·양육자 변경 | P0 | **2 → 6** | S2: 제시 화면 + 축 탭 변경. S6: 설정에서 변경 | 기본값(최저 스코어) 산출·저장 (AC, DR) |
| FR-07 | Activity Card 일일 생성·3장 덱·책 선택 후 Prompt | P0 | **3 (+6)** | S3: 덱 스와이프·대안 버튼·책 선택·Prompt 카드·오프라인 캐시. S6: warm 추천 표시 | 07:00 생성 Job, Cold/Warm 추천, 역량 순환, 재독 새 Prompt 세트 (BH, DR) |
| FR-08 | Context 선택 + invitational push | P0 | **3 (+4)** | S3: Context 선택 UI, 알림 설정 UI(설정 아이콘 `26:44` 목록에 추가 — C-16), push **권한 요청·기기 등록 UX** (Web + Mock, `POST /v1/push-devices` Mock), 알림 deep link 진입. S4: 네이티브 Push Adapter (#7) | push 발송·provider·invitational 템플릿·학습된 평균 시간대 (BH) — PENDING |
| FR-09 | 세션 화면·녹음 시작/읽기 완료·Pause/Resume·30분 자동 종료 | P0 | **4** | 세션 화면, RecordingController, Pause/Resume, 30분 클라이언트 타이머(실제 녹음 시간 기준·일시정지 제외, `MAX_RECORDED_SECONDS=1800` — CONFIRMED (사용자 결정 2026-09-14, #17)), 전이 호출(Mock 전이 표) | 전이 판정·저장, 30분 서버 검증 (AC, RU, EC) |
| FR-10 | 캐릭터 버블 (시작·종료, 검수 템플릿) | P0 | **4** | 응답 값 버블 표시·등장 모션 | 검수 템플릿·안전 슬롯 생성 (BH) |
| FR-11 | 경청 인터랙션 + Prompt 모아보기 | P0 | **4** | 경청 애니메이션(에셋 결정 R-16), Prompt Drawer | — (세션 계약의 prompts 필드만) |
| FR-12 | 세션 피드백(회고) 카드 | P0 | **5** | 회고 폼(별점·칩·주제·자유 후기·skip), 멱등 제출(Mock) | 저장, 추천 신호·리포트 요약 반영 (DR, AP) |
| FR-13 | 세션 직후 짧은 성장 피드백 | P1 | **5** | 분석 상태 폴링, 짧은 피드백 카드, push deep link 진입 화면 | 피드백 생성·안전 검증·push 발송 (AP) — PENDING |
| FR-14 | 업로드 → STT → 역량 지표 분석 (24h) | P0 | **4 → 5** | S4: 로컬 영속·업로드 큐·upload init/complete 호출 (Mock success/failure). S5: 분석 상태 UX (pending/completed/failed/low-quality) | 실제 Storage 업로드 수신·검증, STT·분석 파이프라인·analysis_jobs (RU, AP, DR) — PENDING |
| FR-15 | 세션 누적 기반 프로필·페르소나 자동 업데이트 | P0 | **6** | 업데이트된 스냅샷·페르소나 표시 (Mock cold→warm) | 스냅샷·페르소나 갱신 로직 (AP, DR) — PENDING |
| FR-16 | 4주 리포트 게이팅·생성·알림·상세·이월 | P0 | **7** | 리포트 탭·진행도·not-eligible·deferred·delayed·상세·아카이브 UX | eligibility 판정·집계·스케줄러·이월·알림 (AP, BH, DR) — PENDING |
| FR-17 | 리포트 PDF 다운로드·공유 | P1 | **7** | PDF 요청·상태 폴링·**서버 제공 파일 다운로드·공유** UX | PDF 생성(위치 결정 포함)·private 저장·signed URL (BH) — PENDING |
| FR-18 | 하이라이트 오디오 클립 자동 추출 | P0 | **5 (계약) → 7** | S5: 계약·fixture만. S7: 클립 재생·만료 표시 (Mock signed URL) | 클립 추출·저장·만료 (AP, DR) — PENDING |
| FR-19 | 보상 — **출석체크 스티커** 지급 | P0 | **4** | 완료 시 출석 스티커 표시 (Mock `stickerAward`), 재진입 시 중복 표시 없음 | 멱등 지급·저장 (AC, DR) |
| FR-20 | 서재 (증정·보유, 직접 등록, 읽은 책 히스토리, 책별 Prompt) | P1 | **3** | 목록·필터·책 상세 시트·책별 Prompt·히스토리(Mock) | 라이브러리·히스토리 조회 (AC, DR) |
| FR-21 | 세션별 녹음 삭제·전체 삭제 요청 | P0 | **4 (로컬 기반) → 8** | S4: LocalRecordingStore 삭제 API (세션 녹음 삭제·로그아웃 정리용). S8: 데이터 관리 UI (보관 정책 안내·세션별 삭제·전체 삭제 요청·진행 상태), 로그아웃/삭제 시 로컬·캐시 정리 — **Stage 8 CONFIRMED (사용자 결정 2026-09-14, C-15)**. 동의 철회 대신 탈퇴·전체 삭제 요청만 제공 (C-4) | Storage 객체 삭제·cascade·audit·삭제 SLA (DR, BH, EC) — PENDING |
| FR-22 | 초기 20권 라이브러리·증정 신청·구매 링크 | P0 | **3** | 큐레이션 목록·증정 신청·배송 상태·구매 링크 UX | 카탈로그 운영, 신청·배송 처리, 배송지 저장 위치(NEEDS DECISION) (DR, BH) |
| FR-23 | 보유 책 직접 입력·자유 선택 세션 | P0 | **3 (+4)** | S3: 등록 폼 (검색 결과 없음 → 제목 입력). S4: 해당 책으로 세션 시작 | 책 저장, DB 외 책 범용 Prompt (DR) |
| FR-24 | Trial 시작 후 가입 전환 | P1 | **2** | Trial = 기기 로컬 draft만 (가입 전 온보딩 응답) → 프로필 저장 시 가입 → 동의(C-2) → `POST /v1/onboarding/submit`. 다른 기기 이어하기·익명 계정 없음 — CONFIRMED (사용자 결정 2026-09-14, C-12) | 없음 (익명 계정 방식 미채택, C-12). 제출 시 동의 확인만 (AR) |
| FR-25 | 웹(반응형) | P1 | **1 → 각 Stage → 8** | S1: breakpoint 토큰(`--bp-md` 600 / `--bp-lg` 1024)·최대 폭 480px 가운데 앱 컬럼·다단 없음·세로 고정(웹 가로 = 앱 컬럼) — CONFIRMED (사용자 결정 2026-09-14, #12). 각 Stage 준수. S4: Capacitor portrait lock. S8 반응형 QA + Mock 웹 프리뷰(C-18) | — |
| FR-26 | 구독 결제(IAP)·플랜 게이팅 | P2 | **Out of MVP** | — | — |
| FR-27 | 다중 아동 프로필 | P2 | **Out of MVP** | — | — |
| FR-28 | 다국어 | P2 | **Out of MVP** | copy 모듈 분리만 (rules/frontend §8) | — |
| FR-29 | 캐릭터 TTS | P2 | **Out of MVP** | — | — |

FR ID가 없는 화면 요구사항:

| 항목 | PRD 근거 | FE Stage | Backend Handoff |
|---|---|---|---|
| 로그아웃 | §7.8 | 2 — Home skeleton 상단 설정 아이콘 `26:44`(최종 위치) → 설정 목록(Stage 2 = 로그아웃만) — CONFIRMED (사용자 결정 2026-09-14, C-16 · #33). 목록 화면 디자인 방식은 C-13 | 토큰 폐기 (AR) |
| Home skeleton (로그인·온보딩 완료 후 착지 화면) | §6.1, §7.8 | 2 — `/` 에 상단 워드마크·설정 아이콘 `26:44`·빈 상태 안내만. Activity Card 등 Home 콘텐츠·하단 탭바는 Stage 3 — CONFIRMED (사용자 결정 2026-09-14, #33) | — |
| 홈 **streak**·이번 주 세션 수·지난 세션 하이라이트 한 줄 | §7.4 보조 요소, §6.1 (FR-19 아님) | 3 | streak·주간 집계 산출 (AC `HomeSummary`, DR) |
| 설정 셸·아이 프로필 수정(설문 재응답)·발전 역량 변경 | §7.8 | 6 — 설정 목록 확장: 아이 프로필 수정·발전 역량 변경 등 전체 설정 (C-16). 설문 재응답(§7.8)은 Exit 설문 대체가 아님 (C-11) | 저장 (AC) |
| 알림 설정(카드 갱신 시간·리마인더) | §7.8, FR-08 | 3 — 설정 목록에 알림 설정 추가 (C-16) | 발송 스케줄 반영 (BH) |
| 계정·탈퇴 (구독 표시는 P2 — 표시 여부 NEEDS DECISION) | §7.8 | 8 — 설정 목록에 탈퇴 추가 (C-15, C-16) | 탈퇴 = 전체 삭제 여부 (DR) |
| 데이터 관리 · 동의 이력 보기 | §7.8, FR-21 (P0), §12.1 | 8 — 설정 목록에 추가 (C-15, C-16). 데이터 관리 = 필수, 동의 이력 보기 = 선택 기능 (C-19, 미구현 시 QA FAIL 아님) | 삭제 파이프라인 (DR) |

### 4.2 Non-Functional Requirements (PRD §11)

| 구분 | 항목 | Frontend 부분 (Stage) | Backend Handoff 요구사항 |
|---|---|---|---|
| 성능 | 녹음 시작 지연 ≤ 1s | S4 — 실기기 측정 (기기 없으면 NOT VERIFIED) | — |
| 성능 | 캐릭터 버블·인터랙션 응답 ≤ 1s | S4 — 로컬 전환·모션 기준 | 실 API 응답 시간 (BH) — PENDING |
| 성능 | Activity Card 로딩 ≤ 2s | S3 — Loading UX·캐시 표시 (Mock `LOADING`) | 실 API 성능 (BH) — PENDING |
| 성능 | 세션 분석 ≤ 24h | S5 — pending 안내·폴링 UX | 파이프라인 SLA (AP) — PENDING |
| 안정성 | 백그라운드·화면 잠금·일시정지에도 녹음 유지 | S4 — NativeRecorderAdapter (Capacitor Stage 4 도입 CONFIRMED, #7), 실기기 QA는 Stage 4부터 | — |
| 안정성 | 크래시 시 로컬 임시 파일 복구 | S4 — LocalRecordingStore 복구 흐름 | 재개 업로드 수신 (RU) — PENDING |
| 프라이버시 | 보호자 검증 가능한 동의 | S2 — 동의 화면 뒤 VPC 단계 슬롯 + Mock (C-3; 방식 NEEDS DECISION (법무, L-01)) | 방식·서버 강제 (AR) — PENDING |
| 프라이버시 | 아동 데이터 최소 수집 | S2 입력 항목(성·이름 두 칸 — D-03, 생년월, 성별 선택 — C-7), 화면 호칭은 이름(first name)만, 전 Stage. 성(last name) 수집 적합성 NEEDS DECISION (법무, L-07) | 저장 최소화 (DR) |
| 프라이버시 | 제3자 광고 목적 사용 금지 | S1 광고/분석 SDK 미도입 원칙, S8 번들 검사 | 벤더 제공 범위 (BH) |
| 프라이버시 | 녹음 원본 암호화 저장 | — (로컬 파일은 앱 샌드박스/OPFS) | at-rest·앱 레벨 암호화 (DR, OAQ-14) — PENDING |
| 프라이버시 | 원본 90일 후 자동 파기 (전사·지표 유지) | S4/S8 — 보관 정책 안내, `expiresAt`·expired 표시 | Retention Job (Storage API) (DR) — PENDING |
| 프라이버시 | 보호자 요청 시 즉시 삭제 | S8 (C-15) — 삭제 요청·진행 상태·로컬 정리 | 삭제 파이프라인·SLA (DR, BH) — PENDING |
| 보안 | TLS·at-rest 암호화 | S1 — Http adapter HTTPS 전용 설정 | 서버·저장소 암호화 (BH) — PENDING |
| 보안 | 음성 데이터 접근 최소화·감사 로그 | S1 — 로그 PII 금지 규칙 | audit log·권한 (DR) — PENDING |
| 콘텐츠 안전 | 버블 = 검수 템플릿 + 안전 슬롯 | S4 — 응답 값만 표시 | 템플릿·필터 (BH) |
| 콘텐츠 안전 | 분석·페르소나·리포트 문구 이중 검증 | S2/S5/S7 — 응답 값만 표시 | 금지어·안전 필터 (AP) — PENDING |
| 콘텐츠 안전 | 진단·판정 표현 금지 | 전 Stage copy 리뷰, M-12 결정 반영 | 생성 문구 검증 (AP) |
| 접근성 | WCAG AA, 터치 타깃, 텍스트 의존 최소화 | S1 Shared UI 기준 · 각 Stage · S8 감사. 주요 버튼 teal 위 흰 라벨 2.07:1 유지 = 사용자 수용 예외 D-01 (#18-①, 법무 L-04). 보조 텍스트·비텍스트·focus ring = 가값 (P-01, P-02, P-03) | — |
| 오프라인 | 오프라인 녹음 + 복구 시 자동 업로드 | S4 — 로컬 영속·UploadQueue (Mock offline) | 업로드 수신 (RU) — PENDING |
| 오프라인 | Activity Card 최근 카드 캐시 | S3 | — |

### 4.3 Exceptions (PRD §13)

| 상황 | Frontend 부분 (Stage) | Backend Handoff 요구사항 |
|---|---|---|
| 마이크 권한 거부 → 안내·설정 딥링크·대화만 하기 | S4 — 권한 화면·`conversation_only` 흐름 (Figma 없음) | — |
| 녹음 중 네트워크 끊김 → 로컬 유지·자동 업로드·48h 안내 | S4 — offline 큐·로컬 48h 안내 | 48h push 발송 (BH) — PENDING |
| STT 실패·저품질 → 정량 분석 제외·안내 | S5 — low-quality 안내 UI | 품질 판정 (AP) — PENDING |
| 세션 준비 후 미시작 → 리마인드 1회·10분 후 정리 | S4 — 클라이언트 타이머·리마인드 버블·정리 전이 | 서버 sweeper (BH) |
| 부적절 발화·민감 내용 → 분석 제외·마스킹 | S5/S7 — 마스킹된 응답만 표시 | 감지·마스킹 (AP) — PENDING |
| 세션 30분 초과 → 자동 종료·녹음 보존 | S4 | 서버 검증 (RU) |
| 리포트 발행 기준 미충족 → 이월·독려 알림 | S7 — not-eligible 진행도·이월 안내 | 판정·이월·알림 (AP, BH) — PENDING |
| 증정 책 미보유·배송 대기 | S3 — 직접 입력·대화 전용 안내, 배송 상태 | 배송 운영 (BH) |
| 추천할 책 소진 | S3 — 재독·대화 전용 카드 표시 | 대체 카드 규칙·운영 알림 (BH) |
| 리포트 생성 실패 → 3회 재시도·익일 재생성·지연 안내 | S7 — delayed 안내 | 재시도 스케줄 (AP) — PENDING |

### 4.4 v0.2 매핑의 누락·오류 (요약)

| # | v0.2 | 문제 | 현재 처리 |
|---|---|---|---|
| 1 | 전체 구조가 Full-Stack 전제 (Stage별 Backend 구현) | 사용자 Frontend-only 지시와 충돌 | §2 — Backend는 Handoff 요구사항 |
| 2 | Stage 2 "FR-24 일부" | 범위 불명, Trial 데이터 결정 누락 | S2 전체 + 로컬 draft (C-12) |
| 3 | FR-25 미매핑 | P1 누락, breakpoint 결정 늦음 | S1 기반 → S8 QA (breakpoint #12 CONFIRMED) |
| 4 | FR-18 S5만 | 리포트 재생 누락 | S5 계약 → S7 재생 |
| 5 | "FR-21 일부" (S4) | 범위 불명 | §4.1 분할 |
| 6 | FR-02 강제를 S4 제목에만 | 누락 위험 | S2/S4/S8 분할 명시 |
| 7 | 홈 streak·주간 세션 수 미매핑 | §7.4 누락 | S3 (FR-19와 분리) |
| 8 | NFR 오프라인 카드 캐시, §13 예외 대부분, §7.8 설정, 비밀번호 재설정·마이크 권한·대화 전용 세션 | 미매핑 | §4.1–§4.3 |
| 9 | FR-08 push | 권한·기기 등록 UX 누락 | S3 [FE] + push 발송 [HO] |
| 10 | Session State "retry" 상태 | 행위를 상태로 표기 | ARCHITECTURE §10 (CONFIRMED 모델, #16) |
| 11 | Data Model | capability_signals·삭제 요청·증정·알림·동의 문서 누락 | DATA_MODEL.md (Data Requirement 초안) |
| 12 | Backend module `.schema.ts`/`.types.ts` | contracts 중복 | Handoff 요구사항에 금지 명시 |
| 13 | PRD §14.1 M1 알파(녹음·기본 분석 포함) | Frontend-only로는 실사용 알파 불가 | R-13 |

## 5. Stage별 계획 요약

> 각 Stage 착수 시 plan-agent가 `docs/plans/stage-N-plan.md` (AC-N-xx, plan-agent.md §5 형식)를 작성하고, design-agent Design Spec과 함께 **승인 체크포인트**에서 사용자 승인을 받는다. 아래는 범위 합의용 요약이다.
> Exit Criteria는 Frontend에서 실행 가능한 검증만 포함한다. 서버 측 테스트(RLS, Retention Job, 실제 업로드·분석·생성)는 요구하지 않으며 `PENDING` 으로 기록하고 Handoff 문서에 반영한다.
> 모든 데이터 화면 공통 Mock 시나리오: `success` · `loading` · `empty` · `error` · `retry` (rules/frontend §5 표시명 SUCCESS/LOADING/EMPTY/ERROR/RETRY). 아래 key는 **API_CONTRACTS §5.4 Scenario Key Catalogue** 가 유일한 기준이다.

### Stage 1 — Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure
- **Goal**: 이후 모든 Stage가 올라갈 monorepo·토큰·Shared UI·Router/Layout·contracts 공통부·Mock 인프라 확립.
- **In Scope**: FR-25(기반), NFR 접근성(Shared UI 기준), NFR 프라이버시 기반(광고/분석 SDK 미도입, Secret·PII 로그 금지), 기술 요구사항(contracts 공통, API Client/Adapter 구조, Mock Layer).
- **Deliverables**
  - [FE] 저장소 `~/dev/haru` (#4) + **pnpm workspaces · Node LTS** (#6), `apps/web` (Vite·React Router·**Tailwind CSS v4** CSS-first `@theme` (#29)·`app/providers` Adapter 선택 지점·Error Boundary·TabLayout/FullscreenLayout/StackLayout·Route Guard 골격·BottomTabBar = Library / Home / Progress (#15)), `packages/config`, `packages/design-tokens` (3-tier primitive → semantic → component, 값은 Figma 기준 (#10); font stack `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` + Inter self-host, SF Pro 파일 미포함 (#11); breakpoint 600/1024·앱 컬럼 480 (#12); capability 색 = 배지 색 (#19); **가값 토큰은 `provisional` 주석** (P-01~P-09, P-11~P-16)), `packages/ui` (FRONTEND_IMPLEMENTATION_PLAN §1.2 우선순위: Text, Icon, Surface, Button, IconButton, TopBar, BottomTabBar(items config), Spinner/Skeleton, ErrorState/EmptyState, InlineAlert, Toast, TextField, Checkbox, Tag, Chip, RadioGroup, ProgressBar, PageIndicator, SpeechBubble, Sheet, Dialog), **아이콘 = Lucide (`lucide-react`) + HARU 전용 Figma SVG export** (#21), **공통 상태(Loading · Empty · Error+Retry · Offline 배너 · Toast · Dialog, 컴포넌트 focus·error·loading 상태)를 design-agent 명세로 구현 — 가값 (P-10)** (#22), copy 모듈 구조, **import 경계 lint** (도구는 Stage 1 Plan, #9), **dev 전용 UI gallery route** (Production 제외, #9), Vitest, **Playwright** (E2E·시각 비교, #28). **`apps/mobile` 생성하지 않음** (웹 전용, #7). MSW·Supabase JS Client 미사용 (#8, #27).
  - [C·M] `packages/contracts`: common(ErrorEnvelope, ErrorCode, Pagination), 전체 enum (Capability 키 #13, SessionStatus 모델 #16, ConsentType C-1, Gender C-7 반영), rules(session-transitions, report-eligibility, recording-limits — 상수 #17 CONFIRMED) + 단위 테스트. `shared/api` 공통 helper, 도메인별 `Mock<Domain>Api` 골격 (#8), scenario store·전환 스위치, health Mock.
  - [HO] 없음.
- **Mock scenarios**: health — `success`, `loading`, `error`, `retry`, `offline`. 공통 상태 컴포넌트 데모 — `loading`(Skeleton), `empty`, `error`→`retry`, `offline`(Banner).
- **Exit Criteria**: pnpm install/typecheck/lint/test/build PASS; `apps/api/`·`supabase/`·`apps/mobile` 부재(파일 목록); 임의 HEX/arbitrary value grep 0; import 경계 lint 위반 0; Shared UI ↔ Figma Playwright 시각 비교; contracts 전이 표·rule 테스트 PASS; Mock Adapter contracts parse 테스트 PASS; scenario 결정적 재현; Adapter 선택 지점 1곳; 320/393/600/1024 앱 컬럼(최대 480px 가운데) 확인; `provisional` 주석이 결정 기록 §4 목록과 일치; font stack에 `system-ui` 가 Inter 앞에 없음·SF Pro 파일 부재; 번들·`VITE_*` Secret grep 0. 주요 버튼 대비 2.07:1 = D-01 수용 (FAIL 기록 + `PASS (accepted: D-01)`), 가값 자체는 FAIL 사유 아님.
- **Stage 1 후속 단계 — 가값 승인** (CONFIRMED (사용자 결정 2026-09-14, #10-④ · #22)): Stage 1 구현·QA 후 Orchestrator가 P-01~P-16을 **하나씩** 사용자에게 제시 → `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지`. 결과는 결정 기록 §4·`DESIGN_TOKEN_MAP.md` 에 반영하고 확정 항목의 `provisional` 표시 제거.
- **Dependencies**: Stage 0 최종 승인 (#1).
- **Blocking decisions**: 없음 — Stage 1 차단 결정은 모두 완료. Stage 1 Plan에서 확정할 세부: lint 도구, Lucide 버전 고정, Inter self-host 방식, 이미지 최적화 포맷·해상도(C-17), scenario 전환 방식, Production Mock 처리(OAQ-21).

### Stage 2 — Auth + Consent + Onboarding + Child Profile (Frontend)
- **Goal**: 가입부터 첫 프로필 결과·발전 역량 제시까지 Mock 기반 end-to-end.
- **In Scope**: FR-01, FR-02(S2 부분), FR-03, FR-04(단일), FR-05(표시), FR-06(S2 부분), FR-24, NFR 최소 수집, 설정 아이콘 + 로그아웃 (C-16).
- **Stage 2 결정 (모두 CONFIRMED (사용자 결정 2026-09-14))**
  - 동의 (C-1): 필수 ① 이용약관 ② 개인정보처리방침 ③ 아동 음성·성장 데이터 보호자 동의(별도 체크), 선택 ④ 마케팅, ⑤ 파일럿 참여 동의 — 필수/선택·문구 NEEDS DECISION (법무, L-02). 항목별 문서 버전 기록.
  - 동의 시점 (C-2): Email·Google·Apple 모든 가입 경로 직후 같은 동의 화면. 동의 기록 전 아이 정보 서버 미전송.
  - VPC (C-3): 동의 화면 뒤 VPC 단계를 끼울 수 있는 슬롯 + Mock. 방식 NEEDS DECISION (법무, L-01).
  - 동의 철회 (C-4): MVP 제외 — 철회 UI·Contract·`consent-revoked` 없음 (법무 L-03).
  - 아이 정보 (C-5·C-6·C-7): 가입 화면은 보호자 이름·이메일·비밀번호만. 아이 정보는 동의 후 온보딩 Step 1 — **성·이름 두 칸** (D-03, 법무 L-07, 호칭 = first name), 생년월, 성별 선택 `girl` / `boy` / `prefer_not_to_say` (기본 미선택 = `null`).
  - 온보딩 (C-9·C-8): 5단계 — Step 1 아이 정보 → 2 기질 카드 → 3 책·선호 주제 → 4 성장 목표 → 5 역량 문항 = Baseline Survey v1 10문항 ("In the past two weeks", Never · Rarely · Sometimes · Often · Almost always = 1–5 + 비채점 "Haven't had the chance to see this yet"), 역량 점수 = 응답 문항 평균 (D-04). 한 역량 전부 결측 시 처리 = Stage 2 Plan.
  - 대상 연령 (C-10): 3~9세 가입 허용. Exit 설문 없음 (C-11).
  - Trial (C-12): 기기 로컬 draft → 프로필 저장 시 가입 → 동의 → 제출. 익명 계정·다른 기기 이어하기 없음.
  - 착지·설정 (#33, C-16): 로그인·온보딩 완료 후 착지 화면 = `/` **Home skeleton** (상단 워드마크 + 설정 아이콘 `26:44` 최종 위치 + 빈 상태 안내). Stage 2 설정 목록 = 로그아웃. Activity Card 등 Home 콘텐츠·하단 탭바는 Stage 3.
  - **Figma 누락 화면 (C-13)**: 동의 화면, VPC 단계, 온보딩 Step 1–4, 프로필·페르소나·다이아몬드, 발전 역량 제시, 비밀번호 재설정, 설정 목록 — Stage 2 plan/design 단계에서 Orchestrator가 **화면마다** 사용자에게 ① 디자이너 Figma 요청 ② design-agent 명세 중 선택을 묻고, 승인 전에는 디자인·구현하지 않는다. Apple 로그인 버튼은 Apple 공식 가이드 버튼. Figma 수정 요청(동의 단일 체크박스, 가입 화면 `179:1724` 아이 필드, 설문 소개 "About 3 minutes · 10 cards" 문구)은 디자이너 몫.
- **Deliverables**
  - [FE] `/auth/*`(welcome, sign-up, log-in, forgot/reset), `/auth/consent`, VPC 단계 슬롯(Mock), `/onboarding/*`(5 step), `/onboarding/profile`, `/onboarding/growth-capability`, **`/` Home skeleton** (착지 화면 — 워드마크·설정 아이콘 `26:44`·빈 상태 안내, 하단 탭바 없음 — #33), 설정 목록(로그아웃); `AuthGateway` + `MockAuthGateway` (Web); Route Guard; OnboardingWizard(진행바·중도 저장·복귀); Baseline 문항 카드(비채점 응답 포함); CapabilityDiamondChart(인라인 SVG, 대체 텍스트), PersonaCard; 동의 전 아동 데이터 로컬 보관(ARCHITECTURE §7.3.1); Trial 로컬 draft (C-12); 로그아웃 시 로컬 draft·캐시 정리.
  - [C·M] me, consent-documents, consents(action=`granted` 만), onboarding(Baseline v1 item/answer schema), children profile, growth-capability contracts + Mock.
  - [HO] AR(토큰·OAuth·재설정 메일·서버 동의 강제·VPC L-01), DR(consent_events, children, survey_instruments/items, onboarding_responses, snapshots, personas), AP(평균 스코어·페르소나 생성·안전 검증), EC(`CONSENT_REQUIRED` 등).
- **Mock scenarios**: `success`, `loading`, `error`, `retry` + `consent-missing`, `consent-version-outdated`, `token-expired`, `provider-cancelled`, `draft-resume`, `persona-fallback`, `child-limit-reached`, `onboarding-incomplete` + `vpc-pending`, `vpc-failed` (RECOMMENDED, C-3 슬롯 — 기본 scenario는 `success`), `capability-all-missing` (RECOMMENDED, C-8 결측 — 처리 규칙은 Stage 2 Plan) (API_CONTRACTS §5.4). Trial 로컬 draft는 Mock API 시나리오가 아니라 로컬 저장소 테스트로 검증.
- **Exit Criteria**: 필수 동의(①②③) 미체크 시 진행 불가; Email·Google·Apple(Mock) 모든 가입 경로가 동의 화면 통과; 동의 기록 전 아동 데이터 요청 0건(Mock 요청 로그); 가입 요청에 아이 필드 없음; 성별 미선택으로 진행 가능·`null` 전송; Step 5 비채점 응답이 평균에서 제외(단위 테스트); 중도 이탈 후 동일 step 복귀; Trial draft → 가입·동의 후 제출; 프로필 화면 "판정 아님" 안내; persona-fallback 표시; 다이아몬드 접근성 이름; 로그인·온보딩 완료 후 `/` Home skeleton 착지 (워드마크·설정 아이콘 `26:44`·빈 상태 안내 표시, Activity Card·하단 탭바 없음) → 설정 아이콘 → 로그아웃 → 로컬 정리. PENDING: 서버 측 동의 강제, VPC 실제 검증, 실제 OAuth·토큰, 스코어·페르소나 생성.
- **Dependencies**: S1; C-13 화면별 디자인 방식 결정; 법무 L-01/L-02 (문구·필수 여부 — Frontend는 슬롯·설정값으로 진행).
- **Blocking decisions**: 없음 (Stage 2 전 결정 C-1~C-18·#33 완료). Stage 2 Plan 세부: 한 역량 전부 결측 시 처리, 동의 문구(법무), 누락 화면별 C-13 선택.

### Stage 3 — Home + Activity Card + Library + Book Selection + Recommendation (Frontend)
- **Goal**: 오늘의 카드에서 책·Prompt·Context를 고르고 세션에 진입할 수 있는 상태 (추천 결과는 Mock 응답).
- **In Scope**: FR-07, FR-08(FE 부분 — Web + Mock), FR-20, FR-22, FR-23, 홈 streak·주간 세션 수(§7.4), 알림 설정(§7.8 — 설정 목록에 추가, C-16), NFR 카드 로딩 UX·오프라인 캐시, §13 증정 대기·책 소진 카드.
- **Deliverables**
  - [FE] HomePage 카드 덱(스와이프 + 버튼 대안)·PromptReveal·ReadingContextSelector·StreakChip; LibraryPage + LibraryShelfSheet + BookDetailSheet; AddOwnBook; GiftRequests; NotificationSettings + push 권한 요청·기기 등록 UX(platform adapter); 최근 카드 캐시.
  - [C·M] home, activity-cards(today, selection), library, books search/prompts, gift-requests, notification-preferences, push-devices + Mock.
  - [HO] BH(07:00 카드 생성, Cold/Warm 추천·역량 순환, push 발송), DR(books, child_books, gift_requests, activity_cards, notification_preferences, push_devices).
- **Mock scenarios**: `success`, `loading`, `empty`, `error`, `retry` + `offline-cached-card`, `conversation-only-option`, `reread-option`, `books-exhausted`, `session-already-active`, `gift-pending`, `gift-duplicate`, `user-entered-book`, `push-permission-denied`.
- **Exit Criteria**: 3장 스와이프·버튼 전환; 선택 → Prompt 2~3개 표시(M-09 결정 반영); conversation_only 카드 경로; offline에서 캐시 카드 + Banner; Context 선택이 Mock 요청에 포함; 직접 등록 책 선택 가능; Loading/Empty/Error. PENDING: 실제 추천 품질, push 수신, 실 API 2초 성능.
- **Dependencies**: S2; M-09/M-14/M-29/M-30/M-31 결정; 누락 화면별 디자인 방식(C-13); 책 표지·캐릭터 에셋 사용 가능 (C-17).
- **Blocking decisions**: M-09/M-14/M-29/M-30/M-31, M-32 잔여(Reading Context 선택 없이 세션 시작 허용 여부) (내비게이션 #15·Capacitor #7 결정 완료 — Stage 3은 Web + Mock push 권한 UX만).

### Stage 4 — Storytime Session + Recording Client + Pause/Resume + Prompt Drawer + Local Recording + Upload UX
- **Goal**: Storytime 1회를 녹음 유실 없이 완료하고 업로드 대기·재시도·완료를 Mock으로 보장.
- **In Scope**: FR-09, FR-10, FR-11, FR-14(업로드 클라이언트), FR-19, FR-02(녹음 차단), FR-21(로컬 삭제 기반), FR-23(선택 책 세션), NFR 녹음 시작 1s·안정성·오프라인 녹음·버블 표시 규칙, §13 마이크 거부·네트워크 끊김·10분 방치·30분 초과.
- **Deliverables**
  - [FE] **`apps/mobile` Capacitor 셸 생성** (iOS/Android, portrait lock — #7, #12) + 네이티브 Auth Adapter(Apple/Google)·네이티브 Push Adapter (Mock 백엔드). **착수 첫 작업: 녹음 spike** (Web MediaRecorder + Capacitor 네이티브 녹음 플러그인 청크·백그라운드·인터럽션·포맷 — 실기기 QA는 Stage 4부터, 기기 없으면 NOT VERIFIED). RecordingController + RecorderAdapter(Web, Native) + LocalRecordingStore + SessionOutbox + UploadQueue; 세션 화면(ready 버블·녹음 버튼·Done Reading·Pause/Resume·경청 표시·Prompt Drawer); 완료 화면(성공 버블·스티커); 마이크 권한·대화 전용; 업로드 상태·48h 로컬 안내; 크래시 복구.
  - [C·M] sessions(create, transitions — `SESSION_TRANSITIONS`), `recordingApi` (upload init / tokens / complete / status) = `MockRecordingApi` \| `HttpRecordingApi`(골격), 바이트 전송 `UploadTransport` = `MockUploadTransport` (TUS·서명 URL 흉내, 실패·지연 주입) \| `TusUploadTransport`(골격, 연동 PENDING) — API_CONTRACTS §5.1.
  - [HO] RU(업로드 init·resumable 수신·part 검증·토큰 재발급·90일 만료), AC/EC(전이 판정), DR(sessions, recordings, parts, stickers), BH(abandoned sweeper, 48h push).
- **Mock scenarios**: `success`, `loading`, `error`, `retry` + **`recording-upload-success`**, **`recording-upload-failure`**, `upload-retry`, `upload-token-expired`, `recording-incomplete`, `offline-queued`, `upload-stalled-48h`, `invalid-transition`, `session-already-active`, `consent-missing`, `mic-permission-denied`, `recording-interrupted`, `auto-timeout`, `crash-recovered`, `abandoned` (#16 CONFIRMED), `onboarding-incomplete`, `recording-deleted` (upload-tokens).
- **Exit Criteria**: rules/qa.md Recording Client 표 8개 × Web/iOS/Android (기기 부재 시 NOT VERIFIED + 수동 절차); consent-missing에서 녹음 시작 차단; Mock 확정 응답 전 로컬 파일 유지(RecorderAdapter mock 상태 머신 테스트 필수); 허용되지 않은 전이 → contracts error code; offline → online 시 Mock 업로드 재개; 크래시 복구 테스트. PENDING: 실제 Storage 업로드·서버 검증·서버 측 전이 강제·분석 Job 연결.
- **Dependencies**: S3; §15 #1–#3; 캐릭터 애니메이션 에셋(R-16); Figma M-25/M-26 및 상태 화면 누락.
- **Blocking decisions**: OAQ-10/11/16, M-25/M-26 (Capacitor #7·Session 상태 모델 #16·30분 기준 OAQ-09 #17 결정 완료).

### Stage 5 — Reflection + Async Analysis Status + Short Feedback (Frontend)
- **Goal**: 완료 → 회고 → 분석 상태 → 짧은 성장 피드백 흐름을 Mock으로 검증.
- **In Scope**: FR-12, FR-13, FR-14(분석 상태), FR-18(계약·fixture), §13 STT 저품질·민감 발화 표시, NFR 24h pending UX·생성 문구 표시 규칙.
- **Deliverables**
  - [FE] ReflectionForm(별점·칩·주제·자유 후기 카드·skip, 입력 보존 재시도), AnalysisStatusCard, ShortFeedbackView, push deep link 진입.
  - [C·M] reflection-form, reflection submit(멱등), session analysis status + Mock.
  - [HO] AP(파이프라인 전체·STT/AI provider·PII redaction·metrics·signals·highlight 추출·safety validation·생성 로그), DR(reflections, analysis_jobs, transcripts, metrics, observations, signals, clips), BH(피드백 push).
- **Mock scenarios**: `success`, `loading`, `empty`(skip), `error`, `retry` + **`analysis-pending`**, **`analysis-completed`**, **`analysis-failed`**, `analysis-low-quality`, `analysis-not-available`, `reflection-already-submitted`, `invalid-transition` (completed 이전 회고 제출), `recording-deleted` (skipped).
- **Exit Criteria**: 회고 멱등 제출(동일 응답); outcome별 UI; 저품질 안내; 진단 표현 없음(copy 리뷰). PENDING: 실제 분석·피드백 생성·push.
- **Dependencies**: S4; G-06 회고 칩 정의(M-15); OAQ-13/17.
- **Blocking decisions**: 회고 칩 값 형태; §15 #4/#5는 Frontend 비차단.

### Stage 6 — Personalization + Profile Update + Recommendation Loop (Frontend)
- **Goal**: 세션·회고 이후 달라진 프로필/페르소나와 다음 카드(warm)를 사용자가 확인하는 UX.
- **In Scope**: FR-15(표시), FR-06(설정 변경), FR-07(warm 표시), §7.8 아이 프로필 수정·설문 재응답.
- **Deliverables**
  - [FE] 프로필 업데이트 표시, 설정 목록 확장(전체 설정 — C-16)·ChildProfileEditor(OnboardingWizard 재사용, 설문 재응답)·발전 역량 변경, warm 추천 사유 표시(디자인 존재 시). 데이터 관리·동의 이력 보기·탈퇴는 Stage 8 (C-15).
  - [C·M] 확장 필드(`profileUpdatedAt`, `recommendationPhase`, `reasonKey`), capability-snapshots / personas 목록 + Mock.
  - [HO] AP/BH(스냅샷 갱신 규칙, warm 추천·난이도 조정·동일 주제 3일 지양·재독 새 Prompt 세트), DR(recommendation_logs).
- **Mock scenarios**: `success`, `loading`, `empty`(스냅샷 1개), `error`, `retry` + `cold-to-warm`, `persona-changed`, `difficulty-lowered`.
- **Exit Criteria**: Mock 업데이트 스냅샷·페르소나가 화면에 반영; 설정 수정 중도 이탈 복귀; difficulty-lowered fixture가 카드에 표시. PENDING: 추천 규칙의 실제 동작("이전 세션 데이터가 다음 추천에 반영") — 서버 검증 대상.
- **Dependencies**: S5; 설정·프로필 업데이트 디자인(Figma 누락).
- **Blocking decisions**: 업데이트 노출 방식; 스코어 갱신 규칙(제품·전문가 → Handoff).

### Stage 7 — 4-Week Report + History + Highlight Audio + PDF UX (Frontend)
- **Goal**: 발행 기준 충족/미충족 양쪽 흐름, 리포트 상세·히스토리·하이라이트 클립·PDF UX를 Mock으로 검증.
- **In Scope**: FR-16, FR-17(UX), FR-18(재생), FR-04(오버레이), FR-15(페르소나 히스토리 표시), §13 미충족·생성 실패 UX.
- **Deliverables**
  - [FE] 리포트 탭(주기 진행도·다이아몬드 현황·아카이브), 리포트 상세(오버레이·페르소나 히스토리·대화 지표·인용·부모 피드백 요약), not-eligible/deferred/delayed 상태, HighlightClipPlayer(+expired), PDF 요청·폴링·다운로드·공유.
  - [C·M] reports overview/list/detail/viewed, highlight clip playback URL, PDF status + Mock (가짜 PDF 파일).
  - [HO] AP(eligibility·집계·narrative·안전 검증), BH(scheduler·PDF 생성 위치·발행 push), DR(report_cycles, reports, report_snapshots, report_pdfs, 클립 보관).
- **Mock scenarios**: `success`, `loading`, `empty`(archive 0), `error`, `retry` + **`report-eligible`**, **`report-not-eligible`**, `report-deferred`, `report-delayed`, `pdf-generating`, `clip-expired`, `share-cancelled`, `recording-deleted` (highlight clips).
- **Exit Criteria**: eligible·not-eligible 흐름 모두 동작; 진행도 표시가 contracts `isReportEligible` 경계 fixture(3599/3600초, 녹음 세션 2/3, `excluded_low_quality` 제외, 첫 세션 완료일 기준 28일 주기 — #17)와 일치(단위 테스트); Mock PDF 다운로드·공유; 만료 클립 표시. PENDING: 실제 eligibility 판정·리포트/PDF 생성·발행 리포트 불변성.
- **Dependencies**: S5, S6; M-10/M-11/M-12; #17 세부(대화 전용 세션 포함 여부·시간대 경계 — Stage 7 Plan).
- **Blocking decisions**: 리포트 IA(주간 Progress vs 4주, M-10), 이메일(M-11).

### Stage 8 — Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능 + Mock 웹 프리뷰 + Backend Handoff Package
- **Goal**: Frontend 전체 회귀·접근성·반응형 검증, 이월 기능 구현, Mock 데모 웹 프리뷰 배포, 누적 PENDING 항목의 Handoff 문서화, 그리고 **STOP**.
- **In Scope** (CONFIRMED (사용자 결정 2026-09-14, C-15 · C-18)): FR-25(전체 반응형 QA), 모든 NFR의 Frontend 부분 회귀·접근성 감사, Mock 시나리오 전체 회귀, 이월 기능, Mock 웹 프리뷰 배포, Backend Handoff Package.
- **이월 기능 (C-15)**: 필수 = FR-21 데이터 관리 UI (P0 — 보관 정책 안내·세션별 녹음 삭제·전체 삭제 요청), 탈퇴(§7.8). 동의 이력 보기 = 선택 기능 (C-19, 미구현 시 QA FAIL 아님 — 시간 여유 시 읽기 전용 목록, PRD 화면 요구 없음). 설정 목록에 추가 (C-16). **동의 철회 = MVP 제외** (C-4, 법무 L-03).
- **웹 프리뷰 (C-18)**: Mock 모드 웹 빌드를 정적 호스팅에 배포 (시연·Backend Developer 인계용, 실제 아동 데이터 없음). 호스팅 서비스는 Stage 8 Plan에서 확인. 앱 테스트 빌드(TestFlight·Play)·Backend 배포 제외.
- **Deliverables**
  - [FE] WCAG AA 감사 수정 (D-01 수용 범위 제외, 남은 가값 목록 기록), 반응형 QA(320/393/600/1024 + 텍스트 200% + reduced-motion), Mock 시나리오 포함 전체 회귀.
  - [FE · 이월 기능, C-15] 데이터 관리(보관 정책 안내·세션별 녹음 삭제·전체 삭제 요청·진행 상태), 탈퇴, 로그아웃/삭제 시 로컬 녹음·캐시 정리. (동의 이력 보기 읽기 전용 목록은 Deliverable 아님 — 선택 기능 (C-19, 미구현 시 QA FAIL 아님))
  - [FE · 배포, C-18] Mock 모드 웹 프리뷰 정적 배포 (Secret·실데이터 없음 확인).
  - **Handoff Package 7종**: `docs/BACKEND_HANDOFF.md`, `docs/API_CONTRACTS.md`(최종), `docs/DATA_REQUIREMENTS.md`(DATA_MODEL 초안 정리), `docs/AUTH_REQUIREMENTS.md`, `docs/RECORDING_UPLOAD_SPEC.md`, `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md`, `docs/ERROR_CODES.md` + **`packages/contracts` 최종 검증**(typecheck·test·문서 일치). 작성 분담은 **rules/workflow.md §5**: plan-agent가 Stage 8 Plan 작성 시 6종(BACKEND_HANDOFF, DATA_REQUIREMENTS, AUTH_REQUIREMENTS, RECORDING_UPLOAD_SPEC, ANALYSIS_PIPELINE_REQUIREMENTS, ERROR_CODES) 초안 작성 → development-agent 완성 + API_CONTRACTS 구현 계약 동기화 → stage-qa-agent 검증.
- **Mock scenarios**: `success`, `loading`, `empty`, `error`, `retry` + `deletion-processing`, `deletion-already-requested`, `recording-deleted` + Stage 1–7 시나리오 회귀. (`consent-revoked` 는 C-4로 제거됨.)
- **Exit Criteria**: rules/qa.md 체크리스트의 Frontend 항목 판정 완료; 데이터 관리 UI·탈퇴 동작 확인 (동의 이력 보기는 판정 필수 항목 아님 — 선택 기능 (C-19, 미구현 시 QA FAIL 아님)); 전 Stage `BACKEND_INTEGRATION_PENDING` 항목이 Handoff 문서에 1:1 반영; `BACKEND_HANDOFF.md` 필수 항목(API 목록, Request/Response/Error, Auth, Authorization, Screen, Feature, PRD ID, 기대 상태 변화, Mock 위치) 충족; Backend 코드 부재 확인 → 최종 보고 후 **STOP** (Backend implementation, Supabase migration, Node API, STT, AI Analysis, Render deployment 자동 시작 금지).
- **Dependencies**: S1–S7; 법무 입력(COPPA·보관 정책)은 Handoff 문서의 NEEDS DECISION으로 기록.
- **Blocking decisions**: 탈퇴 = 전체 삭제 여부, 삭제 SLA 안내 문구, 구독 표시 여부(P2), 웹 프리뷰 호스팅 서비스(Stage 8 Plan). (이월 위치 C-15·배포 범위 C-18 결정 완료.)

## 6. PRD ↔ Figma / Baseline Survey / 내부 문서 불일치

Figma 항목은 design-agent `docs/FIGMA_SCREEN_MAP.md` §5의 node 단위 확인 결과로 보정했다. 불일치 ID M-01…M-38은 두 문서가 공유한다. 한쪽을 임의로 채택하지 않았다. 사용자 결정으로 해소된 항목은 "결정 필요" 칸에 **Resolved (결정 ID)** 로 표시한다 (결정 기록 `docs/decisions/stage-0-approvals.md`). 표시가 없는 항목은 미결정이다.

| # | 항목 | PRD 근거 | Figma / 문서 근거 | 영향 | 결정 필요 |
|---|---|---|---|---|---|
| M-01 | 동의 구조 | §7.1, FR-02: 약관·방침 필수 + **아동 음성 보호자 동의 필수·별도 체크** + 마케팅 선택 | `179:1724` 단일 체크박스 "Terms + Privacy + taking part in the pilot" | 동의 기록 구조·COPPA 준수 (Critical) | **Resolved (C-1)** — PRD 기준 항목 분리 + 파일럿 동의 추가, Figma 단일 체크박스 수정은 디자이너 요청. 잔여 법무 L-01/L-02 |
| M-02 | "pilot 참여" 동의 | PRD에 없음 | `179:1724` | ConsentType 추가 여부 | **Resolved (C-1)** — `pilot_participation` 추가, 필수/선택·문구 NEEDS DECISION (법무, L-02) |
| M-03 | 온보딩 설문 | §7.2 5-step 위저드(5~7분), Step 5 역량별 **동일 문항 수**·**5점 리커트** | `179:1748`/`179:1770` 10문항 카드 "~3 minutes", "IN THE PAST TWO WEEKS", Never…Almost always; Baseline v1: 2/3/2/3 비대칭, "Haven't seen" 비채점, T0/T1 반복 측정 | 스코어링 규칙·데이터 요구사항·Stage 2 범위 | **Resolved (C-8, D-04)** — Baseline v1 10문항, 응답 평균. 5단계 위저드 유지 (C-9) |
| M-04 | 설문 대상 연령 | §3.1 3~9세, §8.2 연령대 3-4/5-6/7-9 | Baseline v1 "ages 3.0–4.0", "age-3 launch" | 문항·Prompt 라이브러리 연령 게이팅 | **Resolved (C-10)** — 3~9세 가입 허용, 4세 이상 콘텐츠 준비 전 3세용·범용 사용. 잔여: Baseline v1 4세 이상 적합성 전문가 확인 |
| M-05 | Exit 설문(월 3) | PRD에 없음 | Baseline v1 T1 administration | 추가 기능 여부 | **Resolved (C-11)** — MVP 제외 (설정의 설문 재응답만) |
| M-06 | 온보딩 Step 1–4 (아이 정보·언어 환경·기질·책·목표) | §7.2, FR-03 | Figma 없음 (Create account에 YOUR CHILD 필드만) | Stage 2 화면 설계 공백 | **Resolved (C-13, 절차)** — Stage 2 plan/design 단계에서 화면별로 디자이너 vs design-agent 선택. 단계 구성은 C-9 |
| M-07 | 프로필·페르소나·다이아몬드·발전 역량 화면 | §7.3, FR-04/05/06 | Figma 없음 | Stage 2 P0 화면 공백 | **Resolved (C-13, 절차)** — 화면별 디자인 방식은 Stage 2에서 사용자 선택 |
| M-08 | 내비게이션 — **3가지 구조 공존** | §6.1: 하단 3탭 서재 / 세션(중앙 강조) / 리포트, 홈 = 상단 집 아이콘, 설정 = 상단 아이콘 | ① Tab Bar 컴포넌트 `25:87` 라벨 **Library \| Home(중앙 `140:2971`, 집 아이콘) \| Progress** (variant 이름은 Active=Home\|Library\|Report) ② `110:522` (HTML import frame, 비컴포넌트) **Library \| Session(중앙 mic) \| Report** ③ PRD §6.1. `26:21` 상단 = 워드마크 `26:39` + 설정 `26:44` (집 아이콘 없음, 설정 위치는 PRD와 일치) | 라우팅·TabLayout·BottomTabBar(items config 주입으로 Stage 1 우회 가능), `/session` route 존재 여부, 리포트 탭 이름(Report vs Progress) | **Resolved (#15, D-02)** — Tab Bar `25:87` Library / Home / Progress, 세션 탭 없음, `110:522` 탭바 미사용 |
| M-09 | Prompt 노출 시점 | §7.4, FR-07: 책 선택 후 **다음 카드**에 Prompt 2~3개 | **`26:21` frame에는 카드 자체가 없음** (캐릭터 + 버블 + dots). 카드 변형: `163:2648` (선택 전 카드마다 Prompt 4개 + PRE/POST/P.6), `86:438` (5개), page `8:2` loose `86:512`/`86:545` (2개 + 코칭 + Context) — **모든 변형이 책 선택 전에 Prompt 노출**. flip back `86:482` "Prompt of this book" 이 PRD "다음 카드" 후보. (보정: 초기 인벤토리의 "26:21 카드에 Prompt 2개"는 실제로 `86:512/86:545`) | 카드 덱 상호작용, ActivityCard contract (API_CONTRACTS §6 G-07) | Yes |
| M-10 | 리포트 | §7.7, FR-16: 4주 주기, 발행 게이팅, 다이아몬드 이전/현재 오버레이, 페르소나 히스토리, 대화 분석, 부모 피드백 요약 | `31:102`/`110:522` "Weekly Growth" 주간 지표(+18% vs last week, daily minutes, calendar, streak, Growth themes), "4-week full report" 링크, Download PDF; 두 frame 수치 placeholder 불일치 | 리포트 탭 정보 구조, 주간 지표 contract 없음 (API_CONTRACTS §6 G-01) | Yes |
| M-11 | 리포트 이메일 발송 | PRD에 없음 | `110:861` "Next report on Jun 7 · we'll email it too" | 이메일 채널·PII 처리 추가 | Yes |
| M-12 | 성장 표현 언어 | §8.4, §7.7: 판정·서열·진단 표현 금지, growing edge 프레임 | "Self-Direction **strong**", "Cognitive words **emerging**", "+18% vs last week", "80% of nights read" | 금지 표현 해당 여부 검토 | Yes (copy) |
| M-13 | 역량 명칭 | §4 감정 조절 / 자기주도 / 회복탄력성·인지 유연성 / 내적동기 | Figma 한 파일 안에 4가지 표기: Growth themes `163:2611–2629` Self-Direction / Emotion Regulation / Cognitive Flexibility / Intrinsic Motivation; 카드 배지 `163:2648` "Emotion Day  Day"(중복 오타)·"Intrinsic Motivation Day", `86:397` "Cognitive Flexibility Day"; `110:817/824/1567` "Emotion words / Cognitive words / Motivation words"; 책장 캡션 `113:1992` Emotion / Resilience / **Confidence (4대 역량 외)**. CLAUDE.md: Emotional Regulation…Resilience/Cognitive Flexibility; Baseline: Self-Directed Agency, Intrinsic Meaning/Motivation | contracts enum 라벨·CapabilityBadge·역량 색 매핑 (DESIGN_TOKEN_MAP §2.7) | **Resolved (#13 키, #14 라벨, #19 색)** — 라벨 Emotion Regulation · Self-Direction · Cognitive Flexibility · Intrinsic Motivation, "Confidence" 교체는 디자이너 요청 |
| M-14 | 서재 개념 | FR-20: 증정·보유, 직접 등록, 읽은 책 히스토리, 책별 Prompt | "My Saved", "Reading now · 3 of 5 nights", "Rated 4.5", "Our curated shelf", "Save to my shelf" | 저장·다회차 읽기 계획·책 평점 = PRD 외 기능 (API_CONTRACTS §6 G-04) | Yes |
| M-15 | 회고 입력 | §7.6, FR-12: 별점 1~5 + 체크 5종 + 주제 + 자유 후기(다음 카드) | `91:691`: **별점 5개 `91:693` 존재** + Chip 5개 `91:710–714` "Engaged / Big feelings / Ask Questions / Stay Focus / Tricky today" (PRD 체크 5종과 1:1 대응 가능) + 한 줄 입력 `91:716` + Save `91:717`. 잔여 차이: 자유 후기 "다음 카드" 없음, skip 명시 없음(닫기 `29:76`만), 칩 = on/off(척도 아님), "Stay Focus" 문구. (보정: 초안의 "별점 없음"은 오류) | **낮음** — 칩 값 형태는 API_CONTRACTS §6 G-06 | Yes (copy·자유 후기 카드) |
| M-16 | 소셜 로그인 | §7.1, FR-01: Apple/Google (모바일 필수) | `179:1701`/`179:1820` Google + Email만 (Apple 없음) | App Store 제출·FR-01 | **Resolved (C-13)** — Apple 공식 가이드 버튼 사용 |
| M-17 | 읽기 시간 카피 | §1.1 "하루 15분" | "Ten minutes of reading together…" | 카피 | Yes (copy) |
| M-18 | 예시 아이 이름 | §5.3 Emma | Session `29:62` Emma, Survey `179:1748` Yuna, Input `76:431` 보호자 이름 칸 "Emma, Kim" | 카피·fixture | No (fixture 통일) |
| M-19 | 세션 탭 라벨 | §6.1 세션 = 중앙 강조 버튼 | `110:878` "Session" (비컴포넌트 탭만); 컴포넌트 탭에는 Session 없음 | **M-08로 병합** | **Resolved (#15, D-02)** |
| M-20 | 누락 화면·상태 | 인증: 비밀번호 재설정·보호자 동의(§6.2); 홈: Context 선택 상세(§7.4), 증정 신청; 세션: Prompt 모아보기 트리거(§7.5), 마이크 권한 거부·대화 전용·오프라인/업로드 실패(§13); 리포트: 미충족·지연·4주 상세·하이라이트 클립; 설정 전체(§7.8), 데이터 관리·삭제(FR-21); 보유 책 직접 입력(FR-23); Trial(FR-24); 공통 Loading/Empty/Error | Figma 없음 (FIGMA_SCREEN_MAP §2 전수) | 해당 Stage 착수 전 디자인 필요 | 절차 결정 (C-13 화면별 선택, 공통 상태는 #22) — 화면별 선택은 각 Stage에서 |
| M-21 | 반응형 | §1.6, FR-25(P1) 웹 반응형 | 전 frame 393px | breakpoint 미정 | **Resolved (#12)** |
| M-22 | PRD 내부: 웹 반응형 시점 | FR-25 P1·§1.6 In Scope | §14.1 웹(반응형) 버전 = M3 GA | Stage 8 범위 | **Resolved (#12, C-18)** — 반응형 규칙은 Stage 1부터 전 화면 적용, 웹은 Stage 8 Mock 프리뷰로만 배포 |
| M-23 | PRD 내부: 리포트 최소 세션 | §7.7 "2~3회 이상" | — | eligibility 상수 | **Resolved (#17)** — 녹음 세션 3회 + 누적 3600초 |
| M-24 | 내부 문서: 개발 범위 | — | `docs/source/prompts/01-stage0-1-1-frontend-scope.md` Frontend-only vs 이전 CLAUDE.md/rules Full-Stack | **Resolved** — Frontend-only CONFIRMED (사용자 지시 2026-09-14), CLAUDE.md·rules·agents 개정 완료 | No (해결) |
| M-25 | 세션 화면 버블에 Prompt 목록 | §7.5 (버블 = 시작 인사·종료 2가지, Prompt 자동 제시 금지, "Prompt 모아보기" 로만 확인), FR-10, FR-11 | `28:51` 에 `139:2803` Bubble Type3 "Try this prompt !" + PromptPill 5개 [S][DC]. PRD 준비 인사와 일치하는 `Bubble Type=sessopn 88:757` 은 미배치 | 세션 준비 상태 화면 구성, 콘텐츠 안전(버블 템플릿) | Yes |
| M-26 | 세션 컨트롤 상태 혼합 | FR-09 (녹음 버튼 → "읽기 완료" 전환, Pause/Resume), §7.5 | `28:51` 에 RecordButton "Tap to recording"(idle) `163:1591` 과 "Resume" 버튼 `140:2870` 동시 배치; "Done Reading" 없음; Pause 는 loose `163:1601`; "Discard" `163:1618` / "Submit" `163:1620` loose; Prompt 모아보기 트리거 없음 (`88:960` 컴포넌트만) [S] | RecordingController 상태별 UI 정의 불가 → Stage 4 차단 | Yes (design) |
| M-27 | Google 가입 경로 동의 | FR-02, §7.1 ("보호자 동의 미체크 시 가입 진행 불가") | `179:1709` + `179:1722` 수동 동의 문구 [S] | OAuth 계정 생성 후 동의 화면 필수 (ARCHITECTURE §7.3, §7.3.1) → `/auth/consent` 디자인 필요 | **Resolved (C-2)** — 모든 가입 경로 직후 같은 동의 화면. 화면 디자인 방식 C-13 |
| M-28 | 가입 화면에서 아이 정보 수집 | §7.2 Step 1 "이름(닉네임)", NFR 최소 수집, ARCHITECTURE §7.3 | `179:1740` "Child's last name \| first name" "Haru, Kim", 성별, 생년월 [DC] | 동의 기록 전 아동 PII 입력, **성(last name) 수집은 최소 수집 원칙과 충돌** (Guard: ARCHITECTURE §7.3.1) | **Resolved (C-5, C-6, D-03)** — 아이 정보는 동의 후 온보딩 Step 1, 성·이름 두 칸 유지(호칭 first name). 법무 L-07 |
| M-29 | Prompt 단계/페이지 태그 | §8.2 (질문 + 코칭 + Follow-up, 역량×연령×책) | `Pagetag1–3 139:2410–2412` PRE / POST / P.6 , `163:2648`, `145:1132`, `88:960` [S] | Prompt 데이터에 `phase`(pre/during/post)·`pageRef` 필요 여부 → contracts·콘텐츠 제작 범위 (API_CONTRACTS §6 G-03) | Yes |
| M-30 | 홈 화면 구성 | §7.4 (역량 배지, 추천 책·이유, 코칭 문장, Context 선택, streak, 이번 주 세션 수, 지난 세션 하이라이트 한 줄) | `26:21`: 카드 미배치, `88:922` "Please, select the book first! / Tap me when the selection is done", `26:43` "12-day/115 Min". `163:2648` 카드에 코칭 문장·Context 없음 (`86:512` 에만 있음) | 홈 IA 확정 불가, HomeSummary 필드(누적 분 — API_CONTRACTS §6 G-02) | Yes (design) |
| M-31 | 덱 카드별 역량 | §7.4 "오늘의 역량 배지" (하루 1개 목표 역량), §8.3 역량 순환 | `163:2648` 카드 3장이 각각 Self-Direction / Emotion Day / Intrinsic Motivation Day [S] | `ActivityCard.targetCapability`(카드 단위 1개) vs option 단위 역량 (API_CONTRACTS §6 G-05) | Yes |
| M-32 | 세션 시작 진입점 | §7.4 (Activity Card → 세션), FR-23 (보유 책 자유 선택) | 서재 시트 `145:1132`, `163:1669` 에서 바로 "Start Session" (Context 선택 없음) [S][P] | Context 없는 세션 허용 여부 (`CreateSession.readingContext` nullable 은 이미 허용) | **부분 Resolved (#15)** — 세션 시작 위치(Activity Card·서재 "Start Session")는 결정. Reading Context 선택 없이 세션 시작 허용 여부는 NEEDS DECISION (Stage 3) |
| M-33 | 텍스트·비텍스트 대비 | §11 접근성 WCAG AA | Accent Button 흰 라벨 on `accents/teal` 2.07:1 (`17:12`), Tag 흰 글자 1.56–1.86:1 (`76:439–445`), `text-secondary` on 배경 2.00–3.29:1, 진행 바 1.94:1 [DC 계산] | 거의 모든 CTA·배지·캡션 AA 미달 → 토큰 조정 없이는 NFR 불충족 (R-15, §10 #18) | **Resolved (#18-①, D-01)** 주요 버튼 · 보조 텍스트·비텍스트는 가값 (P-01, P-02) |
| M-34 | 포커스·키보드 상태 | §11 WCAG AA (rules/frontend §9) | 모든 컴포넌트에 focus 상태 없음; Button 은 Hover 있음 `17:6/17:14` [DC] | Stage 1 Shared UI 에 focus 토큰 신규 필요 | 가값 (P-03) — 디자이너 대기, Stage 1 후 승인 |
| M-35 | 책 표지·캐릭터 에셋 권리 | §8.1 (표지 메타데이터), NFR | 실제 출판 표지 `145:929–145:1010`, `163:2531–2534` (Where the Wild Things Are, Grumpy Monkey, The Most Magnificent Idea 등); 캐릭터 `163:2529/2530/2536`, 아바타 `163:2528` | 표지 사용권, 캐릭터 소유권·상업 이용 확인 필요 (R-09/R-10) | **Resolved (C-17)** — 사용자 확인: 권리 확보, 바로 사용 |
| M-36 | Placeholder 데이터 불일치 | — | 표지 ↔ 제목 불일치 (`113:1992` "The Most Magnificent Idea" 표지에 "The Color Monster"), Prompt 문구 잘림 "…How" 반복 (`88:838`), 리포트 수치 불일치 (M-10) [S] | Visual QA 기준 화면으로 fixture 복사 금지 | No (보고) |
| M-37 | 템플릿 컴포넌트 이름 충돌 | §7.4 "Activity Card" | `Activity Card 17:57` = "Morning Walk" 데모 [S] | 개발자 혼동 | No (Figma 정리 권장) |
| M-38 | 성별 입력 필수 여부 | §7.2 "성별(선택)" | `Tag Color=Not selected 163:2798` 기본값 [DC] | "선택 안 함" 을 명시적으로 허용해야 함 — 방향 일치, 문구·옵션(Boy/Girl 외)·값 목록 결정 (DATA_MODEL `children.gender`) | **Resolved (C-7)** — Girl / Boy / Prefer not to say, 기본 미선택, `girl` · `boy` · `prefer_not_to_say` · 미응답 `null` |

## 7. 12개 기술 이슈 요약 — Frontend-only 기준 재라벨 (상세: `docs/ARCHITECTURE.md` §15)

각 칸은 `LABEL — 권장안` 형식의 라벨 1개. `—` = 해당 측 요구사항 없음. 이 표의 두 칸은 ARCHITECTURE §15와 동일하다.

| # | 이슈 | Frontend 결정 | Backend Handoff 요구사항 |
|---|---|---|---|
| 1 | Web-first + Wrapper vs Native | **CONFIRMED (사용자 결정 2026-09-14, #7)** — React/Vite + Capacitor 셸 + 네이티브 녹음 플러그인, **Stage 4에서 추가** (Stage 1–3 웹 전용) | — |
| 2 | Background Recording 범위 | **RECOMMENDED** — 백그라운드·잠금 녹음은 네이티브 RecorderAdapter로만 충족, Web은 foreground 전용 + 경고 (Web 녹음 허용 여부 OAQ-10) | — |
| 3 | Offline Recording Persistence | **RECOMMENDED** — 청크 로컬 영속 + SessionOutbox + UploadQueue(`MockUploadTransport`), 확정 전 로컬 삭제 금지 | **RECOMMENDED** — Supabase Storage resumable(TUS) 수신·part 검증·토큰 재발급 (RU) |
| 4 | STT Provider | **CONFIRMED** — Frontend 영향 없음, 분석 상태 Contract만 사용 (사용자 지시: STT Backend는 이 프로젝트 범위 밖) | **NEEDS DECISION** — Deepgram vs AssemblyAI 아동 샘플 파일럿 권장, Deepgram `mip_opt_out=true` (Backend Developer + 제품·법무, AP) |
| 5 | AI Provider | **CONFIRMED** — Frontend 영향 없음, 생성 문구는 응답 값만 표시 (사용자 지시: AI Backend는 범위 밖) | **NEEDS DECISION** — ZDR 계약 확보 Provider 권장, 아이 이름 미전송 (Backend Developer + 법무, AP) |
| 6 | Push Provider | **RECOMMENDED** — 권한 요청·기기 등록·deep link 진입 UX (Stage 3 Web + Mock), 네이티브 Push Adapter는 Stage 4 (#7 CONFIRMED), 네이티브 수신 SDK 선택은 provider 결정 이후로 보류 | **NEEDS DECISION** — OneSignal 권장(대안 FCM/APNs 직접), payload PII 최소화 (Backend Developer, BH) |
| 7 | PDF 생성 위치 | **RECOMMENDED** — 서버 제공 파일의 요청·상태 폴링·다운로드·공유 UX (Mock PDF) | **NEEDS DECISION** — 서버 `@react-pdf/renderer` + private 저장 + signed URL 권장 (Backend Developer, BH) |
| 8 | Raw Audio 90일 삭제 | **CONFIRMED** — 90일 보관 정책(NFR) 안내·`expiresAt`/expired 표시 | **RECOMMENDED** — 일일 Cron + Storage API delete + audit, SQL로 `storage.objects` 직접 삭제 금지 (DR) |
| 9 | Apple/Google Auth | **CONFIRMED** — Email·Apple·Google 요구(FR-01), `AuthGateway` + `MockAuthGateway`로 화면·흐름 구현 (Figma Apple 버튼 누락 M-16) | **RECOMMENDED** — 네이티브 `signInWithIdToken`(nonce) / Web OAuth PKCE, 토큰 검증 (AR) |
| 10 | Trial → Account | **CONFIRMED (사용자 결정 2026-09-14, C-12)** — 기기 로컬 draft만, 가입·동의 후 제출, 익명 계정·다른 기기 이어하기 없음 | — (익명 계정 방식 미채택, C-12) |
| 11 | Responsive Breakpoint | **CONFIRMED (사용자 결정 2026-09-14, #12)** — 모바일 레이아웃, `--bp-md` 600 / `--bp-lg` 1024, 앱 컬럼 최대 480px 가운데, 다단 없음, 세로 고정 | — |
| 12 | Deployment Topology | **CONFIRMED (사용자 결정 2026-09-14, C-18)** — Stage 8에 Mock 모드 웹 프리뷰 정적 배포만 (호스팅은 Stage 8 Plan), 앱 테스트 빌드 없음, Backend 배포는 범위 밖 | **NEEDS DECISION** — Render API + Worker(pg-boss) + Cron, Supabase 환경 분리 권장 (Backend Developer, BH) |

## 8. Cross-Stage Risks

| # | 위험 | 영향 Stage | 완화 |
|---|---|---|---|
| R-01 | ~~개발 범위 미확정~~ **Resolved** (Frontend-only CONFIRMED 2026-09-14). 잔여 위험: 편의상 Backend 코드·`apps/api`·`supabase/` 선행 생성 (Scope 위반) | 전체 | rules/qa.md Scope 체크(파일 목록 증거), §10 #26 write-path hook |
| R-02 | Capacitor를 Stage 4에 추가(#7)하므로 Stage 2–3의 Web `AuthGateway`·Push 권한 UX를 Stage 4에서 네이티브 Adapter로 확장할 때 재작업 가능 | 2, 3, 4 | Stage 2–3도 `AuthGateway`·`shared/platform` interface 뒤에 구현해 Stage 4는 Adapter 추가만; Stage 4 첫 작업 녹음 spike; 실기기 QA Stage 4부터 |
| R-03 | 모바일 웹 녹음이 NFR(백그라운드·잠금)을 충족 못 함 | 4, 8 | 네이티브 경로 필수, Web은 foreground 전용 명시 |
| R-04 | Figma에 P0 화면 다수 부재(동의, 온보딩 1–4, 프로필/페르소나, 설정, 데이터 관리, 권한/오프라인 상태) | 2, 3, 4, 7, 8 | design-agent Stage별 누락 목록(FRONTEND_IMPLEMENTATION_PLAN §9) → 해당 Stage plan/design 단계에서 화면별 디자이너 요청 vs design-agent 명세 선택 (C-13), 승인 전 디자인·구현 금지 |
| R-05 | ~~온보딩 설문 체계 충돌(M-03)~~ **Resolved** (C-8, D-04). 잔여: 한 역량 문항 전부 결측 시 처리 미정, Baseline v1(3.0–4.0세 설계)의 4세 이상 적합성 미확인 (C-10) | 2, 6, 7 | 설문 instrument 버전화(Data Requirement), 결측 처리는 Stage 2 Plan, 연령 적합성은 기획·전문가 확인 |
| R-06 | COPPA 개정 Rule(VPC, 동의 철회 미제공, 성 수집, 서면 보관·보안 정책, 벤더 조건) 미충족 시 베타 불가 | 2, 4, 8 (Handoff) | 법무 검토 L-01~L-07 (결정 기록 §6). Frontend는 VPC 슬롯(C-3)·동의 항목 설정값으로 결정 변경에 대비, 결과를 AUTH/DATA_REQUIREMENTS에 반영 |
| R-07 | **Mock ↔ 향후 실제 Backend 동작 drift**, `BACKEND_INTEGRATION_PENDING` 누적으로 통합 시 결함 발견 | 2–8, 통합 | Mock도 contracts parse·Error Envelope·전이 표 재현, 시나리오 결정성, Http Adapter 골격이 같은 contract 사용, Stage별 PENDING 목록 → Handoff 1:1 |
| R-08 | 아동 STT 정확도 낮음 → 분석·리포트 신뢰도 (Handoff 리스크) | 5, 7 (UX 문구) | 강건 지표·저품질 제외 규칙을 AP 문서에 명시, Frontend는 low-quality 안내 UX |
| R-09 | 콘텐츠 준비 지연: 책 20권 메타데이터, Prompt 책별 6개 전문가 감수, 4세 이상 연령 문항·Prompt (C-10), 페르소나 기본 풀, 버블 템플릿, 금지어 사전. ~~표지·캐릭터 권리 (M-35)~~ **Resolved** (C-17 — 사용자 확인: 권리 확보, 바로 사용) | 2, 3, 4, 5, 7 | 콘텐츠 준비를 운영 트랙으로 분리. Figma placeholder 데이터(표지↔제목 불일치 등)를 fixture로 복사 금지 (M-36). 이미지 최적화 포맷·해상도는 Stage 1 Plan |
| R-10 | ~~에셋 라이선스 (SF Pro 웹/Android 배포, 캐릭터 권리)~~ **Resolved** — 폰트 혼합 stack (Apple = 시스템 SF Pro, 그 외 Inter SIL OFL, `SF-Pro.ttf` 저장소·빌드 포함 금지 — #11), 캐릭터 권리 확보 (C-17). 잔여: 캐릭터 PNG/SVG 1–1.5MB 래스터 최적화 | 1 | Stage 1 Plan에서 Inter self-host·이미지 포맷(WebP/AVIF 1x–3x) 확정 |
| R-11 | ~~OneDrive 동기화 폴더·홈 디렉토리 git~~ **Resolved** — `~/dev/haru` + GitHub private, `docs/source/` 사본, 홈 git 유지 (#4) | — | ARCHITECTURE §1.3 |
| R-12 | ~~PRD 모호 수치(리포트 세션 수, 30분 pause 포함, 주기 기준일)~~ **Resolved** (#17). 잔여: 대화 전용 세션의 주기 기준 포함 여부·시간대 경계 | 7 | contracts 상수 CONFIRMED, 잔여 세부는 Stage 7 Plan |
| R-13 | PRD §14.1 M1 알파(녹음·기본 분석 포함 실사용)는 Frontend-only 산출물만으로 불가 → Backend Developer 합류 전 실제 가정 대상 테스트 불가 | 일정 | Stage 8 Handoff 품질 확보, Backend 합류 시점을 사용자 일정에 명시 |
| R-14 | Push·PDF·이메일(M-11) 등 벤더가 아동 PII를 처리 (Handoff 리스크) | 3, 7 (UX), Handoff | 알림 payload·PDF 내 PII 최소화 요구를 BH 문서에 명시, 벤더 DPA 검토 |
| R-15 | **접근성(WCAG AA) 미달**: 주요 버튼 teal 위 흰 라벨 **2.07:1** = **사용자 수용 예외 D-01** (#18-①; QA는 FAIL 기록 + `PASS (accepted: D-01)`, ADA 등 분쟁 가능성 법무 L-04). `text-secondary` on white 3.29:1, 흰 글자 배지 1.56–1.86:1, 진행 바·체크박스 비텍스트 < 3:1, focus 상태 없음, 글래스·틴트 표면 텍스트 버튼 라벨 대비 = **디자이너 대기 → 가값** (P-01, P-02, P-03, P-11). IconButton·Chip·Checkbox·별점 44pt 미만 (M-33, M-34, DESIGN_SYSTEM §12) | 1 (토큰·Shared UI), 전 Stage, 8 | 가값 토큰에 `provisional` 표시, Stage 1 후 항목별 승인 (결정 기록 §4). D-01 범위 밖(보조 텍스트·비텍스트·focus)은 일반 규칙으로 판정. Shared UI 완료 기준에 focus·44pt hit area 검사 포함 |
| R-16 | 캐릭터 경청·인사·완료 애니메이션 에셋 부재 (정지 이미지만), 포맷·라이브러리 미정 (FR-11, §7.5) | 4 | Stage 3 종료 전 포맷(Lottie/Rive/스프라이트/비디오) 결정, 라이브러리 도입은 승인 사항, reduced-motion 대체 정의 (DESIGN_SYSTEM §8–§9) |
| R-17 | ~~E2E·스크린샷 도구 미승인~~ **Resolved** — Playwright (#28). 잔여: Stage 1 설정 전 시각 비교 항목은 `NOT VERIFIED` | 1 | Stage 1에서 Playwright 설치·설정, INCOMPLETE 항목별 수용 절차 (#25) |
| R-18 | Agent 권한 분리 — **PreToolUse hook 설정 완료** (#26, `.claude/settings.json`·`.claude/hooks/`). 잔여: Bash 경유 쓰기는 hook으로 완전히 막히지 않음 | 전체 | 지침 + QA Scope 체크(파일 목록 증거) |

## 9. Handoff to design-agent

### 9.1 디자인 확인이 필요한 화면·상태
> Figma에 없는 화면은 해당 Stage plan/design 단계에서 Orchestrator가 화면별로 "디자이너 Figma 요청 vs design-agent 명세"를 사용자에게 묻고 승인 후에만 작업한다 (C-13). 아래 목록은 그 질문 대상이다.

1. 보호자 동의 화면 (C-1 5항목: 필수 ①②③ 항목별 체크 + 마케팅 선택 + 파일럿 참여(L-02)), 모든 가입 경로 뒤 동의 (C-2), VPC 단계 슬롯 (C-3) — M-01, M-02, M-27
2. 온보딩 5단계 (C-9): Step 1 아이 정보(성·이름 두 칸 D-03, 생년월, 성별 선택 C-7) · 2 기질 카드 · 3 책·선호 주제 · 4 성장 목표 + Step 5 Baseline v1 문항 카드(C-8, 비채점 응답 포함) + 진행바 + 이어하기. 가입 화면 아이 필드 제거 (C-5 — Figma `179:1724` 수정 디자이너 요청), 설문 소개 소요 시간 문구 — M-03, M-06, M-28
3. 프로필 결과(다이아몬드·강점/growing edge·페르소나 카드)·발전 역량 제시·축 탭 변경 — M-07
4. Apple 로그인 버튼 (Apple 공식 가이드 버튼, C-13), 비밀번호 재설정 흐름 — M-16, M-20
5. ~~탭/홈 내비게이션 구조~~ 결정 완료 — Tab Bar `25:87` Library / Home / Progress, 세션 탭 없음 (#15, D-02). Capability 짧은 표기(배지·차트)를 #14 라벨 기준으로 정리
6. Activity Card: Prompt 노출 시점, Context 선택 상세(직접 시간 선택 포함), 대화 전용 카드, 책 소진 대체 카드 — M-09, M-30, M-31
7. 서재: 보유 책 직접 등록, 증정 신청·배송 상태, 책별 Prompt, "My Saved/Reading now" 처리 — M-14
8. 세션: ready 리마인드 버블, Prompt 모아보기 Drawer 트리거, 마이크 권한 거부/대화 전용, 30분 자동 종료, 오프라인·업로드 실패·48h 안내, 크래시 복구 안내 — M-20, M-25, M-26
9. 회고 자유 후기 카드·skip·칩 문구 — M-15
10. 분석 상태·짧은 성장 피드백·저품질 안내
11. 리포트: 탭 정보 구조(주간 vs 4주 — 탭 표시 이름은 Progress #15), 미충족 진행도·지연, 4주 상세, 하이라이트 클립 재생·만료, PDF — M-10, M-11, M-12
12. Home skeleton (Stage 2 착지 화면 — 워드마크·설정 아이콘 `26:44`·빈 상태 안내, #33) + 설정 목록 (`26:44` 진입, Stage별 확장 — C-16): S2 로그아웃 → S3 알림 설정 → S6 전체 설정 → S8 데이터 관리(보관 정책·세션별 삭제·전체 삭제 확인)·탈퇴 (C-15) + 동의 이력 보기 선택 기능 (C-19, 미구현 시 QA FAIL 아님). 동의 철회 화면 없음 (C-4)
13. ~~Responsive 규칙~~ 결정 완료 (#12) — 480px 앱 컬럼·600/1024 breakpoint 적용 확인만
14. Loading / Empty / Error / Offline / Toast / Dialog 공통 패턴 — design-agent 명세로 Stage 1 구현 (#22, 가값 P-10) (Mock scenario key: API_CONTRACTS §5.4)
15. 캐릭터 애니메이션 에셋 포맷 (R-16) — 폰트(#11)·에셋 권리(C-17)는 결정 완료

### 9.2 제안 Route 목록 (design-agent가 Figma frame과 매핑)

| Route | Page | Layout | PRD IDs | Figma 후보 |
|---|---|---|---|---|
| `/auth/welcome` | WelcomePage | Fullscreen | FR-01 | `179:1701` |
| `/auth/sign-up` | SignUpPage (보호자 이름·이메일·비밀번호만 — C-5) | Fullscreen | FR-01 | `179:1724` (아이 필드·단일 동의 체크박스 제외) |
| `/auth/log-in` | LogInPage | Fullscreen | FR-01 | `179:1820` |
| `/auth/forgot-password` | ForgotPasswordPage | Fullscreen | FR-01 | 없음 |
| `/auth/reset-password` | ResetPasswordPage (메일 링크) | Fullscreen | FR-01 | 없음 |
| `/auth/consent` | GuardianConsentPage (C-1 5항목, 모든 가입 경로 뒤 — C-2) | Fullscreen | FR-02 | 없음 (`179:1724` 일부) — 디자인 방식 C-13 |
| `/auth/verify-parent` | ParentVerificationStep (VPC 단계 슬롯, Mock — C-3; 방식 L-01) — 경로명 RECOMMENDED | Fullscreen | FR-02, NFR VPC | 없음 |
| `/onboarding` | OnboardingIntroPage | Fullscreen | FR-03, FR-24 | `179:1748` |
| `/onboarding/:step` | OnboardingStepPage (child-info · temperament · books · goals · capability-items — 5단계 C-9) | Fullscreen | FR-03, FR-24 | `179:1770` (capability-items만, Baseline v1 C-8) |
| `/onboarding/saved` | OnboardingSavedPage | Fullscreen | FR-03 | `179:1809` |
| `/onboarding/profile` | ProfileResultPage | Fullscreen | FR-04, FR-05 | 없음 |
| `/onboarding/growth-capability` | GrowthCapabilityPage | Fullscreen | FR-06 | 없음 |
| `/` | HomePage — **Stage 2: Home skeleton** (착지 화면: 워드마크·설정 아이콘 `26:44`·빈 상태 안내, 하단 탭바 없음 — #33) → **Stage 3: 카드 덱·streak·하단 탭바** | Stage 2 탭 없음 → Stage 3 Tab | FR-07, FR-08, §7.4 보조 요소, §7.8 | `26:21` (카드 미배치 — M-30) + 덱 `163:2648`; Tab Bar `25:87` **중앙 탭 = Home** (#15), 상단 설정 아이콘 `26:44` (C-16) |
| `/cards/:cardId/prompts` | 카드 flip back 상태 또는 Home 내 Sheet (route화 여부 NEEDS DECISION) | Sheet/State | FR-07 | flip back `86:482` "Prompt of this book" (M-09) |
| `/cards/:cardId/context` | ReadingContextSheet | Sheet | FR-08 | 결과 chip `86:538` 만 — 선택 UI **Figma 누락** |
| `/library` | LibraryPage | Tab | FR-20, FR-22 | `30:74` |
| (`/library` 위 시트) "See all" | LibraryShelfSheet ("Our curated shelf" 목록) — **Figma에서는 시트**, route화(예: `?sheet=curated`) 여부 NEEDS DECISION | Sheet | FR-20, FR-22 | `163:1669` (Scrim `163:1807` + `type=shelf` `163:2347`) |
| `/library/books/:bookId` | BookDetailSheet (책별 Prompt·Start Session·증정 신청·구매 링크) — **Figma에서는 LibraryPage 위 시트**, 딥링크가 필요할 때만 route 유지 (NEEDS DECISION) | Sheet | FR-20, FR-22, FR-23 | `145:1132` (Scrim `145:1450` + 카드 `145:1085`) |
| `/library/add` | AddOwnBookPage | Fullscreen | FR-23 | 없음 |
| `/library/gift-requests` | GiftRequestsPage | Tab | FR-22, §13 | 없음 |
| `/session/:sessionId` | StorytimeSessionPage (ready/recording/paused, Prompt Drawer) | Fullscreen | FR-09, FR-10, FR-11, FR-14 | `28:51` |
| `/session/:sessionId/permission` | MicPermissionPage (대화만 하기) | Fullscreen | FR-09, §13 | 없음 |
| `/session/:sessionId/complete` | SessionCompletePage (성공 버블·스티커) | Fullscreen | FR-10, FR-19 | `29:62` 상단 |
| `/session/:sessionId/reflection` | ReflectionPage (체크·후기) | Fullscreen | FR-12 | `29:62` 하단 |
| `/session/:sessionId/feedback` | ShortFeedbackPage (push deep link) | Tab | FR-13, §13 | 없음 |
| `/progress` — **RECOMMENDED** (탭 표시 이름 Progress #15와 경로 일치, 웹 프리뷰 URL 가독성) | ReportOverviewPage (기능·문서 명칭 "리포트" 유지 — PRD: 다이아몬드 현황·주기 진행도·아카이브 / Figma: 주간 Progress, IA는 M-10) | Tab | FR-04, FR-16 | `31:102` 제목 "Progress" `31:117` (M-10) |
| `/progress/reports/:reportId` — **RECOMMENDED** | ReportDetailPage (오버레이·페르소나 히스토리·클립·PDF) | Tab | FR-15, FR-16, FR-17, FR-18 | 없음 |
| `/settings` | SettingsPage — 설정 목록, **Stage 2**부터 (Stage 2 = 로그아웃 액션, 이후 Stage별 항목 추가 — C-16) | Stack | FR-01, §7.8 | 진입 아이콘 `26:44` 만 — 목록 디자인 방식 C-13 |
| `/settings/child` | ChildProfileEditPage (설문 재응답) — Stage 6 (C-16) | Stack | FR-03, FR-06, §7.8 | 없음 |
| `/settings/growth-capability` | GrowthCapabilitySettingsPage — Stage 6 (C-16) | Stack | FR-06 | 없음 |
| `/settings/notifications` | NotificationSettingsPage — **Stage 3** (C-16) | Stack | FR-08 | 없음 |
| `/settings/account` | AccountPage (탈퇴·플랜 표시) — Stage 8 (C-15). 로그아웃은 Stage 2 `/settings` 목록의 액션 | Stack | §7.8 | 없음 |
| `/settings/privacy` | ConsentHistoryPage (동의 이력 보기, 읽기 전용 목록) — Stage 8 선택 기능 (C-19, 미구현 시 QA FAIL 아님). 철회 UI 없음 (C-4) | Stack | FR-02 (PRD §12.1 동의 이력) | 없음 |
| `/settings/data` | DataManagementPage (보관 정책·세션별 녹음 삭제·전체 삭제) — Stage 8 (C-15) | Stack | FR-21 | 없음 |
| `/legal/terms`, `/legal/privacy` | LegalDocumentPage | Stack | FR-02 | 없음 |

탭 구조(Library / Home / Progress, `/session` 탭 진입점 없음)는 **CONFIRMED (사용자 결정 2026-09-14, #15, D-02)**. 개별 경로명은 **RECOMMENDED** 이며 각 Stage Plan에서 확정한다. 세션 route(`/session/:sessionId/*`)는 탭이 아니라 Activity Card·서재 "Start Session"에서 진입한다. Figma 기준 매핑은 design-agent `docs/FIGMA_SCREEN_MAP.md` §1, 누락 화면은 같은 문서 §2 를 따른다. 시트로 디자인된 화면(서재 "See all", 책 상세, Prompt Drawer `88:960`, Context 선택)은 route가 아니라 부모 페이지의 상태로 구현하는 것을 기본으로 하고, 알림 deep link가 필요한 경우만 route화한다 (RECOMMENDED).

## 10. Stage 1 Pre-Approval Checklist

| # | 결정 | 선택지 / 권장 | 라벨 |
|---|---|---|---|
| 1 | Stage 0 산출물 승인 (plan-agent 4종 + design-agent 5종) | **승인 완료** | CONFIRMED (사용자 승인 2026-09-14, #1) |
| 2 | ~~Delivery Mode~~ | **Resolved** — Frontend-only (사용자 지시 2026-09-14), CLAUDE.md·rules·agents 개정 완료 | CONFIRMED (사용자 결정 2026-09-14, #2) |
| 3 | Stage 8 범위 | Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능 (C-15) + Mock 모드 웹 프리뷰 정적 배포 (C-18, 호스팅은 Stage 8 Plan) + Backend Handoff Package → STOP. 앱 테스트 빌드·Backend 배포 제외 | CONFIRMED (사용자 결정 2026-09-14, C-15 · C-18) |
| 4 | Repository 위치: OneDrive 밖 ASCII 경로 신규 저장소, 홈 디렉토리 git 처리, 원격 저장소, ` docs` 공백 제거 | **Resolved** — 로컬 `~/dev/haru` + origin GitHub private, `docs/source/` 사본 (PRD·8Stage v0.2·prompts·Baseline v1 — C-14), 홈 디렉토리 git(Lawservice) 유지 (ARCHITECTURE §1.3) | CONFIRMED (사용자 결정 2026-09-14, #4) |
| 5 | 패키지 구조: `validation` → `contracts` 병합, `shared-types` 미생성, `apps/mobile` 추가 | 권장안 승인 (`apps/mobile` 생성은 Stage 4 — #7) | CONFIRMED (사용자 결정 2026-09-14, #5) |
| 6 | Package manager·Node 버전 (pnpm workspaces, Node LTS) | pnpm workspaces + Node LTS | CONFIRMED (사용자 결정 2026-09-14, #6) |
| 7 | Capacitor 도입 여부·시점 (Stage 1 셸 vs Stage 4) | **도입, Stage 4에서 추가** — Stage 1–3 웹 전용 (AuthGateway·Push 권한 UX = Web + Mock), Stage 4에 셸·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter, 실기기 QA Stage 4부터 | CONFIRMED (사용자 결정 2026-09-14, #7) |
| 8 | Mock Adapter 구조: 도메인별 `Mock<Domain>Api` / `Http<Domain>Api` (rules/architecture §4 예시) + 공통 helper, MSW 미사용 | 승인 (API_CONTRACTS §5.2) | CONFIRMED (사용자 결정 2026-09-14, #8) |
| 9 | 라이브러리 승인 (Stack 외): import 경계 lint 도구; (필요 시) TanStack Query persist; **차트** — 인라인 SVG (CapabilityDiamondChart·WeeklyReadingChart) vs 차트 라이브러리; **제스처/애니메이션** 라이브러리 (SwipeDeck·카드 flip·Sheet); **아이콘 라이브러리** (#21과 연동); **dev 전용 UI gallery route** (Production tree-shake, Storybook 대체) | 제안대로 — 차트 inline SVG, 제스처·애니메이션 CSS/Pointer Events 우선 (라이브러리는 필요 시 별도 승인), dev 전용 UI gallery route, import 경계 lint (도구는 Stage 1 Plan), (필요 시) TanStack Query persist, 아이콘 = #21 | CONFIRMED (사용자 결정 2026-09-14, #9) |
| 10 | Design token 정규화 승인 (3-tier 구조, raw 텍스트 크기 흡수표·최소 11px, radius 6단계, 흰색 알파 3단계, Figma Variable rename 요청) + **신규 토큰 값** 확정 (focus ring, status 색, scrim, opacity-disabled, z-index, motion duration/easing, breakpoints, app max width, safe-area) — DESIGN_TOKEN_MAP T-1…T-9, DESIGN_SYSTEM D-3/D-4 | 3-tier 채택, 값은 Figma만 기준 (로컬 `_ds` CSS 참조 금지), raw 값 스케일 흡수 (텍스트 iOS 타입 스케일 최소 11px, radius 6단계, 흰색 알파 3단계), Variable 이름 정리는 디자이너 요청. 신규 토큰 이름·용도 확정, 값은 디자이너 — 그 전까지 design-agent 제안 값으로 Stage 1 진행 | CONFIRMED (사용자 결정 2026-09-14, #10) / 값 가값 (P-04~P-09) |
| 11 | 폰트: Figma 전체가 SF Pro — Apple 플랫폼 용도로 한정되는 것으로 알려져 Web/Android 배포 시 위반 가능성 (법무 원문 확인 필요). 옵션 A system font stack / B 라이선스 웹폰트 1종 (예: Inter, SIL OFL) / C 하이브리드. **로컬 `SF-Pro.ttf` 는 어떤 빌드에도 포함 금지** (DESIGN_SYSTEM §2.3, D-1) | **혼합** — Apple 기기(iOS·macOS) 시스템 폰트(SF Pro), 그 외 Inter (SIL OFL, self-host 권장). stack `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (`system-ui` 를 Inter 앞에 두지 않음). `SF-Pro.ttf` 저장소·빌드 포함 금지 | CONFIRMED (사용자 결정 2026-09-14, #11) |
| 12 | Breakpoint·앱 컬럼 최대폭·가로 모드 (§7 #11, DESIGN_SYSTEM §11, D-5): 제안 compact 320–599 / `--bp-md` 600 / `--bp-lg` 1024, md 이상은 중앙 정렬 앱 컬럼 (최대폭 예시 480), 다단 레이아웃 없음 | 전 화면 모바일 레이아웃, 넓은 화면 = 가운데 앱 컬럼 최대 480px, 다단 없음, `--bp-md` 600 / `--bp-lg` 1024 (320–599 모바일), 세로 고정 (Capacitor portrait lock Stage 4, 웹 가로 = 앱 컬럼) | CONFIRMED (사용자 결정 2026-09-14, #12) |
| 13 | Capability 코드 키 (`emotion_regulation`, `self_directed_agency`, `cognitive_flexibility`, `intrinsic_motivation`) | 승인 | CONFIRMED (사용자 결정 2026-09-14, #13) |
| 14 | Capability 사용자 노출 라벨 (M-13, "Confidence" 처리 포함) | Figma Growth themes `31:102` — Emotion Regulation · Self-Direction · Cognitive Flexibility · Intrinsic Motivation (역량 정의는 PRD §4). 책장 "Confidence" → 4대 역량 라벨 교체 (Figma 수정 디자이너 요청), 짧은 표기는 design-agent | CONFIRMED (사용자 결정 2026-09-14, #14) |
| 15 | 내비게이션 구조 (M-08, D-6): PRD §6.1 (서재 / 세션 중앙 / 리포트 + 홈 상단 아이콘) vs Tab Bar 컴포넌트 `25:87` (Library / Home 중앙 / Progress) vs `110:522` (Library / Session 중앙 / Report). BottomTabBar는 items config 주입으로 Stage 1 진행 가능하나 TabLayout·route 확정에 필요 | **Tab Bar `25:87`** — Library / Home(중앙) / Progress, 세션 탭 없음 (Activity Card·서재 "Start Session"에서 시작), 설정 = Home 상단 `26:44`, 기능 명칭 "리포트" 유지. PRD §6.1과 다름 → D-02 | CONFIRMED (사용자 결정 2026-09-14, #15, D-02) |
| 16 | Session 상태 모델: `abandoned` 추가, `mode`, `completedReason`, `analysisOutcome`, retry 비상태화, 별도 upload status (ARCHITECTURE §10) | ARCHITECTURE §10 모델 승인. 동의 철회 의존 값(`skipped_consent_revoked`)은 C-4로 제거 | CONFIRMED (사용자 결정 2026-09-14, #16) |
| 17 | contracts 상수 기본값: 리포트 최소 세션 수(2/3), 30분 pause 포함 여부 | `MIN_REPORT_RECORDED_SESSIONS=3` + `MIN_REPORT_RECORDED_SECONDS=3600`; `MAX_RECORDED_SECONDS=1800` 실제 녹음 시간 기준 (일시정지 제외); `excluded_low_quality` 세션은 발행 기준(세션 수·누적 시간)에서 제외; 4주 주기 = 첫 세션 완료일부터 28일 단위 반복 (대화 전용 세션 포함 여부·시간대 경계는 Stage 7 Plan) | CONFIRMED (사용자 결정 2026-09-14, #17) |
| 18 | **WCAG AA 대비 수정** (M-33, R-15): Accent(teal) 위 흰 라벨 **2.07:1**, `text-secondary` on white **3.29:1** (Orchestrator 재계산 확인), 흰 글자 배지 1.56–1.86:1, 비텍스트(진행 바·체크박스) < 3:1 → 해결 방식 (T-2 secondary 재지정 / T-3 진한 teal primitive·라벨 색 변경·대형 텍스트 전용) + focus ring 토큰 (M-34) | ① 주요 버튼 현재 색 유지 (2.07:1) = 사용자 수용 예외 D-01 (법무 L-04) ② 보조 텍스트 ③ 비텍스트 ④ focus ring = 디자이너 대기, 가값으로 Stage 1 진행 (Stage 1 차단 해소) | CONFIRMED (사용자 결정 2026-09-14, #18-①, D-01) / 가값 (P-01, P-02, P-03) |
| 19 | Capability 색 매핑 (DESIGN_TOKEN_MAP §2.7, T-4, D-9): 화면마다 다름 (agency green vs teal, flexibility cyan vs blue, motivation purple vs violet) → capability별 `-bg` / `-fg` / `-chart` 단일 매핑 | **배지(Tag) 색으로 통일** — `self_directed_agency` green `#90bfad` · `emotion_regulation` pink `#efc3d4` · `cognitive_flexibility` cyan `#a0ccdd` · `intrinsic_motivation` purple `#c9b8d4`, 배지·차트 같은 색 (Figma `31:102` 차트 수정 디자이너 요청). 배지 글자 색은 가값 (P-02) | CONFIRMED (사용자 결정 2026-09-14, #19) |
| 20 | Dark mode MVP 제외 (DESIGN_SYSTEM §13, D-8): Light 전용 `color-scheme: light` | 제외 (Light 전용) | CONFIRMED (사용자 결정 2026-09-14, #20) |
| 21 | 아이콘 소스 (DESIGN_SYSTEM §7, D-7): Figma `Icon 50:157` + 화면 내 개별 SVG를 export 자산화 vs 오픈소스 아이콘 라이브러리 (Stack 외 → 승인), 크기 16/20/24, 누락 아이콘 목록 확정 | 일반 아이콘 = Lucide (`lucide-react`, ISC, 버전 고정은 Stage 1 Plan), HARU 전용 = Figma SVG export (`attend`, thumb, record, flip 등), Figma 일반·누락 아이콘은 Lucide 대응 아이콘으로 대체, Google·Apple 로고 = 공식 브랜드 에셋. 크기 단계 가값 (P-09) | CONFIRMED (사용자 결정 2026-09-14, #21) |
| 22 | 공통 상태 (Loading / Empty / Error+Retry / Offline Banner / Toast / Dialog, 컴포넌트 focus·error·loading 상태) — 전부 Figma 누락. **Figma에 먼저 디자인** vs **design-agent 명세 기반 구현 허용** (D-10) | design-agent 명세로 Stage 1에서 먼저 구현, 기존 토큰·컴포넌트만 사용, Stage 1 후 항목별 유지/수정 승인 | CONFIRMED (사용자 결정 2026-09-14, #22) / 가값 (P-10) |
| 23 | 캐릭터·책 표지 에셋 권리·최적화 포맷 (D-11, M-35, R-09/R-10) | 캐릭터·책 표지 모두 바로 사용 (사용자 확인: 권리 확보). 최적화 포맷·해상도는 Stage 1 Plan | CONFIRMED (사용자 결정 2026-09-14, C-17) |
| 24 | **(a) 승인 체크포인트 규칙 확인**: Stage 수행 요청("Stage N 진행해줘")은 Plan/Design Spec 승인이 아니다. 전체 구현 요청은 plan-agent + design-agent 산출물 후 **1회 멈춤** → 사용자 명시 승인 → development-agent (rules/workflow.md §3) | 규칙 채택 | CONFIRMED (사용자 결정 2026-09-14, #24) |
| 25 | **(b) Stage Verdict `INCOMPLETE` 와 항목별 사용자 수용**: FAIL 0 + PARTIAL/NOT VERIFIED ≥1 = INCOMPLETE (PASS 아님). 사용자가 잔여 항목을 QA-N-### 단위로 명시 수용하면 `PASS (accepted: …)` 로 기록 (rules/qa.md §2 제안) | 채택 | CONFIRMED (사용자 결정 2026-09-14, #25) |
| 26 | **(c) 쓰기 경로 강제 PreToolUse hook**: `apps/api/**`, `supabase/**` 는 모든 Agent에서 항상 차단; `apps/**`, `packages/**` 는 development-agent 외 Agent에서 차단 | hook 도입 — `.claude/settings.json` + `.claude/hooks/` 설정 완료 | CONFIRMED (사용자 결정 2026-09-14, #26) |
| 27 | **(d) Supabase JS Client 보류**: Stage 1–8에서 사용하지 않음, `AuthGateway`·Upload는 interface + Mock. 실제 Supabase Adapter는 Backend 연동 시점 또는 별도 승인 후 | Stage 1–8 미사용 | CONFIRMED (사용자 결정 2026-09-14, #27) — 실제 Adapter 추가 시점은 OAQ-19 |
| 28 | **(e) E2E / 스크린샷 도구** | Playwright | CONFIRMED (사용자 결정 2026-09-14, #28) |
| 29 | **(f) Tailwind major version** | v4 (CSS-first `@theme`) | CONFIRMED (사용자 결정 2026-09-14, #29) |
| 30 | **이월 항목 위치**: FR-21 데이터 관리 UI(P0), 탈퇴, 동의 이력 보기 | **Stage 8 유지** — 데이터 관리 UI·탈퇴 필수, 동의 이력 보기는 선택 기능 (C-19, 미구현 시 QA FAIL 아님) | CONFIRMED (사용자 결정 2026-09-14, C-15 · C-19) |
| 31 | **설정 계열 진입점**: 로그아웃(Stage 2)·알림 설정(Stage 3)이 전체 설정(Stage 6)보다 먼저 필요 | Home 상단 설정 아이콘 `26:44` 를 Stage 2 Home skeleton에 최종 위치로 연결 (#33), 목록 확장: S2 로그아웃 → S3 알림 설정 → S6 전체 설정 → S8 데이터 관리·탈퇴 (+ 선택: 동의 이력 보기, C-19). 목록 화면 디자인은 C-13 | CONFIRMED (사용자 결정 2026-09-14, C-16) |
| 32 | **동의 철회**: PRD·Figma 근거 없음 | **MVP 제외** — 탈퇴·전체 삭제 요청(FR-21)만. `consent-revoked` scenario key, `skipped_consent_revoked`, 철회 Contract 제거 | CONFIRMED (사용자 결정 2026-09-14, C-4) / COPPA 관계 NEEDS DECISION (법무, L-03) |
| 33 | **Stage 2 착지 화면**: 로그인·온보딩 완료 후 착지 화면 및 설정 아이콘 위치 (Home 이전) | **Resolved — Home skeleton 먼저**: Stage 2에서 `/` Home skeleton (상단 워드마크 + 설정 아이콘 `26:44` 최종 위치 + 빈 상태 안내)을 로그인·온보딩 완료 후 착지 화면으로 구현. Activity Card 등 Home 콘텐츠·하단 탭바는 Stage 3 | CONFIRMED (사용자 결정 2026-09-14, #33) |

Stage 0 산출물 **승인 완료** (#1, 2026-09-14). Stage 2 전 결정 C-1~C-18·#33 완료, C-19 반영 (결정 기록 §1). C-1~C-3, C-5~C-14는 §4.1·§5 Stage 2·§6에 반영했다.

## 11. 수용 예외 · 가값 · 법무 검토 (요약 — 원문은 결정 기록)

값·범위·상태의 원문은 `docs/decisions/stage-0-approvals.md` 에만 둔다. 이 절은 목록과 영향 위치만 가리킨다. (DESIGN_SYSTEM의 D-1…D-11 은 디자인 결정 후보 번호이며 아래 D-01…D-04 와 다르다.)

| 구분 | ID | 요약 | 결정 기록 | 이 문서 영향 위치 |
|---|---|---|---|---|
| 사용자 수용 예외 (QA: FAIL 기록 + `PASS (accepted: D-xx)`) | D-01 | 주요 버튼 teal 위 흰 라벨 2.07:1 유지 | §3 | §4.2 접근성, §8 R-15, §10 #18 |
| | D-02 | 하단 탭 Library / Home / Progress (PRD §6.1과 다름) | §3 | §9.2, §10 #15 |
| | D-03 | 아이 이름 성·이름 두 칸 | §3 | §4.2 최소 수집, §5 Stage 2, §6 M-28 |
| | D-04 | 온보딩 Step 5 = Baseline v1 10문항 | §3 | §4.1 FR-03, §5 Stage 2, §6 M-03 |
| 가값 (FAIL 사유 아님, Stage 1 후 항목별 승인) | P-01~P-03 | 보조 텍스트 색 · 비텍스트 요소 · focus ring | §4 | §5 Stage 1, §8 R-15, §10 #18 |
| | P-04~P-09 | status 색 · scrim · z-index · motion · safe-area · 아이콘 크기 | §4 | §5 Stage 1, §10 #10, #21 |
| | P-10 | 공통 상태 화면·컴포넌트 상태 디자인 | §4 | §5 Stage 1, §10 #22 |
| | P-11~P-16 | 글래스·틴트 표면 텍스트 버튼 라벨 대비 · radius-surface 22/24 · gutter 24/26 · gradient stop · 버튼 높이 · medallion 크기 | §4 | §5 Stage 1, §8 R-15 (P-11) |
| 법무 검토 (출시 전 미국 변호사) | L-01 | VPC 방식 | §6 | §4.1 FR-02, §5 Stage 2 |
| | L-02 | 파일럿 참여 동의 필수/선택·문구 | §6 | §4.1 FR-02, §5 Stage 2 |
| | L-03 | 동의 철회 미제공과 COPPA 보호자 권리 | §6 | §4.1 FR-02, §10 #32 |
| | L-04 | 접근성 수용 예외(D-01) | §6 | §8 R-15 |
| | L-05 | 서면 데이터 보관 정책·정보보안 프로그램 | §6 | §8 R-06, Handoff |
| | L-06 | STT·AI·Push 벤더 아동 데이터 조건 (ZDR·DPA) | §6 | §7 #4–#6, Handoff |
| | L-07 | 아이 성(last name) 수집 | §6 | §4.2 최소 수집, §6 M-28 |
| 제품 결정 (Rev 6) | #33 | Stage 2 착지 = `/` Home skeleton (워드마크·설정 아이콘 `26:44`·빈 상태 안내). Home 콘텐츠·하단 탭바는 Stage 3 — CONFIRMED | §1 #33 | §4.1, §5 Stage 2, §9.2, §10 #33 |
| | C-19 | 동의 이력 보기 = 선택 기능 (Stage 8, 시간 여유 시 읽기 전용 목록, 미구현 시 QA FAIL 아님) — CONFIRMED | §1 C-19 | §4.1 FR-02, §5 Stage 8, §9.2, §10 #30 |
| 미결 제품 결정 | M-32 잔여 | Reading Context 선택 없이 세션 시작 허용 여부 — NEEDS DECISION (Stage 3) | — | §5 Stage 3, §6 M-32 |

