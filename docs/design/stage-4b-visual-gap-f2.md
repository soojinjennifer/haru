# Stage 4b Visual Gap — `S4-F2` (recording · paused)

Status: **REVIEW (2026-10-29, design-agent)** — 허용 차이 등록 없음 (등록은 사용자 승인 후, 최우선 규칙 6)
Based on: 인계 `docs/qa/stage-4b-handoff.md` §`S4-F2`(F2-1~F2-9) · Spec `docs/design/stage-4b-design-spec.md`(APPROVED, §16 포함) · 상위 `stage-4-design-spec.md` §2.6 · §5.4 · §6 · 결정 `D4-5`·`D4-19`·`D4-49`·`D4-51`·`D4-56`·`D4-58`·`D4-62` · 허용 차이 `AD-S4-1`~`AD-S4-18`(등록분)

---

## 0. 측정 방법과 한계

### 0.1 ⚠️ Figma 재실측 실패 — 이 세션에서도 읽기 도구가 전부 거절됐다

| 도구 | 노드 | 결과 (오류 문구 그대로) |
|---|---|---|
| `get_metadata` | `298:1262` | *"Looks like you don't have edit access to this file. The file owner can share it with you and make you an editor."* — Debug UUID `37508cd3-572a-4338-82c8-9f8575a6ef69` |
| `get_screenshot` | `298:1262` | 같은 문구 — `f7076d5a-8f6a-46de-ac7a-da52b0bfa39a` |
| `get_variable_defs` | `298:1340` | 같은 문구 — `73f0b373-40a1-41e0-bce7-6b751673cec6` |
| `get_design_context` | `298:1245` | 같은 문구 — `b38b969d-b93b-4fcc-8500-1f04ec1bbb22` |

구현자 보고(F2-1)와 같은 실패다. 읽기 도구인데 *"edit access"* 오류가 나온다 — **파일 공유 권한(또는 MCP 세션·rate limit) 문제로 보이며 사용자 확인이 필요하다.** (서버 안내문은 파일 도구 전에 `create_session` 을 요구하지만 이 Agent 에는 그 도구가 노출되지 않았다.)

**대체 기준** (`R-FIGMA-1` ① "선언값" 을 이번에는 **직접 재조회하지 못했다**):

| 표기 | 내용 |
|---|---|
| `[spec]` | 4b Spec §2.2·§2.3·§2.5 의 `[ctx]`·`[var]`·`[svg]` 선언값 (design-agent 2026-10-26 실측) |
| `[fpng]` | 앞 세션이 `get_screenshot` 으로 받아 둔 **Figma 렌더 PNG** 393×852 1x — `recording.png`(`298:1262`) · `paused.png`(`298:1340`) · `variants.png`(`298:1261`), **2026-10-25 23:26** (scratchpad `fig4b/`). ⚠️ Spec 실측(10-26)보다 하루 앞선다. Spec §0.2 가 10-26 에 바뀐 것으로 적은 것은 팝업(`296:1257`)뿐이라 recording·paused 는 같다고 보지만 **확인하지 못했다** |
| `[probe]` | dev 서버 **포트 5191**(단독)에서 Playwright chromium · DPR 1 · `reducedMotion: reduce` · dev 패널·dev nav 숨김 · `page.clock` 으로 `03:24` 고정. e2e 와 같은 경로(로그인 → Start Session → Bedtime → Record). `getBoundingClientRect` + `getComputedStyle`. 뷰포트 **393×852 · 393×796 · 393×700 · 320×568** + `session:book-long-title`·`book-no-cover`·`book-missing` |
| `[px]` | `[fpng]` ↔ 구현 스크린샷을 **같은 좌표**로 놓고(393×796 구현 = Figma y−56) 픽셀 bbox · 영역 평균 Δ · 피복량(배경보다 밝은 정도의 합 ÷ (255−배경)) 비교. 텍스트 내용이 다른 곳(책 제목 — Mock 데이터)은 기하만 본다 |

스크립트·산출물: scratchpad `vgf2/` (`probe.cjs` · `bbox.py` · `out/*.png|json` — 저장소 밖).

