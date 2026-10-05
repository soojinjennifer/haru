# Stage 2 온보딩 재구성 — 구현 Handoff (development-agent → stage-qa-agent)

**Status: 구현 완료 (2026-10-03)**

**근거 문서 (우선순위 순)**

1. `docs/decisions/stage-3-approvals.md` §11 전체 — 결정 정본
2. `docs/design/stage-2-onboarding-rework-design-spec.md` (APPROVED, 개정 2) — 구현 명세
3. `docs/plans/stage-2-onboarding-rework-plan.md` (APPROVED) — AC · contract 변경 범위
4. `docs/design/stage-2-design-spec.md` §16 개정 6 — 결함 3건 (`S2-FIX-1`~`3`)

---

## 1. 검증 명령 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **PASS** — root · `tsconfig.e2e.json` · config · design-tokens · contracts · ui · web 전부 `Done` |
| `pnpm lint` | **PASS** — 0 problems |
| `pnpm test` (vitest) | **PASS** — Test Files 99 passed, Tests **1067** passed |
| `pnpm lint:boundaries` | **PASS** — `no dependency violations found (456 modules, 1519 dependencies cruised)` |
| `pnpm build` | **PASS** — design-tokens + vite build 성공 |
| `pnpm format:check` | **PASS** — `All matched files use Prettier code style!` |
| (추가) `pnpm assert:no-mocks` | **PASS** — `VITE_API_MODE=http` 산출물에 Mock·dev sentinel 0건 |

`pnpm test:e2e` 는 **실행하지 않았다** — 시각 baseline 재생성은 QA 판단 사항이다 (아래 §7).

---

## 2. 회귀 가드 확인 (재구성 Design Spec §9.4)

| 가드 | 확인 방법 | 결과 |
|---|---|---|
| **`SwipeDeck.tsx` diff 0줄** (`QA-2-001` pointer capture 회귀) | `git diff --stat packages/ui/src/deck/SwipeDeck.tsx` | **빈 출력 = 0줄** |
| **`SwipeDeck.css` `overflow` 선언 0건** (`QA-1-L1` 그림자 절단) | `grep -n overflow` | **1건 매칭이지만 전부 주석** (`* 이 파일에는 overflow 선언이 없다`). 선언 0건. 단위 테스트 `rework-css-guards.test.ts` 가 주석 제거 후 0건을 고정 |
| **신규 토큰 1건만** | `git diff -U0 packages/design-tokens \| grep '^+\s*--'` | `--layout-cta-bottom-gap: calc(var(--spacing) * 11)` **1건** |
| `--book-cover-sm-*` 미생성 (Stage 3 소관) | `grep -rn book-cover-sm packages apps` | **0건** |
| `RadioGroup` 1줄 행 44 유지 | `rework-css-guards.test.ts` — `max(44, 20+12+12)=44` 산술 검산 | 고정됨 |
| 덱 기하 토큰(`--deck-inset-x` · `--deck-peek-y` · `--deck-depth`) 무변경 | 같은 테스트 | 고정됨 |
| `apps/api/` · `supabase/` 미생성 | `ls apps` → `web` 만 / `ls supabase` → 없음 | **확인** |

---

## 3. 변경 파일 수

| 구분 | 수 | 비고 |
|---|---|---|
| 추가(코드) | **9** | `rework-css-guards.test.ts` · `features/auth/model/childDraft.ts` · `features/onboarding-survey/model/childInfo.ts`(재공개) · `ui/SurveyCardDeck.tsx` · `ui/ChoiceQuestionCard.tsx` · `ui/CapabilityItemCard.tsx` · `ui/FavoriteBooksCard.tsx` · `pages/onboarding/OnboardingStartPage.tsx` · `shared/copy/child-copy.ts` |
| 추가(문서) | **1** | `docs/qa/stage-2-rework-handoff.md`(이 파일) |
| 수정 | **62** | contracts 10 · packages/ui 14 · design-tokens 1 · apps/web 34 · e2e 3 |
| 삭제 | **4** | `ui/ChoiceQuestionList.tsx` · `ui/BooksStep.tsx` · `ui/CapabilityItemsStep.tsx` · baseline `s2-onboarding-step5.png` |
| 이동(rename) | **4** | contracts 3 (`temperament`→`reading-together` · `goals`→`growing-together` · `books`→`books-and-interests`) + `features/.../model/childInfo.ts` → `shared/lib/child-info.ts` |

> 같은 세션에서 사용자가 병행 수정 중인 파일(`CLAUDE.md` · `PLANNING.md` · `docs/source/HARU_PRD_v1.5.md` · `docs/plans/stage-*-plan.md` · `docs/ARCHITECTURE.md` · `.claude/agents/*` · `docs/decisions/stage-3-approvals.md` · `docs/design/stage-2-design-spec.md`)은 **건드리지 않았다.**

---

## 4. contracts 변경 필드 목록

### 4.1 `enums/onboarding-step.ts`

`temperament` → **`reading_together`** · `books` → **`books_and_interests`** · `goals` → **`growing_together`**.
`child_info` · `capability_items` 유지. **배열 길이 5 유지** → `OnboardingState.steps.length(5)` 검증 변경 없음.

### 4.2 파일·schema rename

| 이전 | 현재 |
|---|---|
| `onboarding/temperament.ts` · `TemperamentAnswersSchema` · `TemperamentAnswers` | `onboarding/reading-together.ts` · `ReadingTogetherAnswersSchema` · `ReadingTogetherAnswers` |
| `onboarding/goals.ts` · `GoalsAnswersSchema` · `GoalsAnswers` | `onboarding/growing-together.ts` · `GrowingTogetherAnswersSchema` · `GrowingTogetherAnswers` |
| `onboarding/books.ts` · `BooksAnswersSchema` · `BooksAnswers` | `onboarding/books-and-interests.ts` · `BooksAndInterestsAnswersSchema` · `BooksAndInterestsAnswers` |

`answers.ts`(draft · complete) · `save-step.ts`(discriminator literal 5종) 키도 함께 rename.
`children/child.ts` 의 `topicTags` · `growthGoals` **필드명은 유지** (DATA_MODEL 컬럼과 1:1 — Plan §7.2).

### 4.3 신규 필드 · 상수

| 위치 | 항목 | 내용 |
|---|---|---|
| `onboarding/books-and-interests.ts` | **`ownedBooks`** | `z.array(IdSchema).max(OWNED_BOOKS_MAX)` — 질문지 Q5 `child.owned_books` |
| 〃 | **`OWNED_BOOKS_MAX = 10`** | RECOMMENDED 안전 상한. 문항 자체는 **무제한 복수 선택**(`maxSelections` 없음 — `§11.11`) |
| `children/child.ts` | **`ownedBooks`** | `z.array(IdSchema)` — 프로필 결과가 돌려주는 값 |
| `onboarding/instrument.ts` | **`ChoiceQuestionIdSchema` + `books_and_interests.owned_books`** | 5종으로 확장 |
| 〃 | **`OnboardingEstimatesSchema`** | `{ profileMinutes: int≥1, surveyMinutes: int≥1 }` |
| 〃 | **`OnboardingInstrumentSchema.estimates`** | 소개 화면 숫자의 출처 (`R-03`) |
| 〃 | **`createOwnedBooksQuestion(options)`** | 선택지 < 2 면 `null` → Q5 카드가 사라진다 |
| 〃 | **`buildOnboardingQuestions(ownedBookOptions?)`** | 고정 4문항 + 카탈로그 기반 Q5 조립 (단일 조립 지점) |
| 〃 | `ONBOARDING_INSTRUMENT_VERSION` | `1.1.0` → **`2.0.0`** (`code` 는 `onboarding_v1_1` 유지) |
| 〃 | `QUESTION_VALUE_SCHEMAS` | `owned_books` → `IdSchema` |
| 〃 | `ONBOARDING_CHOICE_QUESTIONS` | step rename · `order` 재배치(Q3=1 · Q5=2 · Q2=1) · `maxSelections` 를 상수 참조로 |
| 〃 | `readChoiceAnswer` · `applyChoiceAnswer` | 새 id 5종 case. **로직 동일** |

### 4.4 제거 필드

| 항목 | 사유 |
|---|---|
| `homeBooks` (필드) | `§11.9` — Q5 가 그 자리를 대신한다 |
| `HomeBookSchema` · `HomeBook` (타입) | 〃 |
| `HOME_BOOKS_MAX` (상수) | 〃 |

**유지 확인**: `FAVORITE_BOOKS_MAX = 5` · `FavoriteBookSchema.bookId`(선택 필드) · `GET /v1/books/search` contract 전체(`books/search.ts` 무변경 — Stage 3 Library 소관) · `SignUpWithEmailInput` **`.strict()`**(아이 필드 0건).

### 4.5 Error code

**신규 0건.** 기존 `VALIDATION_FAILED` · `CONSENT_REQUIRED` · `ONBOARDING_INCOMPLETE` 로 충분하다 (Plan §7.7).

---

## 5. 삭제한 것 (`§11.13` — "안 그리는 것이 아니라 지우는 것")

### copy (`onboardingCopy.books`)

제거: `searchLabel` · `searchClear` · `searchLoading` · `searchFailed` · `tryAgain` · `emptyTitle` · `emptyDescription` · `addTyped` · `homeSection` · `homeLabel` · `homeAdd` · `homeListLabel`.
유지·변경: `favoritesSection`(섹션 라벨 `BOOKS YOUR CHILD LOVES` → **문항 문구 `Books your child loves`**, `§11.14`) · `favoritesHint`·`limitReached`(상한 숫자를 **함수 인자**로) · `remove` · `selectedLabel`.
`homeAdd` 의 문자열 `'Add'` 는 **`addAction`** 키로 재사용했다.

> ⚠ 문서 내부 모순: §6.2 제거 목록은 `homeAdd` 를 제거 대상으로, §8.3 은 "`Add` 액션으로 재사용 — 유지" 로 적는다. `home*` 키가 남으면 dead-code grep 에 걸리므로 **키는 제거하고 문자열만 중립 키로 옮겼다.**

그 외 copy 변경: `intro` → **`intro.profile` / `intro.survey` 2벌 분리** · `wizard.stepOf` 제거(§3.3 "`Step n of 5` caption 제거") · `wizard.requiredBlockedReason` 을 **계수형 → 카드 1장 기준 단문**으로(카드 안쪽 1행이므로) · `steps.capability_items` → **`Capability`** · `survey.deckLabel` `Baseline questions` → **`Onboarding questions`**(4단계 공용) · `survey.cardAnnouncement` 신규 · `childInfo` 는 `shared/copy/child-copy` 를 가리킨다.

### UI

- 검색 `TextField` · 결과 `ListGroup`/`ListRow(subtitle=author)` · `EmptyState` · 로딩 `Skeleton` · 검색 실패 `InlineAlert` + 재시도 — **전부 삭제**
- `Books at home` 블록 전체 — **삭제**
- `ui/BooksStep.tsx`(230줄) → `ui/FavoriteBooksCard.tsx` 로 **대체**
- `ui/ChoiceQuestionList.tsx`(세로 목록 레이아웃) → `ui/ChoiceQuestionCard.tsx` 로 **대체**
- `ui/CapabilityItemsStep.tsx`(덱 로직 보유) → `ui/SurveyCardDeck.tsx` + `ui/CapabilityItemCard.tsx` 로 **분리**
- 카드 단계 하단 CTA 블록 — **제거** (마지막 카드에만 제출 CTA)
- `ProgressBar` 아래 `Step n of 5` caption — **제거**

### API 호출

- 온보딩 경로의 `useBookSearch()` 호출 — **제거**. `entities/book/useBookSearch.ts` 파일 자체는 **남겼다** (Stage 3 Library 소관이며 `GET /v1/books/search` contract 와 Mock Adapter 는 유지 대상이다). 현재 온보딩에서 호출하는 곳은 0건이다.

### Mock

- `book-search-empty` 라는 **온보딩 전용 시나리오는 애초에 없었다** — `books` 그룹의 공통 `empty` 키가 그 역할이었고, 그 키는 `books` 그룹(Stage 3 Library)에 **그대로 남겼다**. 온보딩에서 `books` 그룹을 쓰는 경로가 0건이 된 것이 이번 변경이다.
- `MockBooksApi` 무변경.

### contracts

`homeBooks` · `HomeBookSchema` · `HOME_BOOKS_MAX` (§4.4).

---

## 6. 구현 범위별 상세

### A. 설문 4단계 × 16카드

