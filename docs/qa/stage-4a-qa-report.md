# Stage 4a QA Report — "Recording Core" (1회차 · 2회차)

> ⭐ **현재 유효한 Stage Verdict = §10 (2회차, 2026-10-18) — `PASS (accepted: D4-34, NV-4A-1)`**. §1~§9 는 1회차 기록이며 보존한다(1회차 Verdict `FAIL` 은 2회차로 대체됨).

Status: **QA 2회차 완료 (2026-10-18, stage-qa-agent)** · 1회차 대상 = 정본 66건 → 2회차 대상 = `docs/plans/stage-4-plan.md` §16.4.3 **정본 64건 (개정 3.1)**
Product Code 수정 0 · 커밋 0. 증거 파일 = `docs/qa/evidence/stage-4a/` (2회차 = `docs/qa/evidence/stage-4a/r2/`)

---

## 1. Summary

| 항목 | 값 |
|---|---|
| **Stage Verdict** | **`FAIL`** — `FAIL` 2건 (`QA-4A-001` Low · `QA-4A-002` Medium) |
| FAIL 이 없었다면 | `INCOMPLETE` — `PARTIAL` 1 (`QA-4A-003`) · `NOT VERIFIED` 1 (AC-4-108) |
| 실행 일시 | 2026-10-18 16:2x–16:5x KST |
| 대상 상태 | `main` @ `6fbf69f` + 미커밋 변경(오프라인 배너 1줄 후속 · dev 측정판 재생 기능 · 문서) — 세션 시작 시 `git status` 그대로 |
| 판정 집계 (66) | **PASS 61** · **PASS (accepted: D4-34) 1** · **PARTIAL 1** · **FAIL 2** · **NOT VERIFIED 1** |
| `BACKEND_INTEGRATION_PENDING` | AC 4건의 Backend 분할 행 + Plan `P4-BIP-01`~`18`·`21` + handoff `RU-1`~`RU-21` (§7) |
| 판정 대상 아님 | AC-4-86 = **이동(4b `S4-F`, `D4-35`)** · AC-4-123·124 = **4b** · AC-4-04·73~80 = **이동(`D4-1`)** · AC-4-105·106 = **폐기** |

**핵심 결론**: 녹음 코어(contracts · Mock · Controller · 로컬 영속 · Outbox · 업로드 큐 · 이월 6건)는 **직접 실행한 증거로 충족**된다. QA 독립 재현 14건도 전부 통과했다. FAIL 은 **정본 목록이 4a 에 넣은 AC-4-110(코드 부분)이 구현되지 않은 것**과 **contracts enum 리터럴 중복 1곳**이다.

---

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (25F71), darwin arm64 |
| Node / pnpm | v24.21.0 / 12.4.2 |
| Playwright | 1.63.0 (번들 Chromium) — `workers: 1`, 포트 4319, **단독 실행**(시작 전 Playwright 프로세스 0 확인) |
| 브라우저 프로브 | Playwright Chromium → 실행 중인 dev 서버 `https://localhost:5173` (끄지 않음) |
| 기기 | 실기기 없음 (iPhone 결과는 사용자 실측 기록 인용 — §6) |
| Mock 시나리오 | URL `?scenario=<group>[.<method>]:<key>` · 단위는 `createMockApiClientsBundle({ search, timer: immediate })` + `createManualScheduler` |

---

## 3. Commands Executed

| # | 명령 | 결과 | 로그 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | ✅ exit 0 | `01-install.log` |
| 2 | `pnpm typecheck` | ✅ exit 0 (root · e2e · contracts · ui · web) | `02-typecheck.log` |
| 3 | `pnpm lint` | ✅ exit 0 | `03-lint.log` |
| 4 | `pnpm lint:boundaries` | ✅ no dependency violations (719 modules, 2630 deps) | `04-boundaries.log` |
| 5 | `pnpm format:check` | ✅ All matched files use Prettier code style | `05-format.log` |
| 6 | `pnpm test` | ✅ **152 files / 2140 tests** passed (31.2s) | `06-test.log` |
| 7 | `pnpm build` | ✅ exit 0 (chunk size 경고만 — 기존) | `07-build.log` |
| 8 | `pnpm assert:no-mocks` | ✅ MOCK·DEV sentinel 0 · `haru-dev-` 0 · sharp 흔적 0 (dist 4파일) | `08-no-mocks.log` |
| 9 | `pnpm test:e2e` (**단독**) | ✅ **295 passed (6.5m)**, 실패·flaky 0. baseline 변경 0 (`git status e2e/__screenshots__` = 기존 미추적 2장만) | `09-e2e.log` |
| 10 | contracts 단위 verbose | ✅ Stage 4 contract 테스트 전부 통과 | `10-contracts-verbose.log` |
| 11 | **QA 독립 재현** `vitest --config docs/qa/evidence/stage-4a/qa-independent/vitest.qa.config.ts` | ✅ **14/14** | `11-qa-independent.log` |
| 12 | 오프라인 배너 브라우저 프로브 (393·320·320 텍스트확대·160) | ✅ 1줄 · 높이 54 · 잘림 0 · 콘솔 앱 로그 0 | `12-offline-banner-probe.json` · `qa-offline-cached-*.png` |
| 13 | `pnpm assets:optimize -- --check` | ✅ 4 마스터 검사 OK | `13-assets-check.log` |
| 14 | web 프로젝트 AC 라벨 테스트 목록 | ✅ 170건 전부 통과 | `14-web-ac-tests.log` |
| 15 | Scope: `ls apps/` · `ls -d apps/api supabase apps/mobile` | `apps/` = `web` 만 · 3경로 전부 No such file | `00-scope.log` |
| 16 | grep 묶음 (아래 각 AC) | 결과는 Matrix 증거 열 | — |

**QA 독립 재현 (명령 11)** — 구현자 테스트와 별개로 QA 가 작성한 단정. 실제 `RecordingController` × `createRecordingRuntime`(LocalRecordingStore · SessionOutbox · UploadQueue) × **실제 Mock 번들**(MockSessionApi · MockRecordingApi · MockUploadTransport) 조립. 모든 테스트 뒤 `console.*` 출력에 아이 이름(`Nova`)·`uploadToken`·OPFS/IndexedDB 경로 0건을 단정(afterEach). 파일: `docs/qa/evidence/stage-4a/qa-independent/stage4a-qa.test.ts`.

| QA 테스트 | 재현한 AC |
|---|---|
| success: Submit 직후 로컬 > 0 → drain 후 0 · 요청 순서 init → PATCH → complete · 세션 `analyzing` | 26 · 71 |
| client ConsentGate(`child_voice_data` 누락): start 후 **Mock 요청 로그 증가 0** · 로컬 파일 0 | 62 · 89 |
| `sessions:consent-missing`: 업로드 init 0 · 상태 ≠ recording | 62 |
| `recordings:recording-upload-failure`: 2시간 재시도 후 **파일 수 불변** · `analyzing` 아님 | 27 |
| `recordings:recording-deleted`: upload-tokens 호출 후 **파일 0** · complete 0 | 33 |
| offline: start·pause·resume·submit 동안 전이 요청 0 → online 후 `[recording, paused, recording, completed]` 순서 · 파일 0 | 66 |
| Discard online: `abandoned` 1건 · `completedReason` 없음 · 확정 후 파일 0 · 서버 `abandoned` | 113(4a) |
| Discard 서버 거절(상태 어긋남 주입): 로컬 **보존**(종료 조각 +1, 삭제 0) | 113(4a) |
| Discard offline: 전이 0 · 파일 보존 → online 후 `[recording, abandoned]` · 파일 0 | 113(4a) |
| 1799s `recording` → 1800s `completed{auto_timeout, recordedSeconds:1800}` 1건 · 로컬 > 1700 파일 보존 | 44 · 45 |
| 10s 녹음 → pause 60s → `recordedSeconds` = 10 불변 | 43 |
| 같은 IK + 같은 body = 같은 세션 · 다른 body = `IDEMPOTENCY_KEY_REUSED` | 37 |
| `recordings:upload-retry` 전체 흐름 2회 → 요청 로그 JSON **바이트 동일** | Mock 결정성 |
| `runtime.clearAll()` → 파일 0 · `recordings`/`chunks`/`outbox`/`uploads` 이름 공간 0 | 72 |

