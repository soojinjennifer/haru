# Stage 1-F — API Client · Mock Layer · health 도메인

## Scope
`UI → Query/Mutation hook → API Client Interface → Mock | Http Adapter` 경로를 `health` 도메인에서 **end-to-end** 로 성립시킨다.
Adapter 선택 지점은 **한 곳**이고, scenario 전환은 **결정적**이어야 한다.

## Agent
`development-agent`

## Source Files
- `docs/plans/stage-1-plan.md` §7.2(health endpoint) · §8(Mock scenarios) · §5.2(Adapter 선택 지점) · §16 D-5(scenario 전환) · D-6(Production Mock 처리) · D-7(Http Adapter) · D-8(도메인 범위) · §11.7
- `docs/API_CONTRACTS.md` §1.1 · §1.2 · §5.2 · §5.3 · §5.4(scenario key **유일 기준**)
- `packages/contracts` — `HealthResponseSchema` · `ErrorEnvelopeSchema` · `HaruApiError` · `ErrorCode`
- `.claude/rules/frontend.md` §4 · §5 · `.claude/rules/architecture.md` §4

## Required Work
1. **패키지 설치**: `@tanstack/react-query@^5.103.1`
2. **`shared/api`**: `types.ts`(ApiClients 집합) · `health-api.ts`(`interface HealthApi`) · `helpers/`(`parseResponse` · `toErrorEnvelope` · `withDelay` · `requestId`)
3. **Http Adapter 골격** (D-7): `http/httpClient.ts` — base URL · **`https:` 전용(비-HTTPS 거부)** · `X-Request-Id` · `Authorization` 주입 훅 · contracts parse · Error Envelope 매핑 · 타임아웃. `http/HttpHealthApi.ts`
4. **Mock Layer** (`src/mocks/`): `index.ts`(`__HARU_MOCK_SENTINEL__` export) · `health/MockHealthApi.ts` · `fixtures/health.ts` · `scenarios/`(`scenario-store` · `scenario-url` · `types`)
5. **scenario 5종**: `success` · `loading` · `error` · `retry` · `offline`. `empty` 는 health 에 **적용하지 않는다** (Plan §8.1)
6. **결정성**: Mock 은 `Date.now()` / `Math.random()` 을 직접 호출하지 않고 주입된 `clock` · `idFactory` · 주입 timer 만 쓴다. **같은 scenario = 항상 같은 응답**
7. **scenario 전환 3계층** (D-5): URL `?scenario=<group>:<key>` > dev 패널(session) > `VITE_MOCK_SCENARIO` > `success`
8. **Adapter 선택 지점 1곳**: `app/providers/ApiClientProvider.tsx` 가 `VITE_API_MODE` 로 고른다. Component·Page·Feature·Query hook 에서 분기 금지. `QueryProvider` · `AppProviders` 도 여기서 완성
9. **`entities/health`**: `healthKeys.ts` · `useHealth.ts`
10. **D-6 Mock 배제**: `mock` 빌드에서만 `await import('../../mocks')`, `http` 빌드에서 `src/mocks/**` 가 완전히 제거되도록 하고 `pnpm assert:no-mocks` 가 sentinel 0건을 강제한다
11. `.env.example` 은 `VITE_API_BASE_URL` · `VITE_API_MODE` · `VITE_MOCK_SCENARIO` 만 (Secret 금지)

## Forbidden Work
- **도메인별 `Mock<Domain>Api` 11종 stub 생성 금지** (D-8) — `health` 만 완전 구현
- `AuthGateway` · `recordingApi` · `UploadTransport` 구현 (Stage 2·4)
- Stage 2~8 scenario key · fixture 정의
- Supabase JS Client · MSW 설치 (#8 · #27)
- 실제 화면 내용 · Dev UI Gallery(1-G) · Playwright(1-G)
- Backend 일체

## Verification
- 공통 6종
- `MockHealthApi` × scenario 5종 × contracts parse 테스트
- **결정성 테스트**: 동일 입력 2회 호출 → 동일 출력
- scenario URL 파서(그룹 표기 · 우선순위) 테스트
- `useHealth` × scenario 5종 → Loading / Success / Error+Retry / Offline UI 전이 테스트
- `VITE_API_MODE=mock` 과 `=http` **두 모드 빌드 성공**
- `http` 빌드 `dist/**` 에 `__HARU_MOCK_SENTINEL__` **0건** (`pnpm assert:no-mocks` exit 0)
- Component 가 Adapter 를 직접 호출하지 않음 · 분기 지점 1곳 (grep 증거)
- Mock Data 가 UI/Page/Feature 에 하드코딩되지 않음 (grep 증거)
- 번들 · `VITE_*` · 저장소에 Secret 0건

## Exit Criteria
- health 가 UI 까지 end-to-end 로 동작하고 scenario 5종이 결정적으로 재현된다
- Mock ↔ Http 교체 시 UI·Feature·Query 코드 변경 **0**
- `http` 빌드에서 Mock 이 완전히 배제됨이 기계적으로 증명됐다
- 공통 6종 통과, 회귀 0
- `docs/qa/stage-1f-handoff.md` 작성
