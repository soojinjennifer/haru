HARU Stage 1-B를 진행해라.

Stage 1-A는 완료된 것으로 간주하고,
이미 완료된 toolchain / config / workspace 설정은
문제가 발견되지 않는 한 다시 변경하지 마라.

이번 작업에서는 plan-agent와 design-agent를 다시 실행하지 않는다.

승인된 다음 문서를 Source of Truth로 사용하고,
development-agent만 사용한다.

필요한 부분만 읽어라.

- docs/plans/stage-1-plan.md
- docs/design/stage-1-design-spec.md
- docs/decisions/stage-1-approvals.md
- docs/DESIGN_SYSTEM.md
- docs/DESIGN_TOKEN_MAP.md
- CLAUDE.md
- .claude/rules/*

문서 전체를 다시 요약하지 마라.
이번 작업에 필요한 Design Token / Font 관련 부분만 참조한다.


==================================================
이번 작업 범위
==================================================

Stage 1-B의 범위는 다음 두 가지다.

1. packages/design-tokens
2. Frontend Font Foundation

아직 Shared UI Component는 구현하지 않는다.


==================================================
1. packages/design-tokens 구현
==================================================

승인된 Stage 1 Design Spec을 기준으로
Design Token 구조를 구현한다.

구조는 다음 계층을 유지한다.

Primitive
→ Semantic
→ Component

Figma가 Visual Source of Truth다.

다음을 구현한다.

- Primitive Color Tokens
- Semantic Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow / Effect Tokens
- Layout Tokens
- Component-level Tokens
- CSS Variables export
- Tailwind에서 사용할 Semantic Token Mapping 기반

Design Spec에 정의된 token naming을 우선한다.

임의의 HEX / spacing / radius 값을 새로 만들지 마라.


==================================================
2. provisional Token 처리
==================================================

stage-1-design-spec.md에 기록된
provisional 항목은 확정값처럼 처리하지 않는다.

Design Spec의 provisional 대상:

- 15개 항목
- 관련 Token 48개

는 코드에서도 추적 가능하도록 유지한다.

필요한 경우 다음과 같은 명확한 주석을 사용한다.

PROVISIONAL:
Figma designer confirmation pending.

단, provisional이라는 이유로
구현 자체를 중단하지 않는다.

현재 승인된 가값을 사용하되
향후 교체하기 쉬운 Token 구조로 작성한다.


==================================================
3. 승인된 신규 Token 반영
==================================================

다음 신규 Token을 반영한다.

- --material-glass-fill-fallback
- --tabbar-icon-size
- --layout-tabbar-center-overhang

값은 승인된 Stage 1 Design Spec을 따른다.

Figma 또는 승인 문서와 다른 값을 임의로 사용하지 않는다.


==================================================
4. 기존 provisional 결정 반영
==================================================

승인된 현재 기준을 사용한다.

- radius-surface:
  현재 Stage 1 대상 기준 22

- layout gutter:
  24

- gradient stop:
  46%

- primary button height:
  56

- medallion:
  승인된 136 / 188 / 232 구조
  + ring-offset 8

단,
확정되지 않은 항목은 provisional 상태를 유지한다.


==================================================
5. Font Foundation
==================================================

Inter를 CDN으로 불러오지 않는다.

승인된 방식:

@fontsource-variable/inter

를 사용하여 self-host한다.

조건:

- variable font 사용
- latin subset 우선
- 외부 Google Fonts / CDN 의존 금지
- font-display 전략 확인
- Fallback Font Stack 정의

Figma의 SF Pro와 실제 Web 구현의 Inter 차이는
승인된 Visual Comparison Rule을 따른다.

허용:

- Font metric 차이

허용하지 않음:

- Layout 차이
- spacing 차이
- color 차이
- radius 차이

Font 차이를 맞추기 위해
임의의 letter-spacing이나 margin hack을 넣지 마라.


==================================================
6. Tailwind 연결 기반
==================================================

Tailwind에서 Primitive Token을 직접 남용하지 않고
가능하면 Semantic Token을 사용하도록 구조화한다.

예:

잘못된 방향:

bg-[#xxxxxx]

또는

bg-primitive-sage-400

를 Product UI에서 직접 반복 사용


권장 방향:

bg-surface-primary
text-fg-primary
border-border-default
bg-action-primary

와 같이 의미 중심 Semantic Token을 사용한다.

단,
이번 Stage에서는 Shared UI를 아직 만들지 않는다.

Token Mapping 기반까지만 구현한다.


==================================================
7. 이번 Stage에서 하지 않을 것
==================================================

이번 Stage 1-B에서는 다음을 하지 마라.

- packages/ui Shared UI 22종 구현
- Button Component 구현
- Input Component 구현
- Navigation Component 구현
- apps/web Product Screen 구현
- Login 구현
- Onboarding 구현
- Home 구현
- Session 구현
- Report 구현
- Stage 2 이상 기능 구현
- Backend 구현
- apps/api 생성
- Supabase 구현
- apps/mobile 생성
- STT 구현
- AI 구현

lucide-react도 아직 실제 UI Component가 필요하지 않다면
이번 단계에서 억지로 사용하지 마라.

sharp 역시 실제 이미지 asset processing 대상이 생기기 전까지
설치만을 목적으로 코드를 추가하지 마라.

이미 승인된 dependency라 하더라도
실제 사용 시점에 연결한다.


==================================================
8. 검증
==================================================

구현 후 다음을 검증한다.

- design-token package build
- TypeScript typecheck
- ESLint
- unit test
- root build 영향 여부
- CSS Variable export 정상 여부
- Tailwind Semantic Mapping 정상 여부
- Font local loading 설정
- CDN dependency 없음
- provisional token 추적 가능 여부

가능하다면 Token 이름 중복도 확인한다.

Primitive → Semantic → Component dependency 방향이
뒤집히지 않았는지도 검증한다.


==================================================
9. 문서 갱신
==================================================

필요한 경우 다음 문서만 최소한으로 갱신한다.

- docs/DESIGN_SYSTEM.md
- docs/DESIGN_TOKEN_MAP.md
- docs/decisions/stage-1-approvals.md

새로운 제품 요구사항을 추가하지 않는다.

Plan 자체를 변경해야 하는 문제가 발견되면
직접 크게 수정하지 말고 별도 이슈로 보고한다.


==================================================
10. 완료 보고
==================================================

작업이 끝나면 긴 설명을 하지 말고
다음 형식으로만 보고한다.

1. 생성/수정 파일

2. 구현한 Token 계층
   - Primitive
   - Semantic
   - Component

3. Font 적용 결과

4. provisional 항목 상태

5. 신규 Token 3종 적용 결과

6. 검증 결과
   - typecheck
   - lint
   - test
   - build

7. 발견된 문제
   - Blocking
   - Non-blocking

8. Stage 1-C 진입 가능 여부

Stage 1-C는 시작하지 마라.

여기서 멈추고 승인을 기다려라.