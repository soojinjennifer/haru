# HARU Recording Upload Spec (Backend Handoff)

Status: **COMPLETE (development-agent `S8-J`, 2026-11-21)** — 초안(plan-agent 2026-11-20)에 구현 상수 · `UploadTransport` 최종 시그니처 · Mock 위치를 코드와 재대조해 채웠다. 검증 = stage-qa-agent.

> 정본: `packages/contracts/src/recordings/{upload.ts,status.ts}` · `rules/recording-limits.ts` · `rules/session-transitions.ts` · `sessions/transition.ts` · `docs/API_CONTRACTS.md` §3.3 · §3.9 · §5.1.1. Web 녹음 실측 근거: `docs/qa/stage-4a-spike-report.md`. 이 저장소는 Storage · TUS 서버 · Retention Job 을 구현하지 않았다.

## 1. Frontend 녹음 구조 (참고 — 서버가 받게 될 요청의 순서를 설명하기 위함)

```
RecordingController (상태 머신, features/recording/model/recording-controller.ts)
→ ConsentGate / PermissionService → RecorderAdapter (Web — MediaRecorder, shared/platform/recorder/)
→ LocalRecordingStore (청크 영속 · 크래시 복구, IndexedDB + OPFS)
→ SessionOutbox (세션 전이 이벤트 영속 · IK — features/recording/model/session-outbox.ts)
→ UploadQueue (재시도 · 네트워크 복구 · 48h 안내 — features/recording/model/upload-queue.ts)
→ recordingApi (init / refreshTokens / complete / status — shared/api/recording-api.ts)
→ UploadTransport (Mock | TUS — shared/api/upload-transport.ts · http/TusUploadTransport.ts)
```

- 네이티브(Capacitor) 녹음은 후속 단계(`D4-1`, `S4N-A`~`D`) — 현재 Web 만. `apps/mobile` 없음.
- 로컬 녹음은 **업로드 확정 응답 전까지 삭제하지 않는다**. 예외: 사용자 Discard(서버 `abandoned` 확정 후, `D4-12`) · 로컬 14일 상한(`D4-29`, 7일 안내) · 로그아웃 · 전체 삭제 · 탈퇴 · 세션 녹음 삭제 서버 확정 후.
- 세션 전이 실패 · 오프라인 → SessionOutbox 적재 후 재전송 (재시도 대상 code = `INTERNAL_ERROR` · `RATE_LIMITED` · `PROVIDER_UNAVAILABLE`, 백오프 2s → 10s → 30s → 60s → 300s). 삭제 요청은 Outbox 대상이 아니다 (오프라인이면 보내지 않고 안내).

## 2. Endpoint