| 항목 | 구현 |
|---|---|
| step slug | `ONBOARDING_STEP_SLUGS` = `child-info` · `reading-together` · `books-and-interests` · `growing-together` · `capability-items`. 배열 길이 5 유지 |
| 한 카드 = 한 문항 | `model/instrumentView.ts` **`surveyCards(instrument, steps)`** 가 카드 3종(`choice` · `favorite-books` · `capability-item`)으로 평탄화. `SwipeDeck` 은 앞 카드 1장만 렌더하므로 동시에 2문항이 보이는 경우가 **구조적으로 0건** |
| 카운터 | `copy.survey.counter(cardPosition(allCards, key), allCards.length)` — **전부 파생값**. copy 에 숫자 리터럴 0건 |
| 화면 제목 | `copy.steps.capability_items = 'Capability'` |
| Q5 | `CheckboxGroup variant="card"` 제목 목록. 8권 제목은 **instrument 선택지 `label`** 로 내려오고 그 출처는 `mocks/fixtures/books.ts` 의 `MOCK_BOOKS` 다. contracts·화면·copy 에 책 제목 0건 |
| favorites | 검색 없음. 제목 입력 + 선택 목록(상한 `FAVORITE_BOOKS_MAX`). 문항 문구 `Books your child loves`. 입력 필드는 `TextField labelHidden`(접근성 이름 = 카드 문항과 **같은 문자열**, 보이는 라벨 없음, `placeholder` 미사용) |
| `Books at home` | contracts·copy·UI 전부 삭제 (§5) |
| ProgressBar | `segments={cardCountsByStep(allCards, CARD_STEPS)}` — 비율 배열이 파생값이다. `aria-valuetext` = `{단계 제목} · {n} of N` |

**★ 카드 총수가 구간에 따라 다르다 (설계상 의도, QA 판정 주의)**

| 구간 | instrument | 카드 수 |
|---|---|---|
| Trial (미인증) | `DEFAULT_ONBOARDING_INSTRUMENT` — Q5 **없음** | **15** |
| 인증 + 동의 (Mock `GET /v1/onboarding`) | Q5 포함 | **16** |
| `onboarding:owned-books-empty` | Q5 선택지 0 | **15** |
| `onboarding:instrument-v2` | 문항 2개 | **13** |

이유: Q5 의 선택지가 **책 카탈로그 데이터**이고 Trial 구간은 서버 요청이 0건이어야 하므로(`AC-2-27`) 카탈로그를 받아올 수 없다. 설계 명세가 "카드 수는 전부 파생값"(§3.3 · §10-3)이고 `owned-books-empty` 상태에서 "Q5 카드를 건너뛴다(16 → 15)"를 이미 규정하므로, Trial 은 같은 메커니즘이 적용된 결과다. **§8-1 에 명세 질의로 올렸다.**

### B. 카드 단계 CTA 제거 (`S2R-OPEN-4`)

- 카드 단계에서 하단 CTA 블록을 렌더하지 않는다. 전진 = 좌 스와이프 · TopBar `chevron-right` · 단일 선택 자동 전진.
- **마지막 카드**(전체 마지막 = `capability_items` 마지막 문항)에서만 제출 CTA (Trial `Save profile` / 인증 `Finish`).
- 필수 미응답 차단: `chevron-right` 에 **`aria-disabled="true"`**(native `disabled` 아님) + **카드 안쪽** 옵션 아래 1행 사유(`Answer this one to move on.`, `--text-caption-1`/secondary, 오류 톤 아님).
  - 이를 위해 `IconButton` 이 호출부의 `aria-disabled` 를 존중하도록 고쳤다 (기존에는 `...rest` 뒤에서 덮어써 무효였다).
- 해제 IconButton: `SurveyQuestionCard` 에서 **counter flex row 밖으로 빼내 absolute** (`.haru-survey-card__clear`, inset 12/12). counter 행이 16px 1줄로 돌아가 **22px 회수**.

### C. 자동 전진

| 항목 | 구현 |
|---|---|
| 대상 | **단일 선택 카드만** — Q1 · Q4 · Baseline 10. 복수 선택 3장(Q2·Q3·Q5) + favorites 는 수동 |
| 대기 | `AUTO_ADVANCE_DELAY_MS = 400` = **기존 `--motion-duration-slow`(400ms) 재사용**. 두 값의 일치를 단위 테스트가 고정 |
| `prefers-reduced-motion` | `SwipeDeck.css` 가 슬라이드만 끈다(기존 규칙). **대기는 유지** |
| ★ 재방문 카드 | `SurveyCardDeck` 의 `visited: Set<cardKey>` — 자동·수동 어느 경로로든 **떠난 카드**는 기록되고, 그 카드에서는 자동 전진이 **일어나지 않는다** (§14.2-3) |
| ★ 키보드 선택 | `onPointerDownCapture` / `onKeyDownCapture` 로 **마지막 입력 종류**를 기록하고 포인터일 때만 전진한다. 방향키 탐색 중 카드가 넘어가지 않는다 (§14.3) |
| 포커스 | 전진 후 `requestAnimationFrame` 에서 `.haru-swipe-deck__card--front` 의 **첫 입력 요소**로 이동 |
| 알림 | `SwipeDeck` 의 기존 `aria-live="polite"` 영역에 `{단계 제목} · {n} of N` 을 넘긴다. **라이브 영역을 두 개 두지 않았다** (위저드에 별도 region 을 두면 중복 낭독) |
| 해제 | 전진을 유발하지 않는다 |

### D. About your child (`R-01` Privacy Critical)

| 항목 | 구현 |
|---|---|
| 입력 위치 | `/auth/sign-up` 에 `YOUR CHILD` 섹션(이름 · 성 · 생년월 · 성별) 추가 |
| 전송 | `signUp` 요청 body 에 **아이 필드 0건**. `SignUpWithEmailInput.strict()` **유지**, 아이 필드 미추가 |
| 로컬 경로 | `features/auth/model/childDraft.ts` → 기존 **`OnboardingDraftStore` 한 경로만** 통과 (신규 저장소 0건). 기존 draft 가 있으면 `instrument` 참조·`currentStep` 을 보존하고 `child_info` 만 합친다 |
| 진행 조건 | 아이 필드는 **가입 진행 조건이 아니다**. 비어 있어도 계정을 만들 수 있고 `About your child` 가 `missing-prefill` 로 받는다. 단 생년월이 3~9세 밖이면 **가입 화면에서** 필드 에러 (`validateChildDraftFields`) |
| 표시 ↔ 편집 | `display` = 행 전체가 `<button>`(label + value + Tag) · `edit` = 기존 `TextField`/`SelectTrigger`. **`<input readonly>` 0건** |
| 전환 경로 | 섹션 헤더 우측 `IconButton(pencil)`(발견 가능성) ↔ `TextLink "Done"`, 행 탭(도달 경로). draft 값이 없으면 **처음부터 edit** |
| 나이 | `3yr 4mo` 클라이언트 파생. `Tag accessibleLabel` = `3 years 4 months`(비대화형, `aria-hidden` 아님) |
| Trial 안내 | `TrialNotice isTrial` — **미로그인일 때만** 렌더 |
| 로그아웃·삭제 | 같은 `OnboardingDraftStore` 를 `features/settings/model/useSignOut` 이 `clear()` 하므로 **이 값도 함께 사라진다** (기존 메커니즘 재사용, 코드 변경 0건) |

**공유 경계**: 같은 필드를 두 feature 가 쓰게 되어 `features/onboarding-survey/model/childInfo.ts` 의 순수 함수를 **`shared/lib/child-info.ts`** 로, 문구를 **`shared/copy/child-copy.ts`** 로 옮겼다 (feature 간 직접 import 금지 — `rules/architecture.md` §3). feature 쪽 `model/childInfo.ts` 는 재공개 지점으로 남겨 기존 import 경로를 유지한다. `pnpm lint:boundaries` 통과.

### E. 결함 3건

| ID | 구현 |
|---|---|
| `S2-FIX-1` | `--layout-cta-bottom-gap: calc(var(--spacing) * 11)`(44, Tier-2) 신설 → `AppColumn bottomGap` prop + `.haru-app-column--bottom-gap { padding-block-end: max(safe-bottom, 44) }` → `AppShell bottomGap?: 'safe' \| 'cta'` → **`StackLayout` 이 항상 `'cta'`**. `StackLayout` footer 슬롯 `pb-6` 제거(이중 계산). `AppColumn` 기본 규칙 무변경(`FramePage` baseline 보호) |
| `S2-FIX-2` | `RadioGroup.css` `.haru-radio-group__option` 에 `padding-block: var(--space-3)` 추가. **1줄 = `max(44, 20+12+12)` = 44 불변**, 2줄 64 · 3줄 84. `CheckboxGroup variant="card"` 도 같은 기하. Step 5 비채점 행 구분선을 행 박스 **바깥 `::before`** 로 이동(`padding-block-start` 제거) |
| `S2-FIX-3` | `SwipeDeck.css` 의 표면 선언(padding/background/radius/shadow/backdrop + `@supports` · `prefers-reduced-transparency` fallback)을 **`--behind` 로 이동**. `--front` 는 position/z-index/touch-action/transform/transition/animation 만. 앞 카드 표면은 `renderItem`(= `SurveyQuestionCard` 의 `Surface padding="6"`) 소유 → 흰 면 **3겹**, 내부 여백 44 → **24**, 내부 폭 257 → **297**. dev gallery `s2-deck` 데모를 `Surface` 로 감쌌다 |

> `S2-FIX-3` 명세 ④ 는 "`renderItem` 이 표면을 소유한다는 계약을 **`SwipeDeck` 의 JSDoc**에 명시" 를 요구하지만, 그러면 `SwipeDeck.tsx` diff 가 0줄이 아니게 된다. **회귀 가드(diff 0줄)를 우선**해 계약을 `SwipeDeck.css` 헤더 주석에 적었다.

---

## 7. Mock 시나리오

### 전환 방법

```
?scenario=<group>:<key>          예: /onboarding/child-info?scenario=onboarding:missing-prefill
?scenario=<key>                  그룹 생략(wildcard)
dev Scenario Panel (`import.meta.env.DEV`)  — 같은 해석기를 공유한다
```

### `onboarding` 그룹 (4종 신규)

| key | 재현 | 검증 대상 |
|---|---|---|
| `prefilled-child-info` | 서버 draft 에 `child_info` 가 있는 상태로 `About your child` 진입 | 표시 전용 행이 값을 읽는지 (`R-01` A · `AC-2R-06`) |
| `missing-prefill` | 서버 draft 에 `child_info` 가 **없는** 상태 | 빈 표시 전용 행 데드락 방지 — 인라인 편집 fallback (`R-08`) |
| `instrument-v2` | 문항 2개 + 버전 `2.1.0` 의 instrument | 카드 수·소요 시간·ProgressBar 구간이 **파생값**인지 (`AC-2R-09`) |
| `owned-books-empty` | Q5 카탈로그 0건 | Q5 카드가 사라지고 카드 수가 줄어드는지 (EMPTY) |

기존 키 유지(데이터만 갱신): `success` · `loading` · `error` · `retry` · `offline` · `consent-missing` · `vpc-pending` · `vpc-failed` · `onboarding-incomplete` · `draft-resume`(`currentStep` = `books_and_interests`, `completedSteps` = `child_info`·`reading_together`) · `persona-fallback` · `child-limit-reached` · `capability-all-missing`.

공통 5종(`SUCCESS` · `LOADING` · `EMPTY` · `ERROR` · `RETRY`)은 각 그룹에서 그대로 재현되며 결정적이다 (`Date.now()`·`Math.random()`·`setTimeout` 직접 호출 0건 — `mock-source-rules.test.ts` 가 고정).

### 시각 baseline (QA 판단 사항)

**`pnpm test:e2e:update` 를 실행하지 않았다.** `e2e/visual.spec.ts` 를 명세 §11.1 에 맞춰 갱신만 했다.

| 처리 | 대상 |
|---|---|
| 폐기(파일 삭제 완료) | `s2-onboarding-step5.png` |
| 신규 테스트 추가 (스냅샷 파일 **없음** → QA 가 1회 생성) | `s2-onboarding-start` · `s2-onboarding-childinfo-trial` · `s2-onboarding-childinfo-edit` · `s2-deck-reading-together` · `s2-deck-books-q3` · `s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability` |
| 재생성 필요 (기존 파일 존재, `S2-FIX-1` 44 인셋으로 전부 변함) | `s2-signup` · `s2-onboarding-intro` · `s2-welcome` · `s2-login` · `s2-consent` · `s2-vpc-failed` · `s2-onboarding-saved` · `s2-deck` · `v5-field`(`S2-FIX-2`·`S2-FIX-3` 영향) + `frame-*`(영향 없음 예상, 확인 필요) |

명세 §11.1 의 신규 10건 중 `s2-onboarding-childinfo`(안내 **없음** 상태, `R-07` B)는 **추가하지 않았다** — 인증 세션이 필요해 `completeOnboardingToSaved` 수준의 긴 흐름을 또 타야 하고, 같은 상태를 단위 테스트(`Trial 안내는 미로그인일 때만 나온다`)가 이미 고정한다. QA 판단에 올린다.

---

## 8. 구현하며 발견한 명세 문제 (고치지 않고 보고)

### 8-1. ★ Trial 구간에는 Q5 가 불가능하다 → 카드가 15장이다

