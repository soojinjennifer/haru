# HARU Design System

Status: DRAFT v2 — Stage 0 산출물 (critic 리뷰 반영 + Frontend-only 정렬, 2026-09-14), 사용자 승인 대기
Based on: Figma `YWWu3AFEJpRxvw0T5klq0k` page `8:2` (`17:366` Foundations, `17:367` HARU Components, `17:368` iOS 26 Components) + page `16:2` 화면 (2026-09-14 확인), PRD v1.4 §7.5 · §11, `.claude/rules/frontend.md`, 로컬 참고 `$HARU_ONEDRIVE/디자인/**`; Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `.claude/rules/frontend.md` §6·§10, `.claude/rules/qa.md`
Author: design-agent (2026-09-14)
관련 문서: 토큰 이름·값 → `docs/DESIGN_TOKEN_MAP.md`, 컴포넌트 → `docs/COMPONENT_MAP.md`

라벨: `CONFIRMED` / `RECOMMENDED` / `NEEDS DECISION`. 검증: [S] screenshot · [DC] design context · [M] metadata · [P] 로컬 프로토타입

> 이 문서의 규칙·제안은 **토큰 이름으로만** 기술한다 (값은 `docs/DESIGN_TOKEN_MAP.md` 에만 있다). Figma·프로토타입에서 관찰한 수치는 "현황" 사실 기록으로만 남기며 구현 값으로 쓰지 않는다. 신규 토큰 이름은 모두 제안(TOKEN_MAP §4).

---

## 1. Color

### 1.1 현재 Figma 상태 (CONFIRMED)

- Design Guide 제목 "HARU — iOS 26 Design System (Pastel)" (`17:342`). iOS 26 커뮤니티 kit 의 semantic 색 이름(`accents/*`, `grays/*`, `backgrounds/*`, `fills/*`, `labels/*`, `separators/*`, `misc/*`)에 **HARU 파스텔 accent 12색**을 덮어쓴 구조 [S][DC].
- 실제 HARU 화면은 iOS `labels/*`·`backgrounds/*` 를 거의 쓰지 않고, 별도의 HARU 변수(`text-primary`, `text-secondary`, `text-button`, `glass-fill`, `glass-fill-strong`, `stroke`)와 **자동 생성 이름 변수**(`color/cyan/41`, `Corduroy` …) + **raw hex** 를 섞어 쓴다 [DC].
- 화면 배경은 모든 frame 에서 세로 gradient (mist → dusk) 이며 **변수가 아니다** [DC].
- 브랜드 주 색 = `accents/teal` (Accent Button, 선택 칩, 선택 설문 옵션, 진행 바, 탭 중앙 버튼).
- 상태 색(error/success/warning/info) **없음**. `accents/red` 는 파스텔이라 텍스트·아이콘으로 쓸 수 없다 (§12).

### 1.2 역할 규칙 (RECOMMENDED)

| 역할 | Semantic token | 규칙 |
|---|---|---|
| 본문·제목 | `--color-fg-primary`, `--color-fg-strong` | 모든 정보성 텍스트 기본 |
| 보조 텍스트 | `--color-fg-secondary` | 현재 Figma `text-secondary` 는 AA 미달 → 토큰 재지정 NEEDS DECISION |
| 장식·대형 텍스트 | `--color-fg-tertiary` | 18.66px bold / 24px 이상, 또는 정보 없는 장식만 |
| 화면 배경 | `--color-bg-app-*` | 텍스트를 배경 위에 직접 두지 않는다 — Surface 위에만 (배경 하단 대비 4.14:1) |
| 카드/시트/버블 | `--color-surface-strong` | |
| 버튼·칩·탭바 | `--color-surface-glass` | |
| 주요 행동 | `--color-action-primary-bg` + `--color-fg-on-accent` | 라벨 대비 결정 전까지 **Stage 1 구현 차단 항목** |
| 선택 | `--color-selected-*` | 색만으로 선택 표시 금지 — 체크 아이콘/굵기/`aria-pressed` 병행 (WCAG 1.4.1) |
| 역량 | `--color-capability-{agency,emotion,flexibility,motivation}-{bg,fg,chart}` | 매핑 NEEDS DECISION (TOKEN_MAP §2.7) |
| 상태 | `--color-status-*` | 신규 (TOKEN_MAP §4) |

---

## 2. Typography

### 2.1 스케일 (CONFIRMED: Figma `17:298`)

iOS 26 text styles 11종 (Large Title 34/41 700 … Caption 2 11/13 400), family "SF Pro". 화면은 이 스타일을 **거의 바인딩하지 않고** raw 크기 17종(9 ~ 28)과 weight 510/590/700/860 을 사용한다 [DC]. 흡수 규칙은 TOKEN_MAP §3.3.

### 2.2 규칙 (RECOMMENDED)

