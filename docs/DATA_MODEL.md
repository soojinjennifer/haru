# HARU Data Requirements (Draft for Backend Developer)

Status: DRAFT — Stage 0 산출물, 사용자 승인 대기 (Rev 4: cross-document critic 수정 — 참조 정정, 동의 철회 조건부, RECOMMENDED 라벨, 2026-09-14)
Based on: PRD v1.4 §12.1·§7·§10·§11·§13, `docs/ARCHITECTURE.md` (DRAFT Rev 3), `docs/API_CONTRACTS.md` (DRAFT Rev 3), `docs/FIGMA_SCREEN_MAP.md` (M-28, M-38), `docs/decisions/stage-0-technical-research.md`, `CLAUDE.md` Development Scope, `.claude/rules/backend.md` §2·§4
Author: plan-agent (2026-09-14)

> **이 문서는 Backend Developer를 위한 Data Requirement 초안이다. Migration 계획이 아니다.** (Frontend-only Scope — CONFIRMED, 사용자 지시 2026-09-14)
> - 이 프로젝트에서는 테이블·RLS·Storage·Retention Job을 **구현하지 않는다** (`.claude/rules/backend.md` §1). 컬럼 수준 스케치는 SQL migration으로 옮기지 않는다.
> - "필요 Frontend Stage" 는 해당 데이터가 **Contract·Mock으로 처음 필요한 Frontend Stage** 를 뜻한다. 실제 스키마는 Backend Developer가 이 문서와 `packages/contracts` 를 기준으로 설계한다.
> - Stage 8에서 이 초안을 `docs/DATA_REQUIREMENTS.md` (Handoff 문서)로 정리한다. RLS·보관·삭제 절차는 Handoff 요구사항이며, Frontend QA에서는 `BACKEND_INTEGRATION_PENDING` 으로 판정된다.
> - Frontend가 이 문서에서 직접 사용하는 것은 **엔티티 관계와 필드 의미**뿐이다 (contracts DTO 설계 근거). Frontend는 DB 타입을 import 하지 않는다.

---

## 1. 공통 규칙

| 규칙 | 내용 | 근거 |
|---|---|---|
| PK | `id uuid` (default gen_random_uuid) | 기술 요구사항 |
| 시간 | `timestamptz`, UTC 저장. `created_at`, `updated_at` 모든 테이블 | 기술 요구사항 |
| 소유권 컬럼 | family-owned 테이블은 모두 `caregiver_id uuid` 를 **비정규화 보유**(RLS 단순화·삭제 cascade 검증용), child 하위는 `child_id` 도 보유 | rules/architecture §9 |
| 삭제 | `deleted_at`(soft) — 사용자 노출 제외용. 전체 삭제 요청·Retention은 **hard delete** + audit. 원본 오디오는 soft delete 금지(Storage 객체까지 삭제) | NFR 프라이버시, rules/backend.md §4 (Raw Audio는 Storage API로 객체까지 삭제) |
| 만료 | Raw audio·클립: `expires_at` | NFR 90일 |
| 동의 참조 | 녹음·분석 관련 row는 `consent_event_id`(당시 유효한 아동 음성 동의) 참조 | FR-02, rules/backend.md §4 (서버 측 동의 강제·Consent History) |
| Enum | Postgres enum 대신 `text + CHECK` (contracts enum 변경 시 migration 부담 완화), 값은 contracts와 동일 | 기술 요구사항 |
| PII | 아이 이름은 `children.nickname` 한 곳. 파생 텍스트에는 이름 치환 토큰 사용 | NFR 최소 수집 |

## 2. Ownership · RLS 접근 방식

**Backend Handoff 요구사항** (`DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md`). Frontend는 RLS를 구현·테스트하지 않는다. 향후 Backend는 도메인 데이터를 API 경유로만 노출하고(ARCHITECTURE §6.1), RLS는 **2차 방어선**으로 둔다.

