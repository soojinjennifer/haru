# Stage 2-AUTH Handoff — Auth 화면 · AuthGateway Mock · Route Guard

작성: development-agent · 2026-09-25
Step 문서: `docs/workflow/stage-2/stage-2-AUTH.md` · Queue: `docs/workflow/stage-2/QUEUE.md`

> 이 Step 은 **Auth 구간**만 다룬다. 동의·VPC(`2-CONSENT`) · 온보딩(`2-ONBOARDING`) ·
> Home/설정(`2-HOME`) 화면은 만들지 않았다. Stage 2-B(`/onboarding/profile` ·
> `/onboarding/growth-capability` · Guard 의 프로필 단계)도 선구현하지 않았다.

---

## 1. Gate 확인

| 항목 | 결과 |
|---|---|
| `docs/plans/stage-2-plan.md` `APPROVED (2026-09-25, user)` | 충족 |
| `docs/design/stage-2-design-spec.md` `APPROVED (2026-09-25, user)` | 충족 |
| 이전 Stage QA PASS (Stage 1) | 충족 |
| D-1 ~ D-17 확정 (`docs/decisions/stage-2-approvals.md` §4) | 충족 — 이 Step 은 D-4 · D-5 · D-6 · D-8 · D-14 · D-15 적용 |
| Plan In Scope 에 Backend 구현 없음 | 충족 (`apps/api/` · `supabase/` 미생성 확인) |
| 선행 Step `2-CONTRACTS` · `2-UI` COMPLETE | 충족 |

---

## 2. 구현한 요구사항 / AC

FR-01(가입·로그인·비밀번호 재설정) + Route Guard(기술 요구사항) 범위.

| AC | 상태 | 근거 |
|---|---|---|
| **AC-2-04** 5 route 동작 + Welcome 에 Google · Apple · Email | 구현 | `e2e/auth.spec.ts` 이동 시나리오 · `apps/web/__tests__/auth-screens.test.tsx` · baseline `s2-welcome` |
| **AC-2-05** 가입 요청 body 아이 필드 0건 (`.strict()`) | 구현 | `MockAuthGateway.test.ts` "입력 검증 — 아이 필드 차단" 2건 |
| **AC-2-06** `AuthGateway` 9 메서드 + Mock, 주입 지점 1곳 | 구현 | `AUTH_GATEWAY_METHODS` 9건 검사, `mock-source-rules.test.ts` Adapter 선택 지점 검사 |
| **AC-2-07** `token-expired` refresh 1회 → 재시도, 2회 실패 시 signOut + `/auth/log-in` | 구현 | `withAuthRefresh.test.ts` 4건 · `guard-integration.test.tsx` "세션 만료 2회 실패" |
| **AC-2-08** `provider-cancelled` 가 오류 화면이 아니다 | 구현 | `auth-screens.test.tsx` "소셜 로그인 취소" |
| **AC-2-09** 재설정 4상태 + 계정 존재 여부 비노출 | 구현 | `auth-screens.test.tsx` forgot/reset 6건 · `e2e/auth.spec.ts` |
| **AC-2-42** `resolveGuardDecision` 순수 함수 전수 테스트 | 구현 | `resolveGuardDecision.test.ts` 47건 |
| **AC-2-43** `onboarding-incomplete` → 온보딩으로 이동 | 부분 (§8) | `guard-integration.test.tsx` — 착지 지점은 `/onboarding`(입구). step 복귀는 `2-ONBOARDING` |
| **AC-2-44** `me` 미해결 = `pending`, 무한 리다이렉트 없음 | 구현 | `resolveGuardDecision.test.ts` "무한 리다이렉트 방지" 전 상태 × 전 경로 |
| **AC-2-45** 미인증 `/onboarding/*` 허용(Trial), 서버 요청 0건 | 구현(Guard 부분) | `resolveGuardDecision.test.ts` · `guard-integration.test.tsx` |
| **AC-2-13** 동의 이전 구간 요청에 아동 데이터 0건 | 구현(Auth 구간) | §5 |
| **AC-2-18** 동의 문서 링크가 D-4 승인안대로 열린다 | 구현(Welcome 고지문) | `auth-screens.test.tsx` · `e2e/auth.spec.ts` |
| **AC-2-38 / AC-2-65** 진단·판정 표현 0건, `lastName` 미사용 | 구현 | `auth-screens.test.tsx` "copy 규칙" |
| **AC-2-56** Figma 대조 baseline | 구현(Auth 3건) | `s2-welcome` · `s2-login` · `s2-signup` |
| **AC-2-59 / AC-2-60** 반응형·200% reflow·키보드·터치 44 | 구현(Auth 화면) | `e2e/auth.spec.ts` 8건 |
| **AC-2-63 / AC-2-64 / AC-2-66** 로그 PII 0건 · 비밀번호 잔존 0건 · 외부 요청 0건 | 구현 | §5 |

