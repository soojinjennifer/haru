# Stage 5 Visual Gap — `S5-C` 피드백 · 분석 상태 화면 (`/session/:sessionId/feedback`, `C13-S5-1`)

Status: **REVIEW (design-agent, 2026-11-09) · 재검토 2026-11-10 (§8 — VG5C-1 · VG5C-2 해소, VG5C-3 신규 Low 열림)** — 허용 차이 등록은 하지 않았다 (CLAUDE.md 최우선 규칙 6). Production Code · Figma 수정 0.
Based on: Spec `docs/design/stage-5-design-spec.md` §2.3 · §6 · §9 · §11 (APPROVED, `D5-4`) · handoff `docs/qa/stage-5-handoff.md` §H5-4 (특히 §H5-4.3) · Figma `YWWu3AFEJpRxvw0T5klq0k` `29:62` · `88:929` · `29:86` · `29:75` (2026-11-09 라이브 조회) · baseline `e2e/__screenshots__/darwin/session-feedback.spec.ts/` 11장

## 0. 무엇을 어떻게 쟀는가 (`R-FIGMA-1` ⑤)

| 출처 | 방법 |
|---|---|
| Figma 선언값 | `get_metadata(29:62)` (좌표) · `get_design_context(88:929)` (버블 fill · radius · padding · effect · text style) · `get_design_context(29:86)` → 에셋 SVG 원문 `curl` (링 `fill` · `filter`) · `get_design_context(29:75)` (제목 text style). **렌더 픽셀에서 색·그림자를 읽지 않았다** |
| 그림자 겹 수 | 링 SVG 렌더 바운드 158×160 (노드 150) = 좌우 ±4 · 아래 +10 → drop **1겹** (`R-FIGMA-1` ②) |
| 구현 | Playwright **단독 실행** (26 tests, 28.5s), dev 패널 `hideDevPanel`, `settleImages` 후 촬영. 393×852 · 320×568 × 11상태. `getBoundingClientRect` + `getComputedStyle` 덤프 · live region 구조 덤프 |
| 칩 hit 분할 | 320×1100 (카드 전체가 뷰포트 안 — `elementFromPoint` 용) · 선택 조합 3종 · 0.25px 스캔 + `::before` computed |
| baseline 신선도 | 이번 probe 393 프레임 ↔ 저장소 baseline 11장 (채널 차 > 5) |

증거: `docs/qa/evidence/stage-5/visual-gap-s5c/`
- Figma: `figma-29-62.png` (S5-B 증거 사본 — 같은 노드)
- 구현: `impl-{393,320}-{state}.png` 22장 · `impl-393-complete-reference.png` · `impl-320-card-{조합}.png` 3장
- computed: `computed-{393,320}-{state}.json` 22개 · `computed-393-complete-reference.json` · `bubble-html.json`
- 칩: `chip-split-320-{none, Big feelings+Stay Focus, Engaged+Ask Questions+Tricky today}.json` · `chip-before-320.json`
- 비교: `compare-figma-complete-vs-feedback-393.png` · `compare-states-320.png` · `baselines-contact-sheet.png`
- probe 소스: `vg5c.probe.spec.ts` · `vg5c-before.probe.spec.ts` (실행 시에만 `e2e/` 로 복사, 실행 후 제거 — 저장소 `e2e/` 에 남기지 않았다)

좌표 규칙: Web y = Figma y − 56.

## 1. 일치 확인 — Figma 재사용 부분 (Gap 없음)

