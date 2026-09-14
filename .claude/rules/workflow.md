# HARU Agent Workflow Rules

HARU의 모든 Stage / 기능 작업은 아래 4개 프로젝트 Agent로 수행한다.
정의 파일: `.claude/agents/plan-agent.md`, `design-agent.md`, `development-agent.md`, `stage-qa-agent.md`

**모든 Agent는 현재 개발 Scope가 Frontend라는 사실을 우선한다** (CLAUDE.md "Development Scope", `docs/source/prompts/01-stage0-1-1-frontend-scope.md`).

## 1. 요청 유형별 Agent 호출 순서

| 요청 유형 | 예시 | 호출 순서 |
|---|---|---|
| 전체 구현 | "Stage 3을 진행해줘", "Activity Card 기능을 구현해줘" | `plan-agent → design-agent → [승인 체크포인트 (§3)] → development-agent → stage-qa-agent` |
| 계획만 | "계획만 세워줘", "구현하지 말고 분석해줘", "다음 Stage Plan을 만들어줘" | `plan-agent` |
| 디자인 검토만 | "이 Figma 화면을 분석해줘", "컴포넌트 구조만 정리해줘", "Design System만 검토해줘" | `design-agent` |
| 구현 (승인된 Plan 존재) | "이 계획대로 구현해줘" | `development-agent → stage-qa-agent` |
| QA만 | "Stage QA 실행해줘", "지금 구현한 부분 검증해줘" | `stage-qa-agent` |

즉 **PLAN → DESIGN → IMPLEMENT → VERIFY** 순서를 유지하며, 전체 구현 요청에서는 어떤 단계도 생략하지 않는다.

Agent별 Frontend-only 역할:

- plan-agent: Frontend Plan 작성. Backend는 구현 계획이 아니라 Integration Requirement와 Contract만 정의한다.
- design-agent: Figma와 Frontend Component 구조만 담당한다.
- development-agent: Frontend Production Code(+ `packages/contracts`, Mock)만 수정한다. Backend Production Code 작성 금지.
- stage-qa-agent: Frontend를 검증한다. 실제 Backend가 없어 검증할 수 없는 부분은 `BACKEND_INTEGRATION_PENDING`.

QA 결과가 FAIL이면:

```
stage-qa-agent (수정 항목 보고)
→ development-agent (보고된 항목만 수정)
→ stage-qa-agent (재검증)
```

PASS가 될 때까지 반복한다.

"이 계획대로 구현해줘" 요청이라도 승인된 Plan이 없거나 Plan이 현재 PRD/Figma와 맞지 않으면 구현하지 않고 **plan-agent 재검토 필요**를 보고한다.

## 2. 불변 원칙

- **Plan Agent는 코드 수정 금지** — 계획·요구사항 문서만 작성한다.
- **Design Agent는 Production Code 수정 금지** — 디자인 명세 문서만 작성하며 Figma도 수정하지 않는다.
- **QA Agent는 Product Code 수정 금지** — QA 리포트만 작성한다.
- **수정 책임은 Development Agent** 에게만 있다.
- **Stage QA PASS 전 다음 Stage 진입 금지.**
- **최신 PRD와 Figma를 이전 Agent Memory보다 우선한다.** 대화 기억, 과거 계획, 캐시된 분석이 최신 PRD/Figma/사용자 지시와 다르면 최신 자료를 따른다.
- **승인된 Scope 밖의 구현 금지.** 다음 Stage 기능을 편의상 선행 구현하지 않는다.
- **Backend 구현 금지.** `apps/api/`, `supabase/migrations`, RLS policy, worker, cron, STT/AI backend, Render 배포를 만들지 않는다 (사용자 별도 명시 요청 시에만 예외).
- PRD와 Figma에 없는 요구사항을 임의로 추가하지 않는다. 불일치는 보고하고 사용자 결정을 기다린다.
- Architecture / Stack 변경은 구현 전에 이유와 대안을 보고하고 승인을 받는다.

## 3. 승인(Approval) 규칙

