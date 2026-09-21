# Stage 1-D2 Handoff — Shared UI 나머지 14종 + 1-D1 이월 4건

Status: IMPLEMENTED (2026-09-20, development-agent) — stage-qa-agent 검증 대기
Scope: Stage 1 Design Spec §4.1(Text) · §4.2·§8(Icon + HARU SVG) · §4.3(Surface + AppBackground) · §6.1(TopBar) · §2.4(AppColumn) · §6.2(BottomTabBar) · §4.9(Spinner + Skeleton) · §4.10(ErrorState + EmptyState) · §4.11(InlineAlert) · §4.12(Toast + ToastProvider) · §4.19(PageIndicator) · §4.20(SpeechBubble) · §4.21(Sheet + Scrim) · §4.22(Dialog + ConfirmDialog) + 이월 `S1-D1-1`~`S1-D1-4`
근거 문서: `docs/workflow/stage-1/stage-1-D2.md` · `docs/plans/stage-1-plan.md` (APPROVED) §9.3·§11.4·§16 · `docs/design/stage-1-design-spec.md` (APPROVED) · `docs/decisions/stage-1-approvals.md` §6·§7 · `docs/qa/stage-1d1-handoff.md` · `.claude/rules/frontend.md` §6·§9

> **Dev UI Gallery(1-G) · Scenario Panel · Playwright · `apps/web` 는 시작하지 않았다.**
> Stage 1-A/1-B/1-C/1-D1 산출물 중 변경한 것은 §3.2 표에 적은 것뿐이다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| `docs/plans/stage-1-plan.md` = `APPROVED` | 충족 (2026-09-18, user) |
| `docs/design/stage-1-design-spec.md` = `APPROVED` | 충족 (2026-09-18, user) |
| 이전 단계 산출물 회귀 없음 | 충족 — 루트 테스트 211 → **285** (감소 없음, §4) |
| 이월 4건의 선행 결정 존재 | 충족 — `S1-D1-1`·`S1-D1-2` 는 approvals §7 사용자 결정, `S1-D1-3`·`S1-D1-4` 는 1-D1 handoff §6 |
| Plan이 PRD / Figma와 모순되지 않음 | 모순 없음. Figma 없는 컴포넌트(Spinner/Skeleton/State/InlineAlert/Toast/Dialog)는 결정 #22 승인 범위의 명세 선구현 |
| In Scope에 Backend 구현 없음 | 없음. `apps/`, `supabase/` 미생성 확인(§4) |

---

## 2. 구현 결과

### 2.1 Design Spec §4.23 22종 — 전수 존재

| # | 컴포넌트 (+부속) | 위치 | 단계 |
|---|---|---|---|
| 1 | **Text** | `text/Text.tsx` | 1-D2 |
| 2 | **Icon** (+ HARU SVG 1종) | `icon/Icon.tsx` · `icon/registry.ts` · `icon/haru/*` | 1-D2 |
| 3 | **Surface + AppBackground** | `surface/` | 1-D2 |
| 4 | Button + ButtonGroup | `button/` | 1-D1 (이번에 Spinner 연결) |
| 5 | IconButton | `button/IconButton.tsx` | 1-D1 (이번에 `size` · Spinner) |
| 6 | **TopBar** | `top-bar/TopBar.tsx` | 1-D2 |
| 7 | **AppColumn** | `layout/AppColumn.tsx` | 1-D2 |
| 8 | **BottomTabBar** | `tab-bar/BottomTabBar.tsx` | 1-D2 |
| 9 | **Spinner + Skeleton** | `feedback/` | 1-D2 |
| 10 | **ErrorState + EmptyState** | `feedback/` | 1-D2 |
| 11 | **InlineAlert** | `feedback/InlineAlert.tsx` | 1-D2 |
| 12 | **Toast + ToastProvider** (`useToast`) | `feedback/` | 1-D2 |
| 13 | TextField + FieldGroup | `field/` | 1-D1 |
| 14 | Checkbox + CheckboxGroup | `field/` | 1-D1 |
| 15 | Tag | `tag/Tag.tsx` | 1-D1 (이번에 neutral 토큰 교체) |
| 16 | Chip | `chip/Chip.tsx` | 1-D1 |
| 17 | RadioGroup | `field/RadioGroup.tsx` | 1-D1 |
| 18 | ProgressBar | `progress/ProgressBar.tsx` | 1-D1 (이번에 변수 개명) |
| 19 | **PageIndicator** | `progress/PageIndicator.tsx` | 1-D2 |
| 20 | **SpeechBubble** | `bubble/SpeechBubble.tsx` | 1-D2 |
| 21 | **Sheet + Scrim** | `sheet/` | 1-D2 |
| 22 | **Dialog + ConfirmDialog** | `dialog/` | 1-D2 |

