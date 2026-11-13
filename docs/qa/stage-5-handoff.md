# Stage 5 Handoff

Status: **HANDOFF** · 작업 단위별로 절을 덧붙인다. **커밋하지 않았다.**

---

# `H5-1` `S5-A` — Contracts + Mock (2026-11-08, development-agent)

Status: **HANDOFF** · 작업 단위 **`S5-A` 만**. UI 컴포넌트·화면·토큰(`T5-*`)·`Chip` 변형·`StarRating` 은 만들지 않았다 (`S5-B` 이후).

## H5-1.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-5-plan.md` — `Status: APPROVED (2026-11-08, user)` (`D5-4`) ✅ |
| Design Spec | `docs/design/stage-5-design-spec.md` — `Status: APPROVED (2026-11-08, user)` ✅ (이 단위는 UI 없음) |
| 이전 Stage | 4a `PASS (accepted: D4-34, NV-4A-1)` · 4b `PASS (accepted: NV-4B-2, NV-4B-3)` ✅ |
| `S5-A` 차단 결정 | `N5-01` · `N5-02` · `N5-03` · `N5-05` · `N5-06` · `N5-11` · `N5-12` (+ `N5-16` 500 · `N5-22`) — 전부 `D5-4` 권고안 ✅ |
| Backend 작업 | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H5-1.2 구현 — Plan §7 C-1~C-12

| # | 구현 | 파일 |
|---|---|---|
| C-1 | `ReflectionCheckKeySchema` 5값 (`engaged` · `big_feelings` · `asked_questions` · `stayed_focused` · `tricky_today`) — enum 35 → **36** | `packages/contracts/src/enums/reflection-check.ts` |
| C-2 | `SubmitReflectionRequestSchema` `{ rating: 1..5 \| null, checks: 키[] (중복 거부), note: trim 1..500 \| null }` + refine 빈 회고 거부 · `hasReflectionContent()` · `REFLECTION_NOTE_MAX_LENGTH = 500` | `packages/contracts/src/reflections/reflection.ts` |
| C-3 | `ReflectionSchema` `{ id, sessionId, rating, checks, note, submittedAt }` | 같은 파일 |
| C-4 | `SessionDetailSchema.reflection: ReflectionSchema.nullable()` (required) | `packages/contracts/src/sessions/session.ts` |
| C-5 | `GET /v1/reflection-form` · `ReflectionFormDefinition` **만들지 않음** (식별자 0 — 테스트) | — |
| C-6 | `reflectionApi.submit` (IK 필수) · Http 골격 · Mock | `shared/api/reflection-api.ts` · `shared/api/http/HttpReflectionApi.ts` · `mocks/reflections/MockReflectionApi.ts` |
| C-7 | `SessionAnalysisStatusSchema` + refine(`outcome ≠ null ⇒ analyzed`) · `ShortFeedbackSchema` · `AnalysisSessionStatusSchema` · ⛔ `metricsPreview` 없음 | `packages/contracts/src/analysis/status.ts` |
| C-8 | `analysisApi.getStatus` · Http 골격 · Mock | `shared/api/analysis-api.ts` · `shared/api/http/HttpAnalysisApi.ts` · `mocks/analysis/MockAnalysisApi.ts` · `mocks/analysis/analysisScenarios.ts` |
| C-9 | `HighlightClipSummarySchema` · `SignedMediaUrlSchema` + fixture. **API 메서드·호출자 0** | `packages/contracts/src/highlight-clips/clip.ts` · `mocks/fixtures/highlight-clips.ts` |
| C-10 | error code 신규 0 (29종 — 테스트) | — |
| C-11 | `NotificationKind` 변경 0 | — |
| C-12 | `AnalysisOutcome` 변경 0 — 녹음 삭제 = `completed` + Detail `uploadStatus='deleted'` | `analysisScenarios.ts` `recording-deleted` |

Entities (hook — UI 없음): `apps/web/src/entities/reflection/` (`reflectionKeys` · `useSubmitReflection` — body 단위 IK · 진행 중 중복 무시 · 성공 시 캐시된 `SessionDetail.reflection` 갱신 · 저장소 기록 0) · `apps/web/src/entities/analysis/` (`analysisKeys` · `useSessionAnalysis` · `selectAnalysisRefetchInterval` — 15s / `failed` 60s / 종착 정지, `refetchIntervalInBackground: false`).

`ApiClients` 에 `reflections` · `analysis` 추가 (`shared/api/types.ts`) — 선택 지점은 그대로 1곳(`app/providers/apiClients.ts` → `mocks/index.ts` · `shared/api/http/index.ts`).

### Stage 4 fixture 갱신 (Plan §5.4 R-7)

`SessionDetail` 을 만드는 Mock 경로는 `MockSessionApi.toDetail` **1곳**이다 (`grep SessionDetailSchema` — 앱 코드에서 상세를 직접 만드는 곳 없음). 레코드를 만드는 4곳에 `reflection: null` · `shortFeedback: null` 추가: `MockSessionApi`(새 세션 · 진행 중 seed) · `sessions/sessionHistory.ts`(지난 세션 seed — `MockSessionApi` 안의 `seedHistory` 를 회고·분석 Mock 과 공유하려고 옮김, 동작 동일) · `recorder/deviceSeed.ts`. 테스트 stub `ApiClients` 2곳(`providers.test.tsx` · `guard-integration.test.tsx`)에 메서드 추가. 기본 scenario 에서 Stage 4 응답은 `reflection: null` 이 붙는 것 외 **변화 0** (분석 override 는 `analysis:*` 를 지정할 때만 걸린다).

## H5-1.3 AC 매핑 (판정은 QA 가 한다)

| AC | 근거 |
|---|---|
| 03 | `packages/contracts/src/__tests__/enums.test.ts` 36종 스냅샷 · `stage-5.test.ts` "ReflectionCheckKey" |
| 04 | `stage-5.test.ts` "SubmitReflectionRequest" — rating 0·6·3.5·-1 거부 · 미등록/중복 키 · trim · 500/501 · 공백만 · 빈 회고 · key 누락 |
| 05 | `sessions.test.ts` "`reflection` 은 필수 key" · `mocks/__tests__/stage5-fixtures.test.ts` 모든 Detail 경로(새·완료·지난 2·진행 중·기기 seed) parse + key 누락 거부 |
| 06 | `stage-5.test.ts` "SessionAnalysisStatus" — refine · 완료 계열 4값 · `metricsPreview`/`transcript` 미통과 · shape key 5개 |
| 07 | `stage-5.test.ts` "HighlightClip" · `stage5-fixtures.test.ts` 클립 fixture parse + Mock/Http client 에 클립 메서드 0 |
| 08 | `stage-5.test.ts` "error code 신규 0" · 공개 표면 export 목록 · `reflectionform`/`metrics` 식별자 0. 타입은 `z.infer` 만 |
| 09 | `docs/API_CONTRACTS.md` **Rev 9** — §2.2 · §3.2 · §3.10~3.12 신설 · §4 · §5.3 · §5.4 · §6 `G-06` Resolved |
| 10 | `MockReflectionApi.test.ts` · `MockAnalysisApi.test.ts` — 모든 key 응답을 contracts 로 parse |
| 11 | `MockReflectionApi.test.ts` "멱등 · 세션당 1건" (같은 key replay · 다른 body → `IDEMPOTENCY_KEY_REUSED` · 재제출 → `REFLECTION_ALREADY_SUBMITTED` · 실패는 보관 안 함) · `useSubmitReflection.test.tsx` key 재사용/재발급 |
| 12 | `MockReflectionApi.test.ts` "허용 상태" — ready/recording/paused/abandoned → `SESSION_INVALID_TRANSITION`(`details.from`) · `invalid-transition` 1회차만 |
| 13 | `MockAnalysisApi.test.ts` "표시 시나리오 — §8 표" 6종 + 공통 5종 + `conversation_only` 시나리오 무관 `ANALYSIS_NOT_AVAILABLE`(11 key 각각) |
| 14 | `MockAnalysisApi.test.ts` "success — 결정적 worker 전이" (2회 `analyzing` → `analyzed`, `canTransition(…,'worker',…)`, 반복 실행 동일) · `useSessionAnalysis.test.tsx` fake timer 15s 폴링 → 종착 정지 |
| 15 | Mock 은 `mocks/**` 에만 — 새 Component/Page/Feature 0. `pnpm lint:boundaries` ✔ |
| 16 | **부분** — `API_CONTRACTS §5.4` 등재 ✅ · URL `?scenario=` 전환 ✅. dev Scenario Panel · `/__dev/screens` 항목은 **미추가** (아래 H5-1.6 ②) |

## H5-1.4 Mock scenario · 전환

전환: `?scenario=<group>:<key>` (여러 개는 `,`) · 메서드 단위 `reflections.submit:<key>` · `analysis.getstatus:<key>` · 번들 옵션 `errorCodes: { reflections: 'RATE_LIMITED' }`.

| group | key |
|---|---|
| `reflections` | `success` · `loading` · `error` · `retry` · `offline` · `reflection-already-submitted` · `invalid-transition` (⛔ `empty` 없음 — `N5-06` ⓐ) |
| `analysis` | `success` · `loading` · `error` · `retry` · `offline` · `analysis-pending` · `analysis-completed` · `analysis-failed` · `analysis-low-quality` · `analysis-not-available` · `recording-deleted` · 🆕 `analysis-pending-then-completed` · 🆕 `analysis-feedback-missing` |
| `session-completion` | + 🆕 `reflection-submitted` |

`analysis` 의 `success`/`loading`/`retry` = 실제 Mock 상태(조회 3번째에 worker 전이). 나머지 표시 key 는 서버 상태를 바꾸지 않는 override 이며 `GET /v1/sessions/:id` 에도 같은 `status`/`analysisOutcome`(·`recording-deleted` 의 녹음)을 겹친다. deep link 확인용 세션: 지난 세션 `77777777-7777-4777-8777-000000000001`(`analyzed`) · `…0002`(`analyzing`).

## H5-1.5 검증 명령 (2026-11-08, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 (contracts · ui · web) |
| `pnpm lint` | ✅ exit 0 |
| `pnpm lint:boundaries` | ✅ no dependency violations (827 modules, 3197 dependencies) |
| `pnpm test` | ✅ **181 files · 2624 tests passed** (contracts 단독 23 files · 461) |
| `pnpm build` | ✅ (기존 chunk size 경고만) |
| `pnpm assert:no-mocks` | ✅ MOCK/DEV sentinel 0 · `haru-dev-` 0 · sharp 0 |
| `prettier --check packages apps/web/src` | ✅ |
| Playwright | **실행하지 않음** (지시 — 이 단위는 UI 변경 0) |

## H5-1.6 Plan 과 다르게 한 점 · 보류

