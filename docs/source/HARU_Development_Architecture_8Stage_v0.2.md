# HARU 개발 구조 검증 및 8-Stage 개발 계획 v0.2

작성 기준:
- HARU PRD v1.4
- Figma: HARU_MVP
  - https://www.figma.com/design/YWWu3AFEJpRxvw0T5klq0k/HARU_MVP?node-id=16-2&t=dUO3kvPaKF8M3nk3-1
- 기존 WhyMath/PocketQ에서 검증된 개발 방식
  - React + TypeScript + Vite
  - Tailwind CSS + CSS Variables
  - Supabase
  - Node.js/Express
  - Render
  - Stage 단위 개발 + QA

> 참고: 현재 환경에서는 Figma Design 원본 링크의 내부 레이어/프레임을 직접 읽을 수 없었다. 따라서 아래 구조 검증은 PRD v1.4의 화면 맵·화면별 상세 명세·기능 요구사항을 우선 기준으로 정리했다. 실제 구현 시작 시 Claude Code에서 Figma MCP/Dev Mode를 연결해 HARU_MVP 파일의 프레임, 컴포넌트, Variables, Auto Layout, Breakpoint를 먼저 읽고 `FIGMA_SCREEN_MAP.md`를 확정해야 한다.

---

# 1. 결론

HARU는 WhyMath에서 사용했던 기술 스택을 거의 그대로 유지하는 것이 적절하다.

## Frontend
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- CSS Variables
- TanStack Query
- Zod
- Supabase JS Client

## Backend
- Node.js
- Express
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Zod
- Render
- AI Provider Adapter

## Repository
Monorepo 권장.

```text
haru/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── design-tokens/
│   ├── contracts/
│   ├── shared-types/
│   ├── validation/
│   └── config/
├── supabase/
│   ├── migrations/
│   └── seed/
├── docs/
└── .claude/
```

HARU에서는 특히 아래 5개를 WhyMath보다 더 강하게 구조화해야 한다.

1. Recording
2. Consent
3. Child Privacy / Data Retention
4. Async Analysis Pipeline
5. Report Generation

---

# 2. PRD를 기준으로 본 HARU의 실제 핵심 제품 구조

PRD v1.4의 핵심 루프는 다음과 같다.

```text
회원가입
→ 온보딩 설문
→ 아이 프로필·페르소나
→ 발전 역량 제시
→ Today's Activity Card
→ Storytime Session
→ Session Feedback
→ 4주 Growth Report
→ 다시 Activity Card
```

실제 매일 반복되는 핵심 Product Loop:

```text
Activity Card
    ↓
Book + Prompt 선택
    ↓
Context 선택
    ↓
Storytime Session
    ↓
Recording
    ↓
Reflection
    ↓
Async Analysis
    ↓
Short Growth Feedback
    ↓
다음 Activity Card
```

4주 누적 후:

```text
Session Data
+ Transcript
+ Parent Feedback
+ Capability Signals
        ↓
4-Week Report
        ↓
Profile / Persona Update
        ↓
Next Recommendation
```

따라서 HARU 개발 구조는 단순 화면 단위보다 이 Product Loop를 중심으로 설계하는 것이 맞다.

---

# 3. Frontend Architecture

```text
apps/web/src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── App.tsx
├── pages/
│   ├── auth/
│   ├── onboarding/
│   ├── profile/
│   ├── home/
│   ├── library/
│   ├── session/
│   ├── reflection/
│   ├── report/
│   └── settings/
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── child-profile/
│   ├── capability-profile/
│   ├── persona/
│   ├── activity-card/
│   ├── book-selection/
│   ├── reading-context/
│   ├── storytime-session/
│   ├── recording/
│   ├── prompt-viewer/
│   ├── reflection/
│   ├── short-feedback/
│   ├── growth-report/
│   └── data-management/
├── entities/
│   ├── caregiver/
│   ├── child/
│   ├── capability/
│   ├── persona/
│   ├── book/
│   ├── prompt/
│   ├── activity/
│   ├── session/
│   ├── recording/
│   └── report/
└── shared/
    ├── ui/
    ├── hooks/
    ├── api/
    ├── lib/
    ├── assets/
    ├── config/
    └── styles/
```

## Frontend 핵심 원칙

