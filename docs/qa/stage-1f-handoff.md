# Stage 1-F Handoff — API Client · Mock Layer · `health` 도메인

Status: IMPLEMENTED (2026-09-20, development-agent) — stage-qa-agent 검증 대기
Scope: `docs/workflow/stage-1/stage-1-F.md` (Required Work 1–11) + 1-E 이월
(`shared/lib/clock.ts` · `idFactory.ts` · `app/providers/*` · AC-1-05)
근거 문서: `docs/plans/stage-1-plan.md` (APPROVED) §5.2·§7.2·§7.3·§8·§9.5·§11.6·§11.7·§16 D-5·D-6·D-7·D-8 ·
`docs/API_CONTRACTS.md` §1.1·§1.2·§4 Stage 1·§5.2·§5.3·§5.4 ·
`.claude/rules/frontend.md` §4·§5·§8 · `.claude/rules/architecture.md` §4·§5

> **1-G(Dev UI Gallery · Scenario Panel · Playwright) 는 시작하지 않았다.**
> Stage 2 이후의 실제 화면 내용도 만들지 않았다 — `/` 는 여전히 임시 placeholder 다.
> `health` 외 11개 도메인의 `Mock<Domain>Api` stub 은 D-8 에 따라 **만들지 않았다**.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` = `APPROVED` | 충족 (2026-09-18, user) |
| `docs/design/stage-1-design-spec.md` = `APPROVED` | 충족 (2026-09-18, user) |
| 이전 단계 산출물 회귀 없음 | 충족 — 루트 테스트 313 → **403** (파일 44 → 55), 감소 0 |
| Plan 이 PRD / Figma 와 모순되지 않음 | 모순 없음. `health` 는 기술 요구사항 endpoint 로 화면이 없다 |
| In Scope 에 Backend 구현 없음 | 없음. `apps/api/` · `supabase/` 미생성 (§5) |

---

## 2. 구현 결과 — Required Work 대응표

| # | 요구 | 결과 |
|---|---|---|
| 1 | `@tanstack/react-query@^5.103.1` 설치 | 설치됨 (해결 버전 **5.103.1**, §16.1 표와 일치). 함께 `@haru/contracts`(workspace) · `zod@^4.6.5` 를 `apps/web` 의존으로 추가 |
| 2 | `shared/api` | `types.ts`(`ApiClients`) · `health-api.ts`(`HealthApi` · `ApiRequestOptions`) · `context.tsx`(`ApiClientsProvider` · `useApiClients`) · `helpers/`(`parseResponse` · `toErrorEnvelope` · `withDelay` · `requestId`) |
| 3 | Http Adapter 골격 (D-7) | `http/httpClient.ts` — base URL **`https:` 전용**(비-HTTPS·상대경로 거부) · `X-Request-Id`(uuid) · `Authorization` 주입 훅 · `Idempotency-Key` 슬롯 · contracts parse · Error Envelope 매핑 · `AbortSignal` 타임아웃. `http/HttpHealthApi.ts`(`GET /v1/health`, `auth: false`) |
| 4 | Mock Layer | `mocks/index.ts`(`__HARU_MOCK_SENTINEL__`) · `mocks/health/MockHealthApi.ts` · `mocks/fixtures/health.ts` · `mocks/scenarios/{types,scenario-url,scenario-store}.ts` |
| 5 | scenario 5종 | `success` · `loading` · `error` · `retry` · `offline`. `empty` 는 health 에 **정의하지 않음** (Plan §8.1) |
| 6 | 결정성 | Mock 은 `clock`(고정 epoch) · `idFactory`(seed) · 주입 `timer` 만 사용. 정적 테스트가 `Date.now(` · `new Date(` · `Math.random(` · `setTimeout(` 의 Mock 내부 직접 호출 0건을 강제 |
| 7 | scenario 전환 3계층 (D-5) | URL `?scenario=<group>:<key>[,…]` > dev 패널(sessionStorage `haru:scenario`) > `VITE_MOCK_SCENARIO` > `success`. 한 계층 안에서는 그룹 지정 > wildcard |
| 8 | Adapter 선택 지점 1곳 | `app/providers/apiClients.ts` 가 **저장소에서 유일하게** `VITE_API_MODE` 를 읽는다. `ApiClientProvider` · `QueryProvider` · `AppProviders` 완성, `main.tsx` 에 연결 |
| 9 | `entities/health` | `healthKeys.ts`(query key factory) · `useHealth.ts`(Loading / Success / Error+code / Offline) |
| 10 | D-6 Mock 배제 | `mock` 빌드에서만 `await import('../../mocks')`. `vite.config.ts` 가 `import.meta.env.VITE_API_MODE` 를 리터럴로 define → `http` 빌드에서 상수 접힘 → Rollup 이 `src/mocks/**` 제거. `pnpm assert:no-mocks` 로 강제 |
| 11 | `.env.example` | 기존 그대로 `VITE_API_BASE_URL` · `VITE_API_MODE` · `VITE_MOCK_SCENARIO` 3개만. Secret 0 |

### 2.1 1-E 이월 항목

| 이월 | 결과 |
|---|---|
| `shared/lib/clock.ts` | `Clock` + `createFixedClock` · `createSteppedClock` · `createSystemClock`. `Date.now()` 는 `createSystemClock` 에만 존재하며 Mock 경로에서 쓰지 않는다 |
| `shared/lib/idFactory.ts` | `IdFactory` + `createSeededIdFactory`(FNV-1a + mulberry32 → RFC 4122 v4 형태 uuid) · `createRandomIdFactory`. contracts `IdSchema` 통과 |
| `app/providers/*` | `apiClients.ts`(선택) · `ApiClientProvider.tsx` · `QueryProvider.tsx` · `AppProviders.tsx` · `index.ts` |
| **AC-1-05** | `mock` · `http` 두 모드 빌드 **모두 성공** (§4) |

---

## 3. 생성·수정 파일

### 생성

```
apps/web/src/shared/lib/clock.ts
apps/web/src/shared/lib/idFactory.ts
apps/web/src/shared/api/index.ts
apps/web/src/shared/api/types.ts
apps/web/src/shared/api/health-api.ts
apps/web/src/shared/api/context.tsx
apps/web/src/shared/api/helpers/index.ts
apps/web/src/shared/api/helpers/parseResponse.ts
apps/web/src/shared/api/helpers/toErrorEnvelope.ts
apps/web/src/shared/api/helpers/withDelay.ts
apps/web/src/shared/api/helpers/requestId.ts
apps/web/src/shared/api/http/index.ts
apps/web/src/shared/api/http/httpClient.ts
apps/web/src/shared/api/http/HttpHealthApi.ts
apps/web/src/shared/copy/error-copy.ts
apps/web/src/mocks/index.ts
apps/web/src/mocks/health/MockHealthApi.ts
apps/web/src/mocks/fixtures/health.ts
apps/web/src/mocks/scenarios/index.ts
apps/web/src/mocks/scenarios/types.ts
apps/web/src/mocks/scenarios/scenario-url.ts
apps/web/src/mocks/scenarios/scenario-store.ts
apps/web/src/app/providers/index.ts
apps/web/src/app/providers/apiClients.ts
apps/web/src/app/providers/ApiClientProvider.tsx
apps/web/src/app/providers/QueryProvider.tsx
apps/web/src/app/providers/AppProviders.tsx
apps/web/src/entities/health/index.ts
apps/web/src/entities/health/healthKeys.ts
apps/web/src/entities/health/useHealth.ts
```

테스트 (신규 11파일 / 90건)

```
apps/web/__tests__/mock-source-rules.test.ts              (Node 환경 — 정적 규칙)
apps/web/src/shared/lib/__tests__/clock.test.ts
apps/web/src/shared/lib/__tests__/idFactory.test.ts
apps/web/src/shared/api/__tests__/helpers.test.ts
apps/web/src/shared/api/__tests__/httpClient.test.ts
apps/web/src/shared/copy/__tests__/error-copy.test.ts
apps/web/src/mocks/__tests__/MockHealthApi.test.ts
apps/web/src/mocks/__tests__/scenario-url.test.ts
apps/web/src/mocks/__tests__/scenario-store.test.ts
apps/web/src/entities/health/__tests__/useHealth.test.tsx
apps/web/src/app/providers/__tests__/providers.test.tsx
```

### 수정

| 파일 | 변경 |
|---|---|
| `apps/web/package.json` | `@tanstack/react-query` · `@haru/contracts` · `zod` 추가 |
| `apps/web/vite.config.ts` | `defineConfig` 를 함수형으로 바꾸고 `define: { 'import.meta.env.VITE_API_MODE': … }` 추가. 기본값 = dev `mock` / build `http` |
| `apps/web/vitest.config.ts` | 같은 `define`(테스트는 `mock` 고정) |
| `apps/web/src/main.tsx` | `AppProviders` 로 라우터 감쌈 |
| `apps/web/src/shared/lib/env.ts` | `apiBaseUrl` · `mockScenario` 추가. `VITE_API_MODE` 는 **읽지 않음**(선택 지점 1곳 유지) |
| `apps/web/src/vite-env.d.ts` | 주석을 구현 사실에 맞게 갱신 |
| `apps/web/src/shared/lib/__tests__/env.test.ts` · `logger.test.ts` | `AppEnv` 필드 추가 반영 |
| `pnpm-lock.yaml` | 의존성 추가 반영 |

---

## 4. 실행한 검증 명령과 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | **통과** (packages/config · design-tokens · contracts · ui · apps/web 전부 Done) |
| `pnpm lint` | **통과** (0 problems) |
| `pnpm test` | **통과** — `Test Files 55 passed / Tests 403 passed` (1-E 시점 44 / 313 → 회귀 0) |
| `pnpm lint:boundaries` | **통과** — `no dependency violations found (212 modules, 520 dependencies cruised)` |
| `pnpm build` (env 미지정 = `http`) | **성공** |
| `pnpm format:check` | **통과** — `All matched files use Prettier code style!` |

### AC-1-05 — 두 모드 빌드

| 모드 | 명령 | 결과 |
|---|---|---|
| mock | `VITE_API_MODE=mock pnpm --filter @haru/web run build` | **성공** (exit 0). 청크 분리: `dist/assets/mocks-*.js` 90.34 kB + `index-*.js` 301.00 kB |
| http | `VITE_API_MODE=http pnpm --filter @haru/web run build` | **성공** (exit 0). `mocks-*` 청크 **없음**, `index-*.js` 390.47 kB 단일 |

### `pnpm assert:no-mocks` (AC-1-42)

| 대상 빌드 | sentinel 검출 | 종료 코드 |
|---|---|---|
| `http` 빌드 `dist/**` | **0건** (`.js` · `.map` 포함 전수) | 0 — `[assert:no-mocks] OK — http 빌드 산출물에 __HARU_MOCK_SENTINEL__ 0건.` |
| `mock` 빌드 `dist/**` (대조군) | 2건 (`mocks-*.js`, `mocks-*.js.map`) | 1 — 검사가 실제로 동작함을 증명 |

> sentinel 은 `createMockApiClientsBundle()` 의 반환값(`bundle.sentinel`)으로 **실제 참조**된다.
> 참조가 없으면 `mock` 빌드에서도 tree-shaking 으로 사라져 검사가 헛돌기 때문이다.

### 추가 grep 증거

| 항목 | 결과 |
|---|---|
| `apps/api/` · `supabase/` | 미생성 (`apps/` = `web` 만, `packages/` = `config · contracts · design-tokens · ui`) |
| `VITE_API_MODE` 를 읽는 코드 | `apps/web/src/app/providers/apiClients.ts` **1곳** (주석·`.d.ts` 타입 선언 제외). 정적 테스트가 강제 |
| `src/mocks` 를 import 하는 앱 코드 | `apps/web/src/app/providers/apiClients.ts` **1곳**. 정적 테스트가 강제 |
| Component·Page·Feature 의 Adapter 직접 호출 | 0건 (`Mock*Api` / `Http*Api` / `create*ApiClients` 참조는 선택 지점 · `shared/api/http` · `mocks` · 테스트뿐) |
| Mock fixture 하드코딩 | 0건 — `0.0.0-mock` · sentinel 이 `mocks/` 밖 코드에 없음 (정적 테스트) |
| Secret | 0건 (`service_role` · `sk-…` · `OPENAI` · `SUPABASE_*KEY` · `STT_SECRET` 패턴을 `apps/web/src` · `dist` · `packages/*/src` · `.env.example` 에서 검색) |
| `VITE_*` 변수 | `VITE_API_MODE` · `VITE_API_BASE_URL` · `VITE_MOCK_SCENARIO` 3개뿐 |

---

## 5. Mock 시나리오 목록과 전환 방법

### 5.1 `health` 그룹 (API_CONTRACTS §5.3 health 행 / §5.4 Catalogue)

| Machine key | Mock 동작 | UI 상태 |
|---|---|---|
| `success` | `{status:'ok', version:'0.0.0-mock', serverTime:'2026-01-01T00:00:00.000Z'}` | 정상 렌더 |
| `loading` | 성공 응답을 주입 timer 로 `HEALTH_LOADING_DELAY_MS`(1500ms) 지연 | Skeleton / `aria-busy` |
| `error` | `INTERNAL_ERROR` Error Envelope (`requestId` 포함) → `HaruApiError` | `ErrorState` + Retry |
| `retry` | 1회차 `INTERNAL_ERROR` → 2회차부터 성공 | Retry 후 성공 전이 |
| `offline` | `NetworkError` throw (Error Envelope 없음) | `InlineAlert tone="offline"` |

`empty` 는 health 에 해당 항목이 없어 **적용하지 않는다**(Plan §8.1). deprecated alias(`default` · `slow` 등)는 정의도 사용도 하지 않는다(테스트로 강제 — AC-1-40).

### 5.2 전환 방법

| 방법 | 예 | 우선순위 |
|---|---|---|
| URL query | `?scenario=health:loading` / `?scenario=loading`(전 그룹) / `?scenario=health:error,__states:empty` | 1 |
| dev Scenario Panel | `sessionStorage['haru:scenario']` (패널 UI 는 1-G) | 2 |
| 빌드 기본값 | `VITE_MOCK_SCENARIO=success` | 3 |
| 기본 | `success` | 4 |

- 한 계층 안에서는 그룹 지정이 wildcard 를 이긴다. 계층은 그 그룹을 **언급한 첫 계층**에서 결정이 끝난다.
- 그룹에 없는 key(`health:empty`, Stage 2+ key)는 그룹 기본값(`success`)으로 떨어지고 `logger.warn` 을 남긴다(PII 없음).
- 테스트에서는 `createMockApiClients({ search: '?scenario=health:<key>', timer: createImmediateTimer() })` 로 0ms 재현한다.

### 5.3 결정성 (AC-1-39)

- 고정 epoch `MOCK_EPOCH_MS = 2026-01-01T00:00:00Z`, seed `MOCK_ID_SEED = 'haru-mock'`.
- 같은 scenario 2회 호출 → 응답 바이트 동일 / 새 Mock 인스턴스 → 동일 / `error` 의 `requestId` 수열 동일 / `retry` 의 실패·성공 순서 동일 — 전부 테스트로 고정.

---

## 6. `BACKEND_INTEGRATION_PENDING` 예상 항목

Stage 1-F 는 `health` 를 Mock 으로 전부 검증할 수 있어 **QA 가 판정해야 할 신규 PENDING 항목이 없다**(Plan §7.2 · §11 AC-1-30). 다만 Stage 8 Handoff 에 옮길 **기록 대상**은 아래와 같다.

| 항목 | 내용 | Handoff 문서 |
|---|---|---|
| `GET /v1/health` 실제 응답 | `HealthResponseSchema` = `{status:'ok', version, serverTime}`. 공개 endpoint(인증 없음), 부작용 없음, 오류 `INTERNAL_ERROR` · `RATE_LIMITED` | `BACKEND_HANDOFF.md`, `API_CONTRACTS.md` |
| `X-Request-Id` echo | 서버가 요청 헤더의 uuid 를 응답 헤더와 Error Envelope `requestId` 에 그대로 돌려줘야 한다. Frontend 는 이미 전송·수신·표시 경로를 갖췄다 | `ERROR_CODES.md` |
| Error Envelope 준수 | 실패 응답 body 가 `{error:{code,message,requestId?,details?}}` 가 아니면 Frontend 는 `INTERNAL_ERROR` 로 강등한다 | `ERROR_CODES.md` |
| `https:` 강제 | Http Adapter 는 비-HTTPS base URL 을 **생성 시점에 거부**한다. 배포 API 는 HTTPS 여야 한다 | `BACKEND_HANDOFF.md` |
| `Authorization` 주입 훅 | `getAuthToken` 훅만 있고 실제 토큰 공급자(`AuthGateway`)는 Stage 2 | `AUTH_REQUIREMENTS.md` |
| `Idempotency-Key` | 헤더 전송 슬롯만 구현. 서버 측 (caregiverId, key) 24h 보관·재생 규칙은 Backend 요구사항 | `BACKEND_HANDOFF.md` |

---

## 7. Scope 경계에서 보류한 항목

| 항목 | 이유 |
|---|---|
| `Mock<Domain>Api` 11종 stub | D-8 — `health` 만 완전 구현. 빈 stub 은 dead code 이자 선행 구현 |
| `AuthGateway` · `recordingApi` · `UploadTransport` | Stage 2 · 4 |
| Stage 2–8 scenario key · fixture | Plan §8.4 |
| dev Scenario Panel UI · UI Gallery · Playwright | Stage 1-G. 단 패널이 쓸 계약(`SCENARIO_SESSION_KEY` · `readScenarioPanelValue` · `serializeScenarioSource` · `ScenarioStore`)은 준비해 뒀다 |
| 실제 화면에서의 `useHealth` 사용 | Stage 2 이후. 1-F 에서는 테스트 전용 하네스로만 UI 전이를 검증했다 (`/` 는 placeholder 유지) |
| Supabase JS Client · MSW | #8 · #27 — 설치하지 않음 |

---

## 8. 발견한 문제

### Blocking
없음.

### Non-blocking (결정 기록)

| # | 내용 |
|---|---|
| `S1-F-1` | **`vite.config.ts` 가 `import.meta.env.VITE_API_MODE` 를 명시적으로 `define` 한다.** 환경 변수를 설정하지 않으면 Vite 는 `import.meta.env` 를 런타임 객체 조회로 남기고, 그러면 D-6 의 dead-code elimination 이 보장되지 않아 Mock 이 산출물에 섞인다. 빌드 기본값을 `http`(=Mock 배제 안전측), dev 기본값을 `mock` 으로 두었다. Stage 8 Mock 프리뷰는 `VITE_API_MODE=mock pnpm build` 로 만든다 |
| `S1-F-2` | **`offline` 은 Error Code 가 아니다.** contracts §1.2 에 네트워크 오류 코드가 없으므로 `NetworkError`(`shared/api/helpers/toErrorEnvelope.ts`)로 구분했다. `toErrorEnvelope()` 로 직렬화할 때만 가장 가까운 `PROVIDER_UNAVAILABLE` 로 표현한다. contracts 변경은 하지 않았다 |
| `S1-F-3` | **`httpClient` 는 `https:` 만 허용한다** (Required Work 3). 따라서 `http://localhost` 백엔드로는 붙을 수 없다. Stage 2 이후 로컬 Backend 연동이 필요해지면 예외 허용 여부를 별도 승인받아야 한다 |
| `S1-F-4` | **QueryClient 기본값 `retry: false`.** 자동 재시도가 있으면 `error` scenario 가 화면에 드러나지 않고 `retry` scenario 의 "1회차 실패 → 사용자 재시도 성공" UX 를 검증할 수 없다. 재시도는 `ErrorState` 의 Retry 버튼으로만 일어난다 |
| `S1-F-5` | **`shared/copy/error-copy.ts` 에 Error Code 28종 문구를 모두 작성했다** (Plan §9.5 "errorCode → 사용자 문구 매핑"). Stage 2 이후 화면 맥락이 생기면 feature copy 모듈이 이 문구를 덮어쓸 수 있다. 현재 문구는 진단·판정·비교 표현 금지 규칙을 테스트로 검사한다 |
| `S1-F-6` | `apps/web/__tests__/mock-source-rules.test.ts` 는 소스 파일을 직접 읽는 **정적 규칙 테스트**다 (AC-1-39 · AC-1-41 · AC-1-12 를 CI 에서 강제). 주석은 제거한 뒤 검사하므로, 규칙을 문서화한 주석이 위반으로 잡히지 않는다 |

### NEEDS_DECISION
없음.

---

## 9. Stage 1-F 로 확정된 사실 (다음 Step 이 의존)

1. **Adapter 선택 지점은 `apps/web/src/app/providers/apiClients.ts` 한 곳**이며, 그 파일만 `VITE_API_MODE` 를 읽는다. 1-G 의 Dev Gallery 는 `AppProviders`/`ApiClientProvider` 의 `clients` prop 으로 Adapter 를 주입한다.
2. **Scenario Panel(1-G) 계약**: 값 형식 = `?scenario=` 와 동일한 문자열, 저장 위치 = `sessionStorage['haru:scenario']`(`SCENARIO_SESSION_KEY`), 직렬화 = `serializeScenarioSource()`, store 접근 = `createMockApiClientsBundle().store`.
3. **`createMockApiClients` 의 timer 기본값은 실제 지연**이다. 테스트·결정적 재현에서는 `createImmediateTimer()` 를 주입한다.
4. **도메인 추가 패턴**: `shared/api/<domain>-api.ts`(interface) → `ApiClients` 에 필드 추가 → `shared/api/http/Http<Domain>Api.ts` → `mocks/<domain>/Mock<Domain>Api.ts` + `ScenarioGroupDefinition` + `mocks/fixtures/<domain>.ts` → `entities/<domain>/{<domain>Keys.ts, use*.ts}`. 공통 helper 는 `shared/api/helpers` 만 쓴다.
5. **테스트 기준선**: 루트 `Test Files 55 / Tests 403`. 이 수가 줄면 회귀다.
