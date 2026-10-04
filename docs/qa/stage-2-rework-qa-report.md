# Stage 2 온보딩 재구성 — QA Report

Status: **FAIL**
작성: stage-qa-agent · 2026-10-04
대상: `docs/plans/stage-2-onboarding-rework-plan.md` (APPROVED) · `docs/design/stage-2-onboarding-rework-design-spec.md` (APPROVED, 개정 2) · `docs/decisions/stage-3-approvals.md` §11 · `docs/design/stage-2-design-spec.md` §16 개정 6

---

## 1. Summary

| | |
|---|---|
| **Stage Verdict** | **FAIL** |
| 사유 | `QA-2R-001` (High) — `pnpm test:e2e` 가 **6건 실패**하고, 그 여파로 시각 baseline 1건(`s2-onboarding-saved`)이 재생성되지 않았다 |
| 판정 집계 | PASS **14** · PARTIAL **1** · FAIL **0** · NOT VERIFIED **0** · BIP **1**(AC-2R-15 의 서버 동작 부분) |
| Privacy Critical (`AC-2R-13`) | **PASS** — QA 독립 probe + 검사기 자체 검증(negative control) 포함 |
| 결함 3건 (`S2-FIX-1~3`) | **전부 PASS** (실측 증거) |
| Scope | **위반 0건** — `apps/api/`·`supabase/` 미존재 |

> 제품 동작 자체에서 발견된 결함은 없다. 실패한 e2e 6건 중 **5건은 테스트 쪽 전제 오류**이고 QA 가 독립 probe 로 제품 동작이 정상임을 반증했다. 그러나 **인도된 테스트 스위트가 레드**이고 baseline 1건이 비어 있으므로 `rules/qa.md` §2 에 따라 FAIL 이다.

---

## 2. Environment

| | |
|---|---|
| OS | macOS (Darwin 25.5.0, arm64) |
| Node | v24.21.0 |
| 브라우저 | Playwright 번들 Chromium (`@playwright/test` ~1.63.0) |
| 뷰포트 | 393×852 · `deviceScaleFactor: 1` · `reducedMotion: reduce` · `workers: 1` |
| Mock | `VITE_API_MODE=mock`, 시나리오 기본 `success`, 개별 probe 는 `?scenario=` 로 전환 |
| 실기기 | 없음 (이번 범위에 실기기 요구 항목 없음) |

### QA 가 작성한 검증 probe (Product Code 아님)

| 파일 | 용도 |
|---|---|
| `docs/qa/evidence/stage-2-rework-qa-privacy.probe.test.tsx` | `AC-2R-13` 전 구간 요청 로그 + negative control |
| `docs/qa/evidence/stage-2-rework-qa-cards.probe.test.tsx` | 카드 수 분모 (Trial 15 / 인증 16) |
| `docs/qa/evidence/qa-deck-walk.probe.spec.ts` | 15장 완주하며 카드별 상태 덤프 |
| `docs/qa/evidence/qa-deck-depth.probe.spec.ts` | 덱 depth·오프셋 실측 (`AC-2R-03`) |
| `docs/qa/evidence/qa-deck-surface.probe.spec.ts` | 흰 면 겹수·overflow 사슬 (`S2-FIX-3`) |
| `docs/qa/evidence/qa-row-geometry.probe.spec.ts` | 1줄/2줄 행 높이·상하 여백 (`S2-FIX-2`) |
| `docs/qa/evidence/qa-bottom-gap.probe.spec.ts` | 13 route 하단 인셋 (`S2-FIX-1`) |
| `docs/qa/evidence/qa-vstack.probe.spec.ts` · `qa-intro-geom.probe.spec.ts` | Figma 대조용 세로 실측 |
| `docs/qa/evidence/qa-swipe.probe.spec.ts` | 스와이프 제스처 (e2e 실패 3·4 원인 분리) |
| `docs/qa/evidence/qa-resume-cta.probe.spec.ts` | 부록 A-6-2 resume CTA 도달성 |
| `docs/qa/evidence/qa-clear-btn.probe.spec.ts` | 해제 IconButton (`179:1804`) |
| `docs/qa/evidence/qa-responsive.probe.spec.ts` | 320/393/600/1024 회귀 + 가입 폼 범위 |
| `docs/qa/evidence/qa.vitest.config.mts` · `qa.playwright.config.ts` | probe 전용 러너 설정 |

probe 추가 후 `pnpm typecheck` · `pnpm format:check` 재실행 → **PASS** (저장소 검증을 깨지 않음).

---

## 3. Commands Executed

| 명령 | 결과 |
|---|---|
| `ls apps/api supabase` | **없음** — Scope 위반 0건 |
| `pnpm test:e2e:update` (1회) | **6 failed / 131 passed** (5.0m) — §6 참조 |
| `npx playwright test e2e/onboarding.spec.ts` (재현) | **5 failed / 14 passed** — 동일 실패 재현 (경합 아님, 결정적) |
| `npx vitest run --config docs/qa/evidence/qa.vitest.config.mts` | **4 passed** (QA probe) |
| `npx playwright test --config docs/qa/evidence/qa.playwright.config.ts` | **전부 passed** (QA probe 13 케이스) |
| `pnpm typecheck` | PASS |
| `pnpm format:check` | PASS |
| `node --experimental-strip-types …/probe-detector.mjs` | 검사기 negative control 8케이스 |

> `typecheck` · `lint` · `lint:boundaries` · `build` · `format:check` · `test`(101 files / 1094 tests) 는 Orchestrator 가 이미 재실행해 PASS 를 확인했으므로 중복하지 않았다(`format:check`·`typecheck` 만 probe 영향 확인 목적으로 재실행).

---

## 4. Requirement Matrix

### 4.1 `AC-2R-01` ~ `AC-2R-15`

| ID | 판정 | 증거 |
|---|---|---|
| `AC-2R-01` | **PASS** | QA deck-walk probe — 4 route 가 모두 열리고 제목이 `Reading together` → `Books and interests` → `Growing together` → `Capability` 로 바뀐다. 제목은 `.haru-top-bar` 의 `<h1>` |
| `AC-2R-02` | **PASS** | QA deck-walk probe — 15장 전 카드에서 `h2count=1`. 동시에 2문항 0건. 카드 단계 `submitCTA=0` (마지막 카드만 1) |
| `AC-2R-03` | **PASS** | QA deck-depth probe @`capability-items` — 카드 3장. x `24 / 32 / 40`, w `345 / 329 / 313` (**좌우 각 8 감소**), bottom `715 / 731 / 747` (**+16**). Figma `179:1783/1782/1781` = x `24/32/38`, w `345/329/313`, bottom `710/726/742` (+16). 폭·Y 오프셋 **정확히 일치** |
| `AC-2R-04` | **PASS** | QA cards probe — `surveyCards` byStep **[2, 3, 1, 10] = 16** (인증), **[2, 2, 1, 10] = 15** (Trial, Q5 카탈로그 없음). `§11.16` 확정 구성과 일치 |
| `AC-2R-05` | **PASS** | QA privacy probe — 가입 폼에 `YOUR CHILD` 섹션 + `First name`/`Last name` 존재(`hasYourChild=true`). 같은 폼에서 아이 값을 **실제 입력한 뒤** 제출한 `AuthGateway.signUpWithEmail` payload = `{caregiverName, email, password:[redacted]}` — 아이 필드 **0건** |
| `AC-2R-06` | **PASS** | `onboarding-screens.test.tsx:212` (draft 값이 있으면 표시 전용 행, 재입력 요구 없음) · `:238`(연필 → 편집 → Done). **단 시각 baseline 은 미확보 → `QA-2R-003`** |
| `AC-2R-07` | **PASS** | `SignUpForm.tsx:98` `validateChildDraftFields` 로 입력 지점에서 범위 검사 · `onboarding-screens.test.tsx:226`(행 탭 → 인라인 편집) · `:257`(`missing-prefill` 은 처음부터 편집 모드, 오류 안 띄움) → 데드락 0 |
| `AC-2R-08` | **PASS** | 통산 카운터 확인: `1 / 15`@reading-together → `3 / 15`@books-and-interests(단계 경계 연속) → `6 / 15` → 스와이프 후 `7 / 15`@capability. 분모는 구간별 파생값(Trial 15 / 인증 16 / `owned-books-empty` 15) — `§11.19` 7-1 대로 **정상** |
| `AC-2R-09` | **PASS** | `copy.ts` 는 `counter(index,total)` · `duration(minutes,cards)` **함수 슬롯만** 소유. UI/copy 에 카드 수 리터럴 grep 0건. intro 가 Trial 에서 `About 3 minutes · 15 cards` 로 자동 추종(baseline `s2-onboarding-intro.png`). `instrument-v2` 추종 테스트 `onboarding-screens.test.tsx:650` |
| `AC-2R-10` | **PASS** | 실측 필수/선택이 instrument 와 일치 — Q1·Q4·Q2 는 미응답 시 `aria-disabled=true`, Q3·favorites·Baseline 10 은 `aria-disabled=null`. 화면 하드코딩 없음(`onboarding-screens.test.tsx:372·389·398·410`) |
| `AC-2R-11` | **PASS** | QA resume probe — `/onboarding/start`(`243:1147`) → `child-info`(`248:1159`) → `/onboarding`(`179:1748`) → `reading-together` 순서 동작 |
| `AC-2R-12` | **PARTIAL** | 비교 수행·기록은 §5 에 있다. **누락 3건**: ① `248:1159` 의 prefilled/인증 변형 baseline 부재(두 baseline 이 바이트 동일 — `QA-2R-003`) ② `179:1809` baseline 미생성(`QA-2R-001`) ③ ProgressBar→카드 간격 차이가 허용 차이표에 없음(`QA-2R-002`) |
| `AC-2R-13` | **PASS** (Critical) | §7 전용 절 참조 |
| `AC-2R-14` | **PASS** | `e2e/onboarding.spec.ts:38` 통과 — Trial 로 intro 2화면 + child-info 를 지나는 동안 `/v1/` 요청 **0건**. `onboarding-screens.test.tsx:702·719`(응답이 기기 로컬 draft 에만 남고 schema 통과) |
| `AC-2R-15` | **PASS** (Frontend) | Q5 가 제목 체크박스 목록으로 8종 표시, 카드 key `books_and_interests.owned_books` 가 byStep 3 에 포함(QA cards probe). `onboarding-screens.test.tsx:542`(제목이 fixture 에서 온다) · `:568`(카탈로그 비면 카드·카드 수 감소) |
| 〃 (서버 부분) | **BACKEND_INTEGRATION_PENDING** | "선택 결과가 추천 후보에서 제외" 는 서버 동작. 대기 사유: 추천 엔진·`children.owned_books` 저장. Handoff 대상: `docs/BACKEND_HANDOFF.md` · `docs/DATA_REQUIREMENTS.md` (`P2-BIP-13` · `P2-BIP-18` · `P2-BIP-19`) |

