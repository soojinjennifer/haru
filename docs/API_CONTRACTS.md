# HARU API Contracts

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (**Rev 8: Stage 4 승인 결정 `D4-1`~`D4-22` 반영, 2026-10-13 plan-agent** · 최신 **Rev 8.9**: `D4-87`·`D4-88` 설계 변경, 2026-11-01 plan-agent · **APPROVED (2026-11-02, user, `D4-97`)**)

> **Rev 8 (2026-10-13, plan-agent — Stage 4 Plan 승인 후 적용)** — `docs/plans/stage-4-plan.md` §7.5 의 **18 지점**을 반영했다 (목록 20건 중 무효 2건 제외).
> 적용 지점: §2.2(enum 수 정정 `P4-FIX-3` + Stage 4 신규 2종) · **§3.1 전이표 2행 추가(12 → 14 — `D4-13`)** · §3.2(`SessionSummary.bubble` 렌더 지점·null 거동·길이 요구 — `D4-20`·`D4-21`·`D4-22` / `SessionTransitionRequest.to='abandoned'` 세 경로 주석 / `StickerAward` / `readingContext`) · §3.3(`partNo`·`mimeType` = `S4-A` spike 확정 대기) · **§3.9 `RecordingStatus` 신설** · §4 Stage 3·4 표(이월 표기 · 네이티브 후속 단계 주석) · §5.1.1(`RecorderAdapter`·`recordingApi`·`UploadTransport`) · **§5.4 신규 scenario key 2건** · **§6 `G-08`·`G-09` Resolved**.
> ⛔ **구현으로 확정되는 내용(실제 `packages/contracts` 파일·Mock 위치)의 반영은 development-agent 소관**이다 (`rules/workflow.md` §5). Rev 8 은 **설계·계획 변경**만 담는다.
>
> **Rev 8.1 (2026-10-14, development-agent — Stage 4a `S4-B` 구현 반영)** — `packages/contracts` 에 Stage 4 contracts 가 구현되었다. 반영 지점: §2.2(enum **+3** — `PushPlatform`·`StickerType`·**`RecordingContainer`(`D4-23`)**) · §3.1(전이표 **14행 구현**) · §3.2(실제 파일·필드 — `StickerAward.title`·`message`, `readingContext` nullable **CONFIRMED `D4-25`**) · §3.3(**`mimeType` = 원문 문자열 + `container` enum — `D4-23`**, **`partNo ≤ 20` + part 정의 주석 — `D4-24`**) · §3.9(구현) · §4 Stage 3 이월 `notifications/preferences.ts`·`push-device.ts`(`NotificationPreferences` = `{ cardRefreshTime, reminderDays(0–6, 중복 금지), reminderTime: TimeOfDay \| null, pushEnabled }` · `PushDevice` = `{ id, platform, lastSeenAt }` — **token 미반환**). 설계 변경은 없다 — 사용자 결정 `D4-23`·`D4-24`·`D4-25`(2026-10-14) 의 반영뿐이다.
>
> **Rev 8.2 (2026-10-14, development-agent — Stage 4a `S4-C` Mock 구현 반영)** — 설계 변경 없음. 반영 지점: §5.1.1(`UploadTransport` 인자·반환 **초안** · `TusUploadTransport` 골격 · `recordingApi.status` 경로 공백) · §5.4(**메서드 단위 override 표기** `group.method:key` · `recorder` 그룹 · `web-background-warning` = `D4-26` · 폐기 전이 실패 분기 판단). 상세 `docs/qa/stage-4a-handoff.md` `S4-C`.
>
> **Rev 8.3 (2026-10-15, development-agent — Stage 4a `S4-E` 구현 반영)** — 사용자 결정 **`D4-29`**(로컬 미업로드 녹음 보관 상한 14일 · 7일 안내)로 §5.4 에 **`local-retention-exceeded` 등재**(Rev 8 의 "등재하지 않는다" 판단은 `N4-09` 미결이 근거였고 그 근거가 해소됐다). §5.1.1 `UploadTransport` 인자·반환 **확정**(초안과 동일 — `UploadQueue` 가 그대로 쓴다). contracts 변경 0. 상세 `docs/qa/stage-4a-handoff.md` `S4-E`.
>
> **Rev 8.4 (2026-10-15, development-agent — Stage 4a `S4-J` 이월 구현 반영)** — 설계 변경 없음 · contracts 변경 0. 반영 지점: §5.1.1 Platform Port 표의 **`PushPermissionPort` 구현**(`shared/platform/push-permission/` — interface `getStatus`·`request`·`getToken` + `platform`, 상태 `prompt`·`granted`·`denied`·`unsupported`, Web 토큰 = 자리표시 값 `web-permission-only:v1` — 실제 구독 토큰은 `BACKEND_INTEGRATION_PENDING`) · §5.4 **`push-permission-denied` = 플랫폼 포트 그룹 `push`**(`?scenario=push:push-permission-denied`, Mock = `mocks/platform/MockPushPermissionPort.ts`) · §5.4 **`offline-cached-card` = `activity-cards` 그룹 구현**(API 는 `offline` 과 같은 `NetworkError`, 기기 캐시 seed 는 브라우저 조립 지점 — `mocks/activities/activityCardCacheSeed.ts`). 상세 `docs/qa/stage-4a-handoff.md` `S4-J`.
> **Rev 8.5 (2026-10-26, development-agent — Stage 4b `S4-F1` 구현 반영)** — 설계 변경 없음 · **contracts 변경 0**. 반영 지점: §5.4 **`session`**(Prompt 개수 — 4b Plan §12 제안 key 구현) · **`session-greeting`**(인사 변형 — 신규 그룹, plan-agent 등재 판단 대상) 그룹 · e2e 요청 로그 노출(dev 전용). 상세 `docs/qa/stage-4b-handoff.md` `S4-F1`.
> **Rev 8.6 (2026-10-27, plan-agent — 사용자 결정 `D4-59` 반영, 설계 변경)** — **contract 필드 1건 추가**: `SessionSummary.reminderBubble: SessionBubbleCopy | null` (ready 5분 리마인드 버블 제목 줄 문구 — `D4-46`·`D4-59`). 반영 지점: §3.2 스케치 · **§3.2.2 신설**(렌더 지점·null 거동·길이 요구·Mock 예시·Handoff) · §5.4 `session-greeting` 그룹 key 1건 등재 제안(`reminder-missing`). Error code 0 · enum 0. 실제 `packages/contracts`·Mock 반영은 development-agent (`stage-4b-plan.md` §13.1 `S4-F1R`).
> **Rev 8.8 (2026-10-29, development-agent — Stage 4b `S4-F2` 구현 반영)** — 설계 변경 없음 · **contracts 변경 0** · error code 0. 반영 지점: §5.4 `session` 그룹 key 3건 구현(`book-missing` · `book-no-cover` · `book-long-title` — 4b Plan §12 제안 key 그대로). recording·paused 화면은 기존 전이(`ready→recording` · `recording⇄paused` · `→completed(user_done)` · `recording|paused→abandoned`)만 쓴다. 상세 `docs/qa/stage-4b-handoff.md` `S4-F2`.
> **Rev 8.7 (2026-10-27, development-agent — Stage 4b `S4-F1R` 구현 반영)** — 설계 변경 없음. Rev 8.6 설계대로 `packages/contracts/src/sessions/session.ts` `SessionSummarySchema.reminderBubble: SessionBubbleCopySchema` (required · nullable · `.max` 없음) 구현 + 단위 테스트(`src/__tests__/sessions.test.ts`). Mock: `MOCK_READY_REMINDER_BUBBLE`(`Ready when you are!`) · §5.4 `session-greeting:reminder-missing` 구현. 상세 `docs/qa/stage-4b-handoff.md` `S4-F1R`.
> **Rev 8.9 (2026-11-01, plan-agent — 사용자 결정 `D4-87`·`D4-88` 반영, 설계 변경 · APPROVED (2026-11-02, user) — `D4-97`, 미결 `N4B-19`·`N4B-20`·`N4B-22` 는 `D4-94`·`D4-95`·`D4-98` 로 해소)** — **contract 필드 2건 추가**: `SessionBubbleCopy.subtext`(`.nullable().optional()`) · `SessionDetail.completionBubble`(required + nullable). 반영 지점: §3.2 스케치 · **§3.2.3 신설** · §4 Stage 4 `GET /v1/sessions/:sessionId` 행 · §5.4 `session-completion` 그룹 등재. Error code 0 · enum 0 · 전이표 0 · endpoint 0. 실제 `packages/contracts`·Mock 반영은 development-agent (`stage-4b-plan.md` §13.2 `S4-H1R`).
> **Rev 8.10 (2026-11-02, development-agent — Stage 4b `S4-H1R` 구현 반영)** — 설계 변경 없음. Rev 8.9 설계대로 `packages/contracts/src/sessions/session.ts` `SessionBubbleCopySchema.subtext`(`.nullable().optional()`) · `SessionDetailSchema.completionBubble`(required · nullable) 구현 + 단위 테스트. Mock: `MOCK_COMPLETION_BUBBLE.subtext` · `MOCK_COMPLETION_BUBBLE_NO_SUBTEXT` · `toDetail` 완료 계열 한정 · §5.4 `session-completion` 3 key(`mocks/sessions/sessionFixtureScenarios.ts`). 상세 `docs/qa/stage-4b-handoff.md` `S4-H1R`.
Reflects: `docs/decisions/stage-0-approvals.md` #7 · #8 · #13 · #14 · #15 · #16 · #17 · #19 · #27 · C-1~C-10 · C-12 · C-13 · C-15 · C-16 · C-18 (Rev 5) · #33 · C-19 (Rev 6)
Decision log: `docs/decisions/stage-0-approvals.md` + **`docs/decisions/stage-3-approvals.md` (Stage 3 — §3 · §6 · §6.1 · §7 · §7.1 · §8 · §8.1~§8.6)** — 이 문서와 다르면 결정 기록이 우선한다. 라벨: `CONFIRMED (사용자 결정 YYYY-MM-DD, #id)` · `RECOMMENDED` · `NEEDS DECISION (법무, L-xx)`.
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

> **구현 반영 (Stage 1-C, development-agent)**: 아래 표(`TRIAL_ACCOUNT_RESTRICTED` 제외) **28 종**이
> `packages/contracts/src/common/error-codes.ts` 의 `ERROR_CODES` / `ErrorCodeSchema` 로 구현되었고,
> "HTTP" 열은 같은 파일의 `ERROR_CODE_HTTP_STATUS` / `httpStatusForErrorCode()` 로 구현되었다.
> Error Envelope 은 `common/error-envelope.ts` (`ErrorEnvelopeSchema` · `isErrorEnvelope` · `HaruApiError`).
> 표와 코드가 달라지면 둘을 함께 갱신한다 (rules/architecture.md §5).

| Code | HTTP | 의미 | PRD |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | contracts schema 검증 실패 (`details.issues`) | — |
| `AUTH_REQUIRED` | 401 | 토큰 없음 | FR-01 |
| `AUTH_TOKEN_EXPIRED` | 401 | 만료 → 클라이언트 1회 refresh | FR-01 |
| `FORBIDDEN` | 403 | 소유권 불일치 (존재 노출 방지를 위해 404로 대체 가능) | NFR 보안 |
| `CONSENT_REQUIRED` | 403 | 필수 동의 또는 `child_voice_data` 동의 없음 (`details.missing: ConsentType[]`) | FR-02 |
| `CONSENT_VERSION_OUTDATED` | 403 | 재동의 필요 | FR-02 |
| ~~`TRIAL_ACCOUNT_RESTRICTED`~~ | — | **제거** — 익명 Trial 계정 미채택 (C-12) | FR-24 |
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
| `BOOK_ALREADY_OWNED` | 409 | 이미 서재에 있는 책을 다시 등록 (`POST …/library/books`) — **구현됨** (Library Plan §7.4) | FR-23 |
| `DELETION_ALREADY_REQUESTED` | 409 | | FR-21 |
| `IDEMPOTENCY_KEY_REUSED` | 422 | 동일 key 다른 body | — |
| `RATE_LIMITED` | 429 | | 기술 요구사항 |
| `PROVIDER_UNAVAILABLE` | 503 | AI/STT/PDF 일시 장애 (사용자에게는 지연 안내) | FR-05, §13 |
| `INTERNAL_ERROR` | 500 | | — |

---

## 2. Shared Enums (`packages/contracts/src/enums`)

### 2.1 Capability — CONFIRMED (사용자 결정 2026-09-14, #13 코드 키 · #14 표시 라벨)

| 코드 키 (contracts enum, 불변) | 화면 표시 라벨 (Frontend copy 모듈) | Baseline v1 약어 | PRD §4 정의 |
|---|---|---|---|
| `emotion_regulation` | Emotion Regulation | ER | 감정 조절 능력 |
| `self_directed_agency` | Self-Direction | AG | 자기주도 역량 |
| `cognitive_flexibility` | Cognitive Flexibility | CF | 회복탄력성·인지 유연성 (라벨에 Resilience 미표시) |
| `intrinsic_motivation` | Intrinsic Motivation | IM | 내적동기부여 |