| 요소 | Figma 선언 (node) | 구현 computed (393) | 판정 |
|---|---|---|---|
| 닫기 | `29:76` 38×38 @ (331, 66) | 38×38 @ (331, 10) = 완료 화면과 동일 박스 | ✅ |
| 제목 | `29:75` SF Pro Semibold(590) 15 · line normal · `text-primary` · y 76 | 590 15/20 · `rgb(74,95,92)` · y 19 · h 20 (완료 화면과 같은 y·h — 줄 20 흡수는 Stage 4 기존 처리) | ✅ |
| 링 | `29:86` 150 @ (121.5, 172) · SVG `fill white 0.5` · filter drop `dy6 σ2(=blur 4) ink 8%` + inner `dy1.5 white 90%` + inner `dy−1 ink 5%` | 150 @ (121.5, 116) · `rgba(255,255,255,.5)` · `--shadow-bubble` 3겹 동일 | ✅ |
| 아바타 | `29:87` 136 @ (128.5, 179) | 136 @ (128.5, 123) | ✅ |
| 스티커 | (피드백 화면엔 없음 — Spec §2.3) | `.haru-attendance-sticker` 0개 | ✅ |
| 버블 본체 | `88:929` `Speech Bubble` 297 · x 48 · fill `glass-fill-strong` white 90% · radius 22 · padding 14/16 · drop `0 6 4 #5E737014` + inset `0 1.5 0 #FFFFFFE5` · `0 −1 0 #5E73700D` (Style 이름은 `HARU/Shadow Rest` 5겹이나 인스턴스는 1+2 — `V-10` 선례) | 297 @ x 48 · `rgba(255,255,255,.9)` · 22px · `14px 16px` · 동일 3겹 | ✅ |
| 버블 위치 | tail 꼭짓점 324 → 본체 334.627 | 본체 y 278.63 (= 334.627 − 56) · 완료 화면 버블과 x/y/w 동일 | ✅ |
| 버블 문구 | 주 문구 SF Pro Bold 16 · line 22 · `text-primary` · 가운데 | 700 16/22 · `rgb(74,95,92)` · 같은 DOM 구조 (`haru-bubble--tail-top-center`) | ✅ |
| 버블 보조 줄 | `88:760` *"14 min together · sticker earned"* (완료 화면 전용 문구) | 없음 — Spec §2.3 "버블에는 `shortFeedback.text` 만" (`subtext=null`) | ✅ Spec 대로 (Figma 요소 생략이 아니라 다른 화면의 데이터 슬롯) |
| `R-SHADOW-1` | — | 새 `overflow` 0 · 가로 넘침 0 (393 · 320 전 상태) | ✅ |

## 2. Spec §2.3 대비 (Figma 없음)

| 항목 | Spec | 구현 | 판정 |
|---|---|---|---|
| Layout · 닫기 → 홈 | Fullscreen · close | `FullscreenLayout` · glass close · label *"Close"* | ✅ |
| h1 | *"Storytime notes"* · 완료 화면 제목 타이포·위치 | 같은 y 19 · 590 15/20 | ✅ |
| state slot | `aria-live="polite"` 1개 | slot polite 1개 — 단 하위 `InlineAlert`(`role=status` + polite) / `ErrorState`(`role=alert`) 가 중첩 | ⚠️ **VG5C-2** |
| Loading | Spinner *"Loading"* | Spinner · slot y 266 | ✅ |
| pending · failed · not-available ×2 | `InlineAlert info` · 문구 Spec 초안 | `InlineAlert info` · 문구 일치 · failed 버튼 0 | ✅ |
| analyzed / text null | 버블 = text / slot 비움 | 버블 = fixture text 그대로 / slot 자식 0 | ✅ |
| low-quality | text 있으면 버블 + 아래 InlineAlert | 버블 + InlineAlert (간격 16) | ✅ (간격 = 판단 2 — §3) |
| Error · Offline · Not found | `ErrorState` + *Try again* / *Go home* | 일치 | ✅ 문구 · ⚠️ 폭 **VG5C-1** |
| 배치 | InlineAlert top = ring bottom + 16 · 폭 = 컬럼 − 2×24 | 393: x 24 · w **345** · +16.0 / 320: x 24 · w **272** · +16.0 | ✅ |
| 버블 폭 (320) | 완료 화면과 같은 토큰 | x 24 · w 272 | ✅ |
| 모션 | 폴링으로 결과 도착 시만 C-2 enter 재사용 · reduced-motion 즉시 | `data-entrance='play'` 조건 · `@media no-preference` 안 | ✅ (코드 대조 — 실제 재생은 reduced-motion baseline 이라 미촬영) |
| baseline 11장 | dev 패널 0 · 정착 | 독립 probe 393 프레임과 **11장 전부 픽셀 동일 (채널 차 > 5 : 0 px)** · 패널 0 | ✅ `R-BASELINE-1` |