variant / state 는 Design Spec 표를 그대로 구현했고, Spec 에 없는 variant·state 는 추가하지 않았다(§7).

### 2.2 이월 항목 4건 — 전부 해소

| ID | 처리 | 증거 |
|---|---|---|
| **S1-D1-1** Tag `neutral` 토큰 | `packages/design-tokens/src/semantic/color.css` 에 `--color-tag-neutral-bg: var(--haru-dusk-200)` 신설(색 값 불변), `Tag.css` 가 이것만 참조 | `packages/ui` → Tier 1 직접 참조 **0건** (§4 grep). `token-tiers.test.ts` 에 값·경로 테스트 추가 |
| **S1-D1-2** `IconButton.size` | `size?: 'md'` 유지, 치수는 §4.5 그대로(시각 38 · 아이콘 20 · hit area 44). `sm`/`lg` 미생성 | `IconButton.test.tsx` "has a single approved size value" |
| **S1-D1-3** loading 인디케이터 | Button · IconButton 의 임시 인디케이터 제거 → 공유 `Spinner size=sm decorative` 로 교체. 버튼이 `aria-busy` 를 가지므로 Spinner 는 `aria-hidden` | `Button.test.tsx` · `IconButton.test.tsx` 의 loading 인디케이터 테스트 |
| **S1-D1-4** 변수 개명 | `--haru-progress-fill-size` → `--progress-fill-size` (Tier 1 네임스페이스 침범 해소). CSS·TSX·테스트 3파일 동시 변경 | `ProgressBar.test.tsx` 스타일 assertion |

### 2.3 HARU 전용 SVG — 1건만 export

`packages/ui/src/icon/haru/tab-center-home.svg` (Figma `140:2971` = `140:2935` 원 + `140:2950` home 글리프).
§8.3 규격: viewBox `0 0 64 64` 유지 · 루트 `width`/`height` 제거 · 루트 `aria-hidden` 없음 · stroke round · 색은 **Figma 원본과 같은 값의 semantic 토큰**(`--color-action-primary-bg` ← `--haru-palette-teal` `#85bfb6`, `--color-fg-on-accent` ← `--haru-white`)을 `var()` 로 참조.
나머지 14 symbol 은 넣지 않았다(§11-6).

> **구조 결정**: `.svg` 를 React 컴포넌트로 바꾸는 번들러 플러그인(svgr 등)을 도입하지 않았다(미승인 의존). 대신 `.svg` 파일(에셋 원본)과 `TabCenterHome.tsx`(코드 대응본)를 두고, `icon/__tests__/haru-icons.test.tsx` 가 **viewBox·path 데이터·색 참조·루트 속성**을 비교해 두 파일의 drift 를 막는다. `packages/ui` 가 소스 그대로 소비되는 구조(`exports: "./src/index.ts"`)를 유지하기 위한 선택이다.

### 2.4 `lucide-react` 1.47.0

- `packages/ui/package.json` dependencies 에 **정확 버전 `1.47.0`**(range 기호 없음, D-2), lockfile 반영.
- 중복 설치 방지 override 는 **`pnpm-workspace.yaml` 의 `overrides`** 에 두었다. pnpm 12 는 `package.json` 의 `pnpm.overrides` 를 더 이상 읽지 않고 경고한다(`The "pnpm" field in package.json is no longer read`). D-2 의 의도(단일 버전 고정)는 그대로다.
- 아이콘은 전량 import 하지 않고 **명시 등록**(`icon/registry.ts`, Stage 1 대응표 14종)만 번들에 들어간다. 다음 Stage 아이콘은 그 Stage 에서 추가한다.
- **탭 아이콘 글리프는 확정하지 않았다** (§11-10): 현재 `library` = `book-open`, `progress` = `chart-column` (design-agent 권장안). 선택 근거 = Figma `25:35`/`25:46` 은 이름 없는 21px `Frame` 이라 이름 대응이 불가능하고, 권장안이 Design Spec §8.1 표의 1순위이기 때문이다. 대안 `library-big` / `trending-up` 으로의 교체는 §10.2 시각 비교(gallery 렌더 ↔ `25:87` 스크린샷) 후 결정한다.

