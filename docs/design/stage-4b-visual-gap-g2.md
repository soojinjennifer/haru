# Stage 4b `S4-G2` Visual Gap 검토 — Prompt Drawer `88:960` (+ `VG-G1-03` 잔여)

Status: **REVIEW (2026-10-29, design-agent)** — 허용 차이 **등록하지 않음**(사용자 승인 사항). Production Code · Figma 수정 없음.
Based on: Figma `YWWu3AFEJpRxvw0T5klq0k` `88:960` · `88:684` · `88:700` · `88:692` · `138:2253` · `86:324` · `296:1257` (확인 2026-10-29) · `docs/design/stage-4b-design-spec.md` (APPROVED 2026-10-26) · 상위 `docs/design/stage-4-design-spec.md` §3.2 · §5.2 · §8 · §12.4 · 인계 `docs/qa/stage-4b-handoff.md` `S4-G2` · 결정 `D4-49`(`AD-S4-7`) · `D4-52` · `D4-53` · `D4-58` NB-1 · Stage 3 `D-8`.

## 0. 어떻게 쟀는가 (`R-FIGMA-1` ⑤ — "실측했다"는 서술이 아니라 방법)

| 근거 | 방법 |
|---|---|
| `[fig-ctx]` | `get_design_context(88:960 · 88:684 · 88:700 · 88:692 · 138:2253)` 선언값 · `get_metadata(88:960 · 86:324)` 좌표 · `get_variable_defs(86:324)` |
| `[fig-svg]` | 화살표 에셋 **6개 원문**(88:960 좌/우 · 88:684 좌/우 · 88:700 좌/우)을 asset URL 에서 받아 `path d` · `fill` 대조 |
| `[impl]` | 임시 Playwright(scratchpad config, 포트 **4339**, 단독 실행, reduce, dpr 1)로 393/320/1024 × 852 · n=5 · recording · Drawer 1번째 페이지에서 `getBoundingClientRect`(시트 기준 상대좌표) + `getComputedStyle` + `Range` 글리프 박스 |
| `[px]` | baseline PNG(`s4-prompt-drawer.png` · `s4-session-prompts.png`) 와 `get_screenshot(296:1257, 1:1 337×303)` 픽셀 행 프로브 (PIL) |

좌표는 전부 **Drawer 좌상단 기준**. Figma 폭 353 ↔ 구현 345(`AD-S4-7`) 이라 x 는 ±8 이 정상이다.

## 1. 일치 항목 (Gap 아님)

