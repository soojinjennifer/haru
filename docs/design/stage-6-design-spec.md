# Stage 6 Design Spec — Profile Result · Growth Focus · Settings (Child Info · Survey Update) · Update Display

Status: **APPROVED (2026-11-15, user)** — `D6-8` *"전부 권고안대로 승인"* (`docs/decisions/stage-6-approvals.md`). 이전: **DRAFT — 사용자 승인 대기** (2026-11-14, design-agent). 승인 체크포인트 = Plan §19.4. 이 문서는 승인이 아니다.
Based on:
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — **라이브 조회 2026-11-14** (`mcp__8c8226df…` 커넥터). 조회 노드는 §0.1
- Plan `docs/plans/stage-6-plan.md` **개정 1** (§17 Handoff) · 결정 `docs/decisions/stage-6-approvals.md` `D6-1`~`D6-7`
- 요구 목록: `docs/design/stage-2-designer-request.md` §2·§3·§4·§7 (Stage 2-B 요청서 — `D6-1` 로 이 Spec 이 대체 선행)
- 형식 선례: `docs/design/stage-5-design-spec.md` · 토큰 `packages/design-tokens/src/**` · UI `packages/ui/src/**` · 기존 화면 코드 (전부 읽기만)

Author: design-agent. ⛔ Production Code · Figma 수정 없음. 신규 토큰·컴포넌트 변경은 **요청**이며 구현은 development-agent (승인 후).

> ⚠️ **Figma 도착 시 재정렬 대상 (`R6-01`)** — 이 Spec 의 `C13-09`·`C13-10` 화면, `CapabilityDiamondChart` · `PersonaCard` 시각은 **Figma 근거가 없는 design-agent 명세**다. 디자이너 프레임(`1g · Profile result` · `1h · Growth capability`)이 들어오면 최우선 규칙에 따라 Figma 로 교체한다. 그래서 값은 전부 **토큰**으로만 정의하고, Figma 근거 없는 값은 가값 `P-30`~ 로 표시한다.

---

## 0. 측정 방법과 결과 요약

### 0.1 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[pages]` | `get_metadata` (nodeId 없음) | 파일 루트 — 페이지 5개(`8:2` · `16:2` · `125:765` · `66:202` · `0:1`) 변동 없음 |
| `[meta]` | `get_metadata` | **`16:2` 전체**(1,371줄 — 결과 파일을 python 으로 깊이 4 frame 목록 + 이름 키워드 검색) · **`8:2` 전체** · `86:396` |
| `[ctx]` | `get_design_context` — **선언값**(fill · effect style · padding · gap · 텍스트 스타일) | `248:1159` · `179:1809` · `179:1770` · `243:1147` · `76:440` · `26:44` · `17:122` · `163:2607` |
| `[var]` | `get_variable_defs` | `163:2607` |
| `[png]` | `get_design_context` 첨부 렌더 | **배치 확인 용도만** — 색·그림자는 png 에서 읽지 않았다 |
| `[계산]` | WCAG 2.x 상대휘도 · 기하 산술 (python) | 대비 · 차트 크기 · 반응형 |
| `[직독]` | 저장소 파일 | 토큰 · `packages/ui` · `ChildInfoStep` · `OnboardingIntro` · `SettingsMenu` · contracts |

### 0.2 Figma 재확인 (Plan §17-1) — **결과: Stage 6 화면 프레임 여전히 0** `[pages][meta]`

- `16:2` 의 깊이 ≤4 frame 전수: `31:204`(Home·Session·Library·Report) · `179:1700`(가입·설문 — `179:1701`·`1724`·`1748`·`243:1147`·`179:1770`·`1809`·`1820`·`248:1159`) · `296:1127`(Recording DRAFT). **`1g · Profile result` · `1h · Growth capability` 없음.**
- 이름 키워드(`persona` · `profile` · `setting` · `recommend` · `diamond` · `radar` · `edit` · `updated` · `capabil` · `strength` · `growth` · `chart` · `1g` · `1h`) → 걸린 것은 Plan 과 같다: `163:2608`/`110:806` *"Growth themes"*(Report) · `243:1156` 온보딩 인트로 문장 · `179:1778` *"Capability-items"*(설문 헤더).
- `8:2` Design Guide: 다이아몬드·페르소나·설정 행 컴포넌트 **없음** (세트 목록 Plan §0.1 과 동일).
- ⇒ **디자이너 산출물 미도착 확인.** Figma 실측 전환 조건 불성립 → `D6-1` 대로 design-agent 명세.

### 0.3 재사용 근거 노드 실측 `[ctx][var]`

