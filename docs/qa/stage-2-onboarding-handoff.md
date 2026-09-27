# Stage 2-ONBOARDING Handoff — 온보딩 위저드 Step 1~5 · Trial draft · 제출

작성: development-agent · 2026-09-26
Step 문서: `docs/workflow/stage-2/stage-2-ONBOARDING.md` · Queue: `docs/workflow/stage-2/QUEUE.md`

> 이 Step 은 **온보딩 Step 1~5 + 제출 + `/onboarding/saved`** 까지다.
> **Stage 2-B 를 선구현하지 않았다**: `/onboarding/profile` · `/onboarding/growth-capability` ·
> `CapabilityDiamondChart` · `PersonaCard` · 다이아몬드 null 축 **시각** 표현 — 전부 없다.
> 제출 응답(`ProfileResult`)은 **parse 검증까지만** 했고 화면에 표시하지 않는다.
> Stage 3(서재 · 소유/증정 · `BookPrompts` · Activity Card) · Stage 5(`TextArea` · `StarRating`)도 없다.
> 역량 점수 **산출 로직**은 contracts 의 기존 `scoreCapabilities` 를 쓸 뿐 새로 만들지 않았다.

---

## 1. Gate 확인

| 항목 | 결과 |
|---|---|
| `docs/plans/stage-2-plan.md` `APPROVED (2026-09-25, user)` | 충족 |
| `docs/design/stage-2-design-spec.md` `APPROVED (2026-09-25, user)` | 충족 |
| 이전 Stage QA PASS (Stage 1) | 충족 |
| 세부 결정 확정 | 충족 — 이 Step 은 **D-1 · D-3 · D-9 · D-10 · D-11 · D-16 · D-17** + **D-A · D-B · D-C**(§8) 적용 |
| Plan In Scope 에 Backend 구현 없음 | 충족 — `apps/api/` · `supabase/` 미생성 (`ls` 확인) |
| 선행 Step `2-CONSENT` COMPLETE | 충족 |

---

## 2. 생성 · 수정 파일

### 신규 — `packages/contracts`

| 파일 | 내용 |
|---|---|
| `src/onboarding/instrument.ts` | `OnboardingInstrument` · `ChoiceQuestion` · `InstrumentRef` · `ONBOARDING_CHOICE_QUESTIONS`(구조 정의) · `readChoiceAnswer` · `applyChoiceAnswer` · `toggleChoiceSelection` · `pruneUnknownChoiceAnswers` · `choiceQuestionValueSchema` |
| `src/__tests__/onboarding-instrument.test.ts` | 구조 제약 · D-B 목록 일치 · 토글 규칙 · instrument 교체 (19 케이스) |

### 수정 — `packages/contracts`

| 파일 | 변경 |
|---|---|
| `src/onboarding/options.ts` | `TOPIC_TAG_CODES` 교체(Q3) · `GROWTH_GOAL_CODES = CapabilitySchema.options`(D-B) · `TOPIC_TAG_NOT_SURE` |
| `src/onboarding/temperament.ts` | 4축 → `storyComfort`(Q1) · `readAloudBehavior`(Q4) |
| `src/onboarding/survey.ts` | `BASELINE_ITEM_BLUEPRINT` · `BASELINE_ITEM_CODES` 추가 (구조만, 문구 없음) |
| `src/onboarding/state.ts` | `instrument: SurveyInstrument` → `OnboardingInstrument` |
| `src/onboarding/submit.ts` | `SubmitOnboardingRequest.instrument` 추가 (D-A ④) |
| `src/onboarding/draft.ts` | `instrumentCode` → `instrument: {code, version}` |
| `src/onboarding/books.ts` · `goals.ts` | 상한 2 로 (Q2 · Q3 "up to 2") |
| `src/onboarding/index.ts` | instrument export |
| `src/__tests__/onboarding-flow.test.ts` · `profile-and-me.test.ts` | 새 코드 목록·instrument 반영 |

### 신규 — `packages/ui` · `packages/design-tokens`

| 파일 | 변경 |
|---|---|
| `packages/ui/src/field/RadioGroup.tsx` | `describedBy?` prop 추가 — Design Spec §2.10 Step 5 가 요구한 `aria-describedby`(비채점 caption) 연결 |
| `packages/design-tokens/src/semantic/space.css` | `--size-illustration-max: 307px` (Design Spec §5.2) |

### 신규 — `apps/web`

