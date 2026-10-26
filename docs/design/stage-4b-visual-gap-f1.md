# Stage 4b Visual Gap — `S4-F1` (진입 · ready)

Status: **REVIEW (2026-10-26, design-agent)** — 허용 차이 등록 없음 (등록은 사용자 승인 후, 최우선 규칙 6)
Based on: Figma `YWWu3AFEJpRxvw0T5klq0k` — `300:1309`(+`300:1318`) · `139:2803`(`88:838` Type3) · `163:1589` · `285:1445`(`300:1315`) · `29:76` · `78:157` (조회 2026-10-26) · 인계 `docs/qa/stage-4b-handoff.md` §S4-F1 · Spec `stage-4b-design-spec.md`(APPROVED) + 상위 `stage-4-design-spec.md` §2.2·§2.3·§2.6·§5

---

## 0. 측정 방법 (무엇을 어떻게 쟀는가)

| 표기 | 방법 |
|---|---|
| `[ctx]` | `get_design_context(300:1309)` · `(29:76)` · `(78:157)` — 선언값(fill · effect · leading · 위치) |
| `[svg]` | 위 응답의 에셋 SVG 원문을 `curl` 로 받아 읽음 — X(`300:1319`) · X(`29:77`) · back(`77:150`) · mic · 코어 · 메달리온 링 |
| `[probe]` | dev 서버(포트 **5181**, 단독)에서 Playwright(chromium, DPR 1, reduced-motion, dev 패널 숨김)로 `/session/:id` ready 까지 e2e 와 같은 경로로 진입 → `getBoundingClientRect` + `getComputedStyle`. 뷰포트 **393×852 · 393×796 · 320×568** |
| `[px]` | Figma 렌더 PNG(393×852)를 **y 56~852 로 잘라**(상태바 제거) 구현 393×796 스크린샷과 같은 좌표로 픽셀 비교. 텍스트 내용이 다른 영역(버블 제목·pill — Figma 는 placeholder)은 기하만 본다 |
| `[base]` | `git show HEAD:` baseline ↔ 작업트리 baseline 을 8-이웃 연결성분(Δ≥2, 5px 이상)으로 분해 |

스크립트·산출 이미지: 스크래치 `vg/tools/*` · `vg/out/*` (저장소 밖).

---

## 1. 결론 요약

| 심각도 | 수 | ID |
|---|---|---|
| High | 0 | — |
| Medium | 1 (`S4-K` 이월) | VG-F1-06 |
| Low | 5 | VG-F1-01 · 02 · 07 · 08 · 09 |
| Info | 4 | VG-F1-03 · 04 · 05 · 10 |

ready 화면의 **기하는 Figma 와 정합**한다 — 393×796 에서 닫기·링·아바타·버블·Record·바의 y 가 전부 **Figma y − 56 과 정확히 같다**(§2). 어긋남은 이미 등록된 허용 차이·승인된 흡수 외에 **닫기 글리프 1건**(+ 저장소 전역 글리프 색)뿐이다.

---

## 2. 특히 확인 항목 답

### ① 버블 ↔ Record Control 사이 +56 — **환경 차이이며 정합** (VG-F1-05)

`[probe]` 구현 좌표:

| 요소 | Figma y | 393×852 | **393×796** | 320×568 |
|---|---|---|---|---|
| 닫기 | 66 | 10 | **10** | 10 |
| 메달리온 링 190 | 132 | 76 | **76** | 76 |
| 버블 본체 top | 337.627 | 281.63 | **281.63** | 281.63 |
| Record 150 | 621 | **621** | **565** | 560.63 (밀림) |
| 바 279×45 | 789 | **789** | **733** | 728.63 (화면 밖) |

