# Stage 5 Design Spec — Reflection Card + Analysis Status / Short Feedback

Status: **APPROVED (2026-11-08, user)** — 사용자 발화 *"전부 권고안대로 승인"* (`D5-4`, `docs/decisions/stage-5-approvals.md`). 이전 상태: **DRAFT** (2026-11-08, design-agent) — 승인 체크포인트(Plan §19) 대기. 이 문서는 승인이 아니다.
Based on:
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — **라이브 조회 2026-11-08** (claude.ai Figma 커넥터, `D5-3`): `29:62` · `91:691`(전 하위) · `91:627` · `91:628` · `17:20`(Button 세트) · `117:879` · 페이지 `16:2` 전체 metadata · 페이지 `125:765`(V.1) 전체 metadata
- Plan `docs/plans/stage-5-plan.md` (DRAFT 2026-11-08) · 결정 `docs/decisions/stage-5-approvals.md` `D5-1`~`D5-3`
- 기존 Spec 형식: `docs/design/stage-4b-design-spec.md` · 토큰 `packages/design-tokens/src/**` · 컴포넌트 `packages/ui/src/**` (읽기만)

Author: design-agent (2026-11-08). ⛔ Production Code · Figma 수정 없음. 신규 토큰·컴포넌트 변경은 **요청**이며 구현은 development-agent.

---

## 0. 측정 방법과 결과 요약

### 0.1 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[meta]` | `get_metadata` | `29:62` · `117:879` · 페이지 `16:2` · `125:765` (대용량 결과는 파일 저장 후 python 으로 깊이 2 요약 + 레이어 이름 키워드 검색) |
| `[ctx]` | `get_design_context` — **선언값**(fill · effect · text style · padding · gap · variable 바인딩) | `91:691` · `91:627` · `91:628` · `17:20` |
| `[var]` | `get_variable_defs(91:691)` | `text-primary #4a5f5c` · `accents/teal #85bfb6` · `stroke #5e73702e` · `radius-pill 100` · `glass-fill-strong #ffffffe5` · Style `HARU/Shadow Rest` · `HARU/Glass Rest` |
| `[svg]` | `get_design_context(91:691)` 가 돌려준 에셋 SVG 2종을 `curl` 로 받아 **원문 fill** 확인 | 별 채움 `91:694`~`700` · 별 빈 `91:702` |
| `[bound]` | `get_screenshot(91:691)` 의 `original_width/height` (렌더 바운드) | 카드 그림자 겹 수 역산 (`R-FIGMA-1` ②) |
| `[png]` | `get_design_context` 첨부 렌더 | **배치 확인 용도만.** 색·그림자 값은 png 에서 읽지 않았다 |
| `[계산]` | 위 값의 산술 · WCAG 상대휘도 | 간격 · 대비 · 반응형 줄바꿈 |
| `[직독]` | 저장소 파일 읽기 | 토큰 · `Chip` · `TextField` · `Button` · 완료 화면 CSS |

### 0.2 핵심 실측 — `91:691` Feedback Card `[ctx][var][svg][bound]`

| 요소 | 선언값 |
|---|---|
| 카드 | 370×302 @ (11, 521) · **flex column · gap 14** · padding **20 / 20 / 18 / 20** (위·좌우·아래) · radius **30** · fill **`glass-fill-strong` = white 90%** (backdrop blur **없음**) · **`overflow: clip`** |
| 카드 그림자 | Style 이름 `HARU/Shadow Rest`(5겹)지만 인스턴스 렌더는 **drop `0 6 4 ink 8%` 1겹 + inset `0 1.5 0 white90%` · `0 -1 0 ink5%` 2겹** — 렌더 바운드 **378×312** = 좌우 ±4 · 위 0 · 아래 10 → **1겹 확정** (3겹이면 좌우 ≥56). = 기존 **`--shadow-bubble` 과 같은 선언** (`V-10` 선례) |
| 제목 `91:692` | `How was storytime with Emma?` · SF Pro **Bold 17** · line `normal`(→ 20) · `text-primary` · **가운데** · `w-full` (줄바꿈 허용) |
| 별 `91:693` | 330×30 · flex row · **gap 8** · 가운데 정렬 (첫 별 x=74 = (330−182)/2 ✓) · 별 **30×30 frame + 자체 vector** (path 동일, viewBox 30) · 채움 fill **`#D0CCA1`**(raw, 변수 미바인딩) · 빈 fill **`#D6DEDC`**(raw) · 예시 상태 = 4개 채움 |
| 칩 행 `91:709` | 330×73 · **flex-wrap · gap 7 (가로·세로)** · `justify-center` · `items-start` · 2행 (3 + 2) |
| 칩 = `Select` (`90:626` 세트) | `Color=Green`(`90:625`, 선택): bg `accents/teal` · 라벨 white · **테두리 없음** → 77×31 / `Color=Transparent`(`90:624`, 미선택): **border 1px `stroke`(ink 18%) solid** · 라벨 **`#5E7370`**(raw) → 97×33. padding **12 / 8** · radius pill · 라벨 **SF Pro Medium(510) 12.5** · line `normal`(15). ⭐ **31 vs 33 의 원인 = 미선택에만 있는 1px border(border-box)** 이다 — 별도 크기 변형이 아니다. **check 아이콘 없음** |
| 칩 라벨 원문 (override 문자열 `[ctx]`) | `91:710` **`Engaged`**(선택) · `91:711` **`Big feelings`**(미선택) · `91:712` **`Ask Questions`**(선택) · `91:713` **`Stay Focus`**(미선택) · `91:714` **`Tricky today`**(미선택) |
| loose `91:627` / `91:628` | `91:627` = **Green 77×31 `Engaged`** · `91:628` = **Transparent 97×33 `Big feelings`** — 변형 견본(카드 칩과 동일 선언) |
| 입력 `91:715` | 330×40 · **border 1px `rgba(94,115,112,.18)`**(=`stroke` 값, 변수 미바인딩) · radius **16** · padding **14 / 12** · fill **없음** · `overflow-clip` · placeholder `91:716` **`Anything to talk about this time? (optional)`** SF Pro **Regular 13** · line `normal`(16) · **`#9AABAA`** · 한 줄 · 라벨 없음 |
| 버튼 `91:717` | `Button` **Accent / Rest** (`17:12`) 330×45 · 라벨 **`Save`** Semibold 17 · padding 26/14 · drop `0 12 14 ink16%` + `0 2 2 ink8%` + inset 2겹. 세트 `17:20` 에 **Accent / Disabled**(`17:18`) = **opacity 50%** 존재 `[ctx]` |
| 세로 합 `[계산]` | 20 + 20 + 14 + 30 + 14 + 73 + 14 + 40 + 14 + 45 + 18 = **302** ✓ |

### 0.3 화면 내 관계 (`29:62`, 393×852) `[meta]`

| y | 요소 |
|---|---|
| 0~468 | Stage 4 완료 화면 (버블 `88:929` **선언** 박스 338~468 — 렌더 본체 끝 ≈ 432, 4b CSS 주석) |
| 468~521 | **빈 간격 53** (Stage 4 Spec 의 UploadStatusBadge 후보 띠 — 미구현 확인 `[직독]`) |
| **521~823** | **Feedback Card** |
| 823~852 | 하단 여백 **29** |

→ 393×852 에서 콘텐츠(상태바 56 제외) **796** 를 정확히 채운다 — **스크롤 없음**. 796 미만이면 `AppShell` 뷰포트 세로 스크롤 (§8).

### 0.4 Figma 의 Stage 5 관련 다른 화면 — **없음** `[meta]`

