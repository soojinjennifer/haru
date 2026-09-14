# HARU Frontend Rules (`apps/web`, `packages/ui`, `packages/design-tokens`, `packages/contracts`)

## 1. Stack

React · TypeScript (strict) · Vite · React Router · Tailwind CSS **v4** (CSS-first `@theme`) · CSS Variables · TanStack Query · Zod · pnpm workspaces · Playwright (E2E·시각 비교)

- [승인 2026-09-14, Stage 0 #27] Supabase JS Client는 Frontend-only 단계(Stage 1–8)에서 사용하지 않는다. 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi` (Mock | Http) + `UploadTransport` (Mock | TUS) **interface + Mock Adapter** 로 구현하고, 실제 Supabase Adapter는 사용자 승인 또는 Backend 연동 시점에 추가한다. 명칭 정의: `docs/API_CONTRACTS.md` §5.1.
- 승인된 추가 도구·방식 (2026-09-14, Stage 0 #8·#9·#28): Playwright, import 경계 lint 규칙 도구(구체 도구는 Stage 1 Plan), dev 전용 UI gallery route(Production 제외), 차트는 inline SVG, 제스처·애니메이션은 CSS / Pointer Events 우선, (필요 시) TanStack Query persist, MSW 미사용. 아이콘 라이브러리 여부는 Stage 0 #21 결정에 따른다.
- 그 밖의 스택 외 라이브러리(상태 관리, 폼, 제스처·애니메이션 라이브러리, 차트 라이브러리 등) 추가는 이유를 보고하고 승인 후 도입한다.

## 2. 디렉토리

```
apps/web/src/
├── app/        router, providers(API adapter 선택), layouts, error boundary
├── pages/      route 단위 조립 (Composition only)
├── features/   사용자 행동 + 상태 전이 + 서버 상태 (activity-card-deck, recording, reflection …)
├── entities/   도메인 모델별 query key, query/mutation hook, 순수 표시 컴포넌트 (book, prompt, session …)
├── shared/     api client interface, lib, hooks, config, assets, copy
└── mocks/      Mock Adapter, fixtures, scenarios (§5)
```

Shared UI는 `packages/ui` 에 둔다. `apps/web/src/shared/ui` 에 같은 역할의 컴포넌트를 다시 만들지 않는다.

## 3. Page 규칙

Page에 다음을 넣지 않는다.

- API Client / Adapter 호출, fetch
- AI 호출
- Recording 처리
- 복잡한 Business Logic, 복잡한 State Transition
- Mock Data

Page는 layout과 feature/entity 컴포넌트를 조립하고 route param을 전달하는 역할만 한다.

## 4. Server State / API

```
Component → Query/Mutation hook (entities/*, features/*) → API Client Interface (shared/api) → Mock Adapter | Http Adapter
```

- Server State: TanStack Query. Query key는 entity별 factory (`sessionKeys.detail(id)`).
- API Client Interface는 도메인별로 정의한다 (`authApi`, `childrenApi`, `activityApi`, `sessionApi`, `recordingApi`, `analysisApi`, `reportApi` …).
- 모든 Request/Response는 `packages/contracts` schema로 parse 한다.
- Adapter 선택은 `app/providers` 한 곳에서 환경 설정으로 한다. Component·Feature에서 Mock/Http를 분기하지 않는다.
- Client/UI State: component state 우선. 전역 상태가 필요하면 승인 후 도입한다.
- Recording 상태는 `features/recording` 의 RecordingController 상태 머신이 소유한다. 컴포넌트는 구독만 한다.

## 5. Mock Layer

```
apps/web/src/mocks/
├── auth/  children/  onboarding/  activities/  library/
├── sessions/  recordings/  analysis/  reports/  notifications/  data-management/
├── fixtures/     contracts schema를 통과하는 가상 데이터 (실제 아동 데이터 금지)
└── scenarios/    시나리오 정의 + 전환 스위치
```

- Mock Adapter는 API Client Interface를 구현하고 `packages/contracts` schema로 요청·응답을 검증한다.
- 재현 가능한 공통 시나리오: `SUCCESS`, `LOADING`(지연), `EMPTY`, `ERROR`(contracts error code), `RETRY`(실패 후 성공).
- HARU 특화 시나리오: `recording upload success`, `recording upload failure`, `analysis pending`, `analysis completed`, `analysis failed`, `report eligible`, `report not eligible` (+ Stage Plan이 정의하는 추가 시나리오: consent missing, offline 등).
- 시나리오는 개발용 스위치(쿼리 파라미터·dev 패널 등, 방식은 Stage 1 Plan에서 확정)로 전환하며, 결정적(deterministic)이어야 한다.
- **Mock Data를 UI Component, Page, Feature 내부에 하드코딩하지 않는다.** fixture는 `mocks/` 에만 둔다.
- Mock은 contracts 전이 표·error envelope을 그대로 따른다 (허용되지 않은 전이 → 정의된 error code).
- Production 빌드의 Mock 포함/비활성 방식은 Stage 1 Plan에서 확정한다.

## 6. Design System 사용

```
Figma Variables / Styles → CSS Variables (packages/design-tokens) → Tailwind Semantic Tokens → Shared UI → Domain Components → Features → Pages
```

- 색상·타이포그래피·spacing·radius·shadow·material은 **semantic token** 으로만 사용한다.
- 금지: 컴포넌트/화면 코드의 임의 HEX, `rgb()`, Tailwind arbitrary value(`bg-[#85bfb6]`, `p-[13px]`, `rounded-[28px]`), inline style 수치.
  - 예외: `packages/design-tokens` 내부 정의, 일러스트/캐릭터 에셋.
- 필요한 토큰이 없으면 코드에 값을 넣지 말고 design-agent에 신규 토큰을 요청한다.
- 화면 구현 전 Color / Typography / Spacing / Radius / Component / Variant / State / Responsive Rule 을 `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_TOKEN_MAP.md`, Stage Design Spec에서 확인한다.
- 기존 Component로 표현 가능한 UI를 Page 안에서 다시 구현하지 않는다.

## 7. 상태 화면

모든 데이터 화면은 Loading / Empty / Error 상태를 가진다. Recording·Upload·Analysis·Report 화면은 추가로 Offline, Permission Denied, Retry, Pending, Not Eligible 등 해당 상태를 가진다.
PRD 13장 예외 처리(마이크 권한 거부 → 대화만 하기, 네트워크 끊김, STT 저품질 안내, 리포트 미충족 등)의 Frontend UX를 해당 Stage에서 구현하고 Mock 시나리오로 검증한다.

## 8. Copy / Language

- 사용자 노출 언어는 영어(1차). 문구는 컴포넌트에 흩어두지 않고 feature 단위 copy 모듈에 모은다.
- 진단·판정·비교 표현 금지. 관찰, 신호, 성장 힌트, 다음 대화 방향, growing edge 언어를 사용한다.
- 캐릭터 버블·페르소나·피드백·리포트 문구는 API(Mock) 응답 값만 표시한다.

## 9. Accessibility / Responsive

- 양육자 화면 WCAG AA (대비, 포커스, 레이블, 스크린리더 이름). 현재 Figma 토큰의 대비 미달 항목은 `docs/DESIGN_SYSTEM.md` 결정에 따른다.
- 터치 타깃 최소 44×44pt [제안 — PRD §11 "충분히 확보"의 구체값].
- 텍스트 의존 최소화(아이콘·애니메이션 병행), `prefers-reduced-motion` 존중.
- Breakpoint는 승인된 값만 사용한다.

## 10. Test

- Unit/Component: Vitest + Testing Library
- Contracts: schema·전이 표·validation rule 단위 테스트
- Mock: 시나리오별 contracts parse 테스트
- E2E / 시각 비교: Playwright (승인 2026-09-14)
- Recording 로직은 RecorderAdapter를 mock 한 상태 머신 테스트를 필수로 작성한다.
