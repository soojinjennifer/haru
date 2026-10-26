# Stage 4b Design Spec — Session Screens (Figma `296:1127` 반영 개정)

Status: **APPROVED (2026-10-26, user)** — 사용자 발화 *"권장안대로 해줘"* (승인 체크포인트 응답: Plan·Design Spec 승인 + Plan §19 차단 CP-1~7 · 비차단 NB-1~11 전 항목 권장안 채택, `D4-58`). 작성: 2026-10-26 design-agent
Based on: Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` 페이지 `16:2` 섹션 **`296:1127` "Recording"** — `298:1262` · `298:1340` · `296:1210`(+`296:1257`) · `298:1261` · **`300:1309`** (확인 2026-10-26) + 기존 `28:51` · `29:62` · `88:960` (재확인 2026-10-26, 변경 없음) · Plan `docs/plans/stage-4b-plan.md` (DRAFT 2026-10-26) · `docs/decisions/stage-4-approvals.md` **`D4-1`~`D4-57`** · 상위 Spec `docs/design/stage-4-design-spec.md` (APPROVED 2026-10-13)

개정 이력: 2026-10-27 design-agent — `docs/design/stage-4b-visual-gap-f1.md` Spec 정정(VG-F1-01·03·04·07) + 사용자 결정 `D4-62`·`D4-63`·`D4-64` 반영 (§16 · §0.1 · §2.4 · §3.4 · §4 · §5.3 · §9 · §13). 결정 반영 개정이므로 Status 유지.

---

## 0. 이 문서의 지위

- **상위 Spec(`stage-4-design-spec.md`)의 4b 부분을 개정하는 delta 문서**다. 상위 Spec 은 수정하지 않는다(4a QA 판정 근거 보존 — Plan §0 과 같은 이유).
- 이 문서가 **명시적으로 대체·폐기하지 않은 상위 Spec 절은 그대로 유효**하다. 대체 목록 = §13.
- 두 문서가 다르면 **이 문서가 우선**한다 (`D4-51`~`D4-57` 반영분).
- ⛔ Production Code · Figma 수정 없음. 신규 토큰은 **요청**이며 구현은 development-agent.

### 0.1 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[meta]` | `get_metadata(296:1127)` · `(28:51)` · `(88:960)` · `(29:62)` | 좌표·크기·자식 수 |
| `[ctx]` | `get_design_context` — **선언값**(fill · effect · text style · variable 바인딩) | `296:1257` · `298:1262` · `298:1261` · `298:1398` · `300:1309` |
| `[var]` | `get_variable_defs` | `296:1257` · `298:1340` · `298:1236` · `298:1245` |
| `[svg]` | `get_design_context` 가 돌려준 **에셋 SVG 원문**(fill · stroke · opacity · filter) — 응답 직후 `curl` 로 받아 읽음 | dot `298:1322`·`298:1400` · PD 링 `298:1246`·`298:1247` · PD 코어 `298:1248` · Disabled 코어 `298:1239` · 칩 아이콘 `298:1315` |
| `[png]` | `get_screenshot(296:1210)` · `get_design_context` 첨부 렌더 | **배치 확인 용도만.** 색·그림자 값은 png 에서 읽지 않았다 |
| `[계산]` | 위 값의 산술 | 간격 · 대비 · 높이 공식 |

⚠️ 미측정 (2026-10-26 기준 — **닫기 X 는 2026-10-27 `[svg]` 실측 완료, §16.4**): 닫기 X 글리프(`298:1312`) · mic-off 글리프(`298:1254`) 의 path — **노드 이름**(`icon/mic-off`, `29:76` 동형)과 렌더로만 판단했다. 칩 아이콘(`298:1315`)은 `[svg]` 로 **Lucide `message-square-text` 와 동일 path · stroke 1.5(=24 기준 2 × 0.75) · `#4A5F5C`** 를 확인했다.

### 0.2 상위 Plan 대비 새로 확인된 사실 (Plan 작성 후 Figma 가 바뀌었다)

| # | Plan 기술 | 2026-10-26 실측 |
|---|---|---|
| F-1 | 팝업 `296:1257` **329×269**, 바닥 597 → Record Control 과 **24px** | **329×293** — `See all prompts`(`300:1308`) 추가로 **+24**. 바닥 = 328+293 = **621 = Record Control top** → 간격 **0** `[meta][계산]` |
| F-2 | 팝업 제목 `Try this prompt !` | **`Try this prompt!`**(공백 제거, `D4-55`) `[ctx]`. ⚠️ ready 버블 `139:2803`·`300:1313` 은 여전히 `Try this prompt !` = placeholder (`D4-20`) |
| F-3 | 팝업 면 "반투명으로 보인다 — 미측정" | **`glass-fill-strong` = white 90%** — ready 버블과 **같은 면**. **backdrop blur 없음** `[ctx][var]` |
| F-4 | 팝업 그림자 "1겹 추정" | **drop `0 6 4 ink8%` 1겹 + inset 2겹 = `--shadow-bubble`** 확정 (Style 이름은 `HARU/Shadow Rest` 5겹 — `V-10` 선례) `[ctx]` |
| F-5 | ready+닫기 프레임 없음 | **`300:1309`** 추가 (`28:51` 복제 + 닫기 `300:1318`, `D4-57`). 원본 `28:51` 자식 6개 **무변경** `[meta]` |
| F-6 | 시간 숫자 "높이 41" | **SF Pro Bold 48 / line 41** `[ctx]` |
| F-7 | Disabled "opacity 계열로 보임" | 컴포넌트 **opacity .5** + **코어 그림자 제거**(코어 SVG 에 filter 없음) + 코어 `accents/teal` `[ctx][svg][var]` |
| F-8 | PermissionDenied "회색 코어" | 링 2겹 stroke **`#AEAEB2`** (opacity .35/.6) + 코어 **`#AEAEB2`** + Record 코어와 **같은 그림자**(`0 12 28 ink16%` + inset `0 2 white55%`) `[svg]` |

---

## 1. 대상 화면 (Figma node → route)

