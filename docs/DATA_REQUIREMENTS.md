# HARU Data Requirements (Backend Handoff)

Status: **COMPLETE (development-agent `S8-J`, 2026-11-21)** — 초안(plan-agent 2026-11-20)을 완성했다: ① `docs/DATA_MODEL.md` §1–§14 본문을 **Part B 로 이관**(AC-8-82, `DATA_MODEL.md` 머리에 "이관됨" 표기) ② Stage 2–8 Delta 와 `D8-1` · `D8-2` 결정(`N8-02` ⓐ · `N8-03` ⓐ · `N8-04` ⓐ · `N8-09` ⓐ · `N8-10` ⓐ · `N8-31` ⓐ)을 Part A 에 반영 ③ 구현된 contracts · Mock 위치 대조. 검증 = stage-qa-agent.

> **Migration 계획이 아니다.** 이 저장소는 테이블 · RLS · Storage · Retention Job 을 구현하지 않았다. 컬럼 수준 스케치는 Backend Developer 의 설계 입력이며 그대로 SQL 로 옮기라는 뜻이 아니다. 필드 의미의 정본은 `packages/contracts` 다. **Part A(Delta · 결정)가 Part B(Stage 0 원본)보다 우선한다** — 다르면 Part A 를 따른다.

## Part A — Stage 2–8 Delta · 결정 반영

### A.1 문서 구성

| 부분 | 내용 |
|---|---|
| Part A | Stage 별 Delta (PENDING 장부 중 데이터 대상) · Ownership/RLS/Storage Delta · Stage 8 삭제 · 보관 결정 · Frontend 로컬 데이터 |
| Part B | `DATA_MODEL.md` §1–§14 원문 (Stage 0 승인본 Rev 6) — 공통 규칙 · RLS 유형 R1~R5 · Storage · 관계 · 테이블 · Retention · Cascade · Trial · PRD §12.1 추적. 절 번호는 `B.n` 으로 읽는다 |

### A.2 Stage 별 Data Delta (PENDING 장부에서 데이터 대상 — 원문 · 1:1 장부는 `BACKEND_HANDOFF.md` §6)

| Stage | ID | 데이터 요구 | Part B 대상 |
|---|---|---|---|
| 2 | P2-BIP-03 · 17 | 필수 동의 기록 전 `children` · `onboarding_responses` 생성 금지 · `submit` 1회 수신 시 동의 존재 서버 확인 | B §5 · §6 |
| 2 | P2-BIP-04 | `consent_events` append-only · `action='granted'` 만 (철회 없음 C-4) · 문서 버전 · `current_consents` view · `source` 에 `signup_oauth` 포함(HX-2-02) | B §5 |
| 2 | P2-BIP-06 · 12(R) | `survey_instruments` 버전 · 서버 draft · instrument 응답 필수 · 새 선택지 코드는 `label` 동반 · 버전 호환(`onboarding_v1_1/1.1.0 ↔ 2.0.0` step 키 대응)은 서버 책임 · 문항 id 집합은 contracts enum(`ChoiceQuestionId`) | B §6 |
| 2 | P2-BIP-07 · 09 | `capability_snapshots` / `capability_scores`(score NULL 허용) · `growth_capability_selections` | B §6 |
| 2 | P2-BIP-10 | `children` caregiver 당 1명 UNIQUE | B §6 |
| 2 | P2-BIP-13(A) | 책 검색 코퍼스 · cursor | B §7 `books` |
| 2 | P2-BIP-14(A) | `caregiver_profiles.relationship` · `timezone` — 아동 데이터 혼입 금지 · timezone 은 카드 날짜 · 주 경계 기준 | B §5 |
| 2 | P2-BIP-19 · 18 | `children.owned_books uuid[]` · Q5 카탈로그 = `instrument.questions[owned_books].options{code: book_id, label: title}` | B §6 |
| 2 | HX-2-03 | `child_info.languageEnvironment` **빈 배열 거부 금지**(`.min(1)` 금지) · 미선택 기본값 `['english']` 은 보내는 쪽(Frontend)이 채운다 — 서버가 다시 채우지 않는다 (`stage-2-rework-qa-report.md` R-9) | B §6 `children` |
| 3 | P3-BIP-01 · HX-3-05 | `activity_cards UNIQUE(child_id, card_date)` · caregiver timezone 기준 07:00 · **항상 책이 있는 카드**(없으면 재독) · 역량 순환 중복 회피는 요구만(열 설계 Backend 재량, `D-23`) | B §7 |
| 3 | P3-BIP-04 · 06 · HX-3-04 | `books` 카탈로그 · 표지(`coverUrl` 서버 제공, 권장 비 107:151) · 구매 링크 · 증정 배송지 저장 위치(성인 PII — 법무) | B §7 |
| 3 | P3-BIP-09 · 15 · 17 | `child_books` 소유 · 히스토리(`first_read_at` · `last_read_at` · `read_count`) · `saved` · `saved_at`(재호출 시 같은 값) · `source=card_save` · 다회차 진행(`progressRatio` 서버 산식 · `plannedNights` 출처 미결) · Reading now 선정 · `lastSessionMinutes` | B §7 |
| 3 | P3-BIP-10 | 카드 응답이 `child_books` 를 조인(`ActivityCardOption.saved`) — 2초 NFR 영향 | B §7 |
| 3 | P3-BIP-12 | 카드 채택률 KPI (`selected_option_id` · `adopted_session_id`) · IK 24h | B §7 |
| 3 | P3-BIP-14 | `prompts.page_ref` — 책별 페이지 앵커 데이터는 **콘텐츠 제작 범위**(편집 · 감수 작업 필요, `S3-PROMPT-1` · `D-8`) | B §7 |
| 3 | P3-BIP-16 | 책 평점 집계 — 모집단 = **해당 Child 의 세션 평점만**(다른 가정 평균 금지) · `averageRating` nullable | B §7 |
| 3 | HX-3-07 | 제목 · 사용자 입력 제목 등 길이 상한은 schema 에 없다 — 서버 저장 제약으로 정한다 | B §7 |
| 4 | P4-BIP-02 | 녹음 · 분석 관련 row 에 `consent_event_id` 고정 | B §8 |
| 4 | P4-BIP-07 · 08 | `recordings.expires_at` = uploaded_at + 90d · Storage 객체 삭제 | B §8 · §12.1 |
| 4 | P4-BIP-10 · 18 | `sticker_awards.session_id UNIQUE` · 표시 문구(또는 키) 보관 — streak 컬럼 요구 없음 | B §8 |
| 4 | P4-BIP-14 · RU-14 | `session_events.occurred_at` = 클라이언트 `occurredAt`(최대 14일 과거) · 멱등 키 14일 | B §8 · §12.1 |
| 4 | P4-BIP-15 · 21 · RU-6 · RU-22 | 세션 녹음 삭제 · `abandoned` 시 part 정리 · 늦게 도착한 `abandoned` 수용 | B §8 · §12.2-A |
| 4 | P4B-BIP-03 | 완료 버블 세션 단위 보존 (자녀 연결 데이터 — RLS · 전체 삭제 대상) | B §8 |
| 4 | RU-16 · RU-21 · P4B-BIP-07 · HX-4-01 | 녹음 미도착 `completed` 세션 정리 · 끝나지 않은 recording/paused 세션 정리 · 대화 전용 미제출 ready 세션 sweeper · 카드 캐시 날짜 경계 | B §8 |
| 4 | `S4-DEC-4` (`N4-30`) | `abandoned` 은 **10분 방치와 사용자 폐기(Discard · ready 닫기)를 구분하지 않는다**(`D4-13` · RU-20 (4b)). Audit · 지표에 사유가 필요하면 사유 값 추가는 별도 결정(contract 변경) | B §8 `storytime_sessions` |
| 5 | P5-BIP-01 · 04 · 05 | `session_reflections` 세션당 1건 · 별점 집계 · `note` 는 PII 가능 자유 텍스트(redaction · 전체 삭제 대상) | B §9 |
| 5 | P5-BIP-14 · 16 | `highlight_clips` 보관(`OAQ-13`) · 녹음 미수신 세션 종결(`OAQ-17`) | B §9 |
| 6 | P6-BIP-01 · 03 · 07 · 08 · 10 · 13 | 스냅샷 갱신 · `recommendation_logs` · 설문 재응답 버전 행(불변) · 아이 정보 수정 이력(법무) · 발전 역량 변경 기록 · 재응답 draft `currentStep ?? step` 저장 · 마지막 쓰기 우선 · `keepalive` 수용 | B §6 · §10 |
| 7 | P7-BIP-01 · 04 · 07 · 09 · 10 · 11 · 15 · 16 · HX-3-02 | 주간 집계 창(보호자 TZ 월~일, Home `sessionsThisWeek` 와 같은 창) · `report_cycles` · `report_snapshots` 불변 · `report_pdfs` · 클립 보관 · `viewed_at` 최초 시각 · overview 의미 · persona trigger 동결 | B §11 |
| 8 | P8-BIP-01~04 · 09 · HX-8-01 · HX-8-02 | A.4 | B §12 |
| 공통 | P5-BIP-15 · P6-BIP-09 · P7-BIP-13 | 전 endpoint 소유권 · RLS · 전체 삭제 대상 | B §2 |

