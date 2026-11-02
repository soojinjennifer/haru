# Stage 4b Visual Gap — `S4-G1` (Prompts 칩 → 중앙 팝업) + `VG-F2-01` 후속

Status: **REVIEW (2026-10-29, design-agent)** — 허용 차이 등록 없음 (등록은 사용자 승인 후, 최우선 규칙 6)
Based on: 인계 `docs/qa/stage-4b-handoff.md` §`S4-G1`(G1-1~G1-9) · §`S4-F2` "F2 후속"(`VG-F2-01`) · Spec `docs/design/stage-4b-design-spec.md`(APPROVED) §3.1 · §3.3 · §5.2 · §8.1 · §9 · 결정 `D4-52`~`D4-55` · `D4-58`(CP-2 · NB-1 · NB-2) · `D4-66` · 허용 차이 `AD-S4-*`

---

## 0. 측정 방법

이번 세션은 Figma MCP 읽기 도구가 **정상 동작했다** (`VG-F2-00` 의 권한 오류 재현 안 됨).

| 표기 | 내용 |
|---|---|
| `[ctx]` | `get_design_context(296:1257)` — 선언값: `gap 6` · `px 16 py 14` · `rounded 22` · 면 `glass-fill-strong` `#ffffffe5` (배경 레이어, blur 없음) · drop `0 6 4 rgba(94,115,112,.08)` **1겹** + inset `0 1.5 white90%` · inset `0 -1 ink5%` · 제목 `296:1258` SF Pro Semibold(590) 16 / 22 `text-primary` 가운데 · `300:1308` Semibold 14 / `normal` · `text-secondary #7d9291` · `underline` · **`decoration-from-font`** · `text-underline-position: from-font` · 가운데 |
| `[ctx-svg]` | `get_design_context(298:1254)` 에셋 SVG 원문 (curl) — path 6 · `stroke-width 3.33333` · round cap/join · `white` |
| `[var]` | `get_variable_defs(296:1257)` — `glass-fill-strong #ffffffe5` · `text-primary #4a5f5c` · `text-secondary #7d9291` · `HARU/Shadow Rest` 5겹 **정의**(노드가 실제로 그리는 것은 `[ctx]` 의 drop 1 + inset 2 — `R-FIGMA-1` ②) |
| `[meta]` | `get_metadata(296:1210)` · `(298:1245)` |
| `[fpng]` | `get_screenshot(296:1210)` 393×852 1x · `get_screenshot(298:1245)` 164×169 1x (2026-10-29) |
| `[probe]` | dev 서버 **포트 5195**(단독, 5173·5174 미사용), Playwright chromium · DPR 1 · `reducedMotion: reduce` · dev 패널 숨김 · 주입 시계 `03:24` → Pause → 칩 키보드 Enter → blur (e2e 와 같은 경로). `getBoundingClientRect` + `getComputedStyle`. 뷰포트 393×852 · 393×796 · 393×700 · 320×852 · 320×568 × 시나리오 기본(5) · `prompts-1` · `prompts-7` · `prompts-empty` |
| `[px]` | `[fpng]` ↔ 구현 393×796 스크린샷(= Figma y−56) 같은 좌표 대조 — 글리프 bbox · 행별 잉크 · 피복량. 구현 393×852 프로브 스크린샷은 커밋 전 baseline `s4-session-prompts.png` 와 **Δ>5 픽셀 0** (동일 상태 확인) |

스크립트·산출물: scratchpad `vgg1/` (`probe.cjs` · `out/*.png|json` · `fig/*` — 저장소 밖).

---

## 1. 결론 요약

| 심각도 | 수 | ID |
|---|---|---|
| High | 0 | — |
| Medium | 1 (`S4-K` 이월 — 이번 단위의 결함 아님) | VG-G1-08 |
| Low | 1 | VG-G1-03 |
| Info | 9 | VG-G1-01 · 02 · 04 · 05 · 06 · 07 · 09 · 10 · 11 |

팝업의 **기하·면·그림자·radius·타이포 선언값은 Figma `296:1257` 과 일치**한다. 393×796 에서 팝업 바닥 = Record Control top(565), n=1/5/7 높이 = `73+44n`(117 / 293 / 293 — 7 은 5 컷오프), pill 전부 38. 어긋남은 **`See all prompts` 밑줄 두께와 글리프 1px 아래 처짐**(Low) 하나다. `mic-off` 교체는 **Figma 원본과 path·stroke 가 문자 단위로 같고** 렌더 bbox 도 같다 → `VG-F2-01` 닫힘.

