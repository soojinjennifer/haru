HARU Stage 1 개발을 이어서 진행한다.

Stage 1 Plan과 Design Spec은 이미 승인되었다.
다시 plan-agent나 design-agent를 실행하지 마라.

먼저 다음 문서만 필요한 범위에서 읽어라.

- docs/plans/stage-1-plan.md
- docs/design/stage-1-design-spec.md
- CLAUDE.md
- .claude/rules/*
- 관련 Architecture / Design System 문서

전체 문서를 다시 길게 요약하지 마라.
필요한 항목만 참조해서 작업한다.

이번에는 development-agent를 사용해서
Stage 1-A만 구현해라.

범위:

1. packages/config
2. root workspace 설정
3. TypeScript / ESLint / Prettier / Vitest 공통 설정
4. Node / pnpm / package manager 버전 고정
5. import boundary 검사 기반
6. build / typecheck / lint / test 실행 기반

승인된 결정은 그대로 사용한다.

- Vitest 4.1.11
- React Router 8.4.0
- sharp 추가 승인
- dependency-cruiser 사용
- Inter self-host
- 승인된 Stage 1 Plan의 나머지 결정사항

중요:

- apps/api를 만들지 마라.
- supabase/를 만들지 마라.
- apps/mobile을 만들지 마라.
- Stage 2 이상의 기능을 구현하지 마라.
- Shared UI, design-token, contracts 구현은 아직 하지 마라.
- Backend 코드는 작성하지 마라.

완료 후에는 다음만 보고해라.

1. 생성/수정 파일
2. 실행한 검증 명령
3. PASS / FAIL
4. Stage 1-B로 넘어가기 전 문제점

여기서 멈춰라.

#### 결과 후 승인 내용 
아래 방향으로 승인한다.

1. F-1
   - 로컬 Node를 승인 기준에 맞게 24.21.0 이상으로 업그레이드한다.
   - preinstall Node version guard 추가도 승인한다.
   - 단, Node 24.21.0 정확히 하나만 허용하지 말고,
     현재 package.json engines 기준인
     >=24.21.0 <25
     를 만족하는지 검사하도록 구현한다.
   - 이 변경은 Stage 1-A Foundation 안정화를 위한 예외로 승인한다.

2. F-2
   - root에 별도 "install" script는 만들지 않는다.
   - pnpm install --frozen-lockfile을 표준 설치 명령으로 유지한다.
   - Plan 문구만 이에 맞게 수정한다.

3. F-3
   - eslint-plugin-jsx-a11y 추가를 승인한다.
   - 현재 React / ESLint / TypeScript 조합과 호환되는 버전을 확인한 뒤 버전을 고정한다.
   - 추가 후 lint 및 접근성 관련 rule이 정상 동작하는지 검증한다.

4. F-4
   - docs/decisions/stage-1-approvals.md 생성 승인.
   - D-1~D-10과 이번 추가 승인사항(F-1~F-6)을 기록한다.

5. F-5
   - 다음 보조 devDependency 4종 사용 승인:
     - @eslint/js
     - @types/node
     - @vitest/coverage-v8
     - globals
   - production bundle에는 포함되지 않는 toolchain dependency로 취급한다.

6. F-6
   - Playwright, sharp, @fontsource-variable/inter, lucide-react,
     type-aware ESLint, eslint/react.js 루트 연결은
     현재 제안대로 해당 대상이 생기는 Stage 1-B/1-C 시점까지 유예한다.

7. contracts-runtime-deps-zod-only의 허용 방향 검증은
   packages/contracts와 zod가 생성되는 Stage 1-C에서 반드시 수행한다.

위 승인사항을 반영한 뒤 Stage 1-A를 마무리해라.

완료 후에는 다음만 보고해라.

- 변경 파일
- Node guard 동작 검증 결과
- lint/typecheck/test 결과
- stage-1-approvals.md 기록 내용
- Stage 1-B 진입 가능 여부

Stage 1-B 구현은 아직 시작하지 말고 멈춰라.