# HARU Scope Simplification — 산출물 간소화 결정

Status: **APPROVED (2026-11-07, user)** — 사용자 지시 *"앞으로 구현할 내용을 프론트 화면 구현에 집중해서 조금 간소화해서 진행하는 방향으로 수정해줘"* + 선택 항목 **① 산출 문서 분량 감축 · ② Mock 시나리오 한정**.

적용 범위: **Stage 4b 잔여 작업 단위(`S4-F2` ~ `S4-K`) 와 Stage 5 ~ 8**. 이미 PASS 된 Stage 0~4a 의 산출물은 **소급해서 고치지 않는다**.

---

## 0. 사용자가 고르지 않은 것 (중요)

제시된 4개 레버 중 **2개만 채택**됐다. 아래 두 건은 **채택되지 않았으므로 그대로 둔다**:

| 미채택 | 뜻 |
|---|---|
| Stage 6 을 Stage 5·7 로 흡수 | **8단계 구조를 유지한다.** Stage 6(개인화·프로필 수정·추천 루프)은 독립 Stage 로 남는다 |
| Stage 7 리포트 축소 | **4주 리포트 범위를 그대로 유지한다.** PDF 생성·공유 UX 와 하이라이트 재생도 Stage 7 In Scope 다 |

또한 이 결정은 **Acceptance Criteria 개수를 줄이지 않는다.** 줄이는 것은 *문서 분량*과 *Mock 시나리오 수*이며, 검증의 촘촘함(AC 번호 체계 · 증거 요구 · `BACKEND_INTEGRATION_PENDING` 표기)은 **그대로 유지**한다.

---

## 1. `D-SIMP-1` — 산출 문서 분량 감축

### 배경 (실측)

| 문서 | 줄 수 |
|---|---|
| `docs/plans/stage-4-plan.md` | **1,733** |
| `docs/design/stage-4-design-spec.md` | **1,898** |
| `docs/design/stage-4-session-figma-audit.md` | 1,031 |
| `docs/plans/stage-3-plan.md` | 1,151 |
| (참고) `docs/plans/stage-1-plan.md` | 726 |

Stage 1 → 4 로 가며 Plan 분량이 **2.4배**로 늘었다. 늘어난 부분은 화면 구현 정보가 아니라 **검토 경위·대안 비교·다른 문서의 재인용**이다.

### 상한 (plan-agent · design-agent 가 지킨다)

| 산출물 | 상한 |
|---|---|
| Stage Plan (`docs/plans/stage-N-plan.md`) | **800줄** |
| Stage Design Spec (`docs/design/stage-N-design-spec.md`) | **800줄** |
| 작업 단위 Plan / Spec (`stage-Nx-…`) | **450줄** |
| Visual Gap 리포트 | **250줄** |

상한을 넘길 근거가 있으면 **초과 사유와 넘긴 분량을 보고하고 승인**을 받는다. 조용히 넘기지 않는다.

### 남기는 것 (줄이지 않는다)

- 화면별 **Figma 노드 ID** 와 **실측 치수** (`R-FIGMA-1` — 실측 없는 구현 금지는 유지)
- **Design Token 매핑** · 컴포넌트·Variant·State 목록
- **Acceptance Criteria** 전문 (번호 · 요구사항 · 증거 방법 · 판정 단위)
- **차단 결정**(Blocking decision)과 `BACKEND_INTEGRATION_PENDING` 목록
- Figma 에 없는 화면(`C-13`) 처리 방식

### 빼는 것

- PRD·Figma·이전 Stage 문서 내용의 **재서술·재인용** → 경로와 절 번호로 **참조만** 한다
- **대안 비교와 검토 경위** (왜 A 대신 B 인지의 서술) → 결론 1줄 + 결정 번호
- 같은 규칙의 **반복 설명** (`rules/*.md` 에 이미 있는 것)
- 내부 검토 메모(`PM-x` · `N4B-x` · `X-xx` 류) → Plan 본문에서 분리해 별도 파일 또는 생략
- Figma 감사 문서를 **별도 파일로 만들지 않는다** → Design Spec 안의 노드 표로 흡수

---

## 2. `D-SIMP-2` — Mock 시나리오 한정

### 기준

각 Stage 가 **실제로 만드는** Mock 시나리오는 다음으로 한정한다.

1. **필수 5종** — `SUCCESS` · `LOADING` · `EMPTY` · `ERROR` · `RETRY` (`rules/frontend.md` §5)
2. **그 Stage 화면이 실제로 렌더하는 상태에 1:1 대응하는 것**만 추가

### Mock 으로 만들지 않는 것

화면에 보이는 차이가 없고 **서버 동작을 검증하는 성격**의 시나리오는 Mock 으로 만들지 않고, `docs/BACKEND_HANDOFF.md` 의 **요구사항으로 기록**한다. 예:

- 멱등성(같은 요청 2회 → 같은 응답)
- 전이 경합·이중 요청 처리
- 보관 정책·삭제 SLA·cascade
- 집계 규칙(리포트 발행 기준 계산 등)의 서버 측 판정

### 유지되는 것

- **contracts 전이표 · error code 거부 테스트** — 화면과 무관해도 계약 정합성의 근거이므로 유지한다 (`rules/qa.md` Contract/Mock 체크리스트)
- `PLANNING.md` §5 의 Stage 별 시나리오 목록은 **후보 집합(superset)** 으로 그대로 둔다. 각 Stage Plan 이 거기서 위 기준에 맞는 것만 **선택**하고, 선택하지 않은 항목은 **인계 문서 대상으로 명시**한다

---

## 3. QA 에 주는 영향

- 문서가 짧아진 것은 **FAIL 사유가 아니다**. stage-qa-agent 는 분량이 아니라 **AC 판정 가능 여부**로 본다.
- 만들지 않기로 한 Mock 시나리오는 `NOT VERIFIED` 가 아니라 **`BACKEND_INTEGRATION_PENDING`** 으로 기록한다 — 단, `rules/qa.md` §1 의 PENDING 조건 3개를 그대로 만족해야 한다. 특히 ③ *"Contract 가 요구사항을 표현하지 못하거나 Mock 이 Contract 와 다르면 PENDING 이 아니라 FAIL"* 은 이 결정으로 완화되지 않는다.
- `rules/workflow.md` §4 Stage Gate 와 Verdict 기준은 **변경 없다**.

---

## 4. 걸어 둔 곳

| 문서 | 반영 |
|---|---|
| `.claude/rules/workflow.md` | §2-1 산출물 분량 기준 |
| `.claude/rules/frontend.md` | §5 Mock 시나리오 한정 기준 |
| `PLANNING.md` | §5 머리말 · §11 결정 목록 |
| `docs/workflow/WORKFLOW_STATE.md` | §1 현재 위치 비고 |
