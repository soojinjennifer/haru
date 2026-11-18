# Stage 6 QA Report

Status: **QA 3회차 (stage-qa-agent, 2026-11-18, `S6-H` 이후) — 최신 판정은 §11: `PASS (accepted: QA-6-005)`** · 2회차 15:35 – 16:10 KST (§10) · 1회차 01:10 – 09:30 KST · Product Code 수정 0 · 커밋 0

## 1. Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **3회차: `PASS (accepted: QA-6-005)`** (§11.1). 2회차: `INCOMPLETE` (§10.1 — FAIL 0 · PARTIAL 1 · NOT VERIFIED 1). 1회차: **`FAIL`** — `FAIL` 1 (`QA-6-001`, AC-6-22). FAIL 이 없더라도 `PARTIAL` 3 · `NOT VERIFIED` 1 이 남아 `INCOMPLETE` 이다 |
| 대상 | 작업 트리 (커밋 안 됨, HEAD `d85f28f` + Stage 6 변경 135 경로) — S6-A · E1 · E2 · B · C · D · F 전부 |
| 기준 | `docs/plans/stage-6-plan.md` 개정 2 (AC 66 · `P6-BIP-01`~`12`) · `docs/design/stage-6-design-spec.md` (APPROVED, `D6-8`) · `docs/decisions/stage-6-approvals.md` · `docs/qa/stage-6-handoff.md` H6-1~H6-7 · `docs/design/stage-6-visual-gap.md` |
| AC 집계 (66 → AC-6-46 을 3줄로 나눠 68줄) | `PASS` 61 · `FAIL` 1 (AC-6-22) · `PARTIAL` 3 (AC-6-18 · AC-6-26 · AC-6-46 대비) · `NOT VERIFIED` 1 (AC-6-46 스크린리더) · `BACKEND_INTEGRATION_PENDING` 2 (AC-6-51 · 52) |
| Findings | `QA-6-001` Medium (FAIL) · `QA-6-002` Medium (PARTIAL — `VG6-B-06/07` 결정 대기) · `QA-6-003` Medium (PARTIAL — `VG6-C-10` 결정 대기) · `QA-6-004` Medium (PARTIAL — `VG6-E2-09` / `P-34` 결정 대기) · `QA-6-005` (NOT VERIFIED — SR) · `QA-6-006` Low (테스트 범위 — 판정 영향 없음) |
| 개발 측 주장 재현 | 전체 Playwright **763 passed / 0 failed** (16.9m, 단독 실행, `retries: 0` → flaky 0) — H6-7.6.1 의 763 주장을 재현함. 단위 206 files / 2,966 tests 재현 |

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (Darwin 25.5.0) |
| Node / pnpm | v24.21.0 / pnpm 12.4.2 |
| 브라우저 | Playwright 1.63.0 Chromium (`playwright.config.ts`: 393×852 · DPR 1 · `reducedMotion: reduce` · UTC · en-US · workers 1 · retries 0) |
| 실기기 | 없음 |
| Mock | URL `?scenario=<group>:<key>` · 요청 로그 `__HARU_MOCK_REQUEST_LOG__` (dev 전용) |
| QA 탐침 | 저장소 밖 scratch config(`docs/qa/evidence/stage-6/qa.config.ts.txt` 사본) — 같은 dev 서버 설정 · 저장소 helper(`e2e/support/*`) 재사용. 탐침 소스 사본 `docs/qa/evidence/stage-6/*.probe.spec.ts.txt` |
| Playwright 단독 실행 | 시작 전 `pgrep -fl playwright` → 0 건. 전체 suite · QA 탐침 모두 다른 실행 없이 순차 |

## 3. Commands Executed

| 명령 | 결과 | 로그 |
|---|---|---|
| `ls apps/api apps/mobile supabase` | 셋 다 `No such file or directory` · `apps/` = `web` 만 | — |
| `pnpm install --frozen-lockfile` | exit 0 | `evidence/stage-6/install.log` |
| `pnpm typecheck` | exit 0 | `typecheck.log` |
| `pnpm lint` | exit 0 | `lint.log` |
| `pnpm lint:boundaries` | exit 0 — no dependency violations (936 modules, 3720 dependencies) | `lint-boundaries.log` |
| `pnpm format:check` | exit 0 | `format.log` |
| `pnpm build` | exit 0 (청크 크기 경고만) | `build.log` |
| `pnpm assert:no-mocks` | exit 0 — MOCK/DEV sentinel 0 · `haru-dev-` 0 · sharp 0 | `no-mocks.log` |
| `pnpm test` | exit 0 — **206 files / 2,966 tests passed** | `vitest.log` |
| `pnpm test:e2e --reporter=line` (단독) | exit 0 — **763 passed (16.9m)**, failed 0 | `e2e-full.log` |
| `git status --short e2e/__screenshots__` (실행 후) | 실행 전과 같음: 수정 1 (`visual.spec.ts/s3-dialog-scrim.png`) + 신규 디렉토리 5 — **실행이 baseline 을 다시 쓰지 않았다** | — |
| QA 탐침 `qa-recommend` · `qa-debug40` | AC-6-39 · 40 브라우저 재현 | `qa-recommend-probe.log` · `qa-ac40-debug*.log` |
| QA 탐침 `qa-measure` | `T6-2` 라벨 폭 · Loading · TopBar 전체 프레임 · 오프라인 · Step 1 Tag · UpdateNote 320 · 852 대비 | `qa-measure.log` · `qa-*.png` |
| QA 탐침 `qa-ac22` | 이름 변경 교차 화면 | `qa-ac22.log` · `qa-ac22-complete-after-rename.png` |
| `diffcc.py` (PIL 연결성분) | `s3-dialog-scrim` HEAD ↔ 작업본 분해 | `s3-dialog-scrim-diff.log` |
| grep (bash) | 신규 Stage 6 디렉토리 12곳에서 HEX/`rgb()`/arbitrary 0 · `any`/`@ts-ignore`/`eslint-disable` 0 · `console.` 0 · `style={{` 0 · 새 `overflow` = `entities/survey/survey.css` 의 기존 1×1 clip 2건(R-5 이동분, 값 불변) 뿐 · UI 레이어의 `mocks/` import 0 (주석 1건) · `dist` secret 패턴 0 · `apps/web` dependencies 변경 0 | — |

## 4. Requirement Matrix

### 4.1 Scope · Contracts · Mock (AC-6-01 ~ 14)

| AC | 판정 | 증거 |
|---|---|---|
| 01 | PASS | `ls` 부재 ×3, `apps/` = `web` 만 |
| 02 | PASS | router 에 report/history/highlight/pdf route 0 · 설정 목록 = 4행 + Log out (QA 전체 프레임 `qa-frame-settings.png`) · 목록 API(`capability-snapshots`·`personas`) 참조 = `children-api.ts` 주석(“메서드를 두지 않는다”) · `mocks/index.ts` fixture export · Mock 테스트뿐 — 호출자 0. **S7 선행 구현 0** (`history.ts` 는 Plan C-8 이 허용한 schema 만) |
| 03 ~ 08 | PASS | `packages/contracts/src/__tests__/stage-6.test.ts` · `shared/api/__tests__/http-stage6.test.ts` · `mocks/__tests__/MockChildrenApi.test.ts` — `pnpm test` 통과. contracts 소스 직독: `profile.ts:36 profileUpdatedAt: IsoDateTimeSchema.nullable()` (required) · `survey-update.ts:70-72 steps.length(4) · currentStep` |
| 09 | PASS | `docs/API_CONTRACTS.md` Rev 10 §4 Stage 6 표(L1088~1106) ↔ contracts 소스 대조 — `profileUpdatedAt` required nullable · `UpdateChildRequest` strict + `relationship` 없음 · `SurveyUpdateState{instrument, steps[4], draftAnswers, currentStep}` · 목록 endpoint “schema 만, 호출자 0” 일치 |
| 10 · 11 · 12 | PASS | `MockChildrenApi.test.ts` (14 key parse · 상태 저장형 · v1 불변) · `stage6-recommendation.test.ts` (결정성 · 연쇄) 통과. 12 는 QA 브라우저 탐침에서도 같은 결과(AC-6-39·40 행) |
| 13 | PASS | `lint:boundaries` ✔ · `stage6-boundaries.test.ts` 통과 · grep UI 레이어 `mocks/` import 0 |
| 14 | PASS | `API_CONTRACTS.md` §5.4 L1232 `children` 8 key + `activity-cards` 2 key 등재 · `scenario-selection.test.ts` · `stage6-boundaries.test.ts` (`/__dev/screens` route 7 · 그룹 2행) 통과 |

### 4.2 설정 · 아이 정보 수정 (AC-6-15 ~ 23)

