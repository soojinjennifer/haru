HARU 프로젝트의 프론트엔드·백엔드 개발을 시작하려고 한다.

너는 HARU 프로젝트의 Senior Full-Stack Architect이자
프로젝트 Orchestrator 역할을 한다.

아직 Production 화면이나 실제 기능 코드를 구현하지 마라.

이번 작업의 목적은:

1. HARU 프로젝트 구조를 분석하고
2. 프로젝트 전용 Agent 체계를 만들고
3. 개발 표준 프로세스를 정의하고
4. PRD와 Figma를 기반으로 Architecture와 구현 계획을 확정하는 것

이다.

이번 단계는 Stage 0이다.

Stage 1 구현은 내가 명시적으로 승인하기 전까지 시작하지 마라.


==================================================
0. HARU 프로젝트 이해
==================================================

HARU는 미국 시장을 1차 시장으로 하는
Caregiver-facing Parenting Intelligence / Storytime Coach 서비스다.

주요 사용자는 3~9세 아이를 양육하는 부모 및 양육자다.

HARU는 아이에게 Screen Time을 추가하는 Child-facing App이 아니라,
부모가 아이와 약 15분 동안 함께 책을 읽는 시간을
더 좋은 대화와 성장 관찰의 시간으로 전환하는 서비스다.

HARU의 4대 내적 역량은 다음과 같다.

1. Emotional Regulation
2. Self-Directed Agency
3. Resilience / Cognitive Flexibility
4. Intrinsic Motivation

MVP에서:

- 양육자가 계정의 소유자다.
- 아이는 별도의 로그인 계정을 갖지 않는다.
- 아이는 앱 조작의 주 사용자가 아니다.
- 아동 음성 데이터와 성장 관련 데이터는 Privacy-sensitive Data로 취급한다.


==================================================
1. SOURCE OF TRUTH
==================================================

계획을 세우기 전에 반드시 다음을 읽는다.

1. HARU PRD v1.4
2. 현재 프로젝트의 HARU 관련 문서
3. 현재 Repository 구조와 설정
4. 기존 Prototype / Design Asset
5. 현재 존재하는 CLAUDE.md / rules / agents가 있다면 모두 확인

HARU Figma:

https://www.figma.com/design/YWWu3AFEJpRxvw0T5klq0k/HARU_MVP?node-id=16-2&t=dUO3kvPaKF8M3nk3-1

Figma MCP 또는 Figma Dev Mode 접근이 가능하면
반드시 실제 HARU_MVP 파일을 읽는다.

다음을 분석한다.

- 주요 Frame
- Screen Name
- Prototype Flow
- Component
- Component Variant
- Figma Variables
- Typography
- Color
- Spacing
- Radius
- Auto Layout
- Responsive Behavior
- 반복 UI Pattern
- 화면 간 Interaction

규칙:

PRD = Functional Source of Truth

Figma = Visual Source of Truth

PRD와 Figma에 없는 요구사항을 임의로 추가하지 않는다.

둘 사이에 불일치가 있으면
임의로 한쪽을 선택하지 말고
불일치 항목을 별도로 보고한다.


==================================================
2. 기본 기술 스택
==================================================

명확한 기술적 이유가 없는 한 다음 Stack을 사용한다.

Frontend:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- CSS Variables
- TanStack Query
- Zod
- Supabase JS Client

Backend:

- Node.js
- Express
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Zod
- Render

Repository는 Monorepo를 기본으로 한다.

권장 구조:

apps/
- web
- api

packages/
- ui
- design-tokens
- contracts
- shared-types
- validation
- config

supabase/
- migrations
- seed

docs/

.claude/

기존 WhyMath/PocketQ 프로젝트에서 안정적으로 사용했던

React + TypeScript + Vite
+ Tailwind CSS
+ CSS Variables

구조를 적극적으로 활용한다.

단, HARU 요구사항에 맞지 않는 부분이 있으면
무조건 복제하지 말고
문제점과 대안을 먼저 제안한다.


==================================================
3. HARU 프로젝트 전용 Agent 생성
==================================================

.claude/agents 아래에
다음 4개의 HARU 프로젝트 전용 Agent를 생성한다.

- plan-agent
- design-agent
- development-agent
- stage-qa-agent

각 Agent의 책임과 권한을 명확하게 분리한다.


