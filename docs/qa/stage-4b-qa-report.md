# Stage 4b QA Report — "Session Screens" (3회차 · 1·2회차 기록 보존)

Status: **QA 3회차(R3, 실기기 수동 확인 + `QA-4B-005` · `QA-4B-006` 재검증 반영) 완료 (2026-11-08, stage-qa-agent) — Stage Verdict `PASS (accepted: NV-4B-2, NV-4B-3)` (§R3-7)** · 이전: **QA 2회차 완료 (2026-11-07, stage-qa-agent)** · 2회차 대상 = 1회차 Findings 전부(`QA-4B-001`~`004`) + `S4-H4` AC(AC-4-35·36 화면 부분 · AC-4-99 ③ · AC-4-103 · AC-4-154·155·156) + 전체 회귀. 기준 = `docs/plans/stage-4b-plan.md` rev 1.7 §13.5 · §14 · Spec §21 · `D4-140`~`D4-148` · `AD-S4-27`
Product Code 수정 0 · 커밋 0. 증거 파일 = 1회차 `docs/qa/evidence/stage-4b/` · **2회차 `docs/qa/evidence/stage-4b/r2/`**
1회차 본문(§1 ~ §9)은 아래 "1회차 기록" 에 그대로 남겼다. 1회차 행 중 2회차에서 판정이 바뀐 것은 §R2-4 가 우선한다.

---

# 3회차 (Round 3) — 2026-11-08 · 실기기 수동 확인(`D4-143`) 반영

## R3-1. Summary

| 항목 | 값 |
|---|---|
| **Stage Verdict** | **`PASS (accepted: NV-4B-2, NV-4B-3)`** (§R3-7 최종 — `QA-4B-006` → PASS). 이전 기록: `INCOMPLETE` (§R3-6 시점) — `FAIL` 0 · `NOT VERIFIED` 0 · `PARTIAL` **1** = 신규 **`QA-4B-006`** (Low — Stage 3 테스트 `library-entry-screens` 의 부하 간헐 실패, `QA-4B-005` 와 같은 기전 · 다른 파일). `QA-4B-005` → **PASS** (`D4-150` 수정 재검증). 실기기 4건 정리(PASS 2 · 사용자 수용 2). `QA-4B-006` 이 해소·수용되면 `PASS (accepted: NV-4B-2, NV-4B-3)` |
| 실행 일시 | 2026-11-08 (사용자 실기기 측정 01:01 KST 촬영 · QA 판정 같은 날) |
| 대상 상태 | 2회차와 같은 트리 — QA 는 테스트를 재실행하지 않았다(Orchestrator 지시: 회귀 증거 = 2회차 §R2-8 · §R2-9). Product Code 수정 0 · 커밋 0 |
| 근거 | 사용자 AskUserQuestion 응답(2026-11-08, Orchestrator 전달) + 사용자 스크린샷 2장(`docs/qa/evidence/stage-4b/r3/`) |

## R3-2. Environment (사용자 실기기)

| 항목 | 값 |
|---|---|
| 기기 · 브라우저 | iPhone · Safari — 측정판 UA `Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1` → **UA 상 OS 18_7, Safari 26.6**. 실제 iOS 버전은 사용자 미기재(UA 의 OS 문자열이 고정값일 수 있어 단정하지 않는다) |
| 접속 | Mock 프리뷰 · Mac 의 HTTPS dev 서버 `https://172.30.1.14:5174` (Safari 주소 표시 "보안 안 됨 — 172.30.1.14" = 자체 서명 인증서, 마이크 사용 가능 상태 — 측정 5회 오류 0) |
| 녹음 형식 | `mimeType audio/mp4; codecs=mp4a.40.2` · `timeslice 1000 ms` (측정판 표시) |
| 증거 파일 (sha256) | `r3/nv-4b-1-ios-measure.png` `bb959844…cb7` (측정판 ⑧·⑨) · `r3/ios-ready-screen.png` `27a61abd…8c8` (ready 세션 화면 — Prompt 버블 + `Tap to recording`, 판정 증거로는 쓰지 않음) |

## R3-3. 실기기 4건 판정 (§R2-6 항목 — 2회차 NV 행보다 우선)

| ID · AC | 판정 | 증거 · 증거 수준 |
|---|---|---|
| `NV-4B-1` · AC-4-50 녹음 시작 지연 ≤ 1s (iOS Safari) | **PASS** | QA 가 스크린샷을 직접 판독: ⑧ 5회 탭→`start` **232 / 318 / 228 / 445 / 340 ms → 중위값 318 ms** · 탭→첫 `dataavailable` 2240 / 2323 / 2230 / 2452 / 2346 ms → 중위값 2323 ms · 오류 0. 판정 끝점 = **`start` 이벤트** (`D4-145` CP-16 ⓒ — 두 끝점 기록, 판정은 `start`, 첫 `dataavailable` 은 참고값) → 318 ≤ 1000 충족. 측정 경로 = 제품 `WebRecorderAdapter`(AC-4-154 ③, 2회차 PASS). 한계: iOS Safari 1종만 — 데스크톱 Chrome · 데스크톱 Safari 측정 기록은 받지 못했다(아래 주 1) |
| (참고) AC-4-50 첫 `dataavailable` | 기록만 | 중위값 2323 ms — timeslice 1000 대비 약 2.3s. 4a spike(데스크톱 1184 ms)보다 길다. 판정 대상 아님(`D4-145`). 첫 청크 저장 전 유실 창 정보로 `RECORDING_UPLOAD_SPEC` 참고 대상(관찰 `OBS-4B-10`) |
| `NV-4B-2` · AC-4-68 ③ iOS 전화 수신 | **`PASS (accepted: NV-4B-2)`** | 사용자 응답 "확인 못 함 — 수용" (항목별 명시 수용, `rules/qa.md` §2). 실행 증거 없음. Chromium 실행 가능 부분(①②)은 1회차 PASS 그대로 |
| `NV-4B-3` · AC-4-146 판정 스트림 해제 (마이크 표시등) | **`PASS (accepted: NV-4B-3)`** | 사용자 응답 "확인 못 함 — 수용". ⚠️ 측정판 ⑨ 결과가 같은 스크린샷에 있으나 **증거가 아니다**: `판정 recorded · 스트림 0 · 트랙 0 · 감싸기 원복 yes` + 화면 문구 "판정이 마이크를 열지 않았다 — 권한이 이미 허용(또는 차단)되어 있으면…" = 권한을 "묻기" 로 되돌리지 않고 실행(§R2-6 전제 미충족) → 스트림 해제를 관측한 것이 아니다. 판정은 수용으로만 성립 |
| `NV-4B-4` · AC-4-99 ② iOS Safari `dvh` · `VG-K1-05` | **PASS (증거 수준: 사용자 구두 보고)** | 사용자 응답 "정상 — 통과 (툴바 표시/숨김에서 레이아웃 튐 없음, Submit 도달)". 수치(메달리온 지름 136/190 · 간격)·스크린샷·iOS 버전 없음 — 같은 날 같은 기기(위 UA)로 추정할 뿐 기록은 없다. 절차의 관찰 항목(레이아웃 점프 · Submit 도달)은 사용자가 직접 확인한 것이며 `D4-143` 이 이 확인 방식을 사용자에게 맡겼으므로 PASS 로 둔다. 근거가 사용자 보고뿐임을 남긴다 |

주 1 (`NV-4B-1` 범위): AC-4-50 측정 대상은 데스크톱 Chrome · 데스크톱 Safari · iOS Safari 다(상위 Plan AC-4-50 수정본). 사용자 보고·증거는 iOS Safari 1종뿐이다. 4a spike 의 데스크톱 측정(`start()` 지연)과 iOS 실측 318 ms 를 근거로 PASS 로 두되, 데스크톱 2종의 측정판 ⑧ 기록은 받지 못했다는 사실을 남긴다. 사용자가 이 범위를 다르게 보면 데스크톱 2종 측정 또는 수용이 필요하다.

판정 집계 (정본 82): **PASS 80 · PASS (accepted) 2 (AC-4-68 iOS 부분 · AC-4-146 실브라우저 부분) · NOT VERIFIED 0**. 정본 밖 12건 PASS 12 (2회차 그대로).

### Stage Verdict (R3 · 실기기 반영 시점) — **`INCOMPLETE`** ⚠️ §R3-6 이 이 판정을 대체한다

- `FAIL` 0 · `NOT VERIFIED` 0 · **`PARTIAL` 1 = `QA-4B-005`** (Low — 세션 단위 테스트 `openReady` 1000ms 대기 예산, 부하 시 간헐 실패, §R2-9.2).
- `QA-4B-005` 는 사용자 결정 **`D4-150`(2026-11-07) "이번에 고침 — development-agent 수정 → stage-qa-agent 같은 부하 절차로 재검증"** 대상이며 수용이 아니다. QA 확인(2026-11-08): `openReady` 는 아직 마지막 단계를 기본 1000ms `findByRole('button', { name: copy.record.start })` 한 번으로 기다린다(`apps/web/__tests__/session-recording.test.tsx:94`, 파일 mtime 11-03) · `stage-4b-handoff.md` · `WORKFLOW_STATE.md` 에 `D4-150` 수정 기록 없음 → **미수정 · 미재검증**.
- 따라서 Orchestrator 예상치 `PASS (accepted: NV-4B-2, NV-4B-3)` 로 기록할 수 없다. 해소 경로: ① development-agent 가 `D4-150` 대로 수정 → QA 가 §R2-9.2 부하 절차(`yes` ×8 + 전체 vitest 3회)로 재검증 → PASS 면 Stage Verdict **`PASS (accepted: NV-4B-2, NV-4B-3)`** ② 또는 사용자가 `QA-4B-005` 를 항목별 명시 수용(`D4-150` 변경) → `PASS (accepted: QA-4B-005, NV-4B-2, NV-4B-3)`.
- 참고: `docs/workflow/WORKFLOW_STATE.md:13` 은 "PARTIAL 0" 으로 적혀 있어 §R2-9 보충(PARTIAL 1)과 다르다 — Orchestrator 갱신 대상.

## R3-4. 관찰 (Finding 아님)

| ID | 내용 |
|---|---|
| `OBS-4B-10` | iOS Safari 26.6 첫 `dataavailable` 중위값 2323 ms (timeslice 1000 의 약 2.3배). 판정 끝점이 아니어서 AC 영향 없음. 녹음 시작 후 첫 청크가 로컬에 저장되기 전 약 2.3s 동안 강제 종료되면 그 구간이 유실될 수 있는 창이다 — Stage 8 Handoff(`RECORDING_UPLOAD_SPEC`) 및 크래시 복구 기대치 설명에 참고로 남길 것을 권고 |
| `OBS-4B-11` | `NV-4B-3` 측정판 ⑨ 는 권한 "허용" 상태에서 눌려 증거가 되지 못했다. 향후 이 항목을 실측으로 바꾸려면 §R2-6 전제(권한 "묻기" 초기화 → 새로고침 → ⑨)를 따른다. 재프롬프트 여부(R4B-16, `N4B-29`)도 미확인 상태로 남는다 |

## R3-5. 유지 항목 (2회차 참조)

- **BACKEND_INTEGRATION_PENDING**: §R2-7 (1회차 §7 11행 + `P4B-BIP-07` · `08` = 13행) — 변경 없음.
- **남은 가값**: 1회차 §8.1 목록 — 변경 없음(§R2-8).
- **Regression**: §R2-8 · §R2-9 그대로(이번 회차 재실행 없음). `QA-4B-005` PARTIAL 유지.


## R3-6. `QA-4B-005` 재검증 (`D4-150` · 인계 `H4-14`) — 2026-11-08 10:20 – 10:38 KST

증거 = `docs/qa/evidence/stage-4b/r3/qa-4b-005/`. Product·테스트 코드 수정 0 · 커밋 0 · Playwright 미실행(지시). 개발자 자체 결과(부하 3/3)는 증거로 쓰지 않았다.

| 확인 | 판정 | 증거 |
|---|---|---|
| ① 변경 범위 — Product Code 0 | **PASS** | R3 증거 촬영(01:06) 이후 mtime 이 바뀐 파일 = `apps` · `packages` · `e2e` · config 전체에서 **테스트 3개뿐**(`session-recording` · `session-prompts` · `session-exceptions` .test.tsx, 01:09). 실행 전후 `git status --porcelain -uall` 동일(리포트·증거 제외) · 3파일 sha256 전후 일치(`sha-tests.txt`) |
| ① diff — 단언 약화 · retry · skip · timeout 변경 없음 | **PASS** | QA 가 diff 를 직접 읽음: 3파일 모두 Reading Context 확인 뒤 **9줄 추가**뿐 — `waitFor(pathname ~ /^\/session\/[^/]+$/)` → `waitFor(.haru-session:not(.haru-session--pending) 존재)` → 기존 `findByRole('button', { name: copy.record.start })` **그대로**. 추가 단계는 단언을 늘린 것이며 기존 단언은 삭제·완화되지 않았다. 사전 diff 크기(R3 시점 `prompts` 15 · `recording` 39 줄)와 현재(24 · 48)의 차이 = 정확히 9줄씩 → 다른 hunk 변경 0. `session-exceptions`(미추적 파일)는 `startFromHome` 에 같은 9줄. 세 파일 grep: `.skip` · `.only` · `retry`(옵션) · `timeout:` · `testTimeout` 0 (`retry` 일치는 제품 버튼 이름 `copy.states.retry` 뿐) |
| ③ 무부하 `pnpm test` 1회 | **PASS** | **173 files / 2513 tests 통과** · exit 0 · 39.2s (`pnpm-test-noload.log`) |
| ② 부하 절차 (§R2-9.2 와 동일: `yes > /dev/null` ×8 + 루트 `npx vitest run` 전체) — **10회** (2회차 재현율 1/3 → 미수정 상태면 10회 무실패 확률 ≈ (2/3)^10 ≈ 1.7%) | **`QA-4B-005` 대상: 30/30 통과** | 회차별 결과 = 9/10 전체 통과 · **회차 2 만 1건 실패(다른 파일 — 아래 `QA-4B-006`)**. 대상 3파일은 10회 × 3 = **30/30 통과**(29 · 28 · 16 tests, 실패 0). 부하 수준은 2회차 재현 조건 이상: 대상 파일 실행 시간 최대 **21.4s**(2회차 실패 회차 19.4s · 평소 10~11s), 회차 시작 load avg 24 → 139(`unit-full-stress-n.log` 1행 — `yes` 외 이 기기의 다른 부하도 섞였다, 원인 미특정) · 전체 소요 76~109s. `yes` 8개는 QA 가 띄운 것만 종료, 잔여 0 (`stress-burners.txt`) |

**`QA-4B-005` 판정: PARTIAL → PASS** — 같은 부하 절차·충분한 반복에서 `openReady`/`startFromHome` 경로 실패 0, 변경은 단계 분리뿐(단언 약화 0 · timeout·retry·skip 0 · Product 0).

### 신규 Finding

```
QA-4B-006 | Severity: Low (테스트 견고성 — 제품 결함 근거 없음, Stage 3 기존 테스트)
Requirement: Regression "전체 테스트 스위트 통과" (rules/qa.md §5) · AC-4-101 (Stage 1~3 회귀 재현성)
Steps to reproduce: §R2-9.2 부하 절차(`yes` ×8 + 루트 `npx vitest run`) 반복 — QA 10회 중 회차 2에서 1건
Expected: 부하와 무관하게 전체 스위트 통과
Actual: `apps/web/__tests__/library-entry-screens.test.tsx` › "`ListGroup` 2행이고 **섹션 제목을 만들지 않는다**" 1664ms 실패 —
  `TestingLibraryElementError: Unable to find role="list" and name "Library actions"` (`unit-full-stress-2.log:494-495`).
  DOM 은 AppShell 렌더 중 상태 — 기본 1000ms `waitFor(() => entryList())` 창 안에 목록이 나오지 않았다.
  같은 회차의 나머지 2512 통과 · 무부하 1회 · 다른 부하 9회 통과
Evidence: `docs/qa/evidence/stage-4b/r3/qa-4b-005/unit-full-stress-2.{log,json}` · 파일 mtime 2026-10-10(이번 수정 대상 아님 — 기존 테스트)
Suspected area (수정 지시 아님): `library-entry-screens.test.tsx:73-78` `renderAt(ROUTES.library)` 뒤 기본 창 1회 대기 —
  `QA-4B-005` 와 같은 기전(라우팅 + query 해소가 한 창에 몰림). 다른 기존 테스트에도 같은 패턴이 있을 수 있다(전수 미조사)
Rerun 만으로 PASS 처리하지 않는다. 판정: Regression "전체 테스트 스위트 통과" = PARTIAL (무부하 통과 · 높은 부하 1/10 간헐 실패)
```