| 요소 | Figma `[fig-ctx]` | 구현 `[impl]` @393 | 판정 |
|---|---|---|---|
| 면 | white 86% + blur 12 | `rgba(255,255,255,0.85)` · `blur(12px)` (`T-1` 승인 흡수 Δ0.01) | ✅ |
| 그림자 | drop 3겹 `0 2 4 /.08` · `0 12 28 /.16` · `0 28 56 /.12` + inset `0 1.5 0 white .9` · `0 -1 0 /.05` | computed 5겹 **동일** | ✅ |
| radius | 30 | 28 (`--radius-card` 흡수, 상위 §3.2 승인) | ✅ |
| padding / gap | pt10 · pb18 · px20 · gap10 | 10 · 18 · 20 · 10 | ✅ (선언 기준 — 렌더 결과는 VG-G2-02) |
| 핸들 | 40×4 · y12 · 가운데 · `ink-600 30%` | 40×4 · y12 · 가운데(152.5 = (345−40)/2) · 같은 색 | ✅ |
| 제목 | SF Pro Bold 17 / 22.1 `#4a5f5c` · **hug + items-start → 왼쪽 시작** (렌더 PNG 도 왼쪽) | 700 · 17/22 · `rgb(74,95,92)` · `text-align:start` · x20 | ✅ (⚠️ 상위 Spec §3.2 표의 "가운데" 는 **오기** — 선언 `text-center` 는 hug 박스 안이라 효과 없음. Spec 정정 대상) |
| 부제 | Regular 13 / 18.85 `#7d9291` · 왼쪽 시작 | 400 · 13/18 · `rgb(125,146,145)` · start | ✅ |
| pill 면 | `#dbeee7` · 1px `#5e73702e` · r100 · px12 py8 · h40 · 슬롯 위 2.24 | `rgb(219,238,231)` · inset 1px `/.18` · pill · 12/8 · 40 · margin 2 / 3 | ✅ |
| 화살표 위치 | 24×24 · pill 안 px12 | Previous x32(=20+12) y98(=90+8) · Next x289(=305−12−24+20) | ✅ |
| 화살표 path | Material 채움 chevron | `carousel-previous.svg`/`-next.svg` `d` **6개 에셋 원문과 문자 단위 일치** `[fig-svg]` | ✅ (VG-G2-05) |
| 노트 | 313×158 · 1px 18% · r16 · **면 없음** · pt12 pb13.19 px15 · 12/15.6 `#5e7370` | 305×158 · inset 1px · 16 · 투명 · 12/13/15 · 12/15.6 `rgb(94,115,112)` · 글자 x35 | ✅ (면 없음 = 상위 §12.4-⑦ 미결이나 세션 Drawer 는 Figma 대로) |
| dots | 활성 20×7 `#5e7370` + 점 7 `/.30` · gap 6 · r4 · 가운데 | 동일 치수·색·gap · 가운데 | ✅ (개수는 VG-G2-08) |
| 폭 | 353 | 393→**345** · 320→**272** · 1024→**432** | ✅ `AD-S4-7`(`D4-49` 등록) |

세로 누적 **−2.765**: 제목 줄 22 (Figma 컨테이너 23) −1 · 부제 18 (Figma 18.85 + pb 0.765) −1.765 → pill y90 (Figma 93.0 − 슬롯 보정 0.235 ⇒ 실측 Δ−3.0) · 노트 y143 (145.765) · dots y311 (313.765). **상위 Spec §3.2 가 승인한 `--text-headline`(17/22) · `--text-footnote`(13/18) 흡수의 산술 결과**이므로 별도 Gap 으로 세지 않는다.

## 2. Gap 목록

