# Stage 4b Visual Gap — `S4-H3` (업로드 · 48h · 7일 · 14일 안내) · `S4-H3F` (세션 Toast 3초)

Status: DRAFT — 사용자 결정 대기 (§5)
작성: design-agent, 2026-11-04
Based on: 인계 `docs/qa/stage-4b-handoff.md` `# S4-H3`(H3-1~11) · `# S4-H3F`(H3F-1~7) · 4b Spec §18.3~§18.6 (APPROVED `D4-119`·`D4-120`) · §19 (`D4-128` 로 종결) · 결정 `D4-119`·`D4-120`·`D4-123`·`D4-125`·`D4-128`~`D4-131` · 허용 차이 `AD-S4-14`·`AD-S4-25`·`AD-S4-26` · 직전 검토 `docs/design/stage-4b-visual-gap-h2r.md`

Production Code · Figma · Spec · approvals 수정 없음. 허용 차이는 등록·변경하지 않았다 (후보 수치만 §6).

## 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

- **환경**: 이 검토 단독으로 dev 서버(vite, 포트 **4331**, 5173 아님)를 띄우고 Playwright 번들 Chromium(library 모드). DSF 1 · `reducedMotion: reduce` · dev 패널 `visibility: hidden`(`R-BASELINE-1` ②, init script). 시작 전 4331 리슨 0 · vite/Playwright 프로세스 0 확인. 종료 후 **내가 띄운 vite(pid 48169/48185)만** 종료 → 4331 리슨 0 · headless Chromium 0 확인. 다른 프로세스 kill 0.
- **진입**: 실제 경로만. 앱 시작 안내는 `/auth/log-in?scenario=…` 로 열어 브라우저 seed(`D4-123`)가 런타임 시작 전에 들어가게 했다. 세션 ready = 로그인 → 카드 `Start Session` → `Bedtime` → `Continue`. 이미지 디코드 + 2 rAF 후 측정.
- **Toast 시간**: init script 의 `MutationObserver`(document 전체 subtree)가 `.haru-toast` 노드의 DOM 등장·제거 시각(`performance.now`)과 그 순간 `location.pathname` 을 기록. **잰 값 = DOM 체류 시간**(퇴장 모션 포함)이다 — 타이머 값 + 약 186~192ms.
- **좌표·겹침**: `getBoundingClientRect` · `getComputedStyle`. 메달리온 겹침 = Toast 와 `.haru-session__medallion-ring` 의 **세로 교집합 높이**(min(bottom) − max(top)) — h2r 과 같은 정의. 가림 = 대상 중심 `document.elementFromPoint`.
- **배너 줄 수**: 제목 노드 `Range.getClientRects()` 의 서로 다른 top 개수. 밀림 = 같은 크기·같은 계정에서 배너 없는 Home 과의 `top` 차.
- **원인 토글(테스트 레이어)**: Toast 닫기 버튼 폭은 `page.addStyleTag('.haru-toast .haru-icon-button { flex: none }')` 로 런타임에서만 바꿔 전/후를 쟀다(코드 변경 0).
- **Figma**: `get_metadata` · `get_screenshot` `26:21` 호출이 **권한 오류**("edit access", 2회)로 실패했다. 이번 대상은 Figma 노드가 없는 UI(Spec §18.1 실측: 안내 노드 0)라, Figma 대조는 "Figma 요소(`26:21` 버블 `88:922`/`261:1293` · 캐릭터 `26:22` · 덱 · 탭바 `27:89`)가 움직이거나 가려지는가"를 **DOM 기하**로 판정했다. 노드 좌표 재조회는 하지 못했다(§7).
- 산출물(저장소 밖): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vgh3/impl/` (`*.png` · `results-*.json`), 스크립트 `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vgh3-scripts/` (`measure.cjs` · `extra.cjs` · `extra2.cjs` · `sim.cjs` · `rec568.cjs`).

## 1. Home 7일 배너 (`recorder:local-retention-notice`, `AD-S4-25`)

| 크기 | 배너 bbox | 줄 | 높이 | 버블 밀림 | 캐릭터 밀림 | 덱 트랙 | 탭바 |
|---|---|---|---|---|---|---|---|
| 393×852 | 24,48 345×74 | 2 | 74 | **+74** | **+74** | 0 | 0 |
| 320×852 | 24,48 272×94 | 3 | 94 | **+94** | **+94** | 0 | 0 |
| 600×852 | 84,48 432×74 | 2 | 74 | **+74** | **+74** | 0 | 0 |
| 320×568 | 24,48 272×94 | 3 | 94 | +94 | +94 | **+94** | 0 |

- **`AD-S4-25` 등록 수치(393 +74 · 320 +94 · 600 +74)와 일치** — 3크기 모두 높이 = 34 + 20×줄.
- 320×568 은 덱도 +94 내려간다(짧은 세로에서 덱이 흐름에 있다). 오프라인 캐시 배너도 같은 크기에서 덱 +54 로 같은 거동(실측: 320×568 덱 +54, 320/393×852 덱 0) → 기존 `AD-S4-11` 거동과 같은 종류. 등록 문언에 덱 언급은 없다 → `VG-H3-07`(문서).
- 문구 `Go online before Nov 11 or your recording will be removed.` — 기기 시각 2026-11-04 08:58 KST, seed = 7일+1분 전 → 삭제 예정 = +7일 −1분 → **`Nov 11`** ✓ (`D4-120` Q12 절대 날짜 · 연도 없음). 연도 경계는 브라우저에서 재현하지 않았다(unit `date-format.test.ts`).
- 구성: `role="alert"` · 버튼 = `Dismiss` 1개(38×38) · `Try again` 없음(`D4-119`) ✓. computed: 배경 `rgb(244,241,222)` · 테두리 `rgb(208,204,161)` · radius 22 · padding 16 · `box-shadow: none` · 제목 590 15/20 `rgb(125,106,42)` — 기존 `InlineAlert warning banner` 값 그대로(신규 값 0, 대비는 가값 `P-04`).
- **화면 상태**: 393 은 버블이 캐릭터 이마~눈썹 위로 내려오고 가슴 하트가 카드 뒤로 들어간다. 320 은 얼굴 하반부가 카드 뒤(`G-01` 크기와 같음 — `D4-130` 으로 수용됨).
- 탭 이동(Library → Home) 후 배너 유지 ✓. `Dismiss` → 배너 0 · 버블·캐릭터·덱 bbox 가 배너 없는 Home 과 **완전히 같다** ✓ · 같은 실행에서 탭 이동 후 다시 와도 0 ✓.
- ⚠ `Dismiss` 후 `document.activeElement` = **`BODY`** (4크기 모두) → `VG-H3-04`.
- **`R-SHADOW-1`**: 배너 `box-shadow: none`. `.haru-home-stage`·`__content` `overflow: visible`, `.haru-activity-track` `overflow-x: auto / overflow-y: hidden` — **배너 유무로 computed 가 같다**(4크기). 신규 `overflow` 0.

### 1.1 오프라인 배너와의 우선순위 · 전환 (`D4-120` Q11)

- `activity-cards:offline-cached-card,recorder:local-retention-notice` (393×852): 슬롯의 `.haru-alert` **1개** = `haru-alert--offline` `Go online to start a session`(54, `role="status"`) · warning 배너 0 ✓.
- **실제 브라우저 오프라인**(`context.setOffline(true)`, 7일 배너가 있는 Home): 1.5초 후 · Library 왕복 후 모두 **7일 배너 그대로, 오프라인 배너 0, `Start Session` 활성**. 온라인 복귀 후도 같다. → Mock 덱은 브라우저 연결 상태를 보지 않는다(오프라인 배너는 Mock key 로만 난다). 온라인 복귀 시 7일 배너 재표시는 브라우저에서 재현할 경로가 없다(인계 H3-5 주석과 같음 — unit 증거). → `VG-H3-05`
- **h2r §19.9 측정 항목 — 녹음 종료 직후 오프라인 → Home**: 녹음 2.5초 → `setOffline(true)` → `Submit` → 완료 → `Close session` → `/`. Home 에 **오프라인 배너 0 · `Start Session` 활성**. 세션 화면의 오프라인 Toast 는 0.87초 만에 `Recording submitted` 로 **교체**되었다(Toast 큐 없음 — 기존 동작). → `VG-H3-05`

## 2. 앱 수준 Toast (`AD-S4-26`) — seed 로 실제 재현

### 2.1 높이 · 시간 · 순서 (로그인 화면, Toast y56)

| Toast | 393 높이 | 320 높이 | 버튼 | DOM 체류 | 순서 실측 |
|---|---|---|---|---|---|
| 14일 `uploads.retentionExpired` | **68** (3줄) | 68 | 0 | 4189 ms | 14일(388ms) → 끝난 4ms 뒤 48h ✓ |
| 48h `uploads.stalled` | 76 | **86** | `Try again` 58×44 · `Dismiss` **20×38** | 6191 ms | 48h(387ms) → 끝난 1ms 뒤 크래시 복구 ✓ |
| 크래시 복구 `recovered` | 50 | 68 | 0 | 4187 ms | — |
| 48h `Try again` 오프라인 → `connectivity.offline` | 50 | 68 | 0 | 4188 ms | 48h 즉시 교체 ✓ · 업로드 요청 증가 0 은 e2e 증거 |

- 동시 표시 항상 1개 ✓. `recorder:crash-recovered`+`recorder:local-retention-exceeded` 는 같은 `recorder` 그룹이라 함께 고를 수 없다 → 3종 연속(14일 → 48h → 복구)은 2쌍으로 나눠 확인(쌍마다 순서 ✓, 3종 전체는 unit).
- `Dismiss` → 즉시 닫힘 · 5초 후에도 다음 Toast 0(같은 안내 재표시 0) ✓. tone `neutral` · `aria-live="polite"` · 배경 `rgba(255,255,255,.9)` · 그림자 = `--shadow-glass-rest` 3겹 + inset 2겹 (computed — 기존 Toast 값, 렌더 샘플링 아님).
- ⚠ **48h `Dismiss` 버튼 폭 20(선언 38)** → `VG-H3-01`.

### 2.2 ready 화면에 뜰 때 — 메달리온 겹침 (H3F 보고 5 · 사용자 결정 자료)

로그인 직후 ready 까지 0.8~0.9초라 앱 시작 순차가 ready 위에서 이어진다. Toast y64 (`useToastTopBarInset`), 링 top 76.

| Toast | 393×852 · 393×702 | 320×852 · 320×568 | DOM 체류 (ready) | 닫기 가림 |
|---|---|---|---|---|
| 14일 (문구) | 68 → 겹침 **56** | 68 → **56** | 4183~4186 | 0 |
| 48h (`Try again` + `Dismiss`) | 76 → **64** | 86 → **74** | 6184~6186 | 0 |
| 크래시 복구 (문구) | 50 → **38** | 68 → **56** | 4185~4187 | 0 |
| (참고) 48h 닫기 폭을 38 로 고치면 `[토글 실측]` | 86 → **74** | 104 → **92** | — | — |

- `AD-S4-14` 등록 수치(38 · 56 · 68)는 **세션 화면 Toast** 대상이다. 앱 수준 Toast 가 ready 에 뜨면 **48h 가 64/74 로 등록 최대치 68 을 넘고**, 시간도 3초가 아니라 4초/6초다 → `VG-H3-03`.
- recording · paused 에서는 보류되므로 320×568 recording 스크롤(링 57) 조합은 나지 않는다.

### 2.3 recording · paused 보류 (`D4-120` Q13)

`recorder:crash-recovered,recordings:upload-stalled-48h`, 393×852 — ready 에 48h 가 떠 있는 동안 `Start recording`(t=879ms) → 10초 녹음 → Pause 4초 → `Submit`.

| 시각 | 사건 |
|---|---|
| 393 → 6578 | 48h Toast — 녹음 시작 **전에 떠 있던 것**은 녹음 중에도 6초까지 남는다(Info, 새 표시 아님) |
| 6578 → 14969 | 크래시 복구 **보류** — recording · paused 동안 Toast 0 ✓ (8.4초) |
| 14969 | `Submit` 순간 크래시 복구 Toast 등장 (세션 route) |
| **14973** | `Recording submitted` 등장 → 크래시 복구 **4ms 만에 교체·소실** |

재실행에서도 같은 결과(15017 등장 → **8ms** 소실, 2/2 재현). 안내는 꺼내는 순간 소비되므로 다시 뜨지 않는다 → `VG-H3-02`.

## 3. 세션 화면 Toast `D4-128` (3초 / 6초) · `AD-S4-14` 수치

| Toast | 크기 | bbox | 링 겹침 | DOM 체류 | 가림 |
|---|---|---|---|---|---|
| `connectivity.offline` (ready) | 393×852 | 24,64 345×50 | **38** | 3186 | 닫기 0 |
| 〃 | 320×852 · 320×568 | 272×68 | **56** | 3186 | 0 |
| 〃 (recording, 320×568 · 링 57 스크롤) | 320×568 | 272×68 | **68** (교집합 64~132) | 3190 | 0 |
| `closeFailed` (`sessions:invalid-transition`, `tone=error`, `assertive`) | 393 / 320 | 50 / 68 | 38 / 56 | 3188 / 3186 | 0 |
| `connectivity.online` | 393 / 320 | 50 / 50 | — | 3186 | — |

- **`AD-S4-14` 등록 수치(393 38 · 320 56 · 320×568 recording 68 · 문구 전용 3초)와 일치** ✓. h2r §19.9 `[추정]` 이던 `closeFailed` · `recovered` 높이 = **50/68** 로 확인(추정과 같음).
- 버튼 있는 세션 화면 Toast 는 현재 경로가 없다(세션 Toast 3곳 모두 문구 전용) → 세션 route 의 6초는 앱 48h Toast(6184~6186)로만 관찰.
- 4초 유지 대상 확인: `Recording submitted` 4183~4189 (완료 화면) ✓.
- 관찰: ready 에서 **오프라인 중 닫기** → `closeFailed` 가 아니라 닫기 버튼이 Spinner 로 대기, 온라인 복귀 후 Home 으로 이동하며 세션이 띄운 `You're back online.` 이 **Home 에서 3초**(3186)로 보였다 → `VG-H3-06` (Info).