> 관찰: 실제 비동기 저장소(1800 청크)에서는 auto-timeout 전이 요청이 **마이크로태스크 여러 바퀴 뒤**에 나간다(메모리 sink 테스트보다 늦다). 결함 아님 — 전이는 저장 flush 뒤에 나가는 설계(`sinkChain`)다.

---

## 4. Requirement Matrix (정본 66건)

판정 범위 표기: **[Mock]** = Mock 부분 · **[로직]** = Controller/큐/저장소 부분 · **[화면→4b]** = `S4-F`·`S4-H2` 에서 판정 (handoff C-5·D-4·E-4 "남은 부분").

### 4.1 Scope (AC-4-01 ~ 03)

| AC | 판정 | 증거 |
|---|---|---|
| 01 | **PASS** | `ls apps/` = `web` · `ls -d apps/api supabase apps/mobile` = 3건 No such file (`00-scope.log`). Backend 런타임 코드(express·server·migration) 없음 |
| 02 | **PASS** | `router.tsx` path 목록에 session·reflection·feedback·`/settings/notifications` **0건**. grep `reflection\|/feedback\|settings/notifications\|91:691` (테스트 제외) → 주석 1 · Stage 1 error-copy(29종 전수, `226dccd`) · dev 목록 문구뿐. 4b 세션 화면 선행 구현도 0 |
| 03 | **FAIL** → `QA-4A-001` | grep: `apps/web/src/features/recording/model/upload-queue.ts:163` `readonly container: 'webm' \| 'mp4';` — contracts `RecordingContainer`(`D4-23`) 리터럴을 **앱 안에서 재선언**. 같은 파일군의 `local-records.ts:24`·`ports.ts:37` 은 `RecordingContainer` 를 import 해서 쓴다. 그 밖의 enum/전이표/`canTransition` 재선언·앱 내 `z.object/enum` 0건 |

### 4.2 Contracts (AC-4-05 ~ 20) — 전부 `packages/contracts` 단위 테스트 실행 증거 (`10-contracts-verbose.log`)

| AC | 판정 | 증거 |
|---|---|---|
| 05 | **PASS** | `sessions/` = create-session·session·transition·list(+index) · `recordings/` = upload·status · `notifications/` = preferences·push-device · `index.ts:30·33·35` re-export · `stage-4-surface.test` export 목록 일치 |
| 06 | **PASS** | `git diff 09ea9bf^ HEAD -- enums` = `index.ts` +3줄 · 신규 파일 3(`push-platform`·`recording-container`·`sticker`)뿐, 기존 enum 파일 diff 0. `enums.test` 기존 32 항목 스냅샷 통과 |
| 07 | **PASS** | `git diff 09ea9bf^ HEAD -- rules/session-transitions.ts` = **추가 2행**(`recording→abandoned`·`paused→abandoned`, caregiver, `['recorded']`) + 주석. 기존 12행·`canTransition()` 무변경. `session-transitions.test.ts:110-111` 14행 `toEqual` + 앞 12행 `toEqual` |
| 08 | **PASS** | `common/error-codes.ts` diff 0 · `error-envelope.test.ts:14-23` 29종 값·순서 전수 스냅샷 |
| 09 | **PASS** | `sessions.test` recorded+책 없음 거부 / `bookId`·`childBookId` 각 통과 |
| 10 | **PASS** | `create-session.ts:44` `.superRefine(createCustomTimeRefine())` · `selection.ts` diff = 입력 타입 `\| null` 확장 + 주석만(판정 로직 불변) · `sessions/` 에 `custom_time` 조건문 0 |
| 11 | **PASS** | `sessions.test` "목표는 4값뿐" · "analyzing·analyzed·failed·ready 거부" |
| 12 | **PASS** | `sessions.test` completed + reason 없음 실패 |
| 13 | **PASS** | 1800 통과 / 1801 실패 (요청·SessionSummary) |
| 14 | **PASS** | `canTransition('completed','analyzing',*,'conversation_only')` = false |
| 15 | **PASS** | `recordings.test.ts:33-34` Chromium·WebKit 원문(공백 포함 `audio/mp4; codecs=mp4a.40.2` — "`D4-27` 확인" 원문과 동일) parse 통과 · `:62-63` `audio/aac`·`audio/m4a` 거부 · `:100-107` partNo 1·20 통과 / 0·21·1766 실패 · `enums/recording-container.ts:11` 네이티브 추가 가능성 주석 · spike 리포트 §1(Chromium 153.0.8010.12 · WebKit 26.6 · macOS 26.5) · §5.1 `isTypeSupported` 매트릭스 |
| 16 | **PASS** | sha256 대문자·63·65·비hex 거부 |
| 17 | **PASS** | 완료 응답 `uploadStatus` literal `uploaded` + `expiresAt` 필수 |
| 18 | **PASS** | `notifications.test` `PushDevice` 키 = `{id, platform, lastSeenAt}`, token 섞여 와도 결과에 없음 |
| 19 | **PASS** | `PushPlatform` = ios·android·web 스냅샷 |
| 20 | **PASS** | grep `packages/contracts/src`(테스트 제외) `local_only\|failed_retrying\|stalled_48h\|PermissionState\|RecordingController` → `upload-status.ts:7` **주석 1건**뿐 · `local-storage-surface.test` 9건 |

### 4.3 Mock (AC-4-21 ~ 37)

