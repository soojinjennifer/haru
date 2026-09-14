# HARU — Project Instructions

HARU는 미국 1차 시장의 **Caregiver-facing Parenting Intelligence / Storytime Coach** 서비스다.
3~9세 아이의 양육자가 아이와 약 15분 함께 책을 읽는 시간을 대화와 성장 관찰의 시간으로 바꾼다.
아이에게 Screen Time을 추가하는 Child-facing App이 아니다.

4대 내적 역량: Emotional Regulation · Self-Directed Agency · Resilience / Cognitive Flexibility · Intrinsic Motivation
(사용자 노출 라벨과 contracts 코드 키는 Stage 0 결정 항목 — `PLANNING.md`)

MVP 전제: 양육자가 계정 소유자, 아이는 로그인 계정 없음, Child Profile 1명, 아동 음성·성장 데이터는 Privacy-sensitive Data.

## Development Scope — Frontend-only (CONFIRMED, 사용자 지시 2026-09-14)

원문: `docs/source/prompts/01-stage0-1-1-frontend-scope.md`

- 현재 개발 범위는 **Frontend까지**다. Backend는 별도 Backend Developer가 이후 개발한다.
- 최종 목표: **Frontend Complete → Frontend QA PASS → Backend Handoff Package 생성 → STOP**
- 사용자가 별도로 명시 요청하지 않는 한 **구현 금지**:
  Node.js / Express Production API · Backend Route / Controller / Service / Repository · Supabase Database Migration · Supabase Server-side Logic · Supabase RLS Policy · Supabase Storage Server Logic · STT Backend · AI Backend · Analysis Worker · Background Job · Cron Job · Render Backend Deployment · Production Database Schema 적용
- Backend 관련해서는 다음만 수행한다:
  API Contract 정의 · Request / Response Schema · Error Code · Authentication Requirement · Data Requirement · State Definition · Storage Requirement · Recording Upload Contract · Async Analysis Contract · Mock API · Mock Data · Backend Handoff Documentation
- Frontend는 실제 Backend 없이도 모든 주요 UX와 상태를 검증할 수 있도록 **Mock API Layer** 위에서 개발한다.
- `packages/contracts` (Zod) 가 Frontend와 향후 Backend 사이의 공식 Interface Contract다. Mock도 같은 Contract를 사용한다.
- **Stage 8 (Frontend Final QA + Backend Handoff) 완료 후 반드시 STOP.** Backend implementation, Supabase migration, Node API, STT, AI Analysis, Render deployment를 자동으로 시작하지 않고 사용자 승인을 기다린다.

## Current Status

- **Stage 0 — Frontend Architecture + Figma Mapping + Agent Setup + Design System + API Contract Planning: 산출물 검토·승인 대기**
- **Stage 1 이후 구현은 사용자 명시적 승인 전까지 시작하지 않는다. Production Code 작성 금지.**
- 진행 상태와 요구사항 매핑: `PLANNING.md`
- **사용자 결정 기록: `docs/decisions/stage-0-approvals.md`** — 기존 문서와 다르면 이 기록이 우선한다.
- 승인된 기술 선택 (2026-09-14): pnpm workspaces · Tailwind CSS v4 · Playwright · MSW 미사용 · Supabase JS Client 미사용 (Stage 1–8) · Dark mode MVP 제외 · Capacitor 도입 (Stage 4에서 추가, Stage 1–3은 웹 전용) · 저장소 `~/dev/haru` (origin `https://github.com/soojinjennifer/haru.git`, private)

## 8 Stages (모두 Frontend Development Stage)

