# Stage 6 Handoff

Status: **HANDOFF** · 작업 단위별로 절을 덧붙인다. **커밋하지 않았다.**

---

# `H6-1` `S6-A` — Contracts + Mock (2026-11-15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-A` 만**. 화면·컴포넌트·route·토큰(`T6-*`)·`DiamondChart`·`PersonaCard` 는 만들지 않았다 (`S6-E1` 이후).

## H6-1.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-6-plan.md` 개정 2 — `Status: APPROVED (2026-11-15, user)` (`D6-8`) ✅ |
| Design Spec | `docs/design/stage-6-design-spec.md` — `Status: APPROVED (2026-11-15, user)` ✅ (이 단위는 UI 없음) |
| 이전 Stage | Stage 5 `PASS (accepted: QA-5-003, QA-5-004)` ✅ |
| `S6-A` 차단 결정 | `N6-04`(→ `N6-39` `relationship` 제외) · `N6-05` ⓐ · `N6-08` · `N6-09` ⓐ · `N6-11` ⓐ · `N6-12` — 전부 `D6-3` / `D6-8` 권고안 ✅ |
| Backend 작업 | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-1.2 구현 — Plan §7 C-1~C-11

| # | 구현 | 파일 |
|---|---|---|
| C-1 | `childrenApi` interface — `getProfile` · `update` · `setGrowthCapability` · `getSurveyUpdate` · `saveSurveyUpdateStep` · `submitSurveyUpdate`(IK 필수). `ApiClients.children` 추가, 선택 지점 1곳 그대로 | `apps/web/src/shared/api/children-api.ts` · `types.ts` · `index.ts` · `http/HttpChildrenApi.ts` · `http/index.ts` · `mocks/index.ts` |
| C-2 | `CapabilitySnapshotSourceSchema` = `z.enum(['onboarding_survey','survey_update','session_analysis'])` + `CAPABILITY_SNAPSHOT_SOURCES` | `packages/contracts/src/children/snapshot.ts` |
| C-3 | `ChildProfileSchema.profileUpdatedAt: IsoDateTime.nullable()` (required) | `packages/contracts/src/children/profile.ts` |
| C-4 | `UpdateChildRequestSchema` = `ChildInfoAnswersSchema.partial().strict()` + 빈 요청 refine · `createUpdateChildRequestSchema(now)`(3~9세) · `UPDATE_CHILD_FIELDS` 6개 — `relationship` 없음 (`N6-39`) | `packages/contracts/src/children/update-child.ts` |
| C-5 | `PUT …/growth-capability` schema 변경 0. Mock 은 `score: null` 역량 선택 허용 (`N6-11` ⓐ) | `mocks/children/MockChildrenApi.ts` |
| C-6·C-7 | `SurveyUpdateStepSchema`(온보딩 단계 − `child_info`) · `SurveyUpdateStateSchema` · `SaveSurveyUpdateStepRequestSchema` · `CompleteSurveyUpdateAnswersSchema` · `SubmitSurveyUpdateRequestSchema` · 응답 = 기존 `ProfileResultSchema` | `packages/contracts/src/survey-update/survey-update.ts` |
| C-8 | `CapabilitySnapshotPageSchema` · `PersonaPageSchema` + fixture. **API 메서드·호출자 0** | `packages/contracts/src/children/history.ts` · `mocks/fixtures/child-profile.ts` |
| C-9 | `ActivityCard` 변경 0 (테스트로 `recommendationPhase`·`reasonKey` 부재 단정) | — |
| C-10 | error code 신규 0 (29종 — 테스트) | — |
| C-11 | `HomeSummary.characterLine` 변경 0 | — |

Entities (hook — UI 없음): `apps/web/src/entities/child-profile/` — `childProfileKeys` · `surveyUpdateKeys` · `useChildProfile` · `useUpdateChild`(중복 무시 · 성공 시 프로필 캐시 = 응답 · `meKeys` 무효화 · `invalidFields`) · `useSetGrowthCapability`(성공 시 캐시 갱신 · `homeKeys`·`activityCardKeys` 무효화 · 실패 시 캐시 불변) · `useSurveyUpdateState`(`hasDraftInProgress`) · `useSaveSurveyUpdateStep` · `useSubmitSurveyUpdate`(body 단위 IK · 성공 시 draft 캐시 제거 · 프로필·Home·카드 무효화). 저장소 기록 0 (`N6-07`).

### Mock — 서버 상태 공유 (Plan §8 "상태 저장형")

| 파일 | 역할 |
|---|---|
| `mocks/children/childProfileState.ts` | 아이 프로필 서버 상태 1벌 — 스냅샷·페르소나·**응답 버전 행**·발전 역량 선택 행(전부 `Object.freeze`) · draft. `toChildProfile` 이 강점/edge 를 contracts `selectStrengths`·`selectGrowingEdges` 로 고른다 (Mock 쪽만, AC-6-59) |
| `mocks/children/childProfileRecords.ts` | scenario key = **상태 seed**(번들당 key 1회) · 기본 레코드 · 온보딩 결과 → 레코드 · 재응답 commit |
| `mocks/children/MockChildrenApi.ts` | 6 메서드 · 공통 전달(`deliver`) · 서버 규칙(소유권 `CHILD_NOT_FOUND` · 서버 시계 나이 재검증 `details.fields` · instrument 일치 · 필수 문항 `ONBOARDING_INCOMPLETE` · 공용 IK 보관소) |
| `mocks/fixtures/child-profile.ts` | Emma 기본 응답(ER 3.5·SD 4.3·CF 2.5·IM 3.7) · 세션 분석 점수표 · 변경 페르소나 · 이름 40자 · draft seed · 목록 fixture |
| `mocks/onboarding/MockOnboardingApi.ts` (수정) | 제출 결과를 같은 상태에 넣는다 — `GET /profile` 이 제출 결과를 돌려준다 (`D6-5` · R-9). 아이 id 는 `MOCK_CHILD_ID` 로 맞춘다 |
| `mocks/me/MockMeApi.ts` (수정) | `child.firstName` = 상태의 이름 (없으면 `Emma`) — 수정·온보딩 제출 뒤 새 이름 (AC-6-22 Mock 부분) |
| `mocks/activities/MockActivityApi.ts` · `fixtures/activity-cards.ts` (수정) | `cold-to-warm` · `difficulty-lowered` — `MockSessionState`(세션·회고)로 덱 결정. warm 3문장 · 하향 1문장 (60~69자 = cold 범위) |
| `mocks/fixtures/profile-result.ts` (수정) | 페르소나 문구를 `MOCK_PERSONA_COPY` · `MOCK_FALLBACK_PERSONA_COPY` 로 export (R-9 이중 정의 금지) |
| `dev/scenario-panel/devScenarios.ts` (수정) | Panel 에 `children` 그룹 추가 (AC-6-14). `DevScreens` 링크는 R-6 (화면 단위) |

## H6-1.3 AC 매핑 (판정은 QA 가 한다)

| AC | 근거 |
|---|---|
| 03 | `packages/contracts/src/__tests__/stage-6.test.ts` "CapabilitySnapshotSource" 값 스냅샷 3값 · 그 밖 값 거부 · 기존 `profile-and-me.test.ts` fixture 갱신 후 통과. §2 enum 스냅샷 36종 불변(source 는 `children/` 소속) |
| 04 | `stage-6.test.ts` "profileUpdatedAt" — null·ISO 통과 · **키 누락 거부** · 날짜만 거부. `http-stage6.test.ts` 키 누락 응답 → `VALIDATION_FAILED` |
| 05 | `stage-6.test.ts` "UpdateChildRequest" — 필드 6개(`relationship` 없음) · 빈 요청 · trim · 40/41자 · 성 지우기 · 3.0/10.0세 경계(clock 주입) · `relationship`/`topicTags`/`id` 거부 · 언어 0/6개 |
| 06 | `stage-6.test.ts` "Survey update" — 단계 4개 · `child_info` 저장 거부 · state shape · 제출 4단계 필수 · `ProfileResult.snapshot.source='survey_update'`. `MockChildrenApi.test.ts` 제출 응답 parse |
| 07 | `stage-6.test.ts` "히스토리 목록" · `MockChildrenApi.test.ts` 목록 fixture parse + `children` 메서드 6개(목록 메서드 0) · `http-stage6.test.ts` 같은 단정 |
| 08 | `stage-6.test.ts` "변경 0 확인" — `ActivityCard` 필드 부재 · error code 29종. 타입은 `z.infer` 만 |
| 09 | `docs/API_CONTRACTS.md` **Rev 10** — 헤더 · §4 Stage 2 표 `PATCH` 행 · **§4 Stage 6 절 재작성** · §5.3 · §5.4 구현 반영 표 |
| 10 | `MockChildrenApi.test.ts` "모든 key 에서 … parse" (14 key × getProfile·getSurveyUpdate) + 메서드별 응답 parse |
| 11 | `MockChildrenApi.test.ts` "상태 저장형" — update → getProfile·`GET /v1/me` 반영 · 발전 역량 → 반영 · 재응답 제출 → `survey_update` 스냅샷 · 응답 v2 행 · **v1 불변(`Object.isFrozen` · JSON 동일)** |
| 12 | `stage6-recommendation.test.ts` — 완료 세션 2·3 → cold, 4 → warm · 같은 기록 = 같은 바이트 · 회고 `tricky_today` → 하향 · 직전 세션 기준(새 세션 완료 후 cold 복귀) |
| 13 | grep: fixture 는 `mocks/**` 에만 · `pnpm lint:boundaries` ✔ (876 modules) · Adapter 선택 지점 `app/providers/apiClients.ts` 1곳 불변 |
| 14 | §5.4 등재(Rev 10) · Scenario Panel `children` 그룹(`scenario-selection.test.ts` Catalogue 준수 단정). `/__dev/screens` 링크는 화면이 생기는 단위(R-6)에서 |
| 39~41 (Mock 부분) | warm 문장은 `reason` 만 바뀌고 카드 구조·책·역량 동일(테스트) · 하향 = 첫 장 더 쉬운 책 + 문장, 배지 필드 0 · 문장은 응답 값(조립 없음). **e2e 판정은 화면 단위 이후** |

