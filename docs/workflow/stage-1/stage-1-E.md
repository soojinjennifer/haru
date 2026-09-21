# Stage 1-E — apps/web 기반 (Vite · Tailwind · Router · Layout · Error Boundary)

## Scope
`apps/web` 을 처음 만들고 앱 셸을 세운다. Tailwind v4 를 연결해 **1-B 에서 미검증으로 남은 `@theme`/`@utility` 컴파일을 실제로 검증**한다.
API·Mock·데이터 계층은 이 Step 범위가 아니다 (1-F).

## Agent
`development-agent`

## Source Files
- `docs/plans/stage-1-plan.md` §9.5(apps/web 구조) · §5.3(Layout 소유권) · §5.4(Router/Guard) · §5.5(토큰 파이프라인) · §16.1(버전 표) · §11.5
- `docs/design/stage-1-design-spec.md` §2(Layout 구조) · §2.4(AppColumn) · §7(반응형 규칙) · §3.4(`@theme`/`@utility`)
- `docs/qa/stage-1b-handoff.md` 또는 `docs/decisions/stage-1-approvals.md` §4.1 — design-tokens 소비 순서
- `.claude/rules/frontend.md` §2 · §3 · §9 · `.claude/rules/architecture.md` §3

## Required Work
1. **패키지 설치** (§16.1 승인 버전): `vite@^8.3.0` · `@vitejs/plugin-react@^6.1.1` · `tailwindcss@^4.3.3` + `@tailwindcss/vite@^4.3.3` · `react-router@~8.4.0`
2. **앱 셸**: `index.html`(`lang="en"`, `viewport-fit=cover`, **Inter woff2 preload** — 이월 `S1-B-2`) · `vite.config.ts` · `src/main.tsx` · `src/styles/index.css`(`@haru/design-tokens` + `@haru/ui/styles.css` 소비)
3. **Router**: `/` 임시 placeholder · `*` NotFound. `/__dev/ui/*` 는 **1-G 에서** 추가한다
4. **Layouts** (`apps/web/src/app/layouts`): `TabLayout` · `FullscreenLayout` · `StackLayout`. `AppColumn` 은 `packages/ui` 것을 쓴다 (Plan §5.3)
5. **Error Boundary 2단**: `AppErrorBoundary` + `RouteErrorBoundary`, `ErrorState` 컴포넌트 사용, 로깅은 PII 금지 logger 경유
6. **RouteGuard shell만**: `<RouteGuard>` + 주입 가능한 `useGuardDecision()` — Stage 1 구현은 **항상 `allow`**. ARCHITECTURE §2.4 의 판정 순서는 **Stage 2** 다
7. **`shared/lib`**: `logger.ts`(PII 금지 · dev 전용 출력) · `env.ts`. `clock.ts` · `idFactory.ts` 는 1-F 와 겹치면 1-F 로 넘긴다
8. **이월 `S1-B-1` — Tailwind 컴파일 검증 (필수)**: 생성된 CSS 에 ① HARU semantic 유틸리티가 나오고 ② Tailwind 기본 팔레트(`bg-blue-500` 등)와 `sm:`/`xl:`/`2xl:` 가 **생성되지 않는지** 확인한다. 실패하면 `@theme` 초기화를 고치고 보고한다
9. `@haru/design-tokens` 는 `dist/` 를 export 하므로 `dev`/`build` 에 **prebuild 연결**이 필요하다 (1-B 이월)

## Forbidden Work
- API Client · Adapter · Mock · fixture · TanStack Query (전부 1-F)
- Dev UI Gallery · Scenario Panel · Playwright (1-G)
- Home/Auth/온보딩 등 **실제 화면 내용** — `/` 는 임시 placeholder 다 (Plan §3.1)
- `BottomTabBar` 를 `/` 에 마운트 (Stage 3)
- RouteGuard 판정 로직 (Stage 2)
- `apps/mobile` · `apps/api` · `supabase/` 생성
- 화면 코드의 임의 HEX / arbitrary Tailwind value / inline 수치

## Verification
- 공통 6종 + `pnpm build` 성공
- Tailwind 컴파일 검증 결과 (위 8번) 를 **증거와 함께** 기록
- 320 / 393 / 600 / 1024px 에서 앱 컬럼(최대 480px 가운데 정렬) 규칙 적용 확인
- `index.html` 의 preload 가 로컬 woff2 를 가리키고 **외부 요청 0건**
- 레이어 역방향 import 0건 · Page 에 API 호출/복잡 로직 없음

## Exit Criteria
- `pnpm dev` 로 `/` 와 `*` 가 뜨고 Error Boundary 가 동작한다
- Tailwind `@theme`/`@utility` 가 **실제 빌드에서 의도대로 동작**함이 증거로 확인됐다 (`S1-B-1` 해소)
- Inter preload 적용 (`S1-B-2` 해소)
- 공통 6종 통과, 회귀 0
- `docs/qa/stage-1e-handoff.md` 작성
