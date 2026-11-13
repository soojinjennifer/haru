# Stage 5 Visual Gap — `S5-B` 회고 카드 (완료 화면 하단)

Status: **REVIEW (design-agent, 2026-11-08)** — 허용 차이 등록은 하지 않았다 (CLAUDE.md 최우선 규칙 6).
Based on: Figma `YWWu3AFEJpRxvw0T5klq0k` `29:62` · `91:691` (2026-11-08 라이브 조회) · Spec `docs/design/stage-5-design-spec.md` (APPROVED, `D5-4`) · handoff `docs/qa/stage-5-handoff.md` §H5-2

## 0. 무엇을 어떻게 쟀는가 (`R-FIGMA-1` ⑤)

| 출처 | 방법 |
|---|---|
| Figma 선언값 | `get_design_context(91:691)` (fill · effect · padding · gap · text style) · `get_variable_defs(91:691)` · `get_metadata(91:691)` (자식 좌표) — **렌더 픽셀에서 값을 읽지 않았다** |
| Figma 렌더 | `get_screenshot(29:62)` 393×852 · `get_screenshot(91:691)` 378×312 (= 렌더 바운드, 카드 그림자 ±4 / +10) — 나란히 비교 용도만 |
| 구현 | Playwright 단독 실행(겹친 실행 없음), 393×852, dev 패널 `hideDevPanel` 로 숨김, `settleImages` 후 촬영. `getComputedStyle` + `getBoundingClientRect` 덤프 (카드 기준 좌표) |
| 상단 불변 | `git show HEAD:` Stage 4 baseline ↔ 작업 트리 baseline 픽셀 diff (채널 차 > 0) |
| 포커스 링 | Tab 순회 → `outline-width + outline-offset` 이 카드 경계(`overflow: clip`) 안에 남는 여유 |

증거: `docs/qa/evidence/stage-5/visual-gap-s5b/`
- Figma: `figma-29-62.png` · `figma-91-691.png`
- 구현 (상태 5종 × 전체 프레임·카드+그림자): `impl-{empty,filled,saving,failed,readonly}-{frame,card}.png`
- computed: `computed-{empty,filled,saving,failed,readonly}.json` · `focus-rings.json`
- 비교: `compare-card-figma-vs-filled.png` · `compare-frame-figma-vs-filled.png` · `compare-states-cards.png`
- baseline diff 입력: `stage4-baseline-HEAD.png` · `stage5-baseline-worktree.png`
- probe 소스: `vg5b.probe.spec.ts` · `vg5b-focus.probe.spec.ts` (실행 시에만 `e2e/` 로 복사, 실행 후 이동 — 저장소 e2e 에 남기지 않았다)

좌표 규칙: Web y = Figma y − 56 (상태바). 카드 Figma (11, 521) → 웹 (11.5, 465).

## 1. 일치 확인 (Gap 없음)

