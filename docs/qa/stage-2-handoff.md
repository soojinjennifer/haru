# Stage 2 Handoff — development-agent → stage-qa-agent

작성: development-agent · 2026-09-26 (`2-HOME` Step 이 6개 Step handoff 를 통합)
근거: `.claude/rules/workflow.md` §6 (정식 인계 파일) · `docs/workflow/stage-2/QUEUE.md`

> **이 문서가 Stage 2 QA 의 단일 입력이다.** Step 별 상세는 각 Step handoff 에 그대로 있고,
> 여기에는 **QA 판정에 필요한 것**만 모았다: AC 대응표 · `BACKEND_INTEGRATION_PENDING` ·
> 허용 차이 · Stage 2-B 이관 · 남은 가값 · 추적 항목 · 재현 절차.
>
> | Step | 상세 handoff |
> |---|---|
> | `2-CONTRACTS` | `docs/qa/stage-2-contracts-handoff.md` |
> | `2-UI` | `docs/qa/stage-2-ui-handoff.md` |
> | `2-AUTH` | `docs/qa/stage-2-auth-handoff.md` |
> | `2-CONSENT` | `docs/qa/stage-2-consent-handoff.md` |
> | `2-ONBOARDING` | `docs/qa/stage-2-onboarding-handoff.md` |
> | `2-HOME` | **이 문서 §9** (별도 파일을 두지 않는다) |

---

## 1. Gate 확인 (Stage 전체)

| 항목 | 결과 |
|---|---|
| `docs/plans/stage-2-plan.md` | `APPROVED (2026-09-25, user)` |
| `docs/design/stage-2-design-spec.md` | `APPROVED (2026-09-25, user)` |
| 이전 Stage QA (`docs/qa/stage-1-qa-report.md`) | `Stage Verdict: PASS` |
| Plan In Scope 에 Backend 구현 | 없음 |
| `apps/api/` · `supabase/` | **미생성** (`ls apps packages` → `apps: web` / `packages: config contracts design-tokens ui`) |
| `apps/mobile/` | 미생성 (Stage 4) |

---

## 2. 검증 명령 결과 (공통 7종, **QA 수정 1회차** 종료 시점)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **통과** — 5 패키지 Done |
| `pnpm lint` | **통과** — 0 problems |
| `pnpm lint:boundaries` | **통과** — `no dependency violations found (448 modules, 1478 dependencies cruised)` |
| `pnpm test` | **통과** — `Test Files 98 passed / Tests 1000 passed` |
| `pnpm build` | **통과** — `vite build` 성공 (chunk 500kB 경고는 기존과 동일 성격) |
| `pnpm format:check` | **통과** — `All matched files use Prettier code style!` |
| `pnpm test:e2e` | **통과** — `121 passed` |

### 회귀 추이 (Step 순)

| 지표 | Stage 1 종료 | 2-UI | 2-AUTH | 2-CONSENT | 2-ONBOARDING | 2-HOME | **QA 수정 1회차** |
|---|---|---|---|---|---|---|---|
| 단위/컴포넌트 테스트 | 560 | 604 | — | 830 | 979 (96 파일) | 997 (98 파일) | **1000 (98 파일)** |
| e2e | 58 | 64 | — | 97 | 102 | 113 | **121** |
| 시각 baseline | 27 | 33 | 36 | 38 | 38 | 39 | **42** |

**줄어든 항목 0건.** QA 수정 1회차가 추가한 것: 단위 +3 · e2e +8 · baseline +3(`s2-onboarding-*`).

---

## 3. AC-2-01 ~ AC-2-68 대응표

판정 열은 **구현자의 주장**이다. QA 는 자체 실행 증거로 다시 판정한다 (`rules/qa.md` §1).

| AC | 요구 요지 | 담당 Step | 구현 상태 | 증거 위치 |
|---|---|---|---|---|
| **AC-2-01** | `apps/api/` · `supabase/` · `apps/mobile/` 부재 | 전 Step | 충족 | `ls apps packages` · `git ls-files` |
| **AC-2-02** | Out of Scope 미구현 (Activity Card · Home 콘텐츠 · **BottomTabBar 마운트** · 서재 · 세션 · 회고 · 리포트 · 데이터 관리 · 탈퇴 · 동의 이력 · 알림 설정) | 전 Step | 충족 | `apps/web/__tests__/home-settings.test.tsx` "Activity Card · streak · 캐릭터 · BottomTabBar 를 마운트하지 않는다" · "데이터 관리 · 탈퇴 · 동의 이력 · 알림 설정 행이 없다" · `e2e/home.spec.ts` |
| **AC-2-03** | import 경계 위반 0 — `features/A → features/B` 포함 | 전 Step | 충족 | `pnpm lint:boundaries` (448 modules) |
| **AC-2-04** | Auth 5 route + Google · Apple · Email | `2-AUTH` | 충족 | `e2e/auth.spec.ts` · `apps/web/__tests__/auth-screens.test.tsx` · baseline `s2-welcome` |
| **AC-2-05** | 가입 요청 body 아이 필드 0건 (`.strict()`) | `2-AUTH` | 충족 | `mocks/__tests__/MockAuthGateway.test.ts` |
| **AC-2-06** | `AuthGateway` 9 메서드 + Mock, 주입 지점 1곳 | `2-AUTH` | 충족 | `AUTH_GATEWAY_METHODS` 검사 · `mock-source-rules.test.ts` |
| **AC-2-07** | `token-expired` refresh 1회 → 재시도, 2회 실패 시 signOut + `/auth/log-in` | `2-AUTH` | 충족 | `shared/auth/__tests__/withAuthRefresh.test.ts` · `guard-integration.test.tsx` |
| **AC-2-08** | `provider-cancelled` 가 오류 화면이 아니다 | `2-AUTH` | 충족 | `auth-screens.test.tsx` |
| **AC-2-09** | 재설정 4상태 · 계정 존재 여부 비노출 | `2-AUTH` | 충족 | `auth-screens.test.tsx` · `e2e/auth.spec.ts` |
| **AC-2-10** | 동의 5항목, 필수 여부는 Mock `ConsentDocument.required` 에서만 | `2-CONSENT` | 충족 | `consentSelection.test.ts` · `consent-screens.test.tsx` · `e2e/consent.spec.ts` |
| **AC-2-11** | 필수 미체크 시 제출 차단 + 이유 안내 | `2-CONSENT` | 충족 | `consent-screens.test.tsx` (`aria-disabled`/`aria-describedby`) |
| **AC-2-12** | Email · Google · Apple 3경로 모두 `/auth/consent` 도달 | `2-CONSENT` | 충족 | `e2e/consent.spec.ts` 3건 |
| **AC-2-13** | **동의 기록 성공 이전 구간 요청에 아동 데이터 0건** | `2-AUTH` · `2-CONSENT` · `2-ONBOARDING` · `2-HOME` | 충족 | `consent-screens.test.tsx` §4 전수 검사 · `onboarding-screens.test.tsx` Trial 로그 `[]` · `home-settings.test.tsx` "로그아웃 요청에 아동 데이터가 실리지 않는다" |
| **AC-2-14** | 동의 없이 `child_info` 저장 → `CONSENT_REQUIRED` → 동의 화면 복귀 | `2-CONSENT` · `2-ONBOARDING` | 충족 (Frontend·Mock). 서버 강제는 `P2-BIP-03` | `consent-screens.test.tsx` · `MockOnboardingApi.test.ts` |
| **AC-2-15** | `consent-version-outdated` 재동의 화면 | `2-CONSENT` | 충족 | `consent-screens.test.tsx` · `MockConsentApi.test.ts` |
| **AC-2-16** | `Idempotency-Key` 첨부 · 동일 key 재생 | `2-CONSENT` · `2-ONBOARDING` | 충족 | `MockConsentApi.test.ts` · `MockOnboardingApi.test.ts` |
| **AC-2-17** | VPC 슬롯 route · pending 유지 · failed 재시도 · 온보딩 차단 | `2-CONSENT` | 충족 | `consent-screens.test.tsx` 6건 · `e2e/consent.spec.ts` 2건 |
| **AC-2-18** | 동의 문서 링크 D-4 대로 · 본문이 코드·fixture 에 없음 | `2-AUTH` · `2-CONSENT` | 충족 | `e2e/consent.spec.ts` placeholder URL 검사 · `legal-links.ts` |
| **AC-2-19** | `/onboarding` → 5단계 → `/onboarding/saved` + 진행바 · 이전/다음 | `2-ONBOARDING` | 충족 | `e2e/onboarding.spec.ts` · `onboarding-screens.test.tsx` |
| **AC-2-20** | 중도 이탈 후 `currentStep` 복귀 + 입력 보존 | `2-ONBOARDING` | 충족 | `shared/lib/__tests__/onboarding-draft.test.ts` · `MockOnboardingApi.test.ts` (`draft-resume`) |
| **AC-2-21** | Step 1 성·이름 2칸 · 성별 3옵션 기본 미선택 · 미선택 시 `gender: null` | `2-ONBOARDING` | 충족 | `model/__tests__/childInfo.test.ts` · `onboarding-screens.test.tsx` |
| **AC-2-22** | 생년월 `YYYY-MM` · 3~9세 범위 밖 필드 에러 · 나이 파생 | `2-ONBOARDING` | 충족 | `childInfo.test.ts` (경계 4건) |
| **AC-2-23** | Step 3 책 검색 `success`·`empty` + 제목 직접 입력 경로 | `2-ONBOARDING` | 충족 | `MockBooksApi.test.ts` · `onboarding-screens.test.tsx` |
| **AC-2-24** | Step 5 10문항 · 6옵션 · 문구는 instrument 응답에서만 | `2-ONBOARDING` | 충족 | `instrumentView.test.ts` · `ChoiceQuestionList` 문항 문자열 grep 0건 |
| **AC-2-25** | SwipeDeck 제스처 전용 아님 (키보드·버튼 완주) | `2-UI` + `2-ONBOARDING` | 충족 | `e2e/onboarding.spec.ts` 키보드 10문항 완주 · `packages/ui` deck 테스트 |
| **AC-2-26** | submit 요청에 5단계 전체 + 10문항 전부(`not_observed` 포함) | `2-ONBOARDING` | 충족 | `model/__tests__/submitRequest.test.ts` |
| **AC-2-27** | **Trial 네트워크 요청 0건** + 로컬 draft 만 저장 | `2-ONBOARDING` | 충족 | `onboarding-screens.test.tsx` · `e2e/onboarding.spec.ts` (`/v1/` 0건) |
| **AC-2-28** | Trial draft → 가입 → 동의 → submit 1회, 성공 후 draft 삭제 | `2-ONBOARDING` | 충족 | `onboarding-screens.test.tsx` · `onboarding-draft.test.ts` |
| **AC-2-29** | **로그아웃 시 로컬 draft · Query 캐시 · 저장소 키 잔존 0건** | `2-HOME` | 충족 | `shared/lib/__tests__/session-cleanup.test.ts` · `home-settings.test.tsx` "확인하면 로컬 draft · Query 캐시가 비고…" · `e2e/home.spec.ts` (`localStorage` 실측) |
| **AC-2-30** | draft 만료 · `schemaVersion` 불일치 · parse 실패 시 폐기 + 안내 | `2-ONBOARDING` | 충족 | `onboarding-draft.test.ts` 12건 |
| **AC-2-31** | `scoreCapabilities` 평균 · `itemCount` · `missingCount` | `2-CONTRACTS` | 충족 | `packages/contracts/src/__tests__/*` |
| **AC-2-32** | `capability-all-missing` 이 D-2 승인안대로 표시 · 0/최저값 아님 | **Stage 2-B** | **이관** — contracts·Mock 까지만 (`capability_scores.score` NULL 허용). **화면 표시 없음** | §6 |
| **AC-2-33** | `CapabilityDiamondChart` inline SVG + 접근성 이름 | **Stage 2-B** | **이관** — 미구현 | §6 |
| **AC-2-34** | 프로필 화면 "판정이 아니다" 안내 | **Stage 2-B** | **이관** — 미구현 | §6 |
| **AC-2-35** | 강점 2 · growing edge 2 · 페르소나가 API 응답 값만 | **Stage 2-B**(화면) | **이관** — contracts·Mock 은 존재, 화면 표시 없음 | §6 |
| **AC-2-36** | `persona-fallback` 이 오류 화면이 아님 | **Stage 2-B**(화면) | **이관** — Mock scenario 는 존재 (`MockOnboardingApi`) | §6 |
| **AC-2-37** | 발전 역량 기본값 · 축 탭 변경 시 `PUT …/growth-capability` | **Stage 2-B** | **이관** — 미구현 | §6 |
| **AC-2-38** | 전 화면 copy 에 진단·판정·비교 표현 0건 | 전 Step | 충족 | `features/onboarding-survey/__tests__/copy-language.test.ts` (16건) · `auth-screens.test.tsx` · `consent-screens.test.tsx` · `home-settings.test.tsx` "문구 규칙" |
| **AC-2-39** | `/` 가 워드마크 + 설정 `26:44` + 빈 상태 안내만, contract 호출 0건 | `2-HOME` | 충족 | `home-settings.test.tsx` 5건 · `e2e/home.spec.ts` · baseline `s2-home-header` |
| **AC-2-40** | 설정 아이콘 → `/settings`, 목록 = 로그아웃 1행 | `2-HOME` | 충족 | `home-settings.test.tsx` 3건 · `e2e/home.spec.ts` |
| **AC-2-41** | 로그아웃이 D-7 대로 동작 · `/auth/welcome` 이동 · 로컬 정리 | `2-HOME` | 충족 | `home-settings.test.tsx` 5건 · `e2e/home.spec.ts` 3건 |
| **AC-2-42** | `resolveGuardDecision` 순수 함수 전수 테스트 | `2-AUTH` | 충족 | `resolveGuardDecision.test.ts` 47건 |
| **AC-2-43** | `onboarding-incomplete` → `/onboarding/:step` | `2-AUTH` + `2-ONBOARDING` | 충족 — Guard 는 `/onboarding` 입구로 보내고 **step 복귀는 draft/서버 `currentStep`** 이 한다 (§8 ④) | `guard-integration.test.tsx` · `onboarding-screens.test.tsx` |
| **AC-2-44** | `me` 미해결 = `pending`, 무한 리다이렉트 없음 | `2-AUTH` | 충족 | `resolveGuardDecision.test.ts` |
| **AC-2-45** | 미인증 `/onboarding/*` 허용(Trial), 서버 요청 0건 | `2-AUTH` + `2-ONBOARDING` | 충족 | `resolveGuardDecision.test.ts` · `e2e/onboarding.spec.ts` |
| **AC-2-46** | §7.1 schema 존재 + 문서 일치 + `apps/web` 타입 재선언 0 | `2-CONTRACTS` | 충족 | `packages/contracts` 테스트 · `docs/API_CONTRACTS.md` 동기화 |
| **AC-2-47** | 신규 enum 3종 + 문서 동기화 | `2-CONTRACTS` | 충족 | `enums.test.ts` 스냅샷 (26종) |
| **AC-2-48** | Error Code 신규 0건 (기존 28종 범위) | `2-CONTRACTS` · Mock 전 Step | 충족 | `common/error-codes.ts` 무수정 |
| **AC-2-49** | contracts 런타임 의존 `zod` 뿐 + clock 주입 | `2-CONTRACTS` | 충족 | `package.json` · `lint:boundaries` |
| **AC-2-50** | Mock Adapter 6종 요청·응답 schema parse | Mock 전 Step | 충족 | `mocks/__tests__/*` (Auth · Me · Consent · Onboarding · Books · Health) |
| **AC-2-51** | §8.2 17 key 재현 | Mock 전 Step | 충족 | §7 시나리오 표 |
| **AC-2-52** | scenario 결정성 · `Date.now()`/`Math.random()` 0건 | Mock 전 Step | 충족 | `mock-source-rules.test.ts` |
| **AC-2-53** | scenario key 가 catalogue 범위 | Mock 전 Step | 충족 | `scenario-selection.test.ts` |
| **AC-2-54** | fixture 가 `mocks/fixtures/` 에만 · 가상 아동 이름 | Mock 전 Step | 충족 | `mock-source-rules.test.ts` |
| **AC-2-55** | `VITE_API_MODE=http` 산출물에 mocks·dev gallery 0건 | 전 Step | 충족 | `pnpm assert:no-mocks` |
| **AC-2-56** | Figma 시각 비교 수행·기록 + 허용 차이 사전 등록 | `2-AUTH` · `2-CONSENT` · `2-UI` · `2-HOME` | 충족 — `s2-welcome` · `s2-login` · `s2-signup` · `s2-consent` · `s2-vpc-failed` · **`s2-home-header`** + Stage 2 컴포넌트 6종. 온보딩 화면(`179:1748`·`179:1770`·`179:1809`) baseline 은 **미생성** → §8 ① | `e2e/visual.spec.ts` · §5 |
| **AC-2-57** | C-13 승인 디자인 소스와 일치 · 미승인 화면 미구현 | 전 Step | 충족 | route 목록 12건 (`app/router.tsx` 표) |
| **AC-2-58** | 임의 HEX / arbitrary value / inline 수치 0건 | 전 Step | 충족 | `pnpm lint` (ESLint 규칙) — 예외는 `design-tokens` 내부 · `**/assets/**` · `ui/src/icon/brand/**` |
| **AC-2-59** | 320/393/600/1024 앱 컬럼 · 200% reflow | `2-AUTH` · `2-CONSENT` · `2-ONBOARDING` · `2-HOME` | 충족 | `e2e/auth.spec.ts` · `e2e/consent.spec.ts` · `e2e/responsive.spec.ts` · `e2e/home.spec.ts` 5건 |
| **AC-2-60** | 키보드 · focus · 접근성 이름 · 44×44 | 전 Step | 충족 (예외 `PASS (accepted: S1-G-2)` TextField 42px) | `e2e/a11y.spec.ts` · `e2e/onboarding.spec.ts` · `e2e/home.spec.ts` 키보드 경로 |
| **AC-2-61** | `TopBar` 스크롤 glass 전환 실제 동작 (D-13) | `2-UI` + 화면 Step | 충족 | `2-UI` 단위·통합 + `e2e/scenarios.spec.ts`/`responsive.spec.ts` 의 실제 스크롤 화면 |
| **AC-2-62** | `PROVISIONAL_ITEMS` = 대기 6건 (P-01·02·04·05·16·**17**) | `2-UI` | 충족 | `dev/__tests__/gallery-helpers.test.ts` · `provisional-markers.test.ts` |
| **AC-2-63** | 로그·에러 리포트에 PII 0건 | 전 Step | 충족 | `shared/lib/__tests__/logger.test.ts` · `request-log.ts` `redactSecrets` |
| **AC-2-64** | 비밀번호가 저장소·draft·캐시에 잔존 0건 | `2-AUTH` · `2-HOME` | 충족 | `auth-screens.test.tsx` · `home-settings.test.tsx` 저장소 전수 |
| **AC-2-65** | 화면·알림 문구에 `lastName` 미사용 | 전 Step | 충족 | `auth-screens.test.tsx` · `consent-screens.test.tsx` copy 규칙 |
| **AC-2-66** | Secret 0건 · 제3자 SDK 0건 · 외부 도메인 요청 0건 | 전 Step | 충족 | `e2e/auth.spec.ts` · `e2e/consent.spec.ts` network log · `package.json` |
| **AC-2-67** | Stage 1 AC 핵심 경로 재실행 | 전 Step | 충족 | 전체 스위트 997 + e2e 113, baseline 39 (감소 0) |
| **AC-2-68** | 공통 명령 전부 통과 · 신규 `any`/`@ts-ignore` 0건 | 전 Step | 충족 | §2 |