| AC | 판정 | 증거 |
|---|---|---|
| 15 | PASS | `child-info-edit.test.tsx` · `settings-child.spec.ts` 통과 · QA 전체 프레임 `qa-frame-settings.png` (YOUR CHILD 4행 · ACCOUNT Log out) |
| 16 | PASS | `settings-child.spec.ts` · `settings-growth.spec.ts` · `home.spec.ts` 로그아웃 통과 · QA 프레임 7장 전부 TopBar Back 1개 (`qa-measure.log [topbar]`, 온보딩 프로필은 Back 0 = `N6-24`) |
| 17 | PASS (조건 미해당) | 목록이 데이터를 조회하지 않는다 — 단위 “목록 진입 시 `/v1/children/*` 요청 0” 통과. AC 조건 “아이 이름 표시가 있다면” 불성립 → Loading/Error 상태 없음 |
| 18 | **PARTIAL** | 프리필 · `relationship` 없음 · Step 1 과 같은 컴포넌트 = PASS (`child-info-edit.test.tsx`, `s6-settings-child`). **Figma `248:1159` 기준** 부분 미충족 — 독서 루틴 `list`(Figma = Answer card) · 언어 칩 카드 컨테이너 없음. 사용자 결정 `VG6-B-06/07` 대기 → `QA-6-002` |
| 19 · 20 · 21 | PASS | `settings-child.spec.ts` (dblclick → `UPDATE` 1건 body = 변경 필드만 · `validation-failed` 필드 오류 · `error`/`offline`/`retry` · 저장소·`history.state` 0) 통과 · baseline `s6-settings-child-save-failed` |
| 22 | **FAIL** | 회고 카드 제목 = 새 이름 ✅, **같은 완료 화면의 완료 버블 = 옛 이름** → `QA-6-001` |
| 23 | PASS | `settings-child.spec.ts` 브라우저 back · TopBar Discard/Keep editing 통과 |

### 4.3 설문 재응답 (AC-6-24 ~ 29)

| AC | 판정 | 증거 |
|---|---|---|
| 24 · 25 | PASS | `settings-survey.spec.ts` (프리필 · `1 / 16` · 단계 경계 PUT 1건 `['reading_together']`) · `survey-update.test.tsx` 통과 |
| 26 | **PARTIAL** | 답 보존 · 기기 저장 0 = PASS (`settings-survey.spec.ts:93`). **“마지막 카드부터” 미충족** — 같은 테스트가 단계 2(`books-and-interests`)에서 떠난 뒤 *Continue where you left off* → **단계 1 `reading-together` 첫 카드**를 단정한다(L112·L125). 사용자 결정 `VG6-C-10` 대기 → `QA-6-003` |
| 27 · 28 | PASS | `settings-survey.spec.ts` dblclick → POST 1건 → Toast → `/settings/profile` replace · `:retry` 같은 key · `:offline` · baseline `s6-survey-save-failed` |
| 29 | PASS | 전체 suite 의 `onboarding.spec.ts` · `visual.spec.ts` s2 온보딩·덱 baseline 전부 통과(재생성 0, §8) |

### 4.4 발전 역량 설정 (AC-6-30 ~ 33)

| AC | 판정 | 증거 |
|---|---|---|
| 30 | PASS | `settings-growth.spec.ts` · QA 프레임 `qa-frame-settings-growth.png` — h1 *Growth focus* · 안내 *Choose the one you'd like to explore together first.* · CF 행 *Current* · Save 비활성 |
| 31 | PASS | `settings-growth.spec.ts` dblclick → PUT 1건 · `error`/`offline`/`retry` 통과 · QA 탐침 오프라인 저장: 선택 보존 + alert *You're offline / Your selection is still here. Tap the button again when you're back online.* (`qa-growth-settings-offline-save-393.png`) |
| 32 · 33 | PASS | `settings-growth.spec.ts` `all-scores-missing` · `growth-capability.test.tsx` 금칙어·숫자 0 |

### 4.5 프로필 · FR-15 (AC-6-34 ~ 38)

| AC | 판정 | 증거 |
|---|---|---|
| 34 · 35 · 37 · 38 | PASS | `profile-result.spec.ts` · `profile-result.test.tsx` · baseline 8장 통과 |
| 36 | PASS | UpdateNote 재방문만 (`profile-result.test.tsx`) · baseline `s6-profile-revisit-updated`. 연도·320 줄바꿈은 결정 대기(`VG6-E2-19`·`20`, 비차단 — §5.1). QA 실측 320: 노트 높이 36 = **2줄** (`qa-measure.log`) |

### 4.6 추천 (AC-6-39 ~ 41)

| AC | 판정 | 증거 |
|---|---|---|
| 39 | PASS | **QA 브라우저 탐침** (`qa-recommend-probe.log`): `activity-cards:cold-to-warm` 시드 완료 2 → 세션 3회째 완료 후 cold 문장 유지 → 4회째 완료 후 첫 카드 `reason` = *Feelings came up in your last talks, and this one gives them names.* — 책 · 역량 라벨 · Prompt 5개 · 버튼 텍스트 순서 동일 (카드 텍스트 diff = `reason` 한 문장뿐). 저장소에는 이 화면 e2e 가 없다 → `QA-6-006` |
| 40 | PASS | **QA 브라우저 탐침** (`qa-ac40-debug-library.log`): `difficulty-lowered` → 세션 완료 → *Tricky today* 저장(요청 `checks:['tricky_today']`) → 다음 today card 조회 = 첫 장 *Grumpy Monkey: Play All Day* + *After a tricky night, short pages and a gentle rhythm keep it light.* · 난이도 배지·라벨 0. **반영 시점**: 회고 저장은 today card 를 무효화하지 않아(Plan §5.2 무효화 표에도 없음) Home 은 `staleTime` 30 s 안에는 이전 덱을 보이고, Settings ↔ Home(StackLayout) 왕복으로는 재조회가 일어나지 않았다 — 탭 이동 재마운트 후 반영(`qa-recommend-probe.log [40]` · `qa-ac40-debug.log`). 시점은 `P6-BIP-04`(PENDING) |
| 41 | PASS | `stage6-recommendation.test.ts` · `stage6-copy.test.tsx` 통과 · 화면 표시 = `ActivityOptionCard.tsx:114 {option.reason}` 그대로 |

### 4.7 횡단 (AC-6-42 ~ 50)

| AC | 판정 | 증거 |
|---|---|---|
| 42 · 43 · 44 | PASS | `stage6-copy.test.tsx` · `stage6-privacy.test.tsx` · `stage6-cross-cutting.spec.ts` (copy 7 · privacy 2) 통과 · grep `console.` 0 |
| 45 | PASS | `apps/web/package.json` dependencies 8개(변경 0) · `dist` secret 패턴 0 · `assert:no-mocks` OK |
| 46 (자동) | PASS | `stage6-cross-cutting.spec.ts` 이름/역할 · Tab 순회 포커스 링 · 44 hit-test · reduced-motion 통과 · `growth-capability.spec.ts` 키보드(라디오 1 tab stop) · 차트 `role=img` + 승인 문장. axe 는 저장소에 없다(도입 = 승인 사항, Stage 5 와 같음) — 자동 프로브 대체 |
| 46 (대비) | **PARTIAL** | baseline 의 1200 높이가 아닌 **852 실측** (`qa-contrast-bg-*.png`, 글자 `rgb(74,95,92)` 13px/400): *Choose one to continue.* 온보딩 **4.24–4.36** · 설정 **4.31–4.43** · *You can change this anytime in Settings.* **4.38–4.48** — 셋 다 4.5 미만. VG 는 마지막 문장을 1200 높이에서 4.88 ✅ 로 봤으나 852 에서는 미달이다. `P-34` 등재 여부 사용자 결정(`VG6-E2-09`) 대기 → `QA-6-004` |
| 46 (SR) | **NOT VERIFIED** | 실제 스크린리더 낭독(차트 요약 · 라디오 *Suggested/Current* · UpdateNote · 덱 이름) — 도구 없음 → `QA-6-005` |
| 47 | PASS | `stage6-cross-cutting.spec.ts` 반응형 4 · 화면별 기하 · `shadow.spec.ts` `R-SHADOW-1` 양축 프로브 통과 (§4.9) |
| 48 | PASS | `lint:boundaries` ✔ · `stage6-boundaries.test.ts` (Page import 에 `shared/api`·`mocks`·react-query·`fetch(` 0 · `survey-update` ↔ `onboarding-survey` 0) |
| 49 | PASS | 전체 suite: Stage 2 설정·로그아웃·온보딩 · 3 Home · 5 회고 통과 · `session-regression.spec.ts` AC-4-99 (`QA-5-005` 정리, 상수 852) 통과 |
| 50 | PASS | §3 명령 전부 exit 0 |

### 4.8 승계 AC (AC-6-53 ~ 66)

| AC (승계) | 판정 | 증거 |
|---|---|---|
| 53 · 54 · 55 · 65 | PASS | `growth-capability.spec.ts` Trial 전체 체인 · 건너뛰기 재강제 0 · 조회 실패 *Continue to Home* · 뒤로 = 프로필 |
| 56 (AC-2-33·34) · 57 (AC-2-33) · 58 (AC-2-32) · 59 (AC-2-35) · 60 (AC-2-36) | PASS | `diamondGeometry.test.ts` · `DiamondChart.test.tsx` · `profile-result.*`. **`T6-2` QA 실측**: 좌·우 라벨 폭 **64.0** (= `--chart-diamond-label-max` 64px), 높이 32 = 2줄, 320·393·600 동일 · 위 82.3 / 아래 115.6 (1줄) |
| 61 (AC-2-37) · 62 (AC-2-51) · 64 | PASS | `growth-capability.spec.ts` (축 히트 ≥ 44 · 키보드 · 저장 실패 → 재시도) · `settings-growth.*` |
| 63 | PASS | `settings-growth.test.tsx` *Profile* 행 · QA 프레임 `qa-frame-settings-profile.png` (h1 *Profile* · Back · CTA 0) |
| 66 | PASS | 화면별 320/393/600/1024 e2e · 페르소나 171자 말줄임 0 · `R-SHADOW-1` |

