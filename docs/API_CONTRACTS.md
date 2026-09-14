# HARU API Contracts

Status: DRAFT — Stage 0 산출물, 사용자 승인 대기 (Rev 4: cross-document critic 수정 — 참조·라벨 정리, 업로드 계층 명칭, 동의 철회 제외, scenario key 추가, 2026-09-14)
Based on: PRD v1.4, `docs/ARCHITECTURE.md` (DRAFT 2026-09-14), `docs/DATA_MODEL.md` (DRAFT 2026-09-14), design-agent `docs/FIGMA_SCREEN_MAP.md` · `docs/COMPONENT_MAP.md` (DRAFT 2026-09-14) — Rev 2: Figma 대비 gap §6 추가
Author: plan-agent (2026-09-14)

> 이 문서는 Frontend ↔ Backend 계약의 **설계 스케치**다. 실제 정의는 Stage 1 이후 `packages/contracts` (Zod) 에서만 하며, 이 문서와 contracts가 달라지면 둘을 함께 갱신한다 (rules/architecture §5).
> **Frontend-only Scope (CONFIRMED, 사용자 지시 2026-09-14)**: 이 프로젝트는 Backend를 구현하지 않는다. 이 계약은 (1) Frontend API Client Interface, (2) `apps/web/src/mocks` 의 Mock Adapter, (3) 향후 Backend Developer의 구현이 **모두 따르는 공식 Interface** 다.
> - Frontend의 Http Adapter(`HttpSessionApi` 등)는 이 계약에 맞춘 **골격(skeleton)** 만 둘 수 있으며, 실제 Backend와의 연동 검증은 전 Stage에서 `BACKEND_INTEGRATION_PENDING` 이다.
> - 서버 측 동작(동의 강제, 소유권 확인, 상태 전이 판정, 업로드 검증, 분석, 리포트 생성)은 **Backend Handoff 요구사항**이다. Mock Adapter는 같은 응답·error code를 결정적으로 재현한다.
> - Stage 8에서 이 문서를 Handoff 문서로 최종화하고, error code 표는 `docs/ERROR_CODES.md`, 업로드 계약은 `docs/RECORDING_UPLOAD_SPEC.md`, 분석 계약은 `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md`, 인증은 `docs/AUTH_REQUIREMENTS.md` 로 분리한다.
> - 문서 소유 (rules/workflow.md §5): 설계·계획 변경 = plan-agent, 구현된 `packages/contracts` 와의 동기화 = development-agent. Handoff 6종은 plan-agent가 Stage 8 Plan 작성 시 초안 → development-agent 완성 → stage-qa-agent 검증.

---

## 1. Conventions

| 항목 | 규약 | 라벨 |
|---|---|---|
| Base path | `/v1` (예: `https://api.<domain>/v1`). Frontend는 `VITE_API_BASE_URL` | RECOMMENDED |
| Format | JSON, `camelCase` 필드, UTF-8 | RECOMMENDED |
| Auth | `Authorization: Bearer <access token>` — Frontend는 AuthGateway가 제공하는 토큰(Mock에서는 가짜 토큰)을 첨부만 한다. 토큰 발급자(Supabase Auth 권장)와 검증은 Backend Handoff 요구사항 (`AUTH_REQUIREMENTS.md`). 공개 endpoint는 `GET /v1/health`, `GET /v1/consent-documents/current` 만 | RECOMMENDED |
| Request ID | Client가 `X-Request-Id`(uuid) 전송 가능, 서버는 응답 헤더와 error envelope에 echo | RECOMMENDED (기술 요구사항 — 추적·지원용. rules에는 규정 없음; Handoff `ERROR_CODES.md`) |
| 시간 | ISO 8601 UTC 문자열. 클라이언트 발생 시각은 `occurredAt` 로 별도 전달 (오프라인 전이) | RECOMMENDED |
| ID | uuid 문자열 | RECOMMENDED |
| Pagination | Cursor: `?limit=20&cursor=<opaque>` → `{ items: T[], nextCursor: string \| null }`. limit 최대 50 | RECOMMENDED |
| Idempotency | `Idempotency-Key: <uuid>` **필수**: 세션 생성, 세션 전이, 녹음 업로드 init/complete, reflection 제출, 온보딩 submit, 증정 신청, 삭제 요청. 서버는 (caregiverId, key) 결과를 24h 보관, 동일 key + 동일 body → 최초 응답 재생, 다른 body → `IDEMPOTENCY_KEY_REUSED` | RECOMMENDED (기술 요구사항: NFR 오프라인 재전송) |
| 동의 강제 | 녹음 시작 전이, 업로드 init/complete, 분석 관련 endpoint는 서버에서 `child_voice_data` 동의 확인 = **Backend Handoff 요구사항**. Frontend: 동의 없으면 녹음 시작 UI 차단 + 동의 기록 전 아동 데이터 미전송. Mock: `consent-missing` 시나리오에서 `CONSENT_REQUIRED` 재현 | 요구 CONFIRMED (PRD FR-02, §7.1) / 강제 방식 RECOMMENDED (rules/backend.md §4, ARCHITECTURE §7.3) |
| 버전 | Breaking change 시 `/v2`. 필드 추가는 non-breaking — Frontend 응답 schema는 unknown key strip (Zod 기본 `strip`) | RECOMMENDED |

### 1.1 Error Envelope (RECOMMENDED 형식 — rules/backend.md §4 "공통 Error Envelope + contracts Error Code" 요구의 구체안; `requestId` 필드 포함은 RECOMMENDED)

```json
{ "error": { "code": "SESSION_INVALID_TRANSITION", "message": "Human-readable, no PII", "requestId": "…", "details": { "from": "completed", "to": "recording" } } }
```

`message` 는 개발자용. 사용자 노출 문구는 Frontend copy 모듈이 `code` 로 매핑한다.

### 1.2 Error Code Catalogue (RECOMMENDED)

