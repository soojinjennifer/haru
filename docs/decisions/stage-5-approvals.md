# Stage 5 — 사용자 결정 기록

> 기존 문서와 다르면 이 기록이 우선한다. 근거 Plan: `docs/plans/stage-5-plan.md` (DRAFT).

## 1. 결정 목록

| ID | 결정 | 날짜 | 근거 |
|---|---|---|---|
| **`D5-1`** | **Figma 기준 원칙** — 화면·컴포넌트가 Figma 에 있으면 Figma 화면을 기준으로 한다. Plan 의 PRD ↔ Figma 충돌 `PF5-1`~`PF5-6` 은 **Figma 를 따른다** (PRD 해당 항목은 수정 대상으로 기록 — Plan §15.4). Figma 에 없는 화면·컴포넌트에 해당하는 결정(`N5-*` 중 Figma 로 정해지지 않는 것)은 **확정하지 않았다** — design-agent 실측 후 승인 체크포인트에서 다시 묻는다. 사용자 발화: *"피그마 연결을 다시 시도해주고, 화면이나 컴포넌트가 없는 경우가 아니면 피그마 화면을 기준으로 해줘"* | 2026-11-08 | 사용자 결정 |
| **`D5-2`** | **C-13 화면 2개 = design-agent 명세** — `C13-S5-1`(피드백·분석 상태 화면) · `C13-S5-2`(회고 카드의 빈/저장 중/실패/저장됨/재진입 상태). 화면별 명세는 승인 체크포인트에서 확인 | 2026-11-08 | 사용자 결정 (권고안) |
| **`D5-3`** | **Figma 접근** — Plan 작성 시 Figma 실측 불가(`R5-01`) → Orchestrator 가 재시도해 claude.ai Figma 커넥터(계정 `moyo@groundmoyo.com`)로 `29:62`·`91:691` 메타데이터 조회 성공. 프로젝트 `design-agent` 정의의 Figma 도구 이름과 달라 workflow §7 대로 범용 Agent 가 `design-agent.md` 지침을 따른다. 사용자 발화: *"피그마에 다시 접근해봐주고, 안되면 이야기 해줘"* | 2026-11-08 | 사용자 지시 |
| **`D5-4`** | **Stage 5 Plan(`docs/plans/stage-5-plan.md`) · Design Spec(`docs/design/stage-5-design-spec.md`) 승인 + 결정 전 항목 권고안 채택** — Plan `N5-01`~`N5-24` 와 Spec 신규 `N5-25`~`N5-32` 권고안(입력 1칸·한 줄 · 칩 5개 Figma 라벨·on/off · 닫기 = 건너뛰기(요청 없음) · `Chip` select 변형 신설(check 없음, 높이 33, 기존 칩 유지) · 카드 radius 30 · 카드는 버블 뒤 흐름 배치 · 제목 이름 = copy 모듈 · Save 는 입력 후 활성 · 저장 후 Toast + 홈 · 재진입 읽기 전용 · 저장 실패·오프라인 = Toast · 피드백 화면 = 딥링크 전용 · 폴링 15s / 실패 60s · 사용자 재시도 버튼 없음 · `GET /v1/reflection-form` 삭제 · `metricsPreview` 제거 · OAQ-17 enum 변경 없음 · `N5-24` 문구 Spec 초안대로), 토큰 `T5-1`(`--color-rating-empty` = `#d6dedc`) · `T5-2`~`T5-11`, 가값 `P-28`(placeholder 대비 2.3) · `P-29`(별 히트 38×44). 사용자 발화: *"전부 권고안대로 승인"* | 2026-11-08 | 사용자 승인 |
| **`D5-5`** | **회고 카드 입력칸 높이 = Figma 40 유지, 허용 차이 등록** — 터치 타깃 44 미달(S5-B handoff `H5-2`)을 허용 차이로 등록한다 | 2026-11-08 | 사용자 결정 (권고안) |
| **`D5-6`** | **칩 터치 영역 겹침 = 줄 사이 중간선에서 분할** — 보이는 배치는 Figma 그대로, 윗줄(`Big feelings` · `Ask Questions`)과 아랫줄의 겹친 히트 영역만 두 줄의 중간선에서 나눈다 (development-agent 수정 대상) | 2026-11-08 | 사용자 결정 (권고안) |
| **`D5-7`** | **회고 저장 중 `SESSION_INVALID_TRANSITION` = 일반 저장 실패 Toast 문구** — 공통 문구 *"HARU refreshed this storytime"* 대신 일반 실패 문구 사용 (구현 그대로) | 2026-11-08 | 사용자 결정 (권고안) |
| **`D5-8`** | **`REFLECTION_ALREADY_SUBMITTED` = 안내 Toast 후 홈 이동** — 응답에 저장된 회고가 없어 읽기 전용 표시 불가. contract 변경 없음 (구현 그대로) | 2026-11-08 | 사용자 결정 (권고안) |
| **`D5-9`** | **피드백 화면 오류·오프라인·없음 카드 = 항상 전체 폭** (`VG5C-1`) — 안내 카드와 같은 폭(393 기준 345)으로 맞춘다. 앱 CSS 수정, 신규 토큰 없음, Spec 에 폭 기록 (development-agent 수정 대상) | 2026-11-10 | 사용자 결정 (권고안) |
| **`D5-10`** | **피드백 화면 중첩 live region = 안쪽 알림 끔** (`VG5C-2`) — 공유 `InlineAlert` · `ErrorState` 에 선택 prop 을 추가해 이 화면에서만 자체 role 을 끈다. 다른 화면 영향 없음. 실제 스크린리더 확인은 QA 수동 항목 (development-agent 수정 대상) | 2026-11-10 | 사용자 결정 (권고안) |
| **`D5-12`** | **피드백 화면 로딩 `Spinner` 도 안쪽 알림 끔** (`VG5C-3`) — `D5-10` 과 같은 방식으로 공유 `Spinner` 에 선택 `announce="none"` 을 추가해 이 화면에서만 사용. 다른 화면 영향 없음 (development-agent 수정 대상) | 2026-11-10 | 사용자 결정 (권고안) |
| **`D5-13`** | **iOS 입력칸 자동 확대 방지 = viewport `maximum-scale=1`** (QA-5-003 실기기 결과) — 회고 카드 입력칸이 Figma 13px(`--text-footnote`)이라 iOS Safari 가 포커스 때 화면을 확대하고 입력 후에도 돌아오지 않았다. `apps/web/index.html` viewport 에 `maximum-scale=1` 추가, 입력칸 13px 유지. iOS 는 두 손가락 확대 유지, Android Chrome 은 확대가 막힘 → 허용 차이 `AD-S5-2` 로 등록 (development-agent 수정 대상) | 2026-11-11 | 사용자 결정 (권고안) |
| **`D5-14`** | **Mock 아이 이름 = Emma 로 통일 + 긴 이름 제목 두 줄 대응** (S5 H5-7) — `MOCK_CHILD_FIRST_NAME` 을 Figma `91:692`·`88:929` 와 같은 Emma 로 바꾼다. 320px 에서 "How was storytime with Emma?" 가 두 줄이 되어 완료 화면이 4px 스크롤(AC-4-99 위반)되므로, 긴 이름에서도 넘치지 않는 레이아웃을 **design-agent 명세 → 사용자 승인 → 구현** 순서로 처리한다 | 2026-11-11 | 사용자 결정 (권고안) |
| **`D5-15`** | **Spec §13 Addendum D5-14 = 2안 승인** — 카드 아래 여백 29 → `--space-3`(12) + 회고 카드 제목 최대 2줄·말줄임(…) + Figma `91:692` 의 `word-break: break-word` 복원. 393·600·1024 ×852 는 Figma 픽셀 동일, 320×852 에서 40자 이름까지 스크롤 없음. 허용 차이 `AD-S5-3`(여백) · `AD-S5-4`(2줄 제한) 등록. AC-4-99 문구는 *"320 / 393 / 600 / 1024 × 852 에서 40자 이하 `firstName` 에 세로 넘침 없음"* 으로 개정 (plan-agent) | 2026-11-11 | 사용자 승인 |
| **`D5-11`** | **피드백 화면 버블 ↔ 저품질 안내 간격 = 16px 확정** — 구현 그대로, Spec 에 기록 | 2026-11-10 | 사용자 결정 (권고안) |

