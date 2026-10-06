# Stage 3 Library Design Spec

Status: **DRAFT** — 승인 대기 (작성 2026-10-06, design-agent)

**Based on**
- Figma `YWWu3AFEJpRxvw0T5klq0k` page `16:2` section `31:204` — L-1 `30:74` · L-2 `145:1132` · L-3 `163:1669` (+ 오버레이 `145:1450`/`145:1085` · `163:1807`/`163:2347`), page `8:2` 컴포넌트 `113:1992` · `113:1991` · `163:2145` · `163:1898` — **전건 2026-10-06 재실측**
- `docs/plans/stage-3-library-plan.md` (`H-1`~`H-13`)
- `docs/design/stage-3-library-figma-audit.md` (전수 대조, 2026-10-06)
- `docs/decisions/stage-3-approvals.md` **§14 · §15 · §16 · §17 · §18 · §19** — `L-D1`~`L-D4`, `L-OPEN-01`~`22` **전건 결정 완료**

**이 문서가 대체하는 것**
`docs/design/stage-3-design-spec.md` §2.7 · §2.8 의 Library 구조. 같은 패스에서 `AD-S3-4`(삭제) · `AD-S3-6`·`7`·`8`(무효) · `AD-S3-19`(철회) · `AD-S3-5`(보완) 를 정리하고 `AD-L-01`~`AD-L-08` 을 등록했다 (approvals §19.1 ⑤).

**표기**
`[실측]` = 이 패스에서 Figma MCP 로 직접 읽은 값 · `[픽셀]` = 렌더 픽셀 프로브 · `[추정]` = 근거 있는 추론 · `확인 불가` = Figma 에서 읽을 수 없음 · `CONFIRMED (ID)` = 사용자 결정 · `RECOMMENDED` = design-agent 제안(**승인 필요**).

> **이 문서에는 "이게 더 낫다" 는 내 판단으로 넣은 UI 가 없다.** Figma 에 없는 것(진입점 · 상태 화면 · 반응형 · 토큰 신설)은 모두 승인된 예외(`C-13` ② · Stage 0 `#22` · `#12` · `L-OPEN-*`)에 근거하며, 그 밖의 제안은 §11 에 **승인 대상**으로 분리했다.

---

## 0. 확정 입력 — 재론하지 않는다

| ID | 결정 |
|---|---|
| `L-D1` | 저장한 책(`★ Save`)의 표면 = **`Favorites` 섹션** (`163:1632`/`163:1633` + 캐러셀 `145:779` + "See all") |
| `L-D2` | `Reading now` **Figma 대로 구현** |
| `L-D3` | `Rated 4.5` **Figma 대로 렌더** |
| `L-D4` | 상용 그림책 표지 에셋 — 지금은 그대로, **Stage 8 배포 전 교체** (`P3-BIP-19`) |
| `L-OPEN-01` | 기준 = **L-1 + `Reading now` 합성**, 순서 `Reading now → Our curated shelf → Favorites → Finished together` |
| `L-OPEN-02` | `Selected` 변형(`113:1991`) **구현하지 않는다** |
| `L-OPEN-03` | 시트 ActionBar **Figma 대로 포함** (`AD-S3-19` 철회) |
| `L-OPEN-04` | 오버레이 = **좌우 inset 14 · radius 28 떠 있는 카드**, 세로는 **내용 높이 + 아래 여백 고정** |
| `L-OPEN-05` | Book List divider **모든 행 사이** |
| `L-OPEN-06` | scrim **`rgba(0,0,0,0.34)` 로 전역 교체** |
| `L-OPEN-07` | 목록 상자 **74% + `--shadow-bubble`** |
| `L-OPEN-08`·`10` | 연한 회색 **Figma 유지**, `--color-fg-tertiary` → `--haru-ink-400`, **새 가값 ID** |
| `L-OPEN-09` | **`--radius-media: 12px` 신설** (radius 6단계 → 7단계, Stage 0 `#10-②` 개정) |
| `L-OPEN-11` | 320px **표지 비례 축소**, **캡션 타이포는 축소하지 않는다** |
| `L-OPEN-12` | `/library/add` · `/library/gift-requests` 진입점 **design-agent 명세** (`C-13` ②) |
| `L-OPEN-13` | 상태 화면 **design-agent 명세** |
| `L-OPEN-14` | `owned`/`gifted` **구분 표식을 만들지 않는다** |
| `L-OPEN-15` | `Favorites` 캡션 2행 = `LibraryBook.capability`, 없으면 저자명 |
| `L-OPEN-16`·`17` | 진행률은 **서버가 `progressRatio` 를 직접** 준다. `plannedNights` 없으면 **회차 문구 생략**, 그 텍스트는 **비대화형** |
| `L-OPEN-18` | `averageRating` = **우리 아이 평점만** |
| `L-OPEN-19` | "See all" **세 섹션 모두** |
| `L-OPEN-20` | 저장/해제 API 응답 **현행 유지(`SavedBook`)** → Library 는 **목록 재조회**로 반영 |
| `L-OPEN-21` | `Finished together` **4행 고정 + "See all" 전체 목록**, 섹션 안 "Show more" **없음** |
| `L-OPEN-22` | `averageRating: null` → **meta 를 비우고 좌측 정렬 유지** |
| `D-3` (§13.10) | **카드와 시트의 `Start Session` 모두 비활성(`aria-disabled`)** |

---

## 1. 대상 화면 (Figma node → route)

| # | 화면 / 레이어 | route | Figma | 상태 |
|---|---|---|---|---|
| 1 | **Library (합성 기준)** | `/library` (Tab) | **L-1 `30:74`** + L-2 `145:1145`·`145:1142` | `CONFIRMED (L-OPEN-01)` |
| 2 | **`LibraryShelfSheet`** ("See all" ×3) | `/library` 위 오버레이 (+ `D-17` Mock route) | `163:1807` scrim + `163:2347` ← 원본 `163:1898` `type=shelf` | `CONFIRMED (Figma)` |
| 3 | **`BookDetailSheet`** | `/library` 위 오버레이 (+ `D-17` Mock route) | `145:1450` scrim + `145:1085` ← `Prompt Card/Home` | `CONFIRMED (Figma)` |
| 4 | **Prompt 뷰** (책별 Prompt, FR-20) | `BookDetailSheet` **안의 뷰 전환** (route 없음) | `86:482` | `stage-3-design-spec.md` §2.5 유지 |
| 5 | **`/library/add`** (FR-23) | `/library/add` (Stack) | **Figma 없음** | `C13 ② (L-OPEN-12)` — §7 |
| 6 | **`/library/gift-requests`** (FR-22) | `/library/gift-requests` (Stack) | **Figma 없음** | `C13 ② (L-OPEN-12)` — §7 |
| 7 | 진입점 블록 `LibraryEntryActions` | `/library` 하단 | **Figma 없음** | `C13 ② (L-OPEN-12)` — §7, `AD-L-06` |
| 8 | 상태 화면 (Skeleton · Empty×4 · Error · Offline · Retry) | 〃 | **Figma 없음** | `C13 ② (L-OPEN-13)` — §7.4, `AD-L-07` |

**채택하지 않는 Figma 자산** — `113:1991` `Property 1=Selected`(인스턴스 0건, `L-OPEN-02`) · L-2 `145:1156` `My Saved`(`AD-L-02`) · L-3 base 레이어(`AD-L-05`).

**`확인 불가`** — prototype reaction 전부(“See all” 목적지 · 행 탭 목적지 · 오버레이 열림/닫힘 전환 · 뒤로 가기 · 시트 닫기 컨트롤의 글리프). MCP 로 Reactions 가 노출되지 않는다. 흐름은 `stage-3-design-spec.md` §1.2 의 결정(`D-17` · Shelf→Detail 교체 전환)을 승계한다.

---

## 2. 합성 기준 화면 — 전체 실측과 **검산**

### 2.1 plan-agent 실측 검산 결과 — **8/8 일치**

L-2 `145:1141` 자식 y 를 이 패스에서 다시 읽었다 `[실측]`: `0 / 36 / 170 / 206 / 438 / 474 / 706 / 742`.
L-1 `145:928` 자식 y `[실측]`: `0 / 36 / 268 / 304 / 536 / 572`.

| 슬롯 | 블록 | 출처 | h | L-1 y | **+170** | L-2 실측 y | 검산 |
|---|---|---|---|---|---|---|---|
| 1 | `SectionHeader` `Reading now` + `3 of 5 nights` | **L-2 `145:1142`** | 20 | — | **0** | 0 | ✓ |
| 2 | `ReadingNowCard` 345×118 r24 | **L-2 `145:1145`** | 118 | — | **36** | 36 | ✓ |
| 3 | `SectionHeader` `Our curated shelf` + See all | L-1 `163:1624` | 20 | 0 | **170** | 170 | ✓ |
| 4 | Shelf 캐러셀 | L-1 `113:1994` | 216 | 36 | **206** | 206 | ✓ |
| 5 | `SectionHeader` **`Favorites`** + See all | L-1 `163:1632` | 20 | 268 | **438** | 438 (L-2 는 `My Saved`) | ✓ |
| 6 | Shelf 캐러셀 | L-1 `145:779` | 216 | 304 | **474** | 474 | ✓ |
| 7 | `SectionHeader` `Finished together` + See all | L-1 `30:138` | 20 | 536 | **706** | 706 | ✓ |
| 8 | Book List **4행** | L-1 `30:140` | 297 | 572 | **742** | 742 (L-2 는 2행 149) | ✓ |

→ **합성은 창작이 아니다.** `Reading now` 블록(20 + 16 + 118 = 154, 다음 간격 16 → **+170**)을 얹으면 L-2 의 기하와 완전히 일치한다. 합성이 바꾸는 것은 **슬롯 5 의 라벨**(`My Saved`→`Favorites`, `AD-L-02`) · **슬롯 3·5 의 "See all" 복원**(`AD-L-03`) · **슬롯 8 의 행 수**(2→4, `AD-L-04`) 뿐이다.

추가 검산 `[실측]`
- **합성 높이 1039 의 두 경로가 일치한다.** L-1 Frame15 `145:928` = h **869** → `869 + 170 = 1039`. L-2 Frame15 `145:1141` = h **891**(= 742 + 149, 목록 **2행**) → 슬롯 8 을 L-1 의 4행(297)으로 바꾸면 `742 + 297 = 1039`. **두 프레임이 같은 값에서 만난다** ✓
- L-1 Frame15 하단 abs = 66 + 56 + 869 = 991, 탭바 인스턴스 `40:218` abs y = 981 + 42 = 1023 → **32** ✓
- Content 프레임은 345×**973** 이지만 Frame15 하단(925)과 48 의 여백이 남는다 — **Content 높이는 결과값이 아니라 캔버스 여유**다. 구현은 Frame15 하단 → 탭바 **32** 규칙만 쓴다.

### 2.2 합성 화면 기하 (393 기준, abs y)

```
Screen/Status Bar            0 – 56                                  [실측 30:75]
Content  x=24 w=345 y=66
├ 제목 행                     y=0    h=40     (abs 66 – 106)         [실측 30:88]
│   ├ "Library"              x=0  y=3.5  w=95 h=33  28/Heavy 860    [실측 30:89]
│   └ WeekSummaryChip        x=211 y=3   134×34  (L-2 는 138×34)     [실측 30:90 / 145:1137]
└ Frame 15                   y=56   h=1039   (abs 122 – 1161)        [합성, §2.1]
    ├ 1  SectionHeader       y=0    h=20     (abs 122)
    ├ 2  ReadingNowCard      y=36   h=118    (abs 158 – 276)
    ├ 3  SectionHeader       y=170  h=20     (abs 292)
    ├ 4  BookShelfCarousel   y=206  h=216    (abs 328 – 544)
    ├ 5  SectionHeader       y=438  h=20     (abs 560)
    ├ 6  BookShelfCarousel   y=474  h=216    (abs 596 – 812)
    ├ 7  SectionHeader       y=706  h=20     (abs 828)
    └ 8  Book List 4행       y=742  h=297    (abs 864 – 1161)
[신규 AD-L-06] LibraryEntryActions   abs 1177 – 1290   (앞 간격 16 + 행 56×2 + divider 1 = 129)
→ 탭바 상단                   abs 1322                 (마지막 블록 하단 + 32)
```

- **모든 섹션 간격 = 16** (`--space-4`) `[실측, L-1·L-2 공통]`
- **제목 행 → 첫 섹션 = 16** (40 → 56) `[실측]`
- **마지막 블록 → 탭바 = 32** (`--space-8`) `[실측 L-1 규칙 승계]`
- 세로 스크롤 화면이다 (합성 프레임 높이 ≈ 1392 > 뷰포트 852). **스크롤 컨테이너는 `AppShell` 의 뷰포트**(앱 컬럼 **바깥**)이며 Library 는 새 세로 `overflow` 를 만들지 않는다 (`R-SHADOW-1` ①).

### 2.3 Auto Layout / 스크롤 모델

| 영역 | 모델 |
|---|---|
| 페이지 | `AppShell(scroll=auto)` → `AppColumn` → `TabLayout`. 세로 flex, `gap: --space-4`(16) 일정 |
| 제목 행 | `TopBar(variant=large, title="Library", trailing=WeekSummaryChip)` — 기존 컴포넌트 그대로 (`A-23` 아이콘 차이 동일 적용) |
| `ReadingNowCard` | 가로 flex, `align-items: center`, pad 14, gap 14 |
| `BookShelfCarousel` | **가로 scroll-snap 트랙** + `PageIndicator`. 페이지 단위 snap (§3.3) |
| Book List | 세로 `ListGroup` — `overflow` 없음 |
| 시트 | `position: fixed` portal(`document.body`) — 앱 컬럼·스크롤 컨테이너의 클리핑 대상이 아니다 |

---

## 3. 섹션별 기하 · 타이포 · 색 · 그림자

> 모든 값은 **토큰 이름**이다. 토큰이 없으면 §5.2 "신규 토큰" 으로 분리했다.
> ⚠️ **Tier 3 → Primitive 직접 참조 금지** (빌드 규칙 3-4). 아래 Tier 3 토큰은 전부 Tier 2 semantic 을 거치거나 Figma 리터럴이다.

### 3.1 `SectionHeader` — `163:1624` · `163:1632` · `30:138` · `145:1142` `[실측]`

