# Stage 2-CONSENT Handoff — 보호자 동의 5항목 · VPC 슬롯 · Privacy 불변식

작성: development-agent · 2026-09-25
Step 문서: `docs/workflow/stage-2/stage-2-CONSENT.md` · Queue: `docs/workflow/stage-2/QUEUE.md`

> 이 Step 은 **동의·VPC 구간**만 다룬다. 온보딩(`2-ONBOARDING`) · Home/설정(`2-HOME`) 화면은
> 만들지 않았다. Stage 2-B(`/onboarding/profile` · `/onboarding/growth-capability`)와
> Stage 3(BottomTabBar · 서재 · Activity Card)도 선구현하지 않았다.
> 동의 **철회** UI(C-4)와 동의 **이력 보기**(Stage 8, C-19)는 만들지 않았다.

---

## 1. Gate 확인

| 항목 | 결과 |
|---|---|
| `docs/plans/stage-2-plan.md` `APPROVED (2026-09-25, user)` | 충족 |
| `docs/design/stage-2-design-spec.md` `APPROVED (2026-09-25, user)` | 충족 |
| 이전 Stage QA PASS (Stage 1) | 충족 |
| D-1 ~ D-17 확정 (`docs/decisions/stage-2-approvals.md` §4) | 충족 — 이 Step 은 **D-4** · D-5 · D-7 · D-8 · D-13 적용 |
| Plan In Scope 에 Backend 구현 없음 | 충족 (`apps/api/` · `supabase/` 미생성 확인) |
| 선행 Step `2-AUTH` COMPLETE | 충족 |

---

## 2. 구현한 요구사항 / AC

FR-02(보호자 동의 수집·기록) + VPC 슬롯 범위.

| AC | 상태 | 근거 |
|---|---|---|
| **AC-2-10** `/auth/consent` 5항목 개별 체크 · 필수 여부는 Mock `ConsentDocument.required` 값에서만 | 구현 | `consentSelection.test.ts` "서버가 필수 여부를 바꾸면 규칙도 그대로 따라간다" · `consent-screens.test.tsx` "화면 코드가 항목 목록을 갖고 있지 않다" · `e2e/consent.spec.ts` 체크박스 5개 |
| **AC-2-11** 필수 미체크 시 제출 차단 + 이유 안내 | 구현 | `consent-screens.test.tsx` `aria-disabled`/`aria-describedby` 4건 · `e2e` "필수 미체크 CTA" |
| **AC-2-12** Email · Google · Apple 3경로 모두 `/auth/consent` 도달 | 구현 | `e2e/consent.spec.ts` 3건 |
| **AC-2-13** 동의 기록 성공 이전 구간 요청에 **아동 데이터 0건** | 구현 | §4 (전용 전수 검사) |
| **AC-2-14** 동의 미완료 시 온보딩 진입 차단 | 구현(Guard·Mock 부분) | `consent-screens.test.tsx` "필수 동의가 남아 있으면 Guard 가 온보딩 경로를 동의 화면으로 되돌린다" · 서버 강제는 `P2-BIP-03` |
| **AC-2-15** `consent-version-outdated` 재동의 화면 | 구현 | `consent-screens.test.tsx` 재동의 3건 · `MockConsentApi.test.ts` 버전 3건 |
| **AC-2-16** `Idempotency-Key` 첨부 · 동일 key + 동일 body replay | 구현 | `MockConsentApi.test.ts` "Idempotency-Key 보관·재생" 4건 |
| **AC-2-17** VPC 슬롯 route · `vpc-pending` 유지 · `vpc-failed` 재시도 · 온보딩 차단 · `success` 통과 | 구현 | `consent-screens.test.tsx` VPC 6건 · `e2e/consent.spec.ts` 2건 |
| **AC-2-18** 문서 링크가 D-4 대로 열리고 **본문이 코드·fixture 에 없다** | 구현 | §5 |
| **AC-2-38 / AC-2-65** 진단·판정 표현 0건, `last name` 미사용 | 구현 | `consent-screens.test.tsx` "copy 규칙" 2건 |
| **AC-2-48** 신규 Error Code 0건 (기존 28종 범위) | 구현 | `MockConsentApi` 는 `CONSENT_VERSION_OUTDATED`·`VALIDATION_FAILED`·`IDEMPOTENCY_KEY_REUSED`·`INTERNAL_ERROR` 만 사용 |
| **AC-2-50~53** Mock scenario · 결정성 · catalogue key 준수 | 구현 | `MockConsentApi.test.ts` 27건 |
| **AC-2-56** 구현 baseline | 구현(2건) | `s2-consent` · `s2-vpc-failed` |
| **AC-2-59 / AC-2-60** 반응형 4폭 · 키보드 · 터치 44 · group semantics | 구현 | `e2e/consent.spec.ts` 7건 |
| **AC-2-63 / AC-2-64 / AC-2-66** 로그 PII 0건 · 비밀번호 잔존 0건 · 외부 요청 0건 | 구현 | §4 |