---

## 2. 확인 항목별 결과

### ① 팝업 위치·크기·면·그림자·radius·제목·pill·See all

| 항목 | Figma | 구현 `[probe]` | 판정 |
|---|---|---|---|
| top | 328 `[meta]` (= ring bottom 322 + 6) | **272** (= 328 − 56) · ring 76+190+6 | ✅ |
| x / 폭 | 34 / 329 | **32** / 329 (가운데 — `AD-S4-12`, `D4-58` NB-4) | ✅ (등록분) |
| 높이 n=5 | 293 | 293 | ✅ |
| 면 | `#ffffffe5` · blur 없음 `[ctx][var]` | `rgba(255,255,255,.9)` · `backdrop-filter: none` | ✅ `[px]` 안쪽 면 Δ ≤ 1 |
| 그림자 | drop `0 6 4 ink8%` 1겹 + inset 2 `[ctx]` | `--shadow-bubble` 동일 3항 (computed) | ✅ `[px]` 아래 번짐 6행 Δ ≤ 3 |
| radius | 22 | 22 (`--radius-surface`) | ✅ |
| padding / gap | 16 · 14 / 14 · 6 | 16 · 14 / 14 · 실측 피치 6 (제목→pill 42−36, pill→See all 262−256) | ✅ |
| 제목 | Semibold 16/22 · `#4a5f5c` · 가운데 · 297×22 @y14 | 590 · 16 / 22 · `rgb(74,95,92)` · 297×22 @y14 | ✅ (글리프 폭 VG-G1-04) |
| pill | 297×38 · 상대 y 42/86/130/174/218 | 297×38 · 42/86/130/174/218 · 면 `#dbeee7` · inset 1px ink18% · 2줄 글리프 상대 y 7 (padding 8 안으로 1px — CP-2 의도) | ✅ |
| `See all` 박스 | 297×17 @y262 · 14 / 17 · `#7d9291` · 밑줄 · 가운데 | 104.6×17 @y262 (가운데 196.5) · 14 / 17 · 590 · `rgb(125,146,145)` · underline · `from-font` 위치 · 터치 `::before` 44 | ✅ 박스 / ⚠️ 밑줄 두께 VG-G1-03 |
| 층위 | 책 칩·상태 블록 위, 90% 면 너머로 비친다 | `z-index 10` · 같은 비침 (책 칩·`03:24`) | ✅ |

### ② n별 높이와 Record Control 간격

| 뷰포트 | n | 팝업 높이 | 팝업 bottom | Record top | 간격 |
|---|---|---|---|---|---|
| 393×852 | 1 / 5 / 7 | 117 / 293 / 293 | 389 / 565 / 565 | 621 | 232 / 56 / 56 |
| **393×796** | 1 / 5 / 7 | 117 / 293 / 293 | 389 / 565 / 565 | **565** | 176 / **0** / **0** ✅ (Figma 와 같다) |
| 320×852 | 5 | 293 (폭 272 · pill 240) | 565 | 621 | 56 ✅ (§8.1) |
| 393×700 | 5 | 293 | 565 | 469 | **−96** (VG-G1-08) |
| 320×568 | 5 | 293 | 565 | 455 | **−110** (VG-G1-08) |

전 뷰포트 `scrollHeight = clientHeight` (스크롤 0). 7개 시나리오는 앞 5개만 표시 · `See all` 항상 표시(NB-1) ✅.

### ③ `mic-off` 교체 (`VG-F2-01` 후속)

- `[ctx-svg]` 원문 ↔ `packages/ui/src/icon/haru/record-mic-off.svg`: **path `d` 6개 문자 단위 동일 · stroke 3.33333 동일**, 차이는 `white` → `currentColor` 뿐.
- `[px]` `[fpng] 298:1245` ↔ baseline `s4-record-control.png` PD 행 (코어 108 원으로 정렬, dx 10 · dy 527): 글리프 bbox **(63,49)–(100,86) 동일** · 피복 **432.1 ↔ 424.2 (−1.8%)** · 창 평균 |Δ| **0.47/255**. 8배 확대(scratchpad `vgg1/out/pd-compare-8x.png`)에서 모양 구분 불가 → 래스터라이저 안티에일리어싱 차이. **닫힘.**

