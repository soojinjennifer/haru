# HARU Figma Screen Map

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (Rev: #33 · C-19 반영 · **2026-10-13 추가: 녹음 섹션 `285:1126` — `D4-12`**)
Based on: Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` (page `16:2` MVP_KeyScreen_V.2, page `8:2` Design Guide — 2026-09-14 확인), PRD v1.4, `docs/decisions/stage-0-approvals.md` (기존 문서보다 우선), `PLANNING.md` (§6, §9), `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md` (DRAFT 2026-09-14, 개정본 포함 §7.3.1 consent guard); Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `CLAUDE.md`, `.claude/rules/frontend.md` §1·§5, `.claude/rules/qa.md`
Author: design-agent (2026-09-14)

> **갱신 2026-11-09 (design-agent, Stage 5 `S5-C` Visual Gap)** — Figma 에 없는 피드백·분석 상태 화면 `/session/:sessionId/feedback`(`C13-S5-1`, Spec `docs/design/stage-5-design-spec.md` §2.3 · `D5-4`) 구현을 등재하고, 승인된 Spec §1·§4 에 따라 `29:62` 의 route 를 한 개로(`/reflection` 없음), `AnalysisStatusCard` 를 **만들지 않음**(기존 InlineAlert·ErrorState·버블 재사용)으로 정정했다. 새 결정 없음. 근거 `docs/design/stage-5-visual-gap-s5c.md`.

> **개정 2026-10-13 (plan-agent, 사용자 지시)** — 디자이너가 Figma 에 **섹션 `285:1126` "Recording"** 을 추가하고 세션 녹음 컨트롤을 확정했다. 이 개정은 그 결과를 등재한다 (§0 · §1.2 · **§1.4 신설** · §2 · §3 · §4.1 · §5.2 `M-26`).
> ⭐ **추가 개정 2026-10-13 (2차, plan-agent)** — 사용자 결정 **7건**(`D4-13`~`D4-19`)을 반영했다. 바뀐 것 3가지: ① **`D4-13`** 녹음 폐기 전이 = **`→ abandoned` 2행 추가 확정**(§1.2 · §3 · §1.4) ② **`D4-14`** ready 버블 = **`139:2803` Figma 그대로 채택** → **`M-25` 해소**, `88:757` 미사용, **PRD 수정 대상 7건** ③ **`D4-19`** 하단 바 = **열 가운데 정렬 보정**(허용 차이 `AD-S4-5`). 결정 정본 = **`docs/decisions/stage-4-approvals.md`**.
> 변경된 사실 3가지 — ① `28:51` 안의 **`140:2870` "Resume" 버튼이 제거**되고 **`285:1445` "After_record"(Discard · Submit)** 프레임이 들어왔다 ② `163:1601`(Pause) · `163:1618`(Discard) · `163:1620`(Submit) · `78:353`(Title) 은 **섹션 `285:1126` 의 직계 자식**으로 재배치됐다 ③ 상태 전환이 사용자 지시로 확정됐다 (**`D4-12`** — `docs/plans/stage-4-plan.md` §0.1).
> **이 개정이 뒤집는 것**: Stage 4 Plan 초판의 **`D4-7`(Discard 미채택) 은 무효**다 — `Discard` 를 **채택**한다. 따라서 §3 의 "용도 불명" 표기와 `M-26` 의 "Stage 4 차단" 판정이 함께 갱신된다.
> 검증: `get_metadata(285:1126)` · `get_metadata(285:1445)` · `get_screenshot(285:1126)` — **[S][M]** (plan-agent 직독, 2026-10-13). ⚠️ 버튼 **fill·그림자 선언값은 이 개정에서 직접 조회하지 못했다**(이 세션에 `get_design_context` 가 없다) — §1.4 의 색·그림자 값은 **사용자 실측 보고를 옮긴 것**이며 `[인용]` 으로 표기했다. 구현 전 design-agent 가 선언값을 재확인한다 (`rules/frontend.md` §6-2 ①).

라벨: `CONFIRMED (사용자 결정 2026-09-14, #id)` = 사용자 결정 (id = 승인 로그 번호) · `CONFIRMED` = PRD / Figma 로 확정 (ARCHITECTURE 라벨 정의와 동일) · `가값 (P-xx)` = 승인 로그 §4 가값 · `D-xx` = 승인 로그 §3 수용 예외 (PRD 와 다르게 가기로 사용자 결정) · `RECOMMENDED` = 권장안(사용자 미결정) · `NEEDS DECISION` = 사용자/디자이너/법무 결정 필요

> 라벨은 **결정 상태**만 뜻한다. "Figma 에서 불일치를 실제로 확인했다" 는 사실은 라벨이 아니라 **검증** 표기(아래)로 따로 적는다. 불일치 표(§5)의 기능은 확인되었어도 채택된 것이 아니다.

검증 표기:
- **[S]** = `get_screenshot` 으로 화면을 직접 확인
- **[DC]** = `get_design_context` 로 레이어·토큰 바인딩 확인
- **[M]** = `get_metadata` 레이어 이름/구조에서만 추론 (시각 확인 안 됨)
- **[P]** = 로컬 프로토타입 HTML(`$HARU_ONEDRIVE/디자인/*.html`)에서 확인 (참고 자료, Figma 아님)

---

## 0. 분석 범위

| Page | Section / Node | 내용 | 검증 |
|---|---|---|---|
| `16:2` MVP_KeyScreen_V.2 | section `31:204` HARU · Home & Session Screens | `26:21`, ~~`28:51`~~, `29:62`, `30:74`, `163:1669`, `145:1132`, `31:102`, `110:522`, `163:2648` + loose `86:438`, `86:482`, ~~`163:1601`~~, ~~`163:1618`~~, ~~`163:1620`~~, ~~`78:353`~~, `91:627`, `91:628` — ⚠️ **취소선 5개는 2026-10-13 에 section `285:1126` 으로 이동**했다 (아래 행) | 모든 frame [S]; `26:21`, `28:51`, `29:62`, `31:102` [DC]; loose instance [S] (`91:627/628` 은 [DC] `29:62` 내부 Select로 확인) |
| `16:2` MVP_KeyScreen_V.2 | **section `285:1126` Recording** (2026-10-13 신설) | `28:51`(이동) + 자식 `285:1445` After_record(`163:1618` Discard · `163:1620` Submit) + 섹션 직계 `163:1601` Record Control(Pause) · `78:353` Frame 7(Title) · `31:206` 섹션 제목 텍스트 | `285:1126` · `285:1445` [M] (`get_metadata`, plan-agent 2026-10-13) · 섹션 전체 [S] (`get_screenshot`). **선언값(fill·shadow) 미조회** — §1.4 각주 |
| `16:2` | section `179:1700` Signup & Baseline survey | `179:1701`, `179:1724`, `179:1748`, `179:1770`, `179:1809`, `179:1820` | 모두 [S]; `179:1724`, `179:1770` [DC] |
| `8:2` Design Guide | `17:366` Foundations, `17:367` HARU Components, `17:368` iOS 26 Components, loose `86:512`, `86:545`, 이미지 에셋 | 컴포넌트 세트는 COMPONENT_MAP 참조 | section 3개 [S], 주요 component set [S], `17:20`, `25:87`, `76:440` [DC] |

- 모든 화면 frame 폭은 **393px** (높이 852 또는 스크롤 frame 1103/1105/1752). 태블릿·데스크톱 frame 없음 (검증 [M]).
- `110:522` 은 layer 이름이 `div` / `span` / `div.haru-pressable` 인 **HTML→Figma import frame** 이다 [M][S]. Component instance가 아니며 Tab Bar도 컴포넌트가 아니다.
- 화면 frame 이름의 번호 체계가 section마다 겹친다 (`1a · Home` vs `1a · Sign up`, `1b · Session` vs `1b · Create account`). 이 문서에서는 node id로만 식별한다.
- **Prototype 연결(Reactions)은 Figma MCP로 노출되지 않는다.** `get_metadata` / `get_design_context` 응답에 interaction 정보 없음 → 화면 간 흐름은 §4에서 frame 이름 + 로컬 프로토타입 앵커로만 추론하며 "확인 불가"를 명시한다.

---

## 1. Screen Map (Figma frame → Route → … → Stage)

Route는 `PLANNING.md` §9.2 를 기준으로 한다. 탭 구조는 **하단 탭 Library / Home(가운데) / Progress (Figma `25:87`), 세션 전용 탭 없음, 설정 = Home 상단 아이콘 `26:44`** — CONFIRMED (사용자 결정 2026-09-14, #15, D-02). 따라서 `/session` 은 탭 route 가 아니며 세션은 Home Activity Card 와 서재 "Start Session" 에서 `/session/:sessionId` 로 진입한다. 리포트 탭 화면 표시 이름은 **Progress** (기능·문서 명칭 "리포트/Report" 는 유지). **개별 경로명·step slug 는 PLANNING §9.2 를 그대로 따르며 RECOMMENDED** 이다 (각 Stage Plan 에서 확정): 리포트 `/progress`, 리포트 상세 `/progress/reports/:reportId`, VPC 슬롯 `/auth/verify-parent`, 온보딩 step slug `child-info` · `temperament` · `books` · `goals` · `capability-items`. API endpoint 경로·step 키(`/v1/onboarding/steps/child_info` 등)는 API_CONTRACTS 표기를 따른다.
Component 이름은 `docs/COMPONENT_MAP.md` 의 제안 이름. API/Data는 `docs/API_CONTRACTS.md` 의 endpoint/schema 이름 (`…Request/ResponseSchema` 접미사 생략).

**Frontend-only (CONFIRMED)**: 모든 API/Data 는 API client interface → Mock Adapter 로 호출한다. 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 등 interface + Mock 구현이며 **Supabase JS 를 직접 사용하지 않는다** (rules/frontend §1). 실제 Backend 가 있어야만 검증되는 동작은 `BACKEND_INTEGRATION_PENDING` 이며 디자인 차단 요인이 아니다. **Mock scenario key 의 유일한 기준은 `docs/API_CONTRACTS.md` §5.4** 이다. `docs/FRONTEND_IMPLEMENTATION_PLAN.md` 는 화면을 그 key 에 매핑하며 Stage 번호의 기준이다.

### 1.1 Signup & Baseline survey (`179:1700`)

| Figma Frame | Route | Page | Feature(s) | Reusable Components (variant) | API / Data | PRD IDs | Stage |
|---|---|---|---|---|---|---|---|
| `179:1701` "1a · Sign up" [S] | `/auth/welcome` | WelcomePage | `auth` | CharacterMedallion(size=lg, asset=hello-heart), Button(variant=glass, leadingIcon=google 공식 로고) `179:1709`, Button(variant=accent, leadingIcon=mail) `179:1715`, **Apple 로그인 버튼 = Apple 공식 가이드 버튼 (Figma 누락, C-13)**, TextLink("Log in"), LegalFootnote(text) `179:1722` | AuthGateway.signInWithProvider('google' \| 'apple') (interface + Mock Adapter) → `GET /v1/me` (Me) → **소셜 가입 직후 항상 `/auth/consent`** — CONFIRMED (사용자 결정 2026-09-14, C-2). 수동 고지 문구 `179:1722` 는 동의 기록 아님 | FR-01, FR-02(약관 문구만), FR-24 | 2 |
| `179:1724` "1b · Create account" [S][DC] | `/auth/sign-up` | SignUpPage | `auth` | IconButton(icon=back), SectionLabel("YOU"), FieldGroup(rows=3: guardian name·email·password+ShowToggle) = Input `boxcount=Line_3`, HelperText, Button(accent, size=lg) `179:1746`. **"YOUR CHILD" FieldGroup `179:1740` 과 단일 동의 Checkbox `179:1742`/`179:1745` 는 이 화면에서 사용하지 않음** | AuthGateway.signUpWithEmail (interface + Mock Adapter) → `/auth/consent` (C-2) → VPC 단계 슬롯(Mock, C-3) → 온보딩. **가입 화면은 보호자 정보(이름·이메일·비밀번호)만** — CONFIRMED (사용자 결정 2026-09-14, C-5). 아이 필드는 온보딩 Step 1 로 이동(아래 행). Figma 화면 수정(아이 섹션·체크박스 제거)은 디자이너 요청 | FR-01 | 2 |
| `179:1740` (1b 내 "YOUR CHILD" FieldGroup) [DC] | `/onboarding/:step` (step=`child-info`, Step 1) | OnboardingStepPage | `onboarding-survey` | FieldGroup: TextField(child **last name** + **first name** 두 칸), SelectTrigger(gender: **Girl / Boy / Prefer not to say**, 기본값 선택 안 함, 선택 항목), TextField(birth month) + Tag(tone=cyan, age "3yr 4mo"). Step 1 의 나머지 필드(관계·언어 환경·독서 루틴)는 Figma 누락 → C-13 | 동의 기록 후에만 서버 전송: `PUT /v1/onboarding/steps/child_info` (SaveOnboardingStep). 가입 전 체험 응답은 기기 로컬 draft (C-12) | FR-03 (Step 1) | 2 |
| `179:1748` "1c · Survey intro" [S] | `/onboarding` | OnboardingIntroPage | `onboarding-survey` | CharacterMedallion(size=md, asset=headphones), Surface(material=strong, radius=card) 소개 카드, InfoRow(icon=clock/"About 3 minutes · 10 cards" — **전체 5단계 소요 시간에 맞게 문구 수정 필요, 디자이너·카피**, C-9), InfoRow(icon=list/"Swipe each card…"), Button(accent, lg) | `GET /v1/onboarding` (OnboardingState: instrument, currentStep) | FR-03 | 2 |
| `179:1770` "1d · Survey cards" [S][DC] | `/onboarding/:step` (step=`capability-items`, Step 5) | OnboardingStepPage | `onboarding-survey` | TopBar(leading=IconButton back, title="Question 1 of 10", trailing=IconButton forward), ProgressBar(value=1/10), SwipeDeck(stack depth 3), SurveyQuestionCard(counter, eyebrow "IN THE PAST TWO WEEKS", question), RadioGroup(variant=card, **6 options** = Never · Rarely · Sometimes · Often · Almost always + 비채점 "Haven't had the chance to see this yet"), IconButton(icon=refresh) `179:1804` | `PUT /v1/onboarding/steps/capability_items` (SaveOnboardingStep) | FR-03 (Step 5 — **Baseline Survey v1 10문항** CONFIRMED (사용자 결정 2026-09-14, C-8), **D-04**). 6번째 옵션은 Figma 에 없음 → 디자인 소스 C-13 | 2 |
| `179:1809` "1e · Baseline saved" [S] | `/onboarding/saved` | OnboardingSavedPage | `onboarding-survey` | CharacterIllustration(asset=hello-heart-full — medallion 의 `hello-heart` 와 다른 전신 에셋, 2026-09-27 정정) `179:1819`, Title(text), Button(accent, lg, trailingIcon=arrow-right) `179:1814` | `POST /v1/onboarding/submit` (SubmitOnboarding → ProfileResult). 다음 화면 = 프로필 결과 → 발전 역량 (PRD §5.1 ③④, Home 직행 아님 — 화면 디자인 소스 C-13) | FR-03, FR-04(산출 트리거) | 2 |
| `179:1820` "1f · Log in" [S] | `/auth/log-in` | LogInPage | `auth` | IconButton(back), CharacterMedallion(md, headphones), Button(glass, google), DividerWithLabel("or with email"), FieldGroup(rows=2 email·password+ShowToggle) = Input `boxcount=Line_2`, TextLink("Forgot password?") `179:1843`, Button(accent, lg), TextLink("Create an account") | AuthGateway.signInWithEmail / signInWithProvider → `GET /v1/me` | FR-01 | 2 |

### 1.2 Home & Session (`31:204`)

| Figma Frame | Route | Page | Feature(s) | Reusable Components (variant) | API / Data | PRD IDs | Stage |
|---|---|---|---|---|---|---|---|
| `26:21` "1a · Home — Today's Activity Card" [S][DC] | `/` | HomePage | `activity-card-deck`, `book-selection`, `settings` | AppHeader(page-only: wordmark `26:39` + StreakChip(days, minutes) `26:40` + IconButton(icon=settings, Lucide) `26:44` → `/settings`), CharacterIllustration(asset=home-character) `26:22`, CharacterBubble(tail=bottom-right; Bubble/Home/Onlysession `88:922`), PageIndicator(count=3) `88:903` (+ 중복 `27:85` Deck Dots), BottomTabBar(Library / **Home** / Progress, active=home) `27:89` | `GET /v1/children/:childId/home` (HomeSummary: streakDays, sessionsThisWeek), `GET /v1/children/:childId/activity-cards/today` (ActivityCard) | FR-07, §7.4 보조 요소(streak·이번 주 세션 수), §6.1 (D-02) | **2 (skeleton)** — AppHeader(wordmark `26:39` + settings IconButton `26:44`) + EmptyState 안내, 로그인·온보딩 완료 후 착지 화면 (CONFIRMED (사용자 결정 2026-09-14, #33), 설정 연결 C-16) / **3 (content, tab bar)** — StreakChip·캐릭터·버블·Activity Card 덱·BottomTabBar |
| `163:2648` "Activity card" (1134px 가로 탐색 frame, 화면 아님) [S] | `/` 의 카드 덱 영역 | HomePage | `activity-card-deck` | ActivityOptionCard(density=full, face=front) ×3 (`Prompt Card/Home` instances `163:2649–2651`), CapabilityBadge(capability, suffix="Day" — 라벨은 #14 표시 라벨 기준, Figma "Emotion Day Day" 오타 폐기), PromptPill(phaseTag=PRE/POST/P.6) ×4, ActionBar(Button glass "Save" + Button accent "Start Session" → `/session/:sessionId`) | ActivityCard.options[3]{kind, book, reason}, `POST /v1/activity-cards/:cardId/selection` (SelectActivityOption → ActivityCardSelection.promptSet) | FR-07, §7.9(카드 덱) | 3 |
| `86:438` Prompt Card/Home (loose, size=Max) [S] | `/` 덱 카드 (front) | HomePage | `activity-card-deck` | ActivityOptionCard(full, front, prompts=5) | ActivityCardSelection.promptSet | FR-07 | 3 |
| `86:482` Prompt Card/Home (loose, flip=back "Prompt of this book") [S] | `/cards/:cardId/prompts` 또는 카드 flip 상태 | HomePage (flip) / ActivityPromptsPage | `book-selection` | ActivityOptionCard(face=back): PromptPill(phaseTag) + CoachingNote(tone=neutral, 긴 설명) 반복 | `GET /v1/books/:bookId/prompts` (BookPrompts) 또는 ActivityCardSelection.promptSet.coachingLine/followUps | FR-07(“다음 카드”에 Prompt), FR-20 | 3 |
| `86:512` / `86:545` Prompt Card/Min/Emotion·Resilience (page `8:2` loose) [S][M] | `/` 덱 카드 (compact) | HomePage | `activity-card-deck`, `reading-context` | ActivityOptionCard(density=compact): CapabilityBadge(빈 라벨 pink) + "Alternative" 캡션, BookSummary(cover, title, author, reason), CoachingNote("Remember tonight"), PromptPill ×2, ReadingContextChip("Bedtime · 9:00 PM"), Button(accent "Start Session") | ActivityCard.options[].coachingLine, SelectActivityOption.readingContext | FR-07, FR-08 | 3 |
| `28:51` "1b · Session — Ready / Recording" (**section `285:1126` 자식**, 15,85,393×852) [S][DC][M] | `/session/:sessionId` | StorytimeSessionPage | `storytime-session`, `recording`, `prompt-drawer` | CharacterMedallion(asset=avatar-medallion `163:2528`, ring) `28:73`(101.5,132,190²)/`28:74`(109.5,140,174²), CharacterBubble(Type3 — PromptPill ×5, "Try this prompt !") `139:2803`(34,336,329×258), RecordButton(variant=Record, "Tap to recording") `163:1591`(122,621,150²), **SessionActionBar `285:1445` "After_record"**(67,789,279×45 — ⭐ **구현은 열 가운데 정렬(57)**, 10px 보정 = 허용 차이 `AD-S4-5`, `D4-19`) | `POST /v1/sessions` (CreateSession → SessionSummary.bubble, prompts), `POST /v1/sessions/:sessionId/transitions` (SessionTransition to=recording/paused/completed) | FR-09, FR-10, FR-11 | 4 |
| **`285:1445` "After_record"** (`28:51` 자식, 67,789,279×45) [M][S] ⭐ 2026-10-13 신설 | `/session/:sessionId` 하단 액션 영역 | StorytimeSessionPage | `recording` | **SessionActionBar** = flex · **gap 9** · 자식 2개 각 **135×45**: `163:1618` **Discard** · `163:1620` **Submit**. 상태별 활성/비활성 = **§1.4** (비활성 = 전역 `opacity .5` — `D4-18`). ⭐ **배치는 열 가운데 정렬(x=57)로 보정**한다 — Figma x=67 과 **10px 차이는 허용 차이 `AD-S4-5`**(`D4-19`, 근거: 320px 에서 `67+279=346>320` 잘림) | `POST /v1/sessions/:sessionId/transitions` (Submit → `to=completed`) · Discard = ⭐ **확인 다이얼로그**(`D4-17`) → **`recording/paused → abandoned`** 전이(actor `caregiver`, modes `['recorded']` — **`D4-13` 안 A 확정, 전이표 12→14행**) → **서버 확정 응답 후** 로컬 녹음 삭제 → 홈 | FR-09, FR-21 | 4 |
| `163:1601` Record Control (**section `285:1126` 직계**, 435,706,150²) [S][M] | `/session/:sessionId` (`recording` 상태) | StorytimeSessionPage | `recording` | RecordButton(variant=Pause, icon=pause) — `163:1590` component set 의 `Property 1=Pause`. **참조용 두 번째 인스턴스**이며 화면에 두 개를 그리지 않는다 | RecordingController 상태 (클라이언트 전용) | FR-09 | 4 |
| `163:1618` "Discard" / `163:1620` "Submit" Button (**`285:1445` 자식**, 각 135×45) [S][M] | `/session/:sessionId` 하단 | StorytimeSessionPage | `recording` | Button 2종 — **`163:1618` Discard = `--grays/gray-2` `#aeaeb2`** · **`163:1620` Submit = `--accents/teal` `#85bfb6`**. 공통 radius pill 100 · px26 py14 · SF Pro Semibold 17/17 white · backdrop-blur 12 `[인용 — §1.4 각주]` | Submit → `SessionTransition to=completed` · Discard → 홈 복귀 | FR-09, FR-21 | 4 — **용도 확정 (`D4-12`, 2026-10-13)** |
| `78:353` "Frame 7" (**section `285:1126` 직계**, 15,141,393×59 = `28:51` local y=56) [S][M] | `/session/:sessionId` 상단 후보 | StorytimeSessionPage | `storytime-session` | TopBar(variant=pill, leading=IconButton back, title=BookTitlePill(thumb, title)) = `Title Titla type=two`, 자식 `78:342`(10,10,373×40) | SessionSummary.book | FR-09 | 4 — ⚠️ `28:51` 의 **자식이 아니다**. 섹션 screenshot 에는 `28:51` 상단에 겹쳐 보인다 [S] (배치 의도 확인 = `N4-15`) |
| `29:62` "1c · Session — Complete & Feedback" [S][DC] | `/session/:sessionId/complete` 한 route — 하단 카드는 같은 화면의 footer slot (Figma 한 frame · V.1 도 한 frame, Stage 5 Spec §1 · `D5-4`. ~~`/session/:sessionId/reflection`~~ 만들지 않음, 갱신 2026-11-09 design-agent) | SessionCompletePage | `storytime-session`, `reflection` | TopBar(title="Session Complete", trailing=IconButton close) `29:76`, AttendanceStickerChip `29:79`, CharacterMedallion(sm) `29:86/87`, CharacterBubble(variant=centered, title+subtitle) `88:929`, ReflectionCard `91:691` = StarRating(5) `91:693` + Chip(selectable) ×5 `91:710–714` + TextField(outline, single-line) `91:715` + Button(accent "Save") `91:717` | SessionTransitionResult (completionBubble, stickerAward), `GET /v1/reflection-form` (ReflectionFormDefinition), `POST /v1/sessions/:sessionId/reflection` (SubmitReflection) | FR-10, FR-12, FR-19 | 4 (상단) / 5 (카드) |
| `30:74` "2a · Library — Bookshelf & History/Defult shelf" (1103px 스크롤) [S] | `/library` | LibraryPage | `library` | PageTitle("Library"), StreakChip(variant=star) `30:93`, SectionHeader(title, action="See all"), BookShelfCarousel(This Week's Shelf Default `113:1994`) + PageIndicator, BookShelfCarousel(“Finished together”, 중복) `145:779`, SectionHeader + BookList(BookListRow ×4) `Book List 163:2145`, BottomTabBar(active=library) `40:218` | `GET /v1/children/:childId/library?filter=owned\|gifted\|history` (Paginated<LibraryBook>) | FR-20, FR-22 | 3 |
| `163:1669` Library + "Deemed" 시트 [S] | `/library` + 시트 상태 ("See all" 시트 — 라우트화 여부 NEEDS DECISION) | LibraryPage | `library` | Scrim `163:1807`, Sheet(title="Our curated shelf", trailing icon) = Prompt Card/Home `type=shelf` `163:2347`: BookList + ActionBar(Save, Start Session) | `GET /v1/children/:childId/library` | FR-20, FR-22 | 3 |
| `145:1132` Library — Book Select [S] | `/library/books/:bookId` (시트) | BookDetailSheet (LibraryPage 위) | `library`, `book-selection` | ReadingNowCard("Reading now · 3 of 5 nights", ProgressBar) `145:1141`, Scrim `145:1450`, ActivityOptionCard(full, front) `145:1085` = CapabilityBadge + BookSummary + PromptPill(PRE/POST/P.6) + ActionBar(Save, Start Session) | `GET /v1/books/:bookId/prompts` (BookPrompts), `POST /v1/sessions` (CreateSession mode=recorded, bookId/childBookId) | FR-20, FR-23, FR-09(진입) | 3 |
| `31:102` "2b · Report — Weekly Growth" (1105px) [S][DC] | `/progress` (탭 표시 이름 **Progress**) | ReportOverviewPage | `growth-report` | PageTitle("Progress"), SelectTrigger(chip, "May 4 – 10") `31:118`, CharacterIllustration(asset=bookworm) `163:2642`, StatTile ×2 `163:2545/2548`, WeeklyReadingCard(bar chart, collapse IconButton) `163:2551`, GrowthThemesCard = CapabilityProgressRow ×4 `163:2607` (라벨 #14, 차트 색 = capability `-chart` #19 — Figma 차트 색 수정은 디자이너 요청), NotableQuoteCard ("Moment of the week") `163:2633`, BottomTabBar(Library / Home / **Progress**, active=progress) `40:339` | `GET /v1/children/:childId/reports/overview` (ReportOverview) — **주간 지표 필드 없음** (§5 M-10, plan-agent 보고). 리포트 발행 기준 = 녹음 세션 3회 이상 + 누적 녹음 1시간 이상, 저품질 세션 제외, 첫 세션 완료일부터 28일 주기 (#17) | FR-16(?), FR-04(다이아몬드 아님) | 7 |
| `110:522` "div" (HTML import, 1752px) [S][M] | `/progress` (확장안) | ReportOverviewPage | `growth-report`, `report-pdf` | 위 + AttendanceCalendar(“May 2026 · 8 nights”), MinutesPerWeekBars, StatTile ×3, ReportArchiveCard("4-week full report", ProgressBar, Button accent "Download PDF"), FootnoteText("Next report on Jun 7 · we'll email it too."). **비컴포넌트 Tab Bar(Library \| Session(center mic) \| Report)는 사용하지 않음** — CONFIRMED (사용자 결정 2026-09-14, #15), D-02 | ReportOverview.currentCycle/archive, `POST /v1/reports/:reportId/pdf` (ReportPdfStatus) | FR-16, FR-17 | 7 |

### 1.3 비화면 컴포넌트 중 화면 역할을 하는 것

| Figma node | 추정 역할 | Route / 위치 | 근거 | Stage |
|---|---|---|---|---|
| `88:960` Prompt Card/Session [S] | **Prompt 모아보기 Drawer** (grabber, "Prompts of this session", "Just read one aloud when feels right - no rush.", PromptPill 캐러셀 + 설명, PageIndicator) | `/session/:sessionId` 위 Sheet | PRD §7.5 "Prompt 모아보기" 와 역할 일치. 화면에 배치되거나 트리거 버튼이 있는 frame은 없음 | 4 |
| `88:757` Bubble Type=sessopn [S] | 세션 준비 인사 버블 ("Ready for today's story with Emma? Tap record and I'll quietly keep your storytime.") | ⛔ **Stage 4 미사용** | ⭐ **`D4-14`(2026-10-13): `28:51` 의 Type3(`139:2803`)를 그대로 쓴다 — 이 버블로 교체하지 않는다.** PRD §7.5 준비 상태 문구와는 일치하지만 Figma 배치가 아니다. 인사 문구(`SessionSummary.bubble`)의 노출 지점은 **미결** (`stage-4-plan.md` §14.2 `N4-32`) | — |
| `50:176` Bubble Type=Type2 [S] | 홈 인사 버블 ("Hi! Ready for Emma's story tonight? Tap me to say hi") | `/` | `26:21` 에는 다른 문구의 Bubble/Home/Onlysession | 3 |

### 1.4 세션 녹음 컨트롤 — 상태별 전환 (section `285:1126`)

**CONFIRMED (사용자 결정 2026-10-13, `D4-12`)** — 원문: *"녹음전 준비 단계에서는 'Tap to Recording' 으로 되어 있다가 선택하면 Pause 버튼으로 바뀌고 하단에 'Discard', 'Submit' 버튼이 활성화 되어서 Discard를 선택하면 홈으로 돌아가고, Submit을 선택하면 녹음이 제출되었다는 토스트 팝업과 함께 1c-Compete & Feedback으로 가게 해주세요."*
이 결정은 **`M-26`(세션 컨트롤 상태 혼합) 의 주요 부분을 해소**한다 (§5.2).

| 세션 상태 | Record Control (`163:1590`) | `285:1445` Discard (`163:1618`) | `285:1445` Submit (`163:1620`) | 전환 결과 |
|---|---|---|---|---|
| `ready` | **`Property 1=Record`** — mic 아이콘 + 라벨 **`Tap to recording`** (`163:1591` 이 이 변형) | **비활성** | **비활성** | Record 탭 → `recording` |
| `recording` | **`Property 1=Pause`** — pause 아이콘, 라벨 없음 (`163:1601` 이 이 변형) | **활성** | **활성** | Pause 탭 → `paused` · Discard → ⭐ **확인 다이얼로그**(`D4-17`) → **`recording → abandoned`** 전이(`D4-13`) → **서버 확정 응답 후** 로컬 삭제 → **홈 `/`** · Submit → **`29:62` 1c Complete & Feedback** + "녹음 제출됨" **Toast** |
| `paused` | ⚠️ **Figma 미확정** — `163:1590` 변형은 **`Record`·`Pause` 2개뿐**이고 `140:2870` "Resume" 버튼은 **`28:51` 에서 제거**됐다. 재개는 Record Control 토글로 읽히나 **단정하지 않는다** (`C13-14` 디자이너 Figma 요청 대상) | 활성 | 활성 | Discard → ⭐ **`paused → abandoned`**(`D4-13`, 확인 다이얼로그 경유 → 서버 확정 후 로컬 삭제 → 홈) · Submit = `recording` 과 동일. 재개 경로 = **design-agent 실측 확정 대기**(`N4-27`) |

> ⚠️ **Figma 에 없는 것 2가지** — ① **비활성(disabled) 상태의 버튼 변형**이 `163:1618`·`163:1620` 에 없다 ② **Discard 확인(confirm) 다이얼로그**가 없다. 녹음 폐기는 되돌릴 수 없으므로 확인 단계가 필요한지는 **사용자 승인 사항**이다 (CLAUDE.md 최우선 규칙 2 — Figma 에 없는 것을 만들지 않는다).
> ⚠️ **PRD §7.5 와의 경합** — PRD 는 하단 보조 버튼을 **"Prompt 모아보기"** 로 적는데, Figma 는 같은 자리에 **Discard / Submit** 을 둔다. Prompt Drawer(`88:960`) 의 **진입 지점이 Figma 에 여전히 없다** (`C13-4`). 두 요구가 같은 슬롯을 두고 경합하므로 **사용자 결정 대상**이다.
> **각주 — 선언값 출처**: 위 표의 node id·좌표·크기·변형 구성은 plan-agent 가 `get_metadata` · `get_screenshot` 으로 **직독**했다. **fill(`#aeaeb2` / `#85bfb6`) · radius 100 · px26 py14 · SF Pro Semibold 17/17 · backdrop-blur 12 · drop 2겹(`0 12px 14px rgba(94,115,112,.16)` + `0 2px 2px rgba(94,115,112,.08)`) · inset 2겹(`0 -1px 0 rgba(94,115,112,.05)` + `0 1.5px 0 rgba(255,255,255,.9)`)** 는 **사용자 실측 보고를 옮긴 `[인용]`** 이며 이 세션에서 `get_design_context` 로 재확인하지 못했다. 구현 전 design-agent 가 선언을 직접 조회한다 (`rules/frontend.md` §6-2 ①·② — 렌더 픽셀이 아니라 `fill` 을, Style 이름이 아니라 **인스턴스가 실제로 그리는 겹**을 본다).
> ⚠️ **대비** — `#aeaeb2` 위 흰 라벨은 **약 2.19:1** `[계산: 상대 휘도 0.4292]` 로 WCAG AA 미달이다. **`D-01` 수용 예외의 범위 밖**이다 — `D-01` 은 *"`--color-action-primary-bg` 위 흰 라벨에 한정"* 이고 `#aeaeb2` 는 `grays/gray-2` 다 (`docs/decisions/stage-0-approvals.md` §3). **별도 사용자 결정이 필요**하다 (stage-4-plan §14.2 `N4-25`).

---

## 2. Figma 누락 — PRD Route/화면에 대응하는 Frame 없음

"조합 가능" = 기존 Figma 컴포넌트 조합으로 레이아웃은 구성할 수 있다는 의미일 뿐, **디자인 확정은 아니다**.

**디자인 소스 결정 규칙 — CONFIRMED (사용자 결정 2026-09-14, C-13)**: 아래 누락 화면은 해당 Stage 의 plan/design 단계에서 Orchestrator 가 화면마다 사용자에게 ① 디자이너에게 Figma 디자인 요청 ② design-agent 명세 작성 중 무엇으로 할지 묻고, 승인 후에만 디자인·구현한다 (M-06·M-07·M-16·M-20 해소). 예외: "공통 상태" 행은 #22 로 design-agent 명세 Stage 1 선구현이 이미 결정됨 (`가값 (P-10)`).

| Route (PLANNING §9.2) | 화면 / 상태 | PRD | Figma 상태 | 기존 컴포넌트로 조합 가능? | 착수 전 필요 Stage |
|---|---|---|---|---|---|
| `/auth/forgot-password`, `/auth/reset-password` | 비밀번호 재설정 요청·메일 안내·새 비밀번호 | FR-01, §6.2 | **Figma 누락** (링크 `179:1843` 만 존재) | 부분 가능: TopBar + FieldGroup + Button + 안내 텍스트. 메일 발송 완료/링크 만료 상태는 누락 | 2 |
| `/auth/consent` | 보호자 동의 **5항목** — 필수 ① 이용약관 ② 개인정보처리방침 ③ 아동 음성·성장 데이터 처리 보호자 동의(별도 체크), 선택 ④ 마케팅 수신, 추가 ⑤ 파일럿(베타) 참여 동의 (필수/선택·문구 = 법무 L-02). 각 동의는 문서 버전과 함께 기록. **이메일·Google·Apple 모든 가입 경로가 가입 직후 같은 동의 화면을 거친다**. 동의 뒤 VPC 단계 슬롯 (방식 법무 L-01, Stage 2 는 Mock). 동의 철회 UI 없음 | FR-02, §7.1 | **Figma 누락** (`179:1745` 단일 체크박스만 — 디자이너 수정 요청) | 부분 가능: CheckboxGroup + TextLink(문서 보기) | 2 — CONFIRMED (사용자 결정 2026-09-14, C-1·C-2·C-3·C-4), 디자인 소스 C-13 |
| `/onboarding/:step` = `child-info` · `temperament` · `books` · `goals` (slug RECOMMENDED, PLANNING §9.2) | PRD 5단계 중 Step 1–4: Step 1 아이 정보(이름 = 성·이름 두 칸 D-03, 성별 선택 C-7, 생년월 + 관계·언어 환경·독서 루틴), Step 2 기질 카드, Step 3 책 검색·집 책 리스트·주제 태그, Step 4 성장 목표. 중도 저장·복귀 (FR-03). 가입 전 체험 응답은 기기 로컬 draft, 동의 후 서버 전송 (C-12) | FR-03, §7.2 | **부분 누락** — Step 1 의 이름·성별·생년월 필드는 `179:1740` 을 소스로 사용 (C-5·C-6·C-7); 나머지 Step 1 필드와 Step 2–4 는 Figma 누락 | 부분 가능: FieldGroup / SurveyQuestionCard + RadioGroup / Chip 다중선택. 책 검색 UI·태그 선택·목표 선택은 누락 | 2 — 5단계 CONFIRMED (사용자 결정 2026-09-14, C-9), 디자인 소스 C-13 |
| `/onboarding/profile` | 프로필 결과: 다이아몬드 그래프(입력 = Baseline v1 역량 점수 1.0–5.0, C-8), 강점 2·growing edge 2, 페르소나 카드, "판정 아님" 안내 | FR-04, FR-05, §7.3 | **Figma 누락** | 불가: CapabilityDiamondChart·PersonaCard 컴포넌트 없음 | 2 — 디자인 소스 C-13 (M-07) → **Stage 6 (`D6-1`) design-agent 명세 DRAFT** `docs/design/stage-6-design-spec.md` §2.1 (재방문 모드 `/settings/profile` §2.2 포함) — 승인 대기. 2026-11-14 재조회: Figma 프레임 여전히 0 |
| `/onboarding/growth-capability` | 발전 역량 제시 + 다이아몬드 축 탭 변경 | FR-06 | **Figma 누락** | 불가 (차트 없음) | 2 — 디자인 소스 C-13 (M-07) → **Stage 6 (`D6-1`·`D6-6`) design-agent 명세 DRAFT** — 설정 `/settings/growth-capability` 와 같은 컴포넌트 2모드, Spec §2.3 — 승인 대기 |
| `/cards/:cardId/context` | Context 선택 (지금/잠자리 전/하원 후/주말 아침/차 안/직접 시간) + 시간 선택 | FR-08, §7.4 | **Figma 누락** (`86:538` 결과 chip "Bedtime · 9:00 PM" 만) | 부분 가능: Sheet + Chip/RadioGroup. 시간 picker 누락 | 3 |
| `/` 덱 카드 종류 | 대화 전용 카드(`conversation_only`), 재독 카드(`reread_book`), 책 소진 대체 카드, 증정 신청 버튼 | §7.4, §13 | **Figma 누락** | 부분 가능: ActivityOptionCard 변형(책 표지 대신 일러스트) — 디자인 필요 | 3 |
| `/library/add` | 보유 책 직접 등록 (DB 검색 + 제목 직접 입력) | FR-23, §8.1 | **Figma 누락** | 부분 가능: FieldGroup + ListRow 검색 결과 | 3 |
| `/library/gift-requests` | 증정 신청·배송 상태 | FR-22, §13 | **Figma 누락** | 부분 가능: ListRow + Tag(status) | 3 |
| `/settings/notifications` + push 권한 안내 | 카드 갱신 시간·리마인더 요일/시간, OS 권한 사전 안내 (Stage 3 은 Web + Mock, 네이티브 Push Adapter 는 Stage 4 — #7) | FR-08, §7.8 | **Figma 누락** (iOS 26 Toggle `17:113` 만) | 부분 가능: ListGroup + Toggle. 시간 picker·권한 사전 안내 누락 | 3 — 설정 목록에 알림 설정 추가 CONFIRMED (사용자 결정 2026-09-14, C-16), 디자인 소스 C-13 |
| ~~`/session`~~ | **세션 탭 없음** — 세션은 Home Activity Card "Start Session" 과 서재 "Start Session" 에서 `/session/:sessionId` 로 진입. 진행 중 세션 복귀는 Home 에서 처리 (`session-already-active`) | FR-09, §6.1 | 해당 없음 — Figma Tab Bar 중앙은 Home(`140:2971`) | — | 범위 제외 — CONFIRMED (사용자 결정 2026-09-14, #15), **D-02** |
| `/session/:sessionId` 상태별 | ~~"Done Reading" 버튼~~ **해소** → `Submit`/`Discard` (`D4-12`, §1.4). **남은 누락**: `paused` **재개** 컨트롤(= `163:1590` 에 변형 없음, `140:2870` Resume 제거됨), 버튼 **비활성(disabled) 변형**, **Discard 확인 다이얼로그**, 녹음 경과 표시, 10분 리마인드 버블, 30분 자동 종료 안내, **Prompt 모아보기 트리거 버튼**(하단 슬롯을 Discard/Submit 이 차지) | FR-09, FR-10, FR-11, §13 | **부분 해소** — `ready`/`recording` 은 `285:1126` 으로 확정(§1.4). `paused`·disabled·안내 상태는 여전히 누락 (§5 M-26) | 부분 가능: RecordButton(Record/Pause) + `285:1445` SessionActionBar + PromptDrawer(`88:960`). **재개·비활성·확인 다이얼로그는 디자인 필요** | 4 |
| `/session/:sessionId/permission` | 마이크 권한 필요 이유 → 설정 딥링크 → "대화만 하기" | §13 | **Figma 누락** | 부분 가능: CharacterMedallion + 안내 카드 + Button 2개 | 4 |
| 대화 전용 세션 (`mode=conversation_only`) | 녹음 없는 체크리스트 모드 세션 | §7.4, §13, OAQ-16 | **Figma 누락** | 불가 (흐름 미정) | 4 |
| 업로드/오프라인 상태 | 로컬 저장 중·업로드 대기·실패·48h 안내, 크래시 복구 안내, Web 백그라운드 경고 | NFR 오프라인·안정성, §13 | **Figma 누락** | 부분 가능: InlineAlert/Banner (컴포넌트 자체 누락) | 4 |
| 회고 후 자유 후기 카드, 건너뛰기 | "피드백 카드 다음 카드" 자유 후기 | FR-12, §7.6 | **Figma 누락** (`91:715` 한 줄 입력만) | 부분 가능: TextArea + Button | 5 |
| `/session/:sessionId/feedback` + 분석 상태 | 분석 중·완료·실패·저품질 안내, 짧은 성장 피드백 (deep link 전용 — 앱 안 진입점 0, `N5-10` ⓐ) | FR-13, FR-14, §13 | **Figma 누락** — `C13-S5-1` design-agent 명세로 결정 (`D5-2` · `D5-4`) | **구현됨 (Stage 5 `S5-C`, 2026-11-09)**: Page `SessionFeedbackPage` · Layout `FullscreenLayout` · Feature `session-feedback` (`SessionFeedbackScreen` · `AnalysisStatusView`) · 완료 화면 `29:62` 상단 골격 재사용 — 닫기 `29:76` 위치 · 제목 `29:75` 타이포 · 링/아바타 `29:86`/`29:87` · 버블 `88:929`(`ShortFeedbackBubble`, 보조 줄 없음) + 상태 = `InlineAlert info` / `ErrorState` / `Spinner`. Contract `GET /v1/sessions/:sessionId/analysis` (+ `completed` 시 세션 상세 1회). 상태 11종 = Spec §2.3 표. VG: `docs/design/stage-5-visual-gap-s5c.md` | 5 |
| 프로필 업데이트 표시 | 최신 스냅샷·페르소나 변경 알림 | FR-15 | **Figma 누락** | 불가 (차트·페르소나 카드 없음) | 6 → `C13-09` 재방문 모드에 포함(`D6-1`) — Spec §2.2 UpdateNote, DRAFT 승인 대기 |
| `/progress` 미충족·지연 | 발행 기준 진행도(녹음 분·세션 수), 이월 안내, 생성 지연 | FR-16, §13 | **Figma 누락** (`110:844` 아카이브 카드에 ProgressBar 1개만) | 부분 가능: ProgressBar + Surface | 7 |
| `/progress/reports/:reportId` | 4주 리포트 상세: 다이아몬드 이전/현재 오버레이, 페르소나 히스토리, 대화 지표, 인용, 부모 피드백 요약, 하이라이트 클립 재생·만료, PDF 생성·다운로드·공유 | FR-15, FR-16, FR-17, FR-18, §7.7 | **Figma 누락** ("4-week full report" 진입 카드만) | 불가 (차트·오디오 플레이어 없음) | 7 |
| `/settings`, `/settings/notifications`, `/settings/child`, `/settings/growth-capability`, `/settings/account`, `/settings/privacy`, `/settings/data`, `/legal/*` | Home 상단 설정 아이콘 `26:44` 진입, **목록이 Stage 마다 확장**: Stage 2 로그아웃 → Stage 3 알림 설정 → Stage 6 전체 설정(아이 프로필 수정·설문 재응답·발전 역량 변경 등) → Stage 8 데이터 관리(보관 정책·세션별 녹음 삭제·전체 삭제 요청)·탈퇴 (필수) + `/settings/privacy` 동의 이력 보기 = **선택 기능 (C-19)** — 여유가 있으면 읽기 전용 목록으로 구현, 미구현이어도 QA FAIL 아님. 약관 문서. **동의 철회 UI 없음** (C-4) | §7.8, FR-01, FR-02, FR-06, FR-21 | **Figma 누락** (진입 아이콘 `26:44` 만) | 부분 가능: ListGroup + ListRow + Toggle + ConfirmDialog(#22 명세) | 2 · 3 · 6 · 8 — CONFIRMED (사용자 결정 2026-09-14, C-16, C-15, C-4). 목록 화면 디자인 소스는 Stage 마다 C-13 으로 확인 |
| Trial 시작·가입 전환 | 가입 전 체험 → 온보딩 응답은 **기기 로컬 draft** 로만 저장 → 프로필 저장 시 가입 → 동의(C-2) → 서버 전송. 다른 기기 이어하기·익명 계정 없음 | FR-24 | **Figma 누락** | 부분 가능: 가입 유도 안내 + 기존 Auth 화면 재사용 | 2 — CONFIRMED (사용자 결정 2026-09-14, C-12), 디자인 소스 C-13 |
| 공통 상태 | Loading(skeleton/spinner), Empty, Error + Retry, Offline 배너, Toast, Confirm Dialog, 권한 거부 | rules/frontend §7 | **Figma 누락** (전 화면 성공 상태만) | 기존 토큰·컴포넌트만으로 design-agent 명세 작성 | 1 — **design-agent 명세로 Stage 1 선구현** CONFIRMED (사용자 결정 2026-09-14, #22), 화면 `가값 (P-10)` |
| `/auth/welcome` Apple 로그인 | Apple 로그인 버튼 | FR-01, §7.1 | **Figma 누락** | Apple 공식 가이드 버튼 사용 (디자인 불필요) | 2 — CONFIRMED (사용자 결정 2026-09-14, C-13, #21) |

---

## 3. PRD 근거 없는 Figma 요소

사용자 결정이 난 항목은 행에 표기했다. 나머지는 **NEEDS DECISION** 이며 채택하지 않으면 해당 요소는 구현하지 않는다.

| Figma 요소 | Node | 내용 | 영향 |
|---|---|---|---|
| Pilot 참여 동의 | `179:1745` | "…and to taking part in the pilot." | **채택** — 동의 5항목 중 ⑤ 파일럿(베타) 참여 동의로 분리, 필수/선택·문구는 법무 L-02. CONFIRMED (사용자 결정 2026-09-14, C-1) (M-02 해소) |
| 책 저장 / My Saved | `86:245` "Save to my shelf", `86:372` "Save", `145:1157` "My Saved" | 책 북마크 | LibraryBook.saved, 저장 API (contracts 없음) |
| 다회차 읽기 계획 | `145:1143` "Reading now", `145:1144` "3 of 5 nights", `145:1152` "Last read Tue · 12 min" | 책별 N박 읽기 진행도 | reading plan 데이터 모델 없음 |
| 책 평점 | `109:511` 등 "Rated 4.5" | 책 단위 평점 | PRD는 세션 회고 별점만 (FR-12) |
| 주간 Progress 리포트 | `31:102`, `110:522` | 주간 합계, "+18% vs last week", 요일별 막대, 월 달력 출석, 주별 분, longest streak, "80% of nights read" | 주간 지표 contract 없음, 비교 표현 (M-10, M-12) |
| 리포트 이메일 발송 | `110:861` | "we'll email it too" | M-11 |
| 세션 중 Prompt 버블 | `139:2803` (`Bubble Type3 88:838`) | "Try this prompt !" + Prompt 5개 | ⭐ **✅ 채택 — CONFIRMED (사용자 결정 2026-10-13, `D4-14`)**. ready 버블은 **Figma 그대로**이며 pill 본문은 서버 `prompts` 값이다. PRD §7.5(자동 제시 금지 · 버블 2가지 제한)와 충돌하므로 **PRD 수정 대상 7건** — `stage-4-plan.md` §0.7. ~~`D4-6`(미채택)~~ 철회 (M-25 **해소**) |
| Prompt 페이지/단계 태그 | `Pagetag1–3 139:2410–2412`, `PromptPill` 내 PRE/POST/P.6 | 읽기 전/후/페이지 번호에 묶인 Prompt | Prompt 데이터에 phase/page 필드 필요 (M-29) |
| Discard / Submit 버튼 | `163:1618`, `163:1620` (→ `285:1445`) | 세션 녹음 폐기·제출 [S][M] | **✅ 채택 — CONFIRMED (사용자 결정 2026-10-13, `D4-12`)**. Submit = 제출 + Toast + `29:62` 이동 · Discard = 폐기 + 홈 복귀 (§1.4). **PRD 수정 대상** — FR-09 · §5.2 · §7.5 · §12.2 (2026-10-13 반영). 녹음 폐기는 **전이표·로컬 삭제 시점에 영향**한다 → ⭐ **확정 (`D4-13`, 2026-10-13)**: `recording → abandoned` · `paused → abandoned` **2행 추가**(actor `caregiver`, modes `['recorded']`), **enum 신규 0**. 귀결: **방치와 사용자 폐기를 구분할 수 없다** (`docs/decisions/stage-4-approvals.md` §1.1) |
| 홈 버블을 CTA로 사용 | `88:922` "Tap me when the selection is done" | 캐릭터 버블 탭으로 진행 | PRD 버블은 텍스트 커뮤니케이션 (세션 시작·종료) |
| 책장 역량 라벨 "Confidence" | `This Week's Shelf 113:1992` | 4대 역량 외 라벨 | **4대 역량 표시 라벨로 교체** — CONFIRMED (사용자 결정 2026-09-14, #14) (M-13 해소). Figma 수정은 디자이너 요청 |
| "Alternative" / "Today's pick" 캡션 | `86:516`, `Cardtitle 85:592` | 추천/대안 표시 | PRD 덱 = 오늘의 추천 + 대안 2장 → 근거는 있음, 문구만 결정 |
| 설문 카드 되돌리기 | `179:1804` (refresh icon) | 답변 초기화/이전 카드 복귀로 추정 [M] | 동작 정의 필요 |
| 템플릿 잔존 컴포넌트 | `Activity Card 17:57` ("Morning Walk · 32 min · 2.4 km"), `Tab 17:25` / `Tab Bar 17:26` (Today/Week/Month), `Button Icon=swape 148:1595` | DS 템플릿 데모 | **PRD "Activity Card" 와 이름 충돌** → 구현 제외, Figma 정리 권장 |

---

## 4. Screen-to-Screen Flow

### 4.1 확인 가능 범위

- Figma MCP는 prototype reactions를 반환하지 않는다 → **Figma 기준 흐름은 확인 불가**.
- 아래는 frame 이름·화면 내 CTA 문구 [S] 와 로컬 프로토타입 앵커 [P] 로만 추론한 것이다.

| From | Trigger (Figma 요소) | To | 근거 | 신뢰도 |
|---|---|---|---|---|
| `179:1701` Sign up | "Sign up with email" | `179:1724` Create account | [P] `HARU Signup & Baseline Survey.dc.html` `href="#1b"` | 중 |
| `179:1701` | "Log in" | `179:1820` Log in | [P] `href="#1f"` | 중 |
| `179:1701` | "Continue with Google" / Apple | Figma 경로 없음 → **결정된 흐름: `/auth/consent` → VPC 슬롯 `/auth/verify-parent`(Mock) → `/onboarding`** | CONFIRMED (사용자 결정 2026-09-14, C-2·C-3) | 결정 |
| `179:1724` | "Create account" | Prototype: `179:1748` Survey intro → **결정된 흐름: `/auth/consent` → VPC 슬롯 `/auth/verify-parent`(Mock) → `/onboarding`** | [P] `href="#1c"` / C-2 | 결정 |
| `179:1748` | "Start the questions" | Prototype: `179:1770` Survey cards → **결정된 흐름: Step 1 `child-info` → `temperament` → `books` → `goals` → `capability-items` (`179:1770`)** (slug RECOMMENDED, PLANNING §9.2) | [P] `href="#1d"` / C-9 | 결정 |
| `179:1770` | 10번째 카드 완료 | `179:1809` Baseline saved | [P] `href="#1e"` | 중 |
| `179:1809` | "Get Started →" | Prototype: `26:21` Home → **결정된 흐름: `/onboarding/profile` → `/onboarding/growth-capability` → Home** (PRD §5.1 ③④, 화면 디자인 소스 C-13) | [P] / C-9·C-13 (M-07) | 결정 (화면은 C-13) |
| `179:1820` | back / "Create an account" | `179:1701` | [P] `href="#1a"` | 중 |
| `179:1820` | "Forgot password?" | 확인 불가 (대상 frame 없음) | — | — |
| `26:21` Home | 덱 카드 "Start Session" | `28:51` Session | frame 이름·CTA 문구 [S] | 낮음 |
| `30:74` / `145:1132` Library | 책 시트 "Start Session" | `28:51` Session | [P] `HARU Library 2a (Standalone2).html` `href="#1b"` | 중 |
| `28:51` Session | **`Submit`** (`163:1620`, `285:1445`) | `29:62` Complete — **+ "녹음 제출됨" Toast** | **CONFIRMED (사용자 결정 2026-10-13, `D4-12`)** | 결정 |
| `28:51` Session | **`Discard`** (`163:1618`, `285:1445`) | **`26:21` Home (`/`)** — 녹음 폐기 | **CONFIRMED (사용자 결정 2026-10-13, `D4-12`)** | 결정 |
| `29:62` | "Save" / close | 확인 불가 (Home 복귀 추정) | — | — |
| Tab Bar `25:87` | Library / Home / Progress | `30:74` / `26:21` / `31:102` | Tab Bar variant Active 값 [DC] + CONFIRMED (사용자 결정 2026-09-14, #15, D-02) | 결정 |
| `26:21` | 설정 아이콘 `26:44` | `/settings` 목록 (Stage 2 로그아웃부터 확장, frame 없음 → 디자인 소스 C-13) | CONFIRMED (사용자 결정 2026-09-14, C-16) | 결정 (화면은 C-13) |
| `110:522` | "4-week full report" / "Download PDF" | 확인 불가 (상세 frame 없음) | — | — |

### 4.2 PRD 상위 플로우 대비 공백

PRD §5.1: ① 가입 → ② 온보딩 → ③ 프로필 → ④ 발전 역량 → ⑤ Activity Card → ⑥ 세션 → ⑦ 피드백 → ⑧ 리포트

| 단계 | Figma | 공백 |
|---|---|---|
| ① | `179:1701`, `179:1724`(보호자 영역), `179:1820` | 동의 화면 5항목·전 경로 공통 (C-1·C-2), VPC 슬롯 (C-3), Apple = 공식 가이드 버튼 (C-13), 비밀번호 재설정 (C-13) |
| ② | `179:1748`, `179:1740`(Step 1 필드), `179:1770`, `179:1809` | Step 1 누락 필드·Step 2–4 (C-9·C-13), Step 5 비채점 옵션 (C-8), 중도 저장 복귀 안내, 가입 전 로컬 draft (C-12) |
| ③ ④ | 없음 | 전체 누락 — 디자인 소스 C-13 |
| ⑤ | `26:21`, `163:2648`, `86:*` | Context 선택, 대화 전용/재독 카드 |
| ⑥ | `28:51` (+ `88:960`, `163:1601`) | 상태별 화면, 권한·오프라인·업로드 |
| ⑦ | `29:62` | 자유 후기, 분석 상태, 짧은 피드백 |
| ⑧ | `31:102`, `110:522` (주간) | 4주 리포트 상세·미충족·PDF·클립 |

---

## 5. PRD ↔ Figma 불일치 (node 단위 확인·보정)

### 5.1 PLANNING §6 M-01 … M-24 확인 결과

| # | 항목 | PRD (섹션/ID) | Figma (node) | 검증 | 확인 결과 (불일치 여부·보정) | 영향 | 결정 |
|---|---|---|---|---|---|---|---|
| M-01 | 동의 구조 | §7.1, FR-02 | `179:1742` 체크박스 1개 + `179:1745` "I agree to the Terms of Service and Privacy Policy, and to taking part in the pilot.". 추가로 **Google 경로 `179:1709` 는 체크박스 없이 `179:1722` "By continuing you agree to our Terms and Privacy Policy." 문구만** | [S] [DC] | **불일치 확인 + 보정**: 이메일·Google 두 경로 모두 아동 음성 보호자 동의 별도 체크 없음 | Critical (COPPA, FR-02) | **Resolved** — 동의 5항목 분리 + 모든 가입 경로 공통 동의 화면. CONFIRMED (사용자 결정 2026-09-14, C-1·C-2). 문구·파일럿 필수 여부 법무 L-02, Figma 수정 디자이너 요청 |
| M-02 | pilot 참여 동의 | 없음 | `179:1745` | [M] | 불일치 확인 | ConsentType | **Resolved** — ⑤ 파일럿(베타) 참여 동의로 추가. CONFIRMED (사용자 결정 2026-09-14, C-1). 필수/선택 법무 L-02 |
| M-03 | 온보딩 설문 | §7.2 Step 5 (5점 리커트, 역량별 동일 문항 수) | `179:1763` "About 3 minutes · 10 cards", `179:1778` "Question 1 of 10", `179:1786` "IN THE PAST TWO WEEKS", `179:1791–1803` Never/Rarely/Sometimes/Often/Almost always | [S] | **불일치 확인 + 보정**: 옵션 5개로 5점 척도 형태는 일치, 척도 의미(빈도)와 문항 수는 불일치. Baseline v1 의 비채점 "Haven't seen" 옵션은 Figma에 **없음** | 스코어링·RadioGroup 옵션 수 | **Resolved** — Baseline Survey v1 10문항, 빈도 5단계 + 비채점 "Haven't had the chance to see this yet". CONFIRMED (사용자 결정 2026-09-14, C-8), **D-04**. 6번째 옵션 디자인 소스 C-13 |
| M-04 | 설문 연령 | §3.1, §8.2 | Figma에 연령 표기 없음. `179:1740` 생년월 "March. 2023" → Tag "3yr 4mo" | [M] | Figma 자체는 중립; 예시 아이가 3세 | 문항 연령 게이팅 | **Resolved** — PRD대로 3~9세 가입 허용. CONFIRMED (사용자 결정 2026-09-14, C-10). Baseline v1 4세 이상 적합성은 기획·전문가 확인 (디자인 영향 없음) |
| M-05 | Exit 설문 | 없음 | Figma에 없음 | — | Figma 영향 없음 (문서 이슈) | — | **Resolved** — MVP 제외. CONFIRMED (사용자 결정 2026-09-14, C-11) |
| M-06 | 온보딩 Step 1–4 | §7.2, FR-03 | `179:1740` 에 아이 이름(성+이름)·성별 `Tag Not selected`·생년월만. 관계·언어 환경·독서 루틴·기질·책·목표 없음 | [S] [DC] | **불일치 확인 + 보정**: Step 1 일부가 가입 화면에 들어가 있음 (M-28) | Stage 2 설계 공백 | **Resolved** — PRD 5단계 유지 (C-9), 누락 화면 디자인 소스는 Stage 2 에서 화면별 결정. CONFIRMED (사용자 결정 2026-09-14, C-13) |
| M-07 | 프로필·페르소나·다이아몬드·발전 역량 | §7.3, FR-04/05/06 | frame 없음. `179:1809` "Get Started" → Home | [P] | **불일치 확인 + 보정**: 흐름상 ③④ 단계를 건너뜀 | Stage 2 P0 공백 | **Resolved** — 흐름은 PRD ③④ 포함, 화면 디자인 소스는 Stage 2 에서 화면별 결정. CONFIRMED (사용자 결정 2026-09-14, C-13) |
| M-08 | 내비게이션 | §6.1 (하단 서재 / 세션(중앙) / 리포트, 홈=상단 집 아이콘, 설정=상단 아이콘) | `Screen/Tab Bar 25:87` 라벨 **Library \| Home(중앙 `140:2971`, 집 아이콘) \| Progress** ; variant 이름은 Active=Home\|Library\|Report; `110:522` 비컴포넌트 탭 **Library \| Session(중앙 mic) \| Report** ; `26:21` 상단에는 워드마크 `26:39` + 설정 `26:44` (집 아이콘 없음) | [DC] [S] | **보정**: 구조가 3가지 공존 (PRD / Tab Bar 컴포넌트 / `110:522`). 설정 상단 아이콘은 일치 | 라우팅·Layout·Stage 1 BottomTabBar | **Resolved** — Figma `25:87` 채택: Library / Home(가운데) / Progress, 세션 탭 없음, `110:522` 탭바 미사용. CONFIRMED (사용자 결정 2026-09-14, #15), **D-02** |
| M-09 | Prompt 노출 시점 | §7.4, FR-07 (책 선택 후 다음 카드에 Prompt 2~3개) | **`26:21` frame 자체에는 카드가 없음** (캐릭터 + 버블 + dots). 카드는 `163:2648` (선택 전 카드마다 Prompt 4개 + PRE/POST/P.6), `86:438` (5개), `86:512`/`86:545` (2개 + 코칭 + Context), flip back `86:482` "Prompt of this book" | [S] | **보정**: Orchestrator 인벤토리의 "26:21 카드에 Prompt 2개" 는 실제로 page `8:2` `86:512/86:545`. 모든 변형이 선택 전 카드에 Prompt를 직접 노출. flip back 은 "다음 카드" 후보 | 카드 덱 상호작용·ActivityCard contract | Yes |
| M-10 | 리포트 | §7.7, FR-16 | `31:102` 주간 , `110:522` 주간 + 월 달력 + "4-week full report" 카드 + Download PDF. 두 frame 수치 불일치 (`163:2546` 5 sessions / `163:2549` 62m vs `110:543` 6 / `110:548` 72m, 둘 다 "1h 12m") | [S] [DC] | 불일치 확인 + 보정 (수치 placeholder 불일치) | 리포트 탭 IA, contracts 에 주간 지표 없음 | Yes |
| M-11 | 리포트 이메일 | 없음 | `110:861` | [M] | 불일치 확인 | 이메일 채널·PII | Yes |
| M-12 | 성장 표현 언어 | §7.7, §8.4 | `163:2612` "strong", `163:2618` "growing", `163:2624`·`163:2630` "emerging"; `163:2558` "+18% vs last week"; `110:798` "80% of nights read" | [DC] | **불일치 확인 + 보정**: 단계 라벨 외에 주간 비교·달성률 표현도 해당 | copy·지표 설계 | Yes (copy) |
| M-13 | 역량 명칭 | §4 | `163:2611` Self-Direction, `163:2617` Emotion Regulation, `163:2623` Cognitive Flexibility, `163:2629` Intrinsic Motivation ; `163:2648` 배지 "Emotion Day Day"(중복 오타), "Intrinsic Motivation Day"; `86:397` "Cognitive Flexibility Day"; `110:817/824/1567` "Emotion words / Cognitive words / Motivation words"; `113:1992` 책장 캡션 Emotion / Resilience / **Confidence** | [DC] | **보정**: 한 파일 안에서 4가지 표기 + 4대 역량 외 "Confidence" | contracts enum 라벨·CapabilityBadge | **Resolved** — 표시 라벨 = Growth themes `31:102` 명칭 (Emotion Regulation · Self-Direction · Cognitive Flexibility · Intrinsic Motivation), "Confidence" 교체, 짧은 표기는 design-agent 정리 (COMPONENT_MAP CapabilityBadge). CONFIRMED (사용자 결정 2026-09-14, #14). Figma 수정 디자이너 요청. `110:522` "… words" 표기는 M-10 에 종속 |
| M-14 | 서재 개념 | FR-20 | `145:1143/1144` Reading now · 3 of 5 nights, `145:1157` My Saved, `109:511` Rated 4.5, `86:245` Save to my shelf, `163:1625` Our curated shelf, `163:1633` Finished together | [S] | 불일치 확인. "This Week's Shelf" 는 컴포넌트 이름(`113:1993`)이며 화면 문구 아님 | PRD 외 기능 | Yes |
| M-15 | 회고 입력 | §7.6, FR-12 | `91:693` **별점 5개 있음** (4개 채움) + `91:710–714` Chip "Engaged / Big feelings / Ask Questions / Stay Focus / Tricky today" + `91:716` "Anything to talk about this time? (optional)" + `91:717` Save | [S] [DC] | **PLANNING §6 M-15 와 동기화**: 별점 존재. 칩 5개는 PRD 체크 항목 5종(반응·감정 표현·질문 여부·집중 시간·어려웠던 점)과 1:1 대응 가능. 차이는 ① 자유 후기 "다음 카드" 없음 ② 건너뛰기 명시 없음(닫기 `29:76`만) ③ 칩 = on/off (척도 아님) ④ 문구 "Stay Focus" 문법 | 영향 **낮음**으로 하향 | Yes (copy·자유 후기 카드) |
| M-16 | 소셜 로그인 | §7.1, FR-01 | `179:1709`, `179:1833` Google 만 | [S] | 불일치 확인 | App Store 4.8, FR-01 | **Resolved** — Apple 로그인 버튼은 Apple 공식 가이드 버튼 사용, 브랜드 로고는 공식 에셋만. CONFIRMED (사용자 결정 2026-09-14, C-13, #21) |
| M-17 | 읽기 시간 카피 | §1.1 | `179:1708` "Ten minutes of reading together…" | [M] | 불일치 확인 | copy | Yes |
| M-18 | 예시 이름 | §5.3 | Emma `91:692`, `88:929`; Yuna `179:1757`; **`Input 76:431` 보호자 이름 칸 "Emma, Kim" 과 `163:2803` 아이 이름 "Haru, Kim"** | [DC] | 보정: Emma가 보호자 이름으로도 쓰임 | fixture 혼동 | No (fixture 통일) |
| M-19 | 세션 탭 라벨 | §6.1 | `110:878` "Session"; 컴포넌트 탭에는 Session 없음 | [M] | M-08 로 병합 | — | **Resolved** — 세션 탭 없음, `110:522` 탭바 미사용. CONFIRMED (사용자 결정 2026-09-14, #15), **D-02** |
| M-20 | 누락 화면·상태 | 다수 | §2 표 | [M] | 불일치 확인 (§2 에 전수 목록) | Stage 2–8 | **Resolved (방식)** — 화면별 디자인 소스를 해당 Stage 에서 사용자에게 확인. CONFIRMED (사용자 결정 2026-09-14, C-13). 공통 상태는 #22 (design-agent 명세, Stage 1) |
| M-21 | 반응형 | §1.6, FR-25 | 전 frame 폭 393 | [M] | 불일치 확인 | breakpoint | **Resolved** — 전 화면 모바일 레이아웃 + 600px 이상 가운데 480px 앱 컬럼, breakpoint 600/1024, 세로 고정. CONFIRMED (사용자 결정 2026-09-14, #12) |
| M-22 | PRD 내부 반응형 시점 | FR-25 vs §14.1 | — | — | Figma 무관 | — | 디자인 규칙은 #12 로 해소. PRD 표기 정리는 plan-agent 소관 (디자인 영향 없음) |
| M-23 | 리포트 최소 세션 | §7.7 | Figma에 발행 기준 표시 없음 | — | Figma 무관 | — | **Resolved** — 녹음 세션 3회 + 누적 녹음 1시간, 저품질 세션 제외, 첫 세션 완료일부터 28일 주기. CONFIRMED (사용자 결정 2026-09-14, #17). 미충족 진행도 화면은 Stage 7 (C-13) |
| M-24 | 개발 범위 | — | — | — | **Resolved** — Frontend-only CONFIRMED (사용자 결정, 2026-09-14) | — | No (해결됨) |

### 5.2 신규 불일치 (M-25 ~)

| # | 항목 | PRD (섹션/ID) | Figma (node) | 검증 | 영향 | 결정 필요 |
|---|---|---|---|---|---|---|
| M-25 | 세션 화면 버블에 Prompt 목록 | §7.5 (버블 = 시작 인사·종료 2가지, Prompt 자동 제시 금지, "Prompt 모아보기" 로만 확인), FR-10, FR-11 | `28:51` 에 `139:2803` Bubble Type3 "Try this prompt !" + PromptPill 5개. PRD 준비 인사와 일치하는 `Bubble Type=sessopn 88:757` 은 미배치 | [S] [DC] | 세션 준비 상태 화면 구성, 콘텐츠 안전(버블 템플릿) | ⭐ **✅ 해소 — Figma 채택 (사용자 결정 2026-10-13, `D4-14`)**. ready 버블 = **`139:2803` 그대로**, pill 본문 = 서버 `prompts`. ~~`D4-6`(버블 = `88:757`, Prompt = Drawer 전용)~~ **철회**. **PRD 수정 대상 7건** → `stage-4-plan.md` §0.7. 잔여: 인사 문구 노출 지점(`N4-32`) |
| M-26 | 세션 컨트롤 상태 혼합 | FR-09 (녹음 버튼 → "읽기 완료" 전환, Pause/Resume), §7.5 | **(2026-10-12 이전)** `28:51` 에 RecordButton "Tap to recording"(idle) `163:1591` 과 "Resume" 버튼 `140:2870` 동시 배치; "Done Reading" 없음; Pause 는 loose `163:1601`; "Discard" `163:1618` / "Submit" `163:1620` loose; Prompt 모아보기 트리거 없음 (`88:960` 컴포넌트만) | [S] | RecordingController 상태별 UI 정의 불가 → ~~Stage 4 차단~~ | **✅ 주요 부분 해소 — 2026-10-13 Figma 갱신 + `D4-12`.** 디자이너가 section **`285:1126`** 을 추가하면서 ① **`140:2870` Resume 를 `28:51` 에서 제거**하고 ② **`285:1445` After_record(Discard · Submit)** 를 프레임 안에 배치했으며 ③ 사용자가 **`ready`/`recording` 상태 전환과 Discard·Submit 의 도착 화면을 확정**했다 (§1.4). **"Stage 4 차단" 판정은 해소**된다. **잔여 3건**(차단 아님, `C13-14` 디자이너 요청 대상): ⓐ `paused` **재개** 컨트롤 ⓑ 버튼 **disabled 변형** ⓒ **Discard 확인 다이얼로그** 유무. 추가 쟁점: **하단 슬롯을 Discard/Submit 이 차지**하므로 PRD §7.5 의 "Prompt 모아보기" 보조 버튼 진입점이 **여전히 없다**(`C13-4`) |
| M-27 | Google 가입 경로 동의 | FR-02, §7.1 ("보호자 동의 미체크 시 가입 진행 불가") | `179:1709` + `179:1722` 수동 동의 문구 | [S] | OAuth 계정 생성 후 동의 화면 필수 (ARCHITECTURE §7.3.1 Guard 1) → `/auth/consent` 디자인 필요 | **Resolved** — 이메일·Google·Apple 모든 가입 경로가 가입 직후 같은 동의 화면을 거친다. CONFIRMED (사용자 결정 2026-09-14, C-1·C-2). 화면 디자인 소스 C-13 |
| M-28 | 가입 화면에서 아이 정보 수집 | §7.2 Step 1 "이름(닉네임)", NFR 최소 수집, ARCHITECTURE §7.3 | `179:1740` "Child's last name \| first name" "Haru, Kim", 성별, 생년월 | [DC] | 동의 기록 전 아동 PII 입력, **성(last name) 수집은 최소 수집 원칙과 충돌** | **Resolved** — 가입 화면은 보호자 정보만, 아이 정보는 동의 후 온보딩 Step 1 (C-5). 아이 이름은 성·이름 두 칸 유지, 화면 호칭은 first name 만 (C-6). CONFIRMED (사용자 결정 2026-09-14, C-5·C-6), **D-03** (PRD 와 다름, 법무 L-07) |
| M-29 | Prompt 단계/페이지 태그 | §8.2 (질문 + 코칭 + Follow-up, 역량×연령×책) | `Pagetag1–3 139:2410–2412` PRE / POST / P.6 , `163:2648`, `145:1132`, `88:960` | [S] | Prompt 데이터에 `phase`(pre/during/post)·`pageRef` 필요 여부 → contracts·콘텐츠 제작 범위 | Yes |
| M-30 | 홈 화면 구성 | §7.4 (역량 배지, 추천 책·이유, 코칭 문장, Context 선택, streak, 이번 주 세션 수, 지난 세션 하이라이트 한 줄) | `26:21`: 카드 미배치, `88:922` "Please, select the book first! / Tap me when the selection is done", `26:43` "12-day/115 Min". `163:2648` 카드에 코칭 문장·Context 없음 (`86:512` 에만 있음) | [M] | 홈 IA 확정 불가, HomeSummary 필드(누적 분) | Yes (design) |
| M-31 | 덱 카드별 역량 | §7.4 "오늘의 역량 배지" (하루 1개 목표 역량), §8.3 역량 순환 | `163:2648` 카드 3장이 각각 Self-Direction / Emotion Day / Intrinsic Motivation Day | [S] | `ActivityCard.targetCapability`(카드 단위 1개) vs option 단위 역량 | **✅ 해소 — `D-5` · `D-22` (2026-10-03, `stage-3-approvals.md` §8 · §9)** — 역량은 **카드(option)마다 다르다** → `options[].capability` 가 정본이고 `ActivityCard.targetCapability` 는 **삭제**된다. 왼쪽 미결 기술은 과거 기록으로 보존. 배지 라벨의 " Day" 는 `N-3` 폐기 |
| M-32 | 세션 시작 진입점 | §7.4 (Activity Card → 세션), FR-23 (보유 책 자유 선택) | 서재 시트 `145:1132`, `163:1669` 에서 바로 "Start Session" (Context 선택 없음) | [S] [P] | Context 없는 세션 허용 여부 (`CreateSession.readingContext` nullable 은 이미 허용) | **Partially resolved (#15: 세션 시작 위치)** — 세션은 Home Activity Card·서재 "Start Session" 에서 시작, 세션 탭 없음 (CONFIRMED (사용자 결정 2026-09-14, #15), D-02). **Context 선택 없이 세션을 시작할 수 있는지는 NEEDS DECISION (Stage 3)** |
| M-33 | 텍스트·비텍스트 대비 | §11 접근성 WCAG AA | Accent Button 흰 라벨 on `accents/teal` 2.07:1 (`17:12`), Tag 흰 글자 1.56–1.86:1 (`76:439–445`), `text-secondary` on 배경 2.00–3.29:1, 진행 바 fill↔track 1.73–1.94:1 (배경 위치별), 제안된 secondary(`text-button` 계열)도 glass 위 비선택 Tab 라벨에서 4.48:1 로 미달 | [DC] 계산 | 거의 모든 CTA·배지·캡션 AA 미달 → 토큰 조정 없이는 NFR 불충족 | **Resolved (결정 반영)** — 주요 버튼 흰 라벨 현재 색 유지 CONFIRMED (사용자 결정 2026-09-14, #18-①), **D-01**. 보조 텍스트·비텍스트·배지 글자·focus 는 디자이너 대기 → `가값 (P-01)`·`가값 (P-02)`·`가값 (P-03)` 로 진행 (DESIGN_SYSTEM §12.1) |
| M-34 | 포커스·키보드 상태 | §11 WCAG AA (rules/frontend §9) | 모든 컴포넌트에 focus 상태 없음; Button 은 Hover 있음 `17:6/17:14` | [DC] | Stage 1 Shared UI 에 focus 토큰 신규 필요 | **Resolved (결정 반영)** — focus 토큰 이름 CONFIRMED (#10), 컴포넌트 focus 상태는 design-agent 명세로 Stage 1 구현 (#22). 값 `가값 (P-03)`, 화면 `가값 (P-10)` |
| M-35 | 책 표지·캐릭터 에셋 권리 | §8.1 (표지 메타데이터), NFR | 실제 출판 표지 `145:929–145:1010`, `163:2531–2534` (Where the Wild Things Are, Grumpy Monkey, The Most Magnificent Idea 등); 캐릭터 `163:2529/2530/2536`, 아바타 `163:2528` | [M] | 표지 사용권, 캐릭터 소유권·상업 이용 확인 필요 (PLANNING R-09/R-10) | **Resolved** — 캐릭터·책 표지 모두 바로 사용 (사용자 확인: 권리 확보됨). CONFIRMED (사용자 결정 2026-09-14, C-17). 최적화 포맷은 Stage 1 Plan |
| M-36 | Placeholder 데이터 불일치 | — | 표지 ↔ 제목 불일치 (`113:1992` "The Most Magnificent Idea" 표지에 "The Color Monster"), Prompt 문구 잘림 "…How" 반복 (`88:838`), 리포트 수치 불일치 (M-10) | [S] | Visual QA 기준 화면으로 fixture 복사 금지 | No (보고) |
| M-37 | 템플릿 컴포넌트 이름 충돌 | §7.4 "Activity Card" | `Activity Card 17:57` = "Morning Walk" 데모 | [S] | 개발자 혼동 | No (Figma 정리 권장) |
| M-38 | 성별 입력 필수 여부 | §7.2 "성별(선택)" | `Tag Color=Not selected 163:2798` 기본값 | [DC] | "선택 안 함" 을 명시적으로 허용해야 함 — 방향 일치, 문구·옵션(Boy/Girl 외) 결정 | **Resolved** — 선택 항목, 옵션 Girl / Boy / Prefer not to say, 기본값 선택 안 함, 미응답 진행 가능 (contracts `girl`·`boy`·`prefer_not_to_say`, 미응답 `null`). 필드 위치는 온보딩 Step 1 (C-5). CONFIRMED (사용자 결정 2026-09-14, C-7) |