| 파일 | 내용 |
|---|---|
| `src/shared/api/onboarding-api.ts` · `books-api.ts` | API Client Interface 2종 |
| `src/shared/api/http/HttpOnboardingApi.ts` · `HttpBooksApi.ts` | Http Adapter 골격 |
| `src/shared/lib/onboarding-draft.ts` | `OnboardingDraftStore` (D-3) + `createMemoryStorage` |
| `src/entities/onboarding/*` | `onboardingKeys` · `useOnboardingState` · `useSaveOnboardingStep` · `useSubmitOnboarding` |
| `src/entities/book/*` | `bookKeys` · `useBookSearch` |
| `src/entities/me/useUpdateCaregiver.ts` | `PATCH /v1/me` (D-16) |
| `src/entities/character/CharacterIllustration.tsx` · `SurveyQuestionCard.tsx` | Design Spec §5.2 · §5.3 |
| `src/features/onboarding-survey/copy.ts` | **모든 사용자 노출 문구** (D-A ①) |
| `src/features/onboarding-survey/model/*` | `defaultInstrument` · `instrumentView` · `steps` · `childInfo` · `surveyAnswers` · `submitRequest` · `useOnboardingDraft` · `useOnboardingWizard` |
| `src/features/onboarding-survey/ui/*` | `OnboardingWizard` · `ChildInfoStep` · `ChoiceQuestionList` · `BooksStep` · `CapabilityItemsStep` · `OnboardingIntro` · `OnboardingSaved` · `OnboardingNotices` |
| `src/features/onboarding-survey/onboarding.css` | 복수 선택 그룹 · Step 5 옵션(44px · 비채점 구분선) |
| `src/pages/onboarding/*` | `OnboardingIntroPage` · `OnboardingStepPage` · `OnboardingSavedPage` (조립만) |
| `src/mocks/onboarding/MockOnboardingApi.ts` · `onboardingState.ts` | Mock Adapter + 공유 상태 |
| `src/mocks/books/MockBooksApi.ts` | 책 검색 Mock |
| `src/mocks/fixtures/onboarding.ts` · `books.ts` · `profile-result.ts` | fixture (가상 데이터만) |

### 신규 — 테스트

| 파일 | 케이스 |
|---|---|
| `packages/contracts/src/__tests__/onboarding-instrument.test.ts` | 19 |
| `apps/web/src/shared/lib/__tests__/onboarding-draft.test.ts` | 12 |
| `apps/web/src/features/onboarding-survey/model/__tests__/childInfo.test.ts` | 17 |
| `.../__tests__/instrumentView.test.ts` | 8 |
| `.../__tests__/defaultInstrument.test.ts` | 7 |
| `.../__tests__/surveyAnswers.test.ts` | 6 |
| `.../__tests__/submitRequest.test.ts` | 6 |
| `apps/web/src/features/onboarding-survey/__tests__/copy-language.test.ts` | 16 (D-B 금칙 표현) |
| `apps/web/src/mocks/__tests__/MockOnboardingApi.test.ts` | 21 |
| `apps/web/src/mocks/__tests__/MockBooksApi.test.ts` | 8 |
| `apps/web/__tests__/onboarding-screens.test.tsx` | 28 (화면·Privacy·D-9) |
| `e2e/onboarding.spec.ts` | 5 (실제 브라우저 키보드 완주 포함) |

### 수정 — `apps/web` (기존)

`src/app/router.tsx`(route 3개 등록) · `src/shared/api/types.ts` · `index.ts` · `me-api.ts` ·
`src/shared/api/http/index.ts` · `HttpMeApi.ts` · `src/shared/lib/clock.ts`(`clockDate`) ·
`src/mocks/index.ts` · `src/mocks/me/MockMeApi.ts`(`update` + 온보딩 완료 반영) ·
`src/entities/character/index.ts` · `character.css` · `src/styles/index.css` ·
기존 테스트 3종(stub `ApiClients` 에 새 도메인 추가) · `docs/API_CONTRACTS.md`.

---

## 3. 구현한 화면 · 라우트와 Step 1~5 구성

| route | 화면 | Figma / 근거 |
|---|---|---|
| `/onboarding` | 소개 — medallion · 안내 카드 · (InfoRow 슬롯) · Start/이어서 | `179:1748` |
| `/onboarding/:step` | 위저드 — TopBar(단계 제목) · ProgressBar + "Step n of 5" · 본문 · 하단 CTA | `179:1740` · `179:1770` + C13-04~08 |
| `/onboarding/saved` | 완료 — 일러스트 · 문구 · "Get started" → **`/`(Home) 직결** | `179:1809` · Design Spec §12.1 |

