# HARU Analysis Pipeline Requirements (Backend Handoff)

Status: **COMPLETE (development-agent `S8-J`, 2026-11-21)** — 원본 = `docs/plans/stage-8-plan.md` **부록 A** (plan-agent 초안 2026-11-20 — 파일 쓰기가 도구 가드에 막혀 Plan 에 보관됐다, Plan §21). `S8-J` 에서 본문을 완성했다(구현된 contracts · Mock 위치 · Frontend 표시 지점 반영). 이 파일도 development-agent 의 새 파일 쓰기가 같은 가드에 막혀 **Orchestrator 가 검토 후 저장소에 옮겼다** (`H8-10`, 사용자 지시 2026-11-21). 검증 = stage-qa-agent.

> **구현 계획이 아니다.** 이 저장소는 STT · AI · Worker · Job 을 만들지 않았다 (Frontend-only). Frontend 는 AI · STT Provider 를 호출하지 않으며, 분석은 **Async Analysis Contract(상태 · 결과 조회)** 로만 다룬다. 사용자에게 보이는 생성 문구는 **API 응답 값만 표시**하고 Frontend 가 만들거나 가공하지 않는다 (`.claude/rules/architecture.md` §8).
> 원칙 요약 (`.claude/rules/backend.md` §4): AI / STT 는 `AIProvider` · `SpeechToTextProvider` 어댑터 뒤에서만 호출 · 생성 문구 Safety Filter + 금지어 검증 + 검수 문구 fallback · `ai_generation_logs` · `analysis_jobs` 멱등 · 재시도 · 로그에 PII / Transcript 원문 금지.

## 0. Frontend 가 보는 표면 (Contract)

| 표면 | Endpoint | Contract (`packages/contracts`) | Frontend 소비 지점 | Mock |
|---|---|---|---|---|
| 세션 분석 상태 · 짧은 피드백 | `GET /v1/sessions/:sessionId/analysis` | `SessionAnalysisStatusSchema` = `{ sessionId, sessionStatus ∈ completed·analyzing·analyzed·failed, mode, outcome: AnalysisOutcome \| null (analyzed 일 때만), shortFeedback: { text \| null, templateId? } \| null }` (`analysis/status.ts`) | `entities/analysis/useSessionAnalysis.ts` → `features/session-feedback` (`/session/:sessionId/feedback`) | `mocks/analysis/MockAnalysisApi.ts` · `analysisScenarios.ts` (group `analysis`) |
| 세션 상태 전이 (`analyzing → analyzed/failed`) | `GET /v1/sessions/:sessionId` | `SessionDetailSchema` (`sessions/`) | `entities/session/useSessionDetail.ts` · 완료 화면 | `mocks/sessions/MockSessionApi.ts` |
| 완료 버블 · 시작/리마인드 버블 | `POST /v1/sessions` · `POST …/transitions` · `GET /v1/sessions/:id` | `SessionSummary.bubble` · `reminderBubble` · `SessionDetail.completionBubble` (`sessions/session.ts`) | `features/storytime-session` · 완료 화면 | `mocks/sessions/sessionFixtureScenarios.ts` (groups `session-greeting` · `session-completion`) |
| 페르소나 · 역량 스코어 | `POST /v1/onboarding/submit` · `GET /v1/children/:id/profile` | `ProfileResultSchema` · `ChildProfileSchema` · `rules/capability-score.ts` | `/onboarding/profile` · `/settings/profile` | `mocks/onboarding/` · `mocks/children/` (groups `onboarding` · `children`) |
| 추천 카드 · Prompt · 추천 이유 | `GET …/activity-cards/today` · `GET /v1/books/:bookId/prompts` | `ActivityCardSchema` · `BookPromptsResponseSchema` | Home 덱 · 책 상세 시트 | `mocks/activities/` · `mocks/books/` |
| Home 문구 | `GET …/home` | `HomeSummary.characterLine` · `lastHighlightLine` | Home | `mocks/home/` |
| 주간 Progress | `GET …/progress/weekly` | `WeeklyProgressSchema` (`progress/`) | `/progress` | `mocks/progress/` |
| 4주 리포트 · 클립 · PDF | `GET …/reports/overview` · `GET /v1/reports/:id` · clip playback · PDF | `ReportOverview` · `ReportDetail` · `SignedMediaUrl` · `ReportPdfStatus` (`reports/` · `highlight-clips/`) | `/progress` · `/progress/reports/:reportId` | `mocks/reports/` · `mocks/highlight-clips/` (groups `reports` · `report-pdf` · `highlight-clips`) |