---

## 3. 생성 · 수정 파일

### 신규 — `packages/ui`
| 파일 | 내용 |
|---|---|
| `packages/ui/src/icon/brand/GoogleMark.tsx` | Google 공식 "G" — **수정 금지 (DO NOT MODIFY)** 주석 |
| `packages/ui/src/icon/brand/AppleMark.tsx` | Apple 공식 로고 — **수정 금지 (DO NOT MODIFY)** 주석 |
| `packages/ui/src/icon/brand/registry.ts` · `BrandMark.tsx` · `index.ts` · `BrandMark.css` | 레지스트리 · 렌더러(장식) · 비율 보존 CSS |
| `packages/ui/src/icon/brand/__tests__/brand-marks.test.tsx` | 공식 색값 · viewBox · 수정 금지 주석 · 토큰 치환 금지 고정 |

### 수정 — `packages/ui` · `packages/config`
| 파일 | 내용 |
|---|---|
| `packages/ui/src/index.ts` | `BrandMark` · `BRAND_MARKS` · `AppleMark` · `GoogleMark` export |
| `packages/ui/src/styles.css` | `icon/brand/BrandMark.css` import |
| `packages/ui/src/icon/registry.ts` | Lucide `mail` 추가 (Welcome "Sign up with email") |
| `packages/ui/src/field/TextField.tsx` | `trailingAction.accessibleLabel` **추가**(선택) — 보이는 글자 "Show" ↔ 접근성 이름 "Show password" (Design Spec §10 + §4.8 동시 충족) |
| `packages/config/eslint/base.js` | `DESIGN_TOKEN_EXCEPTION_PATHS` 에 `packages/ui/src/icon/brand/**` 추가 (§9 ①) |

### 신규 — `apps/web`
| 영역 | 파일 |
|---|---|
| 인증 경계 | `shared/auth/AuthGateway.ts` · `context.tsx` · `withAuthRefresh.ts` · `UnavailableAuthGateway.ts` · `index.ts` |
| API 계층 | `shared/api/me-api.ts` · `shared/api/http/HttpMeApi.ts` |
| 설정 | `shared/config/legal-links.ts` (D-4 · 출시 전 차단 항목) |
| Guard | `app/guards/resolveGuardDecision.ts` · `app/guards/useGuardDecision.ts` |
| Provider | `app/providers/AuthProvider.tsx` |
| entity | `entities/me/{meKeys,useMe,index}.ts` · `entities/character/{CharacterMedallion.tsx,character.css,index.ts}` |
| feature | `features/auth/copy.ts` · `auth.css` · `index.ts` · `model/{validation,authErrorMessage,authMutations,fieldProps}.ts` · `ui/{SignUpForm,LogInForm,ForgotPasswordForm,ResetPasswordForm,SocialAuthButtons,SocialAuthSection,PasswordField,SubmitButton}.tsx` |
| page | `pages/auth/{AuthTopBar,WelcomePage,SignUpPage,LogInPage,ForgotPasswordPage,ResetPasswordPage,index}.tsx` |
| Mock | `mocks/auth/MockAuthGateway.ts` · `mocks/me/MockMeApi.ts` · `mocks/request-log.ts` · `mocks/fixtures/{auth,me}.ts` |
| 에셋 | `shared/assets/character/{hello-heart.png,headphones.png,index.ts}` (Figma `179:1704` · `179:1823` export, 2배 래스터) |
| 테스트 지원 | `test/harness.tsx` |
| 테스트 | `app/guards/__tests__/{resolveGuardDecision,guard-integration}.test.*` · `mocks/__tests__/{MockAuthGateway,MockMeApi,request-log}.test.ts` · `shared/auth/__tests__/withAuthRefresh.test.ts` · `apps/web/__tests__/auth-screens.test.tsx` |