| Stage | 범위 | Backend 처리 |
|---|---|---|
| 0 | Frontend Architecture + Figma Mapping + Agent Setup + Design System + API Contract Planning | 설계만 |
| 1 | Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure | 없음 |
| 2 | Auth + Consent + Onboarding + Child Profile (Frontend) | Mock |
| 3 | Home + Activity Card + Library + Book Selection + Recommendation (Frontend) | Mock |
| 4 | Storytime Session + Recording Client + Pause / Resume + Prompt Drawer + Local Recording + Upload UX | Upload Contract + Mock |
| 5 | Reflection + Async Analysis Status + Short Feedback (Frontend) | Analysis Mock |
| 6 | Personalization + Profile Update + Recommendation Loop (Frontend) | Recommendation Mock |
| 7 | 4-Week Report + History + Highlight Audio + PDF UX (Frontend) | Report Mock |
| 8 | Frontend Final QA + Accessibility + Responsive + Regression + Backend Handoff Package | **완료 후 STOP** |

## Source of Truth

| 구분 | 위치 |
|---|---|
| Functional | `docs/source/HARU_PRD_v1.4.md` |
| Visual | Figma HARU_MVP — fileKey `YWWu3AFEJpRxvw0T5klq0k` (page `8:2` Design Guide, page `16:2` MVP_KeyScreen_V.2) |
| Scope | `docs/source/prompts/01-stage0-1-1-frontend-scope.md` (Frontend-only 경계) |
| 참고 | `docs/source/HARU_Development_Architecture_8Stage_v0.2.md`, `$HARU_ONEDRIVE/디자인/**` 프로토타입, `$HARU_ONEDRIVE/기존 자료/HARU_Developmental_Baseline_Survey_v1.docx.md` |

- PRD = Functional Source of Truth, Figma = Visual Source of Truth.
- PRD와 Figma에 없는 요구사항을 임의로 추가하지 않는다. 불일치는 보고하고 결정을 기다린다.
- 최신 PRD와 Figma, 최신 사용자 지시는 이전 대화·Agent Memory보다 우선한다.

## Agent Workflow (필수)

프로젝트 Agent: `plan-agent`, `design-agent`, `development-agent`, `stage-qa-agent` (`.claude/agents/`)
모든 Agent는 **현재 개발 Scope가 Frontend라는 사실을 우선**한다.

| 요청 | 순서 |
|---|---|
| 전체 Stage / 기능 구현 | plan-agent → design-agent → (사용자 승인 체크포인트) → development-agent → stage-qa-agent |
| 계획만 | plan-agent |
| 디자인 검토만 | design-agent |
| 승인된 계획 구현 | development-agent → stage-qa-agent |
| QA만 | stage-qa-agent |

QA FAIL → development-agent 수정 → stage-qa-agent 재검증 (PASS까지 반복).
실제 Backend가 없어 검증할 수 없는 항목은 `BACKEND_INTEGRATION_PENDING` 으로 판정하며, 그 이유만으로 Stage를 FAIL 처리하지 않는다. Contract 또는 Mock 구현 자체가 잘못되면 FAIL.
상세 규칙: `.claude/rules/workflow.md`

## Rules

- `.claude/rules/workflow.md` — Agent 순서, 권한, 승인 체크포인트, Stage Gate, Stage 8 STOP
- `.claude/rules/architecture.md` — Frontend-only Monorepo 경계, 레이어, API Client/Adapter, Contracts, Session State, Recording Client, Privacy
- `.claude/rules/frontend.md` — React/Vite 구조, Mock Layer, Design Token 사용, Server State, 상태 화면, 접근성
- `.claude/rules/backend.md` — Backend 구현 금지 범위, Contract/Mock/Handoff 작성 규칙, Handoff에 기록할 Backend 요구사항
- `.claude/rules/qa.md` — 판정 기준(`BACKEND_INTEGRATION_PENDING` 포함), Severity, 체크리스트

## Non-negotiables