| AC | 판정 | 판정 범위 · 증거 |
|---|---|---|
| 21 | **PASS** | `MockSessionApi.test`·`MockRecordingApi.test`·`MockNotificationApi.test` 전 메서드 응답 `*Schema.safeParse` |
| 22 | **PASS** [Mock] · 화면→4b | `MockSessionApi.test` "loading — 주입 timer 로 지연" |
| 23 | **PASS** [Mock] · 화면 = Stage 7 (`D4-40`) | "empty — list 가 items: []" |
| 24 | **PASS** [Mock] · 화면→4b | "error — 기본 INTERNAL_ERROR Error Envelope" + `errorCodes` 메서드>그룹 지정 |
| 25 | **PASS** [Mock] · 상태 보존 e2e→4b | "retry — 메서드별 1회차 실패 → 같은 입력 재시도 성공" |
| 26 | **PASS** | Mock 테스트 2 key + `upload-queue.test` 런타임 경로 + **QA 독립 재현** |
| 27 | **PASS** | `upload-queue.test` 파일 6개 그대로 + **QA 독립 재현**(2시간 재시도 후 파일 수 불변) |
| 28 | **PASS** | `MockRecordingApi.test` CONFLICT(0바이트) → resume 나머지만 · `upload-queue.test` PATCH offset `[0,0,640]` 합 = part 크기 |
| 29 | **PASS** | 로그 순서 `PATCH(거절) → upload-tokens → PATCH → complete` 정확 일치 · 로그에 토큰 0 (`request-log.ts:30-37` `uploadToken` 비밀 키) |
| 30 | **PASS** [Mock+큐] · 재시도 안내 화면→4b | `RECORDING_INCOMPLETE {partNos}` 지속 + 파일 보존 + 다음 시도 HEAD |
| 31 | **PASS** [Mock+큐] · 화면 e2e→4b | "offline-queued — 끊긴 동안 업로드 요청 0, online 신호 하나로 업로드 완료"(시계 불변 = 폴링 없음) · `window online → goOnline()` |
| 32 | **PASS** [로직] · 안내 화면→4b | "48h − 1ms 에는 없고 48h 에 정확히 1회" |
| 33 | **PASS** | `upload-queue.test` + **QA 독립 재현**(파일 0 · complete 0) |
| 34 | **PASS** | Mock 1회차 `SESSION_INVALID_TRANSITION{from,to}` · `controller-mock-api.test` `getDetail` 1회 → ready → 재시작 성공 |
| 35 | **PASS** [Mock] · 복귀 e2e→4b | "session-already-active — details.sessionId 로 진행 중 세션 조회" |
| 36 | **PASS** [Mock] · Route Guard e2e→4b | "세션 endpoint 전부 ONBOARDING_INCOMPLETE" |
| 37 | **PASS** | Mock 테스트 4건(재생·REUSED·다른 세션 같은 키·실패 미보관) + **QA 독립 재현** |

### 4.4 RecordingController (AC-4-43 ~ 49)

| AC | 판정 | 증거 |
|---|---|---|
| 43 | **PASS** | `recording-controller.test` "10초 녹음 → pause 60초 → 불변 → resume 5초 → 15" + **QA 독립 재현** |
| 44 | **PASS** | "누적 1800초에 completed(auto_timeout) 1건, 일시정지 시간은 세지 않는다"(1000+120 pause+800) + **QA 독립 재현**(실제 런타임·Mock 서버) |
| 45 | **PASS** | "청크 파일 수·총 바이트가 그대로"(1801 / 1801×256, discard 0) + **QA 독립 재현**(> 1700 파일 보존) |
| 46 | **PASS** [로직] | 경계 양쪽(−1ms / 0ms) · 리마인드 구독 1회 · 몰아 깨어남. ⚠️ 리마인드 **시점 값**은 `N-D1` 미결(필수 옵션, 테스트 300s) — 4b `S4-F` 전 결정 필요 |
| 47 | **PASS** | grep `from 'react` in `features/recording` = 0 · `.tsx` 0 · `recorder-adapter-surface.test` 4건 |
| 48 | **PASS** | 테스트 목록: caregiver 10 케이스 + server/worker 5행 + sweeper + 거부 샘플 7 + 종착 후 + 대화 전용 (`14-web-ac-tests.log`) |
| 49 | **PASS** | 결정 = **요청 전 차단(1차)** + 서버 거절 시 재동기화(2차) — 거부 샘플 "요청 0건, 상태 불변" + AC-34 테스트 |

### 4.5 PRD §13 예외 처리 (4a 해당분)

| AC | 판정 | 판정 범위 · 증거 |
|---|---|---|
| 62 | **PASS** [로직] · 버튼 차단 e2e→4b | 클라이언트 게이트 차단 시 녹음기 호출 0 · 전이 요청 0 (`controller-mock-api.test` + **QA 독립 재현**: 요청 로그 증가 0) · fail-closed · 재개 재확인 · 서버 `CONSENT_REQUIRED` 2차 방어 |
| 66 | **PASS** | `recording-runtime.test` + `session-outbox.test`(같은 IK 재전송·추월 없음·5xx 보존) + **QA 독립 재현**(순서 일치) |
| 67 | **PASS** [로직] · 화면→4b | 48h 경계 양쪽 + "오프라인이라 시도 못 해도 적재 시각부터" |
| 71 | **PASS** | `upload-queue.test:59-` complete 응답 **직전 6 · 직후 0** (서버 확정 후·큐 수신 전 측정) + **QA 독립 재현** |
| 72 | **PASS** | `session-cleanup.test` 순서(signOut → draft → 카드 캐시 → 로컬 녹음 → Query) · `recording-runtime.test` clearAll · e2e 로그아웃 블록 통과 · **QA 독립 재현** 이름 공간 4개 0 |

### 4.6 Stage 3 이월 (AC-4-81 ~ 88)

| AC | 판정 | 증거 |
|---|---|---|
| 81 | **PASS (accepted: D4-34)** | **일반 판정 요소 전부 충족**: ① `PushPermissionPort`(`getStatus`·`request`·`getToken` + `platform`) `push-permission-port.ts:35-47` ② Web 구현 = `Notification.permission`/`requestPermission()` 만 — grep `PushManager\|serviceWorker\|applicationServerKey\|VAPID\|onesignal\|firebase\|@capacitor` → **주석 2건뿐**, `Notification` 접근은 `web-push-permission.ts` 1파일 ③ `push:push-permission-denied` (`MockPushPermissionPort.test`) ④⑤ contracts·`PushPlatform` 3값(AC-18·19) ⑥ 선택 지점 `app/providers/apiClients.ts:46`(mock)·`:54`(web) 1곳 ⑦ 등록 hook `usePushPermission.test` 4건. **화면(사전 안내 표면) = `D4-34` 사용자 수용** |
| 81-B | `BACKEND_INTEGRATION_PENDING` | 실제 push 발송·Web Push 구독 — `P4-BIP-13` · `RU-19`·`RU-20` |
| 82 | **PASS** | e2e `home.spec:497`(텍스트 `Go online to start a session`) · `:543` ×2(393·320 높이 **54** · 1줄 · 본문 0) 통과. **QA 브라우저 프로브**(`12-offline-banner-probe.json`): 393·320 높이 54 · 제목 Range top 1개 · `white-space: normal` · `text-overflow: clip`(ellipsis 아님) · 잘림 0 · 가로 overflow 0 → ④ 줄바꿈 허용·잘라내기 0 충족. 54px 밀림 = **`AD-S4-11` 등록(2026-10-18, user)** 범위 — QA 스크린샷 `qa-offline-cached-393-z1.png`(393: 하트가 카드 뒤) · baseline `s4-home-offline-cached-320.png`(320: 하트 보임 — `AD-S4-11` 서술과 일치). dev 패널 baseline 미포함 확인 |
| 83 | **PASS** | `activity-card-cache.test` 13건(1일 유지/2일 폐기·버전·parse 실패·다른 아이) · e2e `home.spec:578` "로그아웃하면 카드 캐시가 지워진다" 통과 |
| 84 | **PASS** | `pnpm assets:optimize -- --check` OK(`13-assets-check.log`) · avif·webp 8파일 · `<picture>` 2곳 · e2e `home.spec:462` `currentSrc` AVIF 통과. 비고: PNG = 마스터(상한 초과 시에만 재기록) — handoff J-8 ② 해석 |
| 85 | **PASS** | `git diff c4d72c5 -- shared/assets/book-covers` 0 · Plan §2.4·§3.1·`P4-BIP-17` 기록 · `assets-optimize.mjs:17,22` Stage 8 게이트 주석 |
| 85-B | (법무 게이트) | 상용 표지 교체 법무 확인 = Stage 8 게이트 `P4-BIP-17` — Backend 구현이 아니라 **법무**다. Plan 이 ✅ 로 표기해 §7 목록에 함께 둔다 |
| 86 | **이동 (4b `S4-F`, `D4-35`)** | 판정하지 않음 |
| 87 | **PASS** | e2e `library.spec:559` `library.savebook:error` 통과 · `scenario-method-override.test` 2건 |
| 88 | **PASS** | e2e `library.spec:580` `Where to buy` 새 탭 링크 · `library-sheets.test` · fixture `books.example`(RFC 2606) |