1. **`SessionAnalysisStatus.sessionStatus` 를 완료 계열 4값으로 좁혔다** (`AnalysisSessionStatusSchema = SessionStatus.extract([...])`). Plan C-7 은 `sessionStatus` 로만 적었으나, 완료 전·`abandoned` 는 응답이 아니라 `ANALYSIS_NOT_AVAILABLE`(§1.2 "분석 전")이므로 contract 로 표현했다. 새 enum 값 0.
2. **AC-5-16 의 dev Scenario Panel · `/__dev/screens` 항목 보류** — Stage 4 그룹도 패널에 없고, 패널 DOM 변경이 e2e(`scenarios.spec` 등)·gallery baseline 에 닿을 수 있어 Playwright 미실행 단위에서 넣지 않았다. `DevScreens.tsx:346` 교체는 Plan R-8 = `S5-B` 범위. URL 전환은 동작한다.
3. `note` 규칙 구체화: trim 후 **1~500자 또는 `null`** — 공백만 문자열은 거부(클라이언트가 `null` 로 정규화). 상한은 `String.length`(UTF-16) 기준.
4. `ReflectionSchema`(응답)에도 빈 회고 refine 을 걸었다.
5. 폴링 hook 은 `completed`(업로드 전·녹음 삭제) 에서도 15초로 계속한다 — `recording-deleted` 표시 시 정지 여부는 `S5-C`(Detail 과 조합하는 쪽)가 `enabled` 로 정한다.
6. 회고 fixture `reflection-submitted` 의 선택 칩은 Figma 예시가 어느 칩인지 정하지 않아 `engaged` · `big_feelings` 로 두었다 (UI 비교 시 design-agent 확인 대상).

## H5-1.7 BACKEND_INTEGRATION_PENDING 예상

`P5-BIP-01`~`16` 그대로 (Plan §10) — 이 단위의 Http 골격(`HttpReflectionApi` · `HttpAnalysisApi`)은 경로·IK·parse 만 고정. 회고 저장·멱등 24h·허용 상태 서버 강제·세션당 1건(`01`·`02`), 분석 파이프라인·품질 게이트·피드백 생성·24h(`06`~`12`), `conversation_only` 거부(`13`), 클립 추출·만료(`14`, `OAQ-13`), 소유권·RLS(`15`), 녹음 미수신 세션 종결(`16`).

---

# `H5-2` `S5-B` — 별점 + 회고 카드 + 완료 화면 연결 (2026-11-08, development-agent)

Status: **HANDOFF** · 작업 단위 **`S5-B` 만**. 피드백 화면(`S5-C`)·`/session/:id/feedback` route 는 만들지 않았다. **커밋하지 않았다.**

## H5-2.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-08, user)` (`D5-4`) ✅ |
| `S5-B` 차단 결정 | `N5-04` · `N5-07` · `N5-08` · `N5-20` · `C13-S5-2` + Spec `N5-25`~`N5-32` · 토큰 `T5-1`~`T5-11` · 가값 `P-28`·`P-29` — 전부 `D5-4` 권고안 ✅ |
| 이전 단위 | `H5-1` (`S5-A`) |
| Backend | 없음 — `apps/api` · `supabase` · `apps/mobile` 부재 (H5-2.5) |

## H5-2.2 구현

| 항목 | 내용 | 파일 |
|---|---|---|
| 토큰 `T5-1` | Primitive `--haru-mist-300: #d6dedc` 신설 → `--color-rating-empty` 값 교체 (P-02 주석 유지) | `packages/design-tokens/src/primitive/color.css` · `semantic/color.css` |
| 토큰 `T5-2`~`T5-11` (Tier 3, 12종) | `--reflection-card-{radius 30 · width 370 · gutter 11 · offset 89.375 · bottom-gap 29 · title-line 20}` · `--reflection-chip-gap 7` · `--rating-star-{size 30 · gap 8}` · `--input-{height 40 · padding-x 14}` (Spec 표기 `--text-input-*` 는 `--text-*` 타이포 네임스페이스와 충돌 — gallery `v8-typography` 가 집어 감 — 해 이름만 바꿨다) · `--chip-select-border-width 1` | `packages/design-tokens/src/component/index.css` |
| `--reflection-card-offset` | **렌더 실측**: 버블 래퍼 bottom 375.625(= Figma 431.63 − 56) → 카드 top 465(= 521 − 56) ⇒ 89.375 (Spec §2.1 · M-7, `N5-29` 흐름 배치) | 같은 파일 주석 |
| HARU SVG `haru:rating-star` | `91:694` path 원문(viewBox 30) · `currentColor`. 출처 = design-agent 가 받은 `star-filled.svg`/`star-empty.svg`(path 동일) | `packages/ui/src/icon/haru/rating-star.svg` · `RatingStar.tsx` |
| `StarRating` (신규) | radiogroup/radio · roving tabindex · ←↓/→↑/Home/End · 재탭 변화 없음(`N5-18`) · `readOnly`(aria-readonly) · `disabled`(aria-disabled, 포커스 유지) · 버튼 38×30 + hit slop 44 (`P-29`) · 이름은 소비자 copy | `packages/ui/src/rating/StarRating.{tsx,css}` |
| `Chip` `variant="select"` (신규 변형) | check 아이콘 없음 · Medium 510 · 미선택 1px border(33) / 선택 border 없음(31) · hit slop 44 · `readOnly` prop(aria-disabled, opacity 변화 없음). **기존 `outline`/`filled`/`glass` 불변** | `packages/ui/src/chip/Chip.{tsx,css}` |
| `TextInput` (신규) | 라벨 없는 한 줄 · 40 · radius 16 · 1px `--color-border-subtle` · 13/16 · placeholder `--color-fg-tertiary` (`P-28`) · `aria-label` 필수 | `packages/ui/src/field/TextInput.{tsx,css}` |
| `ReflectionCard` (Feature) | S0~S6 (아래) · 입력 메모리만 · `toReflectionRequest`(칩 Figma 순서 · note trim → 빈 값 `null`) | `apps/web/src/features/reflection/ui/ReflectionCard.tsx` · `reflection.css` · `copy.ts` · `index.ts` |
| 완료 화면 슬롯 | `SessionCompleteScreen` 에 `footer` prop — 본체 상태에서만 렌더, 버블 뒤 흐름. 머리 주석 R-1 개정 | `features/storytime-session/ui/SessionCompleteScreen.tsx` |
| Page 조립 | `SessionCompletePage` 가 `<ReflectionCard>` 를 `footer` 로 끼운다 (feature 간 import 0) | `pages/session/SessionCompletePage.tsx` |
| 재진입 데이터 | `useSessionCompletion().reflection` (상세 캐시) + `useSubmittedReflection` (이번 실행에서 성공한 제출 — 전이 응답 경로는 상세를 조회하지 않으므로) | `entities/session/useSessionCompletion.ts` · `entities/reflection/useSubmittedReflection.ts` |
| `useSubmitReflection.onFailed` | 둘째 인자 `offline: boolean` 추가 (오프라인 Toast 문구 분기) | `entities/reflection/useSubmitReflection.ts` |
| fixture | `reflection-submitted` 선택 칩 `engaged`+`big_feelings` → **`engaged`+`asked_questions`** (Figma `91:710`·`91:712`) | `mocks/fixtures/reflections.ts` |
| dev (R-8 · AC-5-16) | Scenario Panel 그룹 + `session-completion` · `reflections` · `analysis` · `/__dev/screens` 에 회고 시나리오 7링크 · 피드백 화면은 "예정(S5-C)" | `dev/scenario-panel/devScenarios.ts` · `dev/DevScreens.tsx` |

### 카드 상태 (Spec §2.2 `C13-S5-2`)

| 상태 | 구현 |
|---|---|
| S0 빈 | 별 0 · 칩 미선택 · placeholder · `Save` = `aria-disabled` + SR 이유(`Choose stars, a tag, or add a note to save.`) · 눌러도 요청 0 |
| S1 입력 | 별·칩·입력 중 하나 이상(공백만 note 는 제외) → 활성 |
| S2 저장 중 | 별 `aria-disabled` · 칩 `readOnly` · 입력 `readOnly` (모두 포커스 유지) · `Save loading` · 중복 탭 요청 1건 |
| S3 실패 | Toast(error) `joinErrorMessage(errorCopyForCode)` · 입력 보존 · 재시도 = 같은 body 면 같은 key. `SESSION_INVALID_TRANSITION` 은 공통 문구(*"HARU refreshed this storytime"*)가 사실과 달라 **일반 실패 문구**로 바꿨다 (H5-2.6 ②) |
| S4 오프라인 | Toast(error) 회고 전용 문구 · 입력 보존 · 저장소 기록 0 |
| S5 저장됨 | Toast(success) `Thanks — saved.` + 홈 replace |
| S6 재진입 | 제출값 표시 · 별 `aria-readonly` · 칩 `readOnly`(모습 그대로) · 입력 `readOnly` · `Save` Disabled · 카드 `aria-describedby` = `Your reflection for this storytime is saved.` |
| `REFLECTION_ALREADY_SUBMITTED` | 저장된 결과로 다룬다 — Toast(neutral) `Already noted. …` + 홈 replace (H5-2.6 ③) |

## H5-2.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 16 | dev Scenario Panel 그룹 3개 · `/__dev/screens` 링크 (`scenario-selection.test.ts` · `ScenarioPanel.test.tsx`) — `S5-A` 의 문서·URL 부분과 합쳐 완료 |
| 17 | `apps/web/__tests__/reflection-card.test.tsx` "구성" (Skip 0 · 칩 5 Figma 순서 · check 0) |
| 18 | `e2e/reflection-card.spec.ts` "기하"(카드 (11.5, 465) 370×302 · 하위 좌표) · "선언값" (computed) |
| 19 | `e2e/session-complete.spec.ts` 기존 `기하` 테스트 통과(상단 좌표 그대로) + baseline diff **위쪽 0 픽셀** (H5-2.4) |
| 20~23 | `StarRating.test.tsx` · `Chip.test.tsx` · `TextInput.test.tsx` · `reflection-card.test.tsx` · e2e 키보드 선택 |
| 24 · 25 | 단위 "제출" + e2e 요청 로그 body 대조 · 성공 Toast + 홈 · 뒤로가기로 복귀 0 |
| 26 · 27 · 28 | 단위 S3(같은 key) · S4(저장소 0) · invalid-transition(재시도 성공) · e2e 오프라인 |
| 29 | e2e "닫기 = 건너뛰기" (확인 0 · 요청 0) |
| 30 | 단위 S6 · e2e 재진입 |
| 31 | 카드는 완료 본체에서 항상 렌더 — `conversation_only` · 30분 · 복구 경로 전용 e2e 는 **추가하지 않았다** (회귀 e2e 가 완료 화면까지 도달 — QA 확인 대상) |
| 32 | e2e 반응형 320×568 · 393×667 · 600 · 1024 (가로 넘침 0 · 폭 · Save 도달 · 아래 29) + `R-SHADOW-1` 세로·가로 프로브 |
| 33 | **NV** (실기기 — 입력 포커스 시 `Save` `scrollIntoView({block:'nearest'})` 만 구현) |
| 51 | AC-4-61 · 104 → **AC-5-18 · 19 로 승계** (테스트 이름·주석에 `supersedes`) · baseline 재생성 = `R-BASELINE-1` (H5-2.4) |

## H5-2.4 Baseline 재생성 — `R-BASELINE-1`

대상 1장: `e2e/__screenshots__/darwin/session-complete.spec.ts/s4-session-complete.png` (완료 화면 baseline 은 이것 하나 — `find e2e/__screenshots__ -iname '*complete*'`).

1. 재생성 **전** 실행 → 실패 이미지 확보 → 픽셀 연결성분 분해 (채널 차 ≥ 6, 8-이웃 반경 2):
   **클러스터 1개** = x 12~381 · y 465~772 · 112,721 px — 카드(465~767) + 아래 그림자(~5). 설명됨.
