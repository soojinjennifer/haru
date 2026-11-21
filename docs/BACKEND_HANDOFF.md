# HARU Backend Handoff

Status: **COMPLETE (development-agent `S8-J`, 2026-11-21)** — 초안(plan-agent 2026-11-20)을 실제 `packages/contracts` · Mock 위치 · Screen/Feature 연결 · `D8-1`~`D8-4` 결정으로 완성했다. 검증 = stage-qa-agent (`S8-K` — AC-8-78~85). 작업 기록 = `docs/qa/stage-8-handoff.md` `H8-10`.

> **이 문서는 Backend Developer 가 Frontend 코드를 다시 분석하지 않고 구현을 시작하기 위한 입구다.** 이 저장소는 Backend 를 구현하지 않았다 (Frontend-only, 사용자 지시 2026-09-14). 아래는 전부 **요구사항**이며 구현 계획이 아니다. Frontend 는 Stage 1–7 `PASS` 이고 Stage 8 은 Final QA 대기다.

## 0. 문서 지도

| 문서 | 내용 |
|---|---|
| **이 문서** | 개요 · **API 목록(§3 — 57행)** · 화면/기능 연결 · 기대 상태 변화 · Mock 위치 · **전 Stage `BACKEND_INTEGRATION_PENDING` 장부(§6)** · 출시 전 차단 항목 |
| `docs/API_CONTRACTS.md` | Request / Response / Enum / Error Envelope / Endpoint 표 / Mock Scenario key Catalogue(§5.4) — 기준 코드 `packages/contracts` (Rev 12.4 에서 최종 대조) |
| `docs/DATA_REQUIREMENTS.md` | 테이블 · 소유권 · RLS 유형 · 보관 · 삭제 cascade (Part A = Delta · 결정, Part B = `DATA_MODEL.md` 이관 본문) |
| `docs/AUTH_REQUIREMENTS.md` | 인증 · `AuthGateway` 9 메서드 · 동의 강제 · 소유권 · OAuth 복귀 · 탈퇴 |
| `docs/RECORDING_UPLOAD_SPEC.md` | 녹음 업로드 계약 · TUS · 상수 · RU-1~22 · 보관 · 삭제 |
| `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` | STT → 분석 → 생성 문구 → 리포트 파이프라인 · 안전 · 표시 제약 |
| `docs/ERROR_CODES.md` | Error Code 30종 · HTTP · `details` 모양 · Frontend 처리 · Mock 재현 · 쓰기 차단 범위 |

**단일 기준**: 모양(schema)은 `packages/contracts` (Zod) 가 정본이다. 문서와 코드가 다르면 코드가 사실이며 불일치를 보고한다. Backend 는 같은 schema 로 입력을 검증해야 한다 (`rules/backend.md` §4). contracts 는 `zod` 외 런타임 의존이 없어 Backend 에서 그대로 import 할 수 있다.

## 1. 제품 · 범위 요약

- HARU = 미국 1차 시장 Caregiver-facing Storytime Coach. 보호자가 계정 소유자, **아이는 계정 없음**, MVP Child Profile **1명**.
- 아동 음성 · 성장 데이터 = Privacy-sensitive (COPPA 우선). 법무 미결은 §7.
- 4대 역량 키: `emotion_regulation` · `self_directed_agency` · `cognitive_flexibility` · `intrinsic_motivation`.
- Frontend: React + Vite (`apps/web`), Mock Adapter 위에서 전 화면 검증. Http Adapter 는 contracts parse + `https:` 강제 + `Idempotency-Key` 첨부 **골격**만 있다 (`apps/web/src/shared/api/http/`). 실제 인증 · TUS Adapter 없음 (§5).

## 2. Backend 구조 요구 (`rules/backend.md` §4 요약)

| 요구 | 내용 |
|---|---|
| 계층 | `route → controller → service → repository → infrastructure` · 입력 = contracts schema 검증 |
| 오류 | 공통 Error Envelope + contracts Error Code (`ERROR_CODES.md`) |
| 인증 | Supabase Access Token(JWT) 검증 · caregiver → child → session/report 소유권 확인 (`AUTH_REQUIREMENTS.md`) |
| 동의 | 녹음 시작 · 업로드 확정 · 분석 요청 시 서버 측 보호자 동의 강제 · Consent History 보존 |
| 데이터 | family-owned 테이블 RLS · private Storage + 만료 signed URL · Raw Audio ↔ Derived Data 분리 |
| 보관 · 삭제 | Raw Audio 90일 자동 삭제는 **Storage API 로 객체까지** · 세션별 · 전체 삭제 · 탈퇴 · Audit Log |
| AI / STT | `AIProvider` · `SpeechToTextProvider` 어댑터 뒤 · Safety Filter + 금지어 + 검수 fallback · `ai_generation_logs` |
| 로그 | PII · Transcript 원문 · 이메일 · 복귀 경로 금지 · Secret 은 환경 변수만 |
| 멱등 | `Idempotency-Key` 헤더 endpoint 는 키 보관 (기본 24h, **세션 전이 · 업로드 계열은 최소 14일** — RU-14) · 같은 키 = 최초 응답 재생 · 같은 키 다른 body → `IDEMPOTENCY_KEY_REUSED` |
| 삭제 중 쓰기 | 전체 삭제 · 탈퇴 진행 중 계정의 쓰기 = `ACCOUNT_DELETION_PENDING` (409) — 범위 `ERROR_CODES.md` §4 |

## 3. API 목록

표기: 경로 앞 `/v1` · **IK** = `Idempotency-Key` 필수 · **CG** = `child_voice_data` 동의 가드 · **Auth** = `Bearer` 필요(✗ = 공개) · **Own** = 소유권 확인 대상 · `…` = `/v1/children/:childId`. Request/Response 이름은 `packages/contracts` 의 `…Schema` (접미사 생략). 모든 쓰기(✎)는 삭제 진행 중 `ACCOUNT_DELETION_PENDING` 대상 (`ERROR_CODES.md` §4). Http 골격 파일 = `apps/web/src/shared/api/http/Http<Domain>Api.ts`. "호출 0" = contract · Mock · Http 골격은 있으나 화면 호출 지점이 없다.

### 3.1 Contract · 인증 · 권한