### 4.7 Privacy / Security (AC-4-89 ~ 94)

| AC | 판정 | 증거 |
|---|---|---|
| 89 | **PASS** | **QA 독립 재현**: 동의 누락 상태에서 start 후 Mock 요청 로그 **증가 0**(전이·init·PATCH 없음). 신규 push 등록 hook 은 어떤 화면에도 마운트되지 않음(`D4-34`) |
| 90 | **PASS** | QA 재현 14건 afterEach 콘솔 단정(아이 이름·`uploadtoken`·저장소 경로 0) · 브라우저 프로브 콘솔 = vite/React DevTools 안내뿐 · 신규 코드의 `logger` 호출 = `activity-card-cache.ts` 3곳(`errorName` 만) · 요청 로그 `uploadToken` redaction |
| 91 | **PASS** | grep `service_role\|sk-…\|OPENAI\|ANTHROPIC_API\|DEEPGRAM\|api_key=` (src·dist·packages) 0 · `VITE_*` = `API_MODE`·`API_BASE_URL`·`MOCK_SCENARIO` 3종 · `.env*` 없음 · dist 의 `uploadToken` 은 schema **필드명**과 `Bearer ${e.uploadToken}`(응답값 사용)뿐 |
| 92 | **PASS** | `git diff c4d72c5 -- **/package.json` 의 의존성 추가 = root devDep `sharp 0.35.5`(`D4-31`) 1건 · `apps/web` dependencies 8개(react·router·query·zod·workspace) · `assert:no-mocks` sharp 흔적 0 |
| 93 | **PASS** | 녹음 바이트·색인 = `ChunkByteStore`(OPFS/IndexedDB)·`LocalKeyValueStore`(IndexedDB) · `features/recording`·`recording-storage` 의 `localStorage` 참조 0 · 브라우저 프로브 `localStorage` 키 = `haru.activity-card.v1` 뿐 · URL 에 오디오·경로 없음 |
| 94 | **PASS** | `mockObjectKey` = `recordings/${recordingId(uuid)}/part-N` · 토큰 `mock-upload-token-<n>` — 이름·이메일 0 |
| 94-B | `BACKEND_INTEGRATION_PENDING` | 실제 Storage 경로·서명 토큰 발급 — `P4-BIP-05` |

### 4.8 신규 AC (4a 해당분)

| AC | 판정 | 판정 범위 · 증거 |
|---|---|---|
| 104 | **PARTIAL** → `QA-4A-003` | 4a = **경계 기록 중 코드 주석 부분**. ① Figma 외 요소 0 ② Stage 5 카드 선행 구현 0 (완료 화면 자체가 4a 에 없음 — AC-02 grep) ③ **QA 리포트 기록 = 이 행으로 충족** · **코드 주석 = 0건**(grep `29:62\|y 468\|S4F-14\|AC-4-104` in `apps/web/src`·`packages` → 0) |
| 108 | **NOT VERIFIED** → `NV-4A-1` | **측정 경로는 PASS**: dev `/__dev/ui/recording-measure`(`DevGallery.tsx:45`) = 제품 파이프라인(Web 어댑터·`CaptureTimeline`·`LocalRecordingStore`) · `capture-timeline.test` 3건 통과 · spike 리포트 §1 환경 · §7.1 숨김 시도 5종 실패 기록(재실행 가능). **측정 결과는 없다**: ① 탭 비활성 ② 백그라운드/최소화 ③ iOS 화면 잠금 — 3종 모두 미측정. "`D4-27` 확인"(사용자 iPhone, 2026-10-18)은 **foreground** 녹음만 확인(OPFS · part 1 · 청크 8 / 8.66초 · 205,269 bytes · `audio/mp4; codecs=mp4a.40.2` · 디코드 8.66초 · 재생 정상) — 화면 잠금·앱 전환 **미확인**, iOS/Safari 버전 **미기록**. Android 모바일 Web 기기 없음(`N4-21`) |
| 109 | **PASS** | `apps/web` deps 에 lottie·rive·gsap·framer-motion 0 · `.lottie`/`.riv` 파일 0 · 신규 코드 `.animate(` 0 (rAF 1건 = Stage 2 포커스 타이밍) |
| 110 | **FAIL** → `QA-4A-002` | 4a = **코드 부분**. `packages/ui/src/button/IconButton.css:46` `.haru-icon-button--glass { box-shadow: var(--shadow-rest); }` — `--shadow-bubble` 교체(`D4-11`) **미적용**, `--shadow-rest` 참조 1건 잔존. `<IconButton` JSX 35행 / 21파일(테스트 제외) 확인 — 수치는 Plan 과 일치. baseline 재생성(③④)은 4b |
| 113 | **PASS** [저장소·Outbox] · UI→4b | `recording-runtime.test` ②③⑤ + `controller-mock-api.test` Discard 2건 + **QA 독립 재현 3건**(online 확정 후 삭제 · 서버 거절 시 보존 · offline Outbox 적재·보존 → online 후 삭제). 요청 body 에 `completedReason` 없음(`D4-13` 안 A) |
| 113-B | `BACKEND_INTEGRATION_PENDING` | 서버 측 part 정리 — `P4-BIP-21` · `RU-6` |

### 4.9 판정 대상 아님 (기록)

| AC | 기록 |
|---|---|
| AC-4-04 · 73 ~ 80 | 이동 (Out of Scope, `D4-1`) |
| AC-4-86 | 이동 (4b `S4-F`, `D4-35`) |
| AC-4-105 · 106 | 폐기 |
| AC-4-123 · 124 | 4b (`S4-F`) |
| AC-4-38 ~ 42 · 50 ~ 61 · 63 ~ 65 · 68 ~ 70 · 95 ~ 103 · 107 · 111 · 112 · 114 ~ 122 | 4b (정본 66건 밖). 단 회귀(101~103 성격)는 §8 에 실행 결과로 기록 |

---

## 5. Findings

```
QA-4A-001 | Severity: Low
Requirement: AC-4-03 (contracts 밖 Enum 중복 선언 0건) · rules/architecture.md §5
Steps to reproduce:
  grep -rnE "'webm'\s*\|\s*'mp4'" apps/web/src --include='*.ts' | grep -v __tests__
Expected: 0건 — 컨테이너 타입은 @haru/contracts 의 RecordingContainer(D4-23) 만 쓴다
Actual: apps/web/src/features/recording/model/upload-queue.ts:163
        `readonly container: 'webm' | 'mp4';` (PreparedPart 내부 interface)
        같은 모듈군 local-records.ts:24 · ports.ts:37 · recording-controller.ts:259 는 RecordingContainer 를 import 한다
Evidence: grep 출력 (위). 현재 값 집합은 일치하나, D4-23 이 "후속 네이티브 단계에서 컨테이너 추가"를
          예고했으므로 enum 확장 시 이 지점만 조용히 어긋난다
Suspected area: features/recording/model/upload-queue.ts (PreparedPart)
수정 지시: 리터럴 유니온을 `RecordingContainer` 타입 import 로 교체. 다른 곳 수정 불필요
```