### ④ 칩 비활성 (Prompt 0개, `session:prompts-empty`)

Figma 에 비활성 칩은 없다 (Spec `S4B-Q4` ⓐ = `D4-58` NB-2 채택). 구현: 칩 전체 `opacity .5`(`--opacity-disabled`, 전역 `D4-18`) · glass 면·blur·그림자 유지 · `cursor: default` · `aria-disabled="true"` + `aria-describedby` → `No prompts for this session` · `aria-expanded`/`aria-controls` 없음 · 팝업 노드 0 · recording/paused 동일. Spec 과 일치 (VG-G1-07).

### ⑤ 토큰 `T-19` 4종

`packages/design-tokens/src/component/index.css` 379–383: `--prompt-popup-pad-block: var(--space-3-5)` · `--prompt-popup-offset-top: var(--space-1-5)` · `--prompt-popup-link-size: 14px` · `--prompt-popup-link-line: 17px` — **Spec §5.2 `T-19` 와 이름·값 모두 일치** (`S4B-Q3` ⓐ = `D4-58` CP-1). computed 로 14px / 17px / padding 14 확인.

---

## 3. Gap 목록

| ID | 위치 | 기준값 | 구현값 | 심각도 | 권고 | 사용자 승인 필요 |
|---|---|---|---|---|---|---|
| **VG-G1-01** | 팝업 기하 (393×852 · 796 · 320) | `[meta]` 328 · 329×293 · pitch 44 · See all y262 | §2 ①② 표 — 전부 일치 (x 는 `AD-S4-12`) | Info | 조치 없음 | 불필요 |
| **VG-G1-02** | 팝업 면·그림자·radius | `[ctx]` white 90% · blur 없음 · drop 1 + inset 2 · 22 | computed 동일 · `[px]` 면 Δ≤1, 그림자 Δ≤3 | Info | 조치 없음. `[var]` 의 `HARU/Shadow Rest` 5겹은 **정의**이고 노드가 그리는 것은 3항이다 — `--shadow-bubble` 선택이 맞다 (`R-FIGMA-1` ②) | 불필요 |
| **VG-G1-03** | `See all prompts` 밑줄 · 글리프 세로 | `[ctx]` `decoration-from-font`(두께 = 폰트 값) · `[px]` 글자 잉크 행 **264–276**, 밑줄 **277(진함)+278(옅음) ≈ 1.3px** | `text-decoration-thickness: auto` · 글자 잉크 행 **265–277**(1px 아래), 밑줄 **278 한 행** | **Low** | ⓐ `.haru-session-prompts__see-all .haru-text-link` 에 `text-decoration-thickness: from-font` 추가 (Figma 선언 그대로 — 토큰 불필요, 키워드) 후 같은 측정기로 재측정 ⓑ 글리프 1px 처짐은 `line-height: normal`(Figma) ↔ 17 고정(구현)의 반올림 차이로 추정 — ⓐ 적용 후에도 남으면 **허용 차이 후보**로 올린다. 박스(y262 h17)는 일치하므로 높이 예산에는 영향 0 | ⓐ 불필요 (Figma 일치 방향) · ⓑ 남으면 **필요** (허용 차이) |
| **VG-G1-04** | 팝업 제목 글리프 폭 | `[px]` 124px (x86–209) · 잉크 112 | 119px (x89–207) · 잉크 122 · 세로 행 동일 | Info | 브라우저 SF Pro 렌더 차이 — `VG-F2-03`(칩 라벨 폭)과 같은 부류. 선언값(590 · 16/22)은 일치. 조치 없음 | 불필요 |
| **VG-G1-05** | pill 본문 | `[ctx]` 11.8 / 12 · Figma 문구 = 자리표시 | 12 / 12 (상위 Spec `T-14` 흡수) · Mock 문구 | Info | 문구가 달라 기하만 비교. 2줄 글리프가 38 안에서 padding 으로 1px 들어가는 모양 = Figma 와 같다(CP-2). 320 에서 pill 240 → 2줄 말줄임(기존 pill 규칙) | 불필요 |
| **VG-G1-06** | RecordControl `permission-denied` 글리프 | `[ctx-svg]` path 6 · stroke 3.33333 · `[fpng]` 피복 432.1 | 문자 단위 동일 · bbox 동일 · 피복 424.2 (−1.8%) | Info | **`VG-F2-01` 닫음.** 남은 −1.8% 는 래스터 차이. 캡션 `Mic is off` 폭 차이는 기존 10→11 흡수(상위 §5.4-②) — 이번 변경과 무관 | 불필요 |
| **VG-G1-07** | Prompts 칩 비활성 | Figma 없음 · Spec `S4B-Q4` ⓐ (NB-2) | opacity .5 · 사유 설명 · 팝업 0 | Info | Spec 과 일치. 비활성 라벨 대비는 WCAG 1.4.3 예외(비활성 컨트롤). 디자이너 시안이 생기면 그때 대조 | 불필요 (NB-2 승인분) |
| **VG-G1-08** | 짧은 세로 (< 796) | Figma 852 만 · CP-7 = 간격 → 메달리온 → pill 스크롤 (`AD-S4-18`) | 팝업 top 272 고정 → Record 를 **393×700 에서 96px · 320×568 에서 110px 덮는다** | **Medium** (`S4-K` 이월, 인계 G1-8 ①) | 이번 단위의 결함은 아님. 다만 **iPhone Safari 실기기 뷰포트는 툴바 때문에 852 보다 짧다**(사용자가 실기기로 검수 중 — 2026-10-28 지시) → 팝업을 열면 Record 를 덮는 화면이 **지금 실기기에서 보인다.** 팝업은 바깥 탭으로 닫히므로 동작 차단은 아니나, `S4-K` 를 `S4-G2` 앞이나 직후로 당길지 Orchestrator 판단 권장 | 불필요 (CP-7 결정분 — 일정만) |
| **VG-G1-09** | 토큰 `T-19` | Spec §5.2 4종 | 이름·값 동일 | Info | 조치 없음. 단 `docs/DESIGN_TOKEN_MAP.md` 에 `T-15`~`T-21` 이 아직 없다(grep 0) — design-agent 후속 정리 대상 | 불필요 |
| **VG-G1-10** | `.haru-bubble` computed `gap: 5px` | Figma gap 6 | 바깥 bubble 컨테이너 gap 5 · 실제 자식 피치는 6 (content 래퍼가 소유) | Info | 시각 영향 0 (기하 실측 일치). 조치 없음 | 불필요 |
| **VG-G1-11** | `See all` pressed/hover 색 | Figma 상태 없음 | `TextLink` 공통 규칙 — `:active` · (fine pointer) `:hover` → `--color-fg-strong` | Info | Stage 2 `TextLink` §4.6 공통 상태가 `subtle` 에도 적용된 것. 신규 UI 아님 — 보고만 | 불필요 |