Frontend 동작 요약: 분석 상태는 피드백 화면에서 폴링하고(`analysis-pending-then-completed` 로 재현), `failed` 는 "조금 더 걸린다" 로 안내하며(영구 실패 표현 없음 — P5-BIP-12), `excluded_low_quality` 는 저품질 안내 · `shortFeedback.text = null` 은 문구 미렌더(`analysis-feedback-missing`).

## 1. 파이프라인

```
Audio (recordings) → STT → PII Redaction → Metrics Extraction → Capability Signal Analysis
→ Safety Validation → Structured Result → Short Feedback / Highlight Clip / Profile Update / Report
```

| 단계 | 요구 | ID |
|---|---|---|
| Job | `analysis_jobs` 멱등 · 재시도 · **업로드 확정(`complete`) 시 생성** — 세션 `completed → analyzing` | P4-BIP-12 · P4-BIP-07 · P5-BIP-06 |
| 입력 | 연속 녹음 구간 part(1개가 정상, 최대 20) · non-seekable WebM 가능 — `duration` 메타 신뢰 금지 · `mimeType` 은 base type 으로 판정 | RU-1 · RU-2 · RU-3 |
| 입력 이상 | 크래시 복구 part 중 디코드 실패 part 도 업로드된다 — 재생 불가 part 를 건너뛰고 나머지로 분석 · 복구 길이는 추정치(허용 오차) | RU-17 · RU-15 |
| STT | `SpeechToTextProvider` 어댑터 뒤 · 벤더 아동 데이터 조건(ZDR · DPA) — 법무 L-06 | P5-BIP-06 |
| PII | Transcript · 회고 `note` 는 AI 입력 전 redaction · 아이 이름 = 치환 토큰 · 로그 원문 금지 | P5-BIP-05 |
| 품질 | 저품질 → `analyzed` + `outcome='excluded_low_quality'` (정량 분석 · 리포트 집계 제외, 세션 기록 · 피드백 보존) | P5-BIP-07 |
| 민감 발화 | 세그먼트 분석 제외 · 전사 마스킹 · 피드백 중립 · **세션 단위 신규 outcome 없음** (`AnalysisOutcome` = `full` · `excluded_low_quality` 2값 유지) | P5-BIP-08 |
| SLA | 세션 분석 ≤ 24h | P5-BIP-11 |
| 실패 | `failed → analyzing` 재시도 정책(서버 소유) · 영구 실패 표현은 contract 에 없다(`failed` 유지 — Frontend 는 "조금 더 걸린다") | P5-BIP-12 |
| 대화 전용 | `mode='conversation_only'` → 분석 요청 · 조회 = `ANALYSIS_NOT_AVAILABLE` (404) | P4-BIP-16 · P5-BIP-13 |
| 녹음 미수신 | 로컬 14일 삭제(`D4-29`)로 녹음이 끝내 오지 않는 `completed` 세션 — 서버가 일정 기간 후 녹음 `expired` · 분석 종결 (Frontend 판별 = `completed` + 녹음 `deleted`/`expired`). 종결 표현은 **`OAQ-17` 미결** — enum 추가 0 | P5-BIP-16 · RU-16 |
| 세션 녹음 삭제 | 진행 중 `analysis_jobs` 취소 · 전사 · 지표 · 관찰은 유지(`N8-03` ⓐ) · 분석 전 삭제의 종결 표현 = `OAQ-17` | P8-BIP-01 · C8-7 |
| 전체 삭제 · 탈퇴 | 모든 analysis / report / PDF job 취소 후 파생 데이터 hard delete (`DATA_REQUIREMENTS.md` §5.3-B) | P8-BIP-02 · P8-BIP-03 |
| 동의 | 분석 요청 시 서버 측 `child_voice_data` 동의 확인 · 녹음 row 의 `consent_event_id` 고정 | P4-BIP-02 · P5-BIP-15 |

