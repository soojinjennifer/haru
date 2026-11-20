# Stage 7 QA Report

Status: **QA 1회차 (stage-qa-agent, 2026-11-20)**. Product Code 수정 0, 커밋 0. 쓰기 경로는 `docs/qa/stage-7-qa-report.md` 와 `docs/qa/evidence/stage-7/**` 뿐이다.

## 1. Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **`FAIL`** — `FAIL` 1건 (AC-7-72, `QA-7-001` Low, 테스트 레이어 baseline). FAIL 이 해소되어도 `NOT VERIFIED` 3건(`QA-7-002`~`004`)이 남아 있어 그 상태로는 `INCOMPLETE` 이다 |
| 대상 | 커밋되지 않은 작업 트리 (HEAD `a39d7ff` + Stage 7 변경 145 경로). 범위는 S7-A ~ S7-F, H7-7(`D7-6`), H7-8(`D7-7`) |
| 기준 | `docs/plans/stage-7-plan.md` rev 2 (AC-7-01~84, `P7-BIP-01`~`16`) · `docs/design/stage-7-design-spec.md` (개정 ①~㉚) · `docs/decisions/stage-7-approvals.md` (`D7-1`~`D7-7`, 허용 차이 15건) · `docs/qa/stage-7-handoff.md` H7-1~H7-8 (주장으로만 취급) · `docs/design/stage-7-visual-gap.md` |
| AC 집계 (84개 AC, AC-7-49 를 2줄로 나눠 85줄) | `PASS` 77 · `FAIL` 1 (72) · `PARTIAL` 0 · `NOT VERIFIED` 3 (49b · 62 · 68) · `BACKEND_INTEGRATION_PENDING` 4 (36 · 48 · 55 · 63) |
| Findings | `QA-7-001` Low (FAIL) · `QA-7-002` · `QA-7-003` · `QA-7-004` (NOT VERIFIED) |
| 개발 측 주장 재현 | 단위 테스트 **230 files / 3,382 tests**, 전체 Playwright **890 passed / 0 failed (20.5m, 단독 실행, retries 0)** — H7-8.4 주장을 재현했다. 시간 초과 0건이므로 단독 재실행 대상이 없다 |

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (Darwin 25.5.0) |
| Node / pnpm | v24.21.0 / pnpm 12.4.2 |
| 브라우저 | Playwright 1.63.0 Chromium. 설정: 393×852 · DPR 1 · `reducedMotion: reduce` · UTC · en-US · workers 1 · retries 0 |
| 실기기 | 없음 (iOS Safari, VoiceOver 검증 불가) |
| Figma | 로컬 Dev Mode MCP `127.0.0.1:3845/mcp` 는 initialize 에 200 으로 응답했지만 `get_screenshot(31:102)` 가 **"No Figma window open"** 을 돌려줘 라이브 조회를 하지 못했다. Figma 쪽 이미지는 design-agent 가 같은 세션 scratchpad 에 남긴 `get_screenshot` 결과(`31-102.png`, 393×1105)를 썼고, QA 가 이를 구현 baseline 과 직접 나란히 놓고 비교했다(`evidence/stage-7/qa-figma-vs-impl-31-102.png`). 그 밖의 Figma 수치는 Visual Gap 문서의 증거를 인용했으며 [VG] 로 표시한다 |
| Mock | URL `?scenario=<group>:<key>` · 요청 로그 `__HARU_MOCK_REQUEST_LOG__` (dev 전용) |
| QA 탐침 | `evidence/stage-7/probe/qa.config.ts.txt` · `qa-s7.spec.ts.txt` (실행 뒤 `.txt` 로 보관). 저장소 helper `e2e/support/*` 를 재사용했고 포트는 4319 |
| Playwright 단독 실행 | 시작 전 `pgrep -fl playwright` 에서 Playwright 프로세스 0개를 확인했다 (다른 프로젝트의 `find -name playwright*` 셸만 잡혔고 실행 중인 테스트는 아님). 전체 suite 와 QA 탐침은 순서대로 실행했다 |

## 3. Commands Executed

| 명령 | 결과 | 로그 (`docs/qa/evidence/stage-7/`) |
|---|---|---|
| `ls apps/api apps/mobile supabase` | 셋 다 No such file · `apps/` = `web` | — |
| `pnpm install --frozen-lockfile` | exit 0 — Lockfile is up to date | `cmd-install.log` |
| `pnpm typecheck` | exit 0 | `cmd-typecheck.log` |
| `pnpm lint` | exit 0 | `cmd-lint.log` |
| `pnpm lint:boundaries` | exit 0 — no dependency violations (1053 modules, 4250 dependencies) | `cmd-lint_boundaries.log` |
| `pnpm build` (test 전에 실행) | exit 0 (청크 크기 경고만, 기존과 같음) | `cmd-build.log` |
| `pnpm test` | exit 0 — 230 files / 3,382 tests | `cmd-test.log` |
| `pnpm format:check` | exit 0 | `cmd-format_check.log` |
| `pnpm assert:no-mocks` | exit 0 — MOCK/DEV sentinel 0 · `haru-dev-` 0 · sharp 0 | `cmd-assert_no-mocks.log` |
| `pnpm test:e2e` (단독, 비교 모드) | exit 0 — **890 passed (20.5m)**, 실패·flaky·시간 초과 0 | `e2e-full.log` |
| QA 탐침 (`-c probe/qa.config.ts`) | 12 passed (16.1s) | `qa-probe.log` |
| grep 스캔 (HEX · rgb · arbitrary · inline style · px · overflow · mocks import · console · storage · any/ts-ignore · fixture 문자열 · secret · VITE_* · 제3자 SDK · 금칙어 · email · aria-expanded · feature 간 import · page 의 API · 중복 타입) | 아래 §4 해당 AC | `grep-scan.log` |
| dist 에서 secret 과 mock 미디어 문자열 grep | 0 · 0 | — |
| `git diff --stat HEAD -- e2e/__screenshots__` | 추적 중인 baseline 변경은 `visual.spec.ts` 5장뿐이다 (`s3-library` · `-empty` · `-favorites-empty` · `v1-button` · `v2-material`) | — |

## 4. Requirement Matrix

증거 표기: **[e2e]** = QA 가 전체 단독 실행에서 통과를 확인한 테스트 · **[unit]** = QA 가 `pnpm test` 로 통과를 확인한 테스트 · **[grep]** = `grep-scan.log` · **[probe]** = QA 탐침 · **[VG]** = Visual Gap 문서의 증거를 인용한 것 (QA 가 직접 실행하지 않음).

### 4.1 Scope · Gate

