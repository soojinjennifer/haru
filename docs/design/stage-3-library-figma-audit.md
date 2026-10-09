# Stage 3 — Library Figma 전수 대조 (구현 전)

Status: **결정 완료** — `L-OPEN-01`~`22` 전건 처리 (`docs/decisions/stage-3-approvals.md` §15~§20). 구현은 커밋 `b45a152`·`0e1f338`·`6a66fb9`·`bd34f94`
작성: design-agent, 2026-10-06
대상: Figma `YWWu3AFEJpRxvw0T5klq0k` · page `16:2` MVP_KeyScreen_V.2 (+ page `8:2` Design Guide 의 Library 계열 컴포넌트)
범위: **대조와 명세만.** Production Code 0줄. Playwright 미사용 (Library 구현물이 없어 측정 대상이 없고, 동시에 다른 작업이 baseline 을 다루고 있어 회피).

> **읽는 법** — 표기 규칙
> | 표기 | 뜻 |
> |---|---|
> | `[실측]` | `get_metadata` 좌표 또는 `get_design_context` 가 돌려준 값 |
> | `[픽셀]` | 렌더 PNG 픽셀로 교차 확인함 |
> | `[추정]` | 근거는 있으나 Figma 가 단정하지 않음 |
> | `확인 불가` | Figma 에서 알 수 없음 (prototype reaction 등) |
> | `DECISION-NEEDED` | 사용자 결정 전 구현 금지 |

---

## 1. Library 계열 Figma 노드 전수 목록

### 1.1 화면 (page `16:2`, section `31:204`)

| # | 노드 ID | 이름 | x / y | 크기 | 성격 |
|---|---|---|---|---|---|
| **L-1** | **`30:74`** | `2a · Library — Bookshelf & History/Defult shelf` | 3347 / 120 | **393 × 1103** | **기본 Library 화면.** 섹션 3개 = Our curated shelf · **Favorites** · Finished together |
| **L-2** | **`145:1132`** | `(이름 공백 " ")` | 3907 / 122 | **393 × 1103** | Library + **Reading now** + **My Saved** + 책 상세 오버레이(`145:1450` scrim + `145:1085` Prompt Card) |
| **L-3** | **`163:1669`** | `2a · Library — Bookshelf & History/Defult shelf` | 4580 / 122 | **393 × 1103** | L-1 과 같은 골격 + **"See all" 오버레이**(`163:1807` scrim + `163:2347` Prompt Card `type=shelf`). 섹션 제목이 `Finished together` 로 **중복**됨 |
| L-4 | `31:208` | `2a · Library — Bookshelf & History` (텍스트) | 3347 / 56 | 251 × 18 | 캔버스 주석. 화면 아님 |

**Library 화면은 이 3개가 전부다.** page `16:2` 전체를 `librar|shelf|saved|reading now|rating|gift|owned` 로 전수 검색했고, 그 밖에 Library 라벨이 나오는 유일한 노드는 `110:868`(= Progress 화면 `110:522` 의 **탭바 라벨**)이다.

### 1.2 Library 계열 컴포넌트 (page `8:2`, section `17:367` "02 · HARU Components")

| # | 노드 ID | 이름 | 크기 | 비고 |
|---|---|---|---|---|
| **C-1** | `113:1993` | **`This Week's Shelf`** (component set) | 790 × 265 | 변형 2개 |
| C-1a | **`113:1992`** | `Property 1=Default` | **345 × 216** | L-1/L-2/L-3 이 쓰는 유일한 변형 |
| C-1b | **`113:1991`** | `Property 1=**Selected**` | **345 × 225** | **어느 화면에서도 쓰이지 않음.** 표지 우상단 체크 배지 + 항목별 `▶ Session` Tag + **dots 없음** |
| **C-2** | **`163:2145`** | **`Book List`** | **328 × 299** | 74pt 행 4개 + **행 사이 1px divider 3개 전부 존재** |
| C-3 | `163:2034` | `Container` ("Our curated shelf") | 257 × 21 | 섹션 제목 조각. 컴포넌트 아님 |
| **C-4** | **`163:1898`** | `Prompt Card/Home` 변형 `… type=**shelf**` | **364 × 425** | **"See all" 시트 원본.** 헤더 + `Book List` 인스턴스 + `Button/card`(= ★ Save + Start Session) |
| C-5 | `86:372` | `Button/card` | 330 × 45 | ActionBar (Save + Start Session) |
| C-6 | `86:245` | `Button/White` | 170 × 45 | `★ Save` 원본 (Home 에서 이미 구현됨) |
| C-7 | `88:789` | `Pagenation` | 46 × 7 | 캐러셀 dots |
| C-8 | `25:51` | `Screen/Tab Bar` 변형 `Active=Library` | 345 × 70 | 구현됨 |
| C-9 | `85:592` | `Cardtitle` | 329 × 26 | 시트 헤더 (우상단 24×24 아이콘 포함) |
| C-10 | `145:929` · `163:2531` | `asset/book-cover` | 153×193 · 58×82 | 표지 플레이스홀더 에셋 |

**`C-1b` 와 `C-4` 는 현행 Stage 3 Design Spec 이 "폐기"로 처리했거나 아예 다루지 않은 Figma 자산이다.** §7 ⑤·⑥ 참조.

---

## 2. 화면별 실측

공통: Status Bar `393×56` → Content 프레임 `x=24 w=345 y=66` (status bar 하단과 **10** 간격) `[실측]`. 기기 프레임 모서리 radius 56. 프레임 높이 **1103** > 뷰포트 852 → **세로 스크롤 화면**.

### 2.1 L-1 `30:74` — 기본 Library

```
Content(24, 66, 345×973)
├ 30:88  제목 행            y=0    h=40
│   ├ 30:89  "Library"      x=0  y=3.5  28/Heavy 860  text-primary
│   └ 30:90  streak chip    x=211 y=3   134×34  (내부 icon 13×13 @14,10.5 + 라벨 13/Semibold @33,9)
└ 145:928 Frame 15          y=56   h=869          ← 제목 행과 간격 16
    ├ 163:1624 SectionHeader  y=0    h=20  "Our curated shelf"  + "See all"
    ├ 113:1994 Shelf          y=36   h=216                        ← 간격 16
    ├ 163:1632 SectionHeader  y=268  h=20  "Favorites"          + "See all"   ← 간격 16
    ├ 145:779  Shelf          y=304  h=216                        ← 간격 16
    ├ 30:138   SectionHeader  y=536  h=20  "Finished together"  + "See all"   ← 간격 16
    └ 30:140   Book List      y=572  h=297  (74pt 행 4)           ← 간격 16
Frame 5 (40:217) y=981 h=122 → Screen/Tab Bar @ (23, 1023) 347×70
```

- **모든 섹션 간격 = 16** `[실측]` → `--space-4`.
- Frame 15 하단(abs 991) → 탭바 상단(abs 1023) = **32**.
- `163:1626` / `163:1634` / `145:680` "See all" 3개 모두 존재 `[실측 + 픽셀]`.

#### ⚠️ 현행 Spec 의 노드 오독 (중요)