| 정책 유형 | 대상 | 정책 |
|---|---|---|
| **R1 Owner read/write** | 사용자가 API를 통해 생성·수정하는 family 데이터 (`children`, `onboarding_responses`, `child_books`, `session_reflections` …) | `authenticated`: `caregiver_id = auth.uid()` 인 행만 select/insert/update. delete는 API(service)만 |
| **R2 Owner read-only** | 서버·Worker가 생성하는 파생 데이터 (`capability_snapshots`, `personas`, `session_metrics`, `reports` …) | `authenticated`: 본인 행 select만. insert/update/delete 정책 없음(= 거부) |
| **R3 Server-only** | 민감 원문·운영 데이터 (`transcripts`, `analysis_jobs`, `ai_generation_logs`, `audit_logs`, `recording_parts`) | RLS enable + 정책 없음 → `anon`/`authenticated` 전면 거부, Service Role(Worker)만 접근 |
| **R4 Catalog read** | 운영 콘텐츠 (`books`, `prompts`, `consent_documents`, `survey_instruments`) | `authenticated`: select (active 행), 쓰기는 Service Role |
| **R5 Append-only** | `consent_events` | `authenticated`: 본인 insert + select, update/delete 정책 없음 |

- Helper: `auth_owns_child(child_id)` (security definer, `children.caregiver_id = auth.uid()`).
- Trial 익명 사용자(ARCHITECTURE §7.4 옵션 B 채택 시에만): `(auth.jwt()->>'is_anonymous')::boolean = false` 조건을 R1 insert 정책에 추가해 익명 계정의 아동 데이터 생성을 차단.
- Storage: bucket `recordings`, `highlight-clips`, `report-pdfs` 모두 private. 객체 경로 `{caregiver_id}/{child_id}/{session_id}/{recording_id}/part-{n}.{ext}` — 경로에 이름·이메일 금지. Storage RLS: 업로드는 서버가 발급한 signed upload token으로만, 읽기는 signed URL(짧은 만료)로만.
- Backend Developer 검증 요구사항 (이 프로젝트에서 실행하지 않음): 소유자 허용 / 비소유자 차단 / 익명 차단 / R3 전면 차단.

## 3. 관계 개요

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

## 4. 테이블 목록 (필요 Frontend Stage — Contract/Mock 기준)

| 필요 Frontend Stage (Contract/Mock) | 테이블 (Backend Handoff 요구사항) |
|---|---|
| 2 | `caregiver_profiles`, `consent_documents`, `consent_events`, `children`, `survey_instruments`, `survey_items`, `onboarding_responses`, `capability_snapshots`, `capability_scores`, `personas`, `growth_capability_selections`, `audit_logs`(기반) |
| 3 | `books`, `child_books`, `book_gift_requests`, `prompt_sets`, `prompts`, `activity_cards`, `activity_card_options`, `notification_preferences`, `push_devices` |
| 4 | `storytime_sessions`, `session_events`, `session_prompts`, `recordings`, `recording_parts`, `sticker_awards` |
| 5 | `session_reflections`, `analysis_jobs`, `transcripts`, `session_metrics`, `observations`, `capability_signals`, `highlight_clips`, `short_feedbacks`, `ai_generation_logs`, `notification_deliveries` |
| 6 | `recommendation_logs` (+ `capability_snapshots.source='session'`, `personas` 이력 활용) |
| 7 | `report_cycles`, `reports`, `report_snapshots`, `report_pdfs` |
| 8 | `data_deletion_requests` (Retention Job·전체 삭제 파이프라인은 Backend Handoff 요구사항, Frontend는 삭제 요청 UX·로컬 정리만) |

> Stage 4의 세션별 녹음 삭제(FR-21 일부)를 Stage 4에 둘지 Stage 8에 둘지는 PLANNING.md §4.1 FR-21 행 참조.

---