**요약**: 68건 중 **62건 충족** · **6건 Stage 2-B 이관**(AC-2-32 · 33 · 34 · 35 · 36 · 37).
Stage 2-B 이관 6건은 승인된 범위 분리(`stage-2-approvals.md` §3)에 따른 것이며 **Stage 2 Verdict
계산에서 제외**한다.

---

## 4. `BACKEND_INTEGRATION_PENDING` 전체 목록

Stage 8 Handoff 문서에 1:1 로 반영해야 하는 목록이다 (`.claude/rules/backend.md` §2).

| ID | 내용 | Frontend 가 고정한 계약 | 확정 Step | Stage 8 문서 |
|---|---|---|---|---|
| **P2-BIP-01** | 실제 인증 Provider (Email/Google/Apple 계정·토큰 발급·검증·refresh) | `AuthGateway` **9 메서드**, `AuthSession{userId, accessToken, refreshToken?, expiresAt}`, `Authorization: Bearer`, `AUTH_TOKEN_EXPIRED` → 1회 refresh 후 재시도, 2회 실패 시 signOut | `2-AUTH` | `AUTH_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| **P2-BIP-01a** | `GET /v1/me` 실제 응답 | `MeResponse` — Route Guard 판정이 이 응답 하나로 끝난다 (`consentStatus.missing` · `parentVerification.status` · `onboardingStatus`) | `2-AUTH` | `BACKEND_HANDOFF.md` |
| **P2-BIP-02** | 비밀번호 재설정 메일 발송 · 링크 토큰 · 만료 | `requestPasswordReset(email) → void` (계정 존재 여부 비노출), `?token=` 진입, 만료 시 `AUTH_TOKEN_EXPIRED` | `2-AUTH` | `AUTH_REQUIREMENTS.md` |
| **P2-BIP-03** | **서버 측 필수 동의 강제** — 동의·VPC 전 아동 데이터 쓰기 거부 | `CONSENT_REQUIRED`(403). Mock 이 `GET/PUT /v1/onboarding*` · `POST …/submit` 3 endpoint 전부 재현 | `2-CONSENT` · `2-ONBOARDING` | `AUTH_REQUIREMENTS.md` · `ERROR_CODES.md` |
| **P2-BIP-04** | `consent_events` append-only · 문서 버전 관리 · `current_consents` view | `POST /v1/consents` `items[{type, documentId, action:'granted'}]` + `source`. `GET /v1/consent-documents/current` 가 `required` 와 `version` 을 반드시 내려야 화면이 그려진다 | `2-CONSENT` | `DATA_REQUIREMENTS.md` |
| **P2-BIP-05** | **VPC 실제 방식·검증·기록** (법무 `L-01`) | `Me.parentVerification.status` 4값만. **검증 endpoint·payload 는 정의하지 않았다** | `2-CONSENT` | `AUTH_REQUIREMENTS.md` |
| **P2-BIP-06** | 온보딩 서버 draft 저장·복귀 + **instrument 배포·버전 관리** | `GET /v1/onboarding` → `OnboardingState{instrument, steps[5], draftAnswers, currentStep}`, `PUT /v1/onboarding/steps/:step`. **신규 요구 4건** ↓ | `2-ONBOARDING` | `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| **P2-BIP-07** | 역량 스코어 산출 — 서버도 contracts `scoreCapabilities` 를 **재사용**해야 한다 | `capability_scores.score` NULL 허용 | `2-CONTRACTS` · `2-ONBOARDING` | `DATA_REQUIREMENTS.md` |
| **P2-BIP-08** | 페르소나 생성 · Safety Filter · fallback | `ProfileResult.persona.isFallback` (Mock: `persona-fallback`) | `2-CONTRACTS` · `2-ONBOARDING` | `ANALYSIS_PIPELINE_REQUIREMENTS.md` |
| **P2-BIP-09** | `capability_snapshots` · `capability_scores` 저장 (score NULL 허용) | contracts `ProfileResult` 형태 | `2-CONTRACTS` | `DATA_REQUIREMENTS.md` |
| **P2-BIP-10** | `children` caregiver 당 1명 UNIQUE | `CHILD_LIMIT_REACHED`(409) on submit | `2-ONBOARDING` | `DATA_REQUIREMENTS.md` |
| **P2-BIP-11** | `Idempotency-Key` 서버 24h 보관·재생·다른 body → `IDEMPOTENCY_KEY_REUSED` | `POST /v1/consents` · `POST /v1/onboarding/submit` | `2-CONSENT` · `2-ONBOARDING` | `BACKEND_HANDOFF.md` |
| **P2-BIP-12** | OAuth 실제 흐름(리디렉트 / 네이티브 `signInWithIdToken` + nonce)과 **취소 처리** | 취소는 오류가 아니라 `AuthResult{session: null}` 성공 반환 | `2-AUTH` | `AUTH_REQUIREMENTS.md` |
| **P2-BIP-13** | **책 검색 코퍼스·매칭·정렬·페이지네이션** | `GET /v1/books/search?q=&limit=&cursor=` → `paginated(BookSummary)`. Mock 은 제목 부분 일치 8권 | `2-ONBOARDING` | `DATA_REQUIREMENTS.md` |
| **P2-BIP-14** | **보호자 프로필 갱신** `PATCH /v1/me` — 관계·타임존 저장 | `UpdateCaregiverRequest{displayName?, relationship?, timezone?}` → 갱신된 `MeResponse`. **아동 데이터가 섞이면 안 된다** (D-16) | `2-ONBOARDING` | `AUTH_REQUIREMENTS.md` · `DATA_REQUIREMENTS.md` |
| **P2-BIP-15** (신규, `2-HOME`) | **서버 측 세션 무효화(로그아웃)** — refresh token 폐기 | `AuthGateway.signOut()` 호출 1회. Frontend 는 성공/실패와 무관하게 **로컬 draft·Query 캐시를 지운다**(`performSessionCleanup`). 서버는 폐기 후 같은 refresh token 재사용을 거부해야 한다 | `2-HOME` | `AUTH_REQUIREMENTS.md` |
| **P2-BIP-16** (신규, `2-HOME`) | **서버 측 사용자 데이터 삭제 경로** — 이 기기의 로컬 정리는 서버 데이터를 지우지 않는다 | Stage 8 데이터 관리·탈퇴(C-15)와 이어진다. Stage 2 는 **로컬 정리만** 보장한다 | `2-HOME` | `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |

### `P2-BIP-06` 신규 요구 4건 (결정 `D-A` 에서 파생)

1. **instrument 응답 필수** — 선택형 문항까지 포함한 `OnboardingInstrument` 를 서버가 내려야 한다. Frontend 는 Trial 구간용 기본 instrument 만 가지며, 서버 값이 있으면 항상 서버 값을 쓴다.
2. **새 선택지 코드에는 `label` 을 함께 내려야 한다.** copy 모듈이 모르는 코드는 화면이 **그리지 않는다** (machine key 노출 금지). 문항도 같다.
3. **instrument 버전 호환은 서버 책임.** 제출·draft 에 `{code, version}` 이 함께 오므로 과거 응답 해석·이관 규칙을 서버가 정한다.
4. **닫힌 문항 id 집합.** `ChoiceQuestionId` 는 contracts enum 이다. **새 문항 id** 추가는 contracts 릴리스가 필요하다. 선택지 추가·삭제·순서 변경·문항 삭제·문구 변경은 릴리스 없이 가능하다.

### Contract 로 표현했으나 endpoint 가 없는 요구 (별도 추적)

| 항목 | 내용 |
|---|---|
| 동의 문서 **본문 호스팅** | Frontend 는 `ConsentDocument.url` 로 외부 링크만 연다. `url` 은 공개 접근 가능한 절대 URL 이어야 한다. 현재 값은 **placeholder** → `L-02` (§8) |
| `consent_events.source` 의 `signup_oauth` | 가입 경로를 서버가 알아야 기록할 수 있다. 현재 Frontend 는 `signup_email` · `reconsent` 만 보낸다 → `S2-CONSENT-1` (§8) |
| `timezone` 신뢰·저장 | `caregiver_profiles.timezone`. D-16 은 전송 경로만 정의했다. IANA 목록 검증은 서버 책임 |
| RLS · 소유권 검증 | `FORBIDDEN` · `CHILD_NOT_FOUND` |
| `ConsentDocument.updatedAt` | Design Spec §2.6 의 "updated {date}" 를 렌더하려면 contracts 에 필드 추가가 필요하다 (§8 Non-blocking ②) |

---

## 5. 허용 차이 `AD-S2-*` 전체 (16건)

`AD-S2-1` ~ `AD-S2-12` 는 Design Spec §11.3 에 **사전 등록**되어 있다. `AD-S2-13` 은 `2-AUTH`
구현 중 development-agent 가 추가 등록했다 (결정 `D-15` "충돌 시 Apple 규격 우선 + 허용 차이 기록").

| ID | 차이 | 근거 | 허용 범위 |
|---|---|---|---|
| **AD-S2-1** | `/auth/sign-up` 에서 Figma `179:1737–1745`("YOUR CHILD" FieldGroup + 단일 동의 체크박스)를 **렌더하지 않음** | `C-5 · C-1` — 가입은 보호자 정보만, 동의는 별도 화면 | 해당 영역 전체. 비교는 보호자 영역 클립(`s2-signup`) |
| **AD-S2-2** | Welcome · Log in 에 **Apple 버튼 추가** (Figma 에 없음) | `C-13 · M-16` | 버튼 1개분 레이아웃 |
| **AD-S2-3** | 소개 화면 medallion **200 → 188** | P-16 3단계 스케일 흡수 | 지름 ±12px |
| **AD-S2-4** | Step 1 아이 이름 **1행 → 2행** | `C-6 · D-03` | FieldGroup 행 1개 증가 |
| **AD-S2-5** | 생년월 **자유 텍스트 → 년·월 SelectTrigger** | 결정 `D-10` | 컨트롤 형태 |
| **AD-S2-6** | 성별 **pill(Tag) → SelectTrigger `row`** | 라벨 길이 · 터치 44 · 320px reflow | 행 1개 증가·형태 |
| **AD-S2-7** | 덱 카드 fill `.85` → `.90`, radius 30 → 28 | 토큰 스케일 흡수 (#10-②) | 알파 ±0.05, radius ±2 |
| **AD-S2-8** | InfoRow radius 20 → 22, fill `.72` → a74 | 〃 | radius ±2, 알파 ±0.02 |
| **AD-S2-9** | Step 5 TopBar trailing IconButton **x=372 → 우측 gutter 24** | Figma 값이 프레임(393)을 17px 넘어간다 | 위치 차이 |
| **AD-S2-10** | 소개 화면 InfoRow 문구 변경 | Figma 문구가 Step 5 만 설명 | 문구 비교 제외 (현재는 **빈 슬롯** — `S2-COPY-1`) |
| **AD-S2-11** | Step 5 RadioGroup **6옵션**(Figma 5옵션) | `C-8 · D-04` | 옵션 1개분 + 구분선·caption |
| **AD-S2-12** | Button 높이 58 → 56, 폭 341/345 → 컬럼 100%(gutter 24) | `P-15` 확정 + `AD-10` | 높이 ±2, 좌우 ±2 |
| **AD-S2-13** (`2-AUTH` 추가) | Apple 버튼 표면이 **solid white 가 아니라 반투명 glass** (`Button variant=glass`) | Design Spec §2.1 이 `variant=glass` 지정. 로고·라벨·높이·비율 등 **식별 요소는 전부 Apple 규격대로** | 표면 알파/블러 차이만. 로고·라벨·간격·높이 차이 없음 |

### `2-HOME` 이 추가 등록하는 허용 차이

| ID | 차이 | 근거 | 허용 범위 |
|---|---|---|---|
| **AD-S2-14** (신규) | Home 워드마크(`26:39`)를 **로고 에셋이 아니라 텍스트**로 렌더하고 크기를 **21px → `--text-title-2`(22px)** 로 흡수 | `COMPONENT_MAP.md` §Home 이 `26:39` 를 "SF Pro Heavy 21px 텍스트 로고, 에셋화 **NEEDS DECISION**" 으로 기록했다. Design Spec §2.13 은 "로고 에셋" 으로 적었으나 **에셋이 존재하지 않는다**. raw 값은 토큰 스케일로 흡수한다 (Stage 0 #10) | 글자 크기 +1px. 자형·색·위치 차이 없음. **에셋이 확정되면 `HomeTopBar` 의 `Text` 1곳만 교체** |

### QA 수정 1회차가 추가 등록하는 허용 차이 (`QA-2-003` 대응)

> **Design Spec §11.3 은 design-agent 소관이라 건드리지 않았다.** 아래 2건을 §11.3 표로
> 옮길지는 design-agent 가 판단한다 (`S2-DESIGN-1`, §8.3).

| ID | 차이 | 근거 | 허용 범위 |
|---|---|---|---|
| **AD-S2-15** (신규) | `/onboarding` 소개 화면의 **제목·본문·CTA 라벨 변경**<br>· 제목 `179:1757` "Hi — before your first night with Yuna…" → "Let's set up your child's profile"<br>· 본문 `179:1758` "Ten short questions about things you may have noticed in the last two weeks…" → "A few questions about what your read-aloud time looks like today. There are no right answers — what you notice is enough."<br>· CTA `179:1768` "Start the questions" → "Start" | **Figma 문구를 그대로 쓸 수 없다.** ① 제목이 아이 이름("Yuna")을 부르는데 이 화면은 **이름을 받기 전**이다 (이름은 Step 1 에서 수집 — 없는 값을 문구에 넣을 수 없다). ② "Ten short questions" · "Start the questions" 는 **Step 5(10문항)만** 설명하는데 실제 온보딩은 5단계다 — `AD-S2-10`(InfoRow 문구) 와 **같은 사유**이며 그 등록이 제목·본문·CTA 를 덮지 못했을 뿐이다. ③ "No right answers" 라는 **의미는 보존**했다 (진단·판정 금지 — `rules/frontend.md` §8) | 문구 비교 제외. 레이아웃(블록 수·위치·크기)·톤 차이 없음. 최종 문구는 `S2-COPY-1` 결정에 묶여 있다 |
| **AD-S2-16** (신규) | 화면 **하단 블록이 앱 컬럼 맨 아래에 붙는다** — Figma 프레임은 하단에 약 44px(iOS home indicator 영역, 예: `179:1723`·`179:1747`·`179:1818` `y=838`)를 비워 두고 버튼·각주를 `y≈750`/`788` 에 둔다. 구현은 데스크톱 브라우저 baseline 에서 `y≈796` (하단 flush) 이다 | 그 44px 은 **`--layout-safe-bottom`(= `env(safe-area-inset-bottom)`)** 이 맡는 영역이며 실기기에서는 그만큼 밀려 올라간다. 데스크톱 브라우저에서는 `env()` 가 `0px` 이다. Figma 상단 status bar 56px 을 `--layout-safe-top` 으로 흡수한 것과 **같은 처리**다 | 세로 위치 하단 ±48px. 블록 순서·간격·크기 차이 없음. 대상: `/auth/welcome` 각주 · `/auth/sign-up` CTA · `/auth/consent` CTA · `/onboarding` CTA · `/onboarding/saved` CTA |

---

## 6. Stage 2-B 이관 항목 (QA 는 Verdict 계산에서 **제외**한다)

근거: `docs/decisions/stage-2-approvals.md` §3 (Stage 2 / Stage 2-B 분리, 2026-09-24 user).
디자이너 Figma 도착 후 `docs/design/stage-2-designer-request.md` 를 근거로 별도 진행한다.

| # | 이관 항목 | 구체 내용 | 영향 AC | Stage 2 에서 준비된 것 |
|---|---|---|---|---|
| **B-1** | **`C13-09` 프로필 결과 화면** | `/onboarding/profile` route · `ProfileResultView` · 강점 2 / growing edge 2 · 페르소나 표시 · "판정이 아니다" 안내 | AC-2-34 · AC-2-35 · AC-2-36 | contracts `ProfileResult` · `Persona` schema, Mock `persona-fallback` scenario, 제출 응답 **parse 검증까지** |
| **B-2** | **`C13-10` 발전 역량 제시 화면** | `/onboarding/growth-capability` route · `GrowthCapabilityPicker` · 축 탭 변경 → `PUT …/growth-capability` | AC-2-37 | contracts schema만 |
| **B-3** | **결정 `D-2` — 점수 없는 축(`null`)의 시각 표현** | 다이아몬드에서 `score: null` 을 "0 또는 최저값" 으로 보이게 하지 않는 표현 방식 | AC-2-32 | `scoreCapabilities` 가 `null` 을 정확히 반환하고 `missingCount` 를 제공. **시각 표현 없음** |
| **B-4** | **결정 `D-6` — Route Guard 의 "프로필 결과 확인" 단계** | Guard 판정에 프로필 단계를 넣지 않기로 확정(`MeResponse` 에 대응 필드를 만들지 않는다). Step 5 제출 직후 **연속 네비게이션**으로 처리 | AC-2-42 의 일부 | `resolveGuardDecision` 에 프로필 분기가 **없음**이 의도된 상태 (주석으로 고정) |
| **B-5** | **`CapabilityDiamondChart` · `PersonaCard` 컴포넌트** | inline SVG 4축 차트 + 접근성 이름, 페르소나 카드 | AC-2-33 | `entities/child` 에 **미생성** (선구현 금지) |

**QA 확인 요청**: 위 5건이 코드에 **없어야** 정상이다. `ROUTES` · `app/router.tsx` ·
`entities/child` 에 프로필/다이아몬드/페르소나가 없음을 확인하면 된다 (`AC-2-02` 증거와 동일).

---

## 7. Mock 시나리오 목록과 전환 방법

### 전환 방법

```
# URL 이 1순위 (SPA 수명 동안 유지된다)
/auth/log-in?scenario=me:onboarding-incomplete
/auth/sign-up?scenario=me:consent-missing,consents:error   # 쉼표로 여러 그룹