현행 `docs/design/stage-3-design-spec.md:383` 은

> *"Figma 는 섹션 제목을 "Our curated shelf" / "Finished together" / "Finished together" 로 두 번 중복한다(`163:1633` · `30:139`)"*

라고 적고, 그 근거로 두 번째 섹션 제목을 **"Books you own"** 으로 바꾸는 허용 차이 `AD-S3-4` 를 등록했다.

**실측 결과 `163:1633` 의 텍스트는 "Favorites" 다** `[실측 + 픽셀]`. 제목이 중복된 프레임은 L-1 이 아니라 **L-3 `163:1669`**(`163:1684` · `163:1688`)다.

| | Figma 실제 | 현행 Spec 기재 |
|---|---|---|
| L-1 `30:74` 2번째 섹션 | **"Favorites"** (`163:1633`) | "Finished together" (중복이라고 기술) |
| L-3 `163:1669` 2·3번째 섹션 | "Finished together" × 2 (`163:1684`·`163:1688`) | 언급 없음 |

→ `AD-S3-4` 의 **전제가 사실이 아니다.** §7 ② 로 이어진다. **`DECISION-NEEDED`**

### 2.2 L-2 `145:1132` — Reading now + My Saved + 책 상세 오버레이

```
Content(24, 66, 345×973)
├ 145:1135 제목 행   y=0   h=40   chip 138×34 @x=207 ("2 Week streak")
└ 145:1141 Frame 15  y=56  h=891
    ├ 145:1142 SectionHeader y=0   h=20  "Reading now" + **"3 of 5 nights"**(See all 아님)
    ├ 145:1145 Reading now 카드 y=36  **345×118**
    ├ 145:1153 SectionHeader y=170 h=20  "Our curated shelf"  (**See all 없음**)
    ├ 145:1155 Shelf         y=206 h=216
    ├ 145:1156 SectionHeader y=438 h=20  **"My Saved"**        (**See all 없음**)
    ├ 145:1158 Shelf         y=474 h=216
    ├ 145:1159 SectionHeader y=706 h=20  "Finished together" + "See all"
    └ 145:1162 Book List     y=742 h=149  (74pt 행 **2**)
오버레이: 145:1450 "Deemed" (0, -8, 393×1111) → 145:1085 Prompt Card/Home (14, 446) **365×376.78**
```

- **"My Saved" 섹션은 실재한다** — 오버레이에 가려 기본 스크린샷에는 안 보이지만, `145:1141` 을 단독 렌더해 **픽셀로 확인**했다 (`My Saved` 제목 + 3-up 캐러셀 + dots, See all 없음) `[픽셀]`.
- 오버레이 카드 `145:1085` 는 Home 활동 카드 `163:2649` 와 **폭·높이가 동일**(365×376.78)하고 자식 구성(Cardtitle / 표지58×82+제목+저자+이유 / PromptPill ×4 / Button/card)도 동일하다 `[실측]` → **같은 컴포넌트 재사용**.

#### Reading now 카드 `145:1145` 실측

| 속성 | 값 `[실측]` | 토큰 |
|---|---|---|
| 박스 | 345×118, padding **14**, gap **14**, radius **24** | radius 24 → `--radius-surface`(22) 흡수 (DESIGN_TOKEN_MAP §5.2 기존 행) |
| 면 | `glass-fill-strong` `#ffffffe5` | `--color-surface-strong` ✓ |
| 그림자 | `0 6 4 rgba(94,115,112,.08)` + inner `0 1.5 0 #fff e5` + inner `0 -1 0 ink 5%` | **`--shadow-bubble` 과 완전 일치** ✓ |
| 표지 | **64×90**, radius **10**, `0 6 14 ink 28%` | `BookCover` 신규 크기 필요 (§4) |
| 제목 | 16 / Bold / `text-primary` | `callout` + `bold` |
| 부제 | 12 / Regular / `text-secondary` `#7d9291` | `caption-1` + `--color-fg-secondary` |
| 진행 바 | h 7, radius 4, track `rgba(94,115,112,**0.14**)`, fill `#85bfb6`, 채움 132/239 | `ProgressBar` 재사용. **track 14% vs 현행 `--color-progress-track` 12% 차이** |
| 메타 | 11.5 / Medium / `#9aabaa` | `caption-2` + **신규 tertiary 색 필요** (§4) |

### 2.3 L-3 `163:1669` — "See all" 오버레이

- 기본 레이어는 L-1 과 동일 골격이나 섹션 제목이 **"Our curated shelf" / "Finished together" / "Finished together"** 로 **중복**됨 `[실측]`.
- 오버레이: `163:1807` "Deemed" (0, 0, 393×1112) → `163:2347` **`Prompt Card/Home` `type=shelf` 인스턴스** (14, 421.89) **364×426** `[실측]`.
- 원본 변형 `163:1898` 내부 `[실측]`:

| 자식 | 좌표 | 내용 |
|---|---|---|
| `163:2045` 헤더 | (18, 18) 329×26 | `Cardtitle`(우상단 24×24 아이콘 포함) + 텍스트 "Our curated shelf" 149×21 @x=5 |
| `163:2256` | (18, 56) **328×299** | **`Book List` 인스턴스** — 74pt 행 4 |
| `163:1916` | (18, 367) 329×45 | **`Button/card`** = ★ Save(87×45) + Start Session |

→ 즉 Figma 의 "See all" 은 **목록 + ActionBar(Save/Start Session)** 를 함께 가진 카드다. 현행 Spec `AD-S3-19` 는 이 ActionBar 를 **제거**한다. §7 ⑥ `DECISION-NEEDED`.

### 2.4 오버레이 scrim — `[픽셀 측정]`

L-1(비오버레이) ↔ L-2(오버레이) 의 **동일 좌표 7점**을 최소제곱으로 풀었다.

```
result = base × (1−α) + S × α
1−α ≈ 0.657 / 0.645 / 0.678 (R/G/B),   S ≈ 0 (세 채널 모두 음수로 수렴)
```

→ **scrim ≈ `rgba(0, 0, 0, 0.34)`** `[픽셀]`. 블러는 없다(표지 가장자리가 선명하게 유지된다).

| | 값 | 대비 |
|---|---|---|
| Figma Library scrim `[픽셀]` | 검정 ~34% | — |
| 현행 `--color-scrim` | `#29293a3b` = `rgb(41,41,58) / 0.231` | **Figma 쪽이 더 어둡다** |

→ `DECISION-NEEDED` (§7 ⑨).

### 2.5 공통 블록 실측

#### SectionHeader (`163:1624` 외) `[실측]`

| | 값 | 토큰 |
|---|---|---|
| 박스 | h **20**, `justify-content: space-between`, **baseline 정렬** | — |
| 제목 | **17 / Bold 700** / `text-primary` `#4a5f5c` | `headline` + `weight=bold` (headline 기본 weight 는 semibold → **override 필요**) |
| 액션 | "See all" **12 / Medium 510** / **`#9aabaa`** | `caption-1` + `--color-fg-tertiary`(신규, §4) |