## 5. Identity · Consent (Stage 2)

### caregiver_profiles — R1 (update 본인), insert는 서버
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
| created_via | text CHECK (email, google, apple, anonymous_trial) | §12.1 인증 방식 |

### consent_documents — R4
| 컬럼 | 비고 |
|---|---|
| id, consent_type, version (text), locale, content_hash, url, effective_at, retired_at | 약관·방침·보호자 동의문의 버전 관리 |

### consent_events — R5 append-only
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid | |
| caregiver_id | uuid FK | |
| child_id | uuid null | 아동 대상 동의일 때 (가입 시점엔 child 미생성 → null 허용) |
| consent_type | text | contracts `ConsentType`: `terms_of_service`, `privacy_policy`, `child_voice_data`(필수, 별도), `marketing`(선택), `third_party_disclosure`(개정 COPPA — 법무 결정 시), `pilot_participation`(Figma 존재·PRD 없음 — 결정 시) |
| consent_document_id | uuid FK | 버전 참조 |
| action | text CHECK (granted) — `revoked` 값은 동의 철회 채택 시에만 (NEEDS DECISION, OAQ-08·COPPA 법무; PRD·Figma 근거 없음) | append-only 이력 (PRD §12.1 "동의 이력") |
| method | text | `checkbox` 또는 VPC 방식 코드 (NEEDS DECISION) |
| source | text CHECK (signup_email, signup_oauth, settings, reconsent) | |
| occurred_at | timestamptz | |
| ip_hash, user_agent_summary | text null | 증빙 최소화 (보관 기간 NEEDS DECISION) |

- "현재 유효 동의" = type별 최신 행이 `granted` 이고 문서 버전이 현행 필수 버전 이상 → view `current_consents`.
- 동의 철회는 PRD·Figma에 없다 → **NEEDS DECISION (OAQ-08, COPPA 법무)**. 채택 시 요구사항 후보: `child_voice_data` 철회 후 신규 녹음·업로드·분석 거부, 진행 중 job 취소, 기존 원본 삭제 여부(철회 = 삭제 요청으로 볼지).

## 6. Child · Onboarding · Profile (Stage 2)

### children — R1
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id (UNIQUE — MVP 1명, FR-27 P2 시 제거) | |
| nickname | 이름(닉네임, PRD §7.2). 유일한 아이 이름 저장 위치. Figma `179:1740` 의 성+이름 수집은 M-28 — 성(last name) 필드는 설계하지 않음 (NEEDS DECISION) |
| birth_year_month | `date`(일=1 고정) — 생년월만 (§7.2) |
| gender | text null — 선택 입력 (PRD §7.2). 값 목록 **NEEDS DECISION (M-38)**: 후보 girl, boy, other, prefer_not; 미선택 = null. Figma `Tag Color=Boy/Girl/Not selected` |
| language_environment | text[] 또는 jsonb | §7.2 Step 1 |
| reading_routine | jsonb | 가족 내 독서 루틴 |
| topic_tags | text[] | §7.2 Step 3 |
| growth_goals | text[] | §7.2 Step 4 |
| current_growth_capability | text (Capability) | FR-06 현재 값 (이력은 selections) |
| deleted_at | | |

### survey_instruments / survey_items — R4 (기술 요구사항, FR-03·OAQ-07)
PRD §7.2 Step 5(역량별 동일 문항 수·5점 리커트)와 Baseline Survey v1(10문항 빈도 척도, 2/3/2/3, "Haven't seen" 비채점)이 충돌하므로 **문항을 코드에 하드코딩하지 않고 버전 관리**한다.
| survey_instruments | id, code (`onboarding_v1`, `baseline_pilot_v1`), version, scale_type (`likert_5`, `frequency_5_with_na`), age_min_months, age_max_months, administration (`onboarding`, `exit`), active |
|---|---|
| survey_items | id, instrument_id, item_code (예 `ER1`), capability, order, prompt_text, reverse_scored bool, scored bool |