`§11.16` 은 카드 **16장**을 확정했지만, Q5 선택지는 **책 카탈로그 데이터**이고 Trial 구간은 서버 요청이 0건이어야 한다(`C-12` · `AC-2-27`). 기기에 카탈로그를 둘 수도 없다 — 8권 제목은 `mocks/fixtures/books.ts` 소유이고(`§11.11`) `features` 가 `mocks` 를 import 하면 production 번들에 Mock 이 샌다(`AC-1-42` · `assert:no-mocks`).

**현재 구현**: Trial = 15장 · 인증+동의 = 16장. 카드 수가 파생값이므로 화면은 자동 추종한다.
**영향**: `AC-2R-08`(통산 카운터) 검증 시 분모가 구간에 따라 다르다. 명세 §5 의 세로 예산(16장 기준)은 상한이므로 위반이 아니다.
**선택지**: ① 현재 동작 수용(카드 수 파생 원칙과 일치) ② Q5 를 `child_info` 뒤 서버 구간으로 한정 ③ 카탈로그를 `shared` 에 bundle (fixture 소유 원칙 위반) ④ Trial 에도 `GET /v1/books` 허용 (요청 0건 원칙 위반).

### 8-2. 동의 직후 착지 화면이 `/onboarding/start` 가 아니다

명세 §1 흐름은 `/auth/consent → /onboarding/start` 다. 그러나 현재 `GuardianConsentPage` 는 `ROUTES.home` 으로 보내고 `resolveGuardDecision` 이 **`/onboarding`**(설문 소개)으로 리다이렉트한다. Guard 를 `/onboarding/start` 로 바꾸면 **중도 복귀 사용자의 resume 경로가 깨진다**(`/onboarding` 이 "Pick up where you left off" 를 담당한다).
**현재 구현**: Guard·consent 네비게이션을 **변경하지 않았다** (오케스트레이터가 제시한 A–E 범위 밖). `/onboarding/start` 는 route 로 등록되어 직접 진입·`goBack` 경로로 동작한다.
**필요 결정**: ① Guard 목표를 `start` 로 변경 ② consent 성공 시 `start` 로 직접 이동 ③ 현재 유지.

### 8-3. §6.2 ↔ §8.3 모순 — `copy.books.homeAdd`

§6.2 제거 목록에 `homeAdd` 가 있고 §8.3 은 "유지(`Add` 액션으로 재사용)" 로 적는다. `home*` 키를 남기면 §17-10 의 dead-code 기준에 걸리므로 **키 제거 + 문자열을 `addAction` 으로 이전**했다.

### 8-4. `About your child` 생년월 표시 형식

Figma `244:1199` Row B 는 `March. 2023` 이지만, 현행 구현은 결정 `D-10` 에 따라 월을 **숫자**(`01`~`12`)로 다룬다(로캘 월 이름 문자열이 copy 에 없다). 표시 전용 행은 **`2021-04`** 형태로 렌더했다. 월 이름 12종은 신규 문구이므로 만들지 않았다 → 허용 차이 등록 또는 문구 결정 필요.

### 8-5. §16.2 미결 2건은 구현하지 않았다

- `S2R-OPEN-7` — Figma `179:1745` 한 줄 동의 체크박스. 문구가 법무·기획 보류이므로 **렌더하지 않았다**(§17-9 "미결 항목은 구현하지 마라"). §7.2 표는 이 체크를 "화면 진행 조건" 으로 적지만 승인된 문자열이 없다.
- `S2R-OPEN-9` — A안(보이는 라벨 없음)으로 구현했다(§17-9 지시).

### 8-6. `S2-FIX-3` ④ 의 JSDoc 요구 ↔ `SwipeDeck.tsx` diff 0줄 가드 충돌

§6 E 표의 각주 참조. 가드를 우선했다.

### 8-7. `SurveyCardDeck` 파일 구성이 §8.3 과 다르다

§8.3 은 `CapabilityItemsStep.tsx` 를 "Baseline 전용분만 남긴다", `BooksStep.tsx` 를 "favorites 카드로 축소" 로 적는다. 실제로는 **카드 1장 단위 컴포넌트**가 되었으므로 이름을 `CapabilityItemCard.tsx` · `FavoriteBooksCard.tsx` 로 바꾸고 `ChoiceQuestionCard.tsx` 를 더했다 (`*Step` 이라는 이름이 더 이상 사실과 다르다). 기능 범위는 명세와 같다.

### 8-8. `OWNED_BOOKS_MAX` ↔ "무제한 복수 선택"

`§11.11` 은 Q5 를 **무제한**으로 규정하고 Plan §7.4 는 `OWNED_BOOKS_MAX`(8~10, RECOMMENDED)를 요구한다. 문항 정의에는 `maxSelections` 를 **두지 않고**(화면이 상한을 모른다) 저장 schema 에만 `max(10)` sanity bound 를 걸었다. 카탈로그가 10권을 넘기면 조정이 필요하다.

### 8-9. `CheckboxGroup variant="card"` dev gallery 데모 미추가

`C-13 ①` 은 "만들고 **사후 디자이너 확인**" 이다. gallery 에 데모를 넣으면 `v5-field` baseline 이 또 바뀌므로 추가하지 않았다. 디자이너 확인은 `s2-deck-books-q3` · `s2-deck-growing-together` baseline 으로 가능하다.

---

## 9. `BACKEND_INTEGRATION_PENDING` 예상 항목

### 신규 (Plan §10.1)

