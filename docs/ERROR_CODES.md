# HARU Error Codes (Backend Handoff)

Status: **COMPLETE (development-agent `S8-J`, 2026-11-21)** — 초안(plan-agent 2026-11-20)을 구현된 `packages/contracts` · Mock · Frontend 처리 코드와 대조해 완성했다. 검증 = stage-qa-agent (AC-8-81). 결정 반영: `N8-09` ⓐ (`D8-1`) → `ACCOUNT_DELETION_PENDING` 확정, **30종**.

> 정본: `packages/contracts/src/common/error-codes.ts` (`ERROR_CODES` 30종 · `ERROR_CODE_HTTP_STATUS`) · `common/error-envelope.ts` (`ErrorEnvelopeSchema` · `HaruApiError`). 문서 원표: `docs/API_CONTRACTS.md` §1.1 · §1.2 (Rev 12.4 에서 순서 · HTTP 값까지 1:1 대조 완료). 대조 증거: `H8-10` (`docs/qa/stage-8-handoff.md`).

## 1. Error Envelope

```json
{ "error": { "code": "SESSION_INVALID_TRANSITION", "message": "…", "requestId": "…", "details": { "from": "ready", "to": "paused" } } }
```

| 필드 | 규칙 (`ErrorEnvelopeSchema`) |
|---|---|
| `code` | `ErrorCode` 30종 중 하나 — 모르는 값이면 Frontend parse 실패 → 일반 오류로 처리 |
| `message` | 개발자용 · **PII 금지**. Frontend 는 사용자에게 그대로 보여 주지 않는다 (문구 = `apps/web/src/shared/copy/error-copy.ts` `ERROR_COPY`, code 로 매핑) |
| `requestId` | 선택 · 비어 있지 않은 opaque 문자열 (규약값 = `X-Request-Id` uuid) |
| `details` | 선택 · `Record<string, unknown>` — 코드별 모양은 §3 |

- Frontend 는 **서버가 보낸 HTTP status 를 그대로 신뢰**하고 `code` 로 분기한다. `ERROR_CODE_HTTP_STATUS` 는 Mock 재현과 Backend 재사용 용도다.
- 오프라인 · 네트워크 실패 · 응답 schema 불일치는 Error Code 가 아니다 — Frontend 가 별도 상태(offline 표면 · 재시도)로 처리한다. Http Adapter 는 응답 parse 실패를 오류로 던진다(`apps/web/src/shared/api/helpers`).

## 2. 코드 표 (30종 — `ERROR_CODES` 배열 순서)

열: **FE 처리** = Frontend 가 그 code 를 받았을 때 하는 일 (처리 위치) · **Mock 재현** = 재현 경로 (`?scenario=<group>:<key>`, 그룹·key 정본 = `API_CONTRACTS.md` §5.4).