### 4.9 Visual Gap 에서 QA 로 넘어온 실측

| 항목 | 결과 | 증거 |
|---|---|---|
| `VG6-E1-07` `T6-2` 라벨 64 | 일치 (위 AC-56~60 행) | `qa-measure.log [T6-2]` |
| `VG6-E1-16` 프로필 Loading | 재방문: 차트 block → 카드2 → 카드3, 온보딩: header text 2 줄 + 같은 카드 3 — Spec §3.6 구성과 일치 | `qa-profile-loading-393.png` · `qa-profile-onboarding-loading-393.png` |
| `VG6-B-18` · `VG6-C-04` · `VG6-D-01` TopBar 전체 프레임 | 7 화면 393×852 — 설정 계열 centered 제목 + Back · 재응답 진입 TopBar 제목 없음 · 온보딩 발전 역량 Back 만 · 온보딩 프로필 TopBar 버튼 0 | `qa-frame-*.png` · `qa-measure.log [topbar]` |
| `VG6-D-08` · `VG6-D-09` 설정 발전 역량 offline / loading | Loading: text 2 → 차트 block → 행 4 · 조회 offline: `ErrorState` *You are offline* + *Try again* (Continue to Home 0) · 저장 offline: InlineAlert 문구 §10.2 | `qa-growth-settings-*.png` |
| `VG6-E1-15` · `E2-13` · `B-13` · `C-14` · `D-10` · `D-11` 그림자 프로브 | `shadow.spec.ts` 의 `ERROR_STATE_SCREENS` · ListGroup · 차트 카드 describe 가 전체 suite 에서 통과 — 단정값(좌우 6px · 아래 16px · 위 6px · 600 컬럼 바깥 3px 차 > 기준)이 재현됨. 수치 자체는 테스트가 출력하지 않아 handoff 수치를 따로 재측정하지는 않았다 | `e2e-full.log` |
| `VG6-D-16` 온보딩 Step 1 편집 모드 Tag | *5yr 7mo* 가 내용 폭 pill · 섹션 왼쪽 정렬 (시트 닫힘 중 프레임이나 Tag 행은 정착) · e2e `settings-child.spec.ts` “온보딩 Step 1 편집 모드” 통과 | `qa-onboarding-step1-edit-tag.png` |
| `VG6-B-21` · `VG6-C-16` 온보딩 baseline 불변 | `git status` 에 s2 baseline 변경 0 · 전체 suite 통과. 단 기본 `changed` 모드 통과 = 임계 0.02 안에서 같다는 뜻 (`R-BASELINE-1` ③-1). `--update-snapshots=all` 은 QA 쓰기 범위(baseline 파일) 밖이라 실행하지 않았다 | — |
| `VG6-E2-09` 852 대비 | 위 AC-6-46 (대비) | — |
| `VG6-E2-20` UpdateNote 320 | 2줄(높이 36, line-height 22) · 아이콘 가운데 | `qa-updatenote-320.png` |

## 5. Findings

```
QA-6-001 | Severity: Medium
Requirement: AC-6-22 (Plan §5.2 "회고 카드 제목·Home 문구·세션 버블 슬롯이 새 이름을 쓴다" · R6-03 · D5-14)
Steps to reproduce (Mock 기본 시나리오):
  1. 로그인 → Home → Settings → Child info
  2. First name "Emma" → "Mia" → Save → Saved → Back(Home)
  3. Start Session → Bedtime → Continue → Start recording → Submit
Expected: 완료 화면의 이름이 하나로 일치 — 완료 버블과 회고 카드 제목 모두 "Mia"
  (fixtures/me.ts:37 주석 · D5-14: "완료 버블 `Emma did wonderfully.` 와 회고 카드 제목이 일치")
Actual: 같은 화면에 두 이름 — 버블 "Storytime success! Emma did wonderfully." / 카드 "How was storytime with Mia?"
Evidence: docs/qa/evidence/stage-6/qa-ac22-complete-after-rename.png · qa-ac22.log (COMPLETE 줄)
  e2e settings-child.spec.ts:103 은 회고 카드 제목만 단정해 이 상태로 통과한다.
Suspected area (수정 지시 아님): apps/web/src/mocks/fixtures/sessions.ts:51 (완료 버블 고정 문자열)
  · mocks/sessions/sessionFixtureScenarios.ts:160 — 상태 저장형 Mock 의 아이 이름(mocks/children/childProfileState)을
  따르지 않는다. 서버가 만드는 문장이 현재 이름을 써야 한다는 요구는 Handoff 에도 적어야 한다.
```

```
QA-6-002 | Severity: Medium (PARTIAL — 사용자 결정 대기)
Requirement: AC-6-18 ("컴포넌트 = Step 1 과 동일(Figma 248:1159 입력 실측 기준)")
Steps: /settings/child (Mock 기본)
Expected: Figma 248:1159 — 독서 루틴 Answer card 행 · 언어 칩이 카드 안
Actual: 독서 루틴 RadioGroup list · 칩 카드 없음 (Stage 2 Step 1 과 같다 — Stage 2 부터 있던 차이)
Evidence: e2e/__screenshots__/darwin/settings-child.spec.ts/s6-settings-child.png · VG6-B-06 · VG6-B-07
Suspected area: entities/child/ChildInfoFields.tsx · entities/child/child.css
결정: VG6-B-06/07 ① Figma 대로(두 화면 + s2 baseline 재생성) ② 현행 + 허용 차이 등록. ② 를 택하면 이 AC 는 PASS 로 다시 판정한다.
```

```
QA-6-003 | Severity: Medium (PARTIAL — 사용자 결정 대기)
Requirement: AC-6-26 ("이탈 → 설정 재진입 → 마지막 카드부터 · 답 보존")
Steps: Settings → Update survey answers → Start → 첫 카드 답 변경 → 다음 2회(단계 2 진입, PUT reading_together)
  → 브라우저 back → Update survey answers → Continue where you left off
Expected: 떠난 곳(단계 2 books-and-interests)부터
Actual: 단계 1 reading-together 첫 카드 (답은 보존). 단계 안에서 고친 답은 back/탭 닫기 시 저장되지 않는다
Evidence: e2e/settings-survey.spec.ts:93-128 (이 동작을 단정하며 통과) · VG6-C-10
Suspected area: features/survey-update/model/useSurveyUpdateWizard.ts · mocks/children/MockChildrenApi.ts currentStep 규칙 · contracts SurveyUpdateState.currentStep 의미
결정: VG6-C-10 ①(도착 단계를 저장 — contract 변경) ②(현행 수용) ③(이탈 시 저장). ② 를 택하면 AC 문구 정정 후 PASS.
```

```
QA-6-004 | Severity: Medium (PARTIAL — 사용자 결정 대기)
Requirement: AC-6-46 대비 · Spec §9.3
Steps: 393×852 /onboarding/growth-capability (기본 · all-scores-missing) · /settings/growth-capability (all-scores-missing)
Expected: 본문(13px/400) 4.5:1 이상 또는 가값 등재
Actual: Choose one to continue. 4.24–4.43 · You can change this anytime in Settings. 4.38–4.48 (852 높이, 그래디언트 끝)
Evidence: docs/qa/evidence/stage-6/qa-contrast-bg-*.png (글자를 투명으로 바꾼 배경 영역) · qa-measure.log [contrast]
Suspected area: features/growth-capability (CTA mt-auto 로 화면 끝 그래디언트에 놓이는 footnote)
결정: VG6-E2-09 — P-34 등재 / 다른 처리. 결정 범위에 "You can change…" 852 미달을 함께 넣어야 한다(VG 는 1200 에서 통과로 봄).
```

```
QA-6-005 | NOT VERIFIED
Requirement: AC-6-46 (스크린리더)
사유: 실제 VoiceOver / TalkBack 낭독은 에이전트 환경에서 실행 불가. 절차 §6.
```

```
QA-6-006 | Severity: Low (테스트 범위 — 판정 영향 없음)
Requirement: AC-6-39 · 40 (검증 방법 "e2e")
내용: 저장소에 화면 e2e 가 없다(Mock 단위만, H6-7.8 ②). QA 는 임시 탐침으로 브라우저 동작을 확인했다(§4.6) — 회귀 방지 테스트는 없다.
  관찰: 회고 저장·세션 완료는 today card 를 무효화하지 않는다. Plan §5.2 가 요구하지 않으므로 결함이 아니며, 시점 결정은 P6-BIP-04.
Suspected area: e2e (신규 spec) · 필요 시 features/reflection 저장 성공 후 무효화 1줄
```

## 5.1 사용자 결정 대기 항목 — Stage Verdict 차단 여부

결정 대기 항목은 FAIL 로 판정하지 않았다. 차단 = 결정 전까지 해당 AC 가 `PASS` 가 될 수 없어 `qa.md` §2 에 따라 Verdict 를 `INCOMPLETE` 이하로 만든다.