# dev Scenario Panel (dev 빌드에서만)
pnpm dev → 우하단 패널

# 테스트
createHarness({ scenarios: ['auth:error', 'me:vpc-failed'] })
```

### 그룹별 key — **고유 key 17종** (Plan §8.2), 그룹 × key 조합 49건

고유 17종: `success` · `loading` · `error` · `retry` · `offline` · `empty` · `token-expired` ·
`provider-cancelled` · `consent-missing` · `consent-version-outdated` · `vpc-pending` ·
`vpc-failed` · `onboarding-incomplete` · `draft-resume` · `persona-fallback` ·
`child-limit-reached` · `capability-all-missing` — **alias·신규 key 0건** (AC-2-53).

| 그룹 | key | 비고 |
|---|---|---|
| `auth` (`MockAuthGateway`) | `success` · `loading` · `error` · `retry` · `offline` · `token-expired` · `provider-cancelled` | 7 |
| `me` (`MockMeApi`) | `success` · `loading` · `error` · `retry` · `offline` · `token-expired` · `consent-missing` · `consent-version-outdated` · `vpc-pending` · `vpc-failed` · `onboarding-incomplete` | 11 |
| `consents` (`MockConsentApi`) | `success` · `loading` · `error` · `retry` · `offline` · `consent-missing` · `consent-version-outdated` | 7 |
| `onboarding` (`MockOnboardingApi`) | `success` · `loading` · `error` · `retry` · `offline` · `consent-missing` · `vpc-pending` · `vpc-failed` · `onboarding-incomplete` · `draft-resume` · `persona-fallback` · `child-limit-reached` · `capability-all-missing` | 13 |
| `books` (`MockBooksApi`) | `success` · `loading` · `empty` · `error` · `retry` · `offline` | 6 |
| `health` (`MockHealthApi`) | `success` · `loading` · `error` · `retry` · `offline` | 5 (Stage 1) |

> 그룹별 정확한 key 목록은 각 Mock 파일의 `*_SCENARIO_KEYS` 상수가 **단일 출처**다.
> `2-HOME` 은 **신규 scenario key 를 만들지 않았다** — 로그아웃은 `AuthGateway.signOut()` 하나이고
> Mock 은 항상 성공한다. 실패 경로는 gateway 주입으로만 재현한다 (§9).

---

## 8. 추적 항목 · 결정 대기

### 8.1 `L-02` 약관·개인정보방침 — **출시 전 차단 항목**

| | 내용 |
|---|---|
| 현재 상태 | `shared/config/legal-links.ts` 의 5개 URL 이 전부 `https://haru.invalid/legal/*--placeholder` |
| 화면 노출 | **노출된다** — Welcome 고지문 2건 · 동의 화면 5항목 링크 |
| 가짜임을 판별하는 함수 | `isPlaceholderLegalUrl(url)` (`.invalid/` + `placeholder` 동시 포함) |
| 테스트가 고정한 것 | `e2e/consent.spec.ts` 가 5개 링크 전부 `/\.invalid\/.*--placeholder$/` 임을 확인 |
| 교체 방법 | `legal-links.ts` 상수 5줄 교체. 코드 변경 없음 |
| 걸어 둔 곳 (3곳) | `docs/workflow/WORKFLOW_STATE.md` §3 · 이 문서 · Stage 8 `BACKEND_HANDOFF.md` "출시 전 차단 항목" |