---

## 3. 생성 · 수정 파일

### 신규 — `apps/web`
| 파일 | 내용 |
|---|---|
| `src/shared/api/consent-api.ts` | `ConsentApi` interface (`getCurrentDocuments` · `record`) |
| `src/shared/api/options.ts` | `ApiMutationOptions` — `Idempotency-Key` 를 호출자가 넘기는 규약 |
| `src/shared/api/http/HttpConsentApi.ts` | Http Adapter 골격 (공개 endpoint · IK 헤더 · schema parse) |
| `src/shared/lib/idempotency.ts` | `createIdempotencyKey()` (앱 경로 전용 난수 uuid) |
| `src/mocks/fixtures/consent.ts` | 동의 문서 5종 fixture (current / updated 2 묶음) |
| `src/mocks/consent/consentState.ts` | `MockConsentApi` ↔ `MockMeApi` 공유 동의 상태 |
| `src/mocks/consent/MockConsentApi.ts` | Mock Adapter (scenario 7종 · 버전 검사 · IK 보관·재생) |
| `src/entities/consent/{consentKeys,useConsentDocuments,useRecordConsents,index}.ts` | query key · query · mutation |
| `src/features/consent/copy.ts` | 화면 골격 문구 (동의 **항목 문구는 없음** — API 값) |
| `src/features/consent/model/consentSelection.ts` | 선택·제출 가능·요청 조립·재동의 판정 **순수 함수** |
| `src/features/consent/ui/{ConsentRow,GuardianConsentForm,VpcStep}.tsx` | 행 · 폼 · VPC 슬롯 |
| `src/features/consent/consent.css` | 행 구분선 · legend 시각 숨김 · VPC 배지 (토큰만) |
| `src/features/consent/index.ts` | feature 공개 진입점 |
| `src/pages/auth/GuardianConsentPage.tsx` · `ParentVerificationPage.tsx` | Composition only |

### 신규 — 테스트
| 파일 | 건수 |
|---|---|
| `apps/web/src/features/consent/model/__tests__/consentSelection.test.ts` | 14 |
| `apps/web/src/mocks/__tests__/MockConsentApi.test.ts` | 27 |
| `apps/web/__tests__/consent-screens.test.tsx` | 32 (AC-2-13 전용 4건 포함) |
| `e2e/consent.spec.ts` | 15 |
| baseline `e2e/__screenshots__/darwin/visual.spec.ts/s2-consent.png` · `s2-vpc-failed.png` | 2 |

### 수정 — `packages/ui`
| 파일 | 내용 |
|---|---|
| `src/button/Button.tsx` | 소비자가 넘긴 `aria-disabled` 를 **존중**한다 — native `disabled` 없이 누름만 무시(포커스 유지). Design Spec §2.6 인계 메모 요구 |
| `src/button/Button.css` | `[aria-disabled='true']:not(:disabled)` 비활성 표현 + hover/active 제외. 기존 `disabled` 버튼은 두 선택자 모두에 걸리므로 **시각 변화 0** (baseline 33건 그대로 통과) |
| `src/icon/registry.ts` | `shield-check` 추가 (VPC 배지 — Design Spec §2.7) |