### A.3 Ownership · RLS · Storage (Delta)

- RLS 유형 R1~R5 는 Part B §2 그대로. 신규 테이블 분류(Backend 확정): `report_cycles` · `reports` · `report_snapshots` · `report_pdfs` = R2 · `highlight_clips` = R2 · `data_deletion_requests` = R1 insert/select · `audit_logs` = R3.
- Storage bucket 3개 모두 private: `recordings` · `highlight-clips` · `report-pdfs`. 경로에 이름 · 이메일 금지.
- **signed URL CORS** (`P8-BIP-06`): `highlight-clips` · `report-pdfs` 의 signed URL 은 앱 origin 의 `fetch` GET 을 허용해야 한다 (`Access-Control-Allow-Origin` = 앱 origin, 자격 증명 없음). PDF 는 `fetch → arrayBuffer → File` 로 저장 · 공유한다 (`stage-7-handoff.md` H7-6).

### A.4 Audit · Deletion · Retention (Stage 8 — 결정 반영, Part B §12 를 갱신)

#### A.4.1 `data_deletion_requests`

| 필드 | 요구 (contracts `packages/contracts/src/data-management/deletion-request.ts`) |
|---|---|
| `scope` | `session_recording` · `all_data` · **`account`** (`DeletionScopeSchema`, `N8-02` ⓐ CONFIRMED) |
| `session_id` | `session_recording` 일 때만 값 · 그 밖 `null` (parse 불변식) |
| `status` | `received → processing → completed \| failed` (`DeletionRequestStatusSchema`) · `completed` 면 `completedAt` 필수 · `received`/`processing` 이면 `completedAt null` |
| 유일성 | caregiver 당 진행 중(`received`/`processing`) `all_data`/`account` 요청 1건 → 중복 = `DELETION_ALREADY_REQUESTED` · 요약 `activeDeletionRequest` 는 진행 중 `all_data`·`account` 만 |
| 세션 녹음 삭제 | 응답 = `DeletionRequest(session_recording, status='completed', completedAt=requestedAt)` — 즉시 처리 · 이미 삭제/만료 = `RECORDING_DELETED{reason}` |
| 멱등 | `Idempotency-Key` (제출 의도마다 1개 — `failed` 후 *Try again* = 새 요청 · 새 키) |
| `completed_at` | **서버가 Storage · DB 삭제를 모두 끝낸 시각** — Frontend 는 `completed` 를 보고 기기 정리 · Toast 를 낸다 (HX-8-02) |

#### A.4.2 Retention

Part B §12.1 표 그대로. 결정 대기: 클립 보관(`OAQ-13`) · `ai_generation_logs`(권장 13개월) · `consent_events` · `audit_logs` 보관(법무 L-05) · 녹음 원본 앱 레벨 암호화(`OAQ-14`). Part B §12.1 의 "로컬 기기 녹음 미업로드 상한 OAQ-11" 은 **14일 · 7일 안내로 확정**(`D4-29`). **보관 일수는 `GET /v1/data-management` 의 `retentionPolicy.rawAudioDays`(int > 0)로 서버가 내려준다** — Frontend 는 값을 하드코딩하지 않는다 (`P8-BIP-04`, AC-8-15).

#### A.4.3 삭제 Cascade — Part B §12.2 에 대한 결정

| 지점 | 결정 · 요구 | 근거 |
|---|---|---|
| A-5 녹음 삭제 범위 | 원본 오디오 + 하이라이트 클립 삭제 · 전사 · 지표 · 관찰 · 회고 · 스티커 **유지** — 화면 확인 문구가 "대화 기록 · 관찰은 남는다" 를 안내 | `N8-03` ⓐ CONFIRMED |
| A-5 토큰 | 업로드 토큰 무효화 · 진행 중 업로드 거부(`RECORDING_DELETED`) | P8-BIP-01 |
| A-6 분석 전 세션 종결 | `OAQ-17` 미결 — enum 추가 0 · 세션 `uploadStatus='deleted'` + `deletedAt` 으로 표현(`C8-7`) | 유지 |
| A-7 클라이언트 | 로컬 미업로드 청크는 **서버 확정 응답 후** 삭제 + 업로드 큐 취소 · 오프라인이면 요청하지 않고 안내 (`recording-delete-local-pending`) | Stage 8 구현 |
| B-1 | 요청 즉시 `deletion_pending` — 신규 쓰기 차단 → `ACCOUNT_DELETION_PENDING` (409) · 범위 = `ERROR_CODES.md` §4 | `N8-09` ⓐ CONFIRMED |
| B-4 범위 | 자식 → 부모 hard delete 에 **`reports` · `report_snapshots` · `report_pdfs` · `report_cycles` · 주간 집계** 포함 — 삭제 후 Progress = 빈 주 · 발행 리포트 0 · 주기 1 `in_progress` 0/0 (Mock 이 이 상태를 표현) | `H8-3` · P8-BIP-02 |
| B-5 탈퇴 vs 전체 삭제 | **분리**: 전체 데이터 삭제 = 아동 데이터 삭제 · 계정 유지 / 탈퇴(`scope='account'`) = 계정 포함 전체 삭제 · `caregiver_profiles` · auth user 삭제 · `consent_events` · `audit_logs` 가명화 보관 | `N8-02` ⓐ CONFIRMED |
| B-6 SLA | 화면에 기한 수치 없음 · 백업(PITR) 잔존 고지 문구는 법무 | `N8-04` ⓐ · 법무 |
| B-7 완료 알림 | PRD 미정 — Frontend 는 진행 상태 화면 + 완료 Toast 1회로 대체 (이메일 알림 없음) | 미정 |
| 발행 리포트와 세션 녹음 삭제 | 발행 스냅샷은 불변(`P7-BIP-07`) · 세션 녹음 삭제 후 그 클립 재생 = `RECORDING_DELETED` | P7-BIP-07 |
| 전체 삭제 후 계정 상태 | `GET /v1/me` `onboardingStatus` 가 미완료로 돌아가야 Guard 가 온보딩으로 보낸다 | `N8-10` ⓐ CONFIRMED |
| 세션 목록 | `GET /v1/children/:childId/sessions` 항목에 `recording: RecordingStatus \| null` (key 항상 포함) · `hasRecording=true\|false` 필터 · `recordingsCount` = `hasRecording=true` 행 중 `uploaded`·`pending`·`failed` 수(`deleted`·`expired` 행은 목록에 남되 세지 않음 — `VG8-A-04`) | `C8-2` · P8-BIP-04 |
| 다른 기기 | 기기 표시가 없는 다른 기기의 로컬 데이터는 서버 신호 없이 정리 불가 — 서버 신호(예: `me` 의 마지막 삭제 완료 시각) 요구 · contract 변경은 사용자 승인 | HX-8-01 · R8-15 |
| 보호자 이메일 | `caregiver.email` = 인증 계정 로그인 이메일 · 읽기 전용 · 탈퇴 시 삭제 대상 | `C8-10` · P8-BIP-09 |

