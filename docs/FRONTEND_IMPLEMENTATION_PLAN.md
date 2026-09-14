# HARU Frontend Implementation Plan (Design → Build Order)

Status: DRAFT v2 — Stage 0 산출물 (critic 리뷰 반영 + Frontend-only 정렬, 2026-09-14), 사용자 승인 대기
Based on: `docs/FIGMA_SCREEN_MAP.md`, `docs/COMPONENT_MAP.md`, `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_TOKEN_MAP.md` (2026-09-14), `PLANNING.md` §5, `docs/ARCHITECTURE.md` §2, `docs/API_CONTRACTS.md` §4–§5; Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `CLAUDE.md`, `.claude/rules/frontend.md` §1·§5, `.claude/rules/qa.md`
Author: design-agent (2026-09-14)

라벨: `CONFIRMED` / `RECOMMENDED` / `NEEDS DECISION`

## 0. 전제와 사용법

- **Frontend-only — CONFIRMED (사용자, 2026-09-14)**: `UI/Feature → Query/Mutation → API client interface → Mock Adapter` (Http Adapter 는 Backend 연동 시점). 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 등 **interface + Mock Adapter** 로만 구현하고 Supabase JS 를 직접 사용하지 않는다 (rules/frontend §1). Mock fixture 는 `apps/web/src/mocks/` 에만 둔다 (UI 하드코딩 금지, rules/frontend §5).
- 이 문서가 **Stage 번호의 단일 기준**이다. COMPONENT_MAP 의 Stage 열은 이 문서를 따른다.

| Stage | 제목 (사용자 확정 Frontend-only) |
|---|---|
| 0 | Frontend Architecture + Figma Mapping + Agent Setup + Design System + API Contract Planning |
| 1 | Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure |
| 2 | Auth + Consent + Onboarding + Child Profile |
| 3 | Home + Activity Card + Library + Book Selection + Recommendation |
| 4 | Storytime Session + Recording Client + Pause/Resume + Prompt Drawer + Local Recording + Upload UX |
| 5 | Reflection + Async Analysis Status + Short Feedback |
| 6 | Personalization + Profile Update + Recommendation Loop |
| 7 | 4-Week Report + History + Highlight Audio + PDF UX |
| 8 | Frontend Final QA + Accessibility + Responsive + Regression + Backend Handoff Package → **STOP** |

Stage 0 = 이 문서를 포함한 design-agent 5종 + plan-agent 문서 (구현 없음).
- 이 문서는 **디자인 관점의 빌드 순서·Mock 상태·디자인 차단 요인·Visual QA 기준**만 정한다. Stage 범위·AC 는 plan-agent 의 `docs/plans/stage-N-plan.md` 가 우선한다.
- 각 Stage 착수 시 design-agent 가 `docs/design/stage-N-design-spec.md` 를 작성한다 (design-agent 규칙 §7).
- **Mock scenario key 의 단일 기준은 `docs/API_CONTRACTS.md` §5.4 Scenario Key Catalogue** 다. 이 문서의 표는 §5.4 machine key 만 쓰고, rules/frontend §5 표시명은 key 옆에 병기한다: SUCCESS=`success`, LOADING=`loading`, EMPTY=`empty`, ERROR=`error`, RETRY=`retry`, recording upload success=`recording-upload-success`, recording upload failure=`recording-upload-failure`, analysis pending=`analysis-pending`, analysis completed=`analysis-completed`, analysis failed=`analysis-failed`, report eligible=`report-eligible`, report not eligible=`report-not-eligible`. 표 열 제목(SUCCESS · LOADING · EMPTY · ERROR / RETRY)은 표시명이다. Deprecated alias(default, slow, upload-failure …)는 사용하지 않는다. §5.4 에 전용 key 가 없는 경우는 `error` + error code 지정(예: `RECORDING_NOT_ALLOWED_FOR_MODE`), replay test, 또는 OAQ 결정 항목으로 표시한다.
- 실제 Backend 가 있어야만 검증되는 부분(실 인증 Provider, 서버 동의 강제, Storage 업로드 수신, STT/AI 분석 결과, 카드 생성 Job, push 발송, PDF 생성, 삭제 cascade 등)은 **`BACKEND_INTEGRATION_PENDING`** 으로 기록한다. 이는 **디자인 차단 요인이 아니며** Stage 8 Backend Handoff Package 에 1:1 로 넘긴다 (rules/qa).
- **Visual QA** = `get_screenshot` 결과(Figma node) ↔ 구현 스크린샷 비교, 393×852 viewport, 폰트 결정(D-1)에 따른 허용 오차 적용. Figma placeholder 데이터 불일치(M-36)는 비교 대상에서 제외. **구현 스크린샷 캡처·비교에는 승인된 브라우저/E2E 도구가 필요하다 — 도구 승인 전 모든 Visual QA checkpoint 는 `NOT VERIFIED` 로 기록한다** (rules/qa).
- 공통 금지: Figma 에 없는 화면을 임의 디자인하지 않는다. 누락 화면은 **디자인 확보 → stage design spec 승인 → 구현** 순서.