| # | Code | HTTP | 의미 | 대표 endpoint | FE 처리 (위치) | Mock 재현 | PRD | Backend 요구 ID |
|---|---|---|---|---|---|---|---|---|
| 1 | `VALIDATION_FAILED` | 400 | contracts schema 검증 실패 | 전체 | 일반 오류 표면. 아이 정보 수정은 `details.fields` 로 필드 오류 표시 (`features/child-profile-edit/ui`) | `children:validation-failed` · 각 Mock 의 입력 parse 실패 | — | — |
| 2 | `AUTH_REQUIRED` | 401 | 토큰 없음 | 전체 | 세션 종료 → `/auth/welcome` (`entities/me` · `features/auth/model`) | `auth` Gateway 미인증 상태 | FR-01 | P2-BIP-01 |
| 3 | `AUTH_TOKEN_EXPIRED` | 401 | 만료 | 전체 | **1회 refresh 후 1회 재시도**, 재실패면 sign-out (`shared/auth/withAuthRefresh.ts`) | `auth:token-expired` · `me:token-expired` | FR-01 | P2-BIP-01 · P2-BIP-02 |
| 4 | `FORBIDDEN` | 403 | 소유권 불일치 (존재 노출 방지로 404 대체 가능) | 전체 | Not found 와 같은 표면 · 삭제 요청 폴링 정지 (`entities/data-management` · `features/session-feedback/model`) | 직접 재현 key 없음 — `error` 경로로 같은 표면 | NFR 보안 | P5-BIP-15 · P6-BIP-09 · P7-BIP-13 |
| 5 | `CONSENT_REQUIRED` | 403 | 필수 동의 또는 `child_voice_data` 없음 | 온보딩 · 세션 전이(`to=recording`) · 녹음 init/complete · 재응답 | Guard 가 `/auth/consent` · 녹음은 `consent_blocked` 로 재동기화 (`features/recording/model/recording-controller.ts`) | `me:consent-missing` · `onboarding:consent-missing` · `sessions:consent-missing` · `recordings:consent-missing` | FR-02 | P2-BIP-03 · P2-BIP-17 · P4-BIP-02 · RU-11 · P6-BIP-07 |
| 6 | `CONSENT_VERSION_OUTDATED` | 403 | 재동의 필요 | `POST /v1/consents` | 동의 화면 오류 표면 (문서 재조회) | `consents:consent-version-outdated` · `me:consent-version-outdated` | FR-02 | P2-BIP-04 |
| 7 | `ONBOARDING_INCOMPLETE` | 409 | 온보딩 미완료 상태의 홈 · 카드 · 세션 · 재응답 필수 빈칸 | home · activity-cards · sessions · survey-update submit | 세션 시작 안내 후 `me` 기준 이동 (`entities/session`) | `home:onboarding-incomplete` · `activity-cards:onboarding-incomplete` · `sessions:onboarding-incomplete` · `onboarding:onboarding-incomplete` | FR-03 | P4B-BIP-08 |
| 8 | `CHILD_NOT_FOUND` | 404 | 아이 없음 | `children/*` · progress · reports | 일반 Not found 표면 | Mock 의 없는 childId 경로 (`children` · `progress` · `reports` · `data-management`) | — | P6-BIP-09 |
| 9 | `CHILD_LIMIT_REACHED` | 409 | MVP 1명 초과 | onboarding submit | 제출 오류 안내 (`features/onboarding-survey/ui`) | `onboarding:child-limit-reached` | §1.6 | P2-BIP-10 |
| 10 | `RESOURCE_NOT_FOUND` | 404 | 일반 | 전체 | Not found 표면 · 삭제 요청 폴링 정지 · 기기 표시 삭제 (`features/data-management/model`) | 없는 id 요청 (각 Mock) | — | — |
| 11 | `SESSION_INVALID_TRANSITION` | 409 | 허용되지 않은 전이 · 회고 허용 상태 아님 | transitions · reflection · recordings init | 녹음 = 서버 상태로 재동기화 · 회고 = 오류 안내 (`features/recording/model` · `features/reflection/ui`) | `sessions:invalid-transition` · `reflections:invalid-transition` | §12.2 | P4-BIP-01 · P5-BIP-02 · RU-9 · RU-22 |
| 12 | `SESSION_ALREADY_ACTIVE` | 409 | 진행 중 세션 존재 | `POST /v1/sessions` | `details.sessionId` 로 진행 중 세션 안내 · 이어가기 (`entities/session/useCreateSession.ts`) | `sessions:session-already-active` · `-ready` · `-paused` · `home:session-already-active` | FR-09 | P3-BIP-11 · P4B-BIP-07 · RU-9 |
| 13 | `SESSION_MAX_DURATION_EXCEEDED` | 422 | 30분 초과 보고 | transitions | 재동기화 (클라이언트는 30분 자동 종료로 먼저 막는다) | Mock 전이 검증 (`MockSessionApi`) | FR-09 | P4-BIP-03 |
| 14 | `RECORDING_NOT_ALLOWED_FOR_MODE` | 409 | `conversation_only` 세션 업로드 | recordings init | 정상 흐름에서 발생 0 (대화 전용은 업로드하지 않음) — 일반 실패 | Mock 검증 (`MockRecordingApi`) | §13 | P4B-BIP-04 |
| 15 | `UPLOAD_TOKEN_EXPIRED` | 410 | 업로드 토큰 만료 | TUS 전송 · complete | 토큰 재발급(`upload-tokens`) 1회 후 재시도 (`features/recording/model/upload-queue.ts`) | `recordings:upload-token-expired` | NFR 오프라인 | P4-BIP-05 · RU-7 |
| 16 | `RECORDING_INCOMPLETE` | 422 | part 누락 · 크기/해시 불일치 | complete | `details.partNos` part 만 다시 전송 (`upload-queue.ts`) | `recordings:recording-incomplete` | FR-14 | P4-BIP-06 · RU-9 |
| 17 | `RECORDING_DELETED` | 410 | 삭제 · 만료된 녹음 접근 | upload-tokens · TUS · clip playback-url · `DELETE …/recording` · `GET /v1/recordings/:id` | 업로드 포기 + 로컬 정리 · 클립 = 만료/삭제 안내 · 녹음 삭제 = 이미 삭제로 목록 갱신 (`upload-queue.ts` · `features/highlight-clip-player` · `features/recording-deletion`) | `recordings:recording-deleted` · `analysis:recording-deleted` · `highlight-clips:recording-deleted` · `highlight-clips:clip-expired` · `data-management:recording-deleted` | FR-21 · NFR | P4-BIP-21 · RU-6 · P7-BIP-07 · P8-BIP-01 |
| 18 | `ANALYSIS_NOT_AVAILABLE` | 404 | 대화 전용 또는 분석 대상 아님 | `GET …/analysis` | 피드백 화면 "분석 없음" 표면 (`features/session-feedback/model`) | `analysis:analysis-not-available` | FR-13 | P4-BIP-16 · P5-BIP-13 |
| 19 | `REFLECTION_ALREADY_SUBMITTED` | 409 | 세션당 1건 | reflection | 제출 완료로 간주 (`features/reflection/ui`) | `reflections:reflection-already-submitted` | FR-12 | P5-BIP-01 |
| 20 | `REPORT_NOT_ELIGIBLE` | 409 | 발행 기준 미충족 | `GET /v1/reports/:id` | 상세 = *Not ready* 표면 (`features/report-detail/ui`) | `reports:report-deferred` (상세 pending) | FR-16 | P7-BIP-04 |
| 21 | `REPORT_NOT_READY` | 409 | 생성 중 · 지연 | `GET /v1/reports/:id` · PDF POST | 상세 = *Not ready* 표면 | `reports:report-delayed` | FR-16 · §13 | P7-BIP-06 |
| 22 | `PDF_NOT_READY` | 409 | PDF 다운로드 URL 직접 요청 시 미완료 | (다운로드 URL) | Frontend 는 `GET …/pdf` 의 `generating`(200) 폴링을 쓰므로 받지 않는다 | 재현 없음 (생성 중 = `report-pdf:pdf-generating` 200) | FR-17 | P7-BIP-09 |
| 23 | `GIFT_REQUEST_DUPLICATE` | 409 | 같은 책 진행 중 신청 | `POST …/gift-requests` | 화면 호출 지점 0 (증정 신청은 앱 밖, `D-26`) | `library:gift-duplicate` | FR-22 | P3-BIP-05 · P3-BIP-24 |
| 24 | `BOOK_ALREADY_OWNED` | 409 | 서재 재등록 — 오류가 아니라 안내 | `POST …/library/books` | 안내 문구 (`features/library`) | `library:book-already-owned` | FR-23 | P3-BIP-21 |
| 25 | `DELETION_ALREADY_REQUESTED` | 409 | 진행 중 `all_data`·`account` 요청 존재 | `POST /v1/data-deletion-requests` · `DELETE /v1/me` · `DELETE …/recording` | 진행 상태로 표시 (요약 재조회) (`features/data-management` · `features/account-deletion/ui`) | `data-management:deletion-already-requested` · `account:deletion-pending-write-blocked` (탈퇴 시도) | FR-21 | P8-BIP-02 · P8-BIP-03 · P8-BIP-07 |
| 26 | `ACCOUNT_DELETION_PENDING` | 409 | 전체 삭제 · 탈퇴 진행 중(`deletion_pending`) 계정의 쓰기 거부. 삭제 · 탈퇴 endpoint 자신은 #25 | §4 쓰기 endpoint 전부 | 각 화면 기존 실패 표면에 *Changes are paused* 문구 · PDF 는 `failed.blocked` (`ERROR_COPY` · `features/report-pdf/model`) | `account:deletion-pending-write-blocked` (+ 진행 중 요청이 있는 동안 `DELETION_PENDING_WRITE_METHODS` 전부) | FR-21 · NFR | P8-BIP-07 |
| 27 | `IDEMPOTENCY_KEY_REUSED` | 422 | 같은 key 다른 body | IK endpoint 전체 | 업로드 = 새 키로 다시 시도 · 그 밖 = 일반 실패 (`upload-queue.ts`) | `mocks/common/idempotency.ts` (같은 키 다른 body) | — | P2-BIP-11 · P3-BIP-22 · P4-BIP-14 · RU-14 |
| 28 | `RATE_LIMITED` | 429 | 요청 과다 | 전체 | SessionOutbox 재시도 대상 (백오프 2s→10s→30s→60s→300s) (`session-outbox.ts`) · 그 밖 일반 실패 | 재현 key 없음 | 기술 요구 | — |
| 29 | `PROVIDER_UNAVAILABLE` | 503 | AI · STT · PDF · Auth 일시 장애 (페르소나는 fallback 200 이 우선) | 생성 계열 · Auth | Outbox 재시도 대상 · http 모드 Auth 미연결 시 이 code (`shared/auth/UnavailableAuthGateway.ts`) | `onboarding:persona-fallback` 은 200 fallback (code 아님) | FR-05 · §13 | P2-BIP-08 |
| 30 | `INTERNAL_ERROR` | 500 | 서버 오류 | 전체 | 일반 오류 표면 + 재시도 · Outbox 재시도 대상 | 모든 그룹 `error` · `retry` | — | — |