**실제 사용자가 동의 화면을 만나기 전 반드시 준비돼야 한다.**

### 8.2 디자이너 요청 3건 (`stage-2-approvals.md` §6, 2026-09-24 user)

| # | 요청 | 구현 처리 | 상태 |
|---|---|---|---|
| ① | `179:1775`(Step 5 forward)가 프레임을 **17px 벗어남** | gutter 24 정렬로 구현 (`AD-S2-9`) | 전달 완료 · Figma 수정 대기 |
| ② | `179:1763` / `179:1767` 문구가 **5단계 소개 화면인데 Step 5 만 설명** | **구현 보류** — copy 모듈에 **빈 슬롯**(`intro.durationSlot` · `formatSlot` = `null`). 슬롯이 비면 해당 InfoRow 를 렌더하지 않는다 | **`S2-COPY-1` — 문구 결정 대기** |
| ③ | Step 5 옵션 행 **43px** — 터치 44 미달 | **44 로 구현** | 전달 완료 · 규격 확인 대기 |

> Stage 2-B 요청서(`docs/design/stage-2-designer-request.md`, `C13-09`·`C13-10`)는 이 3건과 별개다.

### 8.3 결정 대기 / 확인 필요 항목

| ID | 내용 | 대상 | 상태 |
|---|---|---|---|
| **`S2-COPY-1`** | 소개 화면 문구 미확정 — 질문지의 "~2.5 minutes · five questions" 는 **Q1~Q5 만** 센 값이라 그대로 쓸 수 없다 (Step 1 · Step 5 가 더 있다). 현재 **빈 슬롯** | 기획 | **결정 필요** |
| **`S2-ONB-1`** | 질문지가 Q1·Q2·Q4 를 **Required** 로 적지만 결정 `D-C` 는 Step 2~4 를 **전부 선택**으로 확정 — 구현은 **D-C 를 따랐다**. 추천 cold-start 품질과 트레이드오프 | 기획 | 확인 권장 |
| **`S2-ONB-2`** | 질문지 **Q5 표지 그리드**(8권 프리셋, 2열 썸네일) 미구현 — 표지 이미지는 **Stage 3** 범위. 같은 데이터는 제목 입력으로 수집 중 | Stage 3 | 결정 필요 |
| **`S2-ONB-3`** | `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` 가 `CLAUDE.md` Source of Truth 표에 **미등재** (= `S2-SRC-1`) | 사용자 | 확인 필요 |
| **`S2-CONSENT-1`** | `consent_events.source` 의 **`signup_oauth` 미구분** — Google·Apple 가입도 `signup_email` 로 기록한다. 수정은 `consentSourceFor()` **한 함수**이나, 가입 경로 기억에 ⓐ Gateway interface 확장 ⓑ 전역 상태 ⓒ `AuthSession` 필드 추가 중 하나가 필요해 승인 범위를 넘는다 | 사용자 | **결정 필요** |
| **`S2-AUTH-2`** | `AD-S2-13`(Apple glass 표면)을 Design Spec §11.3 표에 옮길지 | design-agent | 정보 |
| **`S2-DESIGN-1`** (신규, `QA-2-003`) | **Design Spec §11.3 허용 차이 표 갱신 필요** — `AD-S2-15`(소개 화면 제목·본문·CTA 문구) · `AD-S2-16`(하단 블록 safe-area flush). development-agent 는 §11.3 을 수정하지 않는다 (design-agent 소관 문서) | design-agent | **갱신 요청** |
| **`S2-HOME-1`** (신규) | Home 워드마크 **에셋화 여부** — 현재 텍스트 렌더 (`AD-S2-14`). `COMPONENT_MAP.md` 가 이미 NEEDS DECISION 으로 표시 | 디자이너 | 결정 필요 |
| **`QA-1-002`** | TextField `trailingAction` 밑줄 — `2-UI` 에서 **제거**하고 `P-17` 로 등록, baseline `v5-field` 재생성 | 사용자 | `P-17` 로 이관 |
| **`QA-1-004`** | `devWarn` 주석 정정 + `import.meta.env.DEV` 게이트 | `2-UI` 에서 처리 | 해소 |

### 8.4 남은 가값 (provisional) 6건 — AC-2-62

Stage 1 의 16건 중 11건이 확정되고 **6건이 남았다** (`stage-1-approvals.md` §9.4-3 절차대로
Stage 2 Verdict 보고 후 · Stage 3 착수 전에 항목별로 재제시한다).

| P | 토큰 | Stage 2 실사용처 | 재제시 시 함께 볼 것 |
|---|---|---|---|
| **P-01** | `--color-fg-secondary` / `-tertiary` | Auth·온보딩 helper 텍스트, 설문 eyebrow, **Home EmptyState 설명** | 실측 대비 2.91~3.13:1 + 실제 화면 |
| **P-02** | 비텍스트(진행 바·칩 경계·배지 글자) | 온보딩 진행바, Step 3 Chip | 배지 흰 글자 1.56~1.86:1 |
| **P-04** | `--color-status-*` (16) · field error 2 | VPC 실패 InlineAlert, 필드 에러, Trial 안내, **로그아웃 ConfirmDialog destructive 테두리**, **로그아웃 실패 InlineAlert** | 오류·경고 톤이 "양육자가 불안을 만나는 지점" |
| **P-05** | `--color-scrim` | 성별 선택 Sheet, **로그아웃 `ConfirmDialog`** | 실제 Sheet·Dialog 내용 위 분리감 (모바일 실기기 권장) |
| **P-16** | medallion sm/md/lg + ring-offset | `CharacterMedallion` — Welcome · Intro · Log in | design-agent Figma 실측 결과 |
| **P-17** | TextField `trailingAction` 밑줄 **제거** (결정 `D-14`) | Auth 비밀번호 Show/Hide, Step 1 Add/Clear | Figma `76:417`/`76:428` 와 일치. 보완 3종(라벨 상태 전달 · `aria-pressed` · focus ring) 적용 |

가값은 FAIL 사유가 아니다 (`rules/qa.md` §2). QA 리포트에 남은 목록만 기록한다.

---

## 9. `2-HOME` Step 상세 (이 Step 의 개별 handoff 를 겸한다)

### 9.1 생성 파일

| 파일 | 역할 |
|---|---|
| `apps/web/src/shared/lib/session-cleanup.ts` | `performSessionCleanup()` — 순수 오케스트레이션 (Plan §5.4) |
| `apps/web/src/features/settings/copy.ts` | 설정 문구 (영어, 진단 표현 없음) |
| `apps/web/src/features/settings/model/useSignOut.ts` | 로그아웃 Mutation hook |
| `apps/web/src/features/settings/ui/SettingsMenu.tsx` | ListGroup 1행 + ConfirmDialog + 실패 InlineAlert |
| `apps/web/src/features/settings/index.ts` | feature 공개 진입점 |
| `apps/web/src/pages/home/HomePage.tsx` | Home skeleton 본문 (EmptyState) |
| `apps/web/src/pages/home/HomeTopBar.tsx` | 워드마크 `26:39` + 설정 `26:44` |
| `apps/web/src/pages/home/index.ts` | — |
| `apps/web/src/pages/settings/SettingsPage.tsx` | Composition only |
| `apps/web/src/pages/settings/SettingsTopBar.tsx` | centered TopBar + 뒤로 |
| `apps/web/src/pages/settings/index.ts` | — |
| `apps/web/src/shared/copy/home-copy.ts` | Home 문구 (§9.6 ②) |
| `apps/web/src/shared/lib/__tests__/session-cleanup.test.ts` | 2건 |
| `apps/web/__tests__/home-settings.test.tsx` | 15건 |
| `e2e/home.spec.ts` | 8건 |
| `e2e/__screenshots__/darwin/visual.spec.ts/s2-home-header.png` | 신규 baseline |

### 9.2 수정 파일

| 파일 | 변경 |
|---|---|
| `apps/web/src/app/router.tsx` | `/` → `HomePage` + `HomeTopBar`, `/settings` 등록, route 표 주석 갱신 |
| `apps/web/src/shared/copy/app-copy.ts` | `placeholder` 항목 **삭제** |
| `apps/web/src/test/harness.tsx` | `queryClient` 를 반환 (AC-2-29 캐시 검증용) |
| `apps/web/src/app/__tests__/router.test.tsx` | `/settings` route 등록 확인 1건 추가 |
| `packages/ui/src/icon/registry.ts` | Lucide `book-open` 추가 (Design Spec §2.13 EmptyState 아이콘) |
| `e2e/visual.spec.ts` | `s2-home-header` baseline 블록 추가 |

### 9.3 삭제

```
apps/web/src/pages/placeholder/PlaceholderPage.tsx   (디렉토리째 삭제)
```

- Plan §17.2 이월 7번 완료.
- `apps/web/src` · `e2e` 에서 `PlaceholderPage` 참조 **0건**. 남은 언급은 Stage 1 QA 문서
  (`docs/qa/stage-1*.md`)뿐이며 이는 **당시 사실의 기록**이라 수정하지 않는다.

### 9.4 Home skeleton 구성 (#33 · `C13-13`)

```
[TopBar variant="large" · sticky]
  leading  = Text(title-2 / heavy) "HARU"          ← 26:39   (AD-S2-14)
  trailing = IconButton(settings, "Settings") → /settings   ← 26:44
[본문 — 세로 가운데 정렬, py-8]
  EmptyState
    icon        = Lucide `book-open` (아이콘 배지 48)
    title (h1)  = "Your storytime space is ready."
    description = "Tonight's activity will show up here."
    action      = 없음 (Stage 2 에는 이동할 곳이 없다)
```

- **contract 호출 0건.** `HomeSummary` · `ActivityCard` 는 Stage 3 → 이 화면에 Loading/Error
  상태가 **없다** (Design Spec §2.13 결정 그대로).
- **마운트하지 않은 것**: Activity Card 덱 · 추천 · 서재 · streak chip(`26:40`) · 캐릭터(`26:22`)
  · 버블(`88:922`) · `BottomTabBar` · 알림 설정.
- 화면 전체의 조작 요소는 **설정 IconButton 1개뿐**이다 (테스트로 고정).

### 9.5 설정 목록 (`C13-12`) 과 로그아웃 (`D-7` · `D-3`)

```
[TopBar variant="centered"] leading=IconButton(chevron-left,"Back")  title="Settings"
[ListGroup aria-label="Account"]
  └ ListRow "Log out"  (trailing 없음 — 액션 행)  → ConfirmDialog
```

목록은 **로그아웃 1행뿐**이다. 데이터 관리·탈퇴·동의 이력은 Stage 8, 알림 설정은 Stage 3,
아이 프로필 수정은 Stage 6 (`C-16`).

**ConfirmDialog (결정 `D-7`)**

| 항목 | 값 |
|---|---|
| role | `alertdialog`, `variant=destructive` |
| 제목 | "Log out?" |
| 본문 | "Onboarding answers saved on this device will be removed." |
| 버튼 | 확인 "Log out" / 취소 "Cancel" |
| 초기 포커스 | **취소** (destructive) |
| `Esc` | 취소와 동일 |
| 행 라벨 색 | 빨간색으로 구분하지 **않는다** — destructive 신호는 Dialog 가 전달 (WCAG 1.4.1) |

**로컬 정리 (결정 `D-3` 삭제 시점 ②, AC-2-29)**

```
useSignOut → performSessionCleanup({
   signOut             : AuthGateway.signOut()          ← 주입 (app/providers 선택)
   clearOnboardingDraft: OnboardingDraftStore.clear()   ← localStorage "haru.onboarding.draft.v1"
   clearQueryCache     : QueryClient.clear()
})
```

