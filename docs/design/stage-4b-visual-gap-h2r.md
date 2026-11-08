# Stage 4b Visual Gap — `S4-H2R` (Start Session 권한 판정 · 대화 전용 시트) · `D4-121` (세션 Toast 위치)

Status: DRAFT — 사용자 결정 대기 (§5)
작성: design-agent, 2026-11-03
Based on: 인계 `docs/qa/stage-4b-handoff.md` `# S4-H2R`(H2R-1~8) · 4b Spec `docs/design/stage-4b-design-spec.md` §18.1~§18.2 · §18.11 · §7.3 · §8.2 · 결정 `D4-112` · `D4-119` ~ `D4-122` · 직전 검토 `docs/design/stage-4b-visual-gap-h2.md` · Figma `300:1309`(ready+닫기) · `163:2648`(Activity card) · `163:1669`(서재) (조회 2026-11-03)

Production Code · Figma · Spec 수정 없음. 허용 차이는 등록하지 않았다 (후보만, §6).
이번 대상은 **Figma 에 노드가 없는 UI**(Spec §18.1 실측: 권한·마이크 노드 0)다. 그래서 기준은 ① Figma 요소가 움직이거나 가려지지 않는가 ② Spec §18 · 결정과 일치하는가 ③ 기존 상태·컴포넌트 재사용인가이다.

## 0. 측정 방법 (`R-FIGMA-1` ⑤)