### A.5 Frontend 로컬 데이터 (참고 — 서버 요구 아님, 정리 함수 `apps/web/src/shared/lib/session-cleanup.ts`)

| 로컬 저장 | 키 · 위치 | 삭제 시점 |
|---|---|---|
| 온보딩 draft | `localStorage["haru.onboarding.draft.v1"]` (`shared/lib/onboarding-draft.ts`) | 제출 · 로그아웃 · 전체 삭제 · 탈퇴 · 미가입 기기 삭제 경로(`QA-2R-004` — `/onboarding/start` · Step 1 TextLink) |
| Activity Card 캐시 | `localStorage["haru.activity-card.v1"]` | 로그아웃 · 삭제 · 탈퇴 · 2일 경과 |
| 로컬 녹음 | IndexedDB + OPFS (`LocalRecordingStore`) | 업로드 확정 · Discard 확정 · 14일(`D4-29`) · 로그아웃 · 세션 녹음 삭제 확정 · 전체 삭제 · 탈퇴 |
| SessionOutbox · UploadQueue | IndexedDB | 위와 같음 |
| TanStack Query 캐시 | 메모리 | 로그아웃 · 삭제 · 탈퇴 |
| 전체 삭제 요청 표시 | `localStorage["haru.data-deletion.pending.v1"]` = `{ requestId, scope: 'all_data', savedAt }` — PII 0 (`shared/lib/data-deletion-marker.ts`) | 완료 정리 성공 후 · `failed` · `RESOURCE_NOT_FOUND` · `FORBIDDEN` · 로그아웃 · 탈퇴 |
| 로그인 복귀 경로 | 메모리만 (탭 종료 시 소멸) | 로그인 후 사용 |

---

## Part B — 이관 본문 (`docs/DATA_MODEL.md` §1–§14, Stage 0 승인본 Rev 6, 2026-11-21 이관)

> 아래는 원문 그대로다 (제목 단계만 한 단계 내림). "Stage 8에서 … 정리한다" 류의 예고 문장은 이 문서로 실행되었다. 결정으로 바뀐 지점은 Part A.4 가 우선한다.

### 1. 공통 규칙

| 규칙 | 내용 | 근거 |
|---|---|---|
| PK | `id uuid` (default gen_random_uuid) | 기술 요구사항 |
| 시간 | `timestamptz`, UTC 저장. `created_at`, `updated_at` 모든 테이블 | 기술 요구사항 |
| 소유권 컬럼 | family-owned 테이블은 모두 `caregiver_id uuid` 를 **비정규화 보유**(RLS 단순화·삭제 cascade 검증용), child 하위는 `child_id` 도 보유 | rules/architecture §9 |
| 삭제 | `deleted_at`(soft) — 사용자 노출 제외용. 전체 삭제 요청·Retention은 **hard delete** + audit. 원본 오디오는 soft delete 금지(Storage 객체까지 삭제) | NFR 프라이버시, rules/backend.md §4 (Raw Audio는 Storage API로 객체까지 삭제) |
| 만료 | Raw audio·클립: `expires_at` | NFR 90일 |
| 동의 참조 | 녹음·분석 관련 row는 `consent_event_id`(당시 유효한 아동 음성 동의) 참조 | FR-02, rules/backend.md §4 (서버 측 동의 강제·Consent History) |
| Enum | Postgres enum 대신 `text + CHECK` (contracts enum 변경 시 migration 부담 완화), 값은 contracts와 동일 | 기술 요구사항 |
| PII | 아이 이름은 `children.first_name`·`children.last_name` 한 곳 (D-03). 화면·알림 호칭은 `first_name` 만. 파생 텍스트·AI 입력에는 이름 치환 토큰 사용 | NFR 최소 수집, C-6 |
| 동의 전 쓰기 금지 | 필수 동의 기록 전에는 아동 데이터(`children`, `onboarding_responses` 등)를 생성하지 않는다. Trial 응답은 서버에 없다 | FR-02, C-2, C-12 |

### 2. Ownership · RLS 접근 방식

**Backend Handoff 요구사항** (`DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md`). Frontend는 RLS를 구현·테스트하지 않는다. 향후 Backend는 도메인 데이터를 API 경유로만 노출하고(ARCHITECTURE §6.1), RLS는 **2차 방어선**으로 둔다.

| 정책 유형 | 대상 | 정책 |
|---|---|---|
| **R1 Owner read/write** | 사용자가 API를 통해 생성·수정하는 family 데이터 (`children`, `onboarding_responses`, `child_books`, `session_reflections` …) | `authenticated`: `caregiver_id = auth.uid()` 인 행만 select/insert/update. delete는 API(service)만 |
| **R2 Owner read-only** | 서버·Worker가 생성하는 파생 데이터 (`capability_snapshots`, `personas`, `session_metrics`, `reports` …) | `authenticated`: 본인 행 select만. insert/update/delete 정책 없음(= 거부) |
| **R3 Server-only** | 민감 원문·운영 데이터 (`transcripts`, `analysis_jobs`, `ai_generation_logs`, `audit_logs`, `recording_parts`) | RLS enable + 정책 없음 → `anon`/`authenticated` 전면 거부, Service Role(Worker)만 접근 |
| **R4 Catalog read** | 운영 콘텐츠 (`books`, `prompts`, `consent_documents`, `survey_instruments`) | `authenticated`: select (active 행), 쓰기는 Service Role |
| **R5 Append-only** | `consent_events` | `authenticated`: 본인 insert + select, update/delete 정책 없음 |

- Helper: `auth_owns_child(child_id)` (security definer, `children.caregiver_id = auth.uid()`).
- Trial 익명 사용자: **해당 없음** — Trial은 기기 로컬 draft만 쓰고 익명 계정을 만들지 않는다 (CONFIRMED (사용자 결정 2026-09-14, C-12)). 익명 JWT 조건 정책 불필요.
- Storage: bucket `recordings`, `highlight-clips`, `report-pdfs` 모두 private. 객체 경로 `{caregiver_id}/{child_id}/{session_id}/{recording_id}/part-{n}.{ext}` — 경로에 이름·이메일 금지. Storage RLS: 업로드는 서버가 발급한 signed upload token으로만, 읽기는 signed URL(짧은 만료)로만.
- Backend Developer 검증 요구사항 (이 프로젝트에서 실행하지 않음): 소유자 허용 / 비소유자 차단 / 필수 동의 전 아동 데이터 쓰기 차단 / R3 전면 차단.

