# Stage 4b Plan — Session Screens (재검토: 사용자 Figma 수정 `D4-50` 반영)

Status: **APPROVED (2026-10-26, user)** — 사용자 발화 *"권장안대로 해줘"* (승인 체크포인트 응답: Plan·Design Spec 승인 + Plan §19 차단 CP-1~7 · 비차단 NB-1~11 전 항목 권장안 채택, `D4-58`). 작성: 2026-10-26 plan-agent — 개정 1
Based on: PRD v1.5 개정 2 (`docs/source/HARU_PRD_v1.5.md` §7.5 · FR-09~11) · Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` 페이지 `16:2` 섹션 **`296:1127` "Recording"** (`298:1262` · `298:1340` · `296:1210`/`296:1257` · `298:1261` · **`300:1309`** · `300:1308`) + 기존 `28:51` · `29:62` · `88:960` · `163:1590` · 상위 Plan `docs/plans/stage-4-plan.md` 개정 3.1 (APPROVED 2026-10-13) · `docs/decisions/stage-4-approvals.md` **`D4-1`~`D4-57`** · Design Spec `docs/design/stage-4b-design-spec.md` (DRAFT 2026-10-26) · 상위 Spec `docs/design/stage-4-design-spec.md` · `packages/contracts/src/sessions/session.ts` · `rules/session-transitions.ts`

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 초판 | 2026-10-26 | `D4-50` 충돌 지점 20건 · `N4B-01`~`17` |
| **개정 1** | 2026-10-26 | 사용자 결정 **`D4-51`~`D4-57`** 반영 · Design Spec **PM-1~PM-16** 반영 · `S4-G` → **`S4-G1`(팝업) / `S4-G2`(Drawer)** 분할 · AC-4-56 팝업/Drawer 분리 · ready 닫기 AC 신규 · AC-4-54 존치 · NEEDS DECISION 을 남은 것만 재정리 + **§19 승인 체크포인트 결정 목록** 신설 |
| **개정 1.1** | 2026-10-27 | 사용자 결정 **`D4-59`** 반영 — ready 리마인드 문구 = 서버 필드 `SessionSummary.reminderBubble` (`API_CONTRACTS.md` Rev 8.6 §3.2.2) · §10·§11·§12 delta · AC-4-46 화면 부분 수정(§14.1) · **`S4-F1R`** 후속 단위 등록(§13.1). Status 는 APPROVED 유지 |

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
| **FR-10** 버블 2회 | ready 버블(`139:2803`) · 완료 버블 · 5분 리마인드(`D4-46`) · 팝업과의 구분(`N4B-10`) |
| **FR-11** 경청 + Prompt 모아보기 | 메달리온 경청 모션(CSS) · **Prompts 칩 → 팝업 `296:1257`** · **`See all prompts` → Drawer `88:960`**(캐러셀 + 코칭 노트) |
| **FR-19** 출석 스티커 | 완료 화면 `29:62` y 0~468 (변경 없음) |
| **FR-25** 반응형 | 세션·팝업·Drawer·완료 320/393/600/1024 + 짧은 세로(`S4B-Q5`) |
| PRD §13 | 마이크 거부(PermissionDenied 변형 + 안내 시트) · 자동 종료 · 크래시 복구 · 인터럽션 · Web 백그라운드 경고 · 오프라인/48h/14일 |
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
| 데이터 | **AC-4-108 실기기 측정 세부 수치** (잠금 구간 청크 수 · 재생 여부 · iOS 버전) | ⏳ ⛔ `S4-H2` 착수 전 |
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
- `SessionSummary.book` 은 Activity Card · 서재 · `childBookId` 세 경로 모두에서 채워져야 한다 (`P4B-BIP-01`).
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

## 12. Mock Scenarios (4b 추가분 — PM-16: Spec 추가 제안 없음)

| key (제안) | 내용 | 목적 |
|---|---|---|
| `session:book-missing` | `book: null` | 책 칩 미렌더 + **자리 유지**(상태 블록 y 불변) |
| `session:book-no-cover` | `coverUrl` 없음 | 표지 `T-5` 그라디언트 |
| `session:book-long-title` | 40자 이상 | 1줄 말줄임 |
| `session:prompts-1` / `-5` / `-7` | n = 1 · 5 · 7 | 팝업 높이 `73+44n`(n≤5) · **n=7 팝업 5개 + Drawer 7페이지** · Record Control 침범 0 |
| `session:prompts-empty` | `prompts: []` | 칩 비활성 (`S4B-Q4`) |
| ⭐ `session-greeting:success` / **`session-greeting:reminder-missing`** (개정 1.1) | `reminderBubble.text = 'Ready when you are!'` / `reminderBubble: null` | 5분 시점 제목 줄 교체 / 시각 변화 0 (AC-4-46 화면). `session-greeting` 그룹 등재 = `API_CONTRACTS.md` §5.4 Rev 8.6 |
| 기존 재사용 | `consent-missing`(→ `disabled`) · 지연(전이 처리 중 → `disabled`) · `mic-permission-denied`(→ `permission-denied`) · `auto-timeout` · `web-background-warning` · `offline` · 업로드 성공/실패 · 크래시 복구 | 변형·안내 연결 검증 |

시나리오 key 등재(`API_CONTRACTS.md` §5.4)는 승인 후 plan-agent.

## 13. 작업 단위 (한 단위 = development-agent 1회 호출)

| 단위 | 범위 | AC (주 판정) | 선행 | 착수 차단 결정 |
|---|---|---|---|---|
| **`S4-F1`** 진입 · ready | `D-3` 해제 + 오프라인 캐시 비활성·`InlineAlert titleId`(같은 패스, `D4-39`) · Reading Context 시트(`D4-35`) · `/session/:id` ready(`28:51`) · **ready 닫기(`300:1318`, `D4-57`)** · `D4-11` IconButton 그림자 + baseline 재생성 · AC-4-46 리마인드 화면 | 38 · 39 · 40 · 86 · 110 · 111 · 117~124 · **136** (15) | Plan·Spec 승인 | 없음 |
| **`S4-F2`** recording · paused | 상태 블록 · 책 칩 · Prompts 칩 **자리**(시각·`disabled` 아님 — 동작은 `G1`) · 닫기(`D4-56` 다이얼로그) · **RecordControl 5변형 컴포넌트** · `Discard`/`Submit` · AC-4-43 화면 부분 | 41 · 42 · 50 · 51 · 112~116 · 125~129 · **138** (15) | `S4-F1` | `CP-4`(C-13 일괄 중 C13-4B-5·6) |
| **`S4-G1`** Prompts 팝업 | 칩 disclosure + 팝업 `296:1257`(5 컷오프 · 제목 `D4-55` · `See all` 렌더) · 비모달 동작 · 정리 · 빈 목록 | 52 · 130 · 131 · 132 · 133 · **135** (6) | `S4-F2` | `CP-1` · `CP-2` · `CP-3` · `CP-4`(C13-4B-1·2·10) |
| **`S4-G2`** Prompt Drawer | `See all` → `Sheet` + `PromptCarousel` + 코칭 노트 + dots/화살표(상위 Spec §3.2 그대로) · 포커스 복귀 = 칩 | 53 · 54 · 55 · 56 · **137** (5) | `S4-G1` | `CP-1` · `CP-4`(C13-4B-7) |
| **`S4-H1`** 완료 화면 | 변경 없음 | 57~61 · 104 · 107 (7) | `S4-F2` | 없음 |
| **`S4-H2`** 예외·안내 UI | 마이크 거부(PermissionDenied 연결 + 안내 시트) · 대화 전용(`D4-44`) · 공지 슬롯 · 오프라인 Toast · 업로드/48h/14일/크래시 · Web 백그라운드 경고 · 자동 종료 안내 | 63 · 64 · 65 · 68 · 69 · 70 · 134 (7) | `S4-F2` | `CP-5` · `CP-6` · `CP-4`(C13-4B-4·8) · AC-4-108 수치 |
| **`S4-K`** 회귀·시각 | Figma 대조(`300:1309` · `298:1262` · `298:1340` · `296:1210` · 변형 3) · 짧은 세로 · 양축 프로브 · reduced-motion · 전체 스위트 **단독 실행** | 95~103 (9) (+109 회귀) | 전 단위 | `CP-7` |

**합계 64** = 15 + 15 + 6 + 5 + 7 + 7 + 9 ✓ (§14.4 와 일치).

**순서·의존**:

```
S4-F1 → S4-F2 ─┬→ S4-G1 → S4-G2 ─┐
               ├→ S4-H1 ─────────┼→ S4-K
               └→ S4-H2 ─────────┘