- 페이지 `16:2` 전체(섹션 `31:204` · `179:1700` · `296:1127` · loose 노드)에서 레이어 이름 키워드(`feedback` · `analy` · `reflect` · `pending` · `insight` · `star` · `rating` · `notif` · `push` …) 검색 → **`29:62` / `91:691` 외 0건**. 피드백·분석 상태·딥링크 도착 화면 **없음**.
- 페이지 `125:765` "MVP_KeyScreen **V.1**" 에 이전 판 `125:801` "1c · Session — Complete & Feedback" 이 있다. 그 카드 `125:816`(370×420)에는 V.2 에 없는 **`Skip for now`** 텍스트(`125:855`)와 **`ALL HARU FAMILES · 4.2 avg …` + 작은 별 + `Your ratings stay private, only the average is shared`** 블록이 있었다. **V.2(`16:2`)에서 둘 다 제거됐다** → V.2 가 기준(CLAUDE.md Source of Truth = page `16:2`). 이 제거는 `PF5-5`(Skip 없음 = 닫기가 건너뛰기)와 §6.1(다른 가정 평균 금지)의 **Figma 측 근거**다.
- ⇒ **C-13 대상 변동 없음**: `C13-S5-1`(피드백·분석 상태 화면) · `C13-S5-2`(회고 카드 Figma 밖 상태) 그대로 design-agent 명세 (`D5-2`). Figma 매핑으로 옮길 화면 0.

---

## 1. 대상 화면 (Figma node → route)

| # | Figma | Route | Page | Layout | 이 Spec 의 범위 |
|---|---|---|---|---|---|
| 1 | **`29:62` 전체** (y 0~852) — 상단 Stage 4 + 하단 **`91:691`** | `/session/:sessionId/complete` (기존) | `SessionCompletePage` (기존) | `FullscreenLayout` (기존) | 카드 **y 521~823** 추가 · 상단 **불변** |
| 2 | **없음 — `C13-S5-1`** | `/session/:sessionId/feedback` (신규) | `SessionFeedbackPage` (신규) | `FullscreenLayout` (완료 화면과 같은 골격) | §2.3 명세 (승인 필요) |

- ⭐ **`/session/:sessionId/reflection` route 를 만들지 않는다** — Figma 가 한 프레임이고(`29:62`), V.1 도 한 프레임이었다. Plan §9 권고와 일치. `FIGMA_SCREEN_MAP.md:74` 의 2 route 분할은 **승인 후 이 design-agent 가 갱신**한다(지금 수정하지 않음).

---

## 2. 화면별 레이아웃

### 2.1 완료 화면 + 회고 카드 (`29:62`)

```
SessionCompleteScreen (기존 — 본체 상태일 때만 footer slot 렌더, Plan §5.1)
├─ close bar · title · sticker slot · medallion · bubble     ← y 0~468, 변경 0
└─ footer slot  ← ReflectionCard (features/reflection)
   └─ section.haru-reflection-card   (Surface 계열, 370 · radius 30 · overflow clip)
      ├─ h2 title           "How was storytime with {firstName}?"
      ├─ StarRating         (packages/ui 신규) 5 × 30, gap 8
      ├─ chip group         Chip ×5 (Select 변형 — §3.2), wrap gap 7, center
      ├─ note input         (§3.3) 40 높이 한 줄
      └─ Button accent md   "Save" 폭 100%
```