| AC | 판정 | 증거 |
|---|---|---|
| 01 | PASS | `apps/api`, `supabase`, `apps/mobile` 이 없다. 새로 생긴 145 경로 가운데 Backend 런타임 코드 0 |
| 02 | PASS | 이메일 문구 0 ([grep] 결과는 주석뿐) · 달력·streak·% 0 · 업그레이드, 데이터 관리, 세션 목록 route 0 (`routes.ts` 에는 `progress` 와 `progressReport` 만 있다) |
| 03 | PASS | `progress-copy.ts` 삭제됨 · 준비 안내 문구 0 · [unit] `progress-overview.test.tsx:58` |

### 4.2 Contracts

| AC | 판정 | 증거 |
|---|---|---|
| 04 | PASS | [unit] `packages/contracts/src/__tests__/stage-7.test.ts:139~210` — days 개수, 역량 중복, level 범위, 필수 key 8개 각각 누락 시 거부 |
| 05 | PASS | [unit] `:212` |
| 06 | PASS | [unit] `:223~263` |
| 07 | PASS | [unit] `:265~278` |
| 08 | PASS | [unit] `:280~370` — trigger 는 3값만 받고 누락은 거부. [grep] 새 `z.enum` 은 C7-6 PDF status 와 C7-8 reason 뿐이며 trigger 용 신규 enum 은 없다 |
| 09 | PASS | [unit] `:398~426` |
| 10 | PASS | [unit] `:372~396` |
| 11 | PASS | [unit] `:429~470` — 27/28일 경계 · 윤년 · 연 넘김 |
| 12 | PASS | [unit] `:472` error code 29종 유지 · 앱 안에서 타입을 다시 선언한 곳 0 · `any`/`@ts-ignore` 0 |
| 13 | PASS | `API_CONTRACTS.md` Rev 11과 11.1. endpoint 8개가 Http adapter, Mock 과 일치한다 · `G-01` Resolved · `G-11` 채택 안 함 |

### 4.3 Mock

| AC | 판정 | 증거 |
|---|---|---|
| 14 | PASS | [unit] `apps/web/src/mocks/__tests__/stage7-reports.test.ts` — 4그룹의 모든 key |
| 15 | PASS | [unit] `:245` |
| 16 | PASS | [unit] `:377` · `:527` |
| 17 | PASS | [unit] `:692` PDF · `:705` WAV · `mocks/` 안에 TS 가 아닌 파일 0 · `assert:no-mocks` 통과 · dist 0 |
| 18 | PASS | [grep] `src/mocks`, `dev`, `test` 밖에서 mocks 를 import 하는 곳 0. 화면 코드에 나오는 fixture 문자열은 주석이나 Figma 원문 예시뿐 |
| 19 | PASS | [unit] `:721` 결정성 · StrictMode 확인 (`report-detail.test.tsx:311`, `report-pdf.test.tsx:216`) |

### 4.4 Progress 탭

| AC | 판정 | 증거 |
|---|---|---|
| 20 | PASS | [e2e] `progress.spec.ts` ① 기하 + baseline `s7-progress-frame`. QA 의 나란히 비교 결과, 구현은 Figma 에서 상태바 66px 을 뺀 배치이고 차이가 나는 곳은 `AD7-1`·`2`·`6`·`7`·`12`·`16` 뿐이다. 모두 등록된 허용 차이이며 등록되지 않은 차이는 0이다. 정합 수치는 [VG] `VG7-R-02` |
| 21 | PASS | [unit] `5` · `62m` |
| 22 | PASS | [unit] `weeklyView.test.ts` · `barChartLayout.test.ts` · [e2e] 트랙 62 · listitem 7개. [probe] SR 이름 *Monday, 8 minutes* / *Wednesday, no storytime* 확인 |
| 23 | PASS | [grep] [unit] `stage3-copy-language.test.tsx` · [probe] 렌더된 텍스트가 *6 nights · avg 12 min* |
| 24 | PASS | [unit] `:95` · [e2e] ③ · [probe] `main` 안 `[aria-expanded]` 0 |
| 25 | PASS | [unit] · [e2e] 4색 토큰 |
| 26 | PASS | [unit] `:58` · `:108` |
| 27 | PASS | [unit] `:142` · `:170` · [e2e] ⑥ |
| 28 | PASS | [unit] `:108` · [e2e] `s7-progress-empty-week` |
| 29 | PASS | [unit] `:118~140` · [e2e] `s7-progress-error` |

### 4.5 4주 리포트 카드

| AC | 판정 | 증거 |
|---|---|---|
| 30 | PASS | [unit] `resolveReportCardView.test.ts` 10칸 전부 + `published` 방어. 코드를 직접 읽어 입력이 응답 값뿐임을 확인했다 · [unit] 시나리오 7종 |
| 31 | PASS | [unit] `:102` · [e2e] · [probe] `/progress` success 화면에서 progressbar 0, aria-valuenow 0 |
| 32 | PASS | [unit] · [probe] *Next report on Jun 7* · email 0 |
| 33 | PASS | [unit] · [e2e] 링크 1개 · 이름 · 중첩 인터랙티브 0 (axe 가 저장소에 없어 DOM 으로 검사함) · hit 44 이상 |
| 34 | PASS | [unit] 5개 시나리오 · [e2e] `s7-past-reports` |
| 35 | PASS | [unit] `stage7-reports.test.ts:437` |
| 36 | BACKEND_INTEGRATION_PENDING | `P7-BIP-04` · `05` |

### 4.6 리포트 상세

| AC | 판정 | 증거 |
|---|---|---|
| 37 | PASS | [unit] `report-detail.test.tsx:74` · [e2e] `report-detail.spec.ts:134` |
| 38 | PASS | [unit] `:109` · `:293` |
| 39 | PASS | [unit] `:127` |
| 40 | PASS | [unit] `:141` · `:285` · [probe] *From your answers* 렌더 확인 |
| 41 | PASS | [unit] `:171` |
| 42 | PASS | [unit] `:192` |
| 43 | PASS | [unit] `:207` · `lint:boundaries` |
| 44 | PASS | [unit] `:302` · `:311` · [e2e] `:112` · `:126` (Mock 요청 로그) |
| 45 | PASS | [unit] `:342~399` · [e2e] C13-S7-9 baseline 3장 |
| 46 | PASS | **사용자가 바꾼 동작 기준으로 판정했다** (`D7-6` ⑨: 로그인 후 원래 경로로 복귀, `D7-7`: 그 상세에서 Back 은 `/progress`). [e2e] `:74` 미인증 deep link → Welcome → Log in → 상세 → Back = `/progress`, 브라우저 뒤로 가기로 상세에 돌아오지 않음 · `:67` · `:52` · `:103`. [unit] `return-path.test.ts` (위험한 경로 14종 거절) · `login-return-path.test.tsx` · `resolveGuardDecision.test.ts`. push 발송은 `P7-BIP-12` |
| 47 | PASS | 코드를 직접 읽음 — 화면에 나오는 문구는 응답 값과 copy 모듈뿐이고, 가공은 포맷에 그친다 |
| 48 | BACKEND_INTEGRATION_PENDING | `P7-BIP-06` · `07` |

