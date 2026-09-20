# Stage 1-D1 Handoff — `packages/ui` 최초 생성 + Shared UI 8종

Status: IMPLEMENTED (2026-09-20, development-agent) — stage-qa-agent 검증 대기
Scope: Stage 1 Design Spec §4.4(Button + ButtonGroup) · §4.5(IconButton) · §4.13(TextField + FieldGroup) · §4.14(Checkbox + CheckboxGroup) · §4.15(Tag) · §4.16(Chip) · §4.17(RadioGroup) · §4.18(ProgressBar) + §3.3 Tier 3 토큰 소비 · §9.3 focus ring / 터치 타깃 · §11 인계 메모 3
근거 문서: `docs/plans/stage-1-plan.md` (APPROVED 2026-09-18) §9.3 · §5.1 · §11.4 · §16.1 · `docs/design/stage-1-design-spec.md` (APPROVED) · `docs/COMPONENT_MAP.md` · `docs/DESIGN_TOKEN_MAP.md` · `.claude/rules/frontend.md` §6·§9 · `.claude/rules/architecture.md` §2

> **Stage 1-D2 이후(나머지 Shared UI · Dev UI Gallery · `apps/web` · router · mock layer)는 시작하지 않았다.**
> Stage 1-A(툴체인) · 1-B(design-tokens) · 1-C(contracts) 산출물은 아래 §6 F-1(경계 규칙 오탐 보정) 한 건과
> 유예 항목이던 루트 eslint react 연결(§3 "수정") 외에는 변경하지 않았다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` = `APPROVED` | 충족 (2026-09-18, user) |
| `docs/design/stage-1-design-spec.md` = `APPROVED` | 충족 (2026-09-18, user) |
| 이전 Stage QA PASS | Stage 1은 Stage 0 사용자 승인으로 대체. Stage 1-A/1-B/1-C 산출물은 회귀 없이 통과(§4) |
| Plan이 PRD / Figma와 모순되지 않음 | 모순 없음. Figma 없는 상태(focus·loading·error 등)는 #22 승인 범위의 명세 선구현 |
| In Scope에 Backend 구현 없음 | 없음. `apps/api/` · `supabase/` 미생성 확인(§4) |

구현 범위는 사용자가 2026-09-20 확정한 **8종**이다. 사용자 목록의 Textarea(Stage 5) · Select/SelectTrigger(Stage 2) · Avatar(Figma·Spec 모두 없음)는 Stage 1 범위 밖으로 확정되어 구현하지 않았다.

---

## 2. 구현한 컴포넌트와 variant / state

| # | 컴포넌트 | Design Spec | variant | state |
|---|---|---|---|---|
| 1 | **Button** | §4.4 | `variant` accent·glass / `size` md(45)·lg(56) / `fullWidth` | rest · hover · pressed · disabled · focus · loading |
| 2 | **ButtonGroup** | §4.4 | `layout` inline·stacked (+360px 미만 자동 stacked) | — (배치 전용, 자체 스타일 없음) |
| 3 | **IconButton** | §4.5 | `variant` glass·plain | rest · hover · pressed · disabled · focus · loading |
| 4 | **FieldGroup** | §4.13 | — | rest · error(그룹 메시지) |
| 5 | **TextField** | §4.13 | `type` text·email·password·tel·url·search·number / trailingAction / trailingAccessory | rest · focus · filled · error · disabled · readOnly |
| 6 | **Checkbox** | §4.14 | — | unchecked · checked · indeterminate · error · disabled · focus |
| 7 | **CheckboxGroup** | §4.14 | — | rest · error · required |
| 8 | **RadioGroup** | §4.17 | `variant` card·list / `options[].variant` default·muted | 행: rest · hover · pressed · selected · disabled · focus / 그룹: error |
| 9 | **Chip** | §4.16 | `variant` filled·outline·glass | rest · hover · pressed · selected · disabled · focus |
| 10 | **Tag** | §4.15 | `tone` agency·emotion·flexibility·motivation·neutral / `size` sm(26)·xs(19) | 없음 (표시 전용) |
| 11 | **ProgressBar** | §4.18 | `tone` accent·neutral / `size` sm(6)·md(8) | determinate · indeterminate |

(8종 = Design Spec 항목 기준. 부속 컴포넌트 ButtonGroup · FieldGroup · CheckboxGroup 포함 시 11 파일.)

Design Spec에 없는 variant·state는 추가하지 않았다. 보류 항목은 §7.

---

## 3. 생성 / 수정 파일

### `packages/ui` (신규 패키지 — `@haru/ui`)

```
packages/ui/package.json            deps: @haru/design-tokens / peer+dev: react·react-dom 19.3.0
packages/ui/tsconfig.json           @haru/config/tsconfig/react.json 확장
packages/ui/vitest.config.ts        jsdom(D-9) + setupFiles
packages/ui/src/index.ts            공개 진입점 (컴포넌트 + 타입 export)
packages/ui/src/styles.css          스타일 진입점 (`@haru/ui/styles.css`)
packages/ui/src/styles/base.css     focus ring(§9.3) · visually-hidden
packages/ui/src/lib/cx.ts           내부 className 결합 헬퍼
packages/ui/src/test/setup.ts       Testing Library cleanup 등록
packages/ui/src/button/     Button.tsx/.css  ButtonGroup.tsx/.css  IconButton.tsx/.css
packages/ui/src/field/      TextField.tsx/.css  FieldGroup.tsx/.css  Checkbox.tsx/.css
                            CheckboxGroup.tsx/.css  RadioGroup.tsx/.css