| 항목 | 내용 | 차단 | 근거 |
|---|---|---|---|
| `VG6-E1-03` · `E1-12` · `E1-14` (`E2-07`·`E2-14` 연동) | 변형 C 캡션 정렬 · h1↔안내 간격 · *Continue to Home* 정렬 | 비차단 | Spec 이 말하지 않는 지점 — 구현이 승인 Spec(`D6-8`)과 일치. AC-6-56/58/55 는 PASS |
| `VG6-E2-06` | 설명 ↔ *You can change…* 간격 8/20 | 비차단 | 같은 이유 |
| `VG6-E2-09` (`P-34` 후보) | 대비 4.24–4.48 (QA 852 실측 포함) | **차단** | AC-6-46 대비 PARTIAL (`QA-6-004`) |
| `VG6-E2-19` | UpdateNote 연도 | 비차단 | Spec 이 지정한 함수 동작. AC-6-36 PASS |
| `VG6-E2-20` | UpdateNote 320 2줄 · 아이콘 정렬 | 비차단 | 넘침 0 (AC-6-66 PASS) · 아이콘 정렬은 Spec 미지정 |
| `VG6-B-06` · `B-07` | 독서 루틴 / 언어 칩 카드 Figma 차이 | **차단** | AC-6-18 이 Figma `248:1159` 를 기준으로 명시 → PARTIAL (`QA-6-002`). 최우선 규칙 6: 허용 차이 등록은 사용자 승인 후 |
| `VG6-B-11` | 필드 오류 문구 *Please check this and try again.* | 비차단 (단 확정 필요) | AC-6-20 동작 PASS. 문구 승인은 Stage 8 전까지 닫아야 한다 |
| `VG6-C-09` | 덱·진행바 이름 *Onboarding …* | 비차단 | 이름은 존재(AC-6-46 자동 PASS). 낭독 의미는 SR NOT VERIFIED(`QA-6-005`)와 함께 확인 |
| `VG6-C-10` | 이어서 열리는 단계 · 이탈 시 미저장 | **차단** | AC-6-26 “마지막 카드부터” 미충족 → PARTIAL (`QA-6-003`) |
| `VG6-D-12` | 직접 링크 시 `navigate(-1)` | 비차단 | Spec 정의 동작 · 앱 공통 · Stage 8 추적 |
| 언어 칩 히트 영역 5px 겹침 | 실효 ≈ 41.5 (Stage 2 부터) | 비차단 | 44pt 는 `[제안]` 기준(frontend.md §9) · WCAG 2.5.8 충족 · Stage 6 AC 에 터치 타깃 조건 없음 |
| AC-6-39/40 Mock 단위만 · today card 갱신 시점 (`P6-BIP-04`) | — | 비차단 | QA 브라우저 탐침으로 두 AC PASS. 시점은 Backend 결정(PENDING) · 회귀 테스트 부재는 `QA-6-006` Low |

## 6. NOT VERIFIED 항목과 수동 테스트 절차

### `QA-6-005` — AC-6-46 스크린리더 (iOS VoiceOver / macOS VoiceOver + Safari)

1. Mock 로그인 → `/onboarding/profile`: 차트로 이동 → 승인 요약 문장 1회 낭독, 축 라벨 개별 낭독 0, 숫자 0
2. `/onboarding/growth-capability`: 라디오 그룹 이름 · *Cognitive Flexibility, Suggested, selected* · 다른 역량 선택 시 설명 문장 polite 낭독 · `all-scores-missing` 에서 CTA 낭독에 *Choose one to continue.* 연결
3. `/settings/growth-capability`: *… Current* 낭독 · Save 비활성 상태 낭독
4. `/settings/profile?scenario=children:profile-updated`: UpdateNote 가 일반 문장으로 1회(live 아님)
5. `/settings/child`: 저장 실패 InlineAlert 낭독 · 첫 오류 필드 포커스 · 이탈 Dialog 초기 포커스 *Keep editing*
6. 재응답 카드: 덱·진행바 이름(현재 *Onboarding questions/progress*, `VG6-C-09`) 기록
기록: 기기 · OS · 낭독 문장 원문 · 기대와 다른 점

## 7. BACKEND_INTEGRATION_PENDING

Frontend 부분(UX · Contract 호출 · Mock 시나리오)은 §4 에서 별도 판정했다.