2. 엄격 검사(채널 차 > 0): **y < 465 변화 0 픽셀** · 카드+그림자 박스 밖 변화 0 → AC-5-19 상단 불변.
3. 설명 안 되는 클러스터 0 → `-g "baseline: 완료 화면 전체 프레임" --update-snapshots=all` 로 그 1장만 재생성. 재생성 파일 = 분석한 actual 과 **픽셀 동일**(0 diff).
4. dev 패널은 `hideDevPanel` 로 가려져 있다(기존). Toast 퇴장 + `settleImages` 후 촬영(기존).

## H5-2.5 검증 명령 (2026-11-08, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm lint:boundaries` | ✅ no dependency violations (837 modules, 3234 dependencies) |
| `pnpm test` | ✅ **184 files · 2654 tests passed** |
| `pnpm build` | ✅ (기존 chunk size 경고만) |
| `pnpm assert:no-mocks` | ✅ MOCK/DEV sentinel 0 · `haru-dev-` 0 · sharp 0 |
| `prettier --check packages apps/web/src apps/web/__tests__ e2e` | ✅ |
| `ls apps/api supabase apps/mobile` | `No such file or directory` ×3 |
| Playwright 전체 (단독) 1회차 | 565 passed · **4 failed** → 원인 3건 수정 + 1건 부하 간헐: ① `session-regression` AC-4-97 완료 화면 터치 타깃 — 범위가 `body` 라 새 카드까지 잼 → 범위를 카드 밖(Stage 4 영역)으로 좁히고 카드는 `reflection-card.spec.ts` 가 따로 잰다 ② AC-4-100 overflow 목록 — 카드 3건 추가(근거 주석) ③ `visual` `v8-typography` — 새 토큰 이름 `--text-input-*` 가 gallery 타이포 목록에 섞임 → `--input-*` 로 개명 ④ `recording-measure` — **단독 재실행 통과**(수정 없음, 부하 간헐) |
| Playwright 재실행 (단독) | `reflection-card.spec.ts` **14 passed** · `session-regression` + `visual` + `session-complete` + `responsive` + `a11y` **142 passed** |

### 터치 타깃 미달 — 고정만 했다 (사용자 결정 필요)

`reflection-card.spec.ts` "터치 타깃" 이 5점 hit-test 결과를 **현재 값으로 고정**한다 (늘면 깨진다). 허용 차이로 등록하지 않았다:
- 별 5 — 가로 38 → 좌·우 점 미달 (가값 `P-29`, `D5-4` 승인 범위)
- **입력 40** (Figma `91:715`) → 위·아래 점 미달 — Spec 에 언급 없음 ⚠️
- **칩 `Big feelings` · `Ask Questions`** → 아래 점이 아랫줄 칩 hit slop 에 먹힌다 (행 간격 7 < 겹침 11, Spec §3.2 가 "수용 여부 확인" 으로 남김) ⚠️

## H5-2.6 Spec 과 다르게 한 점 · 판단 (승인 필요하면 표시)

1. **카드 폭 기준** — Spec "min(370, 앱 컬럼 − 2×11)". 완료 화면 컨테이너는 gutter 24 안쪽(345)이라 `100%` 기준이면 323 이 된다 → `100% + 2×--layout-gutter − 2×11` 로 컬럼 **바깥** 폭 기준을 썼다 (activity-card-deck 선례). 결과 393 → 370 · 320 → 298 (Spec 계산값과 같다).
2. **`SESSION_INVALID_TRANSITION` Toast 문구** — 공통 `ERROR_COPY` 는 *"Storytime is out of sync. HARU refreshed this storytime…"* 인데 회고 저장에서는 새로 고친 것이 없어 `unknownErrorCopy`(*"Something went wrong. Please try again in a moment."*)를 썼다. 새 문구 0. **문구 확인 요청**.
3. **`REFLECTION_ALREADY_SUBMITTED` 처리** — Spec §7 이 S6 로 매핑했으나 제출 응답에는 저장값이 없어 읽기 전용 표시를 만들 수 없다 → 기존 문구 Toast(neutral) + 홈 replace (S5 와 같은 출구). **확인 요청**.
4. **아이 이름 없음** — `Me.child` 가 없으면 카드를 그리지 않는다 (Guard 통과 화면에서는 발생하지 않음, 대체 문구 0).
5. **칩 선택 시 2px 폭 변화** — Figma 대로 선택(Green)은 border 0 · 31, 미선택은 1px border · 33 이라 토글하면 칩 폭이 2px 바뀌고 행 안 위치가 움직인다(`items-start` 라 세로는 위 정렬). Figma 선언 그대로이며 VG 확인 대상.
6. 칩 라벨 크기 12(기존 `--chip-label-size`, Figma 12.5 흡수 §3.5) → 칩 폭이 Figma 보다 좁다(Engaged 미선택 76.7 · Big feelings 93.7 vs Figma 97). 기존 수용(§3.5)이며 VG 항목.
7. `/__dev/ui` gallery 에 `StarRating` · `TextInput` · `Chip select` 견본을 **추가하지 않았다** (gallery baseline 변동 회피 — 범위 밖).
8. `S5-A` H5-1.6 ⑥(fixture 칩) 해소.
9. 토큰 이름 `--text-input-*` → **`--input-*`** (값 동일) — `--text-*` 타이포 네임스페이스 충돌 (`v8-typography` baseline 회귀로 발견).
10. 기존 테스트 갱신 (약화 아님 — 대상이 바뀐 곳만): `token-tiers` · `fonts`(Tier 3 개수) · `haru-icons`(+`rating-star`) · `provisional-markers`(`P-28`·`P-29` 위치 고정) · `scenario-selection` · `ScenarioPanel`(그룹 3개) · `useSubmitReflection`(`onFailed` 둘째 인자) · `session-complete.spec` AC-4-61·104 → AC-5-18·19 승계 · `session-regression.spec`(위 ①②).

## H5-2.7 Mock scenario · 전환

`?scenario=reflections:<key>` (`success` · `loading` · `error` · `retry` · `offline` · `reflection-already-submitted` · `invalid-transition`) · `session-completion:reflection-submitted`(재진입). dev Scenario Panel 의 같은 이름 그룹 · `/__dev/screens` "Stage 5 회고 카드" 링크(지난 세션 `77777777-…0001` 직접 진입 — 로그인 후 SPA 로 누른다).

## H5-2.8 BACKEND_INTEGRATION_PENDING 예상

변동 없음 — `P5-BIP-01`(회고 저장·멱등·세션당 1건) · `02`(허용 상태 서버 강제) · `04`(서재 평점 집계 원천) · `15`(소유권·RLS). 이 단위의 Frontend 부분(UX · 요청 body · IK · 상태)은 Mock 으로 검증된다.

---

# H5-3 — S5-B 후속 수정 (`D5-6` · `VG5B-1` ⓑ · `D5-5` 기록, 2026-11-09)

## H5-3.1 Gate

Plan · Spec `APPROVED` (`D5-4`). 사용자 결정 `D5-5`~`D5-8` (`docs/decisions/stage-5-approvals.md`). 범위 = 아래 3건만. `D5-7` · `D5-8` 은 "구현 그대로" — 코드 변경 0.

## H5-3.2 `D5-6` — 칩 줄 사이 hit 영역 = 중간선 분할

| 항목 | 내용 |
|---|---|
| 원인 | 칩 hit slop(`::before`, 44)이 줄 간격 7 안에서 겹친다 — 윗줄 아래 5.5(선택 6.5) · 아랫줄 위 5.5. 아랫줄이 DOM 뒤라 위에 그려져 겹친 띠 전체를 가져갔다 |
| 수정 | **첫 줄이 아닌 칩**의 위쪽 slop 만 `--reflection-chip-gap / 2`(border box 기준, 미선택은 border 1 가산)로 줄인다. 아래쪽 slop 은 그대로 → 아랫줄 hit 위 끝 = 중간선, 그 위는 윗줄 몫. 첫 줄 위 · 마지막 줄 아래(겹침 없음)는 44 그대로. 줄 구성은 폭·선택(±2px)에 따라 바뀌어 CSS 로 고를 수 없어 `useChipRowSplit`(callback ref + ResizeObserver, `offsetTop` 비교 — 누름 scale 영향 없음)이 `data-chip-row-follows` 를 붙인다. `@haru/ui` `Chip` 은 변경 0 |
| 보이는 배치 | 변경 0 — 버튼 박스·`items-start`·gap 그대로. 포커스 링(`haru-focus-ring`, 버튼 박스) · 그림자 영향 0 (`R-SHADOW-1` — overflow 신설 0) |
| 파일 | `apps/web/src/features/reflection/ui/useChipRowSplit.ts`(신규) · `ui/ReflectionCard.tsx` · `reflection.css` |
| 테스트 | `e2e/reflection-card.spec.ts` "칩 줄 사이 hit 영역 = 중간선에서 분할" × 2(미선택 · `Big feelings`+`Stay Focus` 선택) — 두 줄이 x 로 겹치는 4쌍(Engaged·Big feelings·Ask Questions × Stay Focus·Tricky today)에서 중간선 −1 = 윗줄 · +1 = 아랫줄 · 윗줄 위 −5 / 아랫줄 아래 +5 = 자기 칩. 중간선 = 윗줄 bottom + 3.5 확인 |
| 5점 hit-test 기대값 변경 | `Stay Focus:` → **`Stay Focus:n`** · `Tricky today:` → **`Tricky today:n`** — 위 점(박스 위 −5)이 중간선(−3.5) 너머 윗줄 몫이 된 것이 분할의 **결과**다 (`Big feelings:s` · `Ask Questions:s` 와 대칭). 약화가 아니라 겹친 띠 소유가 바뀐 것 — ⚠️ 칩 4개는 한쪽 점이 44 미달로 남는다(줄 간격 7 의 기하적 한계, `D5-6` 이 정한 처리) |

## H5-3.3 `VG5B-1` ⓑ — `Chip select` 라벨 12.5

| 항목 | 내용 |
|---|---|
| 토큰 | Tier 3 **`--chip-select-label-size: 12.5px`** (`packages/design-tokens/src/component/index.css`, 선례 `--attendance-sticker-title-size` `D4-90`). `DESIGN_TOKEN_MAP.md` §3.3 예외 표기 + §9 신설 |
| 적용 | `packages/ui/src/chip/Chip.css` `.haru-chip--select { font-size: var(--chip-select-label-size) }` — `outline`/`filled`/`glass` 는 `--chip-label-size` 12 그대로 |
| 결과 (393, computed) | 12.5px · 칩 폭 78.6 / 96.1 / 112.2 / 92.0 / 99.6 (Figma 77/97/111/93/101, **±1.6** — 같은 12.5 에서 글리프 폭 차이) · 행 시작 14.6 / 65.7 (Figma 15.5 / 64.5). 이전 12 = −2.3~−3.9 · +4.7/+3.6. 줄 구성 393·320 모두 변동 없음 |
| 테스트 | `reflection-card.spec.ts` 선언값 `font-size 12.5px` 추가 · 기하 테스트에 칩 폭 ±2 · 행 시작 ±1.5 추가. `token-tiers`(273→274) · `fonts`(manifest component 274→275) |
| 다른 칩 불변 증거 | Playwright 전체 단독 실행(14.5m) **573 passed · 1 failed** — 실패는 완료 화면 baseline 1장뿐. 온보딩(`onboarding.spec`) · gallery(`visual.spec`) · `week-summary-chip` 등 **다른 모든 baseline 통과(변경 0)** |

## H5-3.4 Baseline 재생성 — `R-BASELINE-1`