### 4.7 하이라이트 클립

| AC | 판정 | 증거 |
|---|---|---|
| 49a 컨트롤 · 길이 · 라벨 · `preload=none` · 진행 표시 갱신 | PASS | [unit] `clipPlayerState.test.ts` · `highlight-clip-player.test.tsx` · [e2e] `highlight-clip.spec.ts:82~95` — seek 로 실제 `timeupdate` 를 일으켜 진행 표시 갱신을 확인 |
| 49b 재생 중 진행 표시가 실시간으로 증가 | NOT VERIFIED | headless 에서는 재생 시계가 0.064s 에서 멈춘다 → `QA-7-003` |
| 50 | PASS | [e2e] `:122` · [unit] `clipPlayerState.test.ts:96` |
| 51 | PASS | [e2e] `clip-url-expired` · [unit] |
| 52 | PASS | [e2e] |
| 53 | PASS | [e2e] `:195` · `:213` · `:225` |
| 54 | PASS | [e2e] `:247` hit 44 · 버튼 이름 |
| 55 | BACKEND_INTEGRATION_PENDING | `P7-BIP-10` |

### 4.8 PDF

| AC | 판정 | 증거 |
|---|---|---|
| 56 | PASS | [e2e] `report-pdf.spec.ts` ① — ready 가 되어도 download 0, Save 를 누르면 download 1, 파일이 `%PDF-` 로 시작 · [unit] |
| 57 | PASS | [unit] `report-pdf.test.tsx:216` · [e2e] `:105` POST 1회 |
| 58 | PASS | [e2e] failed · timeout(`page.clock`) · offline |
| 59 | PASS | [unit] `web-file-share.test.ts` · 코드를 직접 읽어 save/share 앞에 `await` 가 없음을 확인 · [e2e] cancelled · unsupported. **`D7-6` ⑦(F-03 ⓐ 세로 쌓기)과 ⑧(F-06 ⓐ 제목 *HARU 4-week report*)이 바꾼 Spec 문구 기준으로 판정했다** |
| 60 | PASS | [unit] `revokeObjectURL` · `report-pdf.test.tsx:408` · [grep] |
| 61 | PASS | [e2e] `:105` |
| 62 | NOT VERIFIED | iOS Safari 공유 시트 · 저장 + `VG7-E-10` 첫 탭 오디오 → `QA-7-002` |
| 63 | BACKEND_INTEGRATION_PENDING | `P7-BIP-09` |

### 4.9 Privacy · Copy · 접근성 · 아키텍처 · 회귀

| AC | 판정 | 증거 |
|---|---|---|
| 64 | PASS | [e2e] 콘솔과 pageerror 를 수집하는 테스트 4종 · [grep] 새 코드의 `console` 호출 0 |
| 65 | PASS | [unit] `report-pdf.test.tsx:420` · `highlight-clip-player.test.tsx:490` · `useSignOut.ts:80` `queryClient.clear()` |
| 66 | PASS | [grep] · [unit] |
| 67 | PASS | 포커스, 접근성 이름, 터치 44 는 [e2e]. 대비는 가값 `P-35`~`P-37` 과 수용 예외 `D-01` 범위이며 FAIL 사유가 아니다 ([VG] `VG7-F-12`). PDF role 은 Spec 정정 ㉔(timeout · offline = `status`)와 e2e 단정이 일치한다 |
| 68 | NOT VERIFIED | VoiceOver → `QA-7-004` |
| 69 | PASS | `lint:boundaries` · [grep] feature 간 import 0 · page 에서 API 호출 0 |
| 70 | PASS | [grep] HEX 는 주석에만 있다 · arbitrary 값 0 · inline style 은 `BarChart` 의 데이터 CSS 변수 1곳으로, 기존 `ProgressBar` 와 같은 패턴이다 · **새 `overflow` 0** (사용자가 지정한 기대값 — Plan 의 "1건"이 아니다) · `R-SHADOW-1` 은 [e2e] + §4.11 |
| 71 | PASS | [e2e] `progress.spec.ts` ⑤ · `report-detail.spec.ts:309` · [probe] 상세 320 에서 가로 스크롤 0, 넘치는 요소 0 |
| 72 | **FAIL** | `QA-7-001`. `R-BASELINE-1` 의 settle, Scenario Panel 가림, 재생성 전 분해 조건은 충족했다 |
| 73 | PASS | 게이트 6종 + `assert:no-mocks` + e2e 890/0. Stage 2·4·5·6 baseline 은 HEAD 와 바이트 단위로 같고 비교 모드도 통과했다. `--update-snapshots=all` 은 QA 의 쓰기 권한 밖이라 실행하지 않았다 (dev 가 H7-2.6 에서 실행, 분해는 H7-7.4 · [VG] `VG7-R-07`) |
| 74 | PASS | §7 = `P7-BIP-01`~`16` 과 1:1 |

### 4.10 rev 2 신설

| AC | 판정 | 증거 |
|---|---|---|
| 75 | PASS | `entities/reflection/copy.ts` 를 두 feature 가 import 한다 · 라벨을 다시 정의한 곳 0 · `lint:boundaries` · Stage 5 baseline 바이트 동일 |
| 76 | PASS | **판별 시나리오는 `report-no-previous`** (H7-3.3). [unit] `progress-overview.test.tsx:203` 에서 40%, `success` 는 100% · [e2e] `s7-report-card-no-previous` |
| 77 | PASS | [e2e] ② computed 값 |
| 78 | PASS | [e2e] ① (24,4) 347×422 · `alt=""` · `aria-hidden`. **새 `overflow` 0** (크롭은 에셋에 미리 적용 — 사용자 지정 기대값) |
| 79 | PASS | [e2e] ④ |
| 80 | PASS | [e2e] ② · [grep] |
| 81 | PASS | Stage 6 baseline 바이트 동일 · [unit] `BarChart.test.tsx` · `persona-card.test.tsx` |
| 82 | PASS | [unit] `stage7-reports.test.ts:390` · `:420` |
| 83 | PASS | [e2e] · [probe] `/progress` 와 상세 320 모두 11px 미만 글자 0 |
| 84 | PASS | 사용자 승인(`D7-6` ⑪) 뒤에 15건을 등록했다. approvals §2 와 Visual Gap 최종표를 `diff` 한 결과 **동일**하다 · `AD7-14` 결번 |