| Step | 내용 | 필수 (결정 D-C) |
|---|---|---|
| 1 `child-info` | 성·이름 2칸 · 생년월 년·월 2단 + 나이 Tag 파생 · 성별 3옵션(기본 미선택) · 관계 · 언어(복수) · 독서 루틴 | 이름 · 생년월 · 언어 |
| 2 `temperament` | **Q1** 이야기 자극 편안 범위(4) · **Q4** 읽어줄 때의 모습(5) — RadioGroup card | 없음 |
| 3 `books` | 책 검색(D-17) + **결과 없음 → 제목 직접 입력** · 집에 있는 책 · **Q3** 관심(최대 2, `not_sure_yet` 배타) | 없음 |
| 4 `goals` | **Q2** 함께 키우고 싶은 것 = **4대 역량**(최대 2, D-B) | 없음 |
| 5 `capability-items` | Baseline 10문항 · 척도 6(빈도 5 + 비채점) · `SwipeDeck` | 제출 시 10문항 전부 |

Step 1 은 **화면 1개 / 요청 2개**다 (D-16): 아이 정보는 `PUT /v1/onboarding/steps/child_info`,
관계·타임존은 `PATCH /v1/me`. 단계 이동 시 각각 1회씩 나간다.

---

## 4. D-A 구조 제약 4가지 — 어떻게 만족시켰는가

### ① 코드와 표시 문구 분리

- **코드**: `packages/contracts/src/onboarding/options.ts` · `temperament.ts` · `instrument.ts`.
  저장되는 값은 코드이며 contracts 밖에서 enum 을 다시 선언하지 않는다.
- **문구**: `apps/web/src/features/onboarding-survey/copy.ts` **한 파일**.
  `choiceOptions` 는 `satisfies Record<ChoiceQuestionId, Record<code, string>>` 이고 각 항목이
  `satisfies Record<StoryComfort, string>` 처럼 **코드 enum 으로 타입이 묶여 있다** →
  코드가 추가·삭제되면 **컴파일이 깨져** 문구 누락을 배포 전에 잡는다.
- 근거 테스트: `instrumentView.test.ts` "instrument 에 문구가 없으면 copy 모듈에서 가져온다",
  `onboarding-instrument.test.ts` "구조 정의에는 표시 문구가 없다".

### ② 문항 목록·순서·개수를 화면 코드에 흩지 않음

- 목록의 단일 출처는 `ONBOARDING_CHOICE_QUESTIONS`(contracts) 이고, 화면은
  `questionsForStep(instrument, step)` 이 돌려주는 배열을 **순회**한다.
- `ChoiceQuestionList.tsx` 에는 문항이 **한 줄도** 없다. Step 2·4 는 이 컴포넌트만 쓰고,
  Step 3 은 책 블록 + 같은 컴포넌트다.
- **문항 교체 시 화면 코드를 안 고쳐도 되는 근거** (전부 테스트로 고정):

  | 변경 | 고쳐야 하는 곳 | 근거 테스트 |
  |---|---|---|
  | 선택지 추가·삭제·순서 변경 | **없음** (instrument 응답만) | `onboarding-screens.test.tsx` "선택지를 줄인 instrument 는 줄어든 대로 그려진다" |
  | 문항 삭제 | **없음** | 같은 파일 "문항이 하나도 없는 단계는 아무것도 그리지 않는다" |
  | 문항 추가 | contracts 의 id + 저장 위치 매핑 **1줄씩**. 화면 코드는 그대로 | `instrumentView.test.ts` "문항이 늘어난 instrument 도 그대로 반영한다" |
  | 문구 변경 | copy 모듈만. 저장된 코드는 그대로 유효 | `instrumentView.test.ts` 문구 해석 순서 3 케이스 |
  | 순서 변경 | **없음** (`order` 로 정렬) | `instrumentView.test.ts` "order 가 뒤섞여 들어와도 정렬해서 돌려준다" |

- 단계 **순서**도 마찬가지다. `model/steps.ts` 는 `OnboardingStepSchema.options` 와
  `ONBOARDING_STEP_SLUGS` 를 **index 로만** 연결한다 — 매핑 표를 두 벌 쓰지 않는다.

### ③ Mock 이 `instrument` 형태로 내려준다

- `GET /v1/onboarding` → `OnboardingState.instrument` (`MockOnboardingApi` · fixture
  `createOnboardingInstrumentFixture`). 화면은 이 값을 렌더한다.
- **Trial(가입 전)은 서버 요청이 0건**이라 instrument 를 받아올 수 없다. 그래서 같은
  `OnboardingInstrument` 모양을 기기에서 조립한 `DEFAULT_ONBOARDING_INSTRUMENT` 를 둔다.
  **서버 값이 있으면 언제나 서버 값이 이긴다** (`useOnboardingWizard`:
  `serverState.state?.instrument ?? DEFAULT_ONBOARDING_INSTRUMENT`).
- 두 출처의 **구조가 같음**을 테스트로 고정했다 (`defaultInstrument.test.ts`):
  선택형 문항 id·순서·선택 규칙 동일, Step 5 문항 코드·역량·순서 동일, instrument code·version 동일.
  문구는 서버 소유이므로 비교하지 않는다.