---

## 4. 문서 정리 메모 (Orchestrator · plan-agent)

1. `docs/decisions/stage-4-approvals.md` §4 허용 차이 표에 **`AD-S4-12`~`AD-S4-18` 행이 없다** — `D4-58` NB-4 · CP-5 · CP-7 로 "등록"됐다고 적혀 있으나 표에는 7~11 · 19 만 있다. 표 보강 필요 (design-agent 쓰기 범위 밖).
2. `VG-F2-01` 은 이 문서 VG-G1-06 으로 닫혔다 — `stage-4b-visual-gap-f2.md` 상태 표기 갱신은 Orchestrator 판단.

## 5. development-agent 구현 메모

1. **VG-G1-03 ⓐ** 만 코드 변경 대상: `apps/web/src/features/session-prompts/session-prompts.css` `.haru-session-prompts__see-all .haru-text-link` 에 `text-decoration-thickness: from-font;` 1줄. 적용 뒤 `s4-session-prompts` baseline 은 밑줄 행(팝업 상대 y 277–278) 안에서만 바뀌어야 한다 — 그 밖의 클러스터가 나오면 재생성하지 말고 멈춘다 (`R-BASELINE-1` ⑤). Orchestrator 지시가 있을 때 착수한다 (Figma 일치 방향이라 허용 차이 승인은 불필요).
2. VG-G1-08 은 `S4-K`(CP-7) 범위다. 이번 단위에서 손대지 않는다.