대상 1장: `e2e/__screenshots__/darwin/session-complete.spec.ts/s4-session-complete.png`.

1. 재생성 전 실패 actual 확보 → 연결성분 분해(반경 2). **채널 차 > 0: 4,234 px · 13 클러스터, bbox x 46~346 · y 563~635** (= 칩 영역, 카드 top 465 + 98 · 높이 73). 라벨 글리프 5개(1행 y 574~586 · 2행 614~626) + 칩 가장자리 8개(1행 바깥 2 · 칩 사이 4 · 2행 바깥 2). `Stay Focus`|`Tricky today` 사이는 위치가 같아(189.2) 클러스터 0 — 계산과 일치. **설명 안 되는 클러스터 0**, 칩 영역 밖 변화 0.
2. ⚠️ **첫 재생성(`-g … --update-snapshots=all`)이 로그인 화면을 담았다** (actual 대비 229,310 px 차). 원인 미확정 — 같은 명령 단독 재실행에서 재현되지 않았다(그 직전 실행이 비정상적으로 느렸음, 42 tests 17.1m). 이 파일을 채택하지 않았다.
3. 단독 재실행으로 재생성 → 분석한 actual 과 **픽셀 동일(0 diff)** 확인 후 채택. 이후 `session-complete` + `reflection-card` 단독 **44 passed (1.0m)**.

## H5-3.5 `D5-5` — 입력 높이 40 = 허용 차이 등록 (코드 변경 0)

`AD-S5-1` 로 등록 — `docs/decisions/stage-5-approvals.md` §2 (신설, Stage 4 대장 `stage-4-approvals.md` §4 형식). `reflection-card.spec.ts` 5점 hit-test 의 `…(optional):ns` 가 기대값이며 주석에 `AD-S5-1` 을 적었다.

## H5-3.6 검증 명령 (2026-11-09, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations (838 modules) |
| `pnpm test` | ✅ 184 files · 2654 tests (⚠️ `fonts.test` 는 `dist` 를 읽는다 — `pnpm build` 전 1회는 manifest 275 미반영으로 실패, build 후 통과) |
| `pnpm build` · `pnpm assert:no-mocks` | ✅ (기존 chunk 경고) · ✅ sentinel 0 · `haru-dev-` 0 · sharp 0 |
| `prettier --check` (변경 파일) | ✅ |
| Playwright 전체 단독 | 573 passed · 1 failed(위 baseline) → 재생성 후 `session-complete` + `reflection-card` 44 passed |
| `ls apps/api supabase apps/mobile` | 없음 ×3 |

## H5-3.7 범위 밖 · 확인 요청

- 320(칩 3줄)에서는 분할을 e2e 로 재지 않았다 — 같은 규칙(첫 줄 외 위 slop = 3.5)이 가운데 줄에도 적용된다. 필요하면 QA 가 확인.
- `VG5B-3`(칩 줄 높이 16 ↔ Figma 15)은 높이 31 고정이라 렌더 차이 0 — 손대지 않았다.
- BACKEND_INTEGRATION_PENDING 변동 없음.

---

# `H5-4` `S5-C` — 피드백 · 분석 상태 화면 (2026-11-09, development-agent)

Status: **HANDOFF** · 작업 단위 **`S5-C` 만** (`C13-S5-1`, Spec §2.3). **커밋하지 않았다.**