| Code | HTTP | 의미 | PRD |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | contracts schema 검증 실패 (`details.issues`) | — |
| `AUTH_REQUIRED` | 401 | 토큰 없음 | FR-01 |
| `AUTH_TOKEN_EXPIRED` | 401 | 만료 → 클라이언트 1회 refresh | FR-01 |
| `FORBIDDEN` | 403 | 소유권 불일치 (존재 노출 방지를 위해 404로 대체 가능) | NFR 보안 |
| `CONSENT_REQUIRED` | 403 | 필수 동의 또는 `child_voice_data` 동의 없음 (`details.missing: ConsentType[]`) | FR-02 |
| `CONSENT_VERSION_OUTDATED` | 403 | 재동의 필요 | FR-02 |
| `TRIAL_ACCOUNT_RESTRICTED` | 403 | 익명 Trial 계정 제한 기능 (결정 #10 B안 채택 시) | FR-24 |
| `ONBOARDING_INCOMPLETE` | 409 | 온보딩 미완료 상태에서 홈/세션 요청 | FR-03 |
| `CHILD_NOT_FOUND` | 404 | | — |
| `CHILD_LIMIT_REACHED` | 409 | MVP 1명 초과 | §1.6 |
| `RESOURCE_NOT_FOUND` | 404 | 일반 | — |
| `SESSION_INVALID_TRANSITION` | 409 | 허용되지 않은 전이 (`details.from/to`) | §12.2 |
| `SESSION_ALREADY_ACTIVE` | 409 | 진행 중(ready/recording/paused) 세션 존재 (`details.sessionId`) | FR-09 |
| `SESSION_MAX_DURATION_EXCEEDED` | 422 | 30분 초과 녹음 길이 보고 | FR-09 |
| `RECORDING_NOT_ALLOWED_FOR_MODE` | 409 | conversation_only 세션에 업로드 시도 | §13 |
| `UPLOAD_TOKEN_EXPIRED` | 410 | 업로드 토큰 만료 → init 재호출 | NFR 오프라인 |
| `RECORDING_INCOMPLETE` | 422 | complete 시 part 누락·크기/해시 불일치 | FR-14 |
| `RECORDING_DELETED` | 410 | 삭제·만료된 녹음 접근 | FR-21, NFR |
| `ANALYSIS_NOT_AVAILABLE` | 404 | conversation_only 또는 분석 전 | FR-13 |
| `REFLECTION_ALREADY_SUBMITTED` | 409 | | FR-12 |
| `REPORT_NOT_ELIGIBLE` | 409 | 발행 기준 미충족 (`details.eligibility`) | FR-16 |
| `REPORT_NOT_READY` | 409 | 생성 중/지연 | FR-16, §13 |
| `PDF_NOT_READY` | 409 | PDF 생성 중 | FR-17 |
| `GIFT_REQUEST_DUPLICATE` | 409 | 같은 책 진행 중 신청 존재 | FR-22 |
| `DELETION_ALREADY_REQUESTED` | 409 | | FR-21 |
| `IDEMPOTENCY_KEY_REUSED` | 422 | 동일 key 다른 body | — |
| `RATE_LIMITED` | 429 | | 기술 요구사항 |
| `PROVIDER_UNAVAILABLE` | 503 | AI/STT/PDF 일시 장애 (사용자에게는 지연 안내) | FR-05, §13 |
| `INTERNAL_ERROR` | 500 | | — |

---

## 2. Shared Enums (`packages/contracts/src/enums`)

### 2.1 Capability — 명칭 결정 필요

| 출처 | ① | ② | ③ | ④ |
|---|---|---|---|---|
| PRD §4 (국문) | 감정 조절 능력 | 자기주도 역량 | 회복탄력성·인지 유연성 | 내적동기부여 |
| CLAUDE.md / 사용자 Stage 0 프롬프트 | Emotional Regulation | Self-Directed Agency | Resilience / Cognitive Flexibility | Intrinsic Motivation |
| Figma (design-agent 확인, M-13) | Emotion Regulation (배지 "Emotion Day", "Emotion words") | Self-Direction | Cognitive Flexibility (책장 캡션 "Resilience", "Cognitive words") | Intrinsic Motivation ("Motivation words") — 책장 캡션 **"Confidence"** 는 4대 역량에 없음 |
| Baseline Survey v1 | Emotion Regulation (ER) | Self-Directed Agency (AG) | Cognitive Flexibility (CF) | Intrinsic Meaning / Motivation (IM) |

- **코드 키 (RECOMMENDED)** — 사용자 노출 라벨과 분리된 불변 키:
  `emotion_regulation | self_directed_agency | cognitive_flexibility | intrinsic_motivation`
  (Baseline 약어 ER/AG/CF/IM 과 1:1, 라벨 변경이 데이터 migration을 유발하지 않음)
- **사용자 노출 라벨 (NEEDS DECISION)**: 예) "Emotion Regulation / Self-Direction / Cognitive Flexibility / Intrinsic Motivation"(Figma) vs "Resilience" 포함 여부. 라벨은 Frontend copy 모듈 한 곳에서 관리.

### 2.2 목록

| Enum | 값 | 근거 |
|---|---|---|
| `SessionStatus` | `ready, recording, paused, completed, analyzing, analyzed, failed, abandoned` | PRD §12.2 7개 값 **CONFIRMED** + `abandoned` **RECOMMENDED** (§13, ARCHITECTURE §10.2) |
| `SessionMode` | `recorded, conversation_only` | **RECOMMENDED** (§7.4, §13) |
| `CompletedReason` | `user_done, auto_timeout, recovered_after_crash` | **RECOMMENDED** (FR-09, NFR 안정성) |
| `AnalysisOutcome` | `full, excluded_low_quality, skipped_audio_deleted` (+ `skipped_consent_revoked` 는 OAQ-08에서 동의 철회 채택 시에만) | **RECOMMENDED** (§13; skipped 값 OAQ-17) |
| `UploadStatus` (server 응답) | `pending, uploaded, failed, deleted, expired` | **RECOMMENDED** (rules/architecture §6 별도 upload status). 클라이언트 UploadQueue 상태(`local_only…stalled_48h`)는 contracts 가 아니라 `features/recording` 내부 |
| `ReadingContext` | `now, bedtime, after_pickup, weekend_morning, in_the_car, custom_time` | §7.4, FR-08 ("유치원 하원 후" = after_pickup — 영문 라벨 design 확인) |
| `ConsentType` | `terms_of_service, privacy_policy, child_voice_data, marketing` (+ 결정 시 `third_party_disclosure`, `pilot_participation`) | §7.1, FR-02, 개정 COPPA |
| `AnalysisJobStatus` | `queued, running, succeeded, failed, cancelled` | FR-14 (Frontend 비노출, Backend/Worker 공유) |
| `ReportEligibility` | `eligible, insufficient_recorded_minutes, insufficient_recorded_sessions, insufficient_both, cycle_in_progress` | FR-16, §7.7 |
| `ReportStatus` | `in_progress, generating, published, deferred, delayed` | FR-16, §13 |
| `ActivityOptionKind` | `book, reread_book, conversation_only` | §7.4, §13 |
| `BookOwnership` | `owned, gifted, gift_pending, favorite_only` | FR-20/22/23 |
| `GiftRequestStatus` | `requested, approved, shipped, delivered, cancelled, rejected` | FR-22, §13 |
| `CaregiverRelationship` | `mother, father, grandparent, babysitter, tutor, therapist, other` | §3.1, §7.2 |
| `OnboardingStep` | `child_info, temperament, books, goals, capability_items` | §7.2 (OAQ-07 결과에 따라 변경) |
| `DeletionScope` | `session_recording, all_data` | FR-21, §7.8 |
| `DeletionRequestStatus` | `received, processing, completed, failed` | FR-21 |
| `NotificationKind` | `session_invite, short_feedback_ready, report_published, report_deferred_encourage, upload_failed_48h, report_delayed` | FR-08/13/16, §13 |

---

## 3. Representative Zod Sketches

### 3.1 SessionStatus + Transition Table