## 4. `VG-H2R-01` · `VG-H2R-02` 해소 확인 (`D4-125`)

| 항목 | 측정 | 결과 |
|---|---|---|
| `VG-H2R-01` loading 이음매 | `sessions:loading`(생성 1.5초) 겹침. `aria-busy` `MutationObserver`(oldValue) + rAF 매 프레임 샘플 — Home 393×852 · Home 320×568 · 서재 393×852 | 켜짐 **1회**(3/3), 켜진 뒤 꺼질 때까지 0 프레임 **0**(92/92 · 92/92 · 90/90 프레임 연속). h2r 의 14~15ms 끊김 없음 → **해소** |
| `VG-H2R-02` 포커스 스크롤 | 320×568 `recorder:mic-permission-blocked` 자동 시트 → `Not now` | Record y **433 → 433** · 링 76 → 76 · 닫기 y10(가림 0) · 뷰포트 scrollTop 0 · 포커스 = `haru-record` → **해소** |

## 5. Gap 목록

| ID | 대상 | 기대 | 구현 (실측) | Severity | 권고 | 결정 필요 |
|---|---|---|---|---|---|---|
| **VG-H3-01** | 48h Toast `Dismiss` 버튼 | `IconButton md` = `--icon-button-size` 38×38, hit 44 (Stage 1 §9.3) | **20×38** (393: 20.3) — `flex-shrink: 1` 로 줄었다(`.haru-toast__action` 만 `flex: none`). hit 영역 = 26×44. Toast 에 action + dismiss 를 함께 쓴 **첫 Production 사용처**라 이번에 드러났다. 런타임 토글(`flex: none`)로 38×38 복원 확인 — 대신 문구 폭이 18 줄어 Toast 높이 393 **76→86** · 320 **86→104**, ready 겹침 64→74 · 74→92 | **Medium** (터치 타깃 · Shared UI) | `packages/ui` `Toast.css` 에서 닫기 버튼 `flex: none`(신규 토큰 0, Shared UI 수정). 높이 증가를 함께 승인받는다 | **예** |
| **VG-H3-02** | 보류된 앱 안내가 `Submit` 직후 소실 | `D4-120` Q13 · `AD-S4-26` "세션 화면을 떠난 뒤 표시", `D4-117` 복구 안내 1회 | 보류 중이던 크래시 복구 Toast 가 `Submit` 순간 등장 → **4ms / 8ms 뒤 `Recording submitted` 가 교체**(2/2 재현). 안내는 꺼낼 때 소비되어 **다시 뜨지 않는다** → 사용자는 복구 안내를 못 본다. 원인 추정(코드 직독, 런타임 토글 미실시): `capturing` 이 컨트롤러 `completed` 에서 풀리는데, 그 시점에 완료 Toast 가 아직 없어 `useToastPresent` false → 꺼냄 → 같은 tick 의 `toast.show(submitted)` 가 교체. 48h · 14일도 같은 경로 | **Medium** (안내 유실) | development-agent: 보류 해제를 "세션 route 를 떠남" 또는 "완료 Toast 가 사라진 뒤"로 늦춘다(순차 `useToastPresent` 를 그 뒤에 적용). 시각 값 변경 0. e2e: 위 시나리오에서 복구 Toast 가 완료 Toast 뒤에 4초 보이는지 | 아니오 (수정 — Orchestrator 판단) |
| **VG-H3-03** | 앱 수준 Toast 가 ready 에 뜰 때 겹침·시간 | `D4-128` "세션 화면 문구 전용 3초" · `AD-S4-14` 38/56/68 | 14일 56/56 · 48h **64/74** · 복구 38/56, 시간 4.19s / 6.19s (문구 전용도 4초). 48h 320 = 74 는 등록 최대 68 초과 | **Low** | 인계 권고(앱 Toast 는 route 무관 4초 — 순차·결합 이유)에 동의. 수치를 `AD-S4-26` 에 명기해 등록 범위를 맞춘다. VG-H3-01 을 고치면 48h 는 74/92 | **예** |
| **VG-H3-04** | 7일 배너 `Dismiss` 후 포커스 | WCAG 2.4.3 — 닫힌 요소의 포커스가 문서 처음으로 가지 않게 | `activeElement = BODY` (4크기). 키보드 사용자는 다음 Tab 이 문서 처음부터 | **Low** (a11y) | 닫힌 뒤 포커스 = 같은 흐름의 다음 요소(버블 닫기 또는 첫 카드). `InlineAlert` 공통 거동인지 확인 후 feature 쪽에서 지정 | 아니오 |
| **VG-H3-05** | 실제 브라우저 오프라인에서 Home 오프라인 배너 | Q11 — 오프라인이면 오프라인 배너가 슬롯 우선 | Mock 덱은 연결 상태를 보지 않아 `setOffline` 에서 **오프라인 배너 0 · 7일 배너 유지 · `Start Session` 활성**. 녹음 종료 직후 오프라인 → Home 도 같다 | **Info** | Mock key 로만 검증 가능(현행 e2e). 실제 연결 판정은 Http Adapter 의 조회 실패에 달려 있다 → Q11 실연결 거동은 `BACKEND_INTEGRATION_PENDING` 메모로 남길지 plan-agent 판단 | 아니오 |
| **VG-H3-06** | 세션이 띄운 `You're back online.` 이 Home 에서 3초 | `D4-128` "Home 4초 그대로" | 오프라인 닫기 대기 → 온라인 복귀 → Home 이동 중 세션 Toast(3초)가 Home 에 보임 | **Info** | 조치 불요 (드묾 · 세션에서 시작된 사건) | 아니오 |
| **VG-H3-07** | `AD-S4-25` 문언 | 등록: 버블·캐릭터 밀림 | 짧은 세로(320×568)에서는 **덱도 +94** (오프라인 배너도 같은 거동 +54) | **Info** (문서) | 등록 문언에 "≤ 약 627 세로에서 덱 포함" 한 줄 추가 권고 | 아니오 |