## H5-4.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-08, user)` (`D5-4`) ✅ |
| `S5-C` 차단 결정 | `N5-09` ②(`C13-S5-1` design-agent 명세) · `N5-10` ⓐ(deep link 전용) · `N5-14`(15s / `failed` 60s / 종착 정지) · `N5-15` ⓐ(재시도 버튼 없음)·ⓑ(Guard 그대로) · `N5-24`(문구 Spec 초안) · `N5-11`(`metricsPreview` 제거 — `S5-A` 그대로) · `N5-12` ⓐ(OAQ-17 enum 변경 0) — 전부 `D5-4` ✅ |
| 이전 단위 | `H5-1`~`H5-3` |
| Backend | 없음 — `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → No such file ×3) |

## H5-4.2 구현

| 항목 | 내용 | 파일 |
|---|---|---|
| route | `ROUTES.sessionFeedback = '/session/:sessionId/feedback'` + `sessionFeedbackPath()` · `FullscreenLayout` + `RouteGuard` (기존 Guard 그대로 — 미로그인 목적지 보존 없음 `N5-15` ⓑ). **앱 안 진입점 0** (`N5-10` ⓐ) | `shared/config/routes.ts` · `app/router.tsx` |
| Page | `SessionFeedbackPage` — `useParams` + `<SessionFeedbackScreen>` 만 (Composition) | `pages/session/SessionFeedbackPage.tsx` · `index.ts` |
| Feature `session-feedback` | `SessionFeedbackScreen`(닫기 · h1 · 메달리온 · state slot) · `AnalysisStatusView`(Spec §2.3 표) · `useAnalysisDisplay`(폴링 + 녹음 판별) · `selectAnalysisDisplayState`(순수 함수) · `copy.ts` · `session-feedback.css` | `features/session-feedback/**` · `styles/index.css` import 1줄 |
| Entity | `ShortFeedbackBubble` — 완료 화면 `SessionCompleteBubble`(Figma `88:929`) 을 `subtext=null` 로 그대로 래핑 (Spec §3.5) | `entities/analysis/ShortFeedbackBubble.tsx` · `index.ts` |
| Entity 확장 | `useSessionDetail(sessionId, { enabled })` — 선택 옵션 추가(기본 `true`, 기존 호출 변경 0) | `entities/session/useSessionDetail.ts` |
| dev | `/__dev/screens` "Stage 5 피드백 · 분석 상태" 13링크(세션 `…0002`) · 아직 없는 화면 목록에서 `/feedback` 제거 · Scenario Panel `analysis` 그룹 설명 갱신 | `dev/DevScreens.tsx` |

### 표시 상태 (Spec §2.3 표 — `selectAnalysisDisplayState`)

| 응답 | 표시 | 렌더 |
|---|---|---|
| 응답 전 | `loading` | `Spinner` *"Loading"* |
| `analyzing` · `completed`(녹음 있음) | `pending` | `InlineAlert info` *"We're preparing today's notes"* |
| `analyzed` + full | `analyzed` | 버블 = `shortFeedback.text` 그대로 · `null`/`""` 이면 **slot 비움** |
| `analyzed` + `excluded_low_quality` | `low-quality` | (text 있으면 버블) + `InlineAlert info` |
| `failed` | `failed` | `InlineAlert info` · 버튼 0 |
| `ANALYSIS_NOT_AVAILABLE` · 응답 `mode=conversation_only` | `not-available` | 기존 `ERROR_COPY.ANALYSIS_NOT_AVAILABLE` |
| `completed` + 상세 `recording.uploadStatus ∈ {deleted, expired}` | `not-available`(no-recording) | 제목 재사용 + 녹음 없음 사유 |
| 네트워크 실패 | `offline` | `ErrorState offline` + *Try again* |
| `RESOURCE_NOT_FOUND` · `FORBIDDEN` | `not-found` | `ErrorState error`(코드별 기존 문구) + *Go home* |
| 그 밖 오류 | `error` | `ErrorState error` + *Try again* |

### 폴링 (AC-5-35)

- `useSessionAnalysis`(`S5-A`) 그대로 — 15s · `failed` 60s · 종착(`analyzed` · `ANALYSIS_NOT_AVAILABLE` · `RESOURCE_NOT_FOUND` · `FORBIDDEN`) 정지 · `refetchIntervalInBackground: false` · 언마운트 시 정지. 사용자 재시도 = 응답이 없을 때의 오류 화면 *Try again* 만.
- 응답이 `completed` 일 때만 세션 상세를 1회 조회해 녹음 삭제·만료를 판별하고, 판별되면 분석 query 를 `enabled: false` 로 정지 (`H5-1.6` ⑤ 해소).
- 받은 응답이 있으면 폴링 중 일시 오류는 표시를 바꾸지 않는다(마지막 응답 유지).

## H5-4.3 Spec 해석 · 판단 (VG · 사용자 확인 대상)

1. **메달리온 y** — Spec §2.3 "스티커 슬롯 없음" + §11 "완료 화면 상단과 골격 좌표 동일(제목·메달리온)". 스티커는 그리지 않고 **자리 높이만** `margin-block-start: title-gap + --attendance-sticker-height + ring-gap` 으로 둔다 → 링 y = 완료 화면 링 y (e2e 로 같은 세션의 두 화면 대조). 새 토큰 0.
2. **low-quality 의 버블 ↔ InlineAlert 간격** — Spec 은 InlineAlert 위치를 "ring bottom + `--space-4`" 로만 적었다. 버블 뒤에도 같은 `--space-4` 를 썼다 (새 값 0). VG 확인 대상.
3. **aria-live** — slot 에 `aria-live="polite"` 1개(Spec §9.1). 단 기존 `InlineAlert` 가 자체 `role="status"`, `ErrorState` 가 `role="alert"` 를 갖고 있어 live region 이 중첩된다 (Shared UI 변경 없이는 제거 불가 — 변경하지 않았다). 접근성 QA 확인 대상.
4. **닫기 라벨** — Spec 대로 *"Close"* (완료 화면은 *"Close session"*). Toast inset 등록은 완료 화면 닫기 줄과 같게 했다.
5. **버블 등장 모션** — Spec §6 대로 폴링으로 pending/failed → 결과가 됐을 때만 C-2 enter 재사용(`data-entrance='play'`). 처음부터 결과면 `static`. 새 keyframes `haru-session-feedback-enter`(완료 화면과 같은 토큰) — `stage4-motion-guards` 대조표에 `no-preference-only` 로 등록.
6. `ErrorState` 는 기존 컴포넌트 폭(카드)이 InlineAlert(345)보다 좁다 — 기존 컴포넌트 그대로, VG 확인 대상.
7. `RESOURCE_NOT_FOUND` · `FORBIDDEN` 은 코드별 기존 `ERROR_COPY` 문구.

## H5-4.4 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 34 | router 등록 + RouteGuard · Page Composition 만 · `lint:boundaries` ✔ · 진입점 0 (`grep sessionFeedbackPath` — 정의·dev 외 사용 0) |
| 35 | 단위 `session-feedback.test.tsx` "폴링" 5건(15s 간격·종착 정지·`failed` 60s·이탈 후 0·**완료 화면 분석 조회 0**) · `recording-deleted` 정지 · e2e `폴링` 3건(`page.clock`) |
| 36 | pending 문구 · `copy.test.ts` 숫자·%·hour 0 · baseline `s5-feedback-pending` |
| 37 | 단위 analyzed(text 그대로) · text null/빈 문자열 → slot 자식 0 · e2e 버블 텍스트 = fixture · baseline `analyzed` · `text-null` |
| 38 | 단위 low-quality(버블 + 안내 순서) · baseline `low-quality` |
| 39 | 단위·e2e failed 버튼 0 · baseline `failed` |
| 40 | 단위 not-available · baseline `not-available` |
| 41 | 단위 recording-deleted(사유 문구 · 상세 1회 · 폴링 정지) · enum 변경 0 · baseline `no-recording` |
| 42 | Loading · Error+Try again(`retry`) · Offline · `RESOURCE_NOT_FOUND`(없는 세션 → Go home) — 단위 + e2e + baseline 4장 |
| 43 | e2e 로그인 deep link(SPA) → 화면 · 미로그인 `page.goto` → `/auth/*` (Guard 그대로) |
| 44 | `copy.test.ts` 금칙어 8종 0 · 문구는 `features/session-feedback/copy.ts` 에만 |
| 45 | contract 에 전사·지표 필드 없음(`S5-A`) · e2e DOM 텍스트에 transcript·수치 표현 0 |
| 46 | e2e 콘솔 수집 — 피드백 문구 · 아이 이름 0 |
| 50 | `features/session-feedback` ↔ 다른 feature import 0 (`lint:boundaries`) · Mock ↔ Http 교체 지점 변경 0 |

## H5-4.5 Mock scenario · 전환

`?scenario=analysis:<key>` — `success`(기본 — 실제 Mock 상태, 3번째 조회에 worker 전이) · `loading` · `error` · `retry` · `offline` · `analysis-pending` · `analysis-completed` · `analysis-failed` · `analysis-low-quality` · `analysis-not-available` · `recording-deleted` · `analysis-pending-then-completed` · `analysis-feedback-missing`. 진입: 로그인 후 `/__dev/screens` "Stage 5 피드백" 링크 또는 SPA 로 `/session/77777777-7777-4777-8777-000000000002/feedback`. 없는 세션 = 임의 uuid.

## H5-4.6 Baseline — `R-BASELINE-1`

- **신규 11장** `e2e/__screenshots__/darwin/session-feedback.spec.ts/s5-feedback-{loading,pending,analyzed,text-null,low-quality,failed,not-available,no-recording,error,offline,not-found}.png` (393×852 전체 프레임, `FRAME_SNAPSHOT`). 신규라 diff 분해 대상 없음 — 생성은 `--update-snapshots=all`(이 spec 만), 직후 단독 재실행에서 11장 모두 비교 통과. 3장(`loading` · `low-quality` · `not-found`)을 열어 dev 패널 0 · 상태 정착 확인.
- dev 패널은 `hideDevPanel`, 촬영 전 `settleImages`. `loading` 은 `page.clock.install()` 로 Mock 지연을 멈춰 Spinner 프레임을 결정적으로 담았다.
- **기존 baseline 변경 0** (아래 전체 실행 결과).

## H5-4.7 검증 명령 (2026-11-09, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations (849 modules, 3277 dependencies) |
| `pnpm build` → `pnpm test` | build ✅ (기존 chunk 경고) · test 1회차 **10 failed** — 머신 부하(Duration 731s, 개별 timeout); JSON 재실행 **1 failed / 2684 passed** = `stage4-motion-guards` AC-4-98 대조표에 새 keyframes 미등록 → 등록(새 애니메이션은 등록 전까지 깨지도록 설계된 테스트) → 해당 파일 10 passed. 최종 전체 재실행 결과는 H5-4.8 |
| 신규 단위 | `features/session-feedback/__tests__/analysisDisplayState.test.ts` 11 · `copy.test.ts` 3 · `apps/web/__tests__/session-feedback.test.tsx` 17 — 전부 통과 |
| `pnpm assert:no-mocks` | H5-4.8 |
| `prettier --check` (변경 파일) | ✅ |
| Playwright `session-feedback.spec.ts` (단독) | **25 passed** |
| `ls apps/api supabase apps/mobile` | 없음 ×3 |

e2e 메모: dev 서버는 `StrictMode` 라 마운트 직후 분석 조회가 1회 취소·재요청된다(queryFn 이 `signal` 을 쓰는 기존 query 와 같은 동작, Production 1회). 폴링 e2e 는 첫 조회 수가 아니라 **증가분**을 잰다.

## H5-4.8 최종 실행 (수정 후)

| 명령 | 결과 |
|---|---|
| `pnpm build` → `pnpm test` | ✅ **187 files · 2685 tests passed** |
| `pnpm assert:no-mocks` | ✅ MOCK/DEV sentinel 0 · `haru-dev-` 0 · sharp 0 |
| Playwright 전체 (단독, 31.0m) | **598 passed · 1 failed** — `auth.spec.ts:138` "Welcome 600px 가로 스크롤" → **단독 재실행 통과**(수정 없음, 이 단위와 무관한 화면 · 부하 간헐). 기존 baseline 변경 0 — `git status e2e/__screenshots__` = 신규 `session-feedback.spec.ts/` + `S5-B` 때부터의 `s4-session-complete.png` 뿐 |

## H5-4.9 BACKEND_INTEGRATION_PENDING 예상

신규 0 — Plan §10 그대로: `P5-BIP-06`~`09`(분석 파이프라인 · 품질 게이트 · 민감 발화 · 피드백 생성/`text: null`) · `10`(push 발송 · 도착 URL `/session/:sessionId/feedback` — 이 route 로 확정) · `11`(24h SLA) · `12`(`failed` 재시도 정책 · 영구 실패 표현) · `13`(`conversation_only` 거부) · `15`(소유권 · RLS) · `16`(녹음 미수신 세션 종결 — Frontend 는 `completed` + 녹음 `deleted`/`expired` 로 판별). 이 단위의 Frontend 부분(표시 · 폴링 · deep link)은 Mock 으로 검증된다.

## H5-4.10 범위 밖 · 보류

- design-agent Visual Gap(`S5-C`, Spec §11 — Figma 없음 → Spec §2.3 대비) 은 다음 단계.
- `FIGMA_SCREEN_MAP.md` · `COMPONENT_MAP.md` 갱신은 design-agent 몫(Spec §1 · §4) — 수정하지 않았다.
- 상태 문구 갱신 시 `docs/API_CONTRACTS.md` 변경 없음 (contract 변경 0).

---

# `H5-5` `S5-C` 후속 수정 — `D5-9` · `D5-10` · `D5-11` (2026-11-10, development-agent)

Status: **HANDOFF** · 범위 = `VG5C-1` · `VG5C-2` 수정 + `D5-11` 기록. **커밋하지 않았다.**

## H5-5.1 Gate

Plan · Spec `APPROVED` (`D5-4`). 사용자 결정 `D5-9` · `D5-10` · `D5-11` (`docs/decisions/stage-5-approvals.md` §1) · Visual Gap `docs/design/stage-5-visual-gap-s5c.md` (`VG5C-1` · `VG5C-2`). Backend 없음 — `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → No such file ×3).

## H5-5.2 `D5-9` / `VG5C-1` — 오류 · 오프라인 · 없음 카드 = 항상 전체 폭

| 항목 | 내용 |
|---|---|
| 원인 | `.haru-session-feedback__alert { display:flex; justify-content:center }` (가로 flex) 가 `ErrorState` 의 `Surface` 를 내용 폭으로 줄였다(shrink-to-fit) — 문구 길이에 따라 249 / 285 / 345 |
| 수정 | `.haru-session-feedback__alert` 만 `flex-direction: column` (기본 `align-items: stretch` → 자식이 컨테이너 폭을 채운다). `justify-content: center` 는 `.haru-session-feedback__loading`(Spinner) 에만 남겼다. 새 토큰 0 · Shared UI 레이아웃 변경 0 · 새 `overflow` 0 (`R-SHADOW-1`) |
| 결과 (393, 런타임 dump) | error · not-found 카드 `x 24 · w 345` (이전 71.8/249.3 · 54.2/284.6) · 버튼 `48 · 297`. offline 은 원래 345 |
| 파일 | `apps/web/src/features/session-feedback/session-feedback.css` · `ui/AnalysisStatusView.tsx`(주석) |
| e2e | `e2e/session-feedback.spec.ts` "카드 폭 · live region {393, 320} (D5-9 · D5-10)" × 4상태(pending · error · offline · not-found) = 8 tests — 카드 폭 = 뷰포트 − 48 (±0.05) · x = 24 |

## H5-5.3 `D5-10` / `VG5C-2` — 중첩 live region 제거

| 항목 | 내용 |
|---|---|
| Shared UI API (하위 호환) | `InlineAlert` — 선택 prop **`announce?: 'auto' \| 'none'`** (기본 `auto` = 기존 tone 별 role 그대로). `ErrorState` — 기존 `announce?: 'alert' \| 'status'` 에 **`'none'`** 추가 (기본 `alert` 그대로). `none` = role · `aria-live` 를 붙이지 않는다 |
| 사용처 | `AnalysisStatusView` 의 `InlineAlert`(StatusAlert) · `ErrorState` ×2 에만 `announce="none"`. slot `aria-live="polite"` 1개 = Spec §9.1 |
| 파일 | `packages/ui/src/feedback/InlineAlert.tsx` · `ErrorState.tsx` · `__tests__/InlineAlert.test.tsx` · `__tests__/States.test.tsx` |
| 기본 동작 불변 증거 (단위) | InlineAlert 5 tone × { 기본 role/aria-live = 이전 규칙 · `announce="auto"` innerHTML = prop 생략과 동일 } · ErrorState 기본 role=alert · `none` 의 innerHTML = 기본에서 ` role="alert"` 만 뺀 것. `none` → role/aria-live 0 · 아이콘·문구·버튼 그대로 |
| 기본 동작 불변 증거 (시각) | 다른 화면의 InlineAlert · ErrorState baseline 전부 통과(H5-5.5). 이 화면 InlineAlert 8장도 재생성 없이 통과 — role 은 픽셀에 영향 0 |
| e2e | 위 8 tests — slot `aria-live=polite` · slot 안 `[aria-live]` · `[role]` 0 |
| 실제 스크린리더 | 미검증 — QA `NOT VERIFIED` 수동 항목 (VG §7: VoiceOver pending → analyzed 폴링 전환 · error 진입 시 낭독 횟수) |

## H5-5.4 `D5-11` — 버블 ↔ 저품질 안내 간격 16 확정 (코드 변경 0)

구현 그대로(`--space-4`). Spec §2.3 문구 보완은 사용자가 직접 한다 — 이 단위에서 Spec 을 수정하지 않았다.

## H5-5.5 Baseline — `R-BASELINE-1`

1. 수정 후 `session-feedback.spec.ts` 단독(갱신 없이) → **2장만 실패**: `s5-feedback-error` · `s5-feedback-not-found`. `offline` 은 393 에서 원래 345 라 변화 0 (예상 3장 중 1장 불변).
2. 실패 actual 을 연결성분(채널 차 > 5, 반경 2)으로 분해:
   - error — 38,945 px · 11 클러스터: 좌우 대칭 띠 2개(x 6~116 · 276~386, y 280~547 = 카드·버튼 가장자리 + 그림자, 19,360/19,359) · 그림자 끝 1열 2개(x 3 · 389, y 370~476) · 1~3 px 7개(버튼 모서리 y 512~541 · 배지 아이콘 y 336 — 카드 x 가 71.83 → 24 로 정수화되며 래스터 오프셋 변화)
   - not-found — 28,504 px · 14 클러스터: 대칭 띠 2개(13,983 ×2) · 그림자 끝 1열 2개 · 배지·제목 영역 3개(x 172~220, y 306~353 — 이전 배지 x **172.484**(카드 x 54.203 의 소수) → 172.5, 안티앨리어싱) · 1~4 px 5개
3. **런타임 토글로 확정** (임시 probe, 실행 후 삭제): 같은 페이지에 이전 CSS(`flex-direction:row; justify-content:center`) + role 복원을 주입해 찍은 프레임 ↔ **기존 baseline 0 px**, 주입 전 프레임 ↔ 실패 actual **0 px** (두 상태 모두). → 모든 클러스터가 이 CSS 한 줄로 설명된다. **설명 안 되는 클러스터 0.**
4. `-g "baseline: (error|offline|not-found)$" --update-snapshots=all` 로 재생성 → error · not-found 2장 갱신, offline 은 파일 변경 없음(mtime 그대로).
5. 재생성 후 Playwright **전체** 단독 실행에서 이 spec 포함 전부 통과 (H5-5.6). 기존 다른 baseline 변경 0 — `git status e2e/__screenshots__` = 미추적 `session-feedback.spec.ts/`(S5-C 신규) + `S5-B` 때부터의 `s4-session-complete.png` 뿐.

## H5-5.6 검증 명령 (2026-11-10, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations (849 modules, 3277 dependencies) |
| `pnpm build` → `pnpm test` | build ✅ (기존 chunk 경고) · test ✅ **187 files · 2703 tests passed** (+18 = InlineAlert announce 15 · ErrorState announce 3) |
| `pnpm assert:no-mocks` | ✅ `haru-dev-` 0 · sharp 0 |
| `prettier --check` (변경 파일) | ✅ |
| Playwright `session-feedback.spec.ts` (단독, 갱신 전) | 31 passed · 2 failed (baseline error · not-found → H5-5.5) — 신규 8 tests 는 첫 실행에서 통과 |
| Playwright 전체 (단독, 13.3m) | ✅ **607 passed · 0 failed** |
| `auth.spec.ts:138` Welcome 600px (H5-4.8 에서 전체 실행 1회 실패) | 이번 전체 실행에서 **통과** — 재발 없음 |
| `ls apps/api supabase apps/mobile` | 없음 ×3 |

## H5-5.7 BACKEND_INTEGRATION_PENDING · 범위 밖

- BACKEND_INTEGRATION_PENDING 변동 없음. contract 변경 0 · `docs/API_CONTRACTS.md` 변경 없음.
- `COMPONENT_MAP.md` 의 `InlineAlert` · `ErrorState` 행에 `announce` 옵션 표기는 design-agent 몫으로 남겼다 (수정하지 않음).
- Spec §2.3 의 `ErrorState` 폭(`D5-9`) · 간격 16(`D5-11`) 문구 보완은 사용자 작업.
- `VG5C-1` · `VG5C-2` 재검토는 design-agent Visual Gap 다음 단계.

---

# `H5-6` `S5-D` — 횡단 검증 + `D5-12` (2026-11-10, development-agent)

Status: **HANDOFF → stage-qa-agent** · 범위 = Plan §12 `S5-D`(AC-5-44~50 · 52) + Orchestrator 추가 지시 `D5-12`(`VG5C-3`). 새 화면·UI 0. **커밋하지 않았다.** `docs/COMPONENT_MAP.md` · `docs/design/*` 는 손대지 않았다 (design-agent 편집 중).

## H5-6.1 Gate

Plan · Spec `APPROVED (2026-11-08, user)` (`D5-4`). 결정 `D5-1`~`D5-12` (`docs/decisions/stage-5-approvals.md`). 이전 단위 `H5-1`~`H5-5`. Backend 0 — `ls apps/api supabase apps/mobile` → No such file ×3.

## H5-6.2 수정 · 추가

| 항목 | 내용 | 파일 |
|---|---|---|
| **`D5-12`** (`VG5C-3`) | `Spinner` 선택 prop **`announce?: 'auto' \| 'none'`** (기본 `auto` = 기존 `role="status"` + `aria-live="polite"`). `none` = role · aria-live 0, **라벨 텍스트는 접근성 트리에 남는다**(`decorative` 와 달리 `aria-hidden` 0). `decorative` 가 우선. 사용처 = 피드백 slot loading **1곳** | `packages/ui/src/feedback/Spinner.tsx` · `__tests__/Spinner.test.tsx`(+3: 생략 = `auto` innerHTML 동일 · `none` = 두 속성만 빠짐 · decorative 우선) · `apps/web/src/features/session-feedback/ui/AnalysisStatusView.tsx` |
| `D5-12` e2e | `session-feedback.spec.ts` "loading — live region 1개 · Spinner 라벨은 남는다" × 393 · 320 — slot `aria-live=polite` · slot 안 `[aria-live]`/`[role]` 0 · *Loading* 텍스트 1 (aria-hidden 밖). `s5-feedback-loading` baseline 은 **재생성 없이 통과**(role 은 픽셀 영향 0) | `e2e/session-feedback.spec.ts` |
| dev 화면 목록 (AC-5-16) | `/__dev/screens` 에 빠져 있던 2링크 추가: `reflections:retry` · 피드백 **없는 세션**(`RESOURCE_NOT_FOUND` → Go home). 목록 key = path+param (같은 param 2건). Scenario Panel 은 `reflections`·`analysis`·`session-completion` 그룹 전 key 를 이미 노출 (`H5-2`). dev 전용 — Production 0 (`assert:no-mocks`) | `apps/web/src/dev/DevScreens.tsx` |
| copy 검사 (AC-5-44) | 금칙어 8종 0 — 회고 copy · 피드백 copy · 공통 `ERROR_COPY` 전 code(`errorCopyForCode` 가 어떤 code 든 띄울 수 있음) · Mock `shortFeedback.text` · 이름은 제목 슬롯에만 | `apps/web/__tests__/stage5-copy.test.tsx` (신규 6) |
| privacy 단위 (AC-5-46 · 47) | ① 회고 제출 성공(mutation cache) 후 로그아웃 → `['reflections'…]`·`['analysis'…]` query · mutation **0** · 저장소에 note · `reflection` 0 ② 피드백 분석 조회 후 로그아웃 → 0 ③ Mock Adapter 가 schema 위반(note 501자) 요청을 거부하는 **parse 실패 경로**에서 콘솔 note 0 | `apps/web/__tests__/stage5-privacy.test.tsx` (신규 3) |
| 횡단 e2e | 아래 H5-6.3 | `e2e/stage5-cross-cutting.spec.ts` (신규 28) |

결함 수정은 `D5-12` 뿐이다 — 그 밖의 S5-D 검사에서 **제품 결함 0**.

## H5-6.3 검사 결과

| 영역 | 방법 | 결과 |
|---|---|---|
| copy | 단위(위) + e2e DOM 텍스트·`aria-label`·placeholder·Toast 4종(실패·오프라인·이미 저장·저장됨) · 피드백 9상태 금칙어 0 · 피드백 화면 숫자 0 | ✅ |
| copy 위치 | `features/reflection` · `features/session-feedback` · `entities/analysis` · Page 의 JSX 리터럴 grep → 0 (문구는 `copy.ts` + 공통 `error-copy` 만). 버블 = `shortFeedback.text` 응답 그대로(`H5-4` AC-37) | ✅ |
| 동의 전 아동 데이터 | Stage 5 화면은 Guard(로그인 + 온보딩/동의 완료) 뒤에만 있다 — 새 경로 0. deep link 미로그인 → `/auth/*` (`session-feedback.spec` AC-43) · 회고 요청은 완료 화면에서만 | ✅ (구조) |
| 콘솔 PII | e2e: 회고 `error`·`offline`·`invalid-transition`·`retry` 각각 2회 제출 + 피드백 폴링 pending→analyzed — `console` + `pageerror` 에 note · `Nova` · 피드백 문구 0. 구조: `apps/web` 의 console 접근은 `shared/lib/logger.ts` 1곳(화이트리스트 키만) · Stage 5 신규 파일의 `console`/`devWarn`/저장소 API grep 0 | ✅ |
| 저장소 | 회고 note → localStorage · sessionStorage 0 (단위 · e2e `reflection-card.spec` AC-27) · 로그아웃 후 Stage 5 cache 0 (단위) | ✅ |
| 제3자 SDK · Secret | 이 Stage 의 `package.json` · lockfile 변경 0 · 분석/광고 SDK 이름 grep 0 · `VITE_*` = `API_MODE` · `API_BASE_URL` · `MOCK_SCENARIO` 3종(Secret 0) · `assert:no-mocks` OK | ✅ |
| 포커스 순서 (Spec §9.1) | e2e Tab: `Close session → 1 star(roving 1 정지) → Engaged → Big feelings → Ask Questions → Stay Focus → Tricky today → 입력 → Save` · radiogroup 1 · 칩 group 이름 = 카드 제목 · Save description = *Choose stars…* · 피드백 `Close → Try again`(error) / `Close → Go home`(not-found) · 포커스 링 표시 | ✅ |
| 터치 타깃 | 회고 카드 = `reflection-card.spec` 5점(알려진 3종: `P-29` 별 · `AD-S5-1` 입력 · `D5-6` 칩) · 피드백 화면 5점: Close(시각 38, hit 44) · Try again · Go home **미달 0** | ✅ |
| reduced motion | e2e `reducedMotion: 'reduce'`: 피드백 pending→analyzed(play 경로) slot 안 `animationName` 전부 none · 회고 카드 animation 0 · 별 transition 0 | ✅ |
| 대비 (픽셀 프로브, 393) | computed 글자색 ↔ 글자 지운 면 중앙값: 카드 제목 **6.62** · 칩 미선택 **4.87** · placeholder **2.31** (`P-28`) · 칩 선택 **2.07** · Save **2.07** (`D-01`) · 피드백 h1 **5.59** · InlineAlert 제목·설명 **4.93** · 버블 **6.63** · ErrorState 제목 **6.63** / 설명 **3.20** (기존 `ErrorState` secondary — 기존 가값 `P-01` 계열, Stage 5 신규 아님). Spec §9.2 계산값과 일치 | ✅ AA (예외 = 아래) |
| 반응형 | 회고 카드 320×568 · 393×667 · 600 · 1024 (`reflection-card.spec` AC-32) · 피드백 320 · 600 · 1024 + 393 기하 + 카드 폭 320/393 (`session-feedback.spec`) — 가로 넘침 0 · 앱 컬럼 ≤ 480 | ✅ |
| 레이어 | `lint:boundaries` ✔ (851 modules) · `features/reflection` ↔ `session-feedback` ↔ `storytime-session` import 0 (주석 언급 1건뿐) · Page 2개 = `useParams` + feature 조립만 (`SessionCompletePage` 는 `footer` slot) · Adapter 선택 지점 1곳 (`app/providers/apiClients.ts`) | ✅ |

**가값 · 수용 예외 목록 (AC-5-49)**: 신규 가값 `P-28`(placeholder 2.31) · `P-29`(별 hit 38×44) — CSS `provisional:` 주석 + `provisional-markers.test` 고정. 수용 예외 `D-01`(칩 선택 · Save 흰 라벨 2.07). 허용 차이 `AD-S5-1`(입력 40). 기존 `P-02`(별 채움/빈 · 칩 테두리 비텍스트 대비). ⚠️ `P-28`·`P-29` 는 dev gallery 가값 목록(`provisionalItems.ts`)에 **넣지 않았다** — Stage 4b `P-26`·`P-27` 선례 · gallery baseline 영향. 가값 대장(`stage-5-approvals.md`)에는 `D5-4` 행으로만 있다 — 별도 대장 절 신설은 Orchestrator 판단.

**axe**: 저장소에 axe 도구가 없다(의존성 추가는 승인 사항) — Plan AC-49 "axe · 수동" 중 axe 는 위 e2e 프로브로 대신했다. **실제 스크린리더(VoiceOver) 낭독**은 `NOT VERIFIED` 수동 항목(`H5-5.3` · `D5-12` 포함).

## H5-6.4 AC 상태표 — Stage 5 전체 (판정은 QA)

| AC | 상태 | 근거 |
|---|---|---|
| 01 | 준비됨 | `apps/api` · `supabase` · `apps/mobile` 없음 ×3 |
| 02 | 준비됨 | `/reflection` route 0 · 클립 API 메서드 0(`stage5-fixtures.test`) · 프로필/리포트/데이터관리 UI 0 |
| 03 · 04 · 05 · 06 · 07 · 08 | 준비됨 | `H5-1.3` (contracts 단위) |
| 09 | 준비됨 | `API_CONTRACTS.md` Rev 9 (`H5-1`) — 이후 contract 변경 0 |
| 10 · 11 · 12 · 13 · 14 · 15 | 준비됨 | `H5-1.3` (Mock 단위 · `lint:boundaries`) |
| 16 | 준비됨 | `API_CONTRACTS §5.4` · Scenario Panel 그룹 3 · `/__dev/screens` 회고 8 + 피드백 14 링크 (H5-6.2) |
| 17 · 18 · 19 | 준비됨 | `H5-2.3` · `H5-3` (기하 · baseline) |
| 20 · 21 · 22 · 23 | 준비됨 | `H5-2.3` · `H5-3.2`(`D5-6`) · `AD-S5-1`(`D5-5`) |
| 24 · 25 · 26 · 27 · 28 · 29 · 30 | 준비됨 | `H5-2.3` (단위 + e2e) · `D5-7` · `D5-8` |
| 31 | 준비됨 | `reflection-card.spec` "완료 경로별 카드" — `conversation_only` · `auto_timeout` (복구 경로는 완료 화면 경로 있음 = 같은 카드, 전용 e2e 없음 — QA 확인) |
| 32 | 준비됨 | `reflection-card.spec` 반응형 4폭 + `R-SHADOW-1` 세로·가로 프로브 |
| 33 | **NV** | 실기기 iOS 소프트 키보드 (계획대로) |
| 34 · 35 · 36 · 37 · 38 · 39 · 40 · 41 · 42 · 43 | 준비됨 | `H5-4.4` · `H5-5`(`D5-9` · `D5-10`) · H5-6.2(`D5-12`) |
| 44 | 준비됨 | H5-6.3 copy (단위 + e2e) |
| 45 | 준비됨 | contract 필드 0 (`H5-1`) · e2e 피드백 9상태 숫자 0 · `session-feedback.spec` transcript 0 |
| 46 | 준비됨 | H5-6.3 콘솔 PII (e2e 5 · 단위 parse 실패 1 · `reflection-card.test` 1) |
| 47 | 준비됨 | `stage5-privacy.test` 로그아웃 2건 · 저장소 검사 |
| 48 | 준비됨 | 의존성 변경 0 · `VITE_*` Secret 0 · `assert:no-mocks` OK |
| 49 | 준비됨 (+NV 수동) | H5-6.3 포커스 · 이름 · 터치 · reduced motion · 대비 — 스크린리더 낭독은 **NV** |
| 50 | 준비됨 | `lint:boundaries` · feature 간 import 0 · Page 조립만 |
| 51 | 준비됨 | AC-4-61·104 → AC-5-18·19 승계(`H5-2.3`) · baseline 재생성 `R-BASELINE-1` (`H5-2.4` · `H5-3.4` · `H5-5.5`) · 아래 전체 e2e |
| 52 | 준비됨 | H5-6.5 |
| 53 · 54 · 55 · 56 | **BACKEND_INTEGRATION_PENDING** | 아래 H5-6.6 |

## H5-6.5 검증 명령 (2026-11-10, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ |
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations (851 modules, 3286 dependencies) |
| `pnpm build` → `pnpm test` | build ✅ (기존 chunk 경고) · test ✅ **189 files · 2715 tests passed** (+12 = copy 6 · privacy 3 · Spinner 3) |
| `pnpm assert:no-mocks` | ✅ sentinel 0 · `haru-dev-` 0 · sharp 0 |
| `prettier --check packages apps/web/src apps/web/__tests__ e2e` | ✅ |
| Playwright `stage5-cross-cutting` + `session-feedback` (단독) | ✅ **63 passed** (1.0m) |
| Playwright 전체 (단독, 13.8m) | ✅ **637 passed · 0 failed** (이전 607 + 30 = cross-cutting 28 · D5-12 loading 2) |
| `ls apps/api supabase apps/mobile` | 없음 ×3 |
| Baseline | **변경 0** — 새 baseline 0 · 재생성 0 |

## H5-6.6 BACKEND_INTEGRATION_PENDING (Stage 5 전체 — Stage 8 Handoff 1:1 대상)

Plan §10 · §18 그대로, 신규 0:

| ID | 내용 | AC | Handoff 문서 |
|---|---|---|---|
| `P5-BIP-01` | 회고 저장 · `Idempotency-Key` 24h · 세션당 1건(`REFLECTION_ALREADY_SUBMITTED`) | 53 | BH · DR |
| `P5-BIP-02` | 회고 허용 상태 서버 강제(완료 계열 전 `SESSION_INVALID_TRANSITION`) | 53 | BH |
| `P5-BIP-03`~`05` | 회고 → 추천 · 서재 평점 집계 · 리포트 반영 | 53 | BH · DR · AP |
| `P5-BIP-06`~`09` | STT · 품질 게이트(`excluded_low_quality`) · 민감 발화 처리 · 짧은 피드백 생성(검수 템플릿, 실패 시 `text: null`) | 54 | AP |
| `P5-BIP-10` | `short_feedback_ready` push 발송 — 도착 URL `/session/:sessionId/feedback` (네이티브 수신은 `S4N-*`) | 55 | BH |
| `P5-BIP-11` | 분석 24h SLA | 54 | AP |
| `P5-BIP-12` | `failed` 재시도 정책 · 영구 실패 표현 | 54 | AP |
| `P5-BIP-13` | `conversation_only` 분석 거부(`ANALYSIS_NOT_AVAILABLE`) | 40 의 서버 부분 | BH · AP |
| `P5-BIP-14` | 하이라이트 클립 추출 · 저장 · signed URL 만료 (`OAQ-13`) | 56 | AP · DR |
| `P5-BIP-15` | 회고 · 분석 소유권 · RLS | 42 의 서버 부분 | AUTH · DR |
| `P5-BIP-16` | 녹음 미수신 세션 종결 (Frontend 판별 = `completed` + 녹음 `deleted`/`expired`) | 41 의 서버 부분 | AP · RU |

## H5-6.7 범위 밖 · 확인 요청

1. `P-28` · `P-29` 의 dev gallery 가값 목록 등재 여부 · 가값 대장 절 신설 — Orchestrator/사용자 판단 (위).
2. `COMPONENT_MAP.md` 의 `Spinner` 행 `announce` 표기는 design-agent 몫 (수정하지 않음).
3. axe 도입은 하지 않았다 (승인 사항).

---

# `H5-7` QA 수정 라운드 1 — `D5-13` · `QA-5-001` · `QA-5-002` · 이름 불일치 조사 (2026-11-11, development-agent)

Status: **HANDOFF → stage-qa-agent (재검증)** · 근거 = `docs/qa/stage-5-qa-report.md` (Stage Verdict `INCOMPLETE`) + 사용자 결정 `D5-13` (`AD-S5-2`). **커밋하지 않았다.**

## H5-7.1 Gate

Plan · Spec `APPROVED` (`D5-4`). `D5-13` · `AD-S5-2` 등록 = `docs/decisions/stage-5-approvals.md` §1 · §2. Backend 0 — `ls apps/api supabase apps/mobile` → No such file ×3.

## H5-7.2 `D5-13` — viewport `maximum-scale=1` (QA-5-003 실기기 결과)

| 항목 | 내용 |
|---|---|
| 원인 | 회고 카드 입력칸 13px(Figma `--text-footnote`) < 16px → iOS Safari 가 포커스 때 자동 확대하고 입력 후에도 되돌리지 않음 (사용자 iPhone) |
| 수정 | `apps/web/index.html` viewport = `width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover` (기존 3값 유지 + 1값 추가, 근거 주석). 입력칸 13px 그대로 · `user-scalable=no` 쓰지 않음 |
| 테스트 | 신규 `apps/web/__tests__/viewport-meta.test.ts` (2 tests) — viewport meta 정확히 1개 · content 문자열 고정 · `user-scalable=no/0` 없음 |
| 의존 확인 | 예전 문자열을 참조하는 곳 0 (`grep initial-scale` → `index.html` 뿐). `scripts/assert-no-mocks.mjs` · `vite.config.ts`(`haru:inter-preload`) 는 viewport 를 보지 않는다. 빌드 산출물 `apps/web/dist/index.html` 에 같은 content 로 나온다 (`pnpm build` 후 grep). `assert:no-mocks` ✅ |
| 남은 검증 | iOS 실기기 재확인(확대 없음 · 두 손가락 확대 유지)은 QA `QA-5-003` 수동 절차 — 이 머신에서 불가 |

## H5-7.3 `QA-5-001` (Low, docs) — `COMPONENT_MAP.md` `Spinner` 행

`Spinner / Skeleton` 행 Props 에 `decorative`, `announce` 추가 · 비고에 `announce` = `'auto'`(기본 `role=status` + `aria-live=polite`) · `'none'`(role · `aria-live` 없음, 라벨은 트리에 남음 — `D5-12`) · `decorative` 우선 · 사용처 `S5-C`. 구현 `packages/ui/src/feedback/Spinner.tsx` 와 대조함.

## H5-7.4 `QA-5-002` (Low, docs) — `API_CONTRACTS.md` 저장된 회고 fixture

`session-completion` · `reflection-submitted` 행: `big_feelings` → **`asked_questions`** (+ 출처 `mocks/fixtures/reflections.ts` `MOCK_SUBMITTED_REFLECTION_INPUT` 명시). 실제 fixture = `rating 4 · checks ['engaged', 'asked_questions'] · note`. 같은 파일의 다른 `big_feelings` 1건(§2 enum 표 `ReflectionCheckKey`)은 enum 목록이라 정상.

## H5-7.5 이름 불일치 (완료 버블 "Emma" ↔ 회고 카드 제목 "Nova") — ⛔ **수정 보류, 결정 필요**

| 출처 | 값 | 성격 |
|---|---|---|
| 완료 버블 | `apps/web/src/mocks/fixtures/sessions.ts` `MOCK_COMPLETION_BUBBLE.text` = `Storytime success! Emma did wonderfully.` | Figma `88:929` override **원문 그대로** (Stage 4 `D4-87`, `e2e/session-complete.spec.ts` `RECORDED` 상수) — 고정 Mock 문구, 아이 이름을 끼워 넣지 않는다 |
| 회고 카드 제목 | `apps/web/src/mocks/fixtures/me.ts` `MOCK_CHILD_FIRST_NAME = 'Nova'` → `GET /v1/me` `child.firstName` → `reflectionCopy.title(name)` | Figma `91:692` 은 `How was storytime with Emma?` (`stage-5-visual-gap-s5b.md` 가 "이름 Emma↔Nova 는 fixture 데이터" 로 기록) |

선택지와 결과:

1. **버블을 `Nova` 로** (고정 문구 교체 또는 이름 끼워 넣기) = Stage 4 copy(Figma 원문) 변경 → 지시대로 **시도하지 않음**.
2. **`MOCK_CHILD_FIRST_NAME` 을 `Emma` 로** (fixture 1줄 · 두 문구 모두 Figma 와 일치) — **시도 후 되돌림**. 근거:
   - Playwright 전체 단독 실행: **635 passed · 2 failed** — ① `s4-session-complete` baseline 1,035 px(제목 글자 영역) ② **`session-regression.spec.ts:576` AC-4-99 `320×852` 완료 화면 세로 넘침 4px** (기대 0).
   - **런타임 토글로 원인 확정** (임시 probe spec, 실행 후 삭제): 320 에서 제목 1줄 폭 `How was storytime with Emma?` **258.70px** > 가용 **258px** → 2줄(h 20 → 40) → AppShell `scrollHeight − clientHeight = 4`. 같은 페이지에서 텍스트만 `Nova`(249.27px)로 바꾸면 h 20 · 넘침 0. 393 은 가용 330 이라 두 이름 모두 1줄.
   - 즉 ②는 baseline 갱신으로 해결되는 문제가 아니라 **Stage 4 AC-4-99(≥796 높이에서 완료 화면 스크롤 0)와 Stage 5 회고 카드 제목(줄바꿈 허용, Spec `w-full`)의 충돌**이며, Figma 예시 이름 `Emma` 조차 320 에서 이를 깬다. 현재 통과는 fixture 이름이 짧아서다 (`Sebastian` 등 실제 이름은 이미 넘칠 수 있다). 레이아웃·AC 변경은 이 라운드 범위 밖 → 보류.
   - 되돌림 범위: `me.ts` · e2e 3 파일 상수 · 단위 테스트 2 파일 — 전부 원래 값(`Nova`). baseline 은 재생성하지 않았다 (`R-BASELINE-1` ⑤ — 설명은 됐지만 원인이 회귀이므로 갱신 대상 아님).
3. 결정 요청 (Orchestrator → 사용자 · design-agent): ⓐ 이름을 `Emma` 로 맞추고 320 완료 화면 제목 2줄 시 세로 처리(AC-4-99 예외 또는 레이아웃 조정)를 정한다 ⓑ 불일치를 Mock 데이터 특성으로 두고 그대로 수용 ⓒ 기타.

## H5-7.6 검증 명령 (2026-11-11, 이 머신, 최종 상태 = 이름 변경 되돌린 뒤)

| 명령 | 결과 |
|---|---|
| `pnpm build` | ✅ (기존 chunk 경고) · `dist/index.html` viewport = 새 content |
| `pnpm assert:no-mocks` | ✅ `haru-dev-` 0 · sharp 0 |
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations (852 modules, 3288 dependencies) |
| `pnpm test` (build 후) | ✅ **190 files · 2717 tests passed** (+2 = `viewport-meta.test.ts`) |
| `prettier --check` (변경 코드 파일) | ✅ |
| Playwright 전체 (단독, 14.3m) | ✅ **637 passed · 0 failed** · baseline 파일 변경 0 (`git status e2e/__screenshots__` = 이 라운드 이전과 동일) |
| `ls apps/api supabase apps/mobile` | 없음 ×3 |

## H5-7.7 BACKEND_INTEGRATION_PENDING · 범위 밖

- BACKEND_INTEGRATION_PENDING 변동 없음. contract 변경 0 (`API_CONTRACTS.md` 는 fixture 서술 1곳 정정만).
- Shared UI · 토큰 · 화면 CSS 변경 0. baseline 변경 0.
- `H5-6.7` 2번(`Spinner` 표기는 design-agent 몫)은 이번 `QA-5-001` 지시로 development-agent 가 처리했다.

---

# `H5-8` `D5-14` · `D5-15` — Mock 이름 Emma + 회고 카드 제목 2줄 대응 (Spec §13 옵션 2) (2026-11-11, development-agent)

Status: **HANDOFF → stage-qa-agent (재검증) · design-agent Visual Gap** · 근거 = `docs/decisions/stage-5-approvals.md` `D5-14` · `D5-15` (허용 차이 `AD-S5-3` · `AD-S5-4`) + `docs/design/stage-5-design-spec.md` §13. **커밋하지 않았다.** plan 문서(AC-4-99 문구)는 plan-agent 몫 — 건드리지 않았다.

## H5-8.1 Gate

Plan · Spec `APPROVED` (`D5-4`) · §13 2안 = 사용자 승인 `D5-15`. Backend 0 — `ls apps/api supabase apps/mobile` → 없음 ×3.

## H5-8.2 변경

| # | 파일 | 내용 |
|---|---|---|
| 1 | `apps/web/src/mocks/fixtures/me.ts` | `MOCK_CHILD_FIRST_NAME` `Nova` → **`Emma`** (Figma `91:692` · `88:929`). 온보딩 draft fixture(`fixtures/onboarding.ts` `Nova`)는 지시 범위 밖 — 그대로 |
| 2 | `packages/design-tokens/src/component/index.css` | `--reflection-card-bottom-gap: 29px` → **`var(--space-3)`** (12) + 근거 주석 (Figma 29 는 웹 852 에서 안 보임 · 하한 = 그림자 아래 10, `R-SHADOW-1`). Tier 3 토큰 수 불변 (274) |
| 3 | `apps/web/src/features/reflection/reflection.css` | `.haru-reflection-card__title` 에 `overflow-wrap: break-word`(Figma `word-break: break-word` 복원) + 2줄 clamp(`display: -webkit-box` · `-webkit-box-orient: vertical` · `-webkit-line-clamp: 2` · `line-clamp: 2` · `overflow: hidden`) + 근거 · `R-SHADOW-1` 점검 주석(박스 안 그림자 요소 0). DOM 텍스트 · `aria-labelledby` 이름은 전체 문자열 |
| 4 | 테스트 이름 상수 `Nova` → `Emma` (fixture 연동분만) | `apps/web/__tests__/reflection-card.test.tsx` · `stage5-privacy.test.tsx` · `e2e/reflection-card.spec.ts` (`TITLE`) · `e2e/stage5-cross-cutting.spec.ts` (`CHILD`) · `e2e/session-feedback.spec.ts` (콘솔에 아이 이름 0). `stage5-copy.test.tsx` 의 `Nova` 는 copy 함수 인자라 fixture 와 무관 — 그대로 |
| 5 | 🆕 `e2e/reflection-title-overflow.spec.ts` (4 tests) | 320 / 393 / 600 / 1024 × 852 — 실제 완료 화면(fixture `Emma`) 측정 후 제목 텍스트만 교체(Spec §13.1 `[run]` 방법): `Nova` · `Emma` · `Sebastian` · `Maximiliana` · 공백 없는 31자 · `W`×40. 각 이름마다 뷰포트 세로 넘침 0 · 가로 넘침 0 · 제목 높이 20~40(≤ 2줄) · 제목 `scrollWidth − clientWidth = 0` · 제목 좌우가 카드 안 · DOM 텍스트 = 전체 문자열 · `region` 접근성 이름 = 전체 문자열 |
| 6 | `e2e/reflection-card.spec.ts` 반응형 4 tests | "카드 아래 29" → **≥ 12** · 🆕 스크롤 끝 뷰포트 하단 − 카드 bottom ≥ 10 + 카드 아래 +5 픽셀 프로브(그림자 on/off Δ ≥ 4) — Spec §13.7-4 세로 프로브 (320×568 · 393×667 · 600×900 · 1024×768) |
| 7 | `e2e/session-regression.spec.ts` AC-4-100 | computed overflow 목록 `852 complete` 에 `.haru-reflection-card__title hidden/hidden` 추가 + 근거 주석 (새 overflow 박스는 이 목록이 깨지도록 설계됨 — 실제로 깨졌다) |

AC-4-99 테스트(`session-regression.spec.ts:568`)의 `height >= 796` 주석 · 조건은 plan-agent 개정 대기로 손대지 않았다 (Spec §13.6 — 320×796 은 원래 넘친다. 테스트는 852·768 만 잰다).

## H5-8.3 Baseline — `R-BASELINE-1`

절차: 실행 전 `e2e/__screenshots__` 전체 백업 → 전체 e2e `--update-snapshots=all` (단독) → 백업과 **파일 전수 비교** → 바뀐 파일마다 픽셀 연결성분 분해.

| baseline | 클러스터 | 원인 | 처리 |
|---|---|---|---|
| `session-complete.spec.ts/s4-session-complete.png` (393×852) | **1개** — y 487~504 · x 68~325 · 2,373px (Playwright 집계 1,035) · maxΔ 176 | 회고 카드 제목 글자(카드 top 465 + padding 20 → 줄 485~505) = **이름 Nova→Emma**. **런타임 토글로 확정**: 같은 화면에서 제목 텍스트만 `Nova` 로 바꿔 찍으면 기존 baseline 과 **diff 0 px** → 여백 12 · clamp · break-word 는 393×852 에서 픽셀 영향 0 (Spec §13.4 `[px]` 0 과 일치) | **갱신** |
| `visual.spec.ts/s2-onboarding-childinfo.png` · `s2-onboarding-childinfo-trial.png` · `v2-material.png` | 13px Δ1 (x 0~1 세로 가장자리) · 7px Δ1 · 98px Δ≤6 (y 417~428 · 573~584 좌우 가장자리) — 셋 다 임계 미만이라 평소 통과 | **이번 변경과 무관**: 내 3개 변경(이름 · 토큰 · 제목 CSS)을 되돌린 상태에서 다시 찍어도 **같은 픽셀**(off↔run1 diff 0), 3회 반복 결정적. 이 화면들은 Mock 아이 이름을 보이지 않는다(온보딩은 draft fixture `Nova`). = 기존 스테일(`R-BASELINE-1` 3-1), 근본 원인은 이 라운드에서 밝히지 못함 | ⛔ **갱신하지 않음** — 백업으로 복원. 원인 미설명 → 결정 대기 |

`session-feedback.spec.ts/` baseline 폴더는 이 라운드 이전부터 untracked(Stage 5 작업분) — 내용 변경 0.

## H5-8.4 검증 명령 (2026-11-11, 이 머신)

| 명령 | 결과 |
|---|---|
| `pnpm build` → `pnpm assert:no-mocks` | ✅ (기존 chunk 경고) · ✅ `haru-dev-` 0 · sharp 0 |
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations (852 modules, 3288 dependencies) |
| `pnpm test` (build 후) | ✅ **190 files · 2717 tests passed** |
| Playwright 전체 `--update-snapshots=all` (단독, 14.8m) | 640 passed · 1 failed = AC-4-100 overflow 목록(제목 clamp 박스 신규 — H5-8.2 #7 로 등록) |
| Playwright 전체 (단독, 최종) | ✅ **641 passed · 0 failed** (14.5m, +4 = 신규 spec) · baseline 변경 = `s4-session-complete.png` 1개뿐 |
| `ls apps/api supabase apps/mobile` | 없음 ×3 |

## H5-8.5 BACKEND_INTEGRATION_PENDING · 범위 밖 · 확인 요청

- BACKEND_INTEGRATION_PENDING 변동 없음. contract 변경 0.
- 확인 요청 ① `s2-onboarding-childinfo` · `-trial` · `v2-material` 의 결정적 sub-threshold 드리프트(H5-8.3) — 원인 조사 후 갱신 여부 결정 필요 (이번 변경 무관).
- 확인 요청 ② AC-4-99 개정 문구 반영 후 `session-regression.spec.ts` `expectColumn` 의 `height >= 796` 주석/조건 정리 (plan-agent 개정 뒤 development-agent).