---

## 3. 생성 / 수정 파일

### 3.1 신규 (`packages/ui/src`)

```
text/Text.tsx|.css                         §4.1  11 variant · 8 tone · weight override · as · align · truncate · numeric
icon/Icon.tsx|.css                         §4.2  label|decorative 유니온 · size 3단계 · tone
icon/registry.ts                           §8.1  Stage 1 Lucide 14종 명시 등록 + stroke 1.5
icon/haru/tab-center-home.svg              §8.2  Stage 1 유일 export
icon/haru/TabCenterHome.tsx                      .svg 의 코드 대응본 (테스트로 동기화 강제)
icon/haru/index.ts                         §8.3  이름 → 컴포넌트 매핑
surface/Surface.tsx|.css                   §4.3  material 4 · fill 7 · radius 6 · padding scale · interactive
surface/AppBackground.tsx|.css             §4.3  gradient|flat · aria-hidden · reduced-transparency/print 대체
layout/AppColumn.tsx|.css                  §2.4  320–480 · gutter · safe-area · edgeToEdge
top-bar/TopBar.tsx|.css                    §6.1  inline|centered|large|pill · sticky · 스크롤 시 glass
tab-bar/BottomTabBar.tsx|.css              §6.2  items 주입 · center 강조 · badge 렌더 · aria-current
feedback/Spinner.tsx|.css                  §4.9  size 3 · tone 3 · role=status|decorative · reduce 시 라벨 노출
feedback/Skeleton.tsx|.css                 §4.9  text|rect|circle|card · lines 1–5 · shimmer 없음
feedback/ErrorState.tsx                    §4.10 error|offline · retry(loading) · alert|status
feedback/EmptyState.tsx                    §4.10 icon · action · illustration 슬롯(미사용)
feedback/State.css                               두 상태 카드 공통 레이아웃 · 48 배지
feedback/InlineAlert.tsx|.css              §4.11 tone 5 · inline|banner · action · dismiss
feedback/Toast.tsx|.css                    §4.12 tone 3 · aria-live · 앱 컬럼 폭 · 탭바 offset
feedback/ToastProvider.tsx                 §4.12 동시 1개(교체) · 4000/6000ms · portal · useToast
progress/PageIndicator.tsx|.css            §4.19 dots(장식)|interactive(hit area 44)
bubble/SpeechBubble.tsx|.css               §4.20 tail 3 · align 2
sheet/Scrim.tsx|.css                       §4.21 z 단계 · 진입/퇴장 애니메이션
sheet/Sheet.tsx|.css                       §4.21 bottom|full · focus trap · Esc · scroll lock · grabber
dialog/Dialog.tsx|.css                     §4.22 dialog|alertdialog · default|destructive
dialog/ConfirmDialog.tsx                   §4.22 확인/취소 · destructive 초기 포커스 = 취소 · confirming
hooks/useFocusTrap.ts                            초기 포커스 · Tab 순환 · Esc · 트리거 복귀
hooks/usePresence.ts                             퇴장 애니메이션 동안 마운트 유지
hooks/useBodyScrollLock.ts                       중첩 overlay 안전한 배경 스크롤 잠금
hooks/useScrolledPast.ts                         useSyncExternalStore 기반 스크롤 구독
lib/motion.ts                                    §9.1 duration · Toast 표시 시간 상수
**/__tests__/  Text · Icon · haru-icons · Surface · AppColumn · TopBar · BottomTabBar ·
               Spinner · Skeleton · States · InlineAlert · ToastProvider · PageIndicator ·
               SpeechBubble · Sheet · Dialog   (16 파일)
```

### 3.2 수정