### Stage Verdict (R3-6 시점) — **`INCOMPLETE`** ⚠️ §R3-7 이 대체한다

- `FAIL` 0 · `NOT VERIFIED` 0 · `PARTIAL` **1** = `QA-4B-006` (Low). `QA-4B-005` PASS · `NV-4B-1`·`4` PASS · `NV-4B-2`·`3` 수용.
- 해소 경로: ① development-agent 가 `QA-4B-006` 을 고친 뒤 QA 가 같은 부하 절차로 재검증 → **`PASS (accepted: NV-4B-2, NV-4B-3)`** ② 또는 사용자가 `QA-4B-006` 을 항목별 명시 수용 → `PASS (accepted: QA-4B-006, NV-4B-2, NV-4B-3)`. 다른 기존 테스트의 같은 패턴 전수 점검 여부는 사용자 결정 사항.
- BACKEND_INTEGRATION_PENDING (§R2-7, 13행) · 가값(1회차 §8.1) 변경 없음.

---

## R3-7. `QA-4B-006` 재검증 (`D4-153` 같은 유형 전수 수정 · 인계 `H4-15`) — 2026-11-08 15:1x – 15:35 KST

증거 = `docs/qa/evidence/stage-4b/r3/qa-4b-006/`. Product·테스트 코드 수정 0 · 커밋 0 · Playwright 미실행(지시). 개발자 자체 결과(부하 5/5)는 증거로 쓰지 않았다.

| 확인 | 판정 | 증거 |
|---|---|---|
| ① 변경 범위 — Product Code · 전역 설정 0 | **PASS** | §R3-6 증거 시각 이후 mtime 변경 = `apps` · `packages` · `e2e` 에서 **`apps/web/__tests__/*.test.tsx` 14개뿐**(H4-15-2 목록과 일치). 루트 config · `package.json` · lockfile 변경 0. 실행 전후 `git status --porcelain -uall` 동일 · 14파일 sha256 전후 일치(`sha-tests.txt`) |
| ① diff — 단언 약화 · retry · skip · timeout 없음 | **PASS (한계 기록)** | 추적 중이며 이전에 깨끗했던 8파일(`library-entry-screens` · `library-screen` · `library-sheets` · `home-settings` · `home-stage3` · `onboarding-screens` · `consent-screens` · `session-ready`)은 `git diff` = 이번 수정 전부(`tracked-tests.diff`): **추가뿐**(삭제 1줄 = `consent-screens` 주석 문구 교체). 추가 = `waitForGuard()`(Route Guard `Spinner`(`RouteGuard.tsx:41`, 이름 `appCopy.guard.loadingLabel`) 소멸 대기) · `waitForSessionDetail()` · `waitForMeAfterConsent()`(`POST /v1/consents` **뒤의** `GET /v1/me` 도달) — 모두 기존 최종 단언 **앞**에 끼운 중간 대기이며 기존 단언 삭제·완화 0. `session-recording`(삭제 0 · 추가 +23) · `session-prompts`(삭제 5 = §R3-6 이전부터 있던 것 그대로 · 추가 +13)도 증분이 추가뿐. 14파일 grep: `.skip`/`.only`/`.todo`/`skipIf`/`retry:` **0** · 코드상 `timeout` = `onboarding-screens:477·511` `{ timeout: 2000 }` 2건 — **기존**(`git diff` 의 timeout 일치는 주석 1건뿐). ⚠️ 한계: 미추적 4파일(`session-notices` · `session-exceptions` · `session-permission` · `session-start-blocked`)은 수정 전 사본이 없어 diff 대신 `D4-153` 표식 위치를 직접 읽었다 — 같은 도우미 3종 호출 추가만 확인, 전체 비교는 불가 |
| ① "같은 유형" 기준 타당성 (H4-15-1) | **타당** | 기준 = 기본 1000ms 대기 **한 번**이 Guard 판정 · 화면 query · mutation→이동 · 후속 조회 중 **둘 이상**을 거치는 곳. `QA-4B-006` 실패 로그 DOM 이 AppShell(Guard 단계)였던 사실과 `QA-4B-005` 의 측정 기전(단계 합산이 예산 근접)에 맞는다. 제외 사유(미인증 = Guard 가 `render()` act 안에서 동기 판정 · 단일 비동기 · 화면 없는 hook 테스트 · `packages/**` 에 `findBy`/`waitFor` 0)는 단계 수 기준과 일관된다. 미인증 진입의 동기 판정은 QA 가 따로 실행 확인하지 않았다(아래 부하 결과로 간접 확인) |
| ① 제외 — Loading 프레임 테스트 2건 | **합당** | `library-screen:255`(`library:loading`) · `home-stage3:391`(`activity-cards:loading` · `home:loading`). 테스트 harness 의 Mock timer 는 `createImmediateTimer()`(`src/test/harness.tsx:95` → `withDelay.ts:43` `sleep: () => Promise.resolve()`) — Loading 상태는 1.5s 지연이 아니라 **microtask 수준의 과도 프레임**이다. 중간 대기(macrotask 비움)를 끼우면 잡으려는 프레임이 지나간다는 H4-15 설명과 일치. 이 두 테스트는 MutationObserver 기반 `findBy`/`waitFor` 로 프레임을 잡으므로 부하에 덜 민감하다 — 아래 부하 10회에서 실패 0 |
| ③ `pnpm typecheck` · `pnpm lint` | **PASS** | 각각 exit 0 (`typecheck.log` · `lint.log`) |
| ③ 무부하 `pnpm test` 1회 | **PASS** | **173 files / 2513 tests** 통과 · exit 0 · 47.8s (`pnpm-test-noload.log`) |
| ② 부하 절차 (§R2-9.2 · §R3-6 과 동일: `yes > /dev/null` ×8 + 루트 `npx vitest run` 전체) **10회** | **PASS — 10/10 전체 통과** | 매 회차 **173 / 2513 통과**, 실패 0 · 79.7~85.4s. 14개 수정 파일 = 10회 × 15 파일줄(세션·홈·서재·동의·온보딩) **150/150 통과**. 부하 수준(회차 앞뒤 `uptime`, 각 로그 2행·끝행): load avg 1분 **12.6 → 최대 231.9**, 회차 3~10 은 160~232 — §R3-6(24~139)보다 **높다**. `session-recording` 최장 20.3s · `library-entry-screens` 최장 19.8s(평소 10~11s 수준의 약 2배). `yes` 8개는 QA 가 띄운 것만 종료, 잔여 0 (`stress-burners.txt`). 새 간헐 실패 **0** |

**판정**: `QA-4B-006` **PARTIAL → PASS** · `QA-4B-005` **PASS 유지**(이번 회차 대상 3파일 포함 150/150). Regression "전체 테스트 스위트 통과" = **PASS** (무부하 1 + 고부하 10 전부 통과).
- 남은 사각(기록): 부하 실패율이 낮은 경로(예: 1/30 이하)는 10회로 배제할 수 없다. 미추적 4파일의 수정 전 비교 불가(위 한계).

### Stage Verdict (R3 최종) — **`PASS (accepted: NV-4B-2, NV-4B-3)`**

- `FAIL` 0 · `PARTIAL` 0 · `NOT VERIFIED` 0. 정본 82 = PASS 80 + 사용자 항목별 수용 2(`NV-4B-2` AC-4-68 iOS 전화 수신 · `NV-4B-3` AC-4-146 마이크 표시등 — 2026-11-08 사용자 응답 "확인 못 함 — 수용"). 정본 밖 12건 PASS.
- Finding 상태: `QA-4B-001`·`002`·`004` PASS(2회차) · `QA-4B-003` PASS 종결(2회차) · `QA-4B-005` PASS(§R3-6) · `QA-4B-006` PASS(§R3-7).
- 증거 수준 주의(판정 유지): `NV-4B-1` = iOS Safari 1종 측정판 스크린샷(데스크톱 2종 기록 없음, §R3-3 주 1) · `NV-4B-4` = 사용자 구두 보고.
- BACKEND_INTEGRATION_PENDING §R2-7 13행 · 가값 1회차 §8.1 · 관찰 `OBS-4B-10`·`11` — 변경 없음, 다음 단계 인계 대상.
- 다음 Stage 진입은 사용자 지시 시 (`rules/workflow.md` §3).

---

# 2회차 (Round 2) — 2026-11-07

## R2-1. Summary

| 항목 | 값 |
|---|---|
| **Stage Verdict** | **`INCOMPLETE`** (§R2-9 보충 반영) — `FAIL` **0** · `PARTIAL` **1** (`QA-4B-005` Low — 단위 간헐 실패, §R2-9.2) · `NOT VERIFIED` **4건**(`NV-4B-1`~`NV-4B-4`, 실기기 — `D4-143` 사용자 수동). 다음 Stage 진입 불가. 사용자가 4건을 수동 확인(PASS 증거 첨부)하거나 항목별 명시 수용하면 `PASS (accepted: NV-4B-…)` |
| 실행 일시 | 2026-11-07 14:55 – 15:45 KST |
| 대상 상태 | `main` @ `2ba2cd8` + 미커밋 변경(`git status` 103항목 — S4-H2 ~ S4-H4 · H4-11/12 구현·테스트·문서) |
| 1회차 Finding 재판정 | `QA-4B-001` FAIL → **PASS** · `QA-4B-002` FAIL → **PASS** · `QA-4B-004` FAIL → **PASS** (`AD-S4-27` 승인 범위) · `QA-4B-003` PARTIAL → **PASS (종결)** |
| `S4-H4` 신규 AC | AC-4-154 **PASS** · AC-4-155 **PASS** · AC-4-156 **PASS** |
| 판정 집계 (정본 82 = 1회차 79 + 154·155·156) | **PASS 78 · NOT VERIFIED 4** (AC-4-50 · 68 · 99 · 146 — 각 AC 의 Frontend·Chromium 실행 가능 부분은 PASS, 실기기 부분만 NV. AC-4-99 = ①②③ Chromium 오버레이·클래식 PASS + ② iOS `dvh` NV `NV-4B-4`) / 정본 밖 12건(걸침 화면 10 + AC-4-46 화면 · AC-4-109): **PASS 12** |
| 신규 Finding | **1** — `QA-4B-005` Low (§R2-9.2) · `OBS-4B-9` → `D4-149` 수정 후 **해소** (§R2-9.1) · 원 관찰 기록: (`OBS-4B-9` — `recording-measure.spec.ts` console 단정의 견고성, 원인 재현·확정) |
| `BACKEND_INTEGRATION_PENDING` | 1회차 11행 + `S4-H4` 2행(`P4B-BIP-07` · `08`) = **13행** (§R2-7) — Contract·Mock 결함으로 PENDING 처리한 것 0 |

**핵심 결론**
- 1회차 FAIL 3건은 QA 독립 프로브(R6 · R7 · R8)와 구현자 e2e·unit 재실행으로 모두 해소를 확인했다. 결함 재현 0.
- `QA-4B-003`: 수정 후 **단독 전체 e2e 2회 연속 558/558**(12.3m · 12.4m) + 1회차 재현 프로브 P12 v1 그대로 **50/50**(심장박동 40~41 · visibility 변화 0) + 실시계 Toast 대기 신규 0. 원인 결론(테스트 환경 — 타이머·프레임 실행 지연)은 1회차 QA 관측(앱과 무관한 `setInterval` 동시 정지 + CDP 응답 유지)과 모순이 없고, 조치(주입 clock)가 그 결론에 맞는다 → 종결.
- 남은 것은 실기기 4건(`NV-4B-1`~`4`)뿐이다. 절차는 §R2-6 (측정판 `/__dev/ui/recording-measure` 사용, `NV-4B-3` 은 권한 "묻기" 초기화 전제).

## R2-2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (25F71), darwin arm64 |
| Node / pnpm | v24.21.0 / 12.4.2 |
| Playwright | 1.63.0 (번들 Chromium) — `workers: 1` · `retries: 0` · 포트 **4319 만** · **단독 실행**(시작 전 4319 LISTEN 0 · Playwright 프로세스 0 확인). project 2개: `chromium`(기본, `--hide-scrollbars`) · `chromium-classic-scrollbar`(`scrollbar-classic.spec.ts` 전용, `ignoreDefaultArgs: ['--hide-scrollbars']`) |
| 서버 | e2e 2회 · QA 프로브 = **Playwright 가 직접 띄운 새 dev 서버**. `OBS-4B-9` 실험만 QA 가 4319 에 dev 서버를 직접 띄웠고(PID 77912/77917/77923) 실험 뒤 **QA 가 종료**, 4319 LISTEN 0 확인. 5173 미사용 · 5174(사용자 기기 서버, PID 29863) 미접촉 · 그 외 kill 0 |
| QA 프로브 | `r2/qa-4b-r2.probe.spec.ts` + `r2/qa-4b-r2.config.ts` (기본 config 상속 · R6 만 클래식 스크롤바 project — **CSS 로 스크롤바를 강제하지 않는다**, 1회차 P6 과 다름) |
| 기기 | 실기기 없음 (iOS Safari · 데스크톱 Safari · Android · VoiceOver 미실행) |
| Mock 시나리오 | URL `?scenario=sessions:<key>` — `session-already-active`(recording) · `session-already-active-ready` · `session-already-active-paused` · `onboarding-incomplete` · 요청 로그 `__HARU_MOCK_REQUEST_LOG__`(DEV) |

## R2-3. Commands Executed (전부 `docs/qa/evidence/stage-4b/r2/`)

| # | 명령 | 결과 | 로그 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | ✅ exit 0 (첫 시도는 QA 셸 인용 오류로 명령 미실행 → 재실행, `cmd-summary.log` 기록) | `cmd-install_--frozen-lockfile.log` |
| 2 | `pnpm typecheck` | ✅ exit 0 | `cmd-typecheck.log` |
| 3 | `pnpm lint` | ✅ exit 0 | `cmd-lint.log` |
| 4 | `pnpm lint:boundaries` | ✅ no dependency violations (**794 modules**, 3019 deps) | `cmd-lint_boundaries.log` |
| 5 | `pnpm format:check` | ✅ exit 0 | `cmd-format_check.log` |
| 6 | `pnpm build` | ✅ exit 0 (500 kB chunk 경고 — 기존) | `cmd-build.log` |
| 7 | `pnpm assert:no-mocks` | ✅ MOCK · DEV sentinel 0 · `haru-dev-` 0 · sharp 0 (dist 4파일) + QA grep `apps/web/dist` 에 `measure-start-latency`·`watchedStart`·`watchedGetUserMedia`·`recording-measure` **0** | `cmd-assert_no-mocks.log` · `grep-regression.log` |
| 8 | `pnpm test` | ✅ **173 files / 2513 tests** passed | `cmd-test.log` |
| 8b | vitest verbose — `session-start-blocked.test.tsx` · `latency-core.test.ts` · `MockSessionApi.test.ts` | ✅ 3 files / 58 tests | `cmd-unit-h4.log` |
| 9 | `pnpm test:e2e` **단독 1회차** (15:04:44 시작) | ✅ **558 passed (12.3m)** · 실패 0 | `cmd-e2e-run1.log` |
| 9b | `pnpm test:e2e` **단독 2회차** (15:17:18 시작, 1회차 직후 연속) | ✅ **558 passed (12.4m)** · 실패 0 | `cmd-e2e-run2.log` |
| 10 | QA 프로브 R6 · R7 · R8 · R13 (단독, 새 서버) | ✅ 12 passed (23.4s) | `cmd-qa-probe-r2.log` |
| 11 | QA 프로브 **R12 = 1회차 P12 v1**(심장박동만, rAF 루프 없음) `--repeat-each=50` | ✅ **50 passed (8.9m)** — Toast 잔존 0/50 · 심장박동 40~41 · 최대 간격 319ms · visibility 변화 0 | `cmd-qa-probe-r12-50.log` |
| 12 | `OBS-4B-9` 실험 — QA 소유 dev 서버(4319) 재사용 | 재사용 그대로 `recording-measure.spec.ts` **3/3 통과** → `pnpm --filter @haru/design-tokens run build` (서버 실행 중) → 같은 spec **2/2 실패**(preload 경고) · R13 관측 | `cmd-measure-reuse-*.log` · `cmd-measure-reuse-after-rebuild-*.log` · `cmd-qa-probe-r13-*.log` · `qa-own-devserver.log` |
| 13 | Scope · 위생 grep | `apps/` = `web` · `apps/api` · `supabase` · `apps/mobile` No such file · migration/sql/express 미추적 0 · `test.fail`/`skip`/`.only`/`fixme` **0** · `retries: 0` · 변경·신규 TS 의 `any`/`@ts-ignore`/`@ts-expect-error` 0 · 변경 prod 코드 `console.` 0 · 변경 CSS/TSX HEX = 주석만 · `VITE_*` 3종 · dist secret 0 · 제3자 SDK 0 · `packages/contracts` diff 0 | `grep-regression.log` · `grep-h4-tests.log` |
| 14 | baseline | `git status e2e/__screenshots__` = 기존 미추적 `session-exceptions.spec.ts/` 뿐 — 재생성 0 | — |

