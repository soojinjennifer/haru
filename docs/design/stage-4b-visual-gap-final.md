# Stage 4b Visual Gap — 최종 (`S4-H3R` · `S4-K2` · `S4-K2F`) — 4b QA 직전

Status: DRAFT — 사용자 결정 필요 항목 §7 (차단 항목 없음)
작성: design-agent, 2026-11-04 · 추가 §11 (2026-11-04 Figma 재대조) · §12 (2026-11-05 `S4-G2M`·`S4-G2MF` 닫힘 모션 — `VG-G2-10` 해소, 미결 3, 결정 필요 0)
Based on: 인계 `docs/qa/stage-4b-handoff.md` `# S4-H3R` · `# S4-K2` · `# S4-K2F` · 결정 `D4-132`~`D4-135` · 허용 차이 대장 `docs/decisions/stage-4-approvals.md` §4 · 직전 검토 `stage-4b-visual-gap-f1`·`f2`·`g1`·`g2`·`h1`·`h2`·`h2r`·`h3`·`k1` · Figma `300:1309` · `298:1262` · `298:1340` · `296:1210` · `296:1257` · `29:62` · `88:960` · `26:21` (조회 시도 2026-11-04 — **실패**, §0.2)

Production Code · Figma · Spec · approvals 수정 없음. 허용 차이는 등록·변경하지 않았다.

## 0. 측정 방법 (`R-FIGMA-1` ⑤)