### 4.2 결함 3건 (`stage-2-design-spec.md` §16 개정 6)

| ID | 판정 | 증거 |
|---|---|---|
| `S2-FIX-1` | **PASS** | `AppColumn.css:24` = `padding-block-end: max(var(--layout-safe-bottom), var(--layout-cta-bottom-gap))` — **덧셈 아님**. QA bottom-gap probe: `StackLayout` **13 route 전부** `padding-block-end=44px`, `gapClass=true`. 신규 토큰 `--layout-cta-bottom-gap: calc(var(--spacing) * 11)` 1건 |
| `S2-FIX-2` | **PASS** | QA row-geometry probe — **1줄 행 h=44**(`minH 44` 가 이김, **회귀 0px**), 2줄 행 h=64, 두 경우 모두 `gapTop=12 / gapBottom=12` **상하 동일**. `RadioGroup.css` 에 `padding-block: var(--space-3)` 추가 1줄 |
| `S2-FIX-3` | **PASS** | QA deck-surface probe — 앞 카드 자신 `bg=rgba(0,0,0,0)`, `padding=0px`, `backdrop=none`. 흰 면은 `renderItem` 의 `.haru-surface` **1겹** (`rgba(255,255,255,0.9)`, radius 28, **padding 24** = Figma `179:1783` 내부 여백 24 일치). overflow 사슬에 덱 내부 신규 절단 **0건**(앱 스크롤 컨테이너 1개만, 선행 존재). `SwipeDeck.tsx` diff 0줄 · `SwipeDeck.css` `overflow` 0건 (Orchestrator 확인) |

### 4.3 `§11` 결정 준수