- 제거됨: `TRIAL_ACCOUNT_RESTRICTED` (익명 Trial 미채택, C-12). 동의 철회 관련 코드 없음 (C-4).
- Mock 직접 재현이 없는 code (`FORBIDDEN` · `PDF_NOT_READY` · `RATE_LIMITED`) 는 Frontend 가 일반 표면 · 재시도 분류로만 다룬다 — Backend 가 이 code 를 보내도 화면이 깨지지 않는다(일반 경로). 화면별 전용 처리가 필요하면 Frontend 변경 대상이다.

## 3. `details` 모양 (RU-9 · 구현 기준)

| Code | `details` | 정본 |
|---|---|---|
| `VALIDATION_FAILED` | `issues?` (schema 오류 목록) · `PATCH /v1/children/:childId` 는 **`fields: string[]`** (필드 이름만, 값 없음) | `API_CONTRACTS.md` §4 Stage 6 |
| `CONSENT_REQUIRED` | `missing: ConsentType[]` | §3.4 |
| `SESSION_INVALID_TRANSITION` | `{ from: SessionStatus, to: SessionStatus }` | §3.1 · RU-9 |
| `SESSION_ALREADY_ACTIVE` | `{ sessionId }` — Frontend 가 진행 중 세션으로 안내 | RU-9 |
| `RECORDING_INCOMPLETE` | `{ partNos: number[] }` — Frontend 가 그 part 만 재전송 | RU-9 |
| `RECORDING_DELETED` | `{ reason?: 'deleted' \| 'expired' }` — `RecordingDeletedDetailsSchema` (클립 playback · 세션 녹음 삭제) | `packages/contracts/src/reports` |
| `REPORT_NOT_ELIGIBLE` | `eligibility?: ReportEligibility` (선택 — `API_CONTRACTS.md` §1.2 설계값. 현재 Mock 은 보내지 않고 Frontend 도 읽지 않는다 — 화면은 *Not ready* 표면만) | §1.2 · `MockReportApi` |
| `REPORT_NOT_READY` | `ReportNotReadyDetailsSchema` = `{ retryAfter?: IsoDateTime }` (`delayed` 일 때) | `packages/contracts/src/reports/detail.ts` |
| 그 밖 | 없음 | — |