## 2. 산출물별 요구

| 산출물 | 요구 | Contract 필드 | ID |
|---|---|---|---|
| 짧은 피드백 | 검수 템플릿 + 안전 슬롯 + 금지어 · 안전 필터 이중 검증 + fallback · 1~2줄 · 진단 · 비교 금지 · 없으면 `text: null` · `ai_generation_logs` | `ShortFeedback.text` · `templateId?` | P5-BIP-09 |
| 피드백 알림 | `short_feedback_ready` push · payload = `sessionId` 만 · 도착 URL `/session/:sessionId/feedback` | `NotificationKind` | P5-BIP-10 |
| 하이라이트 클립 | 10~15초 추출 · private Storage · 만료(`OAQ-13`) · signed URL · CORS(`P8-BIP-06`) · 세션 녹음 삭제 시 함께 삭제 → 재생 = `RECORDING_DELETED{reason}` | `HighlightClipSummary` · `SignedMediaUrl` | P5-BIP-14 · P7-BIP-10 |
| 역량 스코어 (온보딩) | `packages/contracts/src/rules/capability-score.ts` `scoreCapabilities` **그대로 재사용** (응답 평균 1.0–5.0, `not_observed` 결측 제외, 전부 결측이면 `score: null`) | `CapabilityScores` | P2-BIP-07 · P2-BIP-09 |
| 페르소나 | 템플릿 + LLM 슬롯 · 금지어 · fallback pool · 3초 · 실패 시 **fallback 으로 200** (`isFallback: true`) · 재생성 트리거 · 빈도 | `Persona` (`isFallback`) | P2-BIP-08 · P6-BIP-02 |
| 프로필 갱신 | 세션 누적 → 스냅샷 갱신 규칙(**전문가 결정 대기**) · `GET /profile` 이 온보딩 제출 직후에도 완성 · 갱신 시각 `profileUpdatedAt` · 갱신 사실을 `characterLine` 에 반영 가능 | `ChildProfile.profileUpdatedAt` | P6-BIP-01 · P6-BIP-11 · P6-BIP-12 |
| 추천 | cold(~3세션) → warm(4회~) · `recommendation_logs` · 회고 신호(`tricky_today` → 난이도 하향 · `note` 주제) · 역량 순환 · 같은 주제 연속 3일 지양 · 재추천 새 Prompt 세트 · cold-start state vector · `owned_books` 후보 제외 · `depends_on_the_day` · `not_sure_yet` 처리 · 발전 역량 반영 · **항상 책이 있는 카드**(없으면 재독 카드) | `ActivityCardOption.capability` · `reason` | P3-BIP-02 · P5-BIP-03 · P6-BIP-03~06 · P6-BIP-10 · P2-BIP-13(R) · 14(R) · 15(R) · HX-3-05 |
| Prompt | 라이브러리 · 감수 · `phase`(pre/post) 판정 · `pageRef` 책별 페이지 앵커(콘텐츠 제작 범위) · 제시 개수 = 서버 정책 · 카탈로그 외 책은 세트 없음 | `Prompt.phase` · `pageRef` · `coachingNote` | P3-BIP-03 · 13 · 14 · 23 |
| 추천 이유 | `BookPromptsResponse.reason` · 카드 `reason` — 1~2문장 · 진단 금지 · 없으면 `null` · 길이 상한은 contract 에 없음(화면이 흡수) | `reason` | P3-BIP-26 |
| 리포트 | 28일 주기 · 자정 경계 · eligibility(**3세션 + 3600초**, 저품질 제외 — `rules/report-eligibility.ts`, #17) · 미충족 이월 + 독려 push · 생성 재시도 3회 → 익일 · `delayed` · narrative · 근거 · 페르소나 히스토리(`trigger` 동결) · 부모 피드백 요약 · 발행 불변(`report_snapshots`) | `ReportOverview` · `ReportDetail` | P7-BIP-02~08 · 15 · 16 · P5-BIP-04 |
| 주간 Progress | 주 경계(보호자 TZ 월~일) · Home `sessionsThisWeek` 와 같은 창 · `availableWeeks` 연속 범위 | `WeeklyProgress` | P7-BIP-01 · HX-3-02 |
| Growth · Moment | stage · level 산식(서열 · 결핍 표현 아님) · Moment 선정 · 마스킹 · 안전 통과 문장만 | `GrowthTheme` · `MomentOfWeek` | P7-BIP-02 · 03 |

## 3. 콘텐츠 안전 · 아이 이름

- 버블 = 검수 템플릿 + 안전 슬롯만 (자유 생성 · TTS 금지). 분석 · 페르소나 · 리포트 문구 = 금지어 + 안전 필터 이중 검증. 진단 · 판정 · 비교 금지 (PRD §8.4). 모든 생성은 `ai_generation_logs` (R3, PII 금지).
- 서버가 새로 만드는 문장(완료 버블 · `characterLine` · 리포트 발행 알림)은 **생성 시점의 현재 아이 이름** — 발행 리포트 스냅샷은 동결 (`P7-BIP-14` · `N7-16` · Stage 6 `QA-6-001` 의 서버 측 메모). AI 입력에는 이름 치환 토큰.
- 사용자 노출 언어는 영어. 관찰 · 신호 · 성장 힌트 언어만.

## 4. 서버 생성 문구 — Frontend 표시 제약

Frontend 는 아래 필드를 **가공하지 않고** 표시한다. 응답 schema 에 길이 제약을 걸지 않는 이유: 응답에 `.max()` 를 걸면 초과 시 parse 실패로 화면 전체가 비게 된다 — UI 가 말줄임으로 흡수한다 (`API_CONTRACTS.md` §3.8).

| 문구 | 제약 (생성 가이드) | Frontend 흡수 방식 | 근거 |
|---|---|---|---|
| 세션 시작 인사 `bubble` | 1줄 · ≤240px @ SF Pro Semibold 16 (≈28자) · 이름을 문장 끝에 두지 않기 · 없으면 `null` | 1줄 말줄임 · `null` 이면 미렌더 | P4-BIP-11 · `D4-21` · `D4-22` |
| `reminderBubble` | `bubble` 과 같은 길이 요구 · `POST /v1/sessions` 와 세션 조회 응답 모두에 키(nullable) | 같은 규칙 | P4-BIP-11 확장 · `D4-59` |
| 완료 버블 · `subtext` | 사실 일치(대화 전용 / 스티커 미지급이 *sticker earned* 를 말하지 않음) · 대화 전용은 녹음 · 녹음 시간 언급 금지 · `min` 표기 규칙 · streak 0 · 세션 단위 보존(`SessionDetail` 동일 값) | 보조 줄 말줄임 (`D4-147`) | P4B-BIP-02 · 03 · 05 · `D4-109` |
| 출석 스티커 문구 | streak · `Day N` 금지 · 서버 제공 | 그대로 | P4-BIP-18 |
| `characterLine` | **약 120자 이내**(가이드 — 4줄 상한) | 4줄 말줄임 | `W-5` · HX-3-03 |
| `lastHighlightLine` | 안전 필터 통과 · 없으면 `null` | 미렌더 | HX-3-01 |
| `reason` (카드 · 책 상세) | 1~2문장 · 진단 금지 · 없으면 `null` | 줄 생략 | P3-BIP-26 |
| 짧은 피드백 | 1~2줄 · 없으면 `text: null` | 미렌더 | P5-BIP-09 |
| 페르소나 description | 110~220자 권장 (Stage 6 Spec §3.3 — fallback 은 Stage 2 문구 94자) | 그대로 | P2-BIP-08 · P6-BIP-02 |
| 리포트 `summaryLine` · narrative · Moment | 안전 필터 통과 문장만 · 발행 시 동결 | 그대로 | P7-BIP-03 · 06 · 07 |

## 5. Mock 위치 (재현 key — 정본 `API_CONTRACTS.md` §5.4)

| 그룹 | 파일 | 분석 관련 key |
|---|---|---|
| `analysis` | `apps/web/src/mocks/analysis/MockAnalysisApi.ts` · `analysisScenarios.ts` · fixture `mocks/fixtures/analysis.ts` | `analysis-pending` · `analysis-completed` · `analysis-failed` · `analysis-low-quality` · `analysis-not-available` · `recording-deleted` · `analysis-pending-then-completed` · `analysis-feedback-missing` (+ 공통 5) |
| `session-greeting` · `session-completion` | `mocks/sessions/sessionFixtureScenarios.ts` | `greeting-missing` · `greeting-empty` · `greeting-tight` · `greeting-long` · `reminder-missing` · `subtext-missing` · `bubble-missing` · `reflection-submitted` |
| `onboarding` · `children` | `mocks/onboarding/MockOnboardingApi.ts` · `mocks/children/MockChildrenApi.ts` · `childProfileRecords.ts` | `persona-fallback` · `capability-all-missing` · `profile-updated` · `persona-changed` · `all-scores-missing` · `scores-partially-missing` |
| `activity-cards` | `mocks/activities/MockActivityApi.ts` | `cold-to-warm` · `difficulty-lowered` · `reread-option` · `books-exhausted` |
| `reports` · `report-pdf` · `highlight-clips` | `mocks/reports/*` · `mocks/highlight-clips/*` | `report-eligible` · `report-not-eligible` · `report-deferred` · `report-deferred-first` · `report-delayed` · `report-published-unviewed` · `report-persona-unchanged` · `report-no-previous` · `pdf-generating` · `pdf-failed` · `pdf-timeout` · `clip-expired` · `clip-url-expired` |

Mock 은 서버 규칙을 **흉내만** 낸다 (예: 프로필 갱신 = 고정 점수표 `session_analysis`, warm 전환 = 완료 세션 4회, 회고 반영 = 직전 세션 즉시). 실제 규칙은 위 표의 ID 로 Backend 가 결정한다.

## 6. 결정 대기

| ID | 내용 | 결정 주체 |
|---|---|---|
| `OAQ-13` | 하이라이트 클립 보관 기간 (권장: 원본과 같은 90일) | 법무 |
| `OAQ-17` | 녹음 미수신 · 분석 전 녹음 삭제 세션의 분석 종결 표현 (`skipped_audio_deleted` 후보 — enum 추가 0) | 제품 |
| P6-BIP-01 | 세션 누적 → 스냅샷 갱신 규칙 (주기 · 가중 · 최소 근거 세션 수 · 설문 대비 비중) | 전문가 |
| P6-BIP-04 | 회고 → 추천 반영 시점 (다음 날 07:00 vs 즉시) | 제품 |
| P7-BIP-04 | 주기 · eligibility · `cycle_in_progress` 결합 해석 | 제품 |
| L-06 | STT · AI · Push 벤더 아동 데이터 조건 (ZDR · DPA) | 법무 |
| `ai_generation_logs` 보관 | 권장 13개월 | 법무 · 운영 |
