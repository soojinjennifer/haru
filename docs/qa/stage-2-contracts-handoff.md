# Stage 2-CONTRACTS Handoff — `packages/contracts` 도메인 확장

Status: IMPLEMENTED (2026-09-25, development-agent)
Step: `docs/workflow/stage-2/stage-2-CONTRACTS.md` (Queue 1/7)
Scope: `docs/plans/stage-2-plan.md` §7.1 (APPROVED 2026-09-25) · `docs/decisions/stage-2-approvals.md` §4 D-1 · D-2 · D-10 · D-16 · D-17

> 이 Step 은 **contracts 만** 다룬다. 화면 · Mock Adapter · Query hook 은 후속 Step (`2-UI` 이후) 이다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-2-plan.md` = `APPROVED` | 충족 (2026-09-25, user) |
| `docs/design/stage-2-design-spec.md` = `APPROVED` | 충족 (2026-09-25, user) |
| Stage 1 QA `PASS` | 충족 (`docs/qa/stage-1-qa-report.md`) |
| Plan ↔ PRD / Figma 모순 | 없음 (§6 에 NEEDS_DECISION 3 건 기록 — 모순이 아니라 미확정 목록) |
| In Scope 에 Backend 구현 | 없음 — `apps/api/` · `supabase/` 미생성 확인 |

---

## 2. 구현한 AC

| AC | 내용 | 이 Step 에서의 상태 |
|---|---|---|
| **AC-2-46** | Plan §7.1 표의 schema 가 전부 존재하고 `API_CONTRACTS.md` §3.4 · §4 Stage 2 와 일치 | 충족 (§3 파일 목록 · §4 문서 동기화). `apps/web` 타입 재선언 0 건 — 이 Step 은 `apps/web` 을 건드리지 않았다 |
| **AC-2-47** | 신규 enum 3 종 + §18-④ 문서 동기화 | 충족 — enum 26 종 스냅샷 테스트 + `API_CONTRACTS.md` §2.2 표 3 행 추가 |
| **AC-2-48** | Error Code 신규 0 건 | 충족 — `common/error-codes.ts` 무수정. Mock 재현은 후속 Step |
| **AC-2-49** | 런타임 의존 `zod` 뿐 + 시간 검증은 clock 주입 팩토리 | 충족 — `package.json` dependencies = `{"zod":"^4.6.5"}`, `lint:boundaries` 통과, `Date.now()`/`new Date()` 직접 호출 0 건 |

---

## 3. 생성 · 수정 파일 (전부 `packages/contracts/`)

### 신규 (33)

| 영역 | 파일 |
|---|---|
| enums (+3 → 26 종) | `src/enums/consent-source.ts` · `onboarding-status.ts` · `plan.ts` |
| auth | `src/auth/index.ts` · `password.ts` · `session.ts` · `sign-in.ts` · `sign-up.ts` |
| me | `src/me/index.ts` · `me.ts` · `update-caregiver.ts` |
| consent | `src/consent/index.ts` · `documents.ts` · `record.ts` |
| onboarding | `src/onboarding/index.ts` · `answers.ts` · `books.ts` · `child-info.ts` · `draft.ts` · `goals.ts` · `options.ts` · `save-step.ts` · `state.ts` · `submit.ts` · `survey.ts` · `temperament.ts` |
| children | `src/children/index.ts` · `child.ts` · `growth-capability.ts` · `persona.ts` · `profile.ts` · `snapshot.ts` |
| books | `src/books/index.ts` · `search.ts` |
| rules | `src/rules/capability-score.ts` |
| 테스트 | `src/__tests__/auth.test.ts` · `consent.test.ts` · `onboarding-child-info.test.ts` · `onboarding-flow.test.ts` · `capability-score.test.ts` · `profile-and-me.test.ts` |

### 수정 (4)

- `src/index.ts` — 신규 도메인 re-export (deep import 금지 유지)
- `src/enums/index.ts` — 신규 enum 3 종 re-export
- `src/rules/index.ts` — `capability-score` re-export
- `src/__tests__/enums.test.ts` — 스냅샷 23 → **26 종**

### 문서

- `docs/API_CONTRACTS.md` — §2.2 표 · §3.4 구현 반영 · §4 Stage 2 구현 반영 (§4 참조)

---

## 4. 추가한 enum · schema · 순수 함수

### enum 3 종 (23 → 26)

| enum | 값 |
|---|---|
| `ConsentSource` | `signup_email, signup_oauth, settings, reconsent` |
| `OnboardingStatus` | `not_started, in_progress, completed` |
| `Plan` | `free` |

기존 23 종의 이름 · 값 · 순서는 **변경 없음** (스냅샷 테스트가 보증).

### schema

- **auth**: `AuthProvider` · `AuthSession` · `AuthResult` · `SignUpWithEmailInput`(`.strict()`) · `SignInWithEmailInput` · `RequestPasswordResetInput` · `UpdatePasswordInput`
- **me**: `Caregiver` · `ParentVerification` · `MeChildRef` · `MeResponse` · `UpdateCaregiverRequest`
- **consent**: `ConsentDocument` · `CurrentConsentDocuments` · `ConsentItem` · `RecordConsentsRequest` · `ConsentStatus`
- **onboarding**: `ChildInfoAnswers` · `TemperamentAnswers` · `BooksAnswers`(`FavoriteBook` · `HomeBook`) · `GoalsAnswers` · `SurveyItem` · `SurveyScaleLabel` · `SurveyInstrument` · `CapabilityItemAnswer` · `CapabilityItemsAnswers` · `CompleteCapabilityItemsAnswers` · `OnboardingDraftAnswers` · `CompleteOnboardingAnswers` · `OnboardingStepState` · `OnboardingState` · `SaveOnboardingStepRequest` · `SubmitOnboardingRequest` · `ProfileResult` · `OnboardingDraft` + 선택지 코드 `LanguageEnvironment` · `ReadingRoutine` · `TopicTag` · `GrowthGoal` · `ActivityLevel` · `NewSituationResponse` · `AttentionStyle` · `PreferredActivity`
- **children**: `Child` · `CapabilityScore` · `CapabilitySnapshotSource` · `CapabilitySnapshot` · `Persona` · `ChildProfile` · `SetGrowthCapabilityRequest`
- **books**: `BookSummary` · `SearchBooksRequest` · `SearchBooksResponse`

### 순수 함수 · 팩토리 (전부 clock 주입, `Date.now()` 미사용)

| 함수 | 결정 | 설명 |
|---|---|---|
| `createBirthYearMonthSchema(now)` | **D-10** | `YYYY-MM` 형식 + 3.0 세 이상 10.0 세 미만 refine |
| `createChildInfoAnswersSchema(now)` | D-10 | Step 1 전체 + 나이 범위 |
| `createSubmitOnboardingRequestSchema(now)` | D-10 | 제출 payload + 나이 범위 |
| `childAgeInMonths(birthYearMonth, now)` | D-10 | 만 나이(개월). 나이 Tag("3yr 4mo") 파생용. 형식 불일치는 `null` |
| `scoreCapabilities(items, answers)` | C-8 | 역량별 평균(소수 1 자리), `not_observed`·미응답 제외, 전부 결측이면 `score: null` + `itemCount` · `missingCount` |
| `selectStrengths(scores)` | **D-2 ③** | 높은 순 최대 2 개. `score: null` 역량 제외 |
| `selectGrowingEdges(scores)` | **D-2 ③** | 낮은 순 최대 2 개. `score: null` 역량 제외 + **강점과 중복 금지** |
| `suggestGrowthCapability(scores)` | **D-2 ④·⑤** | 가장 낮은 **관찰된** 역량. 전 역량 결측이면 `null` |
| `capabilityHighlightCount(scoredCount)` | D-2 ③ | 관찰 역량 수에 따른 제시 개수 (0·1→0, 2·3→1, 4→2) |
| `hasAllRequiredConsents(status)` | C-1 | `missing` 이 비었는지 |
| `isOnboardingDraftExpired(updatedAt, now)` | **D-3** | 로컬 draft 30 일 보관 상한. 해석 불가한 값은 만료 처리 |

동점 처리는 전부 **역량 선언 순서**(`CAPABILITIES`)로 결정적으로 깬다 — 같은 입력이면 항상 같은 결과다.

### 결정 반영 확인

| 결정 | 반영 |
|---|---|
| **D-1** | `ChildInfoAnswers.lastName = z.string().trim().max(40).optional()` — 미입력 통과 테스트 있음 |
| **D-2** | `score: null` 유지 · `itemCount`/`missingCount` · null 역량을 강점/growing edge/발전 역량 후보에서 제외. **시각 표현(②)은 Stage 2-B — 이 Step 에 없음** |
| **D-10** | 팩토리 3 종 + `childAgeInMonths`. schema 내부 `new Date()` 0 건 |
| **D-16** | `relationship` · `timezone` 은 `UpdateCaregiverRequest` 에만 존재. `ChildInfoAnswers` 가 두 필드를 strip 함을 테스트로 보임 |
| **D-17** | `BookSummary{id,title,author,coverUrl?}` + 검색 요청/응답만. `LibraryBook` · 소유 · 증정 · 프롬프트 없음 (Stage 3 필드가 strip 됨을 테스트로 보임) |

---

## 5. `docs/API_CONTRACTS.md` 동기화 내용

1. **§2.2 머리 주석** — "구현 반영 (Stage 2-CONTRACTS)" 블록 추가: enum 23 → **26 종**, 파일 위치, 기존 23 종 무변경 명시.
2. **§2.2 표** — `ConsentSource` · `OnboardingStatus` · `Plan` 3 행 추가 (Stage 2 Plan §18-④ 보고 결과 반영).
3. **§3.4 뒤** — "구현 반영 (Stage 2-CONTRACTS)" 표 추가: 스케치 ↔ 구현 파일 1:1 매핑과 스케치와 달라진 부분의 결정 근거(D-1 · D-2 · D-3 · D-4 · D-10 · D-16 · D-17).
4. **§4 Stage 2 표 뒤** — Endpoint ↔ Request/Response schema 이름 대응표 추가 + 다음 3 가지를 명시:
   - `Me.plan` 은 **최상위 1 곳**. Plan §7.1 이 `caregiver.plan` 과 최상위 `plan` 을 함께 적었으나 같은 값을 두 곳에 두지 않는다 (§4 Stage 2 표 기준).
   - VPC 는 contract 미정의, `parentVerification.status` 슬롯만.
   - Error Code 신규 0 건, Mock/Http Adapter 는 후속 Step.

---

## 6. 검증 명령과 결과 (공통 7 종)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | PASS (root + e2e + 5 workspace) |
| `pnpm lint` | PASS (오류 · 경고 0) |
| `pnpm test` | PASS — **560 tests / 68 files** (직전 469 / 62 → **+91 / +6**, 회귀 0) |
| `pnpm lint:boundaries` | PASS — `no dependency violations found (283 modules, 740 dependencies cruised)`. `contracts-runtime-deps-zod-only` · `contracts-no-workspace-deps` 유지 |
| `pnpm build` | PASS — tokens + `vite build` (`dist/assets/index-*.js` 390.69 kB) |
| `pnpm format:check` | PASS |
| `pnpm test:e2e` | PASS — **58 passed** (50 + shadow 8, 회귀 0) |

Scope 확인: `apps/` = `web` 만, `packages/` = `config` · `contracts` · `design-tokens` · `ui`. `apps/api/` · `supabase/` **없음**.
`packages/contracts/package.json` dependencies = `{"zod": "^4.6.5"}`.

### Step 문서가 요구한 단위 테스트

| 요구 | 파일 · 테스트 |
|---|---|
| enum 26 종 스냅샷 | `enums.test.ts` — `toHaveLength(26)` + 값·순서 전수 |
| `lastName` 미입력 통과 | `onboarding-child-info.test.ts` — "lastName 없이 통과한다" |
| `score: null` parse | `profile-and-me.test.ts` — `CapabilitySnapshot` null 행 / `capability-score.test.ts` |
| null 제외 함수 경계 | `capability-score.test.ts` — 0·1·2·3·4 관찰 경계, 강점↔growing edge 중복 금지, 전 역량 결측 |
| 생년월 팩토리 (주입 clock, 3.0 / 9.99 경계) | `onboarding-child-info.test.ts` — 36 개월 통과 / 35 개월 거부, 119 개월 통과 / 120 개월 거부, clock 을 바꾸면 판정이 바뀜 |
| 검색 응답 parse | `profile-and-me.test.ts` — `SearchBooksResponse` (결과 있음 · 빈 결과), Stage 3 필드 strip |

---

## 7. Mock 시나리오

**이 Step 에는 없다.** Mock Adapter · scenario 는 후속 Step (`2-AUTH` · `2-CONSENT` · `2-ONBOARDING` · `2-HOME`) 범위다.
이 Step 은 후속 Mock 이 요청 · 응답을 parse 할 schema 를 제공하는 데까지다.

---

## 8. `BACKEND_INTEGRATION_PENDING` 예상 항목 (Stage 8 Handoff 대상)

| 항목 | 이유 |
|---|---|
| 서버 측 필수 동의 강제 (`CONSENT_REQUIRED`) | Frontend 는 `ConsentStatus.missing` 으로 UI 를 막을 뿐이다. 온보딩 쓰기 경로의 실제 거부는 서버 책임 |
| `consent_events` append-only 보존 · 문서 버전별 기록 | Consent History (PRD §12.1) |
| `children.caregiver_id` UNIQUE → `CHILD_LIMIT_REACHED` | DB 제약 |
| Idempotency 결과 24h 보관 (`POST /v1/consents` · `/onboarding/submit`) | 서버 저장소 필요 |
| 페르소나 생성 · Safety Filter · fallback (`Persona.isFallback`) | AI Provider + 검수 파이프라인 |
| `capability_snapshots` · `capability_scores` 저장 (`score` NULL 허용) | DB schema |
| `books` 검색 원본 데이터 · cursor 발급 | 서버 검색 |
| VPC (C-3) | 방식 미정 (법무 L-01). `parentVerification.status` 슬롯만 존재 |
| `timezone` 을 서버가 신뢰 · 저장 (`caregiver_profiles.timezone`) | D-16 전송 경로만 정의됨 |
| RLS · 소유권 검증 (`FORBIDDEN` · `CHILD_NOT_FOUND`) | Backend |

---

## 9. Scope 경계에서 보류한 항목

| 보류 | 근거 |
|---|---|
| 프로필 결과 · 발전 역량 **화면** 표시 규칙 (D-2 ②) | **Stage 2-B**. contracts 의 데이터 형태까지만 |
| `LibraryBook` · `BookPrompts` · `GiftRequest` · `HomeSummary` · `ActivityCard` | Stage 3 |
| `CreateSession*` · `RecordingUpload*` | Stage 4 |
| `ConsentHistory` (`GET /v1/consents`) | Stage 8 (C-19 선택 기능) |
| `UpdateChild` (`PATCH /v1/children/:childId`) · snapshot/persona 목록 endpoint | Stage 6 · 7 |
| localStorage 키 `haru.onboarding.draft.v1` | 로컬 저장소 키는 `apps/web` 소유. contracts 는 schema · 보관 상한 규칙만 |
| Mock Adapter · Http Adapter · Query hook · 화면 | 후속 Step |

---

## 10. 발견한 문제

### Blocking
없음.

### Non-blocking (구현 시 판단하고 문서에 반영)

| # | 항목 | 처리 |
|---|---|---|
| N-1 | Plan §7.1 `MeResponseSchema` 가 `caregiver{… plan}` 과 최상위 `plan` 을 **둘 다** 적었다 | 같은 값을 두 곳에 두면 Mock·서버가 어긋날 수 있으므로 `API_CONTRACTS.md` §4 Stage 2 표(최상위 `plan`)를 따랐다. 문서에 근거를 명시했다 |
| N-2 | `SaveOnboardingStepRequest` 의 응답 schema 는 Zod 기본 `strip` 이라 **다른 단계의 필드가 조용히 제거**된다 (거부되지 않는다) | Plan §7.3 이 `.strict()` 를 `SignUpWithEmailInput` 하나로 제한했으므로 규약을 지켰다. strip 동작을 테스트로 고정했다 |
| N-3 | `Capability` 4 개 중 관찰된 역량이 **1 개뿐**이면 강점·growing edge 를 둘 다 비운다 | 같은 역량을 "강점"이자 "키울 점"으로 동시에 제시하지 않기 위한 규칙. `capabilityHighlightCount` 로 명시하고 테스트로 고정했다. 화면은 0 개 상태를 처리해야 한다 (`2-UI` 이후 전달) |
| N-4 | `Caregiver.timezone` 을 IANA 목록으로 검증하지 않는다 | 목록 검증은 `zod` 외 런타임 의존(tzdata)을 요구한다. 형식만 검사하고 유효성은 Backend 요구사항으로 넘긴다 |

### NEEDS_DECISION (구현을 막지 않음 — 코드 값만 교체 가능한 형태로 둠)

| # | 항목 | 현재 처리 | 결정 필요 대상 |
|---|---|---|---|
| D-A | **온보딩 선택지 목록의 소유자와 최종 문구** — `LANGUAGE_ENVIRONMENT_CODES` · `READING_ROUTINE_CODES` · `TOPIC_TAG_CODES` · `GROWTH_GOAL_CODES` · 기질 4 축 코드 | PRD §7.2 는 축과 `topic_tags` 예시(동물/탈것/공주/과학)만 확정했다. 나머지는 **RECOMMENDED 최소 목록**으로 `src/onboarding/options.ts` · `temperament.ts` 한 곳에 모아 두었고, 표시 문구는 copy 모듈이 소유한다 | Design Spec §2.10 이 "contracts 확정 후 주입 / NEEDS DECISION" 으로 남긴 항목. 사용자·디자이너 결정 시 **코드 배열만** 교체하면 화면·Mock 이 따라간다 |
| D-B | 성장 목표(`GROWTH_GOAL_CODES`)가 4 대 역량 라벨과 겹치지 않아야 한다는 규칙 | 겹치지 않는 별도 코드 집합으로 정의 | 최종 목록 확정 시 재확인 |
| D-C | 각 단계의 **필수/선택** 여부 | Step 1 은 `firstName` · `birthYearMonth` · `gender`(null 허용) 만 요구하고, Step 2 · 3 · 4 는 전부 선택으로 두었다 (PRD §7.2 "부담 없게 수집", 최소 수집 원칙) | 제품 결정으로 필수화하려면 schema 와 화면 CTA 조건을 함께 바꿔야 한다 |

> **`languageEnvironment` 는 선택 사항이다** (사용자 결정 `§11.22`, 2026-10-04 — 이 표가 처음 적었던 "Step 1 필수" 서술을 대체한다. 현행 근거: `stage-2-rework-handoff.md` 부록 D). Backend 요구사항: 서버는 **빈 배열을 거부하면 안 되고**(`.min(1)` 금지) **기본값을 다시 채우면 안 된다** — 사용자의 명시적 해제를 덮어쓴다. 기본값 `['english']` 적용 지점은 **Frontend 제출 경계 한 곳**(`buildSubmitRequest`)이다.

---

## 11. 다음 Step 인계

- `2-UI` 는 이 Step 의 schema 를 **읽기만** 한다. `apps/web` 에 같은 모양의 타입을 다시 선언하지 않는다 (`z.infer` 사용, deep import 금지 — `@haru/contracts` 진입점만).
- Mock 을 만드는 Step 은 `createBirthYearMonthSchema(now)` · `createSubmitOnboardingRequestSchema(now)` 에 **고정 clock 을 주입**해야 시나리오가 결정적이다 (AC-2-52).
- 온보딩 선택지 렌더는 `options.ts` · `temperament.ts` 의 코드 배열을 참조하고, 표시 문구는 copy 모듈에 둔다 (하드코딩 금지).
