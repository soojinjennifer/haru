# Stage 1 Design Spec — Frontend Foundation + Shared UI + Router/Layout + Design Tokens

Status: APPROVED (2026-09-18, user) — 승인 체크포인트 통과. 가값 5건·신규 토큰 3종 채택안 승인, 상세는 `docs/decisions/stage-1-approvals.md`

Based on:
- **Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k`** — page `8:2` Design Guide (`17:366` Foundations · `17:367` HARU Components · `17:368` iOS 26 Components), page `16:2` MVP_KeyScreen_V.2 (`31:204`, `179:1700`). **2026-09-18 재조회 node**: `17:367`(section metadata) · `17:20` · `17:343` · `25:87` · `76:417` · `76:440` · `78:158` · `88:721` · `88:789` · `90:626` · `139:2734` · `50:157` · `26:21` · `28:51` · `163:1807` · `179:1701` · `179:1719` · `179:1724` · `179:1748` · `179:1770` · `179:1809` · `179:1813`
- **Stage 1 Plan** `docs/plans/stage-1-plan.md` (DRAFT 2026-09-18, plan-agent) — §9 Deliverables · §11 AC-1-01~45 · §15 Handoff · §16 D-1~D-10
- **승인 문서** `docs/decisions/stage-0-approvals.md` (§1 결정 · §3 D-01~D-04 · §4 P-01~P-16 · §6 L-01~L-07) — 기존 문서와 다르면 이 기록이 우선
- `docs/DESIGN_SYSTEM.md` · `docs/DESIGN_TOKEN_MAP.md` · `docs/COMPONENT_MAP.md` · `docs/FIGMA_SCREEN_MAP.md` · `docs/FRONTEND_IMPLEMENTATION_PLAN.md` §1.0–§1.7 · `PLANNING.md` §5·§9.2·§10
- Rules: `.claude/rules/frontend.md` §6·§7·§9 · `.claude/rules/workflow.md` §2 · `.claude/rules/qa.md`

Author: design-agent

---

## 0. 이 문서를 읽는 법

### 0.1 라벨

| 라벨 | 뜻 |
|---|---|
| `CONFIRMED (#id)` | 사용자 결정 (2026-09-14 승인 로그 §1) |
| `CONFIRMED (Figma)` | Figma에서 값을 직접 확인함 (조회 일자 2026-09-18) |
| `가값 (P-xx)` | 승인 로그 §4 가값 — `provisional` 주석 대상, Stage 1 구현 후 항목별 승인 |
| `D-0x` | 승인 로그 §3 수용 예외 |
| `RECOMMENDED` | design-agent 제안 (사용자 미결정 세부) |
| `신규 토큰 제안` | Figma에 값이 없고 이 문서가 처음 제안 — 승인 필요 |
| `NEEDS DECISION` | 사용자/디자이너 결정 필요 |
| `허용 차이` | Figma와 구현이 다를 수밖에 없는 지점 — QA는 FAIL 처리하지 않음 (§10.3) |

### 0.2 이 문서의 권한 경계

- design-agent는 **Production Code를 작성하지 않는다**. 이 문서는 명세이며, `packages/**`·`apps/**` 파일은 development-agent만 만든다.
- **Figma를 수정하지 않는다.** 디자이너 요청 항목은 §13.3에 모아둔다.
- 화면 코드에 들어갈 값은 **토큰 이름으로만** 기술한다. Figma에서 관찰한 수치는 "현황 사실"로만 적고, 구현 값은 반드시 토큰을 거친다.

### 0.3 Stage 1의 성격 — "화면"이 아니라 "기반 레이어"

Stage 1에는 **사용자에게 보이는 제품 화면이 없다** (Plan §1 Non-Goal). 따라서 design-agent 규칙 §7의 "대상 화면" 절은 다음으로 치환한다.

| design-agent §7 절 | 이 문서 위치 |
|---|---|
| 1. 대상 화면 (Figma node → route) | §1 대상 범위 · §10.1 Figma node 참조 목록 |
| 2. 화면별 레이아웃 구조 | §2 Layout / §7 Responsive |
| 3. 사용 컴포넌트와 Variant / State | §4 Shared UI 22종 · §6 TopBar / BottomTabBar |
| 4. 신규 필요 Shared UI / Domain Component | §4 (Figma 없음 → 명세 행) · §13.1 |
| 5. 사용 토큰 | §3 3-tier 토큰 정의표 |
| 6. Interaction / Motion | §9.1 Motion |
| 7. 상태 화면과 Mock 시나리오 매핑 | §5 공통 상태 패턴 · §5.7 Mock 매핑 |
| 8. Responsive Rule | §7 |
| 9. Accessibility 메모 | §9.2–§9.4 |
| 10. Figma 누락 / 불일치 / 승인 필요 | §12 판단 보고 · §13 |

---

## 1. 대상 범위

### 1.1 Stage 1이 만드는 시각 산출물

| 산출물 | 위치(명세 대상) | Figma 근거 | 확인 수단 |
|---|---|---|---|
| 3-tier Design Token | `packages/design-tokens` | `17:366` Foundations, `17:129` Colors, `17:298` Typography, `17:367` HARU Components, `17:332`/`16:24` Material | dev UI gallery `/__dev/ui/tokens` |
| Shared UI 22종 | `packages/ui` | §4 표의 node 열 | dev UI gallery `/__dev/ui/components` |
| 공통 상태 패턴 6종 | `packages/ui` (feedback/*) | **Figma 없음 → 이 문서가 유일 기준** (#22, `가값 (P-10)`) | dev UI gallery `/__dev/ui/states` |
| Layout (AppColumn + 3 Layout) | `packages/ui`(AppColumn) / `apps/web/src/app/layouts` | 화면 frame 구조 393×852 | `/__dev/ui/responsive` |
| Route 골격 | `apps/web/src/app/router.tsx` | — | `/`, `*` |

### 1.2 Stage 1에서 화면으로 만들지 않는 것

`/` 는 Stage 2에서 Home skeleton으로 교체될 **임시 placeholder** 다 (#33). Stage 1의 `/` 는 AppColumn + `AppBackground` + 텍스트 1줄 + health 상태 표시(Mock 경로 증명용)만 갖는다. **BottomTabBar를 `/` 에 마운트하지 않는다** (Stage 3, Plan §3.1). BottomTabBar·Sheet·Dialog·SpeechBubble 등은 **gallery에서만** 렌더한다.

### 1.3 C-13 (Figma 누락 화면 질문 절차) 적용 여부

**Stage 1에는 해당 없음.** Stage 1의 Figma 누락 대상은 "화면"이 아니라 **공통 상태 컴포넌트와 컴포넌트 상태**이며, 이는 결정 #22로 **design-agent 명세 선구현이 이미 승인**되어 있다 (COMPONENT_MAP §7 "C-13 예외" 2행). 따라서 이 문서는 C-13 질문 없이 해당 항목을 명세한다.

---

## 2. Layout 구조

### 2.1 소유 위치 (Plan §5.3 해소안 채택)

| 대상 | 위치 | 이유 |
|---|---|---|
| `AppColumn` | `packages/ui/src/layout/AppColumn.tsx` | 도메인·라우팅 지식 없는 순수 레이아웃 primitive |
| `AppBackground` | `packages/ui/src/surface/AppBackground.tsx` | gradient 배경 (뷰포트 전체) |
| `TabLayout` / `FullscreenLayout` / `StackLayout` | `apps/web/src/app/layouts/` | router outlet·탭 항목·네비게이션 인지 필요 (ARCHITECTURE §2.2) |

### 2.2 화면 골격 (모든 Layout 공통)

```
<AppBackground>                         ← 뷰포트 전체, --gradient-app, fixed
  └ <AppColumn>                         ← min 320 / max 480, 가운데 정렬, px = --layout-gutter
      ├ [safe-top 영역]                 ← padding-top: --layout-safe-top
      ├ TopBar 영역        (선택)        ← sticky, z = --z-sticky
      ├ 콘텐츠 영역         (스크롤)      ← flex:1, overflow-y:auto, overscroll-behavior:contain
      ├ 하단 고정 CTA 영역  (선택)        ← 스크롤 컨테이너 **내부** (키보드 가림 방지)
      └ BottomTabBar 영역  (선택)        ← fixed, z = --z-tabbar, bottom = --layout-safe-bottom
```

- 배경 gradient는 **뷰포트 전체**에 깔고 앱 컬럼만 가운데 정렬한다 (DESIGN_SYSTEM §11.2).
- BottomTabBar·Sheet·Toast·Dialog도 **앱 컬럼 폭 안에** 정렬한다 (좌우 `--layout-gutter`).
- 콘텐츠 하단 padding = `--layout-tabbar-height` + `--layout-safe-bottom` (Tab Bar가 있는 Layout).
- 고정 높이 컨테이너 금지 (텍스트 200% 확대 reflow — DESIGN_SYSTEM §11.2).

### 2.3 Layout별 영역 구성

| Layout | TopBar | 콘텐츠 | 하단 CTA | BottomTabBar | 사용 (Stage) |
|---|---|---|---|---|---|
| `TabLayout` | `variant=large` 또는 없음 | 스크롤 | — | **있음** (Stage 3부터 실사용) | `/`, `/library`, `/progress` (3) |
| `StackLayout` | `variant=inline` 또는 `centered` | 스크롤 | 선택 | 없음 | `/auth/*`, `/onboarding/*`, `/settings` (2) |
| `FullscreenLayout` | 없음 또는 `variant=pill` | 스크롤 없음(고정 배치) | 선택 | 없음 | `/session/:id` (4) |

Stage 1에서는 세 Layout 모두 **골격만** 만들고 `/` 는 `StackLayout`(TopBar 없음)으로 렌더한다. `TabLayout`은 gallery에서만 확인한다.

### 2.4 `AppColumn` 명세

| 속성 | 값 | 토큰 |
|---|---|---|
| min-width | 320px | `--layout-min-width` — CONFIRMED (#12) |
| max-width | 480px | `--layout-app-max-width` — CONFIRMED (#12) |
| 좌우 padding | 24px | `--layout-gutter` — `가값 (P-13)` (§12.2) |
| 가운데 정렬 | `margin-inline: auto` | — |
| safe-area | 상·하 `env(safe-area-inset-*)` | `--layout-safe-top/bottom` — `가값 (P-08)` |
| props | `as`, `children`, `padded`(default true), `edgeToEdge`(gutter 제거 — 가로 캐러셀용) | RECOMMENDED |

`edgeToEdge` 는 Stage 3 Carousel이 화면 끝까지 스크롤해야 하므로 Stage 1에서 API만 열어둔다 (구현은 padding 제거뿐).

---

## 3. 3-tier 토큰 정의표

참조 방향: **Component → Semantic → Primitive** (역방향·건너뛰기 금지, TOKEN_MAP §1). 값의 기준은 **Figma만** 이다 (#10-①). 로컬 `_ds` CSS 참조 금지.

### 3.1 Tier 1 — Primitive

#### 3.1.1 Color primitive (총 30개)

파일 제안: `packages/design-tokens/src/primitive/color.css`

| Primitive CSS Var | 값 | Figma 근거 | 비고 |
|---|---|---|---|
| `--haru-palette-blue` | `#7faec1` | `17:129` `accents/blue` | 탭 선택 색으로 쓰지 않음 (#19) |
| `--haru-palette-cyan` | `#a0ccdd` | `accents/cyan` (`76:441` 재확인) | Cognitive Flexibility |
| `--haru-palette-teal` | `#85bfb6` | `accents/teal` (`17:12`, `90:625`, `179:1768` 재확인) | 브랜드 주 색 |
| `--haru-palette-mint` | `#b0cfc0` | `accents/mint` (`78:274` gradient 끝) | |
| `--haru-palette-green` | `#90bfad` | `accents/green` (`76:439`) | Self-Direction |
| `--haru-palette-yellow` | `#d0cca1` | `accents/yellow` | 별점·스티커 |
| `--haru-palette-orange` | `#eed2bd` | `accents/orange` | 스티커 gradient 끝 |
| `--haru-palette-red` | `#e8a9a0` | `accents/red` | status-error **border** 로만 |
| `--haru-palette-pink` | `#efc3d4` | `accents/pink` (`76:443`) | Emotion Regulation |
| `--haru-palette-purple` | `#c9b8d4` | `accents/purple` (`76:445`) | Intrinsic Motivation |
| `--haru-palette-indigo` | `#a9b6cf` | `accents/indigo` | 사용 화면 없음 |
| `--haru-palette-brown` | `#beafa4` | `accents/brown` | 사용 화면 없음 |
| `--haru-ink-800` | `#3b4a48` | raw — `76:431`, `179:1787` (`76:417` 재확인) | 입력 값·질문 |
| `--haru-ink-700` | `#4a5f5c` | `text-primary` (`17:22`, `88:759`, `179:1721` 재확인) | |
| `--haru-ink-600` | `#5e7370` | `text-button` (`17:5`, `90:617` 재확인) | 그림자 ink 원색과 동일 |
| `--haru-ink-500` | `#7d9291` | `text-secondary` (`25:38`, `88:760`, `179:1720` 재확인) | |
| `--haru-ink-400` | `#9aabaa` | `color/grey/64` (`76:430` 재확인) | 입력 라벨 |
| `--haru-ink-300` | `#b3c0bf` | raw — `163:2567` | 텍스트 사용 금지 (장식) |
| `--haru-ink-600-a30` | `rgb(94 115 112 / .30)` | `Corduroy 30%` (`88:786` 재확인) | PageIndicator 비활성 |
| `--haru-ink-600-a18` | `rgb(94 115 112 / .18)` | `stroke` (`90:624` border 재확인) | 경계선 |
| `--haru-ink-600-a12` | `rgb(94 115 112 / .12)` | raw `.12/.13` (`76:362` = `.13` 재확인) | 구분선·track |
| `--haru-white` | `#ffffff` | `grays/white` 외 7개 이름 | |
| `--haru-white-a90` | `rgb(255 255 255 / .90)` | `glass-fill-strong` (`88:758`, `179:1756` 재확인) | |
| `--haru-white-a74` | `rgb(255 255 255 / .74)` | `glass-fill` (`17:4`, `25:33`, `78:157` 재확인) | `.72`·`.82`·`.85`·`.86` 흡수 |
| `--haru-white-a50` | `rgb(255 255 255 / .50)` | raw — 카드 스택·track (`.62` 흡수) | |
| `--haru-mist-50` | `#edf3f1` | raw `rgba(233,240,237,.8/.9)` 불투명 정규화 | 설문 옵션·보조 배경 |
| `--haru-mist-100` | `#dbeee7` | `color/spring green/90 2` (`179:1748` gradient stop 0% 재확인) | |
| `--haru-mist-200` | `#d3e3de` | `color/spring green/86` (`179:1748` stop 46% 재확인) | |
| `--haru-dusk-200` | `#c7c9d7` | `color/blue/81` (`179:1748` stop 100% 재확인) | |
| `--haru-paper-100` | `#f0eee6` | `color/grey/92` (`86:482`) | CoachingNote |

**가져오지 않는 primitive**: `color/violet/67` `#ac93c4` (#19로 purple 통일), `grays/black`, iOS `grays/*`·`backgrounds/*`·`fills/*`·`labels/*`·`separators/*` (TOKEN_MAP §2.5).

#### 3.1.2 Status primitive — `가값 (P-04)` (Figma에 값 없음)

| Primitive CSS Var | 값 | 근거 |
|---|---|---|
| `--haru-status-error-fg` / `-bg` | `#a8483e` / `#f7e4e1` | design-agent 제안 (TOKEN_MAP §4) |
| `--haru-status-warning-fg` / `-bg` | `#7d6a2a` / `#f4f1de` | 동상 |
| `--haru-status-success-fg` / `-bg` | `#3f7563` / `#e3f0ea` | 동상 |
| `--haru-status-info-fg` / `-bg` | `#3e6b7d` / `#e2eef3` | 동상 |

border는 각각 `--haru-palette-red / -yellow / -green / -blue` (Figma 파스텔 accent 재사용).

#### 3.1.3 Typography primitive

파일 제안: `packages/design-tokens/src/primitive/typography.css`

| Primitive | 값 | Figma 근거 |
|---|---|---|
| `--haru-type-large-title-size / -line` | 34 / 41 | `17:298` `iOS 26/Large Title` |
| `--haru-type-title-1-size / -line` | 28 / 34 | `iOS 26/Title 1` |
| `--haru-type-title-2-size / -line` | 22 / 28 | `iOS 26/Title 2` |
| `--haru-type-title-3-size / -line` | 20 / 25 | `iOS 26/Title 3` |
| `--haru-type-headline-size / -line` | 17 / 22 | `iOS 26/Headline` |
| `--haru-type-body-size / -line` | 17 / 22 | `iOS 26/Body` |
| `--haru-type-callout-size / -line` | 16 / 21 | `iOS 26/Callout` |
| `--haru-type-subheadline-size / -line` | 15 / 20 | `iOS 26/Subheadline` |
| `--haru-type-footnote-size / -line` | 13 / 18 | `iOS 26/Footnote` |
| `--haru-type-caption-1-size / -line` | 12 / 16 | `iOS 26/Caption 1` |
| `--haru-type-caption-2-size / -line` | 11 / 13 | `iOS 26/Caption 2` — **최소 텍스트** (#10-②) |
| `--haru-weight-regular / -medium / -semibold / -bold / -heavy` | 400 / 510 / 590 / 700 / 860 | `17:367` `font weight/*` + 화면 raw |

11px 미만 Figma raw(9·10·10.5)는 **폐기**하고 `caption-2` 로 흡수한다 (#10-②).

### 3.2 Tier 2 — Semantic

#### 3.2.1 Color semantic (64개)

파일 제안: `semantic/color.css`. 전체 목록·근거는 TOKEN_MAP §2.6·§2.7이 기준이며, 아래는 **Stage 1이 확정하는 최종 배정표**다.

| Semantic CSS Var | → Primitive | 용도 | 상태 |
|---|---|---|---|
| `--color-fg-primary` | `--haru-ink-700` | 제목·본문 | CONFIRMED (Figma) |
| `--color-fg-strong` | `--haru-ink-800` | 입력 값·질문 | CONFIRMED (Figma) |
| `--color-fg-secondary` | `--haru-ink-500` | 보조 텍스트·캡션·비선택 탭 라벨 | **`가값 (P-01)`** |
| `--color-fg-tertiary` | `--haru-ink-500` | 24px+ 또는 18.66px+bold 장식 텍스트 전용 | **`가값 (P-01)`** (동일 값) |
| `--color-fg-disabled` | `--haru-ink-500` + `--opacity-disabled` | disabled 라벨 | WCAG 예외(1.4.3 disabled 면제) |
| `--color-fg-on-accent` | `--haru-white` | Accent 위 라벨 | **D-01** |
| `--color-fg-link` | `--haru-ink-700` + `text-decoration: underline` | TextLink | **CONFIRMED (Figma)** — `179:1721` "Log in" = `#4a5f5c` 14/590 **underline** (2026-09-18 확인, §12.1 ①) |
| `--color-bg-app-start / -mid / -end` | mist-100 / mist-200 / dusk-200 | 화면 배경 3 stop | CONFIRMED (Figma) |
| `--gradient-app` | `linear-gradient(180deg, start 0%, mid 46%, end 100%)` | 배경 | 색 CONFIRMED (Figma) · stop **`가값 (P-14)`** |
| `--color-surface-glass` | `--haru-white-a74` | 버튼·칩·Tab Bar·IconButton | CONFIRMED (Figma) |
| `--color-surface-strong` | `--haru-white-a90` | 카드·버블·시트 | CONFIRMED (Figma) |
| `--color-surface-solid` | `--haru-white` | FieldGroup(Input) | CONFIRMED (Figma, `76:417` bg = 불투명 white) |
| `--color-surface-subtle` | `--haru-mist-50` | 설문 옵션·보조 배경 | CONFIRMED (Figma) |
| `--color-surface-tinted` | `--haru-mist-100` | PromptPill tinted | CONFIRMED (Figma) |
| `--color-surface-note` | `--haru-paper-100` | CoachingNote · **offline tone 배경** | CONFIRMED (Figma) |
| `--color-border-subtle` | `--haru-ink-600-a18` | 칩·입력 outline | **`가값 (P-02)`** |
| `--color-divider` | `--haru-ink-600-a12` | 구분선 | CONFIRMED (Figma) |
| `--color-action-primary-bg` | `--haru-palette-teal` | Accent Button·선택 칩 | CONFIRMED (#18-①) · **D-01** |
| `--color-action-primary-bg-hover` / `-pressed` | 동일 색 (shadow만 변화) | | CONFIRMED (Figma `17:14`/`17:16`) |
| `--color-action-primary-bg-disabled` | teal + `--opacity-disabled` | | CONFIRMED (Figma `17:18`) |
| `--color-action-secondary-bg` | `--color-surface-glass` | Glass Button | 라벨 대비 **`가값 (P-11)`** |
| `--color-action-secondary-fg` | `--haru-ink-600` | Glass Button 라벨 | **`가값 (P-11)`** |
| `--color-selected-bg` / `-fg` | action-primary / `--haru-white` | Chip·Radio 선택 | **D-01** 범위 |
| `--color-indicator-active` / `-inactive` | `--haru-ink-600` / `--haru-ink-600-a30` | PageIndicator | CONFIRMED (Figma `88:785/786`) |
| `--color-progress-fill` / `-track` | teal / `--haru-ink-600-a12` | ProgressBar | **`가값 (P-02)`** |
| `--color-rating-filled` / `-empty` | yellow / `--haru-ink-600-a18` | StarRating (Stage 5) | **`가값 (P-02)`** |
| `--color-scrim` | `#29293a3b` | Sheet·Dialog 뒤 | **`가값 (P-05)`** |
| `--color-focus-ring` | `--haru-ink-700` | focus-visible | **`가값 (P-03)`** |
| `--color-status-{info,success,warning,error}-{bg,fg,border,icon}` (16) | §3.1.2 status primitive | InlineAlert·Toast·필드 에러 | **`가값 (P-04)`** |
| `--color-field-border-error` / `--color-field-fg-error` | status-error border / fg | TextField·Checkbox 에러 | **`가값 (P-04)` 종속** |
| `--color-capability-{agency,emotion,flexibility,motivation}-bg` | green / pink / cyan / purple | 배지 배경 | CONFIRMED (#19) |
| `--color-capability-{…}-chart` | `-bg` 와 동일 색 | 차트 | CONFIRMED (#19) |
| `--color-capability-{…}-fg` | `--haru-white` | 배지 글자 | **`가값 (P-02)`** |

#### 3.2.2 Typography semantic

| Semantic | 값 | 상태 |
|---|---|---|
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | CONFIRMED (#11). **단일 정의 지점** (AC-1-13). `system-ui` 를 `"Inter"` 앞에 두지 않는다 |
| `--text-{large-title,title-1,title-2,title-3,headline,body,callout,subheadline,footnote,caption-1,caption-2}` | §3.1.1 크기 | CONFIRMED (Figma `17:298`) |
| `--text-{style}--line-height` | §3.1.1 line | 동상 |
| `--text-{style}--font-weight` | 스타일 기본 weight | 동상 |
| `--text-{style}--letter-spacing` | `0` | 동상 (Figma 전 스타일 letterSpacing 0) |
| `--font-weight-{regular,medium,semibold,bold,heavy}` | 400/510/590/700/860 | CONFIRMED (Figma) |

#### 3.2.3 Spacing / Size / Radius

| Semantic | 값 | 상태 |
|---|---|---|
| `--spacing` (Tailwind base) | `4px` | CONFIRMED — Figma `item spacing/*` 가 2·4·8·12 배수 중심 |
| `--space-0-5 … --space-8` | 2·4·6·8·10·12·14·16·20·24·32 | CONFIRMED (Figma) — 7·13·18·26 은 §3.5 흡수표로 제거 |
| `--layout-gutter` | `--space-6` (24) | **`가값 (P-13)`** (§12.2) |
| `--layout-min-width` / `--layout-app-max-width` | 320 / 480 | CONFIRMED (#12) |
| `--layout-tabbar-height` | 70 | CONFIRMED (Figma `25:87` h=70) |
| `--layout-tabbar-center-overhang` | 35 | CONFIRMED (Figma `140:2983` top=-35) |
| `--layout-safe-top/bottom/left/right` | `env(safe-area-inset-*, 0px)` | **`가값 (P-08)`** |
| `--bp-md` / `--bp-lg` | 600 / 1024 | CONFIRMED (#12) |
| `--size-touch-min` | 44 | RECOMMENDED (rules/frontend §9) |
| `--size-icon-sm / -md / -lg` | 16 / 20 / 24 | **`가값 (P-09)`** |
| `--radius-indicator` | 4 | CONFIRMED (Figma `88:785` radius 4) |
| `--radius-control` | 8 | CONFIRMED (Figma — Checkbox 7·차트 막대 8 흡수) |
| `--radius-field` | 16 | CONFIRMED (Figma `corner radius/16`) |
| `--radius-surface` | 22 | **`가값 (P-12)`** (§12.2) — 20·22·24 흡수 |
| `--radius-card` | 28 | CONFIRMED (Figma `17:33` `--radius-card`) — 26·30·32 흡수 (26은 §13.2 ④ 신규 발견) |
| `--radius-pill` | 9999 | CONFIRMED (Figma `radius-pill` 100) |
| `--opacity-disabled` | 0.5 | CONFIRMED (Figma `17:10`/`17:18`) |

#### 3.2.4 Shadow / Material

| Semantic | 값 (Figma Effect Style) | 상태 |
|---|---|---|
| `--shadow-glass-rest` | `0 2px 4px rgb(94 115 112/.08), 0 12px 28px /.16, 0 28px 56px /.12, inset 0 1.5px 0 rgb(255 255 255/.9), inset 0 -1px 0 rgb(94 115 112/.05)` | CONFIRMED (Figma `HARU/Glass Rest`) |
| `--shadow-glass-raised` | `4px 4px 8px /.10, 18px 18px 40px /.20, 0 4px 72px /.14` + 동일 inset | CONFIRMED (Figma `HARU/Glass Raised`) |
| `--shadow-glass-pressed` | `0 1px 3px /.08, inset 0 3px 8px /.20, inset 0 1px 3px /.16` | CONFIRMED (Figma `HARU/Glass Pressed`) |
| `--shadow-rest` | `0 6px 4px /.08, 0 12px 28px /.16, 0 28px 56px /.12` + 동일 inset | CONFIRMED (Figma `HARU/Shadow Rest`) |
| `--shadow-icon-chip` | `0 4px 10px /.10, inset 0 1.5px 0 rgb(255 255 255/.5)` | CONFIRMED (Figma `HARU/Icon Chip`) |
| `--shadow-highlight` | `inset 0 1.5px 0 rgb(255 255 255/.9), inset 0 -1px 0 rgb(94 115 112/.05)` | CONFIRMED (Figma) — 위 4종에 포함되어 있으나 단독 사용처(비-glass 표면)용으로 별도 유지 |
| `--material-glass-fill` / `-strong` | `--haru-white-a74` / `--haru-white-a90` | CONFIRMED (Figma) |
| `--material-blur-md` / `-lg` | 12px / 24px | CONFIRMED (Figma — instance 12, effect style 24) |
| `--material-glass-fill-fallback` | `--haru-white-a90` (불투명 합성 `#f9f9fb` 아님 — 알파 유지) | **신규 토큰 제안** (RECOMMENDED) |

> **중요 (§13.2 ①)**: Figma의 Button `17:20`·Tab Bar `25:87`·Input `76:417` instance는 명명된 Effect Style을 **바인딩하지 않고** raw 그림자 `0 12px 14px /.16, 0 2px 2px /.08` 을 쓴다. 화면 카드(`179:1756/1759/1764`)는 또 다른 raw `0 12px 28px /.16, 0 2px 4px /.08` 을 쓴다. Stage 1은 **명명된 Effect Style 값**(`--shadow-glass-rest`)으로 통일하고, 그 차이를 §10.3 허용 차이로 등록한다.

#### 3.2.5 Motion / Z-index

| Semantic | 값 | 상태 |
|---|---|---|
| `--motion-duration-instant / -fast / -base / -slow / -pulse` | 100 / 180 / 240 / 400 / 1200 ms | **`가값 (P-07)`** |
| `--motion-ease-standard` | `cubic-bezier(.32,.72,.28,1)` | **`가값 (P-07)`** |
| `--motion-ease-spring` | `cubic-bezier(.34,1.3,.64,1)` | **`가값 (P-07)`** |
| `--motion-ease-linear` | `linear` | **`가값 (P-07)`** |
| `--z-base / -sticky / -tabbar / -sheet / -dialog / -toast` | 0 / 10 / 20 / 40 / 50 / 60 | **`가값 (P-06)`** |
| `--focus-ring-width` / `--focus-ring-offset` | 2px / 2px | **`가값 (P-03)`** |

### 3.3 Tier 3 — Component 토큰 (`packages/ui` 내부 전용)

네이밍 `--{component}-{part}-{state}`. **`packages/ui` 밖에서 참조 금지.** 값은 Semantic 토큰 또는 Figma 컴포넌트 치수만 참조한다.

| 컴포넌트 | Tier 3 토큰 | 값 / 참조 | Figma 근거 |
|---|---|---|---|
| Button | `--button-height-md` / `-lg` | 45 / 56 | `17:4` h45 · **`가값 (P-15)`** |
| | `--button-padding-x` | `--space-6` (24, Figma 26 흡수) | `17:4` px26 |
| | `--button-padding-y-md` | `--space-3-5` (14) | `17:4` py14 |
| | `--button-gap` | `--space-2` (8) | icon+label 간격 (RECOMMENDED) |
| | `--button-radius` | `--radius-pill` | `17:4` |
| | `--button-label-size` | `--text-headline` (17/590) | `17:5` |
| IconButton | `--icon-button-size` | 38 | `78:157` 38×38 |
| | `--icon-button-icon-size` | `--size-icon-md` (20, Figma 18·19 흡수) | `77:150` 18 · `26:45` 19 |
| | `--icon-button-hit-size` | `--size-touch-min` (44) | 접근성 확장 |
| TopBar | `--topbar-height` | 40 | `78:286` h40 |
| | `--topbar-gap` | 18 → `--space-5` (20) 흡수 | `78:286` gap18 |
| | `--topbar-pill-height` | 40 | `78:273` |
| | `--topbar-pill-padding-x` | `--space-4` (16, Figma 15 흡수) | `78:273` px15 |
| BottomTabBar | `--tabbar-height` | `--layout-tabbar-height` (70) | `25:33` |
| | `--tabbar-icon-size` | 21 → `--size-icon-lg` (24)? **아니오** — 21 고정 | `25:35` 21×21 (§13.2 ②) |
| | `--tabbar-label-size` | `--text-caption-2` (11) | `25:38` |
| | `--tabbar-center-size` | 64 | `140:2971` |
| | `--tabbar-item-gap` | `--space-1` (4) | `25:34` gap4 |
| Tag | `--tag-height-sm` / `-xs` | 26 / 19 | `76:439` · `140:3149` |
| | `--tag-padding-x` | `--space-3` (12, Figma 13 흡수) | `76:439` px13 |
| Chip | `--chip-height` | 31 (content-box) | `90:625` |
| | `--chip-padding-x` / `-y` | `--space-3` (12) / `--space-2` (8) | `90:625` |
| | `--chip-label-size` | `--text-caption-1` (12, Figma 12.5 흡수) | `90:611` |
| TextField | `--field-row-height` | 42 | `76:364` |
| | `--field-padding-x` | `--space-5` (20, Figma 18 흡수) | `76:416` px18 |
| | `--field-padding-y` | `--space-1-5` (6) | `76:416` py6 |
| | `--field-radius` | `--radius-surface` (22) | `76:416` |
| | `--field-label-size` | `--text-caption-2` (11, Figma 11.5 흡수) | `76:360` |
| | `--field-value-size` | `--text-callout` (16) | `76:361` |
| SpeechBubble | `--bubble-radius` | `--radius-surface` (22) | `88:758` |
| | `--bubble-padding-x` / `-y` | `--space-4` (16) / `--space-3-5` (14) | `88:758` |
| | `--bubble-tail-size` | 16 | `88:762` 16×16 radius 3 rotate -45 |
| PageIndicator | `--indicator-dot-size` | 7 | `88:786` |
| | `--indicator-active-width` | 20 | `88:785` |
| | `--indicator-gap` | `--space-1-5` (6) | `88:789` gap6 |
| ProgressBar | `--progress-height-sm` / `-md` | 6 / 8 | `179:1779` h6 · `163:2613` h8 |
| Checkbox | `--checkbox-size` | 22 | `179:1742` |
| RadioGroup | `--radio-dot-size` | 15 | `179:1790` |
| | `--radio-row-height` | 43 → `--size-touch-min` (44) 로 확장 | `179:1789` (§9.3) |
| Sheet | `--sheet-radius-top` | `--radius-card` (28) | Figma 부분 근거 (`88:960`) |
| Dialog | `--dialog-radius` | `--radius-card` (28) | **Figma 없음 → 명세** |
| Toast | `--toast-radius` | `--radius-surface` (22) | **Figma 없음 → 명세** |
| Skeleton | `--skeleton-radius` | `--radius-control` (8) | **Figma 없음 → 명세** |

### 3.4 Tailwind v4 노출 구분 — `@theme` vs `@utility`

`@theme` 에는 **Semantic만** 노출하고 Tailwind 기본 팔레트 네임스페이스를 초기화한다 (`--color-*: initial` 등, AC-1-11). Tier 1·Tier 3은 `@theme` 에 넣지 않는다.

| 방식 | 대상 | 생성 유틸 예 |
|---|---|---|
| `@theme` `--color-*` | §3.2.1 전체 64개 | `text-fg-primary`, `bg-surface-glass`, `border-subtle`, `bg-capability-emotion-bg` |
| `@theme` `--font-*` | `--font-sans` | `font-sans` |
| `@theme` `--text-*` (+ `--line-height`/`--font-weight`/`--letter-spacing` 보조) | 11 style | `text-body`, `text-caption-2` |
| `@theme` `--font-weight-*` | 5종 | `font-semibold` |
| `@theme` `--radius-*` | 6단계 | `rounded-card`, `rounded-pill` |
| `@theme` `--shadow-*` | glass-rest/raised/pressed, rest, icon-chip | `shadow-glass-rest` |
| `@theme` `--inset-shadow-*` | `--inset-shadow-highlight` | `inset-shadow-highlight` |
| `@theme` `--blur-*` | `--blur-material-md` (12) · `-lg` (24) | `backdrop-blur-material-md` |
| `@theme` `--ease-*` | standard / spring / linear | `ease-standard` |
| `@theme` `--breakpoint-*` | md 600 / lg 1024 | `md:`, `lg:` |
| `@theme` `--spacing` | 4px 기준 | `p-4`, `gap-2` |
| `@theme` `--animate-*` | `--animate-skeleton`, `--animate-spinner` | `animate-skeleton` |
| **`@utility`** | z-index | `z-base` `z-sticky` `z-tabbar` `z-sheet` `z-dialog` `z-toast` |
| **`@utility`** | motion duration | `duration-instant` `duration-fast` `duration-base` `duration-slow` |
| **`@utility`** | material 합성(fill+blur+shadow+highlight) | `material-glass-rest` `material-glass-raised` `material-glass-pressed` `material-glass-strong` |
| **`@utility`** | layout | `app-column` `px-gutter` `max-w-app` `min-w-app` `h-tabbar` |
| **`@utility`** | safe-area | `pt-safe` `pb-safe` `pl-safe` `pr-safe` `mb-safe` |
| **`@utility`** | 배경 gradient | `bg-app` |
| **`@utility`** | 터치 타깃 | `min-touch` (min-w/h 44 + hit-slop pseudo) |
| **`@utility`** | focus | `focus-ring` (`:focus-visible` outline 규격 §9.2) |
| **`@utility`** | disabled | `opacity-disabled` |
| **`@utility`** | 아이콘 크기 | `size-icon-sm` `size-icon-md` `size-icon-lg` |

근거: Plan §5.5 — z-index·motion·material·layout·safe-area는 v4 네임스페이스가 없으므로 `@utility` 로 노출해 화면 코드의 `style={{ … var(--z-dialog) }}` inline 사용과 arbitrary value를 막는다.

### 3.5 화면 raw 값 → 스케일 흡수표 (Stage 1 확정분)

| Figma raw | 관측 node (2026-09-18) | 흡수 토큰 | 결과 차이 |
|---|---|---|---|
| padding-x 26 (Button) | `17:4`, `17:345` | `--space-6` (24) | 버튼 최소폭 -4px |
| padding-x 18 (Input) | `76:416` | `--space-5` (20) | 내부 폭 +4px |
| padding-x 15 (TopBar pill) | `78:273` | `--space-4` (16) | 폭 +2px |
| padding-x 13 (Tag) | `76:439` | `--space-3` (12) | 폭 -2px |
| gap 18 (TopBar) | `78:286` | `--space-5` (20) | +2px |
| gap 7 (칩 목록) | `91:709` | `--space-2` (8) | +1px |
| radius 20 (Input Line_1, InfoRow) | `76:415`, `179:1759` | `--radius-surface` (22) | +2 |
| radius 26 (Survey intro 카드) | `179:1756` | `--radius-card` (28) | +2 — **TOKEN_MAP §5.2 미기재 (신규 발견)** |
| fill `rgba(255,255,255,.72)` | `179:1759`, `179:1764` | `--haru-white-a74` | +2% |
| font 11.5 (입력 라벨) | `76:360` | `--text-caption-2` (11) | -0.5 |
| font 12.5 (칩 라벨) | `90:611` | `--text-caption-1` (12) | -0.5 |
| font 14.5 (설문 옵션·InfoRow) | `179:1758`, `179:1763` | `--text-subheadline` (15) | +0.5 |
| font 21 / lh 27 (intro 카드 제목) | `179:1757` | `--text-title-2` (22/28) | +1 |
| font 27 / lh 33 **weight Black(1000)** | `179:1813` | `--text-title-1` (28) + `--font-weight-heavy` (860) | +1, weight -140 — **TOKEN_MAP §3.3 미기재 (신규 발견)** |
| 그림자 `0 12 14 /.16, 0 2 2 /.08` | `17:4`, `25:33`, `76:416` | `--shadow-glass-rest` | blur/offset 차 (§10.3) |
| 그림자 `0 12 28 /.16, 0 2 4 /.08` | `179:1756`, `179:1759` | `--shadow-glass-rest` | 근소 |

### 3.6 `provisional` 주석 위치표 — development-agent용 (AC-1-12)

`packages/design-tokens` 의 **아래 정확한 토큰 정의 바로 위**에 `/* provisional: P-xx (docs/decisions/stage-0-approvals.md §4) */` 를 남긴다. P-10은 토큰이 아니라 화면 명세이므로 주석 대상이 아니다.

| P | 파일 | 토큰 이름 (전부) |
|---|---|---|
| **P-01** | `semantic/color.css` | `--color-fg-secondary`, `--color-fg-tertiary` |
| **P-02** | `semantic/color.css` | `--color-border-subtle`, `--color-progress-fill`, `--color-progress-track`, `--color-rating-filled`, `--color-rating-empty`, `--color-capability-agency-fg`, `--color-capability-emotion-fg`, `--color-capability-flexibility-fg`, `--color-capability-motivation-fg` |
| **P-03** | `semantic/color.css` + `semantic/space.css` | `--color-focus-ring`, `--focus-ring-width`, `--focus-ring-offset` |
| **P-04** | `primitive/color.css` + `semantic/color.css` | `--haru-status-{error,warning,success,info}-{fg,bg}` (8), `--color-status-{info,success,warning,error}-{bg,fg,border,icon}` (16), `--color-field-border-error`, `--color-field-fg-error` |
| **P-05** | `semantic/color.css` | `--color-scrim` |
| **P-06** | `semantic/z-index.css` | `--z-base`, `--z-sticky`, `--z-tabbar`, `--z-sheet`, `--z-dialog`, `--z-toast` |
| **P-07** | `semantic/motion.css` | `--motion-duration-{instant,fast,base,slow,pulse}` (5), `--motion-ease-{standard,spring,linear}` (3) |
| **P-08** | `semantic/layout.css` | `--layout-safe-top`, `--layout-safe-bottom`, `--layout-safe-left`, `--layout-safe-right` |
| **P-09** | `semantic/space.css` | `--size-icon-sm`, `--size-icon-md`, `--size-icon-lg` |
| P-10 | — | **주석 없음** (이 문서 §5 + dev gallery `/__dev/ui/states` 화면으로 승인) |
| **P-11** | `semantic/color.css` | `--color-action-secondary-bg`, `--color-action-secondary-fg` |
| **P-12** | `semantic/radius.css` | `--radius-surface` |
| **P-13** | `semantic/space.css` | `--layout-gutter` |
| **P-14** | `semantic/color.css` | `--gradient-app` (중간 stop 위치에만 해당) |
| **P-15** | `semantic/space.css` 또는 `ui` Tier3 | `--size-button-lg` (= `--button-height-lg`) |
| **P-16** | `semantic/space.css` | `--size-medallion-sm`, `--size-medallion-md`, `--size-medallion-lg` — **Stage 1에서는 토큰만 정의하고 컴포넌트는 Stage 2** |

추가로 **D-01 수용 예외 주석** (AC-1-17): `--color-action-primary-bg` 와 `--color-fg-on-accent` 정의 위에 `/* accepted deviation: D-01 (white label on teal = 2.07:1, approvals §3) */`.

---

## 4. Shared UI 22종 — variant / state 명세

공통 규칙 (전 컴포넌트 적용):

1. **focus**: 모든 인터랙티브 요소는 `:focus-visible` 에서 `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset)` (`@utility focus-ring`). `:focus`(마우스 클릭)에는 링을 그리지 않는다. — **Figma 없음 → 명세** (#22, `가값 (P-03)`)
2. **hover**: `@media (hover: hover) and (pointer: fine)` 안에서만. 터치 잔상 금지.
3. **pressed**: shadow 전환(+ `scale(.97)`), **색 변화 없음** (Figma `17:8`/`17:16` 확인).
4. **disabled**: `--opacity-disabled` + `pointer-events: none` + `aria-disabled="true"`. 네이티브 `disabled` 를 쓸 때는 포커스 불가가 되므로 설명이 필요한 경우 `aria-disabled` + 활성 버튼 + 헬퍼 텍스트를 쓴다.
5. **loading**: 컴포넌트 내부 `Spinner` + **라벨 유지(폭 고정)** + 중복 제출 차단 + `aria-busy="true"`. — **Figma 없음 → 명세**
6. **error**: 경계색 + 아이콘 + 텍스트 3중 표시, `aria-describedby` 로 메시지 연결, 색 단독 금지. — **Figma 없음 → 명세**
7. **selected**: 색 + 형태(체크/굵기) 병행, `aria-pressed` / `aria-checked` / `aria-current`.
8. **터치 타깃**: 시각 크기와 무관하게 hit area ≥ `--size-touch-min` (44). 시각 크기를 키우지 않고 `::before` 확장 또는 padding으로 확보.
9. **텍스트**: 모든 문자열은 prop으로 받는다. `packages/ui` 는 copy를 소유하지 않는다(문구는 `apps/web/src/shared/copy`). 단 아래 "기본 접근성 이름"이 필요한 곳은 prop 필수로 강제한다.
10. `packages/ui` 는 `@haru/contracts` 를 import 하지 않는다 (도메인 enum 금지 — capability 관련 prop은 문자열 union이 아니라 `tone` 으로 받는다).

### 4.1 Text — Figma `17:298`

| 항목 | 내용 |
|---|---|
| variant | `large-title` `title-1` `title-2` `title-3` `headline` `body` `callout` `subheadline` `footnote` `caption-1` `caption-2` (11) |
| tone | `primary` `strong` `secondary` `tertiary` `on-accent` `link` `disabled` `inherit` |
| weight | `regular` `medium` `semibold` `bold` `heavy` (스타일 기본값 override) |
| 기타 props | `as`(`p`·`span`·`h1`–`h6`·`label`), `align`, `truncate`(`none`·`1`·`2`·`3` 줄), `numeric`(tabular-nums) |
| state | 없음 (표시 전용) |
| 토큰 | `--text-*`, `--font-weight-*`, `--color-fg-*`, `--font-sans` |
| 접근성 | `as` 로 의미 태그 지정. 시각적 크기와 heading 레벨을 분리(큰 글씨 ≠ h1). `truncate` 사용 시 전체 텍스트를 `title` 속성으로 두지 않고 별도 표시 수단 제공 |
| 금지 | 고정 높이 컨테이너, `caption-2` 미만 크기 |

### 4.2 Icon — Lucide + HARU 전용 SVG (§8)

| 항목 | 내용 |
|---|---|
| props | `name`(Lucide 이름 또는 `haru:*` 접두 이름), `size`(`sm`·`md`·`lg`), `label`(의미 있는 아이콘 필수), `decorative`(true면 `aria-hidden` + `focusable="false"`), `tone` |
| variant | 소스 2종: Lucide(stroke 1.5·`currentColor`), HARU SVG(`currentColor` 정규화 — §8.2) |
| state | 없음 |
| 치수 | `--size-icon-sm` 16 / `-md` 20 / `-lg` 24 — `가값 (P-09)` |
| 토큰 | `--size-icon-*`, `--color-fg-*` (색은 부모 `currentColor` 상속) |
| 접근성 | `label` 없고 `decorative` 아니면 **런타임 경고 + 타입 에러**(둘 중 하나 필수 유니온). 아이콘 단독 버튼은 Icon이 아니라 IconButton |
| Figma | `50:157` (HARU 전용 15종), 일반 아이콘은 Figma 대체 없이 Lucide |

### 4.3 Surface + AppBackground — Figma `17:332`, `16:24`, `17:33`

**Surface**

| 항목 | 내용 |
|---|---|
| variant `material` | `rest` · `raised` · `pressed` · `none` |
| variant `fill` | `glass`(74%) · `strong`(90%) · `solid`(white) · `subtle` · `tinted` · `note` · `none` |
| 기타 props | `radius`(`indicator`·`control`·`field`·`surface`·`card`·`pill`), `padding`(space scale), `as`, `interactive`(hover/pressed 전환 활성) |
| state | `interactive` 일 때 rest → hover(raised) → pressed. 그 외 상태 없음 |
| 치수 | 없음 (콘텐츠 기반) |
| 토큰 | `--material-glass-fill(-strong)`, `--blur-material-md/-lg`, `--shadow-glass-rest/-raised/-pressed`, `--inset-shadow-highlight`, `--radius-*` |
| 규칙 | ① Glass는 gradient 배경 위 **1단계만**, Glass 위 Glass 중첩 금지 ② 텍스트가 많은 카드는 `fill=strong` ③ `@supports not (backdrop-filter: blur(1px))` 및 `prefers-reduced-transparency: reduce` 에서 `--material-glass-fill-fallback` 불투명 대체 ④ 스크롤 리스트 반복 요소는 blur 없이 fill만 ⑤ `saturate` 사용 금지 (#10-①) |
| 접근성 | `as="div"` 기본, 클릭 가능하면 반드시 `button`/`a` 로 렌더(=`as` 지정) |

**AppBackground**

| 항목 | 내용 |
|---|---|
| variant | `gradient`(기본) · `flat`(reduced-transparency·인쇄용, `--color-bg-app-start` 단색) |
| 치수 | 뷰포트 전체 (`position: fixed; inset: 0`), 콘텐츠는 그 위 레이어 |
| 토큰 | `--gradient-app` (stop 46% = `가값 (P-14)`) |
| 접근성 | `aria-hidden`, 배경 위에 본문 텍스트를 직접 두지 않는다(대비 4.14:1 — §9.4) |

### 4.4 Button + ButtonGroup — Figma `17:20` (8 variant) · `86:245` · `86:372`

| 항목 | 내용 |
|---|---|
| variant | `accent` · `glass` (`86:245` Button/White = glass + leadingIcon, `40:316` Button/Filter는 **Chip으로 이동**) |
| size | `md`(45) · `lg`(56) |
| state | `rest` `hover` `pressed` `disabled` **`focus`** **`loading`** (8+2) |
| 치수 | height `--button-height-md`(45) / `-lg`(56 — `가값 (P-15)`), padding-x `--space-6`(24), radius `--radius-pill`, 라벨 `--text-headline`(17/590), 아이콘 `--size-icon-md`, gap `--space-2` |
| fill | accent = `--color-action-primary-bg`, glass = `--color-action-secondary-bg` |
| 라벨 색 | accent = `--color-fg-on-accent` (**D-01**), glass = `--color-action-secondary-fg` (**`가값 (P-11)`**) |
| shadow | rest/disabled `--shadow-glass-rest` · hover `--shadow-glass-raised` · pressed `--shadow-glass-pressed` |
| blur | rest/pressed/disabled `--blur-material-md`(12), hover 6 → **12로 통일** (§10.3 허용 차이) |
| motion | hover `translateY(-1px)`, pressed `translateY(1px) scale(.97)`; `--motion-duration-fast` + `--motion-ease-standard` |
| loading | 라벨 자리 유지 + 중앙 Spinner(`size=sm`) + `aria-busy` + 클릭 무시. 라벨을 숨기지 않고 투명도 0으로 두어 폭 고정 |
| props | `variant`, `size`, `leadingIcon`, `trailingIcon`, `fullWidth`, `loading`, `disabled`, `type`, `onPress`, `children` |
| 접근성 | `<button type="button">` 기본. 아이콘만 있는 사용 금지(IconButton 사용). `loading` 중에도 포커스 유지. 높이 45·56 ≥ 44 ✓ |
| Figma 없음 | focus(P-03) · loading (#22, `가값 (P-10)`) |

**ButtonGroup** — props `primary`, `secondary`, `layout`(`inline`·`stacked`), gap `--space-3`. `inline` 은 각 버튼 `flex:1`, 가로 폭 부족(<360px)이면 자동 `stacked`. 자체 스타일 금지 (Figma `86:372`).

### 4.5 IconButton — Figma `78:158` (Back / Setting / swape), 화면 `26:44`

| 항목 | 내용 |
|---|---|
| variant | `glass`(기본) · `plain`(배경·그림자 없음, TopBar 밀집 배치용 — **신규, 명세**) |
| state | `rest` `hover` `pressed` `disabled` **`focus`** **`loading`** |
| 치수 | 시각 38×38 (`--icon-button-size`), radius `--radius-pill`, 아이콘 `--size-icon-md`(20), **hit area 44×44** |
| fill / shadow | `--color-surface-glass` / `--shadow-rest` (Figma `78:157` = `0 6 4 /.08` → `--shadow-rest` 로 흡수) |
| props | `icon`, `label`(**필수**), `variant`, `size`, `disabled`, `loading`, `onPress` |
| 접근성 | `aria-label={label}` 필수(타입상 optional 아님). hit area 확장은 `::before { inset: -3px }`. 인접 IconButton 간 간격 ≥ `--space-2` |
| 배치 규칙 | TopBar leading = 좌측 `--layout-gutter`, trailing = 우측 `--layout-gutter`. Home 설정 아이콘 `26:44` 는 **Stage 2** 에서 TopBar `trailing` 슬롯에 배치 (§6.1) |

### 4.6 TopBar — Figma `139:2734` · 화면 헤더 `179:1726/1729`, `179:1772–1778`, `29:75`, `30:89`, `31:117`

→ §6.1 참조 (variant 4종 상세).

### 4.7 AppColumn (layout primitive)

→ §2.4 참조.

### 4.8 BottomTabBar — Figma `25:87` · `140:2971`

→ §6.2 참조.

### 4.9 Spinner / Skeleton — **Figma 없음 → 명세** (#22, `가값 (P-10)`)

**Spinner**

| 항목 | 내용 |
|---|---|
| variant | `size`: `sm`(16) · `md`(24) · `lg`(32); `tone`: `default`(`--color-fg-secondary`) · `on-accent` · `inherit` |
| 형태 | 원형 stroke 2px, 270° arc, `--animate-spinner` = 회전 `--motion-duration-slow`×2(800ms) `--motion-ease-linear` 무한 |
| reduced-motion | 회전 정지 + 3점 점멸(`--animate-skeleton` 재사용)도 아닌 **정적 원 + 라벨 텍스트**만 표시 |
| props | `size`, `tone`, `label`(기본 "Loading") |
| 접근성 | `role="status"` + `aria-live="polite"` + 시각적 숨김 텍스트. 버튼 내부(loading)에서는 버튼이 `aria-busy` 를 갖고 Spinner는 `aria-hidden` |

**Skeleton**

| 항목 | 내용 |
|---|---|
| variant | `shape`: `text` · `rect` · `circle` · `card`; `lines`(text일 때 1–5) |
| 형태 | fill `--color-surface-glass`, radius: text = `--radius-indicator`, rect/card = `--radius-control`/`--radius-card`, circle = `--radius-pill` |
| 모션 | `--animate-skeleton`: opacity `.5 ↔ 1`, `--motion-duration-pulse`(1200ms), `--motion-ease-standard`, 무한. **shimmer gradient 사용 금지** (Figma 없음·토큰 없음) |
| 치수 | `text` 줄 높이 = 현재 `--text-*--line-height`, 줄 간격 `--space-2`, 마지막 줄 폭 60% |
| reduced-motion | 애니메이션 제거, 정적 fill 유지 |
| 접근성 | 컨테이너에 `aria-busy="true"`, 내부 Skeleton은 `aria-hidden`. 스크린리더에는 "Loading" 1회만 전달 |
| 사용 기준 | §5.1 |

### 4.10 ErrorState / EmptyState — **Figma 없음 → 명세** (#22)

**ErrorState** — props `title`, `description`, `onRetry`, `retrying`, `tone`(`error`·`offline`), `illustration`(Stage 1은 아이콘만)

| 요소 | 규격 |
|---|---|
| 아이콘 | Lucide `triangle-alert`(error) / `wifi-off`(offline), `--size-icon-lg`(24)를 2× 확대한 48 원형 배지, 배경 `--color-status-error-bg`(또는 `--color-surface-note`), 아이콘색 `--color-status-error-fg` |
| 제목 | `--text-headline`, `--color-fg-primary` |
| 설명 | `--text-subheadline`, `--color-fg-secondary`, 최대 2–3줄 |
| 버튼 | `Button variant=glass size=md` "Try again" — `retrying` 이면 `loading` |
| 레이아웃 | `Surface fill=strong radius=card padding=--space-6`, 세로 gap `--space-3`, 가운데 정렬 |
| 접근성 | `role="alert"`(화면 전체 실패) / `role="status"`(부분 실패). 재시도 후 결과를 `aria-live` 로 알림 |

**EmptyState** — props `illustration`, `title`, `description`, `action`, `tone`

| 요소 | 규격 |
|---|---|
| 아이콘 | Lucide(상황별), 48 원형 배지, 배경 `--color-surface-subtle`, 아이콘색 `--color-fg-secondary` |
| 제목/설명/액션 | ErrorState와 동일 규격, 버튼은 선택(`action` 없으면 렌더 안 함) |
| 일러스트 | **Stage 1에서는 캐릭터 일러스트를 쓰지 않는다** (에셋 최적화 파이프라인이 Stage 2–4, Plan §16 D-4). `illustration` prop만 열어둔다 |
| 접근성 | `role` 없음(일반 콘텐츠), 제목은 `as="h2"` 등 문서 구조에 맞춘 heading |

### 4.11 InlineAlert / Banner — **Figma 없음 → 명세** (#22)

| 항목 | 내용 |
|---|---|
| variant `tone` | `info` · `success` · `warning` · `error` · `offline` (5) |
| variant `placement` | `inline`(콘텐츠 흐름 안) · `banner`(TopBar 아래 sticky, 앱 컬럼 폭) |
| state | `rest` · `dismissing` · (액션 있으면 버튼 상태 상속) |
| 색 | tone별 `--color-status-{tone}-bg` / `-fg` / `-border` / `-icon`. **`offline` 만 status 색 없이** `--color-surface-note` + `--color-fg-primary` + border `--color-border-subtle` (TOKEN_MAP §4) |
| 치수 | padding `--space-4`, radius `--radius-surface`, border 1px, 아이콘 `--size-icon-md`, gap `--space-3`, 제목 `--text-subheadline`(590), 설명 `--text-footnote` |
| 아이콘 | info `info` · success `circle-check` · warning `triangle-alert` · error `octagon-alert` · offline `wifi-off` (Lucide) |
| props | `tone`, `title`, `description`, `icon`(override), `action`, `onDismiss` |
| 접근성 | `error`/`warning` = `role="alert"`, 그 외 `role="status"`. 닫기 버튼은 IconButton `variant=plain` + `label="Dismiss"`. **색 단독 전달 금지** — 아이콘 + 문구 병행 |

### 4.12 Toast + ToastProvider — **Figma 없음 → 명세** (#22)

| 항목 | 내용 |
|---|---|
| variant `tone` | `neutral`(기본) · `success` · `error` |
| state | `entering` · `visible` · `exiting` |
| 치수/배치 | 앱 컬럼 폭 − 2×gutter, **하단** `calc(--layout-safe-bottom + --space-4)`; BottomTabBar가 있는 Layout에서는 `+ --layout-tabbar-height`. radius `--radius-surface`, padding `--space-4`, `Surface fill=strong material=rest` |
| z-index | `--z-toast` (60) |
| duration | 기본 4000ms(액션 없음) / 6000ms(액션 있음); `duration=0` 이면 수동 해제 |
| 모션 | enter `translateY(12px) → 0` + fade, `--motion-duration-base` `--motion-ease-standard`; exit fade only |
| 동시 표시 | **최대 1개**. 새 Toast는 기존 것을 교체(큐 아님) — 양육자 화면 단순화 (RECOMMENDED) |
| props | `tone`, `message`, `duration`, `action`{label,onPress}, `onDismiss` |
| 접근성 | 컨테이너 `role="status"` `aria-live="polite"` `aria-atomic="true"`; `error` tone은 `aria-live="assertive"`. 포커스를 빼앗지 않는다. 액션이 있으면 키보드 도달 가능해야 하므로 duration ≥ 6000ms + 수동 해제 버튼 제공 |

### 4.13 TextField + FieldGroup — Figma `76:417` (boxcount Line_1/2/3/badge)

> Figma의 `boxcount` variant는 "행 수"이므로 **컴포넌트 variant가 아니라 composition** 으로 푼다 (COMPONENT_MAP §1). `FieldGroup` 이 카드이고 `TextField` 가 그 안의 행이다.

**FieldGroup**

| 항목 | 내용 |
|---|---|
| 치수 | padding-x `--space-5`(20, Figma 18), padding-y `--space-1-5`(6), radius `--radius-surface`(22), fill `--color-surface-solid`, shadow `--shadow-glass-rest` + `--inset-shadow-highlight` |
| 행 구분선 | 1px `--color-divider`, 행 사이에만 (첫·끝 제외) |
| props | `children`, `label`(섹션 라벨은 외부 SectionLabel — Stage 2), `error`(그룹 단위 에러 메시지) |

**TextField**

| 항목 | 내용 |
|---|---|
| state | `rest` `focus` `filled` `error` `disabled` `readOnly` (+ trailingAction 상태) |
| 치수 | 행 높이 `--field-row-height`(42), 내부 padding `--space-1`(4), label↔value gap `--space-0-5`(2) |
| label | `--text-caption-2`(11, Figma 11.5), `--color-fg-secondary` |
| value / placeholder | `--text-callout`(16) `--color-fg-strong` / `--color-fg-secondary` |
| focus | 행 전체에 `focus-ring` (outline), 라벨 색 변화 없음 |
| error | 행 하단 1px → `--color-field-border-error`, 라벨·헬퍼 `--color-field-fg-error`, trailing에 `triangle-alert` 아이콘, 메시지 `--text-caption-1` |
| trailingAction | "Show" 등 텍스트 버튼 — `--text-footnote`(13) `--color-fg-link`(Figma raw `#6ba99f` 폐기, §13.2 ③), hit area 44 |
| trailingAccessory | Tag 등 표시 요소 (`76:458` age Tag) |
| props | `label`, `value`, `placeholder`, `type`, `trailingAction`, `trailingAccessory`, `helperText`, `errorText`, `disabled`, `readOnly`, `autoComplete`, `inputMode`, `required` |
| 접근성 | `<label>` 요소 연결(`htmlFor`), placeholder를 라벨 대신 쓰지 않는다. `errorText` → `aria-invalid` + `aria-describedby`. `required` 는 시각 표시 + `aria-required`. 자동완성 토큰(`email`, `new-password`, `given-name`, `family-name`) 지정 |
| Figma 없음 | focus · error · disabled · empty placeholder 상태 (#22) |

### 4.14 Checkbox + CheckboxGroup — Figma `179:1742` (checked만)

| 항목 | 내용 |
|---|---|
| state | `unchecked` **(Figma 없음)** · `checked` · `indeterminate` · `error` · `disabled` · `focus` |
| 치수 | box 22×22 (`--checkbox-size`), radius `--radius-control`(8, Figma 7), 체크 아이콘 13, **hit area = 라벨 포함 행 전체, 최소 44** |
| 색 | checked: fill `--color-action-primary-bg` + 아이콘 `--color-fg-on-accent`; unchecked: fill `--color-surface-solid` + border 1.5px `--color-border-subtle`(**`가값 (P-02)`**); error: border `--color-field-border-error`; disabled: `--opacity-disabled` |
| 라벨 | `--text-footnote`(13) `--color-fg-primary`, 설명 `--text-caption-1` `--color-fg-secondary`, gap `--space-3`(12, Figma 59−48=11) |
| props | `checked`, `indeterminate`, `onChange`, `label`, `description`, `required`, `error`, `disabled` |
| 접근성 | 네이티브 `<input type="checkbox">` + 시각 대체(`appearance: none` 금지 시 `::before`). **라벨 전체가 클릭 영역**. `error` → `aria-invalid` + `aria-describedby`. 색 외에 체크 형태로 상태 전달 ✓ |
| CheckboxGroup | `<fieldset>` + `<legend>`, props `legend`, `children`, `error`, `required`. 동의 그룹 5항목 조합은 **Stage 2 Feature** |

### 4.15 Tag — Figma `76:440` (green/cyan/pink/purple + *_icon + Boy/Girl/Not selected)

| 항목 | 내용 |
|---|---|
| variant `tone` | `agency`(green) · `emotion`(pink) · `flexibility`(cyan) · `motivation`(purple) · `neutral`(dusk) — **capability 키가 아니라 tone 이름** (ui는 도메인 모름) |
| variant `size` | `sm`(26) · `xs`(19) |
| state | 없음 (표시 전용) |
| 치수 | height `--tag-height-sm/-xs`, padding-x `--space-3`(12, Figma 13), radius `--radius-pill`, 라벨 `--text-caption-1`(12), xs 라벨도 **최소 11px** (Figma 9px 폐기 — #10-②) |
| 색 | 배경 `--color-capability-*-bg` / `--haru-dusk-200`, 글자 `--color-capability-*-fg` (**`가값 (P-02)`**) |
| leadingIcon | `--size-icon-sm`(16, Figma 10×11.5), gap `--space-1-5`(6) |
| props | `tone`, `size`, `label`, `leadingIcon`, `trailingIcon` |
| 접근성 | 장식이 아닌 정보이면 주변 텍스트로도 동일 정보 제공(색 단독 금지). 인터랙티브 아님 — 누를 수 있으면 Chip 또는 SelectTrigger(Stage 2) |
| 주의 | Figma `Boy`/`Girl`/`Not selected` 는 Tag가 아니라 **SelectTrigger**(Stage 2). Tag로 구현하지 않는다 |

### 4.16 Chip — Figma `90:626` (Green/Transparent) · `40:316` Button/Filter

| 항목 | 내용 |
|---|---|
| variant | `filled`(선택됨) · `outline`(미선택) · `glass`(필터, `40:316`) |
| state | `rest` `hover` `pressed` `selected` `disabled` **`focus`** |
| 치수 | height `--chip-height`(31, outline은 border 포함 33), padding `--space-3`/`--space-2`, radius `--radius-pill`, 라벨 `--text-caption-1`(12, Figma 12.5) |
| 색 | selected: `--color-selected-bg` + `--color-selected-fg`(**D-01** 범위) / unselected: 투명 + border 1px `--color-border-subtle`(**`가값 (P-02)`**) + `--color-fg-secondary`… → **라벨은 `--color-action-secondary-fg`**(Figma `#5e7370`, `가값 (P-11)`) |
| glass variant | `--color-surface-glass` + `--shadow-rest` |
| 선택 표시 | 색 + **선택 시 leading `check` 아이콘(12px)** 병행 — WCAG 1.4.1 (Figma 없음 → 명세) |
| props | `selected`, `onToggle`, `label`, `variant`, `disabled`, `leadingIcon` |
| 접근성 | `<button aria-pressed>` (단일 토글) 또는 그룹에서 `role="radio"`/`checkbox`. **hit area 44** (시각 31 유지, 세로 hit slop ±7). 칩 사이 gap ≥ `--space-2` |

### 4.17 RadioGroup (variant=card) — Figma `179:1788`

| 항목 | 내용 |
|---|---|
| variant | `card`(기본, 설문) · `list`(간단 목록 — 명세) |
| state | 행: `rest` `hover` `pressed` `selected` `disabled` **`focus`**; 그룹: `error` |
| 치수 | 행 높이 43 → **`--size-touch-min`(44)로 확장**, 행 간격 `--space-2`(8, Figma 7), 라디오 점 15 (`--radio-dot-size`), 좌측 padding `--space-4`(16, Figma 15), 라벨 시작 `--space-10`? → 아이콘+gap `--space-3`(12, Figma 41−30=11) |
| 색 | 미선택: 배경 `--color-surface-subtle`, 원 border 1.5px `--color-border-subtle`(`가값 (P-02)`), 라벨 `--color-fg-primary` / 선택: 배경 `--color-selected-bg`, 라벨 `--color-selected-fg`(**D-01**), 원 = 흰 테두리 + 흰 점 |
| 라벨 | `--text-subheadline`(15, Figma 14.5) |
| radius | `--radius-field`(16) |
| props | `options`, `value`, `onChange`, `name`, `variant`, `error`, `disabled` |
| 접근성 | `role="radiogroup"` + `<fieldset>/<legend>`, 화살표 키 이동 + Space/Enter 선택, 포커스는 그룹 단위(roving tabindex). 선택은 색 + 원 채움으로 이중 표시 |
| 도메인 주의 | 설문 6번째 **비채점 옵션**의 시각 구분은 **Stage 2** 결정 (C-8·C-13). Stage 1의 RadioGroup은 `options[].variant`(`default`·`muted`) 슬롯만 열어둔다 |

### 4.18 ProgressBar — Figma `179:1779/1780`

| 항목 | 내용 |
|---|---|
| variant `tone` | `accent`(teal) · `neutral` |
| variant `size` | `sm`(6) · `md`(8) |
| state | `determinate`(value) · `indeterminate`(로딩) |
| 치수 | 높이 6/8, radius `--radius-pill`, 폭 100% |
| 색 | fill `--color-progress-fill`, track `--color-progress-track` — 대비 1.73–1.94:1 (**`가값 (P-02)`**) |
| indeterminate 모션 | 좌→우 40% 폭 슬라이드, `--motion-duration-slow`×3, `--motion-ease-standard`; reduced-motion에서 정지 + 텍스트 |
| props | `value`, `max`, `tone`, `size`, `label`(a11y), `showValue` |
| 접근성 | `role="progressbar"` + `aria-valuenow/min/max` + `aria-label`. **값을 색으로만 전달하지 않도록** 옆에 텍스트("1 / 10") 병기 권장. indeterminate는 `aria-valuenow` 생략 |

### 4.19 PageIndicator — Figma `88:789` (Pagenation)

| 항목 | 내용 |
|---|---|
| variant | `dots`(기본) · `interactive`(누를 수 있음) |
| state | active / inactive (+ interactive일 때 focus·hover) |
| 치수 | dot 7×7, active 20×7, radius `--radius-indicator`(4), gap `--space-1-5`(6) |
| 색 | `--color-indicator-active` / `--color-indicator-inactive` |
| props | `count`, `index`, `onSelect`, `label` |
| 접근성 | 기본은 **장식** (`aria-hidden`) + 별도 텍스트("2 of 3")로 상태 전달. `interactive` 면 `role="tablist"` 유사 구조 + 각 dot hit area 44 |
| Figma 정리 | `26:21` 에 `Pagenation 88:903` 과 `Deck Dots 27:85` 가 **중복 배치**되어 있다 → PageIndicator 1종으로 통합, Figma 중복 제거 요청 (§13.3) |

### 4.20 SpeechBubble — Figma `88:721` (Type2 / sessopn / Type3)

| 항목 | 내용 |
|---|---|
| variant `tail` | `bottom-right`(Type2) · `top-center`(sessopn·Type3) · `none` |
| variant `align` | `start` · `center` |
| state | 없음 (시각 전용). 문구·상태는 Domain `CharacterBubble`(Stage 2) |
| 치수 | padding `--space-4`/`--space-3-5`(16/14), radius `--radius-surface`(22), gap `--space-1-5`(6, Figma 5·6), tail 16×16 radius 3 회전 -45°, tail 겹침 12 |
| 색/그림자 | `--color-surface-strong`(90%) + `--shadow-rest` + `--inset-shadow-highlight` |
| props | `tail`, `align`, `children` |
| 접근성 | 순수 컨테이너. 내용이 동적으로 바뀌면 부모가 `aria-live="polite"` 를 붙인다 |
| 주의 | Figma `Type3`(Prompt 목록)은 버블 역할이 아니다 → **Stage 4 PromptDrawer**로 분리 (COMPONENT_MAP 통합 후보 G). Stage 1 SpeechBubble은 껍데기만 |

### 4.21 Sheet + Scrim — Figma 부분 근거 (`88:960` grabber, `163:1807` dim frame)

| 항목 | 내용 |
|---|---|
| variant | `bottom`(기본) · `full`(전체 높이) |
| state | `closed` `opening` `open` `closing` |
| 치수 | 상단 radius `--radius-card`(28), padding `--space-6`, 최대 높이 `calc(100dvh - --space-10)`, 폭 = 앱 컬럼, grabber 36×4 radius pill `--color-indicator-inactive` |
| 배경 | `--color-surface-strong` + `--shadow-glass-rest`; Scrim `--color-scrim` (**`가값 (P-05)`**), z `--z-sheet`(40) |
| 모션 | enter `translateY(100%) → 0` `--motion-duration-base` `--motion-ease-standard`; scrim fade. reduced-motion = fade only |
| props | `open`, `onClose`, `title`, `trailing`, `initialFocus`, `dismissible`, `children` |
| 접근성 | `role="dialog"` `aria-modal="true"` `aria-labelledby`; **focus trap** + 열릴 때 `initialFocus`(없으면 제목) 로 이동, 닫힐 때 트리거로 복귀; `Esc` 닫기; 배경 `inert`/`aria-hidden`; 스크롤 잠금(`overscroll-behavior: contain`) |
| Figma 없음 | grabber·헤더·모션 규격 → 명세. `163:1807` "Deemed" 는 시트가 아니라 **dim 오버레이 프레임**임을 2026-09-18 확인 (§13.2 ⑤) |

### 4.22 Dialog + ConfirmDialog — **Figma 없음 → 명세** (#22)

| 항목 | 내용 |
|---|---|
| variant | `default` · `destructive` |
| state | `closed` `opening` `open` `closing`, 확인 버튼 `loading` |
| 치수 | 폭 `min(320px, 앱컬럼 − 2×gutter)`, radius `--radius-card`(28), padding `--space-6`, 제목↔본문 gap `--space-2`, 본문↔버튼 gap `--space-5` |
| 배경 | `--color-surface-strong` + `--shadow-glass-rest`; Scrim `--color-scrim`; z `--z-dialog`(50) |
| 버튼 | 세로 stack(기본): 확인 = `Button variant=accent size=md fullWidth`, 취소 = `Button variant=glass size=md fullWidth`. **destructive** = 확인 버튼 배경 `--color-status-error-bg` + 라벨 `--color-status-error-fg` + border `--color-status-error-border` (`가값 (P-04)`). 파스텔 red를 배경으로 쓰면 흰 라벨 대비가 부족하므로 **채움이 아닌 강조 테두리 방식**을 채택한다 (RECOMMENDED, §9.4) |
| 모션 | enter `scale(.96) → 1` + fade, `--motion-duration-fast` `--motion-ease-spring`; reduced-motion = fade only |
| props | `open`, `title`, `description`, `confirmLabel`, `cancelLabel`, `destructive`, `confirming`, `onConfirm`, `onCancel` |
| 접근성 | `role="alertdialog"`(ConfirmDialog) / `role="dialog"`(Dialog), `aria-modal`, focus trap, 초기 포커스 = **취소 버튼**(destructive일 때) / 확인 버튼(기본), `Esc` = 취소, 배경 `inert` |
| 사용처 | Stage 2 로그아웃, Stage 4 녹음 폐기, Stage 8 삭제·탈퇴 |

### 4.23 22종 체크 표 (Plan §9.3 대응)

| # | 컴포넌트 (+부속) | 이 문서 절 | Figma 기준 | Figma 없는 부분 |
|---|---|---|---|---|
| 1 | Text | §4.1 | `17:298` | — |
| 2 | Icon (+ HARU SVG) | §4.2 · §8 | `50:157` | 일반 아이콘 = Lucide |
| 3 | Surface + AppBackground | §4.3 | `17:332`·`16:24`·`17:33` | fallback·flat variant |
| 4 | Button + ButtonGroup | §4.4 | `17:20`·`86:245`·`86:372` | focus·loading |
| 5 | IconButton | §4.5 | `78:158`·`26:44` | focus·loading·plain variant·hit area |
| 6 | TopBar | §6.1 | `139:2734` 외 | focus·overflow 규칙 |
| 7 | AppColumn | §2.4 | 화면 frame 393 | 320/600/1024 규칙(#12) |
| 8 | BottomTabBar | §6.2 | `25:87`·`140:2971` | focus·키보드·safe-area |
| 9 | Spinner + Skeleton | §4.9 | **없음** | 전체 |
| 10 | ErrorState + EmptyState | §4.10 | **없음** | 전체 |
| 11 | InlineAlert | §4.11 | **없음** | 전체 |
| 12 | Toast + ToastProvider | §4.12 | **없음** | 전체 |
| 13 | TextField + FieldGroup | §4.13 | `76:417` | focus·error·disabled·empty |
| 14 | Checkbox + CheckboxGroup | §4.14 | `179:1742`(checked만) | unchecked·error·focus·indeterminate |
| 15 | Tag | §4.15 | `76:440` | xs 최소 크기 상향 |
| 16 | Chip | §4.16 | `90:626`·`40:316` | focus·disabled·check 아이콘 |
| 17 | RadioGroup | §4.17 | `179:1788` | focus·error·disabled·muted 옵션 |
| 18 | ProgressBar | §4.18 | `179:1779/1780` | indeterminate·라벨 |
| 19 | PageIndicator | §4.19 | `88:789` | interactive·a11y |
| 20 | SpeechBubble | §4.20 | `88:721` | — |
| 21 | Sheet + Scrim | §4.21 | 부분(`88:960`) | 헤더·grabber·모션·focus trap |
| 22 | Dialog + ConfirmDialog | §4.22 | **없음** | 전체 |

---

## 5. 공통 상태 패턴 (P-10) — AppColumn + TopBar 컨텍스트

결정 #22에 따라 **Figma 없이 design-agent 명세로 Stage 1에 선구현**한다. 기존 토큰·컴포넌트만 사용하며 새 시각 언어를 만들지 않는다. 구현 후 dev gallery `/__dev/ui/states` 화면으로 항목별 승인 (`가값 (P-10)`, Plan §17).

### 5.0 문구 톤 (전 상태 공통)

- 언어: **영어**. 문장은 짧고 평서형. 느낌표·이모지 사용 안 함.
- **진단·판정·비교 표현 금지** (CLAUDE.md). "failed", "invalid", "you did X wrong" 대신 상황과 다음 행동을 말한다.
- 권장 패턴: `<무슨 일이 있었는지> + <다음에 할 수 있는 것>`.
  - Error: "We couldn't load this right now." / "Try again"
  - Offline: "You're offline. We'll reconnect automatically."
  - Empty: "Nothing here yet." + 다음 행동 문장
  - Loading: 텍스트를 쓸 때 "Loading" (스크린리더 전용)
- **Stage 1의 실제 문구는 `apps/web/src/shared/copy` 에 두고 컴포넌트에 하드코딩하지 않는다.** 위 문구는 gallery 데모용 기본값이다.

### 5.1 Loading — 3계층 선택 기준

| 계층 | 언제 | 무엇을 |
|---|---|---|
| **Skeleton** (기본) | 화면 진입 시 **구조를 이미 아는** 콘텐츠를 기다릴 때 | 실제 콘텐츠와 같은 위치·크기의 Skeleton (레이아웃 점프 0) |
| **Inline Spinner** | 화면 일부(더 보기, 목록 추가 로드) | 해당 영역 중앙, `size=md` |
| **Button loading** | 사용자가 액션을 눌렀을 때 | Button 내부 Spinner + 라벨 폭 유지 (§4.4) |
| 전체 화면 Spinner | **쓰지 않는다** | 앱 첫 부팅(라우터 준비) 한 곳만 예외 |

레이아웃: TopBar는 **즉시** 실제 값으로 렌더(제목은 라우트가 알고 있음)하고, 콘텐츠 영역만 Skeleton으로 채운다. 콘텐츠 상단 여백 `--space-6`, Skeleton 블록 간격 `--space-4`.

지연 규칙 (RECOMMENDED): 응답이 **150ms 미만**이면 Skeleton을 그리지 않는다(깜빡임 방지). 한 번 그렸으면 최소 **300ms** 유지.

접근성: 콘텐츠 컨테이너 `aria-busy="true"`, 시각 숨김 `role="status"` "Loading". 로딩이 끝나면 `aria-busy=false` 로 전환하고 별도 알림은 하지 않는다.

### 5.2 Empty

```
AppColumn
 └ TopBar (실제 제목)
 └ 콘텐츠 영역 (세로 가운데 정렬, 최소 높이 = 콘텐츠 영역 100%)
     └ EmptyState  (Surface fill=strong radius=card padding=--space-6, 폭 100%)
         ├ 아이콘 배지 48
         ├ 제목   --text-headline / --color-fg-primary
         ├ 설명   --text-subheadline / --color-fg-secondary  (최대 2줄)
         └ 액션   Button variant=accent size=md  (선택)
```
- 상하 여백: 콘텐츠 영역 안에서 세로 가운데. 단 스크롤 가능한 목록의 "결과 없음"은 **목록 위치 그대로**(가운데 정렬 아님).
- BottomTabBar가 있으면 하단 padding = `--layout-tabbar-height` + `--layout-safe-bottom`.

### 5.3 Error + Retry

```
ErrorState (Surface fill=strong radius=card padding=--space-6)
 ├ 아이콘 배지 48 (triangle-alert, --color-status-error-*)
 ├ 제목  --text-headline
 ├ 설명  --text-subheadline / --color-fg-secondary
 └ Button variant=glass size=md "Try again"   ← 카드 **내부 하단**, fullWidth
```
- **재시도 버튼은 카드 안**에 둔다(하단 고정 CTA 자리를 쓰지 않는다) — 하단 CTA는 화면 고유 행동 자리이기 때문.
- 부분 실패(목록 일부)는 ErrorState 대신 `InlineAlert tone=error placement=inline` + 인라인 "Try again" 액션.
- 재시도 중: 버튼 `loading`, 카드 나머지는 그대로 유지(입력값·스크롤 위치 보존).
- 접근성: 화면 전체 실패는 `role="alert"`, 재시도 결과는 `aria-live="polite"` 로 알린다.

### 5.4 Offline Banner

| 항목 | 값 |
|---|---|
| 컴포넌트 | `InlineAlert tone=offline placement=banner` |
| 위치 | TopBar **바로 아래**, 앱 컬럼 폭, sticky (`--z-sticky`) |
| 색 | `--color-surface-note` + `--color-fg-primary` + border `--color-border-subtle` (status 색 아님) |
| 아이콘 | Lucide `wifi-off`, `--size-icon-md` |
| 문구 | "You're offline. We'll reconnect automatically." |
| 표시 조건 | `navigator.onLine === false` **또는** API adapter가 network error를 반환 |
| 해제 | 온라인 복구 시 자동 해제 + (직전에 실패한 쿼리가 있으면) 자동 재시도. **수동 닫기 없음** |
| 지속 | 오프라인인 동안 계속 표시 (자동 사라짐 없음) |
| 모션 | 높이 0 → auto + fade, `--motion-duration-fast`; reduced-motion = 즉시 표시 |
| 접근성 | `role="status"` `aria-live="polite"`. 배너가 나타나도 포커스를 옮기지 않는다 |

### 5.5 Toast

§4.12 규격. 사용 기준: **되돌릴 필요 없는 짧은 확인**(저장됨, 복사됨, 재시도 예약됨). 오류를 Toast로만 알리지 않는다(화면 안 ErrorState/InlineAlert 병행).

### 5.6 Dialog

§4.22 규격. 사용 기준: **되돌릴 수 없는 행동 확인**만. 정보 전달에는 쓰지 않는다(InlineAlert 또는 Sheet 사용).

### 5.7 상태 ↔ Mock 시나리오 매핑 (Plan §8)

| Mock scenario key | 발생 경로 | 화면 상태 | 확인 컴포넌트 | AC |
|---|---|---|---|---|
| `success` | `MockHealthApi` 성공 | 정상 콘텐츠 | — | AC-1-38 |
| `loading` | 주입 timer 지연 | **Skeleton** (§5.1) | Skeleton, Button loading | AC-1-19·38 |
| `error` | Error Envelope (`INTERNAL_ERROR`) | **ErrorState + Retry** (§5.3) | ErrorState, Button loading | AC-1-19·38 |
| `retry` | 1회차 error → 2회차 success | Error → 재시도 → 정상 | ErrorState → Skeleton → 콘텐츠 | AC-1-38 |
| `offline` | adapter network error throw | **Offline Banner** (§5.4) | InlineAlert tone=offline | AC-1-19·38 |
| `empty` | **health에는 없음** — gallery `__states` 그룹에서만 | **EmptyState** (§5.2) | EmptyState | AC-1-19 (Plan §8.1) |

- Toast·Dialog는 API 시나리오가 아니라 **사용자 액션**으로 트리거되므로 gallery의 버튼으로 재현한다.
- scenario 전환은 URL 우선 (`?scenario=health:error`, `?scenario=__states:empty`) — Plan §16 D-5. 결정적이어야 한다 (AC-1-39).

### 5.8 Stage 1에서 만들지 않는 상태

권한 거부(마이크), 업로드 실패/재시도, 분석 대기/실패, 리포트 미충족(Not Eligible), 동의 누락 — 전부 해당 Stage에서 **이 공통 패턴을 재사용해** 구현한다 (COMPONENT_MAP §7). Stage 1은 컴포넌트와 패턴만 제공한다.

---

## 6. TopBar / BottomTabBar

### 6.1 TopBar — variant 4종

Figma 근거: 컴포넌트 `139:2734` (`Titla type=Three | two`) + 화면 헤더 4종. **variant 이름의 오타 `Titla` 는 구현에 옮기지 않는다** (§13.3 디자이너 요청).

| variant | 구성 | Figma 근거 | 치수 |
|---|---|---|---|
| `inline` | leading IconButton + 중앙 **pill**(BookTitle) + trailing IconButton(선택) | `139:2734` Three/two | 높이 40, gap `--space-5`(20, Figma 18) |
| `centered` | leading IconButton + 중앙 **텍스트 제목** + trailing IconButton | `179:1772`+`179:1778`+`179:1775` (설문), `29:75`+`29:76` | 높이 38(아이콘 기준), 제목 `--text-subheadline`(15/590) 가운데 |
| `large` | 좌측 대형 제목 + trailing(chip/IconButton) | `30:89` "Library", `31:117` "Progress" | 제목 `--text-title-1`(28) + `--font-weight-heavy` |
| `pill` | leading 없음, 중앙 pill만 | `139:2735` two 변형 | 높이 40 |

공통 규격:

| 항목 | 값 |
|---|---|
| 배치 | `AppColumn` 안, 좌우 `--layout-gutter`, 상단 `--layout-safe-top` |
| sticky | `position: sticky; top: 0; z-index: var(--z-sticky)` |
| 스크롤 시 | 배경 없음 → 스크롤 > 8px 이면 `Surface fill=glass material=rest` 로 전환 (RECOMMENDED, Figma 없음) |
| 제목 넘침 | 1줄 말줄임(`truncate=1`). **중앙 정렬 제목은 leading/trailing 폭(44)만큼 좌우 여백을 확보**해 좌우 대칭 유지 |
| pill 규격 | height 40, padding-x `--space-4`(16, Figma 15), gap `--space-2`(8), radius `--radius-pill`, `--color-surface-glass` + `--shadow-rest`, 커버 16×22 radius `--radius-indicator`(4, Figma 3), 제목 `--text-footnote`(13/590) |
| props | `variant`, `title`, `subtitle`, `leading`, `trailing`, `sticky`, `transparent` |
| 접근성 | `<header>` + 제목은 `h1`(화면당 1개). leading/trailing은 IconButton(`label` 필수). 키보드 순서 = leading → 제목(비포커스) → trailing |

**설정 아이콘 `26:44` 배치 규칙 (Stage 2에서 사용)**

- Home 헤더는 `TopBar variant=large` 의 확장형이다: leading = 워드마크(로고 에셋), trailing = `IconButton icon=settings label="Settings"` → `/settings`.
- 위치: 우측 `--layout-gutter`(24). Figma `26:44` x=331, w=38 → 331+38 = 369 = 393−24 ✓ **gutter 24와 일치**.
- 시각 크기 38 유지, hit area 44. 아이콘 Lucide `settings`, `--size-icon-md`.
- Stage 1에서는 **마운트하지 않는다** (Plan §3.1). gallery에서 `large` variant 데모로만 렌더.

### 6.2 BottomTabBar — Figma `25:87` + `140:2971`

**항목 구성 (CONFIRMED #15, D-02)**

| 순서 | key | 표시 라벨 | route | 아이콘 | Figma variant 이름 |
|---|---|---|---|---|---|
| 1 | `library` | **Library** | `/library` | Lucide `book-open` (§8.1) | `Active=Library` |
| 2 | `home` (center) | **Home** | `/` | HARU SVG `haru:tab-center-home` (`140:2971`) | `Active=Home` |
| 3 | `progress` | **Progress** | `/progress` | Lucide `chart-column` (§8.1) | `Active=Report` |

> **Figma variant명 `Report` ↔ 표시 라벨 `Progress` 처리**: 2026-09-18 `25:87` 재조회 결과 **세 variant 모두 라벨 텍스트가 이미 "Progress"** 로 되어 있다(`node-25_86` / `node-25_68` / `node-25_50`). 즉 차이는 **variant property 값 이름(`Active=Report`)뿐**이며 시각 산출물은 동일하다. 구현 key는 `progress`, 라벨은 copy 모듈의 `Progress` 를 쓰고, Figma variant 이름 `Report → Progress` rename은 디자이너 요청 항목이다(§13.3). QA 시각 비교에서 이름 차이는 **차이 아님**.

**`110:522` 탭바 미사용 근거**: `110:522` 는 layer 이름이 `div`/`span`/`div.haru-pressable` 인 **HTML→Figma import frame** 이며 component instance가 아니다(FIGMA_SCREEN_MAP §0, 2026-09-18 재확인). 항목도 Library / Session / Report 로 **결정 #15(세션 전용 탭 없음)와 충돌**한다. 따라서 Stage 1은 `25:87` 단일 소스만 사용한다.

**시각 규격 (CONFIRMED Figma `25:87`, 2026-09-18)**

| 항목 | 값 | 토큰 |
|---|---|---|
| 바 크기 | 345×70 (Figma 393 frame에서 x=24 → 좌우 gutter 24) | 폭 = 앱 컬럼 − 2×`--layout-gutter`, 높이 `--layout-tabbar-height` |
| radius | 100 | `--radius-pill` |
| 재질 | glass fill 74% + blur 12 + shadow + inset highlight | `material-glass-rest` |
| 항목 아이콘 | 21×21 | `--tabbar-icon-size` (21 고정 — §13.2 ②) |
| 아이콘↔라벨 gap | 4 | `--space-1` |
| 항목 상단 offset | 16 | `--space-4` |
| 라벨 | 11px, 선택 590 / 미선택 510 | `--text-caption-2` + `--font-weight-semibold`/`-medium` |
| 라벨 색 | 선택 `--color-fg-primary`, 미선택 `--color-fg-secondary` (**`가값 (P-01)`**, glass 위 2.92–3.14:1) |
| 중앙 버튼 | 64×64, 바 상단 기준 `top: -35` (35px 돌출), 가로 중앙 | `--tabbar-center-size`, `--layout-tabbar-center-overhang` |
| 중앙 라벨 | 바 내부 "Home" 텍스트 (top 41) | 중앙 버튼과 라벨이 분리된 구조 |
| 안전 영역 | 바 아래 `--layout-safe-bottom` | |

**`items` config 스키마 (packages/ui는 도메인을 모른다 — AC-1-25)**

```
type TabBarItem = {
  key: string;                    // 'library' | 'home' | 'progress' (앱이 결정)
  label: string;                  // copy 모듈에서 주입 ('Library' | 'Home' | 'Progress')
  icon: IconName;                 // Lucide 이름 또는 'haru:*'
  emphasis?: 'center';            // 중앙 강조 항목 (배열당 최대 1개)
  badge?: number | 'dot';         // 예약 (Stage 3+), Stage 1은 렌더만 지원
};

type BottomTabBarProps = {
  items: TabBarItem[];            // 길이 2~5 허용, HARU는 3개 고정 (앱이 강제)
  activeKey: string;
  onSelect: (key: string) => void;
  label?: string;                 // nav 접근성 이름, 기본 'Main'
};
```

- `items` 는 `apps/web/src/app/layouts/TabLayout.tsx` 가 `shared/config` + `shared/copy` 에서 조립해 주입한다. `packages/ui` 는 route·capability·도메인 enum을 모른다.
- `emphasis: 'center'` 항목은 배열 위치와 무관하게 **가운데**에 렌더하고, 나머지를 좌우로 균등 배치한다.

**state**

| state | 표현 |
|---|---|
| active | 라벨 semibold + `--color-fg-primary`, 아이콘 채움(선택 전용 글리프), `aria-current="page"` |
| inactive | 라벨 medium + `--color-fg-secondary` |
| hover (포인터) | 항목 배경 `--color-surface-strong` 10%? → **사용 안 함**. 아이콘·라벨 opacity 변화 없음, 커서만 pointer (Figma에 hover 없음) |
| pressed | `scale(.96)` + `--motion-duration-instant` |
| focus | 항목 단위 `focus-ring`, radius `--radius-pill` |
| disabled | 사용 안 함 (탭은 항상 활성) |

**접근성**

- `<nav aria-label="Main">` + `<ul role="list">`, 각 항목은 `<a>`(라우터 Link). 현재 탭 `aria-current="page"`.
- 중앙 항목도 동일한 `<a>` 이며 시각적으로만 돌출한다. **중앙 버튼 hit area 64 ≥ 44 ✓**, 좌우 항목 hit area = 항목 폭(약 115) × 70 ✓.
- 라벨은 아이콘과 **항상 함께** 표시한다(텍스트 의존 최소화와 균형: 아이콘+텍스트 병행, PRD §11).
- 키보드: Tab으로 순차 이동(Tab bar 내부 화살표 키 순환은 도입하지 않음 — 링크 목록이므로).
- 중앙 버튼이 바 위로 35px 돌출하므로 **바 위 콘텐츠와 겹치지 않도록** 콘텐츠 하단 padding = `--layout-tabbar-height` + `--layout-tabbar-center-overhang` + `--layout-safe-bottom`.

---

## 7. Layout / 반응형 규칙 — CONFIRMED (#12)

### 7.1 기본 규칙

| 구간 | 폭 | 규칙 |
|---|---|---|
| mobile | 320 ~ 599 (`--layout-min-width` ~ `--bp-md` 미만) | 단일 컬럼, 폭 100%, 좌우 `--layout-gutter`(24). Figma 393 frame이 기준 |
| md | 600 ~ 1023 (`--bp-md` ~ `--bp-lg` 미만) | **동일한 모바일 레이아웃**을 최대 폭 480(`--layout-app-max-width`)으로 제한하고 가운데 정렬. 배경 gradient는 뷰포트 전체 |
| lg | 1024 이상 (`--bp-lg`) | md와 **완전히 동일**. 사이드 내비게이션·2단 레이아웃·데스크톱 장식 없음 |
| 가로(landscape) | — | 전용 레이아웃 없음. 같은 앱 컬럼으로 표시. Capacitor 앱은 portrait lock (Stage 4) |

Tailwind v4 `--breakpoint-*` 는 `md`(600)·`lg`(1024) **두 개만** 선언한다. `sm`·`xl`·`2xl` 은 초기화로 제거 (#29, AC-1-11).

### 7.2 폭별 기대 레이아웃 (AC-1-23 검증 기준)

| 뷰포트 | AppColumn 폭 | 좌우 여백 | 기대 |
|---|---|---|---|
| **320×568** | 320 − 48 = **272** 콘텐츠 | 24 | 가로 스크롤 0 (WCAG 1.4.10). Button `fullWidth` 272, BottomTabBar 272, TopBar 중앙 제목 말줄임 발생 가능. **덱·카드는 고정 폭 금지** |
| **393×852** | 393 − 48 = **345** 콘텐츠 | 24 | Figma 기준값과 1:1 (Figma BottomTabBar 345 ✓, CTA Button 345 ✓) |
| **600×800** | **480** 컨테이너, 콘텐츠 432 | `(600−480)/2 = 60` + gutter 24 | 앱 컬럼 가운데. 배경 gradient는 600 폭 전체. TabBar·Toast·Sheet·Dialog 모두 컬럼 안 |
| **1024×768** | **480** 컨테이너, 콘텐츠 432 | `(1024−480)/2 = 272` + gutter 24 | md와 동일. 다단 없음 |

추가 확인 항목 (AC-1-22):
- 브라우저 텍스트 **200% 확대** 시 320px 폭에서 가로 스크롤 없이 reflow. 고정 높이 컨테이너 금지.
- `100dvh` 사용(모바일 주소창 대응), `100vh` 금지.
- `viewport-fit=cover` + safe-area 적용 (`apps/web/index.html`).

### 7.3 Figma 절대 좌표 → 구현 규칙

Figma 화면 다수가 `absolute left/top` 배치다(DESIGN_SYSTEM §11.1). 구현은 **절대 좌표를 옮기지 않고** 다음으로 치환한다.

| Figma 패턴 | 구현 |
|---|---|
| `left: 24` / `left: 26` | `AppColumn` 의 `--layout-gutter`(24) |
| `top: 750` 하단 CTA | 스크롤 컨테이너 내부의 마지막 블록 + `margin-top: auto` (키보드 가림 방지) |
| `top: 0` 상태바 56px | 구현하지 않음 — `--layout-safe-top` 으로 대체 (iOS 크롬은 OS가 그림) |
| Home Indicator 바 (`179:1747` 등) | 구현하지 않음 |
| 기기 frame radius 56 | 구현하지 않음 |
| 스크롤 frame 높이 1103/1752 | 콘텐츠 기반 자동 높이 |

---

## 8. Icon

소스: 일반 아이콘 = **Lucide** (`lucide-react`, ISC), HARU 전용 = **Figma SVG export**, 브랜드 로고 = **공식 브랜드 에셋만** — CONFIRMED (#21). 버전 고정은 Plan §16 D-2 (정확 버전).

### 8.1 Lucide ↔ Figma 아이콘 대응표

| 용도 | Figma 근거 | Lucide 이름 (권장) | 대안 | Stage |
|---|---|---|---|---|
| 뒤로 | `78:157` Icon=Back, `179:1727` | `chevron-left` | `arrow-left` | 1 |
| 앞으로 | `179:1776` (설문 forward) | `chevron-right` | `arrow-right` | 1 |
| 설정 | `78:156` Icon=Setting, `26:45` | `settings` | `settings-2` | 1(gallery) / 2(마운트) |
| 닫기 | `29:76` | `x` | — | 1 |
| 새로고침·되돌리기 | `179:1805` | `rotate-ccw` | `refresh-cw` | 1 |
| 체크 | `179:1743` (체크박스 내부), Chip 선택 | `check` | — | 1 |
| 아래 화살표 (select) | `163:2832` (12px, 90° 회전) | `chevron-down` | — | 1(Tag/SelectTrigger 슬롯) |
| 메일 | `179:1716` | `mail` | — | 2 |
| 목록 | `179:1765` | `list` | — | 2 |
| 시계 | `179:1760`, `50:152` clock_default | `clock` | HARU `haru:clock` | 2 |
| **탭 Library** | `25:35`/`25:53` (21px SVG) | `book-open` | `library-big` | 1 |
| **탭 Progress** | `25:46`/`25:82` (21px SVG) | `chart-column` | `trending-up` | 1 |
| **탭 Home(중앙)** | `140:2971` (64px 합성) | — (HARU SVG, §8.2) | — | 1 |
| 경고/에러 | 없음 | `triangle-alert` / `octagon-alert` | — | 1 |
| 정보 | 없음 | `info` | — | 1 |
| 성공 | 없음 | `circle-check` | — | 1 |
| 오프라인 | 없음 | `wifi-off` | — | 1 |
| 업로드 | 없음 | `cloud-upload` | — | 4 |
| 삭제 | 없음 | `trash-2` | — | 8 |
| 재생/일시정지 | 없음 (`163:1588` 은 HARU record) | `play` / `pause` | — | 4·7 |
| 공유 | 없음 | `share` | — | 7 |
| 잠금(동의) | 없음 | `lock` | — | 2 |
| 달력 | 없음 | `calendar` | — | 3 |
| 추가(책 등록) | 없음 | `plus` | — | 3 |
| 검색 | 없음 | `search` | — | 3 |
| 다운로드 | `110:854` | `download` | — | 7 |

> **탭 아이콘 글리프 확정은 §10.2 시각 비교에서 한다.** Figma의 탭 아이콘은 이름 없는 21px SVG(`Frame`)이므로 이름으로 대응을 확정할 수 없다. `book-open` / `chart-column` 은 design-agent 권장안이며, gallery 렌더와 `25:87` 스크린샷을 나란히 비교해 `library-big` / `trending-up` 중 하나로 바꿀 수 있다 (RECOMMENDED, 시각 비교 후 확정).

### 8.2 HARU 전용 SVG export 목록 (`Icon 50:157` = 15 symbol, 2026-09-18 재확인)

| Figma variant 이름 | Figma 크기 | export 파일명 (의미 기준) | 필요 Stage |
|---|---|---|---|
| `shape=home` (`140:2950`) + `Tab Bar/Center` (`140:2971`) | 24 / 64 | **`tab-center-home.svg`** (합성 64: teal 원 + home 글리프) | **1 (필수)** |
| `shape=record` (`140:2949`) | 26 | `record.svg` | 4 |
| `shape=attend` (`113:2075`) | 30 | `sticker-attend.svg` | 4 |
| `shape=thumb_gold` (`90:594`) | 24 | `thumb-up-gold.svg` | 5 |
| `shape=thumb_white` (`90:599`) | 24 | `thumb-up-white.svg` | 5 |
| `shape=flip_to_back` (`85:501`) | 24 | `flip-to-back.svg` | 3 |
| `shape=flip_to_front` (`85:506`) | 24 | `flip-to-front.svg` | 3 |
| `shape=star` (`117:879`) | 25×24 | `star-filled.svg` | 5 |
| `shape=clock_default` (`50:152`) | 24 | `clock.svg` (Lucide `clock` 로 대체 가능 — 시각 비교 후 결정) | 2 |
| `shape=clock_small` (`50:158`) | 13 | → `clock.svg` 로 통합 (11px 미만 크기 폐기) | 2 |
| `shape=right` (`86:286`) / `shape=left` (`86:291`) | 24 | → Lucide `chevron-right` / `chevron-left` 로 **대체** | 3 |
| `shape=shape11` (`117:880`) | 18×17 | **이름 불명 — 디자이너 확인 필요** (§13.3) | 미정 |
| `shape=13` (`117:882`) | 14×13 | **이름 불명 — 디자이너 확인 필요** | 미정 |
| `shape=icon, Property 2=reply_all` (`148:1608`) | 18 | **이름·용도 불명 — 디자이너 확인 필요** | 미정 |

**Stage 1 export 대상은 `tab-center-home.svg` 1건뿐이다.** 나머지는 해당 Stage에서 export한다 (에셋 파이프라인은 Plan §16 D-4).

### 8.3 HARU SVG export 규격

| 항목 | 규칙 |
|---|---|
| viewBox | `0 0 24 24` 로 정규화 (원본이 21·26·30이어도 24 그리드로 리매핑). **예외**: `tab-center-home` 은 합성 아이콘이므로 `0 0 64 64` 유지 |
| 크기 속성 | 루트 `width`/`height` 를 **제거**하고 `viewBox` 만 남긴다 (CSS로 `--size-icon-*` 적용) |
| 색 | 단색 글리프는 `fill`/`stroke` 를 **`currentColor`** 로 치환. **다색 아이콘**(`thumb_gold`, `tab-center-home` 의 teal 원)은 색을 유지하되, 유지되는 색이 팔레트 토큰과 같은 값인지 확인하고 다르면 §13.2에 보고 |
| stroke | 선형 아이콘은 `stroke-width: 1.5`, `stroke-linecap: round`, `stroke-linejoin: round` (Lucide 기본과 정합) |
| 최적화 | SVGO — `id`·`class`·메타데이터·빈 그룹 제거, `path` 병합 금지(애니메이션 여지) |
| 접근성 | 루트에 `aria-hidden` 을 넣지 않는다. Icon 컴포넌트가 `label`/`decorative` 로 결정 |
| 파일 위치 | `packages/ui/src/icon/haru/*.svg` + 이름 → 컴포넌트 매핑 `haru/index.ts` |

### 8.4 아이콘 크기 단계 적용 기준 — `가값 (P-09)`

| 토큰 | 값 | 사용처 | Figma 관측값 |
|---|---|---|---|
| `--size-icon-sm` | 16 | Tag leadingIcon, InlineAlert 인라인 아이콘, Chip check | 10×11.5(`113:1618`), 12(`163:2832`), 13(`50:161`) |
| `--size-icon-md` | 20 | IconButton, TextField trailing, Button leading/trailing, BottomTabBar **아님** | 18(`77:150`), 19(`26:45`, `179:1760`) |
| `--size-icon-lg` | 24 | ErrorState/EmptyState 배지 내부, 큰 강조 | 24(`50:152`), 21(탭) |
| (예외) `--tabbar-icon-size` | **21** | BottomTabBar 항목 | 21(`25:35`) — 3단계에 없음 (§13.2 ②) |

### 8.5 브랜드 로고 취급

| 로고 | 규칙 | Stage |
|---|---|---|
| Google "G" (`179:1710`) | **Google 공식 브랜드 에셋만** 사용. Figma에서 export하지 않고 Google Identity 공식 SVG를 사용한다. Icon 컴포넌트로 감싸지 않고 `BrandLogo` 전용 표시 컴포넌트(Stage 2)로 렌더 — 색·비율·여백 변경 금지 | 2 |
| Apple | Figma에 없음. **Apple 공식 "Sign in with Apple" 버튼 가이드**를 그대로 따른다(자체 버튼 스타일 적용 금지) — CONFIRMED (C-13, #21) | 2 |
| HARU 워드마크 ("HARU" `26:39`, `179:1707`) | 현재는 SF Pro Heavy 텍스트다. **텍스트가 아니라 로고 에셋으로 분리**할 것을 제안 (DESIGN_SYSTEM §2.2) — 폰트가 Inter로 바뀌는 환경에서 브랜드 표기가 달라지기 때문. 에셋화 여부는 **NEEDS DECISION** (§13.3-c S1-D10) |

- Stage 1에서는 브랜드 로고를 **사용하지 않는다**. 취급 규칙만 확정한다.
- 라이선스: Lucide = ISC ✓, Inter = SIL OFL ✓, SF Pro 파일은 **저장소·빌드 포함 금지** ✓ (#11). HARU 전용 SVG·캐릭터·표지는 사용 권리 확보됨 (C-17).

---

## 9. Motion / Accessibility

### 9.1 Motion 매핑 — `가값 (P-07)`

| 사용처 | duration | easing | 속성 |
|---|---|---|---|
| Button/Chip/IconButton press | `--motion-duration-instant` (100ms) | `--motion-ease-standard` | `transform` (translateY 1px + scale .97) |
| Button/Surface hover | `--motion-duration-fast` (180ms) | `--motion-ease-standard` | `transform`(translateY -1px), `box-shadow` |
| shadow 전환 (rest↔raised↔pressed) | `--motion-duration-fast` (180ms) | `--motion-ease-standard` | `box-shadow` |
| Offline Banner 등장/해제 | `--motion-duration-fast` (180ms) | `--motion-ease-standard` | `opacity`, `grid-template-rows` (height auto) |
| Toast enter | `--motion-duration-base` (240ms) | `--motion-ease-standard` | `transform`(translateY 12px→0), `opacity` |
| Toast exit | `--motion-duration-fast` (180ms) | `--motion-ease-standard` | `opacity` |
| Sheet enter/exit | `--motion-duration-base` (240ms) | `--motion-ease-standard` | `transform`(translateY 100%→0), scrim `opacity` |
| Dialog enter | `--motion-duration-fast` (180ms) | `--motion-ease-spring` | `transform`(scale .96→1), `opacity` |
| Skeleton pulse | `--motion-duration-pulse` (1200ms) | `--motion-ease-standard` | `opacity` .5↔1, 무한 |
| Spinner rotate | 800ms (= `--motion-duration-slow`×2) | `--motion-ease-linear` | `transform: rotate` 무한 |
| ProgressBar indeterminate | 1200ms (= `--motion-duration-pulse`) | `--motion-ease-standard` | `transform: translateX` 무한 |
| 화면 진입 fade | `--motion-duration-slow` (400ms) | `--motion-ease-standard` | `opacity` (Stage 2+) |

규칙:
1. 모든 모션은 **토큰만** 사용. 임의 ms·cubic-bezier 금지.
2. 무한 반복 모션은 **한 화면에 1개**. (Stage 1에서는 Skeleton과 Spinner가 동시에 보이지 않도록 §5.1 계층 규칙으로 보장)
3. 깜빡임 3회/초 초과 금지 (WCAG 2.3.1).
4. 상태를 **모션만으로** 전달하지 않는다 — 아이콘/텍스트/`aria-live` 병행.
5. 제스처 전용 조작 금지 — 버튼 대안 필수 (WCAG 2.5.1). Stage 1에는 제스처 컴포넌트가 없다.

### 9.2 `prefers-reduced-motion: reduce` 대체 동작 (AC-1-22)

| 모션 | reduce 동작 |
|---|---|
| press/hover transform | **제거** (shadow 전환만 유지, duration 0ms) |
| Skeleton pulse | **정지**, 정적 fill 유지 |
| Spinner rotate | **정지**, 정적 원호 + "Loading" 텍스트 노출 |
| ProgressBar indeterminate | **정지**, 정적 track + 텍스트 |
| Toast/Sheet/Dialog enter | translate/scale 제거 → `opacity` 만 (duration 유지) |
| Offline Banner | 즉시 표시/해제 |
| 화면 전환 | 즉시 전환 |

구현 규칙: 전역 `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }` 같은 **일괄 차단은 쓰지 않는다**(shadow 전환·focus 표시까지 죽는다). 컴포넌트별로 위 표대로 처리한다.

추가: `prefers-reduced-transparency: reduce` → Surface의 glass fill을 `--material-glass-fill-fallback` 불투명으로 대체하고 `backdrop-filter` 제거 (DESIGN_SYSTEM §6-3).

### 9.3 Focus ring 규격 — `가값 (P-03)`

| 항목 | 값 |
|---|---|
| 색 | `--color-focus-ring` = `--haru-ink-700` `#4a5f5c` |
| 굵기 | `--focus-ring-width` = 2px |
| offset | `--focus-ring-offset` = 2px |
| 구현 | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` — `box-shadow` 대신 `outline` 을 쓴다(둥근 모서리 자동 추종, Windows 고대비 모드 대응) |
| 트리거 | `:focus-visible` 만. `:focus` 에는 표시하지 않음 |
| 배경별 대비 | white 위 **6.81:1** ✓ · glass over 배경끝 위 **6.05:1** ✓ · teal(Accent) 위 **3.28:1** ✓ (비텍스트 3:1 충족) · 배경 gradient 끝 위 **4.14:1** ✓ |
| 예외 | Sheet/Dialog 내부 첫 포커스는 링을 그리되(키보드 진입이므로), 마우스로 연 경우 `:focus-visible` 규칙에 맡긴다 |

터치 타깃 (AC-1-21):

| 요소 | Figma 시각 크기 | hit area 처리 |
|---|---|---|
| IconButton | 38×38 (`78:157`) | `::before { inset: -3px }` → 44×44 |
| Chip | 31–33 (`90:625/624`) | 세로 hit slop ±7 → 44, 칩 간 gap ≥ 8 |
| Checkbox | 22×22 (`179:1742`) | 라벨 포함 행 전체가 클릭 영역, 행 최소 높이 44 |
| RadioGroup 행 | 43 (`179:1789`) | 행 최소 높이 44 |
| Tag (xs 19 / sm 26) | — | 인터랙티브 아님 → 확장 불필요 |
| PageIndicator dot | 7 | 기본은 장식(`aria-hidden`). `interactive` 면 44 |
| TextField trailingAction ("Show") | 텍스트 13px | padding으로 44×44 |
| BottomTabBar 항목 | 약 115×70 | ✓ |
| Button md/lg | 45 / 56 | ✓ |

### 9.4 대비 측정표 — D-01 수용 범위 vs 가값 범위

계산 방법: WCAG 2.x 상대 휘도. 반투명 fill은 배경 위에 합성해 계산 (glass 74% over 배경 시작 `#dbeee7` → `#f6fbf9`, over 배경 끝 `#c7c9d7` → `#f1f1f5`; glass-strong 90% → `#fbfcfc` / `#f9f9fb`). blur·그림자는 반영하지 않음. 값은 `docs/DESIGN_SYSTEM.md` §12.1 계산과 동일하며, 2026-09-18 Figma 재조회에서 **전경·배경 색 값이 모두 변경되지 않았음을 확인**했다.

#### (A) D-01 수용 예외 범위 — `--color-action-primary-bg` 위 흰 라벨만

| 전경 | 배경 | 대비 | 사용처 (node) | 판정 | 처리 |
|---|---|---|---|---|---|
| `--color-fg-on-accent` (white) | `--color-action-primary-bg` teal `#85bfb6` | **2.07:1** | Accent Button `17:12`·`179:1746`·`179:1768`, 선택 Chip `90:625`, 선택 Radio 옵션 | ✗ (4.5 미달, 3.0도 미달) | **D-01 수용** — QA는 요구사항 FAIL로 기록하되 Stage Verdict는 `PASS (accepted: D-01)` (AC-1-17) |
| (참고, 채택 안 함) white | 진한 teal `#3f7f76` | 4.66:1 | — | ✓ | 기록용. #18-①로 **불채택** |

#### (B) `가값 (P-01)` — 보조 텍스트

| 전경 | 배경 | 대비 | 사용처 | 판정 |
|---|---|---|---|---|
| `--color-fg-secondary` `#7d9291` | white | **3.29:1** | 캡션, TextField helper | ✗ |
| `--color-fg-secondary` | glass over 배경 시작 / 끝 | **3.14 / 2.92:1** | **BottomTabBar 비선택 라벨** `25:38` (바는 화면 하단 = 배경 끝) | ✗ |
| `--color-fg-secondary` | glass-strong over 배경 끝 | **3.12:1** | SpeechBubble 부제 `50:173`, `88:760` | ✗ |
| `--color-fg-secondary` | 배경 gradient 시작 / 끝 (직접) | **2.72 / 2.00:1** | — | ✗ (3:1도 미달) |
| `--haru-ink-400` `#9aabaa` | white / glass-strong | **2.39 / 2.33:1** | TextField label `76:430` | ✗ |
| (수정 후보 A, 미채택) `#5f7473` | white / glass 끝 | 4.96 / 4.40 | — | 부분 ✓ |
| (수정 후보 B, 미채택) `--color-fg-primary` 로 전환 | glass 끝 | 6.05 | 비선택 탭 라벨 | ✓ (단 선택/비선택 구분이 weight만 남음) |

→ Stage 1은 **현재 Figma 값으로 진행**. 승인 단계(Plan §17)에서 위 후보와 함께 제시.

#### (C) `가값 (P-02)` — 비텍스트 / 배지 글자

| 전경 | 배경 | 대비 | 사용처 | 판정 |
|---|---|---|---|---|
| `--color-progress-fill` teal | `--color-progress-track` (합성) | **1.73–1.94:1** | ProgressBar `179:1780` | ✗ (3:1) |
| `--color-border-subtle` ink 18% | white | **1.26:1** | Chip outline `90:624`, TextField outline | ✗ |
| Checkbox teal fill | white | **2.07:1** | `179:1742` | ✗ |
| `--color-rating-filled` yellow `#d0cca1` | white | **1.64:1** | StarRating `91:693` (Stage 5) | ✗ |
| `--color-capability-emotion-fg` white | pink `#efc3d4` | **1.56:1** | ER 배지 | ✗ |
| `--color-capability-motivation-fg` white | purple `#c9b8d4` | **1.86:1** | IM 배지 | ✗ |
| `--color-capability-agency-fg` white | green `#90bfad` | **2.05:1** | SD 배지 `76:439` | ✗ |
| `--color-capability-flexibility-fg` white | cyan `#a0ccdd` | **1.72:1** | CF 배지 | ✗ |
| (수정 후보, 미채택) `--haru-ink-800` `#3b4a48` 를 배지 글자로 | green / purple / cyan / pink | **4.53 / 5.00 / 5.39 / 5.94** | 4색 모두 4.5:1 충족 | ✓ |

#### (D) `가값 (P-11)` — glass·tinted 표면 위 `text-button` 라벨 (D-01 범위 **밖**)

| 전경 | 배경 | 대비 | 사용처 | 판정 |
|---|---|---|---|---|
| `--color-action-secondary-fg` `#5e7370` | glass over 배경 시작 / 끝 | **4.83 / 4.48:1** | Glass Button 라벨 `17:5` (17px/590) | 시작 ✓ / 끝 ✗ (근소) |
| `#5e7370` | glass-strong (시작/중간/끝) | **4.94 / 4.91 / 4.80:1** | Chip 라벨 `90:617` | ✓ |
| `#5e7370` | tinted `#dbeee7` | **4.18:1** | PromptPill `139:2753` (Stage 3) | ✗ |
| `#5e7370` | 배경 gradient 시작 (직접) | **4.18:1** | "Question 1 of 10" `179:1778` (Stage 2) | ✗ |

> Glass Button 라벨은 **17px/590 = 22.7px 미만**이므로 "대형 텍스트(3:1)" 예외에 해당하지 않는다. 4.48:1은 4.5:1에 0.02 모자란다.

#### (E) 통과 항목 (참고)

| 전경 | 배경 | 대비 | 사용처 |
|---|---|---|---|
| `--color-fg-primary` `#4a5f5c` | white | **6.81:1** | 제목·본문 |
| `--color-fg-primary` | glass over 배경 끝 | **6.05:1** | BottomTabBar 선택 라벨 |
| `--color-fg-strong` `#3b4a48` | white | **9.30:1** | TextField value, 설문 질문 |
| `--color-fg-link` `#4a5f5c` + underline | 배경 gradient 시작 | **4.74:1** (합성) / white **6.81** | "Log in" `179:1721` ✓ |
| `--color-focus-ring` | white / teal / glass 끝 | **6.81 / 3.28 / 6.05** | focus (§9.3) ✓ |
| `--color-status-*-fg` | 각 `-bg` / white / glass-strong | **4.55–4.93 / 5.29–5.83 / 5.03–5.54** | InlineAlert·Toast·필드 에러 ✓ (`가값 (P-04)` 값 기준) |
| `--color-fg-primary` | 배경 gradient 끝 `#c7c9d7` | **4.14:1** | ✗ 일반 / ✓ 대형 — **본문 텍스트를 배경 위에 직접 두지 않는다**(Surface 위에만) |

#### (F) Stage 1 결론

- **AA 미충족 항목은 전부 D-01(수용) 또는 P-01/P-02/P-11(가값)에 이미 귀속된다. Stage 1에서 새로 발생하는 대비 위반은 없다.**
- 공통 상태 패턴(§5)에 쓰는 색 조합은 **모두 AA 통과**하도록 설계했다(§9.4-E status 색).
- QA 기록 방식: D-01 범위 = `PASS (accepted: D-01)`, P-01·P-02·P-11 = FAIL이 아니라 **가값 목록에 기록** (rules/qa §2, Plan §17-2).

---

## 10. Figma node 참조 · 시각 비교 baseline

### 10.1 Stage 1 참조 node 전체 목록

| Figma node | 대상 | 이 문서 | 2026-09-18 재조회 |
|---|---|---|---|
| `17:366` | Foundations (색·타입 swatch) | §3 | — (§10.4) |
| `17:129` | Colors Variables | §3.1.1 | — |
| `17:298` | Typography text styles | §3.1.3 | — |
| `17:367` | HARU Components section | §4 전체 | ✔ metadata |
| `17:332` / `16:24` | HARU Material (Glass Rest/Raised/Pressed) | §3.2.4 · §4.3 | ✔ (effect style 값) |
| `17:20` (`17:4`–`17:18`) | Button 8 variant | §4.4 | ✔ design context |
| `17:33` | Activity Card (radius-card 근거) | §3.2.3 | ✔ (`17:343` 경유) |
| `17:343` | HARU Material Demo | §3.2.4 | ✔ |
| `25:87` (`25:33/51/69`) | Screen/Tab Bar 3 variant | §6.2 | ✔ |
| `140:2971` | Tab Bar/Center | §6.2 · §8.2 | ✔ |
| `78:158` (`78:156/157`) | IconButton | §4.5 | ✔ |
| `139:2734` (`78:286`, `139:2735`) | TopBar (Title) | §6.1 | ✔ |
| `76:417` (`76:415/416/418/447`) | Input 4 variant | §4.13 | ✔ |
| `76:440` (`76:439`–`163:2798`) | Tag 11 variant | §4.15 | ✔ |
| `90:626` (`90:624/625`) | Chip (Select) | §4.16 | ✔ |
| `40:316` | Button/Filter → Chip glass | §4.16 | — |
| `88:721` (`50:176`, `88:757`, `88:838`) | SpeechBubble | §4.20 | ✔ |
| `88:789` | PageIndicator (Pagenation) | §4.19 | ✔ |
| `50:157` | HARU 아이콘 15종 | §8.2 | ✔ |
| `179:1742` | Checkbox | §4.14 | ✔ (metadata) |
| `179:1788` (`179:1789`–`1803`) | RadioGroup card | §4.17 | ✔ |
| `179:1779` / `179:1780` | ProgressBar | §4.18 | ✔ |
| `163:1807` | "Deemed" dim overlay (시트 아님) | §4.21 · §13.2 ⑤ | ✔ |
| `26:44` | 설정 IconButton 배치 | §6.1 | ✔ |
| `26:21` | Home 화면 (gutter·탭바 배치) | §7 | ✔ |
| `179:1701` · `179:1724` · `179:1748` · `179:1770` · `179:1809` | gutter·버튼 높이·gradient·medallion | §7 · §12.2 | ✔ |
| `28:51` | medallion 174/190 | §12.2 | ✔ |
| `110:522` | **사용하지 않음** (근거 §6.2) | §6.2 | ✔ (FIGMA_SCREEN_MAP §0) |

### 10.2 Playwright 시각 비교 baseline (AC-1-24, 8건 + 추가 기준)

viewport **393×852**, `prefers-reduced-motion: reduce`, 애니메이션 정지 후 캡처. 비교 대상은 gallery의 해당 데모 블록.

| # | Figma node (baseline) | 구현 대상 | 비교 범위 |
|---|---|---|---|
| V-1 | `17:20` | Button 8 variant (+ focus·loading 2종은 비교 제외 — Figma 없음) | 크기·radius·색·라벨·그림자 |
| V-2 | `17:332` / `16:24` | Surface material 3종 | fill·blur·그림자·하이라이트 |
| V-3 | `25:87` (3 variant) | BottomTabBar | 크기·중앙 돌출·라벨 weight·색 |
| V-4 | `76:440` / `90:626` / `40:316` | Tag · Chip | 높이·padding·radius·색 |
| V-5 | `76:417` (4 variant) | FieldGroup + TextField | 행 높이·구분선·라벨/값 색 |
| V-6 | `88:721` | SpeechBubble (꼬리·radius·fill만, 문구 제외) | 꼬리 위치·각도·radius |
| V-7 | `88:789` | PageIndicator | dot 크기·active 폭·gap |
| V-8 | `17:366` | 토큰 swatch 페이지 | 색·타입 스케일 |
| V-9 | (Figma 없음 — 이 문서 기준) | 공통 상태 6종, focus ring, 320 reflow, 600/1024 앱 컬럼, 200% 확대, reduced-motion | 스냅샷 회귀 기준만 (Figma 대조 아님) |

### 10.3 허용 차이 (사전 명시) — QA는 FAIL 처리하지 않는다

| ID | 차이 | 원인 | 허용 범위 |
|---|---|---|---|
| **AD-1** | **폰트 metric** — Figma는 SF Pro, Chromium(Playwright) 기본 환경은 **Inter** (#11) | 폰트가 다름 | **텍스트 글리프 폭·자간·베이스라인·줄 끝 위치 차이 허용.** 텍스트 블록의 **행 수 증가로 레이아웃이 깨지는 것은 불허**. 텍스트를 제외한 **레이아웃(박스 위치·크기)·색·간격·radius·그림자는 불허(=일치해야 함)** |
| **AD-2** | **font-weight 근사** — Figma 510/590/860(및 `179:1813` Black=1000)은 Inter variable에서 가장 가까운 축 값으로 렌더 | variable font 축 매핑 | weight 렌더 차이 허용. 단 **weight 계층 순서**(regular < medium < semibold < bold < heavy)는 유지되어야 함 |
| **AD-3** | **그림자 레이어** — 구현은 명명된 Effect Style(`HARU/Glass Rest` 등)을 쓰고, Figma의 Button/TabBar/Input **instance는 raw 2-layer 그림자**를 쓴다 (§13.2 ①) | Figma 컴포넌트가 Effect Style을 바인딩하지 않음 | 그림자 blur/offset 차이 허용. **fill·radius·크기는 불허** |
| **AD-4** | **backdrop blur** — Button hover는 Figma 6, 구현은 12로 통일 | 단계 2종(12/24)으로 흡수 (#10-②) | hover 상태 blur 차이 허용 |
| **AD-5** | **spacing/radius 흡수** — §3.5 흡수표의 ±0.5–4px | 스케일 흡수 (#10-②) | 흡수표에 **명시된 항목만** 허용. 표에 없는 차이는 불허 |
| **AD-6** | **텍스트 크기 흡수** — 11.5→11, 12.5→12, 14.5→15, 21→22, 27→28 | 타입 스케일 흡수 (#10-②) | 흡수표 항목만 허용 |
| **AD-7** | **기기 크롬 미구현** — 상태바 56px, Dynamic Island, Home Indicator | Figma는 기기 목업 포함, 구현은 safe-area | 해당 영역 전체 차이 허용 (비교 시 crop) |
| **AD-8** | **`backdrop-filter` 미지원 환경** — 불투명 fallback | 성능·지원 (§4.3) | fallback 렌더 시 glass 비교 제외 |
| **AD-9** | **Figma placeholder 데이터** — 더미 문구·표지 불일치(M-36) | Figma 목업 데이터 | 문구 비교 제외 (구조·스타일만 비교) |
| **AD-10** | **gutter 24 통일** — Figma는 24(버튼·탭바)와 26(입력·섹션 라벨) 혼재 | `가값 (P-13)` | 26 사용 요소의 좌우 ±2px, 폭 ±4px 차이 허용 |

측정 도구 기준 (RECOMMENDED): Playwright `toHaveScreenshot({ maxDiffPixelRatio: 0.02 })` 를 기본으로 하되, **AD 항목이 적용되는 비교는 픽셀 비교 대신 구조·토큰 단위 assertion**(계산된 스타일 값 비교)을 병행한다. 정확한 임계값은 Stage 1 구현 후 baseline을 만들어 확정한다 (NEEDS DECISION → development-agent가 QA handoff에 기록).

### 10.4 이번 Stage에서 재조회하지 못한 node

`17:366` Foundations, `17:129` Colors, `17:298` Typography는 2026-09-14 Stage 0 조사 결과(`docs/DESIGN_TOKEN_MAP.md` §2·§3)를 그대로 사용했다. 2026-09-18 재조회에서 이 값들을 **사용하는 컴포넌트**(`17:20`, `25:87`, `76:417`, `76:440`, `88:721` 등)의 색·크기가 모두 일치함을 확인했으므로 간접 검증된 것으로 본다. Variable Collection 이름·Mode 존재 여부는 여전히 **MCP로 확인 불가** (TOKEN_MAP §0).

---

## 11. development-agent 인계 메모

1. **토큰 파일 구조**는 Plan §9.2를 따르고, 각 파일에 들어갈 토큰은 이 문서 §3.1–§3.3이 기준이다. `provisional` 주석 위치는 **§3.6 표를 그대로** 옮긴다 (AC-1-12).
2. **`@theme` 에는 Semantic만** 넣는다. Tier 1(`--haru-*`)과 Tier 3(`--button-*` 등)은 `@theme` 에 넣지 않는다 (AC-1-11). `@utility` 대상은 §3.4 표.
3. **`packages/ui` 는 `@haru/contracts` 를 import 하지 않는다.** capability는 `tone`, 탭 항목은 `items` prop으로 받는다 (AC-1-25, AC-1-09).
4. **공통 상태 6종(§5)과 모든 컴포넌트의 focus·error·loading 상태는 이 문서가 유일한 기준**이다 (Figma 없음, #22). 구현 후 `/__dev/ui/states` 에서 §5.1–§5.6 레이아웃 그대로 보여야 승인 절차(P-10)를 진행할 수 있다.
5. **gallery 구성 제안**: `/__dev/ui/tokens`(색·타입·spacing·radius·shadow·material swatch) · `/components`(22종 × 전체 variant×state 매트릭스) · `/states`(AppColumn+TopBar 컨텍스트의 6종 상태) · `/responsive`(320/393/600/1024 프레임 4종) · `/a11y`(focus 순회·터치 타깃 오버레이·대비 값 표시). §12.2 가값 승인 화면도 여기서 제시한다.
6. **HARU SVG는 Stage 1에 `tab-center-home.svg` 1건만** export한다 (§8.2). 나머지를 미리 넣지 않는다.
7. **Figma 값을 코드에 직접 쓰지 않는다.** 이 문서가 "Figma 관측값"으로 적은 수치(26, 18, 13, 11.5 …)는 §3.5 흡수표를 거쳐 토큰으로만 들어간다 (AC-1-10).
8. **BottomTabBar를 `/` 에 마운트하지 않는다** (Stage 3). gallery에서만 렌더 (Plan §3.1).
9. Button hover의 Figma blur 6 → 12 통일, 그림자는 명명된 Effect Style 사용 — §10.3 AD-3·AD-4를 QA handoff에 그대로 옮겨 적는다.
10. 탭 아이콘 Lucide 글리프(`book-open` / `chart-column`)는 **시각 비교 후 확정**한다 (§8.1). 확정 결과를 `docs/qa/stage-1-handoff.md` 에 기록하면 design-agent가 이 문서와 COMPONENT_MAP을 갱신한다.

---

## 12. 판단 보고

### 12.1 2026-09-18 Figma 재조회로 확인한 값 (Stage 0 문서 대비)

| # | 항목 | Stage 0 문서 기록 | 2026-09-18 Figma 실제 | 처리 |
|---|---|---|---|---|
| ① | TextLink 색 | `--color-fg-link` = `--haru-ink-700` + underline (**RECOMMENDED**, "Figma·결정 로그 근거 없음" — TOKEN_MAP §2.6) | `179:1721` "Log in" = `#4a5f5c`(= ink-700) **14px/590 underline** | **CONFIRMED (Figma)** 로 승격. TOKEN_MAP §2.6 행의 RECOMMENDED 라벨을 CONFIRMED로 갱신 필요 (§13.3-b) |
| ② | BottomTabBar 라벨 | "Figma variant 이름 Report → Progress rename은 디자이너 요청" | **세 variant 모두 라벨 텍스트가 이미 "Progress"** (`25:86`/`25:68`/`25:50`) | 시각 차이 없음. rename은 **variant property 이름만** 해당 (§6.2) |
| ③ | 배경 gradient stop | "46% vs 52% 혼재, 가값 46%" | `179:1748` = `#dbeee7 0% → #d3e3de 46% → #c7c9d7 100%` | **46% 재확인** (§12.2 P-14) |
| ④ | Input 배경 | TOKEN_MAP은 FieldGroup을 `--color-surface-solid`(white)로 배정 | `76:416` `bg-white` + `backdrop-blur 12` | 일치 ✓ (glass가 아니라 불투명 white 확인) |
| ⑤ | Glass 효과 값 | TOKEN_MAP §5.3 Effect Style 값 | `HARU/Glass Rest/Raised/Pressed`, `HARU/Shadow Rest`, `HARU/Icon Chip` 전부 **문서 값과 일치** | 변경 없음 ✓ |
| ⑥ | Capability 색 | #19 매핑 (green/pink/cyan/purple) | `76:439/441/443/445` = `#90bfad`/`#a0ccdd`/`#efc3d4`/`#c9b8d4` | 일치 ✓ (AC-1-15) |

### 12.2 값 혼재 가값 재확인 — Stage 1 채택안

> 모두 **디자이너 승인 대기 가값**이다. 아래 채택은 "Stage 1 구현에 쓸 값"이며 확정이 아니다 (#10-④, Plan §17).

| P | 항목 | Figma 실제 관측 (2026-09-18) | Stage 1 채택 | 근거 |
|---|---|---|---|---|
| **P-12** | `--radius-surface` 22 vs 24 | `88:758` SpeechBubble **22** · `76:416` Input Line_2/3/badge **22** · `76:415` Input Line_1 **20** · `179:1759/1764` InfoRow **20** · `179:1756` 카드 **26** · 리포트 카드 24(Stage 7) | **22 유지** | Stage 1 대상 컴포넌트(SpeechBubble·TextField)에서 **22가 다수**이고 두 컴포넌트가 모두 22다. 20은 흡수 시 +2, 24는 -2로 대칭이나 22가 실제 사용 빈도 최다 |
| **P-13** | `--layout-gutter` 24 vs 26 | **24**: `26:21` TabBar x24·`179:1746`/`179:1768`/`179:1814` CTA x24·`179:1726`/`179:1772` back x24·`179:1779` ProgressBar x24·`179:1783` 설문 카드 x24 / **26**: `179:1734`/`179:1740` Input x26(w341)·`179:1733`/`179:1739` 섹션 라벨 x26·`26:39` 워드마크 x26·`88:922` 버블 x26 / **28**: `179:1756` x28 | **24 유지** | ① **구조 요소**(탭바·하단 CTA·진행 바·카드·헤더 아이콘)가 전부 24 ② `26:44` 설정 아이콘 우측 끝 369 = 393−**24** 로 우측 여백이 24 ③ 24 = `--space-6` 으로 spacing 스케일에 있고 26은 없다 ④ 26 요소는 폭 341 → 345로 +4px 넓어질 뿐 레이아웃이 깨지지 않는다 (AD-10) |
| **P-14** | `--gradient-app` 중간 stop 46% vs 52% | `179:1748` 프레임 fill = **46%** (2026-09-18 직접 확인). 52%는 Stage 0 기록의 다른 frame | **46% 유지** | 재조회에서 실제 46%를 확인. 52% frame은 Stage 1 대상이 아니며, 차이가 시각적으로 미미(배경 중간 stop 6% 이동) |
| **P-15** | `--size-button-lg` 56 vs 58 | **58**: `179:1746`(345×58) · `179:1768`(345×58) · `179:1814`(345×58) — 모두 **x=24 / w=345** / **56**: `179:1709`·`179:1715`(341×56) — 모두 **x=26 / w=341** / **45**: 컴포넌트 `17:4` 원본, `140:2870`(281×45) | **56 유지** (단 근거 갱신) | ① 58은 **gutter 26 화면에는 없고 gutter 24 화면에만** 나타나 두 값이 짝을 이룬다(24↔58, 26↔56) ② P-13에서 gutter 24를 채택하면 일관성상 58이 자연스럽지만, **56이 4px 스케일(14×4)** 이고 58은 아니다 ③ 56은 `--space-*` 배수로 표현 가능해 토큰 체계와 맞다 ④ 차이 2px는 AD-5 흡수 범위 → **56 유지, 디자이너에게 "56/58 중 하나로 통일" 요청** (§13.3-c) |
| **P-16** | `--size-medallion-sm/md/lg` | **232** `179:1703/1704`(Welcome) · **200** `179:1750/1751`(Survey intro) · **190** ring `28:73` / **174** avatar `28:74`(Session) · 136·188은 2026-09-18 재조회 범위 밖(`29:86/87`, `179:1822/1823`) | **136 / 188 / 232 유지 (변경 없음)** + **`--size-medallion-ring-offset` 8 추가 제안** | ① lg 232, md 188↔실측 190/200, sm 136 ② `28:73`(ring 190) − `28:74`(avatar 174) = **좌우 8px 링** 구조를 이번에 확인 → 메달리온은 "avatar + ring"이며 크기 토큰은 **ring 바깥 지름** 기준이어야 한다 ③ **Stage 1은 토큰만 정의**하고 CharacterMedallion 컴포넌트는 Stage 2이므로, sm/md 실측 재확인은 Stage 2 design spec으로 넘긴다 |

### 12.3 가값 승인 절차에서 함께 제시할 자료 (Plan §17-3)

| P | 제시 자료 |
|---|---|
| P-01 | §9.4-B 대비표 + 수정 후보 2종 + gallery의 BottomTabBar 비선택 라벨·TextField helper 실물 |
| P-02 | §9.4-C 대비표 + `--haru-ink-800` 배지 글자 후보 렌더 비교 |
| P-03 | §9.3 규격 + white/glass/teal 3배경 focus ring 실물 |
| P-04 | InlineAlert 5 tone + Toast + 필드 에러 실물 + §9.4-E 대비값 |
| P-05 | Sheet/Dialog scrim 실물 |
| P-06 | z-index 중첩 데모 (TopBar < TabBar < Sheet < Dialog < Toast) |
| P-07 | §9.1 매핑표 + 모션 데모 + reduced-motion 토글 비교 |
| P-08 | safe-area 시각화(노치 시뮬레이션) |
| P-09 | 16/20/24 아이콘 3단계 나란히 + 탭 21 예외 |
| P-10 | §5 전체 상태 화면 6종 (`/__dev/ui/states`) |
| P-11 | §9.4-D + Glass Button·Chip 라벨 실물 |
| P-12 | radius 20/22/24/26 비교 렌더 |
| P-13 | gutter 24 vs 26 비교 렌더 (320/393 두 폭) |
| P-14 | gradient 46% vs 52% 비교 |
| P-15 | 버튼 45/56/58 비교 |
| P-16 | medallion 136/188/232 + ring offset 8 (Stage 2 예고) |

---

## 13. Figma 누락 · 불일치 · 승인 필요

### 13.1 Figma 누락 (Stage 1 범위) — 전부 #22로 명세 선구현 승인됨

| 대상 | Figma 상태 | 처리 |
|---|---|---|
| Spinner · Skeleton | 없음 | §4.9 명세 (`가값 (P-10)`) |
| EmptyState · ErrorState(+Retry) | 없음 | §4.10 명세 |
| InlineAlert / Banner (5 tone) | 없음 | §4.11 명세 |
| Toast | 없음 | §4.12 명세 |
| Dialog / ConfirmDialog | 없음 (iOS `misc/alert-overlay` 색만) | §4.22 명세 |
| Sheet 헤더·grabber·모션 | 부분 (`88:960` grabber, `145:1450` dim) | §4.21 명세 |
| 모든 컴포넌트의 **focus** 상태 | 없음 (전 컴포넌트) | §9.3 명세 |
| TextField·Checkbox·RadioGroup의 **error** 상태 | 없음 | §4.13·§4.14·§4.17 명세 |
| Button·IconButton의 **loading** 상태 | 없음 | §4.4·§4.5 명세 |
| Checkbox **unchecked**, Chip **disabled**, Radio **disabled** | 없음 | 각 절 명세 |
| ProgressBar **indeterminate** | 없음 | §4.18 명세 |
| 320 / 600 / 1024 레이아웃 | 없음 (393 frame만) | §7 명세 (#12로 규칙 확정됨) |
| Loading/Empty/Error 화면 배치 | 없음 | §5 명세 |

**C-13 질문 절차는 적용하지 않는다** (§1.3). 위 항목은 "화면"이 아니라 공통 상태·컴포넌트 상태이며 #22로 이미 승인되었다.

### 13.2 Figma 내부 불일치 · 신규 발견 (Stage 0 문서 미기재)

| # | 항목 | Figma 실제 (node) | 영향 | 결정 필요 |
|---|---|---|---|---|
| ① | **컴포넌트가 명명된 Effect Style을 바인딩하지 않음** | `17:4`(Button)·`25:33`(TabBar)·`76:416`(Input) = raw `0 12px 14px /.16, 0 2px 2px /.08`, hover = raw `18 18 20 /.2, 4 4 4 /.1` ↔ 스타일 `HARU/Glass Rest` = `0 2 4 /.08, 0 12 28 /.16, 0 28 56 /.12`, `Glass Raised` = `4 4 8 /.10, 18 18 40 /.20, 0 4 72 /.14` | 시각 비교 시 그림자 차이. 구현은 Effect Style 값 채택 | **디자이너 요청** (§13.3-a). Stage 1은 Effect Style 채택 + AD-3 허용 차이 |
| ② | **BottomTabBar 아이콘 21px 이 아이콘 크기 3단계(16/20/24)에 없음** | `25:35` 21×21 | `--size-icon-*` 만으로 표현 불가 | Tier 3 `--tabbar-icon-size` = 21 예외 토큰으로 처리 (§3.3). P-09 승인 시 함께 제시 |
| ③ | **TextField trailing "Show" 색이 팔레트 밖 raw** | `76:428` `#6ba99f` (white 대비 2.69:1) | 대비 미달 + 토큰 없음 | `--color-fg-link`(ink-700, 6.81:1) 로 **대체**. TOKEN_MAP §6.3과 동일한 방향이며 이 문서가 `--color-fg-link` 로 확정 |
| ④ | **radius 26 이 흡수표에 없음** | `179:1756` Survey intro 카드 radius 26 | TOKEN_MAP §5.2 6단계 목록에 26 없음 | `--radius-card`(28)로 흡수. **TOKEN_MAP §5.2·§6.3 갱신 필요** (§13.3-b) |
| ⑤ | **`163:1807` "Deemed" 는 시트가 아니라 dim 오버레이 프레임** | 393×1111 frame, 자식 = `Prompt Card/Home` instance 1개 | COMPONENT_MAP은 Sheet의 Figma source로 기재 | Sheet는 "Figma 부분 근거"로 낮추고 명세로 보완 (§4.21). **COMPONENT_MAP §1 Sheet 행 갱신 필요** |
| ⑥ | **설문 화면 forward IconButton이 프레임 밖으로 나감** | `179:1775` x=372, w=38 → 우측 끝 **410 > 393** (17px 초과) | Stage 2 설문 헤더 | 구현은 우측 gutter 24(x=331)에 배치. **디자이너 수정 요청** (§13.3-a) |
| ⑦ | **`179:1813` 텍스트가 SF Pro Black(CSS 1000)** | 27px / lh 33 / weight Black | weight 5단계(최대 860)에 없음 | `--font-weight-heavy`(860) + `--text-title-1`(28)로 흡수. AD-2 허용 차이. TOKEN_MAP §3.3 갱신 필요 |
| ⑧ | **fill `rgba(255,255,255,.72)` 가 알파 3단계에 없음** | `179:1759`, `179:1764` | 흰색 알파 3단계(a50/a74/a90) | `--haru-white-a74` 로 흡수 (+2%). TOKEN_MAP §2.3 갱신 필요 |
| ⑨ | **화면 카드 그림자가 3번째 raw 변종** | `179:1756/1759/1764`, 프레임 `179:1748` = `0 12 28 /.16, 0 2 4 /.08` | ①과 별개 변종 | `--shadow-glass-rest` 로 흡수 (근소). 디자이너 요청 ①에 포함 |

**PRD ↔ Figma 불일치 (Stage 1 범위): 신규 없음.** 기존 M-33(대비)·M-34(focus 부재)는 #18·D-01·P-01~P-03으로, M-08(내비게이션)은 #15·D-02로, M-13(역량 명칭)은 #13·#14·#19로 이미 처리되었다.

### 13.3 디자이너 요청 목록 (design-agent는 Figma를 수정하지 않는다)

**a. 수정 요청**

| 항목 | 내용 |
|---|---|
| Effect Style 바인딩 | Button `17:20`, Screen/Tab Bar `25:87`, Input `76:417`, 화면 카드들의 그림자를 raw 값 대신 `HARU/Glass Rest` / `Glass Raised` / `Glass Pressed` / `Shadow Rest` 스타일로 바인딩 (§13.2 ①·⑨) |
| 설문 헤더 overflow | `179:1775` forward IconButton을 프레임 안(x=331)으로 (§13.2 ⑥) |
| PageIndicator 중복 | `26:21` 의 `Pagenation 88:903` 과 `Deck Dots 27:85` 중 하나 제거 (§4.19) |
| 값 통일 | 버튼 lg 높이 56/58 중 택1, 화면 좌우 gutter 24/26 중 택1, radius 20/22/24/26 정리, gradient stop 46/52% 통일 (§12.2) |
| variant 이름 오타·정리 | `Titla type` → `Title type`, `Active=Report` → `Active=Progress`, `Type=sessopn` → 의미 이름, `Color=purple icon` → `purple_icon`, `cppr/arrow_last` → `color/arrow_last`, `shape=swape` → 의미 이름 |
| HARU 아이콘 이름 | `shape11`(`117:880`), `13`(`117:882`), `icon/reply_all`(`148:1608`) 의 **의미·용도 확인 후 이름 부여** (§8.2) |
| Focus variant | 향후 Figma에 `State=Focus` variant 추가 (현재는 이 문서가 기준) |
| Variable rename | TOKEN_MAP §6.2 목록 (자동 생성 색 이름, `font size/*`, `line height/*`, `SF Pro/*` 스타일 삭제) |

**b. HARU 문서 갱신 필요 (design-agent 소관 — 이 Spec 승인 후 반영)**

| 문서 | 갱신 내용 |
|---|---|
| `docs/DESIGN_TOKEN_MAP.md` | §2.6 `--color-fg-link` RECOMMENDED → **CONFIRMED (Figma `179:1721`)** · §2.3 알파 `.72` 흡수 행 추가 · §5.2 radius **26** 흡수 행 추가 · §3.3 raw **27px/Black** 행 추가 · §5.3 그림자 raw 변종 `0 12 28 /.16` 행 추가 · §4 `--layout-tabbar-center-overhang`·`--tabbar-icon-size`·`--size-medallion-ring-offset` 추가 |
| `docs/COMPONENT_MAP.md` | §1 Sheet 행의 Figma source를 "부분 근거"로 조정 (§13.2 ⑤) · BottomTabBar 행에 "라벨은 Figma에서 이미 Progress" 사실 추가 |
| `docs/DESIGN_SYSTEM.md` | §7 아이콘 크기에 탭 21 예외 추가 · §10.1 State 표에 이 문서가 채운 focus/error/loading 기준 링크 |

**c. 승인 필요 (사용자 결정)**

| # | 항목 | design-agent 권장 | 상태 |
|---|---|---|---|
| S1-D1 | 이 Design Spec 전체 승인 (Plan과 함께 승인 체크포인트) | — | **승인 필요** |
| S1-D2 | §12.2의 가값 채택안 5건 (P-12 22 / P-13 24 / P-14 46% / P-15 56 / P-16 136·188·232 + ring 8) | 표의 채택안 | **승인 필요** (가값 유지이므로 확정 아님) |
| S1-D3 | 신규 토큰 제안 3종: `--material-glass-fill-fallback`, `--tabbar-icon-size`(21), `--layout-tabbar-center-overhang`(35) | 도입 | **승인 필요** |
| S1-D4 | Toast 동시 표시 **최대 1개** (큐 없음) | 채택 | RECOMMENDED |
| S1-D5 | destructive Dialog를 **채움이 아닌 강조 테두리**로 (파스텔 red 대비 부족) | 채택 | RECOMMENDED |
| S1-D6 | TopBar 스크롤 시 glass 배경 전환 (Figma 없음) | 채택 | RECOMMENDED |
| S1-D7 | Loading 지연 150ms / 최소 표시 300ms | 채택 | RECOMMENDED |
| S1-D8 | Playwright 픽셀 비교 임계값 | Stage 1 baseline 생성 후 확정 | **NEEDS DECISION** (development-agent가 handoff에 기록) |
| S1-D9 | 탭 아이콘 Lucide 글리프 (`book-open` / `chart-column`) | 시각 비교 후 확정 | **NEEDS DECISION** |
| S1-D10 | HARU 워드마크 "HARU" 를 텍스트 대신 **로고 에셋**으로 분리 | 분리 권장 (폰트가 Inter로 바뀌면 브랜드 표기가 달라짐) | **NEEDS DECISION** (Stage 2 착수 전) |

### 13.4 에셋 · 라이선스 확인 결과

| 항목 | 상태 |
|---|---|
| Lucide (`lucide-react`) | ISC — 사용 가능 ✓ (버전 고정 Plan D-2) |
| Inter | SIL OFL — self-host 가능 ✓ (Plan D-3) |
| SF Pro | **저장소·빌드 포함 금지** ✓ (#11). Apple 기기에서 시스템 폰트로만 렌더 |
| HARU 전용 SVG (`50:157`) | HARU 자산 — export 가능 ✓ |
| 캐릭터·책 표지 | 권리 확보됨 (C-17) — **Stage 1에서는 사용하지 않음** |
| Google / Apple 로고 | 공식 브랜드 에셋만, Figma export 금지 ✓ (§8.5) — Stage 2 |
| iOS 26 커뮤니티 kit | 색·텍스트 스타일 변수만 참조. 컴포넌트 재구현 금지 (COMPONENT_MAP §6) |

---

## 14. 요약

| 항목 | 수치 |
|---|---|
| Tier 1 Primitive | 색 30 + status 8 + 타이포 11 style(size·line) + weight 5 = **54** |
| Tier 2 Semantic | 색 64 + 타이포 (11×4 + 5 + font-sans) = 50 + spacing/size/radius 25 + shadow/material 11 + motion/z 14 = **164** |
| Tier 3 Component | **36** (packages/ui 내부 전용) |
| `@theme` 노출 | 13 네임스페이스 (color·font·text·font-weight·radius·shadow·inset-shadow·blur·ease·breakpoint·spacing·animate) |
| `@utility` 노출 | 11 그룹 (z·duration·material·layout·safe-area·gradient·touch·focus·disabled·icon-size) |
| Shared UI | **22종** (부속 포함 30 파일) |
| 공통 상태 패턴 | **6종** (Loading/Skeleton · Empty · Error+Retry · Offline Banner · Toast · Dialog) |
| 가값 적용 토큰 | P-01~P-09·P-11~P-16 = **15건 / 토큰 48개** (P-10은 화면 명세) |
| Figma 시각 비교 baseline | **9건** (V-1 ~ V-9) |
| 허용 차이 | **10건** (AD-1 ~ AD-10) |
| 승인 필요 항목 | **10건** (S1-D1 ~ S1-D10) |
