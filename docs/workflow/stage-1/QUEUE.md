# Stage 1 Queue

> `/haru-stage-runner` 가 읽는 Stage 1 실행 순서.
> 현재 위치는 이 파일이 아니라 `docs/workflow/WORKFLOW_STATE.md` 가 가진다.

## 실행 순서

| # | Step | Agent | Prompt 문서 | 선행 조건 |
|---|---|---|---|---|
| 1 | `1-D2` | `development-agent` | `docs/workflow/stage-1/stage-1-D2.md` | 1-D1 COMPLETE · S1-D1-1 / S1-D1-2 결정 |
| 2 | `1-E` | `development-agent` | `docs/workflow/stage-1/stage-1-E.md` | 1-D2 COMPLETE |
| 3 | `1-F` | `development-agent` | `docs/workflow/stage-1/stage-1-F.md` | 1-E COMPLETE |
| 4 | `1-G` | `development-agent` | `docs/workflow/stage-1/stage-1-G.md` | 1-F COMPLETE |
| 5 | `1-QA` | `stage-qa-agent` | `docs/workflow/stage-1/stage-1-QA.md` | 1-G COMPLETE |

## Step 간 불변 규칙

- 각 Step은 **이전 Step이 `COMPLETE`** 여야 시작한다.
- 각 Step 종료 시 **공통 검증 6종**이 전부 통과해야 `COMPLETE` 다:
  `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm lint:boundaries` · `pnpm build` · `pnpm format:check`
- 이전 Step의 테스트가 **하나라도 깨지면** 그 Step은 `COMPLETE` 가 아니다 (회귀 금지).
- Step은 **자기 Scope 밖을 구현하지 않는다.** 다음 Step 것을 미리 만들면 QA에서 `FAIL` Finding이다 (`.claude/rules/qa.md` §2).
- 각 Step은 `docs/qa/stage-1<step>-handoff.md` 를 남긴다. `1-G` 가 이들을 `docs/qa/stage-1-handoff.md` 로 통합한다.
- **커밋은 Runner가 하지 않는다.** 사용자가 요청할 때만 한다.

## QA 결과 분기

```
1-QA 실행
├─ Stage Verdict PASS          → Stage 1 COMPLETE 기록 → STOP (사용자 승인 대기)
├─ PARTIAL / INCOMPLETE / FAIL
│   └─ Frontend 범위의 자동 수정 가능 항목만
│       → development-agent 수정 → 1-QA 재실행   (최대 3회)
│       └─ 3회 내 PASS 실패 → STOP + 보고
└─ 즉시 중단 조건 해당          → STOP + 보고
```

`BACKEND_INTEGRATION_PENDING` 은 FAIL 사유가 아니다 (`.claude/rules/qa.md` §1).