### 수정 — `apps/web`
| 파일 | 내용 |
|---|---|
| `src/shared/api/types.ts` · `index.ts` · `http/index.ts` | `consents` Adapter 등록 |
| `src/shared/config/legal-links.ts` | placeholder URL 3건 추가 (§5) |
| `src/mocks/index.ts` | `consents` Adapter + `consentState` 를 번들에 조립 |
| `src/mocks/me/MockMeApi.ts` | `consent-missing` · `consent-version-outdated` 의 `missing` 을 `consentState` 에서 계산 |
| `src/mocks/fixtures/me.ts` | `grantedAt` 주입 옵션(재동의 표현) · 필수 동의 목록을 `fixtures/consent.ts` 에서 파생 |
| `src/app/router.tsx` | `/auth/consent` · `/auth/verify-parent` 등록 (TopBar centered, **leading 없음**) |
| `src/pages/auth/index.ts` · `src/styles/index.css` | 진입점 · CSS 등록 |
| 기존 테스트 3종 (`guard-integration` · `providers` · `MockMeApi`) | `ApiClients.consents` · `consentState` 필드 추가에 맞춰 stub 보강 (단언은 그대로) |

`apps/api/`, `supabase/` 는 만들지 않았다 — `apps/` = `web` 만, `supabase` 없음.

---

## 4. AC-2-13 증거 — 동의 기록 성공 이전 구간, 아동 데이터 0건

**수집기는 2-AUTH 의 것을 그대로 재사용했다** (새로 만들지 않음):
`apps/web/src/mocks/request-log.ts` — `createRequestLog()` · `findChildDataKeys()` ·
금칙 키 10종(`firstName` `lastName` `birthYearMonth` `gender` `answers` `draftAnswers`
`childId` `child` `temperament` `capabilityItems`).

이번 Step 에서 **로그 범위를 동의 구간까지 확장**했다.
`MockConsentApi` 가 두 호출을 모두 기록한다 — `GET /v1/consent-documents/current`(본문 없음),
`POST /v1/consents`(**parse 결과 payload 전체**).

### 검사 방법 (전수)

`apps/web/__tests__/consent-screens.test.tsx` 의 `entriesThroughConsent()` 가
로그에서 `POST /v1/consents` 가 처음 나타나는 지점까지를 잘라 낸다 — 즉 **동의 기록이
성공하기 전의 모든 요청 + 동의 기록 요청 자체**가 검사 대상이다.

| 검사 | 결과 |
|---|---|
| 가입 화면 → 실제 제출 → 동의 화면 → 필수 3종 체크 → 동의 기록까지 실제 UI 조작 후 전수 검사 | `findChildDataKeys(구간) === []` |
| 같은 흐름 전체(동의 이후 포함)로 범위를 넓혀도 | `findChildDataKeys(전체) === []` |
| 검사가 헛돌지 않음(vacuous 방지) | 구간 길이 > 2 이고 `AuthGateway.signUpWithEmail` · `POST /v1/consents` 가 **포함되어 있음**을 먼저 단언 |
| 동의 화면 · VPC(`pending`·`failed`) 화면을 열기만 해도 | 3 scenario 모두 아동 키 0건 (요청이 1건 이상 있었음을 먼저 확인) |
| `POST /v1/consents` payload 실제 내용 | `{ items: [{type, documentId, action:'granted'} × 3], source }` — 아동 필드 없음 (완전 일치 단언) |
| 아이 필드가 섞여 들어온 요청 | contracts parse 가 제거 → 로그·전송 어디에도 남지 않음 (`'Nova'` 문자열 0건) |
| 요청 로그에 비밀번호 원문 | 0건 (`redactSecrets`) |
| Mock 단위 레벨 | `MockConsentApi.test.ts` "요청 로그 — 아동 데이터 0건" 2건 |
| 브라우저 레벨 | `e2e/consent.spec.ts` — 동의 화면까지 외부 도메인 요청 0건 |

