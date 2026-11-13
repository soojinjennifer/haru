# Stage 4b Plan — Session Screens (재검토: 사용자 Figma 수정 `D4-50` 반영)

Status: **APPROVED (2026-10-26, user)** — 사용자 발화 *"권장안대로 해줘"* (승인 체크포인트 응답: Plan·Design Spec 승인 + Plan §19 차단 CP-1~7 · 비차단 NB-1~11 전 항목 권장안 채택, `D4-58`). 작성: 2026-10-26 plan-agent — 최신 **개정 1.6** (2026-11-05, Status 유지 — 개정 1.4 §19.3 승인 완료 `D4-119` · `D4-120` (2026-11-03, user)). ⛔ **`S4-H4`(개정 1.6, §13.5)는 §19.4 승인 완료 — `D4-145` (2026-11-05, user: CP-15 ⓐ · CP-16 ⓒ · NB-16~18 권고안)** — 개정 1.6 신규 AC-4-154~156 과 AC-4-35·36·99·103 수정 승인
Based on: PRD v1.5 개정 2 (`docs/source/HARU_PRD_v1.5.md` §7.5 · FR-09~11) · Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` 페이지 `16:2` 섹션 **`296:1127` "Recording"** (`298:1262` · `298:1340` · `296:1210`/`296:1257` · `298:1261` · **`300:1309`** · `300:1308`) + 기존 `28:51` · `29:62` · `88:960` · `163:1590` · 상위 Plan `docs/plans/stage-4-plan.md` 개정 3.1 (APPROVED 2026-10-13) · `docs/decisions/stage-4-approvals.md` **`D4-1`~`D4-57`** · Design Spec `docs/design/stage-4b-design-spec.md` (DRAFT 2026-10-26) · 상위 Spec `docs/design/stage-4-design-spec.md` · `packages/contracts/src/sessions/session.ts` · `rules/session-transitions.ts`

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 초판 | 2026-10-26 | `D4-50` 충돌 지점 20건 · `N4B-01`~`17` |
| **개정 1** | 2026-10-26 | 사용자 결정 **`D4-51`~`D4-57`** 반영 · Design Spec **PM-1~PM-16** 반영 · `S4-G` → **`S4-G1`(팝업) / `S4-G2`(Drawer)** 분할 · AC-4-56 팝업/Drawer 분리 · ready 닫기 AC 신규 · AC-4-54 존치 · NEEDS DECISION 을 남은 것만 재정리 + **§19 승인 체크포인트 결정 목록** 신설 |
| **개정 1.1** | 2026-10-27 | 사용자 결정 **`D4-59`** 반영 — ready 리마인드 문구 = 서버 필드 `SessionSummary.reminderBubble` (`API_CONTRACTS.md` Rev 8.6 §3.2.2) · §10·§11·§12 delta · AC-4-46 화면 부분 수정(§14.1) · **`S4-F1R`** 후속 단위 등록(§13.1). Status 는 APPROVED 유지 |
| **개정 1.2** | 2026-11-01 | 사용자 결정 **`D4-87`·`D4-88`·`D4-91`** 반영 (`docs/design/stage-4b-visual-gap-h1.md` 결정 2·3·6) — **`S4-H1` 의 "변경 없음" 정정: contract 필드 2건** (`API_CONTRACTS.md` Rev 8.9 §3.2.3) · §6·§10·§11·§12·§13·§15·§16 delta · **`S4-H1R`** 후속 단위(§13.2) · AC-4-58 수정 · **AC-4-139·140 신규** · §17.5 미결 4건. Status 는 APPROVED 유지 — 필드 결정은 사용자 승인됐고, §17.5 는 미승인이다 |
| **개정 1.3** | 2026-11-02 | 사용자 결정 **`D4-94`~`D4-99`** 반영 (`D4-97` = 개정 1.2 · API Contract Rev 8.9 승인, Rev 8.9 APPROVED) — **`N4B-19`~`23` 전부 해소**(§17.5) · **`S4-H1R` 착수 차단 0** · §13.2 지시 확정 · AC-4-139 보강(⑦⑧) · **AC-4-141~144 신규**(`D4-86`·`D4-89`·`D4-90`·`D4-96`/`D4-99`) · 4b 합계 66 → **70** · §6·§11·§15·§18 delta. Status 는 APPROVED 유지 |
| **개정 1.4** | 2026-11-03 | 사용자 결정 **`D4-112`**(Start Session 전 권한 확인 → 거부면 처음부터 `conversation_only`) · **`D4-114`**(업로드/48h/14일 화면 = 별도 단위) 반영 — **`S4-H2R`**(§13.3) · **`S4-H3`**(§13.4) 신설 · `S4-H2` 행 범위·AC 정리(AC-4-63 → `S4-H2R`) · AC-4-63 재정의 · **AC-4-145~153 신규** · 4b 합계 70 → **79** · `D4-113`·`D4-115`~`D4-118` 은 `S4-H2F`(development-agent 진행 중) 상태만 반영 · §16 R4B-09 상태 · R4B-15 해소 · R4B-16~21 신규 · **§17.6 결정 `N4B-24`~`N4B-34`** · §17.4 PRD 수정 대상 18·19 · §19.3 체크포인트. Status 는 APPROVED 유지 — **개정 1.4 신규 단위·AC 는 미승인**이다 |
| **개정 1.5** | 2026-11-04 | 문안 정정만 (`D4-131`) — AC-4-150 ② 7일 배너 `Try again` 삭제(`D4-119`·`D4-120`) · ⑤ 밀림 수치 `AD-S4-25`(393 +74 · 320 +94 · 600 +74, `D4-130`) · CP-13·`N4B-31` 허용 차이 번호 `AD-S4-19` → `AD-S4-25`(7일 배너)·`AD-S4-26`(48h·14일 Toast). 세션 Toast(`D4-128`)는 해당 AC 없음 — 변경 0. Status 유지 |
| **개정 1.6** | 2026-11-05 | 4b QA 1회차 `FAIL` + 사용자 결정 **`D4-140`~`D4-143`** · Orchestrator **`D4-144`** 반영 — 새 단위 **`S4-H4`**(§13.5: `QA-4B-001` AC-4-35 복귀 · `QA-4B-002` AC-4-36 온보딩 이동 · `QA-4B-004` 클래식 스크롤바 넘침 · `QA-4B-003` 간헐 e2e 원인 · dev 측정판 보강) · AC-4-35·36(걸침 화면 부분) · 99 · 103 수정 · **AC-4-154~156 신규** · 4b 합계 79 → **82** · §17.7 `N4B-35`~`39` · §19.4 `CP-15`·`CP-16`·`NB-16`~`18` · `OBS-4B-3` 처리: `API_CONTRACTS.md` **Rev 8.12** 에 §13.3-⑧ C-1 · C-3 + `P4B-BIP-01` 반영. Status 유지 — **`S4-H4` 는 §19.4 승인 전 착수 금지** |
| **개정 1.7** | 2026-11-07 | 문안 정정만 (`D4-146`, Spec §21 승인) — AC-4-35 화면 부분 ③ ready 복귀 = 일반 시작과 같은 history push · 서재 안내 = Toast 한 문자열 · 320×568 시트 안내 가시 스크롤 · ④ Detail 조회 실패 = 기존 일반 실패 문구 재사용 · AC-4-99 ③ 320 클래식 스크롤바 컬럼 305 = `AD-S4-27` · §13.5-② 확정 기록. Status 유지 |

---

## 0. 이 문서를 새 파일로 만든 이유

**선택: `docs/plans/stage-4b-plan.md` 신규 작성 (기존 Plan 은 수정하지 않는다).**

| 근거 | 내용 |
|---|---|
| 1 | `stage-4-plan.md` 는 **APPROVED** 이고, 4a QA(`PASS (accepted: D4-34, NV-4A-1)`)가 그 문서의 §16.4.3 목록을 기준으로 판정됐다. 승인 문서를 고치면 **4a 판정 근거가 바뀐다** |
| 2 | 이번 변경은 **4b 범위에만** 걸린다 (`S4-F`·`S4-G` 중심). 4a 단위(`S4-A`~`S4-E`·`S4-J`)는 영향 0 |
| 3 | 1,733줄 문서에 개정 4를 덧대면 **취소선·이력이 3중**이 되어 읽을 수 없다 (Stage 3 `QA-3-010` 전례 — AC 폐기 표기 누락) |
| 4 | **AC 번호 체계는 공유**한다 — `AC-4-xx` 를 그대로 쓰고, 신규는 `AC-4-125` 부터. 이 문서는 상위 Plan §16.5 를 **대체**하는 delta 문서다 |

승인되면 plan-agent 가 `stage-4-plan.md` §16.5 머리에 *"→ `stage-4b-plan.md` 로 대체"* 포인터 1줄만 추가한다. 그 외 상위 Plan 본문(AC 정의, 결정 기록)은 이 문서가 명시적으로 수정·폐기하지 않는 한 **그대로 유효**하다.

### 0.1 측정 방법과 한계 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 측정 | 방법 | 결과 |
|---|---|---|
| 노드 구조·좌표·크기 | `get_metadata(296:1127)`, `get_metadata(28:51)` (plan-agent 초판) | §1 표 `[meta]` |
| 렌더 | `get_screenshot` 298:1262 · 298:1340 · 296:1210 · 298:1261 · 296:1257 (plan-agent 초판) | 배치 확인 `[png]` |
| **fill · shadow 선언값 · 타이포** | plan-agent 초판은 `get_design_context` 를 쓸 수 없었다 → **design-agent 가 `[ctx]`·`[var]`·`[svg]` 로 실측** (Spec §0.1) | **선언값은 Design Spec 이 정본**이다. 이 문서는 색·그림자·폰트 값을 단정하지 않고 Spec 을 참조한다 |

⚠️ 개정 1 의 수치 갱신(팝업 293 · 간격 0 · 시간 48/41 · 면 white 90% 등)은 **Design Spec §0.2 F-1~F-8 의 실측을 옮겨 적은 것**이다. plan-agent 가 이번 개정에서 Figma 를 다시 재지 않았다 (`R-FIGMA-1` ⑤).

---

## 1. 새 Figma 실측 요약 (섹션 `296:1127`)

### 1.1 프레임 목록

| 노드 | 이름 | 작성 | 상태 (개정 1) |
|---|---|---|---|
| `298:1262` | `1b2 · Session — recording [DRAFT]` | Claude 초안 (`D4-47`) | ✅ **Visual SoT 승인 (`D4-51`)** — 이름의 `[DRAFT]` 는 정리 대상(`N4B-14`) |
| `298:1340` | `1b3 · Session — paused [DRAFT]` | Claude 초안 | ✅ `D4-51` |
| **`296:1210`** | `1b3 · Session — Prompts 칩 버튼 선택시` | 사용자 추가 (`D4-50` ②) | ✅ `D4-51`. 팝업 **329×293** (`See all prompts` `300:1308` 추가 후 — Spec F-1) |
| `298:1261` | `Record Control — [DRAFT] 추가 변형` (Paused `298:1227` · Disabled `298:1236` · PermissionDenied `298:1245`) | Claude 초안 | ✅ `D4-51`. 원본 세트 `163:1590` 밖 — 병합은 비차단(`N4B-14`) |
| **`300:1309`** | ready + 닫기 | `D4-57` 반영 프레임 (`28:51` 복제 + 닫기 `300:1318`) | 신규 (Spec F-5). 원본 `28:51` 자식 6개 무변경 |
| `298:1412` | `[DRAFT] 안내` (텍스트 메모) | Claude 초안 | *"승인 전에는 구현 근거로 쓰지 않습니다"* 문구가 `D4-51` 이후에도 남아 있다 → 정리 대상(`N4B-14`) |
| `28:51` | `1b · Session — Ready / Recording` | 기존 | 변경 없음 |

### 1.2 recording `298:1262` / paused `298:1340` 공통 배치 (393×852)

상세·선언값은 **Design Spec §2.1~§2.3** 이 정본. 요약:

| y | 요소 | 출처 |
|---|---|---|
| 66 | 좌 **Prompts 칩** 117×36 @24 · 우 **닫기** 38×38 @331 | `D4-51` |
| 132 / 140 | 메달리온 링 190 / 아바타 174 | 기존 |
| **337** | **책 칩** 233×40 (recording x**82** / paused x**80**) | `D4-50` ① · `D4-51` |
| 400 | 상태 블록 — pill + 경과 시간(**SF Pro Bold 48/41**, `mm:ss`) + 보조 줄 | `D4-51` |
| 511~621 | 유연 간격 110 — 공지 슬롯 (Spec §7.2) | Spec 제안 |
| 621 | Record Control 150 — recording `Pause` / paused **`Paused`**(`Tap to resume`) | `D4-51` |
| 789 | `SessionActionBar` (`Discard` · `Submit`) | 기존 |

⚠️ 책 칩 x: recording **82** / paused·팝업 **80** → +2 어긋남 (`N4B-11` · `AD-S4-13` 후보).

### 1.3 Prompts 팝업 `296:1210` / `296:1257`

- 팝업 **329×293 @ (34, 328)**, 바닥 621 = **Record Control top → 세로 여유 0** (Spec F-1). ~~초판 269 · 간격 24~~ 는 `See all` 추가 전 값이다 (**PM-5**).
- 내용 = 제목 `Try this prompt!`(`D4-55`) + `Prompt Card` 5개(ready 버블 pill 과 같은 컴포넌트·override) + **`See all prompts`** 텍스트 버튼(`300:1308`, `D4-52`).
- 면 = white 90%, blur 없음 · 그림자 = `--shadow-bubble` · tail 없음 (Spec F-3·F-4) → 초판의 "반투명 가독성" 위험은 **해소**(최악 대비 5.90, **PM-9**).
- 닫기 버튼 · scrim · 코칭 노트 · dots 없음 — 비모달 (`D4-54`).

### 1.4 Record Control 변형 (Spec §2.5)

| 변형 | 선언 (Spec 실측) | 라벨 |
|---|---|---|
| `Paused` `298:1227` | `Record` 와 같은 면 + mic | `Tap to resume` |
| `Disabled` `298:1236` | 컴포넌트 opacity .5 (= `D4-18`) **+ 코어 그림자 제거** (PM-11) | `Tap to recording` |
| `PermissionDenied` `298:1245` | 링·코어 `#AEAEB2`(= gray-2) + mic-off | `Mic is off` |

---

## 2. 충돌 지점 전수 — 처리 결과 (개정 1)

> 규칙: PRD ↔ Figma 충돌 시 **Figma 우선, 단 지점별 사용자 승인** (CLAUDE.md).

| # | 지점 | 처리 (개정 1) |
|---|---|---|
| **X-01** | Prompt 재확인 UI 형태 (Drawer ↔ 팝업) | ✅ **`D4-52`** — **팝업 + Drawer 병행**. 팝업 `See all prompts` → Drawer `88:960`. Drawer·`PromptCarousel`·`T-1` **만든다** (**PM-1**) |
| **X-02** | `AD-S4-7` (Drawer 폭) | ✅ **`D4-52` 귀결** — Drawer 존속으로 **대상 그대로, 등록 유지** (`N4B-17` 해소, **PM-15**) |
| **X-03** | `N4-28` Drawer 진입점 | ✅ `D4-51`(Prompts 칩) + `D4-52`(Drawer 진입 = `See all`). 상위 Spec §3.3 TopBar 트리거 폐기 |
| **X-04** | 팝업 제목 줄 ↔ `D4-22` | ✅ **`D4-55`** — copy 고정 `Try this prompt!`, `D4-22` 리터럴 금지 범위 = **ready 버블 제목 줄 한정** → AC-4-120·121 grep 범위 정정 (§14.1) |
| **X-05** | recording 에서도 열리는가 | ✅ **`D4-53`** — 양쪽에서 열림, 상태 불변 |
| **X-06** | 팝업 닫기 · 모달 여부 | ✅ **`D4-54`** — 칩 재탭 · 바깥 탭 · `Escape`, 비모달. **Drawer 는 기존 모달 유지** (Spec §3.2, **PM-3**) |
| **X-07** | 코칭 노트 | ✅ **`D4-52` 귀결** — Drawer 에 남는다 → **AC-4-54 존치** (`N4B-06` 해소, **PM-2**) |
| **X-08** | Prompt 6개 이상 | ✅ **`D4-52` 귀결 (핵심)** — 팝업 = 앞 5개, **Drawer = 전부** (`N4B-07` 핵심 해소, **PM-6**). ⚠️ 귀결이 아닌 세부 선택 3건은 **`N4B-18`** 로 남긴다 |
| **X-09** | PRD §7.5 "버블 2회 · 녹음 중 개입 없음" ↔ 팝업 | ⏳ **`N4B-10`** — `D4-53` 이 녹음 중 열림을 정했지만 **"팝업 = 캐릭터 버블 아님" 해석과 PRD 수정 대상 17 등재는 명시 승인되지 않았다** (AC-4-52 문자 판정에 영향) |
| **X-10** | PRD "상단 오늘의 책 카드" (`PF-04`) | ⏳ **`N4B-09`** (축소) — 시각은 `D4-51` 로 확정. **PRD ↔ Figma 충돌 지점 승인 + PRD 수정 대상 16 등재**만 남음 |
| **X-11** | 책 칩 데이터·예외 | contract 0 (`SessionSummary.book`). 예외 처리(null·표지 없음·긴 제목)는 Spec §2.1·§4 #7 명세 → `N4B-09` 에 병합 |
| **X-12** | 닫기 의미 · ready 닫기 | ✅ **`D4-56`**(= Discard) · **`D4-57`**(ready 닫기, 확인 없음) · Figma `300:1309` 존재 (**PM-7**) |
| **X-13** | paused 재개 | ✅ **`D4-51`** — Record Control 토글 |
| **X-14** | 변형 3종 | ✅ **`D4-51`**. 사용처 매핑은 `N4B-13` (RECOMMENDED) |
| **X-15** | 경과 시간 형식 | ✅ **`D4-51` 귀결** — 승인 시안 `03:24` → `mm:ss` 고정 · 48 Bold/41 (`T-15`) (`N4B-12` 해소, **PM-10**) |
| **X-16** | 보조 문구 | ✅ **`D4-51` 귀결** — 승인 시안 속 문구(`Up to 30:00` · `Tap the button to keep recording` · `Recording`/`Paused` · `Tap to resume` · `Mic is off`) 확정. 시안에 **없는** 문구(접근성 이름·안내 시트 등)는 `S4B-Q9` |
| **X-17** | 대화 전용 흐름 `D4-44` | ⏳ **`N4B-15`** (문구 정정 + 대화 전용 ready `Submit` 활성) |
| **X-18** | 가로 +2 (팝업 · 책 칩 recording) | ⏳ **`N4B-11`** — `AD-S4-12`·`AD-S4-13` 후보 |
| **X-19** | 디자이너 요청서 | ✅ `D4-51` 로 4b 차단 질문 전부 해소 → 비차단 잔여만 (§4) |
| **X-20** | 팝업 면 가독성 | ✅ 실측 해소 — white 90%, 최악 5.90 (`N4B-16` 해소, **PM-9**) |
| **X-21** 🆕 | **팝업 세로 예산 0** | `See all` 추가로 팝업 바닥 = Record Control top. pill 2줄(40) 이면 링 침범 → ⏳ **`S4B-Q2`** (**PM-5**) |
| **X-22** 🆕 | **TopBar 미사용 → 기존 배너 배치 근거 소멸** | 상위 Spec §7 ④ 오프라인 배너 = TopBar 직하 → Toast · 공지 슬롯 · 마이크 거부 시트 → ⏳ **`S4B-Q8`** (**PM-14**) |
| **X-23** 🆕 | **짧은 세로 화면(< 796)** | iOS Safari `dvh` 에서 기본 발생 → ⏳ **`S4B-Q5`** |
| **X-24** 🆕 | **paused 시간 · 보조 줄 대비** | 2.39~2.47 (Figma 그대로) → ⏳ **`S4B-Q7`** (가값 `P-26`·`P-27` 후보) |

**합계 24건** — ✅ 해소 16 (X-11 은 contract 영향 0 확인, 예외 처리는 `N4B-09` 로 병합) · ⏳ 남음 8 (X-09 · 10 · 17 · 18 · 21 · 22 · 23 · 24).

---

## 3. Claude 시안 제안 P-1~P-7 — ✅ 전부 `D4-51` 로 해소

| # | 제안 | 결과 |
|---|---|---|
| P-1 | 경과 시간 블록 (Q2-ⓑ) | ✅ `D4-51` |
| P-2 | 상태 pill | ✅ `D4-51` |
| P-3 | 재개 = Record Control 토글 (`N4-27`) | ✅ `D4-51` |
| P-4 | 우상단 닫기 (`N4-15`) | ✅ `D4-51` + 의미 `D4-56` |
| P-5 | 좌상단 Prompts 칩 (`N4-28`) | ✅ `D4-51` |
| P-6 | Record Control 변형 3종 | ✅ `D4-51` (세트 병합은 `N4B-14`) |
| P-7 | TopBar `78:353` 미사용 | ✅ `D4-51` |

---

## 4. 디자이너 요청서 — 지금 보낼 필요 없음 (Spec §11.1 Q7 권고와 일치)

`D4-51` 로 **4b 차단 질문은 전부 해소**됐다. 남은 것은 비차단뿐이다: Q8 표지 · Q4' 가로 중심(+팝업 +2 · 책 칩 +2) · Q11 경청 표정 · Q12 완료 애니메이션 · Q16 10px 라벨 · 라이선스 표기 · 타이포 2스텝 · 변형 세트 병합·`[DRAFT]` 정리 · **짧은 세로 압축 ④** · **paused 보조 텍스트 대비**. → 발송 여부는 사용자 선택 (`§19` NB-11). 요청서 개정은 design-agent 소관.