```
QA-4A-002 | Severity: Medium
Requirement: AC-4-110 ① (4a = 코드 부분) · D4-11 (S4F-12 옵션 A) · Figma IconButton drop 1겹
Steps to reproduce:
  sed -n 44,48p packages/ui/src/button/IconButton.css
Expected: .haru-icon-button--glass 의 box-shadow = var(--shadow-bubble) (1겹), --shadow-rest 참조 0건
Actual: `box-shadow: var(--shadow-rest);` (3겹) — 교체되지 않음. handoff(S4-A~J·후속)에 D4-11/AC-4-110 작업 기록 없음
Evidence: IconButton.css:46 · `grep -n "D4-11\|AC-4-110" docs/qa/stage-4a-handoff.md` → 0건
Suspected area: packages/ui/src/button/IconButton.css · Plan §16.4.1 작업 단위(S4-A·B·C·D·E·J)에 이 변경을 담는 단위가 없다
수정 지시 (둘 중 하나 — 사용자 결정 필요):
  (a) development-agent 가 4a 에서 교체 + R-BASELINE-1 ⑤ 절차(클러스터 분해 → 설명 안 되는 클러스터 0 →
      --update-snapshots=all) + 단독 e2e 재실행. ⚠️ 교체만 하면 Stage 1~3 baseline 이 깨지므로 baseline
      재생성이 같은 패스에 들어와야 한다 (Plan 은 baseline 을 4b 로 나눴다 — 코드만 4a 에 두면 4a e2e 가 FAIL 한다)
  (b) 사용자가 AC-4-110 코드 부분을 4b 로 이동 결정 → plan-agent 가 §16.4.3 정본 목록 갱신 → 재판정
  QA 는 어느 쪽도 가정하지 않는다
```

```
QA-4A-003 | Severity: Low   (PARTIAL)
Requirement: AC-4-104 ③ "하단이 비어 있는 것이 의도임이 코드 주석과 QA 리포트에 기록" (4a = 코드 주석 부분)
Steps to reproduce:
  grep -rnE "29:62|y ?468|S4F-14|AC-4-104" apps/web/src packages --include='*.ts' --include='*.tsx' --include='*.css'
Expected: Stage 4/5 경계(29:62 y 0~468, 그 아래 53px 빈 간격 + Stage 5 영역)가 의도임을 남기는 코드 주석 ≥ 1
Actual: 0건. ①② 는 충족(완료 화면·Stage 5 카드 모두 미구현), QA 리포트 기록은 이 리포트 §4.8 로 충족
Evidence: grep 0건
Suspected area: 주석을 붙일 완료 화면 코드가 4a 에 존재하지 않는다 — Plan 의 4a/4b 분할 자체의 문제로 보인다
수정 지시 (사용자 결정 필요): (a) 4a 에 주석 자리(예: route 표 주석·완료 화면 예정 위치)를 두는 것으로 충족시키거나
  (b) AC-4-104 코드 주석 부분을 4b(S4-H1 완료 화면)로 이동. QA 는 어느 쪽도 가정하지 않는다
```

### 5.1 관찰 (Finding 아님 — 판정에 영향 없음)

| # | 내용 |
|---|---|
| O-1 | **handoff 미기재 변경** — 미커밋 `apps/web/src/dev/recording-measure/{measure-core.ts, RecordingMeasurePage.tsx}` +156줄(`preparePlayback()` 등 재생 기능, iPhone 확인용으로 보임) · `dev/dev.css` +5. dev 전용이며 `assert:no-mocks` 로 Production 제외 확인. handoff 후속 절에 파일 목록 추가 권장 |
| O-2 | `recordingApi.status` endpoint(`GET /v1/recordings/:recordingId` 가정)가 `docs/API_CONTRACTS.md` §4 표에 없다 — 문서 `:1028` 이 스스로 미결로 표기. plan-agent 확인 대상, Stage 8 Handoff 전 해소 필요 |
| O-3 | `shared/platform/recorder/recorder-adapter.ts:27` `RecorderPlatform = 'web' \| 'ios' \| 'android'` — `PushPlatform` 과 값 집합이 같으나 **다른 개념**(캡처 플랫폼, client-only)이라 QA-4A-001 과 구분했다. 통합 여부는 판단 대상 |
| O-4 | `RecorderAdapter` interface 가 `ARCHITECTURE.md §10.4` 초안과 다르다(handoff D-8 ②) — plan-agent 문서 반영 대기 |
| O-5 | dev Scenario Panel 이 메서드 override(`group.method:key`)를 직렬화하지 않는다(C-8 ③) — URL 로는 전부 전환된다 |
| O-6 | AC-4-85 근거 중 "`PLANNING` 참조" — `PLANNING.md` 에 `P3-BIP-19` 문자열이 없다. Plan §2.4·§10 로 충분하여 판정에 영향 없음 |
| O-7 | 4b `S4-F` 전 결정 대기: `N-D1`(리마인드 시점) · `N-D2`(대화 전용 방치 타이머) · E-8 ③(로그아웃이 미업로드 녹음을 지운다는 안내 여부) · E-8 ④(재진입 정책) |

---

## 6. NOT VERIFIED 항목과 수동 테스트 절차

### `NV-4A-1` — AC-4-108 (Web 녹음의 백그라운드·탭 비활성·화면 잠금 한계 측정)

**이유**: 에이전트 환경에서 페이지를 `hidden` 으로 만들 수 없다(spike 리포트 §7.1 — 5가지 수단 실패, 재실행 가능). Playwright Chromium 은 background throttle 비활성 플래그가 기본이라 원리적으로 측정 불가(§7.3). 실기기 없음. Backend 와 무관하므로 PENDING 이 아니다.

**이미 확인된 것 (사용자 실측 인용, approvals "`D4-27` 확인" 행)**: iPhone Safari **foreground** 에서 `/__dev/ui/recording-measure` 로 청크 1초 단위 수신(8청크/8.66초) · OPFS 저장 · 재생 정상. **화면 잠금·앱 전환·탭 전환은 측정하지 않았고 iOS/Safari 버전이 기록되지 않았다.**

**수동 절차** (도구 = 제품 파이프라인 측정판, 실제 마이크):

1. Mac: `pnpm dev` 가 `--host` 로 노출된 상태(같은 Wi-Fi)에서 대상 기기 브라우저로 `https://<Mac IP>:5173/__dev/ui/recording-measure` 를 연다. **기기·OS·브라우저 버전을 먼저 적는다**(iOS: 설정 > 일반 > 정보).
2. 측정판 ① 녹음 시작 → 청크가 1초마다 늘어나는지 확인(마이크 권한 허용).
3. 아래 3상황을 **각각 별도 회차**로, 숨김 상태를 **60초** 유지한다:
   - ① 탭 비활성 — 데스크톱 Chrome·Safari: 다른 탭으로 전환 / iOS Safari: 다른 탭으로 전환
   - ② 백그라운드 — 데스크톱: 창 최소화 / iOS: 홈으로 나가 다른 앱 열기
   - ③ 화면 잠금 — iOS: 전원 버튼
4. 복귀 → ② 종료·요약. 기록할 값: `hiddenIntervals[].chunksDuring`(숨김 구간 청크 수) · `maxChunkGapMs` · 인터럽션 기록(`background`·`capture_lost`·`chunk_stalled`) · 복귀 후 녹음이 이어졌는지(새 part 여부) · 재생 길이 vs 경과 시간.
5. 결과를 spike 리포트(정본 `docs/qa/stage-4a-spike-report.md`, `D4-41`)에 **시각·청크 수·중단 시점·환경**으로 남긴다.
6. Android 모바일 Web 은 기기 확보 전까지 `NOT VERIFIED` 유지(`N4-21`).