```ts
// packages/contracts/src/enums/session-status.ts
export const SessionStatusSchema = z.enum([
  'ready', 'recording', 'paused', 'completed', 'analyzing', 'analyzed', 'failed', 'abandoned',
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionModeSchema = z.enum(['recorded', 'conversation_only']);

// packages/contracts/src/rules/session-transitions.ts
type Actor = 'caregiver' | 'server' | 'worker';
export const SESSION_TRANSITIONS: ReadonlyArray<{
  from: SessionStatus; to: SessionStatus; actor: Actor; modes: ReadonlyArray<z.infer<typeof SessionModeSchema>>;
}> = [
  { from: 'ready',     to: 'recording', actor: 'caregiver', modes: ['recorded'] },
  { from: 'ready',     to: 'completed', actor: 'caregiver', modes: ['conversation_only'] },
  { from: 'ready',     to: 'abandoned', actor: 'caregiver', modes: ['recorded', 'conversation_only'] }, // client 10분 타이머
  { from: 'ready',     to: 'abandoned', actor: 'server',    modes: ['recorded', 'conversation_only'] }, // sweeper
  { from: 'recording', to: 'paused',    actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused',    to: 'recording', actor: 'caregiver', modes: ['recorded'] },
  { from: 'recording', to: 'completed', actor: 'caregiver', modes: ['recorded'] },
  { from: 'paused',    to: 'completed', actor: 'caregiver', modes: ['recorded'] },
  { from: 'completed', to: 'analyzing', actor: 'server',    modes: ['recorded'] },  // 업로드 확정 시
  { from: 'analyzing', to: 'analyzed',  actor: 'worker',    modes: ['recorded'] },
  { from: 'analyzing', to: 'failed',    actor: 'worker',    modes: ['recorded'] },
  { from: 'failed',    to: 'analyzing', actor: 'worker',    modes: ['recorded'] },  // 재시도 = 행위, 상태 아님
];

export const canTransition = (from: SessionStatus, to: SessionStatus, actor: Actor, mode: z.infer<typeof SessionModeSchema>) =>
  SESSION_TRANSITIONS.some(t => t.from === from && t.to === to && t.actor === actor && t.modes.includes(mode));

export const MAX_RECORDED_SECONDS = 30 * 60;   // FR-09 (pause 포함 여부 OAQ-09)
export const READY_ABANDON_SECONDS = 10 * 60;  // §13
```

### 3.2 CreateSessionRequest / Transition

```ts
// packages/contracts/src/sessions/create-session.ts
export const CreateSessionRequestSchema = z.object({
  childId: z.string().uuid(),
  mode: SessionModeSchema,
  activityCardOptionId: z.string().uuid().nullable(),
  bookId: z.string().uuid().nullable(),
  childBookId: z.string().uuid().nullable(),
  readingContext: ReadingContextSchema.nullable(),
  clientSessionKey: z.string().min(16).max(64),     // 오프라인 생성 멱등 키
  readyAt: z.string().datetime(),                    // client occurredAt
}).refine(v => v.mode === 'conversation_only' || v.bookId !== null || v.childBookId !== null, {
  message: 'recorded session requires a book', path: ['bookId'],
}); // 책 없는 녹음 세션 허용 여부는 PRD 불명확 → 결정 시 refine 조정

export const SessionSummarySchema = z.object({
  id: z.string().uuid(),
  status: SessionStatusSchema,
  mode: SessionModeSchema,
  book: BookSummarySchema.nullable(),
  readingContext: ReadingContextSchema.nullable(),
  readyAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  completedReason: CompletedReasonSchema.nullable(),
  recordedSeconds: z.number().int().min(0).max(MAX_RECORDED_SECONDS),
  analysisOutcome: AnalysisOutcomeSchema.nullable(),
  prompts: z.array(PromptSchema),                    // Prompt 모아보기 (FR-11)
  bubble: SessionBubbleCopySchema,                   // 검수 템플릿 결과 (FR-10)
});
export const CreateSessionResponseSchema = z.object({ session: SessionSummarySchema });

export const SessionTransitionRequestSchema = z.object({
  to: z.enum(['recording', 'paused', 'completed', 'abandoned']),  // client가 요청 가능한 목표 상태만
  occurredAt: z.string().datetime(),
  recordedSeconds: z.number().int().min(0).max(MAX_RECORDED_SECONDS).optional(),
  completedReason: CompletedReasonSchema.optional(),
}).refine(v => v.to !== 'completed' || v.completedReason !== undefined, { path: ['completedReason'] });
```

### 3.3 RecordingUploadInit / Complete

```ts
// packages/contracts/src/recordings/upload.ts
export const RecordingUploadInitRequestSchema = z.object({
  parts: z.array(z.object({
    partNo: z.number().int().min(1).max(20),
    mimeType: z.enum(['audio/webm', 'audio/mp4', 'audio/aac', 'audio/m4a']),   // 플랫폼별 (Stage 4 spike로 확정)
    bytes: z.number().int().positive().max(100 * 1024 * 1024),
  })).min(1),
  totalDurationSeconds: z.number().int().positive().max(MAX_RECORDED_SECONDS + 60), // 자동 종료 여유
});

export const RecordingUploadInitResponseSchema = z.object({
  recordingId: z.string().uuid(),
  uploadStatus: UploadStatusSchema,             // 'pending'
  transport: z.literal('tus'),                  // research §3 — Supabase resumable
  parts: z.array(z.object({
    partNo: z.number().int(),
    endpoint: z.string().url(),
    uploadToken: z.string(),                    // 서버 발급, 경로 고정, 짧은 만료
    objectKey: z.string(),                      // opaque — 이름/이메일 미포함
    expiresAt: z.string().datetime(),
  })),
});

export const RecordingUploadCompleteRequestSchema = z.object({
  parts: z.array(z.object({
    partNo: z.number().int().min(1),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    durationSeconds: z.number().positive(),
  })).min(1),
});

export const RecordingUploadCompleteResponseSchema = z.object({
  recordingId: z.string().uuid(),
  uploadStatus: z.literal('uploaded'),
  sessionStatus: SessionStatusSchema,           // 보통 'analyzing'
  expiresAt: z.string().datetime(),             // 원본 90일 만료 안내 (§7.8 보관 정책 안내)
});
// Errors: CONSENT_REQUIRED, RECORDING_NOT_ALLOWED_FOR_MODE, UPLOAD_TOKEN_EXPIRED, RECORDING_INCOMPLETE, SESSION_INVALID_TRANSITION
```

---

## 4. Endpoint Groups by Stage

표기: Request/Response는 contracts schema 이름(`…RequestSchema` / `…ResponseSchema` 접미사 생략). **IK** = Idempotency-Key 필수. **CG** = `child_voice_data` 동의 가드.