| ID | Method · Path | Request → Response | 주요 Error | Auth · Authorization |
|---|---|---|---|---|
| E-01 | (AuthGateway) 9 메서드 — sign-up · sign-in · OAuth · reset · update password · session · refresh · sign-out | `SignUpWithEmail` · `SignInWithEmail` · … → `AuthResult{session: AuthSession \| null}` | `AUTH_*` · `PROVIDER_UNAVAILABLE` | Auth provider · 계정 본인 |
| E-02 | `GET /health` | — → `HealthResponse` | `INTERNAL_ERROR` · `RATE_LIMITED` | ✗ 공개 |
| E-03 | `GET /me` | — → `MeResponse` (caregiver{… `email`} · consentStatus · parentVerification · onboardingStatus · child? · plan) | `AUTH_REQUIRED` · `AUTH_TOKEN_EXPIRED` | Bearer · 본인 |
| E-04 | `PATCH /me` ✎ | `UpdateCaregiverRequest{displayName?, relationship?, timezone?}` → `MeResponse` | `VALIDATION_FAILED` | Bearer · 본인 · 아동 데이터 혼입 금지 |
| E-05 | `GET /consent-documents/current` | — → `CurrentConsentDocuments` (documents[{type, documentId, version, required, title, url}]) | — | ✗ 공개 |
| E-06 | `POST /consents` (IK) ✎ | `RecordConsentsRequest{items[{type, documentId, action:'granted'}], source}` → `ConsentStatus` | `CONSENT_VERSION_OUTDATED` · `VALIDATION_FAILED` · `IDEMPOTENCY_KEY_REUSED` | Bearer · 본인 |
| E-07 | `GET /onboarding` | — → `OnboardingState{instrument, steps[5], draftAnswers, currentStep}` | `CONSENT_REQUIRED` | Bearer · 본인 · 동의 후 |
| E-08 | `PUT /onboarding/steps/:step` ✎ | `SaveOnboardingStepRequest` (step 별 union) → `OnboardingState` | `CONSENT_REQUIRED` · `VALIDATION_FAILED` | Bearer · 본인 · 동의 후 |
| E-09 | `POST /onboarding/submit` (IK) ✎ | `SubmitOnboardingRequest{instrument{code,version}, answers}` → `ProfileResult` | `CONSENT_REQUIRED` · `ONBOARDING_INCOMPLETE` · `CHILD_LIMIT_REACHED` · `IDEMPOTENCY_KEY_REUSED` | Bearer · 본인 · 동의 후 |
| E-10 | `GET /books/search?q=&limit=&cursor=` | `SearchBooksRequest` → `SearchBooksResponse` (`Paginated<BookSummary>`) | `VALIDATION_FAILED` | Bearer |
| E-11 | `GET /books/:bookId/prompts?childId=` | — → `BookPromptsResponse{bookId, promptSet, reason?}` | `RESOURCE_NOT_FOUND` | Bearer · Own(child) |
| E-12 | `GET …/profile` | — → `ChildProfile` (child · latestSnapshot · strengths · growingEdges · persona · growthCapability · `profileUpdatedAt`) | `CHILD_NOT_FOUND` | Bearer · Own |
| E-13 | `PATCH …` ✎ | `UpdateChildRequest` (아이 필드 부분집합, 최소 1) → `ChildProfile` | `VALIDATION_FAILED(details.fields)` · `CHILD_NOT_FOUND` | Bearer · Own · 나이 재검증 |
| E-14 | `PUT …/growth-capability` ✎ | `SetGrowthCapabilityRequest{capability}` → `ChildProfile` | `VALIDATION_FAILED` · `CHILD_NOT_FOUND` | Bearer · Own |
| E-15 | `GET …/survey-update` | — → `SurveyUpdateState` | `CHILD_NOT_FOUND` | Bearer · Own |
| E-16 | `PUT …/survey-update/steps/:step` ✎ | `SaveSurveyUpdateStepRequest` → `SurveyUpdateState` | `VALIDATION_FAILED` · `CONSENT_REQUIRED` | Bearer · Own · 동의 |
| E-17 | `POST …/survey-update/submit` (IK) ✎ | `SubmitSurveyUpdateRequest` → `ChildProfile` | `ONBOARDING_INCOMPLETE` · `CONSENT_REQUIRED` · `IDEMPOTENCY_KEY_REUSED` | Bearer · Own · 동의 |
| E-18 | `GET …/capability-snapshots` | cursor → `CapabilitySnapshotPage` | — | Bearer · Own (schema 만 · API Client 없음) |
| E-19 | `GET …/personas` | cursor → `PersonaPage` | — | Bearer · Own (schema 만 · API Client 없음) |
| E-20 | `GET …/home` | — → `HomeSummary{todayCard, sessionsThisWeek, characterLine, lastHighlightLine?, activeSession?}` | `ONBOARDING_INCOMPLETE` | Bearer · Own |
| E-21 | `GET …/activity-cards/today` | — → `ActivityCard{date, options[3]}` | `ONBOARDING_INCOMPLETE` | Bearer · Own |
| E-22 | `POST /activity-cards/:cardId/selection` ✎ | `SelectActivityOptionRequest{optionId, readingContext, customTime?}` → `ActivityCardSelection` | `RESOURCE_NOT_FOUND` | Bearer · Own(card) |
| E-23 | `GET …/library/overview` | — → `LibraryOverview{readingNow, sections[]}` | `CHILD_NOT_FOUND` | Bearer · Own |
| E-24 | `GET …/library?filter=&limit=&cursor=` | `LibraryListRequest` → `LibraryListResponse` | `VALIDATION_FAILED` · `CHILD_NOT_FOUND` | Bearer · Own |
| E-25 | `POST …/library/books` (IK) ✎ | `AddOwnBookRequest{target}` → `LibraryBook` | `BOOK_ALREADY_OWNED` · `VALIDATION_FAILED` · `IDEMPOTENCY_KEY_REUSED` | Bearer · Own |
| E-26 | `PUT …/saved-books` ✎ (IK 없음 — 상태 설정) | `SaveBookRequest{target}` → `SavedBook(saved=true)` | `VALIDATION_FAILED` | Bearer · Own |
| E-27 | `DELETE …/saved-books/:bookId` ✎ | — → `SavedBook(saved=false)` | `RESOURCE_NOT_FOUND` | Bearer · Own |
| E-28 | `POST …/gift-requests` (IK) ✎ | `CreateGiftRequestRequest{bookId}` → `GiftRequest` | `GIFT_REQUEST_DUPLICATE` | Bearer · Own — **화면 호출 0** (증정 신청은 앱 밖 `D-26`) |
| E-29 | `GET …/gift-requests` | — → `GiftRequestListResponse` | `CHILD_NOT_FOUND` | Bearer · Own |
| E-30 | `GET` · `PUT /notification-preferences` ✎(PUT) | — / `UpdateNotificationPreferencesRequest` → `NotificationPreferences` | — | Bearer · 본인 — **호출 0** (알림 설정 화면 제외 `N8-23`) |
| E-31 | `POST /push-devices` ✎ (IK 없음 — token upsert) | `RegisterPushDeviceRequest{platform, token}` → `PushDevice` | — | Bearer · 본인 |
| E-32 | `DELETE /push-devices/:id` | — → 204 | `RESOURCE_NOT_FOUND` | Bearer · 본인 — **호출 0** (RU-20) |
| E-33 | `POST /sessions` (IK) ✎ | `CreateSessionRequest{childId, clientSessionKey, mode, readyAt, book…}` → `CreateSessionResponse` | `ONBOARDING_INCOMPLETE` · `SESSION_ALREADY_ACTIVE(details.sessionId)` | Bearer · Own(child) |
| E-34 | `GET /sessions/:sessionId` | — → `SessionDetail` (summary · recording · sticker? · completionBubble · reflection) | `RESOURCE_NOT_FOUND` | Bearer · Own(session) |
| E-35 | `POST /sessions/:sessionId/transitions` (IK, CG when `to=recording`) ✎ | `SessionTransitionRequest{to, occurredAt, recordedSeconds?, completedReason?}` → `SessionTransitionResult` | `SESSION_INVALID_TRANSITION(details.{from,to})` · `CONSENT_REQUIRED` · `SESSION_MAX_DURATION_EXCEEDED` | Bearer · Own · CG |
| E-36 | `GET …/sessions?status=&hasRecording=&limit=&cursor=` | `ListSessionsRequest` → `ListSessionsResponse` (`SessionListItem` = summary + `recording \| null`) | `CHILD_NOT_FOUND` | Bearer · Own |
| E-37 | `POST /sessions/:sessionId/recordings` (IK, CG) ✎ | `RecordingUploadInitRequest` → `RecordingUploadInitResponse` | `CONSENT_REQUIRED` · `RECORDING_NOT_ALLOWED_FOR_MODE` · `SESSION_INVALID_TRANSITION` | Bearer · Own · CG |
| E-38 | `POST /recordings/:recordingId/upload-tokens` (IK, CG) ✎ | `RefreshUploadTokensRequest{partNos}` → `RecordingUploadInitResponse` | `RECORDING_DELETED` | Bearer · Own · CG |
| E-39 | (TUS) `HEAD` · `PATCH` on `parts[].endpoint` | 바이트 | 401/403 = 만료 · 404/410 = 삭제 | `Bearer <uploadToken>` (경로 고정 signed token) |
| E-40 | `POST /recordings/:recordingId/complete` (IK, CG) ✎ | `RecordingUploadCompleteRequest` → `RecordingUploadCompleteResponse` | `RECORDING_INCOMPLETE(details.partNos)` · `UPLOAD_TOKEN_EXPIRED` | Bearer · Own · CG |
| E-41 | `GET /recordings/:recordingId` | — → `RecordingStatus` | `RESOURCE_NOT_FOUND` · `RECORDING_DELETED` · `FORBIDDEN` | Bearer · Own — **호출 0** |
| E-42 | `POST /sessions/:sessionId/reflection` (IK) ✎ | `SubmitReflectionRequest{rating \| null, checks[], note \| null}` → `Reflection` | `REFLECTION_ALREADY_SUBMITTED` · `SESSION_INVALID_TRANSITION` | Bearer · Own |
| E-43 | `GET /sessions/:sessionId/analysis` | — → `SessionAnalysisStatus` | `ANALYSIS_NOT_AVAILABLE` · `RESOURCE_NOT_FOUND` | Bearer · Own |
| E-44 | `GET …/progress/weekly?weekStart=` | `WeeklyProgressQuery` → `WeeklyProgress` | `VALIDATION_FAILED` · `CHILD_NOT_FOUND` | Bearer · Own |
| E-45 | `GET …/reports/overview` | — → `ReportOverview` | `CHILD_NOT_FOUND` | Bearer · Own |
| E-46 | `GET …/reports?limit=&cursor=` | `ReportListQuery` → `ReportSummaryPage` | `VALIDATION_FAILED` | Bearer · Own |
| E-47 | `GET /reports/:reportId` | — → `ReportDetail` | `REPORT_NOT_ELIGIBLE` · `REPORT_NOT_READY(details.retryAfter?)` · `RESOURCE_NOT_FOUND` | Bearer · Own(report) |
| E-48 | `POST /reports/:reportId/viewed` ✎ | — → 204 (멱등) | `RESOURCE_NOT_FOUND` | Bearer · Own |
| E-49 | `GET /highlight-clips/:clipId/playback-url` | — → `SignedMediaUrl{url, expiresAt}` | `RECORDING_DELETED(details.reason)` · `RESOURCE_NOT_FOUND` | Bearer · Own(clip) |
| E-50 | `POST /reports/:reportId/pdf` (IK) ✎ | — → `ReportPdfStatus` | `REPORT_NOT_READY` · `RESOURCE_NOT_FOUND` | Bearer · Own |
| E-51 | `GET /reports/:reportId/pdf` | — → `ReportPdfStatus` (생성 중 = 200 `generating`) | `PDF_NOT_READY`(다운로드 URL 직접 요청 시만) | Bearer · Own |
| E-52 | `GET /data-management` | — → `DataManagementSummary{retentionPolicy{rawAudioDays}, recordingsCount, activeDeletionRequest \| null}` | `AUTH_REQUIRED` | Bearer · 본인 |
| E-53 | `DELETE /sessions/:sessionId/recording` (IK) ✎ | — → `DeletionRequest(scope='session_recording', completed)` | `RECORDING_DELETED(details.reason)` · `ACCOUNT_DELETION_PENDING` | Bearer · Own(session) |
| E-54 | `POST /data-deletion-requests` (IK) | `CreateDeletionRequest{scope:'all_data', confirmation:true}` (`.strict()`) → `DeletionRequest` | `DELETION_ALREADY_REQUESTED` | Bearer · 본인 |
| E-55 | `GET /data-deletion-requests/:id` | — → `DeletionRequest` | `RESOURCE_NOT_FOUND` · `FORBIDDEN` | Bearer · 본인(요청 소유) |
| E-56 | `DELETE /me` (IK) | `DeleteAccountRequest{confirmation:true}` (`.strict()`) → `DeletionRequest(scope='account')` | `DELETION_ALREADY_REQUESTED` | Bearer · 본인 |
| E-57 | `GET /consents` | — → `ConsentHistory` (`API_CONTRACTS.md` §3.13 문서 전용) | — | Bearer · 본인 — **Frontend 미구현 (`N8-06` ⓑ, 선택 C-19)** |

### 3.2 Screen · Feature · PRD · 상태 변화 · Mock 위치

Mock 파일 = `apps/web/src/mocks/<폴더>/` · 그룹 = `?scenario=<group>:<key>` 의 group (key 목록 §5.2). Feature = `apps/web/src/` 기준 (entities hook → features 소비자).