### 4.11 Visual Gap 에서 넘어온 확인 항목

| 항목 | 결과 |
|---|---|
| `VG7-F-09` 상세 393 PDF 버튼 오른쪽 Δ50 | **Δ50 은 재현되지 않았다.** [probe] 3회 실행 결과가 모두 같았다 (결정적). 상세 393 오른쪽 +1/+2/+3/+5/+8/+12/+20px = **20 · 43 · 46 · 40 · 34 · 26 · 21**. 최댓값은 +3px 의 **46** 으로, 이론 상한 45 보다 1 크다. 같은 방식으로 잰 320/600 의 최댓값은 25 이고, 393 이 전 구간에서 더 높은 이유는 밝히지 못했다. 그림자 존재 단정(> 0)은 충족하고 클리핑도 없어 결함이 아니므로 기록만 한다 |
| 상세 393 최대 스크롤에서 하단 그림자 | [probe] 스크롤 컨테이너 바닥 = 뷰포트 바닥(852) · 마지막 버튼 아래 끝 808 (여백 44, padding 0). 버튼 아래 +2/+6/+10/+20/+30/+40px = Δ 47 · 64 · 52 · 40 · 25 · 16 이므로 번짐이 화면 아래 끝(852)에서 잘린다. 잘리는 선이 **화면 가장자리**와 겹치므로 `R-SHADOW-1` ④ 에 따라 보이지 않는다 (`qa-detail-393-maxscroll.png`). 결함 아님 |
| `VG7-F-11` gallery 내비 ↔ `v1-button` | **재현됨** → `QA-7-001` (`qa-v1-button-top.png` ↔ `qa-v1-button-top-HEAD.png`) |
| `v2-material` 스테일 (따로 기록) | 마지막 커밋이 `9f759bb` (**2026-10-27**)이다. S7-B 의 `=all` 재생성에서 드러난 49px (모서리 AA 6 클러스터, 최대 Δ4)은 10-27 이후 쌓인 스테일이고(HEAD 렌더 ↔ HEAD baseline 98px), **S7-B 몫은 0** 이다 ([VG] `VG7-B-07` · H7-2.6). QA 는 토글을 다시 실행하지 않았다 |

## 5. Findings

```
QA-7-001 | Severity: Low
Requirement: AC-7-72 (R-BASELINE-1 ② — dev 전용 UI 를 baseline 에 담지 않는다)
Steps to reproduce:
  1. e2e/__screenshots__/darwin/visual.spec.ts/v1-button.png (작업본, 361×744) 의 위쪽 140px 을 본다
  2. git show HEAD:…/v1-button.png (361×698) 의 같은 영역과 비교한다
Expected: gallery 의 sticky 칩 내비가 촬영 대상(첫 버튼 행)을 가리지 않는다. 테스트 레이어에서 visibility: hidden 으로 가린다
Actual: 칩 내비(y0~44)가 *Start session* md/lg 행의 위 절반을 덮은 채 baseline 으로 굳었다 (HEAD 에서는 겹침 5px).
        첫 버튼 행 위쪽은 회귀 감시가 되지 않는다. 원인은 S7-F ButtonGroup 으로 섹션이 46px 길어지면서 바뀐 스크롤 위치다 (VG7-F-04 ②)
Evidence: docs/qa/evidence/stage-7/qa-v1-button-top.png · qa-v1-button-top-HEAD.png
Suspected area: e2e/visual.spec.ts 의 gallery 공용 촬영 · e2e/support/gallery.ts (hideDevPanel 은 Scenario Panel 만 가린다). 제품 코드 영향 0
```

`QA-7-002` (NOT VERIFIED) AC-7-62 + `VG7-E-10` · `QA-7-003` (NOT VERIFIED) AC-7-49b · `QA-7-004` (NOT VERIFIED) AC-7-68 — 절차는 §6.

### 5.1 Stage 6 이월 — 기록만 하고 Stage 7 에서 판정하지 않음

| ID | 내용 | 상태 |
|---|---|---|
| `VG6-H-09` (Low) | 섹션 라벨 행 기하 Δ−5 / −9 / +13 | 사용자 결정 대기 (Stage 8 전) |
| `VG6-H-06` | `Text tracking` prop 을 Shared UI API 로 둘지 | 사용자 확인 대기 |
| `VG6-D-12` | 직접 링크로 들어왔을 때 settings Back = `navigate(-1)` | Stage 8 에서 추적. Stage 7 상세는 `N7-23` · `D7-7` 의 임시 규칙을 쓴다 |
| `QA-6-005` | 스크린리더 | `PASS (accepted)`, Stage 8 에서 확인. `QA-7-004` 와 같은 수동 세션에서 처리하기를 권고한다 |

## 6. NOT VERIFIED 수동 절차

**`QA-7-002` (AC-7-62, iOS Safari)** — Mock 데모를 HTTPS 로 연다. iOS Safari 최신, 음소거 스위치는 해제한다. ① Log in (`sam@example.com` / `sunny-evening-8`) → Progress → *Download PDF* → ready 가 되어도 자동 다운로드가 없는지 본다. ② *Share* → 공유 시트가 뜨는지, 제목이 *HARU 4-week report* 이고 PDF 가 1개인지 본다. 취소하면 오류 문구 없이 ready 상태가 유지되는지 본다. ③ *Save PDF* → 저장 또는 미리보기가 열리고 파일명이 `haru-4-week-report-….pdf` 인지 본다. ④ 공유를 지원하지 않는 환경에서는 *Save PDF* 하나만 보이는지 본다. ⑤ (`VG7-E-10`, H7-7.7) 클립을 하나도 재생하지 않은 상태에서 상세 ⑥ 클립 1을 **처음 탭**했을 때 오류 없이 재생되는지 본다. 다른 앱 음악을 재생 중일 때 그 소리가 끊기는지 기록한다. 클립 2를 탭하면 클립 1이 멈추는지, 홈 화면에 갔다가 돌아와 다시 탭해도 재생되는지 본다. 실패하면 두 번째 탭에서 재생되는지 기록한다.

**`QA-7-003` (AC-7-49b)** — headed Chrome 과 Safari 로 상세 ⑥ 클립을 재생한다. 시간이 1초 단위로 늘고 막대가 길어지는지, 12초에 끝나면 ▶ 로 돌아오는지, reduced-motion 에서는 애니메이션 없이 값만 바뀌는지 본다.

