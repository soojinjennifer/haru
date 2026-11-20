# Stage 7 Plan — 4-Week Report + History + Highlight Audio + PDF UX (Frontend)

Status: **APPROVED (2026-11-19, user)** — `D7-5` (`docs/decisions/stage-7-approvals.md`). **rev 2 (M7 반영, 2026-11-19)** — Spec 정정 `M7-1`~`M7-12` · 결정 `N7-29`~`N7-50` 권고안(`D7-5`) 반영. 승인 범위 안의 반영이며 새 범위 추가 0.
Based on:
- PRD **v1.5 개정 3 + 보완** (`docs/source/HARU_PRD_v1.5.md`) — §2.3 리포트 열람률 · §5.2 시나리오 12 · **§6.1 IA 표 리포트 행** · §6.2 리포트 · §7.3 "변경 이력은 리포트의 히스토리" · **§7.7** · §7.9 하이라이트 클립 · §8.4 · §9 요금제(베타 무료) · NFR(콘텐츠 안전·프라이버시) · **FR-16 · FR-17 · FR-18** · FR-04 · FR-15 · §12.1 Report · **§13 리포트 미충족 · 리포트 생성 실패**
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — **이 세션에서 라이브 조회** (§0.1)
- `PLANNING.md` "### Stage 7" 초안 · §6 `M-10`·`M-11`·`M-12` · #17 · `docs/API_CONTRACTS.md` **Rev 10.1** (§2.2 · §3.5 · §3.12 · §4 Stage 7 표 · §5.4 · §6 `G-01`·`G-11`) · `docs/DATA_MODEL.md` §11 · `docs/FIGMA_SCREEN_MAP.md` (`31:102` · `110:522` · `/progress` 미충족 · `/progress/reports/:reportId` 행) · `docs/COMPONENT_MAP.md` (`StatTile` · `WeeklyReadingChart` · `NotableQuoteCard` · `ReportArchiveCard` · `HighlightClipPlayer` · `DiamondChart`)
- 결정 기록 `stage-0-approvals.md` (#14 · #15 · **#17** · #19 · #22 · C-13 · C-15 · C-18) · `stage-1-approvals.md` (리포트 기준 행) · `stage-3-approvals.md` (**D-2** · **D-6** · `L-D2` progressRatio 선례) · `stage-4-approvals.md` (**`D4-40`**) · `stage-5-approvals.md` (`N5-10` deep link 선례 · `N5-22`) · `stage-6-approvals.md` (`D6-1`·`D6-2` C-13 명세 선례 · `D6-8` Q5 숫자 미노출 · Q6 축 순서 · `PF6-2` · `N6-12` · `N6-47`) · `docs/qa/stage-6-qa-report.md` §11
- 코드(읽기만): `packages/contracts/src/enums/report.ts` · `rules/report-eligibility.ts` · `highlight-clips/clip.ts` · `children/history.ts` · `common/error-codes.ts` · `enums/notification.ts` · `apps/web/src/pages/progress/ProgressPage.tsx` · `shared/copy/progress-copy.ts` · `shared/config/routes.ts` · `shared/api/*` · `mocks/fixtures/highlight-clips.ts`
- 외부 문서: MDN `Navigator.share()` · `Navigator.canShare()` (2026-11-19 조회 — §5.5)
- **rev 2 근거**: `docs/design/stage-7-design-spec.md` (APPROVED 2026-11-19) §12.1 `M7-1`~`M7-12` · §12.2 `N7-29`~`N7-50` · §13 Visual Gap 계획 · §14 Handoff · 결정 `D7-1`~`D7-5` · 코드(읽기만) `packages/contracts/src/children/snapshot.ts`(`CapabilitySnapshotSource`) · `packages/ui/src/progress/ProgressBar.tsx`(`aria-valuenow` 노출 확인) · `apps/web/src/features/reflection/copy.ts`(체크 라벨 위치 확인)

Author: plan-agent (2026-11-19)

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 초판 | 2026-11-19 | Stage 7 범위 · Figma 조회(리포트 관련 프레임 **2**, 상세·클립·PDF 상태 **0**) · PRD↔Figma 충돌 `PF7-1`~`PF7-7` · C-13 9건 · contract 변경 `C7-1`~`C7-12` · Mock key · AC-7-01~74 · 결정 `N7-01`~`N7-28` · 작업 단위 `S7-A`~`S7-F` · 분할 제안(§12.1) |
| 승인 | 2026-11-19 | `D7-1`~`D7-4`(N7-01~28 권고안) · `D7-5`(Plan + Spec 승인, `N7-29`~`50` 권고안 전부 · `N7-41` chevron 제거 명시 승인) |
| **rev 2** | 2026-11-19 | **Spec 정정 `M7-1`~`M7-12` 반영** (아래 표). contract **`C7-2a`**(overview 조합 의미) · **`C7-4b`**(`personaHistory[].trigger` = `CapabilitySnapshotSource`) 신설 → `API_CONTRACTS.md` **Rev 11** 설계 반영. AC **개정** 08 · 20 · 22 · 24 · 30 · 31 · 33 · 34 · 40 · 43 · 56 · 59 · 70 · 73 · 74 / **신설** AC-7-75~84. Mock key 의미 보강(`success` · `report-deferred` · `report-eligible`) + 🆕 `report-deferred-first`. BIP **+2**(`P7-BIP-15`·`16`). 작업 단위별 선행·검증·Visual Gap 대상 표(§12.2). ID 재번호 0 |

### rev 2 — Spec 정정 `M7-##` 반영 위치

| M | 정정 | 반영 위치 (이 문서) | 결정 |
|---|---|---|---|
| `M7-1` | `163:2551` 주간 카드도 HTML import(변수 0) — Spec §0.3 흡수표를 `110:835` 와 공통 적용 | §0.1 주석 · `R7-09` · AC-7-77 | — |
| `M7-2` | chevron 토글 목적지 없음 | §2 · AC-7-24 **개정** · §17 | `N7-41` ⓐ 제거 (`D7-5` 명시 승인) |
| `M7-3` | 막대 = 선형 + 상한 클립, 강조 2개 | AC-7-22 **개정** | `N7-29` ⓐ 비례 높이 + `≥ 0.75×max` 강조(가값 `P-40`) |
| `M7-4` | 회고 체크 copy 가 `features/reflection` 에 있음 → feature 간 import 위반 | §5.1 · AC-7-43 **개정** · AC-7-75 · `S7-D` 선행 작업 | `N7-43` `entities/reflection` 이동 |
| `M7-5` | `personaHistory[].trigger` 타입 미정의 | §7 **C7-4b** · AC-7-08 · AC-7-40 **개정** · `API_CONTRACTS` Rev 11 · `P7-BIP-16` | `N7-42` `CapabilitySnapshotSource` 재사용 |
| `M7-6` | 카드 상태를 배타 5종으로 기술 → 실제는 `latestReport` × `currentCycle.status` 조합 | §2 · §7 **C7-2a** · §8 · AC-7-30 **개정** · AC-7-76 · AC-7-82 · `P7-BIP-15` | `N7-36` ⓐ · `N7-35` ⓐ |
| `M7-7` | 카드에 "열기" 어포던스 없음 · 카드 전체 링크 = 중첩 인터랙티브 | AC-7-33 **개정** | `N7-37` ⓐ 헤더 행 링크 |
| `M7-8` | 캐릭터 프레임 gradient fill 선언 + 크롭 | AC-7-78 | `N7-30` ⓐ 미렌더 |
| `M7-9` | StatTile 행 `overflow-clip` (Figma 에서도 그림자 잘림) | AC-7-79 | 미재현 (`AD7-11` 후보) |
| `M7-10` | Moment eyebrow `#6f8c88` 팔레트 밖 | AC-7-80 | `N7-32` ⓐ ink-500 흡수 |
| `M7-11` | `ProgressBar` 가 `aria-valuenow` 로 % 를 낭독 → `N7-05` 와 충돌 | §5.7 · AC-7-31 **개정** | 막대 `aria-hidden` + footer 텍스트 |
| `M7-12` | PDF ready 시 자동 저장 여부 미정 | §5.3 · AC-7-56 · AC-7-59 **개정** | `N7-40` ⓐ 자동 저장 0, Save · Share 노출 |

---

## 0. 출발점 — 무엇이 이미 있고 무엇이 없는가

| 항목 | 현재 상태 `[직독]` | Stage 7 에 주는 의미 |
|---|---|---|
| Stage 6 게이트 | `PASS (accepted: QA-6-005)` — 커밋 `a39d7ff` | ✅ 진입 조건 충족 |
| `/progress` | **준비 안내 화면** (`ProgressPage.tsx` = `EmptyState` 1개, contract 호출 0, 수치 0 — `D-2`) | Stage 7 이 대체한다. `progress-copy.ts` 는 `pages` 전용 → feature copy 로 이동 |
| 리포트 enum | `ReportEligibility`(5값, `cycle_in_progress` 포함) · `ReportStatus`(5값) · `NotificationKind`(`report_published` · `report_deferred_encourage` · `report_delayed`) | 그대로 쓴다 |
| 발행 기준 | `MIN_REPORT_RECORDED_SESSIONS=3` · `MIN_REPORT_RECORDED_SECONDS=3600` · `REPORT_CYCLE_DAYS=28` · `isReportEligible()` (`cycle_in_progress` 반환 안 함) · 경계 테스트 3599/3600 × 2/3 | **#17 잔여 3건**(대화 전용 세션의 주기 시작 포함 · 시간대 경계 · `cycle_in_progress` 판정 시점) = `N7-12`~`N7-14` |
| Error code | `REPORT_NOT_ELIGIBLE` · `REPORT_NOT_READY` · `PDF_NOT_READY` · `RECORDING_DELETED` · `PROVIDER_UNAVAILABLE` | 신규 0 권고 (§7 C-10) |
| 리포트 schema | **없다** — `ReportOverview` · `ReportSummary` · `ReportDetail` · `ReportPdfStatus` 는 `API_CONTRACTS` 표에만 | 신규 (§7) |
| 하이라이트 클립 | `HighlightClipSummary`(id · sessionId · durationSeconds · expiresAt nullable) · `SignedMediaUrl` — **schema + fixture 만, 호출자 0** (`N5-22`) | 재생 UI · `playback-url` 첫 호출 |
| 히스토리 목록 | `CapabilitySnapshotPage` · `PersonaPage` — **schema 만, 호출자 0** (`N6-12` "호출자 = Stage 7") | `N7-08` |
| 세션 목록 | `sessionApi.list` 존재 · 화면 0 · `D4-40`: AC-4-23 EmptyState 화면 부분 = **Stage 7(History)** | `N7-09` |
| Shared UI | `DiamondChart`(Stage 6, `previous?` 확장 자리만) · `ProgressBar` · `SelectTrigger` · `Surface` · `Sheet` · `EmptyState` · `ErrorState` · `Skeleton` · `Button` | `StatTile` · 막대 차트 · 클립 플레이어 신규 후보 |
| 플랫폼 Port | `recorder` · `recording-storage` · `push-permission` | **파일 공유 Port 없음** → `N7-19` |

### 0.1 Figma 조회 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 조회했는가)

| 조회 | 방법 | 결과 |
|---|---|---|
| 페이지 목록 | `get_metadata()` | `8:2` Design Guide · `16:2` MVP_KeyScreen_V.2 · `125:765` V.1 · `66:202` · `0:1` |
| `16:2` 최상위 프레임 전수 | `get_metadata(16:2)` → 들여쓰기 ≤4 행 추출 | 리포트 관련 = **`31:102`** "2b · Report — Weekly Growth" (393×1105) · **`110:522`** "div" (393×1752, HTML import). 2026-09-14 이후 **새 리포트 프레임 없음** (Stage 6 DRAFT `317:1358` 섹션은 프로필·설정만) |
| `125:765` · `0:1` | `get_metadata` | `125:1016` · `125:1155` = `31:102` · `110:522` 의 **구판**(V.1). `0:1` 에는 리포트 없음 |
| `8:2` Design Guide | `get_metadata(8:2)` | 리포트용 컴포넌트 **없음** — 오디오 플레이어 · 차트 · PDF · 페르소나 컴포넌트 0. 관련 = `Select 90:626`(chip) · `Tab Bar 25:87`(`Active=Report` variant) · `Icon shape=attend 113:2075` |
| `31:102` 구조·좌표 | `get_metadata` 하위 트리 + 좌표 | 아래 표 |
| `31:102` 화면 | `get_screenshot(31:102)` | 캐릭터(bookworm) 위에 StatTile 2개가 겹쳐 놓인 구성 확인 |
| `110:522` 화면 | `get_screenshot(110:522)` | 월 달력·주별 분·통계 3칸·4주 리포트 카드·옛 탭바(Session 중앙 mic) 확인 |
| 선언값 | `get_variable_defs(31:102)` | `text-primary #4a5f5c` · `text-secondary #7d9291` · `glass-fill #ffffffbd` · `glass-fill-strong #ffffffe5` · `accents/teal #85bfb6` · `accents/pink #efc3d4` · `accents/blue #7faec1` · `color/violet/67 #ac93c4` · `HARU/Shadow Rest`(5겹) · `HARU/Glass Rest`(blur 24 + 5겹) |
| `110:835` 선언값 | `get_variable_defs(110:835)` | **`{}` — 변수 바인딩 0.** HTML import 라 raw 값만 있다 → 측정값은 design-agent 가 `get_design_context` 로 다시 조회해야 한다 (`R-FIGMA-1` ①) |

> **rev 2 (`M7-1`)**: design-agent 실측 결과 **`31:102` 안의 `163:2551` "This week's reading" 카드도 HTML import 형식**(layer `div`/`span`, 텍스트·막대 raw HEX, 변수 0)이다. `31:102` 의 변수 바인딩은 제목·StatTile·Growth·Moment 일부 텍스트와 fill 4색뿐이다. → raw 값 흡수표(Spec §0.3)는 `110:835` 와 `163:2551` **두 카드에 공통** 적용한다 (AC-7-77).

⚠️ 이 세션은 `get_design_context` 를 쓰지 않았다(Plan 단계 — 구현 명세 아님). **치수·색·그림자 겹 수의 실측은 design-agent 책임**이며, 아래 좌표는 `get_metadata` 의 layout box 값이다 (렌더 바운드 아님).

**`31:102` "2b · Report — Weekly Growth"** — `[S][DC]` (FIGMA_SCREEN_MAP 표기 유지)

| 블록 | node | box (x, y, w×h) | 내용 |
|---|---|---|---|
| 제목 행 | `31:115` | 24, 66, 345×40 | `31:117` "Progress" · `31:118` chip "May 4 – 10 ˅" (230, 3, 115×34) |
| 캐릭터 | `163:2642` | 24, 70, 347×422 | bookworm 일러스트 (`163:2536` 계열) — 아래 StatTile 이 겹침 |
| 본문 스택 | `163:2638` | 24, 346, 345×668 | 아래 4블록, 간격 14 (0 → 98 → 323.6 → 552.6) |
| ① StatTile ×2 | `163:2544` | 0, 0, 345×84 | `163:2545` "5 / sessions" (167.5×73) · `163:2548` "62m / together" — 가로 간격 10 |
| ② This week's reading | `163:2551` | 0, 98, 345×211.6 | 제목 · "1h 12m" · **"+18% vs last week"** · **"6 of 7 nights · avg 12 min"** · 요일 막대 7(M~S, 분 라벨, "—" = 없음) · 접기 chevron |
| ③ Growth themes | `163:2607` | 0, 323.6, 345×215 | 4행: Self-Direction **strong** · Emotion Regulation **growing** · Cognitive Flexibility **emerging** · Intrinsic Motivation **emerging** · 막대 4색 teal/pink/blue/violet-67 |
| ④ Moment of the week | `163:2633` | 0, 552.6, 345×115 | "MOMENT OF THE WEEK" · 인용 · "Tue · The Most Magnificent Thing, p.14" |
| 탭바 | `40:237` → `40:339` | 0, 983, 393×122 | `Screen/Tab Bar` (Active=Report, 라벨 Progress) |

**`110:522` "div"** — `[S][M]` HTML import · 변수 바인딩 0 · **옛 비컴포넌트 탭바(Library | Session | Report) 포함 — `#15` 로 미사용 확정**

| 블록 | node | box | `31:102` 대비 |
|---|---|---|---|
| 제목 행 · 캐릭터(작게) | `148:1470` · `110:532` | 0,0 / 0,54 345×118 | 캐릭터 크기 다름 |
| StatTile ×2 | `110:540` | 0, 186, 345×70 | 수치 **6 / 72m** (`31:102` = 5 / 62m — `M-10` 수치 불일치) |
| 주간 + 월 달력 + 주별 분 + 통계 3칸 | `110:557` | 0, 270, 345×730.6 | 추가: "May 2026 · 8 nights · 1h 39m" 달력(attend 스탬프) · "Minutes per week" 5행 · **"4 longest streak" · "80% of nights read" · "12m avg session"** |
| Growth themes | `110:804` | 0, 1014.6, 345×206 | 라벨 **"Emotion words / Cognitive words / Motivation words"** (`M-13` 위반 표기) · 막대 회색 |
| Moment of the week | `110:828` | 0, 1234.6, 345×118.6 | 같음 |
| **4-week full report** | **`110:835`** | 0, 1367.2, 345×230.5 | 아이콘 44 · "4-week full report" · "Apr 13 – May 10 · a deeper read on the four themes, with the moments behind them." · "Covers the last four weeks of sessions." · **ProgressBar** `110:851` (268.5×7) + 값 span `110:853` · **"Download PDF"** 버튼 `110:854` (313×50) · **"Next report on Jun 7 · we'll email it too."** `110:861` |

**리포트 상세 · 미충족 · 생성 지연 · 클립 · PDF 상태 · 페르소나 히스토리 · 아카이브 목록 화면 = Figma 0** → §16 C-13.

---

## 1. Goal

양육자가 **Progress 탭**에서 이번 주 독서 관찰(Figma `31:102`)과 4주 리포트 진행 상태를 보고, 발행된 **4주 리포트 상세**(역량 변화 오버레이 · 페르소나 히스토리 · 대화 지표 · 인용 · 부모 피드백 요약 · 하이라이트 클립 재생)를 열람하며, **PDF 를 받아 저장·공유**하는 흐름을 — 발행 기준 충족/미충족/이월/생성 지연 양쪽 모두 — Mock API 위에서 검증한다. 실제 집계·생성·발행·PDF 렌더링·클립 추출은 Backend Integration Requirement 로 남긴다.

---

## 2. In Scope (요구사항 ID별, Frontend 부분)

| 요구사항 | Frontend 부분 (이번 Stage) | 하지 않는 부분 |
|---|---|---|
| **§6.1 리포트 탭 · `31:102`** (`M-10` — `N7-01`) | `/progress` 를 Figma `31:102` 로 대체: 주 선택 chip · 캐릭터 · StatTile 2 · This week's reading(막대 7) · Growth themes 4행 · Moment of the week · 탭바. 데이터 = 신규 `WeeklyProgress` (§7 C-1). **rev 2**: 주간 카드 chevron 토글(`163:2561`) **미렌더** — 목적지 없음(`M7-2` → `N7-41` ⓐ, `D7-5` 명시 승인, 허용 차이 후보 `AD7-12`) · 막대 = 비례 높이 + `≥ 0.75×max` 강조(`N7-29` ⓐ) | 주간 집계 산식(PENDING) · `110:522` 월 달력·주별 분·통계 3칸(`N7-02`) · **주간 카드 접기/펼치기 동작**(rev 2) |
| **FR-16** 4주 리포트 (P0) — 발행 게이팅 **표시** | Progress 탭의 **4주 리포트 카드**(`110:835` 기반). **rev 2 (`M7-6`)**: 카드 = **`latestReport`(nullable) × `currentCycle.status` 조합** — 배타 5상태가 아니다. Figma `110:835` = *발행 리포트(기간 · PDF · 상세 링크) + 다음 주기 진행 막대 + Next report on* 한 카드. 분기표(Spec §2.2): 발행有+진행 · 첫 주기 진행 · 생성 중 · 이월 · 지연 (생성 중·이월·지연에서는 이전 발행 리포트를 카드에 두지 않고 과거 목록으로 — `N7-35` ⓐ). 상세 진입 = **카드 헤더 행 링크**(`N7-37` ⓐ). `ReportOverview` 첫 소비 | eligibility 판정·주기 계산·생성·발행 push (PENDING) · eligibility 세부 사유 노출(사유별 문구 0) |
| **FR-16** 리포트 상세 · **§7.7 구성 요소** | `/progress/reports/:reportId` (C-13): 역량 변화(다이아몬드 이전/현재 오버레이 + 근거 문장) · 페르소나 히스토리 · 대화 분석 · 인용 1~2 · 부모 피드백 요약 · 하이라이트 클립 · PDF. `POST viewed` | 문구 생성·안전 검증(PENDING) |
| **FR-04** 다이아몬드 **오버레이** | Stage 6 `DiamondChart` 에 `previous` 레이어 확장 (`packages/ui`) — 리포트 상세에서만 | Progress 탭에 다이아몬드 추가 (`PF7-2` 권고 = 안 함) |
| **FR-15 · §7.3** 페르소나·프로필 **히스토리 표시** | 리포트 상세의 페르소나 히스토리 타임라인(리포트 스냅샷 기준). 별도 히스토리 화면은 `N7-08`. **rev 2**: 항목별 출처 문구 = `trigger`(`CapabilitySnapshotSource`, C7-4b) → copy 3종 선택(`N7-42`) | 히스토리 목록 API 호출 여부 `N7-08` |
| **FR-18** 하이라이트 클립 **재생** (P0) | `HighlightClipPlayer` (C-13): 재생/일시정지 · 진행 · 길이 · 만료/삭제 상태 · signed URL 만료 시 1회 재발급. `playback-url` 첫 호출 | 10~15초 추출 · 보관(`OAQ-13`) · signed URL 발급 (PENDING) |
| **FR-17** PDF 다운로드·공유 (P1) | 요청(IK) → 폴링 → ready → **저장(다운로드)** · **공유**(Web Share, 미지원 시 저장만) · 생성 실패·지연 · 공유 취소(오류 아님). Mock = 가짜 PDF | PDF 렌더링·서명 URL·보관 (PENDING) |
| **§13** 리포트 미충족 · 생성 실패 | 미충족 = 이월 안내 + 다음 리포트 예정일(`N7-05`) · 생성 실패 = 지연 안내(재시도 3회 · 익일 재생성은 서버) | 독려 push 발송 (PENDING) |
| **§7.7** 발행 알림 진입 | push `report_published` → `/progress/reports/:reportId` deep link (Stage 5 `N5-10` 선례) · Home 버블은 기존 서버 문장 `characterLine` 통로(UI 변경 0) | push 발송·문장 생성 (PENDING) |
| **§2.3** 리포트 열람률 | 상세 최초 표시 시 `POST /v1/reports/:reportId/viewed` 1회 (멱등) | 집계 (PENDING) |
| 공통 상태 (#22) | 전 화면 Loading · Error · Offline · Retry · Empty(리포트 0건 · 이번 주 세션 0) | — |
| 이월 `D4-40` (AC-4-23 세션 목록 EmptyState) | **`N7-09` 결과에 따름** — 권고 = Stage 8 로 재이월 | — |

---

## 3. Out of Scope

| 항목 | 이유 / 이동 |
|---|---|
| `apps/api` · `supabase` · `apps/mobile` · Backend 런타임 코드 | Frontend-only (`CLAUDE.md`) |
| 집계·eligibility 서버 판정 · 리포트 생성 Job · scheduler · 재시도 3회/익일 · narrative 생성 · 안전 필터 · PDF 렌더러 · 클립 추출·보관 Cron · push 발송 · 이메일 | Backend Requirement (§10) |
| **리포트 이메일 발송** (`110:861` "we'll email it too" · `G-11`) | `N7-06` 권고 = 문구 제외 · 채널 미도입 |
| `110:522` 월 달력(attend 스탬프) · Minutes per week · longest streak · % of nights read · avg session 3칸 | `N7-02` 권고 = 미채택 (탐색 변형 · streak/달성률 언어 — `D-6`·`G-02` 선례) |
| Free 플랜 업그레이드 안내 (PRD §9 "리포트 상세 열람 시") | FR-26 P2 · 베타 전 기능 무료 (§9 본문) — **CONFIRMED (PRD)** |
| 세션별 녹음 삭제 · 데이터 관리 · 탈퇴 | Stage 8 (C-15) — 단 클립 `RECORDING_DELETED` **표시**는 Stage 7 |
| 세션 히스토리 목록 화면 | `N7-09` 권고 = Stage 8 (FR-21 세션별 삭제 목록과 같은 화면) |
| 알림 설정 화면(`C13-19`) · 리포트 알림 on/off | `D-18` 이월 그대로 |
| 네이티브 공유 시트 · 파일 저장(Capacitor) | 후속 단계 S4N-A (`D4-1`) — Port 만 둔다 |
| 다국어 · 다중 아동 | FR-27·28 P2 |

---

## 4. Dependencies

| 의존 | 상태 | 영향 |
|---|---|---|
| Stage 6 PASS | ✅ `PASS (accepted: QA-6-005)` | — |
| Stage 6 `DiamondChart` (`packages/ui`, `previous?` 확장 자리) | ✅ 구현됨 | 오버레이 확장 = `S7-B` |
| Stage 6 `PersonaCard` (Domain) | ✅ | 히스토리 행 재사용 |
| Stage 5 deep link 진입 패턴 (`N5-10`) | ✅ | `report_published` 동일 구조 |
| **Figma 리포트 상세·상태 화면** | ❌ 없음 | C-13 9건 (§16) — `N7-07` |
| `M-10` 리포트 탭 IA | **미결** (Stage 0 부터) | ⛔ `N7-01` |
| `M-11` 이메일 | 미결 | `N7-06` |
| `M-12` 성장 표현 언어 | 미결 | ⛔ `N7-03` |
| `PF6-2` · `N6-47` (다이아몬드 위치 · `163:2607` 역량 색) | Stage 7 에서 결정하기로 기록 (`D6-8`) | `N7-04` · `N7-10` |
| #17 잔여 3건 | 미결 | `N7-12`~`N7-14` (Frontend 비차단, contract 의미 기록용) |
| `OAQ-13` 클립 보관 기간 (법무) | 미결 | Frontend 비차단 — 만료 표시 방식 `N7-17` |
| `OAQ-17` `skipped_audio_deleted` | 미결 | 클립 삭제 표시는 error code 로 충분 — 비차단 |
| 오디오 Mock 에셋 | 없음 | 런타임 생성 WAV (§8, `N7-20`) — 실제 아동 음성 금지 |

---

## 5. Frontend Architecture Impact

### 5.1 레이어 배치 (RECOMMENDED — 이름 확정은 development-agent)

```
pages/progress/ProgressPage.tsx            ← 조립만 (placeholder 교체)
pages/progress/ReportDetailPage.tsx        ← /progress/reports/:reportId
features/progress-overview/                ← 주 선택 · WeeklyProgress 표시 · 리포트 카드 상태 분기
features/report-detail/                    ← 상세 섹션 조립 · viewed 1회
features/report-pdf/                       ← 요청·폴링·저장·공유 상태 머신
features/highlight-clip-player/            ← 재생 상태 머신 (signed URL 재발급 포함)
entities/report/                           ← reportKeys · useReportOverview · useReport · useReportList · useMarkReportViewed · 표시 컴포넌트(ReportCard 계열 · NotableQuoteCard · DialogueMetricList)
entities/weekly-progress/                  ← progressKeys · useWeeklyProgress · StatTile 조합 · WeeklyReadingChart · GrowthThemesCard
entities/highlight-clip/                   ← usePlaybackUrl
shared/api/report-api.ts · progress-api.ts · highlight-clip-api.ts (+ http 골격)
shared/platform/file-share/                ← FileSharePort (Web | Mock) — N7-19
mocks/reports/ · mocks/progress/ · mocks/highlight-clips/ · mocks/fixtures/reports.ts …
packages/ui: DiamondChart(previous 레이어) · StatTile(신규) · BarChart 또는 WeeklyBars(N7-21) · (AudioProgress 여부 design-agent)
```

- feature 간 직접 import 금지: `report-detail` 은 `highlight-clip-player` · `report-pdf` 를 import 하지 않는다 — **page 에서 조립** (`rules/architecture.md` §3). Progress 카드의 "Download PDF" 도 page 가 `report-pdf` 를 꽂는다.
- **rev 2 (`M7-4` → `N7-43`)**: 회고 체크 라벨 copy(`REFLECTION_CHECK_ORDER` · `checks` 라벨 — 현재 `apps/web/src/features/reflection/copy.ts`)를 **`entities/reflection`** 으로 이동한다. `features/reflection` 과 `features/report-detail` 은 둘 다 `entities/reflection` 에서 import 한다 (feature 간 import 0). Stage 5 회고 화면 동작·문구·시각 baseline **불변**이 조건. 이동은 `S7-D` 의 **첫 작업**(별도 커밋 단위 권고) — AC-7-75.
- **rev 2 (`M7-6`)**: `features/progress-overview` 의 카드 분기는 **순수 함수 1개**(`resolveReportCardView(overview)` 류 — 이름은 development-agent)로 두고 분기표 단위 테스트로 고정한다. 입력 = `latestReport` · `currentCycle.status` · `currentCycle.progressRatio` · `nextReportDate` · `reportCount` 만, eligibility 재판정 0.
- **rev 2 Shared UI 확장 (Spec §3.9)**: `StatTile`·`BarChart` 신규, `DiamondChart.previous` · `Surface fill="card"` · `ProgressBar` fill 색 override(`--progress-fill-color`) · `ListRow.subtitle?` 확장 — **전부 prop 미지정 시 DOM·렌더 불변**(Stage 6 baseline 회귀 0, AC-7-81). Domain 확장 `PersonaCard` `eyebrow?` · `footnote?` 도 같은 조건.
- 수치·기간 계산 금지: 주 경계·주기·진행률·"Next report on" 날짜는 **서버 값만** 표시 (`L-D2` progressRatio 선례, `N7-05`·`N7-13`). Frontend 는 날짜 **포맷**만 한다.
- `isReportEligible` 은 **Mock 과 contract 테스트**만 쓴다 — 화면은 응답 `eligibility` 를 그대로 분기 (Frontend 재판정 금지).

### 5.2 Server State (RECOMMENDED)

| Query key | stale | 무효화 |
|---|---|---|
| `progressKeys.week(childId, weekStart)` | 5분 | 회고 저장·세션 완료 시 현재 주 invalidate (Stage 5/6 연쇄 지점에 1줄) |
| `reportKeys.overview(childId)` | 1분 | push 진입 · 탭 재진입 시 refetch |
| `reportKeys.list(childId)` (infinite) | 5분 | overview 의 `latestReport.id` 가 바뀌면 invalidate |
| `reportKeys.detail(reportId)` | **Infinity** (발행 리포트 불변 — `report_snapshots`) | 없음 |
| `reportKeys.pdf(reportId)` | 폴링 중 0 | 상태 머신 소유 |
| `clipKeys.playback(clipId)` | `expiresAt − 30s` | 만료·403 시 1회 재발급 |

로그아웃(`useSignOut`) 시 위 키 전부 `removeQueries` — 인용·아이 이름·클립 URL 이 메모리에 남지 않게 (`architecture.md` §9).

### 5.3 PDF 상태 머신 (features/report-pdf)

```
idle → requesting (POST, Idempotency-Key = reportId+attempt) → generating (GET 폴링, PDF_NOT_READY)
     → ready{downloadUrl, expiresAt, fileName} → (save | share)
     → failed (status=failed · PROVIDER_UNAVAILABLE · 폴링 상한 초과) → retry → requesting
share: canShare({files}) ? fetch(downloadUrl)→File→navigator.share : save only
share 거절 AbortError → ready 로 복귀(오류 표시 없음) · NotAllowedError → save 로 안내
```

- 폴링: 간격·상한은 contract 상수로 둔다 (`REPORT_PDF_POLL_INTERVAL_MS` 권고 2000 · 상한 60초) — 서버 생성 시간 요구와 짝(§10 `P7-BIP-09`).
- **transient activation**: `navigator.share()` 는 사용자 제스처 안에서만 호출 가능(MDN — 없으면 `NotAllowedError`). 따라서 **PDF Blob 을 ready 시점에 미리 받아 두고**, 공유 버튼 탭 핸들러에서는 `await` 없이 바로 `share()` 를 부른다 → `R7-04`.
- 저장(Web): `<a download>` + blob URL → 사용 후 `revokeObjectURL`. 파일명 = 서버 `fileName`(아이 이름 포함 가능 — 로그 금지).
- **rev 2 (`M7-12` → `N7-40` ⓐ)**: `ready` 도달 시 **자동 저장 0**. `ready` 화면은 **Save PDF** (+ `canShareFile` 이면 **Share**) 버튼을 노출하고, `save` · `share` 는 **둘 다 해당 버튼 탭 핸들러 안에서만** 호출한다(비동기 대기 후 자동 다운로드는 iOS Safari 차단 가능 · 공유와 같은 제스처 규칙). 상태 머신 전이 `ready → (save | share)` 는 **사용자 이벤트만** 트리거한다 (AC-7-56 · 59).
- 카드(§2)와 상세 하단은 **같은 컴포넌트·같은 query key** `reportKeys.pdf(reportId)` — 한쪽에서 준비하면 다른 쪽도 `ready` (`N7-24`).

### 5.4 하이라이트 클립 재생 (features/highlight-clip-player)

- `<audio preload="none">` + 커스텀 컨트롤(Lucide play/pause). **한 번에 하나만 재생** (다른 클립 재생 시 이전 정지).
- 재생 탭 → `playback-url` 조회 → `src` 설정 → `play()`. URL 만료(`expiresAt` 경과 · 미디어 오류 403) → **1회** 재발급 후 재시도, 실패 시 오류 상태.
- `RECORDING_DELETED`(삭제·보관 만료) → "더 이상 들을 수 없음" 상태 (재시도 버튼 없음). `expiresAt` 경과 클립은 조회 전에도 같은 상태로 표시 (`N7-17`).
- 화면 이탈·탭 전환·로그아웃 → 정지 + `src` 제거. URL·클립 ID 를 콘솔·에러 리포트에 남기지 않는다.
- `prefers-reduced-motion` — 진행 애니메이션 없음(값만 갱신).

### 5.5 FileSharePort (`N7-19`, RECOMMENDED)

교체가 실제로 예정된 경계(Web ↔ Capacitor Share/Filesystem — `D4-1` S4N-A)이므로 `architecture.md` §1 의 추상화 조건을 충족한다.

```ts
interface FileSharePort {
  canShareFile(file: File): boolean;            // navigator.canShare?.({ files: [file] }) === true
  shareFile(file: File, title: string): Promise<'shared' | 'cancelled'>;  // AbortError → 'cancelled'
  saveFile(blob: Blob, fileName: string): void; // <a download>
}
```

근거(MDN, 2026-11-19 조회): `Navigator.share()` 는 secure context 전용 · 사용자 제스처(transient activation) 필수 · 취소 시 `AbortError` · `application/pdf` 는 "usually shareable" 목록에 있으나 **`canShare()` 로 런타임 확인 필수** · Baseline 아님(제한적 지원). Mock Port: `share-cancelled` · 미지원 시나리오 재현.

### 5.6 Privacy (Frontend 책임)

- 리포트·인용·클립은 아동 데이터 — 콘솔·에러 리포트·URL query 에 이름·인용·클립 URL·PDF 파일명 금지 (`devWarn` 살균 규칙 재사용).
- PDF Blob · 오디오 URL 을 `localStorage`·IndexedDB·Cache Storage 에 저장하지 않는다 (메모리 전용).
- deep link 경로에는 `reportId` 만 (이름·기간 금지).
- Mock fixture: 아이 이름 `Emma`(`D5-14`) · 가상 인용 · 가상 오디오(합성 톤/무음) — 실제 아동 음성·데이터 0.

### 5.7 숫자 미낭독 — 진행 막대 접근성 (rev 2, `M7-11`)

`packages/ui` `ProgressBar` 는 `role="progressbar"` + `aria-valuenow`/`aria-valuemin` 을 내보내므로(코드 직독) `valueText` 를 비워도 스크린리더가 **퍼센트를 읽는다** → `N7-05`(분자/분모·숫자 미노출)와 충돌한다.

| 막대 | 처리 | 정보 전달 |
|---|---|---|
| 4주 리포트 카드 진행 막대(`110:851`) | **`aria-hidden`** (래퍼 또는 장식 모드) — progressbar role 이 접근성 트리에 남지 않는다 | footer *"Next report on {date}"* · 상태 설명 문장 |
| Growth themes 막대 (`163:2607`) | `aria-hidden` (Spec §3.5) | 단계 라벨 텍스트 (*"Self-Direction, strong"*) |
| 주간 막대 (`BarChart`) | `role="list"` + 항목 이름 (*"Monday, 8 minutes"*) — progressbar 아님 | 분 = 관찰 수치(승인된 표시값) |
| 클립 재생 진행 (`ProgressBar sm`) | `role="progressbar"` 유지 — 재생 위치는 비교·달성률이 아니며 시각 텍스트 *"0:04 / 0:12"* 와 같은 정보 | 시간 텍스트 |

`ProgressBar` 에 장식 모드 prop 을 추가할지 래퍼 `aria-hidden` 으로 할지는 development-agent 판단(둘 다 prop 미지정 시 DOM 불변). 검증 = 접근성 트리에서 카드·Growth 영역 `progressbar` role **0** (AC-7-31).

---

## 6. Data Requirement Delta (Backend Handoff 용 — 구현 아님)

| 테이블 / 데이터 | 변경 | 근거 |
|---|---|---|
| `weekly_progress` (또는 조회 시 집계) | 🆕 주 단위 집계: sessions_count · minutes_together · daily_minutes[7] · growth_theme_stage ×4 · moment_quote_id. 주 경계 = 보호자 시간대 월~일 (`N7-13`) | `M-10` · `C7-1` |
| `caregivers.timezone` | 🆕 IANA 시간대 — 주·주기·"Next report on" 날짜 경계 (`N7-13`) | #17 잔여 |
| `report_cycles` | `next_report_date` · `progress_ratio`(서버 산식, `N7-05`) 노출 · 주기 시작 규칙 확정(`N7-12`) | DATA_MODEL §11 |
| `report_snapshots` | section 에 `child_display_name`(발행 시점 동결 — `N7-16`) · `highlight_clips[].label` · `persona_history[]` 정렬 규칙 · **rev 2**: `persona_history[].trigger` = 그 페르소나를 만든 **역량 스냅샷의 `source`**(`onboarding_survey` · `survey_update` · `session_analysis` — Stage 6 `capability_snapshots.source` 와 같은 값 집합, `N7-42`) | FR-16 · `N7-16` · C7-4b |
| `report_cycles` (rev 2) | 발행 직후 `currentCycle` 은 **다음 주기**(`in_progress`)로 넘어가고 방금 발행된 리포트는 `latestReport` 로 노출 · `deferred` 는 이월된(합쳐진) 현재 주기의 상태로 다음 평가까지 유지 (C7-2a) | `M7-6` · `P7-BIP-15` |
| `report_pdfs` | `file_name` (서버 생성) · 상태 `failed` 노출 · 다운로드 signed URL 만료 | FR-17 |
| `highlight_clips` | `label`(서버 캡션, 인용 텍스트 아님 — `N7-18`) · 삭제·만료 시 리포트 스냅샷의 참조 처리(DATA_MODEL §11 NEEDS DECISION 권장안 = 참조 제거 아님, **`RECORDING_DELETED` 로 응답**) | FR-18 · `N7-17` |
| `reports.viewed_first_at` | 이미 있음 — `POST viewed` 멱등 | §2.3 |

---

## 7. API Contract Delta (승인 `D7-5` — development-agent 가 `S7-A` 에서 `packages/contracts` 구현 · plan-agent 가 `API_CONTRACTS.md` **Rev 11**(설계, rev 2 와 같은 날)로 반영 완료)

| ID | 변경 | 내용 (스케치) | 결정 |
|---|---|---|---|
| **C7-1** | 🆕 `WeeklyProgress` + `GET /v1/children/:childId/progress/weekly?weekStart=YYYY-MM-DD` | `{ week{start,end: IsoDate}, availableWeeks: IsoDate[] /* 선택 가능 주 시작일, 최신 먼저 */, sessionsCount: int≥0, minutesTogether: int≥0, readingSummary{ totalMinutes, nightsWithSession: int 0..7, averageSessionMinutes: int|null }, days: [{date, minutes: int|null}] × 7, growthThemes: [{capability, stage: GrowthThemeStage, level: 0..1}] × 4 (Q6 순서), momentOfWeek: {quote, speakerName, sessionDate, bookTitle, pageRef|null} | null }`. `weekStart` 생략 = 이번 주 | `N7-01` · `N7-03` |
| C7-1a | 🆕 enum `GrowthThemeStage = emerging | growing | strong` | 서버 판정 · 화면은 라벨만(숫자 미노출 — `D6-8` Q5) | `N7-03` ③ |
| **C7-2** | 🆕 `ReportOverview` (기존 표 구체화) | `{ currentCycle{ cycleNo, periodStart, periodEnd, status: ReportStatus, eligibility: ReportEligibility, progressRatio: 0..1 /* 서버 산식 */, nextReportDate: IsoDate|null, progress{recordedSeconds, requiredSeconds, recordedSessions, requiredSessions} }, latestReport: ReportSummary|null, reportCount: int≥0 }` — `latestSnapshot`(다이아몬드)은 **제거** (`PF7-2`) | `N7-04` · `N7-05` |
| **C7-2a** (rev 2, `M7-6`) | `ReportOverview` **필드 의미 확정 — schema 모양 변경 0** | ① `latestReport` = 가장 최근 **발행된** 리포트(없으면 `null`) · `currentCycle` = 지금 쌓이고 있는 주기 — **두 필드는 독립**이며 화면은 둘을 **조합**한다 (배타 상태 아님) ② 발행 직후 서버는 `currentCycle` 을 **다음 주기**(`status: in_progress`)로 넘긴다 → Figma `110:835` 의 *발행 리포트 + 다음 주기 막대 + Next report on* 구성 ③ `currentCycle.status = published` 는 정상 응답에서 오지 않는다 — 오면 화면은 `in_progress` 와 같게 처리(방어) ④ `deferred` = 미충족으로 **이월되어 합쳐진 현재 주기** — `progressRatio` · `nextReportDate` 는 그 주기 기준 ⑤ `generating` · `delayed` 의 `progressRatio` 는 표시하지 않는다(값은 schema 상 존재) ⑥ `reportCount` = 발행 리포트 수(`latestReport` 포함) | `N7-35` · `N7-36` |
| **C7-3** | 🆕 `ReportSummary` · `GET /v1/children/:childId/reports` (cursor) | `{ id, cycleNo, periodStart, periodEnd, publishedAt, summaryLine: string /* 서버 문장 */, viewed: boolean }` · `Paginated<ReportSummary>` 최신 먼저 | `N7-11` |
| **C7-4** | 🆕 `ReportDetail` · `GET /v1/reports/:reportId` | `{ summary: ReportSummary, childDisplayName, capabilityChange{ previous: CapabilityScores|null, current: CapabilityScores, items[4]{capability, evidence: string|null} }, personaHistory: [{personaId, name, description, effectiveFrom, trigger}] (≥1, 오래된 것 먼저), dialogueMetrics{ sessionCount, totalMinutes, childUtteranceCount, turnTakingCount, emotionWordCount, recentSignals: string[] }, notableQuotes: [{text, sessionDate, bookTitle|null}] (1..2), parentFeedbackSummary{ summaryText: string|null, checkTrends: [{key: ReflectionCheckKey, count}], frequentTopics: string[] } , highlightClips: ReportHighlightClip[] (0..n) }` · 오류 `REPORT_NOT_READY` · `REPORT_NOT_ELIGIBLE` · `NOT_FOUND` | `N7-15` · `N7-16` |
| **C7-4b** (rev 2, `M7-5`) | `personaHistory[].trigger` **타입 확정** | `trigger: CapabilitySnapshotSource` (`onboarding_survey` · `survey_update` · `session_analysis` — Stage 6 `children/snapshot.ts` enum **재사용**, 신규 enum 0 · §2 enum 수 불변). 의미 = 그 페르소나를 만든 스냅샷의 출처. 화면은 값으로 copy 3종을 **고르기만** 한다: `onboarding_survey` → *From your answers* · `survey_update` → *From your updated answers* · `session_analysis` → *From your storytimes* (Spec §10.3). 미정의 값 = parse 거부 | `N7-42` |
| C7-4a | 점수 숫자 노출 여부 | `CapabilityScores` 값은 **차트 형상에만** 쓰고 텍스트 숫자 미노출 (`D6-8` Q5 일관) — PRD "2.5 → 2.9" 와 충돌 `PF7-4` | ⛔ `N7-15` |
| **C7-5** | 🆕 `ReportHighlightClip` = `HighlightClipSummary` + `{ label: string /* 서버 캡션 */, sessionDate: IsoDate }` | 기존 schema 확장(extend) — Stage 5 fixture 호환 | `N7-18` |
| **C7-6** | 🆕 `ReportPdfStatus` · `POST /v1/reports/:reportId/pdf` (IK) · `GET …/pdf` | `{ status: 'queued'|'generating'|'ready'|'failed', downloadUrl: url|null, expiresAt: datetime|null, fileName: string|null }` · `ready` 이면 url·expiresAt·fileName 필수 (refine) · 생성 중 GET = 200 `generating` (error code 아님) — `PDF_NOT_READY` 는 **다운로드 URL 직접 요청 시**만 | `N7-24` |
| C7-6a | 🆕 상수 `REPORT_PDF_POLL_INTERVAL_MS = 2000` · `REPORT_PDF_POLL_TIMEOUT_MS = 60000` | Frontend 폴링 · Backend 생성 시간 요구 짝 | `N7-24` |
| **C7-7** | `POST /v1/reports/:reportId/viewed` 204 (기존) | 멱등 — 반복 호출 204 | — |
| **C7-8** | `GET /v1/highlight-clips/:clipId/playback-url` → `SignedMediaUrl` (기존) | 오류 `RECORDING_DELETED`(삭제 **및** 보관 만료 — `details.reason: 'deleted'|'expired'` 선택 필드) · `NOT_FOUND` | `N7-17` |
| **C7-9** | `NotificationKind` 변경 0 · deep link 경로 규약 | `report_published` → `/progress/reports/:reportId` · `report_deferred_encourage` · `report_delayed` → `/progress` | `N7-22` |
| **C7-10** | Error code 신규 **0** | 기존 `REPORT_NOT_ELIGIBLE` · `REPORT_NOT_READY`(`details.retryAfter?`) · `PDF_NOT_READY` · `RECORDING_DELETED` · `PROVIDER_UNAVAILABLE` | — |
| **C7-11** | (선택) 순수 함수 `reportCycleIndex(firstCycleStart: IsoDate, date: IsoDate)` | 날짜 문자열만 다루는 28일 주기 번호 — **Mock 과 향후 Backend 가 같은 산식**을 쓰도록. 화면은 호출하지 않는다 | `N7-14` |
| **C7-12** | 목록 API(`capability-snapshots` · `personas`) | 변경 0 — 호출 여부 `N7-08` | `N7-08` |
| — | 제거 후보 | `API_CONTRACTS` §6 `G-11` 이메일 필드 (`N7-06` ⓐ 시 "채택 안 함" 으로 Resolved) · `G-01` → C7-1 로 Resolved | — |

모든 schema 는 `z.infer` 파생 · Adapter 경계 parse · 날짜는 `IsoDate`(YYYY-MM-DD, 보호자 시간대 기준 — 서버가 계산) / `IsoDateTime`.

---

## 8. Mock Scenarios

**그룹 `progress`** (`mocks/progress/`)

| Key | 종류 | 동작 |
|---|---|---|
| `success` · `loading` · `error` · `retry` · `offline` | 공통 | weekly |
| `empty` | 공통 | 이번 주 세션 0 — `sessionsCount 0` · `days` 전부 `null` · `momentOfWeek null` · `availableWeeks` 1개 |
| 🆕 `progress-first-week` | 경계 | 가입 첫 주 — `availableWeeks` 1개(chip 비활성 여부 확인) |
| 🆕 `progress-multi-week` | 주 선택 | `availableWeeks` 4개 — 이전 주 선택 시 다른 fixture. **rev 2**: 달 넘김 1개(`Apr 27 – May 3`) · 연 넘김 1개(`Dec 29 – Jan 4`) 포함 (Spec §14) |

**그룹 `reports`** (`mocks/reports/`) — **상태 저장형 · 결정적**, eligibility 는 Mock 이 `isReportEligible` 로 계산

| Key | 동작 |
|---|---|
| `success` · `loading` · `error` · `retry` · `offline` | 공통 (overview · list · detail · viewed). **rev 2 (`C7-2a`)**: `success` overview = **Figma `110:835` 조합** — `latestReport` 1건(`Apr 13 – May 10`) + `currentCycle` = 다음 주기 `in_progress` · `progressRatio` 서버 값 · `nextReportDate` `Jun 7` · `reportCount 2` (카드 1 + 과거 목록 1). weekly fixture 와 함께 **Figma 와 같은 수치 1세트**(5 · 62m · 8/13/—/16/11/20/4 · strong/growing/emerging/emerging · Emma 인용 — Spec §13) |
| `empty` | 리포트 0건 · 첫 주기 진행 중(`insufficient_both`) |
| `report-eligible` | 현재 주기 eligible(`generating`) + 발행 리포트 **2건**(아카이브 확인). **rev 2 (`N7-35` ⓐ)**: 카드는 이전 리포트를 담지 않으므로 과거 목록 = **2건 전부** |
| `report-not-eligible` | 경계 fixture 4종을 **서브키 없이 순환하지 않고** 고정 1종(3599초·3세션 = `insufficient_recorded_minutes`) + 단위 테스트가 4종 전부 검증(3599/3600 × 2/3 · `excluded_low_quality` 1건 제외 시 3→2) |
| `report-deferred` | 이전 주기 `deferred` → 현재 주기 진행 중 · 이월 안내. **rev 2**: `currentCycle.status = deferred`(C7-2a ④) + **발행 리포트 1건**(`reportCount 1`) — 카드에 이전 리포트·PDF 없음 · 과거 목록 1건(`N7-35` 완화 조건 `reportCount ≥ 1` 검증) |
| 🆕 `report-deferred-first` (rev 2) | 첫 주기가 이월 — `deferred` + `latestReport null` · `reportCount 0` → 과거 목록 미렌더 |
| `report-delayed` | `delayed` + detail `REPORT_NOT_READY` |
| 🆕 `report-published-unviewed` | `latestReport.viewed=false` → 상세 진입 시 `viewed` 1회 → `true` |
| 🆕 `report-persona-unchanged` | `personaHistory` 1개 (변화 없음 표시) |
| (rev 2) `success` detail | `personaHistory` 3개 — `trigger` 3값(`onboarding_survey` → `session_analysis` → `survey_update`)을 **각 1회** 담아 copy 3종 전부 노출 (C7-4b) · 이름 40자 · persona 220자 · `summaryLine` 긴 문장 1개(Spec §14) |
| 🆕 `report-no-previous` | 첫 리포트 — `capabilityChange.previous = null` (오버레이 없이 현재만) |

**그룹 `report-pdf`**

| Key | 동작 |
|---|---|
| `success` | POST → `queued` → GET `generating` 1회 → `ready` (가짜 PDF blob URL) |
| `pdf-generating` | `generating` 3회 후 `ready` |
| 🆕 `pdf-failed` | `failed` → 재시도 시 `ready` |
| 🆕 `pdf-timeout` | 상한 동안 `generating` 유지 → 지연 안내 |
| `share-cancelled` | FileSharePort Mock 이 `'cancelled'` — 오류 표시 0 · ready 유지 |
| 🆕 `share-unsupported` | `canShareFile=false` — 공유 버튼 대신 저장만 |

**그룹 `highlight-clips`**

| Key | 동작 |
|---|---|
| `success` | signed URL → Mock 이 런타임 생성한 **WAV blob**(합성 톤 12초) |
| `clip-expired` | 1개 클립 `expiresAt` 과거 + playback `RECORDING_DELETED{reason:'expired'}` |
| `recording-deleted` | playback `RECORDING_DELETED{reason:'deleted'}` |
| 🆕 `clip-url-expired` | 첫 URL 이 즉시 만료(재생 실패) → 재발급 1회 후 성공 |
| `error` · `offline` | 재시도 가능 오류 |

- 가짜 PDF: Mock 이 최소 유효 PDF 바이트(1쪽, "HARU sample report — mock" 텍스트)를 런타임 생성 → `Blob('application/pdf')`. 파일 에셋 커밋 금지 · Production 번들 0 (`assert:no-mocks`).
- 모든 fixture: 영어 · 진단·판정·비교 표현 0 (`+18%`·`of 7` 류 0 — `N7-03`) · 페르소나 긍정형 · `Emma`.
- **rev 2 — 상태 저장형 발행 전이 (C7-2a ②)**: `reports` Mock 이 `generating → published` 를 재현할 때(테스트 helper 또는 시나리오 seed) overview 는 **`latestReport` = 새 리포트 · `currentCycle` = 다음 주기 `in_progress`** 로 바뀌고 `reportCount` +1 · list 맨 앞에 추가된다 (AC-7-82). 시나리오 key 추가 0 — 단위 테스트에서 Mock 상태 API 로 검증.

---

## 9. Frontend Scope (route / page / feature — 상세 UI 는 design-agent)

| Route | Page | 내용 | Figma |
|---|---|---|---|
| `/progress` (탭) | `ProgressPage` | 제목 + 주 선택 chip · 캐릭터 · StatTile 2 · This week's reading · Growth themes · Moment of the week · **4주 리포트 카드**(rev 2: `latestReport` × `currentCycle.status` 조합 — Spec §2.2 분기표) · 과거 리포트 목록(카드 아래, `N7-11` ⓐ · `N7-35` 조건) | `31:102` + `110:835` |
| `/progress` 주 선택 | 시트 (페이지 아님) | `availableWeeks` 목록 | C-13 `C13-S7-6` |
| `/progress/reports/:reportId` | `ReportDetailPage` (stack, back) | 섹션 7개 + PDF 액션 · 상태(Loading · Error · Not ready · Not found) | C-13 `C13-S7-1` |
| ~~`/progress/reports` (`N7-11` ⓑ 시만)~~ | — | **rev 2: 만들지 않는다** — `N7-11` ⓐ 채택(`D7-4`), 과거 목록은 `/progress` 안 | C-13 `C13-S7-5` |

- Guard: 온보딩 완료 필요(기존 탭 guard 그대로). deep link 미인증 → 로그인 후 원래 경로 복귀(Stage 5 선례).
- `/progress/reports/:reportId` 의 Back 목적지(앱 내 기록 없음 = deep link 진입) → `/progress` (`VG6-D-12` 앱 전체 결정 전 임시 규칙, `N7-23`).

---

## 10. Backend Integration Requirements (Contract 로 표현되는 기대 동작 — 구현 아님)

| ID | 요구 | Handoff 문서 | QA 예상 |
|---|---|---|---|
| `P7-BIP-01` | 주간 집계(`WeeklyProgress`): 주 경계 = 보호자 시간대 월~일 · sessionsCount/minutes 대상 세션 규칙(`N7-12`) · `nightsWithSession` · `averageSessionMinutes` · `availableWeeks` 범위(첫 세션 주 ~ 이번 주) · Home `sessionsThisWeek` 와 **같은 창·같은 값**(`D-6`) | BH · DR | PENDING |
| `P7-BIP-02` | Growth themes `stage`·`level` 산식 (스냅샷 기반 — `P6-BIP-01` 연계) · 라벨은 서열·결핍 표현 아님(§8.4) | AP | PENDING |
| `P7-BIP-03` | Moment of the week 선정 · 민감 발화 마스킹 · 안전 검증 통과 문장만 | AP | PENDING |
| `P7-BIP-04` | 주기: 첫 세션 완료일(`N7-12`) 기준 28일 반복 · 보호자 시간대 자정 경계(`N7-13`) · 주기 종료 후 평가 시점(`N7-14`) · `isReportEligible` 과 같은 기준(#17) · 저품질 제외 | AP · BH · DR | PENDING |
| `P7-BIP-05` | 미충족 → `deferred` + 다음 주기 이월 + 독려 push(`report_deferred_encourage`) | BH | PENDING |
| `P7-BIP-06` | 생성: narrative·근거 문장·페르소나 히스토리·대화 지표·부모 피드백 요약 · 안전 필터 + 금지어 + fallback · `ai_generation_logs` · 실패 시 재시도 3회 → 익일 · `delayed` + push | AP · BH | PENDING |
| `P7-BIP-07` | 발행 리포트 **불변** (`report_snapshots`) — 이후 녹음 삭제·재분석·이름 변경이 내용을 바꾸지 않음 · 단 클립 재생은 삭제·만료 시 `RECORDING_DELETED` | DR · BH | PENDING |
| `P7-BIP-08` | `progressRatio` 산식(두 기준의 결합 — 권고: `min(초/3600, 세션/3)` 상한 1) · `nextReportDate` | BH | PENDING |
| `P7-BIP-09` | PDF: 서버 렌더 · `report_pdfs` · private bucket · 짧은 만료 signed URL · `fileName` · 생성 시간 ≤ 60초(폴링 상한과 짝) · 같은 리포트 재요청 멱등 | BH · DR | PENDING |
| `P7-BIP-10` | 클립 재생: private Storage · 만료 signed URL · 보관 기간(`OAQ-13`) · 삭제 cascade(`DATA_MODEL` §12.2) | BH · DR | PENDING (`P5-BIP-14` 승계) |
| `P7-BIP-11` | `viewed` 최초 시각 기록 · 멱등 · 리포트 열람률 KPI | DR | PENDING |
| `P7-BIP-12` | push `report_published` 발송 · deep link payload = `reportId` 만 | BH | PENDING |
| `P7-BIP-13` | 전 endpoint 소유권(caregiver → child → report/clip) · RLS · 전체 삭제 대상 | AR · DR | PENDING |
| `P7-BIP-14` (Stage 6 이월, `QA-6-001`·H6-8.4) | **서버가 새로 만드는 문장**(완료 버블 `completionBubble` · `characterLine` · 리포트 발행 알림 문장)은 **생성 시점의 현재 아이 이름**을 쓴다. 이미 발행된 리포트 스냅샷은 `N7-16` 대로 동결 | BH · AP | PENDING |
| `P7-BIP-15` (rev 2, `M7-6`) | `ReportOverview` 의미(C7-2a): `latestReport` 와 `currentCycle` 독립 · **발행 직후 `currentCycle` = 다음 주기 `in_progress`** · `currentCycle.status = published` 미반환 · `deferred` = 이월되어 합쳐진 현재 주기(`progressRatio`·`nextReportDate` 그 주기 기준) · `reportCount` = 발행 리포트 수 | BH · DR | PENDING |
| `P7-BIP-16` (rev 2, `M7-5`) | `personaHistory[].trigger` = 그 페르소나를 만든 역량 스냅샷의 `source` (`CapabilitySnapshotSource` 3값) — 발행 시점 스냅샷에 동결 | BH · DR | PENDING |

→ **16건** (rev 2: +2). Stage 8 `BACKEND_HANDOFF.md` 등 1:1 반영 대상.

---

## 11. Acceptance Criteria

표기: **PENDING** = `BACKEND_INTEGRATION_PENDING` 예상 · 결정 의존 AC 는 결정 ID 를 적는다 (결정 결과에 따라 문구 개정).

### 11.1 Scope · Gate

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-01 | `apps/api/` · `supabase/` · `apps/mobile/` 부재, Backend 런타임 코드 0 | Scope | 파일 목록 | — |
| AC-7-02 | Out of Scope 미구현: 이메일 문구·필드 · `110:522` 달력/주별 분/통계 3칸(`N7-02` ⓐ 시) · 업그레이드 안내 · 데이터 관리 · 세션 목록 화면(`N7-09` ⓐ 시) | §3 | grep · router | — |
| AC-7-03 | `/progress` 준비 안내(`progressCopy.empty`) 제거 · `D-2` 화면 대체 | §2 | grep · e2e | — |

### 11.2 Contracts

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-04 | `WeeklyProgress` parse — `days` 정확히 7 · `growthThemes` 4역량 각 1개 · `level` 0..1 · `momentOfWeek` nullable · key 누락 거부 | C7-1 | 단위 | — |
| AC-7-05 | `GrowthThemeStage` 3값 · 미정의 값 거부 | C7-1a | 단위 | — |
| AC-7-06 | `ReportOverview` — `progressRatio` 0..1 · `latestReport` nullable · eligibility·status enum | C7-2 | 단위 | — |
| AC-7-07 | `ReportSummary` · `Paginated<ReportSummary>` parse | C7-3 | 단위 | — |
| AC-7-08 | `ReportDetail` — `notableQuotes` 1..2 · `personaHistory` ≥1 · `previous` nullable · `highlightClips` 0..n · `checkTrends.key` ∈ `ReflectionCheckKey` · **rev 2**: `personaHistory[].trigger` ∈ `CapabilitySnapshotSource` 3값, 미정의 값·누락 거부 · 신규 enum 0 (같은 schema 재사용 — grep) | C7-4 · C7-4b | 단위 · grep | — |
| AC-7-09 | `ReportPdfStatus` — `ready` 인데 url/expiresAt/fileName 없으면 거부 · 그 외 상태는 null 허용 | C7-6 | 단위 | — |
| AC-7-10 | `ReportHighlightClip` 이 Stage 5 `HighlightClipSummary` fixture 를 확장 필드와 함께 parse | C7-5 | 단위 | — |
| AC-7-11 | `isReportEligible` 경계 4종 + `excluded_low_quality` 제외 입력 테스트 유지 · (C7-11 채택 시) `reportCycleIndex` 28일 경계 단위 테스트 (27/28일 · 윤년) | #17 | 단위 | — |
| AC-7-12 | error code 신규 0 · 타입은 `z.infer` 만 · 앱 내 중복 타입 0 | 규칙 §5 | grep | — |
| AC-7-13 | `API_CONTRACTS.md` Rev 11 과 구현 contracts 일치 (`G-01`·`G-11` 상태 갱신 포함) | 규칙 §5 | 문서 대조 | — |

### 11.3 Mock

| AC | 내용 | 검증 | 예상 |
|---|---|---|---|
| AC-7-14 | Mock 4종(progress · reports · report-pdf · highlight-clips) 요청·응답 contracts parse — §8 전 key | 단위 | — |
| AC-7-15 | `report-not-eligible` 의 eligibility 가 Mock 내부 `isReportEligible` 결과와 일치 (fixture 하드코딩 금지) | 단위 | — |
| AC-7-16 | 상태 저장형: `viewed` 후 list·overview 의 `viewed=true` · PDF `ready` 후 재요청 = 같은 상태(멱등) | 단위 | — |
| AC-7-17 | 가짜 PDF 가 유효 PDF 시그니처(`%PDF-`)·`application/pdf` · 가짜 오디오가 디코드 가능한 WAV — 둘 다 런타임 생성, 저장소 바이너리 0 · Production 번들 0 | 단위 · `assert:no-mocks` | — |
| AC-7-18 | Mock fixture 를 Component/Page/Feature 에 하드코딩 0 | grep | — |
| AC-7-19 | 시나리오 전환 결정적 (같은 key → 같은 결과, StrictMode 이중 마운트 포함) | 단위 · e2e | — |

### 11.4 Progress 탭 (`31:102` + `110:835`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-20 | 레이아웃이 Figma `31:102` 실측(design-agent Spec 값)과 일치 — 제목 · chip · 캐릭터 · StatTile 2 · 주간 카드 · Growth themes · Moment · 탭바(Active=Progress) · **rev 2**: 시각 비교는 Figma 와 **같은 수치 fixture**(`success`)로 · 차이는 허용 차이 후보 `AD7-1`~`AD7-13` 지점에서만(주간 chevron 미렌더 = `AD7-12`, AC-7-24) | §6.1 · `N7-01` | Playwright 시각 + Figma 비교 | — |
| AC-7-21 | StatTile 값 = 응답 `sessionsCount` · `minutesTogether`(분 포맷) — Frontend 계산 0 | C7-1 | 단위 · e2e | — |
| AC-7-22 | 주간 막대 7개 = 응답 `days` · `null`·0 일은 "—" + 스텁(h4) · **rev 2 (`M7-3` → `N7-29` ⓐ)**: 높이 = `value / max(values) × 트랙` (최대값 막대 = 트랙 전체, 상한 클립 0) · 강조 = `value ≥ 0.75 × max`(가값 `P-40`) → Figma 수치 fixture(8·13·—·16·11·20·4)에서 **16·20 두 개** 강조 · 대체 텍스트 = list + 항목 이름(*"Monday, 8 minutes"* / *"Wednesday, no storytime"*) · `packages/ui` `BarChart` 는 분·요일을 모른다 | `31:102` · `N7-29` | 단위(높이·강조 계산) · e2e · a11y | — |
| AC-7-23 | 주간 카드 문구 = `N7-03` 결정 (권고: `+18% vs last week` 미표시 · `of 7` 분모 미표시) | `M-12` | grep · e2e | — |
| AC-7-24 | ~~주간 카드 접기 chevron 동작 (펼침/접힘 · `aria-expanded`)~~ → **rev 2 개정 (`M7-2` → `N7-41` ⓐ, `D7-5` 명시 승인)**: 주간 카드에 chevron 토글(`163:2561`)을 **렌더하지 않는다** — 버튼·아이콘·`aria-expanded`·접기 동작·`hidden` 토글 **0**, 포커스 순서에 토글 없음 · 막대 영역 항상 표시. Figma 대비 차이는 **허용 차이 후보 `AD7-12`** 로 Visual Gap 보고에 올리고 **사용자 승인 후** 등록 (최우선 규칙 6) | `31:102` · `N7-41` | e2e(DOM·포커스 순서) · grep(`aria-expanded` 0 in weekly card) · VG | — |
| AC-7-25 | Growth themes 4행 순서 Self-Direction → Emotion Regulation → Cognitive Flexibility → Intrinsic Motivation · 라벨 #14 · 막대 색 = `N7-10` · 단계 라벨 = `stage` · 숫자 미노출 | `163:2607` | 단위 · e2e · 시각 | — |
| AC-7-26 | Moment of the week = 서버 인용 그대로 · `null` 이면 카드 미렌더(또는 Spec 빈 상태) | `163:2633` | e2e | — |
| AC-7-27 | 주 선택 chip → 시트 → 이전 주 선택 → 해당 주 데이터 · 선택 가능 주 1개면 chip 비활성(Spec) | `N7-25` | e2e | — |
| AC-7-28 | `empty`(이번 주 0) 화면 = Spec 빈 상태 · 숫자 0 표시 규칙 = Spec | #22 | e2e | — |
| AC-7-29 | Loading(Skeleton) · Error(재시도) · Offline · Retry 성공 — 주간·리포트 카드 독립 | #22 | e2e | — |

### 11.5 4주 리포트 카드 (FR-16 게이팅 표시)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-30 | ~~상태별 카드 5종 배타 분기~~ → **rev 2 개정 (`M7-6`)**: 카드 = **`latestReport`(有/無) × `currentCycle.status`(5값) 조합 10칸**을 순수 분기 함수로 처리하고 **10칸 전부** 단위 테스트로 고정 — 발행有+`in_progress` = Figma `110:835`(기간 설명 · 막대 · PDF · footer · 헤더 링크) · 無+`in_progress` = 첫 주기 · `generating`(Spinner + 문구, 막대 숨김) · `deferred`(이월 문구 + 막대) · `delayed`(지연 문구, 막대 숨김) — 생성 중·이월·지연은 有/無 무관 같은 화면(이전 리포트 링크·PDF 0, `N7-35` ⓐ) · `published` 가 오면 `in_progress` 와 같게(C7-2a ③). 분기 입력 = 응답 값만 · eligibility 세부 사유 문구 0 | FR-16 · §13 · C7-2a | 단위(분기표 10칸) · e2e(시나리오별) | — |
| AC-7-31 | 진행도 = 응답 `progressRatio` 막대(`110:851`, h7 `T7-9`) · 분자/분모·퍼센트 텍스트 0 · 숫자 span `110:853` 미렌더(`AD7-4` 후보) · **rev 2 (`M7-11`)**: 막대는 **`aria-hidden`** — 카드 영역 접근성 트리에 `progressbar` role · `aria-valuenow` **0** (SR 이 % 를 읽지 않음) · 정보는 footer *Next report on* · 상태 문장이 전달. Growth themes 막대도 같은 조건(§5.7) | FR-16 · `N7-05` | e2e(접근성 트리 / `getByRole('progressbar')` 0) · grep | — |
| AC-7-32 | "Next report on {date}" = 응답 `nextReportDate` 포맷만 · 이메일 문구 없음(`N7-06`) | `110:861` | e2e · grep | — |
| AC-7-33 | ~~published 카드 탭 → 상세~~ → **rev 2 개정 (`M7-7` → `N7-37` ⓐ)**: `latestReport` 를 보여 주는 카드에서 **헤더 행(아이콘 + 텍스트)만 링크** → `/progress/reports/:latestReport.id` · 이름 *"Open 4-week report, {range}"* · 카드 셸 전체는 링크 아님 · 링크 안에 버튼 없음(**중첩 인터랙티브 0** — axe `nested-interactive` 0) · 시각 요소 추가 0(pressed opacity · focus ring 만) · 헤더 링크 hit ≥ 44 · 다른 상태(첫 주기·생성 중·이월·지연)에서는 링크 0 | FR-16 · `N7-37` | e2e · a11y 스캔 | — |
| AC-7-34 | 과거 리포트 목록(카드 아래 · `N7-11` ⓐ · route 없음) — **rev 2 (`N7-35` ⓐ)** 표시 조건: 카드가 `latestReport` 를 보여 주면 `reportCount ≥ 2` · 목록에서 그 리포트 **제외** / 카드가 보여 주지 않으면(생성 중·이월·지연) `reportCount ≥ 1` · 제외 0 · 0건 = 미렌더 · 행 탭 → 상세 · 미열람 배지 0 · `nextCursor` 있으면 *Show earlier reports* append | §6.1 · `N7-35` | e2e(`success` · `report-eligible` · `report-deferred` · `report-deferred-first` · `empty`) | — |
| AC-7-35 | 진행도·eligibility 경계가 #17 과 일치함을 **Mock+단위**로 보증 (3599/3600 · 2/3 · 저품질 제외) | #17 | 단위 | — |
| AC-7-36 | 실제 eligibility 판정 · 주기 계산 · 이월 · 독려 push | `P7-BIP-04`·`05` | — | **PENDING** |

### 11.6 리포트 상세 (`C13-S7-1`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-37 | 섹션 순서·구성 = Spec (역량 변화 · 페르소나 히스토리 · 대화 분석 · 인용 · 부모 피드백 요약 · 하이라이트 클립 · PDF) | §7.7 | e2e · 시각 | — |
| AC-7-38 | 다이아몬드 오버레이: `previous` 점선/반투명 레이어 + `current` · `previous=null` 이면 현재만 · 미관찰 축 규칙 = Stage 6 · 대체 텍스트에 변화 서술(숫자 없음 — `N7-15`) | FR-04 · `PF7-4` | 단위 · e2e · a11y | — |
| AC-7-39 | 역량별 근거 문장 = 서버 `evidence` 그대로 · `null` 행 미렌더 | §7.7 | e2e | — |
| AC-7-40 | 페르소나 히스토리 타임라인 = `personaHistory` 순서(정렬 0) · 1개면 "변화 없음" 표현(Spec) · `PersonaCard` 재사용(`eyebrow?`·`footnote?` 확장) · **rev 2 (`M7-5` → `N7-42`)**: 항목 출처 문구 = `trigger` 값으로 copy 3종 선택(*From your answers* · *From your updated answers* · *From your storytimes*) — `success` fixture 에서 3종 전부 노출 | FR-15 · §7.3 · C7-4b | 단위(매핑) · e2e | — |
| AC-7-41 | 대화 분석 지표 5종 + 최근 신호 = 응답 값 · 비교·순위·백분율 표현 0 | §7.7 · §8.4 | e2e · grep | — |
| AC-7-42 | 인용 1~2 = `NotableQuoteCard` (Progress 와 같은 컴포넌트) | §7.7 | e2e | — |
| AC-7-43 | 부모 피드백 요약 = `summaryText` · `checkTrends` 행 라벨 = Stage 5 회고 체크 copy(**rev 2: `entities/reflection` 으로 이동한 같은 모듈**, AC-7-75) · 메타 `{count}×`(SR *"{n} times"*) · `frequentTopics` · 세 블록 모두 비면 Spec 문구 | §7.7 · FR-12 · `N7-43` | e2e · `lint:boundaries` | — |
| AC-7-44 | 최초 표시 시 `viewed` 1회 (StrictMode·재진입·새로고침에도 세션당 1회 · 실패 무시·재시도 0) | §2.3 | 단위 · e2e(요청 로그) | — |
| AC-7-45 | `REPORT_NOT_READY` → 지연 안내 · `NOT_FOUND` → 오류 + Progress 복귀 · Loading · Offline | §13 · #22 | e2e | — |
| AC-7-46 | deep link `report_published` → 상세 · 미인증 → 로그인 후 복귀 · Back = `N7-23` | §7.7 | e2e | — |
| AC-7-47 | 리포트 문구 전부 응답 값 — Frontend 생성·가공 0 (포맷만) | `architecture.md` §8 | grep · 리뷰 | — |
| AC-7-48 | 실제 narrative·안전 검증·스냅샷 불변 | `P7-BIP-06`·`07` | — | **PENDING** |

### 11.7 하이라이트 클립 (FR-18)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-49 | 재생/일시정지 · 진행 표시 · 길이(`durationSeconds`) · 라벨 · 재생 탭 전 `playback-url` 미호출(`preload=none`) | FR-18 | 단위(상태 머신) · e2e | — |
| AC-7-50 | 동시 재생 1개 — 다른 클립 재생 시 이전 정지 | FR-18 | e2e | — |
| AC-7-51 | URL 만료(`clip-url-expired`) → 재발급 **1회** 후 재생 · 2회째 실패 → 오류 상태 | C7-8 | 단위 · e2e | — |
| AC-7-52 | `clip-expired` · `recording-deleted` → 불가 상태(재시도 없음) · 문구 = `N7-17` | FR-18 · `OAQ-13` | e2e | — |
| AC-7-53 | 이탈·탭 전환·로그아웃 시 정지 + `src` 제거 · URL 콘솔 출력 0 | §9 | e2e · grep | — |
| AC-7-54 | 키보드·스크린리더: 버튼 이름("Play clip: {label}") · 상태 변화 알림 · 44pt | NFR 접근성 | e2e · a11y | — |
| AC-7-55 | 실제 추출·보관·signed URL | `P7-BIP-10` | — | **PENDING** |

### 11.8 PDF (FR-17)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-7-56 | "Download PDF"(`110:854`, `Button md` — `N7-33`) → POST(IK) → 폴링(간격 C7-6a) → ready · 버튼 loading 상태 · **rev 2 (`M7-12` → `N7-40` ⓐ)**: ready 도달 시 **자동 저장 0**(`download` 이벤트 0) → *Save PDF* (+ 공유 가능 시 *Share*) 노출 → *Save PDF* 탭 시에만 저장(`download` 이벤트 1) · SR *"Your PDF is ready."* 1회 | FR-17 · `N7-40` | 단위(상태 머신 — ready 후 save 호출 0) · e2e(download 이벤트 계수) | — |
| AC-7-57 | 같은 리포트 재탭 = 같은 Idempotency-Key · 중복 POST 0 | FR-17 | 단위 · 요청 로그 | — |
| AC-7-58 | `pdf-failed` → 재시도 · `pdf-timeout` → 지연 안내(폴링 중단) · Offline | §13 | e2e | — |
| AC-7-59 | 공유: `canShareFile` true → *Save PDF* · *Share* 2버튼 · **save·share 모두** 탭 핸들러 안에서 `await` 선행 없이 호출(rev 2, `N7-40`) · `share-cancelled` = 오류 표시 0 · `NotAllowedError` = 저장 안내 문구 · `share-unsupported` = *Save PDF* 1개 | FR-17 · `N7-19` · `N7-40` | 단위(Port Mock) · e2e | — |
| AC-7-60 | blob URL `revokeObjectURL` · PDF/URL 영속 저장 0 · 파일명 로그 0 | §5.6 | 단위 · grep | — |
| AC-7-61 | 진입점 = `N7-24` (권고: Progress published 카드 + 상세 하단 둘 다, 같은 feature) | `110:854` | e2e | — |
| AC-7-62 | iOS Safari 실기기 공유 시트 · 저장 동작 | FR-17 | 수동 | **NOT VERIFIED 예상** (Chromium 만 자동) |
| AC-7-63 | 실제 PDF 렌더·signed URL | `P7-BIP-09` | — | **PENDING** |

### 11.9 Privacy · Copy · 접근성 · 아키텍처 · 회귀

| AC | 내용 | 검증 | 예상 |
|---|---|---|---|
| AC-7-64 | 콘솔·에러 로그에 아이 이름·인용·클립 URL·PDF 파일명 0 | grep · e2e console 수집 | — |
| AC-7-65 | 로그아웃 시 report/progress/clip 캐시 제거 · 재생 정지 | 단위 · e2e | — |
| AC-7-66 | copy 리뷰: 진단·판정·비교·달성률 표현 0 (`vs last week` · `% of` · `of 7` · `streak` grep 0 — `N7-03` 결과 반영) · copy 모듈 집중 | grep · 리뷰 | — |
| AC-7-67 | 대비 AA(가값·수용 예외 제외) · 포커스 · 터치 44 · 차트·플레이어 대체 텍스트 | a11y 스캔 | — |
| AC-7-68 | 스크린리더 실기기 확인 (VoiceOver) | 수동 | **NOT VERIFIED 예상** (Stage 8 재확인 후보) |
| AC-7-69 | 레이어 역방향·feature 간 import 0 · Page 에 API/로직 0 · Adapter 선택 1곳 | `lint:boundaries` | — |
| AC-7-70 | 임의 HEX·arbitrary·inline 수치 0 · 신규 토큰은 Spec `T7-1`~`T7-15` 만 · 가값 `P-35`~`P-40` 주석 · overflow 박스 그림자 inset(`R-SHADOW-1`) + 세로·가로 프로브 · **rev 2**: 새 `overflow` 선언 = 캐릭터 크롭 **1건**만(근거 주석) | grep · e2e | — |
| AC-7-71 | 반응형 320 / 393 / 600 / 1024 · 가로 스크롤 0 · 앱 컬럼 480 | e2e | — |
| AC-7-72 | baseline 규칙 `R-BASELINE-1` (settle · dev 패널 가림 · 재생성 전 분해) | 리뷰 · 로그 | — |
| AC-7-73 | 전체 게이트 6종 + `assert:no-mocks` + e2e 단독 실행 전부 통과 · 이전 Stage 회귀(Home `sessionsThisWeek` · 회고 연쇄 · 프로필) · **rev 2**: Stage 5 회고(copy 이동) · Stage 6 프로필(`PersonaCard`·`DiamondChart` 확장) baseline diff 0 — `--update-snapshots=all` + 원인 분해(`R-BASELINE-1` 3-1·5) | 실행 | — |
| AC-7-74 | `P7-BIP-01`~`16` (rev 2) 이 QA 리포트 PENDING 목록과 1:1 | 문서 대조 | — |

### 11.10 rev 2 신설 — Spec 정정 `M7-##` 검증 (AC-7-75~84)

| AC | 내용 | 요구사항 | 단위 | 검증 | 예상 |
|---|---|---|---|---|---|
| AC-7-75 | 회고 체크 라벨 copy 가 **`entities/reflection`** 에 있고 `features/reflection` · `features/report-detail` 이 그곳에서 import · `features/reflection/copy.ts` 에 체크 라벨 중복 정의 0 · feature 간 import 0 · Stage 5 회고 화면 문구·동작 e2e 와 시각 baseline **diff 0** | `M7-4` · `N7-43` | `S7-D` (선행) | `lint:boundaries` · grep · e2e · baseline | — |
| AC-7-76 | **발행有 + 다음 주기 진행 카드**(Figma `110:835`) — 설명 = `latestReport` 기간 + Figma 문구 · 막대 = **`currentCycle.progressRatio`**(다음 주기, 100% 고정 아님 — `N7-36` ⓐ) · PDF 대상 = `latestReport.id` · footer = `currentCycle.nextReportDate`(이메일 문구 0) · 헤더 링크 대상 = `latestReport.id` | `M7-6` · `N7-36` | `S7-C` | 단위 · e2e(`success`) | — |
| AC-7-77 | HTML import 카드 2장(`163:2551` 주간 · `110:835` 리포트)의 computed 값이 Spec §0.3 흡수표와 일치 — `box-shadow` = `--shadow-glass-rest` · bg = `--color-surface-card` · `backdrop-filter: blur(12px)` · radius 22 · 텍스트색 = 흡수된 semantic token · raw HEX 0 | `M7-1` · `R7-09` | `S7-C` | `getComputedStyle`(Tailwind 유틸리티 포함 — `R-FIGMA-1` ④) · grep | — |
| AC-7-78 | 캐릭터(`163:2642`) — 프레임 gradient fill **미렌더**(`N7-30` ⓐ, `AD7-5` 후보) · 투명 PNG 크롭(높이 146.15% · top −15.82%) · 393 에서 347×422 @ top 14 · 겹침 146 · `alt=""`·`aria-hidden` · 크롭용 `overflow: clip` 1건 근거 주석 | `M7-8` · `N7-27` · `N7-30` | `S7-C` | `getBoundingClientRect` · computed · 리뷰 | — |
| AC-7-79 | StatTile 행에 `overflow` 클립 **없음**(Figma 행 `overflow-clip` 미재현 — `AD7-11` 후보) · 타일 아래 그림자 번짐 10 이 잘리지 않음 | `M7-9` · `R-SHADOW-1` | `S7-B`(타일) · `S7-C`(행) | 세로·가로 픽셀 프로브 | — |
| AC-7-80 | Moment eyebrow 색 = `--color-fg-secondary`(ink-500 흡수 — `N7-32` ⓐ, `AD7-8` 후보) · 저장소 화면 코드에 `#6f8c88` 0 | `M7-10` | `S7-C` | computed · grep | — |
| AC-7-81 | Shared UI·Domain 확장의 **기본값 불변**: `DiamondChart`(`previous` 미지정) · `Surface`(`fill` 기존값) · `ProgressBar`(`--progress-fill-color` 미지정 · 장식 모드 미지정) · `ListRow`(`subtitle` 미지정) · `PersonaCard`(`eyebrow`·`footnote` 미지정) → DOM·렌더 변경 0 | Spec §3.7·§3.8·§3.9 | `S7-B` · `S7-D`(PersonaCard) | 단위(DOM 비교) · Stage 6 baseline diff 0 | — |
| AC-7-82 | `reports` Mock 상태 저장형 발행 전이(C7-2a ②): `generating → published` 후 overview = `latestReport` 새 리포트 · `currentCycle` 다음 주기 `in_progress` · `reportCount` +1 · list 맨 앞 추가 · 모든 응답 contracts parse | `M7-6` · C7-2a | `S7-A` | 단위 | — |
| AC-7-83 | `/progress` · 상세의 렌더 텍스트 font-size **≥ 11px** (Figma 10 · 10.5 · 11.5 → 11, 12.5 · 13(4행) → 12 — `N7-31` ⓐ, `AD7-7` 후보) · 신규 텍스트 크기 토큰 = Spec `T7-5`·`T7-6`·`T7-7` 만 | `N7-31` | `S7-B` · `S7-C` | computed 전수(e2e) | — |
| AC-7-84 | 단위별 Visual Gap 보고(§12.2)가 허용 차이 후보 `AD7-1`~`AD7-13` 중 해당분을 **지점·Figma 값·구현 값**으로 나열 · 사용자 승인 전 `stage-7-approvals.md` 에 허용 차이 **등록 0** (최우선 규칙 6) | CLAUDE.md 최우선 규칙 5·6 | 전 단위 | 문서 대조 | — |

---

## 12. 작업 단위 (한 단위 = development-agent 1회 호출)

| 단위 | 내용 | AC | 선행 결정 |
|---|---|---|---|
| **`S7-A`** Contracts + Mock | §7 C7-1~C7-12 + **C7-2a**(의미 — Mock 발행 전이) + **C7-4b**(`trigger` = `CapabilitySnapshotSource`) · API Client 4종 + Http 골격 · Mock 4그룹(§8 rev 2 key 포함 `report-deferred-first`) · Figma 동일 수치 fixture 1세트 · 가짜 PDF/WAV 생성기 · FileSharePort(Web+Mock) · `API_CONTRACTS` Rev 11 구현 반영(Rev 11.x) | 04~19 · 82 | ✅ `D7-1`~`D7-5` |
| **`S7-B`** Shared UI + 토큰 | `T7-1`~`T7-15` · 가값 `P-35`~`P-40` 주석 · `StatTile` · `BarChart`(비례 높이 + `emphasisRatio` 0.75 — `N7-29`) · `DiamondChart.previous` · `Surface fill="card"` · `ProgressBar` fill override(+ 장식 모드 여부 — §5.7) · `ListRow.subtitle?` · Icon registry(`file-down` · `arrow-down-to-line` · `share` · `play` · `pause` · `clock`) · gallery | 38(오버레이 렌더) · 22(높이·강조 계산 단위) · 67 · 70 · 79(타일) · 81 · 83(토큰) | ✅ |
| **`S7-C`** Progress 탭 | `/progress` 교체 · 캐릭터 · 주간 카드(**chevron 0** — `N7-41`) · Growth · Moment · 주 선택 시트 · **카드 분기 함수(10칸)** · 헤더 링크 · 과거 목록(`N7-35` 조건) · 빈/공통 상태 · `progress-copy` → feature copy 이동 | 03 · 20~36 · 76~80 · 83 | ✅ |
| **`S7-D`** 리포트 상세 | **① 회고 체크 copy → `entities/reflection` 이동(먼저, Stage 5 회귀 확인 후 진행)** ② `PersonaCard` `eyebrow?`·`footnote?` ③ route · 7섹션 · 페르소나 타임라인(`trigger` copy) · viewed 1회 · deep link · Not ready/Not found | 37~48 · 75 · 81(PersonaCard) | ✅ |
| **`S7-E`** 하이라이트 클립 | 플레이어 상태 머신 · 재발급 1회 · 만료/삭제 · 동시 재생 1 · 상세 ⑥ slot | 49~55 | ✅ |
| **`S7-F`** PDF | 상태 머신 · **ready 후 자동 저장 0 · Save/Share 탭 핸들러 호출**(`N7-40`) · 공유 · 진입점 2곳(카드 slot · 상세 ⑦) · 같은 query key | 56~63 | ✅ |

순서: `S7-A` → `S7-B` → `S7-C` → `S7-D` → `S7-E` → `S7-F` → (각 단위마다 design-agent Visual Gap — CLAUDE.md 최우선 규칙 5) → stage-qa-agent → Verdict STOP. **AC-7-01 · 02 · 64~74 · 84 는 전 단위 공통**(각 단위 handoff 에서 해당분 자기 점검, 최종 판정은 QA).

### 12.1 분할 제안 (`N7-26`)

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| **ⓐ 분할 안 함 (권고)** | 위 6단위를 Stage 7 하나로 진행 · C-13 전부 design-agent 명세(`N7-07` ②) | Stage 6 `D6-1` 선례 · Progress 카드와 상세가 같은 contract·같은 상태 분기를 공유해 한 QA 에서 일관 검증 · 디자이너 대기 없음 | 상세 화면이 나중에 Figma 로 오면 재작업 (`R7-01`) |
| ⓑ 7a / 7b | **7a** = Figma 있는 부분(`S7-A` 전체 · `S7-B` 일부 · `S7-C`) · **7b** = 상세 · 클립 · PDF(`S7-D`~`F`) — 디자이너 Figma 도착 후 | 최우선 규칙(Figma 우선)에 가장 충실 | FR-16 상세·FR-18(P0)이 디자이너 일정에 묶임 · Stage 8 진입 지연 · Progress 카드의 "열기"·"Download PDF" 가 7a 에서 목적지 없음 |

→ **`N7-07` = ② 이면 ⓐ, ① 이면 ⓑ 가 자연스럽다.** 권고 = ② + ⓐ. → **결정: ⓐ 분할 안 함** (`D7-3` · `D7-4`).

### 12.2 단위별 독립 구현·검증 가능성과 Visual Gap 대상 (rev 2)

각 단위는 **앞 단위가 끝난 상태 위에서** development-agent 1회로 구현되고, 그 단위의 AC 만으로 검증된다. 뒤 단위가 채울 자리(slot)는 **비워 둔 채** 검증하고, 빈 자리 때문에 생기는 Figma 차이는 그 자리를 채우는 단위의 Visual Gap 에서 닫는다.

| 단위 | 선행 단위 | 단독 검증 수단 | 뒤로 넘기는 것 (빈 자리) | Visual Gap 대상 (design-agent) |
|---|---|---|---|---|
| `S7-A` | — | contracts·Mock 단위 테스트만(화면 0) | — | **UI 영향 없음 확인**만 기록(`rules/workflow.md` §4) — fixture 수치가 Figma 와 같은지(Spec §13 비교 전제) |
| `S7-B` | A(타입 불필요 — 토큰만이면 A 와 병행 가능하나 순서 유지 권고) | `packages/ui` 단위 · dev gallery screenshot | — | `StatTile` · `BarChart`(Figma 수치로 16·20 강조, 20 = 트랙 전체) · `DiamondChart.previous`(가값 `P-38`) · Stage 6 프로필 baseline diff 0 · 토큰 값 = Spec §5.2 |
| `S7-C` | A · B | e2e `/progress` (Mock `progress`·`reports` 시나리오) · 카드 분기 단위 | 카드 **PDF 버튼 자리**(→ F) · 헤더 링크 **목적지 화면**(→ D, C 에서는 URL 이동만 검증) | **`31:102` ↔ 393×852 나란히**(같은 수치 fixture) · `110:835` 카드(PDF 버튼 제외) · computed(Glass Rest · surface-card · blur 12 · radius 22 · bubble · 간격 14 · 막대 16/110 · Moment border) · 캐릭터 bounding box · Glass Rest 그림자 세로·가로 프로브 320/393/600 · C-13 `C13-S7-2`·`5`·`6`·`8`·`9`(Progress 쪽) · 허용 차이 후보 `AD7-1`~`8`·`10`~`13` |
| `S7-D` | A · B (C 와 독립 — 직접 URL 진입으로 검증) | e2e `/progress/reports/:id` · viewed 요청 로그 · Stage 5 회고 회귀 | 상세 ⑥ **클립 slot**(→ E) · ⑦ **PDF slot**(→ F) | C-13 `C13-S7-1`·`7`·`9`(상세) — Spec 대비 섹션 순서·recipe(`ProfileCard`)·다이아몬드 범례 · Stage 5 회고 baseline diff 0(copy 이동) · Stage 6 `PersonaCard` baseline diff 0 |
| `S7-E` | A · B · D | 상태 머신 단위(`HTMLMediaElement` mock) · e2e 상세 ⑥ | — | C-13 `C13-S7-3` 플레이어 상태 6종(idle · loading · playing · paused · unavailable · error/offline) |
| `S7-F` | A · B · C · D | 상태 머신 단위(가짜 타이머) · e2e `download` 이벤트 계수 · Port Mock | — | C-13 `C13-S7-4` PDF 상태 7종 · **`110:835` 카드 재비교(PDF 버튼 포함 — `Button md` `AD7-9`)** · 상세 ⑦ |

- **`S7-D` 는 `S7-C` 와 독립**이다 — 상세는 직접 URL/deep link 로 진입·검증되므로 C 의 카드 링크가 없어도 된다. 순서는 유지(C 의 링크가 D 의 진입 e2e 를 하나 더 준다).
- **`S7-D` 의 copy 이동**은 기능 변화 0 리팩터이므로 같은 단위 안에서 **먼저** 하고 Stage 5 회귀(e2e + baseline)를 통과한 뒤 상세 구현으로 넘어간다 — 실패 시 상세 작업과 섞이지 않게.
- 회귀 baseline 은 각 단위에서 `--update-snapshots=all` 로 스테일을 드러낸 뒤 원인 분해(`R-BASELINE-1` 3-1·5).

---

## 13. Test Strategy

| 층 | 대상 |
|---|---|
| contract 단위 | §7 schema 전부 · refine(ready PDF) · 경계(#17) · (C7-11) 주기 함수 · rev 2: `personaHistory[].trigger` enum 거부 |
| Mock 단위 | 시나리오별 parse · 상태 저장 · 결정성 · 가짜 PDF/WAV 유효성 · rev 2: 발행 전이 후 overview 조합(C7-2a, AC-7-82) |
| feature 단위 | 리포트 카드 분기표 **10칸**(`latestReport` 有/無 × status 5 — rev 2) · 막대 높이·강조 계산(`N7-29`) · `trigger` → copy 매핑 · PDF ready 후 save 호출 0 · PDF 상태 머신(타이머 가짜) · 클립 재생 상태 머신(`HTMLMediaElement` mock) · viewed 1회 · FileSharePort Mock |
| e2e (Playwright, **단독 실행** — memory) | Progress · 주 선택 · 카드 조합 상태(rev 2) · 헤더 링크 · 과거 목록 조건 · 접근성 트리 `progressbar` 0(카드·Growth) · 주간 카드 토글 0 · 상세 · deep link · 클립 · PDF 저장(`download` 이벤트) · 공유(Port Mock) · 오프라인 · 로그아웃 정리 |
| 시각 | `31:102` 대응 화면 · 카드 상태 · 상세 섹션 · 플레이어 상태 — `R-BASELINE-1` |
| 수동 | iOS Safari 공유·저장 · VoiceOver (`AC-7-62`·`68`) |

---

## 14. Risks & Mitigations

| ID | 위험 | 완화 |
|---|---|---|
| `R7-01` | C-13 화면(상세·클립·PDF 상태)이 design-agent 명세로 만들어진 뒤 Figma 가 오면 재작업 (Stage 6 `R6-01` 과 같은 구조) | 명세를 기존 Figma 시각 언어(`163:2607` 카드 recipe · `110:835` 카드)로 제한 · 디자이너 요청서 병행(`N7-07`) |
| `R7-02` | Figma `31:102` 의 주간 지표가 PRD 에 없는 새 contract(`WeeklyProgress`)를 만든다 — Backend 범위 증가 | `P7-BIP-01` 명시 · Home `sessionsThisWeek` 와 같은 창(`D-6`)으로 산식 1개 |
| `R7-03` | `M-12` 표현(`+18%` · `6 of 7` · `strong`)이 진단·비교 금지 원칙과 충돌 — 지점별 결정 없이 구현하면 규칙 위반, 빼면 Figma 위반 | `N7-03` 지점별 결정 · AC-7-23·66 grep |
| `R7-04` | `navigator.share()` 는 사용자 제스처 안에서만 동작 — 생성 대기 후 자동 공유하면 `NotAllowedError` | ready 후 Blob 선수신 → 별도 "Share" 탭에서 즉시 호출 (§5.3) · 단위 테스트로 `await` 선행 금지 |
| `R7-05` | Web Share 파일 공유 지원이 제한적(Baseline 아님) — 데스크톱 Firefox 등 미지원 | `canShare` 분기 · 저장 경로 항상 제공 · `share-unsupported` 시나리오 |
| `R7-06` | 오디오 signed URL 만료·iOS 자동재생 정책 | 재생은 사용자 탭에서만 · 만료 재발급 1회 · iOS 실기기 확인은 수동 |
| `R7-07` | 발행 리포트 불변 vs 아이 이름 변경(Stage 6 `QA-6-001` 유형 재발) | `N7-16` 명시 결정 · `P7-BIP-14` |
| `R7-08` | 시간대 경계 미결로 Mock·서버 날짜 불일치 | Frontend 날짜 계산 0 · 서버 `IsoDate` 그대로 표시 (`N7-13`) |
| `R7-09` | `110:522` 는 변수 바인딩 0(HTML import) — `110:835` 실측값이 토큰과 어긋날 수 있음. **rev 2 (`M7-1`)**: `31:102` 의 `163:2551` 주간 카드도 같은 형식 | design-agent 가 `get_design_context` 로 선언값 조회 후 흡수 완료(Spec §0.3, 두 카드 공통) · AC-7-77 computed 검증 |
| `R7-10` | `163:2607` 역량 색이 #19 차트·Tag 색과 2색 다름 — 한 앱에 역량 색 2벌 | `N7-10` 결정 + 디자이너 확인 |
| `R7-11` | 그림자 클립 4번째 재발(카드가 많은 긴 스크롤) | `R-SHADOW-1` · 세로·가로 프로브 (AC-7-70) |
| `R7-12` (rev 2) | 카드를 배타 상태로 구현하면 Figma `110:835`(발행 + 다음 주기 진행)를 표현하지 못하거나, 두 리포트를 한 카드가 가리켜 PDF 대상이 모호해진다 (`M7-6`) | C7-2a 의미 고정 · 분기 순수 함수 10칸 테스트 · `N7-35` ⓐ (AC-7-30 · 76) |
| `R7-13` (rev 2) | 회고 copy 이동이 Stage 5 화면을 건드린다 (`M7-4`) | `S7-D` 첫 작업으로 분리 · Stage 5 e2e·baseline diff 0 확인 후 진행 (AC-7-75) |
| `R7-14` (rev 2) | Shared UI 확장 4건 + `PersonaCard` 확장이 Stage 6 화면을 바꾼다 | 기본값 불변 원칙 · 단위 DOM 비교 · baseline diff 0 (AC-7-81) |

---

## 15. Open Decisions

> **rev 2 — 결정 결과 (2026-11-19)**: 아래 §15.1 · §15.2 의 `PF7-*` · `N7-01`~`N7-28` 은 **전부 권고안으로 결정**되었다 (`D7-1` = `N7-01`·`02` · `D7-2` = `N7-03` · `D7-3` = `N7-07` · `D7-4` = 나머지 전부, `N7-09` 포함). Spec 결정 `N7-29`~`N7-50` 도 **전부 권고안**(`D7-5`) — 특히 `N7-29` ⓐ 비례 높이 + 0.75 강조 · `N7-30` ⓐ · `N7-31` ⓐ · `N7-32` ⓐ · `N7-33` ⓐ `Button md` · `N7-35` ⓐ · `N7-36` ⓐ · `N7-37` ⓐ · `N7-40` ⓐ · **`N7-41` ⓐ chevron 제거** · `N7-42` · `N7-43`. 아래 표의 `NEEDS DECISION` 라벨은 **이력 보존용**이며 현재 상태는 `CONFIRMED (D7-x)` 다. 남은 미결 = 허용 차이 `AD7-1`~`AD7-13` **등록**(구현·Visual Gap 후 사용자 승인) · 디자이너 요청 `Q7-1`~`Q7-17`(병행, 비차단) · `OAQ-13`(법무, 비차단).

### 15.1 PRD ↔ Figma 충돌 — **지점별 사용자 결정 대기** (CLAUDE.md: Figma 우선 + 지점별 승인)

| ID | 지점 | PRD | Figma | 권고 |
|---|---|---|---|---|
| **`PF7-1`** (`M-10`) | Progress 탭 주 내용 | §6.1 "다이아몬드 현황 · 4주 리포트 아카이브 · 페르소나 히스토리" (주간 지표 없음) | `31:102` 주간 관찰(StatTile · 막대 · Growth themes · Moment) | **Figma** → `N7-01` |
| **`PF7-2`** (`PF6-2`) | 다이아몬드 위치 | §6.1 Progress 에 다이아몬드 현황 | Progress 에 다이아몬드 없음 · Growth themes 4행 | **Figma** — 다이아몬드는 리포트 상세 오버레이 + 기존 `/settings/profile` → `N7-04` |
| **`PF7-3`** (`M-11`) | 리포트 이메일 | 없음 | `110:861` "we'll email it too" | **PRD** (문구 제외) → `N7-06` |
| **`PF7-4`** | 역량 스코어 수치 | §5.2·§7.7 "자기주도 2.5 → 2.9", "역량별 스코어 변화" | 리포트 상세 Figma 없음 · Stage 6 `D6-8` Q5 = 차트·텍스트 숫자 미노출 | **숫자 미노출 유지**(D6-8 일관) → `N7-15` |
| **`PF7-5`** | 페르소나 히스토리 위치 | §6.1 Progress 탭 | Progress 에 없음 | **리포트 상세 안** → `N7-08` |
| **`PF7-6`** (`M-12`) | 주간 비교·달성률 | §8.4 비교 금지 (또래 비교) · `rules/frontend.md` §8 비교·판정 금지 | `+18% vs last week` · `6 of 7 nights` · `strong/growing/emerging` | 지점별 → `N7-03` |
| **`PF7-7`** | 미충족 진행도 표기 | §7.7·PLANNING "진행도(녹음 분·세션 수)" | `110:851` ProgressBar 1개 (숫자 span `110:853` 있음) | ProgressBar + 숫자 미노출 → `N7-05` |

### 15.2 결정 목록 `N7-xx`

**⛔ 차단 (design-agent 착수 또는 `S7-A` 전)**

| ID | 차단 대상 | 질문 | 선택지 | 권고 | 라벨 |
|---|---|---|---|---|---|
| **`N7-01`** | design · `S7-A` | Progress 탭 IA (`M-10` · `PF7-1`) | ⓐ **Figma `31:102` 주간 관찰을 탭 본문으로** + 아래 4주 리포트 카드(`110:835`) — 주간 contract 신설(C7-1) ⓑ PRD 대로 다이아몬드·아카이브·페르소나 히스토리 (Figma 무시 — 최우선 규칙 1 위반) ⓒ 주간 지표 없이 `31:102` 의 Growth themes·Moment 만 | **ⓐ** — 최우선 규칙 · `D-6`("이번 주" 창 = `/progress` 와 동일)이 이미 주간 창을 전제 · PRD §6.1 은 수정 대상 기록 | NEEDS DECISION |
| **`N7-02`** | design | `110:522` 확장안(월 달력 · Minutes per week · longest streak · % of nights read · avg session)을 채택하는가 | ⓐ **미채택** — `31:102` 기준, `110:522` 에서는 4주 리포트 카드(`110:835`)만 가져온다 ⓑ 전부 채택 ⓒ 달력만 | **ⓐ** — `110:522` 는 HTML import 탐색안(변수 0 · 옛 탭바 · `M-13` 위반 라벨) · streak 는 `D-6`·`G-02` 로 이미 기각 · `%` 는 달성률 언어 · 리포트 카드는 Figma 유일 근거라 채택 | NEEDS DECISION |
| **`N7-03`** | design · copy | `M-12` 지점별 표현 (`PF7-6`) | ① `+18% vs last week` — ⓐ **미표시** ⓑ 그대로 ② `6 of 7 nights · avg 12 min` — ⓐ **`6 nights · avg 12 min`**(분모 제거) ⓑ 그대로 ⓒ 줄 전체 미표시 ③ `strong / growing / emerging` — ⓐ **그대로**(셋 다 긍정·발달 언어, 결핍어 없음, 숫자 아님) ⓑ 라벨 제거·막대만 | **①ⓐ ②ⓐ ③ⓐ** — 비교·달성률은 빼고, 관찰 수치와 성장 단계 라벨은 유지. ①·②는 Figma 텍스트를 바꾸므로 **허용 차이 등록 대상**(승인 후) | NEEDS DECISION |
| **`N7-04`** | design · `S7-A` | 다이아몬드 위치 (`PF7-2`) | ⓐ **Progress 에 추가하지 않음** — 리포트 상세 오버레이만 · `ReportOverview.latestSnapshot` 제거 ⓑ Progress 상단에 추가(Figma 에 없는 요소) | **ⓐ** | NEEDS DECISION |
| **`N7-05`** | design · `S7-A` | 미충족 진행도 표기 (`PF7-7`) | ⓐ **ProgressBar(`progressRatio` 서버 값) + "Next report on {date}" — 분자/분모 숫자 없음** ⓑ "2 of 3 sessions · 40 of 60 min" ⓒ 막대 없이 안내 문장만 | **ⓐ** — `D-2` 달성률 언어 회피 원칙 유지 + Figma `110:851` 막대 사용 · 숫자 span `110:853` 은 미사용(허용 차이 등록 대상) | NEEDS DECISION |
| **`N7-07`** | design | C-13 화면(§16) 소스 | ① 디자이너 Figma 요청 ② **design-agent 명세** (화면별) | **전부 ②** (Stage 6 `D6-2` 선례) + 디자이너 요청서 병행 · 공통 상태(`C13-S7-9`)는 #22 로 명세 확정 | NEEDS DECISION (C-13 — 화면별 사용자 선택) |
| **`N7-15`** | design · `S7-A` | 리포트 역량 변화의 숫자 (`PF7-4`) | ⓐ **숫자 미노출** — 오버레이 형상 + 서버 근거 문장 ⓑ "2.5 → 2.9" 표시 ⓒ 화살표·증감 아이콘만 | **ⓐ** — `D6-8` Q5 와 일관 · "점수"로 읽힘 방지. PRD §5.2·§7.7 수정 대상 기록 | NEEDS DECISION |
| **`N7-19`** | `S7-A` | PDF 공유 구현 방식 | ⓐ **`FileSharePort`**(Web Share API + 저장 fallback, 네이티브 교체 예정 경계) ⓑ 저장(다운로드)만 — 공유는 OS 에 맡김 ⓒ 링크 공유(서명 URL 노출 — 금지 권고) | **ⓐ** — FR-17 "공유" 충족 · Port 는 교체 예정 경계(`architecture.md` §1) · 신규 라이브러리 0 | RECOMMENDED |

**비차단 (권고안으로 착수, 체크포인트 확인)**

| ID | 질문 | 권고 | 라벨 |
|---|---|---|---|
| `N7-06` | 이메일 문구 (`PF7-3`) | **"we'll email it too" 제외** · 이메일 채널 미도입 · `G-11` 채택 안 함 — Figma 텍스트 변경이므로 허용 차이 등록 대상 | NEEDS DECISION |
| `N7-08` | 페르소나·역량 **히스토리** 위치 · 목록 API(`N6-12`) 호출 | 리포트 상세의 `personaHistory`(스냅샷)로만 표시 · 별도 히스토리 화면 없음 · `capability-snapshots`·`personas` 목록 API 는 **MVP Frontend 호출자 0 으로 Handoff 에 명시**(schema 유지) | RECOMMENDED |
| `N7-09` | `D4-40` 세션 목록 EmptyState (AC-4-23 화면 부분) | **Stage 8 로 재이월** — 세션 목록 화면은 FR-21 세션별 녹음 삭제(데이터 관리)와 같은 화면이며 Figma·PRD IA 에 Stage 7 자리가 없다. `D4-40` 갱신 필요 | NEEDS DECISION (기존 결정 변경) |
| `N7-10` | Growth themes 막대 색 (`N6-47`) | **Figma `163:2607` 선언값 그대로**(teal/pink/blue/violet-67 — 최우선 규칙 1) · 다이아몬드·Tag 는 #19 유지 · 두 벌 공존을 디자이너에게 확인 요청 | NEEDS DECISION |
| `N7-11` | 리포트 아카이브(과거 리포트) 진입 | 리포트 카드 아래 **"Past reports" 행 목록**(2건 이상일 때만, 같은 화면) — 별도 route 없음 · design-agent 명세 `C13-S7-5` | NEEDS DECISION (C-13) |
| `N7-12` | #17 잔여 ① 대화 전용 세션이 **주기 시작일**에 포함되는가 · 주간 sessions/minutes 집계에 포함되는가 | 주기 시작 = **첫 완료 세션(모드 무관)** — #17 문언 그대로 · 주간 `sessionsCount` 도 모드 무관(Home `sessionsThisWeek` 와 동일) · 발행 기준 집계는 기존대로 recorded 만 | NEEDS DECISION (Frontend 비차단 — 서버 값 표시) |
| `N7-13` | #17 잔여 ② 시간대 경계 | **보호자 시간대(IANA) 자정** · 주 = 월~일(Figma 요일 라벨 M→S) · Frontend 는 날짜 계산 0 · 시간대 전달 방식(요청 헤더 vs 계정 설정)은 Backend 요구로 기록 | RECOMMENDED |
| `N7-14` | #17 잔여 ③ `cycle_in_progress` 판정 시점 | 주기 마지막 날 자정 이후 평가 → 그 전에는 `cycle_in_progress` · 공유 순수 함수 `reportCycleIndex`(C7-11) 추가 | RECOMMENDED |
| `N7-16` | 발행 리포트의 아이 이름 | **발행 시점 동결**(`childDisplayName` 스냅샷 — 리포트·PDF 재현성) · 새로 만드는 서버 문장은 현재 이름(`P7-BIP-14`) | RECOMMENDED |
| `N7-17` | 클립 만료·삭제 표시 | 만료일 **표시 안 함**(`OAQ-13` 미결) · 만료·삭제 모두 "This clip is no longer available." 류 1문구 · `RECORDING_DELETED` + `details.reason` | RECOMMENDED |
| `N7-18` | 클립 라벨 출처 | 서버 `label`(짧은 캡션, 예 "Talking about feelings") — 인용 원문 노출 아님 · Frontend 생성 0 | RECOMMENDED |
| `N7-20` | Mock 오디오 | 런타임 합성 WAV(톤/무음 12초) · 바이너리 커밋 0 · 실제 음성 0 | RECOMMENDED |
| `N7-21` | 주간 막대 차트 구현 | `packages/ui` 범용 `BarChart`(inline SVG 또는 div 막대 — #9 inline SVG 원칙) · 라이브러리 추가 0 | RECOMMENDED |
| `N7-22` | 알림 deep link 경로 | `report_published` → 상세 · `report_deferred_encourage`·`report_delayed` → `/progress` | RECOMMENDED |
| `N7-23` | deep link 진입 시 상세 Back 목적지 (`VG6-D-12` 앱 전체 미결) | `/progress` (탭 루트) — Stage 8 앱 전체 결정 시 같이 정리 | RECOMMENDED |
| `N7-24` | PDF 진입점 · 폴링 상수 | Progress published 카드(`110:854`) **와** 상세 하단 둘 다 · 2초 간격 / 60초 상한 | RECOMMENDED |
| `N7-25` | 주 선택 chip(`31:118`) 동작 | 시트로 `availableWeeks` 목록(최신 먼저) · 1개면 비활성 · design-agent 명세 `C13-S7-6` | NEEDS DECISION (C-13) |
| `N7-26` | Stage 분할 | **분할 안 함** (§12.1 ⓐ) — `N7-07` = ② 전제 | NEEDS DECISION |
| `N7-27` | 캐릭터 일러스트(`163:2642` bookworm) 에셋 | 기존 Figma 에셋 export(`163:2536`·`163:2543`) 사용 — 해상도 부족 시 `D-13` 선례(허용 차이) | RECOMMENDED |
| `N7-28` | Stage 6 이월 비차단 미결(`VG6-H-09` A/B/C · `VG6-H-06` `Text tracking` prop · `VG6-D-12` · `v2-material`) | Stage 7 범위에 넣지 않음 — Stage 8 Final QA 전 일괄 질의 유지 (`VG6-D-12` 만 `N7-23` 으로 임시 규칙) | RECOMMENDED |

### 15.3 기존 미결의 변화

| 항목 | 변화 |
|---|---|
| `M-10` · `M-11` · `M-12` | `N7-01` · `N7-06` · `N7-03` 결정 시 **Resolved** |
| `PF6-2` · `N6-47` | `N7-04` · `N7-10` 결정 시 해소 |
| `G-01` · `G-11` | C7-1 로 Resolved / 채택 안 함 |
| #17 잔여 | `N7-12`~`N7-14` |
| `N6-12` | `N7-08` |
| `D4-40` | `N7-09` (변경 시 `stage-4-approvals.md` 에 새 결정 기록) |
| `OAQ-13` | 여전히 법무 대기 — Stage 7 비차단 (`N7-17`) |
| Stage 6 QA §11.7 메모(현재 아이 이름) | `P7-BIP-14` 로 등록 — 1:1 추적 |

### 15.4 PRD 수정 대상 후보 (지금 고치지 않는다 — `D-24` 절차는 사용자 지시 시)

| # | 위치 | 내용 | 근거 |
|---|---|---|---|
| S7-1 | §6.1 IA 표 리포트 행 · §6.2 리포트 | Progress = 이번 주 관찰 + 4주 리포트 카드·아카이브 · 다이아몬드·페르소나 히스토리는 리포트 상세 | `N7-01` · `N7-04` · `N7-08` |
| S7-2 | §5.2 시나리오 12 · §7.7 역량 변화 | "2.5 → 2.9" 수치 → 형상·근거 문장 | `N7-15` |
| S7-3 | §7.7 발행 기준 | 주기 시작·시간대 규칙 (#17 잔여) | `N7-12`~`14` |
| S7-4 | §7.7 · §6.1 | 주간 관찰(Weekly) 개념 추가 | `N7-01` |

---

## 16. C-13 대상 — Figma 에 없는 화면 (화면별 ① 디자이너 요청 ② design-agent 명세 — `N7-07`)

| ID | 화면 / 상태 | 근거 | Figma 부분 근거 | 권고 |
|---|---|---|---|---|
| `C13-S7-1` | 리포트 상세 `/progress/reports/:reportId` (7섹션) | FR-16 · §7.7 | 없음 (카드 recipe `163:2607` · 인용 `163:2633` · 버튼 `110:854` 재사용) | ② |
| `C13-S7-2` | 4주 리포트 카드 — 진행 중(미충족) · 생성 중 · 이월 · 지연 상태 | FR-16 · §13 | `110:835` = 발행됨 1상태 + 막대 | ② |
| `C13-S7-3` | 하이라이트 클립 플레이어 (재생 · 일시정지 · 로딩 · 불가 · 오류) | FR-18 | 없음 | ② |
| `C13-S7-4` | PDF 상태 (생성 중 · 준비됨 + 저장/공유 · 실패 · 지연) | FR-17 | `110:854` 버튼만 | ② |
| `C13-S7-5` | 과거 리포트 목록 (`N7-11`) | §6.1 아카이브 | 없음 | ② |
| `C13-S7-6` | 주 선택 시트 (`N7-25`) | `31:118` chip | chip 만 | ② |
| `C13-S7-7` | 페르소나 히스토리 타임라인 (상세 섹션) | FR-15 · §7.3 | 없음 (`PersonaCard` Stage 6 명세) | ② |
| `C13-S7-8` | Progress 빈 상태 (이번 주 0 · 리포트 0) | #22 | 없음 | ② |
| `C13-S7-9` | 공통 상태 (Loading · Error · Offline · Not found) — Progress · 상세 | #22 (명세 우선) | 없음 | ② (#22 확정) |

→ **9건** (Figma 있는 화면: `/progress` 본문 1 = `31:102` + `110:835` 카드 발행 상태).

---

## 17. Handoff to design-agent

> **rev 2**: 이 Handoff 는 `docs/design/stage-7-design-spec.md`(APPROVED 2026-11-19)로 **완료**되었다. 항목 1 의 *"접기 chevron 상태"* 는 `N7-41` ⓐ 로 **제거**가 결정되었다. 이후 design-agent 의 일은 §12.2 단위별 **Visual Gap 검토**다.

1. `31:102` 전 블록 실측(`get_design_context` · `get_variable_defs` — 렌더 PNG 샘플링 금지, `R-FIGMA-1`) · 캐릭터와 StatTile 겹침 · 탭바 하단 여백 · 접기 chevron 상태.
2. `110:835` 카드 실측 — **변수 바인딩 0** 이므로 raw 값 → 기존 토큰 흡수표 · 아이콘(`110:838`) 정체 확인.
3. `N7-03`·`N7-05`·`N7-06` 결정에 따른 텍스트 변경 지점을 **허용 차이 후보**로 목록화(등록은 사용자 승인 후).
4. Growth themes 막대 색 `N7-10` · 단계 라벨 대비(AA) · `glass-fill-strong` + 인스턴스 그림자 겹 수(`V-10` · `--shadow-bubble` 선례).
5. C-13 9건 명세 (§16) — 카드 recipe 는 `163:2607` · 인용 `163:2633` · 버튼 `110:854` 시각 언어로 제한.
6. `DiamondChart` previous 레이어 시각(점선/반투명) · 대체 텍스트 문장 규칙(숫자 없음).
7. `StatTile` · 막대 차트 · 플레이어 Shared/Domain 분류 · 신규 토큰 · 가값(다음 번호 `P-35`).
8. 긴 스크롤 화면의 overflow·그림자 inset (`R-SHADOW-1`) · 반응형 4폭.
9. 디자이너 요청서 초안 (C-13 9건 + `N7-10` 색 두 벌 + `M-10` 수치 placeholder 불일치).

---

## 18. Frontend 단계에서 검증 불가 → `BACKEND_INTEGRATION_PENDING` 예상 요약

AC-7-36 · 48 · 55 · 63 (+ `P7-BIP-01`~`16` 전체 — rev 2 +2: `P7-BIP-15` overview 의미 · `16` persona trigger). rev 2 신설 AC-7-75~84 는 전부 Frontend 검증 가능(PENDING 0). Frontend 부분(UX · Contract 호출 · Mock 시나리오)은 각 절 AC 로 별도 판정.
NOT VERIFIED 예상: AC-7-62 (iOS 공유·저장 실기기) · AC-7-68 (VoiceOver).

---

## 19. 승인 체크포인트 결정 목록

### 19.1 design 착수 전 필요 (⛔)

`N7-01` · `N7-02` · `N7-03` · `N7-04` · `N7-05` · `N7-07`(C-13 화면별 소스) · `N7-15` — 전부 PRD↔Figma 지점 또는 C-13 이라 **사용자만** 결정할 수 있다.

### 19.2 `S7-A` 전 필요

위 + `N7-19`.

### 19.3 비차단 (권고안으로 착수, 체크포인트 확인)

`N7-06` · `N7-08` · `N7-09` · `N7-10` · `N7-11` · `N7-12`~`N7-14` · `N7-16`~`N7-18` · `N7-20`~`N7-28`.

### 19.4 승인 체크포인트 (Design Spec 작성 후)

Orchestrator 가 이 Plan + `docs/design/stage-7-design-spec.md` 를 요약 보고하고 멈춘다. 승인 후 이 문서 `Status` 를 `APPROVED (YYYY-MM-DD, user)` 로 갱신한다.

### 19.5 승인 후 plan-agent 후속

> **rev 2 진행 상황**: `API_CONTRACTS.md` **Rev 11** 설계 반영 ✅ (2026-11-19) · `docs/decisions/stage-7-approvals.md` 신설 ✅ (Orchestrator) · `PLANNING.md` Stage 7 절 · `FIGMA_SCREEN_MAP` `M-10`·`M-11`·`M-12` Resolved 표기 · `D4-40` 재이월(`N7-09`) 기록 · `COMPONENT_MAP.md` 정정(Spec §4) = **미수행**(이번 지시 범위 밖 — 별도 지시 시).

`PLANNING.md` Stage 7 절(Exit · Mock · Blocking) 갱신 · `API_CONTRACTS.md` Rev 11 설계 반영 · `FIGMA_SCREEN_MAP` `M-10`·`M-11`·`M-12` Resolved 표기 · `D4-40` 변경 시 기록 · `docs/decisions/stage-7-approvals.md` 신설.