| ID | Screen (Route) | Feature (hook → 소비자) | PRD | Frontend 가 기대하는 상태 변화 | Mock 위치 · 그룹 |
|---|---|---|---|---|---|
| E-01 | `/auth/welcome` · `sign-up` · `log-in` · `forgot-password` · `reset-password` | `shared/auth/*` → `features/auth` | FR-01 | 세션 생성 → `GET /me` → Guard 판정. 취소 = `session:null` | `auth/MockAuthGateway.ts` · `auth` |
| E-02 | (dev gallery 만 — 제품 호출 0) | `entities/health/useHealth.ts` | 기술 요구 | — | `health/MockHealthApi.ts` · `health` |
| E-03 | 전역 Route Guard · 설정 · 계정 | `entities/me/useMe.ts` → `app/guards` · `features/auth` · `settings` · `account-deletion` · `data-management` · `onboarding-survey` · `survey-update` · `reflection` | FR-01 · FR-02 · FR-03 | `consentStatus.missing` 비면 통과 · `onboardingStatus` 미완료 → 온보딩 · 전체 삭제 완료 후 미완료로 복귀 | `me/MockMeApi.ts` · `me` |
| E-04 | `/onboarding/:step` (Step 1 관계 · 타임존) | `entities/me/useUpdateCaregiver.ts` → `features/onboarding-survey` | §7.2 | 응답 `MeResponse` 로 캐시 교체 | `me/MockMeApi.ts` · `me` |
| E-05 | `/auth/consent` | `entities/consent/useConsentDocuments.ts` → `features/consent` | FR-02 | 문서 목록 · `required` 로 체크 필수 판정 | `consent/MockConsentApi.ts` · `consents` |
| E-06 | `/auth/consent` | `entities/consent/useRecordConsents.ts` → `features/consent` | FR-02 | 성공 → `me.consentStatus.missing=[]` → 다음 Guard 단계 | `consent/MockConsentApi.ts` · `consents` |
| E-07 | `/onboarding` · `/onboarding/:step` · `/onboarding/saved` | `entities/onboarding/useOnboardingState.ts` → `features/onboarding-survey` | FR-03 | `currentStep` 으로 복귀 · instrument 로 카드 수 파생 | `onboarding/MockOnboardingApi.ts` · `onboarding` |
| E-08 | `/onboarding/:step` | `useSaveOnboardingStep.ts` → `features/onboarding-survey` | FR-03 | 단계 이동마다 1회 저장 | 같음 |
| E-09 | `/onboarding/:step` → `/onboarding/profile` | `useSubmitOnboarding.ts` → `features/onboarding-survey` | FR-03~06 | `me.onboardingStatus=completed` · 아이 생성 · 스냅샷 · 페르소나 | 같음 |
| E-10 | `/library/add` | `entities/book/useBookSearch.ts` → `features/library` (`AddOwnBookForm`) | FR-23 | 검색 결과 cursor | `books/MockBooksApi.ts` · `books` |
| E-11 | 서재 · Home 책 상세 시트 | `entities/book/useBookPrompts.ts` → `features/library` | FR-07 · §8.2 | 시트 열 때 1회 | `books/MockBooksApi.ts` · `books` |
| E-12 | `/onboarding/profile` · `/settings/profile` · `/settings/child` · `/settings/growth-capability` · `/onboarding/growth-capability` | `entities/child-profile/useCurrentChildProfile.ts` → `features/child-profile-view` · `child-profile-edit` · `growth-capability` · `survey-update` | FR-04 · FR-05 · FR-06 · FR-15 | 제출 직후에도 완성 프로필 | `children/MockChildrenApi.ts` · `children` |
| E-13 | `/settings/child` | `useUpdateChild.ts` → `features/child-profile-edit` | §7.8 | 응답 프로필로 캐시 교체 | 같음 |
| E-14 | `/onboarding/growth-capability` · `/settings/growth-capability` | `useSetGrowthCapability.ts` → `features/growth-capability` | FR-06 | 선택 저장 → 다음 카드 반영(시점 서버) | 같음 |
| E-15~17 | `/settings/child/survey` · `/settings/child/survey/:step` | `useSurveyUpdateState` · `useSaveSurveyUpdateStep` · `useSubmitSurveyUpdate` → `features/survey-update` | §7.8 · FR-15 | draft `currentStep` 복귀 · 제출 → 새 스냅샷 · 페르소나 재생성 | 같음 |
| E-18 · E-19 | (호출 0 — 리포트 상세가 `ReportDetail` 안의 이력을 쓴다) | — | FR-15 | — | Mock 없음 (schema 만 — `contracts/src/children/{snapshot,persona}.ts`) |
| E-20 | `/` Home | `entities/home/useHomeSummary.ts` → `features/home-overview` | §7.4 | `activeSession` 있으면 진행 중 안내 | `home/MockHomeApi.ts` · `home` |
| E-21 | `/` 덱 | `useTodayActivityCard.ts` → `features/activity-card-deck` | FR-07 | 서버 `date` 신뢰 · 오프라인 시 캐시 카드 | `activities/MockActivityApi.ts` · `activity-cards` |
| E-22 | `/` 덱 · Reading Context 시트 | `useSelectActivityOption.ts` → `features/activity-card-deck` | FR-07 · FR-08 | 선택 → 이어서 E-33 (같은 `readingContext`) | 같음 |
| E-23 · E-24 | `/library` · See all 시트 | `useLibraryOverview` · `useLibraryList` → `features/library` | FR-20 · FR-22 | 섹션 1회 조회 · 시트 cursor | `library/MockLibraryApi.ts` · `library` |
| E-25 | `/library/add` | `useAddOwnBook.ts` → `features/library` | FR-23 | 성공 → 서재 무효화 · 중복 = 안내 | 같음 |
| E-26 · E-27 | Home 덱 `★ Save` · 서재 시트 | `useToggleSavedBook` · `useToggleLibrarySave` → `features/activity-card-deck` · `library` | FR-20 | 저장 직후 overview 재조회가 최신 (read-after-write) | 같음 |
| E-28 | (호출 0) | `useCreateGiftRequest.ts` (사용처 0) | FR-22 | — | 같음 · `library:gift-duplicate` |
| E-29 | `/library/gift-requests` · 책 상세 상태 Tag | `useGiftRequests.ts` → `features/library` | FR-22 | 상태 라벨만 표시 | 같음 |
| E-30 · E-32 | (호출 0) | — | FR-08 | — | `notifications/MockNotificationApi.ts` · `notifications` |
| E-31 | (권한 요청 후 등록 — 세션 완료 흐름) | `features/notification-preferences/model/usePushPermission.ts` | FR-08 | Web 토큰 = 자리표시 값 (RU-19) | 같음 · 권한 포트 `platform/MockPushPermissionPort.ts` · `push` |
| E-33 | `/` 덱 · 책 상세 → `/session/:sessionId` | `entities/session/useCreateSession.ts` → `features/activity-card-deck` · `library` | FR-09 · FR-10 | `ready` 생성 · 진행 중이면 그 세션으로 | `sessions/MockSessionApi.ts` · `sessions` (+ `session` · `session-greeting`) |
| E-34 | `/session/:sessionId` · `/complete` · `/feedback` | `useSessionDetail` · `useSessionCompletion` → `features/storytime-session` · `reflection` · `session-feedback` | FR-09 | 상태 표시 · 완료 버블 · 회고 여부 | 같음 (+ `session-completion`) |
| E-35 | `/session/:sessionId` | `features/recording/model/session-outbox.ts` (RecordingController) · `useCloseReadySession.ts` | FR-09 · FR-19 · FR-21(Discard) | `ready → recording ⇄ paused → completed` · `→ abandoned` (방치 · 닫기 · Discard) · 오프라인 = Outbox 재전송 | 같음 |
| E-36 | `/settings/data/recordings` | `entities/data-management/useRecordingSessions.ts` (`hasRecording=true`) → `features/recording-deletion` | FR-20 · FR-21 | 행마다 녹음 상태 · cursor 2페이지 | `data-management/MockDataManagementApi.ts` · `data-management` |
| E-37~40 | (배경 업로드 — 세션 · 완료 화면 안내) | `features/recording/model/upload-queue.ts` · `TusUploadTransport` | FR-14 · NFR 오프라인 | `pending → uploaded` · 세션 `completed → analyzing` · 실패 = 로컬 보존 + 재시도 · 48h 안내 | `recordings/MockRecordingApi.ts` · `MockUploadTransport.ts` · `recordings` (+ `recorder`) |
| E-41 | (호출 0) | `recordingApi.status` | FR-14 · FR-21 | — | `recordings/MockRecordingApi.ts` |
| E-42 | `/session/:sessionId/complete` 회고 카드 | `entities/reflection/useSubmitReflection.ts` → `features/reflection` | FR-12 | 세션당 1건 · 이미 제출 = 완료로 간주 | `reflections/MockReflectionApi.ts` · `reflections` |
| E-43 | `/session/:sessionId/feedback` | `entities/analysis/useSessionAnalysis.ts` → `features/session-feedback` | FR-13 · FR-14 | `analyzing` 폴링 → `analyzed`(full · excluded_low_quality) / `failed` | `analysis/MockAnalysisApi.ts` · `analysis` |
| E-44 | `/progress` | `entities/weekly-progress/useWeeklyProgress.ts` → `features/progress-overview` | §7.7 | 주 선택 · `availableWeeks` | `progress/MockProgressApi.ts` · `progress` |
| E-45 · E-46 | `/progress` | `useReportOverview` · `useReportList` → `features/progress-overview` | FR-16 | 주기 `in_progress → generating → published` / `deferred` / `delayed` | `reports/MockReportApi.ts` · `reports` |
| E-47 · E-48 | `/progress/reports/:reportId` | `useReport` · `useMarkReportViewed` → `features/report-detail` | FR-16 | 발행 = 불변 · 첫 열람 시 `viewed` | 같음 |
| E-49 | `/progress/reports/:reportId` 클립 | `entities/highlight-clip/usePlaybackUrl.ts` → `features/highlight-clip-player` | FR-18 | 탭 시 URL 발급 · 만료/삭제 안내 | `highlight-clips/MockHighlightClipApi.ts` · `highlight-clips` |
| E-50 · E-51 | `/progress` 카드 · 리포트 상세 PDF | `entities/report/useReportPdfRequests.ts` → `features/report-pdf` | FR-17 | `queued → generating → ready \| failed` · 60s 지연 안내 · `fetch → File` 저장 · 공유 | `reports/MockReportPdfApi.ts` · `report-pdf` (+ `platform/MockFileSharePort.ts`) |
| E-52 | `/settings/data` · `/settings/data/recordings` · `/settings/account` | `entities/data-management/useDataManagementSummary.ts` → `features/data-management` · `recording-deletion` · `account-deletion` | §7.8 · FR-21 | 보관 일수 = 응답 값 · 진행 중 요청 표시 | `data-management/MockDataManagementApi.ts` · `data-management` |
| E-53 | `/settings/data/recordings` | `features/recording-deletion/model/useDeleteSessionRecording.ts` | FR-21 | 확정 → 행 `deleted` · 로컬 청크 삭제 · 큐 취소 · 요약 갱신 | 같음 |
| E-54 | `/settings/data` | `features/data-management/model/useCreateDeletionRequest.ts` | FR-21 · NFR | `received → processing → completed \| failed` · 기기 표시 저장 · 쓰기 차단 시작 | 같음 |
| E-55 | `/settings/data` + 앱 전역 감시 | `entities/data-management/useDeletionRequest.ts` → `features/data-management` · `app/providers/DataDeletionWatcher.tsx` | FR-21 | 5s 폴링(상한 60 — 가값 `P-42`) · `completed` = 로컬 정리 + Toast 1회 → 온보딩 | 같음 (+ `dataDeletionMarkerSeed.ts`) |
| E-56 | `/settings/account` | `features/account-deletion/model/useDeleteAccount.ts` | §7.8 | 성공 즉시 로컬 정리 + sign-out → `/auth/welcome` + Toast | `account/MockAccountApi.ts` · `account` |
| E-57 | (미구현) | — | FR-02 · PRD §12.1 | — | 없음 |

## 4. Frontend 가 기대하는 상태 변화 (객체별 요약)