Page는 조립만 한다.

```tsx
function SessionPage() {
  return (
    <SessionLayout>
      <SessionCharacter />
      <CurrentBookCard />
      <RecordingController />
      <PromptDrawer />
    </SessionLayout>
  );
}
```

Page에 직접 넣지 않는다.
- Supabase Query
- AI 호출
- Recording 처리
- 비즈니스 규칙
- 복잡한 상태 전이
- 분석 로직

Server State는 TanStack Query, UI State는 component state 또는 필요한 경우 lightweight store를 사용한다.

---

# 4. Component Architecture

## 4.1 Shared UI

```text
Button
IconButton
Card
Modal
Dialog
Sheet
Badge
Chip
Avatar
Progress
Tabs
Input
Textarea
Select
Radio
Checkbox
Slider
Toast
Tooltip
BottomNavigation
TopNavigation
Carousel
```

## 4.2 HARU Domain Components

```text
ChildProfileCard
CapabilityDiamond
CapabilityBadge
PersonaCard
ActivityCard
BookCard
PromptCard
ContextCard
SessionBookCard
CounselorBubble
RecordingStatusCard
AttendanceSticker
ReflectionCard
GrowthInsightCard
ReportSummaryCard
HighlightAudioCard
```

## 4.3 Feature Components

```text
OnboardingWizard
ActivityCardDeck
BookSelector
ContextSelector
RecordingController
PromptDrawer
SessionStateController
ReflectionForm
ReportNavigator
AudioDataManager
```

컴포넌트 재사용 기준은 “모양이 비슷한가”가 아니라 “동일한 역할과 API를 갖는가”로 판단한다.

---

# 5. Design System 구조

Figma가 최종 Visual Source of Truth다.

```text
Figma Variables / Styles
        ↓
CSS Variables
        ↓
Tailwind semantic tokens
        ↓
Shared UI
        ↓
Domain Components
        ↓
Pages
```

금지:
- 화면마다 임의 HEX 사용
- 화면마다 임의 spacing 사용
- 동일 버튼의 별도 구현
- Figma와 다른 임의 스타일 변경

실제 개발 전 Claude가 Figma MCP를 통해 다음을 추출해야 한다.
- Frame 목록
- Route 후보
- Component / Variant
- Figma Variables
- Typography
- Color
- Radius
- Spacing
- Auto Layout
- Responsive behavior
- Prototype interaction

---

# 6. Backend Architecture

Node.js + Express + TypeScript 기반 Pragmatic Clean Architecture를 권장한다.

```text
apps/api/src/
├── app.ts
├── server.ts
├── config/
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── request.middleware.ts
├── modules/
│   ├── auth/
│   ├── caregivers/
│   ├── children/
│   ├── capabilities/
│   ├── personas/
│   ├── books/
│   ├── prompts/
│   ├── activities/
│   ├── sessions/
│   ├── recordings/
│   ├── reflections/
│   ├── analysis/
│   ├── recommendations/
│   ├── reports/
│   ├── notifications/
│   └── ai/
└── infrastructure/
    ├── supabase/
    ├── storage/
    ├── ai/
    ├── stt/
    ├── pdf/
    └── logging/
```

각 module:

```text
session/
├── session.routes.ts
├── session.controller.ts
├── session.service.ts
├── session.repository.ts
├── session.schema.ts
└── session.types.ts
```

Dependency 방향:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Infrastructure
```

MVP에서는 Domain Entity class, UseCase class 등을 지나치게 세분화하지 않는다.

---

# 7. Shared Contract 구조

Frontend와 Backend API type을 따로 만들지 않는다.

`packages/contracts`를 API contract의 Source of Truth로 둔다.

Zod 예:

```ts
export const CreateSessionRequestSchema = z.object({
  childId: z.string().uuid(),
  bookId: z.string().uuid().nullable(),
  context: ReadingContextSchema,
});

export type CreateSessionRequest =
  z.infer<typeof CreateSessionRequestSchema>;
```

공유 대상:
- Request
- Response
- Enum
- Session State
- Validation
- Error Code

---

# 8. Supabase Data Model

```text
auth.users
   │
   ▼
caregiver_profiles
   │
   ▼