| ID | 요구 | Handoff 문서 |
|---|---|---|
| `P2-BIP-12` | instrument 단계 체계 마이그레이션 — `onboarding_v1_1 / 1.1.0` 응답의 step 키를 `2.0.0` 체계로 해석 | `DATA_REQUIREMENTS.md` |
| `P2-BIP-13` | `owned_books` 후보 풀 제외 + 유사 프로필 책 첫 3세션 가중 하향 | `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| `P2-BIP-14` | cold-start state vector 산출 (`comfort_zone` · `axis_weights` · `interest_weights` · `channel` · `owned_books` · `age_months`) | `BACKEND_HANDOFF.md` |
| `P2-BIP-15` | `depends_on_the_day` · `not_sure_yet` 처리 (중간 등급 기본값 + 3세션 후 재보정 / 관심 가중 미적용) | `BACKEND_HANDOFF.md` |
| `P2-BIP-16` | instrument `estimates` 제공 — 소요 시간을 서버가 내려준다 | `BACKEND_HANDOFF.md` |
| `P2-BIP-17` | 가입~동의 사이 **로컬 보관 아동 데이터의 서버 측 보호** — `submit` 1회 수신분에 대해 동의 기록 존재를 서버가 강제 | `AUTH_REQUIREMENTS.md` · `DATA_REQUIREMENTS.md` |
| **`P2-BIP-18`** (신규 발견) | **Q5 책 카탈로그 제공** — `GET /v1/onboarding` 이 `instrument.questions[owned_books].options` 에 `{code: book_id, label: title}` 을 내려줘야 한다. Frontend 는 이 값만 렌더하며 책 제목을 보유하지 않는다 | `BACKEND_HANDOFF.md` |
| **`P2-BIP-19`** (신규 발견) | **`children.owned_books uuid[]` 컬럼** — `ProfileResult.child.ownedBooks` 의 저장 위치 | `DATA_REQUIREMENTS.md` |

### 범위가 넓어진 기존 항목

- `P2-BIP-03`(서버 측 동의 강제) — Create account 단계부터 아동 데이터가 **클라이언트에 존재**하므로 서버는 `submit`·`PUT steps` 양쪽에서 동의를 확인해야 한다.
- `P2-BIP-06`(instrument 버전 호환) — `P2-BIP-12` 로 구체화.

---

## 10. Scope 경계에서 보류한 항목

| 항목 | 사유 |
|---|---|
| `GET /v1/books/search` contract·Mock Adapter·`useBookSearch` 파일 | **Stage 3 Library 소관** (`§11.13` · §17-11). 온보딩에서의 호출과 UI 만 제거 |
| `--book-cover-sm-width/height` | **Stage 3 소관** (`§11.11`) — 선행 구현 금지 |
| `ListRow` media 슬롯 | 〃 |
| Figma `179:1745` 한 줄 동의 체크 | `S2R-OPEN-7` 법무·기획 보류 (§8-5) |
| Guard / consent 착지 경로 변경 | §8-2 결정 대기 |
| `pnpm test:e2e:update` | QA 판단 사항 (§7) |
| `docs/API_CONTRACTS.md` · `docs/DATA_MODEL.md` 갱신 | Plan §7.8 은 설계 변경분을 **plan-agent 소관**으로 둔다. 이번 구현으로 확정된 contract 반영은 Stage 8 development-agent 작업이다 (`rules/workflow.md` §5) |

---

## 11. 구현 AC 매핑

| AC | 구현 위치 | 검증 |
|---|---|---|
| `AC-2R-01` | `shared/config/routes.ts` · `copy.steps` | 단위(4 slug 열림·제목) · e2e |
| `AC-2R-02` | `model/instrumentView.ts` `surveyCards` · `SurveyCardDeck` | 단위(`heading level 2` = 1개) · e2e |
| `AC-2R-03` | `SwipeDeck` 기하 토큰 무변경 | `rework-css-guards.test.ts` + e2e 측정(QA) |
| `AC-2R-04` | `ONBOARDING_CHOICE_QUESTIONS` + `buildOnboardingQuestions` | contracts 단위 |
| `AC-2R-05` | `features/auth/ui/SignUpForm.tsx` + `model/childDraft.ts` | 요청 로그 전수(`auth-screens` · `onboarding-screens`) |
| `AC-2R-06` | `ChildInfoStep` display 모드 | 단위(`prefilled` draft) |
| `AC-2R-07` | `validateChildDraftFields`(가입) + display↔edit(온보딩) | 단위 |
| `AC-2R-08` | `cardPosition` · `copy.survey.counter` | 단위 · e2e |
| `AC-2R-09` | copy 함수 슬롯 · `estimates` · `segments` 파생 | 단위(`copy-language` · `instrument-v2`) |
| `AC-2R-10` | instrument `required`/`selection`/`maxSelections`/`exclusive` 만 읽는다 | contracts 단위 + 화면 단위 |
| `AC-2R-11` | `/onboarding/start` route + `OnboardingIntro variant` | 단위 · e2e |
| `AC-2R-12` | `e2e/visual.spec.ts` | **QA 가 baseline 생성 후 판정** |
| `AC-2R-13` | `childDraft` 로컬 경로 + `findChildDataKeys` | 단위 |
| `AC-2R-14` | Trial 경로 요청 0건 | 단위 · e2e |
| `AC-2R-15` | Q5 `CheckboxGroup` + `ownedBooks` payload | 단위 (후보 풀 제외는 `P2-BIP-13`) |

**무효화된 기존 AC** (Plan §11.1): `AC-2-19` · `AC-2-21` · `AC-2-22` · `AC-2-23` · `AC-2-26` · `AC-2-56` · `AC-2-27`·`AC-2-28`(시작점 변경) — 대체 AC 로 검증. `AC-2-05` · `AC-2-13` 은 **강화**되어 유지.

---

# 부록 A — 수정 1건: 동의 직후 착지 경로 (`§11.19` 7-2)

**추가 구현 (2026-10-03, 본문 §8-2 의 결정 반영).** 본문은 그대로 두고 이 부록이 차이분을 기록한다.

## A-1. 결정과 구현 방식

**결정** (`docs/decisions/stage-3-approvals.md` §11.19): `/auth/consent` 통과 직후 — 저장된 draft 가 **없으면** `/onboarding/start`(프로필 안내), **있으면** 그 지점으로.

**구현**: `resolveGuardDecision` 의 **규칙 5 목적지만** 세분화했다. 다른 규칙(1 me 미해결 · 2 미인증 · 3 동의 누락 · 4 VPC · 6 온보딩 완료 · 7 allow)은 **건드리지 않았다**.

```
5. 온보딩 미완료 → options.onboardingResumePath ?? ROUTES.onboarding.start
```

| 파일 | 변경 |
|---|---|
| `apps/web/src/app/guards/resolveGuardDecision.ts` | `GuardOptions.onboardingResumePath?: string \| null` 신규. 규칙 5 목적지 = `resume ?? ROUTES.onboarding.start`. **순수 함수 유지** — 저장소를 모른다 (결정 `D-5`) |
| `apps/web/src/app/guards/useGuardDecision.ts` | **기존 `OnboardingDraftStore`** 를 읽어 경로로 바꿔 넘긴다. 신규 저장소·신규 플래그 **0건**. `onboardingResumePathFrom(store)` 를 export 해 순수 함수로 테스트 가능하게 했다. 저장소 읽기는 `onboardingStatus !== 'completed'` 일 때만 수행한다(비용 가드 — 판정이 아니다) |
| `apps/web/src/features/auth/model/childDraft.ts` | **`hasChildDraftValues()` 추가 + 빈 입력이면 저장하지 않는다** (아래 A-2) |

**"응답이 하나도 없는 draft" 는 중도 복귀로 보지 않는다** — 단계만 기록된 빈 draft 를 근거로 프로필 안내를 건너뛰면 사용자가 맥락 없이 카드 단계에 떨어진다 (`hasAnyAnswers` 로 판정).

## A-2. ★ 함께 고친 결함 — 빈 아이 섹션이 "중도 복귀" 로 읽혔다

`partialChildInfoAnswers` 는 **빈 폼에서도** `{ gender: null, languageEnvironment: [] }` 를 돌려준다. 그 값을 그대로 저장하면 아이 정보를 **아무것도 입력하지 않은** 사용자에게도 draft 가 생겨 Guard 가 중도 복귀로 판정하고 `/onboarding/start` 를 건너뛴다.
→ `saveChildDraft` 가 `hasChildDraftValues()` 로 **의미 있는 값(이름·성·생년월·성별 중 하나)** 이 있는지 보고, 없으면 **아무것도 쓰지 않는다**. `consent-screens.test.tsx` 의 전수 검사(가입 → 동의 → 착지)가 이 동작을 고정한다.

## A-3. 추가·수정한 테스트

### 신규 파일 2개

| 파일 | 내용 |
|---|---|
| `apps/web/src/app/guards/__tests__/onboardingResumePath.test.ts` | **7 케이스** — draft 없음 → `null` · 응답 없는 draft → `null` · 5단계 각각 → 해당 경로 · 카드 단계 응답만 있어도 복귀 |
| `apps/web/src/features/auth/model/__tests__/childDraft.test.ts` | **12 케이스** — 아래 A-4 |

### 수정

| 파일 | 내용 |
|---|---|
| `guards/__tests__/resolveGuardDecision.test.ts` | ① draft 없음 → `start`(`not_started`·`in_progress` 각각) ② 옵션 미지정·`null` → `start` ③ draft 있음 → **해당 step**(child-info · reading-together · capability-items) ④ **draft 분기가 규칙 2·3·4·6 을 바꾸지 않음** 전수 확인 ⑤ `PATHS` 에 `/onboarding/start` 추가 → 무한 리다이렉트 방지 전수에 draft 케이스 2종 포함 |
| `guards/__tests__/guard-integration.test.tsx` | `me:onboarding-incomplete` → `ROUTES.onboarding.start` |
| `__tests__/consent-screens.test.tsx` | 동의 기록 직후 착지 5곳 → `/onboarding/start` (draft 없음) |
| `e2e/consent.spec.ts` | 동의 완료 후 `/onboarding/start` |
| `e2e/support/onboarding.ts` | 동의 직후 Guard 가 **저장된 지점**(`/onboarding/capability-items`)으로 되돌린다 — 프로필 안내를 건너뛴다 |

> `e2e/onboarding.spec.ts:50` · `e2e/support/onboarding.ts:75` 의 `/onboarding$` 두 곳은 **위저드 네비게이션**(child-info `Next` → 설문 소개)이라 Guard 변경과 무관하다. 그대로 둔다.

## A-4. `childDraft` 테스트 4종 (`R-01` Privacy Critical — Orchestrator 지적 공백)

| # | 고정 내용 | 케이스 |
|---|---|---|
| 1 | **네트워크 호출 0건** | `fetch` stub 이 `saveChildDraft`·`readChildDraft` 양쪽에서 호출되지 않음 + 저장 키가 `haru.onboarding.draft.v1` **1개뿐** (신규 저장소 0건) |
| 2 | **저장 → 읽기 왕복 보존** | 값 동일 · `OnboardingDraftSchema` 통과(`instrument.code`·`currentStep`·`updatedAt` 확인) · 기존 draft 의 instrument 참조·진행 단계·다른 단계 응답 보존 · 재저장 시 입력 필드만 갱신 · **빈 입력이면 draft 미생성**(A-2) |
| 3 | **`clear()` 후 정리** | `readChildDraft` → `undefined` · 저장소 키 0개 · 남은 값에 아이 이름 문자열 0건 |
| 4 | **가입 payload 아이 필드 0건** | `MockAuthGateway.signUpWithEmail` 호출 후 `findChildDataKeys(requestLog)` → `[]`. 같은 값이 **로컬에는 있음**을 함께 단정해 "분리 성립"을 증명. 추가로 `CHILD_DATA_KEYS` 가 `firstName`·`lastName`·`birthYearMonth`·`gender` 를 실제로 덮는지(검사기 자체의 회귀 방지) 확인 |

**결과: 12/12 PASS.**

## A-5. 수정 후 검증 (6/6 PASS)

```
pnpm typecheck      PASS
pnpm lint           PASS (0 problems)
pnpm test           PASS — Test Files 101 passed / Tests 1094 passed  (수정 전 99 / 1067)
pnpm lint:boundaries PASS — no dependency violations (458 modules, 1533 deps)
pnpm build          PASS
pnpm format:check   PASS
```

회귀 가드 재확인: `SwipeDeck.tsx` diff **0줄** · `SwipeDeck.css` `overflow` 선언 **0건** · 신규 토큰 **1건(`--layout-cta-bottom-gap`)** · `book-cover-sm` **0건** · `apps/api`·`supabase` **미생성**.

## A-6. 새로 발견한 문제

**A-6-1. `app/guards` → `features/onboarding-survey` 의존이 새로 생겼다.**
`useGuardDecision` 이 `pathForStep` · `hasAnyAnswers` 를 feature 공개 진입점에서 가져온다. 레이어 방향(`app → features`)은 적법하고 `lint:boundaries` 도 통과하지만, **Guard 가 온보딩 feature 를 알게 된 것**은 설계상 새 결합이다. 대안은 `pathForStep` 의 step↔slug index 매핑을 `shared/config/routes` 로 내리는 것인데, 그러면 "순서의 출처는 contracts `OnboardingStep` 하나" 규칙(`model/steps.ts`)을 shared 로 옮기는 더 큰 변경이 된다. **현재 구조 유지로 두고 QA 판단에 올린다.**

**A-6-2. 동의 직후 착지가 `/onboarding/start` 가 되면서 `Pick up where you left off` CTA 의 노출 경로가 줄었다.**
draft 가 있으면 Guard 가 **저장된 step 으로 직행**하므로, 그 버튼은 이제 ① 사용자가 첫 카드에서 뒤로 가 `/onboarding` 에 도달할 때 ② 직접 URL 진입 시에만 보인다. 결정 §11.19 의 문구("기존 resume 경로 유지")가 **버튼 유지**를 뜻하는지 **목적지가 그 지점이라는 뜻**인지 두 해석이 가능해, Orchestrator 지시문의 테스트 요구("draft 있음 → **해당 step**")를 따라 후자로 구현했다. 버튼 자체는 그대로 남아 있다.

**A-6-3. `features/auth` 가 `child_info` draft 를 쓰는 시점이 "제출 직전" 이다.**
가입 요청이 실패해도 아이 값은 이미 로컬에 남는다(입력 보존 목적이며 Trial 과 동일한 성격이다). 서버로는 나가지 않으므로 `AC-2R-13` 위반은 아니지만, "계정을 만들지 않고 떠난 사용자의 기기에 아이 이름이 남는다"는 사실은 **데이터 관리 UI(Stage 8, C-15)** 의 삭제 대상 목록에 포함되어야 한다.

---

# 부록 B — QA 수정 루프 1회차 (`QA-2R-001`~`008`, 2026-10-04)

QA Verdict `FAIL`(`docs/qa/stage-2-rework-qa-report.md`)에 대한 수정. 본문·부록 A 는 그대로 두고 차이분만 기록한다.
**제품 동작은 바꾸지 않았다** — `QA-2R-001` 의 e2e 실패 5건은 전부 **테스트 전제 오류**였고(QA 가 독립 probe 로 제품 정상을 반증), 유일한 제품 변경은 사용자 결정으로 지시된 `QA-2R-002` 간격 24 다.

## B-1. `QA-2R-001` (High) — e2e 6건 → **0건**

| # | 실패 | 수정 | 파일 |
|---|---|---|---|
| 1 | `getByRole('banner')` 가 카드 단계에 없다 | 셀렉터를 **`<h1>` 기준**(`getByRole('heading', { level: 1 })`)으로 교체. landmark 구조(`QA-2R-008`)는 선행 결함이라 **건드리지 않았다** | `e2e/onboarding.spec.ts` |
| 2 | 2번째 카드 Q4(필수)를 답하지 않고 전진 — **차단이 정상**(`S2-ONB-1`) | 두 카드 **모두** 답하고 전진하도록 `answerAndAdvance()` 로 정리 | 〃 |
| 3·4 | `capability-items` 직접 진입 카운터가 `6 / 15` 인데 `2 / n` 기대 — `R-02` 통산 미반영 | **기대값을 현재 번호에서 파생**(`cardCounterIndex()` → `+1`). 분모를 테스트에 적지 않는다 — Trial 15 / 인증+동의 16 으로 구간별로 다르다 (`§11.19` 7-1) | 〃 |
| 5 | `answerAllCards` 가 settle 없이 `radio.first()` 를 잡아 경합 | 전진 후 **통산 카운터가 1 늘 때까지 poll** 하는 `expectCardIndex()` 로 settle. 카운터 locator 를 앞 카드(`.haru-swipe-deck__card--front`)로 **스코프**해 덱 `aria-live` 문구와 섞이지 않게 했다 | `e2e/support/onboarding.ts` |
| 6 | 5번 종속 (`s2-onboarding-saved`) | 해소. 추가로 **동의 직후 복귀 지점이 그 단계의 첫 카드**라는 사실(`§11.19` 7-2)을 반영해 helper 가 마지막 카드까지 다시 걸어간 뒤 `Finish` 를 누르도록 고쳤다 | 〃 |

**새 helper (전부 `e2e/support/onboarding.ts`)**: `frontCardCounter` · `cardCounterIndex` · `expectCardIndex` · `signUpAndConsent`(가입→동의로 **인증+동의 상태**를 만든다) · `seedChildDraft`(`addInitScript` 로 로컬 draft 주입 — 첫 렌더부터 표시 전용 모드가 된다).

> ⚠ 알아 둘 것: Playwright 의 `locator.isDisabled()` 는 **`aria-disabled="true"` 도 disabled 로 본다.** 그래서 `answerAllCards` 는 **답한 뒤에** `isDisabled()` 를 확인한다(순서가 바뀌면 필수 카드에서 즉시 종료된다).

**`SwipeDeck.tsx` 는 열지 않았다** — 3·4번은 `QA-2-001` pointer capture 회귀가 아니며(QA 가 마우스·CDP 터치 양쪽 정상 확인), 마우스·터치 드래그 e2e 2건이 수정 후 PASS 다.

## B-2. `QA-2R-002` (Medium) — ProgressBar → 카드 간격 **24** (사용자 결정)

단일 `gap-4` 래퍼가 두 간격을 함께 지배했다. **상단 묶음(TopBar + ProgressBar)과 본문을 분리**해 두 값을 따로 둔다.

```
<div flex flex-col>                      ← 외곽 (gap 없음)
  <div flex flex-col gap-4>              ← TopBar → ProgressBar = 16 (--space-4)
  <div haru-wizard-body flex-1 gap-4>    ← ProgressBar → 카드 = 24 (--space-6)
