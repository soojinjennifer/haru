# Stage 2-UI — Shared UI 6종 + Stage 1 이월 정리

## Scope
Stage 2 화면이 필요로 하는 Shared UI 6종을 `packages/ui` 에 추가하고, Stage 1 이 남긴 이월 4건을 정리한다. 화면은 만들지 않는다.

## Agent
`development-agent`

## Source Files (필요한 절만)
- `docs/design/stage-2-design-spec.md` — 신규 컴포넌트 variant/state 절
- `docs/decisions/stage-2-approvals.md` §4 — **D-8 · D-9 · D-12 · D-13 · D-14**
- `docs/qa/stage-1d1-handoff.md` — 1-D1 이 정한 CSS 규약·네이밍(컴포넌트 CSS + `var(--token)`)
- `docs/design/stage-1-design-spec.md` §9.3(focus ring) · §2.2(레이아웃 확정)

## Required Work
1. **Shared UI 6종 (D-8)**: `SelectTrigger` · `SwipeDeck` · `ListGroup`/`ListRow` 기본 행 · `InfoRow` · `DividerWithLabel` · `TextLink`
   - `SelectTrigger` 의 선택 UI 는 **기존 `Sheet` 재사용** (신규 컴포넌트 아님)
   - `PasswordToggle` 은 만들지 마라 — TextField `trailingAction` 으로 흡수
2. **D-9 SwipeDeck**: CSS `scroll-snap` **사용 금지**. Pointer Events + `transform` 으로 구현하고 **이전/다음 버튼과 키보드를 1급 경로**로 제공. `AppColumn` 안쪽에 `overflow-*` 를 만들지 마라
3. **D-14 / P-17**: TextField `trailingAction` 의 `text-decoration: underline` **제거**. `provisional: P-17` 주석 등록
4. **D-13**: `AppShell` 이 스크롤 컨테이너 ref 를 context 로 제공, `useScrolledPast` 가 그것을 구독(없으면 `window` 폴백). `getSnapshot` 은 boolean 반환
5. **D-12**: Playwright baseline 2종 분리 — 영역 클립 `0.002 / 20`, 전체 프레임 `0.002 / 200`
6. dev gallery `provisionalItems.ts` 를 **확정 11건 반영 + `P-17` 추가**로 갱신

## Forbidden Work
- 화면·라우트·feature (이후 Step) · Stage 2-B 컴포넌트(`CapabilityDiamondChart` · `PersonaCard`)
- Stage 1 §3.1 의 나머지 이관 컴포넌트(`TextArea` · `StarRating` · `StatTile` · `Carousel` · `Toggle` · `SectionHeader`) — Stage 3·5
- `packages/ui` → `@haru/contracts` import
- 임의 HEX / px / radius · 신규 semantic 토큰(Design Spec 이 0건으로 확인)
- Backend 일체

## Verification
- 공통 7종
- `packages/ui` HEX/rgb 0건 · contracts import 0건 · Tier 1 직접 참조 0건 (grep 증거)
- 접근성: `SelectTrigger` 키보드·`aria-expanded`, `SwipeDeck` **버튼·키보드만으로 전 카드 도달**, `ListRow` 터치 44
- **D-9 회귀 방지**: `AppColumn` 안쪽 `overflow` 0건을 기존 구조 테스트가 계속 보장하는지 확인
- `P-17` 주석이 provisional 목록에 잡히는지 (design-tokens 테스트와 동일 방식)

## Exit Criteria
- 6종 존재 + 이월 4건(D-12 · D-13 · D-14 · provisionalItems) 해소
- 공통 7종 통과, 회귀 0
- `docs/qa/stage-2-ui-handoff.md` 작성