---

## 1. 결론 요약

| 심각도 | 수 | ID |
|---|---|---|
| High | 0 | — |
| Medium | 1 (`S4-K` 이월, 악화 아님) | VG-F2-06 |
| Low | 2 | VG-F2-01 · VG-F2-02 |
| Info | 7 | VG-F2-00 · 03 · 04 · 05 · 07 · 08 · 09 |

recording·paused 화면의 **기하·선언값은 Spec 과 맞는다.** 393×796 에서 모든 요소가 **Figma y − 56 과 정확히 같고**, 등록된 허용 차이(`AD-S4-5` 바 x · `AD-S4-13` 책 칩 가운데) 밖의 위치 차이는 없다. 어긋남은 **`mic-off` 선 굵기**(−25%)와 **경과 시간 숫자 폭**(`tabular-nums`, +6px) 두 건이다. 둘 다 **Figma 원본을 다시 읽어야 확정**된다(§0.1).

---

## 2. 특히 확인 항목 답

### ① 요소 위치·크기 — 정합 (y−56 기준)

`[probe]` (x, y, w, h). Figma 는 `[spec]` §2.1·§2.2 표 값.

| 요소 | Figma | 393×796 | 393×852 | 판정 |
|---|---|---|---|---|
| Prompts 칩 | (24, 66, 117, 36) | (24, **10**, 114.64, 36) | 동 | ✅ y·h. 폭 −2.36 → VG-F2-03 |
| 닫기 | (331, 66, 38, 38) | (331, **10**, 38, 38) | 동 | ✅ |
| 메달리온 링 | y132 · 190 | y**76** · 190 | 동 | ✅ |
| 책 칩 | y337 · h40 · x82(rec)/80(paused) | y**281** · h40 · 가운데(중심 196.5) | 동 | ✅ (x 는 `AD-S4-13`) |
| 상태 블록 | y400 · h111 · 폭 133 / 201 | y**344** · h111 · 137.53 / 198.3 · 중심 196.5 | 동 | ✅ y·h. 폭은 VG-F2-02·03 |
| 상태 pill | h32 · 116 / 96 | h32 · 113.61 / 94.5 | 동 | ✅ h. 폭 VG-F2-03 |
| 경과 시간 | y442 · h41 | y**386** · h41 | 동 | ✅ |
| 보조 줄 | y493 · h18 | y**437** · h18 | 동 | ✅ |
| Record Control | y621 · 150 | y**565** · 150 | y621 | ✅ (852 의 +56 은 유연 간격 — VG-F1-05 와 같다) |
| 하단 바 | y789 · 279×45 · x67 | y**733** · x57 | y789 · x57 | ✅ (x 는 `AD-S4-5`) · 버튼 135 + gap 9 · 둘 다 opacity 1 |

`[px]` 영역 대조(393×852, Figma ↔ 구현): Record Control(recording) 평균 Δ **1.19**, 최대 16 — 사실상 동일. pill 유리면 bbox Figma `139–253` ↔ 구현 `140–252`(±1). 시간 숫자 y `390–424` ↔ `389–424`. 보조 줄 y `442–452` ↔ `441–452`.

### ② 상태 pill · 경과 시간 · 보조 줄 — 정합 (시간 폭 1건 제외)