| 파일 | 변경 | 이유 |
|---|---|---|
| `packages/design-tokens/src/semantic/color.css` | `--color-tag-neutral-bg` 신설 (Tier 2, 값 불변) | S1-D1-1 사용자 결정 |
| `packages/design-tokens/__tests__/token-tiers.test.ts` | semantic color 개수 64 → **65**, `--color-tag-neutral-bg` 값·참조 테스트 추가 | 위와 동일. **§3.2.1 표 64개 + S1-D1-1 1개**임을 테스트 이름에 명시 |
| `packages/ui/src/tag/Tag.css` | neutral 배경이 semantic 토큰 참조 | S1-D1-1 |
| `packages/ui/src/progress/ProgressBar.{css,tsx}` · 테스트 | `--haru-progress-fill-size` → `--progress-fill-size` | S1-D1-4 |
| `packages/ui/src/button/Button.{tsx,css}` | 임시 인디케이터 → `Spinner`, `ref?: Ref<HTMLButtonElement>` prop 추가 | S1-D1-3 / ConfirmDialog 초기 포커스(§4.22)에 필요 |
| `packages/ui/src/button/IconButton.{tsx,css}` | 임시 인디케이터 → `Spinner`, `size?: 'md'` | S1-D1-3 · S1-D1-2 |
| `packages/ui/src/index.ts` · `styles.css` | 14종 export · CSS import 추가 | 진입점 |
| `packages/ui/package.json` | `lucide-react: "1.47.0"` | D-2 |
| `pnpm-workspace.yaml` | `overrides: lucide-react "1.47.0"` | D-2 (pnpm 12 설정 위치) |
| `pnpm-lock.yaml` | lucide-react 1.47.0 | 설치 |

### 3.3 명시적 비생성

- `apps/`, `apps/api/`, `supabase/` — 없음 (`ls` 확인)
- `sharp`, `tailwindcss`, `@testing-library/user-event`, svgr 계열 — 설치하지 않음 (상호작용 테스트는 기존 `fireEvent` 사용)
- Dev UI Gallery(`/__dev/ui`) · Scenario Panel · Playwright · `apps/web` — 미생성 (1-E~1-G 범위)
- HARU SVG 나머지 14종 — 미생성 (§11-6)

---

## 4. 실행한 검증 명령과 결과

| 명령 | 결과 |
|---|---|
| `pnpm install` | OK (Node v24.21.0 가드 통과, lucide-react 1.47.0 추가) |
| `pnpm typecheck` | **PASS** — root + config · contracts · design-tokens · ui |
| `pnpm lint` | **PASS** — 0 error (react-hooks · jsx-a11y 적용) |
| `pnpm test` | **PASS** — 37 files / **285 tests** (1-D2 이전 211 → +74, 회귀 0) |
| `pnpm --filter @haru/ui test` | **PASS** — 25 files / 118 tests |
| `pnpm lint:boundaries` | **PASS** — 0 violations (138 modules, 319 dependencies) |
| `pnpm build` | **PASS** — primitive 65 · semantic **193** · component 48 · provisional 71 |
| `pnpm format:check` | **PASS** — all files |
| `ls apps supabase` | **없음** |
| CSS 변수 존재 검증(스크립트) | `packages/ui` 가 참조하는 변수 **206개 중 미정의 0**. 유일한 미정의 문자열 `--token` 은 `styles.css` **주석**의 설명 문구다 |
| Tier 1 직접 참조 grep | `packages/ui` **0건** (`--haru-*`) |
| HEX / rgb() 리터럴 grep | `packages/ui/src` **0건** (주석 포함) |
| `@haru/contracts` import grep | `packages/ui` **0건** |
| `styles.css` import 그래프 | 로컬 CSS 29개 전부 존재, 외부 `@import` 는 `@haru/design-tokens/component.css` 1건 |

Playwright 시각 비교(AC-1-24) · 터치 타깃 픽셀 측정(AC-1-21) · 반응형(AC-1-23) · reduced-motion 실측(AC-1-22)은 `apps/web` + Playwright 이전이므로 여전히 `NOT VERIFIED` 다.

---

## 5. 접근성 처리 요약 (신규 14종)