### 0.1 환경
- **e2e (Figma 수치 단정 + baseline)**: 다른 Playwright·vite 프로세스 0 을 확인한 뒤 단독 실행 — `playwright test session.spec · session-recording · session-prompts · session-complete · session-notices · session-regression · session-exceptions · shadow · visual` → **346 passed (8.5m), 실패 0, flaky 0**. 서버는 config 의 4319(5173 아님). 실행 후 `git status e2e/__screenshots__` 변경 0(미추적 `session-exceptions.spec.ts/` 는 이전 생성분 그대로) → 재생성 0, `R-BASELINE-1` ⑤ 분해 대상 없음.
- **직접 프로브**: e2e 종료 후 내가 띄운 vite(포트 **4331**, `--strictPort`) + Playwright 번들 Chromium(library 모드), DSF 1 · `reducedMotion: reduce` · dev 패널 `visibility: hidden`(init script, `R-BASELINE-1` ②). 진입은 실제 경로(로그인 → 카드 `Start Session` → `Bedtime` → `Continue`), 이미지 디코드 + `fonts.ready` + 2 rAF 뒤 측정. 끝나고 **내가 띄운 pid 79792(pnpm)·79793(vite)만** 종료 → 4331 리슨 0 · vite/headless 프로세스 0 확인. 다른 프로세스 kill 0.
- **좌표·hit**: `getBoundingClientRect` · `getComputedStyle` · `document.elementFromPoint`. 화살표 hit = 버튼 중심에서 좌·우·위·아래로 0.5px 씩 이동하며 `elementFromPoint` 가 그 버튼(또는 자손)인 마지막 거리를 합산. 막는 요소 = 경계 1px 바깥의 `elementFromPoint` 클래스.
- **원인 토글(테스트 레이어, 코드 변경 0)**: `page.addStyleTag` 로 이번 수정만 되돌려 전/후를 같은 실행에서 쟀다 — `K2F`: `.haru-prompt-carousel__bar .haru-prompt-carousel__track { pointer-events: auto !important }` · `H3R`: `.haru-toast > .haru-icon-button { flex: 0 1 auto !important }`.
- **Toast 시각표**: init script `MutationObserver`(document subtree, childList+characterData)가 `.haru-toast` 문구가 바뀌는 시각(`performance.now`)과 `location.pathname` 을 기록. 잰 값 = DOM 체류(퇴장 모션 포함).
- **메달리온 겹침**: Toast 와 `.haru-session__medallion-ring` 의 세로 교집합 = min(bottom) − max(top) (h2r · h3 와 같은 정의).
- 산출물(저장소 밖): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vgfinal/out/` (`results-*.json` · `drawer-*.png` · `toast-*.png` · `sbs-*.png`), 스크립트 `…/vgfinal/probe.cjs` · `…/vgfinal/sbs.py`, e2e 로그 `…/vgfinal/e2e.log`.

### 0.2 Figma — 이번에도 조회 불가
- `get_metadata 26:21` · `get_metadata 88:960` · `get_screenshot 300:1309` → 3회 모두 *"don't have edit access"* (Debug UUID `43fe1012-…` · `563538b3-…` · `cea7f37b-…`). `VG-F2-00` 이후 지속된다. **이번 문서에 Figma 노드 재조회 값은 없다.**
- 대체 근거 ① **Figma 수치가 박힌 e2e 단정**(이전 검토가 Figma 에서 실측해 넣은 값 — ready `300:1309` · recording `298:1262` · paused `298:1340` · 팝업 `296:1257` · Drawer `88:960` · 완료 `29:62`) 346건 통과. ② **캐시된 Figma 렌더**(2026-11-01 조회분, 콘텐츠 393×796 — 상태바 제외) `scratchpad/probe/out/fig-ready-796.png` · `fig-rec-796.png` 와 같은 크기의 구현 캡처를 픽셀 diff(채널 합 Δ>40) — §3.2.
- 따라서 "Figma 가 그 뒤 바뀌었는가"는 확인하지 못했다(§8).

## 1. `S4-H3R` — 시각 영향 (`D4-132` · `D4-134`)

### 1.1 48h Toast `Dismiss` · 높이 (`VG-H3-01` → `D4-132`)

로그인 화면(Toast y56), 시나리오 `recordings:upload-stalled-48h`.

| 폭 | Toast | `Try again` | `Dismiss` | computed `flex` (Dismiss) | 토글(이전 규칙) |
|---|---|---|---|---|---|
| 393 | 24,56 **345×86** | 58.11×44 | **38×38** | `0 0 auto` | 345×**76** · Dismiss **20.34**×38 |
| 320 | 24,56 **272×104** | 58.11×44 | **38×38** | `0 0 auto` | 272×**86** · Dismiss **20**×38 |

→ `D4-132` 승인 수치(393 86 · 320 104 · 38×38)와 **일치**. 토글로 되돌리면 h3 의 결함 수치가 그대로 재현 → 이 규칙이 원인·해결임을 같은 실행에서 확인.
버튼 없는 Toast(14일 68/68 · 복구 50/68)는 토글 전후 높이 동일 → 영향 범위 = 닫기 버튼이 있는 Toast 뿐(인계 H3R-5 판단과 같음).

### 1.2 ready 화면 겹침 · Figma 요소 이동 (`AD-S4-26` 대조)

로그인 직후 ready 로 진입해 앱 Toast 가 ready 위에 떠 있는 상태(Toast y64, 링 top 76 · 190).

| Toast | 393 높이 → 겹침 | 320 높이 → 겹침 | `AD-S4-26` 등록 | 닫기 가림 |
|---|---|---|---|---|
| 14일 (`recorder:local-retention-exceeded`) | 68 → **56** | 68 → **56** | 56/56 | 0 (`elementFromPoint` = `Close session`) |
| 48h | 86 → **74** | 104 → **92** | 74/92 | 0 |
| 크래시 복구 (`recorder:crash-recovered`) | 50 → **38** | 68 → **56** | 38/56 | 0 |

- **6쌍 모두 등록 수치와 일치.**
- **Figma 요소 이동 0**: Toast 표시 중과 사라진 뒤의 링(393: 101.5,76 190×190) · Record(121.5,621 150×150) · 하단 컨트롤(24,621 345×231) · 버블(32,281.63 329×277) · 상단 줄(24,0 345×48) bbox 가 6조건 전부 **완전히 같다**(Toast 는 fixed portal).

### 1.3 보류 해제 시점 (`VG-H3-02` → `D4-134`)

시나리오 `recorder:crash-recovered,recordings:upload-stalled-48h`, 393×852. ready(t=864) → 녹음 8초 → `Submit`(t=8937).

| 구간 (ms) | 체류 | route | Toast |
|---|---|---|---|
| 431 → 6620 | 6189 | `/auth/log-in` 에서 시작 | 48h (녹음 시작 **전**에 뜬 것 — 녹음 중에도 남는다, §5 `VG-FIN-04`) |
| 6620 → 8937 | — | 세션 | Toast 0 — 크래시 복구 **보류** ✓ |
| 9001 → 13192 | 4191 | `/complete` | `Recording submitted` |
| **13194 → 17380** | **4186** | `/complete` | `We saved what was recorded before HARU closed.` ✓ |

→ h3 의 4ms 유실이 사라졌다. 완료 Toast 가 끝나고 **2ms 뒤** 복구 Toast 가 완료 화면에서 4초 보인다. 완료 화면 Toast 는 `D4-103` 위치(y64, 닫기 아래)라 시각 배치는 기존 `Recording submitted` 와 같다. Discard → Home 경로는 e2e(`session-notices.spec.ts` `S4-H3R` ②)가 통과했다(직접 프로브 안 함).

### 1.4 7일 배너 키보드 닫기 포커스 (`VG-H3-04` → `D4-134`)

`recorder:local-retention-notice` · 393 / 320: 배너 `Dismiss` 에 포커스 → Enter → 배너 0 · `document.activeElement` = `Dismiss` (`haru-icon-button--plain md`, 버블 닫기) — **`BODY` 아님** ✓. 포커스 이동에 `preventScroll` 이 있고 배너 제거 후 버블·캐릭터 bbox 가 배너 없는 Home 과 같다는 것은 기존 e2e(`AC-4-150` "닫기 → 밀림 0") 통과로 확인.

## 2. `S4-K2F` — Drawer 화살표 · 스와이프 (`D4-135`)

시나리오 기본(n=5), recording → `Prompts` → `See all prompts`. 페이지마다 수정 상태(ON)와 토글(OFF)을 같은 실행에서 측정.

| 폭 | Drawer bbox | bar | 화살표 Prev / Next | indicator |
|---|---|---|---|---|
| 393 | 24,499 **345×329** | 44,589 305×40 | 56,597 / 313,597 · 24×24 | y810 h7 (아래 11) |
| 320 | 24,481 272×347 | 44,589 232×40 | 56,597 / 240,597 | y810 |
| 1024 | 296,499 432×329 | 316,589 392×40 | 328,597 / 672,597 | y810 |

→ `AD-S4-7`(폭 = 컬럼) · `D4-70`(329 @393, dots 아래 11) · `D4-69`(아래 24) 그대로.

| 페이지 | ON: Prev hit (가로×세로) | ON: Next | OFF: Prev (막는 요소) | OFF: Next | 기하 ON = OFF |
|---|---|---|---|---|---|
| 1 | **44×44** (`aria-disabled`) | 44×44 | 33.5×44 (`haru-tag`) | 44×44 | ✓ |
| 2 · 3 · 4 | **44×44** | 44×44 | **33.5**×44 (`haru-tag`) | 44×44 | ✓ |
| 5 | **44×44** | 44×44 (`aria-disabled`) | **33.5**×44 (`haru-text … truncate-2`) | 44×44 | ✓ |

(393 · 320 · 1024 세 폭 모두 같은 표.)

- **Figma 요소 이동 0**: 15조건(3폭×5쪽) 전부 Drawer·bar·화살표·pill·note·indicator bbox 가 토글 전후 동일. computed: 요약 트랙 `pointer-events: none` · 상세 트랙 `auto`.
- ⚠ **결함 범위가 인계보다 넓었다**: `K2-D1` 은 "1번째 페이지"로 기록됐지만, 수정 전에는 **1~5쪽 모두** `Previous prompt` 가로 hit 가 33.5 였다(5쪽은 배지가 없어 막는 요소가 문구). 수정은 5쪽 전부를 44 로 복원한다. 활성 상태(2~5쪽)의 손실이 더 실질적이었다 → `VG-FIN-02`(테스트 범위).
- **화살표 동작**: 5쪽에서 `Previous` 중심 **+18px**(이전에 막혀 있던 영역) 클릭 → 4쪽으로 이동 ✓. 1쪽 같은 지점 `elementFromPoint` = `Previous prompt` ✓.
- **스와이프**(3폭 모두): 마우스 — bar 위 −90px → 다음 쪽 ✓, 노트 위 +90px → 이전 쪽 ✓. 터치(CDP `Input.dispatchTouchEvent`) — bar 위 −90 → 다음 ✓, +90 → 이전 ✓. 트랙이 탭을 받지 않아도 이벤트가 캐러셀 루트로 올라간다(인계 K2F 영향 검토와 같음).
- `PromptPill` 이 쓰이는 다른 곳(Home 카드 · Book Detail · 세션 팝업)은 선택자 `.haru-prompt-carousel__bar` 밖이라 영향 없음 — 해당 baseline(`s4-session-prompts` · Stage 3 `visual.spec`) 통과.

## 3. 4b 전 화면 Figma 대조 요약

### 3.1 e2e 증거 (이번 단독 실행 346 passed)

| 화면 | Figma | 기하 단정(통과) | baseline(통과, 재생성 0) | 관련 허용 차이 |
|---|---|---|---|---|
| ready | `300:1309` · `139:2803` | `session.spec` "ready 기하" · AC-4-118 · AC-4-120~122 | `s4-session-ready`(+`-320` · `-no-greeting` · `-long-greeting` · `-reminder`) | `AD-S4-5` · `6` · `9` · `10` · `18` |
| recording | `298:1262` | `session-recording` "recording 기하" | `s4-session-recording`(+`-320`) · `s4-record-control` 5변형 | `AD-S4-13` · `19` |
| paused | `298:1340` | "paused — Figma" | `s4-session-paused` | — (가값 `P-26`·`P-27`) |
| 팝업 | `296:1210` · `296:1257` | "팝업 기하" · 393/796/320/568 | `s4-session-prompts` | `AD-S4-12` · `18` · `20` |
| Drawer | `88:960` | "Prompt Drawer 기하" 320/393/1024 · K2-D1 | `s4-prompt-drawer` | `AD-S4-7` |
| 완료 | `29:62` | "393×852 — Figma `29:62` 대조" · 320×568 | `s4-session-complete` | `AD-S4-1` · `24` |
| 예외 UI | 없음 (C-13) | `session-exceptions` · `session-notices` · AC-4-97 hit-test 13 | `s4-session-discard-dialog` · `-mic-sheet`(+`-conversation`) · `-background-notice` | `AD-S4-4` · `14` · `15` · `16` · `25` · `26` |
| 짧은 세로 | 852 만 | `D4-78`~`D4-85` 묶음 · AC-4-99 5 | — | `AD-S4-18` · `21` · `22` · `23` |
| 그림자 | — | `shadow.spec` 세션 4건 · AC-4-100 | — | — |

### 3.2 캐시 Figma 렌더와 픽셀 대조 (393×796, 보조 근거)

| 화면 | Δ>40 픽셀 | 행 대역 → 원인 |
|---|---|---|
| ready | 14,849 | 301~557 버블 내부 = Mock 문구·pill 줄 수가 Figma 자리표시와 다름(버블 bottom 549→557, 내용 높이 — `D4-21` 식) · 656~665 Record 캡션 글리프 · 733~742 바 라벨(ready 비활성 `D4-12`·`AD-S4-6`) · 749~795 Figma 프레임 모서리 마스크 |
| recording | 5,984 | 22~35 칩·닫기 글리프 렌더(`VG-F2-03`) · 290~311 책 칩 제목(Mock 책) · 354~365 상태 pill 라벨 폭(`VG-F2-03`) · 389~424 경과 시간 값(`03:24`↔`00:00`, `AD-S4-19`) · 733~744 바 라벨 · 749~795 모서리 |

설명되지 않는 대역 0. 링·Record·바·칩의 **위치 이동 대역은 없다**(대역이 문구·글리프 행에만 있다). 산출물 `…/vgfinal/out/sbs-ready.png` · `sbs-recording.png`.

## 4. 이전 Gap 전수 (f1 ~ h3 · k1 — 87건)

상태 정의: **해소** = 결정에 따라 구현이 바뀌었고 측정·테스트로 확인됨 · **등록** = 허용 차이 대장 §4 에 사용자 승인으로 등록 · **결정 종결** = 사용자 결정으로 현행 유지/Spec 정정 등 조치가 끝남 · **Info** = 차이 없음 또는 기록만(조치 불요로 판정된 것) · **미결** = 아직 결정·조치가 없다.

| 문서 | ID | 요지 | 상태 | 근거 |
|---|---|---|---|---|
| f1 | VG-F1-01 | 닫기 X 글리프 Lucide ↔ Figma `29:77` | 해소 | HARU SVG 15×15 · `T-30` (Spec §16.4) |
| f1 | VG-F1-02 | glass IconButton 글리프 색 | 해소 | `D4-62` |
| f1 | VG-F1-03 | 버블 제목 line-height 22 | 결정 종결 (Spec 정정) | Spec §16.1 |
| f1 | VG-F1-04 | tail overhang 10.627 | 결정 종결 (Spec 정정) | Spec §16.2 |
| f1 | VG-F1-05 | 버블↔Record 간격 | Info (차이 없음) | — |
| f1 | VG-F1-06 | 796 미만 압축 없음 | 해소 + 등록 | `D4-68` → `S4-K1` · `AD-S4-18` |
| f1 | VG-F1-07 | Spec 밖 토큰 | 결정 종결 (Spec 등재) | Spec §5.3 · §16.3 |
| f1 | VG-F1-08 | Reading Context legend 중복 | 해소 | `D4-63` |
| f1 | VG-F1-09 | 시간 목록 Back 위치 | 해소 | `D4-64` |
| f1 | VG-F1-10 | Sheet 면 비침 | Info (기존 규칙) | — |
| f2 | VG-F2-00 | Figma MCP 권한 오류 | **미결 (지속)** | 이번에도 3회 실패 (§0) |
| f2 | VG-F2-01 | `permission-denied` 글리프 | 해소 | `VG-G1-06` 에서 닫음 |
| f2 | VG-F2-02 | 경과 시간 숫자 폭 | 등록 | `AD-S4-19` (`D4-67`) |
| f2 | VG-F2-03 | 칩 라벨 폭 | Info | 폰트 렌더 |
| f2 | VG-F2-04 | 칩 line-height 11↔20 | Info (시각 차 0) | `AD-S4-17` 조건 미충족 → 미등록 유지 |
| f2 | VG-F2-05 | 책 칩 표지 | Info | AC-4-126 |
| f2 | VG-F2-06 | ≤686 압축 없음 | 해소 + 등록 | `D4-68` · `AD-S4-18` |
| f2 | VG-F2-07 | Spec 밖 토큰 3 | 결정 종결 | Spec §5.3 `T-31`~`T-33` |
| f2 | VG-F2-08 | 확인 다이얼로그 | 등록 | `AD-S4-4` · `AD-S4-15` · 문구 `D4-65` |
| f2 | VG-F2-09 | `P-26`·`P-27` 미등재 | 해소 | stage-4-approvals §5 등재 |
| g1 | VG-G1-01 | 팝업 기하 | Info (x 는 등록) | `AD-S4-12` |
| g1 | VG-G1-02 | 팝업 면·그림자 | Info | — |
| g1 | VG-G1-03 | `See all` 1px · 밑줄 | 등록 | `AD-S4-20` (`D4-77`) |
| g1 | VG-G1-04 | 팝업 제목 글리프 폭 | Info | 폰트 렌더 |
| g1 | VG-G1-05 | pill 본문 | Info | — |
| g1 | VG-G1-06 | mic-off 글리프 | 해소 | — |
| g1 | VG-G1-07 | 칩 비활성 | 결정 종결 | `D4-58` NB-2 |
| g1 | VG-G1-08 | <796 팝업이 Record 덮음 | 해소 + 등록 | `S4-K1` · `AD-S4-18` |
| g1 | VG-G1-09 | `DESIGN_TOKEN_MAP` 에 T-15~ 없음 | 해소 | `DESIGN_TOKEN_MAP.md` §8 (T-15 행 존재) |
| g1 | VG-G1-10 | bubble gap 5 | Info | — |
| g1 | VG-G1-11 | `See all` pressed 색 | Info | Stage 2 공통 |
| g2 | VG-G2-01 | Drawer 아래 여백 | 결정 종결 | `D4-69` |
| g2 | VG-G2-02 | Drawer 높이 | 해소 | `D4-70` |
| g2 | VG-G2-03 | pill 폭 | 해소 | `D4-71` |
| g2 | VG-G2-04 | 배지 유지 | 결정 종결 | `D4-72` |
| g2 | VG-G2-05 | 1쪽 화살표 양쪽 활성(Figma 자기 불일치) | Info (디자이너 정리 목록) | Gap 아님 판정 |
| g2 | VG-G2-06 | gray-6 · 행간 | 해소 | `D4-73` |
| g2 | VG-G2-07 | Sheet floating | 결정 종결 | `D4-74` |
| g2 | VG-G2-08 | dots 개수 | 결정 종결 | `D4-75` |
| g2 | VG-G2-09 | grabber 주석 | 해소 | S4-G2 후속 |
| g2 | VG-G2-10 | Drawer 닫기 모션 | 해소 (2026-11-05 갱신, §12) | `D4-137`~`D4-139` → `S4-G2M` · `S4-G2MF` · 측정 §12.2 |
| g2 | VG-G2-11 | 화살표 대비 | 결정 종결 (가값) | `D4-76` `P-02` |
| g2 | VG-G2-12 | 320 폭 2줄 | Info | — |
| h1 | VG-H1-01 | 스티커 제목 14 | 해소 | `D4-90` |
| h1 | VG-H1-02 | 완료 Toast 가 상단 가림 | 해소 | `D4-89` · `D4-103` |
| h1 | VG-H1-03 | 버블 보조 줄 누락 | 해소 | `D4-87` · `D4-94`·`95`·`98` |
| h1 | VG-H1-04 | 완료 화면 닫기 동작 | 해소 | `D4-86` |
| h1 | VG-H1-05 | 재진입 버블 | 해소 | `D4-88` |
| h1 | VG-H1-06 | 미완료 세션 직접 진입 | 해소 | `D4-91` · `D4-113` |
| h1 | VG-H1-07 | `AD-S4-8` 기록 불일치 | 결정 종결 | `D4-92` (철회, 링 150) |
| h1 | VG-H1-08 | 글자 폭 | Info | — |
| h1 | VG-H1-09 | 버블 2행 y+1 | Info | — |
| h1 | VG-H1R-01 | Toast 가 스티커 가림 | 해소 | `D4-100` |
| h1 | VG-H1R-02 | 6× 잔여 1프레임 | 등록 | `AD-S4-24` (`D4-107`·`108`) |
| h1 | VG-H1R-03 | 부제 박스 16↔14 | 결정 종결 | `D4-102` |
| h1 | VG-H1F-01 | reduce 겹침 | 해소 | `D4-106` |
| h1 | VG-H1F-02 | C-3 앞 빈 슬롯 | 해소 | `D4-105` |
| h2 | VG-H2-01 | 공지 슬롯 거의 안 보임 | 등록 | `D4-121` 현행 · `AD-S4-14` |
| h2 | VG-H2-02 | 세션 Toast 상단 가림 | 해소 + 등록 | `D4-121` → `D4-124` → `D4-128` · `AD-S4-14` |
| h2 | VG-H2-03 | 마이크 시트 버튼 1개 | 결정 종결 | `D4-112` · `D4-119` CP-11 · `AD-S4-16` |
| h2 | VG-H2-04 | Spec §7.1 표 결정 불일치 | 결정 종결 (Spec 정정) | Spec §18.8 (`D4-119` 승인) |
| h2 | VG-H2-05 | 공지 슬롯 시각 계열 · Lucide 닫기 | 결정 종결 | `D4-121` "그대로" · `AD-S4-14` |
| h2r | VG-H2R-01 | loading 14ms 끊김 | 해소 | `D4-125` (h3 §4 실측) |
| h2r | VG-H2R-02 | 포커스 스크롤 19px | 해소 | `D4-125` (h3 §4 실측) |
| h2r | VG-H2R-03 | 세션 Toast 메달리온 겹침 | 등록 | `D4-128` · `AD-S4-14` |
| h2r | VG-H2R-04 | Spec §18.2 "자동 표시 안 함" 범위 문언 | **미결 (문서)** | Spec 760행 그대로 |
| h3 | VG-H3-01 | 48h `Dismiss` 20×38 | 해소 (이번 측정 §1) | `D4-132` |
| h3 | VG-H3-02 | 보류 안내 유실 | 해소 (이번 e2e) | `D4-134` |
| h3 | VG-H3-03 | 앱 Toast ready 겹침·시간 | 등록 | `D4-133` · `AD-S4-26` |
| h3 | VG-H3-04 | 배너 닫기 후 포커스 BODY | 해소 (이번 측정 §1) | `D4-134` |
| h3 | VG-H3-05 | 실제 오프라인에서 Home 배너 | Info (`BACKEND_INTEGRATION_PENDING` 메모 여부는 plan-agent) | — |
| h3 | VG-H3-06 | 세션 online Toast 가 Home 에서 3초 | Info (조치 불요) | — |
| h3 | VG-H3-07 | `AD-S4-25` 문언 | 해소 (대장 문언 보강) | `D4-134` |
| k1 | VG-K1-01 | safe-area 에서 압축 미작동 | 해소 | `D4-79` |
| k1 | VG-K1-02 | ready 바 잘림 | 해소 | `D4-78` |
| k1 | VG-K1-03 | 스크롤 힌트 소실 7px 대역 | 등록 (범위) | `AD-S4-18` |
| k1 | VG-K1-04 | 포커스 링 직각 | 등록 (범위) | `AD-S4-18` |
| k1 | VG-K1-05 | 702 경계 비단조 점프 | **미결 (실기기 `K1-8` 대기, NOT VERIFIED)** | — |
| k1 | VG-K1-06 | 인계 정정 3건 | Info (문서) | — |
| k1 | VG-KF-01 | 컨테이너 쿼리 미지원 | 결정 종결 | `D4-83` (iOS ≥ 16) |
| k1 | VG-KF-02 | ready 힌트 소실 대역 | 등록 (범위) | `AD-S4-18` |
| k1 | VG-KF-03 | 627 이하 바 도달 불가 | 해소 + 등록 | `D4-82` · `AD-S4-23` |
| k1 | VG-KF-04 | 628 간격 0 | 등록 | `D4-84` · `AD-S4-22` |
| k1 | VG-K1S-01 | 스크롤 끝 포커스 링 | 등록 (범위) | `D4-93` · `AD-S4-23` |
| k1 | VG-K1S-02 | `/complete` 스크롤 승계 | 해소 | `S4-H1` e2e |
| k1 | VG-K1S-03 | 393×460 첫 화면 힌트 | 결정 종결 (지원 범위 밖) | `D4-83` |
| k1 | VG-K1S-04 | 클래식 스크롤바 가로 넘침 15 | **미결 (Stage 8 이월)** | `WORKFLOW_STATE.md` |

**집계 (87건)**: 해소 **35** (그중 등록 병행 6) · 등록 **12** · 결정 종결 **17** · Info **18** · **미결 5** — `VG-F2-00`(Figma 권한) · `VG-G2-10`(Drawer 닫기 모션, 결정 기록 없음) · `VG-H2R-04`(Spec 문언) · `VG-K1-05`(실기기) · `VG-K1S-04`(Stage 8 이월).
> **갱신 (2026-11-05, §12)**: `VG-F2-00` 해소(§11.3) · `VG-G2-10` 해소(§12) → 해소 **37** · 등록 12 · 결정 종결 17 · Info 18 · **미결 3** (`VG-H2R-04` · `VG-K1-05` · `VG-K1S-04`). 아래 문장은 작성 당시 기준이다.

미결 5건 중 **Figma 와의 시각 어긋남은 0건**이다 — `VG-G2-10` 은 Figma 에 모션 정의가 없고(Reactions 비노출), 나머지는 권한·문서·실기기·이월 항목이다.

## 5. 신규 Gap

| ID | 대상 | 기대 | 실측 | Severity | 권고 | 결정 필요 |
|---|---|---|---|---|---|---|
| **VG-FIN-01** | 인계·AC 증거표의 `test.fail` 기술 | 인계 K2-3(AC-4-99 행) · K2-4 · K2F "`test.fail` 1건(K1-3 320×568)만 남음" | `e2e/*.ts` 에 `test.fail` · `fixme` · `skip` **0건**(grep). 이번 346건 실행에도 expected-failure 0. K1-3 의 `test.fail` 은 이미 `D4-82` 단계에서 교체됐다(인계 754행 "`test.fail` 교체 1") | Info (문서) | QA 가 AC-4-99 판정 시 "K1-3 디자이너 대기"를 잔여로 세지 않도록 인계 K2-3 · K2F 행 정정(development-agent/Orchestrator) | 아니오 |
| **VG-FIN-02** | `K2-D1` 회귀 테스트 범위 | 수정이 지키는 범위 = 1~5쪽 `Previous` | 수정 전 결함은 **1~5쪽 전부** 33.5(§2). e2e "K2-D1" 은 1쪽만 잰다(인계 K2F). 지금은 같은 규칙 하나가 전 페이지를 고치므로 통과하지만, 페이지별 쌓임이 바뀌는 회귀는 놓친다 | Low (테스트) | e2e 에 활성 페이지(2쪽 이상) 1건 추가 권고. 시각·코드 변경 0 | 아니오 |
| **VG-FIN-03** | 결정 문서 표기 | 대장 = 실제 상태 | ① approvals §4 제목 *"등록 4건 · 무효 2건 · 승인 대기 4건"* 이 현재(등록 다수 · 승인 대기 0)와 다르다 ② `AD-S4-11`~`26` 행이 `§4.1 AD-S4-7 ~ AD-S4-10` 표 안에 이어 붙어 있다 ③ Spec §19 제목 *"DRAFT (사용자 결정 대기)"* — 본문은 `D4-128` 로 종결 | Info (문서) | Orchestrator 가 표기만 정정(내용 변경 0) | 아니오 |
| **VG-FIN-04** | 녹음 시작 전에 뜬 앱 Toast 가 recording 화면에 남음 | `AD-S4-26` 문언 "recording/paused 화면 동안 보류" | 보류는 **새 표시**에만 적용된다. ready 에서 이미 떠 있던 48h Toast 는 녹음 시작 뒤에도 남은 시간(최대 6초)만큼 recording 화면 위에 있다(§1.3: 864 녹음 시작 → 6620 퇴장). h3 §2.3 에서 Info 로 관찰된 것과 같고 이번 수정과 무관 | Low | ⓐ 현행 + `AD-S4-26` 문언에 *"이미 표시 중인 Toast 는 남은 시간만큼 유지"* 한 줄 보강(권고) ⓑ 녹음 시작 시 앱 Toast 를 닫는다(동작 변경 — 48h `Try again` 이 사라짐) | **예** (문언 보강도 대장 수정이라 사용자 승인) |

Critical · High · Medium 없음. `S4-H3R` · `S4-K2F` 의 시각 변화는 승인 수치(`D4-132`) 외 0.

## 6. 허용 차이 대장 §4 — 실측 대조

| ID | 등록 수치 | 이번 실측 | 판정 |
|---|---|---|---|
| `AD-S4-26` | ready 겹침 393/320: 14일 56/56 · 48h 74/92 · 복구 38/56 · 4초/6초 · 보류 · 1개씩 | 56/56 · **74/92** · 38/56 · 48h 6189ms · 완료 Toast 4191 · 복구 4186ms · 보류 ✓ · 순차 ✓ | **일치** (문언 보강 후보 `VG-FIN-04`) |
| `AD-S4-25` | 393 +74 · 320 +94 · 600 +74 · 320×568 덱도 +94 | 이번 프로브 안 함 — e2e AC-4-150 "높이 = 34 + 20×줄 · 밀림 = 높이 · ≤ 94" 통과 · h3 실측과 같음 | 일치 (e2e) |
| `AD-S4-14` | 세션 Toast 38 · 56 · 320×568 rec 68 · 3초/6초 | 이번 변경 범위 밖 — e2e `session-notices` · `session-exceptions` 통과 | 일치 (e2e) |
| `AD-S4-7` | Drawer 폭 = 컬럼 (393 345) | 345 · 272 · 432 | 일치 |
| `AD-S4-18` · `21` · `22` · `23` | 짧은 세로 | e2e `D4-78`~`D4-85` 묶음 · AC-4-99 통과 | 일치 (e2e) |
| `AD-S4-1` · `4` · `5` · `6` · `9` · `10` · `11` · `12` · `13` · `15` · `16` · `19` · `20` · `24` | 각 등록값 | 해당 기하·baseline e2e 통과(§3.1). 이번 변경이 닿지 않는 화면 | 일치 (e2e) |
| `AD-S4-17` | 조건부 · 미등록 | `VG-F2-04` 대로 시각 차 0 → 계속 미등록 | 해당 없음 |

등록 수치와 다른 실측 **0건**.

## 7. 사용자 결정 필요

1. **`VG-FIN-04`** — 녹음 전에 뜬 앱 Toast 가 recording 화면에 남는 것: ⓐ 현행 + `AD-S4-26` 문언 1줄 보강(권고) / ⓑ 녹음 시작 시 닫기.
2. ~~**`VG-G2-10`**~~ → `D4-137`~`D4-139` 로 결정·구현, §12 에서 종결 (2026-11-05). (원문) Drawer 닫기 모션: g2 권고 ⓐ 현행(`translateY(100%)`, reduce = fade)을 결정으로 기록할지. Figma 에 모션 정의가 없어 허용 차이 대상은 아니다 — Orchestrator 기록만으로 닫을 수 있다.
3. (참고, 결정 아님) `VG-F2-00` — Figma 파일 MCP 읽기 권한. 4b QA 의 AC-4-95 "Figma 대조"는 이번에도 **캐시 렌더 + Figma 수치 e2e** 로만 가능하다. 직접 재조회가 필요하면 파일 공유 권한 확인이 필요하다.

## 8. 측정하지 못한 것

| 항목 | 이유 | 대체 |
|---|---|---|
| Figma 노드 재조회(8개 노드) | MCP 권한 오류 3회 | 캐시 렌더(2026-11-01) + Figma 수치 e2e |
| 2026-11-01 이후 Figma 변경 여부 | 위와 같음 | 없음 — QA 보고 시 한계로 명시 권고 |
| Discard → Home 보류 해제 | 직접 프로브 안 함 | e2e `S4-H3R` ② 통과 |
| 7일 배너 600·320×568 재측정 | 이번 변경 범위 밖 | e2e AC-4-150 · h3 §1 |
| 실기기(iOS Safari · safe-area · VoiceOver) | 환경 없음 | `NOT VERIFIED` 유지(`K1-8`) |
| 터치 스와이프의 실제 손가락 관성 | CDP 합성 터치만 | 합성 터치 4방향 통과 |

## 9. `R-*` 확인

- `R-FIGMA-1`: 수치는 전부 computed · bbox 선언값. 렌더 픽셀은 §3.2 보조 대조에만 썼고 색 판정에는 쓰지 않았다. ⑤ 인계 수치(86/104 · 38 · 74/92 · hit 44)는 옮겨 적지 않고 같은 조건에서 다시 쟀다 — 전부 일치. 단 인계의 "1번째 페이지" 범위 기술은 실측과 달랐다(§2).
- `R-SHADOW-1`: 이번 변경에 새 `overflow` · 새 그림자 0. Drawer 화살표 영역은 `overflow` 박스 경계와 무관(`shadow.spec` · AC-4-100 통과).
- `R-BASELINE-1`: 재생성 0 · 변경 0. 이 검토의 캡처는 저장소 밖에만 있다.

## 10. development-agent 메모 (결정 후)

1. `VG-FIN-02` — `session-regression.spec.ts` K2-D1 에 활성 페이지(2쪽) `Previous` 가로 hit ≥ 44 단정 1건 추가(되돌림 시 33.5 로 실패 확인).
2. `VG-FIN-01` — 인계 K2-3 AC-4-99 행 · K2F 검증 행의 `test.fail` 기술 정정.
3. `VG-FIN-04` ⓑ 를 고른 경우에만 동작 변경 — ⓐ 면 코드 변경 0.

## 11. 추가 — Figma 직접 재대조 (AC-4-95, 2026-11-04 접근 복구 후, design-agent)

§0.2 · §8 의 "Figma 노드 재조회 불가" 를 해소하기 위한 추가 절이다. 앞 절(§0~§10)의 수치·판정은 바꾸지 않았다. Production Code · Figma · approvals 수정 0, Playwright 실행 0(재조회만으로 판정 가능).

### 11.1 방법

- 접근: Figma MCP `sessionId e76ceca0-…` — 이번에는 **오류 0** (`VG-F2-00` 의 권한 오류 재현 안 됨).
- **선언값**(`R-FIGMA-1` ①②): `get_metadata`(자식 구성 · x/y/w/h) — `300:1309` · `298:1262` · `298:1340` · `296:1210` · `29:62` · `88:960` · `26:21` · Design Guide `88:721`(Bubble set) · `17:20`(Button set) · `139:2734`(Title set). `get_design_context` — `88:960` · `296:1257` (면 · radius · padding · gap · 그림자 겹 · 타이포).
- 대조 기준: 각 노드를 마지막으로 실측해 문서에 남긴 값 — `stage-4-session-figma-audit.md` §4(`88:960`) · `stage-4b-visual-gap-g1.md` `[ctx][var]`(`296:1257`) · `stage-3-home-figma-audit.md` §10.1(`26:21`, 2026-10-05 2차) · 4b Spec §1 F-1(`296:1257` 329×293) · audit 표(`88:721` 368×599 3변형 · `17:20` 9변형).
- **렌더 보조**(색 판정에는 쓰지 않음): `get_screenshot`(393×852, DSF 1)을 내려받아 2026-11-01~03 캐시와 **MD5** 비교. 캐시가 없는 노드는 선언값으로만 판정.
- 산출물(저장소 밖): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/fig1104/` (`*.png` 8장).

### 11.2 결과

| 노드 | 선언값 대조 (metadata · ctx) | 렌더 MD5 vs 캐시 | 판정 |
|---|---|---|---|
| `300:1309` ready | 자식 7 · Bubble `300:1313` 34,336 329×258 · Record 122,621 150×150 · After_record 67,789 279×45 · Exit 331,66 38×38 | `ec48ffb2…` = 11-01 `figma-ready.png` · 11-03 `vgh2` · `vgh2r` **동일** | 변경 없음 |
| `298:1262` recording | 칩 24,66 117×36 · State pill 116×32 · 경과 텍스트 133×41 · Prompt box 82,337 233×40 · Record · After_record 동일 | `6d192d84…` = 11-01 `figma-recording.png` · 11-03 **동일** | 변경 없음 |
| `298:1340` paused | 칩 · pill 96×32 · `Tap the button to keep recording` 201×18 · Prompt box 80,337 | `b3c709d5…` = 11-03 `vgh2` **동일** | 변경 없음 |
| `298:1245` (paused 컨트롤 조각) | — | `2533f8eb…` = 11-03 **동일** | 변경 없음 |
| `296:1210` + `296:1257` 팝업 | 팝업 34,328 **329×293** · pill 297×38 ×5 · `300:1308` 297×17 · ctx: gap 6 · px16 py14 · radius 22 · 면 `glass-fill-strong` · drop 1겹 `0 6 4` + inset 2겹 · 제목 Semibold 16/22 · `See all` Semibold 14 underline `from-font` — g1 `[ctx]` 와 **문자 단위 동일** | 캐시 없음 | 변경 없음 |
| `88:960` Drawer | 353×331.765 · 자식 6 블록 동일 치수 · ctx: radius 30 · `white/-86%` + blur 12 · drop 3겹 + inset 2겹 · pt10 pb18 px20 gap10 · 핸들 40×4 · 제목 Bold 17/22.1 (끝 공백 유지) · 부제 13/18.85 · pill 310×40 · 노트 radius 16 · Pagenation 46×7 — audit §4 와 **동일** | 캐시 없음 | 변경 없음 |
| `29:62` 완료 | 자식 구성 · Sticker 68,100 257×64 · 링 150/136 · Feedback Card 11,521 370×302 · Bubble `88:929` 297×130 · `29:85` 문구 `Day 12 · keep the streak going`(`D4-2` 미채택 그대로) | `abcba7c8…` = 11-01 `h1/figma-29-62.png` **동일** | 변경 없음 |
| `26:21` Home | 캐릭터 24,85 357×442 · Streak 188,68 145×34 · Bubble `261:1293` 39,107 303×96 · Deck Dots 181.5,734 · Pagenation `261:1233` 174,717 46×7 · Tab Bar 24,766 345×70 — 2026-10-05 2차 실측과 **동일** | 캐시 없음 | 변경 없음 |
| `8:2` `88:721` · `17:20` · `139:2734` | 368×599 3변형 · 9변형(Glass 4 · Accent 5) · Title 2변형 — audit 표와 동일 | — | 변경 없음 |

**2026-11-01 이후 Figma 변경 0건.** 렌더 캐시가 있는 5개 노드는 바이트 단위로 같고, 나머지 노드는 선언값이 마지막 실측 기록과 같다. 따라서 §3 의 "Figma 수치 e2e + 캐시 렌더" 대조 결과는 **현재 Figma 기준으로도 유효**하다.

### 11.3 앞 절 정정

| 위치 | 기존 | 이번 |
|---|---|---|
| §0.2 · §8 "Figma 노드 재조회 불가" · "11-01 이후 변경 여부 확인 못 함" | 한계로 기록 | **해소** — §11.2 |
| §4 `VG-F2-00`(Figma 권한) 미결 | 미결 | **해소 (2026-11-04 접근 복구)** — 미결 집계 5 → **4** |
| §4 `VG-G2-10` 미결 | 결정 기록 없음 | `D4-137`(2026-11-04)로 결정됨 → 명세 4b Spec **§20**(DRAFT). 구현·검토 후 종결 |
| §7-3 (참고) 파일 권한 확인 필요 | — | 불필요 |

신규 Gap 0. 허용 차이 등록·변경 0.

### 11.4 측정하지 못한 것

- `296:1210` · `88:960` · `26:21` 은 11-01 이전 렌더 캐시가 없어 렌더 비교를 하지 않았다(선언값만). 이번 렌더를 위 폴더에 남겨 다음 대조의 기준으로 쓸 수 있다.
- Prototype Reactions(모션 포함)는 MCP 로 노출되지 않는다 — `D4-137` 모션은 계속 Figma 근거 없음.

## 12. 추가 — `S4-G2M` · `S4-G2MF` Prompt Drawer 닫힘 모션 (2026-11-05, design-agent)

대상: 4b Spec §20 (APPROVED `D4-138`) · 결정 `D4-137` ~ `D4-139` · 인계 `# S4-G2M` · `# S4-G2MF`. Figma 에는 모션 정의가 없다(Reactions 비노출, §11.4) — 판정 기준은 Spec §20.8 과 `R-SHADOW-1` · `R-BASELINE-1` 이다. Figma 재조회는 하지 않았다(노드 변경 대상 없음). Production Code · Figma · Spec · approvals 수정 0, 허용 차이 등록·변경 0.

### 12.1 측정 방법 (`R-FIGMA-1` ⑤)

- **e2e (단독)**: 다른 Playwright·vite 프로세스 0 확인 후 `prompt-drawer-close · session-prompts · session-exceptions · session · library · onboarding · visual · shadow · session-regression` → **367 passed (9.6m), 실패 0 · flaky 0**. 서버는 config 4319. 실행 후 `git status e2e/__screenshots__` 변경 0(미추적 `session-exceptions.spec.ts/` 는 기존분) → baseline 재생성 0. `grep test.fail|fixme|skip e2e/*.ts` = **0건**.
- **직접 프로브**: 내가 띄운 vite(포트 **4333**, `--strictPort`) + 번들 Chromium, DSF 1, dev 패널 `visibility: hidden`(`hideDevPanel`). 실제 경로(로그인 → `Start Session` → `Bedtime` → `Continue` → `Start recording` → `Prompts` → `See all prompts`)로 진입. 주입 시계(`page.clock`)를 멈춰 **언마운트 타이머(240ms)를 정지**시키고, `.haru-sheet--closing` 이 붙는 순간 `MutationObserver` 콜백에서 시트·scrim 애니메이션을 pause → `currentTime` 을 **t = 0, 20, … 220, 239.99ms** 로 seek 하며 매 프레임 전체 뷰포트를 찍었다.
  - **시트 기여** = 같은 정지 프레임에서 시트만 `visibility: hidden` 으로 뺀 프레임과의 전체 프레임 채널 차(최댓값 · 채널 차 > 5 행 범위). 면 + 그림자가 화면에 남긴 양이다(런타임 토글, `R-BASELINE-1` ⑥).
  - **되튐** = keyframe 끝(239.99) 프레임 ↔ `finish()` 뒤 정적 `.haru-sheet--closing` 프레임. **언마운트 단절** = 정적 끝 프레임 ↔ 시계 300ms 진행 후 언마운트(시트·scrim DOM 0) 프레임. 둘 다 **전체 프레임**(인계의 하단 120px 띠보다 넓다).
  - **열림 참조(Q2)**: 같은 방식으로 `haru-sheet--open` 마운트 순간 `haru-sheet-in` 을 잡아 같은 t 로 seek.
  - **공유 `Sheet` 다른 사용처**: 닫힘 t=120 정지 프레임을 찍고, 같은 프레임에서 **`inert` 제거 + `aria-modal="true"` 복원**만 한 뒤 다시 찍어 채널 차를 쟀다(속성이 그리는 것을 바꾸는가). 끝 값은 `finish()` 뒤 computed transform 의 `m42`.
- 정적 확인: `Sheet.css` · `Sheet.tsx` · `component/index.css` 직독, `[inert]` · `[aria-modal]` · `:modal` 을 쓰는 CSS 선택자 grep(`apps/web/src` · `packages/ui/src`) = **0건**.
- 산출물(저장소 밖): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/g2m/out/` (`results-74085.json` · `close-no-preference-t120.png` · `close-reduce-t120.png` · `open-t0.png`), 스크립트 `…/g2m/probe.spec.ts` · `…/g2m/probe.config.ts`, e2e 로그 `…/g2m/e2e.log`. 끝나고 **내가 띄운 vite(pid 74016)만** 종료 → 4333 리슨 0 · vite/Playwright 프로세스 0. 다른 프로세스 kill 0, 5173 미사용.

### 12.2 닫힘 프레임 연속성 (no-preference)

393×852 (높이 329, 열린 top 499):

| t (ms) | 0 | 20 | 40 | 60 | 80 | 100 | 120 | 140 | 160 | 180 ~ 239.99 |
|---|---|---|---|---|---|---|---|---|---|---|
| 시트 top | 499 | 573.6 | 652.4 | 726.7 | 783.5 | 820.7 | 844.0 | 858.8 | 868.3 | 874.2 → **880** |
| 화면 안 카드 띠 | 353 | 278 | 200 | 125 | 68 | 31 | 8 | **0** | 0 | 0 |
| scrim opacity | 1 | 0.80 | 0.60 | 0.40 | 0.25 | 0.16 | 0.09 | 0.06 | 0.03 | 0.015 → 0 |
| 시트 기여 max | 146 | 141 | 147 | 139 | 159 | 129 | 77 | **3** | **1** | **0** |

| 뷰포트 | 높이 | 끝 top (= innerHeight + 28) | 정적 translateY (= 높이 + 24 + 28) | 카드가 화면을 벗어나는 t | 시트 기여 ≤ 5 / = 0 시작 t | 되튐 (끝 ↔ 정적) | 언마운트 단절 (전체 프레임) |
|---|---|---|---|---|---|---|---|
| 393×852 | 329 | 880 | 381 | 120 ~ 140 | 140 / 180 | **max 0** | **max 0 · over 0** |
| 320×568 | 347 | 596 | 399 | 120 ~ 140 | 140 (4) / 200 | **max 0** | **max 0 · over 0** |
| 1024×768 | 329 | 796 | 381 | 120 ~ 140 | 140 / 180 | **max 0** | **max 0 · over 0** |

- **띠 0**: 카드는 t≈130ms 에 화면 밖으로 나가고, 그 뒤 남는 것은 위쪽 그림자 번짐뿐이며 채널 차 **≤ 4**(기준 5 = `VISUAL_THRESHOLD_FRAME` 0.02 ≈ 5.3 이하) → 180~200ms 에 0. 이전(`S4-G2M` 단계 inset 만) 언마운트 프레임 잔여 max 7~8 은 **전체 프레임에서도 0** 으로 재현되지 않는다.
- **되튐 0**: top 은 13개 샘플에서 단조 증가, keyframe 끝 = 정적 값(세 뷰포트 프레임 차 0).
- **언마운트 단절 0**: 정적 끝 ↔ 언마운트 전체 프레임 차 0 — "툭 사라짐"(`VG-G2-10` 원 결함)이 없다.
- 닫힘 시작 프레임 `document.activeElement` = `Prompts` 칩(세 뷰포트 · reduce 공통) — Spec §20.4 · AC-4-137 ③ 일치.
- 닫힘 중 시트 `inert` = true · `aria-modal` 없음(13개 샘플 전부).

### 12.3 열림과의 대칭감 (Q2 — 열림 변경 0)

| t (ms) | 0 | 20 | 40 | 60 | 80 | 120 | 160 | 200 | 239.99 |
|---|---|---|---|---|---|---|---|---|---|
| 열림 화면 안 띠 (393) | **24** | 88 | 156 | 221 | 270 | 322 | 343 | 351 | 353 |
| 닫힘 화면 안 띠 (393) | 353 | 278 | 200 | 125 | 68 | 8 | 0 | 0 | 0 |

- 시간 · 곡선 · scrim 동기는 같다(둘 다 240ms · `--motion-ease-standard`, scrim 이 시트와 같은 시각에 시작·끝). 열림은 그대로다 — 첫 프레임 24px 띠(`open-t0.png`)는 Spec §20.9 Q2 에서 "이번엔 닫힘만"으로 결정된 현행이다.
- **체감 차이 (Info)**: 닫힘은 이동 거리가 높이 + 52 로 열림(높이)보다 길어(393 에서 381 vs 329, +16%) 같은 240ms 감속 곡선에서 카드가 **≈130ms 에 화면을 벗어나고** 남은 시간은 scrim 페이드 꼬리(0.09 → 0)다. 열림은 ≈160ms 에 343/353 에 도달한다. Spec §20.6 이 예상한 "감속 머무름이 화면 밖에서 일어남" 그대로이며, 결정 문언(`D4-138` 시간 · 이징 그대로)과 어긋나지 않는다 → Gap 아님.

### 12.4 `prefers-reduced-motion: reduce`

393×852: top **499 고정**(13개 샘플) · computed transform `none` · 시트 opacity = scrim opacity 1 → 0.80 → … → 0.0014 → 0 (단조 감소, 같은 곡선). 시트 기여 146 → 22(t120) → 4(t180) → 0(t220). 정적 끝 opacity 0 · translateY 0, 끝 ↔ 정적 ↔ 언마운트 전체 프레임 차 **0**. Spec §20.3 "현행 유지(이동 0)" 일치 — `--haru-sheet-exit-extra` 가 reduce 의 `transform: none` 에 덮인다.

### 12.5 공유 `Sheet` 다른 사용처 — 시각 변화

| 사용처 (variant) | 닫힘 끝 translateY / 높이 | t=120 정지 프레임: `inert`·`aria-modal` 되돌림 전↔후 | 근거 |
|---|---|---|---|
| Reading Context (`bottom`) | 459 / 459 (= 100%) | **max 0 · over 0** | 프로브 |
| 마이크 권한 시트 (`bottom`, `recorder:mic-permission-revoked` → `Not now`) | 215 / 215 | **max 0 · over 0** | 프로브 |
| Library 서가 (`inset-card`) | 798 / 798 | **max 0 · over 0** | 프로브 |
| 대화 전용 시트 · 온보딩 선택 시트 · Book Detail | — (직접 프로브 안 함) | — | 같은 `Sheet.tsx` 분기(variant 무관) · 위 CSS 선택자 0건 · 해당 e2e·baseline(`session-exceptions` · `onboarding` · `library` · `visual`) 통과, 재생성 0 |

→ 다른 사용처의 시각 변화 **0**. 변화는 `floating`(Prompt Drawer) 닫힘 거리뿐이다(`D4-138` Q1 "시각 변화 0" · Q4 `inset-card` 범위 밖 그대로).

### 12.6 신규 토큰 `--sheet-floating-exit-shadow-reach: 28px` — 3-tier

| 확인 | 결과 |
|---|---|
| 계층 · 위치 | Tier 3 Component · `packages/design-tokens/src/component/index.css` · 소비처 `packages/ui/src/sheet/Sheet.css` 1곳(로컬 `--haru-sheet-exit-extra` 경유). 화면 코드 사용 0(grep) |
| 이름 | `--{component}-{part}-{…}` = `sheet` · `floating` · `exit-shadow-reach` — 같은 그룹 `--sheet-floating-*` 와 일관 |
| 값 | 리터럴 `28px` — `--shadow-glass-rest` 3겹 위쪽 도달 blur − offsetY = 2 / 16 / **28** 의 최댓값(정의 상한). 인계 실측 22 보다 6 크다 — 화면 밖 6px 추가 이동이라 시각 비용 0. `--space-7`(28)을 참조하지 않은 것은 맞다(간격이 아니라 그림자 기하라 의미가 다르다). 스케일 밖 Tier-3 리터럴 선례 `--carousel-shadow-inset-block-end: 80px` 와 같은 방식 |
| 등재 | `DESIGN_TOKEN_MAP.md` §8 행 · `token-tiers.test.ts` 목록 반영 |
| 결합 (Info) | 값이 `--shadow-glass-rest` 정의에 종속되지만 CSS 로 파생할 수 없다. 그림자 정의가 커지면 조용히 낡는다 — 현재 가드는 e2e §20.8 ③(언마운트 띠 ≤ 5)뿐이다. 토큰 주석에 근거가 있으므로 조치 불요(`VG-G2M-01`) |

### 12.7 `R-*` 확인

- `R-SHADOW-1`: 새 `overflow` 0. 시트는 `createPortal(body)` + `position: fixed` 라 클립 박스가 없다 — 남은 문제는 뷰포트 경계 잔여뿐이었고 ③ 번짐을 겹 전부 합산(28) + 픽셀 실측(22)으로 정해 해소했다. 이번 프로브의 전체 프레임 시트 기여가 t ≥ 180 에서 0 으로 다시 확인한다.
- `R-BASELINE-1`: 새 baseline 0 · 재생성 0 · 변경 0. 프로브 캡처는 저장소 밖에만 있다. 프레임은 seek 로 정지시킨 뒤 찍어 과도기 프레임이 섞이지 않는다(①). dev 패널 가림(②).
- `R-FIGMA-1` ⑤: 인계 수치(381 / 399 / 381 · 880 / 596 / 796 · 459 · 798)는 옮겨 적지 않고 다시 쟀다 — **전부 일치**. 인계 ③ 의 "하단 120px 띠 0"은 **전체 프레임**으로 넓혀도 0 이었다.

### 12.8 신규 Gap

| ID | 대상 | 기대 | 실측 | Severity | 권고 | 결정 필요 |
|---|---|---|---|---|---|---|
| **VG-G2M-01** | `--sheet-floating-exit-shadow-reach` 값의 종속 | 그림자 정의와 동기 | 리터럴 28 — `--shadow-glass-rest` 변경 시 자동 추종 안 함. e2e ③ 이 회귀를 잡는다 | Info | 조치 불요(근거 주석 있음) | 아니오 |
| **VG-G2M-02** | 인계 `S4-G2M` G2M-5 "`test.fail` 4 = K1-3 + ③ 3" | 실제 e2e 표식 | `e2e/*.ts` `test.fail`·`fixme`·`skip` **0건**. ③ 3건은 `S4-G2MF` 에서 해제됐고 K1-3 은 그 전부터 없다(`VG-FIN-01` 과 같은 기술 오류 — K2 인계 행도 아직 정정 안 됨) | Info (문서) | `VG-FIN-01` 정정 때 G2M-5 도 함께 (development-agent / Orchestrator) | 아니오 |

Critical · High · Medium · Low 없음.

### 12.9 이전 Gap 상태 갱신

| ID | 이전 | 이번 | 근거 |
|---|---|---|---|
| `VG-G2-10` Drawer 닫기 모션 | 미결 → `D4-137` 결정(§11.3) | **해소** | §12.2 — 띠 0 · 되튐 0 · 언마운트 단절 0 (3 뷰포트), reduce §12.4 |
| `VG-FIN-02` K2-D1 회귀 범위 | Low (테스트) | **해소** | `session-regression.spec.ts` `VG-FIN-02` 활성 2/7 · 5/5쪽 테스트 존재 · 이번 실행 통과 |
| `VG-FIN-04` 녹음 전 Toast 잔류 | 결정 필요 | **결정 종결** | `D4-136` (현행 + `AD-S4-26` 문언) |
| `VG-FIN-03` 결정 문서 표기 | Info | **부분 정정** | approvals §4 제목 갱신 · Spec §19 "종결" 표기 확인. ② `AD-S4-11`~ 표 위치는 확인 안 함 |
| `VG-FIN-01` 인계 `test.fail` 기술 | Info | **미정정** | K2 인계 69행 "`test.fail` 1건(K1-3)" 그대로 — `VG-G2M-02` 와 함께 |

**4b 전체 미결 (2026-11-05)**: 이전 87건 기준 **3건** — `VG-H2R-04`(Spec 문언) · `VG-K1-05`(702 경계, 실기기 `K1-8` 대기) · `VG-K1S-04`(클래식 스크롤바, Stage 8 이월). Figma 와의 시각 어긋남 0건. §5 · §12.8 신규는 전부 Info 또는 처리됨(문서 정정 `VG-FIN-01`·`VG-G2M-02` 만 남음 — 결정 불요).

### 12.10 사용자 결정 필요

없음. (`D4-138` Q2 열림 첫 프레임 24px 띠 · Q4 `inset-card` 같은 처리는 이미 "이번 범위 밖"으로 결정되어 있다 — 바꾸려면 별도 지시.)

### 12.11 측정하지 못한 것

| 항목 | 이유 | 대체 |
|---|---|---|
| 실기기 safe-area ≠ 0 (홈 인디케이터) 에서 닫힘 끝 | 환경 없음 — 테스트 safe-area 0 | 식이 `--sheet-floating-inset-block-end`(gutter + safe-bottom)를 참조하므로 safe-area 만큼 자동 증가. `NOT VERIFIED` (`K1-8` 과 함께) |
| 자연 재생(실시계) 프레임 드롭 | 프로브는 seek 정지 프레임 | e2e §20.8 ① rAF 샘플 단조 증가 통과 |
| 대화 전용 시트 · 온보딩 선택 · Book Detail 의 속성 토글 프레임 | 직접 프로브 안 함 | §12.5 근거(같은 분기 · 선택자 0 · e2e/baseline 통과) |
| iOS Safari `inert` 동작 | 환경 없음 | Chromium 만 확인 — iOS 16.4+ 지원(`D4-83` iOS ≥ 16 와 0.4 차이는 Info, 미지원이면 닫힘 240ms 동안 시트 내부 탭 가능 = 현행 이전 동작) |
