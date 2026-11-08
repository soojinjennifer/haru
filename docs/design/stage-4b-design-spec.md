# Stage 4b Design Spec — Session Screens (Figma `296:1127` 반영 개정)

Status: **APPROVED (2026-10-26, user)** — 사용자 발화 *"권장안대로 해줘"* (승인 체크포인트 응답: Plan·Design Spec 승인 + Plan §19 차단 CP-1~7 · 비차단 NB-1~11 전 항목 권장안 채택, `D4-58`). 작성: 2026-10-26 design-agent
Based on: Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` 페이지 `16:2` 섹션 **`296:1127` "Recording"** — `298:1262` · `298:1340` · `296:1210`(+`296:1257`) · `298:1261` · **`300:1309`** (확인 2026-10-26) + 기존 `28:51` · `29:62` · `88:960` (재확인 2026-10-26, 변경 없음) · Plan `docs/plans/stage-4b-plan.md` (DRAFT 2026-10-26) · `docs/decisions/stage-4-approvals.md` **`D4-1`~`D4-57`** · 상위 Spec `docs/design/stage-4-design-spec.md` (APPROVED 2026-10-13)

개정 이력: 2026-10-27 design-agent — `docs/design/stage-4b-visual-gap-f1.md` Spec 정정(VG-F1-01·03·04·07) + 사용자 결정 `D4-62`·`D4-63`·`D4-64` 반영 (§16 · §0.1 · §2.4 · §3.4 · §4 · §5.3 · §9 · §13). 결정 반영 개정이므로 Status 유지.
개정 이력: 2026-10-29 design-agent — `docs/design/stage-4b-visual-gap-f2.md`(`S4-F2`) 반영: 토큰 T-31~T-33 등재(§5.3) · `D4-66` aria-live 낭독 철회(§9.1) · `D4-67`/`AD-S4-19` tabular-nums 유지(§2.2 · §9.1) · `D4-65` 확인 다이얼로그 문구 승인(§3.4 · §11.2) · `P-26`·`P-27` 등재 참조(§9.2). 결정 반영 개정이므로 Status 유지.
개정 이력: 2026-11-03 design-agent — **§18 신설 (`S4-H2R` · `S4-H3`, Plan rev 1.4 §13.3·§13.4 · `D4-112`·`D4-114`)** — §18 **APPROVED (2026-11-03, user — `D4-119` · `D4-120`)**. 기존 절의 Status 는 유지. §7.1 마지막 두 행 · §7.3 · 상위 §7 ③⑤⑥ 의 정정은 §18.8 에 delta 로 적고 §18 승인(`D4-119`)으로 효력 발생.
개정 이력: 2026-11-02 design-agent — `S4-H1` 마무리: 상위 Spec 정정 §17 신설(`D4-74`·`D4-86`·`D4-87`·`D4-90`·`D4-100`·`D4-101`·`D4-103`~`D4-106`) · 압축 확정 §8.2 · §7.2(`D4-78`·`D4-79`·`D4-81`~`D4-85`) · 토큰 T-34~T-43 등재(§5.3) · §1 · §4 · §9.1 · §11.2 · §12 · §13 갱신. 결정 반영 개정이므로 Status 유지.

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
| S6 | 완료 | `29:62` y 0~468 | `/session/:sessionId/complete` | `SessionCompletePage` | 상위 Spec §2.7 유효 + **§17 정정** (`D4-90` · `D4-100` · `D4-103` 등) |
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
| **경과 시간** | `298:1324` | **SF Pro Bold 48 / 41** · `text-primary` · `03:24` | ⚠️ 스케일 밖 → **신규 `T-15`** · `--color-fg-primary` · `tabular-nums` (유지 — `D4-67`, 숫자 폭 Figma 128 ↔ 구현 134 는 허용 차이 `AD-S4-19`) |
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
- **구현 형태 = `Sheet variant="floating"` + `surface="drawer"`** (`D4-74`) — 상위 §3.2 명세 1 의 `variant="bottom"` 을 대체한다. §17.2.
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
| `recording` · `paused` | 확인 다이얼로그 | **`Discard` 와 같은 `ConfirmDialog`**(상위 §2.5.3 — 문구 4건 동일, `D4-56`. 문구 4건 **승인 `D4-65`** (2026-10-29): `Discard this recording?` · `This recording will be removed from this device and won't be saved.` · `Discard` · `Keep recording`) | 확인 → `→ abandoned` → 서버 확정 후 로컬 삭제 → `/` · 취소 → 요청 0 · 상태·녹음 유지 · 포커스 닫기 버튼 복귀 |
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
| 12 | **`Sheet`** | Shared UI (기존) | **`variant="floating"` + `surface="drawer"` 추가** (`D4-74`) — §17.2 | `88:960` |
| 13 | **Toast 훅** | Shared UI (기존) | **공개 훅 `useToastPresent` 추가**(`D4-104`) · `useToastTopBarInset` 을 `useLayoutEffect` 로 변경(`D4-101`) — §17.1 · §17.4 | Figma 없음 |
| — | `ConfirmDialog` · `PageIndicator` · `PromptPill`(세션 밀도) · `InlineAlert` · `Toast` · `SessionActionBar` | 재사용 | 변경 없음 | — |

**통합 판단**
- 팝업 ≠ 신규 버블: ready 버블과 **역할(Prompt 미리보기)·데이터(`SessionSummary.prompts`)·내부 구조가 같다** → `SpeechBubble` 재사용. 다른 것은 tail·제목 출처(ready = 서버 인사 / 팝업 = copy 고정)·`See all` 슬롯뿐.
- 상태 pill ≠ `Tag`/`Chip`: 비인터랙티브 상태 표시 + dot 2형태 — `SessionStatusBlock` 안에 둔다(재사용처 1곳, Shared 승격 안 함).
- 책 칩 ≠ 기존 `BookCover`: placeholder 가 평면 tinted + 이니셜 `[직독: entities/book/book.css:124]` 이고 16×22 에 이니셜이 들어가지 않는다 → 표지 슬롯만 `T-5` 그라디언트.

**신규 Shared UI 컴포넌트 0 · Shared UI 확장 5**(RecordControl 상태 · Button sm · TextLink subtle · Sheet `leading` · RadioGroup `legendVisuallyHidden` — 뒤 2건 2026-10-27 `D4-63`·`D4-64`) **· 색 변경 1**(IconButton 글리프, `D4-62`) **· 2026-11-02 추가 확장 2**(Sheet `floating`/`drawer` `D4-74` · Toast 공개 훅 `D4-104`) **· 되살림 1**(PromptCarousel) **· Domain 신규 2 · Feature 신규 1.**

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
| T-31 | `--button-icon-stroke-sm` | T3 (구현 추가, VG-F2-07) | `2` (viewBox 24 기준) | Figma `298:1315` 렌더 1.5px @18 `[svg]` — HARU 기본 1.5 로 그리면 1.125px | `S4-F2` §2-⑤ 정당 |
| T-32 | `--button-hit-size-sm` | T3 (구현 추가, VG-F2-07) | `var(--size-touch-min)` (44) | §3.3 세로 hit slop 44 — `--icon-button-hit-size` 와 같은 선례의 별칭 | `S4-F2` §2-⑤ 정당 |
| T-33 | `--session-breathing-scale` | T3 (구현 추가, VG-F2-07) | `1.03` | 상위 Spec §6.3 keyframes `scale 1.03` — `--record-pulse-scale`(1.04)과 값이 달라 재사용 불가 | `S4-F2` §2-⑤ 정당 |
| T-34 | `--session-complete-*` 배치·모션 9종 · `--bubble-complete-width` | T3 (구현 추가) | 값 = `DESIGN_TOKEN_MAP` §8 | 상위 §2.7 · §6.4 의 Figma 값에 이름만 붙였다 | 2026-11-02 번호 부여 |
| T-35 | `--attendance-sticker-*` 치수 8종 | T3 (구현 추가) | 값 = `DESIGN_TOKEN_MAP` §8 | 상위 §2.7.1 | 2026-11-02 번호 부여 |
| T-36 | `--attendance-sticker-title-size` · `-title-line` | T3 (`D4-90`) | `14px` · `17px` | Figma `29:84` Semibold 14 / normal(17) — §17.3 | 흡수 철회 |
| T-37 | `--bubble-complete-subtext-line` | T3 (`D4-87`) | `19px` | Figma `I88:929;88:760` Regular 13/19 — footnote line 18 과 다르다. §17.3 | |
| T-38 | `--session-complete-sticker-delay` | T3 (`D4-105`) | `0ms` | 상위 §6.4 C-3 240 변경 — §17.4 | 사용처 `play` 규칙 1곳 |
| T-39 | `--session-medallion-ring-size-compact` · `--session-bubble-bottom-gap` · `--session-stage-min-block-size` | T3 (`S4-K1`) | 152 파생 · `14.4px` · `205px` | §8.2 | |
| T-40 | `--sheet-floating-*` 8종 | T3 (`S4-G2`) | 값 = `DESIGN_TOKEN_MAP` §8 | `D4-69` · `D4-70` · `D4-74` | |
| T-41 | `--prompt-carousel-*` 6종 | T3 (`S4-G2`) | 값 = `DESIGN_TOKEN_MAP` §8 | `D4-71` · `D4-73` | 상위 T-10 명칭 정정 |
| T-42 | `--prompt-drawer-note-*` 4종 (min-height 제외) | T3 (`S4-G2`) | 값 = `DESIGN_TOKEN_MAP` §8 | `D4-73` | |
| T-43 | `--haru-gray-6` · `--color-carousel-arrow` · `--color-carousel-arrow-disabled` | Primitive 1 · Semantic 2 (`S4-G2`) | `#f2f2f7` · palette mint · gray-6 | `D4-73` · `D4-76` | 신규 HEX 1 — Figma `86:324` SVG 원문 |

이미 Spec 안이던 것(등재 불요): `--record-icon-offset-labeled`(상위 §2.6.1) · `--record-pulse-opacity`/`-scale`(상위 §6.2).
**정정 합계: 신규 Semantic 1(T-22) · Component 1(T-29) · Tier-3 7(T-23~T-28 · T-30) · Primitive 0 · 신규 HEX 0.**
**2026-10-29 추가(`S4-F2` VG-F2-07): Tier-3 3(T-31~T-33) — 신규 HEX 0 · 사용자 승인 필요 새 값 0. 누계 Tier-3 10.**
**2026-11-02 등재(T-34~T-43): 코드에 이미 있는 토큰에 번호만 붙였다. 새 값 0.** 토큰별 값 전수는 `docs/DESIGN_TOKEN_MAP.md` §8 (Stage 4 · 4b 신규 122개).

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
- 세로 압축(§8.2)으로 간격이 슬롯 높이보다 작아지면 `Toast` 로 대체한다. 판단 기준은 `@media` 가 아니라 **콘텐츠 높이 컨테이너**(`D4-79`), 유연 간격은 702 미만에서 16 이다(`S4-K1`, §8.2 표).
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

### 8.2 세로 — ✅ **결정 완료** (`S4B-Q5` → `D4-58` CP-7 · `D4-78`·`D4-79`·`D4-81`~`D4-85`, `S4-K1`)

`[계산]` Figma 콘텐츠는 상태바 아래 **796px**(56~852)를 쓴다. 위 묶음 = 상단 줄~상태 블록 bottom **455**(56 기준), 아래 묶음 = Record top~프레임 bottom **231**, 유연 간격 **110**.
- 유연 간격을 0 까지 줄여도 **최소 686** 필요. 팝업은 **796 미만이면 예산이 줄어** Record Control 을 덮는다(팝업 top 은 위 묶음에 고정).
- iOS Safari 의 `dvh`(툴바 표시 시)는 393 폭 기기에서도 796 보다 작을 수 있다 → **실기기 웹에서 압축이 발생하는 것이 기본 경우**다. 상위 Spec §8 도 "작은 세로 미결" 로 남겼다.
- **권고(명세 가능 범위)**: ① 유연 간격을 최소 `--space-4`(16)까지 흡수 ② 그래도 부족하면 메달리온을 기존 토큰 `--size-medallion-sm`(136, 링 152)으로 축소(완료 화면 선례) ③ 팝업은 `max-block-size = Record top − 팝업 top`, 넘치면 **pill 목록만 내부 스크롤**(See all 은 항상 보임) ④ 그래도 부족한 높이(예: 375×548)는 **디자이너 판단 필요**.
- ①~③ 은 Figma 에 없는 배치 → 결정 시 허용 차이 등록 대상(`AD-S4-18` 후보).

위 권고는 작성 당시 기록이다. **구현 기준은 아래 확정 표다** (`stage-4b-visual-gap-k1.md` · `storytime-session.css` 대조 2026-11-02).

**판단 기준 (`D4-79`)**: `@container haru-session (height)` — 높이는 **safe-area 를 뺀 콘텐츠 높이**다. **`D4-83`**: 최소 지원 iOS 16 이상이라 `@media` 대체 규칙을 두지 않는다.

| 콘텐츠 높이 | 동작 | 근거 | 허용 차이 |
|---|---|---|---|
| ≥ 796 | Figma 그대로 | — | — |
| < 796 | **pill 목록 내부 스크롤** — 팝업 + **ready 버블**. ready 버블 아래 간격 14.4 (`--session-bubble-bottom-gap`) | `D4-58` CP-7 ③ · `D4-78` · 임계 유지 `D4-85`(790~795 소량 스크롤 수용) | `AD-S4-18` |
| 702 ~ 795 | 유연 간격이 흡수 | `D4-58` CP-7 ① | `AD-S4-18` |
| < 702 | 메달리온 136 · 링 152 · stage 하한 205 · 유연 간격 하한 16 | `D4-58` CP-7 ② · `D4-81` | `AD-S4-18` |
| 646 ~ 663 | 아래 여백 축소 (660 에서 14) | `D4-80` | `AD-S4-21` |
| 628 ~ 645 | 바 bottom = 콘텐츠 높이(아래 여백 0), Record ↔ 바 간격 = 높이 − 628 (645→17, 628→0) | `D4-81` · `D4-84` | `AD-S4-22` |
| ≤ 627 | **628 기하 그대로 + 세션 세로 스크롤**로 Submit · Discard 도달. 첫 화면에 바가 안 보일 수 있다 (320×568 범위 60) | `D4-82` · `D4-93` | `AD-S4-23` |

**④ 디자이너 요청은 채택하지 않았다** — `D4-81`·`D4-82` 사용자 지시로 대체됐다.

---

## 9. Accessibility · `R-SHADOW-1`

### 9.1 접근성