children
   │
   ├── onboarding_responses
   ├── capability_snapshots
   ├── personas
   ├── child_books
   ├── activity_cards
   │       └── activity_card_options
   └── storytime_sessions
           ├── session_prompts
           ├── recordings
           ├── transcripts
           ├── session_reflections
           ├── session_metrics
           ├── observations
           ├── highlight_clips
           └── analysis_jobs

reports
report_snapshots
recommendations
consent_events
ai_generation_logs
audit_logs
```

반드시 별도로 관리할 데이터:

### consent_events
```text
id
caregiver_id
child_id
consent_type
consent_version
granted
granted_at
revoked_at
```

### recordings
```text
storage_path
duration
status
expires_at
deleted_at
```

### transcripts
```text
recording_id
transcript
redaction_status
created_at
```

### analysis_jobs
```text
session_id
status
attempts
started_at
completed_at
error_code
```

### ai_generation_logs
```text
provider
model
operation
input_tokens
output_tokens
latency_ms
estimated_cost
```

---

# 9. Session State Machine

PRD 상태를 그대로 공통 Enum/State Machine으로 관리한다.

```text
ready
 ↓
recording
 ↔
paused
 ↓
completed
 ↓
analyzing
 ↓
analyzed
```

실패:

```text
analyzing
 ↓
failed
 ↓
retry
```

Frontend와 Backend가 같은 상태 정의를 `packages/contracts`에서 공유한다.

---

# 10. Recording / Offline Architecture

HARU에서는 Recording이 핵심 기술 리스크다.

PRD 요구:
- 시작 지연 1초 이내
- Pause / Resume
- 최대 30분
- Background에서도 유지
- Offline Recording
- 네트워크 복구 후 자동 업로드
- Crash 시 로컬 임시 파일 복구

따라서 Recording은 독립 Feature로 설계한다.

```text
RecordingController
        ↓
Local Recording Buffer
        ↓
Upload Queue
        ↓
Supabase Storage
        ↓
Node API
        ↓
Analysis Job
```

웹 브라우저와 iOS/Android native 환경은 background recording 제약이 다르므로 Stage 4에서 플랫폼별 검증이 필요하다.

---

# 11. AI / STT Architecture

직접 provider SDK를 Service 여러 곳에서 호출하지 않는다.

```ts
interface AIProvider {
  generatePersona(...)
  generateShortFeedback(...)
  generateReportNarrative(...)
  generateRecommendation(...)
}
```

구현:

```text
OpenAIProvider
ClaudeProvider
MockAIProvider
```

STT도 동일하다.

```ts
interface SpeechToTextProvider {
  transcribe(...)
}
```

분석 pipeline:

```text
Audio
 ↓
STT
 ↓
PII Redaction
 ↓
Metrics Extraction
 ↓
Capability Signal Analysis
 ↓
Safety Filter
 ↓
Short Feedback / Report Data
```

3~9세 아동 STT 정확도 위험을 고려해 완벽한 transcript 하나에 의존하지 않고 발화량, turn-taking, 감정 어휘, 반복 주제, 부모 Reflection 등을 분리한다.

---

# 12. Privacy / Security Architecture

미국 시장 1차이므로 Child Privacy는 Architecture Requirement다.

```text
Caregiver Account
 ↓
Single Child Profile (MVP)
 ↓
Explicit Consent
 ↓
Recording
 ↓
Encrypted Storage
 ↓
90-day Raw Audio Retention
 ↓