| 컴포넌트 | 처리 |
|---|---|
| Text | `as` 로 의미 태그 지정(시각 크기와 heading 레벨 분리). `as="label"` 일 때만 `htmlFor` 전달. 고정 높이 없음 |
| Icon | `label`(→ `role="img"` + `aria-label`) 또는 `decorative`(→ `aria-hidden`) **둘 중 하나 필수**(타입 유니온 + 런타임 경고). Lucide `focusable="false"` |
| Surface | 기본 `div`. 클릭 가능하면 `as="button"`(자동 `type="button"`) 또는 `as="a"` 로만 렌더하고 focus ring 부여 |
| AppBackground | `aria-hidden` · `pointer-events: none` |
| AppColumn | 시맨틱은 `as`(예: `main`)로 호출부가 지정 |
| TopBar | `<header>` + 제목 `h1` 1개, 중앙 제목 좌우에 44 폭 확보(대칭), leading → trailing 순 키보드 이동 |
| BottomTabBar | `<nav aria-label>` + `<ul>` 목록, 활성 항목 `aria-current="page"`, 라벨을 **항상** 아이콘과 함께 표시, Tab 순차 이동(화살표 순환 없음), 중앙 항목 64 ≥ 44 |
| Spinner | `role="status"` + `aria-live="polite"` + 시각 숨김 라벨. 버튼 내부에서는 `decorative` 로 침묵. reduce 에서 회전 정지 + 라벨 노출 |
| Skeleton | 전부 `aria-hidden` — 로딩 안내는 컨테이너가 1회만 (§5.1) |
| ErrorState | 화면 전체 실패 `role="alert"` / 부분 실패 `role="status"`(`announce` prop). 재시도 버튼은 `loading` 이며 포커스를 잃지 않는다 |
| EmptyState | `role` 없음(일반 콘텐츠), 제목은 `titleAs` heading |
| InlineAlert | error·warning `role="alert"`, 그 외 `role="status"` + `aria-live="polite"`. 아이콘 + 문구 병행(색 단독 금지). 닫기는 IconButton `plain` + 라벨 필수 |
| Toast | `role="status"` · `aria-atomic` · error 만 `assertive`. **포커스를 빼앗지 않는다**(테스트로 확인). 액션이 있으면 기본 6000ms + 수동 해제 버튼 |
| PageIndicator | 기본은 `aria-hidden` 장식 + `label` 텍스트("2 of 3"). interactive 는 버튼 + hit area 44 + `aria-current` |
| SpeechBubble | 순수 컨테이너(role·live 없음) — 동적 문구는 부모가 `aria-live` |
| Sheet | `role="dialog"` `aria-modal` `aria-labelledby`, focus trap(Tab 순환), `Esc`(dismissible), 닫힐 때 트리거로 포커스 복귀, 배경 스크롤 잠금 + `overscroll-behavior: contain` |
| Dialog / ConfirmDialog | `role="dialog"`/`alertdialog`, `aria-describedby`, focus trap, **초기 포커스 = destructive 면 취소 / 아니면 확인**, `Esc` = 취소 |

모션: 무한 반복은 Spinner/Skeleton/ProgressBar 의 토큰 애니메이션뿐이고, overlay 는 전부 `--motion-duration-*` + `--motion-ease-*` 만 쓴다. `prefers-reduced-motion: reduce` 는 컴포넌트별로 §9.2 표대로 처리했다(전역 일괄 차단 없음).

---

## 6. 구현 중 내린 결정 (되돌리기 쉬운 순)

| # | 결정 | 근거 |
|---|---|---|
| D2-1 | **overlay 진입 애니메이션은 CSS `@keyframes`**, JS 는 퇴장 동안 마운트만 유지(`usePresence`) | `react-hooks/set-state-in-effect` 규칙 위반 없이 §9.1 모션을 그대로 구현할 수 있는 방식. `opening` 상태 값이 사라지는 대신 마운트 시점에 keyframes 가 재생된다 |
| D2-2 | **`TabBarItem.href` optional 추가** | Design Spec §6.2 는 각 항목을 `<a>`(라우터 Link)로 규정하지만 `items` 스키마에 목적지가 없다. `href` 가 있으면 `<a>`, 없으면 `<button>` 으로 렌더한다. 라우트 의미는 여전히 앱이 주입하므로 `packages/ui` 는 도메인을 모른다(AC-1-25 유지) |
| D2-3 | **`<ul role="list">` 의 `role` 제거** | `jsx-a11y/no-redundant-roles` 가 error. Safari 의 `list-style: none` 목록 의미 제거는 QA 시 VoiceOver 로 재확인 필요(§8 기록) |
| D2-4 | **Icon 은 Lucide 전량이 아니라 Stage 1 대응표 14종만 등록** | 번들 최소화 + 글리프 drift 방지(D-2). 다음 Stage 아이콘은 해당 Stage 에서 `registry.ts` 에 추가 |
| D2-5 | **ErrorState/EmptyState/InlineAlert/Toast 의 문구는 전부 prop** (`retryLabel`, `dismissLabel`, `action.label`) | `packages/ui` 는 copy 를 소유하지 않는다(§4 공통 규칙 9). 핸들러만 있고 라벨이 없으면 해당 컨트롤을 렌더하지 않는다 |
| D2-6 | **`Button` 에 `ref` prop 추가** | §4.22 초기 포커스(확인/취소 버튼)를 구현하려면 버튼 요소 참조가 필요하다. React 19 에서 ref 는 일반 prop 이며 기존 사용처에 영향이 없다 |
| D2-7 | **Skeleton `rect`/`card`/`circle` 은 부모 크기를 채운다** | Spec 에 치수가 없고 외부 `className`/`style` 주입을 막고 있으므로, 크기는 감싸는 레이아웃(화면 코드)이 정한다. `min-block-size`(32) 만 안전장치로 둔다 |
| D2-8 | **Spinner `lg`(32) 는 토큰 없는 리터럴** | §4.9 규격값이며 아이콘 3단계(16/20/24)에 없다. `sm`/`md` 는 `--size-icon-sm`/`-lg` 와 같은 값이라 토큰을 참조한다 |