#### `This Week's Shelf` `113:1992` (Default) `[실측]`

| | 값 |
|---|---|
| 박스 | 345 × 216, `flex-col`, 선언 gap 8 |
| Shelf 그리드 | y=0 h=192. 열 3개, x = **0 / 120.948 / 238.922** |
| 표지 | **107 × 151**, radius **12**, `0 6 14 rgba(94,115,112,.24)` + inset `0 1 0 rgba(255,255,255,.5)` |
| 열 간격 | 표지 기준 **13.95** / **10.97 — 균일하지 않다** (Figma 가 % 기반 그리드라 생긴 산술 잔차) |
| 오른쪽 | 3번째 표지 끝 = 238.922+107 = **345.92 → 345 를 0.92 넘어 클립**됨 `[실측 + 픽셀]` |
| 캡션 제목 | y=158, **12 / Semibold 590** / `text-primary` |
| 캡션 부제 | y=179, **11 / Regular** / `#9aabaa` |
| 캡션 gap | 표지→제목→부제 각 **7** |
| dots | `113:1986` **y=207** h=7. active 20×7 `#5e7370`, inactive 7×7 `rgba(94,115,112,.3)`, gap 6, radius 4 |

> ⚠️ **선언 gap 8 ↔ 실측 오프셋 15 불일치.** auto-layout 은 gap 8 을 선언하는데 `Pagenation` 의 실측 y 는 192+8=200 이 아니라 **207** 이다. 원인 `확인 불가`. **실측값 207 을 기준으로 구현하고, 차이가 보이면 보고**할 것.

#### `Book List` — 컴포넌트 `163:2145` vs 화면 로컬 `30:140`

| | 컴포넌트 `163:2145` | 화면 `30:140` (L-1) |
|---|---|---|
| 폭 | **328** | **345** |
| 행 높이 | 74 | 74 |
| 행 수 | 4 | 4 |
| **divider** | **3개 전부** (`163:2111`·`163:2122`·`163:2133`) | **1개뿐** (`30:148`, 1–2행 사이) `[실측 + 픽셀]` |
| 텍스트 열 폭 | 223 | 240 |
| chevron x | 297 (우 inset 16) | 314 (우 inset 16) |

→ **Figma 내부 불일치.** 컴포넌트(`163:2145`)가 원본이고 화면 사본이 divider 2개를 잃은 것으로 보인다 `[추정]`. **권고: 모든 행 사이 divider** — 단 "Figma 에 있는 것을 빼지/더하지 않는다" 규칙상 **등록 필요**. `DECISION-NEEDED` (§7 ⑧).

#### Book List 공통 실측 `[실측]`

| | 값 | 토큰 |
|---|---|---|
| 컨테이너 | radius **24**, `glass-fill` `#ffffffbd`(=74%), `0 6 4 ink 8%` + inset highlight | radius → `--radius-surface`; 면 → **`--color-surface-glass`**(현행 `ListGroup` 은 `--color-surface-strong` 90% 사용 — 차이) ; 그림자 → `--shadow-bubble` (현행 `ListGroup` 은 `--shadow-glass-rest` — 차이) |
| 행 | padding **16 / 13**, gap **12**, 높이 **74** | 13 → `--space-3`(12) 흡수(기존 흡수표). 결과 높이 **72** |
| 썸네일 | **34 × 48**, radius **7** | 7 → `--radius-control`(8) ✓ 기존 흡수 |
| 제목 | **14 / Semibold** / `text-primary` | `subheadline`(15) 흡수 ✓ 기존 흡수표 |
| 메타 | **11.5 / Regular** / `#9aabaa` | `caption-2`(11) 흡수 ✓ + **신규 tertiary 색** |
| "Rated 4.5" | `Rated ` 11.5 Regular + `4.5` 12 Bold, 둘 다 `#9aabaa` | **D-7 로 미렌더** |
| divider | 1px `rgba(94,115,112,**0.10**)` | 현행 `--color-divider` = ink600 **12%** — 미세 차이 |
| chevron | 15×15, stroke `#9AABAA`, stroke-width **1.375**, linecap round | Lucide `chevron-right` (§5) |

#### streak chip `30:90` / `145:1137` `[실측]`

| | 값 |
|---|---|
| 박스 | **134×34**(L-1, "2Week streak") / **138×34**(L-2·L-3, "2 Week streak"), padding 14/9, gap 6, radius 100 |
| 면 | `glass-fill` `#ffffffbd` + `0 6 4 ink 8%` + inset highlight (= `--shadow-bubble`) |
| 라벨 | 13 / Semibold / `text-primary` |
| 아이콘 | **13×13 채워진 5각 별, fill `#D0CCA1`** `[실측 — SVG path 확인]` |

→ Home 과 동일 규격. 구현된 `WeekSummaryChip` 은 `haru:session-history` 를 쓰며 이는 **이미 등록된 차이 `A-23`** 다. **Library 에도 같은 차이가 그대로 적용된다**는 점만 기록한다 (신규 결정 아님).

---

## 3. 토큰 매핑

### 3.1 기존 토큰으로 충족되는 것

| Figma 값 | 기존 토큰 |
|---|---|
| `#4a5f5c` text-primary | `--color-fg-primary` (`--haru-ink-700`) |
| `#7d9291` text-secondary | `--color-fg-secondary` (`--haru-ink-500`) |
| `#85bfb6` accents/teal | `--color-action-primary-bg` · `--color-progress-fill` |
| `#5e7370` / 30% (dots) | `--color-indicator-active` / `--color-indicator-inactive` |
| `#ffffffbd` glass-fill (74%) | `--color-surface-glass` |
| `#ffffffe5` glass-fill-strong (90%) | `--color-surface-strong` |
| `#D0CCA1` (별) | `--color-icon-save-star` |
| `0 6 4 ink8% + inset` | `--shadow-bubble` |
| `0 6 14 ink24~28% + inset white50` | `--shadow-cover` |
| radius 7 → 8 / 24 → 22 / 100 → pill / 4 | `--radius-control` · `--radius-surface` · `--radius-pill` · `--radius-indicator` |
| 간격 16 / 14 / 13→12 / 12 / 7→8 / 6 | `--space-4` · `--space-3-5` · `--space-3` · `--space-1-5` |
| dots 7 / 20 / gap 6 | `--indicator-dot-size` · `--indicator-active-width` · `--indicator-gap` |
| 타이포 28H / 17B / 16B / 14→15 / 13 / 12 / 11.5→11 / 11 | `title-1` heavy · `headline` bold · `callout` bold · `subheadline` · `footnote` · `caption-1` · `caption-2` |

### 3.2 신규 제안 토큰

> ⚠️ 모두 **Tier 2 Semantic 을 거친다.** Tier 3 → Primitive 직접 참조는 빌드 규칙 3-4 위반이다.