## R2-4. Requirement Matrix (2회차 판정 — 1회차 행보다 우선)

### R2-4.1 1회차 Finding 재판정

| ID | 1회차 | 2회차 | 증거 |
|---|---|---|---|
| `QA-4B-001` (AC-4-35 화면 부분) | FAIL Medium | **PASS** | 아래 AC-4-35 행 |
| `QA-4B-002` (AC-4-36 화면 부분) | FAIL Medium | **PASS** | 아래 AC-4-36 행 |
| `QA-4B-004` (AC-4-99 클래식 스크롤바) | FAIL Low | **PASS** | 아래 AC-4-99 ③ 행. 320 컬럼 305 = `AD-S4-27`(사용자 승인 `D4-146` Q3) |
| `QA-4B-003` (AC-4-103 간헐 e2e) | PARTIAL Low | **PASS — 종결** | 아래 AC-4-103 · AC-4-156 행 + §R2-5 |

### R2-4.2 `S4-H4` AC

| AC | 판정 | 증거 |
|---|---|---|
| **AC-4-35 화면 부분** (걸침) | **PASS** | **QA 프로브 R7** (6건, 단독): Home 시트 · 서재 × `session-already-active`(recording) · `-paused` → ① `We couldn't start…` 0 ② `GET /v1/sessions/:sessionId` **1** · `POST /v1/sessions` **1** ③ URL 그대로(`/` · `/library`) · transitions 0 · recordings 0 · Home = 시트 `[role=alert]` 에 `A storytime is already open` · 서재 = Toast 정확히 `A storytime is already open. Continue the open storytime, or finish it before starting a new one.` / `-ready` × 2 경로 → `/session/99999999-…0001` + `Start recording` · `history.length` +1(**push**, Home 2→3 · 서재 3→4) · 생성 1 · 실패 문구 0 (`cmd-qa-probe-r2.log` QA-R7 · QA-R7ready). ④ Detail 실패 → `startFailed` · ⑤ 재탭 = 탭당 생성 1 · Detail 1 · 320×568 1회 스크롤(`scrollIntoView` 1회) = unit `session-start-blocked.test.tsx` 14건(`cmd-unit-h4.log`) · e2e `session-start-blocked.spec.ts` 6건(T1·T2·T3 프레임 · 320×568 안내 시트 안 가시) 2회 통과. 신규 문구 0 — `sessionStartBlockedCopy` 는 기존 `ERROR_COPY` 만 반환(`error-copy.ts:162-173`) |
| AC-4-35 [BE] | `BACKEND_INTEGRATION_PENDING` | 서버 `SESSION_ALREADY_ACTIVE` 판정 · `P4B-BIP-07`(끝나지 않은 recording/paused 세션 서버 정리) |
| **AC-4-36 화면 부분** (걸침) | **PASS** | **QA 프로브 R8** (2건): Home · 서재 → `/onboarding/start` 도착 · 탭 뒤 `GET /v1/me` 1 → 2(재조회 1건, 마지막 요청 `POST /v1/sessions` → `GET /v1/me`) · 일반 실패 문구 0 (QA-R8). ③ 어긋남(`me` 여전히 `completed`) → 기존 `ONBOARDING_INCOMPLETE` 문구 · 이동 0 · 탭당 `me` 1(루프 0) = unit 2건 · T1·T2·T5(Guard 전체 Spinner 0 프레임) = e2e 2건 통과. Mock `onboarding-incomplete` 409 뒤 `me = in_progress` = unit `MockSessionApi.test.ts` |
| AC-4-36 [BE] | `BACKEND_INTEGRATION_PENDING` | 서버 `ONBOARDING_INCOMPLETE` 판정 · `P4B-BIP-08`(`me.onboardingStatus` 일관성) |
| **AC-4-99 ③** | **PASS** | **QA 프로브 R6** (클래식 project, CSS 강제 없이 Chromium 실제 스크롤바 15px): 320×568 · 393×600 · 1024×500 × Home · Library · 세션 ready · recording — 문서 가로 넘침 **0** · 모든 `overflow-y:auto/scroll` 박스 `scrollWidth ≤ clientWidth` · 컬럼 중심 = 스크롤 박스 `clientWidth` 중심(152.5/152.5 · 189/189 · 504.5/504.5) · 컬럼 폭 305 / 378 / 480 (QA-R6). 1회차 재현값(`clientWidth 305 · scrollWidth 320`)이 **305/305** 로 바뀌었다. 상설 `scrollbar-classic.spec.ts` 17건(환경 확인 + 5크기 × 3묶음 + `VG-H4-09` 버블 보조 줄) 2회 통과. 컬럼 305 = `AD-S4-27`. 원인 수정 = `AppColumn.css` `min-inline-size: min(var(--layout-min-width), 100%)`(근거 주석 있음), 스크롤바 숨김 0 |
| AC-4-99 ① ② [Chromium] | **PASS** | 1회차 증거 유지 + 이번 e2e 2회 통과(`session-regression` AC-4-99 · `session-prompts` 짧은 세로) |
| AC-4-99 ② [iOS Safari `dvh`] | **NOT VERIFIED** → `NV-4B-4` | 실기기 |
| **AC-4-103** | **PASS** | **단독 전체 2회 연속 558/558** (12.3m → 12.4m, 1회차 종료 13초 뒤 2회차 시작) · baseline 재생성 0 · `test.fail`/`skip`/`fixme`/`.only` 0 · `retries: 0` 유지 (`grep-h4-tests.log`) |
| **AC-4-154** | **PASS** | ① ② e2e `recording-measure.spec.ts` (Chromium 가짜 마이크) — 5회 표 각 행 두 끝점 `\d+ ms` · 중위값 2개 · `timeslice 1000 ms` · `mimeType audio/` 표시, 2회 통과 ③ unit `latency-core.test.ts` AC-4-154 4건 — 실제 `createWebRecorderAdapter` 경로 · 감싸기가 원래 `start` 를 같은 대상·인자로 호출(동작 변경 0) · 원복 ④ `assert:no-mocks` 통과 + dist grep 측정판 문자열 0 · e2e console 0 단정 통과(새 서버). ⚠️ 단정 견고성 = `OBS-4B-9` |
| **AC-4-155** | **PASS** | ① e2e — ⑨ `판정 recorded` · 열린 스트림 수 · (열렸다면) +1s 전부 `ended` · `감싸기 원복 yes` · 측정 뒤 `getUserMedia`·`MediaRecorder.prototype.start` 원래 함수 ② unit AC-4-155 2건(실패해도 원복) ③ 제품 코드 변경 0 — 인계 H4-1 변경 목록에 녹음·판정 제품 파일 없음(측정판 `RecordingMeasurePage.tsx` · 신규 `latency-core.ts` 만), 측정판은 `createSessionRecorderEnvironment` 를 그대로 호출 · 감싸기는 측정 중에만(unit 원복 단정). ⚠️ QA 는 1회차 시점 작업 트리 스냅샷이 없어 파일 단위 diff 로는 확인하지 못했다 — 근거는 인계 목록 + 측정판 코드 직독 ④ Production 제외 = #7 |
| **AC-4-156** | **PASS** | ① 인계 H4-2 에 1~3단계 증거(재현 0/69 · 1회차 trace 7,602ms 프레임 공백 중 locator 13회 응답 · Playwright 1.63 `chromiumSwitches` 에 억제 해제 3인자 기본 포함 · 제품 경로 직독) + 결론 = 환경 ② 조치 = 주입 clock(`e2e/support/clock.ts`, 근거 주석) — 결론과 맞음 ③ **QA 가 1회차 재현 프로브(P12 v1)를 그대로 `--repeat-each=50` → 재현 0/50** ④ 실시계 Toast 대기 신규 0 — tracked diff 에 추가된 `waitForTimeout` 0 · `toHaveCount(0, { timeout` 0 · 남은 `waitForTimeout` 8곳은 전부 기존(Toast 수명 대기 아님 — 업로드 큐·paused 시간 고정 등) |

### R2-4.3 걸침 화면 부분 재확인 (Plan §13.5 "4b QA 2회차가 재확인")

| AC | 판정 | 증거 |
|---|---|---|
| 22 · 24 · 25 · 30 · 31 · 32 · 62 · 67 화면 | **PASS** (유지) | 1회차 증거 테스트(`session-exceptions` · `session-notices` · `session-ready`/`session-permission` unit · AC-4-144 오류 화면)가 이번 e2e 2회 · unit 전체에서 모두 통과 |

### R2-4.4 그 밖의 정본 AC

1회차 PASS 74건은 이번 회귀(unit 2513 · e2e 558 × 2)에서 근거 테스트가 모두 통과해 **PASS 유지**. NOT VERIFIED AC-4-50 · 68 · 146 실기기 부분은 그대로(§R2-6).

## R2-5. Findings

### 1회차 Finding 상태

| ID | Severity | 상태 |
|---|---|---|
| `QA-4B-001` | Medium | **해소 (PASS)** — 2026-11-07 |
| `QA-4B-002` | Medium | **해소 (PASS)** |
| `QA-4B-003` | Low | **종결 (PASS)** — 판단 근거 아래 |
| `QA-4B-004` | Low | **해소 (PASS)** — `AD-S4-27` |

**`QA-4B-003` 종결 판단**: 증거가 종결을 지지한다.
1. 1회차 QA 자신의 관측 — 실패 순간 **앱과 무관한** 심장박동 `setInterval` 이 Toast 와 같은 창에서 멈췄고(20/40) `evaluate` 는 응답했다. 제품 코드가 남의 interval 을 멈추려면 JS 를 막아야 하는데, 그러면 CDP 응답도 막힌다 → 제품 원인과 양립하지 않는다. 인계 H4-2 의 1회차 trace 재분석(7.6s 프레임 0 · 그동안 locator 13회 응답)도 같은 방향이다.
2. 조치는 증상을 숨기는 것이 아니라 **기다리는 방식**을 바꿨다 — 단정(Toast 가 정해진 수명 뒤 퇴장 · 다음 Toast 등장)은 그대로이고 가짜 시간으로 흘린다. `retries` · `skip` · 임계값 변경 0.
3. 수정 후 단독 전체 실행: 구현자 3회 + QA 2회 = **연속 5회 실패 0** (1회차는 2/2 실행에서 1건씩 실패). P12 v1 50/50.
- 한계(기록): 재현 조건(1회차 실패 시각 01시대 · 장시간 유휴)은 2회차에서도 만들지 못했다 — 재현 0 자체는 약한 증거이며, 종결 근거는 1·2 다. 실기기 일반 창 확인(Plan §13.5-③ 4단계)은 `NV-4B-1` 절차에 1줄로 붙였다(§R2-6, 비차단).

### 신규 Finding — 없음

### 관찰 `OBS-4B-9` (Finding 아님 — 견고성, 원인 재현 확정)

```
대상: e2e/recording-measure.spec.ts:25 의 `expect(logged).toStrictEqual([])` (AC-4-154 ④ "console 0")
현상: Playwright 가 4319 의 기존 dev 서버를 재사용(reuseExistingServer — CI 아닐 때 true)할 때 실패할 수 있다.
재현 (QA, 결정적):
  1. QA 가 4319 에 dev 서버를 직접 띄움 → 재사용 상태로 spec 3회 → 3/3 통과 (서버가 "오래" 떠 있는 것 자체는 원인 아님)
  2. 서버를 띄운 채 `pnpm --filter @haru/design-tokens run build` (= `pnpm build` 와 Playwright webServer 명령이 매번 하는 일) →
     dev 서버 로그 `hmr update /src/styles/index.css` ×3
  3. 같은 spec 2/2 실패 — Chromium 경고 "inter-latin-wght-normal.woff2 was preloaded using link preload but not used within a
     few seconds from the window's load event" 1건
  관측(R13): 새 서버 / 재사용 = `document.fonts` Inter **loaded**, 경고 0 · 토큰 재빌드 뒤 재사용 = Inter **unloaded**, 경고 1
원인: 서버 실행 중 design-tokens dist 재빌드 → HMR 로 CSS 가 교체된 뒤 @font-face 가 preload 자원을 쓰지 않음 → 브라우저가
  자원 경고를 console 로 낸다. 측정판 코드의 출력이 아니다 (필터 `fromMeasureBoard` 가 vite · React DevTools 만 걸러 브라우저 자원 경고를 섞는다).
  인계 H4-12 의 "재사용 서버에서 4/4 실패" 와 "새 서버 3/3 통과" 모두 이 메커니즘으로 설명된다 (그 세션은 단위마다 `pnpm build` 를 돌렸다).
판정 영향: 없음 — 게이트 조건(Playwright 가 띄운 새 서버)에서 2회 연속 통과했고, 요구(측정판이 console 을 내지 않는다)는 충족된다.
Finding 으로 올리지 않은 이유: 제품 결함이 아니고 AC 미충족이 아니다. 단 "로컬 기본 설정 + 직전 `pnpm build`" 에서 결정적으로 실패하므로
  AC-4-103 재현성을 해친다 → 권고(수정 지시 아님): 단정을 측정판 출처 메시지로 좁히거나(예: `message.location().url` 이 측정판 모듈인 것만)
  브라우저 자원 경고(`was preloaded using link preload`)를 근거 주석과 함께 제외. dev 서버에서 HMR 뒤 Inter 가 unloaded 가 되는 것은
  dev 전용 현상이며 Production(정적 빌드)에는 HMR 이 없다 — Apple 기기는 system 폰트가 먼저라 화면 차이 없음. Orchestrator 가 Finding 으로 승격할지 결정할 수 있다.
```

## R2-6. NOT VERIFIED 항목과 수동 테스트 절차 (2회차 갱신 — 1회차 §6 대체)

`D4-143`: 4건 모두 사용자 수동 확인. 결과(브라우저·버전·OS·기기·회차·스크린샷)를 첨부하면 QA 가 PASS 로 바꾸고, 수동 확인 없이 받아들이려면 항목별 명시 수용(`PASS (accepted: NV-4B-n)`)이 필요하다. iOS 의 마이크는 **HTTPS 에서만** 열린다(사용자 기기 서버 5174 사용).

### `NV-4B-1` — AC-4-50 녹음 시작 지연 ≤ 1s
- 도구: dev 측정판 **`/__dev/ui/recording-measure`** 섹션 "⑧ 녹음 시작 지연 · ⑨ 판정 스트림 (S4-H4)" (AC-4-154 — 제품 `WebRecorderAdapter` 경로).
- 절차: ① 브라우저마다(데스크톱 Chrome · 데스크톱 Safari · iOS Safari) 사이트 마이크 권한을 **먼저 허용**(프롬프트 시간이 섞이지 않게 — 화면 안내와 같음) ② `⑧ 녹음 시작 지연 1회 (n/5)` 를 5번 누른다 ③ 표의 두 끝점(탭 → `start` 이벤트 · 탭 → 첫 `dataavailable`)과 끝점별 **중위값**을 기록 ④ 화면의 UA · `mimeType` · `timeslice 1000 ms` 와 함께 스크린샷 ⑤ 다음 브라우저 전 `⑧ 기록 지우기`.
- 판정 끝점: Plan `N4B-39` 결정을 따른다(`start` 이벤트 기준이면 첫 `dataavailable` ≈ 1s+ 는 참고값). 측정판은 두 값을 모두 보여 준다.
- 함께 1회(비차단, `QA-4B-003` 4단계): 같은 브라우저 일반 창에서 녹음 → Submit → 완료 화면 `Recording submitted` Toast 가 몇 초 안에 사라지고 스티커가 들어오는지 육안 확인.