- 위 묶음은 위(safe-area)에, Record·바는 아래에 앵커된다 — 4b Spec §2.1 "위 앵커 / 아래 묶음 / 사이 유연 간격" 그대로다.
- Figma 프레임 852 = 상태바 56 + 콘텐츠 796. 브라우저 393×852 에는 상태바가 없으니 **56 이 남고, 그 56 이 유연 간격에 들어간다**. 393×796 에서는 모든 요소가 Figma − 56 과 **소수점까지 같다**.
- 산술 확인: Figma 간격 14.373 + 56 − (Mock pill 4개가 2줄 = +8) = **62.37** = 구현 실측 621 − 558.63 ✓.
- ⚠️ 실기기는 **반대 방향**이다: iPhone 393×852 standalone(safe-area 위 59 / 아래 34)은 콘텐츠가 759 로 796 보다 **짧고**, Safari 브라우저 툴바가 있으면 더 짧다. 그러면 +56 대신 **압축**이 필요하다 → VG-F1-06.
- **권고**: `S4-K` 의 Figma 대조 스크린샷은 **393×796**(또는 852 에서 상단 56 을 safe-area 로 주입한 조건)에서 찍는다. 852 baseline 은 회귀용으로는 유효하지만 Figma 와 1:1 비교용은 아니다.

### ② 닫기 X 글리프 = `29:76` 인가 — **Figma 끼리는 같고, 구현은 다르다** (VG-F1-01 · 02)

- `[svg]` `300:1319` 와 `29:77` 의 SVG 원문은 **바이트 단위로 같다** (`diff` 동일): 15×15 박스, path `3.125→11.875`(8.75 폭), stroke **1.375**, `stroke-linecap round`, 색 **`#5E7370`**.
- 구현 `[probe]`: Lucide `x` · svg **20×20** @ (340,19) · `stroke-width 1.5`(24 기준 → 실 1.25px) · path `M18 6 6 18 / m6 6 12 12`(실 10px 폭) · 색 **`#4A5F5C`**(`--color-fg-primary`).
- `[px]` 어두운 픽셀 bbox: Figma **10×10** (x/y 14~23) · 52px / 구현 **12×12** (13~24) · 64px. 가장 어두운 값 Figma `(94,115,112)` ↔ 구현 `(73,94,92)`.
- 박스·위치·면·그림자는 일치한다: 38×38 @ (331, 66−56) · `rgba(255,255,255,.74)` · `0 6 4 ink8%` + inset 2겹 ✓.

### ③ 제목 line-height 22 · tail overhang 10.6 — **둘 다 구현이 맞다. Spec 이 틀렸다** (VG-F1-03 · 04)

- **line-height**: `[ctx]` `88:840` = `font-[590] leading-[22px] text-[16px]`. 구현 computed `16px / 22px / 590` ✓. 상위 Spec §2.2.1 의 "`--text-callout`(16/21) Δ1 흡수"는 **같은 절의 높이식 `14+22+6+…=269`** 와 모순이었다. 22 가 Figma 선언이다.
- **tail**: `[ctx]` `88:876` flex column → tail 컨테이너 **22.627** + `mb-[-12px]` → 본체 top = 컨테이너 top + 10.627. 16 정사각형을 −45° 돌린 대각선이 22.627 이므로 꼭짓점 = 컨테이너 top → **overhang 10.627**. 상위 Spec §2.2.2 의 {0, 2.63} 은 metadata 의 회전 노드 y 를 잘못 읽은 것이다.
- `[px]` 가운데 열(x 196)의 첫 흰 행: Figma **273**(272 은 부분 `215`) / 구현 **273**(272 은 부분 `236`) → 차이 **< 0.5px**. 본체 inset 하이라이트 행 282 는 둘 다 같다. ring bottom(266) → 꼭짓점 +5 ✓.

### ④ Spec 밖에서 추가한 토큰 — **전부 정당. 신규 HEX 0** (VG-F1-07)