| 요소 | Figma 선언 (node) | 구현 computed (filled 상태) | 판정 |
|---|---|---|---|
| 카드 위치·크기 | (11, 521) 370×302 (`91:691`) | (11.5, 465 웹) 370×302 — baseline diff bbox x 8~385 · y 465~776 | ✅ (x 11.5 는 가운데 정렬, Spec ±1 승인 범위 — VG5B-5) |
| 카드 fill | `glass-fill-strong` #ffffffe5, blur 없음 | `rgba(255,255,255,0.9)` · `backdrop-filter: none` | ✅ |
| 카드 radius | 30 | `30px` | ✅ |
| 카드 그림자 | drop `0 6 4 #5E737014` + inset `0 1.5 0 #FFFFFFE5` · `0 -1 0 #5E73700D` | 동일 3겹 (`--shadow-bubble`) · 렌더 번짐 좌우 ±4 · 아래 +9~10 (diff bbox) = Figma 바운드 378×312 | ✅ |
| 카드 레이아웃 | flex col · gap 14 · padding 20/20/18/20 · `overflow: clip` | `gap 14px` · `padding 20px 20px 18px` · `overflow clip/clip` | ✅ |
| 제목 `91:692` | SF Pro Bold 17 · line normal(20) · `text-primary` · 가운데 · y 20 · h 20 | 700 17/20 · `rgb(74,95,92)` · center · y 20 · h 20 | ✅ (이름 Emma↔Nova 는 fixture 데이터) |
| 별 행 `91:693` | 330×30 @ y 54 · gap 8 · 첫 별 x 74 · 별 30×30 | 330×30 @ y 54 · 첫 별 x 74 (카드 94 − 20) · 간격 8 · 30×30 | ✅ |
| 별 색 | 채움 `#D0CCA1` · 빈 `#D6DEDC` (raw fill) | `rgb(208,204,161)` · `rgb(214,222,220)` | ✅ (`T5-1` 적용 확인) |
| 칩 행 `91:709` | 330×73 @ y 98 · wrap gap 7 · center · 2행(3+2) · 2행 top 40 | 330×73 @ y 98 · gap 7 · 2행 · 2행 top 40 | ✅ |
| 칩 선택(Green `90:625`) | bg teal · 라벨 white · border 없음 · 높이 31 · padding-x 12 · Medium 510 | `rgb(133,191,182)` · white · `0px none` · 31 · `0 12px` · 510 | ✅ |
| 칩 미선택(Transparent `90:624`) | border 1px `stroke` · 라벨 `#5E7370` · 높이 33 | `1px solid rgba(94,115,112,.18)` · `rgb(94,115,112)` · 33 | ✅ — **dev 메모 "선택 31 / 미선택 33" 은 Figma 와 같다** (원인 = 미선택 border-box 1px) |
| 칩 check 아이콘 | 없음 | 없음 | ✅ (`N5-26`) |
| 입력 `91:715` | 330×40 @ y 185 · border 1px ink 18% · radius 16 · padding 14/12 · fill 없음 · `overflow-clip` | 330×40 @ y 185 · 동일 border · 16px · padding-x 14 · 투명 · clip | ✅ |
| placeholder `91:716` | `Anything to talk about this time? (optional)` · Regular 13 · line 16 · `#9AABAA` | 같은 문구 · 400 13/16 · `::placeholder` `rgb(154,171,170)` | ✅ |
| 버튼 `91:717` | Accent/Rest 330×45 @ y 239 · `Save` Semibold 17 · 아래 여백 18 · backdrop blur 12 | 330×45 @ y 239 · 590 17 · 아래 18 · `blur(12px)` | ✅ |
| 버튼 Disabled `17:18` | opacity 50% | S0 빈 · S6 재진입 `opacity 0.5` | ✅ |
| 세로 합 | 302 | 302 · 스크롤 0 (`scrollHeight 852 = clientHeight`) | ✅ |
| 상단 y 0~468 (Figma) 불변 | — | Stage 4 baseline(HEAD) ↔ Stage 5 baseline: **y < 465(웹) 변화 0 px** (채널 차 > 0 엄격) · 변경 bbox x 8~385 · y 465~776 = 카드 + 카드 그림자만 | ✅ AC-5-19 |
| baseline 신선도 | — | 이번 촬영 `impl-empty-frame` ↔ 작업 트리 baseline, y ≥ 465 영역 diff (채널 차 > 5) **0 px** | ✅ (`R-BASELINE-1` ③-1 — 스테일 아님) |
| `R-SHADOW-1` | 카드 번짐 4/0/10 · `Save` 그림자는 카드 `overflow: clip` 에서 끊김 (Figma 도 동일 선언) | 카드 그림자 좌우 ±4 · 아래 ~10 이 화면 안에 그려짐(거터 11·하단 29 안 → 클립 없음) · `Save` 그림자는 카드 경계에서 끊김 (Figma 렌더와 같은 모양) | ✅ |
| 포커스 링 클립 | — | 칩·입력·Save 의 `2px + offset 2px` 링이 카드 경계까지 여유 최소 **14 (Save 아래)** · 입력/Save 좌우 16 · 칩 34+ → **잘림 0** | ✅ (별 포커스 표시는 아래 §3 NV) |

### 상태별 (Figma 밖 `C13-S5-2` — Spec §2.2 대비)

| 상태 | Spec 명세 | 구현 | 판정 |
|---|---|---|---|
| S0 빈 | 별 5 빈 · 칩 전부 미선택 · placeholder · Save Disabled 50% | 일치 (`impl-empty-card.png`) | ✅ |
| filled (Figma 예시) | 4별 · `Engaged` + `Ask Questions` 선택 | Figma 와 나란히 일치 (`compare-card-figma-vs-filled.png`) | ✅ (칩 폭 VG5B-1) |
| S2 저장 중 | 기존 `Button loading` · 카드 기하 불변 | Save 자리에 spinner + "Loading" · 카드 302 · 다른 요소 모습 불변 | ✅ |
| S3 실패 | Toast(error) · 입력 보존 · 카드 기하 불변 | 상단 Toast *"Something went wrong…"* · 별/칩 보존 · Save Rest · 카드 302 | ✅ |
| S6 재진입 읽기 전용 | 제출값 표시 · 칩 opacity 변화 없음 · Save Disabled · 시각 텍스트 추가 없음 | 4별 · `Engaged`+`Ask Questions` · note 값 표시 · Save 50% · 추가 텍스트 0 | ✅ |

## 2. Gap 목록