### `NV-4B-2` — AC-4-68 ③ iOS Safari 전화 수신 (`MediaStreamTrack.onended`)
- 절차 (변경 없음): iPhone Safari(iOS ≥ 16, `D4-83`) → Mock 프리뷰에서 녹음 시작 → 다른 기기로 전화 걸어 수신 → 통화 종료 후 앱 복귀 → paused(`Tap to resume`) · 경과 시간 고정 · `Submit` 시 그때까지 녹음 제출(로컬 청크 유실 0 — 측정판 청크 수) 확인.

### `NV-4B-3` — AC-4-146 판정 스트림 해제 (마이크 표시등)
- 도구: 측정판 **`⑨ 판정 스트림 관측`** (AC-4-155 — 실제 `resolveSessionMode` 호출).
- ⚠️ **전제: 사이트 마이크 권한을 "묻기(Ask)" 로 먼저 되돌린다.** 권한이 이미 허용·차단이면 `resolveSessionMode` 는 권한 상태만 읽고 **스트림을 열지 않는다**(제품 동작) — 화면이 "판정이 마이크를 열지 않았다 — 권한을 '묻기'로 되돌린 뒤…" 를 표시하며, 그 상태의 결과는 증거가 아니다. Chrome: 주소창 사이트 정보 → 마이크 → 묻기(또는 "권한 재설정") · Safari(macOS): 설정 → 웹사이트 → 마이크 → 묻기 · iOS Safari: 주소창 `ᴀA` → 웹 사이트 설정 → 마이크 → 묻기.
- 절차: ① 권한 "묻기" 로 초기화 후 페이지 새로고침 ② `⑨ 판정 스트림 관측` → 프롬프트에서 허용 ③ 결과의 열린 스트림 수 ≥ 1 · 반환 직후 / +1s 트랙 `readyState`(+1s 에 전부 `ended`) · 판정 `recorded` · `감싸기 원복 yes` 기록 ④ **OS·브라우저 마이크 표시등이 +1s 안에 꺼지는지** 육안 확인 ⑤ 이어서 실제 앱에서 Start Session → Record 탭 → 녹음 시작 + **재프롬프트 여부**(R4B-16, 특히 Safari) 기록. 재프롬프트가 나오면 `N4B-29` 재결정 대상. 데스크톱 Chrome · 데스크톱 Safari · iOS Safari 각 1회.

### `NV-4B-4` — AC-4-99 ② iOS Safari 짧은 세로 · `VG-K1-05`
- 절차 (변경 없음): iPhone(393 폭) Safari recording 화면 → 툴바 표시/숨김 각각에서 메달리온 지름(136/190) · 팝업↔Record 간격 · `Submit` 도달(스크롤) → 목록 끝 터치가 화면 스크롤로 이어지는지 → 팝업 밖 드래그 시 닫힘 → 툴바 변화로 702 경계를 넘나들 때 레이아웃 점프 관찰.
- (참고) 데스크톱 클래식 스크롤바 부분은 2회차에서 PASS — 이 항목은 iOS `dvh` 만이다.

## R2-7. BACKEND_INTEGRATION_PENDING 목록 (2회차)

1회차 §7 의 11행 유지 + 아래 2행. 1회차 ⚠️(`P4B-BIP-01`·`04`·`05` 미등재, `OBS-4B-3`)는 **해소** — `docs/API_CONTRACTS.md` Rev 8.12 에 `P4B-BIP-01`·`04`·`05` · `CreateSessionRequest.mode` 문단 등재 확인(grep 각 ≥ 1), Rev 8.13 에 신규 Mock key 2 반영.

| 항목 | 대기 사유 | Handoff 대상 문서 |
|---|---|---|
| AC-4-35 [BE] `P4B-BIP-07` | 서버 `SESSION_ALREADY_ACTIVE` 판정 + 탭·기기가 사라져 끝나지 않은 `recording`/`paused` 세션이 새 세션을 무기한 막지 않도록 정리 규칙(48h · 14일 `D4-29` 와 충돌 금지) | `BACKEND_HANDOFF` · `ERROR_CODES` · `DATA_REQUIREMENTS` (`API_CONTRACTS.md` 등재 확인) |
| AC-4-36 [BE] `P4B-BIP-08` | 서버 `ONBOARDING_INCOMPLETE` 판정 + 그 시점 `GET /v1/me` `onboardingStatus` 가 `completed` 가 아닐 것 | `BACKEND_HANDOFF` · `ERROR_CODES` (`API_CONTRACTS.md` 등재 확인) |

## R2-8. Regression 결과

| 항목 | 결과 |
|---|---|
| 단위 전체 | `pnpm test` **173 files / 2513 tests** 통과 (1회차 171/2488 + H4 신규 25) |
| e2e 전체 (단독) | **1회차 558/558 (12.3m) → 2회차 558/558 (12.4m)**, 연속 · 실패 0 · project 2(`chromium` 541 + `chromium-classic-scrollbar` 17) |
| Stage 1~3 핵심 경로 (AC-4-101) | `auth` · `consent` · `onboarding` · `home` · `library` · `tabs` · `scenarios` · `visual` · `a11y` · `responsive` · `shadow` · `toast` 등 전부 2회 통과 (1회차 때 언급된 `onboarding.spec.ts:184/226` 간헐 실패 재현 0) + 클래식 스크롤바 Welcome·온보딩 첫 화면·Home·Library 회귀(AC-4-99 ③) |
| 4a 판정 유지 | 4a 로직 테스트 전부 통과 — 4a `PASS (accepted: D4-34, NV-4A-1)` 근거 불변 |
| Scope | `apps/api` · `supabase` · `apps/mobile` 부재 · Backend 런타임 코드 0 · `packages/contracts` 변경 0 |
| Architecture | `lint:boundaries` 위반 0 · 시작 차단 판단은 `entities/session/useCreateSession`(Query/Mutation 층), 문구 선택은 `shared/copy`, feature 는 결과 표시만 · Page 변경 0 · Mock 분기는 `mocks/` 안(`onboardingState.markServerIncomplete`) · prod 코드에 Mock id·시나리오 key 0 |
| Privacy / Security | 변경 prod 코드 `console.` 0 · 측정판 트랙 `label`(장치 이름) 미표시 · 측정판 Production 제외 · `VITE_*` 3종 · dist secret 0 · 제3자 SDK 0 · 동의 없음 차단 경로(AC-4-62·134) 근거 테스트 통과 |
| Design System | 변경 CSS/TSX 의 HEX = 주석만 · arbitrary 0 · 신규 토큰 0 (`AppColumn.css` · `SpeechBubble.css` 는 기존 토큰 `--layout-min-width` · `--space-2` · 컴포넌트 지역 변수) · Visual Gap `stage-4b-visual-gap-h4.md` GAP 0 (VG-H4-09 → `D4-147`·`D4-148`) |
| baseline | 재생성 0 |
| 가값 | 1회차 §8.1 목록 변동 없음 (`OBS-4B-5` P-26·P-27 gallery 미등재 — 그대로, FAIL 사유 아님) |

### R2-8.1 사용자 결정·수용이 필요한 항목
1. `NV-4B-1` ~ `NV-4B-4` — §R2-6 절차로 수동 확인 후 결과 전달, 또는 항목별 명시 수용. 이것만 남아 있다 (`INCOMPLETE` 사유 전부).
2. (선택) `OBS-4B-9` — Finding 승격 여부 / 테스트 보강 여부 결정.

## R2-9. 2회차 보충 (Addendum) — `OBS-4B-9` 재검증 · 단위 간헐 실패 (2026-11-07 17:25 – 17:50 KST)

증거 = `docs/qa/evidence/stage-4b/r2-9/`. Product·테스트 코드 수정 0 · 커밋 0. 4319 는 QA 소유 dev 서버(PID 97482/97502)만 사용 후 종료(LISTEN 0) · 5173 미사용 · 5174(PID 29863) 미접촉 · design-tokens 재빌드 **1회**. 부하 생성용 `yes` 프로세스는 QA 가 띄운 것만(PID 기록) 종료, 잔여 0.

### R2-9.1 `OBS-4B-9` 재검증 — 사용자 결정 `D4-149` 로 승격·수정 (테스트만, 인계 H4-13)

| 확인 | 판정 | 증거 |
|---|---|---|
| (a) 2회차 재현 절차(4319 dev 서버 재사용 + 실행 중 design-tokens 재빌드)에서 수정된 spec 통과 | **PASS** | 재빌드 전 1/1 통과(`cmd-spec-reuse-before-rebuild.log`) → `pnpm --filter @haru/design-tokens run build`(서버 로그 `hmr update` 3건, `qa-own-devserver.log`) → **3/3 통과**(`cmd-spec-reuse-after-rebuild-{1,2,3}.log`). 재현 조건이 실제로 성립했음을 필터 없는 관측 spec 으로 같은 상태에서 확인: 재빌드 전 경고 0 · `Inter:loaded` / 재빌드 후 `warning … inter-latin-wght-normal.woff2 was preloaded using link preload …` · `url=…/__dev/ui/recording-measure line=0 col=0` · `Inter:unloaded` (`observer-before-rebuild.txt` · `observer-after-rebuild-{1,2}.txt`) — 즉 통과는 "경고가 안 나서"가 아니라 "경고를 걸러서"다 |
| (b) 필터가 측정판 출력은 여전히 잡는다 | **PASS** | 트리를 바꾸지 않는 방법: spec **사본**(`obs9-injected.spec.ts`)에 `page.route` 로 Vite 가 서빙하는 `RecordingMeasurePage.tsx` 모듈 응답 끝에 `console.warn('QA-R2-9 injected measure-board output')` 1줄을 붙인다 — 메시지 발신 위치 = 측정판 모듈(실제 줄 번호). 사본과 원본 차이 = import 경로 1줄 + 주입 6줄뿐, `fromMeasureBoard` 본문 동일(`injected-vs-spec.diff`). 결과: 재빌드 전 **실패**, 재빌드 후 **실패** — 수신 배열 = `["warning: QA-R2-9 injected measure-board output"]` **1건만**(같은 실행에서 preload 경고는 제외됨) (`cmd-injected-{before,after}-rebuild.log`). `page.evaluate` 는 위치가 달라 쓰지 않았다 |
| (c) 제품 코드 변경 없음 | **PASS (한계 기록)** | 실험 전후 `git status --porcelain -uall` 동일(`git-status-before.txt` ↔ `git-status-after.txt`, r2-9 증거 폴더 제외) · `sha256` 3파일(spec · `RecordingMeasurePage.tsx` · `playwright.config.ts`) 전후 일치(`sha-before.txt`). 2회차 증거(15:41) 이후 mtime 이 바뀐 소스는 `e2e/recording-measure.spec.ts` 와 `apps/web/src/dev/recording-measure/RecordingMeasurePage.tsx`(17:05 — 구현자의 임시 주입·원복) **2개뿐**(apps · packages · e2e · config 스캔). 후자는 구현자 백업 `scratchpad/RMP.bak`(17:04)과 `cmp` 동일 · `OBS-4B-9`/`TEMP` 문자열 0. ⚠️ 한계: QA 는 2회차에 이 파일 해시를 남기지 않았다 — "2회차 상태와 동일"의 근거는 백업 cmp + mtime 스캔이다. 파일은 dev 전용(Production 제외, `assert:no-mocks`) |
| 남은 사각 (기록) | — | 필터는 `url === 문서 URL && line 0 && col 0` 인 메시지를 모두 제외한다. 측정판 스크립트의 `console.*` 는 모듈 위치를 갖으므로 이 조건에 들지 않는다(위 (b)). 문서(HTML) 자체의 인라인 스크립트 출력은 이론상 같은 위치를 가질 수 있으나 측정판은 인라인 스크립트가 없다. `[vite]`·`React DevTools` 문구 제외는 기존 그대로 |

**`OBS-4B-9` 판정: 해소 (PASS)** — AC-4-154 ④ "console 0" 단정이 로컬 재빌드 조건에서도 결정적으로 통과하고, 측정판 출력 검출력은 유지된다.

### R2-9.2 단위 간헐 실패 — `session-recording.test.tsx` › "Submit 두 번 → completed 요청 1건" → **Finding `QA-4B-005` (Low)**

```
QA-4B-005 | Severity: Low (테스트 견고성 — 제품 결함 근거 없음)
Requirement: Regression "전체 테스트 스위트 통과" (rules/qa.md §5) · AC-4-101/AC-4-103 재현성
Steps to reproduce:
  1. 기기 부하를 올린다 — QA 재현: `yes > /dev/null` 8개(8코어) 띄운 채 `npx vitest run`(전체) 2회
  2. 2회차 실행에서 `session-prompts.test.tsx` 2건 실패(`unit-full-stress-2.log`):
     "열기 · 닫기 동안 navigator.vibrate · HTMLMediaElement.play 0회" 1849ms ·
     "137 ①④ See all = <button aria-haspopup="dialog"> …" 1839ms
Expected: 전체 스위트가 부하와 무관하게 통과
Actual: Orchestrator 로그(17:21, 60.8s — 평소 40~42s, 해당 파일 19.4s — 평소 10~11s)와 QA 재현이 **같은 서명**:
  `openReady` 의 마지막 `await screen.findByRole('button', { name: 'Start recording' })`(기본 timeout 1000ms)에서
  `Unable to find`, DOM = `/session/<id>` 의 `haru-session--pending` Spinner(세션 상세 query 대기 중)
Evidence (원인 판별):
  - 같은 openReady 절차를 대기만 15s 로 늘린 QA probe(`unit-probe/pending-latency.probe.test.tsx`, 트리 밖 config) —
    Reading Context 확인 → `Start recording` 등장까지: 유휴 85~155ms(25/25) · 전체 스위트+CPU 부하 동시 **284~964ms**(25/25).
    **25/25 모두 결국 도달**(멈춤 0, 매번 pending Spinner 거침) → 무한 대기(제품 hang)가 아니라 **지연이 1000ms 예산에 근접**한 것
  - 전이 중 Mock 은 즉시 타이머(`createImmediateTimer`) · query `retry: false` — 시간 의존 경로 없음. 같은 파일 QA 단독 6회(유휴 1 · CPU 부하 5) 전부 통과(Orchestrator 단독 5/5 와 일치),
    대상 테스트 단독 271ms → 부하 단독 516~691ms → 전체 스위트 264~659ms → 부하+전체 692~836ms(통과분)
  - 공유 상태·순서 원인 근거 없음: vitest 파일 격리 기본값 · 실패 위치가 매번 다른 테스트(같은 helper)이며 결정적 순서에서 간헐적
  - 빈도: 일반 전체 실행 QA 3/3 통과 · 부하 전체 실행 1/3 실패(다른 파일, 같은 helper) · Orchestrator 일반 실행에서 1회 관측(당시 load avg ≈ 14/8코어)
Suspected area (수정 지시 아님): 세 파일의 `openReady` helper (`session-recording` · `session-prompts` · `session-exceptions` .test.tsx) —
  세션 생성 mutation → 라우팅 → 상세 query → recorder 준비가 **하나의 기본 1000ms findBy 창**에 들어 있다
Rerun 만으로 PASS 처리하지 않는다 — 재현했고 기전이 측정됐다.
```

판정: Regression "전체 테스트 스위트 통과" = **PARTIAL** (일반 부하 통과 · 높은 부하에서 간헐 실패 재현). 제품 AC 판정 변경 없음(실패는 테스트 대기 예산이며, AC-4-50 시작 지연은 실제 브라우저 측정 대상 — jsdom 시간 아님).

### R2-9.3 Stage Verdict (보충 후)

**`INCOMPLETE`** — `FAIL` 0 · `PARTIAL` **1** (`QA-4B-005` Low, Regression) · `NOT VERIFIED` 4 (`NV-4B-1`~`4`, 실기기). 다음 Stage 진입 불가. 해소 경로: development-agent 가 `QA-4B-005` 수정 → QA 재검증(부하 재현 절차 그대로) 또는 사용자 항목별 수용 `PASS (accepted: QA-4B-005, NV-4B-…)`.

---

# 1회차 기록 (2026-11-05, 보존)

## 1. Summary

