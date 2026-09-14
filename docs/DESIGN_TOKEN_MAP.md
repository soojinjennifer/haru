# HARU Design Token Map

Status: DRAFT v2 — Stage 0 산출물 (critic 리뷰 반영 + Frontend-only 정렬, 2026-09-14), **모든 매핑·이름·신규 값은 제안 (승인 필요)**
Based on: Figma `YWWu3AFEJpRxvw0T5klq0k` `get_variable_defs` on `17:129` (Colors), `17:298` (Typography), `17:367` (HARU Components), screen frames `26:21`, `28:51`, `29:62`, `30:74`, `31:102`, `179:1724`, `179:1770` + `get_design_context` raw 값 (2026-09-14); 로컬 참고 `$HARU_ONEDRIVE/디자인/HARU 로그인 & Survey/_ds/…/tokens/*.css`; Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `.claude/rules/frontend.md` §6
Author: design-agent (2026-09-14)

라벨: `CONFIRMED` / `RECOMMENDED` / `NEEDS DECISION`

## 0. 확인 한계

- `get_variable_defs` 는 **이름 → 값** 만 반환한다. **Variable Collection 이름, Mode(Light/Dark), alias 관계는 MCP로 확인 불가**. 아래 "Collection" 열은 이름 prefix 와 Design Guide frame 위치로 추정한 값이다 ([추정]).
- `HARU/Glass Rest` 등 effect, `iOS 26/*` 텍스트는 Variable 이 아니라 **Style** 로 반환된다.
- "Corduroy 18%", "White 85%" 같은 이름 있는 색은 MCP 가 알파 없는 `#5E7370`, `#FFFFFF` 로 보고한다. 같은 값의 `color/cyan/41 18%` = `#5e73702e` 로 알파를 추정했다 ([추정]).
- 값이 없는 신규 토큰의 수치는 **예시(proposal)** 이며 디자이너 확정 전 구현에 쓰지 않는다.

---

## 1. 3-Tier 구조 (RECOMMENDED)

```
Tier 1  Primitive   --haru-{category}-{name}-{step}      원시 값. 컴포넌트/화면에서 직접 사용 금지
Tier 2  Semantic    --{category}-{role}-{variant}        역할 이름. Tailwind theme 이 여기만 노출
Tier 3  Component   --{component}-{part}-{state}         Shared UI 내부 전용 (packages/ui)
```

| 규칙 | 내용 |
|---|---|
| 참조 방향 | Component → Semantic → Primitive (역방향·건너뛰기 금지) |
| 네이밍 | kebab-case, 영어, 숫자 step 은 primitive 에만. semantic 이름에 색 이름(teal, pink) 금지 — 예외: capability 매핑 토큰 |
| 상태 접미사 | `-hover`, `-pressed`, `-disabled`, `-selected`, `-focus` |
| Tailwind | semantic 만 노출: `bg-surface-glass`, `text-fg-primary`, `rounded-card`, `shadow-glass-rest`, `p-4`(기본 spacing 스케일과 값 동일 = override 아님). arbitrary value 금지. **Tailwind 메이저 버전은 NEEDS DECISION** → 아래 §1.1 두 형태 모두 같은 CSS Var 를 참조하도록 작성 |
| Tailwind 기본값 override | radius·color·shadow 는 Tailwind 기본 이름(`rounded-sm/md/lg`, `shadow-md`, `text-gray-*`)을 **재정의하지 않고** 역할 이름으로 추가한다. 기본 팔레트·radius 유틸 사용은 lint 로 금지 (RECOMMENDED) |
| 위치 | `packages/design-tokens` (Stage 1, development-agent). 이 문서는 명세만 |
| Figma 정리 | 승인 후 Figma Variable 이름을 semantic 이름에 맞춰 rename 요청 (design-agent 는 Figma 수정 안 함) |

---

### 1.1 Tailwind 매핑 형태 (버전 결정 전 — 둘 다 같은 CSS Var 참조)

| 형태 | 예시 (개념 표기, 구현 코드 아님) |
|---|---|
| v3 계열 `tailwind.config` `theme.extend` | `colors.fg.primary = var(--color-fg-primary)`, `borderRadius.card = var(--radius-card)`, `boxShadow['glass-rest'] = var(--shadow-glass-rest)`, `screens.md = <--bp-md 값>` (screens 는 CSS Var 불가 → 빌드 상수로 같은 값 사용) |
| v4 계열 CSS-first `@theme` | `--color-fg-primary`, `--radius-card`, `--shadow-glass-rest`, `--breakpoint-md` 를 `@theme` 네임스페이스 이름으로 선언 → 같은 유틸 이름(`text-fg-primary`, `rounded-card`, `shadow-glass-rest`, `md:`) 생성 |

두 형태 모두 유틸 이름이 동일하도록 이 문서의 "Tailwind token" 열을 기준으로 한다. v4 네임스페이스 규칙(`--color-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`)과 충돌하지 않게 semantic CSS Var 접두사를 맞췄다.

---

## 2. Color

### 2.1 Primitive — HARU pastel accents (Figma `17:129` accents/*, [추정] Collection "Colors")

| Figma Variable | Value | 중복 이름 (같은 값) | Primitive CSS Var | 비고 |
|---|---|---|---|---|
| `accents/blue` | `#7faec1` | `color/azure/63`, `misc/tab-bar-selection` | `--haru-palette-blue` | |
| `accents/cyan` | `#a0ccdd` | — | `--haru-palette-cyan` | Pagetag, age Tag |
| `accents/teal` | `#85bfb6` | — | `--haru-palette-teal` | 브랜드 주 색 (Accent Button, 선택 칩, 진행 바) |
| `accents/mint` | `#b0cfc0` | `color/spring green/75` | `--haru-palette-mint` | |
| `accents/green` | `#90bfad` | — | `--haru-palette-green` | Self-Direction 배지 |
| `accents/yellow` | `#d0cca1` | `color/yellow/72` | `--haru-palette-yellow` | 별점, 스티커 gradient 시작 |
| `accents/orange` | `#eed2bd` | — | `--haru-palette-orange` | 스티커 gradient 끝 |
| `accents/red` | `#e8a9a0` | — | `--haru-palette-red` | 사용 화면 없음 (error 후보이나 대비 부족) |
| `accents/pink` | `#efc3d4` | `color/rose/85`, `Beauty Bush` | `--haru-palette-pink` | Emotion 배지·바 |
| `accents/purple` | `#c9b8d4` | — | `--haru-palette-purple` | IM 배지 |
| `accents/indigo` | `#a9b6cf` | — | `--haru-palette-indigo` | 사용 화면 없음 |
| `accents/brown` | `#beafa4` | — | `--haru-palette-brown` | 사용 화면 없음 |
| `color/violet/67` | `#ac93c4` | — | `--haru-palette-violet` | `31:102` IM 진행 바에만. purple 과 불일치 → 통합 NEEDS DECISION |

