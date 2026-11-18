# Stage 6 Plan — Personalization + Profile Update + Recommendation Loop (Frontend)

Status: **APPROVED (2026-11-15, user)** — `D6-8` *"전부 권고안대로 승인"* (`docs/decisions/stage-6-approvals.md`). 이전: **DRAFT — 개정 1** (2026-11-14, plan-agent) — design 착수 조건 결정 `D6-1`~`D6-3`(`docs/decisions/stage-6-approvals.md`) 반영. **`D6-*` 는 Plan 승인이 아니다** — 승인 체크포인트는 Design Spec 작성 후(§19). 초판: 사용자 지시 *"커밋하고 Stage 6 진행해줘"* (2026-11-14) 로 워크플로 1단계 착수 (`rules/workflow.md` §3).
Based on:
- PRD **v1.5 개정 3 + 보완** (`docs/source/HARU_PRD_v1.5.md`) — §5.1 ③④ · §6.1 IA 표 · §6.2 화면 맵 · **§7.3** · §7.6 셋째 줄 · **§7.8** · **§8.3** · §8.4 · FR-04·05·**06**·**07**·**15** · §12.1 CapabilityScore
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — **이 세션에서 라이브 조회** (§0.1). page `16:2` · `8:2` · `125:765` · `66:202` · `0:1`
- `PLANNING.md` "### Stage 6" 초안 · `docs/API_CONTRACTS.md` §4 Stage 2 표·"설정 진입점" 표·Stage 6 절 · `docs/DATA_MODEL.md` §10 · `docs/FIGMA_SCREEN_MAP.md` (`/onboarding/profile` · 프로필 업데이트 표시 · `/settings/*` 행) · `docs/COMPONENT_MAP.md` (`SettingsMenu` · `ChildProfileEditor`)
- 결정 기록 `stage-0-approvals.md` (C-13 · C-15 · **C-16** · C-19 · #22) · **`stage-2-approvals.md` §3 (Stage 2-B 분리) · D-2 · D-6 · D-C** · `stage-3-approvals.md` (D-5 · **D-18** · D-20 · D-22) · `stage-5-approvals.md` (`D5-4`) · `docs/qa/stage-5-qa-report.md` (`QA-5-005` · `OBS-5-5` · `OBS-5-7`)
- 코드(읽기만): `packages/contracts/src/children/*` · `onboarding/*` · `activity/option.ts` · `home/summary.ts` · `apps/web/src/features/settings/*` · `app/router.tsx` · `shared/api/*` · `mocks/*`

Author: plan-agent (2026-11-14)

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 초판 | 2026-11-14 | Stage 6 범위 · Figma 조회 결과(관련 화면 **0**) · Stage 2-B 의존 발견 · PF 3건 · C-13 6건 · 결정 `N6-01`~`N6-20` · AC-6-01~52 · 작업 단위 `S6-A`~`S6-F` |
| **개정 1** | 2026-11-14 | **`D6-1`** — 6a/6b 분할 **미채택**: Stage 2-B `C13-09` 프로필 결과 · `C13-10` 발전 역량 제시를 **design-agent 명세로 Stage 6 In Scope** 편입, FR-15 표시(`C13-S6-5`)는 `C13-09` 명세에 포함, "6b" AC 5건 → 정식 AC, Stage 2 이관 AC 7건(`AC-2-32`~`37` · `51` 표시분) 승계 AC 추가(AC-6-53~66), 온보딩 흐름 삽입·재방문 경로 영향 분석(§0.2) · 신규 결정 `N6-21`~`N6-27` · `R6-01` 갱신. **`D6-2`** — C-13 전부 design-agent 명세. **`D6-3`** — 나머지 `N6-*` 권고안 채택(각 행 `→ D6-x`). 원문은 ~~취소선~~ 으로 보존 |
| **개정 2** | 2026-11-15 | **`D6-8`** Plan·Spec 승인 반영 — ① `N6-21`~`27` → `D6-4`~`D6-7` 해소 표시 · Spec 결정 `N6-28`~`N6-48` = `D6-8` 채택 등재 ② Spec §13.1 `M6-1`~`M6-5`: 아이 정보에서 `relationship` 제외(`N6-39`) · `packages/ui` 신규는 `DiamondChart` 만, `PersonaCard` 는 Domain 조합 · 설정 모드 *Current* + *"제안 없음"* 안내 문장(`D6-8` 보충) · 온보딩 프로필 조회 실패 시 *Continue to Home*(`N6-37`) · `163:2607` 색 차이 Stage 7 기록(`N6-47`) — 관련 AC(18·30·55·57·61·64) 문구 정정 ③ `PF6-1`~`3` 확정 · PRD 수정 대상(§15.4) 갱신 ④ 작업 단위 순서 = Spec §15 (`S6-A` → `S6-E1` → `S6-E2` → `S6-B` → `S6-C` → `S6-D` → `S6-F`). AC 수 변동 없음(66) |
| **개정 3** | 2026-11-18 | **`D6-9`** QA 1차 결정 반영 (사용자 결정 — 이 개정은 결정의 문서 반영이며 별도 승인 체크포인트 없음) — ① **AC-6-26 문구 정정** (`D6-9` ② — 복귀 = **보던 단계**, 이탈 시 그 단계 저장) ② `API_CONTRACTS.md` **Rev 10.1** — `SaveSurveyUpdateStepRequest.currentStep?` 선택 필드 + `SurveyUpdateState.currentStep` 의미 변경(§7 C-6a) ③ Backend 요구 **`P6-BIP-13`** 추가(§10 · §18) ④ 작업 단위 **`S6-G`** (QA 수정 루프 — `D6-9` ①~④ 전 항목 + `QA-6-001`) 추가(§12.2). AC 수 변동 없음(66) · Stage Verdict 규칙 변경 없음 |

---

## 0. 출발점 — 무엇이 이미 있고 무엇이 없는가

| 항목 | 현재 상태 `[직독]` | Stage 6 에 주는 의미 |
|---|---|---|
| Stage 5 게이트 | `PASS (accepted: QA-5-003, QA-5-004)` — 커밋 `d85f28f` | ✅ 진입 조건 충족 |
| ⚠️ **프로필·페르소나 화면** | **없다.** `/onboarding/profile`(`C13-09`) · `/onboarding/growth-capability`(`C13-10`) 는 **Stage 2-B — 디자이너 Figma 대기** (2026-09-23 분리, `stage-2-approvals.md` §3). 라우터에 route 0 · Page 0 | ~~⛔ FR-15 "업데이트 표시"를 얹을 화면이 존재하지 않는다. Stage 6 최대 의존 → `N6-01`~~ → **`D6-1`: 두 화면을 Stage 6 에서 design-agent 명세로 만든다** (§0.2) |
| `ChildProfile` contract | 있음 (`children/profile.ts` — child · latestSnapshot · strengths≤2 · growingEdges≤2 · persona · growthCapability) | 그러나 **소비자 0**: `shared/api` 에 `childrenApi` **없음**, Mock 없음, hook 없음 (`grep getProfile` 0건) |
| `CapabilitySnapshot.source` | `z.literal('onboarding_survey')` — 주석 *"세션 분석 기반 스냅샷(Stage 6·7)은 해당 Stage 에서 값을 추가"* | enum 확장 필요 (§7 C-2) |
| `SetGrowthCapabilityRequest` · `PUT …/growth-capability` | schema 있음 · API 메서드·Mock 없음 | Stage 6 에서 처음 호출 |
| `UpdateChild` · `PATCH /v1/children/:childId` | **schema 없음** (API_CONTRACTS 표에만) | 신규 |
| `capability-snapshots` · `personas` 목록 | schema 없음 · 표에만 | 소비자가 Stage 7(히스토리) → `N6-12` |
| 설문 재응답 | contract 없음 — API_CONTRACTS *"설문 재응답 contract 형태는 Stage 6 Plan"* | 신규 → `N6-05` |
| 설정 목록 `/settings` | **로그아웃 1행** (Stage 3 의 알림 행은 `D-18` 로 미추가) — `features/settings/ui/SettingsMenu.tsx` · `copy.ts` | 행 추가 (C-16) |
| 온보딩 설문 | `features/onboarding-survey` — 4단계 16카드 · instrument 교체 가능 구조(`D-A`) · Step 2~4 전부 선택(`D-C`) · 서버 draft(`PUT /v1/onboarding/steps/:step`) | 재응답 재사용 후보 (`N6-06`) |
| Activity Card | `ActivityCardOption.reason`(서버 문장 1~2) 이 **이미 렌더**된다. `recommendationPhase` · `reasonKey` · 난이도 필드 **없음** (`D-22` 로 `targetCapability` 도 삭제) | warm 표시 = `N6-09` · 난이도 = `PF6-1` |
| `HomeSummary.characterLine` | 서버 문장 (Home 버블) | 업데이트 안내 통로 후보 (`N6-03`) |
| 대화 지표·Report | Stage 7 | Stage 6 은 손대지 않음 |

### 0.1 Figma 조회 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 조회했는가)

도구: `mcp__8c8226df…__get_metadata` (스키마는 ToolSearch 로 로드). **이 세션에서 라이브 조회 성공** — Stage 5 의 `R5-01`(MCP 미인증)은 이번에는 재현되지 않았다. 스크린샷(`get_screenshot`)은 대상 노드가 없어 호출하지 않았다.

| 조회 | 범위 | 결과 |
|---|---|---|
| 페이지 목록 | 파일 루트 | `8:2` Design Guide · `16:2` MVP_KeyScreen_V.2 · `125:765` MVP_KeyScreen V.1 · `66:202` Signup & Baseline Survey · `0:1` Page 1 |
| `16:2` 전체 (1,371줄 XML) | section `31:204` · `179:1700` · `296:1127` 및 2단 하위 frame 전부 | 프레임 = Home `26:21` · 세션 `285:1126`/`298:*`/`300:1309` · 완료 `29:62` · Library `30:74`·`163:1669`·`145:1132` · Report `31:102`·`110:522` · 가입·설문 `179:*`·`243:1147`·`248:1159`. **이름·텍스트 검색** (`persona` · `profile` · `setting` · `recommend` · `reason` · `diamond` · `radar` · `edit` · `updated` · `capabil` · `strength`) → 관련 프레임 **0**. 걸린 것: `26:44`(설정 아이콘, 38×38) · `243:1156` *"Let's set up your child's profile"*(온보딩) · `163:2608`/`110:806` *"Growth themes"*(Report) |
| `125:765` (V.1) | 전체 | 같은 화면군의 이전 버전. 프로필·설정·페르소나 프레임 **0** |
| `66:202` | 전체 | 가입·설문 구버전(`69:*`). 프로필 결과·발전 역량 프레임 **0** — `69:218` *"Baseline saved"* 다음 화면 없음 |
| `0:1` | 전체 | 초기 시안(`6:*` · `7:*`). 프로필·설정 **0** |
| `8:2` Design Guide | 전체 | 컴포넌트 세트: Button `17:20` · Tab · Tab Bar · Activity Card · Icon `50:157` · Input `76:417` · Tag `76:440`(`Color=Not selected` `163:2798` 포함) · **Button `78:158` `Icon=Setting` `78:156`** · Prompt Card · Bubble `88:721` · Select `90:626` · Title `139:2734` · Record Control · Book List `163:2145` · **Answer card `244:1376`** · iOS 26 Toggle `17:113` · Stepper `17:114` · Slider `17:118` · **Segmented Control `17:122`**. **다이아몬드 차트 · 페르소나 카드 · ListRow/설정 행 컴포넌트 0** |

**결론 (CONFIRMED by 조회)**: Stage 6 In Scope 화면 — 설정 목록 확장 · 아이 정보 수정 · 설문 재응답 진입/완료 · 발전 역량 변경 · 프로필/페르소나 업데이트 표시 · warm 추천 사유 — **전부 Figma 에 프레임이 없다.** 재사용 가능한 Figma 근거는 ① 설정 진입 아이콘 `26:44` ② 온보딩 Step 1 `248:1159` · 설문 카드 `179:1770` · 인트로 `179:1748`/`243:1147` · 완료 `179:1809` ③ Activity Card 의 `reason` 줄(`86:396` 계열) 뿐이다. → §16 C-13 6건.

⚠️ 레이어 이름은 문자열 근거가 아니다(`88:929` 선례). 위 검색은 **"없음"을 확인**하는 용도로만 썼고, 있는 노드의 실측은 design-agent 몫이다.

### 0.2 `D6-1` 영향 분석 — 프로필 결과 · 발전 역량 화면의 편입 (개정 1)

`D6-1` 로 `C13-09`·`C13-10` 이 Stage 6 범위가 되었다. 두 화면은 원래 **온보딩 종착점**이다. 근거별로 정해진 것과 정해지지 않은 것을 나눈다.

| 지점 | 근거 | 판정 |
|---|---|---|
| **온보딩 흐름에 삽입하는가** | PRD §5.1 ③④ · §6.2 *"설문 위저드 → 프로필 결과 → 발전 역량 제시"* · `stage-2-approvals.md` §3 *"Step 5 완료 → 프로필 결과 → 발전 역량 선택 → Home"* · FIGMA_SCREEN_MAP `179:1809` 행 *"결정된 흐름: `/onboarding/profile` → `/onboarding/growth-capability` → Home"* (M-07 Resolved) | **CONFIRMED — 삽입한다.** `/onboarding/saved`(`179:1809`) 의 CTA 목적지가 Home → `/onboarding/profile` 로 바뀐다 (`OnboardingSaved.tsx:42` 재작업 — §5.4 R-7) |
| route | `stage-2-approvals.md` §3 · 요청서 §2·§3 | **CONFIRMED** — `/onboarding/profile` · `/onboarding/growth-capability` |
| Route Guard | **`D-6`** — Guard 판정에서 **제외**, 제출 직후 연속 네비게이션 · `Me` 에 확인 플래그 없음 | **CONFIRMED** — 현재 Guard 는 `onboardingStatus='completed'` 사용자의 `/onboarding/*` 를 막지 않는다(`resolveGuardDecision.ts` 7번 = ALLOW) → **Guard 코드 변경 0**. 결과: 두 화면을 건너뛰고 이탈해도 다음 진입은 Home, 발전 역량은 서버 제시값 유지 |
| 화면 요소·상태·접근성 | `docs/design/stage-2-designer-request.md` §2·§3 (요소 8 · null 변형 A/B/C · 상태 6 · 차트 대체 텍스트 · 축 선택 대체 목록) | **입력 문서로 그대로 사용** — design-agent 명세의 요구 목록 |
| `D-2` 시각 표현 · `D-6` | `stage-2-approvals.md` §3·§4 (Stage 2-B 이관 결정) | **Stage 6 에서 이행** (D-2 ① ③ ④ ⑤ 는 contracts 에 이미 반영) |
| **온보딩 이후 재방문 경로** | PRD §6.1 IA 표에 "프로필" 자리가 **없다**(Progress = 다이아몬드 현황 — Stage 7, Figma `31:102` 에는 다이아몬드 없음 `PF6-2`; 설정 = "아이 프로필 수정"). 요청서는 온보딩만 다룬다 | ⚠️ **미정 → `N6-21`** |
| 두 화면의 데이터 출처 | 요청서 §2.3 은 `ProfileResult`(제출 응답) 를 가정하나 `ProfileResult` 에는 **`strengths`·`growingEdges` 가 없다** — `ChildProfile` 에만 있다 | ⚠️ **미정 → `N6-22`** |
| 발전 역량: 온보딩 화면(`C13-10` 축 탭) ↔ 설정 화면(`C13-S6-4` 목록, `N6-02` ⓐ) | PRD §7.3 축 탭 + §7.8 설정 변경 · 요청서 §3.4 *"차트 아래 선택 목록(대체 UI)"* | ⚠️ **두 화면을 하나로 쓸지 미정 → `N6-23`** |
| 온보딩 화면에서 뒤로·이탈 | `D-6` 은 Guard 만 정함. 뒤로 버튼 목적지·제출된 설문으로 되돌아가기 여부 미정 | ⚠️ **`N6-24`** |
| 요청서 §5 질문 Q1~Q7 (medallion 크기 · 대비 · 숫자 노출 · 축 순서 · 페르소나 일러스트) | 디자이너 답변 전제였다 | ⚠️ **design-agent 제안 → 사용자 확인 `N6-25`** (Q4 = `N6-11` ⓐ 로 이미 해소, Q8~Q10 은 기존 화면 Figma 질문이라 범위 밖) |
| 이미 온보딩을 마친 계정 | 화면이 없던 시기에 완료한 사용자(Mock 계정 포함)는 프로필 결과를 본 적 없음 | ⚠️ **`N6-26`** |
| Step 1 필드 선택지 확정 | `stage-3-approvals.md` **`D-20`** — *"`relationship`·`languageEnvironment`·`readingRoutine` 선택지 목록 확정은 Stage 6 으로 이월"* — 아이 정보 수정 화면(`N6-04` ⓐ)이 이 필드를 보여준다 | ⚠️ **`N6-27`** (초판 누락분) |
| Figma 도착 시 | `D6-1` *"나중에 Figma 가 들어오면 Figma 최우선 규칙에 따라 다시 맞춘다"* | Risk `R6-01` 개정 — 재작업 비용으로 관리 |

---

## 1. Goal

양육자가 **온보딩 끝에서 프로필 결과(다이아몬드·강점·growing edge·페르소나)를 보고 발전 역량을 고르며** (`D6-1` — Stage 2-B 편입), **설정에서 아이 정보를 고치고 · 설문을 다시 응답하고 · 발전 역량을 바꿀 수 있으며**, 세션 누적으로 갱신된 **프로필·페르소나**와 **warm 단계 추천(사유 문장·난이도 하향 결과)** 이 화면에 반영되는 흐름을 **Mock 위에서** 검증한다. 스냅샷 갱신 규칙·warm 추천 규칙·난이도 조정·같은 주제 3일 지양·재독 Prompt 재구성은 **Contract + Mock + Handoff 요구사항**으로만 다룬다.

---

## 2. In Scope (요구사항 ID별, Frontend 부분)

| 요구사항 | Stage 6 에서 하는 부분 | 하지 않는 부분 |
|---|---|---|
| 🆕 **FR-04** 다이아몬드 그래프 렌더링 · **FR-05** 페르소나 표시 · **§7.3** 프로필 화면 (개정 1, `D6-1`) | **`C13-09` 프로필 결과** `/onboarding/profile` — 다이아몬드(inline SVG, #9) · "판정 아님" 안내 · 강점 2 · growing edge 2 · 페르소나 카드 · null 변형 A/B/C(`D-2` 시각) · 상태(Loading·Error·Offline·fallback) · 차트 대체 텍스트. 온보딩 흐름 삽입(§0.2) + 재방문 경로(`N6-21`). Stage 2 이관 AC 승계(§11.12) | 스코어 산출·페르소나 생성(PENDING, Stage 2 `P2-BIP`) · 이전/현재 오버레이(Stage 7) |
| **FR-15** 세션 누적 기반 프로필·페르소나 자동 업데이트 (P0) — **표시** | `GET /v1/children/:childId/profile` 첫 소비(API Client · Mock · hook) · `profileUpdatedAt` · 스냅샷 `source` 확장 · **업데이트된 프로필·페르소나가 보이는 화면** — ~~화면 소스는 `N6-01` 결과(권고: 6b)~~ → **`D6-1`: `C13-09` 화면(재방문 모드)에 포함** · 업데이트 노출 방식 `N6-03` ⓐ(→ `D6-3`) | 스냅샷 산출·갱신 규칙·페르소나 생성(PENDING) · 변경 **히스토리** 표시(Stage 7 리포트 — PRD §7.3 *"변경 이력은 리포트의 히스토리"*) |
| **FR-06** 발전 역량 제시·변경 (P0) | 🆕 **온보딩 경로 `C13-10`** `/onboarding/growth-capability` — 제시값 · **다이아몬드 축 탭 선택** + 대체 선택 목록 · 확정 → Home (`D6-1`) · **설정 경로** `/settings` → 발전 역량 변경 화면 · `PUT …/growth-capability` · 낙관적 갱신 없이 응답 반영 · 결측(`score: null`) 역량 처리(`D-2`, `N6-11` ⓐ). 두 경로의 화면 공유 = `N6-23` | ~~다이아몬드 축 탭 변경 — Stage 2-B (`N6-01`)~~ → `D6-1` 로 In Scope |
| **§7.8** 아이 프로필 수정 (설문 재응답 포함) | 아이 정보 수정(`PATCH /v1/children/:childId` — 이름·성·생년월·성별 + `N6-04` 범위) · 설문 재응답(`N6-05`·`N6-06`) · **중도 이탈 후 복귀**(PLANNING Exit) · 제출 결과 = 갱신된 `ProfileResult` | 알림 설정(`D-18` — 디자이너 대기 `C13-19`) · 계정·구독(FR-26 P2) · 데이터 관리·탈퇴(Stage 8, C-15) |
| **FR-07** 오늘의 Activity Card — **warm 표시** | warm 단계 카드가 **기존 카드 UI 그대로** 서버 `reason` 문장으로 표시됨을 Mock 시나리오로 검증(`cold-to-warm` · `difficulty-lowered`) · `N6-09` 결과에 따른 contract 필드 | 추천 로직 자체(cold 3회 → warm 4회~ · 회고 신호 · 난이도 · 3일 지양 · 재독 Prompt 재구성) — 전부 PENDING |
| **§7.6 셋째 줄** 회고 → 추천 신호 (Stage 5 `P5-BIP-03` 의 표시) | `tricky_today` 제출 후 다음 카드가 `difficulty-lowered` fixture 로 바뀌는 **Mock 연쇄**(결정적) | 실제 신호 반영 (PENDING) |
| **§8.4** 페르소나 언어 규칙 | 페르소나 문구 = 응답 값만 · `isFallback` 무시하고 같은 표시(구분 UI 0) · 새 copy 금지어 0 | 금지어·안전 필터 (PENDING) |
| **NFR 프라이버시** | 설문 재응답·아이 정보 수정 값의 **로컬 영속 범위 = `N6-07`** · 로그 PII 0 · 로그아웃 시 캐시 정리 | 서버 측 이력·RLS (PENDING) |
| **기술 요구사항** (근거 FR-06·15·§7.8) | `childrenApi`(신규 API Client) · Mock `mocks/children/` · `UpdateChild` · 설문 재응답 contract · `Me.child` 캐시 무효화(이름 변경이 회고 제목·버블·Home 에 전파) | — |
| **이월 `QA-5-005`** (Low, test 주석) | `e2e/session-regression.spec.ts` `height >= 796` 조건·주석 정리 — `S6-F` 에 포함 (`N6-19`) | — |

---

## 3. Out of Scope

| 항목 | 넘기는 곳 | 비고 |
|---|---|---|
| 프로필 **변경 히스토리**·페르소나 히스토리·다이아몬드 이전/현재 오버레이 | Stage 7 | `capability-snapshots`·`personas` 목록 API 의 **호출자**도 Stage 7 (`N6-12`) |
| Progress 탭 "Growth themes" (`31:102` · `110:806`) | Stage 7 | `PF6-2` 기록만 |
| 알림 설정 화면 `/settings/notifications` | 디자이너 대기 (`D-18` · `C13-19`) | 설정 목록에 알림 행 **추가하지 않음** |
| 계정·구독(요금제) | FR-26 P2 — MVP 범위 밖 | — |
| 데이터 관리 · 탈퇴 · 동의 이력 보기 | Stage 8 (C-15 · C-19) | 설정 목록에 행 **추가하지 않음** |
| 다중 아동 프로필 | FR-27 P2 | — |
| `OBS-5-5`(baseline 3장 드리프트) · `OBS-5-7`(온보딩 fixture `Nova`) | Stage 8 | 기록만 |
| **Backend 구현 일체** | Backend Developer | 스냅샷 갱신 Job · 추천 엔진 · 페르소나 생성 · `recommendation_logs` 적재 · migration/RLS. `apps/api/`·`supabase/` **생성 금지** |

---

## 4. Dependencies

| 의존 | 상태 | 판정 |
|---|---|---|
| Stage 5 PASS | ✅ (2026-11-14, `d85f28f`) | 충족 |
| ⛔ **Stage 2-B (`C13-09` 프로필 결과 · `C13-10` 발전 역량 제시)** | **디자이너 Figma 미도착** — 이 세션 Figma 전 페이지 조회에서 프레임 0 (§0.1). 2026-09-23 분리 이후 약 7주 | ~~⛔ FR-15 표시 · 다이아몬드 축 탭 변경 차단 → `N6-01`~~ → ✅ **`D6-1` 로 해소** — design-agent 명세로 전환, 디자이너 의존 제거. 남는 의존 = Figma 도착 시 재정렬(`R6-01`) |
| C-13 화면별 디자인 소스 | ~~6건 미결 (§16)~~ → ✅ **`D6-2`** 전부 design-agent 명세 | 해소 |
| 🆕 개정 1 신규 결정 | `N6-21`~`N6-27` (§15.2) | ⛔ `N6-21`·`N6-22`·`N6-23` design 차단 |
| 스냅샷 갱신 규칙 (PLANNING Blocking) | 제품·전문가 결정 — Frontend 비차단 | Handoff 로만 (`N6-16`) |
| 업데이트 노출 방식 (PLANNING Blocking) | → `N6-03` | ⛔ `S6-E` |
| 법무 | `L-07`(성 수집) 등 기존 항목 — Stage 6 신규 없음. 아이 정보 **수정 이력 보관**은 Handoff 기록(`P6-BIP-08`) | 비차단 |

---

## 5. Frontend Architecture Impact

### 5.1 레이어 배치 (RECOMMENDED — 이름 확정은 development-agent)

```
pages/settings/SettingsPage                 ← 기존. 목록 행 추가 (조합만)
pages/settings/ChildInfoEditPage            ← 신규 /settings/child         (C13-S6-2)
pages/settings/SurveyUpdatePage(+Intro)     ← 신규 /settings/child/survey  (C13-S6-3, N6-05·06)
pages/settings/GrowthCapabilityPage         ← 신규 /settings/growth-capability (C13-S6-4)
pages/onboarding/OnboardingProfilePage      ← 신규 /onboarding/profile (C13-09, D6-1)
pages/onboarding/OnboardingGrowthPage       ← 신규 /onboarding/growth-capability (C13-10, D6-1)
pages/settings/ProfilePage (가칭)           ← 재방문 route — N6-21 ⓐ /settings/profile (C13-09 재방문 모드 + FR-15 업데이트 표시)
features/child-profile-view/                ← ProfileResultView (다이아몬드·강점/edge·페르소나·null 변형·업데이트 표시) — 온보딩/재방문 공용 (N6-22)
packages/ui                                 ← ~~CapabilityDiamondChart · PersonaCard~~ → **`DiamondChart` 신규 1** (도메인 비의존, inline SVG #9) + 확장 2 (`RadioGroup.meta` · `Surface material="bubble"`) — `M6-2` · Spec §3.7/§4
entities/child-profile/ (추가)                ← `PersonaCard` = **Domain 조합**(Surface 기반, Shared UI 아님) · 역량 순서 상수·라벨·tone 매핑 (`packages/ui` 는 역량 enum import 금지)
features/settings/                          ← SettingsMenu 확장 (행 구성은 route config)
features/child-profile-edit/                ← 아이 정보 폼 · 이탈 확인 · 저장
features/survey-update/                     ← 재응답 흐름 (onboarding-survey 의 순수 부분 재사용 — §5.3)
features/growth-capability/                 ← 역량 선택 · 저장 · 결측 처리
entities/child-profile/                     ← childProfileKeys · useChildProfile · useUpdateChild · useSetGrowthCapability · useSurveyUpdate*
shared/api/children-api.ts                  ← childrenApi interface (getProfile · update · setGrowthCapability · survey-update 3종)
mocks/children/                             ← MockChildrenApi · fixture(스냅샷·페르소나 변형) · scenario
packages/contracts                          ← children/update-child.ts · survey-update/* · snapshot source enum 확장 · profileUpdatedAt
```

- **feature 간 직접 import 금지** — `survey-update` 는 `onboarding-survey` 를 import 하지 않는다. 공통 부분(카드 렌더러·instrument 해석)이 필요하면 **`entities/onboarding` 또는 `packages/ui` 로 내리는 리팩터**를 한다 (`N6-06`, §5.3).
- Adapter 선택 지점 1곳(`app/providers`) · `HttpChildrenApi` 골격 (연동 PENDING).

### 5.2 Server State · 캐시 전파 (RECOMMENDED)

| 데이터 | Query key | 무효화 |
|---|---|---|
| `ChildProfile` | `childProfileKeys.detail(childId)` | 아이 정보 저장 · 발전 역량 저장 · 재응답 제출 성공 시 **응답으로 `setQueryData`** |
| `Me` (child.firstName 포함) | `meKeys.me()` (기존) | 아이 정보 저장 성공 시 **invalidate** — 회고 카드 제목(`N5-04`)·Home 문구·세션 버블 슬롯이 새 이름을 쓴다 |
| `HomeSummary` · today card | 기존 | 재응답·발전 역량 변경 성공 시 **invalidate** (서버가 다음 카드를 다시 계산할 수 있으므로 — 반영 시점은 `P6-BIP-04`) |
| 재응답 draft | `surveyUpdateKeys.state(childId)` | 제출 성공 시 제거 |

- 낙관적 갱신(optimistic update) **하지 않는다** — 프로필은 서버 산출값이다.
- 로그아웃 시 Query 캐시 전체 정리(기존 `useSignOut`) + `N6-07` 로컬 키 정리.

### 5.3 설문 재응답 구조 (`N6-05`·`N6-06` 권고안 기준)

- 재응답은 **온보딩과 같은 instrument**(`{code, version}`)를 쓴다 — 응답 비교 가능성 · 문항 하드코딩 금지(`D-A`) 유지.
- 진입 시 서버가 **현재 응답을 프리필한 draft** 를 내려준다(빈 설문으로 다시 시작하지 않는다 — 16카드 재입력 부담).
- 화면은 온보딩 설문 카드(`179:1770`) 렌더를 **재사용**하되, 온보딩 전용 요소(Trial 가입 유도 · Route Guard 온보딩 단계 · `/onboarding/saved` 착지)는 쓰지 않는다. 재사용 경계는 design-agent 가 확정.
- 중도 이탈 → 서버 draft 보존 → 다시 들어오면 마지막 카드부터 (PLANNING Exit *"설정 수정 중도 이탈 복귀"*).

### 5.4 Stage 2~5 산출물 재작업 지점

| # | 대상 | 재작업 | 근거 |
|---|---|---|---|
| R-1 | `features/settings/copy.ts` 머리 주석 *"Stage 2 의 목록 항목은 로그아웃 1행"* · `menuLabel: 'Account'` | 행 구성·그룹 라벨 개정 (C13-S6-1) | C-16 |
| R-2 | 시각 baseline `s2-settings*` | 재생성 — `R-BASELINE-1`(`=all` · diff 원인별 분해) | 행 추가로 반드시 바뀐다 |
| R-3 | `CapabilitySnapshotSourceSchema = z.literal(…)` | `z.enum([...])` — 스냅샷 테스트·Mock fixture 갱신 | §7 C-2 |
| R-4 | `ChildProfileSchema` | `profileUpdatedAt` 추가 → 모든 fixture 갱신 | §7 C-3 |
| R-5 | `onboarding-survey` 의 재사용 대상 코드 | 하위 레이어로 이동(동작 불변) — 온보딩 e2e 전부 회귀 통과 | `N6-06` |
| R-6 | `DevScreens.tsx` | Stage 6 화면·시나리오 링크 | dev 전용 |
| 🆕 R-7 | `OnboardingSaved.tsx:42` CTA `navigate(ROUTES.home, { replace: true })` | 목적지 → `/onboarding/profile` (replace 유지 — 제출된 설문으로 되돌아가지 않게, `N6-24`) · baseline `s2-onboarding-saved` 는 화면 불변이라 재생성 불필요 | §0.2 · `D6-1` |
| 🆕 R-8 | Stage 2 e2e 중 *"Get Started → Home"* 단정 | 승계 기록 후 *"→ `/onboarding/profile` → `/onboarding/growth-capability` → Home"* 으로 교체 (Stage 5 `N5-21` 선례) | `D6-1` |
| 🆕 R-9 | `MockOnboardingApi` 시나리오 `persona-fallback` · `capability-all-missing` (Stage 2 AC-2-51 에서 **UI 는 2-B**) | Stage 6 화면에서 UI 확인 — 같은 fixture 를 `children` 그룹이 재사용(이중 정의 금지) | AC-6-62 |
| 🆕 R-10 | `ROUTES` · router 표 주석 · `DevScreens` | 2 route + 재방문 route 추가 | — |

⛔ 온보딩 흐름(Step 1~5 · 제출 · Guard)의 동작은 **바꾸지 않는다** — R-5 는 이동만이다.

### 5.5 Privacy (Frontend 책임)

- 재응답 draft 는 **서버 draft** 를 정본으로 하고, 로컬 저장은 `N6-07` 권고(**하지 않음**)를 따른다. Trial 의 `localStorage` 30일 draft(`D-3`)는 **가입 전**이라 서버로 못 보내서 생긴 예외이며, 가입 후 경로에 확장하지 않는다.
- 콘솔·`devWarn` 에 아이 이름·응답 값·페르소나 문구 0.
- 아이 이름 변경은 push payload 미리보기와 무관(`P5-BIP-10` — payload 는 id 만).

---

## 6. Data Requirement Delta (Backend Handoff 용 — 구현 아님)

| 테이블 (`DATA_MODEL.md`) | 변경 제안 | 근거 |
|---|---|---|
| `capability_snapshots` | `source` 값 `onboarding_survey` · **`survey_update`** · **`session_analysis`** (`N6-08`) · 불변 행(갱신 = 새 행) · `scoring_version` 유지 | FR-15 · §12.1 "산출 근거(설문/세션)" |
| `children` | `profile_updated_at` (최신 스냅샷 또는 페르소나 생성 시각) — 또는 계산 값 | §7 C-3 |
| `onboarding_answers` → **`survey_responses`**(제안 이름) | 설문 응답 **버전 행** — 온보딩 제출 = 1행, 재응답 = 새 행. 제출된 행은 **수정하지 않는다**(API_CONTRACTS:760 *"스냅샷 오염"* 원칙 확장). draft 는 별도 상태 | `N6-05` |
| `personas` | 갱신 = 새 행 · `trigger`(`onboarding` · `survey_update` · `session_analysis`) | FR-15 · Stage 7 히스토리 원천 |
| `growth_capability_selections` | 기존(`system_suggested` · `caregiver_changed`) + **변경 경로**(`settings`) 기록 | FR-06 |
| `recommendation_logs` (§10) | 기존 제안 유지 — `phase`(cold/warm) · `inputs_summary`(신호 키만: snapshot id · reflection `tricky_today` · 주제 반복 회피 · 재독 회차) · `rules_version` | PLANNING HO · `P6-BIP-03` |
| `children` 수정 이력 | 이름·생년월 변경 이력 보관 여부·기간 = 법무 확인 항목 | `P6-BIP-08` |
| 소유권 | 전부 caregiver → child 소유권 · RLS · 전체 삭제 대상 | `P6-BIP-09` |

---

## 7. API Contract Delta (제안 — 승인 후 plan-agent 가 `API_CONTRACTS.md` **Rev 10** 으로 반영. 지금 고치지 않는다)

| # | 대상 | 제안 | 결정 |
|---|---|---|---|
| C-1 | **`childrenApi`** (신규 API Client) | `getProfile(childId)` · `update(childId, UpdateChild)` · `setGrowthCapability(childId, …)` · 재응답 3종(C-6) | RECOMMENDED |
| C-2 | `CapabilitySnapshotSourceSchema` | `z.literal('onboarding_survey')` → `z.enum(['onboarding_survey', 'survey_update', 'session_analysis'])` | `N6-08` |
| C-3 | `ChildProfileSchema.profileUpdatedAt` | `IsoDateTime \| null` **required + nullable** — 온보딩 직후(갱신 없음) = `null`. 표시 여부는 `N6-03` | `N6-03` |
| C-4 | **`UpdateChildRequestSchema`** (신규, `children/update-child.ts`) | `ChildInfoAnswersSchema` 의 **편집 가능 부분집합(**`relationship` 없음** — `N6-39`)**을 `.partial()` 로 — 최소 1필드 · 생년월은 `createBirthYearMonthSchema(now)`(3~9세 범위, `D-10`) 재사용 · 응답 `ChildProfile` · errors `VALIDATION_FAILED` · `CHILD_NOT_FOUND` | `N6-04` |
| C-5 | `PUT …/growth-capability` | 변경 0 (schema 기존). 응답 `ChildProfile`. `score: null` 역량 선택 허용 여부 = `N6-11` | `N6-11` |
| C-6 | **설문 재응답** (신규) | `GET /v1/children/:childId/survey-update` → `SurveyUpdateState` (instrument · draftAnswers(**현재 응답 프리필**) · currentStep) · `PUT …/survey-update/steps/:step` (`SaveOnboardingStep` schema 재사용) · `POST …/survey-update/submit` (IK, `SubmitOnboarding` 의 answers 부분 재사용) → **`ProfileResult`** (snapshot.source=`survey_update`) · errors `VALIDATION_FAILED` · `IDEMPOTENCY_KEY_REUSED` · `CONSENT_REQUIRED` | `N6-05` |
| 🆕 **C-6a** (개정 3) | **재응답 복귀 단계** — `D6-9` ② (`VG6-C-10` · `QA-6-003`) | `SaveSurveyUpdateStepRequest` 에 **선택 필드 `currentStep?: SurveyUpdateStep`** (이 저장 뒤 사용자가 보는 단계) · `SurveyUpdateState.currentStep` 의미 = **사용자가 마지막으로 보던 단계** · 서버 `currentStep = req.currentStep ?? req.step`. 클라이언트: 단계 이동 PUT 에 **도착 단계** · 카드 화면 이탈(앱 안 이동 · 브라우저 back) 시 미저장 편집이 있으면 보던 단계 PUT 1회(fire-and-forget, 실패 UI 0) · 탭 닫기·새로고침 = `pagehide` best-effort(`keepalive`), 실패 시 그 단계 미저장 편집 유실 **수용**. endpoint · response · error code 변경 0 · 신규 UI·문구 0. `API_CONTRACTS.md` **Rev 10.1** | `D6-9` ② · CONFIRMED |
| C-7 | 재응답 범위 | 기본 = 온보딩 Step 2~5 전부(Step 1 아이 정보는 C-4 경로). instrument 버전이 바뀌었으면 **새 버전**으로 응답(서버 결정 — 프리필 불가 문항은 빈 값) | `N6-05` |
| C-8 | `capability-snapshots` · `personas` 목록 | **schema + fixture + parse 테스트만** — API Client 메서드·호출자 0 (Stage 5 `N5-22` 선례). 호출자 = Stage 7 | `N6-12` |
| C-9 | `ActivityCard` · `ActivityCardOption` | **변경 0** — warm 은 서버 `reason` 문장으로만 드러난다. `recommendationPhase` · `reasonKey` 를 **노출하지 않는다** (화면 소비자 0 · Figma 근거 0 · 내부 진단은 `recommendation_logs`) | `N6-09` |
| C-10 | error code | **신규 0** (기존 29종) | RECOMMENDED |
| C-11 | `HomeSummary.characterLine` | 변경 0. 업데이트 안내를 이 서버 문장으로 할 수 있게 **Handoff 요구**만 (`N6-03` ⓐ 시) | `N6-03` |

§5.4 Scenario Catalogue 등재 제안 → §8.

---

## 8. Mock Scenarios

**그룹 `children`** (Mock = `mocks/children/`)

| Key | 종류 | 동작 |
|---|---|---|
| `success` · `loading` · `error` · `retry` · `offline` | 공통 | getProfile · update · setGrowthCapability · survey-update 전 메서드 |
| `empty` | 공통 | **스냅샷 1개**(온보딩만) · `profileUpdatedAt: null` · 페르소나 1종 (PLANNING `empty` 정의) |
| 🆕 `profile-updated` | FR-15 | `latestSnapshot.source='session_analysis'` · `profileUpdatedAt` non-null · 점수 변화 |
| 🆕 `persona-changed` | FR-15 | 페르소나 `name`·`description` 이 기본 fixture 와 다름 (예 `Curious Little Painter` → `Brave Little Maker` — PRD §5.2 예시) |
| 🆕 `persona-fallback` | §8.4 | `isFallback: true` — 화면 표시가 `false` 와 같은지 검증 |
| 🆕 `all-scores-missing` | `D-2` | 4역량 `score: null` · `growthCapability: null` · strengths/growingEdges 빈 배열 |
| 🆕 `scores-partially-missing` | `D-2` 변형 B (개정 1) | 1~3축 `score: null` — 미관찰 축과 값 있는 축이 한 도형에 섞임 (변형 A = `success`, C = `all-scores-missing`) |
| 🆕 `validation-failed` | 공통 오류 | update 가 `VALIDATION_FAILED` (`details.fields`) — 필드 오류 표시 |
| 🆕 `survey-update-draft` | Exit | 재응답 draft 가 중간(예 2단계 3번째 카드)에 저장된 상태 — **이탈 복귀** 검증 |
| 🆕 `survey-update-submitted` | §7.8 | 제출 → `ProfileResult`(source `survey_update`) |

**그룹 `activities`** (기존 그룹 확장)

| Key | 동작 |
|---|---|
| 🆕 `cold-to-warm` | 세션 완료 수(Mock 세션 저장소 기준, **결정적**) 가 3 이하이면 cold fixture, 4 이상이면 warm fixture — `reason` 문장이 회고·역량 변화를 언급하는 서버 문장으로 바뀜. **카드 UI 변경 0** |
| 🆕 `difficulty-lowered` | 직전 세션 회고에 `tricky_today` 가 있으면 다음 today card 가 **더 쉬운 책 + 그에 맞는 `reason`** fixture (Stage 5 회고 Mock 과 연쇄 — 결정적) |
| (기존 `same-topic-rotation` 등) | 추가하지 않는다 — 3일 지양·재독 Prompt 재구성은 서버 규칙(PENDING)이고 화면 차이 0 |

- 모든 fixture: 영어 · 진단·판정·비교 표현 0 · 실제 아동 데이터 0 · 아이 이름 `Emma`(`D5-14`) · 페르소나 문구 긍정형(§8.4).
- 기본(`success`) Mock 은 **상태 저장형**: update 후 getProfile 이 새 값을 돌려주고, 재응답 제출 후 프로필 스냅샷이 `survey_update` 로 바뀐다.

---

## 9. Frontend Scope (route / page / feature — 상세 UI 는 design-agent)

| Route | Page | Figma | 작업 단위 | 비고 |
|---|---|---|---|---|
| `/settings` (기존) | `SettingsPage` | 진입 `26:44` 만 — **목록 C13-S6-1** | `S6-B` | 행: 🆕 프로필 보기(`N6-21` ⓐ) · 아이 프로필(이름·정보) · 설문 다시 하기 · 발전 역량 · 로그아웃. 알림·데이터 관리·탈퇴 행 **없음** |
| `/settings/child` | `ChildInfoEditPage` | 없음 — `248:1159` 입력 재사용 후보 (**C13-S6-2**) | `S6-B` | 저장 · 취소 · 변경 후 이탈 확인(`N6-14`) |
| `/settings/child/survey` (+ 진입 안내) | `SurveyUpdatePage` | 카드 `179:1770` 재사용 · 진입/완료 상태 없음 (**C13-S6-3**) | `S6-C` | 프리필 · 이탈 복귀 · 제출 결과 표시(`N6-10`) |
| `/settings/growth-capability` | `GrowthCapabilityPage` | 없음 (**C13-S6-4**) — 다이아몬드 없음 | `S6-D` | 4역량 선택 목록 (`N6-02`) · 현재값 · 제시값 · 결측 표시 |
| ~~(6b) 프로필·페르소나 화면~~ → `/onboarding/profile` | `OnboardingProfilePage` | 없음 — **`C13-09` design-agent 명세** (`D6-1`) | `S6-E` | 온보딩 모드 — CTA `Next` → growth |
| `/onboarding/growth-capability` | `OnboardingGrowthPage` | 없음 — **`C13-10` design-agent 명세** (`D6-1`) | `S6-E` | 축 탭 + 대체 목록 · 확정 → Home (replace) |
| `/settings/profile` (재방문, `N6-21` ⓐ) | `ProfilePage`(가칭) | `C13-09` 재방문 모드 | `S6-E` | FR-15 업데이트 표시(`N6-03` ⓐ) · 수정·재응답·발전 역량으로 가는 링크 여부 = design-agent |
| Home (기존) | `HomePage` | `26:21` | `S6-A` 검증만 | warm·난이도 하향은 **기존 카드**에 fixture 로 표시 — 코드 변경 0 목표 |

| 구성 요소 | 위치 | 비고 |
|---|---|---|
| `ListGroup` · `ListRow` · `ConfirmDialog` | `packages/ui` (기존) | 설정 목록 |
| `TextField` · `SelectTrigger`(년·월, `D-10`) · `RadioGroup` · Tag `Color=Boy/Girl` 계열 | `packages/ui` (기존) | 아이 정보 폼 — Step 1 과 같은 컴포넌트 |
| 설문 카드 렌더러 | 하위 레이어로 이동(R-5) | `N6-06` |
| `RadioGroup` 또는 `ListRow`+check | `packages/ui` (기존) | 발전 역량 선택 — 신규 Shared UI 0 목표 |
| ~~`CapabilityDiamondChart` · `PersonaCard`~~ → `DiamondChart` (`packages/ui` 신규) · `PersonaCard` (Domain) | ~~`packages/ui` 신규 둘~~ → **`M6-2` (`D6-8`)**: ui 신규는 `DiamondChart` 만 · `PersonaCard` 는 `entities` 의 `Surface` 조합 | 축(라벨·값·null·선택)은 props. Stage 7 오버레이가 `DiamondChart` 재사용 · 데이터 카드 recipe = `Surface material="bubble"`(`N6-43`) |
| copy | `features/*/copy.ts` | 4역량 표시 라벨은 Stage 0 #14 고정값 |

---

## 10. Backend Integration Requirements (Contract 로 표현되는 기대 동작 — 구현 아님)

| ID | 요구 | Handoff 문서 | QA 예상 |
|---|---|---|---|
| `P6-BIP-01` | 세션 분석 누적 → **스냅샷 갱신 규칙**(주기·가중·최소 근거 세션 수·설문 대비 비중) — 제품·아동발달 전문가 결정 (`N6-16`) | AP · DR | PENDING |
| `P6-BIP-02` | 페르소나 재생성 트리거·빈도·안전 검증·fallback 풀 (§8.4) · `ai_generation_logs` | AP | PENDING |
| `P6-BIP-03` | 추천 단계: cold(가입~세션 3회) → warm(4회~) · `recommendation_logs` 적재 (§8.3 · DATA_MODEL §10) | AP · DR | PENDING |
| `P6-BIP-04` | warm 입력: 회고 체크(`tricky_today` → 난이도 하향) · `note` 주제 → 다음 Prompt · 반응 좋았던 주제 · 역량 스코어 변화. **반영 시점**(다음 날 07:00 카드 vs 즉시) | AP · BH | PENDING (`P5-BIP-03` 승계) |
| `P6-BIP-05` | 덱 카드별 역량 순환 · 같은 주제 연속 3일 지양 | AP | PENDING |
| `P6-BIP-06` | 같은 책 재추천 시 누적 대화 기반 **새 Prompt 세트** 랜덤 구성 | AP | PENDING |
| `P6-BIP-07` | 설문 재응답: 버전 행 저장 · 제출된 응답 불변 · 새 스냅샷(`survey_update`) · 페르소나 재생성 · draft 보존 기간 · 동의 강제 | DR · BH · AR | PENDING |
| `P6-BIP-08` | 아이 정보 수정: 생년월 변경 시 연령대 재계산과 추천·instrument 영향 · 수정 이력 보관(법무 확인) | DR · AP | PENDING |
| `P6-BIP-09` | 전 endpoint 소유권 확인 · RLS · 전체 삭제 대상 | AR · DR | PENDING |
| `P6-BIP-10` | 발전 역량 변경 기록(`caregiver_changed`·경로) 과 추천 반영 | DR · AP | PENDING |
| `P6-BIP-11` | (`N6-03` ⓐ 시) 프로필 갱신 사실을 `HomeSummary.characterLine` 서버 문장으로 안내 — 검수 템플릿 | BH · AP | PENDING |
| 🆕 `P6-BIP-12` | `GET /profile` 이 온보딩 제출 직후에도 **완성된 `ChildProfile`** (페르소나 생성 ≤ 3초 또는 fallback, strengths/growingEdges 산출)을 돌려준다 — 프로필 결과 화면의 유일한 데이터 출처 (`N6-22` ⓐ) | BH · AP | PENDING |
| 🆕 `P6-BIP-13` (개정 3, `D6-9` ②) | 재응답 draft 위치: `PUT …/survey-update/steps/:step` 이 선택 필드 `currentStep` 을 받아 `state.currentStep = currentStep ?? step` 으로 저장 · 잘못된 값 = `VALIDATION_FAILED` · 같은 단계 반복 PUT 은 **마지막 쓰기 우선**(멱등 — 이탈 PUT 과 `pagehide` PUT 이 겹칠 수 있다) · `keepalive` 요청(본문 ≤ 64KB, 인증 헤더 포함)을 일반 요청과 같게 처리 · 이탈 PUT 의 **부분 응답**은 draft 에만 남고 제출된 버전 행을 바꾸지 않는다(`P6-BIP-07`) | BH · DR | PENDING |

→ ~~12건~~ **13건** (개정 3). Stage 8 `BACKEND_HANDOFF.md` 등 1:1 반영 대상.

---

## 11. Acceptance Criteria

표기: **PENDING** = `BACKEND_INTEGRATION_PENDING` 예상 · 결정 의존 AC 는 결정 ID 를 적는다. ~~**6b** = `N6-01` ① 채택 시 Stage 6b 로 이동~~ → `D6-1` 로 6b 없음 — 해당 5건은 정식 AC.

### 11.1 Scope · Gate

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-01 | `apps/api/` · `supabase/` · `apps/mobile/` 부재, Backend 런타임 코드 0 | Scope | 파일 목록 | — |
| AC-6-02 | Out of Scope 미구현: 히스토리·오버레이 · Progress 탭 변경 · 알림 설정 화면·행 · 데이터 관리·탈퇴 행 · 목록 API(`capability-snapshots`·`personas`) 호출자 0 | §3 | grep · router | — |

### 11.2 Contracts

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-03 | 스냅샷 `source` enum 3값 · 스냅샷 테스트 갱신 · 기존 fixture parse 통과 | FR-15 · `N6-08` | 단위 | — |
| AC-6-04 | `ChildProfile.profileUpdatedAt` required+nullable — key 누락 응답 거부 | FR-15 | 단위 | — |
| AC-6-05 | `UpdateChildRequest` — 빈 요청 거부 · 이름 trim·40자 · 생년월 3~9세 범위(clock 주입) · 미허용 필드 거부(`N6-04`) | §7.8 | 단위 | — |
| AC-6-06 | 재응답 contract — state · save-step · submit(IK) parse · 응답 `ProfileResult.snapshot.source='survey_update'` | §7.8 · `N6-05` | 단위 | — |
| AC-6-07 | 목록 schema(`CapabilitySnapshotPage` · `PersonaPage`) fixture parse — API 메서드·호출자 0 (`N6-12`) | FR-15 | 단위 · grep | — |
| AC-6-08 | `ActivityCard` contract 변경 0 (`N6-09` ⓐ) · error code 신규 0 · 타입 `z.infer` 만 | 규칙 §5 | 스냅샷 · grep | — |
| AC-6-09 | `API_CONTRACTS.md` Rev 10 과 구현 contracts 일치 | 규칙 §5 | 문서 대조 | — |

### 11.3 Mock

| AC | 내용 | 검증 | 예상 |
|---|---|---|---|
| AC-6-10 | MockChildrenApi 요청·응답 contracts parse — §8 전 key | 단위 | — |
| AC-6-11 | 상태 저장형: update → getProfile 반영 · 재응답 submit → 스냅샷 `survey_update` · 발전 역량 저장 → `growthCapability` 반영 | 단위 | — |
| AC-6-12 | `cold-to-warm` · `difficulty-lowered` 가 **결정적**(세션 수·회고 기록 기준, 시간 비의존)으로 fixture 를 바꾼다 · `difficulty-lowered` 는 Stage 5 회고 Mock 의 `tricky_today` 와 연쇄 | 단위 | — |
| AC-6-13 | Mock Data 하드코딩 0 · Adapter 선택 1곳 · Component 의 Adapter 직접 호출 0 | grep · lint:boundaries | — |
| AC-6-14 | 신규 scenario key 가 `API_CONTRACTS §5.4` 에 등재 · dev Scenario Panel·`/__dev/screens` 로 전환 | 문서 · e2e | — |

### 11.4 설정 목록 (`C13-S6-1`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-15 | 행 구성 = 승인된 명세(아이 프로필 · 설문 다시 하기 · 발전 역량 · 로그아웃) — 명세에 없는 행 0 | C-16 · 최우선 규칙 2 | DOM | — |
| AC-6-16 | 진입 `26:44` → `/settings` · 각 행 → 해당 route · 뒤로 = 이전 화면 · 로그아웃 동작 회귀 없음(Stage 2 AC) | C-16 | e2e | — |
| AC-6-17 | Loading(아이 이름 표시가 있다면) · Error 상태 | 공통 상태 | e2e | — |

### 11.5 아이 정보 수정 (`C13-S6-2`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-18 | 현재 값 프리필 · 편집 가능 필드 = `N6-04` (~~Step 1 전 필드~~ → **`relationship` 제외**, `N6-39` → `D6-8`) · 컴포넌트 = Step 1 과 동일(Figma `248:1159` 입력 실측 기준) | §7.8 | 컴포넌트 · 시각 | — |
| AC-6-19 | 저장: 변경 필드만 요청 body(Mock 요청 로그) · 변경 없으면 저장 비활성 · 진행 중 중복 탭 → 요청 1건 | §7.8 | e2e | — |
| AC-6-20 | `validation-failed` → 필드별 오류 · 입력 보존 | 공통 | e2e | — |
| AC-6-21 | `error`·`offline` → 안내 + 입력 보존(메모리) · 재시도 성공 · 디스크 기록 0 | NFR · Privacy | e2e · 저장소 검사 | — |
| AC-6-22 | 저장 성공 → `Me`·프로필 갱신 — **회고 카드 제목·Home 문구가 새 이름** 을 쓴다(교차 화면 단정) | §5.2 | e2e | — |
| AC-6-23 | 변경 후 이탈(뒤로·탭 이동) → `N6-14` 결과(권고: 확인 다이얼로그) | Exit | e2e | — |

### 11.6 설문 재응답 (`C13-S6-3`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-24 | 진입 → 현재 응답 **프리필**된 카드 · 카운터·진행 표시 = 온보딩과 동일 규칙 · 문항은 Mock instrument 응답(하드코딩 0) | §7.8 · `D-A` | e2e · grep | — |
| AC-6-25 | 카드 이동 시 서버 draft 저장(`D-11` 규칙 재사용 — debounce·step 이동 1회) | Exit | e2e (요청 로그) | — |
| AC-6-26 | ~~**중도 이탈 복귀**: 이탈 → 설정 재진입 → 마지막 카드부터 · 답 보존 (`survey-update-draft`)~~ → **(개정 3, `D6-9` ②) 중도 이탈 복귀 = 보던 단계**: ① 단계 이동 PUT 이 `currentStep` = **도착 단계**를 싣는다 ② 카드 화면에서 이탈(TopBar 뒤로 → 진입 화면 이탈 · 앱 안 route 이동 · 브라우저 back) 시 보던 단계에 미저장 편집이 있으면 그 단계 PUT 1회 ③ 설정 재진입 → *Continue where you left off* → **이탈 때 보던 단계의 첫 카드**가 열리고 그 단계에서 고친 답까지 보존 (`survey-update-draft` · QA 재현 경로: 단계 2 에서 브라우저 back → 단계 2) ④ 탭 닫기·새로고침 = `pagehide` best-effort 저장 — 실패 시 그 단계 미저장 편집 유실 수용(위치는 ① 로 보존) · 신규 UI·문구 0 | **PLANNING Exit** · `D6-9` ② · C-6a | ①~③ e2e (요청 로그 `currentStep` · 이탈 PUT 1건) · ④ 단위(`pagehide` 핸들러 → 같은 요청 발행) | ④ 실제 전달 = **PENDING** (`P6-BIP-13`) |
| AC-6-27 | 제출(IK) → `N6-10` 결과 화면/동작 · 프로필 캐시 갱신 · Home 무효화 | §7.8 · FR-15 | e2e | — |
| AC-6-28 | 제출 실패·오프라인 → 안내 + 답 보존 + 같은 key 재시도 | NFR | e2e | — |
| AC-6-29 | 온보딩 회귀 — Step 1~5 · Trial · 제출 · Guard e2e 전부 통과 (R-5 이동 후) | 회귀 | e2e | — |

### 11.7 발전 역량 변경 (`C13-S6-4`)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-30 | 4역량 표시 라벨 = Stage 0 #14 · 현재 선택 표시 · ~~서비스 제시값 표시 방식 = 명세~~ → **설정 모드는 *Current* 표시만**(제시값 필드 없음 — `M6-3`·`N6-36`) + 안내 문장 = Spec §10.2 *"제안 없음"* 문구 *Choose the one you'd like to explore together first.* (`D6-8` 보충 — Figma DRAFT `317:1358` 의 *"We've suggested…"* 는 작도 오류로 보고 쓰지 않음) | FR-06 | DOM | — |
| AC-6-31 | 선택 → 저장(`PUT`) → 응답 반영 · 실패 시 이전 값 유지 + 안내 | FR-06 | e2e | — |
| AC-6-32 | 결측 역량(`score: null`) 처리 = `N6-11` (권고: 선택 가능, 점수 표시 없음) · `all-scores-missing` 에서 `growthCapability: null` 안내 | `D-2` | e2e | — |
| AC-6-33 | 비교·판정 표현 0 — "lowest/weak" 류 문구 금지 (제시 근거 문구는 서버 값 또는 승인 copy) | §8.4 | grep · 리뷰 | — |

### 11.8 프로필·페르소나 업데이트 표시 (FR-15)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-34 | `profile-updated` → 갱신된 스냅샷 점수가 화면에 반영 (`N6-01` 화면) | FR-15 · **Exit** | e2e | ~~6b~~ → 정식 (`D6-1`) |
| AC-6-35 | `persona-changed` → 새 페르소나 `name`·`description` **응답 그대로** · 가공·보간 0 | FR-15 · §8.4 | e2e · grep | ~~6b~~ → 정식 (`D6-1`) |
| AC-6-36 | 업데이트 노출 = `N6-03` ⓐ (→ `D6-3`): **재방문 프로필 화면**(`N6-21`) 내 `profileUpdatedAt` 기반 표시 + Home 은 서버 `characterLine` 만 · `empty` 에서 표시 0 · **온보딩 모드에서 표시 0** | FR-15 | e2e | ~~6b~~ → 정식 (`D6-1`) |
| AC-6-37 | `persona-fallback` 표시가 일반과 동일 · `isFallback` 노출 0 | §8.4 | e2e | ~~6b~~ → 정식 (`D6-1`) |
| AC-6-38 | `all-scores-missing` → `D-2` 미관찰 표현 (C13-09 디자인 기준) | `D-2` | e2e · 시각 | ~~6b~~ → 정식 (`D6-1`) |

### 11.9 warm 추천 표시 (FR-07)

| AC | 내용 | 요구사항 | 검증 | 예상 |
|---|---|---|---|---|
| AC-6-39 | `cold-to-warm` → 4번째 세션 완료 후 Home 카드의 `reason` 이 warm fixture 문장으로 바뀜 · **카드 DOM 구조 변경 0** | FR-07 · §8.3 | e2e | — |
| AC-6-40 | `difficulty-lowered` → `tricky_today` 회고 제출 → 다음 today card = 더 쉬운 책 + `reason` (Figma 에 없는 난이도 배지·라벨 0 — `PF6-1`) | **PLANNING Exit** · §7.6 | e2e | — |
| AC-6-41 | `reason` 은 응답 그대로 — 접두어·"because…" 조립 0 | §8 rules | grep | — |

### 11.10 Privacy · Copy · 접근성 · 아키텍처 · 회귀

| AC | 내용 | 검증 | 예상 |
|---|---|---|---|
| AC-6-42 | 새 copy 진단·판정·비교 표현 0 (금칙어 grep 목록: Stage 5 AC-5-44 + `weak` · `lowest` · `below`) · copy 는 feature copy 모듈에만 | grep · 리뷰 | — |
| AC-6-43 | 콘솔·에러 리포트에 아이 이름·응답 값·페르소나 문구 0 (실패·parse 실패 경로 포함) | e2e 콘솔 수집 | — |
| AC-6-44 | 로그아웃 → children·survey-update Query 캐시 0 · 로컬 저장소에 재응답·수정 키 0 (`N6-07`) | e2e · 저장소 전수 | — |
| AC-6-45 | 광고·제3자 SDK 0 · `VITE_*` Secret 0 · `assert:no-mocks` 통과 | 빌드 | — |
| AC-6-46 | 접근성: 신규 화면 포커스 순서·접근성 이름·라디오 그룹 의미·`prefers-reduced-motion`·대비 — 가값 신규 시 `P-30…` 등재 | axe · 수동 | — |
| AC-6-47 | 반응형 320×568 / 393 / 600 / 1024 — 가로 넘침 0 · 저장 버튼 스크롤 도달 · 그림자 클리핑 0(`R-SHADOW-1` 세로·가로 프로브, overflow 박스 신설 시) | e2e 프로브 · 시각 | — |
| AC-6-48 | 레이어: feature 간 import 0(`survey-update` ↔ `onboarding-survey` 포함) · Page = Composition · Mock↔Http 교체 시 UI·Query 변경 0 | lint:boundaries | — |
| AC-6-49 | 회귀: Stage 2(설정·로그아웃·온보딩) · 3(Home 카드) · 5(회고) 핵심 e2e · baseline 재생성은 `R-BASELINE-1` · **`QA-5-005` 해소**(`N6-19`) | e2e · QA 리포트 | — |
| AC-6-50 | `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `test` · `build` · `test:e2e`(Playwright **단독** 실행) 전부 통과 | 실행 로그 | — |

### 11.11 Backend 의존 (Frontend 부분은 위 AC 로 별도 판정)

| AC | 내용 | 대기 사유 → Handoff | 예상 |
|---|---|---|---|
| AC-6-51 | **이전 세션 데이터가 다음 추천에 반영된다** (cold→warm · 난이도 하향 · 3일 지양 · 재독 새 Prompt) | `P6-BIP-03`~`06` · `10` → AP · BH | **PENDING** |
| AC-6-52 | 세션 누적·재응답으로 스냅샷·페르소나가 실제로 갱신·저장된다 · 수정·재응답이 서버에 버전으로 남는다 | `P6-BIP-01` · `02` · `07` · `08` · `09` · `11` → AP · DR · AR | **PENDING** |

### 11.12 🆕 프로필 결과 · 발전 역량 제시 (`C13-09` · `C13-10` — 개정 1, `D6-1`)

Stage 2 QA 가 2-B 로 이관한 AC(`docs/qa/stage-2-qa-report.md` §4)를 **승계**한다. 승계 AC 는 QA 리포트에 *"AC-2-xx → AC-6-yy"* 로 기록한다.

| AC | 내용 | 요구사항 | 승계 | 검증 | 예상 |
|---|---|---|---|---|---|
| AC-6-53 | 온보딩 흐름: `/onboarding/saved` CTA → `/onboarding/profile` → `Next` → `/onboarding/growth-capability` → 확정 → Home(replace) · Trial 가입 전환(FR-24) 경로도 동일 | PRD §5.1 ③④ · §6.2 · FIGMA_SCREEN_MAP `179:1809` | — | e2e | — |
| AC-6-54 | Guard 변경 0 (`D-6`) — 두 화면을 건너뛰고 이탈해도 다음 진입 = Home, 재강제 0 · `Me` 에 확인 플래그 0 | `D-6` | — | 단위(`resolveGuardDecision` 기존 테스트 통과) · e2e | — |
| AC-6-55 | 데이터 출처 = `N6-22` 결과 (권고 ⓐ: 두 모드 모두 `GET /profile`) · 새로고침해도 같은 화면 재현 · 🆕 **온보딩 모드 조회 실패** → `ErrorState` + *Try again* + `TextLink` *Continue to Home*(서버 제시값 유지, `D-6` 일치) — 온보딩 끝에서 막힘 0 (`M6-4` · `N6-37` → `D6-8`) | FR-04 | — | e2e | — |
| AC-6-56 | 프로필 화면 구성 = 승인 명세: 이름 인사(**firstName 만, lastName 표시 0**) · 다이아몬드 4축 라벨(Stage 0 #14) · "판정 아님" 안내 · 강점 ≤2 · growing edge ≤2 · 페르소나 카드 — 비교·백분위·등급·변화량 0 | FR-04·05 · §7.3 · 요청서 §2.2 | **AC-2-33 · AC-2-34** | DOM · 시각 | — |
| AC-6-57 | `DiamondChart`(`packages/ui`, `M6-2`): 값 1.0~5.0 → 기하 정확(단위 테스트로 꼭짓점 좌표) · 축 순서 고정 = Self-Direction → Emotion Regulation → Cognitive Flexibility → Intrinsic Motivation(`N6-28`) · 숫자 미노출(`N6-29`) · 색 단독 구분 0 · 차트 대체 텍스트 = 승인 문장 형식(판정 표현 0) · `prefers-reduced-motion` | FR-04 · 접근성 | AC-2-33 | 단위 · axe | — |
| AC-6-58 | null 변형 A/B/C (`D-2` 시각): null 축 **제거 0 · 0/1.0/3.0 대체값 0** · "not observed yet" 텍스트 · 변형 C 에서도 진행 가능(CTA 활성) | `D-2` · 요청서 §2.4 | **AC-2-32** (시각분) | 단위 · e2e(`capability-all-missing`) · 시각 | — |
| AC-6-59 | 강점·growing edge·페르소나 = **응답 값 그대로** — Frontend 선정·가공 0 (`selectStrengths` 류는 Mock 쪽만) | FR-05 · §8 rules | **AC-2-35** (표시분) | grep · e2e | — |
| AC-6-60 | `persona-fallback` → 오류처럼 보이지 않음 · `isFallback` 노출 0 (AC-6-37 과 같은 규칙, 온보딩 모드) | §8.4 | **AC-2-36** (표시분) | e2e · 시각 | — |
| AC-6-61 | 발전 역량 화면: **온보딩 모드** 제시값 미리 선택 + *Suggested* 표시(`N6-36`) · **축 탭 = 선택**(44×44 히트) · **대체 선택 목록**(라디오 그룹 의미·키보드) · 차트 안팎 양쪽 선택 표시 · `suggestedCapability: null` → 미선택 시작 + CTA 비활성 사유 *Choose one to continue.*(`N6-45`) · null 축 선택 가능(`N6-11` ⓐ) | FR-06 · §7.3 · 요청서 §3 | **AC-2-37** | 컴포넌트 · e2e | — |
| AC-6-62 | 확정 → `PUT …/growth-capability` → Home · 저장 중 loading · 실패 시 인라인 안내 + 선택 보존 · Mock `persona-fallback`·`capability-all-missing` 시나리오의 UI 확인 | FR-06 | **AC-2-51** (2 key UI분) | e2e | — |
| AC-6-63 | 재방문 경로 = `N6-21` 결과 (권고 ⓐ: 설정 행 → `/settings/profile`) · 재방문 모드에서 CTA `Next` 대신 승인 명세 동작 · FR-15 표시(AC-6-34~37)는 이 모드에서만 | FR-15 · §0.2 | — | e2e | — |
| AC-6-64 | 설정 발전 역량 화면과 온보딩 발전 역량 화면의 관계 = **같은 컴포넌트 2모드** (`D6-6`) — 온보딩 *Suggested* / 설정 *Current* + *"제안 없음"* 안내 문장(`M6-3` · `D6-8` 보충) · 설정 모드 이탈 확인 없음(`N6-46`) — AC-6-30~33 과 함께 판정 | FR-06 | — | 컴포넌트 · e2e | — |
| AC-6-65 | 뒤로·이탈 = `N6-24` 결과 (권고: 프로필에서 뒤로 = 없음/Home, 제출된 설문으로 복귀 0 · 발전 역량에서 뒤로 = 프로필) | §0.2 | — | e2e | — |
| AC-6-66 | 반응형 320×568~1024 · 다이아몬드·페르소나 카드 넘침 0 · 페르소나 설명 110~220자 **말줄임 0**(요청서 §2.3) · 그림자 클리핑 0(`R-SHADOW-1`) · Stage 2 회귀(R-8 승계 기록) | FR-25 | — | e2e 프로브 · 시각 | — |

**집계 (개정 3)**: AC 수 변동 없음 — AC-6-26 문구만 정정(`D6-9` ②), Handoff 13건(`P6-BIP-13`). **집계 (개정 1)**: AC **66** — Frontend 판정 **64** · `BACKEND_INTEGRATION_PENDING` 예상 **2** (AC-6-51·52, Handoff **12건**) · `NOT VERIFIED` 예상 0. ~~초판: AC 52 — Frontend 50 (6b 이동 후보 5건)~~ → `D6-1` 로 6b 없음, 5건 정식 + 신규 14건(AC-6-53~66, 그중 Stage 2 이관 7건 승계: AC-2-32·33·34·35·36·37·51).

---

## 12. 작업 단위 (한 단위 = development-agent 1회 호출)

| 단위 | 내용 | AC | 선행 결정 |
|---|---|---|---|
| **`S6-A`** Contracts + Mock | §7 C-1~C-11 · `childrenApi` · `mocks/children/` · fixture 전수(R-3·R-4) · `activities` 시나리오 2종 · 회고 연쇄 · `API_CONTRACTS` Rev 10.x | 03~14 · 39~41 | ⛔ `N6-04` · `N6-05` · `N6-08` · `N6-09` · `N6-11` · `N6-12` |
| **`S6-B`** 설정 목록 + 아이 정보 수정 | `features/settings` 확장 · `/settings/child` · 캐시 전파 · 이탈 확인 · baseline 재생성 | 15~23 | ⛔ `C13-S6-1` · `C13-S6-2` · `N6-14` |
| **`S6-C`** 설문 재응답 | R-5 리팩터 · `/settings/child/survey` · draft·복귀 · 제출 결과 | 24~29 | ⛔ `C13-S6-3` · `N6-06` · `N6-07` · `N6-10` |
| **`S6-D`** 발전 역량 변경 (설정) | `/settings/growth-capability` — `N6-23` ⓐ 이면 `S6-E` 컴포넌트의 설정 모드 | 30~33 | ⛔ `C13-S6-4` · `N6-02` → `D6-3` · `N6-23` |
| **`S6-E`** 프로필 결과 · 발전 역량 제시 · 업데이트 표시 (~~6b 후보~~ → **정식**, `D6-1`) | `packages/ui` `CapabilityDiamondChart` · `PersonaCard` · `features/child-profile-view` · `/onboarding/profile` · `/onboarding/growth-capability` · 재방문 route · R-7~R-10 · FR-15 표시 | 34~38 · 53~66 | ⛔ `C13-09` · `C13-10` 명세 승인 · `N6-21` · `N6-22` · `N6-23` · `N6-24` · `N6-25` · ~~`N6-01` · 디자이너 Figma~~ |
| ↳ **`S6-E1`** (개정 2) | `DiamondChart`(+ 좌표 단위 테스트) · `PersonaCard`(Domain) · `Surface material="bubble"` · 프로필 온보딩·재방문 모드 · summary · 조회 실패 경로 | 34~38 · 53 · 55~60 · 63 · 66 | `D6-8` |
| ↳ **`S6-E2`** (개정 2) | 발전 역량 2모드(`RadioGroup.meta`) · 업데이트 표시(UpdateNote) · R-7 · R-8 | 54 · 61 · 62 · 64 · 65 | `D6-8` |
| **`S6-F`** 횡단 검증 | copy · privacy 프로브 · 접근성 · 반응형 · 레이어 · dev 화면 · **`QA-5-005`** · 인계 `docs/qa/stage-6-handoff.md` | 42~50 | — |
| 🆕 **`S6-G`** QA 수정 루프 (개정 3) | `D6-9` ①~④ 전 항목 + `QA-6-001` — 상세 §12.2 | 18 · 22 · 25 · 26 · 46 (+ 회귀 29 · 50) | `D6-9` |

~~순서 (개정 1): `S6-A` → **`S6-E`**(차트·프로필 공용 컴포넌트가 `S6-D` 의 전제) → `S6-B` → `S6-C` → `S6-D` → `S6-F` → design-agent Visual Gap(단위마다, 최우선 규칙 5) → stage-qa-agent. ~~`S6-E` 는 `N6-01` 결과에 따라 같은 흐름에 끼우거나 6b 로 분리~~ → `D6-1`.~~

**순서 (개정 2 — Spec §15 와 일치, `D6-8`)**: `S6-A` → **`S6-E1`**(차트 `DiamondChart` · 프로필 2모드) → **`S6-E2`**(발전 역량 2모드 · 재방문 · 업데이트 표시 · R-7·R-8) → `S6-B` → `S6-C` → `S6-D`(`S6-E2` 컴포넌트 `mode="settings"` 연결) → `S6-F` → design-agent Visual Gap(단위마다, 최우선 규칙 5) → stage-qa-agent.

### 12.1 ~~6a / 6b 분할 — 권고: 분할한다~~ → **미채택 (`D6-1`) — Stage 6 은 한 번에 진행한다**

> 아래는 초판 권고 원문(보존). `D6-1` 로 6b 는 없으며 `S6-E` 는 정식 작업 단위다. 작업량이 4b 수준(AC 66)이 되므로, `S6-E` 를 `S6-E1`(차트·페르소나 Shared UI + 프로필 화면) / `S6-E2`(발전 역량 2모드 + 재방문 + 업데이트 표시) 로 development-agent 호출을 나누는 것을 RECOMMENDED 로 둔다(Stage 분할 아님).


- **근거**: FR-15 표시의 유일한 자연스러운 자리(프로필 결과 화면)가 Stage 2-B 디자이너 산출물을 기다린다. Stage 4 `D4-9`(4a/4b) 선례.
- **6a** = `S6-A`·`S6-B`·`S6-C`·`S6-D`·`S6-F` (Figma 프레임 없는 화면은 C-13 design-agent 명세) — AC 47건 (Frontend 45 + PENDING 2).
- **6b** = `S6-E` + Stage 2-B 전체(`C13-09`·`C13-10`·`D-2` 시각·`D-6`) — 디자이너 Figma 도착 후. AC-6-34~38 + Stage 2-B 이관 AC.
- Stage 7 은 6b PASS 후 시작 권장 — 리포트의 다이아몬드 오버레이·페르소나 히스토리가 `C13-09` 의 차트·페르소나 카드 시각 언어를 그대로 쓰기 때문이다.

### 12.2 🆕 `S6-G` — QA 1차 수정 루프 (개정 3, `D6-9` · `docs/qa/stage-6-qa-report.md`)

development-agent 1회 호출 → design-agent Visual Gap(변경 화면, 최우선 규칙 5) → stage-qa-agent 재검증. **보고된 항목만 수정**(`rules/workflow.md` §1). 신규 UI·문구는 아래에 적힌 것 외 0.

| # | 항목 | 내용 (CONFIRMED — `D6-9`) | 근거 | AC |
|---|---|---|---|---|
| G-1 | **① 독서 루틴 · 언어 칩** (`VG6-B-06` · `07`) | Figma `248:1159` 대로 — 독서 루틴 = **Answer-card 행**(`244:1394`), 언어 칩 = **카드 안**(legend 포함, `244:1314`). 대상 = **아이 정보 수정(`/settings/child`) + 온보딩 Step 1 둘 다**(같은 `ChildInfoFields`). 구현 전 노드 실측(최우선 규칙 4). Step 1 baseline 재생성 허용 — **R-BASELINE-1 §5 클러스터 분해 후**, 설명 안 되는 클러스터가 있으면 멈춤 | `D6-9` ① · `QA-6-002` | AC-6-18 · 회귀 AC-6-29 |
| G-1a | ④ 언어 칩 히트 영역 겹침 | 인접 칩 히트 영역이 겹치는 5px 를 **가운데 분할**(`D5-6` 방식) — G-1 카드 배치 후 실측 | `D6-9` ④ · QA §5 비차단 | AC-6-18 · AC-6-46 |
| G-2 | **② 재응답 복귀 = 보던 단계** (`VG6-C-10`) | contracts `SaveSurveyUpdateStepRequest.currentStep?` 추가 · Mock PUT `currentStep = body.currentStep ?? body.step` · 위저드: 단계 이동 PUT 에 도착 단계 · 카드 화면 이탈(TopBar · 앱 안 이동 · 브라우저 back) 시 미저장 편집 PUT 1회 · `pagehide` best-effort(Http `keepalive`) · `e2e/settings-survey.spec.ts:93-128` 기대값을 **단계 2** 로 정정 · `API_CONTRACTS.md` Rev 10.1 구현 반영 표기 | `D6-9` ② · `QA-6-003` · C-6a · `P6-BIP-13` | AC-6-25 · **AC-6-26** |
| G-3 | **③ 비활성 사유 대비** (`VG6-E2-09`) | *Choose one to continue.* · *You can change this anytime in Settings.* 글자색 = **기존 진한 보조 텍스트 토큰**(신규 토큰 0) → 393×852 · 1200 높이 그래디언트 끝에서 **4.5:1 이상** 실측. 가값 `P-34` **등재 안 함** | `D6-9` ③ · `QA-6-004` | AC-6-46 (대비) |
| G-4 | ④ `VG6-E1-03` · `E1-14` (+ `E2-14`) | 가운데 정렬 **유지** — 코드 변경 0, VG 판정만 갱신 | `D6-9` ④ | — |
| G-5 | ④ `VG6-E1-12` · `E2-06` (+ `E2-07`) | 헤더 h1 ↔ 안내 · 선택 설명 ↔ *You can change…* 간격을 **Figma DRAFT 실측값 → 기존 spacing 토큰**으로 넓힘 (Orchestrator 해석, `D6-9` 원문 참조) · 임의 값 0 | `D6-9` ④ | AC-6-56 · AC-6-61 · AC-6-64 (시각) |
| G-6 | ④ `VG6-E2-19` | UpdateNote 연도 표기 **현행 유지** — 변경 0 | `D6-9` ④ | — |
| G-7 | ④ `VG6-E2-20` | UpdateNote 2줄일 때 아이콘 = **첫 줄 정렬** (320 폭) | `D6-9` ④ | AC-6-36 · AC-6-66 |
| G-8 | ④ `VG6-B-11` | 필드 오류 문구 *Please check this and try again.* **확정**(이미 구현 — copy 모듈 주석·Spec 기록만) | `D6-9` ④ | AC-6-20 |
| G-9 | ④ `VG6-C-09` | **설정 재응답 흐름만** 덱 접근성 이름 *Survey questions* · 진행바 *Survey progress* (온보딩은 그대로 — 덱·진행바에 라벨 prop) | `D6-9` ④ | AC-6-46 · 회귀 AC-6-29 |
| G-10 | ④ 오늘 카드 갱신 | 회고 저장 성공 시 today card 를 **즉시 무효화**(Mock 에서 즉시 반영) + 회귀 e2e(`QA-6-006`). 실제 서버 반영 시점은 그대로 `P6-BIP-04` | `D6-9` ④ · `QA-6-006` | AC-6-39 · AC-6-40 |
| G-11 | ④ `VG6-D-12` | 직접 링크 `navigate(-1)` — **Stage 8 전 앱 전체 기준으로 결정, 추적만**. 이번 변경 0 | `D6-9` ④ | — |
| G-12 | `QA-6-001` (FAIL, `D6-9` 밖) | 이름 변경 뒤 완료 버블이 옛 이름 — Mock 세션 버블 문장이 상태 저장형 아이 이름을 따르게 · e2e 가 버블까지 단정. 서버 문장이 현재 이름을 써야 한다는 요구는 Stage 8 Handoff 로 기록 | `QA-6-001` | AC-6-22 |

완료 조건: 위 AC 재판정 + AC-6-50 전체 명령(Playwright **단독**) · 변경 baseline 은 `--update-snapshots=all` 후 diff 분해 기록 · 인계 `docs/qa/stage-6-handoff.md` 에 `H6-8`(가칭) 절 추가.

---

## 13. Test Strategy

| 층 | 도구 | 대상 |
|---|---|---|
| Contracts | Vitest | enum 스냅샷(source) · `UpdateChild` 경계(clock 주입) · 재응답 schema · `profileUpdatedAt` key 누락 거부 · 목록 schema fixture |
| Mock | Vitest | 상태 저장형 갱신 · 시나리오 전 key parse · `cold-to-warm`·`difficulty-lowered` 결정성 · 회고 연쇄 |
| Component | Vitest + Testing Library | 아이 정보 폼(변경 감지·오류 보존) · 역량 선택(라디오 의미·키보드) · 재응답 프리필 |
| E2E | Playwright (**단독**) | 설정 진입·행 이동 · 수정 저장 → 회고 제목·Home 이름 교차 확인 · 이탈 확인 · 재응답 이탈 복귀 · 제출 · warm/난이도 연쇄(세션 4회 · `tricky_today`) · 온보딩 전 회귀 |
| 시각 | Playwright | 설정 목록 · 수정 · 역량 화면(393·320) · `R-BASELINE-1` |
| 프로브 | Playwright | 콘솔 PII · 저장소 전수 · (overflow 신설 시) 그림자 세로·가로 |
| 대기 방식 | — | `D4-150`·`D4-153` 교훈 — 단계별 대기 |

---

## 14. Risks & Mitigations

| ID | Risk | Mitigation |
|---|---|---|
| `R6-01` | ~~Stage 2-B 디자이너 산출물이 7주째 없다 — FR-15 표시·축 탭이 무기한 대기~~ → **개정 1 (`D6-1`)**: 대기 위험은 해소. **새 위험** — ① 디자이너 Figma 가 나중에 도착하면 최우선 규칙으로 **재작업**(다이아몬드·페르소나 카드·두 화면 레이아웃·baseline) ② design-agent 명세 차트가 Stage 7 오버레이의 기준이 되어 **재작업 범위가 Stage 7 까지 번질 수 있다** ③ 디자이너가 이미 진행 중인 작업과 **명세가 갈라질** 수 있다 | ① 차트·페르소나 카드를 `packages/ui` 한 곳에 두고 **토큰만 사용**(값 교체로 끝나게) ② Spec 에 "Figma 도착 시 재정렬 대상" 표시 + 가값 `P-30…` 로 등재 ③ Orchestrator 가 **디자이너에게 Stage 6 명세 착수 사실을 알리고**, 요청서(`stage-2-designer-request.md`) 를 "명세 선행 · Figma 로 대체 예정" 상태로 갱신 (design-agent) ④ Stage 7 착수 전 Figma 도착 여부 재확인 |
| `R6-02` | 설문 카드 재사용 리팩터가 온보딩 회귀를 낸다 | R-5 = 이동만 · AC-6-29 온보딩 e2e 전부 · baseline diff 클러스터 0 |
| `R6-03` | 이름 변경이 캐시 일부에 남아 화면마다 다른 이름 | §5.2 무효화 표 · AC-6-22 교차 화면 단정 |
| `R6-04` | 재응답이 온보딩 응답을 덮어써 cold-start 출처가 깨짐(API_CONTRACTS:760) | 버전 행·제출 불변(`P6-BIP-07`) · contract 에서 별도 endpoint |
| `R6-05` | warm 차이가 화면에 거의 안 보여 "반영됨"을 사용자가 못 느낌 | PRD·Figma 범위 안에서는 `reason` 문장이 유일한 표면. 별도 배지는 Figma 없음 → `PF6-1` 로 사용자 결정. 실제 반영 검증은 PENDING(AC-6-51) |
| `R6-06` | 생년월 수정으로 3~9세 범위를 벗어나는 경우 | schema 범위 검증(AC-6-05) · 서버 재검증 `P6-BIP-08` |
| `R6-07` | 설정 목록 행이 Stage 8 에서 다시 바뀌어 baseline 재생성 반복 | 정상 비용 — `R-BASELINE-1` 절차 유지 |
| `R6-08` | Figma 조회가 다음 단계에서 막힘 (Stage 5 `R5-01` 이력) | 이번 세션은 성공. design-agent 착수 시 재확인, 막히면 추측 금지·보고 |

---

## 15. Open Decisions

### 15.1 PRD ↔ Figma 충돌 — **지점별 사용자 결정 대기**

| ID | 지점 | PRD / PLANNING | Figma | 영향 | 권고 |
|---|---|---|---|---|---|
| **`PF6-1`** | 난이도 하향의 **표시** | PRD §7.6 *"힘들어했어요 → 다음 추천 난이도 하향"*(서버 동작) · PLANNING Exit *"difficulty-lowered fixture가 카드에 표시"* · PRD §6.1/§12.1 Book 에 난이도 메타 | Activity Card(`86:396` 계열 · `26:21`)에 **난이도 표시 요소 없음** — 배지 = 역량, 문장 = `reason` | contract(난이도 필드 추가 여부) · 카드 UI 요소 추가 여부 · Backend 노출 | **Figma** — 표시 요소 0. 하향은 **다른 책 + 서버 `reason` 문장**으로만 드러남. PLANNING Exit 문구를 *"difficulty-lowered fixture 의 카드(책·사유)가 표시"* 로 정정 → ✅ **확정 (`D6-8`, Spec §12)** — Figma 채택, PLANNING Exit 정정 |
| **`PF6-2`** | 역량 현황 위치·표현 | PRD §6.1 Progress = *"다이아몬드 그래프 현황 · 페르소나 히스토리"* | Progress `31:102`·`110:522` = 다이아몬드·페르소나 **없음**, 대신 **"Growth themes" 4행**(`strong` · `growing` · `emerging`) | Stage 6 영향 없음(Progress 미변경). Stage 7 에서 다이아몬드 위치 · `strong/emerging` 라벨의 §8.4 적합성 결정 필요 | **Stage 7 Plan 에서 결정** — 지금은 기록만 → ✅ **확정 (`D6-8`)** — Stage 7 Plan 에서 결정 + 🆕 `163:2607` 역량 색(teal/pink/blue/violet-67) 이 #19 차트·Tag 색과 **2색 다름** 기록(`M6-5` · `N6-47`) — Stage 7 에서 함께 결정 |
| **`PF6-3`** | 발전 역량 **변경 수단** | §7.3 *"다이아몬드 그래프의 축을 탭해 변경"* · §7.8 *"설정에서 변경"* | 다이아몬드·설정 화면 **모두 없음** | 설정 경로 UI 형태 | 설정 경로 = **선택 목록**(C-13 명세, `N6-02`), 축 탭은 `C13-10` 에 그대로 둔다 — 두 경로 공존(PRD 대로). **개정 1: `C13-10` 도 Stage 6 (`D6-1`) — 공유 여부 `N6-23`** → ✅ **확정 (`D6-8`)** — 두 경로 공존 + **같은 화면**(`D6-6`): 온보딩·설정 모두 축 탭 + 목록 |

### 15.2 결정 목록 `N6-xx`

⛔ = 해당 작업 단위 착수 전 필요 · 모든 항목에 권고안이 있다.

| ID | 차단 | 질문 | 선택지 | 권고 | 라벨 |
|---|---|---|---|---|---|
| **`N6-01`** | ⛔ `S6-E` · design 범위 | Stage 2-B(`C13-09` 프로필 결과 · `C13-10` 발전 역량 제시) 가 미도착인데 FR-15 표시는? | ① **6a/6b 분할** — 6b = Stage 2-B + 업데이트 표시, 디자이너 도착 후 ② C13-09·10 을 **design-agent 명세로 전환**(2026-09-23 결정 변경) — Stage 6 한 번에 ③ FR-15 표시를 설정 아이 프로필 화면에 텍스트로만(Figma 없음 — 신규 UI) | **①** — 기존 결정(디자이너) 유지 · 다이아몬드·페르소나 카드는 새 시각 언어라 명세로 만들면 Stage 7 까지 번진다. **디자이너 ETA 를 함께 확인해 달라** — ETA 가 없으면 ② 재검토 | NEEDS DECISION → **`D6-1` 미채택 — 6a/6b 분할 안 함, `C13-09`·`C13-10` design-agent 명세로 Stage 6 편입** |
| **`N6-02`** | ⛔ `S6-D` | 설정의 발전 역량 변경 UI | ⓐ 4역량 **단일 선택 목록**(RadioGroup/ListRow) + 현재·제시 표시 ⓑ 다이아몬드 축 탭(=`C13-10` 대기) | **ⓐ** (PF6-3) | NEEDS DECISION (C-13 성격) → **`D6-3`** ⓐ (목록은 `N6-23` 에 따라 `C13-10` 대체 선택 목록과 통합 가능) |
| **`N6-03`** | ⛔ `S6-E` | 업데이트 노출 방식 (PLANNING Blocking) | ⓐ **수동형** — 프로필 화면에 최신값 + `profileUpdatedAt` 기반 표시(문구 명세) · Home 은 서버 `characterLine` 만(새 UI 0) ⓑ Home 배너·뱃지(Figma 없음) ⓒ push 알림(새 kind) | **ⓐ** — 새 UI·새 알림 0 | NEEDS DECISION → **`D6-3`** ⓐ (화면 = `C13-09` 재방문 모드, `D6-1`) |
| **`N6-04`** | ⛔ `S6-A`·`B` | 아이 정보 수정 필드 | ⓐ **Step 1 전 필드**(firstName · lastName · birthYearMonth · gender · languageEnvironment · readingRoutine) ⓑ API_CONTRACTS 표의 4필드만 | **ⓐ** — 온보딩 Step 1 과 같은 화면 어휘, 수정 불가 필드가 남으면 재응답 경로가 필요해진다 | NEEDS DECISION → **`D6-3`** → 정정 **`M6-1`/`N6-39` (`D6-8`)**: `relationship` 은 보호자 데이터(`D-16`, `PATCH /v1/me`)라 **제외** — 편집 필드 = firstName · lastName · birthYearMonth · gender · languageEnvironment · readingRoutine |
| **`N6-05`** | ⛔ `S6-A` | 재응답 contract 형태 | ⓐ **별도 `survey-update` endpoint 3종**(§7 C-6) + 버전 행 + 현재 응답 프리필 ⓑ 온보딩 endpoint 재사용(`mode` 파라미터) ⓒ 단일 `PUT` 전체 교체(draft 없음) | **ⓐ** — 온보딩 Guard·상태와 분리, 이탈 복귀(Exit) 충족, 응답 불변 | NEEDS DECISION (API_CONTRACTS 변경) → **`D6-3`** |
| **`N6-06`** | ⛔ `S6-C` | 재응답 화면 재사용 방식 | ⓐ 카드 렌더러·instrument 해석을 **하위 레이어로 이동**해 두 feature 가 공유 ⓑ `onboarding-survey` 를 그대로 import(레이어 규칙 위반) ⓒ 복제 | **ⓐ** | RECOMMENDED → **`D6-3`** |
| **`N6-07`** | ⛔ `S6-C` | 재응답 draft 로컬 저장 | ⓐ **하지 않음** — 서버 draft 만, 오프라인 중 답은 메모리 ⓑ Trial 처럼 `localStorage` | **ⓐ** — 가입 후 경로, 아동 데이터 디스크 잔류 0 | RECOMMENDED (Privacy) → **`D6-3`** |
| **`N6-08`** | ⛔ `S6-A` | 스냅샷 `source` 값 | `onboarding_survey` · `survey_update` · `session_analysis` | 그대로 | RECOMMENDED → **`D6-3`** |
| **`N6-09`** | ⛔ `S6-A` | `recommendationPhase` · `reasonKey` 노출 | ⓐ **노출 안 함** — warm = `reason` 문장, 내부 기록은 `recommendation_logs` ⓑ 필드 추가 + 미렌더 ⓒ 필드 추가 + 표시(Figma 없음) | **ⓐ** — 소비자 0 필드를 만들지 않는다. API_CONTRACTS Stage 6 절의 "Figma 에 있으면 사용" 조건 불충족 | NEEDS DECISION (API_CONTRACTS 변경) → **`D6-3`** |
| **`N6-10`** | ⛔ `S6-C` | 재응답 제출 후 | ⓐ 저장 Toast + 설정으로 복귀(6b 이후엔 프로필 화면으로) ⓑ 온보딩 `/onboarding/saved`(`179:1809`) 재사용 ⓒ 결과 화면 신설 | **ⓐ** — 새 화면 0. ⓑ 는 "starting point" 문구라 맥락 불일치 | NEEDS DECISION → **`D6-3`** ⓐ 채택 + `D6-1` 우선: 프로필 화면이 생기므로 *"6b 이후엔 프로필 화면으로"* 가 즉시 적용 — **제출 → Toast + 재방문 프로필 화면**(`N6-21`) |
| **`N6-11`** | `S6-A`·`D` | `score: null` 역량을 발전 역량으로 고를 수 있나 | ⓐ **가능**(점수 미표시) ⓑ 불가 | **ⓐ** — `D-2` 는 *기본 제시값* 후보에서만 제외, 양육자 선택은 막지 않음 | RECOMMENDED → **`D6-3`** |
| **`N6-12`** | `S6-A` | 목록 API(`capability-snapshots`·`personas`) | schema + fixture 만, 메서드·호출자 0 (Stage 7) | 그대로 | RECOMMENDED → **`D6-3`** |
| `N6-13` | — | 재응답 진입 위치 | 설정 목록의 별도 행 vs 아이 정보 화면 안 링크 | design-agent 명세 후 확인 | NEEDS DECISION (C-13) → **`D6-3`** (명세 후 체크포인트 확인) |
| **`N6-14`** | ⛔ `S6-B` | 아이 정보 변경 후 저장 없이 이탈 | ⓐ **확인 다이얼로그**(`ConfirmDialog`, `D-7` 선례) ⓑ 경고 없음 ⓒ 자동 저장 | **ⓐ** | RECOMMENDED → **`D6-3`** |
| `N6-15` | — | 재응답 중 instrument 버전 변경 | 서버가 새 버전 draft 를 내려주고 프리필 가능한 문항만 채움 | 그대로 (Handoff `P6-BIP-07`) | RECOMMENDED → **`D6-3`** |
| `N6-16` | — | 스냅샷 갱신 규칙 (PLANNING Blocking) | 제품·전문가 결정 → Handoff | Frontend 비차단 | NEEDS DECISION (제품 · 비차단) → **`D6-3`** (Handoff, 비차단) |
| `N6-17` | — | 재응답 빈도 제한 | 없음 (PRD 근거 없음) | 없음 | RECOMMENDED → **`D6-3`** |
| `N6-18` | — | 설정 목록 그룹 라벨 (`Account` 1그룹 → 2그룹?) | design-agent 명세 | 명세 후 확인 | C-13 → **`D6-3`** (명세 후 체크포인트 확인) |
| `N6-19` | `S6-F` | `QA-5-005` 처리 | ⓐ **Stage 6 `S6-F` 에서 정리** ⓑ Stage 8 | **ⓐ** — test 2줄, 다음 크기 추가 시 오판 예방 | RECOMMENDED → **`D6-3`** |
| `N6-20` | — | 6b 이관 시 Stage 2-B 미결 `D-2`(시각) · `D-6` | 6b Plan 에서 재제시 | 그대로 | 기록 → **`D6-1`·`D6-3`**: 6b 없음 — `D-2` 시각·`D-6` 은 Stage 6 에서 이행(§0.2) |
| 🆕 **`N6-21`** | ⛔ design (`C13-09` 재방문 모드 · `C13-S6-1`) | 온보딩 이후 **프로필 재방문 경로** (PRD §6.1 IA 표에 자리 없음) | ⓐ **설정 목록 행 → `/settings/profile`** (C13-09 재방문 모드 — FR-15 업데이트 표시 · 수정/재응답/발전 역량 진입) ⓑ Home 에 진입점(Figma `26:21` 에 없는 요소 추가 — 최우선 규칙 2 위반 소지) ⓒ Progress 탭(Stage 7 · Figma `31:102` 에 다이아몬드 없음 `PF6-2`) ⓓ 재방문 없음(온보딩 1회만 — FR-15 표시 자리 소멸) | **ⓐ** — Figma 있는 화면을 건드리지 않고, PRD §6.1 설정 "아이 프로필" 과 맞는다. Stage 7 에서 Progress 와의 관계 재검토 | NEEDS DECISION → **`D6-4`** ⓐ |
| 🆕 **`N6-22`** | ⛔ design · `S6-A`·`E` | 프로필 화면 **데이터 출처** — `ProfileResult`(제출 응답)에는 `strengths`·`growingEdges` 가 없다 | ⓐ **두 모드 모두 `GET /profile`(`ChildProfile`)** — 제출 응답은 이동 신호로만, 캐시는 invalidate ⓑ `ProfileResult` 에 `strengths`·`growingEdges` 추가(contract 변경) ⓒ Frontend 가 `selectStrengths` 로 계산(가공 금지 규칙 위반) | **ⓐ** — 한 컴포넌트·새로고침 안전·contract 변경 0. 요청서 §2.5 *"Persona loading(3초)"* 상태는 서버가 페르소나 포함 응답을 보장하므로(`P6-BIP-12`) **화면 Loading 상태로 흡수** | NEEDS DECISION → **`D6-5`** ⓐ |
| 🆕 **`N6-23`** | ⛔ design (`C13-10` · `C13-S6-4`) | 온보딩 발전 역량(`C13-10`, 축 탭) ↔ 설정 발전 역량(`C13-S6-4`, 목록 `N6-02` ⓐ) | ⓐ **같은 컴포넌트 2모드** — 다이아몬드 축 탭 + 대체 선택 목록(요청서 §3.4)을 공유, 온보딩 = `Start with this`→Home, 설정 = 저장→뒤로 ⓑ 별개 화면(설정은 목록만) | **ⓐ** — `N6-02` ⓐ 의 목록은 그대로 포함(D6-3 과 충돌 없음), 화면·명세·테스트 1벌. 설정에도 축 탭이 생겨 PRD §7.3·§7.8 둘 다 충족 | NEEDS DECISION → **`D6-6`** ⓐ |
| 🆕 **`N6-24`** | `S6-E` | 두 온보딩 화면의 뒤로·이탈 | ⓐ **프로필: 뒤로 버튼 없음**(saved → profile 을 replace, 제출된 설문으로 복귀 0) · 발전 역량: 뒤로 = 프로필 · 이탈 시 재강제 0(`D-6`) ⓑ 프로필에도 뒤로(= saved) | **ⓐ** | RECOMMENDED → **`D6-7`** ⓐ |
| 🆕 **`N6-25`** | 구현 차단(design 은 비차단) | 요청서 §5 의 디자이너 질문 Q1·Q2·Q3·Q5·Q6·Q7 — medallion 크기 · 보조 텍스트/비텍스트 대비 · **차트 숫자 노출** · **축 순서** · 페르소나 일러스트 | design-agent 가 Spec 에서 각 항목 **제안 + 근거**, 사용자 체크포인트에서 확정. 기본 제안: Q5 = **숫자 미노출**(차트·텍스트 모두 — "점수"로 읽힘 방지, 대체 텍스트도 수치 대신 관찰 언어 검토) · Q6 = 고정 순서 1개(Stage 7 오버레이 공유) · Q7 = **기존 에셋 재사용**(신규 에셋 0) · Q2/Q3 = 가값 `P-30…` 등재 | **위 기본 제안** | NEEDS DECISION (체크포인트) → **`D6-7`** — Spec §8 제안을 **`D6-8`** 로 확정 (`N6-28`~`N6-34`) |
| 🆕 **`N6-26`** | — | 이미 온보딩을 마친 계정(화면이 없던 시기) | ⓐ **강제 노출 없음** — 재방문 경로(`N6-21`)로만 ⓑ 1회 안내 | **ⓐ** — Guard 변경 0(`D-6`) | RECOMMENDED → **`D6-7`** ⓐ |
| 🆕 **`N6-27`** | `S6-B` (비차단 — 권고안으로 착수) | `D-20` 이월 — `relationship`·`languageEnvironment`·`readingRoutine` **선택지 목록 확정** | ⓐ **현재 구현 값 그대로 확정** ⓑ 질문지·PRD 재검토 후 변경 | **ⓐ** — 근거 문서에 새 선택지가 없다. 변경 시 instrument·Mock 만 교체 | NEEDS DECISION (초판 누락 — 개정 1 추가) → **`D6-7`** ⓐ — 단 `relationship` 은 아이 정보 화면에서 제외(`M6-1` · `N6-39` → `D6-8`, 보호자 데이터 `D-16`) |
| 🆕 `N6-28`~`N6-48` | — | Design Spec 단계 결정 21건 (축 순서 · 숫자 미노출 · 미관찰 축 규칙 · 일러스트 없음 · 대비 · *Suggested*/*Current* · 조회 실패 경로 · 설정 목록 2그룹 · `relationship` 제외 · 저장 표면 · `ChildInfoFields` 이동 · UpdateNote · 카드 recipe · *Growth focus* · 비활성 사유 · 이탈 확인 · `163:2607` 색 · 재응답 route 등) | — | 상세 = `docs/design/stage-6-design-spec.md` §13.2 | 전부 권고안 | → **`D6-8`** 채택 (2026-11-15) |

### 15.3 기존 미결의 변화

| ID | 이전 | 지금 |
|---|---|---|
| Stage 2-B (`C13-09`·`C13-10`) | 디자이너 대기 | ~~→ `N6-01`. 디자이너 ETA 확인 요청~~ → `D6-1` |
| API_CONTRACTS *"설문 재응답 contract 형태는 Stage 6 Plan"* | 미정 | → `N6-05` 권고 ⓐ |
| API_CONTRACTS Stage 6 절 `recommendationPhase`·`reasonKey` | RECOMMENDED(Figma 조건부) | → `N6-09` ⓐ 철회 제안 |
| PLANNING Stage 6 Exit "difficulty-lowered fixture가 카드에 표시" | 초안 | → `PF6-1` 정정 제안 |
| `P5-BIP-03` (회고 → 추천 신호) | Stage 6 표시 | → `P6-BIP-04` 로 승계 + Mock 연쇄(AC-6-40) |
| `QA-5-005` | Low 이월 | → `N6-19` ⓐ |
| 🆕 Stage 2-B (`C13-09`·`C13-10` · `D-2` 시각 · `D-6`) | 디자이너 Figma 대기 | → **`D6-1` 해소** — design-agent 명세 · Stage 6 In Scope · 이관 AC 7건 승계(§11.12) |
| 🆕 `stage-2-designer-request.md` §5 Q1~Q7 | 디자이너 답변 대기 | → `N6-25` (design-agent 제안 · 체크포인트 확정). Q4 → `N6-11` · Q8~Q10 은 기존 화면 질문으로 유지 |
| 🆕 `D-20` 선택지 확정 이월 | Stage 6 | → `N6-27` |
| `OBS-5-5` · `OBS-5-7` | Stage 8 | 변화 없음 (기록) |
| 가값 `P-28` · `P-29` | 디자이너 대기 | 변화 없음. Stage 6 신규 가값은 `P-30` 부터 |

### 15.4 PRD 수정 대상 후보 (지금 고치지 않는다 — `D-24` 절차는 사용자 지시 시)

| # | 위치 | 현재 | 결정 시 수정 방향 |
|---|---|---|---|
| S6-1 | §6.1 IA 표 리포트 행 · §7.7 | 다이아몬드 현황 = Progress | `PF6-2` — Stage 7 결정 후 · 🆕 `163:2607` 색 차이(`N6-47`)도 같은 결정에서 — **Stage 7 Plan 대상** |
| S6-2 | §7.3 발전 역량 변경 | 축 탭만 서술 | ~~`PF6-3` — 설정 목록 경로 병기~~ → **축소 (`D6-8`, Spec §12)**: *"설정에서도 같은 화면(축 탭 + 선택 목록)으로 변경"* 병기만 |
| 🆕 S6-3 | §7.8 아이 프로필 수정 | "아이 프로필 수정" 에 관계 필드 포함 여부 불명 | `N6-39` (`D6-8`) — **보호자와의 관계는 아이 프로필이 아니라 보호자 정보**임을 명시 (선택 — 문구 명확화) |
| (참고) | PLANNING Stage 6 Exit *"difficulty-lowered fixture가 카드에 표시"* | PRD 아님 | `PF6-1` (`D6-8`) — plan-agent 가 §19.5 후속에서 *"difficulty-lowered fixture 의 카드(책·사유)가 표시"* 로 정정 |

---

## 16. C-13 대상 — Figma 에 없는 화면 (개정 1: **전부 ② design-agent 명세 — `D6-1` · `D6-2`**)

### 16.1 최종 목록

| ID | 화면 / 상태 | PRD 근거 | Figma 재사용 근거 | 소스 |
|---|---|---|---|---|
| 🆕 **`C13-09`** | **프로필 결과** `/onboarding/profile` + **재방문 모드** `/settings/profile`(`N6-21`) — 다이아몬드 · 안내 · 강점/growing edge · 페르소나 · null 변형 A/B/C · 상태 · **FR-15 업데이트 표시(구 `C13-S6-5`)** | FR-04·05·15 · §7.3 · `D-2` | 없음 (요청서 §2 가 요구 목록) | **② (`D6-1`)** — 디자이너 Figma 도착 시 재정렬 |
| 🆕 **`C13-10`** | **발전 역량 제시** `/onboarding/growth-capability` — 제시값 · 축 탭 · 대체 선택 목록 · `suggestedCapability: null` · 저장 중/실패 | FR-06 · §7.3 | 없음 (요청서 §3) | **② (`D6-1`)** |
| **`C13-S6-1`** | 설정 목록 확장 (행: 프로필(`N6-21`) · 아이 정보 · 설문 다시 하기 · 발전 역량 · 로그아웃 · 그룹 `N6-18`) | §7.8 · C-16 | 진입 `26:44` · Stage 2 목록 `C13-12` 명세 | **② (`D6-2`)** |
| **`C13-S6-2`** | 아이 정보 수정 `/settings/child` | §7.8 | Step 1 `248:1159` 입력 | **② (`D6-2`)** |
| **`C13-S6-3`** | 설문 재응답 진입 · 진행 · 이탈 복귀 · 제출 완료 | §7.8 · FR-03 | 카드 `179:1770` · 인트로 `179:1748`/`243:1147` | **② (`D6-2`)** |
| **`C13-S6-4`** | 발전 역량 변경 `/settings/growth-capability` — `N6-23` ⓐ 이면 **`C13-10` 의 설정 모드**로 흡수 | FR-06 · §7.8 | 없음 | **② (`D6-2`)** |
| ~~`C13-S6-5`~~ | ~~프로필·페르소나 업데이트 표시~~ | FR-15 | — | → **`C13-09` 에 포함 (`D6-1`)** |
| **`C13-S6-6`** | 공통 상태 — 저장 중 · 실패 · 오프라인 · 변경 이탈 확인 · Toast | #22 | — | **② (`D6-2`)** |

→ **8건**(`C13-09` · `C13-10` · `C13-S6-1`~`4` · `C13-S6-6`, `C13-S6-5` 흡수). 화면별 명세는 승인 체크포인트에서 확인 (`D6-2`).

<details><summary>초판 §16 원문 (보존)</summary>

| ID | 화면 / 상태 | 초판 권고 |
|---|---|---|
| `C13-S6-1`~`4` · `6` | 설정 목록 · 아이 정보 · 재응답 · 발전 역량 · 공통 상태 | ② |
| `C13-S6-5` | 업데이트 표시 | `C13-09` 귀속 — 6b 시 디자이너 요청서에 추가 요청 |

</details>

---

## 17. Handoff to design-agent (개정 1 — 새 범위)

1. **Figma 재확인 (선행)** — §0.1 의 "Stage 6 관련 프레임 0" 을 Spec 작성 직전 재조회로 확인. **특히 `C13-09`·`C13-10` 디자이너 프레임이 그 사이 들어왔는지** — 들어왔다면 명세가 아니라 **Figma 실측**으로 전환하고 보고(최우선 규칙). 막히면 추측 금지·보고(`R6-08`).
2. **입력 문서** — `docs/design/stage-2-designer-request.md` §2·§3·§4·§7 (요소·null 변형·상태·접근성·인터랙션·토큰·문구 톤)을 **요구 목록 그대로** 사용. §5 Q1~Q7 은 Spec 에 제안+근거로 답한다(`N6-25`).
3. **`C13-09` 프로필 결과** — 온보딩 모드 + 재방문 모드(`N6-21` ⓐ) 두 상태. 다이아몬드(축 순서 · 숫자 노출 · null 변형 A/B/C · 대체 텍스트 문장 · reduced-motion) · 강점/growing edge 위계(차이 작게) · 페르소나 카드(110~220자 말줄임 0 · fallback 무구분) · **FR-15 업데이트 표시**(`profileUpdatedAt` · `persona-changed` · `empty` 시 0, `N6-03` ⓐ) · Loading(`N6-22` — 페르소나 별도 로딩 없음) · Error · Offline.
4. **`C13-10` 발전 역량** — 축 탭(44×44) + 대체 선택 목록 · 제시값·사용자 변경 표시 · `suggestedCapability: null` · null 축 선택 가능(`N6-11`) · 저장 중/실패 · **설정 모드**(`N6-23` ⓐ — `C13-S6-4` 흡수) · 뒤로(`N6-24`).
5. **신규 Shared UI** — `CapabilityDiamondChart` · `PersonaCard`(또는 `Surface` 조합) 의 variant·state·props(도메인 비의존 — `packages/ui` 는 contracts import 금지) · Stage 7 오버레이 확장 여지만 기록(구현 아님).
6. **재사용 노드 실측** — `26:44` · `248:1159`(Step 1 입력 · Tag `140:3149`/`140:3154`) · `179:1770` · `179:1748`/`243:1147` · `179:1809`(saved — CTA 목적지만 바뀜, 시각 불변 확인) · Design Guide `78:156` · `17:122` · `244:1376` · 캐릭터 에셋 `163:2528`/`179:1819`/`221:1147`(페르소나 일러스트 후보, 신규 에셋 0). `R-FIGMA-1`: fill·그림자는 선언값으로.
7. **`C13-S6-1`~`3` · `6` 명세** — 행 구성·그룹 라벨(`N6-18`) · 재응답 진입 위치(`N6-13`) · 재응답 완료 → Toast + 재방문 프로필 화면(`N6-10` + `D6-1`) · 아이 정보 필드 = Step 1 전 필드(`N6-04`) · 선택지 = 현재 구현값(`N6-27` ⓐ) · 이탈 확인(`N6-14`).
8. **copy** — 프로필 인사(firstName 만) · "판정 아님" 안내 · 강점/growing edge 라벨 · 업데이트 표시 문구 · 발전 역량 제안·설명·"나중에 바꿀 수 있다" · 설정 행 · 수정·재응답·이탈 확인 · Toast · 오류. 진단·판정·비교 금지(`weak`·`lowest`·`below`·`score`·등급 포함 — 요청서 §7).
9. **토큰** — 차트 색은 `--color-capability-*-chart`(#19). 신규 필요 시 값과 함께 요청, 가값은 **`P-30` 부터**(번호 재배정 금지). 대비 미달(요청서 Q2·Q3)은 가값으로 등재.
10. **문서 갱신 후보** — `FIGMA_SCREEN_MAP.md`(`/onboarding/profile` · `/onboarding/growth-capability` · `/settings/*` · "프로필 업데이트 표시" 행 → `C13-09` 명세) · `COMPONENT_MAP.md`(`CapabilityDiamondChart` · `PersonaCard` · `ChildProfileEditor` 정정) · **`stage-2-designer-request.md` 머리에 "Stage 6 `D6-1` 로 design-agent 명세 선행, Figma 도착 시 대체" 표시**(`R6-01` ③).
11. **UI 영향 없음 확인** — `S6-A` 의 Home 카드(warm·난이도) 가 **카드 UI 변경 0** 임을 확인·기록 (`rules/workflow.md` §4) · `179:1809` saved 화면 시각 불변.

---

## 18. Frontend 단계에서 검증 불가 → `BACKEND_INTEGRATION_PENDING` 예상 요약

AC 2건 (AC-6-51 · 52) · Handoff ~~12건~~ **13건** (`P6-BIP-01`~`13`, §10 — `P6-BIP-12` 개정 1 추가, AC-6-52 대기 사유에 포함 · 🆕 `P6-BIP-13` 개정 3 추가 — AC-6-26 ④ 실제 전달분, AC-6-26 의 Frontend 부분 ①~④ 는 별도 판정). 대상 문서: `BACKEND_HANDOFF` · `DATA_REQUIREMENTS` · `AUTH_REQUIREMENTS` · `ANALYSIS_PIPELINE_REQUIREMENTS`.

---

## 19. 승인 체크포인트 결정 목록 (개정 1)

### 19.1 이미 결정됨 (`docs/decisions/stage-6-approvals.md`)

| ID | 내용 |
|---|---|
| `D6-1` | 분할 안 함 · `C13-09`·`C13-10` design-agent 명세로 Stage 6 편입 · FR-15 표시 = `C13-09` |
| `D6-2` | C-13 전부 design-agent 명세 (§16.1 8건) |
| `D6-3` | `N6-02`~`N6-20` 권고안 채택 (6b 전제는 `D6-1` 우선) |

PRD ↔ Figma: `PF6-1`(난이도 표시 요소 0) · `PF6-2`(Stage 7 기록) · `PF6-3`(두 경로 공존) — 권고 = Figma. **아직 사용자 명시 확인 없음** → 체크포인트에서 함께 확인.

### 19.2 ~~⛔ design 착수 전 필요 (개정 1 신규)~~ → ✅ `D6-4`~`D6-6` 로 해소 (개정 2). Spec 결정 `N6-28`~`N6-48` · `PF6-1`~`3` · `M6-1`~`M6-5` 는 `D6-8` 로 채택

| ID | 권고 |
|---|---|
| `N6-21` | ⓐ 설정 행 → `/settings/profile` 재방문 |
| `N6-22` | ⓐ 두 모드 모두 `GET /profile` |
| `N6-23` | ⓐ 온보딩·설정 발전 역량 = 같은 컴포넌트 2모드 |

### 19.3 비차단 (권고안으로 착수, 체크포인트 확인)

`N6-24` ⓐ · `N6-25`(design-agent 제안 → 체크포인트 확정, **구현 차단**) · `N6-26` ⓐ · `N6-27` ⓐ.

### 19.4 승인 체크포인트 (Design Spec 작성 후)

`stage-6-plan.md` + `stage-6-design-spec.md` 요약 보고 → 사용자 승인 → development-agent. 체크포인트에서 확인할 것: §16.1 화면별 명세 8건 · `N6-25` 제안 · `PF6-1`~`3`.

### 19.5 승인 후 plan-agent 후속

1. `API_CONTRACTS.md` **Rev 10** — §7 C-1~C-11 + §5.4 시나리오 등재 + Stage 6 절 갱신(`recommendationPhase`·`reasonKey` 철회) + "설정 진입점" 표 Stage 6 행 + Stage 2 표 `ProfileResult`/`ChildProfile` 사용처(`N6-22`).
2. `DATA_MODEL.md` §6·§10 (§6 delta) · `ARCHITECTURE.md` (필요 시).
3. `PLANNING.md` Stage 6 절 — Exit 문구(`PF6-1`) · Mock scenarios · Blocking decisions · 범위(Stage 2-B 편입) · Stage 2 절의 2-B 표기.
4. `WORKFLOW_STATE.md` Stage 2-B 행 → Stage 6 편입 표시 (Orchestrator).
5. 이 문서 `Status: APPROVED (YYYY-MM-DD, user)`.

<details><summary>초판 §19.2 원문 (보존)</summary>

전체 범위 `N6-01` ①(6a/6b 분할) + 디자이너 ETA 확인 → **`D6-1` 로 미채택**. 단위별 차단 결정(`N6-04`·`05`·`08`·`09`·`11`·`12` / `C13-S6-1`·`2`·`6` · `N6-14` / `C13-S6-3` · `N6-06`·`07`·`10` / `C13-S6-4` · `N6-02` / `N6-03`) → **`D6-2` · `D6-3` 로 해소**.

</details>