### 진입 차단 (Guard)

`resolveGuardDecision` 을 직접 호출해 **전 경로**를 확인했다.
필수 동의가 남아 있으면 `/onboarding` · `/onboarding/child-info` · `/onboarding/saved` · `/`
가 모두 `/auth/consent` 로 리다이렉트된다. VPC 가 `pending`·`failed` 면 온보딩 경로가
`/auth/verify-parent` 로 되돌아간다. 즉 **아동 데이터 입력 화면에 도달할 수 없다.**

---

## 5. `L-02` placeholder URL 처리 (§4.1 추적 조건)

- **새로 만들지 않았다.** `apps/web/src/shared/config/legal-links.ts` 의 기존 단일 출처를
  **5건으로 채웠다** (`termsOfService` · `privacyPolicy` 는 2-AUTH 값 그대로, 신규 3건은
  `childVoiceData` · `marketing` · `pilotParticipation`). 형식은 동일하다:
  `https://haru.invalid/legal/<slug>--placeholder`.
- `.invalid` 는 RFC 2606 예약 TLD 라 **절대 해석되지 않는다.** 링크를 눌러도 어떤 문서도 열리지 않는다.
- **화면 노출 형태**: 각 동의 항목 오른쪽의 `View` 링크 (`TextLink external`) →
  `target="_blank" rel="noopener noreferrer"` + 외부 링크 아이콘 + 시각 숨김 문구
  "Opens in a new tab". 접근성 이름은 `View {문서 제목}` 이라 링크만으로 목적지를 알 수 있다.
- **기계 검사**: `isPlaceholderLegalUrl()` 이 `.invalid/` + `placeholder` 를 확인한다.
  테스트가 5건 전부 `true` 임과 **5건이 서로 다른 주소**임을 고정한다
  (`MockConsentApi.test.ts` · `consent-screens.test.tsx` · `e2e/consent.spec.ts` href 정규식).
- **약관 본문 없음(AC-2-18)**: `ConsentDocument` 키가 정확히
  `documentId · required · title · type · url · version` 6개임을 테스트가 고정한다.
  `/legal/*` route 도 만들지 않았다 (`ROUTES` 에 `/legal` 문자열 0건 — 테스트 고정).

> **QA 확인 항목**: 위 5건 URL 은 **출시 전 차단 항목(launch blocker)** 이다. 법무 `L-02` 로
> 실제 문서가 확정되면 `legal-links.ts` 한 곳만 교체하면 된다. 그 전에는 이 Step 의 어떤
> 코드도 실제 문서를 가리키지 않는다.

---

## 6. VPC 상태 동작 (pending / failed / 재시도)

| `Me.parentVerification.status` | 화면 | 진행 |
|---|---|---|
| `not_required` · `verified` | 안내 카드 + `Continue` | Guard 가 다음 단계로 통과시킨다 (`success` scenario) |
| `pending` | 카드 안 `Spinner`(`role="status" aria-live="polite"`, "We're confirming this step.") + `Continue` 가 `loading` | `Continue` 를 눌러도 Guard 가 다시 이 화면으로 돌려보낸다 → **머문다** |
| `failed` | `InlineAlert tone=error` + **"Try again"** | `Try again` = `GET /v1/me` 재조회. scenario 가 `failed` 인 동안 계속 차단 |

- **검증 endpoint 를 만들지 않았다.** contracts 에 VPC 검증 요청/응답이 없고, 실제 방식은
  법무 `L-01` 미결이다. 그래서 `Continue` 는 요청을 보내지 않고 다음 경로로 넘기며,
  통과 여부는 `me` 로 Guard 가 판정한다 → 방식이 정해져도 **route·Guard 분기는 그대로**다.