---

## 5. Goal

`D4-50`~`D4-57` 을 반영해 Stage 4b(세션 화면 · **Prompts 팝업 + Drawer** · 완료 화면 · 예외 안내 UI · 회귀)의 작업 단위 · AC · 남은 결정을 확정한다. Mock 위에서 **ready → recording ⇄ paused → completed / abandoned** 전 흐름과 팝업 → Drawer 경로가 Figma 대로 동작하고 검증되는 상태가 목표다. Stage 4 전체 Verdict 보고 후 **멈춘다** (Stage 5 자동 착수 금지 — `D4-9`).

## 6. In Scope (요구사항 ID별, Frontend 부분)

| 요구사항 | 4b Frontend 범위 |
|---|---|
| **FR-09** 세션 화면 | ready **+ 닫기**(`300:1309`) · recording(`298:1262`) · paused(`298:1340`) · Record Control 5변형 · 바 · 상태 블록 · 책 칩 · 닫기(`D4-56`·`D4-57`) · 30분 자동 종료 |
| **FR-10** 버블 2회 | ready 버블(`139:2803`) · 완료 버블(**보조 줄 `D4-87` · 재진입 `D4-88`**, 개정 1.2) · 5분 리마인드(`D4-46`) · 팝업과의 구분(`N4B-10`) |
| **FR-11** 경청 + Prompt 모아보기 | 메달리온 경청 모션(CSS) · **Prompts 칩 → 팝업 `296:1257`** · **`See all prompts` → Drawer `88:960`**(캐러셀 + 코칭 노트) |
| **FR-19** 출석 스티커 | 완료 화면 `29:62` y 0~468 (스티커 범위 변경 없음. 화면의 버블·재진입·직접 진입은 개정 1.2 §13.2. 닫기 · Toast · 스티커 제목은 개정 1.3 §13.2) |
| **Figma 없는 UI** (`D4-96`·`D4-99`, 사용자 직접 승인, C-13) | 세션 조회 실패 화면 홈 버튼 — `/session/:id` · `/session/:id/complete` 양쪽. 형태 = Visual Gap §8.2 (개정 1.3) |
| **FR-25** 반응형 | 세션·팝업·Drawer·완료 320/393/600/1024 + 짧은 세로(`S4B-Q5`) |
| PRD §13 | 마이크 거부(PermissionDenied 변형 + 안내 시트) · 자동 종료 · 크래시 복구 · 인터럽션 · Web 백그라운드 경고 · 오프라인 (`S4-H2`/`S4-H2F`) · **마이크 거부 → 대화만 하기 = Start Session 전 권한 확인 (`D4-112`, `S4-H2R`, 개정 1.4)** · **업로드 재시도 / 48h / 7일·14일 로컬 보관 (`D4-114`·`D4-29`, `S4-H3`, 개정 1.4)** |
| FR-07 · FR-23 진입점 (개정 1.4) | Activity Card `Start Session`(`163:2648` → Reading Context 시트) · 서재 `Start Session`(`145:1132` · `163:1669`) 의 **세션 생성 직전 마이크 권한 확인** — 화면 변경 없이 동작만 추가 (§13.3) |
| 이월 | AC-4-86(`D4-35`) · AC-4-110(`D4-42`) · AC-4-104(`D4-43`) · AC-4-123·124(`D4-33`/`D4-39`) |

## 7. Out of Scope

- ~~Prompt Drawer `88:960` · `PromptCarousel`~~ → **In Scope 로 복귀** (`D4-52`, PM-1).
- 팝업 pill 탭으로 Drawer 의 해당 페이지를 여는 동작 — Figma 에 없다 (`N4B-18` ③).
- ready 화면의 **책 칩 · Prompts 칩 · 상태 블록** — `300:1309` 에 없다 (최우선 규칙 2). ready 의 **닫기는 In Scope** (`D4-57`).
- Stage 5 회고 카드(`91:691`) · 분석 상태 · 피드백.
- 네이티브 녹음·Capacitor (`S4N-*`, `D4-1`) — 마이크 설정 딥링크 포함.
- **Backend 전부** — 서버 측 동의 강제, 실제 업로드/Storage, 인사 문구 생성, 책 메타데이터 해석 (`rules/backend.md` §1).
- `/settings/notifications` (`D4-34`) · 세션 목록 EmptyState (`D4-40` → Stage 7).

## 8. Dependencies

| 구분 | 항목 | 상태 |
|---|---|---|
| 선행 Stage | 4a `PASS (accepted: D4-34, NV-4A-1)` | ✅ |
| Visual SoT | 초안 4노드 (`D4-51`) · `300:1309` (`D4-57`) | ✅ |
| Visual SoT | **`See all prompts` `300:1308` 시각** — Orchestrator 가 추가, 시각 승인 기록 없음 | ⏳ `S4B-Q1` (⛔ `S4-G1`·`G2`) |
| Plan · Spec 승인 | 이 문서 + `stage-4b-design-spec.md` (토큰 `T-15`~`T-21` 포함) | ⏳ 체크포인트 |
| 데이터 | **AC-4-108 실기기 측정 세부 수치** (잠금 구간 청크 수 · 재생 여부 · iOS 버전) | ⏳ **차단 해제 — `D4-111`** (수치 없이 `S4-H2` 착수, 경고 = `D4-26` 조건 없는 안내). AC-4-108 = `NOT VERIFIED (accepted: NV-4A-1)` 유지. 수치가 들어오면 문구·조건만 다듬는다 (개정 1.4) |
| 진행 중 (개정 1.4) | **`S4-H2F`** — `D4-113`·`D4-115`~`D4-118` 반영 (development-agent) | ⏳ `S4-H2R`·`S4-H3` 는 **`S4-H2F` handoff 이후** 착수 (같은 파일 `StorytimeSessionScreen` · `copy.ts` · `MicPermissionSheet` 를 만진다 — R4B-20) |
| 결정 (개정 1.4) | §17.6 `N4B-24`~`N4B-34` · §19.3 | ⏳ ⛔ `S4-H2R`·`S4-H3` |
| 미결정 | §17 · §19 | |

## 9. Frontend Architecture Impact