- Plan / Design / QA Agent는 Production Code를 수정하지 않는다. 수정은 development-agent만.
- development-agent는 Frontend Production Code(+ `packages/contracts`, Mock)만 작성한다. `apps/api/`, `supabase/` 를 만들지 않는다.
- Stage QA PASS 전 다음 Stage 진입 금지. 승인된 Scope 밖 구현 금지.
- Request/Response/Enum/Error Code/Session State/Validation Schema는 `packages/contracts` 에서만 정의.
- Component는 API를 직접 호출하지 않는다: `UI/Feature → Query/Mutation → API Client Interface → Mock Adapter | Http Adapter`.
- Mock Data를 UI Component에 하드코딩하지 않는다.
- 화면 코드에 임의 HEX / spacing / radius 금지 — Design Token만 사용.
- Page는 Composition만. API 호출 / AI / Recording 처리 / 복잡한 로직 금지.
- Frontend에 Secret(Service Role Key, AI Key, STT Secret) 노출 금지.
- 사용자 노출 언어는 영어. 진단·판정·비교 표현 금지 (관찰·신호·성장 힌트 언어).

## Stage 0 Documents

`docs/ARCHITECTURE.md` · `docs/FIGMA_SCREEN_MAP.md` · `docs/COMPONENT_MAP.md` · `docs/DESIGN_SYSTEM.md` · `docs/DESIGN_TOKEN_MAP.md` · `docs/DATA_MODEL.md` · `docs/API_CONTRACTS.md` · `docs/FRONTEND_IMPLEMENTATION_PLAN.md` · `PLANNING.md` · `docs/decisions/stage-0-technical-research.md`

Stage 8 Handoff (예정): `docs/BACKEND_HANDOFF.md` · `docs/API_CONTRACTS.md` · `docs/DATA_REQUIREMENTS.md` · `docs/AUTH_REQUIREMENTS.md` · `docs/RECORDING_UPLOAD_SPEC.md` · `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` · `docs/ERROR_CODES.md`

## Repository & Environment

- 저장소: `~/dev/haru` (OneDrive 밖) · origin `https://github.com/soojinjennifer/haru.git` (private). GitHub가 백업·다른 컴퓨터 동기화 수단이다 (다른 컴퓨터: `git clone` → 작업 전 `git pull` → 작업 후 `git push`). commit·push는 사용자 요청 시에만 한다.
- 원본 기획·디자인 자료는 OneDrive에 둔다. 문서의 `$HARU_ONEDRIVE` = `/Users/soojin/Library/CloudStorage/OneDrive-개인/HARU` (`디자인/`, `기존 자료/`, `Chracter/`). 이 경로에는 한글·공백이 있으므로 셸에서 반드시 인용한다.
- 저장소에 포함된 원본 사본: `docs/source/HARU_PRD_v1.4.md`, `docs/source/HARU_Development_Architecture_8Stage_v0.2.md`, `docs/source/prompts/` (사용자 지시 원문). 사본은 수정하지 않으며, OneDrive 원본이 갱신되면 사본을 교체한다.
- 이전 작업 폴더 `$HARU_ONEDRIVE/HARU Dev` 는 보존용이다. 개발·문서 갱신은 이 저장소에서만 한다.
- 사용자 홈 디렉토리(`/Users/soojin`)에는 다른 프로젝트(Lawservice)의 git 저장소가 있다. 건드리지 않는다 (Stage 0 #4-3).
- 쓰기 경로 guard hook (`.claude/settings.json`, `.claude/hooks/`, Stage 0 #26):
  - Write / Edit / NotebookEdit 로 `apps/api/**`, `supabase/**` 작성은 누구든 차단한다.
  - `apps/**`, `packages/**` 는 `development-agent` subagent만 쓸 수 있다. 범용 Agent에게 "development-agent 역할"을 지시하면 차단되므로 반드시 `subagent_type: development-agent` 로 호출한다.
  - Stop / SubagentStop 시 `apps/api`, `supabase` 가 존재하면 경고한다. Bash 경유 쓰기는 PreToolUse로 완전히 막히지 않으므로 지침과 QA로 보완한다.