### onboarding_responses — R1 (FR-03 중도 저장·복귀)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, instrument_id | |
| step | text (child_info, temperament, books, goals, capability_items) |
| answers | jsonb — step별 contracts schema로 검증된 값. capability 문항은 `{item_code, value 1..5 \| null(na)}` |
| status | draft, submitted |
| administered_at_phase | onboarding, exit (Baseline T0/T1 채택 시) |
| submitted_at | |

### capability_snapshots — R2 / capability_scores — R2 (FR-04, FR-15, §12.1)
| capability_snapshots | id, caregiver_id, child_id, source (`onboarding_survey`, `session_analysis`, `report_cycle`), source_ref_id, scoring_version, created_at |
|---|---|
| capability_scores | id, snapshot_id, capability, score numeric(2,1) 1.0–5.0, evidence_summary_key (근거 설명 템플릿 키), item_count, missing_count |

- 스냅샷은 불변. 최신 = `created_at` 최대. 리포트 오버레이(§7.7)는 두 스냅샷 비교.

### personas — R2 (FR-05, FR-15)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, snapshot_id | |
| name, description | 영어 노출 문구 (슬롯 치환 전 템플릿 형태로 저장 권장 — 이름 토큰) |
| template_id, generation_mode (template_only, llm_slot, fallback_pool) | §8.4 |
| safety_status (passed, replaced_by_fallback) | |
| ai_generation_log_id null | |
| is_current bool | 페르소나 히스토리 = 전체 행 (§7.7) |

### growth_capability_selections — R1 insert / R2 제안 (FR-06)
| id, caregiver_id, child_id, capability, selected_by (`system_suggested`, `caregiver_changed`), snapshot_id null, created_at |

## 7. Books · Library · Prompts · Activity Cards (Stage 3)

### books — R4 (FR-22, §8.1)
| 컬럼 | 비고 |
|---|---|
| id, title, author, cover_image_path, age_min_months, age_max_months | §8.1 메타데이터 |
| topic_tags text[], difficulty, est_reading_minutes, purchase_url | |
| capability_relevance jsonb `{capability: 0..1}` | 4대 역량 관련도 스코어 |
| is_curated bool, is_giftable bool, active | 초기 20권 큐레이션 |

### child_books — R1 (FR-20, FR-22, FR-23, §8.1)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id | |
| book_id null | 카탈로그 책 |
| user_entered_title, user_entered_author null | DB에 없는 책 — 제목 텍스트 저장, 추천은 주제 태그만 (§7.2 규칙) |
| ownership | `owned`, `gifted`, `gift_pending`, `favorite_only` (온보딩 "좋아하는 책"은 보유와 다름) |
| source | `onboarding_favorite`, `onboarding_home_list`, `library_add`, `gift_program` |
| first_read_at, last_read_at, read_count | "읽은 책 히스토리" (FR-20) — sessions에서 파생 갱신 |
| CHECK | `book_id IS NOT NULL OR user_entered_title IS NOT NULL` |

> Figma `30:74` "My Saved", "Reading now · 3 of 5 nights", "Rated 4.5" 는 PRD에 없는 개념 → 컬럼 추가하지 않음, 불일치로 보고 (PLANNING.md §6).

### book_gift_requests — R1 (FR-22, §13 증정 책 미보유·배송 대기)
| id, caregiver_id, child_id, book_id, status (`requested`, `approved`, `shipped`, `delivered`, `cancelled`, `rejected`), shipping_address_ref, requested_at, status_updated_at |
- **배송지 주소는 아동 관련 PII와 결합되는 성인 PII** — 저장 위치(주소를 별도 테이블/외부 풀필먼트 시스템에 둘지)는 NEEDS DECISION(운영·법무). `shipping_address_ref` 는 참조만.

