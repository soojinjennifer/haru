# HARU Frontend Rules (`apps/web`, `packages/ui`, `packages/design-tokens`, `packages/contracts`)

## 1. Stack

React · TypeScript (strict) · Vite · React Router · Tailwind CSS **v4** (CSS-first `@theme`) · CSS Variables · TanStack Query · Zod · pnpm workspaces · Playwright (E2E·시각 비교)

- [승인 2026-09-14, Stage 0 #27] Supabase JS Client는 Frontend-only 단계(Stage 1–8)에서 사용하지 않는다. 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi` (Mock | Http) + `UploadTransport` (Mock | TUS) **interface + Mock Adapter** 로 구현하고, 실제 Supabase Adapter는 사용자 승인 또는 Backend 연동 시점에 추가한다. 명칭 정의: `docs/API_CONTRACTS.md` §5.1.
- 승인된 추가 도구·방식 (2026-09-14, Stage 0 #8·#9·#28): Playwright, import 경계 lint 규칙 도구(구체 도구는 Stage 1 Plan), dev 전용 UI gallery route(Production 제외), 차트는 inline SVG, 제스처·애니메이션은 CSS / Pointer Events 우선, (필요 시) TanStack Query persist, MSW 미사용. 아이콘은 일반 아이콘 = Lucide(`lucide-react`), HARU 전용 아이콘 = Figma SVG export (Stage 0 #21). 브랜드 로고는 공식 에셋만 사용한다.
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
- [승인 2026-09-14, Stage 0 #10] 토큰은 3-tier(primitive → semantic → component)로 구성하고, 값은 Figma만 기준으로 한다. 화면 raw 값은 정해진 스케일로 흡수한다.
- 가값(provisional) 토큰(`docs/decisions/stage-0-approvals.md` §4)은 토큰 정의에 `provisional` 주석을 남긴다. 값이 확정되면 토큰 값만 교체한다.
- [승인 2026-09-14, Stage 0 #11] 폰트: Apple 기기는 시스템 폰트(SF Pro), 그 외는 Inter. font stack은 `packages/design-tokens` 한 곳에서만 정의하며 `system-ui` 를 Inter 앞에 두지 않는다. SF Pro 폰트 파일은 저장소·빌드에 포함하지 않는다.
- 화면 구현 전 Color / Typography / Spacing / Radius / Component / Variant / State / Responsive Rule 을 `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_TOKEN_MAP.md`, Stage Design Spec에서 확인한다.
- 기존 Component로 표현 가능한 UI를 Page 안에서 다시 구현하지 않는다.

## 6-1. `R-SHADOW-1` — overflow 박스 안의 그림자 (사용자 결정 2026-10-05)

**이 저장소에서 그림자 클리핑이 세 번 반복됐다** — Stage 2 `AppShell`(`overflow-y: auto` 가 `overflow-x` 를 강제) · `SwipeDeck`(`QA-1-L1`) · Stage 3 가로 트랙(`overflow-y: hidden`). 앞의 두 번은 *"overflow 를 쓰지 마라"* 로 대응했는데, **스크롤이 꼭 필요한 곳에는 쓸 수 없어** 세 번째가 났다.

원인은 "overflow 를 썼다"가 아니라 **"overflow 박스 안에 그림자 자리를 안 만들었다"** 이다.

> **`overflow` 가 `visible` 이 아닌 박스 안에 drop shadow 요소가 있으면, 그림자 inset 을 함께 설계한다.**

1. **`overflow` 회피가 1순위.** 스크롤이 꼭 필요한 경우에만 선언한다
2. 불가피하면 **`padding-<방향> ≥ 방향별 번짐`** + **`margin-<방향> = -padding`**. `box-sizing: border-box` 면 **크기(`block-size`/`inline-size`)에 inset 을 가산**해야 한다 — 안 하면 내용이 줄어든다
3. **번짐은 추정하지 말고 `box-shadow` 겹을 전부 합산하고 픽셀 프로브로 실측한다.** 실제 사고: `--shadow-glass-rest` 3겹 중 2번째(`0 12px 28px`)만 세고 3번째(`0 28px 56px`)를 빼뜨려 inset 24 를 승인했는데, 실측 번짐은 **아래 77 · 위 22 · 좌우 28~32** 였다
4. **스크롤 축의 끝은 예외**로 둘 수 있으나, **클립 선이 화면 안에 보이는지** 확인한다. 화면 가장자리와 겹치면 안 보이고, 앱 컬럼 안쪽이면 보인다
5. **포커스 링도 함께 옮긴다** — inset 을 주면 UA 포커스 링이 border box 에 그려져 헐거워진다
6. 새 `overflow` 선언에는 **근거 주석**과 **세로·가로 양쪽 프로브 회귀 테스트**를 붙인다. `e2e/shadow.spec.ts` 가 **가로만** 보던 탓에 세 번째 결함을 못 잡았다

## 7. 상태 화면

모든 데이터 화면은 Loading / Empty / Error 상태를 가진다. Recording·Upload·Analysis·Report 화면은 추가로 Offline, Permission Denied, Retry, Pending, Not Eligible 등 해당 상태를 가진다.
PRD 13장 예외 처리(마이크 권한 거부 → 대화만 하기, 네트워크 끊김, STT 저품질 안내, 리포트 미충족 등)의 Frontend UX를 해당 Stage에서 구현하고 Mock 시나리오로 검증한다.

## 8. Copy / Language

- 사용자 노출 언어는 영어(1차). 문구는 컴포넌트에 흩어두지 않고 feature 단위 copy 모듈에 모은다.
- 진단·판정·비교 표현 금지. 관찰, 신호, 성장 힌트, 다음 대화 방향, growing edge 언어를 사용한다.
- 캐릭터 버블·페르소나·피드백·리포트 문구는 API(Mock) 응답 값만 표시한다.

## 9. Accessibility / Responsive

- 양육자 화면 WCAG AA (대비, 포커스, 레이블, 스크린리더 이름). 대비 예외·가값은 `docs/decisions/stage-0-approvals.md` 를 따른다: 주요 버튼 흰 라벨 = 수용 예외 D-01, 보조 텍스트·비텍스트·focus ring·glass 위 라벨 = 가값 P-01·P-02·P-03·P-11.
- 터치 타깃 최소 44×44pt [제안 — PRD §11 "충분히 확보"의 구체값].
- 텍스트 의존 최소화(아이콘·애니메이션 병행), `prefers-reduced-motion` 존중.
- [승인 2026-09-14, Stage 0 #12] Breakpoint `--bp-md` 600px / `--bp-lg` 1024px. 모든 화면은 모바일 레이아웃이며 600px 이상에서는 최대 폭 480px 앱 컬럼을 가운데 정렬한다 (다단 레이아웃 없음). 앱은 세로 고정, 웹 가로 화면은 앱 컬럼으로 표시한다.

## 9-1. `R-BASELINE-1` — 시각 baseline 에 무엇이 들어가면 안 되는가 (사용자 결정 2026-10-06)

**이 저장소에서 "버그·과도기 상태가 테스트에 굳은" 사고가 네 번 났다** — ① `s2-onboarding-childinfo` 가 언어 유실 버그 상태를 담았다 ② 테스트가 `Go back → 1/15` 라는 **버그를 기대값으로** 단정했다 ③ drag 테스트 시작점을 edge−20 → edge−60 으로 옮겨 회귀를 가렸다 ④ `s2-vpc-failed` 가 `Try again` 이 **최종 위치(y=752)에 도달하기 전 프레임**(y≈465)을 담고 있었다.

④ 는 **같은 타이밍이 재현돼 계속 통과**했다. 통과하는 baseline 은 옳다는 증거가 아니다.

1. **스냅샷 전에 레이아웃이 정착했는지 보장한다.** `settle()` 류를 빠뜨리면 과도기 프레임이 저장된다. ④ 는 가입 후 클라이언트 이동이라 `gotoApp` 의 settle 을 거치지 않는 **유일한 테스트**였다
2. **dev 전용 UI 를 baseline 에 담지 않는다.** Playwright element screenshot 은 **요소 bounding box** 를 찍으므로 위에 뜬 `position: fixed` 오버레이가 함께 들어온다. 실측: dev Scenario Panel 이 **28종**에 찍혀 있었다 — Production 에는 없는 UI 다(`assert:no-mocks` 가 보증한다)
3. **선택자를 좁혀 파손 수를 줄이는 것은 해결이 아니다.** 39 → 19 → 7 로 줄여도 담긴 것은 그대로다. 테스트 레이어에서 **가린다**(`addInitScript` + `visibility: hidden`). `display: none` 은 `:has()` 가 보는 구조를 바꾸므로 피한다
4. **`threshold` 는 변화를 가린다.** pixelmatch `maxDelta = 35215 × threshold²` — `0.2` 는 채널당 약 53 까지 **세지 않는다**(실측: 68.7% 바뀐 baseline 이 통과했다). 영역 baseline 은 `0.02`, 전체 프레임은 `0.2` 다 (`playwright.config.ts`). **전체 프레임 쪽 검출 공백은 Stage 8 회귀 설계에서 다시 본다**
5. **재생성 전에 diff 를 원인별로 분해한다.** 픽셀 연결성분으로 쪼개 클러스터마다 원인을 대고, **설명되지 않는 클러스터가 하나라도 있으면 재생성하지 말고 멈춘다.** 실제로 그 절차가 ④ 를 찾아냈다
6. **의심되면 런타임에서 원인을 토글해 재현한다.** 버블 3픽셀 변화는 `.haru-bubble--clamp` 클래스만 떼고 다시 찍어 **같은 Δ(3/12/8)** 가 돌아오는 것으로 `W-5` 가 원인임을 확정했다. 추정으로 적지 않는다

## 10. Test

- Unit/Component: Vitest + Testing Library
- Contracts: schema·전이 표·validation rule 단위 테스트
- Mock: 시나리오별 contracts parse 테스트
- E2E / 시각 비교: Playwright (승인 2026-09-14)
- Recording 로직은 RecorderAdapter를 mock 한 상태 머신 테스트를 필수로 작성한다.