```

`onboarding.css` 신규 2 클래스 — **신규 토큰 0건** (기존 `--space-6` · `--space-4`):

| 클래스 | 값 | 적용 |
|---|---|---|
| `.haru-wizard-body` | `margin-block-start: var(--space-6)` | 카드 4단계 |
| `.haru-wizard-body--compact` | `margin-block-start: var(--space-4)` | `About your child`(ProgressBar 없음 — Figma `248:1159`) → **기존 16 유지** |

### ★ 세로 예산 재검산 (393×852, Playwright 실측 — 인증+동의 16장 전수)

```
topBar bottom 40 → ProgressBar y56 (gap 16 ✅) → bottom 62 → 카드 y86 (gap 24 ✅)
```

| 항목 | 값 |
|---|---|
| 카드 top | **86** (이전 78, QA 측정과 일치) |
| 예산 = 852 − 86 − 44(`--layout-cta-bottom-gap`) − 32(뒤 카드 peek) | **690** |
| 최장 카드 | **662** — ER2(8/16) · AG1(9/16) · IM1(14/16) |
| **여유** | **28** |
| Q5(4/16) | **646** → 여유 44 (Orchestrator 예측 646 과 일치) |
| Q3(3/16) 591 · Q1 531 · Q2 526 · Q4 498 · favorites(선택 0) 213 | 전부 여유 |
| 최대 카드 bottom | 748 (+ peek 32 = 780 ≤ 852 − 44 = **808**) → **카드 구간은 스크롤 없음** |

**예산을 넘는 지점 1곳 (§17-5 에 따라 보고만 하고 폰트·간격을 줄이지 않았다)**

| 상태 | 측정 |
|---|---|
| 마지막 카드(IM3 612) + 제출 CTA | CTA bottom **834**, 하단 인셋 44 포함 시 스크롤 높이 **878** vs 뷰포트 852 → **26px 페이지 스크롤** |

- Design Spec §5.3 은 이 지점을 `IM3 580 + CTA 90 = 670 ≤ 678` 로 계산했는데 **실측 IM3 는 612**(계산 대비 +32)다. 즉 초과분의 대부분은 간격 24 가 아니라 **원래 계산과 실측의 차이**다(간격 기여분은 +8).
- 마지막 카드는 **뒤 카드 peek 가 없고**(덱의 마지막) CTA 가 스크롤 컨테이너 내부 마지막 블록이므로, 26px 스크롤은 §13 "카드 고정 높이 없음 → 세로로 늘고 페이지가 스크롤" 규칙 안의 동작이다.

## B-3. `QA-2R-003` (Medium) — baseline 중복 해소

`248:1159` 를 **세 상태**로 분리했다. 두 테스트가 같은 상태(draft 없는 Trial 편집 모드)를 두 번 찍어 md5 가 같았던 문제를 없앴다.

| baseline | 세션 | draft | 모드 | Trial 안내 | 근거 |
|---|---|---|---|---|---|
| `s2-onboarding-childinfo-trial` | 미로그인 | **있음**(`seedChildDraft`) | **표시 전용** | **있음** | `R-07` A + `R-08` |
| `s2-onboarding-childinfo` **(신규)** | 인증+동의(`signUpAndConsent` + `onboarding:prefilled-child-info`) | 있음 | 표시 전용 | **없음** | `R-07` B |
| `s2-onboarding-childinfo-edit` | 미로그인 | 없음 | **편집**(`missing-prefill`) | 있음 | §4.5 |

각 테스트에 상태 단정을 넣어 다시 겹치면 **스크린샷 전에 실패**한다 (`getByRole('button', { name: /Yuna/ })` 존재 · `getByLabel('First name')` 0건 · Trial 문구 0건).

**md5 결과**

| baseline | before | after |
|---|---|---|
| `s2-onboarding-childinfo-trial` | `1cc53fae…` | **`69c0df3d…`** (달라짐) |
| `s2-onboarding-childinfo-edit` | `1cc53fae…` | `1cc53fae…` (상태 불변 — ProgressBar 가 없어 간격 변경 영향 없음) |
| `s2-onboarding-childinfo` | — | **`e8f471f2…`** (신규) |

→ 세 파일의 md5 가 **모두 다르다**.

## B-4. baseline 변경 목록 (`pnpm test:e2e:update` 1회)

| 처리 | baseline | 사유 |
|---|---|---|
| **신규** | `s2-onboarding-childinfo` | `R-07` B 상태 (`QA-2R-003`) |
| **생성(stale 해소)** | `s2-onboarding-saved` | `QA-2R-001` 6번으로 재촬영이 막혀 있었다 |
| **변경** | `s2-deck-reading-together` · `s2-deck-books-q3` · `s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability` | 간격 24 (`QA-2R-002`) — 카드 top 78 → 86 |
| **변경** | `s2-onboarding-childinfo-trial` | 표시 전용 모드로 상태 교체 (`QA-2R-003`) |
| **불변** | 그 외 40건 (`frame-*` · `v*` · `s2-welcome`/`login`/`consent`/`vpc-failed`/`signup`/`intro`/`start`/`home-header` · `s2-deck` · `s2-onboarding-childinfo-edit`) | 영향 없음 |

## B-5. `QA-2R-004` (Low) — `PLANNING.md` 등재

| 위치 | 내용 |
|---|---|
| `PLANNING.md` **§Stage 8 · 이월 기능 추가분** (`- **이월 기능 추가분 (QA-2R-004)**` 줄) | "미가입 기기에 남은 아이 정보 삭제 경로 필요" + 원인(`R-01` 로컬 저장 · 미가입자는 로그아웃 경로 없음) + 근거 3곳 링크 |
| `PLANNING.md` **Stage 8 Deliverables** `[FE · 이월 기능, C-15]` 행 | "미가입 기기의 로컬 아이 정보 draft 삭제 경로 포함 (`QA-2R-004`)" |
| `PLANNING.md` **FR-21 요구사항 행** | 같은 문장 추가 (Stage 매핑 표에서도 보이도록) |

## B-6. `QA-2R-005`~`008` (Low) — 후속 대상 등재만 (이번 범위 밖)

| ID | 상태 | 후속 정리안 |
|---|---|---|
| `QA-2R-005` | **수용 가능** (QA 판단) — `app → features` 는 적법 방향, `lint:boundaries` PASS, 가져오는 것은 순수 함수 2개 | `pathForStep` 을 `shared/config/routes.ts` 로, `hasAnyAnswers` 를 `shared/lib/onboarding-draft.ts` 로 내리면 `app/guards` 가 feature barrel 을 의존 그래프에 끌어오지 않는다. 이번 재구성의 `childInfo.ts` → `shared/lib/child-info.ts` 와 같은 패턴이다 |
| `QA-2R-006` | **선행 존재** (`HEAD` baseline 에도 있다) | 영역 클립 baseline 우하단에 dev Scenario Panel 이 찍힌다. `DevOverlay` 를 클립 대상 `main` 밖으로 옮기거나 시각 테스트에서 끈다 |
| `QA-2R-007` ① | **이번에 처리** | `e2e/visual.spec.ts` 의 `s2-signup` 테스트 이름·주석을 `AD-S2R-07`(전체 프레임)로 갱신 (`보호자 영역만` → `전체 프레임 (AD-S2R-07, form 클립)`) |
| `QA-2R-007` ② | **이번에 처리** | `entities/book/useBookSearch.ts` JSDoc 의 `BooksStep` 참조 제거 + **현재 사용처 0건 · Stage 3 Library 소관**임을 명시 |
| `QA-2R-008` | **선행 존재** | 온보딩 TopBar 가 `<main>` 안이라 `banner` landmark 가 없다. `StackLayout` 의 `topBar` 슬롯을 쓰도록 바꾸려면 "단계·카드별로 TopBar 내용이 바뀐다"는 제약(위저드가 TopBar 를 렌더하는 이유)을 layout route 가 수용해야 한다 — 구조 변경이라 별도 승인 필요 |

## B-7. 수정 후 검증 (**7/7 PASS**)

```
pnpm typecheck       PASS
pnpm lint            PASS (0 problems)
pnpm test            PASS — Test Files 101 / Tests 1094
pnpm lint:boundaries PASS — no dependency violations (458 modules, 1533 deps)
pnpm build           PASS
pnpm format:check    PASS
pnpm test:e2e        PASS — **138 passed / 0 failed** (이전 6 failed)
```

회귀 가드 재확인: `SwipeDeck.tsx` diff **0줄** · `SwipeDeck.css` `overflow` 선언 **0건** · 신규 토큰 **1건**(`--layout-cta-bottom-gap`) · `book-cover-sm` **0건** · `apps/api`·`supabase` **미생성**.

## B-8. 새로 발견한 문제

**B-8-1. `About your child` 는 서버 draft 가 **나중에** 도착하면 편집 모드에 머문다.**
`ChildInfoStep` 의 `editing` 초기값이 `useState` 초기화 1회로 결정되므로, 로컬 draft 가 비어 있고 `GET /v1/onboarding` 의 `draftAnswers.child_info` 가 **비동기로** 도착하는 경로(`onboarding:prefilled-child-info` 만 쓰고 로컬 seed 가 없는 경우)에서는 값이 채워진 뒤에도 표시 전용으로 돌아오지 않는다.
- **현재 영향 없음**: `R-01` 흐름에서 아이 정보는 **항상 로컬 draft 를 먼저 거치므로**(가입 화면 → `OnboardingDraftStore`) 첫 렌더가 동기적으로 값을 본다. 그래서 `-childinfo` baseline 도 `seedChildDraft` + 시나리오를 함께 써서 찍었다.
- **노출 조건**: 기기 교체 후 서버 draft 만 남은 상태(= `missing-prefill` 과 `prefilled` 사이의 중간 상태). 이 경우 사용자는 값이 채워진 **편집 폼**을 보게 되며 데이터 손실은 없다.
- 수정안: `editing` 을 "사용자가 편집을 요청했는가"로 좁히고 값 유무에서 파생. 제품 동작 변경이라 **승인 전까지 손대지 않았다.**

**B-8-2. 마지막 카드 + 제출 CTA 가 26px 스크롤을 만든다** (B-2 표). Design Spec §5.3 의 계산(IM3 580)과 실측(612)의 차이가 주원인이고 간격 24 기여분은 8px 다. §17-5 지시대로 보고만 한다.

**B-8-3. Playwright `isDisabled()` 가 `aria-disabled` 를 포함한다.** 재구성이 필수 미응답 차단을 `aria-disabled` 로 구현했으므로(§3.2) e2e 에서 "전진 가능 여부"와 "마지막 카드 여부"를 `isDisabled()` 하나로 구분할 수 없다. 현재 helper 는 **답한 뒤에** 확인해 구분하지만, 앞으로 비슷한 helper 를 쓸 때 같은 함정이 있다.

---

# 부록 C — QA 수정 루프 2회차 (`QA-2R-009`, 2026-10-04)

**데이터 손실 1건만 고쳤다.** 다른 리팩터링·토큰 추가 없음. `SwipeDeck.tsx` diff 0줄.

## C-1. 증상과 근본 원인

Trial 에서 고른 **언어 환경이 가입을 지나면서 조용히 사라졌다** (QA 실측: `after-child-info ["english"]` → `after-sign-up []`).
동의 직후 Guard 가 저장된 단계로 되돌리므로(`§11.19` 7-2) 사용자는 `About your child` 를 다시 지나지 않고, 언어가 빠진 채 `POST /v1/onboarding/submit` 이 나간다 — 알아챌 방법이 없었다.

근본 원인은 **한 곳**이다.

| 지점 | 내용 |
|---|---|
| `apps/web/src/shared/lib/child-info.ts` `partialChildInfoAnswers` | `languageEnvironment: [...form.languageEnvironment]` 를 **빈 배열이어도 무조건** 포함했다. 같은 함수의 `firstName`·`lastName`·`birthYearMonth`·`readingRoutine` 은 전부 조건부 spread 이고, 바로 위 주석("빈 값은 키 자체를 넣지 않는다")과도 어긋났다 |
| (파급) `features/auth/model/childDraft.ts` `saveChildDraft` | `{ ...기존, ...childInfo }` 병합이라, 언어 입력이 **없는** 가입 화면의 저장이 빈 배열로 기존 값을 덮어썼다 |

## C-2. 수정 — 1지점 (최소 변경)

`partialChildInfoAnswers` 가 `languageEnvironment` 를 **비어 있으면 키에서 뺀다**. 코드를 주석에 맞췄다.

```ts
...(form.languageEnvironment.length === 0
  ? {}
  : { languageEnvironment: [...form.languageEnvironment] }),
