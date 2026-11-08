# Stage 4b `S4-H4` — Visual Gap 검토 (구현 후)

Status: DRAFT (2026-11-07, design-agent)
Based on: Spec `docs/design/stage-4b-design-spec.md` §21 (APPROVED `D4-146`) · Plan `docs/plans/stage-4b-plan.md` rev 1.7 §13.5 · 결정 `D4-140`~`D4-146` · 허용 차이 `AD-S4-27` · handoff `docs/qa/stage-4b-handoff.md` `# S4-H4` (H4-1~H4-10)
대상: 현재 작업 트리 (커밋 전 변경 포함)

## 0. 판정 요약

| ID | 항목 | 판정 |
|---|---|---|
| VG-H4-01 | AC-4-35 Home 시트 `recording`/`paused` 안내 — 기존 `InlineAlert`·기존 문구 | PASS |
| VG-H4-02 | AC-4-35 320×568 안내가 1회 스크롤되어 시트 안에 다 보임 (Q2 ⓑ) | PASS |
| VG-H4-03 | AC-4-35 Library Toast — `제목. 설명` 한 칸 (Q1 ⓐ) | PASS |
| VG-H4-04 | AC-4-35 `ready` → 세션 화면 이동, 새 UI 0, 과도기 프레임 T1~T3 | PASS |
| VG-H4-05 | AC-4-36 온보딩 이동 — 오류 프레임 0 · 전체 화면 Spinner 0 (T1·T2·T5) | PASS |
| VG-H4-06 | AC-4-99 ③ 스크롤바 매트릭스 — 가로 넘침 · 컬럼 중심 · 컬럼 폭 | PASS |
| VG-H4-07 | `AppColumn.css` 변경이 오버레이 스크롤바 레이아웃을 바꾸지 않음 | PASS |
| VG-H4-08 | 기본(오버레이) 시각 baseline · 그림자 프로브 회귀 | PASS |
| **VG-H4-09** | 320 + 클래식 스크롤바 Home 버블 보조 줄이 버블 오른쪽 가장자리 밖으로 나감 → `D4-147` 말줄임 수정 후 재검토 (§2 VG-H4-09 재검토) | **PASS (`D4-147` · `D4-148`)** — U-2(말줄임 끝 점 ↔ 곡선 틈 0)는 `D4-148` 적용 후 틈 9.33 으로 해소 (§3.2) |
| VG-H4-10 | 320 + 클래식 Library 말줄임 길이 늘어남 (설계된 ellipsis) | PASS (`AD-S4-27` 범위) |
| VG-H4-11 | Figma 에 없는 UI · 문구 추가 0 | PASS |
| VG-H4-12 | 측정판이 Production 빌드 산출물에 없음 | PASS |
| VG-H4-13 | (정보) `e2e/shadow.spec.ts` ① 을 클래식 스크롤바로 돌리면 320 에서 실패함 — 테스트 가정 문제이며 그림자 결함 아님 | 정보 · 조치 불필요 |

**Verdict (재검토 2026-11-07): GAP 0.** VG-H4-09 는 `D4-147` 수정 후 PASS. 남은 것은 시각 판단 1건(U-2 — 말줄임 끝 점과 버블 곡선 사이 여백 0)이며 결함이 아니라 `D4-147` 기준(버블 가장자리에서 자름)의 직접 결과다.

(최초 판정: GAP 1건 — VG-H4-09. Spec §21.3 "구현 후 픽셀로 다시 본다" 항목.)

## 1. 측정 방법 (공통)