**Verdict 영향**: 이 항목이 유일한 NOT VERIFIED 다. FAIL 2건 해소 후에도 **항목별 사용자 명시 수용** 없이는 4a = `INCOMPLETE` 다 (Plan §16.4.4-5-1, `rules/qa.md` §2).

---

## 7. BACKEND_INTEGRATION_PENDING 목록

Frontend 부분은 §4 에서 별도 판정되었다. Contract 가 요구사항을 표현하지 못하거나 Mock 이 Contract 와 다른 경우는 발견되지 않았다.

### 7.1 AC 분할 행

| 항목 | 대기 사유 | Handoff 대상 |
|---|---|---|
| AC-4-81-B | 실제 push 발송 · Web Push 구독(VAPID) · 토큰 기준 upsert 계정 분리 | `BACKEND_HANDOFF.md` (`P4-BIP-13`, `RU-19`·`RU-20`) |
| AC-4-94-B | 실제 Storage 경로 · signed upload token 발급·만료 | `RECORDING_UPLOAD_SPEC.md` (`P4-BIP-05`) |
| AC-4-113-B | `abandoned` 수신 시 서버 측 업로드 part 정리 | `RECORDING_UPLOAD_SPEC.md` (`P4-BIP-21`, `RU-6`) |
| AC-4-85-B | 상용 표지 교체 **법무** 확인 (Backend 아님 — Stage 8 게이트) | `BACKEND_HANDOFF.md` (`P4-BIP-17`) |

### 7.2 Plan §10 기대 동작 (4a 가 Contract·Mock 으로 대신한 것)

| ID | 내용 | Handoff |
|---|---|---|
| `P4-BIP-01` | 서버 전이 강제 (`SESSION_INVALID_TRANSITION`) | `BACKEND_HANDOFF` · `ERROR_CODES` |
| `P4-BIP-02` | 녹음 시작·업로드 확정·분석 요청 시 서버 측 동의 강제 (`RU-11`) | `AUTH_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| `P4-BIP-03` | 30분 상한 서버 검증 (`RU-12`: 재개 요청은 `recordedSeconds` 미포함) | `RECORDING_UPLOAD_SPEC` |
| `P4-BIP-04` | ready 10분 server sweeper | `BACKEND_HANDOFF` |
| `P4-BIP-05`·`06` | signed token · TUS 수신 + part 검증 (`RU-7`) | `RECORDING_UPLOAD_SPEC` |
| `P4-BIP-07` | complete 시 `completed → analyzing` + `expiresAt` (`RU-5`·`RU-18` 도착 순서 무관) | `RECORDING_UPLOAD_SPEC` · `DATA_REQUIREMENTS` |
| `P4-BIP-08` | Raw Audio 90일 Storage 객체 삭제 | `DATA_REQUIREMENTS` |
| `P4-BIP-09` | 48h 업로드 실패 push | `BACKEND_HANDOFF` |
| `P4-BIP-10` | 스티커 멱등 지급 | `DATA_REQUIREMENTS` |
| `P4-BIP-12` | 분석 Job 연결 | `ANALYSIS_PIPELINE_REQUIREMENTS` |
| `P4-BIP-14` | outbox 재전송의 `occurredAt` 기준 순서 적용 · **IK 재생 최소 14일** (`RU-14`) | `BACKEND_HANDOFF` · `API_CONTRACTS` §1 |
| `P4-BIP-15` | 세션별 녹음 삭제 시 Storage·parts·audit | `DATA_REQUIREMENTS` |
| `P4-BIP-16` | `conversation_only` → `ANALYSIS_NOT_AVAILABLE` | `ERROR_CODES` |
| `P4-BIP-11`·`18` | 버블·스티커 문구 서버 제공 (4b 화면과 함께 검증) | `ANALYSIS_PIPELINE_REQUIREMENTS` · `BACKEND_HANDOFF` |

### 7.3 handoff 가 추가한 Backend 사실 (`RU-*`)

| ID | 내용 | Handoff |
|---|---|---|
| RU-1 | `mimeType` 은 엔진 원문 — WebKit `; ` 공백. 문자열 동일성 비교 금지 (`D4-23`, iPhone 실측 원문 일치) | `RECORDING_UPLOAD_SPEC` |
| RU-2 | part = 연속 녹음 구간 (30분 ≈ 1766 청크 / part 정상 1개) (`D4-24`) | `RECORDING_UPLOAD_SPEC` |
| RU-3 | 복원 녹음은 비탐색 WebM 일 수 있다 — `duration` 메타데이터 불신 | `RECORDING_UPLOAD_SPEC` · `ANALYSIS_PIPELINE_REQUIREMENTS` |
| RU-4 | 진행 중 세션 1개 · 같은 `clientSessionKey` = 같은 세션 | `BACKEND_HANDOFF` |
| RU-8 | `recordingApi.status` endpoint 경로 (O-2) | `API_CONTRACTS` §4 |
| RU-9 | error `details` 모양 (`partNos`·`sessionId`·`{from,to}`) | `ERROR_CODES` |
| RU-10 | `POST /v1/push-devices` 토큰 기준 upsert (IK 없음) | `BACKEND_HANDOFF` |
| RU-13 | 인터럽션 `paused` 는 사용자 pause 와 구분 안 됨 | `BACKEND_HANDOFF` |
| RU-15 | 크래시 복구 `recordedSeconds`·part 길이 추정치 — 허용 오차 필요 | `RECORDING_UPLOAD_SPEC` |
| RU-16 | 로컬 14일 삭제로 녹음 없는 `completed` 세션 발생 — 서버 정리 필요 | `ANALYSIS_PIPELINE_REQUIREMENTS` · `DATA_REQUIREMENTS` |
| RU-17 | 디코드 실패 part 도 업로드됨 | `RECORDING_UPLOAD_SPEC` |
| RU-21 | 카드 캐시 수명 = 기기 로컬 날짜 (시간대 경계) | `DATA_REQUIREMENTS` |

---

## 8. Regression 결과

| 범위 | 결과 |
|---|---|
| 전체 단위 테스트 | **152 files / 2140 tests** 통과 (handoff J-3 수치와 일치) |
| 전체 e2e (Stage 1~3 핵심 경로 포함 — 인증·동의·온보딩·Home 덱·서재·탭·Toast·shadow·visual baseline) | **295 passed / 0 failed** (단독 6.5m). 기존 baseline 변경 0 |
| `IconButton` 그림자 | 미교체(QA-4A-002) 이므로 Stage 1~3 baseline 은 **현재 그대로 유효**. 교체 시 전수 재생성 필요 |
| 신규 `any` / `@ts-ignore` / `@ts-expect-error` | `git diff c4d72c5` 추가 줄 0 (eslint-disable 1건 = dev 측정판 `<audio>` caption) |
| 신규 HEX / `rgb()` / Tailwind arbitrary / inline style | `git diff c4d72c5 -- apps packages`(design-tokens·테스트·dev 제외) 추가 줄 **0** |
| 레이어·feature 경계 | `lint:boundaries` 위반 0 · feature 간 직접 import 0 · Page 변경 = `HomeTopBar.tsx` 조립(배너 컴포넌트 배치)뿐 |
| Mock 하드코딩 | `mocks` import = `app/providers/apiClients.ts`(동적 import, 선택 지점) · `dev/` · `test/` 뿐. features·entities·pages 에 fixture 문자열(`Nova`·`books.example`·`mock-web-push`) 0 |
| Mock 결정성 | `stage4-determinism.test` + **QA 독립 재현**(요청 로그 JSON 바이트 동일) |

### 8.1 남은 가값 목록 (FAIL 사유 아님)

| 상태 | ID |
|---|---|
| dev gallery 등재 · `waiting` | `P-01` · `P-02` · `P-04` · `P-16` · `P-17` · `P-23` · `P-24` |
| 대장 등재 · 토큰 미구현(4b AC-4-119) | **`P-25`** (`Discard` 면 `#aeaeb2` + 흰 라벨 2.211:1) — `packages/design-tokens/src` 에 `P-25`·`--haru-gray-2` 0건(4b 범위라 정상) |
| gallery 미등재 (Stage 3 이월 `S3-PROV-2`) | `P-18` ~ `P-22` |
| 재제시 대기 (Stage 0 `#10-4`) | `P-01`·`P-02`·`P-04`·`P-16`·`P-23`·`P-24`·`P-25` (7건, `S4-PROV-1`) |

