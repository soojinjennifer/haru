# HARU Authentication · Authorization Requirements (Backend Handoff)

Status: **COMPLETE (development-agent `S8-J`, 2026-11-21)** — 초안(plan-agent 2026-11-20)에 `D8-1` 결정(`N8-02` ⓐ · `N8-06` ⓑ · `N8-09` ⓐ · `N8-10` ⓐ · `Q8-10` ⓐ) · `D8-2` · 구현된 `AuthGateway` 시그니처 · Mock 위치를 반영했다. 검증 = stage-qa-agent.

> 이 저장소에는 실제 인증이 없다. Frontend 는 `AuthGateway` interface + `MockAuthGateway` 로 동작하며 Supabase JS Client 를 쓰지 않았다 (Stage 0 #27). `http` 모드 빌드에는 실제 인증 Adapter 가 없고 `createUnavailableAuthGateway()` 가 `PROVIDER_UNAVAILABLE` 을 던진다 — 동작하는 것처럼 보이지 않게 하기 위함 (`OAQ-19`: 실제 Adapter 추가 시점). 아래는 Backend · Auth 연동 시 충족할 요구다.

## 1. 계정 모델

- 계정 소유자 = **보호자(Caregiver)**. 아이는 로그인 계정이 없다. MVP Child Profile 1명 (`P2-BIP-10`, `CHILD_LIMIT_REACHED`).
- 가입 경로: Email · Google · Apple (FR-01, C-5). 모든 경로는 가입 직후 **같은 동의 화면**(`/auth/consent`)을 거친다 (C-2).
- Trial = 기기 로컬 draft 만 — 익명 계정 없음 (C-12). 서버는 가입 + 동의 이후의 `submit` 만 받는다. 미가입 기기 draft 삭제는 기기 안에서 끝난다(서버 요청 0 — Stage 8 `/onboarding/start` · Step 1 TextLink).
- 보호자 이메일(`C8-10`, `P8-BIP-09`): `GET /v1/me` · `PATCH /v1/me` 응답의 `caregiver.email` (`MeResponseSchema` — `z.email()` **필수**) = 인증 계정의 로그인 이메일 (OAuth 포함 — Apple 비공개 릴레이 주소면 그 주소 그대로). **읽기 전용** — `UpdateCaregiverRequestSchema` 에 없다(섞여 와도 parse 결과에서 빠진다). 계정 화면(`/settings/account`) 표시 전용. 로그 · 에러 리포트에 원문 금지.

## 2. `AuthGateway` 계약 (Frontend interface — 실제 Adapter 가 구현할 대상)

정의: `apps/web/src/shared/auth/AuthGateway.ts` · 세션 schema `packages/contracts/src/auth/session.ts` · Mock `apps/web/src/mocks/auth/MockAuthGateway.ts` (group `auth`).

| 메서드 (9) | 의미 | 사용 화면 |
|---|---|---|
| `getSession(): Promise<AuthSession \| null>` | 현재 세션 | 부팅 · Guard |
| `onChange(listener): Unsubscribe` | 세션 변화 구독 | `shared/auth/context.tsx` |
| `signUpWithEmail(input): Promise<AuthResult>` | 이메일 가입 | `/auth/sign-up` |
| `signInWithEmail(input): Promise<AuthResult>` | 이메일 로그인 | `/auth/log-in` |
| `signInWithProvider(provider: 'google' \| 'apple'): Promise<AuthResult>` | OAuth — **사용자 취소 = 오류가 아니라 `{ session: null }` 성공** | `/auth/welcome` · sign-up · log-in |
| `requestPasswordReset(input): Promise<void>` | 재설정 메일 — 계정 존재 여부와 무관하게 같은 응답 | `/auth/forgot-password` |
| `updatePassword(input): Promise<void>` | 링크 토큰(`?token=`)으로 새 비밀번호 — 만료 = `AUTH_TOKEN_EXPIRED` | `/auth/reset-password` |
| `refreshSession(): Promise<AuthSession \| null>` | 토큰 갱신 | `withAuthRefresh` |
| `signOut(): Promise<void>` | 로그아웃 | 설정 · 탈퇴 완료 · refresh 실패 |

| 항목 | 요구 | ID |
|---|---|---|
| 세션 | `AuthSession{ userId, accessToken, refreshToken?, expiresAt, provider: 'email'\|'google'\|'apple' }` · 요청에 `Authorization: Bearer <accessToken>` | P2-BIP-01 |
| 만료 | `AUTH_TOKEN_EXPIRED` → 클라이언트가 **1회** refresh 후 **1회** 재시도, 재실패면 sign-out (`shared/auth/withAuthRefresh.ts`) | P2-BIP-01 |
| 재설정 | 계정 존재 여부 비노출 · 링크 토큰 · 만료 | P2-BIP-02 |
| OAuth | 리디렉트 또는 네이티브 `signInWithIdToken` + nonce (네이티브는 후속 `S4N-*`) · 취소 = `{session: null}` | P2-BIP-12 (A) |
| 로그아웃 | 서버 측 refresh token 폐기. Frontend 는 성공 여부와 무관하게 로컬 정리(`performSessionCleanup` — draft · 카드 캐시 · 로컬 녹음 · Outbox · Query 캐시 · 삭제 요청 표시) | P2-BIP-15 (A) |
| push 기기 | 로그아웃 시 Frontend 는 `DELETE /v1/push-devices/:id` 를 부르지 않는다 — 계정 전환 시 기기 정리 정책은 서버 결정 | RU-20 |

## 3. 로그인 복귀 경로 (`P8-BIP-05`)

- 보호된 deep link(예 `/progress/reports/:reportId` — `report_published` 알림)를 미인증 상태로 열면 Guard 가 `/auth/welcome` 으로 보내고, 가려던 경로를 **메모리에만** 기억해 로그인 후 그 경로로 보낸다 (`apps/web/src/shared/lib/return-path.ts` `createReturnPathStore`).
- ⚠️ **실제 OAuth 처럼 전체 페이지를 떠나는 로그인은 이 값을 잃는다.** Backend · Auth 연동 시 `redirect_to`(또는 state)로 복귀 경로를 보존해야 한다.
- 서버가 허용할 복귀 경로 = Frontend `toSafeReturnPath()` 와 같은 규칙: 문자열 · 비어 있지 않음 · `/` 로 시작 · `//` · `/\` 로 시작 금지 · 제어 문자 · 공백 · 역슬래시 금지 · 같은 출처로 해석 · `/auth` · `/auth/*` 제외 → 그 밖이면 복귀 없이 Home. Open redirect 금지.
- 복귀 경로를 로그 · 에러 리포트에 남기지 않는다.

## 4. `GET /v1/me` — Guard 판정 입력 (`P2-BIP-01a`)

Route Guard 판정은 `MeResponse` **하나**로 끝난다 (`apps/web/src/app/guards/resolveGuardDecision.ts`). Mock: `apps/web/src/mocks/me/MockMeApi.ts` (group `me`).

| 필드 | 용도 | Mock key |
|---|---|---|
| `consentStatus.missing` | 비어 있지 않으면 `/auth/consent` | `me:consent-missing` · `consent-version-outdated` |
| `parentVerification.status` | VPC 슬롯 4값 (`not_required` · `pending` · `verified` · `failed`) — 방식은 법무 L-01 (`P2-BIP-05`), 검증 endpoint · payload 는 **정의하지 않았다** | `me:vpc-pending` · `vpc-failed` |
| `onboardingStatus` | 미완료면 온보딩 · 세션 endpoint 가 `ONBOARDING_INCOMPLETE` 를 낼 때 이 값도 `completed` 가 아니어야 한다 (`P4B-BIP-08`) · **전체 데이터 삭제 완료 후 미완료로 돌아가야** Guard 가 온보딩으로 보낸다 (`N8-10` ⓐ) | `me:onboarding-incomplete` |
| `caregiver.email` | 계정 화면 표시 (`C8-10`) | 모든 `Me` fixture 에 가상 주소(`sam@example.com` 등) |
| `child?{id, firstName}` | 화면의 childId 출처 | — |

`PATCH /v1/me` 는 보호자 `displayName` · `relationship` · `timezone` 만 — 아동 데이터 혼입 금지 (`P2-BIP-14 (A)`, D-16). 서버는 `timezone` 을 신뢰 · 저장해 카드 날짜(`P3-BIP-01`) · 주 경계(`P7-BIP-01`) 계산에 쓴다.

## 5. 동의 (Consent) 강제

| 지점 | 요구 | ID |
|---|---|---|
| 아동 데이터 쓰기 | 필수 동의 기록 전 `children` · `onboarding_responses` 쓰기 거부 → `CONSENT_REQUIRED` (`details.missing`) — `GET/PUT /v1/onboarding*` · `POST …/submit` 전부. 가입~동의 사이 로컬 아동 데이터가 `submit` 1회로 오므로 그 요청에서 동의 존재를 확인 | P2-BIP-03 · P2-BIP-17 |
| 녹음 시작 · 재개 (`to=recording`) · 업로드 init/complete · 분석 요청 | `child_voice_data` 동의 서버 강제 · 녹음 row 에 `consent_event_id` 고정 | P4-BIP-02 · RU-11 · P5-BIP-15 |
| 설문 재응답 | 동의 강제 | P6-BIP-07 |
| 이력 | `consent_events` append-only · `action='granted'` 만 · 문서 버전 · `current_consents` view · `GET /v1/consent-documents/current` 가 `required` · `version` 을 반드시 내림 | P2-BIP-04 |
| 기록 출처 | `RecordConsentsRequest.source` (`ConsentSource` = `signup_email` · `signup_oauth` · `settings` · `reconsent`). **Frontend 는 OAuth 가입이면 `signup_oauth` 를 보낸다** (`features/consent/model/consentSelection.ts` `consentSourceFor()` — 커밋 `20f6a26`, Stage 8 AC-8-45). 서버는 이 값을 그대로 기록하고, 가능하면 인증 provider 와 대조한다 | HX-2-02 · AC-8-45 |
| 문서 본문 | `ConsentDocument.url` 은 공개 접근 가능한 절대 URL — 현재 placeholder(`shared/config/legal-links.ts`, `https://haru.invalid/legal/*--placeholder`) · **출시 전 차단** (L-02) | HX-2-01 |
| 철회 | **MVP 제외** (C-4) — contract · 화면 없음. COPPA 관계 = 법무 L-03 | — |
| 동의 이력 조회 (선택) | `GET /v1/consents` → `ConsentHistory{ items: { type, documentId, documentTitle, documentVersion, action:'granted', occurredAt }[] }` — **Frontend 미구현 (`N8-06` ⓑ, C-19)**. contract 는 `API_CONTRACTS.md` §3.13 문서 전용 · `packages/contracts` · API Client · Mock 0 | P8-BIP-08 |

## 6. Authorization (소유권)

- 모든 endpoint: JWT 의 caregiver → `children.caregiver_id` → session / recording / report / clip / deletion request 소유 확인. 존재 노출 방지를 위해 비소유는 404(`RESOURCE_NOT_FOUND` · `CHILD_NOT_FOUND`)로 대체 가능 — Frontend 는 `FORBIDDEN` 과 404 를 같은 표면으로 처리한다.
- 대상 ID: P5-BIP-15 · P6-BIP-09 · P7-BIP-13 (전 endpoint).
- RLS 는 2차 방어선 (`DATA_REQUIREMENTS.md` §3).
- `PATCH /v1/children/:childId` 서버 규칙: 소유권 · 서버 시계 기준 나이(3~9세) 재검증 · `relationship` 거부 (Stage 6 `H6-1.7`).

## 7. 탈퇴 · 삭제와 계정 상태 (Stage 8 — 결정 `D8-1`)

| 항목 | 요구 | ID / 결정 |
|---|---|---|
| 탈퇴 `DELETE /v1/me` (IK) | `DeleteAccountRequestSchema{ confirmation: true }` (`.strict()`) → `DeletionRequest(scope='account')`. **계정 + 전체 데이터 삭제** · 토큰 폐기 · auth user 삭제 · 법정 보관분(`consent_events` · `audit_logs`) 가명화(보관 기간 = 법무 L-05) | P8-BIP-03 · `N8-02` ⓐ |
| 전체 데이터 삭제 `POST /v1/data-deletion-requests` (IK) | `CreateDeletionRequestSchema{ scope:'all_data', confirmation: true }` (`.strict()`) — **계정 유지** · 아동 데이터 삭제 · 완료 후 `me.onboardingStatus` 미완료 | P8-BIP-02 · `N8-10` ⓐ |
| 삭제 진행 중 | 계정 `deletion_pending` — 쓰기 요청 거부 `ACCOUNT_DELETION_PENDING` (409). 삭제 · 탈퇴 endpoint 자신은 `DELETION_ALREADY_REQUESTED`. 차단 범위 = `ERROR_CODES.md` §4 | P8-BIP-07 · `N8-09` ⓐ |
| 진행 중 탈퇴 | 전체 삭제 진행 중에도 *Delete account* 는 활성 — 서버가 막으면(`DELETION_ALREADY_REQUESTED`) Frontend 는 InlineAlert info (`Q8-09` ⓐ) | P8-BIP-03 |
| Frontend 동작 (탈퇴) | 성공 응답 즉시 `performSessionCleanup` + `signOut` → `/auth/welcome` replace + Toast 1회 (`features/account-deletion/model/useDeleteAccount.ts` → `useAccountDeletionCleanup.ts` → `shared/lib/session-cleanup.ts`) | `N8-10` 탈퇴 ⓐ |
| Frontend 동작 (전체 삭제 완료) | 요청 id 를 기기에 표시(`haru.data-deletion.pending.v1` — id · scope · 시각, PII 0) → 앱 조립 지점 감시자(`app/providers/DataDeletionWatcher.tsx`)가 `GET /v1/data-deletion-requests/:id` 로 완료를 감지해 로컬 정리 + Toast 1회 | `N8-31` ⓐ (`D8-2`) |
| 다른 기기 잔여 | 요청을 만든 적도 `/settings/data` 를 연 적도 없는 **다른 기기**는 표시가 없어 로컬 아동 데이터(draft · 카드 캐시 · 미업로드 녹음)를 정리하지 못한다. 덮으려면 **서버 신호**가 필요하다 — 예: `GET /v1/me` 에 마지막 삭제 완료 시각(또는 삭제 세대 번호)을 두고 기기가 마지막으로 본 값과 비교. **contract 변경이므로 사용자 승인 필요** | HX-8-01 · R8-15 (`D8-2` ① 수용) |
| 서버 기준 완료 시점 | `DeletionRequest.completedAt` 은 서버가 Storage · DB 삭제를 **모두 끝낸 시각**이어야 한다 (Frontend 는 `status='completed'` 만 보고 정리 · Toast 를 낸다). 백업(PITR) 잔존은 별도 고지 · SLA 수치는 화면에 없다(`N8-04` ⓐ) | HX-8-02 · AC-8-98 |
| Mock | `mocks/account/MockAccountApi.ts` (group `account`) · `mocks/data-management/*` (group `data-management`) · 쓰기 차단 `mocks/common/writeGuard.ts` | — |

## 8. Secret · 로그

- Frontend 번들 · `VITE_*` · 저장소에 Service Role Key · AI Key · STT Secret 없음 (Stage 8 AC-8-65 · 66 · 67 — `pnpm assert:no-mocks` · `pnpm assert:preview` Secret 패턴 9종 검사). Backend 도 Secret 은 환경 변수만.
- 로그에 이름 · 이메일 · Transcript · 오디오 경로 · 복귀 경로 금지.

## 9. 법무 · 결정 대기

L-01 VPC 방식 · L-02 약관 · 개인정보처리방침 실제 문서 URL · L-03 동의 철회 미제공과 COPPA · L-05 audit / consent 보관 기간 · L-07 아이 성(last name) 수집 · `N8-04` 삭제 SLA · 백업 잔존 고지 문구 · `OAQ-19` 실제 Supabase Adapter 추가 시점 · HX-8-01 다른 기기 정리 신호(contract 변경 승인).