```

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

## 14. Acceptance Criteria 변경 (번호 체계 유지 — 상위 Plan §11 기준 delta)

### 14.1 수정 (12건 — 개정 1.1 AC-4-46 추가)

| AC | 수정 내용 | 근거 |
|---|---|---|
| **AC-4-42** | Resume 수단 = **Record Control `paused` 변형(`Tap to resume`) 탭**. paused → recording 전이 1건. `Resume` 버튼 0건 | `D4-51` |
| **AC-4-52** | *"recording·paused 동안 **자동으로 나타나는** 캐릭터 버블 0건"* 으로 한정. Prompts 팝업은 ① 사용자 탭으로만 열리고 ② tail 이 없고 ③ 상태 전이·타이머로 자동으로 열리지 않는다 (렌더 로그 증거). 판정 단위 `S4-F2` → **`S4-G1`** 로 이동 | X-09 · ⏳ `N4B-10` (`CP-3` 승인 조건부 — 미승인 시 원문 유지 = 팝업이 FAIL 사유가 된다) |
| **AC-4-53** | 재확인 경로 = **Prompts 칩 → 팝업(앞 5개) → `See all prompts` → Drawer(전부)**. **세 지점(ready 버블 · 팝업 · Drawer)이 같은 `SessionSummary.prompts` 출처**를 서버 순서대로 쓴다 — 같은 fixture → 텍스트 일치, 하드코딩 0. recording·paused 양쪽에서 동작 | `D4-52` · `D4-53` |
| **AC-4-55** | 대상 = **팝업과 Drawer 둘 다** — 오디오 재생 · `navigator.vibrate` 0건 | `D4-52` |
| **AC-4-56** | **Drawer 전용으로 한정** (원문 유지: 키보드 열기·이동·닫기 · 초기 포커스 · **포커스 트랩** · 복귀) + **복귀 대상 = Prompts 칩**(팝업은 이미 닫혀 있다) · 열린 동안 녹음 계속. 팝업 기준은 **AC-4-135 로 분리** | `D4-52`·`D4-54` · **PM-3** |
| **AC-4-63** | 마이크 거부 시 Record Control = **`permission-denied` 변형(`Mic is off`)**, 탭 → 안내(`S4B-Q8` 배치 — 권장: 시트) + `Talk without recording` | `D4-51` · `N4B-13` |
| **AC-4-95** | 허용 차이 목록: **`AD-S4-7` 유지**(Drawer 존속) + 신규 `AD-S4-12`~`18` 중 **사용자가 등록한 것만** 반영. 등록되지 않은 어긋남은 Figma 대로 구현됐는지 판정 | **PM-15** · `N4B-11` |
| **AC-4-97** | 터치 타깃 ≥ 44: 기존 대상(Record Control · `Discard` · `Submit` · **Drawer 좌우 화살표 — 유지**) + **Prompts 칩(117×36 → 세로 hit 44)** · **닫기(38 → 44)** · **`See all prompts`(17 높이 → `::before` hit 44, 팝업 안)** 추가. Drawer 트리거 = `See all` 로 대체 | **PM-4** · Spec §3.3·§4 #5 |
| **AC-4-99** | ① 팝업이 **320 컬럼에서 잘리지 않는다**(`min(329px, 100%)`, pill 240) ② **짧은 세로(< 796)** 에서 `S4B-Q5` 결정 규칙대로 압축되고 팝업이 Record Control 을 덮지 않는다 | Spec §8 · `CP-7` |
| **AC-4-120** | `D4-22` 리터럴 금지 grep(③) 범위 = **ready 버블 제목 줄**. 팝업 제목 copy 키 1건은 위반이 아니다 | **`D4-55`** |
| **AC-4-121** | 동(⑥) — 범위 = ready 버블 제목 줄. ready 버블에 `Try this prompt!` 가 **나타나지 않는다**는 단정은 유지 | **`D4-55`** |
| ⭐ **AC-4-46** (개정 1.1) | **화면 부분 확정**: 5분 리마인드(`D4-46`, 1회) = ready 버블 **제목 줄만** `SessionSummary.reminderBubble.text` 로 교체, pill 불변, 1줄 clamp(`D4-21` 동일 상한). **`reminderBubble` 이 null/빈 문자열이면 시각 변화 0** (DOM 5분 전후 동일). Frontend 문구 상수 0. 증거: 주입 clock + 렌더 횟수 + `session-greeting:reminder-missing` + grep. 판정 단위 **`S4-F1R`**. PENDING: 문구 생성·검수(`P4-BIP-11` 확장) | **`D4-59`** · `D4-46` |

**존치 (변경 없음)**: **AC-4-54** (Drawer 코칭 노트 = `Prompt.coachingNote`) — `D4-52` 귀결 (`N4B-06` 해소, **PM-2**). 초판 §14.2 의 "폐기 후보" 표기는 **철회**한다.

### 14.2 폐기 — 없음

### 14.3 신규 (AC-4-125 ~ 138)

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
| **AC-4-134** | **Record Control 변형 연결** — `disabled` = 동의 없음 · 전이 요청 처리 중 / `permission-denied` = 마이크 거부 · 대화 전용 (`N4B-13`). `disabled` 탭 → 요청 0 · `permission-denied` 탭 → 안내 | 상태별 DOM + 요청 로그 | `S4-H2` | — |
| **AC-4-135** 🆕 | **팝업 비모달 접근성** (`D4-54`, AC-4-56 에서 분리): ① 칩 `aria-expanded` + `aria-controls` ② 팝업 = `region` + `aria-labelledby`, **포커스 트랩·`aria-modal` 없음** ③ 열 때 포커스는 칩에 머물고 DOM 순서상 팝업이 칩 바로 다음 ④ `Escape` → 닫힘 + 포커스 칩 (열린 Dialog/Sheet 가 있으면 그쪽 우선) ⑤ 칩 재탭 → 닫힘 ⑥ 바깥 탭 → 닫히고 **탭한 대상의 동작이 그대로 일어난다**(예: `Pause` → 닫힘 + 일시정지 전이 1건) ⑦ 보이는 닫기 버튼·scrim 0 | 키보드 e2e + 포인터 e2e + 요청 로그 | `S4-G1` | — |
| **AC-4-136** 🆕 | **ready 닫기** (`D4-57`, `300:1309`, **PM-8**): ① 닫기 38×38 @(331,66) — `29:76` 동형 ② 탭 → **확인 다이얼로그 없이** `ready → abandoned` 1건 → `/` ③ 로컬 녹음 0 (녹음 전) ④ 요청 실패 시 화면 유지 + 오류 안내(이동 0) ⑤ ready 에 Prompts 칩·책 칩 0 | 요청 로그 + DOM + Playwright 비교 | `S4-F1` | — |
| **AC-4-137** 🆕 | **`See all prompts` → Drawer** (`D4-52`): ① 탭 → 팝업 닫힘 → Drawer 열림(순차, 같은 프레임) ② Drawer = **전체 n개**(n=7 → 7페이지) · 초기 페이지 = `N4B-18` 결정(권장 1번째) ③ Drawer 닫힘 → 포커스 Prompts 칩 ④ `See all` = `<button aria-haspopup="dialog">` · 팝업 안 터치 44 | e2e + n=7 fixture + 포커스 추적 | `S4-G2` | — |
| **AC-4-138** 🆕 | **RecordControl 5변형 시각·이름** — `idle`·`recording`·`paused`·`disabled`·`permission-denied` 가 `163:1590`·`298:1227`/`1236`/`1245` 선언과 일치(`disabled` = opacity .5 + **코어 그림자 0**, `permission-denied` = gray-2 링·코어 + `mic-off`) · 접근성 이름 = Spec §9.1 (`S4B-Q9` 문구) · 변형 선택 순수 함수 unit test | Playwright 비교 5변형 + unit | `S4-F2` | — |

### 14.4 4b AC 재집계

| 구분 | 수 |
|---|---|
| 상위 Plan §16.5.3 4b 목록 | **50** |
| 수정 | **12** (42 · 52 · 53 · 55 · 56 · 63 · 95 · 97 · 99 · 120 · 121 · **46** 개정 1.1) — 수 변동 없음 |
| 존치 | AC-4-54 (초판 폐기 후보 철회) |
| 폐기 | **0** |
| 신규 | **14** (125~138 — 초판 10 + 135·136·137·138) |
| **4b 합계** | **64** · Stage 4 전체 In Scope 113 → **127** |

## 15. Test Strategy (추가분)

- unit: 경과 시간 `mm:ss` 포맷·고정(주입 clock) · **상태 → RecordControl 변형 순수 함수** · 팝업 열림 상태가 전이를 만들지 않음 · 팝업 개수 컷오프(n ≤ 5).
- contract: 신규 0 — `book: null`·`prompts: []` parse 통과 확인.
- mock scenario: §12 신규 6종 결정성.
- e2e: 칩 → 팝업 → `Escape`/바깥 탭/칩 재탭 닫힘 · 바깥 탭 대상 동작 보존(`Pause`) · 팝업 열린 채 Pause/Submit · **`See all` → Drawer → 닫기 → 포커스 칩** · recording·paused 닫기 → 다이얼로그 확인/취소 · **ready 닫기 → 즉시 홈**.
- 시각: ready+닫기 · recording · paused · 팝업(n=5) · Drawer · RecordControl 변형 3 baseline. **`R-BASELINE-1`** — 팝업 전환 완료 후 `settle()`, dev 패널 숨김, 주입 clock(`03:24`).
- manual device: iOS Safari 에서 팝업·Drawer 열린 채 녹음 지속 1회 · 툴바 표시 상태 짧은 세로 1회.

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
| **R4B-09** | AC-4-108 수치 미기록 | `S4-H2` 착수 전 수치 요청 (`§19` 입력 요청) |
| **R4B-10** | 단위 과대 → agent stall | `S4-F` → F1/F2 · **`S4-G` → G1/G2** |
| **R4B-11** 🆕 | 바깥 탭 판정이 이벤트를 삼켜 `Pause`·`Submit` 이 한 번 더 눌러야 동작 | `pointerdown` 캡처에서 닫기만, `preventDefault` 금지 (Spec §15-4) · AC-4-135 ⑥ |
| **R4B-12** 🆕 | iOS Safari `dvh` 에서 짧은 세로가 **기본 경우** — 393×852 baseline 만 통과하고 실기기에서 겹침 | `S4B-Q5` · AC-4-99 ② · manual device 1회 |
| **R4B-13** 🆕 | paused 시간·보조 줄 대비 2.39~2.47 (Figma 그대로) | `S4B-Q7` 가값 등재 — FAIL 사유 아님(`rules/qa.md` §2) |

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

## 18. Handoff to design-agent

개정 1 시점 design-agent 산출물(`stage-4b-design-spec.md`)이 §18.2 질문 1~8 에 **전부 답했다**(Spec §11.1). 남은 design-agent 작업:

1. 체크포인트 결정 후 Spec 반영 — `S4B-Q1`~`Q9` · `N4B-18` · AD 등록 결과 · 가값 `P-26`·`P-27`.
2. `S4B-Q5` ④(짧은 세로 극단) — 디자이너 요청 여부가 정해지면 요청서 개정.
3. 각 단위 구현 후 **Visual Gap 검토**(최우선 규칙 5) — 대상 노드 `300:1309` · `298:1262` · `298:1340` · `296:1210` · `298:1227`/`1236`/`1245` · `88:960`. `AD-S4-17` 은 이때 판정.

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

**입력 요청 (결정 아님)**: AC-4-108 실기기 측정 세부 수치(잠금 구간 청크 수 · 재생 여부 · iOS 버전) — `S4-H2` 착수 전.

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