## 3. handoff §H5-4.3 판단 5건 — 판정

| # | 구현 판단 | 판정 | 근거 |
|---|---|---|---|
| 1 | 메달리온 자리 유지 (스티커 자리 높이만 두고 링 y = 완료 화면) | ✅ **Spec 대로** — 판정 필요 없음 | Spec §11 "완료 화면 상단과 골격 좌표 동일(제목·메달리온)". 링 (121.5, 116) = 완료 화면 = Figma `29:86`. 결과로 제목 아래 77px 빈 띠가 생기나 새 값 0 · 화면 간 전환 시 메달리온이 움직이지 않는다 |
| 2 | low-quality 버블 ↔ InlineAlert 간격 16 (`--space-4`) | ✅ 권고 수용 · **Spec 보완 기록 필요 (사용자 확인)** | Spec 은 "ring bottom + 16" 만 적었다. 같은 토큰을 앞 요소 기준으로 쓴 것은 새 시각 언어 0 원칙에 맞다. 권고: Spec §2.3 배치 줄을 "앞 요소 bottom + `--space-4`" 로 보완 |
| 3 | live region 중첩 | ⚠️ **VG5C-2** (사용자 결정) | 아래 §4 |
| 4 | 닫기 라벨 *"Close"* (완료 화면 *"Close session"*) | ✅ **Spec 대로** | Spec §2.3 close bar *"Close"*. 이 화면은 진행 중 세션이 없어 "session" 을 닫는 동작이 아니다 — 차이가 오히려 정확하다 |
| 5 | `ErrorState` 폭이 InlineAlert 보다 좁음 | ⚠️ **VG5C-1** | 아래 §4 |

## 4. Gap

| ID | Severity | 내용 (실측) | 원인 | 수정 권고 | 사용자 결정 |
|---|---|---|---|---|---|
| **VG5C-1** | **Medium** (상태 화면 불일치) | `ErrorState` 카드 폭이 **문구 길이에 따라 바뀐다** — 393: error **249** · offline **345** · not-found **285** / 320: 250 · 272 · 272 (렌더 실측). 같은 slot 의 InlineAlert 는 항상 345 / 272. 같은 화면에서 상태만 바뀌어도 카드 폭이 출렁인다 (`compare-figma-complete-vs-feedback-393.png` 6~8열) | `.haru-session-feedback__alert { display:flex; justify-content:center }` 가 `ErrorState` 의 `Surface` 를 내용 폭으로 줄인다 (`ErrorState` 내부 `.haru-state` 는 `inline-size:100%` 를 의도). `ErrorState` 자체 결함 아님 | ⓐ **(권고)** 앱 CSS 만 — `ErrorState` 를 감싼 wrapper 에서 자식이 폭을 채우게 (예: 그 wrapper 를 `display:block` 또는 자식 `flex:1`) → 모든 오류 카드 345/272 = InlineAlert 와 같은 열. 새 토큰 0 · Shared UI 변경 0. baseline 3장(error · offline · not-found) 재생성 필요 (`R-BASELINE-1` ⑤ 분해). ⓑ 현 상태 수용 → 허용 차이 등록 | **필요** — Spec §2.3 은 InlineAlert 폭만 적었고 `ErrorState` 폭은 명시하지 않았다 (C-13 화면은 화면별 사용자 승인). 권고 ⓐ |
| **VG5C-2** | **Low** (접근성 · 실제 SR 미검증 = NOT VERIFIED) | slot `aria-live="polite"` 안에 `InlineAlert`(`role=status` + `aria-live=polite`, 5상태) · `ErrorState`(`role=alert` = assertive, 3상태) 가 중첩. 버블만 있는 analyzed 는 단일. Spec §9.1 "aria-live 1개" 와 다르다. 일부 SR(VoiceOver 등)에서 같은 문구 **이중 낭독** 가능 | Shared UI 두 컴포넌트가 자체 live role 을 고정으로 가진다 (`InlineAlert.tsx:63-69` · `ErrorState` `announce` 는 `alert`/`status` 만) | ⓑ **(권고)** Shared UI 에 하위 호환 옵션 추가(예: `InlineAlert`·`ErrorState` 에 `announce="none"` — 기본값 그대로) 후 이 slot 에서만 끔 → slot 1개 = Spec 그대로, 폴링 전환(pending → 버블)도 slot 이 계속 알린다. ⓐ 현 상태 수용 + 실기기 SR 확인 후 판단. ⓒ slot 의 `aria-live` 를 빼고 버블에만 `role=status` — 새로 삽입된 live region 은 낭독이 불안정해 비권고 | **필요** — ⓑ 는 `packages/ui` API 변경 (Architecture/Shared UI 변경 보고 대상) |