| ID | 요소 | Figma 선언 (node) | 구현 computed | Severity | 권고 |
|---|---|---|---|---|---|
| **VG5B-1** | 칩 라벨 크기 → 칩 폭·행 내 위치 | 라벨 **12.5** Medium (`90:611`/`90:617`, `91:710`~`714`) → 칩 폭 77 / 97 / 111 / 93 / 101 · 1행 시작 x 15.5 · 2행 64.5 (행 기준) | 라벨 **12** (`--chip-label-size` = `caption-1`, Stage 0 스케일 흡수) → 74.7 / 93.7 / 107.3 / 89.7 / 97.1 (**−2.3 ~ −3.9 px**) · 1행 시작 x 20.2 (+4.7) · 2행 68.1 (+3.6). 높이·색·간격은 일치 | Low | **사용자 승인 필요** — ⓐ 허용 차이로 등록(스케일 흡수 유지) 또는 ⓑ dev fix: `select` 변형에서만 라벨 12.5 (신규 Tier 3 토큰 1개, 기존 `outline`/`filled`/`glass` 칩·온보딩 baseline 영향 0). 최우선 규칙 1 기준으로는 ⓑ 가 Figma 그대로다 |
| VG5B-2 | `Save` 그림자 (카드 아래 padding 띠) | Button 인스턴스 raw 2겹 `0 12 14 #5E737029` + `0 2 2 #5E737014` (`91:717`) | `HARU/Glass Rest` 3겹 `0 2 4 /.08` · `0 12 28 /.16` · `0 28 56 /.12` — 카드 clip 안 padding 18 띠가 Figma 보다 채널당 약 7~10 어둡다 (x 200, 카드 y 284~300 샘플 — 비교 용도) | Low | **조치 없음** — 기존 허용 차이 `AD-3` (Stage 1 Spec §10.3: 그림자 blur/offset 차이 허용, 사용자 승인 완료) 범위 안. 새 등록 불필요 |
| VG5B-3 | 칩 라벨 줄 높이 | line `normal` = 15 (12.5 기준) · 높이 = padding 8×2 + 15 = 31 | line 16 · 높이는 `--chip-height` 31 고정, padding-y 0 | Low | 조치 없음 — 높이·세로 중심 동일, 시각 차이 0 (VG5B-1 ⓑ 시 함께 정리 가능) |
| VG5B-4 | `Save` 내부 padding · 라벨 줄 | padding-x 26 · label line 17 | padding-x 24 · line 22 · 높이 45 고정 | Low | 조치 없음 — 폭 100%·높이 45·라벨 가운데라 렌더 차이 0. 기존 `Button` md 공통값 |
| VG5B-5 | 카드 x | 11 (오른쪽 12, 비대칭) | 11.5 (가운데 정렬) | Low | 조치 없음 — Spec §2.1 이 "x = 11.5 (Figma 11, ±1 안)" 로 승인(`D5-4`) |

Severity 집계: Critical 0 · High 0 · Medium 0 · Low 5 (조치 필요 1 = VG5B-1 사용자 결정, 나머지 4 조치 없음).

## 3. 이 검토 범위 밖 / 미검증

| 항목 | 내용 | 처리 |
|---|---|---|
| NV — 별 포커스 표시 | 프로그램 `focus()` 로 들어간 첫 별에서 `outline: none` 으로 읽혔다 (`:focus-visible` 미발동 가능). 별 행 좌우 여유 74·위아래 14 라 클립 위험은 없음 | stage-qa-agent 가 키보드 Tab 진입으로 별 포커스 표시 재확인 |
| 320 · 600 · 1024 · 393×667 | 이번 probe 는 393×852 만 촬영 | `e2e/reflection-card.spec.ts` 반응형 테스트(dev 보고 통과)로 QA 확인 |
| Stage 4 관찰 | 완료 화면 진입 직후 `Recording submitted` Toast 가 스티커 슬롯 위에 겹친다 (`impl-filled-frame.png`). Stage 4 동작이며 카드와 무관 | 조치 없음 (S5-B 범위 밖) |
| dev 보고 터치 타깃 (H5-2.5) | 입력 높이 40(Figma) → 5점 hit-test 위·아래 미달 · `Big feelings`/`Ask Questions` 아래 점이 아랫줄 hit slop 에 먹힘(행 간격 7) | 시각 Gap 아님 — dev 가 이미 **사용자 결정 필요**로 올렸다. 그대로 유지 |
| `C13-S5-1` 피드백 화면 | `S5-C` 미구현 | 해당 단위 VG 에서 |

## 4. 결론

- **dev fix 필수 항목: 0** (사용자가 VG5B-1 ⓑ 를 고르면 1).
- **사용자 결정 필요: 1** — `VG5B-1` 칩 라벨 12 ↔ Figma 12.5 (허용 차이 등록 vs `select` 변형만 12.5).
- 카드 기하·선언값·상태 5종·상단 불변·그림자·포커스 링 클립은 Figma/Spec 과 일치한다.