## 1-1. Stage 5 가값 (`docs/decisions/stage-0-approvals.md` §4 형식)

| ID | 대상 | 가값 | 근거 | 상태 |
|---|---|---|---|---|
| **`P-28`** | 회고 카드 입력칸 placeholder 대비 | 2.3 (S5-D 픽셀 실측 2.31) | `D5-4` | 가값 — 디자이너 확정 대기 |
| **`P-29`** | `StarRating` 별 히트 영역 | 38×44 | `D5-4` | 가값 — 디자이너 확정 대기 |

## 2. 허용 차이 대장 (`AD-S5-x`)

> `CLAUDE.md` 최우선 규칙 6 — 등록은 사용자 승인 이후다. 아래 행은 사용자 결정이 근거다 (Stage 4 대장 형식: `stage-4-approvals.md` §4).

| ID | 어긋난 지점 | Figma | 구현 | 근거 결정 | 상태 |
|---|---|---|---|---|---|
| **`AD-S5-1`** | 회고 카드 **입력칸 터치 타깃** — 높이 40 이라 터치 타깃 44 미달(5점 hit-test 위·아래 점이 카드 면) | `91:715` 330×40 | **Figma 그대로 40** (코드 변경 없음, `--input-height`) — `e2e/reflection-card.spec.ts` 5점 hit-test 가 `…(optional):ns` 로 고정 | **`D5-5`** (S5-B handoff `H5-2.5`) | ✅ **등록 (2026-11-08, user — `D5-5`)** |
| **`AD-S5-2`** | **viewport 확대 제한** — `maximum-scale=1` 로 Android Chrome 에서 두 손가락 확대가 막힌다 (WCAG 1.4.4 관련). iOS 는 사용자 확대 허용 유지 | — (Figma 무관) | `apps/web/index.html` viewport `maximum-scale=1` | **`D5-13`** (QA-5-003) | ✅ **등록 (2026-11-11, user — `D5-13`)** |
| **`AD-S5-3`** | 완료 화면 **회고 카드 아래 여백** — 852 높이에서는 보이지 않고 스크롤될 때만 보임 | 29 | `--space-3` (12) | **`D5-15`** (Spec §13) | ✅ **등록 (2026-11-11, user — `D5-15`)** |
| **`AD-S5-4`** | 회고 카드 **제목 줄 수 제한** — 3줄 이상이 될 긴 이름은 2줄에서 말줄임(…) | 제한 없음 (`91:692` break-word) | 최대 2줄 + … | **`D5-15`** (Spec §13) | ✅ **등록 (2026-11-11, user — `D5-15`)** |