```

- **`SignUpForm.tsx` 는 손대지 않았다** (지시 2번). 1지점을 고치면 가입 화면 payload 에 키 자체가 없어 병합이 기존 값을 그대로 남긴다 — draft 복원 로직을 늘릴 이유가 사라진다. `readingRoutine` 도 같은 경로로 함께 보존된다.
- `ChildInfoStep` 의 **언어 해제**는 그대로 동작한다. 그 화면은 `onChange({ ...answers, child_info: partialChildInfoAnswers(merged) })` 로 `child_info` 를 **통째로 교체**하므로 키가 빠지면 "선택 없음" 으로 읽힌다 (`childInfoFormFrom` 이 `?? []` 로 되돌린다).

## C-3. `gender` 판단 — **언어와 다르게 두었다** (키 유지)

| 근거 | 내용 |
|---|---|
| 의미 | `gender: null` 은 빈 값이 아니라 **"미응답" 이라는 선택**이다 (C-7, contracts `ChildInfoAnswers.gender` 주석 "키 자체는 항상 보낸다") |
| 제출 판정 | `buildSubmitRequest` 는 `childInfo.gender === undefined` 만 누락으로 본다. 키를 빼면 미응답 사용자의 제출이 **잘못 차단**된다 |
| 손실 위험 없음 | 성별을 다루는 두 화면(`/auth/sign-up`·`child_info`)이 모두 저장값을 폼으로 되살린다(`SignUpForm` 의 `gender: saved?.gender ?? null`, `childInfoFormFrom`). 언어는 가입 화면에 **입력 자체가 없어서** 되살릴 값이 없었던 것이 차이다 |

이유는 `partialChildInfoAnswers` JSDoc 에 남겼다.

## C-4. contract `.min(1)` 판단 — **넣지 않았다**

`packages/contracts/src/onboarding/child-info.ts` 의 `languageEnvironment: z.array(...).max(...)` 는 **그대로 둔다.**

| 이유 |
|---|
| ① 기존 draft 호환: 이 버그로 `languageEnvironment: []` 가 저장된 기기가 이미 있다. `.min(1)` 은 그 사용자의 제출을 **schema 단계에서** 깨뜨린다 (오류 문구도 필드 단위로 안내되지 않는다) |
| ② 영향 범위: 같은 enum 을 쓰는 `children/child.ts` 응답 schema·Mock fixture·향후 Backend 응답까지 전부 "최소 1개" 제약을 받는다. 서버가 돌려주는 **읽기 모델**에까지 필수를 강제할 근거가 없다 |
| ③ 이미 대안이 동작한다: 수정 후 `buildSubmitRequest` 의 `childInfo.languageEnvironment === undefined` 검사가 **UI 필수 규칙(D-C)과 같은 결과**를 낸다 — 미선택이면 `missing: ['child_info']` 로 제출을 막고 해당 단계로 되돌린다. 키를 빼는 수정이 이 검사를 **처음으로 유효하게** 만들었다 (이전에는 빈 배열이 늘 들어 있어 무력했다) |

**남는 틈 (후속 판단 대상, 이번 범위 밖)** — 아래 2건은 제품 동작 변경이라 손대지 않았다.

1. `buildSubmitRequest` 는 `undefined` 만 보고 **`length === 0` 은 보지 않는다.** 이 버그로 이미 `[]` 가 저장된 기기는 여전히 빈 언어로 제출된다. 한 줄(`?? []).length === 0`)로 막을 수 있으나 ①의 호환 문제를 그대로 가져온다 — 되돌릴 단계(`child_info`)로 보내는 UX 가 함께 필요하다.
2. `OnboardingWizard.handleNext` 는 `child_info` 에서 **`firstName` 만** 확인한다. 언어 미선택으로도 다음 단계로 갈 수 있고, 제출 시점에 되돌아오면 `showErrors` 가 초기화돼 **인라인 오류가 보이지 않는다** (`submitBlockedBy` 는 노출되지 않는다). 언어를 고르지 않은 사용자에게는 안내 없는 되돌림이 된다.

## C-5. 회귀 테스트 3종 (전부 **수정 전 실패 → 수정 후 통과** 확인)

| # | 위치 | 고정하는 것 | 수정 전 |
|---|---|---|---|
| 1 | `e2e/onboarding.spec.ts` — `Trial → 가입 — 언어 환경 보존 (QA-2R-009)` ① | Trial 에서 English 선택 → 가입 → `localStorage` draft 의 `languageEnvironment` 가 `['english']` 로 남는다 (+ `gender` 동시 보존) | **FAIL** |
| 2 | 같은 describe ② | 언어를 **고르지 않으면** 빈 배열이 아니라 **키가 없다** (Trial 직후·가입 직후 둘 다) | **FAIL** |
| 3 | `apps/web/src/features/onboarding-survey/model/__tests__/childInfo.test.ts` | `partialChildInfoAnswers` 단위 — 빈 언어 배열이면 키 없음 / 선택 시 그대로 / `gender: null` 은 키 유지 | **FAIL** (1건) |
| 보강 | `apps/web/src/features/auth/model/__tests__/childDraft.test.ts` | 언어 입력이 없는 화면(가입)의 저장이 기존 언어·독서 루틴을 지우지 않는다. payload 를 리터럴이 아니라 `partialChildInfoAnswers` 로 만든다 | **FAIL** |

기존 테스트 1건 수정: `childInfo.test.ts` 의 `expect(partial.languageEnvironment).toStrictEqual([])` 는 **버그를 고정하고 있던 단언**이라 제거했다 (같은 케이스의 다른 단언은 유지).
QA probe `docs/qa/evidence/qa-langloss.probe.spec.ts` 는 **읽기만** 했다 (QA 소유, 미수정).

## C-6. 시각 baseline 1건 갱신 — `s2-onboarding-childinfo.png`

이 baseline 도 **버그 상태를 찍고 있었다.** 해당 테스트는 `seedChildDraft`(언어 `english` 포함) → 가입 → 동의 → `child-info` 경로라, 수정 전에는 가입 저장이 언어를 지워 **칩이 하나도 선택되지 않은** 화면이 기준이었다. 수정 후 `English` 칩이 선택 상태로 렌더되어 745px(0.01) 차이가 났고, `--update-snapshots` 로 **그 1장만** 재촬영했다. 나머지 baseline 은 변경 없음.

## C-7. 변경 파일

| 파일 | 변경 |
|---|---|
| `apps/web/src/shared/lib/child-info.ts` | `partialChildInfoAnswers` 조건부 spread + 이유 JSDoc (`gender` 를 다르게 두는 이유 포함) |
| `apps/web/src/features/onboarding-survey/model/__tests__/childInfo.test.ts` | 회귀 단위 테스트 3건 추가, 버그를 고정하던 단언 1줄 제거 |
| `apps/web/src/features/auth/model/__tests__/childDraft.test.ts` | 병합 회귀 테스트 1건 추가, 공용 fixture 의 `languageEnvironment: []` 제거 (실제 payload 모양과 일치) |
| `e2e/onboarding.spec.ts` | e2e 회귀 2건 추가 |
| `e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-childinfo.png` | 수정 후 상태로 재촬영 (C-6) |

## C-8. 검증 (**7/7 PASS**)

```
pnpm typecheck       PASS
pnpm lint            PASS (0 problems)
pnpm test            PASS — Test Files 101 / Tests 1098
pnpm lint:boundaries PASS — no dependency violations (458 modules, 1534 deps)
pnpm build           PASS
pnpm format:check    PASS
pnpm test:e2e        PASS — **140 passed / 0 failed** (단독 실행)
```

회귀 가드: `SwipeDeck.tsx` diff **0줄** · `SwipeDeck.css` `overflow` 선언 **0건** · 신규 토큰 **0건** · `apps/api`·`supabase` **미생성** · `docs/decisions`·`docs/plans`·`docs/design`·`docs/source`·`docs/qa/evidence` **미수정**.

## C-9. `BACKEND_INTEGRATION_PENDING` 영향

없음(신규 0건).

> **[SUPERSEDED — 부록 D 가 현행]** 이 절은 원래 "서버는 `child_info.languageEnvironment` 를 선택 필드로 받지 않는다 — Frontend 가 제출 전에 1개 이상을 보장한다(D-C)" 고 적었다. **그 서술은 폐기되었다.** 현행은 **부록 D(§D-9)** 다 — 언어 환경은 **선택 사항**이고(사용자 결정 `§11.22`, 2026-10-04), 서버는 **빈 배열을 거부하면 안 되며**(`.min(1)` 금지) **기본값을 다시 채우면 안 된다**(사용자의 명시적 해제를 덮어쓴다). 기본값 `['english']` 적용은 **Frontend 제출 경계 한 곳**(`buildSubmitRequest`)이다. Stage 8 `DATA_REQUIREMENTS.md` 는 부록 D 를 따른다.

---

# 부록 D — 언어 환경 **선택 항목 + 기본값 영어** (사용자 결정 2026-10-04)

부록 C 가 보고한 "남은 틈 2건"에 대한 사용자 결정의 구현이다. 결정 원문: **"선택으로 하고 디폴트는 영어로 한다 / 언어 선택을 하지 않으면 디폴트는 영어임"**.
두 틈이 함께 사라진다 — 되돌릴 일이 없어지고(②), 빈 값이 **정상 값**이 되어 기존 `[]` draft 도 유효해진다(①).

## D-1. 기본 선택은 **화면에서** 준다 (`childInfoFormFrom`)

`apps/web/src/shared/lib/child-info.ts` `childInfoFormFrom` 이 **키의 유무로 두 상태를 구분**한다.

| draft 상태 | 폼 초기값 | 뜻 |
|---|---|---|
| `languageEnvironment` **키 없음** | `['english']` | 아직 고른 적 없음 → `English` 칩이 **미리 선택되어 보인다** |
| `languageEnvironment: []` | `[]` | 사용자가 **직접 해제** → 그대로 둔다 |

- 폼 초기값 한 곳만 바꿨다. `EMPTY_CHILD_INFO_FORM` 은 **그대로 `[]`** 다 — 여기에 기본값을 넣으면 언어 입력이 없는 가입 화면의 폼까지 영어를 들고 다니게 되어 `QA-2R-009` 가 되살아난다.
- 신규 문구 **0건**(기본 선택 상태일 뿐이다). 안내 문구를 만들지 않았다.
- 전부 해제할 수 있고, 해제해도 전진이 막히지 않는다 (D-2).

**해제 상태를 저장하는 방법** — `ChildInfoStep.update()` 가 `partialChildInfoAnswers` 결과 위에 `languageEnvironment` 를 **항상 덧쓴다**(빈 배열 포함).
언어의 편집 주체는 이 화면뿐이고 이 화면은 `child_info` 를 통째로 교체하므로 안전하다. 반대로 언어 입력이 **없는** 가입 화면은 `partialChildInfoAnswers` 가 키를 빼서 기존 값을 지우지 않는다(부록 C). 두 화면의 요구가 반대라 **화면 쪽에서** 덧쓰는 구조를 택했다.

## D-2. 필수 해제

| 위치 | 변경 |
|---|---|
| `shared/lib/child-info.ts` `validateChildInfo` | 언어 필수 검사 **삭제**. 필수는 **이름 · 생년월** 둘뿐 |
| 같은 파일 `ChildInfoFieldErrors` | `'languageEnvironment'` 키 제거 (설정하는 곳이 사라졌다) |
| `features/onboarding-survey/ui/ChildInfoStep.tsx` | `languageError` 와 그 `role="alert"` 블록 제거 |
| `shared/copy/child-copy.ts` | `languagesRequired` 문구 제거 (사용처 0건) |
| `model/submitRequest.ts` | 누락 검사에서 `languageEnvironment === undefined` **제외** |
| `OnboardingWizard.handleNext` | **손대지 않았다** (지시대로 `firstName` 만 본다) |

## D-3. 제출 기본값 — `buildSubmitRequest` **한 곳**에서 채운다

`apps/web/src/features/onboarding-survey/model/submitRequest.ts`

```ts
languageEnvironment:
  childInfo?.languageEnvironment === undefined || childInfo.languageEnvironment.length === 0
    ? [...DEFAULT_LANGUAGE_ENVIRONMENT]
    : childInfo.languageEnvironment,