| Method · Path | Request → Response (contracts) | Error | Frontend 호출 지점 | 비고 |
|---|---|---|---|---|
| `POST /v1/sessions/:sessionId/recordings` (IK, CG) | `RecordingUploadInitRequestSchema{ parts[{partNo, mimeType, container, bytes}], totalDurationSeconds }` → `RecordingUploadInitResponseSchema{ recordingId, uploadStatus:'pending', transport:'tus', parts[{partNo, endpoint, uploadToken, objectKey, expiresAt}] }` | `CONSENT_REQUIRED` · `RECORDING_NOT_ALLOWED_FOR_MODE` · `SESSION_INVALID_TRANSITION` · `ACCOUNT_DELETION_PENDING` | `upload-queue.ts` (`recordingApi.init`) | init 은 세션이 `recording`/`paused` 일 때 먼저 올 수 있다 (RU-18) |
| `POST /v1/recordings/:recordingId/upload-tokens` (IK, CG) | `RefreshUploadTokensRequestSchema{ partNos }` → `RecordingUploadInitResponseSchema` | `RECORDING_DELETED` · `ACCOUNT_DELETION_PENDING` | `upload-queue.ts` (`refreshTokens`) — `UPLOAD_TOKEN_EXPIRED` 후 1회 | 토큰 만료 재발급 |
| (TUS) part 전송 | `PATCH`/`HEAD` on `parts[].endpoint` · `Authorization: Bearer <uploadToken>` | 401/403 → `UPLOAD_TOKEN_EXPIRED` · 404/410 → `RECORDING_DELETED` 로 해석 (RU-7) | `TusUploadTransport.ts` | 오프셋 충돌 = `UploadOffsetConflictError` → 서버 offset 부터 재개 |
| `POST /v1/recordings/:recordingId/complete` (IK, CG) | `RecordingUploadCompleteRequestSchema{ parts[{partNo, bytes, sha256, durationSeconds}] }` → `RecordingUploadCompleteResponseSchema{ recordingId, uploadStatus:'uploaded', sessionStatus, expiresAt }` | `RECORDING_INCOMPLETE`(`details.partNos`) · `UPLOAD_TOKEN_EXPIRED` · `IDEMPOTENCY_KEY_REUSED` · `ACCOUNT_DELETION_PENDING` | `upload-queue.ts` (`complete`) | `completed → analyzing` |
| `GET /v1/recordings/:recordingId` | → `RecordingStatusSchema{ recordingId, uploadStatus, partCount, expiresAt \| null, deletedAt? }` | `RESOURCE_NOT_FOUND` · `RECORDING_DELETED` · `FORBIDDEN` | **호출 지점 0** (contract · Mock · Http 골격만) | `API_CONTRACTS.md` §4 Stage 4 표 등재 (Rev 12 `C8-8` — `O-2` · RU-8 해소) |
| `POST /v1/sessions/:sessionId/transitions` (IK, CG when `to=recording`) | `SessionTransitionRequestSchema{ to, occurredAt, recordedSeconds? (≤1800), completedReason? (to=completed 면 필수) }` → `SessionTransitionResultSchema` | `SESSION_INVALID_TRANSITION` · `CONSENT_REQUIRED` · `SESSION_MAX_DURATION_EXCEEDED` | `session-outbox.ts` | 전이표 = `rules/session-transitions.ts` |
| `DELETE /v1/sessions/:sessionId/recording` (IK) | → `DeletionRequestSchema` (`scope='session_recording'`, 즉시 `completed`) | `RECORDING_DELETED`(`details.reason`) · `ACCOUNT_DELETION_PENDING` | `features/recording-deletion/model/useDeleteSessionRecording.ts` | 서버 확정 후 로컬 청크 삭제 + UploadQueue 취소 (`P8-BIP-01`) |
| `GET /v1/children/:childId/sessions?hasRecording=true` | → `ListSessionsResponseSchema` (`SessionListItem` = `SessionSummary` + `recording: RecordingStatus \| null`) | `CHILD_NOT_FOUND` | `entities/data-management/useRecordingSessions.ts` | 녹음 목록 (`C8-2`, `P8-BIP-04`) |

## 3. 상수 (contracts · Frontend 코드와 재대조 — `S8-J`)

| 상수 | 값 | 위치 | 근거 |
|---|---|---|---|
| `MAX_RECORDED_SECONDS` | 1800 (실제 녹음 시간 · 일시정지 제외) · `recordedSeconds` schema 상한 | `contracts/src/rules/recording-limits.ts` | #17 |
| `READY_ABANDON_SECONDS` | 600 (`ready` 10분 방치 → `abandoned`) | 같은 파일 | P4-BIP-04 |
| `READY_REMINDER_AFTER_SECONDS` | 300 (ready 리마인드 버블) — Frontend 타이머, 기준 = 클라이언트 `readyAt` | `features/recording/model/recording-controller.ts` | RU-19 (4b) |
| `RECORDING_TOTAL_DURATION_GRACE_SECONDS` | 60 → `totalDurationSeconds ≤ 1860` | `contracts/src/recordings/upload.ts` | S4-B |
| `RECORDING_PART_NO_MAX` | 20 · 같은 요청 안 `partNo` 중복 금지 | 같은 파일 | `D4-24` |
| `RECORDING_PART_BYTES_MAX` | 100 MiB | 같은 파일 | S4-B |
| `mimeType` | 브라우저 원문 문자열 — base type(`;` 앞 trim, `recordingMimeBaseType`) ∈ `audio/webm` · `audio/mp4` · `container`(`webm`·`mp4`)와 일치 | 같은 파일 | `D4-23` · RU-1 |
| `sha256` | `^[a-f0-9]{64}$` | 같은 파일 | — |
| `CLIENT_SESSION_KEY` 길이 | 16~64 | `contracts/src/sessions/create-session.ts` | RU-4 |
| 로컬 보관 | 미업로드 녹음 14일 삭제 (`LOCAL_RECORDING_RETENTION_MS`) · 7일 안내 (`LOCAL_RECORDING_NOTICE_MS`) | `features/recording/model/local-retention.ts` | `D4-29` |
| 업로드 지연 안내 | 48h (`UPLOAD_STALLED_AFTER_MS`) 경과 시 앱 내 안내 (녹음당 1회) — push 아님 | `features/recording/model/upload-queue.ts` | `D4-119` · PRD §13 |
| Raw audio 보관 | 업로드 후 90일 — 화면 문구는 `GET /v1/data-management` 의 `retentionPolicy.rawAudioDays` 로 받는다 (Frontend 리터럴 0) | 서버 | P4-BIP-08 · P8-BIP-04 |