| 항목 | Figma `[spec]` | 구현 computed | 판정 |
|---|---|---|---|
| pill 면 · 그림자 | white 74% · **그림자 없음** | `rgba(255,255,255,0.74)` · `box-shadow: none` | ✅ |
| pill padding · gap | 14 / 6 · 8 | 14 / 6 · 8 | ✅ |
| pill 라벨 | Subheadline Regular 15/20 · text-primary | 15px / 20px / 400 · `rgb(74,95,92)` | ✅ |
| recording dot | 8 · 채운 원 `#85BFB6` | 8×8 · `rgb(133,191,182)` · 그림자 0 | ✅ |
| **paused dot** | 8 · 빈 원 stroke **1.5** `#7D9291` · 안 투명 | 8×8 · 배경 투명 · `inset 0 0 0 1.5px rgb(125,146,145)` | ✅ `[px]` 링 bbox Figma `163–169 × 356–363` ↔ 구현 `163–170 × 356–363`. `border` 대신 inset 그림자로 그린 이유(Chromium 1x 에서 `border 1.5px` → 1px)는 F2-8 ⑧ — 그림자 번짐 0 이라 `R-SHADOW-1` 비대상 |
| 시간 | SF Pro **Bold 48 / 41** · primary(rec) / secondary(paused) | 48px / 41px / 700 · `rgb(74,95,92)` / `rgb(125,146,145)` · `tabular-nums` | ✅ 값. ⚠️ 폭 → **VG-F2-02** |
| 보조 줄 | Footnote 13/18 · text-secondary | 13px / 18px / 400 · `rgb(125,146,145)` (두 상태) | ✅ |
| 문구 | `Recording`/`Paused` · `Up to 30:00` / `Tap the button to keep recording` | 같음 | ✅ |
| 모션 | recording = 메달리온 링 breathing 만 · paused 없음 · dot 정지 | recording: `haru-session-breathing` 1.2s(`--motion-duration-pulse`) 링 1건만 · paused: 애니메이션 0 · reduce: 0 | ✅ (상위 §6.3) |

### ③ 책 제목 줄 — 정합

| 항목 | Figma `[spec]` | 구현 | 판정 |
|---|---|---|---|
| 칩 | hug · h40 · radius pill · white 74% · `--shadow-bubble` · pad 좌우 15 · gap 8 | h40 · `9999px` · `rgba(255,255,255,.74)` · drop `0 6 4 ink 8%` + inset 2겹 · pad 15/15 · gap 8 | ✅ |
| 표지 | 16×22 · radius 3 · `linear-gradient(131.19deg, #85BFB6 0%, #B0CFC0 70.92%)` | 16×22 @ y290(= 칩 top + 9) · radius 3 · 표지 이미지가 있으면 `<img>` · **`book-no-cover` → `linear-gradient(131.19deg, rgb(133,191,182) 0%, rgb(176,207,192) 70.92%)`** | ✅ → VG-F2-05 |
| 제목 | Semibold 13 · text-primary | 13px / 18px / 590 · `rgb(74,95,92)` | ✅ |
| 말줄임 | 1줄 | `book-long-title`: 393 → 칩 **345**(컬럼 100%) · 제목 scrollWidth 453 > clientWidth 291 · `ellipsis` / 320 → 칩 **272** · 453 > 218 | ✅ |
| `book: null` | 자리 유지 | `book-missing`: 칩 없음 · 상태 블록 y **344 그대로** | ✅ |

### ④ `mic-off` 글리프 — 모양은 같고 선이 25% 얇다 (VG-F2-01)

`[svg]` 원문(`298:1254`)은 §0.1 때문에 받지 못했다. 앞 세션의 `svg/micoff.svg` 는 Figma 에셋 URL 의 **404 응답 본문**이라 쓸 수 없다. 대신 `[fpng]` `variants.png` PermissionDenied ↔ 구현 baseline `s4-record-control.png` 를 같은 측정기로 비교했다.

| 측정 | Figma | 구현 | 비고 |
|---|---|---|---|
| 글리프 bbox | **36×36** | **36×36** | 같다 |
| 모양 | 사선 · 위가 끊긴 캡슐 · 오른쪽 짧은 호 조각 · 아래 호 · 줄기 | 같은 구성 (8배 확대 대조) | Lucide `mic-off` 구조와 같다 |
| **흰 피복량** | **431.6** | **321.8** (−25%) | |
| 검산 — 같은 방법으로 `mic`(HARU SVG, stroke 3.333) | 292.0 | 292.7 | **방법이 유효**하다 (Δ0.2%) |