### prompt_sets / prompts — R4 (§8.2, FR-07)
| prompt_sets | id, book_id null(범용), capability, age_band (`3_4`, `5_6`, `7_9`), coaching_line, status (draft, expert_reviewed, active), reviewed_by, reviewed_at |
|---|---|
| prompts | id, prompt_set_id, kind (`question`, `follow_up`), text, order |
- 책별 최소 6개 (§8.2) — 운영 데이터 검증 쿼리로 확인.

### activity_cards — R2 (FR-07, §7.4, §12.1)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id | |
| card_date date (caregiver TZ 기준) | UNIQUE(child_id, card_date) |
| target_capability | 역량 순환 스케줄 (§8.3) |
| generated_at, generator_version, recommendation_phase (`cold`, `warm`) | §8.3 Cold ≤3 세션 / Warm ≥4 |
| selected_option_id null, adopted_session_id null | 추천 채택률 KPI (§2.3) |
| reading_context | contracts `ReadingContext` null, `custom_time` time null | FR-08 |

### activity_card_options — R2 (카드 덱 3장)
| id, activity_card_id, position (0=today, 1,2=alternative), book_id null, child_book_id null, option_kind (`book`, `reread_book`, `conversation_only`), reason_text, coaching_line, prompt_set_id null |
- `conversation_only`: §7.4 책 미보유, §13 추천 책 소진 대체 카드.
- 재독 시 새 Prompt 세트 (§8.3): 이전 `session_prompts` 와 겹치지 않는 prompt_set 선택 — 서비스 규칙.

### notification_preferences — R1 / push_devices — R1 (FR-08, §7.8)
| notification_preferences | caregiver_id PK, card_refresh_time time default 07:00, reminder_days smallint[], reminder_time time null, push_enabled, marketing_opt_in (consent_events 반영값 캐시) |
|---|---|
| push_devices | id, caregiver_id, platform (ios, android, web), provider_token (암호화 저장 권장), last_seen_at, revoked_at |

## 8. Storytime Sessions · Recording (Stage 4)

### storytime_sessions — R2 (쓰기는 API 전이만) (FR-09, §12.1, §12.2)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id, caregiver_id, child_id | uuid | |
| activity_card_id, activity_card_option_id | uuid null | 추천에서 시작한 경우 |
| book_id, child_book_id | uuid null | 대화 전용이면 둘 다 null 가능 |
| mode | text CHECK (recorded, conversation_only) | **RECOMMENDED** (ARCHITECTURE §10.1) — 승인 전 확정 아님 |
| status | text CHECK (ready, recording, paused, completed, analyzing, analyzed, failed, abandoned) | contracts `SessionStatus` — PRD §12.2 7개 값 CONFIRMED, `abandoned` **RECOMMENDED** |
| reading_context | text null | |
| ready_at, started_at, completed_at, abandoned_at | timestamptz | client `occurredAt` 기준 |
| completed_reason | text null (user_done, auto_timeout, recovered_after_crash) | **RECOMMENDED** |
| recorded_seconds | int default 0 | pause 제외 녹음 길이 — 리포트 eligibility 입력 |
| analysis_outcome | text null (full, excluded_low_quality, skipped_audio_deleted; `skipped_consent_revoked` 는 OAQ-08에서 동의 철회 채택 시에만) | **RECOMMENDED** (skipped 값 OAQ-17) |
| consent_event_id | uuid null | 녹음 시작 시점 유효 동의 |
| client_session_key | text UNIQUE | 오프라인 생성·재전송 멱등 키 |

### session_events — R2 (§12.1 "일시정지 이력", 감사)
| id, session_id, caregiver_id, from_status, to_status, occurred_at (client), received_at (server), idempotency_key UNIQUE, source (client, worker, sweeper) |

### session_prompts — R2
| id, session_id, prompt_set_id, shown_in (`activity_card`, `prompt_drawer`), first_shown_at |

