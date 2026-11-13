# Stage 5 QA Report — Reflection + Async Analysis Status + Short Feedback (Frontend)

Status: **QA 2회차 재검증 (stage-qa-agent, 2026-11-11 16:0x – 2026-11-12 07:4x KST)** — 1회차 기록은 아래 §1~§9 그대로 두고, 2회차 결과는 **§10** 에 둔다. Stage Verdict 최종은 **§11** `PASS (accepted: QA-5-003, QA-5-004)` (2026-11-14) · Product Code 수정 0 · 커밋 0

## 1. Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **(최종, §11) `PASS (accepted: QA-5-003, QA-5-004)`** (2026-11-14, 사용자 항목별 수용). 2회차(§10): `INCOMPLETE` — `FAIL` 0 · `NOT VERIFIED` 2 (`QA-5-003` · `QA-5-004`) · `QA-5-001`·`002` 닫힘. 1회차: `INCOMPLETE` — `FAIL` 0 · `NOT VERIFIED` 2 (`QA-5-003` AC-5-33 · `QA-5-004` AC-5-49 스크린리더) |
| 대상 | `main` @ `fd8748d` + 미커밋 Stage 5 작업 트리 (`S5-A`~`S5-D`, handoff `H5-1`~`H5-6`) |
| 기준 | Plan `docs/plans/stage-5-plan.md` · Spec `docs/design/stage-5-design-spec.md` (둘 다 `APPROVED`, `D5-4`) · 결정 `D5-1`~`D5-12` · 가값 `P-28`·`P-29` · 허용 차이 `AD-S5-1` · VG `stage-5-visual-gap-s5b.md` · `-s5c.md` §8 |
| AC 집계 (56) | `PASS` 51 · `NOT VERIFIED` 1 (AC-5-33) · AC-5-49 = `PASS`(자동 부분) + `NOT VERIFIED`(SR 부분) · `BACKEND_INTEGRATION_PENDING` 4 (AC-5-53~56) |
| Findings | `QA-5-001` Low (docs) · `QA-5-002` Low (docs) · `QA-5-003` / `QA-5-004` = NOT VERIFIED 잔여 항목 |
| 다음 Stage | **진입 불가** — `QA-5-003` · `QA-5-004` 수동 실행 또는 사용자 항목별 명시 수용 필요. `QA-5-001`·`002`는 문서 정정(design-agent / development-agent)으로 처리 |

handoff 는 증거로 쓰지 않았다. 아래 판정은 전부 이 QA 가 직접 실행한 명령·테스트·프로브 결과다.

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS (Darwin 25.5.0, arm64) |
| Node / pnpm | v24.21.0 / pnpm 12.4.2 |
| 브라우저 | Playwright 1.63.0 · chromium-headless-shell 1243 · `workers: 1` · viewport 기본 393×852 · `reducedMotion: reduce` |
| dev 서버 | Playwright `webServer` (127.0.0.1:4319, Mock 모드). 5174 포트의 기존 프로세스는 건드리지 않음 |
| Mock 시나리오 | `?scenario=analysis:*` · `reflections:*` · `session-completion:reflection-submitted` · `recorder:crash-recovered` · `recorder:mic-permission-denied` (로그인 URL 에 부착, SPA 이동) |
| 실기기 | 없음 (iOS/Android · VoiceOver 미사용) |

## 3. Commands Executed (로그: `docs/qa/evidence/stage-5/`)

