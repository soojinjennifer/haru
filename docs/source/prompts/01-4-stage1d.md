HARU Stage 1-D1을 진행해라.

Stage 1-A, 1-B, 1-C는 완료된 것으로 간주한다.

이미 완료된 다음 항목은
문제가 발견되지 않는 한 다시 변경하지 마라.

- toolchain / workspace
- packages/config
- packages/design-tokens
- font foundation
- packages/contracts

이번 작업에서는 plan-agent와 design-agent를 다시 실행하지 않는다.

development-agent만 사용한다.

필요한 문서만 필요한 범위에서 읽어라.

- docs/plans/stage-1-plan.md
- docs/design/stage-1-design-spec.md
- docs/DESIGN_SYSTEM.md
- docs/DESIGN_TOKEN_MAP.md
- docs/COMPONENT_MAP.md
- docs/decisions/stage-1-approvals.md
- CLAUDE.md
- .claude/rules/*

문서 전체를 다시 요약하지 마라.

이번 Stage 1-D1에 해당하는
Shared UI Component 명세만 읽고 구현한다.


==================================================
이번 작업 목표
==================================================

Stage 1-D1의 목표는

packages/ui

의 기초 Shared UI Component를 구현하는 것이다.

이번 단계에서는
Form / Action / Basic Indicator 성격의
공통 Component만 구현한다.

Product-specific Component는 만들지 않는다.


==================================================
1. 이번 구현 대상
==================================================

다음 11개 Shared UI를 구현한다.

1. Button
2. IconButton
3. Input
4. Textarea
5. Checkbox
6. Radio
7. Select
8. Chip
9. Badge
10. Progress
11. Avatar

단,

stage-1-design-spec.md의
승인된 Shared UI 목록과 정확한 이름이 다를 경우
Design Spec의 명칭을 우선한다.

임의로 Component를 추가하지 마라.


==================================================
2. Component 설계 원칙
==================================================

모든 Component는 다음 원칙을 따른다.

Figma
→ Design Token
→ Shared UI

직접적인 임의 스타일 값 사용을 피한다.

금지 예:

- 임의 HEX
- 임의 px spacing
- 임의 radius
- inline style 남용

가능하면 반드시
packages/design-tokens에서 정의한
Semantic / Component Token을 사용한다.


==================================================
3. Variant / State
==================================================

각 Component는
stage-1-design-spec.md에서 정의된
Variant와 State를 우선 구현한다.

최소한 필요한 상태:

- default
- hover
- focus-visible
- active
- disabled

해당 Component에 적용되는 경우:

- selected
- checked
- error
- success
- loading
- readonly

등을 구현한다.

Design Spec에 없는 Variant를
추측해서 추가하지 마라.


==================================================
4. Button
==================================================

Button은
HARU 전체에서 재사용되는 핵심 Shared UI다.

반드시 확인:

- variant
- size
- icon 포함 여부
- loading
- disabled
- full-width 필요 여부
- focus-visible
- keyboard interaction

Primary / Secondary / Text 등의 정확한 Variant 명칭은
Design Spec을 따른다.

Button 내부에서
Figma와 다른 임의 spacing을 만들지 마라.


==================================================
5. IconButton
==================================================

IconButton은 최소 touch target을 보장한다.

HARU는 모바일 우선 서비스이므로
실제 visible icon 크기와
interactive hit area를 분리해서 생각한다.

WCAG / touch accessibility 기준을 고려한다.

Lucide 사용이 필요한 경우
승인된 버전과 규칙을 따른다.

아이콘 이름이나 stroke를
화면별로 임의 변경하지 마라.


==================================================
6. Input / Textarea / Select
==================================================

Form Component는
Stage 2 Onboarding에서 대량 재사용될 예정이다.

따라서 다음을 공통 처리할 수 있게 설계한다.

- label
- placeholder
- helper text
- error message
- disabled
- required 상태
- aria-describedby
- aria-invalid

단,
복잡한 Form Library Integration까지
이번 Stage에서 미리 구현하지 마라.

React Hook Form 등
승인되지 않은 Library를 임의 도입하지 않는다.


==================================================
7. Checkbox / Radio
==================================================

반드시 keyboard 사용이 가능해야 한다.

검증:

- Tab focus
- Space / Enter behavior
- checked state
- disabled state
- label click

Native semantic을 최대한 활용한다.

시각 구현을 위해
접근성을 희생하지 마라.


==================================================
8. Chip / Badge
==================================================

Chip과 Badge의 역할을 구분한다.

예:

Chip
→ 선택 또는 interaction 가능

Badge
→ 상태 / 정보 표시

Design Spec이 다른 정의를 갖고 있다면
Design Spec을 우선한다.

두 Component가 비슷하게 생겼다는 이유로
무리하게 하나로 합치지 마라.


==================================================
9. Progress
==================================================

Progress는
Onboarding / Session / Report 등에서
재사용될 가능성이 있다.

하지만 이번 단계에서는
Shared UI 수준의 Progress만 구현한다.

Domain-specific progress logic은 넣지 않는다.

필요 시:

- value
- max
- accessible label

을 지원한다.


==================================================
10. Avatar
==================================================

Avatar는 Shared Primitive 수준으로 구현한다.

HARU Counselor Character나
Child Persona 같은
Domain-specific 표현은 아직 구현하지 않는다.

지원 범위는 Design Spec에 정의된 것만 구현한다.

예:

- image
- fallback
- size
- shape

등.


==================================================
11. Accessibility
==================================================

모든 Component는 접근성을 기본 요구사항으로 취급한다.

최소 확인:

- keyboard navigation
- visible focus
- semantic HTML
- ARIA 필요 여부
- disabled semantics
- form label 연결
- color contrast

Stage 1에서 승인된

eslint-plugin-jsx-a11y

규칙도 적용한다.

Lint를 통과하기 위해
무의미한 aria 속성을 남발하지 마라.


==================================================
12. TypeScript API
==================================================

Component Props는 명확하게 설계한다.

다음을 피한다.

- any
- 지나치게 넓은 string
- 중복 props
- 화면별 임시 prop

필요하면
discriminated union 또는
literal union을 사용한다.

다만 과도한 generic abstraction은 하지 않는다.

MVP Shared UI 수준에서
이해하기 쉬운 API를 우선한다.


==================================================
13. Test
==================================================

각 Component에 필요한 최소 테스트를 작성한다.

최소 검증 후보:

Button
- render
- click
- disabled
- loading

Form controls
- label association
- input
- disabled
- error state

Checkbox / Radio
- keyboard interaction
- checked state

Select
- selection

Progress
- value semantics

Avatar
- fallback

모든 Component마다
기계적으로 동일한 테스트 수를 맞추지 마라.

행동과 접근성 중심으로 테스트한다.


==================================================
14. Storybook 금지
==================================================

현재 승인된 Stage 1 Plan에 따라
Storybook은 도입하지 않는다.

UI 확인은 이후 Stage 1-G의
Dev UI Gallery에서 수행한다.

이번 Stage에서
Gallery까지 만들지 마라.


==================================================
15. 이번 Stage에서 하지 않을 것
==================================================

Stage 1-D1에서는 다음을 하지 마라.

- 나머지 Shared UI 구현
- Modal
- Dialog
- Sheet
- Tabs
- Toast
- Tooltip
- Carousel
- Navigation
- BottomTabBar
- Product Screen
- Login Screen
- Onboarding Screen
- Home
- Library
- Storytime
- Report
- Domain Component
- Feature Component
- apps/api
- Supabase
- Backend
- AI
- STT
- Stage 2 이상 기능

이번 범위를 넘지 마라.


==================================================
16. Dependency Boundary
==================================================

packages/ui는 다음 방향을 유지한다.

허용:

packages/ui
→ packages/design-tokens

필요한 경우:

packages/ui
→ shared utility

금지:

packages/ui
→ apps/web

packages/ui
→ feature

packages/ui
→ page

packages/ui
→ backend

Contract가 필요하지 않은
순수 UI Component에서
packages/contracts를 불필요하게 import하지 마라.


==================================================
17. 검증
==================================================

구현 후 최소한 다음을 실행한다.

- typecheck
- lint
- packages/ui unit test
- root test
- build
- dependency-cruiser

또한 Stage 1-A/B/C가
이번 변경으로 깨지지 않았는지 확인한다.


==================================================
18. 완료 보고 형식
==================================================

작업 완료 후 긴 설명을 하지 말고
다음 형식으로만 보고한다.

1. 생성/수정 파일

2. 구현 Component
   - Button
   - IconButton
   - Input
   - Textarea
   - Checkbox
   - Radio
   - Select
   - Chip
   - Badge
   - Progress
   - Avatar

3. Component별 구현 Variant / State

4. 접근성 처리

5. Test 결과

6. typecheck / lint / build /
   dependency-cruiser 결과

7. Design Spec 대비 차이
   - 없음
   또는
   - 항목 + 이유

8. 발견된 문제
   - Blocking
   - Non-blocking
   - NEEDS_DECISION

9. Stage 1-D2 진입 가능 여부

Stage 1-D2는 시작하지 마라.

여기서 멈추고 승인을 기다려라.