### recordings — R2 (메타데이터만 노출, storage path는 비노출)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, session_id | |
| upload_status | `pending`, `uploaded`, `failed`, `deleted`, `expired` — **RECOMMENDED** (ARCHITECTURE §10.1 #4 별도 upload status, 승인 전 확정 아님) |
| part_count, total_bytes, duration_seconds, mime_type | |
| consent_event_id | 업로드 확정 시점 유효 동의 |
| uploaded_at, expires_at (= uploaded_at + 90d) | NFR |
| deleted_at, deletion_reason (`retention_90d`, `caregiver_session_delete`, `full_data_delete`; `consent_revoked` 는 OAQ-08 채택 시에만) | FR-21 — 값 목록 **RECOMMENDED** |
| upload_failed_notice_sent_at | §13 48h 안내 |

### recording_parts — R3
| id, recording_id, part_no, storage_bucket, storage_path, bytes, sha256, duration_seconds, upload_completed_at | UNIQUE(recording_id, part_no) |

### sticker_awards — R2 (FR-19, §7.6)
| id, caregiver_id, child_id, session_id UNIQUE, sticker_type (`attendance`), awarded_at |
- Streak·"이번 주 세션 수"(§7.4 보조 요소)는 테이블이 아니라 **파생 조회**(view/API 계산) — 기술 요구사항, 중복 원천 방지. 기준(연속 일 = completed 세션 존재일, TZ 기준)은 contracts rule.
- 대화 전용 세션도 스티커 지급 대상인지 NEEDS DECISION (PRD는 "세션 완료 시" 로만 명시).

## 9. Reflection · Analysis (Stage 5)

### session_reflections — R1 (FR-12, §7.6)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id, session_id UNIQUE | |
| rating smallint 1..5 null | 별점 (PRD §7.6; Figma `91:693` 별점 5개 존재 — M-15) |
| checks jsonb | `{childReaction, emotionExpression, askedQuestions, focusDuration, difficulty}` — 값 목록은 contracts `ReflectionCheck*` enum (PRD 항목명만 존재, 선택지 NEEDS DECISION) |
| revisit_topics text[] | 다시 이야기하고 싶은 주제 |
| free_note text null | 자유 후기·메모 — 민감 텍스트, AI 전송 시 PII redaction |
| skipped bool | 선택 사항(30초) |
| submitted_at | |

### analysis_jobs — R3 (FR-14)
| id, session_id, recording_id, pipeline_version, status (`queued`, `running`, `succeeded`, `failed`, `cancelled`), stage (`stt`, `quality_gate`, `redaction`, `metrics`, `signals`, `highlight`, `feedback`, `profile_update`), attempts, max_attempts, next_attempt_at, started_at, completed_at, error_code, UNIQUE(recording_id, pipeline_version) |
- 사용자 노출은 `storytime_sessions.status/analysis_outcome` 과 `short_feedbacks` 로만.

### transcripts — R3 (Raw와 분리된 1차 파생, 민감)
| id, recording_id UNIQUE, session_id, caregiver_id, provider, model, language, redacted_text (PII 마스킹본), segments jsonb (speaker, start_ms, end_ms, redacted_text, confidence), quality_score, redaction_status (`pending`, `redacted`, `failed`), created_at |
- **원문(unredacted) 미저장** 권장 (RECOMMENDED — Redaction 실패 시 job 실패 처리). 사용자에게 전사 원문 화면은 PRD에 없음 → API 미노출.
- Retention: NFR "전사·지표는 유지". 전체 삭제 요청 시 삭제.

### session_metrics — R2 (1 세션 1 행)
| session_id UNIQUE, caregiver_id, child_id, child_utterance_count, child_speech_seconds, caregiver_speech_seconds, turn_taking_count, emotion_word_count, emotion_words text[], new_words text[], recurring_topics text[], metrics_version, excluded bool |

### observations — R2 (근거 발화 인용 후보, §7.7 "인상적인 발화 인용")
| id, session_id, caregiver_id, child_id, kind (`notable_quote`, `question_asked`, `topic_extension`, `sensitive_excluded`), text_redacted, start_ms, end_ms, capability null, safety_status |

### capability_signals — R2
| id, session_id, caregiver_id, child_id, capability, signal_type (예 `emotion_labeling`, `perspective_shift`, `self_initiated_topic`, `sustained_curiosity` — §4 관찰 신호 기반), strength numeric, evidence_observation_id null, model_version |

### highlight_clips — R2 (FR-18, §7.9)
| id, session_id, recording_id, caregiver_id, child_id, storage_path (R3 수준 비노출), start_ms, end_ms (10–15초), observation_id, selected_by (`auto`), expires_at (OAQ-13), deleted_at, deletion_reason |

### short_feedbacks — R2 (FR-13)
| id, session_id UNIQUE, caregiver_id, text_template_id, rendered_text (슬롯 치환 후), safety_status (`passed`, `fallback_used`), delivered_push_at |

### ai_generation_logs — R3 (rules/backend.md §4, ARCHITECTURE §12)
| id, operation (`persona`, `short_feedback`, `prompt_slot`, `report_narrative`), provider, model, input_tokens, output_tokens, latency_ms, estimated_cost_usd, safety_result, fallback_used, related_entity_type, related_entity_id, created_at |
- 프롬프트/응답 원문 미저장 (또는 마스킹본만, 보관 30일 — NEEDS DECISION).

### notification_deliveries — R3 (FR-08, FR-13, FR-16, §13)
| id, caregiver_id, kind (`session_invite`, `short_feedback_ready`, `report_published`, `report_deferred_encourage`, `upload_failed_48h`, `report_delayed`), provider_message_id, scheduled_for, sent_at, status, payload_template_id |
- payload에 아이 이름 포함 여부는 결정 #6과 연동.

## 10. Personalization (Stage 6)

### recommendation_logs — R3 (FR-15, §8.3)
| id, child_id, activity_card_id, phase (cold, warm), inputs_summary jsonb (사용한 신호 키만: 스냅샷 id, reflection difficulty 등), rules_version, created_at |
- 목적: "이전 세션 데이터가 다음 추천에 반영됨"(Stage 6 완료 조건)을 검증 가능하게 함 — 기술 요구사항.

## 11. Reports (Stage 7)

### report_cycles — R2 (FR-16, §7.7, §13 이월)
| 컬럼 | 비고 |
|---|---|
| id, caregiver_id, child_id | |
| cycle_no, period_start date, period_end date | 4주. 기준일 OAQ-12 |
| recorded_seconds, recorded_session_count | eligibility 입력 스냅샷 (판정 시점 값) |
| eligibility | contracts `ReportEligibility` |
| status | `in_progress`, `generating`, `published`, `deferred`, `delayed` |
| deferred_to_cycle_id null | 이월 |
| evaluated_at, generation_attempts, next_attempt_at | §13 자동 재시도 3회 → 익일 |

### reports — R2
| id, report_cycle_id UNIQUE, caregiver_id, child_id, published_at, viewed_first_at (리포트 열람률 KPI §2.3), narrative_template_version, safety_status, current_snapshot_id, previous_snapshot_id, current_persona_id |

### report_snapshots — R2 (불변 집계 스냅샷)
리포트 발행 시점의 모든 표시 데이터를 **동결** 저장 — 이후 세션 녹음 삭제·재분석이 발행된 리포트 내용을 바꾸지 않게 함 (기술 요구사항, FR-16·FR-17 재현성).
| id, report_id, section (`capability_change`, `persona_history`, `dialogue_metrics`, `notable_quotes`, `parent_feedback_summary`, `highlight_clips`), payload jsonb (contracts `ReportSectionPayload` 버전), payload_version |
- 전체 데이터 삭제 시 함께 삭제. 세션 녹음 삭제 시 `notable_quotes`/`highlight_clips` 섹션에서 해당 항목 제거 여부 NEEDS DECISION (권장: 클립 참조 제거, 인용 텍스트는 파생 데이터로 유지).

### report_pdfs — R2 (FR-17)
| id, report_id, storage_path (비노출), status (`queued`, `generating`, `ready`, `failed`), bytes, generated_at, renderer_version |
- 다운로드는 짧은 만료 signed URL. PDF는 아이 이름·인용을 포함하므로 private bucket.

## 12. Audit · Deletion · Retention (Backend Handoff 요구사항 — Frontend는 Stage 4 로컬 삭제 기반, Stage 8 삭제 요청 UX·로컬 정리만)

### audit_logs — R3 (NFR 보안 "감사 로그", rules/backend.md §4 Audit Log)
| id, occurred_at, actor_type (`caregiver`, `worker`, `cron`, `admin`), actor_id null, action (`consent_granted`, `consent_revoked`(OAQ-08 채택 시), `recording_uploaded`, `recording_deleted`, `retention_deleted`, `data_export`?, `full_deletion_started`, `full_deletion_completed`, `service_role_sensitive_read`), target_type, target_id, caregiver_id null, request_id, metadata jsonb (PII 금지) |
- 전체 삭제 후에도 audit 행은 유지하되 `caregiver_id` 는 **가명 해시**로 치환 (삭제 증빙 vs 최소 보관 균형 — 보관 기간 NEEDS DECISION(법무)).

### data_deletion_requests — R1 insert/select (FR-21, §7.8)
| id, caregiver_id, scope (`session_recording`, `all_data`), session_id null, status (`received`, `processing`, `completed`, `failed`), requested_at, completed_at, error_code, idempotency_key |

### 12.1 Retention 규칙

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

### 12.2 삭제 Cascade 동작

**A. 세션 녹음 삭제 (FR-21 "세션별 녹음 삭제", §7.8)**
1. `data_deletion_requests(scope=session_recording)` 생성 (Idempotency-Key).
2. 진행 중 `analysis_jobs` → `cancelled`.
3. Storage: 해당 recording 전 part + highlight clips 삭제 (Storage API).
4. DB: `recording_parts` 삭제, `recordings.upload_status='deleted'`, `deletion_reason='caregiver_session_delete'`; `highlight_clips.deleted_at`.
5. 유지: `storytime_sessions`, `session_reflections`, `sticker_awards`, `transcripts`·`session_metrics`·`observations`·`capability_signals` (NFR "전사·지표는 유지" — 단 보호자가 "녹음 삭제"를 전사 삭제까지 기대할 수 있음 → UI 안내 문구·범위 NEEDS DECISION).
6. 분석 전이면 세션 `analysis_outcome='skipped_audio_deleted'` (OAQ-17).
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

## 13. Trial / Anonymous Users (FR-24, P1)

| 결정 #10 옵션 | 데이터 모델 영향 |
|---|---|
| **A. 로컬 전용 Trial (RECOMMENDED)** | 서버 테이블 없음. 클라이언트 로컬 draft(`trialOnboardingDraft`)는 contracts `OnboardingDraftSchema` 로 저장 → 가입·동의 후 `POST /v1/onboarding/submit` 에 그대로 제출. 기기 로컬 draft 보관 상한(예 7일) 후 삭제 |
| B. Supabase Anonymous | `caregiver_profiles.created_via='anonymous_trial'`, `is_anonymous` JWT로 RLS 제한, `linkIdentity` 후 동일 id 유지. 미전환 익명 계정 정리 Cron(예 30일) + 연결된 데이터 hard delete 필요. 동의 전 아동 데이터 저장 → 법무 승인 전제 |

## 14. PRD §12.1 객체 ↔ 테이블 추적

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