해석: 구현은 `LUCIDE_STROKE_WIDTH = 1.5`(24 기준) → 40 박스에서 **2.5px**. 피복비 0.746 ≈ 1.5/2 → Figma 는 **24 기준 2 = 3.333px** 로 보인다. 이는 같은 컨트롤의 HARU `mic` SVG stroke(`3.33333`, scratchpad `figma/mic.svg` `[svg]` 10-26)와 같다. 색(흰색) · 코어 `#AEAEB2` · 위치 @y48 는 맞다.

### ⑤ Spec 밖 토큰 3개 — 전부 정당 (VG-F2-07)

| 토큰 | 값 | 판정 | 근거 |
|---|---|---|---|
| `--button-icon-stroke-sm` | `2` (viewBox 24 기준) | ✅ 정당 | Spec §0.1 `[svg]` `298:1315` = **렌더 1.5px @18**. HARU 기본 1.5 로 그리면 1.125px. computed `stroke-width: 2px`(24 기준) · svg 18×18 · 색 `rgb(74,95,92)` = Figma `#4A5F5C` ✓ |
| `--button-hit-size-sm` | `var(--size-touch-min)` (44) | ✅ 정당 | Spec §3.3 "세로 hit slop 44". `--icon-button-hit-size` 와 **같은 선례**의 Tier-3 별칭. `::before inset-block: calc((36−44)/2)` |
| `--session-breathing-scale` | `1.03` | ✅ 정당 | 상위 Spec §6.3 keyframes `scale 1.03`. 기존 `--record-pulse-scale`(**1.04**, §6.2)과 **값이 달라** 재사용할 수 없다 |

신규 HEX 0 (diff 의 HEX 는 전부 주석). 사용자 승인이 필요한 **새 값 없음**. Spec §5.3 에 `T-31`~`T-33` 으로 등재 권고(design-agent Spec 개정 — 외형 불변).

### ⑥ `R-SHADOW-1` · 320×568 — 신규 overflow 1건(정당), 세로 압축은 `S4-K` 그대로 (VG-F2-06)

- 신규 `overflow` 선언 = **책 칩 제목 `overflow: hidden`**(말줄임) 1건. 안에는 글자만 있고 그림자 0겹 → `R-SHADOW-1` 비대상. 근거 주석 있음 ✓.
- 칩 · 닫기 · 책 칩의 그림자(번짐 좌우 4 / 아래 10)는 overflow 조상이 **AppShell(뷰포트 전체)뿐** — 393·320 에서 모두 안쪽이다(320 긴 제목: 칩 24–296 → 그림자 20–300) ✓.
- paused 코어 그림자 = Record 와 같은 필터 · disabled 0 — Spec §9.3 그대로.
- **세로**: recording·paused 최소 높이 = 위 묶음 455 + 아래 231 = **686** `[spec 계산]`. `[probe]` 393×700 → 유연 간격 **14** 로 줄며 전부 보인다 ✓ (ready 도 같은 높이에서 보인다). 즉 **686 이상에서는 F2 가 새로 깨뜨린 것이 없다.**
- 320×568: ready 는 F1 과 같다(Record top 561, 바 729 — 화면 밖). recording 으로 들어가는 순간 **Record 를 화면 안으로 끌어오는 스크롤**(Playwright 클릭·키보드 포커스의 `scrollIntoView`)이 `overflow: hidden` AppShell 을 118px 밀어 **상단 줄(닫기·Prompts 칩)이 y −108 로 사라진다.** 닫기에 포커스를 주면 다시 y10 으로 돌아온다(키보드로는 도달 가능). 터치 사용자는 이 높이에서 애초에 Record 를 누를 수 없다(7px 만 보인다).
  → **원인은 VG-F1-06 과 같다**(세로 압축 미구현, `S4-K`). F2 가 새로 만든 결함이 아니라 **같은 원인의 새 증상**이다. `S4-K` 검증에 "recording·paused 에서 상단 줄 가시성" 을 추가할 것.
- baseline `s4-session-recording-320.png` 은 **320×852** 다(가로 규칙만 본다). 짧은 세로 baseline 은 없다 — `S4-K` 소관.

---

## 3. Gap 표

