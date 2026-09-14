# HARU Figma Screen Map

Status: DRAFT v2 — Stage 0 산출물 (critic 리뷰 반영 + Frontend-only 정렬, 2026-09-14), 사용자 승인 대기
Based on: Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` (page `16:2` MVP_KeyScreen_V.2, page `8:2` Design Guide — 2026-09-14 확인), PRD v1.4, `PLANNING.md` (§6, §9), `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md` (DRAFT 2026-09-14, 개정본 포함 §7.3.1 consent guard); Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `CLAUDE.md`, `.claude/rules/frontend.md` §1·§5, `.claude/rules/qa.md`
Author: design-agent (2026-09-14)

라벨: `CONFIRMED` = PRD / Figma / 사용자 결정으로 확정 (ARCHITECTURE 라벨 정의와 동일) · `RECOMMENDED` = 권장안(승인 필요) · `NEEDS DECISION` = 사용자/디자이너/법무 결정 필요

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
| `16:2` MVP_KeyScreen_V.2 | section `31:204` HARU · Home & Session Screens | `26:21`, `28:51`, `29:62`, `30:74`, `163:1669`, `145:1132`, `31:102`, `110:522`, `163:2648` + loose `86:438`, `86:482`, `163:1601`, `163:1618`, `163:1620`, `78:353`, `91:627`, `91:628` | 모든 frame [S]; `26:21`, `28:51`, `29:62`, `31:102` [DC]; loose instance [S] (`91:627/628` 은 [DC] `29:62` 내부 Select로 확인) |
| `16:2` | section `179:1700` Signup & Baseline survey | `179:1701`, `179:1724`, `179:1748`, `179:1770`, `179:1809`, `179:1820` | 모두 [S]; `179:1724`, `179:1770` [DC] |
| `8:2` Design Guide | `17:366` Foundations, `17:367` HARU Components, `17:368` iOS 26 Components, loose `86:512`, `86:545`, 이미지 에셋 | 컴포넌트 세트는 COMPONENT_MAP 참조 | section 3개 [S], 주요 component set [S], `17:20`, `25:87`, `76:440` [DC] |

- 모든 화면 frame 폭은 **393px** (높이 852 또는 스크롤 frame 1103/1105/1752). 태블릿·데스크톱 frame 없음 (검증 [M]).
- `110:522` 은 layer 이름이 `div` / `span` / `div.haru-pressable` 인 **HTML→Figma import frame** 이다 [M][S]. Component instance가 아니며 Tab Bar도 컴포넌트가 아니다.
- 화면 frame 이름의 번호 체계가 section마다 겹친다 (`1a · Home` vs `1a · Sign up`, `1b · Session` vs `1b · Create account`). 이 문서에서는 node id로만 식별한다.
- **Prototype 연결(Reactions)은 Figma MCP로 노출되지 않는다.** `get_metadata` / `get_design_context` 응답에 interaction 정보 없음 → 화면 간 흐름은 §4에서 frame 이름 + 로컬 프로토타입 앵커로만 추론하며 "확인 불가"를 명시한다.

---

## 1. Screen Map (Figma frame → Route → … → Stage)

Route는 `PLANNING.md` §9.2 제안을 기준으로 하며, M-08(내비게이션) 결정 전까지 **RECOMMENDED** 이다.
Component 이름은 `docs/COMPONENT_MAP.md` 의 제안 이름. API/Data는 `docs/API_CONTRACTS.md` 의 endpoint/schema 이름 (`…Request/ResponseSchema` 접미사 생략).

**Frontend-only (CONFIRMED)**: 모든 API/Data 는 API client interface → Mock Adapter 로 호출한다. 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 등 interface + Mock 구현이며 **Supabase JS 를 직접 사용하지 않는다** (rules/frontend §1). 실제 Backend 가 있어야만 검증되는 동작은 `BACKEND_INTEGRATION_PENDING` 이며 디자인 차단 요인이 아니다. **Mock scenario key 의 유일한 기준은 `docs/API_CONTRACTS.md` §5.4** 이다. `docs/FRONTEND_IMPLEMENTATION_PLAN.md` 는 화면을 그 key 에 매핑하며 Stage 번호의 기준이다.

### 1.1 Signup & Baseline survey (`179:1700`)

| Figma Frame | Route | Page | Feature(s) | Reusable Components (variant) | API / Data | PRD IDs | Stage |
|---|---|---|---|---|---|---|---|
| `179:1701` "1a · Sign up" [S] | `/auth/welcome` | WelcomePage | `auth` | CharacterMedallion(size=lg, asset=hello-heart), Button(variant=glass, leadingIcon=google) `179:1709`, Button(variant=accent, leadingIcon=mail) `179:1715`, TextLink("Log in"), LegalFootnote(text) `179:1722` | AuthGateway.signInWithProvider('google') (interface + Mock Adapter) → `GET /v1/me` (Me) → `Me.consentStatus.missing` 이 있으면 `/auth/consent` 로 Guard (ARCHITECTURE §7.3.1, M-27). 수동 고지 문구 `179:1722` 는 동의 기록 아님 | FR-01, FR-02(약관 문구만), FR-24 | 2 |
| `179:1724` "1b · Create account" [S][DC] | `/auth/sign-up` | SignUpPage | `auth`, `consent` | IconButton(icon=back), SectionLabel("YOU"/"YOUR CHILD"), FieldGroup(rows=3: name·email·password+ShowToggle) = Input `boxcount=Line_3`, FieldGroup(child name + SelectTrigger(gender) `Tag Color=Not selected`, birth month + Tag(tone=cyan, "3yr 4mo")) = Input `boxcount2/badge`, HelperText, Checkbox(checked) `179:1742`, Button(accent, size=lg) `179:1746` | AuthGateway.signUpWithEmail (interface + Mock Adapter) → 필수 동의 `POST /v1/consents` (RecordConsents) **성공 응답 후에만** 아이 정보 전송. 그 전까지 YOUR CHILD 입력은 **클라이언트 로컬 draft** 로만 보관 → 동의 성공 후 `PUT /v1/onboarding/steps/child_info` (SaveOnboardingStep). 동의 전 호출은 Mock 도 `CONSENT_REQUIRED` 반환. 성(last name) 필드·가입 화면 배치는 NEEDS DECISION (ARCHITECTURE §7.3.1, M-27/M-28) | FR-01, FR-02, FR-03(Step1 일부) | 2 |
| `179:1748` "1c · Survey intro" [S] | `/onboarding` | OnboardingIntroPage | `onboarding-survey` | CharacterMedallion(size=md, asset=headphones), Surface(material=strong, radius=card) 소개 카드, InfoRow(icon=clock/"About 3 minutes · 10 cards"), InfoRow(icon=list/"Swipe each card…"), Button(accent, lg) | `GET /v1/onboarding` (OnboardingState: instrument, currentStep) | FR-03 | 2 |
| `179:1770` "1d · Survey cards" [S][DC] | `/onboarding/:step` (step=`capability_items`) | OnboardingStepPage | `onboarding-survey` | TopBar(leading=IconButton back, title="Question 1 of 10", trailing=IconButton forward), ProgressBar(value=1/10), SwipeDeck(stack depth 3), SurveyQuestionCard(counter, eyebrow "IN THE PAST TWO WEEKS", question), RadioGroup(variant=card, 5 options), IconButton(icon=refresh) `179:1804` | `PUT /v1/onboarding/steps/capability_items` (SaveOnboardingStep) | FR-03(Step 5 — 문항 체계 M-03) | 2 |
| `179:1809` "1e · Baseline saved" [S] | `/onboarding/saved` | OnboardingSavedPage | `onboarding-survey` | CharacterIllustration(asset=hello-heart) `179:1819`, Title(text), Button(accent, lg, trailingIcon=arrow-right) `179:1814` | `POST /v1/onboarding/submit` (SubmitOnboarding → ProfileResult) | FR-03, FR-04(산출 트리거) | 2 |
| `179:1820` "1f · Log in" [S] | `/auth/log-in` | LogInPage | `auth` | IconButton(back), CharacterMedallion(md, headphones), Button(glass, google), DividerWithLabel("or with email"), FieldGroup(rows=2 email·password+ShowToggle) = Input `boxcount=Line_2`, TextLink("Forgot password?") `179:1843`, Button(accent, lg), TextLink("Create an account") | AuthGateway.signInWithEmail / signInWithProvider → `GET /v1/me` | FR-01 | 2 |

### 1.2 Home & Session (`31:204`)

| Figma Frame | Route | Page | Feature(s) | Reusable Components (variant) | API / Data | PRD IDs | Stage |
|---|---|---|---|---|---|---|---|
| `26:21` "1a · Home — Today's Activity Card" [S][DC] | `/` | HomePage | `activity-card-deck`, `book-selection` | AppHeader(page-only: wordmark `26:39` + StreakChip(days, minutes) `26:40` + IconButton(icon=settings) `26:44`), CharacterIllustration(asset=home-character) `26:22`, CharacterBubble(tail=bottom-right; Bubble/Home/Onlysession `88:922`), PageIndicator(count=3) `88:903` (+ 중복 `27:85` Deck Dots), BottomTabBar(active=home) `27:89` | `GET /v1/children/:childId/home` (HomeSummary: streakDays, sessionsThisWeek), `GET /v1/children/:childId/activity-cards/today` (ActivityCard) | FR-07, §7.4 보조 요소(streak·이번 주 세션 수), §6.1 | 3 |
| `163:2648` "Activity card" (1134px 가로 탐색 frame, 화면 아님) [S] | `/` 의 카드 덱 영역 | HomePage | `activity-card-deck` | ActivityOptionCard(density=full, face=front) ×3 (`Prompt Card/Home` instances `163:2649–2651`), CapabilityBadge(capability, suffix="Day"), PromptPill(phaseTag=PRE/POST/P.6) ×4, ActionBar(Button glass "Save" + Button accent "Start Session") | ActivityCard.options[3]{kind, book, reason}, `POST /v1/activity-cards/:cardId/selection` (SelectActivityOption → ActivityCardSelection.promptSet) | FR-07, §7.9(카드 덱) | 3 |
| `86:438` Prompt Card/Home (loose, size=Max) [S] | `/` 덱 카드 (front) | HomePage | `activity-card-deck` | ActivityOptionCard(full, front, prompts=5) | ActivityCardSelection.promptSet | FR-07 | 3 |
| `86:482` Prompt Card/Home (loose, flip=back "Prompt of this book") [S] | `/cards/:cardId/prompts` 또는 카드 flip 상태 | HomePage (flip) / ActivityPromptsPage | `book-selection` | ActivityOptionCard(face=back): PromptPill(phaseTag) + CoachingNote(tone=neutral, 긴 설명) 반복 | `GET /v1/books/:bookId/prompts` (BookPrompts) 또는 ActivityCardSelection.promptSet.coachingLine/followUps | FR-07(“다음 카드”에 Prompt), FR-20 | 3 |
| `86:512` / `86:545` Prompt Card/Min/Emotion·Resilience (page `8:2` loose) [S][M] | `/` 덱 카드 (compact) | HomePage | `activity-card-deck`, `reading-context` | ActivityOptionCard(density=compact): CapabilityBadge(빈 라벨 pink) + "Alternative" 캡션, BookSummary(cover, title, author, reason), CoachingNote("Remember tonight"), PromptPill ×2, ReadingContextChip("Bedtime · 9:00 PM"), Button(accent "Start Session") | ActivityCard.options[].coachingLine, SelectActivityOption.readingContext | FR-07, FR-08 | 3 |
| `28:51` "1b · Session — Ready / Recording" [S][DC] | `/session/:sessionId` | StorytimeSessionPage | `storytime-session`, `recording`, `prompt-drawer` | CharacterMedallion(asset=avatar-medallion `163:2528`, ring) `28:73/28:74`, CharacterBubble(Type3 — PromptPill ×5, "Try this prompt !") `139:2803`, RecordButton(state=idle, "Tap to recording") `163:1591`, Button(accent, "Resume") `140:2870` | `POST /v1/sessions` (CreateSession → SessionSummary.bubble, prompts), `POST /v1/sessions/:sessionId/transitions` (SessionTransition to=recording/paused/completed) | FR-09, FR-10, FR-11 | 4 |
| `163:1601` Record Control (loose, Pause) [S] | `/session/:sessionId` (recording 상태) | StorytimeSessionPage | `recording` | RecordButton(state=recording, icon=pause) | RecordingController 상태 (클라이언트 전용) | FR-09 | 4 |
| `163:1618` "Discard" / `163:1620` "Submit" Button (loose) [S] | `/session/:sessionId` (용도 불명) | — | `recording` | Button(accent, width=281) | — (PRD 근거 없음 → §3) | — | 4 (결정 후) |
| `78:353` "Frame 7" (loose Title) [S] | `/session/:sessionId` 상단 후보 | StorytimeSessionPage | `storytime-session` | TopBar(variant=pill, leading=IconButton back, title=BookTitlePill(thumb, title)) = `Title Titla type=two` | SessionSummary.book | FR-09 | 4 |
| `29:62` "1c · Session — Complete & Feedback" [S][DC] | 상단: `/session/:sessionId/complete` · 하단 카드: `/session/:sessionId/reflection` (Figma는 한 frame) | SessionCompletePage / ReflectionPage | `storytime-session`, `reflection` | TopBar(title="Session Complete", trailing=IconButton close) `29:76`, AttendanceStickerChip `29:79`, CharacterMedallion(sm) `29:86/87`, CharacterBubble(variant=centered, title+subtitle) `88:929`, ReflectionCard `91:691` = StarRating(5) `91:693` + Chip(selectable) ×5 `91:710–714` + TextField(outline, single-line) `91:715` + Button(accent "Save") `91:717` | SessionTransitionResult (completionBubble, stickerAward), `GET /v1/reflection-form` (ReflectionFormDefinition), `POST /v1/sessions/:sessionId/reflection` (SubmitReflection) | FR-10, FR-12, FR-19 | 4 (상단) / 5 (카드) |
| `30:74` "2a · Library — Bookshelf & History/Defult shelf" (1103px 스크롤) [S] | `/library` | LibraryPage | `library` | PageTitle("Library"), StreakChip(variant=star) `30:93`, SectionHeader(title, action="See all"), BookShelfCarousel(This Week's Shelf Default `113:1994`) + PageIndicator, BookShelfCarousel(“Finished together”, 중복) `145:779`, SectionHeader + BookList(BookListRow ×4) `Book List 163:2145`, BottomTabBar(active=library) `40:218` | `GET /v1/children/:childId/library?filter=owned\|gifted\|history` (Paginated<LibraryBook>) | FR-20, FR-22 | 3 |
| `163:1669` Library + "Deemed" 시트 [S] | `/library` + 시트 상태 ("See all" 시트 — 라우트화 여부 NEEDS DECISION) | LibraryPage | `library` | Scrim `163:1807`, Sheet(title="Our curated shelf", trailing icon) = Prompt Card/Home `type=shelf` `163:2347`: BookList + ActionBar(Save, Start Session) | `GET /v1/children/:childId/library` | FR-20, FR-22 | 3 |
| `145:1132` Library — Book Select [S] | `/library/books/:bookId` (시트) | BookDetailSheet (LibraryPage 위) | `library`, `book-selection` | ReadingNowCard("Reading now · 3 of 5 nights", ProgressBar) `145:1141`, Scrim `145:1450`, ActivityOptionCard(full, front) `145:1085` = CapabilityBadge + BookSummary + PromptPill(PRE/POST/P.6) + ActionBar(Save, Start Session) | `GET /v1/books/:bookId/prompts` (BookPrompts), `POST /v1/sessions` (CreateSession mode=recorded, bookId/childBookId) | FR-20, FR-23, FR-09(진입) | 3 |
| `31:102` "2b · Report — Weekly Growth" (1105px) [S][DC] | `/report` | ReportOverviewPage | `growth-report` | PageTitle("Progress"), SelectTrigger(chip, "May 4 – 10") `31:118`, CharacterIllustration(asset=bookworm) `163:2642`, StatTile ×2 `163:2545/2548`, WeeklyReadingCard(bar chart, collapse IconButton) `163:2551`, GrowthThemesCard = CapabilityProgressRow ×4 `163:2607`, NotableQuoteCard ("Moment of the week") `163:2633`, BottomTabBar(active=report) `40:339` | `GET /v1/children/:childId/reports/overview` (ReportOverview) — **주간 지표 필드 없음** (§5 M-10, plan-agent 보고) | FR-16(?), FR-04(다이아몬드 아님) | 7 |
| `110:522` "div" (HTML import, 1752px) [S][M] | `/report` (확장안) | ReportOverviewPage | `growth-report`, `report-pdf` | 위 + AttendanceCalendar(“May 2026 · 8 nights”), MinutesPerWeekBars, StatTile ×3, ReportArchiveCard("4-week full report", ProgressBar, Button accent "Download PDF"), FootnoteText("Next report on Jun 7 · we'll email it too."), 비컴포넌트 Tab Bar(Library \| Session(center mic) \| Report) | ReportOverview.currentCycle/archive, `POST /v1/reports/:reportId/pdf` (ReportPdfStatus) | FR-16, FR-17 | 7 |

### 1.3 비화면 컴포넌트 중 화면 역할을 하는 것

| Figma node | 추정 역할 | Route / 위치 | 근거 | Stage |
|---|---|---|---|---|
| `88:960` Prompt Card/Session [S] | **Prompt 모아보기 Drawer** (grabber, "Prompts of this session", "Just read one aloud when feels right - no rush.", PromptPill 캐러셀 + 설명, PageIndicator) | `/session/:sessionId` 위 Sheet | PRD §7.5 "Prompt 모아보기" 와 역할 일치. 화면에 배치되거나 트리거 버튼이 있는 frame은 없음 | 4 |
| `88:757` Bubble Type=sessopn [S] | 세션 준비 인사 버블 ("Ready for today's story with Emma? Tap record and I'll quietly keep your storytime.") | `/session/:sessionId` ready | PRD §7.5 준비 상태 문구와 일치하나 `28:51` 에는 Type3(Prompt 목록)가 배치됨 (M-25) | 4 |
| `50:176` Bubble Type=Type2 [S] | 홈 인사 버블 ("Hi! Ready for Emma's story tonight? Tap me to say hi") | `/` | `26:21` 에는 다른 문구의 Bubble/Home/Onlysession | 3 |

---

## 2. Figma 누락 — PRD Route/화면에 대응하는 Frame 없음

"조합 가능" = 기존 Figma 컴포넌트 조합으로 레이아웃은 구성할 수 있다는 의미일 뿐, **디자인 확정은 아니다** (디자이너 승인 필요).

| Route (PLANNING §9.2) | 화면 / 상태 | PRD | Figma 상태 | 기존 컴포넌트로 조합 가능? | 착수 전 필요 Stage |
|---|---|---|---|---|---|
| `/auth/forgot-password`, `/auth/reset-password` | 비밀번호 재설정 요청·메일 안내·새 비밀번호 | FR-01, §6.2 | **Figma 누락** (링크 `179:1843` 만 존재) | 부분 가능: TopBar + FieldGroup + Button + 안내 텍스트. 메일 발송 완료/링크 만료 상태는 누락 | 2 |
| `/auth/consent` | 보호자 동의(필수 3 + 선택 1, 별도 체크), 문서 버전, Google 가입 경로 동의 | FR-02, §7.1 | **Figma 누락** (`179:1745` 단일 체크박스만) | 부분 가능: Checkbox 그룹 + TextLink(문서 보기). 동의 설명 레이아웃·법무 문구는 결정 필요 | 2 |
| `/onboarding/:step` = child_info · temperament · books · goals | Step 1–4 (관계, 언어 환경, 독서 루틴, 기질 카드, 책 검색·집 책 리스트·주제 태그, 성장 목표) | FR-03, §7.2 | **Figma 누락** (`179:1740` 에 아이 이름·성별·생년월만) | 부분 가능: SurveyQuestionCard + RadioGroup / Chip 다중선택. 책 검색 UI·태그 선택·목표 선택은 누락 | 2 |
| `/onboarding/profile` | 프로필 결과: 다이아몬드 그래프, 강점 2·growing edge 2, 페르소나 카드, "판정 아님" 안내 | FR-04, FR-05, §7.3 | **Figma 누락** | 불가: CapabilityDiamondChart·PersonaCard 컴포넌트 없음 | 2 |
| `/onboarding/growth-capability` | 발전 역량 제시 + 다이아몬드 축 탭 변경 | FR-06 | **Figma 누락** | 불가 (차트 없음) | 2 |
| `/cards/:cardId/context` | Context 선택 (지금/잠자리 전/하원 후/주말 아침/차 안/직접 시간) + 시간 선택 | FR-08, §7.4 | **Figma 누락** (`86:538` 결과 chip "Bedtime · 9:00 PM" 만) | 부분 가능: Sheet + Chip/RadioGroup. 시간 picker 누락 | 3 |
| `/` 덱 카드 종류 | 대화 전용 카드(`conversation_only`), 재독 카드(`reread_book`), 책 소진 대체 카드, 증정 신청 버튼 | §7.4, §13 | **Figma 누락** | 부분 가능: ActivityOptionCard 변형(책 표지 대신 일러스트) — 디자인 필요 | 3 |
| `/library/add` | 보유 책 직접 등록 (DB 검색 + 제목 직접 입력) | FR-23, §8.1 | **Figma 누락** | 부분 가능: FieldGroup + ListRow 검색 결과 | 3 |
| `/library/gift-requests` | 증정 신청·배송 상태 | FR-22, §13 | **Figma 누락** | 부분 가능: ListRow + Tag(status) | 3 |
| `/settings/notifications` + push 권한 안내 | 카드 갱신 시간·리마인더 요일/시간, OS 권한 사전 안내 | FR-08, §7.8 | **Figma 누락** (iOS 26 Toggle `17:113` 만) | 부분 가능: ListGroup + Toggle. 시간 picker·권한 사전 안내 누락 | 3 |
| `/session` | 세션 탭 진입 (진행 중 세션 복귀 / 오늘 카드로 시작) | FR-09, §6.1 | **Figma 누락** — Figma Tab Bar 중앙은 Home(`140:2971`) | 결정 필요 (M-08) | 3–4 |
| `/session/:sessionId` 상태별 | ready / recording / paused 분리 화면, "Done Reading" 버튼, Pause·Resume, 녹음 경과 표시, 10분 리마인드 버블, 30분 자동 종료 안내, Prompt 모아보기 트리거 버튼 | FR-09, FR-10, FR-11, §13 | **Figma 누락** (`28:51` 은 상태 혼합, §5 M-26) | 부분 가능: RecordButton(Record/Pause) + Button + PromptDrawer(`88:960`). 버튼 배치·상태 전환은 디자인 필요 | 4 |
| `/session/:sessionId/permission` | 마이크 권한 필요 이유 → 설정 딥링크 → "대화만 하기" | §13 | **Figma 누락** | 부분 가능: CharacterMedallion + 안내 카드 + Button 2개 | 4 |
| 대화 전용 세션 (`mode=conversation_only`) | 녹음 없는 체크리스트 모드 세션 | §7.4, §13, OAQ-16 | **Figma 누락** | 불가 (흐름 미정) | 4 |
| 업로드/오프라인 상태 | 로컬 저장 중·업로드 대기·실패·48h 안내, 크래시 복구 안내, Web 백그라운드 경고 | NFR 오프라인·안정성, §13 | **Figma 누락** | 부분 가능: InlineAlert/Banner (컴포넌트 자체 누락) | 4 |
| 회고 후 자유 후기 카드, 건너뛰기 | "피드백 카드 다음 카드" 자유 후기 | FR-12, §7.6 | **Figma 누락** (`91:715` 한 줄 입력만) | 부분 가능: TextArea + Button | 5 |
| `/session/:sessionId/feedback` + 분석 상태 | 분석 중·완료·실패 재시도 중·저품질 안내, 짧은 성장 피드백 | FR-13, FR-14, §13 | **Figma 누락** | 부분 가능: CharacterBubble + Surface | 5 |
| 프로필 업데이트 표시 | 최신 스냅샷·페르소나 변경 알림 | FR-15 | **Figma 누락** | 불가 (차트·페르소나 카드 없음) | 6 |
| `/report` 미충족·지연 | 발행 기준 진행도(녹음 분·세션 수), 이월 안내, 생성 지연 | FR-16, §13 | **Figma 누락** (`110:844` 아카이브 카드에 ProgressBar 1개만) | 부분 가능: ProgressBar + Surface | 7 |
| `/report/:reportId` | 4주 리포트 상세: 다이아몬드 이전/현재 오버레이, 페르소나 히스토리, 대화 지표, 인용, 부모 피드백 요약, 하이라이트 클립 재생·만료, PDF 생성·다운로드·공유 | FR-15, FR-16, FR-17, FR-18, §7.7 | **Figma 누락** ("4-week full report" 진입 카드만) | 불가 (차트·오디오 플레이어 없음) | 7 |
| `/settings`, `/settings/child`, `/settings/growth-capability`, `/settings/account`, `/settings/privacy`, `/settings/data`, `/legal/*` | 설정 셸, 프로필 수정·설문 재응답, 발전 역량 변경, 계정·로그아웃·탈퇴, 동의 이력 보기(RECOMMENDED), 보관 정책·세션별 녹음 삭제·전체 삭제 확인, 약관 문서. **동의 철회는 PRD·Figma 근거 없음 → 범위 외 (NEEDS DECISION, OAQ-08·법무)** | §7.8, FR-01, FR-02, FR-06, FR-21 | **Figma 누락** (진입 아이콘 `26:44` 만) | 부분 가능: ListGroup + ListRow + Toggle + ConfirmDialog(누락) | 6 (설정 셸·프로필·발전 역량) · 데이터 관리(FR-21)·동의 이력·탈퇴 = carry-over **NEEDS DECISION — Stage 8 유지 vs Stage 6 설정 작업으로 이동** |
| Trial 시작·가입 전환 | 가입 전 체험 → 프로필 저장 시 가입 유도 | FR-24 | **Figma 누락** | 결정 #10 후 | 2 |
| 공통 상태 | Loading(skeleton/spinner), Empty, Error + Retry, Offline 배너, Toast, Confirm Dialog, 권한 거부 | rules/frontend §7 | **Figma 누락** (전 화면 성공 상태만) | 불가 — Stage 1 Shared UI 로 패턴 정의 필요 | 1 |

---

## 3. PRD 근거 없는 Figma 요소

채택 여부는 모두 **NEEDS DECISION**. 채택하지 않으면 해당 요소는 구현하지 않는다.

| Figma 요소 | Node | 내용 | 영향 |
|---|---|---|---|
| Pilot 참여 동의 | `179:1745` | "…and to taking part in the pilot." | ConsentType 추가 (M-02) |
| 책 저장 / My Saved | `86:245` "Save to my shelf", `86:372` "Save", `145:1157` "My Saved" | 책 북마크 | LibraryBook.saved, 저장 API (contracts 없음) |
| 다회차 읽기 계획 | `145:1143` "Reading now", `145:1144` "3 of 5 nights", `145:1152` "Last read Tue · 12 min" | 책별 N박 읽기 진행도 | reading plan 데이터 모델 없음 |
| 책 평점 | `109:511` 등 "Rated 4.5" | 책 단위 평점 | PRD는 세션 회고 별점만 (FR-12) |
| 주간 Progress 리포트 | `31:102`, `110:522` | 주간 합계, "+18% vs last week", 요일별 막대, 월 달력 출석, 주별 분, longest streak, "80% of nights read" | 주간 지표 contract 없음, 비교 표현 (M-10, M-12) |
| 리포트 이메일 발송 | `110:861` | "we'll email it too" | M-11 |
| 세션 중 Prompt 버블 | `139:2803` (`Bubble Type3 88:838`) | "Try this prompt !" + Prompt 5개 | PRD §7.5 자동 제시 금지와 충돌 (M-25) |
| Prompt 페이지/단계 태그 | `Pagetag1–3 139:2410–2412`, `PromptPill` 내 PRE/POST/P.6 | 읽기 전/후/페이지 번호에 묶인 Prompt | Prompt 데이터에 phase/page 필드 필요 (M-29) |
| Discard / Submit 버튼 | `163:1618`, `163:1620` | 세션 녹음 폐기·제출로 추정 [S] | 녹음 폐기 = 삭제 흐름·동의 정책 영향 |
| 홈 버블을 CTA로 사용 | `88:922` "Tap me when the selection is done" | 캐릭터 버블 탭으로 진행 | PRD 버블은 텍스트 커뮤니케이션 (세션 시작·종료) |
| 책장 역량 라벨 "Confidence" | `This Week's Shelf 113:1992` | 4대 역량 외 라벨 | M-13 |
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
| `179:1701` | "Continue with Google" | 확인 불가 (OAuth 후 동의·온보딩 경로 없음) | — | — |
| `179:1724` | "Create account" | `179:1748` Survey intro | [P] `href="#1c"` | 중 |
| `179:1748` | "Start the questions" | `179:1770` Survey cards | [P] `href="#1d"` | 중 |
| `179:1770` | 10번째 카드 완료 | `179:1809` Baseline saved | [P] `href="#1e"` | 중 |
| `179:1809` | "Get Started →" | `26:21` Home | [P] `href="HARU Home & Session.dc.html"` — **PRD ③ 프로필·④ 발전 역량 단계 건너뜀** (M-07) | 중 |
| `179:1820` | back / "Create an account" | `179:1701` | [P] `href="#1a"` | 중 |
| `179:1820` | "Forgot password?" | 확인 불가 (대상 frame 없음) | — | — |
| `26:21` Home | 덱 카드 "Start Session" | `28:51` Session | frame 이름·CTA 문구 [S] | 낮음 |
| `30:74` / `145:1132` Library | 책 시트 "Start Session" | `28:51` Session | [P] `HARU Library 2a (Standalone2).html` `href="#1b"` | 중 |
| `28:51` Session | Done Reading (버튼 없음) | `29:62` Complete | frame 번호 순서 (1b → 1c) [M] | 낮음 |
| `29:62` | "Save" / close | 확인 불가 (Home 복귀 추정) | — | — |
| Tab Bar | Library / Home / Progress | `30:74` / `26:21` / `31:102` | Tab Bar variant Active 값 [DC] | 중 |
| `26:21` | 설정 아이콘 `26:44` | 확인 불가 (설정 frame 없음) | — | — |
| `110:522` | "4-week full report" / "Download PDF" | 확인 불가 (상세 frame 없음) | — | — |

### 4.2 PRD 상위 플로우 대비 공백

PRD §5.1: ① 가입 → ② 온보딩 → ③ 프로필 → ④ 발전 역량 → ⑤ Activity Card → ⑥ 세션 → ⑦ 피드백 → ⑧ 리포트

| 단계 | Figma | 공백 |
|---|---|---|
| ① | `179:1701`, `179:1724`, `179:1820` | 동의 화면, Apple, 비밀번호 재설정 |
| ② | `179:1748`, `179:1770`, `179:1809` | Step 1–4, 중도 저장 복귀 안내 |
| ③ ④ | 없음 | 전체 누락 |
| ⑤ | `26:21`, `163:2648`, `86:*` | Context 선택, 대화 전용/재독 카드 |
| ⑥ | `28:51` (+ `88:960`, `163:1601`) | 상태별 화면, 권한·오프라인·업로드 |
| ⑦ | `29:62` | 자유 후기, 분석 상태, 짧은 피드백 |
| ⑧ | `31:102`, `110:522` (주간) | 4주 리포트 상세·미충족·PDF·클립 |

---

## 5. PRD ↔ Figma 불일치 (node 단위 확인·보정)

### 5.1 PLANNING §6 M-01 … M-24 확인 결과

| # | 항목 | PRD (섹션/ID) | Figma (node) | 검증 | 확인 결과 (불일치 여부·보정) | 영향 | 결정 필요 |
|---|---|---|---|---|---|---|---|
| M-01 | 동의 구조 | §7.1, FR-02 | `179:1742` 체크박스 1개 + `179:1745` "I agree to the Terms of Service and Privacy Policy, and to taking part in the pilot.". 추가로 **Google 경로 `179:1709` 는 체크박스 없이 `179:1722` "By continuing you agree to our Terms and Privacy Policy." 문구만** | [S] [DC] | **불일치 확인 + 보정**: 이메일·Google 두 경로 모두 아동 음성 보호자 동의 별도 체크 없음 | Critical (COPPA, FR-02) | Yes (법무·디자인) |
| M-02 | pilot 참여 동의 | 없음 | `179:1745` | [M] | 불일치 확인 | ConsentType | Yes |
| M-03 | 온보딩 설문 | §7.2 Step 5 (5점 리커트, 역량별 동일 문항 수) | `179:1763` "About 3 minutes · 10 cards", `179:1778` "Question 1 of 10", `179:1786` "IN THE PAST TWO WEEKS", `179:1791–1803` Never/Rarely/Sometimes/Often/Almost always | [S] | **불일치 확인 + 보정**: 옵션 5개로 5점 척도 형태는 일치, 척도 의미(빈도)와 문항 수는 불일치. Baseline v1 의 비채점 "Haven't seen" 옵션은 Figma에 **없음** | 스코어링·RadioGroup 옵션 수 | Yes |
| M-04 | 설문 연령 | §3.1, §8.2 | Figma에 연령 표기 없음. `179:1740` 생년월 "March. 2023" → Tag "3yr 4mo" | [M] | Figma 자체는 중립; 예시 아이가 3세 | 문항 연령 게이팅 | Yes |
| M-05 | Exit 설문 | 없음 | Figma에 없음 | — | Figma 영향 없음 (문서 이슈) | — | Yes (plan) |
| M-06 | 온보딩 Step 1–4 | §7.2, FR-03 | `179:1740` 에 아이 이름(성+이름)·성별 `Tag Not selected`·생년월만. 관계·언어 환경·독서 루틴·기질·책·목표 없음 | [S] [DC] | **불일치 확인 + 보정**: Step 1 일부가 가입 화면에 들어가 있음 (M-28) | Stage 2 설계 공백 | Yes (design) |
| M-07 | 프로필·페르소나·다이아몬드·발전 역량 | §7.3, FR-04/05/06 | frame 없음. `179:1809` "Get Started" → Home | [P] | **불일치 확인 + 보정**: 흐름상 ③④ 단계를 건너뜀 | Stage 2 P0 공백 | Yes (design) |
| M-08 | 내비게이션 | §6.1 (하단 서재 / 세션(중앙) / 리포트, 홈=상단 집 아이콘, 설정=상단 아이콘) | `Screen/Tab Bar 25:87` 라벨 **Library \| Home(중앙 `140:2971`, 집 아이콘) \| Progress** ; variant 이름은 Active=Home\|Library\|Report; `110:522` 비컴포넌트 탭 **Library \| Session(중앙 mic) \| Report** ; `26:21` 상단에는 워드마크 `26:39` + 설정 `26:44` (집 아이콘 없음) | [DC] [S] | **보정**: 구조가 3가지 공존 (PRD / Tab Bar 컴포넌트 / `110:522`). 설정 상단 아이콘은 일치 | 라우팅·Layout·Stage 1 BottomTabBar | Yes |
| M-09 | Prompt 노출 시점 | §7.4, FR-07 (책 선택 후 다음 카드에 Prompt 2~3개) | **`26:21` frame 자체에는 카드가 없음** (캐릭터 + 버블 + dots). 카드는 `163:2648` (선택 전 카드마다 Prompt 4개 + PRE/POST/P.6), `86:438` (5개), `86:512`/`86:545` (2개 + 코칭 + Context), flip back `86:482` "Prompt of this book" | [S] | **보정**: Orchestrator 인벤토리의 "26:21 카드에 Prompt 2개" 는 실제로 page `8:2` `86:512/86:545`. 모든 변형이 선택 전 카드에 Prompt를 직접 노출. flip back 은 "다음 카드" 후보 | 카드 덱 상호작용·ActivityCard contract | Yes |
| M-10 | 리포트 | §7.7, FR-16 | `31:102` 주간 , `110:522` 주간 + 월 달력 + "4-week full report" 카드 + Download PDF. 두 frame 수치 불일치 (`163:2546` 5 sessions / `163:2549` 62m vs `110:543` 6 / `110:548` 72m, 둘 다 "1h 12m") | [S] [DC] | 불일치 확인 + 보정 (수치 placeholder 불일치) | 리포트 탭 IA, contracts 에 주간 지표 없음 | Yes |
| M-11 | 리포트 이메일 | 없음 | `110:861` | [M] | 불일치 확인 | 이메일 채널·PII | Yes |
| M-12 | 성장 표현 언어 | §7.7, §8.4 | `163:2612` "strong", `163:2618` "growing", `163:2624`·`163:2630` "emerging"; `163:2558` "+18% vs last week"; `110:798` "80% of nights read" | [DC] | **불일치 확인 + 보정**: 단계 라벨 외에 주간 비교·달성률 표현도 해당 | copy·지표 설계 | Yes (copy) |
| M-13 | 역량 명칭 | §4 | `163:2611` Self-Direction, `163:2617` Emotion Regulation, `163:2623` Cognitive Flexibility, `163:2629` Intrinsic Motivation ; `163:2648` 배지 "Emotion Day Day"(중복 오타), "Intrinsic Motivation Day"; `86:397` "Cognitive Flexibility Day"; `110:817/824/1567` "Emotion words / Cognitive words / Motivation words"; `113:1992` 책장 캡션 Emotion / Resilience / **Confidence** | [DC] | **보정**: 한 파일 안에서 4가지 표기 + 4대 역량 외 "Confidence" | contracts enum 라벨·CapabilityBadge | Yes |
| M-14 | 서재 개념 | FR-20 | `145:1143/1144` Reading now · 3 of 5 nights, `145:1157` My Saved, `109:511` Rated 4.5, `86:245` Save to my shelf, `163:1625` Our curated shelf, `163:1633` Finished together | [S] | 불일치 확인. "This Week's Shelf" 는 컴포넌트 이름(`113:1993`)이며 화면 문구 아님 | PRD 외 기능 | Yes |
| M-15 | 회고 입력 | §7.6, FR-12 | `91:693` **별점 5개 있음** (4개 채움) + `91:710–714` Chip "Engaged / Big feelings / Ask Questions / Stay Focus / Tricky today" + `91:716` "Anything to talk about this time? (optional)" + `91:717` Save | [S] [DC] | **PLANNING §6 M-15 와 동기화**: 별점 존재. 칩 5개는 PRD 체크 항목 5종(반응·감정 표현·질문 여부·집중 시간·어려웠던 점)과 1:1 대응 가능. 차이는 ① 자유 후기 "다음 카드" 없음 ② 건너뛰기 명시 없음(닫기 `29:76`만) ③ 칩 = on/off (척도 아님) ④ 문구 "Stay Focus" 문법 | 영향 **낮음**으로 하향 | Yes (copy·자유 후기 카드) |
| M-16 | 소셜 로그인 | §7.1, FR-01 | `179:1709`, `179:1833` Google 만 | [S] | 불일치 확인 | App Store 4.8, FR-01 | Yes (design) |
| M-17 | 읽기 시간 카피 | §1.1 | `179:1708` "Ten minutes of reading together…" | [M] | 불일치 확인 | copy | Yes |
| M-18 | 예시 이름 | §5.3 | Emma `91:692`, `88:929`; Yuna `179:1757`; **`Input 76:431` 보호자 이름 칸 "Emma, Kim" 과 `163:2803` 아이 이름 "Haru, Kim"** | [DC] | 보정: Emma가 보호자 이름으로도 쓰임 | fixture 혼동 | No (fixture 통일) |
| M-19 | 세션 탭 라벨 | §6.1 | `110:878` "Session"; 컴포넌트 탭에는 Session 없음 | [M] | M-08 로 병합 | — | Yes |
| M-20 | 누락 화면·상태 | 다수 | §2 표 | [M] | 불일치 확인 (§2 에 전수 목록) | Stage 2–8 | Yes (design) |
| M-21 | 반응형 | §1.6, FR-25 | 전 frame 폭 393 | [M] | 불일치 확인 | breakpoint | Yes |
| M-22 | PRD 내부 반응형 시점 | FR-25 vs §14.1 | — | — | Figma 무관 | — | Yes (plan) |
| M-23 | 리포트 최소 세션 | §7.7 | Figma에 발행 기준 표시 없음 | — | Figma 무관 | — | Yes (plan) |
| M-24 | 개발 범위 | — | — | — | **Resolved** — Frontend-only CONFIRMED (사용자 결정, 2026-09-14) | — | No (해결됨) |

### 5.2 신규 불일치 (M-25 ~)

| # | 항목 | PRD (섹션/ID) | Figma (node) | 검증 | 영향 | 결정 필요 |
|---|---|---|---|---|---|---|
| M-25 | 세션 화면 버블에 Prompt 목록 | §7.5 (버블 = 시작 인사·종료 2가지, Prompt 자동 제시 금지, "Prompt 모아보기" 로만 확인), FR-10, FR-11 | `28:51` 에 `139:2803` Bubble Type3 "Try this prompt !" + PromptPill 5개. PRD 준비 인사와 일치하는 `Bubble Type=sessopn 88:757` 은 미배치 | [S] [DC] | 세션 준비 상태 화면 구성, 콘텐츠 안전(버블 템플릿) | Yes |
| M-26 | 세션 컨트롤 상태 혼합 | FR-09 (녹음 버튼 → "읽기 완료" 전환, Pause/Resume), §7.5 | `28:51` 에 RecordButton "Tap to recording"(idle) `163:1591` 과 "Resume" 버튼 `140:2870` 동시 배치; "Done Reading" 없음; Pause 는 loose `163:1601`; "Discard" `163:1618` / "Submit" `163:1620` loose; Prompt 모아보기 트리거 없음 (`88:960` 컴포넌트만) | [S] | RecordingController 상태별 UI 정의 불가 → Stage 4 차단 | Yes (design) |
| M-27 | Google 가입 경로 동의 | FR-02, §7.1 ("보호자 동의 미체크 시 가입 진행 불가") | `179:1709` + `179:1722` 수동 동의 문구 | [S] | OAuth 계정 생성 후 동의 화면 필수 (ARCHITECTURE §7.3.1 Guard 1) → `/auth/consent` 디자인 필요 | Yes (법무·디자인) |
| M-28 | 가입 화면에서 아이 정보 수집 | §7.2 Step 1 "이름(닉네임)", NFR 최소 수집, ARCHITECTURE §7.3 | `179:1740` "Child's last name \| first name" "Haru, Kim", 성별, 생년월 | [DC] | 동의 기록 전 아동 PII 입력, **성(last name) 수집은 최소 수집 원칙과 충돌** | Yes (법무·디자인) |
| M-29 | Prompt 단계/페이지 태그 | §8.2 (질문 + 코칭 + Follow-up, 역량×연령×책) | `Pagetag1–3 139:2410–2412` PRE / POST / P.6 , `163:2648`, `145:1132`, `88:960` | [S] | Prompt 데이터에 `phase`(pre/during/post)·`pageRef` 필요 여부 → contracts·콘텐츠 제작 범위 | Yes |
| M-30 | 홈 화면 구성 | §7.4 (역량 배지, 추천 책·이유, 코칭 문장, Context 선택, streak, 이번 주 세션 수, 지난 세션 하이라이트 한 줄) | `26:21`: 카드 미배치, `88:922` "Please, select the book first! / Tap me when the selection is done", `26:43` "12-day/115 Min". `163:2648` 카드에 코칭 문장·Context 없음 (`86:512` 에만 있음) | [M] | 홈 IA 확정 불가, HomeSummary 필드(누적 분) | Yes (design) |
| M-31 | 덱 카드별 역량 | §7.4 "오늘의 역량 배지" (하루 1개 목표 역량), §8.3 역량 순환 | `163:2648` 카드 3장이 각각 Self-Direction / Emotion Day / Intrinsic Motivation Day | [S] | `ActivityCard.targetCapability`(카드 단위 1개) vs option 단위 역량 | Yes |
| M-32 | 세션 시작 진입점 | §7.4 (Activity Card → 세션), FR-23 (보유 책 자유 선택) | 서재 시트 `145:1132`, `163:1669` 에서 바로 "Start Session" (Context 선택 없음) | [S] [P] | Context 없는 세션 허용 여부 (`CreateSession.readingContext` nullable 은 이미 허용) | Yes (확인) |
| M-33 | 텍스트·비텍스트 대비 | §11 접근성 WCAG AA | Accent Button 흰 라벨 on `accents/teal` 2.07:1 (`17:12`), Tag 흰 글자 1.56–1.86:1 (`76:439–445`), `text-secondary` on 배경 2.00–3.29:1, 진행 바 fill↔track 1.73–1.94:1 (배경 위치별), 제안된 secondary(`text-button` 계열)도 glass 위 비선택 Tab 라벨에서 4.48:1 로 미달 | [DC] 계산 | 거의 모든 CTA·배지·캡션 AA 미달 → 토큰 조정 없이는 NFR 불충족 | Yes (디자인) |
| M-34 | 포커스·키보드 상태 | §11 WCAG AA (rules/frontend §9) | 모든 컴포넌트에 focus 상태 없음; Button 은 Hover 있음 `17:6/17:14` | [DC] | Stage 1 Shared UI 에 focus 토큰 신규 필요 | Yes (토큰 승인) |
| M-35 | 책 표지·캐릭터 에셋 권리 | §8.1 (표지 메타데이터), NFR | 실제 출판 표지 `145:929–145:1010`, `163:2531–2534` (Where the Wild Things Are, Grumpy Monkey, The Most Magnificent Idea 등); 캐릭터 `163:2529/2530/2536`, 아바타 `163:2528` | [M] | 표지 사용권, 캐릭터 소유권·상업 이용 확인 필요 (PLANNING R-09/R-10) | Yes (법무·운영) |
| M-36 | Placeholder 데이터 불일치 | — | 표지 ↔ 제목 불일치 (`113:1992` "The Most Magnificent Idea" 표지에 "The Color Monster"), Prompt 문구 잘림 "…How" 반복 (`88:838`), 리포트 수치 불일치 (M-10) | [S] | Visual QA 기준 화면으로 fixture 복사 금지 | No (보고) |
| M-37 | 템플릿 컴포넌트 이름 충돌 | §7.4 "Activity Card" | `Activity Card 17:57` = "Morning Walk" 데모 | [S] | 개발자 혼동 | No (Figma 정리 권장) |
| M-38 | 성별 입력 필수 여부 | §7.2 "성별(선택)" | `Tag Color=Not selected 163:2798` 기본값 | [DC] | "선택 안 함" 을 명시적으로 허용해야 함 — 방향 일치, 문구·옵션(Boy/Girl 외) 결정 | Yes (copy) |