| 영역 | 변경 (개정 1) |
|---|---|
| `features/session-prompts` (가칭, 상위 Plan `features/prompt-drawer` 대체) | **칩 트리거 + 비모달 팝업 + Drawer(`Sheet`)** 를 한 feature 가 소유 — 열림 상태 · 바깥 탭 · `Esc` · 팝업→Drawer 순차 전환 · 정리 (Spec §4 #8 `SessionPromptsPopover`) |
| `packages/ui` | **신규 컴포넌트 0**, 확장 3: `RecordControl` state 5종 · `Button size="sm"` · `TextLink tone="subtle"`. **`PromptCarousel` 되살림** (상위 Spec §4 #2). 팝업 = 기존 `SpeechBubble tail="none"` 재사용 |
| `entities/session` | `SessionStatusBlock`(상위 `SessionTimer` 대체) · `SessionBookChip` 신규 — `SessionSummary.book`·`recordedSeconds` 구독, **계산은 `RecordingController` 소유** |
| `RecordControl` 변형 선택 | 상태 → 변형 **순수 함수** (unit test) |
| Page | `pages/session` 은 조립만 |
| 토큰 | Tier-3 세트 7개 `T-15`~`T-21` (신규 Primitive·Semantic 0, `@theme` 등재 0) — Spec §5.2 |
| `R-SHADOW-1` | 기본(393×852)에서는 **내부 스크롤 없음** → inset 불필요. 짧은 세로 압축(`S4B-Q5` ③) 채택 시에만 pill 목록 `overflow-y: auto` 신규 → 포커스 링 inset + 근거 주석 + 양축 프로브 |

## 10. Data Requirement Delta (Handoff 용)

**신규 테이블 0건 · 응답 필드 1건** (개정 1.1, `D4-59`): `SessionSummary.reminderBubble` — 저장 대상이 아니라 **검수 템플릿 생성값**(`P4-BIP-11` 확장). 아동 데이터 신규 수집 0.
**응답 필드 2건 추가** (개정 1.2, `D4-87`·`D4-88`) — 신규 테이블 0건, 컬럼 설계는 Backend 소관:
- `completionBubble.subtext` — 저장 필드가 아니라 **검수 템플릿 생성값** (`P4B-BIP-02`).
- `SessionDetail.completionBubble` — **새 보존 요구.** 서버는 `completed` 전이 때 고른 문구를 세션 단위로 보존하고 같은 값을 재조회에 돌려준다 (`P4B-BIP-03`). 주 문구에 아이 이름이 들어갈 수 있으므로(`P4-BIP-11` 안전 슬롯) **자녀 연결 데이터**로 취급한다 — 소유권 확인·RLS·전체 삭제 대상. 렌더된 문구 저장인지 템플릿 id + 슬롯 재구성인지는 Backend 선택이나, **재조회 값이 전이 응답과 같아야 한다.**
- `docs/DATA_MODEL.md` 는 이번 개정에서 고치지 않았다 — 지시 범위 밖. Stage 8 `DATA_REQUIREMENTS` 초안 작성 시 위 두 BIP 를 반영한다.
- `SessionSummary.book` 은 Activity Card · 서재 · `childBookId` 세 경로 모두에서 채워져야 한다 (`P4B-BIP-01`).
- (개정 1.6, `S4-H4`) 신규 테이블·필드 0. 요구 2건: 끝나지 않은 `recording`·`paused` 세션의 서버 정리 규칙(`P4B-BIP-07`, `N4B-35` ⓐ 채택 시) · `ONBOARDING_INCOMPLETE` 와 `me.onboardingStatus` 일관성(`P4B-BIP-08`) — §13.5-⑧.
- 표지 `coverUrl` 은 공개 표지 이미지(아동 데이터 아님).

## 11. API Contract Delta

| 항목 | 결과 |
|---|---|
| 팝업 제목 줄 | **0건** — copy 고정 라벨 (`D4-55`) |
| 책 칩 | **0건** — `book.title` · `book.coverUrl` |
| 닫기 | **0건** — `ready→abandoned`(`D4-57`) · `recording/paused→abandoned`(`D4-56`·`D4-13`) 기존 전이 `[직독: rules/session-transitions.ts:39·55·56]` |
| Drawer | **0건** — `Prompt.coachingNote` 기존 필드 |
| 경과 시간 | **0건** — `recordedSeconds` |
| Error code | **0건** |
| ⭐ **ready 리마인드 문구** (개정 1.1, `D4-59`) | **1건** — `SessionSummary.reminderBubble: SessionBubbleCopy \| null` (`bubble` 옆, required + nullable). 길이 = `D4-21` 적용 · null = 시각 변화 0 · 상세 `API_CONTRACTS.md` §3.2.2 | 
| ⭐ **완료 버블 보조 줄** (개정 1.2, `D4-87`) | **1건** — `SessionBubbleCopySchema` 에 `subtext` 추가. `.nullable().optional()`(`D4-94`). `.max` 없음. 렌더 지점 = 완료 버블(`88:929`)만. `text` 없으면 버블 미렌더(`D4-95`) · 줄바꿈 + 생성 측 상한(`D4-98`). 상세 `API_CONTRACTS.md` §3.2.3 |
| ⭐ **완료 버블 재진입** (개정 1.2, `D4-88`) | **1건** — `SessionDetail.completionBubble: SessionBubbleCopy` (required + nullable, `sticker` 선례 `C4-OPEN-6`). `SessionTransitionResult.completionBubble?` 는 그대로 둔다 |
| 직접 진입 (`D4-91`) | **0건** — `SessionDetail.status` 기존 필드 |
| 닫기·Toast·스티커 제목·오류 화면 홈 버튼 (개정 1.3) | **0건** — 화면·copy 만 변경 (`D4-86`·`D4-89`·`D4-90`·`D4-99`). 조회 실패는 기존 error envelope |
| ⭐ **Start Session 모드 결정** (개정 1.4, `D4-112`) | **schema 0건.** `CreateSessionRequest.mode` 기존 필드에 Frontend 가 권한 결과로 `conversation_only` 를 보낸다. refine 은 `conversation_only` 에 책 id 를 **허용**한다 `[직독: API_CONTRACTS.md §3.2 create-session.ts refine — recorded 만 책 필수]` → 책 연결 유지. 전이 `ready → completed (conversation_only)` 기존 `[직독: §3.1 SESSION_TRANSITIONS]`. ready 중 모드 전환 계약 **만들지 않는다**(`D4-112`). **문서 delta 제안 3건**(아래 §13.3-⑧) — `API_CONTRACTS.md` 수정은 `S4-H2F` 와 겹치지 않는 시점에 plan-agent (`rules/workflow.md` §5) |
| ⭐ **업로드 / 48h / 7일·14일 안내** (개정 1.4, `D4-114`) | **schema 0건 · endpoint 0건.** 전부 기기 로컬 큐·저장소 신호(`upload_stalled`·`retention_notice`·`retention_expired`, 4a `S4-E`)다. 서버에 알리지 않는다(RU-16 기존). Error code 0 (`RECORDING_INCOMPLETE` 기존) |

## 12. Mock Scenarios (4b 추가분 — PM-16: Spec 추가 제안 없음)

| key (제안) | 내용 | 목적 |
|---|---|---|
| `session:book-missing` | `book: null` | 책 칩 미렌더 + **자리 유지**(상태 블록 y 불변) |
| `session:book-no-cover` | `coverUrl` 없음 | 표지 `T-5` 그라디언트 |
| `session:book-long-title` | 40자 이상 | 1줄 말줄임 |
| `session:prompts-1` / `-5` / `-7` | n = 1 · 5 · 7 | 팝업 높이 `73+44n`(n≤5) · **n=7 팝업 5개 + Drawer 7페이지** · Record Control 침범 0 |
| `session:prompts-empty` | `prompts: []` | 칩 비활성 (`S4B-Q4`) |
| ⭐ `session-greeting:success` / **`session-greeting:reminder-missing`** (개정 1.1) | `reminderBubble.text = 'Ready when you are!'` / `reminderBubble: null` | 5분 시점 제목 줄 교체 / 시각 변화 0 (AC-4-46 화면). `session-greeting` 그룹 등재 = `API_CONTRACTS.md` §5.4 Rev 8.6 |
| ⭐ `session-completion:success` / **`subtext-missing`** / **`bubble-missing`** (개정 1.2, 신규 그룹) | 보조 줄 포함 완료 버블 / `subtext: null` / `completionBubble: null` — **전이 응답과 `SessionDetail` 이 같은 값** | 보조 줄 렌더 · 줄 없음(본체 bottom 406) · 버블 없음. 그룹 등재 = `API_CONTRACTS.md` §5.4 Rev 8.9 |
| 기존 재사용 | `consent-missing`(→ `disabled`) · 지연(전이 처리 중 → `disabled`) · `mic-permission-denied`(→ `permission-denied`) · `auto-timeout` · `web-background-warning` · `offline` · 업로드 성공/실패 · 크래시 복구 | 변형·안내 연결 검증 |

| ⭐ **`recorder:mic-permission-blocked`** (개정 1.4 제안, `S4-H2R`) | `checkPermission()` = `denied` (이미 거부 — 프롬프트 0) | Start Session → 프롬프트 0 · `mode=conversation_only` (AC-4-145) |
| ⭐ 기존 **`recorder:mic-permission-denied`** 의미 확인 | 현행 = `checkPermission()` `prompt` → `requestPermission()` `denied` `[직독: MockRecorderAdapter.ts:81·169]` | **Start Session 의 프롬프트 → 거부** 경로 (AC-4-63) — key 이름 유지, 설명만 갱신 |
| ⭐ **`recorder:mic-unavailable`** (개정 1.4 제안) | `checkPermission()` = `unavailable` (장치 없음·미지원·비보안 컨텍스트) | `N4B-24` ③ 채택 시 → `conversation_only` |
| ⭐ **`recorder:mic-permission-revoked`** (개정 1.4 제안) | Start 시 `granted` → Record 탭 `start()` = `permission_denied` | 녹음 세션 중 권한 상실 (AC-4-148) — 모드 전환·세션 생성 요청 0 |
| (권한 API 미지원) | key 없음 — Web `queryPermission()` 이 `null` → `prompt` 로 접힌다 `[직독: web-recorder-adapter.ts:246]` → 기본 key 와 같은 경로 | unit 에서 `environment.queryPermission` 주입으로 검증 |
| ⭐ 기존 재사용 (`S4-H3`) | `recordings:upload-stalled-48h` · `recordings:recording-incomplete` · `recordings:offline-queued` · `recorder:local-retention-exceeded` · 7일 = 주입 clock | AC-4-30·32·67 화면 · AC-4-149~151 |
| ⭐ **`recorder:local-retention-notice`** (개정 1.4 제안, `S4-H3`) | 7일 + 1분 전 미업로드 녹음 seed (`seedStaleRecording` 재사용, 시각만 다름) | 7일 안내를 **브라우저 e2e** 로 결정적으로 재현 (현재는 unit clock 만) — AC-4-150 |

시나리오 key 등재(`API_CONTRACTS.md` §5.4)는 승인 후 plan-agent. 개정 1.4 제안 key 4건(`mic-permission-blocked` · `mic-unavailable` · `mic-permission-revoked` · `local-retention-notice`)은 §19.3 승인 후 등재한다.

## 13. 작업 단위 (한 단위 = development-agent 1회 호출)

| 단위 | 범위 | AC (주 판정) | 선행 | 착수 차단 결정 |
|---|---|---|---|---|
| **`S4-F1`** 진입 · ready | `D-3` 해제 + 오프라인 캐시 비활성·`InlineAlert titleId`(같은 패스, `D4-39`) · Reading Context 시트(`D4-35`) · `/session/:id` ready(`28:51`) · **ready 닫기(`300:1318`, `D4-57`)** · `D4-11` IconButton 그림자 + baseline 재생성 · AC-4-46 리마인드 화면 | 38 · 39 · 40 · 86 · 110 · 111 · 117~124 · **136** (15) | Plan·Spec 승인 | 없음 |
| **`S4-F2`** recording · paused | 상태 블록 · 책 칩 · Prompts 칩 **자리**(시각·`disabled` 아님 — 동작은 `G1`) · 닫기(`D4-56` 다이얼로그) · **RecordControl 5변형 컴포넌트** · `Discard`/`Submit` · AC-4-43 화면 부분 | 41 · 42 · 50 · 51 · 112~116 · 125~129 · **138** (15) | `S4-F1` | `CP-4`(C-13 일괄 중 C13-4B-5·6) |
| **`S4-G1`** Prompts 팝업 | 칩 disclosure + 팝업 `296:1257`(5 컷오프 · 제목 `D4-55` · `See all` 렌더) · 비모달 동작 · 정리 · 빈 목록 | 52 · 130 · 131 · 132 · 133 · **135** (6) | `S4-F2` | `CP-1` · `CP-2` · `CP-3` · `CP-4`(C13-4B-1·2·10) |
| **`S4-G2`** Prompt Drawer | `See all` → `Sheet` + `PromptCarousel` + 코칭 노트 + dots/화살표(상위 Spec §3.2 그대로) · 포커스 복귀 = 칩 | 53 · 54 · 55 · 56 · **137** (5) | `S4-G1` | `CP-1` · `CP-4`(C13-4B-7) |
| **`S4-H1`** 완료 화면 | 화면 본체 + **후속 `S4-H1R`**(§13.2, 개정 1.2 — ~~변경 없음~~ 정정) | 57~61 · 104 · 107 · **139 · 140 · 141 · 142 · 143 · 144** (13) | `S4-F2` | 없음 (`N4B-19`~`23` 해소, 개정 1.3) |
| **`S4-H2`** 예외·안내 UI | 마이크 거부(PermissionDenied 연결 + 안내 시트) · 대화 전용 ready 화면(`D4-44`, CP-6) · 공지 슬롯 · 오프라인 Toast · 크래시 복구 Toast(`D4-117`) · Web 백그라운드 경고 · 자동 종료 안내 — ~~업로드/48h/14일~~ → **`S4-H3`** (`D4-114`, 개정 1.4) · ~~대화 전용 **전환**~~ → **`S4-H2R`** (`D4-112`) · 후속 **`S4-H2F`**(`D4-113`·`D4-115`~`D4-118`, ⏳ development-agent 진행 중) | 64 · 65 · 68 · 69 · 70 · 134 (6) + 140 ⑤(`D4-113`, `S4-H2F`) — ~~63~~ → `S4-H2R` | `S4-F2` | ✅ 해소 (`D4-58` CP-4·5·6 · `D4-111` · `D4-113`·`D4-115`~`D4-118`) |
| ⭐ **`S4-H2R`** Start Session 권한 확인 (개정 1.4, `D4-112`) | 세션 생성 **직전** 권한 확인 → `recorded` / `conversation_only` 결정 (Activity Card · 서재 두 경로) · 확인 중 상태 · 프로브 스트림 해제 · 대화 전용 진입 안내 · `Talk without recording` 처리 · 세션 중 권한 상실 — **§13.3** | **63** · **145** · **146** · **147** · **148** (5) | `S4-H2F` handoff | ⛔ `N4B-24` · `N4B-25` · `N4B-26` · `N4B-27` (§19.3) |
| ⭐ **`S4-H3`** 업로드 / 48h / 7일·14일 안내 (개정 1.4, `D4-114`) | 큐·저장소 신호 → 화면 노출 경로 · 48h 재시도 안내 · 7일 보관 안내 · 14일 삭제 통지 · `RECORDING_INCOMPLETE` 화면 · 업로드 진행 표시 여부 — **§13.4** | **149** · **150** · **151** · **152** · **153** (5) + AC-4-30·32·67 **화면 부분**(4a/4b 걸침 — 집계 외, 상위 Plan §16.5.3 머리말) | `S4-H2F` handoff (Toast·앱 시작 신호 구독 경계 재사용) | ⛔ `N4B-30` · `N4B-31` · `N4B-32` (§19.3) |
| ⭐ **`S4-H4`** 4b QA 1회차 후속 (개정 1.6, `D4-140`~`D4-144`) | ① `SESSION_ALREADY_ACTIVE` 복귀 경로(`QA-4B-001`) ② 세션 endpoint `ONBOARDING_INCOMPLETE` → Route Guard 온보딩 이동(`QA-4B-002`) ③ 클래식 스크롤바 가로 넘침 수정(`QA-4B-004`, `D4-141`) ④ 간헐 e2e 원인 판별 + 수정(`QA-4B-003`, `D4-142`) ⑤ dev 측정판 보강 — 시작 지연 두 끝점 · 판정 스트림 해제(`D4-144`) — **§13.5** | **154** · **155** · **156** (3) + AC-4-35·36 **화면 부분**(걸침 — 집계 외) + AC-4-99 ③ · AC-4-103 재판정 | `S4-K` 이후(4b QA 1회차) | ⛔ `N4B-35` · `N4B-39`(측정판 표시는 무관, AC-4-50 판정만) (§19.4) |
| **`S4-K`** 회귀·시각 | Figma 대조(`300:1309` · `298:1262` · `298:1340` · `296:1210` · 변형 3) · 짧은 세로 · 양축 프로브 · reduced-motion · 전체 스위트 **단독 실행** | 95~103 (9) (+109 회귀) | 전 단위 | `CP-7` |

**합계 82** = 15 + 15 + 6 + 5 + 13 + **6** + **5** + **5** + **3** + 9 ✓ (§14.4 와 일치, 개정 1.6 — 개정 1.4 의 79 + `S4-H4` 3). AC-4-30·32·67 은 4a/4b 걸침 AC 라 4b 70 목록에 원래 없었다 — 집계에 넣지 않고 `S4-H3` QA 에서 "화면 부분 판정" 으로 명시한다.

**순서·의존**:

```
S4-F1 → S4-F2 ─┬→ S4-G1 → S4-G2 ─┐
               ├→ S4-H1 ─────────┼→ S4-K
               └→ S4-H2 → S4-H2F ┬→ S4-H2R ─┤   (개정 1.4)
                                 └→ S4-H3 ──┘
                                              S4-K → 4b QA 1회차 FAIL → S4-H4 → 4b QA 2회차   (개정 1.6)
```

- (개정 1.4) `S4-H2R` · `S4-H3` 는 서로 독립이나 Playwright 단독 실행 규칙상 **순차**: `H2F → H2R → H3 → K` 권장. `H2R` 를 먼저 두는 이유 = PRD §13 **P0**(대화만 하기)이고 `MicPermissionSheet` 를 `H2F` 직후 같은 맥락에서 만지기 때문.

- `S4-F1` 은 체크포인트 승인 직후 착수 가능 (결정 차단 0).
- `S4-F2` 는 `CP-4` 만 받으면 된다 — 그 외 시각·의미는 `D4-51`·`D4-56` 으로 확정.
- `S4-G` 분할 근거: 팝업(비모달 disclosure)과 Drawer(모달 Sheet + 캐러셀)는 **접근성 모델이 정반대**이고, `G` 를 한 단위로 두면 `R4-09`(agent stall) 전례 규모가 된다 (**PM-1**).
- `S4-H1`·`S4-H2` 는 `S4-F2` 이후 `G1`·`G2` 와 **병렬 가능**하나, 모든 Playwright 실행은 **단독**이어야 한다(메모리 규칙) → development-agent 호출은 **순차** 권장: `F1 → F2 → G1 → G2 → H1 → H2 → K`.
- 상위 Plan §16.6.3 의 `S4-H2` 선행 근거(*"paused Figma 대기"*)는 `D4-51` 로 **소멸**했다.

### 13.1 ⭐ `S4-F1` 후속 — `S4-F1R` ready 리마인드 화면 (개정 1.1, `D4-59`)

`S4-F1` 이 F1-8 ① NEEDS_DECISION 으로 남긴 **AC-4-46 화면 부분**만 다룬다. 선행 `S4-F1` · 차단 결정 0 · `S4-F2` 와 순서 무관(같은 ready 화면이므로 **F2 착수 전** 권장). AC 총수 변동 없음(AC-4-46 은 기존 번호).

**development-agent 구현 지시 (5줄)**
1. **contracts**: `packages/contracts/src/sessions/session.ts` `SessionSummarySchema` 에 `reminderBubble: SessionBubbleCopySchema` (required·nullable, `.max` 없음) 추가 + schema 단위 테스트(null · `text: ''` · 문자열 parse 통과, 키 누락 거부).
2. **Mock fixture**: `mocks/fixtures/sessions.ts` 기본 ready 세션에 `reminderBubble.text = 'Ready when you are!'` · `session-greeting:reminder-missing` key = `reminderBubble: null` 추가, Mock 응답 contracts parse 유지 · `API_CONTRACTS.md` §5.4 구현 반영(Rev 8.7).
3. **화면**: `RecordingController` 의 5분 리마인드 신호(`D4-46`)를 구독해 ready 버블 **제목 줄만** `reminderBubble.text` 로 교체(1줄 clamp 동일, pill 불변) · null/빈 문자열이면 **아무것도 바꾸지 않음** · Frontend 문구 상수·fallback 0.
4. **테스트**: 주입 clock 으로 ① 5분 전 = 인사 ② 5분 후 = 리마인드 문구(1회, 렌더 횟수) ③ `reminder-missing` = 5분 전후 DOM 동일 ④ 10분 `abandoned` 회귀 ⑤ 리마인드 리터럴 grep — `mocks/` 밖 0건.
5. **시각**: 리마인드 상태 baseline 1장(393) 추가(`R-BASELINE-1` — 정착 후 촬영) · Playwright 단독 실행 · design-agent Visual Gap 대상 등록.

### 13.2 ⭐ `S4-H1` 후속 — `S4-H1R` 완료 화면 결정 반영 (개정 1.2 `D4-87`·`D4-88`·`D4-91` · 개정 1.3 `D4-86`·`D4-89`·`D4-90`·`D4-94`~`D4-99`)

`S4-H1` 구현은 끝났고 Visual Gap 결정이 Contract 와 화면을 바꾼다. 이 단위는 그 delta 만 다룬다. 착수 차단 결정 0 (개정 1.3). `D4-92`(링)는 코드 변경이 없어 AC 를 만들지 않는다. AC = 139~144 (개정 1.3).

**development-agent 구현 지시 (10줄)**
1. **contracts**: `sessions/session.ts` — `SessionBubbleCopySchema` 에 `subtext: z.string().nullable().optional()`(`D4-94`) · `SessionDetailSchema` 에 `completionBubble: SessionBubbleCopySchema`(required). `.max` 없음. 단위 테스트: `subtext` 문자열·`null`·`''`·key 없음 통과 · `SessionDetail` key 누락 거부 · `null` 통과. 기존 `bubble`·`reminderBubble` parse 회귀.
2. **Mock**: `toDetail` 이 완료 계열(`completed`·`analyzing`·`analyzed`·`failed`)에서만 값을 내고 나머지는 `null`. ⚠️ 현재 `MockSessionRecord.completionBubble` 은 ready 세션 생성 시점부터 채워져 있어 그대로 내보내면 ready 세션 Detail 에 버블이 실린다 `[직독: MockSessionApi.ts:371]`. `MOCK_COMPLETION_BUBBLE.subtext` = Figma 문자열 `14 min together · sticker earned`. ⚠️ 지난 세션 seed 는 `sticker: null` 이다 `[직독: :152]` — 그 세션은 `subtext: null` 이어야 응답이 스스로 모순되지 않는다. `session-completion` 그룹 구현, 값은 전이 응답과 Detail 이 공유.
3. **재진입**: `useSessionCompletion` — 전이 응답이 있으면 그것, 없으면 `detail.completionBubble`. 오프라인 제출(`result: null`)은 조회하지 않는 현행 유지 (`D4-88` 수용).
4. **화면**: `SessionCompleteBubble` 에 보조 줄 — 응답 값만 표시, Frontend 조립·문구 상수 0 (`recordedSeconds` 로 조립 금지, `rules/architecture.md` §8). 13/19 · `--color-fg-secondary` · 가운데 정렬 · gap 6 · **줄바꿈, clamp 없음**(`D4-98`). 구현 함정 = Visual Gap §7.6 (`SpeechBubble` `hint` 슬롯 금지 · `session.css:33` line-height 22 강제). `text` 가 비면 `subtext` 가 있어도 버블 미렌더(`D4-95`). ready·리마인드 버블은 `subtext` 를 그리지 않는다.
5. **직접 진입**: Detail 경로에서 `status` 가 `ready`·`abandoned` 이면 홈 `replace` (`StorytimeSessionScreen` 선례). 전이 응답이 기억된 경로는 판정하지 않는다. `recording`·`paused` 는 `S4-H2`.
6. **닫기** (`D4-86`): 완료 화면 닫기 → 홈 `replace`. 전이 요청 0.
7. **Toast** (`D4-89`): `SessionCompletePage` 가 TopBar 를 `FullscreenLayout` `topBar` prop 으로 넘겨 inset 을 등록한다(Spec §2.5.1 구현 지시). Toast 가 스티커 위로 내려오므로 구현 후 **재측정**한다 — 값은 아직 미측정이다.
8. **스티커 제목** (`D4-90`): 14 Semibold 복귀 + Tier-3 토큰(`--attendance-sticker-title-size` · line-height), 신규 Primitive 0.
9. **오류 화면 홈 버튼** (`D4-96`·`D4-99`): `ErrorState` 카드 아래 형제 · gap `--space-3` · `Button` `glass` `md` · `fullWidth` 없음 · 문구 `Back to Home`(`features/storytime-session/copy.ts`) · 홈 `replace` · `Try again` 유지 · 자동 포커스 없음. `/session/:id` · `/session/:id/complete` 조회 실패 전체에 표시, feature 내부 조립 1개로 공유. `packages/ui` 변경 0. 명세 = Visual Gap §8.2.
10. **테스트·시각**: 아래 §15 · `s4-session-complete` baseline 재생성은 `R-BASELINE-1` 절차(diff 원인 분해) · Playwright 단독 · design-agent Visual Gap 재확인(본체 bottom 431 · 줄 높이 19 · Toast 재측정 · 스티커 제목 14 · 오류 화면 명세 일치).

### 13.3 ⭐ `S4-H2R` — Start Session 전 마이크 권한 확인 (개정 1.4, `D4-112`)

**근거**: `D4-112`(H2-D1 ⓒ) · `docs/qa/stage-4b-handoff.md` `# S4-H2` H2-3 `H2-D1` — 제약 **`mode` 는 생성 시 고정 · 전이 body 에 `mode` 없음** → ready 중 전환 불가. PRD §13 *"마이크 권한 거부 → 권한 필요 이유 안내 화면 → 설정 딥링크. 거부 상태에서는 '대화만 하기'로 세션 진행 허용"* (P0) `[직독: PRD v1.5 §13 표 1행]`.

**측정·조회 (`R-FIGMA-1` ⑤)**: `get_metadata(26:21)` Home — 자식 11개(캐릭터 · 상태바 · 워드마크 · Streak · 설정 · Deck Dots · Tab Bar · Pagenation · Bubble), **권한·안내 UI 없음**. Activity Card `163:2648` · 서재 `145:1132`/`163:1669` 는 이번에 재측정하지 않았다 — `FIGMA_SCREEN_MAP.md:127` *"`/session/:sessionId/permission` … **Figma 누락**"* 기록에 의존. → design-agent 가 확인한다 (§18).

#### ① 어디서 · 언제 묻는가 — `N4B-24` (⛔)

| 경로 | 현재 생성 지점 `[직독]` | 권한 확인 시점 (권고) |
|---|---|---|
| Home Activity Card | `ActivityCardDeck.tsx:140` `confirmReadingContext` → `selectOption.select` → `createSession.create({ mode: 'recorded', … })` (`:156`) | Reading Context 시트 **확인 탭 직후**, `selectOption` **앞**. 권한 결과를 받은 뒤 선택 → 생성. 근거: 프롬프트가 사용자 탭에 바로 이어진다(브라우저가 사용자 동작 없는 프롬프트를 억제할 수 있음 — 일반 원칙, 플랫폼 단정 아님) · 프롬프트 중 이탈해도 선택 POST 가 남지 않는다 |
| 서재 책 시트 | `StartSessionAction.tsx:52` `onPress` → `createSession.create({ mode: 'recorded', … })` | `Start Session` **탭 직후**, `create` 앞 |

| 권한 상태 (`PermissionService.check()`) | 동작 (권고 ⓑ "ensure") | 생성 body `mode` |
|---|---|---|
| `granted` | 프롬프트 0 | `recorded` |
| `prompt` (첫 사용) | **OS 프롬프트 1회** (`requestPermission`) → 결과로 분기 | 허용 → `recorded` / 거부 → `conversation_only` |
| **권한 API 미지원** (Safari < 16 · Firefox < 132 — `navigator.permissions.query({name:'microphone'})` 미지원 시 `TypeError`) | 현행 어댑터가 `null → 'prompt'` 로 접는다 `[직독: web-recorder-adapter.ts:246 · web-media-environment.ts:70-79]` → **`prompt` 와 같은 경로** | 위와 같음 |
| `denied` (이전에 거부) | 프롬프트 0 (브라우저는 재요청 프롬프트를 띄우지 않는다 — `permission-service.ts` 주석) | `conversation_only` |
| `unavailable` (장치 없음 · `mediaDevices` 없음 · 비보안 컨텍스트) | 프롬프트 0 | **`conversation_only`** (권고, `N4B-24` ③) |

- 출처: MDN BCD `api/Permissions.json` `permission_microphone` — Chrome 64 · **Firefox 132** · **Safari 16** · Safari iOS 16 (mirror), 미지원 이름은 `TypeError` reject (MDN `Permissions.query`) — 2026-11-03 조회.
- **ⓐ check-only 를 권고하지 않는 이유**: 첫 사용자(`prompt`)가 가장 흔한데, ⓐ 는 그들을 `recorded` 로 만들고 **첫 거부가 세션 안에서** 일어난다 → `D4-112` 가 막으려던 "세션 중 전환 불가" 상황이 그대로 남는다.
- 확인 중 상태: Activity 시트 확인 버튼 · 서재 `Start Session` 이 **`loading`**(기존 `Button loading` — `StartSessionAction.tsx:49` 선례) · 재탭 → 프롬프트·생성 이중 0. 프롬프트를 사용자가 닫지 않고 두면 `loading` 유지(시간 제한 없음 — 권고).
- **contract 호출 순서 불변**: 권한 확인은 서버 요청이 아니다. 동의 전 아동 데이터 전송 0 원칙 무관(`rules/architecture.md` §9).

#### ② 권한 확인을 어디에 두는가 (아키텍처)

- `features/activity-card-deck` 과 `features/library` **둘 다** 필요 → `features/recording` 의 `PermissionService` 를 직접 import 하면 feature 간 import 위반(`rules/architecture.md` §3).
- **권고**: `entities/session` 에 **세션 모드 결정 hook**(가칭 `useResolveSessionMode`)을 두고, 권한 포트는 `app/providers`(`sessionRecorderEnvironment.ts` 와 같은 조립 지점)가 주입한다 — Mock(`MockRecorderAdapter` 계획) | Web(`WebRecorderAdapter`). Adapter 선택 지점 1곳 유지. 두 feature 는 hook 결과(`'recorded' | 'conversation_only'`)를 `createSession.create({ mode })` 에 넣기만 한다.
- **프로브가 연 스트림** (`N4B-29`, RECOMMENDED): Web 어댑터의 `requestPermission()` 은 `getUserMedia` 스트림을 **열어 둔다**(`primed`) `[직독: web-recorder-adapter.ts:249-257]`. Start Session 에서 열면 **Home·ready(최대 대기) 동안 마이크가 켜진 채**가 된다 → **권고: 권한 판정 직후 트랙을 닫는다**(프라이버시 — 녹음하지 않는 동안 마이크 표시등 0). 비용: Record 탭에서 스트림을 다시 연다(녹음 시작 지연 ≤ 1s AC 영향은 수동 측정). ⚠️ Safari 가 재요청 시 프롬프트를 다시 띄우는지는 **확인하지 않았다** → R4B-16 · manual device.

#### ③ 대화 전용 세션 진입 안내 — `N4B-26` (⛔)

생성 전 Home 에서는 **아무것도 띄우지 않고**(Figma 없음), 세션 화면에 이미 있는 UI 로 알린다:

| 선택지 | 내용 | 평가 |
|---|---|---|
| **ⓐ (권고)** | `conversation_only` 세션 **진입 시 마이크 시트(`MicPermissionSheet`) 1회 자동** — 현 트리거 "권한 거부 직후 1회 자동"(Spec §7.3)의 연장. 이후 Record(`permission-denied`) 탭 → 시트(`D4-118` 유지) | 신규 UI 0 · `AD-S4-16` 범위 안 · 트리거 확장만 승인 필요 |
| ⓑ | 생성 전 Home 확인 다이얼로그 *"Continue without recording?"* | **Figma 에 없는 UI** → C-13 (화면별 승인) · 단계 1개 추가 |
| ⓒ | 알리지 않음 (`permission-denied` 변형 `Mic is off` 만) | 신규 0 이나 녹음이 안 되는 이유를 모른다 |

- 시트 **문구** (`N4B-28`, 비차단): `D4-115` 승인 문구 `micSheet.description` = *"… allow microphone access … then come back to this screen."* `[직독: copy.ts:51-52]` — `conversation_only` 세션에서는 **돌아와도 녹음되지 않는다**(모드 고정). → **대화 전용 변형 문구 1건** 초안 후 승인 (예시 방향만: 설정 허용 후 *새 세션*을 시작하면 녹음된다). 문구 확정은 사용자.

#### ④ `Talk without recording` 버튼 · 세션 중 권한 상실 — `N4B-27` (⛔)

`D4-112` 이후 이 버튼이 필요한 경우를 전수한다:

| 경우 | 세션 `mode` | 버튼이 할 수 있는 일 |
|---|---|---|
| Start 에서 거부·차단·장치 없음 | `conversation_only` | **없음** — 이미 대화 전용 |
| Start 에서 허용 → ready 에서 Record 탭 시 거부 (프로브 스트림 해제 후 재프롬프트 거부 · 설정에서 철회 · 새로고침 후 Safari 재프롬프트) | `recorded` | 모드 전환 계약 없음(`D4-112`) → H2-D1 ⓐ(폐기 + 재생성)뿐 — 사용자가 **선택하지 않은** 안 |
| recording·paused 중 트랙 종료(`track-ended`) → paused → 재개 시 거부 | `recorded` | 이미 녹음이 있다 → **`Submit` 으로 지금까지 녹음을 제출**할 수 있다(`paused → completed`). 전환 불필요 |

| 선택지 | 내용 |
|---|---|
| **ⓐ (권고)** | **모든 모드에서 `Talk without recording` 미렌더** (현행 유지 — `MicPermissionSheet.tsx:12`) + Spec §7.3 · copy 에서 **제거**. 녹음 세션 ready 에서 거부되면 시트(`Not now`) + 기존 **닫기**(`D4-57`, `ready → abandoned`) → 홈에서 다시 `Start Session` 하면 `check() = denied` → 자동으로 `conversation_only`. 신규 UI 0 · 계약 0 |
| ⓑ | 녹음 세션 ready 에서만 버튼 노출 → `ready → abandoned` + 홈 `replace` (재생성은 하지 않음 — 사용자가 다시 시작) | 시트에 버튼 1개 유지, 동작 = 닫기와 동일 → 중복 |
| ⓒ | H2-D1 ⓐ 부활 — `ready → abandoned` + `POST /v1/sessions mode=conversation_only` 재생성 | `SessionSummary` 에 `bookId`/`childBookId`/`activityCardOptionId` 가 없어 책 연결 이관 불가 `[직독: H2-D1]` → contract 추가 필요 · 사용자가 ⓒ(이 결정)를 고르며 배제한 방향 |

#### ⑤ 영향 받는 기존 AC · 결정

| 대상 | 영향 |
|---|---|
| **AC-4-63** | **재정의** (§14.1) — 판정 단위 `S4-H2` → **`S4-H2R`**. 원문의 *"설정 딥링크"* 는 Web 불가 → 안내 문단으로 대체(4b Spec §7.3 · 네이티브는 `S4N-*`), *"후자(대화만 하기 버튼)를 누르면"* → **Start Session 에서 자동 결정** |
| **`D4-44`** | 흐름(ready 버블 → `Submit` → `completed`) **불변**. **진입**만 바뀐다 — 대화 전용 세션은 세션 화면 안에서가 아니라 **생성 시점**에 정해진다. 결정 문구 정정 불필요(CP-6 으로 이미 Drawer → ready 버블 정정) — 기록만 |
| **CP-6** (`D4-58`) | **불변** — 대화 전용 ready 에서 `Submit` 활성 · `Discard` 비활성(사유). `S4-H2` 구현 그대로 |
| **AC-4-134** | **정의 불변**. 증거에 경로 1개 추가: Start 에서 거부 → `conversation_only` → `permission-denied` 변형 (지금은 `conversation_only` fixture 로만 검증 — H2-2) |
| **`D4-45`** | 대화 전용 = 10분 방치 정리 없음. `D4-112` 로 **거부 사용자의 모든 세션**이 대화 전용이 된다 → 서버 sweeper 요구(기존 Handoff)의 비중이 커진다 — R4B-21 |
| **`D4-118`** | 불변 — 대화 전용 `Submit` 별도 Toast · Record 탭 → 시트 |
| **AC-4-69** | 회귀 대상 — ⓐ 의 "닫고 다시 시작" 이 새 id 를 만드는지 (기존 증거 경로 재사용) |

#### ⑥ PRD / Figma 대조

| 지점 | PRD | Figma | 처리 |
|---|---|---|---|
| 권한 필요 **이유 안내 화면** | §13 *"권한 필요 이유 안내 화면 → 설정 딥링크"* | 없음 (`26:21` 실측 · `FIGMA_SCREEN_MAP:127`) | **`N4B-25`** (⛔, C-13) — ⓐ **안내 화면 없이 OS 프롬프트 직행**(권고 — Figma 에 없는 것을 만들지 않는다, 최우선 규칙 2) ⓑ 프롬프트 전 설명 시트를 design-agent 명세로 ⓒ 디자이너 요청. ⓐ 채택 시 거부 **후** 안내 = 세션 시트(③). PRD 수정 대상 **18** 후보 |
| 설정 딥링크 | §13 | 없음 | Web 불가(기존 Spec §7.3) — 네이티브 `S4N-*`. 변경 없음 |
| "대화만 하기" **선택** | §13 *"대화만 하기로 세션 진행 허용"* | 없음 | `D4-112` 로 **자동 결정**(사용자 선택 버튼 없음) — PRD 문구와 **해석 차이** → PRD 수정 대상 **18** 에 병합 |
| Home·Activity·서재 화면 | — | `26:21` · `163:2648` · `145:1132`/`163:1669` | **시각 변경 0** — 기존 `Button loading` 만 (Figma 에 없는 상태 → design-agent 가 기존 Spec 의 loading 상태로 덮이는지 확인) |

#### ⑦ development-agent 구현 지시 (승인 후, 8줄)

1. `entities/session` 모드 결정 hook + `app/providers` 권한 포트 주입(②). feature 간 import 0 (`lint:boundaries`).
2. `ActivityCardDeck` 확인 탭 → 권한 → 선택 → 생성 / `StartSessionAction` 탭 → 권한 → 생성. `mode` 리터럴 `'recorded'` 2곳 제거.
3. 프로브 스트림 해제(`N4B-29` 채택 시) — 어댑터 `releasePrimed()` 류 1개 추가 또는 프로브 전용 경로. 녹음 경로의 `ensure()` 동작은 불변.
4. `N4B-26` 결과대로 시트 트리거 확장 · `N4B-28` 문구 초안(copy 모듈, 승인 대상 표기).
5. `N4B-27` 결과대로 `Talk without recording` 처리(ⓐ 면 copy 키·주석 정리).
6. Mock: §12 제안 key 3건(`mic-permission-blocked` · `mic-unavailable` · `mic-permission-revoked`) — Home 프로브와 세션 녹음이 **같은 `RecorderScenarioPlan`** 을 본다.
7. 테스트: §15 개정 1.4 · Playwright 단독.
8. design-agent Visual Gap(시트 · loading 상태).

#### ⑧ `API_CONTRACTS.md` delta 제안 (plan-agent 가 승인 후 반영 — 지금 고치지 않는다)

| # | 절 | 제안 |
|---|---|---|
| C-1 | §3.2 `CreateSessionRequest` | `mode` 행에 *"Frontend 가 생성 직전 마이크 권한으로 결정한다(`D4-112`). `conversation_only` 도 책 id 를 보낸다(refine 허용). 생성 후 모드 전환 계약은 없다"* 1문단 |
| C-2 | §5.4 Scenario Catalogue `recorder` 그룹 | 제안 key 3건 등재 + `mic-permission-denied` 설명 *"프롬프트 → 거부"* 로 정밀화 |
| C-3 | Handoff 메모 | `P4B-BIP-04`·`05` 등재 (아래 BIP) |

#### ⑨ `BACKEND_INTEGRATION_PENDING` 예상

| ID | 내용 | 대상 |
|---|---|---|
| **`P4B-BIP-04`** | 서버는 클라이언트가 보낸 `mode` 를 그대로 받아들인다(마이크 권한은 서버가 검증할 수 없다) · `conversation_only` 세션에 업로드 시도 시 `RECORDING_NOT_ALLOWED_FOR_MODE` (기존 code) | `BACKEND_HANDOFF` · `API_CONTRACTS` §3.2 |
| **`P4B-BIP-05`** | `conversation_only` 세션의 `bubble`·`completionBubble`(`subtext` 포함) 생성 문구가 **녹음·녹음 시간을 언급하지 않는다** (예: Figma 문자열 `14 min together` 는 녹음 기반 수치일 수 있음) · 책 연결 시 같은 책 Prompt 제공 | `BACKEND_HANDOFF` · `ANALYSIS_PIPELINE_REQUIREMENTS`(검수 템플릿) |
| 기존 | 서버 측 동의 강제(`CONSENT_REQUIRED`) · 대화 전용 방치 sweeper(`D4-45`) | 변동 없음 |

### 13.4 ⭐ `S4-H3` — 업로드 / 48h / 7일·14일 안내 (개정 1.4, `D4-114`)

**근거**: `D4-114` · H2-D6 (*Plan §13 `S4-H2` 범위 칸에 있었으나 AC 칸에 없음*) · 상위 Plan §16.5.3 머리말 (AC-4-30·32·67 = 4a/4b 걸침, 화면 부분은 4b) · `docs/qa/stage-4a-handoff.md` E-4 "남은 부분" — 32 *"안내 화면 1회 (`S4-H2`)"* · 67 *"안내 화면 (`S4-H2`)"* · 30 *"재시도 안내 화면 (`S4-F`)"* · `D4-29`(14일 상한 · 7일 안내) · 상위 Plan R4-11 *"7일 안내의 화면이 빠지면 사용자가 모르고 잃는다 — 4b 에서 느슨하게 두지 않는다"*.

#### ① 지금 문서에 있는 것 · 없는 것

| 항목 | 문서 상태 | 문제 |
|---|---|---|
| 업로드 진행 `UploadStatusBadge` | 상위 Spec §4-3 · §7.2 — **완료 화면 y468~521 슬롯** (Figma 없음, #22 명세) | ⚠️ **AC-4-61 과 충돌** — *"y 468 아래 렌더 요소 목록(배경 외 0건)"* `[직독: stage-4-plan.md:946]` · AC-4-139 ③ 회귀 단정 |
| 업로드 실패 | 상위 Spec §7.2 `InlineAlert error` + `Try again` | 완료 화면에 사용자가 **없을 때** 발생 (Submit 은 업로드를 기다리지 않는다 — 4a E-6 ②) |
| 48h | 상위 Spec §7 ⑤ — "완료 화면 업로드 슬롯" | 48h 뒤 사용자는 완료 화면에 없다 (크래시 복구 H2-D4 와 같은 구조 → `D4-117` 은 앱 시작 Toast 를 골랐다) |
| **7일 안내 · 14일 삭제** | `D4-29` · 4a 신호(`retention_notice` 1회 · `retention_expired`) | **Spec 0 · AC 0** — 4b Spec §7.1 은 *"14일 = 상위 §7.2 그대로"* 라 적었으나 상위 §7.2 에 14일이 없다 |
| `RECORDING_INCOMPLETE` 화면 | AC-4-30 *"화면이 재시도를 안내한다"* | 큐가 HEAD offset 확인 후 **자동 재시도**한다(4a 증거) — 사용자 행동이 필요 없는 상태 |

#### ② 범위 (`S4-H3` 에서 하는 부분 / 하지 않는 부분)

| 한다 | 하지 않는다 |
|---|---|
| 큐·저장소 신호를 화면에 내보내는 **구독 경계**(`S4-H2` `onNotice` 와 같은 조립 지점 패턴) · 48h 안내 + `Try again`(즉시 재시도 1회) · 7일 보관 안내 · 14일 삭제 통지 · 안내 "1회" 의 재시작 지속 · AC-4-30·32·67 화면 부분 | 서버 통지 · push 알림(`N4B-34`) · 세션 목록·데이터 관리 화면(Stage 7/8) · 업로드 진행 배지(`N4B-30` ⓑ 채택 시에만 In Scope) · 네이티브 로컬 알림(`S4N-*`) |

#### ③ 결정 (⛔ 3 · 비차단 2 — §17.6)

- **`N4B-30` 업로드 진행 표시** — ⓐ **만들지 않는다**(권고: Figma 없음 · AC-4-61 유지 · 성공 시 사용자에게 알릴 행동 없음 · `Recording submitted` Toast 가 이미 있다) ⓑ 53px 간격에 `UploadStatusBadge`(AC-4-61 수정 + 허용 차이 신규) ⓒ 업로드 성공 Toast 만.
- **`N4B-31` 48h · 7일 · 14일 안내 수단** — ⓐ 앱 수준 `Toast`(action 지원 `[직독: ToastProvider.tsx:24]`) 1회 — `D4-117` 선례, 레이아웃 이동 0 ⓑ Home `InlineAlert` (`26:21` 에 없는 UI · `AD-S4-11` 오프라인 캐시 배너 선례 · 허용 차이 신규 → **`AD-S4-25`** 등록, `D4-130`) ⓒ **심각도별 혼합(권고)**: 48h = Toast + `Try again`(재시도는 큐가 계속하므로 놓쳐도 유실 아님) · **7일 = Home `InlineAlert warning` + `Try again`, 닫을 때까지 유지**(놓치면 14일에 **유실** — R4-11) · 14일 = Toast 1회(이미 일어난 사건 통지). Stage 1 §5.5 *"실패는 Toast 로만 알리지 않는다"* 를 유실 위험 지점에만 적용.
- **`N4B-32` AC-4-30 화면 부분** — ⓐ **자동 재시도 중에는 화면 안내 0, 계속 실패하면 48h 경로로 합류**(권고: 사용자 행동이 필요 없는 상태를 알리지 않는다 · AC-4-30 화면 부분을 재정의) ⓑ `RECORDING_INCOMPLETE` 즉시 Toast.
- `N4B-33` (비차단) "1회" = **녹음 항목당 1회, 앱 재시작 후에도 재표시 0** — 표시 여부를 로컬 레코드에 기록 (권고). 4a 증거는 **같은 프로세스 안** 1회만 보증한다(*"이후 5시간 재시도에도 1회"*).
- `N4B-34` (비차단) PRD §13 *"48시간 경과 시 재시도 안내 **알림**"* — ⓐ 앱 내 안내로 충족, push·로컬 알림은 Backend/네이티브 후속(권고) ⓑ push 를 Handoff 필수 요구로.

#### ④ 의존

`S4-H2F` handoff(앱 시작 Toast · 구독 경계 재사용) · `N4B-30`~`32` 승인 · design-agent 명세(C-13 — Home 배치 · 오프라인 캐시 배너(`AD-S4-11`)와 동시 표시 우선순위 · 320 폭 · 문구 초안) · 4a 큐 신호 확인: `RECORDING_INCOMPLETE` 지속 실패가 **별도 신호를 내는지** 미확인 — development-agent 가 착수 시 `[직독]` 으로 확인하고 없으면 보고(신호 추가는 `features/recording` 내부, contract 0).

#### ⑤ Mock 시나리오

기존: `recordings:upload-stalled-48h`(48h 경계 = 주입 clock) · `recordings:recording-incomplete` · `recordings:offline-queued` · `recordings:recording-upload-success`(안내 0 확인) · `recorder:local-retention-exceeded`(14일). 신규 제안: **`recorder:local-retention-notice`**(7일, §12). 경계 양쪽(48h −1ms / 48h · 7일 −1분 / 7일) 은 unit 주입 clock.

#### ⑥ `BACKEND_INTEGRATION_PENDING` 예상

| ID | 내용 | 대상 |
|---|---|---|
| 기존 RU-16 | 14일 로컬 삭제로 녹음이 오지 않는 `completed` 세션 — 서버 정리 | `ANALYSIS_PIPELINE_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| 기존 | 실제 Storage 업로드 · 서버 확정 · 48h 이후 서버 측 상태 | `RECORDING_UPLOAD_SPEC` |
| **`P4B-BIP-06`** (`N4B-34` ⓑ 채택 시에만) | 업로드 미도착 세션에 대한 push 알림 발송 | `BACKEND_HANDOFF` |

신규 contract·endpoint 0 → 그 외 PENDING 신규 0.

### 13.5 ⭐ `S4-H4` — 4b QA 1회차 후속 (개정 1.6, `D4-140` ~ `D4-144`)

**근거**: `docs/qa/stage-4b-qa-report.md` 1회차 `FAIL` — `QA-4B-001`·`002`(Medium) · `004`(Low) · `003`(PARTIAL) · `OBS-4B-3`·`7` · 결정 `D4-140`(계획 공백 → `S4-H4`) · `D4-141`(스크롤바 이번에 수정) · `D4-142`(간헐 e2e 원인 조사 후 수정) · `D4-143`(실기기 4건 사용자 수동) · `D4-144`(측정판 보강, Orchestrator 판단).

**계획 공백의 원인 (재발 방지)**: 상위 Plan 4a 특례 표(`stage-4-plan.md` 1553행 부근)가 AC-4-35·36 을 *"화면 부분은 `S4-F`·`S4-H2`(4b)"* 로 넘겼고 4a 인계(`stage-4a-handoff.md` 315·316행)도 *"복귀 경로 e2e (`S4-F`)"* 로 적었으나, 이 Plan §13 단위표 AC 칸에 **30·32·67 만 옮기고 35·36 은 옮기지 않았다**(개정 1.4 `S4-H3` 에서 걸침 AC 를 다룰 때도 누락). → 이번 개정에서 상위 Plan 걸침 목록(22 · 24 · 25 · 30 · 31 · 32 · 35 · 36 · 62 · 67) 전체를 4b 단위표와 대조했다: **35 · 36 외 공백 0** — 22 · 24 · 25 · 30 · 31 · 32 · 62 · 67 화면 부분은 단위표 미배정이었어도 4b QA 1회차가 **PASS 판정**을 남겼다 `[직독: stage-4b-qa-report.md:201-207]`. 단위표 배정 여부와 별개로 4b QA 2회차가 재확인한다.

#### ① 범위 — 한다 / 하지 않는다

| # | 한다 | 하지 않는다 |
|---|---|---|
| ① AC-4-35 | `POST /v1/sessions` → `SESSION_ALREADY_ACTIVE{details.sessionId}` 처리 — Activity Card 시트 · 서재 `Start Session` **두 경로** · `N4B-35` 결정대로 상태별 분기 | 세션 화면이 `recording`·`paused` 세션을 이어받아 녹음 재개(`N4B-35` ⓒ — 4a 녹음 코어·`D4-113` 변경) · Home 이어하기 링크(Stage 3 `V-15` 로 제거됨) |
| ② AC-4-36 | 세션 endpoint `ONBOARDING_INCOMPLETE` → `me` 재조회 → **기존 Route Guard** 가 온보딩으로 이동 (`N4B-36`) · Mock 연동 | Route Guard 규칙 변경 · 온보딩 화면 변경 |
| ③ AC-4-99 | `AppShell` 뷰포트 스크롤 박스의 클래식 스크롤바 가로 넘침 **원인 수정**(`N4B-37`) + 클래식 스크롤바 회귀 테스트 상설화 | 스크롤바 숨김(접근성 — 데스크톱 스크롤 위치 표시가 사라진다) |
| ④ AC-4-103 | `QA-4B-003` 원인 판별(②) → 제품 결함이면 제품 수정, 환경 요인이면 테스트 대기 방식 안정화 | 실패 테스트 `skip`·`fixme`·재시도 횟수만 올리기 · 임계값 완화 |
| ⑤ 측정판 | `/__dev/ui/recording-measure` 에 AC-4-50 두 끝점 · AC-4-146 트랙 상태 항목 추가 (`D4-144`) | 실기기 측정 자체(사용자, `D4-143`) · Production 포함 |

#### ② AC-4-35 복귀 — 정의된 것과 없는 것

| 출처 | 정의 |
|---|---|
| 상위 Plan AC-4-35 (`stage-4-plan.md:910`) | *"`SESSION_ALREADY_ACTIVE` 를 반환하고 **진행 중 세션으로 복귀**하는 경로가 있다"* — **복귀의 화면 동작은 정의 없음** |
| `API_CONTRACTS.md:82` | `SESSION_ALREADY_ACTIVE` 409 · 진행 중 = `ready`/`recording`/`paused` · `details.sessionId` |
| 문구 `shared/copy/error-copy.ts:76` | `A storytime is already open` / *"Continue the open storytime, or finish it before starting a new one."* — Stage 1 공통 error copy |
| Stage 3 `V-15` (`stage-3-approvals.md:833`) | Home 의 이어하기 안내(`ActiveSessionNotice`)는 **제거** — 버블 `characterLine` 이 말한다. 링크 없음 |
| 세션 화면 (`StorytimeSessionScreen.tsx:231`) | Detail `status !== 'ready'` → **홈으로 replace** (`D4-91`·`D4-113` 과 같은 방향) |
| 4a Mock (`stage-4a-handoff.md:267`) | `sessions:session-already-active` → 활성 세션 = **`recording`** 1종만 |
| Figma · 상위/4b Design Spec | **없음** (grep `already` = Stage 3 Spec 의 제거된 Notice 뿐) |

→ **`recording`·`paused` 세션은 이 탭에서 "복귀"할 화면이 없다.** 그 녹음은 시작한 탭·기기의 `RecorderAdapter`·로컬 저장소에 있고, 같은 기기라면 앱 시작 시 크래시 복구(`D4-117`)가 `completed(recovered_after_crash)` 를 Outbox 에 올린다. 지금 Mock 이 내는 활성 세션은 바로 이 경우다. 반면 **`ready` 세션**(10분 안의 녹음 세션 · 방치 정리가 없는 대화 전용 세션 `D4-45`)은 기존 ready 화면이 그대로 복귀 지점이 된다. → 화면 동작은 **`N4B-35` (⛔, C-13)**.

**⭐ 확정 (개정 1.7, `D4-146` — Spec §21 · §21.6 권고안 승인, 2026-11-07 user)**: ⓐ `ready` 복귀 = 일반 시작과 **같은 history push** ⓑ 서재 경로 `recording`/`paused` 안내 = **Toast 한 문자열**(기존 제목·설명을 이어 붙임 — 320 3줄) ⓒ 320×568 Reading Context 시트 = 안내(기존 일반 실패 문구 포함)가 **뜨는 순간 보이도록 1회 스크롤** ⓓ Detail 조회 실패 = **기존 일반 시작 실패 문구 재사용**(신규 문구 0) ⓔ 320 클래식 스크롤바 컬럼 305 = 허용 차이 **`AD-S4-27`**. AC 문언 = §14.1 AC-4-35 화면 부분 · AC-4-99 ③.

#### ③ `QA-4B-003` 조사 방향 — 제품 vs 테스트 환경 판별 기준

이미 확인된 사실: `ToastProvider` 퇴장과 `usePresence`(`packages/ui/src/hooks/usePresence.ts:35`)는 **`setTimeout` 기반** — `animationend`·`transitionend` 에 의존하지 않는다. QA P12 v1 에서 실패 순간 페이지의 `setInterval(250ms)` 심장박동도 **함께 멈췄다**(20/40), rAF 를 함께 돌린 v2·v3 는 35/35 통과.

| 단계 | 방법 | 판별 |
|---|---|---|
| 1 | QA 프로브 P12 를 `--repeat-each` 로 재현 · 실패 시점 기록: 심장박동 간격 · `document.visibilityState` · `document.hasFocus()` · 마지막 rAF 시각 · Toast 상태(`closing` 진입 시각 · 언마운트 여부) | 심장박동이 멈춘 **동안** Toast 도 멈췄다 → 타이머 정지가 공통 원인 |
| 2 | 같은 프로브를 **Chromium 의 타이머·렌더러 백그라운드 억제 해제 인자**로 실행 (어느 인자가 Playwright 기본에 이미 들어 있는지는 **Playwright·Chromium 문서/소스로 확인 후** 적는다 — 추측 금지) | 억제 해제 상태에서 **재현 0 (≥ 50회)** → **테스트 환경 요인**. 재현 지속 → 제품 측 의심으로 3단계 |
| 3 | 타이머가 도는 것이 확인된 상태(심장박동 정상)에서 Toast 가 `closing` 뒤 언마운트되지 않으면 | **제품 결함** — `ToastProvider` timer effect 의 정리·재설정 경쟁, `RecordingNoticeToasts`·`useStickerEntrance` 의 Toast 퇴장 직후 setState 를 `[직독]` 으로 추적 |
| 4 | 실기기·일반 창(Safari · Chrome, headful) 1회 — `D4-143` 수동 확인 목록에 추가 | 같은 증상 0 이면 3단계 결론 보강 |

조치 원칙: **환경 요인** → 실시계 대기(8~10초)를 **주입 clock 또는 상태 기반 대기**(Toast `data-state` · 언마운트 대기)로 바꾸거나 프로젝트 launch 인자로 억제 해제 — **둘 중 무엇이든 근거 주석과 함께**. 재시도 횟수 증가·`skip`·임계값 완화는 해결로 보지 않는다. **제품 결함** → 제품 수정 + 회귀 unit test. 어느 쪽이든 판별 증거(1~3단계 로그)를 인계에 남긴다(AC-4-156).

#### ④ 클래식 스크롤바 (`QA-4B-004`)

QA 실측: 320×568 · 클래식 스크롤바 15px → 스크롤 박스 `clientWidth 305 · scrollWidth 320` = 가로 넘침 15. 1024×500 은 넘침 0, 컬럼 중심 504.5(창 중심 대비 −7.5). 원인 후보 = 스크롤 박스 안 어떤 요소가 **스크롤바를 뺀 폭이 아닌 뷰포트 폭**(`vw` 계열·고정 320)에 묶여 있음 — development-agent 가 **computed 로 확인**한다(`R-FIGMA-1` ④: Tailwind 유틸리티로 켜진 overflow 는 CSS grep 으로 안 보인다). 수정 방식 = `N4B-37`. `AppShell` 공용이므로 **Stage 1~3 탭 화면도 같은 프로브**로 회귀(QA 가 측정 안 했다고 적은 범위). `R-SHADOW-1` ⑥ — 스크롤 박스 변경 시 그림자 세로·가로 프로브 재실행.

#### ⑤ dev 측정판 보강 (`D4-144`)

대상: `apps/web/src/dev/recording-measure/` (`RecordingMeasurePage.tsx` · `measure-core.ts`, route `/__dev/ui/recording-measure`). 현재는 AC-4-108(백그라운드 청크 간격)만 잰다.

| 항목 | 표시 | 경로 원칙 |
|---|---|---|
| **A. 시작 지연 (AC-4-50, `NV-4B-1`)** | 회차마다 **탭 시각**(입력 이벤트 `timeStamp`) → ⓐ `MediaRecorder` `start` 이벤트 · ⓑ 첫 `dataavailable` **두 끝점 모두** ms 표시 · **5회 기록 표** + 끝점별 **중위값** · 브라우저·`mimeType`·timeslice(1000, `D4-28`) 함께 표시 | **제품 경로**(`WebRecorderAdapter`)로 잰다. 어댑터가 `start` 이벤트 시각을 내지 않으면 **관찰 전용 선택 콜백** 1개만 추가(동작 변경 0, unit test) — 추가 시 인계에 보고. 별도 `MediaRecorder` 로 재는 것은 제품 경로가 아니므로 금지 |
| **B. 판정 스트림 해제 (AC-4-146, `NV-4B-3`)** | 실제 **`resolveSessionMode`**(`app/providers/sessionRecorderEnvironment.ts:268`) 를 호출 → 그 과정에서 열린 트랙 수 · 반환 직후 · +1s 시점 각 트랙 `readyState` · 판정 결과(`recorded`/`conversation_only`) · 사용자가 OS 마이크 표시등을 눈으로 확인하라는 안내 1줄 | 측정판 안에서만 `navigator.mediaDevices.getUserMedia` 를 **감싸 반환 트랙을 기록**하고 언마운트 시 원복 — 제품 코드 변경 0. 감싸기는 측정판 버튼을 누른 동안에만 |
| 공통 | 🔒 `console` 0 · PII 0 · 세션 id 는 측정판 임의 uuid · 측정 후 로컬 정리 버튼(기존 ⑤ 재사용) | **Production 제외 유지** — `assert:no-mocks` 통과 · dev route 가드 기존 방식 그대로 |

AC-4-50 의 **판정 끝점**은 `N4B-39`(§19.4) — 측정판은 결정과 무관하게 두 끝점을 다 보여 주므로 측정판 구현은 `N4B-39` 를 기다리지 않는다.

#### ⑥ 의존

4b QA 1회차 리포트 · `N4B-35`(⛔ — ① 착수 차단) · `N4B-39`(⛔ — AC-4-50 판정만, 측정판 구현은 아님) · design-agent: `N4B-35` 에서 Figma 에 없는 UI 가 생기면(ⓑ 버튼 등) 명세 · 문구 초안 위치(시트 오류 영역 재사용 여부) 확인 · `N4B-37` 수정 후 Visual Gap(320/393/600/1024 × 오버레이·클래식 스크롤바). 실행 순서(Playwright 단독): ④ 조사 → ③ → ② → ① → ⑤ → 전체 2회.

#### ⑦ Mock 시나리오

| key | 상태 | 쓰임 |
|---|---|---|
| `sessions:session-already-active` | 기존 — 활성 = `recording` (`details.sessionId` 로 Detail 조회 가능) | AC-4-35 `recording` 분기 |
| **`sessions:session-already-active-ready`** | **신규 제안** — 활성 = `ready`(`recorded`) | AC-4-35 `ready` 분기 (`N4B-35` ⓐ 채택 시) |
| **`sessions:session-already-active-paused`** | **신규 제안** — 활성 = `paused` | `paused` 가 `recording` 과 같은 분기임을 확인 |
| `sessions:onboarding-incomplete` | 기존 — 세션 4 메서드 → `ONBOARDING_INCOMPLETE`. **개정 제안**: 409 를 낸 뒤 같은 Mock 세계의 `me` 가 `onboardingStatus='in_progress'` 를 반환(결정적 · 서버 상태와 일관) | AC-4-36 |
| `me:onboarding-incomplete` | 기존 — Stage 2 Guard 회귀 | 회귀 |

Contract·error code·endpoint 변경 **0**. 신규 key 는 `CP-15` 승인 후 plan-agent 가 `API_CONTRACTS.md` §5.4 에 **제안 key** 로 등재하고, 구현 확정 표기는 development-agent 가 한다(Rev 8.11 선례).

#### ⑧ `BACKEND_INTEGRATION_PENDING` 예상

| ID | 내용 | 대상 |
|---|---|---|
| 기존 AC-4-35·36 서버 부분 | `SESSION_ALREADY_ACTIVE` · `ONBOARDING_INCOMPLETE` 서버 판정 (`P4-BIP` 기존) | `BACKEND_HANDOFF` · `ERROR_CODES` |
| **`P4B-BIP-07`** (`N4B-35` ⓐ 채택 시) | 탭·기기가 사라져 끝나지 않은 `recording`·`paused` 세션이 **새 세션 생성을 무기한 막지 않도록** 서버 정리 규칙(예: 30분 상한 `P4-BIP-03` + 유예 후 `completed`/`abandoned`) — 규칙 자체는 Backend 결정, 업로드 지연(48h · 14일 `D4-29`)과 충돌하지 않을 것 | `BACKEND_HANDOFF` · `RECORDING_UPLOAD_SPEC` |
| **`P4B-BIP-08`** | 세션 endpoint 가 `ONBOARDING_INCOMPLETE` 를 낸 시점에 `GET /v1/me` 의 `onboardingStatus` 도 `completed` 가 아니어야 한다(두 응답의 일관성 — Frontend 는 `me` 로 이동 지점을 정한다) | `BACKEND_HANDOFF` · `AUTH_REQUIREMENTS` |

## 14. Acceptance Criteria 변경 (번호 체계 유지 — 상위 Plan §11 기준 delta)

### 14.1 수정 (14건 — 개정 1.1 AC-4-46 · 개정 1.2 AC-4-58 · 개정 1.6 AC-4-103 추가 · AC-4-99 ③ 보강 · 걸침 AC-4-35·36 화면 부분 정의는 집계 외)

| AC | 수정 내용 | 근거 |
|---|---|---|
| **AC-4-42** | Resume 수단 = **Record Control `paused` 변형(`Tap to resume`) 탭**. paused → recording 전이 1건. `Resume` 버튼 0건 | `D4-51` |
| **AC-4-52** | *"recording·paused 동안 **자동으로 나타나는** 캐릭터 버블 0건"* 으로 한정. Prompts 팝업은 ① 사용자 탭으로만 열리고 ② tail 이 없고 ③ 상태 전이·타이머로 자동으로 열리지 않는다 (렌더 로그 증거). 판정 단위 `S4-F2` → **`S4-G1`** 로 이동 | X-09 · ⏳ `N4B-10` (`CP-3` 승인 조건부 — 미승인 시 원문 유지 = 팝업이 FAIL 사유가 된다) |
| **AC-4-53** | 재확인 경로 = **Prompts 칩 → 팝업(앞 5개) → `See all prompts` → Drawer(전부)**. **세 지점(ready 버블 · 팝업 · Drawer)이 같은 `SessionSummary.prompts` 출처**를 서버 순서대로 쓴다 — 같은 fixture → 텍스트 일치, 하드코딩 0. recording·paused 양쪽에서 동작 | `D4-52` · `D4-53` |
| **AC-4-55** | 대상 = **팝업과 Drawer 둘 다** — 오디오 재생 · `navigator.vibrate` 0건 | `D4-52` |
| **AC-4-56** | **Drawer 전용으로 한정** (원문 유지: 키보드 열기·이동·닫기 · 초기 포커스 · **포커스 트랩** · 복귀) + **복귀 대상 = Prompts 칩**(팝업은 이미 닫혀 있다) · 열린 동안 녹음 계속. 팝업 기준은 **AC-4-135 로 분리** | `D4-52`·`D4-54` · **PM-3** |
| ~~**AC-4-63**~~ (개정 1 판) | ~~마이크 거부 시 Record Control = `permission-denied` 변형(`Mic is off`), 탭 → 안내(시트) + `Talk without recording`~~ → **개정 1.4 로 대체** (아래 행) | `D4-51` · `N4B-13` |
| ⭐ **AC-4-63** (개정 1.4) | **마이크 거부 → 대화만 하기** (PRD §13 P0, `D4-112`): ① Start Session(Activity Card · 서재 **두 경로**)에서 권한이 거부·차단이면 `POST /v1/sessions` body **`mode=conversation_only`** 이고 책 id(`activityCardOptionId`+`bookId` / `childBookId`)는 `recorded` 일 때와 **같다** ② 그 세션 화면 = Record Control `permission-denied` · `Submit` 활성(CP-6) · `Submit` → `ready → completed` 1건 → 완료 화면 ③ 녹음·업로드 요청 0 ④ 거부 이유·설정 안내 = 마이크 시트(Web 은 딥링크 없이 안내 문단 — 4b Spec §7.3, 네이티브 딥링크 = `S4N-*`) ⑤ ready 중 모드 전환 요청 0 (계약 없음 — `D4-112`). 원문의 "대화만 하기 **버튼**" → **생성 시 자동 결정**으로 대체(`N4B-27`). 증거: 요청 body(경로 2) + 요청 로그 + DOM. 판정 단위 **`S4-H2R`** | **`D4-112`** · `N4B-24`~`27` · ✅ PENDING `P4B-BIP-04` |
| **AC-4-95** | 허용 차이 목록: **`AD-S4-7` 유지**(Drawer 존속) + 신규 `AD-S4-12`~`18` 중 **사용자가 등록한 것만** 반영. 등록되지 않은 어긋남은 Figma 대로 구현됐는지 판정 | **PM-15** · `N4B-11` |
| **AC-4-97** | 터치 타깃 ≥ 44: 기존 대상(Record Control · `Discard` · `Submit` · **Drawer 좌우 화살표 — 유지**) + **Prompts 칩(117×36 → 세로 hit 44)** · **닫기(38 → 44)** · **`See all prompts`(17 높이 → `::before` hit 44, 팝업 안)** 추가. Drawer 트리거 = `See all` 로 대체 | **PM-4** · Spec §3.3·§4 #5 |
| **AC-4-99** | ① 팝업이 **320 컬럼에서 잘리지 않는다**(`min(329px, 100%)`, pill 240) ② **짧은 세로(< 796)** 에서 `S4B-Q5` 결정 규칙대로 압축되고 팝업이 Record Control 을 덮지 않는다 ③ ⭐ (개정 1.6, `D4-141`) **클래식(항상 보이는) 스크롤바 환경**에서도 320×568 · 393×600 · 1024×500 세션 ready·recording·완료 화면 스크롤 박스 `scrollWidth ≤ clientWidth`(가로 넘침 0) · 컬럼 가운데 정렬은 **스크롤 박스 `clientWidth` 기준**으로 판정(`N4B-37` ⓐ — 창 기준 판정은 ⓑ 채택 시) · ⭐ (개정 1.7, `D4-146`) 320 + 클래식 스크롤바에서 컬럼 **305**(내용 257)로 좁아지는 것은 **허용 차이 `AD-S4-27`** (오버레이 스크롤바 기기 변화 0) · 같은 프로브를 Stage 1~3 탭 화면(Home · Library · 온보딩 1화면)에 회귀 · 증거 = 상설 Playwright 클래식 스크롤바 설정(`--hide-scrollbars` 제외)의 양축 프로브. 판정 단위 **`S4-H4`** ④ (개정 2026-11-11, `D5-15`) **세로**: 320 / 393 / 600 / 1024 × 852 에서 40자 이하 `firstName` 에 세로 넘침 없음 (852 미만 높이는 스크롤 허용) — 원문: 세로 기준 문언 없음, 테스트 주석 "796 이상 높이는 스크롤 없음" 이 대신하고 있었다. 근거: `docs/design/stage-5-design-spec.md` §13 — 그 주석은 320 폭에서 이미 거짓이었다 | Spec §8 · `CP-7` · `QA-4B-004` · `D4-141` |
| ⭐ **AC-4-103** (개정 1.6) | `pnpm test:e2e` 전체 통과 — **단독 실행 2회 연속 전부 통과**(원문 "전체 통과" 를 1회 통과로 읽지 않는다, `QA-4B-003`) · baseline 재생성이 있었다면 diff 클러스터마다 원인 규명(원문 유지) · `test.fail`·`skip`·`fixme`·`.only` 신규 0 · 재시도(`retries`) 설정 증가 0 | `QA-4B-003` · `D4-142` |
| ⭐ **AC-4-35 화면 부분** (걸침, 개정 1.6) | `SESSION_ALREADY_ACTIVE` 응답 시 (Activity Card 시트 · 서재 **두 경로**): ① 일반 시작 실패 문구(`We couldn't start…`) 0 ② `details.sessionId` Detail 조회 1건 ③ 상태별 동작 = **`N4B-35` 결정**(권고 ⓐ: `ready` → `/session/:id` 이동 — ⭐ (개정 1.7, `D4-146`) **일반 시작과 같은 history push**(`replace` 아님), 새 세션 생성 요청 0 · `recording`/`paused` → `SESSION_ALREADY_ACTIVE` 안내, 이동 0, 녹음·로컬 저장소 변화 0 — Activity Card 시트 = 시트 안 Alert(기존 제목·설명) · ⭐ 서재 = **Toast 한 문자열**(기존 제목·설명을 이어 붙임, 320 3줄 · 393 2줄, 단어 변경 0) · ⭐ **320×568 Reading Context 시트는 안내가 뜨는 순간 그 Alert 가 보이도록 1회 스크롤**(기존 일반 시작 실패 문구에도 적용, 사용자 스크롤을 따라가지 않음)) ④ Detail 조회 실패 → ⭐ (개정 1.7, `D4-146`) **기존 일반 시작 실패 문구 재사용**(`startFailed` — 신규 문구 0, 이동 0) ⑤ 재탭 → 같은 결과, 이중 요청 0 · 증거 = e2e 3 key(`-already-active` · `-ready` · `-paused`) × 경로 2 + 요청 로그 + 320×568 시트 Alert 가시 기하. 판정 단위 **`S4-H4`**. ⚠️ 원문 *"진행 중 세션으로 복귀"* 를 **`ready` 에 한정**하는 재정의는 `N4B-35` ⓐ 승인이 있어야 성립한다 | `QA-4B-001` · `D4-140` · ✅ PENDING `P4B-BIP-07` |
| ⭐ **AC-4-36 화면 부분** (걸침, 개정 1.6) | 세션 endpoint `ONBOARDING_INCOMPLETE` 응답 시: ① `me` 무효화·재조회 1건 → 기존 Route Guard 가 온보딩 구간(`resolveGuardDecision.ts` 5단계 — 저장된 지점 또는 입구)으로 이동 ② 일반 시작 실패 문구 0 ③ 재조회한 `me` 가 여전히 `completed` 면 시트 안 기존 `ONBOARDING_INCOMPLETE` 문구 · 이동 0 · 재조회 반복 0(루프 방지) ④ 두 경로(Activity · 서재) 동일 · 증거 = e2e(`sessions:onboarding-incomplete` 개정 Mock) + 불일치 분기 unit + 요청 로그. 판정 단위 **`S4-H4`** | `QA-4B-002` · `D4-140` · `N4B-36` · ✅ PENDING `P4B-BIP-08` |
| **AC-4-120** | `D4-22` 리터럴 금지 grep(③) 범위 = **ready 버블 제목 줄**. 팝업 제목 copy 키 1건은 위반이 아니다 | **`D4-55`** |
| **AC-4-121** | 동(⑥) — 범위 = ready 버블 제목 줄. ready 버블에 `Try this prompt!` 가 **나타나지 않는다**는 단정은 유지 | **`D4-55`** |
| ⭐ **AC-4-46** (개정 1.1) | **화면 부분 확정**: 5분 리마인드(`D4-46`, 1회) = ready 버블 **제목 줄만** `SessionSummary.reminderBubble.text` 로 교체, pill 불변, 1줄 clamp(`D4-21` 동일 상한). **`reminderBubble` 이 null/빈 문자열이면 시각 변화 0** (DOM 5분 전후 동일). Frontend 문구 상수 0. 증거: 주입 clock + 렌더 횟수 + `session-greeting:reminder-missing` + grep. 판정 단위 **`S4-F1R`**. PENDING: 문구 생성·검수(`P4-BIP-11` 확장) | **`D4-59`** · `D4-46` |
| ⭐ **AC-4-58** (개정 1.2) | 완료 화면 주 문구 = 응답 값. 출처 **두 경로**: ① `Submit` 경로 = 전이 응답 `completionBubble.text` ② **재진입 = `SessionDetail.completionBubble.text`**. 두 경로가 같은 세션에서 **같은 문구**다. `null`/빈 문자열이면 버블 미렌더, fallback 0. 오프라인 제출(`result: null`)은 버블·스티커 없음이 수용 상태. ⚠️ 레이어 이름을 기대값으로 쓰지 않는다(원문 유지). 증거: 텍스트 비교(Mock 응답 ↔ DOM) + **빈 QueryClient 재마운트 테스트** — Mock 은 새로고침 시 인증이 사라져 새로고침 e2e 로는 재현되지 않는다(Visual Gap §2.4). PENDING: 서버 보존(`P4B-BIP-03`) | **`D4-88`** · FR-10 |

**존치 (변경 없음)**: **AC-4-54** (Drawer 코칭 노트 = `Prompt.coachingNote`) — `D4-52` 귀결 (`N4B-06` 해소, **PM-2**). 초판 §14.2 의 "폐기 후보" 표기는 **철회**한다.

### 14.2 폐기 — 없음

### 14.3 신규 (AC-4-125 ~ 156)

| ID | 요구사항 | 증거 | 단위 | PENDING? |
|---|---|---|---|---|
| **AC-4-125** | recording·paused 배치가 `298:1262`·`298:1340` 과 일치 — 상단 줄(y66) · 책 칩(y337) · 상태 블록(y400) · Record Control(y621) · 바(y789). 책 칩 **가운데**(80, `AD-S4-13` 등록 시) · ready → recording 전환에서 메달리온·Record Control·바 **재마운트 0** | Playwright 비교(선언값 대조, `R-FIGMA-1`) · 기하 측정 · 노드 identity | `S4-F2` | — |
| **AC-4-126** | **책 칩** = `book.title` 그대로 · `coverUrl` 있으면 표지 / 없으면 `T-5` · `book: null` 이면 **미렌더 + 자리 유지**(상태 블록 y 불변) · 1줄 말줄임 · 하드코딩 0 | fixture 3종 + grep + 기하 | `S4-F2` | ✅ 세 경로 `book` 채움 (`P4B-BIP-01`) |
| **AC-4-127** | **경과 시간** = `recordedSeconds` 기반 **`mm:ss`** · paused 동안 고정 · paused 색 = secondary · `tabular-nums` · `role="timer"` + `aria-live="off"` · 보조 줄 = 승인 시안 문구(`Up to 30:00` / `Tap the button to keep recording`, copy 모듈) | 주입 clock + DOM | `S4-F2` | — |
| **AC-4-128** | **상태 pill** 이 텍스트(`Recording`/`Paused`)와 dot 형태(채움/빈 원)로 구분 — reduced-motion 강제 시에도 차이 존재 | reduced-motion 스냅샷 2상태 | `S4-F2` | — |
| **AC-4-129** | **recording·paused 닫기** (`D4-56`): ① 탭 → `Discard` 와 **같은 `ConfirmDialog`**(문구 4건 동일) ② 확인 → `→ abandoned` 1건 → 서버 확정 후 로컬 삭제 → `/` ③ 취소 → 요청 0 · 상태·녹음 유지 · 포커스 닫기 복귀 ④ 다이얼로그 열린 동안 녹음 계속 ⑤ 전이 요청 중 재탭 → 이중 요청 0 | 요청 로그 2시점 + 로컬 2시점 측정 | `S4-F2` | ✅ 서버 part `P4-BIP-21` |
| **AC-4-130** | **팝업·Drawer 열림·닫힘이 세션 상태를 바꾸지 않는다** — 전이 요청 0 · recording 이면 청크 수 증가 계속 · 타이머 계속 · 팝업 열린 채 recording ⇄ paused 전이 시 팝업 유지 | 요청 로그 + 청크 카운트 + clock | `S4-G1` (Drawer 부분은 `G2` 에서 재실행) | — |
| **AC-4-131** | **팝업 제목** = copy 모듈 고정 라벨 `Try this prompt!` 1곳(`D4-55`) · ready 버블 제목 줄(`bubble`)과 다른 출처 | grep(copy 1건) + DOM | `S4-G1` | — |
| **AC-4-132** | **팝업 높이·개수** — 팝업 pill = 서버 순서 **앞 5개**(n>5 이면 컷오프) · pill 높이 = **`S4B-Q2` 결정값**(권장 고정 38 → 높이 `73+44n`) · n = 1·5·7 × 320/393(852 높이)에서 Record Control **침범 0** · 852 높이에서 내부 스크롤 0 | 기하 측정 6케이스 | `S4-G1` | — |
| **AC-4-133** | **팝업 정리** — `Submit` · `Discard` 확인 · 닫기 확인 · 30분 자동 종료 · 화면 이탈 시 팝업 닫힘, 완료 화면·홈 잔존 0 · `prompts: []` 이면 칩 = `S4B-Q4` 결정대로(권장: 비활성 + 사유) | e2e 5경로 + 빈 목록 1 | `S4-G1` | — |
| **AC-4-134** | **Record Control 변형 연결** — `disabled` = 동의 없음 · 전이 요청 처리 중 / `permission-denied` = 마이크 거부 · 대화 전용 (`N4B-13`). `disabled` 탭 → 요청 0 · `permission-denied` 탭 → 안내. (개정 1.4: 정의 불변 — `S4-H2R` 후 증거에 *Start 거부 → `conversation_only` → `permission-denied`* 경로 1개 추가, `S4-H2R` QA 에서 회귀) | 상태별 DOM + 요청 로그 | `S4-H2` | — |
| **AC-4-135** 🆕 | **팝업 비모달 접근성** (`D4-54`, AC-4-56 에서 분리): ① 칩 `aria-expanded` + `aria-controls` ② 팝업 = `region` + `aria-labelledby`, **포커스 트랩·`aria-modal` 없음** ③ 열 때 포커스는 칩에 머물고 DOM 순서상 팝업이 칩 바로 다음 ④ `Escape` → 닫힘 + 포커스 칩 (열린 Dialog/Sheet 가 있으면 그쪽 우선) ⑤ 칩 재탭 → 닫힘 ⑥ 바깥 탭 → 닫히고 **탭한 대상의 동작이 그대로 일어난다**(예: `Pause` → 닫힘 + 일시정지 전이 1건) ⑦ 보이는 닫기 버튼·scrim 0 | 키보드 e2e + 포인터 e2e + 요청 로그 | `S4-G1` | — |
| **AC-4-136** 🆕 | **ready 닫기** (`D4-57`, `300:1309`, **PM-8**): ① 닫기 38×38 @(331,66) — `29:76` 동형 ② 탭 → **확인 다이얼로그 없이** `ready → abandoned` 1건 → `/` ③ 로컬 녹음 0 (녹음 전) ④ 요청 실패 시 화면 유지 + 오류 안내(이동 0) ⑤ ready 에 Prompts 칩·책 칩 0 | 요청 로그 + DOM + Playwright 비교 | `S4-F1` | — |
| **AC-4-137** 🆕 | **`See all prompts` → Drawer** (`D4-52`): ① 탭 → 팝업 닫힘 → Drawer 열림(순차, 같은 프레임) ② Drawer = **전체 n개**(n=7 → 7페이지) · 초기 페이지 = `N4B-18` 결정(권장 1번째) ③ Drawer 닫힘 → 포커스 Prompts 칩 ④ `See all` = `<button aria-haspopup="dialog">` · 팝업 안 터치 44 | e2e + n=7 fixture + 포커스 추적 | `S4-G2` | — |
| **AC-4-138** 🆕 | **RecordControl 5변형 시각·이름** — `idle`·`recording`·`paused`·`disabled`·`permission-denied` 가 `163:1590`·`298:1227`/`1236`/`1245` 선언과 일치(`disabled` = opacity .5 + **코어 그림자 0**, `permission-denied` = gray-2 링·코어 + `mic-off`) · 접근성 이름 = Spec §9.1 (`S4B-Q9` 문구) · 변형 선택 순수 함수 unit test | Playwright 비교 5변형 + unit | `S4-F2` | — |
| **AC-4-139** 🆕 | **완료 버블 보조 줄** (`D4-87`, Figma `88:929`): ① `subtext` 응답 값이 주 문구 아래 그대로 표시 ② `null`/빈 문자열/key 없음 → **줄 미렌더**, 빈 줄·대체 문구 0, 본체 bottom 406 ③ 값 있음 → 본체 bottom **431**(Visual Gap 측정 기준) · y 468 아래 요소 0(AC-4-104 회귀) ④ Frontend 조립 0 — `recordedSeconds` 참조 0 · 문구 상수 0 (`mocks/` 밖 grep) ⑤ ready·리마인드 버블에 `subtext` 미표시 ⑥ `streak`·`Day N` 0 (AC-4-59 grep 범위에 포함) ⑦ (개정 1.3, `D4-95`) `text` 가 null/빈 문자열이고 `subtext` 만 있으면 **버블 미렌더** ⑧ (개정 1.3, `D4-98`) 13/19 · 줄바꿈, clamp·말줄임 0 — 긴 문구가 320 에서 2줄(본체 bottom Web 394.63) · 가로 넘침 0 | fixture 3종(`session-completion`) + 단위 테스트(⑦) + 기하 + grep + Playwright 비교 | `S4-H1` (`S4-H1R`) | ✅ 문구 생성 (`P4B-BIP-02`) |
| **AC-4-140** 🆕 | **`/complete` 직접 진입** (`D4-91`): ① Detail `status` = `ready`·`abandoned` → 홈 `replace`, 완료 화면 렌더 0, 전이 요청 0 ② 뒤로가기로 `/complete` 복귀 안 함 ③ 완료 계열 4상태는 완료 화면 유지 ④ 전이 응답이 기억된 경로(오프라인 `result: null` 포함)는 판정 대상 아님 — `Submit` 직후 튕김 0 ⑤ `recording`·`paused` 는 **`S4-H2` 에서 판정** — 그 전까지 현행(완료 화면) 유지가 FAIL 사유가 아니다. **(개정 1.4) ⑤ 기준 확정 = `D4-113`**: Detail `recording`·`paused` → 홈 `replace`(완료 화면 렌더 0 · 전이 요청 0) — 구현 `S4-H2F`(진행 중) | Mock 상태별 진입 + 요청 로그 + history 길이 | `S4-H1` (`S4-H1R`), ⑤ 는 `S4-H2F` | — |
| **AC-4-141** 🆕 | **완료 화면 닫기** (`D4-86`, Spec §12.4-⑫ 해소): ① 탭 → 홈 `replace` ② 뒤로가기로 완료 화면 복귀 안 함 ③ 세션 전이 요청 0 | e2e + 요청 로그 + history 길이 | `S4-H1` (`S4-H1R`) | — |
| **AC-4-142** 🆕 | **완료 화면 Toast inset** (`D4-89`, `VG-H1-02`): ① Toast 가 `topBar` inset 아래에 뜬다 — 제목·닫기와 겹침 0, 닫기 중심 `elementFromPoint` = 닫기 ② 재측정 수치를 인계에 기록(스티커와의 겹침·C-3 pop-in) ③ 재측정에서 나온 겹침은 사용자 판단 전 허용 차이로 처리하지 않는다 | 기하 측정 + `elementFromPoint` + design-agent 재측정 | `S4-H1` (`S4-H1R`) | — |
| **AC-4-143** 🆕 | **스티커 제목** (`D4-90`, `VG-H1-01`, `29:84`): ① computed font-size 14 · Semibold · line-height `normal` 선언 대응 ② 값 출처 = Tier-3 토큰, 신규 Primitive 0 ③ 텍스트 스택이 타일 44 안에 유지 | computed + 토큰 grep + 기하 + Playwright 비교 | `S4-H1` (`S4-H1R`) | — |
| **AC-4-144** 🆕 | **세션 조회 실패 화면 홈 버튼** (`D4-96`·`D4-99`, Figma 없음 — 명세 Visual Gap §8.2): ① `/session/:id` · `/session/:id/complete` 양쪽, 없는 세션 + 조회 오류 전체에 표시 ② `ErrorState` 카드 아래 형제 · gap 12 · `Button` `glass` md · hug · 문구 `Back to Home`(copy 모듈 1건) ③ 탭 → 홈 `replace`, 뒤로가기로 오류 화면 복귀 안 함 ④ `Try again` 유지 · 동작 불변 ⑤ 버튼이 `role="alert"` 밖 · 자동 포커스 0 · 높이 ≥ 44 ⑥ 320×420 스크롤 0 ⑦ `packages/ui` 변경 0 | 경로 2 × 오류 2 e2e + 기하 3뷰포트 + DOM + history 길이. 시각 대조 = 명세 대조(Figma 없음) | `S4-H1` (`S4-H1R`) | — |
| **AC-4-145** 🆕 (개정 1.4) | **Start Session 권한 확인 매트릭스** (`D4-112`, `N4B-24`): 경로 2(Activity Card 시트 확인 · 서재 `Start Session`) × 상태 6 — ① `granted` → 프롬프트 0 · `recorded` ② `prompt` → 프롬프트 **1회** · 허용 `recorded` / 거부 `conversation_only` ③ 권한 API 미지원(`queryPermission` = `null`) → ② 와 같은 경로 ④ `denied` → 프롬프트 0 · `conversation_only` ⑤ `unavailable` → `N4B-24` ③ 결정대로(권고 `conversation_only`) ⑥ 확인 중 버튼 `loading` · 재탭 → 프롬프트·선택·생성 각 1건 ⑦ Activity 경로 순서 = 권한 → `selection` → `sessions` (프롬프트 중 이탈 시 `selection` 0) ⑧ 권한 확인은 feature 간 import 없이 `entities/session` hook + 조립 지점 포트 (`lint:boundaries`) | unit(포트 주입 6상태 × 2) + e2e(Mock key 3) + 요청 로그 순서 + `requestPermission` 호출 수 | `S4-H2R` | — |
| **AC-4-146** 🆕 (개정 1.4) | **프로브 스트림 해제** (`N4B-29` 채택 시, `rules/architecture.md` §9 프라이버시): Start Session 의 권한 확인이 연 마이크 트랙이 **세션 화면 도착 전 `ended`** — Home · ready 동안 열린 오디오 트랙 0. Record 탭 → 녹음 시작 정상(기존 AC-4-43 회귀) | unit(`WebMediaEnvironment` fake — open/stop 호출 수) + 실브라우저 1회(`MediaStreamTrack.readyState`) | `S4-H2R` | — |
| **AC-4-147** 🆕 (개정 1.4) | **대화 전용 진입 안내** (`N4B-26`·`N4B-28`): ⓐ 채택 시 — ① `conversation_only` 세션 첫 진입에 마이크 시트 **1회** 자동(재진입·Prompts 팝업 열림 중에는 다시 자동 0) ② 시트 문구 = 대화 전용 변형(copy 모듈 1건, 승인 문구) — *"이 화면으로 돌아오면 녹음된다"* 류 문장 0 ③ `Not now` → 시트 닫힘 · 포커스 = Record Control ④ 시트 열림 중 상태 전이 0 | unit + e2e + DOM 텍스트 | `S4-H2R` | — |
| **AC-4-148** 🆕 (개정 1.4) | **녹음 세션 중 권한 상실** (`N4B-27`): ① ready Record 탭 거부(`mic-permission-revoked`) → `permission-denied` + 시트, **세션 생성·모드 전환 요청 0** ② ⓐ 채택 시 `Talk without recording` **미렌더(전 모드)** · 기존 닫기 → `ready → abandoned` → 홈 → 다시 Start → `conversation_only` 새 세션(AC-4-69 경로) ③ paused 재개 시 거부 → 녹음 파일 보존 · `Submit` → `paused → completed` 1건 · 업로드 적재 | unit + e2e + 요청 로그 + 로컬 파일 수 | `S4-H2R` | — |
| **AC-4-149** 🆕 (개정 1.4) | **48h 업로드 안내 화면** (`D4-114`, `N4B-31`; AC-4-32·67 화면 부분 포함): ① 큐 적재 48h −1ms 표시 0 / 48h 표시 **1회** ② `N4B-31` 결정 수단·위치(권고: Toast + `Try again`) ③ `Try again` → 큐 즉시 처리 1회(요청 로그) · 로컬 파일 보존 ④ 오프라인이면 `Try again` 후 요청 0 + 오프라인 안내 재사용 ⑤ 문구에 `failed`·`error` 0 (상위 Spec §7.2 문구 원칙) | unit 주입 clock 경계 + e2e(`upload-stalled-48h`) + 요청 로그 + 파일 수 | `S4-H3` | ✅ 실제 Storage 업로드 |
| **AC-4-150** 🆕 (개정 1.4) | **7일 로컬 보관 안내** (`D4-29`, R4-11): ① 첫 part 7일 −1분 표시 0 / 7일 표시 ② 결정 수단 = Home `InlineAlert warning` — **제목 한 문장 + `Dismiss`, `Try again` 없음**, 닫을 때까지 유지 (`D4-119` Spec §18 · `D4-120` Q10, 문안 정정 `D4-131`) ③ 삭제 예정 사실이 문구에 있다(`deleteAtMs` 기반 — 날짜 표기 형식은 design-agent) ④ 업로드 성공 시 안내 사라짐 ⑤ 레이아웃 이동은 등록된 허용 차이 `AD-S4-25` 수치만 — Home 밀림 393 +74(2줄) · 320 +94(3줄) · 600 +74 (`D4-130`) | unit clock + e2e(`local-retention-notice`) + 기하 | `S4-H3` | — |
| **AC-4-151** 🆕 (개정 1.4) | **14일 삭제 통지** (`D4-29`): ① `retention_expired` → 통지 1회(권고 Toast) ② 통지 후 로컬 파일 0 (4a 회귀) ③ 서버 요청 0 (RU-16) ④ 같은 녹음으로 재통지 0 | e2e(`local-retention-exceeded`) + 요청 로그 + 파일 수 | `S4-H3` | ✅ RU-16 서버 정리 |
| **AC-4-152** 🆕 (개정 1.4) | **업로드 진행 표시** (`N4B-30`): ⓐ 채택 시 — 완료 화면 y 468 아래 렌더 요소 0 유지(AC-4-61·104 회귀) · 업로드 성공 시 추가 UI 0 · `recording-incomplete` 자동 재시도 중 화면 안내 0(`N4B-32` ⓐ, AC-4-30 화면 부분). ⓑ 채택 시 — 이 AC 를 배지 명세 대조로 **재작성**(design-agent 명세 후) | DOM(y 468 아래 목록) + e2e 2 key | `S4-H3` | — |
| **AC-4-153** 🆕 (개정 1.4) | **안내 1회의 재시작 지속 · 중복** (`N4B-33`): ① 48h·7일·14일 각 안내는 녹음 항목당 1회 — **앱 재시작 후 재표시 0** ② 같은 시점에 둘 이상이면 우선순위(14일 > 7일 > 48h — 권고, design-agent 확정)로 1개씩 ③ 크래시 복구 Toast(`D4-117`)와 겹치지 않는다(순차) ④ 로그아웃 정리 후 안내 기록 0(AC-4-72 회귀) | unit(재시작 시뮬레이션) + 저장소 조회 | `S4-H3` | — |
| **AC-4-154** 🆕 (개정 1.6) | **측정판 — 녹음 시작 지연 두 끝점** (`D4-144`, AC-4-50 · `NV-4B-1` 수단): ① `/__dev/ui/recording-measure` 에서 회차마다 탭 시각 → `MediaRecorder` `start` 이벤트 · 첫 `dataavailable` **두 값**을 ms 로 표시 ② 5회 기록 표 + 끝점별 중위값 · 브라우저·`mimeType`·timeslice 표시 ③ 측정이 **제품 `WebRecorderAdapter` 경로**를 지난다(별도 `MediaRecorder` 0 — 어댑터 관찰 콜백 추가 시 동작 변경 0 unit) ④ Production 번들에 측정판 0(`assert:no-mocks` 통과) · `console` 0 | unit(fake recorder 로 두 끝점·중위값 계산) + dev route e2e(렌더·5회 표) + `assert:no-mocks` + grep. **실측값 자체는 AC-4-50 판정(사용자 실기기)** | `S4-H4` | — |
| **AC-4-155** 🆕 (개정 1.6) | **측정판 — 판정 스트림 해제 관측** (`D4-144`, AC-4-146 · `NV-4B-3` 수단): ① 측정판이 실제 `resolveSessionMode` 를 호출하고 그 동안 열린 트랙 수 · 반환 직후 · +1s `readyState` · 판정 결과를 표시 ② `getUserMedia` 감싸기는 측정 중에만, 언마운트 시 원복(측정판 밖 호출 영향 0) ③ 제품 코드 변경 0 ④ Production 제외 | unit(fake `mediaDevices` — 감싸기·원복·표시값) + dev route e2e + `assert:no-mocks` | `S4-H4` | — |
| **AC-4-156** 🆕 (개정 1.6) | **간헐 e2e 원인 판별** (`D4-142`, `QA-4B-003`): ① §13.5-③ 1~3단계 증거(재현 로그 · 억제 해제 대조 · 판별 결론 = 제품 / 환경)가 인계에 있다 ② 조치가 결론과 맞다 — 제품이면 제품 수정 + 회귀 unit, 환경이면 상태 기반 대기 또는 launch 인자(근거 주석) ③ P12 프로브 `--repeat-each=50` 재현 0 ④ 실시계 Toast 대기(고정 ms sleep) 신규 0 | 인계 증거 + 프로브 재실행 + grep | `S4-H4` | — |

### 14.4 4b AC 재집계

| 구분 | 수 |
|---|---|
| 상위 Plan §16.5.3 4b 목록 | **50** |
| 수정 | **14** (42 · 52 · 53 · 55 · 56 · 63 · 95 · 97 · 99 · 120 · 121 · **46** 개정 1.1 · **58** 개정 1.2 · **103** 개정 1.6) — 수 변동 없음 (103 은 상위 50 목록 안) |
| 존치 | AC-4-54 (초판 폐기 후보 철회) |
| 폐기 | **0** |
| 신규 | **32** (125~156 — 초판 10 + 135·136·137·138 + 개정 1.2 139·140 + 개정 1.3 141·142·143·144 + 개정 1.4 145~153 + **개정 1.6 154~156**) |
| **4b 합계** | **82** (개정 1.4 의 79 + 3) · Stage 4 전체 In Scope 113 → 133 → 142 → **145** |
| 걸침 (집계 외) | AC-4-30 · 32 · 67 **화면 부분** → `S4-H3` (개정 1.4). AC-4-30 화면 부분은 `N4B-32` ⓐ 채택 시 AC-4-152 로 판정 · **AC-4-35 · 36 화면 부분 → `S4-H4`** (개정 1.6, §14.1) |

## 15. Test Strategy (추가분)

- unit: 경과 시간 `mm:ss` 포맷·고정(주입 clock) · **상태 → RecordControl 변형 순수 함수** · 팝업 열림 상태가 전이를 만들지 않음 · 팝업 개수 컷오프(n ≤ 5).
- contract: `book: null`·`prompts: []` parse 통과 확인 · **개정 1.2: `subtext` · `SessionDetail.completionBubble` (§13.2-1)**. `stage-4-surface.test.ts` 표면 영향 확인.
- mock scenario: §12 신규 6종 결정성 · **개정 1.2: `session-completion` 3 key, 전이 응답 = Detail 값 일치, 비완료 세션 Detail `completionBubble: null`**.
- e2e: 칩 → 팝업 → `Escape`/바깥 탭/칩 재탭 닫힘 · 바깥 탭 대상 동작 보존(`Pause`) · 팝업 열린 채 Pause/Submit · **`See all` → Drawer → 닫기 → 포커스 칩** · recording·paused 닫기 → 다이얼로그 확인/취소 · **ready 닫기 → 즉시 홈** · **개정 1.3: 완료 화면 닫기 → 홈 replace · 오류 화면 `Back to Home`(경로 2 × 오류 2) · Toast 표시 중 닫기 탭 가능**.
- 시각: ready+닫기 · recording · paused · 팝업(n=5) · Drawer · RecordControl 변형 3 baseline. **`R-BASELINE-1`** — 팝업 전환 완료 후 `settle()`, dev 패널 숨김, 주입 clock(`03:24`).
- manual device: iOS Safari 에서 팝업·Drawer 열린 채 녹음 지속 1회 · 툴바 표시 상태 짧은 세로 1회.
- **개정 1.4 `S4-H2R`**: unit — 모드 결정 hook 6상태 × 2경로(포트 주입) · 프로브 스트림 open/stop 수 · 시트 자동 1회 · 세션 중 거부 시 생성·전환 요청 0. e2e — Mock key `mic-permission-blocked` · `mic-permission-denied` · `mic-unavailable` · `mic-permission-revoked` 로 요청 body `mode` · 요청 순서(`selection` → `sessions`) 확인. **manual device (iOS Safari · 데스크톱 Safari · Chrome)**: ① 첫 사용 Start Session 프롬프트 → 허용 → Record 탭 시 **재프롬프트 여부**(R4B-16) ② 거부 → 대화 전용 진입 ③ 설정에서 허용 후 새 세션 = `recorded`. 미실행 시 `NOT VERIFIED` + 이 절차.
- **개정 1.4 `S4-H3`**: unit — 48h·7일 경계 양쪽(주입 clock) · 재시작 후 재표시 0 · 우선순위. e2e — `upload-stalled-48h` · `local-retention-notice` · `local-retention-exceeded` · `recording-incomplete` · `recording-upload-success`(안내 0). 시각 — 결정 수단별 baseline(Toast 는 정착 후 · Home `InlineAlert` 는 320/393), `R-BASELINE-1`.

## 16. Risks & Mitigations

| ID | 위험 | 완화 (개정 1) |
|---|---|---|
| ~~R4B-01~~ | 승인되지 않은 초안 사용 | ✅ `D4-51` 로 소멸. 단 **`See all` 시각은 미승인**(`CP-1`) — `S4-G1`·`G2` 착수 조건 |
| ~~R4B-02~~ | 팝업 반투명 가독성 | ✅ 실측 해소 (white 90%, 5.90) |
| **R4B-03** | 팝업 세로 예산 **0** — 2줄 pill · 320 폭 · 짧은 세로에서 Record Control 침범 | `S4B-Q2`(고정 38) · 5 컷오프 · AC-4-132 · `S4B-Q5` |
| ~~R4B-04~~ | `D4-22` grep 허위 FAIL | ✅ `D4-55` → AC-4-120·121 범위 정정 (§14.1) |
| **R4B-05** | 팝업(비모달) ↔ Drawer(모달) 접근성 모델 혼선 | AC-4-135 / AC-4-56 분리 · 단위 분리 `G1`/`G2` |
| **R4B-06** | 닫기 = 폐기 시 실수로 녹음 유실 | 확인 다이얼로그(`D4-56`) · 서버 확정 전 로컬 보존 |
| **R4B-07** | PRD 수정 대상 누적 (16·17) | §17.3 등재, `D-24` 절차는 사용자 지시 시 |
| **R4B-08** | baseline 재생성 반복 | `S4-F1` 에서 `D4-11` 재생성 1회, 이후 추가만 |
| **R4B-09** | AC-4-108 수치 미기록 | ⏳ **완화 — `D4-111`** (2026-11-02, Orchestrator 판단 · 변경 가능): 수치 없이 `S4-H2` 착수, 경고 = 조건 없는 안내(`D4-26`). 잔여 = AC-4-108 `NOT VERIFIED (accepted: NV-4A-1)` 유지 · 수치 수령 시 `recorderScenarios.ts` `web-background-warning` 과 문구·조건만 갱신. 착수 차단 아님 (개정 1.4) |
| **R4B-10** | 단위 과대 → agent stall | `S4-F` → F1/F2 · **`S4-G` → G1/G2** |
| **R4B-11** 🆕 | 바깥 탭 판정이 이벤트를 삼켜 `Pause`·`Submit` 이 한 번 더 눌러야 동작 | `pointerdown` 캡처에서 닫기만, `preventDefault` 금지 (Spec §15-4) · AC-4-135 ⑥ |
| **R4B-12** 🆕 | iOS Safari `dvh` 에서 짧은 세로가 **기본 경우** — 393×852 baseline 만 통과하고 실기기에서 겹침 | `S4B-Q5` · AC-4-99 ② · manual device 1회 |
| **R4B-13** 🆕 | paused 시간·보조 줄 대비 2.39~2.47 (Figma 그대로) | `S4B-Q7` 가값 등재 — FAIL 사유 아님(`rules/qa.md` §2) |
| **R4B-14** 🆕 (개정 1.2) | `subtext` 를 공유 schema 에 두어 ready·리마인드 응답에도 실릴 수 있다 | 렌더 지점을 완료 버블로 한정 · AC-4-139 ⑤ |
| ~~**R4B-15**~~ (개정 1.2) | 오프라인 제출 뒤 새로고침하면 기억된 전이 응답이 사라지고 서버는 아직 이전 상태다 → 대화 전용 ready 제출은 `D4-91` 로 홈, `recording`·`paused` 는 `S4-H2` 판단 대기. 축하 화면을 놓치지만 전이는 SessionOutbox 가 보존 | ✅ **해소 — `D4-113`** (2026-11-03): Detail `recording`·`paused` → 홈 `replace`. outbox 가 `completed` 를 보낼 세션을 paused 로 다시 여는 혼선 0. 구현 `S4-H2F`(진행 중), 판정 AC-4-140 ⑤ |
| **R4B-16** 🆕 (개정 1.4) | 프로브 스트림을 닫은 뒤 Record 탭에서 다시 열 때 브라우저(특히 Safari)가 **재프롬프트**할 수 있다 — 확인하지 않았다 → 거부 시 녹음 세션 ready 에 갇힘 | AC-4-148 경로(닫기 → 재시작 → 대화 전용) · manual device ① · 재프롬프트가 확인되면 `N4B-29` 를 "스트림 유지(ready 동안 표시등 켜짐)" 로 재결정 상정 |
| **R4B-17** 🆕 (개정 1.4) | OS 프롬프트가 **설명 없이** Home/Reading Context 시트 위에 뜬다(`N4B-25` ⓐ) → 반사적 거부 증가 · Chrome 은 거듭 닫힌 프롬프트를 자동 차단할 수 있다(일반 동작, 버전별 — 단정 아님) | 거부 후 세션 시트 안내 + 설정 경로 · 대화 전용으로 세션은 계속(P0 충족) · 거부율이 문제되면 `N4B-25` ⓑ(설명 시트) 재상정 |
| **R4B-18** 🆕 (개정 1.4) | 대화 전용 세션이 **조용히** 만들어져 녹음이 안 되는 이유를 모른다 | `N4B-26` ⓐ 시트 자동 1회 · `N4B-28` 문구 |
| **R4B-19** 🆕 (개정 1.4) | 7일 안내를 놓치면 14일에 **아동 녹음 유실** (상위 R4-11) | `N4B-31` ⓒ(7일 = Home `InlineAlert` 지속) · AC-4-150·153 |
| **R4B-20** 🆕 (개정 1.4) | `S4-H2F`(진행 중)와 `S4-H2R` 가 같은 파일(`StorytimeSessionScreen.tsx` · `copy.ts` · `MicPermissionSheet.tsx`)을 만진다 — 동시 진행 시 충돌·회귀 | `S4-H2R` 는 `S4-H2F` handoff 이후 착수 (§8) |
| **R4B-21** 🆕 (개정 1.4) | `D4-112` 로 권한 거부 사용자의 **모든** 세션이 `conversation_only` → 10분 정리 없음(`D4-45`)이라 미제출 ready 세션이 서버에 누적 | 기존 Handoff(대화 전용 sweeper) 비중 상향 표기 · Stage 8 `DATA_REQUIREMENTS` 반영 |

## 17. Open Decisions

### 17.1 `N4B-xx` 처리 결과

| ID | 결과 |
|---|---|
| `N4B-01` | ✅ **`D4-51`** |
| `N4B-02` | ✅ **`D4-52`** (권장안 "대체" 와 다르게 **병행**으로 결정) |
| `N4B-03` | ✅ **`D4-53`** |
| `N4B-04` | ✅ **`D4-54`** |
| `N4B-05` | ✅ **`D4-55`** (`D4-22` 범위 정정 포함) |
| `N4B-06` | ✅ **`D4-52` 귀결** — Drawer 존속 → 코칭 노트는 Drawer 에, AC-4-54 존치 |
| `N4B-07` | ✅ **`D4-52` 귀결 (핵심)** — 팝업 앞 5개 · Drawer 전부. ⚠️ 세부 3건은 귀결이 아니다 → **`N4B-18`** |
| `N4B-08` | ✅ **`D4-56`** (recording·paused) + **`D4-57`** (ready) |
| `N4B-09` | ⏳ **축소 존속** — PRD 충돌 승인 + 책 칩 예외 처리 (§17.2) |
| `N4B-10` | ⏳ 존속 (§17.2) |
| `N4B-11` | ⏳ 존속 → `AD-S4-12`·`13` (§17.2) |
| `N4B-12` | ✅ **`D4-51` 귀결** — 승인 시안의 `03:24` 형식·문구 = 확정. 토큰 `T-15` 는 Spec 승인에 포함 |
| `N4B-13` | ⏳ RECOMMENDED 존속 (§17.2) |
| `N4B-14` | ⏳ 비차단 존속 (§17.2) |
| `N4B-15` | ⏳ 존속 (§17.2) |
| `N4B-16` | ✅ **실측 해소** (Spec §9.2 — 5.90) |
| `N4B-17` | ✅ **`D4-52` 귀결** — `AD-S4-7` 대상 존속, **표기 변경 불필요** |

**해소 11** (`01`~`08` · `12` · `16` · `17`) · **존속 6** (`09` · `10` · `11` · `15` + RECOMMENDED/정리 `13` · `14`) · **신규 1** (`N4B-18`).

### 17.2 남은 결정 — Plan `N4B` + Spec `S4B-Q` 병합 (중복 제거)

| ID | 병합 | 항목 | 권장안 | 라벨 | 차단 |
|---|---|---|---|---|---|
| **`S4B-Q1`** | + **`S4B-Q3`** | `See all prompts`(`300:1308`) **시각 승인** — 14 Semibold · `#7d9291` · 밑줄 · 가운데, 팝업 269→293. 타이포 14/17 은 **Tier-3 리터럴**(Q3 ⓐ — Figma 그대로이므로 시각 승인과 같은 답) | 현 시안 승인 + Q3 ⓐ | NEEDS DECISION | ⛔ `S4-G1`·`G2` |
| **`S4B-Q2`** | (Plan X-21) | 팝업 pill 높이 — ⓐ 고정 38 ⓑ 40 + 내부 스크롤 ⓒ 링 겹침 허용 | **ⓐ** | NEEDS DECISION | ⛔ `S4-G1` |
| **`N4B-10`** | — | 팝업 = **캐릭터 버블 아님**(양육자 호출 목록) 해석 + AC-4-52 수정 + PRD 수정 대상 **17** | 해석 승인 | NEEDS DECISION (PRD ↔ Figma) | ⛔ `S4-G1` |
| **C-13 일괄** | Plan §17.4 + Spec §10 | Figma 없는 화면·상태의 처리 방식 (`rules/workflow.md` §3) — C13-4B-1·2·4·5·6·7·8·10 = **design-agent 명세**, C13-4B-9 ①~③ 명세 / ④ 디자이너. C13-4B-3 은 `300:1309` 로 해소 | 일괄 "명세" 승인 | NEEDS DECISION (C-13) | ⛔ `F2`·`G1`·`G2`·`H2` (해당 항목) |
| **`S4B-Q8`** | (Plan X-22) + `AD-S4-14`·`16` | 세션 안내 배치 — 공지 슬롯 `InlineAlert` · 오프라인 `Toast` · 마이크 거부 안내 시트 | 채택 + AD 2건 등록 | NEEDS DECISION | ⛔ `S4-H2` |
| **`N4B-15`** | — | `D4-44` 문구 정정("필요 시 Prompt Drawer" → ready 버블) + 대화 전용 ready `Submit` 활성 | 수용 | NEEDS DECISION (결정 문구 정정) | ⛔ `S4-H2` |
| **`S4B-Q5`** | (Plan X-23) + `AD-S4-18` | 짧은 세로 압축 — ① 유연 간격 → 16 ② 메달리온 sm(136) ③ pill 목록만 내부 스크롤 ④ 디자이너 | ①②③ + ④ 디자이너 + AD 등록 | NEEDS DECISION | ⛔ `S4-K` (AC-4-99) |
| **`N4B-18`** 🆕 | `N4B-07` 잔여 | 팝업 세부 — ① `See all` **항상 표시**(n ≤ 5 포함 — Drawer 에 코칭 노트가 있으므로) ② Drawer 초기 페이지 = 1번째 ③ 팝업 pill 탭 = 동작 없음 | 셋 다 수용 | NEEDS DECISION (Figma 에 없는 동작) | 비차단 |
| **`S4B-Q4`** | Plan §12 질문 | `prompts: []` → 칩 **비활성** + 사유 | ⓐ | NEEDS DECISION | 비차단 |
| **`N4B-09`** | X-10·X-11 | PRD §7.5 "상단 오늘의 책 카드" ↔ Figma(ready 없음 · rec/paused 중앙 칩) **Figma 채택 + PRD 수정 대상 16** · 책 칩 예외(null 자리 유지 · `T-5` · 1줄 말줄임) | 수용 | NEEDS DECISION (PRD ↔ Figma) | 비차단 |
| **`N4B-11`** | Spec §12 | `AD-S4-12`(팝업 +2) · `AD-S4-13`(책 칩 recording 82) — 또는 82 를 **오타 판정** | 둘 다 가운데 + 등록 | NEEDS DECISION (허용 차이) | 비차단 |
| **`AD-S4-15`** | Spec §12 | recording·paused 닫기 다이얼로그 = `AD-S4-4` 사용처 확장 등록 | 등록 | NEEDS DECISION (허용 차이) | 비차단 |
| **`S4B-Q6`** | — | PermissionDenied 흰 글리프·라벨 on gray-2 2.211 → **`P-25` 범위 확장** | 확장 | NEEDS DECISION (가값) | 비차단 |
| **`S4B-Q7`** | X-24 | paused 시간(2.42~2.47) → **`P-26`** · 보조 줄(2.39~2.40) → **`P-27`** 가값 등재, Figma 그대로 + 디자이너 대기 | 등재 | NEEDS DECISION (가값) | 비차단 |
| **`S4B-Q9`** | X-16 잔여 | 시안에 없는 문구 — `Close session` · `Resume recording` · `Microphone is off` · `No prompts for this session` · 안내 시트 3 · Toast 2 | 채택 (copy 모듈 — 변경 비용 작음) | NEEDS DECISION | 비차단 (QA 전 확정) |
| **`N4B-13`** | Spec §7.1 | 변형 사용처: `disabled` = 동의 없음·전이 처리 중 / `permission-denied` = 마이크 거부·대화 전용 | 그대로 | RECOMMENDED | 비차단 |
| **`N4B-14`** | — | Figma 정리: `298:1261` → `163:1590` 병합 · `[DRAFT]` 이름 · `298:1412` 안내문 | 사용자/디자이너, 구현과 무관 | RECOMMENDED | 비차단 |
| `AD-S4-17` | Spec §12 | Prompts 칩 line-height 11 ↔ 20 — **Visual Gap 에서 차이가 날 때만** 상정 | 지금 묻지 않는다 | — | — |

### 17.3 기존 미결의 변화

| ID | 변화 |
|---|---|
| `N4-15` · `N4-27` · `N4-28` | ✅ `D4-51` (+`D4-56`) 로 해소 |
| `N4-10` | ✅ `D4-44` (문구 정정만 `N4B-15`) |
| `N4-31` | ✅ `D4-48` |
| 비차단 유지 | `N4-11` · `N4-13` · `N4-16` · `N4-17` · `N4-18` · `N4-21` · `N4-30` |

### 17.4 PRD 수정 대상 후보 (지금 고치지 않는다 — `D-24` 절차는 사용자 지시 시)

| # | PRD 지점 | 내용 | 결정 |
|---|---|---|---|
| **16** | §7.5 "세션 준비" 행 *"상단에 오늘의 책 카드"* | ready 에 책 표시 없음 · recording/paused 중앙 책 칩 | `N4B-09` |
| **17** | §7.5 *"캐릭터 버블은 시작·종료 2가지"* · Prompt 확인 방식 | "Prompts 칩 → 중앙 목록 팝업(양육자 호출) → `See all` → Drawer" 명시 | `N4B-10` |
| **18** 🆕 (개정 1.4) | §13 마이크 권한 거부 행 *"권한 필요 이유 안내 화면 → 설정 딥링크. 거부 상태에서는 '대화만 하기'로 세션 진행 허용"* | "Start Session 시 권한 확인 → 거부면 **자동으로** 대화 전용 세션(`D4-112`). 이유 안내는 거부 **후** 세션 화면 시트(`N4B-25` ⓐ 시). 설정 딥링크는 네이티브만" | `D4-112` · `N4B-25` |
| **19** 🆕 (개정 1.4) | §13 네트워크 끊김 행 *"업로드 실패 48시간 경과 시 재시도 안내 **알림**"* | "앱 내 안내(`N4B-31`) + 7일 보관 안내 · 14일 로컬 삭제(`D4-29`) 추가" — PRD 에 7일·14일 규칙이 없다 | `N4B-31` · `N4B-34` · `D4-29` |

### 17.5 개정 1.2 결정 귀결과 남은 미결

**전부 해소 (개정 1.3, 2026-11-02)** — 아래 표 5건 모두 사용자 결정으로 닫혔다. 남은 `S4-H1R` 착수 차단 0.

**CONFIRMED 귀결**: `D4-87` · `D4-88` · `D4-91`. `D4-88` 은 오프라인 제출의 버블·스티커 부재를 현행 수용한다. Mock 문자열 = Figma 문자열은 `D4-87` 이 채택한 권고안(Visual Gap 결정 2)에 포함된다.

| ID | 항목 | 결과 | 라벨 | 반영 |
|---|---|---|---|---|
| **`N4B-19`** | `subtext` key 필수 여부 — `D4-87` 은 "nullable" 만 정했다 | ✅ **`D4-94`** — `.nullable().optional()`, key 생략 가능 | CONFIRMED | §11 · §13.2-1 · `API_CONTRACTS.md` §3.2.3 |
| **`N4B-20`** | `text` 가 비고 `subtext` 만 있을 때 | ✅ **`D4-95`** — 버블 미렌더 | CONFIRMED | AC-4-139 ⑦ · §3.2.3 |
| **`N4B-21`** | 조회 실패 화면에 나갈 경로가 없다 (Visual Gap §2.4·§8.1) | ✅ **`D4-96`·`D4-99`** — 홈 버튼 추가, `Figma 없는 UI` 사용자 직접 승인 | CONFIRMED | §13.2-9 · AC-4-144 |
| **`N4B-22`** | 보조 줄 줄바꿈 · 320 폭 · 생성 측 길이 상한 | ✅ **`D4-98`** — 줄바꿈(clamp 없음) · 상한 ≤240px @ SF Pro Regular 13 (≈36자) · schema `.max()` 없음 | CONFIRMED | AC-4-139 ⑧ · §3.2.3 길이 행 · `P4B-BIP-02` |
| **`N4B-23`** | `D4-86` · `D4-89` · `D4-90` 에 AC 가 없다 (`D4-92` 는 코드 변경 없음) | ✅ **`D4-97`** — AC 신설 | CONFIRMED | AC-4-141·142·143 |

**Handoff 등록**: `P4B-BIP-02` 완료 버블 보조 줄 생성 · `P4B-BIP-03` 완료 버블 보존·재조회 (`API_CONTRACTS.md` §3.2.3).

### 17.6 ⭐ 개정 1.4 결정 (`D4-112` · `D4-114` 귀결) — `N4B-24` ~ `N4B-34`

**CONFIRMED 귀결 (묻지 않는다)**: ready 중 모드 전환 계약 없음(`D4-112`) · `CreateSessionRequest` schema 변경 0 · 업로드/48h/14일 = 별도 단위 `S4-H3`(`D4-114`) · `D4-113`·`D4-115`~`D4-118` 은 `S4-H2F` 에서 구현 중(이 문서에서 재계획하지 않는다) · AC-4-108 = `D4-111`.

| ID | 단위 | 질문 | 선택지 | 권고 | 라벨 | 차단 |
|---|---|---|---|---|---|---|
| **`N4B-24`** | `S4-H2R` | 권한을 **어떻게·언제** 확인하나 | ① ⓐ check 만(프롬프트 0, `prompt` → `recorded`) / **ⓑ ensure(`prompt` 면 Start Session 탭에서 OS 프롬프트)** ② Activity 경로 시점 = **Reading Context 확인 탭 직후(선택 POST 앞)** / `Start Session` 탭(시트 열기 전) ③ `unavailable` → **`conversation_only`** / 생성 막고 오류 | ①ⓑ ②확인 탭 ③`conversation_only` | NEEDS DECISION | ⛔ |
| **`N4B-25`** | `S4-H2R` | PRD "권한 필요 **이유 안내 화면**" (Figma 없음, C-13) | **ⓐ 없음 — OS 프롬프트 직행**, 거부 후 세션 시트로 안내 / ⓑ 프롬프트 전 설명 시트(design-agent 명세) / ⓒ 디자이너 요청 | ⓐ + PRD 수정 대상 18 | NEEDS DECISION (C-13 · PRD↔Figma) | ⛔ |
| **`N4B-26`** | `S4-H2R` | 대화 전용으로 만들어졌음을 어떻게 알리나 | **ⓐ 세션 첫 진입 시 마이크 시트 1회 자동**(기존 UI) / ⓑ 생성 전 Home 확인 다이얼로그(신규 UI, C-13) / ⓒ 알리지 않음 | ⓐ | NEEDS DECISION | ⛔ |
| **`N4B-27`** | `S4-H2R` | `Talk without recording` 버튼 · 녹음 세션 중 거부 | **ⓐ 전 모드 미렌더 + Spec·copy 에서 제거, 녹음 ready 거부 = 시트 + 기존 닫기 → 재시작 시 자동 대화 전용** / ⓑ 녹음 ready 에서만 버튼 = 닫기+홈 / ⓒ H2-D1 ⓐ 재생성(contract 추가) | ⓐ | NEEDS DECISION (Spec 요소 제거) | ⛔ |
| `N4B-28` | `S4-H2R` | 대화 전용 세션의 시트 설명 문구 (`D4-115` 문구가 *"come back to this screen"* — 모드 고정이라 사실이 아님) | 대화 전용 변형 1건 **초안 후 승인** / 현행 유지 | 초안 후 승인 | NEEDS DECISION (문구) | 비차단 (QA 전 확정) |
| `N4B-29` | `S4-H2R` | 프로브가 연 마이크 스트림 | **판정 직후 닫는다**(ready 동안 표시등 0) / 열어 둔다(재프롬프트 위험 0, 대기 중 마이크 켜짐) | 닫는다 — R4B-16 수동 확인 후 재검토 | RECOMMENDED | 비차단 |
| **`N4B-30`** | `S4-H3` | 업로드 진행 표시 `UploadStatusBadge` (상위 Spec §7.2, Figma 없음) | **ⓐ 만들지 않는다**(AC-4-61 유지) / ⓑ 53px 간격 배지(AC-4-61 수정 + 허용 차이) / ⓒ 성공 Toast 만 | ⓐ | NEEDS DECISION (C-13 · AC 충돌) | ⛔ |
| **`N4B-31`** | `S4-H3` | 48h · 7일 · 14일 안내 수단 | ⓐ 전부 Toast(action) 1회 / ⓑ 전부 Home `InlineAlert` / **ⓒ 혼합: 48h Toast+`Try again` · 7일 Home `InlineAlert warning`+`Try again`(지속) · 14일 Toast** | ⓒ + Home 배치 = design-agent 명세(→ `AD-S4-25` 7일 배너 · `AD-S4-26` 48h·14일 Toast, `D4-130`) | NEEDS DECISION (C-13) | ⛔ |
| **`N4B-32`** | `S4-H3` | AC-4-30 *"화면이 재시도를 안내"* — 큐가 자동 재시도 중 | **ⓐ 화면 안내 0, 지속 실패는 48h 경로로 합류**(AC-4-30 화면 부분 재정의) / ⓑ 즉시 Toast | ⓐ | NEEDS DECISION (AC 재정의) | ⛔ |
| `N4B-33` | `S4-H3` | 안내 "1회" 범위 | **녹음 항목당 1회 · 재시작 후 재표시 0**(로컬 기록) / 프로세스당 1회(현 4a) | 항목당 · 재시작 지속 | RECOMMENDED | 비차단 |
| `N4B-34` | `S4-H3` | PRD "48h 재시도 안내 **알림**" = push? | **ⓐ 앱 내 안내로 충족, push 는 후속**(PRD 수정 대상 19) / ⓑ push 를 Handoff 필수 요구(`P4B-BIP-06`) | ⓐ | NEEDS DECISION (PRD 해석) | 비차단 |

**문구**: `S4-H2R`(시트 대화 전용 변형) · `S4-H3`(48h · 7일 · 14일 3건 + `Try again` 재사용) — 전부 development-agent 초안 → 사용자 승인 (`D4-115` 절차).

### 17.7 ⭐ 개정 1.6 결정 (`S4-H4`, `D4-140`~`D4-144` 귀결) — `N4B-35` ~ `N4B-39`

**CONFIRMED 귀결 (묻지 않는다)**: AC-4-35·36 화면 부분 = 4b `S4-H4`(`D4-140`) · `QA-4B-004` 이번 수정(`D4-141`, Stage 8 이월 철회) · `QA-4B-003` 원인 조사 후 수정(`D4-142`) · 실기기 4건 = 사용자 수동(`D4-143`) · 측정판 보강(`D4-144`) · contract·error code·endpoint 변경 0 · `OBS-4B-3` 은 plan-agent 소유 문서 반영으로 처리(`API_CONTRACTS.md` Rev 8.12).

| ID | 단위 | 질문 | 선택지 | 권고 | 라벨 | 차단 |
|---|---|---|---|---|---|---|
| **`N4B-35`** | `S4-H4` ① | `SESSION_ALREADY_ACTIVE` 일 때 **"복귀"가 무엇인가** (Figma·Spec 정의 없음 — C-13) | **ⓐ 상태별 분기, 신규 UI 0**: Detail 조회 → `ready` = `/session/:id` 로 이동(기존 ready 화면이 복귀 지점) · `recording`/`paused` = 시트 안 기존 `SESSION_ALREADY_ACTIVE` 문구만(이 탭에서 이어 녹음 불가 — 녹음은 시작한 탭·기기에 있다), 서버 정리는 `P4B-BIP-07` / ⓑ ⓐ + `recording`/`paused` 에 `End that storytime` 버튼(Discard `ConfirmDialog` 재사용 → `→ abandoned` → 재생성) — 신규 UI 1, **다른 탭·기기의 녹음을 버릴 위험**(유실 = Critical 유형) / ⓒ 세션 화면이 `recording`/`paused` 를 이어받아 paused 로 재개(새 part) — 4a 녹음 코어·`D4-113` 변경, 4b 범위 초과 | **ⓐ** + AC-4-35 화면 부분 재정의(§14.1) | NEEDS DECISION (C-13 · AC 재정의) | ⛔ `S4-H4` ① |
| `N4B-36` | `S4-H4` ② | 세션 endpoint `ONBOARDING_INCOMPLETE` 의 이동 방식 | **ⓐ `me` 재조회 → 기존 Route Guard 가 이동**(이동 규칙 단일 출처 · AC-4-36 원문 *"Route Guard 가 보낸다"* 와 일치) + Mock `sessions:onboarding-incomplete` 가 409 뒤 `me` 를 `in_progress` 로 연동 + 불일치면 문구만(루프 0) / ⓑ 오류 코드에서 바로 온보딩 입구로 이동(저장된 재개 지점 무시) | ⓐ | RECOMMENDED | 비차단 |
| `N4B-37` | `S4-H4` ③ | 클래식 스크롤바 넘침 수정 방식 | **ⓐ 원인 수정** — 스크롤 박스 안 뷰포트 폭(`vw`·고정값) 의존을 컨테이너 폭으로, 스크롤바는 보이게 유지 · 1024 중심 −7.5 는 스크롤바가 차지한 폭이므로 `clientWidth` 기준 가운데로 판정 / ⓑ ⓐ + `scrollbar-gutter: stable both-edges`(창 기준 중심 유지 — 대신 짧지 않은 화면에도 양쪽 여백 15 가 항상 생겨 320 에서 컬럼 290) / ⓒ 스크롤바 숨김(넘침 0 이지만 데스크톱 스크롤 표시 소실) | ⓐ | RECOMMENDED | 비차단 |
| `N4B-38` | `S4-H4` ① | `recording`/`paused` 분기 문구 | **기존 `error-copy.ts:76` 그대로**(*"Continue the open storytime, or finish it before starting a new one."*) / 이 탭에서 이어 갈 수 없다는 사실을 담은 변형 1건 초안 후 승인 | 기존 그대로 — QA 전 사용자 확인 | NEEDS DECISION (문구) | 비차단 (QA 전) |
| **`N4B-39`** | AC-4-50 | **녹음 시작 지연의 끝점** (`OBS-4B-7`) — 상위 Plan AC-4-50 *"탭 → 첫 청크 수신"* vs 4a spike *"`start()` ≠ 첫 청크(1184ms @ timeslice 1000)"* | ⓐ 탭 → `MediaRecorder` `start` 이벤트(녹음이 실제로 시작된 시각) / ⓑ 탭 → 첫 `dataavailable`(원문) — timeslice 1000ms(`D4-28`)라 **첫 청크는 구조상 ~1s 뒤** 에 와서 시작 지연이 아니라 timeslice 를 재게 되고, 원문대로면 ≤1s 는 거의 항상 FAIL / **ⓒ 둘 다 기록, 판정은 ⓐ** (ⓑ 는 참고값 — 첫 청크 저장까지의 유실 창 정보) | **ⓒ** + 상위 Plan AC-4-50 문언 수정 · PRD §NFR *"녹음 시작 지연 1초 이내"* 와 충돌 없음(PRD 는 끝점 미정의) | NEEDS DECISION (AC 재정의) | ⛔ AC-4-50 판정 (측정판 구현은 차단 아님) |

## 18. Handoff to design-agent

개정 1 시점 design-agent 산출물(`stage-4b-design-spec.md`)이 §18.2 질문 1~8 에 **전부 답했다**(Spec §11.1). 남은 design-agent 작업:

1. 체크포인트 결정 후 Spec 반영 — `S4B-Q1`~`Q9` · `N4B-18` · AD 등록 결과 · 가값 `P-26`·`P-27`.
2. `S4B-Q5` ④(짧은 세로 극단) — 디자이너 요청 여부가 정해지면 요청서 개정.
2-1. (개정 1.2) ~~`N4B-22` 측정~~ ✅ Visual Gap §7, `D4-98` (개정 1.3). 남은 것: 보조 줄 13/19 의 토큰(`--bubble-complete-subtext-line`) · Spec §12.4-②·⑫ 해소 표기 · §5.4-① 흡수 철회 표기(`D4-90`). Visual Gap §7·§8 Status 는 결정 기록 기준으로 갱신한다.
3. 각 단위 구현 후 **Visual Gap 검토**(최우선 규칙 5) — 대상 노드 `300:1309` · `298:1262` · `298:1340` · `296:1210` · `298:1227`/`1236`/`1245` · `88:960`. `AD-S4-17` 은 이때 판정.
4. ⭐ (개정 1.4, `S4-H2R`) — §19.3 결정 **전** 확인·명세:
   - Activity Card `163:2648` · Reading Context 시트 · 서재 `145:1132`/`163:1669` 에 **권한 관련 노드가 정말 없는지** 실측 (plan-agent 는 `26:21` 만 쟀다)
   - 권한 확인 중 상태 = 기존 `Button loading` 으로 덮이는지 (Activity 시트 확인 버튼 · 서재 `Start Session`) — 덮이지 않으면 C-13 항목으로 보고
   - 마이크 시트(4b Spec §7.3) 개정: 트리거 확장(`N4B-26` ⓐ) · `Talk without recording` 제거(`N4B-27` ⓐ) · 대화 전용 변형 문구 자리(`N4B-28`) · `AD-S4-16` 범위 안인지 판정
   - `N4B-25` ⓑ 선택 시에만: 프롬프트 전 설명 시트 명세
5. ⭐ (개정 1.4, `S4-H3`) — 명세 (C-13, Figma 없음):
   - 상위 Spec §7 ③⑤ · 4b Spec §7.1 마지막 행(*"업로드 / 48h / 14일 = 상위 §7.2 그대로"*) 정정 — 상위 §7.2 에 14일이 없다 · `UploadStatusBadge` 슬롯이 AC-4-61 과 충돌
   - `N4B-31` 수단별 명세: Toast(action) 문구 자리 · Home `InlineAlert` 배치(`26:21` 위 어디 · 오프라인 캐시 배너 `AD-S4-11` 과 동시 표시 우선순위 · 320/393 밀림 실측 → `AD-S4-25`, 48h·14일 Toast → `AD-S4-26`)
   - 7일 안내의 삭제 예정일 표기 형식 · 우선순위(AC-4-153 ②)
   - `N4B-30` ⓑ 선택 시에만: `UploadStatusBadge` 6상태 명세 재검토
6. ⭐ (개정 1.6, `S4-H4`) — §19.4 결정 **전** 확인:
   - `N4B-35` ⓐ: `recording`/`paused` 분기 문구가 **Activity Card Reading Context 시트 · 서재 `Start Session` 의 기존 오류 표시 자리**(4b QA P7 스크린샷의 일반 실패 문구 자리)에 그대로 들어가는지 — 신규 요소가 필요하면 C-13 항목으로 보고. `ready` 분기는 기존 ready 화면이라 UI 영향 0 확인
   - `N4B-35` ⓑ 선택 시에만: `End that storytime` 버튼 · 확인 다이얼로그 명세(Figma 없음)
   - `N4B-36`: 온보딩 이동 중 시트·Home 의 과도기 프레임(시트 닫힘 → 이동) — 신규 UI 0 확인
   - `N4B-37` 수정 후 Visual Gap: 320 / 393 / 600 / 1024 × 오버레이·클래식 스크롤바, Stage 1~3 탭 화면 포함 · `AD-S4-23`(짧은 세로 스크롤) 범위 안인지
   - 측정판(`/__dev`)은 dev 전용 — Visual Gap 대상 아님, "UI 영향 없음(Production)" 기록

---

## 19. ⭐ 승인 체크포인트 결정 목록 — 한 번에 답할 수 있도록

> Plan 승인 · Design Spec 승인(토큰 `T-15`~`T-21` 포함)과 함께 아래에 답하면 `S4-F1` 부터 순서대로 진행할 수 있다. "권장안대로" 한 마디면 전 항목 권장안 채택이다.

### 19.1 ⛔ 차단 — 7건 (막는 단위)

| # | ID | 질문 (권장안) | 막는 단위 |
|---|---|---|---|
| **CP-1** | `S4B-Q1`+`Q3` | `See all prompts` 현 시안(14 Semibold · 회색 · 밑줄, 팝업 293) **승인**? 타이포 14/17 은 전용 토큰으로 그대로 | `S4-G1` · `G2` |
| **CP-2** | `S4B-Q2` | 팝업 안 Prompt pill 을 **38 고정**(2줄이어도 높이 불변 — Record Control 침범 방지)? | `S4-G1` |
| **CP-3** | `N4B-10` | 팝업은 "캐릭터 버블"이 아니라 **양육자가 연 목록**으로 본다 → AC-4-52 수정 + PRD 수정 대상 17 등재? | `S4-G1` |
| **CP-4** | C-13 일괄 | Figma 에 없는 상태(recording 위 팝업 · 개수 변형 · 닫기 다이얼로그 · 책 칩 예외 · 팝업→Drawer 전환 · 공지 슬롯 · 팝업 모션 · 마이크 거부 화면)를 **design-agent 명세로** 만든다? 짧은 세로 극단(④)만 디자이너 | `S4-F2` · `G1` · `G2` · `H2` |
| **CP-5** | `S4B-Q8` | 세션 안내 = **공지 슬롯(InlineAlert) + 오프라인 Toast + 마이크 거부 시트** 채택, `AD-S4-14`·`16` 등록? | `S4-H2` |
| **CP-6** | `N4B-15` | `D4-44` 문구에서 "Prompt Drawer" 단계를 "ready 버블" 로 정정 + 대화 전용 ready 에서 **`Submit` 활성**? | `S4-H2` |
| **CP-7** | `S4B-Q5` | 짧은 세로 화면: **간격 축소 → 메달리온 축소 → pill 목록 스크롤** 순 압축 + 극단은 디자이너, `AD-S4-18` 등록? | `S4-K` |

**입력 요청 (결정 아님)**: AC-4-108 실기기 측정 세부 수치(잠금 구간 청크 수 · 재생 여부 · iOS 버전) — ~~`S4-H2` 착수 전~~ → **`D4-111` 로 착수 조건에서 제외** (개정 1.4). 수치가 들어오면 문구·조건만 갱신.

### 19.2 비차단 — 11건 (권장안으로 착수, 나중에 바꿔도 비용 작음)

| # | ID | 질문 (권장안) |
|---|---|---|
| NB-1 | `N4B-18` | `See all` 항상 표시(n ≤ 5 포함) · Drawer 는 1번째 Prompt 부터 · 팝업 pill 탭은 동작 없음? |
| NB-2 | `S4B-Q4` | Prompt 0개면 Prompts 칩 **비활성** + 사유 문구? |
| NB-3 | `N4B-09` | PRD "상단 오늘의 책 카드" 대신 Figma(ready 없음 · 녹음 중 중앙 칩) 채택 + PRD 수정 대상 16 · 책 없음=자리만 유지 · 표지 없음=그라디언트 · 긴 제목=말줄임? |
| NB-4 | `N4B-11` | 팝업 +2 · 책 칩(recording) +2 → **가운데 정렬** + `AD-S4-12`·`13` 등록 (또는 82 = 오타)? |
| NB-5 | `AD-S4-15` | 녹음 중 닫기 확인 다이얼로그(= Discard 다이얼로그 재사용)를 허용 차이로 등록? |
| NB-6 | `S4B-Q6` | `Mic is off` 흰 글자 대비 2.211 → 기존 가값 `P-25` 범위 확장? |
| NB-7 | `S4B-Q7` | paused 시간·보조 줄 대비 미달 → 가값 `P-26`·`P-27` 등재, Figma 그대로? |
| NB-8 | `S4B-Q9` | 시안에 없는 문구(`Close session` · `Resume recording` · `Microphone is off` · `No prompts for this session` · 안내 시트 3 · Toast 2) 채택? |
| NB-9 | `N4B-13` | Record Control `disabled` = 동의 없음·처리 중 / `permission-denied` = 마이크 거부·대화 전용? |
| NB-10 | `N4B-14` | Figma 정리(변형 세트 병합 · `[DRAFT]` 이름 · `298:1412` 안내문)는 사용자/디자이너가 별도로? |
| NB-11 | §4 | 디자이너 요청서는 **지금 보내지 않는다**(4b 차단 0 — 비차단 잔여만)? |

### 19.3 ⭐ 개정 1.4 체크포인트 — `S4-H2R` · `S4-H3` (design-agent 산출 후 함께 답한다)

> 상세 = §17.6. "권장안대로" 면 아래 권고 전부 채택. 승인 후 plan-agent 가 §12 key 4건 + §13.3-⑧ C-1~C-3 을 `API_CONTRACTS.md` 에 반영한다(`S4-H2F` 와 겹치지 않는 시점).

| # | ID | 질문 (권고) | 막는 단위 |
|---|---|---|---|
| **CP-8** | `N4B-24` | Start Session 에서 권한이 미정이면 **그 자리에서 OS 프롬프트**를 띄우고(Activity 는 Reading Context 확인 탭 직후), 거부·차단·**마이크 없음**이면 처음부터 대화 전용으로 만든다? | `S4-H2R` |
| **CP-9** | `N4B-25` | PRD 의 "권한 이유 안내 화면"은 **만들지 않고**(Figma 없음) 거부 후 세션 시트로 안내 + PRD 수정 대상 18? | `S4-H2R` |
| **CP-10** | `N4B-26` | 대화 전용 세션 **첫 진입 때 마이크 시트를 1회 자동**으로 띄워 이유를 알린다? | `S4-H2R` |
| **CP-11** | `N4B-27` | `Talk without recording` 버튼을 **없앤다** — 녹음 세션에서 뒤늦게 거부되면 닫고 다시 시작(자동 대화 전용)? | `S4-H2R` |
| **CP-12** | `N4B-30` | 업로드 진행 배지는 **만들지 않는다**(완료 화면 y468 아래 비움 유지)? | `S4-H3` |
| **CP-13** | `N4B-31` | 48h = Toast + `Try again` · **7일 = Home 안내(닫을 때까지)** · 14일 = Toast, Home 배치는 design-agent 명세 + 허용 차이 ~~`AD-S4-19` 후보~~ → `AD-S4-25`(7일 배너) · `AD-S4-26`(48h·14일 Toast) (`D4-119`·`D4-130`)? | `S4-H3` |
| **CP-14** | `N4B-32` | 업로드 자동 재시도 중에는 화면 안내 없이, 계속 실패하면 48h 안내로 합친다(AC-4-30 화면 부분 재정의)? | `S4-H3` |
| NB-12 | `N4B-28` | 대화 전용 시트 설명 문구 1건 — 초안 후 승인? | (QA 전) |
| NB-13 | `N4B-29` | 권한 확인용 마이크 스트림은 판정 직후 닫는다(Safari 재프롬프트는 실기기로 확인)? | — |
| NB-14 | `N4B-33` | 안내는 녹음당 1회, 앱을 다시 열어도 다시 안 띄운다? | — |
| NB-15 | `N4B-34` | PRD "48h 알림"은 앱 내 안내로 충족, push 는 후속 + PRD 수정 대상 19? | — |

### 19.4 ⭐ 개정 1.6 체크포인트 — `S4-H4` (design-agent 확인 후 함께 답한다)

> 상세 = §13.5 · §17.7. **`S4-H4` 는 이 표의 ⛔ 항목 승인 전 착수 금지.** "권장안대로" 면 아래 권고 전부 채택. 승인 후 plan-agent 가 상위 Plan AC-4-35 · AC-4-50 문언 수정과 §13.5-⑦ 신규 Mock key 2건의 `API_CONTRACTS.md` §5.4 등재를 반영한다(development-agent 작업과 겹치지 않는 시점).

| # | ID | 질문 (권고) | 막는 단위 |
|---|---|---|---|
| **CP-15** | `N4B-35` | 이미 열린 세션이 있으면 — **`ready` 면 그 세션 화면으로 이동**, **`recording`/`paused` 면 시트에 "이미 열린 이야기 시간이 있다" 안내만**(이 탭에서는 이어 녹음할 수 없다 · 끝나지 않은 세션 정리는 서버 요구 `P4B-BIP-07`) · AC-4-35 의 "복귀" 를 `ready` 에 한정? | `S4-H4` ① |
| **CP-16** | `N4B-39` | 녹음 시작 지연 ≤1s 의 끝점 = **탭 → 녹음 시작(`start` 이벤트)**, 첫 청크 시각은 참고로만 기록? (첫 청크는 1초 단위 저장이라 구조상 약 1초 뒤에 온다) | AC-4-50 판정 (`NV-4B-1` 실측 전) |
| NB-16 | `N4B-36` | 온보딩 미완료 응답 → 프로필 재조회 후 **기존 Route Guard 가 이동**, 두 응답이 어긋나면 안내만? | — |
| NB-17 | `N4B-37` | 스크롤바 넘침은 **원인(뷰포트 폭 의존)을 고치고 스크롤바는 보이게** 둔다, 가운데 정렬은 스크롤바를 뺀 폭 기준? | — |
| NB-18 | `N4B-38` | `recording`/`paused` 안내 문구 = 기존 `A storytime is already open` / *"Continue the open storytime, or finish it before starting a new one."* 그대로? | (QA 전) |