### 토큰이 없어 남긴 리터럴 (1-D1 §8 표의 연장)

| 리터럴 | 위치 | 근거 |
|---|---|---|
| `32px` | Spinner `lg` | §4.9 |
| `36px` × `4px` | Sheet grabber | §4.21 (Figma `88:960`) |
| `3px` | SpeechBubble tail radius | §4.20 (Figma `88:762`) |
| `1px` border | InlineAlert · Dialog destructive 확인 버튼 | §4.11 · §4.22 (hairline 토큰 없음) |
| `2` / `47.12 62.83` | Spinner stroke·270° arc 기하값 | §4.9 (SVG 기하) |
| `0.96` / `translateY` | Dialog scale · Tab press | §9.1 모션 규격값 |
| `8`(px, TS 상수) | TopBar 스크롤 임계값 | §6.1 |
| `4000` / `6000` / `180` / `240`(ms, TS 상수) | Toast 표시 시간 · overlay 퇴장 시간 | §4.12 · §9.1 (`lib/motion.ts` 한 곳에 모음) |

HEX·rgb·Tailwind arbitrary value 는 0건이다(§4).

---

## 7. Design Spec 대비 차이 · 보류

| 항목 | 처리 |
|---|---|
| TopBar pill 의 **책 표지 16×22** (§6.1 pill 규격) | 슬롯을 만들지 않았다. `title` 이 `ReactNode` 라 Stage 4 에서 표지+제목 조합을 주입할 수 있다. 전용 prop 이 필요하면 Design Spec 갱신 후 추가 |
| InlineAlert `dismissing` state | 내부 퇴장 애니메이션을 두지 않았다(부모가 제거). 진입만 CSS 애니메이션 |
| Toast `state` 값 이름 | Spec 의 `entering`·`visible`·`exiting` 중 `entering` 은 CSS 진입 애니메이션이 담당하므로 타입은 `'open' | 'closing'` 두 값이다 (D2-1) |
| EmptyState 캐릭터 일러스트 | `illustration` 슬롯만 열어 두고 Stage 1 에서 쓰지 않는다 (Plan §16 D-4) |
| BottomTabBar `badge` | 렌더만 지원(Stage 3+ 에서 의미 부여). 현재는 `aria-hidden` 장식이므로 **의미 있는 뱃지가 필요해지는 Stage 에서 접근성 문구를 정의해야 한다** |
| RadioGroup 비채점 옵션 · SelectTrigger · Textarea · Avatar | Stage 1 범위 밖 (approvals §6) |
| 공통 상태 6종의 **화면 컨텍스트**(§5.1–§5.6 레이아웃) | 컴포넌트는 전부 있으나 `AppColumn + TopBar` 조합 화면은 Dev Gallery(1-G)에서 확인한다. AC-1-19 는 그 시점에 판정 가능 |

---

## 8. 발견 사항