- `2-ONBOARDING` 이 공개해 둔 `clear()` 를 **이 Step 이 호출**한다.
- `signOut()` 이 실패해도 **로컬 정리는 수행한다** (`try/finally`). 사용자가 이미 "이 기기에서
  나간다"고 확인했고, 남은 아동 데이터를 기기에 두는 쪽이 더 나쁜 결과다. 실패는 숨기지 않고
  목록 위 `InlineAlert tone=error` 로 알린다.
- **화면 이동을 하지 않는다.** 세션이 사라지면 `useMe` → `null` → Route Guard 가
  `/auth/welcome` 으로 보낸다 (`2-AUTH` 가 세운 "이동은 Guard 가 한다" 규칙 유지).

**로컬이 실제로 비는 증거**

| 증거 | 내용 |
|---|---|
| `session-cleanup.test.ts` | 호출 순서 `signOut → clearOnboardingDraft → clearQueryCache` 고정 · 실패해도 두 정리가 각 1회 실행 |
| `home-settings.test.tsx` | jsdom **실제 `localStorage`** 에 유효한 draft 를 넣고 로그아웃 → `haru.` 접두 키 **전수 0건** + Query 캐시에 **데이터 보유 항목 0건** + 경로 `/auth/welcome` |
| `e2e/home.spec.ts` | Trial Step 1 에서 **실제로 생성된** draft 를 두고 로그인 → 로그아웃 → `Object.keys(localStorage).filter(k => k.startsWith('haru.'))` → `[]` |
| 취소 경로 | Dialog 취소 시 draft **유지** · 경로 `/settings` 유지 (단위 + e2e) |

### 9.6 `2-HOME` 이 내린 판단 (QA 확인 요청)

**① `/` 와 `/settings` 에 각각 전용 layout route 를 두었다.**
Home 헤더는 `variant="large"` + 제목 없음 + 워드마크/설정 구성이라 다른 화면과 공유할 수 없다.
`/auth/*` 가 이미 화면별 layout route 를 쓰는 것과 같은 방식이며, `pages → app` import 금지를
지키기 위해 TopBar 만 `pages/home` · `pages/settings` 에 두고 router 가 주입한다.

**② Home copy 를 `shared/copy/home-copy.ts` 에 두었다.**
Stage 2 Home 은 **feature 가 없는 골격**이다 (Activity Card·추천·서재가 전부 Stage 3).
`features/home` 을 지금 만들면 Plan §9.3 의 feature 목록(auth · consent · onboarding-survey ·
child-profile · settings)을 벗어난다. 문구를 컴포넌트에 흩지 않는다는 규칙은 지켰고,
Stage 3 에서 Home 이 feature 를 가지면 그 copy 모듈로 옮긴다.

**③ 로그아웃 실패 시 `InlineAlert` 를 추가했다.**
Design Spec §2.14 에 실패 상태가 없지만 `rules/frontend.md` §7 이 모든 화면에 Error 상태를
요구한다. Mock 에서는 재현되지 않는(항상 성공) 경로라 **gateway 주입 테스트**로만 검증했다.
문구: "We couldn't finish logging out" / "Saved answers on this device were removed. You can try again."

**④ `book-open` 아이콘을 registry 에 추가했다.**
Design Spec §2.13 · §3.1 이 지정한 글리프인데 Stage 1 registry 에 없었다. 명시 등록 정책
(전체 라이브러리 미개방)을 유지했다.

**⑤ `createHarness` 가 `queryClient` 를 반환하도록 넓혔다.**
AC-2-29 의 "Query 캐시 잔존 0건" 을 화면 테스트에서 증명하려면 화면이 실제로 쓰는 QueryClient
참조가 필요하다. 기존 반환값은 그대로 두고 필드만 추가했다 (기존 테스트 영향 0).

**⑥ `@testing-library/user-event` 를 도입하지 않았다.**
신규 런타임/개발 의존 추가는 승인 사항이다. 기존 테스트와 같이 `fireEvent` 를 쓰고, 실제
포인터·키 입력은 `e2e/home.spec.ts` 가 덮는다.

### 9.7 `2-HOME` 이 만들지 않은 것 (경계)