### 수정 — `apps/web` · e2e
| 파일 | 내용 |
|---|---|
| `app/providers/apiClients.ts` | `resolveApiClients` → **`resolveAdapters`** (ApiClients + AuthGateway 를 한 번에 — scenario store·요청 로그 공유). 선택 지점은 여전히 1곳 |
| `app/providers/ApiClientProvider.tsx` · `AppProviders.tsx` · `index.ts` | 두 Adapter 공급 · `ToastProvider` 마운트 · `authGateway` 주입 prop |
| `app/guards/RouteGuard.tsx` | 판정 로직 분리, 기본 `useDecision` = 실제 판정 hook |
| `app/router.tsx` | `/auth/*` 5 route 추가 (경로별 layout route + `AuthTopBar`) |
| `app/layouts/AppShell.tsx` | **배경이 콘텐츠를 덮는 버그 수정** (§9 ②) |
| `shared/api/types.ts` · `index.ts` · `http/index.ts` | `me` 도메인 추가 |
| `shared/config/routes.ts` | Stage 2 경로 상수 전체(14 route). 화면 등록은 각 Step |
| `mocks/index.ts` | `authGateway` · `requestLog` 번들 제공, Stage 2 export |
| `styles/index.css` | `character.css` · `auth.css` import |
| `__tests__/mock-source-rules.test.ts` | `src/test/**` 예외 + **역방향 import 금지 검사 추가**(규칙 강화) |
| `e2e/visual.spec.ts` | `s2-welcome` · `s2-login` · `s2-signup` baseline |
| `e2e/auth.spec.ts` (신규) | 이동 · 키보드 · 터치 · Privacy · 반응형 13건 |
| `e2e/shadow.spec.ts` | 대상 화면 `/` → `/auth/reset-password` (`/` 는 이제 Guard 가 리다이렉트) |
| `e2e/support/gallery.ts` | `gotoApp()` 추가 (앱 route 용) |

---

## 4. Route Guard — 판정 순서 전수 테스트 결과 (AC-2-42, D-5)

```
resolveGuardDecision(me, pathname, { sessionExpired? })   ← 순수 함수, Router·Query 의존 0
1. me === undefined                                   → pending
2. me === null (미인증)                                → /auth/welcome
     예외 ① /auth/*            = allow
     예외 ② /onboarding · /onboarding/:step = allow    (Trial — C-12, AC-2-45)
     단   ③ /onboarding/saved 는 Trial 예외가 아니다
     단   ④ sessionExpired === true → /auth/log-in     (AC-2-07)
3. 필수 동의 누락 (hasAllRequiredConsents === false)    → /auth/consent
4. parentVerification ∈ {pending, failed}             → /auth/verify-parent
5. onboardingStatus !== 'completed'                   → /onboarding   (온보딩 구간 안이면 allow)
6. 완료 && 현재 경로가 /auth/*                          → /
7. 그 외                                               → allow
```

- **D-6 준수**: "프로필 결과 확인" 단계를 넣지 않았다. `MeResponse` 에 플래그를 추가하지 않았고,
  전용 테스트가 *어떤 경로에서도* `/onboarding/profile` · `/onboarding/growth-capability` 로
  가지 않음을 고정한다.
