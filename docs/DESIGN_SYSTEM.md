# HARU Design System

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (Rev: #33 · C-19 반영)
Based on: Figma `YWWu3AFEJpRxvw0T5klq0k` page `8:2` (`17:366` Foundations, `17:367` HARU Components, `17:368` iOS 26 Components) + page `16:2` 화면 (2026-09-14 확인), PRD v1.4 §7.5 · §11, `docs/decisions/stage-0-approvals.md` (기존 문서보다 우선), `.claude/rules/frontend.md`, 로컬 참고 `$HARU_ONEDRIVE/디자인/**`; Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `.claude/rules/frontend.md` §6·§10, `.claude/rules/qa.md`
Author: design-agent (2026-09-14)
관련 문서: 토큰 이름·값 → `docs/DESIGN_TOKEN_MAP.md`, 컴포넌트 → `docs/COMPONENT_MAP.md`

라벨: `CONFIRMED (사용자 결정 2026-09-14, #id)` = 사용자 결정 · `CONFIRMED` = PRD·Figma 확정 · `가값 (P-xx)` = 승인 로그 §4 가값 · `D-xx` = 승인 로그 §3 수용 예외 · `RECOMMENDED` = design-agent 제안 (사용자 미결정 세부) · `NEEDS DECISION` = 미결정. 검증: [S] screenshot · [DC] design context · [M] metadata · [P] 로컬 프로토타입

> 번호 주의: 이 문서 §14 의 `D-1`…`D-11` 은 디자인 결정 체크리스트 번호이고, 승인 로그 §3 의 수용 예외 `D-01`…`D-04` 와 다르다.

> 이 문서의 규칙·제안은 **토큰 이름으로만** 기술한다 (값은 `docs/DESIGN_TOKEN_MAP.md` 에만 있다). Figma·프로토타입에서 관찰한 수치는 "현황" 사실 기록으로만 남기며 구현 값으로 쓰지 않는다. 신규 토큰 이름은 모두 제안(TOKEN_MAP §4).

---

## 1. Color

### 1.1 현재 Figma 상태 (CONFIRMED)

- Design Guide 제목 "HARU — iOS 26 Design System (Pastel)" (`17:342`). iOS 26 커뮤니티 kit 의 semantic 색 이름(`accents/*`, `grays/*`, `backgrounds/*`, `fills/*`, `labels/*`, `separators/*`, `misc/*`)에 **HARU 파스텔 accent 12색**을 덮어쓴 구조 [S][DC].
- 실제 HARU 화면은 iOS `labels/*`·`backgrounds/*` 를 거의 쓰지 않고, 별도의 HARU 변수(`text-primary`, `text-secondary`, `text-button`, `glass-fill`, `glass-fill-strong`, `stroke`)와 **자동 생성 이름 변수**(`color/cyan/41`, `Corduroy` …) + **raw hex** 를 섞어 쓴다 [DC].
- 화면 배경은 모든 frame 에서 세로 gradient (mist → dusk) 이며 **변수가 아니다** [DC].
- 브랜드 주 색 = `accents/teal` (Accent Button, 선택 칩, 선택 설문 옵션, 진행 바, 탭 중앙 버튼).
- 상태 색(error/success/warning/info) **없음**. `accents/red` 는 파스텔이라 텍스트·아이콘으로 쓸 수 없다 (§12). → 이름·용도는 CONFIRMED (사용자 결정 2026-09-14, #10), 값은 `가값 (P-04)` (TOKEN_MAP §4.1).
- Dark mode 없음 — MVP Light 전용 CONFIRMED (사용자 결정 2026-09-14, #20) (§13).

### 1.2 역할 규칙

토큰 3-tier 구조·네이밍: CONFIRMED (사용자 결정 2026-09-14, #10). 아래 역할 배정은 그 구조 안의 design-agent 매핑이며, 사용자 결정·가값 항목은 행마다 표기한다.

| 역할 | Semantic token | 규칙 |
|---|---|---|
| 본문·제목 | `--color-fg-primary`, `--color-fg-strong` | 모든 정보성 텍스트 기본 |
| 보조 텍스트 | `--color-fg-secondary` | `가값 (P-01)` = 현재 Figma `text-secondary` 값 (AA 미달, §12). 디자이너 결정 대기 (#18-②) |
| 장식·대형 텍스트 | `--color-fg-tertiary` | 18.66px bold / 24px 이상, 또는 정보 없는 장식만. P-01 결정 결과에 따라 secondary 와 통합 여부 재검토 (RECOMMENDED) |
| 화면 배경 | `--color-bg-app-*` | 텍스트를 배경 위에 직접 두지 않는다 — Surface 위에만 (배경 하단 대비 4.14:1) |
| 카드/시트/버블 | `--color-surface-strong` | |
| 버튼·칩·탭바 | `--color-surface-glass` | |
| 주요 행동 | `--color-action-primary-bg` + `--color-fg-on-accent` | **현재 Figma 파스텔 teal + 흰 라벨 유지** — CONFIRMED (사용자 결정 2026-09-14, #18-①), PRD §11 AA 미충족을 사용자가 수용 (**D-01**, 법무 L-04). Stage 1 차단 아님 |
| 선택 | `--color-selected-*` | 색만으로 선택 표시 금지 — 체크 아이콘/굵기/`aria-pressed` 병행 (WCAG 1.4.1). 선택 칩 흰 라벨은 D-01 범위, 칩 경계는 `가값 (P-02)` |
| 역량 | `--color-capability-{agency,emotion,flexibility,motivation}-{bg,fg,chart}` | 배지(Tag) 색으로 통일, `-bg`·`-chart` 동일 색 — CONFIRMED (사용자 결정 2026-09-14, #19). `-fg`(배지 글자) = `가값 (P-02)` (TOKEN_MAP §2.7). teal = 주요 버튼, blue = 탭 선택과 의미 분리 |
| 상태 | `--color-status-*` | 이름 CONFIRMED (사용자 결정 2026-09-14, #10), 값 `가값 (P-04)` (TOKEN_MAP §4) |
| 포커스 | `--color-focus-ring` | 이름 CONFIRMED (#10), 값 `가값 (P-03)` = `--haru-ink-700` 계열 (§10.2) |
| Scrim | `--color-scrim` | 이름 CONFIRMED (#10), 값 `가값 (P-05)` |

---

## 2. Typography

### 2.1 스케일 (CONFIRMED: Figma `17:298`)

iOS 26 text styles 11종 (Large Title 34/41 700 … Caption 2 11/13 400), family "SF Pro". 화면은 이 스타일을 **거의 바인딩하지 않고** raw 크기 17종(9 ~ 28)과 weight 510/590/700/860 을 사용한다 [DC]. 흡수 규칙은 TOKEN_MAP §3.3.

### 2.2 규칙

- 화면 raw 텍스트 크기는 iOS 타입 스케일로 흡수하고 최소 텍스트 = `caption-2` 스타일(11px) — CONFIRMED (사용자 결정 2026-09-14, #10-②). 그보다 작은 Figma raw 크기 사용 금지 (현황: `163:2798`, `163:2567`, "Tap to recording" — TOKEN_MAP §3.3). 신규 텍스트 스타일(`callout-sm`, `display-number` 등)은 만들지 않는다.
- 부모가 소리 내 읽는 Prompt 문장은 최소 `footnote` 스타일 — 현황 `139:2753` 은 그보다 작음. RECOMMENDED (design-agent 제안, Stage 3 design spec 에서 사용자 확인).
- 줄 높이는 text style 값만 사용 (`line height/20_4` 같은 배율 변수 폐기).
- 사용자 글자 크기 확대(브라우저 zoom 200%, iOS Dynamic Type 은 WebView 설정에 따름)에서 레이아웃 유지 — 고정 높이 텍스트 컨테이너 금지 (현재 Figma 는 절대 좌표 배치 다수).
- 워드마크 "HARU" (`26:39`, `179:1707`) 는 텍스트가 아니라 **로고 에셋**으로 분리 RECOMMENDED.
- Heavy(860) 는 페이지 대제목·수치에만.

### 2.3 폰트 — CONFIRMED (사용자 결정 2026-09-14, #11)

| 사실 | 근거 |
|---|---|
| Figma 모든 텍스트 = "SF Pro" | `17:298`, `font family/Font 1` [DC] |
| 로컬 프로토타입이 `SF-Pro.ttf` (23MB) 를 `@font-face` 로 로드 | `_ds/…/fonts/SF-Pro.ttf`, `tokens/fonts.css` |
| Apple SF Pro 폰트 라이선스는 Apple 플랫폼용 UI 목업·개발 용도로 사용을 한정하는 것으로 알려져 있음 | 웹폰트 번들·타 플랫폼 표시 위험 → 아래 결정으로 회피 |

**결정 (혼합)**: Apple 기기(iOS·macOS)는 시스템 폰트(SF Pro), 그 외(Android·Windows 등)는 **Inter (SIL OFL)**.

| 규칙 | 내용 |
|---|---|
| font stack | `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (TOKEN_MAP `--font-sans`) |
| 순서 | **`system-ui` 를 Inter 앞에 두지 않는다** — Android 에서 Roboto 가 먼저 선택되기 때문 |
| Inter | **self-host** (외부 CDN 요청 없음). 서브셋·weight 범위·`font-display` 등 세부는 Stage 1 Plan |
| SF Pro 파일 | 로컬 `SF-Pro.ttf` 는 **저장소·빌드에 절대 포함하지 않는다** |
| 정의 위치 | `packages/design-tokens` 한 곳 (rules/frontend §6) |
| Weight | Figma 510/590/860 은 플랫폼·폰트에 따라 가장 가까운 weight 로 렌더될 수 있다 — Visual QA 허용 오차는 Stage 1 Plan |
| Figma | 텍스트 스타일 family 는 "SF Pro" 유지 (Apple 기기 렌더와 일치) |

---

## 3. Spacing

- Figma 변수 `item spacing/*` (2, 4, 6, 7, 8, 10, 12, 14) + 화면 raw 16/18/20/24/26/32 [DC]. 이름 체계가 named(xxxs/xxs/xs)와 numeric(6/7/10/12/14)으로 섞여 있다.
- 규칙 (RECOMMENDED): `--space-*` 스케일만 사용 (TOKEN_MAP §5.1). 정의된 단계는 2·4·6·8·10·12·14·16·20·24·32 이며, Stage 2 실측으로 **28**(단계 `7`)·**40**(단계 `10`) 2단계 추가가 제안되어 있다 (Stage 2 design spec §6.1 · 2026-09-27 — 4의 배수이므로 "비스케일 값 금지" 대상이 아니다). 화면 좌우 = `--layout-gutter` (24 vs 26 = `가값 (P-13)`, 가값 24), 카드 내부 padding = `--space-4` 또는 `--space-5`, 세로 섹션 간격 = `--space-6` / `--space-8`, 칩 gap = `--space-2`.
- 모든 인터랙티브 요소 최소 `--size-touch-min` (RECOMMENDED, TOKEN_MAP §4) — 시각 크기가 작으면 hit area 로 확장.

## 4. Radius

- 현황: 사용 값 13종. → **radius 6단계로 흡수** — CONFIRMED (사용자 결정 2026-09-14, #10-②). 단계별 역할 이름 `--radius-indicator` · `--radius-control` · `--radius-field` · `--radius-surface` · `--radius-card` · `--radius-pill` 은 RECOMMENDED (design-agent 제안, Tailwind 기본 `rounded-sm/md/lg` 를 덮어쓰지 않음). 카드 계열은 `surface` / `card` 두 단계. `--radius-surface` 22 vs 24 = `가값 (P-12)`, 가값 22 (TOKEN_MAP §5.2).
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
  4. 스크롤 리스트 안의 반복 요소(서재 행 등)에는 blur 를 쓰지 않고 fill 만 사용 — Capacitor WebView 스크롤 성능 (실기기 확인은 Capacitor 셸이 추가되는 **Stage 4** 부터, #7).
  5. Press 피드백 = shadow 전환 + scale (§9), 색 변화 없음 (Figma Button Pressed 는 색 동일 [DC]).
  6. saturate 는 쓰지 않는다 — 값은 Figma 만 기준 (#10-①, TOKEN_MAP §5.4).

## 7. Iconography

아이콘 소스: CONFIRMED (사용자 결정 2026-09-14, #21).

| 항목 | 현황 | 규칙 |
|---|---|---|
| 일반 아이콘 | settings, close, back, forward, refresh, mail, mic, pause, chevron-down, book(탭), chart(탭), download, list, check(체크박스) — 화면 frame 안의 개별 SVG [DC] | **Lucide** (npm `lucide-react`, 라이선스 ISC — 2026-09-14 npm registry 확인). Figma 의 일반 아이콘은 Lucide 대응 아이콘으로 대체. 버전 고정은 Stage 1 Plan. CONFIRMED (#21) |
| 누락 아이콘 | alert/error, wifi-off(offline), cloud-upload, trash, play/pause(클립), share, lock(동의), info, calendar/time(Context), plus(책 등록), search | Lucide 대응 아이콘 사용 (apple 제외 — 아래 브랜드 로고). Stage 별 필요 목록은 FRONTEND_IMPLEMENTATION_PLAN. CONFIRMED (#21) |
| HARU 전용 아이콘 | `Icon 50:157` 15개 — 출석 스티커 `attend`, thumb_gold/white, record, flip_to_back/front, star, clock 등. variant 이름 비일관 (`shape11`, `13`, `swape`, `shape=icon, Property 2=reply_all`) [M][S] | **Figma SVG export** 로 자산화. CONFIRMED (#21). export 대상 이름 = 의미 (`star-filled`, `thumb-up`, `sticker-attend`) 로 정리 요청 (디자이너) |
| 스타일 | 둥근 선형(stroke) + 일부 filled(star, thumb), 색 = ink 계열 | Lucide stroke 와 HARU 전용 SVG 의 선 두께 정합은 Stage 1 design spec 에서 확인 (RECOMMENDED) |
| 크기 | 12, 13, 15, 18, 19, 20, 21, 24, 26, 30 혼재 | `--size-icon-sm` / `--size-icon-md` / `--size-icon-lg` 3단계 — `가값 (P-09)` (값: TOKEN_MAP §4). **예외 1건**: BottomTabBar 아이콘 21 은 3단계로 흡수하지 않고 Tier 3 `--tabbar-icon-size` 로 고정 — CONFIRMED (사용자 결정 2026-09-20, S1-D3) |
| 접근성 | — | 의미 있는 아이콘 = `label` 필수, 장식 = `aria-hidden`. 아이콘 단독 버튼은 IconButton 만 사용 |
| 브랜드 로고 | Google "G" (`179:1710`); Apple 없음 | **Google·Apple 공식 브랜드 에셋만** 사용 (임의 재작성 금지). Apple 로그인 버튼은 Apple 공식 가이드 버튼 (C-13). CONFIRMED (#21) |

## 8. Illustration · Character Assets

| 에셋 | Figma node | 로컬 파일 | 사용 화면 | 확인 사항 |
|---|---|---|---|---|
| Hello + Heart (전신) | `163:2529` "Haru_Hello_Heart_t 1" | `$HARU_ONEDRIVE/Chracter/Haru_Hello_Heart_t*.png/.svg`, `$HARU_ONEDRIVE/디자인/하트 하루몬스터.png` | `26:21`, `179:1701`, `179:1809` | |
| Hello (헤드폰) | `163:2530` "HARU_Hello_t 1" | `$HARU_ONEDRIVE/Chracter/HARU_Hello_t*.png/.svg`, `$HARU_ONEDRIVE/디자인/헤드폰 하루몬스터.png` | `28:51`, `29:62`, `179:1748`, `179:1820` | |
| Bookworm (안경·헤드폰·책) | `163:2536`, `163:2542` | `$HARU_ONEDRIVE/디자인/안경 쓴 책벌레 민트 하루.png` | `31:102`, `110:522` | |
| Home character crop | `163:2532` "asset/home-character" | — | `26:21` | |
| Avatar medallion (보라 gradient 배경 합성) | `163:2528` "asset/avatar-medallion" | — | `28:51` | 배경이 이미지에 구워져 있음 → 토큰 배경과 분리 필요 |
| 캐릭터 배경 | — | `$HARU_ONEDRIVE/디자인/캐릭터 배경.png`, `$HARU_ONEDRIVE/Chracter/HARU_Back.png` | 미사용 | |
| 책 표지 | `145:929–145:1010`, `163:2531–2534` | `$HARU_ONEDRIVE/디자인/책이미*.jpg` | 서재·카드 | 실제 출판 표지 — 사용 권리 확보 (C-17) |

결정·잔여 항목:
1. **캐릭터 에셋 권리**: 사용자 확인 — 권리 확보됨, 바로 사용. CONFIRMED (사용자 결정 2026-09-14, C-17) (M-35, PLANNING R-10 해소).
2. **책 표지 사용권**: 사용자 확인 — 권리 확보됨, 바로 사용. CONFIRMED (사용자 결정 2026-09-14, C-17) (PLANNING R-09 해소). fixture 는 여전히 `mocks/fixtures` 에만 두고 Figma placeholder 의 표지↔제목 불일치(M-36)는 복사하지 않는다.
3. **포맷**: PNG 1.0–1.5MB, SVG 1.4–1.5MB (크기상 래스터 내장 SVG 로 추정 [M]) → 최적화 포맷·해상도(예: WebP/AVIF 1x/2x/3x, 투명 배경 원본)는 **Stage 1 Plan** 에서 확정 (C-17).
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

1. 모든 모션은 `--motion-duration-*` / `--motion-ease-*` 토큰만 사용 (이름 CONFIRMED #10, 값 `가값 (P-07)`).
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

### 10.2 규칙

Figma 에 없는 컴포넌트 상태(focus·error·loading)와 공통 상태 화면은 **design-agent 명세로 Stage 1 에서 먼저 구현**하고 기존 토큰·컴포넌트만 사용한다 — CONFIRMED (사용자 결정 2026-09-14, #22). Stage 1 구현 후 화면을 제시하고 하나씩 유지/수정 승인 `가값 (P-10)`. 아래 개별 규칙은 그 명세의 기준(design-agent 제안)이다.

- **Focus (WCAG 2.4.7, 2.4.11)**: 모든 인터랙티브 Shared UI 에 `:focus-visible` 링 = `--color-focus-ring` · `--focus-ring-width` · `--focus-ring-offset` — 이름 CONFIRMED (#10), 값 `가값 (P-03)` (Glass·Accent 둘 다 3:1 이상, TOKEN_MAP §4). 디자이너는 이후 Figma focus variant 를 추가할 수 있다. 로컬 프로토타입에 `:focus-visible` **없음**, `aria-label` 0건 [P].
- **Hover**: 포인터 기기에서만 (`@media (hover: hover)`). 터치에서 hover 잔상 금지.
- **Pressed**: shadow + scale, 색 불변 (Figma).
- **Disabled**: `--opacity-disabled` + 포인터 비활성 + `aria-disabled`. 비활성 이유가 있으면 헬퍼 텍스트로 설명 (예: 동의 미체크 시 "Create account").
- **Selected**: 색 + 형태(체크, 굵기) 병행, `aria-pressed` / `aria-checked` / `aria-current`.
- **Error**: 필드 테두리 + 아이콘 + 텍스트 (`aria-describedby`), 색만으로 표시 금지. Figma 누락.
- **Loading**: 버튼 내부 spinner + 라벨 유지(폭 고정) + 중복 제출 방지. Figma 누락.
- **Screen states** (rules/frontend §7): Loading / Empty / Error+Retry 모든 데이터 화면, Recording·Upload 화면은 Offline / Permission Denied / Retry 추가 — **전부 Figma 누락** (FIGMA_SCREEN_MAP §2). 공통 패턴(Loading · Empty · Error+Retry · Offline 배너 · Toast · Dialog)은 Stage 1 design spec 으로 먼저 구현 (#22, `가값 (P-10)`). 화면 고유 상태(권한 거부·업로드·분석 등)의 레이아웃은 해당 Stage 에서 C-13 규칙으로 디자인 소스를 결정하되 공통 컴포넌트를 재사용한다.

---

## 11. Responsive Rule — CONFIRMED (사용자 결정 2026-09-14, #12)

### 11.1 사실 (CONFIRMED)

- Figma 모든 frame = 393px (iPhone 15/16 Pro 급). 태블릿·데스크톱·가로 모드 frame 없음.
- 레이아웃이 절대 좌표 배치(`absolute left/top`) 인 frame 다수 [DC] → 수치 그대로 구현하면 폭 변화에 대응 불가. Auto Layout 이 적용된 곳: FieldGroup, Feedback Card, 리포트 카드 내부.
- PRD FR-25(P1) 웹 반응형 vs §14.1 M3 → PRD 내부 불일치 (M-22). 디자인 규칙은 #12 로 확정되었고 PRD 표기 정리는 plan-agent 소관.

### 11.2 규칙 (모든 화면 = Figma 모바일 레이아웃, 다단 레이아웃 없음)

| 구간 | 폭 | 규칙 |
|---|---|---|
| mobile (기본) | `--layout-min-width` 320px 이상 ~ `--bp-md` 600px 미만 | 단일 컬럼, 폭 100%, 좌우 `--layout-gutter`. Figma 393 frame 이 기준. 320px 에서 가로 스크롤 없음(WCAG 1.4.10 reflow). 카드·버튼 fluid width, 캐릭터 이미지는 최대 높이 제한 |
| md | `--bp-md` 600px 이상 ~ `--bp-lg` 1024px 미만 | **Figma 모바일 레이아웃 그대로, 앱 컬럼을 가운데 정렬, 최대폭 `--layout-app-max-width` 480px**. 배경 gradient 는 전체 뷰포트. Bottom Tab Bar·Sheet·Toast·Dialog 도 컬럼 폭 안에 정렬 |
| lg | `--bp-lg` 1024px 이상 | md 와 동일 — 사이드 내비게이션·2단 레이아웃 **없음** |
| 방향 | — | **세로 고정**: Capacitor 앱은 portrait lock (Stage 4 에서 셸 추가 시 설정). 웹 가로 화면은 같은 앱 컬럼으로 표시 (가로 전용 레이아웃·`--bp-short-height` 없음) |

값 CONFIRMED (#12): breakpoint 600 / 1024, 최소 폭 320, 앱 컬럼 최대폭 480. 데스크톱 배경 장식(캐릭터 등) 추가는 하지 않는다 (RECOMMENDED — 디자인 없음).

추가 규칙:
- Safe area: `env(safe-area-inset-top/bottom)` 을 TopBar·Tab Bar·하단 CTA 에 반영 (Figma 상태바 56px / 홈 인디케이터 영역을 하드코딩하지 않음). 토큰 `--layout-safe-top/bottom` 이름 CONFIRMED (#10), 값 `가값 (P-08)`.
- 하단 고정 CTA (`179:1746` top 750) 는 키보드 표시 시 가려지지 않게 스크롤 컨테이너 내부로.
- 긴 스크롤 frame (`30:74` 1103, `110:522` 1752): Tab Bar 는 고정, 콘텐츠 하단 padding = Tab Bar 높이 + safe area.
- 텍스트 200% 확대 시 단일 컬럼 유지, 고정 높이 카드 금지 (현재 덱 카드 `163:2648` 에서 Prompt 가 버튼과 겹침 — 고정 높이의 증거).
- Tailwind v4 `--breakpoint-*` 는 승인된 `md`(600), `lg`(1024) 두 개만 (rules/frontend §9, #29).

이전 결정 필요 항목 ①–④ 는 #12 로 해소 (breakpoint 600/1024, 앱 컬럼 480, 다단·데스크톱 장식 없음, 세로 고정). ⑤ M-22 는 디자인 규칙상 해소, PRD 표기 정리는 plan-agent.

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
| `text-button` (P-01 수정 후보 중 하나) | glass(74%) over 배경 끝 | **4.48** | **비선택 Tab 라벨 11px `25:38`** — Tab Bar 는 화면 하단(배경 끝) 위 | ✗ → 이 후보만으로는 해결 안 됨. P-01 승인 시 다른 후보와 함께 제시 (TOKEN_MAP §7 T-2) |
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
| 대안 예시: white | teal 진하게 `#3f7f76` (예시값) | **4.66** | Accent 라벨 해결 후보 — **채택 안 함** (현재 색 유지, #18-①, D-01) | 기록용 |
| 대안 예시: `#5f7473` | white / glass 끝 | **4.96 / 4.40** | secondary 후보 | 부분 ✓ |
| focus ring 후보 `#4a5f5c` | white / teal | **6.81 / 3.28** | | ✓ (3:1) |

**결론**: Figma 토큰 그대로는 PRD §11 "WCAG AA" 를 충족하지 못한다 (M-33). 사용자 결정 (#18, 2026-09-14) 에 따른 처리:

| # | 항목 | 처리 | 상태 |
|---|---|---|---|
| ① | Accent(teal `#85bfb6`) 위 흰 라벨 2.07:1 — 모든 주요 CTA, 선택 칩·설문 옵션 | **현재 색 유지**, AA 미충족을 사용자가 수용 | CONFIRMED (사용자 결정 2026-09-14, #18-①), **D-01** (범위: `--color-action-primary-bg` 위 흰 라벨에 한정, 법무 L-04). QA 는 해당 항목을 FAIL 로 기록하되 `PASS (accepted: D-01)` 로 처리 |
| ② | 보조 텍스트 `text-secondary`·`#9aabaa` 캡션, glass 위 비선택 Tab 라벨 | 현재 Figma `#7d9291` 로 가값 운영 | `가값 (P-01)` — 디자이너 결정 대기 |
| ③ | 비텍스트: 진행 바(1.73–1.94)·별점(1.64)·칩·체크박스 경계, **배지 글자**(흰 글자 1.56–2.05) | 현재 Figma 값으로 가값 운영 | `가값 (P-02)` — 디자이너 결정 대기 |
| ④ | focus ring | `--haru-ink-700` 2px (white 6.81 · teal 3.28) | `가값 (P-03)` — 디자이너 결정 대기 |
| — | Glass 버튼 라벨·PromptPill·"Question 1 of 10" 의 `text-button` `#5e7370` (4.18–4.48, 근소 미달) | 현재 Figma 값으로 가값 운영 (D-01 범위 밖) | `가값 (P-11)` — 디자이너 결정 대기 |

Stage 1 차단 아님 — 가값으로 진행하고 Stage 1 구현 후 항목별 승인 (#10-④, FRONTEND_IMPLEMENTATION_PLAN §1.7).

### 12.2 터치 타깃 (`--size-touch-min` — RECOMMENDED: rules/frontend 권장값, PRD §11 은 "충분히 확보" 만 명시)

| 요소 | Figma 크기 | 판정 | 제안 |
|---|---|---|---|
| Button | 45 / 56 / 58 높이 | ✓ | lg 56 vs 58 = `가값 (P-15)`, 가값 56 |
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

**결정: MVP 제외 (Light 전용)** — CONFIRMED (사용자 결정 2026-09-14, #20). `color-scheme: light` 고정, OS 다크 설정에서도 Light 렌더. dark 토큰·Mode 를 만들지 않는다. 토큰은 semantic 계층을 통해서만 참조하므로 추후 Dark mode 추가 시 semantic 값 재정의로 대응 가능.

---

## 14. Stage 1 전 디자인 결정 체크리스트

번호 `D-1`…`D-11` 은 이 문서 체크리스트 번호 (승인 로그 수용 예외 `D-01`…`D-04` 와 다름).

| # | 결정 | 관련 | 상태 |
|---|---|---|---|
| D-1 | 폰트: Apple = 시스템(SF Pro), 그 외 = Inter self-host, font stack 순서, SF Pro 파일 미배포 | §2.3 | CONFIRMED (사용자 결정 2026-09-14, #11) |
| D-2 | 대비: Accent 흰 라벨 유지 / secondary 텍스트 / 비텍스트·배지 글자 / focus | §12.1, TOKEN_MAP §2.6–§2.7 | ① CONFIRMED (사용자 결정 2026-09-14, #18-①), **D-01** · ②③④ `가값 (P-01)` · `가값 (P-02)` · `가값 (P-03)` — 디자이너 대기 |
| D-3 | 토큰 정규화 (3-tier, 흡수표: 타입 최소 11px · radius 6단계 · 흰색 알파 3단계, Figma 값만, rename 은 디자이너 요청) | TOKEN_MAP §1, §3.3, §5, §6 | CONFIRMED (사용자 결정 2026-09-14, #10-①②) |
| D-4 | 신규 토큰: focus, status, scrim, z-index, motion, breakpoints, layout, safe-area | TOKEN_MAP §4 | 이름·용도 CONFIRMED (사용자 결정 2026-09-14, #10-③) · 값 `가값 (P-03)`–`가값 (P-09)` (breakpoint·앱 컬럼은 D-5) |
| D-5 | Breakpoint 600/1024 · 앱 컬럼 최대폭 480 · 세로 고정 | §11 | CONFIRMED (사용자 결정 2026-09-14, #12) |
| D-6 | 내비게이션: Library / Home(가운데) / Progress, 세션 탭 없음, 설정 = Home 상단 아이콘 | FIGMA_SCREEN_MAP M-08 | CONFIRMED (사용자 결정 2026-09-14, #15), **D-02** |
| D-7 | 아이콘 소스: Lucide + HARU 전용 Figma SVG + 공식 브랜드 로고 | §7 | CONFIRMED (사용자 결정 2026-09-14, #21) · 크기 `가값 (P-09)` |
| D-8 | Dark mode MVP 제외 | §13 | CONFIRMED (사용자 결정 2026-09-14, #20) |
| D-9 | Capability 색 매핑(Tag 색 통일)·표시 라벨 | TOKEN_MAP §2.7, M-13 | CONFIRMED (사용자 결정 2026-09-14, #19, #14) · 배지 글자 `가값 (P-02)` |
| D-10 | 공통 상태 패턴(Loading/Empty/Error/Offline/Toast/Dialog) = design-agent 명세로 Stage 1 선구현 | COMPONENT_MAP §1 | CONFIRMED (사용자 결정 2026-09-14, #22) · 화면 `가값 (P-10)` |
| D-11 | 캐릭터·표지 에셋 권리 | §8 | CONFIRMED (사용자 결정 2026-09-14, C-17) · 최적화 포맷은 Stage 1 Plan |

Stage 1 을 막는 디자인 결정은 남아 있지 않다. 가값 항목은 Stage 1 구현 후 하나씩 승인한다 (#10-④).