### 2.2 Primitive — HARU neutrals (Figma `17:367` HARU semantic + auto-generated)

| Figma Variable | Value | 중복 이름 | Primitive CSS Var | 비고 |
|---|---|---|---|---|
| `text-primary` | `#4a5f5c` | `color/cyan/33`, `Nandor` | `--haru-ink-700` | |
| `text-button` | `#5e7370` | `color/cyan/41`, `Corduroy`; shadow ink `rgb(94,115,112)` | `--haru-ink-600` | Glass 버튼 라벨, 칩 라벨, 그림자 색 |
| `text-secondary` | `#7d9291` | `color/grey/53`, `Juniper` | `--haru-ink-500` | 대비 미달 (DESIGN_SYSTEM §12) |
| `color/grey/64` | `#9aabaa` | `Edward` | `--haru-ink-400` | 입력 라벨, 캡션 — 대비 미달 |
| (raw) | `#3b4a48` | — | `--haru-ink-800` (신규) | 입력 값·설문 질문 `179:1787` |
| (raw) | `#b3c0bf` | — | `--haru-ink-300` (신규) | 차트 값·카운터 — 텍스트 사용 불가 수준 |
| (raw) | `#8fa3a1`, `#6b807d`, `#6f8c88`, `#6ba99f` | — | 폐기 → semantic 로 흡수 | 화면별 임의 회색·링크색 (§6) |
| `color/spring green/90 2` | `#dbeee7` | 배경 gradient 시작 | `--haru-mist-100` | PromptPill tinted 배경 |
| `color/spring green/86` | `#d3e3de` | 배경 gradient 중간 | `--haru-mist-200` | |
| `color/blue/81` | `#c7c9d7` | 배경 gradient 끝 | `--haru-dusk-200` | "Not selected" Tag 배경 |
| `color/grey/92` | `#f0eee6` | — | `--haru-paper-100` | `86:482` 코칭 설명 배경 |
| (raw) | `rgba(233,240,237,.8/.9)` | — | `--haru-mist-50` (신규, 불투명 `#edf3f1` 로 정규화 제안) | 설문 옵션·IconButton 배경 |
| `grays/white`, `color/white/solid`, `White` | `#ffffff` | + `backgrounds/primary·tertiary·grouped-secondary`, `misc/segmented-selected-fill`, `misc/text-field-bg` | `--haru-white` | 8개 이름 |
| `grays/black` | `#000000` | `labels/primary` | `--haru-black` | HARU 화면 사용 없음 |

### 2.3 Primitive — 흰색 알파 (glass fill)

| Figma Variable | Value | Primitive CSS Var | 통합 제안 |
|---|---|---|---|
| `color/white/ 0_2%` (`White 0.2%`) | `#ffffff01` | — | **폐기** (사실상 투명) |
| (raw) | `rgba(255,255,255,.5)` | `--haru-white-a50` | 카드 스택 뒷장 |
| (raw) | `rgba(255,255,255,.62)` | → `--haru-white-a50` 로 흡수 | 진행 바 track |
| `glass-fill` | `#ffffffbd` (74%) | `--haru-white-a74` | **유지** |
| `color/white/ 82%` (`White 82%`) | `#ffffffd1` | → `--haru-white-a74` 또는 `a90` 흡수 | 리포트 카드 |
| `color/white/ 85%` (`White 85%`) | `#ffffffd9` | → `--haru-white-a90` 흡수 | |
| `color/white/ 86%` (`White 86%`) | `#ffffffdb` | → `--haru-white-a90` 흡수 | |
| `glass-fill-strong` | `#ffffffe5` (90%) | `--haru-white-a90` | **유지** |

### 2.4 Primitive — 선·그림자 잉크

| Figma Variable | Value | Primitive CSS Var | 비고 |
|---|---|---|---|
| `stroke` | `#5e73702e` (18%) | `--haru-ink-600-a18` | 중복: `color/cyan/41 18%`, `Corduroy 18%` |
| `color/cyan/41 30%` (`Corduroy 30%`) | `#5e73704d` | `--haru-ink-600-a30` | PageIndicator 비활성 dot |
| (raw) | `rgba(94,115,112,.12/.13)` | `--haru-ink-600-a12` | 진행 바 track, FieldGroup 구분선 |
| (raw) | `rgba(74,95,92,.32)` | — | Home Indicator (구현 안 함) |

### 2.5 iOS 26 system 변수 (`17:129` grays/backgrounds/fills/labels/separators/misc)