| # | 명령 | 결과 | 로그 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile && pnpm typecheck && pnpm lint && pnpm build` | ✅ EXIT 0 (기존 chunk size 경고만) | `01-install-typecheck-lint-build.log` |
| 2 | `pnpm test` (build **후** 실행) | ✅ **189 files · 2715 tests passed** (42.8s) | `02-pnpm-test.log` |
| 3 | `pnpm lint:boundaries` · `pnpm assert:no-mocks` | ✅ no dependency violations (851 modules, 3286 deps) · sentinel 0 · `haru-dev-` 0 · sharp 0 | `03-boundaries-nomocks.log` |
| 4 | `pnpm test:e2e` **전체 · 단독** (다른 Playwright 없음 확인 후) | ✅ **637 passed · 0 failed (13.8m)**, 19:36:42 – 19:50:30 KST. 실패 0 → 단독 재실행 대상 없음 | `04-playwright-full-run1.log` |
| 5 | QA 프로브 `probes/qa5-probes.spec.ts` (config `probes/qa5.config.ts`, 저장소 config 상속) — 1회차 | 17 passed · 2 failed (`P-R` 600 · 1024 — **프로브 측정 대상 오류**: 스크롤 뷰포트를 컬럼으로 잼) | `05-qa-probes-run1.log` |
| 6 | 프로브 `P-R` 수정(`.haru-app-column` 측정) 후 단독 | ✅ 3 passed | `05-qa-probes-run2-PR.log` |
| 7 | 프로브 `P-A` (별 5개까지 확장) | 393 ✅ · 320 ✘ — 60s timeout, 세션 시작 시트 `Bedtime` 대기 (프로브 준비 단계, 제품 검증 단계 전) | `05-qa-probes-run3-PA.log` |
| 8 | 7 의 실패 테스트 **단독 재실행** | ✅ 1 passed (4.0s) — 1회차(#5)에서도 같은 테스트 통과. 부하 간헐로 기록 (`OBS-5-1`) | `05-qa-probes-run4-PA320-solo.log` |
| 9 | 완료 화면 baseline HEAD ↔ 작업 트리 픽셀 비교 (zlib 디코더) | y < 465 변경 **0 px** · 변경 범위 y 465~776 (116,828 px) | `06-baseline-top-diff.json` |
| 10 | `ls apps/api supabase apps/mobile` | `No such file or directory` ×3 | (본문) |
| 11 | grep — 임의 HEX/rgb/arbitrary/inline style · `any`/`@ts-ignore` · console/저장소 API · feature 간 import · Mock import · 클립 API · `sessionFeedbackPath` 사용처 · 금칙어 · dist Secret/SDK/fixture 문구 | 아래 Matrix 각 행 | (본문) |

## 4. Requirement Matrix

증거 표기: **U** = `pnpm test` 통과 테스트(파일 › describe/it) · **E** = 전체 Playwright 실행에서 통과한 spec · **P** = QA 프로브 결과 파일(`probes/results/`) · **G** = QA grep/명령.

### 4.1 Scope · Gate

| AC | 판정 | 증거 |
|---|---|---|
| AC-5-01 | PASS | G: `ls apps/api supabase apps/mobile` → No such file ×3. `git status` 신규 파일 = `apps/web` · `packages/{contracts,ui}` · `docs` · `e2e` 만 |
| AC-5-02 | PASS | G: router diff = `/session/:sessionId/feedback` 1개만 추가 · `/reflection` route 0 · 클립 API 메서드/호출자 0 (`grep HighlightClip` — mocks 밖 0) · U `stage5-fixtures.test.ts` › "Mock API Client 에 클립 메서드가 없다" · 프로필/리포트/데이터관리 UI 0 |

### 4.2 Contracts

| AC | 판정 | 증거 |
|---|---|---|
| AC-5-03 | PASS | U `contracts stage-5.test.ts` › ReflectionCheckKey "5값 …" · `enums.test.ts` 스냅샷(36종) |
| AC-5-04 | PASS | U `stage-5.test.ts` › SubmitReflectionRequest: 미등록/중복 키 거부 · note trim 1~500 · 세 필드 빈 요청 거부 · key 누락 거부 |
| AC-5-05 | PASS | U `stage5-fixtures.test.ts` › 모든 Mock 상세(새·완료·진행 중·기기 seed) `reflection` key parse · key 누락 거부 · `sessions.test.ts` |
| AC-5-06 | PASS | U `stage-5.test.ts` › SessionAnalysisStatus: refine · 완료 계열 4값 · "`metricsPreview` · 전사 · 발화 · 지표 필드가 없다" |
| AC-5-07 | PASS | U `stage-5.test.ts` › HighlightClip · SignedMediaUrl · `stage5-fixtures.test.ts` 클립 fixture parse + 메서드 0 |
| AC-5-08 | PASS | U `stage-5.test.ts` › "error code 신규 0 — 29종 유지" · 공개 표면 · G: Stage 5 파일 `any`/`@ts-ignore` 0 |
| AC-5-09 | PASS | G: `API_CONTRACTS.md` Rev 9 — §3.10~3.12 schema · `GET /v1/reflection-form` 삭제 · §5.4 key 목록 = Mock key 목록(`analysis` 13 · `reflections` 7 · `session-completion:reflection-submitted`) 일치. 단 fixture 내용 서술 1곳 불일치 → `QA-5-002` (Low, AC 범위인 endpoint·schema·key 와 무관) |

### 4.3 Mock

| AC | 판정 | 증거 |
|---|---|---|
| AC-5-10 | PASS | U `MockReflectionApi.test.ts` › success/시나리오 · `MockAnalysisApi.test.ts` › 전 key parse |
| AC-5-11 | PASS | U `MockReflectionApi.test.ts` › 멱등 · 세션당 1건 (같은 key replay · `IDEMPOTENCY_KEY_REUSED` · `REFLECTION_ALREADY_SUBMITTED` · 실패 미보관) |
| AC-5-12 | PASS | U `MockReflectionApi.test.ts` › 허용 상태 (ready/recording/paused/abandoned → `SESSION_INVALID_TRANSITION`) · `invalid-transition` 1회차만 |
| AC-5-13 | PASS | U `MockAnalysisApi.test.ts` › "표시 시나리오 — §8 표" · 공통 시나리오 · `ANALYSIS_NOT_AVAILABLE` |
| AC-5-14 | PASS | U `MockAnalysisApi.test.ts` › "success — … 결정적 worker 전이" 2건 |
| AC-5-15 | PASS | G: `apps/web/src` 에서 `mocks` import = `mocks/` · `dev/` · `test/harness.tsx` 뿐 · features/entities/pages 에 fixture 문자열(`Nova`·세션 uuid) 0 · Adapter 생성 지점 = `app/providers/apiClients.ts` 1곳 · `lint:boundaries` ✔ |
| AC-5-16 | PASS | G: §5.4 등재 · U `scenario-selection.test.ts` · `ScenarioPanel.test.tsx` (그룹 3) · E `scenarios.spec.ts` 통과 · URL `?scenario=` 전환은 E/P 전부가 사용 |

### 4.4 회고 카드 (Figma `91:691`)

| AC | 판정 | 증거 |
|---|---|---|
| AC-5-17 | PASS | U `reflection-card.test.tsx` › 구성 · E `reflection-card.spec.ts` (16 passed) |
| AC-5-18 | PASS | E `reflection-card.spec.ts` 기하·선언값 · `session-complete.spec.ts` "AC-5-18 · 19 (supersedes AC-4-61 · 104)" — 카드 y = 521 − 56 |
| AC-5-19 | PASS | G #9: baseline HEAD ↔ 현재 **y < 465 변경 0 px** (QA 독립 계산) · E `session-complete.spec.ts` 기하 + 전체 프레임 baseline 통과 |
| AC-5-20 | PASS | U `StarRating.test.tsx` (키보드 →/↑/←/↓/Home/End · 재탭 불변) · **P-A**: 화살표로 1→5 별 이동 시 `aria-checked` 가 따라감 (393 · 320) |
| AC-5-21 | PASS | U `Chip.test.tsx` select 변형 · E `reflection-card.spec.ts` 선언값(12.5px · border) · `D5-6` 중간선 분할 2건 |
| AC-5-22 | PASS | E `reflection-card.spec.ts` placeholder · 상한 · 저장소 0 · G: Stage 5 feature/entity 의 `localStorage`/`sessionStorage`/`indexedDB` 0 |
| AC-5-23 | PASS | U `reflection-card.test.tsx` S0/S1 · E Save `aria-disabled` |
| AC-5-24 | PASS | E 요청 로그 body 대조 · 중복 탭 1건 · **P-C1** payload `{rating:3, checks:[], note:null}` 실측 |
| AC-5-25 | PASS | E 성공 Toast + 홈 replace · 뒤로가기 복귀 0 |
| AC-5-26 | PASS | U `useSubmitReflection.test.tsx` key 재사용/재발급 · E error → 입력 보존 |
| AC-5-27 | PASS | E 오프라인 → 안내 · 입력 보존 · 저장소 0 |
| AC-5-28 | PASS | U/E `invalid-transition` → 일반 실패 문구(`D5-7`) · 재시도 성공 |
| AC-5-29 | PASS | E "닫기 = 건너뛰기" (확인 0 · 요청 0) |
| AC-5-30 | PASS | U S6 · E 재진입 읽기 전용 · `REFLECTION_ALREADY_SUBMITTED` = `D5-8` |
| AC-5-31 | PASS | E `conversation_only` 제출 · E `auto_timeout` 카드 표시 · **P-C1** auto_timeout 후 별 3 → `Save` → 제출 요청 1건 · **P-C2** `recorder:crash-recovered` → `completed(recovered_after_crash)` 후 그 세션 완료 화면에 카드 표시 · `Engaged` 제출 → reflection 요청 1건 · 홈 이동 |
| AC-5-32 | PASS | E `reflection-card.spec.ts` 4폭 + `R-SHADOW-1` 양축 프로브 · **P-R**: 320 / 600 / 1024 가로 넘침 0 (문서·뷰포트) · 컬럼 320 / 480 / 480 가운데 · `Save` 스크롤 도달 (스크린샷 `P-R-*-card.png`) |
| AC-5-33 | **NOT VERIFIED** | iOS Safari 소프트 키보드 — 실기기 필요 → `QA-5-003` §6 |

### 4.5 피드백 · 분석 상태 화면 (`C13-S5-1`)

| AC | 판정 | 증거 |
|---|---|---|
| AC-5-34 | PASS | G: router `RouteGuard` + `FullscreenLayout` · Page = `useParams` + feature 1개 · 앱 안 진입점 0 (`sessionFeedbackPath` 사용처 = 정의뿐, `ROUTES.sessionFeedback` = router 뿐) |
| AC-5-35 | PASS | E `session-feedback.spec.ts` 폴링 3건(15s · `failed` 60s · `recording-deleted` 정지) · U `session-feedback.test.tsx` 폴링 5건(완료 화면 분석 조회 0 포함) · **P-D2** pending→analyzed 31s 진행 |
| AC-5-36 | PASS | E pending baseline · G copy *"They're usually ready by tomorrow…"* — 숫자·% 0 |
| AC-5-37 | PASS | E 버블 텍스트 = fixture 그대로 · **P-D** `text-null` slot 텍스트 빈 문자열 |
| AC-5-38 | PASS | E low-quality baseline · **P-D** slot 텍스트 = 버블 + 안내 |
| AC-5-39 | PASS | E "failed — 버튼 0" |
| AC-5-40 | PASS | E not-available baseline · P-D 텍스트 *"Observations are only prepared fo…"* |
| AC-5-41 | PASS | E no-recording baseline · `recording-deleted` 폴링 정지 · enum 변경 0 (U enum 스냅샷) |
| AC-5-42 | PASS | E Error → Try again → 성공 · 없는 세션 → Go home · loading/offline baseline · `D5-9` 카드 폭 8 tests |
| AC-5-43 | PASS | E deep link 미로그인 → `/auth/*` · 로그인 SPA 진입 → 화면 |

### 4.6 Privacy · Copy · 접근성 · 아키텍처 · 회귀

| AC | 판정 | 증거 |
|---|---|---|
| AC-5-44 | PASS | U `stage5-copy.test.tsx` (금칙어 8종) · E `stage5-cross-cutting.spec.ts` 렌더 문구 · G 금칙어 grep — copy·fixture 히트 0 (`delay` 히트는 Mock 상수 이름뿐) |
| AC-5-45 | PASS | U contracts 필드 부재 · E 전사·지표 DOM 0 |
| AC-5-46 | PASS | E 콘솔 수집(회고 실패 경로 · 폴링) · U `stage5-privacy.test.tsx` parse 실패 경로 · G Stage 5 파일 `console` 0 |
| AC-5-47 | PASS | U `stage5-privacy.test.tsx` 로그아웃 → Stage 5 query/mutation 0 · 저장소 0 |
| AC-5-48 | PASS | G: `package.json`/lockfile 변경 0 · `VITE_*` = `API_MODE`·`API_BASE_URL`·`MOCK_SCENARIO` · dist grep Secret/분석 SDK 0 · Mock 피드백 문구 dist 0 · `assert:no-mocks` OK |
| AC-5-49 (자동) | PASS | **(a) P-A** — Tab(Close session → 별) 진입 · 화살표로 별 1~5 이동 시 매 별 `:focus-visible` = true · `outline: solid 2px rgb(74,95,92)` offset 2px · 포커스↔비포커스 픽셀 차가 **상·하·좌·우 4면 모두** 존재(상 100 · 하 100 · 좌 60 · 우 60 px) = 링이 잘리지 않고 보임 (393 · 320, 스크린샷 `P-A-*-star{1,6}-focused.png`). E 포커스 순서 · 이름 · reduced motion · 대비 프로브 · 터치 타깃(`P-29`·`AD-S5-1`·`D5-6` 고정) · **(d) P-D** 아래. axe 도구는 저장소에 없음 (도입은 승인 사항) — 자동 프로브로 대체 |
| AC-5-49 (SR) | **NOT VERIFIED** | 실제 스크린리더 낭독 — `QA-5-004` §6 |
| AC-5-50 | PASS | G: `features/reflection` · `session-feedback` ↔ `storytime-session` import 0 (주석 1건뿐) · `SessionCompletePage` 가 `footer` slot 으로 조립 · `lint:boundaries` ✔ |
| AC-5-51 | PASS | E 전체 637 passed — Stage 4 `session` 30 · `session-regression` 27 · `session-exceptions` 12 · `session-notices` 17 · `session-complete` 28. AC-4-61·104 → **superseded by AC-5-18/19** (테스트 이름·주석). 기존 테스트 변경 = 범위 축소 1(`AC-4-97` 터치 측정 범위를 카드 밖으로 — 카드는 `reflection-card.spec` 이 측정) · overflow 목록 +3 (근거 주석) · motion 대조표 +1 — 약화 아님 확인. baseline 재생성 1장의 상단 불변을 #9 로 독립 확인 |
| AC-5-52 | PASS | #1 ~ #4 전부 EXIT 0 (Playwright 단독) |

**(d) `D5-10` · `D5-12` 단일 live region — 11상태 전부 PASS** (`P-D-*.json`): loading · pending · analyzed · text-null · low-quality · failed · not-available · no-recording · error · offline · not-found 각각에서 `.haru-session-feedback` 안의 live 요소(`[aria-live]`·`role=status|alert|log|marquee|timer`) = **slot 1개(`aria-live=polite`, role 없음)** · slot 안 `[role]` 0. **P-D2**: pending → analyzed 폴링 전환 시 slot 이 **같은 DOM 노드로 유지**(재마운트 없음) · 전환 후에도 live region 1개.

### 4.7 Backend 의존

| AC | 판정 | 비고 |
|---|---|---|
| AC-5-53 | BACKEND_INTEGRATION_PENDING | Frontend 부분 = AC-5-24~31 PASS |
| AC-5-54 | BACKEND_INTEGRATION_PENDING | Frontend 부분 = AC-5-35~42 PASS |
| AC-5-55 | BACKEND_INTEGRATION_PENDING | Frontend 부분 = AC-5-34 · 43 PASS (도착 URL 확정) |
| AC-5-56 | BACKEND_INTEGRATION_PENDING | Frontend 부분 = AC-5-07 PASS (schema · fixture 만) |

## 5. Findings

```
QA-5-001 | Severity: Low (docs)
Requirement: Spec §4 / D5-12 (VG5C-3) — COMPONENT_MAP 등재
Steps to reproduce: grep -n "Spinner" docs/COMPONENT_MAP.md
Expected: Spinner 행 Props 에 D5-12 로 추가된 `announce` ('auto' 기본 | 'none') 와 사용처(피드백 화면 state slot)가 ErrorState · InlineAlert 행(80·81)과 같은 형식으로 적혀 있다
Actual: 78행 `| **Spinner / Skeleton** | … | `size`, `label` / `shape`, `lines` | …` — `announce` 없음. 머리 메모(9행)도 ErrorState · InlineAlert 만 언급
Evidence: docs/COMPONENT_MAP.md:9, :78, :80, :81 · packages/ui/src/feedback/Spinner.tsx (`announce?: 'auto' | 'none'`)
Suspected area: docs/COMPONENT_MAP.md Spinner 행 (design-agent 소유 — H5-6.7 ②)
```

```
QA-5-002 | Severity: Low (docs)
Requirement: AC-5-09 주변 (API_CONTRACTS §5.4 시나리오 서술 정확성 — AC 판정 범위 밖)
Steps to reproduce: grep -n "reflection-submitted" docs/API_CONTRACTS.md → 1386행; apps/web/src/mocks/fixtures/reflections.ts:14
Expected: §5.4 `session-completion:reflection-submitted` 설명 = fixture (별 4 · `engaged` · `asked_questions` — Figma `91:710`·`91:712`, H5-2.2 에서 교체)
Actual: "별 4 · `engaged` · `big_feelings` · 메모" — S5-A 시점 값이 남아 있다
Evidence: docs/API_CONTRACTS.md:1386 · apps/web/src/mocks/fixtures/reflections.ts:13-14
Suspected area: docs/API_CONTRACTS.md §5.4 표 (구현 확정 반영 = development-agent)
```

`QA-5-003` · `QA-5-004` = NOT VERIFIED 잔여 항목 (§6). Critical · High · Medium 0.

### 관찰 (Finding 아님)

- `OBS-5-1` QA 프로브 `P-A 320` 1회 timeout — 세션 시작 시트 `Bedtime` 대기(프로브 준비 단계, e2e `startSession` 도우미). 같은 테스트가 1회차·단독 재실행 모두 통과. 전체 e2e 실행에서는 실패 0. 메모리 기록된 부하 간헐 유형과 같다.
- `OBS-5-2` 지난 세션 fixture(Stage 4) 완료 버블이 *"Storytime success! Emma did wonderfully."* 인데 카드 제목은 *"…with Nova?"* — 같은 화면에 두 이름이 보인다 (`P-R-1024-card.png`). 버블은 Stage 4 fixture 의 Figma 원문(`mocks/fixtures/sessions.ts:51`)이며 Stage 5 범위 밖 · Mock 데모 데이터 한정. Stage 8 데모 프리뷰(C-18) 전에 fixture 정합을 검토할 만하다.
- `OBS-5-3` `P-28`·`P-29` 는 dev gallery 가값 목록(`provisionalItems.ts`)에 없다 (Stage 4b `P-26`·`P-27` 과 같은 처리, `OBS-4B-5` 선례). CSS `provisional:` 주석과 `provisional-markers.test` 로는 고정돼 있다.
- `OBS-5-4` 별 키보드: 아무 별도 선택되지 않은 상태에서 첫 `→` 는 별 1 을 **선택**하고 포커스는 별 1 에 머문다(값 +1 의미). Spec §9.1 "이동=선택" 과 `StarRating.test.tsx` 기대값이 같아 결함 아님.

## 6. NOT VERIFIED 항목과 수동 테스트 절차

### `QA-5-003` — AC-5-33 iOS Safari 소프트 키보드 (실기기)

환경: iPhone (가능하면 작은 화면 1대 + 6.1" 1대), iOS Safari, 저장소 dev 서버 HTTPS(`5174`, Stage 4 `NV-4B-*` 와 같은 경로), Mock 모드.
1. `https://<mac-ip>:5174/auth/log-in` → 로그인(`sam@example.com`) → Home `Start Session` → `Bedtime` → `Continue` → `Start recording` → `Submit`.
2. 완료 화면에서 스크롤해 회고 카드가 보이게 한다. 입력칸 *"Anything to talk about this time? (optional)"* 을 탭한다.
3. 확인: ① 키보드가 올라온 뒤 입력칸 전체가 키보드 위에 보인다 ② `Save` 가 키보드 위에 보이거나, 키보드를 닫지 않고 한 번의 스크롤로 닿는다 ③ 입력 중 화면이 가로로 밀리거나 확대(줌)되지 않는다 ④ 몇 글자 입력 후 `Save` 탭 → *"Thanks — saved."* Toast · 홈 이동.
4. 같은 절차를 `?scenario=reflections:offline` 로 로그인해 반복 → 키보드가 열린 상태에서 오프라인 Toast 가 키보드에 가려지지 않는지 확인.
5. 판정: ①~④ 모두 충족 = PASS. 결과를 스크린샷(키보드 열림 상태 2장)과 함께 이 리포트 §9 에 기록.

### `QA-5-004` — AC-5-49 스크린리더 낭독 (VoiceOver)

환경: iPhone VoiceOver(Safari) 필수, 가능하면 macOS VoiceOver + Safari 병행. `D5-10` · `D5-12` 결정이 요구한 "실제 SR 확인".
- A. 회고 카드 (위 1~2 단계로 진입): 오른쪽 스와이프로 순서 확인 — `Close session` → 카드 제목(*"How was storytime with Nova?"*) → 별 radio group(이름 = 카드 제목, *"1 star, radio button, 1 of 5"*) → 칩 5개(누르면 *selected/pressed* 상태 낭독) → 입력(라벨 낭독) → `Save`(비활성 시 *dimmed* + *"Choose stars, a tag, or add a note to save."*). 로터 "조절"로 별 값 변경 시 새 값이 1회 낭독되는지.
- B. 피드백 화면 — 로그인 URL 에 scenario 를 붙이고 SPA 로 `/session/77777777-7777-4777-8777-000000000002/feedback` 이동 (`/__dev/screens` "Stage 5 피드백" 링크):
  1. `analysis:analysis-pending-then-completed` — 진입 시 pending 안내가 **1회** 낭독. 약 30초 대기 → 버블 문구 *"Today brought lots of feeling words…"* 가 **정확히 1회** 낭독(중복 0, 누락 0).
  2. `analysis:loading` — *"Loading"* 이 최대 1회 낭독, 이어서 결과 상태가 1회 낭독.
  3. `analysis:error` · `analysis:offline` · 없는 세션(`/session/99999999-9999-4999-8999-999999999999/feedback`) — 각 상태 문구가 **1회** 낭독, assertive 끼어들기(현재 읽던 문장 끊김) 없음.
  4. `analysis:analysis-low-quality` · `analysis-failed` · `analysis-not-available` · `recording-deleted` — 진입 낭독 1회.
- 판정: A 순서·이름·상태 전부 일치 + B 모든 상태에서 낭독 횟수 1회 = PASS. 이중 낭독 또는 전환 누락이 있으면 상태·SR·OS 버전과 함께 기록 → Finding.

## 7. BACKEND_INTEGRATION_PENDING 목록 (Stage 8 Handoff 1:1 대상)

대기 사유와 대상 문서는 Plan §10 · §18 에 기록되어 있음을 확인했다. 신규 0.

| 항목 | 대기 사유 | Handoff 대상 | AC |
|---|---|---|---|
| `P5-BIP-01` | 회고 서버 저장 · `Idempotency-Key` 24h · 세션당 1건 | BACKEND_HANDOFF · DATA_REQUIREMENTS | 53 |
| `P5-BIP-02` | 회고 허용 상태 서버 강제 | BACKEND_HANDOFF | 53 |
| `P5-BIP-03`~`05` | 회고 → 추천 · 서재 평점 집계 · 리포트 반영 | BACKEND_HANDOFF · DATA_REQUIREMENTS · ANALYSIS_PIPELINE | 53 |
| `P5-BIP-06`~`09` | STT · 품질 게이트 · 민감 발화 · 짧은 피드백 생성(`text: null` fallback) | ANALYSIS_PIPELINE | 54 |
| `P5-BIP-10` | `short_feedback_ready` push 발송 (도착 URL `/session/:sessionId/feedback`) | BACKEND_HANDOFF (+ 네이티브 `S4N-*`) | 55 |
| `P5-BIP-11` | 분석 24h SLA | ANALYSIS_PIPELINE | 54 |
| `P5-BIP-12` | `failed` 재시도 정책 · 영구 실패 표현 | ANALYSIS_PIPELINE | 54 |
| `P5-BIP-13` | `conversation_only` 분석 거부 서버 강제 | BACKEND_HANDOFF · ANALYSIS_PIPELINE | 40 서버 부분 |
| `P5-BIP-14` | 하이라이트 클립 추출 · 저장 · signed URL 만료 (`OAQ-13`) | ANALYSIS_PIPELINE · DATA_REQUIREMENTS | 56 |
| `P5-BIP-15` | 회고 · 분석 소유권 · RLS | AUTH_REQUIREMENTS · DATA_REQUIREMENTS | 42 서버 부분 |
| `P5-BIP-16` | 녹음 미수신 세션 종결 (Frontend 판별 = `completed` + `deleted`/`expired`) | ANALYSIS_PIPELINE · RECORDING_UPLOAD_SPEC | 41 서버 부분 |

### 7.1 남은 가값 목록 (FAIL 사유 아님 — `rules/qa.md` §2)

| ID | 대상 | 상태 |
|---|---|---|
| `P-01` | 보조 텍스트 `--color-fg-secondary` (피드백 `ErrorState` 설명 3.20 포함) | 디자이너 대기 |
| `P-02` | 비텍스트 대비 — 별 채움/빈 · 칩 테두리 (Stage 5 `--color-rating-empty` `#d6dedc` 교체 후에도 P-02 주석 유지) | 디자이너 대기 |
| `P-04` | status 색 | 디자이너 대기 |
| `P-16` | 메달리온 크기 혼재 | 디자이너 대기 |
| `P-17` | TextField trailingAction 색 구분 | 디자이너 대기 |
| `P-23` | Prompt 배지 글자색 | 디자이너 대기 |
| `P-24` | 3차 텍스트 `--color-fg-tertiary` | 디자이너 대기 |
| `P-25` | `Discard` · `Mic is off` 흰 라벨 2.211:1 | 디자이너 대기 |
| `P-26` · `P-27` | paused 경과 시간 · 보조 줄 대비 | 디자이너 대기 |
| **`P-28`** (신규) | 회고 입력 placeholder 대비 2.3 | 디자이너 대기 (`D5-4`) |
| **`P-29`** (신규) | `StarRating` 별 히트 38×44 | 디자이너 대기 (`D5-4`) |

수용 예외: `D-01`(칩 선택 · `Save` 흰 라벨 2.07) — Stage 5 신규 `D-xx` 0. 허용 차이: `AD-S5-1`(입력 40, `D5-5` 등록 확인 — `reflection-card.spec` 5점 hit-test 기대값 `…(optional):ns`).

## 8. Regression 결과

- 단위 전체 189 files · 2715 tests passed (build 후 실행 — `fonts.test` 의 `dist` 의존 주의 사항 해당 없음).
- Playwright 전체 단독 637 passed · 0 failed — Stage 1~4 spec 전부 포함 (`visual` 74 · `onboarding` · `library` · `home` · `session*` 등). 시각 baseline 변경 = 작업 트리 기준 `s4-session-complete.png` 1장 수정 + `session-feedback.spec.ts/` 11장 신규 — 이번 QA 실행은 baseline 을 쓰지 않았다 (`--update-snapshots` 미사용, 실행 전후 `git status e2e/__screenshots__` 동일).
- Stage 4 승계 기록: AC-4-61 · AC-4-104 → **superseded by AC-5-18 / AC-5-19** (`N5-21`).

## 9. 재검증 이력

| 회차 | 일시 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-11-10 ~ 11-11 | `INCOMPLETE` | FAIL 0 · NV 2 (`QA-5-003` · `QA-5-004`) · Low docs 2 (`QA-5-001` · `QA-5-002`) |
| 2 | 2026-11-11 ~ 11-12 | `INCOMPLETE` | H5-7 · H5-8 재검증 (§10). `QA-5-001`·`002` → **닫힘** · `QA-5-003`·`004` NV 유지 · 신규 `QA-5-005` Low(test 주석) · FAIL 0 |

PASS 로 기록하려면: `QA-5-003` · `QA-5-004` 를 수동 절차대로 실행해 PASS 를 받거나, 사용자가 항목별로 명시 수용 → `PASS (accepted: QA-5-003, QA-5-004)`. `QA-5-001` · `QA-5-002` 는 Low 문서 정정이며 수정 후 재검증 시 이 표에 판정 변화를 기록한다.

---

## 10. 재검증 2회차 — `H5-7` · `H5-8` (`D5-13` · `D5-14` · `D5-15`, 2026-11-11 ~ 11-12 KST)

대상: `main` @ `fd8748d` + 미커밋 작업 트리 (handoff `H5-7` · `H5-8`). 기준 추가: `D5-13`~`D5-15` · 허용 차이 `AD-S5-2`~`AD-S5-4` · Spec §13 · 개정된 AC-4-99 (`stage-4-plan.md:1014` · `stage-4b-plan.md:570` ④). handoff 는 증거로 쓰지 않았다. 로그·프로브: `docs/qa/evidence/stage-5/rv2/` · `probes/qa5-rv2-probes.spec.ts` · `probes/results-rv2/`.

### 10.1 Verdict

**`INCOMPLETE`** — `FAIL` 0 · `NOT VERIFIED` 2 (`QA-5-003` AC-5-33 · `QA-5-004` AC-5-49 SR). `QA-5-001` · `QA-5-002` 닫힘. 신규 `QA-5-005` Low (test 주석, 판정 영향 없음). 다음 Stage 진입 불가 — `QA-5-003` · `QA-5-004` 수동 실행 PASS 또는 사용자의 항목별 명시 수용(`PASS (accepted: QA-5-003, QA-5-004)`) 필요.

### 10.2 Commands Executed

| # | 명령 | 결과 | 로그 |
|---|---|---|---|
| R1 | `pnpm typecheck && pnpm lint && pnpm lint:boundaries && pnpm build && pnpm assert:no-mocks` | ✅ EXIT 0 · no dependency violations (852 modules, 3288 deps) · sentinel 0 · `haru-dev-` 0 · sharp 0 | `rv2/01-typecheck-lint-build.log` |
| R2 | `pnpm test` (build **후**) | ✅ **190 files · 2717 tests passed** (51.2s) | `rv2/02-pnpm-test.log` |
| R3 | `pnpm test:e2e` 전체 **단독** (다른 Playwright 없음 확인) 17:19:55 – 17:36:02 | ✅ **641 passed · 0 failed (16.1m)** — 실패 0 → 단독 재실행 대상 없음. 실행 전후 `git status e2e/__screenshots__` 동일 · `--update-snapshots` 미사용 | `rv2/04-playwright-full.log` · `rv2/03-screens-{before,after}.txt` |
| R4 | QA 프로브 `P-T` ×4 · `P-G` ×2 · `P-F` ×3 (단독) | ✅ 9 passed | `rv2/05-probes.log` |
| R5 | 대조군 `P-N` (no-op 변이) | 1회차 ✘ — 준비 단계(`logInToHome` Home 트랙 대기 timeout, 측정 전) → **단독 재실행 ✅** | `rv2/06-probe-noise.log` · `-rerun.log` |
| R6 | 대조군 `P-N2` (이전 CSS 왕복) | ✅ 1 passed | `rv2/07-probe-roundtrip.log` |
| R7 | `ls apps/api supabase apps/mobile` | No such file ×3 | (본문) |
| R8 | grep — viewport meta · `dist/index.html` · `COMPONENT_MAP` Spinner 행 · `API_CONTRACTS` `reflection-submitted` 행 ↔ fixture · `Nova` 잔존 | 아래 표 | (본문) |

### 10.3 판정

| 항목 | 2회차 판정 | 증거 |
|---|---|---|
| `QA-5-001` (Low docs) | **닫힘** | G: `docs/COMPONENT_MAP.md:78` Props = `size, label, decorative, announce` · `announce` `'auto'`/`'none'` 의미 · `D5-12` · 사용처 `S5-C` — `packages/ui/src/feedback/Spinner.tsx:23` `announce?: 'auto' \| 'none'` 와 일치 |
| `QA-5-002` (Low docs) | **닫힘** | G: `docs/API_CONTRACTS.md:1386` = `engaged` · `asked_questions` + 출처 `MOCK_SUBMITTED_REFLECTION_INPUT` ↔ `mocks/fixtures/reflections.ts:12-14` (`rating 4 · ['engaged','asked_questions'] · note`) 일치. 남은 `big_feelings` 1건(`:179`)은 enum 목록 — 정상 |
| `D5-13` viewport (자동 부분) | PASS | G: `apps/web/index.html:12` · 빌드 산출물 `apps/web/dist/index.html:14` 모두 `width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover` · `user-scalable` 없음 · U `apps/web/__tests__/viewport-meta.test.ts` 2 tests (R2 통과, meta 1개 · 문자열 고정 · `user-scalable=no/0` 부재 단정). `AD-S5-2` 등록 확인 |
| AC-5-33 (`QA-5-003`) | **NOT VERIFIED (유지)** | iOS 실기기 재확인(포커스 시 확대 없음 · 두 손가락 확대 유지 · ①~④) 결과가 기록되지 않았다. 절차 §6 + 10.6 |
| AC-5-49 SR (`QA-5-004`) | **NOT VERIFIED (유지)** | 변경 없음. 제목 clamp 후에도 **접근성 이름 = 전체 문자열** 은 자동 확인(아래 P-T `regionByFullName` 1) — SR 낭독은 여전히 수동 |
| `D5-14` 이름 Emma | PASS | P-T 4폭: fixture 렌더 제목 = *"How was storytime with Emma?"* · 완료 버블 = *"Storytime success! Emma did wonderfully."* — 같은 화면 두 이름 일치(1회차 `OBS-5-2` 해소). G: `mocks/fixtures/me.ts:38` `'Emma'` |
| `D5-15` 아래 여백 12 (`AD-S5-3`) | PASS | P-T computed 카드 `margin-bottom` = **12px** (4폭) · **P-G** 스크롤 끝 뷰포트 bottom − 카드 bottom = **12** (320×568 · 393×667) · E `reflection-card.spec.ts` 반응형 4건(≥ 12 + 카드 아래 그림자 프로브) 통과 |
| `D5-15` 제목 2줄 + 말줄임 + break-word (`AD-S5-4`) | PASS | P-T computed: `overflow-wrap: break-word` · `-webkit-line-clamp: 2` · `overflow: hidden/hidden` (4폭). 이름 9종(Emma 4 · Sebastian 9 · Anastasia-Rose 14 · 다단어 19 · 다단어 40 · 혼합 40 · 공백 없는 31 · `W`×40 · `M`×40) × 4폭 = 36건 전부 제목 높이 ≤ 40(2줄) · 제목 `scrollWidth − clientWidth` 0 · 제목 좌우 카드 안 · DOM 텍스트 = 전체 문자열 · `region` 접근성 이름 = 전체 문자열. 40자 이름은 `clamped` true(내용이 2줄 초과 → 잘림 발생 확인). 스크린샷 `results-rv2/P-T-320-{w40,multi40,emma}-card.png` 육안: 2줄째 끝에 **"…"** 표시 · 공백 없는 `W`×40 도 단어 중간 줄바꿈 후 말줄임 |
| 세로·가로 넘침 0 (320/393/600/1024 ×852, ≤ 40자) | PASS | P-T 36건 + fixture 4건: AppShell 뷰포트 `scrollHeight − clientHeight` **0** · 가로 0 · 문서 가로 0. 320 fixture Emma = 2줄에서도 0 (H5-7 시점 4px 넘침 해소). E `reflection-title-overflow.spec.ts` 4 tests(R3) 동일 결론 |
| 393/600/1024 ×852 Figma 일치(이름 제외) | PASS | **P-F**: 각 폭에서 (A) 현재 ↔ (B) H5-8 이전 CSS 주입(여백 29 · clamp 없음 · break-word 없음, computed 로 적용 확인) diff = 262~391 px · **최대 Δ2** (별·칩·입력칸 위치, 제목 영역 0). **대조군 P-N2**: 이전 CSS 를 넣었다 **빼서 A 와 같은 CSS 로 되돌린 화면**도 A 대비 **같은 391 px · Δ2 · 같은 y 대역** 이고, 왕복 화면 ↔ 이전 CSS 화면 = **0 px** → Δ2 는 레이아웃 무효화 재래스터 노이즈이며 **H5-8 CSS 의 가시 영향 = 0** (임계 0.02 ≈ Δ5.3 미만). 무변이 대조 P-N(no-op style · 같은 텍스트 재설정) = 0 px. 카드 top = 465 (4폭). 1회차에서 Figma 대조로 PASS 한 화면(AC-5-18·19)과 이름 외 동일 |
| `s4-session-complete` baseline 변경 | PASS (1 클러스터) | P-F 393: 저장소 baseline ↔ 현재 렌더(A) = **0 px** · baseline ↔ 제목만 `Nova` 렌더 = 의미 있는 클러스터 **1개** `2,373 px x68–325 y487–504 maxΔ 176`(제목 글자 줄) + 위 Δ2 재래스터 노이즈(이름 변이로 생김, 대조군과 동일 위치). 제목 줄 밖 변화 0 → baseline 변경 = 이름 Nova→Emma 뿐. E `session-complete.spec.ts:303` baseline 통과(R3) |
| AC-4-99 (개정 문구) | PASS | 개정 ④ 세로 = *"320/393/600/1024 × 852 에서 40자 이하 `firstName` 에 세로 넘침 없음 (852 미만 스크롤 허용)"*: P-T 36건 + E `reflection-title-overflow.spec.ts` 4 tests · E `session-regression.spec.ts:576` AC-4-99 5 tests(852 ×4 · 1024×768, 완료 상태 포함) 통과. ①~③ 가로·컬럼 480 가운데·클래식 스크롤바 = E `session-regression` · `scrollbar-classic.spec.ts` 통과. 테스트 주석 잔재는 `QA-5-005` |
| AC-4-100 overflow 목록 | PASS | E `session-regression.spec.ts:626` 통과 — 목록에 `.haru-reflection-card__title hidden/hidden` 추가(근거 주석). 제목 박스 안 그림자 요소 0 (P-T 스크린샷 · CSS 주석) — `R-SHADOW-1` 해당 없음 |
| AC-5-51 · AC-5-52 회귀 | PASS | R1~R3 전부 EXIT 0, Playwright 641/641 |
| AC-5-01 Scope | PASS | R7. `git status` 변경 경로에 Backend 0 |

나머지 AC 판정은 1회차(§4)와 같다 — 이번 라운드 변경(이름 fixture · 토큰 값 1 · 제목 CSS · viewport meta · 문서 2곳 · 테스트)이 닿지 않으며 R2 · R3 전체 통과로 회귀 없음을 확인했다.

### 10.4 Findings (신규)

```
QA-5-005 | Severity: Low (test 주석 — 판정 영향 없음)
Requirement: AC-4-99 (개정 2026-11-11, D5-15)
Steps to reproduce: sed -n 555,566p e2e/session-regression.spec.ts
Expected: 세로 축 단정과 주석이 개정 AC-4-99 ④ 문구(320/393/600/1024 × 852 · firstName ≤ 40자 · 852 미만 스크롤 허용)를 표현한다
Actual: :564 주석 "796 이상 높이는 스크롤이 없다" + :565 `if (height >= 796)` 가 남아 있다. Spec §13.2 실측대로 320×796 은 지금도 넘치므로 주석은 거짓 불변식이다. 현재 측정 크기(852 ×4 · 1024×768)에서는 단정 결과가 개정 AC 와 같아 판정 영향은 없으나, 누가 320×800 같은 크기를 추가하면 정상 동작이 실패로 보인다
Evidence: e2e/session-regression.spec.ts:564-565 · docs/plans/stage-4-plan.md:1014 · docs/design/stage-5-design-spec.md §13.2 · §13.6
Suspected area: e2e/session-regression.spec.ts expectColumn (development-agent — handoff H5-8.5 ② 에서 이미 정리 요청됨)
```

### 10.5 관찰 (Finding 아님)

- `OBS-5-5` **결정적 sub-threshold baseline 드리프트 3장** — `s2-onboarding-childinfo` (13 px Δ1) · `s2-onboarding-childinfo-trial` (7 px Δ1) · `v2-material` (98 px Δ≤6). 수치·"이번 변경 무관(변경 되돌려도 같은 픽셀)"은 handoff `H5-8.3` 의 측정이며, **QA 는 재현하지 않았다** — 재현에 `--update-snapshots=all` (baseline 쓰기)이 필요해 QA 권한 밖이다. QA 가 확인한 것: R3 에서 세 테스트 모두 임계 안에서 통과(`visual.spec.ts:86` · `:244` · `:261`) · 세 화면 모두 Mock 아이 이름(`me.ts`)을 표시하지 않는다(온보딩은 draft fixture `Nova`). 원인 미설명이므로 `R-BASELINE-1` ⑤ 에 따라 **갱신하지 않은 처리가 맞다**. 원인 조사(가장자리 x 0~1 · 좌우 가장자리 y 417~428/573~584 → 컬럼·glass 경계 재샘플 의심)는 Stage 8 회귀 설계 또는 별도 지시로 남긴다. 세 장은 Stage 5 이전부터 있던 상태로 기록한다.
- `OBS-5-6` Spec §13 머리(`stage-5-design-spec.md:440-442`)가 아직 **"DRAFT — 사용자 승인 대기"** 다. `D5-15` 가 §13 옵션 2 를 승인했으므로 상태 표기 갱신이 필요하다 (design-agent 문서 정리, 판정 영향 없음).
- `OBS-5-7` 온보딩 draft fixture `mocks/fixtures/onboarding.ts:132` 는 `Nova` 그대로다 (handoff 가 지시 범위 밖으로 남김). 온보딩 화면에서만 보이며 완료 화면·회고 카드와 같은 화면에 함께 나오지 않는다. Stage 8 데모 프리뷰(C-18) 전 fixture 정합 검토 대상으로 1회차 `OBS-5-2` 를 대체한다.
- `OBS-5-8` 대조군 `P-N` 1회차 준비 단계 timeout(Home 트랙 대기, 측정 전) → 단독 재실행 통과. `OBS-5-1` 과 같은 유형.
- `OBS-5-9` 393 에서 공백 없는 31자 · 혼합 40자는 2줄 안에 들어가 말줄임이 생기지 않는다(`clamped` false) — `AD-S5-4` 영향은 폭·글리프에 따라 더 긴 이름에서만 생긴다. Spec §13.5-3 과 일치.

### 10.6 NOT VERIFIED — 수동 절차 갱신

- `QA-5-003` — §6 절차에 `D5-13` 확인을 더한다: ⑤ 입력칸 탭 시 화면 확대가 **일어나지 않는다** ⑥ 입력 후 키보드를 닫아도 배율 1 그대로 ⑦ 두 손가락 확대(핀치)는 **여전히 된다**(iOS) ⑧ (가능하면) Android Chrome 에서 핀치 확대가 막히는 것 = `AD-S5-2` 허용 차이로 기록만. 카드 제목 기대 문구는 *"How was storytime with Emma?"*. 결과(스크린샷 2장 이상)를 사용자가 남기면 §9 에 기록하고 판정한다.
- `QA-5-004` — §6 절차 그대로, 카드 제목 낭독 기대값만 *"How was storytime with Emma?"* 로 바뀐다. 긴 이름 말줄임 시에도 낭독은 전체 문자열이어야 한다(자동 확인: DOM · 접근성 이름 전체).

### 10.7 BACKEND_INTEGRATION_PENDING · 가값 · 허용 차이

- PENDING 변동 없음 (§7, `P5-BIP-01`~`16`). contract 변경 0.
- 가값 변동 없음 (§7.1).
- 허용 차이: `AD-S5-1` · **`AD-S5-2`** (viewport) · **`AD-S5-3`** (여백 12) · **`AD-S5-4`** (제목 2줄) — 전부 `stage-5-approvals.md` §2 에 사용자 결정 근거로 등록됨을 확인.

### 10.8 Regression

- 단위 190 files · 2717 tests (1회차 대비 +1 file · +2 tests = `viewport-meta.test.ts`).
- Playwright 641 passed (1회차 대비 +4 = `reflection-title-overflow.spec.ts`). Stage 1~4 spec 전부 포함. baseline 변경 = 작업 트리 기준 `s4-session-complete.png`(이름 클러스터 1) — 이번 QA 실행은 baseline 을 쓰지 않았다.

## 11. 최종 Stage Verdict — 사용자 항목별 수용 (2026-11-14)

| 항목 | 내용 |
|---|---|
| Stage Verdict | **`PASS (accepted: QA-5-003, QA-5-004)`** |
| 근거 | `.claude/rules/qa.md` §2 — `INCOMPLETE`(FAIL 0) 의 잔여 `NOT VERIFIED` 2건을 사용자가 **항목별로 명시 수용**했다 (2026-11-14). 사용자 발화: *"accepted"* (QA-5-004 VoiceOver 확인 안내에 대한 답) → 확인 질문 *"QA-5-003도 수용할까요?"* 에 *"QA-5-003도 수용"* |
| 수용 항목 | `QA-5-003` — AC-5-33 iOS Safari 소프트 키보드 + `D5-13` 확대 방지 실기기 재확인 (§10.6) · `QA-5-004` — AC-5-49 스크린리더(VoiceOver) 낭독 (§6 · §10.6) |
| 판정 변경 | AC-5-33 = `NOT VERIFIED (accepted: QA-5-003)` · AC-5-49 SR 부분 = `NOT VERIFIED (accepted: QA-5-004)`. 실기기 확인은 수행되지 않았다 — 결함이 없다는 증거가 아니다. Stage 8 Final QA(접근성·실기기) 때 §6·§10.6 절차로 다시 확인할 것을 권한다 |
| 남은 것 (판정 영향 없음) | `QA-5-005` Low(`session-regression.spec.ts` `height >= 796` 주석·조건) · `OBS-5-5` baseline 3장 드리프트 · `OBS-5-6` Spec §13 머리 상태 표기 · `OBS-5-7` 온보딩 fixture `Nova` · 가값 `P-28`·`P-29` · PENDING `P5-BIP-01`~`16` (Stage 8 Handoff) |
| 다음 Stage | Stage 6 — **사용자 지시 시에만** 시작 |