| ID | Tier | 제안 이름 | 값 / 참조 | 근거 | 상태 |
|---|---|---|---|---|---|
| **LT-1** | 2 semantic/color | **`--color-fg-tertiary` 재매핑** → `var(--haru-ink-400)` (`#9aabaa`) | Figma 가 Library 에서 **3단계 회색**을 쓴다: primary `#4a5f5c` · secondary `#7d9291` · **tertiary `#9aabaa`**. 현재 `--color-fg-tertiary` 는 secondary 와 **같은 ink-500** 이라 Figma 를 표현할 수 없다. `--haru-ink-400` 은 primitive 에 이미 있으나 **어떤 semantic 도 참조하지 않는 미사용 값**이다 | **`DECISION-NEEDED` + 대비 가값** (§6) |
| **LT-2** | 2 semantic/radius | **`--radius-media: 12px`** | 표지 radius 가 크기별로 **7 / 10 / 12** 3종이다. 현행 6단계는 8 다음이 16 이라 10·12 를 담을 칸이 없다. 8 로 흡수하면 Δ−4, 16 이면 Δ+4 (동점) | **`DECISION-NEEDED`** — ① `--radius-media` 신설 ② 전부 `--radius-control`(8) 흡수 ③ 10·12 를 16 으로 흡수. 6단계 고정은 `#10-②` 결정이라 신설은 그 결정의 변경이다 |
| **LT-3** | 3 component | `--book-cover-w-sm: 34px` · `--book-cover-w-lg: 107px` · `--book-cover-w-xl: 64px`(Reading now) | `component/index.css:132` 가 *"`sm`(34)·`lg` 은 서재 화면이 생길 때 추가"* 라고 이미 예고 | 제안 |
| **LT-4** | 3 component | `--library-shelf-cover-h: 151px` · `--library-shelf-item-gap` | 캐러셀 열 기하 | 제안 |
| **LT-5** | 2 semantic/color | `--color-scrim` 값 재검토 | Figma Library scrim `[픽셀]` ≈ `rgba(0,0,0,.34)` ≠ 현행 `#29293a3b`(.231) | **`DECISION-NEEDED`** (§7 ⑨) |
| **LT-6** | 2 semantic/color | `--color-progress-track` 14% | Figma `145:1150` = `rgba(94,115,112,.14)`, 현행 12% | 흡수 권고(Δ2%). 결정 불필요하면 현행 유지 |
| **LT-7** | 2 semantic/color | `--color-divider` 10% | Figma Book List divider = ink 10%, 현행 12% | 흡수 권고 |

### 3.3 토큰 정규화 이슈

