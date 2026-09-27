# Stage 2 Queue

> `/haru-stage-runner` 가 읽는 Stage 2 실행 순서.
> 현재 위치는 `docs/workflow/WORKFLOW_STATE.md` 가 가진다.
> 승인: `docs/decisions/stage-2-approvals.md` (§2 C-13 · §3 Stage 2/2-B 분리 · §4 D-1~D-17 · §5 불일치 · §6 디자이너 요청 · §7 Plan·Design Spec)

## 실행 순서

| # | Step | Agent | Prompt 문서 | 선행 조건 |
|---|---|---|---|---|
| 1 | `2-CONTRACTS` | `development-agent` | `stage-2-CONTRACTS.md` | Plan·Design Spec 승인 |
| 2 | `2-UI` | `development-agent` | `stage-2-UI.md` | 1 COMPLETE |
| 3 | `2-AUTH` | `development-agent` | `stage-2-AUTH.md` | 1·2 COMPLETE |
| 4 | `2-CONSENT` | `development-agent` | `stage-2-CONSENT.md` | 3 COMPLETE |
| 5 | `2-ONBOARDING` | `development-agent` | `stage-2-ONBOARDING.md` | 4 COMPLETE |
| 6 | `2-HOME` | `development-agent` | `stage-2-HOME.md` | 5 COMPLETE |
| 7 | `2-QA` | `stage-qa-agent` | `stage-2-QA.md` | 6 COMPLETE |

**Stage 2-B (이 Queue 밖)**: `C13-09` 프로필 결과 · `C13-10` 발전 역량 + Route Guard 프로필 단계.
디자이너 Figma 도착 후 `docs/design/stage-2-designer-request.md` 를 근거로 별도 진행한다.

## Step 간 불변 규칙

- 이전 Step 이 `COMPLETE` 여야 시작한다.
- 종료 시 **공통 검증 7종**이 전부 통과해야 `COMPLETE` 다:
  `pnpm typecheck` · `lint` · `test` · `lint:boundaries` · `build` · `format:check` · `test:e2e`
- 이전 Step 테스트가 **하나라도 줄면** `COMPLETE` 가 아니다 (회귀 금지).
- **Stage 2-B 화면을 선구현하지 마라.** `/onboarding/profile` · `/onboarding/growth-capability` · `CapabilityDiamondChart` · `PersonaCard` 금지.
- **Stage 3 이상을 선구현하지 마라.** BottomTabBar 마운트 · 서재 · Activity Card · 알림 설정 금지.
- **Backend 금지**: `apps/api/` · `supabase/` · Node/Express · RLS · STT · AI. Contract · Mock · Interface · Requirement · Handoff 문서까지만.
- `AppColumn` **안쪽에 `overflow-*` 선언 금지** (그림자 클리핑 재발 방지 — `27c9af4`).
- 사용자 노출 문구는 **영어**, **진단·판정·비교 표현 금지**. 동의·설문·페르소나 문구는 **API(Mock) 응답 값만** 표시.
- 각 Step 은 `docs/qa/stage-2-<step>-handoff.md` 를 남긴다. `2-HOME` 이 `docs/qa/stage-2-handoff.md` 로 통합한다.
- **커밋은 Runner 가 하지 않는다.**

## Privacy 불변식 (전 Step 공통 — AC-2-13)

**동의 기록이 성공하기 전 구간의 모든 요청에 아동 데이터가 0건이어야 한다.**
Trial 구간(가입 전)은 서버 요청 0건이며 로컬 draft 만 쓴다. 각 Step 은 이 불변식을 깨지 않았음을 요청 로그 테스트로 보인다.

## QA 결과 분기

```
2-QA 실행
├─ Verdict PASS  → Stage 2 COMPLETE → STOP (Stage 3 진입은 사용자 승인 후)
├─ FAIL / INCOMPLETE → development-agent (보고된 Finding ID 만) → 2-QA 재실행 (최대 3회)
└─ 즉시 중단 조건 → STOP + 보고
```