| ID | 등급 | 내용 |
|---|---|---|
| **S1-D2-1** | Low (정보) | pnpm 12 는 `package.json` 의 `pnpm.overrides` 를 읽지 않는다. D-2 의 "root `pnpm.overrides`" 표현은 현재 `pnpm-workspace.yaml`의 `overrides` 로 충족된다. Plan 문구 갱신은 plan-agent 소관 |
| **S1-D2-2** | Low (정보) | Figma `140:2971` export 는 120×120 캔버스에 **drop shadow 필터가 포함**되어 있다. 아이콘 에셋에서 그림자를 제거하고 CSS `--shadow-rest` 로 대체했다 — §3.2.4 "명명된 Effect Style 로 통일" · §10.3 **AD-3** 범위 |
| **S1-D2-3** | Low (정보) | `<ul role="list">`(Spec §6.2)는 lint 규칙과 충돌해 `role` 을 뺐다(D2-3). Safari VoiceOver 에서 목록 의미가 유지되는지 확인이 필요하다 |
| **S1-D2-4** | Low (정보) | `Skeleton` 의 `text` 줄 높이에 CSS `lh` 단위를 썼다(현재 타이포 토큰의 line-height 추종). Chrome 109+/Safari 16.4+/Firefox 120+ 필요 — 지원 범위 밖 브라우저는 Stage 1 대상이 아니다 |
| **S1-D2-5** | NEEDS_DECISION (design-agent) | **탭 아이콘 글리프 미확정**(§11-10). `book-open` / `chart-column` 으로 구현했으며 §10.2 시각 비교 후 `library-big` / `trending-up` 으로 교체될 수 있다 |
| **S1-D2-6** | NEEDS_DECISION (§10.3 말미) | Playwright 시각 비교 임계값(`maxDiffPixelRatio` 기본 0.02)은 baseline 생성(1-G 이후) 시점에 확정해야 한다. 현재 단계에서는 정할 수 없다 |

### QA 가 그대로 적용해야 할 허용 차이 (§11-9)

- **AD-3** 그림자: 구현은 명명된 Effect Style(`--shadow-glass-rest` 등), Figma instance 는 raw 2-layer. blur/offset 차이 허용, fill·radius·크기는 불허.
- **AD-4** blur: Button hover 는 Figma 6 → 구현 12 로 통일. hover 상태 blur 차이 허용.
- 나머지 AD-1·2·5~10 은 Design Spec §10.3 표 그대로 적용한다.

### 남은 가값 (변경 없음)

P-01 · P-02 · P-03 · P-04 · P-05 · P-06 · P-07 · P-08 · P-09 · P-10 · P-11 · P-12 · P-13 · P-14 · P-15 · P-16 — 이번 단계에서 값을 바꾸지 않았고, 신규 사용처에는 `provisional: P-xx` 주석을 달았다(Spinner tone·Scrim·InlineAlert status·AppColumn gutter/safe-area·AppBackground gradient·TabBar 라벨색 등). P-10(공통 상태 화면)은 토큰이 아니므로 주석 대상이 아니며 Dev Gallery 에서 승인한다.

---

## 9. Mock 시나리오

이번 단계에는 **없다.** `packages/ui` 는 도메인·서버 의존이 없고 contracts·API·Mock 을 참조하지 않는다. §5.7 의 시나리오 ↔ 상태 매핑은 Mock Layer(1-F)와 Gallery(1-G)에서 연결한다.

## 10. `BACKEND_INTEGRATION_PENDING` 예상 항목

이번 단계에는 **없다.**

---

## 11. stage-qa-agent 참고

- 재현: `pnpm install` → `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm lint:boundaries` → `pnpm build` → `pnpm format:check`
- AC-1-18(22종)은 이번 단계로 **컴포넌트 존재·variant·state 기준 충족**이다. 다만 gallery 렌더 증거는 1-G 이후에 가능하다.
- AC-1-19(공통 상태 6종)는 컴포넌트 수준은 충족, **화면 컨텍스트 확인은 1-G** 이후.
- AC-1-20~24 (키보드·터치 타깃·reduced-motion·반응형·시각 비교)는 `apps/web` + Playwright 이전이므로 `NOT VERIFIED` 가 맞다. 단 키보드·접근성 이름·focus 가능 여부의 **DOM 수준 검증**은 단위 테스트로 제공된다(§5).
- AC-1-25(BottomTabBar items 주입·Session 탭 없음)는 `tab-bar/__tests__/BottomTabBar.test.tsx` 로 검증 가능하다.
