==================================================
개발 범위의 절대 경계
==================================================

이 HARU 프로젝트에서 현재 내가 직접 개발할 범위는
Frontend까지다.

Backend는 별도의 Backend Developer가 이후 개발한다.

따라서 현재 8-Stage 개발 프로세스의 최종 목표는:

Frontend Complete
→ Frontend QA PASS
→ Backend Handoff Package 생성
→ STOP

이다.

Stage 8 완료 후 Backend 구현을 시작하지 않는다.

내가 별도로 명시적으로 요청하지 않는 한 다음을 구현하지 마라.

- Node.js / Express Production API
- Backend Route
- Backend Controller
- Backend Service
- Backend Repository
- Supabase Database Migration
- Supabase Server-side Logic
- Supabase RLS Policy
- Supabase Storage Server Logic
- STT Backend
- AI Backend
- Analysis Worker
- Background Job
- Cron Job
- Render Backend Deployment
- Production Database Schema 적용

Backend 관련해서는 실제 구현 대신 다음만 수행한다.

- API Contract 정의
- Request / Response Schema
- Error Code
- Authentication Requirement
- Data Requirement
- State Definition
- Storage Requirement
- Recording Upload Contract
- Async Analysis Contract
- Mock API
- Mock Data
- Backend Handoff Documentation

Frontend는 실제 Backend가 없어도
모든 주요 UX와 상태를 검증할 수 있도록 개발한다.

이를 위해 Mock API Layer를 사용한다.


==================================================
Frontend Architecture
==================================================

Frontend 기술 스택:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- CSS Variables
- TanStack Query
- Zod

Frontend 구조:

app
pages
features
entities
shared

API 호출은 Component에서 직접 하지 않는다.

다음 구조를 사용한다.

UI / Feature
↓
Query / Mutation
↓
API Client Interface
↓
Mock Adapter 또는 Production Adapter

예:

SessionPage
↓
useCreateSession()
↓
sessionApi.create()
↓
MockSessionApi

향후 Backend 연결 시:

MockSessionApi

를

HttpSessionApi

로 교체할 수 있어야 한다.

UI와 Feature Code를 다시 작성하지 않아야 한다.


==================================================
Frontend / Backend Boundary
==================================================

packages/contracts

를 Frontend와 향후 Backend 사이의
공식 Interface Contract로 사용한다.

여기에 다음을 정의한다.

- Request Schema
- Response Schema
- Enum
- Session State
- Error Code
- Validation Schema

Zod를 Source of Truth로 사용한다.

Frontend 개발 단계에서 Contract를 먼저 확정하고,
Mock API 역시 동일 Contract를 사용한다.

향후 Backend Developer는
이 Contract에 맞추어 API를 구현할 수 있어야 한다.


==================================================
Mock Architecture
==================================================

Backend 구현 전에도 전체 Frontend UX를 검증할 수 있도록
Mock Layer를 구축한다.

예:

apps/web/src/mocks/

auth/
children/
activities/
sessions/
recordings/
analysis/
reports/

Mock에서는 다음 상태를 재현할 수 있어야 한다.

SUCCESS
LOADING
EMPTY
ERROR
RETRY

HARU 특화 상태도 포함한다.

recording upload success
recording upload failure
analysis pending
analysis completed
analysis failed
report eligible
report not eligible

Mock Data가 UI Component 내부에 직접 하드코딩되지 않게 한다.


==================================================
수정된 8-Stage 개발 계획
==================================================

이 프로젝트의 8개 Stage는 모두
Frontend Development Stage다.


Stage 0
Frontend Architecture
+ Figma Mapping
+ Agent Setup
+ Design System
+ API Contract Planning


Stage 1
Frontend Foundation
+ Shared UI
+ Router
+ Layout
+ Design Tokens
+ Mock Infrastructure


Stage 2
Auth
+ Consent
+ Onboarding
+ Child Profile
Frontend


Stage 3
Home
+ Activity Card
+ Library
+ Book Selection
+ Recommendation
Frontend


Stage 4
Storytime Session
+ Recording Client
+ Pause / Resume
+ Prompt Drawer
+ Local Recording
+ Upload UX


Stage 5
Reflection
+ Async Analysis Status
+ Short Feedback
Frontend


Stage 6
Personalization
+ Profile Update
+ Recommendation Loop
Frontend


Stage 7
4-Week Report
+ History
+ Highlight Audio
+ PDF UX
Frontend


Stage 8
Frontend Final QA
+ Accessibility
+ Responsive
+ Regression
+ Backend Handoff Package

Stage 8 완료 후:

STOP.

Backend 개발을 시작하지 않는다.


==================================================
Agent 표준 프로세스
==================================================

전체 기능 또는 Stage 수행:

plan-agent
→ design-agent
→ development-agent
→ stage-qa-agent

단 모든 Agent는 현재 개발 Scope가
Frontend라는 사실을 우선한다.


plan-agent:

Frontend Plan을 작성한다.

Backend는 구현계획이 아니라
Integration Requirement와 Contract만 정의한다.


design-agent:

Figma와 Frontend Component 구조만 담당한다.


development-agent:

Frontend Production Code만 수정할 수 있다.

Backend Production Code를 작성하면 안 된다.


stage-qa-agent:

Frontend를 검증한다.

Backend 실제 구현이 없어 검증할 수 없는 부분은

BACKEND_INTEGRATION_PENDING

으로 판정한다.

그 항목 때문에 Frontend Stage 전체를
무조건 FAIL 처리하지 않는다.

단 Frontend Contract 또는 Mock 구현 자체가 잘못된 경우는
FAIL 처리한다.


==================================================
Stage 8 Backend Handoff
==================================================

Stage 8 완료 시 반드시 다음 Handoff 자료를 생성한다.

docs/BACKEND_HANDOFF.md
docs/API_CONTRACTS.md
docs/DATA_REQUIREMENTS.md
docs/AUTH_REQUIREMENTS.md
docs/RECORDING_UPLOAD_SPEC.md
docs/ANALYSIS_PIPELINE_REQUIREMENTS.md
docs/ERROR_CODES.md

그리고 packages/contracts를 최종 검증한다.

BACKEND_HANDOFF.md에는 최소한 다음을 포함한다.

- 필요한 API 목록
- Request
- Response
- Error
- Authentication
- Authorization Requirement
- 관련 Frontend Screen
- 관련 Feature
- 관련 PRD ID
- Frontend가 기대하는 상태 변화
- Mock 구현 위치

Backend Developer가
Frontend 코드를 다시 분석하지 않고도
구현을 시작할 수 있는 수준으로 작성한다.


==================================================
절대 중단 조건
==================================================

Stage 8의 Frontend Final QA와
Backend Handoff 문서 생성이 완료되면
반드시 작업을 중단한다.

다음을 자동으로 시작하지 않는다.

- Backend implementation
- Supabase migration
- Node API
- STT
- AI Analysis
- Render deployment

최종 보고 후 나의 승인을 기다린다.