## 4. 서버 요구 (RU · P4-BIP · P4B-BIP · P8-BIP)

> ⚠️ **ID 충돌**: Stage 4b handoff(`stage-4b-handoff.md` F1-10) 가 `RU-19`~`RU-21` 을 4a 와 **다른 내용으로 다시 썼다**. 재번호하지 않고 접미사 **(4b)** 로 구분한다 (`N8-22` 방식).

| ID | 요구 | 출처 |
|---|---|---|
| RU-1 | `mimeType` 은 엔진 원문 — **WebKit 은 `;` 뒤 공백**(`audio/mp4; codecs=mp4a.40.2`). 문자열 동일성 비교 금지 — base type 으로 검증 | 4a |
| RU-2 | part = 연속 녹음 구간(MediaRecorder 세션 1개), timeslice 청크가 아니다 (30분 ≈ 1766 청크, 정상 part 1개) | 4a |
| RU-3 | 복원 녹음은 non-seekable WebM 일 수 있다 — `duration` 메타데이터 신뢰 금지 | 4a |
| RU-4 | 진행 중 세션 1개 · 같은 `clientSessionKey` 재생성 = 같은 세션 | 4a |
| RU-5 · RU-18 | 업로드 확정과 `completed` 전이의 **도착 순서 무관** — 확정이 먼저면 `completed` 직후 `analyzing` · init 이 `recording`/`paused` 중 먼저 올 수 있다 | 4a |
| RU-6 · P4-BIP-21 | `abandoned` 수신 시 녹음 `deleted` · `deletedAt` 기록 + 서버가 part · token 정리 → 이후 토큰 · 확정 · 전송 `RECORDING_DELETED` (Frontend 는 확정 응답 후에만 로컬 삭제 · abort 메서드 호출 없음) | 4a · 4b F2-9 |
| RU-7 | TUS: init 이 upload URL 을 **이미 만들어** 준다 · `Authorization: Bearer <uploadToken>` · 401/403 → 만료, 404/410 → 삭제로 해석 | 4a |
| RU-8 | `GET /v1/recordings/:recordingId` 경로 (§2 — 등재 완료) | 4a · `C8-8` |
| RU-9 | error `details` 모양: `RECORDING_INCOMPLETE.details.partNos` · `SESSION_ALREADY_ACTIVE.details.sessionId` · `SESSION_INVALID_TRANSITION.details.{from,to}` (`ERROR_CODES.md` §3) | 4a |
| RU-10 | `POST /v1/push-devices` 는 IK 없이 token 기준 upsert (같은 token = 같은 기기) | 4a |
| RU-11 · P4-BIP-02 | 녹음 시작 · 재개(`to=recording`) · init · complete 시 서버 측 `child_voice_data` 동의 강제 (클라이언트 `ConsentGate` 는 차단만) | 4a |
| RU-12 | 재개 요청은 `recordedSeconds` 를 싣지 않는다 (pause · completed · 인터럽션 pause 만) — 서버는 마지막 보고값으로 상한 검증 | 4a |
| RU-13 | 인터럽션 pause 와 사용자 pause 는 구분되지 않는다 (사유 필드 없음) | 4a |
| RU-14 · P4-BIP-14 | outbox 재전송 · 크래시 복구의 `occurredAt` 은 최대 14일 과거 — 서버는 수신 시각이 아니라 이 값을 기록, **같은 IK 재생 최소 14일** | 4a |
| RU-15 | `recovered_after_crash` 의 `recordedSeconds` = 디코드 길이 합(없으면 청크 수 × 1초) · part `durationSeconds` = 바이트 비율 배분 → 서버 검증 허용 오차 필요 | 4a |
| RU-16 · P5-BIP-16 | 로컬 14일 삭제로 녹음이 끝내 오지 않는 `completed` 세션 — 서버가 일정 기간 후 `expired`/분석 종결 (Frontend 는 알리지 않는다, 종결 표현 = `OAQ-17`) | 4a · 4b QA AC-4-151 |
| RU-17 | 디코드 실패 part 도 업로드된다 — 재생 불가 part 처리 (검증 · STT 실패) | 4a |
| RU-19 | Web push 토큰은 자리표시 값 `web-permission-only:v1` — 발송 불가 · 계정 간 기기 병합 금지 · 실제 Web Push(VAPID)는 provider 선정 후 | 4a |
| RU-20 | 로그아웃 시 push 기기 삭제(`DELETE /v1/push-devices/:id`) 호출 없음 — 계정 전환 시 기기 정리 정책은 서버 결정 | 4a |
| RU-21 | Activity Card 캐시 수명은 기기 로컬 날짜 기준 — 서버 `card.date` 기준 시간대와 경계가 하루 어긋날 수 있다 (폐기 2일이라 영향 작음) | 4a |
| **RU-19 (4b)** | `POST /v1/sessions` 의 `readyAt` = **클라이언트 시각** — ready 리마인드(5분) · 방치(10분) 타이머 기준. 서버 sweeper 도 같은 기준을 써야 어긋나지 않는다 | 4b F1-10 |
| **RU-20 (4b)** | ready 닫기(`D4-57`)와 10분 방치는 **같은 전이**(`ready → abandoned`, caregiver) — 사유 필드 없음(`D4-13`) | 4b F1-10 |
| **RU-21 (4b)** | Activity Card 경로는 `POST …/selection` **뒤에** `POST /v1/sessions` 를 같은 `readingContext` · `customTime` 으로 보낸다 — 서버는 두 값이 같다고 가정할 수 있다 | 4b F1-10 |
| **RU-22** | 오프라인 폐기(Discard)는 Outbox 가 나중에 보낸다 — 서버는 **늦게 도착한 `recording\|paused → abandoned`** (그 사이 다른 전이 없음)를 받아들여야 한다. `occurredAt` = 사용자가 확인한 시각 | 4b F2-9 |
| P4-BIP-03 | 30분 상한 서버 검증 (`SESSION_MAX_DURATION_EXCEEDED`) | stage-4-plan §10 |
| P4-BIP-05 | signed upload token — 경로 고정 · 짧은 만료(Supabase 최대 24h) · 재발급 | 〃 |
| P4-BIP-06 | TUS 수신 · part 검증(bytes · sha256 · duration) → `RECORDING_INCOMPLETE` | 〃 |
| P4-BIP-07 | complete → `completed → analyzing` + `expiresAt` = uploaded_at + 90d | 〃 |
| P4-BIP-08 | 90일 자동 삭제는 Storage API 로 객체까지 (DB row 만 삭제 금지) · 404 도 성공 처리 후 메타 갱신 · 실패 시 row 유지 + 재시도 | 〃 |
| P4-BIP-15 · P8-BIP-01 | 세션 녹음 삭제: 전 part + 클립 Storage 삭제 · `upload_status='deleted'` · 업로드 토큰 무효화 · job 취소 · audit · 멱등 · 이미 삭제/만료 = `RECORDING_DELETED{reason}` | 〃 · stage-8-plan §10 |
| P4B-BIP-04 | `mode` 클라이언트 값 수용 · `conversation_only` 세션 업로드 → `RECORDING_NOT_ALLOWED_FOR_MODE` | stage-4b-plan §10 |
| P4B-BIP-07 | 끝나지 않은 `recording`/`paused` 세션 서버 정리 — 새 세션을 무기한 막지 않게 (48h · 14일 `D4-29` 와 충돌 금지) | 〃 |
| HX-4-02 | 실제 Storage 업로드 · 서버 확정 · 48h 이후 서버 측 상태 (Frontend 는 앱 내 안내만) | 4b QA AC-4-149 |

