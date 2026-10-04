# Stage 2 온보딩 설문 재구성 — Design Spec

**Status: APPROVED (2026-10-03, user)** (design-agent · **개정 2** 2026-10-03 — `§11.13`~`§11.16` 결정 반영).

**Based on**
- Figma `YWWu3AFEJpRxvw0T5klq0k` — `179:1724` · `243:1147` · `248:1159` · `179:1748` · `179:1770` · `179:1809` · `163:2145` (전부 **2026-10-03 재조회·실측**)
- 사용자 결정 정본 — `docs/decisions/stage-3-approvals.md` **§11 전체** (`D-24` · `D-25` · `R-01`~`R-14` · **§11.7~§11.16**)
- Plan — `docs/plans/stage-2-onboarding-rework-plan.md` (DRAFT)
- 기존 명세 — `docs/design/stage-2-design-spec.md` (APPROVED 2026-09-25 + §16 개정 6). **이 문서는 그 문서를 대체하지 않는다.** §16 개정 6(`S2-FIX-1`~`3`)은 그대로 유효하고, 이 문서 §9 가 **재구성 레이아웃 기준으로 재검토한 결과**만 추가한다.

**이 문서가 하지 않는 것**: Production Code 수정 · Figma 수정 · 문항 문구 창작 · 미결 사항의 임의 확정.

### 개정 1 변경 요약 (2026-10-03)

| 항목 | 초판 (DRAFT 0) | **개정 1 (확정 반영)** |
|---|---|---|
| 카드 수 | 15 | **16** (Books and interests 2 → **3**) |
| Q5 | 2열 표지 그리드 + `BookChoiceCell` + media 34×48 | **제목 체크박스 목록** — Q2·Q3 와 동일 형식 (`§11.11`) |
| favorites | 없음 (Stage 3 이관 가정) | **카드 1장 신설** (`§11.9`). `Books at home` 은 삭제 |
| 카운터 | `n / 15` | **`n / 16`** |
| 하단 CTA | `S2R-OPEN-4` 미결 | **제거 확정** (`§11.7`) |
| 자동 전진 | `S2R-OPEN-3` 미결 | **단일 선택만 자동 전진** (`§11.7`) |
| 신규 토큰 | 2건 (`--book-cover-sm-*`) | **0건** — Q5 가 쓰지 않으므로 Stage 3 으로 이월 (`§11.11`) |
| `C-13` 미결 | 3건 | **1건** (favorites 검색 Sheet — §10-2) |

### 개정 2 변경 요약 (2026-10-03, `§11.13`~`§11.16`)

| 항목 | 개정 1 | **개정 2 (확정)** |
|---|---|---|
| favorites 입력 | 검색(`Sheet`) + 제목 직접 입력 | **검색 전면 제거 — 제목 직접 입력만** (`§11.13`) |
| favorites 카드 높이 | 582 (Sheet 안) | **235 / 453 / 619** (선택 0 / 3 / 5) — 재측정 |
| `C-13` 미결 | 1건 (검색 Sheet) | **0건 — 디자이너 대기 0** |
| baseline 신규 | 11 | **10** (`s2-books-search-sheet` 삭제) |
| favorites 문항 문구 | `S2R-OPEN-8` 미결 | **`Books your child loves` 확정** (`§11.14`) |
| 상한 초과 처리 차이 | 불일치로 보고 | **의도된 차이로 확정** (`§11.15`) |
| 신규 토큰 | 0건 | **0건 유지** |

**검색 제거 근거 (`§11.13`)**: Figma `30:74`(Library)·`179:1770`(설문 카드) **어디에도 검색 입력·아이콘이 0건**이다. 검색은 **PRD §7.2 Step 3** 만을 근거로 구현에 들어간 것이었다. 검색의 유일한 역할이던 `bookId` 매칭은 **Q5 가 8권 체크로 이미 수행**하고(`owned_books`), 질문지 v1.1 의 추천 state vector 에 **favorites 는 들어 있지 않다**. → **PRD ↔ Figma 충돌**이며 §2 절차(Figma 우선 + 사용자 승인)를 거쳤다 (§16.3).

---

## 0. 요약 — 이번 명세의 결정적 발견 4건

| # | 발견 | 영향 |
|---|---|---|
| **F-1** | **Figma `179:1770` 에는 하단 CTA 가 없다.** 4단계가 전부 덱이 되면 CTA(≈90px)가 세로 예산의 결정적 변수가 된다 — 유지 시 대부분의 카드가 넘치고, Figma 대로 제거하면 **16장 전부 들어간다**. **`§11.7` 로 제거 확정** | §3.2 · §5 |
| **F-2** | **`243:1147` 은 `179:1748` 과 동일한 레이아웃**이다 (y 좌표 110 / 339 / 562 / 619 / 750 전부 일치). 신규 레이아웃이 아니라 기존 §2.8 레이아웃 + InfoRow 2슬롯이 채워진 상태다. 단 **제목·본문 copy 는 서로 다르다** | §2 |
| **F-3** | **`248:1159` 의 프레임 이름이 `(구현 현황 2026-10-03)` 이다.** 디자이너가 현재 구현 상태를 옮겨 그린 프레임이며, `179:1724` 의 `YOUR CHILD` Input 과 **완전히 같은 인스턴스**를 쓴다 → **"표시 전용 ↔ 편집"의 시각 구분이 Figma 에 존재하지 않는다** | §4 |
| **F-4** ★ | **favorites 에 검색이 있으면 카드가 터진다** — 정적 상태는 예산 안이지만(최대 611) 검색 결과 8행 + 선택 5행이 동시에 열리면 **1110**(예산 +432). 가변 길이 블록이 **2개**였기 때문이다. **`§11.13` 로 검색 자체가 제거**되어 가변 블록이 선택 목록 1개로 줄었고, 상한(5)이 걸려 **카드 최대 619 로 확정**된다 | §6.2 |

---

## 1. 대상 화면 (Figma node → route)

| # | Figma node | 화면 | route | 상태 |
|---|---|---|---|---|
| 1 | `179:1724` | 1b · Create account (+ `YOUR CHILD` 섹션) | `/auth/sign-up` | 개정 (§7) |
| 2 | `243:1147` | 1c · Survey step 1 intro | **`/onboarding/start` 신규** (`R-12`) | 신규 (§2) |
| 3 | `248:1159` | 1c · About your child | `/onboarding/child-info` | 전면 개정 (§4) |
| 4 | `179:1748` | 1c · Survey intro | `/onboarding` | 개정 (§2) |
| 5 | `179:1770` | 1d · Survey cards | `/onboarding/reading-together` · `/onboarding/books-and-interests` · `/onboarding/growing-together` · `/onboarding/capability-items` | **4 route 가 같은 디자인** (§3) |
| 6 | `179:1809` | 1e · Baseline saved | `/onboarding/saved` | 변경 없음 |

흐름 (`R-01` A · Plan §5.4):

```
/auth/sign-up (1b) → /auth/consent (5항목) → /onboarding/start (243:1147)
→ /onboarding/child-info (248:1159) → /onboarding (179:1748)
→ 카드 16장 (179:1770 디자인, 4 route) → /onboarding/saved (179:1809)
```

> Prototype 연결은 MCP 로 노출되지 않는다 — 위 순서는 **사용자 지시 + Plan §5.4** 근거이며 Figma reaction 으로는 **확인 불가**다.

---

## 2. Intro 2화면 — `243:1147` · `179:1748`

### 2.1 실측 — 두 프레임은 같은 레이아웃이다 (`F-2`)

| 요소 | `243:1147` | `179:1748` | 동일? |
|---|---|---|---|
| Character ellipse | `243:1149/1150` x96.5 **y110** 200×200 | `179:1750/1751` x96.5 **y110** 200×200 | ✔ |
| 숨김 프레임 96×96 | `243:1151` (hidden) | `179:1752` (hidden) | ✔ |
| 카드 | `243:1155` x28 **y339** w341 h**172** | `179:1756` x28 **y339** w341 h**194** | 위치 ✔ / 높이는 본문 줄 수 차 |
| 카드 내부 | 제목 x+22 y+20 w297 h54 · 본문 x+22 y+84 w297 h68 | 제목 x+22 y+20 w297 h54 · 본문 x+22 y+84 w297 h**90** | 구조 ✔ |
| InfoRow 1 | `243:1158` x26 **y562** 341×47, icon 19, text x47 | `179:1759` x26 **y562** 341×47, icon 19, text x47 | ✔ |
| InfoRow 2 | `243:1163` x26 **y619** 341×47 | `179:1764` x26 **y619** 341×47 | ✔ |
| CTA | `243:1167` x22 **y750** 345×58 | `179:1768` x24 **y750** 345×58 | ✔ (x 22/24 → Figma 슬립, `--layout-gutter` 24 흡수) |
| 홈 인디케이터 | y838 | y838 | ✔ |

→ **레이아웃 명세는 `stage-2-design-spec.md` §2.8 을 그대로 재사용한다.** 신규 레이아웃 명세를 쓰지 않는다.
→ CTA bottom 808 → frame 852 = **44**. `--layout-cta-bottom-gap`(`D-25`) 의 Figma 근거가 **5프레임**으로 늘었다 (§4.1 `248:1159` 포함).

### 2.2 두 화면의 차이 = copy 뿐

| 슬롯 | `/onboarding/start` (`243:1147`) | `/onboarding` (`179:1748`) |
|---|---|---|
| 제목 | `Let's set up your child's profile` | `Hi — before your first night with {childFirstName}…` |
| 본문 | `A few questions about what your read-aloud time looks like today. There are no right answers — what you notice is enough.` | `Ten short questions about things you may have noticed in the last two weeks. No right answers — we just need a starting point.` → **`S2R-OPEN-1` A 적용** (§2.4) |
| InfoRow 1 (`clock`) | `About 1 minutes` | `About 3 minutes · about 10 cards` |
| InfoRow 2 (`list-checks`) | `Input your answers` | `Swipe each card away to move on` |
| CTA | `Start the questions` (screenshot 확인) | `Start` |

**구현 영향**: 현행 `onboardingCopy.intro` 는 `243:1147` 의 제목·본문을 담고 있다. 즉 **현재 `/onboarding` 은 `179:1748` 이 아니라 `243:1147` 의 copy 를 쓰고 있다.** copy 모듈을 **`intro.profile` / `intro.survey` 2벌로 분리한다** (`§11.10` 확정).

### 2.3 `S2-COPY-1` 의 해소 (`R-03`)

`stage-2-design-spec.md` §2.8 의 "두 InfoRow 는 슬롯이 비어 있어 렌더하지 않는다"는 **`R-03` 승인으로 해소된다**. 두 행 모두 그린다.

| 슬롯 | 값의 출처 | 숫자 하드코딩 |
|---|---|---|
| `/onboarding/start` InfoRow 1 | `instrument.estimates.profileMinutes` | **금지** (`AC-2R-09`) |
| `/onboarding` InfoRow 1 | `instrument.estimates.surveyMinutes` + `questions.length + survey.items.length` | **금지** |
| InfoRow 2 (양쪽) | 고정 문구 (숫자 없음) | — |