| Gap ID | 위치 | 기준 (Figma / Spec) | 구현 | 심각도 | 권고 | 사용자 결정 |
|---|---|---|---|---|---|---|
| **VG-G2-01** | Drawer 화면 내 세로 위치 | `88:960` **미배치 컴포넌트** — 화면 안 아래 여백 근거 **없음** (확인 불가) | 좌·우·아래 = gutter **24** + safe-area (bottomGap 24 @393/320/1024) | Low | ⓐ **현행 유지(권고)** — "아래 = 좌우" 규칙은 `L-NEW-03`(inset-card 14+safe) 과 **같은 규칙**이고 좌우 24 는 `AD-S4-7` 귀결 ⓑ inset-card 와 숫자까지 맞춰 14 ⓒ 디자이너에게 배치 프레임 요청 | **필요** |
| **VG-G2-02** | Drawer 높이 · dots 아래 여백 | 선언: 고정 높이 **331.765** + pb 18. 자식 합 = 320.765 + 18 = **338.765** → Figma 는 내용이 pb 안으로 **7 넘친 채** 그려진다. **렌더 결과: 카드 331.765 · dots 아래 11** `[fig-ctx · meta]` | 선언 pb 18 채택 → **345×336**, dots 아래 **18** | Low (시각 Δ7 — 하단 여백) | ⓑ **렌더 기준(권고)**: dots 아래 = **11** (→ 높이 329 @393, Figma 331.765 와 Δ−2.765 = 위 §1 흡수분만 남음). 근거: 상위 §2.2.2 가 같은 유형(선언 박스 ↔ 본체 불일치)을 **렌더 바운드로 역산**해 정했다. 토큰은 `--sheet-floating-pad-block-end: 11px`(스케일 밖 리터럴) 또는 `--space-2-5`(10, Δ1 흡수) 중 택1 ⓐ 현행 18 유지(선언 pb 를 디자이너 의도로 본다 — 고정 높이가 갱신 안 된 흔적일 수 있음, **확인 불가**) ⓒ 디자이너 확인 | **필요** |
| **VG-G2-03** | 캐러셀 pill 폭 | Figma pill 310 / 본문 313 (오른쪽 3 여백, 왼쪽 정렬). Spec `T-10` `--prompt-drawer-pill-width: 310` | `min(310px, 100%)` → 393 **305** · 320 **232** · 1024 **310 (본문 392 — 오른쪽 82 빈칸)** | 393/320: Low · **≥480: Medium** | 393·320 의 305/232 는 **`AD-S4-7` 의 귀결이 맞다**(본문 305 < 310). 그러나 ≥480 에서 pill 310 + 노트 392 는 Figma 비율(310:313 ≈ 같은 폭)을 깬다 → ⓑ **pill = 본문 100%(권고)** — 노트와 같은 폭, 393 에서 Figma 의 오른쪽 3 여백만 사라진다(Δ3, `AD-S4-7` 와 같은 성격) ⓐ 현행 ⓒ `calc(100% − 3px)` | **필요** |
| **VG-G2-04** | Drawer pill 의 `PRE`/`POST`/페이지 배지 | 배지 외형 = `Pagetag1` (`138:2253` Tagtype): h22 · px13 · `#a0ccdd` · 흰 12/12 590 · 배지↔문구 gap 10. **단, Figma 9개 Prompt Card 변형 중 "화살표 + 배지" 조합은 없다** (화살표 계열 6종 = 배지 없음, Tagtype/pagetype = 화살표 없음 `[meta 86:324]`). `88:708` 인스턴스는 배지 없는 자리표시 문구 | 49.42×22 · `rgb(160,204,221)` · 흰 12/12 590 · px13 · gap 10 — **배지 자체는 Pagetag 와 일치**(폭 −0.58 은 SF Pro 글리프 폭) | Low | 조합은 Stage 3 **`D-8`**("Figma 기준 배지를 최종적으로 보이게") + COMPONENT_MAP `PromptPill` 사용처 "…, **Drawer**" 로 근거가 있다 → ⓐ **유지(권고)**. 부수 효과를 함께 승인받는다: 문구 폭 233→**173** @393, **320 에서 2줄 말줄임 발생**(`What do you / think is behind…`), 배지 2개(`phase`+`pageRef`) 경우 문구 폭 ≈118 @393 — **세션 fixture 에 `pageRef` 값이 없어 미측정**(`bare` 2줄 clamp 가 넘침은 막는다) ⓑ Drawer 에서만 배지 미렌더(Figma 인스턴스 그대로) | **필요** (Figma 공백 지점 확인) |
| **VG-G2-05** | 화살표 SVG 2종 · 색 | `[fig-svg]` path: Previous `M15.205 16.59L10.625 12…` · Next `M7.795 16.59L12.375 12…` (6개 에셋 공통). fill: `88:684` arrow_first = 좌 `#F2F2F7` / 우 `#B0CFC0` · `88:700` arrow_last = 반대 · **`88:960` 인스턴스(= `88:692` color/arrow) 는 dots 가 1페이지인데 좌우 모두 `#B0CFC0`** | path 동일 · fill → `currentColor` · 1페이지 Previous `rgb(242,242,247)` + `aria-disabled` · Next `rgb(176,207,192)` | — (Gap 아님) | Figma `88:960` 의 "1페이지 + 양쪽 활성" 은 **인스턴스 변형 선택의 자기 불일치**다. 구현은 상위 §3.2-3(첫/끝 disabled) · 변형 `arrow_first`/`arrow_last` 의미를 따랐다 → 유지. 디자이너 정리 목록에만 추가 | 불필요 (보고만) |
| **VG-G2-06** | 신규 토큰 | 상위 Spec §5.2 는 `T-1` · `T-10`(`--prompt-drawer-width` · `--prompt-drawer-pill-width: 310` · `--prompt-drawer-note-min-height: 158`)만 명세. 노트 본문 = `--text-caption-1`(12/16, Δ−0.4) **흡수**로 명세 | §3 표 참조 — primitive 1 · semantic 2(+`T-1` 1) · Tier-3 20 | Low | §3 의 항목별 권고 | **필요** (`--haru-gray-6` · 노트 15.6 · T-10 명칭) |
| **VG-G2-07** | `Sheet` 확장 (variant `floating` · surface `drawer`) | 상위 Spec §3.2 명세 1 = **`variant="bottom"` + surface 분기** | `floating` 신설 + `drawer` surface | Low (Spec 이탈 · 외형은 Figma 쪽으로) | **정당하다**: `bottom` 은 전폭 · 위 모서리만 radius · padding 24 라 `AD-S4-7` 폭 · 네 모서리 · 핸들 40 · 10/20/18 · Bold 제목을 표현 못 한다 — **Spec 의 `bottom` 지정이 Figma 와 맞지 않았다**. 다른 variant 외형 불변(baseline 0장 변화, 인계 확인). ⚠️ **통합 후보**: `inset-card`(Library) 와 `floating` 은 둘 다 "네 모서리 28 의 떠 있는 카드"이고 inset(14/24)·padding·gap·핸들·제목 굵기만 다르다 → 향후 `inset-card` 1종 + Tier-3 파라미터 / `handle` prop 으로 합칠 수 있다(COMPONENT_MAP 등재 권고, 지금 변경 불요). 제목 Bold 가 variant CSS 에 묶인 점(`.haru-sheet--floating .haru-sheet__header .haru-text`)은 결합이 강하다 — 통합 시 함께 정리 | Spec 정정 승인 **필요** |
| **VG-G2-08** | dots 개수 | `88:897` **3 고정** | 페이지 수(n=5 → 5) | Low | 상위 §12.4-④ **제안안(개수 연동)** 을 적용했다 — §12.4-④ 는 아직 **미결**이다 → 이번에 확정 승인 | **필요** |
| **VG-G2-09** | 핸들 폭 | `88:669` 40×4 | floating 만 40 · `bottom` 시트 36 유지 | Low | 상위 §12.4-⑤(미결) 그대로 두는 것은 타당(다른 baseline 불변). 단 `Sheet.css` 의 `.haru-sheet__grabber` 주석 *"Figma `88:960` — 36×4"* 는 **사실과 다르다**(88:960 은 40) — development-agent 주석 정정 권고 | 불필요 (§12.4-⑤ 는 기존 미결 유지) |
| **VG-G2-10** | 닫기 모션 | Figma 모션 정의 없음 (Reactions 비노출 — 확인 불가) | 기존 `haru-sheet-out` translateY(100%) — 떠 있는 카드라 마지막 프레임에 아래 24 띠가 빈 채 잠깐 보일 수 있음(인계 ⑬). reduce = fade | Low | ⓐ 현행(inset-card 와 같은 동작) — **권고** ⓑ floating 만 `translateY(calc(100% + inset))` | 선택 |
| **VG-G2-11** | 비텍스트 대비 | — | 활성 화살표 `#b0cfc0` on `#dbeee7` = **1.39:1** (WCAG 1.4.11 3:1 미달) · 비활성 1.08:1(비활성은 예외) | Low (a11y) | Figma 값 그대로라 수정 대상 아님 → **가값 `P-02`(비텍스트 요소) 범위에 "캐러셀 화살표" 포함**을 확인받는다. 기능 대안: 스와이프 + 키보드 `ArrowLeft/Right` 존재 | **필요** (P-02 범위) |
| **VG-G2-12** | 320 폭 | Figma 320 프레임 없음 | 부제 2줄(높이 354) · pill 문구 2줄 말줄임 | Info | 상위 §8 규칙 범위 — 문구 줄바꿈은 정상. 기록만 | 불필요 |
| — | 제목 끝 공백 | `Prompts of this session␠` (§12.4-⑩ 미결) | 제거 (화면 영향 0) | Info | 유지 | 불필요 |