### 3. 관계 개요

```
auth.users 1─1 caregiver_profiles
   │ 1─N consent_events ─N─1 consent_documents
   │ 1─1 notification_preferences, 1─N push_devices
   │ 1─1 children  (MVP: unique caregiver_id)
   │        ├─1─N onboarding_responses ─N─1 survey_instruments
   │        ├─1─N capability_snapshots ─1─N capability_scores
   │        ├─1─N personas
   │        ├─1─N growth_capability_selections
   │        ├─1─N child_books ─N─1 books ; book_gift_requests
   │        ├─1─N activity_cards ─1─N activity_card_options ─N─1 books, prompt_sets
   │        ├─1─N storytime_sessions
   │        │        ├─ session_events (전이·pause 이력)
   │        │        ├─ session_prompts
   │        │        ├─ recordings ─1─N recording_parts
   │        │        │       └─ transcripts (1─1, R3)
   │        │        ├─ session_reflections (1─1)
   │        │        ├─ analysis_jobs (R3)
   │        │        ├─ session_metrics (1─1) · observations · capability_signals
   │        │        ├─ highlight_clips
   │        │        ├─ short_feedbacks
   │        │        └─ sticker_awards
   │        ├─1─N report_cycles ─1─0..1 reports ─1─N report_snapshots, report_pdfs
books 1─N prompt_sets 1─N prompts
ai_generation_logs, audit_logs, data_deletion_requests (운영)
```

### 4. 테이블 목록 (필요 Frontend Stage — Contract/Mock 기준)

| 필요 Frontend Stage (Contract/Mock) | 테이블 (Backend Handoff 요구사항) |
|---|---|
| 2 | `caregiver_profiles`, `consent_documents`, `consent_events`, `children`, `survey_instruments`, `survey_items`, `onboarding_responses`, `capability_snapshots`, `capability_scores`, `personas`, `growth_capability_selections`, `audit_logs`(기반) |
| 3 | `books`, `child_books`, `book_gift_requests`, `prompt_sets`, `prompts`, `activity_cards`, `activity_card_options`, `notification_preferences`, `push_devices` |
| 4 | `storytime_sessions`, `session_events`, `session_prompts`, `recordings`, `recording_parts`, `sticker_awards` |
| 5 | `session_reflections`, `analysis_jobs`, `transcripts`, `session_metrics`, `observations`, `capability_signals`, `highlight_clips`, `short_feedbacks`, `ai_generation_logs`, `notification_deliveries` |
| 6 | `recommendation_logs` (+ `capability_snapshots.source='session'`, `personas` 이력 활용) |
| 7 | `report_cycles`, `reports`, `report_snapshots`, `report_pdfs` |
| 8 | `data_deletion_requests` (Retention Job·전체 삭제 파이프라인은 Backend Handoff 요구사항, Frontend는 삭제 요청 UX·로컬 정리만) |

> FR-21: Stage 4 = 로컬 녹음 삭제 기반만, Stage 8 = 데이터 관리 UI·세션별 녹음 삭제·전체 삭제 요청·탈퇴 (CONFIRMED (사용자 결정 2026-09-14, C-15)).

---

### 5. Identity · Consent (Stage 2)

#### caregiver_profiles — R1 (update 본인), insert는 서버
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK = auth.users.id | |
| email_hash | text | 로그 조회용 해시(선택). 이메일 원문은 auth.users에만 |
| display_name | text null | Figma `179:1724` "YOU" 필드 |
| relationship | text CHECK (mother, father, grandparent, babysitter, tutor, therapist, other) | PRD §7.2 Step 1, §3.1 |
| timezone | text | Activity Card 07:00·알림 시각 계산 (기술 요구사항, FR-07/08) |
| locale | text default 'en-US' | |
| plan | text default 'free' | §7.1 가입 시 Free 부여. 결제는 P2(FR-26) |
| onboarding_status | text CHECK (not_started, in_progress, completed) | FR-03 Route Guard |
| created_via | text CHECK (email, google, apple) | §12.1 인증 방식 (익명 Trial 없음 — C-12) |
| parent_verification_status | text CHECK (not_required, pending, verified, failed) | **RECOMMENDED** — VPC 단계 슬롯 상태 (C-3). 방식·증빙 필드는 NEEDS DECISION (법무, L-01) |

#### consent_documents — R4
| 컬럼 | 비고 |
|---|---|
| id, consent_type, version (text), locale, content_hash, url, effective_at, retired_at | 약관·방침·보호자 동의문·파일럿 동의문의 버전 관리 (C-1 "각 동의는 문서 버전과 함께 기록") |
| is_required bool | 필수 여부 — `pilot_participation` 은 법무 결정값 (L-02). Frontend는 contracts `ConsentDocument.required` 로 받아 필수 표시 (값 변경 시 코드 수정 없음) |

#### consent_events — R5 append-only
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid | |
| caregiver_id | uuid FK | |
| child_id | uuid null | 아동 대상 동의일 때 (가입 시점엔 child 미생성 → null 허용) |
| consent_type | text | contracts `ConsentType` — CONFIRMED (사용자 결정 2026-09-14, C-1): `terms_of_service`(필수), `privacy_policy`(필수), `child_voice_data`(필수, 별도 체크 — 아동 음성·성장 데이터), `marketing`(선택), `pilot_participation`(필수/선택 NEEDS DECISION (법무, L-02)). `third_party_disclosure` 는 C-1에 없음 — 필요 여부 NEEDS DECISION (법무) |
| consent_document_id | uuid FK | 버전 참조 |
| action | text CHECK (granted) — `revoked` 없음: 동의 철회 MVP 제외 (CONFIRMED (사용자 결정 2026-09-14, C-4); COPPA 관계 법무 L-03) | append-only 이력 (PRD §12.1 "동의 이력") |
| method | text | `checkbox` 또는 VPC 방식 코드 — VPC 방식 NEEDS DECISION (법무, L-01) |
| source | text CHECK (signup_email, signup_oauth, settings, reconsent) | 모든 가입 경로가 가입 직후 같은 동의 화면을 거친다 (C-2) |
| occurred_at | timestamptz | |
| ip_hash, user_agent_summary | text null | 증빙 최소화 (보관 기간 NEEDS DECISION) |

- "현재 유효 동의" = type별 최신 행이 `granted` 이고 문서 버전이 현행 필수 버전 이상 → view `current_consents`.
- **동의 철회 없음** (CONFIRMED (사용자 결정 2026-09-14, C-4)). 보호자 권리는 세션별 녹음 삭제·전체 데이터 삭제 요청·탈퇴(FR-21, §12.2)로 제공. 철회 미제공의 COPPA 적합성은 NEEDS DECISION (법무, L-03).
- 필수 동의 = `terms_of_service` + `privacy_policy` + `child_voice_data` (+ L-02 결과에 따라 `pilot_participation`). 이 동의가 유효하기 전에는 R1 아동 데이터 쓰기를 거부한다 (`CONSENT_REQUIRED`, C-2).

### 6. Child · Onboarding · Profile (Stage 2)