| 노드 | 선언값 (요약) | 이 Spec 에서 쓰는 곳 |
|---|---|---|
| **`248:1159`** Step 1 (구현 현황) | 섹션 라벨 **SF Bold 12 · tracking 0.72 · `#7d9291`** 대문자(`YOUR CHILD` · `ABOUT YOU` · `AT HOME`) · 입력 `Input 76:447` 341 radius 22 white + blur 12 + drop `0 12 14`/`0 2 2` · 라벨 Medium 11.5 `#9aabaa` · 값 Regular 16 `#3b4a48` · 언어 칩 카드 346 radius 30 `glass-fill-strong` + `0 6 4` · 칩 = `Select 90:626` · 독서 루틴 = `Answer card 244:1376` 행(`rgba(233,240,237,.8)` · radius 16 · pad 15/13 · gap 11 · Semibold 14.5 · 선택 `#85bfb6` + white) · CTA `Button/Next (Accent)` 56 · bottom 44 | `/settings/child` 폼 (§2.4) — 이미 `ChildInfoStep` 이 구현한 recipe 그대로 |
| **`179:1809`** Baseline saved | 캐릭터 `179:1819` · 제목 Black 27/33 *"Thank you — that's the starting point"* · CTA **`Get Started` + → 아이콘** 58 | **시각 불변** — CTA 목적지만 Home → `/onboarding/profile` (R-7). 화면 픽셀 변화 0 |
| **`179:1770`** Survey cards | 헤더 Semibold 14 `#5e7370` · 진행바 6 · 카드 345×546 radius 32 white 90% + Glass Rest · `1 / 10` · 문항 Bold 18.5/26 · 옵션 = Answer card 행 | `/settings/child/survey` 카드 (§2.5) — 기존 `SurveyCardDeck` 그대로 |
| **`243:1147`** Step 1 intro | medallion 200(→`md` 188, `AD-S2-3`) · 카드 341 radius 26 pad 22/20 white 90% · 제목 Bold 21/27 · 본문 Regular 14.5/22.5 `#6b807d` · InfoRow 2 · CTA 58 *"Start the questions"* | 재응답 진입 화면 골격 (§2.5) — 기존 `OnboardingIntro` 그대로 |
| **`163:2607`** Report "Growth themes" 카드 | **pad 16 · gap 12 · radius 24 · `glass-fill-strong` 90% · Style `HARU/Shadow Rest` 이나 인스턴스 렌더 = drop `0 6 4` 1겹 + inset 2겹**(= `--shadow-bubble`, `V-10` 선례) · 제목 Bold 15 `text-primary` · 행 라벨 Semibold 12.5 `#5e7370` · 막대 8 radius 4 track `ink 12%` · 행 **순서 = Self-Direction → Emotion Regulation → Cognitive Flexibility → Intrinsic Motivation** · 막대 색 **teal / pink / blue / violet-67 `#ac93c4`** `[var]` | ① 앱 안 "역량 데이터 카드" 의 **유일한 Figma 선례** → 프로필 카드 recipe (§3.4) ② **축 순서 근거** (Q6, §8) ③ ⚠️ 역량 색이 Tag(#19)와 다르다 → `N6-47` |
| **`76:440`** Tag | 역량 4색 = `accents/green·cyan·pink·purple` · 라벨 Semibold 12/12 white · pad 13/7 · pill. `Color=Not selected` 81×18 `#c7c9d7` Bold 9 | 강점·growing edge 표시 (§3.5) |
| **`26:44`** Home 설정 아이콘 | 38 원 · `glass-fill` 74% · drop `0 6 4` · 글리프 19 | 진입 — **변경 0** (Stage 2 구현 그대로) |
| **`17:122`** iOS Segmented Control | iOS kit (`fills/tertiary` · selected white) | ❌ 쓰지 않는다 — iOS kit 재구현 금지(COMPONENT_MAP §6), 축 선택은 RadioGroup 으로 (§3.2) |
| **`86:396`** Activity Card (front) | 설명 줄 `85:543`/`85:544` (257×40, 2줄) = 구현의 `reason` 문장 자리 | warm·난이도 하향 = **문장만 교체, UI 변경 0** (§2.8) |

---

## 1. 대상 화면 (C-13 8건 — 전부 design-agent 명세, `D6-1`·`D6-2`)

| # | ID | Route | Page (가칭, 이름 확정은 dev) | Layout | Figma 근거 |
|---|---|---|---|---|---|
| 1 | **`C13-09`** 프로필 — 온보딩 모드 | `/onboarding/profile` | `OnboardingProfilePage` | `StackLayout`, TopBar 없음 | 없음 — §0.3 `163:2607` recipe |
| 1' | **`C13-09`** 프로필 — 재방문 모드 (+FR-15) | `/settings/profile` | `ProfilePage` | `StackLayout` + TopBar centered (설정과 같은 규격) | 〃 |
| 2 | **`C13-10`** 발전 역량 — 온보딩 모드 | `/onboarding/growth-capability` | `OnboardingGrowthPage` | `StackLayout`, TopBar = 뒤로만(→ 프로필) | 없음 |
| 2' | **`C13-S6-4`** 발전 역량 — 설정 모드 (`D6-6` 흡수) | `/settings/growth-capability` | `GrowthCapabilityPage` | `StackLayout` + TopBar centered | 없음 |
| 3 | **`C13-S6-1`** 설정 목록 확장 | `/settings` (기존) | `SettingsPage` (기존) | 기존 | 진입 `26:44` |
| 4 | **`C13-S6-2`** 아이 정보 수정 | `/settings/child` | `ChildInfoEditPage` | `StackLayout` + TopBar centered | `248:1159` 입력 recipe |
| 5 | **`C13-S6-3`** 설문 재응답 진입·진행·복귀·완료 | `/settings/child/survey` (진입) · `/settings/child/survey/:step` (카드) | `SurveyUpdatePage` | 진입 = TopBar 뒤로 · 카드 = feature TopBar(온보딩 위저드와 같음) | `243:1147` · `179:1770` |
| 6 | **`C13-S6-6`** 공통 상태 (저장 중·실패·오프라인·이탈 확인·Toast) | 위 화면들 | — | — | 기존 `Toast` · `InlineAlert` · `ConfirmDialog` · `ErrorState` · `Skeleton` |

- `C13-S6-5`(업데이트 표시)는 `D6-1` 로 **#1' 에 포함**.
- route `/settings/child/survey/:step` 은 RECOMMENDED — 단계별 새로고침·이탈 복귀를 온보딩(`/onboarding/:step`)과 같은 방식으로 다루기 위해서다. 한 route 로 내부 상태만 쓰고 싶으면 dev 가 바꿀 수 있다(시각 영향 0).

---

## 2. 화면별 레이아웃

### 2.0 공통 규칙

| 항목 | 값 | 근거 |
|---|---|---|
| 좌우 거터 | `--layout-gutter` 24 | `P-13` 확정 |
| 섹션 간격 | `--space-5` 20 (`ChildInfoStep` 의 `gap-5` 와 같음) | `[직독]` |
| 섹션 라벨 | **SectionLabel recipe** = `Text caption-1 · tone secondary · weight semibold`(대문자는 copy 가 대문자로 씀) — `ChildInfoStep` 이 "컴포넌트를 만들지 않는" recipe 로 쓰는 것 그대로 | `248:1159` · `[직독]` |
| 데이터 카드 | §3.4 **ProfileCard recipe** (`163:2607`) | `[ctx]` |
| 주 CTA | `Button variant="accent" size="lg" fullWidth` (56) — **흐름 배치**(콘텐츠 끝, `mt-auto pt-8`), sticky 아님 | `OnboardingIntro` 선례 · `P-15` |
| 본문 색 | 설명 문장은 **`--color-fg-primary`**(ink-700) — 보조색(ink-500)은 카드 위 3.14~3.23, 배경 위 2.0~2.72 로 AA 미달 `[계산]` (Q2 제안, §8) | 요청서 Q2 |
| 아이 이름 | **`child.firstName` 만** — `lastName` 표시 0 (요청서 §2.2-1) | AC-6-56 |

### 2.1 `C13-09` 프로필 — 온보딩 모드 `/onboarding/profile`

```
StackLayout (TopBar 없음 — N6-24 ⓐ: 뒤로 없음)
└─ ProfileResultView mode="onboarding"            (features/child-profile-view)
   ├─ header  (pt --space-6)
   │   ├─ h1  Text title-3 bold primary           "Here's where we're starting with {firstName}"
   │   └─ p   Text subheadline primary            "not a verdict" 안내 (copy §10.1)
   ├─ ProfileCard  "Starting point"               (§3.4)
   │   ├─ CapabilityDiamondChart mode="display"   (§3.1)
   │   └─ (변형 C 일 때만) caption               "We'll draw this together as you read."
   ├─ ProfileCard  강점 · growing edge            (§3.5)
   │   ├─ SectionLabel "WHAT WE SAW MOST"  + Tag ×≤2
   │   ├─ Divider (1px --color-divider)
   │   └─ SectionLabel "WHERE WE'LL LOOK NEXT" + Tag ×≤2
   ├─ PersonaCard                                 (§3.3)
   └─ CTA  Button accent lg "Next"  → /onboarding/growth-capability (push)
```

| 항목 | 명세 |
|---|---|
| 진입 | `/onboarding/saved` CTA → **`replace`** 로 진입 (R-7) — 뒤로 가기로 제출된 설문에 돌아가지 않는다 |
| 순서 근거 | 요청서 §2.1 *"강점이 먼저 보이고 성장 여지는 다음에 함께 볼 것"* — 차트 → 강점/edge → 페르소나 → CTA |
| 스크롤 | `AppShell` 뷰포트 세로 스크롤 (393×852 기준 콘텐츠 ≈ 900+ — §7.2) |
| 진행 | **모든 변형(A/B/C)·fallback 에서 CTA 활성** (요청서 §2.4 끝) |

### 2.2 `C13-09` 프로필 — 재방문 모드 `/settings/profile` (+ FR-15)

```
StackLayout  topBar = TopBar centered  title "Profile"  leading ← Back (navigate(-1))
└─ ProfileResultView mode="revisit"
   ├─ (profileUpdatedAt ≠ null 일 때만) UpdateNote   Text footnote primary + Icon rotate-ccw(16, decorative)
   ├─ ProfileCard  "Where {firstName} is right now" — 차트
   ├─ ProfileCard  강점 · growing edge
   └─ PersonaCard
   (CTA 없음 · 수정/재응답/발전 역량 링크 없음 — 설정 목록에 이미 같은 행이 있다, N6-38)
```

| 항목 | 명세 |
|---|---|
| h1 | TopBar 제목 *"Profile"* 가 h1 (TopBar 구현 `[직독]`). 본문 heading 은 h2 부터 |
| FR-15 업데이트 표시 (`N6-03` ⓐ) | `profileUpdatedAt` 이 non-null 이면 카드 위 한 줄. 문구는 `latestSnapshot.source` 로 고른다(UI copy 선택일 뿐 — 생성·가공 아님): `session_analysis` → *"Updated {Mon D} from your recent storytimes"* · `survey_update` → *"Updated {Mon D} from your latest answers"* · `onboarding_survey` 또는 `null` → **표시 0**. 날짜 = 기존 `formatMonthDay` |
| 온보딩 모드 | **UpdateNote 렌더 0** (AC-6-36) |
| `persona-changed` | 새 `name`·`description` 를 **그대로** 표시. "New" 배지·이전 페르소나 비교 **없음** — contract 에 이전 값이 없고 변경 이력은 Stage 7 (PRD §7.3) |
| `empty` (스냅샷 1개) | UpdateNote 0 — 그 외 화면은 성공과 같다 |
| Home | 서버 `characterLine` 만 (새 UI 0, `P6-BIP-11`) |

### 2.3 `C13-10` / `C13-S6-4` 발전 역량 — **한 컴포넌트 2모드** (`D6-6`)

```
StackLayout
  onboarding: topBar = TopBar centered  title ""  leading ← Back → /onboarding/profile (N6-24 ⓐ)
  settings  : topBar = TopBar centered  title "Growth focus"  leading ← Back (navigate(-1))
└─ GrowthCapabilityPicker mode="onboarding"|"settings"   (features/growth-capability)
   ├─ h1/h2  Text title-3 bold primary   onboarding: "Pick one to focus on together"
   │                                     settings  : (TopBar 가 h1) — 본문 제목 없음
   ├─ p      Text subheadline primary    제안 문구 (§10.2 — suggested 유무로 2종)
   ├─ ProfileCard
   │   └─ CapabilityDiamondChart mode="selectable" selectedId onSelect   (§3.1)
   ├─ RadioGroup variant="card" legend="Growth focus" (legendVisuallyHidden)   ← 대체 선택 목록 (요청서 §3.4)
   │   └─ 옵션 4 — label = 표시 라벨(#14) · meta = "Suggested"(onboarding) / "Current"(settings)  (§3.2 확장)
   ├─ p  선택된 역량 설명            Text subheadline primary · aria-live="polite"   (§10.2 4문장)
   ├─ p  "You can change this anytime in Settings."   Text footnote primary   (onboarding 만)
   └─ CTA  onboarding: "Start with this"  → PUT → Home (replace)
           settings  : "Save"             → PUT → Toast "Saved" → navigate(-1)
       + (선택 없음일 때) 비활성 사유 caption  "Choose one to continue."  (§2.3.2)
```

#### 2.3.1 상태

| 상태 | 온보딩 | 설정 |
|---|---|---|
| Default | `growthCapability`(= 서버 제시값, `D-2 ⑤`) **미리 선택** · 해당 옵션 meta *"Suggested"* | 현재값 선택 · meta *"Current"* · **CTA 비활성(변경 없음)** |
| User changed | 선택만 이동, *"Suggested"* 표시는 **원래 옵션에 남는다** — 그것이 "제안과 다르다"의 유일한 표현(요청서 §3.3, 추가 UI 0) | 선택 이동 → CTA 활성 · *"Current"* 는 원래 옵션에 남음 |
| 제안값 없음 (`growthCapability: null`, `all-scores-missing`) | **미선택 시작** · 제안 문구 = 무제안 문구 · CTA 비활성 + 사유 caption | 현재값 null → 미선택 시작 · 같은 처리 |
| null 축 | 선택 **가능** (`N6-11` ⓐ) — 차트 축·목록 옵션 모두. 목록 옵션에 점수 표시 없음(애초에 숫자 미노출) | 같음 |
| 저장 중 | `Button loading` (기존 — 누름 무시, 포커스 유지) · 차트·목록 `disabled` | 같음 |
| 저장 실패 (`error`·`offline`) | **선택 보존** + CTA 위 `InlineAlert tone="error"` (오프라인 = 기존 `networkErrorCopy` 아닌 §10.6 전용 문구) · 다시 누르면 재시도 | 같음 |
| Loading (`GET /profile`) | §3.6 Skeleton | 같음 |
| Error · Offline (조회) | `ErrorState` + *"Try again"* · 온보딩 모드는 아래 `TextLink` *"Continue to Home"* 추가(`N6-37`) | `ErrorState` + *"Try again"* |

#### 2.3.2 CTA 비활성 사유

- 시각: CTA 바로 위 `Text footnote primary` *"Choose one to continue."* — **선택이 없을 때만** 렌더. `Button` 에 `aria-describedby` 로 연결.
- 이유: 요청서 §3.3 *"이때 CTA는 선택 전까지 진행 불가 — 그 이유를 어떻게 알릴지"*. 시각 텍스트 1줄 추가는 Figma 밖 → `N6-45` 확인.

### 2.4 `C13-S6-1` 설정 목록 `/settings`

```
SettingsMenu (기존 flex col gap-4 py-6)
├─ SectionLabel  "YOUR CHILD"
├─ ListGroup label="Your child"
│   ├─ ListRow "Profile"                     trailing chevron-right → /settings/profile
│   ├─ ListRow "Child info"                  trailing chevron-right → /settings/child
│   ├─ ListRow "Update survey answers"       trailing chevron-right → /settings/child/survey
│   └─ ListRow "Growth focus"                trailing chevron-right → /settings/growth-capability
├─ SectionLabel  "ACCOUNT"
└─ ListGroup label="Account"
    └─ ListRow "Log out"   (기존 — ConfirmDialog destructive, 변경 0)
```

| 항목 | 명세 | 결정 |
|---|---|---|
| 행 | **위 5행이 전부** — 알림·데이터 관리·탈퇴·동의 이력 행 0 (AC-6-2·15) | `N6-38` |
| 재응답 진입 위치 (`N6-13`) | **설정 목록의 별도 행** — 아이 정보 화면 안 링크로 숨기면 발견성이 낮고, 두 화면의 저장 단위(즉시 PATCH vs 단계별 draft)가 다르다 | `N6-38` |
| 그룹 (`N6-18`) | **2그룹 + 시각 SectionLabel** — `248:1159` 의 섹션 라벨 패턴. Stage 8 데이터 관리 행은 `ACCOUNT` 그룹에 붙는다 | `N6-38` |
| 행 subtitle | **없음** — 목록이 새 데이터(`GET /profile`)에 의존하지 않게 한다 → 설정 목록 Loading/Error 상태 **해당 없음**(AC-6-17 = N/A 기록) | `N6-38` |
| chevron | Lucide `chevron-right` 16 `--color-fg-tertiary`, `decorative` — 이동 행임을 모양으로 표시. 로그아웃 행에는 없음(동작 행) | — |
| 로그아웃 | 변경 0 · Stage 2 AC 회귀 | — |

### 2.5 `C13-S6-2` 아이 정보 수정 `/settings/child`

```
StackLayout  topBar = TopBar centered "Child info"  leading ← Back (dirty 면 ConfirmDialog)
└─ ChildInfoEditForm   (features/child-profile-edit)
   ├─ section  SectionLabel "YOUR CHILD"
   │   ├─ FieldGroup  TextField firstName · TextField lastName (helper "Optional")
   │   ├─ SelectTrigger birthYear · SelectTrigger birthMonth  + Tag(xs) 나이 (`3yr 4mo`, 기존 ageTagLabel)
   │   └─ SelectTrigger gender
   ├─ section  SectionLabel "AT HOME"
   │   └─ fieldset languages — Chip ×N (기존 haru-choice-group)
   ├─ section  RadioGroup variant="card" legend "Reading routine"
   ├─ (실패 시) InlineAlert tone="error"
   └─ CTA  Button accent lg "Save"   (변경 없음 → disabled)
```

| 항목 | 명세 | 근거 / 결정 |
|---|---|---|
| 필드 | **Step 1 의 아이 필드 전부** — firstName · lastName · birthYearMonth · gender · languageEnvironment · readingRoutine (`N6-04` ⓐ) | `D6-3` |
| ⚠️ 관계(relationship) | **넣지 않는다** — 보호자 소유 데이터(`D-16`, `PATCH /v1/me`)라 `UpdateChild` 한 요청(AC-6-19)에 섞을 수 없다. Step 1 의 `ABOUT YOU` 섹션·Trial notice 는 이 화면에 없다 | **`N6-39`** (Plan 은 "Step 1 전 필드" 로만 적었다) |
| 선택지 | 현재 구현값 그대로 (`N6-27` ⓐ, `D6-7`) | — |
| 표시 모드 | 온보딩의 "표시 행 ↔ 편집" 전환(`DisplayRow` + pencil)은 **쓰지 않는다** — 이 화면은 처음부터 편집 모드(FieldGroup) | 화면 목적이 수정 |
| 재사용 | `ChildInfoStep` 의 필드 블록을 **`entities/child` 의 표현 컴포넌트(`ChildInfoFields`, 제어형)** 로 내려 두 feature 가 조합 (R-11, `N6-41`) — feature 간 import 금지 | Plan §5.1 |
| Save | 변경 필드만 body (AC-6-19) · 진행 중 `loading` · 중복 탭 무시 | — |
| 성공 | `Toast success` *"Saved"* → `navigate(-1)` (→ `/settings`) | `N6-40` |
| `validation-failed` | `details.fields` → 해당 `TextField`/`SelectTrigger` `error` 문구 · 입력 보존 · 첫 오류 필드로 포커스 | AC-6-20 |
| `error` · `offline` | Save 위 `InlineAlert tone="error"` (§10.4) · 입력 **메모리** 보존 · 다시 Save = 재시도 | AC-6-21 · `N6-40` |
| 이탈 확인 (`N6-14` ⓐ) | dirty 상태에서 뒤로·탭바·브라우저 back → `ConfirmDialog` *"Discard changes?"* / *"Your edits to {firstName}'s info won't be saved."* / confirm *"Discard"*(destructive) / cancel *"Keep editing"* | `D6-3` |
| Loading (초기값) | 폼 자리에 `Skeleton` text lines 6 — Save 미렌더 | §3.6 |
| 초기값 Error | `ErrorState` + *"Try again"* | — |

### 2.6 `C13-S6-3` 설문 재응답

#### 2.6.1 진입 `/settings/child/survey` — `243:1147` 골격 재사용

```
StackLayout  topBar = TopBar centered ""  leading ← Back
└─ SurveyUpdateIntro  (OnboardingIntro 와 같은 골격 — 이동 리팩터 R-5 후 공용 컴포넌트)
   ├─ CharacterMedallion asset="headphones" size="md"
   ├─ Surface fill=strong radius=card padding=5  — h1 title-3 + subheadline (copy §10.3)
   ├─ InfoRow clock     "About 3 minutes"          ← 기존 copy 키 재사용 여부 = §10.3 주석
   ├─ InfoRow list-checks "Your earlier answers are filled in"
   └─ CTA  "Start"  |  draft 가 중간이면 "Continue where you left off"
```

- 온보딩 전용 요소 **제외**: `TrialNotice` · `DraftDiscardNotice`(로컬 draft 없음, `N6-07`).
- 보조 본문 색: 이 화면은 `OnboardingIntro` 를 그대로 쓰므로 **기존 tone 유지**(Stage 2 승인 범위) — Q2 의 "primary" 적용 대상 아님.

#### 2.6.2 카드 `/settings/child/survey/:step` — `179:1770` 재사용

- 온보딩 Step **2~5** 만 (`C-7`, Step 1 은 `/settings/child`). 카운터·진행바·카드·옵션·뒤로/앞으로 = **온보딩과 동일 컴포넌트·동일 규칙** (AC-6-24).
- 프리필: 서버 draft 의 현재 응답이 선택된 상태로 시작.
- TopBar: 온보딩 위저드 TopBar 그대로 — 첫 카드에서 뒤로 = 진입 화면.
- 마지막 카드 제출 CTA 라벨: 온보딩 마지막 카드와 **같은 컴포넌트, 라벨만** *"Save answers"* (온보딩 문구는 "starting point" 맥락).

#### 2.6.3 상태

| 상태 | Mock | 표시 |
|---|---|---|
| Loading (state 조회) | `loading` | 진입 화면 CTA `loading` · 카드 화면은 카드 자리 `Skeleton shape="card"` |
| 이탈 복귀 | `survey-update-draft` | 진입 CTA = *"Continue where you left off"* → `currentStep` 카드로 |
| draft 저장 실패 (카드 이동 중) | `error` | 이동은 막지 않는다 — 온보딩 `D-11` 규칙 그대로(다음 이동 때 재시도). 시각 변화 없음 |
| 제출 중 | — | 제출 CTA `loading` |
| 제출 실패 · 오프라인 | `error` · `offline` | 마지막 카드 CTA 위 `InlineAlert tone="error"` (§10.3) · 답 보존 · 같은 IK 재시도 |
| 제출 성공 | `survey-update-submitted` | `Toast success` *"Your answers are saved"* → **`/settings/profile` replace** (`N6-10` + `D6-1`) — 갱신된 프로필(UpdateNote *"…from your latest answers"*) 을 바로 본다 |
| state 조회 Error · Offline | `error` · `offline` | 진입 화면 대신 `ErrorState` + *"Try again"* |

### 2.7 `C13-S6-6` 공통 상태 — 표면 정리

| 상황 | 표면 | 이유 |
|---|---|---|
| 저장 성공 | `Toast success` (기존 `ToastProvider`) | 화면 이동과 함께 — 이동 후에도 보인다 |
| 저장 실패 · 오프라인 (폼·선택 화면) | 실행 버튼 바로 위 `InlineAlert tone="error"` | 입력을 보며 다시 시도한다 · Stage 2 로그아웃 실패 선례 |
| 조회 실패 · 오프라인 | `ErrorState tone="error"|"offline"` + *"Try again"* (기존 `error-copy`·`networkErrorCopy`) | 화면 전체가 데이터 없음 |
| 변경 후 이탈 | `ConfirmDialog` destructive (아이 정보 화면만) | `N6-14` |
| 조회 Loading | `Skeleton` (§3.6) — 전체 화면 스피너 금지 (요청서 §2.5) | — |

### 2.8 Home Activity Card — **UI 영향 없음 확인** (`workflow.md` §4, Plan §17-11)

- warm(`cold-to-warm`) · 난이도 하향(`difficulty-lowered`)은 **설명 줄 `85:543`/`85:544` 의 서버 `reason` 문장과 책**만 바뀐다. 배지·라벨·아이콘 추가 0 (`PF6-1`).
- ⚠️ 제약 1건(Mock 쪽): warm fixture 문장은 **기존 cold fixture 와 같은 길이 범위**(Figma 박스 257×40 = 2줄)를 지킨다 — 카드 높이 baseline 이 바뀌지 않게. 길이 규칙 자체는 기존 카드 CSS 를 따른다(코드 변경 0).
- `179:1809` saved 화면: **시각 불변** (CTA 목적지만 변경) — baseline `s2-onboarding-saved` 재생성 불필요.

---

## 3. 컴포넌트 — Variant / State / Props

### 3.1 `CapabilityDiamondChart` → **`packages/ui` 신규 `DiamondChart`** (도메인 비의존)

`packages/ui` 는 contracts·역량 enum 을 모른다 → 이름도 도메인 중립(`DiamondChart`). 역량 매핑은 `entities/child-profile` 이 한다.

**Props**

```ts
type DiamondTone = 'agency' | 'emotion' | 'flexibility' | 'motivation';   // TagTone 에서 neutral 제외
interface DiamondAxis {
  id: string;                 // entities 가 capability 키를 넣는다
  label: string;              // 표시 라벨 (#14)
  value: number | null;       // 1..max, null = 미관찰
  tone: DiamondTone;
}
interface DiamondChartProps {
  axes: readonly [DiamondAxis, DiamondAxis, DiamondAxis, DiamondAxis];  // 순서 = 위 → 오른쪽 → 아래 → 왼쪽
  max?: number;               // 기본 5
  summary: string;            // 차트 대체 텍스트 (필수) — §9.2
  missingLabel: string;       // 미관찰 축 캡션 ("Not seen yet")
  mode?: 'display' | 'selectable';
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  disabled?: boolean;
  // (Stage 7) previous?: values — 지금 만들지 않는다. 이전 값 = 점선 외곽선으로 확장할 자리만 남긴다
}
```

**기하** `[계산]` — inline SVG, 컨테이너 폭 `W` 에서 계산

| 항목 | 값 |
|---|---|
| 반대각선 `h` | `min(--chart-diamond-radius-max 100, (W − 2·(--chart-diamond-label-max 64 + --chart-diamond-label-gap 6)) / 2)` |
| 값 → 반지름 | `r(v) = h · v / max` — **1.0 이 중심(0)이 아니라 20% 지점**. "최저 = 아무것도 없음" 으로 읽히지 않게 |
| 꼭짓점 | 위 `(cx, cy−r)` · 오른쪽 `(cx+r, cy)` · 아래 `(cx, cy+r)` · 왼쪽 `(cx−r, cy)` |
| 높이 | `2h + 2·(16 + 6)` (위·아래 라벨 1줄 16 + gap) |
| 격자 | 외곽 다이아몬드(v = max) + 중심→꼭짓점 축선 4개. 1px `--chart-grid-stroke`. **중간 눈금 링 없음** (숫자 미노출 — 눈금이 점수 척도로 읽힌다) |
| 축 라벨 | `Text caption-1 semibold` `--color-action-secondary-fg`(ink-600, 카드 위 4.82~4.95 ✅). 위·아래 = 1줄 가운데 · 왼쪽 = 끝 정렬 · 오른쪽 = 시작 정렬, **최대 폭 64 · 2줄 줄바꿈 허용** (`Emotion / Regulation` · `Intrinsic / Motivation`), 말줄임 0 |

**데이터 면 — 한 가지 규칙으로 변형 A/B/C 를 모두 덮는다 (`D-2` 시각, `N6-30`)**

> 면 = **이웃한 두 축이 모두 값이 있는 사분면 삼각형(중심·꼭짓점 i·꼭짓점 i+1)의 합집합**.

| 변형 | 결과 |
|---|---|
| **A** 4축 값 | 사분면 4개 = 일반 다이아몬드 다각형 |
| **B** 1~3축 null | null 축에 닿는 사분면은 **그리지 않는다** → 도형이 null 축 쪽으로 **열린다**(0 으로 꺼지지 않는다). 값 있는 축이 1개면 축선 위 점만, 이웃하지 않은 2개면 점 2개 |
| **C** 4축 null | 면 0 · 꼭짓점 0 · 격자와 라벨만. 카드 안 차트 아래 캡션 *"We'll draw this together as you read."* |

- 꼭짓점(값 있는 축): 원 `--chart-vertex-size` 10, fill = `--color-capability-{tone}-chart`, stroke 2 `--color-surface-solid`(흰 테두리 — 면·선 위에서 분리).
- **null 축**: 축선 = 점선(`--chart-missing-dash` `3 4`) · 꼭짓점 없음 · 라벨 아래 2번째 줄 `missingLabel`(*"Not seen yet"*, `caption-2` 11/13 ink-600). **회색 비활성 처리 금지** — 라벨 색은 다른 축과 같다(요청서 §2.4).
- 면: fill `--chart-area-fill`(teal 30%, `P-31`) · 외곽선 2px `--chart-area-stroke`(teal) `stroke-linejoin: round`. 열린 변(null 쪽) 에는 외곽선을 긋지 않는다.

**`mode="selectable"`**

| 항목 | 명세 |
|---|---|
| 히트 영역 | 축마다 투명 `<button>` = 라벨 박스를 **최소 44×44** 로 확장해 라벨 중심에 둔다 (`--size-touch-min`). 위·아래 라벨은 폭 그대로·높이 44, 좌우는 64×44. 꼭짓점 영역은 포함하지 않는다(축 간 겹침 방지) |
| 선택 표시 (차트 안) | 선택 축 라벨 **bold + `--color-fg-strong`** · 선택 축 꼭짓점(또는 null 축이면 외곽 끝점)에 링 `--chart-selected-ring` 18 / stroke 2 `--color-focus-ring` |
| 선택 표시 (차트 밖) | RadioGroup 선택 행(teal 채움) — 요청서 §3.2-3 "양쪽" 충족 |
| 접근성 | **차트 버튼은 보조 포인터 단축키**: `tabIndex={-1}` + `aria-hidden` 컨테이너. 키보드·스크린리더의 선택 수단은 **RadioGroup 하나**(같은 컨트롤 2벌 노출 방지). 차트 SVG 는 `role="img"` + `aria-label={summary}` |
| disabled | 버튼 비활성 · 시각 변화 없음(저장 중 잠깐) |

**모션** — 처음 그릴 때 면·꼭짓점 `transform: scale(0.6→1)` + opacity, `--motion-duration-slow` · `--motion-ease-standard`, 원점 = 중심. 선택 링 opacity `--motion-duration-fast`. `prefers-reduced-motion: reduce` → **즉시 최종 상태**.

### 3.2 `RadioGroup` — **확장 1건**: 옵션 `meta`

| 항목 | 명세 |
|---|---|
| 변경 | `RadioOption.meta?: string` — 라벨 오른쪽 끝 `Text caption-1` (선택 행에서는 `--color-selected-fg`, 아니면 `--color-action-secondary-fg`). 라벨 `<label>` 안에 있어 **접근성 이름에 포함**(*"Self-Direction Suggested"*) |
| 기존 영향 | 옵션에 `meta` 가 없으면 DOM·레이아웃 **변경 0** (설문·독서 루틴·Stage 4 시트 baseline 불변 — `ListRow.meta` 선례와 같은 원칙) |
| 사용 | 발전 역량 목록 (§2.3). `variant="card"` = `Answer card 244:1376` / `179:1788` — **Figma 컴포넌트 그대로** |

### 3.3 `PersonaCard` → **`packages/ui` 신규 `NarrativeCard`** (도메인 비의존) 또는 `Surface` 조합

| 항목 | 명세 |
|---|---|
| 권고 | **`packages/ui` 컴포넌트를 만들지 않는다** — `Surface` + `Text` 조합으로 충분하고 도메인 표시는 `entities/child-profile/PersonaCard` (Domain, 표시만). Stage 7 히스토리도 같은 Domain 컴포넌트를 쓴다 |
| 구조 | ProfileCard recipe(§3.4) 안: eyebrow SectionLabel *"{FIRSTNAME}'S STORYTIME PERSONA"* → `h2` name `Text title-3 bold primary` → description `Text subheadline primary` |
| 길이 | name ≤ 24자 · description 110~220자 — **말줄임 0**, 높이 가변 (요청서 §2.3) |
| `isFallback` | **구분 UI 0** — 같은 렌더 (AC-6-37·60, §8.4) |
| 일러스트 | **없음** (Q7 제안, §8) |
| state | `default` · `loading`(Skeleton — §3.6. `N6-22` 로 페르소나 별도 지연 없음 → 화면 Loading 에 흡수) |

### 3.4 ProfileCard recipe (`163:2607` 근거) — Shared UI 확장 1건

| 항목 | 값 | 토큰 |
|---|---|---|
| 면 | white 90% | `Surface fill="strong"` |
| radius | 24 → **22 흡수** | `radius="surface"` (`P-12` 확정 규칙 — 24 는 22 로 흡수) |
| padding · gap | 16 · 12 | `padding="4"` · 내부 `gap-3` |
| 그림자 | 인스턴스 렌더 **1겹** `0 6 4 ink 8%` + inset 2겹 | **`--shadow-bubble`** — ⚠️ `Surface` 의 `material` 값에 없다 → **`SurfaceMaterial` 에 `'bubble'` 추가** 요청(`T6-9`, 새 값 0 — 기존 토큰 매핑만) |
| 카드 제목 | Bold 15 `text-primary` | `Text subheadline bold primary` · `h2` |

- 왜 Stage 2 인트로 카드(`243:1155`, Glass Rest 3겹)가 아닌가: 프로필 화면은 **스크롤**한다. Glass Rest 3번째 겹(`0 28 56`)은 좌우 번짐 ≈ 56 > 거터 24 로 `AppShell` 가로 클립에 걸린다(`R-SHADOW-1`) — `--shadow-bubble` 은 4/0/10 로 거터 안. 그리고 `163:2607` 이 **데이터 카드의 Figma 선례**다.

### 3.5 강점 · growing edge

| 항목 | 명세 |
|---|---|
| 표시 | 각 역량 = **`Tag size="sm"` tone = 역량**(`76:440`, 라벨 = #14) — Activity Card 배지와 같은 Figma 어휘 |
| 위계 | 두 묶음이 **같은 컴포넌트·같은 크기·같은 간격** — 차이는 SectionLabel 문구뿐 (요청서 §2.2-5 "시각적 위계가 크게 차이 나지 않아야") |
| 색 단독 금지 | 구분은 섹션 라벨 텍스트 · Tag 라벨 텍스트로 (색은 보조) |
| 순서 | 응답 배열 순서 그대로 (Frontend 정렬·선정 0 — AC-6-59) |
| 빈 배열 | 해당 묶음 자리에 `Text footnote primary` *"We'll see more as you read together."* — 묶음을 숨기지 않는다(변형 C · 부분 결측) |
| Tag 흰 라벨 대비 | 1.49~2.01 — **기존 가값 `P-02`** 범위(신규 아님) |

### 3.6 Loading Skeleton (화면 공통)

| 화면 | 구성 |
|---|---|
| 프로필 | header `Skeleton text lines=2` → 카드 1 = `Skeleton shape="block"` 높이 = 차트 높이(§3.1 계산값) → 카드 2 `text lines=2` → 카드 3 `text lines=3` |
| 발전 역량 | 제목 `text 2` → 차트 block → `Skeleton shape="block"` ×4 (행 44) |
| 아이 정보 | `text lines=6` |
| 접근성 | 컨테이너 `aria-busy="true"` + SR 전용 *"Loading"* 1개 (기존 Skeleton 규칙) |

### 3.7 분류

| 컴포넌트 | 분류 | 위치 | 신규/재사용 |
|---|---|---|---|
| `DiamondChart` | Shared UI | `packages/ui` | **신규** |
| `RadioGroup` `meta` | Shared UI 확장 | `packages/ui` | 확장 |
| `Surface` `material="bubble"` | Shared UI 확장 | `packages/ui` | 확장 |
| `CapabilityDiamond` (역량 → 축 매핑 · 순서 상수 · summary 문장) | Domain | `entities/child-profile` | 신규 |
| `PersonaCard` | Domain | `entities/child-profile` | 신규 (`Surface`+`Text` 조합) |
| `CapabilityTagList` | Domain | `entities/child-profile` | 신규 (`Tag` 조합) |
| `ChildInfoFields` | Domain (제어형 입력 묶음) | `entities/child` | **이동**(R-11, `ChildInfoStep` 에서 추출) |
| `ProfileResultView` (모드 2) | Feature | `features/child-profile-view` | 신규 |
| `GrowthCapabilityPicker` (모드 2) | Feature | `features/growth-capability` | 신규 |
| `ChildInfoEditForm` | Feature | `features/child-profile-edit` | 신규 |
| `SurveyUpdateFlow` | Feature | `features/survey-update` | 신규 (카드 렌더러 = R-5 이동분) |
| `SettingsMenu` | Feature | `features/settings` | 확장 |
| 재사용 그대로 | — | — | `TopBar` · `IconButton` · `ListGroup`/`ListRow` · `Button` · `Tag` · `Text` · `Surface` · `FieldGroup`/`TextField`/`SelectTrigger`/`Chip`/`RadioGroup` · `InlineAlert` · `ErrorState` · `Skeleton` · `Toast` · `ConfirmDialog` · `TextLink` · `CharacterMedallion` · `InfoRow` · `SurveyCardDeck` |

⛔ iOS kit `17:122` Segmented Control · `17:113` Toggle 재구현 0.

---

## 4. 신규 Shared UI / Domain — 요약

- Shared UI **신규 1** (`DiamondChart`) + **확장 2** (`RadioGroup.meta` · `Surface material="bubble"`).
- `PersonaCard` 를 Shared UI 로 만들지 않는다 (Plan §5.1 *"Surface 조합 여부는 design-agent"* → 조합).
- Domain 신규 3 · 이동 1 · Feature 신규 4 · 확장 1.
- 승인 후 `COMPONENT_MAP.md` 의 `CapabilityDiamondChart`·`PersonaCard`·`ChildProfileEditor` 행을 위 분류로 정정한다(이 Spec 작성 시 "DRAFT 명세 선행" 표시만 추가함).

---

## 5. 토큰

### 5.1 그대로 쓰는 것 `[직독]`

| 용도 | 토큰 |
|---|---|
| 카드 면 · 그림자 · radius · padding | `--color-surface-strong` · `--shadow-bubble` · `--radius-surface` · `--space-4` · `--space-3` |
| 본문 · 강조 · 라벨 | `--color-fg-primary` · `--color-fg-strong` · `--color-action-secondary-fg` |
| 역량 색 (꼭짓점) | `--color-capability-{agency,emotion,flexibility,motivation}-chart` (#19) |
| 선택 링 | `--color-focus-ring` · `--focus-ring-width` |
| 격자 · 구분선 | `--color-border-subtle` · `--color-divider` |
| 타이포 | `--text-title-3` · `--text-subheadline` · `--text-footnote` · `--text-caption-1` · `--text-caption-2` |
| 터치 | `--size-touch-min` 44 |
| 모션 | `--motion-duration-slow` · `--motion-duration-fast` · `--motion-ease-standard` |

### 5.2 신규 요청 `T6-x` (전부 승인 필요)

| ID | 토큰 | 값 | Tier | 근거 |
|---|---|---|---|---|
| `T6-1` | `--chart-diamond-radius-max` | 100px | 3 | 480 컬럼에서 차트 상한 (200 + 라벨). Figma 없음 → `P-30` 묶음 |
| `T6-2` | `--chart-diamond-label-max` | 64px | 3 | `Regulation`·`Motivation`(가장 긴 단어) 12 Semibold 폭 ≈ 63~64 `[계산 근사 — VG 실측]` |
| `T6-3` | `--chart-diamond-label-gap` | `var(--space-1-5)` (6) | 3 | 라벨 ↔ 꼭짓점 |
| `T6-4` | `--chart-area-fill` | `color-mix(in srgb, var(--color-action-primary-bg) 30%, transparent)` | 2 | 면 채움. 알파 30% 는 Figma 근거 없음 → **`P-31`** |
| `T6-5` | `--chart-area-stroke` · `--chart-stroke-width` | `var(--color-action-primary-bg)` · 2px | 2 / 3 | 면 외곽선 (teal = `163:2607` Self-Direction 막대·진행바 선례) |
| `T6-6` | `--chart-grid-stroke` | `var(--color-border-subtle)` | 2 | 격자 |
| `T6-7` | `--chart-missing-dash` | `3 4` | 3 | null 축 점선 → **`P-32`** |
| `T6-8` | `--chart-vertex-size` · `--chart-selected-ring` | 10px · 18px | 3 | 꼭짓점 · 선택 링 |
| `T6-9` | (토큰 아님) `Surface material="bubble"` → `--shadow-bubble` | 기존 | — | §3.4 |

신규 HEX 0 · 신규 Primitive 0.

### 5.3 신규 가값 (`P-30` 부터, 번호 재배정 금지)

| ID | 대상 | 현재 값 · 대비 `[계산]` | 교체 조건 |
|---|---|---|---|
| **`P-30`** | **다이아몬드 차트 비텍스트 대비** — 면 외곽선 teal on 카드 **1.98~2.04:1** · 꼭짓점 역량색 **1.49~2.01:1** · 격자 ink18% **1.25~1.26:1** (목표 3:1) | 위 | 디자이너 차트 도착 (요청서 Q3). 정보는 **라벨 텍스트 + SR summary + RadioGroup** 이 전달하므로 1.4.11 의 "필수 이해 요소" 는 텍스트가 담당 |
| **`P-31`** | 차트 면 채움 알파 30% (`T6-4`) | Figma 근거 없음 | 디자이너 |
| **`P-32`** | null 축 표현 — 점선 `3 4` · 꼭짓점 없음 · *"Not seen yet"* 캡션 | Figma 근거 없음 | 디자이너 (요청서 §6.3 "미관찰 축의 선 스타일") |
| **`P-33`** | 차트 기하 — `h` 상한 100 · 라벨 폭 64 · 1.0 = 20% 반지름 · 축 순서 | Figma 근거 없음 | 디자이너 |

(Q2 보조 텍스트는 이 화면에서 **본문색 사용**으로 가값을 늘리지 않는다 — §8 Q2.)

---

## 6. Interaction / Motion (CSS · Pointer Events 전용)

| 대상 | 동작 |
|---|---|
| 차트 첫 표시 | §3.1 scale+opacity slow · reduced-motion 즉시 |
| 축 탭 | 해당 축 선택 = RadioGroup 값 변경과 동일 경로 (`onSelect` → 같은 state) · 링 fade fast |
| RadioGroup | 기존 (화살표 이동=선택) |
| 선택 설명 문장 | 텍스트 교체만 (애니메이션 없음) · `aria-live="polite"` |
| 화면 전환 | 기존 라우팅 (전환 애니메이션 없음) |
| Toast | 기존 |
| 이탈 확인 | 기존 `ConfirmDialog` |

---

## 7. 상태 화면과 Mock 시나리오 매핑

| 화면 | 상태 | Mock (`children` / `activities`) | 명세 |
|---|---|---|---|
| 프로필 (2모드) | 변형 A | `success` | §2.1 |
| 〃 | 변형 B | `scores-partially-missing` | §3.1 |
| 〃 | 변형 C | `all-scores-missing` | §3.1 · §3.5 빈 배열 |
| 〃 | fallback | `persona-fallback` | §3.3 (구분 0) |
| 〃 | Loading / Error / Offline / Retry | `loading` · `error` · `offline` · `retry` | §3.6 · §2.7 · 온보딩 모드 `N6-37` |
| 재방문 | 업데이트 표시 | `profile-updated` · `survey-update-submitted` | §2.2 UpdateNote |
| 재방문 | 페르소나 변경 | `persona-changed` | §2.2 |
| 재방문 | 업데이트 없음 | `empty` | UpdateNote 0 |
| 발전 역량 (2모드) | Default · changed · 제안 없음 · null 축 · 저장 중 · 실패 · 오프라인 | `success` · `all-scores-missing` · `scores-partially-missing` · `loading` · `error` · `offline` | §2.3.1 |
| 설정 목록 | — | 데이터 의존 0 → Loading/Error **해당 없음** | §2.4 |
| 아이 정보 | Loading · 저장 성공 · 필드 오류 · 실패 · 오프라인 · 이탈 확인 | `loading` · `success` · `validation-failed` · `error` · `offline` | §2.5 |
| 재응답 | 진입 · 복귀 · 제출 · 실패 · 오프라인 | `success` · `survey-update-draft` · `survey-update-submitted` · `error` · `offline` | §2.6.3 |
| Home 카드 | warm · 난이도 하향 | `cold-to-warm` · `difficulty-lowered` | §2.8 — UI 변경 0 |
| 공통 | Permission Denied · Not Eligible | 해당 없음 | — |

---

## 8. 디자이너 요청서 Q1~Q7 — **제안** (`N6-25`, 체크포인트 확정 · `D6-7`)

| Q | 질문 요지 | 제안 | 근거 | ID |
|---|---|---|---|---|
| **Q1** | medallion sm/md/lg 확정 · ring | **현행 확정 제안**: `md 188` · `lg 232` · 200→188 흡수(`AD-S2-3`) 유지, ring **없음**(Figma 에 ring 없음 `[직독: CharacterMedallion 주석]`). `sm 136`·`session 174` 는 Stage 4 실측값 그대로. **Stage 6 화면은 medallion 을 재응답 진입(md)에서만** 쓴다 — 새 크기 0 | `P-16` 은 Stage 6 로 바뀌지 않음 → 디자이너 대기 유지 | `N6-32` |
| **Q2** | 보조 텍스트 대비 (2.91~3.13) | **② 이 두 화면(프로필·발전 역량)과 설정 하위 신규 화면에서는 설명 문장에 본문색 `--color-fg-primary`** (카드 위 6.51~6.69 ✅, 배경 위 4.14~5.64 — 그래디언트 끝 4.14 는 문단이 카드 밖일 때만, §9.3). 섹션 라벨(SectionLabel)은 Figma `248:1159` 대로 secondary 유지(기존 `P-01`) | 설명 문장이 많은 화면이라 영향이 크다(요청서). 팔레트 조정(③)은 전역 baseline 변경 | `N6-33` |
| **Q3** | 비텍스트 대비 · 차트 색 사용 | 차트 = 꼭짓점에만 역량색 + 흰 테두리, 면 = teal 30% + teal 2px 외곽선, 격자 ink 18%. 전부 3:1 미달 → **가값 `P-30`** 로 등재, 정보는 텍스트(라벨·summary·목록)로 전달 | 팔레트 밖 색을 만들면 Figma 이탈 + 디자이너 도착 시 재작업 | `N6-34` |
| **Q4** | null 역량 선택 가능? | **가능** (`N6-11` ⓐ — 이미 `D6-3`) | — | (해결됨) |
| **Q5** | 숫자 노출 | **미노출** — 차트·텍스트·SR 모두. SR summary 는 **서버가 준 strengths/growingEdges 와 null 축**만 말한다(§9.2) — Frontend 가 숫자를 말로 바꾸지 않는다(가공 금지) | "점수"로 읽힘 방지(요청서 §7) · `rules/frontend §8` | `N6-29` |
| **Q6** | 축 순서 고정 | **위 Self-Direction → 오른쪽 Emotion Regulation → 아래 Cognitive Flexibility → 왼쪽 Intrinsic Motivation** (시계 방향) | **Figma `163:2607` "Growth themes" 의 역량 행 순서**(앱 안 유일한 역량 나열 Figma 근거) · 긴 단일 라벨(`Self-Direction`·`Cognitive Flexibility`)이 위·아래 1줄 자리, 2단어 라벨이 좌우 2줄 자리에 맞는다 `[계산]`. Stage 7 오버레이도 이 순서 | `N6-28` |
| **Q7** | 페르소나 일러스트 | **없음** (`illustration=none`) — 신규 에셋 0. 보유 에셋은 전부 **HARU 캐릭터**라 아이 페르소나 옆에 두면 "아이 = 캐릭터" 로 읽힐 위험 | 요청서 §4.2 "새 에셋 필요하면 알려 달라" → 필요 없음 | `N6-31` |

---

## 9. Accessibility

### 9.1 이름 · 순서 · live region

| 화면 | 포커스 순서 | 비고 |
|---|---|---|
| 프로필 온보딩 | h1(비인터랙티브) → 차트(`role="img"`, 포커스 없음) → … → `Next` | heading: h1 → 카드 h2 ×3 (*"Starting point"* · *"Strengths and next steps"*(SR 전용 h2, 시각은 SectionLabel 2개) · 페르소나 name) |
| 프로필 재방문 | Back → (UpdateNote 텍스트) → 카드들 | UpdateNote 는 일반 텍스트 — live 아님 (진입 시 이미 존재) |
| 발전 역량 | Back → RadioGroup(1 tab stop, 화살표) → CTA | 차트 버튼 `tabIndex -1` + `aria-hidden` (§3.1). 선택 설명 `<p aria-live="polite">` 1개. CTA `aria-describedby` → 비활성 사유(있을 때) |
| 설정 목록 | Back → 행 5 | 각 행 = button, 이름 = 행 라벨. `ListGroup` aria-label = 그룹 이름 |
| 아이 정보 | Back → firstName → lastName → year → month → gender → 언어 칩 → 독서 루틴 → Save | 오류 시 첫 오류 필드 포커스 · `InlineAlert` role alert |
| 재응답 | 온보딩과 동일 | — |
| Loading | `aria-busy` + SR *"Loading"* 1개 | 기존 |
| 저장 실패 | `InlineAlert tone="error"` (role alert) | 기존 |

### 9.2 차트 대체 텍스트 (summary) — 문장 형식 (`N6-29`)

```
"Starting point for {firstName}. "
+ (strengths.length ? "What we saw most: {A} and {B}. " : "")
+ (growingEdges.length ? "Where we'll look next: {C} and {D}. " : "")
+ (nullAxes.length ? "Not observed yet: {E}. " : "")
```
- 변형 C: *"Starting point for {firstName}. Not observed yet: Self-Direction, Emotion Regulation, Cognitive Flexibility, and Intrinsic Motivation."*
- 재방문 모드 첫 구: *"Where {firstName} is right now."*
- 숫자·"out of 5"·"high/low" 0. 문장 조립은 `entities/child-profile`(copy 템플릿 + 서버 배열) — 판정어 grep 대상.

### 9.3 대비 `[계산 — 카드 = white 90% over #dbeee7 / #d3e3de / #c7c9d7 · 배경 = 그래디언트 그대로]`

| 대상 | 카드 위 | 배경 위 | 판정 |
|---|---|---|---|
| 본문 ink-700 | 6.51~6.69 | **4.14**~5.64 | 카드 ✅ · 배경 끝 4.14 ⚠️ — 배경 위 설명 문장(프로필 h1 아래 안내 · 발전 역량 제안 문구)은 **화면 상단**에 놓여 그래디언트 시작부(5.1~5.6)에 위치. 스크롤로 아래쪽에 오는 *"You can change this anytime…"* · 비활성 사유 caption 은 VG 에서 실제 배경 픽셀로 재측정 → 미달이면 `P-34` 후보 |
| 축 라벨 ink-600 | 4.82~4.95 | — | ✅ |
| SectionLabel ink-500 | 3.14~3.23 | 2.0~2.72 | 기존 `P-01` (Figma `248:1159` 값) |
| Tag 흰 라벨 | 1.49~2.01 (배경색 대비) | — | 기존 `P-02` |
| CTA 흰 라벨 on teal | 2.07 | — | 수용 예외 `D-01` |
| RadioGroup 선택 행 흰 라벨 | 2.07 | — | 기존 (`179:1788` 구현 그대로) |
| 차트 비텍스트 | 1.25~2.04 | — | **`P-30`** |

### 9.4 터치 타깃

- 차트 축 버튼 ≥ 44×44 · RadioGroup 행 44(기존) · ListRow 56(기존) · TopBar IconButton 44(기존).

### 9.5 `R-SHADOW-1`

| 대상 | drop | 번짐 (좌우/위/아래) | overflow 조상 | 처리 |
|---|---|---|---|---|
| ProfileCard ×3 | `--shadow-bubble` 1겹 | **4 / 0 / 10** (`91:691` `[bound]` 선례와 같은 선언) | `AppShell` 뷰포트 (`overflow-y: auto` → x 강제) | 좌우 4 ≤ 거터 24 · 아래 10 ≤ 카드 간격 20 / 콘텐츠 끝 CTA 위 `pt-8` 32 → **inset 불필요**. VG 에서 세로·가로 프로브 |
| CTA `Button lg` | 기존 | 기존 | 같음 | 기존 화면과 같음 |
| 재응답 진입 카드 (`OnboardingIntro`) | 기존 Glass Rest | 기존 | 기존 | **변경 0** — Stage 2 결과 그대로 (이 Spec 이 새로 만드는 overflow 0) |
| 차트 SVG | 그림자 0 | — | — | SVG 에 `overflow: visible` (꼭짓점 흰 테두리·선택 링이 viewBox 끝에서 잘리지 않게) — overflow **신설이 아님** |

새 `overflow` 선언: **0**.

---

## 10. Copy 초안 (영어 · 진단/판정/비교 0 — 최종 문구는 체크포인트 승인)

### 10.1 프로필
| 키 | 문구 |
|---|---|
| h1 (온보딩) | *Here's where we're starting with {firstName}* |
| 안내 ("판정 아님", PRD §7.3) | *This isn't a measure of {firstName}. It's a starting point from what you noticed, and it will change as you read together.* |
| 차트 카드 제목 | 온보딩 *Starting point* · 재방문 *Where {firstName} is right now* |
| 변형 C 캡션 | *We'll draw this together as you read.* |
| 강점 / edge 라벨 | *WHAT WE SAW MOST* · *WHERE WE'LL LOOK NEXT* |
| 빈 묶음 | *We'll see more as you read together.* |
| 미관찰 축 캡션 | *Not seen yet* (SR: *not observed yet*) |
| 페르소나 eyebrow | *{FIRSTNAME}'S STORYTIME PERSONA* |
| CTA | *Next* |
| UpdateNote | *Updated {Mon D} from your recent storytimes* · *Updated {Mon D} from your latest answers* |
| TopBar (재방문) | *Profile* |
| 조회 실패 (온보딩) 보조 링크 | *Continue to Home* |

### 10.2 발전 역량
| 키 | 문구 |
|---|---|
| h1 (온보딩) | *Pick one to focus on together* |
| 제안 있음 | *We've suggested a place to begin. You can choose any of the four.* |
| 제안 없음 | *Choose the one you'd like to explore together first.* |
| meta | *Suggested* (온보딩) · *Current* (설정) |
| 설명 — Emotion Regulation | *Noticing big feelings and finding ways back to calm, with your help.* |
| 설명 — Self-Direction | *Making small choices and trying things on their own.* |
| 설명 — Cognitive Flexibility | *Looking at things another way and adjusting when plans change.* |
| 설명 — Intrinsic Motivation | *Following their own curiosity and enjoying the effort for its own sake.* |
| 나중에 변경 안내 | *You can change this anytime in Settings.* |
| 비활성 사유 | *Choose one to continue.* |
| CTA | *Start with this* (온보딩) · *Save* (설정) |
| TopBar (설정) | *Growth focus* |
| 저장 실패 | title *We couldn't save your choice right now* · desc *Your selection is still here. Try again.* |
| 오프라인 | title *You're offline* · desc *Your selection is still here. Tap the button again when you're back online.* |

### 10.3 설정 · 재응답
| 키 | 문구 |
|---|---|
| 그룹 라벨 | *YOUR CHILD* · *ACCOUNT* |
| 행 | *Profile* · *Child info* · *Update survey answers* · *Growth focus* · *Log out*(기존) |
| 재응답 진입 h1 | *Update your answers* |
| 재응답 진입 본문 | *Your earlier answers are already filled in. Change anything that looks different now.* |
| InfoRow | *About 3 minutes* ⚠️ 소요 시간 수치는 Stage 2 와 같은 미결(요청서 Q9) — 온보딩 copy 키를 재사용하면 같이 따라간다 · *Your earlier answers are filled in* |
| CTA | *Start* · *Continue where you left off* |
| 마지막 카드 CTA | *Save answers* |
| 성공 Toast | *Your answers are saved* |
| 제출 실패 | title *We couldn't save your answers right now* · desc *Your answers are still here. Try again.* |
| 오프라인 | title *You're offline* · desc *Your answers are still here. Try again when you're back online.* |

### 10.4 아이 정보
| 키 | 문구 |
|---|---|
| TopBar | *Child info* |
| Save · 성공 Toast | *Save* · *Saved* |
| 저장 실패 | title *We couldn't save the changes right now* · desc *Your edits are still here. Try again.* |
| 오프라인 | title *You're offline* · desc *Your edits are still here. Try again when you're back online.* |
| 이탈 확인 | title *Discard changes?* · desc *Your edits to {firstName}'s info won't be saved.* · confirm *Discard* · cancel *Keep editing* |
| 필드·섹션 라벨 · 선택지 | Step 1 copy **재사용** (`N6-27` ⓐ) |
| 필드 오류 (생년월 외) | *Please check this and try again.* — **확정 `D6-9` ④ (`VG6-B-11`, 2026-11-18 사용자 결정)**. 생년월 범위 밖 = 기존 Step 1 `ageOutOfRange` 재사용. copy 위치 `features/child-profile-edit/copy.ts` `fieldInvalid` |

> 설문 재응답(§2.5) 접근성 이름 — **설정 흐름만** 덱 *Survey questions* · 진행바 *Survey progress* (`D6-9` ④ `VG6-C-09`, 2026-11-18). 온보딩 덱·진행바 이름은 그대로. copy 위치 `features/survey-update/copy.ts` `a11y`.

### 10.5 금칙어 점검 `[계산]`
위 초안 전부에서 `diagnos` · `score` · `rating` · `level` · `grade` · `assess` · `weak` · `strong` · `low` · `high` · `lowest` · `below` · `behind` · `average` · `normal` · `better` · `worse` · `peers` · `fail` · `invalid` · `error` · 느낌표 · 이모지 **0건**. ("measure" 는 *"isn't a measure"* 부정문으로만 1회 — 거슬리면 체크포인트에서 교체 후보 *"This isn't a test"*.)

---

## 11. Responsive `[계산]`

### 11.1 가로 — 차트 (ProfileCard 내부 폭 `W` = 컬럼 − 2×24 − 2×16)

| 뷰포트 | 컬럼 | `W` | `h` | 다이아몬드 | 차트 높이 |
|---|---|---|---|---|---|
| 320 | 320 | 240 | 50 | 100 | 144 |
| 393 | 393 | 313 | **86.5** | 173 | 217 |
| 600 · 1024 | 480 | 400 | 100 (상한) | 200 | 244 |

- 320 에서 다이아몬드 100 은 작지만 라벨·꼭짓점이 겹치지 않는 최소 — 꼭짓점 10 + 선택 링 18 이 h 50 안에 들어간다. 더 줄이면 라벨 폭(64)을 깎아야 해 2줄 라벨이 3줄이 된다.
- 가로 넘침 0: 좌우 라벨 64 + gap 6 + h ≤ W/2 를 식이 보장.

### 11.2 세로

| 화면 | 393×852 콘텐츠 (근사) | 동작 |
|---|---|---|
| 프로필 온보딩 | header ≈ 110 + 차트 카드 ≈ 265 + 강점 카드 ≈ 150 + 페르소나 ≈ 170~220 + 간격 80 + CTA 88 ≈ **860~910** | 스크롤. CTA 는 콘텐츠 끝 (AC-6-47 "스크롤 도달") |
| 발전 역량 | header ≈ 90 + 차트 ≈ 250 + 목록 4×44+3×8 = 200 + 설명 ≈ 60 + 안내 + CTA ≈ **760~800** | 393×852 무스크롤 근접 — 320×568 은 스크롤 |
| 아이 정보 | `248:1159` 와 같은 길이 (Figma 1132 프레임) | 스크롤 |

- 페르소나 description 220자 @ 320: subheadline 15/20 · 폭 240 → 약 7줄 = 140 — 말줄임 0, 카드 높이 가변.
- 긴 이름(40자) — h1·페르소나 eyebrow·카드 제목은 **줄바꿈**(`overflow-wrap: break-word`, Stage 5 `D5-14` 교훈). TopBar 제목은 이름을 쓰지 않는다(*"Profile"*).

### 11.3 600 / 1024
- 앱 컬럼 480 가운데 · 다단 없음 · 차트 상한 200.

---

## 12. PRD ↔ Figma — `PF6-1`~`3` 처리 제안 (체크포인트 확인)

| ID | 제안 | 근거 |
|---|---|---|
| **`PF6-1`** 난이도 하향 표시 | **Figma 채택** — 표시 요소 0. 하향은 다른 책 + 서버 `reason` 문장(`85:544` 자리)으로만. PLANNING Exit 문구 정정 | `86:396` 에 난이도 요소 없음 `[meta]` · §2.8 |
| **`PF6-2`** 역량 현황 위치·표현 | **Stage 7 Plan 에서 결정** (기록만) + 🆕 추가 사실 기록: `163:2607` 의 역량 색이 **teal/pink/blue/violet-67** 로 Tag·차트(#19, green/pink/cyan/purple)와 **2색 다르다** — Stage 7 에서 함께 결정 (`N6-47`) | `[var]` |
| **`PF6-3`** 발전 역량 변경 수단 | **두 경로 공존 + 같은 화면** — 온보딩·설정 모두 축 탭 + 목록 (`D6-6`). PRD §7.3(축 탭)·§7.8(설정) 둘 다 충족 → PRD 수정 대상 `S6-2` 는 "설정에서도 같은 화면" 병기로 축소 | §2.3 |

---

## 13. Figma 누락 / 불일치 / 승인 필요 항목

### 13.1 Plan 과의 대조 — 정정·보완 5건 (Plan 은 고치지 않는다 — plan-agent 보고)

| # | Plan | 실측·확인 | 영향 |
|---|---|---|---|
| M6-1 | `N6-04` ⓐ "Step 1 전 필드" | `relationship` 은 **보호자 데이터**(`D-16`, `PATCH /v1/me`) — `ChildInfoAnswersSchema` 밖 `[직독]` | `N6-39` — 이 화면에서 제외 권고 |
| M6-2 | Plan §9 `CapabilityDiamondChart` · `PersonaCard` 를 `packages/ui` 신규 | ui 이름은 도메인 중립 `DiamondChart`, `PersonaCard` 는 ui 컴포넌트 불필요(Domain 조합) | §3.7 |
| M6-3 | (언급 없음) ChildProfile 에 **제시값(suggested) 필드 없음** — `growthCapability` 하나 | 설정 모드에서는 "Suggested" 를 표시할 근거가 없다 → *"Current"* | `N6-36` |
| M6-4 | (언급 없음) 온보딩 프로필 **조회 실패 시 진행 경로** | `ErrorState` 만 두면 온보딩 끝에서 막힌다 | `N6-37` |
| M6-5 | (언급 없음) `163:2607` 역량 색 ≠ #19 | Stage 7 영향 | `N6-47` |

### 13.2 **사용자 결정 필요** — `N6-28`~ (전부 권고안 있음)

| ID | 질문 | 권고 | 차단 |
|---|---|---|---|
| **`N6-28`** | 축 순서 (Q6) | 위 Self-Direction → 오른 Emotion Regulation → 아래 Cognitive Flexibility → 왼 Intrinsic Motivation (`163:2607` 순서) | ⛔ `S6-E` |
| **`N6-29`** | 숫자 노출 (Q5) · SR summary 형식 | 미노출 · §9.2 문장(서버 strengths/edges + null 축만) | ⛔ `S6-E` |
| **`N6-30`** | null 축 시각 (`D-2` 시각, 변형 A/B/C) | "이웃 축 둘 다 값 있는 사분면만 채움" 단일 규칙 · null 축 점선 + *Not seen yet* · 변형 C 캡션 | ⛔ `S6-E` |
| **`N6-31`** | 페르소나 일러스트 (Q7) | 없음 — 신규 에셋 0 | ⛔ `S6-E` |
| `N6-32` | medallion (Q1) | 현행 확정 제안(md 188 · lg 232 · ring 없음), `P-16` 은 디자이너 대기 유지 | — |
| **`N6-33`** | 보조 텍스트 대비 (Q2) | 신규 화면 설명 문장 = 본문색, SectionLabel 은 Figma 대로 | ⛔ `S6-E`·`D` |
| **`N6-34`** | 비텍스트 대비 (Q3) | 차트 색 사용안 §3.1 + 가값 `P-30`~`P-33` 등재 | ⛔ `S6-E` |
| `N6-35` | 강점/edge 표현 | `Tag` (76:440) 역량색 · 두 묶음 동일 위계 · 빈 묶음 문장 | `S6-E` |
| **`N6-36`** | 제시값/현재값 표시 | 온보딩 *Suggested* · 설정 *Current* (contract 변경 0) — `RadioGroup.meta` 확장 | ⛔ `S6-E`·`D` |
| **`N6-37`** | 온보딩 프로필·발전 역량 **조회 실패** 시 | `ErrorState` + *Try again* + `TextLink` *Continue to Home* (서버 제시값 유지, `D-6` 와 일치) | `S6-E` |
| **`N6-38`** | 설정 목록 (`N6-13`·`N6-18` 확인 포함) | 2그룹(YOUR CHILD 4행 / ACCOUNT 로그아웃) · 재응답 = 별도 행 · subtitle 없음 · 재방문 프로필에 이동 링크 없음 | ⛔ `S6-B` |
| **`N6-39`** | 아이 정보 화면의 관계 필드 | 제외 (보호자 데이터 `D-16`) | ⛔ `S6-A`·`B` |
| `N6-40` | 아이 정보 저장 성공·실패 표면 | 성공 Toast + `/settings` 복귀 · 실패 InlineAlert | `S6-B` |
| `N6-41` | `ChildInfoFields` 추출 (R-11) | `entities/child` 로 이동, 온보딩 동작·baseline 불변 | `S6-B` |
| `N6-42` | 업데이트 표시 문구·위치 | §2.2 UpdateNote (source 별 2문구, 배지 0) | `S6-E` |
| `N6-43` | 데이터 카드 recipe | `163:2607` → `Surface strong / surface / 4 / material="bubble"` (Shared UI 확장) | `S6-E` |
| `N6-44` | 발전 역량 용어 · 역량 설명 4문장 | *Growth focus* · §10.2 | `S6-E`·`D` |
| `N6-45` | CTA 비활성 사유 시각 텍스트 | *Choose one to continue.* (선택 없을 때만) | `S6-E` |
| `N6-46` | 설정 발전 역량 이탈 확인 | 없음 (선택 1개, 손실 작음) — 아이 정보만 확인 | — |
| `N6-47` | `163:2607` 역량 색 불일치 | 기록 → Stage 7 Plan (`PF6-2` 묶음) | 비차단 |
| `N6-48` | 재응답 route · 제출 라벨 | `/settings/child/survey/:step` · *Save answers* | `S6-C` |
| `C13-*` 8건 | §2 화면별 명세 · §10 copy | 승인 요청 | ⛔ 전부 |
| `PF6-1`~`3` | §12 | 승인 요청 | — |

### 13.3 PRD ↔ Figma (추가)
- 없음 (§12 의 3건 + `N6-47` 기록).

---

## 14. Visual Gap 검토 계획 (최우선 규칙 5)

Figma 프레임이 없으므로 **이 Spec 대비** 검토 + Figma 재사용 노드 대비 검토를 함께 한다.

| 단위 | 비교 | 방법 |
|---|---|---|
| `S6-E` 차트 | 기하 단정 — 393/320/480 에서 `h` 86.5/50/100 · 꼭짓점 좌표(1.0=20%) · 변형 B 열린 면 · C 면 0 | 단위 테스트(좌표) + element screenshot |
| 〃 | computed: 카드 `box-shadow` = `--shadow-bubble` · radius 22 · 축 라벨 폭 ≤ 64 · 라벨 실제 폭(`Regulation`·`Motivation`) 실측 → `T6-2` 확정 | `getComputedStyle` · `getBoundingClientRect` |
| 〃 | 축 버튼 히트 ≥ 44×44 · 서로 겹침 0 | 프로브 |
| 〃 | 그림자 프로브 세로·가로 (§9.5) | `R-SHADOW-1` ⑥ |
| `S6-E` 화면 | 프로필 2모드 × 변형 A/B/C/fallback/updated · 발전 역량 2모드 × default/changed/null/저장 실패 | 상태별 screenshot (dev 패널 숨김, settle — `R-BASELINE-1`) |
| `S6-B` | 아이 정보 폼 ↔ `248:1159` 해당 섹션 (입력·칩·Answer card) · 설정 목록 | 나란히 + 기존 Stage 2 baseline diff 원인 분해 |
| `S6-C` | 재응답 카드 ↔ `179:1770` · 진입 ↔ `243:1147` | 온보딩 baseline 과 동일 픽셀 기대 (이동 리팩터 R-5) |
| 회귀 | `s2-onboarding-saved` 불변 · Home 카드 불변 (warm fixture) | baseline diff 0 |
| 대비 | 배경 위 설명 문장 실제 배경 픽셀 대비 (§9.3 ⚠️) | 픽셀 샘플 + WCAG 식 |

---

## 15. development-agent Handoff (승인 후에만)

| 단위 | 이 Spec 에서 가져갈 것 | 주의 |
|---|---|---|
| **`S6-A`** Contracts + Mock | §7 시나리오 표(화면 상태 ↔ key) · warm fixture 길이 제약(§2.8) · `N6-39`(UpdateChild 에 relationship 없음) | UI 없음. persona fixture 110~220자 범위로 1개 이상(말줄임 검증용) · 이름 40자 fixture 1개(줄바꿈 검증) |
| **`S6-E1`** 차트 · 프로필 | §3.1 `DiamondChart`(+ 좌표 단위 테스트) · §3.3~3.5 · §3.4 `Surface material="bubble"` · §2.1·§2.2 · §9.2 summary · §10.1 | **최우선 순서**(Plan §12). `packages/ui` 는 역량 enum import 금지 — 순서 상수·라벨·tone 매핑은 `entities/child-profile` |
| **`S6-E2`** 발전 역량 2모드 · 재방문 · 업데이트 표시 | §2.3 · §3.2 `RadioGroup.meta` · §2.2 UpdateNote · R-7(saved CTA replace) · R-8 | 차트 버튼은 `aria-hidden`/`tabIndex -1`, 선택 수단은 RadioGroup 하나 |
| **`S6-B`** 설정 목록 · 아이 정보 | §2.4 · §2.5 · R-11 `ChildInfoFields` 추출 · §10.3·§10.4 | 온보딩 Step 1 동작·baseline 불변. 설정 baseline 재생성은 `R-BASELINE-1`(`=all` · 원인 분해) |
| **`S6-C`** 재응답 | §2.6 · R-5 이동 · §10.3 | Trial·로컬 draft 요소 0 (`N6-07`) |
| **`S6-D`** 설정 발전 역량 | `S6-E2` 컴포넌트 `mode="settings"` 연결만 | — |
| **`S6-F`** 횡단 | §9 · §10.5 금칙어 · §11 · §9.5 프로브 · 가값 `P-30`~`P-33` 주석·dev gallery 등재 | `QA-5-005` 는 Plan 대로 |

구현 메모:
1. 가값 토큰에는 `provisional: P-3x` 주석 (frontend §6).
2. 새 `overflow` 선언 0 이 목표 — 생기면 근거 주석 + 세로·가로 프로브.
3. 차트 첫 그리기 모션은 reduced-motion 에서 **즉시** (테스트로 확인).
4. 콘솔·devWarn 에 이름·페르소나·응답 값 0.
5. `T6-*` · `N6-28`~`48` 은 **승인 후** 적용. 승인 전 임의 값 금지.