## 3. 토큰 검토 (VG-G2-06 상세)

| 토큰 | 값 | 정당성 · 기존 대체 가능성 | 권고 |
|---|---|---|---|
| `--haru-gray-6` (primitive) | `#f2f2f7` | Figma 변수 `grays/gray-6` = `backgrounds/secondary` = `#f2f2f7` `[var-defs 86:324]`. ⚠️ **`DESIGN_TOKEN_MAP.md` L127 · L390 은 이 값을 "가져오지 않음"으로 기록**하고 있다 → 기존 결정과 충돌. 대체 후보: `--haru-mist-50 #edf3f1` (Δ 5/1/6 — 채널 최대 6 > `VISUAL_THRESHOLD` ≈5.3) · `--haru-white` (Δ13) | **도입 승인(권고)** — `--haru-gray-2`(`P-25`) 선례와 같은 iOS gray 계열 명명. 승인 시 TOKEN_MAP L127·L390 갱신 |
| `--color-carousel-arrow` | → `--haru-palette-mint` | `--color-icon-flip` 과 값 동일하나 의미(플립 아이콘)가 다르다 | 유지 |
| `--color-carousel-arrow-disabled` | → `--haru-gray-6` | 위에 종속 | 유지 |
| `--color-surface-drawer` | → `--haru-white-a85` | `T-1` 승인분 | ✅ 등재됨 |
| `--sheet-floating-*` 8 | inset 24(`--layout-gutter`) · inset-block-end 24+safe · pad 10/18/20 · gap 10 · grabber 40px · grabber-margin 2 | 리터럴은 grabber 40 하나. pad-block-end 는 VG-G2-02 결정에 따라 바뀔 수 있다 | 등재 |
| `--prompt-carousel-*` 7 | bar 310 / 40 · margin 2 / **3px** · gap 10 · arrow 24 · hit 44 | Spec `T-10` 명칭 `--prompt-drawer-pill-width` 가 **`--prompt-carousel-bar-width` 로 바뀌었다** (Shared UI `PromptCarousel` 소속이라 합리적). `--prompt-drawer-width` 는 inset 파생이라 불필요. bar-width 는 VG-G2-03 ⓑ 채택 시 **삭제** | Spec `T-10` 명칭 정정 등재 |
| `--prompt-drawer-note-*` 5 | min-h 158 · px **15px** · pt 12 · pb **13px** · line **15.6px** | ⚠️ Spec 은 노트 본문을 `--text-caption-1`(12/**16**)로 **흡수**하도록 명세 — 구현은 15.6 리터럴(Figma 쪽). 4줄 기준 Δ1.6 | ⓐ **15.6 유지 + Spec 정정(권고)** — Figma 선언과 일치, 노트 높이는 min 158 이라 외형 영향 없음 ⓑ Spec 대로 16 |

**Spec / TOKEN_MAP 등재 필요 목록** (승인 후 design-agent 가 반영): `--haru-gray-6` · `--color-carousel-arrow` · `--color-carousel-arrow-disabled` · `--sheet-floating-inset` · `-inset-block-end` · `-pad-block-start` · `-pad-block-end` · `-pad-inline` · `-gap` · `-grabber-width` · `-grabber-margin` · `--prompt-carousel-bar-width` · `-bar-height` · `-bar-margin-block-start` · `-bar-margin-block-end` · `-gap` · `-arrow-size` · `-arrow-hit` · `--prompt-drawer-note-min-height` · `-pad-inline` · `-pad-block-start` · `-pad-block-end` · `-line` (총 23 = primitive 1 + semantic 2 + Tier-3 20). 함께: `SheetVariant 'floating'` · `SheetSurface 'drawer'` (COMPONENT_MAP · 4b Spec §4 집계 "Shared UI 확장 5" → 7).

## 4. `VG-G1-03` 잔여 — `See all prompts` 밑줄 (허용 차이 **후보**)

`[px]` 팝업 좌상단 기준 행 프로브 (Figma `get_screenshot(296:1257)` 1:1 337×303, 카드 원점 x4 y0 · 구현 baseline `s4-session-prompts.png` 카드 원점 y272):

| | 글자 잉크 (진한 행) | 밑줄 | 글자 꼭대기 ↔ 밑줄 |
|---|---|---|---|
| Figma | 265 – 276 (264 옅음) | **277 진함 + 278 옅음(평균 180)** ≈ 1.3px | 12행 |
| 구현 (`from-font` 적용 후) | 266 – 277 (265 옅음) | **278 한 행** | 12행 |

해석: 밑줄만 처진 것이 아니라 **글자 줄 전체가 1px 아래**에 있고, 글자↔밑줄 간격은 Figma 와 **같다**. 남는 것은 ① 줄 전체 +1px ② 두께 1.0 ↔ ≈1.3. Chromium + 시스템 SF Pro 의 baseline·밑줄 두께 반올림이며 CSS 로 sub-pixel 두께를 강제하면 플랫폼별 렌더가 갈린다.
**권고: 허용 차이 등록 후보** (Low, 사용자 승인 대기 — 등록하지 않았다). 대안: `text-underline-offset`/`thickness` 리터럴로 맞추기 — 시스템 폰트 렌더 의존이라 **비권고**.

## 5. 사용자 결정 필요 항목 (요약)

| # | 항목 | 권고안 |
|---|---|---|
| 1 | VG-G2-01 Drawer 아래 여백 | 24 + safe-area 유지 |
| 2 | VG-G2-02 높이 / dots 아래 여백 | **렌더 기준 11** (높이 329 @393) |
| 3 | VG-G2-03 pill 폭 | **본문 100%** (≥480 의 82 빈칸 제거, 310 cap 토큰 삭제) |
| 4 | VG-G2-04 Drawer pill 배지 | 유지 (`D-8` 적용 확인) — 320 말줄임 · 배지 2개 미측정 함께 수용 |
| 5 | VG-G2-06 `--haru-gray-6` 도입 · 노트 행간 15.6 · `T-10` 명칭 | 도입 · 15.6 · 명칭 정정 |
| 6 | VG-G2-07 `Sheet floating`/`drawer` — Spec §3.2 명세 1 정정 | 승인 + 통합 후보 등재 |
| 7 | VG-G2-08 dots 개수 연동 (§12.4-④ 확정) | 개수 연동 |
| 8 | VG-G2-11 활성 화살표 1.39:1 → `P-02` 범위 포함 | 포함 |
| 9 | `VG-G1-03` 잔여 | 허용 차이 후보로 등록 여부 |
| (선택) | VG-G2-10 닫기 모션 | 현행 |

## 6. development-agent 메모 (결정 후)

- #2 ⓑ 채택 시 `--sheet-floating-pad-block-end` 값만 교체 → `s4-prompt-drawer` baseline 재생성 시 diff 는 **시트 하단 7px 띠 + 그림자 이동**만 나와야 한다(`R-BASELINE-1` ⑤).
- #3 ⓑ 채택 시 `.haru-prompt-carousel__bar` `inline-size: 100%` · `--prompt-carousel-bar-width` 삭제 · 토큰 개수 테스트 갱신. 1024 기하 e2e 에 pill 폭 = 노트 폭 단정 추가.
- `Sheet.css` `.haru-sheet__grabber` 주석 정정 (VG-G2-09).
- 배지 2개 Drawer 케이스를 보려면 `pageRef` 있는 세션 fixture 가 필요하다 — 시나리오 추가 여부는 plan-agent 판단.