Figma 재사용 부분(§1)에서 Gap 0. 문구는 Spec 초안(`N5-24` 승인)과 전부 일치.

## 5. 회고 카드 칩 hit 분할 — 320 (칩 3줄) 확인 (`D5-6`, H5-3 미측정분)

320 에서 칩은 `Engaged · Big feelings` / `Ask Questions · Stay Focus` / `Tricky today` 의 **3줄** (Spec §8.1 예상 2+2+1 과 같다). 선택 조합 3종(미선택 · `Big feelings`+`Stay Focus` · `Engaged`+`Ask Questions`+`Tricky today` — 31/33 혼합 포함)에서 x 로 겹치는 쌍 **5쌍 × 3 = 15 측정**.

| 확인 | 결과 | 판정 |
|---|---|---|
| 분할선 = 중간선 (아랫줄 top − 3.5) | `::before` computed: 첫 줄 아닌 칩 `top −4.5px`(미선택, border 1 가산) → hit 위 끝 = 박스 top − 3.5 = **중간선 599.5 / 639.5 정확**. `data-chip-row-follows` 는 2·3번째 줄 칩 전부에 붙음 (가운데 줄 포함) | ✅ |
| 중간선 ±1 소유 | 15쌍 전부 −1 = 윗줄 · +1 = 아랫줄 (0→1 3쌍, 1→2 2쌍) | ✅ |
| 스캔 전환점 | 15쌍 전부 598.5(윗줄) → 598.75(아랫줄) — 중간선 대비 −0.75. `elementFromPoint` 가 정수 px 해상도라 생기는 측정 오차 (computed 값은 정확히 중간선) | ✅ (해상도 내) |
| 바깥 끝 44 | 첫 줄 `::before` top·bottom −6.5 → 33+11 = 44 · 31+13 = 44 (위 끝 = 중심 −22) / 마지막 줄 아래 끝 = 중심 +22 (실측 +21.75, 해상도 내) | ✅ |
| 가운데 줄 | 위 = 중간선(분할), 아래 slop 5.5 는 다음 줄이 DOM 뒤라 중간선에서 끊김 — 같은 규칙이 3줄에서도 성립 | ✅ |
| 보이는 배치 | 칩 박스 · gap 7 · 줄 간격 40 그대로 (`impl-320-card-*.png`) | ✅ |

→ **Gap 없음.** 2·3번째 줄 칩의 hit 높이 42 (한쪽 44 미달) 는 `D5-6` 이 정한 기하적 결과다 (새 항목 아님).

## 6. 갱신한 문서 (design-agent 소유)

