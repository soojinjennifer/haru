# Stage 1-QA — Stage 1 최종 검증

## Scope
Stage 1 전체를 **독립적으로** 검증하고 Stage Verdict 를 낸다. 구현자의 handoff 메모는 증거가 아니다.

## Agent
`stage-qa-agent`

## Source Files
- `docs/plans/stage-1-plan.md` §11 — **AC-1-01 ~ AC-1-45 전체**
- `docs/design/stage-1-design-spec.md` §10.2(시각 비교 기준) · §10.3(허용 차이)
- `docs/qa/stage-1-handoff.md` — 1-G 가 통합한 인계 문서
- `.claude/rules/qa.md` — 판정 기준 · Severity · 체크리스트
- `docs/decisions/stage-0-approvals.md` §3(D-01~D-04 수용 예외) · §4(가값 P-01~P-16)
- `docs/decisions/stage-1-approvals.md`

## Required Work
1. **AC-1-01 ~ AC-1-45 전 항목**에 판정을 남긴다: `PASS` · `PARTIAL` · `FAIL` · `NOT VERIFIED` · `BACKEND_INTEGRATION_PENDING`
2. 판정은 **QA 가 직접 실행한 증거**로만 한다. 코드 존재만으로 PASS 금지
3. `.claude/rules/qa.md` §5 체크리스트 전 항목 수행: Scope · Contract/Mock · Figma/Design System · Architecture/Type Safety · State 화면 · Responsive/Accessibility · Privacy · Regression
4. **Scope 검증**: `apps/api/` · `supabase/` · `apps/mobile/` 부재를 파일 목록 증거로 확인. Stage 2 이상 선행 구현이 있으면 `FAIL` Finding
5. 남은 **가값(P-xx) 목록**을 리포트에 기록한다. 가값 자체는 FAIL 사유가 아니다
6. 수용 예외(D-01 등)는 `PASS (accepted: D-xx)` 로 기록
7. `docs/qa/stage-1-qa-report.md` 작성 — Finding 은 `QA-1-###` 로 번호를 매긴다

## Forbidden Work
- **Product Code 수정 금지** (`.claude/rules/workflow.md` §2). 수정은 development-agent 만
- 테스트·설정 파일을 "통과시키기 위해" 고치는 행위
- 증거 없이 PASS 판정
- 다음 Stage 착수

## Verification
QA 자신이 실행해야 하는 명령:
`pnpm install --frozen-lockfile` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm lint:boundaries` · `pnpm build`(`mock`/`http` 2모드) · `pnpm test:e2e` · `pnpm assert:no-mocks`
실행하지 못한 명령은 `NOT VERIFIED` 로 기록한다.

## Exit Criteria
Stage Verdict 를 산출한다 (`.claude/rules/qa.md` §2):

| Verdict | 조건 | 다음 동작 |
|---|---|---|
| `PASS` | In Scope 전 항목이 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` | Stage 1 `COMPLETE` 기록 → **STOP**, 사용자 승인 대기 |
| `INCOMPLETE` | `FAIL` 0, `PARTIAL`/`NOT VERIFIED` ≥ 1 | 수정 루프 또는 사용자 항목별 수용 |
| `FAIL` | `FAIL` ≥ 1 | development-agent 수정 → 재검증 (최대 3회) |

Stage 1 PASS 후에도 **Stage 2 로 자동 진입하지 않는다.**
