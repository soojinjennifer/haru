# `apps/web/src/features`

사용자 행동 + 상태 전이 + 서버 상태를 소유하는 레이어다 (`.claude/rules/frontend.md` §2).

Stage 1 에는 feature 가 없다. Plan §9.5 기준으로 이 디렉토리는 **비어 있는 상태가 정상**이며,
첫 feature 는 Stage 2(Auth · Consent · Onboarding)에서 추가된다.

규칙
- `features/A` 는 `features/B` 를 직접 import 하지 않는다. 조합은 `pages` 에서 한다.
- feature 는 `entities` · `shared` 만 import 한다 (레이어 역방향 import 금지).
- 위 두 규칙은 `pnpm lint:boundaries` 가 강제한다 (`.dependency-cruiser.cjs`).