- 서버가 문구를 내려주면 copy 보다 우선한다 — **클라이언트 릴리스 없이 선택지를 바꾸는 경로**다.
  단, 해석할 수 없는 선택지는 **그리지 않는다** (사용자에게 machine key 를 노출하지 않는다).
  → Backend 요구사항으로 §9 에 기록.

### ④ instrument 버전을 응답에 담아 보냄

- `SubmitOnboardingRequest.instrument = {code, version}` (contracts 필수 필드).
  없으면 parse 가 거부한다 (`onboarding-flow.test.ts`).
- 로컬 draft 도 `instrument` 를 보관한다 (`OnboardingDraft.instrument`).
- **기존 응답과의 호환 처리는 Backend 책임**으로 기록했다 (`P2-BIP-06`, §9).
  Frontend 는 담아 보내기만 한다.

---

## 5. D-B — 4대 역량 반영과 비교·평가 표현 금지

- `GrowthGoalSchema = CapabilitySchema` · `GROWTH_GOAL_CODES = CapabilitySchema.options`.
  **별도 enum 을 만들지 않았으므로 두 목록이 갈라질 수 없다**
  (`onboarding-instrument.test.ts` "선택지 코드가 Capability enum 과 정확히 같다").
- 화면 라벨은 결정 #14 의 화면 라벨 계열을 쓰되 **보호자 언어**로 적었다 (질문지 Q2 문구 그대로).
- **금칙 표현 테스트**: `apps/web/src/features/onboarding-survey/__tests__/copy-language.test.ts`
  — copy 모듈 전체(함수형 문구 포함 60+ 문자열)를 펴서 아래 패턴이 **0건**임을 고정한다.

  | 패턴 | 사유 |
  |---|---|
  | `vs` · `versus` | 대조 (기대 vs 실제) |
  | `compared to/with` · `comparison` | 비교 |
  | `goal progress/achieved/met/reached` · `achievement` | 목표 달성 |
  | `falls short` · `below average/target/expectation` | 미달 |
  | `percentile` · `ranking` / `your|their|the child's score|level|rating` / `scored higher/lower/better/worse` | 점수·순위 제시 |
  | `diagnos*` · `assessment` · `evaluate` · `test result` | 진단·평가 |
  | `delay` · `behind` · `deficit` · `weakness` · `poor` | 결함·지연 |
  | `normal/abnormal` · `average child` | 정상/비정상 |
  | `better/worse than` | 우열 |

  추가로 "Step 4 문구는 *grow together* 를 묻는다", "선택지 라벨에 역량 코드·내부 용어가
  노출되지 않는다" 를 함께 고정했다.
- **Stage 2 에는 프로필 결과 화면이 없으므로** 두 화면이 나란히 놓이는 상황 자체가 아직 없다.
  Stage 2-B 에서 같은 금칙 테스트를 그 화면 copy 에도 적용해야 한다 (→ §11 인계).

---

## 6. Privacy — Trial 서버 요청 0건 · 동의 전 아동 데이터 0건 (AC-2-13 · AC-2-27)

### 구조로 막은 지점

| 경로 | 막는 방법 |
|---|---|
| `GET /v1/onboarding` | `useOnboardingState({ enabled: authenticated })` — 미인증이면 query 자체가 실행되지 않는다 |
| `PUT /v1/onboarding/steps/:step` | `useOnboardingWizard.persistStep`: `if (!authenticated) return;` |
| `PATCH /v1/me` | 같은 함수 안, `step === 'child_info' && relationship !== null` 일 때만 |
| `POST /v1/onboarding/submit` | 마지막 단계 CTA 가 미인증이면 **제출 대신 `/auth/sign-up`** 으로 보낸다 |
| `GET /v1/me` | `useMe`: `enabled: session != null` (Stage 2-AUTH 에서 이미 고정) |
| 서버 측 | `MockOnboardingApi.requireConsent()` — `consent-missing`(동의 미기록) · `vpc-pending` · `vpc-failed` 에서 **3 endpoint 전부** `CONSENT_REQUIRED` |

### 증거

1. `apps/web/__tests__/onboarding-screens.test.tsx`
   "Step 1~4 를 진행하는 동안 요청 로그가 비어 있다" —
   소개 → Step 1 입력(이름·생년월·언어) → Step 2 → Step 3 → Step 4 를 실제로 거친 뒤
   `harness.bundle.requestLog.entries()` 가 `[]` 이고 `findChildDataKeys(...)` 도 `[]` 다.
   (`findChildDataKeys` 는 `2-CONSENT` 가 만든 전수 검사 도구를 **그대로 재사용**했다.)