### 8.2 사용자 결정·수용이 필요한 항목

| # | 항목 | 필요한 것 |
|---|---|---|
| 1 | **`QA-4A-002`** (AC-4-110 코드 부분) | (a) 4a 에서 교체 + baseline 전수 재생성 **또는** (b) 4b 로 이동 결정 |
| 2 | **`QA-4A-003`** (AC-4-104 코드 주석) | (a) 4a 주석 위치 지정 **또는** (b) 4b(완료 화면)로 이동 결정 |
| 3 | **`NV-4A-1`** (AC-4-108) | 실기기 측정(§6) **또는** 항목별 명시 수용 (`PASS (accepted: NV-4A-1)`) |
| 4 | `QA-4A-001` | 결정 불필요 — development-agent 수정 1줄 |
| 참고 | 이미 수용됨 | AC-4-81 화면 = `D4-34` · 54px 밀림 = `AD-S4-11` |

---

## 9. 재검증 이력

| 회차 | 일자 | Verdict | 비고 |
|---|---|---|---|
| 1 | 2026-10-18 | **FAIL** | FAIL 2 (`QA-4A-001` Low · `QA-4A-002` Medium) · PARTIAL 1 (`QA-4A-003`) · NOT VERIFIED 1 (`NV-4A-1`) · accepted 1 (AC-4-81 / `D4-34`) |
| 2 | 2026-10-18 | **`PASS (accepted: D4-34, NV-4A-1)`** | 상세 = §10. `QA-4A-001` FAIL → **PASS**(해소) · `QA-4A-002` → **이동**(`D4-42`) · `QA-4A-003` → **이동**(`D4-43`) · `NV-4A-1` **사용자 명시 수용** |

---

## 10. 2회차 재검증 (2026-10-18) — ⭐ 현재 유효

### 10.1 Summary

| 항목 | 값 |
|---|---|
| **Stage Verdict** | **`PASS (accepted: D4-34, NV-4A-1)`** |
| 실행 일시 | 2026-10-18 (KST), 1회차 직후 |
| 대상 상태 | `main` @ `6fbf69f` + 미커밋 변경. 1회차 대비 Product Code 변경 = **2파일 4줄**(`features/recording/model/upload-queue.ts` · `mocks/fixtures/prompt-sets.ts`, handoff "QA Fix Loop 1") |
| 판정 기준 | Plan 개정 3.1 §16.4.3 **정본 64건** · 사용자 결정 `D4-42`·`D4-43`·`NV-4A-1` 수용 (`docs/decisions/stage-4-approvals.md` §1 `:78`~`:80`) |
| 판정 집계 (64) | **PASS 62** · **PASS (accepted: D4-34) 1** (AC-4-81) · **NOT VERIFIED (accepted: NV-4A-1) 1** (AC-4-108) · PARTIAL 0 · FAIL 0 |
| 이동 (판정 안 함) | AC-4-104 → 4b `S4-H1` (`D4-43`) · AC-4-110 → 4b `S4-F` (`D4-42`) · AC-4-86 → 4b `S4-F` (`D4-35`, 1회차와 동일) |
| 남은 Finding | **없음** (Open 0). `QA-4A-002`·`QA-4A-003` 은 결함 해소가 아니라 **범위 이동**으로 닫혔다 — 4b 에서 같은 AC 로 다시 판정된다 |

**Verdict 계산** (`rules/qa.md` §2): FAIL 0 · PARTIAL 0 · NOT VERIFIED 1 은 `NV-4A-1` 로 **사용자 항목별 명시 수용** → `INCOMPLETE` 사유 아님. AC-4-81 은 Plan 특례(`D4-34`)대로 accepted. ⇒ `PASS (accepted: D4-34, NV-4A-1)`.
⛔ 이 Verdict 로 Stage 5 를 시작하지 않는다 (Plan §16.4.4-6, `D4-9`). 다음은 4b.

### 10.2 Commands Executed (2회차 — 전부 QA 직접 실행)

| # | 명령 | 결과 | 로그 (`docs/qa/evidence/stage-4a/r2/`) |
|---|---|---|---|
| 1 | `ls apps/` · `ls -d apps/api supabase apps/mobile` | `apps/` = `web` 만 · 3경로 No such file | `00-scope.log` |
| 2 | `pnpm typecheck` | exit 0 | `typecheck.log` |
| 3 | `pnpm lint` | exit 0 | `lint.log` |
| 4 | `pnpm lint:boundaries` | no dependency violations (719 modules, 2630 deps) | `lint-boundaries.log` |
| 5 | `pnpm format:check` | exit 0 | `format-check.log` |
| 6 | `pnpm test` | **152 files / 2140 tests** passed (1회차와 동일) | `test.log` |
| 7 | `pnpm build` | exit 0 | `build.log` |
| 8 | `pnpm assert:no-mocks` | MOCK·DEV sentinel 0 · `haru-dev-` 0 · sharp 흔적 0 (4파일) | `no-mocks.log` |
| 9 | QA 독립 재현 재실행 (`vitest --config docs/qa/evidence/stage-4a/qa-independent/vitest.qa.config.ts`) | **14/14** | `qa-independent.log` |
| 10 | `pnpm test:e2e` **단독** (시작 전 Playwright 프로세스 0 · 5173 dev 서버 유지) | **295 passed (6.7m)**, 실패·flaky 0. `e2e/__screenshots__` 상태 실행 전후 동일(기존 미추적 2장만) | `e2e.log` · `screens-before.txt` |
| 11 | contracts enum 값 집합 ↔ 앱 문자열 리터럴 유니온 전수 대조 (QA 스크립트, scratchpad) | 아래 §10.3 | — |

### 10.3 `QA-4A-001` 재검증 — **FAIL → PASS (해소)**

**직접 확인**:
- `git diff -- apps/web/src/features/recording/model/upload-queue.ts` → `type RecordingContainer` 를 `@haru/contracts` 에서 import, `PreparedPart.container: RecordingContainer`. 그 밖의 변경 0.
- `git diff -- apps/web/src/mocks/fixtures/prompt-sets.ts` → `PromptSeed.phase?: PromptPhase | null` (contracts `PromptPhaseSchema = z.enum(['pre','post'])`, `enums/prompt-phase.ts:10`). 값 집합 동일 → fixture 내용 변화 0 (e2e 295 통과로 회귀 없음 확인).
- 재현 명령 `grep -rnE "'webm'\s*\|\s*'mp4'|'mp4'\s*\|\s*'webm'|'pre'\s*\|\s*'post'" apps/web/src packages --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v packages/contracts` → **0건**.