- **환경**: 이 검토 단독으로 dev 서버(포트 **4331**, 5173 아님)를 띄우고 Playwright 번들 Chromium(library 모드). DSF 1 · `reducedMotion: reduce` · dev 패널 `visibility: hidden`(`R-BASELINE-1` ②). 시작 전 4331 리슨 0 · Playwright/vite 프로세스 0 확인. 종료 후 **내가 띄운 vite(pid 6997)만** 종료, 4331 리슨 0 확인. 다른 프로세스 kill 0 (내 측정 스크립트 1개가 멈춰 그것만 종료 — 원인 §7).
- **진입**: 실제 경로 — 로그인 → Home → 카드 `Start Session` → Reading Context `Bedtime` → `Continue` → `/session/:id`. 서재는 하단 탭 `Library` → 첫 책 → 시트 `Start Session`. 이미지 디코드 + 2 rAF 후 촬영.
- **판정 중 상태 관찰**: Mock 권한 판정은 즉시 끝나므로 `sessions:loading`(생성 1,500ms 지연)을 겹쳐 `loading` 구간을 늘렸다. 버튼에 `MutationObserver`(속성·자식) + **rAF 매 프레임 `aria-busy` 샘플**을 붙이고 클릭했다.
- **좌표**: `getBoundingClientRect` · 스타일 `getComputedStyle` · 가림 `document.elementFromPoint`(대상 중심) · Toast 밑 요소는 Toast bbox 를 8×4px 격자로 `elementsFromPoint` 해 Toast 를 뺀 첫 요소를 모았다.
- **픽셀 대조**: 채널 최대차 > 16 인 픽셀 수와 bbox (`vgh2r-scripts/cmp.py`). "영역 밖 0" = 해당 UI bbox 를 뺀 프레임이 픽셀 단위로 같다.
- **Figma**: `get_screenshot` `300:1309` · `163:2648` · `163:1669`, `get_metadata` `300:1309`(Medallion Ring y132 · Exit y66 — 상태바 56 포함). Web 에는 상태바·safe-area 가 없어 위 앵커 요소는 Web y + 56 = Figma y (기존 visual-gap 과 같은 조건).
- 산출물(저장소 밖): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vgh2r/` (`impl/*.png` · `impl/results-*.json` · `figma/*.png`), 스크립트 `…/scratchpad/vgh2r-scripts/`.

## 1. 대상별 결과

### 1.1 Start Session 판정 중 `Button loading` (§18.2 ①, AC-4-145 ⑥)

| 경로 · 폭 | 측정 | 결과 |
|---|---|---|
| Home 393×852 · 320×568 · 393(거부 `recorder:mic-permission-denied`) | Reading Context `Continue` 클릭 전/중 프레임 대조 · bbox · 타임라인 | 버튼 bbox 전/중 동일(393: 24,783 345×45 · 320: 24,499 272×45). **버튼 밖 0px** (3건 모두) ✓. 중: `aria-busy=true` · native `disabled` 아님 · 포커스 유지 · Spinner + `Loading` 표기(기존 Stage 1 #22 상태). 새 시각 0 |
| 서재 393×852 · 320×568 | 책 시트 `Start Session` 클릭 전/중 | 버튼 bbox 동일(393: 127,777 234×45 · 320: 127,493 161×45) · `Save` bbox 동일. **버튼 밖 0px** ✓. 바뀐 픽셀 955개 = 버튼 라벨 자리만 |
| 판정 → 생성 이음매 | `aria-busy` 타임라인 | DOM 은 **true → (꺼짐 14~15ms) → true** 로 한 번 끊긴다(Home 3건 · 서재 2건 모두). 같은 구간 rAF 매 프레임 샘플은 끊김 **0 프레임**(Chromium, Mock 즉시 판정) → 이 환경에서는 화면에 나타나지 않았다. → `VG-H2R-01` |

- 거부 경로도 화면 변화 없이 이동한다(§18.2 ① "Home·시트에서 안내하지 않는다") ✓ — 거부 393 의 전/중 대조가 허용 경로와 같다.
- Figma 대조: 버튼이 놓인 Activity 카드 `163:2648` · 서재 시트 카드(`163:1669` 안)의 `Button/card` 는 **Loading 변형이 없다**(§18.1 `[ctx]`) — 기존 명세 상태 재사용이며 허용 차이 대상 아님.

### 1.2 대화 전용 세션 첫 진입 자동 시트 (§18.2 ②③, AC-4-147)

시나리오 `recorder:mic-permission-blocked`(6 크기) · `mic-unavailable`(393×852) · `mic-permission-denied`(320×568).

| 크기 | 시트 | 문단 | 버튼 | 닫힘 후 포커스 |
|---|---|---|---|---|
| 393×852 | 0,637 393×**215** | 345 폭 · **3줄**(60/20) | `Not now` 1개 345×45 | Record (`Microphone is off`) |
| 320×852 | 0,637 320×215 | 272 폭 · **3줄** | 272×45 | Record |
| 320×568 | 0,**353** 320×215 (top ≥ 0) | **3줄** | 272×45 | Record — ⚠ **화면이 19px 스크롤** → `VG-H2R-02` |
| 393×702 · 393×628 · 320×628 | top 487 · 413 · 413, 높이 215 | 3줄 | 1개 | Record (스크롤 0) |

- 문구 = `This session continues without recording. To record, turn on the microphone and start a new session.` — 세 시나리오 같은 문단(`S4B-Q16` ✓). 15/20 · 400 · `rgb(125,146,145)` = `D4-115` 녹음 세션 문단과 같은 스타일. 제목 `Your microphone is off`. **`Talk without recording` 없음**(CP-11 ✓).
- 320 3줄 = Spec §18.2 ③ ⑤ "3줄 이내 권장" 충족 · 시트 높이는 모든 크기에서 215 로 같다(문단 줄 수 불변).
- 닫힘(마우스 `Not now`) → `activeElement` = Record Control(`isRecord` true, `:focus-visible` false — 마우스 경로라 링 없음). 다시 탭 → 같은 문단 시트 → Escape → 포커스 Record ✓ (§18.2 ② · AC-4-147 ③).
- 닫힌 뒤 ready(393×852): Record `permission-denied` 변형 · `Discard` opacity .5 `aria-disabled` · `Submit` opacity 1. **직전 검토의 런타임 모사 프레임(`vgh2/impl/conv-sim.png`)과 픽셀 차 0** → `VG-H2` §1-3 결론(Figma `300:1309` 대비 차이 = Record 안쪽 + `Submit` 만)이 실제 경로로 확인됐다.
- baseline `e2e/__screenshots__/darwin/session-exceptions.spec.ts/s4-session-mic-sheet-conversation.png`(393×215): 육안 — 정착 프레임 · 최종 문구 3줄 · 버튼 1개 · dev 패널 없음. **내 393×852 캡처의 시트 영역과 픽셀 차 0**(max Δ 0) ✓ (`R-BASELINE-1` ①②).
- `R-SHADOW-1`: 새 `overflow`·그림자 요소 0 (시트·버튼 기존).

### 1.3 세션 Toast `D4-121` — `VG-H2-02` 해소 여부

브라우저 `context.setOffline(true)` → `You're offline. Your recording stays on this device.` (ready · recording, 5 크기).

| 크기 | Toast | 상단 줄 | 칩 중심 hit | 닫기 중심 hit | 메달리온 링 | 링과 겹침 |
|---|---|---|---|---|---|---|
| 393×852 | 24,**64** 345×50 | 0~48 | `Prompts` (recording) | `Close session` | 76 · 190 | **38px** |
| 393×702 | 64 · 50 | 0~48 | `Prompts` | `Close session` | 76 · 190 | 38 |
| 393×628 | 64 · 50 | 0~48 | `Prompts` | `Close session` | 76 · **152** | 38 |
| 320×852 | 64 · 272×**68** (2줄) | 0~48 | `Prompts` | `Close session` | 76 · 190 | **56** |
| 320×568 | 64 · 68 | 0~48 (recording 은 −19, §1.2 와 같은 스크롤) | `Prompts` | `Close session` | 76 / 57 · 152 | 56 / **68** |

- 뷰포트 `--below-top-bar` · `inset-block-start` 64px · `--toast-top-bar-block-size` 48px. Toast 표시 전/후 링 · Record bbox 불변(이동 0) ✓.
- **칩·닫기 가로챔 0** (10 케이스 모두 `covered: false`). 추가 확인: 온라인 복귀 Toast(`You're back online.`, y64)가 떠 있는 ready 에서 닫기 중심을 실제 클릭 → `/` 이동 ✓. (오프라인 Toast 중 닫기 클릭은 세션 화면에 남는다 — 오프라인 닫기 동작 자체이며 가림과 무관: `elementFromPoint` = `Close session`. 이번 범위 밖.)
- → **`VG-H2-02` 해소** (가림 0 · 이동 0).
- Toast 밑 요소 = `haru-session__body` · `__medallion` · `__medallion-ring` · 캐릭터 `IMG` 뿐. 393 은 헤드폰·머리 윗부분, 320 2줄은 헤드폰~이마까지 덮는다 · 얼굴(눈) 미포함(`impl/toast-strip.png` 육안).
- ⚠ **구현자 주장 검증 (H2R-4 ⑥)**: "링과 위쪽 **12px** 겹침 — 완료 화면 `D4-103` 과 같은 배치" → **사실과 다르다.** 12 는 Toast top(64)과 링 top(76)의 간격이고, 실제 겹침은 393 **38px**(링 높이의 20%) · 320 **56px**(29%) · 320×568 recording **68px**. 완료 화면(`complete-393x852` · `-320x568`)은 Toast y64 로 **같지만** 메달리온 링이 y**116** 이라 **겹침 0**(Toast bottom 114 → 간격 2). 같은 것은 Toast **y 규칙**뿐이고 결과 배치는 다르다 → `VG-H2R-03`.

### 1.4 재개 거부 시 시트 자동 표시 (H2R-4 ② · §18.2 ④)

- **Spec 대조**: §18.2 ④ 마지막 줄 *"paused 재개 시 거부 → 시트 + `Submit` 로 지금까지 녹음 제출(현행 바)"* · §18.2 ② 표 "자동 표시 조건 ② 녹음 세션에서 녹음 시작이 권한 거부로 끝난 직후 1회" · AC-4-148 ③. 재개는 새 캡처 part 의 **시작**이라 조건 ②에 들어간다 → **명세와 일치**(구현자 임의 판단 아님, 근거 있음).
- 다만 같은 표의 "자동 표시 안 함" 행에 *"ready 가 아닌 상태 · Prompts 팝업·Drawer·Dialog 가 열려 있을 때"* 가 조건 구분 없이 적혀 있다. 문맥상 조건 ①(대화 전용 첫 진입)용이지만 글자 그대로 읽으면 paused 재개 거부(조건 ②)를 막는다 → Spec 문구 모호 `VG-H2R-04`.
- **브라우저 측정 불가**: 재개 거부를 내는 Mock key 가 없다(`mic-permission-revoked` 는 첫 시작에서 거부 · `failNextStart` 는 unit harness 전용). paused 에서 Prompts 팝업이 열려 있을 때 시트가 그 위에 뜨는 모습도 확인하지 못했다(§7).

## 2. Gap 목록

| ID | 대상 | 기대 (Spec/결정) | 구현 (실측) | Severity | 권고 | 결정 필요 |
|---|---|---|---|---|---|---|
| **VG-H2R-01** | 판정 → 생성 사이 `loading` 이음매 | §18.2 ① "확인 탭 → 권한 판정 → 선택 POST → 생성 응답" 동안 연속 `loading` | DOM `aria-busy` 가 14~15ms 꺼졌다 다시 켜진다(5/5 회). Chromium·Mock 에서 rAF 프레임 0 — 화면 미표시. 원인 추정: 판정 끝(`isResolving` false)과 TanStack mutation `isPending` true 사이 렌더 1회 (코드 직독, 런타임 토글 미실시) | **Low** | 실기기(OS 프롬프트 뒤 느린 기기)에서 Spinner 가 1프레임 `Continue` 로 깜빡일 수 있다 → development-agent 가 판정 완료 ~ mutation 시작 사이를 같은 `loading` 으로 잇는다(예: 판정 결과를 받은 시도 번호를 상태로 유지). 시각 값 변경 0 | 아니오 (수정 여부만 Orchestrator 판단) |
| **VG-H2R-02** | 자동 시트 닫힘 → 포커스 이동이 화면을 스크롤 | §18.2 ② "닫힘 후 포커스 = Record Control" (스크롤 언급 없음) · §8.2 세로 규칙 | 콘텐츠 높이 < 약 587 (Record bottom 583 + 여유)에서 `focus()` 가 앱 뷰포트를 **19px 스크롤** — 320×568: Record 433→414 · 닫기 y 10→**−9**(38 중 29만 보임) · 링 76→57. 375×600 · 320×600 · 393×628 은 0. 사용자가 누르지 않은 요소로 화면이 움직이는 것은 이번 자동 시트 경로가 처음 | **Low** | `focus({ preventScroll: true })` 로 이동 0 유지 권고 — Record Control 은 이미 화면에 140/150 이상 보인다. 대안: 현행 유지(포커스 대상을 보이게 하는 브라우저 기본 동작) | **예** (권고안 채택 여부) |
| **VG-H2R-03** | 세션 Toast 가 메달리온 윗부분을 덮는다 | `D4-121` "완료 화면 `D4-103` 방식" · `VG-H2-02` 권고 "메달리온 위쪽과 겹치지만 완료 화면과 같은 배치" | Toast y64 ✓ · 겹침 393 **38** / 320 **56** / 320×568 recording **68**px (4초, 오프라인·복구·공지 대체 Toast). 완료 화면은 겹침 **0**. 인계서의 "12px · 완료 화면과 같은 배치"는 측정과 다르다 | **Low** | 동작은 결정(`D4-121`)대로라 코드 변경 권고 없음. 다만 사용자는 "12px · 완료 화면과 같다"는 전제로 승인했을 수 있으므로 **실측값으로 재확인**받는다. 그대로면 `AD-S4-14` 등록 시 "Toast 가 메달리온 상단 38~68px 를 4초간 덮음"을 명기 | **예** (수치 재확인) |
| **VG-H2R-04** | Spec §18.2 ② "자동 표시 안 함" 행의 적용 범위 | 조건 ①(대화 전용 첫 진입)에만 적용되는 것으로 읽힘 | 구현: 조건 ②(녹음 시작·재개 거부)는 상태·팝업과 무관하게 시트 (§18.2 ④ 와 일치) | Info (문서) | 다음 Spec 개정 때 "자동 표시 안 함" 을 "조건 ① 에 한해" 로 정정. 재개 거부 시 팝업 위에 시트가 겹치는 것은 사용자 탭 직후라 허용 권고 | 아니오 |

Critical · High · Medium 없음.

## 3. 일치 확인 (Gap 아님)

- **Figma 요소 이동 0**: Home·서재 판정 중(버튼 밖 0px) · 세션 Toast 표시 전후(링·Record bbox 불변) · 대화 전용 ready(직전 검토 모사와 픽셀 0).
- **기존 상태·컴포넌트만 사용**: `Button loading` · `MicPermissionSheet`(`Sheet bottom`) · `Toast neutral` · `useToastTopBarInset`. 신규 토큰·신규 CSS 값·신규 `overflow` 0 (인계 H2R-1 "CSS 변경 0" 과 측정이 일치 — 시트·Toast 의 computed 값이 `VG-H2` 측정과 같다).
- 시트 버튼 1개 · `Talk without recording` 제거(CP-11) · 같은 문구 for `denied`/`unavailable`(Q16) · 자동 표시 후 탭으로 다시 열기 가능(`D4-118`).
- 320 문단 3줄 · 짧은 세로(628·568)에서 시트 top ≥ 0.

## 4. Spec · 문서 정정 대상 (이번에 수정하지 않음)

- 4b Spec §18.2 ② "자동 표시 안 함" 행 → 조건 ① 한정 (`VG-H2R-04`).
- `docs/qa/stage-4b-handoff.md` H2R-4 ⑥ "12px 겹침 · 완료 화면과 같은 배치" → 실측 38/56/68px · 완료 화면은 겹침 0 (development-agent 소유 — Orchestrator 경유 정정 요청).
- (이월) `VG-H2` §4 의 §7.1 행 정정 4건은 §18.8 에 반영되어 있다 — 추가 없음.

## 5. 사용자 결정 필요

| # | 질문 | 권고 |
|---|---|---|
| 1 | `VG-H2R-03` 세션 Toast 가 메달리온 윗부분을 **38px(393) · 56px(320) · 최대 68px** 4초간 덮는다(완료 화면은 0). `D4-121` 그대로 둘지 | 그대로 — 칩·닫기 가림 해소가 더 중요하고 얼굴은 덮지 않는다. 수치를 `AD-S4-14` 에 기록 |
| 2 | `VG-H2R-02` 자동 시트 닫힘 후 포커스 이동이 짧은 세로(≤ 약 587)에서 화면을 19px 스크롤하는 것 | `preventScroll` 로 이동 0 |

## 6. 허용 차이 등록 후보 (등록 금지 — 사용자 승인 사항)

| 후보 | 내용 | 조건 |
|---|---|---|
| `AD-S4-14` (최종 배치) | 세션 화면 `Toast neutral` y64 (상단 줄 아래) — 메달리온 상단 38~68px 를 Toast 표시 동안 덮음 · 공지 슬롯(`VG-H2-01` 현행) | 결정 1 후 |
| `AD-S4-16` 범위 개정 | 마이크 시트: 트리거 +1(대화 전용 첫 진입, 앱 실행당 세션별 1회) · 버튼 −1(`Not now` 만) · 문구 변형 +1(대화 전용 3줄) | Spec §18.2 ⑥ 그대로 — 측정상 추가 조건 없음 |

## 7. 측정하지 못한 것

| 항목 | 이유 | 대체 증거 / 절차 |
|---|---|---|
| paused 재개 거부 → 시트 (팝업 열림 포함) | 재개 거부 Mock key 없음(`failNextStart` 는 unit 전용) | unit `session-permission.test.tsx` ③. 브라우저 key 가 생기면 393×852 paused + 팝업 열림에서 시트 겹침·포커스 재측정 |
| 판정 중 OS 프롬프트 위 Spinner · 이음매 깜빡임(`VG-H2R-01`) 실기기 | Mock 권한은 즉시 결정 · 실기기 없음 | 수동: iOS Safari 첫 사용 → `Continue` → 프롬프트 허용 → 버튼이 `Loading` 에서 `Continue` 로 한 번이라도 돌아오는지 화면 녹화 |
| 600+ 폭 | 이번 지시 범위 320/393 | 앱 컬럼 480 — 시트·Toast 는 393 과 같은 규칙으로 예상 |
| 세션 화면 Toast 의 다른 문구(크래시 복구 · 공지 대체 · `closeFailed`) 높이 | 같은 y 규칙 · 이번엔 오프라인/복구만 측정 | 320 에서 2줄이면 겹침 56, 3줄이면 76 — 문구 추가 시 재측정 |

측정 중 사고 1건: 완료 화면 측정 스크립트가 `page.clock` 정지 상태에서 rAF 를 기다려 멈췄다(가짜 시계가 rAF 도 멈춘다). 내 프로세스만 종료하고 `clock.runFor` 로 바꿔 재실행했다 — 결과에 영향 없음.
