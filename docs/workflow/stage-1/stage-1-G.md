# Stage 1-G — Dev UI Gallery · Scenario Panel · Playwright

## Scope
Shared UI 22종과 공통 상태를 눈으로 확인할 수 있는 **dev 전용** 화면을 만들고, Playwright 로 시각 비교·반응형·접근성 baseline 을 생성한다.
Stage 1 전체 인계 문서를 통합한다.

## Agent
`development-agent`

## Source Files
- `docs/design/stage-1-design-spec.md` §11-5(gallery 구성 제안) · §5(공통 상태 패턴) · §10.2(시각 비교 baseline 8건) · §10.3(허용 차이) · §12.3
- `docs/plans/stage-1-plan.md` §12(Test Strategy — E2E 행) · §8.2 · §11.3 · §11.4 · §16.1(Playwright 버전)
- `docs/FRONTEND_IMPLEMENTATION_PLAN.md` §1.6(Visual QA checkpoints)
- 이전 Step handoff: `docs/qa/stage-1{a,c,d1,d2,e,f}-handoff.md`

## Required Work
1. **패키지 설치**: `@playwright/test@~1.63.0` (patch 고정 — 시각 baseline 안정성), 루트 `playwright.config.ts`
2. **Dev UI Gallery** (`src/dev/ui-gallery/`, **`import.meta.env.DEV` 가드 + 동적 import**, Production 빌드 제외):
   - `/__dev/ui/tokens` — 색 · 타입 · spacing · radius · shadow · material swatch
   - `/__dev/ui/components` — 22종 × variant × state 매트릭스
   - `/__dev/ui/states` — AppColumn + TopBar 컨텍스트의 공통 상태 6종 (§5.1–§5.6 레이아웃 그대로)
   - `/__dev/ui/responsive` — 320 / 393 / 600 / 1024 프레임
   - `/__dev/ui/a11y` — focus 순회 · 터치 타깃 오버레이 · 대비 값 표시
3. **Scenario Panel** (`src/dev/scenario-panel/`) — dev 전용, sessionStorage + URL 동기화 (D-5 ②)
4. **Playwright baseline**: Chromium 1종 · 고정 DPR · 폰트 로드 대기로 **결정적** 생성. 대상은 Design Spec §10.2 와 Plan §12 의 목록
5. **E2E 검증 항목**: viewport 4종 앱 컬럼 · 200% 텍스트 확대 reflow · `prefers-reduced-motion` · scenario 5종 UI 상태 · **외부 네트워크 요청 0건** · 키보드 탐색/focus 표시
6. **탭 아이콘 글리프 확정** (§11-10): 시각 비교 후 `book-open` / `chart-column` 확정 결과를 handoff 에 기록
7. **이월 `S1-C-1`**: 각 Step handoff 를 **`docs/qa/stage-1-handoff.md`** 로 통합한다 (`.claude/rules/workflow.md` §6 이 요구하는 정식 인계 파일)

## Forbidden Work
- Gallery 를 Production 빌드에 포함 (dev 전용 · 동적 import 필수)
- 실제 제품 화면 구현 · Stage 2 이상 기능
- Design Spec 에 없는 컴포넌트·variant 추가
- 가값(P-01~P-16) 을 **임의로 확정** — gallery 는 승인 자료를 제시할 뿐, 확정은 사용자 절차 (Plan §17)
- Backend 일체

## Verification
- 공통 6종 + `pnpm test:e2e`
- Production(`VITE_API_MODE=http`) 빌드 산출물에 gallery · scenario panel · mock 이 **포함되지 않음** (sentinel + 번들 검사)
- Playwright baseline 이 **2회 연속 실행에서 동일**(결정적)
- 외부 네트워크 요청 0건 (Playwright 네트워크 로그 증거)
- `provisional` 주석 목록 ↔ Design Spec §3.6 표 1:1 유지

## Exit Criteria
- gallery 5개 화면이 dev 에서 동작하고 22종 전 variant·state 가 렌더된다
- Playwright baseline 이 생성되고 재실행이 결정적이다
- `docs/qa/stage-1-handoff.md` 통합 완료 (`S1-C-1` 해소)
- 공통 6종 + E2E 통과, 회귀 0