- Playwright 단독 실행, 포트 4319 (webServer 자동 기동·종료). 5173·5174 는 건드리지 않았다. 다른 Playwright 프로세스 0 (`ps` 로 확인).
- 프로브는 저장소 밖(gitignored) `.omc/s4h4-vg/` 에 있다: `vg.config.ts` (project `overlay` = 기본 / `classic` = `ignoreDefaultArgs: ['--hide-scrollbars']`) · `vg.probe.ts` (매트릭스 · 버블 · 안내) · `vg2.probe.ts` (Library·Toast 정착 스크린샷) · `vg3.probe.ts` (클래식 그림자 픽셀) · `shadow-classic.config.ts`.
- 원자료 (scratchpad): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vg/` — `matrix.jsonl` (98행) · `bubble.jsonl` · `notices.jsonl` · `toast2.jsonl` · `shadow-classic.jsonl` · PNG.
- dev Scenario Panel 은 `hideDevPanel` 로 가렸다 (`R-BASELINE-1` ②, 레이아웃 기여 0).
- Figma: 이 단위의 대상(오류 안내 자리 · 이동 · 스크롤바)은 Figma 에 정의가 없다(Spec §21). 비교 기준은 Figma 노드가 아니라 **기존 컴포넌트·기존 문구·Spec §21 수치**다. VG-H4-09 의 버블 보조 줄 `nowrap` 은 Figma `I261:1293;50:173` 선언이며, `SpeechBubble.css` 의 근거 주석(`V-9`)과 일치함을 직독으로 확인했다(새 Figma 조회 없음 — 값이 바뀐 것이 아니라 담는 폭이 바뀐 문제다).

## 2. 항목별 증거

### VG-H4-01 · 02 — Home 시트 안내 (AC-4-35, Q2 ⓑ)

측정: `sessions:session-already-active` · `-paused` 두 key, 320×568 · 393×852. `Element.prototype.scrollIntoView` 를 init script 로 감싸 호출 기록. 시트 내용 박스(`.haru-sheet__content`)와 `[role=alert]` 의 `getBoundingClientRect` 비교 (400ms 정착 후).

| 뷰포트 | key | 안내 요소 | 높이 | 시트 내용 박스 안 | `scrollTop` | `scrollIntoView` 호출 | `Continue` bottom / vh | 이동 |
|---|---|---|---|---|---|---|---|---|
| 320×568 | already-active | `haru-alert haru-alert--error haru-alert--inline` | 94 | **예** (alert 392.7–486.7 / box 105.7–487) | 0 → 33 | **1회** `{block:'nearest'}` | 544 / 568 | 0 (`/`) |
| 320×568 | -paused | 같음 | 94 | 예 | 0 → 33 | 1회 | 544 / 568 | 0 |
| 393×852 | 두 key | 같음 | 94 | 예 (677–771 / 357–771) | 0 (스크롤 불필요) | 1회 (`nearest` 라 이동 0) | 828 / 852 | 0 |

- 높이 94 = Spec §21.1 실측값(제목 1줄 · 설명 2줄)과 같다. 문구: 제목 `A storytime is already open` / 설명 `Continue the open storytime, or finish it before starting a new one.` — 기존 `ERROR_COPY.SESSION_ALREADY_ACTIVE`.
- 스크린샷 `notice-320x568-session-already-active.png`: 선택지 `Bedtime` 유지 · 안내 전체 보임 · `Continue` 화면 안. 새 요소 없음 (래퍼 `div` 는 무스타일 — 높이 94 가 Spec 값과 같아 레이아웃 기여 0).
- 가로 넘침 0 (`documentElement` 기준).

### VG-H4-03 — Library Toast (Q1 ⓐ)

| 뷰포트 | 텍스트 | 구조 | 높이 | `aria-live` | 이동 |
|---|---|---|---|---|---|
| 320×568 | `A storytime is already open. Continue the open storytime, or finish it before starting a new one.` | `P.haru-text--footnote` 1개 (제목 칸 신설 0) | **86** (3줄) | `assertive` | 0 (`/library`) |
| 393×852 | 같음 | 같음 | **68** (2줄) | `assertive` | 0 |

- Spec §21.1 예측(320 = 3줄·86 / 393 = 2줄·68)과 같다. 700ms 뒤 시트 `aria-busy` 버튼 0 (`toast2.jsonl`) — 안내 후 버튼이 보통 상태로 돌아온다.
- 320 에서 Toast 가 inset-card 시트 위쪽과 겹치는 것은 Spec §21.1 에 기록된 **기존 현상**(지금 `startFailed` 도 같다)이다. 새 차이 아님.

### VG-H4-04 · 05 — 이동 과도기 프레임 (AC-4-35 ③ · AC-4-36)

`e2e/session-start-blocked.spec.ts` 8건을 단독 재실행해 통과를 확인했다 (아래 VG-H4-08 실행에 포함). 이 spec 은 Spec §21.2 의 검증 방법(탭 이후 rAF 마다 `[role=alert]` · `.haru-toast` · `aria-busy` · 시트 · `pathname` · 버튼/세션 밖 `.haru-spinner`)을 그대로 구현했고, 기준을 직독으로 대조했다:

- T1 출발 화면 비-busy 프레임 0 · T2 알림/Toast 프레임 0 · T3 시트 없는 Home 프레임 0 (`ready` 복귀 Home/서재, `history.length` +1 = push, `D4-146`).
- AC-4-36: T1 · T2 · **T5 Guard 전체 화면 Spinner 프레임 0** · `GET /v1/me` +1 · `/onboarding…` 도착 (Home · 서재).
- 한계: Mock 응답이 즉시라 출발 화면 기록 프레임이 0~2 개뿐이다(handoff H4-5). "위반 프레임 0" 은 성립하지만 지연 응답에서의 프레임은 이 실행으로 보지 못했다 — 실제 지연은 `BACKEND_INTEGRATION_PENDING` 범위.

### VG-H4-06 — 스크롤바 매트릭스 (AC-4-99 ③)

7 크기 (320×568 · 320×852 · 393×600 · 393×852 · 600×800 · 1024×500 · 1024×768) × 2 스크롤바 × 7 화면 (Welcome · 온보딩 첫 화면 · Home · Library · 세션 ready · recording · 완료) = **98 측정**. 앱 스크롤 박스(`[data-app-shell-viewport]`) 기준.

| 측정 | 결과 |
|---|---|
| `scrollWidth − clientWidth` | **98/98 = 0** |
| 문서 가로 · 세로 넘침 | 98/98 = 0 |
| 컬럼 중심 − 스크롤 박스 `clientWidth` 중심 | 98/98 = 0.00 |
| 컬럼 폭 = `min(clientWidth, 480)` | 98/98 일치 |
| 클래식 스크롤바 폭 | 스크롤이 있는 화면 전부 15 · 없는 화면 0 |
| **컬럼 305 가 나온 조건** | **클래식 + 창 320 + 세로 스크롤 있음뿐** — 320×568 Welcome · 온보딩 · Home · Library · ready · recording, 320×852 온보딩 · Library (8건). 완료 화면(스크롤 없음)은 320 |

→ 305 는 `AD-S4-27` 문언("클래식 스크롤바 320 에서 컬럼 305") 안이다. 393 클래식은 컬럼 378 = `clientWidth` (480 이하이므로 컬럼 = 박스 폭) — 수정 전과 같은 값(VG-H4-07 토글).

### VG-H4-07 — `AppColumn.css` 변경이 오버레이 레이아웃을 바꾸지 않음

방법 (`R-BASELINE-1` ⑥ — 런타임 토글): 각 측정 지점에서 ① 현재 규칙으로 앱 스크롤 박스 안 **모든 요소**의 `getBoundingClientRect`(소수 2자리)를 서명으로 기록 ② 옛 규칙 `.haru-app-column{min-inline-size:var(--layout-min-width) !important}` 를 주입해 다시 기록 ③ 주입을 제거하고 다시 기록.

| 조건 | 현재 = 옛 규칙 (요소 34~396개 전부) | 옛 규칙의 넘침 |
|---|---|---|
| 오버레이 49 지점 | **49/49 동일** | 0 |
| 클래식 · 컬럼 305 인 8 지점 | 다름 (의도된 변경) | **15** (= 수정 전 결함 재현) |
| 클래식 · 나머지 41 지점 | **41/41 동일** | 0 |
| ③ 복원 | 98/98 원래 서명으로 돌아옴 | — |

→ 이 변경이 레이아웃을 바꾸는 곳은 **클래식 + 320 + 세로 스크롤** 8 지점뿐이며, 오버레이(iOS · Android · macOS 기본)에서는 요소 하나의 위치·크기도 바뀌지 않는다.

### VG-H4-08 — 기본 project 시각 baseline · 그림자 회귀

- `npx playwright test e2e/visual.spec.ts e2e/responsive.spec.ts e2e/shadow.spec.ts e2e/session-start-blocked.spec.ts e2e/scrollbar-classic.spec.ts` 단독 실행 → **167 passed (3.7m)**. 시각 비교 임계값은 저장소 설정 그대로(`0.02` · 50/20) — 변경 0.
- `git status --porcelain e2e/__screenshots__` → 기존 미추적 `session-exceptions.spec.ts/` 뿐. baseline 재생성 0 · 갱신 0.
- 그림자 (`R-SHADOW-1` ⑥): 기본 project `shadow.spec.ts` 전체 통과(위 167 안). 클래식에서 `shadow.spec.ts` 를 별도로 돌렸다 → 60/61 통과, 1건 실패는 VG-H4-13. 그 1건의 픽셀 단계(②)를 따로 쟀다: 320×568 클래식 dev frame 카드 좌(x=18) · 우(x=286) 바깥 픽셀이 `box-shadow` 있음/없음에서 **다름** — 그림자가 보인다 (`shadow-classic.jsonl`).

### VG-H4-09 — ⚠ GAP: 320 + 클래식 Home 버블 보조 줄이 버블 밖으로 나감

Spec §21.3 "확인할 것 (미확정)" 의 구현 후 픽셀 확인 결과다.

선언 (직독, `R-FIGMA-1` ①): `.haru-bubble__hint { white-space: nowrap }` — Figma `I261:1293;50:173` 이 `whitespace-nowrap` (`V-9`). 문구 `Please select the book and start session` 은 Home 응답 값.

측정 (Range client rects + 전체 화면 스크린샷 픽셀, 320×568 Home):

| | 오버레이 (컬럼 320) | 클래식 (컬럼 305) |
|---|---|---|
| 버블 left–right | 39 – 296 (폭 257) | 39 – **281** (폭 242) |
| 보조 줄 텍스트 rect right | 283.0 | 283.0 |
| 보조 줄 `scrollWidth / clientWidth` | 228 / 201 | 228 / **186** |
| 텍스트 끝 ↔ 버블 오른쪽 끝 | **+13.0** (안쪽) | **−2.0** (바깥) |
| 픽셀: y 108–124 띠에서 열마다 최소 밝기 | 글리프 잉크 ~x281 까지, x283–290 = 251 (버블 면) | 글리프 잉크 **x281 = 138**(버블 마지막 열 280 바로 밖) · x282 = 202(안티앨리어스) · x283~ = 224(배경) |

- 결과: 클래식 320 에서 `session` 의 마지막 `n` 이 **버블 가장자리를 1~2px 넘어 배경 위에 그려진다**. 오른쪽 안쪽 여백은 0 이하다 (Figma 보조 줄 left 16 기준의 좌우 여백 대칭이 깨짐). 스크린샷 `classic-320x568-home.png` · 확대 `classic-hint-crop.png` 에서 육안으로도 보인다.
- 원인: 이 단위의 수정으로 컬럼이 305 가 되어 버블 폭이 15 줄었고(257 → 242), 보조 줄은 Figma 선언대로 줄바꿈하지 않는다. 수정 전에는 같은 조건에서 컬럼 320 + 페이지 가로 넘침 15 였다(그 결함이 `QA-4B-004`).
- 범위: **클래식 스크롤바 + 창 320 + Home 세로 스크롤 있음**에서만 생긴다. 오버레이(모든 모바일 기기)·393 이상·320×852(Home 스크롤 없음 → 컬럼 320)는 해당 없음. 보조 줄 문구가 더 길면 넘침도 길어진다(문구는 API 값).
- `AD-S4-27` 문언은 "컬럼 305(내용 257), 가로 넘침 0" 이며 **버블 글자가 버블 밖으로 나오는 것은 적혀 있지 않다**. Agent 가 허용 차이로 처리하지 않는다 (CLAUDE.md 최우선 규칙 6).
- 참고(이 단위 결함 아님): 오버레이 320 에서도 보조 줄은 `__content` 박스(201)를 넘어 오른쪽 padding 영역(닫기 버튼 몫)으로 들어가 있다(버블 끝까지 13). 기존 Stage 3 상태이며 이번 토글 측정에서 변화 0.

결정 필요 → §3 U-1.

#### VG-H4-09 재검토 — `D4-147` 수정 후 (2026-11-07, design-agent)

대상: `packages/ui/src/bubble/SpeechBubble.css` 작업 트리 diff (지역 변수 `--haru-bubble-padding-end` · `.haru-bubble__hint` 에 `margin-inline-end: calc(-1 * var(--haru-bubble-padding-end))` + `overflow: hidden` + `text-overflow: ellipsis`, `nowrap` 유지). 구현자 수치는 증거로 쓰지 않고 다시 쟀다.

측정 방법 (프로브: scratchpad `vg09/true.cjs` · `desc.cjs` · `probe.cjs`, 포트 4319 단독, dev 패널 `visibility: hidden`):
- **진짜 전/후 토글**: 같은 dev 서버에서 `/src/styles/index.css` 응답을 가로채 D4-147 선언 3곳을 HEAD 형태로 되돌린 페이지(= 수정 전) ↔ 그대로(= 수정 후)를 각각 새로 띄워 전체 프레임 픽셀 비교. 되돌림이 실제로 적용됐는지(치환 0 이면 예외) 확인.
- 참고: 로드 후 `<style>` 주입으로 되돌리면 Home 상단 `2 this week` 칩 행(y28–33)에 34px(채널 Δ≤17) 차이가 생긴다. 무관 선택자·`outline-color` 주입 대조군은 0 이고, 위 진짜 토글에서는 0 이며, 구현자의 수정 전 파일 스크린샷과 지금 렌더가 393 에서 0px 로 일치한다 → **주입 후 재스타일이 만든 재래스터 노이즈**이며 이 수정의 렌더 변화가 아니다 (`R-BASELINE-1` ⑤ — 클러스터 원인 확정 후 제외).

| 환경 (Home) | 버블 L–R | 보조 줄 박스 R | scroll/client | 수정 전↔후 전체 프레임 diff |
|---|---|---|---|---|
| 클래식 320×568 | 39–281 | 281 | 228/226 → 말줄임 | **80px, box x269–282 · y115–122** (말줄임 자리만) |
| 오버레이 320×568 · 320×852 / 클래식 320×852 | 39–296 | 296 | 241/241 (안 잘림) | **0** |
| 오버레이·클래식 393×852 | 39–342 | 342 | 287/287 | **0** |
| 오버레이·클래식 600×800 | 99–402 | 402 | 287/287 | **0** |

1. **클래식 320×568 — 버블 밖 잉크 0.** 보조 줄 색을 `transparent` 로 토글한 차분으로 잉크만 분리: 잉크 행 y112–122, 행별 마지막 잉크 열 최대 x277. x278 이후는 토글 전후 동일(버블 가장자리 안티앨리어스 열 그대로) → 버블 밖 잉크 0. 육안(8배 확대 `vg09/ink-A-zoom.png`)으로도 `sessi…` 가 버블 안에 있다. `docOverflow` 0.
2. **말줄임 끝 점 ↔ 오른쪽 아래 곡선 (radius 22, 중심 259,111)**: 세 번째 점 = x276–277 · y120–121. 곡선 경계 계산값 y121 → x278.3, y122 → x277.8. 픽셀로는 x277 이 이미 버블 면 끝 안티앨리어스 열(배경 토글값 249)이고 x278 부터 바깥색 → **점은 버블 안이지만 곡선과의 여백 0px (가장자리에 닿음)**. 왼쪽 글자 시작 여백은 16 이라 좌우 대칭이 아니다. 결함은 아니고 `D4-147`("버블 가장자리에서 자름")의 직접 결과 → U-2.
3. **다른 SpeechBubble 사용처 변화 0**: 세션 화면 `ready` 버블(`tail-top-center`, 비dismissible) 오버레이 320×568 · 클래식 320×568 · 오버레이 393×852, dev gallery `SpeechBubble` 3변형(`bottom-right` · `top-center` · `none`, 비dismissible) 393×852 → 진짜 토글 diff **전부 0**, computed `padding-right` 16 = 수정 전 16. Home(dismissible) `padding-right` 40 = 수정 전 40. `.haru-bubble__hint` 를 쓰는 곳은 Home `HomeStage` 하나뿐(`grep hint=` — 나머지 `hint` prop 은 다른 컴포넌트).
4. **세로 클리핑 0**: 보조 줄 `scrollHeight = clientHeight = 15`(모든 크기). 실제 문구엔 하강부 글자가 없어서 런타임으로 `gyp jq Qg yy pp — Ågjy` 를 넣고 진짜 토글 비교 → **diff 0** (하강부·윗 악센트 잘림 0). 긴 문구(넘침)는 393 에서도 말줄임으로 바뀜(의도된 동작, 수정 전엔 버블 밖으로 나갔을 것).
5. **닫기 버튼과 겹침 0**: 보조 줄 박스가 오른쪽 padding(닫기 몫 40)까지 늘었지만 닫기 y53–91 · 보조 줄 y110–125 로 세로가 겹치지 않는다.
6. **토큰**: diff 의 값은 `var(--bubble-padding-x)` · `var(--icon-button-size)` · `var(--bubble-dismiss-inset)` 와 그 `calc` 뿐 (`-1 *` 는 부호). 새 토큰 0 · HEX/arbitrary 0.
7. 새 테스트 2건(`e2e/home.spec.ts:376` · `e2e/scrollbar-classic.spec.ts:152`) 단독 실행 2 passed.

판정: **PASS (`D4-147`)**. §4 의 이전 메모 "잉크가 버블 오른쪽 끝 −16 안쪽" 은 `D4-147`(버블 가장자리 기준) 으로 대체됐다 — −16 기준이면 오버레이 320 문구 끝(283)이 280 을 넘어 휴대폰에서도 말줄임이 생긴다.

### VG-H4-10 — 320 + 클래식 Library 말줄임

- 클래식 320 에서 `Reading now` 제목·저자 줄과 선반 제목의 말줄임 박스가 166 → 151 로 줄어 더 일찍 잘린다(`text-overflow: ellipsis` — `Text.css` 1줄 규칙, 설계된 동작). 오버레이 320 에서도 같은 5개 요소가 말줄임 상태다(기존).
- 스크린샷 `classic-320x568-library.png`: `The Most Magnifi…` · `Ashley Spires · Emotion …` · 선반 `Where the …` — 글자가 박스 밖으로 나오지 않는다. `AD-S4-27`("내용 257") 의 직접 결과이므로 PASS.

### VG-H4-11 — Figma 에 없는 UI · 문구 0

- `git diff apps/web/src/shared/copy/error-copy.ts` → 함수 2개(`sessionStartBlockedCopy` · `joinErrorMessage`)만 추가, **문자열 리터럴 추가 0** (구분자 `. ` 제외 — Q1 ⓐ 승인 형식). 쓰는 문구는 기존 `ERROR_COPY.SESSION_ALREADY_ACTIVE` · `ONBOARDING_INCOMPLETE` · `activityDeckCopy.card.startFailed`.
- H4 수정 컴포넌트(`ReadingContextSheet` · `ActivityCardDeck` · `StartSessionAction` · `useCreateSession`) diff 의 추가 줄에서 영어 UI 문자열 grep → 0.
- `features/storytime-session/copy.ts` 의 미커밋 추가분은 `S4-H2`·`H2F`·`H2R`·`H3` 문구(승인 `D4-115`·`122`·`126`·`129`)이며 H4 신규가 아니다.
- 새 컴포넌트·새 변형 0: 시트 안내 = 기존 `InlineAlert tone="error"`, 서재 = 기존 Toast `message` 한 칸. 새 래퍼 `div` 는 스타일 0 (높이·위치 Spec 값과 같음).

### VG-H4-12 — 측정판 Production 제외

- `apps/web/dist` (빌드 12:43) 가 측정판 소스(11:52 수정)보다 새롭고, `find apps/web/src -newer apps/web/dist/index.html` = 0 → 현재 소스의 빌드.
- `grep -rl` dist: `recording-measure` · `measure-start-latency` · `watchedStart` · `watchedGetUserMedia` · `SessionStartMeasure` · `haru-dev-` = 전부 **0**. `__dev` 는 `.js.map` 의 주석 문자열에만 1건(실행 코드 아님).
- route 는 `import.meta.env.DEV` 삼항(`router.tsx:52~54`)으로만 붙는다.

### VG-H4-13 — (정보) `shadow.spec.ts` ① 의 클래식 이식성

`shadow.spec.ts:122` "카드 그림자가 앱 컬럼 밖으로 번진다 — dev frame · 320px" 를 클래식으로 돌리면 ① `clipper.clientWidth(305) ≥ window.innerWidth(320)` 에서 실패한다. `innerWidth` 가 스크롤바를 포함하기 때문이며 옛 규칙에서도 박스 `clientWidth` 는 305 다(그림자 결함 아님 — 픽셀 ② 는 VG-H4-08 에서 확인). 이 spec 은 기본 project 전용이라 현재 CI 에 영향 0. 조치 불필요 — 나중에 클래식 project 로 넓힐 때만 기준을 `clientWidth` 로 바꾸면 된다.

## 3. 사용자 결정 필요

| # | 항목 | 선택지 | design-agent 권고 |
|---|---|---|---|
| **U-1** | VG-H4-09 — 클래식 스크롤바 320 Home 버블 보조 줄 끝이 버블 밖 1~2px (문구가 길면 더) | ⓐ `AD-S4-27` 범위를 넓혀 허용 차이로 등록 (클래식 + 320 전용, 모바일 기기 0) ⓑ 보조 줄이 버블 안에 머물도록 고침 — 예: 좁을 때만 말줄임(`text-overflow: ellipsis` + `overflow: hidden`, `nowrap` 은 유지 → Figma 선언 보존) — 기존 Text 1줄 말줄임 규칙 재사용, 새 토큰 0 · 오버레이 레이아웃 변화 0 이어야 함 | **ⓑ** — 글자가 컴포넌트 밖으로 나오는 것은 "좁아짐" 이 아니라 깨짐이며, 보조 줄이 API 문구라 길이가 정해져 있지 않다. 단 해당 환경이 데스크톱 웹 프리뷰(`C-18`)뿐이므로 ⓐ 도 합리적이다. 어느 쪽이든 사용자 승인 후 적용 → **`D4-147` ⓑ 승인·적용 (2026-11-07)** |
| **U-2** | VG-H4-09 재검토 — 클래식 320 Home 말줄임 `…` 의 마지막 점이 버블 오른쪽 아래 곡선(r22)에 여백 0 으로 닿는다 (버블 안, 밖 잉크 0). 왼쪽 여백 16 과 비대칭. 이 환경(클래식 스크롤바 + 창 320)에서만 생김, 휴대폰 0 | ⓐ 그대로 수용 (`D4-147` 문언대로 — 허용 차이 등록 여부는 사용자) ⓑ 자르는 끝을 곡선 안쪽으로 몇 px 당김 — 기존 토큰 중 맞는 값이 없으면 신규 토큰 필요, 오버레이 320 문구 끝 여유 13 이내여야 휴대폰 렌더 변화 0 | **ⓐ** — 2px 넘치던 깨짐은 해소됐고, 남은 것은 데스크톱 웹 프리뷰 한 조건의 여백 감각 문제다. ⓑ 는 새 값이 필요해 비용 대비 이득이 작다 → **`D4-148` ⓑ 결정 (2026-11-07)** — 명세는 아래 §3.1 · **구현 재검토 PASS (§3.2)** |

### 3.1 U-2 명세 — `D4-148` 자르는 끝을 곡선 안쪽으로 (design-agent, 2026-11-07)

**값: 보조 줄 클립 끝 = 버블 오른쪽 끝 − `var(--space-2)` (8px). 기존 토큰 — 신규 토큰 0.**

바꿀 곳: `packages/ui/src/bubble/SpeechBubble.css` `.haru-bubble__hint` 한 줄.

```
margin-inline-end: calc(-1 * var(--haru-bubble-padding-end) + var(--space-2));
```

(`overflow: hidden` · `text-overflow: ellipsis` · `nowrap` 은 그대로. 근거 주석의 "버블 가장자리에서 자른다" 를 "버블 끝 − 8 에서 자른다 (`D4-148`)" 로 고친다. `--space-2` 는 같은 버블의 아래 padding `--bubble-padding-block-end` 와 같은 값이라 곡선 쪽 여백이 아래 여백과 맞는다.)

근거:
- Figma: `50:176` / `261:1293` 의 좌우 padding 16 · 보조 줄 `I261:1293;50:173` `nowrap` (`V-9`) 외에 오른쪽 끝 처리 선언이 없고, 클래식 320 케이스가 없다 → **명세 결정**이다. 16(Figma 대칭값)은 쓸 수 없다 — 오버레이 320 여유 13 을 넘어 휴대폰에서도 말줄임이 생긴다(§2 재검토 판정 문단과 같은 이유).
- 후보 실측 (포트 4319, 클래식은 `--hide-scrollbars` 제거, 값마다 새 브라우저, dev 패널 `visibility: hidden`, 프로브 scratchpad `u2/p2.cjs` · `u2/p5.cjs`):

| 값 | 오버레이 320 박스 R / 남는 여유 (문구 끝 283) | 클래식 320×568 말줄임 | 점 실잉크 끝(lum<225, y120–121) | 곡선 경계 (y121 중심 = 259+√(22²−10.5²)) | 점 ↔ 곡선 틈 |
|---|---|---|---|---|---|
| 0 (현행 `D4-147`) | 296 / 13 | `sessi…` | x276 (+AA 열 277) | 278.33 | 1.33 (AA 포함 0.33 — "닿음") |
| `--space-1` 4 | 292 / 9 | `sessi…` | x274 | 278.33 | 3.33 |
| **`--space-2` 8** | **288 / 5** | **`ses…`** | **x268** | **278.33** | **9.33** |
| `--space-3` 12 | 284 / 1 | `se…` | x261 | 278.33 | 16.33 |

- **보장 틈(문구와 무관)**: 말줄임 잉크는 박스 끝(273) 안이므로 y121 에서 최소 278.33 − 273 = **5.33px** (글리프 오른쪽 여백 ~2 를 더하면 ≈ 7). 실측 9.33 은 이 문구의 글자 경계 때문이다(문구는 API 값이라 글자 폭에 따라 5.33~9.33 사이로 움직인다).
- **휴대폰·393 이상 렌더 변화 0 (실측)**: `--space-2` 주입 vs 0 의 전체 프레임 diff — 오버레이 320×568 · 320×852 · 클래식 320×852 · 오버레이/클래식 393×852 · 오버레이 600×800 **전부 0px**. 오버레이 320 `scrollWidth/clientWidth` = 233/233 (문구 228 ≤ 233, 남는 여유 **5px**). `--space-3`(12) 은 여유 1px 라 글꼴 렌더 차이에 취약해 택하지 않는다.
- 다른 사용처: `.haru-bubble__hint` 사용처는 Home `HomeStage` 하나뿐(§2 재검토 ③). 비dismissible 버블에서는 박스가 오른쪽 padding 16 중 8 까지만 들어간다(현재 사용처 없음).

development-agent 테스트 수정 (기존 2건 갱신, 새 파일 0):
1. `e2e/home.spec.ts` "320 에서 버블 보조 줄이 말줄임 없이 전부 보인다" — 추가: `hintBox.right === bubbleRight − 8`(= **288**) · `textRight(283) ≤ hintBox.right` · 기존 `scrollWidth ≤ clientWidth` 유지. 제목의 `D4-147` 옆에 `D4-148` 병기.
2. `e2e/scrollbar-classic.spec.ts` "보조 줄 박스 끝 ≤ 버블 끝 · 말줄임 · 버블 밖 잉크 0" — `hintRight === bubbleRight − 8`(= **273**) 단정으로 바꾸고, 잉크 띠를 `x = hintRight`, `width = bubbleRight − hintRight + 4`(273–284) 로 넓혀 **박스 끝 오른쪽 잉크 0** 을 투명 토글로 확인한다(이것이 곡선 틈 ≥ 5.33 을 문구와 무관하게 보증한다). 말줄임 걸림(`scrollWidth > clientWidth`, 228 > 218) 유지.
3. 시각 baseline: 클래식 project 에는 `toHaveScreenshot` 이 없고 기본(오버레이) project 는 diff 0 이므로 **재생성 0** 이어야 한다. 하나라도 바뀌면 멈추고 보고(`R-BASELINE-1` ⑤).
4. `R-SHADOW-1`: 박스 안 그림자 요소 없음 — 변화 없음.

사용자 결정: 기존 토큰이므로 `D4-148` 조건("기존 토큰 우선, 신규면 다시 보고") 안에서 **추가 결정 불필요**. 다만 값(8)·클래식 말줄임 위치 변화(`sessi…` → `ses…`)는 결과 보고에 포함한다.

### 3.2 U-2 구현 재검토 — `D4-148` 적용 후 (design-agent, 2026-11-07)

대상: `packages/ui/src/bubble/SpeechBubble.css` `.haru-bubble__hint { margin-inline-end: calc(-1 * var(--haru-bubble-padding-end) + var(--space-2)) }` (작업 트리). 구현자 수치(handoff `H4-12`)는 증거로 쓰지 않고 다시 쟀다.

측정 방법: 포트 4319 단독(probe 용 dev 서버는 직접 띄우고 측정 후 종료), 값마다 새 브라우저, dev 패널 `visibility: hidden`, 클래식 = `--hide-scrollbars` 제거. **진짜 토글**: 서빙되는 `/src/styles/index.css` 응답에서 `D4-148` 선언 1곳(출현 정확히 1회 확인)을 `D4-147` 형태 `calc(-1 * var(--haru-bubble-padding-end))` 로 되돌린 페이지 ↔ 그대로 → 전체 프레임 픽셀 비교. 잉크 분리 = 보조 줄 `color: transparent` 토글 차분. 프로브 scratchpad `h4u2/t.cjs` · 결과 `h4u2/t.json` · 확대 `h4u2/zoom-classic-320x568.png`.

| 환경 | 버블 R | 보조 줄 박스 R | 문구 끝(Range) | scroll/client | `D4-147` ↔ `D4-148` 전체 프레임 diff |
|---|---|---|---|---|---|
| Home 클래식 320×568 | 281 | **273** | 283 (잘림) | 228/218 → `ses…` | 85px, box x260–277 · y112–122 (말줄임 자리만) |
| Home 오버레이 320×568 · 320×852 / 클래식 320×852 | 296 | 288 | 283 (여유 5) | 233/233 (안 잘림) | **0** |
| Home 오버레이·클래식 393×852 | 342 | 334 | 283 | 279/279 | **0** |
| Home 오버레이·클래식 600×800 | 402 | 394 | 343 | 279/279 | **0** |
| 세션 `ready` 버블 오버레이 320×568 · 클래식 320×568 · 오버레이 393×852 | — (보조 줄 없음) | — | — | — | **0** (`padding-right` 16) |
| dev gallery `SpeechBubble` 3변형(비dismissible) 393×852 · 320×568 | — | — | — | — | **0** (`padding-right` 16) |

1. **클래식 320×568 — 박스 끝 273 = 버블 끝 281 − 8.** 말줄임 있음(`ses…`, 8배 확대에서 육안 확인). 잉크(투명 토글 차분) 마지막 열 **x268**, 박스 끝 273 넘는 잉크·버블 밖 잉크 **0**. `docOverflow` 0.
2. **말줄임 끝 점 ↔ 오른쪽 아래 곡선(r22)**: 점 행 y120–121 — y120 마지막 잉크 x268(곡선 278.84 → 틈 **9.84**), y121 x268(곡선 278.33 → 틈 **9.33**), y122(안티앨리어스만) x267 → 9.75. 최소 틈 **9.33px** (수정 전 `D4-147` 0.33). §3.1 예측값 9.33 과 일치. 문구와 무관한 보장 틈은 박스 끝 기준 ≥ 5.33.
3. **오버레이 보조 줄은 어느 크기에서도 잘리지 않는다**: scroll ≤ client (320: 233/233, 문구 228), 렌더 diff 0. 휴대폰 렌더 변화 0.
4. **세로 클리핑 0**: 보조 줄 `scrollHeight = clientHeight = 15` (모든 Home 크기). 세션 버블 안 `overflow` 박스는 기존 `--truncate-2` 프롬프트 문구·`__prompts` 뿐이며 토글 전후 목록 동일(이 변경과 무관).
5. **테스트**: `e2e/home.spec.ts:376`(chromium) 1 passed · `e2e/scrollbar-classic.spec.ts` 17 passed (`:154` U-2 단정 포함), Playwright 자체 webServer, 단독 실행. `e2e/__screenshots__` 변경 0 (미추적 `session-exceptions.spec.ts/` 기존분뿐).
6. 토큰: 추가 값은 기존 `var(--space-2)` 하나 — 신규 토큰 0 · HEX/arbitrary 0.

판정: **U-2 PASS (`D4-148`)**. 사용자 추가 결정 불필요. 결과로 보고할 변화: 클래식 320 말줄임 위치 `sessi…` → `ses…` (데스크톱 웹 프리뷰 한 조건만).

## 4. development-agent 메모 (U-1 ⓑ 승인 시에만)

- 바꿀 곳: `packages/ui/src/bubble/SpeechBubble.css` `.haru-bubble__hint` 한 곳 — `overflow: hidden` + `text-overflow: ellipsis` 추가, `nowrap` 유지. `R-SHADOW-1` 점검: 이 박스 안에 그림자 요소 없음.
- 확인: 오버레이 모든 크기에서 Home 서명 불변(VG-H4-07 방식) · 시각 baseline 재생성 0 (오버레이 320 에서는 보조 줄이 `__content` 박스를 이미 넘어 있으므로, `overflow: hidden` 을 `__content` 폭 기준으로 걸면 **오버레이 320 에서도 말줄임이 생긴다** — 기준 박스를 버블 padding box 로 잡아야 한다. 구현 전에 이 점을 실측할 것) · 클래식 320 에서 잉크가 버블 오른쪽 끝 −16 안쪽.