- `docs/FIGMA_SCREEN_MAP.md` — `/session/:sessionId/feedback` 행: C-13 명세 결정 · 구현 Page/Feature/재사용 노드/Contract/VG 등재. `29:62` 행: route 를 `/complete` 한 개로 정정(Spec §1 — `/reflection` 미생성). 머리 갱신 메모.
- `docs/COMPONENT_MAP.md` — `AnalysisStatusCard` → **만들지 않음**, `ShortFeedbackBubble` 로 대체(Spec §4) · `ShortFeedbackView` → `SessionFeedbackScreen` + `AnalysisStatusView` · `ReflectionForm` → `ReflectionCard` · `StarRating` 근거 노드 정정(`117:879` 아님, M-1) · 누락 표 해소 표기. 머리 갱신 메모.

## 7. 다음 단계

- 사용자 결정: **VG5C-1** (권고 ⓐ 폭 채움) · **VG5C-2** (권고 ⓑ Shared UI `announce` 옵션) · 판단 2 Spec 보완 문구.
- 결정 후 development-agent 수정 → 이 VG 재검토(VG5C-1 은 baseline 3장 재생성 분해 포함).
- 실제 스크린리더 낭독(VG5C-2)은 이 환경에서 미검증 — QA 에 `NOT VERIFIED` + 수동 절차(VoiceOver: pending → analyzed 폴링 전환 · error 진입 시 낭독 횟수) 로 넘긴다.

## 8. 재검토 — `D5-9` · `D5-10` · `D5-11` 수정 후 (design-agent, 2026-11-10)

Based on: handoff `docs/qa/stage-5-handoff.md` §H5-5 · 결정 `docs/decisions/stage-5-approvals.md` `D5-9`~`D5-11` · baseline `e2e/__screenshots__/darwin/session-feedback.spec.ts/` (error · not-found = 11-10 13:58 재생성, 나머지 9장 = 11-09 그대로). Production Code · Figma 수정 0. 허용 차이 등록 0.

### 8.1 어떻게 쟀는가

- §0 probe 를 그대로 재사용(feedback 11상태 × 393/320, chip split 제외) + 덤프 항목 추가: slot `aria-live`/`role` · slot 안 `[aria-live]` 수 · slot 안 `[role]` 목록 · 카드 wrapper computed(`flex-direction` · `justify-content`) · `.haru-surface` 박스. Playwright **단독** 실행 22 tests 통과 (23.0s, port 4319 = config 기본 — 5174 미사용). probe 는 실행 시에만 `e2e/` 로 복사, 실행 후 삭제.
- 비교 3종: ① 새 덤프 ↔ §0 덤프 (모든 키 diff) ② 새 393 프레임 ↔ 저장소 baseline 11장 ③ 새 393/320 프레임 ↔ §0 프레임 (채널 차 > 5).
- 증거: `docs/qa/evidence/stage-5/visual-gap-s5c-rereview/` — `computed-{393,320}-{state}.json` 22 · `impl-{393,320}-{state}.png` 22 · `vg5c-rereview.probe.spec.ts`.

### 8.2 판정