| 결정 | 판정 | 증거 |
|---|---|---|
| `S2R-OPEN-4` CTA 제거 | **PASS** | 15장 전 카드 `submitCTA=0`, **마지막 카드(#14)만 1**. `onboarding-screens.test.tsx:363·422` |
| `S2R-OPEN-3` 자동 전진 | **PASS** | `AUTO_ADVANCE_DELAY_MS = 400` 명명 상수. e2e `onboarding.spec.ts:127`(포인터 단일 선택 → 전진) · `:135`(**키보드 선택은 전진 안 함**) · `:146`(**돌아온 카드에서 전진 안 함**) · `:162`(포커스 이동) **4건 모두 통과**. `prefers-reduced-motion` 은 슬라이드만 제거(`SurveyCardDeck.tsx:17`) |
| `§11.11` Q5 = 제목 목록 | **PASS** | Q5 가 Q2·Q3 와 같은 체크박스 행. UI 에 `grid` 사용 0건. 8권 제목은 fixture 소유 |
| `§11.13` favorites 검색 제거 | **PASS** | onboarding feature·mock 에 검색 심볼 grep **0건**. e2e `onboarding.spec.ts:220` 통과(검색 입력 없음, 제목 직접 입력) |
| `§11.9` `Books at home` 삭제 | **PASS** | `homeBooks`·`HOME_BOOKS_MAX`·`BooksStep`·`homeAdd` 제품 코드 **0건**. 남은 것은 ① 삭제를 증명하는 contracts 테스트 ② 삭제 사실을 적은 주석 ③ `useBookSearch.ts` JSDoc 의 낡은 참조 1줄(`QA-2R-007`) |
| `R-13` 제목 `Capability` | **PASS** | `copy.ts:127` `capability_items: 'Capability'`. 실측 TopBar 제목 `Capability` |
| `R-02` 카운터 `n / 16` | **PASS** | 파생값. 숫자 하드코딩 0건 |
| `R-08` 인라인 편집 | **PASS** | `onboarding-screens.test.tsx:226·238` |
| `R-07` Trial 안내 미로그인 전용 | **PASS** | `OnboardingWizard.tsx:199` `<TrialNotice isTrial={wizard.isTrial} />`. `onboarding-screens.test.tsx:283` |
| `§11.15` 상한 초과 처리 차이 | **PASS** (불일치로 보지 않음) | Q2·Q3 교체 ↔ favorites 거절은 `§11.15` 가 **의도된 차이로 확정**. `ChoiceQuestionCard.tsx:10` · `FavoriteBooksCard.tsx:52` 에 근거 주석, copy 가 차이를 설명 |
| `AC-2-05` 유지 | **PASS** | `SignUpWithEmailInput.strict()` 유지, 아이 필드 0건 (Orchestrator 확인 + QA probe payload) |
| `AC-2-13` 강화 | **PASS** | 검사 구간이 가입 요청 포함 전 구간으로 확대됨을 QA probe 가 실증 (§7) |

### 4.4 공통 체크리스트

| 항목 | 판정 | 증거 |
|---|---|---|
| Scope — Backend 코드 | **PASS** | `apps/api`·`supabase` 없음. `apps/` = `web` 만, `packages/` = `config·contracts·design-tokens·ui` |
| Type Safety | **PASS** | `pnpm typecheck` PASS. 변경·신규 파일 diff 에 신규 `any`/`as any`/`@ts-ignore` **0건** |
| 레이어/경계 | **PASS** (단 `QA-2R-005` 구조 기록) | `lint:boundaries` PASS(Orchestrator). `app → features` 는 적법 방향 |
| Design Token | **PASS** | 재구성 신규·변경 화면 파일에 임의 HEX·arbitrary Tailwind value **0건**. 신규 토큰 1건(`--layout-cta-bottom-gap`), `book-cover-sm` 0건(`§11.11` 대로 Stage 3 이월) |
| Mock Data 하드코딩 | **PASS** | Q5 8권·역량 문항이 fixture/instrument 소유. UI 하드코딩 0건 |
| Responsive (`AC-2-59` 회귀) | **PASS** | 320 / 393 / 600 / 1024 전부 가로 스크롤 **false**. ≥600 에서 앱 컬럼 **480px 가운데 정렬**(600→x60, 1024→x272) |
| Privacy — Secret | **PASS** | `VITE_*` = `VITE_API_MODE`·`VITE_API_BASE_URL`·`VITE_MOCK_SCENARIO` 뿐. Secret 0건 |
| Privacy — 콘솔 PII | **PASS** | 제품 코드 `console.*` 는 `shared/lib/logger.ts` 3곳뿐이며 `sanitizeContext()` 화이트리스트 통과값만 기록. QA probe 가 요청 로그에 아이 이름 문자열 **0건**을 값 단위로도 확인 |
| 제3자 SDK | **PASS** | 광고·분석 SDK 의존성 0건 |
| 로그아웃 시 로컬 정리 | **PASS** | `useSignOut` 이 같은 `OnboardingDraftStore.clear()`. e2e `home.spec.ts:70` 통과. **미가입 이탈자 경로는 `QA-2R-004`** |
| 전체 테스트 스위트 | **FAIL** | `pnpm test:e2e` 6건 실패 (`QA-2R-001`) |

---

## 5. Figma 대조 결과

> ⚠️ **측정 방법**: `get_screenshot` 의 PNG 는 프레임(393×852)보다 큰 **449×908** 로 렌더되어 좌우·상하 각 28px 의 베젤 여백을 포함한다. 과거 QA 가 이 이미지에서 직접 잰 수치가 틀렸던 원인이다. 이번 대조의 모든 Figma 수치는 **`get_metadata` 좌표**이며, Figma 프레임의 상단 56px status bar 는 웹에 없으므로 **−56 정규화**해 비교했다.

### 5.1 `179:1770` — 설문 카드 (4단계 공통)

| 항목 | Figma (−56 정규화) | 구현 실측 | 판정 |
|---|---|---|---|
| 앞 카드 x / w | 24 / **345** | 24 / **345** | ✅ 일치 |
| 뒤 카드 1 x / w | 32 / **329** | 32 / **329** | ✅ 일치 |
| 뒤 카드 2 x / w | **38** / 313 | **40** / 313 | ⚠️ x Δ2 — Figma 내부 슬립(폭은 −16 씩인데 x 는 +8, **+6**). 구현의 40 이 중앙 정렬상 기하학적으로 옳다 |
| 뒤 카드 bottom 단차 | +16 / +16 | +16 / +16 | ✅ 일치 |
| 카드 내부 여백 | 콘텐츠 x24 · counter y24 | dx 24 / dy 24 | ✅ 일치 (`S2-FIX-3` 효과) |
| 문항 블록 | x24 y99 h104 | dx24 dy100 h100 | ✅ ±4 |
| 문항 → 옵션 | 45 | 24 | ✅ `AD-S2R-10` 승인된 차이 |
| 옵션 행 | 297×43, 간격 7 | 297×44(1줄)/64(2줄), 간격 8 | ✅ `AD-S2-*` 흡수 + `S2-FIX-2` |
| 해제 IconButton | 카드 우측에서 15, 위에서 12, 38×38 | 우측 12, 위 12, 38×38 | ✅ ±3. 응답 후에만 노출. `§11.8` 의 22px 회수 실현 |
| TopBar 제목 | `Capability-items` | `Capability` | ✅ `AD-S2R-09` |
| 카드 안 카운터 | `1 / 10` | `6 / 15` | ✅ `R-02` 파생값 |
| 하단 CTA | 없음 | 없음 | ✅ `AD-S2R-08` |
| ProgressBar | 단일 track 345×6 | **4구간 분할** 345×6 | ✅ `R-02`/§3.3 승인 |
| **ProgressBar → 카드 간격** | 42 | **16** | ❌ **미등록 차이** — Design Spec §3.1 은 `--space-6`(24) 를 명시 → `QA-2R-002` |
| **카드 top** | 108 | **78** | ❌ 위 간격의 결과. Design Spec §5 표의 "카드 top 98" 과도 Δ20 |

### 5.2 `243:1147` — 프로필 intro (`/onboarding/start`)

| 항목 | Figma (−56) | 구현 | 판정 |
|---|---|---|---|
| 캐릭터 | y54, 200×200 | y24, **188×188** | ✅ 크기 = `AD-S2-3`, 상단 −30 = `AD-S2-19` (둘 다 Stage 2 에서 사전 등록) |
| 제목 | y303 | y260 | ✅ 위 −30 재분배의 연속 |
| InfoRow 1 / 2 | y506 / y563, 341×47 | y401 / y457, 345×48 | ✅ `AD-S2-10`·`AD-S2-19` 범위 |
| InfoRow 1 문구 | `About 1 minutes` | `About 1 minute` | ✅ `AD-S2R-02` (Figma 오타) |
| CTA 하단 여백 | 808 → 852 = 44 | 44 | ✅ `S2-FIX-1` |

### 5.3 `248:1159` — About your child

| 항목 | 판정 |
|---|---|
| Trial 안내(`248:1179`) | ✅ 미로그인 전용 렌더 (`R-07`) — baseline `s2-onboarding-childinfo-trial.png` |
| 섹션 간격 18 → 20 | ✅ `AD-S2R-04` |
| 연필 IconButton | ✅ `AD-S2R-05` |
| 성별 Tag | ✅ `AD-S2R-06` |
| 생년월 `March. 2023` → `2021-04` | ✅ `§11.19` 7-4 허용 차이 |
| **prefilled(표시 전용) 모드 baseline** | ❌ **없음** — `edit` baseline 이 `trial` 과 바이트 동일 → `QA-2R-003` |

### 5.4 `179:1748` — 설문 intro (`/onboarding`)

| 항목 | 판정 |
|---|---|
| 본문 숫자·기간 절 제거 | ✅ `AD-S2R-11` — `No right answers — we just need a starting point.` |
| InfoRow 1 `about 10 cards` → `15 cards` | ✅ `AD-S2R-01` + `AC-2R-09` 파생값 증거 |
| InfoRow 2 `Swipe each card away to move on` | ✅ Figma 원문 그대로 |
| 캐릭터·상단 여백 | ✅ `AD-S2-3` · `AD-S2-19` |
| 제목 | ⚠️ baseline 은 아이 이름이 없는 **fallback** 상태를 찍었다(Figma 는 `Hi — before your first night with Yuna…`). 동작은 copy 가 `{name}` 슬롯을 가져 정상이나, **이름 있는 상태의 baseline 이 없다** (`QA-2R-003` 과 같은 성격) |

---

## 6. 시각 baseline 생성 결과

`pnpm test:e2e:update` **1회** 실행.

| 구분 | 건수 | 내용 |
|---|---|---|
| **신규 생성** | **8** ✅ | `s2-onboarding-start` · `s2-onboarding-childinfo-trial` · `s2-onboarding-childinfo-edit` · `s2-deck-reading-together` · `s2-deck-books-q3` · `s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability` |
| **재생성(바이트 변경)** | 5 | `s2-consent` · `s2-deck` · `s2-onboarding-intro` · `s2-signup` · `s2-welcome` |
| 재생성(내용 동일) | 나머지 | 변경 없음 |
| **미생성** | **1** ❌ | `s2-onboarding-saved` — `visual.spec.ts:261` 이 `answerAllCards` 경합으로 실패해 **재촬영되지 않았다**. 기존 파일이 그대로 남아 **stale** |
| 삭제 | 1 | `s2-onboarding-step5.png` (→ `s2-deck-capability` 로 대체, staged) |

품질 소견: 신규 영역 클립 baseline 우하단에 **dev Scenario Panel(`scenario` 칩)** 이 함께 찍힌다. `HEAD` 의 `s2-onboarding-intro.png` 에도 있어 **이번 재구성이 만든 것은 아니다**(선행) → `QA-2R-006`.

---

## 7. `AC-2R-13` (Privacy Critical) — 판정과 증거

**판정: PASS.**

### ① 검사기 자체 검증 (negative control) — 먼저 수행

`findChildDataKeys` 에 가짜 아동 데이터를 주입해 실제로 탐지되는지 증명했다 (`node --experimental-strip-types`, 8 케이스).

```
빈 로그                           -> []
보호자 전용 가입 요청              -> []
주입1: 최상위 firstName            -> ["firstName"]
주입2: 중첩 childInfo.birthYearMonth -> ["birthYearMonth"]
주입3: 배열 안 gender              -> ["gender"]
주입4: answers 키                  -> ["answers"]
주입5: 깊은 배열+객체 혼합 child     -> ["child","lastName"]
주입6: 단계 키                     -> ["capabilityItems","reading_together"]
주입7: 값으로만 아이 이름(키 무해)   -> []        ← 키 기반 검사기의 알려진 한계
CHILD_DATA_KEYS count = 12
redactSecrets 중첩: {"a":{"password":"[redacted]","accessToken":"[redacted]","keep":1}}
```

→ 검사기는 **중첩 객체·배열 어느 깊이에서도** 금칙 키를 잡는다. 주입7 은 "키 이름이 무해하고 값에만 아이 이름이 있는" 경우를 못 잡는 한계인데, 이 공백은 QA probe 가 **값 단위 문자열 검사**로 따로 메웠다(아래 ②).

### ② 전 구간 실증 (QA 독립 probe)

구현자 테스트의 공백: `auth-screens.test.tsx:150` 과 `consent-screens.test.tsx:375` 는 **아이 입력란을 채우지 않고** 가입한다. `childDraft.test.ts:190` 은 폼을 거치지 않고 `saveChildDraft` + gateway 를 직접 호출한다. 즉 "**가입 화면의 아이 입력란에 실제로 타이핑한 뒤** 동의까지" 경로를 덮는 테스트가 없었다. QA 가 직접 재현했다.

```
QA-PROBE2 window ops:
["AuthGateway.signUpWithEmail","GET /v1/me","GET /v1/consent-documents/current","POST /v1/consents"]

QA-PROBE2 window payloads:
[{"operation":"AuthGateway.signUpWithEmail",
  "payload":{"caregiverName":"Sam Rivera","email":"sam@example.com","password":"[redacted]"}},
 {"operation":"GET /v1/me"},
 {"operation":"GET /v1/consent-documents/current"},
 {"operation":"POST /v1/consents","payload":{"items":[…5건…],"source":"signup_email"}}]

QA-PROBE2 localStorage key: haru.onboarding.draft.v1  hasChild: true
```

단언 결과 (3 케이스 전부 PASS):

1. `findChildDataKeys(window)` === `[]` — 동의 성공 **이전 전 구간**(가입 요청 포함) 아동 금칙 키 **0건**
2. `JSON.stringify(window)` 에 아이 이름(`Zephyrine`)·성(`Quintanilla`) **문자열 0건** — 값 단위로도 누출 없음
3. 같은 값이 `localStorage['haru.onboarding.draft.v1']` 에는 **있다** → "받되 전송은 나중에"(`R-01`) 분리가 실제로 성립
4. negative control — 같은 payload 를 요청 로그에 넣으면 `["birthYearMonth","firstName","gender","lastName"]` 로 **탐지된다**

### ③ Orchestrator 가 지적한 공백 (`§11.19`)

`apps/web/src/features/auth/model/__tests__/childDraft.test.ts` 가 **존재한다**(저장소 테스트 4종). 공백은 해소되었고, 폼 경유 경로는 위 QA probe 가 추가로 덮었다.

---

## 8. Findings

### QA-2R-001 | Severity: **High**

**Requirement**: Regression(`rules/qa.md` §5 "전체 테스트 스위트 통과") · `AC-2R-01` · `AC-2R-08` · `AC-2R-12` 의 검증 수단

**Steps to reproduce**
```
pnpm test:e2e:update     → 6 failed / 131 passed
npx playwright test e2e/onboarding.spec.ts   → 5 failed / 14 passed (결정적 재현)
```

**Expected**: e2e 스위트 통과, baseline 전건 재생성
**Actual**: 6건 실패. 제품 동작은 QA probe 로 **정상임을 반증**했으므로 5건은 테스트 쪽 전제 오류다.

| # | 실패 테스트 | QA 가 밝힌 원인 | 반증 증거 |
|---|---|---|---|
| 1 | `onboarding.spec.ts:58` 네 카드 단계 제목 | `getByRole('banner')` 를 쓰는데 카드 단계에 **banner landmark 가 없다**(`QA-2R-008`) | QA deck-walk: `.haru-top-bar` 의 `<h1>` 제목이 4단계 모두 정상 전환 |
| 2 | `onboarding.spec.ts:98` (`AC-2R-08`) | 2번째 카드 **Q4(필수)를 답하지 않고** `Next question` 을 누른다. 차단이 정상(`S2-ONB-1`) | `aria-disabled="true"` 상태 로그 + QA deck-walk 가 Q4 를 답하면 정상 전진 |
| 3 | `onboarding.spec.ts:272` 마우스 드래그 | `/onboarding/capability-items` 직접 진입 카운터는 **`6 / 15`** 인데 `2 / n` 을 기대 — `R-02` 통산 전환 미반영 | QA swipe probe: 드래그로 h2 가 ER1→ER2 로 바뀌고 `6 / 15 → 7 / 15` |
| 4 | `onboarding.spec.ts:307` 터치 드래그 | 동上 | QA swipe probe(CDP 터치) 동일 PASS. **`QA-2-001` pointer capture 회귀 아님** |
| 5 | `onboarding.spec.ts:338` 전 카드 완주 | `answerAllCards` 가 카드 전환 settle 없이 `getByRole('radio').first()` 를 잡아 경합 | QA deck-walk(250ms settle)는 **15장 완주 성공** |
| 6 | `visual.spec.ts:261` `s2-onboarding-saved` | 5번 helper 종속 | — |

**부수 피해**: 6번 실패로 `s2-onboarding-saved.png` 가 **재생성되지 않아 stale** 이다 (`AC-2R-12` PARTIAL 사유 ②).

**Evidence**: `/private/tmp/.../scratchpad/e2e-update.log` · 본 리포트 §6 · QA probe 출력
**Suspected area** (수정 지시 아님): `e2e/onboarding.spec.ts` (58·98·272·307) · `e2e/support/onboarding.ts` `answerAllCards`

---

### QA-2R-002 | Severity: **Medium**

**Requirement**: `AC-2R-12` · Design Spec §3.1

**Steps to reproduce**: `/onboarding/capability-items` 에서 TopBar·ProgressBar·카드의 `getBoundingClientRect()` 측정

**Expected**: Design Spec §3.1 `TopBar → (--space-4 = 16) → ProgressBar → (--space-6 = 24) → SwipeDeck`
**Actual**: 두 간격이 **모두 16**. 결과 카드 top = **78** (Figma 정규화 108 대비 −30, Design Spec §5 표의 "카드 top 98" 대비 −20)

```
topBar   y0   h40      (bottom 40)
progress y56  h6       (gap 16 ✅)
card     y78           (gap 16 ❌ — 24 이어야 함)
```

**Evidence**: `docs/qa/evidence/qa-vstack.probe.spec.ts` 출력
**영향**: 기능 영향 없음(세로 예산이 오히려 20px 늘어 Q5 638·ER1 637 모두 여유). **시각 차이이며 허용 차이표(`AD-S2R-*`)에 등록되어 있지 않다.**
**Suspected area**: `apps/web/src/features/onboarding-survey/ui/OnboardingWizard.tsx:151` 의 단일 `gap-4` 래퍼가 두 간격을 함께 지배한다

---

### QA-2R-003 | Severity: **Medium**

**Requirement**: `AC-2R-12` (`248:1159` 비교 · `R-07`/`R-08` 상태 분기)

**Steps to reproduce**
```
md5 e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-childinfo-{trial,edit}.png
→ 둘 다 1cc53fae09f0db000cb61c06edfd2a2a (cmp 결과 IDENTICAL)
```

**Expected**: `trial`(안내 있음) 과 `edit`/prefilled(표시 전용) 가 **서로 다른 상태**를 고정
**Actual**: `visual.spec.ts:189` 와 `:200` 이 **둘 다 draft 없는 `/onboarding/child-info`** 로 들어가 같은 화면(편집 모드 + Trial 안내)을 두 번 찍는다. 그 결과

- `R-08` prefilled **표시 전용** 모드 baseline **없음**
- `R-07` 인증 상태(안내 **없음**) baseline **없음**
- `179:1748` 도 아이 이름 없는 fallback 제목 상태만 고정

**Evidence**: md5 동일 · `e2e/visual.spec.ts:189-208`
**완화**: 동작 자체는 `onboarding-screens.test.tsx:212·226·238·283` 이 덮으므로 `AC-2R-06`·`R-07` 은 PASS. 시각 회귀 보호만 비어 있다.
**Suspected area**: `e2e/visual.spec.ts` 의 두 테스트 진입 상태 (`prefilled-child-info` 시나리오·인증 harness 미사용)

---

### QA-2R-004 | Severity: **Low**

**Requirement**: `rules/architecture.md` §9(로컬 데이터 정리) · Stage 0 `C-15` 이월 등록 · 부록 **A-6-3**

**Steps to reproduce**: "가입 실패/이탈 후 기기에 남는 아이 이름 draft" 를 영속 문서에서 검색

**Expected**: Stage 8 데이터 관리(C-15) 삭제 대상에 등재
**Actual**: `docs/qa/stage-2-rework-handoff.md:446` **한 곳에만** 있다. `PLANNING.md` 의 Stage 8 / C-15 / FR-21 범위와 `docs/decisions/**` 에 **없다**. Stage handoff 는 Stage 단위 산출물이라 Stage 8 계획 시 읽히지 않을 수 있다.
또한 미가입 사용자는 로그아웃 경로가 없어 이 값을 **지울 UI 가 현재 0건**이다(인증 사용자는 `useSignOut` 이 정리).

**Evidence**: grep — `PLANNING.md:97·282` C-15 범위에 해당 항목 부재
**Suspected area**: `PLANNING.md` Stage 8 / `FR-21` 행 (QA 는 수정 권한 없음)

---

### QA-2R-005 | Severity: **Low** (구조 판단 — 수용 가능)

**Requirement**: `rules/architecture.md` §3 · 부록 **A-6-1**

**판단: 수용 가능. Finding 으로 등록하되 차단 사유가 아니다.**

근거
- 의존 방향 `app → features` 는 **적법**하다(`app → pages → features → entities → shared`). `pnpm lint:boundaries` 통과.
- 동작(동의 직후 저장 지점 복귀)은 `§11.19` 7-2 로 **사용자 승인**되었다.
- 가져오는 것은 순수 함수 2개(`hasAnyAnswers`, `pathForStep`)뿐이고 feature 상태를 건드리지 않는다.

다만 기록해 둘 것
- `pathForStep` 은 **route 매핑**이라 본래 `shared/config/routes.ts` 소유가 자연스럽고, `hasAnyAnswers` 는 Guard 가 이미 import 하는 `shared/lib/onboarding-draft` 에 둘 수 있다. 그러면 `app/guards` 가 feature barrel 전체를 의존 그래프에 끌어오지 않는다.
- 구현자가 이번에 `features/.../childInfo.ts` → `shared/lib/child-info.ts` 로 **같은 패턴을 이미 적용**했으므로 일관성 측면에서도 후속 정리 대상이다.

**Evidence**: `apps/web/src/app/guards/useGuardDecision.ts:21`

---

### QA-2R-006 | Severity: **Low** (선행 존재)

**Requirement**: `AC-2R-12` baseline 품질

**Actual**: 영역 클립 baseline 우하단에 dev **Scenario Panel**(`scenario` 칩)이 함께 찍힌다. Figma 대조용 이미지에 dev 전용 UI 가 섞여 회귀 판독을 흐린다.
**선행 확인**: `git show HEAD:e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-intro.png` 에도 동일하게 존재 → **이번 재구성이 만든 것이 아니다.**
**Suspected area**: `apps/web/src/dev/DevOverlay.tsx` 의 패널이 클립 대상 `main` 영역과 겹친다

---

### QA-2R-007 | Severity: **Low**

1. `e2e/visual.spec.ts:124` 테스트 이름이 아직 `179:1724 보호자 영역만` 이다. `AD-S2R-07` 로 **전체 프레임** 비교로 바뀌었고, QA 실측상 `form` 클립에 `YOUR CHILD` 섹션(`First name`·`Last name`)이 실제로 **포함된다** — 내용은 맞고 **이름만 낡았다**.
2. `apps/web/src/entities/book/useBookSearch.ts:5` JSDoc 이 삭제된 `BooksStep` 을 참조한다. `useBookSearch` 는 현재 `entities/book/index.ts` 재공개 외 **사용처 0건**(`§11.13` 으로 온보딩 검색 제거). Stage 3 Library 가 쓸 수 있으므로 삭제 여부는 판단 사항.

---

### QA-2R-008 | Severity: **Low** (선행 존재)

**Requirement**: 접근성 — landmark 구조

**Actual**: `/onboarding/:step` 에서 `getByRole('banner')` 가 **존재하지 않는다**. `StackLayout` 의 `topBar` 슬롯(= `<main>` 밖)을 쓰지 않고 `OnboardingWizard` 가 `<header class="haru-top-bar">` 를 **`<main>` 안에** 렌더하기 때문에 HTML-AAM 상 `banner` role 이 박탈된다.

```
landmarks = ["MAIN[role=]", "HEADER[role=]"]   ← header 가 main 의 자손
```

**완화**: 제목은 `<h1>` 으로 남아 있어 스크린리더가 읽는다. 다른 화면(`/auth/*`·`/`·`/settings`)은 `topBar` 슬롯을 써 정상이다.
**선행 확인**: `git show HEAD:…/OnboardingWizard.tsx` 에도 동일 구조 → 이번 재구성이 만든 것이 아니다. 다만 **`QA-2R-001` 1번 실패의 직접 원인**이다.
**Evidence**: `docs/qa/evidence/qa-dom-dump.probe.spec.ts` 출력

---

## 9. NOT VERIFIED

**없음.** 이번 범위에 실기기·미승인 도구가 필요한 항목이 없었다.

---

## 10. BACKEND_INTEGRATION_PENDING

| 항목 | 대기 사유 | Handoff 대상 문서 |
|---|---|---|
| `AC-2R-15` — Q5 선택이 추천 후보에서 제외 | 추천 엔진이 서버에 있다. Frontend 는 `ownedBooks` 제출까지만 책임 (Frontend 부분은 `AC-2R-15` 로 **PASS** 판정 완료) | `docs/BACKEND_HANDOFF.md`, `docs/DATA_REQUIREMENTS.md` — `P2-BIP-13` |
| `P2-BIP-18` — Q5 책 카탈로그를 `instrument.questions[owned_books].options` 로 제공 | Frontend 는 책 제목을 보유하지 않는다. Mock fixture 로만 재현 (Trial 15 / 인증 16 분모 차이의 원인) | `docs/BACKEND_HANDOFF.md`, `docs/API_CONTRACTS.md` |
| `P2-BIP-19` — `children.owned_books uuid[]` 저장 | DB 스키마·소유권 검증 필요 | `docs/DATA_REQUIREMENTS.md` |
| 서버 측 동의 강제 · Consent History | 동의 이전 전 구간 아동 데이터 0건은 Frontend 에서 **PASS** 입증(`AC-2R-13`). 서버 강제는 Backend 책임 | `docs/AUTH_REQUIREMENTS.md`, `docs/BACKEND_HANDOFF.md` |

---

## 11. Regression

| 항목 | 결과 |
|---|---|
| `pnpm test` | **PASS** — 101 files / 1094 tests (Orchestrator 재실행 확인) |
| `pnpm typecheck` · `lint` · `lint:boundaries` · `build` · `format:check` | **PASS** (Orchestrator) + QA probe 추가 후 `typecheck`·`format:check` 재확인 **PASS** |
| `pnpm test:e2e` | **FAIL** — 6건 (`QA-2R-001`) |
| `AC-2-59` 반응형 | **PASS** — 320/393/600/1024 가로 스크롤 0, ≥600 앱 컬럼 480 가운데 정렬 |
| `AC-2-27`·`C-12` Trial 요청 0건 | **PASS** — `e2e/onboarding.spec.ts:38` |
| `AC-2-25`·D-9 제스처 없이 완주 | **PASS** — `e2e/onboarding.spec.ts:173` · `:204` |
| `QA-2-001` pointer capture | **회귀 없음** — QA swipe probe 가 마우스·CDP 터치 양쪽 전진 확인. `SwipeDeck.tsx` diff 0줄 |
| `QA-1-L1` 그림자 절단 | **회귀 없음** — 덱 내부 overflow 사슬 0건 |
| 동의·로그아웃 경로 | **PASS** — `e2e/consent.spec.ts` · `e2e/home.spec.ts` 전건 통과 |
| 1줄 선택지 행 높이 | **회귀 0px** — 44 유지 (`S2-FIX-2`) |

---

## 12. 다음 조치

Stage Verdict 가 `FAIL` 이므로 development-agent 수정 → 재검증이 필요하다. 우선순위:

1. **`QA-2R-001`** (High) — e2e 5건의 전제 수정 + `answerAllCards` settle 보강. 수정 후 `pnpm test:e2e:update` 재실행해 `s2-onboarding-saved` baseline 생성.
2. **`QA-2R-002`** (Medium) — ProgressBar → 카드 간격을 Design Spec §3.1 의 `--space-6`(24) 로 맞추거나, 16 을 유지한다면 허용 차이로 **등록 승인**을 받는다 (QA 가 임의 수용하지 않는다).
3. **`QA-2R-003`** (Medium) — `248:1159` prefilled/인증 상태 baseline 분리.
4. `QA-2R-004`~`008` (Low) — 문서 등재·명명·구조 정리. 차단 사유는 아니다.

---

## 13. 재검증 이력

| 회차 | 일시 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-10-04 | **FAIL** | 최초 검증. `QA-2R-001`~`008` 등록 |

---

# 부록 Q — 재검증 2회차 (2026-10-04, 수정 루프 1회차 대상)

본문·Findings 는 그대로 두고 **차이분만** 기록한다. 범위는 `QA-2R-001`~`008` 해소 확인 + 이번 수정분이 건드린 영역의 회귀다 (전체 재검증 아님).

## Q-0. 재검증 Verdict

| | |
|---|---|
| **Stage Verdict** | **FAIL** |
| 사유 | 신규 `QA-2R-009` (Medium) — Trial 에서 고른 `languageEnvironment` 가 **가입 제출 시 조용히 지워진다**. 해피 패스 실측. |
| `QA-2R-001`·`002`·`003`·`004` | **전부 해소** |
| `QA-2R-005`·`006`·`008` | 후속 대상 등재 확인 — 사용자 명시 수용 → Verdict 계산 제외 |
| `QA-2R-007` ①② | **해소** (이번에 처리됨) |
| `AC-2R-12` | `PARTIAL` → **PASS** (재판정) |
| `AC-2R-15` 서버 부분 | `BACKEND_INTEGRATION_PENDING` 유지 |

> `QA-2R-009` 를 사용자가 항목으로 수용하면 `rules/qa.md` §2 에 따라 `PASS (accepted: QA-2R-009)` 가 된다. QA 가 스스로 수용하지 않는다.

## Q-1. 수정 범위 실측 — Product Code 변경은 3개 파일뿐

`find … -newermt "2026-10-04 00:00"` 로 수정 루프가 실제로 건드린 파일을 분리했다.

| 구분 | 파일 | 성격 |
|---|---|---|
| Product | `apps/web/src/features/onboarding-survey/onboarding.css` | `QA-2R-002` 간격 24 (신규 클래스 2) |
| Product | `apps/web/src/features/onboarding-survey/ui/OnboardingWizard.tsx` | 〃 상·하단 래퍼 분리 (로직 변경 0) |
| Product | `apps/web/src/entities/book/useBookSearch.ts` | **JSDoc 만** (`QA-2R-007` ②) — `git diff` 전부 주석 |
| Test | `e2e/onboarding.spec.ts` · `e2e/support/onboarding.ts` · `e2e/visual.spec.ts` | 전제·셀렉터·baseline 분리 |

즉 **설문 모델·필수 판정·Guard·Mock 은 한 줄도 바뀌지 않았다**. 제품 동작을 바꿔 e2e 를 통과시킨 흔적이 없다.

## Q-2. `QA-2R-001` (High) → **해소**

| 확인 | 결과 |
|---|---|
| `e2e/onboarding.spec.ts` 단독 실행 | **19/19 PASS** (20.4s) |
| **필수 미응답 차단이 살아 있는가** (`:99`) | **PASS — 차단 유지.** 테스트가 `aria-disabled=true` + `Answer this one to move on.` + `click({force:true})` 후 **카운터가 1 에 머무름**을 단정한다. 차단이 사라지면 카드가 2로 넘어가 이 테스트가 깨진다 (vacuous 아님) |
| 2번째 카드 Q4 전제 (`#2`) | 제품이 아니라 **테스트가** 두 문항을 모두 답하도록 바뀜. 필수 정의(`S2-ONB-1`)는 모델 파일 미변경으로 그대로 |
| `SwipeDeck.tsx` | `git diff --stat` **0줄** |
| `SwipeDeck.css` | `overflow` 선언 **0건** (파일 내 "overflow" 는 D-9 주석 1줄뿐). 변경분은 이번 수정 루프가 아니라 재구성 당시의 `S2-FIX-3` |
| `s2-onboarding-saved` baseline | **생성·내용 정상** — 캐릭터 + "Thank you — that's the starting point" + `Get started` |

## Q-3. `QA-2R-002` (Medium) → **해소** · 예산 재검산 (QA 독립 실측)

증거: `docs/qa/evidence/qa-vstack2.probe.spec.ts` · `qa-vstack3.probe.spec.ts` (393×852 / 320×852, **인증+동의 16장 전수**)

```
topBar bottom 40 → ProgressBar top 56   gap 16  (--space-4) ✅
ProgressBar bottom 62 → card top 86     gap 24  (--space-6) ✅
```

두 간격이 **분리**되었고 `--space-6`(24) · `--space-4`(16) 기존 토큰만 쓴다 (신규 토큰 0).

### 393px 예산 (budget = 852 − top 86 − CTA 44 − 뒤 카드 32 = **690**)

| 항목 | 값 |
|---|---|
| 최장 카드 | **662** — `#8` ER2 · `#9` AG1 · `#14` IM1 |
| **여유** | **28** |
| 다음 긴 카드 | `#4` Q5 646(여유 44) · `#7`·`#10`~`#13` 637(여유 53) · `#3` 591(99) |
| 예산 초과 카드 | **0장** |

→ 구현자 신고값(최장 662 · 여유 28 · Q5 646)과 **실측 일치**.

### 마지막 카드 + 제출 CTA — 구현자 보고의 정정

| 폭·간격 | 스크롤 컨테이너 | 페이지(document) |
|---|---|---|
| 393 / **24 (현재)** | `overflow-y-auto` **878 / 852 = 26px** | `scrollHeight` 852 — **페이지 스크롤 0** |
| 393 / 16 (비교군, CSS override) | **870 / 852 = 18px** | 852 — 0 |

- 26px 은 **페이지 스크롤이 아니라 앱 스크롤 컨테이너 내부 스크롤**이다 (handoff B-2 의 "26px 페이지 스크롤" 은 수치는 맞고 표현이 부정확하다).
- 같은 지점이 **간격 16 에서도 이미 18px 스크롤**이었다. 간격 24 의 기여분은 **+8px** 뿐 — "초과분 대부분이 간격이 아니다" 라는 구현자 설명이 실측으로 확인된다.
- Design Spec §13 "카드 고정 높이 없음 → 세로로 늘고 스크롤" 범위 안이다.

### 320px — 초과 카드가 **2장 → 3장**으로 1장 늘었다

| 간격 | 초과 카드 | 상세 |
|---|---|---|
| 16 (이전) | **2장** | `#4`(h736, −38) · `#9`(h712, −14) |
| **24 (현재)** | **3장** | `#3`(h696, **−6**) · `#4`(h736, −46) · `#9`(h712, −22) |

- 새로 걸린 것은 `#3`(Q3)뿐이고 **−6px**, 즉 뒤 카드 peek 32 가 26 으로 줄어드는 정도다. 잘림·겹침·버튼 밀림은 없다.
- Design Spec §9-3·§13 은 320px 에서 **스크롤로 귀착되는 것을 정상 동작**으로 명시한다(고정 높이 컨테이너 금지). 사용자 결정값 24 의 직접 결과이므로 **FAIL 사유로 쓰지 않고 실측만 기록**한다.

## Q-4. `QA-2R-003` (Medium) → **해소**

| baseline | md5 | 상태 |
|---|---|---|
| `s2-onboarding-childinfo-trial` | `69c0df3d…` | 미로그인 + draft → 표시 전용 + **Trial 안내 있음** (`R-07` A) |
| `s2-onboarding-childinfo` (신규) | `e8f471f2…` | 인증+동의 + draft → 표시 전용 + **안내 없음** (`R-07` B) |
| `s2-onboarding-childinfo-edit` | `1cc53fae…` | 미로그인 + draft 없음 → **편집 모드** |

- **세 md5 모두 다르다.** 스크린샷 육안 확인: `-trial` 에는 "Your answers stay on this device" 블록이 있고 신규본에는 그 블록과 gap 이 통째로 없다. 둘 다 `YOUR CHILD` 표시 전용 행 + 연필.
- 각 테스트에 **상태 단정**(`getByRole('button',{name:/Yuna/})` 존재 · `getByLabel('First name')` 0건 · Trial 문구 유무)이 들어가 있어 다시 겹치면 **스크린샷 이전에** 실패한다. 재발 방지 장치가 있다.
- → `R-07` 2상태를 실제로 덮는다.

## Q-5. `QA-2R-004` (Low) → **해소**

`PLANNING.md` **3곳** 등재 확인 (요구는 2곳).

| 위치 | 핵심 문구 |
|---|---|
| `:97` FR-21 행 | "미가입 기기에 남은 아이 정보 draft 삭제 경로 포함 (`QA-2R-004` — **미가입 사용자는 로그아웃 경로가 없어 현재 삭제 UI 가 0건**)" |
| `:283` Stage 8 이월 기능 추가분 | 원인(`R-01` 로컬 저장 · 로그아웃 경로 없음) + 근거 3곳 링크 |
| `:287` Stage 8 Deliverables `[FE · 이월 기능, C-15]` | "미가입 기기의 로컬 아이 정보 draft 삭제 경로 포함" |

핵심("미가입 사용자는 로그아웃 경로가 없어 삭제 UI 가 0건")이 담겨 있다.

## Q-6. `QA-2R-005`·`006`·`007`·`008` (Low)

사용자 명시 수용(이번 미처리) — **Verdict 계산에서 제외**한다.

| ID | 등재 여부 | 비고 |
|---|---|---|
| `QA-2R-005` | handoff 부록 B-6 에 후속 정리안 기록 ✅ | `app → features` 적법 방향, 차단 아님 |
| `QA-2R-006` | 〃 ✅ | dev Scenario Panel 이 신규 baseline 2종에도 그대로 찍힘(선행) |
| `QA-2R-007` ① | **해소** | `e2e/visual.spec.ts:116·130` 가 `AD-S2R-07`(전체 프레임 · form 클립)으로 갱신됨 |
| `QA-2R-007` ② | **해소** | `useBookSearch.ts` JSDoc 에서 `BooksStep` 참조 제거 + "현재 사용처 0건 · Stage 3 Library 소관" 명시 |
| `QA-2R-008` | 〃 ✅ | `banner` landmark 부재는 구조 변경이라 별도 승인 대상 |

## Q-7. `AC-2R-12` 재판정 — `PARTIAL` → **PASS**

| 누락 3건 | 현재 |
|---|---|
| ① `248:1159` prefilled/인증 변형 baseline 부재 | **해소** (Q-4, md5 3종 분리 + 상태 단정) |
| ② `179:1809`(`s2-onboarding-saved`) baseline 미생성 | **해소** (Q-2) |
| ③ ProgressBar→카드 간격이 허용 차이표에 없음 | **해소** — Design Spec §3.1 값(24)과 일치하게 수정되어 **등록할 차이 자체가 없어졌다** (Q-3 실측) |

## Q-8. 회귀 — 재생성 baseline은 의도한 8건뿐

| | |
|---|---|
| 전체 baseline | 50건 |
| 수정 루프에서 재생성 | **8건** — `s2-deck-reading-together` · `s2-deck-books-q3` · `s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability`(간격 24, 카드 top 78→86) · `s2-onboarding-childinfo-trial`(상태 교체) · `s2-onboarding-childinfo`(신규) · `s2-onboarding-saved`(생성) |
| 의도치 않게 바뀐 것 | **0건** — 나머지 42건은 mtime 불변 |

간격 변경은 `.haru-wizard-body` 클래스 신설로 **`OnboardingWizard` 안에서만** 적용된다. `AppColumn`·`StackLayout` 기본 규칙 미변경 → `frame-*`·`v*`·`s2-welcome/login/consent/signup/home-header` 등 다른 화면 baseline 영향 0. 육안 확인: `s2-deck-reading-together` 는 TopBar→ProgressBar 16, ProgressBar→카드 24, 뒤 카드 peek 정상.

## Q-9. 신규 Finding

### QA-2R-009 | Severity: **Medium**

**Requirement**: `R-01`(가입 화면 아이 정보 로컬 보관) · FR-03(중도 저장은 입력한 만큼 보존) · `childDraft.ts` 모듈 계약 · `AC-2R-06` 인접

**Steps to reproduce** (해피 패스, Mock 기본 시나리오)
```
/onboarding/start?scenario=me:consent-missing → Start the questions
→ About your child 에서 이름·생년월·성별 + 언어 "English" 선택 → Next
→ (설문 …) → Save profile → Create account 제출
```

**Expected**: 가입 제출이 로컬 draft 의 `child_info` 에 **이름·생년월·성별만 합쳐** 저장한다. 사용자가 고른 `languageEnvironment` 는 보존된다.
**Actual**: `languageEnvironment` 가 **`["english"] → []` 로 덮어써진다.** 다른 필드(`gender`·`readingRoutine`·`birthYearMonth`)는 보존된다.

```
QA-LANG after-child-info child_info={"firstName":"Yuna","birthYearMonth":"2020-04","gender":"girl","languageEnvironment":["english"]}
QA-LANG after-sign-up    child_info={"firstName":"Yuna","birthYearMonth":"2020-04","gender":"girl","languageEnvironment":[]}
```

**영향**
- 동의 직후 Guard 는 **저장된 단계**로 되돌리므로(`§11.19` 7-2) 해피 패스에서는 `About your child` 를 다시 지나지 않는다 → 사용자에게 **아무 안내 없이** 언어가 빠진 채 `POST /v1/onboarding/submit` 이 나간다.
- 화면 검증은 언어를 **필수**로 취급하는데(`shared/lib/child-info.ts:171` `languagesRequired`) 제출 경로는 비어도 통과한다 — `buildSubmitRequest` 는 `!== undefined` 만 보고(`submitRequest.ts:38-42`), contract 도 `z.array(...).max(n)` 로 **`.min(1)` 이 없다**(`packages/contracts/src/onboarding/child-info.ts:109`). UI 필수 ↔ 제출 선택의 불일치.
- 인증 상태로 `About your child` 에 돌아간 경우에는 언어 칩이 전부 해제되어 보인다 — **신규 baseline `s2-onboarding-childinfo` 가 이 상태를 그대로 고정**하고 있다.

**Evidence**
- `docs/qa/evidence/qa-langloss.probe.spec.ts` (위 출력)
- `docs/qa/evidence/qa-childinfo.probe.spec.ts` — `trial pressedChips=["English"]` vs `auth pressedChips=[]` (같은 로컬 draft)
- `e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-childinfo.png` 의 `AT HOME` 칩 전부 미선택

**Suspected area** (수정 지시 아님)
- `apps/web/src/shared/lib/child-info.ts:216` `partialChildInfoAnswers` 가 `languageEnvironment` 를 **빈 배열이어도 무조건 포함**한다. 바로 위 주석은 "빈 값은 키 자체를 넣지 않는다 (서버에 '지워 달라' 는 뜻이 되지 않게)" 라고 적혀 있어 **주석과 코드가 어긋난다**.
- `apps/web/src/features/auth/ui/SignUpForm.tsx:72-84` 는 draft 에서 `firstName`·`lastName`·생년월·`gender` 만 복원하고 `EMPTY_CHILD_INFO_FORM` 의 `languageEnvironment: []` 를 그대로 둔다 → `apps/web/src/features/auth/model/childDraft.ts:66` 의 `{ ...existing, ...childInfo }` 병합에서 기존 값을 덮어쓴다.
- **이번 수정 루프가 만든 결함이 아니다** (해당 3개 파일은 수정 루프에서 미변경). `QA-2R-003` 의 신규 인증 baseline 이 드러냈다.

## Q-10. 재검증에서 실행한 것

| 명령 | 결과 |
|---|---|
| `npx playwright test e2e/onboarding.spec.ts` | **19/19 PASS** |
| `docs/qa/evidence/qa-vstack2.probe.spec.ts` (393·320 전 카드 실측) | PASS |
| `docs/qa/evidence/qa-vstack3.probe.spec.ts` (간격 16↔24 비교군) | PASS |
| `docs/qa/evidence/qa-childinfo.probe.spec.ts` · `qa-langloss.probe.spec.ts` | PASS (결함 재현) |
| `pnpm typecheck` · `pnpm format:check` (probe 추가 후) | **PASS** |
| 7종 명령 전수 | Orchestrator 실행 — typecheck·lint·test·lint:boundaries·build·format:check·**e2e 138/138** |

> `QA-2R-001` 보충: Orchestrator 확인에 따르면 1회차의 e2e 동시 실행분 중 일부는 경합 flake 였다. 단, 1회차 리포트가 기록한 6건은 **단독 실행에서도 재현된 실제 실패**였고 이번에 전부 해소되었다. 판정 변화 없음.

## Q-11. 재검증 이력 (갱신)

| 회차 | 일시 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-10-04 | **FAIL** | 최초 검증. `QA-2R-001`~`008` 등록 |
| 2 | 2026-10-04 | **FAIL** | `QA-2R-001`~`004`·`007` 해소, `AC-2R-12` → PASS. `005`·`006`·`008` 사용자 수용. **신규 `QA-2R-009`(Medium) 1건** |

---

# 부록 R — 재검증 3회차 (2026-10-04, 수정 루프 2·3회차 대상)

범위는 지시대로 **`QA-2R-009` 해소 + 언어 선택화(§11.22) 검증 + 그 수정이 깨뜨린 것**만이다. 전체 재검증이 아니다.
7종 명령은 Orchestrator 가 이미 실행했다(typecheck · lint · test 101 files/1103 tests · lint:boundaries · build · format:check · **e2e 140 passed / 0 failed 단독 실행**) — QA 는 재실행하지 않고, 대신 **제품 동작을 직접 실측**했다.

## R-0. 재검증 Verdict

| | |
|---|---|
| **Stage Verdict** | **PASS** |
| `QA-2R-009` | **해소** — 브라우저 실측으로 확인 (R-2) |
| 언어 선택화(§11.22) 두 상태 구분 | **PASS** — 15/15 probe + 브라우저 실측 (R-3) |
| `QA-2R-005`·`006`·`007`·`008` (Low) | 사용자 명시 수용 → Verdict 계산 제외 |
| `AC-2R-12` | **PASS 유지** (R-6) |
| `AC-2R-15` 서버 부분 | `BACKEND_INTEGRATION_PENDING` 유지 |
| 신규 Finding | `QA-2R-010`·`011`·`012` — **전부 Low, 전부 주석·문서 위생**이며 제품 동작·AC 와 무관하다. 요구사항 판정을 FAIL 로 돌리지 않는다 (R-7) |

> QA 가 스스로 수용한 항목은 없다. `010`~`012` 는 `005`~`008` 과 같은 성격의 **후속 등재**로 올린다.

## R-1. 수정 범위 실측 — Product Code 5파일, 전부 언어 경로

`find … -newermt` 로 mtime 분리 (2회차 02:51~03:10, 3회차 09:51~09:57).

| 구분 | 파일 | 성격 |
|---|---|---|
| Product | `packages/contracts/src/onboarding/child-info.ts` | `DEFAULT_LANGUAGE_ENVIRONMENT` 상수 + 근거 주석 (`.min(1)`·`.default()` 없음) |
| Product | `apps/web/src/shared/lib/child-info.ts` | `partialChildInfoAnswers` 조건부 spread(2회차) · `childInfoFormFrom` 기본값 · 언어 필수 검사 삭제 · `ChildInfoFieldErrors` 축소 |
| Product | `apps/web/src/features/onboarding-survey/ui/ChildInfoStep.tsx` | 언어 오류 블록 제거 · `update()` 가 해제 상태 기록 |
| Product | `apps/web/src/features/onboarding-survey/model/submitRequest.ts` | 누락 검사에서 언어 제외 + 제출 경계 기본값 |
| Product | `apps/web/src/shared/copy/child-copy.ts` | `languagesRequired` 삭제 |
| Test | `childInfo.test.ts` · `submitRequest.test.ts` · `childDraft.test.ts` · `e2e/onboarding.spec.ts` · `e2e/support/onboarding.ts` | 회귀 테스트·helper |
| Baseline | `s2-onboarding-childinfo.png`(2회차) · `s2-onboarding-childinfo-edit.png`(3회차) | R-5 |

- **2회차의 수정은 실제로 1지점**이다 — 02:51~09:51 구간에 다른 Product 파일의 mtime 변화가 없다. `SignUpForm.tsx`·`childDraft.ts`·`OnboardingWizard.tsx`·`SwipeDeck.*`·`onboarding.css` 전부 **01:08 이전**(1회차) 그대로다.
- 신규 토큰 0 · 임의 HEX/`rgb()` 0 · 신규 `any`/`@ts-ignore` 0 (5파일 grep).
- `childInfoFormFrom`·`EMPTY_CHILD_INFO_FORM` 소비처는 **`SignUpForm` 과 `ChildInfoStep` 둘뿐**이다 (grep) — 파급면이 닫혀 있다.

## R-2. `QA-2R-009` — **해소** (브라우저 실측)

`npx playwright test --config docs/qa/evidence/qa.playwright.config.ts qa-langloss qa-childinfo` → **4 passed**

```
QA-LANG after-child-info child_info={"firstName":"Yuna",…,"languageEnvironment":["english"]}
QA-LANG after-sign-up    child_info={"firstName":"Yuna",…,"languageEnvironment":["english"]}   ← 2회차에는 []
QA-CHILDINFO trial pressedChips=["English"]   auth pressedChips=["English"]   ← 2회차에는 auth=[]
```

QA 가 결함을 재현했던 바로 그 probe 2종이 **반대 결과**를 낸다. 가입을 지나도 언어가 보존된다.

## R-3. ★ 두 상태 구분 — QA 독립 probe **15/15 PASS**

`docs/qa/evidence/qa-lang-optional.probe.test.tsx` (신규, QA 소유 — Product Code 아님).
`npx vitest run --config docs/qa/evidence/qa.vitest.config.mts docs/qa/evidence/qa-lang-optional.probe.test.tsx` → **15 passed**

| # | 지시 항목 | 실측 결과 |
|---|---|---|
| 1 | 키 없음 → 영어 기본 선택 | 화면: `English aria-pressed=true`, `Korean=false` |
| 2 | `[]` → 해제 유지 | 화면: `English aria-pressed=false` (저장소가 되살리지 않는다) |
| 3 | **전부 해제 → 저장소가 영어로 되돌리지 않는가** | 해제 클릭 후 localStorage draft `languageEnvironment: []` |
| 4 | **전부 해제 → 전진이 막히지 않는가** | `Next` → `/onboarding` 소개 화면 도달 |
| 5 | **해제 후 제출 payload** | `buildSubmitRequest` → `['english']` (키 없음 경우도 동일) |
| 6 | **직접 고른 값을 기본값이 덮지 않는가** | `['korean','spanish']` 유지, 추가 선택도 `['korean','spanish','arabic']` 로 누적 |
| 7 | **가입 화면 통과 시 `QA-2R-009` 재발** | 3가지 상태 전부 보존: `['korean','spanish']` → 그대로 · `[]` → `[]`(영어로 안 돌아감) · **키 없음 → 키 없음**(가입이 기본값을 심지 않는다) |
| 8 | `EMPTY_CHILD_INFO_FORM` | `[]` 확인 — 가입 폼이 영어를 들고 다니지 않는다 |

- **vacuous 방지**: 가입 통과 테스트는 아이 이름을 `Nova`→`Mira` 로 **바꿔서** 제출하고 draft 의 `firstName === 'Mira'` 를 기다린 뒤 언어를 읽는다. 저장 경로가 실제로 돌았음이 단정에 포함된다.
- **negative control 2종**: 이름이 없으면 제출이 막힌다 / `gender` **키가 없으면** 제출이 막힌다.
- 제출 경계는 `useOnboardingWizard:249` **한 곳**이며 `buildSubmitRequest` 가 유일한 payload 생성기다 (grep) — "제출 경계에서만 채운다" 가 구조적으로 성립한다.
- draft 저장 시점에 채우지 않는다는 요구도 #3 으로 실측됐다.

### `gender` 를 언어와 다르게 둔 판단 — **타당**

negative control 이 근거를 세운다: `child_info` 에서 `gender` 키를 빼면 `buildSubmitRequest` 가 `missing: ['child_info']` 로 **제출을 막는다**. 즉 언어처럼 키를 뺐다면 **미응답 사용자의 제출이 차단**된다. 키를 유지하는 현재 구현에서 `gender: null` 은 제출을 통과하며(실측), 가입을 지나도 `'girl'` 이 보존된다(R-2·R-3 #7). 두 필드를 다르게 둔 이유(가입 화면이 성별은 되살리지만 언어는 입력 자체가 없다)도 코드와 일치한다.

## R-4. 필수 해제가 남긴 흔적 — 코드·테스트 **0건**

| 확인 | 결과 |
|---|---|
| `validateChildInfo` | 필수는 `firstName`·`birthYearMonth` 둘뿐. 언어 검사 없음 |
| `ChildInfoFieldErrors` | `'firstName' \| 'birthYearMonth'` 로 축소 |
| `ChildInfoStep` 오류 블록 | `languageError` / 해당 `role="alert"` **0건** (grep) |
| `buildSubmitRequest` 누락 검사 | `firstName`·`birthYearMonth`·`gender` 만 본다 |
| `languagesRequired` 문구 | 코드 사용처 **0건** (저장소 전체 grep — 남은 것은 handoff·QA 리포트의 서술뿐) |
| 화면의 필수 표시 | `required` 는 First name·Birth year·Birth month 3곳뿐. 언어 chip 그룹에 `required`/`aria-required` 없음 — baseline 육안 확인(R-5)과 일치 |
| **언어를 필수로 단정하는 테스트** | **0건.** `childInfo.test.ts` 의 옛 단언은 "해제해도 막지 않는다" 로 교체됐고, 새 단언들은 전부 실제 반환값을 본다 (vacuous 아님). `e2e/support/onboarding.ts` 의 `fillChildInfo` 는 English 를 **누르지 않고 `aria-pressed=true` 를 단정**한다 — 기본 선택을 검증 대상으로 끌어올렸다 |

## R-5. baseline — 1장 재촬영이 **옳다**

| baseline | draft | 기본 선택 도입 영향 | 판단 |
|---|---|---|---|
| `-trial` | `seedChildDraft` = `languageEnvironment:['english']` | **없음** (이미 English 선택 상태) | 무변화 타당 |
| (기본) `-childinfo` | 같은 seed + 가입·동의 경유 | **없음** — 2회차에 `QA-2R-009` 수정으로 이미 English 선택 상태로 재촬영됨 | 무변화 타당 |
| `-edit` | **draft 없음** (`missing-prefill`) | **있음** — 이전엔 칩 전부 미선택, 지금은 English 선택 | 재촬영 필요 → 1장 |

- `e2e/support/onboarding.ts:130` 에서 seed draft 가 `['english']` 임을 직접 확인했다. 구현자 주장대로다.
- `-edit` baseline 을 육안 확인: `English` 칩이 **체크 아이콘 + filled** 로 선택되어 있고, 필수 표시(`*`)는 First name·Birth year·Birth month 에만 있다. 언어 그룹에는 없다.
- 3장 md5 전부 상이 (`a7da4acc…` / `69c0df3d…` / `b11f15f9…`) — `QA-2R-003` 의 중복 baseline 문제 재발 없음.

## R-6. 회귀

| 항목 | 결과 |
|---|---|
| `AC-2R-12` | **PASS 유지** — baseline 3종 분리 유지(md5), e2e 140 passed 에 visual 포함, 재촬영은 의도한 1장뿐 |
| 간격 24 (`QA-2R-002`) | **그대로.** `qa-vstack2.probe.spec.ts` 재실행: `cardTop=86`(progressBottom 62 + 24), **393px 초과 0장**, **320px 초과 3장**(#3 −6 · #4 −46 · #9 −22) — 2회차 수치와 동일 |
| 레이아웃 파일 | `onboarding.css`·`OnboardingWizard.tsx`·`SwipeDeck.*` mtime 01:08 이전 그대로 (2·3회차 미변경) |
| 저장소 검증 | probe 추가 후 `pnpm typecheck` **PASS** · `pnpm format:check` **PASS** (QA 가 저장소 검증을 깨지 않음) |

## R-7. 신규 Finding (전부 Low · 주석/문서 위생 · 제품 동작 영향 0)

### QA-2R-010 | Severity: **Low**

**Requirement**: 코드 주석 정합 (AC 대상 아님)
**Steps**: 아래 두 JSDoc 을 읽는다.
**Expected**: 주석이 현재 동작을 설명한다.
**Actual**: 둘 다 **이번 수정 이전 동작**을 설명한다.
- `apps/web/src/shared/lib/child-info.ts` `partialChildInfoAnswers` JSDoc — "제출 단계는 `buildSubmitRequest` 가 '미입력' 으로 보고 해당 단계로 되돌린다 (화면 필수 규칙 D-C 와 일치)". 3회차 이후 제출은 **되돌리지 않고 기본값으로 채운다**.
- `apps/web/src/features/auth/model/childDraft.ts` `hasChildDraftValues` JSDoc — "`partialChildInfoAnswers` 는 빈 폼에서도 `gender: null` · `languageEnvironment: []` 를 담아 돌려준다". 2회차 이후 **빈 언어는 키가 없다**.
**Evidence**: 두 파일의 해당 JSDoc 과 `submitRequest.ts:69-72` · `child-info.ts` 조건부 spread.
**영향**: 동작 영향 없음(`hasChildDraftValues` 는 언어를 보지 않는다). 다음 수정자가 반대 규칙으로 읽을 위험만 있다.

### QA-2R-011 | Severity: **Low**

**Requirement**: Stage 8 Handoff 입력 정합
**Actual**: 언어가 **필수**라는 서술이 handoff 계열 문서에 남아 있다.
- `docs/qa/stage-2-contracts-handoff.md:212` — "Step 1 은 … `languageEnvironment` 만 요구하고"
- `docs/qa/stage-2-rework-handoff.md:687` (부록 C-9) — "서버는 … 선택 필드로 받지 않는다 — Frontend 가 제출 전에 1개 이상을 보장한다"
**Expected**: 부록 D-9("서버는 빈 배열을 거부하지 않는다")와 일치.
**영향**: Stage 8 `DATA_REQUIREMENTS.md` 작성자가 D-9 가 아니라 C-9 를 읽으면 서버에 `.min(1)` 을 넣게 된다. D-9 가 뒤에 있어 최종 기준은 명확하나, 두 문장이 같은 문서에 공존한다.

### QA-2R-012 | Severity: **Low**

**Requirement**: 결정 추적성
**Actual**: `docs/decisions/stage-3-approvals.md:622` 가 "PRD 수정 대상 **16번**으로 등재" 라고 적지만, 같은 문서 §5 의 PRD 수정 대상 표는 **1~3 · 5 · 6** 번만 가진다 — 16번 항목이 어디에도 없다 (`PLANNING.md` #16 은 Stage 0 Session 상태 모델로 무관).
**참고**: PRD `§7.2` 본문은 언어 환경을 "입력받는다" 로만 적고 **필수라고 쓰지 않았다** — 실제 PRD 모순은 없다. 등재 포인터만 비어 있다.
**영향**: `D-24` 절차 실행 시 대상 항목을 찾지 못한다.

## R-8. QA 가 추가한 증거 파일

| 파일 | 용도 |
|---|---|
| `docs/qa/evidence/qa-lang-optional.probe.test.tsx` | 두 상태 구분 15종 실측 (화면 · 가입 통과 · 제출 경계 · negative control 2종) |

기존 probe 재사용: `qa-langloss.probe.spec.ts` · `qa-childinfo.probe.spec.ts`(결함 → 해소 반전 확인) · `qa-vstack2.probe.spec.ts`(간격 24 회귀).

## R-9. `BACKEND_INTEGRATION_PENDING` 갱신

- **언어 환경은 선택 필드다.** 서버는 `child_info.languageEnvironment` 의 **빈 배열을 거부하지 않는다** (`.min(1)` 금지). 미선택 기본값 `DEFAULT_LANGUAGE_ENVIRONMENT = ['english']` 는 **보내는 쪽이 채운다** — 서버가 또 채우면 사용자의 명시적 해제를 덮어쓴다. → Stage 8 `DATA_REQUIREMENTS.md`. (부록 C-9 의 반대 서술은 `QA-2R-011`)

## R-10. 재검증 이력 (갱신)

| 회차 | 일시 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-10-04 | **FAIL** | 최초 검증. `QA-2R-001`~`008` 등록 |
| 2 | 2026-10-04 | **FAIL** | `QA-2R-001`~`004`·`007` 해소, `AC-2R-12` → PASS. `005`·`006`·`008` 사용자 수용. **신규 `QA-2R-009`(Medium) 1건** |
| 3 | 2026-10-04 | **PASS** | `QA-2R-009` **해소**(브라우저 실측). 언어 선택화 두 상태 구분 15/15 실측 PASS. 간격 24·`AC-2R-12` 회귀 없음. **신규 Low 3건**(`010`~`012`, 전부 주석·문서 위생 — 후속 등재) |