```

**근거**: ① 이 함수가 draft → 서버 payload 로 넘어가는 **유일한 경계**다. ② 이미 "선택 문항은 빈 배열로 채운다"는 **같은 성격의 보정이 모여 있는 자리**다(`books_and_interests`·`growing_together`). ③ 키 없음(한 번도 안 고름)과 빈 배열(해제)을 **같은 결과**로 모을 수 있는 마지막 지점이다.
**draft 저장 시점에는 채우지 않는다** — 저장소가 해제를 영어로 되돌리면 해제 자체가 불가능해진다. 로컬 draft 는 `[]` 를 그대로 보존한다(테스트로 고정, D-5).

## D-4. contract — `.min(1)` 없음, `.default()` **도 넣지 않았다**

`packages/contracts/src/onboarding/child-info.ts` 에는 **값 상수만** 추가했다.

```ts
export const DEFAULT_LANGUAGE_ENVIRONMENT: readonly LanguageEnvironment[] = ['english'];
```

`.default()` 를 넣지 **않은** 이유 (주석에도 남겼다):

1. `.default()` 는 **parse 가 입력을 조용히 바꾼다.** 사용자가 **일부러 비운** 선택(빈 배열)을 표현할 수 없게 되고, 화면이 보여 준 상태와 저장된 값이 달라진다.
2. 같은 enum 배열은 **읽기 모델**(`ChildSchema.languageEnvironment`)과 Mock 응답도 쓴다. Request schema 에 기본값을 박으면 응답·저장값까지 "비어 있으면 영어" 규칙에 묶인다 — 의도한 범위를 넘는다.
3. Backend 도 같은 규칙을 갖게 하는 것 자체는 **의도가 맞다.** 다만 그 규칙은 **"보내는 쪽이 눈에 보이게 채운다"** 로 전달하는 편이 안전하다. 그래서 값은 contracts 가 소유(단일 출처)하고 적용 지점만 Frontend 제출 경계에 둔다. Stage 8 `DATA_REQUIREMENTS.md` 에 "서버는 빈 배열을 거부하지 않는다 + 기본값 상수는 `DEFAULT_LANGUAGE_ENVIRONMENT`" 로 기록할 항목이다.

`.min(1)` 은 부록 C 판단 그대로 넣지 않았다 — 이제 빈 배열이 **정상 값**이라 더욱 그렇다.

## D-5. 영향 확인

| 확인 | 결과 |
|---|---|
| **`S2-ONB-1`(Q1·Q2·Q4 필수) 충돌** | **없다.** 필수 문항은 `instrument.questions` 가 정의하고 `stepsMissingRequiredAnswers` 로만 판정된다. 언어는 문항이 아니라 Step 1 **프로필 필드**이며, contracts `instrument.ts` 주석도 "`child_info` 는 문항이 아니라 프로필 입력이라 여기에 없다" 고 명시한다. 이번 변경은 `instrument` 를 건드리지 않았다 |
| **언어를 필수로 단정하는 AC** | **`AC-2-xx` 중에는 없다.** Step 1 관련 AC(`AC-2-21`·`AC-2-22`)는 이름 두 칸·성별 미선택만 말한다. 대신 **다음 3곳의 서술이 이번 결정과 어긋난다 — 고치지 않고 보고만 한다** (수정 금지 경로): `docs/decisions/stage-2-approvals.md` **D-C**(L133) 와 §요약(L178) "언어환경 필수", `docs/design/stage-2-design-spec.md` L383·L421 "Step 1 필수 = 이름·생년월·언어환경" |
| 코드 주석 | `validateChildInfo` JSDoc 에 "D-C 의 언어 필수 부분을 사용자 결정 2026-10-04 이 대체한다" 고 남겼다 |

## D-6. 회귀 테스트 (신규 5종 + 기존 `QA-2R-009` 4종 유지)

| # | 요구 | 위치 | 결과 |
|---|---|---|---|
| 1 | 기본 상태에서 `English` 가 선택되어 있다 | `e2e/onboarding.spec.ts` (`aria-pressed=true`) + `childInfo.test.ts` (`childInfoFormFrom` 단위) | PASS |
| 2 | 전부 해제해도 전진·제출이 막히지 않는다 | e2e(해제 후 `Next` → `/onboarding`) + `childInfo.test.ts`(검증 오류 0건) + `submitRequest.test.ts`(`ok: true`) | PASS |
| 3 | 전부 해제 후 제출 payload 가 `['english']` | `submitRequest.test.ts` (빈 배열 / 키 없음 두 경우) | PASS |
| 4 | 다른 언어를 고르면 그대로 간다 | `submitRequest.test.ts` (`['korean','spanish']` 유지) | PASS |
| 5 | **해제 상태가 draft 에 보존된다** | e2e (`[]` 저장 → 가입 후에도 `[]`) + `childInfo.test.ts`(`childInfoFormFrom` 이 `[]` 를 되살리지 않는다) | PASS |
| 기존 | `QA-2R-009` 4종 | 유지. e2e ① 은 **직접 고른 값**(`['english','korean']`)이 가입을 지나도 남는지로 강화했다 — 기본값이 되살아난 것과 구분된다 | PASS |

함께 조정한 기존 테스트 2건 (전부 **기본 선택 도입의 직접 결과**다):
- `e2e/support/onboarding.ts` `fillChildInfo` 가 `English` 를 **누르지 않는다** (누르면 해제된다). 대신 기본 선택을 `aria-pressed` 로 확인한다.
- `e2e/onboarding.spec.ts` 의 마우스 대조군 테스트가 기본 선택이 아닌 `Korean` 칩을 토글한다 (의도 동일).
- `childInfo.test.ts` 의 "언어 필수" 단언은 "해제해도 막지 않는다" 로 교체했다.

**baseline**: `s2-onboarding-childinfo-edit.png` **1장만** 재촬영했다. 나머지 2종(`-trial`·`-childinfo`)은 seed draft 가 이미 `['english']` 를 들고 있어 **변화가 없었다**(재촬영 시도 결과 PASS).

## D-7. 변경 파일

| 파일 | 변경 |
|---|---|
| `packages/contracts/src/onboarding/child-info.ts` | `DEFAULT_LANGUAGE_ENVIRONMENT` 추가 + 선택 항목·`.default()` 미사용 근거 주석 |
| `apps/web/src/shared/lib/child-info.ts` | 기본 선택(`childInfoFormFrom`), 언어 필수 검사 제거, `ChildInfoFieldErrors` 축소 |
| `apps/web/src/shared/copy/child-copy.ts` | `languagesRequired` 제거 |
| `apps/web/src/features/onboarding-survey/ui/ChildInfoStep.tsx` | 언어 오류 UI 제거, `update()` 가 해제 상태를 기록 |
| `apps/web/src/features/onboarding-survey/model/submitRequest.ts` | 누락 검사에서 언어 제외 + 제출 경계 기본값 |
| `.../model/__tests__/childInfo.test.ts` · `.../__tests__/submitRequest.test.ts` | 회귀 테스트 |
| `e2e/onboarding.spec.ts` · `e2e/support/onboarding.ts` | e2e 회귀 + helper 조정 |
| `e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-childinfo-edit.png` | 기본 선택 반영 재촬영 |

## D-8. 검증 (**7/7 PASS**)

```
pnpm typecheck       PASS
pnpm lint            PASS (0 problems)
pnpm test            PASS — Test Files 101 / Tests 1103
pnpm lint:boundaries PASS — no dependency violations (458 modules, 1534 deps)
pnpm build           PASS
pnpm format:check    PASS
pnpm test:e2e        PASS — **140 passed / 0 failed** (단독 실행)
```

회귀 가드: `SwipeDeck.tsx`·`SwipeDeck.css` 미수정 · 신규 토큰 **0건** · 신규 문구 **0건**(문구 1건 삭제) · `apps/api`·`supabase` 미생성 · `docs/decisions`·`docs/plans`·`docs/design`·`docs/source`·`docs/qa/evidence`·`stage-2-rework-qa-report.md` 미수정.

## D-9. `BACKEND_INTEGRATION_PENDING` 추가 항목

- **언어 환경은 선택 필드다.** 서버는 `child_info.languageEnvironment` 의 **빈 배열을 거부하지 않아야** 하며, `.min(1)` 제약을 넣지 않는다. 미선택 기본값(`DEFAULT_LANGUAGE_ENVIRONMENT = ['english']`)은 **보내는 쪽이 채운다** — 서버가 또 채우면 사용자의 명시적 해제를 덮어쓴다. Stage 8 `DATA_REQUIREMENTS.md` 기록 대상.

---

# E. 설문 카드 좌우 이동 버튼 + `S2-FIX-4` (2026-10-05, development-agent)

근거: `docs/decisions/stage-3-approvals.md` **§11.23**(결정 정본) · `docs/design/stage-2-onboarding-rework-design-spec.md` **§18**(구현 명세).
**기능 추가가 아니다.** TopBar `<` `>` 는 이미 동작했고(실측 `3/15 → 4/15 → 3/15`), 자동 전진이 없는 복수 선택·입력 카드에서 그 경로가 카드에서 멀어 보이지 않았다 — **발견 가능성**을 고친 변경이다.

## E-1. 구현한 항목

| ID | 내용 | 결과 |
|---|---|---|
| §18 | 카드 좌우 이동 버튼 — 기존 `IconButton variant="glass"` · TopBar 와 **같은 핸들러**(`handlePrevious`·`handleNextCard`) | 구현 |
| §18.2 | 가로 = 버튼 **중심이 카드 세로 모서리** | 56개 상태 실측 **편차 0.0px** |
| §18.3 | 세로 = **앞 카드 중앙** (덱 peek 보정 포함) | 카드 높이 213~712 전 구간 **편차 0.0px** |
| §18.7 | 카드 버튼은 포인터 전용 — `aria-hidden="true"` + `tabIndex={-1}` | 구현 (Tab 30회 실주행 검증) |
| `S2-FIX-4` | TopBar leading 라벨 판정을 **통산 번호**로 교체 | 구현 |
| `S2R-OPEN-16` | 전체 첫 카드에서 카드 좌 버튼 **미렌더** | 구현 |
| `S2R-OPEN-15` | 필수 미응답 시 다음 버튼 dim — **카드 버튼에만** 가둠 | 구현 |

**신규 토큰 0건 · 신규 문구 0건 · `packages/ui` 변경 0건 · `SwipeDeck.tsx`/`SwipeDeck.css` 미수정 · `z-index` 선언 0건 · 신규 `overflow`/`clip-path`/`contain` 0건.**

## E-2. 변경 파일

| 파일 | 변경 |
|---|---|
| `apps/web/src/features/onboarding-survey/ui/SurveyCardDeck.tsx` | 래퍼에 `haru-survey-deck` + `<SwipeDeck>` **다음 형제**로 `IconButton` 2개. 핸들러·비활성 플래그는 전부 prop |
| `apps/web/src/features/onboarding-survey/ui/OnboardingWizard.tsx` | `previousIsCard`(통산 번호 판정) 파생 → TopBar leading 라벨 + 덱 prop. 핸들러 **복제 0건** |
| `apps/web/src/features/onboarding-survey/onboarding.css` | `.haru-survey-deck` · `.haru-survey-deck__nav{,--prev,--next}` + `aria-disabled` dim (이 버튼으로 한정) |
| `e2e/onboarding.spec.ts` | 회귀 7종 추가 + 기존 4건의 `Go back` → `Previous question` (= `S2-FIX-4` 의 직접 결과) + 드래그 시작점 조정 1건 |

## E-3. `S2-FIX-4` — 원인

`cardIndex` 는 **단계 안의 번호**다. 2·3·4 카드 단계의 첫 카드에서 `cardIndex === 0` 이라 라벨이 `Go back` 이 되지만, `handlePrevious` 는 `previousStep` + `requestReturnTo` 로 **이전 단계의 마지막 카드**로 간다 — 16장 중 3장에서 라벨과 동작이 어긋났다 (WCAG 2.4.6).
수정: 판정을 통산 번호(`globalIndex`, 1-based)로 바꿔 `onCardStep && globalIndex > 1` 이면 `Previous question`. **조건 1줄 · 신규 문구 0건.** 같은 값이 카드 좌 버튼 렌더 조건(`S2R-OPEN-16`)이기도 해서 두 경로가 갈릴 수 없다.

## E-4. `S2R-OPEN-15` — 영향 범위 조사와 격리

`IconButton.css` 의 `:disabled` 규칙에 `[aria-disabled='true']` 를 더하는 방식은 **번진다**. 조사 결과 현재 `aria-disabled` 를 쓰는 `IconButton` 은 1곳이지만 그 1곳이 **같은 화면의 TopBar trailing chevron**(`OnboardingWizard.tsx`)이고, 공유 규칙이므로 앞으로 생기는 모든 `aria-disabled` IconButton 에 자동 적용된다 (`Chip`·`Button` 은 각자 규칙이라 무관).
→ 승인된 §3.2 동작(TopBar 는 시각 변화 없음)을 바꾸게 되므로 **카드 버튼에만 가뒀다**:

```css
.haru-survey-deck__nav .haru-icon-button[aria-disabled='true']:not(:disabled) {
  opacity: var(--opacity-disabled);
  cursor: default;
}
```

`IconButton` 은 `className` 을 받지 않으므로(`NativeButtonProps` 의 Omit 목록) 버튼마다 래퍼 `div` 를 두고 그 안쪽만 겨냥했다. **native `disabled` 로 바꾸지 않았다** — 포커스를 잃으면 사유를 읽을 수 없다 (결정 D-3). `pointer-events` 도 막지 않는다 (누름을 막는 것은 `handleNextCard` 의 조기 반환이다).
실측: 필수 미응답 카드에서 카드 우 버튼 `opacity` **0.5**, 그 외 **1**. 같은 화면 TopBar chevron 은 변화 없음.

## E-5. 실측 (Playwright, 4개 폭 × 전 카드 = 56개 상태)

| 항목 | 결과 |
|---|---|
| 세로 중앙 편차 (버튼 중심 − 앞 카드 중심) | **전부 0.0px** |
| 가로 편차 (버튼 중심 − 카드 세로 모서리) | **전부 0.0px** |
| 덱 래퍼 높이 − 앞 카드 높이 | **전부 32.0px** (= `(--deck-depth − 1) × --deck-peek-y`, 보정이 실제로 작동) |
| 카드 높이 범위 | **213 ~ 712** (최단 = favorites 선택 0건, 최장 = 320px 역량 문항) |
| 320px 버튼 bbox | 좌 `[5, 43]` · 우 `[277, 315]` — 뷰포트(0~320) 안, 가로 스크롤 0 |
| 600px(앱 컬럼 480 중앙 정렬) | 좌 `[65, 103]` · 우 `[497, 535]` — 컬럼과 함께 이동 |

**명세 수치와의 차이(보고)**: Design Spec §5.3 의 카드 높이 분포는 `235 ~ 638` 이나 실측은 `213 ~ 712` 다. 세로 중앙 규칙은 전 구간에서 성립하므로 구현에 영향은 없고, **고정 offset(251)이면 깨진다는 §18.3 의 결론은 더 강해진다**(최단 카드가 235 가 아니라 213 이다).

## E-6. 회귀 테스트 7종 — **수정 전 FAIL 확인 포함**

| # | 테스트 | 수정 전 | 수정 후 |
|---|---|---|---|
| 1 | Q3(복수 선택)·favorites 카드에서 **카드 우 버튼으로 전진** | **FAIL** (버튼 없음) | PASS |
| 2 | 카드 좌 버튼으로 **이전 카드** | **FAIL** (버튼 없음) | PASS |
| 3 | 전체 첫 카드에 **좌 버튼 없음**(우 버튼은 있음, TopBar `Go back` 은 있음) | **FAIL** — `locator('.haru-survey-deck__nav--next .haru-icon-button')` Expected 1 / Received 0 | PASS |
| 4 | 2·3·4 단계 첫 카드의 TopBar leading = **`Previous question`** | **FAIL** — `/onboarding/books-and-interests` 에서 `Previous question` not found (= `Go back` 이었다) | PASS |
| 5 | 카드 버튼이 **탭 순서에 없고**(Tab 30회 실주행) **AT 에 없다** | **FAIL** (버튼 없음) | PASS |
| 6 | **최단(213)·최장(626~712) 카드 모두** 버튼이 카드 세로 중앙 ±2px, 카드 안 | **FAIL** (버튼 없음) | PASS |
| 7 | 320px 에서 뷰포트 밖 X, 옵션 행과 교차 X | **FAIL** (버튼 없음) | PASS |

1·3·4 는 지시대로 **수정 전 FAIL 을 실제로 확인**했다 (3·4 는 위 표의 단언 메시지가 증거다).

## E-7. 검증 (**8/8 PASS**)

```
pnpm typecheck       PASS
pnpm lint            PASS (0 problems)
pnpm test            PASS — Test Files 101 / Tests 1103
pnpm lint:boundaries PASS — no dependency violations (460 modules, 1544 deps)
pnpm build           PASS
pnpm format:check    PASS
pnpm assert:no-mocks PASS
pnpm test:e2e        PASS — **154 passed / 0 failed** (단독 실행, 기존 147 + 신규 7)
```

## E-8. baseline

**재생성한 baseline 0건. 실패한 baseline 0건.**
설문 5종(`s2-deck-reading-together` · `s2-deck-books-q3` · `s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability`)은 `main` **영역 클립**이라 버튼의 바깥 절반이 클립 밖으로 나가고, 남는 안쪽 절반은 74% 흰 glass 가 흰 카드 위에 놓여 색차가 거의 없다. 실측 diff는 **6~12px** 로 `REGION_SNAPSHOT` 허용치(`maxDiffPixels` 20)를 넘지 않아 **전부 PASS** 했다.
⚠ 그러나 **baseline 이미지에는 새 버튼이 보이지 않는다** (육안 대조 확인). 지시대로 재생성하지 않았으며, 재촬영 여부는 사용자·QA 판단 대상이다.

## E-9. 새로 발견한 문제 (보고 — 임의 처리하지 않음)

1. **카드 모서리 세로 중앙 44px 에서 시작한 스와이프가 동작하지 않았다.** → **§F 에서 해결**(사용자 결정 2026-10-05 "스와이프를 살린다"). 임시로 e2e 시작점을 옮겼던 것은 **되돌렸다**.
2. **Design Spec §5.3 의 카드 높이 분포(235~638)가 실측(213~712)과 다르다** (E-5).
3. **axe 가 이 저장소의 e2e 에 연결되어 있지 않다.** `aria-hidden-focus` 는 자동 검사 대상이 아니라서, `aria-hidden` + `tabIndex=-1` 동시 적용과 Tab 실주행을 회귀 테스트로 직접 고정했다.

## E-10. `BACKEND_INTEGRATION_PENDING` 추가 항목

**없음.** §18 · `S2-FIX-4` · `S2R-OPEN-15` · `S2R-OPEN-16` 은 전부 Frontend 표현 계층이며 contract·Mock 변경이 0건이다.


---

# F. 카드 버튼 위에서 시작한 스와이프 복구 (2026-10-05, development-agent)

사용자 결정 2026-10-05: **"스와이프를 살린다"** · **"baseline 을 재촬영한다"**.
근거: 사용자 지시 원문이 *"지금 **카드 스와이프 동작은 그대로 두고**, 버튼을 두어서…"* 이므로, 버튼이 카드 모서리 44px 띠의 제스처를 삼킨 것은 **지시 위반**이다.

재현 (수정 전):

| 시작점 | 결과 |
|---|---|
| 모서리 안쪽 −10px (버튼 히트 한가운데) | `6/15 → 6/15` ⛔ |
| 모서리 −20px | `6/15 → 6/15` ⛔ |
| 모서리 −60px · 카드 중앙 | `6/15 → 7/15` ✅ |

## F-1. 고른 방식 — `SwipeDeck` 에 `gestureSurfaceRef` 를 연다

```tsx
// SurveyCardDeck.tsx
<SwipeDeck … gestureSurfaceRef={containerRef} />
```

덱이 제스처를 **앞 카드가 아니라 `.haru-survey-deck` 래퍼**에서 듣는다. 래퍼는 카드와 버튼을 **모두** 포함하므로, 버튼 위에서 시작한 포인터도 덱의 제스처 경로를 그대로 탄다.

판정 규칙은 **새로 만들지 않았다** — `SwipeDeck` 이 `QA-2-001` 에서 이미 쓰던 `SWIPE_SLOP_PX`(8) 규칙을 그대로 쓴다:

| 포인터 | 결과 |
|---|---|
| 8px 넘게 **움직임** | 덱이 캡처 → **스와이프**. 캡처 때문에 click 은 래퍼로 리타깃되어 버튼이 눌리지 않는다 |
| **제자리**에서 뗌 | 캡처 없음 → native **click 이 버튼에** 간다 |

### 왜 이 방식인가 (검토한 대안과 트레이드오프)

| 대안 | 기각 이유 |
|---|---|
| 버튼을 **앞 카드 안**으로 옮긴다 (`controls="overlay"`) | 앞 카드가 드래그 `transform` 을 받으므로 **버튼이 드래그를 따라 도망간다** — §18.4 "드래그 추종 없음" 위반 |
| 버튼을 **스택 안**으로 옮긴다 | 앞 카드가 `z-index: 1` 이라 버튼이 카드 **뒤로** 깔린다 → `z-index` 신규 선언 필요, §18.4 "z-index 0건" 위반 |
| 버튼에 `pointer-events: none` | 클릭도 같이 죽는다 |
| 합성 `PointerEvent` 를 앞 카드로 재전달 | `setPointerCapture` 와 pointerId 수명에 기대는 취약한 구현 |
| 제스처 로직을 `SurveyCardDeck` 에 복제 | 임계값·방향·애니메이션이 두 벌이 된다 (명시 금지) |

**트레이드오프 (기록)**
- 제스처 표면이 카드 → 래퍼로 넓어졌다. 즉 **뒤 카드 peek 띠(아래 32px)와 버튼 바깥 절반**에서도 끌기가 시작된다. 카드에 붙은 영역이라 의도와 어긋나지 않지만, 제스처 **면적이 늘어난 것은 사실**이다.
- 끌기 뒤의 click 리타깃 대상이 앞 카드 → 래퍼로 바뀌었다. 래퍼는 카드 안 모든 컨트롤의 **조상**이므로 `QA-2-001` 보호는 동일하거나 더 넓다.
- `SwipeDeck` prop 이 1개 늘었다. **기본 경로(prop 미지정)는 코드 경로가 그대로**다.

## F-2. `SwipeDeck.tsx` — 바꾼 것 / 안 바꾼 것

**열었다.** `SwipeDeck.css` 는 **열지 않았다** (diff 0건, `overflow` 선언 여전히 0건 → `QA-1-L1` 유지).

| 바꾼 것 | 내용 |
|---|---|
| prop 추가 | `gestureSurfaceRef?: RefObject<HTMLElement \| null>` (optional — 비파괴적) |
| 핸들러 시그니처 | `event.currentTarget` 대신 **`surface` 를 인자로** 받는다 (`beginPress`/`trackPress`/`endDrag`). 로직 본문은 동일 |
| 등록 방식 | `gestureSurfaceRef` 가 있으면 surface 에 native 리스너, 없으면 **기존처럼 앞 카드의 React 핸들러**. 두 경로가 **같은 함수**를 쓴다 (로직 1벌) |

| 안 바꾼 것 |
|---|
| `SWIPE_THRESHOLD_RATIO`(0.25) · `SWIPE_THRESHOLD_MIN_PX`(48) · `OVERSCROLL_DAMPING`(4) · `SWIPE_SLOP_PX`(8) |
| 방향 판정 · exit 애니메이션 · `prefers-reduced-motion` 분기 · `advance()` |
| 키보드 경로 · `KEY_OWNING_SELECTOR` · `aria-live` · 뒤 카드 렌더 · `controls` |
| `SwipeDeck.css` (diff 0건) |

`onboarding.css` 에는 `touch-action: pan-y` 1줄을 `.haru-survey-deck` 에 더했다 — 앞 카드와 **같은 값**이라 카드 위 터치 동작은 바뀌지 않고, 버튼 위 터치만 제스처로 인정된다.

## F-3. 회귀 테스트 5종 — 수정 전 FAIL 확인 포함

| # | 테스트 | 수정 전 | 수정 후 |
|---|---|---|---|
| 1 | **모서리 −10px(버튼 히트 한가운데)에서 끌면 스와이프** | **FAIL** (`Expected 7 / Received 6`) | PASS |
| 2 | 모서리 **−20px** 에서 끌면 스와이프 (되돌린 기존 테스트 + 신규 동일 케이스) | **FAIL** (`Expected 7 / Received 6`) | PASS |
| 3 | 버튼을 **제자리에서** 누르면 클릭 (다음·이전 둘 다) | PASS (이미 동작) | PASS |
| 4 | 카드 **안** 라디오·체크박스·텍스트 입력·`Add` 버튼 클릭 (`QA-2-001` 가드) | PASS | PASS |
| 5 | **터치(CDP)** — −10px 에서 밀면 스와이프, 제자리 탭은 클릭 | **FAIL** (`Expected 7 / Received 6`) | PASS |

**★ 기존 테스트 되돌림**: `마우스로 끌면 제스처는 그대로 동작한다` 의 시작점을 **−60px → −20px 으로 복구**했다. 앞 라운드에서 시작점을 옮겨 통과시킨 것은 회귀를 테스트 조정으로 가린 처리였고, 철회한다.

## F-4. baseline 재촬영

`pnpm test:e2e:update`(기본 모드 `changed`)로는 **1건도 갱신되지 않았다** — 기존 baseline 이 허용치(diff 6~12px < 20) 안이라 "실패"가 아니기 때문이다. 그래서 해당 5건에 한해 `--update-snapshots=all` 로 강제 재촬영했다.

재촬영: `s2-deck-reading-together` · `s2-deck-books-q3` · `s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability` (**5건**).

**육안 확인 결과: 버튼이 보인다** — 다만 **안쪽 절반만** 보인다. 영역 클립이 `page.locator('main')` 인데 `main` 은 `AppColumn` 의 gutter **안쪽**(= 카드 폭 345)이라, §18.8 이 정리한 대로 버튼의 바깥 절반(gutter 19px)은 구조적으로 클립 밖이다.

**판단: 클립 범위를 바꾸지 않는다.**
1. `page.locator('main')` 은 §11.2 영역 클립 12건이 공유하는 규약이다. 5건만 바꾸면 "영역 클립" 의 정의가 조용히 갈라진다.
2. baseline 이 **더 이상 낡지 않았다** — 버튼의 존재·세로 위치·모서리 정렬이 이미 이미지에 기록된다 (최단 카드 `s2-deck-books-favorites` 에서도 세로 중앙에 보인다).
3. 클립이 빠뜨리는 바깥 절반의 기하는 **수치 회귀 테스트**(중심 편차 0.0px · 320/393/480/600 뷰포트 포함)가 스크린샷보다 강하게 고정하고 있다.
4. `AppColumn` 으로 넓히면 5건에만 페이지 배경 그라디언트가 들어와 flake 면적이 커진다.

## F-5. 검증 (**8/8 PASS**)

```
pnpm typecheck       PASS
pnpm lint            PASS (0 problems)
pnpm test            PASS — Test Files 101 / Tests 1103
pnpm lint:boundaries PASS — no dependency violations (460 modules, 1544 deps)
pnpm build           PASS
pnpm format:check    PASS
pnpm assert:no-mocks PASS
pnpm test:e2e        PASS — **159 passed / 0 failed** (단독 실행, E 라운드 154 + 신규 5)
```

## F-6. 회귀 가드 확인

- **`QA-2-001` 회귀 없음** — 카드 안 라디오·체크박스·텍스트 입력·`Add` 버튼 마우스 클릭이 전부 동작한다 (전용 테스트 + 기존 `마우스 클릭으로 덱 안 라디오를 선택하고 다시 해제한다` · `대조군` · 터치 탭 전부 PASS). 캡처는 여전히 `SWIPE_SLOP_PX` 이후에만 건다.
- **`QA-1-L1` 회귀 없음** — `SwipeDeck.css` **diff 0건**, `overflow` 선언 **0건**(남은 1건은 "선언이 없다"는 주석 문장). `onboarding.css` 에도 `overflow` 신규 0건.
- 유지 확인: 버튼 배치(세로 중앙·모서리 정렬, 실측 편차 0.0px) · `S2-FIX-4` · `S2R-OPEN-15` 격리 · `S2R-OPEN-16` · `aria-hidden`+`tabIndex=-1` · 신규 토큰 0건 · 신규 문구 0건 · 자동 전진/`visited`/포커스/`requestReturnTo` 미변경.