| Gap | 실측 (이번) | 이전 (§4) | 상태 |
|---|---|---|---|
| **VG5C-1** (`D5-9`) 카드 폭 | `.haru-surface` 393: error · offline · not-found 모두 **x 24 · w 345** / 320: 모두 **x 24 · w 272** = pending InlineAlert 와 같은 열. 버튼 393 **x 48 · w 297** · 320 **x 48 · w 224** (error · not-found). wrapper computed `flex-direction: column` · `justify-content: normal` (stretch). 가로 넘침 0 (22/22) | 393: 249 · 345 · 285 / 320: 250 · 272 · 272 | ✅ **해소** |
| **VG5C-2** (`D5-10`) 중첩 live region | 10상태(loading 제외) 모두 slot `aria-live="polite"` 1개 · slot 안 `[aria-live]` **0** · `[role]` **0**. 이전 안쪽 `InlineAlert role=status+polite`(5상태) · `ErrorState role=alert`(3상태) 이 덤프 diff 에서 정확히 사라졌다. analyzed · text-null 은 원래 단일 | InlineAlert 5 + ErrorState 3 중첩 | ✅ **해소** (적용 범위 내). 실제 SR 낭독은 여전히 `NOT VERIFIED` → QA 수동 항목 |
| **VG5C-3** (신규, 이번 재검토에서 발견) | **loading** 상태: slot polite 안에 `Spinner` 가 `role="status"` + `aria-live="polite"` 로 남아 있다 (393 · 320 동일). §4 VG5C-2 가 InlineAlert · ErrorState 만 세어 **이 1건을 빠뜨렸다** (design-agent 누락). Spec §2.3 의 "slot `aria-live` 하나" 와 다르다 | — (§2 표 loading 행 ✅ 로 판정했었다) | ⚠️ **열림 · Low** — 사용자 결정 필요 (아래 8.4) |
| **`D5-11`** 간격 16 | low-quality 버블 bottom 350.63 → InlineAlert top 366.63 = **16.00** (393 · 320). Spec §2.3 "(사후 확정 2026-11-10, user)" 문구에 `D5-11` · `D5-9` · `D5-10` 기록 확인 | 16 (구현 그대로) | ✅ **기록 완료** |

### 8.3 다른 곳이 움직이지 않았는가

- **덤프 diff (모든 키)**: error · not-found 의 버튼 x/w 와 live 목록, 나머지 상태의 live 목록 외 **변화 0** — 제목 · 닫기 · 링 · 메달리온 · 버블 · slot · InlineAlert 박스·computed 모두 §0 과 동일 (22 덤프).
- **픽셀 ③ (새 ↔ §0)**: 393 — error **38,945 px** (x 3~389, y 280~547) · not-found **28,504 px** (x 3~389, y 281~545) 외 9상태 **0 px**. 320 — error **11,572 px** (x 6~313, y 282~525) 외 10상태 **0 px** (320 offline · not-found 은 원래 272 라 불변). 393 수치는 handoff H5-5.5 분해(38,945 · 28,504)와 **정확히 같다** — 모두 카드 영역(y 280~547) 안이며 위쪽(제목 · 링, y < 280)은 0.
- **픽셀 ② (새 ↔ baseline)**: 11장 모두 **0 px** — baseline 은 현재 렌더와 일치, 스테일 없음.
- role 제거는 픽셀 0 (pending · low-quality · failed · not-available · no-recording · offline 393 = 0 px).

### 8.4 VG5C-3 — 선택지 (사용자 결정 필요, 허용 차이 자동 등록 안 함)

| | 내용 | 영향 |
|---|---|---|
| ⓐ 현 상태 수용 | polite 안 polite (assertive 아님) — 이전 VG5C-2 의 `alert` 보다 위험이 낮다. QA 수동 SR 항목에 loading 진입을 추가해 실기기에서 판단 | 코드 0 |
| ⓑ Shared UI 일관 옵션 | `Spinner` 의 기존 `decorative` 는 `aria-hidden` 이라 라벨 *"Loading"* 까지 숨겨 slot 이 읽을 문구가 사라진다 → 그대로 쓰면 안 된다. `InlineAlert`·`ErrorState` 와 같은 `announce="none"`(role 만 없음, 라벨 텍스트 유지) 을 `Spinner` 에 추가하고 이 slot 에서만 사용 | `packages/ui` API 추가 (하위 호환) · 픽셀 0 예상 · e2e "slot 안 live 0" 에 loading 추가 |

design-agent 권고: **ⓑ** (Spec §9.1 "aria-live 1개" 를 상태 전체에서 지킨다). 단 우선순위 Low — Stage 5 진행을 막을 사안은 아니다.

### 8.5 갱신한 문서

- `docs/COMPONENT_MAP.md` — `ErrorState` 행 Props 에 `announce`(`'alert'` 기본 · `'status'` · `'none'`), `InlineAlert / Banner` 행에 `announce`(`'auto'` 기본 · `'none'`) 와 사용 조건·사용처 등재. 머리 갱신 메모.