| 항목 | 사유 |
|---|---|
| Activity Card · 추천 · 서재 · streak · 캐릭터 · 버블 | Stage 3 (#33) |
| `BottomTabBar` **마운트** · `TabLayout` route | Stage 3 (컴포넌트는 Stage 1 부터 존재하나 어디에도 마운트되지 않는다) |
| 알림 설정 행 | Stage 3 (`C-16`) |
| 데이터 관리 · 탈퇴 · 동의 이력 보기 | Stage 8 (`C-15` · `C-19`) |
| 아이 프로필 수정 · 설문 재응답 · 발전 역량 변경 | Stage 6 |
| `/onboarding/profile` · `/onboarding/growth-capability` · `CapabilityDiamondChart` · `PersonaCard` | **Stage 2-B** (§6) |
| Backend 일체 | `apps/api/` · `supabase/` 미생성 |

---

## 10. QA 재현 절차

### 10.1 전체 명령

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm lint:boundaries
pnpm test
pnpm build
pnpm format:check
pnpm test:e2e
pnpm assert:no-mocks        # AC-2-55 (http 빌드 산출물에 mocks 0건)
```

### 10.2 화면별 진입 (dev 서버)

```bash
pnpm dev

# Auth
/auth/welcome                                        # Google · Apple · Email
/auth/reset-password                                 # 토큰 없음 → 만료 안내

# 동의 · VPC
/auth/sign-up?scenario=me:consent-missing            # 가입 제출 → 동의 5항목
/auth/sign-up?scenario=me:consent-version-outdated,consents:consent-version-outdated
/auth/sign-up?scenario=me:vpc-pending                # → /auth/verify-parent (머묾)
/auth/sign-up?scenario=me:vpc-failed                 # → 안내 + Try again

# 온보딩 (Trial — 서버 요청 0건)
/onboarding                                          # 미인증으로 바로 진입 가능
/onboarding/child-info  …  /onboarding/capability-items
/onboarding?scenario=onboarding:draft-resume         # 중도 복귀
/onboarding/books?scenario=books:empty               # 결과 없음 → 제목 직접 입력

# Home · 설정 · 로그아웃  ← 2-HOME
/auth/log-in                                         # sam@example.com / sunny-evening-8
   → Guard 가 `/` 로 착지시킨다 (me:success = 온보딩 완료)
   → 헤더 설정 아이콘 → /settings → "Log out" → ConfirmDialog → 확인
   → /auth/welcome 으로 이동. DevTools > Application > Local Storage 에
     `haru.` 로 시작하는 키가 **하나도 없어야** 한다
```

> **주의**: Mock 세션은 메모리에 있다. `/settings` 를 **새로고침으로** 열면 로그인이 풀려
> Welcome 으로 되돌아간다. 화면 안에서 클릭으로 이동해야 한다 (e2e 도 동일하게 작성했다).

### 10.3 Privacy 불변식만 빠르게 (AC-2-13)

```bash
npx vitest run apps/web/__tests__/consent-screens.test.tsx     # 동의 이전 구간 전수
npx vitest run apps/web/__tests__/onboarding-screens.test.tsx  # Trial 요청 0건
npx vitest run apps/web/__tests__/home-settings.test.tsx       # 로그아웃 요청 · 저장소
npx vitest run apps/web/src/shared/lib/__tests__/              # draft · session-cleanup
```

### 10.4 Scope 확인

```bash
ls apps packages                      # apps: web / packages: config contracts design-tokens ui
git ls-files | grep -E "^(apps/api|supabase)/"    # 결과 0건
grep -rn "PlaceholderPage" apps/web/src e2e       # 결과 0건

# BottomTabBar 마운트 0건 — 아래 결과에 주석·dev gallery·TabLayout 슬롯 정의만 나오고
# `<BottomTabBar` JSX 사용은 `packages/ui` 테스트와 dev gallery 밖에 없어야 한다.
grep -rn "BottomTabBar" apps/web/src
grep -rn "<BottomTabBar" apps/web/src/app apps/web/src/pages apps/web/src/features   # 0건
```

---

## 11. 발견한 문제 — 종합

### Blocking

**없음.**

### Non-blocking (구현했으나 명세와 차이 — QA 판단 요청)

| # | Step | 내용 |
|---|---|---|
| 1 | `2-CONSENT` | Design Spec §2.6 의 "Version {version} · updated {date}" 중 **`{date}` 미렌더** — `ConsentDocument` 에 갱신 일자 필드가 없다. 표시하려면 contracts 에 `updatedAt` 추가 필요 |
| 2 | `2-CONSENT` | `RecordConsentsRequestSchema` 가 `.strict()` 가 아니다 (알 수 없는 키를 조용히 제거). 결과적으로 아동 데이터는 나가지 않으나 `SignUpWithEmailInputSchema` 와 방어 수준이 다르다 |
| 3 | `2-CONSENT` | `packages/ui` `Button` 의 `aria-disabled` 소비자 값 존중으로 수정 (공유 컴포넌트 변경 — baseline 무변경 확인) |
| 4 | `2-ONBOARDING` | Design Spec §2.10 Step 2 의 4축·선호 활동 Chip 이 결정 `D-A` 로 **질문지 Q1·Q4 2문항으로 교체**됨. 화면 **구조**는 명세 그대로 |
| 5 | `2-ONBOARDING` | Design Spec §2.10 Step 4 "목표는 4대 역량과 다른 개념" 을 결정 `D-B` 가 **뒤집음** (같은 목록 사용). 금칙 표현 테스트가 충돌 위험을 막는다 |
| 6 | `2-ONBOARDING` | `/onboarding/:step` 의 TopBar 를 **feature 가 렌더**한다 (단계·문항마다 내용이 다르다). 시각 결과 동일, `sticky` 만 미적용 |
| 7 | `2-AUTH` | 인라인 링크 터치 타깃 22px — WCAG 2.5.8 inline 예외로 판단 |
| 8 | `2-AUTH` | `AppShell` 배경 덮임 결함(Stage 1 이월) 수정 + 회귀 테스트 4건 추가 |
| 9 | **`2-HOME`** | Home 워드마크를 **텍스트로 렌더** (에셋 부재) — `AD-S2-14` · `S2-HOME-1` |
| 10 | **`2-HOME`** | 로그아웃 실패 `InlineAlert` 추가 (Design Spec 에 없는 상태 — §9.6 ③) |

### NEEDS_DECISION

`S2-COPY-1` · `S2-ONB-1` · `S2-ONB-2` · `S2-ONB-3` · `S2-CONSENT-1` · `S2-HOME-1` ·
`S2-DESIGN-1`(QA 수정 1회차 신규) · `QA-1-002`
→ 전부 §8.3 에 있다. **구현을 막는 항목은 없다.**

### Stage 2 전체에서 미수행 · 사유

| 항목 | 사유 | 판정 제안 |
|---|---|---|
| ~~온보딩 화면 3건(`179:1748` · `179:1770` · `179:1809`) 시각 baseline 미생성~~ | **해소** — QA 수정 1회차에서 `s2-onboarding-intro` · `s2-onboarding-step5` · `s2-onboarding-saved` 3건을 추가했다 (§12.4) | 해소 |
| 실기기(iOS/Android) 검증 | Stage 4 부터 (Capacitor 미도입) | 해당 없음 |
| 실제 Backend 연동 | Frontend-only Scope | `BACKEND_INTEGRATION_PENDING` (§4) |

---

## 12. QA 수정 1회차 — `QA-2-001` · `QA-2-002` · `QA-2-003` + `S2-HOME-2`

입력: `docs/qa/stage-2-qa-report.md` (2026-09-26, `Stage Verdict: FAIL`).
`.claude/rules/development-agent` §6 에 따라 **보고된 항목만** 수정했다. 기능 추가·리팩터링 없음.
**재검증은 stage-qa-agent 가 한다 — 이 문서는 PASS 를 선언하지 않는다.**

### 12.1 `QA-2-001` (High) — 덱 안에서 마우스 클릭이 동작하지 않음

**원인 (직접 재현해 특정 — QA 추정과 동일했다).**
`SwipeDeck` 이 `onPointerDown` 에서 곧바로 `setPointerCapture()` 를 걸었다. 포인터가 캡처되면
브라우저는 **후속 호환 마우스 이벤트(`mouseup`)와 `click` 의 target 을 캡처 요소로 리타깃**한다.
실측 로그(Playwright, `/onboarding/capability-items` 에서 radio 를 클릭):

```
pointerdown -> INPUT.haru-radio-group__input
mousedown   -> INPUT.haru-radio-group__input
mouseup     -> DIV.haru-swipe-deck__card--front      ← 리타깃
click       -> DIV.haru-swipe-deck__card--front      ← 리타깃 → radio 미선택
checked = false
```

`label`/`input` 의 활성화 동작은 `click` 이 그 요소에 도달해야 일어나므로 라디오도,
카드 안의 `Clear this answer` IconButton 도 마우스로는 눌리지 않았다.
키보드(`Space`)는 click 을 거치지 않고, 터치는 **암묵적 포인터 캡처**가 이미 원래 target 을
가리키고 있어서 둘 다 정상이었다 — 그래서 기존 테스트가 전부 통과했다.

**수정** — `packages/ui/src/deck/SwipeDeck.tsx`

| 이전 | 이후 |
|---|---|
| `pointerdown` 에서 즉시 `setPointerCapture` + `dragging=true` | `pointerdown` 은 **누른 포인터 id 와 시작 좌표만 기록**한다 |
| — | `pointermove` 에서 이동량이 **`SWIPE_SLOP_PX`(8px) 를 넘은 시점에만** `dragging=true` + `setPointerCapture` |
| `pointerup` 에서 무조건 release | 끌지 않았으면 아무것도 소비하지 않는다. 캡처했을 때만 release |
| — | 마우스에 한해 `buttons === 0` 인 이동은 누름 상태를 정리한다 (캡처 없는 구간에서 카드 밖에서 버튼을 뗀 경우 `pointerup` 이 오지 않는다) |

끌기 **중에는** 여전히 캡처가 걸리므로 ① 포인터가 카드를 벗어나도 이동·종료를 받고
② 스와이프 직후의 `click` 은 카드로 리타깃되어 카드 안 컨트롤을 **실수로 누르지 않는다**.

**D-9 제약 유지**: `SwipeDeck.css` 무변경 — `scroll-snap` 없음, `overflow` 선언 없음
(`SwipeDeck.test.tsx` 의 D-9 회귀 테스트 3건 그대로 통과). 버튼·키보드 1급 경로 무변경.

### 12.2 `QA-2-002` (Medium) — `/onboarding/saved` CTA 위치

**원인.** 화면이 아니라 **Layout** 이었다. `StackLayout` 이 콘텐츠를 `<div className="grow">`
(평범한 block) 로 감쌌다. 화면 root 들은 Design Spec 의 `(flex spacer)` 를
`flex flex-1 flex-col` + `mt-auto` 로 구현하는데, 부모가 flex 컨테이너가 아니면 `flex-1` 이
적용될 대상이 없어 **화면 높이가 콘텐츠 높이로 줄고** `mt-auto` 가 흡수할 여백이 생기지 않는다.
`TabLayout` · `FullscreenLayout` 은 `RouteErrorBoundary` 를 `main`(flex column) **바로 아래**
두어 같은 문제가 없다 — `StackLayout` 의 래퍼 한 겹만 달랐다.

**수정** — `apps/web/src/app/layouts/StackLayout.tsx` 한 줄: `grow` → `flex grow flex-col`
(`footer` 슬롯이 계속 맨 아래에 있도록 `grow` 는 유지).

**실측 (Playwright, viewport 393×852)**

| | 수정 전 | 수정 후 | Figma `179:1809` |
|---|---|---|---|
| `main` | `{y:0, height:852}` | `{y:0, height:852}` | frame 852 |
| `h1` | y≈370 | **y=708** | `179:1813` y=615 (h 66) |
| CTA | `{y:451, height:56}` | **`{y:796, height:56}`** | `179:1814` y=750 (h 58) |

Figma 와 남는 46px 는 **home indicator 영역**이다 (`179:1818` 가 `y=838`). 그 영역은
`--layout-safe-bottom`(`env(safe-area-inset-bottom)`) 이 맡으며 데스크톱 브라우저에서는 `0px` 다
→ 허용 차이 **`AD-S2-16`** 로 등록했다 (§5). QA 리포트의 "Figma CTA ≈ y 675" 는 screenshot
추정값이고, **Figma 실측은 y=750** 이다 (`get_metadata 179:1809`).

**부수 영향 (의도된 것, 전부 Figma 에 더 가까워짐)**: 같은 `(flex spacer)` 구성을 쓰는
`/auth/welcome`(각주) · `/auth/log-in` · `/auth/sign-up`(CTA) · `/auth/consent`(CTA) 4화면에서도
하단 블록이 이제 실제로 아래로 내려간다. baseline 4건 재생성 — §12.4.

### 12.3 `QA-2-003` (Low) — 소개 화면 문구 차이 미등록

**판단: Figma 로 되돌리지 않고 허용 차이로 등록한다** (`AD-S2-15`, §5). 근거 3가지 —

1. Figma 제목 `179:1757` 은 아이 이름을 부른다("…with Yuna…"). **이 화면은 이름을 받기 전**이다
   (Step 1 에서 수집). 없는 값을 문구에 넣을 수 없고, placeholder 로 비워 두면 문장이 깨진다.
2. "Ten short questions"(`179:1758`) · "Start the questions"(`179:1768`) 는 **Step 5 만** 설명한다.
   실제 온보딩은 5단계다. 이미 등록된 `AD-S2-10`(소개 화면 InfoRow 문구)과 **완전히 같은 사유**이며,
   그 등록이 제목·본문·CTA 까지 덮지 못했던 것이 이번 지적의 실체다.
3. "No right answers" 의 의미는 보존했다 (진단·판정 금지 — `rules/frontend.md` §8).

**문서 반영**: `docs/qa/stage-2-handoff.md` §5 에 `AD-S2-15` 추가.
`docs/design/stage-2-design-spec.md` §11.3 은 **design-agent 소관이라 수정하지 않았다** —
§8.3 `S2-DESIGN-1` 로 갱신 요청만 남긴다. 최종 문구 확정은 `S2-COPY-1`(기획 결정 대기) 소속이다.

### 12.4 `S2-HOME-2` — 온보딩 3화면 시각 baseline 추가

`e2e/visual.spec.ts` 에 **영역 클립**(`REGION_SNAPSHOT` = `D-12` `0.002 / 20`) 3건 추가.
클립 대상은 `main` 이다 — 이번 결함의 성격이 **화면 전체 세로 배치**였기 때문이다.

| baseline | Figma | 진입 |
|---|---|---|
| `s2-onboarding-intro.png` | `179:1748` | `/onboarding` |
| `s2-onboarding-step5.png` | `179:1770` | `/onboarding/capability-items` |
| `s2-onboarding-saved.png` | `179:1809` | **완주 필요** — `e2e/support/onboarding.ts` `completeOnboardingToSaved()` |

`/onboarding/saved` 는 인증·동의·제출 이후에만 열리고(`resolveGuardDecision` 예외 ③) 세션이
메모리에만 있어 `page.goto` 로 직접 갈 수 없다. 그래서 Trial 5단계 → 가입 → 동의 → 재개 →
제출을 **같은 SPA 수명 안에서** 수행하는 도우미를 `e2e/support/onboarding.ts` 에 두었다.
`s2-onboarding-saved` 는 `QA-2-002` **수정 후 레이아웃**으로 생성했다.

**baseline 재생성 목록과 사유** — 임계값을 `0 / 0` 으로 내려 `visual` · `responsive` 전수 재비교한 뒤
차이가 난 것만 갱신했다 (이전 Step 과 같은 방식).

| 파일 | 처리 | 사유 |
|---|---|---|
| `s2-welcome.png` | 재생성 | `QA-2-002` 수정으로 legal 각주가 하단으로 이동 (`179:1722` 배치에 더 근접) |
| `s2-login.png` | 재생성 | 〃 하단 블록 이동 |
| `s2-signup.png` | 재생성 | 〃 CTA 하단 이동 (`179:1746` 에 더 근접) |
| `s2-consent.png` | 재생성 | 〃 CTA 하단 이동 |
| `s2-onboarding-intro/step5/saved.png` | **신규 3건** | `S2-HOME-2` |
| 나머지 35건 | **무변경** | 임계값 0 전수 비교에서 1px 차이도 없음 |

시각 baseline **39 → 42** (감소 0).

### 12.5 마우스 · 키보드 · 터치 3경로 증거 (실제 브라우저)

`e2e/onboarding.spec.ts` — `세 입력 경로 — 마우스 · 키보드 · 터치 (QA-2-001)`.

| 경로 | 테스트 | 결과 |
|---|---|---|
| 마우스 클릭 (덱 **안**) | 라디오 선택 → `Clear this answer` 로 해제 | 통과 |
| 마우스 클릭 (덱 **밖** 대조군) | `/onboarding/temperament` RadioGroup | 통과 |
| 마우스 끌기 | 카드 폭 25% 이상 끌기 → `2 / 10` | 통과 (제스처 유지) |
| 터치 탭 | `hasTouch` 컨텍스트에서 label tap | 통과 |
| 터치 스와이프 | CDP `Input.dispatchTouchEvent` 로 **진짜 터치 입력** | 통과 |
| 키보드 | 기존 "키보드만으로 10문항 완주" · ArrowLeft/Right · Space | 통과 (무변경) |

**이 테스트가 결함을 실제로 잡는지 확인했다**: `SwipeDeck.tsx` 를 수정 전 동작(pointerdown 캡처)
으로 되돌리면 "마우스 클릭으로 덱 안 라디오를 선택하고 다시 해제한다" 만 **FAIL** 하고
대조군·터치는 통과한다 — QA 가 보고한 현상과 정확히 일치한다.

단위(jsdom)는 리타깃을 재현하지 못하므로 **캡처 호출 시점**을 검사한다
(`packages/ui/src/deck/__tests__/SwipeDeck.test.tsx` — `포인터 캡처 시점 (QA-2-001)` 3건).

### 12.6 생성·수정 파일

| 파일 | 변경 |
|---|---|
| `packages/ui/src/deck/SwipeDeck.tsx` | `QA-2-001` 수정 (캡처 시점 변경) |
| `packages/ui/src/deck/__tests__/SwipeDeck.test.tsx` | 단위 회귀 3건 추가 |
| `apps/web/src/app/layouts/StackLayout.tsx` | `QA-2-002` 수정 (콘텐츠 래퍼 flex column) |
| `e2e/onboarding.spec.ts` | 입력 3경로 e2e 5건 추가 |
| `e2e/support/onboarding.ts` | **신규** — `/onboarding/saved` 완주 도우미 |
| `e2e/visual.spec.ts` | 온보딩 baseline 3건 추가 |
| `e2e/__screenshots__/darwin/visual.spec.ts/*.png` | 신규 3 · 재생성 4 (§12.4) |
| `docs/qa/stage-2-handoff.md` | §2 수치 갱신 · §5 `AD-S2-15`·`AD-S2-16` · §8.3 `S2-DESIGN-1` · 이 절 |

**건드리지 않은 것**: `docs/design/**` · `docs/plans/**` · `docs/decisions/**` ·
`packages/contracts` · Mock · `SwipeDeck.css` · Stage 2-B 항목 · Backend (`apps/api`·`supabase` 미생성 유지).

---

## 13. QA 수정 2회차 — `QA-2-004` 단건

지시 범위는 **`QA-2-004` 하나**다. 다른 Finding·리팩터링·기능 변경은 하지 않았다.

### 13.1 원인 — QA 가 추정한 것과 다르다

QA 리포트 §7.4.3 은 "에셋 export 방식 문제(소스 노드와 비율이 다름)" 로 보았으나,
**Figma 노드를 직접 확인한 결과 기존 두 에셋은 자기 소스 노드와 비율이 정확히 일치한다.**

| 에셋 | 소스 노드 | 노드 종류·크기 | 파일에 들어 있는 image fill 비트맵 | 배율 | 판정 |
|---|---|---|---|---|---|
| `hello-heart.png` | `179:1704` | **ellipse** 232×232 | **464×464 PNG** | 2.0x | **정상** |
| `headphones.png` | `179:1823` | **ellipse** 188×188 | **376×376 PNG** | 2.0x | **정상** |

두 소스 노드는 medallion(원형)이라 **정사각형이 정상**이고, 내려받은 비트맵이 각각 464²·376² 로
표시 크기의 정확히 2배였다. 즉 `headphones.png` 의 1.00 은 실수가 아니라 소스 그대로다.
`179:1823` 을 노드 bounds 로 다시 export 해도 **똑같은 376²** 가 나온다 — 바꿀 것이 없다.

실제 결함은 다른 데 있었다:

> `/onboarding/saved` 의 일러스트 소스 노드는 **`179:1819`** 이고, 이는 medallion 과
> **다른 노드 · 다른 비트맵**(rounded-rectangle 307×415, 캐릭터 전신)이다.
> 그런데 `CharacterIllustration` 이 이 노드를 export 하지 않고 **medallion 용
> `hello-heart`(원형 crop, 1.00)를 재사용**하고 있었다. 비율 불일치는 여기서 나왔다.

### 13.2 아트워크 bounds vs 프레임 bounds (지시 §1 요구 실측)

| 대상 | 프레임(노드) bounds | 프레임 안 캐릭터 실체 bounds | 비고 |
|---|---|---|---|
| `179:1819` | **307×415 (0.7398)** | `x 25..307` · `y 70..401` (282×331) | 상·하·좌 여백이 배경에 포함된 **rect + image fill** |
| `179:1704` | 232×232 (1.00) | 원형 마스크 전체 | medallion — 정사각형이 정상 |
| `179:1823` | 188×188 (1.00) | 원형 마스크 전체 | medallion — 정사각형이 정상 |

`179:1819` 는 여백을 포함한 프레임이지만 **재 export 로 1.00 이 나오지 않는다** — 노드 bounds 자체가
0.7398 이므로 지시 §2 경로대로 진행했다. 억지 크롭은 하지 않았다.

### 13.3 재 export 한 에셋

| 항목 | 값 |
|---|---|
| 파일 | `apps/web/src/shared/assets/character/hello-heart-full.png` (**신규**) |
| 소스 | Figma `179:1819` 를 **노드 bounds 그대로** 렌더 |
| 크기 | **307×415** · 비율 **0.7398** (Figma와 동일) |
| 용량 | 108.6 kB |
| 검증 | 배치 후 화면에서 측정한 캐릭터 실체 bounds 가 Figma 노드 렌더와 **동일**(`y 70..401`) |

**기존 두 에셋은 건드리지 않았다** (§13.1 — 정상이므로).

#### 해상도 — 2배 래스터 정책을 지킬 수 없다 (`NEEDS_DECISION`)

`179:1819` 의 image fill 비트맵을 받아보면 **294×373 JPEG (8.3 kB)** 로,
**표시 크기(307×415)보다도 작다(≒0.96x)**. 검증:

- 그 294×373 비트맵을 `object-cover` 로 307×415 에 맞춘 결과와 Figma 노드 렌더의
  픽셀 차이 **평균 0.68 / p99 5** → 렌더가 곧 그 비트맵이며 **더 높은 원본이 파일에 없다.**
- 선명도(라플라시안 분산): `179:1819` 렌더 **75** vs `hello-heart` 를 같은 307 폭으로 줄인 것 **821**.
  같은 표시 크기에서 약 **11배 낮은 정보량**이다.

따라서 614×830 은 **없는 정보를 지어내는 업스케일**이 되므로 만들지 않았고, 노드 bounds인
**307×415 (1.0x)** 로 넣었다. 비율(= `QA-2-004` 의 Finding)은 해소되지만 **retina 에서 이전보다
부드럽게(덜 선명하게) 보인다.** 이 트레이드오프는 내가 결정할 사항이 아니다 → §13.7.

### 13.4 캐릭터↔제목 여백 실측 (교체 전/후, Figma 대비)

측정 조건: 393×852, safe-area `top 56 / bottom 44` 주입(QA 2회차와 동일), Playwright 실측.
"캐릭터 실체" 는 배경색 대비 임계 40 으로 잡은 캐릭터 몸체 bounds다.

| 항목 | Figma `179:1809` | 교체 **전** | 교체 **후** |
|---|---|---|---|
| 일러스트 박스 | `y 163..578` · **307×415** | `y 80..387` · **307×307** ❌ | `y 80..495` · **307×415** ✅ |
| 캐릭터 실체 하단 | `y 564` | `y 387` | `y 481` |
| 제목 상단 | `y 615` | `y 664` | `y 664` |
| **캐릭터↔제목 여백** | **51px** | **277px** | **183px** |
| Δ vs Figma | — | **+226** | **+132** (−42%) |
| CTA | `y 750..808` | `y 752..808` | `y 752..808` (무변경) |

**박스 크기·비율은 Figma와 정확히 일치하게 되었다.** 남은 132px 은 **에셋 문제가 아니다** —
박스 **상단 위치**가 Figma `y 163` vs 구현 `y 80` 으로 83px 차이나기 때문이다:

| | 상태바 아래 ~ 일러스트 | 일러스트 ~ 제목 | 제목 ~ CTA |
|---|---|---|---|
| Figma `179:1809` | **107px** | 37px (박스 기준) | 69px |
| Design Spec §2.11 구현 | `pt-6` = **24px** | `(flex spacer)` 전량 = 169px | `--space-8` = 32px |

즉 Figma 는 **여백을 일러스트 위에** 두는데 §2.11 은 `(flex spacer)` 를 **일러스트와 제목 사이에**
둔다. 이건 에셋이 아니라 **Design Spec §2.11 의 여백 분배 규칙** 문제이고,
지시대로 **CSS 로 억지 보정하지 않았으며 Design Spec 도 수정하지 않았다** → §13.7 `S2-DESIGN-2`.

### 13.5 baseline 재생성 — 1건

지시대로 **임계값 `0 / 0`** 으로 전체 e2e 를 전수 재비교했다 (`playwright.strict.config.ts` 임시 생성 후 삭제).

```
121 tests → 120 passed (1px 차이도 없음) / 1 failed
  └ s2-onboarding-saved.png — 33,108 px (0.12) 차이
```

| 파일 | 처리 | 사유 |
|---|---|---|
| `s2-onboarding-saved.png` | **재생성** | 이 화면만 에셋이 바뀌었다 (일러스트 307² → 307×415) |
| 나머지 **41건** | **무변경** | 임계값 0 전수 비교에서 차이 0. medallion 화면(`s2-welcome`·`s2-signup`·`s2-login`·`s2-onboarding-intro`·`s2-onboarding-step5`)은 `hello-heart`·`headphones` 를 그대로 쓰므로 영향 없음 |

시각 baseline **42건 유지** (증감 0).

### 13.6 검증 명령 결과 (2회차 수정 후 전량 재실행)

| # | 명령 | 결과 | 기준 대비 |
|---|---|---|---|
| 1 | `pnpm typecheck` | OK — root + e2e + 5 패키지 | 동일 |
| 2 | `pnpm lint` | OK — 위반 0 | 동일 |
| 3 | `pnpm lint:boundaries` | OK — **no dependency violations (449 modules, 1479 dependencies)** | 448→449 (에셋 모듈 1) |
| 4 | `pnpm test` | OK — **Test Files 98 / Tests 1000 passed** | **동일 (감소 0)** |
| 5 | `pnpm build` | OK — `index-uKDboqOx.js` 505.96 kB, `hello-heart-full-rEkainj_.png` 108.60 kB | 동일 |
| 6 | `pnpm format:check` | OK — All matched files use Prettier code style | 동일 |
| 7 | `pnpm test:e2e` | OK — **121 passed** | **동일 (감소 0)** |
| 8 | 임계값 0 전수 재비교 | 120 passed / 1 failed (§13.5) | — |

`apps/api/` · `supabase/` 미생성 확인 (`ls` — No such file or directory).

### 13.7 발견한 문제 — 결정 필요

| ID | 내용 | 성격 | 소관 |
|---|---|---|---|
| **`S2-ASSET-1`** | `179:1819` 의 image fill 이 **294×373 JPEG** 로 표시 크기보다 작아 **2배 래스터 불가**. 현재 1.0x(307×415)로 넣었고 retina 에서 이전보다 덜 선명하다. 선택지 ① 현 상태 수용(비율 정확·선명도 하락) ② 디자이너에게 `179:1819` 용 고해상도 원본 재제공 요청 ③ 비율을 포기하고 medallion 에셋 유지 | **NEEDS_DECISION** | 사용자 / 디자이너 |
| **`S2-DESIGN-2`** | 에셋 교체 후에도 캐릭터↔제목 여백 **183px vs Figma 51px**. 원인은 Design Spec §2.11 의 여백 분배(`pt-6` + 중앙 `(flex spacer)`)가 Figma(상단 107px · 중앙 37px)와 다른 것. **development-agent 는 §2.11 을 수정하지 않는다** | **Non-blocking** (`AC-2-56` 잔여) | design-agent (`S2-DESIGN-1` 과 함께) |

`QA-2-004` 는 **에셋 비율 부분만 해소**되었다 (307²→307×415, Figma와 동일).
여백 잔여분은 위 `S2-DESIGN-2` 에 달려 있으므로 **내가 PASS 를 선언하지 않는다.**

### 13.8 생성·수정 파일 (2회차)

| 파일 | 변경 |
|---|---|
| `apps/web/src/shared/assets/character/hello-heart-full.png` | **신규** — Figma `179:1819` 노드 bounds export (307×415) |
| `apps/web/src/shared/assets/character/index.ts` | `hello-heart-full` 등록 + 세 에셋의 소스 노드·배율 근거 주석 |
| `apps/web/src/features/onboarding-survey/ui/OnboardingSaved.tsx` | `asset="hello-heart"` → `asset="hello-heart-full"` (1줄) |
| `e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-saved.png` | 재생성 (§13.5) |
| `docs/qa/stage-2-handoff.md` | 이 절 |

**건드리지 않은 것**: `hello-heart.png` · `headphones.png` (정상) · `character.css` ·
`CharacterIllustration.tsx` · `CharacterMedallion.tsx` · `docs/design/**` · `docs/plans/**` ·
`docs/decisions/**` · `packages/contracts` · Mock · 다른 baseline 41건 ·
Stage 2-B · Stage 3 이상 · Backend (`apps/api`·`supabase` 미생성 유지).

---

## 14. QA 수정 2회차 (계속) — `QA-2-004` 잔여 2건

지시 범위는 **A(Figma `221:1147` 확인·적용)** 와 **B(`S2-DESIGN-2` — Design Spec §2.11 새 여백
규칙 구현)** 뿐이다. 다른 Finding·리팩터링·기능 변경은 하지 않았다.

### 14.1 A — Figma `221:1147` 확인 결과: **해상도 제약 해소됨, 적용 완료**

`221:1147` 은 화면이 아니라 캐릭터 원본을 모아 둔 **section "Chracter"** (7875×2861) 다.

| 자식 노드 | 이름 | 노드 크기 | 내용 |
|---|---|---|---|
| **`163:2529`** | `Haru_Hello_Heart_t 1` | 1537×1830 | **`/onboarding/saved` 와 같은 아트워크** ← 사용 |
| `163:2530` | `HARU_Hello_t 1` | 1597×1830 | 헤드폰 포즈 |
| `163:2536` · `163:2542` | 안경 쓴 책벌레 … | 1550×1830 · 1573×2094 | 다른 포즈 |
| `163:2532` · `163:2528` | `asset/home-character` · `asset/avatar-medallion` | 517×788 · 204×245 | 기존 에셋 |

**`163:2529` 의 image fill 은 941×1672 투명 PNG (1.13 MB)** 이고 캐릭터 실체는 **847×997 px** 다.
이전 회차의 제약(`179:1819` 의 fill 이 294×373 JPEG)은 **이 노드에서 해소된다.**

| 검증 | 결과 |
|---|---|
| 같은 아트워크인가 | 캐릭터 실체 비율 **0.8496**(새 원본) vs **0.8489**(`179:1819` JPEG) — 동일 |
| 정렬 적합 | 새 원본을 JPEG 프레이밍에 맞춰 최적 정합(scale 0.312) 시 **RMSE 7.65/채널** — 잔차는 JPEG 압축 노이즈와 컷아웃 경계뿐 (포즈·구도·조명 동일) |
| 2배 래스터 가능한가 | 표시 307×415 → 필요 614×830. 대응 원본 영역이 **884×1195 px** 이므로 **다운샘플**이다 (업스케일 아님) |

#### 적용 방식

`179:1819` 의 **프레이밍(object-cover 307×415)** 을 그대로 유지한 채 새 원본을 **614×830 = 정확히
2.0x** 로 다운샘플했다. 매핑은 실측 정합에서 나온 값만 썼다 (알파 premultiply → LANCZOS → unpremultiply).

| 항목 | 교체 전 | 교체 후 |
|---|---|---|
| 파일 | `hello-heart-full.png` 307×415 RGB (108.6 kB) | **같은 경로·같은 파일명** 614×830 **RGBA** (570.7 kB) |
| 배율 | 1.0x | **2.0x** |
| 배경 | JPEG 에 구워진 세로 그라데이션 **사각형** | **투명** — 캐릭터가 `AppBackground` 위에 바로 얹힘 |
| 기하 | — | **동일** (캐릭터 bounds 를 원본 JPEG 에 맞춰 정렬) |

**기존 파일 처리 = 교체(병존 아님).** 같은 노드·같은 아트워크의 상위 호환이라 두 벌을 둘 이유가
없고, import 경로(`CHARACTER_ASSETS['hello-heart-full']`)도 그대로다. `hello-heart.png` ·
`headphones.png` 는 건드리지 않았다 (§13.1 — 정상).

**시각적 부수 효과 1건**: 구워져 있던 배경 사각형이 사라진다. Figma `179:1809` 에서도 그 사각형은
프레임 배경과 거의 같은 색이라 보이지 않는 것이 의도된 모습이므로 **Figma 에 더 가까워진다**.

### 14.2 B — Design Spec §2.11 여백 규칙 구현

```
[safe-top]
 spacer A   flex: 3 1 0 · min-block-size: --space-6 (24)
 CharacterIllustration
 (margin-block-start: --space-8)
 제목
 spacer B   flex: 2 1 0 · min-block-size: --space-8 (32)
 CTA
[safe-bottom]
```

- 여백을 **일러스트 위 : 제목 아래 = 3 : 2** 로 분배한다. `flex-grow` 는 단위 없는 비율이고,
  고정 값은 전부 기존 semantic token (`--space-6` · `--space-8`) 이다 — **신규 토큰 0건**
  (`--space-7` · `--space-10` 을 정의하지 않았다).
- **고정 높이 0건.** 제목·CTA 는 `flex: none` 이라 어느 단계에서도 줄지 않는다.
- 축소 순서 ②(일러스트 비율 유지 축소)는 `character.css` 에 구현했다 —
  `flex: 0 1 auto` + `min-block-size: 0` + 이미지 `max-block-size: 100%` + `object-fit: contain`.

### 14.3 실측 (Playwright · 393×852 · safe-area `top 56 / bottom 44` 주입)

| 항목 | Figma `179:1809` | 명세 §2.11 검산 기준 | **구현 실측** | Δ vs 검산 |
|---|---|---|---|---|
| 일러스트 top | 163 | ≈166 | **171.8** | **+5.8** |
| 일러스트 박스 | 307×415 | 307×415 | **307×415** | 0 |
| 제목 top | 615 | ≈613 | **618.8** | **+5.8** |
| CTA top | 750 | ≈752 | **752.0** | **0** |
| CTA bottom | 808 | 808 | **808** | **0** |
| spacer A : B | 107 : 69 (1.55) | 3 : 2 | **115.8 : 77.2 = 1.500** | **규칙 정확** |

**Δ +5.8 의 원인은 여백 규칙이 아니라 제목 높이다.** 명세 검산은 Figma 실측 **제목 66**
(line-height 33 × 2행)을 썼는데, 구현의 `title-2` 토큰은 **22 / 28** 이라 2행이 **56** 이다.
차이 10px 이 3 : 2 로 분배되어 위쪽에 +6 이 간다. 여백을 CSS 로 억지 보정하지 않았다 → §14.6.

#### 좁은 폭 · 텍스트 확대

토큰이 px 라서 `html { font-size: 200% }` 는 이 화면에 효과가 없다. **타이포 primitive
(`--haru-type-*-size/line`) 를 전부 2배로 주입**해 실제 200% 확대를 재현했다.

| 조건 | spacer A | 일러스트 | 제목 | CTA | 결과 |
|---|---|---|---|---|---|
| 393×852 기준 | 115.8 | 307×415 | 56 (2행) | `752..808` | 스크롤 없음 |
| **393×852 + 200%** | 48.59 | 307×415 | **168 (3행)** | `752..808` | spacer 가 전부 흡수 · **스크롤 없음 · 잘림 없음** |
| **320×568** | **24 (최소)** | 272×367.67 | 56 | `567.67..623.67` | spacer 최소 도달 → **앱 컬럼 스크롤**(668 / 568) · 잘림 없음 · 가로 overflow 0 |
| **320×568 + 200%** | **24 (최소)** | 272×367.67 | **224 (4행)** | `735.67..791.67` | 〃 (836 / 568) · **제목·CTA 온전** · 가로 overflow 0 |
| 320×400 + 200% (극단) | **24 (최소)** | 272×367.67 | 224 | `735.67..791.67` | 〃 (836 / 400) · 잘림 없음 |

모든 조건에서 **제목·CTA 가 잘리지 않고 CTA 가 스크롤 컨테이너 안에 남아 도달 가능**하다.

### 14.4 baseline 재생성 — 1건

지시대로 **임계값 `0 / 0`** (`VISUAL_MAX_DIFF_*` 를 임시로 0 으로 바꾼 뒤 원복) 으로 전수 재비교했다.

```
121 tests → 120 passed (1px 차이도 없음) / 1 failed
  └ s2-onboarding-saved.png — 49,344 px (0.17) 차이
```

| 파일 | 처리 | 사유 |
|---|---|---|
| `s2-onboarding-saved.png` | **재생성** | 이 화면만 바뀌었다 (세로 배치 + 에셋 2x·투명 배경) |
| 나머지 **41건** | **무변경** | 임계값 0 전수 비교에서 차이 0 |

시각 baseline **42건 유지** (증감 0). `playwright.config.ts` 는 원본으로 되돌렸다 (0.002 / 200 / 20).

### 14.5 검증 명령 결과 (전량 재실행)

| # | 명령 | 결과 | 기준 대비 |
|---|---|---|---|
| 1 | `pnpm typecheck` | OK — root + e2e + 5 패키지 | 동일 |
| 2 | `pnpm lint` | OK — 위반 0 | 동일 |
| 3 | `pnpm lint:boundaries` | OK — no dependency violations (449 modules, 1479 dependencies) | 동일 |
| 4 | `pnpm test` | OK — **Test Files 98 / Tests 1000 passed** | **동일 (감소 0)** |
| 5 | `pnpm build` | OK — `hello-heart-full-BlZAhjFv.png` 570.74 kB | 에셋 용량만 증가 |
| 6 | `pnpm format:check` | OK | 동일 |
| 7 | `pnpm test:e2e` | OK — **121 passed** | **동일 (감소 0)** |
| 8 | 임계값 0 전수 재비교 | 120 passed / 1 failed (§14.4) | — |
| 9 | 393×852 · 320 · 200% 실측 | §14.3 | — |

`apps/api/` · `supabase/` 미생성 확인 (`ls` — No such file or directory).

### 14.6 발견한 문제

| ID | 내용 | 성격 | 소관 |
|---|---|---|---|
| **`S2-ASSET-1`** | **해소.** `221:1147 / 163:2529` 의 941×1672 투명 원본으로 2.0x(614×830) 적용 | — | — |
| **`S2-DESIGN-3`** | 명세 §2.11 검산 기준(일러스트 top ≈166 · 제목 top ≈613)과 구현이 **+5.8px** 어긋난다. 규칙(3 : 2)은 정확히 구현되었고 원인은 **제목 높이 56(토큰 `title-2` 22/28) vs 66(Figma line-height 33)** 이다. 이는 §2.11 이 만든 차이가 아니라 **기존 타이포 토큰과 Figma 의 line-height 차이**다. 선택지 ① 허용 차이로 등록 ② `title-2` line-height 재검토 | **NEEDS_DECISION** | design-agent / 사용자 |
| **`S2-LAYOUT-1`** | §2.11 축소 순서 ②(일러스트 비율 유지 축소)의 CSS 는 넣었지만 **현재 AppShell 에서는 발동하지 않는다**. `AppColumn` 이 grid 로 **콘텐츠 높이만큼 늘어나는** 구조라 세로 flex 컨테이너에 음수 여유 공간이 생기지 않기 때문이다 → ① spacer 최소값 다음 바로 ③ **스크롤**로 간다. 사용자 요구(제목·CTA 잘림 없음 · CTA 도달 가능)는 모두 충족한다. ②를 실제로 발동시키려면 AppShell 높이 체인 변경이 필요해 **이번 범위 밖**이다 | **Non-blocking** | design-agent / 사용자 |
| `S2-VISUAL-1` (참고) | 일러스트 가로 위치: Figma `x 52`(우측 34) vs 구현 `x 43`(가운데 정렬). Design Spec §5.2 의 `margin-inline: auto` 규칙에 따른 **기존 동작**이며 이번 변경과 무관하다 | 참고 | — |

`QA-2-004` 의 에셋·여백 두 부분을 모두 처리했으나 **내가 PASS 를 선언하지 않는다** — 재검증은
stage-qa-agent 소관이다.

### 14.7 생성·수정 파일 (2회차 계속)

| 파일 | 변경 |
|---|---|
| `apps/web/src/shared/assets/character/hello-heart-full.png` | **교체** — `163:2529` 원본 → 614×830 RGBA (2.0x, 투명 배경) |
| `apps/web/src/shared/assets/character/index.ts` | 배율표 2.0x 갱신 + 출처·근거 주석 |
| `apps/web/src/entities/character/character.css` | `CharacterIllustration` 축소 규칙 (`flex: 0 1 auto` · `min-block-size: 0` · `max-block-size: 100%`) |
| `apps/web/src/features/onboarding-survey/onboarding.css` | `.haru-saved*` — spacer A/B 3 : 2 · 제목 `--space-8` · 제목·CTA `flex: none` |
| `apps/web/src/features/onboarding-survey/ui/OnboardingSaved.tsx` | §2.11 구조로 재배치 (spacer A → 일러스트 → 제목 → spacer B → CTA) |
| `e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-saved.png` | 재생성 (§14.4) |
| `docs/qa/stage-2-handoff.md` | 이 절 |

**건드리지 않은 것**: `hello-heart.png` · `headphones.png` · `CharacterMedallion` · 다른 화면의
여백(§2.1 · §2.8 등) · `playwright.config.ts`(임시 변경 후 원복) · `docs/design/**` ·
`docs/plans/**` · `docs/decisions/**` · `packages/contracts` · Mock · 다른 baseline 41건 ·
Stage 2-B · Stage 3 이상 · Backend (`apps/api`·`supabase` 미생성 유지).

---

## 14.8 `S2-ONB-1` 정식 명세 반영 (3회차, 2026-09-28) — Design Spec §2.9 · §14-12

design-agent 가 §2.9 "필수 응답과 CTA 차단" 을 신설하며 요구한 **구현 변경 3건만** 반영했다.
전부 copy·ARIA 이며 값·레이아웃·토큰은 건드리지 않았다.

| # | 변경 | 근거 |
|---|---|---|
| ① | `wizard.requiredBlockedReason` 를 **계수 함수**로 교체. 1건 = `Answer the question above to continue.` / 2건 이상 = `Answer the {n} questions above to continue.` 개수는 화면이 세지 않고 contracts `unansweredRequiredQuestions(instrument, answers, step)` 결과 길이(`wizard.missingRequired.length`)에서 온다 | §2.9 정식 문구 |
| ② | 필수 단일선택 문항의 `RadioGroup` 에 `aria-required="true"`. 필수 목록을 화면에 적지 않고 instrument 의 `required` 값만 읽으므로 Step 2 의 2개 그룹에만 붙는다 | §2.9 표식 생략의 대가 |
| ③ | Step 4 Q2 보조 문구 `Pick up to two. This is about what you want to lean into, not a score.` → **`Pick at least one, up to two.`** (contracts `maxSelections: 2` + 최소 1개 필수와 일치) | §2.10 Step 4 |

`aria-required` 는 `role="group"`(fieldset 기본값) 에서 허용되지 않고 `radiogroup` 에서만
유효하므로, `RadioGroup` 에 `required` prop 을 추가해 **`required` 일 때만** `role="radiogroup"`
+ `aria-required="true"` 를 둔다. `required` 를 주지 않는 기존 사용처(Step 1 · Step 5 · UI
gallery)는 role 이 그대로 `group` 이라 동작·테스트가 바뀌지 않는다. **시각 변화 없음** —
`required` 시각 슬롯은 만들지 않았다 (§2.9 "하지 않는 것").

**하지 않은 것**: 문항별 Required/Optional 배지·별표, 차단 문구 `aria-live` 화, 차단 문구 자리
상시 예약, 오류 톤(`field-fg-error`·`InlineAlert`) 적용, 필수/선택 규칙 변경, Step 3
`books.topic_tags` 의 `Pick up to two.`(전부 선택인 단계라 그대로), `docs/design/**` ·
`docs/plans/**` · `docs/decisions/**` 수정, Stage 2-B · Stage 3 · Backend.

### 생성·수정 파일

| 파일 | 변경 |
|---|---|
| `apps/web/src/features/onboarding-survey/copy.ts` | `requiredBlockedReason` 계수 함수화 · `goals.growth_goals.description` 교체 |
| `apps/web/src/features/onboarding-survey/ui/OnboardingWizard.tsx` | `requiredBlockedReason(wizard.missingRequired.length)` |
| `apps/web/src/features/onboarding-survey/ui/ChoiceQuestionList.tsx` | `RadioGroup required={question.required}` |
| `packages/ui/src/field/RadioGroup.tsx` | `required` prop → `role="radiogroup"` + `aria-required` |
| `apps/web/__tests__/onboarding-screens.test.tsx` | 계수 문구 단수/복수 전환 · Step 2 `aria-required` · Step 4 미적용 테스트 (+2건) |
| `e2e/onboarding.spec.ts` | 차단 문구 문자열 갱신 |

### 검증

`pnpm typecheck` PASS · `lint` PASS · `test` **1029 / 98파일** PASS (1027 → +2 신규) ·
`lint:boundaries` PASS(450 modules, 위반 0) · `build` PASS · `format:check` PASS ·
`test:e2e` **124 passed**. 시각 baseline **재생성 0건** — `playwright.config.ts` 임계값을
일시적으로 0(`maxDiffPixelRatio` · `maxDiffPixels` · 영역 상한)으로 낮춰 `visual.spec.ts` 41건을
전수 재비교했고 **전부 픽셀 동일**이었다 (설정은 원복, `git diff` 비어 있음). design-agent 의
"copy·ARIA 라 baseline 영향 없음" 예상과 일치한다.

### 남긴 관찰 (Non-blocking — design-agent 판단 대상)

| # | 내용 |
|---|---|
| `S2-ONB-1-a` | 교체로 사라진 문장 `This is about what you want to lean into, not a score.` 는 **비채점 톤**(rules/frontend §8)을 담고 있었다. §2.10 Step 4 블록이 한 줄만 규정해 그대로 따랐으나, 그 톤을 다른 위치(예: 단계 제목 아래)에 살릴지는 design-agent 결정 사항이다 |
| `S2-ONB-1-b` | §2.10 Step 2·4 블록은 보조 설명을 **질문 바로 아래 · `--text-subheadline`** 으로 그리지만, 구현(`ChoiceQuestionList`)은 **컨트롤 아래 · `--text-caption-1`** 이다. 이번 개정 이전부터의 차이라 손대지 않았다 |