| 항목 | AC | 대기 사유 | Handoff 대상 문서 |
|---|---|---|---|
| `P6-BIP-01` 세션 분석 누적 → 스냅샷 갱신 규칙 | 52 | 실제 분석 파이프라인 | `ANALYSIS_PIPELINE_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| `P6-BIP-02` 페르소나 재생성 · 안전 검증 · fallback 풀 · `ai_generation_logs` | 52 | AI Backend | `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P6-BIP-03` cold → warm 전환 · `recommendation_logs` | 51 | 추천 서버 | `ANALYSIS_PIPELINE_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| `P6-BIP-04` warm 입력 · **반영 시점**(다음 날 07:00 vs 즉시) | 51 | 추천 서버 · 시점 결정 | `ANALYSIS_PIPELINE_REQUIREMENTS` · `BACKEND_HANDOFF` |
| `P6-BIP-05` 역량 순환 · 3일 지양 | 51 | 추천 서버 | `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P6-BIP-06` 재독 새 Prompt 세트 | 51 | 추천 서버 | `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P6-BIP-07` 재응답 버전 행 · 불변 · 새 스냅샷 · draft 보존 · 동의 강제 (+ 후보: `currentStep` 의미, `VG6-C-10` 결과에 따름) | 52 | DB · 서버 검증 | `DATA_REQUIREMENTS` · `BACKEND_HANDOFF` · `AUTH_REQUIREMENTS` |
| `P6-BIP-08` 생년월 변경 → 연령대 재계산 · 수정 이력 | 52 | 서버 · 법무 | `DATA_REQUIREMENTS` · `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P6-BIP-09` 소유권 · RLS · 전체 삭제 대상 | 52 | 서버 · RLS | `AUTH_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| `P6-BIP-10` 발전 역량 변경 기록 · 추천 반영 | 51 | 서버 | `DATA_REQUIREMENTS` · `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P6-BIP-11` 프로필 갱신 사실 → `characterLine` 서버 문장 | 52 | 서버 문장 생성 | `BACKEND_HANDOFF` · `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P6-BIP-12` `GET /profile` 이 온보딩 제출 직후에도 완성 `ChildProfile` | 52 | 서버 | `BACKEND_HANDOFF` · `ANALYSIS_PIPELINE_REQUIREMENTS` |

추가 권고(신규 ID 아님, Plan 소유): 서버가 만드는 문장(완료 버블 · `characterLine` 등)은 **현재 아이 이름**을 써야 한다 — `QA-6-001` 의 Backend 측 요구. `P6-BIP-08` 또는 `P6-BIP-11` 메모로 반영할지 plan-agent 결정.

남은 가값(FAIL 사유 아님): Stage 6 신규 `P-30` · `P-31` · `P-32` · `P-33` (S6-E1 등재) · 후보 `P-34` (결정 대기).

## 8. Regression · Baseline (`R-BASELINE-1`)

### 8.1 전체 suite

763 passed (Stage 1~6 전 spec, `chromium` + `chromium-classic-scrollbar`) · failed 0 · `retries: 0`. 실행 뒤 `git status e2e/__screenshots__` 불변.

### 8.2 Stage 6 동안 재생성된 baseline

| baseline | git 상태 | 원인 확인 | dev 패널 · settle |
|---|---|---|---|
| `visual.spec.ts/s3-dialog-scrim.png` | **수정됨** (HEAD 대비) | QA 재분해 (`s3-dialog-scrim-diff.log`, 채널 Δ > 5): 75,331 px · 연결성분 18 — ① `(24,104)-(368,317)` 64,877 + `(24,64)-(368,102)` 9,068 = 새 *YOUR CHILD* 라벨 + 4행 그룹 (아래 끝 y 317 은 반투명 Dialog 상자 위쪽 11px 에 비친 *Growth focus* 행 — `VG6-B-03` 정정과 일치) ② `(24,357)-(36,409)` · `(357,358)-(368,408)` = 옮겨진 Account 그룹 좌·우 가장자리 ③ y 334~343 글자 조각 = *ACCOUNT* ④ y 379~391 글자 조각 6개 = *Log out*. 설명 안 되는 클러스터 0 → `C13-S6-1` 의도 변경 | 이미지에 dev 패널 없음(육안) · 기존 `visual.spec.ts` 흐름 |
| `profile-result.spec.ts/s6-profile-revisit-updated.png` | 신규(untracked) — Stage 6 안에서 재생성, HEAD 비교 대상 없음 | 현재 이미지 = UpdateNote 1줄 + 카드 3 · 페르소나 *Brave Little Maker* (`persona-changed`) — H6-3.5 설명(노트 추가 + 38px 이동)과 일치 | `openProfile` → ready 대기 → `settle()` · `hideDevPanel` (`profile-result.spec.ts:18·36`) · 패널 없음 |
| `growth-capability.spec.ts/s6-growth-onboarding-changed.png` | 신규 — Stage 6 안에서 재생성 | 현재 이미지 = ER 행 teal 채움 + 흰 라벨 · *Suggested* 는 CF 에 남음 = `VG6-E2-04` 수정 결과. 회귀 테스트 `growth-capability.spec.ts` “선택 행 + hover” 통과 | `mouse.move(0,0)` → `settle()` (L248) · 패널 없음 |
| `settings-child.spec.ts/s6-settings-child.png` · `-save-failed.png` | 신규 — Stage 6 안에서 재생성 | 현재 이미지 = *5yr 7mo* 내용 폭 pill (`VG6-B-09` 수정) · save-failed 는 InlineAlert + 입력 *Mia* 보존 | `openChildInfo` 끝 `settle()` (L35) · save-failed 는 포인터 치운 뒤 `settle()` · 패널 없음 |

- 신규 baseline 전 24장(5 디렉토리)은 모두 `hideDevPanel` + `settle()` 경로를 거친다(grep, 각 spec L13~40). `toHaveScreenshot` 직전에 `settle()` 이 없는 호출(`s6-settings-child`, `s6-growth-settings`, `-empty`, `s6-survey-card`, 프로필 루프)은 open helper 마지막 줄이 `settle()` 이다.
- untracked baseline 의 “재생성 전 이미지”는 저장소에 없으므로 QA 가 diff 를 다시 분해할 수 없다 — 현재 이미지가 handoff 의 원인 서술과 일치함을 육안으로 확인했다.
- 스테일 baseline 검사(`--update-snapshots=all`)는 baseline 파일 쓰기라 QA 권한 밖 — 미실행.

## 9. 재검증 이력

| 회차 | 일시 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-11-18 01:10 – 09:30 KST | **`FAIL`** | `QA-6-001` FAIL · `QA-6-002`~`004` PARTIAL(결정 대기) · `QA-6-005` NOT VERIFIED · `QA-6-006` Low |
| 2 | 2026-11-18 15:35 – 16:10 KST | **`INCOMPLETE`** | 대상 H6-8 · H6-9 (`D6-9`, G-1~G-12). `QA-6-001` FAIL→PASS · `QA-6-003` · `004` PARTIAL→PASS · `QA-6-006` closed · `QA-6-002` PARTIAL 유지(잔여 `VG6-G-02/04/07/08/09` 사용자 결정) · `QA-6-005` NOT VERIFIED 유지 · 신규 Finding 0 · e2e 767 passed |
| 3 | 2026-11-18 (`S6-H` 이후) | **`PASS (accepted: QA-6-005)`** | 대상 H6-10 (`D6-10` ①②③). `QA-6-002` PARTIAL→**PASS (closed)** · `QA-6-005` NOT VERIFIED → **accepted (`D6-10` ④, Stage 8 확인)** · 신규 Finding 0 · e2e 767 passed · 비차단 사용자 결정 `VG6-H-09` · `VG6-H-06` (§11.6) |

다음 회차 조건 (2회차 기준 — §10.6): `VG6-G-02/04/07/08/09` 사용자 결정 → (수정 시) development-agent → design-agent Visual Gap → QA 재검증, `QA-6-005` 수동 절차 또는 항목별 수용. 1회차 기준: `QA-6-001` 수정(development-agent) → 재검증. `QA-6-002`·`003`·`004` 는 사용자 결정 후 재판정. `QA-6-005` 는 수동 절차 실행 또는 사용자 항목별 수용.

---

## 10. Round 2 — 재검증 (stage-qa-agent, 2026-11-18 15:35 – 16:10 KST)

Product Code 수정 0 · baseline 쓰기 0 · 커밋 0. 대상 = 작업 트리(HEAD `d85f28f` + Stage 6 + H6-8 `QA-6-001` 수정 + H6-9 `S6-G` G-1~G-11). 기준 추가: `D6-9` · Plan 개정 3 §12.2 (G-1~G-12) · AC-6-26 개정 문구 · `P6-BIP-13` · `API_CONTRACTS.md` Rev 10.1 · handoff H6-8 · H6-9 · Visual Gap §S6-G.

### 10.1 Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **`INCOMPLETE`** — `FAIL` 0 · `PARTIAL` 1 (AC-6-18 — Figma `248:1159` 잔여 차이 5건 사용자 결정 대기, `QA-6-002`) · `NOT VERIFIED` 1 (AC-6-46 스크린리더, `QA-6-005`). 다음 Stage 진입 불가 — §10.6 결정 · 수용 필요 |
| AC 집계 (68줄) | `PASS` 64 · `FAIL` 0 · `PARTIAL` 1 (AC-6-18) · `NOT VERIFIED` 1 (AC-6-46 SR) · `BACKEND_INTEGRATION_PENDING` 2 (AC-6-51 · 52). AC-6-26 ④ 실제 전달은 `P6-BIP-13` PENDING 으로 AC-6-52 묶음에 포함(Frontend ①~④ 는 PASS) |
| Findings 변화 | `QA-6-001` FAIL → **PASS (closed)** · `QA-6-002` PARTIAL 유지(범위 축소: 구조는 해소, 잔여 = `VG6-G-02/04/07/08/09`) · `QA-6-003` → **PASS (closed)** · `QA-6-004` → **PASS (closed)** · `QA-6-005` NOT VERIFIED 유지 · `QA-6-006` → **closed** · 신규 Finding 0 |
| 개발 측 주장 재현 | 단위 206 files / **2,979** (H6-9.7 주장과 같음) · Playwright ****767 passed / 0 failed** (19.5m, 단독) — 주장 재현** (H6-9.7 = 767 passed) |

### 10.2 Environment · Commands

환경은 §2 와 같다. Playwright 단독 실행: 시작 전 `ps` 로 Playwright node/Chromium 프로세스 0 확인 (`pgrep -f "playwright test"` 의 4건은 **자기 자신의 명령줄을 매칭하는 이전 세션 대기 루프**였다 — 실제 실행 아님). QA 탐침은 저장소 밖 scratch(`r2-probe.spec.ts.txt` 사본) — dev 서버 4319 · 저장소 helper 재사용, 탐침과 전체 suite 는 순차.

| 명령 | 결과 | 로그 (`docs/qa/evidence/stage-6/`) |
|---|---|---|
| `ls -d apps/api apps/mobile supabase` · `ls apps` | 셋 다 없음 · `apps/` = `web` | — |
| `pnpm install --frozen-lockfile` | exit 0 | `r2-install.log` |
| `pnpm typecheck` | exit 0 | `r2-typecheck.log` |
| `pnpm lint` | exit 0 | `r2-lint.log` |
| `pnpm lint:boundaries` | exit 0 — no dependency violations (936 modules, 3727 dependencies) | `r2-lint-boundaries.log` |
| `pnpm format:check` | exit 0 | `r2-format.log` |
| `pnpm build` | exit 0 (청크 크기 경고만) | `r2-build.log` |
| `pnpm assert:no-mocks` | exit 0 | `r2-no-mocks.log` |
| `pnpm test` | exit 0 — **206 files / 2,979 tests** | `r2-vitest.log` |
| `pnpm test:e2e --reporter=line` (단독) | exit 0 — **767 passed (19.5m)**, failed 0 | `r2-e2e-full.log` |
| `git status --short e2e/__screenshots__` (실행 전·후) | 실행 전·후 동일 — 실행이 baseline 을 다시 쓰지 않았다 | — |
| QA 탐침 `qa2-fix` (6 tests) · `qa2-sheet` | QA-6-001 · 003 · G-1 · G-1a · G-3 · G-5 · G-7 · G-9 · VG6-G-18 · R-SHADOW-1 직접 재현 | `r2-probe.log` · `r2-step1-sheet.log` · `r2-*.png` |
| `r2-band.py` (PIL 행 비교) | `s2-onboarding-childinfo*` 3장 HEAD ↔ 작업본 | `r2-s2-childinfo-band.log` |
| grep (S6-G 변경 파일 11개) | HEX · `rgb()` · arbitrary px · `style={{` · `any` · `@ts-ignore` · `eslint-disable` · `console.` · `overflow` **0** | — |

### 10.3 Findings 재판정

| ID | 1회차 | 2회차 | 증거 |
|---|---|---|---|
| `QA-6-001` (AC-6-22) | FAIL | **PASS — closed** | QA 탐침(1회차와 같은 경로: Settings → Child info → *Mia* 저장 → Home → 세션 → Submit): 완료 화면 본문 = *Storytime success! **Mia** did wonderfully.* + *How was storytime with **Mia**?* · 화면 텍스트에 `Emma` 0 (`r2-probe.log [QA-6-001]` · `r2-ac22-complete-after-rename.png`). 회귀 e2e `settings-child.spec.ts:117-128` 이 버블 문장까지 단정 · 단위 `MockSessionApi.test.ts` +3. 문장은 Mock(서버) 이 만든다 — Frontend 표시 코드 변경 0 (`D4-2`). Backend 요구는 §10.5 |
| `QA-6-002` (AC-6-18) | PARTIAL | **PARTIAL (범위 축소)** | **구조(`D6-9` ①) = PASS**: `/settings/child` 탐침 — fieldset *Languages you use at home* 안 칩 9 (카드 `.haru-choice-card`), *Reading routine* = 형제 fieldset 라디오 5 (Answer-card 행) · 온보딩 Step 1 같은 구성(`r2-settings-child-full.png` · `r2-step1-after-3s.png`). **G-1a 중간선 분할 = PASS**: `elementFromPoint` 0.5px 주사 — 줄0 Spanish 아래 478 / Vietnamese 위 486 → 소유 전환 481.5 (중간 482) · 줄1 519 / 527 → 522.5 (중간 523) (`r2-probe.log [G-1a]`). **잔여**: 같은 Figma 노드 `248:1159` 대비 차이 5건이 사용자 결정 대기 — `VG6-G-07` 행 라벨 weight (Medium) · `G-02` radius 30→28 · `G-04` backdrop blur 추가 · `G-08` 라벨 Bold/tracking · `G-09` 라벨 세로 간격 Δ−5. 최우선 규칙 6: 허용 차이 등록은 사용자 승인 후 → AC-6-18 은 결정 전까지 PASS 불가 |
| `QA-6-003` (AC-6-26 개정) | PARTIAL | **PASS — closed** | ① e2e `settings-survey.spec.ts` — 이동 PUT `{step: reading_together, currentStep: books_and_interests}` ② QA 탐침: 단계 2 첫 카드(카드 3, 다중 선택)에서 답 변경 → 브라우저 back → 이탈 PUT 1건 `{step: books_and_interests}` (`currentStep` 생략) ③ 재진입 *Continue where you left off* → `/settings/child/survey/books-and-interests` · 카드 3 · h1 *Books and interests* · 고친 답 보존 (`checkbox0=false:narrative` 일치) ④ `pagehide` 디스패치: 편집 없음 PUT 0 · 편집 후 PUT 1 (`currentStep` 생략) — Mock 에서는 `keepalive` 무시(설계), Http `keepalive: true` 는 단위 `http-stage6.test.ts` · TopBar *Go back*(첫 카드, 미저장 편집) → 진입 화면 + PUT 1 (`r2-probe.log [QA-6-003] [pagehide] [TopBar leave]`). 앱 안 route 이동 unmount = 단위 `survey-update.test.tsx`. 실제 전달 보장 = `P6-BIP-13` PENDING |
| `QA-6-004` (AC-6-46 대비) | PARTIAL | **PASS — closed** | 글자색 `rgb(59,74,72)` = `--color-fg-strong`(ink-800, 기존 토큰) · 13px/400. 1회차와 같은 방법(글자 투명 → 글자 상자 배경 픽셀 **전수** 최소값): **852** — *You can change…* 5.94 (기본) / 6.04 (empty) · *Choose one to continue.* 온보딩 5.79 · 설정 5.88 · **1200** — 6.56 / 6.67 / 5.79 / 5.79. 전부 ≥ 4.5 · `P-34` 미등록 (`r2-probe.log [contrast]` · `r2-contrast-bg-*.png`) |
| `QA-6-005` (AC-6-46 SR) | NOT VERIFIED | **NOT VERIFIED (유지)** | 실제 VoiceOver/TalkBack 미실행 — 에이전트 환경 도구 없음. 자동 부분: 재응답 흐름 덱 `aria-label` *Survey questions* · 진행바 *Survey progress* (`r2-probe.log [G-9]`), 온보딩 *Onboarding questions* 는 전체 suite `onboarding.spec.ts`(`DECK_LABEL`) 통과. 절차 §6 + 재응답 이름 확인 1줄 추가(§10.7) |
| `QA-6-006` (AC-6-39/40 e2e) | Low (판정 영향 없음) | **closed** | 신규 `e2e/today-card-refresh.spec.ts` 2건 — 회고 저장 직후 탭 왕복 없이 Home 첫 카드 단정(`difficulty-lowered` = *Grumpy Monkey…* + 하향 사유 · `cold-to-warm` 3회째 cold 유지 → 4회째 warm). 전체 suite 에서 통과(§10.2). 구현 `useSubmitReflection` 성공 시 `activityCardKeys.all` 무효화 + 단위(성공 시만) — 1회차 관찰("Home 이 staleTime 안에 이전 덱")이 해소됨 |

### 10.4 AC 재판정 (변경분만 — 나머지는 §4 그대로이며 전체 suite 로 회귀 확인)

| AC | 1회차 | 2회차 | 증거 |
|---|---|---|---|
| 18 | PARTIAL | **PARTIAL** | `QA-6-002` 행 |
| 22 | FAIL | **PASS** | `QA-6-001` 행 |
| 25 | PASS | PASS | 이동 PUT 에 `currentStep` = 도착 단계 (e2e + 탐침) |
| 26 (개정) | PARTIAL | **PASS** (④ 실제 전달 = `P6-BIP-13` PENDING) | `QA-6-003` 행 |
| 46 (대비) | PARTIAL | **PASS** | `QA-6-004` 행 |
| 46 (SR) | NOT VERIFIED | **NOT VERIFIED** | `QA-6-005` |
| 36 · 66 (G-7) | PASS | PASS | 320 UpdateNote 높이 36(2줄, footnote 18) · 아이콘 중심 y9 = 첫 줄 중심 9 (`r2-probe.log [G-7]` · `r2-updatenote-320.png`) |
| 56 · 61 · 64 (G-5 시각) | PASS | PASS | 프로필 h1 → 안내 **20** · 발전 역량 h1 → 안내 **20** · 선택 설명 → *You can change…* **20** (ER 선택) — DRAFT `319:1425`·`320:1493` 값 = `--space-5` (`r2-probe.log [G-5]`) |
| 20 (G-8) | PASS | PASS | 문구 변경 0 · `settings-child.spec.ts` 통과 |
| 29 (회귀) | PASS | PASS | 온보딩 spec 전부 통과 · Step 1 baseline 3장 재생성은 §10.8 분해 |
| 39 · 40 | PASS (탐침) | **PASS (저장소 e2e)** | `QA-6-006` 행 |
| 47 / `R-SHADOW-1` (새 언어 카드) | — | PASS | 조상 overflow = `AppShell` 뷰포트(`overflow-y-auto`) 하나, 카드 좌우 거터 24 ≥ `--shadow-bubble` 번짐 4 · 세로는 스크롤 축 중간(클립 선 없음) (`r2-probe.log [R-SHADOW-1]`). `shadow.spec.ts` 에 이 카드 전용 프로브는 없다 — 기하로 판정 |
| 48 · 50 | PASS | PASS | §10.2 명령 전부 exit 0 · `useChipRowSplit` → `shared/hooks` 이동으로 feature 간 import 0 (lint:boundaries ✔) |

### 10.5 BACKEND_INTEGRATION_PENDING (변경분)

| 항목 | AC | 대기 사유 | Handoff 대상 |
|---|---|---|---|
| 🆕 `P6-BIP-13` 재응답 draft 위치 `currentStep ?? step` · 마지막 쓰기 우선 · `keepalive` 수용 · 이탈 PUT 부분 응답은 draft 에만 | 26 ④ · 52 | 서버 · 실제 `keepalive` 전달 | `BACKEND_HANDOFF` · `DATA_REQUIREMENTS` (Plan §10 등재 확인) |
| (메모) 서버 생성 완료 버블 문장 = **문장 생성 시점의 현재 아이 이름** | 22 의 서버 측 | 서버 문장 생성 | Plan §12.2 G-12 가 "Stage 8 Handoff 로 기록" 으로 정함 · H6-8.4 는 `P6-BIP-08` 메모 제안 — **아직 Plan §10 표에 반영되지 않음** (plan-agent 등록 대상, Stage 8 전까지 1:1 추적) |

나머지 `P6-BIP-01`~`12` 는 §7 그대로. Handoff 13건.

### 10.6 사용자 결정 · 수용 대기 (QA 가 수용으로 바꾸지 않음 — `qa.md` §2)

| 항목 | 내용 | Verdict 영향 |
|---|---|---|
| `VG6-G-07` (Medium) | Answer-card 행 라벨 weight — Figma Semibold(590) vs 구현 Regular (공통 `RadioGroup` recipe: 설문 · 발전 역량 · 독서 루틴) | **차단** (AC-6-18 PARTIAL) |
| `VG6-G-02` (Low) | 언어 카드 radius Figma 30 vs `--radius-card` 28 (인계 사유 "30 토큰 없음"은 design-agent 가 정정 — `--reflection-card-radius` 30 존재) | **차단** (AC-6-18) |
| `VG6-G-04` (Low) | 언어 카드 backdrop blur — Figma 에 없음 | **차단** (AC-6-18) |
| `VG6-G-08` (Low) | *Reading routine* 라벨 Bold · tracking .72 vs 공통 SectionLabel semibold | **차단** (AC-6-18) |
| `VG6-G-09` (Low) | 언어 카드 → 라벨 → 첫 행 간격 Δ−5 | **차단** (AC-6-18) |
| `QA-6-005` | 스크린리더 실기기 낭독 | **차단** (NOT VERIFIED) — 수동 절차 실행 또는 항목별 수용 |
| `VG6-G-19` (참고) | 언어 선택지 Figma 7 vs contracts 9 — Stage 2 기존, S6-G 범위 밖 | 비차단(기록) |
| H6-9.10 `v2-material` 드리프트 | §10.8 | 비차단 |

`VG6-G-02/04/07/08/09` 를 사용자가 **"현행 + 허용 차이 등록"** 으로 정하면 AC-6-18 은 PASS 로, **"Figma 대로 수정"** 이면 development-agent 수정 후 재검증이다. `QA-6-005` 는 §6 절차 결과 또는 `QA-6-005` 단위 수용이 있어야 `PASS (accepted: QA-6-005)` 가 된다.

### 10.7 NOT VERIFIED — 수동 절차 추가분

§6 절차에 다음을 더한다: 7. `/settings/child/survey` → *Start* → 카드 덱 이름 *Survey questions* · 진행바 *Survey progress* 낭독 · 온보딩 덱은 *Onboarding questions* 유지 확인.

### 10.8 Regression · Baseline (`R-BASELINE-1`)

| 항목 | 결과 | 증거 |
|---|---|---|
| 전체 suite | **767 passed (19.5m) · failed 0** · `retries: 0` → flaky 0 · `chromium` + `chromium-classic-scrollbar` (Stage 1~6). 신규 `today-card-refresh` 2 · `settings-child` QA-6-001 1 · `settings-survey` Rev 10.1 1 포함 | `r2-e2e-full.log` |
| 실행이 baseline 을 썼는가 | 실행 전·후 `git status --short e2e/__screenshots__` 동일 · `find -newer` 0 → **재생성 0** | — |
| `git status` (HEAD 대비) | 수정 4 (`visual.spec.ts/s2-onboarding-childinfo{,-trial,-edit}` · `s3-dialog-scrim`) + 신규 디렉토리 5 (`growth-capability` · `profile-result` · `settings-child` · `settings-growth` · `settings-survey`) | — |
| `s2-onboarding-childinfo*` 3장 (G-1, HEAD 추적) | QA 행 비교: **변경 시작 행 위는 Δ≤5 동일**(341 · 537 · 663 = 언어 칩 섹션 시작), 높이 +50 (880→930 · 1076→1126 · 1202→1252) = H6-9.5 의 +42(카드 185 − 칩 143) + 8(섹션 간격) 와 일치, 아래 끝 정렬 동일 행 28/224/350 = 852 아래 단색 꼬리. 설명 안 되는 영역 0 | `r2-s2-childinfo-band.log` · `r2-band.py.txt` |
| 그 밖의 재생성 12장 (미추적 디렉토리) | HEAD 비교 대상 없음. 탐침 실측이 handoff 의 원인 서술과 일치 — G-5 간격 20 (프로필 5장 · 발전 역량 4장 헤더 +12) · G-3 글자색 ink-800 (발전 역량 · 설정 empty) · G-1 카드 기하 (`s6-settings-child*`). 재생성 전 이미지는 저장소에 없어 QA 가 diff 를 다시 분해할 수 없다 (1회차와 같은 한계) | `r2-probe.log` |
| `s3-dialog-scrim` | 1회차 분해(`s3-dialog-scrim-diff.log`)와 같은 상태로 통과 | — |
| `v2-material` (HEAD 복원) | **HEAD 판으로 통과** (전체 suite, 임계 0.02). 드리프트 재확인: dev lane 이 남긴 렌더(3회 바이트 동일) ↔ HEAD = Δ>0 **98 px** · 최대 채널 Δ **6** · Δ>5 **2 px** (x19 · x341, y425 = 스와치 좌·우 가장자리) — H6-9.5 서술과 일치. 원인 미확정 · 임계 미만 · 비차단. `R-BASELINE-1` ③-1 상 `=all` 재생성 시 다시 쓰인다는 점만 기록 (재생성 여부 = 사용자/Orchestrator 결정, H6-9.10) | `r2-v2-material-diff.log` |
| 회귀 (AC-6-49) | Stage 2 온보딩·설정·로그아웃 · Stage 3 Home · Stage 4 세션 · Stage 5 회고·피드백 spec 전부 통과 | `r2-e2e-full.log` |

### 10.9 Visual Gap `VG6-G-18` 판정 (design-agent → QA)

- ① **Step 1 baseline 아래쪽 단색**: QA 행 비교(`r2-s2-childinfo-band.log`) — 3장 모두 **HEAD 판도** 852 아래가 단색(HEAD 마지막 비단색 행 852/1076 · 852/880 · 837/1202), 작업본 동일(826/930 · 852/1126 · 852/1252). Stage 2 부터의 상태이며 S6-G 원인이 아니다. ***Next* 미검증 → QA 탐침으로 검증**: 393×852 Step 1 채운 뒤 *Next* = y 752–808 (뷰포트 안) · enabled · 독서 루틴 5행 전부 보임 (`r2-step1-after-3s.png`). **판정: 결함 아님**. 관찰(Finding 아님): 같은 컴포넌트의 독서 루틴 행 전체는 `settings-child.spec.ts/s6-settings-child.png`(y 586–837) 가 덮는다 — Step 1 baseline 하단 촬영 방식 변경은 Stage 8 전체 baseline 정비 때 검토 권고.
- 탐침 중 관찰: Step 1 성별 시트 닫힘 fade(opacity ≈ 0.5)가 `settle()` 직후 프레임에 남는다 — 3 s 뒤 DOM 에서 사라짐(`r2-step1-sheet.log`). 전이 프레임이며 Stage 2 부터의 동작, 결함 아님. 이 화면의 저장소 baseline(`visual.spec.ts`)은 시트를 열지 않는 경로라 영향 없음.
- ② `v2-material` — §10.8.

---

## 11. Round 3 — 재검증 (stage-qa-agent, 2026-11-18, `S6-H` 이후)

Product Code 수정 0 · baseline 쓰기 0 · 커밋 0. 대상 = 작업 트리(HEAD `d85f28f` + Stage 6 + H6-8 · H6-9 · **H6-10 `S6-H`**). 기준 추가: `D6-10` (`stage-6-approvals.md`) · handoff H6-10 · Visual Gap §S6-H (`VG6-H-01`~`10`).

### 11.1 Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **`PASS (accepted: QA-6-005)`** — `FAIL` 0 · `PARTIAL` 0 · `NOT VERIFIED` 1 (AC-6-46 SR = `QA-6-005`, **사용자 항목별 수용 `D6-10` ④** — Stage 8 접근성 점검에서 확인). 나머지 In Scope 는 전부 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` |
| AC 집계 (68줄) | `PASS` 65 · `FAIL` 0 · `PARTIAL` 0 · `NOT VERIFIED` 1 (AC-6-46 SR — accepted) · `BACKEND_INTEGRATION_PENDING` 2 (AC-6-51 · 52) |
| Findings 변화 | `QA-6-002` PARTIAL → **PASS (closed)** · `QA-6-005` NOT VERIFIED → **NOT VERIFIED (accepted: `D6-10` ④)** · 신규 Finding 0 |
| 사용자 결정 대기 (비차단) | `VG6-H-09` (Low) · `VG6-H-06` `Text tracking` prop 수용 권고 — §11.6 |
| 개발 측 주장 재현 | 단위 **207 files / 2,987** (H6-10.5 와 같음) · Playwright **767 passed / 0 failed (17.5m, 단독)** (H6-10.5 = 767) |

### 11.2 Commands

시작 전 Playwright · Chromium 실행 프로세스 0 (`ps` — `pgrep -f "playwright test"` 대기 루프만 자기 명령줄 매칭). QA 탐침 → 전체 suite 순차, 겹침 없음.

| 명령 | 결과 | 로그 (`docs/qa/evidence/stage-6/`) |
|---|---|---|
| `ls -d apps/api apps/mobile supabase` · `ls apps` | 셋 다 없음 · `apps/` = `web` | — |
| `pnpm typecheck` · `lint` · `lint:boundaries` · `format:check` · `build` · `test` · `assert:no-mocks` | 전부 exit 0 · boundaries "no dependency violations (937 modules, 3729 dependencies)" · vitest 207 / 2,987 | `r3-gates-exit.log` · `r3-{typecheck,lint,lint-boundaries,format-check,build,test,assert-no-mocks}.log` |
| `pnpm test:e2e --reporter=line` (단독) | exit 0 — **767 passed (17.5m)** · `✘` 0 · flaky 0 (`retries: 0`) | `r3-e2e-full.log` |
| baseline 불변 | 실행 전·후 `git status --short e2e/__screenshots__` 동일 (`r3-baseline-status-before.txt`) · 전 PNG md5 전·후 동일 | — |
| QA 탐침 (`r3-probe*.spec.ts.txt`, dev 4319) | computed style · `getBoundingClientRect` 실측 9 화면 | `r3-probe.log` · `r3-*.png` |
| `r3-decomp.py` (numpy, 채널 Δ>5, 8-연결 gap 4 클러스터) | 추적 baseline 6장 HEAD ↔ 작업본 분해 | `r3-baseline-decomp.log` · `r3-decomp.py.txt` |
| grep (`S6-H` 변경 파일 7개) | HEX · `rgb()` · arbitrary px · `style={{` · `any` · `@ts-ignore` · `eslint-disable` · `console.` 0. `overflow` 3건은 `Text.css` 기존 truncate 규칙(신규 아님) | — |

### 11.3 `D6-10` 5건 직접 실측 (`r3-probe.log`)

| 항목 | Figma (H6-10.1 선언값) | 실측 (computed / rect) | 판정 |
|---|---|---|---|
| ① `VG6-G-07` Answer-card 행 라벨 weight | Semibold 590 | `.haru-radio-group--card` 라벨 **590** — 독서 루틴 5행(Step 1 edit · Step 1 display · 설정 아이 정보) · 설문 카드(온보딩 `reading-together` · 설정 재응답) · 발전 역량 4행(온보딩 · 설정) · Reading Context 시트 6행. **list 변형은 400 유지**(Step 1 Gender 시트 *Girl/Boy/Prefer not to say* = 400) — H6-10.2 "card 변형만" 과 일치 | **PASS** |
| ② `VG6-G-02` 언어 카드 radius | 30 | `.haru-language-card` border-radius **30px ×4 모서리** (3 화면) | **PASS** |
| ② `VG6-G-04` blur 없음 | BACKGROUND_BLUR 없음 | `backdrop-filter: none` · 카드 subtree 안 backdrop-filter 요소 **0** · bg `rgba(255,255,255,0.9)` · shadow = drop `0 6 4 /8%` + inset 2겹 (`--shadow-bubble`) | **PASS** |
| ③ `VG6-G-08` 섹션 라벨 | Bold 12 · tracking 0.72 · `#7d9291` | `.haru-text--tracking-section-label` 전부 **w700 · 12px · ls 0.72px · rgb(125,146,145)** — Step 1 YOUR CHILD · ABOUT YOU · AT HOME / 설정 아이 정보 2 / 가입 YOU · YOUR CHILD / 프로필(온보딩 · 설정) 3 / SettingsMenu YOUR CHILD · ACCOUNT. 독서 루틴 legend 도 700 · 12 · 0.72 · 같은 색 | **PASS** |
| ③ `VG6-G-09` 언어 카드 → 첫 행 | 53 | `firstRow.top − card.bottom` = **53** (Step 1 edit 848→901 · Step 1 display 526→579 · 설정 578→631). legend 높이 23 = offset 7 + 줄 16, 첫 행 = legend 아래 +10 | **PASS** |

잔존 `weight="semibold"` (`apps/web/src`, 테스트 제외) 10건은 전부 h1/버블/카드 제목 · 책 캡션 등 **섹션 라벨이 아닌** 역할 — `D6-10` ③ 범위 밖.

### 11.4 Findings · AC 재판정

| ID / AC | 2회차 | 3회차 | 근거 |
|---|---|---|---|
| `QA-6-002` / **AC-6-18** | PARTIAL (잔여 `VG6-G-02/04/07/08/09`) | **PASS — closed** | 잔여 5건 전부 Figma 선언값과 일치(§11.3) — 구조(`D6-9` ①) · G-1a 는 2회차 PASS 그대로이며 전체 suite(`settings-child.spec.ts` · `visual.spec.ts` Step 1 3장) 통과. 컴포넌트가 Step 1 과 동일함 = 같은 클래스 · 같은 computed 값(설정 ↔ Step 1) |
| `QA-6-005` / AC-6-46 SR | NOT VERIFIED | **NOT VERIFIED — accepted (`D6-10` ④)** | 사용자 항목별 수용 *"이 항목은 수용, Stage 8에서 확인"*. 판정 자체는 NOT VERIFIED 로 남기고 Verdict 계산에서 수용 처리 (`qa.md` §2). Stage 8 에서 §6 + §10.7 절차 실행 필요 |
| AC-6-29 (Step 1 회귀) · 46 (대비) · 47 · 48 · 49 · 50 | PASS | PASS | 전체 suite · gates · grep |

### 11.5 Regression · Baseline (`R-BASELINE-1`)

| 항목 | 결과 |
|---|---|
| 회귀 화면 (지시 4종) | 설문 카드(온보딩 · 재응답) · 발전 역량(온보딩 · 설정) · SettingsMenu · Reading Context 시트 — 탐침 실측(§11.3) + 해당 spec 전부 통과(`settings-survey` · `growth-capability` · `settings-growth` · `settings-child` · `session.spec.ts` s4 시트 · `visual.spec.ts`) |
| 재생성 30장 (H6-10.4) | 추적 baseline 수정 10 (`s2-onboarding-childinfo{,-trial,-edit}` · `s2-signup` · `s2-deck-capability` · `s2-deck-reading-together` · `s3-dialog-scrim` · `s3-sheet-scrim` · `v5-field` · `s4-reading-context-sheet`) + 미추적 Stage 6 디렉토리 5개(24장, 그중 20장이 S6-H 재작성분) |
| QA 분해 (HEAD 추적분 중 `S6-H` 만 바꾼 6장) | `v5-field` 6 클러스터 = x60 시작 글자 높이(13–15) 띠 6줄 = gallery card 라디오 라벨 · `s2-signup` 2 = *YOU*(w28) · *YOUR CHILD*(w83) 글리프 h11 · `s3-sheet-scrim` 2 = 같은 두 라벨(scrim 아래) · `s4-reading-context-sheet` 6 = x67 시트 행 라벨 6줄 · `s2-deck-capability` 7 = 행 라벨 5 + not-seen 행 2줄(줄바꿈 이동, `VG6-H-08`) · `s2-deck-reading-together` 9 = 2줄 라벨 4행 (첫 줄 x67–77 조각은 같은 줄 첫 단어 글리프가 단어 간격 >4px 로 따로 묶인 것 — x82–301 과 같은 y 361–375 띠). **크기 불변 · 행 기하 이동 0 · 설명 안 되는 클러스터 0** (`r3-baseline-decomp.log`) |
| `s2-onboarding-childinfo*` · `s3-dialog-scrim` | HEAD 대비 이미 Stage 6 앞 단위로도 바뀐 파일이라 S6-H 분만 떼어 분해할 수 없음 — H6-10.4 항목별 토글 분해(G-07/08/09/02 모서리 4) 서술과 현재 이미지 · 탐침 수치(53 · radius 30 · label 700) 일치 확인 |
| 미추적 20장 | 재생성 전 이미지가 저장소에 없음(1·2회차와 같은 한계) — 육안 표본 `s6-settings-child.png`: dev 패널 없음 · 정착 프레임 · 행 라벨 semibold · 언어 카드 radius 30 |
| `v2-material` | `git status` 미변경 (HEAD 판) — **untouched** 확인 |
| 실행이 baseline 을 썼는가 | 아니오 — status · md5 전·후 동일 |

### 11.6 사용자 결정 대기 (QA 가 수용으로 바꾸지 않음)

| 항목 | 내용 | Verdict 영향 | 근거 |
|---|---|---|---|
| `VG6-H-09` (Low) | 다른 섹션 라벨 행 기하 — AT HOME 48 (Δ−5) · ABOUT YOU 44 (Δ−9) · YOUR CHILD 편집 아이콘 헤더 Δ+13 vs Figma 53/34 행. 선택지 A(권고)/B/C (Visual Gap §S6-H 1.1) | **비차단** | ① `D6-10` 범위 밖 — ③ 은 독서 루틴 53 만 정했다. ② 이 기하(`gap-2`/`gap-3`, 라벨 행 패딩 없음)는 **HEAD(Stage 5 커밋) `ChildInfoStep.tsx` L177·311·329 에 이미 있다** — Stage 2 부터의 레이아웃이며 Stage 6 이 만든 것이 아니다. ③ AC-6-18 의 기준은 "컴포넌트 = Step 1 과 동일(Figma `248:1159` **입력** 실측 기준)" — 설정 화면은 Step 1 과 같은 컴포넌트 · 같은 값(탐침)으로 충족. 설정 아이 정보 화면 자체는 Figma 프레임 없음(`C13-S6-2`). ④ 1·2회차도 이 기하를 AC-6-18 잔여로 세지 않았다(2회차 잔여 = 5건). 따라서 `qa.md` §2 상 PARTIAL/NOT VERIFIED 를 만드는 In Scope AC 가 없다. **단** 최우선 규칙 6 에 따라 허용 차이 등록은 사용자 승인 후이므로 "허용 차이"로 기록하지 않았다 — 결정 전까지 **미결 Figma 차이**로 추적하며 Stage 8 Final QA 전에 닫아야 한다. (사용자가 AC-6-18 을 `248:1159` 섹션 리듬 전체로 읽기로 하면 AC-6-18 은 PARTIAL 로 돌아가고 Verdict 는 `INCOMPLETE` 가 된다) |
| `VG6-H-06` | `Text` 에 `tracking?: 'section-label'` Shared UI API 추가 — design-agent 수용 권고(조건 3) | 비차단 | Shared UI API 변경은 사용자 확인 권장 항목. 도메인 import 없음 · lint:boundaries ✔ · 기본값 변화 0(단위) — 구조 규칙 위반 없음 |
| `VG6-H-10` | `DESIGN_TOKEN_MAP.md` "6단계" 표기 4곳 잔존 | 비차단 | 문서 사실 정정(design-agent 후속) |
| `VG6-H-08` · H6-9.10 `v2-material` 드리프트 | consequence 기록 / 임계 미만 | 비차단 | 2회차 §10.8 그대로 |

### 11.7 BACKEND_INTEGRATION_PENDING

신규 0 (H6-10.7). `P6-BIP-01`~`13` 은 §7 · §10.5 그대로 — 서버 생성 버블 문장의 현재 아이 이름 메모는 아직 Plan §10 미반영(plan-agent 등록 대상, Stage 8 전 1:1 추적).

### 11.8 남은 조치

- `QA-6-005`: Stage 8 접근성 점검에서 §6 + §10.7 수동 절차 실행 (수용 조건)
- `VG6-H-09`: 사용자 결정 (A / B / C) — Stage 8 Final QA 전
- `VG6-H-06`: `Text tracking` prop 수용 여부 사용자 확인
- 가값(FAIL 사유 아님): `P-30` · `P-31` · `P-32` · `P-33` (`P-34` 미등록 — `QA-6-004` 해소)