- 문구 교체 지점은 `consentCopy.verifyParent.bodySlot` **한 키**다.
- 실패 문구에 사용자 귀책·판정 표현이 없음을 테스트가 고정한다
  (`failed` · `invalid` · `denied` · `rejected` · `wrong` · `error` 0건).
- 이 화면에는 아이 입력 필드가 없다 (textbox 0개 — 테스트 고정).

---

## 7. 검증 명령 결과 (공통 7종 + 2)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **통과** (packages 4 + apps/web, 신규 `any` · `@ts-ignore` 0건) |
| `pnpm lint` | **통과** (0 problems) |
| `pnpm lint:boundaries` | **통과** — `no dependency violations found (379 modules, 1161 dependencies)` |
| `pnpm test` | **통과** — `85 files / 830 tests` (직전 `82 / 758` → **+3 파일 / +72 건**, 회귀 0) |
| `pnpm build` | **통과** — `dist/assets/index-*.js 447.60 kB (gzip 137.46)` |
| `pnpm format:check` | **통과** — `All matched files use Prettier code style!` |
| `pnpm test:e2e` | **통과** — `97 passed` (직전 80 → **+17**) |
| `pnpm assert:no-mocks` | **통과** — sentinel 3종 0건 |
| `apps/api/` · `supabase/` 미생성 | **확인** — `apps/` = `web` 만, `supabase` 없음 |

시각 baseline: 36 → **38** (`s2-consent` · `s2-vpc-failed` 추가).
기존 36건은 **변경 없이 그대로 통과**했다 — `packages/ui` Button 변경이 기존 화면 렌더를
바꾸지 않았음을 확인한 셈이다.

`AppBackground` 가 콘텐츠를 덮는 결함의 재발 없음: 동의 화면은 카드 밖에 **평문 텍스트**
(안내문 · 비활성 이유 문구)를 쓰는데 `s2-consent` baseline 에서 모두 정상 표시된다.

---

## 8. Mock 시나리오 목록과 전환 방법

전환: `?scenario=<group>:<key>[,<group>:<key>]`
우선순위 **URL > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`** (Stage 1 D-5 유지).
`?scenario=` 는 앱 시작 시 한 번 읽혀 SPA 수명 동안 유지된다 — 가입 화면에서 지정하면
동의 화면까지 이어진다.

### `consents` 그룹 (`MockConsentApi`) — 7 key

| key | 동작 | 화면에서 보이는 것 |
|---|---|---|
| `success` | 문서 5종 · 기록 성공 | 정상 동의 화면 |
| `loading` | 주입 timer 지연 | Skeleton 카드 (`role=status aria-busy`) |
| `error` | `INTERNAL_ERROR` | `ErrorState` + "Try again" |
| `retry` | 1회차 실패 → 2회차 성공 | 재시도로 항목이 나타남 |
| `offline` | `NetworkError` | `ErrorState tone=offline` ("You are offline") |
| `consent-missing` | `success` 와 동일 동작 | 의미는 `me` 가 표현한다(그룹 생략 지정 시 경고 방지) |
| `consent-version-outdated` | **버전 `2026-06-01`** 문서 묶음 | 재동의 `InlineAlert tone=info` |

예) `http://localhost:5173/auth/sign-up?scenario=me:consent-missing`
→ 가입 제출 → `/auth/consent`
예) `?scenario=me:consent-version-outdated,consents:consent-version-outdated` → 재동의 화면
예) `?scenario=me:vpc-pending` · `?scenario=me:vpc-failed` → VPC 슬롯
예) `?scenario=me:consent-missing,consents:error` → 문서 조회 실패 화면

### `me` 그룹 동작 변경 (같은 key, 더 정확한 동작)

`consent-missing` · `consent-version-outdated` 의 `missing` 목록이 **고정값이 아니라**
`MockConsentState` 에서 계산된다. `POST /v1/consents` 성공 → `missing` 감소 →
Guard 가 다음 단계로 넘긴다. 그래서 **동의 → (VPC) → 온보딩 입구까지 Mock 만으로
end-to-end 로 진행**된다. `consent-version-outdated` 는 `grantedAt` 이 채워져 있어
재동의(이전 기록 있음)와 최초 동의가 구분된다.

