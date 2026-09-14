# Stage 0 Approval Log

사용자 결정 기록 (Orchestrator 작성). 항목 번호는 `PLANNING.md` §10 Stage 1 Pre-Approval Checklist 기준.
결정과 기존 문서 내용이 다르면 **이 기록이 우선**하며, 해당 문서는 결정 반영 시 갱신한다.

## 1. 승인된 결정

| # | 항목 | 결정 | 일자 |
|---|---|---|---|
| 2 | 개발 범위 | Frontend-only (Backend = Contract · Mock · Handoff, Stage 8 후 STOP) | 2026-09-14 |
| 5 | 패키지 구조 | 권장안 승인 — `validation` → `contracts` 병합, `shared-types` 미생성, `apps/mobile` 추가 (생성 시점은 #7 결정에 따름) | 2026-09-14 |
| 6 | Package manager | pnpm workspaces + Node LTS | 2026-09-14 |
| 8 | Mock 구조 | 도메인별 `Mock<Domain>Api` / `Http<Domain>Api` + 공통 helper, MSW 미사용 | 2026-09-14 |
| 13 | Capability 코드 키 | `emotion_regulation` · `self_directed_agency` · `cognitive_flexibility` · `intrinsic_motivation` (사용자 노출 라벨은 #14 별도) | 2026-09-14 |
| 16 | Session 상태 모델 | ARCHITECTURE §10 모델 승인 — PRD 7상태 + `abandoned`, `mode`, `completedReason`, `analysisOutcome`, 별도 upload status, retry는 상태 아님 (OAQ-08·OAQ-17 의존 값은 결정 전 제외) | 2026-09-14 |
| 20 | Dark mode | MVP 제외 (Light 전용) | 2026-09-14 |
| 24 | 승인 체크포인트 | Stage 수행 요청 ≠ Plan/Spec 승인. 전체 구현 요청은 plan-agent + design-agent 산출물 후 1회 멈춤 → 사용자 승인 → development-agent | 2026-09-14 |
| 25 | Stage Verdict | `INCOMPLETE` (FAIL 0 + PARTIAL/NOT VERIFIED ≥ 1) 는 PASS 아님. 사용자가 QA-N-### 단위로 명시 수용 시 `PASS (accepted: …)` | 2026-09-14 |
| 26 | 쓰기 경로 강제 hook | 도입 승인 — `apps/api/**`, `supabase/**` 전 Agent 차단, `apps/**`·`packages/**` 는 development-agent 외 차단. **설정 시점: 새 저장소 구성 시 `.claude/settings.json`** | 2026-09-14 |
| 27 | Supabase JS Client | Stage 1–8 미사용, Auth·Upload는 interface + Mock | 2026-09-14 |
| 4 | 저장소 | 로컬 `~/dev/haru` (OneDrive 밖) + origin `https://github.com/soojinjennifer/haru.git` (private, GitHub = 백업·다기기 동기화). 포함: Stage 0 문서·설정, `docs/source/` (PRD·8Stage v0.2 사본), `docs/source/prompts/` (사용자 지시 원문). 미포함: Baseline Survey 문서. 홈 디렉토리 git(Lawservice)은 그대로 둔다. 초기 구성·첫 커밋·push 즉시 진행 | 2026-09-14 |
| 9 | Stack 외 라이브러리 | 제안대로 — 차트 inline SVG, 제스처·애니메이션 CSS / Pointer Events 우선 (라이브러리는 필요 시 별도 승인), dev 전용 UI gallery route, import 경계 lint 도구, (필요 시) TanStack Query persist. 아이콘 라이브러리 여부는 #21 결정에 따름 | 2026-09-14 |
| 28 | E2E·스크린샷 도구 | Playwright | 2026-09-14 |
| 29 | Tailwind | v4 (CSS-first `@theme`) | 2026-09-14 |
| 7 | Capacitor | **도입, Stage 4에서 추가** — Stage 1–3은 웹 전용으로 개발(`AuthGateway`·Push 권한 UX는 Web + Mock), Stage 4에서 `apps/mobile` Capacitor 셸 + 네이티브 녹음 플러그인·네이티브 Auth/Push Adapter 추가. 실기기 녹음 QA는 Stage 4부터 | 2026-09-14 |

## 2. 결정 대기 — 요청 순서

| 순서 | # | 항목 | 비고 |
|---|---|---|---|
| ~~1~~ | 7 | Capacitor 도입 여부·시점 | **결정 완료** (§1) |
| ~~2~~ | 4 | 저장소 세부 (로컬 경로, 이전 방식, 홈 git) | **결정 완료** (§1) |
| 3 | 18 | WCAG 대비 수정 방식 | Stage 1 차단, 디자이너 확인 |
| 4 | 10 | 토큰 정규화 + 신규 토큰 값 | 디자이너 확인 |
| 5 | 11 | 폰트 | 법무·디자인 |
| 6 | 12 | Breakpoint · 앱 컬럼 최대폭 | |
| 7 | 15 | 내비게이션 구조 | |
| 8 | 14 | Capability 사용자 노출 라벨 | |
| 9 | 19 | Capability 색 매핑 | |
| 10 | 21 | 아이콘 소스 | |
| 11 | 22 | 공통 상태 디자인 방식 | |
| 12 | 17 | contracts 상수 가값 | |
| 13 | 1 | Stage 0 산출물 전체 승인 | 결정 반영 후 |
| — | 3(잔여), 23, 30, 31, 32, M-01/02/03/04/05/06/07/16/27/28/38, Trial | Stage 2 전까지 | Stage 1 비차단 |

## 3. 반영 상태

- `CLAUDE.md`, `.claude/rules/*`, `.claude/agents/*`: #5, #6, #8, #16, #24, #25, #26(설정 예정), #27, #9, #28, #29, #7, #4 반영 (2026-09-14)
- 저장소 이전: OneDrive `HARU Dev` → `~/dev/haru` (2026-09-14). `docs/source/` 사본으로 경로 참조 교체, `$HARU_ONEDRIVE` 경로 정의는 CLAUDE.md
- #26 hook: `.claude/settings.json` + `.claude/hooks/write_guard.py`, `scope_check.py` 설정 완료 (다음 세션부터 적용)
- `PLANNING.md`, `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_MODEL.md`, 디자인 문서 5종: 남은 Stage 1 차단 결정 수집 후 plan-agent / design-agent가 라벨·내용 일괄 반영 예정