## 4. 쓰기 차단 대상 (`ACCOUNT_DELETION_PENDING`, `P8-BIP-07`)

Mock 이 차단하는 API Client 메서드 목록 = `apps/web/src/mocks/common/writeGuard.ts` `DELETION_PENDING_WRITE_METHODS` — Backend 는 같은 범위의 endpoint 에 409 를 돌려준다.

| API Client 메서드 | Endpoint |
|---|---|
| `me.update` | `PATCH /v1/me` |
| `consents.record` | `POST /v1/consents` |
| `onboarding.saveStep` · `submit` | `PUT /v1/onboarding/steps/:step` · `POST /v1/onboarding/submit` |
| `activities.selectOption` | `POST /v1/activity-cards/:cardId/selection` |
| `library.addOwnBook` · `createGiftRequest` · `saveBook` · `unsaveBook` | `POST …/library/books` · `POST …/gift-requests` · `PUT …/saved-books` · `DELETE …/saved-books/:bookId` |
| `sessions.create` · `transition` | `POST /v1/sessions` · `POST /v1/sessions/:id/transitions` |
| `recordings.init` · `refreshTokens` · `complete` | `POST /v1/sessions/:id/recordings` · `POST /v1/recordings/:id/upload-tokens` · `POST /v1/recordings/:id/complete` |
| `notifications.updatePreferences` · `registerPushDevice` | `PUT /v1/notification-preferences` · `POST /v1/push-devices` |
| `reflections.submit` | `POST /v1/sessions/:id/reflection` |
| `children.update` · `setGrowthCapability` · `saveSurveyUpdateStep` · `submitSurveyUpdate` | `PATCH /v1/children/:id` · `PUT …/growth-capability` · `PUT …/survey-update/steps/:step` · `POST …/survey-update/submit` |
| `reports.markViewed` | `POST /v1/reports/:id/viewed` |
| `reportPdf.request` | `POST /v1/reports/:id/pdf` |
| `dataManagement.deleteSessionRecording` | `DELETE /v1/sessions/:id/recording` |

제외 (= `DELETION_ALREADY_REQUESTED` 또는 허용): `POST /v1/data-deletion-requests` · `DELETE /v1/me` · 모든 `GET` · `DELETE /v1/push-devices/:id` (Frontend 호출 0 — 차단 여부는 Backend 결정).

## 5. 공통 요구

- 새 코드는 `packages/contracts` · `API_CONTRACTS.md` §1.2 · 이 문서를 **함께** 갱신한다 (`rules/architecture.md` §5).
- Mock 은 같은 status · envelope 를 재현한다 (`ERROR_CODE_HTTP_STATUS`).
- `message` · 로그에 PII(아이 이름 · 이메일 · Transcript · 오디오 경로) 금지.
- Idempotency: 같은 key 재생 = 최초 응답 재생 (기본 24h, 세션 전이 · 업로드 계열 최소 14일 — RU-14), 같은 key 다른 body = #27.