**`QA-7-004` (AC-7-68, VoiceOver)** — `/progress` 에서 막대가 *"Monday, 8 minutes"* 처럼 읽히는지, 리포트 카드와 Growth 막대에서 퍼센트를 읽지 않는지, 헤더 링크 이름이 맞는지 본다. 상세에서 다이아몬드 대체 텍스트에 숫자와 판정 표현이 없는지, `{n}×` 가 *"n times"* 로 읽히는지, *"Play clip: …"* 과 *"0:04 of 0:12"* 가 읽히는지, *"Your PDF is ready."* 가 한 번만 나오는지 본다.

## 7. BACKEND_INTEGRATION_PENDING

Frontend 부분은 §4 에서 따로 판정했다. Stage 8 Handoff 문서는 아직 없다 (Stage 8 plan-agent 가 초안을 만들 대상). 현재 등록 위치는 Plan §10, `API_CONTRACTS.md` Rev 11 / 11.1 (§4 Stage 7, 1144·1146행), 그리고 이 표다. BH = `BACKEND_HANDOFF` · DR = `DATA_REQUIREMENTS` · AR = `AUTH_REQUIREMENTS` · AP = `ANALYSIS_PIPELINE_REQUIREMENTS`.

| BIP | 항목 | 대기 사유 | Handoff | AC |
|---|---|---|---|---|
| 01 | 주간 집계 · 주 경계 · `availableWeeks` 연속 범위 · Home 과 같은 기간 창 | 서버 집계 | BH · DR | 21 · 27 |
| 02 | Growth stage / level 산식 | 서버 판정 | AP | 25 |
| 03 | Moment 선정 · 마스킹 · 안전 검증 | AI | AP | 26 |
| 04 | 주기 · eligibility · `cycle_in_progress` 결합 (Mock 의 해석은 H7-1.6 ②) | 서버 판정 | AP · BH · DR | 36 |
| 05 | 이월 + 독려 push | push | BH | 36 |
| 06 | 생성 · 안전 필터 · 재시도 · `delayed` | AI · Job | AP · BH | 48 |
| 07 | 발행 스냅샷 불변 | DB | DR · BH | 48 |
| 08 | `progressRatio` · `nextReportDate` 산식 | 서버 | BH | 31 · 76 |
| 09 | PDF 렌더 · signed URL · fileName · 60s 이내 · 멱등 | 렌더 · Storage | BH · DR | 63 |
| 10 | 클립 Storage · 보관 기간 (`OAQ-13`) · cascade 삭제 | Storage · 법무 | BH · DR | 55 |
| 11 | `viewed` 최초 시각 · 멱등 | DB | DR | 44 |
| 12 | push `report_published` · payload 는 reportId 만 | push | BH | 46 |
| 13 | 소유권 · RLS · 전체 삭제 | 권한 | AR · DR | 전반 |
| 14 | 서버가 새로 만드는 문장은 그 시점의 아이 이름을 쓴다 | AI | BH · AP | — |
| 15 | `ReportOverview` 필드 의미 (C7-2a) | 서버 | BH · DR | 30 · 76 · 82 |
| 16 | `personaHistory[].trigger` 동결 | DB | BH · DR | 40 |

메모 (새 BIP ID 아님, Stage 8 AR 에 기록할 것): 로그인 복귀 경로를 탭 메모리에 저장하므로 전체 페이지를 이동하는 OAuth 에서는 사라진다 (H7-7.6 ④). 서버 리다이렉트 허용 목록은 `toSafeReturnPath` 규칙과 맞춰야 한다.

## 8. Regression · Baseline

- 전체 suite 890 passed / 0 failed (Stage 1~7 e2e 를 모두 포함하며 classic-scrollbar 프로젝트도 들어 있다) · 단위 3,382 passed.
- Stage 7 에서 바뀐 추적 baseline 은 `s3-library` 3장(`D7-6` ③ TopBar, H7-7.4 에서 shift 잔차 0), `v1-button`(S7-F, `QA-7-001` 겹침), `v2-material`(10-27 스테일)이다. Stage 2·4·5·6 baseline 은 바이트 단위로 같다.
- 남은 가값 (FAIL 사유 아님): Stage 7 신규 `P-35`~`P-40` (`P-39` 에 PDF ⑦ 간격 20 포함). 기존 `P-01`~`P-17`, `P-23`~`P-25`, `P-30`~`P-33`. F-05 대비 2.71 은 `P-01` 값 목록에 기록할 대상이다.

## 9. 재검증 이력

| 회차 | 일시 | Verdict | 내용 |
|---|---|---|---|
| 1 | 2026-11-20 | `FAIL` | `QA-7-001` (AC-7-72) · NOT VERIFIED 3건 (`QA-7-002`~`004`) · e2e 890/0 · unit 3,382 · 탐침 12/12 |

## 재검증 (2차)

stage-qa-agent, 2026-11-20. 1회차 본문(§1~§9)은 고치지 않았다. 대상은 H7-9(`QA-7-001` 수정)이며 handoff 서술은 주장으로만 취급했다. Product Code 수정 0, 커밋 0. 증거는 `docs/qa/evidence/stage-7/r2/` 에 있다.

### R2.1 Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **`INCOMPLETE`** — `FAIL` 0, `NOT VERIFIED` 3 (`QA-7-002`~`004`). 다음 Stage 로 가려면 사용자가 이 3건을 항목별로 수용해야 한다 |
| AC 집계 (85줄) | `PASS` **78** (72 가 FAIL 에서 PASS 로 바뀜) · `FAIL` 0 · `PARTIAL` 0 · `NOT VERIFIED` 3 (49b · 62 · 68) · `BACKEND_INTEGRATION_PENDING` 4 (36 · 48 · 55 · 63) |
| Findings 변화 | `QA-7-001` FAIL 에서 **해소**로 바뀜 · `QA-7-002`~`004` NOT VERIFIED 유지 · **`QA-7-005` 신규** (Low, 관찰 기록이며 AC 판정에는 영향 없음 — R2.5) |

### R2.2 변경 범위 확인

