# Stage 2-UI Handoff — Shared UI 6종 + Stage 1 이월 4건

Status: IMPLEMENTED (2026-09-25, development-agent)
Step: `docs/workflow/stage-2/stage-2-UI.md` (Queue 2/7)
Scope: `docs/design/stage-2-design-spec.md` §4 (APPROVED 2026-09-25) · `docs/decisions/stage-2-approvals.md` §4 **D-8 · D-9 · D-12 · D-13 · D-14**

> 이 Step 은 **`packages/ui` · `packages/design-tokens` · dev gallery · e2e 설정만** 다룬다.
> 화면 · route · feature · Mock Adapter 는 후속 Step (`2-AUTH` 이후) 이다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-2-plan.md` = `APPROVED` | 충족 (2026-09-25, user) |
| `docs/design/stage-2-design-spec.md` = `APPROVED` | 충족 (2026-09-25, user) |
| 선행 Step `2-CONTRACTS` = COMPLETE | 충족 (`docs/qa/stage-2-contracts-handoff.md`) |
| Plan ↔ PRD / Figma 모순 | 없음 |
| In Scope 에 Backend 구현 | 없음 — `apps/api/` · `supabase/` 미생성 확인 |

---

## 2. 구현한 요구사항 / AC

| AC | 내용 | 이 Step 에서의 상태 |
|---|---|---|
| **AC-2-58** | 임의 HEX / `rgb()` / arbitrary value / inline 수치 0건 | 충족 — `packages/ui` grep 0건 (§6). 신규 CSS 는 전부 semantic · Tier 3 토큰 |
| **AC-2-60** | 신규 인터랙티브 컴포넌트 키보드 조작 · focus 표시 · 접근성 이름 · 44×44 | 충족 (컴포넌트 단위) — §3 상태표 · 44 근거. 화면 단위 e2e 는 후속 Step |
| **AC-2-61** | `useScrolledPast` 컨테이너 구독 (D-13) | **부분** — 훅·`AppShell` 구현 + 단위/통합 테스트 충족. **e2e 스크롤 테스트는 실제 스크롤 화면이 생기는 Step 에서** (dev gallery 는 `AppShell` 을 쓰지 않는다) |
| **AC-2-62** | `PROVISIONAL_ITEMS` 갱신 + 신규 가값 `P-17` 등록 | 충족 — 확정 11 / 대기 6 (P-01·P-02·P-04·P-05·P-16·**P-17**), gallery 표에 상태 컬럼 추가 |
| **AC-2-25** (선행분) | SwipeDeck 제스처 전용 금지 | 컴포넌트 단위 충족 (버튼·키보드만으로 전 카드 도달 테스트). 10문항 화면 e2e 는 `2-ONBOARDING` |
| **AC-2-67 / AC-2-68** | 회귀 · 공통 명령 | 충족 (§5) — 테스트 560 → **604**, e2e 58 → **64**, baseline 27 → **33** |

---

## 3. 신규 Shared UI 6종 (D-8) — variant / state

> 공통: `packages/ui` 는 `@haru/contracts` 를 import 하지 않는다. 옵션·아이템·문구는 전부 prop 주입이다.

| # | 컴포넌트 | variant | state | 접근성 |
|---|---|---|---|---|
| 23 | `SelectTrigger` (`field/`) | **`row` 단일** (Figma pill 미구현 — `AD-S2-6`) | `rest` · `hover` · `pressed` · `focus` · `filled` · `placeholder` · `error` · `disabled` | native `<button>` + `aria-haspopup="dialog"` + `aria-expanded`, 이름 = label + 현재 값. 옵션 UI 는 **기존 `Sheet`(bottom) + `RadioGroup variant=list` 재사용** — 신규 컴포넌트 아님. Esc·닫힘 시 트리거로 포커스 복귀 (`useFocusTrap`) |
| 24 | `SwipeDeck` (`deck/`) | `depth` 1 · 2 · **3**(기본) · `controls` `inline`(기본) / `none` | `idle` · `dragging` · `advancing(exit-next/prev)` · `returning` · `first` / `last`(버튼 disabled) | `role="group"` + `aria-roledescription="card deck"` + `aria-label`, 뒤 카드 `aria-hidden`(빈 표면), 진행 알림 `aria-live="polite"`(`statusLabel` prop), 진행 중 카드 `inert` |
| 25 | `ListGroup` / `ListRow` (`list/`) | `ListRow` = **`basic`** (title + subtitle? + trailing?). `media` · `meta` 는 Stage 3 | `rest` · `hover` · `pressed` · `focus` · `disabled` · `selected` | `ul` / `li`, `onPress` 있으면 행 전체가 `<button>`(이름 = title + subtitle), `selected` → `aria-current`. 행 최소 높이 **56** ≥ 44 |
| 26 | `InfoRow` (`list/`) | 없음 (표시 전용) | 없음 | 아이콘 래퍼 `aria-hidden`, 정보는 텍스트가 전달. **고정 높이 없음** (텍스트 200% reflow) |
| 27 | `DividerWithLabel` (`divider/`) | 없음 | 없음 | rule 2개 `aria-hidden`, `role="separator"` 미사용(폼 구조 보존) |
| 28 | `TextLink` (`link/`) | `tone` = `default`(본문 안) / `standalone`(단독 줄) | `rest` · `hover` · `pressed` · `focus` · `disabled` (visited 미구분) | `href` → `<a>`, `onPress` → `<button>`. **색 + 밑줄 이중 구분**. `external` → `target="_blank" rel="noopener noreferrer"` + `external-link` 아이콘 + 시각 숨김 `externalHint`(미지정 시 `devWarn`) |

`PasswordToggle` 은 만들지 않았다 — `TextField.trailingAction` 으로 흡수 (D-8). D-14 보완 ②로 `trailingAction.pressed` (→ `aria-pressed`) 를 추가했다.

### 3.1 신규 Tier 3 토큰 4종 (48 → 52)

`packages/design-tokens/src/component/index.css` (Tier 3 = `packages/ui` 전용 경계 유지, `@theme` 미노출):

| 토큰 | 값 | 근거 |
|---|---|---|
| `--list-row-height-min` | `56px` | §4.3 (Figma 74 는 media 행 값) |
| `--deck-inset-x` | `var(--space-2)` | Figma `179:1781–1783` 345→329→313 = 레벨당 좌우 8 |
| `--deck-peek-y` | `var(--space-4)` | 레벨당 아래로 16 |
| `--deck-depth` | `3` | Figma 카드 3장. CSS 에서 `--deck-levels` 계산에 실제로 쓰인다 |

**신규 semantic 토큰 0건** (Design Spec 확인 그대로). `token-tiers.test.ts` 의 Tier 3 목록을 52 로 갱신했다.

---

## 4. D-9 — SwipeDeck 을 `overflow` 없이 구현한 방법

| 항목 | 구현 |
|---|---|
| 스크롤 컨테이너 | **만들지 않는다.** `SwipeDeck.css` 에 `overflow` 선언 **0건**, `scroll-snap` **0건** (선언부 grep + 단위 테스트 `SwipeDeck.test.tsx` "CSS 는 overflow · scroll-snap 을 쓰지 않는다") |
| 카드 이동 | `transform: translate3d(var(--deck-drag-x, 0px), 0, 0)` — 드래그는 CSS 커스텀 속성만 갱신한다 |
| 스택 기하 | 앞 카드는 **일반 흐름**(높이 고정 없음), 뒤 카드만 `position: absolute`. 스택은 `padding-block-end: calc(var(--deck-levels) * var(--deck-peek-y))` 로 뒤 카드 자리를 확보한다 → 컨테이너가 콘텐츠 높이를 따른다 (텍스트 200% 대응) |
| 제스처 | Pointer Events (`pointerdown/move/up/cancel`) + `setPointerCapture`. 카드에 `touch-action: pan-y` 만 둬서 세로 스크롤은 브라우저가, 가로 제스처는 컴포넌트가 처리한다 (`touch-action` 은 클리핑 박스를 만들지 않는다) |
| 임계 | 카드 폭 25%, 최소 48px. 미만이면 `--deck-drag-x` 를 0으로 되돌려 CSS transition(`--motion-ease-spring`)으로 복귀 |
| 덱 끝 | 더 끌면 1/4 로 감쇠 |
| 모션 | 진행 = `translateX(∓60%) + opacity 0`(`--motion-duration-base`), 확정 후 새 카드 enter. `prefers-reduced-motion: reduce` 면 **JS 가 타이머 없이 즉시 확정**(`matchMedia` 확인) + CSS 애니메이션 off |

### 버튼·키보드만으로 전 카드 도달 (WCAG 2.5.1)

- **버튼(1급)**: `controls="inline"`(기본)이 이전/다음 `IconButton` 을 렌더한다. 접근성 이름은 `prevLabel` / `nextLabel` prop. 첫·마지막에서 **사라지지 않고 `disabled`** 가 된다. 테스트: `버튼만으로 모든 카드에 도달한다 (제스처 없이 — WCAG 2.5.1)` — 4장 왕복 전수.
- **키보드(1급)**: 덱 컨테이너에 ref + native `keydown` 리스너로 `ArrowLeft` / `ArrowRight` 를 처리한다. 테스트: `키보드 ArrowRight / ArrowLeft 만으로 모든 카드에 도달한다 (버튼 없이)` — `controls="none"` 상태에서 전수.
- **주의(설계 판단)**: 덱 자체에는 `tabIndex` 를 두지 않았다(화살표는 **덱 안에 포커스가 있을 때** 동작). 이유 ① APG carousel 패턴에서 기본 키보드 경로는 버튼이다 ② `role="group"` 컨테이너에 `tabIndex` + 조작을 붙이면 `jsx-a11y/no-noninteractive-tabindex` · `no-noninteractive-element-interactions` 위반이며, 이를 끄지 않고 규칙을 지키는 쪽을 택했다. `controls="none"` 으로 쓰는 화면(TopBar 버튼 배치 — Figma `179:1772`/`179:1775`)은 **동등한 버튼을 반드시 제공**해야 한다.
- `RadioGroup` 등 화살표를 자체 처리하는 컨트롤 위에서는 덱이 키를 가로채지 않는다 (`KEY_OWNING_SELECTOR`). 설문 카드의 radio 조작과 충돌하지 않는다.
- 뒤 카드는 **내용을 복제하지 않는다**(빈 표면). 복제하면 같은 `name` 의 radio 가 문서에 중복되어 폼 동작이 깨진다.

### D-9 회귀 방지

- `apps/web/src/app/layouts/__tests__/layouts.test.tsx` 의 "앱 컬럼 안쪽에는 overflow 컨테이너가 없다" 3건 + `e2e/shadow.spec.ts` 4폭 — **전부 통과(변경 없음)**.
- `packages/ui` 전체 CSS grep: 신규 5개 CSS 파일에 `overflow` 선언 0건.

---

## 5. 이월 4건 처리 결과

| 이월 | 결과 |
|---|---|
| **D-12** baseline 2종 분리 | `playwright.config.ts` 에 `REGION_SNAPSHOT`(`0.002 / 20`) · `FRAME_SNAPSHOT`(`0.002 / 200`) 를 export. `visual.spec.ts` 의 영역 클립 baseline 22건 + 신규 6건에 REGION, 반응형 프레임 4건과 `responsive.spec.ts` 의 `frame-320-text-200` 에 FRAME 적용. **효과 즉시 확인**: 새 임계값이 `v5-field` 의 32px 차이(D-14 밑줄 제거)를 잡아냈다 — 기존 200 상한이면 통과했을 변경이다 |
| **D-13** 스크롤 컨테이너 구독 | `packages/ui/src/layout/ScrollContainerContext.tsx` 신규(`ScrollContainerProvider` · `useScrollContainerRef`). `AppShell` 이 뷰포트 div ref 를 provider 로 내려주고, `useScrolledPast` 가 `containerRef.current ?? window` 를 구독한다. **`getSnapshot` 은 boolean 반환** (스크롤 좌표 대신 파생값 — 임계값 근처가 아니면 리렌더 없음). Provider 없으면 `window` 폴백 |
| **D-14 / P-17** | `TextField.css` 의 `text-decoration: underline` 제거(Figma `76:417`/`76:428` 일치) + `/* provisional: P-17 */` 주석 등록. 보완 3종 적용: ① 라벨이 상태를 전달(Show ↔ Hide — 소비자 책임, 문구 prop) ② `trailingAction.pressed` → `aria-pressed` ③ hit area 44 유지. baseline `v5-field` 재생성 |
| **provisionalItems** | 확정 11건(P-03·P-06·P-07·P-08·P-09·**P-10**·P-11·P-12·P-13·P-14·P-15) / 대기 6건(P-01·P-02·P-04·P-05·P-16·**P-17**). `status` · `decision` 필드 추가 + `/__dev/ui/tokens` 표에 "상태" 컬럼 추가 |

`provisional-markers.test.ts` 는 확정 10건 재등장 차단은 그대로 두고, `P-17` 이 **`field/TextField.css` 에만** 있는지 검사하는 테스트를 추가했다.

---

## 6. 생성 · 수정 파일

### 신규 (18)

| 영역 | 파일 |
|---|---|
| `packages/ui` 컴포넌트 | `src/field/SelectTrigger.tsx` · `SelectTrigger.css` · `src/deck/SwipeDeck.tsx` · `SwipeDeck.css` · `src/list/ListGroup.tsx` · `ListRow.tsx` · `InfoRow.tsx` · `List.css` · `InfoRow.css` · `src/divider/DividerWithLabel.tsx` · `DividerWithLabel.css` · `src/link/TextLink.tsx` · `TextLink.css` |
| `packages/ui` context | `src/layout/ScrollContainerContext.tsx` |
| `packages/ui` 테스트 | `src/field/__tests__/SelectTrigger.test.tsx` · `src/deck/__tests__/SwipeDeck.test.tsx` · `src/list/__tests__/List.test.tsx` · `src/divider/__tests__/DividerWithLabel.test.tsx` · `src/link/__tests__/TextLink.test.tsx` · `src/hooks/__tests__/useScrolledPast.test.tsx` |
| dev gallery | `apps/web/src/dev/ui-gallery/Stage2Section.tsx` |
| baseline | `e2e/__screenshots__/darwin/visual.spec.ts/s2-{selecttrigger,deck,listrow,inforow,dividerlabel,textlink}.png` |

### 수정

| 파일 | 내용 |
|---|---|
| `packages/design-tokens/src/component/index.css` | Tier 3 토큰 4종 추가 (48 → 52) |
| `packages/design-tokens/__tests__/token-tiers.test.ts` | Tier 3 목록 52 로 갱신 |
| `packages/design-tokens/__tests__/fonts.test.ts` | 빌드 manifest 의 component 토큰 수 48 → 52 |
| `packages/ui/src/index.ts` · `styles.css` | 6종 + context export, CSS import 5개 추가 (22 → 28종) |
| `packages/ui/src/field/TextField.tsx` · `TextField.css` | D-14 밑줄 제거 + `P-17` 주석 + `trailingAction.pressed`(`aria-pressed`) |
| `packages/ui/src/hooks/useScrolledPast.ts` | D-13 — 컨테이너 구독 + boolean snapshot |
| `packages/ui/src/icon/registry.ts` | Lucide `clock` · `list-checks` · `external-link` 추가 (14 → 17) |
| `packages/ui/src/lib/devWarn.ts` | `missing-external-hint` 경고 문구 추가 (고정 문구 원칙 유지) |
| `packages/ui/src/styles/__tests__/provisional-markers.test.ts` | 대기 6건 + `P-17` 위치 검사 |
| `apps/web/src/app/layouts/AppShell.tsx` | 뷰포트 ref → `ScrollContainerProvider` (구조·클래스 변경 없음) |
| `apps/web/src/app/layouts/__tests__/layouts.test.tsx` | D-13 통합 테스트 1건 추가 |
| `apps/web/src/dev/ui-gallery/{ComponentsPage,TokensPage,gallery-copy,provisionalItems}.ts(x)` | Stage 2 섹션 연결 · 가값 상태 표 · 문구 |
| `apps/web/src/dev/__tests__/gallery-helpers.test.ts` | P-17 포함 17건 · 확정/대기 분포 검사 |
| `playwright.config.ts` · `e2e/visual.spec.ts` · `e2e/responsive.spec.ts` | D-12 임계값 2종 + `s2-*` baseline 6건 |
| `e2e/__screenshots__/darwin/visual.spec.ts/v5-field.png` | D-14 밑줄 제거 반영 (의도된 재생성) |

`apps/api/` · `supabase/` 미생성 유지. `@haru/contracts` 는 이 Step 에서 수정하지 않았다.

---

## 7. 검증 명령과 결과 (공통 7종)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | PASS (config · design-tokens · contracts · ui · web + e2e tsconfig) |
| `pnpm lint` | PASS (0 problems) — jsx-a11y 규칙을 끄지 않고 통과 |
| `pnpm test` | PASS — **74 files / 604 tests** (이전 68 / 560, 회귀 0) |
| `pnpm lint:boundaries` | PASS — `no dependency violations (298 modules, 806 dependencies)` |
| `pnpm build` | PASS — `component 52` 토큰, web `vite build` 성공 |
| `pnpm format:check` | PASS |
| `pnpm test:e2e` | PASS — **64 passed** (이전 58). baseline 33 files |

추가 grep 증거 (`packages/ui/src`):

| 검사 | 결과 |
|---|---|
| HEX / `rgb()` | **0건** (테스트 제외 전체) |
| `@haru/contracts` import | **0건** |
| Tier 1 `--haru-*` 직접 참조 | **0건** (주석 2건뿐 — Tag.css · TabCenterHome.tsx) |
| 신규 CSS 의 `overflow` / `scroll-snap` 선언 | **0건** |
| 신규 `any` / `@ts-ignore` | **0건** |

---

## 8. Mock 시나리오

이 Step 은 Mock Adapter 를 만들지 않는다 (`packages/ui` 는 도메인·API 를 모른다). Stage 2 시나리오 17 key 는 `2-AUTH` 이후 Step 소관이다.

---

## 9. `BACKEND_INTEGRATION_PENDING` 예상 항목

이 Step 에서 **신규 발생 0건** — Shared UI 는 서버 의존이 없다. 기존 `P2-BIP-01 … 10` (Plan §10) 은 그대로 유효하다.

---

## 10. Scope 경계에서 보류한 항목

| 항목 | 사유 |
|---|---|
| 화면 · route · feature · Mock Adapter | 후속 Step (`2-AUTH` ~ `2-HOME`) |
| `CapabilityDiamondChart` · `PersonaCard` | **Stage 2-B** (디자이너 Figma 대기) |
| `TextArea` · `StarRating` · `StatTile` · `Carousel` · `Toggle` · `SectionHeader` | Stage 3 · 5 (D-8 제외 목록) |
| `SelectTrigger` pill variant | Stage 7 `31:118` 재검토 (`AD-S2-6`) |
| `ListRow` `media` · `meta` 슬롯 | Stage 3 (표지 이미지) |
| AC-2-61 e2e 스크롤 테스트 | dev gallery 는 `AppShell` 을 쓰지 않는다 → 실제 스크롤 화면이 생기는 Step 에서 수행 |
| `SectionLabel` · `WizardProgress` · `ConsentRow` · `SocialAuthButton` | Design Spec §4.7 — 컴포넌트를 만들지 않고 조합 / feature 소유 |

---

## 11. 발견한 문제

### Blocking
없음.

### Non-blocking (후속 Step·QA 판단 필요)

| # | 내용 | 제안 |
|---|---|---|
| N-1 | **SwipeDeck 카드 내부 padding 을 `--space-5`(20) 로 정했다.** Design Spec §4.2 에 카드 내부 padding 실측값이 없다 (`RECOMMENDED`). 설문 카드 Figma 실측(`179:1784–1787`)과 다르면 `2-ONBOARDING` 에서 토큰 1개로 조정하면 된다 | design-agent 확인 |
| N-2 | **`ListGroup` 이 좌우 여백(16)을 갖고 `ListRow` 는 세로 여백만 갖는다.** Design Spec §4.3 은 두 곳 모두 `--space-4` 로 적어 그대로 따르면 총 32 가 된다. Figma 실측 "행 내부 좌우 16" 에 맞추기 위해 그룹에만 두었고, 구분선은 카드 좌우 16 안쪽에서 그어진다 | design-agent 확인 |
| N-3 | **덱 컨테이너에 `tabIndex` 를 두지 않았다** (§4 주의 참조). `controls="none"` 으로 쓰는 화면은 동등한 버튼을 반드시 제공해야 한다 | `2-ONBOARDING` 구현 시 TopBar 버튼 필수 |
| N-4 | `2-CONTRACTS` 의 **N-3**(관찰 역량 1개 → 강점·growing edge 둘 다 빈 배열)에 대해, 이 Step 의 컴포넌트는 **0개 상태를 렌더할 수 있다**: `ListGroup` 행 0개 · `SwipeDeck` items 0개 모두 테스트로 확인했다. 빈 목록에 표시할 문구·`EmptyState` 선택은 화면 Step 의 몫이다 | 정보 전달 |
| N-5 | `SelectTrigger` 트리거는 `role=button` 이라 `aria-invalid` 를 붙일 수 없다 (jsx-a11y `role-supports-aria-props`). 에러는 `aria-describedby` + 메시지 + 하단 경계선으로 3중 표시한다 | 정보 전달 |

### NEEDS_DECISION
없음. (`P-17` 은 디자이너 결정 대기 항목으로 등록만 하며 이 Step 의 진행을 막지 않는다.)

---

## 12. 다음 Step 인계 (`2-AUTH`)

- `@haru/ui` 에서 `SelectTrigger` · `SwipeDeck` · `ListGroup` · `ListRow` · `InfoRow` · `DividerWithLabel` · `TextLink` 를 바로 import 할 수 있다 (28종).
- 문구는 전부 prop 이다 — `packages/ui` 는 copy 를 갖지 않는다. feature copy 모듈에서 주입한다.
- `TextLink external` 은 `externalHint` 를 반드시 넘긴다 (미지정 시 dev 경고).
- `SwipeDeck` 은 `statusLabel` 로 "Question n of 10" 같은 진행 알림을 받는다 (aria-live).
- 새 화면을 만들 때 `AppColumn` 안쪽에 `overflow-*` 를 선언하지 않는다 — 구조 테스트 3건 + `e2e/shadow.spec.ts` 가 계속 감시한다.
- 새 영역 클립 baseline 은 `REGION_SNAPSHOT`, 전체 프레임은 `FRAME_SNAPSHOT` 을 쓴다 (`playwright.config.ts`).
