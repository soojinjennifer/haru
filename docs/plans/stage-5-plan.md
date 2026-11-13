# Stage 5 Plan — Reflection + Async Analysis Status + Short Feedback (Frontend)

Status: **APPROVED (2026-11-08, user)** — 사용자 발화 *"전부 권고안대로 승인"* (`D5-4`, `docs/decisions/stage-5-approvals.md`). 이전 상태: **DRAFT** (2026-11-08, plan-agent) — 사용자 지시 *"커밋하고 Stage 5 진행해줘"* (2026-11-08) 로 워크플로 1단계 착수. **이 지시는 Plan 승인이 아니다** (`rules/workflow.md` §3). 승인 체크포인트 = §19.
Based on:
- PRD **v1.5 개정 3 + 보완** (`docs/source/HARU_PRD_v1.5.md`, 2026-11-07/08, sha1 `3452f7c1…`) — §5.1 ⑦ · §5.2 단계 4 · §5.3 #10·#11 · §6.1 서재 평점 · §7.5 제출 행 · **§7.6** · §7.9 하이라이트 클립 · FR-12·13·14·18 · §11 성능(24h)·콘텐츠 안전 · §12.1 Session · §12.2 · §13 STT 저품질·민감 발화·30분 초과
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` page `16:2` — **`29:62` "1c · Session — Complete & Feedback" 하단 `91:691` Feedback Card** + loose `91:627`·`91:628` (Select 변형). 실측 출처와 한계는 §0.1
- `docs/API_CONTRACTS.md` **Rev 8.13** (Stage 5 표 §4 · §5.3 · §5.4 · §6 `G-06`) · `docs/ARCHITECTURE.md` §10.2 분석 표시 상태 매핑 · `docs/DATA_MODEL.md` §9 · `PLANNING.md` §5 Stage 5 초안
- 결정 기록 `docs/decisions/stage-0-approvals.md` (#16 · #17 · #22 · C-13) · `stage-4-approvals.md` (`D4-9` · `D4-44` · `D4-86` · `D4-88` · `D4-91` · `D4-113` · `N4-16`)
- Stage 4 산출물: `docs/plans/stage-4-plan.md` §3.1 · `docs/plans/stage-4b-plan.md` · `docs/qa/stage-4b-qa-report.md` (`PASS (accepted: NV-4B-2, NV-4B-3)`, 2026-11-08) · 코드 `apps/web/src/features/storytime-session/ui/SessionCompleteScreen.tsx` · `pages/session/SessionCompletePage.tsx` · `mocks/sessions/*` · `mocks/recordings/MockRecordingApi.ts`

Author: plan-agent (2026-11-08)

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 초판 | 2026-11-08 | Stage 5 범위 확정 · PRD↔Figma 충돌 6건(`PF5-1`~`6`) · C-13 대상 3건 · 결정 `N5-01`~`N5-24` · AC-5-01~56 · 작업 단위 `S5-A`~`S5-E` |
| 결정 기록 | 2026-11-11 | `D5-13` iOS 입력칸 자동 확대 방지 = viewport `maximum-scale=1` (`AD-S5-2`) · `D5-14` Mock 아이 이름 Emma 통일 + 긴 이름 제목 두 줄 대응 · `D5-15` Spec §13 2안 승인 — 카드 아래 여백 `--space-3` (`AD-S5-3`) · 제목 최대 2줄 말줄임 (`AD-S5-4`) · `break-word` 복원 · **AC-4-99 문구 개정** (`stage-4-plan.md` · `stage-4b-plan.md`, 원문은 주석 보존). 출처 `docs/decisions/stage-5-approvals.md` |

---

## 0. 출발점 — 무엇이 이미 있고 무엇이 없는가

| 항목 | 현재 상태 `[직독]` | Stage 5 에 주는 의미 |
|---|---|---|
| Stage 4 게이트 | 4a `PASS (accepted: D4-34, NV-4A-1)` · 4b `PASS (accepted: NV-4B-2, NV-4B-3)` — 커밋 `99b0baa`·`fd8748d` | ✅ `D4-9` 조건 충족 — 완료 화면(`29:62` y 0~468)이 존재하므로 카드를 **실제 상단 위에** 얹을 수 있다 |
| 완료 화면 | `SessionCompleteScreen` = 닫기 줄(→ 홈 replace, `D4-86`) · 제목 · 스티커 슬롯 64 · 메달리온 · 완료 버블. **y 468 아래 의도적 공백** — 파일 머리 주석 + e2e AC-4-61·104 *"y 468 아래 렌더 요소 0"* | ⚠️ **Stage 4 산출물 재작업 지점** — §5.4 |
| 세션 상태 | contracts 전이표 14행. Mock 은 녹음 `complete` 확정 시 `completed → analyzing`(actor `server`)까지 수행. **`analyzing → analyzed/failed`(actor `worker`)는 Mock 이 수행하지 않는다** | Stage 5 Mock 이 worker 전이를 시나리오로 재현해야 한다 |
| `SessionSummary.analysisOutcome` | 구현됨 (`full` · `excluded_low_quality` · null) | 표시는 Stage 5 가 처음 |
| `SessionDetail` | `summary + recording + sticker + completionBubble`. **`reflection` 없음** — 주석 *"Stage 5 에서 추가 (`C4-OPEN-6`)"* | 필드 추가 → **모든 Mock Detail fixture 갱신** (`completionBubble` 선례) |
| reflection / analysis contracts | **0건** (`grep -rn reflection packages/contracts/src` → `session.ts` 주석 1줄뿐) | 전부 신규 |
| Mock 폴더 | `mocks/` 에 `reflections/`·`analysis/` **없음** | 신규 |
| error copy | `error-copy.ts` 에 `ANALYSIS_NOT_AVAILABLE`·`REFLECTION_ALREADY_SUBMITTED` 문구가 **이미 있다** (Stage 1 공통 매핑) | 재사용 여부를 design-agent 가 판정 (§18) |
| Shared UI | `Chip`(selectable) · `TextField` · `Button`(Disabled 포함) 있음. **`StarRating` 없음** (COMPONENT_MAP: *"S5 에서 만든다"*) | `packages/ui` 신규 1종 |
| Route Guard | 미인증 → `/auth/welcome` 으로 보내며 **원래 목적지를 보존하지 않는다** (`resolveGuardDecision.ts:89-97`) | push deep link 진입 시 목적지 유실 → `N5-15` |
| dev 화면 목록 | `DevScreens.tsx:346` *"Reflection · 분석 상태 · 짧은 피드백 — Stage 5."* | Stage 5 에서 항목 채움 |

### 0.1 측정 방법과 한계 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 측정 | 방법 | 결과 / 한계 |
|---|---|---|
| Figma 노드 구조·좌표 | ⚠️ **이 세션에서 Figma MCP 미인증** — 라이브 조회 **0회**. 대신 `docs/design/stage-4-session-figma-audit.md` §3 · §3.6 의 `get_metadata` 기록(2026-10-13 재조회분)을 인용했다 | `91:691` 하위는 **Stage 4 가 "의도적으로 측정하지 않았다"**(stage-4-plan.md:1355). 자식 좌표·크기만 있고 **면·그림자·타이포·칩 변형 선언값은 없다** |
| 렌더 | `docs/qa/evidence/stage-4b/figma/sbs-complete.png` (4b QA 의 Figma 캡처, 좌측 = Figma `29:62`) 를 직접 열람 | 카드 구성(제목 · 별 5 중 4 채움 · 칩 2행 · 입력 1 · `Save`) 시각 확인. **수치 근거로 쓰지 않는다** |
| Figma 갱신 여부 | 확인 불가 — 4b 최종 Visual Gap 도 *"don't have edit access"* 로 재조회 0 (`stage-4b-visual-gap-final.md` §0.2) | ⚠️ **design-agent 가 Spec 작성 전 `91:691` 전 하위 노드를 실측해야 한다** (최우선 규칙 4). 조회가 계속 막히면 **Risk `R5-01`** — 사용자에게 Figma 접근 복구 요청 |

**`91:691` 기존 기록 (프레임 로컬, `29:62` = 393×852)** — 감사 §3.6 인용

| 노드 | 내용 | 위치 | 크기 |
|---|---|---|---|
| `91:691` | Feedback Card | (11, 521) | 370×302 |
| `91:692` | text `How was storytime with Emma?` | (20,20) | 330×20 |
| `91:693` | 별 5개 `91:694`·`696`·`698`·`700`·`702` | (20,54) | 330×30 · 각 30×30 · 간격 8 |
| `91:709` | Select 5개 `91:710`~`714` (2행) | (20,98) | 330×73 · 77×31 · 97×33 · 111×31 / 93×33 · 101×33 |
| `91:715` | 입력 프레임 · text `Anything to talk about this time? (optional)` | (20,185) | 330×40 |
| `91:717` | Button `Save` (Accent, `17:12` base) | (20,239) | 330×45 |
| loose `91:627` · `91:628` | Select 77×31 · 97×33 (x=3140 = `29:62` 열) | — | 칩 변형 (선택/비선택 추정 — **실측 필요**) |

⚠️ 레이어 이름을 문자열 근거로 쓰지 않는다 (감사 §3.5 경고 — `88:929` 선례). 칩 라벨 5종·placeholder·`Save` 는 렌더 캡처와 감사의 `get_design_context` 기록이 일치하나, **override 문자열 재확인은 design-agent 몫**이다.

---

## 1. Goal

양육자가 세션을 제출한 뒤 **같은 완료 화면(`29:62`)에서 회고 카드(`91:691`)를 30초 안에 남기거나 건너뛸 수 있고**, 나중에 **분석 상태와 짧은 성장 피드백**을 확인할 수 있는 흐름을 **Mock 위에서** 모든 상태(pending · completed · failed · low-quality · not-available · error · offline)로 검증한다. 분석·생성·push 발송은 Contract + Mock + Handoff 요구사항으로만 다룬다.

---

## 2. In Scope (요구사항 ID별, Frontend 부분)

| 요구사항 | Stage 5 에서 하는 부분 | Stage 5 에서 하지 않는 부분 |
|---|---|---|
| **FR-12** 세션 피드백(회고) 카드 (P0) | `29:62` 하단 `91:691` 카드 — 별점(1~5) · 체크 칩 5종(on/off) · 입력 1개 · `Save`. 멱등 제출(Mock) · 입력 보존 재시도 · 재진입 표시 · 건너뛰기 = 닫기. PRD 의 "다음 카드 자유 후기"는 **`PF5-1` 결정에 따른다** | 추천 신호 반영(§7.6 셋째 줄 — Stage 6 표시, 서버 로직은 Handoff) · 리포트 부모 피드백 요약(Stage 7) · 서재 "우리 아이 평점" 집계(서버) |
| **FR-13** 세션 직후 짧은 성장 피드백 (P1) | 피드백 표시 화면(`/session/:sessionId/feedback` — **C-13 `C13-S5-1`**) · `shortFeedback.text` **응답 값 그대로** 표시 · push deep link **도착 화면** | 피드백 생성·안전 검증·push **발송** (PENDING) · Web push 수신 (Stage 3 `D-16`: Web 은 권한까지만) |
| **FR-14** 업로드 → STT → 분석 (P0) — **분석 상태** | `GET /v1/sessions/:sessionId/analysis` 조회·폴링 · 표시 상태 6종(ARCHITECTURE §10.2) · 24h pending UX | STT·분석 파이프라인·`analysis_jobs` (PENDING). 업로드 클라이언트는 Stage 4 완료분 |
| **FR-18** 하이라이트 클립 (P0) — **계약·fixture 만** | `HighlightClipSummary` · `SignedMediaUrl` schema + fixture + parse 테스트 | 클립 **재생 UI·호출자** (Stage 7) · 추출·저장·만료 (PENDING, `OAQ-13`) |
| **§13** STT 실패·저품질 | `analyzed` + `excluded_low_quality` → *"다음엔 조용한 곳에서"* 안내 + 세션 기록·피드백 보존 안내 | 품질 판정 (PENDING) |
| **§13** 부적절 발화·민감 내용 | **표시 계약 확정**: Frontend 는 전사·발화 원문을 **어떤 화면에도 표시하지 않고** 서버가 중립 처리한 `shortFeedback.text` 만 표시. 신규 outcome 값 없음 (`N5-13`) | 감지·마스킹 (PENDING) |
| **§13** 세션 30분 초과 | `auto_timeout` 완료도 **같은 완료 화면 + 회고 카드**로 이어짐을 검증 (PRD *"제출 완료 처리 후 피드백 카드 표시"*) | — (전이는 Stage 4 완료분) |
| **NFR 성능** 분석 ≤ 24h | pending 안내 문구·폴링 정책 | SLA (PENDING) |
| **NFR 콘텐츠 안전** 생성 문구 이중 검증 | 피드백 문구 = 응답 값만, Frontend 조립·보간·fallback **0** | 금지어·안전 필터 (PENDING) |
| **NFR 프라이버시** | 자유 입력(`note`) 로컬 영속 금지 · 로그 PII 0 · 로그아웃 시 캐시 정리 | 서버 측 redaction (PENDING) |
| **기술 요구사항** (근거 FR-12·13·14) | contracts(reflection · analysis status · highlight clip) · Mock Adapter 2종 + 시나리오 · `SessionDetail.reflection` · `StarRating`(packages/ui) · Stage 4 완료 화면 재작업(§5.4) | — |

---

## 3. Out of Scope

| 항목 | 넘기는 곳 | 비고 |
|---|---|---|
| 프로필·페르소나 자동 업데이트 표시 (FR-15), warm 추천 표시 | Stage 6 | 회고의 추천 신호 효과도 Stage 6 에서 표시 |
| 4주 리포트·하이라이트 클립 재생·PDF (FR-16·17·18 재생) | Stage 7 | Stage 5 의 클립 schema 를 Stage 7 이 소비 |
| 세션별 녹음 삭제 UI·데이터 관리 (FR-21) | Stage 8 | 단 "녹음이 삭제된 세션의 분석 표시"(`OAQ-17`)는 Stage 5 표시 대상 — §14 `N5-12` |
| 알림 설정 화면 (`C13-19`, `D-18`) | 디자이너 대기 | — |
| 네이티브 push 수신·딥링크 핸들러 | `S4N-*` 후속 단계 (`D4-1`) | Stage 5 는 **URL 도착 화면**만 |
| **Backend 구현 일체** | Backend Developer | Express route·controller·service·repository · Supabase migration/RLS/Storage · STT/AI · Analysis Worker · push 발송 · Cron · Render. `apps/api/`·`supabase/` **생성 금지** |

---

## 4. Dependencies

| 의존 | 상태 | 판정 |
|---|---|---|
| Stage 4 PASS | ✅ 4a·4b 모두 PASS (2026-11-08) | 충족 |
| **`G-06` / `M-15` 회고 칩 정의** | `NEEDS DECISION` (API_CONTRACTS §6 `G-06`) — 변화 없음 | ⛔ **`S5-A` 차단** → `N5-01` (권장안 있음) |
| **`OAQ-17`** 녹음 삭제 세션의 분석 종결 표현 | `NEEDS DECISION` (ARCHITECTURE §16, "Stage 5") · `N4-16` 은 Stage 4 에서 넣지 않음으로 처리 | ⚠️ **부분 차단** — AC-5-41 한 건. Stage 5 에서 실제로 생기는 경로가 있다: **업로드 못 한 녹음의 14일 로컬 삭제(`D4-29`)** → 서버 세션은 `completed` 에 머문다. 권장안(`N5-12`)은 **enum 변경 0** |
| **`OAQ-13`** 클립 보관 기간 | `NEEDS DECISION (법무)` | **비차단** — Stage 5 는 `expiresAt: nullable` 필드만 둔다. 표시는 Stage 7 |
| C-13 화면별 디자인 소스 | 미결 — §15 | ⛔ `S5-D`(피드백 화면) design 차단 |
| Figma 접근 | ⚠️ MCP 미인증 / edit access 오류 이력 | `R5-01` — design-agent 실측 전제 |
| PRD ↔ Figma 충돌 | `PF5-1`~`6` (§14.1) | ⛔ 일부 `S5-A`·`S5-B` 차단 |
| 법무 | `L-02`(약관 본문) 등 — Stage 5 신규 법무 항목 없음. 자유 입력이 아동 관련 텍스트 수집을 늘린다는 점만 Handoff 에 기록 (`P5-BIP-05`) | 비차단 |

---

## 5. Frontend Architecture Impact

### 5.1 레이어 배치 (RECOMMENDED — 이름 확정은 development-agent)

```
pages/session/SessionCompletePage      ← SessionCompleteScreen + ReflectionCard 조립 (slot)
pages/session/SessionFeedbackPage      ← 신규 (C13-S5-1)
features/reflection/                   ← ReflectionCard: 폼 상태(별·칩·입력)·제출·재시도·재진입 표시
features/session-feedback/             ← AnalysisStatusView: 표시 상태 6종 + 폴링 수명
entities/reflection/                   ← reflectionKeys · useSubmitReflection (mutation)
entities/analysis/                     ← analysisKeys · useSessionAnalysis (query + 폴링 옵션)
entities/session/                      ← SessionDetail.reflection 소비 (기존 useSessionCompletion 확장)
shared/api/                            ← reflectionApi · analysisApi interface
mocks/reflections/  mocks/analysis/    ← Mock Adapter · fixture · scenario
packages/ui                            ← StarRating (신규)
packages/contracts                     ← reflections/ · analysis/ · highlight-clips/ · enums/reflection-check.ts
```

- **feature 간 직접 import 금지** (`rules/architecture.md` §3): `features/storytime-session` 은 `features/reflection` 을 모른다. **조합은 Page** 가 한다.
- ⭐ **조합 방식 = slot** (RECOMMENDED): `SessionCompleteScreen` 이 `footer?: ReactNode` (이름 자유) 를 받아 **본체 상태(로딩·오류·leave 가 아닐 때)에서만** y 521 자리에 렌더한다. Page 는 `<SessionCompleteScreen footer={<ReflectionCard sessionId=… />} />` 만 쓴다 → Page 에 상태 분기 로직이 들어가지 않는다(`rules/frontend.md` §3). 대안(Page 가 `useSessionCompletion` 을 읽어 분기)은 Page 규칙 위반이라 채택하지 않는다.
- Adapter 선택은 `app/providers` 한 곳 (기존 규칙). `HttpReflectionApi` · `HttpAnalysisApi` 는 contract 기반 골격만 (연동 PENDING).

### 5.2 Server State

| 데이터 | Query key | 무효화 |
|---|---|---|
| `SessionDetail` (reflection 포함) | `sessionKeys.detail(id)` (기존) | 회고 제출 성공 시 `setQueryData` 또는 invalidate |
| `SessionAnalysisStatus` | `analysisKeys.status(sessionId)` | 폴링(§5.3). 로그아웃 시 Query 캐시 전체 정리(기존 `useSignOut`) |

### 5.3 폴링 정책 (RECOMMENDED — `N5-14`)

- 피드백 화면이 **보이는 동안만** 폴링 (`refetchIntervalInBackground: false` + `visibilitychange`). 다른 화면은 분석 상태를 조회하지 않는다.
- 간격 **15초**, 종착 상태(`analyzed` · `ANALYSIS_NOT_AVAILABLE` · `RESOURCE_NOT_FOUND`)에서 정지. `failed` 는 **worker 재시도 대상**이므로 간격 **60초**로 계속.
- 24h 는 클라이언트가 세지 않는다 — 문구로만 안내 (서버 SLA, PENDING).
- 테스트는 clock 주입 / fake timer (Stage 2 이래 순수함수 clock 주입 선례).

### 5.4 ⚠️ Stage 4 산출물 재작업 지점 (명시)

| # | 대상 `[직독]` | 재작업 | 근거 |
|---|---|---|---|
| R-1 | `SessionCompleteScreen.tsx` 머리 주석 *"y 468 아래가 비어 있는 것은 의도다"* | 주석 개정 — y 521 에 회고 카드 slot | AC-4-104 ③ 의 "의도적 공백" 은 **Stage 4 한정** 기록이었다 |
| R-2 | e2e **AC-4-61 · AC-4-104** *"y 468 아래 렌더 요소 0 · 회고 카드 0"* | **대체** — Stage 5 AC-5-19(상단 좌표 불변) + AC-5-18(카드 존재)로 바꾼다. 삭제가 아니라 **승계 기록**(QA 리포트에 "superseded by AC-5-18/19") | Stage 4 QA 회귀 목록에서 FAIL 로 오판되지 않게 — `N5-21` |
| R-3 | 시각 baseline `s4-session-complete`(393 · 320 · 600 · 1024 계열) | 재생성 — `R-BASELINE-1` 절차(`--update-snapshots=all` · diff 원인별 분해 · 설명 안 되는 클러스터 0) | 카드가 추가되므로 반드시 바뀐다. **상단(y 0~468) 클러스터가 생기면 회귀**다 |
| R-4 | 스크롤 — 진입 시 `scrollTop = 0` (`VG-K1S-02`) | 유지. 단 852 미만 높이에서 카드가 접힘 아래로 내려가므로 **스크롤로 `Save` 도달**을 검증 (AC-5-31) | `29:62` 은 852 고정 프레임 — 감사 §4 *"세로 스크롤이 필요한 곳 없음"* 은 852 기준 |
| R-5 | `overflow` 박스(AppShell 뷰포트) 안의 카드 그림자 | `R-SHADOW-1` — 카드 하단 그림자 inset 설계 + **세로·가로 양쪽 프로브** | 4b 까지 클리핑 사고 3회 |
| R-6 | 닫기(`D4-86` 홈 replace) | 동작 그대로. **의미가 "건너뛰기"로 확장**된다 (`N5-06`) | PRD §7.6 "선택 사항" |
| R-7 | `SessionDetail` schema | `reflection: Reflection \| null` **required + nullable** 추가 → Mock Detail fixture 전부 갱신 | `completionBubble` 선례 (Rev 8.9 하위 호환 절) |
| R-8 | `DevScreens.tsx:346` | Stage 5 화면·시나리오 링크로 교체 | dev 전용 |
| R-9 | Toast — 완료 화면은 `Recording submitted` Toast 를 안고 진입(`D4-89` inset) | 회고 `Save` 성공 Toast 와 동시 표시되지 않음을 확인 (Save 는 진입 후 사용자 행동) | 겹침 0 확인만 |

⛔ 상단(y 0~468)의 좌표·컴포넌트는 **바꾸지 않는다** — 바꿀 이유가 생기면 보고 후 승인.

### 5.5 Privacy (Frontend 책임)

- 회고 입력(`note`)은 **아동 관련 자유 텍스트**다 → localStorage·IndexedDB·SessionOutbox 에 **저장하지 않는다**. 재시도용 보존은 **메모리(컴포넌트 상태)** 만 (`N5-17`).
- 콘솔·`devWarn`·에러 리포트에 `note` · `shortFeedback.text` · 아이 이름 0건.
- 전사·발화 원문·지표 필드는 **contract 에 두지 않는다** (§7 — `metricsPreview` 제거 권장 `N5-11`).

---

## 6. Data Requirement Delta (Backend Handoff 용 — 구현 아님)

| 테이블 (`DATA_MODEL.md` §9) | 변경 제안 | 근거 |
|---|---|---|
| `session_reflections` | `checks` = **선택된 키 배열**(`text[]` of `ReflectionCheckKey`) 또는 boolean jsonb — `N5-01` 결과 · `revisit_topics`·`free_note` 두 칸 → **`note` 한 칸** (`N5-02` ⓐ 시) · **`skipped` 열 제거** (`N5-06` ⓐ 시 — 회고 없음 = 행 없음) · `rating` 1..5 null 유지 · `session_id UNIQUE` 유지 | PF5-1·PF5-5 |
| `session_reflections` → 서재 평점 | **§6.1 "우리 아이 평점 = 세션 별점 평균만"** 의 원천이 이 테이블이다 — Stage 3 서재 `Rated 4.5` 표시값을 서버가 여기서 집계 | PRD §6.1 · `P5-BIP-04` |
| `short_feedbacks` | 변경 없음. 단 `rendered_text` 가 **null 가능**(생성 실패 + fallback 없음)한지 Backend 결정 — Frontend 는 null 이면 텍스트 줄 미렌더 | AC-5-37 |
| `storytime_sessions.analysis_outcome` | 변경 없음 (`full` · `excluded_low_quality`). 민감 발화는 **세그먼트 단위**(`observations.kind = sensitive_excluded`)로 처리 — 세션 단위 값 신설 안 함 (`N5-13`) | §13 |
| `highlight_clips` | 변경 없음. `expires_at` = `OAQ-13` 결정 대기 | FR-18 |
| `notification_deliveries` | `short_feedback_ready` payload = **`sessionId` 만** (아이 이름·문구 미포함 — push 미리보기 노출 방지) | `P5-BIP-10` |
| 소유권 | 회고·분석 상태 모두 caregiver → child → session 소유권 확인 · RLS · 전체 삭제 대상 | `P5-BIP-15` |

---

## 7. API Contract Delta (제안 — 승인 후 plan-agent 가 `API_CONTRACTS.md` **Rev 9** 로 반영. 지금 고치지 않는다)

| # | 대상 | 제안 | 결정 |
|---|---|---|---|
| C-1 | **enum `ReflectionCheckKey`** (신규, `enums/reflection-check.ts`) | `engaged` · `big_feelings` · `asked_questions` · `stayed_focused` · `tricky_today` — PRD 체크 5종(아이 반응 · 감정 표현 · 질문 여부 · 집중 시간 · 어려웠던 점) ↔ Figma 칩 5종(`Engaged` · `Big feelings` · `Ask Questions` · `Stay Focus` · `Tricky today`) **1:1**. 코드 키는 불변, 라벨은 copy 모듈 | `N5-01` |
| C-2 | `reflections/reflection.ts` — `SubmitReflectionRequestSchema` | `{ rating: 1..5 \| null, checks: ReflectionCheckKey[] (중복 금지), note: string (trim, ≤ 500) \| null }` — ⛔ `revisitTopics[]` · `freeNote` · `skipped` 를 **두지 않는다** (`N5-02` ⓐ · `N5-06` ⓐ 시). 셋 다 비면 **거부**(`VALIDATION_FAILED`) — 빈 회고는 보내지 않는다 | `N5-02`·`N5-05`·`N5-06`·`N5-16` |
| C-3 | `ReflectionSchema` (응답) | `{ id, sessionId, rating, checks, note, submittedAt }` | RECOMMENDED |
| C-4 | `SessionDetailSchema.reflection` | `ReflectionSchema.nullable()` **required** — 재진입 판정(AC-5-28) | RECOMMENDED (`C4-OPEN-6` 이행) |
| C-5 | ⛔ **`GET /v1/reflection-form` 삭제** (`ReflectionFormDefinition`) | 칩 = 고정 enum + 라벨 = copy 모듈. 서버 폼 정의를 두면 완료 화면에 **로딩·오류 상태가 하나 더** 생기고, PRD 에 "운영 관리" 요구가 없다 | `N5-03` |
| C-6 | `POST /v1/sessions/:sessionId/reflection` (IK) | Request C-2 · Response C-3 · errors `REFLECTION_ALREADY_SUBMITTED` · `SESSION_INVALID_TRANSITION`(서버 상태가 완료 계열 이전) · `VALIDATION_FAILED` · `IDEMPOTENCY_KEY_REUSED`. 허용 상태 = `completed` · `analyzing` · `analyzed` · `failed` (두 mode 모두) | RECOMMENDED |
| C-7 | `analysis/status.ts` — `SessionAnalysisStatusSchema` | `{ sessionId, sessionStatus, mode, outcome: AnalysisOutcome \| null, shortFeedback: { text: string \| null, templateId?: string } \| null }` + refine: `outcome !== null ⇒ sessionStatus === 'analyzed'`. ⛔ **`metricsPreview{emotionWordCount, newWords[]}` 제거** — 아이 발화 파생 단어 목록이 Frontend 로 오면 문구 조립 유혹 + 민감 데이터 노출면 증가. PRD 예시 *"감정 단어를 3번 사용했어요"* 는 **서버가 만든 `text`** 다 | `N5-11` |
| C-8 | `GET /v1/sessions/:sessionId/analysis` | Response C-7 · errors `ANALYSIS_NOT_AVAILABLE`(`conversation_only`) · `RESOURCE_NOT_FOUND` · `FORBIDDEN` | RECOMMENDED |
| C-9 | `highlight-clips/clip.ts` — `HighlightClipSummarySchema` · `SignedMediaUrlSchema` | `{ id, sessionId, durationSeconds (10–15 가이드, schema 는 int ≥ 1), expiresAt: datetime \| null }` · `{ url, expiresAt }`. **API Client 메서드·호출자 0** — fixture + parse 테스트만 (PLANNING S5 "계약·fixture만") | `N5-22` |
| C-10 | error code | **신규 0** (`ANALYSIS_NOT_AVAILABLE` · `REFLECTION_ALREADY_SUBMITTED` 기존 29종 안) | — |
| C-11 | `NotificationKind` | 변경 0 (`short_feedback_ready` 기존). 저품질 전용 kind 신설 안 함 | RECOMMENDED |
| C-12 | `OAQ-17` | **enum 변경 0** — 녹음 삭제 세션은 서버 `sessionStatus='completed'` 그대로 + `SessionDetail.recording.uploadStatus ∈ {deleted, expired}` 로 Frontend 가 "분석 불가(녹음 없음)" 를 표시 (`N5-12`) | `N5-12` |

§5.4 Scenario Catalogue 등재 제안 → §8.

---

## 8. Mock Scenarios

**그룹 `reflections`** (Mock = `mocks/reflections/`)

| Key | 종류 | 동작 |
|---|---|---|
| `success` | 공통 | 제출 → `Reflection` 응답, 이후 `SessionDetail.reflection` 채움 |
| `loading` | 공통 | 제출 지연 (결정적 ms) |
| `error` | 공통 | `INTERNAL_ERROR` envelope |
| `retry` | 공통 | 1회 실패 후 성공 (같은 Idempotency-Key) |
| `offline` | 공통 | `NetworkError` |
| `reflection-already-submitted` | 기존 등재 | `REFLECTION_ALREADY_SUBMITTED` — 또는 같은 key replay = 최초 응답 |
| `invalid-transition` | 기존 등재 | `SESSION_INVALID_TRANSITION` (서버가 아직 `recording`/`paused` — 오프라인 Submit 이 Outbox 에 남은 경우 재현) |
| ~~`empty`(skip)~~ | 기존 등재 | ⚠️ `N5-06` ⓐ 채택 시 **reflections 그룹에서 제외** (건너뛰기 = 요청 없음). ⓑ 채택 시 유지 |

**그룹 `analysis`** (Mock = `mocks/analysis/`) — ARCHITECTURE §10.2 매핑

| Key | `sessionStatus` | `outcome` | `shortFeedback` | 표시 상태 |
|---|---|---|---|---|
| `analysis-pending` | `analyzing` | null | null | pending |
| `analysis-completed` | `analyzed` | `full` | `{ text }` | analyzed |
| `analysis-failed` | `failed` | null | null | failed (재시도 중) |
| `analysis-low-quality` | `analyzed` | `excluded_low_quality` | `{ text }` 또는 null | low-quality |
| `analysis-not-available` | — | — | — | `ANALYSIS_NOT_AVAILABLE` |
| `recording-deleted` | `completed` + Detail `uploadStatus='deleted'` | null | null | not-available (녹음 없음) — `N5-12` |
| `success` · `loading` · `error` · `retry` · `offline` | 공통 | | | |
| 🆕 **`analysis-pending-then-completed`** | 처음 N 회(결정적, 예: 2) `analyzing` → 이후 `analyzed`+`full` | | | **폴링 종료 검증용** — 신규 등재 제안 |
| 🆕 **`analysis-feedback-missing`** | `analyzed` | `full` | `{ text: null }` | 텍스트 줄 미렌더 검증 — 신규 등재 제안 |

- `conversation_only` 세션은 **시나리오와 무관하게** `ANALYSIS_NOT_AVAILABLE` (Stage 4 `P4-BIP-16` 의 Mock 이행).
- 기본(`success`) 시 Mock 은 **세션의 실제 Mock 상태**를 따른다: 녹음 확정 후 `analyzing` → **결정적 조건**(호출 횟수 또는 clock 주입)으로 `analyzed`+`full` 전이(actor `worker`, `canTransition` 검사). 시간 기반 비결정 전이 금지.

**그룹 `session-completion`** (기존 그룹 확장)

| Key | 동작 |
|---|---|
| 🆕 **`reflection-submitted`** | `SessionDetail.reflection` non-null — 재진입 표시(AC-5-28) |

Mock fixture 문구: 영어 · 진단·판정·비교 표현 0 · 실제 아동 데이터 0. 예시 `shortFeedback.text` (RECOMMENDED — 제품 문구는 Backend 검수 템플릿): *"Today brought lots of feeling words, and a new one — proud."* (아이 이름 없음 · 수치는 PRD 예시 범위).

---

## 9. Frontend Scope (route / page / feature / entity — 상세 UI 는 design-agent)

| Route | Page | Layout | Figma | 비고 |
|---|---|---|---|---|
| `/session/:sessionId/complete` (기존) | `SessionCompletePage` | Fullscreen | `29:62` **전체**(y 0~823) | 회고 카드 = 같은 route. ⛔ **`/session/:sessionId/reflection` route 를 만들지 않는다** (RECOMMENDED — Figma 가 한 프레임이므로 화면을 쪼개면 Figma 에 없는 전환이 생긴다. Stage 0 FIGMA_SCREEN_MAP 의 두 route 분할 안은 **철회 제안**) |
| `/session/:sessionId/feedback` (신규) | `SessionFeedbackPage` | Fullscreen 또는 Stack (design-agent) | **없음 — `C13-S5-1`** | push deep link 도착 화면 · 분석 상태 6종 |

| 구성 요소 | 위치 | 비고 |
|---|---|---|
| `StarRating` | `packages/ui` (신규) | Figma `91:693` + `Icon shape=star 117:879`. radiogroup 의미 · 키보드 · 터치 타깃(30px → `N5-19`) · 대비 `P-02` |
| `Chip` (selectable) | `packages/ui` (기존) | `91:710~714` · loose `91:627`/`628` 변형 대조 |
| `TextField` | `packages/ui` (기존) | `91:715` 330×40 ↔ 기존 행 높이 42(`S1-G-2`) 차이 → design-agent 판정 |
| `Button` Accent / Disabled | `packages/ui` (기존) | `91:717` · Disabled = `17:20` 세트에 존재 |
| `ReflectionCard` | `features/reflection` | 폼 상태 · 제출 · 오류 보존 |
| `AnalysisStatusView` | `features/session-feedback` | 6 표시 상태 + Loading/Error |
| copy | `features/reflection/copy.ts` · `features/session-feedback/copy.ts` | 칩 라벨 · 제목 · placeholder · 안내 문구 |

---

## 10. Backend Integration Requirements (Contract 로 표현되는 기대 동작 — 구현 아님)

| ID | 요구 | Handoff 문서 | QA 예상 |
|---|---|---|---|
| `P5-BIP-01` | 회고 저장 + Idempotency(`(caregiverId, key)` 24h · 다른 body → `IDEMPOTENCY_KEY_REUSED`) + 세션당 1건(`REFLECTION_ALREADY_SUBMITTED`) | BH · DR · EC | PENDING |
| `P5-BIP-02` | 회고 허용 상태 서버 강제 — 완료 계열(`completed`·`analyzing`·`analyzed`·`failed`)만, 두 mode 모두. 그 외 `SESSION_INVALID_TRANSITION` | BH · EC | PENDING |
| `P5-BIP-03` | 회고 → 추천 신호 (`tricky_today` → 다음 추천 난이도 하향 · `note` 주제 → 다음 Prompt 반영, PRD §7.6) | AP · BH | PENDING (표시 Stage 6) |
| `P5-BIP-04` | 회고 별점 → 서재 "우리 아이 평점" 집계 (§6.1 — 다른 가정 평균 금지) · 리포트 부모 피드백 요약 (§7.7) | DR · AP | PENDING |
| `P5-BIP-05` | `note` 는 아동 관련 자유 텍스트 — AI 전송 전 PII redaction · 로그 원문 금지 · 전체 삭제 대상 | AP · DR | PENDING |
| `P5-BIP-06` | 분석 파이프라인 전체: Audio → STT → PII Redaction → Metrics → Capability Signals → Safety Validation → Structured Result · `analysis_jobs` 멱등·재시도 (`P4-BIP-12` 확장) | AP | PENDING |
| `P5-BIP-07` | 품질 게이트 → `analyzed` + `excluded_low_quality` (정량 분석 제외 · 세션 기록·피드백 보존) · 리포트 집계 제외(#17) | AP | PENDING |
| `P5-BIP-08` | 민감 발화 감지 → 세그먼트 분석 제외 + 전사 마스킹 + **피드백 문구 중립 처리**. 세션 단위 신규 outcome 없음 | AP | PENDING |
| `P5-BIP-09` | 짧은 피드백 생성: 검수 템플릿 + 안전 슬롯 + 금지어·안전 필터 이중 검증 + fallback · `ai_generation_logs` · 1~2줄 · 진단·비교 표현 금지. 쓸 문구가 없으면 `text: null` | AP | PENDING |
| `P5-BIP-10` | `short_feedback_ready` push 발송 · payload = `sessionId` 만(PII 0) · 도착 URL `/session/:sessionId/feedback` | BH | PENDING |
| `P5-BIP-11` | 분석 SLA 24h | AP | PENDING |
| `P5-BIP-12` | `failed → analyzing` 재시도 정책·횟수 · 영구 실패 시 사용자 노출 상태(현재 contract 는 `failed` 유지 — Frontend 는 "조금 더 걸린다" 안내) | AP · EC | PENDING |
| `P5-BIP-13` | `conversation_only` → `ANALYSIS_NOT_AVAILABLE` (`P4-BIP-16` 확정) | EC | PENDING |
| `P5-BIP-14` | 하이라이트 클립 10~15초 자동 추출·private 저장·만료(`OAQ-13`) · signed URL | AP · DR | PENDING (재생 Stage 7) |
| `P5-BIP-15` | 회고·분석 상태 endpoint 소유권 확인 · RLS · 분석 요청 시 서버 측 동의 강제(`P4-BIP-02` 확장) | AR · DR | PENDING |
| `P5-BIP-16` | 녹음 미수신 세션(14일 로컬 삭제 `D4-29` 등)의 서버 종결 처리 — `completed` 무기한 체류 정리·표현(`OAQ-17`) | DR · AP | PENDING |

→ 16건. Stage 8 `BACKEND_HANDOFF.md` 등 1:1 반영 대상.

---

## 11. Acceptance Criteria

표기: **PENDING** = `BACKEND_INTEGRATION_PENDING` 예상 · **NV** = 실기기 필요(`NOT VERIFIED` 가능). 결정 의존 AC 는 결정 ID 를 적는다 — 결정 결과에 따라 문안만 바뀐다.

### 11.1 Scope · Gate

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-5-01 | `apps/api/` · `supabase/` · `apps/mobile/` 부재, Backend 런타임 코드 0 | Scope | 파일 목록 | — |
| AC-5-02 | Out of Scope 미구현: 프로필 업데이트 표시 · 리포트 · 클립 재생 UI · 클립 API 메서드 · 데이터 관리 UI · `/session/:id/reflection` route **0** | §3 | grep · router 목록 | — |

### 11.2 Contracts

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-5-03 | `ReflectionCheckKey` 5값 enum + enum 스냅샷 테스트 갱신 (`N5-01` 결과) | FR-12 · G-06 | 단위 | — |
| AC-5-04 | `SubmitReflectionRequest` — rating 0·6·소수 거부 · 미등록 키 거부 · 중복 키 거부 · `note` trim·상한(`N5-16`) · **세 필드 모두 빈 요청 거부** | FR-12 | 단위 | — |
| AC-5-05 | `ReflectionSchema` · `SessionDetail.reflection`(required+nullable) — 모든 Mock Detail 응답 parse 통과, key 누락 응답 거부 | FR-12 · C-4 | 단위 · Mock parse | — |
| AC-5-06 | `SessionAnalysisStatus` — refine(`outcome ≠ null ⇒ analyzed`) · `metricsPreview` 부재(`N5-11`) · 전사·발화 필드 0 | FR-13·14 · §13 | 단위 | — |
| AC-5-07 | `HighlightClipSummary` · `SignedMediaUrl` schema + fixture parse — API Client 메서드·import 호출자 0 | FR-18 | 단위 · grep | — |
| AC-5-08 | error code 신규 0 (29종 유지) · 타입은 `z.infer` 만 — 앱 내 중복 선언 0 | §5 규칙 | 스냅샷 · grep | — |
| AC-5-09 | `API_CONTRACTS.md` Rev 9 와 구현 contracts 일치 (endpoint · schema · scenario key) | 규칙 §5 | 문서 대조 | — |

### 11.3 Mock

| AC | 내용 | 검증 | 예상 |
|---|---|---|---|
| AC-5-10 | Mock 회고·분석 Adapter 가 요청·응답을 contracts 로 parse — 시나리오 전 key 테스트 | 단위 | — |
| AC-5-11 | 회고 멱등: 같은 key + 같은 body → 같은 응답 · 같은 key + 다른 body → `IDEMPOTENCY_KEY_REUSED` · 제출 후 재제출 → `REFLECTION_ALREADY_SUBMITTED` | 단위 | — |
| AC-5-12 | 서버 상태가 완료 계열 이전이면 `SESSION_INVALID_TRANSITION` (`invalid-transition`) | 단위 | — |
| AC-5-13 | 분석 시나리오 6종 + 공통 5종이 §8 표대로 응답 — `conversation_only` 는 시나리오 무관 `ANALYSIS_NOT_AVAILABLE` | 단위 | — |
| AC-5-14 | `analyzing → analyzed/failed` Mock 전이가 `canTransition(…, 'worker', …)` 를 통과하며 **결정적**(clock·호출 횟수) | 단위 (fake timer) | — |
| AC-5-15 | Mock Data 가 Component·Page·Feature 에 하드코딩 0 · Adapter 선택 지점 1곳 · Component 의 Adapter 직접 호출 0 | grep · lint:boundaries | — |
| AC-5-16 | 신규 scenario key 가 `API_CONTRACTS §5.4` 에 등재되고 dev Scenario Panel·`/__dev/screens` 로 전환 가능 | 문서 대조 · e2e | — |

### 11.4 회고 카드 (Figma `91:691`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-5-17 | 카드 구성 = Figma: 제목 · 별 5 · 칩 5(2행) · 입력 1 · `Save` — **Figma 에 없는 요소 0**(별도 Skip 버튼·두 번째 카드는 `PF5-1`·`PF5-5` 결정 범위 안에서만) | FR-12 · 최우선 규칙 1·2 | DOM 목록 | — |
| AC-5-18 | 393×852 에서 카드 박스 = `91:691` (11, 521) 370×302 ±1, 하위 요소 좌표 = design-agent 실측값 · Figma ↔ 구현 나란히 비교 | 최우선 규칙 4 | e2e 기하 단정 · Playwright 시각 비교 | — |
| AC-5-19 | **상단(y 0~468) 불변** — Stage 4 완료 화면 요소(닫기 · 제목 · 스티커 · 메달리온 · 버블) 좌표가 4b baseline 과 동일 (diff 클러스터 0) | 회귀 · §5.4 R-3 | e2e 기하 · 시각 | — |
| AC-5-20 | 별점: 탭으로 1~5 설정 · 변경 가능 · (재탭 해제 = `N5-18`) · 키보드 화살표 · 접근성 이름 *n of 5* · 초기 0개 채움(Figma 의 4개 채움은 예시 상태) | FR-12 · 접근성 | 컴포넌트 · e2e | — |
| AC-5-21 | 칩: on/off 토글 · `aria-pressed` · 라벨 = 승인된 문자열(`N5-20`) · 선택/비선택 시각 = loose `91:627`/`628` 실측 | FR-12 · G-06 | 컴포넌트 · 시각 | — |
| AC-5-22 | 입력: 선택 사항 · placeholder = Figma 문자열 · 상한 초과 입력 차단(`N5-16`) · **로컬 저장소에 기록 0** | FR-12 · Privacy | e2e · 저장소 전수 검사 | — |
| AC-5-23 | `Save` 활성 조건 = `N5-05` (권장: 별·칩·입력 중 하나 이상) · 비활성 = Button Disabled 상태 | FR-12 | 컴포넌트 | — |
| AC-5-24 | 제출: 요청 body 가 입력과 정확히 일치(Mock 요청 로그) · `Idempotency-Key` 존재 · 진행 중 중복 탭 → 요청 1건 · 로딩 표시 | FR-12 | e2e (요청 로그) | — |
| AC-5-25 | 제출 성공 후 동작 = `N5-07` (권장: 저장 Toast + 홈 replace) | FR-12 | e2e | — |
| AC-5-26 | 제출 실패(`error`) → 안내 + **입력 보존** + 재시도 시 body 불변이면 **같은 key**, 입력을 바꾸면 **새 key** | FR-12 · NFR 오프라인 | e2e · 단위 | — |
| AC-5-27 | 오프라인(`offline`) → 오프라인 안내 + 입력 보존(메모리) · 온라인 복귀 후 재시도 성공 · 입력이 디스크에 남지 않음 | NFR 오프라인 · Privacy | e2e · 저장소 검사 | — |
| AC-5-28 | `invalid-transition`(Submit 이 Outbox 에 남아 서버가 아직 완료 전) → 안내 + 입력 보존 · Outbox 전송 후 재시도 성공 | §12.2 · Stage 4 Outbox | e2e | — |
| AC-5-29 | 닫기(✕) = `N5-06` (권장: 요청 0 · 홈 replace — `D4-86` 그대로) · 입력이 있어도 확인 다이얼로그 없음(`N5-23`) | FR-12 "선택 사항" | e2e (요청 로그 0) | — |
| AC-5-30 | 재진입(`reflection-submitted`) → `N5-08` (권장: 같은 카드 읽기 전용 · 제출값 표시 · `Save` Disabled) · 재제출 불가 | FR-12 · FR-19 선례 | e2e | — |
| AC-5-31 | `conversation_only` 완료 · `auto_timeout` 완료 · `recovered_after_crash` 완료(완료 화면 경로가 있을 때) 모두 카드 표시·제출 가능 | §13 30분 · `D4-44` | e2e (시나리오별) | — |
| AC-5-32 | 반응형 320×568 / 393 / 600 / 1024: 가로 넘침 0 · 스크롤로 `Save` 도달 · 카드 그림자 클리핑 0(`R-SHADOW-1` 세로·가로 프로브) · Toast inset 유지 | FR-25 | e2e 프로브 · 시각 | — |
| AC-5-33 | 모바일 소프트 키보드: 입력 포커스 시 입력·`Save` 가 가려지지 않음 (iOS Safari) | NFR 접근성 | 실기기 수동 | **NV** |

### 11.5 분석 상태 · 짧은 피드백 (`C13-S5-1`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-5-34 | `/session/:sessionId/feedback` 등록 · Route Guard 적용 · Page = Composition 만 | FR-13 | router · lint | — |
| AC-5-35 | 폴링: 화면이 보일 때만 · 15초(`failed` 60초) · 종착 상태에서 정지 · 화면 이탈 시 정지 · 다른 화면에서 분석 조회 0 (`N5-14`) | FR-14 · NFR 24h | 단위(fake timer) · e2e `analysis-pending-then-completed` | — |
| AC-5-36 | pending — 24h 기대치 안내(문구 = design-agent, `N5-24`) · 진행률·수치 약속 0 | NFR 24h | e2e · copy 리뷰 | — |
| AC-5-37 | analyzed+full — `shortFeedback.text` **응답 그대로** 표시 · `text: null` 이면 텍스트 줄 미렌더 · placeholder·fallback·보간 0 (`analysis-feedback-missing`) | FR-13 · §8.4 | e2e · grep(조립 0) | — |
| AC-5-38 | low-quality — 조용한 곳 안내 + 세션 기록 보존 안내 · 지표 0 | §13 | e2e | — |
| AC-5-39 | failed — "조금 더 걸리고 있다" 안내 · 사용자 재시도 버튼 0 (`N5-15` 권장 ⓐ) | §12.2 | e2e | — |
| AC-5-40 | not-available(`conversation_only`) — 녹음 없는 세션 안내 | §13 · `P5-BIP-13` | e2e | — |
| AC-5-41 | recording-deleted — `N5-12` 결과대로 표시 (권장: not-available 과 같은 상태, 문구만 녹음 없음 사유) · enum 변경 0 | `OAQ-17` | e2e · 스냅샷 | — |
| AC-5-42 | Loading · Error+Retry · `RESOURCE_NOT_FOUND`(남의 세션·없는 세션) 상태 | 공통 상태 | e2e | — |
| AC-5-43 | deep link 직접 진입: 로그인 상태 → 해당 화면 · 미로그인 → `N5-15` ⓑ 결과(권장: 기존 Guard 그대로, 목적지 보존 없음) | FR-13 | e2e | — |

### 11.6 Privacy · Copy · 접근성 · 아키텍처 · 회귀

| AC | 내용 | 검증 | 예상 |
|---|---|---|---|
| AC-5-44 | 새 copy 에 진단·판정·비교 표현 0 (금칙어 grep 목록: `diagnos` · `delay` · `behind` · `normal` · `score` · `worse` · `better than` · `peers` 등) · 문구는 feature copy 모듈에만 | grep · 리뷰 | — |
| AC-5-45 | 어떤 화면에도 전사·발화 원문·지표 수치가 렌더되지 않음 (contract 에 필드 없음 + DOM 검사) | 단위 · e2e | — |
| AC-5-46 | 콘솔·에러 리포트에 `note` · 피드백 문구 · 아이 이름 0 (프로브 — 제출 실패·parse 실패 경로 포함) | e2e 콘솔 수집 | — |
| AC-5-47 | 로그아웃 → 회고·분석 Query 캐시 0 · 로컬 저장소에 회고 관련 키 0 | e2e · 저장소 전수 | — |
| AC-5-48 | 광고·제3자 분석 SDK 0 · `VITE_*` Secret 0 · `assert:no-mocks`(Production 빌드) 통과 | 의존성 diff · 빌드 | — |
| AC-5-49 | 접근성: 카드·피드백 화면 포커스 순서 · 접근성 이름 · `prefers-reduced-motion` · 대비 — 가값(`P-02` 별 1.64:1 등)·수용 예외(`D-01` Save 흰 라벨) 목록 기록 · 신규 가값 시 `P-26…` 번호로 등재 | axe · 수동 | — |
| AC-5-50 | 레이어: `features/reflection` · `features/session-feedback` ↔ `features/storytime-session` 상호 import 0 · 조합은 Page slot · Mock ↔ Http 교체 시 UI·Feature·Query 코드 변경 0 | lint:boundaries · 리뷰 | — |
| AC-5-51 | Stage 4 회귀: AC-4 핵심 경로(세션 시작 → 녹음 → Submit → 완료 · Discard · 대화 전용 · 오프라인 Outbox) e2e 통과 · **AC-4-61·104 승계 기록**(`N5-21`) · baseline 재생성이 `R-BASELINE-1` 절차를 따름(설명 안 되는 diff 클러스터 0) | e2e · QA 리포트 | — |
| AC-5-52 | `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `test` · `build` · `test:e2e` 전부 통과 (Playwright 단독 실행) | 실행 로그 | — |

### 11.7 Backend 의존 (Frontend 부분은 위 AC 로 별도 판정)

| AC | 내용 | 대기 사유 → Handoff | 예상 |
|---|---|---|---|
| AC-5-53 | 회고가 서버에 저장되고 추천·평점·리포트에 반영된다 | `P5-BIP-01`~`05` → BH · DR · AP | **PENDING** |
| AC-5-54 | 실제 STT·분석·품질 게이트·민감 처리·피드백 생성이 24h 안에 끝난다 | `P5-BIP-06`~`09` · `11` · `12` → AP | **PENDING** |
| AC-5-55 | `short_feedback_ready` push 가 발송되고 탭하면 피드백 화면이 열린다 | `P5-BIP-10` → BH (+ 네이티브 수신 `S4N-*`) | **PENDING** |
| AC-5-56 | 하이라이트 클립이 추출·저장·만료된다 | `P5-BIP-14` · `OAQ-13` → AP · DR | **PENDING** |

**집계**: AC **56** — Frontend 판정 51 · `NOT VERIFIED` 예상 1 (AC-5-33) · `BACKEND_INTEGRATION_PENDING` 예상 **4** (AC-5-53~56, Handoff 항목 16건).

---

## 12. 작업 단위 (한 단위 = development-agent 1회 호출)

| 단위 | 내용 | AC | 선행 결정 |
|---|---|---|---|
| **`S5-A`** Contracts + Mock | §7 C-1~C-12 · `SessionDetail.reflection` + fixture 전수 갱신 · `mocks/reflections/` · `mocks/analysis/` · worker 전이 재현 · 신규 scenario key · `API_CONTRACTS` 구현 반영(Rev 9.x) | 03~16 | ⛔ `N5-01` · `N5-02` · `N5-03` · `N5-05` · `N5-06` · `N5-11` · `N5-12` · `N5-16` |
| **`S5-B`** StarRating + 회고 카드 | `packages/ui` `StarRating` · `features/reflection` · `entities/reflection` · `SessionCompleteScreen` slot · Stage 4 재작업 R-1~R-9 · baseline 재생성 | 17~33 · 51 | ⛔ `N5-04` · `N5-07` · `N5-08` · `N5-20` + Design Spec `C13-S5-2` |
| **`S5-C`** 피드백 화면 | route · `features/session-feedback` · `entities/analysis` · 폴링 · 6 상태 · deep link | 34~43 | ⛔ `N5-09` (`C13-S5-1` 소스) · `N5-10` · `N5-14` · `N5-15` |
| **`S5-D`** 횡단 검증 | copy 리뷰 · privacy 프로브 · 접근성 · 반응형 · 레이어 · dev 화면 목록 · 인계 문서 `docs/qa/stage-5-handoff.md` | 44~50 · 52 | — |
| (`S5-E`) | **조건부** — `PF5-1` 에서 "두 번째 카드(자유 후기)" 를 채택하면 생기는 단위 | 추가 AC | `N5-02` ⓒ |

순서: `S5-A` → `S5-B` → `S5-C` → `S5-D` → design-agent Visual Gap(단위마다, 최우선 규칙 5) → stage-qa-agent.

### 12.1 5a / 5b 분할 — 제안만 (지금은 **분할하지 않는 것을 권장**)

- **분할 불필요 근거**: 범위가 4b 의 1/3 수준(AC 56 vs 4b 79+)이고, 실기기 의존이 1건뿐이며, 회고 카드는 Figma 가 있다.
- **분할이 필요해지는 조건**: `N5-09` 에서 **`C13-S5-1` = 디자이너 Figma 요청(①)** 을 고르면 피드백 화면이 디자이너 산출물을 기다린다. 그 경우 `D4-9` 선례대로 **5a = `S5-A`·`S5-B`(+`S5-D` 부분) / 5b = `S5-C`** 로 나누고, Stage 6 은 5b PASS 후 시작(피드백 화면이 Stage 6 프로필 반영 표시와 맞물리지 않으므로 강한 순서 의존은 없으나 `rules/workflow.md` §4 의 Stage Gate 를 따른다).

---

## 13. Test Strategy

| 층 | 도구 | 대상 |
|---|---|---|
| Contracts | Vitest | enum 스냅샷 · schema 경계(AC-5-04~07) · refine · `SessionDetail` key 누락 거부 |
| Mock | Vitest | 시나리오 전 key parse · 멱등 · `invalid-transition` · worker 전이 결정성(fake timer) |
| Component | Vitest + Testing Library | `StarRating`(키보드·aria) · `ReflectionCard` 상태 머신(입력 → 제출 → 실패 보존 → key 재사용/재발급) · `AnalysisStatusView` 6 상태 |
| Hook | Vitest | 폴링 수명(가시성 · 종착 정지 · 간격) — clock 주입 |
| E2E | Playwright (**단독 실행**) | 완료 → 회고 저장 · 실패 재시도 · 오프라인 · `invalid-transition` · 재진입 · 닫기(요청 0) · 대화 전용·30분 · 피드백 화면 시나리오별 · deep link 직접 진입 |
| 시각 | Playwright | `29:62` 전체(393·320) 재생성 + Figma 나란히 비교 · 피드백 상태별 · `R-BASELINE-1` (settle · dev 패널 숨김 · `=all` · diff 분해) |
| 프로브 | Playwright | 카드 그림자 세로·가로(`R-SHADOW-1`) · 320×568 스크롤 도달 · 콘솔 PII · 저장소 전수 |
| 단위 테스트 대기 방식 | — | `D4-150`·`D4-153` 교훈 — 화면 전환 뒤 기본 1000ms `findBy` 한 번으로 여러 단계를 기다리지 않는다(단계별 대기) |
| 실기기 | 사용자 iPhone (HTTPS 5174) | AC-5-33 소프트 키보드 |

---

## 14. Risks & Mitigations

| ID | Risk | Mitigation |
|---|---|---|
| `R5-01` | **Figma 실측 불가** — 이 세션 MCP 미인증, 4b 최종 VG 는 *"don't have edit access"* | design-agent 착수 전 Figma 접근 확인. 막히면 Orchestrator 가 사용자에게 접근 복구 요청 — **추측 값으로 Spec 을 쓰지 않는다**(최우선 규칙 4) |
| `R5-02` | Stage 4 상단 좌표 회귀 (slot 추가로 레이아웃 흐름 변경) | AC-5-19 기하 단정 + baseline diff 분해, 상단 클러스터 1개라도 있으면 중단 |
| `R5-03` | 오프라인 Submit(Outbox) 뒤 회고 제출 → 서버 상태 불일치 | `invalid-transition` 시나리오 + AC-5-28. 회고를 Outbox 에 넣지 않는 대신 입력 메모리 보존 |
| `R5-04` | Idempotency-Key 재사용 오류(입력 변경 후 같은 key → `IDEMPOTENCY_KEY_REUSED`) | AC-5-26 — key 를 "body 해시 단위" 로 관리 |
| `R5-05` | iOS Safari 소프트 키보드가 화면 하단 입력·`Save` 를 가림 (`dvh` 이력 `NV-4B-4`) | 실기기 AC-5-33, 포커스 시 scrollIntoView 검토 (design-agent) |
| `R5-06` | 피드백 화면의 **앱 내 진입점이 없다** — Web 은 push 를 받지 않으므로(`D-16`) Web 프리뷰에서 FR-13 이 사실상 안 보인다 | `N5-10` 에서 사용자에게 명시. 권장 ⓐ 는 이 한계를 **수용**하는 안이다 |
| `R5-07` | 별 30px 터치 타깃 < 44 · 별 대비 1.64:1 | `N5-19` · `P-02` 기록, 신규 가값은 `P-26` 부터 |
| `R5-08` | 카드 제목에 아이 이름 — 320 폭 줄바꿈·긴 이름 | design-agent 가 긴 이름(`Alexandria`) 기하 확인. `N5-04` |
| `R5-09` | PRD 가 Figma 결정에 맞게 고쳐지지 않으면 이후 Stage(7 리포트 "부모 피드백 요약")가 PRD 의 두 칸(주제·자유 후기)을 전제 | §14.2 PRD 수정 대상 등록 → `D-24` 절차(사용자 지시 시) |
| `R5-10` | 폴링 비용·배터리 | 가시성 기반 정지 · 종착 정지 · 다른 화면 조회 0 (AC-5-35) |

---

## 15. Open Decisions

### 15.1 PRD ↔ Figma 충돌 — **지점별 사용자 결정 대기** (CLAUDE.md: Figma 우선 + 지점별 승인)

| ID | 지점 | PRD | Figma | 영향 (contract · 화면 · Backend) | 권고 |
|---|---|---|---|---|---|
| **`PF5-1`** | 자유 후기 "다음 카드" | §7.6 *"피드백 카드 다음 카드에서 자유 후기"* · FR-12 · §5.3 #10 | **두 번째 카드 없음** — `91:691` 한 장 | contract `note` 1칸 vs `revisitTopics[]`+`freeNote` 2칸 · 화면 1장 vs 2장(C-13) · Backend 리포트 "부모 피드백 요약" 입력 | **Figma** (→ `N5-02` ⓐ). PRD §7.6·FR-12·§5.3 #10 **수정 대상** |
| **`PF5-2`** | 주제 + 자유 후기 두 입력 | §7.6 *"다시 이야기하고 싶은 주제(선택)"* + 자유 후기 | 입력 **1개** `Anything to talk about this time? (optional)` | 위와 같음 — 서버가 한 칸에서 주제를 추출(`P5-BIP-03`) | **Figma** — 한 칸 `note` (PF5-1 과 한 결정) |
| **`PF5-3`** | 체크 항목 형태 | *"아이의 반응 / 감정 표현 / 질문 여부 / 집중 시간 / 어려웠던 점을 간단히 체크"* — 척도 여부 불명 | on/off 칩 5개, 라벨 `Engaged` · `Big feelings` · `Ask Questions` · `Stay Focus` · `Tricky today` | enum 5값 · boolean · Backend 추천 신호 해석 | **Figma** (on/off, 1:1) → `N5-01` |
| **`PF5-4`** | 질문 표시 방식 | §7.6 *"질문 **버블**과 함께 피드백 카드"* | 버블 아님 — **카드 제목** `How was storytime with Emma?` (버블 `88:929` 은 성공 피드백) | 화면만. 캐릭터 버블 개수 규칙(§7.5 "시작·종료 2가지")과도 Figma 쪽이 맞다 | **Figma**. PRD §7.6 문구 수정 대상 |
| **`PF5-5`** | 건너뛰기 | §5.3 *"선택 사항"* · PLANNING 초안 "skip" | Skip 버튼 **없음** — 닫기 ✕ `29:76` 만 | contract `skipped` 필드 존폐 · 화면 버튼 0 · KPI(회고 작성률)는 서버가 "회고 행 없음" 으로 계산 | **Figma** — 닫기 = 건너뛰기, 요청 0 (→ `N5-06` ⓐ) |
| **`PF5-6`** | 제목의 아이 이름 | *"오늘 아이와 책 읽기는 어떠셨나요?"* (이름 없음) | `…with Emma?` (이름 포함) | 화면 copy 에 이름 슬롯 · 데이터 출처 | **Figma** (이름 포함) → 출처는 `N5-04` |

### 15.2 결정 목록 `N5-xx`

⛔ = 해당 작업 단위 착수 전 필요 · 모든 항목에 권장안이 있다.

| ID | 차단 | 질문 | 선택지 | 권장 | 라벨 |
|---|---|---|---|---|---|
| **`N5-01`** | ⛔ `S5-A` | 회고 칩 값 형태 (`G-06`/`M-15`) | ⓐ enum 5값 + **선택된 키 배열** ⓑ `Record<key, boolean>` ⓒ 항목별 척도 | **ⓐ** — 서버가 미선택=false 로 해석, 키 추가 시 하위 호환 | NEEDS DECISION |
| **`N5-02`** | ⛔ `S5-A` | 입력 칸 (`PF5-1`·`PF5-2`) | ⓐ Figma 1칸 `note` ⓑ 1칸이지만 `revisitTopic` 으로 해석 ⓒ PRD 대로 두 번째 카드 추가(C-13 `C13-S5-3`, `S5-E`) | **ⓐ** | NEEDS DECISION |
| **`N5-03`** | ⛔ `S5-A` | 폼 정의 출처 | ⓐ 고정 enum + copy 모듈 (`GET /v1/reflection-form` 삭제) ⓑ 서버 폼 정의 | **ⓐ** | NEEDS DECISION (승인된 API_CONTRACTS 변경) |
| **`N5-04`** | ⛔ `S5-B` | 카드 제목 이름 출처 (`PF5-6`) | ⓐ copy 모듈 템플릿 + `Me.child.firstName` (UI 문구 슬롯 — 캐릭터 버블·생성 문구 아님) ⓑ 서버가 제목 문자열 제공 | **ⓐ** | NEEDS DECISION |
| **`N5-05`** | ⛔ `S5-A`·`B` | `Save` 활성 조건 | ⓐ 별·칩·입력 중 하나 이상일 때만 (빈 요청 schema 거부) ⓑ 항상 활성 | **ⓐ** | RECOMMENDED |
| **`N5-06`** | ⛔ `S5-A`·`B` | 건너뛰기 (`PF5-5`) | ⓐ 닫기 = 요청 0 · `skipped` 필드 삭제 ⓑ 닫기 시 `skipped: true` 전송 | **ⓐ** — 네트워크 0, 실패 경로 0 | NEEDS DECISION |
| **`N5-07`** | ⛔ `S5-B` | 저장 성공 후 | ⓐ 저장 Toast + 홈 replace ⓑ 화면에 남아 카드 읽기 전용 전환 ⓒ 피드백 화면으로 이동 | **ⓐ** — Figma 에 다음 화면이 없다. ⓒ 는 분석이 막 시작된 시점이라 항상 pending | NEEDS DECISION (C-13 성격의 동작) |
| **`N5-08`** | ⛔ `S5-B` | 회고가 이미 있는 세션 재진입 | ⓐ 같은 카드 읽기 전용(제출값 · `Save` Disabled) ⓑ 카드 숨김(y 468 아래 공백) ⓒ 수정 허용 | **ⓐ** — Figma 배치 유지, 새 문구 0. ⓒ 는 contract 변경 필요 | NEEDS DECISION |
| **`N5-09`** | ⛔ `S5-C` | `C13-S5-1` 피드백 화면 디자인 소스 | §16 질문 | ② design-agent 명세 | C-13 |
| **`N5-10`** | ⛔ `S5-C` | 피드백 화면 앱 내 진입점 | ⓐ deep link(URL)만 — Web 프리뷰에서는 직접 URL·dev 화면으로만 도달 ⓑ Home 에 진입점 추가(Figma 없음 → C-13) ⓒ 서재 히스토리에 진입점(Figma 없음 → C-13) | **ⓐ** — PRD FR-13 은 "알림" 이다. `R5-06` 수용 | NEEDS DECISION |
| **`N5-11`** | ⛔ `S5-A` | `metricsPreview` | ⓐ contract 에서 제거 ⓑ 유지·미렌더 | **ⓐ** | NEEDS DECISION (승인된 API_CONTRACTS 변경) |
| **`N5-12`** | ⚠ AC-5-41 | `OAQ-17` 녹음 삭제 세션 | ⓐ enum 변경 0 — Detail `uploadStatus` 로 판별, not-available 과 같은 표시 상태(문구만 사유) ⓑ `skipped_audio_deleted` enum 추가 ⓒ `ANALYSIS_NOT_AVAILABLE.details.reason` | **ⓐ** | NEEDS DECISION (`OAQ-17` 해소) |
| `N5-13` | — | 민감 발화 표시 | 세션 단위 outcome 신설 없음 · 중립 문구만 표시 | 그대로 | RECOMMENDED |
| **`N5-14`** | ⛔ `S5-C` | 폴링 정책 | §5.3 (15초 · failed 60초 · 가시성 · 종착 정지) | 그대로 | RECOMMENDED |
| **`N5-15`** | ⛔ `S5-C` | ⓐ `failed` 에 사용자 재시도 버튼 없음 / ⓑ 미로그인 deep link 목적지 보존 | ⓐ 버튼 없음(재시도 = worker) · ⓑ 보존 안 함(Guard 변경 0, 네이티브 후속 단계에서 재검토) | 둘 다 권장대로 | RECOMMENDED |
| `N5-16` | `S5-A` | `note` 상한 | 500자 (schema `.max` — 입력 제약이라 화면 비움 문제 없음) | 500 | RECOMMENDED |
| `N5-17` | — | 재시도용 입력 보존 범위 | 메모리만 · 디스크 0 | 그대로 | RECOMMENDED (Privacy) |
| `N5-18` | `S5-B` | 같은 별 재탭 | ⓐ 변경만, 해제 없음 ⓑ 재탭 해제 | ⓐ | RECOMMENDED |
| `N5-19` | `S5-B` | 별 터치 타깃 30px | ⓐ 시각 30 유지 + 히트 영역 44(간격 8 안에서 겹침 없는 범위 — design-agent 기하 확인) ⓑ 30 그대로 + 가값 | ⓐ (불가하면 ⓑ + `P-26`) | RECOMMENDED |
| **`N5-20`** | ⛔ `S5-B` | 칩 라벨 문자열 | ⓐ Figma 그대로 (`Stay Focus` · `Ask Questions` 대소문자 포함) ⓑ 문법 정정 (`Stayed focused` · `Asked questions`) — Figma 오타 판단 | **ⓐ** (최우선 규칙 1). ⓑ 를 원하면 디자이너 Figma 수정 후 반영 | NEEDS DECISION |
| `N5-21` | `S5-B` | Stage 4 AC-4-61·104 처리 | 승계 기록 후 단정 교체 (§5.4 R-2) | 그대로 | RECOMMENDED |
| `N5-22` | `S5-A` | FR-18 Stage 5 범위 | schema + fixture 만, API 메서드·호출자 0 | 그대로 | RECOMMENDED |
| `N5-23` | `S5-B` | 입력 있는 상태로 닫기 | 확인 다이얼로그 없음 (선택 사항 · 30초) | 그대로 | RECOMMENDED |
| `N5-24` | `S5-C` | pending 문구의 시간 표현 | 수치 약속 회피(예 *by tomorrow*) vs *within 24 hours* | design-agent 문안 → 사용자 확인 | NEEDS DECISION (copy) |

### 15.3 기존 미결의 변화

| ID | 이전 | 지금 |
|---|---|---|
| `G-06` / `M-15` | NEEDS DECISION | → `N5-01`·`N5-02`·`N5-20` 으로 분해. 승인 시 **Resolved** |
| `OAQ-17` | NEEDS DECISION (Stage 5) | → `N5-12`. 승인 시 **Resolved** |
| `OAQ-13` | NEEDS DECISION (법무) | 변화 없음 — Stage 5 비차단, Stage 7 차단 후보 |
| `C4-OPEN-6` | `reflection?` 은 Stage 5 | → C-4 로 이행 |
| `N4-13` | 대화 전용 스티커 지급 (권장: 지급) | 변화 없음 — Stage 5 무관 |
| FIGMA_SCREEN_MAP `29:62` 행의 2 route 분할 | 상단 `/complete` · 카드 `/reflection` | → **철회 제안** (§9). 승인 시 design-agent 가 SCREEN_MAP 갱신 |

### 15.4 PRD 수정 대상 후보 (지금 고치지 않는다 — `D-24` 절차는 사용자 지시 시)

| # | 위치 | 현재 | 결정 시 수정 방향 |
|---|---|---|---|
| S5-1 | §7.6 둘째 줄 · FR-12 · §5.3 #10 · §5.1 ⑦ | 자유 후기 = 다음 카드 · 주제 별도 | `PF5-1`·`PF5-2` 결과 (한 카드 · 한 입력) |
| S5-2 | §7.6 첫째 줄 | "질문 버블" | 카드 제목 (`PF5-4`) |
| S5-3 | §12.1 Session "피드백(별점·체크 항목·주제·자유 후기·메모)" | 5 요소 | 별점 · 체크 · 메모 (`PF5-1`) |
| S5-4 | §7.6 체크 항목 | 척도 불명 | on/off 5종 (`PF5-3`) |

---

## 16. C-13 대상 — Figma 에 없는 화면 (화면별 사용자 선택: ① 디자이너 Figma 요청 ② design-agent 명세)

| ID | 화면 / 상태 | PRD 근거 | Figma | 질문 | 권장 |
|---|---|---|---|---|---|
| **`C13-S5-1`** | **짧은 피드백 · 분석 상태 화면** `/session/:sessionId/feedback` — pending · analyzed(피드백 문구) · low-quality · failed · not-available(대화 전용 / 녹음 없음) · Loading · Error | FR-13 · FR-14 · §13 · NFR 24h | **없음** (FIGMA_SCREEN_MAP:131) | *"피드백·분석 상태 화면을 ① 디자이너에게 Figma 로 요청할까요, ② design-agent 가 기존 컴포넌트(CharacterMedallion · CharacterBubble · Surface · InlineAlert)로 명세할까요?"* | **②** — 기존 완료 화면 어휘(메달리온 + 버블)를 재사용하면 새 시각 언어가 0. ① 을 고르면 §12.1 분할 조건 |
| **`C13-S5-2`** | **회고 카드의 Figma 밖 상태** — 초기(별 0 · 칩 전부 off) · `Save` 비활성 · 제출 중 · 실패/오프라인 안내(입력 보존) · 재진입 읽기 전용 · 저장 성공 Toast | FR-12 · 공통 상태(#22) | 카드 1 상태만 (별 4 · 칩 2 선택 예시) | *"회고 카드의 빈 상태·저장 중·실패·저장됨 상태를 ① 디자이너 요청 ② design-agent 명세 중 무엇으로 할까요?"* | **②** — 공통 상태는 #22 로 명세 선행이 이미 결정된 유형이고, 기존 컴포넌트 상태(Button Disabled/loading · InlineAlert · Toast)로 표현된다 |
| `C13-S5-3` | **(조건부)** 자유 후기 두 번째 카드 — `N5-02` ⓒ 를 고를 때만 | §7.6 | 없음 | *"두 번째 카드를 만든다면 ① 디자이너 ② design-agent?"* | — (`N5-02` ⓐ 권장이므로 발생하지 않음) |

---

## 17. Handoff to design-agent

1. **Figma 실측 (선행)** — `29:62` 전체 재조회(4b 이후 변경 여부) + `91:691` **모든 하위 노드**: 카드 면·radius·그림자 겹 수(`R-FIGMA-1` ② — 렌더 바운드로 역산) · 제목 타이포 · 별 `117:879` 채움/빈 색 · 칩 선택/비선택 = loose `91:627`/`628` 대조(높이 31 vs 33 차이 원인) · 입력 `91:715` 면·테두리·placeholder 색 · `Save` `91:717` 상태. 접근이 막히면 **추측하지 말고 보고** (`R5-01`).
2. **좌표 결정** — 카드는 y 521(버블 bottom 468 + 53). 버블 높이가 문구에 따라 변할 때(1줄/2줄 · `subtext` 없음) **카드 y 를 고정할지 흐름으로 둘지** — 상단 불변(AC-5-19) 전제에서 판정.
3. **852 미만 높이** — 320×568 · 393×667 에서 스크롤·그림자 inset(`R-SHADOW-1`)·Toast inset 과의 관계.
4. **신규 Shared UI `StarRating`** — variant · 상태 · 키보드 · 히트 영역(`N5-19`) · 대비(`P-02`).
5. **`C13-S5-2` 상태 명세** (사용자 ② 선택 시) — §16 목록.
6. **`C13-S5-1` 피드백 화면 명세** (사용자 ② 선택 시) — 6 표시 상태 + Loading/Error, 문구 초안(`N5-24`), 레이아웃(Fullscreen vs Stack · 닫기/뒤로).
7. **copy** — 칩 라벨(`N5-20`) · 제목 템플릿(`N5-04`) · placeholder · 저장 Toast · 오류 문구(`error-copy.ts` 의 기존 `ANALYSIS_NOT_AVAILABLE` · `REFLECTION_ALREADY_SUBMITTED` 재사용 여부) · 진단·판정·비교 금지.
8. **토큰** — 신규 필요 시 값과 함께 요청. 가값은 `P-26` 부터 (`S3-PROV-1` — 번호 재배정 금지).
9. **`FIGMA_SCREEN_MAP.md` · `COMPONENT_MAP.md` 갱신 후보** — `29:62` 2 route 분할 철회(승인 시) · `ReflectionForm` 행 · `AnalysisStatusCard` 상태.

---

## 18. Frontend 단계에서 검증 불가 → `BACKEND_INTEGRATION_PENDING` 예상 요약

AC 4건 (AC-5-53~56) · Handoff 항목 16건 (`P5-BIP-01`~`16`, §10). 대상 문서: `BACKEND_HANDOFF` · `DATA_REQUIREMENTS` · `AUTH_REQUIREMENTS` · `ANALYSIS_PIPELINE_REQUIREMENTS` · `ERROR_CODES`.

---

## 19. 승인 체크포인트 결정 목록 — 한 번에 답할 수 있도록

### 19.1 PRD ↔ Figma (지점별)

`PF5-1`+`PF5-2`(한 입력) · `PF5-3`(on/off 칩) · `PF5-4`(카드 제목) · `PF5-5`(닫기 = 건너뛰기) · `PF5-6`(제목에 이름) — **전부 권고 = Figma**.

### 19.2 ⛔ 차단 (작업 단위 착수 전)

| 단위 | 결정 |
|---|---|
| `S5-A` | `N5-01` ⓐ · `N5-02` ⓐ · `N5-03` ⓐ · `N5-05` ⓐ · `N5-06` ⓐ · `N5-11` ⓐ · `N5-12` ⓐ |
| `S5-B` | `N5-04` ⓐ · `N5-07` ⓐ · `N5-08` ⓐ · `N5-20` ⓐ · **`C13-S5-2` ②** |
| `S5-C` | **`C13-S5-1` ②** · `N5-10` ⓐ · `N5-14` · `N5-15` |

### 19.3 비차단 (권장안으로 착수)

`N5-13` · `N5-16`(500) · `N5-17` · `N5-18` ⓐ · `N5-19` ⓐ · `N5-21` · `N5-22` · `N5-23` · `N5-24`(문안은 design-agent 후 확인) · §12.1 분할 안 함.

### 19.4 승인 후 plan-agent 후속

1. `API_CONTRACTS.md` **Rev 9** — §7 C-1~C-12 + §5.3·§5.4 시나리오 등재 + §6 `G-06` Resolved.
2. `ARCHITECTURE.md` §16 `OAQ-17` Resolved · §10.2 표 갱신 · `DATA_MODEL.md` §9 (§6 delta).
3. `PLANNING.md` §5 Stage 5 (Mock scenarios · Exit Criteria · Blocking decisions) 갱신 · M-15 Resolved.
4. 이 문서 `Status: APPROVED (YYYY-MM-DD, user)`.