--------------------------------------------------
3.1 plan-agent
--------------------------------------------------

역할:

HARU의 요구사항, Architecture, Data Model,
API Contract, 구현 순서와 Stage Scope를 분석하는
전문 Planning Agent.

주요 책임:

- PRD 분석
- 현재 코드 구조 분석
- 요구사항 ID Mapping
- Architecture 영향 분석
- Backend / Frontend dependency 분석
- Data Model 영향 분석
- API Contract 영향 분석
- 구현 범위 정의
- Acceptance Criteria 정의
- Risk 및 미결정 사항 식별
- Stage 구현 계획 작성

중요 규칙:

plan-agent는 Production Code를 수정하지 않는다.

plan-agent의 역할은:

inspect
→ analyze
→ plan
→ report

이다.

직접 구현하지 않는다.


--------------------------------------------------
3.2 design-agent
--------------------------------------------------

역할:

HARU Figma와 Design System을 분석하고
개발 가능한 UI 구조로 변환하는 Design Engineering Agent.

주요 책임:

- Figma Frame 분석
- Figma Screen → Route Mapping
- Design Token 추출
- Component 구조 분석
- Component Variant 분석
- Shared UI 후보 분석
- Domain Component 후보 분석
- Responsive Rule 분석
- Interaction 분석
- Figma와 구현 간 Visual Gap 검토

다음 구조를 기준으로 판단한다.

Figma Variables / Styles
→ CSS Variables
→ Tailwind Semantic Tokens
→ Shared UI
→ Domain Components
→ Features
→ Pages

중요 규칙:

design-agent는 Production UI Code를 직접 구현하지 않는다.

Design Agent는:

inspect
→ map
→ classify
→ specify

까지만 담당한다.

Figma 디자인을 임의로 변경하지 않는다.

변경이 필요하면 먼저 제안하고 승인을 기다린다.


--------------------------------------------------
3.3 development-agent
--------------------------------------------------

역할:

승인된 계획과 Design Specification을
실제 코드로 구현하는 전문 Development Agent.

주요 책임:

- 승인된 Stage Scope 구현
- Frontend 구현
- Backend 구현
- Supabase Migration
- API Contract 구현
- Test 작성
- 기존 Component 재사용
- Type Safety 유지
- Error / Loading / Empty State 구현
- 필요한 Documentation 갱신

반드시 다음을 기준으로 구현한다.

1. 최신 PRD
2. 승인된 Plan
3. Figma
4. DESIGN_SYSTEM.md
5. FIGMA_SCREEN_MAP.md
6. COMPONENT_MAP.md
7. API_CONTRACTS.md
8. ARCHITECTURE.md

중요 규칙:

승인된 Scope 밖의 기능을
임의로 미리 구현하지 않는다.

다음 Stage 기능을
편의를 위해 선행 구현하지 않는다.

Architecture를 임의로 변경해야 하는 경우
구현 전에 이유를 보고한다.


--------------------------------------------------
3.4 stage-qa-agent
--------------------------------------------------

역할:

각 Stage 구현 완료 후
독립적으로 구현 결과를 검증하는 QA Agent.

중요:

stage-qa-agent는
Production Code를 수정하지 않는다.

QA Agent의 책임은:

inspect
→ execute
→ verify
→ report

이다.

수정은 development-agent가 담당한다.

검증 대상:

- PRD Requirement
- Acceptance Criteria
- Figma 일치 여부
- Architecture 준수
- API Contract
- Type Safety
- Regression
- Responsive
- Error State
- Privacy
- Security
- Recording 관련 기능
- Test 결과

판정은 Requirement별로 다음 중 하나를 사용한다.

PASS
PARTIAL
FAIL
NOT VERIFIED

PASS에는 반드시 근거가 있어야 한다.

Code가 존재한다는 사실만으로 PASS 처리하지 않는다.

FAIL 발생 시:

stage-qa-agent
→ 수정 항목 보고

development-agent
→ 수정

stage-qa-agent
→ 재검증

순서로 진행한다.


==================================================
4. HARU 표준 Agent Workflow
==================================================

HARU의 전체 기능 또는 Stage를 수행할 때
반드시 다음 Agent 순서를 표준 프로세스로 사용한다.

plan-agent
→ design-agent
→ development-agent
→ stage-qa-agent

즉:

PLAN
→ DESIGN
→ IMPLEMENT
→ VERIFY