| 항목 | 명세 |
|---|---|
| **팝업 (비모달, `D4-54`)** | **disclosure 패턴**: 칩 `aria-expanded` + `aria-controls`. 팝업 = `<section role="region" aria-labelledby={제목 id}>` (dialog 아님 — 포커스 트랩·`aria-modal` 없음). **DOM 순서상 칩 바로 다음**에 둔다 → `Tab` 이 칩 → `See all prompts` → 닫기 → … 순. 열 때 **포커스는 칩에 머문다**. `Escape`(문서 수준 — 단 열린 Dialog/Sheet 가 있으면 그쪽이 우선) → 닫고 포커스 칩. 바깥 탭으로 닫힐 때는 포커스를 옮기지 않는다(탭한 대상이 받는다). Prompt 목록 = `<ul>` · pill 은 포커스 없음(상위 §9) |
| 팝업 열림 알림 | `aria-live` 쓰지 않는다 — `aria-expanded` 변화를 스크린리더가 읽는다 |
| `See all prompts` | `<button>` (이동이 아니라 동작) · `aria-haspopup="dialog"` · 이름 = 보이는 문구 · 터치 44 (`::before` hit slop, 팝업 안에 들어간다 §4 #5) |
| 상태 pill | 보이는 텍스트 `Recording`/`Paused` · dot `aria-hidden` · pill 자체에 live 없음 — ~~전환 알림은 상위 §9 의 단일 `aria-live="polite"` 영역(*"Recording started." / "Paused." / "Recording resumed."*)~~ **철회 (`D4-66`, 2026-10-29)**: 상태 전환 낭독을 넣지 않는다 — Record Control 접근성 이름 변화로만 전달 |
| 경과 시간 | `role="timer"` + `aria-live="off"` (상위 §7.1 유지) · `tabular-nums` (`D4-67` 유지 · 허용 차이 `AD-S4-19`: 128 ↔ 134) |
| Record Control 접근성 이름 | `idle` **Start recording** · `recording` **Pause recording** · `paused` **Resume recording** · `disabled` 이름은 `idle` 과 같고 `aria-disabled` + `aria-describedby`(사유 — 예: 동의 필요) · `permission-denied` **Microphone is off** + `aria-haspopup="dialog"`(안내 시트) |
| 닫기 | `Close session` · 38 → hit 44 (IconButton 기존) · 글리프 HARU SVG `aria-hidden`(§16.4) |
| Reading Context 시트 legend (`D4-63`) | 보이는 legend 숨김 — **`<legend>` 요소는 유지**하고 `.haru-visually-hidden` 으로 숨긴다(`display:none` 금지 — 그룹 접근성 이름 유지). 시트 `<h2>` 와 같은 문장이 시각적으로 두 번 나오지 않게 하는 것만 목적 — §16.6 |
| 시간 목록 `Back` (`D4-64`) | 헤더 **왼쪽** leading 슬롯 · 이름 `Back`(copy 기존 값) · 터치 44 · DOM 순서 = Back → (제목) → trailing → 본문 — §16.7 |
| 책 칩 | 비인터랙티브 텍스트 · 표지 `alt=""` · 말줄임 시 전체 제목을 `title` 이 아니라 **시각 숨김 텍스트 없이 그대로 DOM 에 둔다**(말줄임은 CSS) |
| reduced-motion | §6 표 — 팝업 즉시 · breathing/pulse 정지(Figma 선언값). 완료 화면 스티커 = Toast 퇴장 후 연출 없이 표시 (`D4-106`, §17.5) |

### 9.2 대비 `[계산 — WCAG 상대휘도, 앱 배경 그라디언트 #dbeee7→#d3e3de(52%)→#c7c9d7 의 해당 y 보간]`

| 대상 | 대비 | 판정 |
|---|---|---|
| 팝업 제목 `#4a5f5c` on 팝업 면(white 90%) — **최악: 뒤에 시간 숫자 `#4a5f5c` 가 비칠 때** | **5.90** | ✅ AA — **`N4B-16` 해소** (면은 90% 불투명, blur 없음) |
| 팝업 pill 본문 on `#dbeee7`(불투명) | 4.179 | 기존 가값 `P-11` |
| `See all prompts` `#7d9291` on 팝업 면 (y≈598) | **3.18** | ⚠️ 4.5 미달 — `P-01` 계열(보조 문구) |
| 칩 라벨 · 책 칩 제목 · pill `Recording` `#4a5f5c` on white 74% | 6.0~6.5 | ✅ |
| recording 시간 `#4a5f5c` 48 Bold on 배경 (y442~483) | 5.03~5.13 | ✅ |
| ⚠️ **paused 시간 `#7d9291` 48 Bold on 배경** | **2.42~2.47** | ⛔ 큰 글씨 기준 3:1 **미달** — 가값 **`P-26`** (`docs/decisions/stage-4-approvals.md` §5 등재 2026-10-29, 디자이너 대기) |
| ⚠️ **보조 줄 `#7d9291` 13 on 배경** (y≈500) | **2.39~2.40** | ⛔ `P-01` 등재 범위(2.91~3.13)보다 **낮다** — 가값 **`P-27`** (`docs/decisions/stage-4-approvals.md` §5 등재 2026-10-29, 디자이너 대기) |
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
| ~~**`S4B-Q5`**~~ | 짧은 세로 화면 압축 순서 (§8.2 ①~④) | ①②③ 채택 + ④ 디자이너 | ✅ **결정 완료** — §8.2 확정 표 (④ 는 `D4-81`·`D4-82` 로 대체) |
| **`S4B-Q6`** | PermissionDenied `#aeaeb2` 위 흰 글리프·라벨 2.211 — `P-25` 범위 확장 vs 신규 가값 | `P-25` 범위 확장(같은 값·같은 토큰) | 비차단 |
| **`S4B-Q7`** | paused 시간(2.42~2.47)·보조 줄(2.39~2.47) 대비 — 신규 가값 등재 | 가값 등재 + 디자이너 대기 (Figma 그대로) | 비차단 |
| **`S4B-Q8`** | 세션 화면 안내 배치 — 공지 슬롯 `InlineAlert` + 오프라인 `Toast` (§7.2), 마이크 거부 안내 시트 (§7.3) | 채택 | ⚠️ `S4-H2` |
| **`S4B-Q9`** | 문구 승인 — `Close session` · `Resume recording` · `Microphone is off` · `No prompts for this session` · 안내 시트 3건 · Toast 2건 · (추가) 확인 다이얼로그 4건 → **승인 `D4-65`** (2026-10-29, §3.4) | 채택 | ⚠️ 해당 단위 |
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
| **`AD-S4-18`** | 짧은 세로 압축 | 852 만 | §8.2 표 | ✅ **등록 (2026-11-01, user)** — `D4-58`·`D4-78`·`D4-80` |
| **`AD-S4-21`~`23`** | 646 미만 하단 배치 · 627 이하 스크롤 | 852 만 | §8.2 표 | ✅ **등록 (2026-11-01, user)** — `D4-80`·`D4-81`·`D4-82`·`D4-84` |
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
| §2.5.1 구현 지시 (`topBar` prop 으로 inset 등록) | **대체** → §17.1 (`D4-103`) |
| §3.2 · §1 표 · §4 `Sheet variant="bottom"` (Drawer) | **정정** → `floating` + `drawer` — §17.2 (`D4-74`) |
| §5.4-① 스티커 제목 15/20 흡수 · §5.4 말미 13/19 → footnote 흡수 | **철회** → §17.3 (`D4-90` · `D4-87`) |
| §6.4 C-3 delay 240 · 재생 조건 | **변경** → §17.4 (`D4-100` · `D4-105`) |
| §6.6 축하 C-3 "즉시 표시" | **정정** → §17.5 (`D4-106`) |
| §12.4 ② ⑫ ⑭ ⑯ | **해소** → §17.6 (`D4-86` · `D4-87`) |
| **유지** | §2.2 ready 전부(위 정정 제외) · §2.3 바 · §2.5 Discard/Submit(위 정정 제외) · §2.7 완료(위 정정 제외) · **§3.2 Drawer**(위 정정 제외) · §4 #2 `PromptCarousel` · §5 `T-1`~`T-14` · §6.1~6.6(위 정정 제외) · §10 · §11 |

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

---

## 17. 상위 Spec 정정 — `S4-H1` 마무리 (2026-11-02)

상위 Spec(`stage-4-design-spec.md`)은 4a QA 판정 근거라 고치지 않는다(§0). 아래 절 번호는 **상위 Spec 번호**이며 이 절이 우선한다.

근거: `docs/decisions/stage-4-approvals.md` · `docs/design/stage-4b-visual-gap-h1.md` §4 · §9~§11 · `docs/design/stage-4b-visual-gap-g2.md` VG-G2-07.

### 17.1 상위 §2.5.1 Toast inset — `D4-103` (`D4-89` · `D4-101` 반영)

| 항목 | 이전 | 정정 |
|---|---|---|
| 구현 지시 | 완료 화면 TopBar 를 `FullscreenLayout` `topBar` prop 으로 넘긴다 | **feature 가 `useToastTopBarInset` 으로 닫기 줄을 직접 등록한다.** `topBar` 슬롯 안 철회 |
| 사유 | — | 슬롯은 layout 소유라 로딩·오류에도 렌더되어 `h1` 이 2개가 된다 · `sticky` · 띠 48 > 스티커 y44 (`visual-gap-h1` §9.5) |
| 결과 위치 | — | Toast y64 (닫기 줄 박스 48 + 16) — 393×852 · 320×568 동일 |
| 등록 시점 | `useEffect` | **`useLayoutEffect`** (`D4-101`) · CPU 6× 잔여 1프레임 수용 (`D4-107`) |

### 17.2 상위 §3.2 명세 1 Drawer 형태 — `D4-74`

- **`Sheet variant="bottom"` + surface 분기 → `variant="floating"` + `surface="drawer"`.** `bottom` 은 전폭 · 위 모서리 radius · padding 24 라 `AD-S4-7` 폭 · 네 모서리 · 핸들 40 · 패딩을 담을 수 없다 (VG-G2-07).
- 값: 토큰 T-40 · 아래 여백 `D4-69` · 높이 329 @393 `D4-70` · pill 폭 본문 100% `D4-71`.

### 17.3 상위 §5.4 타이포 — `D4-90` · `D4-87`

- **① 스티커 제목 15/20 흡수 철회 → Figma 14 / 17** (`29:84` Semibold 14 / normal). 토큰 T-36. 상위 §2.7.1 제목 행도 같이 대체한다.
- **완료 버블 보조 줄 13/19** — 상위 §5.4 말미 *"13/19 → `--text-footnote`(13/18)"* 는 이 줄에 적용하지 않는다. line-height 는 `--bubble-complete-subtext-line`(19, T-37)이다.
- 스티커 부제 줄 16 은 유지한다 (`D4-102`).

### 17.4 상위 §6.4 C-3 — `D4-100` · `D4-105`

| 항목 | 이전 | 정정 |
|---|---|---|
| C-3 delay | 240ms | **0ms** — `--session-complete-sticker-delay` (T-38) |
| `Submit` 경로 | C-1·C-2·C-3 동시 시작 | **C-3 만 Toast 퇴장 뒤 재생**. Toast 동안 칩은 `visibility: hidden` · 슬롯 64 유지 (`held` → `play`) |
| 재진입 · Toast 없는 경로 | — | **C-3 없이 즉시 표시** (`static`). C-1·C-2 는 기존대로 재생 |
| 퇴장 신호 | — | `useToastPresent` (`D4-104`) — 퇴장 애니메이션 끝까지 `true`. **`duration: 0` Toast 호출 0건이 전제**다 |
| C-1 · C-2 | 0ms · 120ms | **변경 없음** |

- 상위 §6.4 의 순서 근거("C-3 를 C-1·C-2 뒤에")는 이제 Toast 퇴장이 시점을 정한다. Q12(순서) 디자이너 답변은 **미결 유지**다.

### 17.5 상위 §6.6 reduced motion — `D4-106`

- 축하 C-1~C-3 = `animation: none` · 중간 상태 없음 **유지**.
- **정정**: `Submit` 경로의 스티커는 reduced motion 에서도 **Toast 퇴장 후 연출 없이 표시**한다. "즉시 표시" 는 모션을 건너뛰라는 뜻이며 표시 시점을 뜻하지 않는다. 재진입은 즉시 표시.
- 실측: `visual-gap-h1` §11 (겹침 0, 첫 표시 프레임 opacity 1).

### 17.6 상위 §12.4 해소 표기

| # | 항목 | 처리 | 근거 |
|---|---|---|---|
| ② | 완료 버블 `min` 단위 | ✅ **해소** — 보조 줄은 **응답 필드 `subtext`** 다. 문구는 Frontend 가 만들지 않고, 없으면 줄이 없다 | `D4-87` · `D4-94` · `D4-98` |
| ⑫ | 완료 화면 닫기 목적지 | ✅ **해소** — **홈으로 replace 이동** | `D4-86` |
| ⑭ | `88:929` 주 문구 weight | ✅ **해소** — Figma 선언 Bold · 구현 700 일치. 결정 불필요 | `visual-gap-h1` §4 미결 표기 정리 |
| ⑯ | 스티커 아이콘 정체 | ✅ **해소** — `90:602` 에셋 path 사용, HARU 전용 SVG 로 처리. 타일 픽셀 0% | `visual-gap-h1` §4 · §9.2 |

⚠️ ②: `D4-87` 은 표시 경로를 정했을 뿐 **Stage 3 `D-6` 의 `Min` 미채택과 같은 계열인지**는 판단하지 않았다. 그 판단은 생성 문구 쪽 사안으로 남는다.

---

## 18. ⭐ `S4-H2R` · `S4-H3` 명세 (2026-11-03, design-agent) — **APPROVED (2026-11-03, user — `D4-119` · `D4-120`)**

> 근거: Plan `stage-4b-plan.md` **rev 1.4** §13.3 · §13.4 · §14(AC-4-63 재정의 · AC-4-145~153) · §18 4·5항 · §19.3 · `D4-112`~`D4-118`. 권고안(CP-8~14 · NB-12~15) 기준으로 쓰고, 각 CP 의 대안을 고르면 달라지는 곳을 §18.7 에 한 줄씩 적었다.
> ⛔ 이 절은 **Plan §19.3 승인 전 구현 근거가 아니다.** Figma 에 없는 UI 는 전부 **후보**로만 표시했다 — 허용 차이 등록·C-13 확정은 사용자 몫이다.

### 18.0 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 무엇을 어떻게 | 대상 |
|---|---|---|
| `[meta]` | `get_metadata` — 자식 이름·좌표 전수 | Activity card `163:2648`(+인스턴스 `163:2649` 펼침) · 서재 `145:1132` · `163:1669` · 서재 카드 `145:1085` · `163:2347` · Home `26:21` · Design Guide `8:2` 전체 |
| `[scan]` | 페이지 `16:2` metadata 전체(노드 **952**개)를 파일로 받아 이름을 정규식 `perm\|mic\|upload\|retent\|offline\|alert\|toast\|banner\|notice\|delete\|allow\|setting\|loading\|spinner` 로 검색 | 페이지 `16:2` |
| `[ctx]` | `get_design_context` — **선언값**(variant · state · fill) | `Button/card` 인스턴스 `I163:2649;86:373` · `I163:2347;163:1916` |
| `[search]` | `search_design_system` — `Button/card` · `microphone permission` · `loading spinner` | 연결 라이브러리 |
| `[직독]` | 저장소 코드 읽기만 (Playwright·dev 서버 실행 0 — 지시) | `InlineAlert.tsx/.css` · `Toast.tsx` · `ToastProvider.tsx` · `useFocusTrap.ts` · `ReadingContextSheet.tsx` · `StartSessionAction.tsx` · `MicPermissionSheet.tsx` · `copy.ts` · `HomeTopBar.tsx` · `local-retention.ts` · `upload-queue.ts` · design-tokens |
| `[계산]` | 위 토큰값의 산술 | §18.5 배너 높이 |

⚠️ **렌더 측정은 하지 않았다** (지시: Playwright 금지). §18.5 의 높이·밀림은 **토큰 산술**이며 구현 후 Visual Gap 에서 `getBoundingClientRect` 로 확정한다.

### 18.1 실측 결과 — 권한·마이크·업로드 노드는 Figma 에 없다

| 대상 | 결과 | 표기 |
|---|---|---|
| Activity card `163:2648` | 자식 = `Prompt Card/Home` ×3. 펼친 `163:2649` = `Cardtitle` · 책 정보 · `Prompt Card` ×4 · **`Button/card`**(`Save` + `Start Session`) — **권한·마이크 노드 0** | `[meta]` |
| `Button/card` (`I163:2649;86:373` · 서재 `I163:2347;163:1916`) | `Button/White`(Save 87×45) + `Button`(teal `#85bfb6`, `Start Session` 235 폭). **state/loading 속성 없음** | `[ctx]` |
| Design Guide `Button` `17:20` | 변형 = Glass × {Rest, Hover, Pressed, Disabled} · Accent × {Rest, **Secondary**, Hover, Pressed, Disabled} — **Loading 변형 없음** | `[meta]` |
| Reading Context 시트 | **Figma 노드 없음** (결과 칩 `86:538` 만 — 상위 §7.5 · `FIGMA_SCREEN_MAP:120`). 시트 자체가 명세 화면이다 | `[meta][scan]` |
| 서재 `145:1132` · `163:1669` | 헤더 · 섹션 · 행 · Tab Bar · `Deemed`(시트 카드 `145:1085` = `163:2649` 동형 / `163:2347` = `Book List` + `Button/card`) — **권한·마이크 노드 0** | `[meta]` |
| Home `26:21` | 자식 11개 (Plan 실측과 동일) — **안내·배너 노드 0** | `[meta]` |
| 페이지 `16:2` 전체 | 매칭 3건 — `298:1245` `PermissionDenied`(Record Control 변형, 기존) · `248:1179` `Trial notice`(온보딩 Step 1, 무관) · `298:1414` 초안 설명문. **권한 안내·업로드·보관 안내 화면 0** | `[scan]` |
| 라이브러리 | HARU 라이브러리 매칭 0 (외부 Community 결과뿐) | `[search]` |

→ **확인 중 상태 = 기존 `Button loading` 으로 덮인다.** 두 경로의 버튼이 이미 `loading` 을 쓴다 `[직독]`: Activity = `ReadingContextSheet.tsx:117` `loading={submitting}`(시트 footer `Button accent fullWidth`), 서재 = `StartSessionAction.tsx:49` `loading={createSession.isPending}`. Button `loading` 은 Stage 1 #22 명세 상태(Spinner + `aria-busy`, native `disabled` 미사용으로 포커스 유지, 누름 무시 — `Button.tsx:51-52,92-94`)다. **새 상태·새 시각 0, 허용 차이 0** — 단 `loading` 구간이 "권한 확인 + 생성" 으로 길어진다(§18.2 ①).

### 18.2 `S4-H2R` — Start Session 전 권한 확인 (CP-8 · CP-9 권고 기준)

**① 확인 중 (AC-4-145 ⑥)**

| 경로 | `loading` 을 켜는 요소 | 켜는 시점 → 끄는 시점 |
|---|---|---|
| Home Activity | Reading Context 시트 footer 확인 버튼 (기존 `submitting`) | 확인 탭 → **권한 판정** → 선택 POST → 생성 응답(이동) 또는 실패 |
| 서재 | 책 시트 `Start Session` (기존 `isPending`) | 탭 → **권한 판정** → 생성 응답 또는 실패 |

- OS 프롬프트는 **버튼 Spinner 위에** 뜬다. 프롬프트를 닫지 않으면 `loading` 유지(시간 제한 없음 — Plan 권고). 문구·진행 텍스트를 덧붙이지 않는다(Figma 없음).
- `loading` 중 재탭 = 무시(기존 Button 규칙). 시트 **닫기(✕·scrim·Escape)는 막지 않는다** — 닫히면 그 뒤 도착한 권한 결과로 선택 POST·생성 요청을 **보내지 않는다**(AC-4-145 ⑦ "이탈 시 `selection` 0").
- 권한 거부·차단·장치 없음 → **화면 변화 없이** `conversation_only` 로 생성·이동한다. Home·시트에서 안내하지 않는다(CP-9 ⓐ, 최우선 규칙 2) — 안내는 세션 화면 시트(②).

**② 대화 전용 세션 진입 안내 (CP-10 ⓐ · AC-4-147) — §7.3 개정**

| 항목 | 명세 |
|---|---|
| 컴포넌트 | **기존 `MicPermissionSheet`** (`Sheet variant="bottom"`, 제목 · 안내 문단 · footer `Button glass fullWidth` `Not now`) — 신규 컴포넌트·토큰 0 |
| 자동 표시 조건 | ① `mode=conversation_only` 세션의 ready 화면이 **처음 렌더될 때 1회** ② **녹음 세션**에서 녹음 시작이 권한 거부로 끝난 직후 1회(현행 §7.3 유지) |
| 자동 표시 안 함 | 같은 세션 재진입(같은 앱 실행 안) · Prompts 팝업·Drawer·Dialog 가 열려 있을 때 · ready 가 아닌 상태 |
| "1회" 의 범위 | **세션 id 당 · 앱 실행 당**(메모리) — 권고. 새로고침 후 재표시는 정보성이라 해가 없다. 대안: 세션 id 를 로컬 기록(재시작 후에도 0) → `S4B-Q15` |
| 수동 열기 | `permission-denied` Record Control 탭 → 시트(`D4-118` 유지) |
| 포커스 | 열림 = 시트의 첫 포커스 대상(현행). ⚠️ **자동 표시는 여는 요소가 없다** — `useFocusTrap` 은 열기 직전 `document.activeElement` 로 돌려준다 `[직독: useFocusTrap.ts:51]` → 세션 진입 직후는 `body`·이전 화면 요소일 수 있다. **닫힘 후 포커스 = Record Control 을 feature 가 명시적으로 지정**한다(AC-4-147 ③). `packages/ui` 변경 0 (`initialFocus` 와 대칭인 복귀 prop 이 필요하면 Shared UI 확장 → 보고) |
| 시트 열림 중 | 상태 전이 0 · 바탕 ready 버블·바 그대로 |
| 대상 상태 | `denied` · `unavailable`(장치 없음) 둘 다 같은 시트·같은 변형 문구(`S4B-Q16`) |

**③ 시트 문구 자리 (NB-12 · `N4B-28`) — 문구 확정은 사용자**

| 키 (예시 이름) | 쓰는 곳 | 상태 |
|---|---|---|
| `micSheet.title` | 두 모드 공통 `Your microphone is off` | `D4-115` 승인 — 그대로 |
| `micSheet.description` | **녹음 세션**(ready·paused 에서 거부) — *"… then come back to this screen."* | `D4-115` 승인 — 그대로 (녹음 세션에서는 사실이다) |
| **`micSheet.conversationDescription`** 🆕 | **대화 전용 세션** — 1건 | development-agent 초안 → 사용자 승인 |

- 변형 문구 조건: ① *"이 화면으로 돌아오면 녹음된다"* 류 문장 0(모드 고정) ② 장치 없음에도 사실일 것(권한 허용만 말하지 않는다) ③ 이 세션은 녹음 없이 계속된다는 사실 + **다음 세션**부터 녹음하려면 무엇을 하는지 ④ 진단·질책·`failed`·`error` 0 ⑤ 320 에서 시트 높이가 화면을 넘지 않게 **3줄 이내 권장**(`subheadline` 15/20, 시트 내부 폭 기준 — Visual Gap 에서 실측).
- 방향 예시(확정 아님): *"This session will continue without recording. To record next time, turn on the microphone for this site and start a new session."*

**④ `Talk without recording` 제거 (CP-11 ⓐ · AC-4-148)**

- §7.3 의 `Button accent` **`Talk without recording`** 를 **명세에서 삭제**한다. 시트 footer = `Not now` 1개(현행 구현 그대로 — `MicPermissionSheet.tsx`).
- copy 키 `micSheet.talkWithoutRecording` 은 **폐기 대상**(development-agent 가 키·주석 정리).
- 녹음 세션 ready 에서 거부 → 시트 + 기존 닫기(`D4-57`, 확인 없이 `ready → abandoned`) → 홈 → 다시 `Start Session` → 판정 `denied` → 자동 `conversation_only`. **신규 UI 0.**
- paused 재개 시 거부 → 시트 + `Submit` 로 지금까지 녹음 제출(현행 바).

**⑤ 프로브 스트림 해제 (NB-13)** — UI 영향 없음(Home·ready 동안 브라우저 마이크 표시등 0 이 기대 결과). Safari 가 Record 탭에서 다시 묻는 경우 Record Control 은 기존 `requesting_permission` → `disabled` 를 거친다(AC-4-134 · H2-4 ①) — 새 시각 0.

**⑥ `AD-S4-16` 판정** — 시트 시각·구성은 등록된 `AD-S4-16`(`D4-58` CP-5) 안이다. 다만 **트리거 1개 추가(대화 전용 첫 진입) · 버튼 1개 제거 · 문구 변형 1건**은 등록 당시 내용과 다르다 → **"`AD-S4-16` 범위 개정" 후보**로 둔다(신규 번호 불필요하다고 보나, 별도 번호로 등록할지도 사용자 판단). ⚠️ approvals §4 대장 표에 `AD-S4-12`~`17` 행이 없다(`D4-58` 본문에만 "14·16 등록") — 대장 정리 대상.

### 18.3 `S4-H3` — 업로드 · 48h · 7일 · 14일 (CP-12 · 13 · 14 권고 기준, C-13)

| 사건 | 신호 `[직독]` | 수단 (권고) | 위치 | 문구 자리 | 사용자 행동 |
|---|---|---|---|---|---|
| 업로드 진행·성공 | 큐 `queued`/`uploading` · 확정 | **표시 0** (CP-12 ⓐ) — 완료 화면 y468 아래 비움 유지(AC-4-61·104) | — | — | — |
| `RECORDING_INCOMPLETE` 자동 재시도 | 큐 HEAD offset 확인 → 재시도 | **표시 0** (CP-14 ⓐ) — 계속 실패하면 48h 행으로 합류 | — | — | — |
| **48h 미확정** | `upload-queue.ts` `stalled_48h` + `stalledNoticeAtMs` | `Toast tone="neutral"` + action **`Try again`** + 닫기(`dismissLabel`) | 앱 수준 `ToastProvider`(상단, `D4-117` 선례) | `uploads.stalled` 1건 + `Try again`(기존 copy 재사용) | `Try again` → 큐 즉시 처리 1회 · Toast 닫힘 |
| **7일 보관 안내** | `local-retention.ts` `retention_notice` + `deleteAtMs` + `retentionNoticeAtMs` | **Home 배너** `InlineAlert tone="warning" placement="banner"` + 닫기 — **닫거나 업로드가 확정될 때까지 유지** | Home 헤더 밴드 밑(오프라인 캐시 배너와 **같은 슬롯**, §18.5) | `uploads.retentionNotice(date)` 1건 (+ `Try again` 은 `S4B-Q10` 결과) | 닫기 · (선택) `Try again` |
| **14일 삭제** | `retention_expired` | `Toast tone="neutral"` 1회 (action 없음, 기본 시간) | 앱 수준 | `uploads.retentionExpired` 1건 | 없음 (이미 일어난 사건) |

- **Toast tone** = `neutral` (Toast tone 은 `neutral`·`success`·`error` 3종 `[직독: Toast.tsx:7]` — `warning` 없음). 문구에 `failed`·`error` 0 (상위 §7.2 원칙 유지) → `error` tone 도 쓰지 않는다. 48h Toast 는 action 이 있어 기존 규칙상 6000ms(`TOAST_DURATION_MS.withAction`) + 수동 닫기.
- **Toast 는 큐가 없다** — 같은 순간 다른 Toast 가 뜨면 교체된다 `[직독: ToastProvider · H2F-4 ③]`. 그래서 **유실 위험(7일)만 배너**로 둔다(Plan CP-13 ⓒ 의 근거와 같다).
- `Try again`(48h · 7일 공통): 누른 뒤 ① 온라인 → 큐 처리 1회, 성공하면 7일 배너는 사라진다(AC-4-150 ④), 성공 Toast 0(CP-12 ⓐ) ② 오프라인 → 요청 0 + **오프라인 안내 1회**(AC-4-149 ④). ⚠️ 세션 화면의 `connectivity.offline` 문구는 `features/storytime-session` copy 소유 — 다른 feature 가 import 하면 feature 간 import 위반. **공용 copy 로 옮기거나 새 키 1건**이 필요하다(development-agent 판단 · 새 키면 승인 대상).
- 7일 배너 문구: **삭제 예정일을 날짜로** 담는다(§18.4). 여러 녹음이 7일 구간에 있으면 배너 **1개**, 날짜 = **가장 이른** `deleteAtMs`, 건수는 말하지 않는다(`D4-117` 의 "건수와 무관한 한 문장" 과 같은 방식).
- 7일 배너 **닫기 범위**: 닫는 순간 7일 구간에 있던 녹음 전부. 그 뒤 **새 녹음**이 7일에 들어오면 다시 뜬다. 닫기 기록은 로컬 레코드에 둔다(NB-14 — 재시작 후 재표시 0, 로그아웃 정리 대상 AC-4-153 ④).
- ⚠️ **표시는 사건이 아니라 상태에서 파생**해야 한다: 보관 판정은 앱 시작 sweep 에서 돌아 **Home 이 구독하기 전에 `retention_notice` 가 나갈 수 있다**. 레코드에 `retentionNoticeAtMs`·`stalledNoticeAtMs` 가 이미 저장된다 `[직독: local-retention.ts:117-121 · upload-queue.ts:262]` → 배너 = "안내 시각 있음 ∧ 미확정 ∧ 닫기 기록 없음" 레코드가 ≥1 이면 표시. 48h·14일 Toast 도 앱 시작 보고를 조립 지점이 보관했다가 구독 시 1회 전달(`D4-117` `onRecoveredRecordings` 패턴). 구현 확인은 development-agent `[직독]`.

**우선순위·동시 표시 (AC-4-153 ② ③)**

| 겹침 | 규칙 (권고) |
|---|---|
| 같은 녹음에 48h·7일·14일이 동시에 해당 (예: 앱을 8일 만에 열었다) | **가장 심한 것만** — 14일 > 7일 > 48h. 덜 심한 안내는 표시한 것으로 기록(다시 뜨지 않음) |
| 다른 녹음끼리 Toast 가 겹침 (앱 시작 시 14일 · 48h · 크래시 복구) | **한 번에 1개, 앞 Toast 가 닫힌 뒤 다음** — 순서 14일 → 48h → 크래시 복구(`D4-117`). 순차는 안내 계층(조립 지점/feature)이 하고 `ToastProvider` 는 바꾸지 않는다(큐 추가는 Shared UI 변경 → 별도 승인) — `S4B-Q14` |
| 7일 배너 ↔ Toast | 채널이 달라 **함께 보일 수 있다**(배너는 흐름 안, Toast 는 상단 오버레이) |
| 7일 배너 ↔ **오프라인 캐시 배너**(`AD-S4-11`) | **같은 슬롯에 1개만. 오프라인 배너 우선** — 이유: ① 오프라인 배너는 비활성 `Start Session` 의 사유(`aria-describedby`, `D4-33`·`D4-39`)라 빠지면 사유가 사라진다 ② 오프라인에서는 `Try again` 이 아무것도 못 한다. 7일 배너는 온라인 복구 시 다시 보인다(닫기 기록 소비 0). 두 배너 적층(밀림 54+α)은 비권고 — `S4B-Q11` |
| 세션 화면 recording·paused 중 앱 수준 Toast (48h·14일) | **보류 후 세션 화면을 떠난 뒤 표시** — 녹음 중 개입 0(PRD §7.5) 원칙. 대안 = 즉시 표시(크래시 복구 Toast 는 현재 route 제한 없음 — H2F-4 ②) — `S4B-Q13` |

### 18.4 7일 안내의 삭제 예정일 표기 (AC-4-150 ③)

| 항목 | 명세 (권고) |
|---|---|
| 값 | `deleteAtMs` (= 첫 part 시작 + 14일) — 응답 값이 아니라 로컬 레코드 값 |
| 형식 | **절대 날짜** · 영어 · 기기 로캘 시간대 — `Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })` → **`Nov 17`**. 해가 다르면 `year: 'numeric'` 추가 → `Jan 3, 2027` |
| 상대 표기 금지 | `in 7 days` 류는 배너가 여러 날 남아 있는 동안 **틀린 값이 된다** |
| 시각 표기 없음 | 삭제는 그 시각 이후 첫 sweep 에서 일어난다(앱이 닫혀 있으면 더 늦다) — 날짜보다 **이르게 지워지는 일은 없다**. 문장은 *"on {date}"* 가 사실과 맞는다. 시각까지 쓰면 앱이 닫혀 있을 때 틀린다 |
| 날짜 생성 위치 | copy 모듈의 함수 `retentionNotice(date: string)` 에 **형식화된 문자열**을 넘긴다. 형식화 함수는 `shared/lib` 1곳(테스트 가능 · 주입 clock) |

### 18.5 Home 배치 — 오프라인 배너와 같은 슬롯 (C-13 · `AD-S4-25` 후보)

- 슬롯: `HomeTopBar` 의 헤더 밴드(48) **바로 아래** — 오프라인 캐시 배너(`ActivityCardOfflineBanner`)와 같은 자리·같은 `placement="banner"` `[직독: HomeTopBar.tsx:69]`. 배너 컴포넌트는 feature 가 소유하고 **Page 가 조립**한다(feature 간 import 0).
- 밀림: 배너는 흐름을 차지한다 → 버블 `261:1293`·캐릭터 `26:22` 가 배너 높이만큼 내려간다. 비교 기준: 오프라인 1줄 배너 **+54 = 가슴 하트가 카드 뒤**(사용자 수용 `AD-S4-11`) · 2단 배너 **+94 = 얼굴 하반부가 카드 뒤**(`G-01`, 사용자가 줄이라고 결정 `D4-32`).

**배너 높이 `[계산 — 렌더 측정 아님]`** — border 1×2 + padding `--space-4` 16×2 = 34 · 제목 `subheadline` 20/줄 · 본문 `footnote` 18/줄 · body gap `--space-1` 4 · action `--size-touch-min` 44 · 닫기 `--icon-button-size` 38 (가로만 차지). 텍스트 폭 = 컬럼 − 34 − 아이콘 20 − gap 12×2 − 닫기 38 → **393: 229px · 320: 156px**.

| 구성 | 393 높이 (= 밀림) | 320 높이 | 평가 |
|---|---|---|---|
| ⓐ 제목 + 본문(날짜) + `Try again` + 닫기 | 34+20+4+18~36+4+44 = **124~142** | 3~4줄 → **142~178** | `G-01`(+94) 보다 크다 — 얼굴이 가려진다 |
| ⓑ 제목 1문장(날짜 포함) + `Try again` + 닫기 | 34+20~40+4+44 = **102~122** | **122~142** | 여전히 +94 초과 |
| **ⓒ 제목 1문장(날짜 포함) + 닫기, `Try again` 없음 (권고)** | 34+20~40 = **54~74** | 2~3줄 → **74~94** | `AD-S4-11`(+54) 수준. 393 2줄이면 +74 |
| ⓓ 배너 없이 앱 시작마다 Toast(`duration: 0`, 닫을 때까지) | 0 | 0 | 다른 Toast 가 오면 교체돼 사라진다 · 상단 헤더를 가린다 — 비권고 |

- **권고 ⓒ** — 근거: ① 큐가 이미 자동 재시도 중이라 `Try again` 은 "지금 한 번 더" 일 뿐이다(CP-14 와 같은 논리 — 사용자 행동이 필요 없는 일을 버튼으로 만들지 않는다) ② 7일 구간에서 사용자가 할 일은 **HARU 를 온라인에서 열어 두는 것**이고, 문장이 그것을 말하면 된다 ③ 밀림을 사용자가 이미 수용한 크기(`AD-S4-11`)로 맞춘다. ⚠️ Plan CP-13 문안(*"7일 = Home 안내 + `Try again`"*)과 다르다 → **`S4B-Q10`** 로 사용자에게 묻는다.
- 문장 길이 목표: 393 에서 1줄(229px ≈ `subheadline semibold` 30자 안팎), 320 에서 2줄. 실제 줄 수는 Visual Gap 에서 실측(`D4-37` 때와 같은 방법 — 실제 배너 DOM 에 후보 문구를 넣어 잰다).
- 잘라내지 않는다(`line-clamp`·`text-overflow` 금지 — 확대 시 줄바꿈 허용, `visual-gap-s4j` §6.1 과 같은 규칙).
- 모션: 기존 배너 등장(`haru-alert-in`, reduced motion 시 없음). 높이 전환 없음(`G-05` 와 같은 상태, 별도 조치 없음).
- tone `warning` → `role="alert"` `[직독: InlineAlert.tsx:62]` — **앱 시작 때 1회 낭독**된다. 유실 위험 안내라 적절하다고 본다(대안: `info` → `status`/polite — 색도 바뀐다).
- 대비: `--color-status-warning-*` 는 가값 `P-04` 대상(`InlineAlert.css`) — 신규 가값 0, QA 리포트의 P-04 목록에 사용처 1곳 추가.
- `R-SHADOW-1`: `InlineAlert` 배너 `box-shadow: none` → 대상 아님. 배너 삽입이 덱 트랙 overflow 박스를 바꾸지 않는지는 오프라인 배너 때와 같은 회귀 확인(`visual-gap-s4j` §1.3).
- 600+ : 앱 컬럼 480 안 — 393 과 같은 규칙(텍스트 폭 316px → 1줄 가능성 높음).

### 18.6 신규 컴포넌트 · 토큰

| 구분 | 내용 |
|---|---|
| 신규 Shared UI | **0** — `Sheet` · `Button loading` · `InlineAlert banner` · `Toast`(action·dismiss) 재사용 |
| 신규 Domain/Feature 컴포넌트 | 안내 구독 렌더러 2개(가칭 — Home 보관 배너 · 앱 수준 업로드 Toast). `RecoveredRecordingsToast`(`D4-117`) 와 같은 "렌더 0 또는 배너 1" 패턴. 위치·이름은 development-agent (feature 간 import 0 · Page 조립) |
| `UploadStatusBadge` | CP-12 ⓐ 채택 시 **Stage 4 에서 만들지 않는다**. `COMPONENT_MAP` 행은 승인 후 design-agent 가 "Stage 4 미생성 — Stage 8 데이터 관리에서 재검토" 로 정정 |
| 신규 토큰 | **0** — 모든 값이 기존 토큰(`--space-*` · `--size-touch-min` · `--icon-button-size` · `--color-status-warning-*` · Toast 토큰) |
| 신규 copy (승인 대상) | `micSheet.conversationDescription` · `uploads.stalled` · `uploads.retentionNotice(date)` · `uploads.retentionExpired` (+ 오프라인 안내 공용화 시 1건) — 이름은 예시 |
| 폐기 copy | `micSheet.talkWithoutRecording` (CP-11 ⓐ) |
| Mock | 기존 `recordings:upload-stalled-48h` · `recordings:recording-incomplete` · `recordings:offline-queued` · `recordings:recording-upload-success` · `recorder:local-retention-exceeded` + Plan 제안 `recorder:local-retention-notice` · `recorder:mic-permission-blocked` · `mic-unavailable` · `mic-permission-revoked`. **추가 제안 0** |

### 18.7 CP 대안을 고르면 이 명세가 어떻게 달라지는가 (한 줄씩)

| CP | 대안 | 명세 변화 |
|---|---|---|
| CP-8 ① | ⓐ check 만 | Start 에서 프롬프트 0 · `loading` 은 거의 즉시 끝남 · 첫 사용자의 거부가 **세션 안**(Record 탭)에서 일어나 §18.2 ④ 경로(시트 → 닫기 → 재시작)가 주 경로가 된다 |
| CP-8 ② | `Start Session`(시트 열기 전) 시점 | `loading` 위치 = **카드의 `Start Session`**(`Button/card` 의 teal 버튼) — 시트 확인 버튼이 아니다. 프롬프트 뒤 시트를 취소하면 권한만 받고 끝난다(POST 0) |
| CP-8 ③ | `unavailable` → 생성 막고 오류 | Home 시트·서재 시트에 **오류 Toast 1건 신규**(copy · C-13 · 허용 차이 후보 추가). `S4B-Q16` 소멸 |
| CP-9 | ⓑ 프롬프트 전 설명 시트 | **신규 C-13 시트**(`Sheet bottom` · 제목 · 문단 · `Continue` accent / `Not now` glass) — `prompt` 상태에서만, 확인 탭 → 설명 시트 → `Continue` 탭 → OS 프롬프트. 문구 3~4건 · `AD-S4-27` 후보 · 이 절에 명세 추가 필요 |
| CP-9 | ⓒ 디자이너 요청 | `S4-H2R` 차단 — 요청서 개정(Q 신규 1) |
| CP-10 | ⓑ 생성 전 Home 확인 다이얼로그 | `ConfirmDialog` 재사용(`AD-S4-4` 사용처 확장) · 문구 4건 · 자동 시트 트리거(§18.2 ② ①) 삭제 · 다이얼로그 취소 시 생성 0 |
| CP-10 | ⓒ 알리지 않음 | 자동 표시 ① 삭제 · AC-4-147 폐기 · 변형 문구는 탭으로 열 때만 쓰임 |
| CP-11 | ⓑ 녹음 ready 에서만 버튼 | 시트 footer 2버튼(`accent` 위 · `glass` 아래, 현 §7.3 순서) — 동작 = 닫기와 같은 `ready → abandoned` + 홈. 대화 전용 세션 시트에는 버튼 0 |
| CP-11 | ⓒ 재생성(contract 추가) | 버튼 복원 + 전환 중 `loading` · 실패 Toast 신규 — plan-agent contract 선행 |
| CP-12 | ⓑ 배지 | 완료 화면 y468~521 슬롯에 `UploadStatusBadge` 6상태 명세 재작성 · AC-4-61/104 수정 · 허용 차이 후보 1 · `S4-H1` baseline 재생성 |
| CP-12 | ⓒ 성공 Toast 만 | 앱 수준 `Toast success` 1건 신규(copy) · 우선순위 표에 1행(최하위) |
| CP-13 | ⓐ 전부 Toast | 7일 = Toast(action) 1회 → §18.5 전체 삭제 · `AD-S4-25` 소멸 · **놓치면 14일에 유실**(R4-11) |
| CP-13 | ⓑ 전부 Home 배너 | 48h·14일도 같은 슬롯 배너 → 슬롯 우선순위 14일 > 7일 > 48h(+오프라인 최우선) · 밀림 빈도 증가 · Toast 순차 규칙 축소 |
| CP-14 | ⓑ 즉시 Toast | `RECORDING_INCOMPLETE` 마다 `Toast neutral` 1건(copy) — 자동 재시도 성공 시에도 이미 떴다. 우선순위 표 최하위 1행 |

### 18.8 기존 절 정정 (§18 승인 시 효력)

| 대상 | 현재 | 정정 |
|---|---|---|
| 4b §7.1 행 "크래시 복구" | *"상위 §7 ⑥ 그대로 (완료 화면 상단)"* | **`D4-117` 로 이미 바뀜** — 앱 시작 후 `Toast neutral` 1회(`RecoveredRecordingsToast`). 스테일 표기 정정(§18 승인과 무관하게 사실 정정) |
| 4b §7.1 행 "업로드 / 48h / 14일" | *"상위 §7.2 그대로"* — 상위 §7.2 에 **14일이 없다** · 배지 슬롯이 AC-4-61 과 충돌 | → **§18.3 표**로 대체 (진행·성공 0 · 48h Toast · 7일 Home 배너 · 14일 Toast) |
| 4b §7.1 행 "마이크 거부" · "대화 전용" | 탭 → 시트 · `mic-permission-denied` 경유 | 진입 = **Start Session 판정**(`D4-112`) · 대화 전용 첫 진입 시 시트 자동 1회 · Mock key 에 `mic-permission-blocked`·`mic-unavailable`·`mic-permission-revoked` 추가 |
| 4b §7.3 | footer = `Talk without recording`(accent) + `Not now`(glass) · 트리거 = 탭 또는 거부 직후 | → **§18.2 ②~④** (footer `Not now` 1개 · 트리거 +대화 전용 첫 진입 · 문구 변형 1) |
| 4b §10 | C13-4B-4 "PermissionDenied 세션 화면 · 대화 전용 ready" | 범위 유지 + 신규 C-13 항목은 §18.9 |
| 상위 §7 ③ `C13-7` | `UploadStatusBadge` + `InlineAlert` + `Toast` + `ProgressBar`, §7.2 3계층 | **Stage 4 미적용** — 진행·성공 표시 0, 실패는 자동 재시도 후 48h 경로(§18.3). §7.2 의 문구 원칙(`failed`·`error` 금지 · 로컬 보존 사실을 알린다)은 **유지** |
| 상위 §7 ⑤ `C13-9` | 48h = `InlineAlert warning` + `Try again`, 완료 화면 업로드 슬롯 | → 앱 수준 `Toast neutral` + `Try again` (48h 시점에 사용자는 완료 화면에 없다) |
| 상위 §7 ⑥ `C13-10` | 크래시 복구 = `InlineAlert info`, 세션/완료 화면 상단 | → `D4-117` Toast (위와 같음) |
| 상위 §7 ⑨ · ⑩ · §7.4 | in-page 상태 · Record Control `disabled` · 흐름에 Drawer | 이미 4b §7.3(`D4-58` CP-5) · CP-6 으로 대체됨 — 진입이 생성 시점으로 바뀐다는 점만 추가(`D4-112`) |
| 상위 §13 대체 목록 | — | 위 행들을 §13 표에 반영(승인 후 design-agent) |

### 18.9 Figma 누락(C-13) · 허용 차이 후보 · 사용자 결정 — **등록·확정하지 않는다**

**C-13 항목 (전부 "design-agent 명세 가능" 으로 분류 — 화면별 승인 필요)**

| # | 화면 / 상태 | 분류 | 근거 |
|---|---|---|---|
| C13-4B-11 | 권한 확인 중 버튼 | **C-13 아님** — 기존 `Button loading`(Stage 1 #22) | §18.1 |
| C13-4B-12 | 대화 전용 첫 진입 시트 자동 표시 + 변형 문구 | 명세 가능 (§18.2 ②③) — `AD-S4-16` 범위 개정 후보 | 기존 시트 재사용 |
| C13-4B-13 | Home 7일 보관 배너 | 명세 가능 (§18.4·§18.5) — `AD-S4-25` 후보 | `26:21` 안내 노드 0 |
| C13-4B-14 | 앱 수준 48h · 14일 Toast · 순차 | 명세 가능 (§18.3) — `AD-S4-26` 후보 | `D4-117` 과 같은 수단 |
| (조건부) C13-4B-15 | 프롬프트 전 권한 이유 시트 | CP-9 ⓑ 선택 시에만 — `AD-S4-27` 후보 | PRD §13 "이유 안내 화면" |

**허용 차이 후보** — ⚠️ **Plan 이 적은 `AD-S4-19` 는 이미 등록된 번호**(경과 시간 숫자 폭, `D4-67`, 2026-10-29)다. 다음 빈 번호는 **`AD-S4-25`** (`AD-S4-24` = `D4-107`).

| 후보 | 대상 | Figma | 구현(권고) |
|---|---|---|---|
| `AD-S4-16` 범위 개정 | 마이크 시트 트리거 +1 · 버튼 −1 · 문구 변형 +1 | 없음 | §18.2 |
| **`AD-S4-25`** | Home 7일 배너 + 버블·캐릭터 밀림 | 배너 없음 | §18.5 ⓒ — 393 **+54~74** · 320 **+74~94** `[계산]` |
| **`AD-S4-26`** | 앱 수준 48h · 14일 Toast | 없음 | §18.3 |
| (조건부) `AD-S4-27` | 프롬프트 전 설명 시트 | 없음 | CP-9 ⓑ 시 |

**사용자 결정 (Plan CP-8~14 · NB-12~15 외 추가분)**

| ID | 질문 | 권고 | 차단 |
|---|---|---|---|
| **`S4B-Q10`** | 7일 배너 구성 (§18.5 ⓐ~ⓓ) — Plan CP-13 은 `Try again` 포함 | **ⓒ 제목 1문장 + 닫기, `Try again` 없음** (밀림 `AD-S4-11` 수준) | ⛔ `S4-H3` |
| **`S4B-Q11`** | 7일 배너 ↔ 오프라인 캐시 배너 | 같은 슬롯 1개 · **오프라인 우선**, 온라인 복구 시 7일 재표시 | ⛔ `S4-H3` |
| `S4B-Q12` | 삭제 예정일 표기 | 절대 날짜 `Nov 17`(해 다르면 연도) · 시각 없음 · *"on {date}"* | 비차단 |
| `S4B-Q13` | recording·paused 중 앱 수준 Toast | 세션 화면을 떠날 때까지 보류 | 비차단 |
| `S4B-Q14` | 앱 시작 Toast 겹침 | 1개씩 순차 · 14일 → 48h → 크래시 복구 · `ToastProvider` 불변 | 비차단 |
| `S4B-Q15` | 대화 전용 시트 자동 "1회" 범위 | 세션 id 당 · 앱 실행 당(메모리) | 비차단 |
| `S4B-Q16` | 장치 없음(`unavailable`)도 같은 시트·같은 변형 문구 | 같게 — 문구가 두 경우 모두 사실이게 쓴다 | 비차단 (CP-8 ③ 권고 채택 시) |

### 18.10 Plan rev 1.4 와 어긋난 지점 (Plan 은 고치지 않는다 — plan-agent 보고)

1. **`AD-S4-19` 번호 충돌** — Plan §13.4 ③ · §17.6 `N4B-31` · §18 5항 · AC-4-150 ⑤ · CP-13 이 Home 배너 후보를 `AD-S4-19` 로 적었으나 이미 등록된 번호다 → `AD-S4-25` 로 바꿔야 한다.
2. **CP-13 의 7일 `Try again`** — 배너 높이 산술상 `Try again`(44) 을 넣으면 밀림이 `G-01`(+94, 사용자가 줄이기로 한 크기)을 넘는다(§18.5). design-agent 권고는 `Try again` 없음(`S4B-Q10`). 채택 시 AC-4-150 ② 문안 수정.
3. **AC-4-153 ② "우선순위로 1개씩"** — 7일은 배너, 48h·14일은 Toast 라 채널이 다르다. "1개씩" 은 **Toast 끼리**와 **같은 녹음 안**에서만 성립한다(§18.3 표). 오프라인 배너와의 관계(`S4B-Q11`)는 AC 에 없다.
4. **`N4B-33` 전제** — Plan 은 *"4a 는 같은 프로세스 안 1회만 보증"* 이라 적었으나, 레코드에 `retentionNoticeAtMs`·`stalledNoticeAtMs` 가 **저장된다** `[직독]` → 신호 1회는 재시작 후에도 유지될 가능성이 있다(저장소 영속성은 development-agent 확인). 반대로 **앱 시작 sweep 이 Home 구독보다 먼저 끝나면 안내가 화면에 닿지 않는다** — 표시를 상태에서 파생해야 한다(§18.3 ⚠️). AC-4-153 증거에 "구독 전 신호" 케이스 추가 권고.
5. **AC-4-147 ③ 포커스 복귀** — 자동 표시는 여는 요소가 없어 `useFocusTrap` 기본 복귀로는 Record Control 에 가지 않는다(§18.2 ②). Plan §13.3 ⑦ 구현 지시에 없음.
6. **AC-4-149 ④ "오프라인 안내 재사용"** — 재사용 대상 문구(`connectivity.offline`)가 `features/storytime-session` 소유라 Home·앱 수준 안내에서 그대로 import 할 수 없다(§18.3).
7. 4b §7.1 "크래시 복구" 행이 `D4-117` 이후 스테일 — Plan §13.4 ① 표에 없다(§18.8).

### 18.11 development-agent 메모 (승인 후)

- `loading` 은 새로 만들지 않는다 — 기존 `submitting`·`isPending` 의 시작을 권한 판정 앞으로 당긴다. 시트가 닫히면 늦게 온 권한 결과를 버린다.
- 마이크 시트: 모드별 `description` 키 분기 1곳 · 자동 표시 플래그(세션 id) · 닫힘 후 Record Control 로 포커스 지정. footer 는 현행(`Not now` 1개) 유지.
- 안내 렌더러는 **상태 파생**(배너) / **보관된 앱 시작 보고 + 구독 시 1회**(Toast). Toast 순차는 안내 계층에서. `ToastProvider`·`InlineAlert`·`Sheet` 변경 0 — 필요해지면 멈추고 보고.
- 날짜 형식화는 `shared/lib` 1곳 + 주입 clock 단위 테스트(연도 경계 · 시간대).
- Visual Gap 대상(최우선 규칙 5): Home 7일 배너 393·320·600 (밀림 실측 · 줄 수) · 오프라인 배너 우선 전환 · 대화 전용 시트(변형 문구 줄 수 320) · `loading` 두 경로 · 48h Toast(action·닫기) · 14일 Toast. 기준은 이 명세(Figma 없음).

---

## 19. 세션 화면 Toast 위치 대안 — `D4-124` (2026-11-04, design-agent) — **종결 (사용자 결정 `D4-128`, 2026-11-04)**

> ⭐ **2026-11-04 사용자 결정 `D4-128`** — 대안 ⓐⓑⓒ 는 채택하지 않았다. **y64 유지 + 세션 화면 문구 전용 Toast 3초 + 겹침 허용(`AD-S4-14`)**. 이 절의 대안 분석은 근거 기록으로 남긴다.

Based on: `D4-121` · `D4-124` · `docs/design/stage-4b-visual-gap-h2r.md` §1.3 (`VG-H2R-03`) · `-h2.md` §1 · `-k1.md` §3.1 · 후속 2·3 · 2차 1 · 측정 산출물 `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vgh2r/impl/results-toast.json` · `results-complete.json` · `…/vgh2/impl/results.json` · 코드 직독 `packages/ui/src/feedback/Toast.css` · `ToastProvider.tsx` · `apps/web/src/features/storytime-session/ui/StorytimeSessionScreen.tsx` · `copy.ts`.

Production Code · Figma 수정 0. **Playwright·dev 서버 실행 0** (`S4-H3` 구현 중) — 이 절의 새 수치는 전부 기존 실측 좌표 + 토큰 산술이다. 표기: `[실측]` = 위 문서·JSON 의 `getBoundingClientRect` 값 · `[계산]` = 그 값과 토큰으로 낸 산술 · `[추정]` = 문구 길이로 줄 수를 가정한 값(Visual Gap 에서 확인할 것).

### 19.1 유지 조건 (`D4-124`)

① 칩 · 닫기 · Record · `Submit` / `Discard` 등 누를 수 있는 요소 가림 0 ② Figma 요소 이동 0 (최우선 규칙 ①) ③ 702 · 628 경계와 ≤627 스크롤 구간(`AD-S4-18`·`22`·`23`) 포함 ④ **Figma 요소(메달리온 등) 겹침 0 이 목표** — 사용자가 y64 의 38~68px 겹침을 수용하지 않았다.

### 19.2 세션 route 에 뜨는 Toast 전수 `[직독: StorytimeSessionScreen.tsx · copy.ts]`

| Toast | 상태 | 높이 393 / 320 | 근거 |
|---|---|---|---|
| 오프라인 · 복구 (`connectivity.*`) | ready · recording · paused | 50 / 68 | `[실측]` h2r §1.3 |
| Web 백그라운드 공지 대체 (`notices.background.toast`) | recording (Web 전용, 슬롯이 안 들어갈 때 — 실기기 웹은 사실상 항상, `VG-H2-01`) | 68 / 86 | `[실측]` h2 §1-5 (y16 시점, 높이는 위치 무관) |
| 닫기 실패 (`closeFailed`, `tone="error"`) | ready (사용자 탭 직후) | 50 / 68 | `[추정]` 49자 ≈ 오프라인 52자 |
| 크래시 복구 (`recovered`, `D4-117`) | 앱 시작 1회 — 세션 route 에서 시작할 때만 | 50 / 68 | `[추정]` 46자 |
| 48h (`Try again` action) · 14일 | ready 만 (recording · paused 는 `D4-120` Q13 로 보류) | 76 / ≥76 | `[계산]` padding 16×2 + `--size-touch-min` 44 |
| 30분 자동 종료 · `Submit` | 완료 화면에서 표시 | — | 세션 화면 아님 (완료 화면 겹침 0 `[실측]`) |

### 19.3 세션 화면 세로 좌표 (Web, safe-area 0)

| 요소 | 393×852 | 393×702 | 393×628 (= ≤627 의 기하) | 320×568 |
|---|---|---|---|---|
| 상단 줄 | 0~48 `[실측]` | 0~48 `[실측]` | 0~48 `[실측]` | 0~48, recording 스크롤 시 −19~29 `[실측]` |
| 메달리온 링 | 76~266 `[실측]` | 76~266 `[실측]` | 76~228 `[실측]` | 76~228 (스크롤 시 57~209) `[실측]` |
| ready 버블 | 271~558.6 `[계산: ring+5, K1 796 bottom 558.6]` | 271~456.6 `[실측 K1]` | 233~418.6 `[실측 K1 664 = 같은 기하]` | 동 628 |
| 책 칩 / 상태 블록 (recording · paused) | 281~321 / 344~455 `[실측]` | 동 `[계산]` | 243~283 / 306~417 `[계산: 228+15, +40+23, +111]` | 동 628 |
| Record | 621~771 `[실측]` | 471~621 `[실측]` | 433~583 `[실측]` | 433~583 (화면에 135 보임) `[실측]` |
| 바 | 789~834 `[실측]` | 639~684 `[실측]` | 583~628 `[실측]` | 583~628 (첫 화면 밖) `[실측]` |
| 완료 화면 링 (비교) | 116 `[실측]` | — | — | 116 `[실측]` |

### 19.4 빈 공간 전수 — Toast(최소 50 높이 × 컬럼 폭)가 들어가는가 `[계산]`

| 후보 자리 | 852 | 702 | 628 · 568 | 판정 |
|---|---|---|---|---|
| 상단 줄 ↔ 링 (48~76) | 28 | 28 | 28 | ❌ 모든 높이에서 50 미만. 1줄 Toast 를 28 로 줄이는 변형도 393 에서 오프라인 문구가 1줄에 안 들어간다 `[추정]` |
| 상단 줄 안 칩 ↔ 닫기 사이 | 폭 192 (320 = 119) × 38 | 동 | 동 | ❌ 문구가 3줄 이상 → 높이 86+ 로 링을 덮는다. ready 는 칩이 없어 폭 307 이지만 2줄 68 → 겹침 |
| 상태 블록 ↔ Record (= 공지 슬롯 자리) | recording 166 · ready 62.4 | 16 · 14.4 | 16 · 14.4 | ⚠️ recording 큰 높이에서만 (§19.5 ⓐ) |
| Record ↔ 바 | 18 | 18 | 0~17 | ❌ |
| 바 아래 | 18 (iOS 는 홈 인디케이터 영역) | 18 | 0 | ❌ |

→ **702 이하에서는 세션 화면 어디에도 Toast 가 Figma 요소와 겹치지 않고 들어갈 빈 공간이 없다.** 실기기 웹 콘텐츠 높이는 대부분 660~760 이다(`VG-H2-01`). 그래서 "위치"만으로는 `D4-124` 를 풀 수 없고, 아래 ⓒ 는 **세션 화면에 띄우는 Toast 수를 줄이는** 안이다.

### 19.5 대안

#### ⓐ 공지 슬롯 자리(상태 블록 ↔ Record) 가운데 + 안 들어가면 y64 로 대체

| | 393×852 | 320×852 | 393×702 | 393×628 · 320×568 |
|---|---|---|---|---|
| recording 오프라인 (50 / 68) | y513~563 · 여백 58 · **겹침 0** | y504~572 · 49 · **0** | 간격 16 < 50 → **y64 대체 → 38** | 대체 → 38 / 56 (스크롤 시 68) |
| recording 공지 대체 (68 / 86) | y504~572 · **0** | y495~581 · **0** | 대체 → 56 | 대체 → 56 / 74 (스크롤 시 93) |
| ready 오프라인 | 간격 62.4 → y564.8~614.8 · 여백 **6.2** (68 이면 5.6 침범 → 대체) | 대체 → 56 | 대체 → 38 | 대체 → 38 / 56 |

- 겹침 0 의 최소 높이 `[계산]` recording = 686 + Toast + 32 → **768 (50) · 786 (68) · 804 (86)**. ready 는 어떤 높이에서도 여백 16 을 만들 수 없다.
- 실기기 웹(660~760)은 **거의 항상 대체 경로** → 지금(y64)과 같다. 큰 높이의 e2e(852)에서만 좋아 보인다 — `VG-H2-01` 과 같은 함정.
- 공지 슬롯과 같은 자리라 `InlineAlert` 가 떠 있으면 Toast 가 들어갈 수 없다 → 우선순위 규칙이 하나 더 생긴다.
- 앱 전역 규칙("Toast 는 상단에서 내려온다", 2026-10-10 결정)과 어긋나 이 화면만 화면 중간에 뜨고, 진입 모션 방향(위 → 아래 12)도 어색해진다.
- 변경 범위: **`packages/ui` `ToastProvider`** — 영역 등록 + 들어가는지 판정 + 대체 + 스크롤(≤627) 중 재측정. Shared UI API 추가 → 별도 승인 (§18.11 "`ToastProvider` 변경 0").

#### ⓑ 상단 줄 아래 간격 16 → 4 (y52)

| Toast 높이 | 393×852 · 702 · 628 (링 76) | 320×568 ready (링 76) | 320×568 recording 스크롤 (링 57) |
|---|---|---|---|
| 50 | **26** (y64 대비 −12) | 26 | 45 |
| 68 | 44 | 44 | 63 |
| 86 | 62 | 62 | 81 |

- 모두 `[계산]` = 52 + 높이 − 링 top. **겹침 0 이 되는 경우 없음** — 줄어들 뿐이다.
- Toast 와 닫기(10~48) 사이가 4 가 된다. Toast 그림자 위쪽 번짐 22 `[실측: R-SHADOW-1 ③ 의 --shadow-glass-rest]` 가 칩 · 닫기 위에 얹힌다(가로챔은 없음 — 그림자는 hit 영역이 아니다). 답답해 보일 수 있다.
- 변경 범위: `packages/ui` — `useToastTopBarInset` 에 간격 옵션 1개. 신규 Tier-3 토큰 후보 `--toast-top-bar-gap-tight: var(--space-1)`. 신규 Primitive 0.

#### ⓒ 세션 route 에서는 Toast 를 줄인다 — 위치 y64(`D4-121`) 그대로 ⭐ 권고

| Toast | 바꾸는 것 | 세션 화면 겹침 |
|---|---|---|
| 오프라인 · 복구 | **세션 route 에서 띄우지 않는다.** 녹음은 로컬로 계속되고(PRD §11 "오프라인" 행 · §13 "녹음 중 네트워크 끊김 → 로컬 저장 지속, 복구 시 자동 업로드" — 둘 다 화면 안내를 요구하지 않는다) 사용자가 할 일이 없다. 나가서 Home 에 가면 기존 오프라인 캐시 배너(`ActivityCardOfflineBanner`, `AD-S4-11`, §18.5)가 상태를 보여 준다 — 표시 조건이 "오프라인 + 캐시 카드" 인지는 Visual Gap 에서 확인 | **0** (모든 높이) |
| 48h · 14일 | `D4-120` Q13 보류 범위를 recording · paused → **세션 route 전체(ready 포함)** 로 넓힌다 | **0** |
| 크래시 복구 | 같은 보류 (세션 route 를 떠난 뒤 1회) | **0** |
| 닫기 실패 (ready) | 그대로 y64 — 사용자가 방금 누른 동작의 결과라 즉시 알려야 한다 | 38 / 56 `[계산 · 높이 추정]` (드묾 · 오류 경로) |
| Web 백그라운드 공지 대체 | 그대로 y64 — 녹음 시작 순간에 알려야 의미가 있다. **Web 전용**(네이티브는 해당 없음) | 56 / 74 (320×568 스크롤 시 93) `[계산]` |

- 남는 겹침은 **두 경로**뿐이다(사용자 탭 직후 오류 · Web 전용 경고). 가장 잦은 오프라인·복구 Toast(실기기에서 지하철·엘리베이터 등으로 반복 가능)가 0 이 된다.
- 대안 ⓒ′ (비권고): 오프라인을 버리지 않고 **완료 화면에서** 띄운다 — `Submit` Toast 와 겹치면 교체되므로 순차(`useToastPresent`, `D4-104`)가 필요하고, 스티커 C-3 이 Toast 2개 뒤로 밀린다(약 8초). 320 에서 오프라인 문구는 2줄 68 이라 완료 화면 링(116)과도 **16 겹친다** `[계산: 64+68−116]`.
- 변경 범위: **세션 feature 만** (`features/storytime-session` 의 connectivity 구독 1곳 제거 · 앱 수준 안내 렌더러의 보류 조건에 ready 추가). `packages/ui` 변경 0 · 신규 토큰 0 · 신규 UI 0.
- 영향: `S4B-Q8`/CP-5 로 채택된 "세션 화면 오프라인 Toast 1회+1회"(§7.1 행)를 철회하는 결정이다 → plan-agent 의 AC 문안 확인 필요. 승인 문구 `connectivity.offline`/`online`(`D4-115`) 은 세션 화면에서 쓰이지 않게 된다 — AC-4-149 ④ 재사용 대상(§18.10-6)이라 파일 자체는 남는다.

### 19.6 공통 비교

| | ⓐ 슬롯 자리 | ⓑ y52 | ⓒ 줄이기 (권고) | 현행 y64 |
|---|---|---|---|---|
| 누를 수 있는 요소 가림 | 0 (대체 경로 포함) | 0 | 0 | 0 |
| Figma 요소 이동 | 0 | 0 | 0 | 0 |
| 메달리온 겹침 — 실기기 웹 높이(≤760) | 38~93 (대체) | 26~81 | **오프라인·복구·48h·14일·복구 0** / 잔여 2경로 38~93 | 38~93 |
| 스크린리더 | Toast `role=status` 그대로 — 위치와 무관 | 동 | 세션 중 연결 변화 알림이 **시각·스크린리더 모두** 사라진다(같은 정보 유지). 잔여 2경로는 그대로(닫기 실패 = `assertive`) | — |
| 완료 화면 · Home 일관성 | ❌ 이 화면만 중간 배치 | ⚠️ 이 화면만 간격 4 | ✅ 위치 규칙 `D4-103`/`D4-121` 동일 | ✅ |
| 공지 슬롯(`VG-H2-01`) | 같은 자리 경합 → 규칙 추가 | 무관 | 무관 (대체 Toast 는 잔여로 남음) | 무관 |
| 변경 범위 | `packages/ui` API (승인 필요) | `packages/ui` 옵션 + 토큰 후보 1 | feature 만 | — |

### 19.7 권고

**ⓒ** — 702 이하에는 겹치지 않는 빈 공간이 없다는 것이 §19.4 산술의 결론이고, ⓐ · ⓑ 는 실기기 높이에서 겹침을 없애지 못한다. ⓒ 는 위치 규칙과 Shared UI 를 건드리지 않고 겹침이 나는 **빈도**를 잔여 2경로로 줄인다. 녹음 중 개입 0(PRD §7.5) · `D4-120` Q13 의 방향과 같다. 잔여 2경로를 더 줄이고 싶으면 ⓑ 를 그 둘에만 더할 수 있다(−12, `packages/ui` 변경 동반).

신규 토큰: ⓒ 0. ⓑ 를 더할 때만 후보 `--toast-top-bar-gap-tight: var(--space-1)` (Tier-3).

### 19.8 사용자 결정 질문

| # | 질문 | 권고 |
|---|---|---|
| 1 | 세션 Toast 위치 대안 ⓐ / ⓑ / ⓒ / 현행 중 무엇으로 할지 | ⓒ |
| 2 | (ⓒ 일 때) 세션 화면의 오프라인 · 복구 안내를 없애는 것 — 연결 상태는 Home 오프라인 배너에서만 보인다 (ⓒ′ 완료 화면 표시는 비권고) | 없앤다 |
| 3 | (ⓒ 일 때) `D4-120` Q13 보류 범위를 ready 를 포함한 세션 route 전체로 넓히고, 크래시 복구 Toast 도 같은 보류를 따르는 것 | 넓힌다 |
| 4 | (ⓒ 일 때) 잔여 2경로 — 닫기 실패(ready) · Web 백그라운드 공지 대체 — 의 y64 겹침(38~93, 4초)을 수용할지, ⓑ 를 그 둘에만 더할지 | 수용 (빈도 낮음 · 사용자 조작 직후/Web 전용). 수용 시 `AD-S4-14` 에 두 경로와 수치를 명기 |

### 19.9 Visual Gap 에서 확인할 것 (이번에 측정하지 않음)

- `closeFailed` · `recovered` Toast 의 실제 높이(393 / 320) — §19.2 `[추정]` 값 확인.
- (ⓒ 채택 시) 393×852 · 393×702 · 393×628 · 320×568 에서 `context.setOffline(true/false)` → 세션 화면 Toast 0 · 이동 0 · 이후 Home 이동 시 오프라인 배너 표시.
- (ⓒ 채택 시) ready 에서 48h · 14일 · 크래시 복구 신호 → 세션 화면 0 → 닫기로 Home 이동 후 순차 1회(`S4B-Q14` 순서).
- 잔여 2경로의 y64 Toast — 칩 · 닫기 `elementFromPoint` 가림 0 재확인 · 링 겹침 실측(§19.5 ⓒ 표의 `[계산]` 대조).
- (ⓑ 를 더할 때) Toast 그림자 위쪽 번짐이 칩 · 닫기 위에 얹히는 모습 캡처 + 가로챔 0.

---

## 20. Prompt Drawer 닫힘 모션 — `D4-137` (2026-11-04, design-agent) — APPROVED (2026-11-04, user — `D4-138`) (§20.9 → `D4-138`)

근거: `docs/decisions/stage-4-approvals.md` `D4-137` (사용자 지시 *"부드러운 효과로 적용해서 코딩해줘"*) · Gap `VG-G2-10` (`stage-4b-visual-gap-g2.md` §3 · `-final.md` §4/§7-2) · 인계 ⑬. **Figma 에 모션 정의 없음** — Reactions 는 MCP 로 노출되지 않고 `88:960` 은 미배치 컴포넌트다(2026-11-04 재조회, `-final.md` §11). C-13 성격이며 `D4-137` 로 명세가 승인되었다. 새 값은 만들지 않고 **기존 motion 토큰 + 기존 시트 모션과 대칭**으로만 정한다 (`D4-3` CSS 모션 · 라이브러리 0).

### 20.1 현행 (직독 — 2026-11-04)

| 항목 | 현행 | 근거 |
|---|---|---|
| 열림 | `haru-sheet-in` `translateY(100%) → 0` · `--motion-duration-base`(240ms) · `--motion-ease-standard` · scrim `haru-scrim-in` opacity 0→1 같은 길이·곡선 | `packages/ui/src/sheet/Sheet.css` · `Scrim.css` |
| 닫힘 | `.haru-sheet--closing` → `haru-sheet-out` `0 → translateY(100%)` · base · standard · scrim `haru-scrim-out` 1→0 · `usePresence(open, MOTION_DURATION_MS.base)` 가 240ms 뒤 언마운트 | `Sheet.tsx` · `hooks/usePresence.ts` |
| reduce | 열림·닫힘 모두 **opacity 만**(같은 길이), transform 제거 · 면 색 전환 off | `Sheet.css` reduce 블록 (Stage 1 Spec §9.2) |
| 닫힘 중 상호작용 | 시트는 `role=dialog` **`aria-modal="true"` 그대로**, scrim 이 탭을 받는다(`onClose` 재호출 — 무해), 시트 내부 버튼은 240ms 동안 눌린다 | `Sheet.tsx` (state 와 무관하게 같은 속성) |
| 포커스 복귀 | **닫힘 시작 커밋 시점**에 trap cleanup → 부모 effect 가 **Prompts 칩**으로 덮어쓴다 (AC-4-137 ③) | `useFocusTrap.ts` cleanup · `SessionPromptsPopover.tsx` `returnFocus` |

**결함의 정체 (`VG-G2-10`)** `[계산]`: `floating` 은 뷰포트 바닥에서 `--sheet-floating-inset-block-end`(24 + safe-area) 떠 있다. `translateY(100%)` 는 **자기 높이만큼만** 내려가므로 393×852 · 높이 329 에서 끝 위치 top = 852 − 24 − 329 + 329 = **828** → 카드 **위 24px 띠(+ radius 28 모서리 · blur 면 · 그림자)** 가 화면에 남은 채 애니메이션이 끝나고, 언마운트 프레임에 **한 번에 사라진다**. `--motion-ease-standard` 는 감속 곡선이라 띠가 끝 위치 근처에 머무는 시간이 길어 "멈췄다가 툭 사라짐" 으로 보인다. 같은 띠가 열림 첫 프레임에도 있다(§20.9 Q2).

### 20.2 명세 — 닫힘 (no-preference)

| 항목 | 값 |
|---|---|
| 속성 | 시트 `transform` 만: `translateY(0)` → **`translateY(calc(100% + var(--sheet-floating-inset-block-end)))`** — 카드가 **뷰포트 아래로 완전히** 나간다. opacity 는 바꾸지 않는다(열림과 대칭 — 열림도 transform 만) |
| scrim | 현행 `haru-scrim-out` 그대로 (opacity 1→0) — 시트와 **같은 시작 · 같은 길이 · 같은 곡선** |
| duration | **`--motion-duration-base`** (240ms) — 열림과 같다. 언마운트 타이머 `MOTION_DURATION_MS.base` 와 같아야 한다 |
| easing | **`--motion-ease-standard`** — 열림과 같다 |
| 끝 상태 고정 | `.haru-sheet--closing` 의 **정적 `transform` 도 같은 끝 값**이어야 한다. 애니메이션 끝 ↔ 타이머 언마운트 사이 프레임에서 정적 값(현행 `100%`)으로 **되튀면 띠가 다시 보인다** |
| 새 값 | **0** — 이동 거리는 기존 토큰 `--sheet-floating-inset-block-end` 를 참조한다 |

구현 방식(권고, 메커니즘만): `Sheet.css` 에 **로컬 custom property 1개**(예: `--haru-sheet-exit-extra`, 기본 `0px`)를 두고 `haru-sheet-out` 끝 값과 `.haru-sheet--closing` 정적 값을 `calc(100% + var(--haru-sheet-exit-extra))` 로 쓴다. `.haru-sheet--floating` 만 `--haru-sheet-exit-extra: var(--sheet-floating-inset-block-end)` 를 준다. → `bottom` · `full` · `inset-card` 는 `100% + 0` = **현행과 계산값 동일**. 새 `@keyframes` 이름을 만들지 않으므로 `stage4-motion-guards.test.ts` `EXPECTED` 표 변경 0.

잔여 그림자 `[계산, 실측 필요]`: 카드 top 이 뷰포트 바닥에 닿은 순간에도 `--shadow-glass-rest` 위쪽 번짐(최대 28 — `stage-4-session-figma-audit.md` §4.2)이 바닥 가장자리에 남는다. 이 시점은 scrim 도 거의 0 이고 알파가 가장자리에서 0 으로 수렴하므로 보이지 않을 것으로 **추정**한다 — `R-SHADOW-1` ③ 에 따라 **픽셀 프로브로 확인**한다(§20.8 ③). 기준을 넘으면 그때만 §20.9 Q3 대안으로 간다. 이동 거리에 그림자 여유를 더하는 값은 미리 넣지 않는다.

### 20.3 명세 — 닫힘 (`prefers-reduced-motion: reduce`)

**현행 유지** — transform 없음, 시트 opacity 1→0 · scrim 1→0, `--motion-duration-base` · `--motion-ease-standard`. reduce 블록의 `.haru-sheet--closing { transform: none }` 이 §20.2 의 끝 값을 덮어써야 한다(이동 0). 변경 0.

### 20.4 닫힘 중 포커스 · 상호작용

| 항목 | 명세 | 현행 대비 |
|---|---|---|
| 포커스 복귀 시점 | **닫힘 시작**(= `open` false 커밋) — 240ms 를 기다리지 않는다. 대상 = **Prompts 칩** (AC-4-137 ③ 그대로). 사라지는 시트 안에 포커스를 240ms 남기지 않기 위해서다 | 변경 0 |
| 시트 내부 조작 | 닫힘 중(`haru-sheet--closing`) 시트에 **`inert`** — 캐러셀 화살표·스와이프·Tab 진입 0 | **변경** |
| 모달 표시 | 닫힘 중 **`aria-modal` 제거**(또는 `inert` 로 접근성 트리에서 빠짐). 현행은 240ms 동안 `[aria-modal="true"]` 가 남아 팝업의 `modalOpen()` 이 `Escape` 를 양보하고, 보조기술이 칩을 모달 바깥으로 본다 | **변경** |
| scrim 탭 | 닫힘 중에도 scrim 은 **탭을 계속 흡수**하되 `onClose` 를 다시 부르지 않는다. 통과시키지 않는 이유: 세션 화면에서 scrim 바로 아래가 **Record Control · Submit**이다 — 닫으려고 연속 탭한 두 번째 탭이 녹음 일시정지/제출로 새면 안 된다 (`D4-53` 녹음 상태 불변) | scrim 흡수 유지 · 재호출만 막음 |
| 녹음 상태 | 무관 — 닫힘 모션은 전이·녹음 API 를 모른다 (`D4-53`, AC-4-130) | 변경 0 |
| 강제 닫힘 | 세션이 `live` 가 아니게 되어 닫힐 때도 같은 모션. route 가 바뀌어 화면째 언마운트되면 모션 없이 사라진다(현행과 같음) | 변경 0 |

### 20.5 범위 — 공유 `Sheet` vs Drawer 전용

`Sheet` 사용처(직독 2026-11-04): `SessionPromptsDrawer`(`floating`) · `MicPermissionSheet`(`bottom`) · `ReadingContextSheet`(variant 미지정 = `bottom`) · `SelectTrigger` 선택 시트(`bottom` — 온보딩) · `LibraryShelfSheet` · `BookDetailSheet`(`inset-card`) · dev gallery.

| 변경 | 위치 | 번지는 화면 | 권고 |
|---|---|---|---|
| ① 닫힘 이동 거리 + 끝 상태 | `Sheet.css`, **`floating` 에만 값** | **Prompt Drawer 만**. 다른 variant 계산값 동일 | **이번 범위** |
| ② 닫힘 중 `inert` · `aria-modal` 제거 · scrim 재호출 방지 | `Sheet.tsx` / `Scrim.tsx` (공유) | **모든 시트**(마이크 권한 · Reading Context · 온보딩 선택 · Library 2종). 시각 변화 0, 닫힘 240ms 동안의 조작 가능성만 바뀐다 | 공유로 넣는 것을 권고(variant 별로 다를 이유가 없다) — **다른 화면에 번지므로 §20.9 Q1 승인 필요**. 미승인이면 Drawer 에서만 필요한 처리는 ① 만 하고 ② 는 보류 |
| (참고) `inset-card` 의 같은 띠 | Library 2종 — 14 + safe-area 띠가 같은 방식으로 남는다(`VG-G2-10` 원문 "inset-card 와 같은 동작") | Library · Book Detail | **이번 범위 아님**(Stage 3 승인 화면). 원하면 ① 의 같은 변수로 한 줄 — §20.9 Q4 |

### 20.6 토큰

| 용도 | 토큰 | 비고 |
|---|---|---|
| duration | `--motion-duration-base` (240ms) · JS `MOTION_DURATION_MS.base` | 기존 · 열림과 같음 |
| easing | `--motion-ease-standard` | 기존 · 열림과 같음 |
| 이동 거리 추가분 | `--sheet-floating-inset-block-end` (`--layout-gutter` + `--layout-safe-bottom`) | 기존 |
| scrim | `--color-scrim` · `haru-scrim-out` | 기존 |

**신규 토큰 0.** 후보로만 기록(도입 비권고): `--motion-ease-exit`(가속 곡선) — 퇴장에 흔히 쓰지만 Figma·기존 토큰에 근거가 없어 값을 지어내야 한다. §20.2 로 띠가 화면 밖에서 끝나면 감속 곡선의 "머무름"은 보이지 않으므로 필요 없다.

### 20.7 접근성

- 상태를 모션만으로 전달하지 않는다 — 닫힘은 포커스 이동(칩)과 칩 `aria-expanded` 로 전달된다(현행 · Stage 1 Spec §9.1 규칙 4).
- 무음 · 무진동 유지. 깜빡임 0.
- reduce 에서는 이동 0 (§20.3).

### 20.8 검증 기준 (development-agent 자체 확인 · 이후 Visual Gap — 측정 방법을 적을 것, `R-FIGMA-1` ⑤)

1. **끝 위치**: 393×852 · 320×568 · 1024×768 · safe-area 0 에서 닫힘 애니메이션 마지막 프레임과 언마운트 직전 프레임의 시트 `getBoundingClientRect().top ≥ innerHeight` (rAF 샘플링). 정적 값 되튐 0.
2. **다른 variant 불변**: `bottom` · `inset-card` 닫힘 끝 computed transform = 현행(`translateY(100%)` 의 matrix 값). 시각 baseline **재생성 0** (`--update-snapshots` 불필요해야 정상 — 필요하면 `R-BASELINE-1` ⑤ 분해 후 멈춤).
3. **언마운트 프레임**: 언마운트 직전·직후 두 프레임의 하단 120px 띠 diff 가 채널당 5.3 이하(`VISUAL_THRESHOLD_FRAME` 0.02 과 같은 기준) — 그림자 잔여(§20.2) 실측. 넘으면 수치와 함께 보고(§20.9 Q3).
4. **reduce**: 닫힘 전 과정 transform 변화 0, opacity 1→0.
5. **포커스**: 닫힘 시작 프레임에 `document.activeElement` = Prompts 칩 (AC-4-137 ③ 기존 테스트 통과).
6. (② 승인 시) 닫힘 중: 시트 `inert` · `[aria-modal="true"]` 0 · 시트 화살표 클릭 무반응 · scrim 두 번째 탭에서 `onClose` 호출 1회 · Record Control 상태 불변 · 팝업 `Escape` 양보 0.
7. `stage4-motion-guards.test.ts` 통과(새 keyframes 0 · reduce 대체 1:1 유지).

### 20.9 사용자 결정 필요

| # | 질문 | 권고 |
|---|---|---|
| Q1 | §20.5 ② (닫힘 중 `inert` · `aria-modal` 제거 · scrim 재호출 방지)를 **공유 `Sheet`** 에 넣어 모든 시트(마이크 권한 · Reading Context · 온보딩 선택 · Library 2종)에 적용할지 | 공유 적용 (시각 변화 0) |
| Q2 | 열림도 같은 거리(`100% + inset`)에서 시작하게 할지 — 현행 열림 첫 프레임에도 24px 띠가 먼저 나타난다. `D4-137` 은 닫힘만 지시했다 | 이번엔 닫힘만(지시 범위). 원하면 같은 변수로 열림 keyframes 시작값만 바꾸면 된다 |
| Q3 | (§20.8 ③ 이 기준을 넘을 때만) 그림자 잔여 처리 — ⓐ 이동 거리에 그림자 위쪽 번짐을 더함(Tier-3 토큰 후보 `--sheet-floating-exit-shadow-reach`) ⓑ 닫힘에 opacity 를 함께 줌(열림과 비대칭) | 측정 후 결정 — 미리 넣지 않음 |
| Q4 | Library `inset-card` 2종에도 같은 처리를 할지 (Stage 3 화면 동작 변경) | 이번 범위 밖 · 별도 지시 시 |

---

## 21. ⭐ `S4-H4` 명세 — 4b QA 1회차 후속 (2026-11-06, design-agent) — APPROVED (2026-11-07, user — `D4-146`) (`D4-145` 승인 범위 안)

근거: Plan rev 1.6 §13.5 · §14 (AC-4-35·36 화면 부분 · AC-4-99 ③ · AC-4-154~156) · §18 항목 6 · 결정 `D4-140`~`D4-145` (CP-15 ⓐ · NB-16 · NB-17 · NB-18) · QA `QA-4B-001`·`002`·`004` · `VG-K1S-04`.
**Figma**: 이 단위의 대상(오류 안내 · 이동 · 스크롤바)은 Figma 에 정의가 없다. 새 화면·새 요소를 만들지 않으므로 Figma 를 다시 조회하지 않았다. 측정은 모두 **현재 작업 트리**(커밋 안 된 변경 포함)를 dev 서버(포트 4319, 단독 실행, 끝난 뒤 종료)에 띄우고 Playwright 프로브로 했다. 5173·5174 는 건드리지 않았다. 프로브 스크립트는 저장소 밖(scratchpad)에 있다.

### 21.0 결론 — 새 UI 필요 없음

| 항목 | 판정 | 근거 |
|---|---|---|
| ① `ready` 복귀 | 새 UI **0** | 기존 ready 화면(`/session/:id`)이 복귀 지점이다 (CP-15 ⓐ) |
| ① `recording`/`paused` 안내 | 새 요소 **0** — 두 경로 모두 **기존 오류 표시 자리**에 들어간다 (§21.1). 단 **서재 경로의 Toast 는 문구 1줄짜리**라 기존 두 줄(제목·설명)을 어떻게 담을지 정해야 한다 → §21.6 Q1 | 실측 §21.1 |
| ② 온보딩 이동 | 새 UI **0** — 기존 Route Guard 이동 · 어긋날 때는 ①과 같은 자리에 기존 `ONBOARDING_INCOMPLETE` 문구 | §21.2 |
| ③ 스크롤바 | 시각 요소 추가 0 — `AppColumn` 최소 폭 규칙 1곳을 고친다. **320 + 클래식 스크롤바에서만** 컬럼이 305 가 된다(시각 변화 있음 → §21.6 Q3) | §21.3 |
| ⑤ 측정판 | dev 전용. **Production UI 영향 0** | §21.4 |

**C-13 항목 0** (새 화면·새 요소 없음). Figma 에 있는 요소를 빼는 것도 없다.

### 21.1 `SESSION_ALREADY_ACTIVE` (`recording`/`paused`) 안내 — 기존 자리에 들어가는가

**두 경로의 기존 오류 표시 자리는 서로 다르다** `[직독]`:

| 경로 | 기존 자리 | 지금 문구 | 컴포넌트가 받는 값 |
|---|---|---|---|
| Home Activity Card → Reading Context 시트 | 시트 안 `InlineAlert tone="error"`, 선택지 아래 (`ReadingContextSheet.tsx:154`) | `startFailed` 제목만 | `title` + **`description`(있음, 지금 안 씀)** |
| 서재 `BookDetailSheet` → `Start Session` | **Toast** `tone="error"`, 시트는 그대로 (`StartSessionAction.tsx:52`) | `startFailed` 1줄 | **`message` 하나뿐** (제목·설명 구분 없음) |

문구 (NB-18, 기존 그대로 — `shared/copy/error-copy.ts:76`): 제목 `A storytime is already open` / 설명 *"Continue the open storytime, or finish it before starting a new one."*

**실측 — Activity 시트 `InlineAlert`** (`sessions:session-already-active` 로 실제 실패 상태를 만든 뒤, 같은 Alert 에 제목·설명을 넣어 높이를 잼):

| 뷰포트 | 지금 (`startFailed` 제목만) | 이미 열린 세션 안내 (제목 + 설명) | 시트 | `Continue` 버튼 |
|---|---|---|---|---|
| 393×852 | 74 (2줄) | **94** (제목 1 · 설명 2) | 위로 20 커짐 (top 303 → 283) | 보임 · 위치 그대로 (bottom 828) |
| 320×852 | 74 (2줄) | **94** (1 · 2) | 위로 20 커짐 | 그대로 |
| 393×600 | 74 · 시트 안 스크롤 없음 | 94 · 시트 내용 스크롤 1px 생김 (414/413) | 최대 높이에 닿음 | 그대로 |
| **320×568** | 74 중 **61 보임** (아래 여백 13 이 footer 아래로 감 — **원래 있던 현상**) | 94 중 **61 보임** → 제목 + 설명 첫 줄만 보이고 **설명 둘째 줄은 스크롤해야 보인다** | 최대 높이(top 32) | 그대로 |

- 넣기: Alert 가 시트 안에서 아래로 늘어난다. 다른 요소를 밀어 올리거나 가리지 않으며 가로 넘침도 없다. 이 시트는 이미 스크롤되는 시트라 새 레이아웃 규칙이 필요 없다.
- 320×568 에서 둘째 줄이 화면 밖에 남는 것은 **이 시트에 원래 있던 성질**(지금 문구도 아래 여백이 잘린다)이다. `role="alert"` 라 스크린리더는 전체를 읽는다. 처리 방식은 §21.6 Q2.

**실측 — 서재 Toast** (실제 실패 Toast 의 글자만 바꿔서 잼, Toast 폭 = 컬럼 − 2×gutter):

| 넣는 문구 | 320×568 | 393×852 |
|---|---|---|
| 지금 `startFailed` | 2줄 · 68 | 1줄 · 50 |
| 제목만 | 1줄 · 50 | 1줄 · 50 |
| 설명만 | 2줄 · 68 | 2줄 · 68 |
| 제목 + `. ` + 설명 | **3줄 · 86** | 2줄 · 68 |

- 320×568 에서는 Toast(top 56)가 inset-card 시트 위쪽(top 40)과 **원래부터 겹친다**(지금 문구도 그렇다 — z-toast 가 위). 새로 생기는 현상이 아니다. 393 에서는 겹치지 않는다(시트 top 278).
- Toast 는 4~6초 뒤 사라지는 자리다. Stage 1 Spec §5.5(*"오류를 Toast 로만 알리지 않는다"*)와 원래 어긋나 있던 자리이며, 이번 단위에서 바꾸지 않는다(바꾸면 서재 시트에 새 요소가 생긴다 → C-13). 기록만 남긴다.
- Toast 에 제목 칸을 새로 만드는 것은 **새 변형**이므로 하지 않는다. 기존 `message` 한 칸에 어떤 글을 넣을지만 정한다 → §21.6 Q1.

**`ONBOARDING_INCOMPLETE` 어긋남 안내**(§21.2 ③ — 다시 받은 `me` 가 여전히 `completed` 일 때)도 같은 두 자리를 쓴다. 기존 문구 `A few setup steps are left` / *"Finish setting up the profile to continue."* 실측: Alert 393 = 76(1·1) · 320 = 94(1·2) / Toast `제목. 설명` 320 = 2줄, 393 = 2줄. 위 표의 경계 안이다.

**상태별 표시 (두 경로 같음)**:

| 상황 | Activity 시트 | 서재 | 이동 |
|---|---|---|---|
| 409 → Detail `ready` | 오류 표시 0 · 버튼 `loading` 유지 → 이동 | 같음 | `/session/:id` (§21.2) |
| 409 → Detail `recording`/`paused` | `InlineAlert error` = `SESSION_ALREADY_ACTIVE` 제목 + 설명 · 선택은 그대로 둔다(기존 실패 규칙) | Toast `error` = Q1 결정 문구 | 0 |
| 409 → Detail 조회 실패 (AC-4-35 ④) | 기존 `startFailed` 를 같은 자리에 (새 문구 없음 — 기존 일반 실패 문구가 "다시 시도해 주세요" 의미와 맞는다) | 기존 `startFailed` Toast | 0 |
| 다시 탭 (⑤) | 같은 결과 · `loading` 동안 재탭 무시(기존 `launching` 규칙) | 같음 | — |

⚠️ AC-4-35 ④ 문언은 *"Detail 조회 실패 → **전용 문구**"* 다. 기존에 맞는 전용 문구가 없으므로 위 표는 **기존 `startFailed` 를 그대로 쓰는 것**으로 명세했다. 새 문구가 필요하면 NB-18 범위 밖이므로 → §21.6 Q4.

### 21.2 이동 중 과도기 프레임 기준 (`ready` 복귀 · 온보딩 이동)

**기준: 일반 시작 성공 경로와 같은 프레임 순서를 지키고, 그보다 늘어나는 프레임이 없어야 한다.**

일반 성공 경로 `[직독]`: 탭 → 버튼 `loading`(`launching`, `D4-125`) → 생성 응답 → `navigate(sessionPath)` → Home 언마운트(시트는 모션 없이 화면째 사라짐 — §20.4 "강제 닫힘"과 같음) → 세션 화면 `detail.isPending` Spinner → ready.

| # | 기준 | 위반 예 |
|---|---|---|
| T1 | 탭부터 화면 이동(또는 안내 표시)까지 **버튼 `loading` 이 끊기지 않는다** — 409 수신 · Detail 조회 · `me` 다시 받기 동안 모두 | 409 와 Detail 조회 사이에 버튼이 한 프레임 보통 상태로 돌아옴 |
| T2 | 이동하는 경우 **오류 표시가 한 프레임도 나오지 않는다** (`startFailed` Alert · Toast 0) | 409 를 먼저 일반 실패로 그렸다가 이동 |
| T3 | 시트 닫힘 모션을 따로 돌리지 않는다 — 일반 경로처럼 route 변경으로 화면째 사라진다. 시트를 먼저 닫고 이동하면 **Home 이 잠깐 보이는 프레임**이 생기므로 금지 | 시트 닫기 → 240ms → 이동 |
| T4 | `ready` 복귀: 세션 화면 진입 후 프레임은 일반 경로와 같다(Spinner 가 나오면 일반 경로와 같은 길이). 권고(필수 아님): 시작 쪽에서 이미 받은 Detail 을 `sessionKeys.detail(id)` 캐시에 넣어 Spinner 프레임을 줄인다 — 넣는다면 일반 경로와 다르게 보이는 것은 "더 빠름" 한 가지뿐이어야 한다 | 세션 화면이 `SessionLoadError` 를 한 번 그림 |
| T5 | 온보딩 이동: `me` 는 **이전 값을 유지한 채 다시 받는다**(invalidate·refetch). `resetQueries`/`removeQueries` 처럼 `me` 가 `undefined` 가 되면 `RouteGuard` 가 **전체 화면 Spinner**(`RouteGuard.tsx:41`)를 그리므로 금지 | 시트 → 빈 화면 Spinner → 온보딩 |
| T6 | 온보딩 화면 도착은 Guard 의 `Navigate replace`(기존)로만 한다. 이 단위에서 별도 `navigate` 를 부르지 않는다 (NB-16, 이동 규칙은 한 곳에서만) | — |
| T7 | `prefers-reduced-motion` 과 무관 — 새 모션 0 | — |

검증 방법(구현 후 Visual Gap): 탭부터 도착까지 rAF 마다 `[role=alert]` 수 · `.haru-toast` 수 · 버튼 `aria-busy` · `location.pathname` · `main` 존재를 기록하고, 위 T1~T5 를 위반하는 프레임이 0 인지 본다(`sessions:session-already-active-ready` · `sessions:onboarding-incomplete`, 경로 2개).

📝 plan-agent 확인 필요 (시각 영향 0, 기록만): AC-4-35 ③ 은 `ready` 복귀를 `replace` 로 적었고, 일반 시작 성공은 **push**(`navigate(sessionPath(id))`)다. 두 경로의 브라우저 뒤로가기 결과가 달라진다(복귀한 세션에서 뒤로가기 → Home 이 아니라 그 앞 기록). 의도된 차이인지 Plan 에서 확인한다.

### 21.3 클래식 스크롤바 가로 넘침 (`QA-4B-004`, NB-17)

**원인 위치** (computed 로 확인 — CSS 파일 grep 만으로 판단하지 않음, `R-FIGMA-1` ④):

- `packages/ui/src/layout/AppColumn.css:9` `.haru-app-column { min-inline-size: var(--layout-min-width) }` (= 320px).
- 스크롤 박스(`[data-app-shell-viewport]`, Tailwind `overflow-y-auto`) 안의 폭은 **창 폭 − 스크롤바(15)** 다. 창이 320 이면 305 인데 컬럼이 320 을 고집해 **15 넘친다**.
- 넘치는 요소는 이 컬럼 **1개**뿐이다. `vw` 를 쓰는 규칙은 없다(`activity-card-deck.css:5·45` 의 `100vw` 는 주석이고, 실제 값은 `100% + 2×gutter`). 같은 규칙의 Tailwind 유틸리티 `app-column`·`min-w-app`(`design-tokens/src/utilities.css:113·125`)도 같은 성질이다 — 화면에서 쓰는지는 development-agent 가 확인한다.
- 시험(프로브에서 스타일만 바꿔 봄): `min-inline-size: 0` → 320×568 넘침 15 → **0**, 컬럼 305, 컬럼 중심 = `clientWidth` 중심(152.5).

**수정 방향 (NB-17 ⓐ)**: 컬럼의 최소 폭을 **스크롤 박스 폭보다 커지지 않게** 한다 — 예: `min-inline-size: min(var(--layout-min-width), 100%)`. 새 토큰 0. 스크롤바는 그대로 보인다. `scrollbar-gutter`·스크롤바 숨김은 쓰지 않는다(ⓑ·ⓒ 미채택).

**시각 영향**:

| 조건 | 수정 전 | 수정 후 |
|---|---|---|
| 오버레이 스크롤바 (iOS·Android·macOS 기본) | 넘침 0 | **변화 0** (모든 크기에서 같은 값 실측) |
| 클래식 · 창 ≥ 335 | 넘침 0 · 컬럼 중심 = `clientWidth`/2 (창 중심보다 −7.5) | **변화 0** — 이 −7.5 는 스크롤바가 차지한 폭이다. 가운데 기준 = `clientWidth` (NB-17) |
| 클래식 · 창 320 · 세로 스크롤 있음 | 넘침 15 · 컬럼 320 · 가로 스크롤 생김 | 넘침 0 · **컬럼 305** · 내용 폭 272 → **257** (−15) |
| 클래식 · 창 320 · 세로 스크롤 없음 | 넘침 0 | 변화 0 |

320 + 클래식에서 내용 폭 257 은 `--layout-min-width`(320) 가 지키려던 최소 폭보다 좁다. 실측으로는 Welcome · Home · Library · 세션 ready 에서 **글자 잘림 0**(보이는 텍스트 요소의 `scrollWidth > clientWidth` 0 — 숨김 텍스트 제외) · Record Control 중심 153(= 컬럼 중심) · 팝업 `min(329px, 100%)` · pill 240 모두 들어간다. 이 좁아짐을 허용할지는 → §21.6 Q3.

**넘침 측정 매트릭스 (수정 전, 실측)** — 스크롤 박스 `scrollWidth − clientWidth`:

| 창 크기 | 스크롤바 | Welcome | Home | Library | 세션 ready |
|---|---|---|---|---|---|
| 320×568 | 클래식 | **15** | **15** | **15** | **15** |
| 320×852 | 클래식 | 0 (스크롤 없음) | 0 (스크롤 없음) | **15** (Library 는 항상 스크롤) | 0 |
| 393×600 · 393×852 · 600×600 · 1024×500 | 클래식 | 0 | 0 | 0 | 0 |
| 모든 크기 | 오버레이 | 0 | 0 | 0 | 0 |

→ 영향 범위는 **세션 화면만이 아니라 Stage 1~3 탭 화면(Home · Library)과 온보딩 앞 화면(Welcome) 전부**다(같은 `AppShell`·`AppColumn`). 320 에 세로 스크롤이 생기는 모든 화면이 해당된다. 수정 뒤 320×568 Welcome · Home · Library · 세션 ready 와 1024×500 세 화면 모두 넘침 0 을 확인했다(프로브).

**수정 후 Visual Gap 매트릭스 (development-agent 구현 후 design-agent 가 잼)**:

- 크기: 320×568 · 320×852 · 393×600 · 393×852 · 600×600(또는 600×800) · 1024×500 · 1024×768
- 스크롤바: 오버레이(Playwright 기본) · 클래식(`--hide-scrollbars` 제외 launch)
- 화면: Welcome(온보딩 앞 1화면) · Home · Library · 세션 ready · 세션 recording · 완료 화면
- 잴 것: ① `scrollWidth ≤ clientWidth` ② 컬럼 중심 = `clientWidth`/2 (±0.5) ③ 컬럼 폭 = `min(clientWidth, 480)` ④ 보이는 텍스트 잘림 0 ⑤ **그림자 세로·가로 프로브**(`R-SHADOW-1` ⑥ — 컬럼 폭이 바뀌면 카드·시트 그림자가 스크롤 박스 끝에 닿는 위치도 바뀐다) ⑥ 오버레이 조건의 시각 baseline **재생성 0** — 바뀌면 `R-BASELINE-1` ⑤ 대로 원인별로 쪼개 보고하고 멈춘다
- 확인할 것 (미확정): 320 + 클래식 + 수정 후 Home 캐릭터 버블 보조 줄 오른쪽 끝이 버블 끝에 거의 닿아 보였다(스크린샷). 잘림 프로브에서는 넘침이 잡히지 않았다 — 구현 후 픽셀로 다시 본다
- 범위: `AD-S4-23`(627 이하 세로 스크롤)은 **세로 축** 허용 차이다. 이번 가로 넘침은 그 범위가 **아니다**(별개 결함 — 그래서 FAIL 이었다). 수정 뒤 `AD-S4-23` 문언 변경 0.

### 21.4 측정판 (`/__dev/ui/recording-measure`, AC-4-154·155)

- dev 전용 route(`app/router.tsx:52` `import.meta.env.DEV` 삼항 → Production 빌드에서 사라짐) · `assert:no-mocks` 가 보증. **Production UI 영향 0. Visual Gap 대상 아님.**
- 표시 형식은 dev 도구라 Design System 대상에서 빠지지만, 기존 측정판의 표·버튼 구성을 그대로 따른다(새 Shared UI 0). 사용자가 실기기(320~393 폭)에서 읽으므로 **표가 가로로 넘치지 않을 것**(ms 값 · 중위값 · 브라우저/`mimeType`/timeslice 줄바꿈 허용)만 기준으로 둔다.
- `getUserMedia` 감싸기 · 원복은 Plan §13.5-⑤ 그대로다 — 디자인 결정 사항 없음.

### 21.5 토큰 · 접근성

- 신규 토큰 **0**. 사용: `InlineAlert` `--color-status-error-*`(P-04 가값 그대로) · Toast 기존 · `--layout-min-width` · `--layout-app-max-width`.
- 접근성: Activity 안내 `role="alert"`(기존) · 서재 Toast `aria-live="assertive"`(기존 `error` tone). 이동할 때는 알림 0(T2). 포커스: 안내가 나올 때 포커스는 `Continue`/`Start Session` 에 그대로 둔다(기존 실패 규칙). 온보딩 도착 후 포커스는 Stage 2 Guard 이동과 같다.
- 스크롤바는 보이게 둔다(NB-17) — 데스크톱에서 스크롤 위치 표시가 유지된다.

### 21.6 사용자 결정 필요

| # | 질문 | 선택지 | 권고 |
|---|---|---|---|
| **Q1** | 서재 경로의 Toast 는 글 한 칸이다. 기존 두 줄(제목·설명)을 어떻게 넣을지 | ⓐ `제목. 설명` 한 칸에 이어 붙임 (320: 3줄 · 86 / 393: 2줄) ⓑ 제목만 (모든 폭 1줄) ⓒ 설명만 (2줄) | **ⓐ** — 기존 단어를 바꾸지 않고(NB-18) Activity 경로와 같은 내용을 준다. Toast 는 몇 초 뒤 사라지므로 "이미 열려 있다"와 "어떻게 하라"를 한 번에 보여야 한다. 이어 붙이는 방식도 문구의 일부이므로 QA 전에 확인을 받는다 |
| **Q2** | 320×568 Activity 시트에서 안내 설명 둘째 줄이 footer 아래에 남는다(원래 있던 현상의 연장) | ⓐ 허용 차이로 등록 ⓑ 안내가 나올 때 시트 내용을 그 Alert 가 보이도록 스크롤(`scrollIntoView({ block: 'nearest' })` — 새 요소 0, 기존 시트 동작 변경 1) | **ⓑ** — 새 UI 없이 고칠 수 있고, 지금 `startFailed` 의 아래 여백이 잘리는 현상도 함께 사라진다. 단 Stage 3 시트 동작이 바뀌므로 승인 필요. 미승인이면 ⓐ |
| **Q3** | 320 + 클래식 스크롤바에서 컬럼이 305(내용 257)로 좁아지는 것 | ⓐ 허용 (넘침 0 이 우선, 오버레이 기기는 변화 0) ⓑ 다른 방식 재검토 | **ⓐ** — 15px 가로 스크롤이 생기는 것보다 낫다. 해당 환경은 데스크톱 웹 프리뷰(`C-18`)뿐이다. 허용 차이로 등록하는 것은 사용자 승인 뒤에 한다 |
| Q4 | AC-4-35 ④ "Detail 조회 실패 → **전용 문구**" — 기존에 맞는 문구가 없다 | ⓐ 기존 `startFailed` 를 그대로 씀 (§21.1 표) ⓑ 새 문구 1건 초안 → 승인 | **ⓐ** (NB-18 "기존 문구 재사용"과 같은 방향). plan-agent 가 AC 문언을 "일반 실패 문구, 이동 0"으로 고친다 |
| 확인 | AC-4-35 ③ `replace` ↔ 일반 시작 push 의 뒤로가기 차이 (§21.2 📝) | — | plan-agent 확인 (시각 영향 0) |

### 21.7 development-agent 구현 메모

1. Activity: `ReadingContextSheet` 의 기존 `failed` Alert 를 **오류 종류별 문구**로 바꾼다(`title` + `description`). 문구는 `shared/copy/error-copy.ts` 를 쓰고, 컴포넌트 안에 다시 적지 않는다.
2. 서재: `StartSessionAction` 의 기존 Toast `message` 에 Q1 결정 문구를 넣는다. Toast 컴포넌트 API 는 바꾸지 않는다.
3. §21.2 T1~T6 — `launching` 을 409 → Detail → 이동/안내까지 이어서 켜 둔다. `me` 는 invalidate/refetch 만 쓴다(reset·remove 금지).
4. §21.3 — `AppColumn.css` 최소 폭 1곳(+ 같은 성질의 유틸리티를 쓰는 곳이 있으면 그곳). 근거 주석 필수. 클래식 스크롤바 launch 설정의 양축 프로브를 상설 e2e 로 둔다(AC-4-99 ③) — Welcome · Home · Library · 세션 3화면 포함.
5. Q2 ⓑ 가 승인되면: Alert 가 나타날 때 한 번만 스크롤한다. 사용자가 시트를 스크롤하는 동안 계속 따라가지 않는다.
