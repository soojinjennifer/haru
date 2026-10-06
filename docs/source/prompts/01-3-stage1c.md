HARU Stage 1-C를 진행해라.

Stage 1-A와 Stage 1-B는 완료된 것으로 간주한다.

이미 완료된 Toolchain / Workspace / Design Token / Font 설정은
문제가 발견되지 않는 한 다시 변경하지 마라.

이번 작업에서는 plan-agent와 design-agent를 다시 실행하지 않는다.

development-agent만 사용한다.

필요한 문서만 필요한 범위에서 읽어라.

- docs/plans/stage-1-plan.md
- docs/design/stage-1-design-spec.md
- docs/decisions/stage-1-approvals.md
- docs/API_CONTRACTS.md
- docs/FRONTEND_ARCHITECTURE.md 또는 관련 Architecture 문서
- CLAUDE.md
- .claude/rules/*

문서 전체를 다시 요약하지 마라.
이번 Stage 1-C와 관련된 Contract / Enum / Rule 부분만 참조한다.


==================================================
이번 작업 목표
==================================================

Stage 1-C의 목표는

packages/contracts

의 공통 기반을 만드는 것이다.

Frontend와 향후 Backend Developer가
동일한 API Contract와 State Definition을 공유할 수 있도록 한다.

이번 단계에서는 실제 Backend API를 구현하지 않는다.


==================================================
1. packages/contracts 생성
==================================================

packages/contracts를 생성하고
HARU Frontend와 향후 Backend 사이의
공식 Contract Source of Truth로 사용한다.

Zod를 Runtime Schema의 Source of Truth로 사용하고,
TypeScript Type은 Zod Schema에서 infer한다.

같은 구조의 Type을
Frontend와 Backend에 각각 따로 작성하지 않는다.


==================================================
2. 이번 Stage 1-C 구현 범위
==================================================

승인된 Stage 1 Plan 기준으로 다음만 구현한다.

A. Common Schema 5종

B. Enum 23종

C. Common Rule 3종

- Session Transition Table
- Report Eligibility Rule
- Recording Constants

D. Health Contract

E. Contract Test

Stage 1 Plan에 정의된 정확한 이름과 범위를 우선한다.

Plan과 현재 문서가 다르면
임의로 확장하지 말고 차이를 보고한다.


==================================================
3. Session State Contract
==================================================

HARU PRD의 Session State를
공통 Contract로 정의한다.

기본 Lifecycle:

ready
→ recording
⇄ paused
→ completed
→ analyzing
→ analyzed

실패 경로:

analyzing
→ failed
→ retry

이 상태 정의는
Frontend와 향후 Backend가 동일하게 사용해야 한다.

가능하면 단순 enum만 두지 말고
허용 가능한 State Transition도
공통 Rule로 정의한다.

예:

ready → recording       allowed
recording → paused      allowed
paused → recording      allowed
recording → completed   allowed
completed → analyzing   allowed
analyzing → analyzed    allowed
analyzing → failed      allowed

반면:

ready → analyzed

같은 전이는 금지한다.

Transition Rule은 테스트한다.


==================================================
4. Recording Constants
==================================================

PRD와 승인된 Plan을 기준으로
Recording 관련 공통 상수를 Contract에 정의한다.

예:

- maximum recording duration
- 관련 timeout
- upload 상태가 있다면 공통 enum
- retry 관련 값이 Stage 1 Plan에 포함되어 있다면 해당 값

단,
PRD나 Plan에 없는 숫자를 임의로 추가하지 않는다.

Frontend 구현 편의를 위해
새 Business Rule을 만들어내지 마라.


==================================================
5. Report Eligibility Rule
==================================================

PRD 기준 4주 Report 발행 조건을
공통 Rule로 정의한다.

현재 기준:

- 누적 Recording 1시간 이상
- Recording Session 2~3회 이상

정확한 최소 Session 수가
Plan 또는 PRD에서 하나의 값으로 확정되어 있다면
그 값을 따른다.

문서 간 표현이 모호하면
임의로 해석하지 말고
NEEDS_DECISION으로 보고한다.

Report Eligibility Rule은
pure function 또는 testable rule 형태로 만든다.

Backend 구현은 하지 않는다.


==================================================
6. Health Contract
==================================================

Stage 1에서 사용할 최소 Health Contract를 구현한다.

목적:

향후 Mock Adapter와 Http Adapter가
동일한 Contract를 사용할 수 있게 하는 것.

예:

HealthStatus
HealthResponseSchema

등.

단,
실제 Node API / Express Health Endpoint는 만들지 않는다.

Frontend Contract와 Mock/Http Adapter의 인터페이스 기반만 만든다.


==================================================
7. Zod Dependency Boundary 검증
==================================================

Stage 1-A에서 미검증으로 남았던

contracts-runtime-deps-zod-only

규칙을 이번 Stage에서 반드시 검증한다.

packages/contracts의 Runtime Dependency는
원칙적으로 Zod만 허용한다.

다음을 확인한다.

- contracts → zod : 허용
- contracts → React : 금지
- contracts → apps/web : 금지
- contracts → packages/ui : 금지
- contracts → design-tokens : 원칙적으로 금지

Contract Package가 UI나 App Layer에 의존하지 않게 한다.

dependency-cruiser가 이를 검증하도록 한다.


==================================================
8. Enum 설계 원칙
==================================================

23개 Enum은
Stage 1 Plan에서 승인된 목록을 기준으로 만든다.

Enum 이름을 임의로 바꾸지 않는다.

가능하면

- Zod enum/schema
- TypeScript inferred type
- 필요 시 readonly value list

를 동일 Source에서 파생한다.

예:

const SessionStateSchema = z.enum([...])

type SessionState =
  z.infer<typeof SessionStateSchema>

처럼 중복 선언을 최소화한다.


==================================================
9. Error Contract
==================================================

Stage 1 Plan의 common schema에
Error Contract가 포함되어 있다면 구현한다.

Error는 향후 Frontend Mock과 Backend 모두
같은 구조를 사용할 수 있어야 한다.

예:

code
message
details

단,
Stage 2 이상 Domain Error Code를
미리 대량 생성하지 마라.

이번 Stage 1에서 필요한 Common Error만 만든다.


==================================================
10. 테스트
==================================================

최소 다음을 검증한다.

- Zod parse success
- invalid payload rejection
- Enum validation
- Session transition allowed case
- Session transition denied case
- Report eligibility true/false
- Recording constant consistency
- Health schema
- dependency boundary

Stage 1 Plan에서 승인된 Contract Test 6개가 있다면
그 기준을 우선한다.

테스트 수를 맞추기 위해 의미 없는 테스트를 만들지 마라.


==================================================
11. 이번 Stage에서 하지 않을 것
==================================================

이번 Stage 1-C에서는 다음을 하지 마라.

- apps/api 생성
- Express Route 구현
- Controller 구현
- Service 구현
- Repository 구현
- Supabase 구현
- Migration 생성
- RLS 구현
- Auth API 구현
- Child API 구현
- Activity API 구현
- Session API 구현
- Report API 구현
- STT 구현
- AI 구현
- Stage 2~8 Domain Contract 전체 선행 생성
- packages/ui 구현
- Product Screen 구현

Backend는 다른 개발자가 이후 구현한다.

이번 작업은
Frontend와 Backend 사이의 공통 계약 기반까지만이다.


==================================================
12. 문서 갱신
==================================================

필요한 경우 다음만 최소한으로 갱신한다.

- docs/API_CONTRACTS.md
- docs/decisions/stage-1-approvals.md

Plan 자체를 변경해야 하는 문제가 발견되면
직접 크게 수정하지 말고 별도 이슈로 보고한다.


==================================================
13. 검증 명령
==================================================

구현 후 최소한 다음을 실행한다.

- typecheck
- lint
- contracts unit test
- dependency-cruiser
- root build 영향 여부

Stage 1-A/B 결과가 깨지지 않았는지도 확인한다.


==================================================
14. 완료 보고 형식
==================================================

작업이 끝나면 긴 설명을 하지 말고
다음 형식으로만 보고한다.

1. 생성/수정 파일

2. 구현한 Common Schema

3. 구현한 Enum 목록

4. 구현한 Rule
   - Session Transition
   - Report Eligibility
   - Recording Constants

5. Health Contract

6. contracts-runtime-deps-zod-only 검증 결과

7. Test 결과

8. typecheck / lint / build 결과

9. 발견된 문제
   - Blocking
   - Non-blocking
   - NEEDS_DECISION

10. Stage 1-D1 진입 가능 여부

Stage 1-D1은 시작하지 마라.

여기서 멈추고 승인을 기다려라.