의 순서를 유지한다.

전체 Stage 또는 기능 구현 요청에서는
이 순서를 생략하지 않는다.


--------------------------------------------------
4.1 전체 구현 요청
--------------------------------------------------

사용자가 예를 들어:

"Stage 3을 진행해줘."

또는

"Activity Card 기능을 구현해줘."

라고 요청한 경우:

1. plan-agent
2. design-agent
3. development-agent
4. stage-qa-agent

순서로 수행한다.

QA FAIL이면:

development-agent
→ stage-qa-agent

를 반복한다.


--------------------------------------------------
4.2 계획만 요청한 경우
--------------------------------------------------

사용자가:

"계획만 세워줘."

"구현하지 말고 분석해줘."

"다음 Stage Plan을 만들어줘."

라고 요청한 경우:

plan-agent만 호출한다.

Production Code를 변경하지 않는다.


--------------------------------------------------
4.3 디자인 분석만 요청한 경우
--------------------------------------------------

사용자가:

"이 Figma 화면을 분석해줘."

"컴포넌트 구조만 정리해줘."

"Design System만 검토해줘."

라고 요청한 경우:

design-agent만 호출한다.

코드를 구현하지 않는다.


--------------------------------------------------
4.4 구현만 요청한 경우
--------------------------------------------------

이미 Plan과 Design Specification이 승인된 상태에서:

"이 계획대로 구현해줘."

라고 명시적으로 요청한 경우:

development-agent를 사용한다.

구현 완료 후에는
stage-qa-agent를 이어서 수행한다.

단, 승인된 Plan이 없거나
Plan이 현재 PRD/Figma와 맞지 않는 경우에는
임의로 구현하지 말고
plan-agent 재검토가 필요하다고 보고한다.


--------------------------------------------------
4.5 QA만 요청한 경우
--------------------------------------------------

사용자가:

"Stage QA 실행해줘."

"지금 구현한 부분 검증해줘."

라고 요청한 경우:

stage-qa-agent만 호출한다.

QA Agent는 Product Code를 수정하지 않는다.


==================================================
5. Agent Orchestration 규칙을 프로젝트에 기록
==================================================

Agent Workflow를 대화 안에서만 기억하지 말고
프로젝트 규칙으로 저장한다.

다음을 생성 또는 갱신한다.

CLAUDE.md

.claude/rules/architecture.md
.claude/rules/frontend.md
.claude/rules/backend.md
.claude/rules/workflow.md
.claude/rules/qa.md

최소한 workflow.md에는 다음 원칙을 명시한다.

전체 구현:

plan-agent
→ design-agent
→ development-agent
→ stage-qa-agent

계획만:

plan-agent

디자인 검토만:

design-agent

구현:

development-agent
→ stage-qa-agent

QA만:

stage-qa-agent

그리고 다음 원칙도 기록한다.

- Plan Agent는 코드 수정 금지
- Design Agent는 Production Code 수정 금지
- QA Agent는 Product Code 수정 금지
- 수정 책임은 Development Agent
- Stage QA PASS 전 다음 Stage 진입 금지
- 최신 PRD와 Figma를 이전 Agent Memory보다 우선
- 승인된 Scope 밖의 구현 금지


==================================================
6. Architecture 원칙
==================================================

Pragmatic Clean Architecture를 사용한다.

목표:

- 관심사 분리
- 높은 Component 재사용성
- 명확한 Domain Boundary
- Type Safety
- 유지보수성
- Testability
- 확장성

단, MVP이므로
지나친 Enterprise Architecture는 피한다.

Frontend:

app
pages
features
entities
shared

Page는 가능한 한
Composition 역할만 담당한다.

다음 로직을 Page에 직접 넣지 않는다.

- Supabase Query
- AI API 호출
- Recording 처리
- 복잡한 Business Logic
- 복잡한 State Transition


Backend:

route
→ controller
→ service
→ repository
→ infrastructure


==================================================
7. Design System 원칙
==================================================

Figma를 Visual Source of Truth로 사용한다.

구조:

Figma Variables / Styles
→ CSS Variables
→ Tailwind Semantic Tokens
→ Shared UI
→ Domain Components
→ Features
→ Pages

화면 구현 전에 반드시 다음을 확인한다.

- Color
- Typography
- Spacing
- Radius
- Component
- Variant
- State
- Responsive Rule