| 객체 | 전이 | 정본 |
|---|---|---|
| Session | `ready → recording ⇄ paused → completed → analyzing → analyzed` · `analyzing → failed → analyzing`(재시도) · `ready/recording/paused → abandoned` (10분 방치 · ready 닫기 · Discard — 사유 구분 없음) | `packages/contracts/src/rules/session-transitions.ts` · `API_CONTRACTS.md` §3.1 |
| Recording upload | `pending → uploaded → (expired \| deleted)` · `failed` | `enums/upload-status.ts` · `RECORDING_UPLOAD_SPEC.md` |
| Analysis | `SessionAnalysisStatus.sessionStatus` + `outcome`(`full` · `excluded_low_quality`) · `shortFeedback.text \| null` | `ANALYSIS_PIPELINE_REQUIREMENTS.md` §0 |
| Report cycle | `in_progress → generating → published` / `deferred` / `delayed` — `ReportOverview` 의미(C7-2a) | `API_CONTRACTS.md` §4 Stage 7 · `P7-BIP-15` |
| Report PDF | `queued → generating → ready \| failed` (`ready` 면 URL · 만료 · 파일명 필수) | `reports/` `ReportPdfStatusSchema` |
| Deletion request | `received → processing → completed \| failed` · 세션 녹음 삭제는 즉시 `completed` | `data-management/deletion-request.ts` · `DATA_REQUIREMENTS.md` A.4 |
| Account | 정상 → `deletion_pending`(전체 삭제 · 탈퇴 진행) → (전체 삭제 완료) `onboardingStatus` 미완료 / (탈퇴 완료) 계정 없음 | `AUTH_REQUIREMENTS.md` §7 |
| Onboarding | `OnboardingStatus` `not_started → in_progress → completed` · 세션 endpoint `ONBOARDING_INCOMPLETE` 와 `me.onboardingStatus` 일관 (`P4B-BIP-08`) | `AUTH_REQUIREMENTS.md` §4 |
| Gift request | `requested → approved → shipped → delivered` / `cancelled` · `rejected` (서버 소유 — 화면은 라벨만) | `enums/gift-request.ts` · `P3-BIP-24` |

## 5. Mock → Http 교체 · Mock 위치

### 5.1 교체 방법