## H6-1.4 검증 (2026-11-15)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 (1회차 `consistent-type-imports` 1건 → `update-child.ts` 수정 후 0) |
| `pnpm lint:boundaries` | ✅ no dependency violations (876 modules, 3439 dependencies) |
| `pnpm build` | ✅ (청크 크기 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ |
| `pnpm test` (build 뒤) | ✅ **195 files / 2800 tests** — 신규 **81** (contracts `stage-6` 21 · `MockChildrenApi` 32 · `stage6-recommendation` 8 · `http-stage6` 9 · `child-profile-hooks` 11). 1회차 실패 5건 = dev panel 그룹 추가로 기대값이 바뀐 기존 테스트(`scenario-selection` 4 · `ScenarioPanel` 1) → 기대값에 `children` 추가 |
| `pnpm format:check` | ✅ |
| `pnpm test:e2e` | **생략** — 화면·컴포넌트·CSS 변경 0. Mock 변화 중 화면에 닿는 것은 ① `GET /v1/me` 의 아이 이름이 **온보딩 제출·수정 뒤** 새 이름을 따른다 — e2e 중 온보딩 제출 후 이름을 그리는 화면(회고 카드)까지 가는 경로 없음(`grep firstName` 소비자 = `ReflectionCard` 1곳, 해당 e2e 는 전부 로그인 경로) ② dev Panel 그룹 1개 추가 — baseline 은 패널을 가린다(`R-BASELINE-1` ②). 기본 덱·프로필 응답은 기존과 같다. 첫 화면 단위(`S6-E1`)에서 Playwright 단독 실행 |

## H6-1.5 Mock 시나리오 전환

- URL: `?scenario=children:<key>` · 메서드 단위 `?scenario=children.update:validation-failed` · 추천: `?scenario=activity-cards:cold-to-warm` / `activity-cards:difficulty-lowered`
- dev Scenario Panel `children` 그룹
- 단일 error code 재현(예 `CONSENT_REQUIRED`)은 새 key 가 아니라 `error` + 번들 옵션 `errorCodes: { 'children.getsurveyupdate': 'CONSENT_REQUIRED' }`
- 이름 40자 = `MOCK_LONG_CHILD_FIRST_NAME` (key 아님 — `PATCH` 로 넣거나 컴포넌트 테스트)

## H6-1.6 Plan 과 다르게 한 점 (QA 확인 요청)

1. **`SurveyUpdateState.steps[{step, completed}]` 추가** — Plan C-6 은 `instrument · draftAnswers · currentStep` 3필드. 프리필된 상태와 진행 중 draft 를 구분할 신호가 없으면 Spec §2.6.1 의 *"Continue where you left off"* 분기(AC-6-26)를 표현할 수 없다. 온보딩 `OnboardingState.steps` 와 같은 모양, `completed` = 이번 draft 에서 저장된 단계.
2. **`SaveSurveyUpdateStepRequestSchema` 별도 선언** — Plan 은 "`SaveOnboardingStep` 재사용". C-7(Step 1 은 `PATCH`)에 따라 `child_info` 변형을 뺀 union 을 만들었다. 단계별 답 schema 는 온보딩 것을 그대로 import 한다(중복 선언 0).
3. **성 지우기 = `lastName: ''`** — `null` 표기를 따로 두지 않았다 (빈 입력칸 = 지우기).
4. **재응답 제출 필수 문항 빈칸 = `ONBOARDING_INCOMPLETE`** — 신규 code 0 유지(C-10). 문서 표에 명시했다.
5. **scenario key = 상태 seed** — Stage 5 `analysis` 의 표시 override 와 달리 Mock 서버 상태에 1회 넣는다. `all-scores-missing` 에서 발전 역량을 고르면 응답이 실제로 바뀌어야(AC-6-32) 하기 때문이다.
6. **`persona-changed` = `profile-updated` + 새 페르소나** — 페르소나 재생성은 세션 분석 갱신에 딸려 오므로(`P6-BIP-02`) 스냅샷도 `session_analysis` 다. 그래서 재방문 UpdateNote 가 이 key 에서도 보인다.
7. **`GET /v1/me` 아이 이름이 상태를 따른다** — 온보딩 제출 이름(예 `Yuna`)도 반영된다. Stage 2~5 Mock 은 항상 `Emma` 였다.

## H6-1.7 BACKEND_INTEGRATION_PENDING 예상 (변화 없음 — Plan §10)

`P6-BIP-01`~`12` 그대로. 이 단위에서 Mock 이 흉내만 내는 서버 규칙: 소유권(`CHILD_NOT_FOUND`) · 나이 재검증 · 응답 버전 행 불변 · 재응답 필수 문항 · IK 24h · 스냅샷 갱신(`session_analysis` 고정 점수표) · 페르소나 재생성(Mock 은 유지) · cold→warm 기준(완료 4회) · 난이도 하향(직전 세션 회고) · 동의 강제(`error`+code 로만 재현).

## H6-1.8 남은 점 (Non-blocking)

- fallback 페르소나 description 은 94자로 Spec §3.3 의 110~220자 범위 밖이다 — Stage 2 확정 문구를 재사용했기 때문(R-9). 110~220자 fixture 는 기본(121자)·변경(171자) 2개.
- `ProfileResult.child.id`(온보딩 제출 응답)는 여전히 `idFactory` 값이고 `MOCK_CHILD_ID` 와 다르다 — Stage 2 부터의 Mock 동작. `GET /profile`·`GET /v1/me` 는 `MOCK_CHILD_ID` 로 일치한다. 화면은 `me.child.id` 로 조회하므로 영향 없음.
- `cold-to-warm` 은 지난 세션 seed(완료 2개)를 포함해 센다 — e2e 로 warm 을 보려면 세션 **2회** 완료가 필요하다 (`S6-F` e2e 설계 시 참고).
- `DevScreens` 링크(R-6) · 4역량 순서 상수·라벨 매핑(`entities/child-profile`)은 `S6-E1` 범위.

---

# `H6-2` `S6-E1` — DiamondChart · ProfileCard · PersonaCard · 프로필 2모드 (2026-11-15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-E1` 만**. 발전 역량 화면(`/onboarding/growth-capability` 등록 · `GrowthCapabilityPicker`) · `RadioGroup.meta` · UpdateNote · 설정 목록 행은 만들지 않았다 (`S6-E2` · `S6-B`). **커밋하지 않았다.**

## H6-2.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-15, user)` — `D6-8` ✅ |
| 이전 단위 | `S6-A` HANDOFF (`H6-1`) ✅ |
| Backend | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-2.2 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| 토큰 Tier 3 (`T6-1`~`3` · `T6-5` 굵기 · `T6-7` · `T6-8`) | `packages/design-tokens/src/component/index.css` | `--chart-diamond-radius-max` 100 (`P-33`) · `--chart-diamond-label-max` 64 (`P-33`) · `--chart-diamond-label-gap` = `--space-1-5` · `--chart-stroke-width` 2 · `--chart-missing-dash` `3 4` (`P-32`) · `--chart-vertex-size` 10 · `--chart-selected-ring` 18 |
| 토큰 Tier 2 (`T6-4`~`6`) | `packages/design-tokens/src/semantic/color.css` (`@theme static` 블록 끝) | `--chart-area-fill` teal 30% (`P-31`) · `--chart-area-stroke` teal (`P-30`) · `--chart-grid-stroke` = `--color-border-subtle` (`P-30`). 신규 HEX 0 · 신규 Primitive 0 |
| 토큰 테스트 | `packages/design-tokens/__tests__/{token-tiers,provisional,fonts}.test.ts` | Tier 3 274 → **281** · manifest component 275 → **282** · 가값 7 → **11** 항목(토큰 44 → **50**) |
| `Surface material="bubble"` (`T6-9`) | `packages/ui/src/surface/Surface.{tsx,css}` + 테스트 | `--shadow-bubble` 매핑만 (새 값 0) |
| **`DiamondChart`** (신규 Shared UI) | `packages/ui/src/chart/DiamondChart.{tsx,css}` · `diamondGeometry.ts` · `index.ts` · `styles.css` | 도메인 비의존 inline SVG. 크기는 **CSS grid 한 곳**(가운데 트랙 `min(2·radius-max, 100% − 2·(label-max + gap))`)이 정한다 — JS 측정 0. 격자·꼭짓점·선택 링 = 백분율 좌표(px 반지름 고정), 면 = 단위 좌표 내부 svg + `non-scaling-stroke`. null 규칙 = "이웃 두 축 모두 값인 사분면만"(`N6-30`), 열린 변 외곽선 0. 숫자·눈금 링 0. 라벨 `aria-hidden`, SVG `role="img"` + `aria-label={summary}`. `selectable` = 라벨 버튼 `tabIndex −1` + `aria-hidden` · 히트 `max(100%, 44)` (`::after`, 레이아웃 변화 0) · 선택 링(null 축 = 외곽 끝점). 모션 scale 0.6→1 + opacity (`--motion-duration-slow`), 링 fade (`fast`), **reduced-motion = `animation: none`** |
| Domain | `apps/web/src/entities/child-profile/{capabilityAxes.ts, copy.ts, CapabilityDiamond.tsx, CapabilityTagList.tsx, PersonaCard.tsx, ProfileCard.tsx}` | 축 순서 상수 `CAPABILITY_AXIS_ORDER`(`N6-28`) · 라벨(#14) · tone(`CAPABILITY_TONE` 재사용 — `entities/activity-card` 에서 export 로 바꿈, 두 벌 0) · summary 조립(Spec §9.2, 응답 배열만) · ProfileCard recipe(`strong`/`surface`/`4`/`bubble`, gap 12, `break-words`) · Tag 묶음(빈 배열 문장) · 페르소나(eyebrow → h2 name → description, fallback 구분 0, 말줄임 0) |
| Feature | `apps/web/src/features/child-profile-view/{copy.ts, model/useProfileResult.ts, ui/ProfileResultView.tsx, child-profile-view.css, index.ts}` | 2모드 · Loading Skeleton(차트 자리 = 차트 높이 식) · Error/Offline(`ErrorState` + Try again, 온보딩만 *Continue to Home* `N6-37`) · 변형 C 캡션 · SR 전용 h2 *Strengths and next steps* · CTA *Next* → `/onboarding/growth-capability` (push) |
| Page · Route | `pages/onboarding/OnboardingProfilePage.tsx` · `pages/settings/{ProfilePage,ProfileTopBar}.tsx` · `app/router.tsx` · `shared/config/routes.ts` | `/onboarding/profile`(온보딩 layout 그룹, `:step` 앞) · `/settings/profile`(StackLayout + TopBar centered *Profile*) · `ROUTES.onboarding.profile` · `ROUTES.onboarding.growthCapability`(상수만) · `ROUTES.settingsProfile` |
| R-7 | `features/onboarding-survey/ui/OnboardingSaved.tsx` | `Get started` → `/onboarding/profile` **replace** (화면 픽셀 변화 0) |
| dev | `dev/DevScreens.tsx` (2행) · `dev/ui-gallery/provisionalItems.ts` (`P-30`~`33`) | Production 제외 (`assert:no-mocks` ✅) |
| 스타일 진입점 | `apps/web/src/styles/index.css` | `child-profile-view.css` 1줄 |

## H6-2.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 34 | `__tests__/profile-result.test.tsx` "`profile-updated` — 갱신 스냅샷 점수가 차트에 반영" (꼭짓점 cx/cy = 응답 점수 기하) |
| 35 | 같은 파일 "`persona-changed` — 새 name · description 응답 그대로 · New 배지 0" · baseline `s6-profile-revisit-updated` |
| 36 | **온보딩 모드 표시 0** 만 이 단위 ("업데이트 표시 0 — 온보딩 모드"). 재방문 UpdateNote 는 Plan 표상 `S6-E2` |
| 37 · 60 | "`persona-fallback` — 일반과 같은 구조 · isFallback 노출 0" · baseline `s6-profile-onboarding-fallback` |
| 38 · 58 | 단위 `diamondGeometry.test.ts`(변형 A/B/C · 대체값 0) · `DiamondChart.test.tsx`(점선 · 캡션 · 축 제거 0) · 화면 테스트 변형 C/B · e2e 320 변형 C 라벨 실측 · baseline `-partial` · `-empty` |
| 53 (구간) | `saved → /onboarding/profile` — 화면 테스트 · `onboarding-screens.test.tsx` 승계 기록(R-8 형식) · e2e "Get started → profile (replace)". `profile → growth-capability → Home` 구간은 `S6-E2` |
| 55 | `GET /profile` 단일 출처(`useProfileResult`) · 조회 실패 Error · Offline · Retry · *Continue to Home* — 화면 테스트 4건 + e2e 2건 |
| 56 | h1 firstName 만 · lastName 0 · 숫자 0 · 4축 라벨(#14) · 안내 · 강점/edge ≤2 · 페르소나 — 화면 테스트 "구성" |
| 57 | 꼭짓점 좌표 단위 테스트(1.0 = 20% · 393 → h 86.5 → 꼭짓점 −74.39) · 축 순서 고정 · 숫자 0 · summary 승인 문장(정확 일치) · reduced-motion(CSS 단정 + e2e computed `animationName`) · 금칙어 테스트. **axe 는 저장소에 없다**(도입 = 승인 사항, Stage 5 QA 와 같은 처지) — 자동 프로브로 대체 |
| 59 | 강점/edge 목록 = 응답 순서 그대로 · summary 도 응답 배열만 · 선정 함수 import 0 (`grep selectStrengths apps/web/src/{features,entities}` → 0) |
| 63 | 재방문 모드 — TopBar h1 *Profile* · 뒤로 · CTA·링크 0 · 실패 시 *Continue to Home* 0 |
| 66 | e2e 320/393/600/1024 — 다이아몬드 100/173/200/200 · 가로 넘침 0 · 라벨 ↔ 플롯 겹침 0 · CTA 스크롤 도달 · 페르소나 171자 말줄임 0 · 카드 그림자 자리(좌우 ≥ 4 · 사이 ≥ 10) · 새 overflow 0(가로 클립 조상 = 앱 셸 뷰포트, 폭 ≥ 뷰포트) · Stage 2 회귀(R-8 승계 1건) |

## H6-2.4 Spec 과 다르게 한 점 / 잠정 동작 (QA · design-agent 확인 요청)

1. **`Next` 목적지 미등록 (잠정)** — `/onboarding/growth-capability` 화면은 `S6-E2`. 지금은 `/onboarding/:step` 에 잡혀 위저드가 알 수 없는 slug 로 처리(→ `/onboarding/child-info`)한다. 화면 테스트는 **이동한 경로**를 기록으로 확인한다. `S6-E2` 가 `:step` 앞에 route 를 등록하면 해소된다.
2. **R-7 을 이 단위에서 했다** — Plan 표는 R-7 을 `S6-E2` 에 두지만 이번 지시가 E1 에 포함시켰다. 이에 따라 `onboarding-screens.test.tsx` 의 "CTA → Home" 단정 1건을 승계 기록과 함께 `/onboarding/profile` 로 바꿨다(R-8 형식). 다른 e2e 에 "Get started → Home" 단정은 없었다.
3. **UpdateNote 미구현** — Spec §2.2 의 재방문 화면 일부지만 Plan `S6-E2` 행이 소유한다. AC-36 의 재방문 표시분은 E2.
4. **차트 크기 = CSS grid, JS 측정 0** — Spec §3.1 은 "컨테이너 폭 W 에서 계산"만 말한다. 같은 식을 grid 트랙으로 옮겼고 `diamondHalfDiagonal()` 이 숫자 버전(단위 테스트 · e2e 실측 일치: 320 → 100 · 393 → 173 · ≥600 → 200).
5. **`T6-4`~`6` 을 `@theme static` 블록에 둔다** — 처음 `:root` 블록에 두었더니 Tailwind v4 가 `color-mix()` 폴리필을 **중첩 `@supports`** 로 넣으면서 뒤이은 `:root` 선언(`--space-*` · `--material-*` …)과 한 규칙으로 합쳐 CSSOM `rule.style` 밖으로 밀었다 → dev 토큰 갤러리 `v2-material` baseline 이 비어 실패(606 → 228px). `@theme` 블록 끝(`--color-fg-disabled` 와 같은 처리 자리)으로 옮겨 해소, 값·이름 변화 0. **실제 렌더 값은 두 경우 모두 정상**(computed `--chart-area-fill` = `color-mix(in srgb, #85bfb6 30%, transparent)`).
6. **미관찰 캡션 `white-space: nowrap`** — 좌우 라벨 박스가 단어 폭(≈58)으로 줄어 *Not seen yet* 이 2줄로 접혔다. Spec "라벨 아래 2번째 줄" 에 맞춰 한 줄 고정. 320 변형 C 실측: 좌우 라벨 ≤ 64 · 캡션 1줄 · 플롯과 겹침 0 (e2e).
7. **SectionLabel = `h3`** (강점/edge 묶음) — Spec §9.1 은 h2 를 SR 전용 1개로 정하고 묶음 라벨의 레벨은 말하지 않는다. 목록은 `aria-labelledby` 로 라벨에 묶었다.
8. **변형 C 캡션 정렬 = 가운데** · **차트 카드 제목 = `subheadline bold` h2** (Spec §3.4 "Bold 15") — Spec 에 정렬 언급 없음.
9. **`CAPABILITY_TONE` export** — `entities/activity-card` 의 기존 매핑을 export 로 바꾸고 타입을 `Exclude<TagTone, 'neutral'>` 로 좁혔다(값 변화 0). 차트 tone 과 배지 tone 이 한 출처다.
10. **axe 미사용** — 저장소에 없음(도입 = 승인 사항). AC-57 "axe" 는 자동 프로브(role/name · aria-hidden · tabIndex · 숫자 0)로 대체.

## H6-2.5 검증 (2026-11-15)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm lint:boundaries` | ✅ no dependency violations (895 modules, 3521 dependencies) |
| `pnpm build` | ✅ (청크 경고만 — 기존과 같다) · `assert:no-mocks` ✅ |
| `pnpm test` | ✅ **199 files / 2861 tests** (H6-1 대비 +61: ui `diamondGeometry` 20 · `DiamondChart` 14 · Surface 2 · entities `capability-axes` 9 · `profile-result` 18 · 기존 테스트 기대값 갱신 5건 — token-tiers · provisional · fonts · provisional-registry · gallery-helpers · stage4-motion-guards · onboarding-screens) |
| `pnpm format:check` | ✅ |
| Playwright (단독) | ✅ `visual` · `profile-result`(신규 21) · `scenarios` · `a11y` · `onboarding` 5 spec 한 번에 단독 실행 — **150 passed (3.7m)**, 실패·flaky 0. 신규 baseline 8장은 `--update-snapshots=missing` 1회 생성 후 재실행 통과. 기존 baseline 재생성 0 |

## H6-2.6 Mock 시나리오 · 확인 경로

- 로그인 후 `/onboarding/profile` · `/settings/profile` (`/__dev/screens` 에 2행 추가)
- `?scenario=children:<key>` — `success` · `scores-partially-missing`(변형 B) · `all-scores-missing`(변형 C) · `persona-fallback` · `profile-updated` · `persona-changed` · `loading` · `error` · `offline` · `retry`

## H6-2.7 Visual Gap 자료 (design-agent)

`e2e/__screenshots__/darwin/profile-result.spec.ts/` — 8장 (`main` 영역 클립, 393 폭 · 콘텐츠 전체가 들어가는 높이 1200, 320 은 1400):
`s6-profile-onboarding` · `-onboarding-partial` · `-onboarding-empty` · `-onboarding-fallback` · `-revisit` · `-revisit-updated` · `-error` · `-onboarding-320`. Loading 은 Mock 지연 1.5 s 라 baseline 없음(DOM 단정만, `R-BASELINE-1` ①).
- 852 높이로 찍으면 콘텐츠(≈ 900)가 앱 셸 스크롤 뷰포트에 잘려 CTA 가 반만 담긴다 → 전체 높이 뷰포트로 찍었다. 폭 기하는 393 그대로.
- 기존 baseline 재생성 0 (`s2-onboarding-saved` 포함 `visual.spec.ts` 전부 통과).
- 재측정 요청: `T6-2`(라벨 64) 실측 — 393 기본 변형 좌우 라벨 폭은 e2e 가 ≤ 64 만 단정한다.

## H6-2.8 BACKEND_INTEGRATION_PENDING

변화 없음 (`P6-BIP-*` 그대로). 이 단위는 `GET /profile` 표시만 한다.

---

# `H6-3` `S6-E2` — 발전 역량 한 컴포넌트 2모드 · UpdateNote · R-7/R-8 (2026-11-15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-E2` 만**. 설정 목록 행·설정 route(`/settings/growth-capability`)·TopBar *Growth focus* 는 만들지 않았다 (`S6-B` · `S6-D` — Spec §15 *"`S6-D` = `S6-E2` 컴포넌트 `mode="settings"` 연결만"*). `S6-E1` 시각은 건드리지 않았다(병행 Visual Gap). **커밋하지 않았다.**

## H6-3.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-15, user)` — `D6-8` ✅ |
| 이전 단위 | `S6-A`(`H6-1`) · `S6-E1`(`H6-2`) HANDOFF, Orchestrator 검증 ✅ |
| Backend | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-3.2 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| `RadioGroup.meta` (Spec §3.2) | `packages/ui/src/field/RadioGroup.{tsx,css}` + 테스트 | `RadioOption.meta?: string` — 라벨 오른쪽 끝 `caption-1`(미선택 `--color-action-secondary-fg` · 선택 `--color-selected-fg`, `D-01`), `<label>` 안이라 접근성 이름 포함(*"Cognitive Flexibility Suggested"* — 단어 경계용 `{' '}` 텍스트 노드, flex 안이라 레이아웃 0). **meta 없으면 DOM 변경 0** (단위 테스트로 `label.childNodes` 2개 단정 · `visual.spec.ts` 설문 baseline 전부 통과). 새 토큰 0 |
| 데이터 훅 이동 | `entities/child-profile/useCurrentChildProfile.ts` (신규) · `features/child-profile-view/model/useProfileResult.ts` (re-export 로 축소) | 프로필·발전 역량 두 feature 가 함께 쓰므로 entities 로 내림(feature 간 import 금지). 동작·공개 이름 변경 0 |
| **`GrowthCapabilityPicker`** (Feature, 2모드) | `features/growth-capability/{copy.ts, ui/GrowthCapabilityPicker.tsx, growth-capability.css, index.ts}` | Spec §2.3 구조 그대로: (온보딩) h1 → 제안 문구 → 차트 카드(`CapabilityDiamond mode="selectable"`) → RadioGroup(`legendVisuallyHidden`, 4옵션 = 축 순서 `N6-28`, meta = 원래 옵션에만) → 선택 설명 `aria-live="polite"` → *You can change this anytime in Settings.* → CTA. 축 탭과 목록이 **같은 state**. 제안 없음 → 미선택 시작 + CTA `aria-disabled` + 사유 *Choose one to continue.* (`aria-describedby`). null 축 선택 가능. 저장 중 = `Button loading` + 차트·목록 disabled. 실패 = 선택 보존 + CTA 위 `InlineAlert tone="error"`(오프라인 = §10.2 전용 문구), 다시 누르면 재시도, 다른 역량을 고르면 안내 해제. Loading = 제목 text 2 · 차트 자리 · 행 44 ×4. 조회 실패 = `ErrorState` + Try again (+ 온보딩만 *Continue to Home* `N6-37`). **설정 모드**: 본문 제목 0 · 안내 = 무제안 문구(`D6-8` 보충) · meta *Current* · 변경 없으면 CTA `aria-disabled`(사유 문장 없음 — Spec 은 "선택 없음일 때만") · 저장 → Toast *Saved* → `navigate(-1)` |
| Page · Route (R-10) | `pages/onboarding/{OnboardingGrowthPage, OnboardingGrowthTopBar}.tsx` · `app/router.tsx` · `shared/config/routes.ts` | `/onboarding/growth-capability` = `StackLayout` + TopBar centered **제목 없음** + 뒤로 → `/onboarding/profile` (`replace`, `N6-24` ⓐ). 정적 경로라 `:step` 보다 우선 → **H6-2.4 ① 해소** |
| **UpdateNote** (FR-15, Spec §2.2) | `features/child-profile-view/{ui/ProfileResultView.tsx, copy.ts}` | 재방문 모드에서만 · `profileUpdatedAt` non-null 이고 `latestSnapshot.source` 가 `session_analysis`/`survey_update` 일 때 카드 위 한 줄(`Icon rotate-ccw sm` 장식 + `Text footnote primary`). 날짜 = `formatMonthDay(updatedAt, 기기 now)`. live 아님. 온보딩 모드·`empty`·`success` 표시 0 |
| R-7 | — | `S6-E1` 에서 이미 완료 (H6-2.4 ②) — 다시 하지 않음 |
| R-8 | `__tests__/profile-result.test.tsx` · `__tests__/growth-capability.test.tsx` · `e2e/growth-capability.spec.ts` | Stage 2 *"Get Started → Home"* 단정은 E1 에서 `onboarding-screens.test.tsx` 1건 승계 완료. 이번에 **전체 체인** `saved → profile → growth → Home(replace)` 을 Trial 가입 전환 경로(FR-24, `completeOnboardingToSaved`)로 e2e 추가 |
| dev | `dev/DevScreens.tsx` | `/onboarding/growth-capability` 행 추가 · 프로필 행 note 갱신 · **스테일 "아직 없는 화면" 2항목(프로필·발전 역량) 제거** |
| 스타일 진입점 | `styles/index.css` | `growth-capability.css` 1줄 |

새 `overflow` 선언 0 · 새 토큰 0 · 새 HEX/arbitrary 0 · 콘솔 로그 0.

## H6-3.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 36 (재방문분) | `profile-result.test.tsx` UpdateNote `profile-updated`(session) · `survey-update-submitted`(survey) 문구·날짜·장식 아이콘·live 아님·첫 카드 위 / `empty`·`success` 표시 0 / 온보딩 표시 0(기존). baseline `s6-profile-revisit-updated` 재생성(아래 H6-3.5) |
| 53 | 단위 "프로필 Next → 발전 역량 화면" · "확정 → PUT → Home(replace)" · e2e Trial 경로 전체 체인 + 뒤로 가도 growth/saved 로 안 감 |
| 54 | Guard 코드 변경 0 · e2e "두 화면 건너뛰고 Home → 재강제 없음" · 기존 `resolveGuardDecision` 테스트 통과 |
| 55 (발전 역량분) | 단위 조회 실패 h1 + Try again + *Continue to Home* → Home · 설정 모드는 Continue 0 |
| 61 | 단위: 제시값 미리 선택 + *Suggested* 접근성 이름 · 축 탭 = 목록 같은 state · *Suggested* 원래 옵션 유지 · 차트 선택 표시(라벨 `--selected` + 링) · 제안 없음 미선택 + 사유 연결 · null 축 선택. e2e: 축 버튼 히트 ≥ 44×44 · 키보드(Back → 라디오 1 tab stop → 화살표 선택 → CTA, 차트 버튼 포커스 0) |
| 62 | 단위: PUT payload = 선택값 · 응답으로 캐시 갱신 · 실패(`retry`) 안내 + 선택 보존 → 재시도 성공 · 오프라인 전용 문구. e2e 같은 흐름. `all-scores-missing` UI 확인 (`persona-fallback` 은 E1) |
| 64 (+30·31·32 컴포넌트분) | 설정 모드 컴포넌트 테스트 5건(제목 0 · 무제안 문구 · *Current* · Save 비활성/활성/되돌리면 비활성 · 저장 → Toast → 뒤로 · 실패 시 이전 값 유지). **route·TopBar e2e 는 `S6-D`** |
| 65 | 단위 · e2e: 뒤로 → `/onboarding/profile` |
| 47 · 66 (발전 역량분) | e2e 320/393/600/1024: 다이아몬드 100/173/200/200 · 가로 넘침 0 · 카드 좌우 ≥ 4 · 차트 카드 ↔ 목록 ≥ 10 · 화면 내 새 클립 조상 0 · CTA 스크롤 도달 |
| 33 · 42 | `growth-capability.test.tsx` copy 전수 금칙어 0 · 숫자 0 |

## H6-3.4 검증 (2026-11-15)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm lint:boundaries` | ✅ no dependency violations (902 modules, 3557 dependencies) |
| `pnpm build` | ✅ (청크 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ |
| `pnpm test` | ✅ **200 files / 2887 tests** (H6-2 대비 +1 file / +26: `growth-capability` 20 · `profile-result` +4 (UpdateNote 2+2) · `RadioGroup` +2) |
| `pnpm format:check` | ✅ |
| Playwright (단독) | ✅ `growth-capability`(신규 15) — 신규 baseline 4장 `--update-snapshots=missing` 생성 후 재실행 통과 · `profile-result` · `visual` · `onboarding` · `a11y` · `scenarios` 단독 1회: **149 passed / 1 failed**(= `s6-profile-revisit-updated`, 예상된 변화 — H6-3.5) → 그 1장만 `--update-snapshots=all -g` 재생성 → `profile-result` + `growth-capability` 재실행 **35 passed** |

## H6-3.5 baseline (`R-BASELINE-1`)

- **신규 4장** `e2e/__screenshots__/darwin/growth-capability.spec.ts/`: `s6-growth-onboarding` · `-changed`(Emotion Regulation 선택 — *Suggested* 는 CF 에 남음) · `-empty`(제안 없음 · 사유 · CTA 비활성) · `-save-failed`. 393×1200 · `main` 클립 · dev 패널 숨김 · settle. 눈으로 확인함.
- **재생성 1장** `profile-result.spec.ts/s6-profile-revisit-updated` — 원인 분해: 88,375 px(23%) 차이 = ① 상단 y 24–59 에 UpdateNote 한 줄 신설 ② 그 아래 전체가 **정확히 38 px 아래로 이동**(노트 18 + gap 20). 38 px 시프트 후 잔차 **61 px**, 전부 노트 글자 줄(y 38–40). 설명 안 되는 클러스터 0 → 재생성. 다른 E1 baseline 7장·`visual.spec.ts` 전부 **재생성 0** (통과).

## H6-3.6 Spec 과 다르게 한 점 / 판단 (QA · design-agent 확인 요청)

1. **설정 route 미등록** — Spec §15 이 route 연결을 `S6-D` 에 배정. 설정 모드는 컴포넌트 테스트로만 검증했고 baseline 도 `S6-D` 에서 만든다.
2. **UpdateNote 날짜에 연도가 붙는다** — Spec 문구는 *"Updated {Mon D}"* 이지만 지정 함수 `formatMonthDay` 는 기기 연도와 다르면 연도를 붙인다. Mock 시계(`MOCK_EPOCH_MS` 2026-01-01) − 1일 = 2025-12-31 이라 화면은 *"Updated Dec 31, 2025 from your recent storytimes"*. 실서버에서는 대부분 *"Nov 14"* 형태. baseline 은 기기 연도 ≠ 2025 인 동안 안정. 연도 생략을 원하면 결정 필요.
3. **UpdateNote 아이콘 위치 = 앞** (Spec 은 "Text + Icon" 나열만) · 간격 `gap-2`(8) — Spec 미지정.
4. **CTA 비활성 = `aria-disabled`** (native `disabled` 아님) — Spec §2.3.2 "`aria-describedby` 로 연결" 이 성립하려면 포커스가 남아야 한다(`Button` 문서의 blocked 패턴). 설정 모드 "변경 없음" 비활성도 같은 방식.
5. **저장 실패 InlineAlert 는 오프라인도 `tone="error"`** — Spec §2.3.1 문구 그대로("`InlineAlert tone="error"` (오프라인 = … 전용 문구)"). 아이콘이 `wifi-off` 가 아니라 `octagon-alert` 다. 바꾸려면 Spec 정정.
6. **실패 후 다른 역량을 고르면 안내를 지운다** — Spec 은 "다시 누르면 재시도"만 말한다. 선택은 보존된다.
7. **제안값 그대로 확정해도 `PUT` 1건** — Spec "확정 → PUT → Home". Mock 은 선택 행을 `caregiver_changed` 로 남긴다(서버가 확정/변경을 구분하는 규칙은 Handoff 대상, `P6-BIP` 기존 범위).
8. **선택 설명 live region 은 항상 존재**(제안 없음일 때 빈 div) — 처음 선택할 때도 낭독되게. 그 결과 `-empty` 에서 목록 ↔ 변경 안내 사이가 8px 더 넓다.
9. **onboarding 뒤로 = `replace` 로 프로필** (`navigate(-1)` 아님) — 새로고침 진입에도 프로필로 가고 history 가 쌓이지 않는다.
10. **차트 Skeleton CSS 를 feature 별로 둔다** — 프로필(`child-profile-view.css`)과 같은 식을 `growth-capability.css` 에 복제(feature 간 import 금지). 공용화하려면 `entities/child-profile` 로 내리는 리팩터 필요 — E1 Visual Gap 결과와 함께 판단 권고.
11. **`COMPONENT_MAP.md` 미갱신** — `RadioGroup` 행 `meta` prop · `ProfileResultView / GrowthCapabilityPicker` 행(2모드·`DiamondChart` 이름)은 plan/design 소유 문서라 손대지 않았다. 갱신 요청.

## H6-3.7 Mock 시나리오 · 확인 경로

- 로그인 후 `/onboarding/growth-capability` (`/__dev/screens` 행 추가) · 프로필 `Next` 로도 진입
- `?scenario=children:all-scores-missing`(제안 없음) · `children:scores-partially-missing`(null 축) · `children:loading` · `children:error` · `children:offline` · 저장만 실패 = `children.setgrowthcapability:error` / `:offline` / `:retry`
- UpdateNote: `/settings/profile?scenario=children:profile-updated` · `persona-changed` · `survey-update-submitted`

## H6-3.8 BACKEND_INTEGRATION_PENDING

변화 없음 (`P6-BIP-*` 그대로). 이 단위의 서버 의존은 `PUT …/growth-capability` 저장·확정 기록(`growth_capability_selections` 경로 구분)뿐이며 이미 Plan §6 · §10 에 있다.

---

# `H6-4` `S6-B` — 설정 목록 · 아이 정보 수정 + Visual Gap FIX `VG6-E1-15` · `VG6-E2-04` · `VG6-E2-13` (2026-11-16, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-B` 만** (+ Orchestrator 지시 VG FIX 3건). `S6-C`(재응답 화면) · `S6-D`(설정 발전 역량 route)는 시작하지 않았다. **커밋하지 않았다.**

## H6-4.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-15, user)` — `D6-8` ✅ |
| 이전 단위 | `S6-A` · `S6-E1` · `S6-E2` HANDOFF, Orchestrator 검증 ✅ |
| 차단 결정 | `C13-S6-1`·`C13-S6-2` 명세(`D6-2`) · `N6-14` ⓐ(`D6-3`) · `N6-38`·`N6-39`·`N6-40`·`N6-41`(`D6-8`) ✅ |
| Backend | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-4.2 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| 설정 목록 (`C13-S6-1`, Spec §2.4) | `features/settings/{copy.ts, ui/SettingsMenu.tsx, model/menuRows.ts, settings.css}` | 2그룹: SectionLabel *YOUR CHILD* + `ListGroup "Your child"` 4행(Profile · Child info · Update survey answers · Growth focus, chevron 16 `--color-fg-tertiary` `P-24`) · *ACCOUNT* + `ListGroup "Account"` 로그아웃 1행(동작 변경 0, chevron 없음). 행 구성 = route config(`menuRows.ts`). subtitle 없음 → 데이터 조회 0 |
| route 상수 | `shared/config/routes.ts` | `settingsChild` · `settingsChildSurvey`(상수만 — 화면 `S6-C`) · `settingsGrowthCapability`(상수만 — 화면 `S6-D`) |
| `R-11` 입력 묶음 추출 | `entities/child/{ChildInfoFields.tsx, child.css, index.ts}` · `features/onboarding-survey/ui/ChildInfoStep.tsx` · `onboarding.css` · `shared/copy/child-copy.ts` · `features/onboarding-survey/copy.ts` | `ChildIdentityFields`(이름·성·생년+나이 Tag·성별) · `ChildHomeFields`(언어 Chip·독서 루틴) — 제어형, Fragment 반환(DOM·순서 불변). `.haru-choice-group*` 3규칙을 `entities/child/child.css` 로 이동(값 변화 0). 독서 루틴 문구를 `childCopy.readingRoutineOptions` 로 이동, 온보딩 copy 는 참조(값 변화 0) |
| 아이 정보 수정 (`C13-S6-2`, Spec §2.5) | `features/child-profile-edit/{copy.ts, index.ts, model/childInfoEdit.ts, model/useLeaveGuard.ts, model/backRequest.ts, ui/ChildInfoEditForm.tsx}` | 처음부터 편집 모드 · `relationship` 없음(`N6-39`) · 프리필 = `GET /profile` `child` · body = 바뀐 필드만(trim · 성 지우기 `''` · 언어는 집합 비교) · 변경 없음 → Save `aria-disabled` · 중복 탭 → 1건(`useUpdateChild`) · 성공 → Toast *Saved* → 뒤로 · 클라이언트 검증(이름·생년) · 서버 `VALIDATION_FAILED` → 필드 문구 · 첫 오류 필드 포커스 · `error`/`offline` → Save 위 InlineAlert(§10.4 문구) · 입력은 메모리만 · Loading Skeleton · 조회 실패 `ErrorState` + *Try again* |
| 이탈 확인 (`N6-14` ⓐ) | `model/useLeaveGuard.ts` · `model/backRequest.ts` · `pages/settings/ChildInfoEditTopBar.tsx` | TopBar 뒤로 + **브라우저 back** → `ConfirmDialog` destructive (*Discard changes?* / *Your edits to {firstName}'s info won't be saved.* / *Discard* / *Keep editing*). 설명 H6-4.6 ① |
| 캐시 전파 (AC-6-22) | `entities/child-profile/useUpdateChild.ts` (S6-A, 변경 0) | 성공 시 프로필 캐시 = 응답 · `meKeys.all` 무효화 → 회고 카드 제목이 새 이름 |
| Page · Route | `pages/settings/{ChildInfoEditPage, ChildInfoEditTopBar}.tsx` · `index.ts` · `app/router.tsx` | `/settings/child` = `StackLayout` + TopBar centered *Child info* (h1) |
| dev | `dev/DevScreens.tsx` | `/settings` 행 note 갱신 · `/settings/child` 행 추가 · 프로필 행 note 갱신 |
| 스타일 진입점 | `styles/index.css` | `entities/child/child.css` · `features/settings/settings.css` 2줄 |
| **`VG6-E2-04`** | `packages/ui/src/field/RadioGroup.css` | 선택 hover 복원 규칙을 `.option--selected:hover:not(.option--disabled)` (0,3,0)으로 올리고 일반 hover 규칙 **뒤에** 둠. `list` 변형은 이 수정으로 teal 이 칠해지지 않도록 `.radio-group--list .option--selected:hover:not(…)` → 기존과 같은 tinted 유지(동작 변화 0). 새 값·토큰 0 |

새 `overflow` 선언 0 · 새 토큰 0 · 새 HEX/arbitrary 0 · 콘솔 로그 0.

## H6-4.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 15 | `__tests__/child-info-edit.test.tsx` 2그룹 행 순서 · chevron 4/0 · 명세 밖 행 0(listitem 5) · e2e `settings-child.spec.ts` 행 텍스트 단정 |
| 16 | 단위 `it.each` 4행 → route · e2e Profile/Child info 왕복 + 로그아웃 Dialog · Stage 2 `e2e/home.spec.ts` 로그아웃 3건 통과(`Account` 목록 1행 단정 유지) |
| 17 | **N/A** — 목록이 데이터에 의존하지 않음(Spec §2.4) · 단위 "목록 진입 시 `/v1/children/*` 요청 0" |
| 18 | 단위 프리필(이름·생년·언어·독서 루틴) · 관계/ABOUT YOU 없음 · 편집 전환 버튼 없음 · baseline `s6-settings-child` |
| 19 | 단위 "body = `{firstName:'Mia', languageEnvironment:['english','spanish']}` · 2회 클릭 → 1건" · 순수 함수(성 지우기·언어 순서·관계 미포함) · e2e `dblclick` → 요청 로그 1건 |
| 20 | 단위 client(이름 비움 → 요청 0 · 포커스) · `validation-failed`(필드 문구 · `aria-invalid` · 입력 보존 · 포커스) · e2e 같은 흐름 |
| 21 | 단위 `error`(InlineAlert · 입력 보존 · local/sessionStorage 에 이름 0) · `offline` · `retry`(2번째 성공) · e2e `offline` + `history.state` 포함 저장소 검사 · `retry` |
| 22 | 단위 프로필 캐시 = 응답 · `me` 무효화 · `me.get()` 새 이름 · e2e **설정 → Home → 세션 → 완료 화면 회고 카드 *How was storytime with Mia?*** (Home 화면에는 이름을 그리는 화면 소유 문구가 없다 — `characterLine` 은 서버 값) |
| 23 | 단위 TopBar 뒤로(변경 없음 → 바로 · 변경 → Dialog · 초기 포커스 취소 · Keep editing 입력 보존 · Discard → 요청 0) · e2e 브라우저 back(Dialog 중 URL 유지 · Keep → 다시 back → Discard → `/settings` · 재진입 서버 값) · 되돌린 뒤 back = 확인 없음 · TopBar Discard 후 history 1칸(sentinel 잔류 0) |
| 66 (S6-B 화면) | e2e 320/393/600/1024 가로 넘침 0 · 앱 셸 넘침 0 · 화면 내 새 클립 조상 0 · Save 스크롤 도달 |

## H6-4.4 Visual Gap FIX 결과

| ID | 결과 |
|---|---|
| **`VG6-E1-15`** (프로필 조회 실패 `ErrorState`) | **클립 선 없음 → inset 불필요.** `e2e/shadow.spec.ts` 393·600 프로브: ① 가로 클리핑 조상 = 앱 셸 뷰포트 1개, 폭 = 뷰포트(393/600) ② 좌·우 6px 차 38/38 ③ 아래 16px 차 44 · 위 6px 차 13 ④ **600 컬럼 바깥 3px(카드에서 27px) 차 6** — 그림자가 앱 컬럼 경계를 넘어 그려진다. 393 에서는 번짐이 화면 가장자리(x=0)에서 끝나 클립 선이 보이지 않는다(`R-SHADOW-1` ④). **대조 테스트**: 앱 컬럼에 `overflow-x: clip` 을 주입하면 같은 지점 차 < 3 → 프로브가 문다 |
| **`VG6-E2-13`** (발전 역량 조회 실패 `ErrorState`) | 같은 결과 — 좌·우 37/37 · 아래 44~45 · 위 13 · 600 컬럼 바깥 6. inset 불필요 |
| (S6-B 신규) 아이 정보 조회 실패 `ErrorState` | 같은 결과 — 37/37 · 44~45 · 13 · 6 |
| (S6-B 신규) 설정 `ListGroup` (`--shadow-bubble`) | 클리핑 조상 = 뷰포트 폭 · 좌/우 2px 차 7/7~8 · 아래 4px 차 21 |
| **`VG6-E2-04`** (선택 행 + hover) | **수정.** e2e `growth-capability.spec.ts` "선택 행 + hover": 기대값 = 토큰 `--color-selected-bg` 렌더 값 · 선택 행 hover 후 400ms 뒤 = `rgb(133,191,182)` · 미선택 행 hover 는 여전히 바뀐다. **수정 전 규칙으로 되돌려 실행하면 실패**(받은 값 `rgb(219,238,231)` = `#dbeee7`, VG 실측과 동일) → 복원. 설문 RadioGroup baseline(`visual.spec.ts` 설문·독서 루틴·Stage 4 시트)은 **변화 0** — 선택 행 위에 포인터를 둔 채 찍은 baseline 이 그것들에는 없다 |

## H6-4.5 baseline (`R-BASELINE-1`)

| 파일 | 종류 | 원인 분해 |
|---|---|---|
| `growth-capability.spec.ts/s6-growth-onboarding-changed.png` | **재생성** (`=all -g`) | 14,620 px 차이 = **연결성분 1개** `(0,438)-(344,481)` = Emotion Regulation 선택 행(44 높이) 전체. 표본 3점 old `(219,238,231)` (hover 색 `--color-surface-tinted`) → new `(133,191,182)` (`--color-selected-bg`). 설명 안 되는 클러스터 0 → `VG6-E2-04` 의 의도된 변화 |
| `visual.spec.ts/s3-dialog-scrim.png` | **재생성** (`=all -g`) | 75,331 px, 클러스터 8개 — 전부 Dialog **바깥**: ① `(24,64)-(368,317)` 73,945 = 새 *YOUR CHILD* 라벨 + 4행 그룹(이전 로그아웃 1행 자리) ② `(24,357)-(36,409)` · `(357,358)-(368,408)` = 아래로 옮겨진 `Account` 그룹 카드 좌·우 가장자리(Dialog 옆으로 보이는 부분) ③ `(24,334)-(83,343)` 3개 = *ACCOUNT* 라벨 글자 ④ `(41,379)-(92,391)` 2개 = 옮겨진 *Log out* 글자. Dialog 본문 안 클러스터 0 → `C13-S6-1` 목록 재구성의 의도된 변화 |
| `settings-child.spec.ts/s6-settings.png` · `s6-settings-child.png` · `s6-settings-child-save-failed.png` | **신규** (`=missing` 후 재실행 통과) | 393×1300 · `main` 클립 · dev 패널 숨김 · settle · save-failed 는 포인터를 치운 뒤. 눈으로 확인함 |

그 밖의 baseline 재생성 0 — 온보딩 `s2-onboarding-childinfo*` 4장(R-11 이동 대상)은 **그대로 통과**.

## H6-4.6 Spec 과 다르게 한 점 / 판단 (QA · design-agent 확인 요청)

1. **브라우저 back 확인 = history sentinel** — 앱은 `BrowserRouter`(선언형)라 `useBlocker`(data router 전용)를 쓸 수 없고 data router 전환은 Architecture 변경이다. 변경이 생긴 순간 현재 history 항목을 **`window.history.pushState` 로 1번 복제**(RR 의 `history.state` 그대로 — 입력값 0)하고 그 popstate 를 잡는다. React Router `navigate` 로 깔지 않은 이유: `RouteErrorBoundary` 가 `key={location.key}` 라 RR 이동이 화면을 **재마운트**해 입력 중 포커스·상태가 사라진다. sentinel 이 있으면 나갈 때 `navigate(-2)`. `MemoryRouter`(단위 테스트)에서는 꺼진다(`window.location` 이 라우터와 다름) — 브라우저 back 은 e2e 가 검증. 새로고침·탭 닫기(`beforeunload`)는 Spec 에 없어 넣지 않았다.
2. **TopBar ↔ 폼 연결 = 모듈 단위 등록 지점**(`model/backRequest.ts`) — TopBar 는 layout 슬롯이라 폼 상태를 모른다. 폼이 마운트 동안 `requestBack` 을 등록, 없으면(Loading·Error) 그냥 뒤로.
3. **필드 오류 문구** — Spec §2.5 는 "해당 필드 error 문구" 만 정하고 문구가 없다. 생년월 = 기존 `childCopy.ageOutOfRange`, 그 외 = 새 1문장 *"Please check this and try again."* (금칙어 0). 오류 슬롯이 없는 언어 필드만 거부되면 Save 위 저장 실패 InlineAlert 로 알린다. **문구 확정 필요**.
4. **독서 루틴 = `RadioGroup variant="list"`** — Spec §2.5 트리는 `variant="card"` 라고 적었지만 같은 절의 "Step 1 과 동일 컴포넌트"(AC-6-18) · §0.3 "이미 `ChildInfoStep` 이 구현한 recipe 그대로" · R-11(같은 컴포넌트 추출)에 따라 온보딩과 같은 `list` 를 유지했다. Spec 트리 정정 요청.
5. **Loading Skeleton = 3줄 × 2** — Spec §3.6 "text lines=6" 이지만 `Skeleton.lines` 상한이 5다. Shared UI 를 바꾸지 않고 섹션 2개 × 3줄로 그렸다.
6. **설정 목록의 *Update survey answers* · *Growth focus* 행은 지금 Not Found 로 간다** — Spec §2.4 는 5행 전부를 `S6-B` 에 두고(AC-6-15), 화면 등록은 `S6-C` · `S6-D` 다. 행을 빼면 명세의 행 구성이 깨지므로 넣었다. `S6-C`/`S6-D` 완료 전 Stage QA 에서 이 두 행은 미완으로 추적.
7. **입력 변경 시 실패 안내를 지운다** — 발전 역량 화면(H6-3.6 ⑥)과 같은 규칙. 입력은 그대로다.
8. **나이 Tag 가 폭 전체로 늘어난다** (`s6-settings-child`) — 온보딩 Step 1 편집 모드와 **같은 마크업**(flex column 안 Tag)이며 R-11 은 이동만 했다. 온보딩에도 같은 모양(생년이 채워진 편집 모드). 시각 판단은 design-agent Visual Gap 에 맡긴다.
9. **`COMPONENT_MAP.md` 미갱신** — `ChildInfoFields`(entities/child) · `ChildInfoEditForm` · `SettingsMenu` 행 구성은 plan/design 소유 문서라 손대지 않았다. 갱신 요청.
10. **`R-8` 형식 승계** — `__tests__/home-settings.test.tsx` 의 Stage 2 단정 *"목록 항목이 로그아웃 1행뿐"* · *"child profile 행 없음"* 을 *"`Account` 그룹은 로그아웃 1행"* 으로 바꾸고 승계 주석을 남겼다(`C13-S6-1` 의 의도된 변경).

## H6-4.7 검증 (2026-11-16)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 (1회차 e2e `Node.remove` 타입 오류 1건 → `Element` 캐스트) |
| `pnpm lint` | ✅ exit 0 (1회차 `react-hooks/set-state-in-effect` 1건 → 포커스 트리거를 파생값으로 변경) |
| `pnpm lint:boundaries` | ✅ no dependency violations (914 modules, 3609 dependencies) |
| `pnpm build` | ✅ · `pnpm assert:no-mocks` ✅ |
| `pnpm test` | ✅ **201 files / 2907 tests** (H6-3 대비 +1 file / +20: `child-info-edit` 21 · `home-settings` 1건 대체 −1) |
| `pnpm format:check` | ✅ |
| Playwright (단독) | 1차: `visual` · `onboarding` · `growth-capability` · `profile-result` · `home` · `a11y` · `scenarios` · `shadow` · `toast` · `responsive` · `settings-child` · `auth` 한 번에 — **302 passed / 3 failed** = 예상된 baseline 2(`-changed` · `s3-dialog-scrim`, H6-4.5) + 신규 hover 테스트 1(기준값을 전환 중에 읽은 테스트 결함 → 토큰 렌더 값으로 교체). 2장 분해 후 `=all -g` 재생성 → 재실행 통과. 2차(수정·format 후): `growth-capability` · `settings-child` · `shadow` · `visual` · `onboarding` 단독 — **215 passed (6.3m)**, 실패·flaky 0 |

## H6-4.8 Mock 시나리오 · 확인 경로

- 로그인 → Home 설정 아이콘 → `/settings` → *Child info* (`/__dev/screens` 에 `/settings/child` 행)
- 저장만 실패: `?scenario=children.update:validation-failed` · `children.update:error` · `children.update:offline` · `children.update:retry`
- 초기값: `children:loading` · `children:error` · `children:offline`

## H6-4.9 BACKEND_INTEGRATION_PENDING

변화 없음 (`P6-BIP-*` 그대로). `PATCH /v1/children/:childId` 의 서버 규칙(소유권 · 서버 시계 나이 재검증 · `relationship` 거부)은 `S6-A`(H6-1.7)에 이미 있다.

---

# `H6-5` `S6-C` — 설문 재응답 (진입 · 카드 · 이탈 복귀 · 제출) + `R-5` 이동 (2026-11-16, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-C` 만**. `S6-D`(설정 발전 역량 route)는 시작하지 않았다. **커밋하지 않았다** (`git mv` 로 생긴 rename staging 은 `git restore --staged` 로 되돌림 — index 는 이전 단위와 같은 상태).

## H6-5.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-15, user)` — `D6-8` ✅ |
| 이전 단위 | `S6-A` · `S6-E1` · `S6-E2` · `S6-B` HANDOFF, Orchestrator 검증 ✅ |
| 차단 결정 | `C13-S6-3` 명세(`D6-2`) · `N6-06` ⓐ · `N6-07` ⓐ · `N6-10` ⓐ(`D6-3`) · `N6-48`(`D6-8`) ✅ |
| Backend | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-5.2 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| **`R-5` 이동** (`N6-06` ⓐ) | `entities/survey/{instrumentView.ts, surveyAnswers.ts, deckSession.tsx, ui/SurveyCardDeck.tsx, ui/ChoiceQuestionCard.tsx, ui/FavoriteBooksCard.tsx, ui/CapabilityItemCard.tsx}` ← `features/onboarding-survey/{model,ui}` | 카드 렌더러 · instrument 해석 · 카드 세션을 **이동만**. 바뀐 것은 import 경로와 이름 3개(`OnboardingSession*` → `SurveyDeckSession*`) 뿐 — `features/onboarding-survey/index.ts` 가 **옛 이름으로 다시 노출**(`OnboardingSessionProvider` · `useOnboardingSession` · `OnboardingSession`)해 router · 테스트 소비자 변경 0 |
| 카드 문구 이동 | `entities/survey/copy.ts` (`surveyCardCopy`) · `features/onboarding-survey/copy.ts` | `steps` · `books` · 덱 문구 · `requiredBlockedReason` · `questions` · `choiceOptions` · *About N minutes* 를 옮기고 `onboardingCopy` 는 **참조**(값 한 글자도 불변, 두 벌 0 — `copy-language.test.ts` 그대로 통과) |
| 카드 CSS 이동 | `entities/survey/survey.css` ← `onboarding.css` | `.haru-survey-options*` · `.haru-survey-caption` · `.haru-wizard-body*` · `.haru-survey-deck*` 규칙을 선택자·값 그대로 이동. `styles/index.css` 에서 `onboarding.css` **바로 앞**에 import(그 사이 파일과 겹치는 선택자 0 → cascade 동일). `rework-css-guards.test.ts` 의 읽는 경로 2곳만 새 위치로 |
| 소개 골격 공용화 (Spec §2.6.1 "R-5 후 공용 컴포넌트") | `entities/survey/ui/SurveyIntroLayout.tsx` · `features/onboarding-survey/ui/OnboardingIntro.tsx` | `OnboardingIntro` 마크업을 그대로 옮긴 표현 컴포넌트(medallion · Surface · InfoRow 2 · `children` 슬롯 · CTA). 온보딩은 Draft·Trial 안내 2 블록을 슬롯으로 넘긴다 — **DOM 변경 0** (`s2-onboarding-start` · `s2-onboarding-intro` 재생성 없이 통과) |
| route 상수 | `shared/config/routes.ts` | `settingsChildSurveyStep: '/settings/child/survey/:step'` (`N6-48`) · `settingsChildSurveyStepPath(slug)`. slug 는 온보딩 배열 재사용 |
| 진입 `C13-S6-3` (Spec §2.6.1) | `features/survey-update/ui/SurveyUpdateIntro.tsx` · `pages/settings/{SurveyUpdatePage, SurveyUpdateTopBar}.tsx` | TopBar centered 제목 없음 + Back(`navigate(-1)`) · h1 *Update your answers* · 본문 · *About N minutes*(N = 서버 instrument `estimates.surveyMinutes`) · *Your earlier answers are filled in* · CTA *Start* / *Continue where you left off*(`steps[].completed` 하나라도 true → `currentStep`). Trial·DraftDiscard 안내 **없음**. Loading = CTA `loading` · 조회 실패/오프라인 = `ErrorState` + *Try again* |
| 카드 (Spec §2.6.2) | `features/survey-update/ui/SurveyUpdateWizard.tsx` · `pages/settings/SurveyUpdateStepPage.tsx` | 온보딩 카드 단계와 같은 구성 — TopBar(단계 제목 · 이전/다음 chevron) · ProgressBar(단계 구간) · `SurveyCardDeck` · 마지막 카드에만 CTA *Save answers* + *N questions left.* · 첫 카드 뒤로 = 진입. Step **2~5** 만(C-7). 재응답 단계가 아닌 slug(`child-info` 포함) → 진입으로 redirect. Loading = TopBar + 카드 자리 `Skeleton shape="card"` · 조회 실패 = `ErrorState` |
| 컨트롤러 | `features/survey-update/model/{useSurveyUpdateData.ts, useSurveyUpdateWizard.ts, steps.ts, submitRequest.ts, surveyUpdateSession.tsx}` | 답 출처 = 흐름 메모리 > 서버 draft(프리필) · 단계 이동 시 `PUT …/steps/:step` 1회(떠나는 단계, 실패해도 이동 · 시각 변화 0) · 제출 payload 순수 함수(필수 문항 = instrument 판정, 선택 문항 빈 배열, 역량 문항 전부) · 제출 → Toast *Your answers are saved* → `/settings/profile` **replace** · 실패/오프라인 = 마지막 카드 CTA 위 `InlineAlert tone="error"`(§10.3 문구 2벌) |
| 흐름 세션 | `surveyUpdateSession.tsx` · `app/router.tsx` | 진입·카드 두 layout route 의 **위**에 `SurveyUpdateSessionProvider`(+ `SurveyDeckSessionProvider`) — 고친 답(메모리)과 덱 세션이 단계 전환 재마운트를 넘어 산다. 흐름을 벗어나면 사라짐. **기기 저장 0** (`N6-07`) |
| 캐시 (AC-6-27) | `entities/child-profile/useSubmitSurveyUpdate.ts` (S6-A, 1곳 수정) | 무효화 규칙은 S6-A 그대로(draft 캐시 제거 · 프로필 · Home · 오늘 카드). **수정**: 중복 방지 플래그를 `onSettled` → `onError` 에서만 해제 — H6-5.6 ① |
| dev | `dev/DevScreens.tsx` | `/settings/child/survey` 행 추가 · 설정 행 note 갱신 |

새 `overflow` 선언 0 · 새 토큰 0 · 새 HEX/arbitrary 0 · 콘솔 로그 0 · 새 Shared UI 0.

## H6-5.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 24 | 단위 `survey-update.test.tsx` "프리필 — 서버 draft 답 선택 · 카운터 분모 = 재응답 카드 수(instrument 파생) · 진행바 · 단계 제목" · "구성 — 출처 = `GET …/survey-update`" · e2e `settings-survey.spec.ts` "설정 행 → 진입 → Start → 첫 카드" · baseline `s6-survey-card`(`1 / 16`, 온보딩 인증 구간과 같은 분모) |
| 25 | 단위 "단계 마지막 카드에서 다음 → PUT 1건(떠나는 단계)" · "첫 카드 뒤로 → 진입 · 저장" · e2e "단계 안 이동 = PUT 0 · 경계 = `['reading_together']`" |
| 26 | 단위 "`survey-update-draft` → *Continue where you left off* → `currentStep`" · "단계 저장 실패해도 메모리 답 유지 · 이동 막지 않음 · alert 0 · 저장소 0" · e2e "답 바꿈 → 단계 경계 → 브라우저 back(=설정) → 재진입 *Continue* → 바꾼 답 선택됨 · 저장소·`history.state` 에 값 0" |
| 27 | 단위 "*Save answers* 2회 → POST 1건 → Toast → `/settings/profile` · UpdateNote *…from your latest answers*" · e2e 같은 흐름 `dblclick` → POST 1건 · 제출 뒤 `GET …/profile` 재조회(요청 로그 순서) · 프로필 뒤로 = 설정(replace) · 훅 단위 "성공 뒤 호출 무시" + 기존 "Home·프로필 무효화" |
| 28 | 단위 `children.submitsurveyupdate:retry`(안내 → 재시도 → 성공, payload 동일 = 같은 IK 규칙 · 키 동일은 S6-A 훅 테스트) · `:offline`(오프라인 문구 · 화면 유지) · e2e 같은 2건 · baseline `s6-survey-save-failed` |
| 29 | Playwright 단독 — `onboarding` · `visual`(s2 온보딩 start/intro/deck 전부) 포함 **308 passed, baseline 재생성 0**. 단위 201→202 files 전부 통과(온보딩 테스트 이동 후 그대로) |
| 66 (S6-C 화면) | e2e 320/393/600/1024 — 진입·카드 가로 넘침 0 · 클립 조상 = 뷰포트 폭 이상 · 마지막 CTA 스크롤 도달 |
| `R-SHADOW-1` | `e2e/shadow.spec.ts` `ERROR_STATE_SCREENS` 에 진입·카드 조회 실패 2행 추가 → 393·600 양축 프로브(구조 · 좌우 6px · 아래 16px · 위 6px · 600 컬럼 바깥 3px) 통과. `InlineAlert` 는 그림자 없음(CSS grep 0) → 프로브 대상 아님. 카드·진입 카드는 온보딩과 같은 recipe·같은 뷰포트(새 overflow 0) |

## H6-5.4 검증 (2026-11-16)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 (1회차 테스트 미사용 상수 1건 → 단정 추가) |
| `pnpm lint:boundaries` | ✅ no dependency violations (929 modules, 3669 dependencies) — 1회차 계획에서 entities 테스트가 feature 를 import 하게 되어 `instrumentView`/`surveyAnswers` 테스트는 **feature 에 남기고** entity 를 import 하게 함 |
| `pnpm build` | ✅ (청크 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ |
| `pnpm test` | ✅ **202 files / 2928 tests** (H6-4 대비 +1 file / +21: `survey-update` 20 · `child-profile-hooks` +1). R-5 이동 직후(신규 테스트 전) 201 / 2907 그대로 통과 확인 |
| `pnpm format:check` | ✅ |
| Playwright (단독) | `settings-survey`(신규 16) — 신규 baseline 5장 `--update-snapshots=missing` 생성 → 1건 실패(더블 탭 POST 2건, H6-5.6 ①) 수정 후 재실행 **16 passed**. 그다음 `visual` · `onboarding` · `shadow` · `settings-child` · `settings-survey` · `a11y` · `scenarios` · `growth-capability` · `profile-result` · `responsive` · `home` 한 번에 단독 — **308 passed (7.5m)**, 실패·flaky 0 |

## H6-5.5 baseline (`R-BASELINE-1`)

- **신규 5장** `e2e/__screenshots__/darwin/settings-survey.spec.ts/`: `s6-survey-intro` · `-intro-resume` · `-card`(첫 카드, 프리필 선택) · `-error`(진입 조회 실패) · `-save-failed`(393×1300, 마지막 카드 + InlineAlert, 포인터 치운 뒤). `main` 클립 · dev 패널 숨김 · settle. 눈으로 확인함.
- **재생성 0** — `R-5` 이동 대상인 온보딩 baseline(`s2-onboarding-start` · `s2-onboarding-intro` · `s2-deck-*` 등 `visual.spec.ts` 전부)이 그대로 통과 → 분해할 diff 없음.

## H6-5.6 Spec 과 다르게 한 점 / 판단 (QA · design-agent 확인 요청)

1. **`useSubmitSurveyUpdate` 중복 방지 강화** — e2e `dblclick` 에서 POST 2건(같은 키라 Mock 은 재생). 첫 응답이 끝나고 화면이 옮겨지기 전에 두 번째 탭이 들어왔다. 플래그를 **실패 뒤에만** 해제하도록 바꿨다(성공 = 흐름 끝). 수정 전 규칙으로는 새 훅 단위 테스트가 실패한다.
2. **흐름 안 이동은 전부 `replace`** — 진입 ↔ 카드 · 단계 ↔ 단계. 흐름이 history 에 1칸만 남아 진입 뒤로 · 제출 후 프로필 뒤로 · 카드에서 브라우저 back 이 모두 설정 목록이다(제출된 카드로 돌아가지 않음). 온보딩 위저드는 push 다 — TopBar 동작(첫 카드 뒤로 = 진입)은 같다.
3. **위저드 chrome 은 공유하지 않고 같은 마크업으로 새로 썼다** — R-5 는 "카드 렌더러 · instrument 해석" 이동이고 온보딩 위저드는 Step 1 폼까지 한 컴포넌트라, chrome 을 쪼개면 온보딩 동작을 건드린다(R-5 "이동만" 위반). 카드·덱·진행바·TopBar 컴포넌트는 같은 것이다.
4. **이탈 복귀 단위 = 단계** — 서버가 `currentStep` 만 저장하므로 "마지막 카드부터"는 그 단계의 첫 카드다. Mock 의 `currentStep` = 마지막으로 **저장된(떠난) 단계**라, 단계 1 을 저장하고 단계 2 에서 나가면 복귀는 단계 1 이다(답은 보존). 다음 단계로 열기를 원하면 contract 에 이동 대상 단계를 실을지 결정 필요.
5. **브라우저 back · 탭 닫기는 현재 단계를 저장하지 않는다** — 저장은 TopBar/카드 이동으로 단계를 넘길 때(`D-11` 재사용)뿐이라, 단계 안에서 고친 답은 그 경우 사라진다(이미 저장된 단계는 보존). Spec 은 이탈 시 저장을 정하지 않았다.
6. **진입 Loading 중 시계 행 미렌더** — 분 수가 서버 instrument 에 있어 응답 전에는 그릴 값이 없다. Spec 은 "CTA loading" 만 정한다.
7. **카드 화면 Loading/조회 실패에도 TopBar(단계 제목 + 뒤로 → 진입)를 둔다** — Spec 은 카드 자리 Skeleton · ErrorState 만 말한다. 진행바는 카드 수를 모르므로 없다.
8. **`entities/survey` 신설** — Spec §3.7 은 "카드 렌더러 = R-5 이동분" 위치를 정하지 않았다. `COMPONENT_MAP.md` 는 plan/design 소유라 손대지 않았다 — 갱신 요청(`SurveyCardDeck` 등 4종 · `SurveyIntroLayout` · `SurveyUpdateFlow` → 실제 이름 `SurveyUpdateIntro`/`SurveyUpdateWizard`).

## H6-5.7 NEEDS_DECISION (문구)

Spec §10.3 에 없어 **기존 승인 문구를 재사용**한 곳 — 새 문구는 만들지 않았다.

| 위치 | 재사용 문구 | 출처 | 비고 |
|---|---|---|---|
| 덱 접근성 이름 | *Onboarding questions* | Stage 2 `deckLabel` (덱 컴포넌트 공용) | 설정 흐름에서 "Onboarding" — 바꾸려면 덱에 라벨 prop 필요 |
| 진행바 접근성 이름 | *Onboarding progress* | Stage 2 `progressLabel` | 같은 문제 |
| 진입 TopBar 뒤로 | *Back* | 설정 하위 화면 공용 | — |
| 카드 첫 카드 뒤로 | *Go back* | 온보딩 위저드 | Spec "온보딩 TopBar 그대로" |
| Loading 이름 | *Loading* | 설정 하위 화면 공용 | — |

## H6-5.8 Mock 시나리오 · 확인 경로

- 로그인 → Home 설정 → *Update survey answers* (`/__dev/screens` 에 `/settings/child/survey` 행)
- 이어서: `?scenario=children:survey-update-draft` · 진입/카드 조회: `children:loading` · `children:error` · `children:offline` · 진입만: `children.getsurveyupdate:error`
- 단계 저장만 실패: `children.savesurveyupdatestep:error` · 제출만: `children.submitsurveyupdate:error` / `:offline` / `:retry`

## H6-5.9 BACKEND_INTEGRATION_PENDING

변화 없음 (`P6-BIP-*` 그대로 — 재응답 draft 정본 · 응답 버전 행 · 필수 문항 재검증 `ONBOARDING_INCOMPLETE` · IK 24h · 스냅샷 `survey_update` 산출은 H6-1.7 에 있다). 추가 후보 1건: H6-5.6 ④ 복귀 단계 규칙(`currentStep` = 저장한 단계 vs 다음 단계)을 서버 요구로 명시할지.

---

# `H6-6` `S6-D` — 발전 역량 설정 모드 route + Visual Gap FIX `VG6-B-09` (2026-11-17, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-D` 만** (+ Orchestrator 지시 `VG6-B-09`). `S6-F` 는 시작하지 않았다. `VG6-B-06`/`07`(독서 루틴·언어 칩 표현)은 사용자 결정 대기라 **건드리지 않았다**. **커밋하지 않았다.**

## H6-6.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-15, user)` — `D6-8` ✅ |
| 이전 단위 | `S6-A` · `S6-E1` · `S6-E2` · `S6-B` · `S6-C` HANDOFF, Orchestrator 검증 ✅ |
| 차단 결정 | `C13-S6-4` 명세(`D6-2`) · `N6-02` ⓐ · `N6-11` ⓐ(`D6-3`) · `D6-6` · `N6-36`·`N6-45`·`N6-46` + `D6-8` 보충(설정 모드 무제안 문장) ✅ |
| Backend | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-6.2 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| Page · TopBar | `pages/settings/{GrowthCapabilityPage, GrowthCapabilityTopBar}.tsx` · `index.ts` | Page = `GrowthCapabilityPicker mode="settings"` 조립만 (Spec §15 *"S6-E2 컴포넌트 mode=settings 연결만"*). TopBar centered *Growth focus* (= h1) · leading Back `navigate(-1)` — `ProfileTopBar` 와 같은 규격, 이탈 확인 없음(`N6-46`) |
| Route | `app/router.tsx` | `/settings/growth-capability` = `StackLayout topBar={<GrowthCapabilityTopBar />}` + `RouteGuard`. route 표 주석 1행 추가 · `S6-D` 미등록 주석 2곳 정리. 설정 목록 *Growth focus* 행이 더는 Not Found 로 가지 않는다(`VG6-B-04` 해소 — *Update survey answers* 는 `S6-C` 에서 이미 해소) |
| 저장 · 캐시 · 뒤로 | (기존) `GrowthCapabilityPicker` · `entities/child-profile/useSetGrowthCapability.ts` | 컴포넌트 변경 0. 저장 성공 → 프로필 캐시 = 응답(`setQueryData`) · Home·오늘 카드 무효화 → Toast *Saved* → `navigate(-1)`. **훅 1곳 수정** — H6-6.5 ① |
| `VG6-B-09` 나이 Tag | `entities/child/ChildInfoFields.tsx` | Tag 를 `<div className="flex">` 로 감쌌다. 부모(온보딩 `section` · 수정 화면 `section`)가 flex column(`align-items: stretch`)이라 Tag 가 컬럼 폭으로 늘어났다 → 행 방향 flex 래퍼 안에서 내용 폭 pill. 새 값·토큰·arbitrary 0, `packages/ui` 변경 0. block 래퍼가 아니라 flex 라 line box 여분 높이 0 (baseline 분해로 확인 — 아래 행 이동 0). 크기는 Step 1 구현값 `sm` 유지(Spec "xs" 는 오기 — VG 판정) |
| 주석 정리 | `shared/config/routes.ts` · `features/growth-capability/{index.ts, copy.ts, ui/GrowthCapabilityPicker.tsx}` | "`S6-D` 가 연결한다" 류 미래형 → 현재형. 값 변화 0 |
| dev | `dev/DevScreens.tsx` | `/settings/growth-capability` 행 추가 · `/settings` · 온보딩 발전 역량 행 note 갱신 |

새 `overflow` 선언 0 · 새 토큰 0 · 새 HEX/arbitrary 0 · 새 copy 0(전부 Spec §10.2 기존 `growthCapabilityCopy`) · 콘솔 로그 0 · 새 Shared UI 0.

## H6-6.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 16 (*Growth focus* · *Profile* 행) | 단위 `settings-growth.test.tsx` "설정 행 → route · `data-mode=settings` · h1 = *Growth focus* 1개 · Back" · "*Profile* 행 → `/settings/profile` · `data-mode=revisit` · h1 = *Profile* · `Next` 없음 · 뒤로 → 설정" · 기존 `child-info-edit.test.tsx` `it.each` 4행 → route · e2e `settings-growth.spec.ts` 진입 · 뒤로 · 브라우저 back · `settings-child.spec.ts` Profile 왕복 |
| 30 · 64 | 단위·e2e: TopBar h1 · 무제안 문장 *Choose the one you'd like to explore together first.* · *We've suggested…* 0 · 현재값 radio 이름 *"Cognitive Flexibility Current"* checked · *Suggested* 0 · *You can change this anytime…* 0 · Save `aria-disabled`(변경 없음) + force click → PUT 0 · 이탈 확인 0 (단위 "바꾼 뒤 뒤로 → alertdialog 0" · e2e 같은 흐름 + PUT 0) |
| 31 | 단위 "Save 2회 → PUT 1건 `{capability}` → Toast → 설정 · 프로필 캐시 = 응답 · `homeKeys`·`activityCardKeys` probe 쿼리 `isInvalidated` · 재진입 새 값 *Current*" · "offline → 안내 · 선택 보존 · 화면 유지 · 캐시 불변" · 훅 단위 "성공 뒤 호출 무시 · 실패 뒤 재시도 가능" · e2e `dblclick` → PUT 1건 → `/settings` · *Saved* · 재진입 *Emotion Regulation Current* · `error`(문구 2줄 · 선택 보존 · 재진입 이전 값) · `offline` · `retry` |
| 32 | 단위·e2e `all-scores-missing`: radio 전부 미선택 · *Current* 0 · Save `aria-disabled` + 접근성 설명 *Choose one to continue.* · null 축 Self-Direction 선택 → 저장 PUT `self_directed_agency` |
| 33 | copy 변경 0 — 기존 `growth-capability.test.tsx` 금칙어·숫자 테스트 그대로 통과 |
| 47 · 66 (S6-D 화면) | e2e 320/393/600/1024 — 가로 넘침 0 · 차트 카드 좌우 ≥ 4 · 카드 아래 → RadioGroup 간격 ≥ 10(`--shadow-bubble` 아래 번짐) · 화면 안 클립 조상 0 · 남은 클립 조상 폭 ≥ 뷰포트 · Save 스크롤 도달 |
| 상태 | Loading(단위·e2e Skeleton `status "Loading"` → ready) · 조회 Error(e2e h2 + *Try again* · *Continue to Home* 0) · 조회 Offline(단위 `networkErrorCopy` h2 + *Try again* · e2e) · 저장 실패 3종(위 31) |
| `R-SHADOW-1` | `e2e/shadow.spec.ts` ① `ERROR_STATE_SCREENS` 에 `/settings/growth-capability` 조회 실패 1행 → 393·600 구조·좌우 6px·아래 16px·위 6px·600 컬럼 바깥 3px 통과 ② 신규 describe "발전 역량 설정 모드 차트 카드 그림자" 393·600 — 클립 조상 폭 ≥ 뷰포트 · 좌우 2px · 아래 4px 차 ≥ `MIN_SHADOW_DELTA/4`(설정 ListGroup 프로브와 같은 기준) 통과. InlineAlert 는 그림자 없음 |
| 63 | 위 16 의 *Profile* 행 단위 + e2e (재방문 모드 · CTA 없음 · 뒤로) |

## H6-6.4 `VG6-B-09` 결과 · baseline (`R-BASELINE-1`)

| 파일 | 종류 | 원인 분해 |
|---|---|---|
| `settings-child.spec.ts/s6-settings-child.png` | **재생성** (`=all -g "s6-settings-child"`) | 7,182 px(채널 차 > 5) = **연결성분 1개** `(58,227)-(344,252)` = 나이 Tag 행의 오른쪽 부분. 표본 y=238: x=30 old/new 동일 `(172,210,225)`(pill 안 · 라벨 앞) · x=100/200/330 old `(160,204,221)`(= `--color-capability-flexibility-bg` Tag 채움) → new `(214,231,225)`(배경). 행 높이(227~252)·아래 요소 위치 변화 0 → 래퍼가 높이를 더하지 않았다. 설명 안 되는 클러스터 0 → `VG6-B-09` 의 의도된 변화. 확대 크롭으로 *5yr 7mo* pill 이 내용 폭임을 눈으로 확인 |
| `settings-child.spec.ts/s6-settings-child-save-failed.png` | **재생성** (같은 명령) | 같은 클러스터 1개 · 같은 표본 — 원인 동일 |
| `settings-growth.spec.ts/s6-growth-settings{,-changed,-empty,-save-failed}.png` | **신규 4장** (`=missing` 후 재실행 통과) | 393×1200 · `main` 클립 · dev 패널 숨김 · settle · changed/save-failed 는 포인터 치운 뒤. 4장 나란히 눈으로 확인(Save 비활성 · *Current* 원래 옵션에 남음 · 사유 caption · InlineAlert) |

- 온보딩 Step 1 편집 모드: 해당 상태 baseline 없음(VG 예상과 같다) — `s2-onboarding-childinfo*` 4장 **재생성 없이 통과**(아래 Playwright 묶음). 회귀 방지는 새 e2e `settings-child.spec.ts` "나이 Tag = 내용 폭 (VG6-B-09)" 2건: 설정 아이 정보 · 온보딩 Step 1(생년 선택 후) — Tag 폭 ≈ 라벨 폭 + 좌우 padding(computed, 리터럴 0) · < section 폭/2 · 왼쪽 = section 왼쪽. 수정 전 마크업에서는 폭 = section 폭이라 실패한다.
- 그 밖의 baseline 재생성 0.

## H6-6.5 Spec 과 다르게 한 점 / 판단 (QA · design-agent 확인 요청)

1. **`useSetGrowthCapability` 중복 방지 강화** — 새 e2e `dblclick` 에서 첫 PUT 성공 직후·화면 이동 전에 두 번째 탭이 들어와 **PUT 2건 + `navigate(-1)` 2회 → Home 까지 밀려났다**. H6-5.6 ① 과 같은 결함이라 같은 규칙으로 고쳤다: 진행 플래그를 `onSettled` → **`onError` 에서만** 해제(성공 = 두 모드 모두 화면을 떠난다). 훅 단위 테스트 1건 추가 — **수정 전 규칙으로 되돌리면 실패**함을 확인 후 복원. 온보딩 모드도 같은 훅이라 함께 강화된다(재시도 경로는 실패 뒤라 영향 0 — `growth-capability.spec.ts` "저장 실패 → 재시도 → Home" 통과).
2. **딥 링크로 들어온 뒤 Save / Back** — Spec §2.3 대로 `navigate(-1)` 이다. 앱 안 history 가 없으면(새 탭에 URL 직접) 앱 밖으로 나간다. Mock 인증이 새로고침에서 지워져 지금은 재현 경로가 없고, Spec 이 정한 동작이라 바꾸지 않았다 — 추적만.
3. **`VG6-B-09` 래퍼 = DOM 노드 1개 추가** — Tag 에 className prop 을 여는 Shared UI 변경 대신 feature 쪽 정렬 래퍼를 택했다. 온보딩 편집 모드에도 같은 DOM 변화가 들어간다(결함 수정 — VG 판정 "온보딩 편집 모드에도 같은 수정은 결함 수정").

## H6-6.6 검증 (2026-11-17)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 (e2e tsconfig 포함) |
| `pnpm lint` | ✅ exit 0 |
| `pnpm lint:boundaries` | ✅ no dependency violations (933 modules, 3699 dependencies) |
| `pnpm build` | ✅ (청크 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ |
| `pnpm test` | ✅ **203 files / 2938 tests** (H6-5 대비 +1 file / +10: `settings-growth` 9 · `child-profile-hooks` +1) |
| `pnpm format:check` | ✅ |
| Playwright (단독) | 1차 `settings-child` · `settings-growth`(`=missing`) — 36건 중 실패 7 = 신규 baseline 4(작성) + 예상 `VG6-B-09` 2 + **더블 탭 결함 1**(H6-6.5 ①). 결함 수정 · 2장 분해 후 `=all -g` 재생성. 2차: `settings-child` · `settings-growth` · `growth-capability` · `shadow` · `visual` · `onboarding` · `profile-result` · `settings-survey` · `home` · `a11y` · `scenarios` · `responsive` 한 번에 단독 — **333 passed (8.1m)**, 실패·flaky 0 |

## H6-6.7 Mock 시나리오 · 확인 경로

- 로그인 → Home 설정 → *Growth focus* (`/__dev/screens` 에 `/settings/growth-capability` 행)
- 현재값 없음: `?scenario=children:all-scores-missing` · 조회: `children:loading` · `children:error` · `children:offline`
- 저장만 실패: `children.setgrowthcapability:error` / `:offline` / `:retry`

## H6-6.8 NEEDS_DECISION

없음 — 화면 문구는 전부 Spec §10.2 승인 문구(`growthCapabilityCopy` 기존 값)다. 새 문구를 만들지 않았다.

## H6-6.9 BACKEND_INTEGRATION_PENDING

변화 없음 (`P6-BIP-*` 그대로 — `PUT …/growth-capability` 서버 규칙 · 다음 카드 반영 시점 `P6-BIP-04`·`10` 은 H6-1.7 에 있다).

---

# `H6-7` `S6-F` — 횡단 검증 · `QA-5-005` · 최종 인계 (2026-11-17, development-agent)

Status: **HANDOFF** · 작업 단위 **`S6-F` 만** — Stage 6 마지막 단위. 사용자 결정 대기 항목(`VG6-E1-03`/`12`/`14` · `VG6-E2-06`/`09`/`19`/`20` · `VG6-B-06`/`07`/`11` · `VG6-C-09`/`10`)은 **건드리지 않았다**. 제품 코드 변경 = dev 화면 목록 1곳뿐. **커밋하지 않았다.**

## H6-7.1 Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-11-15, user)` — `D6-8` ✅ |
| 이전 단위 | `S6-A` · `S6-E1` · `S6-E2` · `S6-B` · `S6-C` · `S6-D` HANDOFF, Orchestrator 검증(6 checks · 203 files / 2,938) ✅ |
| 차단 결정 | 없음 (`S6-F` 선행 결정 `—`) · `QA-5-005` = `N6-19` ⓐ (`D6-3`) ✅ |
| Backend | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H6-7.2 변경

| 영역 | 파일 | 내용 |
|---|---|---|
| **`QA-5-005`** | `e2e/session-regression.spec.ts` (`expectColumn`) | `if (height >= 796)` + 거짓 주석 → 상수 `NO_VERTICAL_SCROLL_MIN_HEIGHT = 852` + 개정 AC-4-99 ④(`D5-15`) 문구 주석: *"320/393/600/1024 × 852 에서 세로 넘침 0 · 852 미만은 스크롤 허용 (320×796 은 넘친다 — Stage 5 Spec §13.2)"*. 현재 측정 크기(852 ×4 · 1024×768)에서 단정 결과 **동일**(1024×768 은 전과 같이 세로 미단정) — 판정 변화 0, 다음 크기 추가 시 오판만 막는다 |
| dev 화면 목록 (R-6) | `apps/web/src/dev/DevScreens.tsx` | 시나리오 그룹 표에 `activity-cards`(Stage 6 `cold-to-warm` · `difficulty-lowered`) · `children`(Stage 6 key 8종) 2행 추가. route 목록은 이미 Stage 6 7개 전부 있음(가드 테스트로 고정). Production 제외(`assert:no-mocks` ✅) · baseline 대상 아님 |
| 신규 단위 테스트 | `apps/web/__tests__/stage6-copy.test.tsx` (18) | AC-6-42: Stage 6 copy 모듈 6종(`settingsCopy.groups/rows` · `childInfoEditCopy` · `surveyUpdateCopy` · `childProfileViewCopy` · `childProfileCopy` · `growthCapabilityCopy`) + 화면에 그대로 나가는 Mock 값(페르소나 3벌 · warm/하향 `reason` 4 · 4역량 라벨)을 **Plan 금칙어 목록**(AC-5-44 + `weak` · `lowest` · `below`)으로, 새 copy 모듈은 **Spec §10.5 목록**(단어 경계 · `!` · 이모지)으로도. `measure` = 부정문 1회만 · 비교 표현(`than` · `percentile` · `typical` …) 0 · copy 안 아이 이름 상수 0 |
| | `apps/web/__tests__/stage6-privacy.test.tsx` (6) | AC-6-44: 아이 정보 저장 성공(mutation) + 프로필 조회(query) → 로그아웃 → `child-profile` · `survey-update` key 0 · 저장소에 이름·`child-profile`·`survey-update` 0 / 재응답 진입(`survey-update-draft`) → 로그아웃 → key 0 · 저장소 `survey`/`draft` 0. AC-6-43: Mock Adapter parse 거부(이름 41자 · 재응답 빈 body) · 화면 저장 실패(`children.update:error`/`offline`) → 콘솔 5종(log/info/warn/error/debug)에 이름·페르소나 0, 입력 보존·저장소 0 |
| | `apps/web/__tests__/stage6-boundaries.test.ts` (4) | AC-6-48 · 14 · 13: Stage 6 route 7개가 `/__dev/screens` 에 있음 · 시나리오 그룹 2행 · Stage 6 Page 12개 import 에 `shared/api` · `mocks` · Adapter · react-query · `fetch(` 0 · `survey-update` ↔ `onboarding-survey` import 0 · Stage 6 feature/entity 8 디렉토리 → `mocks/` · 다른 feature import 0 |
| 신규 e2e | `e2e/stage6-cross-cutting.spec.ts` (17) | Stage 6 route 8개(`/onboarding/profile` · `/onboarding/growth-capability` · `/settings` · `/settings/profile` · `/settings/child` · `/settings/child/survey` · `…/survey/reading-together` · `/settings/growth-capability`)에 **같은 규칙**: ① copy 렌더 DOM(innerText + aria-label/placeholder/title/alt) 금칙어 0 — 시나리오 6종 + 조회 실패·오프라인·저장 실패 ② privacy 콘솔·pageerror·`framenavigated` URL 에 수정 이름(프로브)·`Emma`·페르소나 0 — `children.update:retry`(새 이름이 프로필 summary 까지 퍼진 뒤) · 재응답 제출 실패 · 발전 역량 오프라인 ③ 역할·이름 = `ariaSnapshot` 의 이름 없는 인터랙티브 역할 0 · h1 1개 · 라디오 그룹 이름 ④ Tab 순회 — 모든 정지점 포커스 링(요소 · 부모 · 조부모 `:focus-within` · label) · 이름 · `aria-hidden` 정지 0 ⑤ 44 hit-test(5점) ⑥ `reducedMotion: 'reduce'` — CSS animation 0 · 움직임 transition 0 ⑦ 반응형 320×568 / 393×852 / 600×852 / 1024×768 — 컬럼 `min(W,480)` 가운데 · 문서/뷰포트 가로 넘침 0 · 컬럼 밖 요소 0 · 마지막 본문 버튼 스크롤 도달. baseline 0 장 |

새 Production 컴포넌트·copy·토큰·`overflow` 0. 새 HEX/arbitrary 0. 콘솔 로그 0.

## H6-7.3 감사 결과 (grep · 프로브)

| 항목 | 방법 | 결과 |
|---|---|---|
| copy 위치 (AC-6-42) | `rg` JSX 텍스트 노드 · `label=/aria-label=/title=/placeholder=/description=/alt=/legend="…"` 리터럴 · 문장형 문자열 리터럴 — Stage 6 feature 5 · entity 3 · Page 13 파일 | **0** (주석 2줄만) — 문구는 전부 copy 모듈 |
| 페르소나·버블·`reason` 출처 | 기존 AC-6-35 · 41 · 59 테스트 + `stage6-copy` | 응답 값 그대로 · Frontend 조립 0 |
| 콘솔 사용 | `rg console\.|devWarn|reportError` Stage 6 feature·entity·`mocks/children`·children API·`packages/ui/src/chart` | **0** |
| 제3자 SDK (AC-6-45) | `apps/web/package.json` dependencies = contracts · design-tokens · ui · react-query · react · react-dom · react-router · zod (변경 0) · 번들 grep `googletagmanager/gtag(/sentry/segment/mixpanel/amplitude/hotjar/facebook.net` | **0** (`doubleclick` 정규식 일치 1 = React `onDoubleClick` — 오탐) |
| Secret (AC-6-45) | 번들 grep `service_role` · `sk-…` · `SUPABASE_` · `OPENAI` · `api_key` · `secret` → 0 파일. `VITE_` 문자열 = `VITE_API_BASE_URL is not a valid absolute URL.` 오류 문구 1건 · `.env*` 파일 0 · `assert:no-mocks` ✅ | **0** |
| feature 간 import (AC-6-48) | `lint:boundaries` ✔ (936 modules) + `stage6-boundaries` | **0** |
| Out of Scope (AC-6-02) | 목록 API(`capability-snapshots` · `personas`) 호출자 = Mock fixture 만 · 설정 행에 알림·데이터 관리·탈퇴 0 | **0** |
| `apps/api` · `supabase` · `apps/mobile` (AC-6-01) | `ls` | 부재 ×3 |

## H6-7.4 접근성 프로브 — 발견 사항 (결함 아님 · 기록)

`stage6-cross-cutting.spec.ts` 터치 테스트가 annotation 으로 남긴다. 실측(393×852):

1. **TopBar IconButton(y=1) 북쪽 점** — `::before` 44(inset −3) 가 있으나 위쪽 3px 은 **뷰포트 밖**(y = −2)이라 잴 수 없다 → 뷰포트 밖 점은 건너뛴다. Stage 1 `a11y.spec.ts` 의 `data-hit="44x44"` 와 같은 구조.
2. **TextField(이름 · 성) — 수용 예외 `S1-G-2`** — 행 `.haru-text-field__row` 높이 **44**, 그 안 label+input(`__main`) 36 · input 21. 행 패딩 4px 는 클릭해도 포커스가 가지 않는다. Stage 1 `S1-G-2`(TextField 행) 수용 범위로 분류, 행 ≥ 42 를 함께 단정.
3. **언어 칩 줄 사이 히트 겹침** (`/settings/child`, Stage 2 `ChildHomeFields` 그대로 — R-11 이동만) — 칩 시각 31 · `::before` 44(±6.5) · 줄 간격 8 → 위·아래 줄 히트가 **5px 겹치고** 아랫줄(DOM 뒤)이 이긴다. 윗줄 5개(*English* · *Spanish* · *Chinese* · *Korean* · *Vietnamese*)의 남쪽 점이 아랫줄 칩에 닿는다. 실효 높이 ≈ 41.5. Stage 5 회고 칩과 같은 구조이며 그쪽은 **`D5-6`(중간선 분할)** 으로 고쳤다. 온보딩 Step 1 에도 똑같이 있고 Stage 6 이 만든 것이 아니라 **고치지 않았다** → **NEEDS_DECISION** (H6-7.8 ①). 테스트는 겹침이 이 묶음에만 있음을 단정한다.
4. **reduced-motion 중 실행 중 transition** — 진입 직후 CTA `box-shadow`(포커스 링) · RadioGroup 행 `background-color` 180ms 색 전환이 잡혔다. **움직임이 아니다** → 테스트는 위치·크기·변형 transition 과 CSS animation 만 금지한다(둘 다 0).
5. 포커스 링 — TextField 는 링을 **조부모 행**(`:focus-within` outline 2px)이 그린다. 8개 화면 Tab 순회에서 링 없음·이름 없음·`aria-hidden` 정지 **0**.

## H6-7.5 AC 42~50 근거 (판정은 QA)

| AC | 근거 |
|---|---|
| 42 | `stage6-copy.test.tsx` 18 · e2e copy 7(시나리오 6 + 실패/오프라인 상태) · 기존 `growth-capability`/`profile-result`/`capability-axes`/`MockChildrenApi`/`stage6-recommendation` 금칙어 테스트 · JSX 리터럴 grep 0 (H6-7.3) |
| 43 | `stage6-privacy.test.tsx` 콘솔 4 (parse 실패 2 · 저장 실패 2) · e2e privacy 2 (콘솔 · pageerror · URL) |
| 44 | `stage6-privacy.test.tsx` 로그아웃 2 · 기존 `child-info-edit`(입력 중 저장소 0) · `settings-survey.spec.ts`(저장소·`history.state` 0) |
| 45 | 의존성 · 번들 grep (H6-7.3) · `assert:no-mocks` ✅ |
| 46 | e2e 이름/역할 1 · Tab 순회 1 · 44 hit-test 1 · reduced-motion 1 + 기존 화면별(차트 reduced-motion · 발전 역량 키보드 · 축 히트 44). **axe 미사용**(저장소에 없음, 도입 = 승인 사항) — 자동 프로브 대체. 대비: 신규 가값 `P-30`~`P-33`(S6-E1 등재) 외 **신규 0** — Spec §9.3 배경 위 본문 4.14 ⚠️ 는 VG 재측정 대상(design-agent) |
| 47 | e2e 반응형 4 (뷰포트 × 8 route) + 화면별 spec 의 기하·그림자 프로브(`shadow.spec.ts` `R-SHADOW-1` 양축). 새 `overflow` 0 |
| 48 | `pnpm lint:boundaries` ✔ · `stage6-boundaries.test.ts` 4 · Adapter 선택 지점 `app/providers/apiClients.ts` 1곳 불변 |
| 49 | `QA-5-005` 해소(H6-7.2) · 전체 Playwright 단독 실행(H6-7.6) — Stage 2(설정·로그아웃·온보딩) · 3(Home) · 5(회고·피드백) 포함 · 이번 단위 baseline 재생성 **0** |
| 50 | H6-7.6 표 (`install --frozen-lockfile` 은 의존성 변경 0 — lockfile 수정 없음) |

## H6-7.6 검증 (2026-11-17)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 (1회차: 새 copy 테스트를 `.ts` 로 두어 `tsconfig.node.json`(jsx 없음)이 `packages/ui` tsx 를 읽고 실패 → Stage 5 선례대로 `.tsx` 로 이름 변경) |
| `pnpm lint` | ✅ exit 0 |
| `pnpm lint:boundaries` | ✅ no dependency violations (936 modules, 3720 dependencies) |
| `pnpm build` | ✅ · `pnpm assert:no-mocks` ✅ (sentinel 0 · `haru-dev-` 0 · sharp 0) |
| `pnpm test` | ✅ **206 files / 2966 tests** (H6-6 대비 +3 files / +28: `stage6-copy` 18 · `stage6-privacy` 6 · `stage6-boundaries` 4) |
| `pnpm format:check` | ✅ |
| `stage6-cross-cutting.spec.ts` 단독 | 1차 17 중 7 실패 = 전부 **테스트 결함**(retry 테스트가 Home 에서 바로 `/settings/child` 로 들어가 `navigate(-1)` = Home · 포커스 링 조부모 미탐색 · 뷰포트 밖 점 · 칩/TextField 분류 · 색 transition 을 움직임으로 셈 · 본문 버튼 0 화면에서 locator 대기) → 수정 후 **17 passed** |
| `pnpm test:e2e` (전체, **단독**) | H6-7.6.1 |

### H6-7.6.1 전체 Playwright

`pnpm test:e2e --reporter=line` — 다른 Playwright 실행 없이 **단독**, 모든 검사 뒤 마지막 단계: **763 passed (20.0m) · failed 0 · flaky 0** (exit 0). `session-regression.spec.ts` AC-4-99 5건(`QA-5-005` 정리 후) · `stage6-cross-cutting` 17건 포함. **baseline 재생성 0 · 신규 0** — `git status e2e/__screenshots__` 변화는 앞 단위(H6-2 ~ H6-6)의 것뿐(`s3-dialog-scrim` = H6-4.5). 그 뒤 `apps/api` · `supabase` · `apps/mobile` 부재 재확인.

## H6-7.7 최종 AC 표 — Stage 6 전 66건 (판정은 QA)

| AC | 근거 · 담당 단위 |
|---|---|
| 01 | `ls` 부재 ×3 (H6-1.1 ~ H6-7.1 매 단위) · `S6-F` |
| 02 | H6-7.3 Out of Scope grep · `children` 메서드 6개(목록 0, H6-1.3 07) · `S6-A`/`S6-F` |
| 03 · 04 · 05 · 06 · 07 · 08 | `packages/contracts/src/__tests__/stage-6.test.ts` · `http-stage6.test.ts` · `MockChildrenApi.test.ts` — H6-1.3 · `S6-A` |
| 09 | `docs/API_CONTRACTS.md` Rev 10 — H6-1.3 · `S6-A` |
| 10 · 11 · 12 | `MockChildrenApi.test.ts` · `stage6-recommendation.test.ts` — H6-1.3 · `S6-A` |
| 13 | grep + `lint:boundaries` (H6-1.3) · `stage6-boundaries` mocks import 0 (H6-7.2) · `S6-A`/`S6-F` |
| 14 | `API_CONTRACTS §5.4` · Scenario Panel `children` 그룹(H6-1.3) · `/__dev/screens` route 7 + 그룹 2행(H6-7.2) · `S6-A`/`S6-F` |
| 15 · 16 · 17(N/A) · 18 ~ 23 | `child-info-edit.test.tsx` · `settings-child.spec.ts` · `settings-growth.test.tsx`(16 행) — H6-4.3 · H6-6.3 · `S6-B`/`S6-D` |
| 24 ~ 29 | `survey-update.test.tsx` · `settings-survey.spec.ts` · 온보딩 회귀 — H6-5.3 · `S6-C` |
| 30 · 31 · 32 · 33 | `settings-growth.test.tsx` · `settings-growth.spec.ts` · `growth-capability.test.tsx`(copy) — H6-6.3 · `S6-D`(`S6-E2` 컴포넌트) |
| 34 · 35 · 37 · 38 | `profile-result.test.tsx` · `profile-result.spec.ts` · baseline — H6-2.3 · `S6-E1` |
| 36 | 온보딩 표시 0(H6-2.3) + 재방문 UpdateNote(H6-3.3) · `S6-E1`/`S6-E2` |
| 39 · 40 · 41 | Mock 부분 `stage6-recommendation.test.ts`(H6-1.3) · `reason` 금칙어(H6-7.2) · **e2e 화면 단정 없음** — H6-7.8 ② · `S6-A` |
| 42 ~ 50 | H6-7.5 · `S6-F` |
| 51 · 52 | **`BACKEND_INTEGRATION_PENDING`** (Plan §11.11) — H6-7.9 |
| 53 · 54 · 55 · 61 · 62 · 64 · 65 | `growth-capability.test.tsx` · `growth-capability.spec.ts` · `profile-result.*` · `settings-growth.*` — H6-2.3 · H6-3.3 · H6-6.3 · `S6-E1`/`S6-E2`/`S6-D` |
| 56 · 57 · 58 · 59 · 60 · 63 | `diamondGeometry.test.ts` · `DiamondChart.test.tsx` · `profile-result.*` · `settings-growth.test.tsx`(63) — H6-2.3 · H6-6.3 · `S6-E1`/`S6-D` |
| 66 | 화면별 반응형 e2e(H6-2.3 · H6-3.3 · H6-4.3 · H6-5.3 · H6-6.3) + `stage6-cross-cutting` 반응형 4 · `S6-E1`~`S6-F` |

집계: 66 = Frontend 64 (근거 위) + `BACKEND_INTEGRATION_PENDING` 2 (51 · 52). AC-6-17 은 목록이 데이터에 의존하지 않아 N/A 로 기록(H6-4.3).

## H6-7.8 NEEDS_DECISION · 남은 점

1. **언어 칩 줄 사이 히트 겹침** (H6-7.4 ③) — Stage 2 칩 묶음(온보딩 Step 1 · `/settings/child` 공용). ⓐ `D5-6` 와 같은 중간선 분할 적용(Stage 2 화면도 바뀜 — baseline 영향 0 예상, 히트 영역만) ⓑ 현행 유지(실효 ≈ 41.5, WCAG 2.5.8 24px 는 충족) — **사용자 결정 필요**. Stage 6 이 만든 것이 아니라 고치지 않았다.
2. **AC-6-39 · 40 · 41 의 화면(e2e) 단정 부재** — `cold-to-warm` · `difficulty-lowered` 는 Mock 단위 테스트(덱 · 연쇄 · 결정성)로만 덮여 있다. 4번째 세션 완료 → Home `reason` 변경 · `tricky_today` 회고 → 다음 카드 변경을 브라우저로 따라가는 e2e 는 어느 단위도 만들지 않았다(H6-1.8 "e2e 판정은 화면 단위 이후" — 화면 변경이 없는 기능이라 화면 단위가 없었다). 카드 DOM 구조 변경 0 은 Stage 3 Home baseline 회귀로 보장된다. **관찰 (코드 확인)**: 세션 완료 · 회고 저장은 오늘 카드 Query(`activityCardKeys.today`)를 **무효화하지 않는다** — 전역 `staleTime` 30s 안에 Home 으로 돌아오면 이전(cold) 덱이 그대로 보이고, 30s 뒤 재진입하면 재조회로 바뀐다. "다음 카드" 반영 시점 자체가 `P6-BIP-04`(다음 날 07:00 vs 즉시) 미결이라 결함으로 분류하지 않았다 — 즉시 반영을 원하면 회고 저장 성공 시 무효화 1줄. **QA 가 e2e 를 요구하면** 추가 단위로 처리 — Plan 담당 단위 표(`S6-A` = 39~41)의 화면 부분 공백.
3. 앞 단위 미결 그대로: `VG6-*` USER_APPROVAL 12건(위 Status 목록) · H6-3.6 ② UpdateNote 연도 표시 · H6-4.6 ③ 필드 오류 문구(`VG6-B-11`) · H6-5.7 덱 이름(`VG6-C-09`) · H6-5.6 ④⑤(`VG6-C-10`) · H6-6.5 ② 딥 링크 `navigate(-1)` · `COMPONENT_MAP.md` 갱신 요청(H6-3.6 ⑪ · H6-4.6 ⑨ · H6-5.6 ⑧ — plan/design 소유).

## H6-7.9 BACKEND_INTEGRATION_PENDING — Stage 6 전체 (Plan §10 · Stage 8 Handoff 대상)

| ID | 내용 | Handoff 문서 | 관련 AC | 단위별 추가 메모 |
|---|---|---|---|---|
| `P6-BIP-01` | 세션 분석 누적 → 스냅샷 갱신 규칙(주기 · 가중 · 최소 근거 세션 수 · 설문 대비 비중) | AP · DR | 52 | Mock = `session_analysis` 고정 점수표 (H6-1.7) |
| `P6-BIP-02` | 페르소나 재생성 트리거 · 빈도 · 안전 검증 · fallback 풀 · `ai_generation_logs` | AP | 52 | Mock 은 `persona-changed` key 로만 바뀐다 (H6-1.6 ⑥) |
| `P6-BIP-03` | 추천 cold(가입~세션 3회) → warm(4회~) · `recommendation_logs` | AP · DR | 51 | Mock 기준 = 완료 세션 4 (seed 2 포함, H6-1.8) |
| `P6-BIP-04` | warm 입력(`tricky_today` → 난이도 하향 · `note` 주제 · 반응 주제 · 역량 변화) · 반영 시점 | AP · BH | 51 | `P5-BIP-03` 승계. Mock = 직전 세션 회고 기준 즉시 |
| `P6-BIP-05` | 덱 카드별 역량 순환 · 같은 주제 연속 3일 지양 | AP | 51 | — |
| `P6-BIP-06` | 같은 책 재추천 시 새 Prompt 세트 | AP | 51 | — |
| `P6-BIP-07` | 재응답: 버전 행 · 제출 불변 · 새 스냅샷(`survey_update`) · 페르소나 재생성 · draft 보존 기간 · 동의 강제 | DR · BH · AR | 52 | 필수 문항 재검증 `ONBOARDING_INCOMPLETE` · IK 24h (H6-1.7) · **후보**: 복귀 단계 의미(`currentStep` = 저장 단계 vs 보던 단계, `VG6-C-10` 결정에 따름) |
| `P6-BIP-08` | 아이 정보 수정: 생년월 변경 → 연령대 재계산 · 추천·instrument 영향 · 수정 이력(법무) | DR · AP | 52 | 서버 시계 나이 재검증 · `relationship` 거부 (H6-4.9) |
| `P6-BIP-09` | 전 endpoint 소유권 확인 · RLS · 전체 삭제 대상 | AR · DR | 52 | Mock `CHILD_NOT_FOUND` (H6-1.2) |
| `P6-BIP-10` | 발전 역량 변경 기록(`caregiver_changed` · 경로) · 추천 반영 | DR · AP | 51 | 제안값 그대로 확정도 `PUT` 1건 (H6-3.6 ⑦) |
| `P6-BIP-11` | (`N6-03` ⓐ) 프로필 갱신 사실을 `HomeSummary.characterLine` 서버 문장으로 — 검수 템플릿 | BH · AP | 52 | Frontend 는 서버 문장만 표시 |
| `P6-BIP-12` | `GET /profile` 이 온보딩 제출 직후에도 완성된 `ChildProfile`(페르소나 ≤ 3초 또는 fallback · strengths/growingEdges 산출) | BH · AP | 52 (55 Frontend 부분은 PASS 대상) | 프로필 결과 화면의 유일한 데이터 출처 (`D6-5`) |

`S6-F` 에서 새 PENDING 항목 **0** (후보 1건은 `P6-BIP-07` 메모로만).

---

# H6-8 — QA 수정 루프: `QA-6-001` (AC-6-22, Medium FAIL) — 2026-11-18

범위: **`QA-6-001` 만** 수정했다. 사용자 결정 대기 항목(`VG6-E2-09` · `VG6-B-06/07` · `VG6-C-10` · 언어 칩 히트 겹침 · today card 반영 시점 등)은 건드리지 않았다. `QA-6-006`(AC-6-39/40 e2e)은 추가하지 않았다 — 세션 4회 완료 연쇄가 필요해 싸지 않다.

## H6-8.1 원인

완료 버블 문장이 `fixtures/sessions.ts` 의 고정 상수(`'Storytime success! Emma did wonderfully.'`)였고, `resolveReadySessionShape` 가 그 상수를 세션 레코드에 그대로 넣었다. `MockSessionApi` 는 S6-A 의 아이 프로필 서버 상태(`childProfileState`)를 받지 않았다 — `GET /v1/me` 만 그 상태를 따랐다. 그래서 이름 수정 후 같은 완료 화면에 회고 카드 제목(Me) = `Mia`, 버블(세션 Mock) = `Emma` 가 함께 나왔다.

## H6-8.2 수정 (Contract 변경 0)

| 파일 | 변경 |
|---|---|
| `apps/web/src/mocks/fixtures/sessions.ts` | `createCompletionBubbleFixture(childFirstName, subtext?)` 추가 · `MOCK_COMPLETION_SUBTEXT` 분리. `MOCK_COMPLETION_BUBBLE` = 이 함수(`Emma`) — 값 동일 |
| `apps/web/src/mocks/sessions/sessionFixtureScenarios.ts` | `COMPLETION` 표 = 이름을 받는 함수. `resolveReadySessionShape(store, childFirstName = MOCK_CHILD_FIRST_NAME)` |
| `apps/web/src/mocks/sessions/MockSessionApi.ts` | deps `childProfileState?` 추가 · `POST /v1/sessions` 에서 현재 이름(`childProfileState.current()?.child.firstName ?? Emma`)으로 shape 를 만든다 — `MockMeApi` 와 같은 출처·같은 fallback |
| `apps/web/src/mocks/index.ts` | 번들 조립에서 `childProfileState` 를 세션 Mock 에 넘긴다 |
| `apps/web/src/mocks/__tests__/MockSessionApi.test.ts` | 단위 3건: `success` · `subtext-missing` 에서 수정 후 전이 응답 = Detail = `Mia` 문장 · `me.child.firstName` 과 일치 / 수정 전 = `Emma` |
| `e2e/settings-child.spec.ts` | 신규 e2e: 이름만 수정 → Home → 세션 완료 → 버블 `Storytime success! Mia did wonderfully.` + 카드 `How was storytime with Mia?` + 화면에 `Emma` 0. 세션 진행 단계는 helper `completeSessionFromHome` 로 묶어 기존 AC-6-22 테스트와 공유 |

- 문장은 **Mock(서버) 이 만든다**. Frontend 코드 변경 0 — 화면은 응답 `completionBubble.text` 를 그대로 그린다 (`D4-2` · `D4-20`).
- 이름은 **세션 생성 시점**에 레코드에 담긴다(전이 응답 · Detail · replay 가 같은 값을 공유하는 기존 구조 유지). 세션 진행 중 이름 수정은 UI 경로가 없어 다루지 않았다.
- 지난 세션 seed(`sessionHistory.ts`)·`session-already-active*` seed 의 버블은 그대로 `Emma`(과거에 만들어진 서버 문장). 완료 화면 재진입은 Stage 6 경로가 아니라 바꾸지 않았다.

## H6-8.3 검증 (2026-11-18)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm format:check` · `pnpm build` | exit 0 |
| `pnpm lint:boundaries` | ✔ no dependency violations (936 modules, 3723 dependencies) |
| `pnpm test` | 206 files / **2,969** passed (+3) |
| `playwright test e2e/settings-child.spec.ts` (단독) | **18 passed** (신규 1 포함) |
| 영향 spec 단독: `session-complete` · `session` · `session-prompts` · `session-notices` · `session-recording` · `session-regression` · `reflection-card` · `reflection-title-overflow` · `scrollbar-classic` · `shadow` · `visual` · `stage5-cross-cutting` · `stage6-cross-cutting` · `session-feedback` | **470 passed** / 0 failed (10.4m, `pgrep` 0 확인 후 단독) |
| baseline | 재생성 0 · 변경 0 (`find e2e/__screenshots__ -newer` 결과 없음). 기본 이름이 `Emma` 그대로라 기존 완료 화면 baseline 의 글자가 같다 — `R-BASELINE-1` §5 분해 대상 없음 |
| `ls apps` = `web` · `supabase` 없음 | `apps/api` · `apps/mobile` · `supabase` 미생성 |

## H6-8.4 Handoff 메모 (Stage 8 — plan-agent 등록 판단)

- **후보 요구**: 서버가 만드는 완료 버블 문장(`SessionTransitionResult.completionBubble` · `SessionDetail.completionBubble`)은 **문장 생성 시점의 현재 아이 이름**(`children.first_name`)을 쓴다 — 아이 정보 수정(`P6-BIP-08`) 뒤 `GET /v1/me` 와 일치해야 한다. 이미 저장된 과거 세션 문장을 다시 만들지 여부는 미정(Mock = 다시 만들지 않음). `P6-BIP-08` 메모로 붙이는 것을 제안한다 — 새 BIP ID 는 만들지 않았다.

재검증 요청: stage-qa-agent — `QA-6-001` (AC-6-22).

---

# H6-9 — QA 수정 루프 `S6-G` (G-1 ~ G-11, `D6-9`) — 2026-11-18

범위: Plan 개정 3 §12.2 의 **G-1 ~ G-11 만**. G-12(`QA-6-001`)는 H6-8 에서 끝났다 — 다시 손대지 않았다. 신규 UI·문구 = `D6-9` 가 정한 것(*Survey questions* · *Survey progress*) 외 0. 신규 토큰 0 · 신규 `overflow` 0 · `apps/api` · `apps/mobile` · `supabase` 미생성(`ls apps` = `web`).

## H6-9.1 Gate

| 조건 | 결과 |
|---|---|
| Plan `stage-6-plan.md` | `APPROVED (2026-11-15)` · 개정 3 §12.2 `S6-G` = `D6-9`(2026-11-18 사용자 결정) |
| Design Spec | `APPROVED (2026-11-15)` |
| Contract 설계 | `API_CONTRACTS.md` Rev 10.1 (plan-agent) — 구현 반영 표기 추가(§ 머리 Rev 10.1 구현 반영 블록) |
| Backend 범위 | 0 |

## H6-9.2 Figma 실측 (최우선 규칙 4 · `R-FIGMA-1` — **선언값**)

도구: Figma Dev Mode MCP(로컬 `127.0.0.1:3845`, `get_design_context` · `get_metadata` · `get_screenshot`), fileKey `YWWu3AFEJpRxvw0T5klq0k`, 2026-11-18.

| 노드 | 선언값 | 코드 대응 |
|---|---|---|
| `244:1314` Languages (346×143) | `flex-col gap 14` · `pt 20 pb 18 px 10` · radius **30** · fill `--glass-fill-strong`(white 90%) · effect = drop `0 6 4 #5E7370/8%` + inset `0 1.5 0 white/90%` + inset `0 -1 0 #5E7370/5%` (Style 이름 `HARU/Shadow Rest` 5겹이지만 **인스턴스 렌더는 1+2겹** — `R-FIGMA-1` ②) | `Surface material="bubble" fill="strong" radius="card"` (`--shadow-bubble` = 같은 3겹) + 래퍼 `.haru-choice-card` padding `space-5 / space-2-5 / space-4-5` · legend↔칩 `space-3-5` |
| `244:1348` legend | Regular 13 / 18 · `text-primary` | `Text footnote primary`(기존) · legend 높이 18 (block) |
| `244:1327` 칩 묶음 | wrap gap 7 · **justify center** · 칩 = `Select 90:626`(미선택 1px `stroke` · Medium 12.5 · 선택 teal + white) | `justify-content: center` · `Chip variant="select"` · gap `space-2`(7→8, Stage 2 흡수 유지) |
| `244:1357`/`1358` *Reading routine* | 섹션 라벨 행 h34 · Bold 12 · tracking .72 · `#7d9291` — `AT HOME` 라벨과 **같은 스타일** | legend 를 SectionLabel recipe 토큰(caption-1 · semibold · `fg-secondary`)으로 (`child.css .haru-child-routine`) |
| `244:1394` Answer card | 행 5개 `gap 7` · 행 fill `rgba(233,240,237,.8)` · radius 16 · pad 15/13 · gap 11 · Semibold 14.5 · 선택 `#85bfb6` + white | `RadioGroup variant="card"` = 설문 카드와 같은 recipe(`surface-subtle` · `radius-field` · 44 행 · gap 8) |
| `244:1433` 배치 | `AT HOME`(`244:1414`) y391 h178 → `Reading routine`(`244:1415`) y587 = **형제 섹션**, 간격 18 | `ChildReadingRoutineField` 를 `AT HOME` section 의 **다음 형제**로 (부모 `gap-5` = 20, `AD-S2R-04` 흡수) |
| DRAFT `319:1425` (프로필 content) | `flex-col gap 20` — h1 `319:1426` y0 h54 → 본문 `319:1427` y74 | G-5: 헤더 `gap-5` |
| DRAFT `320:1493` (발전 역량 content) | `flex-col gap 20` — h1 y0 h27 → 본문 y47 · 선택 설명 `320:1560` y594 h45 → *You can change…* `320:1561` y659 | G-5: 헤더 `gap-5` · 설명 묶음 `gap-5` |
| DRAFT `320:1691` (제안 없음) | 설명 없음 · RadioGroup 끝 y602 → footnote y622 (= 섹션 gap 20 만) | 선택 전에는 설명 묶음 gap 0 (빈 live 영역이 간격을 더하지 않게) |

## H6-9.3 항목별

| # | 상태 | 변경 |
|---|---|---|
| **G-1** | 구현 | `entities/child/ChildInfoFields.tsx` — `ChildHomeFields` 를 `ChildLanguageFields`(카드) + `ChildReadingRoutineField`(`variant="card"`)로 나눴다. 두 화면(`features/onboarding-survey/ui/ChildInfoStep.tsx` · `features/child-profile-edit/ui/ChildInfoEditForm.tsx`) 모두 `AT HOME` section 다음에 독서 루틴을 형제로 둔다. `entities/child/child.css` — 카드 여백·legend·칩 정렬·독서 루틴 legend. 프로브(393×852 `/settings/child`): 카드 x24 w345 h185 = 20+18+14+115+18 · legend +20 h18 · 칩 +14 · 카드 아래 → 라벨 +20 · 라벨 → 첫 행 +12 · 행 44 × 5 gap 8 · radius 28 · bg `rgba(255,255,255,.9)` · shadow = `--shadow-bubble` 3겹 |
| **G-1a** | 구현 | `useChipRowSplit` 을 `features/reflection/ui` → **`shared/hooks/useChipRowSplit.ts` 로 이동만**(feature 간 import 금지 · 동작 변화 0, `ReflectionCard` import 경로만 변경). 언어 칩 `ref` 연결 + `child.css` 중간선 규칙(간격 토큰 `space-2`). 프로브(`elementFromPoint` 0.5px 간격): 393 · 320 모든 줄 경계에서 윗줄/아랫줄 소유가 **중간선(±0.5)** 에서 바뀐다 — 예 393 row0 `upperBottom 482 · lowerTop 490 · mid 486` → U ≤485 / L ≥485.5 |
| **G-2** | 구현 | contracts `SaveSurveyUpdateStepRequestSchema` 4변형 `currentStep?` · Mock `currentStep ?? step` · `ChildrenApi.saveSurveyUpdateStep(…, SurveyUpdateSaveOptions{keepalive})` · `HttpRequestConfig.keepalive` → `fetch({ keepalive: true })` · `entities/child-profile` `useSurveyUpdatePageHideSave`(adapter 직접 1회, 실패 삼킴·로그 0) · `useSurveyUpdateWizard`: 이동 PUT = 도착 단계(앞·뒤·제출 시 빈 단계로 이동 포함) · **카드 화면 unmount** 시 미저장 편집 PUT 1회(`currentStep` 생략) · `pagehide` best-effort(표시는 지우지 않음 — bfcache 복귀 대비) · 제출 성공 시 표시 해제. 첫 카드 → 진입 뒤로 = **이탈**(편집 없으면 PUT 0 — 이전 구현은 항상 1건, 테스트 기대값 정정). e2e `settings-survey.spec.ts` 기대값 **단계 2** 로 정정 + 이탈 PUT e2e 1건 신규 |
| **G-3** | 구현 | `GrowthCapabilityPicker` *Choose one to continue.* · *You can change this anytime in Settings.* → `Text tone="strong"`(`--color-fg-strong` = ink-800, 기존 토큰). 프로브(글자 투명 → 배경 픽셀 전수, 13px): 852 높이 **5.79–6.15** · 1200 높이 5.79–6.73 (온보딩 기본·empty · 설정 empty 모두) — 전부 ≥ 4.5. `P-34` 미등록 |
| G-4 | 변경 0 | 가운데 정렬 유지 (VG 판정 갱신은 design-agent) |
| **G-5** | 구현 | 프로필·발전 역량 헤더 `gap-2` → `gap-5`, 선택 설명 ↔ *You can change…* `gap-5`(선택 전 0). 프로브: 프로필 h1→안내 **20** · 발전 역량 h1→안내 **20** · 설명→문구 **20** · empty RadioGroup→문구 **20** (= DRAFT 3프레임) |
| G-6 | 변경 0 | 연도 표기 유지 |
| **G-7** | 구현 | UpdateNote `items-start` + 아이콘 상자 높이 = footnote line-height(`child-profile-view.css .haru-update-note__icon`). 프로브: 320 = 2줄 · 아이콘 중심 y9 = 첫 줄 중심 / 393 = 1줄 · 같은 위치(1줄 위치 변화 0) |
| G-8 | 주석만 | `features/child-profile-edit/copy.ts` `fieldInvalid` 확정 주석. **Spec §10.4 기록은 design-agent 몫**(development-agent 는 Spec 을 쓰지 않는다) |
| **G-9** | 구현 | `SurveyCardDeck` 선택 prop `label`(기본 = 온보딩 문구) · `surveyUpdateCopy.a11y` *Survey questions* / *Survey progress* · 재응답 위저드만 전달. 온보딩 이름·DOM 변화 0 |
| **G-10** | 구현 | `entities/reflection/useSubmitReflection.ts` 성공 시 `activityCardKeys.all` 무효화. 신규 e2e `e2e/today-card-refresh.spec.ts` 2건: `difficulty-lowered` *Tricky today* 저장 직후 Home 첫 카드 = *Grumpy Monkey…* + 하향 사유(AC-6-40) · `cold-to-warm` 4번째 완료 회고 저장 직후 warm 사유(AC-6-39) — 탭 왕복·대기 없이 |
| G-11 | 변경 0 | `navigate(-1)` — Stage 8 전 앱 전체 기준 결정(추적) |

## H6-9.4 테스트 추가·정정

| 파일 | 내용 |
|---|---|
| `packages/contracts/src/__tests__/stage-6.test.ts` | `currentStep` 선택 · 4단계 허용 · `child_info`/모르는 값 거부 (+1) |
| `apps/web/src/mocks/__tests__/MockChildrenApi.test.ts` | 이동 = 도착 단계 · 뒤로 이동 · 이탈(생략) = 저장 단계 · 첫 저장이 이동 · `child_info` 거부 (+3) |
| `apps/web/src/shared/api/__tests__/http-stage6.test.ts` | `currentStep` 본문 · `keepalive: true` / 기본 없음 (+1) |
| `apps/web/__tests__/survey-update.test.tsx` | 이동 payload `currentStep` · 뒤 단계 이동 · 첫 카드 뒤로 편집 없음 = 0 · 편집 후 뒤로 = 1(생략, 서버 draft 확인) · 앱 안 이동 unmount = 1 · **`pagehide`** 편집 없음 0 / 있음 1 · 접근성 이름 (+4 · 정정 2) |
| `apps/web/src/entities/reflection/__tests__/useSubmitReflection.test.tsx` | 성공 시 오늘 카드 무효화 · 실패 시 아님 (+1) |
| `e2e/settings-survey.spec.ts` | 복귀 = 단계 2(*Books and interests*, 카드 3) · 단계 1 답 보존 · 이탈 PUT 1건(`currentStep` 없음) e2e 신규 |
| `e2e/today-card-refresh.spec.ts` | 신규 2건 (G-10) |

## H6-9.5 baseline (`R-BASELINE-1`)

절차: 기본 모드 실행으로 실패 15장 수집 → 행 정렬(shift 모델) 잔차 + 연결성분으로 분해 → **런타임 토글**(G-3/G-5 를 DOM 에서 되돌려 촬영) → 설명 안 되는 클러스터 0 확인 후 `--update-snapshots=all`(대상 5 spec) → 쓰인 파일이 분해한 actual 과 잔차 0 인지 재확인.

| baseline | 원인 | 분해 근거 |
|---|---|---|
| `visual.spec.ts/s2-onboarding-childinfo{,-trial,-edit}.png` | **G-1** | 언어 카드 위(`YOUR CHILD`·`ABOUT YOU`·`AT HOME` 라벨) 잔차 0 · 변경 띠 = 언어 카드 + 독서 루틴 라벨 + 행 5개 · 높이 +50 = 카드 185 − 기존 칩 묶음 143(+42) + 섹션 간격 12→20(+8) · *Next* 는 852 뷰포트 아래로 밀림(스크롤 화면, 이전에도 잘려 있었다) |
| `settings-child.spec.ts/s6-settings-child{,-save-failed}.png` | **G-1** | 위 잔차 0 · 변경 띠 y353–837 = 프로브 기하와 1:1(카드 353–538 + 그림자 ~548 · 라벨 558–574 · 행 586/638/690/742/794) · Save(mt-auto) 위치 불변 |
| `profile-result.spec.ts/s6-profile-onboarding{,-partial,-empty,-fallback,-320}.png` | **G-5** | 오프셋 {0,+12} 잔차 **0** · h1(y≤81) = 0, 안내부터 +12 · 토글(헤더 gap 8) → 이전 baseline 과 잔차 0 |
| `growth-capability.spec.ts/s6-growth-onboarding{,-changed,-empty,-save-failed}.png` | **G-5 + G-3** | 오프셋 {0,+12,+24}: h1 0 · 헤더 아래 +12 · 설명 아래 +24 · 잔차 = 캡션 글리프 행만(Δ ≤ 21 = ink-700→ink-800) · 토글(gap 8 · tone primary) → 이전 baseline 잔차 **0** (4장 모두). `-changed` 의 Δ7–8 5px = 옵션 행 hover 틴트(임계 0.02 미만) |
| `settings-growth.spec.ts/s6-growth-settings-empty.png` | **G-3** | 잔차 = *Choose one to continue.* 글리프 1행(Δ ≤ 21) · 토글 → 잔차 0 |

`=all` 이 함께 다시 쓴 **추적 파일 2장**:
- `visual.spec.ts/s3-dialog-scrim.png` — 세션 시작 전부터 수정 상태(S6-B, H6-4.5). 재작성본 ↔ HEAD 분해(`diffcc` Δ>5)가 QA 로그 `docs/qa/evidence/stage-6/s3-dialog-scrim-diff.log` 와 **동일** → 새 변화 없음(Δ ≤ 5 재인코딩만). 유지.
- `visual.spec.ts/v2-material.png` — HEAD 대비 98px · Δ ≤ 6 · 스와치 모서리(x17–22 · x338–343). 재렌더 3회 서로 0px(결정적) → 이 단위와 무관한 **기존 sub-threshold 드리프트**(Stage 6 `packages/ui` 변경 이후로 추정 — 원인 미확정). §5 에 따라 **재생성하지 않고 HEAD 로 복원**했다. design-agent/QA 확인 요청.

기타 Stage 6 baseline(미추적 디렉토리)은 `=all` 후 mtime 불변 = 다시 쓰이지 않았다(내용 동일).

## H6-9.6 Spec · Figma 와 다르게 한 점 (design-agent Visual Gap 확인 요청)

1. **언어 카드 radius 30 → `--radius-card` 28** — 30 토큰 없음. 스케일 흡수(Stage 0 #10). 신규 토큰 요청 여부 결정 필요.
2. **카드 padding 18(아래) → `space-4-5`(18)** · 위 20 · 좌우 10 · legend gap 14 — 전부 기존 토큰(정확값).
3. **칩 gap 7 → 8 · Answer-card 행 gap 7 → 8 · 행 높이 43 → 44 · 행 fill `rgba(233,240,237,.8)` → `surface-subtle` · 라벨 Semibold 14.5 → Regular 15** — 설문 카드와 **같은 기존 recipe**(`RadioGroup variant="card"`)를 그대로 쓴 결과. recipe 자체를 바꾸면 설문 카드 baseline 전부가 바뀌어 이번 범위 밖이다.
4. 칩 변형 `outline` → **`select`**(Figma `Select 90:626` — 선택 시 체크 아이콘 없음 · 미선택 1px border · Medium). G-1 "Figma 대로" 에 포함된다고 판단.
5. 섹션 라벨 tracking .72 → caption-1 기본(normal) — 다른 SectionLabel(`AT HOME`)과 같은 recipe.
6. Figma 노드의 `overflow-clip` 은 옮기지 않았다(내용이 카드 안에 들어가 클립 대상 없음 · `R-SHADOW-1` ①).

## H6-9.7 검증 (2026-11-18)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm format:check` | exit 0 |
| `pnpm lint:boundaries` | ✔ no dependency violations (936 modules, 3727 dependencies) |
| `pnpm test` | 206 files / **2,979** passed (+10) |
| 영향 spec 단독(baseline 재생성 후) | 147 passed (`--update-snapshots=all` 실행) |
| `pnpm test:e2e` 전체 (단독 — 다른 Playwright 실행 없음, 모든 검사 뒤 마지막) | **767 passed (17.4m) · failed 0 · flaky 0** (exit 0 · H6-7 763 + H6-8 1 + 이번 3 = `settings-survey` 1 · `today-card-refresh` 2) · 실행 후 `git status e2e/__screenshots__` 변화 없음(재생성 0) |
| `ls apps` | `web` — `apps/api` · `apps/mobile` · `supabase` 없음 |

## H6-9.8 Mock 시나리오 · 확인 경로

- 복귀 단계: Settings → *Update survey answers* → *Start* → 단계 넘김 → 브라우저 back → 다시 *Continue where you left off* = 보던 단계. `children:survey-update-draft` 는 seed 그대로(`currentStep = books_and_interests`).
- 오늘 카드: `?scenario=activity-cards:difficulty-lowered` → 세션 완료 → *Tricky today* 저장 → Home 첫 카드.
- 대비: `?scenario=children:all-scores-missing` → `/onboarding/growth-capability` · `/settings/growth-capability`.

## H6-9.9 BACKEND_INTEGRATION_PENDING

신규 0. `P6-BIP-13`(Plan §10, Rev 10.1 — 서버가 `currentStep ?? step` 저장 · `keepalive` 요청 수용)은 plan-agent 가 이미 등록. `P6-BIP-04`(회고 → 추천 반영 시점) 변경 없음 — Frontend 는 저장 성공 즉시 다시 조회할 뿐이다.

## H6-9.10 NEEDS_DECISION

- 언어 카드 radius 30 토큰 신설 여부 (현재 28 흡수) — H6-9.6 ①.
- `v2-material` sub-threshold 드리프트(98px Δ≤6, 이 단위 무관) 원인 확인 · 재생성 여부.

재검증 요청: design-agent Visual Gap(G-1 · G-3 · G-5 · G-7 화면) → stage-qa-agent (`QA-6-002` · `003` · `004` · `006` · AC-6-18 · 25 · 26 · 46 · 56 · 61 · 64 · 36 · 66 · 39 · 40).

---

# H6-10 — QA 수정 루프 `S6-H` (`D6-10` ① ② ③ — VG6-G-07 · 02 · 04 · 08 · 09) — 2026-11-18

범위: `D6-10`(2026-11-18 사용자 결정) 의 시각 5건만. `QA-6-005` 는 수용(Stage 8 확인) — 손대지 않았다. 신규 UI · 문구 0 · Contract 변경 0 · 신규 `overflow` 0 · `apps/api` · `apps/mobile` · `supabase` 미생성(`ls apps` = `web`).

## H6-10.1 Figma 실측 (`R-FIGMA-1` — 선언값)

도구: Figma Dev Mode MCP 로컬 서버(`127.0.0.1:3845/mcp`)에 JSON-RPC(`initialize` → `tools/call`)로 `get_design_context` · `get_metadata` 직접 호출(이 세션에 MCP 도구가 노출되지 않아 HTTP 로 같은 도구를 불렀다), fileKey `YWWu3AFEJpRxvw0T5klq0k`.

| 노드 | 선언값 |
|---|---|
| `244:1394` · `179:1788` · `320:1493` Answer card 행 라벨 | `font-['SF_Pro:Semibold'] font-[590]` 14.5 (세 노드 동일) |
| `244:1314` 언어 카드 | `rounded-[30px]` · fill `--glass-fill-strong` · `shadow-[0px_6px_4px_0px_rgba(94,115,112,0.08)]` · **blur 클래스 0건**(`backdrop-blur` 없음) |
| 섹션 라벨 `244:1313` AT HOME · `244:1358` Reading routine · `244:1427` YOUR CHILD · `244:1430` ABOUT YOU · `179:1733`/`179:1739`(가입) · `319:1503`/`319:1510`/`319:1540`(프로필) | 전부 `SF_Pro:Bold` 12 · `tracking-[0.72px]` · `#7d9291` · 라벨 행 `px-26 py-10` h34 · 행 ↔ 내용 `gap-px` |
| `244:1433` 배치 | `AT HOME` `244:1414` y391 h178 → `244:1415` y587 (간격 18) · 라벨 행 34 + 1 → 첫 행 = 카드 아래 +53 |

## H6-10.2 변경

| 항목 | 변경 |
|---|---|
| **VG6-G-07** | `packages/ui/src/field/RadioGroup.css` — `.haru-radio-group--card .haru-radio-group__label { font-weight: var(--font-weight-semibold) }` (590 = `--haru-weight-semibold`). **card 변형만** — list 변형(시간 목록, Figma 없음)은 Regular 유지. 적용 범위 = 설문 카드 · 발전 역량(온보딩 · 설정) · 독서 루틴 · Reading Context 시트(`C13-15`, card 변형 공유) · gallery |
| **VG6-G-02** | Tier 3 `--choice-card-radius: 30px` 신설(`component/index.css` `S6-H` 블록). `--reflection-card-radius`(30)와 **값만 같고 서로 참조하지 않는다** — 다른 노드 · 다른 의미(`VG6-G-02` 재사용 비권고). Semantic radius 7단계(`L-OPEN-09`) 불변. `DESIGN_TOKEN_MAP.md` §5.2 `corner radius/30` 행을 "흡수하지 않는다 — `N5-28` · `D6-10` 으로 Stage 0 흡수 기록 대체"로 정정 |
| **VG6-G-04** | `ChildLanguageFields` 가 `Surface fill="strong"`(blur 동반) 대신 `.haru-language-card`(`entities/child/child.css` — `--color-surface-strong` · `--shadow-bubble` · `--choice-card-radius`, blur 없음). 회고 카드와 같은 면 구성. **`Surface` 자체와 다른 사용처 불변** |
| **VG6-G-08** | `Text` 에 `tracking?: 'section-label'` prop 추가(`packages/ui/src/text/Text.{tsx,css}` · `TextTracking` export) → `letter-spacing: var(--section-label-letter-spacing)`(Tier 3 0.72px 신설). 섹션 라벨 11곳 `weight="semibold"` → `weight="bold" tracking="section-label"`: `ChildInfoStep`(YOUR CHILD · ABOUT YOU · AT HOME) · `ChildInfoEditForm`(2) · `SignUpForm`(2) · `SettingsMenu`(2, Figma 없음 — 같은 recipe 승계) · `CapabilityTagList` · `PersonaCard`. 독서 루틴 legend(`child.css`)도 bold + 같은 토큰. `DESIGN_TOKEN_MAP.md` §3 에 SectionLabel · Answer card 라벨 기록 |
| **VG6-G-09** | 언어 카드 아래 → 첫 행 48 → **53**: legend `padding-block-start: var(--child-routine-label-offset)`(Tier 3 **7px** 신설) + 라벨 ↔ 행 `space-3` 12 → `space-2-5` 10. 20 + 7 + 16 + 10 = 53 · 글자 중심 = 카드 아래 +35 = Figma(18 + 10 + 14/2). 스케일이 짝수라 합 17 을 만들 수 없어 component 토큰으로 뒀다(산식은 토큰 주석) |

Tier 3 토큰 +3 (281 → 284, manifest 282 → 285) — `token-tiers.test.ts` · `fonts.test.ts` 집계 갱신.

## H6-10.3 테스트

| 파일 | 내용 |
|---|---|
| `apps/web/__tests__/stage6-figma-fidelity-guards.test.ts` (신규 7) | card 라벨 semibold · 기본 라벨 weight 없음 · radius 토큰 30 · 언어 카드 blur/overflow 없음 · `<Surface` 미사용 · 자간 토큰 0.72 + modifier 순서 · 독서 루틴 legend recipe · features/child-profile 에 semibold 섹션 라벨 잔존 0 · 간격 산술 53 / 글자 중심 35 |
| `packages/ui/src/text/__tests__/Text.test.tsx` (+1) | `tracking` modifier 는 요청 시에만 |
| `packages/design-tokens/__tests__/{token-tiers,fonts}.test.ts` | Tier 3 집계 +3 |

## H6-10.4 baseline (`R-BASELINE-1` §5 · §6)

1. 기본 모드 전체 실행 → **30 실패**, 전부 시각 baseline(동작 실패 0).
2. **전체 런타임 토글**(소스 5항목을 이전 렌더로 되돌림 — `RadioGroup` 규칙 제거 · `bold+tracking → semibold` · legend 간격 원복 · radius 28 · blur 복원) → 같은 104 baseline 테스트 **전부 통과**(기존 baseline 과 임계 내 일치) = 이 단위 밖의 원인 0.
3. **항목별 고립 토글**(한 항목만 켜고 나머지는 되돌림) — 실패 집합의 합 = 30 정확히:

| 항목만 켬 | 실패 | baseline |
|---|---|---|
| G-07 | 18 | `s6-growth-onboarding{,-changed,-empty,-save-failed}` · `s6-growth-settings{,-changed,-empty,-save-failed}` · `s6-survey-card` · `s6-survey-save-failed` · `s2-deck-reading-together` · `s2-deck-capability` · `s2-onboarding-childinfo{,-trial}` · `s6-settings-child{,-save-failed}` · `s4-reading-context-sheet` · `v5-field`(gallery RadioGroup card) |
| G-08 | 16 | `s6-profile-*` 7 · `s2-signup` · `s6-settings` · `s6-settings-child{,-save-failed}` · `s2-onboarding-childinfo{,-trial,-edit}` · `s3-sheet-scrim` · `s3-dialog-scrim`(scrim 아래 설정 · 아이 정보 화면의 섹션 라벨 — 클러스터 x26 h≈10 라벨 글리프 행만) |
| G-09 | 5 | `s2-onboarding-childinfo{,-trial,-edit}` · `s6-settings-child{,-save-failed}` — 행 정렬 분해: y<560 잔차 0 · 라벨 글리프 +7 · 이후 내용 +5 잔차 0(마지막 행 1 = 내용 끝 밀림) |
| G-02 | 5 | 같은 5장 — 클러스터 4개 = 카드 네 모서리(y353–380 · y509–537, 좌우 끝 ≤23px)만 |
| G-04 | **0** | blur 제거는 매끈한 그래디언트 위라 렌더 차이 없음(design-agent 추정 확인) |

4. 설명 안 되는 클러스터 0 → `--update-snapshots=changed` 로 **실패한 30장만** 재작성(`diff -rq` 로 30 파일 = 실패 목록과 1:1 확인). **`v2-material` 미변경**(diff 목록에 없음).

## H6-10.5 검증 (2026-11-18)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm format:check` | exit 0 |
| `pnpm lint:boundaries` | no dependency violations (937 modules) |
| `pnpm test` | 207 files / **2,987** passed |
| `pnpm test:e2e` 전체 (단독) | **767 passed (19.9m) · failed 0 · flaky 0** (exit 0) · 실행 후 baseline 변화 0(재작성 30장 그대로 · `v2-material` 불변) |
| `ls apps` | `web` |

## H6-10.6 다르게 한 점 · NEEDS_DECISION

- `Text` 공통 컴포넌트에 `tracking` prop 1개를 추가했다(SectionLabel 컴포넌트를 만들지 않는다는 기존 결정 유지 — 자간만 modifier). design-agent 확인 요청.
- `SettingsMenu`(Figma 없음 `C13-12`) · `ReadingContextSheet`(Figma 없음 `C13-15`)는 같은 공통 recipe 를 쓰므로 함께 바뀌었다 — `D6-10` "같은 공통 스타일 포함" 으로 판단.
- **범위 밖으로 남긴 것**: 다른 섹션(`YOUR CHILD` · `ABOUT YOU` · `AT HOME`)의 라벨 행 기하(Figma 라벨 행 h34 · 내용까지 35 vs 구현 16 + 8/12 · 섹션 gap 18 → 20)는 바꾸지 않았다 — `D6-10` ③ 은 독서 루틴 53 만 정했다. 같은 Figma 차이가 남아 있다(design-agent 판정 요청).
- `--choice-card-radius` 와 `--reflection-card-radius` 를 한 토큰으로 합칠지는 결정하지 않았다(현재 독립 — 위 근거).

## H6-10.7 BACKEND_INTEGRATION_PENDING

신규 0.

재검증 요청: design-agent Visual Gap(VG6-G-02 · 04 · 07 · 08 · 09) → stage-qa-agent (`QA-6-002`).