| 토큰 | Tier | 값 | 판정 | 기존 토큰으로 대체 |
|---|---|---|---|---|
| `--color-surface-medallion-ring` | **Semantic(신규)** | `var(--haru-white-a50)` | **정당** — 상위 Spec §2.2.0 이 Primitive `--haru-white-a50` 를 적었는데, 화면 코드는 Primitive 를 쓸 수 없다(frontend §6). **Spec 오류** | 불가 — white 50% Semantic 이 없다(`a50` 은 shadow 합성에서만 쓰임) |
| `--session-medallion-offset` | T3 | 76px | 정당 (Figma 56→132, 스케일 밖) | 불가 |
| `--session-medallion-ring-size` | T3 | `calc(174 + 2×8)` = 190 | 정당 (파생값) | — |
| `--session-bubble-offset` | T3 | 5px | 정당 (스케일 밖) | `--space-1`(4)은 Δ1 → 흡수하면 버블 위치가 바뀐다 |
| `--session-bottom-gap` | T3 | `var(--space-4-5)` | 정당하지만 **불필요한 별칭** | `--space-4-5` 직접 사용 가능 (선택) |
| `--bubble-session-pad-block-end` | T3 | 13px | 정당 (상위 Spec §2.2.1 이 값을 확정, 이름만 없었다) | 불가 |
| `--bubble-session-title-line` | T3 | `var(--text-headline--line-height)` (22) | 정당. ⚠️ headline 단계 line 값이 바뀌면 같이 바뀌는 **결합** — 리터럴 `22px` 도 가능 (선택) | — |
| `--record-icon-offset-labeled` | T3 | −7px | 상위 Spec §2.6.1 이 이름까지 지정 → Spec 안 | — |
| `--record-pulse-opacity` · `--record-pulse-scale` | T3 | .12 · 1.04 | 상위 Spec §6.2 keyframe 값 그대로 → Spec 안 | — |

→ 사용자 승인이 필요한 새 값은 없다. **Spec 정정**(4b Spec §5 에 등재) 대상이다. 새 Semantic 1건(`--color-surface-medallion-ring`)은 값이 같고 HEX 도 없지만, 4b Spec §5.2 "Semantic 0" 표기와 어긋나므로 **보고**한다.

### ⑤ Reading Context 시트 (Figma 없음 — Stage 3 Spec §2.4) — **규격 일치, 시각 메모 3건**

Stage 3 Spec §2.4 와 일치: `Sheet(title "When will you read?")` · `RadioGroup variant=card` 6값(확정 라벨) · `Pick a time…` 일 때만 `Time` `SelectTrigger` · 시간 목록은 **같은 시트 안에서 전환**(중첩 0) · 00:00~23:30 `HH:mm` · Continue `accent fullWidth` 미선택 시 `aria-disabled`(opacity .5) ✓.
메모: VG-F1-08 (제목·legend 중복) · VG-F1-09 (뒤로 = 오른쪽 `chevron-left`) · VG-F1-10 (시트 면 비침 — 기존 Sheet 규칙).

### ⑥ `D4-11` baseline 표본 3건 — **기대한 대로다**

`[base]` HEAD ↔ 작업트리:

| baseline | 바뀐 px | 클러스터 | 판정 |
|---|---|---|---|
| `frame-393` | 11,576 | TopBar 좌·우 IconButton 각 1개 (89×94, Δmax 15) | 구 3겹 번짐 영역만 ✓ |
| `v9-icon-button` | 9,969 | glass 버튼 2개 (132×62 · 133×62, Δ13~15) + Loading 스피너 가장자리 11×12 Δ9~11(구 번짐 위에 겹쳐 있던 픽셀) + 3×23 Δ2 | 전부 그림자 번짐 영역 안 ✓ |
| `s2-deck` | 5,273 | 덱 이전/다음 IconButton 2개 (82×62 Δ13 · 73×57 Δ7) | ✓ |

새 computed(닫기·TopBar 공통): `0 6px 4px ink8%, inset 0 1.5px 0 white90%, inset 0 -1px 0 ink5%` = `--shadow-bubble` = `[ctx]` `29:76`·`78:157`·`300:1318` 선언 ✓. 설명되지 않는 클러스터는 없다.

### ⑦ `R-SHADOW-1` — **세션 화면에서 클리핑 없음**

- `[probe]` 버블에서 위로 올라가며 `overflow ≠ visible` 인 조상은 **`AppShell` 뷰포트 1개뿐**(0,0,393,852 = 화면 가장자리). 세션 feature 는 `overflow` 를 새로 선언하지 않는다.
- 바 그림자(3겹, 아래 산술 84)는 834+84 > 852 지만 **잘리는 선이 화면 아래 끝**이라 보이지 않는다(규칙 ④). 320 에서 좌우 번짐도 화면 가장자리에서 잘린다.
- 메달리온 링·버블·닫기의 `--shadow-bubble`(아래 10) 주변에 클립 선 없음.
- 예외: 짧은 세로에서는 클립이 **번짐이 아니라 콘텐츠**를 자른다 → VG-F1-06.