- 무한 리다이렉트 방지: **6개 상태 × 13개 경로**를 돌며 "판정 결과 경로에서 다시 판정하면 allow"
  를 확인한다 (S2-R7).
- 순수 함수 단위 테스트 **47건 전부 통과**. Mock 기반 통합 6건 추가 통과
  (`consent-missing` · `vpc-pending` · `vpc-failed` · `onboarding-incomplete` · `success` · 미인증 · Trial).
- `useGuardDecision` 은 판정하지 않는다. 단 하나의 예외를 문서화했다: `GET /v1/me` 가 **인증과
  무관한 이유**(`INTERNAL_ERROR` · offline)로 실패하면 `allow` 한다 — 그래야 화면이 자기
  Error/Offline 상태를 보여준다. `pending` 으로 두면 앱 전체가 Spinner 에 갇힌다.

---

## 5. Privacy — Auth 구간 요청에 아동 데이터 0건 (AC-2-13)

증거 수집기: `apps/web/src/mocks/request-log.ts`
— 모든 Mock Adapter 와 `MockAuthGateway` 가 **서버로 나갈 요청**을 기록한다.
`findChildDataKeys()` 가 금칙 키(`firstName` · `lastName` · `birthYearMonth` · `gender` ·
`answers` · `draftAnswers` · `childId` · `child` · `temperament` · `capabilityItems`)를 중첩까지 훑는다.

| 검사 | 결과 |
|---|---|
| 가입 화면에서 실제 제출까지 수행 후 요청 로그 전수 검사 | `findChildDataKeys(...) === []` (`auth-screens.test.tsx`) |
| `SignUpWithEmailInputSchema.strict()` — 아이 필드 혼입 parse 실패 | 통과 (`MockAuthGateway.test.ts` 2건) |
| Gateway 가 아이 필드 섞인 입력을 `VALIDATION_FAILED` 로 거부 | 통과 |
| `GET /v1/me` 모든 scenario 응답에 `child` 없음 | 통과 (`MockMeApi.test.ts`) |
| Welcome 화면을 열기만 하면 서버 요청 0건 | 통과 |
| 요청 로그·직렬화 결과에 비밀번호 원문 0건 (`redactSecrets`) | 통과 2건 |
| Auth 화면에서 외부 도메인 요청 0건 | 통과 (`e2e/auth.spec.ts` network log) |
| copy 에 `last name` · 진단 표현 0건 | 통과 |

비밀번호는 form state 로만 존재하고 성공 즉시 비운다. draft · Query 캐시 · 로그 어디에도 넣지 않는다.

---

## 6. D-15 — Apple / Google 버튼 처리

- 에셋 위치: `packages/ui/src/icon/brand/` — 두 파일 모두 상단에 **수정 금지 (DO NOT MODIFY)**
  주석과 "무엇을 바꾸면 가이드라인 위반인지" 목록을 둔다.
- 값 고정: `brand-marks.test.tsx` 가 Google 4색(`#4285F4` `#34A853` `#FBBC05` `#EA4335`) ·
  viewBox · Apple 단색(`#000000`) · 비율 814:1000 · 주석 존재 · `var(--…)`/`currentColor`
  치환 금지를 테스트로 고정한다.
