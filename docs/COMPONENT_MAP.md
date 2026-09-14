# HARU Component Map

Status: DRAFT v2 — Stage 0 산출물 (critic 리뷰 반영 + Frontend-only 정렬, 2026-09-14), 사용자 승인 대기
Based on: Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `8:2` section `17:367` HARU Components, `17:368` iOS 26 Components, page `16:2` 화면 instance (2026-09-14 확인), PRD v1.4, `docs/FIGMA_SCREEN_MAP.md`, `.claude/rules/frontend.md` (Frontend-only 개정본 §1·§5); Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**
Author: design-agent (2026-09-14)

라벨: `CONFIRMED` / `RECOMMENDED` / `NEEDS DECISION`. 검증 표기: [S] screenshot, [DC] design context, [M] metadata 이름만.

## 0. 원칙

- 분류 기준은 "모양이 비슷한가"가 아니라 **"동일한 역할과 API를 갖는가"** (design-agent 규칙).
  1. **Shared UI** → `packages/ui` : 도메인 지식 없음, 여러 도메인에서 같은 API.
  2. **Domain Component** → `apps/web/src/entities/*` : HARU 개념 표시, fetch·상태 전이 없음.
  3. **Feature Component** → `apps/web/src/features/*` : 사용자 행동·상태 전이·서버 상태.
  4. **Page-only** → `apps/web/src/pages/*` : 한 화면 조립 단위.