## 5. Storage

- bucket `recordings` private · 경로 `{caregiver_id}/{child_id}/{session_id}/{recording_id}/part-{n}.{ext}` — 이름 · 이메일 금지 (`DATA_REQUIREMENTS.md` §4).
- 업로드는 서버 발급 signed upload token 으로만 · 읽기는 짧은 만료 signed URL 로만.
- 암호화: at-rest + (`OAQ-14`) 앱 레벨 추가 여부 결정 대기.
- 전체 삭제 · 탈퇴: `{caregiver_id}/` prefix 전체 삭제 (`P8-BIP-02` · `03`).

## 6. Mock 위치 · 재현 key

| 파일 | 역할 |
|---|---|
| `apps/web/src/mocks/recordings/MockRecordingApi.ts` | `recordingApi` Mock — init / refreshTokens / complete / status, 동의 · 모드 · part 검증 · 삭제 상태 재현 |
| `apps/web/src/mocks/recordings/MockUploadTransport.ts` | `UploadTransport` Mock — 바이트 전송 · 토큰 만료 · 삭제 · 오프셋 |
| `apps/web/src/mocks/recordings/recordingScenarios.ts` | group `recordings` 정의 |
| `apps/web/src/mocks/recorder/{recorderScenarios,localStoreScenarios,deviceSeed}.ts` | group `recorder` (마이크 권한 · 인터럽션 · 자동 종료 · 크래시 복구 · 로컬 보관 상한) · 로컬 저장소 시드 |
| `apps/web/src/mocks/platform/{MockRecorderAdapter,MockRecordingStorage,mockRecordingPlatform}.ts` | RecorderAdapter · 저장소 Mock |
| `apps/web/src/mocks/sessions/MockSessionApi.ts` | 세션 생성 · 전이표 강제 (`SESSION_INVALID_TRANSITION` 등) |
| `apps/web/src/mocks/data-management/MockDataManagementApi.ts` | 세션 녹음 삭제 · 녹음 목록 |
| fixture | `mocks/fixtures/recordings.ts` · `local-recordings.ts` · `sessions.ts` · `data-management.ts` |