### Stage 1 — Foundation

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/health` | — | `Health` | — | 기술 요구사항 |

Stage 1에서 contracts에 확정할 것: `common/*`(ErrorEnvelope, ErrorCode, Pagination), 모든 §2 enum, `rules/session-transitions`, `rules/report-eligibility`, `rules/recording-limits`.

### Stage 2 — Auth · Consent · Onboarding · Child Profile

Auth 자체(가입·로그인·비밀번호 재설정·OAuth)는 HTTP API가 아니라 **`AuthGateway` interface** 로 다룬다 (ARCHITECTURE §7). Stage 2–8에서는 `MockAuthGateway` 만 구현하며, Supabase Auth Adapter는 Backend 연동 시점 또는 사용자 승인 후 추가한다 (Supabase JS Client 미사용 — rules/frontend §1).

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/me` | — | `Me` (caregiver, consentStatus{required[], missing[]}, onboardingStatus, child?, plan) | AUTH_REQUIRED | FR-01, FR-02, FR-03 |
| PATCH | `/v1/me` | `UpdateCaregiver` (displayName, relationship, timezone) | `Me` | VALIDATION_FAILED | §7.2 Step1, §7.8 |
| GET | `/v1/consent-documents/current` (public) | — | `CurrentConsentDocuments` | — | FR-02 |
| POST | `/v1/consents` (IK) | `RecordConsents` (items[{type, documentId, action: 'granted'}], source — `revoked` 값은 OAQ-08 결정 전 미정의) | `ConsentStatus` | CONSENT_VERSION_OUTDATED | FR-02, §7.1 |
| GET | `/v1/consents` | — | `ConsentHistory` | — | FR-02 |
| GET | `/v1/onboarding` | — | `OnboardingState` (instrument, steps, draftAnswers, currentStep) | CONSENT_REQUIRED | FR-03 |
| PUT | `/v1/onboarding/steps/:step` | `SaveOnboardingStep` (answers by step schema) | `OnboardingState` | CONSENT_REQUIRED, VALIDATION_FAILED | FR-03 중도 저장 |
| POST | `/v1/onboarding/submit` (IK) | `SubmitOnboarding` (전체 draft — Trial 로컬 draft 제출도 동일) | `ProfileResult` (child, snapshot, persona, suggestedCapability) | CONSENT_REQUIRED (필수 동의 기록 전 제출 — ARCHITECTURE §7.3.1 Guard 3, §7.4 옵션 A), ONBOARDING_INCOMPLETE, CHILD_LIMIT_REACHED, PROVIDER_UNAVAILABLE(→ fallback persona로 200) | FR-03, FR-04, FR-05, FR-06, FR-24 |
| GET | `/v1/books/search?q=` | — | `Paginated<BookSummary>` | — | §7.2 Step3 (좋아하는 책 검색) |
| GET | `/v1/children/:childId/profile` | — | `ChildProfile` (child, latestSnapshot, strengths[2], growingEdges[2], persona, growthCapability) | CHILD_NOT_FOUND | FR-04, FR-05, FR-06, §7.3 |
| PATCH | `/v1/children/:childId` | `UpdateChild` | `ChildProfile` | — | §7.8 |
| PUT | `/v1/children/:childId/growth-capability` | `SetGrowthCapability` (capability) | `ChildProfile` | — | FR-06, §7.3 |
| GET | `/v1/children/:childId/capability-snapshots` | cursor | `Paginated<CapabilitySnapshot>` | — | FR-15, §7.7 (Stage 6/7에서 사용) |
| GET | `/v1/children/:childId/personas` | cursor | `Paginated<Persona>` | — | FR-15, §7.7 |

### Stage 3 — Home · Activity Card · Library · Recommendation · Notifications

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/children/:childId/home` | — | `HomeSummary` (todayCard, streakDays, sessionsThisWeek, lastHighlightLine?, activeSession?) | ONBOARDING_INCOMPLETE | FR-07, §6.1, §7.4 보조 요소 |
| GET | `/v1/children/:childId/activity-cards/today` | — | `ActivityCard` (date, targetCapability, options[3]{kind, book, reason, coachingLine}) | ONBOARDING_INCOMPLETE | FR-07 (2초 내 로딩 NFR) |
| POST | `/v1/activity-cards/:cardId/selection` | `SelectActivityOption` (optionId, readingContext, customTime?) | `ActivityCardSelection` (option, promptSet{questions[2–3], coachingLine, followUps}) | RESOURCE_NOT_FOUND | FR-07 책 선택 후 Prompt, FR-08 |
| GET | `/v1/children/:childId/library` | `?filter=owned\|gifted\|history` cursor | `Paginated<LibraryBook>` | — | FR-20, FR-22 |
| POST | `/v1/children/:childId/library/books` (IK) | `AddOwnBook` (bookId \| title+author) | `LibraryBook` | VALIDATION_FAILED | FR-23, §8.1 |
| GET | `/v1/books/:bookId/prompts?childId=` | — | `BookPrompts` (promptSets for age band) | — | FR-20 "책별 Prompt 보기" |
| POST | `/v1/children/:childId/gift-requests` (IK) | `CreateGiftRequest` (bookId, shipping — OAQ) | `GiftRequest` | GIFT_REQUEST_DUPLICATE | FR-22, §13 |
| GET | `/v1/children/:childId/gift-requests` | — | `GiftRequest[]` | — | §13 배송 상태 서재 확인 |
| GET | `/v1/notification-preferences` | — | `NotificationPreferences` | — | FR-08, §7.8 |
| PUT | `/v1/notification-preferences` | `UpdateNotificationPreferences` | `NotificationPreferences` | — | FR-08, §7.8 |
| POST | `/v1/push-devices` | `RegisterPushDevice` (platform, token) | `PushDevice` | — | FR-08 |
| DELETE | `/v1/push-devices/:id` | — | 204 | — | FR-08 |

### Stage 4 — Storytime Session · Recording · Storage

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| POST | `/v1/sessions` (IK) | `CreateSession` (§3.2) | `CreateSession` | ONBOARDING_INCOMPLETE, SESSION_ALREADY_ACTIVE | FR-09, FR-10 (시작 버블) |
| GET | `/v1/sessions/:sessionId` | — | `SessionDetail` (summary + recording upload status + reflection? + sticker?) | RESOURCE_NOT_FOUND | FR-09 |
| POST | `/v1/sessions/:sessionId/transitions` (IK, CG when to=recording) | `SessionTransition` (§3.2) | `SessionTransitionResult` (session, completionBubble?, stickerAward?) | SESSION_INVALID_TRANSITION, CONSENT_REQUIRED, SESSION_MAX_DURATION_EXCEEDED | FR-09, FR-10 (종료 버블), FR-19, §13 |
| POST | `/v1/sessions/:sessionId/recordings` (IK, CG) | `RecordingUploadInit` (§3.3) | `RecordingUploadInit` | CONSENT_REQUIRED, RECORDING_NOT_ALLOWED_FOR_MODE, SESSION_INVALID_TRANSITION | FR-14, NFR 오프라인 |
| POST | `/v1/recordings/:recordingId/upload-tokens` (IK, CG) | `RefreshUploadTokens` (partNos) | `RecordingUploadInit` | RECORDING_DELETED | NFR 오프라인 (토큰 만료) |
| POST | `/v1/recordings/:recordingId/complete` (IK, CG) | `RecordingUploadComplete` (§3.3) | `RecordingUploadComplete` | RECORDING_INCOMPLETE, UPLOAD_TOKEN_EXPIRED | FR-14 |
| GET | `/v1/children/:childId/sessions` | cursor, `?status=` | `Paginated<SessionSummary>` | — | FR-20 히스토리, §7.8 세션별 삭제 목록 |

클라이언트 전용(계약 아님): RecordingController 상태, 로컬 UploadQueue 상태, 마이크 권한 상태.

### Stage 5 — Reflection · Async Analysis · Short Feedback

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/reflection-form` | — | `ReflectionFormDefinition` (check items & options, template copy) | — | FR-12 (선택지 운영 관리) |
| POST | `/v1/sessions/:sessionId/reflection` (IK) | `SubmitReflection` (rating?, checks, revisitTopics[], freeNote?, skipped) | `Reflection` | REFLECTION_ALREADY_SUBMITTED, SESSION_INVALID_TRANSITION(completed 이전) | FR-12, §7.6 |
| GET | `/v1/sessions/:sessionId/analysis` | — | `SessionAnalysisStatus` (sessionStatus, outcome, shortFeedback?{text}, metricsPreview?{emotionWordCount, newWords[]}) | ANALYSIS_NOT_AVAILABLE | FR-13, FR-14, §13 STT 저품질 안내 |

분석 Worker 내부 데이터(`AnalysisJobPayload`, `SttResult`, `SessionMetrics`, `CapabilitySignal`, `HighlightClipCandidate`)는 **contracts에 정의하지 않는다** — Frontend 비노출, Backend Handoff 요구사항으로 `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` 에 문서화한다.

### Stage 6 — Personalization · Profile Update · Recommendation Loop

신규 endpoint 없음(RECOMMENDED). 기존 응답의 필드 확장:
- `ChildProfile.profileUpdatedAt`, `latestSnapshot.source='session_analysis'` (FR-15)
- `ActivityCard.recommendationPhase: 'cold' | 'warm'`, `options[].reasonKey` (§8.3) — 추천 사유 표시가 Figma에 있으면 사용
- `GET /v1/children/:childId/capability-snapshots`, `/personas` 를 프로필·리포트 히스토리에서 사용

### Stage 7 — 4-Week Report · PDF · History · Highlight Clips

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/children/:childId/reports/overview` | — | `ReportOverview` (currentCycle{period, eligibility, progress{recordedMinutes, requiredMinutes, recordedSessions, requiredSessions}}, latestSnapshot for diamond, archive[]) | — | FR-16, §6.1 리포트 탭 |
| GET | `/v1/children/:childId/reports` | cursor | `Paginated<ReportSummary>` | — | FR-16 아카이브 |
| GET | `/v1/reports/:reportId` | — | `ReportDetail` (capabilityChange{previous, current, deltas, evidence}, personaHistory[], dialogueMetrics, notableQuotes[1–2], parentFeedbackSummary, highlightClips[]) | REPORT_NOT_READY, REPORT_NOT_ELIGIBLE | FR-16, FR-18, §7.7 |
| POST | `/v1/reports/:reportId/viewed` | — | 204 | — | §2.3 리포트 열람률 |
| GET | `/v1/highlight-clips/:clipId/playback-url` | — | `SignedMediaUrl` (url, expiresAt) | RECORDING_DELETED | FR-18 |
| POST | `/v1/reports/:reportId/pdf` (IK) | — | `ReportPdfStatus` | REPORT_NOT_READY | FR-17 |
| GET | `/v1/reports/:reportId/pdf` | — | `ReportPdfStatus` (status, downloadUrl?, expiresAt?) | PDF_NOT_READY | FR-17 |

### Stage 8 (또는 Stage 6) — Data Management · Deletion · Account

> **이월 항목**: 이 그룹은 이전 "Privacy" Stage에서 넘어온 화면(FR-21 데이터 관리 P0, 동의 이력 보기, 계정 삭제)을 위한 계약이다. 사용자 Stage 8 정의에는 없으므로 **NEEDS DECISION — Stage 8 유지 vs Stage 6 설정 작업으로 이동** (PLANNING §10 #30). FR-21 계약은 어느 쪽이든 유지한다.

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/data-management` | — | `DataManagementSummary` (retentionPolicy{rawAudioDays: 90}, recordingsCount, pendingDeletionRequests) | — | §7.8 보관 정책 안내 |
| DELETE | `/v1/sessions/:sessionId/recording` (IK) | — | `DeletionRequest` | RECORDING_DELETED, DELETION_ALREADY_REQUESTED | FR-21 |
| POST | `/v1/data-deletion-requests` (IK) | `CreateDeletionRequest` (scope='all_data', confirmation) | `DeletionRequest` | DELETION_ALREADY_REQUESTED | FR-21, NFR |
| GET | `/v1/data-deletion-requests/:id` | — | `DeletionRequest` | — | FR-21 |
| DELETE | `/v1/me` (IK) | `DeleteAccount` (confirmation) | `DeletionRequest` | — | §7.8 탈퇴 (범위 DATA_MODEL §12.2 B-5 결정) |
| GET | `/v1/consents` (동의 이력 보기 화면 재사용 — 화면 자체는 RECOMMENDED) | — | `ConsentHistory` | — | FR-02, PRD §12.1 동의 이력 |
| — | 동의 철회 | — | — | — | **Contract 미정의** — PRD·Figma 근거 없음. NEEDS DECISION (OAQ-08, COPPA 법무). 채택 시 `RecordConsents.items[].action='revoked'` 확장 후보 |

> 세션별 녹음 삭제(FR-21)를 Stage 4에서 먼저 제공할지(녹음이 처음 생기는 Stage) Stage 8에 둘지는 PLANNING.md §4.1 FR-21 행의 결정 항목.

---

## 5. Mock Layer (`.claude/rules/frontend.md` §5 정합)

### 5.1 폴더 구조 (CONFIRMED: 사용자 지시 docs/source/prompts/01-stage0-1-1-frontend-scope.md "Mock Architecture" — auth/children/activities/sessions/recordings/analysis/reports; 추가 폴더는 RECOMMENDED, rules/frontend §5)

```
apps/web/src/
├── shared/api/                 API Client Interface (authApi, childrenApi, onboardingApi, activityApi, libraryApi,
│                               sessionApi, recordingApi, analysisApi, reportApi, notificationApi, dataManagementApi)
│                               + 공통 helper: contracts parse, Error Envelope 매핑, AuthGateway 토큰 첨부
├── mocks/
│   ├── auth/  children/  onboarding/  activities/  library/
│   ├── sessions/  recordings/  analysis/  reports/  notifications/  data-management/
│   │     각 폴더: Mock<Domain>Api (interface 구현) + handler 로직 (전이 표·error code 재현)
│   ├── fixtures/               contracts schema를 통과하는 가상 데이터 (실제 아동 데이터·Figma placeholder 복사 금지)
│   └── scenarios/              scenario 정의 + 전환 스위치 (방식은 Stage 1 Plan에서 확정)
└── app/providers/              Adapter 선택 지점 1곳 (Mock | Http)
```

#### 5.1.1 녹음 업로드 계층 명칭 (RECOMMENDED — Orchestrator 결정 명칭, Stage 0 승인 대상)

| 계층 | Interface | Mock Adapter | 실제 Adapter (골격) | 책임 |
|---|---|---|---|---|
| API | `recordingApi` (`init`, `refreshTokens`, `complete`, `status`) | `MockRecordingApi` | `HttpRecordingApi` | 녹음 업로드 Contract 호출: 초기화·토큰 재발급·완료 확정·상태 조회 (§4 Stage 4) |
| 바이트 전송 | `UploadTransport` (`uploadPart`, `resume`, `abort`) | `MockUploadTransport` | `TusUploadTransport` | part 바이트 전송(resumable), 진행률·실패·재개 |

- 위 이름 외의 변형(`RecordingUploadApi`, `MockRecordingUploadTransport`, `MockRecordingUploadApi` 등)은 사용하지 않는다.
- `UploadQueue`(features/recording)는 `recordingApi` 와 `UploadTransport` 를 조합한다. 실제 전송·서버 확정 검증은 `BACKEND_INTEGRATION_PENDING` (`RECORDING_UPLOAD_SPEC.md`).

### 5.2 Adapter 규칙

| 규칙 | 내용 | 라벨 |
|---|---|---|
| 호출 경로 | `Component → Query/Mutation hook → <domain>Api interface → Mock<Domain>Api \| Http<Domain>Api` (예: `SessionPage → useCreateSession → sessionApi.create → MockSessionApi \| HttpSessionApi`) | CONFIRMED (사용자 지시 docs/source/prompts/01-stage0-1-1-frontend-scope.md "Frontend Architecture" — SessionPage → useCreateSession → sessionApi.create → MockSessionApi / HttpSessionApi) |
| Adapter 선택 | `app/providers` 한 곳, 환경 설정으로. Component·Feature·Query hook에서 분기 금지 | RECOMMENDED (rules/architecture §4 초안; Mock→Http 교체 가능성 자체는 사용자 지시 CONFIRMED) |
| 검증 | Mock/Http 모두 요청·응답을 contracts schema로 parse | CONFIRMED |
| 중복 방지 | 도메인별 Mock 클래스는 공통 helper(지연·scenario 조회·error envelope 생성·전이 표 `canTransition`)를 사용하고 도메인 로직만 가진다 | RECOMMENDED |
| Http Adapter | Contract 기반 골격만 (endpoint path·method·schema 연결). 실제 연동 검증 = `BACKEND_INTEGRATION_PENDING`. 골격 작성 시점(각 Stage vs Stage 8)은 Stage 1 Plan 결정 | RECOMMENDED |
| AuthGateway / Upload | `MockAuthGateway`; 업로드는 `MockRecordingApi` + `MockUploadTransport` (TUS/서명 URL 흉내) — Supabase·TUS 실제 Adapter 미구현 (§5.1.1) | RECOMMENDED (rules/frontend §1 [제안 — Stage 0 승인 대상]) |
| 결정성 | 같은 scenario = 같은 결과 (테스트 재현성). 시간·ID는 주입 가능한 clock/id 생성기 사용 | RECOMMENDED (rules/frontend §5 초안) |
| Production | Production 빌드에서 Mock 포함/비활성 방식은 Stage 1 Plan 결정 | NEEDS DECISION |

### 5.3 Endpoint 그룹별 필수 Scenario

공통 5종 `success` · `loading` · `empty` · `error` · `retry` 는 데이터 조회 화면에 모두 적용한다. Key는 §5.4 Catalogue만 사용한다.

| Endpoint 그룹 (§4) | 필요 Frontend Stage | 공통 | HARU 특화 (rules/frontend §5 필수 = 굵게) |
|---|---|---|---|
| health | 1 | `success`, `loading`, `error`, `retry` | `offline` |
| me / consents / auth(AuthGateway) | 2 | `success`, `loading`, `error`, `retry` | `consent-missing`, `consent-version-outdated`, `token-expired`, `provider-cancelled`, `onboarding-incomplete` |
| onboarding / children profile | 2 | `success`, `loading`, `error`, `retry` | `draft-resume`, `persona-fallback`, `child-limit-reached` |
| home / activity-cards | 3 | `success`, `loading`, `empty`, `error`, `retry` | `offline-cached-card`, `conversation-only-option`, `reread-option`, `books-exhausted`, `session-already-active` |
| library / books / gift-requests | 3 | `success`, `loading`, `empty`, `error`, `retry` | `gift-pending`, `gift-duplicate`, `user-entered-book` |
| notifications / push-devices | 3 | `success`, `loading`, `error`, `retry` | `push-permission-denied` |
| sessions (create / transitions) | 4 | `success`, `loading`, `error`, `retry` | `invalid-transition`, `session-already-active`, `onboarding-incomplete`, `consent-missing`, `mic-permission-denied`, `recording-interrupted`, `auto-timeout`, `crash-recovered`, `abandoned` (RECOMMENDED 상태 승인 시) |
| recordings (upload init / tokens / complete) | 4 | `success`, `loading`, `error`, `retry` | **`recording-upload-success`**, **`recording-upload-failure`**, `upload-retry`, `upload-token-expired`, `recording-incomplete`, `offline-queued`, `upload-stalled-48h` |
| reflections | 5 | `success`, `loading`, `empty`(skip), `error`, `retry` | `reflection-already-submitted`, `invalid-transition` (completed 이전 제출) |
| analysis / short feedback | 5 | `success`, `loading`, `error`, `retry` | **`analysis-pending`**, **`analysis-completed`**, **`analysis-failed`**, `analysis-low-quality`, `analysis-not-available`, `recording-deleted` (skipped) |
| profile update / recommendation (필드 확장) | 6 | `success`, `loading`, `empty`, `error`, `retry` | `cold-to-warm`, `persona-changed`, `difficulty-lowered` |
| reports / highlight clips / PDF | 7 | `success`, `loading`, `empty`, `error`, `retry` | **`report-eligible`**, **`report-not-eligible`**, `report-deferred`, `report-delayed`, `pdf-generating`, `clip-expired`, `share-cancelled` |
| data management / deletion / account (이월 — PLANNING §10 #30) | 8 또는 6 | `success`, `loading`, `empty`, `error`, `retry` | `deletion-processing`, `deletion-already-requested`, `recording-deleted` (`consent-revoked` 는 OAQ-08 채택 시에만) |

### 5.4 Scenario Key Catalogue — **scenario key의 유일한 기준 (Single Source)**

- Mock scenario store, 전환 스위치, fixture 파일명, 테스트 이름, Stage Plan·Design Spec·QA 리포트는 아래 **machine key** 만 사용한다. 다른 문서(PLANNING, FRONTEND_IMPLEMENTATION_PLAN, Stage Design Spec 등)는 이 표를 참조하며, 불일치 시 이 표가 우선한다.
- rules/frontend.md §5의 표시명은 "rules display name" 열에 1:1로 대응한다 (key 1개 = 표시명 1개).
- Alias는 이전 초안에서 쓰던 이름이다. **신규 사용 금지** — 기존 문서 동기화 시 canonical key로 치환한다.
- 조합: 공통 key는 endpoint 단위로, 특화 key는 해당 그룹에 적용한다 (예: activity-cards=`loading` + 나머지=`success`). 조합 표기 방식은 Stage 1 Plan에서 확정.
- Key로 만들지 않는 것: `RECORDING_NOT_ALLOWED_FOR_MODE` 등 단일 error code 재현은 `error` + code 지정; 출석 스티커 멱등성은 같은 요청 replay 테스트; 저품질 세션을 리포트 집계에 포함할지는 OAQ-12 (key 아님).

| Machine key | rules display name | 의미 (Mock 동작) | 적용 endpoint 그룹 | 최초 FE Stage | Alias (deprecated) |
|---|---|---|---|---|---|
| `success` | SUCCESS | contracts schema를 통과하는 성공 fixture 응답 | 전체 | 1 | `default` |
| `loading` | LOADING | 성공 응답을 지연(예 1.5–3s)시켜 Loading/Skeleton·버튼 loading 검증 | 전체 | 1 | `slow` |
| `empty` | EMPTY | 목록 `items: []` / 표시할 내용 없음 (회고 skip 포함) | home, activity-cards, library, gift-requests, sessions 목록, reflections, reports, data management | 1 | — |
| `error` | ERROR | contracts Error Envelope 반환 (기본 `INTERNAL_ERROR`, endpoint별 code 지정 가능) | 전체 | 1 | — |
| `retry` | RETRY | 첫 요청 `error` → 재시도 시 `success` (입력 보존·재시도 UX 검증) | 전체 | 1 | — |
| `recording-upload-success` | recording upload success | init → part 업로드 → complete 성공 → `uploadStatus=uploaded`, 세션 `analyzing` | recordings | 4 | `upload-success` |
| `recording-upload-failure` | recording upload failure | 업로드 또는 complete가 지속 실패(네트워크 오류·5xx) → 로컬 보관 유지·재시도 대기 | recordings | 4 | `upload-failure` |
| `analysis-pending` | analysis pending | `sessionStatus=analyzing`, 폴링 동안 유지 | analysis | 5 | — |
| `analysis-completed` | analysis completed | `analyzed` + `outcome=full` + `shortFeedback` | analysis | 5 | — |
| `analysis-failed` | analysis failed | `failed` (재시도 중 안내) | analysis | 5 | — |
| `report-eligible` | report eligible | 현재 주기 eligible + 발행 리포트 1건 이상 | reports | 7 | — |
| `report-not-eligible` | report not eligible | `insufficient_*` eligibility + 진행도(녹음 분·세션 수) | reports | 7 | — |
| `offline` | — | Adapter가 network error throw | 전체 | 1 | — |
| `token-expired` | — | `AUTH_TOKEN_EXPIRED` → refresh 1회 후 성공 | 인증 필요 endpoint, AuthGateway | 2 | — |
| `provider-cancelled` | — | AuthGateway 소셜 로그인 취소 | AuthGateway | 2 | — |
| `consent-missing` | — | `CONSENT_REQUIRED` + `Me.consentStatus.missing` 비어 있지 않음 | me, consents, onboarding, sessions(to=recording), recordings | 2 | — |
| `consent-version-outdated` | — | `CONSENT_VERSION_OUTDATED` → 재동의 | me, consents | 2 | — |
| `draft-resume` | — | `OnboardingState.currentStep = n` (중도 이탈 복귀) | onboarding | 2 | — |
| `persona-fallback` | — | 페르소나 생성 실패(`PROVIDER_UNAVAILABLE`) → fallback 페르소나로 200 | onboarding submit, children profile | 2 | — |
| `child-limit-reached` | — | `CHILD_LIMIT_REACHED` | onboarding submit | 2 | — |
| `onboarding-incomplete` | — | `Me.onboardingStatus != completed` → Route Guard가 `/onboarding/:step` 으로 이동, 홈·세션 endpoint는 `ONBOARDING_INCOMPLETE` | me, home, activity-cards, sessions (Route Guard) | 2 | — |
| `offline-cached-card` | — | `offline` + 최근 Activity Card 캐시 존재 | home, activity-cards | 3 | — |
| `conversation-only-option` | — | 카드 옵션에 `kind=conversation_only` 포함 | activity-cards | 3 | — |
| `reread-option` | — | 카드 옵션에 `kind=reread_book` 포함 | activity-cards | 3 | — |
| `books-exhausted` | — | 재독·대화 전용 대체 카드만 반환 | activity-cards | 3 | — |
| `session-already-active` | — | `HomeSummary.activeSession` 존재 / `POST /v1/sessions` → `SESSION_ALREADY_ACTIVE` | home, sessions | 3 | `active-session-exists` |
| `gift-pending` | — | 증정 신청 `gift_pending`·배송 상태 표시 | library, gift-requests | 3 | — |
| `gift-duplicate` | — | `GIFT_REQUEST_DUPLICATE` | gift-requests | 3 | — |
| `user-entered-book` | — | DB 외 직접 등록 책 포함 (범용 Prompt) | library, books | 3 | — |
| `push-permission-denied` | — | platform mock: OS push 권한 거부 | push-devices (platform adapter) | 3 | `os-permission-denied` |
| `invalid-transition` | — | `SESSION_INVALID_TRANSITION` → 서버(Mock) 상태 재동기화 | sessions, reflections (completed 이전 제출) | 4 | — |
| `mic-permission-denied` | — | RecorderAdapter mock 권한 거부 → 권한 안내·대화만 하기 | sessions (RecorderAdapter mock) | 4 | — |
| `auto-timeout` | — | 누적 30분 도달 → `completed(auto_timeout)` (clock 주입) | sessions (RecorderAdapter mock) | 4 | — |
| `crash-recovered` | — | 미완료 로컬 녹음 발견 → `completed(recovered_after_crash)` → 업로드 | sessions, recordings (LocalRecordingStore mock) | 4 | — |
| `recording-interrupted` | — | RecorderAdapter mock 인터럽션(전화 수신 / 오디오 route 변경 / 백그라운드 전환) → 일시정지·재개 안내, 로컬 청크 보존 | sessions (RecorderAdapter mock) | 4 | — |
| `abandoned` | — | ready 10분 경과 → `abandoned` (RECOMMENDED 상태 승인 시) | sessions | 4 | — |
| `upload-retry` | — | 업로드 1회 이상 실패 후 재시도 성공 | recordings | 4 | `upload-retry-success` |
| `upload-token-expired` | — | `UPLOAD_TOKEN_EXPIRED` → 토큰 재발급 후 성공 | recordings | 4 | — |
| `recording-incomplete` | — | complete 시 `RECORDING_INCOMPLETE` | recordings | 4 | — |
| `offline-queued` | — | 오프라인 녹음 완료 → 큐 대기 → 복구 후 업로드 | recordings | 4 | — |
| `upload-stalled-48h` | — | 업로드 실패 48h 경과 (clock 주입) → 안내 | recordings | 4 | `stalled-48h` |
| `reflection-already-submitted` | — | `REFLECTION_ALREADY_SUBMITTED` / 멱등 재제출 동일 응답 | reflections | 5 | `already-submitted` |
| `analysis-low-quality` | — | `analyzed` + `outcome=excluded_low_quality` | analysis | 5 | — |
| `analysis-not-available` | — | `ANALYSIS_NOT_AVAILABLE` (conversation_only 등) | analysis | 5 | — |
| `cold-to-warm` | — | `recommendationPhase` cold → warm 전환 | activity-cards, children profile | 6 | — |
| `persona-changed` | — | 새 snapshot + persona (`profileUpdatedAt` 갱신) | children profile, personas | 6 | — |
| `difficulty-lowered` | — | 회고 "Tricky today" 이후 난이도 하향 카드 fixture | activity-cards | 6 | — |
| `report-deferred` | — | 현재 주기 `deferred` (이월 안내) | reports | 7 | — |
| `report-delayed` | — | `delayed` (생성 실패 재시도 중) / `REPORT_NOT_READY` | reports | 7 | — |
| `pdf-generating` | — | `PDF_NOT_READY` → 폴링 후 ready | reports PDF | 7 | — |
| `clip-expired` | — | 하이라이트 클립 만료 / `RECORDING_DELETED` | highlight clips | 7 | — |
| `share-cancelled` | — | platform mock: PDF 공유 시트 취소 (오류 아님, 상태 유지) | reports PDF (share) | 7 | — |
| `deletion-processing` | — | 삭제 요청 `received → processing → completed` | data management | 8 | — |
| `deletion-already-requested` | — | `DELETION_ALREADY_REQUESTED` | data management | 8 | — |
| `recording-deleted` | — | `RECORDING_DELETED` / 분석 `skipped_audio_deleted` | recordings (upload-tokens), analysis, highlight clips, data management | 4 | — |
| `consent-revoked` | — | **조건부 — OAQ-08에서 동의 철회를 채택한 경우에만 정의**: 철회 후 녹음 차단, 분석 `skipped_consent_revoked`. 채택 전 Mock·테스트에 사용 금지 | sessions, analysis (+ consents) | 4–5 (채택 시) | — |

- Mock 응답도 contracts schema로 parse (fixture drift 방지).
- Fixture 아동 데이터는 가상 이름만 사용 (실제 아동 데이터 금지 — rules/frontend.md §5 fixtures 규칙).
- Figma placeholder 값(표지·제목·리포트 수치)을 fixture로 복사하지 않는다 (M-36).

---

## 6. Figma 대비 Contract Gap (design-agent 결과 반영)

아래 항목은 **계약에 추가하지 않았다.** PRD 근거가 없거나 PRD와 충돌하는 Figma 요소이므로, 해당 불일치(M-xx)가 결정된 뒤에만 contracts·Mock에 반영한다.

| # | Gap | Figma 근거 | 현재 계약 | 채택 시 후보 변경 | 라벨 |
|---|---|---|---|---|---|
| G-01 | **주간 Progress 지표** (주간 세션 수·총 분·전주 대비 %, 요일별 분, 월 출석 달력, 주별 분, longest streak, % of nights read, 평균 세션 길이) | `31:102`, `110:522` | `ReportOverview` 에 주간 지표 없음 (PRD §7.7은 4주 리포트만) | `GET /v1/children/:childId/progress?weekStart=` → `WeeklyProgress`. 비교·달성률 표현("+18% vs last week", "80% of nights read")은 M-12 copy 결정 필요 | NEEDS DECISION (M-10) |
| G-02 | **홈 누적 읽기 분** ("12-day/115 Min") | `26:40`, `26:43` | `HomeSummary` = `streakDays`, `sessionsThisWeek`, `lastHighlightLine?` — minutes 없음 | `HomeSummary.totalMinutes` (집계 기간 정의 필요: 누적 / 이번 주 / streak 기간). PRD §7.4 보조 요소에는 "분" 없음 | NEEDS DECISION (M-30) |
| G-03 | **Prompt 단계·페이지 태그** PRE / POST / P.6 | `139:2410–2412`, `163:2648`, `145:1132`, `88:960` | `Prompt` = `text`, `kind`(question/follow_up) | `Prompt.phase: 'pre' \| 'during' \| 'post'`, `Prompt.pageRef: number \| null` (+ DATA_MODEL `prompts` 컬럼, 콘텐츠 제작 범위 확대) | NEEDS DECISION (M-29) |
| G-04 | **책 저장 / My Saved, 책 평점, 읽기 진행** ("Save to my shelf", "Rated 4.5", "Reading now · 3 of 5 nights", "Last read Tue · 12 min") | `86:245`, `86:372`, `145:1157`, `109:511`, `145:1141–1152` | 없음 (PRD FR-20 범위 밖) | `LibraryBook.saved` + `PUT/DELETE /v1/children/:childId/library/books/:id/saved`; `LibraryBook.averageRating` (회고 별점 집계인지 정의 필요); reading plan 모델(`targetNights`, `nightsRead`, `lastReadAt`) | NEEDS DECISION (M-14) |
| G-05 | **덱 카드별 역량** | `163:2648` — 3장이 각각 Self-Direction / Emotion / Intrinsic Motivation | `ActivityCard.targetCapability` = 카드(하루) 단위 1개 (PRD §7.4 "오늘의 역량 배지", §8.3 순환 스케줄) | (a) PRD 유지: 3개 option 모두 같은 역량 표시 (b) `ActivityCard.options[].capability` 추가 + 순환 스케줄 규칙 변경 | NEEDS DECISION (M-31) |
| G-06 | **회고 칩 정의** | `91:710–714` Engaged / Big feelings / Ask Questions / Stay Focus / Tricky today (on/off) + 별점 `91:693` + 한 줄 입력 `91:716` | `ReflectionFormDefinition` 은 이름만 정의, `SubmitReflection.checks` 값 형태·선택지 미정 | PRD 체크 5종 ↔ 칩 1:1 매핑 후보 (아이 반응↔Engaged, 감정 표현↔Big feelings, 질문 여부↔Ask Questions, 집중 시간↔Stay Focus, 어려웠던 점↔Tricky today). 칩 = boolean인지 항목별 선택지인지, 문구, 자유 후기 별도 카드 여부 결정 후 `ReflectionCheckKey` enum + `checks: Record<ReflectionCheckKey, boolean>` 확정 | NEEDS DECISION (M-15) |
| G-07 | **Prompt 노출 시점** | 모든 카드 변형이 책 선택 전 Prompt 노출 (`163:2648`, `86:438`, `86:512/545`) | `ActivityCard.options[]` 에 prompt 없음, `SelectActivityOption` 응답에서 `promptSet` 제공 (PRD §7.4) | Figma 채택 시 `options[].promptPreview` 추가 | NEEDS DECISION (M-09) |
| G-08 | **세션 준비 버블에 Prompt 목록** ("Try this prompt !") | `139:2803` | `SessionSummary.bubble` = 검수 템플릿 인사, `prompts` 는 Prompt 모아보기용 | PRD §7.5(자동 제시 금지) 기준 현 계약 유지 | NEEDS DECISION (M-25) |
| G-09 | **녹음 Discard / Submit** | `163:1618`, `163:1620` (용도 불명) | 녹음 폐기 전이 없음 | 채택 시 FR-21 삭제 흐름·동의 정책과 함께 정의 (예: 완료 전 폐기 = `abandoned` + 로컬 삭제, 서버 업로드 없음) | NEEDS DECISION (M-26) |
| G-10 | **가입 화면 아이 정보** | `179:1740` | 동의 전 `child_info` 저장 불가 (`CONSENT_REQUIRED`) | 계약 변경 없음 — ARCHITECTURE §7.3.1 Guard (로컬 draft → 동의 후 전송) | RECOMMENDED (M-28) |
| G-11 | **리포트 이메일 발송** | `110:861` | 없음 | `NotificationPreferences.reportEmailEnabled`, `NotificationKind.report_email` | NEEDS DECISION (M-11) |