- 최소 텍스트 = `caption-2` 스타일 (TOKEN_MAP §3.1). 그보다 작은 Figma raw 크기 사용 금지 (현황: `163:2798`, `163:2567`, "Tap to recording" — TOKEN_MAP §3.3).
- 부모가 소리 내 읽는 Prompt 문장은 최소 `footnote` 스타일 — 현황 `139:2753` 은 그보다 작음. NEEDS DECISION.
- 줄 높이는 text style 값만 사용 (`line height/20_4` 같은 배율 변수 폐기).
- 사용자 글자 크기 확대(브라우저 zoom 200%, iOS Dynamic Type 은 WebView 설정에 따름)에서 레이아웃 유지 — 고정 높이 텍스트 컨테이너 금지 (현재 Figma 는 절대 좌표 배치 다수).
- 워드마크 "HARU" (`26:39`, `179:1707`) 는 텍스트가 아니라 **로고 에셋**으로 분리 RECOMMENDED.
- Heavy(860) 는 페이지 대제목·수치에만.

### 2.3 폰트 라이선스 — **NEEDS DECISION** (Stage 1 차단)

| 사실 | 근거 |
|---|---|
| Figma 모든 텍스트 = "SF Pro" | `17:298`, `font family/Font 1` [DC] |
| 로컬 프로토타입이 `SF-Pro.ttf` (23MB) 를 `@font-face` 로 로드 | `_ds/…/fonts/SF-Pro.ttf`, `tokens/fonts.css` |
| Apple SF Pro 폰트 라이선스는 Apple 플랫폼(iOS/iPadOS/macOS/tvOS)용 UI 목업·개발 용도로 사용을 한정하는 것으로 알려져 있음 | **법무 확인 필요** — design-agent 는 원문 재확인을 하지 않았다 |

**위험**: SF Pro 를 웹폰트로 번들·배포하거나 Android(Capacitor)·일반 웹 브라우저에서 표시하는 것은 라이선스 위반 가능성이 높다. 로컬 `SF-Pro.ttf` 는 **어떤 빌드에도 포함하지 않는다** (RECOMMENDED, 결정 전 기본값).