| # | 화면 | Figma | route | Page | 범위 |
|---|---|---|---|---|---|
| S1 | **ready + 닫기** | **`300:1309`** (버블·컨트롤·바는 `28:51` 그대로) | `/session/:sessionId` | `StorytimeSessionPage` | 닫기 추가분만 개정. 나머지는 상위 Spec §2.2 유효 |
| S2 | **recording** | **`298:1262`** | 동 | 동 | 전수 (§2.2) |
| S3 | **paused** | **`298:1340`** | 동 | 동 | 전수 (§2.3) |
| S4 | **Prompt 팝업 열림** (recording · paused) | **`296:1210`** / 팝업 **`296:1257`** | 동 (비모달 레이어) | 동 | 전수 (§3.1). recording 위는 C-13 명세 (§10) |
| S5 | **Prompt Drawer** | **`88:960`** | 동 (`Sheet` overlay) | 동 | 상위 Spec §3.2 **유효**(`D4-52` 로 존속). 진입점만 개정 (§3.2) |
| S6 | 완료 | `29:62` y 0~468 | `/session/:sessionId/complete` | `SessionCompletePage` | **변경 없음** — 상위 Spec §2.7 |
| S7 | 확인 다이얼로그 (Discard · 닫기) | Figma 없음 (`AD-S4-4`) | 동 | — | 닫기 사용처 추가 (§3.4) |
| S8 | 예외 안내 (`S4-H2`) | Figma 없음 (#22) | 세션·완료 | — | 배치 개정 (§7) |

화면 8 · 신규/변경 컴포넌트 §4.

---

## 2. 화면별 레이아웃

### 2.1 공통 골격 (S1~S4)

상위 Spec §2.1 그대로 — `FullscreenLayout` · `AppShell scroll="none"` · `AppColumn`(min 320 / max 480 / gutter 24). **`AppShellTopBar` 미사용 확정**(`D4-51` — TopBar `78:353` 미배치).

세로 좌표 (Figma 프레임 기준, 상태바 56 = OS 영역 — 구현은 safe-area) `[meta]`:

| y | 요소 | S1 ready | S2 recording | S3 paused | 앵커 |
|---|---|---|---|---|---|
| **66** | 상단 줄 — 좌 **Prompts 칩** 117×36 @24 · 우 **닫기** 38×38 @331 | 닫기만 | 둘 다 | 둘 다 | safe-area top + **10** (`--space-2-5`) |
| 132 / 140 | 메달리온 링 190 / 아바타 174 | ✓ | ✓ | ✓ | 상위 Spec 그대로 |
| 322 | ring bottom | | | | |
| 327~606.6 | ready 버블 `139:2803` | ✓ | — | — | 상위 Spec §2.2.0 |
| **337** | **책 칩** 233×40 (hug) | — | ✓ (x **82**) | ✓ (x **80**) | ring bottom + **15** |
| **400** | **상태 블록** (pill 32 + gap 10 + 시간 41 + gap 10 + 보조 18 = **111**) | — | 133 폭 | 201 폭 | 책 칩 bottom(377) + **23** |
| 511 | 상태 블록 bottom | | | | |
| 511~621 | **유연 간격 110** — 공지 슬롯 (§7.2) | | | | 세로 압축 시 첫 흡수 대상 (§8.2) |
| **621** | Record Control 150 | `Record` | `Pause` | **`Paused`** | 하단 묶음 |
| **789** | `SessionActionBar` 279×45 | 둘 다 비활성 | 둘 다 활성 | 둘 다 활성 | 하단 묶음 (상위 Spec §2.3) |

가로 중심 `[계산]`: 프레임 중심 196.5. 상태 블록 recording 130+66.5 = **196.5** ✓ · paused 96+100.5 = **196.5** ✓ · 책 칩 paused 80+116.5 = **196.5** ✓ / recording 82+116.5 = **198.5** (+2 → `AD-S4-13` 후보) · 칩 x24 = gutter ✓ · 닫기 393−369 = **24** = gutter ✓.

**구현 지시**
- 상단 줄·메달리온·책 칩·상태 블록은 **위에서 앵커**, Record Control·바는 **아래 묶음**(상위 Spec 과 같은 하단 간격 18/18). 둘 사이가 유연 간격이다.
- `book: null` 이어도 **책 칩 자리(40 + 23)를 비워 둔다** — 상태 블록이 y400 에서 움직이지 않는다 (Figma 에 없는 배치를 만들지 않는다, 상태 간 레이아웃 흔들림 0).
- ready → recording 전환에서 **버블이 사라지고 책 칩·상태 블록이 나타난다.** 레이아웃 애니메이션 없음(§6). 메달리온·Record Control·바는 **같은 노드 유지**(재마운트 금지 — `R-BASELINE-1`).

### 2.2 S2 recording `298:1262` — 요소 전수 `[ctx]`

| 요소 | 노드 | 선언값 | 토큰 |
|---|---|---|---|
| **Prompts 칩** | `298:1314` | 117×36 · radius 19(=pill) · fill `glass-fill` **white 74%** · drop `0 6 4 ink8%` + inset 2겹 · pad **좌 14 / 우 16 / 상하 9** · gap **6** · 아이콘 18 `message-square-text` stroke `#4A5F5C` 1.5 · 라벨 `Prompts` **SF Pro Semibold 15**, line-height 바인딩 `font-size/11`(=11 ⚠️) · `text-primary` | 면 `--color-surface-glass` · 그림자 `--shadow-bubble` · 라벨 `--text-subheadline` + `--font-weight-semibold` · `--color-fg-primary` · 치수 = **신규 `T-16`** |
| **닫기** | `298:1311` | 38×38 · radius 19 · white 74% · `--shadow-bubble` 구성 · X 15×15 @11.5 — **`29:76` 과 동일** | `IconButton variant="glass"` · **`D4-11`**(`--shadow-bubble`) 적용 대상 ✓ |
| 메달리온 | `298:1264`/`1265` | `28:51` 과 동일 | 상위 Spec |
| **책 칩** | `296:1203` | hug 233×40 · radius 100 · white 74% · `--shadow-bubble` 구성 · pad **좌우 15 / 상하 9** · gap **8** · 표지 16×22 radius 3 `linear-gradient(131.19deg, #85BFB6 0%, #B0CFC0 70.92%)` · 제목 **SF Pro Semibold 13 / normal** `text-primary` | 면 `--color-surface-glass` · `--shadow-bubble` · 제목 `--text-footnote`(13/18) + semibold · 표지 = 상위 Spec **`T-5`** (`--haru-palette-teal`→`--haru-palette-mint`, **각도·정지점 포함**) · 치수 **`T-18`** |
| **상태 pill** | `298:1321` | hug 116×32 · radius 100 · white 74% · **그림자 없음** · pad 14/6 · gap 8 · dot 8 **채운 원 `#85BFB6`** `[svg]` · `Recording` **iOS 26/Subheadline Regular 15/20** `text-primary` | `--color-surface-glass` · dot `--color-action-primary-bg` · `--text-subheadline` · `--color-fg-primary` · **`T-17`** |
| **경과 시간** | `298:1324` | **SF Pro Bold 48 / 41** · `text-primary` · `03:24` | ⚠️ 스케일 밖 → **신규 `T-15`** · `--color-fg-primary` · `tabular-nums` |
| **보조 줄** | `298:1325` | `Up to 30:00` · **iOS 26/Footnote 13/18** · `text-secondary` | `--text-footnote` · `--color-fg-secondary` |
| 블록 gap | `298:1320` | flex col · gap **10** · 가운데 | `--space-2-5` |
| Record Control | `298:1267` | **`Pause`** 변형 `163:1588` (상위 Spec §2.6 그대로) | 상위 Spec `T-3`·`T-6`·`T-9` |
| 하단 바 | `298:1268` | `285:1445` 그대로 — `Discard`(gray-2) / `Submit`(teal) **활성** | 상위 Spec §2.3 · `T-12` · `T-13` |

⚠️ **칩 라벨 line-height 11** 은 `font-size/11` 변수를 line-height 에 바인딩한 것으로 보인다(텍스트 박스 63×11 — 15px 글리프보다 작다) `[ctx]`. 칩 높이 36 은 아이콘 18 + 9×2 로 정해진다. → **구현: `block-size: 36` 고정 + `align-items: center` + line-height 는 `--text-subheadline` 기본(20)**. 렌더상 글리프 중심이 같아 시각 차이는 없어야 한다 — Visual Gap 에서 확인하고, 차이가 나면 `AD-S4-17` 후보로 보고.

### 2.3 S3 paused `298:1340` — recording 과 다른 점만 `[ctx][svg]`

| 요소 | recording | **paused** |
|---|---|---|
| 상태 pill | `● Recording` 116 폭 · dot **채움** teal | **`○ Paused`** 96 폭 · dot **빈 원** stroke **1.5 `#7D9291`** (지름 8, 내부 투명) → `--color-fg-secondary` |
| 시간 색 | `text-primary` `#4a5f5c` | **`text-secondary` `#7d9291`** — 값 고정(증가 멈춤) |
| 보조 줄 | `Up to 30:00` | **`Tap the button to keep recording`** (201 폭 — 블록 폭을 정한다) |
| Record Control | `Pause` | **`Paused`** `298:1227` — §2.5 |
| 책 칩 x | 82 | **80** (가운데) |

상태 구분 신호 = **pill 문구 + dot 채움/빈 원 + 시간 색 + 컨트롤 글리프·라벨 + 모션 유무**(§6) — **텍스트만으로도 구분**된다(AC-4-128).

### 2.4 S1 ready + 닫기 `300:1309`

- `28:51` 위에 **닫기 `300:1318` 하나만 추가** — 38×38 @ (331, 66), `29:76`·`298:1311` 과 선언 동일 `[ctx]`. **Prompts 칩 · 책 칩 · 상태 블록 없음** (Figma 그대로 — Plan §7 의 "ready 에 추가하지 않는다" 와 일치).
- 버블·Record Control(`Record`)·바(둘 다 비활성) = 상위 Spec §2.2 그대로.
- 닫기 동작 = **확인 없이 `ready → abandoned` → `/`** (`D4-57`) — §3.4.
- 닫기 글리프 = **HARU 전용 SVG**(Figma `29:77`/`300:1319`, Lucide `x` 아님) · 색 = `D4-62` — §16.4 · §16.5.

### 2.5 Record Control 변형 5종 (상위 Spec §2.6 확장) `[ctx][svg][var]`

| state (코드) | Figma | 바깥 링 150 / 가운데 링 122 | 코어 108 | 코어 그림자 | 글리프 40 | 라벨 (10 → 11 흡수, 상위 §5.4-②) | 컴포넌트 opacity |
|---|---|---|---|---|---|---|---|
| `idle` | `163:1589` Record | stroke 2 teal · .35 / .6 | teal | `--shadow-record-core` | mic @y48 | `Tap to recording` @y88 (x35) | 1 |
| `recording` | `163:1588` Pause | 동 | teal | 동 | pause @y55 | **없음** | 1 |
| **`paused`** | **`298:1227`** | 동 | teal | 동 | **mic @y48** | **`Tap to resume`** @y88 **가운데**(x75, `-translate-x-1/2`) | 1 |
| **`disabled`** | **`298:1236`** | 동 | teal | ⛔ **없음** | mic @y48 | `Tap to recording` (x35) | **.5** (`--opacity-disabled`) |
| **`permission-denied`** | **`298:1245`** | stroke 2 **`#AEAEB2`** · .35 / .6 | **`#AEAEB2`** | `--shadow-record-core` (동일 filter) | **`mic-off`** @y48 white | **`Mic is off`** 가운데 | 1 |

토큰:
- `#AEAEB2` = Figma 변수 **`grays/gray-2`** 와 같은 값 → 기존 Primitive `--haru-gray-2`(`T-13`). Tier-3 **`--record-tone-denied: var(--color-action-neutral-bg)`**(링·코어 공용, `T-20`). ⚠️ PD 노드는 변수 바인딩 없이 **raw `#AEAEB2`** 다 `[var: 298:1245 → white 만 바인딩]` — 값 일치로 매핑한다(보고).
- `disabled` 의 opacity .5 = `D4-18` 전역 `--opacity-disabled` 와 **같은 값** ✓. 코어 그림자 제거는 **Figma 선언**이므로 그대로 구현(허용 차이 아님).
- 라벨 위치: `Record`/`Disabled` 는 x35 **좌측 고정**, `Paused`/`PermissionDenied` 는 **가운데 정렬**. 구현은 **전부 가운데 정렬**로 통일해도 `Tap to recording`(Figma 79 폭 @35 → 중심 74.5)이 **Δ0.5** 라 시각 동일 `[계산]`.
- 아이콘: mic = HARU SVG(상위 Spec) · **mic-off = Lucide `mic-off`**(노드 이름 `icon/mic-off`; path 대조는 구현 시 — 다르면 HARU SVG export).

---

## 3. 상호작용 컴포넌트

### 3.1 S4 Prompt 팝업 `296:1257` `[ctx][var][meta]`

| 항목 | 값 | 토큰 |
|---|---|---|
| 크기 | **329 × 293** (n=5) | 폭 `--bubble-session-width`(329, 상위 `T-10`) · `min(329px, 100%)` · **높이 고정 안 함**(내용) |
| 위치 | x 34(→ 가운데, `AD-S4-12` 후보) · **y 328 = ring bottom + 6** | 앵커 오프셋 `--space-1-5` (`T-19`) |
| 면 | `glass-fill-strong` **white 90%** · blur 없음 | **`--color-surface-strong`** (ready 버블과 동일) |
| radius | 22 | `--radius-surface` |
| 그림자 | drop `0 6 4 ink8%` 1겹 + inset `0 1.5 white90%` + inset `0 -1 ink5%` | **`--shadow-bubble`** |
| tail | **없음** | `SpeechBubble tail="none"` |
| padding | 좌우 16 · **위 14 · 아래 14** (ready 버블 아래 13 과 다르다 — Auto Layout `py-14`) | `--bubble-padding-x` · `--space-3-5` ×2 (`T-19`) |
| 세로 gap | 6 (제목·pill·See all 모두) | `--space-1-5` |
| `overflow` | Figma `overflow-clip` | 자식 drop shadow 0겹 → inset 불필요 (§9) |
| 제목 `296:1258` | `Try this prompt!` · SF Pro **Semibold 16/22** · `text-primary` · 가운데 · 297×22 | `--text-callout`(16/21, Δ1 — 상위 흡수 선례) + semibold · `--color-fg-primary` · **copy 모듈 고정 라벨**(`D4-55`) |
| Prompt Card ×5 `296:1259~63` | 297×38 · y 42/86/130/174/218 (pitch 44) — **ready 버블 pill 과 같은 컴포넌트(`139:2762` 내부)·같은 override** `[ctx]` | `PromptPill` + 세션 밀도 `T-14` (상위 Spec) |
| **`See all prompts`** `300:1308` | 297×17 @y262 · SF Pro **Semibold 14 / normal(17)** · **`text-secondary` `#7d9291`** · 가운데 · **밑줄** | `--color-fg-secondary` · 타이포 = **`T-19` 결정 필요**(§11 `S4B-Q3`) |

**높이 공식** `[계산]`: `h = 14 + 22 + 6 + Σpill + 6n + 17 + 14 = 73 + 6n + Σpill`. 전부 38 이면 **`73 + 44n`** → n=5 **293** ✓(실측 일치).

**세로 예산 = 0** `[계산]`: Record Control top(621) − 팝업 top(328) = **293** = n=5 높이. ready 버블(여유 14.373)과 달리 **여유가 없다.**
- pill 이 2줄로 40 이 되면(상위 §2.2.3-① 규칙) n=5 = **303** → Record Control 바깥 링을 **10px 덮는다.**
- → **`S4B-Q2` (사용자 결정)**: 권고 ⓐ **팝업 안 pill = 고정 높이 38**(Figma 선언 그대로 — Figma 도 2줄 텍스트를 38 안에 렌더한다, 글리프가 padding 8 안으로 1px 씩 들어감) → 팝업 높이 **n·줄 수와 무관하게 `73+44n`**, 침범 0. ⓑ pill 40 허용 + 팝업 `max-block-size` = 예산, 목록 내부 스크롤. ⓒ 바깥 링 위 겹침 허용(코어 top 642 까지 21px 여유).

**개수 (Prompt 6개 이상)** — 권고: **팝업 = 서버 순서 앞 5개 컷오프 + `See all prompts` 는 항상 표시 → Drawer 에 전부(n개)**. 근거 ① Figma 가 정확히 5개 ② 예산 0 ③ ready 버블의 5개 컷오프와 같은 규칙(상위 §2.2.3-②, contracts cap 아님 `D-21`) ④ `D4-52` 로 Drawer 가 전문 경로로 남았다. → Plan `N4B-07` 권고 ⓑ(전부 표시 + 내부 스크롤)는 **Drawer 존속으로 근거가 사라졌다**(§12 Plan 불일치).
- n < 5: 팝업이 **짧아지고 top(328) 고정**, 아래 간격이 늘어난다.
- n = 0 (`SessionSummary.prompts` 는 `.min` 없음 `[직독: session.ts:80]`): **`S4B-Q4`** — 권고: Prompts 칩 **비활성**(`disabled` + `aria-disabled` + 설명 `No prompts for this session`), 팝업 미렌더.

**동작** (`D4-53`·`D4-54`)

| 트리거 | 결과 | 세션 상태 |
|---|---|---|
| 칩 탭 (닫힘) | 열림 | **불변** — 전이 요청 0, recording 이면 청크 계속 (AC-4-130) |
| 칩 재탭 | 닫힘 | 불변 |
| 팝업 바깥 탭 | 닫힘 · **탭한 대상은 정상 동작**(비모달 — 이벤트를 삼키지 않는다. 예: `Pause` 를 누르면 닫히면서 일시정지) | 대상의 동작만 |
| `Escape` | 닫힘 · 포커스 칩으로 | 불변 |
| 팝업 안 탭(제목·pill) | **아무 일 없음** (pill 은 텍스트 — 포커스·탭 대상 아님) | 불변 |
| `See all prompts` | **팝업 닫힘 → Drawer 열림**(같은 프레임, 순차) | 불변 |
| `Submit` · `Discard` 확인 · 닫기 확인 · 30분 자동 종료 · 화면 이탈 | 팝업 **닫힌 상태로 정리**, 완료 화면·홈에 잔존 0 (AC-4-133) | 각 동작대로 |
| 상태 전이 recording ⇄ paused | 팝업 **열린 채 유지** | — |

### 3.2 S5 Prompt Drawer `88:960` — `D4-52` 로 존속

- 상위 Spec **§3.2 그대로 유효** (면 `T-1` · `--shadow-glass-rest` · 핸들 · 제목·부제 · 캐러셀 · 코칭 노트 · dots · 무음·무진동 · **녹음 계속**). `88:960` 재확인 — 자식 구성·크기 **무변경** `[meta]`. `AD-S4-7`(폭 컬럼 100%, `D4-49` 등록)도 **유효**.
- **진입점 변경**: 상위 Spec §3.3(TopBar trailing IconButton) **폐기** → **팝업의 `See all prompts`** 가 유일한 진입점.
- 초기 페이지 = **1번째 Prompt**. (팝업에서 특정 pill 을 눌러 그 페이지로 가는 동작은 Figma 에 없다 — pill 은 탭 대상이 아님 → 만들지 않는다.)
- 모달성: Drawer 는 기존 `Sheet` 의 **모달**(scrim · focus trap · `Esc`)을 유지한다 — `D4-54` 의 "비모달"은 **팝업에만** 적용된다. 열려 있어도 녹음은 계속(상위 §3.2-5).
- 닫히면 포커스는 **Prompts 칩**으로 복귀(팝업은 이미 닫혔으므로).
- AC-4-54(코칭 노트)는 **Drawer 에 남는다** — Plan §14.2 폐기 후보 **해제**.

### 3.3 Prompts 칩 = disclosure 트리거

- 역할: `<button aria-expanded aria-controls="{popupId}">` — **토글 버튼이 아니다**(`Chip` 의 `aria-pressed` API 와 역할이 달라 `Chip` 재사용 불가). 접근성 이름 = 보이는 라벨 `Prompts`.
- 구현 1순위: **`Button variant="glass"` + 신규 `size="sm"`** + `leadingIcon` (§4 #2). `Button` 은 native `aria-*` 를 이미 통과시킨다 `[직독: Button.tsx NativeButtonProps]`.
- ⚠️ `Button glass` 기본 그림자는 `--shadow-glass-rest`(3겹)다. 칩은 **`--shadow-bubble`(1겹)** — `sm` 크기에서 그림자를 바꾸는 방식은 development-agent 설계 (`D4-11` IconButton 과 같은 판단).
- 터치 타깃: 시각 117×36 → 세로 hit slop 으로 **44** (Chip·IconButton 선례 — `inset-block: calc((36 − 44)/2)`). 확장 영역 y62~106 은 메달리온 링(132)과 겹치지 않는다 `[계산]`.

### 3.4 닫기 (S1~S3) — `D4-56` · `D4-57`

| 상태 | 탭 결과 | 다이얼로그 | 전이 |
|---|---|---|---|
| `ready` | 즉시 홈 `/` | **없음** (`D4-57`) | `ready → abandoned` (caregiver) |
| `recording` · `paused` | 확인 다이얼로그 | **`Discard` 와 같은 `ConfirmDialog`**(상위 §2.5.3 — 문구 4건 동일, `D4-56`) | 확인 → `→ abandoned` → 서버 확정 후 로컬 삭제 → `/` · 취소 → 요청 0 · 상태·녹음 유지 · 포커스 닫기 버튼 복귀 |
| 전이 요청 중 | 닫기 `loading`(Spinner) · 재탭 무시 | — | 이중 요청 0 |

- 컴포넌트 신규 0 — `IconButton glass` + `ConfirmDialog`. 글리프 = HARU SVG `close`(§16.4, recording·paused `298:1311` 과 Discard/Complete 화면 닫기에도 동일 적용).
- 접근성 이름 제안: **`Close session`** (ready·recording 공통 — 결과 차이는 다이얼로그가 설명한다). 문구 승인 대상.
- recording 중 다이얼로그가 열려 있는 동안 **녹음은 계속**된다(상위 §2.5.3 과 동일 — 다이얼로그는 상태를 바꾸지 않는다).
- `recording` 에서 열린 다이얼로그는 Figma 에 없다 → `AD-S4-4` 의 **사용처 확장** — `AD-S4-15` 후보.

---

## 4. 신규 / 변경 컴포넌트

| # | 이름 | 분류 · 위치 | 변경 | Figma |
|---|---|---|---|---|
| 1 | **`RecordControl`** | Shared UI · `packages/ui/src/record/` | `state` 2종 → **5종** `'idle' \| 'recording' \| 'paused' \| 'disabled' \| 'permission-denied'`. 상위 §2.6.3 의 `disabled?: boolean` prop 은 **`state='disabled'` 로 흡수**(시각이 생겼다) | `163:1590` + `298:1261` |
| 2 | **`Button` `size="sm"`** | Shared UI (기존 파일) | 36 높이 · pad 14/16 · gap 6 · 아이콘 18 · 라벨 subheadline semibold · 그림자 `--shadow-bubble` (`T-16`). **신규 컴포넌트 아님** | `298:1314` |
| 3 | **`PromptCarousel`** | Shared UI | **되살림** — 상위 §4 #2 그대로 (`D4-52`) | `88:960` |
| 4 | `SpeechBubble` | Shared UI (기존) | **변경 0** — `tail="none"` 이 이미 있다 `[직독: SpeechBubble.tsx — 'none' 기본값]`. 팝업 = `SpeechBubble tail="none" align="center"` + Tier-3 오버라이드(`T-19`) | `296:1257` |
| 5 | `TextLink` | Shared UI (기존) | **tone 1개 추가 후보 `subtle`** — 기존 `standalone` 은 13/590 · `--color-fg-link`(ink-700) · **min-block 44 를 padding 으로** 만든다 `[직독: TextLink.css:23~29]` → 팝업 예산 0 이라 padding 방식 불가. `subtle` = `--color-fg-secondary` + 밑줄 + **hit slop 을 `::before` 로**(레이아웃 높이 17 유지). 44 확장 영역 y576.5~620.5 = 팝업 안 `[계산]` | `300:1308` |
| 6 | **`SessionStatusBlock`** | Domain · `entities/session` | 상위 §4 #5 `SessionTimer` 를 **대체** — 상태 pill + 시간 + 보조 줄. props `{ state: 'recording' \| 'paused', recordedSeconds, maxSeconds }` · 문구는 copy 모듈. **계산은 `RecordingController` 소유**(구독만) | `298:1320` / `298:1398` |
| 7 | **`SessionBookChip`** | Domain · `entities/session` (`BookSummary` 표시) | 신규. `book: null` → 렌더 0(자리는 부모가 유지) · `coverUrl` 없으면 `T-5` 그라디언트 · 제목 **1줄 말줄임**, 최대 폭 = 컬럼 100% · 비인터랙티브 | `296:1203` |
| 8 | **`SessionPromptsPopover`** (가칭) | Feature · `features/session-prompts` | 신규. 칩(#2) + 팝업(#4 + `PromptPill` ×≤5 + #5) + Drawer 열기(`Sheet` + #3). 열림 상태·바깥 탭·`Esc`·정리 소유 | `296:1210` |
| 9 | **`IconButton`** | Shared UI (기존) | **글리프 색만 변경** — `--color-fg-primary` → `--icon-button-fg`(= `--color-action-secondary-fg`, ink-600 `#5e7370`). **앱 전체**(`D4-62`) — §16.5 | `29:77` · `77:150` |
| 10 | **`Sheet`** | Shared UI (기존) | **`leading?: ReactNode` 슬롯 추가**(헤더 왼쪽, `D4-64`). 주지 않으면 렌더 0 — 기존 시트 외형 불변 — §16.7 | Figma 없음 (Stage 3 §2.4 명세 화면) |
| 11 | `RadioGroup` | Shared UI (기존) | **`legendVisuallyHidden?: boolean` (opt-in)** — 이번 Reading Context 시트에서만 켠다(`D4-63`) — §16.6 | — |
| — | `ConfirmDialog` · `PageIndicator` · `PromptPill`(세션 밀도) · `InlineAlert` · `Toast` · `SessionActionBar` | 재사용 | 변경 없음 | — |

**통합 판단**
- 팝업 ≠ 신규 버블: ready 버블과 **역할(Prompt 미리보기)·데이터(`SessionSummary.prompts`)·내부 구조가 같다** → `SpeechBubble` 재사용. 다른 것은 tail·제목 출처(ready = 서버 인사 / 팝업 = copy 고정)·`See all` 슬롯뿐.
- 상태 pill ≠ `Tag`/`Chip`: 비인터랙티브 상태 표시 + dot 2형태 — `SessionStatusBlock` 안에 둔다(재사용처 1곳, Shared 승격 안 함).
- 책 칩 ≠ 기존 `BookCover`: placeholder 가 평면 tinted + 이니셜 `[직독: entities/book/book.css:124]` 이고 16×22 에 이니셜이 들어가지 않는다 → 표지 슬롯만 `T-5` 그라디언트.

**신규 Shared UI 컴포넌트 0 · Shared UI 확장 5**(RecordControl 상태 · Button sm · TextLink subtle · Sheet `leading` · RadioGroup `legendVisuallyHidden` — 뒤 2건 2026-10-27 `D4-63`·`D4-64`) **· 색 변경 1**(IconButton 글리프, `D4-62`) **· 되살림 1**(PromptCarousel) **· Domain 신규 2 · Feature 신규 1.**

---

## 5. 토큰

### 5.1 그대로 쓰는 것 (신규 0)

`--color-surface-glass`(white 74%) · `--color-surface-strong`(white 90%) · `--shadow-bubble` · `--shadow-record-core`(T-3) · `--radius-surface` · `--radius-pill` · `--color-fg-primary`/`-secondary` · `--color-action-primary-bg` · `--color-action-neutral-bg`(T-13, P-25) · `--opacity-disabled` · `--text-subheadline`/`-footnote`/`-callout` · `--font-weight-semibold`/`-bold` · `--space-1-5`/`-2`/`-2-5`/`-3-5`/`-4` · `--bubble-session-width`(T-10) · `T-14` pill 밀도 · `T-5` 표지 그라디언트 · `T-1` Drawer 면 · `--z-sticky`(팝업 층위).

### 5.2 신규 요청 (전부 Tier-3 — 신규 Primitive 0 · Semantic 0)

| # | 대상 | 요청 | 근거 |
|---|---|---|---|
| **T-15** | 경과 시간 숫자 | `--session-timer-size: 48px` · `--session-timer-line: 41px` · weight = `--font-weight-bold` | 48 은 스케일 밖(최대 large-title 34) — Δ14 흡수 불가. 사용처 1곳이라 Semantic 승격 없이 Tier-3 (3-4 준수: 숫자 리터럴) |
| **T-16** | `Button sm` (Prompts 칩) | `--button-height-sm: 36px` · `--button-padding-inline-start-sm: var(--space-3-5)` · `--button-padding-inline-end-sm: var(--space-4)` · `--button-gap-sm: var(--space-1-5)` · `--button-icon-size-sm: 18px` · `--button-label-size-sm: var(--text-subheadline)` · `--button-shadow-sm: var(--shadow-bubble)` | 18 은 `--size-icon-*`(16/20/24) 밖. IconButton 은 18→20 흡수했으나 여기서 20 은 칩 폭 117→119 로 Figma 치수를 바꾼다 → 리터럴 |
| **T-17** | 상태 pill | `--session-state-pill-pad-inline: var(--space-3-5)` · `--session-state-pill-pad-block: var(--space-1-5)` · `--session-state-pill-gap: var(--space-2)` · `--session-state-dot-size: 8px` · `--session-state-dot-stroke: 1.5px` | 높이 32 = 6+20+6 로 산출(고정 높이 토큰 없음) |
| **T-18** | 책 칩 | `--session-book-chip-height: 40px` · `--session-book-chip-pad-inline: 15px` · `--session-book-chip-gap: var(--space-2)` · `--session-book-cover-width: 16px` · `--session-book-cover-height: 22px` · `--session-book-cover-radius: 3px` | 15 는 스케일 밖(14/16) — 흡수하면 폭 Δ2 |
| **T-19** | 팝업 | `--prompt-popup-pad-block: var(--space-3-5)` · `--prompt-popup-offset-top: var(--space-1-5)` · (`S4B-Q3` ⓐ 시) `--prompt-popup-link-size: 14px` · `--prompt-popup-link-line: 17px` | 아래 padding 14 ≠ ready 13 |
| **T-20** | RecordControl 변형 | `--record-tone-denied: var(--color-action-neutral-bg)` · `--record-core-shadow-disabled: none` | PD 링·코어 `#AEAEB2` = gray-2 |
| **T-21** | 세션 레이아웃 오프셋 | `--session-top-row-offset: var(--space-2-5)`(10) · `--session-book-chip-offset: 15px` · `--session-status-block-offset: 23px` · `--session-status-block-gap: var(--space-2-5)` | Figma 간격 15·23 은 스케일 밖 |

**합계: 신규 Tier-3 세트 7 (T-15~T-21), 신규 Primitive 0, 신규 Semantic 0.** `@theme` 등재 0. ⚠️ 2026-10-27 정정 — 구현이 Semantic 1 · Tier-3 6 을 추가했다 → §5.3 (VG-F1-07). 실제 합계는 **Semantic 1**.

### 5.3 구현 중 추가된 토큰 등재 (VG-F1-07 · 2026-10-27 정정) + `D4-62` 토큰

`docs/qa/stage-4b-handoff.md` F1-8 비차단 ⑥ 의 7개. Visual Gap `stage-4b-visual-gap-f1.md` §2-④ 판정 = **전부 정당 · 신규 HEX 0 · 사용자 승인 필요 새 값 0**. 이 표로 Spec 안에 들어온다.

| # | 토큰 | Tier | 값 | 근거 | 비고 |
|---|---|---|---|---|---|
| T-22 | `--color-surface-medallion-ring` | **Semantic (신규)** | `var(--haru-white-a50)` | 상위 Spec §2.2.0 이 Primitive 를 직접 지정했으나 화면 코드는 Primitive 를 쓸 수 없다(frontend §6) — **Spec 오류 정정** | white 50% Semantic 이 따로 없다 |
| T-23 | `--session-medallion-offset` | T3 | 76px | Figma 56→132, 스케일 밖 | |
| T-24 | `--session-medallion-ring-size` | T3 | `calc(174px + 2 × 8px)` = 190 | 파생값 | |
| T-25 | `--session-bubble-offset` | T3 | 5px | 스케일 밖 — `--space-1`(4)로 흡수하면 버블 위치 Δ1 | |
| T-26 | `--session-bottom-gap` | T3 | `var(--space-4-5)` | 정당하나 **불필요한 별칭** | 선택: 제거하고 `--space-4-5` 직접 사용 (development-agent 판단, 외형 불변) |
| T-27 | `--bubble-session-pad-block-end` | T3 | 13px | 상위 Spec §2.2.1 이 값을 확정(이름만 없었다) | |
| T-28 | `--bubble-session-title-line` | T3 | `var(--text-headline--line-height)` (22) | Figma `88:840` 16/**22** (§16.1) | ⚠️ headline line 값과 결합 — 선택: 리터럴 `22px` |
| **T-29** | **`--icon-button-fg`** | **Component (신규, `D4-62`)** | `var(--color-action-secondary-fg)` (= `--haru-ink-600` `#5e7370`) | Figma `29:77`·`77:150` 글리프 stroke `#5E7370` `[svg]` | §16.5. `packages/design-tokens/src/component/index.css` 의 `--icon-button-*` 옆 |
| **T-30** | `--icon-button-icon-size-close` | T3 (신규, VG-F1-01) | 15px | Figma `29:77` 글리프 박스 15×15 `[svg]` — `--size-icon-*`(16/20/24) 밖 | §16.4 |

이미 Spec 안이던 것(등재 불요): `--record-icon-offset-labeled`(상위 §2.6.1) · `--record-pulse-opacity`/`-scale`(상위 §6.2).
**정정 합계: 신규 Semantic 1(T-22) · Component 1(T-29) · Tier-3 7(T-23~T-28 · T-30) · Primitive 0 · 신규 HEX 0.**

---

## 6. Interaction / Motion (CSS 전용, `D4-3`)

| 상태 | 무한 모션 (≤1, 상위 §6.1) | 비고 |
|---|---|---|
| ready | Record 바깥 링 pulse (상위 §6.2) | 변경 없음 |
| **recording** | **메달리온 링 breathing** (상위 §6.3) | **상태 dot 은 정지**(깜빡임 없음) · Record 링 정지 — **Plan Q6 답** |
| paused | **없음** | 모션 부재 자체가 3번째 신호 — 단 텍스트로도 구분(§2.3) |
| permission-denied · disabled | 없음 | |

| 모션 | 값 | reduce |
|---|---|---|
| 팝업 열기 | `opacity 0→1` + `scale .96→1`, `transform-origin: top center`, `--motion-duration-fast`(180) · `--motion-ease-standard`. 닫기 = 역방향 `--motion-duration-instant`(100) | **즉시 표시/제거** (중간 상태 없음 — `R-BASELINE-1` ①) |
| 팝업 → Drawer | 팝업 즉시 닫힘 + 기존 `haru-sheet-in` | Sheet 기존 reduce(fade) |
| ready → recording 레이아웃 | **레이아웃 애니메이션 없음** — 버블 제거·책 칩/상태 블록 표시는 즉시 | — |
| 시간 숫자 | 매초 텍스트 교체만 (tick 애니메이션 없음) | — |

무음·무진동 (PRD §7.5).

---

## 7. 상태 화면과 Mock 시나리오 (상위 §7 개정분)

### 7.1 상태 → 시각 매핑

| 상태 / 시나리오 | 화면 | Record Control | 상단 줄 | 중앙 | 바 | Mock key |
|---|---|---|---|---|---|---|
| ready | S1 | `idle` | 닫기 | 버블 | 비활성 ×2 | 기본 |
| recording | S2 | `recording` | 칩 + 닫기 | 책 칩 + 상태 블록 | 활성 | 기본 |
| paused | S3 | `paused` | 칩 + 닫기 | 동 (paused) | 활성 | 기본 |
| 팝업 열림 | S4 | 바탕 상태 유지 | 칩 `aria-expanded=true` | 팝업 | 바탕 상태 | `session:prompts-1` / `-5` / `-7` |
| Prompt 0개 | S2/S3 | — | 칩 비활성(`S4B-Q4`) | — | — | `session:prompts-empty` |
| 책 없음 | S2/S3 | — | — | 책 칩 미렌더(자리 유지) | — | `session:book-missing` |
| 표지 없음 | S2/S3 | — | — | 표지 = `T-5` | — | `session:book-no-cover` |
| 긴 제목 | S2/S3 | — | — | 1줄 말줄임 | — | `session:book-long-title` |
| 동의 없음 (AC-4-62) | S1 | **`disabled`** | 닫기 | 버블 | 비활성 | `consent-missing` |
| 전이 요청 처리 중 | S1~S3 | **`disabled`** (탭 무시, 요청 0) | 닫기 `loading` 아님 | — | 처리 중 표시는 상위 §2.3 `submitting` | 지연 시나리오 |
| 마이크 거부 (AC-4-63) | S1 | **`permission-denied`** — 탭 → 안내 시트(§7.3) | 닫기 | 버블 | 비활성 | `mic-permission-denied` |
| 대화 전용 (`D4-44`) | S1 | **`permission-denied`** | 닫기 | 버블 | `Submit` **활성**(`N4B-15`) · `Discard` 비활성 | `mic-permission-denied` 경유 |
| 30분 근접 / 자동 종료 | S2 | — | — | 공지 슬롯 `InlineAlert warning` | — | `auto-timeout` |
| Web 백그라운드 경고 (`D4-26`) | S2 | — | — | 공지 슬롯 `InlineAlert info`(닫기 가능) | — | `web-background-warning` |
| 오프라인 | S1~S3 | — | — | **`Toast tone="neutral"`** 1회(끊김) + 1회(복구) — 레이아웃 이동 0 | — | `offline` |
| 크래시 복구 | S6 | — | — | 상위 §7 ⑥ 그대로 (완료 화면 상단) | — | `crash-recovered` |
| 업로드 / 48h / 14일 | S6 | — | — | 상위 §7.2 그대로 | — | 기존 |

### 7.2 공지 슬롯 (recording · paused 의 유연 간격 511~621)

- Figma 의 **유연 간격 110**(393×852) 안에 `InlineAlert placement="inline"` **1개**만 둔다. 우선순위: 30분 근접 > Web 백그라운드 경고. 
- **Figma 요소를 하나도 움직이지 않는다**(`AD-S4-11` 같은 밀림을 만들지 않는다). Figma 에 없는 UI → **`AD-S4-14` 후보**.
- 세로 압축(§8.2)으로 간격이 슬롯 높이보다 작아지면 `Toast` 로 대체한다.
- ⚠️ 상위 §7 ④ 의 "오프라인 배너 = TopBar 직하" 는 **TopBar 미사용(`D4-51`)으로 근거를 잃었다** → 위 표의 Toast 로 대체(사용자 승인 대상).

### 7.3 마이크 거부 안내 (C13-4B-4)

- `permission-denied` 컨트롤 탭(또는 거부 직후 1회 자동) → **`Sheet variant="bottom"`**: 제목 · 안내 문단(설정에서 마이크 허용 방법) · `Button accent` **`Talk without recording`**(→ `mode=conversation_only`) · `Button glass` **`Not now`**. Web 은 설정 딥링크 불가 → 안내 문단만. 네이티브 딥링크는 `S4N-*`.
- 상위 §7 ⑨ 의 "in-page 상태(메달리온 + Surface + …)" 는 **ready 버블 자리와 충돌**하므로 시트로 바꾼다 → Figma 에 없는 UI · `AD-S4-16` 후보 · 문구 승인 대상.

---

## 8. Responsive

### 8.1 가로 (320 / 393 / 600+)

| 요소 | 393 (Figma) | 320 (컬럼 272) | 600+ (컬럼 432 = 480−48) | 규칙 |
|---|---|---|---|---|
| Prompts 칩 117 · 닫기 38 | 좌·우 gutter | 그대로 (117+38 = 155 ≤ 272) | 그대로 | 고정 |
| 메달리온 190 | 가운데 | 그대로 | 그대로 | 고정 |
| 책 칩 | hug (예 233) · 가운데 | hug, **최대 272** · 넘치면 제목 말줄임 | 최대 432 | `max-inline-size: 100%` |
| 상태 블록 | 133 / 201 | 그대로 (201 ≤ 272) | 그대로 | 고정 |
| **팝업** 329 | 329 → 가운데(`AD-S4-12`) | **272** · pill 240 | 329 | `min(329px, 100%)` |
| 팝업 pill 본문 | 297 | **240** — 줄바꿈 증가 → 2줄 clamp. `S4B-Q2` ⓐ 면 높이 불변 | 297 | |
| Record Control 150 | | 그대로 | | 고정 |
| 하단 바 | 279 | 272 (`AD-S4-10`) | 279 | 상위 §8 |
| Drawer | 345 (`AD-S4-7`) | 272 | 432 | 상위 §8 |

### 8.2 세로 — ⚠️ **사용자 결정 필요 (`S4B-Q5`)**

`[계산]` Figma 콘텐츠는 상태바 아래 **796px**(56~852)를 쓴다. 위 묶음 = 상단 줄~상태 블록 bottom **455**(56 기준), 아래 묶음 = Record top~프레임 bottom **231**, 유연 간격 **110**.
- 유연 간격을 0 까지 줄여도 **최소 686** 필요. 팝업은 **796 미만이면 예산이 줄어** Record Control 을 덮는다(팝업 top 은 위 묶음에 고정).
- iOS Safari 의 `dvh`(툴바 표시 시)는 393 폭 기기에서도 796 보다 작을 수 있다 → **실기기 웹에서 압축이 발생하는 것이 기본 경우**다. 상위 Spec §8 도 "작은 세로 미결" 로 남겼다.
- **권고(명세 가능 범위)**: ① 유연 간격을 최소 `--space-4`(16)까지 흡수 ② 그래도 부족하면 메달리온을 기존 토큰 `--size-medallion-sm`(136, 링 152)으로 축소(완료 화면 선례) ③ 팝업은 `max-block-size = Record top − 팝업 top`, 넘치면 **pill 목록만 내부 스크롤**(See all 은 항상 보임) ④ 그래도 부족한 높이(예: 375×548)는 **디자이너 판단 필요**.
- ①~③ 은 Figma 에 없는 배치 → 결정 시 허용 차이 등록 대상(`AD-S4-18` 후보).

---

## 9. Accessibility · `R-SHADOW-1`

### 9.1 접근성

| 항목 | 명세 |
|---|---|
| **팝업 (비모달, `D4-54`)** | **disclosure 패턴**: 칩 `aria-expanded` + `aria-controls`. 팝업 = `<section role="region" aria-labelledby={제목 id}>` (dialog 아님 — 포커스 트랩·`aria-modal` 없음). **DOM 순서상 칩 바로 다음**에 둔다 → `Tab` 이 칩 → `See all prompts` → 닫기 → … 순. 열 때 **포커스는 칩에 머문다**. `Escape`(문서 수준 — 단 열린 Dialog/Sheet 가 있으면 그쪽이 우선) → 닫고 포커스 칩. 바깥 탭으로 닫힐 때는 포커스를 옮기지 않는다(탭한 대상이 받는다). Prompt 목록 = `<ul>` · pill 은 포커스 없음(상위 §9) |
| 팝업 열림 알림 | `aria-live` 쓰지 않는다 — `aria-expanded` 변화를 스크린리더가 읽는다 |
| `See all prompts` | `<button>` (이동이 아니라 동작) · `aria-haspopup="dialog"` · 이름 = 보이는 문구 · 터치 44 (`::before` hit slop, 팝업 안에 들어간다 §4 #5) |
| 상태 pill | 보이는 텍스트 `Recording`/`Paused` · dot `aria-hidden` · pill 자체에 live 없음 — 전환 알림은 상위 §9 의 단일 `aria-live="polite"` 영역(*"Recording started." / "Paused." / "Recording resumed."*) |
| 경과 시간 | `role="timer"` + `aria-live="off"` (상위 §7.1 유지) · `tabular-nums` |
| Record Control 접근성 이름 | `idle` **Start recording** · `recording` **Pause recording** · `paused` **Resume recording** · `disabled` 이름은 `idle` 과 같고 `aria-disabled` + `aria-describedby`(사유 — 예: 동의 필요) · `permission-denied` **Microphone is off** + `aria-haspopup="dialog"`(안내 시트) |
| 닫기 | `Close session` · 38 → hit 44 (IconButton 기존) · 글리프 HARU SVG `aria-hidden`(§16.4) |
| Reading Context 시트 legend (`D4-63`) | 보이는 legend 숨김 — **`<legend>` 요소는 유지**하고 `.haru-visually-hidden` 으로 숨긴다(`display:none` 금지 — 그룹 접근성 이름 유지). 시트 `<h2>` 와 같은 문장이 시각적으로 두 번 나오지 않게 하는 것만 목적 — §16.6 |
| 시간 목록 `Back` (`D4-64`) | 헤더 **왼쪽** leading 슬롯 · 이름 `Back`(copy 기존 값) · 터치 44 · DOM 순서 = Back → (제목) → trailing → 본문 — §16.7 |
| 책 칩 | 비인터랙티브 텍스트 · 표지 `alt=""` · 말줄임 시 전체 제목을 `title` 이 아니라 **시각 숨김 텍스트 없이 그대로 DOM 에 둔다**(말줄임은 CSS) |
| reduced-motion | §6 표 — 팝업 즉시 · breathing/pulse 정지(Figma 선언값) |

### 9.2 대비 `[계산 — WCAG 상대휘도, 앱 배경 그라디언트 #dbeee7→#d3e3de(52%)→#c7c9d7 의 해당 y 보간]`

| 대상 | 대비 | 판정 |
|---|---|---|
| 팝업 제목 `#4a5f5c` on 팝업 면(white 90%) — **최악: 뒤에 시간 숫자 `#4a5f5c` 가 비칠 때** | **5.90** | ✅ AA — **`N4B-16` 해소** (면은 90% 불투명, blur 없음) |
| 팝업 pill 본문 on `#dbeee7`(불투명) | 4.179 | 기존 가값 `P-11` |
| `See all prompts` `#7d9291` on 팝업 면 (y≈598) | **3.18** | ⚠️ 4.5 미달 — `P-01` 계열(보조 문구) |
| 칩 라벨 · 책 칩 제목 · pill `Recording` `#4a5f5c` on white 74% | 6.0~6.5 | ✅ |
| recording 시간 `#4a5f5c` 48 Bold on 배경 (y442~483) | 5.03~5.13 | ✅ |
| ⚠️ **paused 시간 `#7d9291` 48 Bold on 배경** | **2.42~2.47** | ⛔ 큰 글씨 기준 3:1 **미달** — **가값 후보** (번호는 plan-agent) |
| ⚠️ **보조 줄 `#7d9291` 13 on 배경** (y≈500) | **2.39~2.40** | ⛔ `P-01` 등재 범위(2.91~3.13)보다 **낮다** — 가값 후보 |
| paused dot stroke `#7d9291` on white 74% | 3.06 | ✅ 비텍스트 3:1 (텍스트 병행이라 필수 아님) |
| recording dot `#85bfb6` on white 74% | 1.93 | 장식 — 텍스트 병행으로 1.4.11 비대상 |
| `Mic is off` · mic-off 흰색 on `#aeaeb2` | **2.211** | ⚠️ `P-25` 와 같은 값 — **`P-25` 적용 범위 확장 여부 결정 필요**(`S4B-Q6`) |
| **glass IconButton 글리프 `#5e7370` on white 74%** (`D4-62`, 비텍스트 1.4.11) | 4.81 (`#dbeee7` 위) · 4.70 (`#d3e3de`) · 4.47 (`#c7c9d7`) · 최악 3.41 (뒤에 `#4a5f5c` 글자가 비칠 때, blur 무시) | ✅ 3:1 — 이전 `#4a5f5c` 6.49 / 6.35 / 6.04 / 4.60 에서 낮아진다. §16.5 |
| `Tap to resume` 흰 10px on teal | 2.074 | `D-01`(색) + 크기 11 흡수(상위 §5.4-②, 디자이너 Q16) |

### 9.3 `R-SHADOW-1`

| 대상 | drop 겹 | 번짐 좌우/위/아래 | overflow 조상 | 처리 |
|---|---|---|---|---|
| Prompts 칩 · 닫기 · 책 칩 · 팝업 | `0 6 4` 1겹 | 4 / 0 / 10 | AppShell(화면 가장자리) | inset 불필요 (상위 §10 ①) |
| 상태 pill | 0겹 | 0 | 자체 `overflow-clip`(Figma) | 자식 그림자 0 → 불필요 |
| Record Control `paused`·`permission-denied` 코어 | `0 12 28` | 28 / 16 / 40 | 없음 | 상위 §10 그대로 · `disabled` 는 0 |
| 팝업 내부 (`overflow-clip`) | 자식 drop 0겹 (pill = 테두리만, 제목·See all 텍스트) | — | 팝업 자신 | 불필요. ⚠️ `See all` **포커스 링**(4px) 이 팝업 아래 padding 14 안에 들어가는지 확인 — 14 ≥ 4 ✓ `[계산]` |
| **팝업 pill 목록 내부 스크롤** (§8.2 ③ 채택 시만) | pill drop 0 | — | **신규 `overflow-y: auto`** | 그림자 inset 0 · 스크롤 컨테이너가 포커스 가능(`tabindex=0`)해야 하므로 **포커스 링 4px inset** + 근거 주석 + 양축 프로브 테스트 (`R-SHADOW-1` ⑤⑥) |
| 팝업 그림자가 Record Control 바깥 링(621~631)을 덮는다 | — | — | — | **Figma 렌더 그대로**(팝업이 위 층위) `[png]` — 결함 아님 |

---

## 10. Figma 누락 화면·상태 (C-13) 분류

| # | 화면 / 상태 | 분류 | 근거 |
|---|---|---|---|
| C13-4B-1 | recording 위 팝업 | **design-agent 명세 가능** (§3.1) | 바탕만 다르다 — `D4-53` 로 동작 확정 |
| C13-4B-2 | 팝업 n≠5 · n>5 · 빈 목록 | **명세 가능** (§3.1) · 빈 목록 칩 상태는 `S4B-Q4` | 기존 규칙(5 컷오프) 연장 |
| C13-4B-3 | ready 의 닫기 | ✅ **해소** — Figma `300:1309` (`D4-57`) | |
| C13-4B-4 | PermissionDenied 세션 화면 · 대화 전용 ready | **명세 가능** (§7.1 · §7.3) — 안내 시트는 `AD-S4-16` 후보 | 변형 컴포넌트 + 기존 Sheet 조합 |
| C13-4B-5 | 닫기 확인 다이얼로그 | **명세 가능** (§3.4) — `Discard` 다이얼로그와 동일 (`D4-56`) | |
| C13-4B-6 | 책 칩 `book: null` · 긴 제목 · 표지 없음 | **명세 가능** (§2.1 · §4 #7) | 표지 placeholder 자체는 디자이너 Q8 미해소(비차단) |
| C13-4B-7 (신규) | 팝업 → Drawer 전환 · Drawer 초기 페이지 | **명세 가능** (§3.2) | |
| C13-4B-8 (신규) | 공지 슬롯 · 세션 화면 오프라인 Toast | **명세 가능** (§7.2) — `AD-S4-14` 후보 | TopBar 미사용으로 기존 배치 근거 소멸 |
| C13-4B-9 (신규) | **짧은 세로 화면(< 796) 압축** | ①~③ 명세 가능 / **④ 디자이너 필요** (§8.2) | 메달리온 축소 이상의 재배치는 디자인 판단 |
| C13-4B-10 (신규) | 팝업 등장 모션 | **명세 가능** (§6) | Figma 모션 정의 0건 (상위 §6) |

---

## 11. Plan §18.2 질문 8 + 사용자 결정 항목

### 11.1 Plan 질문 답

| Q | 답 | 상태 |
|---|---|---|
| 1 tail 없는 버블 variant | **가능 — 이미 있다.** `SpeechBubble tail="none"` · 면·그림자·radius 가 ready 버블과 선언 동일 → 신규 Shared UI 0 (§4 #4) | ✅ 해소 |
| 2 반투명 면 대비 | 면 = white 90%(blur 없음). 최악 제목 **5.90** ✅ · `See all` 3.18(`P-01` 계열) (§9.2) | ✅ 해소 (`N4B-16`) |
| 3 최대 높이 · 내부 스크롤 inset | 예산 **293 = n=5 높이, 여유 0**. 권고 = pill 고정 38(`S4B-Q2` ⓐ) + 5 컷오프 + See all → Drawer → **내부 스크롤 불필요**. 짧은 세로에서만 스크롤(§8.2 ③) — 그때 inset = 포커스 링 4 (§9.3) | ⚠️ `S4B-Q2` |
| 4 320px 배치 | §8.1 — 팝업 272 · pill 240 · 나머지 고정 요소는 들어간다 | ✅ |
| 5 시간 타이포 | 48 Bold/41 — 스케일 밖 → **`T-15` 신규 요청** | ✅ (토큰 승인 대상) |
| 6 모션 배분 | recording = 메달리온 breathing **단독**, dot·Record 링 정지 (§6) | ✅ 권고 — 상위 §6.1 과 동일 |
| 7 디자이너 요청서 개정 | `D4-51` 로 **4b 차단 질문은 전부 해소**. 비차단 잔여: Q8 표지 · Q4' 가로 중심(+팝업 +2·책 칩 +2) · Q11 · Q12 · Q16(10px 라벨) · 라이선스 · 타이포 2스텝 · **신규**: 변형 세트 `298:1261`→`163:1590` 병합·`[DRAFT]` 이름 정리 · **짧은 세로 압축(§8.2 ④)** · **paused 보조 텍스트 대비(§9.2)**. → **지금 보낼 필요 없음**, 요청서 개정은 사용자 지시 시 | 권고 |
| 8 폐기될 상위 Spec 절 | §13 표 — ⚠️ Plan 예상과 달리 **§3.2 Drawer · §6.5 Drawer 모션 · `T-1` 은 폐기되지 않는다**(`D4-52`) | ✅ |

### 11.2 사용자 결정 필요 (신규 — `D4-51`~`57` 로 해소된 Plan `N4B-01`·`02`·`03`·`04`·`05`·`08` 은 제외)

| ID | 항목 | 권고 | 차단 |
|---|---|---|---|
| **`S4B-Q1`** | **`See all prompts` 시각 승인** — Orchestrator 가 Figma 에 추가한 요소(14 Semibold · `#7d9291` · 밑줄 · 가운데, 팝업 269→293). `D4-52` 는 *"시안에 추가해 승인받는다"* 로 적었다 — **시각 자체의 승인 기록이 없다** | 현 시안 승인 | ⛔ `S4-G` |
| **`S4B-Q2`** | 팝업 pill 높이 (예산 0) — ⓐ 고정 38 ⓑ 40 + 내부 스크롤 ⓒ 바깥 링 겹침 | **ⓐ** (Figma 선언 그대로, ready 버블 규칙과는 다르게 둔다) | ⛔ `S4-G` |
| **`S4B-Q3`** | `See all` 타이포 14/17 — ⓐ Tier-3 리터럴(예산 유지) ⓑ `--text-subheadline` 15/20 흡수(팝업 296, 링 3px 겹침) ⓒ `--text-footnote` 13/18(294, 1px) | **ⓐ** | ⚠️ `S4-G` |
| **`S4B-Q4`** | `prompts: []` 일 때 칩 — ⓐ 비활성 + 사유 ⓑ 숨김 ⓒ 정상(빈 팝업) | **ⓐ** (Figma 요소를 빼지 않는다) | 비차단 |
| **`S4B-Q5`** | 짧은 세로 화면 압축 순서 (§8.2 ①~④) | ①②③ 채택 + ④ 디자이너 | ⚠️ AC-4-99·`S4-K` (393×852 baseline 은 비차단) |
| **`S4B-Q6`** | PermissionDenied `#aeaeb2` 위 흰 글리프·라벨 2.211 — `P-25` 범위 확장 vs 신규 가값 | `P-25` 범위 확장(같은 값·같은 토큰) | 비차단 |
| **`S4B-Q7`** | paused 시간(2.42~2.47)·보조 줄(2.39~2.47) 대비 — 신규 가값 등재 | 가값 등재 + 디자이너 대기 (Figma 그대로) | 비차단 |
| **`S4B-Q8`** | 세션 화면 안내 배치 — 공지 슬롯 `InlineAlert` + 오프라인 `Toast` (§7.2), 마이크 거부 안내 시트 (§7.3) | 채택 | ⚠️ `S4-H2` |
| **`S4B-Q9`** | 문구 승인 — `Close session` · `Resume recording` · `Microphone is off` · `No prompts for this session` · 안내 시트 3건 · Toast 2건 | 채택 | ⚠️ 해당 단위 |
| `N4B-11` (Plan) | 가로 +2 (팝업 · 책 칩 recording) | 둘 다 가운데 + `AD-S4-12`·`13` 등록 (책 칩 82 는 paused·팝업 80 과 달라 **오타 판정도 가능**) | 비차단 |
| `N4B-17` (Plan) | `AD-S4-7` 처리 | **유지** — Drawer 존속(`D4-52`)으로 대상이 그대로 있다. "대상 소멸" 아님 | 해소 권고 |
| `N4B-13`·`15` (Plan) | 변형 사용처 · `D4-44` 문구 정정 | Plan 권고 그대로 (§7.1 반영) | Plan 소관 |

---

## 12. 허용 차이 후보 (등록 금지 — 사용자 승인 사항)

| 후보 | 대상 | Figma | 구현 | 근거 |
|---|---|---|---|---|
| **`AD-S4-12`** | 팝업 가로 위치 | x34 (+2) | 가운데 + `min(329px,100%)` | `AD-S4-9` 와 같은 성격, 자동 적용 안 됨 |
| **`AD-S4-13`** | 책 칩 recording 가로 | x82 (+2) | 가운데(80) | paused·팝업은 80 |
| **`AD-S4-14`** | 세션 공지 슬롯 · 오프라인 Toast | 없음 | §7.2 | TopBar 미사용 |
| **`AD-S4-15`** | 닫기(recording·paused) 확인 다이얼로그 | 없음 | `ConfirmDialog` (`AD-S4-4` 사용처 확장) | `D4-56` |
| **`AD-S4-16`** | 마이크 거부 안내 시트 | 없음 | §7.3 | 기존 in-page 안이 버블과 충돌 |
| **`AD-S4-17`** | Prompts 칩 라벨 line-height (Figma 바인딩 11) | 11 | 20 + 고정 높이 36 | **Visual Gap 에서 차이가 날 때만** |
| **`AD-S4-18`** | 짧은 세로 압축 | 852 만 | §8.2 ①~③ | `S4B-Q5` 결정 시 |
| (조건부) | `See all` 타이포 흡수 | 14/17 | `S4B-Q3` ⓑ/ⓒ 선택 시 | |
| (조건부) | 팝업 pill 2줄 40 / 링 겹침 | 38 | `S4B-Q2` ⓑ/ⓒ 선택 시 | |

---

## 13. 상위 Spec(`stage-4-design-spec.md`) 대체 목록

| 상위 절 | 처리 |
|---|---|
| §0.2 · §2.4 표 ①③④⑤⑥ · §2.4.1 "남는 것" · §2.4.2 | **대체** → 이 문서 §2 (`D4-51`) |
| §2.6 `RecordControlProps.state` 2종 · `disabled?` | **대체** → §2.5 · §4 #1 |
| §3.3 Drawer 트리거 (TopBar IconButton) | **폐기** → §3.2 (`See all`) |
| §4 #5 `SessionTimer` | **대체** → `SessionStatusBlock` (§4 #6) |
| §7 ② 트리거 · ④ 오프라인 배치 · ⑨ 마이크 거부 배치 · ⑩ RecordButton disabled | **대체** → §7 |
| §7.1 형식 `m:ss` · 타이포 `--text-callout` · 배치 "조건부" | **대체** → **`mm:ss` 고정**(`03:24`) · `T-15` · §2.1 y400 |
| §7.4 흐름 "→ Prompt Drawer" | `N4B-15` 결정 따라 정정 (대화 전용 ready 에는 칩이 없어 Drawer 경로 없음 — ready 버블이 Prompt 표시) |
| §8 `78:353` 관련 · 세로 행 | 보강 → §8 |
| §2.2.1 ready 버블 "제목 타이포 토큰" `--text-callout`(16/21, Δ1 흡수) | **정정** → line-height **22** (`--text-headline--line-height`, Figma `88:840` 16/22) — §16.1 (VG-F1-03) |
| §2.2.2 tail overhang ⚠️ {0, 2.63} 미확정 · §12.4-① | **정정·종결** → **10.627 확정** — §16.2 (VG-F1-04) |
| §12.4-⑥ 닫기 X 글리프 "16 흡수" 미결 | **종결** → HARU 전용 SVG 15×15 — §16.4 (VG-F1-01) |
| §2.2.0 메달리온 링 Primitive `--haru-white-a50` 직접 지정 | **정정** → Semantic `--color-surface-medallion-ring` (T-22) |
| **유지** | §2.2 ready 전부(위 정정 제외) · §2.3 바 · §2.5 Discard/Submit · §2.7 완료 · **§3.2 Drawer** · §4 #2 `PromptCarousel` · §5 `T-1`~`T-14` · §6.1~6.6 · §10 · §11 |

---

## 14. Plan 과 어긋나는 지점 (Plan 은 고치지 않는다 — plan-agent 보고)

| # | Plan 위치 | Plan 기술 | 이 Spec | 원인 |
|---|---|---|---|---|
| PM-1 | §7 · §9 · §11 · §13 `S4-G` | Drawer·`PromptCarousel` **만들지 않는다**, `T-1` 불필요 | **만든다** (`D4-52`) — `S4-G` 범위 = 칩 + 팝업 + **See all + Drawer + 캐러셀**. 단위 과대 우려 → `S4-G1`(팝업) / `S4-G2`(Drawer) 분할 제안 | Plan 이 `D4-52` 이전 작성 |
| PM-2 | §14.2 · AC-4-54 | 폐기 후보 | **유지** (Drawer 코칭 노트) · 4b AC 합계 59 가능성 소멸 → **60** | 동 |
| PM-3 | AC-4-56 수정안 | Drawer 포커스 트랩 **폐기** → 비모달 기준 | **분리 필요**: 팝업 = 비모달(§9.1) / **Drawer = 기존 모달 포커스 트랩 유지** | 동 |
| PM-4 | AC-4-97 | "Drawer 화살표 **삭제**" | 화살표 **유지** + `See all` 터치 44 추가 | 동 |
| PM-5 | §1.3 · X-06 · AC-4-132 | 팝업 329×**269**, 간격 **24** | **293**, 간격 **0** — 예산 여유 없음 | Figma 갱신(F-1) |
| PM-6 | `N4B-07` 권고 ⓑ · AC-4-132 | 전부 표시 + 내부 스크롤 | **5 컷오프 + See all → Drawer** | Drawer 존속 |
| PM-7 | §1.1 · §17.4 C13-4B-3 | ready+닫기 프레임 없음 → 사용자 Figma 필요 | **`300:1309` 존재** — 해소 | Figma 갱신(F-5) |
| PM-8 | AC-4-129 · §14.3 | 닫기 AC 는 recording·paused 만 | **ready 닫기(확인 없음, `D4-57`) AC 신규 필요** | `D4-57` |
| PM-9 | X-20 · R4B-02 · `N4B-16` | 반투명 면 · 대비 미측정 | white 90%, 최악 5.90 — **위험 해소** | 실측 |
| PM-10 | §1.2 · X-15 | 시간 "높이 41 큰 숫자" | **48 Bold / 41** → `T-15` | 실측 |
| PM-11 | X-14 · `N4B-13` | Disabled = `D4-18` opacity .5 와 "같을 가능성" | 값은 같고 **코어 그림자 제거가 추가** — Figma 대로 구현 | 실측 |
| PM-12 | §12 `session:prompts-empty` | 칩 규칙 "§15 질문" | `S4B-Q4` 권고 ⓐ | — |
| PM-13 | AC-4-127 | `role="timer"` · `mm:ss` | 일치 ✓ — 단 paused 시간 **색 변경**(secondary) 과 그 대비 이슈(`S4B-Q7`) 추가 | 실측 |
| PM-14 | §17.4 기존 행 · 상위 §7 ④ | 오프라인 배너 = TopBar 직하 | TopBar 없음 → Toast (`S4B-Q8`) | `D4-51` |
| PM-15 | `N4B-17` 권고 | `AD-S4-7` "대상 소멸" 표기 | **대상 존속** — 표기 불필요 | `D4-52` |
| PM-16 | Mock §12 | 신규 6종 | 추가 제안 없음. `consent-missing`(Disabled) · 지연(전이 처리 중 Disabled) 연결만 §7.1 | — |

---

## 15. development-agent 구현 메모

1. `S4B-Q1`·`Q2` 결정 전 **`S4-G` 착수 금지**. `S4-F2`(recording·paused·닫기·책 칩·상태 블록·RecordControl 5변형)는 `D4-51`·`D4-56` 으로 **차단 없음**.
2. 세션 화면 요소는 **같은 노드 유지**(재마운트 금지) — 상태별 baseline(ready / recording / paused / 팝업 n=5 / PD / disabled) 각각 `settle()` + `hideDevPanel()` + **주입 clock 으로 시간 고정**(`03:24` 재현 권장).
3. Record Control 변형 선택은 **순수 함수**(상태 → 변형)로 두고 unit test.
4. 팝업 바깥 탭 판정은 `pointerdown` 캡처 단계에서 **닫기만** 하고 `preventDefault` 하지 않는다(대상 동작 보존).
5. `See all` → 팝업 닫기와 Drawer 열기를 같은 핸들러에서 순차 실행, Drawer `onClose` 의 포커스 복귀 대상 = 칩.
6. 신규 토큰은 §5.2 이름 제안 그대로(Tier-3, `@theme` 미등재). `T-5` 그라디언트는 **각도 131.19deg · 정지점 0% / 70.92%** 포함.
7. 시각 비교 대상 노드: `300:1309` · `298:1262` · `298:1340` · `296:1210` · `298:1227`/`1236`/`1245`.
8. **2026-10-27 개정분은 §16** — 닫기 X SVG(§16.4) · IconButton 글리프 색(§16.5) · legend 숨김(§16.6) · Sheet `leading`(§16.7). `D4-62` 는 glass IconButton 을 쓰는 baseline 전부를 바꾸므로 `R-BASELINE-1` ⑤ 대로 diff 를 원인별로 분해한 뒤 재생성한다.

---

## 16. Visual Gap `S4-F1` 정정 + `D4-62`·`D4-63`·`D4-64` 반영 (2026-10-27)

근거: `docs/design/stage-4b-visual-gap-f1.md` (측정 표기 `[ctx]`·`[svg]`·`[px]`·`[probe]` 는 그 문서 §0) · `docs/decisions/stage-4-approvals.md` `D4-62`~`D4-64`.

### 16.1 ready 버블 제목 line-height = 22 (VG-F1-03, Spec 정정)

- Figma `88:840` `[ctx]` = Semibold **16/22**. 구현 computed `16px / 22px / 590` 과 일치 — **구현 변경 없음**.
- 토큰: 크기 `--text-callout` 16 · line-height **`--text-headline--line-height` (22)** (T-28 `--bubble-session-title-line` 경유). 상위 Spec §2.2.1 의 "`--text-callout` 16/21, Δ1 흡수" 는 같은 절의 높이식 `14+22+6+…=269` 와 모순이었다 → 폐기.

### 16.2 tail overhang = 10.627 (VG-F1-04, Spec 정정)

- `[ctx]` `88:876`: tail 컨테이너 **22.627**(16 정사각형 −45° 대각선) + `mb-[-12px]` → 본체 top = 컨테이너 top + **10.627**. 상위 Spec §2.2.2 의 {0, 2.63} 은 회전 노드 metadata y 를 잘못 읽은 값.
- `[px]` 꼭짓점 Figma/구현 차이 < 0.5px. 상위 §2.2.2 ⚠️ 박스와 §12.4-① 을 **확정으로 닫는다**. 구현 변경 없음.

### 16.3 Spec 밖 토큰 7개 등재 (VG-F1-07)

→ §5.3 표 T-22~T-28. 사용자 승인이 필요한 새 값 없음.

### 16.4 닫기 X 글리프 = HARU 전용 SVG (VG-F1-01)

| 항목 | 명세 |
|---|---|
| 원본 | Figma **`29:77`** = **`300:1319`** (SVG 원문 바이트 동일 `[svg]`). recording·paused `298:1311` 닫기, Discard/Complete 화면의 닫기에도 같은 글리프 |
| 분류 | **HARU 전용 아이콘 (Stage 0 #21 — Figma SVG export)**. ⛔ **Lucide `x` 가 아니다** — Lucide 는 박스 20 · 선 폭 10 · stroke 1.25(24 기준 1.5) → 렌더 12×12 로 Figma 10×10 과 다르다 |
| 기하 | viewBox **15×15** · path 3.125→11.875 (선 폭 8.75, 렌더 bbox **10×10**) · `stroke-width` **1.375** · `stroke-linecap: round` · fill 없음 |
| 색 | `stroke="currentColor"` — 색은 IconButton 이 준다(§16.5, `D4-62`) |
| 박스 | 글리프 박스 15 = Tier-3 `--icon-button-icon-size-close: 15px` (신규 T-30). `--icon-button-icon-size`(20)은 **바꾸지 않는다**(back 18→20 흡수 유지) |
| 접근성 | 글리프 `aria-hidden` · 이름은 IconButton `label`(`Close session`) |
| 에셋 | 사내 Figma 원본이므로 라이선스 이슈 없음 |

### 16.5 glass IconButton 글리프 색 = `#5E7370` (`D4-62`)

- 범위: **앱 전체의 glass `IconButton`** (Stage 1 부터의 차이 VG-F1-02). Figma `29:77` X · `77:150` back 둘 다 stroke `#5E7370` `[svg]`.
- 토큰: **Component `--icon-button-fg: var(--color-action-secondary-fg)`** (T-29, = ink-600). `.haru-icon-button` 의 `color` 를 이 토큰으로. 화면 코드에 HEX 금지.
- `plain` variant: Figma 근거 노드가 glass 뿐이므로 **`D4-62` 범위 밖** — 현행 `--color-fg-primary` 유지가 원칙이나, 컴포넌트 기본 규칙 하나로 두 variant 가 함께 바뀌는 구조다. development-agent 는 glass 에만 적용하고(`.haru-icon-button--glass { color: var(--icon-button-fg) }`), plain 까지 바꿀지는 **보고 후 결정**.
- 대비 `[계산 — WCAG 상대휘도, glass = white 74% 를 배경 위 합성, blur 무시]` (1.4.11 비텍스트 기준 3:1):

| 배경 (앱 그라디언트 위치) | 신규 `#5e7370` | 이전 `#4a5f5c` |
|---|---|---|
| `#dbeee7` (상단 — 세션 닫기·뒤로 위치) | **4.81** | 6.49 |
| `#d3e3de` (52%) | 4.70 | 6.35 |
| `#c7c9d7` (하단) | 4.47 | 6.04 |
| 최악 — 뒤에 `#4a5f5c` 글자가 비칠 때 | **3.41** | 4.60 |

  전부 3:1 충족. ⚠️ 위 값은 **계산값**이다 — 구현 후 Visual Gap 에서 **렌더 픽셀 프로브로 재측정**해 기록한다(`D4-62` "대비 재측정 기록"). baseline 재생성 대상 = glass IconButton 이 보이는 전부(VG-F1-02 추정 18건 이상).

### 16.6 Reading Context 시트 legend 시각적 숨김 (`D4-63`)

- 대상: **이번 시트만** — `ReadingContextSheet` 의 선택지 뷰(`When will you read?`)와 시간 뷰(`Time`) 두 `RadioGroup`. ⛔ Stage 2 `SelectTrigger` 시트(`SelectTrigger.tsx:142`)는 **유지**(보이는 legend 그대로).
- 방법: `RadioGroup` 에 opt-in prop **`legendVisuallyHidden?: boolean`**(기본 false — 기존 사용처 외형 불변). true 면 `<legend>` 에 공용 `.haru-visually-hidden`(`packages/ui/src/styles/base.css:27`) 적용. `display: none`·`aria-hidden`·요소 제거 금지 — 그룹 접근성 이름이 사라진다.
- 레이아웃: legend 자리(높이·gap)가 사라지므로 제목 ↔ 첫 선택지 간격이 시트 기본 gap 으로 줄어든다. 새 간격 값은 만들지 않는다(기존 Sheet gap 그대로). Figma 없는 명세 화면(Stage 3 §2.4)이라 baseline 재생성 후 Visual Gap 기록.

### 16.7 공용 `Sheet` leading 헤더 슬롯 + 시간 목록 `Back` 왼쪽 (`D4-64`)

| 항목 | 명세 |
|---|---|
| API | `SheetProps.leading?: ReactNode` — **헤더 왼쪽 슬롯**. `undefined` 면 렌더 0 → 기존 시트 DOM·외형 불변(`trailing` 과 대칭) |
| 헤더 배치 | `[leading] [title] … [trailing]` — leading 이 있으면 제목은 leading 바로 오른쪽, **왼쪽 정렬 유지**(가운데 정렬로 바꾸지 않는다). 간격 = 기존 헤더 `gap: var(--space-3)`(12). `justify-content: space-between` 은 trailing 을 오른쪽 끝에 두는 역할만 하도록 제목에 `flex: 1` (또는 동등) |
| 세로 정렬 | 기존 `align-items: center` — 제목 첫 줄 기준 가운데 |
| 시간 목록 적용 | `Back` = 기존 `IconButton variant="plain"` + Lucide `chevron-left` `size="md"`(20) · 이름 `copy.back` — **`trailing` → `leading` 으로 이동만**. 시간 뷰에는 trailing 없음 |
| 크기 · 터치 | 시각 `--icon-button-size` 38 · hit `--icon-button-hit-size` 44(`::before` −3 확장). 시트 좌측 padding ≥ 3 이므로 hit 영역이 시트 밖으로 나가지 않는다. plain 이라 그림자 없음 → `R-SHADOW-1` 비대상 |
| 포커스 순서 | DOM = leading → 제목(`<h2>`, 포커스 없음) → trailing → 본문 → footer. 시간 뷰 진입 시 첫 포커스 대상 = `Back`(시트의 "첫 포커스 대상" 규칙 그대로). `Back` 또는 시간 선택으로 선택지 뷰 복귀 시 포커스 = `Time` `SelectTrigger`(현행 동작 확인, 다르면 보고) |
| 포커스 링 | IconButton 기존 링 — 헤더 왼쪽 끝에서 잘리지 않는지 Visual Gap 에서 확인 |
| RTL | 범위 밖 (영어 1차). `leading` 은 논리 방향(inline-start)으로 둔다 |
| 분류 | Shared UI 확장 (도메인 지식 없음) — 다른 시트의 back 도 같은 슬롯을 쓴다. 기존 `BookDetailSheet` 등 trailing back 사용처의 이동은 **이번 결정 범위 밖**(보고 대상) |