packages/ui/src/tag/        Tag.tsx/.css
packages/ui/src/chip/       Chip.tsx/.css
packages/ui/src/progress/   ProgressBar.tsx/.css
packages/ui/src/**/__tests__/  Button · IconButton · IconButton.hit-area · TextField
                               Checkbox · RadioGroup · Chip · Tag · ProgressBar  (9 파일)
```

Plan §9.3 트리에서 **이번 8종에 해당하는 디렉토리만** 만들었다 (`text/` `icon/` `surface/` `top-bar/` `layout/` `tab-bar/` `feedback/` `bubble/` `sheet/` `dialog/` `hooks/` 미생성).

### 수정 (기존 산출물)

| 파일 | 변경 | 이유 |
|---|---|---|
| `eslint.config.js` | `@haru/config/eslint/react` 연결 (glob `packages/ui/**/*.{ts,tsx}` · `apps/web/**/*.{ts,tsx}`) | Stage 1-A/1-B가 "packages/ui 생성 시 연결"로 유예한 항목. react-hooks · jsx-a11y 규칙 실제 발화 확인(§5) |
| `.dependency-cruiser.cjs` | `ui-only-design-tokens` 의 `from.pathNot` 에 `UI_NON_RUNTIME` 추가 | `packages/ui/vitest.config.ts` → `@haru/config` 오탐 보정. Stage 1-C가 contracts에 적용한 것과 동일한 패턴이며 규칙의 의도·적용 대상은 변경되지 않았다. **도메인 규칙 `no-ui-to-contracts` 는 제외하지 않았다**(테스트 포함 전면 금지 유지) |
| `pnpm-lock.yaml` | react 19.3.0 · react-dom 19.3.0 · @types/react(-dom) 19.3.0 · @testing-library/react 16.3.3 · @testing-library/dom 10.4.2 · jsdom 30.1.0 추가 | §16.1 D-10 승인 버전 |

### 명시적 비생성

- `apps/`, `supabase/`, `apps/api/` — 없음 (`ls` 확인, §4)
- `lucide-react`, `sharp`, `tailwindcss` — 설치하지 않음 (이번 8종에 아이콘 라이브러리 불필요, 지시사항)
- Storybook · Dev UI Gallery(`/__dev/ui`) · 나머지 Shared UI 14종 — 미생성

---

## 4. 실행한 검증 명령과 결과

| 명령 | 결과 |
|---|---|
| `pnpm install` | OK — Node v24.21.0 preinstall 가드 통과. peer 경고는 기존 `eslint-plugin-jsx-a11y`(S1A-2 기록) 1건뿐 |
| `pnpm typecheck` | **PASS** — root + config · contracts · design-tokens · **ui** 4패키지 |
| `pnpm lint` | **PASS** — 0 error (react-hooks · jsx-a11y 적용 상태) |
| `pnpm test` | **PASS** — 21 files / **211 tests** (Stage 1-A/B/C 166 + Stage 1-D1 45) |
| `pnpm --filter @haru/ui test` | **PASS** — 9 files / 45 tests |
| `pnpm lint:boundaries` | **PASS** — 0 violations (93 modules, 173 dependencies) |
| `pnpm build` | **PASS** — design-tokens 재빌드 정상 (primitive 65 · semantic 192 · component 48 · provisional 71) |
| `pnpm format:check` | **PASS** — all files |
| `ls apps supabase` | **없음** (Scope 확인) |
| 토큰 존재 검증(스크립트) | `packages/ui/src/**/*.css` 가 참조하는 CSS 변수 104개 전부 design-tokens 산출물에 정의됨 (미정의 0) |
| HEX / rgb() 리터럴 grep | `packages/ui/src` **0건** |
| `@haru/contracts` import grep | `packages/ui` **0건** |
| Vite 8.3.0 CSS 번들 시험 | `src/styles.css` → 36.6 kB, `@import '@haru/design-tokens/component.css'` 포함 전부 인라인 해소, 미해결 `@import` 0건 |

Playwright 시각 비교 · 터치 타깃 픽셀 측정(AC-1-21·AC-1-23·AC-1-24)은 `apps/web` 과 Playwright 설치 전이므로 이 단계에서 `NOT VERIFIED` 다.

---

## 5. Stage 1-A/1-B 미검증 항목의 실검증 (이번 단계에서 가능해진 것)

### 5.1 루트 eslint ↔ React 규칙 (음성 테스트)

임시 파일 `packages/ui/src/__negative__.tsx` 주입 → 4건 발화 확인 → 삭제.

```
react-hooks/rules-of-hooks                      조건부 useState
jsx-a11y/click-events-have-key-events           onClick 만 있는 div
jsx-a11y/no-static-element-interactions          동일
jsx-a11y/alt-text                                alt 없는 img
```

### 5.2 `no-ui-to-contracts` · `ui-only-design-tokens` (음성 테스트)

`packages/ui` 가 없어 Stage 1-A 이후 검증하지 못하던 규칙 2종을 실제로 발화시켰다.

| 시험 | 방법 | 결과 |
|---|---|---|
| `ui-only-design-tokens` | `packages/ui/src/__boundary_negative2__.ts` 가 `@haru/config/vitest/base` import | **error 발화** |
| `no-ui-to-contracts` | `packages/ui/node_modules/@haru/contracts` 임시 심볼릭 링크 + `@haru/contracts` import 파일 | **error 발화** (`packages/ui/src/… → packages/contracts/src/index.ts`) |
| 미설치 상태의 contracts import | 링크 없이 import | `not-to-unresolvable` 이 먼저 잡는다 (Stage 1-C F-2와 동일) |

임시 파일과 심볼릭 링크는 모두 삭제했고, 이후 `pnpm lint:boundaries` = 0 violations 다.

---

## 6. 발견 사항

### F-1 (Medium, 수정 완료) — `ui-only-design-tokens` 가 패키지 자체 툴체인 설정을 오탐

`packages/ui/vitest.config.ts` 가 공통 설정 `@haru/config/vitest/base` 를 import 하는 것은 정상인데 규칙이 violation으로 잡았다.
Stage 1-C가 `contracts-*` 규칙에 적용한 것과 같은 방식으로 `UI_NON_RUNTIME`(테스트 파일 · 패키지 루트 `*.config|setup.*` · `src/test/`)을 `from.pathNot` 에 추가했다. `no-ui-to-contracts` 에는 적용하지 않았다.

### F-2 (Medium, NEEDS_DECISION) — Tag `neutral` tone 에 대응하는 semantic 토큰이 없다

Design Spec §4.15는 neutral 배경을 **Tier 1** `--haru-dusk-200` 으로 지정한다. Tier 2에 대응 토큰이 없어(`--color-bg-app-end` 가 같은 값이지만 의미가 다르다) 명세 값을 그대로 썼다.
`packages/ui` 가 참조하는 **유일한 Tier 1 토큰**이다. 후속 결정 필요: ① semantic 토큰 신설(예: `--color-tag-neutral-bg`) ② 현행 유지. 결정 주체는 design-agent(신규 토큰 요청 절차, rules/frontend.md §6).

### F-3 (Low, 정보) — Design Spec `IconButton.size` prop 의 값이 정의되어 있지 않다

§4.5 props 목록에 `size` 가 있으나 치수 표는 38×38 하나만 정의한다. 추측으로 크기 단계를 만들지 않고 **`size` prop 을 구현하지 않았다**. 필요해지면 Design Spec에 단계 값을 추가한 뒤 구현한다.

### F-4 (Low, 정보) — Button `loading` 인디케이터는 임시 구현이다

§4.4는 loading 시 중앙 `Spinner`(§4.9) 표시를 요구하지만 Spinner는 Stage 1-D2 범위다. `Button.css` · `IconButton.css` 안에 `--animate-spinner` 토큰을 쓰는 내부 인디케이터(`.haru-button__indicator` / `.haru-icon-button__indicator`)를 두었다. **Stage 1-D2에서 공유 `Spinner` 로 교체**한다.

### F-5 (Low, 정보) — `--button-padding-y-md` 미사용

Button 높이를 Figma 대로 `block-size`(45/56)로 고정했기 때문에 세로 padding 토큰을 사용하지 않는다. 토큰 정의(Stage 1-B)는 그대로 두었다.

### F-6 (Low, 정보) — 하위 단계 명칭 불일치

`docs/qa/stage-1c-handoff.md` 머리말은 "Stage 1-D1 = `shared/api` · `MockHealthApi` · `apps/web`" 으로 적고 있으나, 사용자가 2026-09-20 확정한 Stage 1-D1은 **Shared UI 8종**이다. 문서 갱신은 plan-agent 소관이므로 기록만 남긴다.

### F-7 (Low, 정보) — jsdom 의 키보드/disabled 한계

jsdom은 레이아웃을 계산하지 않고, 프로그래밍 방식 click 을 disabled 폼 컨트롤에도 전달하며, radio 화살표 키 이동의 기본 동작을 구현하지 않는다. 따라서 단위 테스트는 **semantic**(native 요소·`disabled`·`name` 그룹·포커스 가능 여부)을 검증하고, 실제 키보드 활성화·터치 타깃 픽셀 검증은 Playwright(AC-1-20·AC-1-21)로 넘긴다.

---

## 7. Design Spec 대비 차이 · Scope 경계에서 보류한 항목

| 항목 | 처리 |
|---|---|
| `Spinner`(§4.9) | 미구현(1-D2). Button/IconButton 내부 임시 인디케이터로 대체 — F-4 |
| `Icon`(§4.2) · `lucide-react` | 미구현·미설치. IconButton은 아이콘을 `ReactNode` prop 으로 받는다 |
| `Text`(§4.1) | 미구현. 각 컴포넌트가 자체 CSS로 타이포 토큰을 적용한다. 1-D2에서 Text 도입 시 중복 제거 검토 |
| `IconButton.size` | 미구현 — F-3 |
| RadioGroup `legend`, CheckboxGroup `legend` | Design Spec props 목록에는 없으나 `<fieldset>/<legend>` 접근성 요구(§4.14·§4.17)를 만족시키기 위해 **필수 prop** 으로 추가 |
| Chip `leadingIcon` + `selected` 동시 사용 | 선택 시 check 아이콘이 leadingIcon 자리를 대체한다 (§4.16 "선택 시 leading check") |
| Tag `Boy/Girl/Not selected` | Tag로 구현하지 않음 (SelectTrigger = Stage 2) |
| RadioGroup 비채점 옵션 시각 구분 | `options[].variant: 'muted'` 슬롯만 열어둠. 시각 확정은 Stage 2 (§4.17) |
| 화면 컨텍스트(§5 공통 상태 6종) · `/__dev/ui` gallery | Stage 1-D2 / 1-G |

---

## 8. 스타일링 방식 결정 (되돌리기 어려운 결정 — 사용자 확인 대상)

**결정: `packages/ui` 는 Tailwind 유틸리티가 아니라 컴포넌트 CSS + `var(--token)` 으로 구현한다.**

근거:

1. **승인 문서가 이미 이 방향을 전제한다.** Design Spec §3.3은 Tier 3 component 토큰을 "`packages/ui` 내부 전용"으로 두고 §3.4·§11-2는 이를 **`@theme` 에 넣지 않는다**고 못박는다. 즉 Tier 3 값은 Tailwind 유틸리티로 생성되지 않으므로 `var()` 참조가 유일한 소비 경로다.
2. Stage 1-B 산출물 `packages/design-tokens/src/semantic/color.css` 주석이 이미 *"packages/ui 가 utility 뿐 아니라 CSS 의 `var(--color-*)` 로도 참조하므로 `@theme static` 으로 둔다"* 고 기록하고 있다.
3. `tailwindcss` 가 아직 설치되어 있지 않고 `apps/web` 도 없다. 이 방식이면 `packages/ui` 가 **Tailwind 없이도 독립적으로 typecheck·test·CSS 번들 검증**된다 (§4의 Vite CSS 번들 시험).
4. Tailwind 도입(Stage 1-E, `apps/web`) 이후에도 화면 코드는 `@theme` semantic 유틸리티를, `packages/ui` 는 컴포넌트 CSS를 쓰는 2층 구조가 그대로 성립한다. 되돌릴 필요가 없다.

규칙:

- 소비자는 `@haru/design-tokens`(Tier 1·2 + `@theme`/`@utility`) → `@haru/ui/styles.css` 순으로 import 한다. Tier 3은 `styles.css` 가 직접 가져오므로 화면 코드가 Tier 3에 접근하지 않는다.
- 클래스 네이밍은 `haru-<component>[__part][--modifier]`. 외부에서 `className`·`style` 을 주입할 수 없도록 두 prop 을 타입에서 제거했다.
- 색·간격·radius·타이포·그림자·모션 토큰은 **100% design-tokens 참조**(임의 HEX/rgb 0건, 미정의 토큰 0건).
- 토큰이 없는 값으로 남은 리터럴은 아래가 전부이며 모두 Design Spec 규격값 또는 표준 관용구다. 각 위치에 주석을 달았다.

| 리터럴 | 위치 | 근거 |
|---|---|---|
| `1px` / `1.5px` / `2px` 경계선 | FieldGroup 구분선·error ring, TextField error 경계, Checkbox·RadioGroup 원/박스 경계, Chip outline, Checkbox indeterminate dash | Design Spec §4.13·§4.14·§4.16·§4.17 (hairline 토큰 없음) |
| `12px` | Chip 선택 check 아이콘 | §4.16 "check 아이콘(12px)" — 아이콘 3단계(16/20/24)에 없는 전용 값 |
| `-1px` / `1px` / `scale(.97)` | Button·IconButton·Chip·RadioGroup hover/press transform | §9.1 모션 규격값 |
| `360px` | ButtonGroup 자동 stack container query | §4.4 "가로 폭 부족(<360px)" |
| `1px`(visually-hidden) · `blur(1px)`(`@supports` 탐지) | base.css, glass fallback | 표준 관용구 |

---

## 9. 접근성 처리 요약

| 컴포넌트 | 처리 |
|---|---|
| 공통 | `:focus-visible` 에서만 `outline: var(--focus-ring-width) solid var(--color-focus-ring)` + `outline-offset`(§9.3 P-03). hover는 `@media (hover: hover) and (pointer: fine)` 안에서만. `prefers-reduced-motion: reduce` 에서 transform 제거·무한 애니메이션 정지(§9.2, 전역 일괄 차단 없음). `prefers-reduced-transparency` · `@supports not (backdrop-filter)` 에서 불투명 fill 대체 |
| Button | native `<button type="button">`. disabled = native `disabled` + `aria-disabled`. loading = `aria-busy` + **포커스 유지**(native disabled 미사용) + 라벨 폭 유지. 장식 아이콘 `aria-hidden` |
| IconButton | `label` **필수**(타입상 optional 아님) → `aria-label`. 시각 38 / hit area 44 를 `::before { inset: calc((38-44)/2) }` 로 분리 |
| TextField | `<label for>` ↔ input 연결(placeholder를 라벨로 쓰지 않음), `aria-invalid` · `aria-describedby`(error + helper), `aria-required`, `autoComplete`/`inputMode` 전달, error = 경계색 + 아이콘 + 텍스트 3중, trailingAction hit area 44 |
| FieldGroup / CheckboxGroup / RadioGroup | 그룹 에러는 `role="alert"`. Checkbox/Radio 그룹은 `<fieldset>` + `<legend>` |
| Checkbox | native `<input type="checkbox">` + `appearance: none` 시각 대체. `<label>` 로 감싸 라벨·설명 전체가 클릭 영역, 행 최소 높이 44. `indeterminate` 는 DOM 속성으로 설정(→ `aria-checked="mixed"`). 체크 형태(SVG)로 색 외 상태 전달 |
| RadioGroup | 같은 `name` 의 native `<input type="radio">` → 브라우저 화살표 키 이동·roving focus 사용(자체 tabindex 관리 없음). 행 최소 높이 44, 선택은 배경색 + 원 채움 이중 표시, 행 포커스는 `:has(:focus-visible)` |
| Chip | `<button aria-pressed>`, 선택 시 check 아이콘 병행(WCAG 1.4.1), 세로 hit slop 으로 터치 타깃 44 |
| Tag | 비인터랙티브 `<span>`(tabindex·핸들러 없음), 라벨 텍스트 항상 렌더(색 단독 전달 금지), xs 라벨 최소 11px |
| ProgressBar | `role="progressbar"` + `aria-label` + `aria-valuenow/min/max`, indeterminate는 `aria-valuenow` 생략, `showValue` 로 값 텍스트 병기 |

무의미한 ARIA는 추가하지 않았다(native semantic 우선, role 중복 없음).

---

## 10. 테스트 (45건 / 9 파일)

| 파일 | 검증 내용 |
|---|---|
| `button/__tests__/Button.test.tsx` | 접근성 이름·`type` · onPress 호출 · disabled semantics와 미호출 · loading(aria-busy · 포커스 유지 · 누름 무시) · 장식 아이콘 `aria-hidden` / ButtonGroup DOM 순서·secondary 생략 |
| `button/__tests__/IconButton.test.tsx` | `label` → 접근성 이름 · 아이콘 `aria-hidden` · onPress · disabled 미호출 |
| `button/__tests__/IconButton.hit-area.test.tsx` | (node 환경) 시각 크기 토큰 유지 + `::before` hit area 계산식이 `--icon-button-hit-size` 기반인지 |
| `field/__tests__/TextField.test.tsx` | label↔input 연결 · 입력 값 전달 · `aria-invalid`+에러 메시지 연결 · helper/error 동시 연결 · disabled(입력·trailingAction) · required |
| `field/__tests__/Checkbox.test.tsx` | native checkbox · 라벨 클릭 토글 · checked 반영·해제 · 포커스 도달(tabindex 미조작) · indeterminate · 에러 연결 · disabled / CheckboxGroup legend·그룹 에러 |
| `field/__tests__/RadioGroup.test.tsx` | legend 그룹 이름 · 옵션 수 · 동일 `name` 그룹(화살표 키 전제)·tabindex 미조작·포커스 · 선택 반영 · 라벨 클릭 선택 · 옵션/그룹 disabled · 그룹 에러 |
| `chip/__tests__/Chip.test.tsx` | `aria-pressed` · 토글 값 전달 · 선택 시 check 아이콘 표시 · disabled |
| `tag/__tests__/Tag.test.tsx` | 라벨 텍스트 렌더 · **비인터랙티브**(button role 없음·tabindex 없음) · 장식 아이콘 `aria-hidden` |
| `progress/__tests__/ProgressBar.test.tsx` | value semantics · 범위 clamp · indeterminate `aria-valuenow` 생략 · 값 텍스트 · fill 폭이 custom property 로 전달 |

컴포넌트별 개수를 맞추지 않고 동작·접근성 기준으로 작성했다.

---

## 11. `BACKEND_INTEGRATION_PENDING` 예상 항목

이번 단계에는 **없다.** `packages/ui` 는 도메인·서버 의존이 없는 순수 UI 레이어이며 contracts·API·Mock 을 참조하지 않는다.

---

## 12. stage-qa-agent 참고

- 재현 명령: `pnpm install` → `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm lint:boundaries` → `pnpm build` → `pnpm format:check`
- 시각 비교(AC-1-24) · 터치 타깃 측정(AC-1-21) · 키보드 순회(AC-1-20) · 반응형(AC-1-23) · reduced-motion(AC-1-22)은 `apps/web` + Playwright 이후에 가능하므로 현재는 `NOT VERIFIED` 가 맞다.
- AC-1-18(Shared UI 22종)은 이번 단계에서 8종만 구현되었으므로 `PARTIAL` 이 정상이다. 나머지는 Stage 1-D2 이후.
- 가값(provisional) 주석은 토큰 정의(`packages/design-tokens`)가 기준이며, `packages/ui` CSS 의 해당 사용처에도 `provisional: P-xx` / `accepted deviation: D-01` 주석을 달아 두었다.