| 옵션 | 내용 | 장점 | 단점 |
|---|---|---|---|
| A. System font stack | `-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | 라이선스 부담 없음, 0KB. iOS/macOS 에서는 OS 가 SF Pro 로 렌더 (Figma 와 동일) | Android=Roboto, Windows=Segoe UI → 플랫폼별 폭·weight 차이 (510/590/860 이 500/600/800 으로 스냅). Visual QA 기준을 iOS 로 한정해야 함 |
| B. 라이선스된 웹폰트 1종 (예: Inter — SIL OFL, variable weight) | 모든 플랫폼 동일 렌더 | 플랫폼 일관성, Visual QA 1기준 | Figma 와 글자 폭 차이 → Figma 폰트 교체 또는 허용 오차 합의 필요, 웹폰트 로딩(서브셋·`font-display`) |
| C. 하이브리드 | Apple = system(SF), 그 외 = Inter | iOS 는 Figma 와 동일 | 두 폰트 metric 차이로 레이아웃 QA 2벌 |

design-agent 는 결정하지 않는다. 결정 시 필요한 후속: Figma 텍스트 스타일 family 갱신 여부, TOKEN_MAP `--font-family-sans` 값, Visual QA 허용 오차.

---

## 3. Spacing

- Figma 변수 `item spacing/*` (2, 4, 6, 7, 8, 10, 12, 14) + 화면 raw 16/18/20/24/26/32 [DC]. 이름 체계가 named(xxxs/xxs/xs)와 numeric(6/7/10/12/14)으로 섞여 있다.
- 규칙 (RECOMMENDED): `--space-*` 스케일만 사용 (TOKEN_MAP §5.1). 화면 좌우 = `--layout-gutter`, 카드 내부 padding = `--space-4` 또는 `--space-5`, 세로 섹션 간격 = `--space-6` / `--space-8`, 칩 gap = `--space-2`.
- 모든 인터랙티브 요소 최소 `--size-touch-min` (RECOMMENDED, TOKEN_MAP §4) — 시각 크기가 작으면 hit area 로 확장.

## 4. Radius

- 현황: 사용 값 13종. → 역할 이름 6단계 `--radius-indicator` · `--radius-control` · `--radius-field` · `--radius-surface` · `--radius-card` · `--radius-pill` 로 통합 제안 (Tailwind 기본 `rounded-sm/md/lg` 를 덮어쓰지 않음). 카드 계열은 `surface` / `card` 두 단계로 (TOKEN_MAP §5.2, NEEDS DECISION).
- 원형 요소(IconButton, 탭 중앙 버튼, 메달리온)는 `pill`.

## 5. Shadow / Elevation

| 레벨 | Token | 사용 |
|---|---|---|
| 0 | 없음 | 배경 위 텍스트, 리스트 내부 행 |
| rest | `--shadow-rest` | 버블, 칩, 스티커 |
| glass-rest | `--shadow-glass-rest` | 버튼·카드 기본 |
| glass-raised | `--shadow-glass-raised` | hover(포인터 기기), 드래그 중 카드 |
| glass-pressed | `--shadow-glass-pressed` | 눌림 |
| icon-chip | `--shadow-icon-chip` | 아이콘 배지 |
| sheet | **신규 필요** | 시트·Drawer (Figma "Deemed" 시트는 Glass 계열 추정 [S]) |

그림자 색은 항상 ink(`--haru-ink-600`) 계열, 순수 검정 금지 (CONFIRMED: Figma effect 값).

## 6. HARU Material (Glass)

- Figma: `HARU Material 17:332` (Glass Rest / Raised / Pressed) + 재사용 복제 `16:24` [S]. = 반투명 흰 fill + background blur + 다층 ink 그림자 + 상단 흰 inner highlight.
- 규칙 (RECOMMENDED):
  1. Glass 는 **gradient 배경 위 1단계**에만 사용. Glass 위에 Glass 중첩 금지 (대비·성능).
  2. 텍스트가 많은 카드는 `fill-strong` (대비 확보: `--color-fg-secondary` 가 strong 위에서 더 높음).
  3. `backdrop-filter` 미지원·`prefers-reduced-transparency: reduce`·저사양 기기에서는 `--material-glass-fill-fallback` 불투명 fill 로 대체.
  4. 스크롤 리스트 안의 반복 요소(서재 행 등)에는 blur 를 쓰지 않고 fill 만 사용 — Capacitor WebView 스크롤 성능 (NEEDS 확인: Stage 3 실기기).
  5. Press 피드백 = shadow 전환 + scale (§9), 색 변화 없음 (Figma Button Pressed 는 색 동일 [DC]).

## 7. Iconography

| 항목 | 현황 | 제안 |
|---|---|---|
| 컴포넌트 세트 | `Icon 50:157` 15개 — variant 이름 비일관 (`shape11`, `13`, `swape`, `shape=icon, Property 2=reply_all`) [M][S] | 이름 = 의미 (`star-filled`, `thumb-up`, `sticker-attend`) 로 정리 요청 |
| 컴포넌트 밖 아이콘 | settings, close, back, forward, refresh, mail, Google 로고, mic, pause, chevron-down, book(탭), chart(탭), download, list, check(체크박스), flip — 화면 frame 안의 개별 SVG [DC] | Icon 세트로 편입 |
| 스타일 | 둥근 선형(stroke) + 일부 filled(star, thumb), 색 = ink 계열 | stroke 두께·크기 그리드(`--size-icon-*`) 명세 누락 → NEEDS DECISION |
| 크기 | 12, 13, 15, 18, 19, 20, 21, 24, 26, 30 혼재 | `--size-icon-sm` / `--size-icon-md` / `--size-icon-lg` 3단계 제안 (값: TOKEN_MAP §4) |
| 누락 | apple, alert/error, wifi-off(offline), cloud-upload, trash, play/pause(클립), share, lock(동의), info, calendar/time(Context), plus(책 등록), search | Stage 별 필요 (FRONTEND_IMPLEMENTATION_PLAN) |
| 라이브러리 | 없음 | Figma SVG export 자산화 vs 오픈소스 아이콘 라이브러리(추가 시 승인) — NEEDS DECISION |
| 접근성 | — | 의미 있는 아이콘 = `label` 필수, 장식 = `aria-hidden`. 아이콘 단독 버튼은 IconButton 만 사용 |
| 브랜드 로고 | Google "G" (`179:1710`) | Google/Apple 브랜드 가이드 준수 에셋 사용 (임의 재작성 금지) |

## 8. Illustration · Character Assets

| 에셋 | Figma node | 로컬 파일 | 사용 화면 | 확인 사항 |
|---|---|---|---|---|
| Hello + Heart (전신) | `163:2529` "Haru_Hello_Heart_t 1" | `$HARU_ONEDRIVE/Chracter/Haru_Hello_Heart_t*.png/.svg`, `$HARU_ONEDRIVE/디자인/하트 하루몬스터.png` | `26:21`, `179:1701`, `179:1809` | |
| Hello (헤드폰) | `163:2530` "HARU_Hello_t 1" | `$HARU_ONEDRIVE/Chracter/HARU_Hello_t*.png/.svg`, `$HARU_ONEDRIVE/디자인/헤드폰 하루몬스터.png` | `28:51`, `29:62`, `179:1748`, `179:1820` | |
| Bookworm (안경·헤드폰·책) | `163:2536`, `163:2542` | `$HARU_ONEDRIVE/디자인/안경 쓴 책벌레 민트 하루.png` | `31:102`, `110:522` | |
| Home character crop | `163:2532` "asset/home-character" | — | `26:21` | |
| Avatar medallion (보라 gradient 배경 합성) | `163:2528` "asset/avatar-medallion" | — | `28:51` | 배경이 이미지에 구워져 있음 → 토큰 배경과 분리 필요 |
| 캐릭터 배경 | — | `$HARU_ONEDRIVE/디자인/캐릭터 배경.png`, `$HARU_ONEDRIVE/Chracter/HARU_Back.png` | 미사용 | |
| 책 표지 | `145:929–145:1010`, `163:2531–2534` | `$HARU_ONEDRIVE/디자인/책이미*.jpg` | 서재·카드 | **실제 출판 표지** |

위험·결정 (NEEDS DECISION):
1. **소유권·라이선스 불명**: 캐릭터는 사실적 3D 털 질감 스타일이며 제작 방식(생성형 AI 여부 포함)과 상업 이용 권리가 문서화되어 있지 않다 — 확인 필요 (PLANNING R-10).
2. **책 표지 사용권**: 실제 출판사 표지 → 개발 fixture 에는 가상 표지/placeholder 사용 RECOMMENDED, 운영 표지는 권리 확보 후 (PLANNING R-09).
3. **포맷**: PNG 1.0–1.5MB, SVG 1.4–1.5MB (크기상 래스터 내장 SVG 로 추정 [M]) → WebP/AVIF 1x/2x/3x + 투명 배경 원본 필요.
4. **애니메이션 에셋 없음**: PRD FR-11 경청 표정·동작(고개 끄덕임), §7.5 완료 애니메이션, 인사 동작 — 정지 이미지뿐. 포맷(Lottie/Rive/스프라이트/비디오) 결정 + 라이브러리 도입 시 승인 필요. **Stage 4 차단**.
5. **대체 텍스트**: 캐릭터는 대부분 장식 → `alt=""`, 상태 전달(듣는 중 등)은 텍스트/`aria-live` 로 병행.

---

## 9. Motion

### 9.1 존재하는 것

| 모션 | 출처 | 정의 | PRD 연결 |
|---|---|---|---|
| Press | Figma Button State Rest→Pressed (`17:4→17:8`) [DC]: shadow `glass-rest → glass-pressed`; 로컬 `.haru-pressable` [P]: `transform .18s`, `box-shadow .22s`, pressed `translateY(1px) scale(.97)`, hover `translateY(-1px)` + raised | ease `cubic-bezier(.32,.72,.28,1)` [P] | 전 인터랙티브 |
| **Record pulse** | 로컬 `haru-pulse` [P]: box-shadow ring `0 → 16px`, teal 50% → 0, 0/100% ↔ 50% | 주기 값은 파일에서 추출 못함 (**확인 필요**) | **§7.5 세션 준비 "녹음 버튼 맥동"** — Figma 에는 정지 상태만 (`163:1590` 이중 링 [S]) |
| Ring ripple | `haru-ring` [P]: `scale(.82) → 1.45`, opacity .5 → 0 | 주기 확인 필요 | 녹음 중 표시 후보 |
| Level bars | `haru-bar` [P]: `scaleY(.35) ↔ 1` | — | **§7.5 / FR-11 경청 인터랙션 후보** (캐릭터 애니메이션 대체 아님) |
| Typing dots | `haru-dot` [P]: opacity .25 ↔ 1, 1.2s infinite, paused 시 `none` | — | 로딩·"듣는 중" 표시 후보 |
| Sheet enter | `haru-sheet` [P]: `translateY(40px) → 0`, fade; `transform .24s` | — | 시트·Prompt Drawer |
| Fade in / Pop in | `haru-fadein .5s ease` (Library 파일은 `opacacity` 오타로 opacity 미적용) [P], `haru-pop-in .4s cubic-bezier(.34,1.3,.64,1)` [P] | — | 화면 진입, 완료 버블 |
| Survey swipe | `transform .28s` (드래그 중 none), progress `width .3s`, 옵션 `background/color .16s` [P] | — | FR-03 카드 |
| Caret | `haru-caret 1.1s step-end` [P] | — | 입력 커서 목업 (구현 불필요) |

Figma 자체의 Smart Animate / prototype transition 은 MCP 로 **확인 불가**.

### 9.2 누락 (Figma·에셋 모두 없음)

| 모션 | PRD | Stage | 비고 |
|---|---|---|---|
| 캐릭터 경청 표정·동작 (고개 끄덕임) | FR-11, §7.5 | 4 | 에셋 포맷·라이브러리 결정 필요 (§8) |
| 캐릭터 인사 / 준비 버블 등장 | FR-10 | 4 | pop-in 재사용 가능 |
| 완료 애니메이션 + 출석 스티커 지급 | §7.5, FR-19 | 4 | |
| 녹음 시작 전환 ("Now HARU is recording…" → 버튼이 Done Reading 으로) | §5.3 #7, FR-09 | 4 | |
| 카드 덱 스와이프·flip (front↔back) | FR-07, §7.9 | 3 | flip 아이콘 `85:501/85:506` 만 |
| 로딩 skeleton shimmer | rules/frontend §7 | 1 | |
| Toast / Banner 등장 | — | 1 | |

### 9.3 규칙 (RECOMMENDED)

1. 모든 모션은 `--motion-duration-*` / `--motion-ease-*` 토큰만 사용.
2. `prefers-reduced-motion: reduce` 에서: pulse·ring·bars·dots 반복 모션 **정지**(정적 링 + 텍스트 "Recording" 표시 유지), 스와이프·시트는 fade 로 대체, 캐릭터 애니메이션은 정지 포즈. 로컬 프로토타입에는 reduced-motion 처리가 **없다** [P].
3. 녹음 상태는 모션만으로 전달하지 않는다 — 아이콘 + 텍스트 + `aria-live` (NFR "텍스트 의존 최소화"와 균형: 시각 + 텍스트 병행).
4. 무한 반복 모션은 화면에 1개만 (세션 화면: 녹음 버튼 pulse 또는 경청 표시 중 택1) — 아이 몰입 방해 금지(§7.5), NEEDS DECISION.
5. 깜빡임 3회/초 초과 금지 (WCAG 2.3.1).
6. 제스처(스와이프)에는 버튼 대안 제공 (WCAG 2.5.1) — 설문 back/forward `179:1772/1775` 는 이미 존재 ✓.

---

## 10. State

### 10.1 Figma 에 정의된 상태 [DC][S]

| Component | Rest | Hover | Pressed | Disabled | Selected | Focus | Error | Loading |
|---|---|---|---|---|---|---|---|---|
| Button (`17:20`) | ✓ | ✓ (glass-raised, blur 6) | ✓ (glass-pressed) | ✓ (opacity .5) | — | **✗** | — | **✗** |
| Chip / Select (`90:626`) | ✓ (outline) | ✗ | ✗ | ✗ | ✓ (teal fill) | **✗** | — | — |
| Tag | ✓ | — | — | — | — | — | — | — |
| Tab (`17:25`) / Tab Bar (`25:87`) | ✓ | ✗ | ✗ | — | ✓ (text-primary + semibold) | **✗** | — | — |
| Activity Card 템플릿 (`17:57`) | ✓ | — | ✓ | — | — (Raised) | ✗ | — | — |
| This Week's Shelf (`113:1993`) | ✓ | ✗ | ✗ | — | ✓ (pastel + check) | ✗ | — | — |
| Record Control (`163:1590`) | Record | — | — | ✗ | Pause(=recording) | ✗ | — | ✗ |
| Prompt Card arrows (`86:324`) | ✓ | — | — | ✓ (first/last 화살표 흐림) | — | ✗ | — | — |
| Input (`76:417`) | ✓ (값 채워짐) | — | — | ✗ | — | **✗** | **✗** | — |
| Checkbox (`179:1742`) | checked 만 | — | — | ✗ | — | ✗ | ✗ | — |
| Radio option (`179:1788`) | ✓ | — | ✗ | ✗ | ✓ | ✗ | — | — |
| StarRating (`91:693`) | filled/empty | — | — | — | — | ✗ | — | — |

### 10.2 규칙 (RECOMMENDED)

- **Focus (WCAG 2.4.7, 2.4.11)**: 모든 인터랙티브 Shared UI 에 `:focus-visible` 링 = `--color-focus-ring` · `--focus-ring-width` · `--focus-ring-offset`. Glass·Accent 둘 다 3:1 이상 (TOKEN_MAP §4). Figma 에 focus variant 추가 요청. 로컬 프로토타입에 `:focus-visible` **없음**, `aria-label` 0건 [P].
- **Hover**: 포인터 기기에서만 (`@media (hover: hover)`). 터치에서 hover 잔상 금지.
- **Pressed**: shadow + scale, 색 불변 (Figma).
- **Disabled**: `--opacity-disabled` + 포인터 비활성 + `aria-disabled`. 비활성 이유가 있으면 헬퍼 텍스트로 설명 (예: 동의 미체크 시 "Create account").
- **Selected**: 색 + 형태(체크, 굵기) 병행, `aria-pressed` / `aria-checked` / `aria-current`.
- **Error**: 필드 테두리 + 아이콘 + 텍스트 (`aria-describedby`), 색만으로 표시 금지. Figma 누락.
- **Loading**: 버튼 내부 spinner + 라벨 유지(폭 고정) + 중복 제출 방지. Figma 누락.
- **Screen states** (rules/frontend §7): Loading / Empty / Error+Retry 모든 데이터 화면, Recording·Upload 화면은 Offline / Permission Denied / Retry 추가 — **전부 Figma 누락** (FIGMA_SCREEN_MAP §2).

---

## 11. Responsive Rule — **NEEDS DECISION**

### 11.1 사실 (CONFIRMED)

- Figma 모든 frame = 393px (iPhone 15/16 Pro 급). 태블릿·데스크톱·가로 모드 frame 없음.
- 레이아웃이 절대 좌표 배치(`absolute left/top`) 인 frame 다수 [DC] → 수치 그대로 구현하면 폭 변화에 대응 불가. Auto Layout 이 적용된 곳: FieldGroup, Feedback Card, 리포트 카드 내부.
- PRD FR-25(P1) 웹 반응형 vs §14.1 M3 → PRD 내부 불일치 (M-22).

### 11.2 제안 규칙 (mobile-first, 디자인 없는 다단 레이아웃 금지)

| 구간 | 폭 | 규칙 |
|---|---|---|
| compact (기본) | `--layout-min-width`(신규 제안) 이상 ~ `--bp-md` 미만 | 단일 컬럼, 폭 100%, 좌우 `--layout-gutter`. Figma 393 frame 이 기준. 최소 지원 폭에서 가로 스크롤 없음(WCAG 1.4.10 reflow). 카드·버튼 fluid width, 캐릭터 이미지는 최대 높이 제한 |
| medium | `--bp-md` 이상 ~ `--bp-lg` 미만 | **앱 컬럼을 중앙 정렬, 최대폭 `--layout-app-max-width`** (값 NEEDS DECISION, TOKEN_MAP §4). 배경 gradient 는 전체 뷰포트. Bottom Tab Bar·Sheet·Toast 도 컬럼 폭 안에 정렬 |
| expanded | `--bp-lg` 이상 | medium 과 동일 (추가 레이아웃 없음). 데스크톱용 사이드 내비게이션·2단 레이아웃은 **Figma 디자인 확보 후** 별도 결정 |
| 가로 모드 (폰) | 짧은 뷰포트 높이 (기준 `--bp-short-height` 신규 제안) | 세션 화면: 캐릭터 축소 + 컨트롤 우선, 스크롤 허용. 잠금 여부 NEEDS DECISION (Capacitor 화면 방향 고정 가능) |

추가 규칙:
- Safe area: `env(safe-area-inset-top/bottom)` 을 TopBar·Tab Bar·하단 CTA 에 반영 (Figma 상태바 56px / 홈 인디케이터 영역을 하드코딩하지 않음).
- 하단 고정 CTA (`179:1746` top 750) 는 키보드 표시 시 가려지지 않게 스크롤 컨테이너 내부로.
- 긴 스크롤 frame (`30:74` 1103, `110:522` 1752): Tab Bar 는 고정, 콘텐츠 하단 padding = Tab Bar 높이 + safe area.
- 텍스트 200% 확대 시 단일 컬럼 유지, 고정 높이 카드 금지 (현재 덱 카드 `163:2648` 에서 Prompt 가 버튼과 겹침 — 고정 높이의 증거).
- Tailwind `screens` 는 승인된 `md`, `lg` 두 개만 (rules/frontend §9).

결정 필요: ① breakpoint 값 ② 앱 컬럼 최대폭 ③ 데스크톱에서 배경 장식(캐릭터 등) 허용 여부 ④ 가로 모드 지원 ⑤ PRD M-22 (웹 반응형을 MVP 에 포함하는지).

---

## 12. Accessibility

### 12.1 대비 측정 (WCAG 2.x 상대 휘도 공식으로 design-agent 가 계산)

방법: Figma 변수 값·[DC] raw 값 사용. 반투명 fill 은 배경 위에 합성해 계산했다 (glass 74% over 배경 끝 `#c7c9d7` → `#f1f1f5`, over 시작 `#dbeee7` → `#f6fbf9`; glass-strong 90% → `#f9f9fb`/`#fbfcfc`). blur·그림자는 반영하지 않았다. 기준: 일반 텍스트 4.5:1, 대형 텍스트(24px+ 또는 18.66px+ bold) 3:1, 비텍스트 UI 3:1.

| 전경 | 배경 | 대비 | 사용 예 (node) | 판정 |
|---|---|---|---|---|
| `text-primary` #4a5f5c | white | **6.81** | 제목·본문 | ✓ AA |
| `text-primary` | glass over 배경 끝 | **6.05** | Tab 선택 라벨 | ✓ |
| `text-primary` | 배경 gradient 끝 #c7c9d7 | **4.14** | 배경 위 직접 텍스트 | ✗ 일반 / ✓ 대형 |
| `text-primary` | teal tint(Moment 카드) | **4.78** | `163:2635` | ✓ |
| `text-button` #5e7370 | white | **5.05** | | ✓ |
| `text-button` | glass(74%) over 배경 시작 / 끝 | **4.83 / 4.48** | Glass 버튼 17px semibold `17:5` | 끝 쪽 ✗ (근소) |
| `text-button` (= TOKEN_MAP T-2 제안 secondary) | glass(74%) over 배경 끝 | **4.48** | **비선택 Tab 라벨 11px `25:38`** — Tab Bar 는 화면 하단(배경 끝) 위 | ✗ → **T-2 만으로 해결 안 됨** (T-2 추가 조치 ①–③) |
| `text-button` | glass-strong (배경 시작 / 중간 / 끝) | **4.94 / 4.91 / 4.80** | 칩 라벨, 역량 라벨 | ✓ |
| `text-button` | `#dbeee7` | **4.18** | PromptPill 11.8px `139:2753` | ✗ |
| `text-button` | 배경 시작 | **4.18** | "Question 1 of 10" `179:1778` | ✗ |
| `text-secondary` #7d9291 | white | **3.29** | 캡션 11–13px | ✗ |
| `text-secondary` | glass (시작/끝) | **3.14 / 2.92** | Tab 비선택 라벨 11px `25:38` | ✗ |
| `text-secondary` | glass-strong over 끝 | **3.12** | 버블 부제 `50:173` | ✗ |
| `text-secondary` | 배경 시작 / 끝 | **2.72 / 2.00** | | ✗ (3:1 도 미달) |
| `text-secondary` | teal tint | **2.31** | `163:2636` | ✗ |
| `#9aabaa` (grey/64) | white / glass-strong / 카드 82% | **2.39 / 2.33 / 2.28** | 입력 라벨 `76:430`, placeholder `91:716`, 요일·캡션 `163:2560` | ✗ |
| `#b3c0bf` | 카드 82% / white 90% | **1.78 / 1.82** | 차트 값 `163:2567`, "1 / 10" `179:1785` | ✗ |
| `#8fa3a1` | 배경 시작 | **2.20** | "At least 8 characters." `179:1736` | ✗ |
| `#6b807d` | 배경 중간 | **3.16** | 동의 문구 `179:1745` | ✗ |
| `#6ba99f` | white | **2.69** | "Show" `76:428` | ✗ |
| `#6f8c88` | teal tint | **2.55** | "MOMENT OF THE WEEK" `163:2634` | ✗ |
| `#85bfb6` (teal) 텍스트 | 카드 82% | **1.97** | "+18% vs last week" `163:2558` | ✗ |
| white | `accents/teal` #85bfb6 | **2.07** | **모든 Accent Button** (`17:12`, `179:1746`…), 선택 칩 `90:625`, 선택 설문 옵션 `179:1797`, "Tap to recording" 10px | ✗ (3:1 도 미달) |
| white | `accents/blue` #7faec1 | **2.41** | — | ✗ |
| white | `accents/green` #90bfad | **2.05** | CapabilityBadge SD `76:439` | ✗ |
| white | `accents/purple` #c9b8d4 | **1.86** | IM 배지 | ✗ |
| white | `accents/cyan` #a0ccdd | **1.72** | Pagetag, "3yr 4mo" | ✗ |
| white | `color/blue/81` #c7c9d7 | **1.65** | "Not selected" 9px | ✗ |
| white | `accents/pink` #efc3d4 | **1.56** | ER 배지 | ✗ |
| `#3b4a48` | white | **9.30** | 입력 값·설문 질문 | ✓ |
| `#4a5f5c` | 설문 옵션 bg #edf3f1 | **6.06** | `179:1791` | ✓ |
| **비텍스트** teal fill | track (white 62% over 배경 시작 / 끝) | **1.94 / 1.73** | 진행 바 `179:1780` | ✗ (3:1) |
| 비텍스트 teal | white | **2.07** | Checkbox `179:1742`, 선택 칩 경계 | ✗ |
| 비텍스트 `stroke` ink 18% | white | **1.26** | 비선택 칩·TextArea 테두리 `91:715` | ✗ |
| 비텍스트 별 yellow #d0cca1 | white | **1.64** | StarRating `91:693` | ✗ |
| 대안 예시: white | teal 진하게 `#3f7f76` (예시값) | **4.66** | Accent 라벨 해결 후보 | ✓ (디자이너 확정 필요) |
| 대안 예시: `#5f7473` | white / glass 끝 | **4.96 / 4.40** | secondary 후보 | 부분 ✓ |
| focus ring 후보 `#4a5f5c` | white / teal | **6.81 / 3.28** | | ✓ (3:1) |

**결론**: Figma 토큰 그대로는 PRD §11 "WCAG AA" 를 충족하지 못한다 (M-33). 영향이 가장 큰 순서: ① Accent(teal) 위 흰 라벨 (모든 주요 CTA) ② `text-secondary`·`#9aabaa` 캡션 ③ 흰 글자 배지/Tag ④ 진행 바(1.73–1.94)·체크박스·칩 경계 비텍스트 대비 ⑤ T-2 제안을 적용해도 glass 위 비선택 Tab 라벨은 4.48 로 남는 공백. → TOKEN_MAP T-2, T-3, T-4 결정 필요 (**Stage 1 차단**).

### 12.2 터치 타깃 (`--size-touch-min` — RECOMMENDED: rules/frontend 권장값, PRD §11 은 "충분히 확보" 만 명시)

| 요소 | Figma 크기 | 판정 | 제안 |
|---|---|---|---|
| Button | 45 / 56 / 58 높이 | ✓ | |
| IconButton (back, settings, close, refresh) | 38×38 | ✗ | hit area `--size-touch-min` 확장 |
| Tab Bar 항목 | 탭 영역 폭 약 80, 높이 70 [DC] | ✓ | |
| Chip (Select) | 31–34 높이 | ✗ | 높이 `--size-touch-min` 또는 hit slop, 칩 간 gap ≥ 8 |
| Tag SelectTrigger (Boy/Girl/Not selected) | 46–81 × 19 | ✗ | `--size-touch-min` hit area |
| Checkbox | 22×22 | ✗ | 라벨 전체를 클릭 영역으로 |
| StarRating 별 | 30×30, gap 8 | ✗ | `--size-touch-min` hit area |
| TextLink ("Log in", "Show", "Forgot password?") | 13–14px 텍스트 높이 | ✗ | 패딩 확장 |
| PageIndicator dot | 7px | 인터랙티브면 ✗ | 장식으로만 사용 또는 `--size-touch-min` 확장 |
| Prompt 캐러셀 화살표 (`86:324`) | 약 16px 아이콘 | ✗ | |

### 12.3 기타 체크 (RECOMMENDED — Stage 1 Shared UI 완료 기준에 포함)

| 항목 | 현황 | 규칙 |
|---|---|---|
| 포커스 표시 | Figma·프로토타입 모두 없음 | §10.2 |
| 스크린리더 이름 | 프로토타입 `aria-label` 0건 [P] | IconButton `label` 필수 prop, 캐릭터 `alt=""`, 차트 요약 텍스트 |
| 색 단독 정보 | 선택 칩·역량 색·차트 막대 최대값 강조 | 텍스트·아이콘 병행 |
| 녹음 상태 알림 | 시각 모션만 (Figma) | `aria-live="polite"` "Recording started / paused" |
| 제스처 대안 | 설문 back/forward ✓, 카드 덱 dots 만 | 덱 prev/next 버튼 필요 (Figma 누락) |
| 텍스트 확대 | 절대 좌표·고정 높이 | §11.2 |
| 모션 민감 | reduced-motion 없음 [P] | §9.3 |
| 투명도 | glass 전반 | `prefers-reduced-transparency` → 불투명 fallback |
| 언어 | 영어 1차 | `lang="en"` |
| 시간 제한 | 10분 방치 정리·30분 자동 종료 (§13) | 사전 안내·연장 불가 사유 텍스트 (WCAG 2.2.1 참고) — 디자인 필요 |
| 오류 식별 | 필드 에러 디자인 없음 | §10.2 |

---

## 13. Dark Mode

| 항목 | 현황 |
|---|---|
| Figma | Light 화면만. Variable Mode 존재 여부는 MCP 로 **확인 불가** (`get_variable_defs` 단일 값 반환) |
| 로컬 CSS | `colors-pastel.css` 가 dark/dim 블록에 **light 와 같은 값** 을 선언, `fig-tokens.css` dark 블록은 iOS 시스템색 (stale) |
| HARU 화면 | 배경 gradient·glass·ink 가 모두 밝은 배경 전제 |

**RECOMMENDED**: MVP 는 Light 전용. `color-scheme: light` 고정, OS 다크 설정에서도 Light 렌더. 토큰은 semantic 계층을 통해서만 참조하므로 추후 Dark mode 추가 시 semantic 값 재정의로 대응 가능.
**NEEDS DECISION**: MVP 에서 Dark mode 미지원 확정 여부 (베드타임 사용 시나리오 §3.2 에서 밝은 화면 부담 가능성 — 제품 판단).

---

## 14. Stage 1 전 디자인 결정 체크리스트

| # | 결정 | 관련 | 라벨 |
|---|---|---|---|
| D-1 | 폰트: System stack / 라이선스 웹폰트 / 하이브리드, SF Pro 파일 미배포 | §2.3 | NEEDS DECISION (법무·디자인) |
| D-2 | 대비 해결: Accent 라벨, secondary 텍스트, 배지 글자, 비텍스트 UI | §12.1, TOKEN_MAP T-2–T-4 | NEEDS DECISION (디자이너) |
| D-3 | 토큰 정규화 승인 (3-tier, 흡수표, rename) | TOKEN_MAP §1, §3.3, §5, §6 | NEEDS DECISION |
| D-4 | 신규 토큰: focus, status, scrim, z-index, motion, breakpoints, layout | TOKEN_MAP §4 | NEEDS DECISION |
| D-5 | Breakpoint·앱 컬럼 최대폭·가로 모드 | §11 | NEEDS DECISION |
| D-6 | 내비게이션 구조 (Tab Bar 항목·중앙 버튼 역할) | FIGMA_SCREEN_MAP M-08 | NEEDS DECISION |
| D-7 | 아이콘 소스 (Figma export vs 라이브러리) + 누락 아이콘 목록 | §7 | NEEDS DECISION |
| D-8 | Dark mode MVP 제외 | §13 | NEEDS DECISION |
| D-9 | Capability 색 매핑·사용자 노출 라벨 | TOKEN_MAP §2.7, M-13 | NEEDS DECISION |
| D-10 | 공통 상태 패턴(Loading/Empty/Error/Offline/Toast/Dialog) 디자인 — Figma 추가 또는 design-agent 명세 기반 구현 허용 | COMPONENT_MAP §1 | NEEDS DECISION |
| D-11 | 캐릭터·표지 에셋 권리, 최적화 포맷 | §8 | NEEDS DECISION (법무·운영) — Stage 1 비차단, Stage 2 전 필요 |