| 확인 | 결과 |
|---|---|
| 1회차 리포트(11:25:48) 이후 바뀐 파일 | `find -newer` 결과: `e2e/visual.spec.ts` · `e2e/support/gallery.ts` · baseline 8장(mtime 기준. 이 중 `git status` 에서 M 인 것은 `v1-button` · `v5-field` · `v9-spinner-skeleton` · `v9-state-cards` 4장이고, 나머지 4장 `s2-textlink` · `v4-tag-chip` · `v9-icon-button` · `s3-library-shelf-sheet` 은 HEAD 와 **바이트가 같다** — `cmp` 로 확인. `=all` 로 썼다가 되돌렸다는 H7-9.4 주장과 맞는다) · 문서 2개. **`apps/**` · `packages/**` 에서 바뀐 파일은 0개다** → `QA-7-001` 때문에 Product Code 가 바뀌지 않았다 |
| `e2e/library.spec.ts` diff | mtime 08:47 로 1회차 QA 전이다. 내용은 TopBar trailing 오른쪽 끝 x369 · 2열 단정이고 제목이 `VG7-C-04` ⓐ · `D7-6` ③ 이다 → **`D7-6` (C-04) 몫이며 이번 수정과 무관하다**. 1회차 e2e 에서 이미 통과했다 |
| diff 내용 | `hideGalleryNav` = `addInitScript` 로 `.haru-dev-nav { visibility: hidden !important }` 를 주입한다 (`display: none` 이 아니므로 R-BASELINE-1 §3 을 따른다). `gotoGallerySection` 을 visual.spec 의 gallery 영역 클립 4개 블록에 적용했다. `frame-*` 에는 적용하지 않았다 |
| Scope | `apps/` = `web` · `apps/api` · `apps/mobile` · `supabase` 없음 |

### R2.3 Commands Executed

| 명령 | 결과 | 로그 (`r2/`) |
|---|---|---|
| `pnpm typecheck` · `lint` · `lint:boundaries` · `build` (순서대로) | 전부 exit 0. boundaries: no dependency violations (1053 modules, 4250 deps) | `cmd-*.log` · `gates-summary.log` |
| `pnpm test` (build 다음) | exit 0 — **230 files / 3,382 tests** | `cmd-test.log` |
| `pnpm format:check` · `assert:no-mocks` | exit 0 · sentinel 0 / `haru-dev-` 0 / sharp 0 | `cmd-format_check.log` · `cmd-assert_no-mocks.log` |
| QA 탐침 A (`probe/qa-r2.spec.ts.txt`, 포트 4319, 단독) | 95 passed (2.1m) | `qa-probe.log` |
| QA 탐침 B (`probe/qa-r2b.spec.ts.txt`, 단독) | 6 passed | `qa-probe-b.log` |
| `pnpm test:e2e` (**단독**, 비교 모드, 시작 전 `pgrep` 결과 Playwright 0개) | exit 0 — **890 passed / 0 failed (20.5m)**. 실행 뒤 `git status e2e/__screenshots__` 변화 0 | `e2e-full.log` |
| 픽셀 분해 | `probe/diffc.mjs.txt` (sharp raw 로 디코드, 채널 최대 Δ, 8-연결 반경 2 성분) | — |

탐침 A 는 gallery 영역 baseline **39종 전부**(visual.spec 33 + `stage7-shared-ui` 6 + `session-recording` 2 — 목록은 `probe/ids.json`)를 내비가 보이는 상태와 가린 상태로 각각 찍고, 이어서 오프셋 토글(`[data-demo="v1-button"]{margin-block-end:-46px}`)과 shelf 시트 토글 5종을 찍었다.

### R2.4 판정

**AC-7-72 — `PASS`** (1회차 FAIL → 해소, `QA-7-001` 해소)

1. **어느 gallery 영역 baseline 에도 내비가 없다.** 39종 각각에서 "내비를 가리고 렌더한 결과 ↔ 작업본 baseline" 을 비교했다. 내비 띠 크기의 클러스터(전폭, 수천 px 이상)는 **0건**이다. "내비 보임 ↔ 가림" 차이가 있는 블록은 5개(`v1-button` · `v5-field` · `v9-spinner-skeleton` · `v9-state-cards` · `s4-record-control`)이고, 5개 모두 baseline 은 **가린 쪽과 같다**. `s4-record-control` 은 Stage 4 의 자체 `hideDevNav` 가 가린다. 나머지 34종은 내비가 대상과 겹치지 않는다(보임 ↔ 가림 0px).
2. **눈으로 확인했다** (`r2-*-HEAD-vs-new-*.png`, 왼쪽 HEAD · 오른쪽 작업본): HEAD 의 `v5-field` · `v9-spinner-skeleton` · `v9-state-cards` 에는 칩 내비(*HARU dev · Tokens · Components …*)가 찍혀 있다. 작업본에는 없다. `v1-button` 작업본은 *Start session* 행 전체가 보인다.
3. **재생성 4장 분해** (`git show HEAD:<path>` 와 비교). 설명되지 않는 클러스터는 0개다.

| baseline | 작업본 ↔ HEAD | 원인 확정 (QA 가 직접 토글) |
|---|---|---|
| `v5-field` | 13 클러스터 23,474px — y358–454 전폭 21,595px Δ130 · y360 경계 287px Δ10 · 잔여 11개 Δ≤13 | 가림 렌더 = 작업본 **0px** · (보임 + 오프셋 토글) = HEAD **0px** · (가림 + 오프셋) ↔ HEAD = 내비 띠 2개뿐 → 큰 2개는 내비, 잔여 11개는 46px 오프셋 |
| `v9-spinner-skeleton` | 14 클러스터 23,715px — y0–65 전폭 Δ181 · y0–2 x0–3 Δ113 · 잔여 12개 Δ≤15 | 위와 같다 (각 0px · 내비 2개뿐) |
| `v9-state-cards` | 7 클러스터 30,839px — y206–302 전폭 Δ161 · 잔여 6개 Δ≤15 | 위와 같다 (각 0px · 내비 1개뿐) |
| `v1-button` | 361×744 ↔ HEAD 361×698. 섹션 **안**의 S7-F 변경(+46px, 1회차에 판정됨)으로 내용 전체가 다르다 | 1회차 작업본 위 140px(`../qa-v1-button-top.png`) ↔ 새 baseline = **1 클러스터 y0–42 전폭 Δ124 = 내비 띠**. (내비 보임 렌더) ↔ 1회차 crop = **0px**. (가림 렌더) ↔ 새 baseline = **0px** → 이번 변경분은 내비 띠뿐이다 |

H7-9.3 의 수치(픽셀 수 · Δ · 좌표)를 **모두 재현했다**.

**AC-7-73 — `PASS` 유지** — 게이트 7종 + e2e 890/0 (위 표).

### R2.5 Finding — 스테일 baseline