---

## Stage 1 — Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure

### 1.1 Tokens (`packages/design-tokens`)
1. Primitive: palette 12 (+ violet 결정), ink/mist/dusk/paper, white alpha 3단계, ink alpha 3단계 (TOKEN_MAP §2)
2. Semantic color (§2.6) — **D-2 대비 결정 반영 후**
3. Typography: text style 11종 + weight 5종 + family (D-1)
4. Spacing scale, layout gutter, touch min, icon sizes
5. Radius 6단계, shadow 5종 + highlight, material fill/blur/fallback
6. 신규: focus ring, status colors, scrim, opacity-disabled, z-index, motion duration/easing, breakpoints(`md`, `lg`), app max width, safe-area
7. Tailwind preset: semantic 만 노출, arbitrary value lint 금지

### 1.2 Shared UI 빌드 우선순위 (`packages/ui`)

| 순위 | Component | 이유 (다음 Stage 의존) | Figma 기준 node |
|---|---|---|---|
| 1 | **Text** + font stack | 모든 컴포넌트 기반 | `17:298` |
| 2 | **Icon** (Figma export 세트 + 누락 아이콘 placeholder 규칙) | 버튼·탭·헤더 | `50:157` |
| 3 | **Surface** (material rest/raised/pressed, fill glass/strong, fallback) + **AppBackground** | 모든 카드·버튼의 재질 | `17:332`, `16:24` |
| 4 | **Button** (glass/accent × md/lg × rest/hover/pressed/disabled/**focus**/**loading**) + ButtonGroup | 모든 화면 CTA | `17:20`, `86:245`, `86:372` |
| 5 | **IconButton** (44 hit area) | 헤더 | `78:158` |
| 6 | **TopBar** (large/inline/centered/pill) | 모든 Stack·Fullscreen 화면 | `139:2734`, `179:1726–1778`, `29:75` |
| 7 | **Layouts**: `TabLayout`, `FullscreenLayout`, `StackLayout`, 앱 컬럼 컨테이너(safe area) | Router | 화면 frame 구조 |
| 8 | **BottomTabBar** (items config 주입 — D-6 전 구조 고정 금지) | TabLayout | `25:87`, `140:2971` |
| 9 | **Spinner / Skeleton** | Loading 상태 (전 Stage) | Figma 누락 → spec 기반 |
| 10 | **ErrorState** (+Retry), **EmptyState** | Error/Empty 상태 (전 Stage) | Figma 누락 |
| 11 | **InlineAlert / Banner** (tone 5종 incl. offline) | 동의·오프라인·업로드 | Figma 누락 |
| 12 | **Toast** | 저장·재시도 피드백 | Figma 누락 |
| 13 | **TextField + FieldGroup** (label, trailing action/accessory, helper, **error**, disabled) | Stage 2 Auth | `76:417` |
| 14 | **Checkbox / CheckboxGroup** (checked/unchecked/error/focus) | Stage 2 동의 | `179:1742` |
| 15 | **Tag** (tone, size sm/xs) | 배지·Pagetag | `76:440`, `139:2410–2412` |
| 16 | **Chip** (selected, filled/outline/glass) | 회고·Context·온보딩 Step | `90:626`, `40:316` |
| 17 | **RadioGroup** (card) | 설문 | `179:1788` |
| 18 | **ProgressBar** | 온보딩 진행 | `179:1779/1780` |
| 19 | **PageIndicator** | 덱·캐러셀 | `88:789` |
| 20 | **SpeechBubble** (tail top/bottom-right) | CharacterBubble (S2–S4) | `88:721` |
| 21 | **Sheet + Scrim** | S3 서재 시트, S4 Drawer (S1 에서 만들면 S2 동의 문서 보기에도 사용) | `163:1807`, `88:960` |
| 22 | **Dialog / ConfirmDialog** | **S1 구현** — 사용처: S4 녹음 폐기·S8 삭제 | Figma 누락 |

S2 이후로 미룸 (RECOMMENDED): SwipeDeck(S2), SelectTrigger(S2), InfoRow·DividerWithLabel·TextLink 변형(S2), ListGroup/ListRow·SectionHeader·Carousel·Toggle(S3), TextArea·StarRating(S5), StatTile(S7).