HARU 화면에서 **사용 확인된 것은 `backgrounds/primary`(= white), `backgrounds/secondary`/`grouped-primary`(#f2f2f7, 변수 목록에만), `grays/gray-5` #e5e5ea(빈 별), `fills/vibrant-tertiary` #ededed 뿐** [DC var defs]. 나머지는 kit 기본값.

| Figma Variable 그룹 | Values | 제안 |
|---|---|---|
| `grays/gray` … `gray-6` | `#8e8e93` `#aeaeb2` `#c7c7cc` `#d1d1d6` `#e5e5ea` `#f2f2f7` | primitive 로 가져오지 않음. 빈 별은 `--haru-ink-600-a18` 로 대체 제안 |
| `backgrounds/*` | white / `#f2f2f7` | HARU 는 gradient 배경 → 사용 안 함 |
| `fills/*` | `#78787833` … `#ededed` | 사용 안 함 |
| `labels/*` | `#000000`, `#3c3c4399` … | 사용 안 함 (HARU ink 사용) |
| `separators/*` | `#0000001f`, `#c6c6c8`, `#e6e6e6` | 사용 안 함 (`--haru-ink-600-a12`) |
| `misc/alert-overlay` | `#29293a3b` | scrim 후보 → §4 |
| `misc/tab-bar-selection` | `#7faec1` (= accents/blue) | **실제 Tab Bar 선택은 text-primary + 중앙 teal** [DC] → 폐기 |
| `misc/text-field-outline`, `toggle-ax-label-off`, `segmented-selected-fill`, `text-field-bg` | iOS 기본 | Toggle 구현 시에만 재검토 |

### 2.6 Semantic color (Tier 2) — 제안

| Semantic CSS Var | Tailwind token | → Primitive | 용도 | 대비 메모 |
|---|---|---|---|---|
| `--color-fg-primary` | `text-fg-primary` | `--haru-ink-700` | 제목·본문 | white 6.81 ✓ |
| `--color-fg-strong` | `text-fg-strong` | `--haru-ink-800` | 입력 값·질문 | 9.30 ✓ |
| `--color-fg-secondary` | `text-fg-secondary` | `--haru-ink-600` (**변경 제안**, 현 `#7d9291` 대체) | 보조 텍스트·캡션 | white 5.05 · glass-strong 4.80–4.94 · glass(74%) 4.83(배경 시작)–**4.48(배경 끝)** → 배경 끝 쪽 glass 위 **비선택 Tab 라벨 `25:38` 에서 미달** — NEEDS DECISION (§7 T-2) |
| `--color-fg-tertiary` | `text-fg-tertiary` | 현 `#7d9291` (`--haru-ink-500`) | **18.66px bold / 24px 이상 텍스트, 장식 텍스트만** | 3.29 on white |
| `--color-fg-disabled` | `text-fg-disabled` | `--haru-ink-500` + opacity | disabled 라벨 | WCAG 예외 |
| `--color-fg-on-accent` | `text-fg-on-accent` | `--haru-white` | Accent 위 텍스트 | **teal 위 2.07 ✗** → `--color-action-primary-bg` 조정 필요 |
| `--color-fg-link` | `text-fg-link` | `--haru-ink-700` + underline | TextLink | `#6b807d`(3.16), `#6ba99f`(2.69) 폐기 |
| `--color-bg-app-start/mid/end` | `bg-app` (gradient utility) | `--haru-mist-100` → `--haru-mist-200` → `--haru-dusk-200` | 화면 배경 | text-primary on end 4.14 ✗ (본문은 Surface 위에만) |
| `--color-surface-glass` | `bg-surface-glass` | `--haru-white-a74` | Glass 버튼, 칩, Tab Bar, IconButton | |
| `--color-surface-strong` | `bg-surface-strong` | `--haru-white-a90` | 카드, 버블, 시트 | |
| `--color-surface-solid` | `bg-surface-solid` | `--haru-white` | FieldGroup | |
| `--color-surface-subtle` | `bg-surface-subtle` | `--haru-mist-50` | 설문 옵션, 보조 버튼 배경 | |
| `--color-surface-tinted` | `bg-surface-tinted` | `--haru-mist-100` | PromptPill tinted | |
| `--color-surface-note` | `bg-surface-note` | `--haru-paper-100` | CoachingNote(neutral) | |
| `--color-border-subtle` | `border-subtle` | `--haru-ink-600-a18` | 칩 outline, 입력 outline | 1.26 — 비텍스트 경계 3:1 미달 → 선택 상태는 색 외 표시 병행 |
| `--color-divider` | `border-divider` | `--haru-ink-600-a12` | 구분선 | 장식 |
| `--color-action-primary-bg` | `bg-action-primary` | `--haru-palette-teal` (현재) | Accent Button, 선택 칩·옵션 | **NEEDS DECISION**: 흰 라벨 4.5:1 위해 더 진한 teal primitive(`--haru-teal-700` 예시 `#3f7f76` = 4.66:1) 추가 또는 라벨 색 변경 |
| `--color-action-primary-bg-hover/pressed` | `bg-action-primary-hover` / `bg-action-primary-pressed` | 현재 동일 색 + shadow 변화 (Figma `17:14/17:16`) | | |
| `--color-action-primary-bg-disabled` | `bg-action-primary-disabled` | teal + opacity 0.5 (`17:18`) | | |
| `--color-action-secondary-bg` | `bg-action-secondary` | `--color-surface-glass` | Glass Button | label `--haru-ink-600` 4.48 on glass ✗(근소) |
| `--color-selected-bg` / `--color-selected-fg` | `bg-selected` | = action-primary | Chip·Radio 선택 | |
| `--color-indicator-active` / `-inactive` | `bg-indicator-active` / `bg-indicator-inactive` | `--haru-ink-600` / `--haru-ink-600-a30` | PageIndicator | |
| `--color-progress-fill` / `-track` | `bg-progress-fill` / `bg-progress-track` | `--haru-palette-teal` / `--haru-ink-600-a12` | ProgressBar | fill vs track 1.73(배경 끝)–1.94(배경 시작) ✗ → fill 진하게 NEEDS DECISION |
| `--color-rating-filled` / `-empty` | `text-rating-filled` / `text-rating-empty` | `--haru-palette-yellow` / `--haru-ink-600-a18` | StarRating | 1.64 ✗ → 숫자 라벨 병행 |
| `--color-scrim` | `bg-scrim` | **신규** (§4) | Sheet 뒤 | |
| `--color-focus-ring` | `ring-focus` | **신규** = `--haru-ink-700` | 포커스 | 6.81 on white, 3.28 on teal ✓(3:1) |
| `--color-status-{info,success,warning,error}-{bg,fg,border}` | `bg-status-error` 등 | **신규** (§4) | 알림·에러 | Figma 없음 |

### 2.7 Capability 색 매핑 (Domain semantic) — NEEDS DECISION

화면마다 매핑이 달라 단일 규칙이 없다 [DC].

| Capability (contracts key) | Tag/배지 (`76:440`, `163:2648`) | Growth themes 바 (`31:102`) | 제안 CSS Var | 제안 primitive (결정 필요) |
|---|---|---|---|---|
| `self_directed_agency` | green `#90bfad` | teal `#85bfb6` | `--color-capability-agency` | green 또는 teal 중 택1 |
| `emotion_regulation` | pink `#efc3d4` | pink `#efc3d4` | `--color-capability-emotion` | pink (일치) |
| `cognitive_flexibility` | cyan? (`86:397` "Cognitive Flexibility Day" 배지 cyan [S]) | blue `#7faec1` | `--color-capability-flexibility` | cyan 또는 blue |
| `intrinsic_motivation` | purple `#c9b8d4` | violet `#ac93c4` | `--color-capability-motivation` | purple 또는 violet |

각 capability 에 `-bg`(배지 배경), `-fg`(배지 텍스트, 4.5:1 충족 색), `-chart`(차트) 3종을 두는 것을 제안. 흰 글자 배지는 전부 미달이므로 `-fg` 는 진한 ink 계열 권장.

---

## 3. Typography

### 3.1 Figma Text Styles (`17:298`, Style — CONFIRMED 값)

| Figma Style | family / weight / size / line-height | Semantic CSS Var (제안) | Tailwind token | 화면 사용 |
|---|---|---|---|---|
| `iOS 26/Large Title` | SF Pro / 700 / 34 / 41 | `--text-large-title-*` | `text-large-title` | 없음 (화면 "Library"/"Progress" 는 28 Heavy 860 raw) |
| `iOS 26/Title 1` | SF Pro / 700 / 28 / 34 | `--text-title-1-*` | `text-title-1` | 페이지 제목 후보 |
| `iOS 26/Title 2` | SF Pro / 700 / 22 / 28 | `--text-title-2-*` | `text-title-2` | |
| `iOS 26/Title 3` | SF Pro / 590 / 20 / 25 | `--text-title-3-*` | `text-title-3` | |
| `iOS 26/Headline` | SF Pro / 590 / 17 / 22 | `--text-headline-*` | `text-headline` | 버튼 라벨(17/590) |
| `iOS 26/Body` | SF Pro / 400 / 17 / 22 | `--text-body-*` | `text-body` | |
| `iOS 26/Callout` | SF Pro / 400 / 16 / 21 | `--text-callout-*` | `text-callout` | 입력 값(16) |
| `iOS 26/Subheadline` | SF Pro / 400 / 15 / 20 | `--text-subheadline-*` | `text-subheadline` | 버블 제목(15/590) |
| `iOS 26/Footnote` | SF Pro / 400 / 13 / 18 | `--text-footnote-*` | `text-footnote` | 칩·링크 |
| `iOS 26/Caption 1` | SF Pro / 400 / 12 / 16 | `--text-caption-1-*` | `text-caption-1` | Tag, 캡션 |
| `iOS 26/Caption 2` | SF Pro / 400 / 11 / 13 | `--text-caption-2-*` | `text-caption-2` | Tab 라벨(11/510) |

각 스타일 = `-font-size`, `-line-height`, `-font-weight`, `-letter-spacing` 4개 변수 (RECOMMENDED). weight 는 스타일 기본값 + `--font-weight-{regular 400, medium 510, semibold 590, bold 700, heavy 860}` 조합.

### 3.2 Auto-generated 타이포 Variables (`17:367`) — 정규화 대상

| Figma Variable | Value | 문제 | 제안 |
|---|---|---|---|
| `font family/Font 1` | `SF Pro` | 의미 없는 이름 | `--font-family-sans` (값은 DESIGN_SYSTEM §2.3 결정) |
| `font size/9` | 9 | 11px 미만 (Boy/Girl/Not selected Tag, `163:2798`) | **폐기** → `caption-2` (11) |
| `font size/13` | 13 | = Footnote | `footnote` 로 흡수 |
| `font size/17` | 17 | = Body/Headline | 흡수 |
| `font weight/400·590·700` | 400/590/700 | 이름=값 | `--font-weight-*` 로 rename |
| `line height/11_25` | 11.25 | 9px × 1.25 | 폐기 |
| `line height/15_6` | 15.6 | 12 × 1.3 | `caption-1` 16 으로 흡수 |
| `line height/18_2` | 18.2 | 14 × 1.3 | `footnote` 18 흡수 |
| `line height/18_85` | 18.85 | 14.5 × 1.3 | 흡수 |
| `line height/20_4` | 20.4 | 17 × 1.2 | `body` 22 흡수 |
| `line height/22_1` | 22.1 | 17 × 1.3 | `body` 22 흡수 |
| `SF Pro/Bold` | family=Font 1, size=`font size/17` 또는 `/9`, lh=`line height/20_4` 또는 `/11_25` | **노드마다 바인딩이 다름** (`17:367` vs `179:1724` 결과) | 폐기 → text style 사용 |
| `SF Pro/Semibold` | size=`item spacing/12`, lh=`item spacing/12` (+ `11.8` raw) | **spacing 변수를 font-size/line-height 에 바인딩** | 폐기 → `caption-1` + weight 590 |
| `SF Pro/Regular` | size=`item spacing/12`, lh=`line height/15_6` | 동일 문제 | 폐기 → `caption-1` |

### 3.3 화면 raw 텍스트 크기 → 스케일 흡수 (RECOMMENDED, 디자이너 확인 필요)

| 화면 raw 값 (예 node) | 제안 스타일 | 비고 |
|---|---|---|
| 9 (`163:2798`), 10 (`163:2567` 차트 값, "Tap to recording"), 10.5 (요일) | `caption-2` 11 | WCAG 텍스트 확대 고려, 10px 이하 금지 |
| 11 (Tab 라벨), 11.5 (입력 라벨 `76:430`, eyebrow `179:1786`) | `caption-2` 11 | |
| 11.8 (PromptPill `139:2753`), 12, 12.5 (칩 `90:611`, 동의 문구) | `caption-1` 12 | PromptPill 은 부모가 소리 내 읽는 문장 → `footnote` 13 이상 권장 NEEDS DECISION |
| 13, 13.5 | `footnote` 13 | |
| 14 (`29:84`), 14.5 (설문 옵션) | `subheadline` 15 또는 신규 `callout-sm` 14 | NEEDS DECISION |
| 15 (`29:75`, 버블 `50:172`) | `subheadline` 15 | |
| 16 (입력 값, 버블 `88:840`) | `callout` 16 | |
| 17 (버튼, `91:692`) | `headline` / `body` 17 | |
| 18.5 (설문 질문 `179:1787`) | `title-3` 20 또는 `headline` 17 | |
| 21 Heavy (워드마크 `26:39`) | 로고 에셋 | 텍스트 스타일 아님 |
| 24 / 26 Heavy·Bold (StatTile `163:2546`, `163:2557`) | `title-2` 22 또는 신규 `display-number` | NEEDS DECISION |
| 28 Heavy 860 (`31:117`) | `title-1` 28 + weight heavy | Large Title 34 미사용 |

---

## 4. 누락 토큰 (신규 제안 — Figma 에 없음)

값은 **예시**이며 디자이너 확정 전 구현 금지. 확정 방식: 디자이너가 Figma Variable 로 추가 → design-agent 가 이 표 갱신.

| 범주 | CSS Var (제안) | Tailwind | 제안 기준 / 예시 | 필요 Stage | 라벨 |
|---|---|---|---|---|---|
| Focus | `--color-focus-ring`, `--focus-ring-width`, `--focus-ring-offset` | `ring-focus`, `ring-offset-*` | `--haru-ink-700`, 2px, 2px offset (white 6.81:1, teal 3.28:1 → 3:1 충족) | 1 | RECOMMENDED |
| Status | `--color-status-{info,success,warning,error}-{bg,fg,border,icon}` | `bg-status-error` 등 | bg = 파스텔 primitive(blue/green/yellow/red) 연한 톤, **fg = 4.5:1 충족 진한 톤 신규 primitive** (파스텔 red `#e8a9a0` 은 흰 배경 대비 부족) | 1 | NEEDS DECISION |
| Field error | `--color-field-border-error`, `--color-field-fg-error` | — | = status-error | 2 | NEEDS DECISION |
| Scrim / overlay | `--color-scrim` | `bg-scrim` | Figma "Deemed" `163:1807` 값 MCP 미확인; 후보 `misc/alert-overlay` `#29293a3b` 또는 ink 계열 알파 | 3 | NEEDS DECISION |
| Opacity | `--opacity-disabled` | `opacity-disabled` | 0.5 (Figma Button Disabled `17:10/17:18` [DC]) | 1 | CONFIRMED 값 / RECOMMENDED 이름 |
| Z-index | `--z-base 0`, `--z-sticky 10`(TopBar), `--z-tabbar 20`, `--z-sheet 40`, `--z-dialog 50`, `--z-toast 60` | `z-tabbar` 등 | 계층 순서만 제안 | 1 | RECOMMENDED |
| Motion duration | `--motion-duration-instant 100ms`, `-fast 160–180ms`, `-base 240–280ms`, `-slow 400–500ms`, `-pulse 1.2–2s` | `duration-fast` 등 | 로컬 프로토타입 값 [P]: press .18s, shadow .22s, sheet .24s, swipe .28s, progress .3s, pop-in .4s, fadein .5s, dot 1.2s | 1 | RECOMMENDED (Figma 근거 없음) |
| Motion easing | `--motion-ease-standard` = `cubic-bezier(.32,.72,.28,1)`, `--motion-ease-spring` = `cubic-bezier(.34,1.3,.64,1)`, `--motion-ease-linear` | `ease-standard`, `ease-spring` | `haru-material.css --haru-press-ease` [P], pop-in [P] | 1 | RECOMMENDED |
| Breakpoints | `--bp-md 600px`, `--bp-lg 1024px`, `--bp-short-height 500px`(가로 모드 판단) — 모두 예시 | v3 `screens.md/lg` · v4 `--breakpoint-md/lg` (height 조건은 커스텀 variant) | DESIGN_SYSTEM §11 | 1 | NEEDS DECISION |
| Layout | `--layout-min-width`(최소 지원 폭, 예시 320), `--layout-app-max-width`, `--layout-gutter`, `--layout-tabbar-height`, `--layout-safe-top/bottom` (= `env(safe-area-inset-*)`) | `max-w-app`, `px-gutter` | 앱 컬럼 최대폭 예시 480px; Tab Bar 70 + 하단 여백 [DC] | 1 | NEEDS DECISION (최대폭) |
| Touch | `--size-touch-min` | `min-h-touch min-w-touch` | 44 (rules/frontend 권장; PRD §11 은 "터치 타깃 충분히 확보" 만 명시) | 1 | RECOMMENDED |
| Icon size | `--size-icon-sm 16`, `-md 20`, `-lg 24` | `size-icon-md` | DESIGN_SYSTEM §7 | 1 | RECOMMENDED |
| Component sizes | `--size-button-md 45`, `--size-button-lg 56`, `--size-icon-button 38`, `--size-record-button 150`, `--size-tab-center 64`, `--size-medallion-{sm,md,lg}` | — | Figma `17:20`, `179:1746`(58→56), `78:158`, `163:1590`, `140:2971` [DC] | 1–4 | RECOMMENDED |
| Background gradient | `--color-bg-app-start/mid/end`, `--gradient-app` | `bg-app` | Figma raw `#dbeee7 → #d3e3de(46–52%) → #c7c9d7` | 1 | RECOMMENDED (중간 stop 위치 46% vs 52% 불일치) |
| Sticker gradient | `--gradient-reward` | `bg-reward` | yellow → orange 140° (`29:80`) | 4 | RECOMMENDED |
| Chart | `--color-chart-bar`, `--color-chart-bar-muted`, `--color-chart-bar-empty`, `--color-chart-label` | — | teal / teal 55% / ink 18% / 대비 충족 라벨색 (`163:2568`) | 7 | NEEDS DECISION |
| Material fallback | `--material-glass-fill-fallback` | — | §5.4 | 1 | RECOMMENDED |
| Dark mode | (없음) | — | DESIGN_SYSTEM §13 | — | NEEDS DECISION |

---

## 5. Spacing · Radius · Shadow · Material

### 5.1 Spacing (Figma `17:367` `item spacing/*` + 화면 raw)

| Figma Variable | Value | Scale CSS Var (제안) | Tailwind | 비고 |
|---|---|---|---|---|
| `item spacing/xxxs` | 2 | `--space-0-5` | `0.5` | |
| `item spacing/xxs` | 4 | `--space-1` | `1` | Pagination radius 에도 바인딩됨 (오용) |
| `item spacing/6` | 6 | `--space-1-5` | `1.5` | |
| `item spacing/7` | 7 | → 8 흡수 | — | 칩 gap `91:709` |
| `item spacing/xs` | 8 | `--space-2` | `2` | |
| `item spacing/10` | 10 | `--space-2-5` | `2.5` | |
| `item spacing/12` | 12 | `--space-3` | `3` | font-size 로도 바인딩 (§3.2) |
| `item spacing/14` | 14 | `--space-3-5` | `3.5` | |
| (raw) 16, 18, 20 | 16 / 18 / 20 | `--space-4` / → 20 / `--space-5` | `4` / `5` | 카드 padding 16·18·20 혼재 → 16·20 |
| (raw) 24, 26 | 24 / 26 | `--space-6` | `6` | 화면 좌우 gutter 24 (`30:87`) vs 26 (`179:1732`, 버튼 px 26) → **24 통일 제안** |
| (raw) 32 | 32 | `--space-8` | `8` | |
| 신규 | — | `--layout-gutter` = `--space-6` | `px-gutter` | |
| 신규 | — | `--size-touch-min` = 44 | `min-h-touch` | rules/frontend §9 |

Tailwind 기본 spacing 스케일(4px 기준)을 그대로 쓰고, 7 · 13 · 18 · 26 같은 비스케일 값은 금지 (RECOMMENDED).

### 5.2 Radius

Tailwind 기본 `rounded-sm/md/lg` 값(각각 다른 px)을 덮어쓰지 않도록 **역할 이름**을 사용한다 (RECOMMENDED).

| Figma Variable | Value | Semantic CSS Var | Tailwind | 사용처 / 흡수 대상 |
|---|---|---|---|---|
| (raw) 3, 4 | 3 / 4 | `--radius-indicator` = 4 | `rounded-indicator` | 버블 꼬리, PageIndicator, 진행 바 (`item spacing/xxs` 오용 대체) |
| (raw) 7, 8 | 7 / 8 | `--radius-control` = 8 | `rounded-control` | Checkbox(7), 차트 막대(8) |
| `corner radius/16` | 16 | `--radius-field` = 16 | `rounded-field` | TextArea, 설문 옵션 |
| (raw) 20, 22, 24 | 20 / 22 / 24 | `--radius-surface` = 22 또는 24 (NEEDS DECISION) | `rounded-surface` | StatTile 20, 버블·FieldGroup 22, 리포트 카드 24 |
| `radius-card` / `corner radius/28` | 28 | `--radius-card` = 28 | `rounded-card` | 덱 카드, 시트 (중복 2개 이름) |
| `corner radius/30` | 30 | → `--radius-card` 흡수 | — | ReflectionCard `91:691` |
| (raw) 32 | 32 | → `--radius-card` 흡수 (별도 32 단계 추가 여부 NEEDS DECISION) | — | 설문 카드 `179:1783` |
| `radius-pill` / `corner radius/100` | 100 | `--radius-pill` = 9999 | `rounded-pill` | 버튼·칩·Tab Bar (중복 2개 이름) |
| (raw) 19 (38px 원), 22 (44px 원) | — | `--radius-pill` | `rounded-pill` | IconButton, 스티커 아이콘 |
| (raw) 56 | 56 | 없음 | — | 기기 frame 모서리 — 구현 안 함 |

### 5.3 Shadow / Elevation (Effect Styles `17:367`)

| Figma Effect Style | 구성 (Figma 값) | Semantic CSS Var | Tailwind | 사용처 |
|---|---|---|---|---|
| `HARU/Glass Rest` | blur 24; drop (0,2) r4 ink 8%; drop (0,12) r28 ink 16%; drop (0,28) r56 ink 12%; inner (0,1.5) white 90%; inner (0,-1) ink 5% | `--shadow-glass-rest` + `--material-blur-rest` (24) + `--shadow-highlight` | `shadow-glass-rest` | Glass 버튼·카드 기본 |
| `HARU/Glass Raised` | blur 12; drop **(4,4)** r8 ink 10%; drop **(18,18)** r40 ink 20%; drop (0,4) r72 ink 14%; inner 동일 | `--shadow-glass-raised` | `shadow-glass-raised` | Hover |
| `HARU/Glass Pressed` | blur 24; inner (0,3) r8 ink 20%; inner (0,1) r3 ink 16%; drop (0,1) r3 ink 8% | `--shadow-glass-pressed` | `shadow-glass-pressed` | Pressed |
| `HARU/Shadow Rest` | Glass Rest 와 동일하나 첫 drop 이 **(0,6)** r4, blur 없음 | `--shadow-rest` | `shadow-rest` | 버블·칩 |
| `HARU/Icon Chip` | inner (0,1.5) white 50%; drop (0,4) r10 ink 10% | `--shadow-icon-chip` | `shadow-icon-chip` | 스티커 아이콘 `29:80` |
| (raw, 버튼 instance) | drop (0,12) r14 ink 16%, (0,2) r2 ink 8% | → `--shadow-glass-rest` 흡수 | — | `179:1746` 등 — 스타일 미바인딩 |
| (raw) | drop (0,6) r4 ink 8% 단일 | → `--shadow-rest` 흡수 | — | design context 에서 다층 그림자가 첫 레이어만 보고된 경우 포함 [추정] |

ink = `rgb(94,115,112)` (`--haru-ink-600`). Glass Raised 의 대각선 offset (4,4)/(18,18) 은 광원이 좌상단인 의도로 보이며 **로컬 CSS(0,4)/(0,18)/(0,36) 와 다름** → Figma 우선 (§6.4).

### 5.4 HARU Material (glass)

| 토큰 | Figma 근거 | CSS Var (제안) | 비고 |
|---|---|---|---|
| fill rest | `glass-fill` 74% | `--material-glass-fill` | |
| fill strong | `glass-fill-strong` 90% | `--material-glass-fill-strong` | |
| blur rest/pressed | effect blur 24 | `--material-blur-lg` = 24px | 화면 instance 는 12 (`backdrop-blur-[12px]`) → 12/24 두 단계 |
| blur raised/instance | effect blur 12, instance 6 (Hover) | `--material-blur-md` = 12px | |
| highlight | inner white 90% + ink 5% | `--shadow-highlight` | 모든 glass 공통 |
| saturate | Figma 없음, 로컬 CSS `saturate(1.35)` | 채택 안 함 (Figma 우선) | NEEDS DECISION |
| fallback | Figma 없음 | `--material-glass-fill-fallback` = `--haru-white-a90` | `backdrop-filter` 미지원·저사양·`prefers-reduced-transparency` 대응 (신규 제안) |

---

## 6. 정규화 (Normalization)

### 6.1 같은 값 · 여러 이름 (중복)

| Value | Figma 이름들 | 유지할 토큰 |
|---|---|---|
| `#5e7370` | `text-button`, `color/cyan/41`, `Corduroy` (+ 그림자 ink) | `--haru-ink-600` |
| `#4a5f5c` | `text-primary`, `color/cyan/33`, `Nandor` | `--haru-ink-700` |
| `#7d9291` | `text-secondary`, `color/grey/53`, `Juniper` | `--haru-ink-500` |
| `#9aabaa` | `color/grey/64`, `Edward` | `--haru-ink-400` |
| `#efc3d4` | `accents/pink`, `color/rose/85`, `Beauty Bush` | `--haru-palette-pink` |
| `#7faec1` | `accents/blue`, `color/azure/63`, `misc/tab-bar-selection` | `--haru-palette-blue` |
| `#b0cfc0` | `accents/mint`, `color/spring green/75` | `--haru-palette-mint` |
| `#d0cca1` | `accents/yellow`, `color/yellow/72` | `--haru-palette-yellow` |
| `#5e73702e` | `stroke`, `color/cyan/41 18%`, `Corduroy 18%` | `--haru-ink-600-a18` |
| `#ffffff` | `grays/white`, `color/white/solid`, `White`, `backgrounds/primary`, `backgrounds/tertiary`, `backgrounds/grouped-secondary`, `misc/segmented-selected-fill`, `misc/text-field-bg` | `--haru-white` |
| `#f2f2f7` | `grays/gray-6`, `backgrounds/secondary`, `backgrounds/grouped-primary`, `backgrounds/grouped-tertiary` | 가져오지 않음 |
| 28 | `radius-card`, `corner radius/28` | `--radius-card` |
| 100 | `radius-pill`, `corner radius/100` | `--radius-pill` |
| 흰색 74–90% | `glass-fill`, `color/white/ 82%·85%·86%`, `glass-fill-strong` | a74, a90 두 단계 |

### 6.2 자동 생성·의미 없는 이름 → rename 요청

| 현재 Figma 이름 | 문제 | 제안 이름 |
|---|---|---|
| `Corduroy`, `Nandor`, `Juniper`, `Edward`, `Beauty Bush`, `White`, `White 85%/82%/86%/0.2%`, `Corduroy 18%/30%` | 색 이름 생성기 이름, 알파가 이름에만 존재 | 삭제 (§6.1 토큰으로 대체) |
| `color/cyan/41`, `color/cyan/33`, `color/grey/53·64·92`, `color/spring green/75·86·90 2`, `color/blue/81`, `color/azure/63`, `color/rose/85`, `color/yellow/72`, `color/violet/67` | HSL 명도 기반 자동 이름, "90 2" 중복 접미사 | `haru/ink/*`, `haru/mist/*`, `haru/palette/*` |
| `item spacing/xxxs·xxs·xs·6·7·10·12·14` | named/numeric 혼재, font-size 에 오용 | `space/0-5 … space/8` |
| `corner radius/16·28·30·100` | 중복 | `radius/md, card, pill` |
| `font size/9·13·17`, `line height/11_25 … 22_1`, `font weight/*`, `font family/Font 1` | text style 과 중복·배율값 | 삭제 → text style + `font/family/sans` |
| `SF Pro/Bold`, `SF Pro/Semibold`, `SF Pro/Regular` | 노드마다 다른 size 바인딩 | 삭제 |
| `stroke weight/1` | 단일 값 | `border/width/hairline` |
| `stroke` | 역할 불명 | `border/subtle` |
| `Boolean` (true) | 용도 불명 | 삭제 |
| 컴포넌트 variant 오타 | `Titla type`, `sessopn`, `cppr/arrow_last`, `swape`, `Pagenation`, `purple icon`/`*_icon`, frame 이름 `Defult shelf`, `Deemed` | 철자 정리 |

### 6.3 Raw 값 → 스케일로 흡수 (화면 [DC] 에서 발견)

| Raw | 위치 (예) | → Token |
|---|---|---|
| `#3b4a48` | 입력 값 `76:431`, 설문 질문 `179:1787` | `--color-fg-strong` |
| `#8fa3a1`, `#9aabaa` | 헬퍼 `179:1736`, 입력 라벨, 캡션 | `--color-fg-secondary` (대비 충족 값으로) |
| `#6b807d`, `#6ba99f` | 동의 문구·링크 `179:1745`, "Show" `76:428` | `--color-fg-secondary` / `--color-fg-link` |
| `#6f8c88`, `#b3c0bf` | "MOMENT OF THE WEEK" `163:2634`, 차트 값 `163:2567`, 카운터 `179:1785` | `--color-fg-secondary` / `--color-chart-label` |
| `#85bfb6` (hex 직접) | Checkbox `179:1742`, 설문 선택 `179:1795`, 진행 바 `179:1780`, "+18%" `163:2558` | `--color-action-primary-bg` / `--color-progress-fill` (텍스트 사용 금지) |
| `rgba(233,240,237,.8/.9)` | 설문 옵션, 차트 IconButton | `--color-surface-subtle` |
| `rgba(255,255,255,.5/.62/.82/.85)` | 카드 스택, track, 리포트 카드 | a50 / a74 / a90 |
| `rgba(94,115,112,.12/.13)` | 진행 track, 구분선 | `--color-divider` |
| `rgba(133,191,182,.55)`, `rgba(133,191,182,.16)` + border `.35` | 차트 막대, Moment 카드 | `--color-chart-bar-muted`, `--color-surface-accent-subtle` (신규) |
| gradient `#daebe5 → #d0e1dc` | 캐릭터 영역 `163:2642` | 에셋 배경으로 처리 (토큰 아님) |
| `#101215` | Dynamic Island | 구현 안 함 |
| font 9/10/10.5/11.5/11.8/12.5/13.5/14/14.5/18.5/21/24/26 | 다수 | §3.3 |
| radius 3/7/15/19/20/22/24/30/32 | 다수 | §5.2 |
| padding 13/18/26 | Tag px 13, 카드 18, 버튼 px 26 | 12 / 16·20 / 24 |

### 6.4 로컬 CSS 와 Figma 차이 (Figma 우선, 로컬은 폐기 대상)

| 로컬 파일 | 항목 | 로컬 값 | Figma 값 | 판단 |
|---|---|---|---|---|
| `tokens/fig-tokens.css` | `--accents-*` | iOS 시스템 원색 (`--accents-blue: rgb(0,136,255)`, `--accents-teal: rgb(0,195,208)` …), 다크 모드 블록에 같은 이름 중복 선언 | HARU 파스텔 (`#7faec1` …) | **stale** — 사용 금지 |
| `tokens/fig-tokens.css` | placeholder | `--fill-tertiary-zzzz`, `--labels-controls-*-xxxx`, `--labels-*-yyyy` = `rgb(255,255,0)` / `rgb(0,255,255)` | 없음 | **폐기** |
| `tokens/fig-tokens.css` | `--component-stroke: var(--accents-indigo)` | indigo | Figma `stroke` = ink 18% | 폐기 |
| `tokens/colors-pastel.css` | accents 12색 | Figma 와 동일 ✓; dark/dim 블록도 같은 값 | 동일 | 값 참고 가능, dark 블록은 의미 없음 |
| `tokens/haru-material.css` | `--haru-shadow-raised` | `0 4px 8px .10, 0 18px 40px .20, 0 36px 72px .14` | (4,4) r8 .10, (18,18) r40 .20, (0,4) r72 .14 | **불일치** — Figma 채택 |
| `tokens/haru-material.css` | `--haru-shadow-rest` | `0 2px 4px .08, 0 12px 28px .16, 0 28px 56px .12` | Glass Rest 동일 ✓ / Shadow Rest 는 첫 레이어 (0,6) | Glass Rest 일치 |
| `tokens/haru-material.css` | `--haru-glass-blur` | `blur(24px) saturate(1.35)` | blur 24 (saturate 없음) | saturate 제외 |
| `tokens/haru-material.css` | `--haru-glass-fill` .74 / strong .9 | 일치 ✓ | `#ffffffbd` / `#ffffffe5` | 일치 |
| `tokens/haru-material.css` | `.haru-btn` font `590 17px/1`, padding `14px 26px`, color `#5E7370`; `.haru-tab` `510 15px` | raw | Button `17:20` 과 일치, tab 은 Figma 컴포넌트 없음 | 참고만 |
| `tokens/typography.css` | iOS text styles | 일치 ✓ | `17:298` | family 는 §2.3 결정 |
| `tokens/fonts.css` + `fonts/SF-Pro.ttf` | SF Pro 웹폰트 로드 | — | — | **배포 금지** (DESIGN_SYSTEM §2.3) |
| `tokens/spacing-radii.card.html` | sheet radius 34 / 58 / 38 (iPad) | iOS kit 값 | HARU Figma 에 없음 | 채택 안 함 |

---

## 7. 승인 체크리스트 (Design Token)

| # | 결정 | 권장 | 라벨 |
|---|---|---|---|
| T-1 | 3-tier 구조·네이밍 규칙 (§1) | 채택 | RECOMMENDED |
| T-2 | `--color-fg-secondary` 를 `#5e7370` 계열로 재지정, 현 `#7d9291` 은 tertiary(대형·장식)로 강등. **남는 공백**: `#5e7370` 도 glass(74%) over 배경 끝 4.48 → 비선택 Tab 라벨(11px) 미달. 추가 조치 택1: ① Tab 라벨 = `--color-fg-primary`(6.05) + weight 로 선택 구분 ② secondary 를 더 진한 ink 로 (예시 `#586d6a` = glass 끝 4.89 / white 5.51) ③ Tab Bar fill 을 strong 으로 (4.80) | 채택 | NEEDS DECISION |
| T-3 | Accent(teal) 위 흰 라벨 2.07:1 해결 방식: ① 진한 teal primitive 추가 ② 라벨 색 변경 ③ Accent 를 대형 텍스트 전용으로 | ① 검토 | NEEDS DECISION (디자이너) |
| T-4 | Capability 색 매핑 (§2.7) | 단일 매핑 + fg/bg/chart 분리 | NEEDS DECISION |
| T-5 | 흰색 알파 3단계, radius 6단계, 카드 radius 값 | 채택 | NEEDS DECISION |
| T-6 | 화면 raw 텍스트 크기 흡수표 (§3.3), 최소 11px | 채택 | NEEDS DECISION |
| T-7 | 상태 색·focus·scrim·z-index·motion·breakpoint 신규 토큰 (§4) | 채택 후 값 확정 | NEEDS DECISION |
| T-8 | Figma Variable rename/삭제 요청 (§6.2) — 디자이너 작업 | 요청 | RECOMMENDED |
| T-9 | 로컬 `_ds` CSS 는 참조 금지, Figma 값만 사용 (§6.4) | 채택 | RECOMMENDED |