- Adapter 선택 = **`apps/web/src/app/providers/apiClients.ts` 한 곳** (`VITE_API_MODE=mock|http`). `mock` 일 때만 `apps/web/src/mocks` 를 동적 import 한다 — `http` 빌드에는 Mock 코드가 없다(`pnpm assert:no-mocks`). UI · Feature · Query 코드는 바꾸지 않는다.
- 환경 변수: `VITE_API_MODE` · `VITE_API_BASE_URL`(http — `https:` 강제) · `VITE_MOCK_SCENARIO`(mock 기본 scenario). Secret 류 `VITE_*` 0 (`assert:preview` 검사).
- Http Adapter 는 contracts 로 요청 · 응답을 parse 한다 — 서버 응답이 schema 와 다르면 Frontend 가 오류로 처리한다. 응답 schema 에 길이 제약은 없다(문구 길이는 생성 가이드 — `ANALYSIS_PIPELINE_REQUIREMENTS.md` §4).
- 인증 · 업로드 실제 Adapter(Supabase `AuthGateway` · TUS 서버)는 **아직 없다** (Stage 0 #27). `http` 모드 인증 = `UnavailableAuthGateway`(`PROVIDER_UNAVAILABLE`). Backend 연동 시점에 추가 — `OAQ-19`.
- **Mock 전용 route 제거 대상 = 0** (`S3-ROUTE-1` · `D-17`, 부록 B.3-1): `mockPreviewRoutes` 는 생성된 적이 없고(`git log -S` 0), `app/router.tsx` · `shared/config/routes.ts` 에 Mock 전용 route 가 없다 (`/library/add` · `/library/gift-requests` 는 제품 route). dev 전용 route(`/dev/*` gallery · Scenario Panel)는 `import.meta.env.DEV` 게이트로 Production · 프리뷰에서 빠진다(`assert:preview` dev 표식 0).
- Mock 데모 웹 프리뷰(`pnpm build:preview` — `VITE_API_MODE=mock` 강제 · sourcemap 끔)는 Cloudflare Pages + Access 로 비공개 배포한다 (`docs/qa/stage-8-preview-deploy.md`, 사용자 수행 `S8-I-U`). Backend 배포가 아니다.

### 5.2 Mock 파일 · Scenario 그룹 (26개 — 정본 key 의미는 `API_CONTRACTS.md` §5.4)

| Group | Mock 파일 (`apps/web/src/mocks/`) | Key (`success` 외) |
|---|---|---|
| `auth` | `auth/MockAuthGateway.ts` | loading · error · retry · offline · token-expired · provider-cancelled |
| `me` | `me/MockMeApi.ts` | loading · error · retry · offline · token-expired · consent-missing · consent-version-outdated · vpc-pending · vpc-failed · onboarding-incomplete |
| `consents` | `consent/MockConsentApi.ts` · `consentState.ts` | loading · error · retry · offline · consent-missing · consent-version-outdated |
| `onboarding` | `onboarding/MockOnboardingApi.ts` · `onboardingState.ts` | loading · error · retry · offline · consent-missing · vpc-pending · vpc-failed · onboarding-incomplete · draft-resume · persona-fallback · child-limit-reached · capability-all-missing · prefilled-child-info · missing-prefill · instrument-v2 · owned-books-empty |
| `books` | `books/MockBooksApi.ts` | loading · empty · error · retry · offline · no-reason |
| `home` | `home/MockHomeApi.ts` | loading · empty · error · retry · offline · session-already-active · onboarding-incomplete |
| `activity-cards` | `activities/MockActivityApi.ts` · `activityCardCacheSeed.ts` | loading · empty · error · retry · offline · offline-cached-card · reread-option · books-exhausted · book-saved · onboarding-incomplete · cold-to-warm · difficulty-lowered |
| `library` | `library/MockLibraryApi.ts` | loading · empty · error · retry · offline · favorites-empty · finished-empty · curated-empty · reading-now-none · shelf-partial · unrated · user-entered-book · gift-pending · gift-duplicate · book-already-owned · paged · book-saved · unsave |
| `health` | `health/MockHealthApi.ts` | loading · error · retry · offline |
| `sessions` | `sessions/MockSessionApi.ts` · `sessionState.ts` · `sessionHistory.ts` | loading · empty · error · retry · offline · invalid-transition · session-already-active · session-already-active-ready · session-already-active-paused · onboarding-incomplete · consent-missing · abandoned · recording-discarded |
| `session` · `session-greeting` · `session-completion` | `sessions/sessionFixtureScenarios.ts` | prompts-1/3/7 · prompts-empty · book-missing · book-no-cover · book-long-title / greeting-missing · greeting-empty · greeting-tight · greeting-long · reminder-missing / subtext-missing · bubble-missing · reflection-submitted |
| `recordings` | `recordings/MockRecordingApi.ts` · `MockUploadTransport.ts` · `recordingScenarios.ts` | loading · error · retry · offline · consent-missing · recording-upload-success · recording-upload-failure · upload-retry · upload-token-expired · recording-incomplete · offline-queued · upload-stalled-48h · recording-deleted · recording-discarded |
| `recorder` | `recorder/recorderScenarios.ts` · `localStoreScenarios.ts` · `deviceSeed.ts` · `platform/MockRecorderAdapter.ts` | mic-permission-denied · mic-permission-blocked · mic-unavailable · mic-permission-revoked · recording-interrupted · web-background-warning · auto-timeout · crash-recovered · local-retention-exceeded · local-retention-notice |
| `notifications` · `push` | `notifications/MockNotificationApi.ts` · `platform/MockPushPermissionPort.ts` | loading · error · retry · offline / push-permission-denied |
| `reflections` | `reflections/MockReflectionApi.ts` | loading · error · retry · offline · reflection-already-submitted · invalid-transition |
| `analysis` | `analysis/MockAnalysisApi.ts` · `analysisScenarios.ts` | loading · error · retry · offline · analysis-pending · analysis-completed · analysis-failed · analysis-low-quality · analysis-not-available · recording-deleted · analysis-pending-then-completed · analysis-feedback-missing |
| `children` | `children/MockChildrenApi.ts` · `childProfileRecords.ts` · `childProfileState.ts` | loading · empty · error · retry · offline · profile-updated · persona-changed · persona-fallback · all-scores-missing · scores-partially-missing · validation-failed · survey-update-draft · survey-update-submitted |
| `progress` | `progress/MockProgressApi.ts` | loading · empty · error · retry · offline · progress-first-week · progress-multi-week |
| `reports` · `report-pdf` | `reports/MockReportApi.ts` · `MockReportPdfApi.ts` · `reportScenarios.ts` · `reportState.ts` | loading · empty · error · retry · offline · report-eligible · report-not-eligible · report-deferred · report-deferred-first · report-delayed · report-published-unviewed · report-persona-unchanged · report-no-previous / pdf-generating · pdf-failed · pdf-timeout · share-cancelled · share-unsupported |
| `highlight-clips` | `highlight-clips/MockHighlightClipApi.ts` · `highlightClipScenarios.ts` | loading · error · retry · offline · clip-expired · recording-deleted · clip-url-expired |
| `data-management` | `data-management/MockDataManagementApi.ts` · `dataManagementScenarios.ts` · `deletionState.ts` · `recordingHistory.ts` · `dataDeletionMarkerSeed.ts` | loading · empty · error · retry · offline · deletion-processing · deletion-failed · deletion-retry · deletion-already-requested · deletion-completed-offscreen · recording-deleted · recording-delete-local-pending |
| `account` | `account/MockAccountApi.ts` (쓰기 차단 = `common/writeGuard.ts`) | loading · error · retry · offline · deletion-pending-write-blocked |

공통 동작: `common/delivery.ts`(지연 · 오류 · 오프라인) · `common/idempotency.ts`(IK 재생 · `IDEMPOTENCY_KEY_REUSED`) · `common/connectivity.ts` · 요청 로그 `request-log.ts`. Fixture = `mocks/fixtures/*.ts` (전부 가상 데이터 · 가상 이메일 `@example.com`). 전환 = `?scenario=<group>:<key>` (그룹 생략 = 전체 · 여러 그룹 쉼표 · 메서드 단위 `group.method:key`). Mock 은 결정적이다 (`mocks/__tests__/stage4-determinism.test.ts` 등).

## 6. `BACKEND_INTEGRATION_PENDING` 장부 (전 Stage 1:1)

> 대상 문서 약어: **BH** = 이 문서 · **DR** = DATA_REQUIREMENTS · **AR** = AUTH_REQUIREMENTS · **RU** = RECORDING_UPLOAD_SPEC · **AP** = ANALYSIS_PIPELINE_REQUIREMENTS · **EC** = ERROR_CODES. **연결** = §3 endpoint ID (Screen · Feature · Mock 위치는 그 행). 출처 열의 문서에 원문과 Frontend 판정 AC 가 있다. Stage 1 발 PENDING = 0 (`stage-1-qa-report.md` §7).
> ⚠️ **ID 충돌 (재번호 금지 — `N8-22`)**: ① `P2-BIP-12`~`16` 이 두 벌 → `(A)` = `docs/qa/stage-2-handoff.md` §4 판, `(R)` = 온보딩 재구성 판(`stage-2-rework-handoff.md` §9) ② `RU-19`~`21` 이 두 벌 → 무표기 = `stage-4a-handoff.md`, `(4b)` = `stage-4b-handoff.md` F1-10 ③ `API_CONTRACTS.md` §3.8 이 `characterLine` 길이에 `P3-BIP-16` 을 붙였으나 그 ID 는 책 평점 집계다 → `HX-3-03` 으로 정정(Rev 12.4).
> **HX-** = QA 리포트 · handoff 메모 본문에 PENDING 으로 적혔지만 BIP 번호가 없던 항목 (§6.8 에서 새로 ID 부여).

### 6.1 Stage 2 — Auth · Consent · Onboarding · Child Profile

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P2-BIP-01 | 실제 인증 Provider — Email/Google/Apple 계정 · 토큰 발급 · 검증 · refresh | AR · BH | E-01 | stage-2-handoff §4 |
| P2-BIP-01a | `GET /v1/me` 실제 응답 — Guard 판정 입력 전부(`consentStatus.missing` · `parentVerification.status` · `onboardingStatus`) | BH · AR | E-03 | 〃 |
| P2-BIP-02 | 비밀번호 재설정 메일 · 링크 토큰 · 만료 (계정 존재 여부 비노출) | AR | E-01 | 〃 |
| P2-BIP-03 | 서버 측 필수 동의 강제 — 동의 없이 `children` · `onboarding_responses` 쓰기 거부 (`CONSENT_REQUIRED`) — `submit` · `PUT steps` 양쪽 | AR · DR · EC | E-07~09 | 〃 · rework §9 |
| P2-BIP-04 | `consent_events` append-only · 문서 버전 관리 · `current_consents` view · `required` · `version` 노출 | AR · DR | E-05 · E-06 | 〃 |
| P2-BIP-05 | VPC 실제 방식 · 검증 · 기록 (법무 L-01) — endpoint · payload 미정의 | AR | E-03 | 〃 |
| P2-BIP-06 | 온보딩 서버 draft · `survey_instruments` 버전 · 문항 배포 + 신규 요구 4건(instrument 응답 필수 · 새 코드 `label` 동반 · 버전 호환 서버 책임 · 닫힌 문항 id 집합) | DR · BH | E-07 · E-08 | 〃 |
| P2-BIP-07 | 룰 기반 역량 스코어 · 스냅샷 — `rules/capability-score` 그대로 재사용 · score NULL 허용 | DR · AP | E-09 | 〃 |
| P2-BIP-08 | 페르소나 생성 · 금지어 · fallback pool · `ai_generation_logs` · 3초 · 실패 시 fallback 200 | AP · BH | E-09 · E-12 | 〃 |
| P2-BIP-09 | 발전 역량 기본값(최저 스코어) · `capability_snapshots` · `capability_scores` · `growth_capability_selections` | DR | E-09 · E-14 | 〃 |
| P2-BIP-10 | `children` caregiver 당 1명 UNIQUE (`CHILD_LIMIT_REACHED`) | DR · EC | E-09 | 〃 |
| P2-BIP-11 | Idempotency-Key 서버 보관 24h · 재생 · 다른 body → `IDEMPOTENCY_KEY_REUSED` | BH · EC | E-06 · E-09 | 〃 |
| P2-BIP-12 (A) | OAuth 실제 흐름(리디렉트 / 네이티브 `signInWithIdToken` + nonce) · **취소 = `AuthResult{session:null}` 성공** | AR | E-01 | 〃 |
| P2-BIP-13 (A) | 책 검색 코퍼스 · 매칭 · 정렬 · 페이지네이션 | DR | E-10 | 〃 |
| P2-BIP-14 (A) | `PATCH /v1/me` 관계 · 타임존 — 아동 데이터 혼입 금지(D-16) · timezone 신뢰 · 저장 | AR · DR | E-04 | 〃 · contracts-handoff §8 |
| P2-BIP-15 (A) | 서버 측 세션 무효화(로그아웃) — refresh token 폐기 | AR | E-01 | 〃 |
| P2-BIP-16 (A) | 서버 측 사용자 데이터 삭제 경로 (→ Stage 8 `P8-BIP-02`·`03`) | DR · BH | E-54 · E-56 | 〃 |
| P2-BIP-12 (R) | instrument 단계 체계 마이그레이션 (`onboarding_v1_1/1.1.0` ↔ `2.0.0`) | DR | E-07 · E-09 | stage-2-rework-handoff §9 |
| P2-BIP-13 (R) | `owned_books` 추천 후보 제외 + 유사 책 첫 3세션 가중 하향 | DR · BH · AP | E-09 · E-21 | 〃 · rework QA §10 (AC-2R-15) |
| P2-BIP-14 (R) | cold-start state vector (`comfort_zone` · `axis_weights` · `interest_weights` · `channel` · `owned_books` · `age_months`) | BH · AP | E-09 · E-21 | 〃 |
| P2-BIP-15 (R) | `depends_on_the_day` · `not_sure_yet` 처리 (중간 등급 기본값 + 3세션 후 재보정 / 관심 가중 미적용) | BH · AP | E-09 | 〃 |
| P2-BIP-16 (R) | instrument `estimates`(소요 시간) 서버 제공 | BH | E-07 | 〃 |
| P2-BIP-17 | 가입~동의 사이 로컬 보관 아동 데이터 — `submit` 수신분 동의 기록 존재 서버 강제 | AR · DR | E-09 | 〃 |
| P2-BIP-18 | Q5 책 카탈로그 = `instrument.questions[owned_books].options` `{code: book_id, label: title}` | BH | E-07 | 〃 · rework QA §10 |
| P2-BIP-19 | `children.owned_books uuid[]` 저장 | DR | E-09 | 〃 · rework QA §10 |

### 6.2 Stage 3 — Home · Activity Card · Library · Recommendation

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P3-BIP-01 | 일일 Activity Card 생성 잡 07:00 · `UNIQUE(child_id, card_date)` · caregiver timezone · 클라이언트는 서버 `date` 신뢰 · 항상 책이 있는 카드(HX-3-05) | BH · DR | E-21 | stage-3-plan §10 · home-handoff §6 · R9 |
| P3-BIP-02 | Cold/Warm 추천 · 역량 순환 · 주제 매칭 (`options[].capability`) · 추천 이유 문장 | AP · BH | E-21 | 〃 |
| P3-BIP-03 | Prompt 라이브러리 콘텐츠 · 감수 · 재독 새 세트 · 제시 개수 = 서버 정책 | AP · BH | E-11 · E-22 · E-33 | 〃 |
| P3-BIP-04 | 카탈로그 20권 · 표지 CDN · 구매 링크 · 연령 게이팅 | DR · BH | E-21 · E-23 | 〃 |
| P3-BIP-05 | 증정 프로그램 운영 · 상태 전이 · 중복 판정 (신청은 앱 밖 `D-26`) | BH | E-28 · E-29 | 〃 |
| P3-BIP-06 | 증정 배송지 저장 위치 · 보호 (Frontend 미수집) | DR (+법무) | E-28 | 〃 |
| P3-BIP-07 | invitational push 발송 · Context 별 문구 · 평균 시간대 학습 | BH | E-22 · E-31 | 〃 |
| P3-BIP-08 | push provider · 기기 토큰 저장(암호화) · 해지 · payload PII 최소화 | BH · DR | E-31 · E-32 | 〃 |
| P3-BIP-09 | `child_books` 소유 상태 · 읽은 책 히스토리 (`first_read_at` · `last_read_at` · `read_count`) | DR | E-23 · E-24 | 〃 |
| P3-BIP-10 | Activity Card 로딩 2초 (실 API 성능) · 카드 응답의 `child_books` 조인(`saved`) 포함 | BH | E-21 | 〃 · home-handoff R9 |
| P3-BIP-11 | 진행 중 세션 판정 서버 권한 (`HomeSummary.activeSession` · `SESSION_ALREADY_ACTIVE`) | BH | E-20 · E-33 | 〃 |
| P3-BIP-12 | IK 24h (`library/books` · `gift-requests`) + 카드 채택률 KPI 로깅 | BH · DR | E-22 · E-25 · E-28 | 〃 |
| P3-BIP-13 | Prompt `phase`(pre/post) 판정 | AP | E-11 · E-34 | 〃 |
| P3-BIP-14 | Prompt `pageRef` 페이지 앵커 데이터 (**콘텐츠 제작 범위** — `S3-PROMPT-1` · `D-8`) | AP · DR | E-11 · E-34 | 〃 |
| P3-BIP-15 | `★ Save` 저장 상태 서버 소유 (`saved` · `saved_at` · `source=card_save`) · 응답 `SavedBook` 유지 · 저장 직후 overview read-after-write | DR | E-26 · E-27 · E-23 | 〃 (Rev 4) · stage-3 QA §8.2 |
| P3-BIP-16 | 책 단위 평점 집계 (모집단 = 해당 Child 의 세션 평점 · 최소 표본 · 비판정 톤) · `averageRating` nullable | DR · AP | E-23 · E-24 | stage-3 QA §8.1 |
| P3-BIP-17 | 다회차 읽기 진행 집계(`progressRatio` 서버 산식 · `plannedNights` 출처 미결) · Reading now 선정 규칙 · `lastSessionMinutes` 출처 | DR · BH | E-23 | 〃 |
| P3-BIP-18 | 서재 섹션 집계 1회 조회 · 섹션별 커서 · Favorites 순서 | BH | E-23 | 〃 |
| P3-BIP-19 | **상용 그림책 표지 · 책 정보 법무 게이트** — 표지 3종은 `S8-I` 에서 중립 단색으로 교체했다가(`N8-13` ⓐ, `H8-7`) **`D8-7`(2026-11-21)로 번복 — Figma 표지 3종을 초대 전용 프리뷰(Cloudflare Access)에 표시**(`H8-14`). 공개 배포 금지. **실제 책 제목 · 저자 · 표지** — 정식 출시 전 법무 확인 (`D8-4` · `D8-7` · `H8-7-N4`). 이전 커밋 기록에 원본 표지 잔존(`H8-7-N3`) | BH (출시 전 차단 §7) | E-21 · E-23 | 〃 · stage-8-handoff H8-7 |
| P3-BIP-20 | 커서 페이지네이션 `nextCursor` 불투명 · 중복/누락 0 | BH | E-24 · E-36 · E-46 | 〃 |
| P3-BIP-21 | `BOOK_ALREADY_OWNED`(409) 재등록 — 오류 대신 멱등 응답도 허용(Frontend 는 둘 다 처리) | EC | E-25 | 〃 · library-r1 §7 |
| P3-BIP-22 | IK 서버 24h 보관 · 재생 (Frontend · Mock 부분은 AC-3-36 PASS) | BH | E-25 · E-28 | 〃 |
| P3-BIP-23 | `GET /v1/books/:bookId/prompts?childId=` 연령대 · 역량별 세트 + `reason` (카탈로그 외 책 호출 0) | BH | E-11 | 〃 |
| P3-BIP-24 | 증정 요청 상태 전이 `requested → approved → shipped → delivered` / `cancelled` · `rejected` | BH | E-29 | 〃 |
| P3-BIP-25 | `purchaseUrl` 허용 도메인 보장 | BH | E-23 · E-24 | 〃 |
| P3-BIP-26 | `BookPromptsResponse.reason` 서버 생성 (1~2문장 · 진단 금지 · 없으면 null · 길이 상한 contract 없음) | AP | E-11 | 〃 · library-r2c §8 |

### 6.3 Stage 4 — Session · Recording

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P4-BIP-01 | 서버 전이 강제 (`SESSION_INVALID_TRANSITION`) | BH · EC | E-35 | stage-4-plan §10 · 4a QA §7.2 |
| P4-BIP-02 | 녹음 시작 · 업로드 확정 · 분석 요청 시 서버 측 동의 강제 + `consent_event_id` 고정 | AR · DR | E-35 · E-37 · E-40 | 〃 |
| P4-BIP-03 | 30분 상한 서버 검증 (`SESSION_MAX_DURATION_EXCEEDED`) | RU | E-35 | 〃 |
| P4-BIP-04 | `ready` 10분 방치 server sweeper → `abandoned` (기준 = 클라이언트 `readyAt`, RU-19 (4b)) | BH | E-33 · E-35 | 〃 |
| P4-BIP-05 | signed upload token 발급 · 재발급 (4a AC-4-94-B) | RU | E-37 · E-38 | 〃 |
| P4-BIP-06 | TUS 수신 · part 검증(bytes · sha256 · duration) → `RECORDING_INCOMPLETE` | RU | E-39 · E-40 | 〃 |
| P4-BIP-07 | `complete` 시 `completed → analyzing` + `expiresAt` | RU · DR | E-40 | 〃 |
| P4-BIP-08 | Raw Audio 90일 Storage 객체 삭제 | DR | — (서버 Cron) · E-52 정책 값 | 〃 |
| P4-BIP-09 | 업로드 실패 48h push — **현재 Frontend 는 앱 내 안내만**(`D4-119`) · push 는 선택 | BH | E-37~40 | 〃 |
| P4-BIP-10 | 출석 스티커 멱등 (`session_id UNIQUE`) | DR | E-35 | 〃 |
| P4-BIP-11 | 검수 템플릿 버블 · 리마인드 · 안전 슬롯 · 금지어 · fallback · 인사 ≤240px(≈28자) · 이름 문장 끝 금지 | AP · BH | E-33 · E-34 | 〃 · 4b QA §7 (AC-4-46 · 120) |
| P4-BIP-12 | 분석 Job 연결 (`analysis_jobs` 멱등 · 재시도) | AP | E-40 · E-43 | 〃 |
| P4-BIP-13 | push 발송 · 기기 토큰 등록/폐기 · Web Push 구독 (네이티브는 후속 `S4N-D`) (4a AC-4-81-B) | BH | E-31 · E-32 | 〃 |
| P4-BIP-14 | outbox 재전송 `occurredAt` 기준 순서 · IK 최소 14일 | BH · DR | E-35 | 〃 |
| P4-BIP-15 | 세션별 녹음 삭제 Storage + parts + audit (→ `P8-BIP-01`) | DR | E-53 | 〃 |
| P4-BIP-16 | `conversation_only` → `ANALYSIS_NOT_AVAILABLE` | EC | E-43 | 〃 |
| P4-BIP-17 | (= P3-BIP-19) 표지 교체 법무 게이트 (4a AC-4-85-B) | BH | E-21 · E-23 | 〃 |
| P4-BIP-18 | 출석 스티커 표시 문구 서버 제공 (streak · `Day N` 금지) | BH · AP | E-35 · E-34 | 〃 |
| P4-BIP-21 | `abandoned` 수신 시 서버가 업로드 part · token 정리 · 이후 `RECORDING_DELETED` (19 · 20 결번) (4a AC-4-113-B · 4b AC-4-129) | RU | E-35 · E-38 · E-40 | 〃 |
| P4B-BIP-01 | `SessionSummary.book` 을 카드 · 서재 · `childBookId` 세 경로 모두에서 채움 (AC-4-126) | BH | E-33 · E-34 | stage-4b-plan §10 · API_CONTRACTS §3.2 |
| P4B-BIP-02 | 완료 버블 `subtext` 생성 규칙 (사실 일치 · `min` 표기) (AC-4-139) | AP | E-35 · E-34 | API_CONTRACTS §3.2.3 |
| P4B-BIP-03 | 완료 버블 세션 단위 보존 · `SessionDetail` 동일 값 (AC-4-58) | BH · DR | E-34 | 〃 |
| P4B-BIP-04 | `mode` 클라이언트 값 수용 · `conversation_only` 업로드 → `RECORDING_NOT_ALLOWED_FOR_MODE` (AC-4-63) | BH · RU | E-33 · E-37 | stage-4b-plan §10 (API_CONTRACTS Rev 8.12 등재) |
| P4B-BIP-05 | `conversation_only` 버블이 녹음 · 녹음 시간 언급 금지 (AC-4-63) | AP | E-33 · E-35 | 〃 |
| P4B-BIP-06 | (조건부) 업로드 미도착 push — **해당 없음**: `N4B-34` ⓐ (앱 내 안내로 충족 · `D4-119`) 로 미채택 확인 (`stage-4b-handoff.md` H3-10) | BH | — | 〃 |
| P4B-BIP-07 | 끝나지 않은 recording/paused 세션 서버 정리 (새 세션 무기한 차단 방지 · 48h · 14일과 충돌 금지) (AC-4-35) | BH | E-33 | 〃 · 4b QA R2-7 |
| P4B-BIP-08 | 세션 endpoint `ONBOARDING_INCOMPLETE` ↔ `GET /v1/me` `onboardingStatus` 일관성 (AC-4-36) | BH · AR | E-33 · E-03 | 〃 |
| RU-1 ~ RU-21 | 녹음 업로드 · 로컬 저장 관련 서버 요구 21건 (각 원문 = `RECORDING_UPLOAD_SPEC.md` §4) | RU · BH · AR · DR | E-31~41 | stage-4a-handoff · 4a QA §7.3 |
| RU-19 (4b) | `readyAt` = 클라이언트 시각 — 리마인드 · 방치 타이머 기준 · 서버 sweeper 같은 기준 | RU · BH | E-33 | stage-4b-handoff F1-10 |
| RU-20 (4b) | ready 닫기와 10분 방치 = 같은 전이 (사유 필드 없음) | RU · BH | E-35 | 〃 |
| RU-21 (4b) | `POST …/selection` 뒤 `POST /v1/sessions` — 같은 `readingContext` · `customTime` | RU · BH | E-22 · E-33 | 〃 |
| RU-22 | 늦게 도착한 `recording\|paused → abandoned`(오프라인 Discard) 수용 · `occurredAt` = 확인 시각 | RU · BH | E-35 | stage-4b-handoff F2-9 |

### 6.4 Stage 5 — Reflection · Analysis

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P5-BIP-01 | 회고 저장 · IK · 세션당 1건 | BH · DR · EC | E-42 | stage-5-plan §10 · 5 QA §7 (AC-5-53) |
| P5-BIP-02 | 회고 허용 상태 서버 강제 (완료 계열만) | BH · EC | E-42 | 〃 |
| P5-BIP-03 | 회고 → 추천 신호 (→ P6-BIP-04 승계) | AP · BH | E-42 · E-21 | 〃 |
| P5-BIP-04 | 별점 → 서재 평점 집계 · 리포트 부모 피드백 요약 | DR · AP | E-42 · E-23 · E-47 | 〃 |
| P5-BIP-05 | `note` PII redaction · 로그 원문 금지 · 전체 삭제 대상 | AP · DR | E-42 | 〃 |
| P5-BIP-06 | 분석 파이프라인 전체 (AC-5-54) | AP | E-43 | 〃 |
| P5-BIP-07 | 품질 게이트 → `excluded_low_quality` · 리포트 집계 제외 | AP | E-43 | 〃 |
| P5-BIP-08 | 민감 발화 감지 · 마스킹 · 피드백 중립 처리 | AP | E-43 | 〃 |
| P5-BIP-09 | 짧은 피드백 생성 · 이중 검증 · fallback · 없으면 `text:null` | AP | E-43 | 〃 |
| P5-BIP-10 | `short_feedback_ready` push (payload = sessionId · 도착 `/session/:sessionId/feedback`) (AC-5-55) | BH | E-31 · E-43 | 〃 |
| P5-BIP-11 | 분석 SLA 24h | AP | E-43 | 〃 |
| P5-BIP-12 | `failed → analyzing` 재시도 정책 · 영구 실패 표현 | AP · EC | E-43 | 〃 |
| P5-BIP-13 | `conversation_only` 분석 거부 (P4-BIP-16 확정) (AC-5-40 서버 부분) | EC | E-43 | 〃 |
| P5-BIP-14 | 하이라이트 클립 10~15초 추출 · private 저장 · 만료 (`OAQ-13`) (AC-5-56) | AP · DR | E-49 | 〃 |
| P5-BIP-15 | 회고 · 분석 endpoint 소유권 · RLS · 분석 요청 동의 강제 (AC-5-42 서버 부분) | AR · DR | E-42 · E-43 | 〃 |
| P5-BIP-16 | 녹음 미수신 `completed` 세션 서버 종결 (`OAQ-17`) (AC-5-41 서버 부분) | DR · AP · RU | E-43 · E-34 | 〃 |

### 6.5 Stage 6 — Personalization · Profile

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P6-BIP-01 | 세션 누적 → 스냅샷 갱신 규칙 (전문가 결정) | AP · DR | E-12 | stage-6-plan §10 · 6 QA §7 (AC-6-52) |
| P6-BIP-02 | 페르소나 재생성 트리거 · 빈도 · 안전 · fallback | AP | E-12 · E-17 | 〃 |
| P6-BIP-03 | cold → warm 추천 단계 · `recommendation_logs` (AC-6-51) | AP · DR | E-21 | 〃 |
| P6-BIP-04 | warm 입력(회고 · note · 반응 · 역량 변화) · 반영 시점 | AP · BH | E-21 · E-42 | 〃 |
| P6-BIP-05 | 덱 역량 순환 · 같은 주제 연속 3일 지양 | AP | E-21 | 〃 |
| P6-BIP-06 | 재추천 시 새 Prompt 세트 | AP | E-21 · E-11 | 〃 |
| P6-BIP-07 | 설문 재응답 버전 저장 · 불변 · 새 스냅샷 · 페르소나 재생성 · 동의 강제 | DR · BH · AR | E-15~17 | 〃 |
| P6-BIP-08 | 아이 정보 수정 — 생년월 변경 영향(연령대 재계산) · 수정 이력(법무) | DR · AP | E-13 | 〃 |
| P6-BIP-09 | 전 endpoint 소유권 · RLS · 전체 삭제 대상 | AR · DR | E-12~17 | 〃 |
| P6-BIP-10 | 발전 역량 변경 기록 · 추천 반영 | DR · AP | E-14 | 〃 |
| P6-BIP-11 | 프로필 갱신 안내 `characterLine` 서버 문장 | BH · AP | E-20 | 〃 |
| P6-BIP-12 | `GET /profile` 이 온보딩 제출 직후에도 완성 `ChildProfile` | BH · AP | E-12 | stage-6-handoff |
| P6-BIP-13 | 재응답 draft `currentStep ?? step` 저장 · 마지막 쓰기 우선 · `keepalive` 수용 · 이탈 PUT 부분 응답은 draft 에만 | BH · DR | E-16 | stage-6-plan 개정 3 · 6 QA §10.5 |

### 6.6 Stage 7 — Report · PDF · Clip

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P7-BIP-01 | 주간 집계 · 주 경계(보호자 TZ 월~일) · `availableWeeks` 연속 범위 · Home 과 같은 창 | BH · DR | E-44 · E-20 | stage-7-plan §10 · 7 QA §7 |
| P7-BIP-02 | Growth themes stage · level 산식 | AP | E-44 | 〃 |
| P7-BIP-03 | Moment 선정 · 마스킹 · 안전 검증 | AP | E-44 | 〃 |
| P7-BIP-04 | 주기 28일 · 자정 경계 · eligibility (#17) · 저품질 제외 · `cycle_in_progress` 결합 (AC-7-36) | AP · BH · DR | E-45 | 〃 |
| P7-BIP-05 | 미충족 → `deferred` · 이월 · 독려 push (AC-7-36) | BH | E-45 · E-31 | 〃 |
| P7-BIP-06 | 리포트 생성 · 안전 · 재시도 3회 → 익일 · `delayed` + push (AC-7-48) | AP · BH | E-45 · E-47 | 〃 |
| P7-BIP-07 | 발행 리포트 불변 (`report_snapshots`) · 클립은 삭제 시 `RECORDING_DELETED` (AC-7-48) | DR · BH | E-47 · E-49 | 〃 |
| P7-BIP-08 | `progressRatio` · `nextReportDate` 산식 | BH | E-45 | 〃 |
| P7-BIP-09 | PDF 서버 렌더 · private · signed URL · `fileName` · ≤60초 · 멱등 (AC-7-63) | BH · DR | E-50 · E-51 | 〃 |
| P7-BIP-10 | 클립 재생 private Storage · 만료 URL · 보관(`OAQ-13`) · cascade (AC-7-55) | BH · DR | E-49 | 〃 |
| P7-BIP-11 | `viewed` 최초 시각 · 멱등 · 열람률 KPI | DR | E-48 | 〃 |
| P7-BIP-12 | push `report_published` · payload = reportId · 도착 `/progress/reports/:reportId` | BH | E-31 · E-47 | 〃 |
| P7-BIP-13 | 소유권 · RLS · 전체 삭제 | AR · DR | E-44~51 | 〃 |
| P7-BIP-14 | 서버가 새로 만드는 문장은 생성 시점의 현재 아이 이름 (Stage 6 `QA-6-001` 서버 측 메모 포함) | BH · AP | E-20 · E-35 · E-47 | 〃 |
| P7-BIP-15 | `ReportOverview` 의미 (C7-2a) | BH · DR | E-45 | 〃 rev 2 |
| P7-BIP-16 | `personaHistory[].trigger` 동결 | BH · DR | E-47 | 〃 rev 2 |

### 6.7 Stage 8 — Data Management · Account (`docs/plans/stage-8-plan.md` §10)

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| P8-BIP-01 | 세션 녹음 삭제: Storage(전 part + 클립) · `upload_status='deleted'` · 업로드 토큰 무효화 · audit · job 취소 · 멱등(IK) · 이미 삭제면 `RECORDING_DELETED` (AC-8-22) | DR · RU | E-53 | stage-8-plan §10 · H8-2.8 |
| P8-BIP-02 | 전체 데이터 삭제 파이프라인: 즉시 `deletion_pending` · job 취소 · push 기기 해제 · Storage prefix · **reports · 주간 집계 포함** hard delete · `received → processing → completed/failed` · 재시도 · SLA(법무) · 백업 잔존 고지 · 폴링 대상의 실제 진행 값 (AC-8-18 · 27) | DR · BH | E-54 · E-55 · E-52 | 〃 · H8-3.8 |
| P8-BIP-03 | 탈퇴 = 계정 + 전체 데이터 (`N8-02` ⓐ) · `scope='account'` · 토큰 폐기 · auth user 삭제 · 법정 보관분 가명화 (AC-8-34 · 35) | AR · DR | E-56 | 〃 · H8-4.8 |
| P8-BIP-04 | 세션 목록 녹음 상태(key 항상 포함) · `hasRecording` 필터 · `recordingsCount` 정의(삭제 가능 녹음 수 — `VG8-A-04`) · `retentionPolicy.rawAudioDays` 서버 정책 값 (AC-8-15) | BH · DR | E-36 · E-52 | 〃 · H8-2.8 |
| P8-BIP-05 | **OAuth 전체 페이지 리다이렉트 복귀 경로 보존** — 서버/Auth `redirect_to` 허용 목록 = `toSafeReturnPath` 규칙 | AR | E-01 | 〃 · stage-7 QA §7 메모 · H7-7.8 |
| P8-BIP-06 | **PDF · 클립 signed URL CORS** — 앱 origin `fetch` GET 허용 (PDF 는 `fetch → arrayBuffer → File`) | BH · DR | E-49 · E-51 | 〃 · stage-7-handoff H7-6.9 |
| P8-BIP-07 | 삭제 진행 중 쓰기 차단 응답 `ACCOUNT_DELETION_PENDING` (409) — 범위 = `DELETION_PENDING_WRITE_METHODS` (AC-8-32) | EC · AR | 모든 ✎ | 〃 · H8-1.9 |
| P8-BIP-08 | (선택 — Frontend 미구현 `N8-06` ⓑ) 동의 이력 조회 `GET /v1/consents` | AR | E-57 | 〃 |
| P8-BIP-09 | `caregiver.email` = 인증 계정 로그인 이메일 (OAuth 포함) · 읽기 전용 · 로그 원문 금지 (`C8-10`, AC-8-33 · 93) | AR · BH | E-03 · E-04 | 〃 rev 2 · H8-4.8 |

### 6.8 번호 없던 PENDING 항목 (`HX-`) — QA 리포트 · handoff 메모 본문에서 집계

| ID | 요구 | 대상 | 연결 | 출처 |
|---|---|---|---|---|
| HX-2-01 | 동의 문서 **본문 호스팅** — `ConsentDocument.url` 은 공개 접근 가능한 절대 URL (현재 placeholder → L-02) | AR · BH | E-05 | stage-2-consent-handoff §9 · stage-2-handoff §4 |
| HX-2-02 | **동의 기록 서버 저장 · `source`** — OAuth 가입은 `signup_oauth` 로 온다(Frontend 구현 완료 — `consentSourceFor()`). 서버는 그대로 기록 · provider 와 대조 (AC-8-45 서버 부분 · AC-2R 동의 강제 행) | AR · DR | E-06 | stage-2-consent-handoff §9 · stage-2-rework QA §10 · H8-5.7 |
| HX-2-03 | `child_info.languageEnvironment` **빈 배열 거부 금지** · 기본값 `['english']` 은 Frontend 가 채움 | DR | E-08 · E-09 · E-13 | stage-2-rework QA R-9 · rework-handoff D-9 |
| HX-3-01 | `HomeSummary.characterLine` · `lastHighlightLine` **문구 생성** (Safety Filter) · 없으면 null | AP · BH | E-20 | stage-3-home-handoff §6 |
| HX-3-02 | `sessionsThisWeek` 집계 기준 (주 시작 요일 · timezone — P7-BIP-01 과 같은 창) | BH · DR | E-20 | 〃 |
| HX-3-03 | `characterLine` 길이 **약 120자 이내**(4줄 가이드, schema 제약 없음) — `API_CONTRACTS.md` §3.8 (구 표기 `P3-BIP-16` 정정) | AP | E-20 | stage-3 QA §8.3 · `W-5` |
| HX-3-04 | **표지 이미지 비율** 권장 107:151 · `BookSummary.coverUrl` 은 Backend 제공(현재 에셋은 Mock 전용) | BH · DR | E-21 · E-23 | stage-3 QA §8.3 · home-handoff R9 · library-r2 §12 |
| HX-3-05 | 서버는 **항상 책이 있는 카드**를 내려준다 — 추천할 책이 없으면 재독 카드 (approvals §12.12) | AP · BH | E-21 | stage-3-home-handoff R9 |
| HX-3-06 | `Reading now` 선정 규칙 · `lastSessionMinutes` 출처 = 서버 (조각이 없으면 그 조각만 생략) | BH · DR | E-23 | stage-3 QA §8.3 · library-r2 §12 |
| HX-3-07 | 책 제목 · 사용자 입력 제목 등 **길이 상한** = Backend 요구 (schema 제약 없음) | DR | E-23~25 | library-r1 §7 |
| HX-4-01 | 대화 전용 미제출 `ready` 세션 서버 sweeper (`D4-45` · R4B-21, `D4-112` 로 비중 상향) | BH · DR | E-33 · E-35 | 4b QA §7 · H2R-8 |
| HX-4-02 | 실제 Storage 업로드 · 서버 확정 · 48h 이후 서버 측 상태 (AC-4-149) | RU | E-37~40 | 4b QA §7 · H3-10 |
| HX-4-03 | 서버 측 동의 강제(`CONSENT_REQUIRED`) · Consent History — 세션 · 녹음 경로 (AC-4-62 · 134) | AR · BH | E-35 · E-37 | 4b QA §7 |
| HX-8-01 | **다른 기기 잔여 데이터 (R8-15)** — 요청 표시가 없는 다른 기기는 전체 삭제 완료를 알 수 없어 로컬 아동 데이터가 남는다. 서버 신호(예: `me` 의 마지막 삭제 완료 시각 · 세대 번호) 필요 — **contract 변경 = 사용자 승인 필요**. 현재는 Handoff 한계로 수용(`D8-2` ①) | AR · DR · BH | E-03 · E-55 | stage-8-plan §5.7 · R8-15 · H8-5-N6 · H8-5.7 |
| HX-8-02 | **서버 기준 삭제 완료 시점** — `DeletionRequest.status='completed'` · `completedAt` 은 Storage · DB 삭제를 모두 끝낸 뒤 · 화면 밖 완료(이탈 · 폴링 상한 · 앱 재시작)도 같은 요청 조회로 판정 (AC-8-98 서버 부분) | DR · AR | E-55 | H8-5.7 |

### 6.9 QA 리포트 AC 단위 PENDING ↔ 장부 대응 (1:1 검산용)

| Stage | QA 리포트 PENDING 행 | 장부 ID |
|---|---|---|
| 1 | 없음 (0건) | — |
| 2 | §10 "AC 판정 PENDING 0 — `P2-BIP-01`~`16`" | 6.1 전부 |
| 2R | AC-2R-15 서버 부분 · `P2-BIP-18` · `P2-BIP-19` · 서버 측 동의 강제 · Consent History · R-9 언어 환경 | P2-BIP-13 (R) · 18 · 19 · P2-BIP-03 · 04 · HX-2-02 · HX-2-03 |
| 3 | §8.1 `P3-BIP-16`~`26` · §8.2 `P3-BIP-15` · §8.3 추가 요구 3건 | 6.2 해당 행 · HX-3-03 · HX-3-04 · HX-3-06 |
| 4a | AC-4-81-B · 94-B · 113-B · 85-B · §7.2 · §7.3 RU | P4-BIP-13 · RU-19 · RU-20 / P4-BIP-05 / P4-BIP-21 · RU-6 / P4-BIP-17 / 6.3 P4-BIP 전부 / RU-1~21 |
| 4b | §7 11행 + R2-7 2행: AC-4-126 · 129/113 · 46/120 · 139 · 58 · 63(×2) · 62/134 · 149 · 151 · `D4-45` · AC-4-35 · 36 | P4B-BIP-01 · P4-BIP-21 · P4-BIP-11 · P4B-BIP-02 · 03 · 04 · 05 · HX-4-03 · HX-4-02 · RU-16 · HX-4-01 · P4B-BIP-07 · 08 |
| 4b handoff | RU-19 (4b) · RU-20 (4b) · RU-21 (4b) · RU-22 | 6.3 해당 행 |
| 5 | AC-5-53 · 54 · 55 · 56 · 40/41/42 서버 부분 · `P5-BIP-01`~`16` | 6.4 전부 |
| 6 | AC-6-51 · 52 · `P6-BIP-01`~`13` · 현재 아이 이름 메모 | 6.5 전부 · P7-BIP-14 |
| 7 | AC-7-36 · 48 · 55 · 63 · `P7-BIP-01`~`16` · OAuth 복귀 메모 | 6.6 전부 · P8-BIP-05 |
| 8 | AC-8-11 · 15 · 18 · 22 · 27 · 32 · 33 · 34 · 35 · 45 · 60 · 61 · 93 · 98 (Plan §18 예상) | AC-8-11 → 이 문서 §5.1 (실 서버 연결) · 15 → P8-BIP-04 · 18 · 27 → P8-BIP-02 · 22 → P8-BIP-01 · 32 → P8-BIP-07 · 33 · 93 → P8-BIP-09 · 34 · 35 → P8-BIP-03 · 45 → HX-2-02 · 60 → P2-BIP-03 · 17 · 61 → P4-BIP-02 · HX-4-03 · 98 → HX-8-02 · HX-8-01 |

### 6.10 집계 (`S8-J` 대조 결과 — AC-8-79)

| 구분 | 행 수 |
|---|---|
| Stage 2 | 25 (01 · 01a · 02~11 = 12 + (A) 5 + (R) 5 + 17~19 3) |
| Stage 3 | 26 |
| Stage 4 | P4-BIP 19 (01~18 · 21) + P4B-BIP 8 + RU 22 (RU-1~22) + RU (4b) 3 = 52 |
| Stage 5 | 16 |
| Stage 6 | 13 |
| Stage 7 | 16 |
| Stage 8 | 9 |
| HX (번호 없던 항목) | 15 |
| **합계** | **172** (그중 `P4B-BIP-06` 1건은 "해당 없음" 으로 닫힘 → 유효 171) |

대조 방법: `docs/qa/*.md` · `docs/plans/*.md` 에 나오는 `P[2-8]B?-BIP-nn` 전부(**127 고유 ID** — 4b QA 의 grep 식 표기 1건 제외)와 RU-1~22 를 이 문서와 `comm` 으로 비교 → **누락 0** · 이 문서에만 있는 BIP ID 0. QA 리포트 AC 단위 PENDING 행은 §6.9 로 전부 대응. HX 15건은 본문 서술 항목을 수작업 집계한 것이다 (출처 열).

## 7. 출시 전 차단 항목 (Launch Blockers — Backend 구현과 별개)

| ID | 항목 | 상태 |
|---|---|---|
| L-01 | COPPA 검증 가능한 보호자 동의(VPC) 방식 | 법무 검토 대기 — Frontend 는 `parentVerification.status` 슬롯 + Mock(`vpc-pending` · `vpc-failed`) |
| **L-02** | 약관 · 개인정보처리방침 **실제 문서와 URL** — 현재 `shared/config/legal-links.ts` placeholder(`haru.invalid`). 파일럿 동의 필수/선택 | 법무 — **실사용자 노출 전 필수 (차단)** |
| L-03 | 동의 철회 미제공(C-4) ↔ COPPA 권리 · 전체 삭제로 충분한가 | 법무 |
| L-04 | 접근성 — 주요 버튼 흰 라벨 대비 수용 예외 D-01 | 법무 |
| L-05 | 개정 COPPA 서면 보관 정책 · 정보보안 프로그램 · audit/consent 보관 기간 | 법무 |
| L-06 | STT · AI · Push 벤더 아동 데이터 조건 (ZDR · DPA) | 법무 |
| L-07 | 아이 성(last name) 수집 적합성 | 법무 |
| P3-BIP-19 | 상용 그림책 — 표지 3종은 `D8-7` 로 **초대 전용 프리뷰에 표시**(중립 대체 `N8-13` ⓐ 번복, 공개 배포 금지) · **실제 책 제목 · 저자 · 표지 노출**은 출시 전 법무 확인 (`D8-4` · `D8-7`) · git 이력의 원본 표지(`H8-7-N3`) | 법무 |
| OAQ-13 | 하이라이트 클립 보관 기간 | 법무 |
| OAQ-14 | 녹음 원본 앱 레벨 추가 암호화 | 보안 · 법무 |
| OAQ-17 | 녹음 삭제 · 미수신 세션의 분석 종결 표현 | 제품 |
| 삭제 SLA | 전체 삭제 "즉시" 의 기한 · 백업 잔존 고지 문구 (화면에 기한 수치 없음 — `N8-04` ⓐ) | 법무 |
| HX-8-01 | 다른 기기 잔여 아동 데이터 (R8-15) — 서버 신호 contract 여부 | 사용자 승인 (`D8-2` 에서 한계로 수용) |
| `S3-NOTIF-1` | 알림 설정 화면 (`D-18` · `N8-23` ⓐ) — 디자이너 Figma 대기, Frontend Complete 예외 | 디자이너 |
| `S3-ASSET-1` | Home 캐릭터 1056px 투명 원본 (`D-13`) — 도착 시 에셋 파일만 교체 | 디자이너 |
| `S3-COPY-1` | 증정 접수 안내 잠정 문구 — 운영 표현 확정 시 copy 값만 교체 | 운영 |
| 가값 | `P-01`~`P-43` 잔여 (`P-42` 삭제 폴링 5s × 60 포함) — Final QA 리포트 목록 + 항목별 재제시 (`N8-20`) | 디자이너 · 사용자 |
| `S4-NAT-1` | Native 셸 · 네이티브 녹음 · Auth/Push Adapter · portrait lock — 후속 단계 `S4N-A`~`D` (`D4-1`) | 후속 단계 |
| `S4-DEV-1` | Android 모바일 Web 실기기 미검증 (`N4-21`) | 기기 확보 |

## 8. 기타 인계 메모

- **증정 신청은 Frontend 에 없다** — `POST …/gift-requests` contract · Mock · hook(`useCreateGiftRequest`) 은 유지되나 화면 호출 지점이 없다 (`features/library/BookDetailSheet.tsx` 주석). 증정 신청은 앱 밖 별도 랜딩페이지(`D-26`)이며 Backend/운영 경로로만 생성된다. Frontend 는 상태 조회(E-29)만.
- **Web push 토큰은 자리표시 값**(`web-permission-only:v1`, RU-19) — 실제 Web Push 구독은 provider 선정 후.
- **네이티브(Capacitor) 단계는 분리**(`D4-1`) — `apps/mobile` 없음. 네이티브 녹음 · Auth · Push Adapter 는 후속 단계 `S4N-A`~`D`.
- **Frontend 미구현 PRD 화면** (Frontend Complete 예외): 알림 설정 `/settings/notifications` (`D-18`, `N8-23` ⓐ) · 동의 이력 보기 (`N8-06` ⓑ, 선택 C-19).
- **서버가 만드는 사용자 노출 문구**(버블 · 페르소나 · 피드백 · 리포트 · 추천 이유 · 스티커 · `characterLine`)는 Frontend 가 가공하지 않는다 — 길이 · 톤 · 안전 요구는 `ANALYSIS_PIPELINE_REQUIREMENTS.md` §4.
- **전체 삭제 완료 감지**(`N8-31` ⓐ, `D8-2`): 요청 id 만 기기에 표시(`haru.data-deletion.pending.v1`, PII 0), `app/providers/DataDeletionWatcher.tsx` 가 `GET /v1/data-deletion-requests/:id` 로 완료를 감지해 정리 + Toast 1회. 다른 기기 한계 = HX-8-01.
- **`abandoned` 사유 미구분**(`S4-DEC-4` · `N4-30`): 10분 방치 · ready 닫기 · Discard 가 같은 전이다. Audit · 지표에 사유가 필요하면 별도 결정(contract 변경).
- **Frontend 호출 지점이 없는 contract**: E-02(dev 만) · E-18 · E-19 · E-28 · E-30 · E-32 · E-41 — Backend 는 구현 우선순위를 낮출 수 있으나 contract 는 유지한다.

## 9. 미결 (결정 대기)

| ID | 내용 | 결정 주체 |
|---|---|---|
| `OAQ-13` · `OAQ-14` · `OAQ-17` | 클립 보관 · 앱 레벨 암호화 · 분석 종결 표현 | 법무 · 보안 · 제품 |
| `OAQ-19` | 실제 Supabase Auth · TUS Adapter 추가 시점 | 사용자 (Backend 연동 시) |
| P6-BIP-01 · P6-BIP-04 · P7-BIP-04 | 스냅샷 갱신 규칙 · 추천 반영 시점 · 주기 결합 해석 | 전문가 · 제품 |
| P3-BIP-17 | `plannedNights` 출처 (사용자 입력 vs 서버 추정) | 제품 |
| `N8-04` · B-7 | 삭제 SLA · 백업 잔존 고지 문구 · 삭제 완료 이메일 알림 여부 | 법무 · 제품 |
| HX-8-01 | 다른 기기 정리 서버 신호 (contract 변경) | 사용자 |
| L-01~L-07 | §7 | 법무 |