| Group | Key (공통 제외) |
|---|---|
| `recordings` | `consent-missing` · `recording-upload-success` · `recording-upload-failure` · `upload-retry` · `upload-token-expired` · `recording-incomplete` · `offline-queued` · `upload-stalled-48h` · `recording-deleted` · `recording-discarded` |
| `recorder` | `mic-permission-denied` · `mic-permission-blocked` · `mic-unavailable` · `mic-permission-revoked` · `recording-interrupted` · `web-background-warning` · `auto-timeout` · `crash-recovered` · `local-retention-exceeded` · `local-retention-notice` |
| `sessions` | `invalid-transition` · `session-already-active` · `-ready` · `-paused` · `onboarding-incomplete` · `consent-missing` · `abandoned` · `recording-discarded` |
| `data-management` | `recording-deleted` · `recording-delete-local-pending` |

전환: `?scenario=<group>:<key>` (여러 그룹은 쉼표) — 정본 `API_CONTRACTS.md` §5.4. Mock 결정성 증거: `apps/web/src/mocks/__tests__/stage4-determinism.test.ts`.

## 7. `UploadTransport` 최종 시그니처 (`apps/web/src/shared/api/upload-transport.ts`)

```ts
interface UploadTransport {
  uploadPart(request: { target: RecordingUploadTarget; data: Blob }, options?: { signal?; onProgress? }): Promise<UploadPartResult>;
  resume(request: { target: RecordingUploadTarget; data: Blob }, options?): Promise<UploadPartResult>;
  abort(request: { target: RecordingUploadTarget }): Promise<void>;
}
// UploadPartResult = { partNo, bytesUploaded, bytesTotal, bytesSent }
// UploadOffsetConflictError(serverOffset) — 서버가 이미 가진 바이트가 있으면 그 offset 부터 resume
```

`RecordingUploadTarget` = init 응답의 `parts[]` 원소 (`endpoint` · `uploadToken` · `objectKey` · `expiresAt`). 실제 TUS 서버 연동은 `BACKEND_INTEGRATION_PENDING`.