- `--haru-ink-400`(#9aabaa) 가 **primitive 에만 존재하고 semantic 에 노출되지 않는다.** Library 가 이 값의 첫 실사용처다 → LT-1 없이는 화면 코드가 raw HEX 를 쓰게 되어 `rules/frontend.md` §6 위반.
- Book List 컨테이너 면: Figma = **74% glass**, 현행 `ListGroup` = **90% strong**. 그림자도 Figma = `--shadow-bubble`, 현행 = `--shadow-glass-rest`. **`ListGroup` 을 Library 가 그대로 쓰면 Figma 와 달라진다** → `DECISION-NEEDED` (§7 ⑩).
- Figma Variable `item spacing/xxs`(4) 가 dots **radius** 에 쓰이고 있다 — 간격 변수의 radius 오용. 기존 DESIGN_TOKEN_MAP §5.2 가 이미 *"(`item spacing/xxs` 오용 대체)"* 로 기록함. 추가 조치 불필요.

---

## 4. 컴포넌트 재사용 / 신규

### 4.1 그대로 재사용 (수정 0)

| Figma | 기존 구현 |
|---|---|
| `Screen/Status Bar`, `Screen/Tab Bar Active=Library` | `BottomTabBar` (`packages/ui/src/tab-bar/`) |
| 제목 28 Heavy | `TopBar variant="large"` → `Text variant="title-1" weight="heavy"` ✓ |
| streak chip | `WeekSummaryChip` (`entities/home/`) — 아이콘 차이 `A-23` 기등록 |
| dots | `PageIndicator` (7 / 20 / gap 6 / radius 4) — **Figma 와 완전 일치** ✓ |
| 진행 바 | `ProgressBar` (track 색만 §3.2 LT-6) |
| 오버레이 책 상세 카드 `145:1085` | `ActivityOptionCard`(+`CapabilityBadge`·`PromptPill`·`PromptPreview`·`SaveButton`) — Home 과 **동일 기하** ✓ |
| ★ Save | `SaveButton` (`entities/activity-card/`) ✓ 이미 구현·동작 |
| `▶ Session` Tag (Selected 변형) | `Tag` (`packages/ui/src/tag/`) |
| 빈/오류 표현 | `EmptyState` · `ErrorState` · `Skeleton` · `InlineAlert` |

### 4.2 기존 컴포넌트 **확장** (신규 생성 아님)

| 컴포넌트 | 필요한 확장 | 근거 |
|---|---|---|
| **`packages/ui` `ListRow`** | **`media` 슬롯**(34×48 표지) + **`meta` 슬롯**(우측 보조). 현재 props 는 `title`·`subtitle`·`trailing` 뿐이고 소스 주석이 *"`media`·`meta` 슬롯은 Stage 3 이다"* 로 예고 | `163:2145` Book List |
| **`packages/ui` `ListGroup`** | 면·그림자 토큰 차이 (§3.3) | `30:140` |
| **`entities/book` `BookCover`** | size `sm`(34×48) · `xl`(64×90) · `lg`(107×151) 추가. 현재 `md` 단일. aspect 는 7/10 로 **3종 모두 ±0.02 내** → 기존 `--book-cover-aspect` 유지 가능 | 전 화면 |

### 4.3 신규 필요 컴포넌트

| 분류 | 이름(제안) | 역할 | Figma |
|---|---|---|---|
| **Shared UI** | **`SectionHeader`** | 제목(17 Bold) + 선택적 액션(12 Medium). `space-between` + baseline | `163:1624` 외 7곳 |
| **Domain** | **`BookShelfItem`** | 표지 + 제목 + 역량 캡션 (+ Selected 변형: 체크 배지 + `▶ Session` Tag) | `113:1971` |
| **Domain** | **`BookShelfCarousel`** | 3-up 가로 트랙 + `PageIndicator`. **가로 scroll-snap** — Home 가로 트랙과 같은 패턴이므로 `R-SHADOW-1`(overflow 안 그림자 inset) 적용 대상 | `113:1992` |
| **Domain** | **`BookListRow`** | `ListRow(media, meta)` 조합 래퍼 | `163:2100` |
| **Feature** | **`LibraryShelfSheet`** | "See all" | `163:1898` — 형태는 §7 ⑥ 결정 후 |
| **Feature** | **`BookDetailSheet`** | 책 상세 | `145:1085` — 형태는 §7 ⑦ 결정 후 |

**Shared UI 신규는 `SectionHeader` 1건뿐이다.**

---

## 5. 아이콘

글리프를 **SVG path 로 직접 확인**했다 (크기만 보고 넘어가지 않았다).

| 위치 | Figma 노드 | 글리프 `[실측]` | 판정 |
|---|---|---|---|
| streak chip | `30:91` | **채워진 5각 별**, `M6.5 1.08 L8.07 4.44 L11.65 4.875 …`, fill `#D0CCA1`, 13×13 | **기존 `haru:save-star`** 와 동일 글리프(viewBox 14 → 13 스케일 차). 현재 구현은 `haru:session-history` — **차이 `A-23` 기등록** |
| Book List 행 끝 | `30:146` 등 | `M5.625 3.125 L10 7.5 L5.625 11.875`, stroke `#9AABAA` 1.375, 15×15 | **Lucide `chevron-right`** (stroke-width 조정) |
| 시트 헤더 우상단 | `Cardtitle` 내 24×24 | Home 카드와 동일 슬롯 | **기존 `haru:flip-to-back`** |
| `Selected` 변형 표지 배지 | `113:1911` 20×20 / 내부 12×12 | 흰 원 + 체크 `[픽셀]` | **Lucide `check` / `circle-check`** — 단 이 변형 자체가 `DECISION-NEEDED` |
| `Selected` 변형 Tag | `117:864` 내 ~10×11.5 벡터 | **재생 삼각형 ▶** `[픽셀]` | **Lucide `play`** — 변형 채택 시 |
| 탭바 Library | `25:51` | 책 | 구현됨 (Lucide `book`) |

**HARU 전용 SVG 신규 export 는 0건이다.**

---

## 6. 접근성 — 실측 대비

배경(앱 그라데이션) 실측 픽셀 3점에 대한 대비비 `[픽셀 + 계산]`:

| 전경 | 상단 `#f0f9f6` | 중간 `#d6e8e2` | 하단 `#cbd1d9` |
|---|---|---|---|
| **`#9aabaa` (Library tertiary)** | **2.23** | **1.88** | **1.56** |
| `#7d9291` (secondary, 가값 `P-01`) | 3.06 | 2.58 | 2.14 |
| `#4a5f5c` (primary) | 6.35 | 5.35 | 4.43 |

**`#9aabaa` 가 쓰이는 곳**: "See all"(12px) · 캐러셀 캡션 부제 = **4대 역량 라벨**(11px) · Book List 메타(11.5px) · chevron.

→ **WCAG AA 4.5:1 에 크게 못 미친다** (1.56–2.23). `P-01`(secondary 2.58:1) 과 **다른 새 사례**다.
→ `DECISION-NEEDED`: ① Figma 대로 두고 **새 가값 `P-xx` 등록** ② `--color-fg-secondary`(#7d9291) 로 올림 ③ 디자이너에게 값 요청. **agent 가 임의로 올리지 않는다.**

그 밖:

| 항목 | 실측 | 판단 |
|---|---|---|
| "See all" 터치 타깃 | 텍스트 39×14 | **44×44 미달** → hit-area 확장 필요 (`IconButton.hit-area` 선례) |
| Book List 행 | 74 (흡수 후 72) | 44 초과 ✓ |
| 캐러셀 표지 | 107×151 | ✓ |
| `Selected` 체크 배지 | 20×20 | 44 미달 — 변형 채택 시 처리 필요 |
| dots | 7×7 | **표시 전용**(`S1-G-1`) — 조작 요소 아님 ✓ |
| 캡션 부제 = 역량 라벨 | 11px | Figma "Emotion"/"Resilience"/"Confidence" → **#14 표시 라벨**(Emotion Regulation / Cognitive Flexibility / …)로 교체 필요 = 기존 `AD-S3-5`. 라벨이 길어져 **11px + 1줄 유지가 불가능**해질 수 있다 → 줄바꿈/말줄임 규칙 `DECISION-NEEDED` |
| 캐러셀 키보드 | Figma 에 좌우 버튼 없음 | 가로 scroll-snap 네이티브 키보드 경로로 WCAG 2.5.1 충족 (Home 결정과 동일) |

---

## 7. 충돌 · 공백 — 사용자 결정 목록

### ① `D-7` 과 Figma 의 차이 — 평점 / Reading now / My Saved

`D-7`(approvals:103): *"FR-20·FR-22 의 4기능만 — 보유책·증정책·기록·책별 Prompt 보기. Figma 의 평점·"Reading now"·"My Saved" 는 구현하지 않고 허용 차이로 기록"*

**Figma 실측:**

| 항목 | 어디에 | 실측 내용 | `D-7` 유지 시 화면에서 비는 것 |
|---|---|---|---|
| **평점 "Rated 4.5"** | L-1 4곳(`109:511`·`109:519`·`163:1643`·`163:1654`), L-2 2곳, L-3 4곳, 컴포넌트 `163:2145` 4곳 | 행 텍스트 열(237px) 우측 끝. `Rated ` 11.5 Regular + `4.5` 12 Bold | **Book List 행의 우측 meta 슬롯이 완전히 빈다.** 행 2행째가 `"{n} sessions · finished {date}"` 하나만 남고 **텍스트 열 237 중 오른쪽 ~58px 공백**. 레이아웃은 깨지지 않음(좌측 정렬 유지) |
| **"Reading now"** | **L-2 에만** (`145:1142` 헤더 + `145:1145` 카드 345×118 + `"3 of 5 nights"`) | 섹션 1개 = 헤더 20 + 간격 16 + 카드 118 = **154pt** | **L-2 최상단 154pt 블록이 통째로 사라진다.** 진행 바(`ProgressBar`)·"Last read Tue · 12 min" 도 함께 사라짐. L-1 에는 원래 없으므로 **L-1 을 기준 화면으로 삼으면 손실 0** |
| **"My Saved"** | **L-2 에만** (`145:1156` 헤더 + `145:1158` 캐러셀) | 섹션 1개 = 20 + 16 + 216 = **252pt** | **저장한 책이 갈 곳이 없어진다** → ② 로 이어짐 |
| **"Favorites"** | **L-1 에** (`163:1632`/`163:1633` + `145:779` 캐러셀) | `D-7` 이 **언급하지 않은 섹션**. 현행 Spec 은 이것을 "Finished together 중복"으로 **오독**했다 (§2.1) | — |

> **`DECISION-NEEDED` ①-a** 평점 미렌더를 유지하는가 (현행 `AD-S3-6` 유지 / 재검토)
> **`DECISION-NEEDED` ①-b** "Reading now" 미렌더를 유지하는가 (현행 `AD-S3-7`)
> **`DECISION-NEEDED` ①-c** **`AD-S3-4` 를 철회하는가** — 전제가 사실이 아니다. L-1 2번째 섹션의 Figma 실제 제목은 **"Favorites"** 이며, "Books you own" 은 Figma 에 없는 문구다(최우선 규칙 2). `D-7` 의 "보유책" 기능을 어디에 둘지 함께 결정해야 한다

### ② `D-7` ↔ 이후 사용자 지시 충돌 — `★ Save` 가 갈 곳 **(최우선)**

**사실관계 (문서 실측):**

| 근거 | 내용 |
|---|---|
| `D-7` (approvals:103) | "My Saved" **미구현**, 허용 차이 |
| `AD-S3-8` (spec:1290) | "My Saved"·★ Save **미렌더** |
| **approvals §12.2** | *"`★ Save` 를 뺐다 … 최우선 규칙 **2·3 동시 위반**"* → **무효가 되는 것: `D-7` · `AD-S3-8`** |
| **approvals §12.8 `A-9`** (2026-10-05, user) | *"**현재 카드를 Library 의 favorites 에 저장한다.** → 신규 contract 필요. Home 에서 저장 동작은 이번에 구현하고, **저장 결과를 보는 Library 화면은 다음 차례**"* |
| approvals §12.9 | **무효** 목록에 `D-7`·`AD-S3-8`(`★ Save` 제외) 명시 |
| 구현 현황 | `entities/activity-card/SaveButton.tsx` **구현·동작 중**, `packages/contracts/src/library/saved-book.ts` 존재, Mock fixture `saved-books.ts` 존재, `BookOwnershipSchema` 에 **`favorite_only`** 이미 포함 |

→ **"다음 차례"가 지금이다.** 저장은 되는데 **볼 곳이 없는 상태**이고, `D-7` 의 "My Saved 미구현"은 `A-9` 와 정면 충돌한다.

**Figma 가 제공하는 두 후보 표면 `[실측]`:**

| 후보 | 노드 | 실측 | 비고 |
|---|---|---|---|
| **A. "Favorites"** | L-1 `163:1632`/`163:1633` + 캐러셀 `145:779` (345×216) + **"See all" 있음** | 기본 화면 L-1 에 존재 | 사용자 지시 문구 *"Library 의 **favorites**"* 와 **이름이 정확히 일치** |
| **B. "My Saved"** | L-2 `145:1156`/`145:1157` + 캐러셀 `145:1158` (345×216) + **"See all" 없음** | 오버레이 변형 L-2 에만 존재 | `saved-book.ts` 주석이 *"결과 표면 `145:1157` "My Saved""* 로 이미 지목 |

> **`DECISION-NEEDED` ②** 저장한 책을 어디에 보여주는가 —
> **(A)** L-1 의 **"Favorites"** 섹션을 그대로 쓴다 (기본 화면에 이미 있고 이름이 사용자 지시와 같다. "See all" 도 있다) /
> **(B)** L-2 의 **"My Saved"** 를 L-1 에 추가한다 (contract 주석이 지목한 노드. 단 L-1 에 없는 섹션을 **더하는** 것 = 최우선 규칙 2 검토 필요) /
> **(C)** A 와 B 가 같은 것이고 Figma 가 이름을 두 번 바꾼 것으로 보아 **하나로 통합**한다 (어느 문구를 쓸지 결정 필요) /
> **(D)** 이번 라운드에서 제외한다
>
> 함께 결정해야 할 것: 결정 결과에 따라 **`D-7` 의 "My Saved 미구현" 조항과 `AD-S3-4`·`AD-S3-8` 를 어떻게 정리할지**. **나는 결정하지 않는다.**

### ③ Figma 에 없는 화면 — `C-13` 절차 대상

| 화면 / 상태 | Figma | 권고 (`C-13` ①디자이너 요청 / ②design-agent 명세) |
|---|---|---|
| `/library` **Loading(skeleton)** | 없음 | **②명세** — `#22` 공통 상태 화면 우선 규칙 |
| `/library` **Empty**(섹션별 / 전체) | 없음 | **②명세** — `#22`. 단 "Favorites 0건" 문구는 ② 결정 후 |
| `/library` **Error / Offline / Retry** | 없음 | **②명세** — `#22` |
| **`/library/add`** 보유 책 직접 등록 (FR-23) | 없음 | **①디자이너 요청** 권고 — 검색 필드·결과 목록·직접 입력 폼으로 **화면 1개 분량**이고 `#22` 공통 상태가 아니다. 기존 컴포넌트(`TextField`·`ListRow(media)`·`FieldGroup`·`Button`)만으로 조립 가능하므로 ②도 가능 |
| **`/library/gift-requests`** 증정 신청·배송 상태 (FR-22) | 없음 | **①디자이너 요청** 권고 — 상태 6종 Tag 체계가 새로 필요하다 |
| `/library` → `/library/add` · `/library/gift-requests` **진입점** | 없음 | **①디자이너 요청** — Figma L-1/L-2/L-3 어디에도 버튼·링크가 없다. 현행 Spec 의 `LibraryFooterActions` 는 **Figma 근거 없는 명세**다 |
| **"See all" 목적지** | prototype reaction 미노출 | **확인 불가** — L-3 의 오버레이가 그 목적지로 **보이나** 단정 불가 |
| **"Show more"(Finished together 더 보기)** | 없음 — Figma 는 4행 고정 | 페이지네이션 방식 `DECISION-NEEDED` |

**나는 이 화면들의 명세를 먼저 쓰지 않았다.** 승인 후 작성한다.

### ④ PRD ↔ Figma 충돌

| # | 항목 | PRD | Figma | 영향 범위 | 판단 |
|---|---|---|---|---|---|
| **LN-1** | **책 단위 평점** | FR-12 = **세션 회고 별점**(세션 단위). 책 평점 없음 | "Rated 4.5" **10곳** (`109:511` 외) | contract `LibraryBook.averageRating` · Book List 행 · 집계 Backend 요구 | **미채택 유지 권고** (`D-7`). 비판정 톤(`rules/frontend.md` §8)과 충돌 `DECISION-NEEDED` (①-a) |
| **LN-2** | **다회차 읽기 진행** | 없음 | `145:1142` "3 of 5 nights" + `145:1150` 진행 바 (채움 132/239 ≈ 55%) | contract(진행 필드) · Reading now 카드 · Backend 집계 | **미채택 유지 권고** (`D-7`) `DECISION-NEEDED` (①-b) |
| **LN-3** | **책 저장/즐겨찾기** | PRD 에 없음 | "Favorites"(L-1) · "My Saved"(L-2) · `★ Save` | **이미 구현됨**(`SaveButton` + `saved-book.ts`) | **`A-9` 로 채택 확정.** PRD 가 따라가야 할 **PRD 수정 대상**으로 기록 필요 |
| **LN-4** | **표지 캡션 = 역량 라벨** | PRD §4 4대 역량 = Emotion Regulation / Self-Direction / Cognitive Flexibility / Intrinsic Motivation | "Emotion" / **"Resilience"** / **"Confidence"** — 뒤 2개는 4대 역량에 **없는 이름** | 표시 라벨(#14) | **#14 표시 라벨로 교체** = 기존 `AD-S3-5` 유지 권고. 라벨 길이 문제는 §6 |
| **LN-5** | **항목별 세션 시작**(`Selected` 변형 `▶ Session`) | PRD 에 서재 항목에서 바로 세션 시작하는 흐름 없음 | `113:1991` 각 항목에 `▶ Session` Tag | 세션 시작 진입점 추가 | ⑤ 참조 |

### ⑤ `This Week's Shelf` `Property 1=Selected` — 미사용 Figma 변형

`113:1991` (345×225) `[실측 + 픽셀]`:
- 표지 우상단 **20×20 체크 배지**(내부 12×12), 표지 inset 6/6
- 캡션 아래 **`▶ Session` Tag 92×26** (항목마다, 표지 색조에 맞춘 tint)
- **dots 없음** (Default 는 있음)
- 높이 216 → **225** (+9)

**어느 Library 화면에서도 인스턴스화되어 있지 않다** `[실측]`.

> **`DECISION-NEEDED` ⑤** ① 이번 라운드에서 구현하지 않는다(= Figma 자산이지만 화면에 없으므로 "빼는 것"이 아니다) / ② 다중 선택 UI 로 채택한다 / ③ 디자이너에게 용도를 확인한다. **나는 추정으로 명세하지 않았다.**

### ⑥ `type=shelf` (See all 시트) — 현행 Spec 이 "폐기"로 처리한 Figma 자산

| 근거 | 내용 |
|---|---|
| Figma | `163:1898` **정식 컴포넌트 변형**(`Prompt Card/Home` 의 `type=shelf`), L-3 에서 **실제 인스턴스화**(`163:2347`) |
| 현행 Spec:758 | *"`type=shelf` \| **폐기** — `LibraryShelfSheet` 로 분리"* |
| 현행 Spec `AD-S3-19` | *"`LibraryShelfSheet` 에 **ActionBar 없음**"* — Figma 의 `Button/card`(★ Save + Start Session) 제거 |

**Figma 가 가진 것 `[실측]`**: 헤더(제목 + 우상단 24×24 flip 아이콘) + `Book List`(328×299, 4행) + `Button/card`(329×45).

`AD-S3-19` 는 **Figma 에 있는 블록을 빼는 것**(최우선 규칙 3)이다. approvals §12.2 가 같은 유형의 판단(`★ Save` 제외)을 **무효**로 뒤집은 전례가 있다.

> **`DECISION-NEEDED` ⑥** ① Figma 대로 ActionBar 를 포함한다 / ② `AD-S3-19` 를 유지한다(사용자 재승인 필요) / ③ 시트 헤더의 **flip 아이콘** — "See all" 목록에 flip 이 왜 붙는지 Figma 가 설명하지 않는다 `확인 불가`

### ⑦ 오버레이의 형태 — "Sheet" 인가 "떠 있는 카드" 인가

| | Figma `[실측]` | 현행 구현 `packages/ui/Sheet` |
|---|---|---|
| 가로 | x=14, **w=364~365**, 좌우 inset **14** | `position: fixed`, **전폭** |
| 세로 | L-2: y 438–815 (뷰포트 852 기준 하단 여백 **37**) / L-3: y 422–848 (하단 여백 **4**) | `inset-block-end: 0` **하단 고정** |
| 모서리 | radius **28 전체 4모서리** | 상단 2모서리 |

Figma 는 **좌우 14 inset 을 둔 떠 있는 카드**이고, 세로 앵커는 두 프레임이 서로 다르다(37 vs 4) → **앵커 규칙 `확인 불가`**.

> **`DECISION-NEEDED` ⑦** ① Figma 대로 inset 카드로 만든다(= `Sheet` 를 확장하거나 새 표면) / ② 기존 `Sheet`(전폭 하단 고정)를 재사용하고 차이를 등록한다

### ⑧ Book List divider — Figma 내부 불일치

| | divider |
|---|---|
| 컴포넌트 `163:2145` | **3개 전부** |
| 화면 사본 `30:140`(L-1) | **1개** (1–2행 사이만) `[실측 + 픽셀]` |

> **`DECISION-NEEDED` ⑧** 컴포넌트를 기준으로 **모든 행 사이 divider** (권고) / 화면 사본대로 1개만

### ⑨ scrim 값

`[픽셀]` Figma Library scrim ≈ `rgba(0,0,0,0.34)` ↔ 현행 `--color-scrim` `#29293a3b` (= `rgb(41,41,58)/0.231`).

> **`DECISION-NEEDED` ⑨** Figma 실측값으로 `--color-scrim` 을 교체 / 현행 유지 + 차이 등록. **교체하면 Stage 2·3 의 기존 Sheet 5종이 모두 어두워진다** — 영향 범위가 Library 밖이다

### ⑩ Book List 컨테이너 면 — `ListGroup` 재사용 시 어긋남

| | 면 | 그림자 |
|---|---|---|
| Figma `30:140` `[실측]` | `#ffffffbd` **74%** | `0 6 4 ink8%` + inset = **`--shadow-bubble`** |
| 현행 `ListGroup` | `--color-surface-strong` **90%** | `--shadow-glass-rest` (3겹) |

> **`DECISION-NEEDED` ⑩** ① Library 용 `ListGroup` 변형(`tone="glass"`)을 추가해 Figma 를 따른다 / ② 기존 `ListGroup` 을 그대로 쓰고 차이를 등록한다
> ⚠️ ① 을 택하면 `--shadow-glass-rest`(3겹, 아래 번짐 **77**) → `--shadow-bubble`(1겹, 아래 10) 로 바뀌므로 **`R-SHADOW-1` 의 inset 계산을 다시 해야 한다.**

---

## 8. Variant / State

### 8.1 Figma 에 있는 것

| 상태 | Figma | 노드 |
|---|---|---|
| Library 기본 | ✓ | `30:74` |
| Reading now 있음 | ✓ | `145:1132` |
| 책 상세 오버레이 | ✓ | `145:1450` + `145:1085` |
| "See all" 오버레이 | ✓ | `163:1807` + `163:2347` |
| 캐러셀 `Default` / `Selected` | ✓ | `113:1992` / `113:1991` (후자 미사용) |
| 탭바 `Active=Library` | ✓ | `25:51` |

### 8.2 Figma 에 **없는** 것 — 전부 `C-13` 대상 (§7 ③)

| 상태 | Figma | 비고 |
|---|---|---|
| **Loading / Skeleton** | **없음** | 섹션 3개 각각 |
| **Empty — Favorites 0건** | **없음** | ② 결정에 종속 |
| **Empty — 보유/증정 0건** | **없음** | |
| **Empty — Finished together 0건** | **없음** | |
| **Empty — 전체 0건** | **없음** | |
| **Error / Offline / Retry** | **없음** | |
| **검색 결과 없음** | **없음** | `/library/add` 자체가 Figma 에 없음 |
| **증정 대기(`gift_pending`)** | **없음** | `BookOwnershipSchema` 에 값은 있으나 UI 없음 |
| **미보유(`favorite_only`) 표식** | **없음** | 캐러셀/목록에 ownership 구분 표식이 Figma 에 **전혀 없다** |
| **캐러셀 1~2권만 있을 때** | **없음** | Figma 는 항상 3-up |
| **Book List 4행 초과** | **없음** | 더 보기 UI 없음 |
| 저장 토글 pending/실패 | **없음** | Home 과 동일 처리 추정 |

> ⚠️ **ownership 표식이 Figma 에 없다는 점이 가장 큰 공백이다.** `D-7` 의 4기능 중 "보유책 · 증정책" 구분이 **화면에서 표현될 방법이 Figma 에 없다.** 섹션 분리로 표현하는 것이 현행 Spec 의 해석이나, L-1 의 섹션은 "Our curated shelf / Favorites / Finished together" 이지 "보유/증정"이 아니다. **`DECISION-NEEDED`**

---

## 9. Responsive

Figma 는 **393 단일 폭**이다. 그 밖은 Stage 0 `#12`(`--bp-md` 600 / `--bp-lg` 1024, 600↑ 최대 480 앱 컬럼 가운데 정렬)에서 도출한다.

| 폭 | content 폭 | 캐러셀 3-up 성립? | 비고 |
|---|---|---|---|
| **320** | 320 − 48 = **272** | **불가** — 표지 3×107 = 321 > 272 | **문제 지점** |
| **393** (Figma) | 345 | ✓ (3번째가 0.92 클립) | 기준 |
| **600+ / 앱 컬럼 480** | 480 − 48 = **432** | 여유 160 | |
| 1024 | 480 컬럼 동일 | 동일 | |

**320 해소안 (RECOMMENDED, 승인 필요):**
Figma 의 shelf 그리드는 **퍼센트 기반**(열 offset 35.06% / 69.25%, 폭 31.61% / 30.74% / 30.75%)이고 표지만 107 고정이다. 퍼센트를 그대로 따르면 **표지 폭 = content × (107/345)** 로 비례 축소된다.

| 폭 | 표지 폭 | 표지 높이(7:10 유지) |
|---|---|---|
| 320 | **84.3** | 119 |
| 393 | 107 | 151 |
| 480 컬럼 | **134** | 189 |

- 캡션 타이포(12/11)는 축소하지 않는다(11px 하한, `#10-②`).
- Book List 행은 유동 폭이라 320 에서도 그대로 동작한다. 단 메타 2열(`"{n} sessions · finished {date}"` + 우측 meta)이 272 폭에서 겹칠 수 있다 — **평점 미렌더(①-a)면 문제 없음**.
- 제목 행: "Library"(28 Heavy) + chip 138 = 320 에서 여유 있음.

> **`DECISION-NEEDED`** 320 에서 ① 비례 축소(권고, 퍼센트 그리드 근거) / ② 표지 107 고정 + 2.5-up peek / ③ 320 미지원
> **`DECISION-NEEDED`** 480 컬럼에서 ① 비례 확대(134) / ② 107 고정 + 더 많은 항목 노출

---

## 10. Contract 영향 — **필요 목록만** (정의하지 않음)

`packages/contracts` 에 **새로 필요한 것**. 실제 schema 는 plan-agent / development-agent 소관이다.

### 10.1 신규 필요

| 분류 | 이름(제안) | 필요 이유 | 종속 결정 |
|---|---|---|---|
| schema | **`LibraryBook`** | 서재 항목 공통 표현. `saved-book.ts` 주석이 *"Library 라운드에서 `LibraryBook` 에 흡수"* 로 예고 | — |
| schema | **`LibrarySection` / `LibraryOverview`** | 섹션 3개(+ Reading now)를 한 번에 돌려주는 화면 조회 | ①-b, ② |
| schema | `BookSessionHistory` | Book List 행 = `{n} sessions · finished {date}` | — |
| schema | **`SavedBookList`** (커서 페이지네이션) | "Favorites / My Saved" 캐러셀 + "See all" | **②** |
| schema | `FinishedBookList` (커서 페이지네이션) | "Finished together" + "See all" | — |
| enum | **`LibrarySectionKey`** | `curated` / `favorites` / `finished` (+ `owned`?) | **②**, §8.2 ownership |
| enum | `GiftRequestStatus` (6종) | `/library/gift-requests` | ③ |
| schema | `AddOwnBookRequest` | `/library/add` (FR-23). `SaveBookTargetSchema` 와 **같은 판별 구조** → 공용화 대상 | ③ |
| schema | `GiftRequest` + `CreateGiftRequest` | FR-22 증정 신청 | ③ |
| error code | `GIFT_REQUEST_DUPLICATE` | 중복 신청 | ③ |
| error code | `BOOK_ALREADY_OWNED` (필요 시) | 직접 등록 중복 | ③ |

### 10.2 **채택하지 않으면 불필요**한 것

| 필드 | 종속 |
|---|---|
| `LibraryBook.averageRating` | ①-a (평점) |
| `ReadingProgress` (`3 of 5 nights`, 진행률) | ①-b (Reading now) |
| 서재 항목 다중 선택 상태 | ⑤ (`Selected` 변형) |

### 10.3 기존 재사용

`BookSummarySchema`(`books/search.ts`) · `BookOwnershipSchema`(`owned`/`gifted`/`gift_pending`/`favorite_only` — **이미 존재**) · `SavedBookSchema` · `PaginationSchema` · `IdSchema` · `IsoDateTimeSchema`.

### 10.4 Backend 요구 (`BACKEND_INTEGRATION_PENDING` 후보)

서재 섹션 집계 · 저장 목록 영속 · 완독 이력 집계 · 증정 신청 접수/배송 상태 · 직접 등록 책의 표지 부재 처리.

---

## 11. 내가 추정한 것 / 확인 못 한 것

| | 내용 |
|---|---|
| `[추정]` | `Book List` divider 1개는 화면 사본의 **누락**이고 컴포넌트(3개)가 원본이다 |
| `[추정]` | 캐러셀 dots 3개 = **3페이지 × 3권 = 최대 9권**. 표지 3장이 345 를 정확히 채우는 산술에 근거. Figma 가 명시하지 않음 |
| `[추정]` | L-3 의 섹션 제목 중복("Finished together" ×2)은 L-1 의 "Favorites" 로 수정되기 **전** 복사본이다. **생성 순서 확인 불가** |
| `[추정]` | 시트 헤더의 24×24 아이콘 = `flip_to_back` (Home 카드와 같은 슬롯·좌표) |
| **확인 불가** | **prototype reaction 전체** — "See all" 목적지, 행 탭 목적지, 오버레이 열림/닫힘 전환, 뒤로 가기 |
| **확인 불가** | `This Week's Shelf` 의 선언 gap 8 ↔ 실측 dots y=207 (차 15) 의 원인 |
| **확인 불가** | 오버레이의 세로 앵커 규칙 (L-2 하단 여백 37, L-3 은 4) |
| **확인 불가** | `Property 1=Selected` 의 의도된 용도 |
| **확인 불가** | L-1 / L-2 / L-3 중 **어느 것이 최신 의도인지** (노드 ID 순서와 자식 ID 순서가 엇갈린다) — **`DECISION-NEEDED`: 기준 화면 택1** |
| **확인 불가** | 표지 이미지 에셋(`asset/book-cover` 등 실제 책 표지)의 **라이선스·사용 가능 여부**. 실제 상용 그림책 표지(*The Most Magnificent Thing*, *Grumpy Monkey*, *After the Fall*, *Where the Wild Things Are*)가 그대로 들어 있다 → **법적 확인 필요** |

**이 문서에 "이게 더 낫다"는 내 판단으로 넣은 UI 는 없다.** 모든 권고는 `DECISION-NEEDED` 또는 `RECOMMENDED` 로 분리했다.
