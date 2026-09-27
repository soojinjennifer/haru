# Stage 2-QA — Stage 2 최종 검증

## Scope
Stage 2 전체를 **독립적으로** 검증하고 Stage Verdict 를 낸다. 구현자의 handoff 는 증거가 아니다.

## Agent
`stage-qa-agent`

## Source Files (필요한 절만)
- `docs/plans/stage-2-plan.md` §11 — **AC-2-01 ~ AC-2-68 전체**
- `docs/design/stage-2-design-spec.md` §10 시각 비교 기준 · 허용 차이 `AD-S2-*`
- `docs/qa/stage-2-handoff.md` — 통합 인계 (참고 자료이지 증거가 아니다)
- `docs/decisions/stage-2-approvals.md` — §2 C-13 · §3 Stage 2/2-B 분리 · §4 D-1~D-17 · §6 디자이너 요청
- `.claude/rules/qa.md`

## Required Work
1. **AC-2-01~68 전 항목 판정**: `PASS` · `PARTIAL` · `FAIL` · `NOT VERIFIED` · `BACKEND_INTEGRATION_PENDING`
2. **Stage 2-B 이관 항목은 Verdict 계산에서 제외**한다 (approvals §3). `C13-09`·`C13-10`·`D-2` 시각 표현·`D-6` 프로필 단계에만 의존하는 AC 가 대상이며, 제외 사유를 항목별로 적어라
3. **Privacy 중점 검증 (AC-2-13)**: 동의 기록 성공 **이전** 구간 요청에 아동 데이터 0건 · Trial 구간 서버 요청 0건을 **직접 재현**하라
4. **Scope 검증**: `apps/api/`·`supabase/`·`apps/mobile/` 부재 · Stage 3 이상 선행 구현 0건(BottomTabBar 마운트·서재·Activity Card) · Stage 2-B 선구현 0건
5. **`L-02` 확인**: Mock `ConsentDocument.url` 이 실제 문서가 아님을 확인 항목으로 판정하라 (approvals §4.1)
6. 남은 가값 `P-01 · P-02 · P-04 · P-05 · P-16 · P-17` 목록을 리포트에 기록 (FAIL 사유 아님)
7. `docs/qa/stage-2-qa-report.md` 작성 — Finding 은 `QA-2-###`

## Forbidden Work
- **Product Code 수정 금지.** 테스트·설정을 통과시키려 고치는 것도 금지
- 증거 없는 PASS · 다음 Stage 착수

## Verification
QA 가 직접 실행: `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `test` · `lint:boundaries` · `build`(mock/http 2모드) · `test:e2e` · `assert:no-mocks`.
실행하지 못한 명령은 `NOT VERIFIED`.

## Exit Criteria
| Verdict | 조건 | 다음 |
|---|---|---|
| `PASS` | In Scope 전 항목이 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` | Stage 2 COMPLETE → **STOP**, Stage 3 은 사용자 승인 후 |
| `INCOMPLETE` | `FAIL` 0, `PARTIAL`/`NOT VERIFIED` ≥ 1 | 수정 루프 또는 항목별 수용 |
| `FAIL` | `FAIL` ≥ 1 | development-agent 수정 → 재검증 (최대 3회) |