Auto Delete
```

PRD 기준:
- COPPA 우선
- Child 데이터 최소 수집
- 광고 목적 제3자 사용 금지
- 원본 녹음 90일 기본 보관 후 자동 파기
- 전사/지표는 유지 가능
- 사용자 요청 시 즉시 삭제
- 세션별 녹음 삭제
- 전체 데이터 삭제
- Audit Log 필요

RLS는 모든 family-owned data에 적용한다.
Service Role Key와 AI Key는 Frontend에 노출하지 않는다.

---

# 13. 8-Stage 개발 계획 검증

기존 8개 Stage 구조는 유지하는 것이 적절하다. PRD v1.4 기준으로 각 Stage를 아래처럼 보강한다.

## Stage 0 — Architecture + Figma Mapping + Design System

### 작업
- PRD v1.4 분석
- Figma MCP 연결
- Frame inventory
- Route map
- Figma Screen Map
- Component Map
- Design Token extraction
- Backend Domain Map
- Data Model
- API Contract 초안
- Session State 정의
- Privacy boundary 정의
- PLANNING.md 작성

### 산출물
```text
docs/ARCHITECTURE.md
docs/FIGMA_SCREEN_MAP.md
docs/COMPONENT_MAP.md
docs/DESIGN_SYSTEM.md
docs/DATA_MODEL.md
docs/API_CONTRACTS.md
PLANNING.md
```

### 완료 조건
- 모든 Figma 주요 화면이 Route/Feature에 매핑
- 중복 컴포넌트 후보 정리
- P0 기능이 Stage에 매핑
- 구현 전 미결정 사항 목록화

---

## Stage 1 — Project Foundation + Shared UI

Frontend:
- Monorepo
- React + TS + Vite
- Router / Providers / Layout
- Tailwind + CSS Variables
- Shared UI
- Bottom / Top Navigation
- Error Boundary
- Loading / Empty / Error states

Backend:
- Express scaffold
- Environment config
- Error format
- Health endpoint
- Supabase client
- shared contracts

완료 조건:
- Figma Design Token ↔ 코드 Token 매핑
- 주요 공통 UI Variant 구현
- build/typecheck/lint PASS

---

## Stage 2 — Auth + Consent + Onboarding + Child Profile

PRD 중심 기능:
- FR-01 ~ FR-06
- FR-24 일부

구현:
- Email / Google / Apple Auth
- 보호자 동의
- Onboarding Wizard
- 중도 저장 / 재진입
- Child Profile
- 4대 역량 초기 점수
- Persona
- Suggested Growth Capability

완료 조건:
가입부터 첫 Profile 결과까지 end-to-end 통과.

---

## Stage 3 — Home + Activity Card + Library + Recommendation

PRD 중심 기능:
- FR-07
- FR-08
- FR-20
- FR-22
- FR-23

구현:
- Today Activity Card 3장
- Swipe Deck
- Book Recommendation
- Book Selection
- Prompt 2~3개
- Context Selection
- Streak
- Weekly Session count
- Library
- User-entered book
- Cold Start recommendation rule

Cold Start 입력:
```text
Profile
+ Suggested Capability
+ Age
+ Topic Preference
+ Owned Books
```

완료 조건:
사용자가 오늘의 책과 Prompt를 선택하고 Session 진입 가능.

---

## Stage 4 — Storytime Session + Recording + Consent Enforcement + Storage

PRD 중심 기능:
- FR-09
- FR-10
- FR-11
- FR-19
- FR-21 일부

구현:
- ready / recording / paused / completed
- Character greeting
- Listening animation
- Recording
- Pause / Resume
- Done Reading
- Prompt Drawer
- 30-minute auto stop
- Attendance Sticker
- local temporary recording
- upload retry
- Supabase Storage

핵심 QA:
- Mic permission denied
- network loss
- Pause/Resume
- 30min termination
- App/background behavior
- failed upload recovery

완료 조건:
실제 Storytime 1회를 안정적으로 완료하고 녹음을 보존할 수 있음.

---

## Stage 5 — Reflection + Async Analysis Pipeline

PRD 중심 기능:
- FR-12
- FR-13
- FR-14
- FR-18

구현:
- Session Reflection
- Rating
- Child reaction check
- Difficulty
- Topic
- Parent note
- STT Pipeline
- Analysis Job
- retry
- PII masking
- session metrics
- highlight audio clip
- short growth feedback

완료 조건:
Session 완료 → Reflection → async 분석 → 짧은 결과까지 end-to-end 동작.

---

## Stage 6 — Personalization + Profile Update + Recommendation Loop

PRD 중심 기능:
- FR-15
- Warm Recommendation Logic

구현:
```text
초기 설문
+
Session Metrics
+
Parent Reflection
+
Topic Response
+
Capability Signals
```
을 다음 Activity Card에 반영한다.

Persona / capability 변화는 snapshot/history 기반으로 관리한다.

완료 조건:
이전 Session 데이터가 실제 다음 추천에 반영됨.

---

## Stage 7 — 4-Week Report + PDF + History

PRD 중심 기능:
- FR-16
- FR-17

구현:
- Report eligibility
- 4-week aggregation
- Capability comparison
- Persona history
- dialogue metrics
- parent feedback summary
- highlight audio
- report detail
- PDF generation
- report archive

게이팅:
- 누적 녹음 1시간 이상
- 녹음 세션 2~3회 이상

완료 조건:
조건 충족/미충족 양쪽 flow 모두 정상 동작.

---

## Stage 8 — Privacy + Accessibility + Responsive + Regression + Deploy

Privacy:
- RLS
- Recording deletion
- Full data deletion
- 90-day retention
- audit logging
- secrets verification

UX / Quality:
- WCAG AA
- touch targets
- responsive
- loading / failure / empty
- offline / reconnect

Deployment:
- Web
- Render API
- Supabase
- environment separation
- production logging
- monitoring

Final QA:
- 전체 PRD P0 mapping
- regression
- end-to-end critical path
- privacy critical path
- recording critical path
- report critical path

---

# 14. Stage 계획과 PRD 매핑

```text
Stage 0
Architecture / Figma / Contracts