- copy 모듈은 **함수 슬롯**만 제공한다: `intro.profile.duration(minutes)` · `intro.survey.duration(minutes, cards)`.
- Figma 의 `about 10 cards` 는 **디자인 시점 예시값** → 허용 차이 `AD-S2R-01`.
- 단수/복수(`1 minute` / `3 minutes` / `16 cards`)는 copy 함수가 처리한다. Figma 의 `About 1 minutes` 는 **오타**이며 구현에 옮기지 않는다 → `AD-S2R-02`.

### 2.4 `S2R-OPEN-1` — **A 채택 확정** (`§11.10`)

`179:1748` 본문에서 **숫자 절(`Ten short questions`)과 기간 절(`in the last two weeks`)을 제거**하고 남은 Figma 문장을 쓴다: `No right answers — we just need a starting point.`

| 근거 | 내용 |
|---|---|
| ① | 숫자는 `R-03` 이 이미 InfoRow 로 옮겼으므로 본문에서 중복이다 |
| ② | `in the last two weeks` 는 Baseline 10문항에만 해당하는데 이제 Q1~Q5 를 포함한 16장 전체의 소개다 — **사실과 다른 문구**가 된다 |
| ③ | 남는 문장이 그 자체로 완결된 **Figma 원문**이다. 새 단어를 만들지 않는다 |

→ 허용 차이 `AD-S2R-11` (본문 부분 사용).

### 2.5 `S2R-OPEN-2` — **Figma 2화면 유지 확정** (`§11.10`)

제목·본문·InfoRow 가 전부 다르고, 사이에 입력 화면(`About your child`)이 끼어 있어 "프로필 끝 → 설문 시작"의 경계 신호가 된다.

---

## 3. 설문 카드 16장 — `179:1770` 디자인의 4단계 적용

### 3.1 상단 chrome — 제목만 바뀐다

```
[AppColumn padding-inline = --layout-gutter(24), padding-block-start = --layout-safe-top]
 TopBar variant=centered                                  ← 179:1772 / 179:1778 / 179:1775
   leading  IconButton(chevron-left)   "Previous question" (첫 카드에서는 "Go back")
   title    단계 제목 (아래 표)          --text-subheadline, truncate 1, aria-live="polite"
   trailing IconButton(chevron-right)  "Next question"  — 네 단계 **전부**
 (gap --space-4 = 16)
 ProgressBar tone=accent size=sm  segments=[2,3,1,10]  value = currentIndex / 16   ← 179:1779 / 179:1780
 (gap --space-6 = 24)
 SwipeDeck depth=3
```

**확정 구성 (`§11.12`)**

| 단계 | step enum | route slug | 화면 제목 | 카드 | 문항 |
|---|---|---|---|---|---|
| 1 | `reading_together` | `reading-together` | **Reading together** | 2 | Q1 · Q4 |
| 2 | `books_and_interests` | `books-and-interests` | **Books and interests** | **3** | Q3 · **Q5(제목 목록)** · **favorites(검색)** |
| 3 | `growing_together` | `growing-together` | **Growing together** | 1 | Q2 |
| 4 | `capability_items` | `capability-items` | **Capability** (`R-13`) | 10 | Baseline |
| | | | | **16** | |

- 제목 문구의 소유자는 **copy 모듈**이다. 현행 `copy.steps.capability_items = 'What you have noticed'` 는 `R-13` 으로 **`Capability`** 로 교체된다.
- 타이포 검산: TopBar centered title = `--text-subheadline`(15/20) `truncate=1`. 가장 긴 `Books and interests` ≈ 135px ≤ Figma 제목 노드 폭 201 → **줄바꿈·말줄임 없음**.
- `179:1775` 는 Figma 에서 x=372 w=38 → 우측 끝 **410 > 393** 으로 프레임 밖이다. Figma 슬립 → `AD-S2R-03`.
- 단계 전환 모션 없음(즉시 교체). 제목만 `aria-live="polite"`.

### 3.2 하단 CTA — **카드 단계에서는 그리지 않는다** (`§11.7` 확정)

| 근거 | 내용 |
|---|---|
| Figma | `179:1770` 트리에 **Button 노드가 0건**이다 (사용자 지시로 재확인 완료) |
| Figma copy | `179:1767` `Swipe each card away to move on` — 전진 수단을 Figma 가 명시한다 |
| 세로 예산 | CTA 블록(`pt-8` 32 + Button 58 ≈ **90**)을 유지하면 16장 중 대부분이 뷰포트를 넘는다 (§5) |

| 항목 | 규격 |
|---|---|
| 전진 | ① 카드 좌 스와이프 ② TopBar trailing chevron ③ **단일 선택 카드는 자동 전진** (§14) |
| 후퇴 | ① 우 스와이프 ② TopBar leading chevron. 첫 카드의 leading = 이전 route |
| 필수 미응답 차단 | 전진 어포던스(`chevron-right`)에 `aria-disabled="true"` + **카드 안쪽** 옵션 아래 1행 사유 문구. 문구·톤 규칙은 §2.9 `S2-ONB-1` 규격 **그대로** (`--text-caption-1` / `--color-fg-secondary`, 오류 톤 아님, `aria-describedby`) |
| 제출 CTA | **마지막 카드(16장째 = IM3)에서만** CTA 블록을 렌더한다. 라벨은 기존 규칙 유지 (Trial = `Save profile`, 인증 = `Finish`) |
| 단계 경계 | 단계가 바뀌어도 **CTA 는 생기지 않는다** |

### 3.3 카운터와 ProgressBar (`R-02`)

| 항목 | 규격 |
|---|---|
| 카운터 | 카드 **안쪽** 좌상단, `--text-caption-1` / `--color-fg-secondary` ← `179:1784/1785` |
| 값 | **전체 통산 `n / 16`**. 단계가 바뀌어도 끊기지 않는다 |
| 숫자의 출처 | `instrument.questions.length + instrument.survey.items.length` **파생값**. copy 는 `survey.counter(index, total)` 함수 슬롯만 소유 — **숫자 리터럴 금지** (`AC-2R-09`) |
| ProgressBar | `179:1779`(track 345×6) / `179:1780`(fill) 그대로. `--radius-pill`, `tone=accent`, `size=sm` |
| **단계 구간** | track 을 카드 수 비율 **2 : 3 : 1 : 10** 4구간으로 나눈다. 구간 사이 `--space-0-5`(2) gap 으로 앱 배경이 비친다. 각 구간은 독립 track + fill 이며 왼쪽부터 채워진다. 비율은 **instrument 파생값**이다 — 배열을 코드에 박지 않는다 |
| 텍스트 병기 | 진행바 아래 caption(`Step n of 5`)을 **제거한다**. ProgressBar 에 `aria-valuetext="{n} of 16"`. 시각 텍스트 병기는 카드 안 `n / 16` 이 담당 |
| 보조 라인 | `Reading together · 2 of 2` 보조 라인 **두지 않는다** (`S2R-OPEN-5` 확정, `§11.10`) |

- `ProgressBar` 에 `segments?: readonly number[]` prop 신규 — `packages/ui` 변경 1건 (§8).
- `/onboarding/child-info` 는 ProgressBar 를 그리지 않는다 — Figma `248:1159` 에 없다.

### 3.4 카드 내부 규격 — `179:1783` 실측 (재확인 2026-10-03)

| 항목 | Figma | 토큰 | 비고 |
|---|---|---|---|
| 카드 | x24 y164 **345×546**, radius 30, fill `rgba(255,255,255,.85)` | `--radius-card`(28) · `--color-surface-strong` · `--shadow-glass-rest` | `AD-S2-7` 기존 흡수 |
| **내부 여백** | 콘텐츠 x=**24**, counter y=**24** | **`--space-6`** | **`S2-FIX-3` 수정 후 값과 일치**. 현행 구현은 20+24=44 (4겹 버그) |
| **내부 폭** | 345 − 48 = **297** | — | `S2-FIX-3` 수정으로 257 → **297 (+40)** |
| counter | `179:1784` y24 h14 | `--text-caption-1` | |
| counter → eyebrow | 38 → 78 = **40** | `--space-10` | |
| eyebrow | `179:1786` y78 h14, 대문자 | `--text-caption-1` + CSS `text-transform` | 문자열 가공 금지 |
| eyebrow → 문항 | 7 | `--space-1`(4) | 기존 구현값 유지 |
| 문항 | `179:1787` w297 h104 (4줄) | `--text-title-3`(20/25) `--color-fg-strong` | |
| 문항 → 옵션 | 45 | **`--space-6`(24) 유지** | `S2R-OPEN-6` 확정 (`§11.10`) → 허용 차이 `AD-S2R-10` |
| 옵션 행 | 297×**43**, 행 간격 **7** | `--radio-row-height`(44) · `--space-2`(8) | 기존 흡수 |
| 라디오 원 | `179:1790` 15×15, 중심 21.5 = 행 중앙 | `--radio-dot-size` | |
| 체크박스 | `179:1742` 22×22 (inner 13) | `--checkbox-size` | **22 > 15 이므로 복수 선택 행은 46**(= 22 + 24) — 단일 선택 44 보다 **2px 높다**. `align-items:center` 라 시각 문제 없음. 기록만 한다 |
| 라벨 | x41 → dot(15) + gap **11** | `--space-3`(12) | |
| 옵션 블록 bottom | 491. 카드 546 → **아래 55 여유** | — | Figma 카드는 고정 546, 콘텐츠는 491 에서 끝난다 |
| 해제 버튼 | `179:1804` x292 y12 **38×38** | — | **카드 패딩 안쪽에 겹쳐 있다** → absolute (§3.5) |

### 3.5 해제 IconButton 은 흐름에서 빼낸다

현행 구현은 counter 와 해제 IconButton 을 같은 flex row 에 둔다 → 행이 16 → **38** 로 커져 카드가 **22px 높아진다**. Figma `179:1804` 는 y12(패딩 영역 침범) = absolute 다.

```
.haru-survey-card  { position: relative; }
.haru-survey-card__clear {
  position: absolute;
  inset-block-start: var(--space-3);   /* Figma 12 */
  inset-inline-end:  var(--space-3);   /* Figma 15 → 12 흡수 */
}
```

- counter 행이 `--text-caption-1` 1줄(16)로 되돌아간다 → **카드 22px 회수**, Figma 와 일치.
- 터치 타깃: 시각 38, hit 44 (`IconButton` 기존 규칙).
- DOM 순서는 counter 다음 — 읽기 순서 변화 없음. 신규 토큰 0건.

### 3.6 선택지 컨트롤 — 단일 / 복수 / "답 없음"

| 유형 | 문항 | 컨트롤 |
|---|---|---|
| 단일 선택 (12장) | Q1 · Q4 · Baseline 10 | `RadioGroup variant="card"` (현행) |
| **복수 선택 (3장)** | Q3(max 2, 배타) · **Q5(무제한)** · Q2(max 2, 최소 1) | **`CheckboxGroup variant="card"` 신규 variant** (§8.1) — `C-13 ①` 승인 |
| 자유 입력 (1장) | favorites | `TextField`(제목 입력) + `ListGroup`/`ListRow` (§6.3). **검색 없음** (`§11.13`) |
| "답 없음" 분리 | Baseline `not_observed` · Q3 `not_sure_yet` | 구분선 + `--color-surface-note` (§3.7) |

**복수 선택 카드가 Chip 이 아니라 행이어야 하는 이유**