### 1.3 Mock / Dev 기반
- API client interface + Mock Adapter + scenario switch (dev 전용, 방식은 Stage 1 Plan) — plan-agent 소관. `AuthGateway`·`recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 도 interface + Mock Adapter 골격. 디자인 요구: scenario 전환(`loading` · `empty` · `error` · `retry` · `offline`)으로 상태 컴포넌트를 실제 화면 컨텍스트에서 결정적으로 재현 가능해야 함.
- Shared UI 확인용 **dev 전용 UI gallery route** (Production tree-shake) — Storybook 은 Stack 외 → 도입 여부 NEEDS DECISION.

### 1.4 Mock scenarios (Stage 1)
| 대상 | Scenarios |
|---|---|
| `GET /v1/health` | `success`, `loading`, `error`, `retry`, `offline` |
| 공통 상태 컴포넌트 데모 | `loading`(Skeleton), `empty`, `error`, `retry`(실패 후 성공), `offline`(Banner) |

### 1.5 Design blockers (Stage 1 착수 전)

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 없음 (health 포함 전부 Mock).

디자인 차단 요인:
D-1 폰트, D-2 대비, D-3 토큰 정규화, D-4 신규 토큰 값, D-5 breakpoint·최대폭, D-6 내비게이션(TabBar 는 config 로 우회 가능하나 Layout 확정에 필요), D-7 아이콘 소스, D-8 Dark mode, D-10 공통 상태 패턴 디자인 방식 (DESIGN_SYSTEM §14).

### 1.6 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
| Figma node | 비교 대상 | 비고 |
|---|---|---|
| `17:20` Button 8 variants | Button gallery | 대비 조정 결정분은 "의도된 차이"로 기록 |
| `17:332` / `16:24` HARU Material | Surface 3 material | blur·그림자 레이어 |
| `25:87` Screen/Tab Bar 3 variants | BottomTabBar | D-6 결정 반영 |
| `76:440` Tag, `90:626` Select, `40:316` Button/Filter | Tag, Chip | |
| `76:417` Input 4 variants | FieldGroup + TextField | |
| `88:721` Bubble (꼬리·radius·fill 만) | SpeechBubble | 문구 제외 |
| `88:789` Pagenation, `163:1590` Record Control(시각만, S4 에서 재검) | PageIndicator | |
| `17:366` Foundations | 토큰 swatch 페이지 | 색·타입 스케일 |
| 추가 기준 | focus ring, 320px reflow, 200% 텍스트 확대, reduced-motion | Figma 없음 → spec 기준 |

---

## Stage 2 — Auth + Consent + Onboarding + Child Profile

### 2.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | SelectTrigger, SwipeDeck, InfoRow, DividerWithLabel, TextLink, PasswordToggle | `179:1740`, `179:1781–1783`, `179:1759`, `179:1839` |
| 2 | Domain | CharacterMedallion(sm/md/lg), CharacterIllustration, SurveyQuestionCard, CharacterBubble(기본), **CapabilityDiamondChart**(누락), **PersonaCard**(누락) | `179:1703`, `179:1819`, `179:1783` |
| 3 | Feature | SocialAuthButtons, SignUpForm, LogInForm, PasswordResetForm(누락), GuardianConsentForm(누락), OnboardingWizard, ProfileResultView(누락), GrowthCapabilityPicker(누락) | |
| 4 | Pages | WelcomePage `179:1701`, SignUpPage `179:1724`, LogInPage `179:1820`, ForgotPassword/ResetPassword(누락), GuardianConsentPage(누락), OnboardingIntroPage `179:1748`, OnboardingStepPage `179:1770` (+ Step 1–4 누락), OnboardingSavedPage `179:1809`, ProfileResultPage(누락), GrowthCapabilityPage(누락) | |

### 2.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Welcome / Log in | `success`: 로그인 → `/v1/me` 라우팅 | `loading`: 버튼 loading | — | `error`(잘못된 자격 증명) → `retry`, `provider-cancelled`, `offline` | `token-expired` (`AUTH_TOKEN_EXPIRED` refresh) |
| Sign up | `success`: 가입 + `POST /v1/consents` | `loading` | — | `error`(이메일 중복, `VALIDATION_FAILED` 필드 에러) → `retry` | 동의 미체크 시 버튼 disabled |
| Guardian consent | `success`: 동의 기록 | `loading`: 문서 로딩 | — | `error` → `retry` | `consent-missing` (Me.consentStatus.missing), `consent-version-outdated` 재동의 |
| Onboarding intro/steps | `success`: draft 저장 | `loading` | — | `error` → `retry`(입력 보존) | `draft-resume` (`currentStep=n`), `consent-missing` → consent 로 |
| Baseline saved → Profile | `success`: `ProfileResult` | `loading`: persona 생성 대기 ≤3s | — | `error`(`ONBOARDING_INCOMPLETE`) → `retry`, `child-limit-reached` | `persona-fallback` |
| Growth capability | `success`: 설정 완료 | `loading` | — | `error` → `retry` | 기본값 = 최저 스코어 역량 |

### 2.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 실제 Email/Google/Apple 인증 Provider, 서버측 동의 강제·`consent_events` 기록, 온보딩 스코어링, persona LLM 생성·금지어 검증.

디자인 차단 요인:
M-01/M-27 동의 화면 + Google 경로 동의, M-02 pilot, M-03/M-04/M-05 설문 체계(옵션 수·"Haven't seen"), M-06 Step 1–4 화면, M-07 프로필·페르소나·다이아몬드·발전 역량 화면, M-16 Apple 버튼, M-28 가입 화면 아이 정보 위치·성(last name) 수집, M-38 성별 옵션 문구, 비밀번호 재설정 화면, D-11 캐릭터 에셋 권리·최적화, M-13 역량 라벨.

### 2.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
`179:1701`, `179:1724`, `179:1748`, `179:1770` (선택 상태 1개), `179:1809`, `179:1820` — 전 frame 393×852 전체 비교. 누락 화면은 승인된 stage-2 design spec 기준.

---

## Stage 3 — Home + Activity Card + Library + Book Selection + Recommendation

### 3.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | ListGroup/ListRow, SectionHeader, Carousel, Toggle, ButtonGroup 확정 | `163:2145`, `30:74`, `113:1993`, `17:113`, `86:372` |
| 2 | Domain | CapabilityBadge, BookCover, BookShelfItem, BookListRow, BookSummary, PromptPill, PromptPhaseTag(M-29 결정 시), CoachingNote, ActivityOptionCard(compact/full, front/back), ReadingContextChip, StreakChip, CharacterBubble(home) | `76:440`, `113:1991/1992`, `86:324`, `86:397`, `86:512`, `86:538`, `26:40`, `88:922` |
| 3 | Feature | ActivityCardDeck(+오프라인 캐시 표시), PromptReveal(flip), ReadingContextSelector(누락), LibraryShelves, LibraryShelfSheet, BookDetailSheet, AddOwnBookForm(누락), GiftRequestFlow(누락), NotificationPreferencesForm·PushPermissionPrompt(누락) | |
| 4 | Pages | HomePage `26:21`+`163:2648`, LibraryPage `30:74`/`163:1669`/`145:1132`, AddOwnBookPage(누락), GiftRequestsPage(누락), NotificationSettingsPage(누락, S3 범위 시) | |

### 3.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Home (HomeSummary + today card) | `success`: 3 options | `loading` ≤2s → Skeleton (NFR 2s) | `empty`: 카드 없음(07:00 이전) — 표시 방식 누락 | `error` → `retry` | `offline-cached-card` (최근 캐시 + Banner), `offline`, `reread-option` / `conversation-only-option`, `books-exhausted`, `session-already-active` (세션 복귀), `onboarding-incomplete` → onboarding |
| Card selection (Prompt reveal) | `success`: promptSet 2–3 | `loading` | — | `error`(`RESOURCE_NOT_FOUND`) → `retry` | Context 선택 저장 (`now`, `bedtime`, `custom_time`) |
| Library | `success`: owned/gifted/history | `loading` | `empty` (첫 사용자, 히스토리 없음) | `error` → `retry` | `gift-pending` 배송 상태, `user-entered-book` |
| Book detail / prompts | `success`: BookPrompts | `loading` | `empty` / `user-entered-book`: 범용 Prompt | `error` → `retry` | `session-already-active` (`POST /v1/sessions`) |
| Add own book | `success`: 등록 | `loading`: 검색 중 | `empty`: 검색 결과 없음 → 제목 직접 입력 | `error`(`VALIDATION_FAILED`) → `retry` | `user-entered-book` |
| Gift request | `success`: 신청 | `loading` | `empty`: 신청 내역 없음 | `error` → `retry`, `gift-duplicate` | `gift-pending` (`requested → shipped → delivered`) |
| Notification prefs / push | `success`: 저장 | `loading` | — | `error` → `retry` | `push-permission-denied` |

### 3.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 07:00 Activity Card 생성 Job·Cold 추천 규칙, push 발송·기기 등록 수신, 증정 신청 처리·배송 상태 갱신, 표지 등 콘텐츠 운영 데이터.

디자인 차단 요인:
M-08 내비게이션(홈·세션 탭), M-09 Prompt 노출 시점·flip, M-30 홈 구성(카드 배치·코칭·Context·streak 지표), M-31 카드별 역량 vs 일일 역량, M-29 PRE/POST/P.n 태그, M-14 Save/My Saved/Reading now/Rated, M-32 서재에서 바로 세션 시작, M-13 "Confidence", M-35 표지 권리, T-4 capability 색, Context 선택·직접 시간 picker 화면, 대화 전용/재독/소진 카드, 서재 Empty, 책 직접 등록·증정 신청 화면, 알림 설정·push 사전 안내, 홈 버블 CTA 여부, 덱 prev/next 버튼(제스처 대안).

### 3.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
`26:21` (카드 배치 결정 반영), `163:2648` 카드 1장 (overflow 수정 = 의도된 차이), `86:512` compact 카드, `86:482` flip back, `30:74` 상단 852px 영역 + 스크롤 하단, `163:1669` 시트, `145:1132` 시트, `113:1993` Default/Selected.

---

## Stage 4 — Storytime Session + Recording Client + Pause/Resume + Prompt Drawer + Local Recording + Upload UX

### 4.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | Dialog/ConfirmDialog 재사용 (S1 구현), Sheet snap(Drawer) 추가 | `88:960` |
| 2 | Domain | RecordButton(idle/recording/paused/disabled/permission-denied), CharacterMedallion motion(idle/listening/celebrate), CharacterBubble(ready/complete), PromptCarousel, AttendanceStickerChip, UploadStatusBadge(누락) | `163:1590`, `28:73/74`, `88:757`, `88:929`, `29:79` |
| 3 | Feature | StorytimeSessionView(RecordingControls: Record·Done Reading·Pause/Resume, 경과 표시, 30분/10분 안내), PromptDrawer + 트리거, MicPermissionGate + ConversationOnlyMode, UploadQueueNotice/RecoveryNotice, SessionCompleteView | `28:51`, `88:960`, `29:62` 상단 |
| 4 | Pages | SessionEntryPage(`/session`, 누락), StorytimeSessionPage `28:51`, MicPermissionPage(누락), SessionCompletePage `29:62` 상단 | |
| 5 | Motion | record pulse, listening 표시, 완료·스티커, 버블 pop-in, reduced-motion 대체 | 프로토타입 `haru-pulse`/`haru-ring`/`haru-bar` [P] |

### 4.2 Mock scenarios (API + RecorderAdapter mock)

> `abandoned`, `completedReason`(`auto_timeout`, `recovered_after_crash`), 클라이언트 UploadStatus(`local_only` … `stalled_48h`), `analysisOutcome` 값은 ARCHITECTURE §10 / API_CONTRACTS §2 의 **RECOMMENDED** 설계이며 확정 전이다. 실기기 녹음 검증 불가 시 `NOT VERIFIED` + 수동 절차, 실제 Storage 수신·서버 전이는 `BACKEND_INTEGRATION_PENDING`.
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Session create (ready) | `success`: bubble + prompts | `loading` | `empty`: prompts 0 (대화 전용·범용) | `error` → `retry` | `session-already-active` 복귀, `consent-missing` → 녹음 시작 차단, `onboarding-incomplete` |
| Recording controls | `success`: ready→recording→paused→recording→completed | `loading`: 권한 요청 / 녹음 시작 대기(≤1s) | — | `invalid-transition` → 서버(Mock) 상태 재동기화 | `mic-permission-denied` → permission page·대화만 하기, `recording-interrupted` (전화·route change 인터럽션 / Web background 경고), `abandoned` (10분 방치 → 리마인드 1회), `auto-timeout` (30분), `crash-recovered` (상태·사유 값 `abandoned` / `auto_timeout` / `recovered_after_crash` 은 ARCHITECTURE §10 **RECOMMENDED**, 미확정) |
| Upload | recording upload success (`recording-upload-success`) → `analyzing` | `loading`: 업로드 진행 | — | recording upload failure (`recording-upload-failure`, 지속 실패), `upload-retry` (재시도 후 성공) | `offline-queued` (로컬 보관 `local_only`/`queued`), `upload-token-expired`, `recording-incomplete`, `upload-stalled-48h`, `consent-revoked` (로컬 삭제 — **OAQ-08 채택 시에만**) |
| Complete | `success`: completionBubble + stickerAward | `loading`: 전이 대기 | — | `offline` → outbox 대기 표시, `retry` | 스티커 멱등 = **replay test** (동일 전이 재요청 시 중복 지급 표시 없음, scenario key 아님) |
| Prompt Drawer | `success`: prompts 2–3 | — | `empty`: Prompt 없음 안내 | — | 무음·무진동 |
| Conversation only | `success`: `ready → completed` | — | — | — | `error` + code `RECORDING_NOT_ALLOWED_FOR_MODE` |

### 4.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): Storage resumable 업로드 수신·complete 검증, 서버 세션 전이·abandoned sweeper, 48h push, audit log. (녹음 캡처 자체는 Frontend 범위 — 실기기 불가 시 `NOT VERIFIED`)

디자인 차단 요인:
**M-25** 세션 버블 내용, **M-26** 상태별 컨트롤 화면(Done Reading·Pause/Resume·Discard/Submit 용도), Prompt Drawer 트리거, 마이크 권한·대화 전용 화면(OAQ-16), 업로드/오프라인/48h/크래시 복구 UI, 10분·30분 안내 UI, `/session` 탭 진입(M-08), **캐릭터 경청·완료 애니메이션 에셋과 포맷**(DESIGN_SYSTEM §8, §9.2), 녹음 중 무한 모션 개수 규칙(§9.3-4), FR-21 세션별 녹음 삭제 UI 를 S4 로 당길지(PLANNING §4.1).

### 4.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
`28:51` (M-25/M-26 결정 반영 후), `163:1590` Record/Pause, `163:1601`, `88:960` Drawer, `88:757` ready 버블, `29:62` 상단(≈ y 0–470), `78:353` 헤더 채택 시. 모션은 Figma 기준 없음 → stage-4 design spec 의 duration/easing 표 기준 녹화 비교.

---

## Stage 5 — Reflection + Async Analysis Status + Short Feedback

### 5.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | StarRating, TextArea | `91:693`, `91:715` |
| 2 | Domain | AnalysisStatusCard(누락), CharacterBubble(short feedback) | |
| 3 | Feature | ReflectionForm(별점·칩 5·주제 입력·자유 후기 카드·skip), ShortFeedbackView(push deep link) | `91:691` |
| 4 | Pages | ReflectionPage `29:62` 하단, ShortFeedbackPage(누락) | |

### 5.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Reflection | `success`: 제출 → 완료 | `loading` (`GET /v1/reflection-form`) | `empty`: 선택 없이 제출(skip) | `error` → `retry`(입력 보존), `offline` 대기 | `reflection-already-submitted` (멱등 재제출 = 동일 응답), `invalid-transition` (completed 이전) |
| Analysis / short feedback | analysis completed (`analysis-completed`: shortFeedback, metricsPreview) | analysis pending (`analysis-pending`: 24h 안내, 폴링) | — | analysis failed (`analysis-failed`: 재시도 중 안내) | `analysis-low-quality` ("다음엔 조용한 곳에서" 안내), `analysis-not-available` (conversation_only), `recording-deleted` (`skipped_audio_deleted`, OAQ-17), `consent-revoked` (`skipped_consent_revoked` — **OAQ-08 채택 시에만**) |

### 5.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): STT·역량 분석 파이프라인 결과, short feedback 생성·safety 검증, 분석 완료 push.

디자인 차단 요인:
M-15 잔여(자유 후기 "다음 카드", skip 버튼, 칩 문구 "Stay Focus", 칩=on/off 확정), 분석 상태·짧은 피드백·저품질 안내 화면 전체, push deep link 진입 화면, 진단 표현 금지 copy 리뷰.

### 5.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
`29:62` 하단 Feedback Card `91:691` (별점·칩 선택 상태), 자유 후기·분석 상태는 stage-5 design spec 기준.

---

## Stage 6 — Personalization + Profile Update + Recommendation Loop

### 6.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | ListGroup 설정 변형, ConfirmDialog 재사용 | — |
| 2 | Domain | CapabilityDiamondChart 업데이트 표시(최신 스냅샷), PersonaCard 변경 표시, 추천 사유 라벨(warm) | **Figma 누락** |
| 3 | Feature | SettingsMenu(셸), ChildProfileEditor(설문 재응답 = OnboardingWizard 재사용), GrowthCapabilityPicker(설정 진입) | **Figma 누락** (`26:44` 진입만) |
| 4 | Pages | SettingsPage, ChildProfileEditPage, GrowthCapabilitySettingsPage | **Figma 누락** |

### 6.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Profile (updated) | `success`: 최신 스냅샷 + `profileUpdatedAt` | `loading` | `empty`: 스냅샷 1개(설문만) | `error` → `retry` | `cold-to-warm`, `persona-changed` |
| Settings / child edit | `success`: 저장 | `loading` | — | `error`(`VALIDATION_FAILED`) → `retry` | `draft-resume` (설문 재응답 중도 이탈 복귀) |
| Growth capability change | `success`: `SetGrowthCapability` | `loading` | — | `error` → `retry` | 다음 카드 반영 안내 |
| Activity card (warm) | `success`: `recommendationPhase=warm`, `reasonKey` | `loading` | — | `error` | `cold-to-warm`, `difficulty-lowered` |

### 6.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 세션 분석 기반 스냅샷·페르소나 갱신, recommendation 규칙 v2 (Warm).

디자인 차단 요인:
프로필 업데이트 노출 방식, 설정 IA·화면 전체, 추천 사유 표시 여부(Figma 없음), 다이아몬드·페르소나 컴포넌트(S2 에서 확보되어야 함).

### 6.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
Figma 기준 없음 → stage-6 design spec + S2 에서 승인된 CapabilityDiamondChart/PersonaCard 스크린샷을 baseline 으로 회귀 비교.

---

## Stage 7 — 4-Week Report + History + Highlight Audio + PDF UX

### 7.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | StatTile, SelectTrigger(기간) | `163:2545`, `31:118` |
| 2 | Domain | CapabilityProgressRow(M-12 결정), WeeklyReadingChart(M-10 채택 시), NotableQuoteCard, ReportArchiveCard, CapabilityDiamondChart(overlay), HighlightClipPlayer(누락), AttendanceCalendar(채택 시) | `163:2607`, `163:2551`, `163:2633`, `110:844` |
| 3 | Feature | GrowthReportOverview, ReportDetailView(누락), ReportPdfAction(생성·다운로드·공유) | `31:102`, `110:522` |
| 4 | Pages | ReportOverviewPage `31:102`/`110:522`, ReportDetailPage(누락) | |

### 7.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Report overview | report eligible (`report-eligible`: archive 1+) | `loading` | `empty`: 첫 주기 진행 중 / archive 0 | `error` → `retry` | report not eligible (`report-not-eligible`: 진행도 녹음 분·세션 수, 경계 3599/3600s·N-1/N), `report-deferred` 이월 안내, `report-delayed` 지연 안내 |
| Report detail | `success`: ReportDetail 전체 | `loading` | `empty`: 인용 0개, 클립 0개 | `report-delayed` (`REPORT_NOT_READY`), `report-not-eligible`, `error` → `retry` | persona history 1건(변화 없음), `excluded_low_quality` 세션 포함 여부 = **OAQ-12 결정** (scenario key 아님) |
| Highlight clip | `success`: 재생 | `loading`: signed URL 요청 | `empty`: 클립 없음 | `error` → `retry` | `clip-expired` / `recording-deleted` → "expired" 표시 |
| PDF | `success`: ready → 다운로드·공유 | `pdf-generating` (폴링) | — | `error` → `retry` | `share-cancelled` (공유 시트 취소) |

### 7.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 리포트 scheduler·eligibility 집계·narrative 생성, PDF 생성, 하이라이트 클립 추출·signed URL, (M-11 채택 시) 이메일 발송.

디자인 차단 요인:
**M-10** 리포트 탭 IA(주간 Progress 채택 여부) + 주간 지표 contract 부재, **M-11** 이메일, **M-12** strong/growing/emerging·+18%·80% 표현, M-13 역량 라벨, 4주 리포트 상세 화면 전체, 미충족·지연 상태, 하이라이트 클립 플레이어·만료, PDF 상태·공유 UX, 차트 대체 텍스트 규칙, T-4 capability·chart 색, OAQ-12/13.

### 7.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
`31:102` (852px 상단 + 스크롤), `110:522` 채택 부분(아카이브 카드 `110:844`, 달력 채택 시), `163:2607` Growth themes, `163:2633` Moment 카드. 수치 placeholder 불일치(M-10/M-36)는 비교 제외.

---

## Stage 8 — Frontend Final QA + Accessibility + Responsive + Regression + Backend Handoff Package → STOP

### 8.1 빌드 순서

> **Carry-over — NEEDS DECISION (Stage 8 유지 vs Stage 6 설정 작업으로 이동)**: 사용자 확정 Stage 8 범위는 Frontend Final QA + Accessibility + Responsive + Regression + Backend Handoff Package 뿐이다. 아래 1–2행(데이터 관리 UI FR-21, 동의 이력 보기, 계정 탈퇴)은 이전 "Privacy" Stage 에서 넘어온 항목이다. **동의 철회는 PRD·Figma 근거가 없어 범위 외 (NEEDS DECISION, OAQ-08·법무)**. 동의 이력 보기는 RECOMMENDED.
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Feature — carry-over (NEEDS DECISION: Stage 8 유지 vs Stage 6 이동) | DataManagementPanel(FR-21: 보관 정책·세션별 녹음 삭제·전체 삭제 확인·진행 상태), ConsentHistory(동의 이력 보기만 — RECOMMENDED), AccountActions(로그아웃·탈퇴·플랜 표시 여부) | **Figma 누락** |
| 2 | Pages — carry-over (NEEDS DECISION: Stage 8 유지 vs Stage 6 이동) | DataManagementPage, PrivacyConsentPage(이력 보기), AccountPage, LegalDocumentPage | **Figma 누락** |
| 3 | 전역 | WCAG AA 감사 수정(대비·focus·label·reduced-motion·reduced-transparency), 반응형 QA(`--layout-min-width` / Figma 393 / `--bp-md` / `--bp-lg` 이상 및 가로), 로그아웃·삭제 시 로컬 녹음·캐시 정리 UX (동의 철회 시 정리는 OAQ-08 채택 시에만) | DESIGN_SYSTEM §11–§12 |
| 4 | Handoff | Backend Handoff Package 디자인 입력: Stage 2–7 `BACKEND_INTEGRATION_PENDING` 목록, 화면 ↔ contract 매핑(FIGMA_SCREEN_MAP §1), 실 데이터 연동 시 재검증할 Visual QA 목록 → **STOP** (Deployment 없음) | — |

### 8.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Data management | `success`: 요약(rawAudioDays 90, recordingsCount) | `loading` | `empty`: 녹음 0건 | `error` → `retry` | `deletion-already-requested`, `recording-deleted`, `deletion-processing` (`received → processing → completed/failed`), `offline-queued` (로컬 미업로드 녹음 존재 경고) |
| Consent history (carry-over, NEEDS DECISION) | `success`: 이력 목록 | `loading` | `empty` | `error` → `retry` | 철회 UI 없음 — `consent-revoked` 는 **OAQ-08 채택 시에만** |
| Account / delete | `success`: 탈퇴 요청 | `loading` | — | `error` → `retry` | `deletion-processing`; 탈퇴 확인 문구 입력 방식 채택 시(RECOMMENDED — 법무·디자인 확인) 입력 불일치 |

### 8.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 삭제 cascade·Retention(90일) Job·RLS·암호화 검증 → Backend Handoff Package 에 1:1 등록 여부만 확인.

디자인 차단 요인:
설정·데이터 관리·동의 이력·탈퇴 화면 전체, 삭제 확인 문구·SLA 안내(법무), 탈퇴 = 전체 삭제 여부, 구독 표시 여부(P2), Dark mode 최종 결정(D-8), 데스크톱 레이아웃 추가 여부(D-5).

### 8.4 Visual QA checkpoints — 브라우저/E2E 도구 승인 전 `NOT VERIFIED`
Stage 1–7 전체 baseline 회귀 (Figma node 목록 = 각 Stage §x.4 합집합) × viewport 320 / 393 / 600 / 1024 + 텍스트 200% + reduced-motion. Figma 기준이 없는 화면은 승인된 stage design spec 의 스크린샷 baseline.

---

## 9. Stage 별 Figma 누락 요약 (디자이너 요청 순서)

| 요청 순위 | 필요 Stage | 화면 / 상태 | 관련 불일치 |
|---|---|---|---|
| 1 | 1 | 공통 상태 패턴 (Loading/Empty/Error/Offline/Toast/Dialog), focus·error·loading 컴포넌트 상태, 대비 조정 토큰 | M-33, M-34 |
| 2 | 2 | 보호자 동의(이메일·Google 경로), 비밀번호 재설정, Apple 버튼, 온보딩 Step 1–4, 프로필 결과·다이아몬드·페르소나, 발전 역량 제시·변경 | M-01, M-06, M-07, M-16, M-27, M-28 |
| 3 | 3 | 홈 카드 배치 확정, Context 선택·시간 picker, 대화 전용/재독/소진 카드, 덱 prev/next, 서재 Empty·직접 등록·증정 신청, 알림 설정·push 사전 안내, 내비게이션 확정 | M-08, M-09, M-14, M-29, M-30, M-31 |
| 4 | 4 | 세션 ready/recording/paused 화면, Done Reading·Pause/Resume, Prompt Drawer 트리거, 마이크 권한·대화 전용, 업로드·오프라인·48h·크래시 복구, 10분/30분 안내, 캐릭터 경청·완료 애니메이션 | M-25, M-26 |
| 5 | 5 | 자유 후기 카드·skip, 분석 상태·짧은 성장 피드백·저품질 안내 | M-15 |
| 6 | 6 | 프로필 업데이트 표시, 설정 셸·아이 프로필 수정 | — |
| 7 | 7 | 리포트 IA 확정, 4주 리포트 상세, 미충족·지연, 하이라이트 클립, PDF 상태 | M-10, M-11, M-12 |
| 8 | 8 또는 6 (carry-over NEEDS DECISION) | 데이터 관리·삭제 확인, 동의 이력 보기, 계정·탈퇴, 약관 문서 (동의 철회는 OAQ-08 결정 전 범위 외) | — |