```
QA-7-005 | Severity: Low (관찰 · AC 판정 영향 없음)
Requirement: AC-7-73 (Regression) · R-BASELINE-1 §3-1
Steps to reproduce:
  1. 탐침 A/B 로 대상 블록을 현재 코드에서 렌더한다 (gallery 내비는 가림)
  2. 작업본 baseline (= HEAD 와 바이트 같음) 과 픽셀 비교한다
  3. 원인 토글을 넣고 다시 렌더해 비교한다
Expected: 현재 렌더 = baseline
Actual: 7장이 Δ≤13 의 작은 차이로 어긋난 채 비교 모드 허용 범위 안에서 통과한다
  | baseline | 현재 ↔ baseline | 원인 토글 결과 |
  | s2-textlink         | 4 클러스터 61px Δ≤13  | 오프셋 토글 → 0px (S7-F +46px) |
  | v4-tag-chip         | 9 클러스터 119px Δ≤13 | 오프셋 토글 → 0px |
  | v9-icon-button      | 1 클러스터 42px Δ12   | 오프셋 토글 → 0px |
  | s7-icons (신규, dev 미보고)         | 2 클러스터 4px Δ2   | 오프셋 토글 → 0px |
  | s7-surface-card (신규, dev 미보고)  | 2 클러스터 39px Δ6  | 오프셋 토글 → 0px |
  | s4-record-control (신규, dev 미보고)| 5 클러스터 322px Δ≤6 | 오프셋 토글 → 0px |
  | s3-library-shelf-sheet | 2 클러스터 61px (y0–3 x328–351 Δ5 · y1 x231–250 Δ1). 두 번 실행 결과 같음 | 원인 확정 — 아래 |
  s3-library-shelf-sheet: 시트 상단(y40)의 바로 위에 Library TopBar 주간 칩(y3–37)이 있다. D7-6 ③ 으로 칩 오른쪽 끝이
  x349 → x369 로 옮겨졌고, 그 그림자가 시트 클립의 위 0–3행에 들어온다.
  `.haru-top-bar--large .haru-top-bar__trailing > * { transform: translateX(-20px) }` 로 칩을 원래 자리로 돌리면
  HEAD 와 0px 이다. 칩을 가리면 y1 의 Δ1 줄(97px)만 남는다 → 두 클러스터 모두 칩(그림자 포함) 때문이다.
  H7-9.4 의 "원인 미확인" 을 해소했다.
Evidence: docs/qa/evidence/stage-7/r2/qa-probe.log · qa-probe-b.log · probe/qa-r2*.spec.ts.txt
Suspected area: baseline 파일만 해당 (e2e/__screenshots__/darwin/{visual,stage7-shared-ui,session-recording}.spec.ts/). 제품 코드 영향 0
```

**판단 — Stage 7 결함이 아니며 AC 판정을 막지 않는다.**
- 7장 모두 원인이 **승인된 Stage 7 변경**(S7-F ButtonGroup +46px · `D7-6` ③ TopBar 칩 이동)의 부수 효과이고, 토글로 **0px 까지 재현해 확정**했다(R-BASELINE-1 §6). 대상 컴포넌트 자체의 변화는 0이다. dev UI · 과도기 프레임 · 버그 상태가 담긴 것은 없다(§1·§2 위반 아님). 비교 모드에서는 통과한다.
- §3-1 의 경고대로 `changed` 모드는 이런 차이를 드러내지 않으므로, 그대로 두면 이후 진짜 회귀가 같은 영역에서 이 잔여분과 섞인다. 클러스터를 모두 설명했으므로(§5) **재생성은 허용된다**.
- dev 의 `=all` 은 `visual.spec.ts` 에만 적용되어 `stage7-shared-ui` · `session-recording` 의 3장을 놓쳤다. 다른 spec 에도 같은 스테일이 더 있을 수 있다.

**권고:** development-agent 의 별도 단위로 **gallery 영역 클립이 있는 spec 전체**(`visual` · `stage7-shared-ui` · `session-recording`, 가능하면 전 spec)에 `--update-snapshots=all` 을 실행한다. 바뀐 파일이 이 7장과 같은지 대조하고, 다르면 멈춘다. 7장만 재생성한 다음 QA 가 바이트 단위로 확인한다. 같은 이유로 `s3-library-*`, `v2-material` 처럼 이미 M 인 것과 같은 변경 묶음으로 커밋하기를 권한다. **사용자 결정 사항이다** (재생성 승인 / 보류). Stage Verdict 계산에는 넣지 않는다.

### R2.6 Regression 스폿 체크 (Stage 7 핵심 경로)

전체 단독 실행(`r2/e2e-full.log`)에서 spec 별 결과: `progress` 38/0 · `report-detail` 22/0 · `report-pdf` 24/0 · `highlight-clip` 23/0 · `stage7-shared-ui` 15/0 · `library` 29/0 · `visual` 74/0. Stage 1~6 spec 과 classic-scrollbar 프로젝트도 모두 통과했다. 단위 테스트 3,382/0. 1회차 대비 Product Code 변경 0 이므로 1회차의 AC 판정(PASS 77)은 그대로 유효하다.

### R2.7 NOT VERIFIED (이월 · 사용자 수용 대상)

| ID | AC | 이유 | 절차 |
|---|---|---|---|
| `QA-7-002` | 62 + `VG7-E-10` | iOS Safari 공유 시트 · 저장 · 첫 탭 오디오 — 실기기 없음 | §6 |
| `QA-7-003` | 49b | headless 에서 재생 시계가 멈춘다 — headed 브라우저 필요 | §6 |
| `QA-7-004` | 68 | VoiceOver — 실기기·스크린리더 없음 | §6 (`QA-6-005` 와 같은 세션 권고) |

사용자가 세 항목을 항목별로 수용하면 `PASS (accepted: QA-7-002, QA-7-003, QA-7-004)` 로 기록한다. QA 는 수용을 가정하지 않는다.

BACKEND_INTEGRATION_PENDING 4건(AC 36 · 48 · 55 · 63)과 `P7-BIP-01`~`16` 은 §7 과 같고 변화가 없다. 새 BIP 0.

### R2.8 재검증 이력 (추가)

| 회차 | 일시 | Verdict | 내용 |
|---|---|---|---|
| 2 | 2026-11-20 | `INCOMPLETE` | `QA-7-001` 해소 (AC-7-72 PASS) · `QA-7-005` 신규 Low 관찰(스테일 baseline 7장, 원인 전부 확정) · NOT VERIFIED 3건 유지 · e2e 890/0 · unit 3,382 · 탐침 101/101 |

## 재검증 (3차)

stage-qa-agent, 2026-11-20 15:31–15:52 KST. 대상은 H7-10 (`D7-8` ② 스테일 baseline 7장 재생성). handoff 서술은 주장으로만 취급했고 해시·픽셀·e2e 를 QA 가 직접 다시 실행했다. Product Code 수정 0, 커밋 0. 증거는 `docs/qa/evidence/stage-7/r3/` 에 있다.