| 근거 | 내용 |
|---|---|
| 사용자 지시 | "네 단계 전부 **동일한 카드 디자인**". 같은 덱 안에서 한 장은 15px 행, 다음 장은 12px pill 이면 같은 디자인이 아니다 |
| 라벨 길이 | Q3 최장 `Colors, art, things that look beautiful or interesting`(54자) — Chip 에 담으면 pill 1개가 1행을 거의 채운다. **결과적으로 행 목록인데 타이포만 작아진다** |
| 터치 타깃 | Chip 높이 31 < 44. 행은 46 ✔ |
| Q5 | **8권 제목 목록도 같은 컴포넌트로 해결된다** (`§11.11`) — 3장이 하나의 variant 를 공유한다 |

### 3.7 "답 없음" 옵션의 분리 규칙 — 데이터 구동으로 일반화

**규칙**: instrument 가 `exclusive: true` 로 내려준 옵션(복수 선택) 또는 비채점 값(`not_observed`, 단일 척도)은 **옵션 목록 마지막에 구분선과 함께 분리**해 렌더한다. 화면은 코드 이름을 **하드코딩하지 않는다**.

- 구분선 구현은 **`S2-FIX-2` ③ 명세 그대로** (`::before` 가로선, 행 안쪽 padding 금지 — §9.2).
- caption `This one isn't scored.` 는 **Baseline 에만** 붙는다. Q3 는 구분선만 (채점 개념이 없다).
- **Q5 에는 배타 옵션이 없다** — 8권 전부 평등하다. 분리 없음.
- 신규 토큰 0건.

---

## 4. `About your child` — `248:1159` (393×1132)

### 4.1 실측 (2026-10-03)

```
y    0   Screen/Status Bar (Figma 장식 — 웹 미렌더)
y   57   IconButton(back) 248:1172  38×38  x24
y   66   TopBar title 248:1175  x84 w225 h20
──── 스크롤 영역 244:1433  y113  h865 ────
   +  0  Trial notice 248:1179  x24 345×98   (title x+29 y+17 h20 / body x+29 y+45 h36 = 2줄)
   + 18  gap
   +116  YOUR CHILD   section label 244:1427 x26 y+10 h14 (행 h34) · Input 244:1199 x26 341×102
   + 18  gap
   +271  ABOUT YOU    section label 244:1430 (행 h34) · Input 244:1302 x26 341×67
   + 18  gap
   +391  AT HOME      section label 244:1313 (행 h34)
          Languages 244:1314 x23.5 346×143 — legend x+10 y+20 w345 h18 / chips x+10 y+52 326×73 (Select 7, 2행 y0·y40, h31~33)
   + 18  gap
   +587  Reading routine label 244:1358 (행 h34) · Answer card 244:1394 x26 341×243 (= 43×5 + 7×4)
──── 스크롤 영역 끝 y978 ────
y 1032  Button/Next 249:1231  x24 345×56   → bottom 1088
y 1132  frame bottom                        → **하단 여백 44** ✔
```