화면마다 임의의 HEX,
Spacing,
Radius를 추가하지 않는다.

기존 Component로 표현 가능한 UI를
Page 내부에서 다시 구현하지 않는다.


==================================================
8. Shared API Contract
==================================================

Frontend와 Backend에서
Request / Response Type을 각각 중복 작성하지 않는다.

packages/contracts

를 공통 Source of Truth로 사용한다.

Zod를 이용하여:

- Request Schema
- Response Schema
- Enum
- Session State
- Validation Rule
- Error Code

를 공유한다.


==================================================
9. HARU Session State
==================================================

PRD의 Session Lifecycle을
명시적인 State Model로 구현한다.

ready
→ recording
⇄ paused
→ completed
→ analyzing
→ analyzed

실패:

analyzing
→ failed
→ retry

Frontend와 Backend는
같은 상태 정의를 사용한다.

packages/contracts에서 공유한다.


==================================================
10. Recording Architecture
==================================================

Recording은 HARU의 핵심 Domain이다.

단순한 React Hook 정도로 처리하지 않는다.

요구사항:

- 1초 이내 녹음 시작 목표
- Pause
- Resume
- 최대 30분
- Offline Recording
- Network 복구 후 자동 Upload
- Upload Retry
- Crash Recovery
- Background / Screen Lock 대응

권장 구조:

RecordingController
→ Local Recording Persistence
→ Upload Queue
→ Supabase Storage
→ Node API
→ Analysis Job

특히 Stage 0에서
Web / PWA / iOS / Android별로
Background Recording 가능 범위를 조사한다.

React/Vite Web만으로
모든 요구사항을 충족할 수 있다고 가정하지 않는다.

필요하면:

- Capacitor
- Native Wrapper
- 별도 Mobile 구현

등을 비교 제안한다.

그러나 승인 없이
Stack을 변경하지 않는다.


==================================================
11. Privacy / Security
==================================================

HARU는 아동 음성 데이터를 처리한다.

Privacy는 Architecture Requirement다.

반드시 고려한다.

- Caregiver-owned Account
- Child 1명 Profile
- Explicit Consent
- Consent History
- 최소 데이터 수집
- Supabase RLS
- Encryption
- 90-Day Raw Audio Retention
- Session별 Audio 삭제
- 전체 데이터 삭제
- Audit Log

다음을 분리한다.

recordings
transcripts
session_metrics
observations
capability_signals
reports

Raw Audio와 Derived Data는
같은 데이터로 취급하지 않는다.

Frontend에는 절대 다음을 노출하지 않는다.

- Supabase Service Role Key
- AI API Key
- STT Secret
- Privileged Credentials


==================================================
12. AI / STT Architecture
==================================================

AI SDK를 여러 Service에서 직접 호출하지 않는다.

AIProvider Interface를 사용한다.

예:

generatePersona()
generateShortFeedback()
generateRecommendation()
generateReportNarrative()

구현 예:

OpenAIProvider
ClaudeProvider
MockAIProvider

STT도 Adapter를 사용한다.

SpeechToTextProvider

분석 구조:

Audio
→ STT
→ PII Redaction
→ Metrics Extraction
→ Capability Signal Analysis
→ Safety Validation
→ Structured Result
→ Feedback / Report

어린이 STT 정확도가 낮을 수 있으므로
완벽한 Transcript 하나에만 의존하지 않는다.

다음 Signal을 별도로 관리한다.

- Speaking Amount
- Turn-taking
- Emotion Vocabulary
- Recurring Topics
- Parent Reflection


==================================================
13. 8-Stage 개발 계획
==================================================

아래 구조를 HARU의 기본 개발 Stage로 유지한다.

Stage 0
Architecture + Figma Mapping + Design System

Stage 1
Project Foundation + Shared UI

Stage 2
Auth + Consent + Onboarding + Child Profile

Stage 3
Home + Activity Card + Library + Recommendation

Stage 4
Storytime Session + Recording + Storage

Stage 5
Reflection + Async Analysis Pipeline

Stage 6
Personalization + Profile Update + Recommendation Loop

Stage 7
4-Week Report + PDF + History

Stage 8
Privacy + Accessibility + Responsive + Regression + Deployment

각 Stage는 완료 후
stage-qa-agent PASS를 받아야 한다.