| 항목 | Figma | 토큰 |
|---|---|---|
| 박스 | h **20**, `justify-content: space-between`, **baseline 정렬** | — |
| 제목 | **17 / Bold 700** / `#4a5f5c` | `--text-headline`(17) + `--font-weight-bold` (headline 기본 semibold → **override**) |
| 액션 | **12 / Medium 510** / **`#9aabaa`**, x=306 w=39 y=5 h14 (우측 끝 = 345) | `--text-caption-1`(12) + `--font-weight-medium` + **`--color-fg-tertiary`**(재매핑, §5.2 `LT-1`) |
| 액션(비대화형) | `3 of 5 nights` x=272 w=73 y=5 h14 — **같은 슬롯·같은 타이포** | 〃 (`L-OPEN-17` — **비대화형 텍스트**) |

- 액션 슬롯은 **두 모드**다: `action`(`See all`, `<button>`) / `meta`(`3 of 5 nights`, `<span>`). 둘 다 **우측 정렬 + baseline**.
- `plannedNights === null` → `meta` 자체를 **렌더하지 않는다** (`L-OPEN-17`). 헤더 높이 20 은 유지된다.
- 터치 타깃 44 확장은 §9.2.

### 3.2 `ReadingNowCard` — `145:1145` `[실측 + get_design_context 원문 확인]`

| 항목 | Figma | 토큰 |
|---|---|---|
| 박스 | 345×**118**, padding **14**, gap **14**, radius **24**, `overflow: clip` | `--space-3-5` / `--radius-surface`(22, 기존 흡수) — **높이는 고정하지 않는다**(§9.1 reflow), 118 은 결과값 |
| 면 | `glass-fill-strong` `#ffffffe5` | `--color-surface-strong` ✓ |
| 그림자 | `0 6px 4px rgba(94,115,112,.08)` + inset `0 1.5px 0 #fff(.9)` + inset `0 -1px 0 ink(.05)` — **1겹** | **`--shadow-bubble`** ✓ (Effect Style 이름은 `HARU/Shadow Rest`(3겹)지만 **인스턴스는 1겹만 렌더**한다 — `V-10` 과 동일 상황) |
| 표지 | **64×90**, radius **10**, `0 6px 14px ink 28%` | `BookCover size="xl"` (§4.2) + `--shadow-cover` ✓ |
| 텍스트 열 | x=92 w=239 h=63, **내부 gap 3** | `--space-0-5`? → **3 은 스케일에 없다**. `--reading-now-text-gap: 3px` (Tier 3 리터럴, §5.2 `LT-8`) |
| 제목 | 16 / Bold / `#4a5f5c`, 1줄 | `--text-callout`(16) + bold + `--color-fg-primary` |
| 부제 | 12 / Regular / **`#7d9291`** (= secondary, tertiary 아님) | `--text-caption-1` + `--color-fg-secondary` (가값 `P-01`) |
| 진행 바 | h **7**, radius 4, track `rgba(94,115,112,.14)`, fill `#85bfb6`, 채움 **132 / 239** | `ProgressBar` 재사용 + Tier 3 높이 override (§5.2 `LT-9`), track 은 `--color-progress-track`(12%) **흡수**(§5.3) |
| 메타 | 11.5 / **Medium 510** / `#9aabaa` | `--text-caption-2`(11, 기존 흡수) + medium + `--color-fg-tertiary` |

