# HARU Component Map

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (Rev: #33 · C-19 반영)
Based on: Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `8:2` section `17:367` HARU Components, `17:368` iOS 26 Components, page `16:2` 화면 instance (2026-09-14 확인), PRD v1.4, `docs/FIGMA_SCREEN_MAP.md`, `docs/decisions/stage-0-approvals.md` (기존 문서보다 우선), `.claude/rules/frontend.md` (Frontend-only 개정본 §1·§5); Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**
Author: design-agent (2026-09-14)

> **갱신 2026-11-09 (design-agent, Stage 5 `S5-C` Visual Gap)** — Figma 에 없는 피드백·분석 상태 화면 `/session/:sessionId/feedback`(`C13-S5-1`, Spec `docs/design/stage-5-design-spec.md` §2.3 · `D5-4`) 구현을 등재하고, 승인된 Spec §1·§4 에 따라 `29:62` 의 route 를 한 개로(`/reflection` 없음), `AnalysisStatusCard` 를 **만들지 않음**(기존 InlineAlert·ErrorState·버블 재사용)으로 정정했다. 새 결정 없음. 근거 `docs/design/stage-5-visual-gap-s5c.md`.
>
> **갱신 2026-11-10 (design-agent, `S5-C` VG 재검토)** — `D5-10` 으로 추가된 Shared UI 선택 prop `announce` 를 `ErrorState` · `InlineAlert` 행에 등재 (기본값 동작 불변). 근거 `docs/design/stage-5-visual-gap-s5c.md` §8.

**2026-09-23 갱신 (design-agent)** — Stage 1 구현으로 확정된 2건만 반영했다 (새 결정 없음): **PageIndicator `interactive` variant 폐기 → 표시 전용** (`S1-G-1`), **BottomTabBar 탭 아이콘 Lucide 글리프 확정** `book` · `chart-no-axes-column-increasing` (`S1-D2-5`). 근거: `docs/decisions/stage-1-approvals.md` §8 (2026-09-21, user) · `docs/qa/stage-1-handoff.md` §10. 상세 명세는 `docs/design/stage-1-design-spec.md` §4.19 · §8.1.

라벨: `CONFIRMED (사용자 결정 2026-09-14, #id)` = 사용자 결정 · `CONFIRMED` = PRD·Figma 확정 · `가값 (P-xx)` = 승인 로그 §4 가값 · `D-xx` = 승인 로그 §3 수용 예외 · `RECOMMENDED` = design-agent 제안 (사용자 미결정 세부) · `NEEDS DECISION` = 미결정. 검증 표기: [S] screenshot, [DC] design context, [M] metadata 이름만.

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
- **Figma 누락 화면·컴포넌트**: 표에 **"Figma 누락"** 으로 표시된 화면용 컴포넌트는 모두 **디자인 소스를 해당 Stage 에서 화면별로 결정한다 (C-13)** — Orchestrator 가 ① 디자이너 Figma 요청 ② design-agent 명세 중 무엇으로 할지 사용자에게 묻고, 승인 전에는 디자인·구현하지 않는다. CONFIRMED (사용자 결정 2026-09-14, C-13). **예외**: 공통 상태 컴포넌트(Spinner/Skeleton, EmptyState, ErrorState, InlineAlert/Banner, Toast, Dialog)와 컴포넌트 focus·error·loading 상태는 design-agent 명세로 Stage 1 에서 먼저 구현한다 — CONFIRMED (사용자 결정 2026-09-14, #22), 화면은 Stage 1 구현 후 항목별 승인 `가값 (P-10)`.
- **아이콘**: 일반 아이콘 = Lucide (`lucide-react`, ISC), HARU 전용 아이콘(`attend` 스티커, thumb, record, flip 등) = Figma SVG export, Google·Apple 로고 = 공식 브랜드 에셋만 — CONFIRMED (사용자 결정 2026-09-14, #21). 아이콘 크기 단계 = `가값 (P-09)`.
- **역량 표시 라벨**: `emotion_regulation` = Emotion Regulation · `self_directed_agency` = Self-Direction · `cognitive_flexibility` = Cognitive Flexibility · `intrinsic_motivation` = Intrinsic Motivation — CONFIRMED (사용자 결정 2026-09-14, #13·#14). 라벨 문자열은 copy 모듈 한 곳에서만 정의한다.

---

## 1. Shared UI (`packages/ui`)

**2026-10-02 갱신 (design-agent)** — `docs/decisions/stage-3-approvals.md` §8 `D-14` 반영. **원칙: "해당 화면의 컴포넌트가 나올 때 만든다"** (사용자 지시 원문).

| 항목 | 내용 |
|---|---|
| Stage 3 신규 **3종** | **`SectionHeader`**(`30:74`) · **`Carousel`**(`113:1993`) · **`Toggle`**(`17:113`) + **`ListRow` media·meta 변형 확장** → **28 → 31** |
| Home 덱 | **`SwipeDeck`(depth 3) 재사용** — 신규 덱 컴포넌트를 만들지 않는다 |
| Stage 3 에서 **만들지 않는 것** | `StatTile`(S7) · `TextArea`·`StarRating`(S5) · `PromptCarousel`(S4) · `SegmentedTabs`(사용처 없음) — **그 화면이 나오는 Stage 에서** 만든다. **선행 구현 금지** |
| Prompt 단계·페이지 배지 | **신규 컴포넌트를 만들지 않는다** — 기존 **`Tag`(size=xs)** 조합이며 도메인 매핑은 `PromptPill`(entities)이 소유한다 (§2, `D-8`) |


| Component (제안) | Figma source | Variants / States (Figma) | Proposed props | Used in | Stage | 비고 |
|---|---|---|---|---|---|---|
| **Surface** (HARU Material) | `17:332`, `16:24` (Glass Rest/Raised/Pressed) [S]; effect styles `HARU/Glass Rest`, `HARU/Glass Raised`, `HARU/Glass Pressed`, `HARU/Shadow Rest` | material: rest · raised · pressed; fill: glass(74%) · strong(90%) | `material`, `fill`, `radius`, `padding`, `as`, `interactive` | 거의 모든 카드·칩·Tab Bar | 1 | 카드 radius가 16/20/22/24/28/30/32 로 흩어짐 → 토큰 통합 필요 |
| **AppBackground** | 화면 frame 배경 gradient [DC] (Figma 변수 아님 → `--color-bg-app-start/mid/end`, DESIGN_TOKEN_MAP §4) | — | `variant` | 전 화면 | 1 | gradient 토큰 신규 제안 |
| **Text** | text styles `iOS 26/*` (`17:298`) + 화면의 raw 크기 | style: largeTitle … caption2, weight | `variant`, `tone`, `weight`, `as`, `truncate` | 전체 | 1 | 화면 raw size(9, 10.5, 11.5, 11.8, 12.5, 14.5, 18.5 …) 스케일 흡수 |
| **Icon** | 일반 아이콘 = **Lucide** (`lucide-react`, ISC) — Figma 일반 아이콘(settings, close, back, forward, chevron, refresh, mail, download, list, check 등)과 누락 아이콘(alert, wifi-off, trash, play/pause, share, lock, info, calendar, plus, search 등)을 Lucide 대응 아이콘으로 대체. HARU 전용 = **Figma SVG export** (`Icon 50:157` 의 attend, thumb_gold/white, record, flip_to_back/front, star, clock 등). 브랜드 로고(Google "G" `179:1710`, Apple) = 공식 브랜드 에셋만 | name (Lucide 이름 또는 HARU 전용 이름) | `name`, `size`, `label`(a11y), `decorative` | 전체 | 1 | 아이콘 소스 CONFIRMED (사용자 결정 2026-09-14, #21). 크기 `--size-icon-sm/md/lg` = `가값 (P-09)`. Lucide 버전 고정은 Stage 1 Plan. Lucide ↔ Figma 아이콘 대응표는 Stage 1 design spec. Figma variant 이름 정리(`shape11`, `13`, `swape`)는 HARU 전용 SVG export 대상에만 디자이너 요청 |
| **Button** | `Button 17:20` [S][DC] (Variant=Glass\|Accent × State=Rest\|Hover\|Pressed\|Disabled), `Button/White 86:245` [S], `Button/card 86:372` [S] | variant: glass · accent; state 4종; 높이 45(기본)·56·58(화면 instance) | `variant`, `size`(md · lg), `leadingIcon`, `trailingIcon`, `fullWidth`, `loading`, `disabled`, `onPress`, `type` | `179:1709/1715/1746/1768/1814/1833/1844`, `140:2870`, `91:717`, `163:1618/1620`, 카드 ActionBar | 1 | **통합 후보 A**. focus(`가값 (P-03)`)·loading 상태는 design-agent 명세로 Stage 1 구현 (#22, `가값 (P-10)`). Accent 흰 라벨 2.07:1 **유지** — CONFIRMED (사용자 결정 2026-09-14, #18-①), **D-01**. Glass 라벨 `text-button` 4.48:1 = `가값 (P-11)`. lg 높이 56/58 = `가값 (P-15)`, 가값 56 |
| **ButtonGroup / ActionBar** | `Button/card 86:372` (glass "Save" + accent "Start Session") [S] | — | `primary`, `secondary`, `layout`(inline · stacked) | 덱 카드, 책 시트 | 1 | Button 조합이므로 별도 스타일 금지 |
| **IconButton** | `Button 78:158` (Icon=Back \| Setting \| swape) [S]; 화면 내 38px 원형 glass frame `26:44`, `29:76`, `179:1726`, `179:1772`, `179:1775`, `179:1804` [DC] | icon (Lucide) | `icon`, `label`(필수), `variant`(glass), `size` | 헤더 전반, Home 설정 `26:44` (Home skeleton 헤더에서 **Stage 2** 부터 사용, #33·C-16) | 1 | 38×38 < 44pt 터치 타깃 → 시각 38 유지 + hit area 44 RECOMMENDED |
| **TopBar** | `Title 139:2734` (Titla type=Three: back + BookTitlePill + settings / two: back + pill) [S]; `78:353`; 화면 헤더 `179:1726+179:1729`, `179:1772–1778`, `29:75+29:76`, 대형 제목 `30:89` "Library", `31:117` "Progress" | variant: large · inline · centered · pill | `variant`, `title`, `leading`, `trailing`, `subtitle` | 모든 Stack/Fullscreen 화면 | 1 | **통합 후보 D** (Title types). variant 이름 오타 `Titla`. 설문 제목 "Question 1 of 10" `text-button` 대비 4.18:1 = `가값 (P-11)` |
| **BottomTabBar** | `Screen/Tab Bar 25:87` (Active=Home\|Library\|Report) [S][DC], `Tab Bar/Center 140:2971` (집 아이콘). **`110:522` 내 비컴포넌트 탭(Library\|Session\|Report)은 사용하지 않음** | active item; center 강조 원형 | `items`, `activeKey`, `centerItem`, `onSelect` | `26:21`, `30:74`, `31:102` | 1 | **항목 = Library / Home(가운데) / Progress, Session 탭 없음** — CONFIRMED (사용자 결정 2026-09-14, #15), **D-02**. 리포트 탭 표시 라벨 "Progress", 경로 `/progress` (RECOMMENDED, PLANNING §9.2). Figma variant 이름 Report → Progress rename 은 디자이너 요청. `items` 는 config 로 주입하되 구성은 위 3개로 고정. **아이콘 글리프 CONFIRMED (사용자 결정 2026-09-21, `S1-D2-5`)**: Library = Lucide **`book`**, Progress = Lucide **`chart-no-axes-column-increasing`**, Home(가운데) = HARU SVG(`140:2971`). Figma 탭 아이콘은 이름 없는 21px SVG 라 `25:87` 을 16배 확대해 lucide-react 1.47.0 path 와 대조해 확정했고, 기존 후보 `book-open`·`library-big`·`chart-column`·`trending-up` 은 전부 기각했다. Lucide stroke 는 **1.5 유지**(탭 전용 상향 없음 — Figma 두 글리프 굵기가 2.0 vs 3.2 라 단일 stroke 로 수렴 불가, handoff §10.1). |
| **SegmentedTabs** | `Tab 17:25` (Selected\|Unselected), `Tab Bar 17:26` (Today/Week/Month), `iOS 26/Segmented Control 17:122` | selected | `options`, `value`, `onChange` | 사용 화면 없음 | 보류 | 템플릿 잔존. 리포트 기간 전환 등 필요 시에만 |
| **Tag** | `Tag 76:440` (Color=green\|cyan\|pink\|purple, `*_icon` ▶Session, Boy\|Girl\|Not selected) [S][DC], `Pagetag1–3 139:2410–2412`, `Cardtitle 85:592` [S] | tone 4 + icon; size: sm(26h, 12px) · xs(19–22h, 12px 로 흡수 — 최소 11px, #10) | `tone`, `size`, `leadingIcon`, `trailingIcon`, `label` | `163:2648`, `145:1132`, `113:1991` | 1 | **통합 후보 E**. tone 색은 capability 배지 색 (#19). 흰 글자 대비 1.56–1.86:1 미달 → 배지 글자 색 `-fg` = `가값 (P-02)`. Boy/Girl/Not selected 는 Tag 가 아니라 SelectTrigger |
| **Chip** (selectable) | `Select 90:626` (Color=Green = selected, Transparent = unselected) [S][DC], `Button/Filter 40:316` (glass) [S], `91:627/91:628` | selected · unselected (+glass) | `selected`, `onToggle`, `label`, `variant`(filled · outline · glass), `disabled` | `29:62` 회고 칩 | 1 | **통합 후보 B**. 높이 31–34 < 44. 선택 칩 흰 라벨 = D-01 범위, 비선택 칩 경계 = `가값 (P-02)` |
| **SelectTrigger** | `Tag Color=Boy/Girl/Not selected` (chevron) [DC], `31:118` "May 4 – 10 ˅" [DC] | value / placeholder | `value`, `placeholder`, `onPress`, `size`, `label` | 온보딩 Step 1 성별 (`179:1740` 소스), `31:102` | 2 | 성별 옵션 **Girl / Boy / Prefer not to say**, 기본값 선택 안 함, 미응답 진행 가능 (contracts `girl`·`boy`·`prefer_not_to_say`, 미응답 `null`) — CONFIRMED (사용자 결정 2026-09-14, C-7). 선택 UI(Sheet/picker)는 Figma 누락 → 디자인 소스 C-13 |
| **FieldGroup + TextField** | `Input 76:417` (boxcount=Line_1\|Line_2\|Line_3\|boxcount2/badge) [S][DC] | 행 수, trailing action("Show"), trailing accessory(Tag) | FieldGroup: `children`; TextField: `label`, `value`, `placeholder`, `type`, `trailingAction`, `trailingAccessory`, `helperText`, `errorText`, `disabled`, `autoComplete` | 가입 `179:1724` (보호자 이름·이메일·비밀번호만, C-5), 로그인 `179:1820`, 온보딩 Step 1 아이 필드(`179:1740` 소스: 성·이름 두 칸, C-6·D-03) | 1 | "boxcount" variant = 행 수라서 컴포넌트 variant 가 아니라 composition 으로 풀어야 함. error·focus·disabled 상태는 design-agent 명세로 Stage 1 구현 (#22, `가값 (P-10)`) |
| **TextArea** | `91:715` outline 16 radius (비컴포넌트) [DC] | — | `label`, `value`, `placeholder`, `maxLength`, `rows` | `29:62` | 5 | 회고 자유 후기 |
| **PasswordToggle** | `Input` 내 "Show" `76:428` | — | `visible`, `onToggle` | Auth | 2 | TextField trailingAction 로 흡수 가능 |
| **Checkbox / CheckboxGroup** | `179:1742` 22px teal (비컴포넌트) [DC] | checked 만 존재 | `checked`, `onChange`, `label`, `description`, `required`, `error` | 보호자 동의 화면 (GuardianConsentForm) | 1 | unchecked·error·focus 상태는 design-agent 명세로 Stage 1 구현 (#22, `가값 (P-10)`). 체크박스 teal 경계 = `가값 (P-02)`. 동의 그룹(5항목)은 Feature 에서 조합. Figma 단일 체크박스는 디자이너 수정 요청 (C-1) |
| **RadioGroup** (variant=card) | `179:1788` 옵션 5개 (비컴포넌트) [DC] | selected(teal) · unselected | `options`, `value`, `onChange`, `variant`, `name` | `179:1770` | 1 | Baseline v1 옵션 **6개** = Never · Rarely · Sometimes · Often · Almost always + 비채점 "Haven't had the chance to see this yet" — CONFIRMED (사용자 결정 2026-09-14, C-8), D-04. 비채점 옵션의 시각 구분 방식은 Figma 누락 → 디자인 소스 C-13 (Stage 2) |
| **ProgressBar** | `179:1779/1780` 설문, `145:1141` 읽기 진행, `163:2613` 역량 바, `110:844` 리포트 [DC] | tone, height 6·8 | `value`, `max`, `tone`, `size`, `label`(a11y) | 온보딩·서재·리포트 | 1 | fill ↔ track 대비 1.73–1.94:1 (비텍스트 3:1 미달) → `가값 (P-02)` (현재 Figma 값, 디자이너 대기) |
| **PageIndicator** | `Pagenation 88:789` [DC], `Deck Dots 27:85` (SVG), `30:74`·`88:960` 내부 | **표시 전용 단일 variant** (`dots`) — active pill 20×7 + dots 7 | `count`, `index`, `label` — ~~`onSelect`~~ 제거 | `26:21`, `30:74`, `88:960` | 1 | **통합 후보 F** (Pagenation vs Deck Dots 중복 — `26:21` 에 둘 다 배치됨). **`interactive` variant 폐기 — CONFIRMED (사용자 결정 2026-09-21, `S1-G-1`)**: 터치 타깃 44 요구와 dot 7 + gap 6 기하가 양립 불가였고 Figma 근거가 있는 것은 표시용 dot 뿐이다. 페이지 이동은 스와이프·버튼이 담당. 재도입이 필요하면 Stage 3 캐러셀 설계 시 디자이너 입력을 받는다 |
| **Sheet + Scrim** | "Deemed" `163:1807`, `145:1450` [S]; grabber `88:960` | open | `open`, `onClose`, `title`, `trailing`, `snapPoints`(선택), `initialFocus` | 서재 시트, Prompt Drawer, Context 선택 | 1 | scrim 색 = `--color-scrim` `가값 (P-05)`, z-index `가값 (P-06)` (DESIGN_TOKEN_MAP §4) |
| **ListGroup + ListRow** | `Book List 163:2145` [S] | leading media, title, subtitle, trailing meta, chevron | `leading`, `title`, `subtitle`, `trailing`, `chevron`, `onPress` | `30:74`, `163:1669`, 설정 목록(Figma 누락 — C-13) | 2 (설정 목록 최소 1행 "Log out", C-16) · 3 (서재) | 설정 목록이 Stage 2 부터 필요 → 기본 행(title + chevron/action)만 S2 에 만들고 media·meta 변형은 S3 — **Stage 3 에서 확장 확정** (`CONFIRMED (D-14, 2026-10-02)`, `--list-row-height-media` 74 = Figma `163:2100`·`30:141` 실측). 명세 §4.3 |
| **SectionHeader** | `30:74` "Our curated shelf · See all" [S], `163:1624` · `163:1632` · `30:138` | — | `title`, `action` | 서재 3섹션, 설정 그룹 제목 | 3 | **Stage 3 신규 (28 → 31)** — `CONFIRMED (D-14, 2026-10-02)`. 명세 `stage-3-design-spec.md` §4.1 |
| **InfoRow** (glass pill + icon) | `179:1759`, `179:1764` [S] | — | `icon`, `text` | `179:1748` | 2 | ListRow variant 로 흡수 가능 |
| **DividerWithLabel** | `179:1839–1841` [S] | — | `label` | `179:1820` | 2 | |
| **TextLink** | "Log in", "Forgot password?", "See all", "Create an account" | — | `href`/`onPress`, `tone` | Auth, 서재 | 2 | Figma raw 링크색 대비 미달 (3.16:1, DESIGN_TOKEN_MAP §6.3) → `--color-fg-link` |
| **SpeechBubble** (시각만) | `Bubble 88:721` 꼬리·radius 22·glass-strong [S][DC] | tail: top · bottom-right; align | `tail`, `align`, `children` | Domain CharacterBubble 이 사용 | 1 | 문구 규칙은 Domain 에서 |
| **StarRating** | `91:693` — 별 = `91:694` 자체 vector 30×30 [DC] (~~`117:879`~~ 는 25×24 다른 심볼 — Stage 5 Spec M-1) | filled · empty · readOnly · disabled | `value`, `max`, `onChange`, `readOnly`, `disabled`, `aria-labelledby` | `29:62` | 5 — **구현됨** `packages/ui/src/rating` | 채움 `#D0CCA1` · 빈 `#D6DEDC`(`T5-1`) · 대비 `가값 (P-02)` · 히트 38×44 (`N5-19`) |
| **StatTile** | `163:2545/2548`, `110:790–803` [DC] | — | `value`, `unit`, `label` | `31:102`, `110:522` | 7 | |
| **Carousel** | `This Week's Shelf 113:1993` 가로 스크롤 + PageIndicator [S], `113:1991/1992` | — | `items`, `itemWidth`, `snap`, `label` | 서재 2섹션 | 3 | **Stage 3 신규 (28 → 31)** — `CONFIRMED (D-14, 2026-10-02)`. `AppColumn` 안쪽 `overflow-*` 금지의 **유일한 조건부 예외** (그림자 보호 `padding-block`/`margin-block` 구조가 승인 조건, stage-3-approvals §6). 명세 §4.2 |
| **SwipeDeck** | 설문 카드 스택 `179:1781–1783`, 덱 dots `26:21` | stack depth | `items`, `index`, `onIndexChange`, `renderItem`, `prevLabel`, `nextLabel` | `179:1770`, 홈 덱 | 2 | 제스처 전용 금지 — 버튼 대체 조작 필수 (WCAG 2.5.1). 제스처 라이브러리 도입은 승인 필요 |
| **Toggle** | `iOS 26/Toggle 17:113` [S] | on · off (+ pressed · focus-visible · disabled) | `checked`, `onChange`, `label` | **push on/off 1곳** (`/settings/notifications`). 리마인더 토글은 `D-18` 로 Out of Scope | 3 | **Stage 3 신규 (28 → 31)** — `CONFIRMED (D-14, 2026-10-02)`. **사용처가 1곳이어도 3종 유지 확정** (`CONFIRMED (approvals §9.2, 2026-10-03)`) — `D-14` 원칙은 사용처 개수 조건이 아니며, **사용처 0건**이 될 때 제외한다. **iOS kit 복제 금지, HARU 토큰으로 구현**. 치수 3종(`--toggle-track-w/h`, `--toggle-knob-size`) = **`가값 (P-20)`** — `provisional` 주석, 디자이너 값 도착 시 값만 교체 (`§8.5 ⑤`). 명세 §4.5 |
| **Spinner / Skeleton** | **Figma 누락** → design-agent 명세 (#22) | — | `size`, `label`, `decorative`, `announce` / `shape`, `lines` | 전 데이터 화면 | 1 | 공통 상태 CONFIRMED (사용자 결정 2026-09-14, #22), 화면 `가값 (P-10)`. 프로토타입 `haru-dot` (점 3개 1.2s) 참고 가능, motion `가값 (P-07)`. **`announce`** (Spinner) = `'auto'`(기본, `role=status` + `aria-live=polite`) · **`'none'`**(role · `aria-live` 없음, 라벨은 접근성 트리에 남음 — 바깥 컨테이너가 이미 `aria-live` 를 가질 때만, 2026-11-10 `D5-12`). `decorative` 가 우선. 사용처: 피드백 화면 state slot (`S5-C`) |
| **EmptyState** | **Figma 누락** → design-agent 명세 (#22) | — | `illustration`, `title`, `description`, `action` | Home skeleton 안내(**Stage 2**, #33), 서재·리포트 | 1 | #22, `가값 (P-10)`. 기존 토큰·컴포넌트만 사용 |
| **ErrorState** (+Retry) | **Figma 누락** → design-agent 명세 (#22) | — | `title`, `description`, `onRetry`, `retrying`, `announce` | 전 데이터 화면 | 1 | #22, `가값 (P-10)`. **`announce`** = `'alert'`(기본, `role=alert`) · `'status'` · **`'none'`**(role 없음 — 바깥 컨테이너가 이미 `aria-live` 를 가질 때만, 2026-11-10 `D5-10`). 사용처: 피드백 화면 state slot (`S5-C`) |
| **InlineAlert / Banner** | **Figma 누락** → design-agent 명세 (#22) | tone: info · success · warning · error · offline | `tone`, `title`, `description`, `action`, `onDismiss`, `announce` | 오프라인·업로드·동의 | 1 | #22, `가값 (P-10)`. status 색 `가값 (P-04)`, offline tone = neutral surface (TOKEN_MAP §4). **`announce`** = `'auto'`(기본 — tone 별 기존 role: error·warning = `alert`, 그 외 = `status` + `aria-live=polite`) · **`'none'`**(role · `aria-live` 없음 — 바깥 컨테이너가 이미 `aria-live` 를 가질 때만, 2026-11-10 `D5-10`). 사용처: 피드백 화면 state slot (`S5-C`) |
| **Toast** | **Figma 누락** → design-agent 명세 (#22) | — | `tone`, `message`, `duration`, `action` | 저장·복사·재시도 | 1 | #22, `가값 (P-10)`. `aria-live`, z-index `가값 (P-06)` |
| **Dialog / ConfirmDialog** | **Figma 누락** → design-agent 명세 (#22) (iOS `misc/alert-overlay` 색만) | — | `open`, `title`, `description`, `confirmLabel`, `cancelLabel`, `destructive`, `onConfirm` | 로그아웃 확인(S2 — RECOMMENDED, PRD·Figma·결정 로그 근거 없음)·녹음 폐기(S4)·삭제·탈퇴(S8) | 1 | #22, `가값 (P-10)`. scrim `가값 (P-05)` |

---

## 2. Domain Components (`apps/web/src/entities/*`)

**2026-10-03 갱신 (design-agent)** — `docs/decisions/stage-3-approvals.md` **§9** 반영.

| 변경 | 내용 |
|---|---|
| **`CapabilityBadge` 데이터 원천** | **`D-22` — `ActivityCard.targetCapability` 삭제 확정.** 배지는 **`options[].capability` 만**을 근거로 렌더한다. **`suffix` prop 폐기**(`" Day"` = `N-3` 폐기 + 카드 단위 대표 역량 소멸의 귀결) · **덱 상단·카드 바깥 "오늘의 역량" 배지를 두지 않는다**(채울 데이터가 없다) · `capability` 가 비면 **배지 미렌더** |
| **`PromptPill` 배지 대비 ID** | **`P-02` → `가값 (P-23)`** (approvals §9.2 ⑫). `--prompt-phase-tag-fg` 흰 라벨 1.72:1 은 **별도 가값 ID** 다 — `P-02`(역량 색 4종 위 흰 라벨)와 **대상·교체 조건이 다르다** |
| **`PromptPill` 개수 상한** | **`D-21` — `promptPreview`·`promptSet.questions` 길이 상한 없음.** 카드 접힘 3개는 **cutoff 이며 cap 이 아니다**. `PromptPill` 을 쓰는 컨테이너는 **배열을 자르지 않는다**(`slice` 금지). `n ≥ 4` 표시 규격 = `stage-3-design-spec.md` §5.1.1 |
| **`PromptPill` 배지 2개** | `phase` + `pageRef` **동시 값이면 2개를 렌더한다** (approvals §9.2 ⑪). Figma 동시 예시 부재는 **공백이지 충돌이 아니다**. contract 는 두 필드를 **독립 optional 로 유지**하며 서버에 "하나만 보내라" 를 요구하지 않는다 |
| **`Toggle` 3종 유지** | 사용처가 push on/off **1곳으로 줄었어도 신규 3종(§1)은 유지**한다 — `D-14` 는 사용처 개수 조건이 아니다 (approvals §9.2). 사용처 **0건**이 되면 그때 제외 |

**2026-10-02 갱신 (design-agent)** — `docs/decisions/stage-3-approvals.md` §8 반영.

| 변경 | 내용 |
|---|---|
| **`StreakChip` → `WeekSummaryChip`** | **개명 확정** (`§8.5 ④`). `HomeSummary.streakDays` 는 **삭제**된다. 표시 항목 = **이번 주 세션 수 1개만**(`D-6`). 통합 후보 **J 해소** |
| **`PromptPill` 단계·페이지 배지** | **렌더 확정** (`D-8` · §8.1) — Figma 기준 채택. `phase`(`pre`\|`post`\|`null`) · `pageRef`(`string`\|`null`) 를 **배지로 표시**하며 값이 없으면 미렌더. 별도 `PromptPhaseTag` 컴포넌트를 만들지 않고 **`Tag`(size=xs)** 를 조합한다 (통합 후보 E 의 `PromptPhaseTag` 안은 **컴포넌트화하지 않는 쪽으로 종결**) |
| Stage 3 신규 Shared UI | **3종 + `ListRow` 확장 (28 → 31)** — §1 머리말 참조 |


| Component (제안) | Entity | Figma source | Variants / States | Proposed props | Used in | Stage | 비고 |
|---|---|---|---|---|---|---|---|
| **CapabilityBadge** | capability | `Tag 76:439–445` (green/cyan/pink/purple), `163:2648` 배지, `Cardtitle 85:592` [S] | capability 4종 × size (~~suffix("Day")~~ **폐기**) | `capability`, `size` (~~`suffix`~~ **폐기**) | 덱 카드(**카드마다 1개**), 책 시트, 프로필(누락) | 3 | 라벨 = Emotion Regulation · Self-Direction · Cognitive Flexibility · Intrinsic Motivation — CONFIRMED (사용자 결정 2026-09-14, #14). 색 = Tag 색 통일 (agency green · emotion pink · flexibility cyan · motivation purple) — CONFIRMED (사용자 결정 2026-09-14, #19). 글자 색 `-fg` = `가값 (P-02)`. **데이터 원천 = `options[].capability` 만** — **`CONFIRMED (D-22, approvals §9, 2026-10-03)`**: `ActivityCard.targetCapability` 가 contract 에서 삭제되므로 **덱 상단·카드 바깥 "오늘의 역량" 배지를 두지 않고**, 값이 비면 **배지를 렌더하지 않는다**(기본 역량 대체 금지). **`" Day"` suffix 와 `suffix` prop 은 폐기** — `N-3`(approvals §6) + `D-22` 의 귀결이며, 이전 RECOMMENDED("전체 라벨 + ' Day'")는 **하루 1개 역량 전제**에서 나온 것이라 성립하지 않는다 (Figma "Emotion Day Day" 오타도 옮기지 않는다). 명세 `stage-3-design-spec.md` §5.2 · §12.4 |
| **CapabilityProgressRow** | capability | `163:2609–2632` Growth themes [DC] | tone per capability | `capability`, `value`, `levelLabel` | `31:102` | 7 | 라벨 #14, 바 색 = `--color-capability-*-chart` (#19). "strong/growing/emerging" 라벨 M-12 결정 전 표시 금지 |
| **CapabilityDiamondChart** | capability | **Figma 누락** — 디자인 소스 C-13 (Stage 2 에서 결정) | single · overlay(이전/현재), 축 선택 | `scores`, `previousScores`, `selectedAxis`, `onAxisSelect`, `summaryLabel`(a11y 대체 텍스트) | 프로필, 발전 역량, 리포트 상세 | 2 | FR-04/06. **inline SVG** — CONFIRMED (사용자 결정 2026-09-14, #9). 입력 = Baseline v1 역량 점수(응답 문항 평균 1.0–5.0, C-8). 축 라벨 #14, 축 색 `-chart` #19. 한 역량 전 문항 결측 시 표시 방식은 Stage 2 Plan |
| **PersonaCard** | persona | **Figma 누락** — 디자인 소스 C-13 (Stage 2 에서 결정) | default · fallback | `name`, `description`, `illustration` | 프로필, 리포트 | 2 | FR-05 |
| **CharacterBubble** | session / home | `Bubble 88:721` (Type2 `50:176`, sessopn `88:757`, Type3 `88:838`), `Bubble/Home/Onlysession 88:922`, `88:929` [S][DC] | tail 위치, title+subtitle | `title`, `subtitle`, `tail`, `onPress`(홈 CTA 여부 결정 후) | `26:21`, `28:51`, `29:62` | 2 | **통합 후보 G**: Type3(Prompt 목록)은 버블이 아니라 PromptDrawer/PromptList 로 분리. 문구는 서버 템플릿 값만 (rules/frontend §8) |
| **CharacterMedallion** | character | `28:73/28:74`, `29:86/29:87`, `179:1703/1704`, `179:1750/1751`, `179:1822/1823`, asset `163:2528` [S] | size 136 · 174 · 188 · 200 · 232; animation: idle · listening · celebrate (누락) | `asset`, `size`, `motion`, `decorative` | Auth, Onboarding, Session | 2 | 크기 5종 → 3단계 통합 RECOMMENDED, 단계 값 = `가값 (P-16)` (sm 136 · md 188 · lg 232). 캐릭터 사용 권리 확보 CONFIRMED (사용자 결정 2026-09-14, C-17). listening/celebrate 에셋 없음 (FR-11) |
| **CharacterIllustration** | character | `26:22` (home), `179:1819`, `163:2642` (bookworm) [S] | asset | `asset`, `crop` | Home, Baseline saved, Progress | 2 | 권리 확보 (C-17). 원본 PNG 1MB+ → 최적화 포맷·해상도는 Stage 1 Plan |
| **BookCover** | book | `113:1992` 표지, `113:1991` Selected (pastel 대체 표지 + check) [S] | default · selected · placeholder | `src`, `title`, `tone`, `selected`, `size` | 서재, 카드 | 3 | 표지 사용 권리 확보 — CONFIRMED (사용자 결정 2026-09-14, C-17) (M-35 해소). alt 필수 |
| **BookShelfItem** | book | `This Week's Shelf 113:1993` (Default \| Selected) [S] | default · selected (+ "▶ Session" Tag) | `book`, `capabilityLabel`, `selected`, `onPress` | `30:74` | 3 | 캡션 "Confidence"(4대 역량 외)는 **4대 역량 표시 라벨로 교체** — CONFIRMED (사용자 결정 2026-09-14, #14) (M-13 해소). `capabilityLabel` 은 capability key → copy 모듈 라벨. Figma 수정은 디자이너 요청 |
| **BookListRow** | book / session history | `Book List 163:2145` 행 [S] | — | `book`, `sessionCount`, `finishedAt`, `rating`(M-14 결정), `onPress` | `30:74`, `163:1669` | 3 | ListRow 조합 |
| **BookSummary** | book | `86:517–86:526` (cover + title + author + reason) [S] | compact · full | `book`, `reason`, `density` | 덱 카드, 책 시트 | 3 | |
| **ReadingNowCard** | book | `145:1141` [S] | — | `book`, `progress`, `lastReadLabel` | `145:1132` | 보류 | PRD 근거 없음 (M-14) |
| **PromptPill** | prompt | `Prompt Card 86:324` (Style=Default, arrow_first, arrow, arrow_last, color/arrow_first, color/arrow, cppr/arrow_last, Tagtype, pagetype) [S], **`Pagetag1–3 139:2410–2412`** (PRE 50×22 · POST 60×22 · P.6 45×22, 실측 2026-10-02) | tone: outline · tinted; **단계 배지 · 페이지 배지 각각 유무** | `text`, `tone`, **`phase`**, **`pageRef`** | 카드, 책 시트, 버블, Drawer | 3 | **통합 후보 H**. **`D-8` 확정 (2026-10-02): 배지를 실제로 렌더한다** — 값이 없으면 미렌더, 라벨은 copy 모듈, `pageRef` 는 서버 값 그대로. 배지는 **`Tag`(size=xs) 조합**이며 신규 컴포넌트가 아니다. 색 = Tier-3 `--prompt-phase-tag-bg/-fg`(**역량 색 토큰 직접 사용 금지** — cyan 이 Cognitive Flexibility 와 겹친다). arrow 계열은 pill 이 아니라 캐러셀 컨테이너의 prev/next → PromptCarousel 로 분리. `cppr` 오타. tinted 배경 위 `text-button` 라벨 4.18:1 = `가값 (P-11)`, 배지 흰 라벨 1.72:1 = **`가값 (P-23)`** — `CONFIRMED (approvals §9.2 ⑫, 2026-10-03)`, **`P-02` 에 흡수하지 않는다**(대상·교체 조건이 다르다). **`D-21`(approvals §9.1)**: `promptPreview`·`promptSet.questions` **길이 상한 없음** — 카드 접힘 3개는 **cutoff 이며 cap 이 아니고**, 컨테이너가 배열을 **자르지 않는다**(`slice` 금지). `phase`+`pageRef` **동시 값이면 배지 2개를 렌더**한다 (`CONFIRMED (approvals §9.2 ⑪)` — Figma 동시 예시 부재는 **공백이지 충돌이 아니다**, contract 는 독립 optional 유지). 명세 §5.4 · **§5.4.1** · §5.1.1 |
| **PromptCarousel** | prompt | arrow variants + `88:960` 내부 [S] | first · middle · last (화살표 비활성) | `prompts`, `index`, `onIndexChange` | PromptDrawer | 4 | |
| **CoachingNote** | prompt | `86:527` "Remember tonight" (pink tint), `86:482` 설명 블록(beige `color/grey/92`) [S] | tone | `eyebrow`, `text`, `tone` | 덱 카드, flip back, Drawer | 3 | |
| **ActivityOptionCard** | activity-card | `Prompt Card/Home 86:397` (size=Min\|Max, badge, flip=front\|back, keyword=green\|cyan\|pink\|purple\|Default, type=default\|shelf) [S]; `Prompt Card/Min/Emotion 86:512`, `/Resilience 86:545`; instances `163:2649–2651`, `86:438`, `86:482`, `145:1085` | density: compact · full; face: front · back; kind: book · reread_book · conversation_only(누락) | `option`, `capability`(= **`option.capability`**, `D-22`), `density`, `face`, `showCoaching`, `showContext`, `actions` | 홈 덱, 책 시트 | 3 | **통합 후보 I**. **`D-22`**: `capability` 는 **option 값**이며 카드 단위 `targetCapability` 는 없다. **`D-21`**: `option.promptPreview` 를 **자르지 않고** 접힘 3개 cutoff + 확장으로 전부 렌더한다 (§5.1.1). `type=shelf` 는 Prompt 카드가 아니라 서재 목록 시트 → LibraryShelfSheet 로 분리. 카드 하단 Prompt 가 ActionBar 와 겹침 (`163:2648` overflow) |
| **ReadingContextChip** | activity-card | `86:538` "Bedtime · 9:00 PM" [S] | — | `context`, `time`, `onPress` | 덱 카드 | 3 | 선택 UI 는 Feature (누락) |
| **WeekSummaryChip** (← `StreakChip`) | activity-card | `26:40` "12-day/115 Min" (clock icon), `30:91` "12-day streak" (star icon) [S][DC] — **두 칩을 하나로 통합** | — (표시 전용) | `sessionsThisWeek` | Home TopBar, Library TopBar (**같은 값·같은 창**) | 3 | **개명 확정** (`CONFIRMED (§8.5 ④, 2026-10-02)`). **통합 후보 J 해소.** 표시 = **이번 주 세션 수 1개만**(`HomeSummary.sessionsThisWeek`, `D-6`). **누적 분("115 Min")·연속 일수("12-day") 미표시**이며 **`HomeSummary.streakDays` 는 contract 에서 삭제**된다. 아이콘 = `30:91` star. 라벨 "{n} this week" / n=0 → "None yet this week". **목표·달성률·비교 표현 금지**(`streak`·`goal`·`on track`·`{n}/7`). 명세 `stage-3-design-spec.md` §5.7 |
| **AttendanceStickerChip** | reward | `29:79` [DC] | — | `dayCount`, `message` | `29:62` | 4 | 스티커 획득 모션 누락 |
| **RecordButton** | recording | `Record Control 163:1590` (Record \| Pause) [S][DC], `163:1591`, `163:1601` | idle · recording(pause 아이콘) · paused(누락) · disabled(누락) · permission-denied(누락) | `state`, `onPress`, `label`, `elapsedLabel` | `28:51` | 4 | 10px 라벨 "Tap to recording" 문법·크기·대비. 맥동 모션 = DESIGN_SYSTEM §9 |
| **SurveyQuestionCard** | onboarding | `179:1783` [DC] | — | `counter`, `eyebrow`, `question`, `children` | `179:1770` | 2 | 문항 = Baseline Survey v1 10문항(ER 2 · AG 3 · CF 2 · IM 3), eyebrow "IN THE PAST TWO WEEKS", `children` = RadioGroup 6옵션(빈도 5 + "Haven't had the chance to see this yet") — CONFIRMED (사용자 결정 2026-09-14, C-8), D-04. 문항 문자열은 contracts/fixture 값만 표시 |
| **NotableQuoteCard** | report | `163:2633`, `110:830–834` [DC] | — | `quote`, `speakerLabel`, `sourceLabel` | Progress, 리포트 상세 | 7 | §13 민감 발화 마스킹된 서버 값만 |
| **WeeklyReadingChart** | report | `163:2551` [DC] | 요일 7개, 최대값 강조 | `days`, `highlightMax`, `summaryLabel` | `31:102` | 7 | M-10 채택 시만. 차트 대체 텍스트 필수 |
| **AttendanceCalendar** | reward | `110:522` 월 달력 + attend 스탬프 [S] | — | `month`, `attendedDays` | `110:522` | 보류 | PRD 근거 약함 |
| **ReportArchiveCard** | report | `110:844–861` [S] | ready · generating(누락) · not-eligible(누락) | `period`, `summary`, `progress`, `pdfStatus`, `onOpen`, `onDownload` | `110:522` | 7 | |
| **HighlightClipPlayer** | report | **Figma 누락** | playing · paused · expired · error | `clip`, `expiresAt` | 리포트 상세 | 7 | FR-18. **Figma 누락** — design source decided per stage (C-13). 만료 표시 기간은 OAQ-13 |
| **UploadStatusBadge** | recording | **Figma 누락** | local_only · queued · uploading · uploaded · failed_retrying · stalled_48h | `status`, `lastAttemptAt` | 세션 완료, 설정 데이터 관리(S8) | 4 | 별도 upload status 모델 CONFIRMED (사용자 결정 2026-09-14, #16) — 값 목록은 ARCHITECTURE §10.5 기준. 디자인 소스 C-13 |
| ~~**AnalysisStatusCard**~~ → **ShortFeedbackBubble** | analysis (`entities/analysis`) | **Figma 누락** — 표면은 버블 `88:929` 재사용 | text 있음 · (text null → 렌더 안 함, 호출자 판단) | `text` | 피드백 | 5 — **구현됨** (`S5-C`) | **별도 상태 카드를 만들지 않는다** (Stage 5 Spec §4, `D5-4`): 상태 표면 = 기존 `InlineAlert`·`ErrorState`·`Spinner`, 피드백 = `SessionCompleteBubble`(`subtext=null`) 래핑. 문구는 API `shortFeedback.text` 만. 이하 원 기록: `analysisOutcome` 모델 CONFIRMED (사용자 결정 2026-09-14, #16) — 값은 ARCHITECTURE §10 / API_CONTRACTS §2 기준 (OAQ-17 의존 값 `skipped_audio_deleted` 는 결정 전 제외, `skipped_consent_revoked` 는 C-4 로 제거). 디자인 소스 C-13 |

---

## 3. Feature Components (`apps/web/src/features/*`)

| Feature Component | Feature 폴더 | Figma source | 조합 (Shared/Domain) | 상태·서버 데이터 | Stage | Figma 상태 |
|---|---|---|---|---|---|---|
| SocialAuthButtons | auth | `179:1709`, `179:1833` | Button(glass, icon) + Google 공식 로고 + **Apple 공식 가이드 버튼** | AuthGateway provider 결과, 취소·실패. 성공 후 항상 동의 화면 (C-2) | 2 | Apple 버튼 = Apple 공식 가이드 버튼 — CONFIRMED (사용자 결정 2026-09-14, C-13, #21) (M-16 해소) |
| SignUpForm / LogInForm | auth | `179:1724`(보호자 영역만), `179:1820` | FieldGroup, TextField, Button | 검증, 제출, 에러 | 2 | **SignUpForm = 보호자 필드(이름·이메일·비밀번호)만**, 아이 필드·동의 체크박스 없음 — CONFIRMED (사용자 결정 2026-09-14, C-5) (M-28 해소). error 상태는 #22 명세 |
| PasswordResetForm | auth | — | FieldGroup, Button, InlineAlert | 요청·완료·만료 | 2 | **Figma 누락** — design source decided per stage (C-13) |
| GuardianConsentForm | consent | `179:1742` 일부 | CheckboxGroup(**5항목**), TextLink(문서 보기), Button | `GET /v1/consent-documents/current`, `POST /v1/consents` (항목별 문서 버전) | 2 | 필수 ① 이용약관 ② 개인정보처리방침 ③ 아동 음성·성장 데이터 처리 보호자 동의(별도 체크), 선택 ④ 마케팅 수신, 추가 ⑤ 파일럿(베타) 참여 동의 — ⑤ 필수/선택은 **법무 L-02** 결정 전 config 로 주입. 모든 가입 경로 공통 화면. **동의 철회 UI 없음** — CONFIRMED (사용자 결정 2026-09-14, C-1·C-2·C-4) (M-01·M-02·M-27 해소). **Figma 누락** — design source decided per stage (C-13) |
| VpcStep | consent | — | Surface, Button, InlineAlert | VPC 결과 (Mock) | 2 | 동의 화면 뒤 VPC 단계 **슬롯만** 두고 Mock 으로 진행, 방식은 법무 L-01 — CONFIRMED (사용자 결정 2026-09-14, C-3). **Figma 누락** — design source decided per stage (C-13) |
| OnboardingWizard | onboarding-survey | `179:1748`, `179:1740`(Step 1 필드 소스), `179:1770`, `179:1809` | TopBar, ProgressBar, FieldGroup/TextField(아이 성·이름), SelectTrigger(성별), SwipeDeck, SurveyQuestionCard, RadioGroup | draft 저장·복귀, 가입 전 기기 로컬 draft (C-12), 동의 후 submit | 2 | **PRD 5단계** (C-9): Step 1 아이 정보 — 이름 **성·이름 두 칸** (C-6, **D-03**, 화면 호칭은 first name 만), 성별 **Girl / Boy / Prefer not to say** 선택 항목 (C-7) → 2 기질 카드 → 3 책·선호 주제 → 4 성장 목표 → 5 Baseline v1 10문항 (C-8, **D-04**). 모두 CONFIRMED (사용자 결정 2026-09-14). Step 1 누락 필드·Step 2–4 **Figma 누락** — design source decided per stage (C-13) |
| ProfileResultView / GrowthCapabilityPicker | child-profile, growth-capability | — | CapabilityDiamondChart, PersonaCard, Button | ProfileResult, SetGrowthCapability | 2 | **Figma 누락** — design source decided per stage (C-13) (M-07) |
| ActivityCardDeck | activity-card-deck | `26:21`, `163:2648`, `86:*` | SwipeDeck, ActivityOptionCard, PageIndicator, CharacterBubble | today card fetch, 오프라인 캐시, selection | 3 | 코칭·Context 배치 불일치 (M-30) |
| PromptReveal (flip) | book-selection | `86:482`, flip icons `85:501/85:506` | ActivityOptionCard(face) | ActivityCardSelection | 3 | flip 모션 누락 |
| ReadingContextSelector | reading-context | `86:538` 결과만 | Sheet, RadioGroup/Chip, 시간 picker(누락) | SelectActivityOption.readingContext | 3 | **Figma 누락** — design source decided per stage (C-13) |
| LibraryShelves / LibraryShelfSheet / BookDetailSheet | library | `30:74`, `163:1669`, `145:1132` | Carousel, BookShelfItem, ListGroup, Sheet, ActivityOptionCard | library 목록·필터, book prompts | 3 | Empty 누락 |
| AddOwnBookForm, GiftRequestFlow | library | — | FieldGroup, ListRow, Tag | AddOwnBook, CreateGiftRequest | 3 | **Figma 누락** — design source decided per stage (C-13) |
| ~~NotificationPreferencesForm~~ · **PushPermissionPrompt** | notification-preferences | `17:113` Toggle 만 | ListGroup, Toggle, Button | push device (Stage 3 Web + Mock, 네이티브 Push Adapter Stage 4 — #7) | 3 (push) / **이월** (설정 폼) | **`D-18` 범위 축소 (2026-10-02)**: 알림 **설정 화면**(카드 갱신 시간·리마인더 요일/시간 입력, `C13-19`)은 **Stage 3 Out of Scope** — 디자이너 Figma 요청 후 도달 Stage 로 이월. **Stage 3 구현 유지** = `PushPermissionPort` + Web 구현 + Mock + 권한 사전 안내 UX(`D-16`). contracts `notification-preferences`·`push-devices` **정의는 유지**. **Figma 누락** — design source decided per stage (C-13) |
| StorytimeSessionView (RecordingControls, SessionBubble) | storytime-session, recording | `28:51`, `163:1601`, `163:1618/1620`, `78:353` | RecordButton, Button, CharacterMedallion, CharacterBubble, TopBar | RecordingController 구독, transitions, 10분 리마인드 / 30분 자동 종료(실제 녹음 시간, 일시정지 제외 — #17) | 4 | 상태 혼합 (M-25, M-26 — 미결정). 진입은 Activity Card·서재 "Start Session", 세션 탭 없음 (#15, D-02) |
| PromptDrawer | prompt-drawer | `88:960` | Sheet, PromptCarousel, CoachingNote, PageIndicator | SessionSummary.prompts | 4 | 트리거 버튼 누락 |
| MicPermissionGate / ConversationOnlyMode | recording | — | CharacterMedallion, Surface, Button | PermissionService | 4 | **Figma 누락** — design source decided per stage (C-13) |
| UploadQueueNotice / RecoveryNotice | recording | — | InlineAlert, UploadStatusBadge | UploadQueue, 크래시 복구 | 4 | **Figma 누락** — design source decided per stage (C-13) |
| SessionCompleteView | storytime-session | `29:62` 상단 | AttendanceStickerChip, CharacterMedallion, CharacterBubble | completionBubble, stickerAward | 4 | celebrate 모션 누락 |
| ReflectionCard (~~ReflectionForm~~) | reflection | `91:691` | StarRating, Chip(`select`), TextInput, Button | ReflectionFormDefinition, SubmitReflection(멱등) | 5 — **구현됨** (`S5-B`) | 완료 화면 footer slot. 자유 후기 2번째 카드 없음·Skip 없음 = Figma V.2 (`N5-02` · `N5-06`). 칩 줄 사이 hit = 중간선 분할 (`D5-6`, `useChipRowSplit`) |
| SessionFeedbackScreen + AnalysisStatusView (~~ShortFeedbackView~~) | session-feedback | — (`29:62` 상단 골격 재사용) | IconButton(glass close), Text h1, CharacterMedallion + 링, ShortFeedbackBubble, InlineAlert(info), ErrorState, Spinner | `useSessionAnalysis` 폴링 15s · `failed` 60s · 종착 정지 (`N5-14`) + 세션 상세 1회(녹음 삭제 판별) | 5 — **구현됨** (`S5-C`, route `/session/:sessionId/feedback`) | **Figma 누락** — `C13-S5-1` design-agent 명세 (Stage 5 Spec §2.3). VG `docs/design/stage-5-visual-gap-s5c.md` |
| GrowthReportOverview | growth-report | `31:102`, `110:522` (탭바 제외) | StatTile, WeeklyReadingChart, CapabilityProgressRow, NotableQuoteCard, ReportArchiveCard, SelectTrigger | ReportOverview, 발행 기준 진행도(녹음 세션 3회 + 누적 1시간, 저품질 제외, 첫 세션 완료일부터 28일 주기 — #17) | 7 | 탭 표시 라벨 **Progress** (#15, D-02). IA 결정 (M-10 — 미결정) |
| ReportDetailView, ReportPdfAction | growth-report, report-pdf | `110:854` Download PDF 만 | CapabilityDiamondChart(overlay), PersonaCard, HighlightClipPlayer, Button | ReportDetail, ReportPdfStatus | 7 | **Figma 누락** — design source decided per stage (C-13) |
| SettingsMenu | settings | `26:44` 진입 아이콘만 | ListGroup, ListRow, ConfirmDialog | me | **2 → 3 → 6 → 8 확장** | 목록: Stage 2 **로그아웃** → Stage 3 **알림 행**(목적지는 `D-18` 로 **push 권한 블록만**) → Stage 6 **전체 설정**(아이 프로필 수정·설문 재응답·발전 역량 변경 등) → Stage 8 **데이터 관리·탈퇴** (+ 동의 이력 보기 = **선택 기능 (C-19)**) — CONFIRMED (사용자 결정 2026-09-14, C-16·C-19). 목록 화면 **Figma 누락** — design source decided per stage (C-13) |
| ChildProfileEditor | settings | — | FieldGroup, TextField, SelectTrigger, OnboardingWizard(설문 재응답) | children | 6 | **Figma 누락** — design source decided per stage (C-13) |
| AccountActions, ConsentHistory, DataManagementPanel | settings, data-management | — | ListGroup, ListRow, ConfirmDialog, UploadStatusBadge | me, consents(이력 보기만), deletion requests, recordings | 8 | 이월 기능 **Stage 8** — CONFIRMED (사용자 결정 2026-09-14, C-15). FR-21 데이터 관리 = 보관 정책 안내·세션별 녹음 삭제·전체 삭제 요청 (P0). ConsentHistory 는 **선택 기능 (C-19)** — 여유가 있으면 읽기 전용 목록으로 구현, 미구현이어도 QA FAIL 아님. 철회 UI 없음 (C-4). 필수 이월 기능 = AccountActions(탈퇴)·DataManagementPanel. **Figma 누락** — design source decided per stage (C-13) |

---

## 4. Page-only Components

| Component | Page | Figma | 비고 |
|---|---|---|---|
| WelcomeHero | WelcomePage | `179:1703–179:1708` | CharacterMedallion + 워드마크 + tagline |
| AccountSections | SignUpPage | `179:1731` ("YOU" 섹션만) | SectionLabel + FieldGroup 배치. "YOUR CHILD" 섹션 `179:1737` 은 가입 화면에서 제외 (C-5) |
| ChildInfoStep | OnboardingStepPage (Step 1) | `179:1737`–`179:1740` 필드 소스 | 아이 성·이름 두 칸 (C-6, D-03), 성별 SelectTrigger (C-7), 생년월 + 나이 Tag. 나머지 Step 1 필드 **Figma 누락** — design source decided per stage (C-13) |
| SettingsListPage | SettingsPage | — (진입 `26:44` 만) | ListGroup 조립. Stage 별 항목 추가 (C-16). **Figma 누락** — design source decided per stage (C-13) |
| SurveyIntroPanel | OnboardingIntroPage | `179:1756–179:1764` | |
| BaselineSavedHero | OnboardingSavedPage | `179:1813`, `179:1819` | |
| HomeHeader (AppHeader) | HomePage | `26:39`, `26:40`, `26:44` | **Stage 2** (#33): wordmark `26:39` + settings IconButton `26:44` 로 Home skeleton 헤더 구성. `WeekSummaryChip`(← `StreakChip`) `26:40` 은 **Stage 3**. 워드마크 `26:39` 는 SF Pro Heavy 21px (텍스트 로고) — 로고 에셋화 NEEDS DECISION |
| HomeSkeleton | HomePage (Stage 2) | `26:21` 헤더만 | **Stage 2** — HomeHeader + EmptyState 안내. 로그인·온보딩 완료 후 착지 화면 — CONFIRMED (사용자 결정 2026-09-14, #33). Activity Card 덱·기타 Home 콘텐츠·BottomTabBar 는 Stage 3. EmptyState 문구·레이아웃은 Stage 2 design spec |
| SessionCompleteHeader | SessionCompletePage | `29:75`, `29:76`, `29:79` | |
| LibraryHeader / ProgressHeader | LibraryPage / ReportOverviewPage | `30:89–93`, `31:115–120` | TopBar(variant=large) + trailing chip |

---

## 5. 통합 후보 (Integration Candidates) — RECOMMENDED (design-agent 제안)

사용자 결정이 이미 반영된 부분은 행에 표기했다: C 의 탭 구성(#15, D-02), E 의 capability 색(#19)·성별 옵션(C-7), I 의 keyword 색(#19). 나머지 통합 구조는 Stage 1 Spec 승인 시 함께 확인한다.

| ID | Figma 반복 패턴 | 제안 통합 결과 | 근거 | Figma 정리 요청 |
|---|---|---|---|---|
| A | `Button 17:20` (Glass/Accent × 4 states), `Button/White 86:245`, `Button/card 86:372`, `Button/Filter 40:316`, 화면 instance 높이 45 / 56 / 58 | **Button**(`variant`=glass·accent, `size`=md·lg, `leadingIcon`, `trailingIcon`) + **ButtonGroup**. `Button/Filter` 는 역할이 선택 필터이므로 **Chip(variant=glass)** 로 이동 | Button/White = Glass + leading star (같은 역할·API). Button/card = 버튼 2개 조합 | 높이 3종 → 2종(md 45 / lg 56) 확정 요청 — lg 56 vs 58 = `가값 (P-15)` |
| B | `Select 90:626` (Green/Transparent), `Button/Filter 40:316`, 회고 칩 `91:710–714` | **Chip**(`selected`, `variant`=filled·outline·glass) | 모두 on/off 선택 | variant 이름을 State=Selected/Unselected 로 |
| C | `Screen/Tab Bar 25:87`, `Tab Bar/Center 140:2971`, `110:522` 비컴포넌트 탭, `Tab 17:25`, `Tab Bar 17:26`, `iOS 26/Segmented Control 17:122` | **BottomTabBar**(`items`, `activeKey`, `centerItem`) = `25:87` 단일 소스 (Library / Home / Progress) — 앱 내비게이션 / **SegmentedTabs** — 화면 내 보기 전환 (보류). `110:522` 탭은 폐기 | 전역 내비게이션과 화면 내 세그먼트는 역할이 다름. `Tab`/`Tab Bar` 는 템플릿 잔존. 탭 구성 CONFIRMED (사용자 결정 2026-09-14, #15), D-02 | Tab Bar 1종으로 정리, variant 이름 Report → Progress (디자이너 요청) |
| D | `Title 139:2734` (Titla type=Three/two), `78:353`, 화면별 헤더(back+title, back+title+forward, centered title+close, large title+chip) | **TopBar**(`variant`=large·inline·centered·pill, `leading`, `title`, `trailing`) | 모두 화면 상단 내비게이션 역할 | `Titla` 오타, 헤더 컴포넌트화 요청 |
| E | `Tag 76:440` (green/cyan/pink/purple, *_icon, Boy/Girl/Not selected), `Pagetag1–3 139:2410–2412`, `Cardtitle 85:592`, age Tag "3yr 4mo" | **Tag**(`tone`, `size`=sm·xs, `leadingIcon`) (Shared) + **CapabilityBadge**(Domain, capability→tone: agency green · emotion pink · flexibility cyan · motivation purple, #19) + ~~**PromptPhaseTag**~~ — **컴포넌트화하지 않는다** (`D-8`, 2026-10-02): PRE/POST/P.n 은 **`Tag`(size=xs) 조합**으로 `PromptPill` 안에서 렌더한다 (M-29 종결) ; Boy/Girl/Not selected → **SelectTrigger** (옵션 Girl / Boy / Prefer not to say, C-7) | Pagetag1–3 은 텍스트만 다른 동일 컴포넌트, Boy/Girl 은 선택 트리거 역할 | `purple icon` / `purple_icon` 표기 통일, Pagetag 1개로, 성별 옵션 문구 "Not selected" → "Prefer not to say" 선택지 추가 (디자이너 요청) |
| F | `Pagenation 88:789`, `Deck Dots 27:85` (둘 다 `26:21` 에 배치), `30:74`·`88:960` 내부 dots | **PageIndicator**(`count`, `index`) | 동일 역할 중복 배치 | `26:21` 중복 제거 |
| G | `Bubble 88:721` (Type2, sessopn, Type3), `Bubble/Home/Onlysession 88:922` | **SpeechBubble**(Shared 시각) + **CharacterBubble**(Domain 문구) ; Type3 의 Prompt 목록은 **PromptDrawer/PromptCarousel** 로 분리 | Type3 는 버블 역할이 아님 (M-25) | variant 이름 `sessopn` 오타, Type2/Type3 의미 있는 이름으로 |
| H | `Prompt Card 86:324` 9 styles (Default, arrow_first, arrow, arrow_last, color/arrow_first, color/arrow, cppr/arrow_last, Tagtype, pagetype) | **PromptPill**(`text`, `phaseTag`, `tone`=outline·tinted) + **PromptCarousel**(prev/next, first/last 비활성) | 9개 중 실제 축은 tone 2 × 태그 유무 2 × 캐러셀 위치 3 | `cppr` 오타, 축별 property 로 재구성 |
| I | `Prompt Card/Home 86:397` (size, badge, flip, keyword, type), `Prompt Card/Min/Emotion 86:512`, `Prompt Card/Min/Resilience 86:545`, `Prompt Card/Session 88:960` | **ActivityOptionCard**(`density`, `face`, `showCoaching`, `showContext`) + **LibraryShelfSheet** (type=shelf 분리) + **PromptDrawer** (Session 분리) | 이름에 "Prompt Card" 가 붙었지만 역할이 덱 카드 / 서재 목록 시트 / 세션 Drawer 로 3가지. `badge=Filipback, flip=Self-Direction` 처럼 property 값이 뒤섞임 (`86:395`) | property 값 오염 정리, keyword 색 = capability 로 명명 (green=Self-Direction · pink=Emotion Regulation · cyan=Cognitive Flexibility · purple=Intrinsic Motivation, #19·#14). `Prompt Card/Min/Resilience 86:545` 이름의 "Resilience" 는 표시 라벨이 아님 (#14) |
| ~~J~~ | `26:40` "12-day/115 Min", `30:91` "12-day streak" | **해소 — `WeekSummaryChip`(`sessionsThisWeek`)** 1종으로 통합 | 동일 역할 | **종결 (`D-6` + `§8.5 ④`, 2026-10-02)**: 표시 항목 = 이번 주 세션 수 1개. `days`·`minutes` prop 폐기, `streakDays` contract 필드 삭제 |
| K | CharacterMedallion 크기 5종 (136/174/188/200/232) | size 3단계 (sm 136 · md 188 · lg 232) | 화면별 임의 크기 | 디자이너 확인 — `가값 (P-16)` |
| L | 카드 radius 16/20/22/24/28/30/32, 흰색 반투명 fill 50/62/74/82/85/86/90% | Surface `radius` 토큰 6단계 (`indicator`·`control`·`field`·`surface`·`card`·`pill`, DESIGN_TOKEN_MAP §5.2), `fill` 3단계 (a50·a74·a90) | DESIGN_TOKEN_MAP §5 | 토큰 바인딩 요청 — `--radius-surface` 22 vs 24 = `가값 (P-12)` |

---

## 6. iOS 26 Kit (`17:368`, 라이브러리 "iOS and iPadOS 26") — 재구현 금지 / 조건부

`get_libraries` 결과 파일에 Material 3, Simple Design System, iOS 18, iOS 26, watchOS 26, visionOS 26, macOS 26 커뮤니티 라이브러리가 연결되어 있다. HARU 화면은 이 중 iOS 26 의 색·텍스트 스타일 변수만 사용한다 [DC].

| Figma | 판단 | 라벨 | 이유 |
|---|---|---|---|
| `Screen/Status Bar 25:21`, Dynamic Island, Home Indicator (`179:1723` 등) | **구현 금지** | CONFIRMED | 기기 크롬. Web은 `env(safe-area-inset-*)` 로, Capacitor 셸은 OS가 그림 |
| `iOS 26/Button 17:106` (Bordered Prominent/Bordered/Secondary/Borderless × L/M/S) | **구현 금지** | RECOMMENDED | HARU Button(Glass/Accent)이 대체. 화면 사용 0건 |
| `iOS 26/Stepper 17:114`, `iOS 26/Slider 17:118` | **구현 금지** | RECOMMENDED | PRD 요구 없음, 화면 사용 0건 |
| `iOS 26/Toggle 17:113` | **조건부 — 종결**: Stage 3 에서 **HARU 토큰으로 Web 구현**한다 (iOS kit 복제 금지) | **CONFIRMED (D-14, 2026-10-02)** | Capacitor WebView 안에서는 네이티브 UISwitch 를 쓸 수 없음 (Web DOM). 치수 3종은 kit 외 근거가 없어 **`가값 (P-20)`** 으로 진행한다 (`§8.5 ⑤`) |
| `iOS 26/Segmented Control 17:122` | 보류 | RECOMMENDED | 사용 화면 없음 |
| iOS 시스템 시트·Alert·Action Sheet·Date Picker·Share Sheet | Web 구현 또는 Capacitor 플러그인 | NEEDS DECISION | 날짜/시간 선택(Context 직접 시간, 생년월), 공유(FR-17 PDF) — 네이티브 picker/share 플러그인 사용 시 Stack 확장 승인 필요 |
| Material 3 / Simple DS / watchOS / visionOS / macOS 라이브러리 | 사용 안 함 | RECOMMENDED | HARU 화면에서 참조 없음 — 파일 정리 권장 |

---

## 7. PRD 에 필요하지만 Figma 에 없는 컴포넌트 (요약)

아래 컴포넌트는 모두 **design source decided per stage (C-13)** — 해당 Stage 에서 화면마다 디자이너 Figma / design-agent 명세 중 사용자 선택 후 작업. 예외는 비고에 표시.

| Component | 분류 | PRD | Stage | 비고 |
|---|---|---|---|---|
| CapabilityDiamondChart (single / overlay / 축 선택) | Domain | FR-04, FR-06, §7.3, §7.7 | 2 | inline SVG (#9), 대체 텍스트, 라벨 #14 · 색 #19 |
| PersonaCard | Domain | FR-05, FR-15 | 2 | 일러스트 배경 에셋 없음 |
| GuardianConsentForm (CheckboxGroup **5항목**: 필수 3 + 선택 1 + 파일럿 1, 문서 링크·버전) + VpcStep 슬롯 | Feature | FR-02 | 2 | CONFIRMED (사용자 결정 2026-09-14, C-1·C-2·C-3). 철회 UI 없음 (C-4) |
| Onboarding Step 1–4 입력 (Step 1 아이 성·이름·성별·생년월 + 관계 선택 등, 기질 카드, 책 검색·목록 입력, 주제 태그 멀티선택, 목표 선택) | Feature + Shared(Chip multi, Search field) | FR-03 | 2 | 5단계 CONFIRMED (C-9). Step 1 이름·성별·생년월 필드는 `179:1740` 소스 (C-5·C-6·C-7, D-03) |
| Baseline Step 5 비채점 옵션 표시 | Shared(RadioGroup) | FR-03 | 2 | CONFIRMED (C-8, D-04) |
| Apple 로그인 버튼 | Feature | FR-01 | 2 | Apple 공식 가이드 버튼 — 디자인 불필요 (C-13) |
| Settings 목록 (Stage 별 확장) | Shared(ListGroup) + Feature | §7.8 | 2 · 3 · 6 · 8 | CONFIRMED (사용자 결정 2026-09-14, C-16) |
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
| ~~AnalysisStatusCard~~, ShortFeedback, 저품질 안내 | Domain / Feature | FR-13, FR-14, §13 | 5 | **해소 (2026-11-09)** — `C13-S5-1` 명세로 구현 (`ShortFeedbackBubble` + `AnalysisStatusView`). 상태 카드 신규 컴포넌트 없음 |
| Report eligibility progress, delayed notice | Domain | FR-16, §13 | 7 | |
| HighlightClipPlayer (+expired) | Domain | FR-18 | 7 | |
| PDF 생성 상태 / 공유 | Feature | FR-17 | 7 | |
| Settings 상세 화면 (알림 설정 S3, 아이 프로필·발전 역량 S6), 데이터 관리·동의 이력 보기·탈퇴·삭제 진행 상태 (S8) | Shared + Feature | §7.8, FR-21 | 3 · 6 · 8 | 이월 기능 Stage 8 — CONFIRMED (사용자 결정 2026-09-14, C-15·C-16). 동의 이력 보기 = **선택 기능 (C-19)**, 미구현이어도 QA FAIL 아님. 동의 철회 없음 (C-4) |
| Loading / Empty / Error / Toast / Dialog 공통 패턴 | Shared | rules/frontend §7 | 1 | **C-13 예외** — design-agent 명세로 Stage 1 선구현, CONFIRMED (사용자 결정 2026-09-14, #22), `가값 (P-10)` |
| Focus ring, Error field state, Disabled chip/input | Shared state | NFR 접근성 | 1 | **C-13 예외** — #22 명세. 토큰 이름 CONFIRMED (#10), 값 `가값 (P-03)` · `가값 (P-04)` |