#### children — R1 (필수 동의 기록 후 온보딩 Step 1에서 생성 — CONFIRMED (사용자 결정 2026-09-14, C-5))
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id (UNIQUE — MVP 1명, FR-27 P2 시 제거) | |
| first_name | text — 이름. 화면·알림 호칭에 사용하는 유일한 이름 (CONFIRMED (사용자 결정 2026-09-14, C-6)) |
| last_name | text — 성. Figma `179:1740` 두 칸 유지 (C-6). PRD "이름(닉네임)"·최소 수집과 다름 → 사용자 수용 예외 D-03, 수집 적합성 NEEDS DECISION (법무, L-07). 호칭·AI 입력·알림 payload에 사용하지 않음. 필수 여부는 Stage 2 Plan |
| birth_year_month | `date`(일=1 고정) — 생년월만 (§7.2). 대상 연령 3~9세 가입 허용 (CONFIRMED (사용자 결정 2026-09-14, C-10)) |
| gender | text null CHECK (girl, boy, prefer_not_to_say) — 선택 입력, 기본 미선택·미응답 = null (CONFIRMED (사용자 결정 2026-09-14, C-7)) |
| language_environment | text[] 또는 jsonb | §7.2 Step 1 |
| reading_routine | jsonb | 가족 내 독서 루틴 |
| topic_tags | text[] | §7.2 Step 3 |
| growth_goals | text[] | §7.2 Step 4 |
| current_growth_capability | text (Capability) | FR-06 현재 값 (이력은 selections) |
| deleted_at | | |

#### survey_instruments / survey_items — R4 (FR-03, C-8)
온보딩 Step 5 = **Baseline Survey v1 10문항** — CONFIRMED (사용자 결정 2026-09-14, C-8). PRD §7.2 "역량별 동일 문항 수·5점 리커트"와 다름 → 사용자 수용 예외 D-04. 원문 `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md`. 문항 문구는 코드에 하드코딩하지 않고 instrument 데이터로 버전 관리한다.
| survey_instruments | id, code (`baseline_v1`), version, stem ("In the past two weeks…"), scale_type (`frequency_5_with_not_observed`), age_min_months null, age_max_months null, administration (`onboarding` — Exit 설문 없음 C-11; 설정의 설문 재응답은 같은 instrument 재사용), active |
|---|---|
| survey_items | id, instrument_id, item_code (`ER1`, `ER2`, `AG1`, `AG2`, `AG3`, `CF1`, `CF2`, `IM1`, `IM2`, `IM3`), capability (contracts `Capability`: ER=`emotion_regulation`, AG=`self_directed_agency`, CF=`cognitive_flexibility`, IM=`intrinsic_motivation`), order, prompt_text, scored bool (10문항 모두 true) |
- 척도: Never · Rarely · Sometimes · Often · Almost always = 내부 1–5점. 비채점 응답 "Haven't had the chance to see this yet" = `not_observed` (결측 — 낮은 점수가 아님).
- 역량별 문항 수: ER 2 · AG 3 · CF 2 · IM 3.
- 대상 연령: 가입은 3~9세 (C-10). Baseline v1은 3.0–4.0세 대상으로 설계됨 — 4세 이상 적합성은 기획·전문가 확인 필요. 연령별 instrument 분리 여부는 그 결과에 따르며, 그때 `age_min_months`/`age_max_months` 를 채운다.

#### onboarding_responses — R1 (FR-03 중도 저장·복귀)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, instrument_id | |
| step | text (child_info, temperament, books, goals, capability_items) — 5단계 구성·순서 CONFIRMED (사용자 결정 2026-09-14, C-9), 식별자 문자열 RECOMMENDED |
| answers | jsonb — step별 contracts schema로 검증된 값 (API_CONTRACTS §3.4). `child_info` = `{first_name, last_name, birth_year_month, gender, …}` — 동의 기록 후에만 저장 (C-5). `capability_items` = `[{item_code, value: 1..5 \| 'not_observed'}]` |
| status | draft, submitted |
| administered_at_phase | onboarding, settings_retake (PRD §7.8 설문 재응답) — Exit(T1) 설문 없음 (CONFIRMED (사용자 결정 2026-09-14, C-11)) |
| submitted_at | |

#### capability_snapshots — R2 / capability_scores — R2 (FR-04, FR-15, §12.1)
| capability_snapshots | id, caregiver_id, child_id, source (`onboarding_survey`, `session_analysis`, `report_cycle`), source_ref_id, scoring_version, created_at |
|---|---|
| capability_scores | id, snapshot_id, capability, score numeric(2,1) 1.0–5.0 null — 온보딩 스냅샷은 **응답한 문항의 평균** (`not_observed` 제외, CONFIRMED (사용자 결정 2026-09-14, C-8); 한 역량 문항이 모두 결측일 때 처리는 Stage 2 Plan), evidence_summary_key (근거 설명 템플릿 키), item_count, missing_count |

- 스냅샷은 불변. 최신 = `created_at` 최대. 리포트 오버레이(§7.7)는 두 스냅샷 비교.

#### personas — R2 (FR-05, FR-15)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, snapshot_id | |
| name, description | 영어 노출 문구 (슬롯 치환 전 템플릿 형태로 저장 권장 — 이름 토큰) |
| template_id, generation_mode (template_only, llm_slot, fallback_pool) | §8.4 |
| safety_status (passed, replaced_by_fallback) | |
| ai_generation_log_id null | |
| is_current bool | 페르소나 히스토리 = 전체 행 (§7.7) |

#### growth_capability_selections — R1 insert / R2 제안 (FR-06)
| id, caregiver_id, child_id, capability, selected_by (`system_suggested`, `caregiver_changed`), snapshot_id null, created_at |

### 7. Books · Library · Prompts · Activity Cards (Stage 3)

#### books — R4 (FR-22, §8.1)
| 컬럼 | 비고 |
|---|---|
| id, title, author, cover_image_path, age_min_months, age_max_months | §8.1 메타데이터 |
| topic_tags text[], difficulty, est_reading_minutes, purchase_url | |
| capability_relevance jsonb `{capability: 0..1}` | 4대 역량 관련도 스코어 |
| is_curated bool, is_giftable bool, active | 초기 20권 큐레이션 |

#### child_books — R1 (FR-20, FR-22, FR-23, §8.1)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id | |
| book_id null | 카탈로그 책 |
| user_entered_title, user_entered_author null | DB에 없는 책 — 제목 텍스트 저장, 추천은 주제 태그만 (§7.2 규칙) |
| ownership | `owned`, `gifted`, `gift_pending`, `favorite_only` (온보딩 "좋아하는 책"은 보유와 다름) |
| source | `onboarding_favorite`, `library_add`, `gift_program`, **`card_save`** — ~~`onboarding_home_list`~~ 제거(온보딩 `homeBooks` 삭제, `stage-3-approvals.md` §11.9). `card_save` = Home/시트의 `★ Save` 로 행이 처음 생기는 경로 (`A-9`) |
| **saved bool · saved_at null** | **`★ Save` 축 (2026-10-05, `stage-3-approvals.md` §12.8 `A-9`)**. `ownership` 과 **독립된 축**이다 — 보유 중인 책도 저장될 수 있고, `favorite_only`(온보딩 "좋아하는 책")를 재사용하면 설문 응답과 보호자 저장이 섞인다. Figma `145:1157` "My Saved" 표면과 `LibraryFilter=saved` 가 이 축 위에서 성립한다. 요구사항만 기록하며 **열 설계·이름은 Backend 재량**(`D-23` 과 같은 취급) |
| first_read_at, last_read_at, read_count | "읽은 책 히스토리" (FR-20) — sessions에서 파생 갱신 |
| CHECK | `book_id IS NOT NULL OR user_entered_title IS NOT NULL` |