| ID | 위치 | Figma / Spec | 구현 | 심각도 | 권고 | 사용자 승인 |
|---|---|---|---|---|---|---|
| **VG-F2-00** | 측정 절차 | `[ctx]`·`[var]`·`[svg]` 재조회 | Figma MCP 읽기 4종 전부 *"don't have edit access"* (§0.1) | Info | 파일 공유 권한 확인 후 **`298:1254`(mic-off) `[svg]`** 와 `298:1324`(시간) `[ctx]` 의 OpenType 기능만 재조회하면 VG-F2-01·02 가 확정된다 | 불필요 (권한 확인은 사용자) |
| **VG-F2-01** | RecordControl `permission-denied` 글리프 | 렌더 피복 431.6 → stroke ≈ **3.33px**(24 기준 2, HARU `mic` 와 같음) `[fpng]` | Lucide `mic-off` · stroke 1.5(24 기준) = **2.5px** · 피복 321.8 (−25%) · 모양·bbox 36×36 동일 | **Low** (PD 화면 연결은 `S4-H2` — 아직 사용자에게 보이지 않음) | ① `[svg]` 재조회로 path·stroke 확정 ② path 가 Lucide 와 같으면 RecordControl 글리프에만 stroke 2(24 기준)를 주는 Tier-3 토큰(예 `--record-glyph-stroke: 2`, `--button-icon-stroke-sm` 과 같은 방식) ③ 다르면 HARU SVG export 로 교체. `S4-H2` 착수 전에 닫는다 | **불필요** (Figma 일치 방향 — 토큰 1개는 Spec 등재) |
| **VG-F2-02** | 경과 시간 `03:24` 숫자 폭 | 상태 블록 폭 133 · 숫자 bbox **128** (x132–260) `[fpng]` | `tabular-nums` · 박스 137.53 · 숫자 bbox **134** (x129–263) · 가운데 동일(196) | **Low** | Spec §2.2·§9.1 이 `tabular-nums` 를 지시했다(매초 폭 흔들림 방지). Figma 텍스트에는 이 기능이 없다(폭으로 추정 — VG-F2-00 으로 확정). 선택: ⓐ **유지 + 허용 차이 등록(권장)** — 1초마다 좌우 끝이 흔들리지 않는다 ⓑ 제거 → Figma 폭과 같아지나 숫자 교체마다 폭이 바뀐다 | **필요** (ⓐ 이면 허용 차이 신규 — 번호는 plan-agent) |
| **VG-F2-03** | Prompts 칩 · 상태 pill 폭 | 117 · 116 · 96 | 114.64 · 113.61 · 94.5 (라벨 글자 폭만 다르다) | Info | 수치 토큰(pad · gap · 아이콘 · 높이)은 전부 일치. 브라우저 SF Pro 의 자동 트래킹 차이. 글리프 y 는 Figma 와 같다(칩 21–35 ↔ 21–36). 조치 없음 | 불필요 |
| **VG-F2-04** | Prompts 칩 라벨 line-height | 바인딩 11 (`font-size/11`) | 20 + 높이 36 고정 | Info | `[px]` 글리프 bbox Figma x40–122 · y21–35 ↔ 구현 x39–121 · y21–36 — **시각 차이 없음** → Spec §12 **`AD-S4-17` 은 등록할 필요가 없다**(조건 "차이가 날 때만" 미충족) | 불필요 |
| **VG-F2-05** | 책 칩 표지 | `[fpng]` 은 `T-5` 그라디언트 placeholder | `coverUrl` 있으면 표지 이미지 · 없으면 `T-5` (computed 일치) | Info | 승인된 Spec §4 #7 · AC-4-126 그대로. Figma 프레임의 그라디언트는 표지 없는 경우와 같은 값이다 | 불필요 |
| **VG-F2-06** | 짧은 세로 (≤ 686) | Spec §8.2 / `CP-7` 압축 순서 (`AD-S4-18` 등록) | 압축 없음. 320×568 recording: 스크롤로 Record 를 끌어오면 상단 줄 y −108 (§2-⑥) | **Medium** (`S4-K` 소관, **F2 FAIL 아님 · 새 악화 아님**) | `S4-K`(AC-4-99)에서 구현. 검증 항목에 "recording·paused 에서 닫기·Prompts 칩 가시성" 추가 | `AD-S4-18` 결정됨 — 구현 후 Visual Gap |
| **VG-F2-07** | Spec 밖 토큰 3 | Spec §5.2 에 없음 | `--button-icon-stroke-sm` · `--button-hit-size-sm` · `--session-breathing-scale` | Info | 전부 정당(§2-⑤). Spec §5.3 에 `T-31`~`T-33` 등재 | 불필요 |
| **VG-F2-08** | 닫기·Discard 확인 다이얼로그 | Figma 없음 (`AD-S4-4` · `AD-S4-15`) | Stage 1 `ConfirmDialog` 재사용 · baseline 에서 반투명 면 너머로 `Recording` · `03:24` 가 비친다 | Info | 다이얼로그 면은 Stage 1 컴포넌트 그대로라 이 단위 차이가 아니다. 설명 문구 뒤에 시간 숫자가 겹치는 것은 가독성 확인 대상(대비 계산은 하지 않았다). **문구 4건은 아직 미승인**(인계 F2-8 NEEDS_DECISION ①) | **필요** (문구) |
| **VG-F2-09** | paused 시간 · 보조 줄 대비 | 2.42~2.47 · 2.39~2.40 (Spec §9.2) | Figma 색 그대로 · CSS 주석 `P-26`·`P-27` | Info | 가값 `P-26`·`P-27` 이 `docs/decisions/stage-0-approvals.md` §4 에 **아직 등재되지 않았다**(인계 F2-8 ⑨) → plan-agent/Orchestrator | 불필요 (`D4-58` NB-7 결정됨 — 등재만) |
| (참고) | `Tap to resume` 캡션 | Medium 10 | 11 / 510 | — | 상위 Spec §5.4-② 흡수(디자이너 Q16) — F1 의 `Tap to recording` 과 같은 처리 | 기존 결정 |