| 항목 | 명세 | 근거 |
|---|---|---|
| 카드 폭 | `min(370, 앱 컬럼 − 2×11)` · 가로 가운데 — 393 에서 x = 11.5 (Figma 11, ±1 안) | `[meta]` x 11 · 우 12 |
| 카드 세로 위치 | ⭐ **흐름(flow) 배치** — 버블 박스 바로 다음, `margin-block-start = --reflection-card-offset`. 값은 **기본 fixture(`completionBubble` = Figma 문구)에서 카드 top = Figma 521(웹 465)** 이 되도록 development-agent 가 렌더 실측으로 정한다 (Figma 선언 53 은 버블 **선언** 박스 기준이고 구현 버블 박스 높이는 Figma 130 과 다를 수 있다) | `N5-29` (Plan Handoff #2) |
| 카드 아래 | 하단 여백 **29** (`--reflection-card-bottom-gap`) — 스크롤 끝에서 이 여백이 그림자(아래 10)를 품는다 | `[meta]` 852 − 823 |
| 내부 | flex column · gap **14** (`--space-3-5`) · padding 20/20/18/20 (`--space-5` · `--space-4-5`) | `[ctx]` |
| `overflow` | **`clip`** (Figma 선언 그대로) — Figma 에서도 `Save` 그림자(아래 26)가 padding 18 을 넘어 **8px 잘린다** `[계산]`. 근거 주석 필수 (`R-SHADOW-1` ⑥). 내부 행(별·칩)의 `overflow-clip` 은 자식 그림자가 0 이라 시각 효과가 없으므로 **옮기지 않는다** (포커스 링이 잘리기 때문) | §9.3 |
| 제목 | `h2` (페이지 `h1` 은 Stage 4 의 `Session Complete`) | 접근성 |

### 2.2 회고 카드 Figma 밖 상태 — `C13-S5-2` (design-agent 명세, `D5-2`)

**원칙: 새 시각 요소·새 문구를 최소로.** 카드 레이아웃(§2.1)은 모든 상태에서 같다 — 상태는 **기존 컴포넌트의 상태**로만 표현한다.

| 상태 | 별 | 칩 | 입력 | `Save` | 추가 요소 | 결정 |
|---|---|---|---|---|---|---|
| **S0 초기(빈)** | 5개 전부 빈(`#D6DEDC`) | 전부 미선택(Transparent) | placeholder | **Accent / Disabled** (opacity 50%, `17:18`) — `N5-05` ⓐ 시 | 없음 | `N5-05` |
| S1 입력 중 | 선택 수만큼 채움 | 토글 | 값 표시 `--color-fg-primary` | Accent / Rest | 없음 | — |
| **S2 저장 중** | 조작 불가 | 조작 불가 | `readOnly` | `Button loading` (기존 — 포커스 유지, 누름 무시) | 없음 | — |
| **S3 실패 (`error` · `invalid-transition`)** | 입력 보존 | 보존 | 보존 | Rest (다시 누르면 재시도) | ⓐ **Toast(error)** (권장) — 화면 상단 Toast inset(`D4-89`) 그대로, 카드 기하 불변 · ⓑ `InlineAlert tone="error"` 를 카드 위에 삽입 — Figma 좌표가 바뀐다 | `N5-31` |
| **S4 오프라인 (`offline`)** | 보존 | 보존 | 보존 | Rest | S3 과 같은 표면, 문구 = 기존 `networkErrorCopy` (*"You are offline" / "HARU will try again once the connection is back."*) ⚠️ 이 문구는 **자동 재시도를 약속**하는데 회고는 Outbox 에 넣지 않는다(Plan §5.5) → 회고 전용 문구 필요: 초안 *"You're offline — your notes are still here. Tap Save when you're back online."* | `N5-31` · copy |
| **S5 저장됨** | — | — | — | — | **Toast(success)** *"Thanks — saved."* (초안) 후 **홈 replace** (`N5-07` ⓐ) — 카드는 다시 보이지 않는다 | `N5-07` |
| **S6 재진입 읽기 전용** (`reflection-submitted`) | 제출값 표시 · `StarRating readOnly` | 제출값 표시 · `disabled` 아님 → **`aria-disabled` + 누름 무시**(opacity 변경 **없음** — Figma 와 같은 모습 유지) | 제출 `note` 를 `readOnly` 로 표시 (`null` 이면 placeholder) | **Accent / Disabled** | 시각 텍스트 **추가 없음**. SR 전용 상태문 = 기존 `REFLECTION_ALREADY_SUBMITTED.description` *"Your reflection for this storytime is saved."* 를 `aria-describedby` 로 | `N5-08` |
| 닫기 ✕ (모든 상태) | — | — | — | — | 요청 0 · 확인 없음 · 홈 replace (`D4-86` 그대로) | `N5-06` · `N5-23` |

- **S3/S4 권장 = Toast** 이유: Figma 카드 기하(AC-5-18)를 바꾸지 않고, 4b 에서 Toast inset 이 이미 이 화면에 등록돼 있다 `[직독: SessionCompleteScreen.tsx 머리 주석]`. InlineAlert 안은 Figma 에 없는 영역이 카드 위/아래에 생긴다.
- 실패 시 **입력은 메모리에만** 보존 (Plan `N5-17`). 재시도 key 규칙은 Plan AC-5-26.

### 2.3 피드백 · 분석 상태 화면 — `C13-S5-1` (design-agent 명세, `D5-2`)

**원칙**: Figma 에 화면이 없으므로 **완료 화면(`29:62` 상단)의 골격·토큰을 그대로 재사용**한다 — 새 시각 언어 0.
⭐ **캐릭터 버블에는 API 응답 문구(`shortFeedback.text`)만** 넣는다 (`rules/frontend.md` §8). 상태 안내(pending 등)는 UI copy 이므로 **버블이 아니라 `InlineAlert`** 로 표시한다 — 캐릭터가 말하는 것처럼 보이지 않게.

```
FullscreenLayout
├─ close bar        — 완료 화면 CompleteCloseBar 와 같은 IconButton(glass close 38, "Close") → 홈 replace
├─ h1 title         "Storytime notes" (초안) — 완료 화면 제목과 같은 타이포·위치(--session-complete-title-offset)
├─ medallion        — CharacterMedallion + 링 (완료 화면 --session-complete-ring-size 150 / 아바타 136) · 스티커 슬롯 없음
└─ state slot (aria-live="polite", 단일)
    ├─ analyzed + text   → 완료 화면 버블과 같은 SpeechBubble(tail top-center · --bubble-* 토큰) 에 text 만
    ├─ analyzed + null   → 아무것도 렌더하지 않는다 (fallback 0, AC-5-37)
    └─ 그 밖             → InlineAlert inline (아래 표)
```

| 표시 상태 (ARCHITECTURE §10.2) | Mock | 렌더 | 문구 (초안 — `N5-24` · copy 확인 필요) |
|---|---|---|---|
| Loading | `loading` | 제목 + 메달리온 자리 유지, state slot = `Spinner`(기존) · 접근성 이름 *"Loading"* | — |
| **pending** | `analysis-pending` | `InlineAlert tone="info"` | title *"We're preparing today's notes"* · desc *"They're usually ready by tomorrow. You can close this screen."* (수치 약속 회피안) |
| **analyzed (full)** | `analysis-completed` | 버블 = `shortFeedback.text` 그대로 | (API) |
| analyzed + `text:null` | `analysis-feedback-missing` | state slot 비움 | — |
| **low-quality** | `analysis-low-quality` | `text` 있으면 버블 + 그 아래 `InlineAlert tone="info"` / 없으면 InlineAlert 만 | title *"It was a little hard to hear this time"* · desc *"Your storytime is saved. A quieter spot next time helps HARU listen."* |
| **failed** | `analysis-failed` | `InlineAlert tone="info"` (error 아님 — 사용자 행동 없음 `N5-15` ⓐ) · 재시도 버튼 **없음** | title *"This one is taking a little longer"* · desc *"No need to do anything — we'll keep working on it."* |
| **not-available** (`conversation_only`) | `analysis-not-available` | `InlineAlert tone="info"` | **기존 `error-copy` 재사용**: *"No notes for this storytime" / "Observations are only prepared for recorded storytimes."* |
| not-available (녹음 없음, `N5-12` ⓐ) | `recording-deleted` | 위와 같은 표면 | title 재사용 · desc *"The recording for this storytime isn't available, so there are no notes."* |
| Error | `error` · `retry` | `ErrorState tone="error"` + action *"Try again"* (기존 패턴) | 기존 `error-copy` |
| Offline | `offline` | `ErrorState tone="offline"` + *"Try again"* | 기존 `networkErrorCopy` |
| `RESOURCE_NOT_FOUND` / `FORBIDDEN` | — | `ErrorState tone="error"` + action *"Go home"* (재시도 없음) | 기존 `error-copy` |

- 배치: state slot top = 메달리온 ring bottom + `--session-complete-bubble-offset`(버블) / InlineAlert 는 + `--space-4`(16). 가로 = 버블 폭 토큰(완료 화면과 동일) · InlineAlert 는 앱 컬럼 − 2×`--space-6`.
- **(사후 확정 2026-11-10, user)** low-quality 의 버블 bottom ↔ `InlineAlert` top 간격 = `--space-4`(16) (`D5-11`). 오류·오프라인·없음 `ErrorState` 카드도 InlineAlert 와 **같은 폭**(앱 컬럼 − 2×`--space-6`, 393 기준 345)으로 채운다 (`D5-9`). state slot 의 `aria-live` 하나만 알리도록 안쪽 `InlineAlert` · `ErrorState` 의 자체 live role 을 끈다 (`D5-10`).
- 금칙어 점검 `[계산]`: 위 초안에 `diagnos` · `delay` · `behind` · `normal` · `score` · `worse` · `better than` · `peers` **0건**. "taking a little longer" 는 시간 서술이며 아이 판정이 아니다.
- Layout 선택: **Fullscreen** (Stack 의 back 대신 close) — push 도착 화면은 이전 화면이 없을 수 있어 back 이 모호하다. 닫기 = 홈 replace.

---

## 3. 사용 컴포넌트와 Variant / State

### 3.1 `StarRating` — `packages/ui` 신규 (Shared UI)

| 항목 | 명세 |
|---|---|
| 시각 | 별 **30×30**, gap **8**, 가운데 정렬. 글리프 = **`91:694` 의 vector path** (viewBox 30, `[svg]` 원문 — 아래). ⚠️ `117:879`(`shape=star`, **25×24** 심볼)이 **아니다** — COMPONENT_MAP:69 · Plan §9 의 근거 정정 |
| path | `M15 2.5L18.625 10.25L26.875 11.25L20.75 17L22.375 25.25L15 21.25L7.625 25.25L9.25 17L3.125 11.25L11.375 10.25L15 2.5Z` · `fill="currentColor"` 로 HARU SVG 등록 (`icon/haru/rating-star.svg`, HARU 전용 SVG 규칙 Stage 0 #21). 에셋 사본: 이 Spec 작성 중 scratchpad 에 받은 원문 — development-agent 는 `get_design_context(91:691)` 로 **다시 받아** 넣는다 |
| 색 | 채움 `--color-rating-filled`(= palette yellow `#d0cca1` ✓ Figma 일치) · 빈 **`--color-rating-empty` — 현재 값 ink 18% (≈ `#dfe4e3` on card) ≠ Figma `#D6DEDC`** → 토큰 값 정정 요청 (§5 `T5-1`) |
| 의미 | `role="radiogroup"` + 접근성 이름(카드 제목 `aria-labelledby`) · 각 별 `role="radio"` · 이름 *"1 star"* … *"5 stars"* · `aria-checked` = 선택한 값의 별 하나 · roving tabindex · ←/→ ↑/↓ 이동=선택 · Home/End |
| 상태 | `value 0..5` (0 = 미선택, 초기) · `readOnly`(S6: `aria-readonly`, 포커스 가능·변경 불가) · `disabled`(S2) |
| 재탭 | 같은 별 재탭 = 변화 없음 (`N5-18` ⓐ) |
| 히트 영역 | **가로 최대 38**(30 + 간격 8, 겹침 0) × 세로 **44**(위·아래 7 — 위 gap 14·아래 gap 14 안) `[계산]`. ⚠️ Plan `N5-19` ⓐ "44" 는 **간격 8 안에서 불가능** — 44 로 하면 이웃과 6 겹친다 → `N5-19` 재질문 |
| 모션 | 채움 색 전환 `--motion-duration-fast` · `prefers-reduced-motion` 이면 즉시 |
| props | `value` · `max=5` · `onChange` · `readOnly` · `disabled` · `aria-labelledby` (COMPONENT_MAP:69 의 `label` 대신 labelledby 권장) |

### 3.2 `Chip` — 기존 컴포넌트, **Figma `90:626` Select 와 3곳 불일치** `[직독][ctx]`

| 항목 | 현재 `packages/ui/src/chip` | Figma `90:624`/`90:625` | 판정 |
|---|---|---|---|
| 미선택 테두리·높이 | `box-shadow: inset 0 0 0 1px` → **31** | **border 1px (border-box) → 33** · Stage 1 Spec §4.16 도 *"outline은 border 포함 33"* 라고 적었다 | ⚠️ **불일치** (Stage 1 이래). 칩 행 2행 y = 40 vs 구현 38, 카드 302 vs 300 |
| 선택 표시 | 색 + **leading check 아이콘 12px** (WCAG 1.4.1 이중 표시) | **check 아이콘 없음** — 라벨만 | ⚠️ **불일치** — Figma 에 없는 요소(최우선 규칙 2) → `N5-26` |
| 라벨 weight | 지정 없음 (상속 → regular 추정, **computed 확인 필요**) | **Medium 510** | ⚠️ 확인 필요 |
| 라벨 크기 | 12 (`--text-caption-1`, 12.5 흡수 §3.5) | 12.5 | 기존 수용(§3.5) — 칩 폭이 Figma 보다 약간 좁아진다(77 → 약 75, 추정) → VG 항목 |
| 색 | 선택 bg `--color-selected-bg`(teal) · fg white · 미선택 fg `--color-action-secondary-fg`(ink-600 `#5e7370`) · 테두리 `--color-border-subtle`(ink 18%) | 같음 | ✅ |
| 의미 | `<button aria-pressed>` | 토글 | ✅ (`N5-01`) |

- `Chip` 은 **온보딩 `ChildInfoStep`(언어 환경) 에서 outline 으로 사용 중** `[직독]` → 전역 변경은 Stage 2 baseline 을 바꾼다. **권장: `Chip` 에 Figma `Select` 와 1:1 인 변형(예: `variant="select"`) 추가** — border-box 33 · check 없음 · Medium · 나머지 동일. 기존 변형은 그대로(회귀 0). 승인 필요 (`N5-26` · `N5-27`).
- 터치 타깃: 기존 `::before` 세로 hit slop 44 유지 — 행 간격 7 이라 위·아래 행 hit 영역이 **겹친다**(44 − 33 = 11 > 7) `[계산]` → 겹친 띠에서는 DOM 뒤 요소가 이긴다. 기존 Stage 1 동일 상황(온보딩 칩 행)과 같은 처리로 수용 여부 확인.

### 3.3 회고 입력 (`91:715`) — 기존 `TextField` 와 **다른 모양**

| | 기존 `TextField` (`76:417`) | Figma `91:715` |
|---|---|---|
| 구조 | 라벨 + 값 2단, 행 42 | **라벨 없음**, placeholder 한 줄, **40** |
| radius | `--field-radius` = 22 (`P-12`) | **16** = `--radius-field` ✓ |
| 테두리 | (FieldGroup 구분선) | 1px `--color-border-subtle` |
| 글자 | 값 16 | placeholder **13** Regular `--color-fg-tertiary`(`#9aabaa` ✓) · 줄 16 |

→ **TextField 로 표현 불가.** COMPONENT_MAP:36 이 예고한 `TextArea`(S5)도 Figma 는 한 줄이다.
**권장: `packages/ui` 에 `TextInput`(outline, 라벨 없는 한 줄) 신규** — 이름 자유, 접근성 이름은 `aria-label` = placeholder 문구(보이는 라벨이 없으므로; placeholder 만으로 이름 삼지 않는다). 높이 40 = padding 12 + line 16 + 12 (`--text-footnote` 크기 13 + `--text-caption-1--line-height` 16) · padding-inline `--space-3-5`(14) · fill 없음.
⚠️ 한 줄 입력에 상한 500자(`N5-16`)는 긴 문장이 가로로 흘러간다 → `N5-25` (한 줄 유지 vs 자동 높이 textarea — Figma 밖 동작).

### 3.4 `Button` — 기존 `variant="accent" size="md"` 그대로

- 45 높이 · 라벨 17 Semibold · 폭 100% · Disabled = opacity 50% (`17:18` ✓ = 기존 `--opacity-disabled: 0.5` `[직독]`) · loading 기존.
- 그림자: 기존 Button 은 명명 Style 로 통일(AD-3 허용 차이) — 변경 없음.

### 3.5 분류

| 컴포넌트 | 분류 | 위치 |
|---|---|---|
| `StarRating` | Shared UI | `packages/ui` 신규 |
| `TextInput`(가칭) | Shared UI | `packages/ui` 신규 (`N5-25` 결과에 따라 textarea 모드) |
| `Chip` `select` 변형 | Shared UI 확장 | `packages/ui` (`N5-26`·`N5-27`) |
| `ReflectionCard` | Feature | `features/reflection` (폼 상태·제출·S0~S6) |
| `AnalysisStatusView` | Feature | `features/session-feedback` (표시 상태·폴링) |
| `ShortFeedbackBubble` | Domain (표시만) | `entities/analysis` — `SpeechBubble` 래핑, 완료 화면 버블 토큰 재사용 |
| `SessionFeedbackPage` / slot 조립 | Page | `pages/session` (Composition 만) |

---

## 4. 신규 필요 Shared UI / Domain Component

§3.5 의 신규 3종(`StarRating` · `TextInput` · `Chip` 변형) + Domain 1종(`ShortFeedbackBubble`). `AnalysisStatusCard`(COMPONENT_MAP:133)는 **별도 카드 컴포넌트로 만들지 않는다** — 상태 표면이 기존 `InlineAlert` · `SpeechBubble` · `ErrorState` 로 충분하다(새 시각 언어 0). 승인 시 COMPONENT_MAP 갱신.

---

## 5. 토큰

### 5.1 그대로 쓰는 것 (Figma 선언과 값 일치 `[var][직독]`)

| 용도 | 토큰 | Figma |
|---|---|---|
| 카드 면 | `--color-surface-strong` (white 90%) | `glass-fill-strong #ffffffe5` |
| 카드 그림자 | `--shadow-bubble` | drop 1 + inset 2 (`[bound]` 확정) |
| 제목 색 | `--color-fg-primary` | `text-primary #4a5f5c` |
| 제목 글꼴 | `--text-headline` 크기 17 + `--font-weight-bold` | Bold 17 |
| 칩 선택 bg/fg | `--color-selected-bg` · `--color-selected-fg` | `accents/teal` · white |
| 칩 미선택 fg / 테두리 | `--color-action-secondary-fg` · `--color-border-subtle` | `#5e7370` · `stroke` |
| 입력 테두리 / placeholder / radius | `--color-border-subtle` · `--color-fg-tertiary` · `--radius-field`(16) | 18% · `#9aabaa` · 16 |
| 별 채움 | `--color-rating-filled` | `#d0cca1` |
| 간격 | `--space-5`(20) · `--space-4-5`(18) · `--space-3-5`(14) · `--space-3`(12) · `--space-2`(8) | 20/18/14/12/8 |
| 버튼 | 기존 `--button-*` | `17:12` |
| 피드백 화면 | `--session-complete-*` · `--bubble-*` (완료 화면 그대로) | `29:62` 상단 |

### 5.2 신규 요청 (전부 승인 필요 — 가값은 `P-28` 부터)

| ID | 토큰 | 값 | Tier | 이유 |
|---|---|---|---|---|
| **`T5-1`** | Primitive 신규(이름은 기존 명명 규칙에 맞춰, 예 `--haru-mist-300`) `#D6DEDC` → **`--color-rating-empty` 값 교체** | `#d6dedc` | 1 → 2 값 변경 | Figma 빈 별 fill. 현 ink 18% 와 다르다 (on card ≈ `#dfe4e3`) |
| `T5-2` | `--reflection-card-radius` | 30px | 3 | radius 스케일에 30 없음. ⚠️ radius.css 주석은 *"30 → card(28) 흡수"* 선례 — 최우선 규칙 1 로 **정확값 권장**, 흡수를 원하면 허용 차이 등록 (`N5-28`) |
| `T5-3` | `--reflection-card-width` | 370px | 3 | Figma 폭 |
| `T5-4` | `--reflection-card-gutter` | 11px | 3 | 좁은 폭에서 좌우 여백 |
| `T5-5` | `--reflection-card-offset` | 렌더 실측값 | 3 | 버블 박스 → 카드 top (§2.1) |
| `T5-6` | `--reflection-card-bottom-gap` | 29px | 3 | 하단 여백 |
| `T5-7` | `--reflection-card-title-line` | 20px | 3 | Figma `normal`. `--text-headline` 줄 22 를 쓰면 카드 304(+2) → AC-5-18 ±1 초과 |
| `T5-8` | `--reflection-chip-gap` | 7px | 3 | 스케일에 7 없음 (6/8 사이) |
| `T5-9` | `--rating-star-size` · `--rating-star-gap` | 30px · `var(--space-2)` | 3 | StarRating |
| `T5-10` | `--text-input-height` | 40px (계산값 — 선언용) | 3 | `91:715` |
| `T5-11` | `--chip-height-bordered` 또는 select 변형용 border | 33 (31 + 1×2) | 3 | `N5-27` 채택 시 |

신규 Semantic 색은 `T5-1` 의 값 교체 1건뿐. 새 HEX 는 Primitive 1개(`#d6dedc`).

---

## 6. Interaction / Motion (CSS 전용)

| 대상 | 동작 |
|---|---|
| 별 탭 | 1..n 채움 즉시 · 색 전환 fast · reduced-motion 즉시 |
| 칩 | 기존 press scale .97 · hover raised(포인터) — `select` 변형도 동일 |
| `Save` | 기존 Button 상태 · 제출 중 loading |
| 입력 포커스 | 모바일에서 `scrollIntoView({block:'nearest'})` 로 입력·`Save` 노출 (`R5-05`, 실기기 AC-5-33 NV) |
| 저장 성공 | Toast → 홈 replace (`N5-07` ⓐ). 화면 전환 애니메이션 없음 (기존) |
| 피드백 화면 상태 전환 | 폴링으로 pending → analyzed 바뀔 때 state slot 교체 + **완료 화면 버블 등장 모션(C-2 enter) 재사용** · reduced-motion 즉시 |
| 완료 화면 기존 모션(C-1~C-3) | 변경 0 — 카드는 **등장 모션 없음** (Figma 에 근거 없음) |

---

## 7. 상태 화면과 Mock 시나리오 매핑

| 화면 | 상태 | Mock 시나리오 | 명세 |
|---|---|---|---|
| 회고 카드 | 초기 / 입력 / 저장 중 / 성공 | `reflections/success` · `loading` | §2.2 S0·S1·S2·S5 |
| 〃 | 실패 · 재시도 | `error` · `retry` · `invalid-transition` | S3 |
| 〃 | 오프라인 | `offline` | S4 |
| 〃 | 재진입 | `session-completion/reflection-submitted` · `reflection-already-submitted` | S6 |
| 〃 | 대화 전용 · 30분 · 크래시 복구 완료 | 기존 session 시나리오 | §2.1 그대로 (카드 동일) |
| 피드백 화면 | Loading / pending / analyzed / text null / low-quality / failed / not-available ×2 / Error / Offline / NotFound | `analysis/*` (Plan §8) + `analysis-pending-then-completed` | §2.3 |
| 공통 | Permission Denied · Not Eligible | 해당 없음 (권한·자격 개념 없음) | — |

---

## 8. Responsive

### 8.1 가로 `[계산]` (SF Pro 폭은 근사 — 실측은 VG 에서)

| 폭 | 카드 | 칩 줄바꿈 | 제목 |
|---|---|---|---|
| 393 | 370 (x 11.5) · 안쪽 330 | 3 + 2 (Figma 그대로) | 1줄 |
| **320** | 298 · 안쪽 **258** | **2 + 2 + 1** (Engaged·Big feelings 181 / Ask Questions·Stay Focus 211 / Tricky today) → 카드 +40 | 기본 이름 1줄 · 긴 이름(`Alexandria`) **2줄** — 가운데 정렬 줄바꿈 허용 (`R5-08`). 말줄임 없음 |
| 600+ | 앱 컬럼 480 안에서 370 고정 · 가운데 | 3 + 2 | 1줄 |

- 별 행 182 는 258 안에 들어간다. 입력·버튼은 100%.
- 가로 넘침 0. 카드 그림자 좌우 4 ≤ 거터 11 → `AppShell` 가로 클립 0.

### 8.2 세로

| 콘텐츠 높이 | 동작 |
|---|---|
| ≥ 796 (393×852) | 스크롤 없음 · 카드 bottom = 콘텐츠 bottom − 29 |
| < 796 | `AppShell` 뷰포트 세로 스크롤로 `Save` 도달 (AC-5-31/32). 진입 시 `scrollTop = 0` 유지(`VG-K1S-02`). 상단 레이아웃 압축 **없음** — 완료 화면은 이미 내용 높이 흐름이다 `[직독: .haru-session-complete flex:none]` |
| 320×568 | 첫 화면에 카드 거의 안 보임 → 스크롤. 별도 처리 없음 |

- safe-area 하단은 `AppColumn` 이 더한다 `[직독]` — 29 여백 + safe-area.

---

## 9. Accessibility

### 9.1 이름·순서

| 대상 | 명세 |
|---|---|
| 카드 | `<section aria-labelledby={title id}>` · 제목 `h2` |
| 별 | §3.1 radiogroup |
| 칩 그룹 | `role="group"` + `aria-labelledby`(카드 제목) — 시각 라벨이 없으므로 그룹 이름 = 제목. 각 칩 `aria-pressed` |
| 입력 | `aria-label` = *"Anything to talk about this time? (optional)"* · `maxLength` (`N5-16`) |
| `Save` | 이름 *"Save"* · S0 disabled 이유 = 비활성 그대로(별·칩·입력 중 하나 이상 필요) — `aria-describedby` 로 SR 전용 문구 *"Choose stars, a tag, or add a note to save."* (초안, 시각 텍스트 추가 없음) |
| 포커스 순서 | 닫기 → (상단 비인터랙티브) → 별 → 칩 5 → 입력 → `Save` |
| 피드백 화면 | `h1` · state slot `aria-live="polite"` 1개 · 버블 텍스트 = 일반 텍스트 |

### 9.2 대비 `[계산 — 카드 면 = white 90% over 배경 #dbeee7 / #d3e3de / #c7c9d7]`

| 대상 | 대비 | 판정 |
|---|---|---|
| 제목 `#4a5f5c` | 6.51~6.69 | ✅ |
| 칩 미선택 라벨 `#5e7370` | 4.82~4.95 | ✅ |
| 칩 선택 라벨 white on teal | 2.07 | 수용 예외 `D-01` |
| `Save` white on teal | 2.07 | `D-01` |
| **placeholder `#9aabaa` 13** | **2.28~2.35** | ⛔ 4.5 미달 — **신규 가값 `P-28` 후보** (placeholder 는 보조 문구, 기존 `P-01` 범위 2.91~3.13 보다 낮다) |
| 별 채움 `#d0cca1` vs 면 | 1.56~1.61 | 기존 가값 `P-02` (별 대비) |
| 별 빈 `#d6dedc` vs 면 | 1.31~1.34 | `P-02` 확장 — **채움/빈 구분이 색만**이다(1.4.1). 보완 = radiogroup `aria-checked` (SR) · 시각 보완은 Figma 밖 → 디자이너 질문 후보 |
| 칩 미선택 테두리 ink 18% | 1.25~1.26 | 기존 `P-02` (비텍스트) |
| 칩 선택 teal 면 vs 카드 | 1.98~2.04 | `P-02` 계열 · check 아이콘 제거(`N5-26`) 시 1.4.1 근거가 **"채움 vs 테두리" 모양 차이 + `aria-pressed`** 로만 남는다 |

### 9.3 `R-SHADOW-1`

| 대상 | drop | 번짐 (좌우/위/아래) | overflow 조상 | 처리 |
|---|---|---|---|---|
| 카드 | `--shadow-bubble` 1겹 | **4 / 0 / 10** `[bound]` | `AppShell` 뷰포트 (`overflow-y: auto`) | 좌우 4 ≤ 거터 11 · 아래 10 ≤ 하단 여백 29 → **inset 불필요**. 스크롤 끝 클립 선 = 화면 가장자리 아님(29 안) — 클립 없음 확인 |
| `Save` | `0 12 14` + `0 2 2` | 14 / 0 / **26** | **카드 자신 (`overflow: clip`)** | **Figma 그대로 잘림** (padding 18 → 8px 클립). 근거 주석 + 세로·가로 프로브: 카드 아래 경계 밖 픽셀 = 카드 그림자만 |
| 칩 · 별 · 입력 | 0 | — | 카드 | 포커스 링(4px) 만 확인: 칩 행 좌우 여백 ≥ 15.5 · 별 행 74 · 입력/버튼 좌우 = 카드 padding 20 → **잘림 0** `[계산]`. 버튼 포커스 링 아래 4 ≤ 18 ✓ |
| 피드백 화면 버블·InlineAlert | 기존 | 기존 | `AppShell` | 완료 화면과 같음 |

---

## 10. Figma 누락 / 불일치 / 승인 필요 항목

### 10.1 Plan(R5-01 — 실측 없이 쓴 수치)과의 대조

**좌표·크기 (Plan §0.1 표 8행)**: 전부 **일치** ✓ (Plan 이 인용한 감사 §3.6 기록이 2026-11-08 라이브와 같다 — Figma 변경 없음).

**불일치 9건** (Plan 은 고치지 않는다 — plan-agent 보고):

| # | Plan / 기존 문서 | 실측 | 영향 |
|---|---|---|---|
| **M-1** ⭐ | 별 = `Icon shape=star 117:879` (Plan §9 · COMPONENT_MAP:69) | `117:879` 는 **25×24 다른 심볼**. 카드 별은 **30×30 frame + 자체 vector** | 에셋 출처 |
| **M-2** ⭐ | `--color-rating-empty` = ink 18% (가값 P-02) · 별 대비 "1.64:1" | Figma 빈 별 **`#D6DEDC` 단색** · 채움 대비 1.56~1.61 | 토큰 `T5-1` |
| **M-3** ⭐ | 칩 = 기존 `Chip`(selectable), 31/33 차이 원인 "실측 필요" | 원인 = **미선택 border 1px**. 기존 Chip 은 **inset shadow(31)** + **선택 시 check 아이콘**(Figma 없음) + weight 미지정(Figma Medium) | `N5-26`·`N5-27` |
| M-4 | 입력 = 기존 `TextField` 판정(행 42 차이) | 구조가 다르다 — 라벨 없음·radius 16·13px | 신규 `TextInput` |
| M-5 | `N5-19` ⓐ 히트 44 "간격 8 안에서 겹침 없는 범위" | 가로 최대 **38** — 44 는 불가능 | `N5-19` 재질문 |
| M-6 | `R-SHADOW-1` 카드 그림자 위험 (Plan R-5, 3겹 전제 사고 이력) | 카드 그림자 **1겹**(번짐 4/0/10) — inset 불필요. 대신 **카드 `overflow: clip` 이 `Save` 그림자를 자른다**(Figma 선언) | §9.3 |
| M-7 | 카드 y "521 (버블 bottom 468 + 53)" 를 고정 좌표로 서술 | 468 은 버블 **선언** 높이 끝 — 구현 버블 박스와 다를 수 있다 → 흐름 배치 + 실측 offset | `N5-29` |
| M-8 | (언급 없음) 제목 타이포 | **Bold 17 / line 20** — `--text-headline`(Semibold/22) 아님 | `T5-7` |
| M-9 | (언급 없음) 카드 radius · fill | **30** · white 90% · **blur 없음** — 기존 `--radius-card` 28 아님 | `T5-2`·`N5-28` |

### 10.2 Plan `N5-*` — **Figma 로 확정** (`D5-1` 적용, 근거 node)

| ID | 확정 내용 | Figma 근거 |
|---|---|---|
| `N5-01` (UI 부분) | 칩 **5개 · 각각 on/off 토글**(척도 아님) | `91:710`~`714` = `Select` Green/Transparent 2변형뿐. ⚠️ **값 형태(배열 ⓐ vs Record ⓑ)는 contract 결정** — Figma 로 정해지지 않는다 → 권고 ⓐ 유지 |
| `N5-02` | **입력 1칸 · 두 번째 카드 없음** (ⓐ) | `91:715` 1개. V.1 `125:816` 도 1칸 |
| `N5-06` (UI 부분) | **Skip 버튼 없음 · 닫기 ✕ 만** | V.2 카드에 없음 · V.1 의 `Skip for now`(`125:855`)가 **V.2 에서 제거됨** |
| `N5-20` | 라벨 **`Engaged` · `Big feelings` · `Ask Questions` · `Stay Focus` · `Tricky today`** (대소문자 그대로, ⓐ) | override 문자열 `[ctx]` |
| `PF5-3` · `PF5-4` · `PF5-6` | on/off 칩 · 카드 **제목**(버블 아님) · 제목에 **아이 이름** | `91:692` text · `91:709` |
| (참고) `N5-05` 시각 | 비활성 표현 = Accent / **Disabled opacity 50%** | `17:18` — **활성 조건 자체는 Figma 밖** (아래) |

### 10.3 **사용자 결정 필요** (Figma 로 정해지지 않음)

| ID | 질문 | 권고 |
|---|---|---|
| `N5-04` | 제목 이름 출처 | ⓐ copy 템플릿 + `Me.child.firstName` |
| `N5-05` | `Save` 활성 조건 | ⓐ 하나 이상 입력 시 (Figma Disabled 변형으로 표현) |
| `N5-07` | 저장 성공 후 | ⓐ Toast + 홈 replace |
| `N5-08` | 재진입 | ⓐ 같은 카드 읽기 전용 (§2.2 S6) |
| `N5-10` | 피드백 화면 앱 내 진입점 | ⓐ deep link 만 |
| `N5-12` · `N5-11` · `N5-14` · `N5-15` · `N5-16` · `N5-18` · `N5-23` | Plan 권고 그대로 | Plan §15.2 |
| `N5-19` (재질문) | 별 히트 영역 | **38×44** (겹침 0) + 가로 44 미달을 가값 **`P-29`** 로 기록 |
| `N5-24` | pending 시간 표현 | *"usually ready by tomorrow"* (수치 약속 회피) — §2.3 문구 일괄 확인 |
| 🆕 `N5-25` | 입력 한 줄(Figma) vs 자동 높이 textarea | **한 줄 유지**(Figma) + `maxLength 500`. 자동 높이는 Figma 밖 동작 |
| 🆕 `N5-26` | 칩 선택 시 check 아이콘 (기존 Chip 규칙 WCAG 1.4.1) vs Figma 없음 | **Figma(없음)** — `Chip` `select` 변형 신설, 기존 변형 불변. 1.4.1 은 모양 차이(채움/테두리) + `aria-pressed` 로 기록 |
| 🆕 `N5-27` | 미선택 칩 높이 31(현 구현) → 33(Figma·Stage 1 Spec) | **33** — `select` 변형에서만 (온보딩 회귀 0) |
| 🆕 `N5-28` | 카드 radius 30 정확값 vs 28 흡수 | **30** (`T5-2`) |
| 🆕 `N5-29` | 카드 세로 = 흐름 배치(버블 뒤) vs 고정 y | **흐름** — 버블 문구 길이가 바뀌어도 간격 유지, 기본 fixture 에서 521 |
| 🆕 `N5-30` | `--color-rating-empty` 값을 Figma `#D6DEDC` 로 교체 (`T5-1`, 신규 Primitive 1) | **교체** |
| 🆕 `N5-31` | 회고 실패·오프라인 안내 표면 | **Toast** (카드 기하 불변) + 회고 전용 오프라인 문구 |
| 🆕 `N5-32` | placeholder 대비 2.28~2.35 | 가값 **`P-28`** 등재 (디자이너 대기) |
| `C13-S5-1` 문구·레이아웃 | §2.3 전체 | 승인 요청 |
| `C13-S5-2` 상태 | §2.2 전체 | 승인 요청 |

### 10.4 PRD ↔ Figma (추가 근거만)

| 항목 | PRD | Figma | 영향 | 결정 |
|---|---|---|---|---|
| 건너뛰기 | §5.3 "선택 사항" | V.1 `Skip for now` → **V.2 제거** | `PF5-5` 근거 보강 | `D5-1` 로 Figma |
| 서재 평점 | §6.1 다른 가정 평균 금지 | V.1 `ALL HARU FAMILES 4.2 avg` → **V.2 제거** | 일치 | 없음 |

---

## 11. Visual Gap 검토 계획 (최우선 규칙 5)

| 단위 | 비교 | 방법 |
|---|---|---|
| `S5-B` 회고 카드 | Figma `91:691` render(378×312) ↔ 구현 element screenshot (393·852) | 나란히 + 기하 단정: 카드 (11.5, 465 웹) 370×302 ±1 · 제목 · 별 첫 x 74 · 칩 5개 bbox · 입력 40 · 버튼 45 |
| 〃 | **computed** 확인 (`R-FIGMA-1` ④): 카드 `overflow` · `border-radius` 30 · `box-shadow` = `--shadow-bubble` · 칩 `font-weight` 510/500 · 칩 높이 31/33 · 입력 border | `getComputedStyle` 프로브 |
| 〃 | 그림자 프로브 세로·가로: 카드 바깥 아래 10 · 좌우 4 · `Save` 그림자 카드 경계에서 끊김 | 픽셀 프로브 (`R-SHADOW-1` ⑥) |
| 〃 | 상단 y 0~468 불변 (AC-5-19) | 4b baseline diff 클러스터 0 — `R-BASELINE-1` (`=all`, 원인별 분해) |
| 〃 | 320 · 600 · 1024 · 393×667 스크롤 끝 | 칩 2+2+1 · 긴 이름 2줄 · 클립 0 |
| `S5-C` 피드백 화면 | Figma 없음 → **이 Spec §2.3 대비** 검토 + 완료 화면 상단과 골격 좌표 동일(제목·메달리온) | 상태별 screenshot 11종 |
| 공통 | dev 패널 숨김 · settle 후 촬영 | `R-BASELINE-1` ①② |

---

## 12. development-agent 구현 메모

1. 칩·별·입력의 **선언값은 §0.2** 가 출처다 — 렌더 png 에서 색을 읽지 않는다.
2. 별 SVG 는 `get_design_context(91:691)` 로 다시 받아 HARU SVG 로 등록(`currentColor`). `117:879` 를 쓰지 않는다.
3. 카드 그림자 = `--shadow-bubble` (새 그림자 토큰 만들지 않음). 카드 `overflow: clip` 에는 근거 주석.
4. 상단(y 0~468) 코드·토큰 변경 0. slot 은 본체 상태에서만.
5. 회고 입력 값은 메모리에만. 콘솔·devWarn 에 `note` 0.
6. `T5-*` 토큰·`N5-25~32` 는 **승인 후** 적용. 승인 전 임의 값 금지.

---

## 13. Addendum `D5-14` — 회고 카드 제목 2줄 이상일 때 완료 화면 무스크롤 (APPROVED)

Status: **APPROVED (2026-11-11, user) — 2안 채택 (`D5-15`, AD-S5-3 · AD-S5-4).** 이전 상태: DRAFT (2026-11-11, design-agent).
근거: `D5-14` (`docs/decisions/stage-5-approvals.md`) · `docs/qa/stage-5-handoff.md` §H5-7.5 · Figma `91:692` 라이브 조회 2026-11-11.
⛔ Production Code · Figma 수정 없음. 측정은 저장소 밖 임시 probe(Playwright, vite `:4419`, dsf 1, reduce motion, dev 패널 숨김)로 했고 probe 는 저장소에 남기지 않았다.

### 13.1 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 방법 |
|---|---|
| `[run]` | 실제 앱: 로그인 → 세션 → 녹음 → `Submit` → 완료 화면 settle 후, 제목 텍스트 노드만 `How was storytime with {name}?` 로 교체하고 2 rAF 뒤 `getBoundingClientRect` · `[data-app-shell-viewport]` `scrollHeight − clientHeight`(= 세로 넘침) · 제목 `scrollWidth − clientWidth`(= 글자 가로 넘침) |
| `[opt]` | 옵션 CSS 를 `<style>` 로 주입한 같은 측정 (코드 변경 아님) |
| `[px]` | 카드 영역 clip 스크린샷(y 380~852) base ↔ 옵션 픽셀 diff · 같은 조건 base ↔ base 재촬영으로 노이즈 확인 |
| `[ctx]` | `get_design_context(91:692)` 선언값 |

### 13.2 현재 레이아웃 실측 `[run]` (높이 852)

| 요소 (웹 y, 상태바 56 없음) | 320 | 360 | 375 | 393 (=600·1024) |
|---|---|---|---|---|
| 닫기 줄 0~48 · 스티커 44~108 · 메달리온 116~266 · 버블 266~375.63 | 동일 | 동일 | 동일 | 동일 |
| 버블 본체 bottom → 카드 top (`--reflection-card-offset`) | 89.375 | 89.375 | 89.375 | 89.375 |
| 카드 top · 높이 (제목 1줄) | 465 · **342** (칩 3행 +40) | 465 · 342 | 465 · 302 | 465 · 302 |
| 카드 bottom + 아래 여백 29 | 836 | 836 | 796 | 796 |
| **세로 여유 (852 − 836/796)** | **16** | **16** | **56** | **56** |
| 제목 가용 폭 | 258 | 298 | 313 | 330 |

이름별 제목 1줄 폭(Bold 17) 과 결과:

| 이름 | 1줄 폭 | 320 | 360 | 375 | 393 |
|---|---|---|---|---|---|
| Nova | 249.27 | 1줄 · 넘침 0 | 1 · 0 | 1 · 0 | 1 · 0 |
| **Emma** | **258.70** | **2줄 · 넘침 4** | 1 · 0 | 1 · 0 | 1 · 0 |
| Sebastian | 289.22 | 2 · **4** | 1 · 0 | 1 · 0 | 1 · 0 |
| Maximiliana | 304.92 | 2 · **4** | 2 · **4** | 1 · 0 | 1 · 0 |
| Anastasia-Rose | 336.53 | 2 · **4** | 2 · **4** | 2 · 0 | 2 · 0 |

- **2줄 문턱** = 제목 1줄 폭 > 가용 폭. 320 에서는 Nova 보다 약 9px 넓은 이름부터(=Emma), 393 에서는 1줄 폭 330 초과(≈ 이름 12자 이상, 예 `Anastasia-Rose`).
- 320·360 은 칩이 3행이라 여유가 16 뿐 → 제목 +20 이면 **4px 넘침**. 375 이상은 여유 56 → 2줄(+20)도 0.
- 🆕 **기존 결함 발견** — Figma `91:692` 는 **`word-break: break-word`** `[ctx]` 인데 구현 제목에는 없다. 공백 없는 긴 이름은 줄바꿈되지 않고 카드 `overflow: clip` 에 **잘린다** (`[run]` 31자 단일 단어 320 → 글자 가로 넘침 25px, 40자 `W…` → 420px). 아래 모든 옵션은 이 Figma 선언을 **복원**한다(`overflow-wrap: break-word` — Figma 와 같음, 이탈 아님).
- 🆕 **AC-4-99 주석과 실제가 다르다** — 테스트 주석은 "796 이상 높이는 스크롤 없음" 이지만 **320×796 은 지금(Nova)도 40px 넘친다** `[run]` (칩 3행 +40). 테스트는 `×852` 만 재므로 통과한다. 796 기준은 393(Figma 콘텐츠 796)에서만 성립한다.

### 13.3 세로 여유가 어디 있고 무엇이 Figma 로 고정인가

| 구간 | 값 | Figma 고정? |
|---|---|---|
| 상단 y 0~375.63 (닫기~버블) | — | **고정** (Stage 4 승인 · AC-5-19 불변) |
| 버블 → 카드 89.375 | Figma 521 정렬 | **고정** (393 픽셀 일치의 근거) |
| 카드 내부 302 (+칩 3행 40) | gap 14 · padding 20/18 | **고정** (`91:691` 세로 합) |
| 카드 아래 여백 29 | Figma 852 − 823 | ⚠️ **웹에서는 852 높이에서 보이지 않는다** — 웹에는 상태바 56 이 없어 393×852 에서 카드 아래 실제 빈 공간은 **85**(= 29 + 56) 다. 29 는 스크롤 끝(높이 < 콘텐츠)에서만 보인다 |
| 그 아래 56 | 상태바 몫 | Figma 에 없음 (웹 전용 여유) |

⇒ **393·600·1024 × 852 화면에 보이는 것을 바꾸지 않고 줄일 수 있는 것은 "아래 여백 29" 뿐**이다. 하한 = 카드 그림자 아래 번짐 **10** (`R-SHADOW-1`, §9.3 `[bound]`).

### 13.4 옵션 (전부 `overflow-wrap: break-word` 복원 포함)

| | 옵션 1 — 아래 여백 축소 | **옵션 2 — 옵션 1 + 제목 최대 2줄 말줄임** ⭐ 권고 | 옵션 3 — 버블↔카드 간격 가변 |
|---|---|---|---|
| 변경 | `--reflection-card-bottom-gap` **29 → `--space-3`(12)** (모든 폭) | 옵션 1 + `.haru-reflection-card__title` 를 **2줄 clamp**(`-webkit-line-clamp: 2` + `display: -webkit-box` + `overflow: hidden`), 접근성 이름은 전체 문자열 그대로(DOM 텍스트 불변) | 카드 위 간격 = `clamp(--space-6 24, 남는 높이, 89.375)` — 넘칠 때만 위 간격이 줄어든다 (spacer flex 또는 레이아웃 재구성 필요) |
| 393·600·1024 ×852 (Emma) | **픽셀 동일** `[px]` 카드 영역 diff **0 px** | **픽셀 동일** `[px]` diff **0 px** | 1~3줄 동일 · 4줄(40자 `W`)이면 카드 4px 위로 |
| 320 ×852 Emma | 카드 위치 불변 · 제목 2줄 · **넘침 0** `[opt]` | 동일 · **넘침 0** · `[px]` diff 47px · 최대 Δ1 (AA 노이즈, 임계 0.02 ≈ Δ5.3 미만) | 카드 top 465 → **461** · 넘침 0 |
| Figma 이탈 (승인 필요) | 스크롤 끝 아래 여백 29 → 12 (높이가 콘텐츠보다 작을 때만 보임) | 옵션 1 + **3줄 이상이 될 이름의 말줄임**(Figma 에 말줄임 없음 — 문구 일부가 안 보인다) | 좁은 폭·긴 이름에서 **카드 세로 위치가 Figma 521 과 달라짐**(최대 −65) |
| 320×852 이름 한계 `[opt]` | **2줄까지 0** (Emma·Sebastian·Maximiliana·`Mary Elizabeth Anne` 19자) · **3줄이 되는 이름 = 7px 스크롤** (31자 단일 단어 · 38자 다단어) · 40자 `W` 4줄 = 27px | **contract 최대 40자 전부 0** (`CHILD_NAME_MAX_LENGTH` — 측정한 최악 40×`W` 포함) | 4줄까지 0 (40×`W` 포함) · 여유 16 + 65 = 81 → 5줄(+80)부터 위험 |
| 393·600·1024 ×852 한계 | 40자 전부 0 (4줄 +60 ≤ 여유 56+17=73) | 40자 전부 0 | 40자 전부 0 |
| `R-SHADOW-1` | 아래 번짐 10 ≤ 12 ✓ (여유 2 — 프로브 회귀 테스트 필수) | 동일 | 변화 없음 (29 유지) |
| 구현 크기 | 토큰 값 1 + CSS 1줄 | 옵션 1 + CSS 3줄 | 레이아웃 구조 변경 (가장 큼) |

기각한 방향: ⓐ **1줄 말줄임** — Emma 부터 이름이 잘린다(320 에서 이름이 거의 안 보임), Figma `break-word` 와 정면 충돌. ⓑ **좁은 폭 제목 16px** `[opt]` — Emma 는 1줄이 되지만 Sebastian 부터 다시 4px 넘침, 타이포 이탈만 생기고 해결이 아니다.

### 13.5 권고 — **옵션 2**

1. 393·600·1024 × 852 에서 **보이는 픽셀 변화 0** (측정 diff 0) — 최우선 규칙 1 을 지킨다.
2. contract 가 허용하는 **모든 이름(≤ 40자)** 에서 320×852 무스크롤이 **보장**된다 (옵션 1 은 ~28자 이상 이름에서 다시 깨진다).
3. 말줄임은 **3줄 이상이 될 이름에서만** 발생한다 (320 기준 대략 이름 폭 > 250px ≈ 28자 이상, 393 은 더 길다). 현실의 이름 대부분은 영향 0.
4. 이탈 지점 2개를 명시해 승인받는다: **`AD-S5-3` 후보** 스크롤 끝 아래 여백 29 → 12 · **`AD-S5-4` 후보** 제목 최대 2줄 말줄임(Figma 무제한 줄바꿈). `break-word` 는 Figma 복원이라 허용 차이가 아니다.

### 13.6 AC-4-99 문구 — **수정 필요** (plan-agent 소유, 이 Agent 는 고치지 않는다)

- 현재 테스트 주석 "796 이상 높이는 스크롤이 없다" 는 **320 폭에서 이미 거짓**이다 (13.2 — 320×796 Nova 40px). 옵션 1·2 를 적용해도 320×796 은 23px 넘친다 `[opt]`.
- 제안 문구: *"세로 넘침 0 — 320 / 393 / 600 / 1024 × **852** 에서, `child.firstName` 이 `CHILD_NAME_MAX_LENGTH`(40) 이하인 모든 값에 대해. 852 미만 높이는 세로 스크롤 허용(§8.2)."* (옵션 1 채택 시 "제목 2줄 이하인 이름" 으로 한정)
- 회귀 테스트 제안: AC-4-99 완료 상태를 이름 **Emma(Mock 기본) + 40자 최악(`W`×40) + 공백 없는 31자** 로 재고, 제목 `scrollWidth − clientWidth = 0`(가로 잘림 0) 을 추가 단정.

### 13.7 development-agent 구현 메모 (승인 후에만)

1. `--reflection-card-bottom-gap: var(--space-3)` — 주석에 "Figma 29 는 웹 852 에서 안 보임(상태바 56 없음) · 하한 = 카드 그림자 아래 10 (`R-SHADOW-1`)" 근거.
2. `.haru-reflection-card__title` 에 `overflow-wrap: break-word` (Figma `91:692` `word-break: break-word`) + (옵션 2) 2줄 clamp. clamp 는 **시각만** — `h2` 텍스트·`aria-labelledby` 는 전체 이름.
3. `MOCK_CHILD_FIRST_NAME = 'Emma'` 는 `D5-14` 대로. baseline 은 `R-BASELINE-1` ⑤ 원인별 분해 후 재생성 (예상: `s4-session-complete` 제목 글자 영역만).
4. 아래 그림자 프로브(세로) — 스크롤 끝에서 카드 아래 10px 그림자가 뷰포트 클립에 닿지 않음을 320×667 등 스크롤 높이에서 확인.