---

## 3. Gap 대장

| ID | 위치 | Figma / Spec | 구현 | 심각도 | 권고 | 사용자 승인 |
|---|---|---|---|---|---|---|
| **VG-F1-01** | ready 닫기 글리프 `300:1319` (= `29:77`) | 15×15, 선 폭 8.75, stroke 1.375 `[svg]` | Lucide `x` 20, 선 폭 10, stroke 1.25 → 렌더 12×12 (Figma 10×10) | Low | **수정** — Figma X 를 HARU 전용 SVG 로 export 해 박스 15에 둔다(Stage 0 #21. 상위 Spec §12.4-⑥ 의 "16 흡수"보다 정확하다). 색은 VG-F1-02 결정을 따른다. `S4-F2` 의 recording·paused 닫기(`298:1311`)와 Discard/Complete 화면에도 같이 쓴다 | 불필요 (Figma 쪽으로 맞추는 수정). 단 §12.4-⑥ 미결을 이 방식으로 닫는 것은 보고 대상 |
| **VG-F1-02** | **모든** glass `IconButton` 글리프 색 (저장소 전역) | `#5E7370` — `29:77` X · `77:150` back 둘 다 `[svg]` | `--color-fg-primary` `#4A5F5C` (`IconButton.css:17`) | Low | **사용자 결정** — ⓐ IconButton 글리프 색을 `--color-action-secondary-fg`(= ink-600 `#5e7370`)로 바꾼다(대비 재계산 필요, glass IconButton 쓰는 baseline 18건 이상 재생성) ⓑ 허용 차이로 등록. F1 이 만든 차이가 아니고 Stage 1 부터 있었다 | **필요** |
| **VG-F1-03** | 버블 제목 line-height | Figma 22 `[ctx]` · 상위 Spec §2.2.1 = `--text-callout` 21 | 22 (`--bubble-session-title-line`) | Info | **Spec 정정** — 상위 Spec §2.2.1 "제목 타이포 토큰" 행을 22 로 고친다. 구현은 그대로 둔다 | 불필요 |
| **VG-F1-04** | tail overhang | Figma 10.627 `[ctx]` · 상위 Spec §2.2.2·§12.4-① = {0, 2.63} 미확정 | 10.627 — `[px]` 꼭짓점 < 0.5px 차이 | Info | **Spec 정정** — §2.2.2 ⚠️ 박스와 §12.4-① 을 "10.627 확정(픽셀 프로브)"으로 닫는다 | 불필요 |
| **VG-F1-05** | 버블 ↔ Record 간격 (393×852) | 14.373 (796 콘텐츠) | 62.37 (= 14.373 + 56 − 8) | Info | 정합 — 차이 없음. `S4-K` 의 Figma 대조는 393×796 에서 한다 | 불필요 |
| **VG-F1-06** | 세로가 796 보다 짧은 화면 | 4b Spec §8.2 / `CP-7` 압축 순서 | 압축 없음. 320×568: Record top 560.6, 바 728.6 → **바가 화면 밖, Record 하단이 잘림** | Medium (**`S4-K` 소관, F1 FAIL 아님**) | `S4-K`(AC-4-99)에서 구현. ⚠️ 실기기(393×852 standalone = 콘텐츠 759, Safari 는 더 짧음)에서는 이 상태가 **기본**이므로 `S4-K` 를 늦추지 않는다 | `AD-S4-18` 은 D4-58 로 결정됨 — 구현 후 Visual Gap |
| **VG-F1-07** | Spec 밖 토큰 | 4b Spec §5.2 "Semantic 0" | Semantic 1 + T3 6 (§2-④ 표) | Low | **Spec 정정** — 4b Spec §5 에 등재. 선택: `--session-bottom-gap` 별칭 제거, `--bubble-session-title-line` 을 리터럴 22 로 | 불필요 (보고만) |
| **VG-F1-08** | Reading Context 시트 — 제목과 legend 가 같은 문장 2번 (`When will you read?` ×2, 시간 뷰 `Time` ×2) | Stage 3 Spec §2.4 트리에는 legend 가 보이지 않는다 | 보인다. Stage 2 `SelectTrigger` 시트 선례와 같다(Shared UI `SelectTrigger.tsx:142`) | Low | **사용자 결정** — ⓐ 선례대로 유지 ⓑ `RadioGroup` 에 legend 시각 숨김 옵션 추가(접근성 이름 유지 — Stage 2 시트에도 적용). 이 단위만 다르게 하지 않는다 | **필요** (`F1-8` ⑧) |
| **VG-F1-09** | Reading Context 시간 목록 — 뒤로 버튼 | §2.4 "back 으로 돌아온다" (배치 미명세) | 헤더 **오른쪽** `trailing` 에 `chevron-left` 38×38 @ (331, 69) | Low | **사용자 결정** — 왼쪽을 가리키는 아이콘이 오른쪽에 있다. ⓐ 유지 ⓑ `Sheet` 에 leading 슬롯을 추가해 왼쪽에 둔다(Shared UI 확장) ⓒ 오른쪽에 두고 닫기형 아이콘(`x`) + 이름 `Back`. 권고 ⓑ | **필요** (`F1-8` ③) |
| **VG-F1-10** | Sheet 면 비침 | 기존 Sheet = `--color-surface-strong`(white 90%), blur 없음 | 시간 목록처럼 시트가 커지면 뒤의 Home 카드 글자가 시간 행 사이로 비친다 | Info (기존 규칙 — F1 회귀 아님) | 기록만. `s3-library-book-sheet` 에서도 같은 현상이 보인다 | 불필요 |

### 이미 등록·승인되어 Gap 으로 세지 않은 차이

| 항목 | 근거 |
|---|---|
| 버블 x 32 (Figma 34) | `AD-S4-9` (`D4-49`) |
| 바 x 57 (Figma 67) | `AD-S4-5` (`D4-19`) |
| ready 바 둘 다 opacity .5 (Figma `300:1316/1317` 은 활성 모양) | `D4-12`(ready 비활성) + `D4-18` + `AD-S4-6` |
| 바 버튼 drop 3겹 (Figma 인스턴스 2겹 — `0 28 56` 미렌더) | 기존 `AD-3` 패턴 (상위 Spec §2.3) |
| `Tap to recording` 11px (Figma Medium 10) — `[px]` 글자 폭 86 vs 77 | 상위 Spec §5.4-② 흡수 (디자이너 Q16 미결) |
| pill 2줄 = 40 (Figma 선언 38) | 상위 Spec §2.2.3-① |
| 배경 그라디언트 채널 차 ~5 | Figma 는 852 프레임 기준, 구현은 뷰포트 기준으로 그라디언트를 늘린다 — 환경 차이 |

### 일치 확인 (`[px]`·`[probe]`)

메달리온 링 190 @ (101.5, 76) · white 50% · `--shadow-bubble` ✓ · 아바타 174 @ (109.5, 84) ✓ · 버블 329 · white 90% · radius 22 · pad 14/16/13 · `--shadow-bubble` ✓ · 제목 y = 본체 + 14, 첫 pill y = 본체 + 42 ✓ · Record 마이크 글리프 bbox **픽셀 단위로 같다** (x 65~86, y 53~82, 254px) ✓ · 링 2겹·코어 렌더 일치 ✓ · 바 135×45 ×2, gap 9 ✓.

---

## 4. development-agent 메모

1. **VG-F1-01**: `29:77` X 를 HARU SVG(15×15, stroke 1.375, round cap)로 export 한다. 박스 15 를 Tier-3 로 둔다(`--icon-button-icon-size` 20 을 바꾸지 않는다 — back 18 은 기존 흡수가 유지된다). 색은 VG-F1-02 결정 전까지 `currentColor`.
2. VG-F1-02·08·09 는 사용자 결정 전까지 **손대지 않는다**.
3. `S4-K` 의 Figma 대조 스크린샷은 393×796 기준으로 찍는다 (VG-F1-05).