- 세로 배치: 표지·텍스트 열 모두 **중앙 정렬** — (118 − 90)/2 = 14 ✓, (118 − 63)/2 = 27.5 ✓. `align-items: center` 로 표현되며 패딩 14 와 일치한다.
- 좌우: 14 + 64 + **14** + 239 + **14** = 345 ✓
- 부제 문구 `Ashley Spires · Self-Direction` `[실측]` — **Figma 자신이 `Self-Direction`(#14 표시 라벨)을 쓴다.** 캐러셀 캡션의 `Resilience`/`Confidence` 와 **같은 파일 안에서 일관되지 않다** → §11 `LN-4`.
- **`overflow: clip` 주의** — Figma 가 카드에 clip 을 걸어 **표지 그림자 아래쪽 6px 이 잘린다**(표지 하단 104 + 번짐 20 = 124 > 118). `R-SHADOW-1` 대상이므로 §8.3 에서 처리 방식을 분리했다.

### 3.3 `BookShelfCarousel` / `BookShelfItem` — `113:1992` · `113:1971` `[실측]`

| 항목 | Figma | 토큰 |
|---|---|---|
| 블록 | 345×**216** (Shelf 192 + **15** + dots 7 + 2) | §5.2 `LT-10` |
| 열 x | **0 / 120.948 / 238.922** = **0% / 35.0574% / 69.2528%** | 퍼센트 그리드 (§10 반응형의 근거) |
| 표지 | **107 × 151** (= 31.0145% × content), radius **12**, `0 6px 14px ink 24%` + inset `0 1px 0 #fff(.5)` | `BookCover size="lg"` + **`--radius-media`(신설 12)** + `--shadow-cover`(28% 흡수, Δ4%) |
| 3번째 열 | 238.922 + 107 = **345.92 → 345 를 0.92 넘는다** | §8.2 처리 |
| 캡션 제목 | y=158, **12 / Semibold 590** / `#4a5f5c`, `nowrap` | `--text-caption-1` + semibold + `--color-fg-primary` |
| 캡션 2행 | y=179, **11 / Regular** / **`#9aabaa`**, `nowrap` | `--text-caption-2` + `--color-fg-tertiary` |
| 캡션 gap | 표지→제목 **7**, 제목→캡션 **7** | `--space-2`(8) 기존 흡수(Δ+1) — 블록 높이는 `LT-10` 이 고정 |
| dots | y=**207** h7 — active **20×7** `#5e7370`, inactive **7×7** ink 30%, gap **6**, radius 4, **가운데 정렬**(x=149.5, 그룹 폭 46) | `PageIndicator` 재사용 (`--indicator-*`) ✓ **Figma 와 완전 일치** |

- ⚠️ **선언 gap 8 ↔ 실측 오프셋 15.** auto-layout 은 gap 8 을 선언하지만 `Pagenation` 의 실측 y 는 **207**(192 + 15) 이다. 원인 `확인 불가`. **실측 207 을 구현한다** → `--library-shelf-indicator-gap: var(--space-4)`(16, Δ+1 흡수).
- **캡션 2행의 데이터** (`L-OPEN-15`) = `LibraryBook.capability` 의 **#14 표시 라벨**, `null` 이면 **저자명**. `curated` 와 `favorites` 캐러셀 모두 같은 규칙이다 (Figma `145:779` 는 `113:1994` 와 override 0건 동일 인스턴스라 저장 책의 캡션을 정의하지 않는다).
- **캡션 2행이 1줄에 안 들어간다** → §6.3 (`AD-S3-5` 보완).
- **snap 단위 = 페이지(3권)** `RECOMMENDED` — 근거: dots 가 **3개**이고 active 가 **첫 번째**다 `[실측]`. 열 offset 이 페이지 안에서만 성립하는 퍼센트 값(35.06%/69.25%)이므로 항목 단위 snap 은 Figma 기하를 깨뜨린다. 페이지 수는 `ceil(items / 3)` 로 **데이터에서 파생**한다 — Figma 의 "dots 3개 = 9권" 은 `[추정]` 이므로 고정값으로 쓰지 않는다.

### 3.4 Book List 컨테이너 — `30:140` / 컴포넌트 `163:2145` `[실측 + get_variable_defs]`

| 항목 | Figma | 토큰 |
|---|---|---|
| 박스 | 화면 사본 **345** / 컴포넌트 **328**(시트 안), radius **24** | 유동 폭. `--radius-surface`(22) 기존 흡수 |
| 면 | Figma Variable **`glass-fill` `#ffffffbd`(74%)** `[get_variable_defs 확인]` | **`--color-surface-glass`** — `ListGroup` **신규 변형**(`L-OPEN-07`) |
| 그림자 | Effect Style `HARU/Shadow Rest` 바인딩, **인스턴스는 1겹 렌더** | **`--shadow-bubble`** — `ListGroup` 신규 변형 (`L-OPEN-07`) |
| divider | 1px `rgba(94,115,112,.10)`, **모든 행 사이 3개**(컴포넌트 `163:2111`·`163:2122`·`163:2133`) | `--color-divider`(ink600 **12%**) **흡수**(Δ2%, §5.3). 위치는 `L-OPEN-05` = 모든 행 사이 ✓ 현행 `ListGroup` 동작과 일치 |
| backdrop | 74% 반투명 면 | `--material-blur-md` + `prefers-reduced-transparency` fallback (현행 `ListGroup` 동작 유지) |

- **기존 사용처(Settings)의 외형은 바꾸지 않는다** (`L-OPEN-07`). `ListGroup` 기본값 = 현행 `--color-surface-strong` + `--shadow-glass-rest`, Library 는 `tone="glass"`.
- ⚠️ 발견: Stage 2 가 `ListGroup` 면·그림자를 **`RECOMMENDED`("Figma symbol 에 컨테이너 없음")로 추측**했는데, 실제 근거는 **화면 사본 `30:140`** 에 있고 그 값은 **74% + 1겹**이다. 즉 현행 기본값이 Figma 와 다르다 → §11 정규화 이슈.

### 3.5 Book List 행 — `30:141` / `163:2100` `[실측 + get_design_context 원문]`

| 항목 | Figma | 토큰 |
|---|---|---|
| 행 | `padding: 13 16`, gap **12**, 높이 **74** | `--space-3`(12, 13 흡수) + `--space-4`(16). 높이는 **`--book-list-row-height-min: 74px`**(Tier 3 신설, §5.2 `LT-11`) → `AD-S3-17`(최소 74, 내용에 따라 증가)을 **정확히 만족** |
| 썸네일 | **34 × 48**, radius **7** | `BookCover size="sm"` + `--radius-control`(8, 기존 흡수) |
| 텍스트 열 | x=62, w 240(화면)/223(컴포넌트), **내부 gap 2** | 유동 폭 + `--space-0-5`(2) ✓ 현행 `ListRow` 와 일치 |
| 제목 | **14 / Semibold 590** / `#4a5f5c`, 1줄 | **`--text-subheadline`(15)** — §3.3 흡수표 `14 → subheadline` **CONFIRMED (#10-②)**. ⚠️ 현행 `ListRow` 기본값은 `--text-footnote`(13) → **title 타이포 슬롯 추가**(§4.1) |
| 메타(좌) | 11.5 / Regular / `#9aabaa` — `{n} sessions · finished {date}` | `--text-caption-2`(11 흡수) + `--color-fg-tertiary` |
| 메타(우) | `Rated ` **11.5 Regular** + `4.5` **12 Bold**, 둘 다 `#9aabaa`, 우측 정렬(`justify-between`) | 2-스타일 합성 — `--text-caption-2` + `--text-caption-1` + bold, 색 동일 |
| chevron | **15×15**, stroke `#9AABAA`, stroke-width **1.375**, linecap round, x=314(우 inset 16) | Lucide `chevron-right` + `--size-icon-sm`(16 흡수) + `--color-fg-tertiary` |

- `averageRating === null` → **meta(우) 를 비우고 좌측 메타의 좌측 정렬을 유지**한다 (`L-OPEN-22`). 빈 자리에 대체 문구를 넣지 않는다.
- **`ownership` 표식 없음** (`L-OPEN-14`) — 행에 `owned`/`gifted`/`gift_pending` 를 드러내는 요소를 **만들지 않는다**. `BookOwnershipSchema` 는 contract 에 남는다.
- ⚠️ Figma 내부 불일치: 화면 사본 `30:140` 은 divider **1개**, 컴포넌트 `163:2145` 는 **3개** → `L-OPEN-05` 로 **컴포넌트(3개)** 채택 ✓.

### 3.6 `WeekSummaryChip` — `30:90` / `145:1137` `[실측]`

변경 없음 (plan §15.3). 134×34(L-1 `2Week streak`) / 138×34(L-2 `2 Week streak`), padding 14/9, gap 6, radius 100, `--color-surface-glass` + `--shadow-bubble`, 라벨 13/Semibold `--color-fg-primary`, 아이콘 13×13 **채워진 별** `fill #D0CCA1`.
→ 구현은 `haru:session-history` 를 쓰며 이는 **기등록 차이 `A-23`** 다. Library 에도 **같은 차이가 그대로 적용**된다 (신규 결정 아님). `A-23`-icon 결정(approvals §13.2, Figma SVG 교체)이 적용되면 Library 도 함께 바뀐다.

### 3.7 `LibraryShelfSheet` 내부 — `163:1898` `type=shelf` `[실측]`

```
symbol 163:1898  364 × 425   (L-3 인스턴스 163:2347 = 364 × 426, x=14)
├ 163:2045 헤더      (18, 18)  329×26   Cardtitle + "Our curated shelf" (x=5, 149×21)
├ 163:2256 Book List (18, 56)  328×299  ← Book List 인스턴스, 74pt 행 4
└ 163:1916 Button/card (18, 367) 329×45  ← ★ Save(87×45) + Start Session
                               하단 여백 425 − 412 = 13
```

| 항목 | Figma | 토큰 |
|---|---|---|
| 카드 | 364×425, radius **28**, 좌우 inset **14** | `--radius-card`(28) ✓ · `--sheet-inset-inline: var(--space-3-5)`(14, 신설) |
| padding | 좌우 **18**(= 364−18−328), 상 **18**, 하 **13** | `--activity-card-pad`(18) ✓ · 하단은 **`--activity-card-pad-bottom`(16)** 재사용 `RECOMMENDED` (Δ+3, §11) |
| 행 간격 | 헤더→목록 **12**, 목록→ActionBar **12** | `--activity-card-row-gap`(12) ✓ |
| 헤더 | 329×26, 제목 17/Bold, 우상단 **24×24** 아이콘 슬롯 | `Sheet` 헤더(`title` + `trailing`) — `trailing` = **닫기 `IconButton`**(`stage-3-design-spec.md` §2.8 유지). Figma 글리프는 `확인 불가`(`Cardtitle` 상속, `[추정]` `flip_to_back`) |
| 목록 | `Book List` 인스턴스 328×299 | `ListGroup tone="glass"` + `BookListRow` (§3.4·§3.5) |
| ActionBar | 329×45 — ★ Save **87×45** + Start Session | `--activity-card-action-size`(45) · `--activity-card-save-size`(87) · `--activity-card-action-gap`(8) ✓ 기존 토큰 전부 존재 |
| `Start Session` | — | **비활성 `aria-disabled`** `CONFIRMED (D-3, approvals §13.10)` → `AD-S3-16` |
| ★ Save | — | Home 과 **같은 `SaveButton`**(`G-14` 저장 상태 포함) |
| 폭 | L-2 인스턴스 **365**(inset 14/14) ↔ L-3 **364**(14/15) ↔ Home 카드 **365** | **365 = 393 − 28 채택**(좌우 14 균등). L-3 의 364 는 **1px 저작 잔차** `[추정]` |

- **grabber 없음** — Figma 떠 있는 카드에 grabber 가 없다. `Sheet variant="inset-card"` 는 grabber 를 렌더하지 않는다.
- **목록 스크롤**: "See all" 은 **전체 목록 + 커서 페이지네이션**(`L-OPEN-21`)이므로 4행을 넘는다 → 시트 본문이 스크롤한다(`.haru-sheet__content { overflow-y: auto }`, **기존 선언**). 그 안의 `ListGroup` 그림자가 잘리므로 §8.2 inset 을 적용한다.

### 3.8 `BookDetailSheet` 내부 — `145:1085` `[실측]`

- `Prompt Card/Home` 인스턴스 **365 × 376.78**, x=14 — Home 활동 카드 `163:2649` 와 **폭·높이·자식 구성이 동일**하다 `[실측]` → **`ActivityOptionCard`(context=`library`) 재사용**, `stage-3-design-spec.md` §2.9 유지.
- 구성: `Cardtitle` / 표지 58×82 + 제목 + 저자 + 이유 / `PromptPill` ×4 / `Button/card`(★ Save + Start Session).
- 코칭 문장(Prompt 뷰)은 **같은 시트 안 뷰 전환** — 시트 중첩 금지(scrim 2겹 방지), `stage-3-design-spec.md` §2.5 유지.
- 떠 있는 카드 기하(inset 14 · radius 28 · 세로 앵커)는 §3.9 와 동일하다.

### 3.9 떠 있는 시트의 세로 앵커 — `L-OPEN-04` `[실측]`

| | 카드 abs top | 카드 h | 카드 abs bottom | **뷰포트(852) 하단까지** |
|---|---|---|---|---|
| L-2 `145:1085` | 438 (= Deemed −8 + 446) | 376.78 | 814.78 | **37.22** |
| L-3 `163:2347` | 421.89 | 426 | 847.89 | **4.11** |

- 두 값은 **어떤 규칙으로도 설명되지 않는다**: bottom 고정(37.22 ≠ 4.11) · top 고정(438 ≠ 421.89) · center 고정(626.4 ≠ 634.9) 모두 불일치 → **`확인 불가`**.
- `L-OPEN-04` 결정: **높이는 내용, 아래 여백은 고정.** 값은 design-agent 가 실측 근거로 제안하고 **37 · 4 중 하나를 그대로 쓰지 않는다.**

> **제안 (`RECOMMENDED` — 승인 필요): 아래 여백 = `calc(var(--space-3-5) + var(--layout-safe-bottom))` = 14 + safe-area**
>
> 근거
> 1. **Figma 가 단 하나 명확하게 말하는 inset 은 좌우 14 다** — L-2·L-3 가 **둘 다 x=14** 로 일치한다 `[실측]`. 세로만 흔들린다.
> 2. 떠 있는 카드를 **좌·우·아래 같은 값(14)으로 띄우면** Figma 가 좌우에서 보인 처리와 일관되고, 흔들리는 세로 값을 임의로 고르지 않는다.
> 3. **14 는 Figma 두 값의 사이(4.11 ~ 37.22)** 에 있다 — 어느 한쪽 사본을 정답으로 승격하지 않는다.
> 4. `--space-3-5`(14) 는 **기존 토큰**이다. 신규 토큰이 필요 없다.
> 5. `--layout-safe-bottom` 가산은 홈 인디케이터와의 충돌을 막는다 (`D-1` 의 overhang 실측 선례).
>
> 최대 높이 `RECOMMENDED`: `calc(100dvh - var(--space-10) - var(--sheet-inset-block-end))` — 상단 40 은 scrim 이 반드시 보이게 남긴다. Figma 인스턴스(≈426)는 이 상한에 걸리지 않으므로 **긴 목록에서만 작동**한다.

### 3.10 scrim — `145:1450` / `163:1807` `[픽셀]`

- L-1(비오버레이) ↔ L-2(오버레이) 동일 좌표 **7점** 최소제곱: `1−α ≈ 0.657 / 0.645 / 0.678`, `S ≈ 0` → **`rgba(0, 0, 0, 0.34)`**. 블러 없음(표지 가장자리가 선명하다).
- `CONFIRMED (L-OPEN-06)` — `--color-scrim` 을 **전역 교체**한다. 파급은 §12.

---

## 4. 컴포넌트 — 재사용 / 확장 / 신규

plan §9.2 의 분류를 **검증**했다. 결론: **분류는 맞다.** Shared UI 신규는 **`SectionHeader` 1건**뿐이고, 확장 4건 중 2건(`ListRow`·`ListGroup`)은 **소스 주석이 이미 "Stage 3" 로 예고**하고 있다. 아래 표의 `정정` 열이 내가 검증 중에 고친 항목이다.

### 4.1 Shared UI (`packages/ui`)

| 컴포넌트 | 처리 | 내용 | 근거 | 정정 |
|---|---|---|---|---|
| **`SectionHeader`** | **신규 (Shared UI 유일)** | `title`(17/Bold) + `action?`(`{label, onPress}` → `<button>`) \| `meta?`(문자열 → `<span>`), `space-between`, baseline. **액션 hit-area 44 확장**(§9.2) | `163:1624`·`163:1632`·`30:138`·`145:1142`·`145:1153`·`145:1156`·`145:1159` + 시트 헤더 — **7곳** `[실측]` | `action` 과 `meta` **두 모드**가 필요하다 (plan 은 `action` 만 기술) — `3 of 5 nights` 는 `L-OPEN-17` 로 **비대화형**이다 |
| `ListRow` | 확장 | **`media`**(표지 34×48) · **`meta`**(우측 보조) 슬롯 + **`titleVariant`**(기본 `footnote` 유지) | 소스 주석 `ListRow.tsx:7` *"`media`·`meta` 슬롯은 Stage 3 이다"* | **`titleVariant` 추가 필요** — Figma Book List 제목은 **14**(→`subheadline` 15 흡수, §3.3 CONFIRMED)인데 현행 기본값은 `footnote`(13). 기본값을 바꾸면 **Settings baseline 이 변한다** |
| `ListGroup` | 확장 | **`tone`**: `strong`(기본, 현행 유지) \| **`glass`**(`--color-surface-glass` + `--shadow-bubble`) | `CONFIRMED (L-OPEN-07)` · `30:140` `get_variable_defs` = `glass-fill` + `HARU/Shadow Rest` | — |
| `Sheet` | 확장 | **`variant="inset-card"`**: 좌우 inset 14 · radius 28(전체) · grabber 없음 · 아래 여백 §3.9 · pad 18 · gap 12 | `CONFIRMED (L-OPEN-04)` · `145:1085`·`163:2347` `[실측]` | 기존 `bottom`·`full` 의 외형은 **바꾸지 않는다** |
| `Scrim` | **값만 변경** | `--color-scrim` → `rgba(0,0,0,0.34)` | `CONFIRMED (L-OPEN-06)` | 컴포넌트 코드 변경 **0**. 토큰 1줄 (§12) |
| 재사용 (수정 0) | — | `BottomTabBar(Active=Library)` · `TopBar(large)` · `WeekSummaryChip` · **`PageIndicator`**(Figma 완전 일치) · `ProgressBar` · `Button` · `TextField` · `FieldGroup` · `Tag` · `IconButton` · `EmptyState` · `ErrorState` · `Skeleton` · `InlineAlert` · `Surface` · `Text` · `Icon` | plan §15.3 ✓ 검증 완료 | — |

### 4.2 Domain Component (`apps/web/src/entities`)

| 컴포넌트 | 처리 | 내용 | 근거 |
|---|---|---|---|
| `entities/book/BookCover` | 확장 | size **`sm`(34×48)** · **`xl`(64×90)** · **`lg`(캐러셀, 퍼센트 폭)** 추가. 현재 `md`(58) 단일 | 소스 주석 `component/index.css:132` *"`sm`(34)·`lg` 은 서재 화면이 생길 때 추가"* `[실측 코드]` |
| `entities/book/BookShelfItem` | **신규** | 표지(`lg`) + 제목 12/Semibold + 캡션 11/Regular, gap 7, `nowrap` | `113:1971` `[실측]` |
| `entities/book/BookShelfCarousel` | **신규** | 페이지 단위 가로 scroll-snap 트랙 + `PageIndicator`. **`R-SHADOW-1` 대상**(§8.2) | `113:1992` `[실측]` |
| `entities/book/BookListRow` | **신규** | `ListRow(media=BookCover sm, meta=Rated, titleVariant=subheadline, trailing=chevron)` 래퍼 | `163:2100`·`30:141` `[실측]` |
| `entities/library/ReadingNowCard` | **신규** | §3.2 | `145:1145` `[실측]` |
| `entities/library` query | 확장 | `libraryKeys.overview`·`list(filter)`·`giftRequests`, `useLibraryOverview`·`useLibraryList`·`useAddOwnBook`·`useGiftRequests`·`useCreateGiftRequest`·`useBookPrompts` | plan §7.5 |
| `entities/activity-card/ActivityOptionCard` | 재사용 (수정 0) | `BookDetailSheet` 본문 — Figma `145:1085` = Home `163:2649` **동일 규격** | `[실측]` |

### 4.3 Feature Component (`apps/web/src/features/library`)

| 컴포넌트 | 처리 | 내용 |
|---|---|---|
| `LibraryShelves` | 신규 | 4섹션 조립 + 섹션별 상태(§7.4) + 시트 열림 상태 소유 |
| `LibraryShelfSheet` | 신규 | §3.7 — 헤더 + `ListGroup tone=glass` + ActionBar(★ Save + Start Session **비활성**) |
| `BookDetailSheet` | 신규 | §3.8 — `ActivityOptionCard(context=library)` + Prompt 뷰 전환 |
| `LibraryEntryActions` | 신규 | §7.1 — 진입점 2행 (`AD-L-06`) |
| `AddOwnBookForm` | 신규 | §7.2 |
| `GiftRequestList` | 신규 | §7.3 |

### 4.4 Page-only

`pages/library/LibraryPage`(조립) · `AddOwnBookPage` · `GiftRequestsPage`. **Page 에 API 호출·Mock·로직을 넣지 않는다.**

### 4.5 아이콘

| 위치 | 글리프 `[실측 — SVG path 확인]` | 처리 |
|---|---|---|
| Book List 행 끝 | `M5.625 3.125 L10 7.5 L5.625 11.875`, stroke 1.375 round, 15×15 | **Lucide `chevron-right`** |
| `WeekSummaryChip` | 채워진 5각 별 `fill #D0CCA1` 13×13 | 기존 차이 `A-23` (approvals §13.2 결정 적용 대상) |
| 시트 헤더 우상단 | `Cardtitle` 상속 24×24, 글리프 `확인 불가` | **닫기 `IconButton`** (`stage-3-design-spec.md` §2.8) |
| 진입점 행 | — | **Lucide `chevron-right`**(Book List 행과 동일) |

**HARU 전용 SVG 신규 export 0건** ✓ (plan §9.2 와 일치).

---

## 5. 사용 토큰

### 5.1 기존 토큰으로 충족 — 신규 불필요

| Figma | 토큰 |
|---|---|
| `#4a5f5c` | `--color-fg-primary` (`--haru-ink-700`) |
| `#7d9291` | `--color-fg-secondary` (`--haru-ink-500`, 가값 `P-01`) |
| `#85bfb6` | `--color-progress-fill` |
| `#5e7370` / 30% (dots) | `--color-indicator-active` / `--color-indicator-inactive` |
| `#ffffffbd` (74%) | `--color-surface-glass` |
| `#ffffffe5` (90%) | `--color-surface-strong` |
| `#D0CCA1` | `--color-icon-save-star` |
| `0 6 4 ink8% + inset ×2` **1겹** | **`--shadow-bubble`** |
| `0 6 14 ink 24~28% + inset white50` | `--shadow-cover` (24% → 28% 흡수, Δ4%) |
| radius 7→8 / 24→22 / 28 / 100 / 4 | `--radius-control` · `--radius-surface` · `--radius-card` · `--radius-pill` · `--radius-indicator` |
| 간격 16 / 14 / 13→12 / 12 / 7→8 / 6 / 2 | `--space-4` · `--space-3-5` · `--space-3` · `--space-2` · `--space-1-5` · `--space-0-5` |
| dots 7 / 20 / gap 6 | `--indicator-dot-size` · `--indicator-active-width` · `--indicator-gap` |
| 28 Heavy / 17 Bold / 16 Bold / 14→15 / 13 / 12 / 11.5→11 / 11 | `title-1`+heavy · `headline`+bold · `callout`+bold · `subheadline` · `footnote` · `caption-1` · `caption-2` |
| 카드 pad 18 / pad-bottom 16 / gap 12 / 버튼 45 / Save 87 / gap 8 | `--activity-card-pad` · `--activity-card-pad-bottom` · `--activity-card-row-gap` · `--activity-card-action-size` · `--activity-card-save-size` · `--activity-card-action-gap` |

### 5.2 신규 토큰 제안

> ⚠️ **전부 Tier 2 Semantic 을 거친다.** Tier 3 → Primitive 직접 참조는 **빌드 규칙 3-4 위반**이다. Tier 3 리터럴(px)은 기존 선례(`--activity-card-note-pad-block: 13px` 등)와 같은 처리다.

| ID | Tier | 이름 | 값 | 근거 | 상태 |
|---|---|---|---|---|---|
| **LT-1** | 2 color | `--color-fg-tertiary` **재매핑** | `var(--haru-ink-400)` (`#9aabaa`) | Figma Library 가 **3단계 회색**(primary `#4a5f5c` / secondary `#7d9291` / **tertiary `#9aabaa`**)을 쓴다. 현행 tertiary 는 secondary 와 **같은 `ink-500`**. `--haru-ink-400` 은 primitive 에 **이미 있고 어떤 semantic 도 참조하지 않는 미사용 값**이다 | `CONFIRMED (L-OPEN-08·10)` + **신규 가값 `P-24`** (§5.4) |
| **LT-2** | 2 radius | **`--radius-media: 12px`** | 12 | 표지 radius 7 / 10 / 12 3종. 현행 스케일은 8 다음이 **16** 이라 12 는 8(Δ−4)·16(Δ+4) **동점** → 자동 흡수 불성립. **radius 6단계 → 7단계** (Stage 0 `#10-②` **개정**) | `CONFIRMED (L-OPEN-09)` |
| **LT-3** | 3 | `--book-cover-w-sm: 34px` · `--book-cover-w-xl: 64px` · `--book-cover-h-xl: 90px` | Figma | `component/index.css:132` 가 예고. `lg` 는 폭이 **퍼센트**라 §10 에서 정의 | 제안 |
| **LT-4** | 3 | `--book-cover-radius-xl: 10px` + `--activity-card-cover-radius` **를 이 토큰으로 재지정** | 10 | §5.5 — 현행 `--activity-card-cover-radius: var(--space-2-5)` 는 **간격 토큰을 radius 로 오용**한다. **값은 동일(10)** 하므로 렌더 변화 0 | 제안 (정규화) |
| **LT-5** | 3 | `--library-shelf-cover-aspect: 107 / 151` | Figma | `--book-cover-aspect`(7/10 = 0.7) 로는 107 → 152.86(Δ+1.86)이 되어 캐러셀 블록이 2px 커지고 섹션 y 가 밀린다. 실측 비 **107/151 = 0.7086** | 제안 |
| **LT-6** | 3 | `--library-shelf-block-size: 216px` · `--library-shelf-indicator-gap: var(--space-4)` | Figma 216 · 실측 오프셋 15 → 16 흡수 | **선언 gap 8 ↔ 실측 207 불일치**(원인 `확인 불가`) → **실측 기준** | 제안 |
| **LT-7** | 3 | `--sheet-inset-inline: var(--space-3-5)` · `--sheet-inset-block-end: var(--space-3-5)` · `--sheet-inset-radius: var(--radius-card)` · `--sheet-inset-pad: var(--space-4-5)` | 14 / 14 / 28 / 18 | `CONFIRMED (L-OPEN-04)` + §3.9 제안 | 제안 (아래 여백 값은 **승인 필요**) |
| **LT-8** | 3 | `--reading-now-text-gap: 3px` | Figma 3 | 스케일 최소 단위가 2(`--space-0-5`)·4(`--space-1`)라 **3 은 양쪽 Δ1 동점**. 텍스트 4요소 사이 gap 이므로 2 로 흡수하면 블록이 3px 줄고 118 과 어긋난다 | 제안 |
| **LT-9** | 3 | `--reading-now-progress-height: 7px` | Figma 7 | `--progress-height-sm`(6)·`md`(8) **양쪽 Δ1 동점**. `ProgressBar` 에 도메인 size 를 추가하지 않고 **Library CSS 에서 track 높이만 override**(`activity-card` → `BookCover` 선례) | 제안 |
| **LT-10** | 3 | `--library-shelf-item-gap: var(--space-2)` | Figma 7 → 8 | 표지→제목→캡션 각 7 | 제안 |
| **LT-11** | 3 | `--book-list-row-height-min: 74px` | Figma 74 | 현행 `--list-row-height-min`(56) + padding 12 + 썸네일 48 = **72**(Δ−2). 74 를 최소 높이로 두면 Figma 와 **정확히 일치**하고 `AD-S3-17`(최소 74, 내용에 따라 증가)을 만족한다 | 제안 |
| **LT-12** | 2 color | `--color-scrim` **값 교체** | `rgb(0 0 0 / 0.34)` | `CONFIRMED (L-OPEN-06)` `[픽셀]` | 확정 — §12 |
| **LT-13** | 3 | `--section-header-action-hit: var(--size-touch-min)` | 44 | §9.2 터치 타깃 | 제안 |
| **LT-14** | 3 | `--library-entry-row-height-min: var(--list-row-height-min)` | 56 | §7.1 — 진입점 행은 media 가 없어 74 가 아니다 | 제안 |

### 5.3 흡수 (신규 토큰을 만들지 않는 것) — **토큰 값을 바꾸지 않는다**

| Figma | 흡수 대상 | Δ | 이유 |
|---|---|---|---|
| divider ink **10%** | `--color-divider`(ink600 **12%**) | +2% | 이 토큰은 **Settings `ListRow` 전역**이다. 값을 바꾸면 Stage 2 baseline 이 변한다. 2% 는 1px 선에서 식별 불가 |
| 진행 바 track ink **14%** | `--color-progress-track`(**12%**) | −2% | 이 토큰은 **온보딩 `ProgressBar`** 가 쓴다. 같은 이유 |
| 표지 그림자 ink **24%** | `--shadow-cover`(**28%**) | +4% | Home 카드 표지가 쓰는 토큰. Figma 자신이 24(캐러셀)·28(Reading now·Home) 두 값을 쓴다 |
| 캡션 gap **7** | `--space-2`(8) | +1 | 블록 높이는 `LT-6`(216)이 고정 |
| 행 padding-block **13** | `--space-3`(12) | −1 | 높이는 `LT-11`(74)이 고정 |
| 썸네일 radius **7** | `--radius-control`(8) | +1 | 기존 흡수표 |
| 제목 **14** | `--text-subheadline`(15) | +1 | §3.3 흡수표 **CONFIRMED (#10-②)** |
| 메타 **11.5** | `--text-caption-2`(11) | −0.5 | 기존 흡수표 |
| 카드 radius **24** | `--radius-surface`(22) | −2 | 기존 흡수표 |
| chevron **15** | `--size-icon-sm`(16) | +1 | 기존 흡수(Stage 2) |
| dots 간격 **15** | `--space-4`(16) | +1 | `LT-6` |

### 5.4 신규 가값 **`P-24`** — `--color-fg-tertiary` = `#9aabaa`

`CONFIRMED (L-OPEN-08 · L-OPEN-10, approvals §18.2)` — **Figma 값을 유지하고 가값으로 등록한다.** 2026-09-22 `P-02` 결정("접근성 미달 값도 Figma 를 따르되 `provisional` 표시를 남겨 나중에 **토큰 값만** 바꾼다")과 같은 방식이다.

- **번호**: **`P-24`**. `P-01`~`P-23` 전부 소비됨 (approvals §9.2 · `WORKFLOW_STATE.md` `S3-PROV-1` — 다음 번호는 `P-24`). **번호 재배정 금지.**
- `P-01`(`#7d9291`, 2.58:1)과 **다른 새 사례**다 — 색이 다르고 대비도 **1단계 더 낮다**.
- 토큰 정의에 **`/* provisional: P-24 (docs/decisions/stage-0-approvals.md §4) */`** 주석을 남긴다. 사용처 CSS 에도 기존 관례대로 같은 주석을 둔다.
- dev gallery `provisionalItems.ts` 에 항목을 추가한다 (`title: '--color-fg-tertiary'`, `decision: '디자이너 확인 요청 — #9aabaa 대비 1.56–2.30:1'`).
- 재제시는 Stage 0 `#10-4` 절차에 따라 **Stage 3 구현 완료 후 항목별로** 한다.

**사용처별 실측 대비** `[픽셀 + 계산]` — 배경은 앱 그라데이션 3점 실측(`#f0f9f6` / `#d6e8e2` / `#cbd1d9`)

| 사용처 | 유효 배경 | 상단 | 중간 | 하단 | AA(4.5) | AA 대형(3.0) |
|---|---|---|---|---|---|---|
| `See all` **12px** (`163:1626`·`163:1634`·`145:680`) | 앱 배경 직접 | 2.23 | 1.88 | **1.56** | ✗ | ✗ |
| 캐러셀 캡션 2행 **11px** (= 4대 역량 라벨, `113:1975` 등) | 앱 배경 직접 | 2.23 | 1.88 | **1.56** | ✗ | ✗ |
| `3 of 5 nights` **12px** (`145:1144`) | 앱 배경 직접 | 2.23 | 1.88 | **1.56** | ✗ | ✗ |
| Book List 메타 **11.5px** · `Rated 4.5` | `--color-surface-glass`(74%) 위 | 2.35 | 2.25 | **2.15** | ✗ | ✗ |
| chevron **15px** (비텍스트) | `--color-surface-glass`(74%) 위 | 2.35 | 2.25 | **2.15** | ✗ (비텍스트 기준 3.0) | ✗ |
| `ReadingNowCard` 메타 **11.5px** (`145:1152`) | `--color-surface-strong`(90%) 위 | 2.38 | 2.34 | **2.30** | ✗ | ✗ |
| 시트 안 Book List 메타 | 시트(90%) over scrim(.34) 위 | 2.21 | 2.18 | **2.16** | ✗ | ✗ |

**최악값 1.56:1** (하단 배경 위 `See all` · 캐러셀 캡션). **최선값 2.38:1.** 전부 AA 미달이며 **대형 텍스트 기준(3.0)도 미달**이다.
→ `P-24` 로 등록하고 **디자이너 확인을 병행 요청**한다. agent 가 임의로 값을 올리지 않는다.
→ 비텍스트 대비(chevron 2.15:1 < 3.0)도 같은 가값에 포함한다 — chevron 은 **행 전체가 버튼**이고 행 제목이 접근성 이름이므로 **정보 전달을 chevron 에만 의존하지 않는다** (WCAG 1.4.11 의 "필수 시각 정보" 범위 밖으로 판단, §9.3).

### 5.5 radius 7단계 개정 — Figma 7 / 10 / 12 의 처리

`CONFIRMED (L-OPEN-09, approvals §17.3)` — **radius 6단계 → 7단계**. Stage 0 `#10-②`("radius 6단계 고정")를 이 결정으로 **개정**한다.

```
--radius-indicator 4 · --radius-control 8 · --radius-media 12(신설) · --radius-field 16
· --radius-surface 22 · --radius-card 28 · --radius-pill 9999
```

**7 / 10 의 처리 — 실측 근거 제안**

| Figma | 쓰이는 곳 | 제안 | 근거 |
|---|---|---|---|
| **7** | Book List 썸네일 34×48 (`30:142`·`163:2101`) | **`--radius-control`(8) 흡수 유지** | Δ+1 로 8 이 유일한 최근접. **기존 흡수표에 이미 있다**(DESIGN_TOKEN_MAP §5.2). 신규 토큰 불필요 |
| **10** | `ReadingNowCard` 표지 64×90 (`145:1146`), Home 카드 표지 58×82 (`85:536`) | **`--radius-media` 로 흡수하지 않는다.** Tier 3 `--book-cover-radius-xl: 10px`(`LT-4`)로 **현재 값을 유지** | ① 10 은 8(Δ−2)·12(Δ+2) **동점**이라 12 도 흡수 근거가 없다. ② **10 은 지금 정확히 렌더되고 있다**(`--activity-card-cover-radius: var(--space-2-5)` = 10). 12 로 흡수하면 **없던 Δ2 를 새로 만들고 Home 카드 시각 baseline 이 변한다**. ③ semantic 을 **8단계**로 늘리는 것은 §17.3 승인 범위(7단계) 초과다 |
| **12** | 캐러셀 표지 107×151 (`113:1972`) | **`--radius-media`(신설 12)** | 결정된 신설 대상 |

**부수 정규화 (`LT-4`, 렌더 변화 0)** — `--activity-card-cover-radius: var(--space-2-5)` 는 **간격 토큰을 radius 로 쓰는 오용**이다(dots radius 의 `item spacing/xxs` 오용과 같은 종류). `--book-cover-radius-xl: 10px` 를 두고 양쪽이 이를 참조하게 한다. **값이 같으므로 Home baseline 은 변하지 않는다.**

---

## 6. Interaction / Motion / 문구 규칙

### 6.1 Interaction

| 트리거 | 결과 | 비고 |
|---|---|---|
| `SectionHeader` "See all" 탭 | **`LibraryShelfSheet`** 열림 (title = 섹션 제목, filter = 섹션 key) | Figma reaction `확인 불가` → `stage-3-design-spec.md` §1.2 흐름 승계 |
| 캐러셀 항목 탭 | **`BookDetailSheet`** 열림 | 〃 |
| Book List 행 탭 | **`BookDetailSheet`** 열림 (행 전체가 `<button>`) | 〃 |
| `LibraryShelfSheet` 행 탭 | **`BookDetailSheet`** 로 **교체 전환**(닫고 열지 않는다) → back 은 **Shelf 목록 복귀** | `stage-3-design-spec.md` §2.9 `CONFIRMED` |
| `BookDetailSheet` ★ Save | `useToggleSavedBook` → 응답은 `SavedBook`(`L-OPEN-20` 현행 유지) → **`libraryKeys.overview` / `list('saved')` 무효화 후 재조회** | ⚠️ 응답으로 캐시를 직접 갱신할 수 없다 — **수용된 대가** (approvals §18.4) |
| `BookDetailSheet` Start Session | **비활성** — `aria-disabled="true"`, 눌러도 아무 일도 없다 | `CONFIRMED (D-3, §13.10)` → `AD-S3-16` |
| 캐러셀 가로 스와이프 / 키보드 | 페이지 단위 snap, `PageIndicator` active 갱신 + `aria-live` 문구 | Home 결정과 동일 — **좌우 버튼을 만들지 않는다**(Figma 에 없다). 가로 scroll-snap 의 네이티브 키보드 경로로 WCAG 2.5.1 충족 |
| 진입점 행 탭 | `/library/add` · `/library/gift-requests` 로 **route 이동** | §7.1 |

### 6.2 Motion — 기존 토큰만 사용

| 전환 | 모션 | duration | reduced-motion |
|---|---|---|---|
| 시트 진입(inset-card) | fade + **아래에서 위로** (`translateY(100%)` → 0) — 기존 `Sheet` 모션 유지 | `--motion-duration-base` | fade only |
| scrim | fade | `--motion-duration-base` | fade only |
| Shelf → BookDetail 교체 전환 | fade + 6px 상승 | `--motion-duration-fast` | fade only |
| 진행 바 채움 | `inline-size` transition (기존 `ProgressBar`) | `--motion-duration-base` | 그대로(크기 변화) |
| 캐러셀 snap | CSS `scroll-snap` 네이티브 | — | `scroll-behavior` 는 선언하지 않는다 |
| Skeleton | `--animate-skeleton` (기존) | — | 기존 규칙 |

### 6.3 ⭐ `AD-S3-5` 보완 — 4대 역량 캡션의 줄바꿈 규칙

**문제** `[실측]`: Figma 캡션은 `Emotion`(43px) / `Resilience`(53px) / `Confidence`(60px) 로 **11px · `nowrap` · 1줄**이고 열 폭은 **107** 이다. #14 표시 라벨은 더 길다.

| #14 표시 라벨 | 글자수 | 11px 추정 폭 `[추정]` | 107 에 1줄? |
|---|---|---|---|
| `Emotion Regulation` | 18 | ≈ 103 | **경계** (공백 포함 측정 필요) |
| `Self-Direction` | 14 | ≈ 78 | ✓ |
| `Cognitive Flexibility` | 21 | ≈ 118 | **✗** |
| `Intrinsic Motivation` | 20 | ≈ 112 | **✗** |

(320px 에서는 열 폭이 **84.3** 으로 줄어 **4개 전부 1줄 불가**다 — §10.)

**규칙 (`RECOMMENDED` — 승인 필요)**

1. **`nowrap` 을 쓰지 않는다.** 캡션은 **최대 2줄**로 줄바꿈한다 (`overflow-wrap: break-word` 는 쓰지 않는다 — 단어 중간을 끊지 않는다).
2. **2줄을 넘으면 말줄임**: `-webkit-line-clamp: 2` (기존 `Text.css` 의 clamp 선례와 동일 패턴).
3. **줄바꿈은 캡션 2행에만 허용한다.** 캡션 1행(책 제목, 12/Semibold)은 **Figma 대로 1줄 + 말줄임**(`line-clamp: 1`) — 제목은 길이가 데이터 의존이고 Figma 가 `nowrap` 으로 1줄을 명시한다.
4. 캡션이 2줄이 되면 **블록 높이가 +13**(11px 캡션 1행 = `caption-2` line-height 13) 늘어난다. **`--library-shelf-block-size`(216) 를 고정값으로 쓰지 않고 최소값**으로 둔다 — `min-block-size: var(--library-shelf-block-size)`. dots 는 트랙 **아래**에 붙으므로 캡션 줄 수가 다른 항목이 섞여도 dots 위치는 **가장 높은 항목**을 따른다.
5. 접근성: 말줄임된 캡션은 **시각 전용 축약이 아니다**(역량 라벨 전체가 의미) → 항목의 접근성 이름에 **전체 라벨**을 넣는다 (`aria-label="{제목} — {역량 라벨}"`). `title` 속성은 쓰지 않는다(터치에서 보이지 않는다).
6. `capability === null` → **저자명**을 같은 규칙으로 표시한다 (`L-OPEN-15`).

→ `AD-S3-5` 의 허용 범위를 **"문구 비교 제외 + 캡션 행 수 1 → 2 허용(블록 높이 +13)"** 으로 확장했다 (`stage-3-design-spec.md` §11.3 갱신 완료). **캡션의 x · 폰트 크기 · 색 차이는 여전히 불허.**

### 6.4 Copy (`shared/copy/library-copy.ts` 확장)

**Figma 문구 그대로** — `Reading now` · `Our curated shelf` · **`Favorites`** · `Finished together` · `See all` · `Rated ` · `{n} sessions · finished {date}` · `Last read {day} · {min} min` · `{a} of {b} nights`

- **"Books you own" 을 쓰지 않는다** — Figma 에 없는 문구다 (approvals §14.1, `AD-S3-4` 삭제).
- **"My Saved" 를 쓰지 않는다** — `L-D1` 이 `Favorites` 를 택했다.
- 캐러셀 캡션 2행 = `capability-copy.ts` 의 **#14 표시 라벨** (`AD-S3-5`).
- `Rated 4.5` 는 **서버 값 표시**다. Frontend 가 등급·우열·비교 문구를 더하지 않는다 (`rules/frontend.md` §8).
- 신규 문구(진입점 · 상태 화면)는 §7 에 모았고 전부 `RECOMMENDED` 다.

---

## 7. Figma 에 없는 것 — 진입점 · 상태 화면 (승인된 예외)

> `C-13` ② (`L-OPEN-12`·`L-OPEN-13`) · Stage 0 `#22`(공통 상태 화면은 명세 우선).
> **설계 원칙: Figma 에 이미 있는 요소만 조합한다.** 새 시각 언어를 만들지 않고, 디자이너 판이 도착하면 **블록 하나를 교체**하면 끝나는 구조로 둔다.

### 7.1 `LibraryEntryActions` — `/library` 하단 진입점 (`AD-L-06`)

**형태: `ListGroup tone="glass"` + `ListRow` 2행.** `Finished together` 목록과 **같은 컴포넌트·같은 idiom**(행 + chevron)이다.

```
… Book List 4행 (abs 864 – 1161)
   ↓ 16  (--space-4, 다른 섹션 간격과 동일)
ListGroup tone="glass"                       abs 1177 – 1290
├ ListRow "Add a book you own"   trailing=chevron-right   → /library/add           (FR-23)
├ (divider 1px --color-divider)
└ ListRow "Gift requests"        trailing=chevron-right   → /library/gift-requests (FR-22)
   ↓ 32  (--space-8, 마지막 블록 → 탭바)
BottomTabBar
```

| 항목 | 값 | 근거 |
|---|---|---|
| 섹션 제목 | **없음** | 새 섹션 제목 문구를 만들지 않는다(최우선 규칙 #2 최소화). 행 라벨 2개가 스스로 설명한다 |
| 행 높이 | `--library-entry-row-height-min`(= `--list-row-height-min` 56) | **media 가 없다** → Book List 의 74 를 쓰지 않는다 |
| 타이포 | `ListRow` 기본 `titleVariant="footnote"` | 기존 Settings 행과 동일 — Library 전용 모양을 만들지 않는다 |
| 블록 높이 | 16 + 56×2 + 1 = **129** | `AD-L-06` |
| 접근성 이름 | `ListGroup label="Library actions"` (`RECOMMENDED`, 시각 비노출 `aria-label`) | — |
| 문구 | `Add a book you own` (FR-23) · `Gift requests` (FR-22) | **`RECOMMENDED`** — `FR` 문구를 그대로 옮긴 영어 라벨. 진단·판정·비교 표현 없음 |
| 교체 가능성 | 이 블록은 `features/library/LibraryEntryActions` **1개 파일**이고 `/library` 조립에서 **한 줄**로 들어간다. 디자이너 Figma 도착 시 이 파일만 교체한다 | `L-OPEN-12` |

**대안 (채택 안 함, 기록용)** — ① 기존 `LibraryFooterActions`(Button glass fullWidth + TextLink): Figma 의 Library 화면에는 **전폭 glass 버튼도 TextLink 도 없다** → 새 시각 언어가 된다. ② `SectionHeader`("Manage your library") + 목록: **새 섹션 제목 문구를 발명**해야 한다. ③ `TopBar` 우상단 아이콘: `WeekSummaryChip` 이 그 자리를 쓰고 있다 `[실측 x=211 w=134]`.

### 7.2 `/library/add` — 보유 책 직접 등록 (FR-23)

Figma 없음. **Stage 2 의 "Books and interests" 검색 화면과 같은 부품**으로 구성한다 (Figma `179:1770` 계열에서 이미 확정된 모양).

```
StackLayout
├ TopBar(variant=default, title="Add a book", leading=back)
└ main
    ├ TextField(label="Search by title", trailingAction=clear)      ← Stage 2 §4.1 그대로
    ├ (검색 결과) ListGroup tone="glass" / ListRow(media=BookCover sm, title, subtitle=author,
    │                                              trailing=Button size=sm "Add")
    ├ DividerWithLabel("or")                                        ← Stage 2 컴포넌트
    └ FieldGroup "Not finding it?"
        ├ TextField(label="Title", required)
        ├ TextField(label="Author")
        └ Button(variant=primary, fullWidth) "Add to library"
```

- 검색은 `GET /v1/books/search` **Stage 2 재사용**. 직접 입력은 `AddOwnBookRequest`(= `SaveBookTargetSchema` 재사용).
- 상태: Loading(`Skeleton` ×3) · Empty(검색 결과 없음) · Error/Retry · 중복(`BOOK_ALREADY_OWNED` → `InlineAlert tone=info`).
- 성공 → `/library` 로 복귀 + `Toast`("Added to your library"). **`ownership` 표식은 만들지 않는다**(`L-OPEN-14`) — 등록 결과는 `Finished together` 가 아니라 목록 재조회로만 반영된다.
- 문구 전부 **`RECOMMENDED`**.

### 7.3 `/library/gift-requests` — 증정 요청 상태 (FR-22)

Figma 없음. `stage-3-design-spec.md` §2.11 의 결정(**신청 CTA 는 이 화면에 없다 — 신청은 `BookDetailSheet` 에서, 이 화면은 상태 확인 전용**)을 **유지**한다.

```
StackLayout
├ TopBar(variant=default, title="Gift requests", leading=back)
└ main
    ├ InlineAlert(tone=info)  — D-15 접수 안내 문구 (approvals §8.2)
    └ ListGroup tone="glass" / ListRow(media=BookCover sm, title,
                                        subtitle="Requested {date}",
                                        meta=Tag(status))
```

- `status` 는 `GiftRequestStatusSchema` **6종 재사용**(기존 contract). `Tag` 로 표시하며 **새 배지 컴포넌트를 만들지 않는다**.
- 상태: Loading · **Empty**(신청 0건 — 가장 흔한 상태) · Error/Retry · 중복(`GIFT_REQUEST_DUPLICATE`).
- ⚠️ `L-OPEN-14` 와의 경계: **목록에 `owned`/`gifted` 표식을 만들지 않는다**는 결정은 `/library` 의 서재 목록에 대한 것이다. **이 화면의 `GiftRequestStatus` 표시는 `FR-22` 기능 자체**이며 `L-OPEN-14` 가 금지한 것이 아니다 (approvals §17.1 *"표식이 없다는 것과 기능이 없다는 것은 다르다"*).

### 7.4 상태 화면 (`AD-L-07`) ↔ Mock 시나리오 매핑

**원칙: 섹션은 사라지지 않는다.** 데이터가 0건이어도 `SectionHeader` 는 그대로 있고 **본문 자리에 안내가 들어간다** — 섹션이 사라지면 화면 구조가 상태마다 달라져 Figma 기하와 대조할 수 없다. 단 **`Reading now` 는 예외**다(아래).

| 상태 | 화면 | Mock key (plan §8) | 비고 |
|---|---|---|---|
| **Loading** | 섹션별 `Skeleton` — 헤더는 실제 텍스트, 본문만 Skeleton. 캐러셀: 표지 3개 자리 `Skeleton shape=rect`(퍼센트 폭) + 캡션 2행 `Skeleton shape=text lines=2`, **dots 미표시**. 목록: `Skeleton` 행 4개(높이 74). `Reading now`: 카드 1개 자리 | `loading` | 섹션 4개가 **동시에** 로딩된다 — `LibraryOverview` 1회 조회(`P3-BIP-18`)이므로 4-way 깜빡임이 없다 |
| **Empty — `Favorites` 0건** ⭐ | `EmptyState`(`icon=star`, title `Nothing saved yet`, description `Tap ★ Save on a card to keep a book here.`) — **action 없음** | **`favorites-empty`** | **저장 전 기본 상태 = 가장 흔한 실제 상태.** 섹션과 "See all" 은 남기되 **"See all" 은 비활성**(`aria-disabled`) |
| **Empty — `Finished together` 0건** | `EmptyState`(`icon=book-open`, title `No finished books yet`, description `Books you finish together will show up here.`) | `finished-empty` | 〃 |
| **Empty — `Our curated shelf` 0건** | `EmptyState`(`icon=info`, title `No picks right now`, description `New picks arrive each week.`) | `curated-empty` | 운영 데이터 공백(`P3-BIP-04`) |
| **Empty — 전체 0건** | 위 3개가 **동시에** 뜬다. 별도의 "전체 빈 화면" 을 만들지 않는다 | `empty` | 구조 일관성 |
| **`Reading now` 없음** | **블록 전체(헤더 + 카드 + 간격 170)를 렌더하지 않고 간격을 회수**한다 → 화면이 L-1 `30:74` 와 **완전히 같아진다** | **`reading-now-none`** | ⭐ 유일한 "섹션 사라짐" 예외. 근거: **L-1 이 Figma 에 실재하는 화면**이므로 "없는 상태" 의 디자인이 Figma 에 **이미 있다**. `EmptyState` 를 넣으면 Figma 에 없는 블록을 만드는 것이 된다 |
| **캐러셀 1~2권** | 퍼센트 그리드의 **1·2번째 열만 채우고 3번째는 비운다**(자리를 접지 않는다). dots 1개 → **`PageIndicator` 미표시**(페이지가 1개면 표시하지 않는다) | **`shelf-partial`** | Figma 는 항상 3-up `[실측]` → 1~2권 레이아웃이 **없다**. 열 폭·offset 을 유지해 Figma 기하를 깨지 않는 쪽을 택했다 |
| **`unrated`** | 행 우측 meta 를 **비우고** 좌측 메타의 좌측 정렬 유지 | **`unrated`** | `CONFIRMED (L-OPEN-22)` |
| **Error** | 섹션 본문 자리에 `ErrorState` + **Retry** 버튼. 헤더 유지 | `error` | contracts Error Envelope |
| **Offline** | **Error 와 같은 경로**(`NetworkError`) — 사전 차단 UI 를 만들지 않는다 | `offline` | plan §8.2 |
| **Retry** | 1회차 실패 → Retry → 2회차 성공 | `retry` | — |
| **`paged`** | "See all" 시트에서 커서 2페이지 — 시트 하단 도달 시 추가 로드(`Skeleton` 행 2개) | `paged` | 섹션 안 "Show more" 없음(`L-OPEN-21`) |
| **`book-saved` / `unsave`** | ★ 토글 → **`overview` 재조회** → `Favorites` 캐러셀 반영 | `book-saved` / `unsave` | `L-OPEN-20` 의 대가 (§6.1) |
| **`gift-pending` / `gift-duplicate`** | §7.3 | 〃 | — |
| **`user-entered-book`** | 표지 없는 책 → `BookCover` **placeholder**(pastel 면 + 이니셜). "No cover" 같은 **판정 문구 금지** | `user-entered-book` | 기존 `BookCover` 동작 |

**Not Eligible / Permission / Pending** — Library 에는 해당 상태가 없다 (녹음·분석·리포트 화면의 상태다). `확인 완료 — 해당 없음`.

---

## 8. `R-SHADOW-1` — overflow · 그림자 · 클리핑 설계

### 8.1 ⭐ inset 재산정 — **픽셀 프로브 실측** (추정 아님)

**측정 방법** (`rules/frontend.md` §6-1 ③ 준수)
1. 빌드된 앱 CSS(`apps/web/dist/assets/index-*.css`, Tailwind 컴파일 결과)를 그대로 `<link>` 한 **순백 배경** 페이지에 프로브 박스를 배치. (⚠️ `packages/design-tokens/dist/index.css` 는 `@theme static` **소스 번들**이라 브라우저가 무시한다 — 처음 이 파일로 재면 `boxShadow: none` 이 나온다.)
2. `getComputedStyle(el).boxShadow` 를 **괄호를 보존하는 정규식으로 겹 단위 분리**해 출력 → **겹 수를 눈으로 확인**. (`substring('inset')` 필터는 쓰지 않는다 — 겹을 전부 놓친다.)
3. Playwright `fullPage` 스크린샷을 **그림자 있음 / `box-shadow:none`** 두 장 찍고, 자체 PNG 디코더(filter 0–4 un-filtering)로 **박스 중앙선에서 바깥으로 1px 씩 Δ(RGB 채널 합)** 프로파일을 만든다.
4. 임계값 **Δ≥1 / 2 / 3 / 8** 네 가지로 extent 를 모두 산출한다.
5. **방법 검정**: 같은 방법으로 `--shadow-glass-rest` 를 재서 **기록된 값(아래 77 · 위 22)이 재현되는지** 먼저 확인했다.

**방법 검정 결과 — 재현됨** `[픽셀]`

| 겹 수 | 토큰 | 아래 | 위 | 좌 | 우 | 기록된 값 |
|---|---|---|---|---|---|---|
| **3겹 drop** | `--shadow-glass-rest` | **78** | **22** | **50** | **50** | `--carousel-shadow-inset-block-end: 80px`(실측 77) · `--carousel-shadow-inset: 24px`(실측 22) |

→ 아래 78 ≈ 기록 77, 위 22 = 기록 22. **방법이 기존 실측과 일치한다** (Δ≤1px, 배경이 흰색이라 1px 더 멀리 잡힌다).
→ ⚠️ **좌우는 기록(28~32)과 다르다.** 같은 임계값(Δ≥1)에서 **50** 이다. 기록의 28~32 는 **Δ≥8 임계값(31)** 과 일치한다 — 즉 **기존 기록은 세로와 가로에 서로 다른 임계값을 섞어 썼다.** → §11 보고 항목.

#### ① `L-OPEN-07` 목록 상자 — `--shadow-glass-rest`(3겹) → **`--shadow-bubble`(1겹)**

`[픽셀]` 겹 분리 확인: `color(srgb .3686 .4510 .4392 / 0.08) 0px 6px 4px 0px` + inset ×2 → **drop 1겹**.

| 임계값 | 아래 | 위 | 좌 | 우 |
|---|---|---|---|---|
| **Δ≥1 (채택)** | **10** | **0** | **4** | **4** |
| Δ≥2 | 10 | 0 | 4 | 4 |
| Δ≥3 | 10 | 0 | 4 | 4 |
| Δ≥8 | 8 | 0 | 2 | 2 |

프로파일(아래) `35,35,32,31,28,19,16,10,4,3,0,0,…` — **10px 에서 완전히 사라진다.**

> **결론: 아래 10 · 위 0 · 좌우 4.** approvals §17.4 의 예상("아래 77 → 약 10")은 **맞았다** — 실측으로 확인했다.
> 산술 검증: offset +6, blur 4 → 아래 6+4 = 10 ✓ / 위 −6+4 = −2 → **0** ✓ / 좌우 ±4 ✓. **1겹이므로 누락할 겹이 없다.**
> 상자 크기와 무관하다 — 345×297(목록) · 345×72(1행) · 345×118(Reading now) · 134×34(chip) 전부 같은 값이 나왔다 `[픽셀]`.

**적용 위치** — ⚠️ **페이지 위의 `Finished together` 목록에는 inset 이 필요 없다.**

| 위치 | 클리핑 박스 | inset |
|---|---|---|
| `/library` 페이지의 `ListGroup` | **없다** — 스크롤 컨테이너는 `AppShell` 뷰포트(앱 컬럼 **바깥**, 뷰포트 전폭) `[실측 코드 AppShell.tsx]`. 세로는 스크롤 축의 끝이고 가로는 뷰포트 끝이라 **클립 선이 화면 밖**이다 (`R-SHADOW-1` ④) | **불필요** |
| **`LibraryShelfSheet` 안의 `ListGroup`** | **`.haru-sheet__content { overflow-y: auto }`** — **기존 선언**이고 "See all" 은 전체 목록이라 실제로 스크롤한다 | **아래 10 · 위 0 · 좌우 4** |

**시트 본문 inset 레시피** (`R-SHADOW-1` ②, `box-sizing: border-box` 이므로 **크기에 가산**)
```css
.haru-sheet__content--inset-shadow {
  padding-block-end: var(--sheet-content-shadow-inset-block-end); /* 10 */
  padding-inline:    var(--sheet-content-shadow-inset-inline);    /* 4  */
  margin-block-end:  calc(-1 * var(--sheet-content-shadow-inset-block-end));
  margin-inline:     calc(-1 * var(--sheet-content-shadow-inset-inline));
  /* border-box: content box 를 보존하려면 inset 을 크기에 가산한다 */
}
```
**검증 `[픽셀]`** — 같은 프로브에서 실증했다:
- 보정 **없음**: `overflow-y:auto` 박스를 꽉 채운 자식의 아래·우측 Δ 프로파일이 **전부 0** (완전히 잘린다)
- 보정 **있음**(padding 0 4 10 4 + 음수 margin + 크기 가산): 아래 **10** · 우측 **4** 로 **완전 복원** ✓

#### ② `L-OPEN-04` 떠 있는 시트 — `--shadow-glass-rest`(3겹), radius 28

| 임계값 | 아래 | 위 | 좌 | 우 |
|---|---|---|---|---|
| **Δ≥1 (채택)** | **78** | **22** | **50** | **50** |
| Δ≥8 | 59 | 14 | 31 | 31 |

(365×427 박스 · radius 28 로 측정. 345×297 과 **동일한 값** — 번짐은 상자 크기·radius 와 무관하다 `[픽셀]`.)

**클리핑 박스 분석 — 결론: 시트 자신에게는 inset 이 필요 없다.**

| 방향 | 393px | ≥600px (480 앱 컬럼) | 판정 |
|---|---|---|---|
| 좌·우 | 필요 50 ↔ inset 14 → **36 이 뷰포트 밖으로 나간다** | 시트 폭 452, 컬럼 바깥 **페이지 배경으로 번진다** — 클리핑 없음 | **문제 없음.** 393 에서 잘리는 선은 **화면 가장자리**라 보이지 않는다 (`R-SHADOW-1` ④). Figma 도 393 프레임에서 같은 양이 잘린다 |
| 아래 | 필요 78 ↔ 여백 14 + safe-area → **뷰포트 바닥에서 잘린다** | 동일 | **문제 없음** — 같은 이유 |
| 위 | 필요 22 ↔ scrim 이 뷰포트 전체를 덮는다 | 동일 | **문제 없음** |
| 조상 클리핑 | `Sheet` 는 `createPortal(document.body)` + `position: fixed` `[실측 코드]`. `useBodyScrollLock` 이 body 에 `overflow` 를 걸어도 **fixed 요소는 그 클립 대상이 아니다**(조상이 containing block 이 아니다 — `transform`/`filter`/`contain` 없음) | 동일 | **문제 없음** |

> **그래서 `L-OPEN-04` 가 만드는 `R-SHADOW-1` 작업은 "시트 바깥" 이 아니라 "시트 **안**" 이다** — 떠 있는 카드가 되면서 **내용이 시트 안에서 스크롤**해야 하고, 그 스크롤 박스가 `ListGroup` 그림자를 자른다. 위 ① 의 레시피가 그 처리다.

### 8.2 `BookShelfCarousel` — 새 `overflow-x` 선언 ⚠️ **승인 대상**

`AppColumn` 안쪽 `overflow-*` 금지의 현재 예외는 **`.haru-activity-track`(Home 가로 트랙) 1건**이다 `[실측 코드]`. `BookShelfCarousel` 은 **두 번째** 예외가 된다.

- **불가피성**: Figma 가 3-up 캐러셀 + **dots 3개**(페이지 3개)를 명시한다 `[실측 113:1986]`. 가로 스크롤 없이 표현할 수 없다 → `R-SHADOW-1` ① 의 "스크롤이 꼭 필요한 경우" 다.
- ⚠️ **내가 승인하지 않는다.** 두 번째 예외 등록은 **사용자 승인 대상**으로 올린다 (§11 `L-NEW-01`).

**승인된다면의 설계** (Home 트랙 선례 `activity-card-deck.css:44–78` 와 동일 구조)

| 항목 | 값 | 근거 |
|---|---|---|
| 자식 그림자 | 표지 `--shadow-cover` — `[픽셀]` **아래 20 · 위 8 · 좌우 14** (`0 6px 14px ink28%` + inset) | 실측 |
| `padding-block-start` | **`--space-2`(8)** | 위 8 |
| `padding-block-end` | **`--space-5`(20)** | 아래 20 |
| `block-size` | `calc(min-block-size + 8 + 20)` — **`box-sizing: border-box` 이므로 가산** | `R-SHADOW-1` ② |
| `margin-block` | 각각 음수 — 레이아웃 점유와 scrollable overflow 를 되돌린다 → **섹션 y 가 1px 도 움직이지 않는다** | 〃 |
| 가로 | 앱 컬럼 밖으로 **gutter(24) bleed**: `margin-inline: calc(-1 * var(--layout-gutter))` + `inline-size: calc(100% + 2 * var(--layout-gutter))` + `padding-inline: var(--layout-gutter)` | Home 트랙과 동일. 좌우 필요 14 < gutter 24 → **클립되지 않는다** ✓ |
| 3번째 표지 **0.92 overflow** | **Figma 대로 재현한다** — 퍼센트 그리드 `31.0145% / 4.0472% / 31.0145% / 3.1862% / 31.0145%`(합 100.267%) | 합이 100 을 0.267% 넘는 것이 **Figma 의 % 그리드 그 자체**다. 넘친 0.92px 는 **gutter 24 안**에 들어가므로 보이는 클립이 생기지 않는다. 열 간격이 **13.95 / 10.97 로 균일하지 않은 것**(Figma % 그리드의 산술 잔차)도 이 방식으로만 재현된다 |
| snap | 페이지 단위 `scroll-snap-type: x mandatory` + 페이지 그룹에 `scroll-snap-align: start` | §3.3 |
| 포커스 링 | `R-SHADOW-1` ⑤ — inset 때문에 border box 가 벌어지므로 **트랙에 링을 그리지 않고 snap 된 페이지**에 붙인다 (`data-active`) | Home 선례 |
| 회귀 테스트 | **세로·가로 양축** 픽셀 프로브 (`R-SHADOW-1` ⑥) + 근거 주석 | `e2e/shadow.spec.ts` 가 **가로만** 보던 탓에 Stage 3 결함을 놓쳤다 |

### 8.3 `ReadingNowCard` 의 `overflow: clip` ⚠️ **승인 대상**

`[실측 get_design_context]` Figma 는 카드에 **clip content** 를 걸고 있다(`rounded-[24px] overflow-clip`). 그 결과 표지 그림자가 **카드 아래 모서리에서 6px 잘린다**(표지 하단 104 + 번짐 20 = 124 > 카드 118).

| 안 | 내용 | 결과 |
|---|---|---|
| **① Figma 대로 `overflow: clip`** `RECOMMENDED` | 카드에 `overflow: clip`(스크롤 컨테이너가 아니다). radius 를 따라 잘린다 | Figma 와 **동일**. 단 `AppColumn` 안쪽 **세 번째 `overflow` 선언**이 된다 → 근거 주석 + 프로브 회귀 테스트 필요 |
| ② `overflow` 미선언 | 표지 그림자가 카드 아래로 **6px 번진다** | Figma 와 Δ. 허용 차이 등록 필요 |

→ ① 을 권고하되 **내가 승인하지 않는다** (§11 `L-NEW-02`). `overflow: clip` 은 스크롤 컨테이너를 만들지 않으므로 `SpeechBubble.css`·`onboarding.css` 의 "1×1 clip 박스 전용" 선례와 같은 범주이지만, **그 선례들과 달리 이 박스 안에는 그림자 요소가 있다.**

### 8.4 그 밖의 그림자 — inset 불필요 확인

| 요소 | 그림자 | 실측 번짐 | 클리핑 박스 | 판정 |
|---|---|---|---|---|
| `ReadingNowCard` | `--shadow-bubble` | 아래 10 · 위 0 · 좌우 4 | 없음 (페이지) | 불필요 |
| `WeekSummaryChip` | `--shadow-bubble` | 아래 10 · 위 0 · 좌우 **3**(pill) | 없음 (`TopBar`) | 불필요 |
| Book List 썸네일 | 없음 `[실측 — 30:142 에 그림자 없음]` | — | — | 불필요 |
| 떠 있는 시트 | `--shadow-glass-rest` | 아래 78 · 위 22 · 좌우 50 | 뷰포트 끝만 | 불필요 (§8.1 ②) |

---

## 9. Accessibility

### 9.1 텍스트 확대 / reflow

- **고정 높이를 선언하지 않는다.** Figma 의 118(Reading now) · 74(행) · 216(캐러셀) · 20(헤더) 은 전부 **`min-block-size`** 로 둔다 (`AD-S3-17` 과 같은 규칙).
- 텍스트 200% / 320px 에서 세로로 늘어난다. `SectionHeader` 는 baseline 정렬이므로 제목이 2줄이 되면 액션은 **첫 줄 baseline** 에 머문다 — 액션 위치가 흔들리지 않는다.
- 캐러셀 캡션 2줄 허용(§6.3) + `--library-shelf-block-size` 를 **최소값**으로 둔다.
- Book List 행: 제목 1줄 clamp + 메타 1줄 → 확대 시 행 높이가 늘어난다(축소는 불허).

### 9.2 터치 타깃 44

| 요소 | 시각 크기 `[실측]` | 처리 |
|---|---|---|
| **`SectionHeader` "See all"** | **39 × 14** → **미달** | **hit-area 44 확장** (아래 레시피) |
| Book List 행 | 345 × **74** | ✓ (행 전체가 `<button>`) |
| 진입점 행 | × **56** | ✓ |
| 캐러셀 항목 | 107 × 192 | ✓ |
| ★ Save / Start Session | 87×45 / ×45 | ✓ |
| 시트 닫기 `IconButton` | 시각 38 / hit 44 (기존) | ✓ |
| `PageIndicator` dots | 7×7 | **표시 전용**(`S1-G-1`) — 조작 요소가 아니다 ✓ |
| chevron | 15×15 | **장식**(`aria-hidden`) — 행이 타깃이다 ✓ |

**"See all" hit-area 레시피** — 시각 크기를 바꾸지 않고 hit area 만 넓힌다 (`IconButton::before` 선례와 동일 방식, 리터럴 없음)

```css
.haru-section-header__action { position: relative; }
.haru-section-header__action::after {
  content: '';
  position: absolute;
  /* (16 − 44) / 2 = −14 → 16 + 28 = 44 */
  inset-block: calc((var(--text-caption-1--line-height) - var(--section-header-action-hit)) / 2);
  inset-inline-start: 50%;
  translate: -50%;
  inline-size: 100%;
  min-inline-size: var(--section-header-action-hit); /* 44 — 텍스트 폭과 무관 */
}
```

**겹침 검사** `[실측 기하로 계산]` — 44 hit area 는 14 텍스트 기준 위아래로 각 **15** 확장된다. 헤더 위 간격 16, 아래 간격 16 이므로 **15 < 16** → 위 섹션의 콘텐츠·아래 캐러셀의 **어느 인터랙티브 요소와도 겹치지 않는다** ✓. 가로는 39 → 44 로 각 **2.5** 확장되어 오른쪽은 content 를 2.5 넘어 gutter(24) 안에 머물고(그 자리에 인터랙티브 요소가 없다), 왼쪽 끝 303.5 는 가장 긴 제목 `Finished together`(폭 151)의 끝에서 **약 152px 떨어져 있다** ✓.

### 9.3 대비

| 항목 | 값 | 판정 |
|---|---|---|
| 제목 `#4a5f5c` on 앱 배경 | 6.35 / 5.35 / **4.43** | 하단 4.43 < 4.5 — **기존 사례**(Stage 1·2 와 동일, 신규 아님) |
| 보조 `#7d9291` | 3.06 / 2.58 / **2.14** | **기존 가값 `P-01`** |
| **tertiary `#9aabaa`** | **2.38 ~ 1.56** (사용처별 표 §5.4) | **신규 가값 `P-24`** |
| 시트 면 위 본문 `#4a5f5c` (scrim 교체 후) | **6.29 / 6.22 / 6.15** | AA ✓ (§12 — 교체로 **0.2 하락**하지만 여유가 크다) |
| `ProgressBar` fill ↔ track | 기존 가값 `P-02` | 변화 없음 |
| `Start Session` 비활성 라벨 | 기존 `--color-fg-disabled` | `D-3` 범위 |

- **색에만 의존하지 않는다**: `Rated 4.5` 는 **텍스트**다(별 아이콘 없음) `[실측]`. `GiftRequestStatus` 는 `Tag` **라벨 텍스트**로 표시한다. `Favorites` 소속은 **섹션 제목**으로 표현된다.
- **chevron 2.15:1**(비텍스트 기준 3.0 미달)은 `P-24` 에 포함한다. 단 chevron 은 "다음으로 간다" 는 **중복 어포던스**이고 행 전체가 버튼이며 접근성 이름은 책 제목이므로, **chevron 만으로 전달되는 정보는 없다**.

### 9.4 접근성 이름 / 구조

| 요소 | 처리 |
|---|---|
| `SectionHeader` 제목 | `<h2>` — 페이지 `<h1>` 은 `TopBar` 의 "Library" |
| "See all" | `<button>`, 접근성 이름 **`See all {섹션 제목}`** (`RECOMMENDED` — "See all" 3개가 같은 이름이면 구분되지 않는다) |
| `3 of 5 nights` | `<span>` — **비대화형**(`L-OPEN-17`). 진행 바의 `aria-valuetext` 와 **중복 읽기를 피하기 위해** 바에는 `aria-hidden` 을 쓰지 않고 `ProgressBar` 의 기존 `label` 을 쓴다 |
| `ReadingNowCard` | 카드 전체가 `<button>` → `BookDetailSheet`. 접근성 이름 = `{제목}, {저자}, {진행 문구}` (`RECOMMENDED`) |
| 캐러셀 | 트랙에 `role="group"` + `aria-label="{섹션 제목}"`. 항목 접근성 이름 = `{제목} — {역량 라벨}`(**말줄임 전 전체 라벨**, §6.3 ⑤) |
| `PageIndicator` | 기존 `aria-live` 문구 재사용 (폭 독립 — `AD-S3-20`) |
| Book List | `ListGroup` `<ul>` + 행 `<li>`. 행 접근성 이름 = `{제목}, {n} sessions, finished {date}, rated {x}` (`RECOMMENDED`). **chevron 은 `aria-hidden`** |
| 표지 | `BookCover decorative`(제목이 옆에 텍스트로 있으므로 `alt=""`) — 캐러셀·행·Reading now 모두 |
| 시트 | 기존 `Sheet`: `role="dialog"` + `aria-modal` + focus trap + `Esc` + body scroll lock + 닫을 때 트리거로 포커스 복귀 ✓ |
| Shelf → Detail 교체 전환 | 포커스를 **새 시트 안 첫 요소**로 옮기고, back 시 **Shelf 의 해당 행**으로 되돌린다 (`RECOMMENDED`) |
| `prefers-reduced-motion` | §6.2 — 전부 fade only |
| `prefers-reduced-transparency` | `ListGroup tone="glass"` 는 기존 fallback(`--material-glass-fill-fallback`) 경로를 그대로 쓴다 |

---

## 10. Responsive Rule

Figma 는 **393 단일 폭**이다 `[실측]`. 그 밖은 Stage 0 `#12`(`--bp-md` 600 / `--bp-lg` 1024, 600↑ 최대 **480** 앱 컬럼 가운데 정렬, 다단 없음)에서 도출한다.

**근거: Figma shelf 그리드는 퍼센트 기반이다** `[실측]` — 열 offset **35.0574% / 69.2528%**, 항목 폭 31.61%/30.74%/30.75%, 표지 폭 **107/345 = 31.0145%**. 따라서 **표지 폭 = content × 31.0145%** 가 Figma 자신의 규칙이다. `CONFIRMED (L-OPEN-11)`.

| 폭 | 앱 컬럼 | content | **표지 폭** | 표지 높이 (107/151) | 3-up | 캡션 타이포 |
|---|---|---|---|---|---|---|
| **320** | 320 | **272** | **84.4** | 119.1 | ✓ (비례 축소) | **축소 없음** (11/12px 유지) |
| **393** (Figma) | 393 | **345** | **107** | 151 | ✓ (3번째 0.92 overflow 재현) | 기준 |
| **600** | 480 | **432** | **134.0** | 189.1 | ✓ | 축소 없음 |
| **1024** | 480 | **432** | **134.0** | 189.1 | ✓ | 축소 없음 |

- 구현: 캐러셀은 **퍼센트 그리드**(§8.2) → 폭 계산이 자동으로 따라온다. 별도 breakpoint 분기가 **필요 없다**.
- `aspect-ratio: var(--library-shelf-cover-aspect)`(107/151, `LT-5`) → 높이도 자동.
- **캡션 타이포는 축소하지 않는다** (`L-OPEN-11`, 11px 하한 `#10-②`) → 320 에서 열 폭 84.4 이므로 **4대 역량 라벨은 전부 2줄**이 된다(§6.3). 블록 높이가 +13 늘어난다.
- `AD-S3-20`(캐러셀 열 수 항상 3, 320 에서 아이템 폭 82.7 까지 축소 허용)은 **그대로 유효**하다 — 실측 84.4 는 허용 범위 안이다.
- Book List 행: 유동 폭. 320(content 272)에서 메타 2열(`{n} sessions · finished {date}` 147 + `Rated 4.5` 58 = 205 + gap)이 **텍스트 열 폭 272−16−34−12−16−16 = 178 을 넘는다** → `justify-between` + **좌측 메타 `min-inline-size: 0` + `line-clamp: 1`** 로 좌측이 먼저 줄어들게 한다. `Rated 4.5` 는 **줄이지 않는다**(짧고 의미 단위다). ⚠️ `D-7` 시절의 "평점 미렌더면 문제 없음" 전제는 **`L-D3` 로 사라졌다** — 이 처리가 필요해졌다. `RECOMMENDED`
- 제목 행: "Library"(28 Heavy, 95) + chip(134~138) = 320 content 272 에서 **여유 39** ✓
- 떠 있는 시트: 좌우 inset 14 고정 → 320 에서 폭 292, 480 컬럼에서 **452**. `max-inline-size: var(--layout-app-max-width)` 유지 ✓
- 세로 고정(앱은 landscape 미지원, 웹 가로는 앱 컬럼으로 표시) — Stage 0 `#12` 그대로.

---

## 11. Figma 누락 / 불일치 / 승인 필요 항목

### 11.1 이 패스에서 새로 올리는 **결정 필요** 항목

| ID | 항목 | 내용 | 권고 |
|---|---|---|---|
| **`L-NEW-01`** | `BookShelfCarousel` 의 **새 `overflow-x` 선언** | `AppColumn` 안쪽 `overflow-*` 금지의 **두 번째 예외**가 된다(현재 예외는 Home 가로 트랙 1건). Figma 가 3-up + dots 3개를 명시하므로 가로 스크롤 없이 표현 불가 | **예외 등록** — 근거 주석 + **세로·가로 양축 프로브 회귀 테스트**(`R-SHADOW-1` ⑥) 동반 (§8.2) |
| **`L-NEW-02`** | `ReadingNowCard` 의 **`overflow: clip`** | Figma 가 카드에 clip 을 걸어 표지 그림자 아래 6px 이 잘린다. 세 번째 `overflow` 선언이 된다 | **① Figma 대로 `overflow: clip`** (§8.3). ② 미선언 + 허용 차이 등록 |
| **`L-NEW-03`** | 떠 있는 시트 **아래 여백 값** | Figma 가 37.22 / 4.11 로 어긋나 규칙을 읽을 수 없다 | **`calc(var(--space-3-5) + var(--layout-safe-bottom))` = 14 + safe-area** (§3.9, 5가지 근거) |
| **`L-NEW-04`** | `type=shelf` 카드 **하단 padding 13 → 16** | Figma shelf symbol 은 13, Home 카드(같은 컴포넌트)는 16 | **`--activity-card-pad-bottom`(16) 재사용** — 같은 컴포넌트에 두 값을 두지 않는다. Δ+3 허용 차이 |
| **`L-NEW-05`** | 표지 에셋 **합성 연출** | Figma 캐러셀 표지 = 베이스 이미지 + 베이크된 제목 텍스트 + `asset/book-cover` **opacity 80**, Book List 썸네일 = **틸 그라데이션 + 표지 opacity 60** `[실측]` | `BookCover` 로 **표지 1장만 렌더**. `L-D4`(Stage 8 전 표지 교체)로 어차피 사라진다 → **`AD-L-08`** 로 등록 |
| **`L-NEW-06`** | `ListGroup` 기본 면·그림자가 **Figma 와 다르다** | Stage 2 가 면 90% + `--shadow-glass-rest` 를 **`RECOMMENDED`("symbol 에 컨테이너 없음")로 추측**했는데, 실제 근거는 화면 사본 `30:140` 이고 그 값은 **74% + 1겹**이다 `[get_variable_defs 확인]` | `L-OPEN-07` 이 Library 만 변형으로 처리했다. **Settings 의 기본값도 Figma 와 Δ** 다 → **다음 라운드 정규화 대상**으로 기록 |
| **`L-NEW-07`** | `ListRow` 기본 title 크기가 **Figma 와 Δ−1** | Stage 2 가 근거 노드 `163:2145` 의 **텍스트 높이 17** 로 13(`footnote`)을 추정했는데, 실제 `font-size` 는 **14** 다 `[get_design_context 원문 `text-[14px]`]`. §3.3 흡수표는 `14 → subheadline`(15) **CONFIRMED** | Library 는 `titleVariant="subheadline"`. **Settings 기본값은 건드리지 않는다**(baseline 보호) → 정규화 대상으로 기록 |
| **`L-NEW-08`** | 기존 그림자 실측 기록의 **임계값 불일치** | `--shadow-glass-rest` 좌우가 기록 **28~32** 인데 세로와 같은 임계값(Δ≥1)에서는 **50** 이다. 기록은 세로 Δ≥1 / 가로 Δ≥8 을 섞어 썼다 `[픽셀]` | **Home 가로 트랙의 가로 여유 재검토** 권고. 현재는 gutter(24) bleed 로 뷰포트까지 밀어내므로 **보이는 클립은 없다** → 즉시 결함은 아니다. 기록만 정정 |
| **`L-NEW-09`** | 가값 `P-05`(scrim) 의 **성격 변화** | 교체 후 `--color-scrim` 은 "DESIGN_TOKEN_MAP 제안값" 이 아니라 **Figma 실측값**이다 | **`P-05` 를 가값 목록에서 해제** 제안(근거가 디자이너 추정 → Figma 실측으로 바뀌었다). 유지/해제는 사용자 판단 |

### 11.2 Figma 누락 (이미 승인된 예외)

| 누락 | 처리 |
|---|---|
| Loading / Skeleton | `C13 ② (L-OPEN-13)` → §7.4, `AD-L-07` |
| Empty (`Favorites` / `finished` / `curated` / 전체) | 〃 |
| Error / Offline / Retry | 〃 |
| 캐러셀 1~2권 | 〃 (`shelf-partial`) |
| `unrated` | `CONFIRMED (L-OPEN-22)` |
| `/library/add` · `/library/gift-requests` · 진입점 | `C13 ② (L-OPEN-12)` → §7.1–§7.3, `AD-L-06` |
| 320 / 600 / 1024 반응형 | Stage 0 `#12` + `L-OPEN-11` → §10 |
| `gift_pending` UI | §7.3 |
| 저장 토글 pending / 실패 | Home 과 동일 처리 (`G-13`·`G-14`) |
| 시트 닫기 컨트롤·prototype reaction | **`확인 불가`** — `stage-3-design-spec.md` §1.2·§2.8 결정 승계 |

### 11.3 PRD ↔ Figma 불일치 (plan-agent 소유 — 여기서는 보고만)

| ID | 항목 | PRD | Figma (node) | 영향 | 상태 |
|---|---|---|---|---|---|
| `LN-1` | 책 단위 평점 | `FR-12` = **세션 단위** | `109:511`·`109:519`·`163:1643`·`163:1654` `Rated 4.5` | contract `averageRating` + `P3-BIP-16` | PRD 수정 대상 (§19.2) |
| `LN-2` | 다회차 읽기 진행 | 모델 없음 | `145:1144`·`145:1150`·`145:1152` | contract `ReadingProgress` + `P3-BIP-17` | 〃 |
| `LN-3` | 책 저장(favorite) | 없음 | `163:1633` `Favorites` + `145:779` | 이미 구현(`SaveButton`) | 〃 |
| `LN-6` | 하단 탭 3탭 | §6.1:270 "서재·세션·리포트" | 확정 구조 Library / Home / Progress | — | 〃 |
| `LN-7` | 서재 설명 | §6.1:276 에 `Favorites`·`Reading now`·평점 없음 | L-1·L-2 | — | 〃 |
| **`LN-4`** | **역량 캡션 이름** | 4대 역량 = `Emotion Regulation` / `Self-Direction` / `Cognitive Flexibility` / `Intrinsic Motivation` (#14) | **Figma 안에서도 일관되지 않다**: 캐러셀 `113:1975/1980/1985` = `Emotion`/`Resilience`/`Confidence` ↔ **`ReadingNowCard` `145:1149` = `Self-Direction`** `[실측 — 이 패스의 신규 발견]` | `AD-S3-5` 의 근거가 강해진다 — Figma 자신이 #14 라벨을 쓴 자리가 있다 | **여전히 미결** |
| `LN-5` | 항목별 세션 시작 | — | — | — | 여전히 미결 |

### 11.4 ⚠️ 표지 에셋 라이선스 — **법무 확인 필요**

Figma 표지에 **실제 상용 그림책 표지**가 들어 있다 `[실측]`: *The Most Magnificent Thing*(`145:1148`) · *Grumpy Monkey*(`30:152`·`163:1639`·`163:1650`) · *Where the Wild Things Are*(`30:144`) · *After the Fall*(`113:1979`) · *The Color Monster*(`113:1974`) · *The Dot*(`113:1984`).
`L-D4` 로 **Stage 8 Mock 데모 웹 프리뷰 배포(`C-18`) 전 교체**가 확정됐다 (`P3-BIP-19`). **Frontend 판단 사항이 아니며 사용자 확인 사항이다.**

### 11.5 Figma 내부 불일치 (해소됨 / 기록)

| 항목 | 불일치 | 처리 |
|---|---|---|
| 섹션 제목 | L-1 은 **3개 전부 다르고**(`Our curated shelf`/**`Favorites`**/`Finished together`), **L-3 만 중복**(`163:1684`·`163:1688`) | `AD-S3-4` **무효 삭제** (approvals §14.1) |
| Book List divider | 컴포넌트 3개 ↔ 화면 사본 1개 | `CONFIRMED (L-OPEN-05)` 모든 행 사이 |
| 캐러셀 dots 오프셋 | 선언 gap **8** ↔ 실측 y **207**(= 192 + 15) | 실측 채택, 원인 `확인 불가` |
| 시트 폭 | L-2 **365** ↔ L-3 **364** | 365 채택(좌우 14 균등). 1px 잔차 `[추정]` |
| 시트 세로 앵커 | 하단 **37.22** ↔ **4.11** | `L-NEW-03` |
| 표지 그림자 알파 | 캐러셀 **24%** ↔ Reading now·Home **28%** | `--shadow-cover`(28%) 흡수 |
| 역량 캡션 이름 | `Emotion`/`Resilience`/`Confidence` ↔ `Self-Direction` | `LN-4` (미결) |
| "See all" 분포 | L-1 3개 ↔ L-2 1개 | `CONFIRMED (L-OPEN-19)` 세 섹션 모두 → `AD-L-03` |

---

## 12. scrim 전역 교체 파급 (`L-OPEN-06`)

### 12.1 변경

```css
/* packages/design-tokens/src/semantic/color.css */
- --color-scrim: #29293a3b;              /* rgb(41 41 58) / 0.231 */
+ --color-scrim: rgb(0 0 0 / 0.34);      /* Figma 실측 [픽셀] — 145:1450 / 163:1807 7점 최소제곱 */
```

- **컴포넌트 코드 변경 0.** `Scrim.css` 는 `background-color: var(--color-scrim)` 한 줄이고, 그걸 쓰는 것은 `Sheet.tsx:59`(level=sheet) · `Dialog.tsx:62`(level=dialog) **두 곳뿐**이다 `[실측 코드]`.
- ⚠️ **단순 불투명도 조정이 아니다** — `#29293a`(**남색 기운**) → `#000000`(**순검정**)으로 **색조까지 바뀐다**. 배경이 한 단계 더 어두워지고 중성화된다 `[계산]`: 상단 `(194,201,203)` → `(158,164,162)`, 하단 `(166,170,180)` → `(134,138,143)`.

### 12.2 영향받는 **Sheet 5종** (design-spec `P-05` 대장 기준)

| # | Sheet | 화면 | 현재 구현 상태 `[실측 코드]` |
|---|---|---|---|
| 1 | **ReadingContextSheet** | `/` Home 카드 CTA (+ `D-17` Mock route) | **Stage 3 미구현** (`features/activity-card-deck` 에 파일 없음) |
| 2 | **Prompt 공개 시트** | `BookDetailSheet` 안 뷰 전환 · Home 카드 헤더 | **미구현** |
| 3 | **`LibraryShelfSheet`** | `/library` "See all" | **미구현** (이 문서가 명세) |
| 4 | **`BookDetailSheet`** | `/library` 행·항목 탭 | **미구현** (이 문서가 명세) |
| 5 | **시간 목록 시트** | ReadingContext `custom_time` (`SelectTrigger` + `Sheet`) | **미구현** |

**추가로 지금 실제로 scrim 을 렌더하는 표면** (Stage 2 에서 이미 구현된 것)

| 표면 | 위치 | 인스턴스 |
|---|---|---|
| `SelectTrigger` 옵션 `Sheet` | `SignUpForm` (birthYear · birthMonth · gender) | **3** |
| `SelectTrigger` 옵션 `Sheet` | `ChildInfoStep` (birthYear · birthMonth · gender · relationship) | **4** |
| `ConfirmDialog` (`level=dialog`) | `SettingsMenu` 로그아웃 | **1** |
| dev gallery 데모 | `ComponentsPage` · `StatesPage` | 회귀 전용 |

→ 즉 **"Sheet 5종" 은 Stage 3 계획상의 5종**(전부 미구현)이고, **지금 코드에서 scrim 이 보이는 자리는 `SelectTrigger` 시트 7 인스턴스(2화면) + `ConfirmDialog` 1 = 8** 이다.

### 12.3 ⭐ 시각 baseline 영향 — **재생성 대상 0건**

`e2e/__screenshots__/darwin/visual.spec.ts` **56장**과 `responsive.spec.ts` 1장을 전수 확인했다 `[실측]`.

- **열린 Sheet / Dialog / Scrim 을 담은 baseline 이 없다.** `visual.spec.ts` 에 `sheet`·`dialog`·`scrim` 문자열이 **0건**이고, `s2-selecttrigger` baseline 은 **트리거 행 4개(닫힌 상태)** 만 찍는다 `[실측 Stage2Section.tsx:40–80]`.
- → **`--color-scrim` 교체로 변하는 baseline 은 0 장이다. 재생성·재검증 작업이 없다.**
- `R-BASELINE-1` ⑤("diff 를 원인별로 분해하고 scrim 외 변화가 섞이면 멈춘다")의 **적용 대상 자체가 없다.**
- ⚠️ 대신 **회귀 감시가 비어 있다**: scrim 값이 바뀌어도 잡는 테스트가 없다. **권고(승인 필요)**: 열린 Sheet 1컷 + 열린 Dialog 1컷 baseline 을 Stage 3 구현 시 **신규 추가**한다(`s3-sheet-scrim` · `s3-dialog-scrim`). **지금 추가하지 않는다** — baseline 재생성 금지 지시 범위다.

### 12.4 가값 `P-03` · `P-11` 재계산 — **전제가 성립하지 않는다**

| 가값 | 실제 내용 `[실측 stage-0-approvals.md:104·112]` | scrim 과의 관계 |
|---|---|---|
| **`P-03`** | **focus ring `--color-focus-ring`**(`--haru-ink-700`) — 2026-09-22 **확정** | **무관.** scrim 위가 아니다 |
| **`P-11`** | glass·tinted 표면 위 **`text-button`(`#5e7370`) 라벨** 4.18–4.48:1 — Glass 버튼 라벨 · `PromptPill` · 설문 counter 등 | **무관.** scrim 이 아니라 **glass 표면** 위다 |
| `P-05` | **scrim 자체** — "디자이너 대기" | **이것이 바뀌는 값이다** → `L-NEW-09` |

→ 과제가 전제한 *"scrim 위 라벨 대비는 어두워지면 올라가므로 `P-03`·`P-11` 이 완화될 수 있다"* 는 **성립하지 않는다**. 이유 3가지:
1. `P-03`·`P-11` 은 scrim 과 무관한 항목이다 (위 표).
2. **scrim 위에 직접 올라가는 텍스트·아이콘이 없다.** `Scrim` 은 자식이 없는 `aria-hidden` 장식 레이어이고(`Scrim.tsx`), 모든 콘텐츠는 그 **위의 Sheet 면**에 있다.
3. 시트 면은 **90% 흰색 + blur** 다. scrim 이 어두워지면 그 10% 를 통해 **면이 미세하게 어두워지므로** 면 위 본문 대비는 **올라가지 않고 내려간다**.

**시트 면 위 본문(`#4a5f5c`) 대비 재계산** `[계산 — 90% white over scrim over 앱 배경 3점]`

| | 상단 | 중간 | 하단 |
|---|---|---|---|
| 현행 `#29293a3b` | 6.50 | 6.41 | 6.33 |
| **Figma `rgb(0 0 0 / .34)`** | **6.29** | **6.22** | **6.15** |
| Δ | −0.21 | −0.19 | −0.18 |

→ **AA(4.5)·AAA(7 미달이지만 본문 기준 아님) 판정은 변하지 않는다.** 여유가 1.6 이상 남는다. **완화되는 가값도, 새로 위험해지는 가값도 없다.**

---

## 13. `[실측]` / `[픽셀]` / `[추정]` / `확인 불가` 구분

### 13.1 `[실측]` — 이 패스에서 Figma MCP 로 직접 읽음

L-1 `30:74` 전체 트리 · L-2 `145:1132`/`145:1141` 전체 트리 · L-3 오버레이 `163:1807` · `113:1992` 캐러셀 심볼 · `163:2145` Book List 심볼 · `163:1898` `type=shelf` 심볼 · `113:1971` 캐러셀 항목(get_design_context) · `145:1145` Reading now 카드(get_design_context) · `30:141` Book List 행(get_design_context) · `30:140` 컨테이너(get_variable_defs).

### 13.2 `[픽셀]` — 렌더 픽셀 프로브 (§8.1 방법)

`--shadow-bubble` 아래 10 / 위 0 / 좌우 4 · `--shadow-glass-rest` 아래 78 / 위 22 / 좌우 50 · `--shadow-cover` 아래 20 / 위 8 / 좌우 14 · pill `--shadow-bubble` 좌우 3 · `overflow` 보정 전 0 / 보정 후 완전 복원 · scrim `rgba(0,0,0,0.34)`(audit 7점 최소제곱) · 대비 수치 전부(계산).

### 13.3 `[추정]`

| 내용 |
|---|
| L-3 의 섹션 제목 중복은 `163:1633` 이 `Favorites` 로 편집되기 **전** 사본의 아티팩트다 (생성 순서는 확인 불가) |
| L-3 시트 폭 364 는 **1px 저작 잔차**이고 정본은 365 다 |
| 캐러셀 dots 3개 = 3페이지 × 3권 = **최대 9권** (Figma 가 명시하지 않는다) → 구현은 `ceil(items/3)` 으로 **데이터에서 파생**한다 |
| 시트 헤더 우상단 24×24 아이콘은 `Cardtitle` 상속이며 글리프는 `flip_to_back` 일 것이다 |
| 11px 역량 라벨의 렌더 폭 추정치(§6.3) — **구현 시 실측 필요** |

### 13.4 `확인 불가`

| 내용 |
|---|
| **prototype reaction 전부** — "See all" 목적지 · 행 탭 목적지 · 오버레이 열림/닫힘 전환 · 뒤로 가기 · 시트 닫기 컨트롤 |
| 캐러셀 선언 gap 8 ↔ 실측 dots y=207(Δ15)의 **원인** |
| 떠 있는 시트의 **세로 앵커 규칙** (L-2 하단 37.22 ↔ L-3 4.11, bottom·top·center 전부 불일치) |
| `Property 1=Selected`(`113:1991`)의 의도된 용도 |
| 표지 이미지 에셋의 **라이선스·사용 가능 여부** (§11.4) |
| 시트 헤더 아이콘의 실제 글리프 |

---

## 14. development-agent 구현 메모

1. **토큰 먼저** — `LT-1`(tertiary 재매핑, `provisional: P-24` 주석) · `LT-2`(`--radius-media`) · `LT-12`(scrim) 는 다른 작업의 전제다. `LT-4`(cover radius 정규화)는 **값이 같으므로 Home baseline 이 변하지 않아야 한다** — 변하면 중단하고 보고.
2. **`ListGroup tone` · `ListRow titleVariant` 는 기본값을 바꾸지 않는다.** Settings·온보딩 baseline 이 1px 도 변하면 안 된다 (`L-OPEN-07`·`L-NEW-07`).
3. **`R-SHADOW-1`**: 시트 본문 inset(아래 10 · 좌우 4) + 캐러셀 트랙 inset(위 8 · 아래 20) 은 **`box-sizing: border-box` 이므로 크기에 가산**한다. 음수 margin 으로 레이아웃 점유를 되돌려 **섹션 y 가 움직이지 않는지** 확인한다. 회귀 테스트는 **세로·가로 양축**.
4. **`L-NEW-01`·`L-NEW-02`(새 `overflow` 선언) 는 승인 전 구현하지 않는다.**
5. **진입점·상태 화면 문구는 전부 `RECOMMENDED`** — 승인 없이 확정 문구로 굳히지 않는다.
6. `L-OPEN-20` 의 대가: 저장/해제 후 **`libraryKeys.overview` 무효화 + 재조회**. `SavedBook` 응답으로 캐시를 직접 갱신하려 하지 말 것. Home 의 `useToggleSavedBook` 경로는 **건드리지 않는다**.
7. `plannedNights === null` → 회차 문구 **미렌더**, `progressRatio` 는 **서버 값만 그린다**(프론트 계산 금지).
8. `averageRating === null` → meta 비우고 좌측 정렬 유지.
9. **Mock fixture 는 `mocks/fixtures/` 에만.** `shelf-partial`(1·2권) · `unrated` · `reading-now-none` · `favorites-empty` 는 **Figma 에 없는 상태**이므로 fixture 가 유일한 검증 수단이다.
10. `Start Session` 은 카드·시트 **양쪽 모두** `aria-disabled` (`D-3`).