PASS 전에는
다음 Stage로 진행하지 않는다.


==================================================
14. 이번 Stage 0에서 수행할 실제 작업
==================================================

이번 첫 실행에서는
Production 기능을 구현하지 않는다.

먼저 다음 작업만 수행한다.

1. HARU PRD v1.4를 분석한다.

2. Figma HARU_MVP를 분석한다.

3. 현재 Repository 및 Project 설정을 점검한다.

4. .claude/agents에 다음 Agent를 생성한다.

   - plan-agent
   - design-agent
   - development-agent
   - stage-qa-agent

5. CLAUDE.md와 .claude/rules에
   Architecture 및 Agent Workflow 규칙을 작성한다.

6. 먼저 plan-agent를 사용하여
   HARU Architecture와 8-Stage Implementation Plan을 분석한다.

7. 그 다음 design-agent를 사용하여
   Figma Screen / Design System / Component 구조를 분석한다.

8. 아래 문서를 생성한다.

docs/ARCHITECTURE.md

docs/FIGMA_SCREEN_MAP.md

docs/COMPONENT_MAP.md

docs/DESIGN_SYSTEM.md

docs/DESIGN_TOKEN_MAP.md

docs/DATA_MODEL.md

docs/API_CONTRACTS.md

docs/FRONTEND_IMPLEMENTATION_PLAN.md

PLANNING.md


==================================================
15. 문서별 요구사항
==================================================

ARCHITECTURE.md

- Monorepo Structure
- Frontend Architecture
- Backend Architecture
- Dependency Boundary
- State Management
- Server State
- Authentication
- Supabase Responsibility
- Node API Responsibility
- Recording Architecture
- Async Analysis
- AI / STT Provider
- Privacy
- Deployment


FIGMA_SCREEN_MAP.md

다음을 연결한다.

Figma Frame
→ Route
→ Page
→ Feature
→ Reusable Component
→ API/Data
→ PRD Requirement ID


COMPONENT_MAP.md

다음으로 분류한다.

1. Shared UI
2. Domain Component
3. Feature Component
4. Page-only Component

반복되는 Figma Pattern 중
통합 가능한 Component 후보를 표시한다.


DESIGN_SYSTEM.md

- Color
- Typography
- Spacing
- Radius
- Shadow
- State
- Responsive Rule


DESIGN_TOKEN_MAP.md

다음을 매핑한다.

Figma Variable
→ CSS Variable
→ Tailwind Semantic Token


DATA_MODEL.md

- Supabase Tables
- Relationships
- Ownership
- RLS
- Consent
- Recording / Transcript 분리
- Analysis Job
- Report Snapshot
- Retention
- Deletion


API_CONTRACTS.md

주요 Frontend ↔ Backend Contract를 정의한다.


FRONTEND_IMPLEMENTATION_PLAN.md

Figma 화면을 실제 Frontend 구현 순서로 정리한다.


PLANNING.md

PRD P0 / P1 Requirement를
8개 Stage에 Mapping한다.


==================================================
16. Stage 0에서 반드시 판단할 기술 이슈
==================================================

아래 항목은 각각:

CONFIRMED
RECOMMENDED
NEEDS DECISION

중 하나로 표시한다.

1. Web-first + Mobile Wrapper인가
   별도 Native Mobile인가

2. Background Recording
   Web/PWA/iOS/Android 가능 범위

3. Offline Recording Persistence

4. STT Provider

5. AI Provider

6. Push Notification Provider

7. PDF 생성 위치

8. Raw Audio 90일 자동 삭제 방식

9. Apple / Google Auth

10. Trial → Account 데이터 전환

11. Figma Responsive Breakpoint

12. Deployment Topology


==================================================
17. 최종 보고
==================================================

Stage 0 완료 후 다음 순서로 보고한다.

1. 분석한 PRD / Figma 범위
2. 생성한 Agent 4개
3. Agent별 역할
4. 적용한 표준 Workflow
5. 제안 Architecture
6. 확정된 8-Stage 계획
7. 생성/수정한 문서
8. 기술적 미결정 사항
9. PRD와 Figma 불일치
10. Stage 1 시작 전 승인이 필요한 사항

그리고 반드시 멈춘다.

Stage 1 구현을 시작하지 않는다.

내가 명시적으로 승인하기 전까지
Production Code를 작성하지 마라.