**섹션 간 간격 18** 은 `--space-*` 스케일(…16 · 20…)에 없다 → **`--space-5`(20) 흡수** (Stage 0 #10). 4곳 × +2 → 허용 차이 `AD-S2R-04`.

### 4.2 `YOUR CHILD` Input `244:1199` 내부 — `179:1740` 과 **같은 인스턴스**

```
Input 341×102   (좌우 inset 18 → 내부 305)
 ├ Row A  y6 h43
 │    label  "Child's last name | first name"   x+4 y+4 h14
 │    value row  x+4 y+20 w293 h19
 │       text  "Haru, Kim"  w146      Tag  x212 81×18   ← 성별 ("Not selected ⌄")
 ├ divider  y51 x18 w305 h1
 └ Row B  y54 h42
      label  "Birth month"  x+4 y+4 h14    value "March. 2023" x+4 y+20 h19
      Tag    x227+10 76×26                 ← 나이 "3yr 4mo"
```

→ 토큰 매핑: `Surface fill=strong radius=surface` + `TextField` 2행(label `--field-label-size` / value `--field-value-size`) + `--color-divider` 1px + 우측 슬롯.

### 4.3 ★ `R-08` — 표시 전용처럼 보이되 편집 가능한 규격

**문제의 정확한 형태** (`F-3`): HARU 의 `TextField` 는 **테두리가 없는** label-above-value 행이다. 즉 **편집 가능한 상태가 이미 "그냥 텍스트"처럼 보인다.** 따라서 "읽기 전용처럼 보이게" 하려고 뺄 장식이 없다. 구분은 **빼기가 아니라 더하기**로만 만들 수 있다.

| | `display` (기본) | `edit` |
|---|---|---|
| 진입 | 로컬 draft 에 값이 있을 때 | 행 탭 · 섹션 헤더 연필 탭 · draft 값 없음(`missing-prefill`) |
| 행 요소 | `<button type="button">` — label + value | `TextField` (현행 그대로) |
| label | `--field-label-size` / `--color-fg-secondary` (`P-01`) — 동일 | 동일 |
| value | `--field-value-size` / **`--color-fg-strong`** | 동일 |
| **구분 신호 ①** | caret 없음 · placeholder 없음. 빈 값이면 애초에 `edit` 로 진입하므로 **display 모드에 회색 placeholder 가 뜨는 경우가 없다** | caret · placeholder 존재 |
| **구분 신호 ② (핵심)** | 섹션 헤더 행(`244:1426`, h34) **우측 끝**에 `IconButton(pencil) variant=plain` 1개. 시각 20, hit 44 | 같은 자리에 `TextLink` "Done" |
| **구분 신호 ③** | 행 전체 press 피드백: `--color-surface-tinted` hover/active. **표시 전용 텍스트는 눌리지 않는다 — 눌리면 편집이다** | 행 focus ring (`TextField` 기존 규칙) |
| 성별 (`R-10`) | `Tag` (값 또는 `Not selected`) — **비대화형** | `SelectTrigger` (§4.1 기존 컴포넌트) |
| 나이 tag | `Tag` 파생값 — **두 모드 모두 비대화형** (`R-09` · `D-10`) | 동일 |
| 전환 | 모션 없음(즉시 교체). 탭한 행의 입력에 **포커스 이동** |
| 되돌림 | `edit` 에서 값이 유효하면 blur · "Done" · 화면 이탈 시 `display` 복귀. 유효하지 않으면 `edit` 유지 + 필드 에러 |

**왜 "행마다 연필"이 아니라 "섹션 1개"인가**

| 근거 | 내용 |
|---|---|
| ① | Figma 가 **두 행의 우측 슬롯을 이미 쓰고 있다** — Row A 성별 Tag(81×18), Row B 나이 Tag(76×26). 행마다 연필을 넣으면 컨트롤이 겹친다 |
| ② | 편집 단위가 **행이 아니라 카드**다 — 이름·생년월·성별은 한 번에 고치는 묶음이다 |
| ③ | 터치 타깃 44 아이콘 3개를 늘리면 탭 가능 요소가 **7 → 10** 으로 늘어 스크린리더 탐색이 길어진다 |
| ④ | 그래도 **행 탭은 유효하다** (`R-08` "탭하면 고칠 수 있게") — 행 자체가 `<button>` 이다. 연필은 **발견 가능성**, 행 탭은 **도달 경로** |

**접근성**

| 요소 | 규격 |
|---|---|
| display 행 | `<button>`, 접근성 이름 = `{label}, {value}` + `aria-describedby` → 숨김 텍스트 `Edit` |
| 섹션 연필 | `aria-label` = `Edit your child's name, birth month and gender` (copy 모듈 소유) |
| 값 변경 알림 | `edit → display` 복귀 시 `aria-live` **쓰지 않는다** — 사용자가 직접 한 조작이다 |
| `readonly` input | **쓰지 않는다.** 포커스를 받으면서 타이핑이 안 돼 가장 혼란스럽다 |
| 나이 tag | `aria-hidden` 아님. 접근성 이름 = `3 years 4 months` (copy 함수) |

**Figma 와의 차이**: `AD-S2R-05`(연필 추가 — `R-08` 을 표현할 Figma 요소가 없다) · `AD-S2R-06`(성별 `SelectTrigger` → `Tag`, `R-10`).

### 4.4 `R-07` — Trial 안내 2상태 레이아웃

| 상태 | 조건 | 레이아웃 |
|---|---|---|
| **A. 안내 있음** | 미로그인(Trial, `C-12`) | Figma `248:1159` 그대로. 상단 `248:1179`(345×98) + gap 20. **총 1132** |
| **B. 안내 없음** | 가입 완료 후 도달 | 안내 블록과 gap 이 **통째로 사라진다**. 아래 전부 **−118**. **총 1014** |

- B 에서 자리표시·스켈레톤·대체 문구를 넣지 않는다 (§2.8 빈 슬롯 규칙과 같은 원칙).
- 안내는 기존 `OnboardingNotices` 소유 — 신규 컴포넌트 0건.

### 4.5 `missing-prefill` 상태 (`C-13 ③` — design-agent 명세 승인)

| 항목 | 규격 |
|---|---|
| 조건 | 로컬 draft 에 `child_info` 없음 (기기 변경 · draft 만료 `D-3` · 직접 URL 진입) |
| 레이아웃 | `YOUR CHILD` 카드가 **`edit` 모드로 진입**. 나머지 섹션 동일 |
| 에러 | 진입 시 **표시하지 않는다.** 아직 하지 않은 일은 오류가 아니다 (rules/frontend §8) |
| 안내 | 별도 문구를 **만들지 않는다** — 빈 입력 폼 자체가 상태를 말한다 |
| 신규 화면 | **0건** — 기존 화면의 모드 분기 |

### 4.6 나머지 섹션 (변경 없음 확인)

- `ABOUT YOU` 관계 1행(`244:1302` 341×67) → `SelectTrigger` + Sheet. `R-11`(`PATCH /v1/me`) 유지, 화면 위치 유지.
- `AT HOME` 언어 chip wrap — `244:1327` 326×73, 2행(행 간격 7 → `--space-2`), chip 높이 31 → `--chip-height`. **폭 고정 금지** — 라벨 길이에 따라 자연 wrap.
- `Reading routine` `244:1394` 341×243 = `RadioGroup variant="card"` 5행 — 설문 카드와 **같은 기하**. `S2-FIX-2` 적용 대상 (§9.2).

---

## 5. ★ 세로 예산 검산 — 카드 16장

### 5.1 측정 방법

- Playwright/Chromium 1.63, `deviceScaleFactor: 1`, macOS(`-apple-system` → SF Pro = Apple 기기 타깃과 동일), 2026-10-03.
- **저장소의 실제 CSS 를 그대로 로드**해 측정했다 — `packages/design-tokens/src/{primitive,semantic,component}/*.css` + `packages/ui/src/field/{TextField,Checkbox,RadioGroup}.css` + `list/List.css` (`@theme` → `:root` 치환만 적용).
- 적용 상태: **`S2-FIX-3` 후 내부 폭 297** + **`S2-FIX-2` 후 옵션 `padding-block: var(--space-3)`** + **§3.5 해제 버튼 absolute**.
- 문항·선택지·책 제목은 `copy.ts` / `mocks/fixtures/books.ts` / 질문지 v1.1 **원문 그대로**.
- ⚠ **계산 검산이다.** 재구성 화면은 아직 없다 — development-agent 가 구현 후 재측정해야 한다.

### 5.2 세로 예산

| 항목 | 값 | 근거 |
|---|---|---|
| 뷰포트 | 852 | Figma frame / Playwright baseline |
| 카드 top | **98** | `stage-2-design-spec.md` §16.3 실측 (front bottom 776 − height 678). 웹에는 Figma 의 56px status bar 가 없다 |
| 하단 인셋 | **44** | `--layout-cta-bottom-gap` (`D-25`) |
| 뒤 카드 peek | **32** | `--deck-peek-y`(16) × 2 레벨 |
| **앞 카드 가용 높이** | **678** | 852 − 98 − 44 − 32 |

### 5.3 결과 — 16장 전체 (카드 폭 345 / 내부 297)

| # | 단계 | 카드 | 높이 | 678 |
|---|---|---|---|---|
| 1 | Reading together | Q1 story_comfort | **483** | ✔ |
| 2 | | Q4 read_aloud_behavior | **450** | ✔ |
| 3 | Books and interests | Q3 topic_tags (+배타 분리행) | **583** | ✔ |
| 4 | | **Q5 owned_books (제목 목록 8)** | **638** | ✔ |
| 5 | | **favorites (검색 없음, 선택 5 최대)** | **619** | ✔ |
| 6 | Growing together | Q2 growth_goals | **478** | ✔ |
| 7 | Capability | ER1 | **605** | ✔ |
| 8 | | **ER2** | **630** | ✔ |
| 9 | | **AG1** | **630** | ✔ |
| 10 | | AG2 | **605** | ✔ |
| 11 | | AG3 | **605** | ✔ |
| 12 | | CF1 | **605** | ✔ |
| 13 | | CF2 | **605** | ✔ |
| 14 | | **IM1** | **630** | ✔ |
| 15 | | IM2 | **580** | ✔ |
| 16 | | IM3 | **580** | ✔ |

**결론: 16장 전부 들어간다.** 최장 **Q5 638** ≤ 678, 여유 **40**.
마지막 카드(IM3 580) + 제출 CTA 90 = **670 ≤ 678** ✔ — 제출 상태도 스크롤 없이 들어간다.

### 5.4 favorites 카드 상태별 — **검색 제거 후 재측정** (`§11.13`)

측정 조건은 §5.1 과 같다. 입력 필드 + `Up to 5.` 힌트 + 선택 목록(`ListRow` 68 = trailing IconButton 44 + padding 24)만 남는다.

| 선택 권수 | 높이 | 678 | 비고 |
|---|---|---|---|
| **0** | **235** | ✔ | 입력 필드만 |
| 1 | 315 | ✔ | |
| **3** | **453** | ✔ | |
| **5** (+ 상한 안내) | **619** | ✔ **(여유 59)** | **최댓값 — 상한 5 가 보장한다** |

- **320 · 480 폭에서도 값이 같다** (235 / 453 / 619). 행 높이를 trailing IconButton(44)이 지배해 제목이 2줄이 돼도 68 을 넘지 않는다 → **폭에 둔감한 유일한 카드**다.
- 입력 필드에 보이는 라벨을 두든 안 두든 **높이가 같다**(차이 0) — 행 높이는 `Add` 액션(44)이 정한다. §6.4 `S2R-OPEN-9` 의 선택이 레이아웃에 영향을 주지 않는다.

**폐기된 수치 (개정 1)**: 검색 결과를 카드 안에 두던 안의 측정치(결과 8 + 선택 5 = **1110**, 결과 8 + 선택 0 = 734)와 `Sheet` 안(582)은 **`§11.13` 으로 전부 무효**다. 기록만 남긴다 — 검색이 없는 지금은 **가변 블록이 1개뿐이고 상한이 5로 고정**되어 초과 상태가 존재하지 않는다.

### 5.5 다른 폭

| 폭 | 카드 폭 | 결과 |
|---|---|---|
| **320** | 272 | **Q5 728(+50) · Q3 688(+10) · AG1 680(+2)** → **3장 스크롤**. 나머지 13장은 여유. 320 은 원래 reflow·스크롤 전제 폭(`AC-2-59`) — FAIL 사유 아님 |
| **600 / 1024** | 432 (앱 컬럼 480 − gutter 48) | 최장 Q5 **622** → 전부 여유 |

### 5.6 세로 예산이 빠듯해진 원인 (기록)

Figma `179:1783` 는 콘텐츠가 491 에서 끝나고 546 안에 55 여유가 있다. 구현이 더 큰 이유는 **비채점 6번째 옵션**이다 — `C13-08` 로 design-agent 가 추가한 행이며 **Figma 에 없다**. 2줄(64) + 구분선 간격(33) = **97**. 이걸 빼면 ER1 이 Figma 546 안에 들어간다. `C13-08` 은 승인된 명세이므로 **제거하지 않고 기록만** 한다.

---

## 6. Books and interests — Q5 · favorites (`§11.9` · `§11.11` · `§11.13`)

### 6.1 Q5 — **제목 체크박스 목록** (`§11.11` 확정)

2열 표지 그리드는 **채택하지 않는다.** `R-04` 로 표지 이미지를 쓰지 않는데 빈 썸네일 8개를 늘어놓을 이유가 없다. 초판의 `BookChoiceCell`·media 34×48 설계는 **전부 폐기**한다.

```
head
  q    "Which of these does your child already know well?"        --text-title-3
  desc "Tap any books you've read together more than a few times." --text-caption-1 / secondary
       ← 질문지 v1.1 원문. 문구 창작 금지
options  CheckboxGroup variant="card"  — Q2·Q3 와 **완전히 같은 컴포넌트**
  row × 8   min 46 · padding-block --space-3 · padding-inline --space-4
            --radius-field · --color-surface-subtle · gap --space-2
  label     --text-subheadline(15/20)   ← 책 제목
```

| 항목 | 규격 |
|---|---|
| 제목 8종 | **Mock fixture 소유** (`apps/web/src/mocks/fixtures/books.ts` 에 이미 전부 있다). 화면·copy 모듈 하드코딩 **금지** |
| 저자 | **표시하지 않는다.** 행이 2줄이 되고(subtitle) 카드가 커지며, 선택 판단에 필요하지 않다 |
| 선택 규칙 | 복수·무제한. 배타 옵션 없음 → §3.7 분리 없음 |
| 선택 표시 | `--color-selected-bg` + 체크마크 (`Checkbox` 기존 규칙 — **색 단독 구분 금지**) |
| 높이 | **638** @345 (8행 전부 1줄) · 728 @272 (일부 2줄) · 622 @432 |
| 저작권 | 책 **제목 문자열**은 저작물이 아니다 — 너무 짧고, 특정 책을 가리키는 **지시적 사용**이다. 보호 대상인 **표지 아트워크를 쓰지 않는다** |
| 후속 여지 | 저작권이 해결되고 디자이너가 표지를 원하면 **행에 media 슬롯을 더하는 변경**이다. contract(`owned_books`)·화면 구조·카드 수는 바뀌지 않는다 |

### 6.2 favorites — **검색 제거** (`§11.13` 확정)

Figma `30:74`(Library)와 `179:1770`(설문 카드) **어디에도 검색 입력·검색 아이콘이 없다** (2026-10-03 재확인). 검색은 **PRD §7.2 Step 3** 만을 근거로 현재 구현에 들어간 것이다.

| 근거 | 내용 |
|---|---|
| ① | 검색의 유일한 역할은 고른 책을 인벤토리 `bookId` 로 매칭하는 것인데, **그 역할은 Q5 가 8권 체크로 이미 수행**한다 (`owned_books`) |
| ② | 질문지 v1.1 의 추천 state vector(`comfort_zone` · `axis_weights` · `interest_weights` · `channel` · `owned_books`)에 **favorites 가 없다** — 엔진 용도가 정의되어 있지 않으므로 ID 매칭이 필요 없다 |
| ③ | 문항 문장(`Books your child loves`) 자체가 검색을 요구하지 않는다 |
| ④ | 개정 1 이 지적한 **카드 넘침(최대 1110)의 원인이 그대로 사라진다** — 가변 블록이 2개에서 1개로 줄고, 남은 1개에 상한 5 가 걸린다 |

→ **개정 1 의 검색 `Sheet` 설계(§6.3 D안)와 그에 딸린 `C-13` 신규 1건은 폐기한다.** 디자이너 대기 **0건**.

**제거 대상** (development-agent 인계 — §17-10)

| 구분 | 항목 |
|---|---|
| copy (`onboardingCopy.books`) | `searchLabel` · `searchClear` · `searchLoading` · `searchFailed` · `tryAgain`(검색용) · `emptyTitle` · `emptyDescription` · `addTyped` · `homeSection` · `homeLabel` · `homeAdd` · `homeListLabel` |
| UI | 검색 `TextField` · 결과 `ListGroup`/`ListRow(subtitle=author)` · `EmptyState` · 로딩 `Skeleton` · 검색 실패 `InlineAlert` + 재시도 · `Books at home` 블록 전체 |
| API | **온보딩 경로의 책 검색 호출** (`useBookSearch` → `GET /v1/books/search`) |
| Mock | 시나리오 `book-search-empty`, 검색 `error`/`retry`/`offline` 변형 (온보딩 한정) |
| contracts | `homeBooks` · `HOME_BOOKS_MAX` |

- **`GET /v1/books/search` contract 자체는 지우지 않는다** — Stage 3 Library 소관이다. 지우는 것은 **온보딩에서의 호출과 UI** 다.
- **`FavoriteBookSchema.bookId` 는 선택 필드로 유지**한다 (`§11.13`). Stage 3 서재에서 인벤토리 책을 favorites 에 넣는 경로가 생길 수 있으므로 contract 를 좁히지 않는다. 온보딩에서는 `title` 만 채워진다.

### 6.3 favorites 카드 명세 — 제목 직접 입력

```
head
  q  "Books your child loves"              --text-title-3   ← 기존 copy.books.favoritesSection 의 문장형 (§11.14)
content (gap --space-3)
  ├ TextField  (제목 입력)                  ← 보이는 라벨은 S2R-OPEN-9 (§6.4)
  │    shell  padding-inline --field-padding-x(20) · padding-block --field-padding-y(6) · --field-radius(22) · --color-surface-strong
  │    trailingAction  "Add"                ← 기존 copy.books.homeAdd. 입력이 비면 렌더하지 않는다
  │    helperText      "Up to 5."           ← 기존 copy.books.favoritesHint
  ├ Text (상한 도달 시만)  "You can pick up to 5."   --text-caption-1 / secondary   ← 기존 copy.books.limitReached
  └ ListGroup (선택된 책, 0~5행)            ← 목록이 비면 그리지 않는다
       ListRow  title = 책 제목 (--text-footnote)
                trailing = IconButton(x)  "Remove {title}"   ← 기존 copy.books.remove
       행 68 (= trailing hit 44 + padding-block 24)
```

| 항목 | 규격 |
|---|---|
| 카드 타입 | **`ONBOARDING_CHOICE_QUESTIONS` 가 아니다** (`§11.14`). 질문지 문항이 아니므로 instrument 의 선택형 문항 목록에 넣지 않고 **별도 카드 타입**으로 덱에 끼운다. 카드 수 파생값은 이 1장을 포함해 계산한다 |
| 상한 | `FAVORITE_BOOKS_MAX` = **5 유지**. 화면이 5 를 모른다 — contracts 값만 읽는다 (`AC-2R-09`) |
| 중복 | 같은 제목이 이미 있으면 추가하지 않는다 (현행 `addFavorite` 동작 유지). 안내 문구를 새로 만들지 않는다 — 추가되지 않는 것으로 충분하다 |
| 공백 | `trim()` 후 빈 문자열이면 `Add` 를 렌더하지 않는다 (현행 동작) |
| 상한 도달 | 입력 필드를 **`disabled`** 로 두고 `limitReached` 를 보인다. 필드를 **숨기지 않는다** — 사라지면 "입력이 없어졌다"로 읽힌다 (§15 상한 규칙) |
| 필수 여부 | **선택** (기존 Step 3 규칙, `S2-ONB-1`). 0권이어도 전진 가능 |
| 자동 전진 | **없음** (§14 — 자유 입력 카드는 수동) |
| `Books at home` | **삭제** (`§11.9`) |
| 가변 블록 | **1개(선택 목록 0~5)** 뿐이고 상한이 걸려 있다 → 카드 최대 **619** 확정 (§5.4) |
| 키보드 | 키보드가 올라와도 카드가 최대 619 라 뷰포트 안에 머문다. **Sheet·내부 스크롤이 필요 없다** |
| 접근성 | 입력 접근성 이름은 §6.4 결정에 따른다. `Add` 는 `<button>` (hit 44). 목록 `ListGroup label` = 기존 `copy.books.selectedLabel`("Books you picked"). 추가·삭제를 `aria-live="polite"` 로 알리지 **않는다** — 목록 변화가 포커스 근처에서 보인다 |

### 6.4 ⚠ 입력 필드의 보이는 라벨 — 승인 필요 (`S2R-OPEN-9`)

`§11.14` 로 **문항 문구는 `Books your child loves` 로 확정**되었다 (`S2R-OPEN-8` 해소). 남은 것은 **입력 필드 자체의 라벨**이다. 기존 copy 에 쓸 수 있는 문자열이 없다 — `searchLabel`("Search a book")은 제거 대상이고 `homeLabel`("Add a book at home")은 다른 블록 문구다.

| 안 | 내용 | 문구 창작 |
|---|---|---|
| **A (권장)** | **보이는 라벨을 두지 않는다.** 접근성 이름은 `aria-labelledby` → 카드 문항(`Books your child loves`), 보조 설명은 `aria-describedby` → helper(`Up to 5.`) | **0건** |
| B | 기획이 라벨 1건을 정한다 | 1건 — 이 카드가 차단된다 |
| C | design-agent 가 라벨을 만든다 | **금지** |

**권장: A.** 근거 — ① 카드에 문항이 이미 크게 쓰여 있어 라벨이 같은 말을 반복한다 ② `TextField` 는 테두리가 없는 라벨-값 구조라 라벨이 없으면 **값 1줄**만 남는데, `Add` 액션이 있어 입력 자리임이 전달된다 ③ **레이아웃 영향 0** — 라벨 유무로 카드 높이가 바뀌지 않는다 (§5.4 측정).
**접근성 보완**: 보이는 라벨이 없을 때 WCAG 3.3.2 는 `aria-labelledby` + 보이는 helper 로 충족한다. `placeholder` 를 라벨 대신 쓰지 **않는다** (입력하면 사라져 맥락이 소실된다).

---

## 7. `Create account` `179:1724` — `YOUR CHILD` 섹션 (`R-01` A)

### 7.1 레이아웃 실측

```
y  64  IconButton(back) 179:1726 38×38 x24 · title 179:1729 x74 y72 h20
y 112  Frame 8 (스크롤 영역) h412
   +  0  YOU         label 179:1733 (행 h34) · Input 179:1734 x26 341×150 (3행)
   +184  hint 179:1736 "At least 8 characters." x26 y+8 h14 (행 h30)
   +224  YOUR CHILD  label 179:1739 (행 h34) · Input 179:1740 x26 341×102 (§4.2 와 동일 인스턴스)
   +360  동의 체크 행 179:1741 h52 — Checkbox 179:1742 x26 y+8 22×22 (inner 13) · Text 179:1745 x59 y+8 w312 h36 (2줄)
y 750  Button 179:1746 345×58 → bottom 808 → 하단 44 ✔
```

| 항목 | 토큰 |
|---|---|
| Checkbox 22 | `--checkbox-size` (기존). hit 44 는 `Checkbox.css` `min-block-size` 가 보장 |
| 동의 문구 | `--text-subheadline`(15/20) 2줄, w312 |
| 동의 행 ↔ Checkbox gap | 59 − 26 − 22 = **11** → `--space-3`(12) |

### 7.2 Privacy 시각 규격 (`R-01` · `AC-2R-13`)

| 항목 | 규격 |
|---|---|
| 아이 입력 3종 | 이름 · 생년월 · 성별(`SelectTrigger`) — **화면에서는 받는다** |
| 전송 | **`signUp` 요청 body 에 0건.** 값은 `OnboardingDraftStore` 로만 간다 |
| 한 줄 동의 체크 | **화면 진행 조건**이다. `POST /v1/consents` 를 호출하지 않는다. 5항목 동의는 `/auth/consent`(`C13-02`) |
| ⚠ 확정 사실 (`§11.10`) | Figma `179:1745` 의 한 줄 체크는 **아동 데이터 수집 동의가 아니다.** 문구 변경 여부는 **법무·기획 보류**(`L-02` 와 함께). design-agent 는 이 사실만 기록한다 |
| 나이 tag | 생년월 입력 즉시 `3yr 4mo` 파생 표시. 3~9세 밖이면 **여기서** 필드 에러 (`AC-2R-07`, `C-10`) |
| 콘솔 | 아이 이름이 로그·에러 리포트에 남지 않는다 |

### 7.3 `AC-2-56` 무효화

기존 허용 차이 `179:1724` **"보호자 영역만 · 아이 섹션 제거"** 는 `R-01` 로 성립하지 않는다. `AD-S2R-07` 로 대체: `179:1724` 는 **전체 프레임**을 비교 대상으로 한다.

---

## 8. 신규·변경 컴포넌트

### 8.1 `packages/ui` (Shared UI)

| 컴포넌트 | 변경 | 근거 | Figma |
|---|---|---|---|
| **`CheckboxGroup`** | **`variant="card"` 신규** — `RadioGroup variant="card"` 와 **동일 기하**(min 44, `padding-block --space-3`, `padding-inline --space-4`, `--radius-field`, `--color-surface-subtle`, gap `--space-2`), 컨트롤만 원→사각(`Checkbox` 22). `exclusive` 옵션의 분리 렌더(§3.7) 포함 | §3.6 · Q2·Q3·**Q5** 3장이 공유 | 행 기하 `179:1788` + 컨트롤 `179:1742` 조합. **`C-13 ①` 승인 — 만들고 사후 디자이너 확인** |
| **`ProgressBar`** | **`segments?: readonly number[]` 신규** — 길이 비율대로 track 분할, 사이 `--space-0-5` gap, 왼쪽부터 fill | `R-02` | 단일 track `179:1779` → 같은 승인에 포함 |
| `TextField` · `ListGroup` · `ListRow` · `IconButton` | **변경 없음** — favorites 가 그대로 재사용 (§6.3) | | |
| `Sheet` · `EmptyState` · `Skeleton` · `InlineAlert` | **favorites 에서 사용 안 함** (`§11.13` 검색 제거). `Sheet` 는 `248:1159`(언어·관계)에서 계속 쓴다 | | |
| `Tag` · `SelectTrigger` · `Chip` · `RadioGroup` · `Surface` · `TopBar` | 변경 없음 (`S2-FIX-2`·`S2-FIX-3` 제외 — §9) | | |

### 8.2 Domain 컴포넌트 (`apps/web/src/entities`)

| 컴포넌트 | 변경 |
|---|---|
| **`SurveyQuestionCard`** | ① `eyebrow` **선택 prop** (선택형 문항에는 없다) ② `description` prop 신규 — 문항 아래 `--text-caption-1`/`secondary`, gap `--space-1` ③ 해제 IconButton **absolute** (§3.5) ④ `blockedReason` 슬롯 — 옵션 아래 1행 ⑤ `children` 이 옵션 목록이 아닌 임의 콘텐츠(favorites 트리거+목록)도 받는다 |
| ~~`BookChoiceCell`~~ | **폐기** — `§11.11` 로 Q5 가 표지 그리드를 쓰지 않는다 |
| `CharacterMedallion` · `CharacterIllustration` | 변경 없음 |

### 8.3 Feature (`features/onboarding-survey`)

| 파일 | 처리 |
|---|---|
| `ui/SurveyCardDeck.tsx` **신규** | `CapabilityItemsStep` 의 덱 로직 승격. 4단계 공용. 문항 종류(단일/복수/favorites)에 따라 **내용만** 분기 |
| `ui/CapabilityItemsStep.tsx` | eyebrow · 비채점 caption 등 Baseline 전용분만 남긴다 |
| `ui/ChoiceQuestionList.tsx` | **폐기** — 목록 레이아웃이 사라진다 |
| `ui/BooksStep.tsx` | **favorites 카드로 축소**. **검색 블록 전체 삭제**(`§11.13`) · `Books at home` 블록 삭제 · Q3 렌더는 덱이 가져간다. 남는 것은 제목 입력 + 선택 목록뿐이다 |
| `ui/ChildInfoStep.tsx` | display/edit 2모드 (§4.3) |
| `ui/OnboardingIntro.tsx` | **2종 분리** (§2.2) |
| `ui/OnboardingWizard.tsx` | 제목 전환 · 통산 카운터 · ProgressBar segments · **카드 단계 CTA 미렌더** (§3.2) · 자동 전진 (§14) |
| `ui/OnboardingNotices.tsx` | Trial 안내 상태 분기 (§4.4) |
| `copy.ts` | `intro.profile` / `intro.survey` 분리 · 단계 제목 4종(`Capability`) · 숫자 함수 슬롯 · 편집 라벨 · **`books.search*`·`emptyTitle`·`emptyDescription`·`addTyped`·`tryAgain`·`home*` 삭제** (§6.2 표). `favoritesSection`·`favoritesHint`·`selectedLabel`·`limitReached`·`remove`·`homeAdd`(→ `Add` 액션으로 재사용) 는 **유지** |

> `packages/ui` 는 도메인을 모른다 — 책 관련 조립은 전부 `features`/`entities` 소유다 (`rules/architecture.md` §2).

---

## 9. 결함 3건 재검토 (`D-25`) — 재구성 레이아웃 기준

`stage-2-design-spec.md` §16 명세는 **전부 유효**하다. 아래는 적용 대상·영향이 재구성으로 **달라지는 부분만** 기록한다.

### 9.1 `S2-FIX-1` — CTA 하단 여백 44

| 항목 | 변화 |
|---|---|
| 명세 | 변경 없음 — `max(--layout-safe-bottom, --layout-cta-bottom-gap)`, `AppShell bottomGap="cta"` |
| route 수 | **13 → 14** (`/onboarding/start` 신규) |
| 근거 강화 | `248:1159` bottom 1088 → 1132 = **44** → **5프레임 일치** (`179:1746`·`179:1814`·`179:1844`·`243:1167`/`179:1768` 808→852 포함) |
| 카드 단계 | **CTA 가 없어도 44 를 적용한다** (`§11.3`-2 승인). §5.2 예산에 반영됨 |

### 9.2 `S2-FIX-2` — 2줄 선택지 `padding-block`

적용 대상이 **크게 넓어진다**.

| 화면 | 2줄 이상 옵션 행 수 (393 기준) |
|---|---|
| `reading-together` Q1 | **4 / 4** (전부 2줄) |
| `reading-together` Q4 | 1 / 5 |
| `books-and-interests` Q3 | **5 / 5** (전부 2줄) |
| `books-and-interests` **Q5** | **0 / 8** (393·480 에서 전부 1줄 · **320 에서 5행이 2줄**) |
| `growing-together` Q2 | **4 / 4** (전부 2줄) |
| `capability-items` ×10 | 1 / 6 (비채점 행) |
| `child-info` Reading routine · Sheet | 0 (변화 없음) |

- 기존 §16.2 영향 범위표는 **이 표로 대체**된다.
- **1줄 행은 여전히 1px 도 바뀌지 않는다** (`max(44, 20+12+12)` = 44). 단위 테스트로 고정할 것.
- §16.2 ④ "2줄 이상 라디오 원 = 박스 세로 중앙"(`§11.3`-3 승인)은 **Checkbox 에도 동일 적용**한다.
- 신규 토큰 **0건**. `--border-hairline` 은 `§11.3`-5 **보류** 결정대로 제안하지 않는다 — 리터럴 `1px` 유지.

### 9.3 `S2-FIX-3` — 덱 카드 흰 면 4겹

| 항목 | 변화 |
|---|---|
| 명세 | 변경 없음 — 표면 소유권을 `renderItem` 으로. **`SwipeDeck.tsx` 미수정 · `SwipeDeck.css` 에 `overflow` 신규 도입 금지** (`QA-2-001`·`QA-1-L1` 회귀 가드 **그대로**) |
| 사용처 | **2곳 → 5곳** (`SurveyCardDeck` 이 4 route + dev gallery `s2-deck`) |
| 결과 | 내부 폭 257 → **297 (+40)**. §5 의 모든 측정이 **297 기준**이다 — 이 수정 없이는 §5 결론이 성립하지 않는다 |
| 순서 | `S2-FIX-3` 는 재구성의 **선행 조건**이다 |
| favorites | **스크롤 컨테이너를 만들지 않는다** — 검색 제거로 가변 블록이 선택 목록 1개(상한 5)뿐이라 카드 최대 619 다 (`§11.13`). `QA-1-L1` 가드와 무관하다 |

### 9.4 회귀 가드 체크리스트 (development-agent 인계)

- [ ] `SwipeDeck.tsx` diff **0줄**
- [ ] `SwipeDeck.css` 의 `overflow` 선언 수 = **0** (수정 전후 동일)
- [ ] `RadioGroup` 1줄 행 높이 44 유지 (단위 테스트)
- [ ] `e2e/shadow.spec.ts` · `a11y.spec.ts` 통과
- [ ] `packages/ui/src/deck/__tests__/SwipeDeck.test.tsx` · `field/__tests__/RadioGroup.test.tsx` 통과

---

## 10. `C-13` — Figma 에 없는 화면·요소

### 10-1. 처리 완료 (`§11.7` · `§11.11`)

| 건 | 결정 | 상태 |
|---|---|---|
| 복수 선택 카드 변형 + ProgressBar segments | **만들고 사후 디자이너 승인** | ✅ 명세 §8.1 — Q2·Q3·**Q5** 3장이 한 variant 를 공유한다 |
| Q5 표지 그리드 | **그리드 폐기 → 제목 목록** | ✅ `C-13` 창작 문제 **소멸**. 디자이너 대기 0건 |
| `missing-prefill` · `instrument-v2` | **design-agent 명세** | ✅ §4.5 · §10-3 |
| favorites 검색 Sheet (개정 1 신규) | **철회** — `§11.13` 으로 검색 자체가 제거됐다 | ✅ §10-2 |

### 10-2. **철회** — favorites 검색 Sheet (`§11.13`)

개정 1 에서 올린 신규 `C-13` 1건(검색 Sheet)은 **철회한다.** 사용자가 **책 검색 자체를 제거**했으므로 Figma 에 없는 화면이 생기지 않는다.

| | 결과 |
|---|---|
| 디자이너 대기 | **0건** |
| Figma 에 없는 신규 화면 | **0건** — favorites 카드는 `TextField` + `ListGroup`/`ListRow` 조합이고 둘 다 Stage 2 에서 이미 승인·구현되어 있다 |
| 남은 `C-13` | **0건** |

### 10-3. `instrument-v2` 상태

| 상태 | 레이아웃 영향 |
|---|---|
| `instrument-v2` | 카운터 분모 · ProgressBar segments · intro InfoRow 숫자가 **전부 파생값**이라 자동 추종. **레이아웃 변화 0**. 단계가 늘면 `copy.steps` 에 키가 없는 단계가 생길 수 있다 → **제목 fallback = instrument 의 단계 label**, 그것도 없으면 TopBar 제목 없이 렌더(빈 문자열 금지) |

---

## 11. 상태 화면 · Mock 시나리오 매핑

| 화면 | Loading | Empty | Error | 기타 | Mock 시나리오 |
|---|---|---|---|---|---|
| `/onboarding/start` | instrument 로딩 → InfoRow 2행 Skeleton (레이아웃 유지) | — | `ErrorState` + 재시도 | — | `success` · `error` · `retry` |
| `/onboarding/child-info` | draft 읽기는 동기(로컬) → Loading 없음 | — | 저장 실패 → `InlineAlert tone=warning` (조용한 저장 규칙) | **Trial 안내 유/무**(§4.4) · **`missing-prefill`**(§4.5) | `prefilled-child-info` · `missing-prefill` · `consent-missing` |
| `/onboarding` | 상동 | — | 상동 | — | `success` · `instrument-v2` |
| 카드 4 route | instrument 로딩 → 덱 자리에 카드 1장 Skeleton | **`owned-books-empty`** → Q5 카드를 건너뛴다 (카드 수가 16 → 15 로 파생) | 저장 실패 → `InlineAlert` (카드 아래) | 필수 미응답 차단(§3.2) · `instrument-v2` | `success` · `draft-resume` · `onboarding-incomplete` · `instrument-v2` · `owned-books-empty` |
| **favorites 카드** | **없음** — 서버 호출이 0건이다 (`§11.13` 검색 제거) | 선택 0권 = **정상 상태**. 빈 목록은 그리지 않고 입력 필드만 보인다 — `EmptyState` 를 쓰지 않는다 | **없음** — 로컬 draft 저장 실패는 덱 공통 `InlineAlert` 가 담당 | 상한 5 도달 → 입력 `disabled` + `limitReached` | (전용 시나리오 없음. `book-search-empty` **폐기**) |
| `/onboarding/saved` | 제출 중 → CTA `loading` | — | `CHILD_LIMIT_REACHED` · 일반 실패 → `InlineAlert` | — | `capability-all-missing` · `persona-fallback` |

- Permission / Pending / Not Eligible: **이 범위에 해당 없음** (녹음·분석·리포트 Stage).
- `consent-missing` 은 `R-01` 의 핵심 회귀 — 동의 전 `PUT /v1/onboarding/steps/*` 가 `CONSENT_REQUIRED` 로 거부되는지.

### 11.1 시각 비교 baseline

| baseline | 처리 | 사유 |
|---|---|---|
| `s2-onboarding-step5.png` | **폐기 → `s2-deck-capability.png` 로 대체** | 단계 이름·카드 규격이 모두 바뀐다 |
| `s2-onboarding-start.png` | **신규** | `243:1147` |
| `s2-onboarding-childinfo-trial.png` | **신규** | `248:1159` 안내 **있음** (`R-07` A) |
| `s2-onboarding-childinfo.png` | **신규** | `248:1159` 안내 **없음** (`R-07` B) |
| `s2-onboarding-childinfo-edit.png` | **신규** | `YOUR CHILD` **edit 모드** (`R-08`) |
| `s2-deck-reading-together.png` | **신규** | 단일 선택 카드 |
| `s2-deck-books-q3.png` | **신규** | 복수 선택 + 배타 분리행 |
| `s2-deck-books-q5.png` | **신규** | 제목 목록 8행 |
| `s2-deck-books-favorites.png` | **신규** | 선택 3권 상태 (검색 없음) |
| `s2-deck-growing-together.png` | **신규** | |
| `s2-deck-capability.png` | **신규** | |
| `s2-signup.png` | **재생성** | `YOUR CHILD` 섹션 + 동의 체크 추가 (`AD-S2R-07`) |
| `s2-onboarding-intro.png` | **재생성** | copy 분리 + InfoRow 2행 복원 |
| `s2-welcome` · `s2-login` · `s2-consent` · `s2-vpc-failed` · `s2-onboarding-saved` | **재생성** | `S2-FIX-1` (§9.1) |
| `s2-deck.png` · `v5-field.png` | **확인 후 판단** | §16.4 그대로 |
| `s2-listrow` · `s2-inforow` · `s2-selecttrigger` · `s2-dividerlabel` · `s2-textlink` · `frame-*` · `s2-home-header` · `v1`~`v9` | **불필요** | §16.4 그대로 |

**합계: 신규 10 · 폐기 1 · 재생성 7 (+ 확인 2).** 재생성은 **1회**로 묶는다 (`pnpm test:e2e:update`).

> 개정 1 의 `s2-books-search-sheet` 는 **삭제**했다 (`§11.13` — 검색 제거) → 신규 11 → **10**.

### 11.2 허용 차이 (사전 등록 — QA FAIL 처리하지 않는다)

| ID | 대상 | 차이 | 사유 |
|---|---|---|---|
| `AD-S2R-01` | `179:1748` InfoRow 1 | `about 10 cards` → 파생값 `16 cards` | `R-03` |
| `AD-S2R-02` | `243:1147` InfoRow 1 | `About 1 minutes` → `About 1 minute` | Figma 오타 |
| `AD-S2R-03` | `179:1770` TopBar trailing | x372(프레임 밖) → gutter 우측 정렬 | Figma 슬립 |
| `AD-S2R-04` | `248:1159` 섹션 간격 | 18 → 20 (`--space-5`), 4곳 × +2 | 스케일 흡수 (Stage 0 #10) |
| `AD-S2R-05` | `248:1159` `YOUR CHILD` 헤더 | 연필 IconButton 1개 추가 | `R-08` 을 표현할 Figma 요소 없음 |
| `AD-S2R-06` | `248:1159` 성별 | `SelectTrigger` → `Tag` (display 모드) | `R-10` |
| `AD-S2R-07` | `179:1724` | **전체 프레임 비교** (기존 `AC-2-56` "보호자 영역만" 무효) | `R-01` |
| `AD-S2R-08` | `179:1770` | 하단 CTA 없음 = **Figma 와 일치**. 마지막 카드에서만 CTA | `§11.7` |
| `AD-S2R-09` | `179:1770` 카드 제목 | `Capability-items` → `Capability` | `R-13` |
| `AD-S2R-10` | 카드 내부 | 문항 → 옵션 간격 Figma 45 → `--space-6`(24) | `S2R-OPEN-6` 확정 (`§11.10`) |
| `AD-S2R-11` | `179:1748` 본문 | 숫자 절·기간 절 제거 후 Figma 문장 부분 사용 | `S2R-OPEN-1` A (`§11.10`) |
| `AD-S2R-12` | Q5 | 질문지 v1.1 의 "2-column grid of cover thumbnails" → **제목 체크박스 목록** | `§11.11` — **질문지 ↔ 구현** 차이다 (Figma 차이도, PRD 충돌도 아니다) |
| `AD-S2R-13` | favorites | PRD §7.2 Step 3 의 **"책 검색(최대 5권)"** → **제목 직접 입력만** | `§11.13` — **PRD ↔ Figma 충돌**이며 §2 절차(Figma 우선 + 사용자 승인)를 거쳤다. `AD-S2R-12` 와 성격이 다르다 (§16.3) |

---

## 12. 사용 토큰 · 신규 토큰

### 12.1 사용 토큰 (전부 기존)

색: `--color-surface-strong` · `--color-surface-subtle` · `--color-surface-tinted` · `--color-surface-note` · `--color-surface-glass` · `--color-selected-bg` · `--color-selected-fg` · `--color-fg-strong` · `--color-fg-primary` · `--color-fg-secondary` · `--color-fg-link` · `--color-divider` · `--color-border-subtle` · `--color-focus-ring` · `--color-progress-fill` · `--color-progress-track` · `--color-scrim` · `--color-tag-neutral-bg` · `--color-status-error-*`
타이포: `--text-title-3` · `--text-headline` · `--text-subheadline` · `--text-footnote` · `--text-caption-1` · `--field-label-size` · `--field-value-size`
간격: `--space-0-5` · `--space-1` · `--space-2` · `--space-3` · `--space-4` · `--space-5` · `--space-6` · `--space-10` · `--layout-gutter`
반경: `--radius-control` · `--radius-field` · `--radius-surface` · `--radius-card` · `--radius-pill`
그림자·재질: `--shadow-glass-rest` · `--material-blur-md` · `--material-glass-fill-fallback`
모션: `--motion-duration-instant` · `--motion-duration-fast` · `--motion-duration-base` · **`--motion-duration-slow`(400ms — 자동 전진 대기, §14)** · `--motion-ease-standard` · `--motion-ease-spring`
컴포넌트: `--radio-row-height` · `--radio-dot-size` · `--checkbox-size` · `--chip-height` · `--field-row-height` · `--field-padding-x` · `--field-padding-y` · `--field-radius` · `--list-row-height-min` · `--size-touch-min` · `--size-icon-sm` · `--deck-inset-x` · `--deck-peek-y` · `--deck-depth`
레이아웃: `--layout-safe-top` · `--layout-safe-bottom` · **`--layout-cta-bottom-gap`** (`D-25` 승인)

### 12.2 신규 토큰 — **0건**

| 초판 제안 | 처리 |
|---|---|
| `--book-cover-sm-width: 34px` · `--book-cover-sm-height: 48px` | **Stage 2 에서 추가하지 않는다** (`§11.11`). Q5 가 제목 목록이 되어 쓰지 않는다 → **Stage 3 `ListRow` media 슬롯 전용**으로 그때 추가한다 (선행 구현 금지) |
| `--border-hairline` | `§11.3`-5 보류 — 제안하지 않는다 |
| `--space-11`(44) | 만들지 않는다 — `--layout-cta-bottom-gap` 이 담당 |
| 자동 전진 대기 시간 | 기존 `--motion-duration-slow`(400ms) 재사용 |
| ProgressBar 구간 gap | 기존 `--space-0-5`(2) 재사용 |
| 복수 선택 컨트롤 | 기존 `--checkbox-size`(22) 재사용 |

**가값 후보 0건** — 초판의 `P-S2R-01`(`BookChoiceCell`)은 Q5 설계 폐기로 **소멸**했다.

---

## 13. Responsive Rule

Stage 0 #12 규칙(`--bp-md` 600 / `--bp-lg` 1024, 600 이상 480px 앱 컬럼 가운데 정렬) 위에서:

| 폭 | 카드 폭 | 동작 |
|---|---|---|
| 320 | 272 | **3장(Q5 728 · Q3 688 · AG1 680)이 뷰포트를 넘어 페이지 스크롤.** 덱 기하(peek 16/32, inset 8/16) 유지. `AC-2-59` reflow 대상 |
| 393 | 345 | **기준** — §5 검산 대상. 16장 전부 들어감 |
| 600 / 1024 | 432 | 앱 컬럼 480 가운데 정렬. 최장 622 → 전부 여유 |
| 텍스트 200% | — | 카드 **고정 높이 없음** → 세로로 늘고 페이지가 스크롤. 덱 스택 `padding-block-end` 는 고정 32 라 영향 없음 |

- **favorites 카드는 폭에 둔감하다** — 320·393·480 전부 235 / 453 / 619 (§5.4). 행 높이를 trailing IconButton(44)이 지배한다.
- 가로 화면: 앱 컬럼으로 표시 (Stage 0 #12) — 변경 없음.

---

## 14. Interaction / Motion — ★ 자동 전진과 복귀 경로 (`§11.7`)

### 14.1 자동 전진 — **단일 선택 카드만**

| 카드 유형 | 장수 | 전진 |
|---|---|---|
| 단일 선택 (Q1 · Q4 · Baseline 10) | **12** | **자동** — 선택 후 `--motion-duration-slow`(400ms) 대기 뒤 다음 카드 |
| 복수 선택 (Q3 · Q5 · Q2) | 3 | **수동** — 선택이 끝났는지 화면이 알 수 없다 |
| favorites | 1 | **수동** |

- 대기 시간은 **기존 토큰 재사용**이다 (신규 0건). 선택 피드백(`--color-selected-bg` + 원 채움)을 **눈으로 확인할 시간**이 목적이다.
- `prefers-reduced-motion: reduce` → **카드 슬라이드 애니메이션을 제거**하고 즉시 교체한다. **자동 전진 자체는 유지**하되 대기 400ms 는 그대로 둔다 (대기를 없애면 "눌렀는데 화면이 순간이동"이 되어 reduced-motion 사용자에게 더 나쁘다).

### 14.2 ★ 복귀 경로 (오선택 수정) — 4단

| # | 경로 | 규격 |
|---|---|---|
| 1 | **TopBar leading `chevron-left`** | 언제나 이전 카드로. 첫 카드에서만 이전 route 로. **자동 전진으로 넘어간 직후에도 유효** |
| 2 | **우 스와이프** | 1과 동일 동작 |
| 3 | **재방문 카드에서는 자동 전진을 끈다** ★ | 돌아온 카드에서 다른 옵션을 고르면 **자동 전진하지 않는다.** 이 규칙이 없으면 고치자마자 또 튕겨나가 **수정 자체가 불가능**해진다. 플래그는 "이 카드를 이미 떠난 적이 있는가"이며 세션 동안 유지된다 |
| 4 | **카드 안 해제 버튼**(`179:1804`) | 선택 해제. 해제는 **자동 전진을 유발하지 않는다** |

### 14.3 포커스·스크린리더

| 항목 | 규격 |
|---|---|
| 자동 전진 시 포커스 | 새 카드의 **첫 번째 옵션**으로 이동한다. 포커스를 `document.body` 로 잃으면 키보드 사용자가 덱 밖으로 떨어진다 |
| 알림 | `aria-live="polite"` 로 `{단계 제목} · {n} of 16` |
| 키보드 전진 | 라디오 선택은 방향키로도 일어난다 → **키보드 입력으로 선택했을 때는 자동 전진하지 않는다.** 방향키 탐색 중에 카드가 넘어가면 선택을 못 한다. 전진은 `chevron-right` 로 명시적으로 한다 |
| WCAG 3.2.2 (On Input) | 포인터 선택의 자동 전진은 **맥락 변화**다. ① 400ms 대기 ② 복귀 경로 4단 ③ 재방문 시 비활성 — 세 가지로 보완한다. **설정으로 끄는 옵션은 두지 않는다** (Stage 2 범위에 설정 화면 항목이 없다) |

### 14.4 나머지

| 대상 | 규격 |
|---|---|
| 카드 전진/후퇴 | `SwipeDeck` 기존 Pointer Events(8px 임계 후 capture). **`SwipeDeck.tsx` 미수정** (`QA-2-001`) |
| 단계 전환 | **모션 없음** — 제목만 교체. route 가 바뀌어도 덱은 연속으로 읽혀야 한다 |
| 선택 | 행 `scale(.97)` `--motion-duration-instant` (기존) |
| favorites 추가·삭제 | **모션 없음** — 목록 행이 즉시 붙고 떨어진다. 행 애니메이션을 넣으면 5번 반복되는 입력이 무거워진다 |
| display ↔ edit 전환 | 모션 없음. 포커스만 이동 |

---

## 15. 접근성 메모

| 항목 | 규격 |
|---|---|
| 16장 키보드 도달 (`AC-2-25` 확대) | TopBar leading/trailing 으로 **전 카드 도달 가능**. 덱은 현재 카드만 접근성 트리에 노출(뒤 카드 `aria-hidden`) — 기존 §4.2 규칙 |
| 카드 변경 알림 | `aria-live="polite"` 로 `{제목} · {n} of 16` (§4.2 의 "Question n of 10" 대체) |
| 자동 전진 | §14.3 |
| 복수 선택 그룹 | `<fieldset role="group">` + `legend` = 문항. `aria-describedby` → description. **`aria-required` 를 쓰지 않는다**(`role="group"` 에서 무효) → 보조 문구가 필수를 전달 (§2.9 기존 규칙) |
| 배타 옵션 | 배타 옵션 선택 시 다른 체크 해제를 `aria-live` 로 **알리지 않는다** — 체크 상태 변화가 이미 전달된다 |
| **상한 초과 처리 — 문항마다 다르다 (의도된 차이, `§11.15` 확정)** | 아래 표. **QA 는 이 절을 근거로 `PASS` 처리한다** |
| Q5 | 8행 모두 평등한 체크박스. 접근성 이름 = 책 제목. **저자·표지 없음** |
| display 행 | §4.3 접근성 표 |
| 터치 타깃 | 단일 선택 행 44 · 복수 선택 행 46 · favorites 트리거 44 · `ListRow` 68 · IconButton hit 44 · chip 31(기존 가값 `P-11`) |
| 대비 | selected 행 흰 라벨 = **수용 예외 `D-01`**. `--color-fg-secondary` 보조 텍스트 = 가값 `P-01` |
| 포커스 | 모든 신규 상호작용 요소에 `--color-focus-ring` (가값 `P-03`). favorites 는 `Add` 후 포커스를 **입력 필드에 유지**한다 (연속 입력) |
| 진행 표시 | 색만으로 전달하지 않는다 — 카드 안 `n / 16` 텍스트 병기 (§3.3) |

### 15.1 상한 초과 처리가 문항마다 다르다 — **의도된 차이** (`§11.15` 확정)

| 문항 | 상한 | 초과 시 | 비활성 처리 |
|---|---|---|---|
| **Q2 · Q3** | 2 | **가장 오래된 선택을 교체**한다 | 나머지 옵션을 `disabled` 로 만들지 **않는다** — 비활성 이유를 사용자가 알 수 없다 |
| **favorites** | 5 | **거절**한다 + `You can pick up to 5.` | 입력 필드를 **`disabled`** 로 둔다 (필드 자체는 숨기지 않는다) |

**왜 다른가**

| | 근거 |
|---|---|
| Q2 · Q3 | **제시된 선택지 중 고르는 것**이다. 6번째 옵션을 눌렀다는 것은 "이게 더 맞다"는 뜻이므로 가장 오래된 선택을 밀어내는 것이 의도에 맞다. 잃는 것도 **제시된 선택지 하나**라서 되돌리기 쉽다 |
| favorites | **사용자가 타이핑해 만들어 넣은 항목**이다. 임의로 빼면 **데이터 손실**로 느껴지고, 어떤 제목이 사라졌는지 알아채기 어렵다. 따라서 거절이 맞다 |

- **copy 가 이 차이를 설명한다**: Q2·Q3 는 `Pick up to two.`(상한만 말한다 — 교체는 조작으로 드러난다), favorites 는 `Up to 5.` + 도달 시 `You can pick up to 5.`(명시적 거절 안내).
- 두 규칙이 한 온보딩 안에 공존하므로 **QA 가 불일치로 볼 수 있다.** `§11.15` 와 이 절이 근거다.
- Q2·Q3 의 교체 동작은 현행 `toggleChoiceSelection` 이 이미 수행한다 — 구현 시 동작 확인만 한다.

---

## 16. 승인 필요 · 판단 불가 항목

### 16.1 처리 완료 (`§11.7` · `§11.10` · `§11.11`)

| ID | 결정 |
|---|---|
| `S2R-OPEN-1` | ✅ A — 숫자·기간 절 제거, 남은 Figma 문장 사용 (§2.4) |
| `S2R-OPEN-2` | ✅ Figma 2화면 유지 (§2.5) |
| `S2R-OPEN-3` | ✅ 단일 선택만 자동 전진 (§14) |
| `S2R-OPEN-4` | ✅ 카드 단계 CTA 제거 (§3.2) |
| `S2R-OPEN-5` | ✅ 보조 라인 두지 않음 (§3.3) |
| `S2R-OPEN-6` | ✅ 문항→옵션 간격 24 유지 + 허용 차이 (§3.4 · `AD-S2R-10`) |
| `C-13` ① ② ③ | ✅ §10-1 |
| `S2R-OPEN-8` | ✅ favorites 문항 문구 = **`Books your child loves`** (기존 섹션 라벨 그대로, `§11.14`). 문구 창작 0건 |
| `C-13`-4 (검색 Sheet) | ✅ **철회** — `§11.13` 으로 검색 제거 (§10-2). **디자이너 대기 0건** |
| 상한 초과 처리 차이 | ✅ **의도된 차이로 확정** (`§11.15` → §15.1) |

### 16.2 남은 항목

| ID | 항목 | design-agent 의견 | 영향 |
|---|---|---|---|
| **`S2R-OPEN-7`** | `179:1724` 한 줄 동의 체크 문구가 `/auth/consent` 5항목과 의미가 겹친다 | **법무·기획 보류** (`§11.10`). design-agent 는 "이 체크는 **아동 데이터 수집 동의가 아니다**"만 기록한다 | Privacy |
| **`S2R-OPEN-9`** ★ 신규 | **favorites 입력 필드의 보이는 라벨이 없다** (§6.4). 문항 문구는 `§11.14` 로 확정됐지만, 필드 자체의 라벨로 쓸 기존 문자열이 없다 (`searchLabel` 은 제거 대상, `homeLabel` 은 다른 블록) | **A 권장 — 보이는 라벨을 두지 않는다.** `aria-labelledby` = 카드 문항, `aria-describedby` = helper(`Up to 5.`). **문구 창작 0건 · 레이아웃 영향 0** (§5.4) | 필드 1개 |

### 16.3 PRD ↔ Figma / 질문지 불일치 (이 범위에서 발견)

| 항목 | PRD / 질문지 | Figma (node) | 영향 | 결정 |
|---|---|---|---|---|
| 설문 소개 횟수 | PRD §7.2 에 intro 규정 없음 | `243:1147` + `179:1748` **2장** | 보호자가 intro 를 2번 본다 | ✅ `§11.10` 유지 |
| 설문 분량 문구 | PRD §7.2 "전체 5~7분" | 1분 + 3분 = 4분 | PRD 수정 대상 12번(Plan §15)에 포함 | ✅ `R-03` |
| 가입 동의 | PRD §7.1 가입은 보호자 정보 | `179:1724` 한 줄 동의 체크 | 5항목 동의와 중복 인상 | `S2R-OPEN-7` |
| **Q5 표현** | 질문지 v1.1 "2-column grid of **cover thumbnails**, title underneath" | Figma 없음 | **제목 체크박스 목록으로 구현** | ✅ `§11.11` → `AD-S2R-12`. **질문지 ↔ 구현** 차이이며 PRD 충돌이 아니다 |
| **`Books at home`** | PRD §7.2 Step 3 "집에 있는 책 리스트 입력" | Figma 없음 | **삭제** | ✅ `§11.9` → PRD 수정 대상 9번에 포함 |
| **★ 책 검색** | PRD §7.2 Step 3 "좋아하는 책·자주 읽는 책 **검색 선택(최대 5권)**" | **`30:74` Library · `179:1770` 설문 카드 모두 검색 입력·아이콘 0건** (2026-10-03 재확인) | **검색 제거, 제목 직접 입력만** | ✅ `§11.13` → `AD-S2R-13`. **PRD ↔ Figma 충돌**이며 §2 절차(Figma 우선 + 사용자 승인)를 거쳤다 → **PRD 수정 대상 신규 1건** |

#### PRD 수정 대상 — 이 명세가 추가하는 1건 (plan-agent 소유 목록에 반영 필요)

| # | PRD 위치 | 현재 | 바뀔 내용 | 근거 |
|---|---|---|---|---|
| **15** | **§7.2 Step 3** | "좋아하는 책·자주 읽는 책 **검색 선택(최대 5권)**" | **책 검색을 두지 않는다.** 좋아하는 책은 **제목 직접 입력(최대 5권)**, 소유 도서 파악은 **Q5 8권 체크**(`owned_books`)가 담당한다 | `§11.13` — Figma `30:74`·`179:1770` 에 검색 0건, PRD ↔ Figma 충돌 + 사용자 승인 |

> Plan §15 의 PRD 수정 대상은 7~14번 8건이었다. 이 1건이 **15번**으로 이어진다. **`Books at home` 삭제(9번)와는 별개 항목**이다 — 9번은 PRD 안에서의 이관이고, 15번은 PRD ↔ Figma 충돌이다. **문서 수정은 plan-agent·사용자 소관이며 이 명세는 목록만 제시한다.**

> 두 "차이"의 성격을 혼동하지 말 것: `AD-S2R-12`(Q5)는 **질문지 ↔ 구현** 차이로 §2 "Figma 우선" 규칙 대상이 **아니고**, `AD-S2R-13`(책 검색)은 **PRD ↔ Figma 충돌**로 §2 절차를 **거친** 항목이다.

> Figma 내부 불일치(`248:1159` 프레임 이름 "구현 현황", `179:1775` 프레임 밖, `About 1 minutes` 오타, 두 화면이 같은 `Input` 인스턴스 공유)는 **PRD ↔ Figma 충돌이 아니므로** `stage-3-approvals.md` §2 "Figma 우선" 규칙 대상이 **아니다** (`§11.10` 확정).

---

## 17. development-agent 인계 메모

1. **구현 순서**: `S2-FIX-3`(덱 표면 소유권) → `S2-FIX-2`(옵션 padding) → §3.5(해제 버튼 absolute) → 재구성. **순서를 바꾸면 16장 전부의 줄바꿈이 두 번 바뀐다.**
2. **`SwipeDeck.tsx` 를 열지 마라.** `S2-FIX-3` 는 CSS 선택자 2개 이동 + `renderItem` 래핑뿐이다 (`QA-2-001`). `SwipeDeck.css` 의 `overflow` 선언 수는 **0 → 0**. **덱 어디에도 내부 스크롤 컨테이너를 만들지 마라** — 검색 제거로 그럴 필요가 없어졌다 (`§11.13`).
3. **숫자 리터럴 금지 구역**: 카드 수(16) · 소요 시간 · 단계 수 · ProgressBar 구간 비율(2/3/1/10) · `FAVORITE_BOOKS_MAX`(5) · Q5 책 수(8). **전부 instrument / contracts / fixture 파생값**이다 (`AC-2R-09`).
4. **`R-01` Privacy**: Create account 의 아이 입력값은 `OnboardingDraftStore` **한 경로만** 통과한다. `SignUpWithEmailInput.strict()` 유지. 동의 성공 이전 전 구간 요청 로그에 아동 필드 **0건** (`AC-2R-13`).
5. **§5 수치는 계산 검산이다.** 구현 후 393×852 / 320 / 600 / 1024 + 텍스트 200% 에서 **앞 카드 높이를 실측**하고, 678 예산을 넘는 카드가 있으면 보고하라. 임의로 폰트·간격을 줄여 맞추지 마라.
6. **`--layout-cta-bottom-gap` 은 CTA 가 없는 카드 단계에도 적용된다** (`§11.3`-2).
7. **신규 토큰 0건.** 토큰이 필요해 보이면 추가하지 말고 design-agent 에 올려라. 특히 `--book-cover-sm-*` 는 **Stage 3 소관**이다 (선행 구현 금지).
8. **자동 전진 §14.2-3 을 빠뜨리지 마라** — "재방문 카드에서는 자동 전진을 끈다". 이게 없으면 오선택을 **고칠 수 없다**.
9. **§16.2 미결 항목은 구현하지 마라.** `S2R-OPEN-9`(favorites 입력 라벨)는 **레이아웃 영향 0** 이므로 A안(보이는 라벨 없음)으로 구현하고 결정이 뒤집히면 라벨만 추가하면 된다 — 이 1건 때문에 카드를 보류할 필요는 없다.
10. **검색 제거는 "안 그리는 것"이 아니라 "지우는 것"이다** (`§11.13`, §6.2 표). `BooksStep` 의 검색 `TextField`·결과 `ListGroup`·`EmptyState`·`Skeleton`·검색 실패 `InlineAlert`·`useBookSearch` 호출과 `copy.books.search*`·`emptyTitle`·`emptyDescription`·`addTyped`·`tryAgain`·`home*`, Mock 시나리오 `book-search-empty` 를 **실제로 제거**하라. 남겨 두면 `AC-2R-09`(숫자·문구 하드코딩 0건) grep 과 dead code 검사에 걸린다.
11. **`GET /v1/books/search` contract 는 지우지 마라** — Stage 3 Library 소관이다. 지우는 것은 **온보딩에서의 호출과 UI** 뿐이다. **`FavoriteBookSchema.bookId` 도 선택 필드로 유지**한다 (`§11.13`).
12. **§15.1 상한 규칙 2종을 둘 다 구현하라.** Q2·Q3 = 교체, favorites = 거절. 하나로 통일하지 마라 — `§11.15` 가 확정한 **의도된 차이**다.