### Mock 이 재현하는 서버 규칙

1. 제출 `documentId` 가 현재 배포 문서와 다르면 → `CONSENT_VERSION_OUTDATED`
2. 필수 동의 누락 → `VALIDATION_FAILED` (화면이 막더라도 별도 검사)
3. `Idempotency-Key` 실제 보관: 같은 key + 같은 body → **최초 응답 재생**,
   같은 key + 다른 body → `IDEMPOTENCY_KEY_REUSED`. 실패한 시도는 저장하지 않아
   같은 key 재시도가 성공한다.

---

## 9. BACKEND_INTEGRATION_PENDING (이 Step 이 확정·추가한 것)

| ID | 내용 | Frontend 가 고정한 계약 | 관련 AC |
|---|---|---|---|
| **P2-BIP-03** | **서버 측 필수 동의 강제** — 동의 없이 `children`·`onboarding_responses` 쓰기 거부 | `CONSENT_REQUIRED` (403). Frontend 는 Route Guard 로만 막는다 | AC-2-13 · AC-2-14 |
| **P2-BIP-04** | `consent_events` **append-only** 이력 · 문서 버전 관리 · `current_consents` view | `POST /v1/consents` `items[{type, documentId, action:'granted'}]` + `source`. `GET /v1/consent-documents/current` 가 **`required` 와 `version` 을 반드시 내려야** 화면이 그려진다 | AC-2-10 · AC-2-15 |
| **P2-BIP-05** | **VPC 실제 방식·검증·기록** (법무 L-01) | `Me.parentVerification.status` 4값만. **검증 endpoint·payload 는 정의하지 않았다** | AC-2-17 |
| **P2-BIP-11** | `Idempotency-Key` 서버 보관 24h · 재생 · 다른 body → `IDEMPOTENCY_KEY_REUSED` | `POST /v1/consents` 에 헤더 첨부. Mock 이 동작을 재현한다 | AC-2-16 |
| **(신규 요구)** | 동의 문서 **본문 호스팅** — Frontend 는 `ConsentDocument.url` 로 외부 링크만 연다 | `url` 은 공개 접근 가능한 절대 URL 이어야 한다. 현재 값은 **placeholder**(§5) | AC-2-18 · 법무 L-02 |
| **(신규 요구)** | `consent_events.source` 에 `signup_oauth` 를 기록하려면 **가입 경로를 서버가 알아야 한다** (§11 ①) | 현재 Frontend 는 `signup_email` 또는 `reconsent` 만 보낸다 | — |

---

## 10. Scope 경계에서 보류한 항목

| 항목 | 이유 |
|---|---|
| 동의 **철회** UI·Contract·`consent-revoked` scenario | **C-4** — MVP 제외. `ConsentAction` 에 `revoked` 가 없다 |
| 동의 **이력 보기**(`GET /v1/consents`) | Stage 8 선택 기능 (C-19) |
| `/legal/*` page · 약관 본문 fixture | **D-4** — 외부 링크로만 연다 |
| 온보딩 화면 · `OnboardingDraftStore` · `PATCH /v1/me` | `2-ONBOARDING` |
| Home · 설정 · 로그아웃 | `2-HOME` |
| `/onboarding/*` route 등록 | `2-ONBOARDING`. 현재 동의 완료 후 `/onboarding` 으로 **이동은 되지만** 화면이 없어 NotFound 가 뜬다 (e2e 는 URL 로 확인) |
| VPC 검증 endpoint | 법무 L-01 미결 + `P2-BIP-05` |
| dev Scenario Panel 에 `consents`·`me`·`auth` 그룹 추가 | `2-AUTH` 가 `health`·`__states` 만 유지한 판단을 그대로 따랐다. URL 파라미터로는 모두 전환된다 |

---