Stage 1
Foundation

Stage 2
FR-01 ~ FR-06
Auth / Consent / Onboarding / Profile

Stage 3
FR-07 / 08 / 20 / 22 / 23
Activity / Library / Recommendation

Stage 4
FR-09 / 10 / 11 / 19 / 21
Session / Recording

Stage 5
FR-12 / 13 / 14 / 18
Reflection / STT / Analysis

Stage 6
FR-15
Personalization / Update Loop

Stage 7
FR-16 / 17
4-week Report

Stage 8
NFR + Privacy + Deploy + Final QA
```

현재 8-Stage 구성을 깨뜨릴 필요는 없다.
HARU는 화면 개수보다 데이터가 누적되면서 추천과 리포트로 되돌아오는 loop가 핵심이므로 위 순서가 자연스럽다.

---

# 15. 구현 전에 반드시 확인할 기술 미결정 사항

Stage 0에서 아래를 조사하고 개발 전 결론 또는 승인 요청을 해야 한다.

1. React 웹을 먼저 개발한 뒤 모바일 wrapper를 사용할지, 네이티브 앱 별도 개발인지
2. 웹/PWA 환경에서 Background recording 요구사항을 얼마나 만족할 수 있는지
3. iOS/Android에서 녹음 중 화면 잠금·background 지속을 어떤 방식으로 구현할지
4. Offline recording persistence 전략
5. STT provider
6. AI provider
7. Report PDF 생성 위치: Browser / Node server
8. Push notification provider
9. 90일 raw audio 자동 삭제 job
10. Apple/Google mobile social login 전략
11. Figma responsive breakpoint와 실제 코드 breakpoint
12. Trial → account conversion의 데이터 ownership 전환 방식

---

# 16. 개발 원칙

## 반드시 지킬 것
- PRD가 요구사항 Source of Truth
- Figma가 Visual Source of Truth
- Design Token 먼저
- Shared UI 먼저
- Feature 단위 구현
- API Contract 공유
- RLS 기본
- Recording / Transcript / Derived Insight 분리
- AI Provider Adapter
- Stage QA 통과 후 다음 단계
- P0 우선

## 피할 것
- Figma 화면별 개별 CSS 복제
- Page에 비즈니스 로직 삽입
- Frontend에서 AI API 직접 호출
- Frontend에 Service Role Key 저장
- DB Type과 API Type 수동 중복 작성
- Prompt/Persona 자유 생성 문구를 안전검증 없이 노출
- 한 Stage에서 다음 Stage 범위까지 미리 구현
- Clean Architecture를 위한 과도한 class/abstraction

---

# 17. 최종 아키텍처 한 줄

```text
Figma
→ Design Tokens
→ Shared UI
→ Domain Components
→ Features
→ Pages

PRD
→ Contracts
→ Services
→ Repositories
→ Supabase / AI / STT

Storytime
→ Recording
→ Reflection
→ Analysis
→ Profile Update
→ Recommendation
→ Report
→ Next Storytime
```

HARU의 가장 중요한 기술적 중심은 단순한 Book Reading UI가 아니라 이 데이터 순환 구조다.