2. 같은 파일 "동의가 없으면 Guard 가 온보딩 진입을 되돌리고 아동 데이터가 나가지 않는다" —
   `me:consent-missing` + 로그인 상태로 `/onboarding/child-info` 진입 → `/auth/consent` 로 되돌아가고
   요청 로그에 아동 데이터 키 0건.
3. `MockOnboardingApi.test.ts` "동의 전 거부된 요청에도 아동 데이터가 서버 상태로 들어가지 않는다" —
   거부된 뒤 `onboardingState.answers()` 가 `{}` 다.
4. `e2e/onboarding.spec.ts` — 실제 브라우저에서 `/v1/` 로 나가는 요청을 `page.on('request')` 로
   세어 Trial 구간 2 테스트 모두 `[]`.
5. 응답은 `localStorage["haru.onboarding.draft.v1"]` 에만 남으며 저장 값이
   `OnboardingDraftSchema` 를 통과한다 (`onboarding-screens.test.tsx` · `onboarding-draft.test.ts`).

### draft 삭제 시점 5종 (D-3)

| # | 시점 | 구현 | 테스트 |
|---|---|---|---|
| ① | 제출 성공 직후 | `useOnboardingWizard.goNext` → `draft.clear()` | `onboarding-screens.test.tsx` 제출 후 저장소 `null` |
| ② | 로그아웃 | `OnboardingDraftStore.clear()` 공개. **호출 지점은 `2-HOME` 의 로그아웃**(D-7 `ConfirmDialog`)이다 → §11 인계 |
| ③ | `schemaVersion` 불일치 | 읽는 순간 폐기 + `unreadable` | `onboarding-draft.test.ts` |
| ④ | parse 실패(손상) | 〃 | 〃 (JSON 깨짐 · enum 불일치 2케이스) |
| ⑤ | 보관 상한 30일 경과 | 읽는 순간 폐기 + `expired` (경계 포함) | 〃 |

---

## 7. D-9 접근성 — 제스처 없이 10문항 완주

- `SwipeDeck` 은 `controls="none"` 으로 쓰고, **동등한 버튼을 TopBar 에 제공**했다:
  leading `IconButton`("Previous question", `179:1772`) · trailing `IconButton`("Next question", `179:1775`).
  Step 5 가 아닌 단계에서는 leading 이 "Go back" 이다.
- 덱 안에서 `ArrowLeft`/`ArrowRight` 도 카드 이동이다. `RadioGroup` 위에서는 라디오 이동이
  우선하므로(SwipeDeck `KEY_OWNING_SELECTOR`) 옵션 선택과 충돌하지 않는다.
- 증거
  - `onboarding-screens.test.tsx` "제스처 없이 버튼만으로 10문항 전부에 도달해 응답할 수 있다" —
    10개 문항 각각의 **제목(h2)** 이 보이는 것을 확인하고 응답한 뒤 다음 버튼만 눌러 진행한다.
  - 같은 파일 "덱 안에서 ArrowRight 로도 다음 카드로 이동한다".
  - `e2e/onboarding.spec.ts` "키보드만으로 10문항 전부에 도달해 응답한다" — **실제 브라우저**에서
    `focus()` + `Space`(응답) + `focus()` + `Enter`(다음 문항)만 사용. 포인터 드래그 0회.
- 옵션 행 최소 높이 `--size-touch-min`(44) — 디자이너 요청 ③(Figma 43) 반영.
- 비채점 6번째 옵션(C13-08): `variant="muted"`(재질만 다름) + 위 구분선 `--space-4` +
  caption "This one isn't scored." + `RadioGroup describedBy` 로 eyebrow·caption 연결.
  **선택 상태 표시는 1~5 와 동일**하다 (결측이지 낮은 점수가 아니다 — C-8).

---

## 8. `S2-COPY-1` 처리 결과

**빈 슬롯으로 두었다.** `onboardingCopy.intro.durationSlot = null` ·
`onboardingCopy.intro.formatSlot = null` 이고, 값이 `null` 이면 해당 `InfoRow` 를 **렌더하지 않는다**.
플레이스홀더 문구를 넣지 않았다. 테스트가 이 상태를 고정한다
(`copy-language.test.ts` "S2-COPY-1 — 문구 미확정 슬롯").

**질문지 문서에 대체 문구가 있는가 — 없다.**
`HARU_Onboarding_Questionnaire_v1-1.docx.md` 는 "Five questions · ~2.5 minutes to complete" 를
말하지만, 이는 **Q1~Q5(= HARU 온보딩 Step 2~4 에 해당) 만** 센 값이다. HARU 온보딩은 여기에
**Step 1 프로필 입력과 Step 5 Baseline 10문항**이 더 붙으므로 소요 시간·문항 수가 그대로 맞지 않는다.
Figma `179:1763`("About 3 minutes · 10 cards")도 Step 5 만 설명한다.
→ **숫자를 정할 근거가 없어 구현이 정하지 않았다.** 기획 결정 필요 (§11 NEEDS_DECISION).