### R3.1 Summary

| 항목 | 내용 |
|---|---|
| Stage Verdict | **`PASS (accepted: QA-7-002, QA-7-003, QA-7-004)`** — `FAIL` 0. 남은 `NOT VERIFIED` 3건은 사용자 결정 `D7-8` ① (`docs/decisions/stage-7-approvals.md`)에서 항목별로 수용되었고 Stage 8 접근성·실기기 점검에서 확인한다 |
| AC 집계 (85줄) | `PASS` 78 · `FAIL` 0 · `PARTIAL` 0 · `NOT VERIFIED` 3 (49b · 62 · 68 — 수용됨) · `BACKEND_INTEGRATION_PENDING` 4 (36 · 48 · 55 · 63). 2차와 같다 |
| Findings 변화 | `QA-7-005` (Low, 관찰) → **해소** (7장 재생성, 아래 R3.3) · `QA-7-002`~`004` NOT VERIFIED → **수용 (`D7-8` ①)** |

### R3.2 Commands Executed

| 확인 | 결과 | 증거 (`r3/`) |
|---|---|---|
| `diff before.sha after2.sha` (development-agent 기록 167줄 ↔ 167줄) | 바뀐 줄 **정확히 7개**: `s2-textlink` · `v4-tag-chip` · `v9-icon-button` · `s3-library-shelf-sheet` (visual) · `s7-icons` · `s7-surface-card` (stage7-shared-ui) · `s4-record-control` (session-recording). 그 밖의 160개 해시 동일 | `sha-before-vs-after2.diff` |
| 작업본 ↔ `after2.sha` (`shasum -a 256 -c`, 저장소 루트) | **167/167 OK**, 작업본 png 167개 | `sha-worktree-check.log` |
| 백업 ↔ `before.sha` | 167/167 OK (백업이 재생성 전 상태와 같다) | — |
| `before.sha` ↔ `git show HEAD:` | 추적 중인 5장(`s2-textlink` · `v4-tag-chip` · `v9-icon-button` · `s4-record-control` · `s3-library-shelf-sheet`)은 before = HEAD blob. `s7-*` 는 미추적 신규 파일 | — |
| 픽셀 분해 백업 ↔ 현재 (`diffc.mjs`, tol 0, 8-연결 반경 2) | 아래 R3.3 | `pixel-backup-vs-current.jsonl` · `diffc.mjs.txt` |
| `pnpm test:e2e` (**단독**, 비교 모드, 시작 전 Playwright 프로세스 0개) | exit 0 — **890 passed / 0 failed (20.5m)**. 실행 뒤 baseline 해시 167/167 그대로, `git status e2e/__screenshots__` 변화 0 | `e2e-full.log` · `screens-status-before.md5` |
| Scope | `apps/` = `web` 만. `apps/api` · `supabase` 없음 | — |

typecheck · lint · lint:boundaries · build · test · format:check 은 Orchestrator 가 exit 0 을 확인했고, 2차 이후 Product Code 변경이 없어(H7-10.1) QA 는 다시 돌리지 않았다.

### R3.3 `QA-7-005` 판정 — 해소

백업(재생성 전) ↔ 현재 baseline 의 클러스터가 2차 R2.5 에서 "현재 렌더 ↔ 옛 baseline" 으로 진단한 클러스터와 **개수·픽셀 수·Δ·좌표까지 같다**. 따라서 이번 재생성은 진단된 차이만 반영했고, 설명되지 않는 클러스터는 0개다 (R-BASELINE-1 §5).

| baseline | 백업 ↔ 현재 | R2.5 진단 | 원인 |
|---|---|---|---|
| `s2-textlink` | 4 클러스터 61px Δ≤13 (y9–17 좌우 끝 · y265 두 줄) | 4 / 61 / Δ≤13 | S7-F +46px 오프셋 |
| `v4-tag-chip` | 9 클러스터 119px Δ≤13 (y298–308 칩 6개 · y2–6 좌우) | 9 / 119 / Δ≤13 | 같음 |
| `v9-icon-button` | 1 클러스터 42px Δ12 (y30–41 x130–141) | 1 / 42 / Δ12 | 같음 |
| `s7-icons` | 2 클러스터 4px Δ2 (y17 좌우 끝) | 2 / 4 / Δ2 | 같음 |
| `s7-surface-card` | 2 클러스터 39px Δ6 (y18–27 좌우 끝) | 2 / 39 / Δ6 | 같음 |
| `s4-record-control` | 5 클러스터 322px Δ≤6 (y527–558 x39–144) | 5 / 322 / Δ≤6 | 같음 |
| `s3-library-shelf-sheet` | 2 클러스터 61px (y0–3 x328–351 Δ5 · y1 x231–250 Δ1) | 동일 좌표·Δ | `D7-6` ③ TopBar 칩 그림자 |

치수는 7장 모두 그대로다. 재생성 후 비교 모드 e2e 가 890/0 으로 통과하므로 새 baseline = 현재 렌더다. 이미 M 상태였던 8장(`s3-library` 3장 · `v1-button` · `v2-material` · `v5-field` · `v9-spinner-skeleton` · `v9-state-cards`)은 해시 변화 0 이다.

### R3.4 남은 항목 (변화 없음)

- `QA-7-002` · `QA-7-003` · `QA-7-004`: 수용됨 (`D7-8` ①). 수동 절차는 §6 이며 Stage 8 에서 `QA-6-005` 와 같은 세션에서 확인한다.
- BACKEND_INTEGRATION_PENDING: AC 36 · 48 · 55 · 63 과 `P7-BIP-01`~`16` 은 §7 과 같다. 새 BIP 0. Stage 8 Handoff 문서에 1:1 로 옮길 대상이다.
- 남은 가값 (FAIL 사유 아님): Stage 7 신규 `P-35`~`P-40` · 기존 `P-01`~`P-17` · `P-23`~`P-25` · `P-30`~`P-33` (§8 과 같다).
- Stage 6 이월 기록 (§5.1): `VG6-H-09` · `VG6-H-06` · `VG6-D-12` · `QA-6-005` — 변화 없음.

### R3.5 재검증 이력 (추가)

| 회차 | 일시 | Verdict | 내용 |
|---|---|---|---|
| 3 | 2026-11-20 | `PASS (accepted: QA-7-002, QA-7-003, QA-7-004)` | `QA-7-005` 해소 (재생성 7장 해시·픽셀 확인, 설명 안 되는 클러스터 0) · NOT VERIFIED 3건 `D7-8` ① 수용 · e2e 890/0 단독 |
