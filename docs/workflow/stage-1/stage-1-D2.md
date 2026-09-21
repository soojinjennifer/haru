# Stage 1-D2 — Shared UI 나머지 14종

## Scope
`packages/ui` 의 남은 Shared UI 14종을 구현해 Design Spec §4.23 의 22종을 완성한다.
1-D1 에서 남긴 이월 항목 4건을 함께 정리한다.

## Agent
`development-agent`

## Source Files (필요한 절만 — 전체 요약 금지)
- `docs/design/stage-1-design-spec.md` — §4.1 Text · §4.2 Icon · §4.3 Surface+AppBackground · §4.9 Spinner/Skeleton · §4.10 ErrorState/EmptyState · §4.11 InlineAlert · §4.12 Toast+ToastProvider · §4.19 PageIndicator · §4.20 SpeechBubble · §4.21 Sheet+Scrim · §4.22 Dialog+ConfirmDialog · §6.1 TopBar · §6.2 BottomTabBar · §2.4 AppColumn · §5 공통 상태 패턴 · §8 Icon 규격 · §9 Motion/Accessibility
- `docs/plans/stage-1-plan.md` §9.3 · §11.4
- `docs/qa/stage-1d1-handoff.md` — 1-D1 이 정한 CSS 규약·네이밍
- `.claude/rules/frontend.md` §6 · §9

## Required Work
1. **Shared UI 14종**: Text · Icon · Surface + AppBackground · TopBar · AppColumn · BottomTabBar · Spinner + Skeleton · ErrorState + EmptyState · InlineAlert · Toast + ToastProvider · PageIndicator · SpeechBubble · Sheet + Scrim · Dialog + ConfirmDialog
2. **이월 항목**
   - `S1-D1-3` Button/IconButton 의 임시 loading 인디케이터를 공유 `Spinner` 로 교체
   - `S1-D1-4` `--haru-progress-fill-size` → `--progress-fill-size` (Tier 1 네임스페이스 침범 해소)
   - `S1-D1-1` **[결정됨]** `packages/design-tokens` Tier 2 에 `--color-tag-neutral-bg: var(--haru-dusk-200)` 를 추가하고 Tag `neutral` 이 이것만 참조하게 한다. **색 값은 바꾸지 않는다.** 결과로 `packages/ui` → Tier 1 직접 참조 **0건**. `--color-capability-*-bg` 계열에 넣지 마라 (neutral 은 역량이 아니다)
   - `S1-D1-2` **[결정됨]** `IconButton.size` 를 `size?: 'md'` 로 유지한다. 치수는 §4.5 그대로 시각 38×38 · 아이콘 `--size-icon-md`(20) · hit area 44×44. **sm/lg 를 만들지 마라** — Spec 에 치수가 없다
3. **HARU 전용 SVG**: `tab-center-home.svg` **1건만** export (Design Spec §8.2 · §11-6). 나머지를 미리 넣지 마라
4. **`lucide-react`**: Icon 컴포넌트가 실제로 필요로 하므로 이 Step에서 **정확 버전 `1.47.0`** (D-2, range 기호 없음) 으로 설치·연결한다. 탭 아이콘 글리프(`book-open` / `chart-column`)는 시각 비교 전까지 **확정하지 말고** 선택 근거를 handoff 에 기록한다 (§11-10)
5. 1-D1 이 정한 스타일링 규약(컴포넌트 CSS + `var(--token)`, `haru-<component>[__part][--modifier]`)을 그대로 따른다
6. Toast/Dialog/Sheet 는 focus trap · ESC · `aria-live` · scrim 을 Design Spec §4.12 · §4.21 · §4.22 기준으로 구현한다

## Forbidden Work
- `apps/web` 생성, product screen, domain/feature component
- **Dev UI Gallery** (1-G 범위) · Scenario Panel · Playwright
- `BottomTabBar` 를 실제 라우트에 마운트 (Stage 3 — §11-8)
- Design Spec 에 없는 variant·state 추측 추가 (IconButton `sm`/`lg` 포함)
- `packages/ui` → `@haru/contracts` import
- 임의 HEX / px / radius / inline 수치
- `sharp`, `tailwindcss` 설치
- Stage 2 이상 기능 · Backend 일체

## Verification
- 공통 6종: `typecheck` · `lint` · `test` · `lint:boundaries` · `build` · `format:check`
- 1-A/B/C/D1 회귀 없음 (기존 테스트 211건 유지 또는 증가)
- `packages/ui` HEX/rgb 리터럴 0건, `@haru/contracts` import 0건 (grep 증거)
- ui CSS 가 참조하는 CSS 변수가 전부 design-tokens 산출물에 정의돼 있음 (미정의 0)
- 신규 컴포넌트의 접근성: 키보드 조작 · focus-visible · 접근성 이름 · native semantic 우선

## Exit Criteria
- Design Spec §4.23 의 **22종이 모두 존재**한다
- 이월 항목 `S1-D1-1` · `S1-D1-2` · `S1-D1-3` · `S1-D1-4` **전부 해소**
- `packages/ui` 가 참조하는 Tier 1 토큰 **0건** (grep 증거)
- 공통 6종 통과, 회귀 0
- `docs/qa/stage-1d2-handoff.md` 작성