---

## 4. 확인한 정합 항목 (요약)

- 닫기(recording·paused): 38×38 @ (331,10) · white 74% · `--shadow-bubble` · 글리프 HARU SVG 15×15 · stroke 1.375 · 색 `rgb(94,115,112)` = `#5E7370` (`D4-62`) · 이름 `Close session`. `[px]` 글리프 bbox Figma x345–354 · y24–33 ↔ 구현 x346–354 · y25–33.
- Prompts 칩: pad 14/16 · 아이콘 18 `message-square-text` · 라벨 15/20/590 · 칩 색 `#4A5F5C`(glass 기본 ink-600 을 덮음 — Figma `[ctx]` 대로) · 그림자 `--shadow-bubble`(1겹 + inset 2). 팝업 슬롯이 없어 지금은 `aria-expanded` 없음 — `S4-G1`.
- RecordControl: recording = pause 글리프 @y55 · 캡션 없음 / paused = mic @y**48** · `Tap to resume` @y**88** 가운데 · 접근성 이름 `Pause recording` / `Resume recording` ✓. gallery 5변형 baseline 의 disabled(.5 · 코어 그림자 0) · PD(gray-2 · `Mic is off`)는 `[fpng]` variants 와 같은 외형(PD 글리프 굵기만 VG-F2-01).
- 하단 바: recording·paused 모두 활성(opacity 1) · `Discard` gray-2 / `Submit` teal.
- 320 가로(852 세로): 칩 117+닫기 38 = 컬럼 안 · 상태 블록 201 ≤ 272 · 바 272(`AD-S4-10`) ✓.

## 5. development-agent 메모

1. VG-F2-01 은 **Figma 권한이 복구된 뒤** `298:1254` `[svg]` 를 받아 처리한다. 추정만으로 stroke 를 바꾸지 않는다(`R-FIGMA-1` ①).
2. VG-F2-02 는 사용자 결정 전까지 **현행 유지**(`tabular-nums`).
3. 이번 검토에서 코드 변경을 요구하는 항목은 없다. 위 두 건은 결정·재측정 대기다.