- 지켜진 Apple 규격: 공식 로고 왜곡 없음(비율 유지, `BrandMark.css` 가 `inline-size: auto`) ·
  버튼 높이 56 ≥ 최소 44 · 밝은 표면이므로 **검정 로고** · 승인 라벨 "Continue with Apple" ·
  로고를 라벨 왼쪽에 배치 · Apple 기기에서는 시스템 폰트(SF Pro, Stage 0 #11).
- ESLint 의 "임의 HEX 금지" 예외를 `packages/ui/src/icon/brand/**` 로 **좁게** 열었다
  (기존 예외: design-tokens 내부 · `**/assets/**`). 이유는 config 주석에 남겼다.

### 신규 허용 차이 등록 (D-15 "충돌 시 Apple 규격 우선 + 허용 차이 기록")

| ID | 차이 | 원인 | 허용 범위 |
|---|---|---|---|
| **AD-S2-13** | Apple 버튼 표면이 **solid white 가 아니라 반투명 glass**(`Button variant=glass`, `--color-surface-glass` + blur) | Apple 규격은 white / black / white-outline 3종을 제시하지만, HARU 전 화면의 보조 버튼 표면이 glass 다. Design Spec §2.1 이 `variant=glass` 를 지정했고, 로고·라벨·높이·비율 등 **식별 요소는 전부 규격대로**다 | 표면 알파/블러 차이만. 로고·라벨·간격·높이는 차이 없음 |

> 이 항목은 development-agent 가 등록한 것이다. Design Spec §11.3 표(`AD-S2-1`~`AD-S2-12`)의
> 연장선이며, design-agent 가 문서에 반영할지는 QA/Orchestrator 판단에 맡긴다.

---

## 7. 검증 명령 결과 (공통 7종 + 2)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **통과** (packages 4 + apps/web, 신규 `any` · `@ts-ignore` 0건) |
| `pnpm lint` | **통과** (0 problems) |
| `pnpm lint:boundaries` | **통과** — `no dependency violations found (357 modules, 1051 dependencies)` |
| `pnpm test` | **통과** — `82 files / 758 tests` (직전 `74 / 604` → **+8 파일 / +154 건**, 회귀 0) |
| `pnpm build` | **통과** — `dist/assets/index-*.js 437.30 kB (gzip 134.88)` + 캐릭터 PNG 2종 |
| `pnpm format:check` | **통과** — `All matched files use Prettier code style!` |
| `pnpm test:e2e` | **통과** — `80 passed` (직전 64 → **+16**) |
| `pnpm assert:no-mocks` | **통과** — sentinel 3종 0건 |
| `apps/api/` · `supabase/` 미생성 | **확인** — `apps/` = `web` 만, `supabase` 없음 |

시각 baseline: 33 → **36** (`s2-welcome` · `s2-login` · `s2-signup` 추가).
기존 33건은 **변경 없이 그대로 통과**했다(§9 ② 수정이 기존 화면 렌더를 바꾸지 않았음을 확인).

---

## 8. Mock 시나리오 목록과 전환 방법

전환: `?scenario=<group>:<key>[,<group>:<key>]`
우선순위 **URL > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`** (Stage 1 D-5 유지).
예) `http://localhost:5173/auth/log-in?scenario=auth:error`

### `auth` 그룹 (`MockAuthGateway`) — 7 key
| key | 동작 | 화면에서 보이는 것 |
|---|---|---|
| `success` | 세션 발급 | 정상 가입·로그인 |
| `loading` | 주입 timer 지연 | Button `loading` |
| `error` | 동작별 코드 ↓ | 폼 하단 `InlineAlert tone=error` |
| `retry` | 1회차 실패 → 2회차 성공 | 재시도 + **입력 보존** |
| `offline` | `NetworkError` | Offline 문구 |
| `token-expired` | refresh 성공 | 화면 변화 없음 (me 의 만료 재시도와 짝) |
| `provider-cancelled` | `session: null` **성공** | `InlineAlert tone=info`, 화면 유지 |

`error` 의 동작별 코드 (신규 Error Code 0건 — AC-2-48):
`signUpWithEmail` → `VALIDATION_FAILED` · `signInWithEmail` → `AUTH_REQUIRED`(계정 존재 여부 비노출)
· `signInWithProvider` → `PROVIDER_UNAVAILABLE` · `requestPasswordReset` → `INTERNAL_ERROR`
· `updatePassword` → `AUTH_TOKEN_EXPIRED`(= **재설정 링크 만료**, Design Spec §2.5)

### `me` 그룹 (`MockMeApi`) — 11 key
`success` · `loading` · `error` · `retry` · `offline` · `token-expired` · `consent-missing` ·
`consent-version-outdated` · `vpc-pending` · `vpc-failed` · `onboarding-incomplete`

전부 `docs/API_CONTRACTS.md` §5.4 catalogue 값이며 alias·신규 key 0건이다.
`consent-missing` 등은 Guard 착지 경로를 바꾸므로 `/auth/consent` · `/auth/verify-parent` ·
`/onboarding` 화면이 등록되는 후속 Step 에서 화면까지 확인된다.

**결정성**: `clock`(고정 `2026-01-01T00:00:00Z`) · `idFactory`(seed) · 주입 timer 만 쓴다.
`Date.now()` / `Math.random()` / `setTimeout` 직접 호출 0건 (`mock-source-rules.test.ts` 가 강제).

---

## 9. 이 Step 에서 내린 판단 (QA 확인 요청)

### ① ESLint HEX 예외를 브랜드 디렉토리로 확장
`packages/ui/src/icon/brand/**` 를 `DESIGN_TOKEN_EXCEPTION_PATHS` 에 추가했다.
D-15 가 "공식 에셋 그대로"를 요구하는데 semantic token 으로 치환하면 브랜드 가이드라인 위반이
된다. 범위는 브랜드 디렉토리 하나이고, 값 자체는 테스트로 고정했다.

### ② `AppShell` 렌더 버그 수정 (Stage 1 이월 결함)
`AppBackground` 는 `position: fixed` + `z-index: 0` 이라 **위치 지정 요소 단계**에서 그려진다.
그 단계는 일반 흐름 콘텐츠보다 뒤이므로, 스크롤 뷰포트가 위치 지정 요소가 아니면 그 안의
평범한 텍스트·이미지가 배경에 **덮여 보이지 않는다**(DOM 순서와 무관).
Stage 1 화면은 모든 콘텐츠가 `backdrop-filter` 를 쓰는 Surface 안에 있어(= 스스로 쌓임 맥락을
만들어) 증상이 드러나지 않았고, Welcome 화면(평문 텍스트 + 이미지)에서 처음 관찰되었다.
수정: 스크롤 뷰포트에 `relative` 추가. 회귀 감시는 `layouts.test.tsx` 3건 + baseline `s2-welcome`.
기존 시각 baseline 33건은 이 수정 후에도 **전부 그대로 통과**한다.

### ③ 가입·로그인 성공 후 이동을 Guard 에 맡긴다
Plan §2.1 은 "가입 성공 → 항상 `/auth/consent`(C-2)" 이다. 구현은 `navigate('/')` 후
**Guard 규칙 3번**(`consentStatus.missing` 비어 있지 않음 → `/auth/consent`)이 보내도록 했다.
결과는 같고, 아직 등록되지 않은 route 를 화면 코드가 직접 가리키지 않는다.
AC-2-12(3경로 모두 `/auth/consent` 도달) 최종 e2e 는 `2-CONSENT` 에서 성립한다.

### ④ Guard 의 온보딩 착지 지점은 `/onboarding` (step 이 아니다)
D-5 시그니처는 `resolveGuardDecision(me, pathname)` 이고 `MeResponse` 에는 `currentStep` 이
없다(= `GET /v1/onboarding` 의 `OnboardingState` 소관). Guard 는 온보딩 **입구**로 보내고,
"이어서 볼 step" 은 온보딩 feature 가 결정한다. AC-2-43 의 "`/onboarding/:step` 으로 이동"
완성은 `2-ONBOARDING` 범위다. `Me` 에 필드를 추가하지 않는 편이 D-6 취지와 Backend 요구
최소화에 맞다고 판단했다.

### ⑤ `resolveGuardDecision` 의 3번째 선택 인자
`options.sessionExpired` 를 **선택 인자**로 추가했다. D-5 의 `(me, pathname)` 호출 형태를
유지하면서 AC-2-07 의 "`/auth/log-in` 으로 이동"을 순수 함수 안에서 판정·테스트하기 위함이다.
(hook 안에 조건을 두면 전수 테스트에서 빠진다.)

### ⑥ `TextField.trailingAction.accessibleLabel` 추가
Design Spec §4.8 은 보이는 글자를 "Show"/"Hide" 로 고정하고, §10 은 접근성 이름을
"Show password"/"Hide password" 로 요구한다. 둘을 동시에 만족시키려고 **선택** prop 을
추가했다(기존 사용처 영향 0). 신규 Shared UI 컴포넌트는 만들지 않았다(28종 유지).

### ⑦ 인라인 링크의 터치 타깃
`TextLink tone="default"`(문장 안 링크 — "Terms" · "Privacy Policy" · "Log in")는 높이 22px 다.
WCAG 2.5.8 의 **inline 예외**(문장 흐름 안의 링크)에 해당한다고 보고 그대로 두었고,
e2e 는 버튼과 `tone="standalone"` 링크만 44 를 검사한다. QA 가 다르게 판단하면
`TextLink --standalone` 로 바꾸면 되지만 Figma `179:1720/1721` 과 글자 크기가 달라진다.

---

## 10. BACKEND_INTEGRATION_PENDING (이 Step 에서 새로 확정되는 부분)

| ID | 내용 | Frontend 가 기대하는 계약 | Handoff 문서 |
|---|---|---|---|
| **P2-BIP-01** | 실제 인증 Provider — Email/Google/Apple 계정 생성·로그인, 토큰 발급·검증·refresh | `AuthGateway` **9 메서드**(`getSession` · `onChange` · `signUpWithEmail` · `signInWithEmail` · `signInWithProvider` · `requestPasswordReset` · `updatePassword` · `refreshSession` · `signOut`), `AuthSession{userId, accessToken, refreshToken?, expiresAt}`, `Authorization: Bearer`, `AUTH_TOKEN_EXPIRED` → **1회** refresh 후 재시도, 2회 실패 시 signOut | `AUTH_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| **P2-BIP-02** | 비밀번호 재설정 **메일 발송 · 링크 토큰 · 만료** | `requestPasswordReset(email) → void` (성공/실패를 계정 존재 여부로 구분하지 않는다), 링크는 `?token=` 로 `/auth/reset-password` 진입, 만료 시 `AUTH_TOKEN_EXPIRED` | `AUTH_REQUIREMENTS.md` |
| **P2-BIP-01a** (신규 세부) | `GET /v1/me` 실제 응답 | `MeResponse` — Guard 판정이 이 응답 **하나**로 끝난다. `consentStatus.missing` · `parentVerification.status` · `onboardingStatus` 가 판정 입력이다 | `BACKEND_HANDOFF.md` |
| **P2-BIP-12** (신규) | OAuth 실제 흐름(리디렉트 / 네이티브 `signInWithIdToken` + nonce)과 **취소 처리** | 취소는 오류가 아니라 `AuthResult{session: null}` 성공 반환이어야 한다 (화면이 오류로 처리하지 않는다) | `AUTH_REQUIREMENTS.md` |
| **L-02 / D-4 §4.1** | **약관·개인정보방침 실제 문서 URL** — 지금은 `https://haru.invalid/legal/*--placeholder` | `shared/config/legal-links.ts` 의 두 상수 교체. `isPlaceholderLegalUrl()` 이 가짜임을 판별한다 | **출시 전 차단 항목** — `BACKEND_HANDOFF.md` + `WORKFLOW_STATE.md` §3 |

`http` 모드 빌드에는 실제 인증 Adapter 가 없다(#27). `createUnavailableAuthGateway()` 가
`PROVIDER_UNAVAILABLE` 을 던져 **동작하는 것처럼 보이지 않게** 한다.

---

## 11. Scope 경계에서 보류한 항목

| 항목 | 이유 | 담당 Step |
|---|---|---|
| `/auth/consent` · `/auth/verify-parent` 화면, `consents` 그룹 Mock | Step 밖 | `2-CONSENT` |
| `/onboarding/*` 화면, `onboarding` · `books` 그룹 Mock, `OnboardingDraftStore` | Step 밖 | `2-ONBOARDING` |
| `/` Home skeleton, `/settings`, `session-cleanup.ts`, 로그아웃 `ConfirmDialog`(D-7) | Step 밖 | `2-HOME` |
| `PATCH /v1/me`(`UpdateCaregiver`, D-16) | 온보딩 Step 1 에서 처음 쓰인다. 빈 stub 을 만들지 않았다 | `2-ONBOARDING` |
| `/onboarding/profile` · `/onboarding/growth-capability` · Guard 프로필 단계 · `CapabilityDiamondChart` · `PersonaCard` | **Stage 2-B** (approvals §3, D-6) | Stage 2-B |
| BottomTabBar 마운트 · 서재 · Activity Card | Stage 3 | Stage 3 |
| 소셜 로그인 실제 OAuth 흐름 · Supabase JS Client | #27 · Step 문서 금지 항목 | Backend 연동 시점 |

`shared/config/routes.ts` 에는 Stage 2 의 14 route 경로 **상수**가 모두 있다.
Route Guard 가 그 경로로 판정을 내려야 하므로 상수는 먼저 존재해야 한다.
**화면 등록(router)** 은 각 Step 이 한다 — 현재 등록된 것은 `/auth/*` 5건 + `/` + `*` 다.

---

## 12. 발견된 문제

### Blocking — 없음

### Non-blocking
1. **`AppShell` 배경 덮임 결함** (§9 ②) — 이 Step 에서 수정 완료. Stage 1 QA 가 놓친 이월 결함이며,
   회귀 테스트(단위 3 + baseline 1)를 추가했다.
2. **`e2e/shadow.spec.ts` 대상 화면 변경** — `/` 는 이제 Guard 가 미인증 사용자를 Welcome 으로
   보낸다(Surface 카드 없음). `/auth/reset-password`(토큰 없음 → ErrorState 카드)로 바꿨다.
   검사 내용은 동일하다.
3. **인라인 링크 터치 타깃 22px** (§9 ⑦) — WCAG 2.5.8 inline 예외로 판단. QA 확인 요청.
4. **Plan ↔ ARCHITECTURE 의 `AuthGateway` 메서드 수 불일치** — Plan §2.1·AC-2-06 은 "9 메서드",
   ARCHITECTURE §7.2 코드블록과 Plan §7.2 note 는 **8개**만 나열한다. 누락된 것은
   `refreshSession()` 이며, 이것이 없으면 AC-2-07(1회 refresh)을 Gateway 책임으로 구현할 수 없다.
   → `refreshSession(): Promise<AuthSession | null>` 을 9번째로 정의했다. 문서 동기화가 필요하다
   (`docs/ARCHITECTURE.md` §7.2 · `docs/API_CONTRACTS.md` §4 Stage 2 AuthGateway 목록).

### NEEDS_DECISION
1. **`AD-S2-13`(Apple 버튼 glass 표면) 등록 위치** — 이 문서 §6 에 기록했다. Design Spec §11.3
   표에 옮길지 여부는 design-agent / 사용자 결정이다. (D-15 는 "허용 차이 기록"까지만 정했다.)
2. **약관·개인정보방침 실제 문서** — `https://haru.invalid/legal/*--placeholder` 가 화면에 노출된다.
   §4.1 추적 조건대로 세 곳(WORKFLOW_STATE · Stage 8 Handoff · 이 문서)에 걸어 두었다.
   실제 문서가 준비되면 `shared/config/legal-links.ts` 2줄 교체로 끝난다.
3. **Guard 온보딩 착지 지점**(§9 ④) — `/onboarding` 입구로 보낸다. `2-ONBOARDING` 이 step 복귀를
   붙이면 AC-2-43 이 완성된다. 다르게 하려면 `Me` 에 `currentStep` 이 필요하고 이는 Backend
   요구 증가다.