Critical · High 없음.

## 6. 등록 허용 차이 수치 대조

| ID | 등록 수치 | 실측 | 판정 |
|---|---|---|---|
| `AD-S4-25` | 393 +74 (2줄) · 320 +94 (3줄) · 600 +74 · 오프라인 우선 · 한 문장 + `Dismiss` | 74 / 94 / 74 · 2/3/2줄 · 오프라인 key 시 1개 · `Dismiss` 1개 | **일치** (덱 거동 문언만 `VG-H3-07`) |
| `AD-S4-14` | Toast y64 · 겹침 393 38 · 320 56 · 320×568 recording 68 · 문구 3초 · 버튼 6초 | 38 / 56 / 68 · 3186~3192ms · (세션 버튼 Toast 경로 없음) | **일치** (세션 화면 Toast 한정) |
| `AD-S4-26` | 48h = `Try again` + `Dismiss` · 14일 = 문구 · recording/paused 보류 · 1개씩 14일 → 48h → 복구 | 구성 ✓ · 순서 ✓ · 보류 ✓ · **보류 해제 시 소실(`VG-H3-02`)** · 닫기 폭 20(`VG-H3-01`) · 수치 미등록(`VG-H3-03`) | **부분 일치** |

## 7. 측정하지 못한 것

| 항목 | 이유 | 대체 |
|---|---|---|
| Figma `26:21` 노드 재조회 · 스크린샷 | MCP 권한 오류(2회) | 안내 노드 없음은 Spec §18.1 실측. 이동은 DOM 기하로 판정 |
| 7일 배너 온라인 복귀 재표시 · 연도 경계 날짜 | Mock 덱이 브라우저 연결을 안 본다 · 기기 시계 고정 경로 없음 | unit (`recording-notices.test.ts` · `date-format.test.ts`) |
| 14일 → 48h → 복구 3종 연속 | 14일·복구가 같은 `recorder` 그룹 | 2쌍 순서 실측 + unit |
| `VG-H3-02` 원인 확정 | 런타임 토글 미실시 | 코드 직독 추정 — development-agent 가 수정 전 재현 테스트로 확정 |
| Discard → Home 경로의 보류 해제 | 이번 범위 밖 | `VG-H3-02` 수정 시 같은 e2e 에 추가 권고 |

## 8. `R-*` 확인

- `R-FIGMA-1`: 색·그림자는 computed 선언값으로 읽었다(렌더 픽셀 샘플링 0). Toast 그림자는 3겹 drop + 2겹 inset 전부 기록.
- `R-SHADOW-1`: 배너 그림자 없음 · overflow computed 불변 · Toast 는 `position: fixed` 오버레이라 overflow 박스 밖.
- `R-BASELINE-1`: H3 · H3F 신규·재생성 baseline 0 (인계 H3-7 · H3F-6). 배너 문구가 실행 날짜를 담아 baseline 대상이 아닌 판단에 동의. 이 검토의 캡처는 저장소 밖에만 있다.

## 9. development-agent 메모 (결정 후)

1. `VG-H3-02` — 보류 해제 시점 수정 + e2e(보류 → `Submit` → 완료 Toast 뒤 복구 Toast 4초).
2. `VG-H3-01` 승인 시 — `Toast.css` 닫기 버튼 `flex: none`. 48h Toast 높이 393 86 · 320 104 로 바뀐다(이번 토글 실측). 관련 e2e 수치 단정 갱신.
3. `VG-H3-04` — 7일 배너 닫힘 후 포커스 지정.