- Props는 **이름만** 제안한다 (타입·코드 없음). 모든 시각 값은 `docs/DESIGN_TOKEN_MAP.md` 토큰 참조.
- `packages/ui` 는 `@haru/contracts` 를 import 하지 않는다 (ARCHITECTURE §4) → capability 같은 도메인 enum을 받는 컴포넌트는 Domain 계층.
- Stage = 최초 필요 Stage. **단일 기준은 `docs/FRONTEND_IMPLEMENTATION_PLAN.md`** (§1.2 Shared UI 우선순위, 각 Stage §x.1 빌드 순서). 두 문서가 다르면 plan 이 우선이며 이 표를 고친다.
- Frontend-only: Feature Component 의 서버 상태는 API client interface → Mock Adapter 로만 얻는다. 인증 `AuthGateway`, 업로드 `recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 등 interface 사용, Supabase JS 직접 사용 없음 (rules/frontend §1).

---

## 1. Shared UI (`packages/ui`)

| Component (제안) | Figma source | Variants / States (Figma) | Proposed props | Used in | Stage | 비고 |
|---|---|---|---|---|---|---|
| **Surface** (HARU Material) | `17:332`, `16:24` (Glass Rest/Raised/Pressed) [S]; effect styles `HARU/Glass Rest`, `HARU/Glass Raised`, `HARU/Glass Pressed`, `HARU/Shadow Rest` | material: rest · raised · pressed; fill: glass(74%) · strong(90%) | `material`, `fill`, `radius`, `padding`, `as`, `interactive` | 거의 모든 카드·칩·Tab Bar | 1 | 카드 radius가 16/20/22/24/28/30/32 로 흩어짐 → 토큰 통합 필요 |
| **AppBackground** | 화면 frame 배경 gradient [DC] (Figma 변수 아님 → `--color-bg-app-start/mid/end`, DESIGN_TOKEN_MAP §4) | — | `variant` | 전 화면 | 1 | gradient 토큰 신규 제안 |
| **Text** | text styles `iOS 26/*` (`17:298`) + 화면의 raw 크기 | style: largeTitle … caption2, weight | `variant`, `tone`, `weight`, `as`, `truncate` | 전체 | 1 | 화면 raw size(9, 10.5, 11.5, 11.8, 12.5, 14.5, 18.5 …) 스케일 흡수 |
| **Icon** | `Icon 50:157` [S] (clock_default, clock_small, flip_to_back, flip_to_front, right, left, thumb_gold, thumb_white, attend, star, shape11, 13, home, record, reply_all) + 화면 내 비컴포넌트 SVG (settings, close, back, mail, google, pause, chevron-down, refresh, book, chart, download) | shape | `name`, `size`, `label`(a11y), `decorative` | 전체 | 1 | variant 이름 비일관(`shape11`, `13`, `swape`), 필요한 아이콘 다수가 컴포넌트 밖 → 아이콘 세트 확정 NEEDS DECISION |
| **Button** | `Button 17:20` [S][DC] (Variant=Glass\|Accent × State=Rest\|Hover\|Pressed\|Disabled), `Button/White 86:245` [S], `Button/card 86:372` [S] | variant: glass · accent; state 4종; 높이 45(기본)·56·58(화면 instance) | `variant`, `size`(md · lg), `leadingIcon`, `trailingIcon`, `fullWidth`, `loading`, `disabled`, `onPress`, `type` | `179:1709/1715/1746/1768/1814/1833/1844`, `140:2870`, `91:717`, `163:1618/1620`, 카드 ActionBar | 1 | **통합 후보 A**. focus·loading 상태 누락. Accent 라벨 대비 2.07:1 (DESIGN_SYSTEM §12) |
| **ButtonGroup / ActionBar** | `Button/card 86:372` (glass "Save" + accent "Start Session") [S] | — | `primary`, `secondary`, `layout`(inline · stacked) | 덱 카드, 책 시트 | 1 | Button 조합이므로 별도 스타일 금지 |
| **IconButton** | `Button 78:158` (Icon=Back \| Setting \| swape) [S]; 화면 내 38px 원형 glass frame `26:44`, `29:76`, `179:1726`, `179:1772`, `179:1775`, `179:1804` [DC] | icon | `icon`, `label`(필수), `variant`(glass), `size` | 헤더 전반 | 1 | 38×38 < 44pt 터치 타깃 → 시각 38 유지 + hit area 44 RECOMMENDED |
| **TopBar** | `Title 139:2734` (Titla type=Three: back + BookTitlePill + settings / two: back + pill) [S]; `78:353`; 화면 헤더 `179:1726+179:1729`, `179:1772–1778`, `29:75+29:76`, 대형 제목 `30:89` "Library", `31:117` "Progress" | variant: large · inline · centered · pill | `variant`, `title`, `leading`, `trailing`, `subtitle` | 모든 Stack/Fullscreen 화면 | 1 | **통합 후보 D** (Title types). variant 이름 오타 `Titla` |
| **BottomTabBar** | `Screen/Tab Bar 25:87` (Active=Home\|Library\|Report) [S][DC], `Tab Bar/Center 140:2971`, `110:522` 내 비컴포넌트 탭(Library\|Session\|Report) | active item; center 강조 원형 | `items`, `activeKey`, `centerItem`, `onSelect` | `26:21`, `30:74`, `31:102` | 1 | **통합 후보 C**. 항목 구성은 M-08 결정 전 **config 로 주입**. variant 이름 Report ↔ 라벨 "Progress" 불일치 |
| **SegmentedTabs** | `Tab 17:25` (Selected\|Unselected), `Tab Bar 17:26` (Today/Week/Month), `iOS 26/Segmented Control 17:122` | selected | `options`, `value`, `onChange` | 사용 화면 없음 | 보류 | 템플릿 잔존. 리포트 기간 전환 등 필요 시에만 |
| **Tag** | `Tag 76:440` (Color=green\|cyan\|pink\|purple, `*_icon` ▶Session, Boy\|Girl\|Not selected) [S][DC], `Pagetag1–3 139:2410–2412`, `Cardtitle 85:592` [S] | tone 4 + icon; size: sm(26h, 12px) · xs(19–22h, 9–12px) | `tone`, `size`, `leadingIcon`, `trailingIcon`, `label` | `163:2648`, `145:1132`, `179:1740`, `113:1991` | 1 | **통합 후보 E**. 흰 글자 대비 1.56–1.86:1 전부 미달. Boy/Girl/Not selected 는 Tag 가 아니라 SelectTrigger |
| **Chip** (selectable) | `Select 90:626` (Color=Green = selected, Transparent = unselected) [S][DC], `Button/Filter 40:316` (glass) [S], `91:627/91:628` | selected · unselected (+glass) | `selected`, `onToggle`, `label`, `variant`(filled · outline · glass), `disabled` | `29:62` 회고 칩 | 1 | **통합 후보 B**. 높이 31–34 < 44 |
| **SelectTrigger** | `Tag Color=Boy/Girl/Not selected` (chevron) [DC], `31:118` "May 4 – 10 ˅" [DC] | value / placeholder | `value`, `placeholder`, `onPress`, `size`, `label` | `179:1724`, `31:102` | 2 | 선택 UI(Sheet/picker)는 Figma 누락 |
| **FieldGroup + TextField** | `Input 76:417` (boxcount=Line_1\|Line_2\|Line_3\|boxcount2/badge) [S][DC] | 행 수, trailing action("Show"), trailing accessory(Tag) | FieldGroup: `children`; TextField: `label`, `value`, `placeholder`, `type`, `trailingAction`, `trailingAccessory`, `helperText`, `errorText`, `disabled`, `autoComplete` | `179:1724`, `179:1820` | 1 | "boxcount" variant = 행 수라서 컴포넌트 variant 가 아니라 composition 으로 풀어야 함. error·focus·disabled 누락 |
| **TextArea** | `91:715` outline 16 radius (비컴포넌트) [DC] | — | `label`, `value`, `placeholder`, `maxLength`, `rows` | `29:62` | 5 | 회고 자유 후기 |
| **PasswordToggle** | `Input` 내 "Show" `76:428` | — | `visible`, `onToggle` | Auth | 2 | TextField trailingAction 로 흡수 가능 |
| **Checkbox / CheckboxGroup** | `179:1742` 22px teal (비컴포넌트) [DC] | checked 만 존재 | `checked`, `onChange`, `label`, `description`, `required`, `error` | `179:1724` | 1 | unchecked·error·focus 누락. 동의 그룹은 Feature 에서 조합 |
| **RadioGroup** (variant=card) | `179:1788` 옵션 5개 (비컴포넌트) [DC] | selected(teal) · unselected | `options`, `value`, `onChange`, `variant`, `name` | `179:1770` | 1 | |
| **ProgressBar** | `179:1779/1780` 설문, `145:1141` 읽기 진행, `163:2613` 역량 바, `110:844` 리포트 [DC] | tone, height 6·8 | `value`, `max`, `tone`, `size`, `label`(a11y) | 온보딩·서재·리포트 | 1 | fill ↔ track 대비 1.73–1.94:1 (배경 위치별, 비텍스트 3:1 미달) |
| **PageIndicator** | `Pagenation 88:789` [DC], `Deck Dots 27:85` (SVG), `30:74`·`88:960` 내부 | active pill 20×7 + dots 7 | `count`, `index`, `onSelect`(선택) | `26:21`, `30:74`, `88:960` | 1 | **통합 후보 F** (Pagenation vs Deck Dots 중복 — `26:21` 에 둘 다 배치됨) |
| **Sheet + Scrim** | "Deemed" `163:1807`, `145:1450` [S]; grabber `88:960` | open | `open`, `onClose`, `title`, `trailing`, `snapPoints`(선택), `initialFocus` | 서재 시트, Prompt Drawer, Context 선택 | 1 | scrim 색 토큰 없음 (DESIGN_TOKEN_MAP §4) |
| **ListGroup + ListRow** | `Book List 163:2145` [S] | leading media, title, subtitle, trailing meta, chevron | `leading`, `title`, `subtitle`, `trailing`, `chevron`, `onPress` | `30:74`, `163:1669`, 설정(누락) | 3 | |
| **SectionHeader** | `30:74` "Our curated shelf · See all" [S] | — | `title`, `action` | 서재 | 3 | |
| **InfoRow** (glass pill + icon) | `179:1759`, `179:1764` [S] | — | `icon`, `text` | `179:1748` | 2 | ListRow variant 로 흡수 가능 |
| **DividerWithLabel** | `179:1839–1841` [S] | — | `label` | `179:1820` | 2 | |
| **TextLink** | "Log in", "Forgot password?", "See all", "Create an account" | — | `href`/`onPress`, `tone` | Auth, 서재 | 2 | Figma raw 링크색 대비 미달 (3.16:1, DESIGN_TOKEN_MAP §6.3) → `--color-fg-link` |
| **SpeechBubble** (시각만) | `Bubble 88:721` 꼬리·radius 22·glass-strong [S][DC] | tail: top · bottom-right; align | `tail`, `align`, `children` | Domain CharacterBubble 이 사용 | 1 | 문구 규칙은 Domain 에서 |
| **StarRating** | `91:693` + `Icon shape=star 117:879` [DC] | filled · empty | `value`, `max`, `onChange`, `readOnly`, `label` | `29:62` | 5 | 별 대비 1.64:1, 30px 터치 |
| **StatTile** | `163:2545/2548`, `110:790–803` [DC] | — | `value`, `unit`, `label` | `31:102`, `110:522` | 7 | |
| **Carousel** | `This Week's Shelf 113:1993` 가로 스크롤 + PageIndicator [S] | — | `items`, `itemWidth`, `snap`, `label` | 서재 | 3 | |
| **SwipeDeck** | 설문 카드 스택 `179:1781–1783`, 덱 dots `26:21` | stack depth | `items`, `index`, `onIndexChange`, `renderItem`, `prevLabel`, `nextLabel` | `179:1770`, 홈 덱 | 2 | 제스처 전용 금지 — 버튼 대체 조작 필수 (WCAG 2.5.1). 제스처 라이브러리 도입은 승인 필요 |
| **Toggle** | `iOS 26/Toggle 17:113` [S] | on · off | `checked`, `onChange`, `label` | 알림 설정(누락) | 3 | iOS 26 kit 모양 그대로가 아니라 HARU 토큰으로 구현 RECOMMENDED |
| **Spinner / Skeleton** | **Figma 누락** | — | `size`, `label` / `shape`, `lines` | 전 데이터 화면 | 1 | 프로토타입 `haru-dot` (점 3개 1.2s) 참고 가능 |
| **EmptyState** | **Figma 누락** | — | `illustration`, `title`, `description`, `action` | 서재·리포트 | 1 | |
| **ErrorState** (+Retry) | **Figma 누락** | — | `title`, `description`, `onRetry`, `retrying` | 전 데이터 화면 | 1 | |
| **InlineAlert / Banner** | **Figma 누락** | tone: info · success · warning · error · offline | `tone`, `title`, `description`, `action`, `onDismiss` | 오프라인·업로드·동의 | 1 | 상태 색 토큰 없음 |
| **Toast** | **Figma 누락** | — | `tone`, `message`, `duration`, `action` | 저장·복사·재시도 | 1 | `aria-live` |
| **Dialog / ConfirmDialog** | **Figma 누락** (iOS `misc/alert-overlay` 색만) | — | `open`, `title`, `description`, `confirmLabel`, `cancelLabel`, `destructive`, `onConfirm` | 삭제·탈퇴·녹음 폐기 | 1 | |

---

## 2. Domain Components (`apps/web/src/entities/*`)

| Component (제안) | Entity | Figma source | Variants / States | Proposed props | Used in | Stage | 비고 |
|---|---|---|---|---|---|---|---|
| **CapabilityBadge** | capability | `Tag 76:439–445` (green/cyan/pink/purple), `163:2648` 배지, `Cardtitle 85:592` [S] | capability 4종 × size; suffix("Day") | `capability`, `size`, `suffix` | 덱 카드, 책 시트, 프로필(누락) | 3 | 역량↔색 매핑이 화면마다 다름 (Tag: SD=green, 리포트 바: SD=teal, CF=blue, IM=`color/violet/67`) → capability color 토큰 결정 필요. 라벨은 copy 모듈 (M-13) |
| **CapabilityProgressRow** | capability | `163:2609–2632` Growth themes [DC] | tone per capability | `capability`, `value`, `levelLabel` | `31:102` | 7 | "strong/growing/emerging" 라벨 M-12 결정 전 표시 금지 |
| **CapabilityDiamondChart** | capability | **Figma 누락** | single · overlay(이전/현재), 축 선택 | `scores`, `previousScores`, `selectedAxis`, `onAxisSelect`, `summaryLabel`(a11y 대체 텍스트) | 프로필, 발전 역량, 리포트 상세 | 2 | FR-04/06. 차트 라이브러리는 Stack 외 → 인라인 SVG RECOMMENDED |
| **PersonaCard** | persona | **Figma 누락** | default · fallback | `name`, `description`, `illustration` | 프로필, 리포트 | 2 | FR-05 |
| **CharacterBubble** | session / home | `Bubble 88:721` (Type2 `50:176`, sessopn `88:757`, Type3 `88:838`), `Bubble/Home/Onlysession 88:922`, `88:929` [S][DC] | tail 위치, title+subtitle | `title`, `subtitle`, `tail`, `onPress`(홈 CTA 여부 결정 후) | `26:21`, `28:51`, `29:62` | 2 | **통합 후보 G**: Type3(Prompt 목록)은 버블이 아니라 PromptDrawer/PromptList 로 분리. 문구는 서버 템플릿 값만 (rules/frontend §8) |
| **CharacterMedallion** | character | `28:73/28:74`, `29:86/29:87`, `179:1703/1704`, `179:1750/1751`, `179:1822/1823`, asset `163:2528` [S] | size 136 · 174 · 188 · 200 · 232; animation: idle · listening · celebrate (누락) | `asset`, `size`, `motion`, `decorative` | Auth, Onboarding, Session | 2 | 크기 5종 → 3단계 통합 RECOMMENDED. listening/celebrate 에셋 없음 (FR-11) |
| **CharacterIllustration** | character | `26:22` (home), `179:1819`, `163:2642` (bookworm) [S] | asset | `asset`, `crop` | Home, Baseline saved, Progress | 2 | 원본 PNG 1MB+ → 최적화 필요 |
| **BookCover** | book | `113:1992` 표지, `113:1991` Selected (pastel 대체 표지 + check) [S] | default · selected · placeholder | `src`, `title`, `tone`, `selected`, `size` | 서재, 카드 | 3 | 표지 권리 M-35. alt 필수 |
| **BookShelfItem** | book | `This Week's Shelf 113:1993` (Default \| Selected) [S] | default · selected (+ "▶ Session" Tag) | `book`, `capabilityLabel`, `selected`, `onPress` | `30:74` | 3 | "Confidence" 라벨 M-13 |
| **BookListRow** | book / session history | `Book List 163:2145` 행 [S] | — | `book`, `sessionCount`, `finishedAt`, `rating`(M-14 결정), `onPress` | `30:74`, `163:1669` | 3 | ListRow 조합 |
| **BookSummary** | book | `86:517–86:526` (cover + title + author + reason) [S] | compact · full | `book`, `reason`, `density` | 덱 카드, 책 시트 | 3 | |
| **ReadingNowCard** | book | `145:1141` [S] | — | `book`, `progress`, `lastReadLabel` | `145:1132` | 보류 | PRD 근거 없음 (M-14) |
| **PromptPill** | prompt | `Prompt Card 86:324` (Style=Default, arrow_first, arrow, arrow_last, color/arrow_first, color/arrow, cppr/arrow_last, Tagtype, pagetype) [S], `Pagetag1–3` | tone: outline · tinted; phaseTag 유무 | `text`, `phaseTag`, `tone` | 카드, 책 시트, 버블, Drawer | 3 | **통합 후보 H**. arrow 계열은 pill 이 아니라 캐러셀 컨테이너의 prev/next → PromptCarousel 로 분리. `cppr` 오타 |
| **PromptCarousel** | prompt | arrow variants + `88:960` 내부 [S] | first · middle · last (화살표 비활성) | `prompts`, `index`, `onIndexChange` | PromptDrawer | 4 | |
| **CoachingNote** | prompt | `86:527` "Remember tonight" (pink tint), `86:482` 설명 블록(beige `color/grey/92`) [S] | tone | `eyebrow`, `text`, `tone` | 덱 카드, flip back, Drawer | 3 | |
| **ActivityOptionCard** | activity-card | `Prompt Card/Home 86:397` (size=Min\|Max, badge, flip=front\|back, keyword=green\|cyan\|pink\|purple\|Default, type=default\|shelf) [S]; `Prompt Card/Min/Emotion 86:512`, `/Resilience 86:545`; instances `163:2649–2651`, `86:438`, `86:482`, `145:1085` | density: compact · full; face: front · back; kind: book · reread_book · conversation_only(누락) | `option`, `capability`, `density`, `face`, `showCoaching`, `showContext`, `actions` | 홈 덱, 책 시트 | 3 | **통합 후보 I**. `type=shelf` 는 Prompt 카드가 아니라 서재 목록 시트 → LibraryShelfSheet 로 분리. 카드 하단 Prompt 가 ActionBar 와 겹침 (`163:2648` overflow) |
| **ReadingContextChip** | activity-card | `86:538` "Bedtime · 9:00 PM" [S] | — | `context`, `time`, `onPress` | 덱 카드 | 3 | 선택 UI 는 Feature (누락) |
| **StreakChip** | reward | `26:40` "12-day/115 Min" (clock icon), `30:91` "12-day streak" (star icon) [S][DC] | icon, minutes 표시 여부 | `days`, `minutes`, `variant` | Home, Library | 3 | **통합 후보 J** |
| **AttendanceStickerChip** | reward | `29:79` [DC] | — | `dayCount`, `message` | `29:62` | 4 | 스티커 획득 모션 누락 |
| **RecordButton** | recording | `Record Control 163:1590` (Record \| Pause) [S][DC], `163:1591`, `163:1601` | idle · recording(pause 아이콘) · paused(누락) · disabled(누락) · permission-denied(누락) | `state`, `onPress`, `label`, `elapsedLabel` | `28:51` | 4 | 10px 라벨 "Tap to recording" 문법·크기·대비. 맥동 모션 = DESIGN_SYSTEM §9 |
| **SurveyQuestionCard** | onboarding | `179:1783` [DC] | — | `counter`, `eyebrow`, `question`, `children` | `179:1770` | 2 | |
| **NotableQuoteCard** | report | `163:2633`, `110:830–834` [DC] | — | `quote`, `speakerLabel`, `sourceLabel` | Progress, 리포트 상세 | 7 | §13 민감 발화 마스킹된 서버 값만 |
| **WeeklyReadingChart** | report | `163:2551` [DC] | 요일 7개, 최대값 강조 | `days`, `highlightMax`, `summaryLabel` | `31:102` | 7 | M-10 채택 시만. 차트 대체 텍스트 필수 |
| **AttendanceCalendar** | reward | `110:522` 월 달력 + attend 스탬프 [S] | — | `month`, `attendedDays` | `110:522` | 보류 | PRD 근거 약함 |
| **ReportArchiveCard** | report | `110:844–861` [S] | ready · generating(누락) · not-eligible(누락) | `period`, `summary`, `progress`, `pdfStatus`, `onOpen`, `onDownload` | `110:522` | 7 | |
| **HighlightClipPlayer** | report | **Figma 누락** | playing · paused · expired · error | `clip`, `expiresAt` | 리포트 상세 | 7 | FR-18 |
| **UploadStatusBadge** | recording | **Figma 누락** | local_only · queued · uploading · uploaded · failed_retrying · stalled_48h | `status`, `lastAttemptAt` | 세션 완료, 설정 데이터 관리 | 4 | 상태 값은 ARCHITECTURE §10.5 **RECOMMENDED** 제안 (미확정) |
| **AnalysisStatusCard** | session | **Figma 누락** | pending · analyzed · excluded_low_quality · failed | `outcome`, `shortFeedback` | 피드백 | 5 | 상태·outcome 값은 ARCHITECTURE §10 / API_CONTRACTS §2 **RECOMMENDED** 제안 (미확정) |

---

## 3. Feature Components (`apps/web/src/features/*`)

| Feature Component | Feature 폴더 | Figma source | 조합 (Shared/Domain) | 상태·서버 데이터 | Stage | Figma 상태 |
|---|---|---|---|---|---|---|
| SocialAuthButtons | auth | `179:1709`, `179:1833` | Button(glass, icon) | AuthGateway provider 결과, 취소·실패 | 2 | Apple 누락 (M-16) |
| SignUpForm / LogInForm | auth | `179:1724`, `179:1820` | FieldGroup, TextField, Checkbox, Button | 검증, 제출, 에러 | 2 | error 상태 누락 |
| PasswordResetForm | auth | — | FieldGroup, Button, InlineAlert | 요청·완료·만료 | 2 | **Figma 누락** |
| GuardianConsentForm | consent | `179:1742` 일부 | CheckboxGroup, TextLink, Button | `GET /v1/consent-documents/current`, `POST /v1/consents` | 2 | **Figma 누락** (M-01, M-27) |
| OnboardingWizard | onboarding-survey | `179:1748`, `179:1770`, `179:1809` | TopBar, ProgressBar, SwipeDeck, SurveyQuestionCard, RadioGroup | draft 저장·복귀, submit | 2 | Step 1–4 누락 |
| ProfileResultView / GrowthCapabilityPicker | child-profile, growth-capability | — | CapabilityDiamondChart, PersonaCard, Button | ProfileResult, SetGrowthCapability | 2 | **Figma 누락** |
| ActivityCardDeck | activity-card-deck | `26:21`, `163:2648`, `86:*` | SwipeDeck, ActivityOptionCard, PageIndicator, CharacterBubble | today card fetch, 오프라인 캐시, selection | 3 | 코칭·Context 배치 불일치 (M-30) |
| PromptReveal (flip) | book-selection | `86:482`, flip icons `85:501/85:506` | ActivityOptionCard(face) | ActivityCardSelection | 3 | flip 모션 누락 |
| ReadingContextSelector | reading-context | `86:538` 결과만 | Sheet, RadioGroup/Chip, 시간 picker(누락) | SelectActivityOption.readingContext | 3 | **Figma 누락** |
| LibraryShelves / LibraryShelfSheet / BookDetailSheet | library | `30:74`, `163:1669`, `145:1132` | Carousel, BookShelfItem, ListGroup, Sheet, ActivityOptionCard | library 목록·필터, book prompts | 3 | Empty 누락 |
| AddOwnBookForm, GiftRequestFlow | library | — | FieldGroup, ListRow, Tag | AddOwnBook, CreateGiftRequest | 3 | **Figma 누락** |
| NotificationPreferencesForm, PushPermissionPrompt | notification-preferences | `17:113` Toggle 만 | ListGroup, Toggle, Button | preferences, push device | 3 | **Figma 누락** |
| StorytimeSessionView (RecordingControls, SessionBubble) | storytime-session, recording | `28:51`, `163:1601`, `163:1618/1620`, `78:353` | RecordButton, Button, CharacterMedallion, CharacterBubble, TopBar | RecordingController 구독, transitions, 30분/10분 타이머 | 4 | 상태 혼합 (M-25, M-26) |
| PromptDrawer | prompt-drawer | `88:960` | Sheet, PromptCarousel, CoachingNote, PageIndicator | SessionSummary.prompts | 4 | 트리거 버튼 누락 |
| MicPermissionGate / ConversationOnlyMode | recording | — | CharacterMedallion, Surface, Button | PermissionService | 4 | **Figma 누락** |
| UploadQueueNotice / RecoveryNotice | recording | — | InlineAlert, UploadStatusBadge | UploadQueue, 크래시 복구 | 4 | **Figma 누락** |
| SessionCompleteView | storytime-session | `29:62` 상단 | AttendanceStickerChip, CharacterMedallion, CharacterBubble | completionBubble, stickerAward | 4 | celebrate 모션 누락 |
| ReflectionForm | reflection | `91:691` | StarRating, Chip, TextField/TextArea, Button | ReflectionFormDefinition, SubmitReflection(멱등) | 5 | 자유 후기 카드·skip 누락 |
| ShortFeedbackView | short-feedback | — | AnalysisStatusCard, CharacterBubble | SessionAnalysisStatus 폴링 | 5 | **Figma 누락** |
| GrowthReportOverview | growth-report | `31:102`, `110:522` | StatTile, WeeklyReadingChart, CapabilityProgressRow, NotableQuoteCard, ReportArchiveCard, SelectTrigger | ReportOverview | 7 | IA 결정 (M-10) |
| ReportDetailView, ReportPdfAction | growth-report, report-pdf | `110:854` Download PDF 만 | CapabilityDiamondChart(overlay), PersonaCard, HighlightClipPlayer, Button | ReportDetail, ReportPdfStatus | 7 | **Figma 누락** |
| SettingsMenu, ChildProfileEditor, AccountActions, ConsentHistory, DataManagementPanel | settings, data-management | `26:44` 진입 아이콘만 | ListGroup, ListRow, Toggle, ConfirmDialog, UploadStatusBadge | me, children, consents, deletion requests | 6 (데이터 관리·동의 이력 보기·탈퇴 = carry-over NEEDS DECISION: Stage 8 유지 vs Stage 6 이동) | **Figma 누락** |

---

## 4. Page-only Components

| Component | Page | Figma | 비고 |
|---|---|---|---|
| WelcomeHero | WelcomePage | `179:1703–179:1708` | CharacterMedallion + 워드마크 + tagline |
| AccountSections | SignUpPage | `179:1731`, `179:1737` | SectionLabel + FieldGroup 배치 |
| SurveyIntroPanel | OnboardingIntroPage | `179:1756–179:1764` | |
| BaselineSavedHero | OnboardingSavedPage | `179:1813`, `179:1819` | |
| HomeHeader | HomePage | `26:39`, `26:40`, `26:44` | 워드마크 `26:39` 는 SF Pro Heavy 21px (텍스트 로고) — 로고 에셋화 NEEDS DECISION |
| SessionCompleteHeader | SessionCompletePage | `29:75`, `29:76`, `29:79` | |
| LibraryHeader / ProgressHeader | LibraryPage / ReportOverviewPage | `30:89–93`, `31:115–120` | TopBar(variant=large) + trailing chip |

---

## 5. 통합 후보 (Integration Candidates) — 모두 RECOMMENDED, 승인 필요

| ID | Figma 반복 패턴 | 제안 통합 결과 | 근거 | Figma 정리 요청 |
|---|---|---|---|---|
| A | `Button 17:20` (Glass/Accent × 4 states), `Button/White 86:245`, `Button/card 86:372`, `Button/Filter 40:316`, 화면 instance 높이 45 / 56 / 58 | **Button**(`variant`=glass·accent, `size`=md·lg, `leadingIcon`, `trailingIcon`) + **ButtonGroup**. `Button/Filter` 는 역할이 선택 필터이므로 **Chip(variant=glass)** 로 이동 | Button/White = Glass + leading star (같은 역할·API). Button/card = 버튼 2개 조합 | 높이 3종 → 2종(md 45 / lg 56) 확정 요청 |
| B | `Select 90:626` (Green/Transparent), `Button/Filter 40:316`, 회고 칩 `91:710–714` | **Chip**(`selected`, `variant`=filled·outline·glass) | 모두 on/off 선택 | variant 이름을 State=Selected/Unselected 로 |
| C | `Screen/Tab Bar 25:87`, `Tab Bar/Center 140:2971`, `110:522` 비컴포넌트 탭, `Tab 17:25`, `Tab Bar 17:26`, `iOS 26/Segmented Control 17:122` | **BottomTabBar**(`items`, `activeKey`, `centerItem`) — 앱 내비게이션 / **SegmentedTabs** — 화면 내 보기 전환 (보류) | 전역 내비게이션과 화면 내 세그먼트는 역할이 다름. `Tab`/`Tab Bar` 는 템플릿 잔존 | M-08 결정 후 Tab Bar 1종으로 정리, variant 이름 = 라벨 |
| D | `Title 139:2734` (Titla type=Three/two), `78:353`, 화면별 헤더(back+title, back+title+forward, centered title+close, large title+chip) | **TopBar**(`variant`=large·inline·centered·pill, `leading`, `title`, `trailing`) | 모두 화면 상단 내비게이션 역할 | `Titla` 오타, 헤더 컴포넌트화 요청 |
| E | `Tag 76:440` (green/cyan/pink/purple, *_icon, Boy/Girl/Not selected), `Pagetag1–3 139:2410–2412`, `Cardtitle 85:592`, age Tag "3yr 4mo" | **Tag**(`tone`, `size`=sm·xs, `leadingIcon`) (Shared) + **CapabilityBadge**(Domain, capability→tone) + **PromptPhaseTag**(Domain: PRE/POST/P.n → Tag xs) ; Boy/Girl/Not selected → **SelectTrigger** | Pagetag1–3 은 텍스트만 다른 동일 컴포넌트, Boy/Girl 은 선택 트리거 역할 | `purple icon` / `purple_icon` 표기 통일, Pagetag 1개로 |
| F | `Pagenation 88:789`, `Deck Dots 27:85` (둘 다 `26:21` 에 배치), `30:74`·`88:960` 내부 dots | **PageIndicator**(`count`, `index`) | 동일 역할 중복 배치 | `26:21` 중복 제거 |
| G | `Bubble 88:721` (Type2, sessopn, Type3), `Bubble/Home/Onlysession 88:922` | **SpeechBubble**(Shared 시각) + **CharacterBubble**(Domain 문구) ; Type3 의 Prompt 목록은 **PromptDrawer/PromptCarousel** 로 분리 | Type3 는 버블 역할이 아님 (M-25) | variant 이름 `sessopn` 오타, Type2/Type3 의미 있는 이름으로 |
| H | `Prompt Card 86:324` 9 styles (Default, arrow_first, arrow, arrow_last, color/arrow_first, color/arrow, cppr/arrow_last, Tagtype, pagetype) | **PromptPill**(`text`, `phaseTag`, `tone`=outline·tinted) + **PromptCarousel**(prev/next, first/last 비활성) | 9개 중 실제 축은 tone 2 × 태그 유무 2 × 캐러셀 위치 3 | `cppr` 오타, 축별 property 로 재구성 |
| I | `Prompt Card/Home 86:397` (size, badge, flip, keyword, type), `Prompt Card/Min/Emotion 86:512`, `Prompt Card/Min/Resilience 86:545`, `Prompt Card/Session 88:960` | **ActivityOptionCard**(`density`, `face`, `showCoaching`, `showContext`) + **LibraryShelfSheet** (type=shelf 분리) + **PromptDrawer** (Session 분리) | 이름에 "Prompt Card" 가 붙었지만 역할이 덱 카드 / 서재 목록 시트 / 세션 Drawer 로 3가지. `badge=Filipback, flip=Self-Direction` 처럼 property 값이 뒤섞임 (`86:395`) | property 값 오염 정리, keyword 색 = capability 로 명명 |
| J | `26:40` "12-day/115 Min", `30:91` "12-day streak" | **StreakChip**(`days`, `minutes`, `variant`) | 동일 역할 | 표시 항목 확정 (M-30) |
| K | CharacterMedallion 크기 5종 (136/174/188/200/232) | size 3단계 (sm 136 · md 188 · lg 232) | 화면별 임의 크기 | 디자이너 확인 |
| L | 카드 radius 16/20/22/24/28/30/32, 흰색 반투명 fill 50/62/74/82/85/86/90% | Surface `radius` 토큰 6단계 (`indicator`·`control`·`field`·`surface`·`card`·`pill`, DESIGN_TOKEN_MAP §5.2), `fill` 3단계 (a50·a74·a90) | DESIGN_TOKEN_MAP §5 | 토큰 바인딩 요청 |

---

## 6. iOS 26 Kit (`17:368`, 라이브러리 "iOS and iPadOS 26") — 재구현 금지 / 조건부

`get_libraries` 결과 파일에 Material 3, Simple Design System, iOS 18, iOS 26, watchOS 26, visionOS 26, macOS 26 커뮤니티 라이브러리가 연결되어 있다. HARU 화면은 이 중 iOS 26 의 색·텍스트 스타일 변수만 사용한다 [DC].

| Figma | 판단 | 라벨 | 이유 |
|---|---|---|---|
| `Screen/Status Bar 25:21`, Dynamic Island, Home Indicator (`179:1723` 등) | **구현 금지** | CONFIRMED | 기기 크롬. Web은 `env(safe-area-inset-*)` 로, Capacitor 셸은 OS가 그림 |
| `iOS 26/Button 17:106` (Bordered Prominent/Bordered/Secondary/Borderless × L/M/S) | **구현 금지** | RECOMMENDED | HARU Button(Glass/Accent)이 대체. 화면 사용 0건 |
| `iOS 26/Stepper 17:114`, `iOS 26/Slider 17:118` | **구현 금지** | RECOMMENDED | PRD 요구 없음, 화면 사용 0건 |
| `iOS 26/Toggle 17:113` | **조건부** — 알림 설정(Stage 3)에서 필요 시 HARU 토큰으로 Web 구현 | NEEDS DECISION | Capacitor WebView 안에서는 네이티브 UISwitch 를 쓸 수 없음 (Web DOM). iOS 모양 복제 vs HARU 스타일 결정 |
| `iOS 26/Segmented Control 17:122` | 보류 | RECOMMENDED | 사용 화면 없음 |
| iOS 시스템 시트·Alert·Action Sheet·Date Picker·Share Sheet | Web 구현 또는 Capacitor 플러그인 | NEEDS DECISION | 날짜/시간 선택(Context 직접 시간, 생년월), 공유(FR-17 PDF) — 네이티브 picker/share 플러그인 사용 시 Stack 확장 승인 필요 |
| Material 3 / Simple DS / watchOS / visionOS / macOS 라이브러리 | 사용 안 함 | RECOMMENDED | HARU 화면에서 참조 없음 — 파일 정리 권장 |

---

## 7. PRD 에 필요하지만 Figma 에 없는 컴포넌트 (요약)

| Component | 분류 | PRD | Stage | 비고 |
|---|---|---|---|---|
| CapabilityDiamondChart (single / overlay / 축 선택) | Domain | FR-04, FR-06, §7.3, §7.7 | 2 | 인라인 SVG, 대체 텍스트 |
| PersonaCard | Domain | FR-05, FR-15 | 2 | 일러스트 배경 에셋 없음 |
| GuardianConsentForm (CheckboxGroup 필수 3 + 선택 1, 문서 링크·버전) | Feature | FR-02 | 2 | |
| Onboarding Step 1–4 입력 (관계 선택, 기질 카드, 책 검색·목록 입력, 주제 태그 멀티선택, 목표 선택) | Feature + Shared(Chip multi, Search field) | FR-03 | 2 | |
| ReadingContextSelector + TimePicker | Feature + Shared | FR-08 | 3 | |
| Conversation-only / Reread / 책 소진 카드 변형 | Domain | §7.4, §13 | 3 | |
| AddOwnBookForm, GiftRequest 상태 | Feature | FR-22, FR-23 | 3 | |
| PromptDrawer 트리거 버튼 ("Prompts") | Feature | FR-11 | 4 | `88:960` 은 있음 |
| Done Reading / Pause / Resume 컨트롤 세트 | Domain + Shared | FR-09 | 4 | |
| Listening character animation, completion celebration | Domain(에셋) | FR-11, §7.5 | 4 | 에셋 없음 |
| MicPermissionGate, ConversationOnlyMode | Feature | §13 | 4 | |
| UploadStatusBadge, Offline Banner, Recovery notice | Domain / Shared | NFR 오프라인·안정성, §13 | 4 | |
| 30분 자동 종료 / 10분 리마인드 안내 | Feature | FR-09, §13 | 4 | |
| 자유 후기 카드(TextArea), Skip | Feature | FR-12 | 5 | |
| AnalysisStatusCard, ShortFeedback, 저품질 안내 | Domain / Feature | FR-13, FR-14, §13 | 5 | |
| Report eligibility progress, delayed notice | Domain | FR-16, §13 | 7 | |
| HighlightClipPlayer (+expired) | Domain | FR-18 | 7 | |
| PDF 생성 상태 / 공유 | Feature | FR-17 | 7 | |
| Settings ListGroup, Toggle, ConfirmDialog, 삭제 진행 상태 | Shared + Feature | §7.8, FR-21 | 6 (데이터 관리·동의 이력 보기·탈퇴 = carry-over NEEDS DECISION: Stage 8 유지 vs Stage 6 이동) | |
| Loading / Empty / Error / Toast / Dialog 공통 패턴 | Shared | rules/frontend §7 | 1 | |
| Focus ring, Error field state, Disabled chip/input | Shared state | NFR 접근성 | 1 | 토큰 신규 |