- 코드 키는 contracts enum, 표시 라벨은 Frontend copy 모듈 한 곳에서 관리한다 (라벨 변경이 데이터 migration을 유발하지 않음). 배지·차트용 짧은 표기는 design-agent가 이 라벨 기준으로 정리한다 (#14).
- 역량 색은 contracts가 아니라 design token이다 (#19 — 배지 색으로 통일, `docs/DESIGN_TOKEN_MAP.md`).
- 이전 표기 비교(Figma 혼재, 구 CLAUDE.md 표기, 책장 "Confidence")는 PLANNING §6 M-13 — 해소됨.

### 2.2 목록

> **구현 반영 (Stage 1-C)**: §2.1 Capability + 아래 22 종 = **enum 23 종**이 `packages/contracts/src/enums/*.ts`
> (파일 20 개 — `consent.ts`·`report.ts`·`deletion.ts` 가 2 종씩 포함) 로 구현되었고,
> 값과 순서는 `src/__tests__/enums.test.ts` 의 스냅샷 테스트가 이 표와의 일치를 보증한다.
>
> **구현 반영 (Stage 2-CONTRACTS)**: 아래 표 마지막 3 행(`ConsentSource`·`OnboardingStatus`·`Plan`)이
> 추가되어 **enum 26 종**이 되었다 (Stage 2 Plan §18-④ 보고 결과 — 세 값 모두 Stage 1 §2.2 표에 없었다).
> 파일은 `enums/consent-source.ts`·`onboarding-status.ts`·`plan.ts` 이고 스냅샷 테스트도 26 종으로 갱신했다.
> 기존 23 종의 이름·값·순서는 바뀌지 않았다.
> `SurveyAnswerValue` 는 enum 이 아니라 `z.union([z.literal(1..5), z.literal('not_observed')])` 로 인코딩했다 (§2.2 "인코딩 RECOMMENDED").
> `Gender` 는 `GenderSchema`(3 값) + `GenderFieldSchema = GenderSchema.nullable()`(미응답 `null`) 로 나누어 구현했다 (C-7).
>
> ⭐ **정정 (Rev 8, 2026-10-13 — `P4-FIX-3`)**: 위 "**enum 26 종**" 표기는 **Stage 2 시점의 수**이고 **현재와 다르다**.
> **[직독]** `packages/contracts/src/enums/*.ts` 의 `z.enum` 선언을 전수 집계한 결과 = **31 종**이다 (`survey.ts` 의 `SurveyAnswerValue` 는 `z.union` 이라 세지 않는다).
> 차이 **3 종은 Stage 3 에서 추가됐고 아래 표에 행이 없다** — 함께 등재한다:
>
> | Enum | 값 | 근거 |
> |---|---|---|
> | `AgeBand` (Stage 3) | `3_4, 5_6, 7_9` | PRD §8.2 연령대 — `packages/contracts/src/enums/age-band.ts` **[직독]** |
> | `PromptKind` (Stage 3) | `question, follow_up` | §3.6 Prompt 표시 필드 — `enums/prompt-kind.ts` **[직독]** |
> | `PromptPhase` (Stage 3) | `pre, post` | §6 `G-03` 채택(`D-8`) — `'during'` **미채택**. `enums/prompt-phase.ts` **[직독]** |
>
> ⭐ **구현 반영 (Stage 4 `S4-B`, 2026-10-14)**: 아래 2 종 + **`RecordingContainer` = `webm, mp4`** (`D4-23` — §3.3) 이 구현되어 `z.enum` **31 → 34 종**, 스냅샷 테스트(`enums.test.ts`, `SurveyAnswerValue` 포함) **32 → 35 항목**이 되었다. 파일: `enums/push-platform.ts` · `enums/sticker.ts` · `enums/recording-container.ts`. **기존 enum 의 값 추가 0 건** (스냅샷 불변).
>
> **Stage 4 에서 추가 예정 2 종** (Plan §7.2 — 구현은 development-agent): `PushPlatform` = `ios, android, web` (이월 `QA-3-001`. ⭐ **3값 유지** — Contract 는 Backend 요구사항이므로 네이티브 분리(`D4-1`)와 무관) · `StickerType` = `attendance` (`C4-OPEN-5` **만든다** — `DATA_MODEL §8 sticker_awards.sticker_type`). → 설계 목표 **33 종**.
> ⭐ **`D4-13` 확인**: 녹음 폐기 채택으로 **enum 신규는 0 건**이다 — `SessionStatus` **8값 유지**, `CompletedReason` **3값 유지**, `AbandonedReason` **만들지 않는다**, `UploadStatus` 신규 0, error code 신규 **0**. 전이표만 2행 늘어난다 (§3.1).
> ⭐ **error code 수는 정확하다** — **[직독]** `common/error-codes.ts` 의 `ERROR_CODES` 배열 = **29 종**이고 파일 주석의 "총 29 종" 과 일치한다. Stage 3 보고가 예고한 "31 → 32종" 은 **반영되지 않았고 반영할 필요도 없다**(실측 29).

| Enum | 값 | 근거 |
|---|---|---|
| `SessionStatus` | `ready, recording, paused, completed, analyzing, analyzed, failed, abandoned` | **CONFIRMED (사용자 결정 2026-09-14, #16)** — PRD §12.2 7개 값 + `abandoned` (§13, ARCHITECTURE §10.2) |
| `SessionMode` | `recorded, conversation_only` | **CONFIRMED (#16)** (§7.4, §13) |
| `CompletedReason` | `user_done, auto_timeout, recovered_after_crash` | **CONFIRMED (#16)** (FR-09, NFR 안정성) |
| `AnalysisOutcome` | `full, excluded_low_quality` | **CONFIRMED (#16)** (§13). `skipped_audio_deleted` 는 OAQ-17 결정 전 enum 제외 (#16). `skipped_consent_revoked` 제거 (C-4) |
| `UploadStatus` (server 응답) | `pending, uploaded, failed, deleted, expired` | **CONFIRMED (#16)** (별도 upload status). 클라이언트 UploadQueue 상태(`local_only…stalled_48h`)는 contracts 가 아니라 `features/recording` 내부 |
| `ReadingContext` | `now, bedtime, after_pickup, weekend_morning, in_the_car, custom_time` | §7.4, FR-08. **영문 라벨 CONFIRMED (2026-10-02, `stage-3-approvals.md` §8.5 ⑨)**: `now`=**Now** · `bedtime`=**Bedtime** · `after_pickup`=**After pickup**(PRD "유치원 하원 후") · `weekend_morning`=**Weekend morning** · `in_the_car`=**In the car** · `custom_time`=**Pick a time…**. 라벨 원본 = `docs/design/stage-3-design-spec.md` §2.4. **문구는 copy 모듈에만 두고 enum 값을 화면에 그대로 쓰지 않는다** |
| `ConsentType` | `terms_of_service, privacy_policy, child_voice_data, marketing, pilot_participation` | **CONFIRMED (사용자 결정 2026-09-14, C-1)** — 필수 여부는 enum이 아니라 `ConsentDocument.required` (pilot = 법무 L-02). `third_party_disclosure` 는 법무 결정 시에만 추가 |
| `ConsentAction` | `granted` | **CONFIRMED (C-4)** — `revoked` 없음 (동의 철회 MVP 제외) |
| `Gender` | `girl, boy, prefer_not_to_say` — 필드는 nullable, 미응답 = `null` | **CONFIRMED (사용자 결정 2026-09-14, C-7)** |
| `SurveyAnswerValue` | `1 \| 2 \| 3 \| 4 \| 5` (Never · Rarely · Sometimes · Often · Almost always) 또는 `not_observed` ("Haven't had the chance to see this yet", 결측) | 척도 **CONFIRMED (C-8)** / 인코딩 RECOMMENDED (§3.4) |
| `ParentVerificationStatus` | `not_required, pending, verified, failed` | **RECOMMENDED** — VPC 단계 슬롯 (C-3). 값은 방식 결정(법무 L-01) 후 조정 |
| `AnalysisJobStatus` | `queued, running, succeeded, failed, cancelled` | FR-14 (Frontend 비노출, Backend/Worker 공유) |
| `ReportEligibility` | `eligible, insufficient_recorded_minutes, insufficient_recorded_sessions, insufficient_both, cycle_in_progress` | FR-16, §7.7 — 기준 상수 CONFIRMED (#17, §3.5) |
| `ReportStatus` | `in_progress, generating, published, deferred, delayed` | FR-16, §13 |
| `ActivityOptionKind` | `book, reread_book, conversation_only` | §7.4, §13 |
| `BookOwnership` | `owned, gifted, gift_pending, favorite_only` | FR-20/22/23 |
| `BookSource` (Stage 3) | `onboarding_favorite, library_add, gift_program, card_save` | `docs/DATA_MODEL.md` §7 `child_books.source` — **구현됨**. 화면은 이 값을 **표식으로 드러내지 않는다** (`L-OPEN-14`). `card_save` = `★ Save` 로 행이 처음 생기는 경로 (§3.7.3, approvals §12.8 `A-9`). ~~`onboarding_home_list`~~ 는 **제거** — 온보딩 `homeBooks` 가 삭제되었다 (approvals §11.9) |
| `LibraryFilter` (Stage 3) | `owned, gifted, history, saved, curated` | §4 Stage 3 서재 **쿼리 축** — **구현됨**. `saved` = Figma `145:1157` "My Saved" 표면 (§3.7.3). `curated` 는 "See all" 시트가 큐레이션 전체 목록을 받기 위해 Library 라운드에서 추가됐다 |
| `LibrarySectionKey` (Stage 3) | `curated, favorites, finished` | 서재 **표시 축** — Figma 섹션 제목 3개 `[실측 30:74 · 145:1141]`. `reading_now` 는 `sections[]` 가 아니라 `LibraryOverview.readingNow` 단일 필드라 여기 없다. ⚠ 표시 축과 쿼리 축은 **1:1 이 아니다** (`L-OPEN-14`) |
| `GiftRequestStatus` | `requested, approved, shipped, delivered, cancelled, rejected` | FR-22, §13 |
| `CaregiverRelationship` | `mother, father, grandparent, babysitter, tutor, therapist, other` | §3.1, §7.2 |
| `OnboardingStep` | `child_info, temperament, books, goals, capability_items` | 5단계 구성·순서 **CONFIRMED (사용자 결정 2026-09-14, C-9)** — PRD §7.2 / 식별자 문자열 **RECOMMENDED** |
| `DeletionScope` | `session_recording, all_data` | FR-21, §7.8 |
| `DeletionRequestStatus` | `received, processing, completed, failed` | FR-21 |
| `NotificationKind` | `session_invite, short_feedback_ready, report_published, report_deferred_encourage, upload_failed_48h, report_delayed` | FR-08/13/16, §13 |
| `ConsentSource` (Stage 2) | `signup_email, signup_oauth, settings, reconsent` | `docs/DATA_MODEL.md` §5 `consent_events.source` — **RECOMMENDED** (Stage 2 Plan §7.1 · §18-④) |
| `OnboardingStatus` (Stage 2) | `not_started, in_progress, completed` | `docs/DATA_MODEL.md` §5 `caregiver_profiles.onboarding_status` — **RECOMMENDED**. 프로필 결과 확인 상태는 값으로 두지 않는다 (D-6) |
| `Plan` (Stage 2) | `free` | PRD §7.1 "가입 완료 시 Free 플랜 자동 부여" — **RECOMMENDED**. 유료 플랜은 FR-26 (P2) |

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

  // ⭐ Rev 8 (2026-10-13, D4-13 — 사용자 결정, Stage 0 #16 변경): 사용자 주도 녹음 폐기 `Discard` (D4-12)
  // 안 A 확정 — 전이 2행만 추가한다. `AbandonedReason` enum 과 `abandonedReason?` 필드는 만들지 않는다.
  { from: 'recording', to: 'abandoned', actor: 'caregiver', modes: ['recorded'] },  // Discard (녹음 중)
  { from: 'paused',    to: 'abandoned', actor: 'caregiver', modes: ['recorded'] },  // Discard (일시정지 중)
];

export const canTransition = (from: SessionStatus, to: SessionStatus, actor: Actor, mode: z.infer<typeof SessionModeSchema>) =>
  SESSION_TRANSITIONS.some(t => t.from === from && t.to === to && t.actor === actor && t.modes.includes(mode));

// ⚠ 아래 두 상수의 실제 정의 위치는 packages/contracts/src/rules/recording-limits.ts 다 (아래 "구현 반영" 참조).
export const MAX_RECORDED_SECONDS = 30 * 60;   // FR-09 — 실제 녹음 시간 기준, 일시정지 제외 (CONFIRMED #17)
export const READY_ABANDON_SECONDS = 10 * 60;  // §13
```

> **구현 반영 (Stage 1-C)** — 위 스케치와 구현의 차이:
> - `MAX_RECORDED_SECONDS` · `READY_ABANDON_SECONDS` 의 정본 위치는 `rules/session-transitions.ts` 가 아니라
>   **`packages/contracts/src/rules/recording-limits.ts`** 다. `PLANNING.md` §5 Stage 1 · `docs/ARCHITECTURE.md` §1.2 의
>   파일 목록과 맞추기 위한 배치이며, Stage 1 Plan §7.1 · §18-① 에서 확정되었다.
>   `rules/index.ts` 가 세 rules 파일을 함께 re-export 하므로 소비자 코드의 import 경로는 동일하다.
> - `type Actor` 는 `SessionTransitionActorSchema` (`z.enum(['caregiver','server','worker'])`) + `SessionTransitionActor` 타입으로 구현했다.
>   전이 표의 행 타입은 `SessionTransition` 인터페이스다.
> - `SESSION_TRANSITIONS` **12 행**(modes 전개 시 14 조합)과 `canTransition` 은 스케치와 동일하며,
>   `src/__tests__/session-transitions.test.ts` 가 8×8×3×2 = 384 조합 전수 검사로 "표에 없는 전이는 전부 false" 를 보증한다.
>
> ⭐ **Rev 8 설계 변경 (2026-10-13, `D4-13` — 사용자 결정, `Stage 0 #16` 변경)**
>
> | 항목 | 변경 |
> |---|---|
> | 전이표 **행 수** | **12 → 14** (`recording → abandoned` · `paused → abandoned`, actor `caregiver`, modes `['recorded']`) |
> | `SessionStatus` | **8값 유지** — `discarded` 신규 값 **없음**(안 B 미채택) |
> | `AbandonedReason` enum / `abandonedReason?` 필드 | ⛔ **만들지 않는다** (안 A′ 미채택 — plan-agent 는 A′ 를 권고했고 사용자가 **A** 를 택했다) |
> | `CompletedReason` · `UploadStatus` · error code | 신규 **0건**. 허용되지 않은 전이는 기존 `SESSION_INVALID_TRANSITION` 이 처리한다. 폐기 녹음의 upload 는 기존 `deleted` 로 표현된다 |
> | `recordingApi.abort()` | ⛔ **추가하지 않는다** — 서버가 `abandoned` 전이를 받아 part 를 스스로 정리하는 것을 **Handoff 요구사항**으로 둔다 (§5.1.1, `P4-BIP-21`) |
>
> ⚠️ **명시된 귀결** — **방치(ready 10분)와 사용자 폐기(`Discard`)를 구분할 수 없다.** 둘 다 `→ abandoned`·actor `caregiver` 이므로 전이표·`session_events` 만으로는 구별되지 않는다. 따라서 ① **세션 완료율 지표(PRD §2)에서 둘을 분리 집계할 수 없고** ② *"아동 음성 데이터를 사용자가 직접 지운 사건"* 의 Audit 근거가 전이 기록만으로는 남지 않는다. **사유 값 추가는 그 시점의 별도 사용자 결정**이며 Stage 4 에서 선행 구현하지 않는다 (`N4-30`, 이연).
> ⚠️ **Frontend 는 폐기 사유를 보내지 않는다** — 서버가 사유를 남기려면 Frontend 가 보내지 않는 정보(요청 출처·타이머 여부)를 추론해야 한다. 이 사실을 Handoff 에 명시한다.
> **삭제 순서 (불변)**: **서버 전이 확정 응답을 받은 뒤** 로컬을 지운다. 전이 실패 시 로컬 청크를 **보존**하고, 오프라인이면 `SessionOutbox` 에 폐기 전이를 적재한 뒤 전송 확정 전까지 보존한다. `rules/architecture.md` §7 의 *"업로드 확정 전 삭제 금지"* 는 **유실 방지** 규칙이므로 사용자 주도 폐기는 그 규칙이 막으려는 사건이 아니다 — **예외가 아니라 다른 사건**이다.
> ⛔ **구현(이 2행을 `packages/contracts` 에 넣는 것)은 development-agent 가 `S4-B` 에서 한다.** 이 문서는 설계 확정만 기록한다.
>
> ✅ **구현 반영 (Stage 4 `S4-B`, 2026-10-14)**: `rules/session-transitions.ts` 의 `SESSION_TRANSITIONS` 가 **14 행**(modes 전개 **16 조합**)이 되었다. 추가는 위 2 행뿐이며 앞 12 행과 `canTransition()` 은 변경 없음 — `src/__tests__/session-transitions.test.ts` 가 **14 행 전수 스냅샷**(앞 12 행 불변 포함) + 8×8×3×2 전수 검사로 보증한다.

### 3.2 CreateSessionRequest / Transition

> ✅ **구현 반영 (Stage 4 `S4-B`, 2026-10-14)** — `packages/contracts/src/sessions/` 4 파일로 구현되었다. 스케치와의 차이:
>
> | 항목 | 구현 |
> |---|---|
> | `StickerAwardSchema` 위치 | `transition.ts` 가 아니라 **`session.ts`** — `SessionDetail.sticker` 도 쓰므로 순환 import 를 피했다. 소비자 import 경로(패키지 진입점)는 같다 |
> | `StickerAward` 필드 | `{ id, sessionId, stickerType: StickerType, awardedAt, title, message }` — 문구 2 필드는 응답 값(`D4-2`), **`dayCount`·`streakDays` 없음** (섞여 와도 parse 가 버린다). 필드명 `message` 는 Design Spec §2.7.1 `stickerAward.message` 와 맞췄다 |
> | `SessionTransitionRequest.to` | `ClientSessionTransitionTargetSchema = SessionStatusSchema.extract([...4값])` — **새 enum 값이 아니라 `SessionStatus` 부분집합**이다 |
> | `occurredAt` | **필수** (`OccurredAtSchema`) — 스케치와 같다 |
> | `CreateSessionRequest.customTime` | `TimeOfDaySchema.optional()` + **`createCustomTimeRefine()` 재사용**. 팩토리의 입력 타입을 `ReadingContext \| null` 로 넓혔다 (판정 로직 불변) |
> | `SessionDetail` | `SessionSummary` + `recording: RecordingStatus \| null` + `sticker: StickerAward \| null` + `completionBubble: SessionBubbleCopy`(Rev 8.9, 구현 Rev 8.10 — §3.2.3). `reflection` 없음 (Stage 5) |
> | `SessionTransitionResult` | `{ session, completionBubble?: SessionBubbleCopy, stickerAward?: StickerAward \| null }` |
> | `ListSessions` | `CursorPageRequestSchema.extend({ status?: SessionStatus })` · `paginated(SessionSummarySchema)` |
>
> ⭐ **Rev 8 (2026-10-13) — 아래 스케치는 Stage 4 에서 세 파일로 나뉜다** (승인된 `stage-4-plan.md` §7.2. 현재 `packages/contracts/src/sessions/` 디렉토리는 **아직 없다** — **[직독]**)
>
> | 파일 | 담는 것 |
> |---|---|
> | `sessions/create-session.ts` | `CreateSessionRequestSchema` (+ `customTime?`) · `CreateSessionResponseSchema` |
> | `sessions/session.ts` | `SessionSummarySchema` · ⭐ **`SessionBubbleCopySchema`**(아래) · `SessionDetailSchema`(summary + **`RecordingStatus`**(§3.9) + `sticker?`; `reflection?` 는 **Stage 5** — `C4-OPEN-6`) |
> | `sessions/transition.ts` | `SessionTransitionRequestSchema` · `SessionTransitionResultSchema`(`session`·`completionBubble?`·`stickerAward?`) · **`StickerAwardSchema`** (§3.2.1) |
> | `sessions/list.ts` | `ListSessionsRequestSchema`(cursor + `status?`) · `paginated(SessionSummarySchema)` — `C4-OPEN-4` **만든다**(RECOMMENDED) |
>
> ⭐ **`SessionBubbleCopySchema` — 지금 어디에도 정의가 없다** (**[직독]** `grep -rn 'bubble' packages/contracts/src/` → **0건**). Stage 4 에서 **정의로 승격**한다. 설계 스케치:
>
> ```ts
> // packages/contracts/src/sessions/session.ts  (설계 — 구현 확정은 development-agent)
> export const SessionBubbleCopySchema = z.object({
>   // ready 화면 버블(139:2803)의 "제목 줄" 에 그대로 표시된다 (D4-20).
>   // null | '' 이면 제목 줄을 렌더하지 않는다 (D4-22) — Frontend 는 fallback 을 만들지 않는다.
>   // 길이 상한(≤240px @ SF Pro Semibold 16, ≈28자)은 생성 측 요구이며 schema 제약이 아니다 (D4-21).
>   text: z.string().nullable(),
>   templateId: z.string().optional(),   // 검수 템플릿 추적 (FR-10 · P4-BIP-11) — 화면 미표시
>   subtext: z.string().nullable().optional(),  // ⭐ Rev 8.9 (D4-87): 완료 버블 보조 줄 — §3.2.3. key 생략 가능 (D4-94)
> }).nullable();
> ```
>
> **왜 길이를 schema 제약으로 넣지 않는가**: 상한은 **픽셀 폭**(240px @ 특정 폰트)이고 글자 수(≈28)는 **환산 가이드**다. `.max(28)` 을 넣으면 ① 폰트·문자 구성에 따라 **참이 아닌 제약**이 되고 ② 넘치는 응답을 **parse 단계에서 거부해 화면이 비어 버린다**. 대신 **Frontend 는 1줄 clamp 로 잘라 표시**하고(AC-4-120 ⑤), **상한은 Backend 요구사항**(`P4-BIP-11`)으로 넘긴다. `HomeSummary.characterLine` 의 **약 120자** 처리(§3.8 `W-5`, `P3-BIP-16`)와 **같은 선례**다.

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
  prompts: z.array(PromptSchema),                    // Prompt 모아보기 (FR-11) + ready 버블 pill (D4-14/D4-20)
  bubble: SessionBubbleCopySchema,                   // 검수 템플릿 결과 (FR-10) — 렌더 지점·null 거동은 아래 표
  reminderBubble: SessionBubbleCopySchema,           // ⭐ Rev 8.6 (D4-59): ready 5분 리마인드(D4-46) 제목 줄 문구 — §3.2.2
});
export const CreateSessionResponseSchema = z.object({ session: SessionSummarySchema });

export const SessionTransitionRequestSchema = z.object({
  // ⭐ Rev 8 (D4-13): `abandoned` 는 세 경로에서 온다 —
  //   ① ready 10분 클라이언트 타이머  ② 서버 sweeper  ③ 사용자 `Discard` (D4-12)
  //   ⛔ 사유를 구분하는 필드는 없다. 필드 변경 0 — `to` 가 이미 'abandoned' 를 포함한다.
  to: z.enum(['recording', 'paused', 'completed', 'abandoned']),  // client가 요청 가능한 목표 상태만
  occurredAt: z.string().datetime(),
  recordedSeconds: z.number().int().min(0).max(MAX_RECORDED_SECONDS).optional(),
  completedReason: CompletedReasonSchema.optional(),
}).refine(v => v.to !== 'completed' || v.completedReason !== undefined, { path: ['completedReason'] });
```

#### 3.2.1 ⭐ `SessionSummary.bubble` — 렌더 지점과 부재 시 거동 (Rev 8: `D4-20`·`D4-21`·`D4-22`)

> **판정: 신규 contract 항목이 아니다.** `SessionSummary.bubble` · `SessionBubbleCopySchema` 는 **이미 Stage 4 신규 항목**이다 (`stage-4-plan.md` §7.2 — **[직독]** `grep -rn 'bubble' packages/contracts/src/` → **0건**, `sessions/` 디렉토리 자체가 아직 없다). 아래는 그 필드의 **노출 지점과 nullable 거동을 확정**하는 것이다.

| 항목 | 확정 내용 | 근거 |
|---|---|---|
| **렌더 지점** | `bubble` 은 **ready 화면 버블(Figma `139:2803`)의 제목 줄**에 표시된다. 그 아래 **pill 은 `prompts`** 다 — **두 값은 출처가 다르고 섞이지 않는다** | **`D4-20`** |
| Frontend 책임 | ⛔ **문구를 생성·가공·보간하지 않는다** (`rules/architecture.md` §8 · `rules/frontend.md` §8). 템플릿 결합·아이 이름 삽입 **0건**. ⛔ Figma 기본값 **`Try this prompt !` 리터럴을 제품 코드에 넣지 않는다** — **Figma placeholder** 다 | `D4-20`·**`D4-22`** |
| **null / 빈 문자열** | **제목 줄을 렌더하지 않는다.** placeholder·빈 줄·대체 문구 **0건**. 버블 자체는 **렌더되고** 기하는 유지되며 **높이만 28px 짧아진다** (제목 22 + 그 뒤 flex gap 6 이 함께 사라진다 → **`h = 21 + 6n + Σpill`**) | **`D4-22`** |
| ⛔ **Frontend fallback** | **만들지 않는다** — **인사 fallback 은 Backend 책임** (`rules/backend.md` §4) | **`D4-22`** |
| **길이 요구 (Backend)** | 인사 문구는 **≤ 240px @ SF Pro Semibold 16 (≈ 28자)** 여야 한다. Frontend 는 **1줄 clamp(말줄임)** 로 표시하므로 **상한을 넘기면 잘린다**. 2줄이 되면 버블 269 → **291** 로 Record Control 을 **7.6px 침범**한다 | **`D4-21`** |
| **아이 이름 위치 (Backend)** | ⭐ **아이 이름을 문장 끝에 두지 않는다** — clamp 로 잘릴 때 **이름이 먼저 사라진다**. `Sebastian?` **299.50px** · `Alexandria?` **304.58px** > 제목 노드 폭 **297** | **`D4-21`** |
| Handoff | 위 두 줄은 **`P4-BIP-11`**(검수 템플릿 버블 생성 + 안전 슬롯 + 금지어 검증 + fallback) 에 묶여 `ANALYSIS_PIPELINE_REQUIREMENTS` 로 간다 | Plan §10 |

#### 3.2.2 ⭐ `SessionSummary.reminderBubble` — ready 리마인드 문구 (Rev 8.6: `D4-59`, 2026-10-27)

> 근거: 사용자 결정 **`D4-59`** (`docs/decisions/stage-4-approvals.md` §1). 계기: `docs/qa/stage-4b-handoff.md` F1-8 ① — 리마인드 버블 문구 출처가 contract 에 없어 AC-4-46 화면 부분을 구현할 수 없었다 (캐릭터 버블 = API 값만 표시, `rules/architecture.md` §8).

| 항목 | 확정 내용 | 라벨 |
|---|---|---|
| **이름·위치** | `SessionSummary.reminderBubble` — `bubble`(인사) **바로 옆**. 필드는 **필수(required) + nullable** (`optional` 아님 — 응답에 항상 키가 있다) | CONFIRMED (`D4-59`) · 이름 = plan-agent 확정 |
| **모양** | **`SessionBubbleCopySchema` 재사용** = `{ text: string \| null, templateId?: string } \| null`. 결정 원문 예시(`string \| null`)와 달리 객체로 둔 이유: 인사와 **같은 검수 템플릿 경로**(FR-10 · `P4-BIP-11`)이므로 `templateId` 추적이 같아야 하고, 렌더 규칙(null·빈 문자열)을 **한 schema 로 공유**한다 | RECOMMENDED (모양 — 사용자가 `string \| null` 을 원하면 그쪽으로 교체, 화면 거동은 동일) |
| **렌더 지점** | ready 진입 **5분** 시점(`D4-46`, 1회)에 **같은 ready 버블(`139:2803`)의 제목 줄만** `bubble.text` → `reminderBubble.text` 로 교체한다. **pill(`prompts`)은 그대로** (상위 Spec §7 ⑦). 별도 버블·Toast·애니메이션 신설 0 | CONFIRMED (`D4-46`·`D4-59`) |
| **null / 빈 문자열** | ⛔ **리마인드 시각 변화 없음** — 5분 시점에도 제목 줄은 **인사 그대로**(인사도 null 이면 제목 줄 미렌더 상태 그대로, `D4-22`). 대체 문구·fallback·빈 줄 **0건**. 컨트롤러 로직(5분 1회 신호 · 10분 `abandoned`)은 **null 과 무관하게 그대로** 돈다 | CONFIRMED (`D4-59`) |
| **Frontend 책임** | 문구 생성·가공·보간 0 · copy 모듈 상수 0 · 아이 이름 삽입 0 | CONFIRMED |
| **길이 요구 (Backend)** | **`D4-21` 을 그대로 적용한다** — 같은 제목 줄(297×22, 1줄 clamp)에 그려지므로 **≤ 240px @ SF Pro Semibold 16 (≈ 28자)**, 아이 이름은 문장 끝 금지. schema `.max()` 는 **넣지 않는다**(§3.2.1 "왜 길이를 schema 제약으로 넣지 않는가" 와 같은 이유) | CONFIRMED (`D4-21` 적용 판단 — plan-agent) |
| **표시 조건** | `status === 'ready'` 인 동안만 의미가 있다. recording 이후 응답에서도 값은 올 수 있으나 화면은 쓰지 않는다 | RECOMMENDED |
| **Mock 예시 문구** | **`Ready when you are!`** (19자 — 아이 이름 없음, 진단·판정·비교 표현 없음, 영어). ⛔ Figma placeholder(`Try this prompt !`)를 넣지 않는다 | RECOMMENDED (예시 — 제품 문구는 Backend 검수 템플릿) |
| **Handoff** | `P4-BIP-11` 에 **리마인드 템플릿 1종 추가**: 검수 템플릿 생성 + 안전 슬롯 + 금지어 검증 + fallback(Backend 책임) + 위 길이·이름 위치 요구. 세션 생성 응답(`POST /v1/sessions`)과 세션 조회 응답 모두에 채운다 → `ANALYSIS_PIPELINE_REQUIREMENTS` · `BACKEND_HANDOFF` (Stage 8) | BACKEND_INTEGRATION_PENDING |

#### 3.2.3 ⭐ 완료 버블 — `subtext` · `SessionDetail.completionBubble` (Rev 8.9: `D4-87`·`D4-88`, 2026-11-01 · APPROVED 2026-11-02, `D4-94`·`D4-95`·`D4-97`·`D4-98`)

> 근거: 사용자 결정 **`D4-87`·`D4-88`·`D4-94`·`D4-95`·`D4-98`** (`docs/decisions/stage-4-approvals.md` §1), `docs/design/stage-4b-visual-gap-h1.md` 결정 2·3 (`VG-H1-03`·`VG-H1-05`). 계기: Figma `88:929` 보조 줄을 담을 필드가 없었고(최우선 규칙 3), 재진입 시 버블 출처가 없었다 (AC-4-58). **구현 완료 (Rev 8.10, `S4-H1R`).**

```ts
// packages/contracts/src/sessions/session.ts  (Rev 8.10 구현과 같다)
export const SessionBubbleCopySchema = z.object({
  text: z.string().nullable(),
  templateId: z.string().min(1).optional(),
  subtext: z.string().nullable().optional(),   // 완료 버블 보조 줄만 사용
}).nullable();

export const SessionDetailSchema = SessionSummarySchema.extend({
  recording: RecordingStatusSchema.nullable(),
  sticker: StickerAwardSchema.nullable(),
  completionBubble: SessionBubbleCopySchema,   // required + nullable (sticker 선례, C4-OPEN-6)
});
```

| 항목 | 내용 | 라벨 |
|---|---|---|
| **`subtext` 렌더 지점** | 완료 버블(`88:929`) 주 문구 아래 1곳. Figma 예시 `14 min together · sticker earned`. `bubble`·`reminderBubble` 에 값이 있어도 ready 화면은 그리지 않는다 | CONFIRMED (`D4-87`) · 렌더 한정 = RECOMMENDED |
| **`subtext` null / 빈 문자열 / key 없음** | 보조 줄을 렌더하지 않는다. 빈 줄·대체 문구 0 (`D4-22` 와 같은 처리) | CONFIRMED (`D4-87`) |
| **`subtext` key 필수 여부** | `.nullable().optional()` — 공유 schema 라 ready·리마인드 응답에 key 를 강제하지 않는다. key 생략 가능 | CONFIRMED (`D4-94`, `N4B-19` 해소) |
| **`text` 없음 + `subtext` 있음** | 버블 미렌더 — 현행 "주 문구 없으면 버블 없음" 유지 | CONFIRMED (`D4-95`, `N4B-20` 해소) |
| **길이** | 보조 줄은 **줄바꿈 표시(clamp·말줄임 없음)**. 생성 측 상한 **≤ 240px @ SF Pro Regular 13 (≈ 36자)** — 기준은 픽셀이고 글자 수는 환산 가이드다. 넘기면 320 폭에서 2줄이 될 뿐 깨지지 않는다. schema `.max()` 없음 (§3.2 "왜 길이를 schema 제약으로 넣지 않는가") | CONFIRMED (`D4-98`, `N4B-22` 해소) |
| **Frontend 책임** | 문구 생성·가공·보간 0. ⛔ `recordedSeconds` 로 `14 min` 을 조립하지 않는다 (`rules/architecture.md` §8) | CONFIRMED (`D4-87`) |
| **`SessionDetail.completionBubble` 값** | 완료 계열(`completed`·`analyzing`·`analyzed`·`failed`) = 전이 때 고른 문구 그대로, 또는 `null`. 그 밖의 상태(`ready`·`recording`·`paused`·`abandoned`) = `null` | CONFIRMED (필드, `D4-88`) · 상태별 값 = RECOMMENDED |
| **전이 응답과의 관계** | `SessionTransitionResult.completionBubble?` 는 **변경 없음**. 같은 세션에서 전이 응답과 Detail 의 `text`·`subtext`·`templateId` 가 같아야 한다. Frontend 우선순위 = 전이 응답 → Detail | RECOMMENDED |
| **오프라인 제출** | 응답이 없으므로(`result: null`) 버블·스티커 없음 — 현행 수용. 이 필드로 해결하지 않는다 | CONFIRMED (`D4-88`) |
| **`SessionSummary`·목록** | 변경 없음 — 재진입 표시는 `GET /v1/sessions/:sessionId` 만 쓴다 | RECOMMENDED |

**하위 호환**: `subtext` 는 추가 필드로 기존 응답·fixture 가 그대로 parse 된다 (`D4-94`). `SessionDetail.completionBubble` 은 **required 라 key 누락 응답을 거부한다** — 모든 Detail 응답이 key 를 가져야 한다. 운영 Backend 가 없어 외부 호환 영향은 0 이고, 영향은 Mock·테스트 fixture 뿐이다. `HttpSessionApi` 는 schema 로 parse 하므로 코드 변경 대상이 아니다.

**Mock 요구사항**:

| 항목 | 요구 |
|---|---|
| fixture | `MOCK_COMPLETION_BUBBLE.subtext = '14 min together · sticker earned'` (Figma 문자열, `D4-87` 채택 권고안). 고정 문자열이며 세션의 `recordedSeconds` 를 반영하지 않는다 — Frontend 조립이 아니라 Mock 값이다 |
| 상태 | Mock Detail 은 완료 계열에서만 값을 낸다. 내부 레코드가 생성 시점부터 값을 들고 있어도 비완료 세션에는 `null` |
| 일관성 | `subtext` 가 `sticker earned` 를 말하면 그 세션 `sticker` 는 non-null 이어야 한다. `sticker: null` 인 지난 세션 seed 는 `subtext: null` |
| 멱등 | 같은 Idempotency-Key replay · 재조회 모두 같은 값 (AC-4-60) |
| scenario | §5.4 `session-completion` 그룹 — 값은 전이 응답과 Detail 이 공유 |

**Backend Handoff (구현 아님 · BACKEND_INTEGRATION_PENDING)** — 응답 값 생성·보존은 Backend 요구사항이다:

| ID | 요구 | Handoff 문서 |
|---|---|---|
| **`P4B-BIP-02`** | `subtext` 생성: 검수 템플릿 + 안전 슬롯 + 금지어 검증 + fallback (`P4-BIP-11` 확장). 사실과 일치할 것 — 대화 전용·스티커 미지급 세션이 `sticker earned` 를 말하지 않는다. `streak`·`Day N`·집계·비교 표현 금지 (`D-6`, PRD §7.4). **길이 상한 ≤ 240px @ SF Pro Regular 13 (≈ 36자, `D4-98`)**. 쓸 문구가 없으면 `null` | `ANALYSIS_PIPELINE_REQUIREMENTS` · `BACKEND_HANDOFF` |
| **`P4B-BIP-03`** | 완료 버블 보존: `completed` 전이에서 고른 값을 세션 단위로 보존해 `SessionDetail` 에 같은 값으로 반환. 주 문구에 아이 이름이 들어갈 수 있으므로 소유권 확인·RLS·전체 삭제 대상 | `DATA_REQUIREMENTS` · `BACKEND_HANDOFF` |


**`StickerAward` (Rev 8: `D4-2`·`D4-10`)** — `POST /v1/sessions/:sessionId/transitions` 응답의 `stickerAward?` (§4 Stage 4).

| 항목 | 확정 내용 |
|---|---|
| 표시 문구 | **응답 값으로 받는다** — Frontend 가 만들지 않는다. 확정 부제 = **`You read together today`** (`D4-10`) |
| ⛔ 비포함 필드 | **`dayCount` · `streakDays` 를 넣지 않는다** — Figma `29:85` 의 `Day 12 · keep the streak going` 은 **미채택**(`D4-2`, PRD §7.4 "streak 표시하지 않는다" · `D-6` 유지). 허용 차이 **`AD-S4-1`**(`APPROVED 2026-10-13, user`) |
| 멱등성 | 재진입 시 중복 표시 없음 (FR-19) — 같은 요청 replay 가 **같은 응답**을 준다 |

**`readingContext` nullable 범위 (`D-9` / `N4-04`)** — **CONFIRMED (사용자 결정 2026-10-14, `D4-25`)**. 서재 경로는 Reading Context 없이 세션을 시작한다 — `CreateSessionRequest.readingContext` **nullable 유지**, schema 변경 없음. Activity Card 경로의 필수(`D-9`)는 `SelectActivityOptionRequest` 가 소유한다. 녹음 세션은 경로와 무관하게 책이 필요하다(기존 refine). `src/__tests__/sessions.test.ts` 가 서재 경로(`readingContext: null`) parse 를 고정한다.

### 3.3 RecordingUploadInit / Complete

```ts
// packages/contracts/src/recordings/upload.ts
export const RecordingUploadInitRequestSchema = z.object({
  parts: z.array(z.object({
    partNo: z.number().int().min(1).max(20),
    // ⛔ Rev 8.1: 아래 enum 은 D4-23 으로 교체되었다 — 원문 문자열 + container enum (아래 "구현 반영")
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

> ✅ **구현 반영 (Stage 4 `S4-B`, 2026-10-14) — `D4-23` · `D4-24` (사용자 결정 2026-10-14) 로 아래 Rev 8 미결 2건이 해소되었다.** 파일: `packages/contracts/src/recordings/upload.ts` · `status.ts` · `enums/recording-container.ts`.
>
> ```ts
> // RecordingPart (= RecordingUploadInitRequest.parts[])
> partNo:    z.int().min(1).max(RECORDING_PART_NO_MAX /* 20 */),
> mimeType:  z.string().min(1).refine(base ∈ {'audio/webm','audio/mp4'}),  // 브라우저 원문, 정규화 없이 보관
> container: RecordingContainerSchema,                                     // 'webm' | 'mp4'
> bytes:     z.int().positive().max(100 * 1024 * 1024),
> // + superRefine: container 는 mimeType 의 base type 과 일치해야 한다 (webm ↔ audio/webm, mp4 ↔ audio/mp4)
> ```
>
> | 결정 | 구현 |
> |---|---|
> | **`D4-23`** `mimeType` | **`BlobEvent.data.type` 원문 문자열**을 그대로 받는다 — 실측 `audio/webm;codecs=opus`(Chromium) · `audio/mp4; codecs=mp4a.40.2`(WebKit, 세미콜론 뒤 공백). 검증은 **`;` 앞을 잘라 `trim()` 한 base type** 이 `audio/webm` \| `audio/mp4` 인지(`recordingMimeBaseType()` · `recordingContainerForMimeType()`). 대소문자 정규화는 하지 않는다. **`audio/aac` · `audio/m4a` 제거** — 두 엔진 모두 `MediaRecorder` 생성자가 던지는 값이다. ⚠️ **후속 네이티브 단계가 AAC 등 컨테이너를 추가할 수 있다** — 그때 `RecordingContainer` enum 과 `RECORDING_CONTAINER_BASE_MIME_TYPE` 을 함께 늘린다 (`D4-1`, Handoff 명시 대상) |
> | **`D4-24`** `partNo` | **상한 20 유지.** ⚠️ **part 는 연속 녹음 구간(`MediaRecorder` 세션 1개)이며 timeslice 청크가 아니다 — 30분 세션의 청크는 약 1766개다** (spike §9). 정상 녹음 = part 1개, 크래시·인터럽션 재시작마다 +1 |
> | 추가 검증 | 같은 요청 안 `partNo` 중복 금지 (`recording_parts UNIQUE(recording_id, part_no)`) — init · complete · `RefreshUploadTokens.partNos` 공통. 완료 요청의 `partNo` 도 상한 20 |
> | `RecordingUploadComplete` | `sha256` = `^[a-f0-9]{64}$` (`Sha256HexSchema`), 응답 `uploadStatus: z.literal('uploaded')` + `expiresAt` 필수 |
> | 기타 상수 | `RECORDING_PART_BYTES_MAX` = 100 MiB · `RECORDING_TOTAL_DURATION_GRACE_SECONDS` = 60 (`totalDurationSeconds ≤ 1860`) |
>
> ⭐ **Rev 8 (2026-10-13) — 위 두 값은 `S4-A` Web 녹음 spike 결과로 확정한다** (`stage-4-plan.md` §7.4 · §16.1 `S4-A`). **현재 값은 잠정이며 이 문서가 확정하지 않는다.**
>
> | 미결 | 무엇이 걸려 있는가 | 확정 방법 |
> |---|---|---|
> | **`partNo` 상한 `.max(20)`** (`C4-OPEN-1`) | 30분 세션에서 인터럽션·크래시 재시작이 반복되면 part 가 20을 넘을 수 있다. 넘으면 **업로드 자체가 schema parse 로 막힌다** | `S4-A` ④ — 30분 세션의 실제 part 수 측정. 넘칠 가능성이 있으면 **상한을 올리거나 part 병합 규칙**을 둔다 |
> | **`mimeType` 집합** `audio/webm`·`audio/mp4`·`audio/aac`·`audio/m4a` (`C4-OPEN-2`) | 플랫폼 실제 출력과 다르면 parse 실패 | `S4-A` ③ — 데스크톱 Chrome/Safari/Firefox + **iOS Safari** 의 `MediaRecorder.isTypeSupported` 실측. ⭐ **`D4-1` 로 Stage 4 측정 대상은 Web 뿐**이다. ⛔ **enum 을 Web 값으로 닫지 않는다** — 후속 단계의 네이티브 포맷(Capawesome = AAC, Cap-go = 미명시)이 추가될 수 있다. 권장 = **열거형 + 확장 주석**, 또는 Web 값만 넣고 후속 단계 추가를 Handoff 에 명시 |
>
> `S4-A` 산출물에는 **측정 환경(브라우저·버전·OS·기기)과 측정 방법**이 적혀 있어야 한다 — *"보장 불가"* 같은 **문서 인용이 아니라 실측 로그**여야 한다 (`rules/frontend.md` §6-2 ⑤).

### 3.4 Consent · Child Info · Onboarding (C-1 · C-5 · C-6 · C-7 · C-8 · C-9)

결정 내용은 CONFIRMED (사용자 결정 2026-09-14). 필드 이름·인코딩·길이 제한은 RECOMMENDED (Stage 2 Plan에서 확정).

```ts
// packages/contracts/src/enums/consent.ts — C-1, C-4
export const ConsentTypeSchema = z.enum([
  'terms_of_service', 'privacy_policy', 'child_voice_data', 'marketing', 'pilot_participation',
]);
export const ConsentActionSchema = z.enum(['granted']);           // 'revoked' 없음 (C-4)

// packages/contracts/src/consent/documents.ts
export const ConsentDocumentSchema = z.object({
  type: ConsentTypeSchema,
  documentId: z.string().uuid(),
  version: z.string(),
  required: z.boolean(),        // 서버 값. pilot_participation 필수 여부 = 법무 L-02
  title: z.string(),
  url: z.string().url(),
});
export const CurrentConsentDocumentsSchema = z.object({ documents: z.array(ConsentDocumentSchema) });

// packages/contracts/src/auth/sign-up.ts — AuthGateway 입력 (HTTP 아님), C-5
export const SignUpWithEmailInputSchema = z.object({
  caregiverName: z.string().trim().min(1).max(60),
  email: z.string().email(),
  password: z.string().min(8),
}).strict();                    // 아이 필드 없음 — child 정보는 동의 후 온보딩 Step 1

// packages/contracts/src/enums/gender.ts — C-7
export const GenderSchema = z.enum(['girl', 'boy', 'prefer_not_to_say']);

// packages/contracts/src/onboarding/child-info.ts — Step 1 (C-5, C-6, C-10)
export const ChildInfoAnswersSchema = z.object({
  firstName: z.string().trim().min(1).max(40),   // 화면·알림 호칭 (C-6)
  lastName: z.string().trim().max(40),           // 두 번째 칸 (C-6, D-03) — 필수 여부 Stage 2 Plan, 법무 L-07
  birthYearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), // 3~9세 (C-10) — 범위 검증은 clock 주입 refine
  gender: GenderSchema.nullable(),               // 기본 미선택 = null (C-7)
  // languageEnvironment, readingRoutine 등 PRD §7.2 Step 1 나머지 필드 형태는 Stage 2 Plan
});

// packages/contracts/src/onboarding/survey.ts — Step 5 (C-8)
export const SurveyAnswerValueSchema = z.union([
  z.number().int().min(1).max(5),   // 1 Never · 2 Rarely · 3 Sometimes · 4 Often · 5 Almost always
  z.literal('not_observed'),        // "Haven't had the chance to see this yet" — 결측, 점수 아님
]);
export const SurveyItemSchema = z.object({
  itemCode: z.string().regex(/^(ER|AG|CF|IM)\d$/),   // baseline_v1: ER1–2, AG1–3, CF1–2, IM1–3
  capability: CapabilitySchema,
  order: z.number().int(),
  prompt: z.string(),                                 // 문항 문구는 instrument 응답으로 제공 (하드코딩 금지)
});
export const SurveyInstrumentSchema = z.object({
  code: z.literal('baseline_v1'),
  version: z.string(),
  stem: z.string(),                                   // "In the past two weeks…"
  scaleLabels: z.array(z.object({ value: SurveyAnswerValueSchema, label: z.string() })).length(6),
  items: z.array(SurveyItemSchema).length(10),
});
export const CapabilityItemAnswerSchema = z.object({ itemCode: z.string(), value: SurveyAnswerValueSchema });
export const CapabilityItemsAnswersSchema = z.object({
  instrumentCode: z.literal('baseline_v1'),
  answers: z.array(CapabilityItemAnswerSchema).max(10),   // draft = 일부, submit = 10개 전부 (not_observed 포함)
});

// packages/contracts/src/onboarding/steps.ts — 5단계 구성·순서 C-9 CONFIRMED, 식별자 문자열 RECOMMENDED
export const OnboardingStepSchema = z.enum(['child_info', 'temperament', 'books', 'goals', 'capability_items']);

// packages/contracts/src/onboarding/draft.ts — RECOMMENDED (C-12)
// 기기 로컬 전용 draft (Trial·동의 전). 필수 동의 기록 전에는 어떤 endpoint로도 전송하지 않는다.
// 가입 → 동의(C-2) → (VPC 슬롯) 이후 SubmitOnboarding 요청으로 변환해 1회 제출.
export const OnboardingDraftSchema = z.object({
  schemaVersion: z.literal(1),
  instrumentCode: z.literal('baseline_v1'),
  currentStep: OnboardingStepSchema,
  answers: z.object({
    child_info: ChildInfoAnswersSchema.partial().optional(),
    temperament: z.unknown().optional(),        // Step 2–4 answer schema는 Stage 2 Plan
    books: z.unknown().optional(),
    goals: z.unknown().optional(),
    capability_items: CapabilityItemsAnswersSchema.optional(),
  }),
  updatedAt: z.string().datetime(),
}); // 보관 상한·삭제 시점(제출 완료·로그아웃)은 Stage 2 Plan

// packages/contracts/src/rules/capability-score.ts — C-8 (Mock·향후 Backend 공유, Frontend는 응답 값 표시만)
export const scoreCapabilities = (items: SurveyItem[], answers: CapabilityItemAnswer[]) =>
  CAPABILITIES.map(capability => {
    const values = items.filter(i => i.capability === capability)
      .map(i => answers.find(a => a.itemCode === i.itemCode)?.value)
      .filter((v): v is number => typeof v === 'number');                 // not_observed·미응답 제외
    return {
      capability,
      score: values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : null, // 1.0–5.0
      itemCount: values.length,
      missingCount: items.filter(i => i.capability === capability).length - values.length,
    };
  }); // score=null(한 역량 전부 결측) 처리·표시 규칙은 Stage 2 Plan. 반올림 소수 1자리는 RECOMMENDED
```

> **구현 반영 (Stage 2-CONTRACTS, development-agent)** — 위 스케치가 아래 파일로 구현되었다.
> 스케치와 다른 부분은 **Stage 2 Plan §7.1 · §16 의 승인된 결정**이며, 그 근거를 함께 적는다.
>
> | 스케치 | 구현 위치 | 결정 반영 |
> |---|---|---|
> | `ConsentDocument` · `CurrentConsentDocuments` | `src/consent/documents.ts` | `url` 은 외부 링크로 연다 (D-4). `required` 는 서버 값 |
> | `RecordConsents` · `ConsentStatus` | `src/consent/record.ts` | `ConsentItem` 분리, `source: ConsentSource`, `grantedAt` nullable, 순수 함수 `hasAllRequiredConsents(status)` |
> | `SignUpWithEmailInput` | `src/auth/sign-up.ts` | `.strict()` 유지 (아이 필드 혼입 차단 — AC-2-05). 최소 길이는 `PASSWORD_MIN_LENGTH = 8` 상수 |
> | — (신규) | `src/auth/sign-in.ts` · `session.ts` | `SignInWithEmailInput` · `RequestPasswordResetInput` · `UpdatePasswordInput` · `AuthProvider`(google\|apple) · `AuthSession` · `AuthResult` |
> | `ChildInfoAnswers` | `src/onboarding/child-info.ts` | **`lastName` 은 선택** (D-1). `languageEnvironment[]` · `readingRoutine` 추가. 관계·타임존은 **넣지 않는다** (D-16 → `UpdateCaregiver`) |
> | 생년월 범위 검증 | 같은 파일 `createBirthYearMonthSchema(now)` | **clock 주입 팩토리** (D-10). `childAgeInMonths(birthYearMonth, now)` 로 나이 Tag 도 파생. `ChildInfoAnswersSchema` 는 형식만, `createChildInfoAnswersSchema(now)` 가 범위까지 검증 |
> | `SurveyItem` · `SurveyInstrument` · `CapabilityItemAnswer` · `CapabilityItemsAnswers` | `src/onboarding/survey.ts` | 제출용 `CompleteCapabilityItemsAnswers`(10 문항 필수) 추가. 상수 `BASELINE_INSTRUMENT_CODE` · `SURVEY_ITEM_COUNT` · `SURVEY_SCALE_LABEL_COUNT` |
> | (Stage 2 Plan §7.1) Step 2·3·4 | `src/onboarding/temperament.ts` · `books.ts` · `goals.ts` · `options.ts` | PRD §7.2 의 축·항목만 구조화했다. **선택지 코드 목록은 RECOMMENDED** 이며 표시 문구는 `apps/web/src/shared/copy` 가 소유한다 |
> | `OnboardingDraft` | `src/onboarding/draft.ts` | `schemaVersion: 1`, 보관 상한 상수 + 순수 함수 `isOnboardingDraftExpired(updatedAt, now)` (D-3, 30 일). **로컬 전용 — HTTP 아님**. localStorage 키는 contracts 가 아니라 `apps/web` 이 소유한다 |
> | (신규) 단계 저장·제출·상태 | `src/onboarding/answers.ts` · `state.ts` · `save-step.ts` · `submit.ts` | `SaveOnboardingStepRequest` 는 `step` 기준 discriminated union(부분 저장 허용 — FR-03), `SubmitOnboardingRequest` 는 5 단계 전체 + 10 문항 전부. `createSubmitOnboardingRequestSchema(now)` 가 나이 범위까지 본다 |
> | `scoreCapabilities` | `src/rules/capability-score.ts` | 산식 동일(소수 1 자리, `not_observed`·미응답 제외, 전부 결측이면 `score: null`). **D-2 반영 순수 함수 추가**: `selectStrengths` · `selectGrowingEdges` · `suggestGrowthCapability` · `capabilityHighlightCount` — `score: null` 역량을 강점·growing edge·발전 역량 후보에서 제외하고, 한 역량이 강점과 growing edge 에 동시에 들어가지 않게 한다. 동점은 역량 선언 순서로 **결정적으로** 깬다 |
> | (신규) 프로필 | `src/children/child.ts` · `snapshot.ts` · `persona.ts` · `profile.ts` · `growth-capability.ts` | `CapabilityScore.score` nullable + `itemCount` · `missingCount`(D-2 ①). `ChildProfile.strengths` · `growingEdges` 는 `.max(2)` — 결측이 많으면 개수가 줄어든다 |
> | (신규) Me | `src/me/me.ts` · `update-caregiver.ts` | `plan` 은 **최상위 1 곳**에만 둔다(§4 Stage 2 표 기준). Stage 2 Plan §7.1 이 `caregiver.plan` 과 최상위 `plan` 을 함께 적었으나 같은 값을 두 곳에 두지 않는다 |
> | (신규) 책 검색 | `src/books/search.ts` | `BookSummary{id, title, author, coverUrl?}` + `SearchBooksRequest`(q + cursor) / `SearchBooksResponse` = `paginated(BookSummary)` (D-17 최소 범위) |
>
> - 시간이 필요한 검증은 전부 **clock 주입 팩토리·순수 함수**다. `Date.now()` · `new Date()` 직접 호출이 없다 (D-10).
> - 런타임 의존은 여전히 `zod` 하나이며 `pnpm lint:boundaries` 가 강제한다.
> - Mock Adapter · Query hook · 화면은 이 Step 범위가 아니다 (Stage 2 후속 Step).

---

> **구현 반영 (Stage 2-ONBOARDING, development-agent)** — 결정 **D-A · D-B · D-C**
> (`docs/decisions/stage-2-approvals.md` §8) 에 따라 온보딩 문항·선택지가 확정되었다.
> 근거 문서: `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` ("The Questionnaire" Q1~Q5).
>
> | 변경 | 구현 위치 | 내용 |
> |---|---|---|
> | **신규 `OnboardingInstrument`** | `src/onboarding/instrument.ts` | `{code, version, questions: ChoiceQuestion[], survey: SurveyInstrument}`. `GET /v1/onboarding` 이 내려주는 **문항 집합 전체**다. `ChoiceQuestion{questionId, step, order, selection(single\|multi), maxSelections?, required, prompt?, description?, options[{code, label?, exclusive?}]}` |
> | **instrument 참조** | 같은 파일 `InstrumentRefSchema` | `SubmitOnboardingRequest.instrument` · `OnboardingDraft.instrument` 가 `{code, version}` 을 담는다. 문항이 바뀐 뒤 **과거 응답 해석은 Backend 책임**이다 (`P2-BIP-06`) |
> | **저장 위치 매핑** | 같은 파일 | `readChoiceAnswer` · `applyChoiceAnswer` · `toggleChoiceSelection` · `pruneUnknownChoiceAnswers` — 전부 순수 함수. 선택지 코드는 문항별 schema 로 parse 되므로 instrument 가 모르는 값이 저장되지 않는다 |
> | **Step 2 교체 (Q1·Q4)** | `src/onboarding/temperament.ts` | 4축(활동성·낯가림·집중·선호활동) → **관찰 가능한 2문항**: `storyComfort`(Q1 — `quiet_gentle`·`some_adventure`·`wild_ride`·`depends_on_the_day`) · `readAloudBehavior`(Q4 — 5값). 질문지가 "temperament profiling 은 온보딩에서 하지 않는다" 로 범위를 제한한 결과다. 둘 다 선택(D-C) |
> | **Step 3 주제 교체 (Q3)** | `src/onboarding/options.ts` | `TOPIC_TAG_CODES` → `narrative`·`inquiry`·`artistic`·`social`·`not_sure_yet` (engine `interest_weight.<code>`). `not_sure_yet` 은 `exclusive`. 상한 `TOPIC_TAGS_MAX = 2` (Q3 "up to 2"). 필드명 `topicTags` 는 `DATA_MODEL` §5 와 맞춰 유지 |
> | **Step 4 = 4대 역량 (D-B, Q2)** | 같은 파일 | `GrowthGoalSchema = CapabilitySchema`, `GROWTH_GOAL_CODES = CapabilitySchema.options`. 별도 enum 을 두지 않아 두 목록이 갈라질 수 없다. 상한 `GROWTH_GOALS_MAX = 2` |
> | **Baseline 구조 상수** | `src/onboarding/survey.ts` | `BASELINE_ITEM_BLUEPRINT`(itemCode·capability·order, **문구 없음**) · `BASELINE_ITEM_CODES`. 문항 **문구**는 여전히 instrument 응답 값이다 (AC-2-24) |
> | **draft 형식 변경** | `src/onboarding/draft.ts` | `instrumentCode: 'baseline_v1'` → `instrument: {code, version}`. 로컬 전용이라 HTTP 계약에 영향이 없다 |
>
> **표시 문구는 contracts 에 없다.** 선택지·문항 문구는 `apps/web/src/features/onboarding-survey/copy.ts` 가
> 코드로 조회한다 (D-A 구조 제약 ①). 서버가 `label`·`prompt` 를 내려주면 그쪽이 우선한다 —
> 클라이언트 릴리스 없이 선택지를 바꾸기 위한 경로이며, **새 코드를 추가할 때는 `label` 을 함께
> 내려야 한다** (그렇지 않으면 화면이 그 선택지를 그리지 않는다 — 사용자에게 machine key 를
> 노출하지 않기 위해서다).

### 3.5 Report Eligibility Rules (#17)

```ts
// packages/contracts/src/rules/report-eligibility.ts — CONFIRMED (사용자 결정 2026-09-14, #17)
export const MIN_REPORT_RECORDED_SESSIONS = 3;
export const MIN_REPORT_RECORDED_SECONDS = 3600;   // 누적 녹음 1시간 (PRD §7.7)
export const REPORT_CYCLE_DAYS = 28;               // 첫 세션 완료일부터 28일 단위 반복

// 집계 입력: mode='recorded' && analysisOutcome !== 'excluded_low_quality' 인 세션만 (#17-③)
// recordedSeconds = 실제 녹음 시간 (일시정지 제외, 세션당 ≤ MAX_RECORDED_SECONDS) (#17-②)
export const isReportEligible = (p: { recordedSeconds: number; recordedSessions: number }) => {
  const minutesOk = p.recordedSeconds >= MIN_REPORT_RECORDED_SECONDS;
  const sessionsOk = p.recordedSessions >= MIN_REPORT_RECORDED_SESSIONS;
  return minutesOk && sessionsOk ? 'eligible'
    : !minutesOk && !sessionsOk ? 'insufficient_both'
    : !minutesOk ? 'insufficient_recorded_minutes' : 'insufficient_recorded_sessions';
};
// 미결 (Stage 7 Plan): 대화 전용 세션이 주기 시작일(첫 세션 완료일)에 포함되는지, 시간대 경계, cycle_in_progress 판정 시점
```

> **구현 반영 (Stage 1-C)**: `packages/contracts/src/rules/report-eligibility.ts` 에 상수 3 종 + 순수 함수
> `isReportEligible(input: ReportEligibilityInput): ReportEligibility` 로 구현했다.
> 이 함수는 위 스케치와 마찬가지로 **`cycle_in_progress` 를 반환하지 않는다** — 주기 경과 판정은 날짜 계산이 필요하고
> 판정 시점 규칙이 위 "미결" 항목이므로, 호출부(Stage 7)가 이 결과와 결합한다.
> 경계 케이스(3599/3600초 × 2/3세션)는 `src/__tests__/report-eligibility.test.ts` 가 보증한다.

---

### 3.6 Prompt 표시 필드 · Activity Card Option (Stage 3 — D-4 · D-5 · D-8 · N-2 · **D-21 · D-22** 반영)

> 근거: `docs/decisions/stage-3-approvals.md` §3 (**D-4 · D-5**, 2026-09-29) · §6.1 (**N-2**, 2026-10-01) · §8 · §8.1 (**D-8**, 2026-10-02) · **§9 · §9.1 (D-21 Prompt 개수 상한 해제 · D-22 `targetCapability` 삭제, 2026-10-03)**.
> 세 결정 모두 §2 **PRD ↔ Figma 우선순위 원칙**(Figma 우선 + 지점별 승인)으로 **PRD 를 뒤집은 것**이며, 어긋나는 PRD 항목은 `stage-3-approvals.md` §5 **PRD 수정 대상**에 등재되어 있다. Stage 3 Plan 권장안(§16 D-8 = "넣지 않는다")은 **기각**되었다.

```ts
// packages/contracts/src/prompts/prompt.ts (설계 스케치 — 실제 정의는 packages/contracts)
export const PromptSchema = z.object({
  id: z.string().uuid(),
  kind: PromptKindSchema,                                  // question | follow_up
  text: z.string().min(1),
  order: z.number().int().min(0),
  // ── D-8 (CONFIRMED 2026-10-02) — Figma `PRE` / `POST` 배지, `P.6` 페이지 참조
  phase: z.enum(['pre', 'post']).nullable().optional(),    // 읽기 전 / 읽은 후
  pageRef: z.string().nullable().optional(),               // 표시 문자열 (예: "P.6")
});
```

| 규칙 | 내용 |
|---|---|
| **optional 인 이유** | 전환기에 값이 없는 Prompt 가 섞여도 화면이 깨지지 않게 한다 (§8.1). 서버가 값을 못 내려주는 상태에서도 계약이 성립해야 한다 |
| **표시 전용** | Frontend 는 `phase`·`pageRef` 를 **생성·추론·가공·재포맷하지 않는다** (`rules/frontend.md` §8). 값이 없으면 배지를 **렌더하지 않는다** |
| **라벨** | `PRE`/`POST` 라벨 문구와 페이지 표기는 **copy 모듈**에 둔다. enum 값을 화면에 그대로 출력하지 않는다 |
| **`phase` 값 집합** | `'pre' \| 'post'` 만. §6 G-03 의 과거 후보 `'during'` 은 **Figma 근거가 없어 채택하지 않았다** |
| **`pageRef` 타입** | `string`. 과거 후보 `number` 는 `"P.6"`·`"pp. 6–7"` 같은 표기를 담을 수 없어 채택하지 않았다 — **표기 책임을 서버/콘텐츠에 둔다** |
| **Mock** | fixture 가 두 값을 **결정적으로** 채워 화면에 실제로 표시되게 한다 (Stage 3 Plan AC-3-80 · AC-3-81) |
| **Backend (`BACKEND_INTEGRATION_PENDING`)** | `phase` 판정 로직 = **`P3-BIP-13`** · `pageRef` 책별 페이지 앵커 데이터(큐레이션 20권 **페이지 메타가 없으면 생성 불가** → **콘텐츠 제작 범위**) = **`P3-BIP-14`** (Stage 3 Plan §10 → Stage 8 Handoff 1:1 이월) |

```ts
// packages/contracts/src/activity/option.ts (설계 스케치)
export const ActivityCardOptionSchema = z.object({
  id: z.string().uuid(),
  position: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  kind: ActivityOptionKindSchema,                 // book | reread_book | conversation_only
  book: BookSummarySchema.nullable(),
  userEnteredBook: z.object({ title: z.string(), author: z.string().optional() }).optional(),
  reason: z.string().min(1),                      // 추천 이유 1–2문장 (서버 생성 문구)
  coachingLine: z.string().min(1),                // 부모용 코칭 문장 (서버 생성 문구)
  capability: CapabilitySchema,                   // D-5 — option 별 역량 (카드 단위 1개가 아니다)
  promptPreview: z.array(PromptSchema).min(1),    // D-4 — 책 선택 *전* 카드에 노출. D-21 — .max() 없음
});
```

| 규칙 | 내용 |
|---|---|
| **`capability`** (D-5) | 덱 **카드마다 다른 역량**(CONFIRMED). 화면 배지는 option 값을 쓴다. **카드 단위 `ActivityCard.targetCapability` 는 삭제한다** — **D-22 (CONFIRMED 2026-10-03, §9)**: `D-5` 로 역량이 option 단위가 되어 카드 단위 대표 역량의 사용처가 없다 (`N-3` 과 같은 귀결). PRD §7.4·§8.3(하루 1개 + 날짜 단위 순환)과 충돌 → **PRD 수정 대상 §5-2**, §8.3 순환 규칙은 **추천 엔진 Backend 요구**(`P3-BIP-02`) |
| **`capability`** 표기 | 역량 **라벨만** 표시한다. `" Day"` suffix 는 폐기(**N-3**, §6). Figma `163:2648` 의 `"Emotion Day Day"`(M-13)는 오타이므로 계약·화면에 옮기지 않는다 |
| **`promptPreview`** (D-4) | 선택 **전** 카드에 노출. PRD FR-07·§7.4("책 선택 후 제시")와 충돌 → **PRD 수정 대상 §5-1** |
| **`promptPreview` 길이** (N-2 · **D-21**) | **상한 없음 — `.max(3)` 를 두지 않는다. `.min(1)` 만 둔다**(빈 세트는 화면이 성립하지 않는다; `.min(2)` 로 올리지 않는다 — 서버가 1개만 내려주는 상황을 parse 실패로 만들 근거가 없다). 서버가 더 많이 내려줄 수 있고 **Frontend 는 `slice` 하지 않는다**. 접힌 상태 표시 개수 3은 **cutoff 이며 cap 이 아니다** — 나머지는 확장·키보드로 도달한다. PRD FR-07·§8.2 의 "2~3개"는 **표시 개수로만 유지되고 상한으로는 성립하지 않는다** → PRD 수정 대상 §6.2-4 · §9.3-6. 검증 = Stage 3 Plan **AC-3-17** |
| **선택 후 `promptSet`** | `POST …/selection` 의 `ActivityCardSelection.promptSet` 은 그대로 유지된다 (선택 전 preview ↔ 선택 후 set 은 별개 필드) |
| **`promptSet.questions` 길이** (**D-21**) | `promptPreview` 와 **동일 규칙** — `.min(1)`, **상한 없음**, Frontend `slice` 금지. "책별 최소 6개 · 제시 2~3개"(PRD §8.2)는 **Backend 생성 정책**이며 **Frontend 검증 조건이 아니다** (Stage 3 Plan `P3-BIP-03`) |

### 3.7 `★ Save` — Saved Book (Stage 3 Home 재대조 신규, `A-9`)

> 근거: Figma `I86:438;86:383;117:973` = `Button/White` **87×45** (아이콘 14×13 + 라벨 `Save`, 레이어명 `Save to my shelf`). 같은 ActionBar 가 Library 시트 `163:2347` · Book Select `145:1085` 에도 있고, 저장 결과 표면은 `145:1157` **"My Saved"** 다.
> 사용자 결정: **"현재 카드를 Library 의 favorites 에 저장한다"** (`docs/decisions/stage-3-approvals.md` §12.8 `A-9`, 2026-10-05). 이 결정으로 `D-7` 의 **`★ Save` 제외 부분만** 무효가 되고, 평점(`averageRating`) · reading plan 제외는 **그대로 유효**하다 (approvals §12.9).
> 이 절은 **설계 수준**이다. 구현으로 확정된 contract 반영은 development-agent 소관이다 (`rules/workflow.md` §5).

#### 3.7.1 온보딩 `favoriteBooks` 와 같은 데이터인가 — **판정: 다른 데이터, 같은 집계 표면**

| 비교축 | 온보딩 `favoriteBooks` (`BooksAndInterestsAnswers`) | `★ Save` |
|---|---|---|
| 의미 | **아이가 이미 좋아하는 책** — 설문 응답(과거/기지의 사실) | **이 추천을 나중에 쓰겠다** — 보호자의 선택 행위(미래 의도) |
| 소유 | `onboarding_answers.books_and_interests` = **제출된 설문 스냅샷**. 수정 경로는 프로필 갱신(Stage 6) | `child_books` 행 = 서재 데이터. 수정 경로는 Library |
| 상한 | **최대 5** (`FAVORITE_BOOKS_MAX`, PRD §7.2 Step 3 "최대 5권" = 설문 instrument 제약) | **상한 없음** (RECOMMENDED) — Figma `Save` 버튼에 카운터·상한 표시·상한 안내가 **없다** |
| 모양 | `bookId` optional + `title` optional (검색이 없어 제목만 들어올 수 있다 — approvals §11.13) | 카탈로그 책은 `bookId`, 보호자 직접 입력 옵션은 `userEnteredBook{title, author?}` |
| 소비자 | cold-start 추천 state vector (`P3-BIP-02`) | 서재 표시 + (향후) 추천 신호 |

**판정 (RECOMMENDED — 승인 필요)**: **재사용하지 않는다.** 근거는 다음 4가지다.

1. **스냅샷 오염** — Home 의 Save 가 `favoriteBooks` 를 쓰면 **제출 완료된 설문 응답을 사후에 고쳐 쓴다.** cold-start state vector 의 출처 추적이 깨지고, 온보딩 응답 수정은 Stage 6(프로필 갱신) 범위다.
2. **상한 충돌** — 5권째 이후 Save 가 `VALIDATION_FAILED` 로 막힌다. 그 상한을 알리는 UI 가 **Figma 에 없으므로** 최우선 규칙 2(없는 것을 만들지 않는다)에 걸리거나, 아무 반응 없는 버튼이 된다.
3. **의미 충돌** — "이미 좋아하는 책"과 "저장해 둔 추천"은 추천 엔진이 **다르게 소비해야 하는 신호**다. 한 배열에 합치면 Backend 가 둘을 구분할 수 없다.
4. **기존 모델이 이미 분리를 전제한다** — `child_books.source` 에 **`onboarding_favorite`** 값이 있다. 즉 온보딩 favorites 는 서재로 **파생되어 들어오는 입력**이고, 서재가 집계 표면이라는 설계가 이미 있다.

**같은 표면에서 만난다**: 둘 다 `child_books` → `LibraryBook` 으로 나타난다. `★ Save` 는 **새 테이블을 만들지 않고** `child_books` 에 **`saved` 축을 추가**한다.
`ownership`(`owned`·`gifted`·`gift_pending`·`favorite_only`)에 값을 더해 표현하지 **않는다** — 보유 중인 책도 저장될 수 있어 **두 축이 독립**이고, `favorite_only` 를 재사용하면 "아이가 좋아하는 책"과 "보호자가 저장한 책"이 다시 섞인다.

#### 3.7.2 무엇을 저장하는가 — **선택된 옵션의 책** (RECOMMENDED)

Figma 버튼은 **카드(옵션) 의 ActionBar** 안에 있고, 같은 ActionBar 가 책 1권만 보여 주는 Library 시트·Book Select 에도 동일하게 쓰인다. 저장 결과 표면 `145:1157` 도 **"My Saved" = 책 목록**이다.

| 선택지 | 판단 |
|---|---|
| **책을 저장한다** (RECOMMENDED) | Figma 의 결과 표면(책 목록)과 일치. 기존 `child_books` 로 표현된다. 신규 도메인 0 |
| 카드/옵션을 저장한다 (저장된 추천) | **채택하지 않는다** — `activity_card_options` 를 가리키는 새 도메인이 필요하고, 카드는 **하루 단위로 사라지는 자원**(`UNIQUE(child_id, card_date)`)이라 저장된 항목이 만료된다. 그 만료 UX 가 Figma 에 없다 |

**책이 없는 옵션**: `kind=conversation_only` 는 `book`·`userEnteredBook` 둘 다 없다 → **저장 대상이 없다.** Figma 에 그 카드의 ActionBar 변형이 없으므로 **NEEDS DECISION** (버튼 비활성 / 미렌더 — §6 `G-12`).

#### 3.7.3 Schema (설계 — 구현 확정은 development-agent)

```ts
// packages/contracts/src/library/saved-book.ts (설계안)
export const SaveBookTargetSchema = z.union([
  z.object({ bookId: IdSchema }),
  z.object({ title: z.string().trim().min(1).max(BOOK_TITLE_MAX_LENGTH),
             author: z.string().trim().min(1).max(120).optional() }),
]);                                   // AddOwnBookRequest 와 같은 판별 구조 — 중복 선언이 아니라 공용화 대상

export const SaveBookRequestSchema = z.object({ target: SaveBookTargetSchema });

// 응답은 신규 타입을 만들지 않고 LibraryBook 을 돌려준다 (서재 목록 갱신에 그대로 쓰인다)
// LibraryBookSchema 에 필드 2개 추가 (비파괴):
//   saved: z.boolean()
//   savedAt: IsoDateTimeSchema.nullable()
```

| 항목 | 규격 | 라벨 |
|---|---|---|
| Endpoint | `PUT /v1/children/:childId/saved-books` (저장) · `DELETE /v1/children/:childId/saved-books/:bookId` (해제) | RECOMMENDED |
| 응답 | `LibraryBook` (저장으로 행이 새로 생길 수 있으므로 **생성·갱신 모두 같은 표현**을 돌려준다) | RECOMMENDED |
| 멱등성 | `PUT` = **자원 상태 설정**이므로 같은 책을 다시 저장해도 **같은 응답·같은 `savedAt`** 을 돌려준다. `POST` 가 아니므로 **Idempotency-Key 를 요구하지 않는다** (`POST …/library/books` · `POST …/gift-requests` 와 다른 점) | RECOMMENDED |
| 중복 저장 | 오류가 아니다. 신규 error code **0건** — `RESOURCE_NOT_FOUND`(없는 `bookId`) · `VALIDATION_FAILED` 만 쓴다. Error Code 28종 유지 | **CONFIRMED (28종 유지 원칙)** / 매핑 RECOMMENDED |
| 해제(토글) | **contract 는 양방향을 지원한다**(`PUT`/`DELETE`). 다만 **Home 버튼이 토글인지는 Figma 근거가 없다** — `Button/White` 에 saved(채움) 변형이 없다 → **NEEDS DECISION** (§6 `G-13`) | **NEEDS DECISION** |
| `LibraryFilter` | `owned`·`gifted`·`history` + **`saved`** 추가 (RECOMMENDED) — "My Saved" 표면이 이 필터로 성립한다. Library 라운드에서 사용 | **RECOMMENDED** |
| `BookSource` | `onboarding_favorite`·`library_add`·`gift_program` + **`card_save`** 추가 (RECOMMENDED) — Save 로 행이 처음 생기는 경로를 `library_add`(보호자가 보유 책을 등록, FR-23)와 구분한다 | **RECOMMENDED** |

#### 3.7.4 초기 상태 표시 — 미해결 (`G-14`)

`ActivityCardOption` 에는 `saved` 가 없다. 그래서 **어제 저장한 책이 오늘 카드에서 저장 안 된 것처럼 보인다.**

| 선택지 | 영향 |
|---|---|
| **ⓐ 서버 상태를 반영하지 않는다** (fire-and-forget + Toast, RECOMMENDED) | Figma 에 saved 변형이 없으므로 최우선 규칙에 가장 가깝다. contract 변경 0. 단 재방문 시 상태가 보이지 않는다 |
| ⓑ `ActivityCardOption.saved: boolean` 추가 | 비파괴 확장이지만 **Figma 에 없는 시각 상태**를 만들어야 한다 → 승인 필요. 카드 응답에 서재 조인이 생겨 2초 NFR(`P3-BIP-10`)에 영향 |
| ⓒ `BookSummary` 에 `saved` 추가 | **채택하지 않는다** — Stage 2 `BookSummary` 불변 원칙(Stage 3 Plan `AC-3-55`) 위반 |

**어느 안이든 해제 경로는 Library 라운드에 있어야 한다** — Home 에만 저장이 있고 해제가 어디에도 없으면 보호자가 자기 데이터를 되돌릴 수 없다.

### 3.8 `HomeSummary.characterLine` 길이 — Backend 요구사항 (`W-5`)

근거: 사용자 결정 2026-10-06 (`docs/decisions/stage-3-approvals.md` §13.3, Visual Gap `W-5`).

| 항목 | 규격 | 라벨 |
|---|---|---|
| 필드 | `HomeSummary.characterLine` (`packages/contracts/src/home/summary.ts`) | CONFIRMED |
| **길이 요구** | 서버는 **약 120자 이내**로 보낸다 | **REQUIREMENT (Backend)** |
| Schema 제약 | **걸지 않는다.** `z.string().nullable()` 을 유지한다 | **CONFIRMED** |
| Frontend 동작 | 길이와 무관하게 **4줄에서 말줄임**한다 (`SpeechBubble clampContent`, Tier 3 `--bubble-content-max-lines`) | CONFIRMED |

**왜 Zod `.max()` 를 쓰지 않는가** — `characterLine` 은 **응답** 필드다. 응답에 길이 제약을 걸면
Backend 가 121자를 보내는 순간 `HomeSummarySchema.parse` 가 던지고 **Home 전체가 빈 화면**이 된다.
말줄임으로 degrade 하는 것보다 나쁜 실패다. 그래서 제약은 **문서 요구사항으로만** 남기고
런타임은 UI 가 흡수한다.

**120 의 근거와 그 성격**

| 값 | 성격 |
|---|---|
| 캐릭터 **눈 상단 y=183** | **실측** (렌더 픽셀 경계) |
| 버블 높이 `20n+42`, 본체 하단 `51+높이` → 4줄 **173**(여유 10) / 5줄 **193**(눈을 덮는다) | **실측 기반 계산** |
| **"1줄 ≈ 30자"** → 4줄 ≈ 120자 | ⚠ **추정** (design-agent 환산, `stage-3-home-figma-audit.md` §21). 폰트·문자 구성에 따라 달라진다 |

즉 **확정된 것은 "4줄을 넘으면 캐릭터 얼굴을 덮는다"** 이고, 120자는 그 4줄을 글자 수로 옮긴
**가이드 값**이다. Backend 는 120 을 하드 제한이 아니라 **생성 프롬프트의 길이 가이드**로 쓴다.

Stage 8 Handoff 대상: `BACKEND_HANDOFF.md` (`GET /v1/children/:childId/home` 응답 제약) ·
`ANALYSIS_PIPELINE_REQUIREMENTS.md` (생성 문구 길이 가이드). 추적 ID **`P3-BIP-16`**.

### 3.9 ⭐ `RecordingStatus` — `recordingApi.status` 응답 (Rev 8 신설, 2026-10-13)

> **왜 신설하는가**: §5.1.1 이 `recordingApi` 의 메서드로 **`status`** 를 선언하고 §4 Stage 4 표가 `SessionDetail` 에 *"recording upload status"* 를 요구하는데, **§3 에 그 응답 스케치가 없었다** (`stage-4-plan.md` §7.5-4). Mock·Http Adapter·`UploadQueue` 가 같은 모양을 봐야 한다.
> **설계 스케치다.** 필드 이름·optional 범위의 **확정은 development-agent** (`S4-C`/`S4-E`).
> ✅ **구현 반영 (Stage 4 `S4-B`, 2026-10-14)**: 아래 스케치 그대로 `packages/contracts/src/recordings/status.ts` 에 구현했다. 검토 후보 2건(`sessionStatus` · 업로드 진행률)은 **넣지 않았다** — `S4-C`/`S4-E` 가 필요를 판정한다.

```ts
// packages/contracts/src/recordings/status.ts  (설계 — 구현 확정은 development-agent)
// 필드 목록은 승인된 stage-4-plan.md §7.2 의 `recordings/status.ts` 행과 같다.
export const RecordingStatusSchema = z.object({
  recordingId: z.string().uuid(),
  uploadStatus: UploadStatusSchema,                  // pending | uploaded | failed | deleted | expired (§2.2, #16)
  partCount: z.number().int().min(0),
  expiresAt: z.string().datetime().nullable(),       // 원본 90일 만료 안내 (§7.8 보관 정책) — deleted/expired 면 null
  deletedAt: z.string().datetime().nullable().optional(),
});
// Errors: RESOURCE_NOT_FOUND, RECORDING_DELETED, FORBIDDEN
```

| 설계 판단 | 내용 |
|---|---|
| **클라이언트 큐 상태를 넣지 않는다** | `UploadQueue` 의 `local_only…stalled_48h` 는 **contracts 가 아니라 `features/recording` 내부**다 (§2.2 `UploadStatus` 행과 동일 원칙). `RecordingStatus` 는 **서버가 본 사실**만 담는다 |
| **폐기된 녹음** | `Discard`(`D4-13`) 후 조회하면 `uploadStatus = 'deleted'` — **신규 값 0건**이다. ⛔ **사유는 담기지 않는다** (`N4-30` 이연) |
| ⏳ **검토 후보 2건 (이 문서가 확정하지 않는다)** | ① **`sessionStatus`** — `invalid-transition` 시 클라이언트가 **서버 상태로 되돌아올 기준**이 필요한데, 현재는 `GET /v1/sessions/:sessionId` 를 따로 불러야 한다. ② **업로드 진행률**(`uploadedParts` 등) — `partCount` 만으로는 *"몇 개가 올라갔는지"* 를 서버 기준으로 알 수 없다. **둘 다 development-agent 가 `S4-C`/`S4-E` 에서 실제 필요 여부를 판정**하고, 넣기로 하면 **이 절과 Plan §7.2 를 함께 갱신**한다 |

---

## 4. Endpoint Groups by Stage

표기: Request/Response는 contracts schema 이름(`…RequestSchema` / `…ResponseSchema` 접미사 생략). **IK** = Idempotency-Key 필수. **CG** = `child_voice_data` 동의 가드.

### Stage 1 — Foundation

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/health` | — | `Health` | — | 기술 요구사항 |

Stage 1에서 contracts에 확정할 것: `common/*`(ErrorEnvelope, ErrorCode, Pagination), 모든 §2 enum, `rules/session-transitions`, `rules/report-eligibility` (§3.5, #17), `rules/recording-limits`. (`rules/capability-score` 와 onboarding schema §3.4는 Stage 2)

> **구현 반영 (Stage 1-C, 2026-09-20)** — 위 범위가 `packages/contracts` 로 구현 완료되었다.
>
> | 항목 | 구현 위치 |
> |---|---|
> | ID · 시간(`occurredAt`) · Pagination | `src/common/id.ts` · `datetime.ts` · `pagination.ts` |
> | Error Code 28 종 + HTTP status 매핑 | `src/common/error-codes.ts` |
> | Error Envelope · `HaruApiError` | `src/common/error-envelope.ts` |
> | enum 23 종 | `src/enums/*.ts` (20 파일) |
> | 전이 표 12 행 · `canTransition` | `src/rules/session-transitions.ts` |
> | 녹음 상한 상수 | `src/rules/recording-limits.ts` |
> | 리포트 발행 기준 · `isReportEligible` | `src/rules/report-eligibility.ts` |
> | `Health` | `src/health/health.ts` — `HealthResponseSchema` = `{ status: 'ok', version: string, serverTime: IsoDateTime }` |
>
> - `GET /v1/health` 는 **공개 endpoint** 이며 Idempotency-Key·동의 가드가 필요 없다. Key errors = `INTERNAL_ERROR`, `RATE_LIMITED`.
> - contracts 의 런타임 의존은 `zod@4.6.5` **하나뿐**이며 `pnpm lint:boundaries`(dependency-cruiser
>   `contracts-runtime-deps-zod-only` · `contracts-no-workspace-deps`)로 강제된다.
> - `healthApi` interface · `MockHealthApi` · `HttpHealthApi` · Mock scenario 는 **Stage 1-D1** 범위다 (아직 없음).

### Stage 2 — Auth · Consent · Onboarding · Child Profile

Auth 자체(가입·로그인·비밀번호 재설정·OAuth)는 HTTP API가 아니라 **`AuthGateway` interface** 로 다룬다 (ARCHITECTURE §7). Stage 2–3은 Web `MockAuthGateway`, Stage 4에 네이티브 provider Adapter 추가 (#7). Supabase Auth Adapter는 Backend 연동 시점 또는 사용자 승인 후 추가한다 (Supabase JS Client 미사용 — CONFIRMED #27).

- **가입 입력 (CONFIRMED C-5)**: `SignUpWithEmailInput` = `{ caregiverName, email, password }` — **아이 필드 없음** (§3.4). OAuth 가입도 아이 정보를 받지 않는다.
- **흐름 (CONFIRMED C-2 · C-3 · C-9 · C-12)**: 가입(Email · Google · Apple) → `GET /v1/consent-documents/current` → `POST /v1/consents` → (VPC 단계 슬롯) → `GET /v1/onboarding` → `PUT /v1/onboarding/steps/:step` (5단계) → `POST /v1/onboarding/submit`. Trial은 5단계 응답을 기기 로컬 draft로만 보관하고 가입·동의 후 submit 한 번으로 전송한다.

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/me` | — | `Me` (caregiver, consentStatus{required[], missing[]}, parentVerification{status: `ParentVerificationStatus`} (RECOMMENDED, C-3), onboardingStatus, child?{id, firstName}, plan) | AUTH_REQUIRED | FR-01, FR-02, FR-03 |
| PATCH | `/v1/me` | `UpdateCaregiver` (displayName, relationship, timezone) | `Me` | VALIDATION_FAILED | §7.2 Step1, §7.8 |
| GET | `/v1/consent-documents/current` (public) | — | `CurrentConsentDocuments` (documents[{type, documentId, version, required, title, url}] — C-1 5종, §3.4) | — | FR-02 |
| POST | `/v1/consents` (IK) | `RecordConsents` (items[{type, documentId, action: 'granted'}], source) — `revoked` 없음 (C-4) | `ConsentStatus` | CONSENT_VERSION_OUTDATED, VALIDATION_FAILED (필수 항목 누락) | FR-02, §7.1 |
| GET | `/v1/consents` | — | `ConsentHistory` (Stage 8 동의 이력 보기 — 선택 기능 (C-19, 미구현 시 QA FAIL 아님)) | — | FR-02 |
| — | VPC 단계 (C-3) | — | — | — | **Contract 미정의** — 방식 NEEDS DECISION (법무, L-01). Stage 2는 `Me.parentVerification.status` + Mock 슬롯(`vpc-pending`)만 |
| GET | `/v1/onboarding` | — | `OnboardingState` (instrument: **`OnboardingInstrument`** = `{code, version, questions[], survey: SurveyInstrument}` (§3.4), steps[5], draftAnswers, currentStep) | CONSENT_REQUIRED | FR-03 |
| PUT | `/v1/onboarding/steps/:step` | `SaveOnboardingStep` (step별 schema — `child_info` = `ChildInfoAnswers`, `capability_items` = `CapabilityItemsAnswers` 일부 허용, §3.4) | `OnboardingState` | CONSENT_REQUIRED, VALIDATION_FAILED | FR-03 중도 저장 |
| POST | `/v1/onboarding/submit` (IK) | `SubmitOnboarding` (**`instrument{code,version}`** + 5단계 전체 — capability 10문항 모두 1–5 또는 `not_observed`; Trial 로컬 draft 제출도 동일, C-12) | `ProfileResult` (child, snapshot{scores[4]{capability, score (응답 평균, null 가능), itemCount, missingCount}}, persona, suggestedCapability) | CONSENT_REQUIRED (필수 동의 기록 전 제출 — ARCHITECTURE §7.3.1, §7.4), ONBOARDING_INCOMPLETE, CHILD_LIMIT_REACHED, PROVIDER_UNAVAILABLE(→ fallback persona로 200) | FR-03, FR-04, FR-05, FR-06, FR-24 |
| GET | `/v1/books/search?q=` | — | `Paginated<BookSummary>` | — | §7.2 Step3 (좋아하는 책 검색) |
| GET | `/v1/children/:childId/profile` | — | `ChildProfile` (child, latestSnapshot, strengths[2], growingEdges[2], persona, growthCapability) | CHILD_NOT_FOUND | FR-04, FR-05, FR-06, §7.3 |
| PATCH | `/v1/children/:childId` | `UpdateChild` (firstName, lastName, birthYearMonth, gender — Stage 6 설정) | `ChildProfile` | VALIDATION_FAILED | §7.8 |
| PUT | `/v1/children/:childId/growth-capability` | `SetGrowthCapability` (capability) | `ChildProfile` | — | FR-06, §7.3 |
| GET | `/v1/children/:childId/capability-snapshots` | cursor | `Paginated<CapabilitySnapshot>` | — | FR-15, §7.7 (Stage 6/7에서 사용) |
| GET | `/v1/children/:childId/personas` | cursor | `Paginated<Persona>` | — | FR-15, §7.7 |

> **구현 반영 (Stage 2-CONTRACTS, 2026-09-25)** — 위 표 중 **Stage 2 In Scope** 인 endpoint 의
> Request/Response schema 가 `packages/contracts` 에 구현되었다 (상세 매핑은 §3.4 구현 반영 표).
>
> | Endpoint | Request | Response |
> |---|---|---|
> | `GET /v1/me` | — | `MeResponseSchema` |
> | `PATCH /v1/me` | `UpdateCaregiverRequestSchema` | `MeResponseSchema` |
> | `GET /v1/consent-documents/current` | — | `CurrentConsentDocumentsSchema` |
> | `POST /v1/consents` | `RecordConsentsRequestSchema` | `ConsentStatusSchema` |
> | `GET /v1/onboarding` | — | `OnboardingStateSchema` |
> | `PUT /v1/onboarding/steps/:step` | `SaveOnboardingStepRequestSchema` | `OnboardingStateSchema` |
> | `POST /v1/onboarding/submit` | `SubmitOnboardingRequestSchema` | `ProfileResultSchema` |
> | `GET /v1/books/search` | `SearchBooksRequestSchema` | `SearchBooksResponseSchema` |
> | `GET /v1/children/:childId/profile` | — | `ChildProfileSchema` |
> | `PUT /v1/children/:childId/growth-capability` | `SetGrowthCapabilityRequestSchema` | `ChildProfileSchema` |
>
> - **`Me` 의 `plan`**: 이 표대로 **최상위 필드 1 곳**이다. `caregiver` 안에는 두지 않는다.
> - **VPC (C-3)**: contract 를 정의하지 않았고 `MeResponse.parentVerification.status` 슬롯만 있다.
> - **AuthGateway** 는 HTTP 가 아니다 — 입력 schema 만 `src/auth/*` 에 있다 (`SignUpWithEmailInput` ·
>   `SignInWithEmailInput` · `RequestPasswordResetInput` · `UpdatePasswordInput` · `AuthSession` · `AuthProvider`).
> - **Error Code 신규 추가 0 건** — Stage 1 의 28 종을 그대로 쓴다 (AC-2-48).
> - Mock Adapter · Http Adapter · 화면은 **이 Step 범위가 아니다**. 실제 서버 연동 검증은 `BACKEND_INTEGRATION_PENDING`.

#### 설정 진입점 — CONFIRMED (사용자 결정 2026-09-14, C-16)

Home 상단 설정 아이콘(`26:44`) → 설정 목록. Stage 2는 `/` Home skeleton(워드마크·설정 아이콘·빈 상태 안내 — CONFIRMED #33)에 아이콘을 최종 위치로 둔다. Home skeleton은 contract 호출이 없다 (`HomeSummary` 는 Stage 3). 목록은 서버 데이터가 아니라 Frontend route config이며 (contract 없음), Stage마다 항목이 추가된다. 목록 화면 디자인은 C-13 절차.

| Stage | 설정 항목 | 사용하는 contract |
|---|---|---|
| 2 | 로그아웃 | `AuthGateway.signOut()` + 로컬 draft·캐시 정리 (HTTP endpoint 없음) |
| 3 | 알림 설정 | `GET` / `PUT /v1/notification-preferences` |
| 6 | 전체 설정 — 아이 프로필 수정·설문 재응답·발전 역량 변경 등 | `PATCH /v1/children/:childId`, `PUT /v1/children/:childId/growth-capability`, 설문 재응답 contract 형태는 Stage 6 Plan |
| 8 | 데이터 관리 · 탈퇴 (C-15) + 동의 이력 보기 선택 기능 (C-19, 미구현 시 QA FAIL 아님) | Stage 8 그룹 (`GET /v1/data-management`, `GET /v1/consents`, `DELETE /v1/me` …) |

### Stage 3 — Home · Activity Card · Library · Recommendation · Notifications

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/children/:childId/home` | — | `HomeSummary` (todayCard, sessionsThisWeek, **characterLine**, lastHighlightLine?, activeSession?) — **`streakDays` 삭제 · `characterLine` 추가 (CONFIRMED 2026-10-02, `stage-3-approvals.md` §8.5 ①·④)**. `characterLine` 은 **약 120자 이내** 요구 — schema 제약 아님, §3.8 (`P3-BIP-16`) | ONBOARDING_INCOMPLETE | FR-07, §6.1, §7.4 보조 요소 |
| GET | `/v1/children/:childId/activity-cards/today` | — | `ActivityCard` (date, options[3]{kind, book, reason, coachingLine, **capability**, **promptPreview[]**}) — **`targetCapability` 없음 (D-22)** — **`options[].capability` = D-5 · `options[].promptPreview` = D-4 (CONFIRMED 2026-09-29, §3)**. 상세 §3.6 | ONBOARDING_INCOMPLETE | FR-07 (2초 내 로딩 NFR) |
| POST | `/v1/activity-cards/:cardId/selection` | `SelectActivityOption` (optionId, readingContext, customTime?) | `ActivityCardSelection` (option, promptSet{questions(**`.min(1)`, 상한 없음 — D-21**), coachingLine, followUps}) | RESOURCE_NOT_FOUND | FR-07 책 선택 후 Prompt, FR-08 |
| GET | `/v1/children/:childId/library/overview` | — | `LibraryOverview` = `{ readingNow: LibraryBook \| null, sections: { key: LibrarySectionKey, items: LibraryBook[], hasMore }[] }` — **화면 1회 조회 (구현됨)**. 섹션 4개가 한 화면에 동시에 뜨므로 섹션별 호출을 하지 않는다 (`P3-BIP-18`) | CHILD_NOT_FOUND | FR-20, §6.1 |
| GET | `/v1/children/:childId/library` | `?filter=owned\|gifted\|history\|saved\|curated` cursor | `Paginated<LibraryBook>` — "See all" 시트와 더 보기 | VALIDATION_FAILED, CHILD_NOT_FOUND | FR-20, FR-22 |
| POST | `/v1/children/:childId/library/books` (IK) | `AddOwnBook` = `{ target }` — **`SaveBookTarget` 재사용** (bookId \| title+author) | `LibraryBook` | VALIDATION_FAILED, IDEMPOTENCY_KEY_REUSED, (BOOK_ALREADY_OWNED) | FR-23, §8.1 |
| PUT | `/v1/children/:childId/saved-books` | `SaveBook` (`target` = bookId \| title+author) | **`SavedBook`** (`saved=true`) — `LibraryBook` 전환을 검토했으나 **현행 유지**가 사용자 결정이다 (`L-OPEN-20`, `stage-3-approvals.md` §18.4). 그 대가로 저장/해제 후 `libraryKeys.overview` 를 무효화하고 재조회한다 | RESOURCE_NOT_FOUND, VALIDATION_FAILED | **Figma `★ Save` — approvals §12.8 `A-9`**. PRD 근거 없음(FR-20 범위 밖) → Figma 우선 + 사용자 결정. 설계 §3.7. **IK 불필요**(PUT = 상태 설정, 멱등) |
| DELETE | `/v1/children/:childId/saved-books/:bookId` | — | **`SavedBook`** (`saved=false`) — 위와 같은 이유로 현행 유지 (`L-OPEN-20`) | RESOURCE_NOT_FOUND | 저장 해제 (`G-13` 토글) |
| GET | `/v1/books/:bookId/prompts?childId=` | — | `BookPromptsResponse` = `{ bookId, promptSet, reason? }` — **`PromptSet` 재사용**(중복 선언 금지). 세트 단위 `coachingLine` 은 §12.14 로 삭제되었고 코칭 노트는 **`Prompt.coachingNote`**(질문 1개당 1개)다. 각 `Prompt` 는 `phase`·`pageRef`(optional)를 포함할 수 있다 (§3.6, D-8). **`reason`(추천 이유 1~2문장, nullable)은 서버가 만든 문장이며 `BookDetailSheet` 가 Figma `145:1085` 의 책 블록 3번째 줄로 그린다 (사용자 결정 2026-10-09 `L-R2B-01`). 길이 제약 없음 — 요구는 `P3-BIP-26`** | RESOURCE_NOT_FOUND | FR-20 "책별 Prompt 보기" |
| POST | `/v1/children/:childId/gift-requests` (IK) | `CreateGiftRequest` = **`{ bookId }` 만 — 배송지 필드 없음 (CONFIRMED 2026-10-02, §8 D-15)** | `GiftRequest` | GIFT_REQUEST_DUPLICATE | FR-22, §13. 배송지 수집·저장은 운영·법무 결정 후 별도 Stage (`P3-BIP-06`) |
| GET | `/v1/children/:childId/gift-requests` | — | `Paginated<GiftRequest>` | CHILD_NOT_FOUND | §13 배송 상태 서재 확인 |
| GET | `/v1/notification-preferences` | — | `NotificationPreferences` | — | FR-08, §7.8. **Contract 정의 유지** — D-18(2026-10-02, §8.4)은 **알림 설정 화면만** Stage 3 제외이며 contract 는 삭제하지 않는다. ⭐ **구현 Stage = 4** (이월 `QA-3-001` — Stage 3 에서 0건이었다) |
| PUT | `/v1/notification-preferences` | `UpdateNotificationPreferences` | `NotificationPreferences` | — | FR-08, §7.8. ⭐ **구현 Stage = 4** (이월 `QA-3-001`) |
| POST | `/v1/push-devices` | `RegisterPushDevice` (platform, token) | `PushDevice` | — | FR-08. ⭐ **구현 Stage = 4** (이월 `QA-3-001`). `platform` = `PushPlatform` **3값 유지**(`ios`·`android`·`web`) — ⛔ **네이티브 분리(`D4-1`)로 값을 줄이지 않는다**: Contract 는 Backend 요구사항이고 **후속 단계에서 ios/android 가 실제로 등록된다** |
| DELETE | `/v1/push-devices/:id` | — | 204 | — | FR-08. ⭐ **구현 Stage = 4** (이월 `QA-3-001`) |

### Stage 4 — Storytime Session · Recording · Storage

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| POST | `/v1/sessions` (IK) | `CreateSession` (§3.2) | `CreateSession` | ONBOARDING_INCOMPLETE, SESSION_ALREADY_ACTIVE | FR-09, FR-10 (시작 버블) |
| GET | `/v1/sessions/:sessionId` | — | `SessionDetail` (summary + recording upload status + reflection? + sticker? + ⭐ completionBubble — Rev 8.9, §3.2.3) | RESOURCE_NOT_FOUND | FR-09 |
| POST | `/v1/sessions/:sessionId/transitions` (IK, CG when to=recording) | `SessionTransition` (§3.2) | `SessionTransitionResult` (session, completionBubble?, stickerAward?) | SESSION_INVALID_TRANSITION, CONSENT_REQUIRED, SESSION_MAX_DURATION_EXCEEDED | FR-09, FR-10 (종료 버블), FR-19, §13 |
| POST | `/v1/sessions/:sessionId/recordings` (IK, CG) | `RecordingUploadInit` (§3.3) | `RecordingUploadInit` | CONSENT_REQUIRED, RECORDING_NOT_ALLOWED_FOR_MODE, SESSION_INVALID_TRANSITION | FR-14, NFR 오프라인 |
| POST | `/v1/recordings/:recordingId/upload-tokens` (IK, CG) | `RefreshUploadTokens` (partNos) | `RecordingUploadInit` | RECORDING_DELETED | NFR 오프라인 (토큰 만료) |
| POST | `/v1/recordings/:recordingId/complete` (IK, CG) | `RecordingUploadComplete` (§3.3) | `RecordingUploadComplete` | RECORDING_INCOMPLETE, UPLOAD_TOKEN_EXPIRED | FR-14 |
| GET | `/v1/children/:childId/sessions` | cursor, `?status=` | `Paginated<SessionSummary>` | — | FR-20 히스토리, §7.8 세션별 삭제 목록 |

클라이언트 전용(계약 아님): RecordingController 상태, 로컬 UploadQueue 상태, 마이크 권한 상태.

> ⭐ **Rev 8 (2026-10-13) — Stage 4 범위 주석** (`D4-1`·`D4-12`·`D4-13`)
>
> | 항목 | 내용 |
> |---|---|
> | **endpoint 자체는 하나도 제거하지 않는다** | Contract 는 **Backend 요구사항**이다. `D4-1`(네이티브 → 후속 단계)은 **Frontend 구현 범위**를 줄인 것이고 Backend 가 구현해야 하는 표면은 그대로다 |
> | 네이티브 전용 요구 | **기기 토큰 등록의 `ios`/`android` 분기**(`POST /v1/push-devices`) 등은 **후속 단계**에 Frontend 쪽 호출자가 생긴다. Stage 4 는 **`web` 경로만** 호출한다 (`D-16`: Web 은 `Notification.permission` 까지만, provider SDK 금지) |
> | ⭐ `POST /v1/sessions/:sessionId/transitions` **`to='abandoned'`** | 사용자 `Discard` 가 **이 endpoint 를 그대로 쓴다** (`D4-12`·`D4-13`). **신규 endpoint 0건** · 신규 error code 0건. ⛔ **폐기 사유를 보내지 않는다** |
> | ⛔ **`recordingApi.abort()` 를 추가하지 않는다** | 업로드 중 폐기 시 서버가 **`abandoned` 전이를 받아 part 를 스스로 정리**한다 — **Handoff 요구사항** `P4-BIP-21` (§5.1.1) |
> | `GET /v1/children/:childId/sessions` | Stage 4 에서 **Contract 를 만든다** (`C4-OPEN-4`, RECOMMENDED) — 이것 없이는 **FR-21 세션별 녹음 삭제 대상 목록**(Stage 8)과 크래시 복구 시 "진행 중 세션 찾기" 를 표현할 수 없다. **Mock fixture 는 최소**로 |
> | `SessionDetail` | ⭐ **`sticker?` 는 Stage 4 에 넣고 `reflection?` 은 Stage 5 로** (`C4-OPEN-6`, RECOMMENDED) — 재진입 시 스티커 중복 표시 방지(FR-19)가 Stage 4 AC 라서 `sticker` 가 필요하다. `recording upload status` 는 **§3.9 `RecordingStatus`** 를 쓴다 |
> | ⛔ Prompt Drawer 노출 기록 | **endpoint 를 추가하지 않는다** (`C4-OPEN-3`, RECOMMENDED) — 서버가 `prompts` 를 내려준 시점으로 충분하고 추가 왕복은 "무음·무진동" 원칙과 맞지 않는다. Handoff 에 *"Drawer 노출 시각은 Frontend 가 보고하지 않는다"* 로 명시 |

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

### Stage 8 — Data Management · Deletion · Account · Consent History

> **이월 기능 — Stage 8 CONFIRMED (사용자 결정 2026-09-14, C-15)**: FR-21 데이터 관리 (P0), 탈퇴 (필수). 동의 이력 보기 = 선택 기능 (C-19, 미구현 시 QA FAIL 아님; 시간 여유 시 읽기 전용 목록, PRD 화면 요구 없음). 설정 목록에서 진입 (C-16).

| Method | Path | Request | Response | Key errors | PRD |
|---|---|---|---|---|---|
| GET | `/v1/data-management` | — | `DataManagementSummary` (retentionPolicy{rawAudioDays: 90}, recordingsCount, pendingDeletionRequests) | — | §7.8 보관 정책 안내 |
| DELETE | `/v1/sessions/:sessionId/recording` (IK) | — | `DeletionRequest` | RECORDING_DELETED, DELETION_ALREADY_REQUESTED | FR-21 |
| POST | `/v1/data-deletion-requests` (IK) | `CreateDeletionRequest` (scope='all_data', confirmation) | `DeletionRequest` | DELETION_ALREADY_REQUESTED | FR-21, NFR |
| GET | `/v1/data-deletion-requests/:id` | — | `DeletionRequest` | — | FR-21 |
| DELETE | `/v1/me` (IK) | `DeleteAccount` (confirmation) | `DeletionRequest` | — | §7.8 탈퇴 (범위 DATA_MODEL §12.2 B-5 결정) |
| GET | `/v1/consents` (동의 이력 보기 — 선택 기능 (C-19, 미구현 시 QA FAIL 아님)) | — | `ConsentHistory` | — | FR-02, PRD §12.1 동의 이력 |
| — | 동의 철회 | — | — | — | **범위 제외 — CONFIRMED (사용자 결정 2026-09-14, C-4)**. Contract·`action='revoked'`·Mock 없음. COPPA 관계는 NEEDS DECISION (법무, L-03) |

> 세션별 녹음 삭제 UI와 `DELETE /v1/sessions/:sessionId/recording` 호출은 Stage 8 (C-15). Stage 4는 LocalRecordingStore 로컬 삭제 기반만 (PLANNING §4.1 FR-21).

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

#### 5.1.1 녹음 업로드 계층 명칭 (interface + Mock 구조 CONFIRMED (사용자 결정 2026-09-14, #27) — 명칭은 rules/frontend §1이 이 절을 기준으로 참조)

| 계층 | Interface | Mock Adapter | 실제 Adapter (골격) | 책임 |
|---|---|---|---|---|
| API | `recordingApi` (`init`, `refreshTokens`, `complete`, `status`) | `MockRecordingApi` | `HttpRecordingApi` | 녹음 업로드 Contract 호출: 초기화·토큰 재발급·완료 확정·상태 조회 (§4 Stage 4) |
| 바이트 전송 | `UploadTransport` (`uploadPart`, `resume`, `abort`) | `MockUploadTransport` | `TusUploadTransport` | part 바이트 전송(resumable), 진행률·실패·재개 |

- 위 이름 외의 변형(`RecordingUploadApi`, `MockRecordingUploadTransport`, `MockRecordingUploadApi` 등)은 사용하지 않는다.
- `UploadQueue`(features/recording)는 `recordingApi` 와 `UploadTransport` 를 조합한다. 실제 전송·서버 확정 검증은 `BACKEND_INTEGRATION_PENDING` (`RECORDING_UPLOAD_SPEC.md`).

> ⭐ **Rev 8 (2026-10-13) — Platform Port 의 Stage 범위** (`D4-1`, **Stage 0 #7 변경**)
>
> | Port / Adapter | Stage 4 | 후속 단계 |
> |---|---|---|
> | **`RecorderAdapter`** | **interface + Web 구현** (`MediaRecorder` 기반). ⭐ **interface 에 DOM 타입을 노출하지 않는다** — `S4-D` 완료 판정 항목이다(`R-02` 완화책) | `NativeRecorderAdapter` (Capacitor 플러그인) |
> | **`PushPermissionPort`** | **interface + Web 구현** (`Notification.permission` / `requestPermission()` **까지만** — `D-16`). ⛔ provider SDK·VAPID·`PushManager` **0건** | 네이티브 Push Adapter (`S4N-D`) |
> | **`AuthGateway`** | **`MockAuthGateway`**(Web) 유지 — Stage 2 구현 그대로 | 네이티브 Apple/Google Adapter (`S4N-B`) |
> | `UploadTransport` | `MockUploadTransport` + `TusUploadTransport` **골격** | 실제 TUS 연동 (`BACKEND_INTEGRATION_PENDING`) |
>
> ⛔ **`apps/mobile` 을 Stage 4 에서 만들지 않는다.** 네이티브는 **분리된 후속 단계**다 (`D4-1`, 2026-10-12 로 Stage 0 #7 변경). Contract·Port interface 는 그 확장점으로 **Stage 4 에서 확정**된다.

> ⭐ **Rev 8 (2026-10-13) — 녹음 폐기 시 업로드 중단 처리** (`D4-13` 귀결)
>
> | 항목 | 확정 |
> |---|---|
> | ⛔ **`recordingApi.abort()` 를 추가하지 않는다** | `recordingApi` 는 **`init`·`refreshTokens`·`complete`·`status` 4개 그대로**다 |
> | 중단 경로 | 클라이언트는 **`POST /v1/sessions/:sessionId/transitions` `to='abandoned'`** 하나만 보낸다. 그 다음 **로컬 큐를 취소하고 청크를 삭제**한다 |
> | 서버 책임 (**Handoff `P4-BIP-21`**) | **`abandoned` 전이를 받으면 이미 올라온 part 와 발급한 upload token 을 서버가 스스로 정리**한다. Frontend 는 part 단위 취소를 호출하지 않는다 |
> | 왜 메서드를 늘리지 않는가 | ① 폐기는 **세션 수준 사건**이고 전이가 이미 그것을 표현한다 ② 메서드를 늘리면 **오프라인 폐기** 때 두 요청의 순서·멱등을 Frontend 가 관리해야 한다 ③ `rules/architecture.md` §1 — 추상화는 **교체가 예정된 경계**에만 둔다 |
> | 삭제 순서 (불변) | **서버 전이 확정 응답을 받은 뒤** 로컬을 지운다. 실패·오프라인이면 **로컬 보존** + `SessionOutbox` 적재 (§3.1 주석) |

> ⭐ **Rev 8 (2026-10-13) — `UploadTransport` 시그니처는 `S4-A` spike 결과로 구체화한다**
> `uploadPart` / `resume` / `abort` 의 인자·반환은 **Web `MediaRecorder` 청크 모델과 TUS offset 재개 방식의 실측**에 달려 있다 (`S4-A` ①②④). **이 문서는 메서드 이름만 확정**하고 시그니처는 열어 둔다 — 구현 확정은 development-agent(`S4-E`). ⚠️ `abort` 는 **transport 계층의 바이트 전송 취소**이고, 위의 *"`recordingApi.abort()` 를 추가하지 않는다"* 와 **다른 층의 다른 것**이다.
>
> ✅ **구현 반영 (Stage 4 `S4-C`, 2026-10-14) → ✅ 확정 (Stage 4 `S4-E`, 2026-10-15)** — 위치 `apps/web/src/shared/api/upload-transport.ts`. 아래 초안을 **그대로 확정**한다 — `UploadQueue`(`features/recording/model/upload-queue.ts`)가 이 시그니처로 `uploadPart → (409) resume` · `UPLOAD_TOKEN_EXPIRED → refreshTokens → 재시도` · `abort`(큐 취소 시)를 실제로 쓴다. 바꾼 것 0
>
> | 메서드 | 초안 | 의미 (TUS core 1.0.0) |
> |---|---|---|
> | `uploadPart({ target, data: Blob }, { signal?, onProgress? })` | `→ UploadPartResult { partNo, bytesUploaded, bytesTotal, bytesSent }` | offset 0 PATCH. 서버가 이미 바이트를 가졌으면 **보내지 않고** `UploadOffsetConflictError(serverOffset)` (TUS 409) |
> | `resume(같은 인자)` | 같은 반환 | HEAD 로 서버 offset 조회 → **그 뒤만** PATCH. 끝난 part 는 `bytesSent: 0` — 재전송이 중복 업로드를 만들지 않는다 (AC-4-28) |
> | `abort({ target })` | `→ void` | 진행 중 전송 취소. 서버 바이트는 지우지 않는다 |
>
> 오류: 토큰 만료 `UPLOAD_TOKEN_EXPIRED` · 폐기 `RECORDING_DELETED` · 전송 실패 `NetworkError` · offset 충돌 `UploadOffsetConflictError`(contracts code 아님 — 프로토콜 사실). `TusUploadTransport`(골격, 외부 라이브러리 없음)의 상태 코드 해석(401/403 → 만료, 404/410 → 삭제)은 **가정**이며 `BACKEND_INTEGRATION_PENDING`.
> ⚠️ **`recordingApi.status` 의 endpoint 가 §4 Stage 4 표에 없다** — Http 골격은 `GET /v1/recordings/:recordingId` 를 쓴다. §4 표 등재는 plan-agent 확인 대상이다.

### 5.2 Adapter 규칙

| 규칙 | 내용 | 라벨 |
|---|---|---|
| 호출 경로 | `Component → Query/Mutation hook → <domain>Api interface → Mock<Domain>Api \| Http<Domain>Api` (예: `SessionPage → useCreateSession → sessionApi.create → MockSessionApi \| HttpSessionApi`) | CONFIRMED (사용자 지시 docs/source/prompts/01-stage0-1-1-frontend-scope.md "Frontend Architecture" — SessionPage → useCreateSession → sessionApi.create → MockSessionApi / HttpSessionApi) |
| Adapter 선택 | `app/providers` 한 곳, 환경 설정으로. Component·Feature·Query hook에서 분기 금지 | RECOMMENDED (rules/architecture §4와 동일, 전체 승인 #1 대상; Mock→Http 교체 가능성 자체는 사용자 지시 CONFIRMED) |
| 검증 | Mock/Http 모두 요청·응답을 contracts schema로 parse | CONFIRMED |
| 중복 방지 | 도메인별 Mock 클래스는 공통 helper(지연·scenario 조회·error envelope 생성·전이 표 `canTransition`)를 사용하고 도메인 로직만 가진다 | CONFIRMED (사용자 결정 2026-09-14, #8) |
| MSW | 사용하지 않는다 (Adapter 계층으로 Mock) | CONFIRMED (사용자 결정 2026-09-14, #8) |
| Http Adapter | Contract 기반 골격만 (endpoint path·method·schema 연결). 실제 연동 검증 = `BACKEND_INTEGRATION_PENDING`. 골격 작성 시점(각 Stage vs Stage 8)은 Stage 1 Plan 결정 | RECOMMENDED |
| AuthGateway / Upload | `MockAuthGateway`; 업로드는 `MockRecordingApi` + `MockUploadTransport` (TUS/서명 URL 흉내) — Supabase·TUS 실제 Adapter 미구현 (§5.1.1) | CONFIRMED (사용자 결정 2026-09-14, #27) |
| 결정성 | 같은 scenario = 같은 결과 (테스트 재현성). 시간·ID는 주입 가능한 clock/id 생성기 사용 | RECOMMENDED (rules/frontend §5와 동일, 전체 승인 #1 대상) |
| Production | Production 빌드에서 Mock 포함/비활성 방식은 Stage 1 Plan 결정 (OAQ-21). Stage 8 웹 프리뷰는 Mock 모드 빌드를 정적 배포한다 (CONFIRMED C-18) | NEEDS DECISION (방식) |

### 5.3 Endpoint 그룹별 필수 Scenario

공통 5종 `success` · `loading` · `empty` · `error` · `retry` 는 데이터 조회 화면에 모두 적용한다. Key는 §5.4 Catalogue만 사용한다.

| Endpoint 그룹 (§4) | 필요 Frontend Stage | 공통 | HARU 특화 (rules/frontend §5 필수 = 굵게) |
|---|---|---|---|
| health | 1 | `success`, `loading`, `error`, `retry` | `offline` |
| me / consents / auth(AuthGateway) | 2 | `success`, `loading`, `error`, `retry` | `consent-missing`, `consent-version-outdated`, `token-expired`, `provider-cancelled`, `onboarding-incomplete`, `vpc-pending`, `vpc-failed` |
| onboarding / children profile | 2 | `success`, `loading`, `error`, `retry` | `draft-resume`, `persona-fallback`, `child-limit-reached`, `capability-all-missing` |
| home / activity-cards | 3 | `success`, `loading`, `empty`, `error`, `retry` | `offline-cached-card`, `conversation-only-option`, `reread-option`, `books-exhausted`, `session-already-active` |
| library / books / gift-requests / **saved-books** | 3 | `success`, `loading`, `empty`, `error`, `retry` | `gift-pending`, `gift-duplicate`, `book-already-owned`, `user-entered-book`, **`book-saved`**, **`no-reason`** |
| notifications / push-devices | 3 | `success`, `loading`, `error`, `retry` | `push-permission-denied` |
| sessions (create / transitions) | 4 | `success`, `loading`, `error`, `retry` | `invalid-transition`, `session-already-active`, `onboarding-incomplete`, `consent-missing`, `mic-permission-denied`, `recording-interrupted`, `auto-timeout`, `crash-recovered`, `abandoned` |
| recordings (upload init / tokens / complete) | 4 | `success`, `loading`, `error`, `retry` | **`recording-upload-success`**, **`recording-upload-failure`**, `upload-retry`, `upload-token-expired`, `recording-incomplete`, `offline-queued`, `upload-stalled-48h`, `recording-deleted` (upload-tokens) |
| reflections | 5 | `success`, `loading`, `empty`(skip), `error`, `retry` | `reflection-already-submitted`, `invalid-transition` (completed 이전 제출) |
| analysis / short feedback | 5 | `success`, `loading`, `error`, `retry` | **`analysis-pending`**, **`analysis-completed`**, **`analysis-failed`**, `analysis-low-quality`, `analysis-not-available`, `recording-deleted` (skipped) |
| profile update / recommendation (필드 확장) | 6 | `success`, `loading`, `empty`, `error`, `retry` | `cold-to-warm`, `persona-changed`, `difficulty-lowered` |
| reports / highlight clips / PDF | 7 | `success`, `loading`, `empty`, `error`, `retry` | **`report-eligible`**, **`report-not-eligible`**, `report-deferred`, `report-delayed`, `pdf-generating`, `clip-expired`, `share-cancelled`, `recording-deleted` (highlight clips) |
| data management / deletion / account / consent history (이월 — C-15) | 8 | `success`, `loading`, `empty`, `error`, `retry` | `deletion-processing`, `deletion-already-requested`, `recording-deleted` |

### 5.4 Scenario Key Catalogue — **scenario key의 유일한 기준 (Single Source)**

- Mock scenario store, 전환 스위치, fixture 파일명, 테스트 이름, Stage Plan·Design Spec·QA 리포트는 아래 **machine key** 만 사용한다. 다른 문서(PLANNING, FRONTEND_IMPLEMENTATION_PLAN, Stage Design Spec 등)는 이 표를 참조하며, 불일치 시 이 표가 우선한다.
- rules/frontend.md §5의 표시명은 "rules display name" 열에 1:1로 대응한다 (key 1개 = 표시명 1개).
- Alias는 이전 초안에서 쓰던 이름이다. **신규 사용 금지** — 기존 문서 동기화 시 canonical key로 치환한다.
- 조합: 공통 key는 endpoint 단위로, 특화 key는 해당 그룹에 적용한다 (예: activity-cards=`loading` + 나머지=`success`). 조합 표기 방식은 Stage 1 Plan에서 확정.
- Key로 만들지 않는 것: `RECORDING_NOT_ALLOWED_FOR_MODE` 등 단일 error code 재현은 `error` + code 지정; 출석 스티커 멱등성은 같은 요청 replay 테스트; 저품질 세션은 리포트 집계에서 제외 (#17) — `report-not-eligible` fixture 경계 테스트로 검증 (key 아님); Trial 로컬 draft는 Mock API가 아니라 로컬 저장소 테스트로 검증 (C-12).

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
| `vpc-pending` | — | **RECOMMENDED (C-3 슬롯)** — 동의 기록 후 `Me.parentVerification.status='pending'` → Route Guard가 VPC 단계 슬롯에 머묾. 방식 결정(법무 L-01) 후 동작 조정 | me, onboarding (Route Guard) | 2 | — |
| `vpc-failed` | — | **RECOMMENDED (C-3 슬롯)** — VPC 검증 실패 또는 거절 → `Me.parentVerification.status='failed'`, 실패 안내·재시도 경로 표시, 온보딩 진입 차단 (아동 데이터 쓰기 없음). 기본 scenario는 `success`(통과). 방식 결정(법무 L-01) 후 동작 조정 | me, onboarding (Route Guard) | 2 | — |
| `capability-all-missing` | — | **RECOMMENDED (C-8)** — 한 역량의 문항이 모두 `not_observed` 인 submit 응답 (해당 역량 `score: null`) → 프로필·다이아몬드 표시 검증. 처리 규칙은 Stage 2 Plan | onboarding submit, children profile | 2 | — |
| `offline-cached-card` | — | `offline` + 최근 Activity Card 캐시 존재 | home, activity-cards | 3 | — |
| `conversation-only-option` | — | 카드 옵션에 `kind=conversation_only` 포함 | activity-cards | 3 | — |
| `reread-option` | — | 카드 옵션에 `kind=reread_book` 포함 | activity-cards | 3 | — |
| `books-exhausted` | — | 재독·대화 전용 대체 카드만 반환 | activity-cards | 3 | — |
| `session-already-active` | — | `HomeSummary.activeSession` 존재 / `POST /v1/sessions` → `SESSION_ALREADY_ACTIVE` | home, sessions | 3 | `active-session-exists` |
| `gift-pending` | — | 증정 신청 `gift_pending`·배송 상태 표시 | library, gift-requests | 3 | — |
| `gift-duplicate` | — | `GIFT_REQUEST_DUPLICATE` | gift-requests | 3 | — |
| `book-already-owned` | — | `BOOK_ALREADY_OWNED`(409) — `/library/add` 중복 등록 안내 (Design Spec §7.2 `InlineAlert tone=info`). Library 2라운드-2 에서 추가 | library (add book) | 3 | — |
| `user-entered-book` | — | DB 외 직접 등록 책 포함 (범용 Prompt) | library, books | 3 | — |
| `no-reason` | — | `GET /v1/books/:bookId/prompts` 응답에서 **`reason` 필드를 생략**한다 — 서버가 아직 추천 이유 문장을 갖고 있지 않은 경우. 화면은 **줄을 생략**해야 하며 대체 문구를 만들지 않는다 (`L-R2B-01`). Library 2라운드-3 에서 추가 | books (prompts) | 3 | — |
| `book-saved` | — | 대상 책이 **이미 저장된 상태**(`LibraryBook.saved=true`) → 재저장이 같은 응답을 돌려주는 멱등성(§3.7.3)과 (`G-14` ⓑ 채택 시) 초기 표시 검증 | library, saved-books, activity-cards | 3 | — |
| `unsave` | — | 저장 해제 성공 (`G-13` 토글) → `libraryKeys.overview` 무효화·재조회 | library, saved-books | 3 | — |
| **`favorites-empty`** | — | `Favorites` 섹션만 0건, 나머지 정상. **저장 전 기본 상태 = 가장 흔한 실제 상태** — 섹션이 사라지지 않고 안내가 뜬다 | library (overview) | 3 | — |
| `finished-empty` | — | `Finished together` 만 0건 | library (overview) | 3 | — |
| `curated-empty` | — | 큐레이션만 0건 (운영 데이터 공백 — `P3-BIP-04`) | library (overview) | 3 | — |
| `reading-now-none` | — | `LibraryOverview.readingNow = null` → **블록 전체 미렌더 + 간격 회수**. 유일한 "섹션 사라짐" 예외이며 그 화면이 Figma `30:74`(L-1) 에 실재한다 | library (overview) | 3 | — |
| `shelf-partial` | — | 캐러셀 항목 1권 (Figma 는 항상 3-up 이라 1~2권 레이아웃이 **없다** — `L-OPEN-13`) | library (overview) | 3 | — |
| `unrated` | — | `LibraryBook.averageRating = null` → 행 **우측 메타를 비우고** 좌측 정렬 유지 (`L-OPEN-22`). Figma 에 unrated 상태가 없다 | library (overview, list) | 3 | — |
| `paged` | — | `nextCursor` 가 있는 2페이지 — "See all" 시트의 추가 로드 (`L-OPEN-21`) | library (list) | 3 | — |
| `push-permission-denied` | — | platform mock: OS push 권한 거부 | push-devices (platform adapter) | 3 | `os-permission-denied` |
| `invalid-transition` | — | `SESSION_INVALID_TRANSITION` → 서버(Mock) 상태 재동기화 | sessions, reflections (completed 이전 제출) | 4 | — |
| `mic-permission-denied` | — | RecorderAdapter mock 권한 거부 → 권한 안내·대화만 하기 | sessions (RecorderAdapter mock) | 4 | — |
| `auto-timeout` | — | 누적 30분 도달 → `completed(auto_timeout)` (clock 주입) | sessions (RecorderAdapter mock) | 4 | — |
| `crash-recovered` | — | 미완료 로컬 녹음 발견 → `completed(recovered_after_crash)` → 업로드 | sessions, recordings (LocalRecordingStore mock) | 4 | — |
| `recording-interrupted` | — | RecorderAdapter mock 인터럽션(전화 수신 / 오디오 route 변경 / 백그라운드 전환) → 일시정지·재개 안내, 로컬 청크 보존 | sessions (RecorderAdapter mock) | 4 | — |
| `abandoned` | — | ready 10분 경과 → `abandoned` (상태 CONFIRMED #16) | sessions | 4 | — |
| `upload-retry` | — | 업로드 1회 이상 실패 후 재시도 성공 | recordings | 4 | `upload-retry-success` |
| `upload-token-expired` | — | `UPLOAD_TOKEN_EXPIRED` → 토큰 재발급 후 성공 | recordings | 4 | — |
| `recording-incomplete` | — | complete 시 `RECORDING_INCOMPLETE` | recordings | 4 | — |
| `offline-queued` | — | 오프라인 녹음 완료 → 큐 대기 → 복구 후 업로드 | recordings | 4 | — |
| `upload-stalled-48h` | — | 업로드 실패 48h 경과 (clock 주입) → 안내 | recordings | 4 | `stalled-48h` |
| **`local-retention-exceeded`** ⭐ Rev 8.3 | — | **기기 로컬 미업로드 녹음 보관 상한 초과** (`D4-29`, 2026-10-15) — 녹음 시작(첫 part) 후 **14일** 지난 미업로드 로컬 녹음을 **로컬에서 삭제**하고 신호를 낸다(`retention_expired`). **7일** 시점 안내 신호(`retention_notice`, 1회)는 key 없이 주입 clock 으로 재현한다. 서버 요청 없음 — 로컬 저장소 seed(`apps/web/src/mocks/fixtures/local-recordings.ts` `seedStaleRecording`). 안내 **화면**은 `S4-H2` | sessions (RecorderAdapter mock 그룹 `recorder` · LocalRecordingStore seed) | 4 | — |
| **`recording-discarded`** ⭐ Rev 8 | — | **사용자 `Discard`** — `POST /v1/sessions/:id/transitions` `to=`**`abandoned`** 확정 응답 → 클라이언트가 **업로드 큐를 취소하고 로컬 청크를 삭제**한다. 서버 업로드 없음. 재조회 시 `uploadStatus=`**`deleted`** (§3.9). ⛔ **폐기 사유 필드 없음** · 신규 error code 0 · 신규 enum 값 0 (`D4-13`). **선행 조건이 `D4-13` 으로 풀렸다** — Mock 이 보낼 `to` 값이 **`abandoned`** 로 확정됐다 | sessions, recordings | 4 | — |
| **`web-background-warning`** ⭐ Rev 8 | — | **Web 백그라운드·탭 비활성 녹음 한계 안내** — `visibilitychange` 로 탭이 비활성되거나 화면이 잠겼을 때 **청크 수신이 중단될 수 있음**을 사용자에게 알린다. ⭐ **`D4-4` 로 필수가 됐다**(네이티브가 Stage 4 에서 빠진 대가로 **Web 한계를 측정·기록·안내**하는 것이 요구사항이 되었다 — Plan AC-4-70 · AC-4-108). 실제 중단 여부·조건은 `S4-A` ⑥ 실측으로 채운다 | sessions (RecorderAdapter mock) | 4 | — |
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
| `recording-deleted` | — | `RECORDING_DELETED` / 분석 종결 표현 (`skipped_audio_deleted` 후보 — OAQ-17 결정 전 enum 제외) | recordings (upload-tokens), analysis, highlight clips, data management | 4 | — |
| ~~`consent-revoked`~~ | — | **제거 — CONFIRMED (사용자 결정 2026-09-14, C-4, 동의 철회 MVP 제외)**. Mock·테스트·문서에 사용 금지 | — | — | — |

> ⭐ **Rev 8 (2026-10-13) — 등재 판단 기록**
>
> | 후보 | 판단 |
> |---|---|
> | **`recording-discarded`** | ✅ **등재** — `D4-12`(Discard 채택)·`D4-13`(전이 안 A)로 Mock 동작이 결정적으로 정의된다 |
> | **`web-background-warning`** | ✅ **등재** — `D4-4` 로 **필수** |
> | **폐기 전이 실패 분기** (로컬 보존 검증) | ⏳ **별도 key 로 두지 않는다 (잠정)** — 공통 **`error`**/**`retry`** + `offline` 으로 덮을 수 있는지가 **development-agent 판단**이다(`S4-B`/`S4-E`). 덮을 수 없으면 그때 등재한다. ⚠️ 어느 쪽이든 **"전이 실패 시 로컬 청크를 보존한다"** 는 **AC 로 검증**된다 |
> | `library:save-error` 류 **메서드 단위 override** | ⏳ **key 가 아니라 조합 표기 문제**다 — "조합 표기 방식은 Stage 1 Plan 에서 확정" 이 미완인 채 남아 있다. Stage 4 에서 새 key 를 만들지 않는다 |
> | **`local-retention-exceeded`** (기기 로컬 미업로드 녹음 보관 상한 초과) | ~~⛔ **등재하지 않는다** — `N4-09`(보관 기간, `OAQ-11`)가 **미결**이다. 결정 전에는 **삭제하지 않는 쪽**을 유지하므로 재현할 동작이 없다~~ → ✅ **등재 (Rev 8.3, 2026-10-15)** — `D4-29` 로 `N4-09` 해소(14일 삭제 · 7일 안내). 위 Catalogue 행 참조 |
> | **인터럽션 3종 구분** (`visibilitychange` · `devicechange` · `MediaStreamTrack.onended`) | ⛔ **기존 `recording-interrupted` 를 쪼개지 않는다** — 셋의 **사용자 대면 동작이 같다**(일시정지·재개 안내 + 로컬 청크 보존). 구분은 **`S4-A` spike 산출물과 테스트 이름**에서 하고 scenario key 를 늘리지 않는다 |

> ✅ **구현 반영 (Rev 8.2, Stage 4 `S4-C`, 2026-10-14)**
>
> | 항목 | 구현 |
> |---|---|
> | **메서드 단위 override** (조합 표기 — 새 key 아님) | `?scenario=<group>.<method>:<key>` — 예: `library.savebook:error`(목록 성공 + 저장만 실패, AC-4-87) · `sessions.transition:error` · `recordings.uploadpart:offline`. 메서드 이름은 **소문자**. 한 계층 안 우선순위 **메서드 > 그룹 > wildcard**, 계층 우선순위(URL > panel > env)는 그대로. 구현 `apps/web/src/mocks/scenarios/` |
> | 그룹 이름 | `sessions` · `recordings`(`MockRecordingApi` + `MockUploadTransport` 공유) · `notifications` · **`recorder`**(RecorderAdapter mock 재현 계획 — `mic-permission-denied` · `recording-interrupted` · `web-background-warning` · `auto-timeout` · `crash-recovered`) |
> | **인터럽션 3종 구분** | key 를 쪼개지 않는다(위 Rev 8 판단 유지). 원인은 **메서드 자리**로 고른다: `recorder.visibilitychange:` · `recorder.devicechange:` · `recorder.track-ended:recording-interrupted`. 그룹 지정은 3종 모두 |
> | **`web-background-warning`** | ⭐ **`D4-26` (사용자 결정 2026-10-14)** — **조건 없는 안내**. Mock 은 녹음 중 탭이 1회 숨겨졌다 돌아오는 신호만 낸다(녹음은 계속). 중단 조건·시간 같은 **측정값을 담지 않는다** (AC-4-108 `NOT VERIFIED`). 측정 후 `apps/web/src/mocks/recorder/recorderScenarios.ts` 의 이 key 하나만 고친다. 사용자 문구는 feature copy 모듈(`S4-F`) 소관 |
> | **폐기 전이 실패 분기** | **별도 key 를 만들지 않는다** — `sessions.transition:error` / `:retry` / `:offline` 메서드 override 로 재현한다 (로컬 보존 검증은 `S4-E`) |
> | `recording-discarded` | 동작은 **상태 규칙**이 만든다 — `to='abandoned'` 확정 → 녹음 `uploadStatus='deleted'`, 이후 토큰 재발급·확정·전송 `RECORDING_DELETED`. key 는 그 경로를 이름으로 고정한다 (API 동작은 `success` 와 같다) |
> | `error` 의 code 지정 | 번들 옵션 `errorCodes`(키 `group` 또는 `group.method`). 기본 `INTERNAL_ERROR` |
> | `retry` | Stage 4 그룹은 **메서드별** 1회차 실패 (Stage 1–3 그룹은 그룹 단위 그대로) |
> | `offline-queued` | 연결 끊김에서 시작 → 테스트 `connectivity.goOnline()` / 브라우저 `online` 이벤트로 복구 |

> ✅ **구현 반영 (Rev 8.3, Stage 4 `S4-E`, 2026-10-15)**
>
> | 항목 | 구현 |
> |---|---|
> | `local-retention-exceeded` | `recorder` 그룹 key (`RECORDER_SCENARIO_KEYS`). 녹음기 계획(`RecorderScenarioPlan`)에는 영향 없음 — 저장소 seed 해석은 `apps/web/src/mocks/recorder/localStoreScenarios.ts` `resolveLocalStoreSeed` |
> | `crash-recovered` | 같은 해석기 — `seedCrashedRecording`(part 1 · 청크 8 · `endPart` 없음). 복구 = `features/recording/model/recording-recovery.ts` |
> | 로컬 저장소 Mock | `apps/web/src/mocks/platform/MockRecordingStorage.ts` (메모리 · 파일 수 측정 · 할당량 초과/잘림/유실 주입 · Mock 디코드 규칙) · `MockAppStatePort.ts` (연결·화면·장치 신호 주입) |
> | 브라우저 조립(scenario → seed · Mock 서버 세션 준비) | **`S4-F`** — seed 는 세션 id 를 받는다 (Mock 서버에도 같은 세션이 있어야 전이·업로드가 성공한다) |

> ✅ **구현 반영 (Rev 8.5, Stage 4b `S4-F1`, 2026-10-26)** — 설계 변경 없음 · contracts 변경 0.
>
> | 항목 | 구현 |
> |---|---|
> | **`session`** 그룹 (표시 데이터 모양 — 4b Plan §12 제안 key) | `success`(Prompt 5) · `prompts-1` · `prompts-3` · `prompts-7` · `prompts-empty`. `POST /v1/sessions` 가 만드는 ready 세션의 `prompts` 개수만 바꾼다 — API 동작은 `sessions` 그룹이 따로 정한다. 책 칩 변형 ✅ **구현 (Rev 8.8, `S4-F2`)**: `book-missing`(`book: null`) · `book-no-cover`(`coverUrl` 없음 — `MOCK_SESSION_BOOK_NO_COVER`) · `book-long-title`(40자 이상 — `MOCK_SESSION_BOOK_LONG_TITLE`). 요청한 책 대신 고정 fixture 를 쓰며 Prompt 는 5개다. 파일 `apps/web/src/mocks/sessions/sessionFixtureScenarios.ts` · fixture `mocks/fixtures/sessions.ts` |
> | **`session-greeting`** 그룹 (신규 — Plan §12 에 없음, 등재 판단은 plan-agent) | `success` · `greeting-missing`(`bubble: null`) · `greeting-empty`(`text: ''`) · `greeting-tight`(320 에서만 1줄 초과) · `greeting-long`(393 에서도 초과). **인사 × Prompt 개수 조합**(AC-4-122 의 2 × 5)을 URL 하나로 만들려고 `session` 과 **다른 축**으로 뒀다 — 예: `?scenario=session-greeting:greeting-missing,session:prompts-7`. 긴 인사 2종은 **제약 위반 입력**(clamp 회귀용, `D4-21`)이며 아이 이름을 담지 않는다 |
> | ready 버블 | `SessionSummary.bubble.text` = 제목 줄(1줄 clamp) · `prompts` 앞 5개 = pill (`D4-14`·`D4-20`~`D4-22`). `prompts: []` 는 parse 통과(`.min` 없음) — 화면은 버블을 그리지 않는다 |
> | e2e 증거 경로 | dev 서버에서만 `window.__HARU_MOCK_REQUEST_LOG__` = Mock 요청 로그 (`createBrowserMockApiClients`, `import.meta.env.DEV` 가드 — Mock 데모 빌드에 남지 않는다) |

> ⭐ **등재 (Rev 8.6, plan-agent, 2026-10-27 — `D4-59`)** — `session-greeting` 그룹(Rev 8.5 신규)을 **등재한다**(인사 × Prompt 개수 축 분리 판단 수용). 같은 그룹에 key 1건 추가:
>
> | key | 내용 | 목적 |
> |---|---|---|
> | `success` (기존) | `reminderBubble.text = 'Ready when you are!'` 를 함께 채운다 | 5분 시점 제목 줄 교체 |
> | **`reminder-missing`** | `reminderBubble: null` (인사는 정상) | 5분 시점 **시각 변화 0** |
>
> 인사 null + 리마인드 null 조합은 별도 key 를 두지 않는다 — 두 필드 거동이 독립이므로 `greeting-missing` · `reminder-missing` 각각으로 판정한다.
>
> ⭐ **등재 (Rev 8.9, plan-agent, 2026-11-01 — `D4-87`·`D4-88`)** — 신규 그룹 **`session-completion`** (완료 버블 표시 모양). `session-greeting` 과 같은 이유로 API 동작 축과 분리한다. ✅ 구현 `S4-H1R` (Rev 8.10) — 값은 세션 생성 시 레코드에 담겨 전이 응답과 Detail 이 공유한다.
>
> | key | 내용 | 목적 |
> |---|---|---|
> | `success` | `completionBubble` = 주 문구 + `subtext` (`MOCK_COMPLETION_BUBBLE`) | 보조 줄 렌더 · 재진입 |
> | **`subtext-missing`** | `subtext: null` | 줄 미렌더 (AC-4-139 ②) |
> | **`bubble-missing`** | `completionBubble: null` | 버블 미렌더, 전이 응답·Detail 동일 |
>
> `subtext: ''`·key 없음은 schema·컴포넌트 단위 테스트로 판정한다 — key 를 늘리지 않는다.
>
> ✅ **구현 반영 (Rev 8.7, Stage 4b `S4-F1R`, 2026-10-27)** — 위 `reminder-missing` 등재 그대로.
>
> | 항목 | 구현 |
> |---|---|
> | contracts | `SessionSummarySchema.reminderBubble` (`packages/contracts/src/sessions/session.ts`) — 키 누락 parse 거부 · `null`/`text: null`/`''`/긴 문자열 통과 |
> | Mock fixture | `apps/web/src/mocks/fixtures/sessions.ts` `MOCK_READY_REMINDER_BUBBLE` — ready·active·history 세션 전부에 채운다 |
> | scenario | `apps/web/src/mocks/sessions/sessionFixtureScenarios.ts` `session-greeting:reminder-missing` → 인사 = `MOCK_READY_BUBBLE` · `reminderBubble: null`. 그 밖의 key 는 리마인드 = `MOCK_READY_REMINDER_BUBBLE` |
> | 화면 | `entities/session/SessionReadyBubble` — `RecordingController` snapshot `readyReminderShown` 이 켜지면 제목 줄 글자만 교체 (같은 노드 · 1줄 clamp · pill 불변). 리마인드가 null/빈 값이면 DOM 불변 |

- Mock 응답도 contracts schema로 parse (fixture drift 방지).
- Fixture 아동 데이터는 가상 이름만 사용 (실제 아동 데이터 금지 — rules/frontend.md §5 fixtures 규칙).
- Figma placeholder 값(표지·제목·리포트 수치)을 fixture로 복사하지 않는다 (M-36).

---

## 6. Figma 대비 Contract Gap (design-agent 결과 반영)

아래 항목은 작성 시점(2026-09-14) 기준으로 **계약에 추가하지 않은 것**이다. PRD 근거가 없거나 PRD와 충돌하는 Figma 요소이므로, 해당 불일치(M-xx)가 결정된 뒤에만 contracts·Mock에 반영한다.

> ⭐ **갱신 2026-10-13 (plan-agent, Rev 8)** — Stage 4 승인으로 **`G-08` · `G-09` 2건이 해소**되었다 (`D4-12`·`D4-13`·`D4-14`·`D4-20`·`D4-21`·`D4-22`). 둘 다 **Figma 채택**이며 `G-08` 은 종전 *"현 계약 유지"* 를 **뒤집은 것**이다. 남은 `NEEDS DECISION` = **G-01 · G-06 · G-11 · G-12 · G-13 · G-14 (6건)**.
>
> **갱신 2026-10-02 (plan-agent)** — Stage 3 승인으로 **G-02 · G-03 · G-05 · G-07 4건이 해소**되었다 (`docs/decisions/stage-3-approvals.md` §3 · §8 · §8.5). `라벨` 열을 참조하고, 해소 항목은 **§3.6 · §4 Stage 3 표가 정본**이다. 나머지 항목은 여전히 `NEEDS DECISION` 이다.

| # | Gap | Figma 근거 | 현재 계약 | 채택 시 후보 변경 | 라벨 |
|---|---|---|---|---|---|
| G-01 | **주간 Progress 지표** (주간 세션 수·총 분·전주 대비 %, 요일별 분, 월 출석 달력, 주별 분, longest streak, % of nights read, 평균 세션 길이) | `31:102`, `110:522` | `ReportOverview` 에 주간 지표 없음 (PRD §7.7은 4주 리포트만) | `GET /v1/children/:childId/progress?weekStart=` → `WeeklyProgress`. 비교·달성률 표현("+18% vs last week", "80% of nights read")은 M-12 copy 결정 필요. 탭 표시 이름 "Progress"는 #15로 확정 (지표 채택과 별개) | NEEDS DECISION (M-10) |
| G-02 | **홈 누적 읽기 분** ("12-day/115 Min") | `26:40`, `26:43` | `HomeSummary` = `sessionsThisWeek`, `characterLine`, `lastHighlightLine?` — **minutes 없음 · `streakDays` 도 삭제됨** | **채택하지 않음.** `totalMinutes` 미추가 | **CONFIRMED (2026-09-29 §3 D-6 · 2026-10-02 §8.5 ①·④; M-30 해소)** — Home 집계는 "이번 주" 기준(=`/progress` 와 동일 창), Figma "12-day" 연속 일수 미채택, 누적 분 미표시. `streakDays` **삭제**(달성률 언어), `characterLine` **추가**(서버 값만 표시, 없으면 버블 미렌더) |
| G-03 | **Prompt 단계·페이지 태그** PRE / POST / P.6 | `139:2410–2412`, `163:2648`, `145:1132`, `88:960` | **추가 완료** — `Prompt` = `text`, `kind`, **`phase: 'pre' \| 'post' \| null` (optional)**, **`pageRef: string \| null` (optional)** — §3.6 | 반영 완료. 과거 후보 `'during'`·`pageRef: number` 는 **채택하지 않음** | **CONFIRMED (2026-10-02, §8 · §8.1 D-8; M-29 해소)** — Figma 기준 채택, Plan 권장안 기각. Backend: `phase` 판정 = `P3-BIP-13`, `pageRef` 책별 페이지 앵커 데이터 = `P3-BIP-14` (**콘텐츠 제작 범위** — 큐레이션 20권 페이지 메타 필요) |
| G-04 | **책 저장 / My Saved, 책 평점, 읽기 진행** ("Save to my shelf", "Rated 4.5", "Reading now · 3 of 5 nights", "Last read Tue · 12 min") | `86:245`, `86:372`, `145:1157`, `109:511`, `145:1141–1152` | 없음 (PRD FR-20 범위 밖) | `LibraryBook.saved` + `PUT/DELETE /v1/children/:childId/library/books/:id/saved`; `LibraryBook.averageRating` (회고 별점 집계인지 정의 필요); reading plan 모델(`targetNights`, `nightsRead`, `lastReadAt`) | **부분 재채택 (2026-10-05, approvals §12.8 `A-9`)** — ① **책 저장(`★ Save`)은 채택한다**: Figma `I86:438;86:383;117:973` 에 `Button/White 87×45 ★ Save` 가 실제로 있고(최우선 규칙 3), 사용자 결정은 *"현재 카드를 Library 의 favorites 에 저장한다"* 다 → 설계 **§3.7**. `D-7` 의 `★ Save` 제외 부분과 `AD-S3-8` 은 **무효**. 경로는 §3.7 의 `PUT/DELETE /v1/children/:childId/saved-books` 로 **변경**한다(이 열의 과거 안 `…/library/books/:id/saved` 는 저장 시 행이 아직 없을 수 있어 성립하지 않는다). ② **평점(`averageRating`) · reading plan 은 그대로 미채택** — `D-7` 의 그 부분은 유효하다 (2026-10-01, §7 D-7; M-14). 서재는 FR-20·FR-22 의 4기능 + 저장 축 |
| G-05 | **덱 카드별 역량** | `163:2648` — 3장이 각각 Self-Direction / Emotion / Intrinsic Motivation | **(b) 채택** — `ActivityCard.options[].capability` **추가**, 카드 단위 `targetCapability` 는 **삭제**(D-22, 2026-10-03 §9) (§3.6) | 반영 완료. §8.3 순환 스케줄 규칙 변경은 **추천 엔진 Backend 요구**(`P3-BIP-02`) | **CONFIRMED (2026-09-29, §3 D-5; M-31 해소)** — Figma 우선 적용, PRD §7.4·§8.3 은 **PRD 수정 대상 §5-2**. `" Day"` suffix 폐기(N-3), "Emotion Day Day"(M-13) 오타 미복제 |
| G-06 | **회고 칩 정의** | `91:710–714` Engaged / Big feelings / Ask Questions / Stay Focus / Tricky today (on/off) + 별점 `91:693` + 한 줄 입력 `91:716` | `ReflectionFormDefinition` 은 이름만 정의, `SubmitReflection.checks` 값 형태·선택지 미정 | PRD 체크 5종 ↔ 칩 1:1 매핑 후보 (아이 반응↔Engaged, 감정 표현↔Big feelings, 질문 여부↔Ask Questions, 집중 시간↔Stay Focus, 어려웠던 점↔Tricky today). 칩 = boolean인지 항목별 선택지인지, 문구, 자유 후기 별도 카드 여부 결정 후 `ReflectionCheckKey` enum + `checks: Record<ReflectionCheckKey, boolean>` 확정 | NEEDS DECISION (M-15) |
| G-07 | **Prompt 노출 시점** | 모든 카드 변형이 책 선택 전 Prompt 노출 (`163:2648`, `86:438`, `86:512/545`) | **`options[].promptPreview: Prompt[]` 추가** (선택 전 노출). `SelectActivityOption` 응답의 `promptSet` 은 그대로 유지 — §3.6 | 반영 완료. **길이 상한 없음**(N-2 + **D-21**: `.min(1)` 만, `.max(3)` 없음, Frontend 가 `slice` 하지 않는다 — 표시 개수 3은 cutoff) | **CONFIRMED (2026-09-29 §3 D-4 + 2026-10-01 §6.1 N-2; M-09 해소)** — Figma 우선 적용, PRD FR-07·§7.4·§8.2 는 **PRD 수정 대상 §5-1 · §6.2-4** |
| G-08 | **세션 준비 버블에 Prompt 목록** ("Try this prompt !") | `139:2803` (선언 **329×269** @ (34,336) · pill 간격 **6** · 세로 padding 위 **14** / 아래 **13**) | ⭐ **버블 하나가 둘 다 담는다** — **제목 줄 = `SessionSummary.bubble`**(검수 템플릿 인사) · **pill = `prompts`**. 두 값은 **출처가 다르고 섞이지 않는다**. 상세 = **§3.2.1** | ⛔ **종전 "PRD §7.5(자동 제시 금지) 기준 현 계약 유지" 를 뒤집는다.** Figma 기하를 그대로 구현한다(329 폭 · pill 5개 · 간격 6). 인사 없으면 **제목 줄 미렌더**(`D4-22`, 높이 28px 단축) · 인사는 **1줄 clamp** 상한 **≤240px**(`D4-21`) · ⛔ `Try this prompt !` 는 **Figma placeholder** 이며 제품 코드에 넣지 않는다 | ⭐ **Resolved — Figma 채택 (사용자 결정 2026-10-13, `D4-14` + `D4-20`·`D4-21`·`D4-22`; M-25 해소)** — `CLAUDE.md` Source of Truth(PRD ↔ Figma 충돌 시 **Figma 우선, 지점별 사용자 승인**)대로 처리했다. ⚠️ **PRD 수정 대상 8건** = `stage-4-approvals.md` **§6.2 (8~15)**. ⚠️ 되살아난 미결 2건: **`S4F-01`**(Prompt 개수 n 가변 시 높이 정책 — `D-21` 상한 없음) · **`S4F-02`**(pill 본문이 Figma 자체에서 38px 를 2줄로 넘친다) |
| G-09 | **녹음 Discard / Submit** | `163:1618`(`Discard`, 면 `--grays/gray-2` **`#aeaeb2`**) · `163:1620`(`Submit`) — ⭐ 2026-10-13 Figma 갱신으로 **둘 다 `285:1445` "After_record" 의 자식**이 되어 **용도가 확정**됐다 | ⭐ **둘 다 채택.** `Submit` → Toast(`Recording submitted`) → **`1c Complete & Feedback`** · `Discard` → **확인 다이얼로그**(`D4-17`) → **홈 복귀**. 전이표에 **`recording → abandoned` · `paused → abandoned` 2행 추가**(행 수 **12 → 14**) — §3.1 | ⭐ **이 절이 적어 둔 후보 "완료 전 폐기 = `abandoned` + 로컬 삭제, 서버 업로드 없음" 이 바로 채택된 안(안 A)이다** — 후보 표기를 **확정 서술로 바꾼다**. ⛔ `SessionStatus` 신규 값 **없음**(`discarded` 미채택) · **`AbandonedReason` 만들지 않는다** · `CompletedReason`·error code 신규 **0**. ⛔ **`recordingApi.abort()` 없음** — 서버가 part 를 스스로 정리(`P4-BIP-21`, §5.1.1) | ⭐ **Resolved — 안 A (사용자 결정 2026-10-13, `D4-12` + `D4-13`; M-26 부분 해소)**. ⚠️ **방치와 사용자 폐기를 구분할 수 없다** — 사유 값 추가는 별도 결정(`N4-30`, 이연). M-26 잔여 = `C13-1`·`C13-14` 디자이너 Figma 대기 + `N4-27`(paused 재개 경로) |
| G-10 | **가입 화면 아이 정보** | `179:1740` | 가입 입력에 아이 필드 없음 (`SignUpWithEmailInput`), 아이 정보는 동의 후 온보딩 Step 1 `child_info` (성·이름 두 칸, 성별 선택) — §3.4 | 반영 완료. Figma 가입 화면 수정은 디자이너 요청 | CONFIRMED (사용자 결정 2026-09-14, C-5 · C-6 · C-7; M-28 해소) |
| G-11 | **리포트 이메일 발송** | `110:861` | 없음 | `NotificationPreferences.reportEmailEnabled`, `NotificationKind.report_email` | NEEDS DECISION (M-11) |
| G-12 | **`conversation_only` 카드의 `★ Save` 대상** | `86:438` ActionBar (대화 전용 변형 **없음**) | `ActivityCardOption.book` · `userEnteredBook` 둘 다 없는 경우 저장 대상이 없다 (§3.7.2) | 버튼 비활성(`aria-disabled`) / 미렌더 / 대화 활동 자체를 저장 — 셋 다 Figma 근거 없음 | **NEEDS DECISION (2026-10-05, `A-9` 후속)** |
| G-13 | **`★ Save` 가 토글인가** | `117:973` `Button/White` — saved(채움) 변형 **없음** | contract 는 `PUT`/`DELETE` 로 양방향 지원 (§3.7.3) | ⓐ Home 은 저장 전용(1방향) + 해제는 Library ⓑ Home 버튼이 토글 — ⓑ 는 Figma 에 없는 시각 상태가 필요하다 | **NEEDS DECISION (2026-10-05, `A-9` 후속)** |
| G-14 | **저장 여부의 초기 표시** | — (Figma 에 saved 상태 없음) | `ActivityCardOption` 에 `saved` 없음 → 재방문 시 저장 상태가 보이지 않는다 | ⓐ 반영하지 않음(RECOMMENDED) ⓑ `ActivityCardOption.saved` 추가 ⓒ `BookSummary` 확장(**금지** — `AC-3-55`) — §3.7.4 | **NEEDS DECISION (2026-10-05, `A-9` 후속)** |
