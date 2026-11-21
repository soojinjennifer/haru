# Stage 8 Plan — Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능 + Mock 웹 프리뷰 + Backend Handoff Package

Status: **APPROVED (2026-11-20, user)** — `D8-1` (`docs/decisions/stage-8-approvals.md`). **rev 2** (2026-11-20, plan-agent) = 승인 결정 반영 + Spec `M8-1`~`M8-6` 정합화 — **승인 범위 안의 정합화**이며 새 범위를 더하지 않는다. **rev 2.3** (2026-11-21, plan-agent) = `H8-6` · `H8-7` 보고와 `D8-3` 결정에 따른 **사실 정정** — 범위 · AC 기준 변경 0, Status 유지.

Based on:
- PRD **v1.5 개정 3 + 보완** (`docs/source/HARU_PRD_v1.5.md`) — §6.1 IA 설정 행 · §6.2 화면 맵 · **§7.8 설정** (계정·구독 / 데이터 관리) · §9 요금제(베타 무료) · **FR-21** · FR-02 · FR-25 · §11 NFR(프라이버시·보안·접근성·오프라인) · §12.1 · §13
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` page `16:2` — 초판 시점 라이브 조회 불가 → **design-agent 가 2026-11-20 라이브 실측으로 해소** (`docs/design/stage-8-design-spec.md` §0 — Stage 8 대상 디자이너 프레임 0, `N8-30` 닫음)
- Design Spec `docs/design/stage-8-design-spec.md` (APPROVED `D8-1`) — §2 C-13 9건 · §7 Mock 요청 · §8 반응형 감사 · §12.1 `M8-1`~`M8-6` · §12.2 `Q8-01`~`Q8-21`
- 결정 기록: `stage-0-approvals.md` (**C-4 · C-13 · C-15 · C-16 · C-18 · C-19** · #12 · #22 · #24 · #25 · D-01~D-04 · P-01~P-16 · L-01~L-07) · `stage-2-approvals.md` (L-02 launch blocker) · `stage-3-approvals.md` (D-17 Mock 전용 route · D-18 알림 설정 · §14.4 표지) · `stage-4-approvals.md` (D4-1 · D4-12/13 · D4-29 · D4-40) · `stage-6-approvals.md` (D6-9 · **D6-10 ④**) · `stage-7-approvals.md` (D7-7 · **D7-8**)
- QA 리포트: `stage-2-rework-qa-report.md` (**QA-2R-004**) · `stage-3-qa-report.md` (QA-3-003 · P3-BIP-19 게이트) · `stage-4a-qa-report.md` (O-2) · `stage-4b-qa-report.md` (OBS-4B-3 · NV-4B-*) · `stage-5-qa-report.md` (§6 QA-5-003/004 절차 · OBS-5-5/5-7) · `stage-6-qa-report.md` (§11 · QA-6-005 · VG6-H-09 · VG6-H-06 · VG6-D-12 · v2-material) · `stage-7-qa-report.md` (§6 QA-7-002/003/004 절차 · §7 PENDING · OAuth 메모)
- `docs/workflow/WORKFLOW_STATE.md` §3 미결 항목 (S1-G-7 · S8-DEPLOY-1/2 · S4-FIX-1 · S4-C-1 · S4-E-1 · S4B-F1-OPEN · S3-ROUTE-1 · S3-PROV-* · S4-PROV-1 등)
- 문서: `PLANNING.md` "### Stage 8" · `docs/API_CONTRACTS.md` (§1.2 · §4 Stage 8 표 · §5.4 `deletion-*` key) · `docs/DATA_MODEL.md` §12 · `docs/FIGMA_SCREEN_MAP.md` (설정 행) · `docs/design/stage-6-figma-draft.md`
- 코드(읽기만): `packages/contracts/src/enums/deletion.ts` · `sessions/list.ts` · `sessions/session.ts` · `recordings/status.ts` · `common/error-codes.ts` · `apps/web/src/features/settings/{copy.ts,model/menuRows.ts,model/useSignOut.ts}` · `shared/lib/return-path.ts` · `app/router.tsx` · `apps/web/vite.config.ts`(`sourcemap: true`) · `scripts/assert-no-mocks.mjs` · `package.json` scripts
- 외부 문서 (2026-11-20 조회): Render Docs *Redirects and Rewrites* (`/*` → `/index.html` Rewrite) · Render 커뮤니티/블로그 (Static Site 인증 미지원 · PageCrypt 우회) · Cloudflare Access 무료 50석(공식 출시 글 인용 — 공식 가격 페이지 재확인 필요)
- 외부 문서 (rev 2, 2026-11-20 조회 — `N8-11` ⓑ 확정에 따른 확인):
  - Cloudflare Pages *Serving Pages* (`developers.cloudflare.com/pages/configuration/serving-pages/`) — 최상위 `404.html` 이 없으면 *"Pages assumes that you are deploying a single-page application"* → 정적 자산과 맞지 않는 경로에 `/` 를 제공 (SPA fallback 별도 설정 불필요)
  - Cloudflare Pages *Preview deployments* (`…/pages/configuration/preview-deployments/`) — 프로젝트의 *Enable access policy* 는 **preview 배포만** 보호하고 *"not your `*.pages.dev` domain or custom domain"*
  - Cloudflare Pages *Known issues* (`…/pages/platform/known-issues/`) — `*.pages.dev` 본 도메인까지 Access 로 보호하는 절차(Access 앱의 Subdomain 와일드카드 제거 → access policy 재활성 → 정책 2개 확인)
  - Zero Trust 무료 플랜 인원 상한은 공식 가격 페이지에서 **확인하지 못했다** — 사용자가 Access 설정 시 대시보드에서 확인 (`S8-I-U`)

Author: plan-agent (2026-11-20)

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 초판 | 2026-11-20 | Stage 8 범위 · 이월 장부(§2.3) · C-13 화면 9건 · contract 변경 `C8-1`~`C8-9` · Mock key · AC-8-01~92 · 결정 `N8-01`~`N8-30` · 작업 단위 `S8-0`~`S8-K` · 수동 점검 절차(§12.3) · Handoff 6종 초안 생성 |
| **rev 2** | 2026-11-20 | **승인 범위 안의 정합화** (`D8-1` 적용 범위 마지막 줄 *"Spec `M8-1`~`M8-6` 은 Plan rev 2 에서 반영한다"*). ① `N8-01`~`N8-29` 전부 `CONFIRMED (D8-1)` + 채택안 기록, `N8-30` 닫음(design-agent 라이브 실측) ② `M8-1` → contract **`C8-10` `Caregiver.email`** 추가 (§7 · AC-8-33 · **AC-8-93** · `S8-A`) ③ `M8-2` → draft 삭제 위치 = `Q8-12` ⓓ Trial 안내(C13-11) 아래 TextLink (§2.1 · §9 · AC-8-37·38) ④ `M8-3` → 녹음 행 상태 = **meta 텍스트**, Tag 0 (AC-8-19·25) ⑤ `M8-4` → Mock fixture 보강 (§8 · **AC-8-94**) ⑥ `M8-5` → §0.1 · §4 · R8-11 정리 ⑦ `M8-6` → 가로 웹 852×393 · Text spacing 감사 (**AC-8-95** · **AC-8-96**) ⑧ `N8-06` ⓑ 로 동의 이력 UI 제외 → AC-8-39 를 "미구현 확인" 으로 재정의 ⑨ 작업 단위에 **`S8-I-U`(사용자 — Cloudflare 계정 · Pages 배포 · Access 설정)** 분리, Agent 계정 생성 0 ⑩ `S8-J` 에 `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` **생성·완성 = development-agent** 명시 ⑪ `API_CONTRACTS.md` **Rev 12** 등재(`C8-1`~`C8-10` · `ACCOUNT_DELETION_PENDING`). AC 수 92 → **96** |
| rev 2.2 | 2026-11-20 | `S8-A`~`S8-C` Visual Gap(`stage-8-visual-gap.md`) 반영. **문구 정합화(범위 변경 0)**: ① §8 `success` — `recordingsCount` = 삭제 가능한 녹음 수(`VG8-A-04`, 8 → 6) ② §5.3 "(재시도 버튼)" 삭제 — 요청 실패 · 오프라인 알림 action 0(`VG8-C-04`) ③ 폴링 상한 5s × 60 = **가값 `P-42`** 등재(`VG8-C-10` — Verdict 시 사용자 확정). **신규 결정 `N8-31`** (`VG8-C-11` High · privacy — 화면 밖 · 상한 후 완료 시 로컬 정리 0): 옵션표 · 권고 ⓐ(요청 id 기기 표시 + 앱 조립 지점 감시, §5.7) · **NEEDS DECISION**. AC-8-97~99 추가(96 → **99**, PENDING 1 — AC-8-98 서버 부분) · `S8-F` 배정 · Mock key `deletion-completed-offscreen` · R8-15 |
| rev 2.1 | 2026-11-20 | `S8-0` — **부록 B `N8-21` 처분표** 추가 (닫음 37 · 수정 9 · Handoff 5 · 출시 전 7). 범위 변경 0. 확인된 사실: `S2-CONSENT-1` 은 커밋 `20f6a26` 에서 이미 구현 → `S8-F` 의 `N8-26` ⓐ 는 검증만 · `S3-ROUTE-1` Mock 전용 route 0 · `S3-PROV-2` 잔여 6건(`P-19`·`21`·`26`~`29`) → `S8-G`. 신규 사용자 결정 1건 = B.2-① 로그아웃 다이얼로그 미업로드 녹음 안내 |
| rev 2.3 | 2026-11-21 | **사실 정정 (범위 · AC 기준 변경 0, APPROVED 유지)** — 근거 `stage-8-handoff.md` H8-6 · H8-7 · `stage-8-approvals.md` D8-2 · D8-3. ① 상용 표지 **4종 → 3종** (저장소 실제 에셋 3개 — `H8-7-N1`; *After the Fall* 표지는 저장소에 없었음) — §2.3 · AC-8-67 · `S8-I` · `N8-13` ② 부록 B.2-④ 가값 등재 상태 정정 (`H8-6-N7`): 등재돼 있던 것은 `P-23` 뿐 · `P-20` 확정 · `P-18` · `P-22` 미등재 → `D8-3` 에 따라 Final QA 가값 재제시에 포함 (§2.3 · 부록 B.3-5) ③ `D8-3` 결정을 §11.11 접근성 AC 에 **반영 표기**(§11.11.1 — 기준 문구 불변): `P-43` 신규 가값 · TextLink 터치 확장 opt-in · 리포트 카드 `aria-label` 제거 · 녹음 버튼 이름 · 회고 입력칸 40 예외 · `H8-6-N5` 조건부 허용 → QA 대체 경로 대조표 · 196 폭 뒤집기 버튼 수정 · px 타입 토큰 기록 ④ §12.5 Final QA 확인 항목 신설 + Risk R8-16~18 (`H8-7-N3` 상용 표지 원본 git 이력 잔존 · `H8-7-N4` 실제 책 제목·저자 = `P3-BIP-19` 법무 · `H8-7.3` 프리뷰 빌드의 `sessionStorage['haru:scenario']` 계층) ⑤ `D8-2` 동기화: `N8-31` = **CONFIRMED (D8-2) ⓐ** · `P-42` = 가값 유지(Final QA 재제시) |

---

## 0. 출발점 — 무엇이 이미 있고 무엇이 없는가

| 영역 | 현재 (HEAD `186b396`, Stage 7 PASS) | Stage 8 에서 |
|---|---|---|
| 설정 목록 | `YOUR CHILD` 4행 + `ACCOUNT` 로그아웃 1행 (`features/settings`, Spec `C13-S6-1`) | `ACCOUNT` 그룹에 데이터 관리 · 계정(탈퇴) 행 추가 (C-16) |
| 데이터 관리 · 탈퇴 화면 | **0** — route · page · feature 없음 | 신규 (C-15) |
| 삭제 contract | `DeletionScope` · `DeletionRequestStatus` enum 만 (`enums/deletion.ts`). `DataManagementSummary` · `DeletionRequest` · `CreateDeletionRequest` · `DeleteAccount` · `ConsentHistory` schema **없음**. API Client · Mock **없음** | 신설 (§7) |
| 세션 목록 | `sessionApi.list` contract(`GET /v1/children/:childId/sessions`) 존재 · **화면 0** · 항목(`SessionSummary`)에 **녹음 상태 없음** | 세션별 녹음 삭제 목록 + `D4-40` 빈 상태 (§7 `C8-2`) |
| 로컬 정리 | `useSignOut` → `performSessionCleanup` (draft · 카드 캐시 · 로컬 녹음 · Query 캐시) | 전체 삭제 · 탈퇴에서 재사용 + 미가입 기기 draft 삭제 경로(`QA-2R-004`) |
| 프리뷰 빌드 | `VITE_API_MODE=mock pnpm build` 성공 기록(S8-DEPLOY-1) · `vite.config.ts` `sourcemap: true` | 프리뷰 빌드에서 sourcemap 끔(`S1-G-7` 결정) · SPA fallback · 배포 |
| 접근성 자동 감사 | `e2e/a11y.spec.ts` (gallery 기반 키보드·focus·44) · **axe 등 규칙 엔진 없음** | 전 route 감사 (`N8-18`) |
| Handoff 문서 | **0종** (API_CONTRACTS 만 존재) | 6종 초안(이 Plan 과 함께 생성) → development-agent 완성 → QA 검증 |

### 0.1 Figma 조회 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 조회했는가)

| 조회 | 방법 | 결과 |
|---|---|---|
| 라이브 조회 | Figma MCP | ⚠️ **불가** — 이 세션의 Figma MCP 서버(`plugin:product-management:figma`)가 인증 대기 상태다. `get_metadata` · `get_screenshot` 를 실행하지 못했다. **라이브 실측은 NOT VERIFIED** |
| 최근 라이브 기록 | `docs/plans/stage-7-plan.md` §0.1 (2026-11-19, `get_metadata(16:2)` 최상위 프레임 전수) | `16:2` 최상위에 데이터 관리 · 계정 · 탈퇴 · 삭제 · 동의 이력 프레임 **0**. 리포트 외 새 프레임 없음. Stage 6 DRAFT Section `317:1358` 은 프로필·설정만 |
| Stage 6 DRAFT | `docs/design/stage-6-figma-draft.md` | `321:1537` *"C13-S6-1 Settings — list (YOUR CHILD 4 rows · ACCOUNT log out)"* — **design-agent 명세의 시각화이며 디자이너 프레임이 아니다.** 데이터 관리 · 탈퇴 행 없음 |
| Screen map | `docs/FIGMA_SCREEN_MAP.md` 설정 행 | `/settings/account` · `/settings/privacy` · `/settings/data` = **Figma 누락** (진입 아이콘 `26:44` 만). 공통 상태 = #22 명세 |
| Design Guide `8:2` | Stage 7 기록 재사용 | 데이터 관리용 전용 컴포넌트 없음. 재사용 후보 = ListGroup · ListRow · ConfirmDialog(#22) · InlineAlert · Toast · Tag(status) |

**결론 (기록 기준)**: Stage 8 의 신규 화면은 **전부 C-13 대상**이다 (§16). ⛔ design-agent 는 Spec 작성 전에 **라이브로 `16:2` 최상위 프레임을 다시 조회**해 2026-11-19 이후 디자이너 프레임이 추가되지 않았는지 확인해야 한다 (Figma 인증 복구 필요 — `N8-30`).

> ✅ **rev 2 — 해소 (`M8-5`)**: design-agent 가 2026-11-20 라이브 조회(5페이지 `get_metadata` 전체 XML + 키워드 grep)로 **Stage 8 대상 디자이너 프레임 0** 을 확인했다 (`stage-8-design-spec.md` §0.1 · §0.2). 위 표의 "라이브 실측 NOT VERIFIED" 는 그 절로 대체된다. 함께 정정된 사실: ① `Tag` 에 status tone 이 없다(`76:440` — `M8-3`) → 녹음 행 상태는 meta 텍스트 ② `/onboarding/saved` = Figma `179:1809` "1e · Baseline saved" 이며 제출 **후** 화면이다(`M8-2`).

---

## 1. Goal

1. **이월 기능 구현 (C-15)** — FR-21 데이터 관리(보관 정책 안내 · 세션별 녹음 삭제 · 전체 데이터 삭제 요청 · 진행 상태)와 탈퇴를 Mock 위에서 완성하고, 미가입 기기에 남은 아이 정보 삭제 경로(`QA-2R-004`)를 만든다. 동의 이력 보기(C-19 선택)는 **제외** (`N8-06` ⓑ).
2. **Frontend Final QA** — 전 Stage 회귀 · WCAG AA 감사 · 반응형(320 / 393 / 600 / 1024 + 텍스트 200% + reduced-motion) · Privacy Frontend 항목 최종 확인 · 이월된 실기기 · 스크린리더 수동 점검(`QA-5-003/004` · `QA-6-005` · `QA-7-002/003/004`) 실행.
3. **Mock 데모 웹 프리뷰 정적 배포 (C-18)** — Mock 모드만, Secret · 실제 아동 데이터 없음, sourcemap 미배포. 호스트 = Cloudflare Pages + Cloudflare Access (`N8-11` ⓑ) — 저장소 설정은 development-agent, 계정 · 배포 · Access 는 사용자. 앱 테스트 빌드 · Backend 배포 제외.
4. **Backend Handoff Package 7종** — 전 Stage `BACKEND_INTEGRATION_PENDING` 1:1 집계 + `packages/contracts` 최종 검증.
5. **STOP** — Backend implementation · Supabase migration · Node API · STT · AI Analysis · Render Backend deployment 를 시작하지 않고 사용자 승인을 기다린다.

---

## 2. In Scope (요구사항 ID별, Frontend 부분)

### 2.1 이월 기능 (C-15 · C-16 · C-19)

| ID | Frontend 부분 | 근거 |
|---|---|---|
| **FR-21** 보관 정책 안내 | 서버가 준 보관 일수(`retentionPolicy.rawAudioDays`)로 문장 표시 — **90 을 화면에 하드코딩하지 않는다**. 전사·지표 유지 사실 안내(`N8-03`) | PRD §7.8 · NFR 프라이버시 · DATA_MODEL §12.1 |
| **FR-21** 세션별 녹음 삭제 | 녹음이 있는 세션 목록(cursor) · 행 삭제 → ConfirmDialog → `DELETE /v1/sessions/:sessionId/recording` (IK) → 행 상태 갱신 · 로컬 미업로드 녹음이 있으면 **서버 확정 응답 후** 로컬 삭제 + 업로드 큐 취소 (`rules/architecture.md` §7) · 행 상태 = **meta 텍스트** 5종(*Saved* · *Uploading* · *Not uploaded yet* · *Removed after {n} days* · *Deleted*) — Tag 0 (`M8-3` · `Q8-05` ⓐ) · expired·deleted 행은 목록에 남고 삭제 버튼 0(`Q8-07` ⓐ) · 빈 상태(`D4-40` AC-4-23 화면 부분 이월) | FR-21 · `D4-40` · `N7-09` |
| **FR-21** 전체 데이터 삭제 요청 | 영향 안내 → ConfirmDialog → `POST /v1/data-deletion-requests` (IK) → 진행 상태(`received` / `processing` / `completed` / `failed`) 표시 · 이미 요청됨(`DELETION_ALREADY_REQUESTED`) · 완료 후 앱 상태(`N8-10` ⓐ — 완료까지 진행 표시 → 로컬 정리 → Guard 가 온보딩으로) · 로컬 정리 | FR-21 · NFR "보호자 요청 시 즉시 삭제" |
| **§7.8 탈퇴** | 계정 화면 · 탈퇴 안내 → ConfirmDialog → `DELETE /v1/me` (IK) → 로컬 정리 + 세션 종료 → `/auth/welcome`(replace) + Toast 1회 (`N8-10` 탈퇴 ⓐ · `Q8-11` ⓐ) | PRD §7.8 · `N8-02` ⓐ |
| §7.8 계정·구독 | 계정 화면에 보호자 이메일 표시(읽기 — **`Me.caregiver.email`, 신규 contract `C8-10`**, `M8-1` · `Q8-10` ⓐ). **요금제 미표시** (`N8-05` ⓐ — FR-26 P2 · §9 베타 무료) | PRD §7.8 · §9 |
| **QA-2R-004** | 미가입(Trial) 기기의 로컬 온보딩 draft("이 기기에 저장된 입력") 삭제 경로 1곳 + 확인 — **위치 = 온보딩 Trial 안내(C13-11, `/onboarding` intro · Step 1) 바로 아래 TextLink** (`N8-07` → `Q8-12` ⓓ, Figma 디자이너 프레임 변경 0) | `stage-2-rework-qa-report.md` QA-2R-004 · `rules/architecture.md` §9 |
| C-16 설정 목록 | `ACCOUNT` 그룹 확장 — 행 순서 *Data & privacy* · *Account* · *Log out* (`Q8-02` ⓐ) — 행 구성은 route config(`menuRows.ts` 패턴) | C-16 |
| ~~C-19 동의 이력 (선택)~~ | **제외** (`N8-06` ⓑ · `Q8-20`) — 화면 · route · API Client 0. `GET /v1/consents` 는 Handoff 요구(`C8-6` · `P8-BIP-08`)로만 남긴다. 철회 UI 없음(C-4) | C-19 (미구현 시 FAIL 아님) |

### 2.2 Final QA · 접근성 · 반응형 · 회귀

| 영역 | Frontend 부분 |
|---|---|
| 전체 회귀 | `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries` · `test` · `build` · `format:check` · `test:e2e`(단독 실행) · `assert:no-mocks`(http 빌드) — 전부 0 |
| Mock 시나리오 회귀 | Stage 1–7 의 `API_CONTRACTS.md` §5.4 key 전부 + Stage 8 신규 key — contracts parse 테스트 · 결정성 |
| 접근성 (NFR · WCAG AA) | 전 route 자동 감사(`N8-18`) · 키보드 순회 · focus 표시 · Dialog/Sheet focus 이동·복귀 · 접근성 이름 · live region 1회 낭독 · 터치 타깃 44 · 텍스트 200% (WCAG 1.4.4) · reflow 320 (1.4.10) · `prefers-reduced-motion`. 대비는 `D-01` 수용 예외와 가값 `P-xx` 장부 기준으로 판정·기록 |
| 반응형 (FR-25) | 전 route × 320 / 393 / 600 / 1024 — 가로 넘침 0(클래식 스크롤바 포함) · 600 이상 480 앱 컬럼 가운데 · 그림자 클립 0(`R-SHADOW-1`) |
| Privacy (Frontend 검증 가능) | 동의 전 아동 데이터 미전송 · 동의 없음 녹음 차단 · 로그아웃·삭제·탈퇴 시 로컬 정리 · 로그 PII 0 · 광고/제3자 SDK 0 · 번들·`VITE_*`·저장소 Secret 0 — **프리뷰 산출물 포함** |
| 실기기 · SR 수동 점검 | 수용 이월 항목 확인 (§12.3 절차) — `QA-5-003` · `QA-5-004` · `QA-6-005` · `QA-7-002` · `QA-7-003` · `QA-7-004` + `S1-D2-3` · `S4-E-1` ① · `OBS-4B-10` 관찰 |

### 2.3 이월 · 미결 항목 장부 (사용자 지시 필수 포함분 + WORKFLOW_STATE)

| 항목 | 출처 | Stage 8 처리 | 단위 |
|---|---|---|---|
| **`QA-6-005`** 스크린리더 (AC-6-46) | `D6-10` ④ | §12.3-B 절차로 수동 확인 — 사용자 실행 | `S8-M` |
| **`QA-7-002`** iOS Safari 공유·저장 + 첫 탭 오디오 (AC-7-62) | `D7-8` ① | §12.3-C | `S8-M` |
| **`QA-7-003`** 실시간 재생 진행 (AC-7-49b) | `D7-8` ① | §12.3-D (headed Chrome · Safari — 자동화 일부 가능) | `S8-M` |
| **`QA-7-004`** VoiceOver (AC-7-68) | `D7-8` ① | §12.3-B 와 같은 세션 | `S8-M` |
| `QA-5-003` · `QA-5-004` | Stage 5 §11 | §12.3-A · B (Stage 5 리포트 §6 절차 재사용) | `S8-M` |
| **`VG6-H-09`** 섹션 라벨 행 리듬 A / B / C | `stage-6-visual-gap.md` §1.1 | `N8-15` = **A + ⓑ-1** (실측 실패 시 ⓑ-2), 범위에 SettingsMenu · Stage 8 화면 포함 (`Q8-15`) → 공통 recipe 구현 + baseline 재생성(R-BASELINE-1 §5) | `S8-F` |
| **`VG6-H-06`** `Text tracking` prop 수용 | 같은 문서 | `N8-16` = **수용**(조건 3) — 코드 변경 0, Shared UI API 로 등재 | `S8-F` |
| **`VG6-D-12`** in-app 기록 없을 때 Back 목적지 | `stage-6-visual-gap.md` · `N7-23` · `D7-7` | `N8-14` 앱 전체 규칙(Back 부모 표 = Spec §6.3, `Q8-17`) → **프리뷰 배포 전** 구현 | `S8-F` |
| **`v2-material`** 드리프트 원인 | `stage-6-qa-report.md` H6-9.10 · `stage-7-qa-report.md` | `N8-17` — 원인 분해(R-BASELINE-1 §5·6) 후 재생성 또는 보고 | `S8-H` |
| **`S4-FIX-1`** stage-3 QA 리포트 `:6` 스테일 경고문 | WORKFLOW_STATE | stage-qa-agent 문서 정정 (Product Code 아님) | `S8-0` |
| `S4-C-1` ② / `O-2` / `RU-8` `recordingApi.status` endpoint 가 `API_CONTRACTS` §4 표에 없음 | 4a QA | `C8-8` — 문서 등재(`GET /v1/recordings/:recordingId`) | `S8-0`(plan) · `S8-J` |
| `S4-C-1` ① ③ ④ · `S4-E-1` ②~⑦ · `S4B-F1-OPEN` ①②③⑤ · `S4-FIGMA-1` | WORKFLOW_STATE | **스테일 여부 확인 후 닫기** — Stage 4b `PASS` 이후 처리됐을 가능성이 높다. 남은 것만 `N8-21` 로 처분 | `S8-0` |
| `S4B-F1-OPEN` ④ 시간 목록 시트 열 때 focus 가 body 로 떨어짐 (접근성 결함) | WORKFLOW_STATE | 재현 확인 → 남아 있으면 `S8-G` 수정 대상 | `S8-G` |
| **실제 OAuth 전체 페이지 리다이렉트 시 복귀 경로 유실** | `stage-7-qa-report.md` §7 메모 · `return-path.ts` 주석 | Frontend 변경 0 (Mock). `AUTH_REQUIREMENTS.md` AR 항목 **`P8-BIP-05`** 로 등록 — 서버 redirect 허용 목록 = `toSafeReturnPath` 규칙 | `S8-J` |
| **PDF signed URL CORS GET 요구** | `stage-7-handoff.md` 13 · H7-6.9 | Frontend 변경 0. `BACKEND_HANDOFF.md` PDF 절 **`P8-BIP-06`** — signed URL 응답이 앱 origin 의 `fetch` GET 을 CORS 로 허용 | `S8-J` |
| `S1-G-7` 프리뷰 sourcemap 끔 | WORKFLOW_STATE (2026-10-03 방침 결정) | 프리뷰 빌드에서만 `sourcemap: false` — 로컬·CI 유지 | `S8-I` |
| `S8-DEPLOY-1` · `S8-DEPLOY-2` | WORKFLOW_STATE | `N8-11` = **ⓑ Cloudflare Pages + Cloudflare Access** — 설정 파일은 development-agent, 계정 · 배포 · Access 는 **사용자** | `S8-I` · `S8-I-U` |
| `QA-3-003` 에셋 파이프라인 · `P3-BIP-19` 상용 그림책 표지 | Stage 3 게이트 | `N8-13` = **ⓐ** 상용 표지 **3종**(rev 2.3 정정 — 저장소 실제 3개, `H8-7-N1`) 중립 대체 + 파이프라인 — 프리뷰 배포 **전** 처리 | `S8-I` |
| `S3-ROUTE-1` (`D-17`) Mock 전용 route 제거 대상 | WORKFLOW_STATE | 현재 코드에 `mockPreviewRoutes` 파일이 **없다**(grep 0) — 시트가 `LibraryShelves` 안에서 열리도록 바뀐 것으로 보인다. `S8-0` 에서 확인 후 `BACKEND_HANDOFF` "제거 대상" 절에 결과 기록 | `S8-0` · `S8-J` |
| `OBS-5-7` 온보딩 fixture 이름 `Nova` 혼재 | Stage 5 | 프리뷰 전 fixture 이름 일관화 (Mock 전용, 화면 코드 0) | `S8-A` |
| `L-02` 약관·개인정보방침 실제 URL 없음 | `stage-2-approvals.md` | 프리뷰는 Mock URL 유지. `BACKEND_HANDOFF.md` **출시 전 차단 항목** 등재 | `S8-J` |
| `S2-CONSENT-1` `signup_oauth` 미구분 | WORKFLOW_STATE | `N8-26` = **ⓐ** `consentSourceFor()` 1함수 수정 | `S8-F` |
| `S3-NOTIF-1` 알림 설정 화면 (`D-18` 디자이너 대기) | WORKFLOW_STATE | `N8-23` = **ⓐ 제외** — Frontend Complete 예외 목록에 명시 (AC-8-87) | `S8-K` |
| 가값 재제시 (`S4-PROV-1` · `S3-PROV-1/2` · `P-01`~`P-43` 잔여 — `P-18` · `P-22` 포함(`D8-3`), `P-20` 은 확정으로 제외 · `P-42` 가값 유지(`D8-2`) · `P-43` 신규(`D8-3`) — rev 2.3) | Stage 0 #10-4 | `N8-20` — Final QA 리포트에 남은 가값 목록 기록 + Orchestrator 항목별 재제시 | `S8-K` |
| P2-BIP ID 충돌 (`P2-BIP-12`~`16` 두 벌) | `stage-2-handoff.md` §4 ↔ `stage-2-rework-handoff.md` | `N8-22` — 접미사로 구분, 재번호 금지 | `S8-J` |
| `P4B-BIP-01`·`04`·`05` `API_CONTRACTS` 미등재 (`OBS-4B-3`) | 4b QA | Handoff 장부에 등재(초안 반영 완료) | `S8-J` |

---

## 3. Out of Scope

| 항목 | 이유 |
|---|---|
| Backend 구현 일체 (Express API · Supabase migration · RLS · Storage 서버 로직 · 삭제 파이프라인 · Retention Cron · STT · AI · Worker · Render **Backend** 배포) | Frontend-only (CLAUDE.md) · `rules/backend.md` §1 |
| 동의 철회 UI · contract | C-4 (법무 L-03) |
| 앱 테스트 빌드 (TestFlight · Play) · `apps/mobile` · 네이티브 Adapter | C-18 · `D4-1` (후속 단계 `S4N-*`) |
| 구독 결제(IAP) · 플랜 변경 | FR-26 P2 |
| 데이터 내보내기(export) | PRD 요구 없음 (DATA_MODEL `data_export?` 는 후보 표기) |
| 알림 설정 화면 `/settings/notifications` | `D-18` 디자이너 대기 — **`N8-23` ⓐ 제외 확정 (`D8-1`)**, Frontend Complete 예외 목록에 명시 |
| 동의 이력 보기 `/settings/privacy` | **`N8-06` ⓑ 제외 확정 (`D8-1`)** — C-19 선택 기능. contract 요구(`C8-6`)는 Handoff 로만 |
| 프리뷰 호스트 계정 생성 · Cloudflare Access 설정 · 배포 실행 | **사용자 수행** (`D8-1`) — Agent 는 외부 계정을 만들거나 배포하지 않는다 (`S8-I-U`) |
| Stage 8 이후 작업 | Stage 8 완료 후 STOP |
| 다국어 · 다중 아동 · TTS | FR-27~29 P2 |

---

## 4. Dependencies

| 의존 | 상태 | 영향 |
|---|---|---|
| Stage 1–7 `PASS` | ✅ (Stage 7 `PASS (accepted: QA-7-002, QA-7-003, QA-7-004)`, 커밋 `186b396`) | — |
| Figma 라이브 조회 | ✅ 해소 — design-agent 2026-11-20 라이브 실측 (`N8-30` 닫음, `M8-5`) | — |
| C-13 화면 소스 결정 | ✅ `N8-01` ② 전부 design-agent 명세 + 디자이너 요청서 병행 (`Q8-01` · `Q8-21`) | — |
| 탈퇴 범위 · 삭제 후 앱 상태 | ✅ `N8-02` ⓐ 분리 · `N8-10` 전체 삭제 ⓐ · 탈퇴 ⓐ | contract(`C8-4` `scope='account'`) · 화면 흐름 |
| 계정 화면 이메일 contract | ✅ `Q8-10` ⓐ → `C8-10` | `S8-A` 에서 구현해야 `S8-D` 착수 가능 |
| 법무 입력 | L-01 · L-02 · L-03 · L-05 · L-06 · L-07 · OAQ-13 · OAQ-14 · 삭제 SLA | Frontend 문구는 수치 없이(`N8-04`), 요구는 Handoff NEEDS DECISION 으로 기록 |
| 실기기 · 스크린리더 | iPhone + VoiceOver = 사용자 보유 · **Android 실기기 없음**(`N4-21` · `S4-DEV-1`) | `S8-M` 사용자 실행. Android 항목은 NOT VERIFIED 예상 → 항목별 수용 |
| 배포 호스트 계정 | **사용자 수행** (`D8-1`): Cloudflare 계정 생성 · Pages 프로젝트 · 배포 · Access 정책(preview + `*.pages.dev` 둘 다) | `S8-I-U` — `S8-I`(설정 · 산출물 검사) 완료 후. Agent 는 계정을 만들지 않는다 |
| 신규 dev 도구 | `@axe-core/playwright` (`N8-18` · `Q8-18` 승인) | `S8-G` 에서 dev 의존으로 도입 |

---

## 5. Frontend Architecture Impact

### 5.1 레이어 배치 (RECOMMENDED — 이름 확정은 development-agent)

```
pages/settings/  DataManagementPage · RecordingListPage · AccountPage   (ConsentHistoryPage 없음 — N8-06 ⓑ)
features/
  data-management/   보관 정책 · 전체 삭제 요청 흐름 · 진행 상태 폴링 · 로컬 정리 연결
  recording-deletion/ 세션 녹음 목록 + 행 삭제 (서버 확정 → 로컬 삭제)
  account-deletion/  탈퇴 흐름 + 로컬 정리 + 세션 종료
  device-data/       미가입 기기 draft 삭제 (QA-2R-004 — Trial 안내 C13-11 아래 TextLink, Q8-12 ⓓ)
entities/
  data-management/   query key · useDataManagementSummary · useDeletionRequest(id)
  session/           (기존) list query 재사용 — 항목 schema 확장(C8-2)
shared/api/          dataManagementApi · accountApi   (consentApi.history 없음 — N8-06 ⓑ)
entities/me (기존)   계정 화면 이메일 = 기존 Me query 의 caregiver.email (C8-10) — 새 query 0
mocks/data-management/ · mocks/account/
```

- `features/settings` 는 행 구성(`menuRows.ts`)만 늘린다. 새 feature 를 import 하지 않는다 — 조합은 page (`rules/architecture.md` §3).
- 로컬 정리는 `shared/lib/session-cleanup.ts` 의 `performSessionCleanup` 을 **재사용**한다. 전체 삭제 · 탈퇴가 정리 단계를 다시 구현하지 않는다.

### 5.2 Server State

| Query / Mutation | key | 비고 |
|---|---|---|
| `useDataManagementSummary` | `dataManagementKeys.summary()` | 보관 정책 · 녹음 수 · 진행 중 삭제 요청 |
| `useRecordingSessions` | `sessionKeys.list({ hasRecording: true })` (C8-2) | cursor · 무한 목록 |
| `useDeleteSessionRecording` | — (IK) | 성공 → 목록·세션 상세·summary invalidate + 로컬 정리 |
| `useCreateDeletionRequest` | — (IK) | 성공 → summary invalidate · 폴링 시작 |
| `useDeletionRequest(id)` | `dataManagementKeys.request(id)` | `received`/`processing` 동안 폴링 (간격 5s × 상한 60회 = 5분 — **가값 `P-42`**, rev 2.2 `VG8-C-10` · 화면 이탈 시 중지 · 완료 시 정리 → Guard — `N8-10` ⓐ). 화면 밖 · 상한 후 완료 감지 = `N8-31` (§5.7) |
| `useDeleteAccount` | — (IK) | 성공 → `performSessionCleanup` → 세션 종료 → `/auth/welcome` replace + Toast 1회 (`N8-10` 탈퇴 ⓐ · `Q8-11` ⓐ) |
| (기존) Me query | 기존 key | 계정 화면 이메일 행 — `C8-10` 추가 필드를 읽기만 |

### 5.3 삭제 상태 머신 (features/data-management)

```
idle → confirming → submitting → requested(received|processing) → completed
                              ↘ failed(error code)   requested → failed(서버 status=failed)
submitting(offline) → 큐 적재 없음, 오류 안내 (삭제 요청은 SessionOutbox 대상이 아님 — RECOMMENDED)
```

- 삭제 요청은 **사용자가 화면 앞에 있을 때만** 보낸다. 오프라인이면 보내지 않고 안내한다(알림 action 0 — 재시도 = *Delete all data* 행 재조작 → ConfirmDialog ② 재확인, rev 2.2 `VG8-C-04`). 백그라운드 재전송하지 않는다 (RECOMMENDED — 되돌릴 수 없는 행위를 지연 실행하지 않기 위해).
- 세션 녹음 삭제는 Stage 4 `Discard` 규칙과 같다: **서버 확정 응답 후** 로컬 청크 삭제 + UploadQueue 취소. 실패·오프라인이면 로컬 보존.

### 5.4 Back 목적지 공통 규칙 (`VG6-D-12`, `N8-14`)

- `shared/lib/in-app-history.ts` 를 앱 공통 판정 지점으로 승격한다(CONFIRMED `D8-1` — `N8-14` · 부모 표 = Spec §6.3 `Q8-17`): 앱 안 기록이 있으면 `navigate(-1)`, 없으면 **route config 에 선언된 논리적 부모**로 `replace` 이동.
- 대상: `navigate(-1)` 을 쓰는 TopBar 7곳(`SettingsTopBar` · `ProfileTopBar` · `SurveyUpdateTopBar` · 아이 정보 back · `AddOwnBookTopBar` · `GiftRequestsTopBar` · `AuthTopBar`) + Stage 8 신규 화면 + 리포트 상세(`D7-7` 규칙을 일반화).

### 5.5 Privacy (Frontend 책임)

- 삭제 · 탈퇴 요청 payload 에 아이 이름 · 메모 등 PII 0 — id · scope · confirmation 만.
- 보호자 이메일(`C8-10`)은 계정 화면 표시에만 쓴다 — 콘솔 · 에러 리포트 · 요청 로그 덤프 · Toast 문구에 남기지 않는다 (AC-8-63 · AC-8-93).
- 진행 상태 · 오류를 콘솔에 남길 때 세션 id · 경로 0 (`logger` 규칙).
- 탈퇴 · 전체 삭제 완료 후 로컬에 아동 데이터 0: draft · 카드 캐시 · 로컬 녹음(IndexedDB + OPFS) · Query 캐시 · 복귀 경로 메모리.
- 미가입 기기 draft 삭제는 서버 호출 0 (서버에 데이터가 없다 — C-12).

### 5.6 프리뷰 빌드 (C-18)

- 모드 = `VITE_API_MODE=mock`. `assert:no-mocks` 는 **http 빌드 전용**으로 유지하고, 프리뷰용 검사 스크립트(RECOMMENDED 이름 `assert:preview`)를 신설: ① `.map` 파일 0 ② dev gallery · Scenario Panel 표식(`__HARU_DEV_SENTINEL__` · `haru-dev-`) 0 ③ Secret 패턴 0 ④ `VITE_*` 값 목록 출력.
- sourcemap 은 프리뷰 빌드에서만 끈다 — 환경 변수 분기(예 `VITE_PREVIEW=1`) 또는 별도 mode. 로컬 · CI 빌드는 그대로 (`S1-G-7` 방침).
- **호스트 = Cloudflare Pages + Cloudflare Access (`N8-11` ⓑ CONFIRMED `D8-1`)**.
- SPA fallback: Cloudflare Pages 는 산출물 **최상위에 `404.html` 이 없으면 SPA 로 간주**해 매칭되지 않는 경로에 `/` 를 준다 (공식 문서 — Based on). 따라서 **`_redirects` 를 두지 않고** `assert:preview` 에 ⑤ "`dist/404.html` 부재" 검사를 더한다. 실제 동작은 배포 URL 에서 AC-8-68 로 확인.
- 접근 제한: 프로젝트 *Enable access policy* 는 **preview 배포만** 보호한다 — `*.pages.dev` 본 도메인은 Known issues 절차(Access 앱 Subdomain 와일드카드 제거 → 재활성 → 정책 2개)로 **추가 보호**해야 한다. 둘 다 사용자 수행 (`S8-I-U`), 검증은 AC-8-69 (두 URL 모두 비인가 차단).
- 배포 방식 (RECOMMENDED): **Direct Upload** — `S8-I` 가 만든 산출물(`assert:preview` 통과본)을 사용자가 그대로 올린다. Git 연동 빌드는 Cloudflare 쪽에서 **다른 산출물**을 다시 만들므로 검사한 것과 배포된 것이 달라질 수 있다. Git 연동을 고르면 같은 빌드 명령 · 환경 변수 · `assert:preview` 를 빌드 단계에 넣어야 한다 (사용자 선택).
- Scenario 전환: `N8-12` ⓑ — `?scenario=` 쿼리만 허용, 패널 UI 0 (CONFIRMED `D8-1`). mock 프로덕션 빌드의 쿼리 동작은 `S8-I` 에서 실측.

### 5.7 화면 밖 완료 감지 (`N8-31` — rev 2.2, `VG8-C-11` High · ~~NEEDS DECISION~~ → **CONFIRMED (D8-2) ⓐ**, rev 2.3 동기화)

**현재 구현 분석 (읽기 전용, 2026-11-20)**:
- 정리 트리거는 `features/data-management/ui/DataManagement.tsx` 의 `useEffect` **한 곳**뿐이다 — 조건 = 추적 요청 `status = completed` + `scope = all_data`. 추적 요청 = 이 화면에서 만든 요청(`created`, 컴포넌트 state) > 요약의 `activeDeletionRequest`.
- 폴링(`entities/data-management/deletionPolling.ts`)은 화면 마운트 동안만, 5s × `DELETION_POLL_MAX_READS` 60 후 정지.
- 따라서 ① 화면 이탈(언마운트 → `created` 소멸) ② 상한 도달 ③ 앱 종료 후 서버가 `completed` 가 되면, 재진입 시 요약 `activeDeletionRequest = null`(완료는 진행 중이 아님) → 추적 대상 0 → 정리 · Toast 0. `me` 재조회로 Guard 만 온보딩으로 보낸다 → **draft · 카드 캐시 · 로컬 녹음이 기기에 남는다** (`architecture.md` §9 위반).
- 기기에 요청 id 를 남기는 저장소는 현재 없다 (`localStorage` 키 = draft `haru.onboarding.draft.v1` · 카드 캐시 `haru.activity-card.v1` 등).
- 현 Mock 은 **조회가 진행을 민다**(`MOCK_DELETION_FINAL_READ`) — 화면을 떠나면 진행도 멈춰 이 결함이 재현되지 않는다. Mock 미재현은 결함 부재 증거가 아니다.

**옵션 (`N8-31`)**:

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| **ⓐ (RECOMMENDED — design-agent 권고 ① 와 같은 방향)** | 요청 id 를 기기에 표시(키 1개)하고 앱 조립 지점의 감시자 1곳이 그 id 를 조회해 `completed` 면 정리 + Toast 1회. 정리 소유자를 **감시자 하나로 통일**(화면의 정리 `useEffect` 는 감시자로 이동 — 화면은 표시만) | 이탈 · 상한 · 앱 재시작 모두 덮음 · 판정 근거 = 서버 요청 상태(오판 0) · 새 UI 0 | 전역 감시 1곳 + 로컬 키 1개 (아키텍처 추가) |
| ⓑ | 표시 + `me` 판정 — 표시가 있고 `me.child` 가 사라졌으면 정리 (요청 조회 0) | 추가 조회 0 | 탈퇴 · 서버 불일치와 구분 약함 · Toast 근거 약함 |
| ⓒ | 표시 없이 `me` 만 — 온보딩 미완료로 바뀐 순간 정리 | 다른 기기 요청도 덮음 | **진행 중 온보딩 draft 를 잘못 지울 위험** (C-12 미가입 · 온보딩 중 사용자) — 비권고 |
| ⓓ | 수용 — 정리 누락 감수 | 구현 0 | §9 위반 잔존 — **비권고** |

**ⓐ 세부 (RECOMMENDED — 이름 확정은 development-agent)**:

| 항목 | 내용 |
|---|---|
| 감시 위치 | `app/providers` 의 감시 컴포넌트(QueryProvider · ApiClient · Toast · 녹음 환경 안쪽, **RouteGuard 판정 앞**). 표시가 있고 첫 조회가 끝나기 전에는 Guard 가 **기존 pending 표현** 그대로 기다린다(새 UI 0) — 정리 전에 온보딩 화면이 그려지지 않게. `app` → `features/data-management` import 는 레이어 규칙 안 |
| 저장 내용 · 위치 | `localStorage` 키 1개 (예 `haru.data-deletion.pending.v1`) = `{ requestId, scope: 'all_data', savedAt }` — **PII 0** (아이 이름 · caregiver 이메일 · 경로 0). 스키마는 앱 내부 저장 형식(contracts 아님 — 서버 interface 가 아니다) |
| 쓰는 때 | `POST` 성공 · `DELETION_ALREADY_REQUESTED` 후 요약이 `all_data` 진행 요청을 보여줄 때 · `/settings/data` 진입 시 요약에 진행 중 `all_data` 가 있을 때(다른 기기에서 만든 요청도 이 기기에 표시) |
| 감시 시점 | 앱 시작(인증됨) · 화면 복귀(`visibilitychange` visible) · 표시가 있는 동안 화면 밖에서도 같은 query key(`dataManagementKeys.request(id)`)로 폴링 — 간격 · 상한 = `P-42` 공유. 화면과 감시자가 같은 key 를 써 **요청 중복 0** |
| 지우는 때 | `completed` → 정리 **성공 후** 지움(실패하면 남겨 다음 시작 때 재시도 · Toast 는 성공 1회) · `failed` → 지움(실패 표면은 기존대로 화면 몫) · `RESOURCE_NOT_FOUND` · `FORBIDDEN` → 지움 · 로그아웃 · 탈퇴 정리(`performSessionCleanup`)에 이 키 포함 |
| 탈퇴와의 관계 | `scope='account'` 요청은 표시하지 않는다(탈퇴 완료 = `useAccountDeletionCleanup` + 세션 종료 → welcome, `N8-10` 탈퇴 ⓐ). `all_data` 진행 중 탈퇴하면 탈퇴 정리가 이 키까지 지운다 → 감시 종료. 탈퇴 후 세션이 없으므로 감시자는 조회하지 않는다 |
| 잔여 한계 (보고) | 요청을 만든 적도, `/settings/data` 를 연 적도 없는 **다른 기기**는 표시가 없어 덮지 못한다 → R8-15 · 출시 전 목록 후보 (서버 신호 — 예 `me` 의 삭제 완료 이력 — 가 필요하면 contract 변경이므로 Handoff 요구사항으로만 기록) |

---

## 6. Data Requirement Delta (Backend Handoff 용 — 구현 아님)

| 대상 | 요구 | Handoff |
|---|---|---|
| `data_deletion_requests` | 기존 DATA_MODEL §12 그대로 + **`scope=account` 추가** (`N8-02` ⓐ CONFIRMED) · `session_id` 는 `session_recording` 일 때 필수 · 같은 caregiver 의 진행 중 `all_data` 요청 1건(`DELETION_ALREADY_REQUESTED`) | DATA_REQUIREMENTS §Deletion |
| 계정 상태 | 전체 삭제 · 탈퇴 요청 즉시 `deletion_pending` — 신규 쓰기 차단 → `ACCOUNT_DELETION_PENDING`(409) (`N8-09` ⓐ CONFIRMED) | DATA_REQUIREMENTS · AUTH_REQUIREMENTS |
| 보호자 이메일 | `GET /v1/me` 의 `caregiver.email` = 인증 계정의 로그인 이메일(OAuth 포함 — Apple 비공개 릴레이 주소면 그 주소 그대로) · 읽기 전용(`PATCH /v1/me` 로 바꾸지 않음) (`C8-10`) | DATA_REQUIREMENTS · AUTH_REQUIREMENTS |
| 세션 목록 녹음 상태 | `GET /v1/children/:childId/sessions` 항목이 녹음 상태(`uploadStatus` · `expiresAt` · `deletedAt`)를 함께 반환 (C8-2) · `hasRecording` 필터 | DATA_REQUIREMENTS · BACKEND_HANDOFF |
| 세션 녹음 삭제 범위 | 원본 오디오 + 하이라이트 클립 삭제 · 전사·지표 유지(NFR) — `N8-03` ⓐ CONFIRMED | DATA_REQUIREMENTS §12.2-A |
| 발행 리포트와 삭제 | `P7-BIP-07` (발행 스냅샷 불변) ↔ 전체 삭제 시 `reports` 포함 hard delete — 세션 녹음 삭제 후 리포트 클립 재생은 `RECORDING_DELETED` | DATA_REQUIREMENTS |
| 탈퇴 | `N8-02` ⓐ: caregiver_profiles · auth user 포함 삭제, `consent_events` · `audit_logs` 는 법무 보관 결정(L-05)에 따라 가명화 | DATA_REQUIREMENTS · AUTH_REQUIREMENTS |
| 동의 이력 (선택 — Frontend 제외 `N8-06` ⓑ) | `consent_events` 읽기 — 문서 제목·버전·시각·항목. Backend 요구로만 기록 | AUTH_REQUIREMENTS |

---

## 7. API Contract Delta (설계 — `packages/contracts` 구현은 development-agent `S8-A`, `API_CONTRACTS.md` **Rev 12 등재 완료** (2026-11-20 plan-agent, rev 2))

결정 상태: 아래 전부 `CONFIRMED (D8-1)` — 채택안 = 각 행의 "결정" 열. 스키마 이름·필드는 RECOMMENDED 이고 구현 확정은 development-agent (`S8-A`) 가 Rev 12.x 로 기록한다.

| ID | 변경 | Schema (RECOMMENDED) | Endpoint | Error | 결정 |
|---|---|---|---|---|---|
| `C8-1` | 데이터 관리 요약 신설 | `DataManagementSummary { retentionPolicy: { rawAudioDays: int>0 }, recordingsCount: int≥0, activeDeletionRequest: DeletionRequest \| null }` — 문서의 `pendingDeletionRequests` 배열을 **단일 nullable** 로 줄인다(진행 중 `all_data`·`account` 는 1건) | `GET /v1/data-management` | AUTH_REQUIRED | — |
| `C8-2` | 세션 목록 항목에 녹음 상태 | `SessionListItem = SessionSummary.extend({ recording: RecordingStatus \| null })` · `ListSessionsRequest` 에 `hasRecording?: boolean` — **추가만**(기존 parse 호환) | `GET /v1/children/:childId/sessions` | — | — |
| `C8-3` | 삭제 요청 | `DeletionRequest { id, scope: DeletionScope, sessionId: Id \| null, status: DeletionRequestStatus, requestedAt, completedAt \| null }` · `CreateDeletionRequest { scope: 'all_data', confirmation: true }` (literal) | `DELETE /v1/sessions/:sessionId/recording` (IK) · `POST /v1/data-deletion-requests` (IK) · `GET /v1/data-deletion-requests/:id` | `RECORDING_DELETED` · `DELETION_ALREADY_REQUESTED` · `RESOURCE_NOT_FOUND` | `N8-08` ⓐ (확인 1회) |
| `C8-4` | 탈퇴 | `DeleteAccountRequest { confirmation: true }` → `DeletionRequest` (`scope='account'`) · **`DeletionScope` enum 에 `account` 추가** (`session_recording` · `all_data` · `account`) | `DELETE /v1/me` (IK) | `DELETION_ALREADY_REQUESTED` | `N8-02` ⓐ |
| `C8-5` | 삭제 진행 중 쓰기 차단 | **신규 error code `ACCOUNT_DELETION_PENDING` (409)** — `ERROR_CODES` 29 → **30종** | 모든 쓰기 endpoint (삭제 · 탈퇴 endpoint 자신은 제외 — `DELETION_ALREADY_REQUESTED`) | — | `N8-09` ⓐ |
| `C8-6` | 동의 이력 | `ConsentHistory { items: { type, documentId, documentTitle, documentVersion, action: 'granted', occurredAt }[] }` — **Backend 요구로만 문서화**. `packages/contracts` 구현 · API Client · Mock **0** | `GET /v1/consents` | — | `N8-06` ⓑ |
| `C8-7` | 세션 녹음 삭제 후 표현 | `SessionDetail.recording.uploadStatus = 'deleted'` + `deletedAt` (기존 schema 그대로) — 분석 전 세션 종결 표현은 `OAQ-17` 미결 유지(enum 추가 0) | — | — | — |
| `C8-8` | 문서 정정 (`O-2` · `RU-8`) | `RecordingStatus` (기존) | `GET /v1/recordings/:recordingId` 를 §4 Stage 4 표에 등재 (**Rev 12 반영 완료**) | `RESOURCE_NOT_FOUND` · `RECORDING_DELETED` | — |
| `C8-9` | API Client | `dataManagementApi { summary, listRecordingSessions, deleteSessionRecording, createDeletionRequest, getDeletionRequest }` · `accountApi { deleteAccount }` — Mock + Http 골격. `consentApi.history` 없음 | — | — | `N8-06` ⓑ |
| **`C8-10`** 🆕 rev 2 | **보호자 이메일** (`M8-1`) | `CaregiverSchema` 에 **`email: z.string().email()` (required)** 추가 — `Me.caregiver.email`. 읽기 전용: `UpdateCaregiver`(`PATCH /v1/me` request) 에는 넣지 않는다. 기존 `Me` Mock fixture 전부에 가상 이메일 추가(`sam@example.com` 등 — 실제 주소 금지) | `GET /v1/me` · `PATCH /v1/me` (응답) | — | `Q8-10` ⓐ |

- 새 error code 는 **`C8-5` `ACCOUNT_DELETION_PENDING` 1건**이다. 나머지는 기존 29종으로 표현된다.
- `confirmation: true` literal — 확인은 ConfirmDialog 로 받고 문구 입력(예: *DELETE* 타이핑)은 요구하지 않는다(`N8-08` ⓐ).
- `C8-10` 을 required 로 두는 이유 (RECOMMENDED): 계정은 언제나 로그인 식별자(이메일)를 가진다(가입 = Email · Google · Apple, C-5). optional 이면 "어느 계정을 지우는지" 확인 정보가 빠진 탈퇴 화면이 계약상 허용된다. 필드 추가로 기존 `Me` fixture 가 parse 실패하므로 `S8-A` 에서 함께 고친다 (AC-8-93).
- `C8-4` 의 `DeletionScope` 확장은 enum 값 추가다 — 기존 fixture · 단위 테스트의 enum 스냅샷(값 개수 단정)이 있으면 함께 갱신한다.

---

## 8. Mock Scenarios

`API_CONTRACTS.md` §5.4 형식 (`group:key`). 결정적이어야 한다.

| group | key | 재현 | 비고 |
|---|---|---|---|
| `data-management` | `success` | summary(진행 요청 없음 · `recordingsCount` = **삭제 가능한 녹음 수** — `uploadStatus ∈ {uploaded, pending, failed}` 행 = *Delete* 버튼이 있는 행 수, `deleted`·`expired` 제외 → 이 fixture = **6**, rev 2.2 `VG8-A-04`) · **목록 2페이지(cursor)** — 행 상태 5종 각 1행 이상(`uploaded` 2 · `pending` 1 · `failed` 1 · `expired` 1 · `deleted` 1) + `book = null` 1행 + 40자 책 제목 1행 (rev 2 — Spec §7 Mock 요청 `M8-4`) | 기본 · *Show more* 검증 |
| | `loading` | 지연 | Skeleton |
| | `empty` | 녹음 0 · 목록 0 | `D4-40` 빈 상태 |
| | `error` · `retry` | `INTERNAL_ERROR` → 다시 시도 성공 | |
| | `offline` | 네트워크 오류 | 요청 미전송 안내 |
| | `deletion-processing` | 전체 삭제 `received → processing → completed` (폴링 3회) | 기존 등재 key |
| | `deletion-failed` | `received → processing → failed` | 🆕 |
| | `deletion-completed-offscreen` | **화면 밖 완료** (`N8-31`): 기기 표시(요청 id) 주입 + 요청 `GET` 첫 조회 = `completed` · 요약 `activeDeletionRequest = null` · `me` = 아이 없음(온보딩 전). 화면 조회와 무관하게 결정적 | 🆕 rev 2.2. 표시는 서버 key 가 아니라 **로컬 주입**(Trial draft 와 같은 방식). 상한 경로는 단위(가짜 타이머)로 |
| | `deletion-already-requested` | `POST` → `DELETION_ALREADY_REQUESTED` · summary 에 진행 요청 표시 | 기존 등재 key |
| | `recording-deleted` | 행 삭제 → `RECORDING_DELETED` (이미 삭제됨 — 화면은 행을 삭제됨으로 갱신, 오류 아님) | 기존 key 재사용 |
| | `recording-delete-local-pending` | 서버 성공 + 해당 세션 로컬 미업로드 청크 존재 → 로컬 삭제 · 큐 취소 확인 | 🆕 |
| `account` | `success` · `error` · `offline` | 탈퇴 성공 · 실패 · 오프라인 | 🆕 그룹 |
| | `deletion-pending-write-blocked` | 삭제 진행 중 다른 쓰기 → `ACCOUNT_DELETION_PENDING` (`C8-5`) | 🆕 (`N8-09` ⓐ) |
| (`me` — 기존) | 전 key | `Me.caregiver.email` 포함 (가상 주소) — 기존 fixture 전부 갱신 (`C8-10`) | 🆕 필드 |
| ~~`consent`~~ | ~~`history` · `history-empty`~~ | **만들지 않는다** (`N8-06` ⓑ) | — |

- Stage 1–7 key 는 전부 회귀 대상 (`scenarios.spec.ts` + 단위).
- 미가입 기기 draft 는 서버 key 가 아니라 **로컬 draft 주입**으로 재현한다 (e2e — Spec §7 Trial 행).
- `success` fixture 확장은 기존 `empty` · `recording-deleted` · `recording-delete-local-pending` key 의 결과를 바꾸지 않는다 (각 key 는 자기 fixture 를 가진다).
- Mock 은 삭제 후 **다른 그룹의 상태도 일관되게** 바꾼다: 세션 녹음 삭제 → 해당 세션 `SessionDetail.recording.uploadStatus='deleted'` · 리포트 클립 → `RECORDING_DELETED` (Mock 공유 저장소 RECOMMENDED).

---

## 9. Frontend Scope (route / page / feature — 상세 UI 는 design-agent)

| Route (CONFIRMED `D8-1` — Spec §2) | Page | 내용 | Figma |
|---|---|---|---|
| `/settings` (확장) | SettingsPage | `ACCOUNT` 그룹: *Data & privacy* · *Account* · *Log out* (`Q8-02` ⓐ) | DRAFT `321:1537` 만 (C-13) |
| `/settings/data` | DataManagementPage | 보관 정책 안내 · 녹음 목록 진입 · 전체 삭제 = ListGroup **동작 행**(`Q8-03` ⓐ) · 진행 상태 = InlineAlert 문구 교체(`Q8-08` ⓐ) | 없음 |
| `/settings/data/recordings` | RecordingListPage | 세션 녹음 목록(책 · 날짜 · 길이 · **상태 meta 텍스트** — 썸네일 0 `Q8-04` ⓐ · Tag 0 `Q8-05` ⓐ) · trailing *Delete* 버튼(`Q8-06` ⓐ) · *Show more* · 빈 상태 | 없음 |
| `/settings/account` | AccountPage | 이메일(읽기 — `C8-10`) · 탈퇴. 요금제 미표시(`N8-05` ⓐ) | 없음 |
| ~~`/settings/privacy`~~ | — | **만들지 않는다** (`N8-06` ⓑ) | — |
| `/onboarding` intro · Step 1 (기존) | — | Trial 안내(C13-11) 바로 아래 TextLink *Remove my answers from this device* — draft 있음 + 미인증일 때만 (`Q8-12` ⓓ) | 디자이너 프레임 변경 0 |
| 탈퇴 완료 후 | `/auth/welcome` (Figma `179:1701`) | replace + Toast neutral 1회 (`Q8-11` ⓐ — Figma 화면 위 일시 오버레이, 승인됨) | 레이아웃 불변 |
| 전체 삭제 완료 후 | (Guard 이동) | 로컬 정리 → 아이 데이터 없음 → 온보딩 (`N8-10` ⓐ) | — |

카피 언어: 영어 · 진단/판정/비교 금지 · 기한 수치 금지(`N8-04` ⓐ) · 아이 이름은 first name 만. 문구 원문 = Spec §10 (`Q8-14` 승인).

---

## 10. Backend Integration Requirements (Contract 로 표현되는 기대 동작 — 구현 아님)

| ID | 기대 동작 | Handoff |
|---|---|---|
| `P8-BIP-01` | 세션 녹음 삭제: Storage 객체(전 part + 클립) 삭제 → `recordings.upload_status='deleted'` · audit · 진행 중 analysis job 취소 · 멱등(IK) · 이미 삭제면 `RECORDING_DELETED` (`P4-BIP-15` 확장) | DATA_REQUIREMENTS · RECORDING_UPLOAD_SPEC |
| `P8-BIP-02` | 전체 데이터 삭제 파이프라인: 즉시 `deletion_pending` · job 취소 · push 기기 해제 · Storage prefix 삭제 · 자식→부모 hard delete · 상태 전이 `received → processing → completed/failed` · 재시도 · SLA(법무) · 백업 잔존 고지 | DATA_REQUIREMENTS · BACKEND_HANDOFF |
| `P8-BIP-03` | 탈퇴: 계정 + 전체 데이터 삭제(`N8-02` ⓐ CONFIRMED) · `DeletionRequest.scope='account'` · 토큰 폐기 · auth user 삭제 · 법정 보관분 가명화 | AUTH_REQUIREMENTS · DATA_REQUIREMENTS |
| `P8-BIP-04` | 세션 목록 녹음 상태 · `hasRecording` 필터 (C8-2) · `DataManagementSummary.retentionPolicy` 는 서버 정책 값 | BACKEND_HANDOFF |
| `P8-BIP-05` | OAuth 전체 페이지 리다이렉트 복귀: 메모리 복귀 경로가 사라지므로 서버/Auth 가 `redirect_to` 를 보존해야 한다 — 허용 목록 = `toSafeReturnPath` 규칙(같은 출처 앱 경로 · `/auth/*` 제외 · `//` · `\` · 제어문자 거부) | AUTH_REQUIREMENTS |
| `P8-BIP-06` | PDF · 클립 signed URL 이 앱 origin 의 `fetch` GET 을 CORS 로 허용 (`Access-Control-Allow-Origin` = 앱 origin, 자격 증명 없음) — PDF 는 `fetch → arrayBuffer → File` 경로 | BACKEND_HANDOFF · DATA_REQUIREMENTS(Storage) |
| `P8-BIP-07` | 삭제 진행 중 쓰기 차단 응답 = `ACCOUNT_DELETION_PENDING` (409) (`C8-5`, `N8-09` ⓐ) | ERROR_CODES · AUTH_REQUIREMENTS |
| `P8-BIP-08` | (선택 — Frontend 미구현 `N8-06` ⓑ) 동의 이력 조회 `GET /v1/consents` — append-only `consent_events` 읽기 | AUTH_REQUIREMENTS |
| **`P8-BIP-09`** 🆕 rev 2 | `GET /v1/me` · `PATCH /v1/me` 응답의 `caregiver.email` = 인증 계정 로그인 이메일 (OAuth 포함) · 읽기 전용 · 로그에 원문 금지 (`C8-10`) | AUTH_REQUIREMENTS · BACKEND_HANDOFF |

**전 Stage 집계 (초안)**: Stage 2~7 PENDING 123행(P2 25 · P3 26 · P4 19 · P4B 8 · P5 16 · P6 13 · P7 16) + RU 21건 + 위 9건(rev 2 에서 `P8-BIP-09` 추가 — 초안 장부에는 8건, `S8-J` 에서 추가) → 6종 초안의 장부(`docs/BACKEND_HANDOFF.md` §6)에 1:1 등재했다. 완성 시 development-agent 가 각 행의 Mock 위치 · 관련 Screen/Feature 를 채운다.

---

## 11. Acceptance Criteria

판정 규칙: `rules/qa.md` §1. 모든 AC 는 Frontend 부분만 판정한다. PENDING 열의 ✅ = 서버 부분이 `BACKEND_INTEGRATION_PENDING` 대상(Frontend 부분은 이 AC 로 별도 판정).

### 11.1 Scope · Gate

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-01 | `apps/api` · `supabase` · `apps/mobile` 부재, Backend 런타임 코드 0 | `ls` · grep | — |
| AC-8-02 | Out of Scope(§3) 미구현: 동의 철회 · 결제 · export · 알림 설정(`N8-23` ⓐ) · 동의 이력(`N8-06` ⓑ) | grep · router | — |
| AC-8-03 | Stage 8 신규 화면이 Spec 과 다른 UI 를 추가하지 않는다 (최우선 규칙 2) | Visual Gap | — |

### 11.2 Contracts · Mock

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-04 | `C8-1`~`C8-4` · `C8-9` · `C8-10` schema 가 `packages/contracts` 에만 정의 · `z.infer` 파생 · 앱 안 중복 선언 0 | 단위 · grep | — |
| AC-8-05 | `C8-2` 확장이 기존 `ListSessionsResponse` fixture 를 깨지 않는다 (추가만) | 단위 | — |
| AC-8-06 | `confirmation` 은 literal `true` 만 통과 | 단위 | — |
| AC-8-07 | `ACCOUNT_DELETION_PENDING`(409) 이 `ERROR_CODES` · HTTP 매핑 · 문서 표와 일치 (30종) | 단위 · 문서 대조 | — |
| AC-8-08 | Mock 요청·응답 전부 contracts parse 통과 — §8 전 key | 단위 | — |
| AC-8-09 | §8 key 결정성: 같은 key 같은 결과 3회 | 단위 | — |
| AC-8-10 | Mock 교차 일관성: 세션 녹음 삭제 후 같은 세션 `SessionDetail.recording.uploadStatus='deleted'` · 해당 클립 재생 `RECORDING_DELETED` | 단위 | — |
| AC-8-11 | Adapter 선택 지점 1곳 · Component 의 Adapter 직접 호출 0 · Http 골격이 contracts parse + `https:` 강제 | grep · 단위 | ✅ 실 서버 |
| AC-8-12 | `API_CONTRACTS.md` 가 구현 contracts 와 일치 (Rev 12 Stage 8 표 · §1.2 30종 · §2.2 `DeletionScope` 3값 · §5.4 key · `C8-8` · `C8-10` 등재) — 구현과 다른 점은 development-agent 가 Rev 12.x 로 기록 | 문서 대조 | — |
| **AC-8-93** 🆕 rev 2 | `C8-10`: `CaregiverSchema.email` = required · 이메일 형식만 통과 · `UpdateCaregiver`(PATCH request)에는 없음 · 기존 `Me` fixture 전부 parse 통과(가상 주소) · e2e console 수집에 이메일 원문 0 (`M8-1` · `Q8-10` ⓐ) | 단위 · grep · e2e console | ✅ 실제 계정 이메일 |

### 11.3 설정 목록 확장 (C-16)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-13 | `ACCOUNT` 그룹 행 = *Data & privacy* · *Account* · *Log out* 순서·라벨 (`Q8-02` ⓐ) · 행 구성은 route config 한 곳 | 단위 · e2e | — |
| AC-8-14 | 기존 `YOUR CHILD` 4행 · 로그아웃 동작 회귀 0 | e2e · baseline | — |

### 11.4 데이터 관리 · 보관 정책 (FR-21)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-15 | 보관 일수 = 응답 `retentionPolicy.rawAudioDays` (fixture 값을 바꾸면 문장이 바뀐다 · 화면 코드에 `90` 리터럴 0) | 단위 · grep | ✅ 정책 값 |
| AC-8-16 | 전사·지표 유지 안내 문구 = `N8-03` ⓐ 문구(Spec §10) · 진단/판정/기한 수치 0 (`N8-04` ⓐ) | copy 검토 | — |
| AC-8-17 | Loading · Error(+Retry) · Offline 상태 | e2e (`data-management:*`) | — |
| AC-8-18 | 진행 중 삭제 요청이 있으면 상단 InlineAlert 로 상태 표시(received/processing/failed — 진행률 · 스피너 0, `Q8-08` ⓐ) · *Delete all data* 행 비활성 | e2e | ✅ 실제 진행 |

### 11.5 세션별 녹음 삭제

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-19 | 목록 = 녹음이 있는 세션만(cursor *Show more*) · 행 = 책 제목(`book = null` → *Storytime*) · 날짜 · 녹음 길이 · **상태 = meta 텍스트**(`uploaded` *Saved* · `pending` *Uploading* · `failed` *Not uploaded yet* · `expired` *Removed after {n} days* — `{n}` = 응답 `rawAudioDays` · `deleted` *Deleted*) — **Tag · 상태 색 · 썸네일 0** (`M8-3` · `Q8-04` ⓐ · `Q8-05` ⓐ) | e2e · grep | — |
| AC-8-20 | 빈 상태 (`data-management:empty`) — `D4-40` AC-4-23 화면 부분 | e2e · baseline | — |
| AC-8-21 | 삭제 → ConfirmDialog(되돌릴 수 없음 · 범위 안내) → 취소 = 요청 0 · focus 복귀 | e2e 요청 로그 | — |
| AC-8-22 | 확인 → `DELETE …/recording` 1회 (IK 헤더) · 연타 이중 요청 0 · 성공 후 행 = deleted · summary 갱신 | e2e 요청 로그 | ✅ 서버 삭제 |
| AC-8-23 | 로컬 미업로드 청크가 있는 세션: **서버 성공 응답 후** 로컬 청크 0 · UploadQueue 항목 0. 실패 · 오프라인이면 로컬 보존 | 단위(RecorderAdapter mock) + e2e 저장소 계수 | — |
| AC-8-24 | `RECORDING_DELETED` 응답 = 오류가 아니라 "이미 삭제됨" 반영 | e2e | — |
| AC-8-25 | `expired` · `deleted` 행은 목록에 남고 trailing 삭제 버튼 **없음** · 방금 삭제한 행은 위치 이동 없이 *Deleted* 로 바뀜 (`Q8-07` ⓐ · Spec §2.3.1) | e2e | — |
| **AC-8-94** 🆕 rev 2 | `data-management:success` fixture 가 Spec §7 Mock 요청을 충족: 행 상태 5종 각 1행 이상 · `book = null` 1행 · 40자 책 제목 1행 · cursor 2페이지 → e2e 로 5종 meta 문구 · *Storytime* 대체 제목 · 40자 제목 줄바꿈(320 · 393, truncate 0) · *Show more* 후 2페이지 행 추가 확인 (`M8-4`) | 단위(fixture parse) · e2e · baseline | — |

### 11.6 전체 데이터 삭제 요청

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-26 | 영향 안내(무엇이 지워지고 무엇이 남는지 — 계정은 유지 `N8-02` ⓐ · `N8-03` ⓐ) → ConfirmDialog → `POST /v1/data-deletion-requests` 1회 · IK | e2e 요청 로그 | — |
| AC-8-27 | 진행 상태 폴링 `received → processing → completed` (`deletion-processing`) · 폴링 상한·종료 (5s × 60 = 가값 `P-42`, rev 2.2) | e2e (가짜 타이머/Mock 지연) | ✅ 실제 파이프라인 |
| AC-8-28 | `failed` → 안내 + 다시 요청 경로 (`deletion-failed`) | e2e | — |
| AC-8-29 | `DELETION_ALREADY_REQUESTED` → 진행 중 상태로 표시 · 오류 화면 아님 | e2e | — |
| AC-8-30 | 오프라인 → 요청 미전송 · 안내 · 재시도 (백그라운드 재전송 0) | e2e 요청 로그 | — |
| AC-8-31 | `completed` 후 로컬 정리 완료(draft · 카드 캐시 · 녹음 · Query 캐시 0) → Guard 가 온보딩으로 (`N8-10` 전체 삭제 ⓐ) | e2e 저장소 계수 | — |
| AC-8-32 | 삭제 진행 중 다른 쓰기 시도 → `ACCOUNT_DELETION_PENDING` 을 각 화면의 **기존 실패 표면**에 문구만으로 안내(새 UI 0 — Spec §2.9) (`account:deletion-pending-write-blocked`) | e2e | ✅ 서버 차단 |
| **AC-8-97** 🆕 rev 2.2 | `N8-31` 표시 수명: 전체 삭제 요청 성공 · `DELETION_ALREADY_REQUESTED` · `/settings/data` 의 진행 중 `all_data` 요약 → 기기 표시 1개(요청 id · scope · 시각만, PII 0) · `completed`(정리 성공 후) · `failed` · `RESOURCE_NOT_FOUND`/`FORBIDDEN` · 로그아웃 · 탈퇴 정리 → 표시 0 · `scope='account'` 는 표시 0 | 단위 · e2e `localStorage` 검사 | — |
| **AC-8-98** 🆕 rev 2.2 | **화면 밖 완료** (`VG8-C-11`): ① 이탈 후 ② 폴링 상한(`P-42`) 후 ③ 앱 재시작 후 완료 → 다음 앱 시작 · 복귀 시 감시자가 로컬 정리(draft · 카드 캐시 · 로컬 녹음 · Query 캐시 0 — AC-8-31 과 같은 계수) + Toast *Your data was deleted.* **1회** → Guard 가 온보딩으로. 정리 완료 전에 온보딩 화면이 그려지지 않음 · 정리 실행 주체 1곳(화면 + 감시자 중복 실행 0) | e2e (`data-management:deletion-completed-offscreen`) + 단위(가짜 타이머 — 상한 경로) | ✅ 실제 서버 시간 기반 완료 |
| **AC-8-99** 🆕 rev 2.2 | `deletion-completed-offscreen` key 가 결정적으로 재현되고 contracts parse 통과 · 기존 `deletion-processing` · `deletion-failed` 결과 불변 | 단위 · `scenarios.spec.ts` | — |

### 11.7 계정 · 탈퇴

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-33 | 계정 화면 = 보호자 이메일(**`Me.caregiver.email` 응답 값** — fixture 값을 바꾸면 화면이 바뀜, `C8-10`) · 표시 전용(onPress · chevron 0) · 요금제 행 0(`N8-05` ⓐ) · 탈퇴 진입 | e2e | ✅ 실제 계정 이메일 |
| AC-8-34 | 탈퇴 → 안내 → ConfirmDialog → `DELETE /v1/me` 1회 · IK · 취소 = 요청 0 | e2e 요청 로그 | ✅ 서버 삭제 |
| AC-8-35 | 성공 → `performSessionCleanup` (로컬 아동 데이터 0) → 세션 종료 → `/auth/welcome` replace + Toast neutral 1회(`N8-10` 탈퇴 ⓐ · `Q8-11` ⓐ) · 뒤로 가기로 보호 화면 재진입 0 · 진행 중 전체 삭제가 있어도 *Delete account* 활성, 서버가 막으면 InlineAlert info (`Q8-09` ⓐ) | e2e | ✅ 토큰 폐기 |
| AC-8-36 | 실패 · 오프라인 → 로컬 데이터 보존 · 안내 · 재시도 | e2e | — |

### 11.8 미가입 기기 draft 삭제 (`QA-2R-004`)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-37 | 경로 위치 = **온보딩 Trial 안내(C13-11 InlineAlert, `/onboarding` intro · Step 1) 바로 아래 TextLink** *Remove my answers from this device* (`N8-07` → `Q8-12` ⓓ) · **draft 있음 + 미인증(Trial)** 일 때만 노출 · Trial 안내를 닫으면 함께 숨음 · `/auth/welcome`(`179:1701`) · `/onboarding/saved`(`179:1809`) 에는 추가 요소 0 | e2e (draft 주입 · 있음/없음 · 인증/미인증) | — |
| AC-8-38 | ConfirmDialog destructive(Spec §2.7 문구) → 확인 후 `OnboardingDraftStore` 0 · 서버 요청 0 · `/onboarding` replace(빈 상태) + Toast 1회 · 취소 = 변화 0 · 이후 Trial 재시작은 빈 상태 | e2e 요청 로그 · 저장소 | — |

### 11.9 동의 이력 — 제외 확인 (`N8-06` ⓑ, rev 2 재정의)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-39 | 동의 이력 화면 · `/settings/privacy` route · `consentApi.history` · `consent` Mock 그룹 **0** · `C8-6` 요구가 `AUTH_REQUIREMENTS.md`(P8-BIP-08)에 등재 | router · grep · 문서 | — |

### 11.10 앱 공통 정리 (이월)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-40 | `VG6-D-12`: 앱 안 기록 없이 직접 진입한 모든 하위 화면의 Back = 선언된 논리적 부모(`N8-14`) · 기록 있으면 `navigate(-1)` · Stage 7 `D7-7` 동작 유지 | e2e (직접 URL × 대상 route) | — |
| AC-8-41 | `VG6-H-09` = A + ⓑ-1(실측 실패 시 ⓑ-2) (`N8-15` · `Q8-15`) — Step 1 · 설정 아이 정보 · 가입 · **SettingsMenu · Stage 8 신규 화면** 섹션 라벨 행 53 / 글자 중심 35 | 측정 e2e · baseline 분해 | — |
| AC-8-42 | `VG6-H-06` 수용(`N8-16` · `Q8-16`) — `Text.tracking` 이 enum 1값 · 수치 prop 0 · COMPONENT_MAP 등재 | 단위 · 문서 | — |
| AC-8-43 | `S4B-F1-OPEN` ④: 시간 목록 시트를 열면 focus 가 시트 안 첫 요소(Back)로 이동, 닫으면 트리거로 복귀 | e2e | — |
| AC-8-44 | `N8-21` 처분표의 "수정" 항목 전부 반영 · "닫음" 항목은 근거 기록 | 문서 · 해당 테스트 | — |
| AC-8-45 | OAuth 가입 동의 기록의 `source` = `signup_oauth` (`N8-26` ⓐ — `consentSourceFor()` 1함수) | 단위 · 요청 로그 | ✅ 서버 기록 |

### 11.11 접근성 (WCAG AA — NFR)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-46 | 전 route(§12.4 목록) × 주요 상태 `@axe-core/playwright` 감사 serious/critical 0 — `color-contrast` 규칙을 끄지 않고, 예외는 `D-01` · `P-xx`(신규 `P-41` 포함) 목록에 매핑된 것만 (`N8-18` · `Q8-18` 승인) | e2e 감사 | — |
| AC-8-47 | 키보드만으로 전 route 핵심 흐름 완료 · focus 표시 · 순서 = 시각 순서 | e2e 키보드 투어 | — |
| AC-8-48 | 모든 Dialog · Sheet: 열림 focus 이동 · Esc 닫기(Spec 따름) · 닫힘 focus 복귀 · 배경 inert | e2e | — |
| AC-8-49 | 인터랙티브 요소 접근성 이름 100% · 아이콘 전용 버튼 이름 | e2e role 쿼리 | — |
| AC-8-50 | live region 낭독 1회 (Toast · 삭제 진행 · 분석 상태 · PDF ready) — 중복 announce 0 | 단위(aria-live 계수) | — |
| AC-8-51 | 터치 타깃 ≥ 44×44 (예외 = 승인된 결정 목록) | e2e 측정 | — |
| AC-8-52 | 텍스트 200% 확대(브라우저 줌 · `font-size` root 200%)에서 잘림 · 겹침 · 기능 손실 0 | e2e 스크린샷 + 수동 | — |
| AC-8-53 | `prefers-reduced-motion: reduce` 에서 전환·버블·클립 애니메이션 정지 · 정보 손실 0 | e2e emulate | — |
| AC-8-54 | 대비: 텍스트 4.5 / 큰 텍스트 · 비텍스트 3.0 측정표 — 미달 항목은 전부 `D-01` 또는 가값 `P-xx` 에 매핑(신규 미매핑 0) | 측정 스크립트 + 장부 | — |
| AC-8-55 | `QA-5-004` · `QA-6-005` · `QA-7-004` VoiceOver 절차 결과 (§12.3-B) | 수동 (사용자) | — |
| **AC-8-96** 🆕 rev 2 | **Text spacing (WCAG 1.4.12)**: 전 route(§12.4) 대표 상태에 줄 높이 1.5 · 문단 간격 2em · 자간 0.12em · 단어 간격 0.16em 스타일 주입 → 텍스트 잘림 · 겹침 · 기능 손실 0 (clip/truncate 요소 `scrollHeight ≤ clientHeight + 1` · 형제 텍스트 bbox 교차 0) (`M8-6` · Spec §8.2) | e2e 주입 측정 | — |

#### 11.11.1 `D8-3` 반영 표기 (rev 2.3 — AC 기준 문구 불변, 판정 시 적용하는 승인 결정)

| AC | 반영되는 결정 (`stage-8-approvals.md` D8-3 · 근거 `stage-8-handoff.md` H8-6.6) | Final QA 확인 |
|---|---|---|
| AC-8-46 · AC-8-49 | `H8-6-N1` `/progress` 리포트 카드 링크 **`aria-label` 제거** — 이름 = 보이는 텍스트(Stage 7 Spec `N7-37` 개정) · `H8-6-N2` 녹음 버튼 이름 = **캡션 + 동작** *"Tap to recording, Start recording"* (2.5.3 label-in-name) | axe `label-content-name-mismatch` 0 · 이름 쿼리 테스트 갱신 확인 |
| AC-8-51 | `H8-6-N4` consent *View* · 아이 정보 *Done* · 녹음 목록 *Show more* = **보이는 모습 유지 + 터치 영역만 44** (`packages/ui` TextLink opt-in 옵션 1개, baseline 0) · 회고 입력칸 높이 40(Figma `91:715`) = **예외 등록**(2.5.8 AA 24 충족, `S1-G-2` 선례) | 44 측정 · **이웃 hit 영역 겹침 0** (승인 조건) · baseline 변화 0 |
| AC-8-52 | `H8-6-N6` 196×426 Activity Card 뒤집기 버튼 = **원인 진단 후 수정** (조건: 393 · 320 baseline 변화 0) · `H8-6-N8` px 타입 토큰으로 root `font-size: 200%` 가 글자에 반영 안 됨 = **기록만**(1.4.4 는 페이지 줌 등가 196 폭으로 판정) · `H8-6-N5` 196 폭 말줄임 → 아래 AC-8-96 행과 같은 처리 | 196 폭 버튼 중심 hit = 버튼 · 393/320 baseline diff 0 |
| AC-8-54 | `H8-6-N3` 로그인 *Create an account*(ink-700) 4.02:1 = **신규 가값 `P-43`** (Figma 색 유지, 디자이너 확정 대기) — 대비 미달 매핑 장부에 추가 | 미매핑 0 (`P-43` 매핑 포함) · 가값 목록 기록 |
| AC-8-96 (+ AC-8-52 의 196 폭) | `H8-6-N5` Figma 줄 수 제한 말줄임(Text spacing 38건 · 196 폭 117건) = **ⓐ 조건부 허용 차이** — 조건: **항목별 전체 텍스트 대체 경로 대조표를 QA 가 작성**(말줄임 요소 → 전체 문구가 있는 접근성 이름 · 상세 화면 · 시트). 대체 경로가 없는 항목은 허용 대상 아님 | 대조표 존재 · 대체 경로 없는 항목 0 (있으면 Finding) |
| AC-8-55 외 기타 | `VG8-F-05` · `VG8-F-06` · `VG8-F-09` 허용 차이 · `VG8-B-12` blur 미적용 · `VG8-G` F2 시트 Esc 동작(Stage 2 Spec §4.1) — Visual Gap 결정, 허용 차이 목록 집계 대상 | `S8-K` 허용 차이 집계 |

### 11.12 반응형 (FR-25)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-56 | 전 route × 320 / 393 / 600 / 1024: 가로 넘침 0 (`scrollWidth ≤ clientWidth`, 클래식 스크롤바 포함) | e2e | — |
| AC-8-57 | ≥600 에서 앱 컬럼 최대 480 가운데 · 다단 0 | e2e 측정 | — |
| AC-8-58 | 그림자 클립 0 — 새 `overflow` 선언마다 근거 주석 + 세로·가로 프로브 (`R-SHADOW-1`) | `shadow.spec.ts` 확장 | — |
| AC-8-59 | Stage 8 신규 화면 baseline (393 + 320) — dev UI 미포함 · settle 후 (`R-BASELINE-1`) | baseline | — |
| **AC-8-95** 🆕 rev 2 | **가로 웹(landscape) 852×393**: 전 route(§12.4) 대표 상태(기본 + 시트/다이얼로그 열림 1개)에서 가로 넘침 0 · 앱 컬럼 480 가운데 · 다단 0 · 하단 고정 요소(TabBar · 버튼 바)가 콘텐츠를 가려 기능을 막지 않음(세로 스크롤로 도달 가능) (`M8-6` · Spec §8.2) | e2e 측정 | — |

### 11.13 Privacy (Frontend 검증 가능)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-60 | 동의 전 아동 데이터 전송 0 — 가입·Trial·OAuth 경로 요청 로그 | e2e 요청 로그 | ✅ 서버 강제 |
| AC-8-61 | 동의 없음 → 녹음 시작 UI 차단 (회귀) | e2e | ✅ |
| AC-8-62 | 로그아웃 · 전체 삭제 · 탈퇴 각각 후 로컬 아동 데이터 0 (localStorage · IndexedDB · OPFS · Query 캐시 · 복귀 경로) | e2e 저장소 덤프 | — |
| AC-8-63 | 콘솔 · 에러 로그 PII 0 (이름 · 메모 · 오디오 경로 · 세션/리포트 id) — 전 e2e 실행 중 console 수집 grep | e2e | — |
| AC-8-64 | 광고 · 제3자 분석 SDK 0 (lockfile · 번들 grep) | grep | — |
| AC-8-65 | http 빌드 `assert:no-mocks` 통과 · 번들 · `VITE_*` · 저장소 Secret 0 | 스크립트 · grep | — |

### 11.14 Mock 웹 프리뷰 (C-18)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-66 | 프리뷰 빌드 산출물 `.map` 0 · dev gallery · Scenario Panel 표식 0 (`assert:preview`) · 로컬/CI 빌드는 sourcemap 유지 | 스크립트 | — |
| AC-8-67 | 프리뷰 빌드 Secret 0 · 실제 아동 데이터 0 (fixture = 가상 · 이메일 fixture 도 가상 주소) · 상용 표지 **3종**(rev 2.3 정정 — `H8-7-N1`) = 중립 대체 표지 + 에셋 파이프라인 (`N8-13` ⓐ) | grep · fixture 검토 | — |
| AC-8-68 | SPA fallback: 산출물 최상위 `404.html` 0 (`assert:preview`) + Cloudflare Pages 배포 URL 에서 깊은 경로 새로고침 200 + 앱 렌더 (`/progress`, `/settings/data`) | 스크립트 + 배포 URL 수동 | — |
| AC-8-69 | Cloudflare Access 접근 제한 (`N8-11` ⓑ): 비인가(시크릿 창 · 미허용 이메일)로 **`<project>.pages.dev` 본 도메인과 preview 배포 URL 둘 다** 앱 대신 Access 로그인 화면 · 허용 이메일은 통과 | 수동 (사용자 — `S8-I-U`) | — |
| AC-8-70 | 프리뷰에서 Mock 로그인 → 핵심 흐름(Home → 세션 → 회고 → Progress → 설정 → 데이터 관리) 동작 | 수동 체크리스트 | — |
| AC-8-71 | Scenario 전환 = `?scenario=` 쿼리만 동작 · Scenario Panel UI 0 (`N8-12` ⓑ) | 수동 + `assert:preview` | — |
| AC-8-72 | 앱 테스트 빌드 · Backend 배포 0 | 확인 | — |

### 11.15 회귀

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-73 | `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries` · `test` · `build` · `format:check` 0 | 실행 로그 | — |
| AC-8-74 | `test:e2e` **단독 실행** 전부 통과 | 실행 로그 | — |
| AC-8-75 | `--update-snapshots=all` 재생성 결과 diff 를 연결성분 분해 — 설명 안 되는 클러스터 0 (`v2-material` 포함, `N8-17`) | 분해 로그 | — |
| AC-8-76 | Stage 1–7 Mock key 전부 회귀 (parse · 결정성) | 단위 | — |
| AC-8-77 | Stage 2–7 핵심 경로 e2e (가입·동의·온보딩 / Home·서재 / 세션·업로드 / 회고·피드백 / 프로필·설정 / Progress·리포트·클립·PDF) | e2e | — |

### 11.16 Handoff Package

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-78 | 7종 존재: `BACKEND_HANDOFF` · `API_CONTRACTS` · `DATA_REQUIREMENTS` · `AUTH_REQUIREMENTS` · `RECORDING_UPLOAD_SPEC` · `ANALYSIS_PIPELINE_REQUIREMENTS` · `ERROR_CODES` | `ls` | — |
| AC-8-79 | 전 Stage PENDING(P2~P8 BIP · P4B · RU) 1:1 — QA 리포트 PENDING 표 ↔ Handoff 장부 대조, 누락 0 · 중복 ID 0(`N8-22`) | 대조 스크립트/표 | — |
| AC-8-80 | `BACKEND_HANDOFF.md` 필수 항목: API 목록 · Request/Response/Error · Auth · Authorization · Screen · Feature · PRD ID · 기대 상태 변화 · **Mock 위치** — 모든 endpoint 행에 값 | 문서 검사 | — |
| AC-8-81 | `ERROR_CODES.md` = `ERROR_CODES` 배열 · HTTP 매핑과 1:1 · details 모양(RU-9) 기록 | 대조 | — |
| AC-8-82 | `DATA_REQUIREMENTS.md` 가 `DATA_MODEL.md` §1–§14 를 흡수 + Stage 2–8 Delta 반영 · DATA_MODEL 은 "이관됨" 표기 | 문서 | — |
| AC-8-83 | 출시 전 차단 항목(L-01~L-07 · L-02 문서 URL · P3-BIP-19 · OAQ-13/14/17 · 삭제 SLA) 이 `BACKEND_HANDOFF` 에 등재 | 문서 | — |
| AC-8-84 | "증정 신청은 Frontend 에 없다" · Mock 전용 route 제거 대상 결과 · OAuth 복귀(P8-BIP-05) · PDF CORS(P8-BIP-06) 등재 | 문서 | — |
| AC-8-85 | `packages/contracts` 최종: typecheck · test · 문서 일치 | 실행 + 대조 | — |

### 11.17 STOP · 기록

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-86 | 최종 QA 리포트에 남은 가값 목록 · 허용 차이 목록 · 수용 예외(D-01~D-04) · NOT VERIFIED 수용 이력 집계 | 문서 | — |
| AC-8-87 | Frontend Complete 예외 목록(미구현 PRD 화면 — 알림 설정 `N8-23` ⓐ · 동의 이력 `N8-06` ⓑ, 기획 대기 `S2-COPY-1` · `S2-HOME-1` 등) 이 최종 보고에 명시 | 문서 | — |
| AC-8-88 | 최종 보고 후 Backend · migration · Node API · STT · AI · Render Backend 작업 시작 0 | 확인 | — |
| AC-8-89 | `PLANNING.md` · `WORKFLOW_STATE.md` Stage 8 상태 갱신 (Verdict 후) | 문서 | — |

### 11.18 실기기 수동 (사용자 실행 — 결과 미실행이면 NOT VERIFIED, 항목별 수용 가능)

| AC | 기준 | 검증 | PENDING |
|---|---|---|---|
| AC-8-90 | `QA-5-003` iOS 소프트 키보드 (§12.3-A) | 수동 | — |
| AC-8-91 | `QA-7-002` iOS 공유 · 저장 · 첫 탭 재생 (§12.3-C) | 수동 | — |
| AC-8-92 | `QA-7-003` 실시간 재생 진행 (§12.3-D) | 수동 / headed | — |

---

## 12. 작업 단위 (한 단위 = development-agent 1회 호출, 단 `S8-0` · `S8-I-U` · `S8-M` 제외)

선행 결정은 rev 2 기준 **전부 `CONFIRMED (D8-1)`** 이다 — 아래 "선행" 열은 단위 간 의존만 적는다.

| 단위 | 담당 | 내용 | AC | 선행 |
|---|---|---|---|---|
| **`S8-0`** 장부 정리 | Orchestrator · plan-agent · stage-qa-agent (문서만) | WORKFLOW_STATE §3 "미처리/결정 필요" 행을 현재 저장소로 대조해 닫음/이관 표 작성(`N8-21`) · `S4-FIX-1` stage-3 리포트 경고문 정정(qa-agent) · ~~`API_CONTRACTS` Rev 12 설계~~ **완료 (rev 2, plan-agent — `C8-1`~`C8-10` · `ACCOUNT_DELETION_PENDING`)** · Mock 전용 route 존재 확인 | 44 · 12(문서) | 승인 ✅ |
| **`S8-A`** Contracts + Mock | development-agent | `C8-1`~`C8-5` · **`C8-10` `Caregiver.email`**(기존 `Me` fixture 전부 갱신) · `DeletionScope` += `account` · `ACCOUNT_DELETION_PENDING`(30종) · `C8-9` API Client + Mock + Http 골격 · §8 key · **`success` fixture 보강(`M8-4`)** · Mock 교차 일관성 · fixture 이름 일관화(`OBS-5-7`) · `API_CONTRACTS` 구현 반영(Rev 12.x). `C8-6` 은 구현 0 | 04~12 · **93** · **94**(fixture 부분) | `S8-0` |
| **`S8-B`** 설정 확장 + 데이터 관리 + 녹음 목록 | development-agent | `/settings` 행(`Q8-02` ⓐ) · `/settings/data` · `/settings/data/recordings`(meta 텍스트 상태 · trailing *Delete* · *Show more*) · 세션 녹음 삭제(서버 확정 → 로컬 삭제) · `D4-40` 빈 상태 | 13~25 · **94**(화면 부분) | `S8-A` |
| **`S8-C`** 전체 삭제 요청 | development-agent | 상태 머신 · 폴링 · InlineAlert 상태 표면 · 오류 · 완료 후 정리 → Guard | 26~32 | `S8-B` |
| **`S8-D`** 계정 · 탈퇴 + 기기 draft 삭제 | development-agent | `/settings/account`(이메일 `C8-10` · 요금제 0) · 탈퇴 흐름 → welcome + Toast · `QA-2R-004` = **Trial 안내 아래 TextLink**(`Q8-12` ⓓ) · 동의 이력 **미구현** 확인 | 33~39 | `S8-A`(`C8-10`) · `S8-B` |
| **`S8-F`** 앱 공통 정리 | development-agent | Back fallback(`VG6-D-12`, 부모 표 Spec §6.3) · `VG6-H-09` A + ⓑ-1 · `VG6-H-06` 등재 · `N8-21` 수정 항목(부록 B.2-①②) · `consentSourceFor()`(`N8-26` ⓐ — **이미 구현, 검증만** 부록 B.1-10) · **`N8-31` 화면 밖 완료 감지(§5.7 — 결정 후, 채택안대로) + Mock key `deletion-completed-offscreen`** (rev 2.2) | 40~42 · 44 · 45 · **97~99** | `S8-0`(`N8-21` 처분표) |
| **`S8-G`** 접근성 감사 · 수정 | development-agent | `@axe-core/playwright` dev 의존 도입 · 전 route 감사 spec · 발견 수정 · `S4B-F1-OPEN` ④ · 200% · **Text spacing** · reduced-motion · 대비 측정표(`P-41` 포함) | 43 · 46~54 · **96** | `S8-B`~`S8-F` |
| **`S8-H`** 반응형 · 회귀 · baseline | development-agent | 전 route 4폭 + **가로 웹 852×393** spec · `scrollbar-classic` 확장 · 그림자 프로브 · `--update-snapshots=all` 분해 · `v2-material` | 56~59 · **95** · 73~77 | `S8-G` |
| **`S8-I`** 프리뷰 빌드 · 배포 준비 | development-agent (저장소 안 설정만) | 프리뷰 sourcemap off · `assert:preview`(① `.map` 0 ② dev 표식 0 ③ Secret 0 ④ `VITE_*` 목록 ⑤ 최상위 `404.html` 0) · `?scenario=` 쿼리 동작 실측 · 표지 **3종**(rev 2.3 정정) 중립 대체 + 에셋 파이프라인(`N8-13` ⓐ · `QA-3-003`) · **사용자용 배포 절차서** `docs/qa/stage-8-preview-deploy.md` (Cloudflare 계정 → Pages 프로젝트 → Direct Upload → Access 정책 preview + `*.pages.dev` → 허용 이메일 목록 → AC-8-68·69 확인 방법). ⛔ 외부 계정 생성 · 로그인 · `wrangler` 설치 · 배포 실행 0 | 65~67 · 71(빌드 부분) · 72 | `S8-H` |
| **`S8-I-U`** 🆕 rev 2 프리뷰 배포 | **사용자** (`D8-1`) | 절차서대로 Cloudflare 계정 생성 · Pages 프로젝트 · 산출물 업로드 · Access 정책(preview + 본 도메인) · 허용 이메일 지정 → 배포 URL 을 Orchestrator 에 전달 | 68 · 69 · 70 · 71(배포 URL) | `S8-I` |
| **`S8-M`** 수동 점검 세션 | **사용자** (절차 = §12.3) + stage-qa-agent 기록 | iPhone Safari · VoiceOver · macOS VoiceOver · headed 브라우저 | 55 · 90~92 | `S8-I-U` 의 URL (또는 Mac dev HTTPS) |
| **`S8-J`** Handoff 완성 | development-agent | 6종 완성(Mock 위치 · Screen/Feature 연결 · DATA_MODEL 이관 · `D8-1` 결정 반영 — `ERROR_CODES` §3 후보 → 확정 30종 · `DATA_REQUIREMENTS` `scope=account` · `AUTH_REQUIREMENTS` `N8-02`/`N8-09` · `P8-BIP-09` 추가) · **`docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` 를 development-agent 가 생성하고 완성한다 — 원본 = 이 Plan 부록 A** (plan-agent 초판의 파일 쓰기가 도구 가드에 막혔다. rev 2 도 생성하지 않는다) · `API_CONTRACTS` 최종 동기화 · contracts 최종 검증 | 78~85 | `S8-A`~`S8-I` |
| **`S8-K`** Final QA | stage-qa-agent | `rules/qa.md` §5 전체 · Stage 8 Verdict · 남은 가값/허용 차이/수용 집계 | 전부 · 86~89 | `S8-J` · `S8-M` |

순서: `S8-0` → `S8-A` → `S8-B` → `S8-C` → `S8-D` → `S8-F` → (각 단위 design-agent **Visual Gap** — 최우선 규칙 5) → `S8-G` → `S8-H` → `S8-I` → **`S8-I-U`(사용자)** → `S8-M`(사용자 — 배포 URL 위에서) → `S8-J` → `S8-K` → **Verdict 보고 → STOP**.

- **Agent 는 외부 계정을 만들지 않는다** (`D8-1`): Cloudflare 계정 · Pages 프로젝트 · Access 앱 · 허용 이메일은 전부 사용자가 만든다. Agent 는 절차서와 검사 스크립트만 준다.
- `S8-I-U` 가 늦어지면 `S8-J` 는 먼저 진행할 수 있다 (Handoff 는 배포 URL 에 의존하지 않는다). 그 경우 AC-8-68~71 · `S8-M` 은 `S8-K` 직전까지 대기하고, 미실행이면 NOT VERIFIED → 항목별 수용 또는 "사용자 보류 결정 기록"(§19 ⑥).
- `S8-M` 은 `S8-I-U` 의 배포 URL(HTTPS — 실기기 공유·클립 재생 조건 충족) 또는 Mac dev 서버 HTTPS(`5174`)에서 실행한다. Access 를 통과하려면 사용자 iPhone 의 이메일이 허용 목록에 있어야 한다.
- `S8-J` 를 마지막 구현 단위로 둔다 — 앞 단위가 contract · Mock 위치를 바꾸면 Handoff 를 다시 고쳐야 하기 때문.

### 12.1 단위별 Visual Gap 대상

| 단위 | Visual Gap |
|---|---|
| `S8-A` | UI 영향 없음 확인만 기록 |
| `S8-B` · `S8-C` · `S8-D` | C-13 명세 대비 (Figma 없음) + DRAFT `321:1537` 목록 recipe 일치 |
| `S8-F` | `VG6-H-09` 결정값 측정 · baseline 분해 |
| `S8-G` · `S8-H` | 수정으로 바뀐 baseline 전부 원인 분해 |
| `S8-I` · `S8-J` | UI 영향 없음 확인 (`S8-I` 의 표지 교체는 Library · Home · 세션 baseline 분해 대상) |

### 12.2 분할 제안 (`N8-28`)

| 안 | 내용 | 권고 |
|---|---|---|
| **ⓐ 분할 안 함** | 위 순서로 한 Stage | **CONFIRMED (`D8-1`)** — Final QA 는 이월 기능까지 들어간 최종 상태를 대상으로 해야 한다 |
| ⓑ 8a / 8b | 8a = 이월 기능(`S8-A`~`D`) QA PASS → 8b = Final QA · 배포 · Handoff | 이월 기능 결함을 먼저 닫을 수 있으나 QA 2회 · 문서 2벌 |

### 12.3 수동 점검 절차 (사용자 실행 — `S8-M`)

공통 환경: Mock 프리뷰 URL(Cloudflare Pages, HTTPS — Access 허용 이메일로 로그인) 또는 Mac dev 서버 HTTPS(`https://<mac-ip>:5174`). 로그인 `sam@example.com` / `sunny-evening-8` (Mock). 결과는 스크린샷 · 화면 녹화 · 메모를 `docs/qa/evidence/stage-8/manual/` 에 두고 stage-qa-agent 가 판정한다. 실행하지 못한 항목은 NOT VERIFIED 로 남고 **항목별 수용**만 가능하다.

| 절차 | 대상 | 원문 (그대로 따른다) | 소요(추정) |
|---|---|---|---|
| **A** | `QA-5-003` iOS 소프트 키보드 | `docs/qa/stage-5-qa-report.md` §6 `QA-5-003` 1~5 | 10분 |
| **B** | VoiceOver — `QA-5-004` · `QA-6-005` · `QA-7-004` + Stage 8 신규 화면 | `stage-5-qa-report.md` §6 `QA-5-004` A·B · `stage-6-qa-report.md` §6 + §10.7 · `stage-7-qa-report.md` §6 `QA-7-004` · **추가**: 설정 → 데이터 관리 → 녹음 삭제 다이얼로그 → 전체 삭제 진행 상태 낭독 1회 · 탈퇴 다이얼로그 | 40~60분 |
| **C** | `QA-7-002` iOS Safari 공유 · 저장 · 첫 탭 재생 | `stage-7-qa-report.md` §6 `QA-7-002` ①~⑤ | 15분 |
| **D** | `QA-7-003` 실시간 재생 진행 | `stage-7-qa-report.md` §6 `QA-7-003` (headed Chrome + Safari) | 10분 |
| **E** | 관찰 (판정 아님) | `S1-D2-3` 목록 `role` 제거 후 Safari VoiceOver 목록 낭독 · `S4-E-1` ① iPhone 에서 로컬 녹음 저장 계층(OPFS/IndexedDB) · `OBS-4B-10` 첫 청크 지연 | 15분 |
| **F** | 프리뷰 스모크 (AC-8-68 · 70) | 깊은 경로 새로고침 2곳 · Home → 세션(마이크 허용) → Submit → 회고 → Progress → 리포트 상세 → 설정 → 데이터 관리 → 녹음 삭제 | 15분 |

Android 실기기 항목은 장비가 없어 실행하지 않는다 (`N4-21`) — 해당 행은 NOT VERIFIED 로 기록하고 수용 여부를 묻는다.

### 12.4 Final QA 대상 route 목록 (감사 · 반응형 공통)

`/auth/welcome` · `/auth/sign-up` · `/auth/log-in` · `/auth/forgot-password` · `/auth/reset-password` · `/auth/consent` · `/auth/verify-parent` · `/onboarding` intro · start · saved · `:step`(4) · profile · growth-capability · `/` · `/library` · `/library/add` · `/library/gift-requests` · `/progress` · `/progress/reports/:reportId` · `/session/:id`(ready · recording · paused) · 완료 · `/session/:id/feedback` · `/settings` · `/settings/profile` · `/settings/child` · `/settings/child/survey` · `:step` · `/settings/growth-capability` · **`/settings/data` · `/settings/data/recordings` · `/settings/account`** · `/onboarding` intro · Step 1 의 **draft 삭제 TextLink + Dialog** · 404. (`/settings/privacy` 없음 — `N8-06` ⓑ) 시트 · 다이얼로그는 부모 route 에서 열린 상태로 포함.

### 12.5 Final QA 확인 항목 — rev 2.3 추가 (`S8-K`, 범위 변경 0)

| # | 항목 | 근거 | 확인 방법 · 기대 |
|---|---|---|---|
| Q-1 | `D8-3` 반영 상태 (§11.11.1 표 전체) | D8-3 | 각 행의 "Final QA 확인" 열 |
| Q-2 | `H8-6-N5` 말줄임 **대체 경로 대조표** 작성 | D8-3 | QA 리포트 부록 — 항목별 대체 경로 1개 이상 |
| Q-3 | 가값 재제시 목록에 `P-18` · `P-22` · `P-42` · `P-43` 포함 · `P-20` 제외 | D8-2 · D8-3 · `H8-6-N7` | QA 리포트 "남은 가값" 목록 |
| Q-4 | 상용 표지 원본 3개가 **작업 트리 · 프리뷰 산출물**에 0 (git 이전 커밋에는 남음 — 이력 재작성 안 함, R8-16) | `H8-7-N3` | `assert:preview` ⑥ · `ls` · 이력 잔존은 Handoff 출시 전 목록 기록 여부만 확인 |
| Q-5 | 프리뷰 fixture 의 실제 상용 도서 **제목 · 저자** 노출 — 법무 확인 항목(`P3-BIP-19`)으로 등재됐는가 (R8-17) | `H8-7-N4` | `BACKEND_HANDOFF` 출시 전 목록 · Verdict 보고에 사용자 확인 항목으로 표기 |
| Q-6 | 프리뷰(Mock 프로덕션) 빌드가 `sessionStorage['haru:scenario']` 를 시나리오 2순위 계층으로 읽음 — 패널 UI 0 이라 `N8-12` ⓑ 문언은 충족 (R8-18) | `H8-7.3` 관찰 | QA 판단: 허용(관찰 기록) 또는 Finding. 어느 쪽이든 근거 기록 |
| Q-7 | 중립 표지 모양(무늬 · 글자 없는 palette 단색)은 Figma · Spec 근거 없음 | `H8-7-N2` | design-agent Visual Gap · 사용자 확인 결과 참조 (미확인이면 보고) |

---

## 13. Test Strategy

| 층 | 내용 |
|---|---|
| contracts | `C8-*` schema · literal · 확장 호환 · error code 표 1:1 |
| Mock | §8 key parse · 결정성 · 교차 일관성(삭제 → 세션 · 클립) |
| 단위 | 삭제 상태 머신 · 폴링 종료 · 로컬 정리 순서(서버 확정 후) · Back fallback 판정 · live region 계수 |
| e2e | Stage 8 흐름 · 요청 로그(IK · 이중 요청 0 · 오프라인 0) · 저장소 덤프 · 직접 URL Back · 전 route 4폭 · 200% · reduced-motion · 감사 |
| 시각 | 신규 baseline 393 · 320 · `--update-snapshots=all` 분해 |
| 배포 | `assert:preview` · 배포 URL 스모크 |
| 수동 | §12.3 |

Playwright 는 **단독 실행**한다 (병행 시 허위 실패 이력 — 메모리 기록).

---

## 14. Risks & Mitigations

| ID | Risk | 영향 | 대응 |
|---|---|---|---|
| R8-01 | C-13 화면이 나중에 디자이너 Figma 로 오면 재작업 | 중 | Stage 6·7 선례대로 명세 + 디자이너 요청서 병행 · Figma 도착 시 최우선 규칙으로 재정렬 |
| R8-02 | 삭제 · 탈퇴는 되돌릴 수 없다 — Mock 에서 잘 동작해도 실제 서버 의미가 다를 수 있음 | 높음 | contract 에 상태·범위를 명시(§7) · 화면 문구에 범위 안내 · Handoff 에 기대 상태 변화 표 |
| R8-03 | 법무 미결(SLA · 보관 · L-03) 때문에 문구 확정 불가 | 중 | 수치·기한 없는 문구 + copy 모듈 한 곳 · 출시 전 차단 항목 등재 |
| R8-04 | 공개 URL 프리뷰로 비공개 디자인 · 상용 그림책 표지 노출 | 높음 | `N8-11` ⓑ Cloudflare Access · `N8-13` ⓐ 표지 교체 (둘 다 CONFIRMED) |
| R8-05 | 전 route baseline 재생성에서 스테일 · 회귀가 섞임 | 중 | `=all` + 연결성분 분해 · 설명 안 되면 멈춤 (`R-BASELINE-1`) |
| R8-06 | 접근성 감사 도구가 대량 위반을 보고해 Stage 가 길어짐 | 중 | 위반을 `D-01`/가값으로 먼저 매핑, 신규 결함만 수정 · 범위 넘으면 사용자 보고 |
| R8-07 | 실기기 · SR 수동 점검을 사용자가 수행하지 못함 | 중 | 절차를 30~60분 묶음으로 · 미실행분은 항목별 수용 |
| R8-08 | Handoff 장부의 ID 충돌 · 누락 | 높음 | `N8-22` 접미사 · AC-8-79 대조 |
| R8-09 | 삭제 후 Guard 흐름(아이 데이터 없음 → 온보딩) 이 기존 Stage 2 판정과 충돌 | 중 | `N8-10` 결정 + `me` 응답 Mock 으로 재현 · Stage 2 Guard 회귀 |
| R8-10 | 프리뷰 빌드에 dev 코드가 섞여 배포 | 중 | `assert:preview` (AC-8-66) |
| ~~R8-11~~ | ~~Figma 라이브 조회 불가 상태 지속~~ | — | **닫음** — design-agent 2026-11-20 라이브 실측 (`N8-30` · `M8-5`) |
| R8-12 🆕 | Pages 의 *Enable access policy* 가 **preview 배포만** 보호해 `*.pages.dev` 본 도메인이 공개로 남음 (공식 문서) | 높음 | 절차서에 Known issues 단계 포함 · AC-8-69 가 **두 URL 모두** 비인가 차단을 확인 · 확인 전에는 URL 을 공유하지 않는다 |
| R8-13 🆕 | 검사한 산출물과 배포된 산출물이 다름 (Git 연동 빌드) | 중 | Direct Upload 권고(§5.6) · Git 연동이면 빌드 단계에 `assert:preview` |
| R8-14 🆕 | `C8-10` required 추가로 기존 `Me` fixture · 테스트 다수가 parse 실패 | 낮음 | `S8-A` 한 단위에서 fixture 일괄 갱신 · AC-8-93 · AC-8-76 회귀 |
| R8-15 🆕 rev 2.2 | 전체 삭제가 화면 밖에서 완료되면 기기에 아동 데이터 잔존 (`VG8-C-11`) · ⓐ 채택 후에도 표시 없는 **다른 기기**는 남음 · 현 Mock 은 조회가 진행을 밀어 재현 안 됨 | 높음 | `N8-31` (§5.7) · AC-8-97~99 · 다른 기기 잔존은 Verdict 때 수용 여부 확인 + Handoff 출시 전 목록 후보(서버 신호 필요 시 contract 변경 → 사용자 승인) |
| R8-16 🆕 rev 2.3 | 상용 표지 원본 3개가 **git 이전 커밋**에 남는다 (`H8-7-N3`) — 작업 트리 · 프리뷰 산출물에는 0 | 낮음 (저장소 private) | 이력 재작성 **하지 않음** (사용자 별도 지시 없이 히스토리 변경 금지) · 저장소 공개 · 외부 공유 전 확인 항목으로 Handoff 출시 전 목록 후보 · §12.5 Q-4 |
| R8-17 🆕 rev 2.3 | Mock fixture 의 책 **제목 · 저자** 가 실제 상용 도서(Figma 값) — 프리뷰(Access 제한) 에 노출 (`H8-7-N4`) | 중 | `N8-13` ⓐ 범위는 표지 한정 — 제목 · 저자는 변경 0 · `P3-BIP-19` 법무 확인 항목에 함께 기록 · §12.5 Q-5 |
| R8-18 🆕 rev 2.3 | 프리뷰 빌드가 `sessionStorage['haru:scenario']` 계층을 읽음 — 개발자 도구로 값을 넣으면 시나리오 전환 가능 (`H8-7.3`) | 낮음 (가상 데이터 · 접근 제한) | 관찰 기록 · QA 판단(§12.5 Q-6). 막는 변경이 필요하면 범위 판단 후 사용자 승인 |

---

## 15. Open Decisions

### 15.1 PRD ↔ Figma 충돌

**직접 충돌 0** — Stage 8 대상 화면은 Figma 에 없다(§0.1). PRD 내부 충돌 1건: §7.8 "계정·구독 — 요금제 확인/변경" ↔ FR-26 P2 · §9 베타 무료 → `N8-05`.

### 15.2 결정 목록 `N8-xx` — 전부 `CONFIRMED (D8-1)` (rev 2)

근거: `docs/decisions/stage-8-approvals.md` `D8-1` (2026-11-20, user) — 따로 물은 3건(`N8-02` · `N8-11` · `N8-07`/`Q8-12`)은 사용자 선택, 나머지는 **각 문서의 권고안**으로 확정. 초판의 선택지·근거 서술은 개정 이력(초판)으로 대체한다.

| ID | 질문 | 확정안 | 라벨 |
|---|---|---|---|
| `N8-01` | C-13 화면별 소스 (§16 9건) | **② 전부 design-agent 명세** + 디자이너 요청서 병행 발송 (`Q8-01` ② · `Q8-21`) | CONFIRMED (D8-1) |
| `N8-02` | 탈퇴 = 전체 삭제인가 | **ⓐ 두 기능으로 분리** — 전체 데이터 삭제 = 아동 데이터 삭제 · 계정 유지 / 탈퇴 = 계정 + 전체 데이터 삭제 (사용자 선택) | CONFIRMED (D8-1) |
| `N8-03` | 세션 녹음 삭제 범위 안내 | **ⓐ** 원본 오디오 + 하이라이트 클립 삭제, 대화 기록·관찰 유지 명시 (법무 확인 병행) | CONFIRMED (D8-1) |
| `N8-04` | 삭제 SLA 안내 문구 | **ⓐ** 기한 수치 없음 + 진행 상태 표시 | CONFIRMED (D8-1) · 법무 SLA 는 Handoff 출시 전 차단 |
| `N8-05` | 계정 화면 요금제 표시 | **ⓐ 미표시** | CONFIRMED (D8-1) |
| `N8-06` | 동의 이력 보기(C-19) | **ⓑ 제외** — Handoff 에 contract 요구(`C8-6`)만 (`Q8-20`) | CONFIRMED (D8-1) |
| `N8-07` | 미가입 기기 draft 삭제 위치 | **`Q8-12` ⓓ — 온보딩 Trial 안내(C13-11) 아래 TextLink** (사용자 선택). 초판 권고 ⓑ(`/onboarding/saved`)는 `M8-2` 로 부적합 판명 — Figma `179:1809` · 제출 후 화면 | CONFIRMED (D8-1) |
| `N8-08` | 삭제 확인 강도 | **ⓐ ConfirmDialog 1회** | CONFIRMED (D8-1) |
| `N8-09` | 삭제 진행 중 쓰기 차단 코드 | **ⓐ 신규 `ACCOUNT_DELETION_PENDING`(409)** — 30종 | CONFIRMED (D8-1) |
| `N8-10` | 삭제 · 탈퇴 완료 후 앱 상태 | 전체 삭제 **ⓐ** (완료까지 진행 표시 → 로컬 정리 → Guard 가 온보딩) · 탈퇴 **ⓐ** (요청 성공 즉시 로컬 정리 + 세션 종료 → welcome + 1회 안내) | CONFIRMED (D8-1) |
| `N8-11` | 프리뷰 호스트 · 접근 제한 | **ⓑ Cloudflare Pages + Cloudflare Access** (사용자 선택). 계정 생성 · Access 설정 · 배포 = **사용자 수행** (`S8-I-U`) | CONFIRMED (D8-1) |
| `N8-12` | 프리뷰 Mock 시나리오 전환 | **ⓑ** `?scenario=` 쿼리만 · 패널 UI 0 | CONFIRMED (D8-1) |
| `N8-13` | 상용 표지 · 에셋 파이프라인 | **ⓐ** 프리뷰 전 상용 표지 중립 대체 + 파이프라인 구현 (대상 = 저장소 실제 **3종** — rev 2.3 정정, `H8-7-N1`. 초판 "4종" 은 오기) | CONFIRMED (D8-1) · C-17 관계는 Handoff 출시 전 항목 |
| `N8-14` | `VG6-D-12` 앱 공통 Back 규칙 | 기록 없으면 논리적 부모로 `replace` — 부모 표 = Spec §6.3 (`Q8-17`) | CONFIRMED (D8-1) |
| `N8-15` | `VG6-H-09` | **A + ⓑ-1** (실측 실패 시 ⓑ-2) · 범위에 SettingsMenu · Stage 8 화면 포함 (`Q8-15`) | CONFIRMED (D8-1) |
| `N8-16` | `VG6-H-06` `Text tracking` prop | **수용** (조건 3) (`Q8-16`) | CONFIRMED (D8-1) |
| `N8-17` | `v2-material` 드리프트 | `S8-H` 원인 분해 → 설명되면 재생성, 아니면 멈추고 보고 | CONFIRMED (D8-1) |
| `N8-18` | `@axe-core/playwright` (dev 의존) | **도입** + `color-contrast` 를 끄지 않고 장부 매핑 (`Q8-18`) | CONFIRMED (D8-1) |
| `N8-19` | 수동 점검 실행 | 사용자가 §12.3 A~F 실행 · Android 미보유분 NOT VERIFIED 수용 | CONFIRMED (D8-1) |
| `N8-20` | 가값 재제시 | Final QA 리포트 목록 → Orchestrator 항목별 재제시 (`#10-4`) · 신규 `P-41` 등록 (`Q8-19`) | CONFIRMED (D8-1) |
| `N8-21` | WORKFLOW_STATE 미처리 행 처분 | `S8-0` 대조 → 닫음 / 수정 / Handoff / 출시 전 목록 4분류 | CONFIRMED (D8-1) |
| `N8-22` | P2-BIP ID 충돌 | **ⓐ** 접미사 `(A)` / `(R)`, 재번호 금지 | CONFIRMED (D8-1) |
| `N8-23` | 알림 설정 화면 | **ⓐ 제외** — Frontend Complete 예외 목록에 명시 | CONFIRMED (D8-1) |
| `N8-24` | `L-02` 약관 실제 URL | 프리뷰는 Mock URL · Handoff 출시 전 차단 | CONFIRMED (D8-1) |
| `N8-25` | 프리뷰 fixture 정리 (`OBS-5-7`) | `S8-A` 에서 정리 | CONFIRMED (D8-1) |
| `N8-26` | `S2-CONSENT-1` `signup_oauth` | **ⓐ** `consentSourceFor()` 1함수 수정 | CONFIRMED (D8-1) |
| `N8-27` | 기획·디자이너 대기 항목 | Frontend Complete 예외 목록 등재, 구현 변경 0 | CONFIRMED (D8-1) |
| `N8-28` | Stage 8 분할 | **ⓐ 분할 안 함** | CONFIRMED (D8-1) |
| `N8-29` | 탈퇴 후 1회 안내 형태 | welcome(`179:1701`) 위 **Toast neutral** (`Q8-11` ⓐ) | CONFIRMED (D8-1) |
| `N8-30` | Figma 라이브 조회 복구 | **닫음** — design-agent 2026-11-20 라이브 실측 (Spec §0 · `M8-5`) | CLOSED |
| **`N8-31`** 🆕 rev 2.2 | 화면 밖 · 폴링 상한 후 전체 삭제 완료 시 로컬 정리 (`VG8-C-11` High · privacy) | 옵션 ⓐ~ⓓ = §5.7. 권고 **ⓐ** 요청 id 기기 표시 + `app/providers` 감시자(Guard 앞) · 정리 소유자 1곳 · 다른 기기 미표시 한계는 R8-15 | ~~NEEDS DECISION~~ → **CONFIRMED (D8-2) ⓐ** (rev 2.3 동기화 — 다른 기기 잔여 R8-15 는 Handoff 한계로 수용) · 구현 = `S8-F` |

가값 (rev 2.2): **`P-42`** 전체 삭제 폴링 5s × 60회(5분) — `VG8-C-10`, 현 구현값 `DELETION_POLL_INTERVAL_MS` · `DELETION_POLL_MAX_READS`. 서버 SLA(`L-xx`) 확정 시 교체. **Stage 8 Verdict 때 사용자 확정** 후 `docs/decisions/stage-0-approvals.md` §4 에 등재(그 전 등재 0 — `P-41` 과 같은 절차). rev 2.3: `D8-2` 에서 사용자가 값 확정을 선택하지 않아 **가값 유지** — Final QA 가값 재제시 대상. 같은 절차의 신규 가값 **`P-43`**(로그인 *Create an account* 대비 4.02:1 — `D8-3`).

**rev 2 에서 새로 생긴 결정 0건** (rev 2.2 에서 `N8-31` 1건 추가). `C8-10`(`Q8-10` ⓐ) 은 `D8-1` 이 확정한 Spec 권고안의 Plan 반영이다.

### 15.3 기존 미결의 변화

| 미결 | 변화 |
|---|---|
| PLANNING Stage 8 "Blocking decisions" (탈퇴 = 전체 삭제 · SLA · 구독 · 호스팅) | → `N8-02` · `N8-04` · `N8-05` · `N8-11` |
| `N7-23` (리포트 상세 Back 임시 규칙) | → `N8-14` 로 일반화 |
| `N7-09` (`D4-40` 세션 목록 빈 상태) | → AC-8-20 |
| `OAQ-17` (녹음 삭제 세션 종결 표현) | 유지 — enum 추가 0 (`C8-7`) |
| `OAQ-13` · `OAQ-14` | 유지 — Handoff NEEDS DECISION |

### 15.4 PRD 수정 대상 후보 (지금 고치지 않는다 — `D-24` 절차는 사용자 지시 시)

- ~~`N8-03` ⓑ 채택 시 NFR 문장~~ — ⓐ 채택으로 해당 없음.
- `N8-05` ⓐ (요금제 미표시) → §7.8 "계정·구독 — 요금제 확인/변경" 문구가 MVP 화면과 어긋남 (FR-26 P2 와 함께 정리 후보).
- `N8-02` ⓐ (분리) → §7.8 에 "전체 데이터 삭제 = 계정 유지 / 탈퇴 = 계정 포함" 관계 명시 후보.
- `N8-06` ⓑ · `N8-23` ⓐ → §7.8 · §12.1 의 동의 이력 · 알림 설정 화면은 MVP Frontend 미구현 (Frontend Complete 예외).

---

## 16. C-13 대상 — Figma 에 없는 화면 (`N8-01` ② 전부 design-agent 명세 — CONFIRMED `D8-1`, Spec §2)

| ID | 화면 / 상태 | 근거 | Figma 부분 근거 | 권고 |
|---|---|---|---|---|
| `C13-S8-1` | 설정 목록 확장 (`ACCOUNT` 그룹 행 추가) | C-16 · §7.8 | DRAFT `321:1537` (명세 시각화) | ② |
| `C13-S8-2` | 데이터 관리 `/settings/data` (보관 정책 · 진입 · 진행 상태 카드) | FR-21 | 없음 | ② |
| `C13-S8-3` | 세션 녹음 목록 · 행 상태 4종 · 빈 상태 | FR-21 · `D4-40` | 없음 | ② |
| `C13-S8-4` | 삭제 확인 다이얼로그 2종 (세션 녹음 · 전체 데이터) | FR-21 | ConfirmDialog #22 | ② |
| `C13-S8-5` | 전체 삭제 진행 상태 (received · processing · completed · failed · already requested) | FR-21 · NFR | 없음 | ② |
| `C13-S8-6` | 계정 `/settings/account` + 탈퇴 확인 + 탈퇴 후 안내 | §7.8 | 없음 | ② |
| `C13-S8-7` | 미가입 기기 draft 삭제 진입 · 확인 — Trial 안내(C13-11) 아래 TextLink | QA-2R-004 | 없음 — 디자이너 프레임 변경 0 (`Q8-12` ⓓ) | ② |
| ~~`C13-S8-8`~~ | ~~동의 이력 (선택)~~ | C-19 | — | **만들지 않음** (`N8-06` ⓑ) |
| `C13-S8-9` | 공통 상태 (Loading · Error · Offline) — 신규 화면 | #22 | 없음 | ② (#22 확정) |

→ **9건 중 8건 구현** (`C13-S8-8` 제외) · Figma 디자이너 프레임 0 (design-agent 라이브 실측) · 디자이너 요청서 병행 (`Q8-21`).

---

## 17. Handoff to design-agent

초판 §17 의 10개 항목은 `docs/design/stage-8-design-spec.md` (APPROVED `D8-1`)로 **완료**됐다. rev 2 이후 design-agent 에게 남는 일:

1. 각 구현 단위 후 **Visual Gap** (§12.1 — 최우선 규칙 5). `S8-B`·`S8-C`·`S8-D` 는 Spec §2 대비, `S8-F` 는 `VG6-H-09` 측정, `S8-G`·`S8-H`·`S8-I` 는 baseline 분해.
2. rev 2 로 Plan 이 Spec 과 맞춰진 지점(`M8-1`~`M8-6`)에서 **Spec 수정은 필요 없다** — Spec 이 이미 해당 내용을 담고 있다. 다만 Spec 머리말 "Based on: Plan 초판" 은 rev 2 로 갱신 대상 (design-agent 소관, 다음 Visual Gap 때 함께).
3. 디자이너 요청서 `R8-##` 발송 결과(`Q8-21`)가 오면 최우선 규칙으로 재정렬 (R8-01).
4. (rev 2.2) `N8-31` 결정 후 Spec §2.5(이탈 중 완료 — 완료 Toast 가 어느 화면 위에 뜨는가) · §6.1(폴링 상한 `P-42`) 개정 (`stage-8-visual-gap.md` S8-C §4 "결정 후 개정"). ⓐ 채택 시 새 UI 0 — 기존 Toast · Guard pending 표현만.

---

## 18. Frontend 단계에서 검증 불가 → `BACKEND_INTEGRATION_PENDING` 예상 요약

- AC 서버 부분: AC-8-11 · 15 · 18 · 22 · 27 · 32 · 33 · 34 · 35 · 45 · 60 · 61 · 93 · **98** (rev 2.2) (AC-8-39 는 rev 2 에서 "미구현 확인"으로 바뀌어 PENDING 아님).
- 신규 `P8-BIP-01`~`09` (§10 — `09` 는 rev 2 `C8-10`).
- 전 Stage 이월 PENDING 전체 — 장부 `docs/BACKEND_HANDOFF.md` §6.
- NOT VERIFIED 예상: AC-8-55 · 90 · 91 · 92 (사용자 미실행 시) · Android 실기기 전부 · AC-8-68~71 (`S8-I-U` 미실행 시).

---

## 19. Exit Criteria

1. In Scope AC 전부 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` (또는 항목별 사용자 수용) — `rules/qa.md` §2.
2. 데이터 관리 UI · 탈퇴 동작 확인 (동의 이력은 필수 아님 — C-19).
3. 전 Stage PENDING 이 Handoff 문서에 1:1 (AC-8-79).
4. `BACKEND_HANDOFF.md` 필수 항목 충족 (AC-8-80).
5. Backend 코드 부재 (AC-8-01).
6. Mock 프리뷰 배포(Cloudflare Pages + Access, `S8-I-U` 사용자 수행) 완료 또는 사용자 보류 결정 기록.
7. 최종 보고 → **STOP**. Backend implementation · Supabase migration · Node API · STT · AI Analysis · Render Backend deployment 자동 시작 금지.

---

## 20. 승인 체크포인트 결정 목록

- ✅ **승인 완료** — `D8-1` (2026-11-20, user): Plan + Design Spec 승인, `N8-01`~`N8-29` · `Q8-01`~`Q8-21` 확정(§15.2), `N8-30` 해소.
- 남은 사용자 행위 (결정이 아니라 수행): `S8-I-U` 프리뷰 배포 · `S8-M` 수동 점검 · Verdict 시점의 NOT VERIFIED 항목별 수용 · `N8-20` 가값 재제시 응답.
- ✅ **승인 후 plan-agent 후속** — rev 2 에서 완료: `API_CONTRACTS.md` **Rev 12** 등재(`C8-1`~`C8-10` · `ACCOUNT_DELETION_PENDING`) · 이 Plan 결정 반영. 남은 것: `PLANNING.md` Stage 8 절 갱신은 Orchestrator 지시 시.

---

## 21. 이 Plan 과 함께 생성한 Handoff 초안 (`rules/workflow.md` §5 ①)

| 문서 | 상태 | 완성 책임 (`S8-J`) |
|---|---|---|
| `docs/BACKEND_HANDOFF.md` | DRAFT — 전 Stage PENDING 장부 · API 목록 · 출시 전 차단 | Mock 위치 · Screen/Feature 열 · 결정 반영 |
| `docs/DATA_REQUIREMENTS.md` | DRAFT — Stage 2~8 Delta · 삭제/보관 | `DATA_MODEL.md` 본문 이관 |
| `docs/AUTH_REQUIREMENTS.md` | DRAFT | 결정 반영 |
| `docs/RECORDING_UPLOAD_SPEC.md` | DRAFT — RU-1~21 · P4 · P4B | 구현 상수 · Mock 위치 |
| `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` | ⚠️ **파일 미생성** — plan-agent 의 Write 가 도구 가드(*"Subagents should return findings as text"*)에 막혔다. 초안 본문은 **부록 A** 에 있다. **rev 2 결정: development-agent 가 `S8-J` 에서 부록 A 를 원본으로 이 파일을 생성하고 완성한다** (plan-agent 는 다시 생성하지 않는다) | **생성** + 부록 A 이전 + 결정 반영 |
| `docs/ERROR_CODES.md` | DRAFT — 29종 + 후보 1 | `N8-09` ⓐ 확정 반영(30종) · details 모양 |

---

## 부록 A. `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` 초안 본문 (파일 생성 차단으로 여기에 보관)

> Status (이전 시 머리에 둘 것): DRAFT (초안 — plan-agent, 2026-11-20). **파일 생성 · 완성 = development-agent (`S8-J`)**, 검증 = stage-qa-agent.
> Frontend 는 AI · STT Provider 를 호출하지 않는다. 분석은 Async Analysis Contract(상태 · 결과 조회)로만 다루며, 사용자에게 보이는 생성 문구는 **API 응답 값만 표시**한다 (`rules/architecture.md` §8).

### A.1 파이프라인

```
Audio (recordings) → STT → PII Redaction → Metrics Extraction → Capability Signal Analysis
→ Safety Validation → Structured Result → Short Feedback / Highlight Clip / Profile Update / Report
```

| 단계 | 요구 | ID |
|---|---|---|
| Job | `analysis_jobs` 멱등 · 재시도 · 업로드 확정 시 생성 | P4-BIP-12 · P5-BIP-06 |
| 입력 | non-seekable WebM · 디코드 실패 part 가능 — `duration` 메타 신뢰 금지 | RU-3 · RU-17 |
| STT | `SpeechToTextProvider` 어댑터 뒤 · 벤더 아동 데이터 조건(ZDR · DPA) — 법무 L-06 | — |
| PII | Transcript · 회고 `note` 는 AI 입력 전 redaction · 아이 이름 치환 토큰 · 로그 원문 금지 | P5-BIP-05 |
| 품질 | 저품질 → `analyzed` + `excluded_low_quality` (정량 분석 · 리포트 집계 제외, 세션 기록 · 피드백 보존) | P5-BIP-07 |
| 민감 발화 | 세그먼트 분석 제외 · 전사 마스킹 · 피드백 중립 · 세션 단위 신규 outcome 없음 | P5-BIP-08 |
| SLA | 세션 분석 ≤ 24h | P5-BIP-11 |
| 실패 | `failed → analyzing` 재시도 정책 · 영구 실패 표현(contract 는 `failed` 유지 — Frontend 는 "조금 더 걸린다") | P5-BIP-12 |
| 대화 전용 | `conversation_only` → `ANALYSIS_NOT_AVAILABLE` | P4-BIP-16 · P5-BIP-13 |
| 녹음 미수신 | 로컬 14일 삭제로 녹음이 오지 않는 `completed` 세션 종결 (`OAQ-17`) | P5-BIP-16 · RU-16 |

### A.2 산출물별 요구

| 산출물 | 요구 | ID |
|---|---|---|
| 짧은 피드백 | 검수 템플릿 + 안전 슬롯 + 금지어 · 안전 필터 이중 검증 + fallback · 1~2줄 · 진단 · 비교 금지 · 없으면 `text: null` · `ai_generation_logs` | P5-BIP-09 |
| 피드백 알림 | `short_feedback_ready` push · payload = `sessionId` 만 · 도착 URL `/session/:sessionId/feedback` | P5-BIP-10 |
| 하이라이트 클립 | 10~15초 추출 · private · 만료(`OAQ-13`) · signed URL · CORS(`P8-BIP-06`) | P5-BIP-14 · P7-BIP-10 |
| 역량 스코어 (온보딩) | `rules/capability-score` 그대로 재사용 (응답 평균 1.0–5.0, 결측 제외) | P2-BIP-07 |
| 페르소나 | 템플릿 + LLM 슬롯 · 금지어 · fallback pool · 3초 · 실패 시 fallback 200 · 재생성 트리거 · 빈도 | P2-BIP-08 · P6-BIP-02 |
| 프로필 갱신 | 스냅샷 갱신 규칙(전문가 결정) · `GET /profile` 이 제출 직후에도 완성 | P6-BIP-01 · P6-BIP-12 |
| 추천 | cold(~3세션) → warm(4회~) · `recommendation_logs` · 회고 신호 · 역량 순환 · 같은 주제 연속 3일 지양 · 재추천 새 Prompt 세트 · state vector · `owned_books` 제외 | P3-BIP-02 · P5-BIP-03 · P6-BIP-03~06 · P2-BIP-13(R) · 14(R) · 15(R) |
| Prompt | 라이브러리 · 감수 · `phase` · `pageRef` · 제시 개수 = 서버 정책 | P3-BIP-03 · 13 · 14 |
| 리포트 | 28일 주기 · eligibility(3세션 + 3600초, 저품질 제외 — #17) · 이월 · 재시도 3회 → 익일 · `delayed` · narrative · 근거 · 페르소나 히스토리 · 부모 피드백 요약 · 발행 불변 | P7-BIP-02~08 · 15 · 16 |
| Growth · Moment | stage · level 산식 (서열 · 결핍 표현 아님) · Moment 선정 · 마스킹 · 안전 통과 문장만 | P7-BIP-02 · 03 |

### A.3 콘텐츠 안전 · 아이 이름

- 버블 = 검수 템플릿 + 안전 슬롯만 (자유 생성 · TTS 금지). 분석 · 페르소나 · 리포트 문구 = 금지어 + 안전 필터 이중 검증. 진단 · 판정 · 비교 금지 (PRD §8.4). 모든 생성은 `ai_generation_logs` (R3, PII 금지).
- 서버가 새로 만드는 문장(완료 버블 · `characterLine` · 리포트 발행 알림)은 **생성 시점의 현재 아이 이름** — 발행 리포트 스냅샷은 동결 (P7-BIP-14 · `N7-16`). AI 입력에는 이름 치환 토큰.

### A.4 서버 생성 문구 — Frontend 표시 제약

| 문구 | 제약 | 근거 |
|---|---|---|
| 세션 시작 인사 `bubble` | 1줄 clamp · ≤240px @ SF Pro Semibold 16 (≈28자) · 이름을 문장 끝에 두지 않기 · 없으면 null | P4-BIP-11 · `D4-21` · `D4-22` |
| `reminderBubble` | `bubble` 과 같은 길이 요구 | `D4-59` |
| 완료 버블 · `subtext` | 사실 일치 · 대화 전용은 녹음 시간 언급 금지 · `min` 표기 규칙 | P4B-BIP-02 · 05 · `D4-109` |
| 출석 스티커 문구 | streak · `Day N` 금지 | P4-BIP-18 |
| `characterLine` | 길이 요구 (`API_CONTRACTS.md` §3.8) | `W-5` |
| `reason` | 1~2문장 · 진단 금지 · 없으면 null | P3-BIP-26 |
| 짧은 피드백 | 1~2줄 · 없으면 null | P5-BIP-09 |

### A.5 결정 대기

`OAQ-13` · `OAQ-17` · P6-BIP-01(전문가) · P7-BIP-04 · L-06.

---

## 부록 B. `N8-21` 처분표 — WORKFLOW_STATE 미처리 행 대조 (`S8-0`, plan-agent 2026-11-20)

대상: `docs/workflow/WORKFLOW_STATE.md` §3 미결 항목 표에서 상태가 ✅·해소·완료가 아닌 행 전부 + §1 Next Step · §2-0 · §4 · 진행 로그에 남은 "결정 대기" 묶음. 대조 기준 = HEAD `186b396` 작업 트리(읽기만) + `stage-1`~`stage-7` approvals · QA 리포트 · handoff.
분류: **닫음**(이미 해결 — 근거 경로) · **수정**(담당 단위 지정) · **Handoff**(`S8-J` 문서 반영) · **출시 전**(Frontend Complete 이후 · 외부 의존 — `S8-K` 리포트 예외 목록에 기재).
WORKFLOW_STATE 행 자체는 이 표로 수정하지 않는다 — 행 정리는 B.2-⑨ (Orchestrator).

### B.1 닫음 (37)

| # | ID | 근거 (경로) |
|---|---|---|
| 1 | `S1-D2-5` · `S1-D2-6` · `S1-G-1` · `S1-G-2` | "결정됨" 행 — `stage-1-approvals.md` §8, Stage 1 `PASS` |
| 2 | `S1-D2-1` (정보) | `pnpm-workspace.yaml` override 이동은 사실 기록. Stage 1 Plan 문구는 역사 문서라 정정 대상 아님 |
| 3 | `S1-E-1` (정보) | Spec 예시 클래스명 차이 — 구현 클래스가 정본, 후속 Spec 들이 실제 클래스 사용 |
| 4 | `S1-E-3` (정보) | 탭 마운트는 Stage 3 에서 완료 · Stage 3 `PASS` (`stage-3-qa-report.md` §14) |
| 5 | `S1-E-5` (정보) | `apps/web/package.json:9`(`predev`) · `:11`(`prebuild`) = design-tokens 선행 빌드 |
| 6 | `S1-G-6` (아래쪽 중복 행 — 전체 프레임 임계값) | `stage-2-approvals.md` §9 결정 → 이후 `R-BASELINE-1` ④ 로 대체 (`playwright.config.ts` `VISUAL_THRESHOLD_FRAME` 0.02) |
| 7 | `QA-1-003` gallery nav 겹침 | `e2e/support/gallery.ts:112` `hideGalleryNav` (`QA-7-001` 수정, Stage 7 `PASS`) |
| 8 | `QA-1-004` devWarn | `packages/ui/src/lib/devWarn.ts` 머리 주석 ④ — `import.meta.env.DEV` 게이트 · 고정 문구 · 살균 범위 정정 |
| 9 | `S2-SRC-1` · `S2-ONB-3` | `CLAUDE.md` Source of Truth 표 "온보딩 문항" 행 (등재 2026-09-28, `stage-2-approvals.md` §9) |
| 10 | `S2-CONSENT-1` | **이미 구현됨** — `apps/web/src/features/consent/model/consentSelection.ts:97` (google·apple → `signup_oauth`) · 테스트 `__tests__/consentSelection.test.ts:204` · 커밋 `20f6a26`. ⇒ `N8-26` ⓐ 는 **구현 0**, AC-8-45 는 기존 테스트 + 요청 로그 확인만 (B.2-②) |
| 11 | `S2-HOME-1` | `stage-2-approvals.md` §9 워드마크 텍스트 유지 · `AD-S2-14` (`pages/home/HomeTopBar.tsx:51`) |
| 12 | `S2-COPY-1` | `stage-2-approvals.md` §9 빈 슬롯 유지 (InfoRow 미렌더). 실측 후 채우기는 운영 데이터 의존 — 출시 전 목록 대상 아님(빈 상태가 결정값) |
| 13 | `S2-ONB-1` | `stage-2-approvals.md` §9 · §9.1 (Q1·Q2·Q4 필수) · 커밋 `20f6a26` |
| 14 | `S2-AUTH-2` (정보) | 허용 차이 `AD-S2-13` 등록 |
| 15 | `S2-CARD-1` · `S2-WELCOME-1` | `stage-2-approvals.md` §9 현재 유지 + 허용 차이 |
| 16 | `S2-FOLLOW-1` · `S2-HOME-2`(중복 행) · `QA-2-004` | 본문은 ✅ 해소인데 상태 열이 "진행 중"·"확인 필요"·"PARTIAL 사유" 로 남은 **표기 스테일** — 행 정리는 B.2-⑨ |
| 17 | `S4-FIGMA-1` | 시안 `296:1127` 확정 → Stage 4b `PASS (accepted: NV-4B-2, NV-4B-3)` (`stage-4b-qa-report.md:3`) |
| 18 | `S4-DEC-2` | `N4-27` · `N4-15` · `N4-28` = 4b Plan·Spec 승인 `D4-58` · 4b `PASS` |
| 19 | `S4-DEC-3` | `N4-04` → `D4-25` · `N4-09` → `D4-29` · `N4-20` → `D4-31` (`stage-4-approvals.md`) |
| 20 | `S4-SPIKE-2` 잔여 | 정본 경로 = `D4-41` (`docs/qa/stage-4a-spike-report.md`) · iPhone 확인 = `D4-27 확인`(2026-10-18) · spike 코드 = dev 전용 유지(`apps/web/src/dev/DevGallery.tsx:44`, Production 제외 = `app/router.tsx:73` DEV 게이트, 프리뷰 표식 검사 = `assert:preview`) |
| 21 | `S4-C-1` ① | `D4-26` + `docs/design/stage-4b-design-spec.md:344` (`web-background-warning` = InlineAlert info) |
| 22 | `S4-C-1` ③ | **수정하지 않고 닫음** — dev Scenario Panel 전용(`dev/scenario-panel/scenario-selection.ts:37` 이 `group:key` 만 직렬화). Production·프리뷰에 패널 없음(`router.tsx:75` · AC-8-71), URL `?scenario=group.method:key` 로 전부 전환 가능. 4a QA `O-5` 관찰로 기록됨 |
| 23 | `S4-C-1` ④ | `docs/API_CONTRACTS.md` §5.1.1 `UploadTransport` (Rev 8.2, `S4-C`/`S4-E` 확정) |
| 24 | `S4-D-1` ① | `apps/web/src/app/providers/apiClients.ts:29` (recorder 조립) |
| 25 | `S4-D-1` ③ (정보) | `ConsentGate` fail-closed 는 의도 동작 — 4a/4b `PASS` |
| 26 | `S4-D-1` ④ | 30분 자동 종료 = clock 주입 단위 테스트(`features/recording/model/__tests__/recording-controller.test.ts`) — 4a `PASS` |
| 27 | `S4-E-1` ① | `D4-27 확인` — iPhone Safari 저장 계층 **OPFS** 실측(2026-10-18). Plan §12.3-E 관찰은 선택 |
| 28 | `S4-E-1` ② | `features/settings/model/useSignOut.ts:38·48` — 저장소 정리 함수 주입 가능 |
| 29 | `S4-E-1` ④ | 화면 이탈 세션 = `recovered_after_crash` 복구 경로(`features/recording/model/recording-recovery.ts:115`) · 4b `PASS` 회귀 범위 |
| 30 | `S4B-F1-OPEN` ① plain IconButton 글리프 색 | **현행 유지로 닫음** — Figma 근거 노드 없음(`packages/ui/src/button/IconButton.css:53`). 바꾸면 Figma 에 없는 변경(CLAUDE.md 최우선 규칙 2) |
| 31 | `S4B-F1-OPEN` ② 다른 시트 back 위치 | `D4-64` 범위 = 시간 목록만. 다른 시트는 각 Figma 노드 배치 · Stage 3~7 Visual Gap 통과 |
| 32 | `S4B-F1-OPEN` ③ 인사 없음 + 리마인드 | `docs/API_CONTRACTS.md` §3.2.2 (Rev 8.6, `D4-59`) null 거동 정의 |
| 33 | `S4B-F1-OPEN` ⑤ `reminderBubble` 타입 | `packages/contracts/src/sessions/session.ts:97` `SessionBubbleCopySchema` |
| 34 | `VG-F1-06` 320×568 하단 바 | `S4-K` 이월 → 4b `PASS` |
| 35 | `S8-DEPLOY-1` · `S8-DEPLOY-2` | 결정 `N8-11` ⓑ (`D8-1`, `stage-8-approvals.md:11`) — 실행은 기존 단위 `S8-I` · `S8-I-U` |
| 36 | §1 Stage 6 결정 대기 묶음 (`H6-3`=`VG6-E2-19` · `H6-4`=`VG6-B-11` · `H6-5`=`VG6-C-09/10` · `H6-7` · `VG6-E1-03/12/14` · `VG6-E2-06/09/20` · `VG6-B-06/07`) | `D6-9` ①~④ · `D6-10` (`stage-6-approvals.md:17-18`) · Stage 6 `PASS` |
| 37 | 진행 로그 Stage 7 결정 대기 (`VG7-B-03` · `C-02` · `C-04` · `D-08` · `E-05` · `E-06` · `E-10` · `AD7-7` · 로그인 복귀 Back) | `D7-6` · `D7-7` · `D7-8` (`stage-7-approvals.md`) · Stage 7 `PASS` |

### B.2 수정 (9)

| # | ID | 내용 (구체) | 담당 |
|---|---|---|---|
| ① | `S4-E-1` ③ | 로그아웃 확인 다이얼로그가 **미업로드 녹음도 지워진다**는 사실을 알리지 않는다 — `features/settings/copy.ts` `logOut.confirmDescription` 은 *"Onboarding answers saved on this device will be removed."* 뿐. ⚠️ **NEEDS DECISION (사용자)**: 문구 1줄 추가 여부 (ConfirmDialog = #22 명세 화면, Figma 디자이너 프레임 0). 채택 시 copy 1곳 + baseline 분해 재생성. 미채택이면 닫음 | `S8-F` (결정 후) |
| ② | `N8-26` ⓐ (`S2-CONSENT-1`) | **범위 축소** — `consentSourceFor()` 수정 불필요(B.1-10). AC-8-45 = 기존 단위 테스트 + OAuth 가입 요청 로그 확인만 | `S8-F` |
| ③ | `S4B-F1-OPEN` ④ | 시간 목록 시트 열 때 focus → body. 재현 후 수정 (AC-8-43, 기존 배정) | `S8-G` |
| ④ | `S3-PROV-2` 잔여 | dev gallery `apps/web/src/dev/ui-gallery/provisionalItems.ts` 에 **`P-19` · `P-21` · `P-26` · `P-27` · `P-28` · `P-29` 미등재** (~~P-18·20·22·23 은 등재됨~~ → **rev 2.3 정정 (`H8-6-N7`)**: 등재돼 있던 것은 `P-23` 뿐 · `P-20` 은 `--toggle-*` 확정으로 대상 아님 · `P-18`(`--list-row-height-min`) · `P-22`(`conversation_only` 카드 일러스트) **미등재**. `D8-3` — 둘 다 Final QA 가값 재제시에 **포함**, `P-18` registry 주석 정정은 development-agent). 신규 `P-41` 과 함께 등재, `P-19` 는 "사용처 0" 표기. `#10-4` 항목별 재제시(`S8-K`) 의 선행 조건 | `S8-G` |
| ⑤ | `S1-G-7` | 프리뷰 빌드 sourcemap off (기존 배정) | `S8-I` |
| ⑥ | `S1-D2-3` | Safari VoiceOver 목록 낭독 관찰 (§12.3-E, 기존 배정) | `S8-M` |
| ⑦ | `S4-D-1` ② | `docs/ARCHITECTURE.md` §10.4 `RecorderAdapter` 초안 시그니처(`stop(): RecordingPartRef[]` · `onInterruption` 등)가 구현 `apps/web/src/shared/platform/recorder/recorder-adapter.ts:91` 과 다름 → 문서를 구현 기준으로 갱신 | plan-agent (`S8-J` 전, 문서) |
| ⑧ | `S4-FIX-1` | `docs/qa/stage-3-qa-report.md:6` 스테일 경고문 정정 (§13 → §14 5회차 `PASS`) | stage-qa-agent (`S8-0`) |
| ⑨ | WORKFLOW_STATE 장부 표기 | §1 현재 위치(Stage 7 → 8) · 마지막 갱신(2026-11-15) · §2-0 Stage 3 표("대기 중") · §4 Major Stage 표(4b `BLOCKED` · 5 `PLAN_DRAFT` · 6·7·8 `NOT_STARTED` 전부 스테일) · §3 `:177` NEEDS_DECISION 문단 · B.1-16 상태 열 · B.1 전 행에 "닫음 — 부록 B" 표기 | Orchestrator |

### B.3 Handoff (5) — `S8-J`

| # | ID | 반영 문서 · 내용 |
|---|---|---|
| 1 | `S3-ROUTE-1` (`D-17`) | `BACKEND_HANDOFF.md` "Mock 전용 route 제거 대상" 절 — **대상 0**: `mockPreviewRoutes` 는 생성된 적 없음(`git log -S` 0), `app/router.tsx` · `shared/config/routes.ts` 에 Mock 전용 route 없음 (`/library/add` · `/library/gift-requests` 는 제품 route). 서재 시트는 `LibraryShelves` 내부 상태로 동작 |
| 2 | `S3-PROMPT-1` (`D-8`) | `Prompt.pageRef` 책별 페이지 앵커 데이터 — BIP + **콘텐츠 제작 범위** 명시 (`BACKEND_HANDOFF` · `DATA_REQUIREMENTS`) |
| 3 | `S4-C-1` ② | `C8-8` `GET /v1/recordings/:recordingId` (`API_CONTRACTS` 등재는 S8-A 소관 · `RECORDING_UPLOAD_SPEC` 표) |
| 4 | `S4-E-1` ⑤ ⑥ ⑦ | `RECORDING_UPLOAD_SPEC.md` `RU-14`~`RU-18` (초안 등재됨) — ⑤ 처리 순서 우선 + 짧은 재시도 ⑥ 7일 안내 기준 시각 ⑦ 디코드 실패 part 도 업로드됨 → 서버 측 수용·검증 요구 |
| 5 | `S4-DEC-4` (`N4-30`) | `DATA_REQUIREMENTS.md` — `abandoned` 이 10분 방치와 사용자 폐기를 구분하지 않음(`D4-13`). Audit·지표가 필요하면 사유 값 추가는 별도 결정 |

### B.4 출시 전 목록 (7) — `S8-K` Final QA 리포트 · `BACKEND_HANDOFF` 출시 전 절

| # | ID | 내용 · 의존 |
|---|---|---|
| 1 | `L-02` | 약관·개인정보방침 실제 문서·URL — 법무. 프리뷰는 Mock URL. `BACKEND_HANDOFF` 출시 전 **차단** 항목 (`S8-J`) |
| 2 | `S3-ASSET-1` (`D-13`) | Home 캐릭터 1056px 투명 원본 — 디자이너. 도착 시 에셋 파일만 교체 |
| 3 | `S3-NOTIF-1` (`D-18` · `N8-23` ⓐ) | 알림 설정 화면 — 디자이너 Figma 대기, Frontend Complete 예외 (AC-8-87) |
| 4 | `S3-COPY-1` | 증정 접수 안내 잠정 문구 — 운영 표현 확정 시 copy 값만 교체 |
| 5 | 가값 재제시 `S3-PROV-1` · `S4-PROV-1` · `P-18` · `P-22` · `P-24` (+ `P-01`~`P-43` 잔여 — `P-42` `D8-2` 가값 유지 · `P-43` `D8-3` 신규; `P-20` 은 확정이라 제외 — rev 2.3 정정 `H8-6-N7`) | `N8-20` — `S8-K` 리포트에 남은 가값 목록 + Orchestrator 항목별 재제시 (선행: B.2-④) |
| 6 | `S4-NAT-1` (`D4-1`) | Native 셸 · 네이티브 녹음 · Auth/Push Adapter · portrait lock — 후속 단계 `S4N-A`~`D` |
| 7 | `S4-DEV-1` (`N4-21`) | Android 모바일 Web 실기기 — 기기 확보 전 미검증 (4a `NV-4A-1` 수용으로 Stage 판정은 닫힘) |

**집계**: 닫음 37 · 수정 9 (`S8-F` 2 · `S8-G` 2 · `S8-I` 1 · `S8-M` 1 · plan-agent 1 · stage-qa-agent 1 · Orchestrator 1) · Handoff 5 · 출시 전 7. AC-8-44 판정 기준 = 이 표.