- 승인은 사용자의 명시적 승인 발화로만 성립한다 (예: "Stage 2 Plan 승인", "Design Spec 승인"). Agent와 Orchestrator는 스스로 승인하지 않는다.
- [승인 2026-09-14, Stage 0 #24] **Stage 수행 요청("Stage 3을 진행해줘")은 Plan / Design Spec 승인이 아니다.** 요청은 워크플로 시작을 의미할 뿐이다.
- [승인 2026-09-14, Stage 0 #24] 전체 구현 요청의 **승인 체크포인트**: plan-agent와 design-agent 산출물이 나오면 Orchestrator는 `stage-N-plan.md` + `stage-N-design-spec.md` 를 요약 보고하고 **멈춘다**. 사용자 승인 후 development-agent를 시작한다.- 승인되면 해당 문서의 `Status:` 를 `APPROVED (YYYY-MM-DD, user)` 로 갱신한다.
- [승인 2026-09-14, Stage 0 #10-4] 가값 토큰(`docs/decisions/stage-0-approvals.md` §4)은 Stage 1 구현 완료 후 Orchestrator가 항목별로 하나씩 사용자에게 유지 / 수정 / 디자이너 대기 승인을 요청한다.
- [승인 2026-09-14, Stage 0 C-13] Figma에 없는 화면은 해당 Stage의 plan/design 단계에서 Orchestrator가 화면별로 사용자에게 ① 디자이너에게 Figma 디자인 요청 ② design-agent 명세 작성 중 무엇으로 할지 묻고, 승인 후에만 디자인·구현한다. (공통 상태 화면은 #22에 따라 명세 우선)
- 한 Stage에 대한 승인은 다음 Stage로 확장되지 않는다. Stage Verdict 보고 후에도 멈추고 다음 Stage 지시를 기다린다.
- Stage 1 구현은 Stage 0 산출물에 대한 사용자 승인 이후에만 시작한다.

## 4. Stage Gate

```
Stage N Plan (plan-agent)            → docs/plans/stage-N-plan.md
Stage N Design Spec (design-agent)   → docs/design/stage-N-design-spec.md
── 승인 체크포인트 (사용자) ──
Stage N 구현 (development-agent)     → 코드 + docs/qa/stage-N-handoff.md
Stage N QA (stage-qa-agent)          → docs/qa/stage-N-qa-report.md
Stage Verdict 보고 → 멈춤
Stage Verdict: PASS                  → PLANNING.md 진행 상태 갱신 → 사용자 지시 시 다음 Stage
```

Stage Verdict (상세: `.claude/rules/qa.md`):

| Verdict | 조건 | 다음 Stage |
|---|---|---|
| `PASS` | In Scope 항목이 모두 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` | 가능 (사용자 지시 시) |
| `FAIL` | `FAIL` ≥ 1 | 불가 → 수정 루프 |
| `INCOMPLETE` | `FAIL` 0, `PARTIAL` 또는 `NOT VERIFIED` ≥ 1 | 불가. 단 사용자가 잔여 항목을 **항목별로 명시 수용**하면 `PASS (accepted: QA-N-###…)` 로 기록 (승인 2026-09-14, Stage 0 #25) |

- 순수 로직 Stage라도 UI 영향이 없음을 design-agent가 확인하는 절차는 생략하지 않는다 (확인 결과 "UI 영향 없음" 기록).

## 5. Stage 8 종료 조건

- Stage 8 = Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능(데이터 관리·탈퇴, 동의 이력 보기는 선택 — Stage 0 C-15·C-19) + Backend Handoff Package.
- Handoff 산출물: `docs/BACKEND_HANDOFF.md`, `docs/API_CONTRACTS.md`, `docs/DATA_REQUIREMENTS.md`, `docs/AUTH_REQUIREMENTS.md`, `docs/RECORDING_UPLOAD_SPEC.md`, `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md`, `docs/ERROR_CODES.md` + `packages/contracts` 최종 검증.
- Handoff 문서 작성 책임 (**단일 기준** — agents·PLANNING은 이 규칙을 따른다):
  1. **plan-agent** — Stage 8 Plan 작성 시 6종 요구사항 문서의 **초안 파일을 생성**한다: `BACKEND_HANDOFF.md`, `DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md`, `RECORDING_UPLOAD_SPEC.md`, `ANALYSIS_PIPELINE_REQUIREMENTS.md`, `ERROR_CODES.md` (전 Stage `BACKEND_INTEGRATION_PENDING` 목록 집계, `DATA_MODEL.md` 이관 등).
  2. **development-agent** — Stage 8 구현 단계에서 실제 `packages/contracts`·Mock 위치·Screen/Feature 연결을 반영해 6종을 **완성**하고, `API_CONTRACTS.md` 를 구현된 contracts와 일치시킨다.
  3. **stage-qa-agent** — 7종 문서와 contracts·Mock·QA 리포트 PENDING 목록의 1:1 일치를 **검증**한다.
- `docs/API_CONTRACTS.md` 소유: 설계·계획 변경은 plan-agent, 구현으로 확정된 contract 반영은 development-agent. 두 Agent가 같은 Stage 단계에서 동시에 수정하지 않는다.
- Frontend Final QA와 Handoff 문서 생성이 완료되면 **반드시 작업을 중단**하고 최종 보고 후 사용자 승인을 기다린다.
- 자동으로 시작하지 않는 것: Backend implementation, Supabase migration, Node API, STT, AI Analysis, Render deployment.
- Stage 8 배포 범위 (Stage 0 C-18): Mock 모드 웹 프리뷰 정적 배포만. 앱 테스트 빌드와 Backend 배포는 제외한다.

## 6. Agent 간 인계 파일

| From → To | 파일 |
|---|---|
| plan-agent → design-agent | `docs/plans/stage-N-plan.md` §Handoff |
| design-agent → development-agent | `docs/design/stage-N-design-spec.md` |
| development-agent → stage-qa-agent | `docs/qa/stage-N-handoff.md` |
| stage-qa-agent → development-agent | `docs/qa/stage-N-qa-report.md` Findings (QA-N-###) |

## 7. Agent 실행 방법

- `.claude/agents/*.md` 는 Claude Code 세션 시작 시 로드된다. 새로 만들었거나 수정한 직후 세션에서는 `subagent_type`으로 호출되지 않을 수 있다.
- 그 경우 Orchestrator는 범용 Agent를 사용하되, 해당 Agent 정의 파일 전체를 지침으로 따르도록 지시하고 동일한 권한 제한과 Frontend-only Scope를 프롬프트에 명시한다.
- HARU Stage 작업에서는 전역 OMC의 범용 executor / verifier 라우팅보다 이 4개 프로젝트 Agent 규칙을 우선한다.
- Orchestrator(메인 세션)는 Agent 결과를 사용자에게 요약 보고하고, 승인 체크포인트와 Stage Verdict 보고 시점에서 멈춘다.
- 쓰기 경로 강제 PreToolUse hook 도입이 승인되었다 (2026-09-14, Stage 0 #26): `apps/api/**`, `supabase/**` 는 모든 Agent 차단, `apps/**`·`packages/**` 는 development-agent 외 차단. `.claude/settings.json` + `.claude/hooks/write_guard.py` · `scope_check.py` 로 설정되어 있다 (2026-09-14). Bash 경유 쓰기는 PreToolUse로 완전히 막히지 않으므로 지침과 QA로 보완한다.