## 11. 발견한 문제 / 결정 필요

### NEEDS_DECISION

**① `consent_events.source` 의 `signup_oauth` 를 구분하지 않았다.**
Google·Apple 로 가입해도 Frontend 는 `signup_email` 을 보낸다.
가입 경로를 기억하려면 (ⓐ `AuthGateway` interface 확장 — 2-AUTH 의 "9 메서드" 계약을 바꾼다,
ⓑ 전역/모듈 상태 도입 — `.claude/rules/frontend.md` §4 "전역 상태는 승인 후 도입",
ⓒ `AuthSession` 에 provider 필드 추가 — contracts 변경) 중 하나가 필요하다.
셋 다 이 Step 의 승인 범위를 넘으므로 **보류**하고, 판정이 `me.consentStatus` 로만 가능한
`reconsent` 만 정확히 구분했다. 수정은 `consentSourceFor()` 한 함수다.

### Non-blocking (구현했으나 명세와 차이)

**② Design Spec §2.6 의 "Version {version} · updated {date}" 중 `{date}` 를 렌더하지 않았다.**
`ConsentDocument` 에 갱신 일자 필드가 없다(`version` 만 있다). contracts 를 이 Step 에서
바꾸지 않기 위해 `Required · Version 2026-01-01` 형태로만 표시했다. 날짜를 보여주려면
`ConsentDocument` 에 `updatedAt` 을 추가해야 한다 (plan-agent/contracts 결정 필요).

**③ `RecordConsentsRequestSchema` 가 `.strict()` 가 아니다.**
`SignUpWithEmailInputSchema` 는 `.strict()` 라 아이 필드 혼입을 **거부**하지만, 동의 요청은
알 수 없는 키를 **조용히 제거**한다. 결과적으로 아동 데이터는 나가지 않지만(테스트로 고정),
동일한 방어를 원하면 contracts 에 `.strict()` 를 추가하는 편이 낫다. Privacy 영향은 없다.

**④ `packages/ui` Button 의 `aria-disabled` 지원을 추가했다.**
Design Spec §2.6 이 "native `disabled` 대신 `aria-disabled` + 포커스 가능" 을 요구하는데
기존 Button 은 `{...rest}` 뒤에 `aria-disabled={disabled || undefined}` 를 두어 소비자가
넘긴 값을 덮어썼다. 소비자 값을 존중하도록 고쳤고, CSS 는 `:not(:disabled)` 로 한정해
기존 disabled 버튼의 시각을 바꾸지 않는다 (baseline 36건 무변경으로 확인).
공유 컴포넌트 변경이므로 QA 확인 대상으로 남긴다.

**⑤ `CheckboxGroup` 의 `<legend>` 를 feature CSS 로 시각 숨김 처리했다.**
Design Spec §2.6 이 "legend 시각 숨김" 을 요구하지만 `CheckboxGroup` 은 legend 를 보이게
렌더한다(다른 화면에서는 보여야 한다). `packages/ui` 를 바꾸지 않고
`.haru-consent-group` 스코프 CSS 로만 숨겼다. 접근성 이름은 유지된다.

### Blocking

없음.

---

## 12. QA 가 바로 확인할 수 있는 경로

```
# 동의 화면 (필수 미체크 차단 → 체크 → 기록 → 온보딩 입구)
pnpm dev  →  /auth/sign-up?scenario=me:consent-missing  → 가입 제출

# 재동의
/auth/sign-up?scenario=me:consent-version-outdated,consents:consent-version-outdated

# 문서 조회 실패 / 오프라인 / 재시도
...?scenario=me:consent-missing,consents:error | consents:offline | consents:retry

# VPC
/auth/sign-up?scenario=me:vpc-pending     → /auth/verify-parent (머묾)
/auth/sign-up?scenario=me:vpc-failed      → /auth/verify-parent (안내 + Try again)

# AC-2-13 전수 검사만 실행
npx vitest run apps/web/__tests__/consent-screens.test.tsx
```