| 항목 | 값 |
|---|---|
| **Stage Verdict** | **`FAIL`** — `FAIL` 3건 (`QA-4B-001` Medium · `QA-4B-002` Medium · `QA-4B-004` Low) + `PARTIAL` 1건 (`QA-4B-003` Low). FAIL 이 없었다면 `INCOMPLETE` — `PARTIAL` 1 · `NOT VERIFIED` 3 AC (`NV-4B-1`~`NV-4B-3`) + AC-4-99 의 iOS 부분(`NV-4B-4`) |
| 실행 일시 | 2026-11-05 01:05 – 02:05 KST |
| 대상 상태 | `main` @ `2ba2cd8` + 미커밋 변경(세션 시작 시 `git status` 80항목 — S4-H2 ~ S4-G2MF 구현·테스트·문서) |
| 판정 집계 | 정본 79건: **PASS 74** · **PARTIAL 1** (AC-4-103) · **FAIL 1** (AC-4-99) · **NOT VERIFIED 3** (AC-4-50 · 68 · 146 — 각 AC 의 Frontend 실행 가능 부분은 PASS, 실기기·실브라우저 부분만 NV) / 정본 밖 판정 12건(걸침 화면 부분 10 + AC-4-46 화면 · AC-4-109): **PASS 10 · FAIL 2** (AC-4-35 · 36 화면) / **합계 91: PASS 84 · PARTIAL 1 · FAIL 3 · NOT VERIFIED 3** · `BACKEND_INTEGRATION_PENDING` 분할 행 11 |
| `BACKEND_INTEGRATION_PENDING` | 분할 행 11 (§7) — Contract·Mock 결함으로 PENDING 처리한 것 0 |
| 판정 대상 아님 | AC-4-23 화면 = Stage 7 (`D4-40`) · AC-4-108 = 4a `NOT VERIFIED (accepted: NV-4A-1)` 유지 (`D4-111`) |

**핵심 결론**: 4b 정본 79건 중 74건이 직접 실행한 증거(명령 8종 · 단독 e2e 2회 · QA 독립 프로브 · 단위 프로브 1건 · Figma 직접 대조)로 충족된다 — 세션 화면 · Prompts 팝업/Drawer · 완료 화면 · 예외 안내 · Start Session 권한 판정 · 업로드/보관 안내.
- **FAIL 2건(Medium)은 정본 밖 "4a/4b 걸침 화면 부분"** — 상위 Plan(`stage-4-plan.md` 1553행)이 4b 에서 판정하라고 한 AC-4-35(진행 중 세션 복귀)·AC-4-36(세션 endpoint `ONBOARDING_INCOMPLETE` → 온보딩 이동) 화면 경로가 없다. 4b Plan rev 1.5 §13 단위표에 배정되지 않은 계획 공백이다.
- **FAIL 1건(Low)** — AC-4-99: 데스크톱 클래식 스크롤바 환경에서 320×≤627 세션 화면 가로 넘침 15px 재현 (design-agent `VG-K1S-04` 가 "Stage 8 이월" 로 적었으나 사용자 수용 기록 없음).
- **PARTIAL 1건(Low)** — AC-4-103: 단독 e2e 2회 모두 531 중 1건씩 실패(서로 다른 테스트, 같은 증상 = Toast 가 퇴장하지 않음). 재실행하면 통과하고, 실패 시 페이지 타이머가 멈춘 정황(rAF 루프를 넣으면 35/35 통과)이라 headless 환경 요인일 가능성이 높으나 확정하지 못했다.
- 남은 NOT VERIFIED 3 AC(+ AC-4-99 iOS 부분)는 실기기·실브라우저가 필요하다.

---

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (25F71), darwin arm64 |
| Node / pnpm | v24.21.0 / 12.4.2 |
| Playwright | 1.63.0 (번들 Chromium) — `workers: 1`, 포트 4319(config), **단독 실행**(시작 전 Playwright·vite 프로세스 0 확인, 포트 5173 미사용, 다른 프로세스 kill 0) |
| QA 프로브 | `docs/qa/evidence/stage-4b/qa-4b.probe.spec.ts` + `qa-4b.config.ts` (기본 config 상속, testDir 만 변경) — e2e 전체 실행이 끝난 뒤 단독 실행 |
| Figma | MCP `get_screenshot` (fileKey `YWWu3AFEJpRxvw0T5klq0k`, sessionId `e76ceca0-…`) — `298:1262` · `296:1210` · `29:62` 393×852 렌더. `298:1262` MD5 `6d192d84…` = Visual Gap final §11.2 캐시와 동일 → 2026-11-01 이후 Figma 변경 0 재확인 |
| 기기 | 실기기 없음 (iOS Safari · 데스크톱 Safari · Android · VoiceOver 미실행) |
| Mock 시나리오 | URL `?scenario=<group>[.<method>]:<key>` · 기기 seed(`D4-123`) · 요청 로그 `__HARU_MOCK_REQUEST_LOG__`(DEV) |

---

## 3. Commands Executed

| # | 명령 | 결과 | 로그 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | ✅ exit 0 | `cmd-install_--frozen-lockfile.log` |
| 2 | `pnpm typecheck` | ✅ exit 0 (root · e2e · 패키지) | `cmd-typecheck.log` |
| 3 | `pnpm lint` | ✅ exit 0 | `cmd-lint.log` |
| 4 | `pnpm lint:boundaries` | ✅ no dependency violations (**791 modules**, 2991 deps) | `cmd-lint_boundaries.log` |
| 5 | `pnpm test` | ✅ **171 files / 2488 tests** passed (40.1s) | `cmd-test.log` |
| 6 | `pnpm build` | ✅ exit 0 (chunk size 경고만 — 기존) | `cmd-build.log` |
| 7 | `pnpm format:check` | ✅ All matched files use Prettier code style | `cmd-format_check.log` |
| 8 | `pnpm assert:no-mocks` | ✅ MOCK·DEV sentinel 0 · `haru-dev-` 0 · sharp 흔적 0 (dist 4파일) | `cmd-assert_no-mocks.log` |
| 9 | `pnpm test:e2e` (**단독**, 1회차) | ❌ **530 passed · 1 failed (17.3m)** — 실패 `session-notices.spec.ts:365` (`QA-4B-003`) | `cmd-e2e-run1.log` · `flake-run1/` |
| 9b | `pnpm test:e2e` (**단독**, 2회차) | ❌ **530 passed · 1 failed (15.5m)** — 실패 `session-regression.spec.ts:351` (AC-4-97 완료 화면 — 전제 단계 "제출 Toast 가 8초 안에 사라짐" 에서 실패). 1회차 실패 테스트 `session-notices.spec.ts:365` 는 2회차 통과 | `cmd-e2e-run2.log` · `flake-run2/` |
| 10 | 실패 테스트 **단독 재실행** | `session-notices.spec.ts:365` `--repeat-each=5` → **5/5 통과** · `session-regression.spec.ts:351` `--repeat-each=5` → **4/5 (1 실패, 같은 증상)** | `cmd-e2e-rerun-notices365.log` · `cmd-e2e-rerun-regression351.log` · `flake-solo/` |
| 11 | QA 독립 프로브 P1~P11 (단독) | 13건 실행 — P1·P2·P3·P4/P5·P6(3)·P9·P10·P11(2) 통과, **P8 실패 = 결함 재현(`QA-4B-002`)**. P7 은 첫 실행에서 단정이 느슨해 통과(버튼 `Continue` 가 정규식 `continue` 에 걸림) → 단정 정정 후 재실행 **실패 = 결함 재현(`QA-4B-001`)** | `cmd-qa-probe.log` · `cmd-qa-probe-p7.log` · `qa-p7-*.png` · `qa-p8-*.png` |
| 11b | QA 프로브 P6 — 클래식 스크롤바 (`--hide-scrollbars` 제거 config) | 320×568 **실패 = 결함 재현** (뷰포트 스크롤 박스 `clientWidth 305 · scrollWidth 320`) · 320×852 · 1024×500 통과(1024×500 은 컬럼 중심 504.5 = 7.5 이동) | `qa-4b-scrollbar.config.ts` · `cmd-qa-probe-scrollbar.log` |
| 11c | QA 프로브 P12 — Submit 후 완료 화면 Toast 수명 + 페이지 타이머 심장박동 | v1(심장박동만) 10회 중 **1회 재현**: Toast `closing` 진입(+4042ms) 뒤 언마운트 안 됨 · 그 순간부터 `setInterval` 정지(심장박동 20/40). v2·v3(rAF 루프·MutationObserver·longtask 계측 추가) **35/35 통과** | `cmd-qa-probe-p12.log` · `-p12b.log` · `-p12c.log` |
| 11d | vitest 단위 프로브 — AC-4-124 ③ | ✅ 1/1 | `qa-unit/` · `cmd-qa-unit.log` |
| 12 | Scope: `ls apps packages` · `ls -d apps/api supabase apps/mobile` | `apps/` = `web` · 3경로 전부 No such file · `git ls-files` migration/sql/express 0 | `grep-scope-hex.log` |
| 13 | grep 묶음 (HEX · rgb · arbitrary · inline style · any · console · Secret · SDK · Mock 리터럴 · 금지 문구) | 아래 Matrix 증거 열 | `grep-design.log` · `grep-security.log` · `grep-arch-mock.log` · `grep-ac-misc.log` |
| 14 | `grep -E "test\.fail\|test\.skip\|\.only\(\|fixme"` (e2e · src · packages) | **0건** — 인계 `# S4-K2` K2-3/K2-4/K2F "`test.fail` 1~2건" · `# S4-G2M` G2M-5 "`test.fail` 4" 는 **오기**로 확정 (`VG-FIN-01` · `VG-G2M-02`) | — |
| 15 | Figma 대조 (QA 직접) | `298:1262` ↔ `s4-session-recording` · `296:1210` ↔ `s4-session-prompts` · `29:62` ↔ `s4-session-complete` 나란히 비교 — 배치·요소 구성 일치. 차이는 iOS 상태바(앱 밖) · Mock 책/Prompt 데이터 · `AD-S4-1`(스티커 부제) · Stage 5 회고 카드 영역(의도적 빈 영역, AC-4-104) 뿐 | `figma/sbs-recording.png` · `sbs-prompts.png` · `sbs-complete.png` (왼쪽 Figma · 오른쪽 baseline) |

---

## 4. Requirement Matrix

판정 범위 표기: **[FE]** Frontend 부분 · **[BE]** Backend 분할 행 · **[unit]** jsdom 컴포넌트/단위 테스트(실제 Mock 번들 조립) · **[e2e]** Playwright Chromium.
"e2e: `파일` › 제목" 은 이번 1회차 단독 실행에서 통과한 테스트다. unit 은 `pnpm test` 2488 통과 중 해당 describe 이다.

### 4.1 Scope · 공통

| 항목 | 판정 | 증거 |
|---|---|---|
| Backend 코드 미생성 | **PASS** | `ls -d apps/api supabase apps/mobile` → 3건 No such file · `apps/` = `web` · `git ls-files` migration/sql/supabase/express 0 (`grep-scope-hex.log`) |
| `apps/mobile` 부재 (Stage Exit 조건, `D4-1`) | **PASS** | 동일 |
| Out of Scope 선행 구현 0 | **PASS** | 회고 카드 `91:691` · 분석 상태 · 피드백 · `/settings/notifications` 0 — 완료 화면 y 468 아래 렌더 요소 0 (e2e AC-4-61·104) · router 에 reflection/feedback route 0 · 업로드 배지 `UploadStatusBadge` 0 (`N4B-30` ⓐ) · 팝업 pill 탭 → Drawer 해당 페이지 동작 0 (`N4B-18` ③) · ready 에 책 칩·Prompts 칩·상태 블록 0 (AC-4-136 ⑤) · Capacitor 0 |
| `test.fail` · `skip` · `.only` · `fixme` | **PASS** (0건) | grep e2e · src · packages = 0. 인계 오기(`VG-FIN-01`·`VG-G2M-02`) 확인 |

### 4.2 `S4-F1` 진입 · ready (15) + `S4-F1R`

| AC | 판정 | 증거 |
|---|---|---|
| 38 | **PASS** | e2e `session.spec.ts` › Reading Context 키보드 · 모든 세션 진입 경로(`startSession`)에서 `POST /v1/sessions` 1건 · unit `session-permission.test.tsx` "재탭 → 생성 1건"(Home · 서재) · baseline `s3-home*` Start Session 활성(재생성 근거 F1-6 B) |
| 39 | **PASS** | e2e 전 세션 spec 의 `startSession()` — `/session/:id` + `Start recording` 가시 (수십 건 통과) |
| 40 | **PASS** | e2e `session.spec.ts` › AC-4-120·121·122 높이 식 10케이스 · ready 기하 `300:1309` · baseline `s4-session-ready` · grep: pill 문구 Mock fixture 밖 0 · `88:757` 교체 0 |
| 46 (화면, `S4-F1R`) | **PASS** | unit `session-ready.test.tsx` "AC-4-46 화면" ①~④ (주입 clock · 제목 글자 변화 1회 · `reminder-missing` DOM 동일 · 10분 abandoned) · unit `SessionReadyBubble.test.tsx` · `recording-controller.test.ts` "리마인드 정확히 1회 → 600초 abandoned" · baseline `s4-session-ready-reminder` · grep `Ready when you are` = `mocks/` 밖 0 |
| 46 [BE] | `BACKEND_INTEGRATION_PENDING` | 리마인드 문구 생성 `P4-BIP-11` |
| 86 | **PASS** | e2e `session.spec.ts` › "키보드: Enter 로 열고 · 첫 포커스 시트 안 · Escape → Start Session 복귀" · baseline `s4-reading-context-sheet` · `prompt-drawer-close.spec.ts` › bottom variant 닫힘 |
| 110 | **PASS** | ① `IconButton.css:57` `.haru-icon-button--glass { box-shadow: var(--shadow-bubble) }`, `--shadow-rest` 참조 0 ② glass 변형 정의 1곳 — `<IconButton` 38곳/24파일(4b 신규 닫기 등 포함, 전부 같은 클래스) ③ 커밋 `9f759bb` 메시지 "Baselines regenerated with every cluster attributed" + 인계 F1-6 클러스터 분해 표(18+7+5+1=31, 설명 안 된 클러스터 0, `--update-snapshots=all`) ④ 이번 단독 e2e 통과 · 재생성 0 |
| 111 | **PASS** | e2e `session.spec.ts` › AC-4-111·117 "opacity 0.5 · 면/라벨 동일 · 포커스 가능 · 사유 연결 · 요청 0" · "Record → 같은 노드 Pause · 재마운트 0" |
| 117 | **PASS** | 위 e2e + `Button.css:151-173` 비활성 = `opacity` + 기존 그림자뿐(색·테두리 선언 0). ④ 기록: `opacity .5` 가 `Submit` 흰 라벨 대비를 `D-01` 의 2.07:1 **아래로 낮춘다** — WCAG 1.4.3 비활성 제외 조항, FAIL 아님 |
| 118 | **PASS** | e2e `session.spec.ts` › AC-4-118 320/393/480 "좌우 여백 같고 우측 잘림 0" · `AD-S4-5`·`10` 등록(대장 §4) |
| 119 | **PASS** | `primitive/color.css:73` `--haru-gray-2` · `semantic/color.css:98-100` neutral 쌍 · `provisionalItems.ts:200` `P-25` · `gallery-helpers.test.ts:81` 대기 목록 · 화면 코드 `#aeaeb2` 0 · glass 버튼 baseline 불변 |
| 120 | **PASS** | e2e AC-4-120 묶음(1줄 clamp 320/393 ≤22) · grep `Try this prompt !`(공백) 0 · 팝업 `Try this prompt!` 는 `D4-55` 범위 밖(AC-4-120 수정판) |
| 121 | **PASS** | e2e "인사 없음 → 정확히 28 짧아진다" · baseline `s4-session-ready-no-greeting` · fallback 문구 0 |
| 122 | **PASS** | e2e 10케이스 "측정 높이 = 식" · "n = 0 → 버블 미렌더" |
| 123 | **PASS** | e2e `session.spec.ts` › "오프라인 캐시: aria-disabled · opacity .5 · 사유 = 배너 제목 · 요청 0" |
| 124 | **PASS** | ① unit `session-ready.test.tsx` "AC-4-123·124" Save `aria-disabled` 없음 ② 커밋 `9f759bb` 한 커밋에 `D-3` 해제(`ActivityCardDeck.tsx`)와 `InlineAlert` `titleId` 동시 ③ **QA 독립 단정** `qa-unit/ac-4-124.probe.test.tsx` — offline-cached → 조회 성공 전환 시 배너 사라짐 · Start Session `aria-disabled` 해제 · `aria-describedby` dangling id 0 (구현자 테스트에 없던 전환 단정, `cmd-qa-unit.log` 1/1) ④ 캐시 없는 offline 덱 안내 기존 e2e `home.spec.ts` 통과 |
| 136 | **PASS** | e2e `session.spec.ts` › AC-4-136 "확인 없이 abandoned 1건 → `/` · 닫기 터치 44" · "실패하면 화면에 머물고 Toast" · ready 기하 닫기 (331,66) |