**같은 패턴 전수 탐색 (QA 독립)**: `packages/contracts/src` 의 `z.enum([...])`·`as const` 배열 **46개 값 집합**을 추출해, `apps/web/src`·`packages/ui/src`(테스트 제외) 의 한 줄 문자열 리터럴 유니온과 비교했다. 결과 — **같은 집합(EQUAL) 1 · 부분집합(SUBSET) 3**, 그 밖 0:

| 위치 | 대조 결과 | QA 판단 |
|---|---|---|
| `shared/platform/recorder/recorder-adapter.ts:27` `RecorderPlatform = 'web' \| 'ios' \| 'android'` | `PushPlatformSchema` 와 **EQUAL** | **재선언 아님 — agent 판단에 동의.** 녹음 캡처 플랫폼(앱 내부 포트 속성, `web-recorder-adapter.ts:237`)이며 어떤 contract 요청·응답에도 실리지 않는다(grep `platform` in contracts = `push-device.ts` 의 `PushPlatformSchema` 뿐, push 등록은 `port.platform` 이 별도 `PushPermissionPort` 에서 온다). 값 집합 우연 일치. 1회차 관찰 `O-3` 유지(통합 여부는 판단 대상, Finding 아님) |
| `features/recording/model/recording-controller.ts:168` `initial.status: 'ready' \| 'paused'` | `SessionStatus` **SUBSET** | **재선언 아님 — 동의.** 시작 상태를 2값으로 **좁히는 입력 제약**이며 `:250` 에서 `let status: SessionStatus = initial.status` 로 대입되므로 contracts 값이 바뀌면 **컴파일러가 잡는다**(조용히 어긋나지 않는다 — QA-4A-001 의 위험 성격과 다르다). 선택적 개선: `Extract<SessionStatus, 'ready' \| 'paused'>` |
| `features/recording/model/local-records.ts:16` `LocalRecordingState = 'recording' \| 'completed'` | `SessionStatus` **SUBSET** | **재선언 아님 — 동의.** 로컬 녹음 레코드 수명(크래시 판별, `local-recording-store.ts:187·198·290`)이며 서버 세션 상태가 아니다. AC-4-20 이 **로컬 상태를 contracts 에 넣지 말라**고 요구하므로 앱 안에 두는 것이 맞다 |
| `mocks/me/MockMeApi.ts:178` `failure(code: 'INTERNAL_ERROR' \| 'AUTH_TOKEN_EXPIRED')` | `ERROR_CODES` **SUBSET** (QA 추가 발견) | **재선언 아님.** Mock 내부 헬퍼 인자 제한이며 `buildErrorEnvelope(code)`(ErrorCode 타입)로 넘어가 컴파일러가 검사한다. Stage 4 신규 코드 아님. Finding 아님 |

한계: 여러 줄에 걸친 유니온(`=\n | 'a'\n | 'b'`)은 별도 multiline grep 으로 확인했고 0건이었다.

⇒ **AC-4-03 = PASS** (contracts 밖 enum·전이표 재선언 0).

### 10.4 Requirement Matrix 변경분 (64건 기준)

1회차 §4 의 판정·증거는 아래 행을 제외하고 **그대로 유효**하다. 2회차에 Product Code 변경은 위 2파일뿐이고, 전체 단위·e2e·QA 독립 재현을 다시 돌려 1회차 PASS 의 실행 증거가 **유지됨**을 확인했다.

| AC | 1회차 | 2회차 | 근거 |
|---|---|---|---|
| AC-4-03 | FAIL (`QA-4A-001`) | **PASS** | §10.3 |
| AC-4-81 | PASS (accepted: D4-34) | **PASS (accepted: D4-34)** | 변경 없음. Plan §16.4.3 특례 |
| AC-4-104 | PARTIAL (`QA-4A-003`) | **이동 (4b `S4-H1`, `D4-43`)** — 판정 안 함 | 정본 64건 밖 |
| AC-4-108 | NOT VERIFIED (`NV-4A-1`) | **NOT VERIFIED (accepted: NV-4A-1)** | approvals `:80` 사용자 명시 수용. 측정 경로 판정(1회차 §4.8)은 유지. **측정은 4b `S4-H2` 착수 전 선행** (§6 절차 그대로) |
| AC-4-110 | FAIL (`QA-4A-002`) | **이동 (4b `S4-F`, `D4-42`)** — 판정 안 함 | 정본 64건 밖. `IconButton.css:46` `--shadow-rest` 는 그대로이며 4b 에서 `D4-11` 적용 + baseline 재생성과 함께 판정 |

**64건 구성 확인**: `01~03`(3) · `05~37`(33) · `43~49`(7) · `62·66·67·71·72`(5) · `81~85·87~94`(13) · `108·109·113`(3) = **64**. 각 행 판정 = 1회차 §4.1~§4.8 (AC-4-03 만 §10.3 으로 교체).

### 10.5 Findings 상태

| ID | Severity | 1회차 | 2회차 |
|---|---|---|---|
| `QA-4A-001` | Low | FAIL | **Closed — 해소 확인** (§10.3) |
| `QA-4A-002` | Medium | FAIL | **Closed — 범위 이동** (`D4-42`, AC-4-110 → 4b `S4-F`). 4b QA 가 같은 내용을 다시 판정한다 |
| `QA-4A-003` | Low | PARTIAL | **Closed — 범위 이동** (`D4-43`, AC-4-104 → 4b `S4-H1`) |
| `NV-4A-1` | — | NOT VERIFIED | **Accepted** (사용자 명시 수용, 2026-10-18) — 측정 의무는 4b `S4-H2` 전으로 이월 |

신규 Finding: **0**. 1회차 관찰 `O-1`~`O-7` 은 그대로 유효(판정 영향 없음). 특히 `O-2`(`recordingApi.status` endpoint 가 `API_CONTRACTS.md` §4 표에 없음)는 **Stage 8 Handoff 전 해소 필요**로 남는다.

### 10.6 BACKEND_INTEGRATION_PENDING (Stage 8 Handoff 대상) — 1회차 §7 과 동일, 변동 없음

| 묶음 | 수 | 내용 |
|---|---|---|
| AC 분할 행 | **3** + 법무 게이트 1 | AC-4-81-B · 94-B · 113-B (+ AC-4-85-B 상용 표지 법무 확인 — Backend 아님, Stage 8 게이트) |
| Plan §10 기대 동작 | **19** | `P4-BIP-01`~`18` · `21` |
| handoff Backend 사실 | **21** | `RU-1`~`RU-21` (§7.2·§7.3 에 매핑) |

Contract 가 요구사항을 표현하지 못하거나 Mock 이 Contract 와 다른 사례: 0 (1회차와 동일).

### 10.7 Regression 결과 (2회차)

| 범위 | 결과 |
|---|---|
| 전체 단위 | 152 files / 2140 tests 통과 |
| 전체 e2e (Stage 1~3 핵심 경로 + 4a 이월 화면) | **295 passed / 0 failed / flaky 0** (단독 6.7m) · baseline 변경 0 |
| QA 독립 재현 | 14/14 (요청 로그·콘솔 PII 단정 포함) |
| 정적 검사 | typecheck · lint · lint:boundaries · format:check · build · assert:no-mocks 전부 통과 |
| Scope | `apps/api`·`supabase`·`apps/mobile` 부재 |
| 남은 가값 | 1회차 §8.1 과 동일 (변동 없음) |