---

## 9. Mock 시나리오 목록과 전환 방법

전환: `?scenario=<group>:<key>[,…]` (URL > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`).

### `onboarding` 그룹 (`MockOnboardingApi`) — 13 key

| key | 동작 |
|---|---|
| `success` | instrument + 저장 상태 반환 · 단계 저장 · 제출 성공 |
| `loading` | 주입 timer 지연 후 성공 |
| `error` | `INTERNAL_ERROR` |
| `retry` | 1회차 실패 → 2회차 성공 (입력 보존) |
| `offline` | `NetworkError` |
| `consent-missing` | 동의 기록이 없는 동안 3 endpoint 전부 `CONSENT_REQUIRED`. **같은 세션에서 동의가 기록되면 통과**한다 |
| `vpc-pending` · `vpc-failed` | 동의가 있어도 항상 `CONSENT_REQUIRED` (아동 데이터 쓰기 0건) |
| `onboarding-incomplete` | 정상 동작 (Guard 판정은 `me` 가 표현) |
| `draft-resume` | 서버 저장 응답 + `currentStep='books'` 로 복귀 |
| `persona-fallback` | 제출 200 · `persona.isFallback: true` |
| `child-limit-reached` | 제출 `CHILD_LIMIT_REACHED` |
| `capability-all-missing` | 감정 조절 문항 전부 `not_observed` → 해당 역량 `score: null` · `itemCount: 0` |

### `books` 그룹 (`MockBooksApi`) — 6 key

`success` · `loading` · `empty` · `error` · `retry` · `offline`
(Stage 2 는 공통 5종 + offline 만. `user-entered-book` 등은 Stage 3 — Plan §8.4).

### `me` 그룹 동작 추가

`PATCH /v1/me` 가 같은 scenario 표를 따른다. 제출이 끝나면 어떤 key 든 `onboardingStatus`
가 `completed` 로 바뀐다 (`MockOnboardingState` 공유 — Guard 가 홈으로 보낼 수 있게).

### 바로 확인할 수 있는 경로

```
# Trial (미인증) — 서버 요청 0건
/onboarding

# 중도 복귀
/onboarding/child-info?scenario=onboarding:draft-resume

# 검색 결과 없음 → 제목 직접 입력
/onboarding/books?scenario=books:empty

# 제출 실패 계열
/onboarding/capability-items?scenario=onboarding:child-limit-reached
/onboarding/capability-items?scenario=onboarding:error

# 결측 역량 (응답 parse 만 — 화면 표시는 Stage 2-B)
/onboarding/capability-items?scenario=onboarding:capability-all-missing

# 동의 전 차단
/onboarding/child-info?scenario=me:consent-missing
```

---

## 10. 검증 명령 결과 (공통 7종)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **통과** (5 패키지 전부 Done) |
| `pnpm lint` | **통과** (0 problems) |
| `pnpm test` | **통과** — `Test Files 96 passed / Tests 979 passed` (직전 85 / 830 → **+11 파일 / +149 케이스**, 회귀 0) |
| `pnpm lint:boundaries` | **통과** — `no dependency violations found (435 modules, 1436 dependencies)` |
| `pnpm build` | **통과** (`vite build` 성공. chunk 500kB 경고는 기존과 동일한 성격의 경고이며 오류 아님) |
| `pnpm format:check` | **통과** — `All matched files use Prettier code style!` |
| `pnpm test:e2e` | **통과** — `102 passed` (직전 97 → **+5**, baseline 38건 **변경 0**) |

`apps/api/` · `supabase/` 미생성 확인:

```
$ ls apps packages
apps: web
packages: config contracts design-tokens ui
```

---

## 11. BACKEND_INTEGRATION_PENDING (이 Step 이 확정·추가한 것)

| ID | 내용 | Contract 로 표현된 기대 동작 | Handoff 문서 |
|---|---|---|---|
| **P2-BIP-03** (확정) | 서버 측 동의 강제 — 동의·VPC 전 `GET/PUT /v1/onboarding*` · `POST …/submit` 거부 | `CONSENT_REQUIRED`(403). Mock 이 3 endpoint 전부 재현 | `AUTH_REQUIREMENTS.md` · `ERROR_CODES.md` |
| **P2-BIP-06** (확정 + 확장) | 온보딩 서버 draft 저장·복귀 + **instrument 배포·버전 관리** | `GET /v1/onboarding` → `OnboardingState{instrument: OnboardingInstrument, steps[5], draftAnswers, currentStep}`, `PUT /v1/onboarding/steps/:step`. **신규 요구 4건** ↓ | `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| **P2-BIP-07** | 역량 스코어 산출 — Mock 은 contracts `scoreCapabilities` 를 그대로 쓴다. 서버도 **같은 함수를 재사용**해야 한다 | `capability_scores.score` NULL 허용 | `DATA_REQUIREMENTS.md` |
| **P2-BIP-08** | 페르소나 생성 · fallback | `ProfileResult.persona.isFallback` (Mock: `persona-fallback`) | `ANALYSIS_PIPELINE_REQUIREMENTS.md` |
| **P2-BIP-10** | `children` caregiver 당 1명 UNIQUE | `CHILD_LIMIT_REACHED`(409) on submit | `DATA_REQUIREMENTS.md` |
| **P2-BIP-11** | `Idempotency-Key` 24h 보관·재생 | `POST /v1/onboarding/submit` — Mock 이 재생·`IDEMPOTENCY_KEY_REUSED` 재현 | `BACKEND_HANDOFF.md` |
| **P2-BIP-13** (신규) | **책 검색 코퍼스·매칭·정렬·페이지네이션** | `GET /v1/books/search?q=&limit=&cursor=` → `paginated(BookSummary)`. Mock 은 제목 부분 일치 8권 | `DATA_REQUIREMENTS.md` |
| **P2-BIP-14** (신규) | **보호자 프로필 갱신** `PATCH /v1/me` — 관계·타임존 저장 | `UpdateCaregiverRequest{displayName?, relationship?, timezone?}` → 갱신된 `MeResponse`. **아동 데이터가 섞이면 안 된다**(D-16) | `AUTH_REQUIREMENTS.md` · `DATA_REQUIREMENTS.md` |

### `P2-BIP-06` 신규 요구 4건 (D-A 에서 파생)

1. **instrument 응답 필수** — 선택형 문항까지 포함한 `OnboardingInstrument` 를 서버가 내려야 한다.
   Frontend 는 Trial 구간용 기본 instrument 만 가지며, 서버 값이 있으면 항상 서버 값을 쓴다.
2. **새 선택지 코드에는 `label` 을 함께 내려야 한다.** copy 모듈이 모르는 코드는 화면이
   **그리지 않는다** (사용자에게 machine key 를 보여주지 않기 위한 규칙). 문항도 마찬가지다.
3. **instrument 버전 호환은 서버 책임.** 제출·draft 에 `{code, version}` 이 함께 오므로,
   문항·선택지가 바뀐 뒤 과거 응답을 어떻게 해석/이관할지 서버가 정한다.
   Frontend 는 담아 보내기만 한다.
4. **닫힌 문항 id 집합.** `ChoiceQuestionId` 는 contracts 의 enum 이다. 서버가 **새 문항 id** 를
   추가하려면 contracts 릴리스가 필요하다(응답 저장 위치·값 schema 가 타입으로 묶여 있기 때문).
   선택지 추가·삭제·순서 변경·문항 삭제·문구 변경은 릴리스 없이 가능하다.

---

## 12. Scope 경계에서 보류한 항목

| 항목 | 사유 |
|---|---|
| `/onboarding/profile` · `/onboarding/growth-capability` | **Stage 2-B** (디자이너 Figma 대기) |
| `CapabilityDiamondChart` · `PersonaCard` · 다이아몬드 null 축 시각 표현 | 〃 |
| `ProfileResult` 화면 표시 | 〃 — Stage 2 는 parse 검증까지만 |
| 로그아웃 시 draft 삭제 **호출** | `OnboardingDraftStore.clear()` 는 준비됐다. 로그아웃 UI 는 `2-HOME`(D-7) |
| 질문지 **Q5 표지 그리드**(8권 프리셋, 2열 커버 썸네일) | 표지 이미지가 **Stage 3** 범위다 (Design Spec §4.3). Stage 2 는 같은 데이터(`homeBooks`)를 **제목 입력 목록**으로 수집한다 → §13 Non-blocking |
| 책 소유·증정·프롬프트 · 서재 | Stage 3 (D-17 경계) |
| `TextArea` · `StarRating` | Stage 5 |
| 역량 점수 산출 로직 신규 작성 | 서버 책임. contracts 기존 순수 함수만 재사용 |

---

## 13. 발견한 문제 / 결정 필요

### NEEDS_DECISION

| # | 항목 | 내용 |
|---|---|---|
| **N-1** | `S2-COPY-1` 소개 화면 문구 | `179:1763` / `179:1767` 대체 문구 미확정. 질문지 문서의 "~2.5 minutes · five questions" 는 **Q1~Q5 만** 센 값이라 그대로 쓸 수 없다(Step 1·Step 5 가 더 있다). 실제 소요 시간 측정 또는 기획 확정 필요. 현재 **빈 슬롯** |
| **N-2** | 질문지 문서의 Source of Truth 등재 | `HARU_Onboarding_Questionnaire_v1-1.docx.md` 가 `CLAUDE.md` Source of Truth 표에 없다 (approvals §8.3 이 이미 보고). 이 Step 으로 **온보딩 문항의 근거 문서**가 되었으므로 등재 여부 확인 필요 |
| **N-3** | 질문지 Q2 · Q1 · Q4 의 "Required" | 질문지 문서는 Q1 · Q2 · Q4 를 **Required** 로 적지만, 결정 **D-C** 는 Step 2~4 를 **전부 선택**으로 확정했다. **D-C 를 따랐다.** 추천 엔진 cold-start 품질과 트레이드오프이므로 기획 확인 권장 |
| **N-4** | 질문지 Q5 표지 그리드 | 위 §12 — Stage 3 에서 표지가 들어올 때 프리셋 그리드로 올릴지, 제목 입력만 유지할지 |

### Non-blocking (구현했으나 명세와 차이)

| # | 항목 | 내용 |
|---|---|---|
| **NB-1** | Design Spec §2.10 Step 2 의 **4축**(활동성·낯가림·집중 성향·선호 활동) | 결정 **D-A** 로 질문지 Q1·Q4 **2문항**으로 교체되었다. 질문지가 "temperament profiling 은 온보딩에서 하지 않는다"로 범위를 제한한다. 화면 **구조**(QuestionBlock × N + RadioGroup card)는 명세 그대로이며, 개수가 줄어도 화면 코드는 바뀌지 않는다 |
| **NB-2** | Design Spec §2.10 Step 2 "선호 활동 Chip multi-select" | 위와 같은 이유로 사라졌다. 복수 선택 Chip 패턴은 Step 1 언어 · Step 3 주제 · Step 4 목표에서 그대로 쓰인다 |
| **NB-3** | Design Spec §2.10 Step 4 "목표 항목이 4대 역량과 **같은 개념이 아니다**" | 결정 **D-B** 가 이를 **뒤집었다**. Design Spec 이 이 결정보다 앞선 문서다. §5 의 금칙 표현 테스트가 충돌 위험을 막는다 |
| **NB-4** | `/onboarding/:step` 의 TopBar 를 **feature 가 렌더**한다 | 제목이 단계마다 바뀌고 Step 5 는 문항 index 에 따라 "Question n of 10" + trailing 버튼이 생긴다. 정적 layout route 로는 표현할 수 없다. 시각 결과는 동일하며 `sticky` 만 적용되지 않는다 |
| **NB-5** | Step 5 `RadioGroup` 의 `<legend>` 를 시각적으로 숨김 | 카드 제목(h2)이 이미 문항을 말한다. 스크린리더에는 남는다 (`.haru-survey-options` CSS — 동의 화면과 같은 방식) |
| **NB-6** | `packages/ui` `RadioGroup` 에 `describedBy?` prop 추가 | Design Spec §2.10 Step 5 가 명시한 `aria-describedby`(비채점 caption)를 구현하기 위해서다. 기존 동작·테스트 영향 없음 (선택 prop) |
| **NB-7** | `books` 필드명 유지 | Q3 는 의미상 "interest area" 지만 `topicTags` 필드명을 유지했다 — `DATA_MODEL.md` §5 `children.topic_tags` 와의 불일치를 만들지 않기 위해서다. 코드 값만 교체했다 |

### Blocking

**없음.**

---

## 14. QA 가 확인할 지점 요약

1. **D-A 구조** — `ChoiceQuestionList.tsx` 에 문항 문자열이 0건인지 grep, 그리고
   "선택지를 줄인 instrument", "서버 문구 우선", "문항 없는 단계" 3 테스트.
2. **D-B 금칙 표현** — `copy-language.test.ts` 가 **copy 모듈 전체**를 훑는지 (함수형 문구 포함).
3. **Privacy** — `onboarding-screens.test.tsx` Trial 요청 로그 `[]`, e2e `/v1/` 요청 0건.
4. **D-9** — e2e 키보드 완주(포인터 드래그 0회) + 버튼 경로.
5. **Stage 2-B 미구현** — `ROUTES` · router · `entities/child` 에 프로필/다이아몬드/페르소나 없음.
6. **`AppColumn` 안쪽 스크롤 컨테이너 0건** — `onboarding.css` 의 `overflow: hidden` 1건은
   **시각 숨김(`sr-only`) 규칙 안**이다 (`.haru-survey-options .haru-radio-group__legend`,
   1×1 clip). `consent.css` 의 legend 숨김과 **같은 패턴**이며 스크롤 컨테이너를 만들지 않으므로
   그림자 클리핑(`27c9af4`)과 무관하다. `overflow-x/y: auto` 선언은 0건이다.