> ~~Figma `30:74` "My Saved", "Reading now · 3 of 5 nights", "Rated 4.5" 는 PRD에 없는 개념 → 컬럼 추가하지 않음~~ → **부분 개정 (2026-10-05, `stage-3-approvals.md` §12.8 `A-9`)**:
> - **"My Saved" = 채택** — Figma 에 `★ Save` 버튼(`I86:438;86:383;117:973`)이 실제로 있고 사용자가 "현재 카드를 Library 의 favorites 에 저장한다"로 결정했다 → 위 `saved`·`saved_at` 요구. contract 설계 = `docs/API_CONTRACTS.md` §3.7.
> - **"Reading now · 3 of 5 nights" · "Rated 4.5" = 미채택 유지** (`D-7` 의 해당 부분은 유효). 불일치로 보고 (PLANNING.md §6, M-14).

#### book_gift_requests — R1 (FR-22, §13 증정 책 미보유·배송 대기)
| id, caregiver_id, child_id, book_id, status (`requested`, `approved`, `shipped`, `delivered`, `cancelled`, `rejected`), shipping_address_ref, requested_at, status_updated_at |
- **배송지 주소는 아동 관련 PII와 결합되는 성인 PII** — 저장 위치(주소를 별도 테이블/외부 풀필먼트 시스템에 둘지)는 NEEDS DECISION(운영·법무). `shipping_address_ref` 는 참조만.

#### prompt_sets / prompts — R4 (§8.2, FR-07)
| prompt_sets | id, book_id null(범용), capability, age_band (`3_4`, `5_6`, `7_9`), coaching_line, status (draft, expert_reviewed, active), reviewed_by, reviewed_at |
|---|---|
| prompts | id, prompt_set_id, kind (`question`, `follow_up`), text, order |
- 책별 최소 6개 (§8.2) — 운영 데이터 검증 쿼리로 확인.

#### activity_cards — R2 (FR-07, §7.4, §12.1)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id | |
| card_date date (caregiver TZ 기준) | UNIQUE(child_id, card_date) |
| target_capability | 역량 순환 스케줄 (§8.3) |
| generated_at, generator_version, recommendation_phase (`cold`, `warm`) | §8.3 Cold ≤3 세션 / Warm ≥4 |
| selected_option_id null, adopted_session_id null | 추천 채택률 KPI (§2.3) |
| reading_context | contracts `ReadingContext` null, `custom_time` time null | FR-08 |

#### activity_card_options — R2 (카드 덱 3장)
| id, activity_card_id, position (0=today, 1,2=alternative), book_id null, child_book_id null, option_kind (`book`, `reread_book`, `conversation_only`), reason_text, coaching_line, prompt_set_id null |
- `conversation_only`: §7.4 책 미보유, §13 추천 책 소진 대체 카드.
- 재독 시 새 Prompt 세트 (§8.3): 이전 `session_prompts` 와 겹치지 않는 prompt_set 선택 — 서비스 규칙.

#### notification_preferences — R1 / push_devices — R1 (FR-08, §7.8)
| notification_preferences | caregiver_id PK, card_refresh_time time default 07:00, reminder_days smallint[], reminder_time time null, push_enabled, marketing_opt_in (consent_events 반영값 캐시) |
|---|---|
| push_devices | id, caregiver_id, platform (ios, android, web), provider_token (암호화 저장 권장), last_seen_at, revoked_at |

### 8. Storytime Sessions · Recording (Stage 4)