### 4.3 `S4-F2` recording · paused (15)

| AC | 판정 | 증거 |
|---|---|---|
| 41 | **PASS** | unit `session-recording.test.tsx` "AC-4-41·112·125" — 같은 노드 Pause · 바 활성 · `Done Reading` 0 · grep `Done Reading` 제품 코드 0 |
| 42 | **PASS** | e2e `session-recording.spec.ts` › paused `298:1340` "Record = `Tap to resume`" · "Submit: 전이 recording·paused·recording·completed" · grep 하단 바 `Resume` 버튼 0 |
| 50 | **NOT VERIFIED** → `NV-4B-1` | 측정 대상 = 실기기(데스크톱 Chrome·Safari·iOS Safari) 실제 마이크 5회 중위값 — 이 환경에서 실행 불가. e2e 는 MockRecorderAdapter 라 대상 아님. 화면 경로(탭 → `start()`)는 AC-4-51 로 PASS |
| 51 | **PASS** | e2e `session-recording.spec.ts` › "AC-4-51 — 상태 전환(로컬) ≤ 1s: 시작 · 일시정지 · 재개" |
| 112 | **PASS** | unit "AC-4-41·112·125" (전이 `ready→recording` 1건) · e2e Submit 경로 전이 목록 |
| 113 [FE] | **PASS** | e2e "Discard: 다이얼로그 → 취소(요청 0) → 확인 → abandoned 1건 → `/`" · unit "AC-4-113·115·116" · 4a 로직 PASS 유지(`recording-runtime.test` ②③⑤) |
| 113 [BE] | `BACKEND_INTEGRATION_PENDING` | `P4-BIP-21` |
| 114 | **PASS** | e2e "Submit: … completed(user_done) · Toast · 완료 경로" · unit "AC-4-114" |
| 115 | **PASS** | unit "AC-4-113·115·116" (먼저 다이얼로그 · 요청 0 · `Dialog` 재사용 · Escape · role) · e2e Discard 경로 · baseline `s4-session-discard-dialog` · 문구 `D4-65` 승인 |
| 116 | **PASS** | unit 취소 경로(요청 0 · 청크·큐 불변 · 상태 유지 · 포커스 Discard) · e2e "취소(요청 0)" |
| 125 | **PASS** | e2e `session-recording.spec.ts` › "Figma 좌표 (AC-4-125)" · "선언값 computed" · baseline `s4-session-recording`(+320) · QA Figma 나란히 비교(§3 #15) · 책 칩 가운데 = `AD-S4-13` |
| 126 [FE] | **PASS** | e2e "책 칩 예외" — `book-missing` 칩 0 · 상태 블록 y 불변(344) · 320/393 `book-long-title` 1줄 말줄임 |
| 126 [BE] | `BACKEND_INTEGRATION_PENDING` | `P4B-BIP-01` |
| 127 | **PASS** | unit `formatSessionClock` `mm:ss` · paused 고정 · e2e paused "시간 secondary" · `AD-S4-19`(tabular-nums) 등록 |
| 128 | **PASS** | unit "paused: 텍스트 `Paused` + 빈 dot" · e2e "모션 배분 … reduce 면 0" |
| 129 | **PASS** | e2e "닫기(recording) = 같은 다이얼로그 · 취소 → 포커스 닫기" · **QA 프로브 P2** — 전이 `[recording, abandoned]` · abandoned 1건 · URL `/` (QA-P2) · `AD-S4-15` 등록 |
| 138 | **PASS** | e2e `s4-record-control` 5변형 baseline · unit 변형 선택 순수 함수 · 이름 Spec §9.1 (`D4-58` NB-8) |

### 4.4 `S4-G1` Prompts 팝업 (6)

| AC | 판정 | 증거 |
|---|---|---|
| 52 | **PASS** | unit `session-prompts.test.tsx` "AC-4-52 — 자동으로 나타나는 버블 0" · CP-3(`D4-58`)으로 수정판 적용 |
| 130 | **PASS** | unit "AC-4-130" · e2e "칩 재탭 → 닫힘 · 녹음 계속(시간 증가)" · e2e Drawer "녹음 계속" |
| 131 | **PASS** | grep `Try this prompt!` = `session-prompts/copy.ts:16` 1건(나머지 주석) · unit "AC-4-131·132·53" |
| 132 | **PASS** | e2e `session-prompts.spec.ts` › "393×852 · n=5: 329×293 …" · n=1/5/7 × 320/393 "73+44n · 침범 0 · 내부 스크롤 0" · "393×796 예산 0" |
| 133 | **PASS** | unit "AC-4-133" — Submit · Discard · 닫기 · 30분 자동 종료 · `prompts: []` 칩 aria-disabled + 사유 (실제 router + Mock 번들 조립, jsdom) · e2e Submit 경로 완료 화면 팝업 0 |
| 135 | **PASS** | e2e "바깥 탭(Pause) → 팝업 닫힘 + 일시정지 1건" · "키보드: Enter → 열림 · 포커스 칩 유지 · Escape → 포커스 칩" · "칩 재탭" |

### 4.5 `S4-G2` Prompt Drawer (5)

| AC | 판정 | 증거 |
|---|---|---|
| 53 | **PASS** | unit "AC-4-131·132·53" (같은 fixture → 세 지점 텍스트 일치) · e2e Drawer n=7 |
| 54 | **PASS** | unit `S4-G2` describe (노트 = `Prompt.coachingNote`) · e2e Drawer 상세 기하 "노트 ≥158" |
| 55 | **PASS** | unit "AC-4-55 (팝업)" · `S4-G2` (Drawer) · **QA 프로브 P5** — 같은 흐름 `navigator.vibrate`·`HTMLMediaElement.play` 호출 0 (QA-P4) · grep vibrate/Audio/play = 0 |
| 56 | **PASS** | e2e "키보드: See all Enter → Drawer · 초기 포커스 캐러셀 · → 이동 · Tab 트랩 · Escape → 포커스 칩 · 녹음 계속" · `prompt-drawer-close.spec.ts` ⑤⑥ |
| 137 | **PASS** | e2e 위 + "포인터: 화살표 hit 44 · 스와이프 · scrim → 포커스 칩" · baseline `s4-prompt-drawer` · `AD-S4-7` |

### 4.6 `S4-H1` 완료 화면 (13)

| AC | 판정 | 증거 |
|---|---|---|
| 57 | **PASS** | e2e Submit 경로 body `completedReason: user_done` → `/complete` |
| 58 [FE] | **PASS** | e2e `session-complete.spec.ts` › "AC-4-58·59·107 문구 = Mock 응답" · unit "재진입: 버블 = `SessionDetail.completionBubble`" (빈 QueryClient 재마운트) |
| 58 [BE] | `BACKEND_INTEGRATION_PENDING` | `P4B-BIP-03` |
| 59 | **PASS** | e2e 위 · grep `streak`/`Day \d` 사용자 노출 문자열 0 (주석만) |
| 60 | **PASS** | unit "재진입: 스티커 1개 · 전이 추가 0 (AC-4-58·60)" · 4a AC-4-37 멱등 Mock 유지 |
| 61 | **PASS** | e2e "AC-4-61·104: y 468 아래 렌더 요소 0 · 회고 카드 0" — **의도적 미구현 기록**: Stage 5 회고 카드(`91:691`, y 521~823)는 Stage 5 범위 |
| 104 | **PASS** | 위 e2e + 주석 `SessionCompleteScreen.tsx:2-6` + 이 행(QA 리포트 기록) |
| 107 | **PASS** | e2e 위 + 부제 = Mock 응답 + `AD-S4-1` 승인 |
| 139 [FE] | **PASS** | e2e "AC-4-139 ③ 본체 bottom 431 · 줄 19" · "② `subtext-missing`/`bubble-missing` 미렌더" · "⑧ 320 2줄 · 394.63" · unit ⑦ |
| 139 [BE] | `BACKEND_INTEGRATION_PENDING` | `P4B-BIP-02` |
| 140 | **PASS** | e2e "ready 세션 `/complete` → 홈 replace · 전이 0" · unit "⑤ `D4-113` recording/paused → 홈 replace" · "④ 오프라인 제출 판정 대상 아님" · **QA 프로브 P3** — recording 세션에서 `/session/:id/complete` 클라이언트 진입 → `/` · 전이 수 1 → 1(추가 0) · 완료 화면 렌더 0 (QA-P3) |
| 141 | **PASS** | e2e "AC-4-141: 닫기 → 홈 replace · 뒤로가기 복귀 안 함 · 전이 0" |
| 142 | **PASS** | e2e "AC-4-142: Toast 는 닫기 줄 아래 — 겹침 0 · 닫기 탭 가능" · `AD-S4-24` |
| 143 | **PASS** | e2e 선언값 computed (스티커 제목 14 Semibold) · baseline `s4-session-complete` |
| 144 | **PASS** | e2e "AC-4-144" 경로 2 × 오류 2 + 기하 3뷰포트 · Figma 없음 → Visual Gap H1 §8.2 명세 대조 · `D4-96`·`D4-99` 사용자 직접 승인 |

### 4.7 `S4-H2` 예외·안내 (6)

| AC | 판정 | 증거 |
|---|---|---|
| 64 | **PASS** | e2e `session-exceptions.spec.ts` › "누적 30분 → Toast + 완료 화면" |
| 65 | **PASS** | e2e `session-notices.spec.ts` › "`recorder:crash-recovered` → 복구 Toast 1회 · `completed(recovered_after_crash)`" · unit |
| 68 [Web 주입 3종] | **PASS** | unit `session-exceptions.test.tsx` "AC-4-68 — 인터럽션 3종: paused + 로컬 청크 보존 + 재개" · `recording-controller.test.ts` 인터럽션 |
| 68 [iOS Safari 실기기 ③] | **NOT VERIFIED** → `NV-4B-2` | AC 본문 "iOS Safari 실기기에서 ③ 1회 수동 확인" |
| 69 | **PASS** | unit "AC-4-69 — `abandoned` 이후 새 세션" · unit AC-4-148 ② (닫기 → 재시작 → 새 id) |
| 70 | **PASS** | e2e "공지 슬롯 — Web 백그라운드 경고" 3건 · baseline `s4-session-background-notice` · `AD-S4-14` |
| 134 | **PASS** | unit "AC-4-134 — `disabled`: 동의 없음 … 탭 → 추가 요청 0" · e2e 마이크 거부 시트 "`permission-denied` 변형" · e2e `S4-H2R` 3 key "Start 거부 → `conversation_only` → `permission-denied`"(회귀 경로 추가) |

### 4.8 `S4-H2R` Start Session 권한 판정 (5)

| AC | 판정 | 증거 |
|---|---|---|
| 63 [FE] | **PASS** | ① 경로 2: e2e Home 3 key body `mode=conversation_only` · **QA 프로브 P1(서재 경로, 브라우저)** — 서재 `mic-permission-blocked` body `mode=conversation_only` · `childBookId` = granted 경로와 동일(`33333333-…`) · 시트 표시 · `/recordings`·upload 요청 0 (`cmd-qa-probe.log` QA-P1) · unit 매트릭스 경로 2 × 상태 ② e2e `permission-denied` · unit `Submit` → `completed` ③ 녹음·업로드 요청 0 ④ 시트 안내 문단 ⑤ 모드 전환 요청 0 |
| 63 [BE] | `BACKEND_INTEGRATION_PENDING` | `P4B-BIP-04` · `05` |
| 145 | **PASS** | unit `session-permission.test.tsx` 매트릭스(경로 2 × `granted`/`prompt`허용/`prompt`거부/`denied`/`unavailable`, `requestPermission` 수 0/1/1/0/0) · ③ 권한 API 미지원 = `sessionRecorderEnvironment.test.ts` Web 어댑터 `null` 2건 · ⑥⑦ unit + e2e 순서 `selection → sessions` · ⑧ `lint:boundaries` 0 |
| 146 [unit] | **PASS** | unit Web 어댑터 + 가짜 미디어: 판정이 연 스트림 수 = 판정 안에서 닫은 수 (`sessionRecorderEnvironment.test.ts`) |
| 146 [실브라우저] | **NOT VERIFIED** → `NV-4B-3` | Mock 조립은 MockRecorderAdapter 만 쓰고(`apiClients.ts:85-92`), Web 어댑터 조립(`http`)은 Backend 가 없어 세션 생성 불가 → `MediaStreamTrack.readyState` 를 볼 경로 없음 |
| 147 | **PASS** | e2e 3 key "시트 자동 1회 · 포커스 Record" · "대화 전용 시트 시각 · 320 문단 줄 수" · unit 재진입 자동 0 · 문구 `D4-126` 승인 |
| 148 | **PASS** | e2e "녹음 세션 거부 → 시트 자동 · `permission-denied` · `Not now` → 포커스 Record"(`mic-permission-revoked`) · unit ①②③ · grep `Talk without recording` 사용자 문자열 0 (주석만) |

### 4.9 `S4-H3` 업로드 · 48h · 7일 · 14일 (5) + 걸침 화면 부분

| AC | 판정 | 증거 |
|---|---|---|
| 149 [FE] | **PASS** | e2e `session-notices.spec.ts` › "48h Toast + `Try again` → 업로드 요청 증가 · Toast 닫힘" · "+ 오프라인 → 요청 0 + 오프라인 안내" · unit 경계 48h−1ms/48h · 문구 `fail`/`error` 0 |
| 149 [BE] | `BACKEND_INTEGRATION_PENDING` | 실제 Storage 업로드 |
| 150 | **PASS** | e2e "AC-4-150" 320/393/600 "높이 = 34 + 20×줄 · 밀림 = 높이 · ≤ 94" · "닫기 → 밀림 0" · "오프라인 배너 우선" · unit 7일−1분/7일 · `AD-S4-25` 등록 수치와 일치 |
| 151 [FE] | **PASS** | e2e "`local-retention-exceeded` → 14일 Toast 1회 · action 0 · 서버 요청 0" · unit 파일 0 · 재통지 0 |
| 151 [BE] | `BACKEND_INTEGRATION_PENDING` | `RU-16` |
| 152 | **PASS** | ⓐ 채택(`D4-119` CP-12): 배지 0 · e2e AC-4-61 y468 아래 0 · unit `recording-notices.test.ts` "AC-4-152 — 업로드 진행·성공·자동 재시도 중 안내 0" |
| 153 | **PASS** | unit 재시작 3종 · 우선순위 · `clearAll` · e2e "14일 + 48h → 한 번에 1개" |
| 30 화면 | **PASS** | `N4B-32` ⓐ (CP-14) 재정의 = AC-4-152 ⓐ 로 판정 |
| 32 · 67 화면 | **PASS** | 48h Toast 1회 = AC-4-149 증거 |
| 31 화면 | **PASS** | e2e `session-exceptions.spec.ts` › "브라우저 offline → Toast · online → Toast" + 4a 큐 자동 재개 |
| 62 화면 | **PASS** | unit "AC-4-134 `disabled`: 동의 없음 → 탭 → 추가 요청 0" (실제 Mock `sessions:consent-missing`) |
| 22 화면 | **PASS** | **QA 프로브 P10** — `sessions:loading` → 확인 탭 후 `aria-busy` 관측 · 세션 조회 지연 중 `.haru-spinner` 관측 → ready 도착 (QA-P10) |
| 24 화면 | **PASS** | AC-4-144 오류 화면 e2e (조회 오류 → `ErrorState` + `Try again`) · AC-4-136 전이 실패 Toast |
| 25 화면 | **PASS** | **QA 프로브 P9** — `sessions.create:retry` → 1회차 실패 시 시트 유지 + 오류 안내 · 선택(Bedtime) 유지(checked 1) → Continue → `/session/:id` · 생성 요청 2건 (QA-P9). unit `session-ready.test.tsx` 실패 후 `Bedtime` checked 단정과 일치 |
| 35 화면 | **FAIL** → `QA-4B-001` | **QA 프로브 P7** — `sessions:session-already-active` → Continue → **Home 에 머물고** `We couldn't start the session. Please try again.` 만 표시 · `/session/<진행 중 id>` 이동 0 · 복귀 버튼 0 · `SESSION_ALREADY_ACTIVE` 전용 문구(`error-copy.ts:76`)도 쓰이지 않음 (QA-P7, `qa-p7-already-active.png`) |
| 36 화면 | **FAIL** → `QA-4B-002` | **QA 프로브 P8** — `sessions:onboarding-incomplete` → Continue → Home 에 머물고 일반 시작 실패 문구 · `/onboarding/:step` 이동 0 (QA-P8, `qa-p8-onboarding-incomplete.png`). grep: 제품 코드에 `ONBOARDING_INCOMPLETE` 분기 0 (`error-copy.ts` 문구만) |

### 4.10 `S4-K` 회귀 · 시각 (9) + 109

| AC | 판정 | 증거 |
|---|---|---|
| 95 | **PASS** | 감사 문서 존재 · e2e 기하 6건(`300:1309`·`298:1262`·`298:1340`·`296:1257`·`88:960`·`29:62`) · baseline 15종 · QA Figma 직접 대조(§3 #15, Figma 변경 0 MD5 재확인) · 허용 차이 = 대장 §4 **등록 항목만**(`AD-S4-1`·`4`~`7`·`9`~`16`·`18`~`26`, `AD-S4-17` 미등록·시각 차 0) · 무효 `AD-S4-2`(Discard 구현됨)·`AD-S4-3`(`139:2803` pill 그대로) 부재 · Visual Gap final 미결 3건 중 Figma 시각 어긋남 0 |
| 96 | **PASS** | grep: 화면 코드 HEX = 공식 브랜드 마크(`GoogleMark`·`AppleMark`, 기존 예외)뿐 · rgb() 0 · Tailwind arbitrary 0 · inline style = `ProgressBar.tsx:101` `flexGrow`(Stage 2 기존) · 4b CSS 리터럴 = `@container` 경계(토큰 불가) · `0px` · hairline `1px` |
| 97 | **PASS** | e2e `session-regression.spec.ts` AC-4-97 13건 + `K2-D1` + `VG-FIN-02`(2/7 · 5/5쪽 `Previous` ≥ 44) · `Discard` 대비 = 가값 `P-25`(FAIL 아님) · ⚠️ 2회차 실패 `session-regression.spec.ts:351`(완료 화면 닫기)는 터치 타깃 단정 **전 단계**(제출 Toast 퇴장 대기)에서 멈춘 것이며 hit-test 자체는 단독 4/5 실행과 1회차에서 통과 → AC-4-97 판정 영향 없음, `QA-4B-003` 로 분리 |
| 98 | **PASS** | unit `stage4-motion-guards.test.ts`(대조표 19종 · UNCOVERED 0) · e2e AC-4-98 2건 · `prompt-drawer-close.spec.ts` ④ reduce |
| 99 | **FAIL** → `QA-4B-004` [데스크톱 클래식 스크롤바 320×≤627 가로 넘침] · PASS [Chromium 오버레이 스크롤바 · 320/393/600/1024 · 짧은 세로] · NOT VERIFIED [iOS Safari `dvh` → `NV-4B-4`] | e2e `session-regression.spec.ts` AC-4-99 5뷰포트 · `session-prompts.spec.ts` 짧은 세로 · `D4-78`~`D4-82` 묶음 통과 (기본 headless 는 스크롤바를 숨긴다) · **QA 프로브 P6** — 기본 설정(`--hide-scrollbars`)에서는 스크롤바 폭 0 이라 재현 불가 → `--hide-scrollbars` 를 뺀 config 로 클래식 스크롤바(15px) 환경 재현: **320×568 뷰포트 스크롤 박스 `clientWidth 305 · scrollWidth 320` = 가로 넘침 15** · 1024×500 Record 중심 504.5(창 중심 512 대비 7.5 이동, 넘침 0) · 320×852 스크롤 없음 → 정상 (`cmd-qa-probe-scrollbar.log`). design-agent `VG-K1S-04` 보고와 일치 |
| 100 | **PASS** | unit AC-4-100 (세션 CSS `overflow` 4건 + 근거 주석) · e2e computed overflow 목록 · 양축 프로브 3건 · `shadow.spec.ts` 세션 4건 |
| 101 | **PASS** | e2e `auth` · `consent` · `onboarding` · `home` · `library` · `tabs` · `scenarios` · `visual` 전부 이번 실행에 포함 (§8) |
| 102 | **PASS** | 명령 2~8 · 신규/변경 코드 `any`·`@ts-ignore`·`@ts-expect-error` 0 (`grep-security.log`, 미추적 파일 포함) |
| 103 | **PARTIAL** → `QA-4B-003` | 단독 전체 실행 2회 모두 **530/531** (서로 다른 1건 실패) — "전체 통과" 를 한 번도 충족하지 못했다. 실패 2건 모두 단독 재실행에서 통과(5/5 · 4/5). baseline 재생성 0 (`git status e2e/__screenshots__` = 기존 미추적 `session-exceptions.spec.ts/` 뿐) → 분해 대상 없음 |
| 109 | **PASS** | unit AC-4-109 4건 · `package.json` lottie/rive/gsap/framer 0 · `.lottie`/`.riv` 0 |

### 4.11 Privacy / Security (Frontend)

| 항목 | 판정 | 증거 |
|---|---|---|
| 동의 없음 → 녹음 시작 UI 차단 | **PASS** | AC-4-62 화면 · AC-4-134 |
| 콘솔 PII · Transcript 0 | **PASS** | **QA 프로브 P4** — 로그인 → ready → recording → 팝업 → Drawer → Submit → 완료 전 흐름 console 3건, `Nova`·`uploadToken`·opfs·indexeddb·transcript 0 (QA-P4) · prod `console.*` = `logger.ts`(sanitize) · `devWarn.ts` 뿐 · 4b 신규 `logger.error` 3건은 `errorName` 만 |
| 로그아웃 시 로컬 정리 | **PASS** | unit AC-4-153 ④ `clearAll` → 안내 기록 0 · 4a AC-4-72 유지 |
| Secret / 제3자 SDK | **PASS** | `VITE_*` = `API_BASE_URL`·`API_MODE`·`MOCK_SCENARIO` 3종 · dist 에 secret 패턴 0 · 분석·광고 SDK 0 · `.env` 파일 0 |
| 마이크 프로브 스트림 해제 | AC-4-146 참조 | unit PASS · 실브라우저 NOT VERIFIED |

---

## 5. Findings

### `QA-4B-001` | Severity: **Medium**

```
Requirement: AC-4-35 화면 부분 (상위 Plan stage-4-plan.md 1553행 — 걸침 AC 의 "화면 부분은 S4-F·S4-H2(4b)에서 판정") · FR-09
Steps to reproduce (Mock 시나리오 포함):
  1. /auth/log-in?scenario=sessions:session-already-active → 로그인
  2. Home Activity Card `Start Session` → Reading Context `Bedtime` → `Continue`
Expected: POST /v1/sessions 가 SESSION_ALREADY_ACTIVE(details.sessionId) 를 반환하면 진행 중 세션으로 복귀하는 경로가 있다
Actual: Home 에 머물고 시트 안에 일반 문구 "We couldn't start the session. Please try again." 만 보인다. 복귀 이동 0 · 복귀 버튼 0.
        다시 누르면 같은 오류가 반복된다. 기존 SESSION_ALREADY_ACTIVE 전용 문구(shared/copy/error-copy.ts:76 "A storytime is already open")도 쓰이지 않는다.
        Mock 은 계약대로 동작한다 — details.sessionId 를 주고 그 세션(recording)을 getDetail 로 조회할 수 있다 (4a AC-4-35 [Mock] PASS).
Evidence: cmd-qa-probe.log QA-P7 (url `/`, POST /v1/sessions 후 이동 0) · qa-p7-already-active.png ·
          grep SESSION_ALREADY_ACTIVE|already-active (apps/web/src, mocks·tests 제외) = API 주석 · HttpSessionApi 주석 · error-copy 뿐
Suspected area (수정 지시 아님): features/activity-card-deck ActivityCardDeck.tsx · features/library StartSessionAction.tsx 의 생성 실패 처리 · entities/session useCreateSession.
  계획 측: 인계 F1-11 "진행 중 세션 복귀(AC-4-35) → S4-F2/S4-H2" 로 넘겨졌으나 4b Plan rev 1.5 §13 단위표 어디에도 배정되지 않았다.
  세션 화면은 ready 가 아닌 세션을 홈으로 보낸다(D4-91·D4-113) — 복귀 대상이 recording 세션이므로 "복귀" 화면 동작은 plan-agent 결정이 필요할 수 있다.
```

### `QA-4B-002` | Severity: **Medium**

```
Requirement: AC-4-36 화면 부분 (같은 근거) — "세션 endpoint 가 ONBOARDING_INCOMPLETE, Route Guard 가 /onboarding/:step 으로 보낸다"
Steps to reproduce:
  1. /auth/log-in?scenario=sessions:onboarding-incomplete → 로그인
  2. Home `Start Session` → `Bedtime` → `Continue`
Expected: 세션 endpoint 의 ONBOARDING_INCOMPLETE 응답에서 /onboarding/:step 으로 이동한다
Actual: Home 에 머물고 일반 문구 "We couldn't start the session. Please try again." 만 보인다. /onboarding 이동 0.
        제품 코드에 ONBOARDING_INCOMPLETE 응답을 Route Guard·이동으로 잇는 분기가 없다 (문구 정의만 error-copy.ts:56).
Evidence: cmd-qa-probe.log QA-P8 (url `/`) · qa-p8-onboarding-incomplete.png · grep ONBOARDING_INCOMPLETE (apps/web/src, mocks·tests 제외) = API 주석 3 + error-copy 1
Suspected area: 세션 생성 실패 처리(위 두 feature) 또는 API 오류 → Route Guard 연결(app/).
  참고: /me 온보딩 상태 기반 Route Guard(Home 진입 차단)는 Stage 2 e2e 로 계속 통과한다 — 빠진 것은 세션 endpoint 응답 경로뿐이다. 4b Plan §13 단위표에 배정 안 됨(QA-4B-001 과 같은 계획 공백).
```

### `QA-4B-003` | Severity: **Low**

```
Requirement: AC-4-103 (pnpm test:e2e 전체 통과) — 관련 동작: AD-S4-26 · D4-136 (앱 Toast 최대 6초) · D4-100 (스티커는 Toast 퇴장 뒤 입장)
Steps to reproduce:
  1. pnpm test:e2e (단독, workers 1) — 2회 실행
  2. 또는 qa-4b.probe.spec.ts P12 v1(심장박동만) --repeat-each=10
Expected: 531/531 통과 · Toast 가 정해진 시간(4~6초) 뒤 퇴장한다
Actual: 1회차 session-notices.spec.ts:365 실패 — recording 00:09 위에 48h Toast 가 녹음 시작 후 10초 넘게 남음
        2회차 session-regression.spec.ts:351 실패 — 완료 화면 `Recording submitted` Toast 가 8초 안에 사라지지 않음(그동안 스티커 입장도 멈춤)
        단독 재실행: 365 → 5/5 통과 · 351 → 4/5 (1회 같은 증상)
        QA 프로브 P12 v1 10회 중 1회 재현: Toast 가 +4042ms 에 `closing` 으로 바뀐 뒤 언마운트되지 않고, 바로 그 시점부터 페이지의
        setInterval(250ms) 심장박동이 멈췄다(20/40). ToastProvider·usePresence 는 setTimeout 기반이라 타이머가 멈추면 퇴장도 멈춘다.
        rAF 루프를 함께 돌린 v2·v3 는 35/35 통과 → 렌더 프레임이 없을 때 headless Chromium 이 타이머를 멈추는 환경 요인일 가능성이 높다.
        단 실패 순간이 매번 "Toast 닫힘 직후" 라는 상관은 남아 있어 제품 측 원인을 배제하지 못했다.
Evidence: cmd-e2e-run1.log · cmd-e2e-run2.log · cmd-e2e-rerun-*.log · cmd-qa-probe-p12*.log · flake-run1/ · flake-run2/ · flake-solo/ (trace.zip · error-context.md · frames.png)
Suspected area (수정 지시 아님): 테스트 쪽 — 실시계 Toast 대기(8~10초)가 headless 타이머 정지에 취약. 제품 쪽 확인 대상 — packages/ui ToastProvider(timer effect) · hooks/usePresence ·
  features/storytime-session useStickerEntrance · RecordingNoticeToasts 의 Toast 퇴장 직후 동작. 실기기(Safari·Chrome 창)에서 같은 증상이 없는지 1회 확인 권고.
```

### `QA-4B-004` | Severity: **Low**

```
Requirement: AC-4-99 — "320 / 393 / 600 / 1024px 에서 세션·완료 화면이 앱 컬럼 최대 480px 가운데 정렬 · 가로 overflow 0"
Steps to reproduce:
  1. 클래식(항상 보이는) 스크롤바 환경 — Windows Chrome 기본 · macOS "스크롤 막대 보기: 항상" · QA 는 Playwright config 에서 `--hide-scrollbars` 제외(qa-4b-scrollbar.config.ts)
  2. 뷰포트 320×568 로 세션 ready 진입 (높이 ≤ 627 → D4-82 세로 스크롤 발생)
Expected: 가로 넘침 0, 컬럼 가운데
Actual: 세로 스크롤 박스(AppShell 뷰포트 `overflow-y-auto`)에 15px 스크롤바가 생기며 clientWidth 305 · scrollWidth 320 → 가로 넘침 15 (가로 스크롤 가능).
        1024×500 은 넘침 0 이지만 컬럼 중심이 504.5 (창 중심 대비 7.5 이동). pill 목록도 내부 스크롤바만큼 225 로 좁아진다.
Evidence: cmd-qa-probe-scrollbar.log (QA-P6 3건) · design-agent stage-4b-visual-gap-k1.md `VG-K1S-04` 실측과 같은 값
Suspected area: AppShell 뷰포트 스크롤 박스(Tailwind `overflow-y-auto`, D4-82) — 스크롤바 폭 처리. `R-SHADOW-1` · `AD-S4-23` 범위와 맞물린다.
처리 메모: design-agent 는 "Mock 웹 프리뷰(C-18)에서만 보이는 범위라 수용 · Stage 8 Responsive 로 이관" 을 권고했으나 **사용자 수용·허용 차이 등록 기록이 없다** (최우선 규칙 6).
  사용자가 수용하면 `PASS (accepted: QA-4B-004)` 로 기록할 수 있다. 일반 탭 화면도 같은 AppShell 구조라 Stage 1~3 화면에도 같은 현상이 있을 수 있다(측정 안 함).
```

### 5.1 관찰 (Finding 아님 — 판정에 영향 없음, 후속 확인 권고)

| ID | 내용 | 근거 |
|---|---|---|
| **OBS-4B-1** | → `QA-4B-003` 로 이동 (간헐 e2e 실패 2건 · P12 재현 · 원인 가설) | — |
| **OBS-4B-2** | 48h Toast 가 **로그인 화면(인증 전)** 에도 뜬다 (QA-P11: `/auth/log-in` 에서 571ms 표시). Spec §18.3 은 "앱 시작 후" 만 적고 인증 전 표시 여부를 정하지 않았다. 기기 seed 데모 경로에서 관찰 | QA-P11 `path: /auth/log-in` |
| **OBS-4B-3** | Plan §13.3-⑧ **C-1**(`CreateSessionRequest.mode` 문단) · **C-3**(`P4B-BIP-04`·`05` 등재)이 `API_CONTRACTS.md` Rev 8.11 에 없다(C-2 Mock key 만 반영). `P4B-BIP-01` 도 Plan 에만 있다 → Stage 8 Handoff 집계 누락 위험 (plan-agent) | `grep P4B-BIP-0[145] docs/API_CONTRACTS.md` = 0 |
| **OBS-4B-4** | 인계 오기 확인: `# S4-K2` K2-3(AC-4-99 행)·K2-4 · `# S4-K2F` · `# S4-G2M` G2M-5 의 "`test.fail` 1~4건" — 실제 `test.fail`·`skip`·`fixme`·`.only` **0건** (`VG-FIN-01` · `VG-G2M-02`). 판정은 실제 코드 기준 | grep 0 |
| **OBS-4B-5** | 가값 `P-26`·`P-27` 은 `session.css:171·176` `provisional` 주석이 있으나 dev gallery `provisionalItems.ts` 활성 목록 · `gallery-helpers.test.ts:81` 대기 목록에 없다 (Stage 0 §4 운영 규칙 "gallery 등재"). 가값 자체는 FAIL 사유 아님 | grep |
| **OBS-4B-6** | 주석 낡음: `activity-card-deck/copy.ts:71·78` "⚠️ 문구 승인 대상 · 초안" — 실제로는 `D4-60` 승인(`Time` 은 Stage 3 Spec §2.4 원문). 동작 영향 0 | `D4-60` |
| **OBS-4B-7** | AC-4-50 정의 모호 — 본문 "탭 → **첫 청크 수신**" vs 4a spike §2 "녹음 시작(`start()`) ≠ 첫 청크(1184ms @ timeslice 1000)". 실기기 측정 전에 끝점 확정 필요 (`NV-4B-1`) | spike 리포트 102행 |
| **OBS-4B-8** | Visual Gap 미결 3건: `VG-H2R-04`(Spec 문언 — 구현은 §18.2 ④ 와 일치, 판정 영향 0) · `VG-K1-05`(702 경계 비단조 — 실기기, `NV-4B-4`) · `VG-K1S-04`(클래식 스크롤바 가로 넘침 15 — QA 재현 → **`QA-4B-004`**) | Visual Gap final §12.9 |

---

## 6. NOT VERIFIED 항목과 수동 테스트 절차

> ⚠️ 2회차 §R2-6 이 이 절차를 대체한다 (측정판 사용 · `NV-4B-3` 권한 "묻기" 전제).

사용자 항목별 수용 또는 수동 실행이 필요하다. 수용 전에는 Stage Verdict 가 `PASS` 가 될 수 없다 (`rules/qa.md` §2).

### `NV-4B-1` — AC-4-50 녹음 시작 지연 ≤ 1s (실기기 5회 중위값)

- 이유: 측정 대상이 데스크톱 Chrome · 데스크톱 Safari · **iOS Safari 실기기**의 실제 마이크다. e2e 는 MockRecorderAdapter 라 대상이 아니고, 이 환경에 실기기가 없다. 구현 측도 측정하지 않았다(인계 F2-2 50행).
- ⚠️ AC 정의 확인 필요: AC 본문은 "버튼 탭 → **첫 청크 수신**까지" 인데, 4a spike 리포트 §2 는 timeslice 1000ms 에서 첫 청크가 **1184ms** 라 적고 "AC-4-50 은 녹음 시작(`start()` 즉시)이고 첫 청크 지연과 다른 축" 이라고 해석했다. 문자 그대로 재면 1s 를 넘을 수 있다 → 측정 전에 측정 끝점(① `MediaRecorder` `start` 이벤트 ② 첫 `dataavailable`)을 사용자/plan-agent 가 확정해야 한다.
- 수동 절차: dev `/__dev/ui/recording-measure` (Web 어댑터 = 제품 파이프라인) 를 각 브라우저에서 열고 → 마이크 허용 상태에서 Record 탭 시각(`performance.now()`)과 위 ①/② 시각을 5회 기록 → 중위값 ≤ 1000ms 확인 → 브라우저·버전·OS·기기·회차를 리포트에 첨부. Android 모바일 Web 은 기기 부재(`N4-21`).

### `NV-4B-2` — AC-4-68 ③ iOS Safari 실기기 `MediaStreamTrack.onended` (전화 수신)

- 이유: AC 본문이 "iOS Safari 실기기에서 ③ 1회 수동 확인" 을 요구한다. ①②③ 의 어댑터 이벤트 주입 판정은 PASS.
- 수동 절차: iPhone Safari(iOS ≥ 16, `D4-83`) → Mock 프리뷰에서 녹음 시작 → 다른 기기로 전화 걸어 수신 → 통화 종료 후 앱 복귀 → 화면이 paused(`Tap to resume`) · 경과 시간 고정 · `Submit` 시 그때까지 녹음이 제출되는지(로컬 청크 유실 0 — dev 측정판의 청크 수) 확인.

### `NV-4B-3` — AC-4-146 실브라우저 프로브 스트림 해제

- 이유: Mock 조립은 MockRecorderAdapter 만 쓰고 http 조립은 Backend 가 없어 세션을 만들 수 없다 → 브라우저에서 판정 녹음기의 실제 트랙을 관찰할 경로가 없다. unit(가짜 미디어 환경 open/stop 수)은 PASS.
- 수동 절차 (인계 H2R-7 ④ · Plan §15 manual device): 데스크톱 Chrome 첫 사용 → Start Session → 프롬프트 허용 → Home/ready 에서 주소창·OS 마이크 표시등이 **꺼져 있는지** → Record 탭 → 녹음 정상 시작 + **재프롬프트 여부**(R4B-16, Safari 특히) 기록. iOS Safari · 데스크톱 Safari 반복. 재프롬프트가 확인되면 `N4B-29` 재결정 대상.

### `NV-4B-4` — AC-4-99 ② iOS Safari 실기기 짧은 세로 · `VG-K1-05`

- 이유: 압축은 컨테이너 쿼리 + `100dvh` 이고 iOS Safari 툴바 표시 상태에서의 실제 높이·702 경계 비단조 점프(`VG-K1-05`)는 Chromium 으로 재현할 수 없다 (인계 K1-8 · KF-5 · K2F-4).
- 수동 절차: iPhone(393 폭) Safari 에서 recording 화면 → 툴바 표시/숨김 각각에서 메달리온 지름(136/190)·팝업과 Record 간격·`Submit` 도달(스크롤) 확인 → 목록 끝 터치 제스처가 화면 스크롤로 이어지는지 → 팝업 밖 드래그 시 팝업 닫힘 → 툴바 변화로 702 경계를 넘나들 때 레이아웃 점프 관찰.

---

## 7. BACKEND_INTEGRATION_PENDING 목록

| 항목 | 대기 사유 | Handoff 대상 문서 |
|---|---|---|
| AC-4-126 [BE] `P4B-BIP-01` | Activity Card · 서재 · `childBookId` 세 경로 모두 `SessionSummary.book` 을 채우는 서버 해석 | `BACKEND_HANDOFF` · `API_CONTRACTS` §3.2 |
| AC-4-129 · 113 [BE] `P4-BIP-21` · `RU-6` | `abandoned` 전이 수신 시 서버가 업로드된 part·token 정리 | `RECORDING_UPLOAD_SPEC` |
| AC-4-46 · 120 [BE] `P4-BIP-11` | 인사·리마인드 버블 검수 템플릿 생성·안전 슬롯·금지어·fallback | `ANALYSIS_PIPELINE_REQUIREMENTS` |
| AC-4-139 [BE] `P4B-BIP-02` · `D4-109` | 완료 버블 `subtext` 생성(사실 일치 · streak 0 · `min` 표기 규칙) | `ANALYSIS_PIPELINE_REQUIREMENTS` · `BACKEND_HANDOFF` |
| AC-4-58 [BE] `P4B-BIP-03` | `completed` 전이 때 고른 완료 버블을 세션 단위로 보존해 `SessionDetail` 에 같은 값 반환 (자녀 연결 데이터 — RLS·전체 삭제) | `DATA_REQUIREMENTS` · `BACKEND_HANDOFF` |
| AC-4-63 [BE] `P4B-BIP-04` | 서버는 `mode` 를 그대로 수용(권한 검증 불가) · `conversation_only` 업로드 시 `RECORDING_NOT_ALLOWED_FOR_MODE` | `BACKEND_HANDOFF` · `API_CONTRACTS` §3.2 |
| AC-4-63 [BE] `P4B-BIP-05` | `conversation_only` 세션 버블·완료 문구가 녹음·녹음 시간을 언급하지 않음 | `ANALYSIS_PIPELINE_REQUIREMENTS` |
| AC-4-62 · 134 [BE] | 서버 측 동의 강제(`CONSENT_REQUIRED`) · Consent History | `AUTH_REQUIREMENTS` · `BACKEND_HANDOFF` |
| AC-4-149 [BE] | 실제 Storage 업로드 · 서버 확정 · 48h 이후 서버 측 상태 | `RECORDING_UPLOAD_SPEC` |
| AC-4-151 [BE] `RU-16` | 14일 로컬 삭제로 녹음이 오지 않는 `completed` 세션 서버 정리 | `ANALYSIS_PIPELINE_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| `D4-45` · R4B-21 | 대화 전용 미제출 ready 세션 서버 sweeper (`D4-112` 로 비중 상향) | `DATA_REQUIREMENTS` · `BACKEND_HANDOFF` |

⚠️ 등록 상태: `P4B-BIP-02`·`03` 은 `docs/API_CONTRACTS.md` §3.2.3 에 등재돼 있다. **`P4B-BIP-01`·`04`·`05` 는 Plan(`stage-4b-plan.md` §10 · §13.3-⑨)에만 있고 `API_CONTRACTS.md` 에는 없다** — Plan §13.3-⑧ C-1(`CreateSessionRequest.mode` 문단)·C-3(BIP-04·05 등재)이 Rev 8.11 에 반영되지 않았다 (Rev 8.11 은 C-2 Mock key 만 반영). Stage 8 Handoff 집계에서 누락되지 않도록 §5.1 관찰 `OBS-4B-3` 으로 기록한다 (Contract 결함 아님 — schema 변경 0 이 맞다).

---

## 8. Regression 결과

| 항목 | 결과 |
|---|---|
| 단위 전체 | `pnpm test` **171 files / 2488 tests** 통과 (Stage 1~4a 테스트 포함 — 4a 기준선 152/2140) |
| e2e 전체 (단독) | 1회차 **530/531 (17.3m)** — 실패 `session-notices.spec.ts:365` · 2회차 **530/531 (15.5m)** — 실패 `session-regression.spec.ts:351` (`QA-4B-003`). 단독 재실행 5/5 · 4/5. 두 실행 모두 Stage 1~4a spec 전부 통과 |
| Stage 1~3 핵심 경로 (AC-4-101) | `auth` · `consent` · `onboarding` · `home` · `library` · `tabs` · `scenarios` · `visual` · `a11y` · `responsive` · `shadow` · `toast` · `top-bar-scrolled` · `week-summary-chip` · `book-cover` spec 전부 통과 (이전 에이전트가 보고한 `onboarding.spec.ts:184/226` 간헐 실패는 이번 실행에서 재현되지 않았다) |
| baseline | 재생성 0 · `git status e2e/__screenshots__` = 기존 미추적 `session-exceptions.spec.ts/` 3장(11-02~03 생성, 이번 실행이 바꾸지 않음 — 파일 시각 불변) → `R-BASELINE-1` ⑤ 분해 대상 없음 |
| 4a 판정 유지 | 4a 로직 테스트(`recording-runtime` · `upload-queue` · `session-outbox` · `recording-controller` · Mock API) 전부 통과 — 4a `PASS (accepted: D4-34, NV-4A-1)` 근거 불변 |
| Scope | `apps/api` · `supabase` · `apps/mobile` 부재 유지 |

### 8.1 남은 가값 목록 (FAIL 사유 아님 — `rules/qa.md` §2)

| ID | 대상 | 상태 |
|---|---|---|
| `P-01` | 보조 텍스트 `--color-fg-secondary` | 디자이너 대기 |
| `P-02` | 비텍스트 요소 대비 | 디자이너 대기 |
| `P-04` | status 색 | 디자이너 대기 |
| `P-16` | 메달리온 크기 혼재 (`--size-medallion-session` T-11 포함) | 디자이너 대기 |
| `P-17` | TextField trailingAction 색 구분 (Stage 2) | 디자이너 대기 |
| `P-23` | Prompt 배지 글자색 `--color-prompt-tag-fg` (Stage 3) | 디자이너 대기 |
| `P-24` | 3차 텍스트 `--color-fg-tertiary` (Stage 3) | 디자이너 대기 |
| `P-25` | `Discard` · `Mic is off`(PermissionDenied, `S4B-Q6` 범위 확장) 흰 라벨 on `#aeaeb2` 2.211:1 | 디자이너 대기 |
| `P-26` | paused 경과 시간 대비 2.42~2.47 | 디자이너 대기 (gallery 미등재 — `OBS-4B-5`) |
| `P-27` | paused 보조 줄 대비 2.39~2.40 | 디자이너 대기 (gallery 미등재 — `OBS-4B-5`) |
| 기록 (AC-4-117 ④) | 비활성 `opacity .5` 가 `Submit` 흰 라벨 대비를 `D-01`(2.07:1) 아래로 낮춘다 | WCAG 1.4.3 비활성 제외 — FAIL 아님 |

수용 예외: `D-01`(`Submit` 흰 라벨) 적용 — `PASS (accepted: D-01)` 성격, Stage 4 신규 `D-xx` 0건.

### 8.2 사용자 결정·수용이 필요한 항목

1. `QA-4B-001` · `QA-4B-002` (Medium) — 수정(development-agent) 전에 **plan-agent 가 4b 단위에 배정**해야 한다(4b Plan §13 공백). AC-4-35 "복귀" 의 화면 동작은 `D4-91`·`D4-113`(비-ready 세션 → 홈)과 맞물려 결정이 필요할 수 있다.
2. `NV-4B-1` ~ `NV-4B-4` — 항목별 수동 실행 또는 명시 수용 (`PASS (accepted: …)` 은 사용자 발화로만). `QA-4B-004` 는 수정 또는 명시 수용(design-agent 의 Stage 8 이월 권고는 수용이 아니다).
3. `QA-4B-003` — 간헐 실패 원인 조사(development-agent) 또는 테스트 대기 방식 보강. 실기기 1회 확인 권고.
4. `OBS-4B-3` — `API_CONTRACTS.md` C-1·C-3 반영(plan-agent).

---

## 9. 재검증 이력

| 회차 | 일시 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-11-05 | `FAIL` (QA-4B-001 · 002 Medium · 004 Low) + PARTIAL `QA-4B-003` Low — 그 외 `INCOMPLETE` 요인 NV 3 AC | 이 문서 "1회차 기록" |
| 2 | 2026-11-07 | **`INCOMPLETE`** — FAIL 0 · PARTIAL 0 · NOT VERIFIED 4 (`NV-4B-1`~`4`, 실기기). `QA-4B-001`·`002`·`004` FAIL → PASS · `QA-4B-003` PARTIAL → PASS(종결) · AC-4-154·155·156 PASS · 신규 Finding 0 · `OBS-4B-9` 관찰 · 단독 e2e 연속 2회 558/558 | 이 문서 "2회차" (§R2-1 ~ §R2-8) |
| 2+ | 2026-11-07 (보충) | **`INCOMPLETE`** — FAIL 0 · PARTIAL 1 (`QA-4B-005` Low, 신규) · NOT VERIFIED 4. `OBS-4B-9` (`D4-149`) → 해소 PASS | 이 문서 §R2-9 |
| 3 | 2026-11-08 | **`INCOMPLETE`** — FAIL 0 · PARTIAL 1 (`QA-4B-005` Low, `D4-150` 미수정) · NOT VERIFIED 0. `NV-4B-1` → PASS (iOS Safari 26.6, `start` 중위 318 ms) · `NV-4B-4` → PASS (사용자 구두 보고) · `NV-4B-2` → `PASS (accepted: NV-4B-2)` · `NV-4B-3` → `PASS (accepted: NV-4B-3)` (⑨ 결과는 권한 미초기화로 증거 아님) | 이 문서 "3회차" (§R3-1 ~ §R3-5) |
| 3+ | 2026-11-08 10:20–10:38 | **`INCOMPLETE`** — FAIL 0 · PARTIAL 1 (`QA-4B-006` Low, 신규 — Stage 3 `library-entry-screens` 부하 간헐 1/10) · NOT VERIFIED 0. `QA-4B-005` PARTIAL → **PASS** (diff 9줄×3 · 부하 10회 대상 30/30 · 무부하 2513/2513) | 이 문서 §R3-6 |
| 3++ | 2026-11-08 15:1x–15:35 | **`PASS (accepted: NV-4B-2, NV-4B-3)`** — FAIL 0 · PARTIAL 0 · NOT VERIFIED 0. `QA-4B-006` PARTIAL → **PASS** (`D4-153` 14파일 테스트만 · 부하 10회 10/10, load avg 최대 232 · 무부하 2513/2513 · typecheck·lint exit 0) · 새 간헐 실패 0 | 이 문서 §R3-7 |