#### storytime_sessions — R2 (쓰기는 API 전이만) (FR-09, §12.1, §12.2)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id, caregiver_id, child_id | uuid | |
| activity_card_id, activity_card_option_id | uuid null | 추천에서 시작한 경우 |
| book_id, child_book_id | uuid null | 대화 전용이면 둘 다 null 가능 |
| mode | text CHECK (recorded, conversation_only) | CONFIRMED (사용자 결정 2026-09-14, #16) |
| status | text CHECK (ready, recording, paused, completed, analyzing, analyzed, failed, abandoned) | contracts `SessionStatus` — CONFIRMED (사용자 결정 2026-09-14, #16) |
| reading_context | text null | |
| ready_at, started_at, completed_at, abandoned_at | timestamptz | client `occurredAt` 기준 |
| completed_reason | text null (user_done, auto_timeout, recovered_after_crash) | CONFIRMED (#16) |
| recorded_seconds | int default 0, ≤ 1800 | 실제 녹음 시간 (일시정지 제외 — CONFIRMED (사용자 결정 2026-09-14, #17)) — 리포트 eligibility 입력 |
| analysis_outcome | text null (full, excluded_low_quality) | CONFIRMED (#16). `excluded_low_quality` 세션은 리포트 발행 기준에서 제외 (#17). `skipped_audio_deleted` 는 OAQ-17 결정 전 제외, 동의 철회 값 없음 (C-4) |
| consent_event_id | uuid null | 녹음 시작 시점 유효 동의 |
| client_session_key | text UNIQUE | 오프라인 생성·재전송 멱등 키 |

#### session_events — R2 (§12.1 "일시정지 이력", 감사)
| id, session_id, caregiver_id, from_status, to_status, occurred_at (client), received_at (server), idempotency_key UNIQUE, source (client, worker, sweeper) |

#### session_prompts — R2
| id, session_id, prompt_set_id, shown_in (`activity_card`, `prompt_drawer`), first_shown_at |

#### recordings — R2 (메타데이터만 노출, storage path는 비노출)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, session_id | |
| upload_status | `pending`, `uploaded`, `failed`, `deleted`, `expired` — CONFIRMED (사용자 결정 2026-09-14, #16 별도 upload status) |
| part_count, total_bytes, duration_seconds, mime_type | |
| consent_event_id | 업로드 확정 시점 유효 동의 |
| uploaded_at, expires_at (= uploaded_at + 90d) | NFR |
| deleted_at, deletion_reason (`retention_90d`, `caregiver_session_delete`, `full_data_delete`) | FR-21 — 값 목록 **RECOMMENDED** (동의 철회 값 없음 — C-4) |
| upload_failed_notice_sent_at | §13 48h 안내 |

#### recording_parts — R3
| id, recording_id, part_no, storage_bucket, storage_path, bytes, sha256, duration_seconds, upload_completed_at | UNIQUE(recording_id, part_no) |

#### sticker_awards — R2 (FR-19, §7.6)
| id, caregiver_id, child_id, session_id UNIQUE, sticker_type (`attendance`), awarded_at |
- Streak·"이번 주 세션 수"(§7.4 보조 요소)는 테이블이 아니라 **파생 조회**(view/API 계산) — 기술 요구사항, 중복 원천 방지. 기준(연속 일 = completed 세션 존재일, TZ 기준)은 contracts rule.
- 대화 전용 세션도 스티커 지급 대상인지 NEEDS DECISION (PRD는 "세션 완료 시" 로만 명시).

### 9. Reflection · Analysis (Stage 5)

#### session_reflections — R1 (FR-12, §7.6)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, session_id UNIQUE | |
| rating smallint 1..5 null | 별점 (PRD §7.6; Figma `91:693` 별점 5개 존재 — M-15) |
| checks jsonb | `{childReaction, emotionExpression, askedQuestions, focusDuration, difficulty}` — 값 목록은 contracts `ReflectionCheck*` enum (PRD 항목명만 존재, 선택지 NEEDS DECISION) |
| revisit_topics text[] | 다시 이야기하고 싶은 주제 |
| free_note text null | 자유 후기·메모 — 민감 텍스트, AI 전송 시 PII redaction |
| skipped bool | 선택 사항(30초) |
| submitted_at | |

#### analysis_jobs — R3 (FR-14)
| id, session_id, recording_id, pipeline_version, status (`queued`, `running`, `succeeded`, `failed`, `cancelled`), stage (`stt`, `quality_gate`, `redaction`, `metrics`, `signals`, `highlight`, `feedback`, `profile_update`), attempts, max_attempts, next_attempt_at, started_at, completed_at, error_code, UNIQUE(recording_id, pipeline_version) |
- 사용자 노출은 `storytime_sessions.status/analysis_outcome` 과 `short_feedbacks` 로만.

#### transcripts — R3 (Raw와 분리된 1차 파생, 민감)
| id, recording_id UNIQUE, session_id, caregiver_id, provider, model, language, redacted_text (PII 마스킹본), segments jsonb (speaker, start_ms, end_ms, redacted_text, confidence), quality_score, redaction_status (`pending`, `redacted`, `failed`), created_at |
- **원문(unredacted) 미저장** 권장 (RECOMMENDED — Redaction 실패 시 job 실패 처리). 사용자에게 전사 원문 화면은 PRD에 없음 → API 미노출.
- Retention: NFR "전사·지표는 유지". 전체 삭제 요청 시 삭제.

#### session_metrics — R2 (1 세션 1 행)
| session_id UNIQUE, caregiver_id, child_id, child_utterance_count, child_speech_seconds, caregiver_speech_seconds, turn_taking_count, emotion_word_count, emotion_words text[], new_words text[], recurring_topics text[], metrics_version, excluded bool |

#### observations — R2 (근거 발화 인용 후보, §7.7 "인상적인 발화 인용")
| id, session_id, caregiver_id, child_id, kind (`notable_quote`, `question_asked`, `topic_extension`, `sensitive_excluded`), text_redacted, start_ms, end_ms, capability null, safety_status |

#### capability_signals — R2
| id, session_id, caregiver_id, child_id, capability, signal_type (예 `emotion_labeling`, `perspective_shift`, `self_initiated_topic`, `sustained_curiosity` — §4 관찰 신호 기반), strength numeric, evidence_observation_id null, model_version |

#### highlight_clips — R2 (FR-18, §7.9)
| id, session_id, recording_id, caregiver_id, child_id, storage_path (R3 수준 비노출), start_ms, end_ms (10–15초), observation_id, selected_by (`auto`), expires_at (OAQ-13), deleted_at, deletion_reason |

#### short_feedbacks — R2 (FR-13)
| id, session_id UNIQUE, caregiver_id, text_template_id, rendered_text (슬롯 치환 후), safety_status (`passed`, `fallback_used`), delivered_push_at |

#### ai_generation_logs — R3 (rules/backend.md §4, ARCHITECTURE §12)
| id, operation (`persona`, `short_feedback`, `prompt_slot`, `report_narrative`), provider, model, input_tokens, output_tokens, latency_ms, estimated_cost_usd, safety_result, fallback_used, related_entity_type, related_entity_id, created_at |
- 프롬프트/응답 원문 미저장 (또는 마스킹본만, 보관 30일 — NEEDS DECISION).

#### notification_deliveries — R3 (FR-08, FR-13, FR-16, §13)
| id, caregiver_id, kind (`session_invite`, `short_feedback_ready`, `report_published`, `report_deferred_encourage`, `upload_failed_48h`, `report_delayed`), provider_message_id, scheduled_for, sent_at, status, payload_template_id |
- payload에 아이 이름 포함 여부는 Push Provider 결정(PLANNING §7 #6)·벤더 조건(법무 L-06)과 연동. 포함 시 `first_name` 만 (C-6).

### 10. Personalization (Stage 6)

#### recommendation_logs — R3 (FR-15, §8.3)
| id, child_id, activity_card_id, phase (cold, warm), inputs_summary jsonb (사용한 신호 키만: 스냅샷 id, reflection difficulty 등), rules_version, created_at |
- 목적: "이전 세션 데이터가 다음 추천에 반영됨"(Stage 6 완료 조건)을 검증 가능하게 함 — 기술 요구사항.

### 11. Reports (Stage 7)

#### report_cycles — R2 (FR-16, §7.7, §13 이월)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id | |
| cycle_no, period_start date, period_end date | 28일 주기 — **첫 세션 완료일부터 28일 단위 반복** (CONFIRMED (사용자 결정 2026-09-14, #17)). 대화 전용 세션의 시작일 포함 여부·시간대 경계는 Stage 7 Plan |
| recorded_seconds, recorded_session_count | eligibility 입력 스냅샷 (판정 시점 값). 집계 대상 = `mode='recorded'` AND `analysis_outcome <> 'excluded_low_quality'` 세션만. 기준: `recorded_session_count ≥ 3` AND `recorded_seconds ≥ 3600` (#17 — contracts `MIN_REPORT_RECORDED_SESSIONS`, `MIN_REPORT_RECORDED_SECONDS`) |
| eligibility | contracts `ReportEligibility` |
| status | `in_progress`, `generating`, `published`, `deferred`, `delayed` |
| deferred_to_cycle_id null | 이월 |
| evaluated_at, generation_attempts, next_attempt_at | §13 자동 재시도 3회 → 익일 |

#### reports — R2
| id, report_cycle_id UNIQUE, caregiver_id, child_id, published_at, viewed_first_at (리포트 열람률 KPI §2.3), narrative_template_version, safety_status, current_snapshot_id, previous_snapshot_id, current_persona_id |

#### report_snapshots — R2 (불변 집계 스냅샷)
리포트 발행 시점의 모든 표시 데이터를 **동결** 저장 — 이후 세션 녹음 삭제·재분석이 발행된 리포트 내용을 바꾸지 않게 함 (기술 요구사항, FR-16·FR-17 재현성).
| id, report_id, section (`capability_change`, `persona_history`, `dialogue_metrics`, `notable_quotes`, `parent_feedback_summary`, `highlight_clips`), payload jsonb (contracts `ReportSectionPayload` 버전), payload_version |
- 전체 데이터 삭제 시 함께 삭제. 세션 녹음 삭제 시 `notable_quotes`/`highlight_clips` 섹션에서 해당 항목 제거 여부 NEEDS DECISION (권장: 클립 참조 제거, 인용 텍스트는 파생 데이터로 유지).

#### report_pdfs — R2 (FR-17)
| id, report_id, storage_path (비노출), status (`queued`, `generating`, `ready`, `failed`), bytes, generated_at, renderer_version |
- 다운로드는 짧은 만료 signed URL. PDF는 아이 이름·인용을 포함하므로 private bucket.

### 12. Audit · Deletion · Retention (Backend Handoff 요구사항 — Frontend는 Stage 4 로컬 삭제 기반, Stage 8 삭제 요청 UX·로컬 정리만)

#### audit_logs — R3 (NFR 보안 "감사 로그", rules/backend.md §4 Audit Log)
| id, occurred_at, actor_type (`caregiver`, `worker`, `cron`, `admin`), actor_id null, action (`consent_granted`, `recording_uploaded`, `recording_deleted`, `retention_deleted`, `data_export`?, `full_deletion_started`, `full_deletion_completed`, `service_role_sensitive_read`), target_type, target_id, caregiver_id null, request_id, metadata jsonb (PII 금지) |
- 전체 삭제 후에도 audit 행은 유지하되 `caregiver_id` 는 **가명 해시**로 치환 (삭제 증빙 vs 최소 보관 균형 — 보관 기간 NEEDS DECISION(법무)).

#### data_deletion_requests — R1 insert/select (FR-21, §7.8)
| id, caregiver_id, scope (`session_recording`, `all_data`), session_id null, status (`received`, `processing`, `completed`, `failed`), requested_at, completed_at, error_code, idempotency_key |

#### 12.1 Retention 규칙

| 데이터 | 보관 | 방식 | 근거 |
|---|---|---|---|
| Raw audio (`recordings`/`recording_parts` + Storage) | 업로드 후 90일 | 일일 Cron: `expires_at < now()` 대상 → Storage API delete → `upload_status='expired'`, `deleted_at`, parts row 삭제 → audit `retention_deleted`. **SQL로 `storage.objects` 삭제 금지** | NFR, research §8 |
| Highlight clips | OAQ-13 (권장: 원본과 동일 90일) | 동일 Cron | FR-18 × NFR |
| Transcripts(redacted), metrics, observations, signals, reports | 계정 존속 기간 | 전체 삭제 요청 시 삭제 | NFR "전사·지표는 유지" |
| 로컬 기기 녹음 | 서버 업로드 확정 시 삭제 / 미업로드 상한 OAQ-11 | 앱 | rules §7 |
| ai_generation_logs | 권장 13개월(비용 분석) — NEEDS DECISION | Cron | 기술 요구사항 |
| consent_events | 계정 존속 + 법정 보관 기간 — NEEDS DECISION(법무) | | FR-02 |
| audit_logs | NEEDS DECISION(법무) | | NFR 보안 |
| Idempotency 레코드 | 24h | Cron | 기술 요구사항 |

Retention Job 멱등 조건: Storage delete가 404여도 성공 처리 후 메타데이터 갱신. Storage 삭제 실패 시 row 유지 + 재시도(메타데이터만 먼저 지우지 않음).

#### 12.2 삭제 Cascade 동작

**A. 세션 녹음 삭제 (FR-21 "세션별 녹음 삭제", §7.8)**
1. `data_deletion_requests(scope=session_recording)` 생성 (Idempotency-Key).
2. 진행 중 `analysis_jobs` → `cancelled`.
3. Storage: 해당 recording 전 part + highlight clips 삭제 (Storage API).
4. DB: `recording_parts` 삭제, `recordings.upload_status='deleted'`, `deletion_reason='caregiver_session_delete'`; `highlight_clips.deleted_at`.
5. 유지: `storytime_sessions`, `session_reflections`, `sticker_awards`, `transcripts`·`session_metrics`·`observations`·`capability_signals` (NFR "전사·지표는 유지" — 단 보호자가 "녹음 삭제"를 전사 삭제까지 기대할 수 있음 → UI 안내 문구·범위 NEEDS DECISION).
6. 분석 전이면 세션 종결 표현 — `skipped_audio_deleted` 후보, NEEDS DECISION (OAQ-17).
7. 클라이언트: 로컬 미업로드 파일 삭제, TanStack 캐시 invalidate.
8. audit `recording_deleted`.

**B. 전체 데이터 삭제 요청 (FR-21 "전체 삭제 요청", NFR "보호자 요청 시 즉시 삭제")**
1. `data_deletion_requests(scope=all_data)` → 즉시 신규 쓰기 차단(계정 상태 `deletion_pending`).
2. 모든 analysis/report/PDF job 취소, push device 해제.
3. Storage: `recordings`, `highlight-clips`, `report-pdfs` 의 `{caregiver_id}/` prefix 전체 삭제 (list → delete batch, 재시도).
4. DB hard delete (자식 → 부모 순): report_pdfs, report_snapshots, reports, report_cycles, recommendation_logs, short_feedbacks, highlight_clips, capability_signals, observations, session_metrics, transcripts, analysis_jobs, session_reflections, sticker_awards, recording_parts, recordings, session_prompts, session_events, storytime_sessions, activity_card_options, activity_cards, book_gift_requests(배송 운영 기록 보존 필요성 NEEDS DECISION), child_books, growth_capability_selections, personas, capability_scores, capability_snapshots, onboarding_responses, children, notification_deliveries, push_devices, notification_preferences.
5. 계정 처리: `consent_events`·`audit_logs` 는 법정 보관 결정(OAQ)에 따라 가명화 보관 또는 삭제; `caregiver_profiles` 및 `auth.users` 삭제 여부 — "탈퇴"(§7.8 계정)와 "아동 데이터 전체 삭제"가 같은지 **NEEDS DECISION** (권장: 아동 데이터 삭제는 계정 유지 가능, 탈퇴는 계정 포함 전체 삭제).
6. "즉시" 의 SLA(예: 요청 후 24h 내 완료, 백업 보관분 만료 기간 고지) NEEDS DECISION(법무) — Supabase 백업(PITR) 내 잔존 기간 고지 필요.
7. 완료 알림(이메일) 발송 여부 — PRD 미정.

FK 전략: 운영 안전을 위해 `ON DELETE CASCADE` 에만 의존하지 않고 삭제 서비스가 순서대로 삭제 + Storage 선삭제. DB FK는 `ON DELETE RESTRICT` 기본, 파생 테이블 일부만 CASCADE (Backend Developer 확정).

### 13. Trial / Anonymous Users (FR-24, P1)

**CONFIRMED (사용자 결정 2026-09-14, C-12) — 기기에만 저장하는 체험. 동의 전 서버 데이터 없음.**

| 항목 | 요구사항 |
|---|---|
| 서버 테이블 | **없음.** 가입 전 온보딩 응답은 서버에 저장하지 않는다 |
| 클라이언트 | 로컬 draft(`trialOnboardingDraft`)를 contracts `OnboardingDraftSchema` 로 저장 → 프로필 저장 시 가입 → 동의(C-2) → `POST /v1/onboarding/submit` 에 그대로 제출. 보관 상한·삭제 시점은 Stage 2 Plan |
| 전환 후 서버 | submit 요청으로 `children`, `onboarding_responses(status=submitted)`, `capability_snapshots`, `personas` 를 한 번에 생성 (필수 동의 확인 후) |
| 미채택 | 익명 계정(Anonymous Sign-in), `created_via='anonymous_trial'`, 익명 계정 정리 Cron, 다른 기기 이어하기 |

### 14. PRD §12.1 객체 ↔ 테이블 추적

| PRD 객체 | 테이블 |
|---|---|
| Caregiver | `auth.users`, `caregiver_profiles`, `consent_events`, `notification_preferences` |
| ChildProfile | `children`, `onboarding_responses`, `child_books`, `growth_capability_selections` |
| CapabilityScore | `capability_snapshots`, `capability_scores` |
| Persona | `personas` |
| Book | `books`, `child_books`, `book_gift_requests` |
| PromptCard | `prompt_sets`, `prompts` |
| ActivityCard | `activity_cards`, `activity_card_options` |
| Session | `storytime_sessions`, `session_events`, `session_prompts`, `recordings`, `recording_parts`, `transcripts`, `session_metrics`, `observations`, `capability_signals`, `session_reflections`, `highlight_clips`, `short_feedbacks`, `sticker_awards` |
| Report | `report_cycles`, `reports`, `report_snapshots`, `report_pdfs` |
| (기술 요구사항) | `analysis_jobs`, `ai_generation_logs`, `audit_logs`, `data_deletion_requests`, `notification_deliveries`, `push_devices`, `recommendation_logs`, `consent_documents`, `survey_instruments`, `survey_items` |
