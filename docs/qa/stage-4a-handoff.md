# Stage 4a Handoff — `S4-A` (Web 녹음 spike)

Status: **HANDOFF (2026-10-14, development-agent)** · 작업 단위 **`S4-A` 만**. `S4-B`~`S4-J` 는 착수하지 않았다.
> ⭐ **추가 (2026-10-14)**: 작업 단위 **`S4-B` (contracts)** 절을 이 파일 **맨 아래**에 덧붙였다. `S4-C` 이후는 착수하지 않았다.
측정 기록 본문: **`docs/qa/stage-4a-spike-report.md`** (수치·측정 방법·환경 전부)

> ⚠️ **이 단위는 "구현" 이 아니라 "측정" 이다.** 산출물은 **문서**이며, 코드는 **dev 전용 계측기**다.
> 제품 코드(`features/recording` · `RecordingController` · `LocalRecordingStore` · `UploadQueue` · 화면)와
> `packages/contracts` 는 **한 줄도 건드리지 않았다** — 다음 작업 단위의 일이다.

---

## 1. Gate 확인 결과

| Gate | 결과 |
|---|---|
| 1. `docs/plans/stage-4-plan.md` 존재 + `Status: APPROVED` | ⚠️ **파일은 있으나 `Status: DRAFT (2026-10-13, plan-agent …)`** — §5 참조 |
| 2. `docs/design/stage-4-design-spec.md` 존재 + `Status: APPROVED` | ⚠️ **파일은 있으나 `Status: DRAFT (2026-10-12, design-agent) · 개정 2026-10-13`** — §5 참조 |
| 3. 이전 Stage QA `PASS` | ✅ `docs/qa/stage-3-qa-report.md` §14.1 (5회차) = `PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)` |
| 4. Plan 이 PRD / Figma 와 모순되지 않음 | ✅ `S4-A` 는 비시각·비기능 측정이라 Figma 와 접점이 없다. Plan §16.1 이 요구한 7항목을 그대로 따랐다 |
| 5. In Scope 에 Backend 구현 작업 없음 | ✅ `S4-A` 범위에 Backend·STT·AI·worker·cron·Storage 업로드 **없음**. `apps/api/` · `supabase/` **미생성 확인** (§4) |

## 2. 구현(=측정)한 요구사항 / AC

| ID | 내용 | 결과 |
|---|---|---|
| **`S4-A` ①~⑦** | Plan §16.1 의 7개 측정 항목 | ✅ 4항목 측정 · ⚠️ 1항목 부분 · ⛔ 1항목 측정 불가 · ✅ 1항목 측정 (판정표 = spike 리포트 §0) |
| **AC-4-108** | Web 녹음의 백그라운드·탭 비활성·화면 잠금 한계를 **측정·기록** | ⛔ **측정 불가** — 5가지 수단 전부 실패(리포트 §7.1). **실패 과정 자체를 재실행 가능한 코드(`probeHideTechniques()`)와 기록으로 남겼다.** 실기기 수동 절차 = 리포트 §7.4. ⚠️ **AC 충족 아님** — QA 는 `NOT VERIFIED` 로 판정해야 한다 |
| **`C4-OPEN-1`** | `partNo` 상한 | ✅ **결정 가능 상태** — 리포트 §9 (상한 20 유지 가능 + 정의 주석 필수, 50 상향 권고) |
| **`C4-OPEN-2`** | `mimeType` 집합 | ✅ **결정 가능 상태** — 리포트 §5 (현재 enum 이 **4항목 어긋남**, 권고 A/B) |
| **`N4-09`** | 로컬 보관 상한 판단 근거 | ✅ 근거 확보 — 리포트 §8.2 (용량 압박 없음 / `persisted()` **false**) |

## 3. 생성·수정 파일

| 파일 | 성격 |
|---|---|
| `apps/web/src/dev/recording-spike/spike-core.ts` | **신규** — dev 전용 측정 엔진 |
| `apps/web/src/dev/recording-spike/spike-store.ts` | **신규** — dev 전용 청크 영속 계층 (OPFS + IndexedDB) |
| `apps/web/src/dev/recording-spike/RecordingSpikePage.tsx` | **신규** — dev 전용 수동 측정 화면 (`/__dev/ui/recording-spike`) |
| `apps/web/src/dev/DevGallery.tsx` | **수정** — route 1행 + import 1행 + 머리말 (`GalleryLayout` **밖** — baseline 보호) |
| `apps/web/src/dev/dev.css` | **수정** — `.haru-dev-spike-readout` 1블록 (semantic token 만) |
| `scripts/spike/recording-spike-measure.mjs` | **신규** — Playwright 측정 드라이버 |
| `docs/qa/stage-4a-spike-report.md` | **신규** — 측정 기록 본문 |
| `docs/decisions/stage-4-recording-spike.md` | **신규** — 경로 포인터 (§5-③) |
| `docs/qa/stage-4a-handoff.md` | **신규** — 이 파일 |

**건드리지 않은 것**: `packages/**` **전체** · `apps/web/src/{app,pages,features,entities,shared,mocks}` **전체** · `docs/API_CONTRACTS.md` · `docs/plans/**` · `docs/design/**` · `PLANNING.md`.

## 4. 검증 명령 결과

spike 리포트 **§13** 에 표로 있다. 요약: 8개 **전부 통과**, 기준선 동일 (`test` **1631 / 118** · `test:e2e` **285**).
⚠️ `test:e2e` **1회차는 31.2m + 허위 실패 2건** 이어서 단독 재실행했다 (2회차 **285 passed / 6.8m**) — 리포트 §13.1.
⚠️ Orchestrator 재검증에서 `format:check` 실패(`spike-core.ts` · `recording-spike-measure.mjs`) → `prettier --write` 로 수정 (2026-10-14). 원인 추정: 두 파일을 format:check 실행 이후에 마지막으로 고쳤는데 재실행하지 않고 이전 결과를 보고했다. 변경은 줄바꿈·trailing comma 뿐이며 수정 후 `format:check` · `typecheck` · `lint` 통과.

**Scope 증거**

```
$ ls apps/        → mobile 없음 · api 없음 (web 만)
$ ls supabase     → No such file or directory
$ pnpm assert:no-mocks → __HARU_DEV_SENTINEL__ 0건 · haru-dev- 0건 (dist 4파일 검사)
```

## 5. ⛔ 승인·결정이 필요한 항목 (development-agent 가 처리하지 않았다)

0. ℹ️ **승인 자체를 뒷받침하는 정황은 있다** — `docs/API_CONTRACTS.md` 머리말이 **`Rev 8 (2026-10-13, plan-agent — Stage 4 Plan 승인 후 적용)`** 으로 갱신되어 있고(이 작업과 무관한 plan-agent 의 변경이다), §3.3 이 `partNo`·`mimeType` 을 *"`S4-A` spike 확정 대기"* 로 열어 두었다. 즉 **Plan 승인 후 절차가 이미 돌았다.** 남은 것은 아래 1의 `Status:` 줄 갱신뿐이다.
1. ⚠️ **Gate 1·2 — Plan·Design Spec 의 `Status:` 가 둘 다 `DRAFT` 다.** 작업 지시는 *"Stage 4 Plan 과 Design Spec 이 사용자 승인을 받았다 (2026-10-13, '승인 — 4a 구현 착수')"* 라고 전했지만, `rules/workflow.md` §3 이 요구하는 **문서 `Status:` 갱신이 되어 있지 않고**, `docs/decisions/stage-4-approvals.md` 에도 **Plan 자체의 승인 기록은 없다**(`D4-1`~`D4-20` 은 개별 결정이다). `S4-A` 는 제품 코드·contract 를 만들지 않는 **측정 단위**여서 진행했으나, **`S4-B` 부터는 Status 갱신이 선행되어야 한다.** → Orchestrator 가 `Status: APPROVED (2026-10-13, user)` 로 갱신할 사항.
2. **설계 변경 12건** (`M-1`~`M-12`, 리포트 §10). 그중 contract 를 바꾸는 것은 **`M-1`(`mimeType` 형태)** · **`M-2`(`partNo`)** 이며 **`S4-B` 착수 전에 결정**이 필요하다.
3. **산출물 경로 불일치** — Plan §16.1·AC-4-108 은 `docs/decisions/stage-4-recording-spike.md`, 작업 지시는 `docs/qa/stage-4a-spike-report.md`. 본문을 후자에 두고 전자를 포인터로 두었다. **정본 선택이 필요**하다.
4. **`M-9` timeslice 기본값** — PRD 에 *"크래시 시 최대 몇 초 손실까지 허용"* 기준이 없다 (리포트 §8.3).
5. **`M-12` WebKit 미검증 상태로 `S4-D`·`S4-E` 를 진행할지** — iOS 가 WebKit 이고 청크 가능 여부가 **미확정**이다.
6. **spike 코드의 수명** — Plan 은 *"제품 코드에 남기지 않는다"* 고 했다. 지금 남긴 이유는 **AC-4-108 실기기 측정 도구가 이 화면**이기 때문이다 (리포트 §12 말미). 실기기 측정 후 삭제 여부 결정 필요.

## 6. Mock 시나리오

**추가·변경 0건.** `S4-A` 는 Mock Layer 를 건드리지 않는다 (`S4-C` 의 일).

⚠️ **그런데 `S4-C` 로 넘어가는 문제가 하나 생겼다.** `docs/API_CONTRACTS.md` §5.4 의 **`web-background-warning`** 항목은
*"실제 중단 여부·조건은 **`S4-A` ⑥ 실측으로 채운다**"* 고 적는다. **⑥ 은 측정 불가였다**(리포트 §7).
→ 이 시나리오가 **무엇을 경고하는지(어떤 조건에서 중단되는지)를 측정값으로 채울 수 없다.** 선택지:
ⓐ **실기기 측정(§7.4)을 먼저** 해서 채운다 · ⓑ *"Web 에서는 보장할 수 없다"* 는 **조건 없는 안내**로 먼저 만들고 실측 후 다듬는다.
⚠️ **사용자·Orchestrator 결정 필요** — Agent 가 임의로 고르지 않았다.

**`UploadTransport` 시그니처** (`API_CONTRACTS.md` §5.1.1 이 `S4-A` ①②④ 실측에 의존시킨 항목)에는 재료가 생겼다:
청크는 **고정 주기 · 평균 16KB**(1000ms) 단위로 들어오고, part 1개 = **청크 수백~천 개의 이어 붙임**이며, 복구는
**색인 순서대로 바이트를 잇는 것**으로 충분하다 (리포트 §2.1·§3.2·§4.1). → `S4-E` 가 쓸 수 있다.

## 7. `BACKEND_INTEGRATION_PENDING` 예상 항목

`S4-A` 는 **Backend 의존 항목을 새로 만들지 않았다**. 다만 측정이 Backend 요구사항에 더할 사실 3건:

| 항목 | 내용 | Handoff 문서 |
|---|---|---|
| **RU-1** | 업로드 `mimeType` 은 **엔진이 정규화한 원문 문자열**이고 **WebKit 은 `;` 뒤에 공백을 넣는다** — 서버 검증이 문자열 동일성 비교를 하면 깨진다 | `RECORDING_UPLOAD_SPEC.md` |
| **RU-2** | **part 는 연속 녹음 구간**이며 timeslice 청크가 아니다 (30분 ≈ **1766 청크** / part 는 정상 1개) | `RECORDING_UPLOAD_SPEC.md` |
| **RU-3** | 복원된 녹음은 **비탐색(non-seekable) WebM 스트림**일 수 있다 (청크 이어 붙임). 서버·STT 가 `duration` 메타데이터를 신뢰하면 안 된다 — 실측: `<audio>` 가 `media error code=4` | `RECORDING_UPLOAD_SPEC.md` · `ANALYSIS_PIPELINE_REQUIREMENTS.md` |

⚠️ 이 3건은 **Stage 8 에서 Handoff 문서에 반영할 후보**이며, 이 단위에서 문서를 만들지 않았다.

## 8. Scope 경계에서 보류한 항목

| 보류 | 이유 |
|---|---|
| `packages/contracts` 전이표 2행 추가 (`D4-13`) | **`S4-B`** 의 범위다. 지시가 *"contracts 도 아직 건드리지 마라"* |
| `RecordingController` · `RecorderAdapter` · `LocalRecordingStore` · `UploadQueue` | **`S4-D`·`S4-E`** |
| 세션 화면 · Prompt Drawer · 완료 화면 | **`S4-F`·`S4-G`·`S4-H`** (4b) |
| `docs/API_CONTRACTS.md` 수정 | 설계 변경은 **승인 후** (§5-2) |
| Stage 3 이월(`QA-3-001`~`003`) | **`S4-J`** |
| 실제 Storage 업로드 | Frontend-only Scope — 구현하지 않는다 |

## 9. QA 에게

- **판정 대상은 "측정이 실제로 이루어졌는가" 와 "기록이 재실행 가능한가"** 다. 재실행: 리포트 §12.
- **AC-4-108 은 `NOT VERIFIED` 로 판정해야 한다** (측정 불가 — 리포트 §7). `BACKEND_INTEGRATION_PENDING` 이 **아니다** (Backend 와 무관하고, `R4-05` 대로 **후속 네이티브 단계 의존**이다).
- `apps/api/` · `supabase/` 미생성과 Production 번들 격리는 **§4 의 명령으로 직접 확인**할 수 있다.

---

# `S4-B` — contracts (2026-10-14, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-B` 만**. `S4-C`(Mock) 이후는 착수하지 않았다. **커밋하지 않았다.**

## B-1. Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | `Status: APPROVED (2026-10-13, user)` — 둘 다 확인 |
| 선행 | `S4-A` COMPLETE (위 절). `N4-04` → **`D4-25` 로 해소**(2026-10-14) |
| 결정 | `D4-2` · `D4-13` · **`D4-23` · `D4-24` · `D4-25`** (approvals §1, 2026-10-14) |
| Scope | contracts + 단위 테스트 + `docs/API_CONTRACTS.md` 만. Backend 작업 0 |

## B-2. 생성 · 수정 파일 (`packages/contracts/src/`)

| 구분 | 파일 |
|---|---|
| 신규 `sessions/` (4 + index) | `create-session.ts` · `session.ts` · `transition.ts` · `list.ts` · `index.ts` |
| 신규 `recordings/` (2 + index) | `upload.ts` · `status.ts` · `index.ts` |
| 신규 `notifications/` (2 + index) | `preferences.ts` · `push-device.ts` · `index.ts` |
| 신규 enum 3 | `enums/push-platform.ts` · `enums/sticker.ts` · `enums/recording-container.ts` (`D4-23`) |
| 수정 | `rules/session-transitions.ts`(**2행 추가 + 주석**) · `activity/selection.ts`(`createCustomTimeRefine` **입력 타입만** `ReadingContext \| null` 로 확장 — 판정 로직 불변) · `enums/index.ts`(+3 export) · `index.ts`(+3 도메인 export, 헤더 주석) |
| 신규 테스트 4 | `__tests__/sessions.test.ts` · `recordings.test.ts` · `notifications.test.ts` · `stage-4-surface.test.ts` |
| 수정 테스트 3 | `__tests__/session-transitions.test.ts`(12→14 행 + **14 행 전수 스냅샷**) · `enums.test.ts`(32→35 항목 + `discarded` 부재) · `error-envelope.test.ts`(**29 종 전수 스냅샷** 추가) |
| 문서 | `docs/API_CONTRACTS.md` **Rev 8.1** — 헤더 · §2.2 · §3.1 · §3.2 · §3.3 · §3.9 에 "구현 반영" 블록 (설계 변경 없음) |

파일 배치 1건 차이: `StickerAwardSchema` 를 Plan §7.2 표의 `transition.ts` 가 아니라 **`session.ts`** 에 두었다 — `SessionDetail.sticker` 도 쓰므로 `session.ts ↔ transition.ts` 순환 import 를 피했다. 소비자 import 경로(패키지 진입점)는 같다.

## B-3. 검증 명령 (마지막 수정 이후 전부 재실행, 2026-10-14)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 (root · e2e · contracts · ui · web) |
| `pnpm lint` | ✅ exit 0 |
| `pnpm test` | ✅ exit 0 — **122 files / 1722 tests** (기준선 118 / 1631 → **+4 / +91**). contracts 단독 22 files / 423 tests |
| `pnpm lint:boundaries` | ✅ exit 0 — no dependency violations (610 modules) |
| `pnpm build` | ✅ exit 0 (기존 chunk size 경고만) |
| `pnpm format:check` | ✅ exit 0 — All matched files use Prettier code style |
| `ls apps/api supabase apps/mobile` | 전부 **No such file or directory** |

e2e 는 실행하지 않았다 (contracts 만 변경 — 지시대로).

## B-4. AC 판정 근거 (AC-4-05 ~ 20 — 판정은 QA 가 한다)

| AC | 근거 (테스트) |
|---|---|
| 05 | `stage-4-surface.test.ts` — `sessions/`·`recordings/`·`notifications/` 각 index 의 export 목록 **정확 일치** + 진입점에서 **같은 참조**로 보임 |
| 06 | `enums.test.ts` — 기존 32 항목 스냅샷 **불변**(`SessionStatus` 8 · `SessionMode` 2 · `CompletedReason` 3 · `AnalysisOutcome` 2 · `UploadStatus` 5). `discarded`·폐기 사유 값 부재 테스트 |
| 07 | `session-transitions.test.ts` — **14 행 전수 `toEqual` 스냅샷**(앞 12 행 원본 + `D4-13` 2 행), 행 키 집합 `{from,to,actor,modes}` 고정, 384 조합 전수. `git diff` = 2 행 + 주석뿐 (B-5) |
| 08 | `error-envelope.test.ts` — **29 종 값·순서 전수 스냅샷**. `common/error-codes.ts` 미수정 |
| 09 | `sessions.test.ts` — recorded + 책 없음 거부 / `bookId` · `childBookId` 각각 통과 / conversation_only 통과 / 카드 경로도 책 필수 |
| 10 | `superRefine(createCustomTimeRefine())` **재사용** — 실패 메시지가 팩토리 문구와 동일함을 단정. 조건문 복제 0 (`grep -n custom_time packages/contracts/src/sessions/` → 주석만) |
| 11 | `ClientSessionTransitionTargetSchema = SessionStatusSchema.extract([4값])` — `analyzing`·`analyzed`·`failed`·`ready` 거부 |
| 12 | `to='completed'` + `completedReason` 없음 → 실패 (path `completedReason`) |
| 13 | `recordedSeconds` 1800 통과 / 1801 실패 (요청 · `SessionSummary` 둘 다) |
| 14 | `canTransition('completed','analyzing', *, 'conversation_only')` = false (3 actor) |
| 15 | `recordings.test.ts` — spike §5.2 **실측 Blob type 5종 원문 그대로 parse**(공백 포함), `audio/aac`·`audio/m4a` 거부, container ↔ base type 불일치 거부, `partNo` 1·20 통과 / 0·21·**1766** 실패, bytes 상한. **네이티브 포맷 추가 가능성 주석** = `enums/recording-container.ts` |
| 16 | `sha256` 소문자 hex 64 — 대문자 · 63 · 65 · 비hex 거부 |
| 17 | 완료 응답 `uploadStatus` literal `uploaded` + `expiresAt` 필수 (누락 · 다른 4값 거부) |
| 18 | `notifications.test.ts` — `PushDevice` shape 키 = `{id, platform, lastSeenAt}`, `token` 섞여 와도 parse 결과에 없음 |
| 19 | `PushPlatform` = `ios, android, web` — 스냅샷(`enums.test.ts`) + 개별 테스트 |
| 20 | grep `packages/contracts/src`(테스트 제외) `local_only\|failed_retrying\|stalled_48h\|'uploading'\|'queued'\|PermissionState\|RecordingController` → **주석 1건**(`upload-status.ts:7`, 기존) + **`analysis-job.ts:10 'queued'`**(서버 `AnalysisJobStatus`, Stage 1 기존 — 업로드 큐 상태 아님). `stage-4-surface.test.ts` 가 진입점 export 이름에 queue/permission/controller/recorder **0건**을 단정 |

D4-25 고정: `sessions.test.ts` — 서재 경로 `readingContext: null` parse, 필드 생략은 거부(null 명시 필요).

## B-5. 승인 범위 외 변경 0 근거 (`R4-16`)

- `git diff packages/contracts/src/rules/session-transitions.ts` = **추가 2 행** + 주석 4 줄. 기존 12 행 · `canTransition()` · `SessionTransitionActorSchema` 무변경.
- `git diff packages/contracts/src/common/error-codes.ts` = **없음** (error code 신규 0).
- 기존 enum 파일 diff = **없음** (`enums/index.ts` 의 export 3 줄 추가뿐).
- `grep -rnE "abandonedReason|AbandonedReason|discarded" packages/contracts/src`(테스트 제외) → **주석 1건**(전이표의 "만들지 않는다" 설명)뿐. 진입점 export 중 `/abandon/i` = `READY_ABANDON_SECONDS`(Stage 1) 하나 — 테스트로 단정.
- ⚠️ **명시적 예외 (승인됨)**: `RecordingContainer` enum **신설**과 `mimeType` enum → 원문 문자열 **교체**는 **`D4-23`(사용자 결정 2026-10-14)** 승인 범위다. `R4-16` 의 "enum 값 추가 0" 은 **기존 enum** 에 대한 것이며 이 신설은 그 위반이 아니다. `PushPlatform`·`StickerType` 신설은 승인된 Plan §7.2 · `C4-OPEN-5` 범위다.
- 승인 결정 외에 추가한 **검증 규칙**(계약 의미를 좁히는 것 — 보고 대상): ① 요청 안 `partNo` 중복 금지(init · complete · refresh) — `recording_parts UNIQUE(recording_id, part_no)` 근거 ② `container` ↔ `mimeType` base type 일치 ③ `NotificationPreferences.reminderDays` 중복 금지 · 최대 7 ④ `UpdateNotificationPreferences` 최소 1 필드. 전부 기존 error code `VALIDATION_FAILED` 로 표현된다.

## B-6. Mock 시나리오

없음 — Mock 은 `S4-C`. 이 단위는 schema 만 만든다.

## B-7. `BACKEND_INTEGRATION_PENDING` 예상 (Handoff 반영 대상)

- 서버가 `mimeType` **원문을 보관**하고 `container` 로 분기할 것 / 후속 네이티브 단계의 AAC 등 컨테이너 추가 시 enum 확장 (`D4-23`, `D4-1`).
- 서버 `partNo` 의미 = 연속 녹음 구간, 상한 20 (`D4-24`).
- 서버가 `abandoned` 전이(사용자 `Discard` 포함)를 받아 업로드된 part 를 스스로 정리 (`P4-BIP-21`). 폐기 사유는 Frontend 가 보내지 않는다 (`N4-30`).
- `StickerAward.title`·`message` 를 서버가 제공 (`P4-BIP-18`), 같은 세션 재요청 시 같은 지급 (FR-19 멱등).
- `PushDevice` 응답에 token 미반환 · 토큰 암호화 저장.

## B-8. 발견 문제

| 구분 | 내용 |
|---|---|
| Blocking | 없음 |
| Non-blocking | ① `StickerAward` 부제 필드명을 Plan 의 후보 중 **`message`** 로 정했다(Design Spec §2.7.1 의 `stickerAward.message` 와 일치). 제목은 `title`. ② `SessionDetail.recording`·`sticker` 를 `?`(optional) 가 아니라 **`nullable`(필드 필수)** 로 구현 — 부재를 명시값으로 받는다. ③ `NotificationPreferences.reminderTime` 을 Stage 3 Plan 의 `?` 가 아니라 `nullable` 로 구현(`DATA_MODEL` `reminder_time null`). `S4-C`/`S4-J` 에서 불편하면 보고 바람 |
| NEEDS_DECISION | 없음 — 단, `S4-A` 리포트 §9.3-3 의 *"상한 20 → 50 권고"* 는 `D4-24` 로 **20 유지가 결정**되어 반영하지 않았다 |

---

# `S4-C` — Mock 기반 (2026-10-14~15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-C` 만**. `S4-D`(RecordingController) 이후는 착수하지 않았다. **커밋하지 않았다.**

## C-1. Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | `Status: APPROVED (2026-10-13, user)` — 둘 다 확인 |
| 선행 | `S4-B` COMPLETE (위 절, 미커밋) |
| 결정 | `D4-1` · `D4-4` · `D4-12` · `D4-13` · **`D4-26`**(web-background-warning = 조건 없는 안내) |
| Scope | `apps/web/src/mocks/**` · `apps/web/src/shared/api/**` · Adapter 등록(`ApiClients` 타입 + Mock/Http 조립) · 테스트 · e2e 1건 · `docs/API_CONTRACTS.md` 구현 반영. **`packages/contracts` 변경 0** (버그 없음). Backend 작업 0 |

## C-2. 생성 · 수정 파일

| 구분 | 파일 (`apps/web/src/` 기준) |
|---|---|
| API Client Interface (신규 4) | `shared/api/session-api.ts` · `recording-api.ts` · `notification-api.ts` · `upload-transport.ts`(`UploadTransport` + `UploadOffsetConflictError`) |
| Http 골격 (신규 4) | `shared/api/http/HttpSessionApi.ts` · `HttpRecordingApi.ts` · `HttpNotificationApi.ts` · `TusUploadTransport.ts` |
| Mock 공통 (신규 3) | `mocks/common/delivery.ts`(공통 4종 분기 + `errorCodes`) · `idempotency.ts`(IK 보관·재생) · `connectivity.ts`(`offline-queued`) |
| Mock Adapter (신규 6) | `mocks/sessions/MockSessionApi.ts` · `sessions/sessionState.ts`(공유 서버 상태) · `recordings/MockRecordingApi.ts` · `recordings/MockUploadTransport.ts` · `recordings/recordingScenarios.ts` · `notifications/MockNotificationApi.ts` |
| scenario (신규 1) | `mocks/recorder/recorderScenarios.ts` — `web-background-warning` · 인터럽션 3종 · 마이크 거부 등 **RecorderAdapter mock 재현 계획** (mock 자체는 `S4-D`) |
| fixture (신규 3) | `mocks/fixtures/sessions.ts` · `recordings.ts` · `notifications.ts` |
| 수정 — scenario 문법 | `mocks/scenarios/types.ts`(`METHOD_SEPARATOR`·`methodScope`) · `scenario-url.ts`(`group.method` 허용) · `scenario-store.ts`(`resolve(def, method?)` · `resolveScoped` · `beginScenarioCall`) · `scenarios/index.ts` |
| 수정 — 조립 | `shared/api/types.ts`(`ApiClients` + `sessions`·`recordings`·`uploadTransport`·`notifications`) · `shared/api/index.ts` · `shared/api/http/index.ts` · `shared/api/http/httpClient.ts`(`send()` — 204 응답용, `request` 와 같은 오류 해석) · `mocks/index.ts`(번들 + 브라우저 `online` 연결) |
| 수정 — 기존 Mock | `mocks/library/MockLibraryApi.ts`(각 메서드가 메서드 이름으로 resolve — 그룹 카운터·동작 불변) · `mocks/request-log.ts`(`uploadToken` 을 비밀 키에 추가) |
| 테스트 (신규 8) | `mocks/__tests__/MockSessionApi.test.ts` · `MockRecordingApi.test.ts` · `MockNotificationApi.test.ts` · `recorder-scenarios.test.ts` · `scenario-method-override.test.ts` · `stage4-determinism.test.ts` · `stage4-support.ts`(지원) · `shared/api/__tests__/http-stage4.test.ts` |
| 테스트 (수정 2) | `app/providers/__tests__/providers.test.tsx` · `app/guards/__tests__/guard-integration.test.tsx` — `ApiClients` stub 에 4 도메인 추가 (stub 만, 단정 불변) |
| e2e (수정 1) | `e2e/library.spec.ts` — AC-4-87 1건 추가 |
| 문서 | `docs/API_CONTRACTS.md` **Rev 8.2** — 머리말 · §5.1.1(`UploadTransport` 초안) · §5.4(구현 반영 블록). 설계 변경 없음 |

## C-3. 검증 명령 (마지막 수정 이후 전부 재실행)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm test` | ✅ exit 0 — **129 files / 1809 tests** (기준선 122 / 1722 → **+7 / +87**) |
| `pnpm lint:boundaries` | ✅ no dependency violations (639 modules) |
| `pnpm build` | ✅ exit 0 (기존 chunk size 경고만) |
| `pnpm format:check` | ✅ All matched files use Prettier code style |
| `pnpm assert:no-mocks` | ✅ `__HARU_MOCK_SENTINEL__` 0 · `__HARU_DEV_SENTINEL__` 0 · `haru-dev-` 0 (dist 4파일) |
| `pnpm test:e2e` (단독, 다른 Playwright 없음 확인 후) | ✅ exit 0 — **286 passed (6.1m)**, 1 worker. 신규 1건(AC-4-87) 포함. 실행 이유: 기존 `MockLibraryApi` 수정(메서드 resolve). baseline 변경 0 (`git status e2e/__screenshots__` 비어 있음) |
| `ls apps/api supabase apps/mobile` | 전부 No such file or directory |

## C-4. Mock 시나리오 — 목록과 전환 방법

**전환**: `?scenario=<group>:<key>` (URL > dev 패널 > `VITE_MOCK_SCENARIO` > `success`). ⭐ **신규 — 메서드 단위**: `?scenario=<group>.<method>:<key>` (메서드 이름 소문자). 한 계층 안 **메서드 > 그룹 > wildcard**. 단위 테스트는 `createMockApiClientsBundle({ search, timer: createImmediateTimer(), errorCodes?, connectivity? })`.

| group | key | 동작 요지 |
|---|---|---|
| `sessions` | `success` · `loading` · `empty`(list) · `error` · `retry`(메서드별) · `offline` | 공통 |
| | `invalid-transition` | 전이 1회차 `SESSION_INVALID_TRANSITION` `{from: 서버 상태, to}`, 상태 불변 → `getDetail` 재동기화 후 진행 |
| | `session-already-active` | `create` → `SESSION_ALREADY_ACTIVE` `{sessionId: MOCK_ACTIVE_SESSION_ID}` — 그 세션(`recording`) 조회 가능 |
| | `onboarding-incomplete` | 세션 4 메서드 전부 `ONBOARDING_INCOMPLETE` |
| | `consent-missing` | `to='recording'` 만 `CONSENT_REQUIRED` |
| | `abandoned` | 서버 sweeper — ready 세션이 `abandoned` 로 보인다 |
| | `recording-discarded` | `success` 와 같은 API — 폐기는 상태 규칙 (아래) |
| `recordings` (API + Transport 공유) | `success` · `recording-upload-success` | init → PATCH → complete → `uploaded`, 세션 `completed` 면 `analyzing` |
| | `loading` · `error` · `retry` · `offline` | 공통 (API·전송 양쪽) |
| | `consent-missing` | init · refreshTokens · complete `CONSENT_REQUIRED` |
| | `recording-upload-failure` · `upload-stalled-48h` | 전송 지속 `NetworkError`(0 바이트) + complete 지속 `INTERNAL_ERROR` |
| | `upload-retry` | part 마다 1회 절반 수신 후 `NetworkError` → `resume` 이 나머지만 |
| | `upload-token-expired` | init 이 만료 토큰 → 전송 `UPLOAD_TOKEN_EXPIRED` → `refreshTokens` 유효 토큰 |
| | `recording-incomplete` | complete 지속 `RECORDING_INCOMPLETE` `{partNos}` |
| | `offline-queued` | 끊김에서 시작 → `connectivity.goOnline()` / 브라우저 `online` 이벤트로 복구 |
| | `recording-deleted` | 만료 토큰 → `refreshTokens` `RECORDING_DELETED` |
| | `recording-discarded` | `success` 와 같음 (상태 규칙) |
| `notifications` | `success` · `loading` · `error` · `retry` · `offline` | 설정 부분 갱신 누적 · 같은 token = 같은 기기 · 응답에 token 없음 |
| `recorder` (계획만 — mock 은 `S4-D`) | `success` · `mic-permission-denied` · `recording-interrupted` · **`web-background-warning`** · `auto-timeout` · `crash-recovered` | `resolveRecorderScenario(store)` 가 계획 객체를 준다 |

**상태 규칙 (모든 key)** — 전이 판정은 contracts `canTransition()` 직접 호출 · 진행 중 세션 1개 · 같은 `clientSessionKey` 재생성 = 같은 세션 · 누적 1800s 후 재개 `SESSION_MAX_DURATION_EXCEEDED` · 스티커 세션당 1회 · 대화 전용 init `RECORDING_NOT_ALLOWED_FOR_MODE` · ready 세션 init `SESSION_INVALID_TRANSITION` · 바이트 미도착 part 가 있으면 complete `RECORDING_INCOMPLETE` · **`to='abandoned'` 확정 → 녹음 `deleted`(`deletedAt` 기록, `expiresAt` null) → 이후 전송·토큰·확정 `RECORDING_DELETED`** (`D4-13`, `P4-BIP-21`).

**인터럽션 3종 구분** (`D4-1`): key 를 쪼개지 않고 **원인을 메서드 자리**로 고른다 — `recorder.visibilitychange:` · `recorder.devicechange:` · `recorder.track-ended:recording-interrupted`. 그룹 지정은 3종을 순서대로 모두. 시점은 시간이 아니라 **청크 수**(`RECORDER_EVENT_AFTER_CHUNKS = 3`).

**`web-background-warning`** (`D4-26`): 계획 = `backgroundOnce: true` — 녹음 중 탭이 1회 숨겨졌다 돌아오고 **녹음은 계속**된다. 계획 객체에 **지연·중단 시간 같은 측정값 필드가 없다**(테스트가 키 집합을 고정). 측정 후 `mocks/recorder/recorderScenarios.ts` 의 이 key 하나만 고친다. **사용자 문구는 이 단위에서 쓰지 않았다** → C-8 ①.

**폐기 전이 실패 분기** (Plan §8.3 "development-agent 가 정한다"): **별도 key 를 만들지 않았다** — `sessions.transition:error` / `:retry` / `:offline` 메서드 override 로 재현한다 (세션 생성·조회는 성공, 전이만 실패 — 테스트 있음).

**`error` 의 code 지정** (AC-4-24): 번들 옵션 `errorCodes: { 'sessions': 'RATE_LIMITED', 'sessions.create': 'PROVIDER_UNAVAILABLE' }` — 메서드 > 그룹 > `INTERNAL_ERROR`. URL 로는 지정하지 않는다 (새 문법을 늘리지 않았다).

## C-5. AC 판정 근거 (판정은 QA 가 한다)

> ⚠️ AC-4-21~37 중 다수는 **Mock 부분 + 화면/큐 부분**이 함께 적혀 있다. `S4-C` 는 **Mock 부분만** 만든다 — 화면·큐 부분은 `S4-D`·`S4-E`·`S4-F` 에서 같은 시나리오로 닫힌다.

| AC | `S4-C` 증거 | 남은 부분 (담당 단위) |
|---|---|---|
| 21 | `MockSessionApi.test` "success" · `MockRecordingApi.test` "recording-upload-success" · `MockNotificationApi.test` — 전 메서드 응답 `*Schema.safeParse` 통과 | — |
| 22 | `sessions:loading` 이 주입 timer 에 `1500` 을 요청 (테스트) | 화면 Loading (`S4-F`) |
| 23 | `sessions:empty` → `list` = `{items:[], nextCursor:null}` | EmptyState 화면 (목록 화면은 Stage 7/8) |
| 24 | `sessions:error` → `INTERNAL_ERROR` envelope(`requestId` uuid) · `errorCodes` 로 지정 code (메서드 > 그룹) | ErrorState/InlineAlert (`S4-F`) |
| 25 | `sessions:retry` — **메서드별** 1회차 실패 → 같은 입력 재시도 성공, create 실패가 transition 시도를 소비하지 않음 | 입력·녹음 상태 보존 e2e (`S4-D`~`F`) |
| 26 | init → PATCH → complete → `uploaded` + `sessionStatus='analyzing'` + `getDetail` 상태 `analyzing` (기본·`recording-upload-success` 두 key) | — |
| 27 | 전송 3회 `NetworkError` + **서버 수신 바이트 0** · complete 3회 `INTERNAL_ERROR` · `status` 가 `pending` 유지 (확정 응답이 오지 않음) | **로컬 파일 수 측정** (`S4-E`) |
| 28 | 요청 로그 `TUS PATCH` 의 `bytes` 합 = part 크기(1000) — 중간 실패(500) → `uploadPart` 재시도는 CONFLICT(0 바이트) → `resume` 500 → 재-resume 0 | 큐가 `resume` 을 쓰는지 (`S4-E`) |
| 29 | 로그 순서 `init → TUS PATCH(거절) → upload-tokens → TUS PATCH → complete` 정확 일치 · 로그에 토큰 문자열 0건 | 큐 로직 (`S4-E`) |
| 30 | `recording-incomplete` → `RECORDING_INCOMPLETE` `{partNos:[1]}` 지속 · 상태 규칙(미도착 part 2) | 재시도 안내 화면 (`S4-F`) |
| 31 | `offline-queued` — 복구 전 `NetworkError`, `goOnline()` 후 같은 요청 성공 · 브라우저 `online` 이벤트가 연결 복구 (테스트) | 자동 재개 e2e (`S4-E`·`F`) |
| 32 | `upload-stalled-48h` = 지속 실패 | 48h 판정(주입 clock)·안내 1회 (`S4-E`·`F`) |
| 33 | 만료 토큰 → `refreshTokens` → `RECORDING_DELETED` | 큐 포기 + 로컬 정리 (`S4-E`) |
| 34 | 1회차 `SESSION_INVALID_TRANSITION` `{from:'ready',to:'recording'}` · 서버 상태 불변 · `getDetail` 후 재시도 성공 | 클라이언트 재동기화 (`S4-D`) |
| 35 | `SESSION_ALREADY_ACTIVE` `{sessionId}` → 그 id 의 `getDetail` 성공(`recording`) | 복귀 경로 e2e (`S4-F`) |
| 36 | 세션 4 메서드 전부 `ONBOARDING_INCOMPLETE` | Route Guard e2e (`S4-F`) |
| 37 | create · transition · init · refreshTokens · complete — 같은 키+같은 body 재생(새 세션·새 토큰 0), 다른 body `IDEMPOTENCY_KEY_REUSED`, **다른 세션에 같은 키** `REUSED`, 실패한 시도는 보관하지 않음, 완료 replay 가 같은 스티커 | — |
| 87 | 단위: `library.savebook:error` → `getOverview` 성공 · `saveBook` 실패 · `unsaveBook` 성공 · `library:error` 는 Stage 3 동작 그대로. **e2e**: `e2e/library.spec.ts` "그룹 안 부분 실패" — 선반 표시 + 시트 Save → error Toast. **음성 대조**: 같은 테스트를 `library.unsavebook:error` 로 바꾸면 **FAIL** 함을 확인(Toast 미표시) 후 원복 | — |

**결정성 증거**: `stage4-determinism.test.ts` — 같은 scenario(기본 · `recording-upload-success` · `upload-retry`)의 전체 흐름(응답 + 요청 로그)을 2회 실행해 **JSON 바이트 동일**. 세션 id 가 seed idFactory 에서 나와 번들 간 동일. `mock-source-rules.test.ts`(기존)가 신규 Mock 소스에도 `Date.now`·`new Date(`·`Math.random`·`setTimeout` 직접 호출 **0건**을 단정 (통과).

**Mock Data 위치**: fixture 는 `mocks/fixtures/` 에만. `shared/api/**` 에 fixture 0건 (`mock-source-rules` "mocks import 는 선택 지점뿐" 통과).

## C-6. `BACKEND_INTEGRATION_PENDING` 예상 (Handoff 반영 대상)

| 항목 | 내용 | Handoff |
|---|---|---|
| RU-4 | 진행 중 세션 1개 규칙 · 같은 `clientSessionKey` 재생성 = 같은 세션 | `BACKEND_HANDOFF.md` |
| RU-5 | 업로드 확정과 `completed` 전이의 **도착 순서 무관** — 확정이 먼저면 `completed` 직후 `analyzing` | `RECORDING_UPLOAD_SPEC.md` |
| RU-6 | `abandoned` 수신 시 녹음 `deleted`·`deletedAt` 기록 → 이후 토큰·확정·전송 `RECORDING_DELETED` (`P4-BIP-21`) | `RECORDING_UPLOAD_SPEC.md` |
| RU-7 | TUS: init 이 upload URL 을 **이미 만들어** 준다는 가정 · `Authorization: Bearer <uploadToken>` · 401/403 → 만료, 404/410 → 삭제 해석 | `RECORDING_UPLOAD_SPEC.md` |
| RU-8 | `recordingApi.status` endpoint 경로 (`GET /v1/recordings/:recordingId` 가정) | `API_CONTRACTS.md` §4 |
| RU-9 | `RECORDING_INCOMPLETE.details.partNos` · `SESSION_ALREADY_ACTIVE.details.sessionId` · `SESSION_INVALID_TRANSITION.details.{from,to}` 를 Mock 이 이 모양으로 보낸다 | `ERROR_CODES.md` |
| RU-10 | `POST /v1/push-devices` 는 IK 없이 token 기준 upsert (같은 token = 같은 기기) | `BACKEND_HANDOFF.md` |

## C-7. Scope 경계에서 보류한 항목

| 보류 | 이유 |
|---|---|
| `RecorderAdapter` interface · mock · `RecordingController` | **`S4-D`**. 재현 계획(`recorderScenarios.ts`)만 만들었다 |
| `LocalRecordingStore` · `UploadQueue` · 48h 판정 · 로컬 파일 수 측정 | **`S4-E`** |
| 화면 · Query/Mutation hook · copy | **`S4-F`~** (4b). hook 은 소비자와 함께 만든다 |
| dev Scenario Panel 에 새 그룹 4개 표시 | 패널은 dev UI 이며 `S4-C` 범위 밖. URL 로 전부 전환 가능하다. ⚠️ 패널이 URL 을 다시 쓰면 **메서드 override 를 보존하지 않는다**(그룹 단위 직렬화) → C-8 ③ |
| `push-permission-denied` | platform adapter(`PushPermissionPort`) 의 key — **`S4-J`** |
| §30.7 ② `purchaseUrl` fixture (AC-4-88) | **`S4-J`** |

## C-8. 발견 문제

| 구분 | 내용 |
|---|---|
| Blocking | 없음 |
| Non-blocking | ① **`web-background-warning` 문구 위치** — 지시 "시나리오/문구 위치를 한 곳에" 중 **시나리오는 한 곳**(`mocks/recorder/recorderScenarios.ts`)에 두었으나 **문구는 쓰지 않았다**. Mock 에 두면 Production 빌드에서 사라지고(`assert:no-mocks`), 문구는 feature copy 모듈 소관(`rules/frontend.md` §8)이며 Design Spec §7 표에 이 안내의 문구·배치가 **없다**(`InlineAlert` 사용만 §992). `S4-F` 에서 `features/storytime-session` copy 모듈 한 곳에 `D4-26` 수준 문구로 두고 design-agent 명세를 받는 것을 권한다. ② **`recordingApi.status` endpoint 가 `API_CONTRACTS` §4 표에 없다** — Http 골격은 `GET /v1/recordings/:recordingId` 가정. plan-agent 확인 대상. ③ dev Scenario Panel 이 메서드 override 를 직렬화하지 않는다 (위 C-7). ④ `httpClient` 에 `send()`(204 전용)를 추가했다 — `DELETE /v1/push-devices/:id` 가 첫 body 없는 응답이다. 오류 해석 경로는 `request` 와 공유. ⑤ Stage 4 그룹의 `retry` 카운터는 **메서드 단위**, Stage 1–3 그룹은 **그룹 단위 그대로** — 두 방식이 공존한다(기존 동작 불변이 우선) |
| NEEDS_DECISION | 없음 — `UploadTransport` 인자·반환은 **초안**이며 `S4-E` 가 확정한다는 `API_CONTRACTS` §5.1.1 의 배분을 그대로 따랐다 |

---

# `S4-D` — RecordingController 코어 (2026-10-15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-D` 만**. `S4-E`(LocalRecordingStore · SessionOutbox · UploadQueue) 이후는 착수하지 않았다. **커밋하지 않았다.**

## D-1. Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | `Status: APPROVED (2026-10-13, user)` — 둘 다 확인 |
| 선행 | `S4-B`(contracts) · `S4-C`(Mock) COMPLETE (위 절, 미커밋) |
| 결정 | `D4-1` · `D4-12` · `D4-13` · **`D4-27`**(WebKit 미확정으로 진행 + watchdog) · **`D4-28`**(timeslice 1000ms) · spike `M-3` · `M-7` |
| Scope | `features/recording` 순수 TS 코어 + `shared/platform/recorder`(interface + Web) + `mocks/platform/MockRecorderAdapter` + 테스트. **contracts 변경 0** · 신규 dependency 0 · 화면 0 · Backend 0. spike 코드(`src/dev/recording-spike`) 미수정 |

## D-2. 생성 · 수정 파일 (전부 신규, 기존 파일 수정 0)

| 구분 | 파일 (`apps/web/` 기준) |
|---|---|
| 플랫폼 포트 (shared) | `src/shared/platform/recorder/recorder-adapter.ts`(**interface** · `RecorderStartError` · `RECORDER_TIMESLICE_MS=1000` · `RECORDER_WATCHDOG_FACTOR=3`) · `web-media-environment.ts`(브라우저 접점 — DOM 타입은 여기와 Adapter 안에만) · `web-recorder-adapter.ts` · `index.ts` |
| 시간 포트 (shared) | `src/shared/lib/scheduler.ts`(`Scheduler` + `createSystemScheduler` — `setTimeout` 호출 지점 1곳) |
| feature 코어 | `src/features/recording/model/recording-controller.ts` · `consent-gate.ts` · `permission-service.ts` · `ports.ts`(`RecordingSink` · `SessionTransitionPort` — S4-E 경계) · `session-transition-port.ts`(`sessionApi` 직결 구현) · `src/features/recording/index.ts` |
| Mock | `src/mocks/platform/MockRecorderAdapter.ts` — `S4-C` 의 `RecorderScenarioPlan` 을 **실행** (Plan §5.1 의 `mocks/platform/` 위치) |
| 테스트 지원 | `src/test/manual-scheduler.ts`(수동 시계) · `src/features/recording/model/__tests__/controller-support.ts` |
| 테스트 (신규 5 파일) | `features/recording/model/__tests__/recording-controller.test.ts`(41 블록 → 60 케이스) · `controller-mock-api.test.ts`(9) · `shared/platform/recorder/__tests__/web-recorder-adapter.test.ts`(23) · `__tests__/recorder-adapter-surface.test.ts`(node, 22 케이스) · `mocks/__tests__/MockRecorderAdapter.test.ts`(7) |

## D-3. 검증 명령 (마지막 코드 수정 이후 전부 재실행, 2026-10-15)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm test` | ✅ **134 files / 1930 tests** (기준선 129 / 1809 → **+5 / +121**) |
| `pnpm lint:boundaries` | ✅ no dependency violations (658 modules) |
| `pnpm build` | ✅ exit 0 (기존 chunk size 경고만) |
| `pnpm format:check` | ✅ All matched files use Prettier code style |
| `pnpm assert:no-mocks` | ✅ 3 sentinel 모두 0건 (dist 4파일) |
| `ls apps/api supabase apps/mobile` | 전부 No such file or directory |
| `pnpm test:e2e` | **실행 안 함** — 화면·라우트·기존 Mock 동작 변경 0 (기존 파일 수정 0, 신규 모듈은 아직 어떤 화면에서도 import 되지 않는다) |

**음성 대조 (테스트가 실제로 잡는지)**: ① `ConsentGate.evaluate` 를 항상 허용으로 바꾸면 AC-4-62 테스트 **5건 FAIL** ② pause 시 `segmentStartMs = null` 을 지우면 AC-4-43/44·인터럽션·Submit 테스트 **5건 FAIL** — 둘 다 원복 후 전부 통과.

## D-4. AC 판정 근거 (판정은 QA 가 한다)

| AC | 근거 |
|---|---|
| **43** | `recording-controller.test` "10초 녹음 → pause 60초 → 불변 → resume 5초 → 15" + pause 요청 `recordedSeconds: 10`. 누적은 `recording` 구간만(`segmentStartMs`) |
| **44** | "누적 1800초에 completed(auto_timeout) 1건" — 1000s 녹음 + **120s pause** + 800s → 1799 에서 `recording`, 1800 에서 `completed` · 요청 `{completedReason:'auto_timeout', recordedSeconds:1800}` **정확히 1건** · `auto_timeout` 이벤트 1회 |
| **45** | "자동 종료 시 청크 파일 수·총 바이트가 그대로" — 1800s 후 sink **파일 1801개 = 스냅샷 chunkCount**, **총 바이트 1801×256 = 스냅샷 byteLength**, `discardSession` 0회, part 1 `endPart` 기록. (실제 OPFS 파일 수 측정은 `S4-E`) |
| **46** | "리마인드는 지정 시점에 1회, abandoned 는 600초 경계에서" — 경계 **양쪽**(−1ms 는 그대로 / 0ms 에 전이) · 요청 1건 `{to:'abandoned', occurredAt: T0+600s}` · 이후 1시간 추가 리마인드·요청 0 · 예약 누수 0. "구독자가 `readyReminderShown=true` 를 정확히 1번 본다"(렌더 횟수 대용) · "타이머가 몰아서 깨어도 리마인드가 abandoned 보다 먼저 1회" |
| **47** | grep: `features/recording` 의 `from 'react…'` **0건**, `.tsx` **0개**. `__tests__/recorder-adapter-surface.test.ts` 가 react·react-dom·@testing-library import 0 (테스트 포함)을 단정. 상태 머신 테스트 전부 jsdom DOM 렌더 없이 돈다 |
| **48** | "전이표 14행 전수" — caregiver 9행 × 모드 = **10 케이스**를 컨트롤러 명령으로 실행(명령 1회 = 요청 정확히 1건, 로컬 상태 = `to`) + server/worker **5행**은 caregiver 명령이 없음을 `canTransition` 으로 단정 + sweeper `ready→abandoned` 재동기화 수용. 거부 샘플 **7 + 종착 이후 5 명령 + 대화 전용 녹음** (아래 D-6) |
| **49** | **결정: 요청 전에 막는다 (1차)** — 모든 명령이 `canTransition(status, to, 'caregiver', mode)` 로 판정, 거부 시 `invalid_transition` · 요청 0건. **서버가 그래도 `SESSION_INVALID_TRANSITION` 이면 재동기화 (2차)** — `fetchState()` 로 서버 상태 채택 (`controller-mock-api.test` AC-4-34: `getDetail` 1회 → ready → 재시작 성공) |
| **62** (로직 부분) | `ConsentGate` → 막히면 **녹음기 호출 0 · 전이 요청 0** (`recorder.controls.calls` = `[]`, port requests = `[]`). 실제 Mock 번들 `sessions:consent-missing` 에서도 요청 로그의 transition **0건**. 상태 미상(null)도 차단(fail-closed). 재개도 재확인. 서버 `CONSENT_REQUIRED` 시 캡처 정지 + `consent_blocked`. ⚠️ **버튼이 눌리지 않는 화면 부분(e2e)은 `S4-F`** |
| `R4-01` | `recorder-adapter.ts` 실행 코드에 DOM 타입 16종(`MediaRecorder` · `MediaStream` · `Blob` · `BlobEvent` · `Event` · `DOMException` · `AbortSignal` · `PermissionState` …) **0건**, import **0줄** — 테스트로 고정. 청크 = `Uint8Array`, MIME = `string`, 인터럽션 원인 = 플랫폼 중립 enum(`background` · `input_changed` · `capture_lost` · `chunk_stalled`). `features/recording` 이 Web 구현·Mock·providers 를 import 하지 않음도 단정 |
| 34 (클라이언트 부분) | 위 49 의 2차 방어 |
| 68 (컨트롤러 부분) | `captureStopped` → `paused`(phase `interrupted`) + 전이 1건 + 청크 보존(3 + 종료 조각) + 재개 = **새 part**. `recording-interrupted` 계획대로 3원인 각각 · 파일 12개(유실 0). 알림성(`background`)은 상태 불변. (화면 안내 · iOS 실기기 ③ 확인은 `S4-F` · 사용자) |

**`M-3`**: `web-recorder-adapter.test` "start 직후 recorder.mimeType 이 빈 문자열이어도 청크는 Blob.type 원문" — 가짜 레코더가 spike §5.4 거동(시작 직후 `''`)을 재현. 컨트롤러는 part 컨테이너를 **그 part 의 첫 청크**에서 정한다.
**`M-7` / `D4-27`**: 트랙 `readyState` 폴링 → `capture_lost` · 레코더 자체 `inactive` → `capture_lost` · 오류 이벤트 → `capture_lost` · 청크 정체 → **`requestData()` 로 1회 깨움** → 청크 오면 계속 / 안 오면 `chunk_stalled` + 캡처 정리. `onended` 리스너는 **없다**. WebKit 이 timeslice 를 무시해도 청크 미수신이 조용히 지나가지 않으며, 고칠 곳은 `web-recorder-adapter.ts` · `web-media-environment.ts` 뿐이다.
**`D4-28`**: `RECORDER_TIMESLICE_MS = 1000` 정의 1곳, 컨트롤러 기본값이 이 상수를 쓴다 (테스트로 값 고정).

## D-5. Mock 시나리오 — 전환 방법

`recorder` 그룹(`S4-C` 정의 그대로)을 `MockRecorderAdapter` 가 실행한다. URL: `?scenario=recorder:<key>` · 원인별 `?scenario=recorder.<visibilitychange|devicechange|track-ended>:recording-interrupted`. 단위 테스트: `createMockRecorderAdapter({ plan: resolveRecorderScenario(store), clock, scheduler })` + `createManualScheduler()`.

| key | 실행 결과 |
|---|---|
| `success` | timeslice 마다 256B 청크, MIME `audio/webm;codecs=opus` |
| `mic-permission-denied` | 요청 → `denied`, `start` 거절 → 컨트롤러 `permission_denied`, 요청 0 |
| `recording-interrupted` | part 마다 3청크 뒤 원인 1개(종료 조각 먼저) → `background` · `input_changed` · `capture_lost` |
| `web-background-warning` | 첫 part 3청크 뒤 `background` 알림 1회, 녹음 계속 (`D4-26`) |
| `auto-timeout` | 어댑터는 아무것도 하지 않는다 — 컨트롤러 주입 clock 이 1800s 를 만든다 (⚠️ 브라우저 e2e 에서 30분을 재현하는 방법은 `S4-F` 에서 정해야 한다 → D-8 ④) |
| `crash-recovered` | 어댑터 무관 — `S4-E` 저장소 몫 |

## D-6. 상태 머신 테스트 목록 (`recording-controller.test.ts`)

- **전이표 14행**: 표 구성(9/5) · caregiver 10 케이스(`ready→recording` · `ready→completed`(대화 전용) · `ready→abandoned`×2모드 · `recording→paused` · `paused→recording` · `recording→completed` · `paused→completed` · `recording→abandoned` · `paused→abandoned`) · server/worker 5행 · sweeper 재동기화
- **거부 샘플**: ready 에서 pause / resume / submit(recorded) · recording 에서 start / resume · paused 에서 pause / start · 종착 후 5명령 · 대화 전용 start · 서버 `SESSION_INVALID_TRANSITION` 재동기화
- **동의 (AC-4-62)**: voice 누락 · 상태 미상 · 동의 후 시작 · 재개 재확인 · 서버 `CONSENT_REQUIRED`
- **권한**: 거부 · 이미 허용이면 재요청 없음 · `unavailable`
- **시간**: AC-4-43 · AC-4-44 · AC-4-45 · 상한 도달 재개 거절 · AC-4-46(경계 · 구독 1회 · 몰아 깨어남 · 녹음 시 타이머 정지 · 대화 전용 미적용 · 잘못된 설정 거절)
- **청크/part**: 첫 청크 컨테이너 · 사용자 pause 는 같은 part · part 상한 20
- **인터럽션**: 캡처 끊김 → paused + 새 part · 알림성 notice · 3원인 계획 · paused 중 끊김
- **Submit/Discard**: Submit 로컬 보존 · Discard 확정 후 삭제 · 실패 시 보존(네트워크·서버) · 대화 전용 완료
- **동시성/정리**: 요청 순서 · busy · dispose(로컬 보존·요청 없음·예약 누수 0) · 스냅샷 동일성

## D-7. `BACKEND_INTEGRATION_PENDING` 예상 (Handoff 반영 대상)

| 항목 | 내용 | Handoff |
|---|---|---|
| RU-11 | 클라이언트 `ConsentGate` 는 차단만 — 녹음 시작·재개(`to=recording`) 시 서버 측 `child_voice_data` 강제 (`P4-BIP-02`) | `AUTH_REQUIREMENTS.md` |
| RU-12 | 재개(`paused→recording`) 요청은 **`recordedSeconds` 를 싣지 않는다**(pause · completed · 인터럽션 pause 만 싣는다) — 서버는 마지막 보고값을 기준으로 상한을 검증 | `RECORDING_UPLOAD_SPEC.md` |
| RU-13 | 인터럽션으로 생긴 `paused` 전이는 사용자 pause 와 **구분되지 않는다** (사유 필드 없음 — `D4-13` 과 같은 성격) | `BACKEND_HANDOFF.md` |

## D-8. 발견 문제

| 구분 | 내용 |
|---|---|
| Blocking | 없음 |
| Non-blocking | ① **Adapter 선택 지점(`app/providers`) 미연결** — 컨트롤러·Adapter 를 소비하는 화면이 없어 조립하지 않았다(`S4-C` 가 hook 을 소비자와 함께 만든 것과 같은 판단). `S4-F` 가 Web\|Mock 2종을 `app/providers` 1곳에서 고른다(Plan §5.2-2). ② **`RecorderAdapter` interface 를 ARCHITECTURE §10.4 초안에서 바꿨다** — `start({timesliceMs})`(초안 `sessionId`·`chunkMs` — sessionId 는 컨트롤러 몫), `stop()` 반환 = 집계(초안 `RecordingPartRef[]`), 인터럽션 원인 = `background\|input_changed\|capture_lost\|chunk_stalled`(초안 `call\|route_change\|os_kill\|background`), `capabilities()` 에서 `mimeType` 제거(`M-3` — 시작 시 알 수 없다), 권한 상태에 `unavailable` 추가, `dispose()` 추가. 문서 반영은 plan-agent 소관(§10.4 는 RECOMMENDED 초안). ③ **`ConsentGate` 는 `child_voice_data` 가 `required` 에 없으면 막는다**(fail-closed — `ConsentStatus` 는 "필수 중 누락" 만 알려 주므로 선택 동의면 녹음 동의 여부를 알 수 없다). 현재 Mock·정책상 필수라 동작 차이 없음. ④ `auto-timeout` 을 **브라우저 e2e** 에서 재현하려면 30분 실시간 대신 가속 clock 주입 경로가 필요하다 — `S4-F` 조립 시 결정. ⑤ `initial.status='recording'` 재진입(새로고침 후)은 받지 않는다 — 크래시 복구(`S4-E`·AC-4-65) 소관. ⑥ `SessionTransitionPort` 직결 구현은 요청마다 새 IK 를 만든다(재시도 없음) — 같은 키 재전송은 `S4-E` `SessionOutbox` |
| NEEDS_DECISION | **N-D1 — ready 리마인드 시점** (PRD §13 "리마인드 버블 1회" 에 **시각이 없다**, Figma·Design Spec 에도 없음). 컨트롤러는 `readyReminderAfterSeconds` 를 **필수 옵션**으로 받고 기본값을 두지 않았다(테스트는 300s 로 경계만 검증). `S4-F` 조립 전에 사용자 결정 필요. **N-D2 — 대화 전용 세션의 10분 방치** — contracts 전이표는 `ready→abandoned` 를 두 모드 모두 허용(클라이언트·서버 sweeper)하지만, 대화 전용은 녹음 없이 `ready` 에서 대화가 진행되므로 10분에 정리하면 **대화 도중 세션이 사라진다**. 컨트롤러는 기본적으로 **대화 전용에 방치 타이머를 쓰지 않는다**(`readyTimers` 옵션으로 변경 가능). 서버 sweeper 쪽 규칙(Handoff)과 함께 결정 필요 |

---

# `S4-E` — 로컬 영속 + 업로드 (2026-10-15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-E` 만**. `S4-J`(Stage 3 이월) · `S4-F`~ 화면은 착수하지 않았다. **커밋하지 않았다.**

## E-1. Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | `Status: APPROVED (2026-10-13, user)` — 둘 다 확인 |
| 선행 | `S4-D` COMPLETE (위 절, 미커밋) — `RecordingSink` · `SessionTransitionPort` 포트에 연결 |
| 결정 | `D4-12`·`D4-13`(삭제 순서) · `D4-23`·`D4-24` · **`D4-28`**(timeslice 1000ms) · **`D4-29`**(14일 삭제 · 7일 안내) · **`D4-30`**(`persist()`) · spike `M-4`·`M-5`·`M-6`·`M-8`·`M-10`·`M-11` |
| Scope | `features/recording` 순수 TS + `shared/platform/{app-state,recording-storage}`(interface + Web) + `shared/lib/sha256.ts` + Mock(`mocks/platform`·seed·key) + dev 측정판 + 로그아웃 정리 확장 + 테스트. **contracts 변경 0** · 신규 dependency 0 · 제품 화면 0 · Backend 0 · spike 코드 미수정 |

## E-2. 생성 · 수정 파일

신규 **34** · 수정 **9** (+ 이 문서). 경로는 `apps/web/` 기준.

| 구분 | 파일 |
|---|---|
| 포트 — network/appState (신규 3) | `src/shared/platform/app-state/app-state-port.ts`(interface, DOM 타입 0) · `web-app-state.ts`(`navigator.onLine` + `online`/`offline` + `visibilitychange` + `devicechange`) · `index.ts` |
| 포트 — 녹음 저장소 (신규 5) | `src/shared/platform/recording-storage/recording-storage.ts`(`ChunkByteStore` · `LocalKeyValueStore` · `StoragePersistencePort` · `AudioDecodeProbe` · `LocalStorageWriteError`, DOM 타입 0) · `web-opfs.ts`(`createWritable()`, Worker 없음 — `M-10`) · `web-indexeddb.ts`(색인 + 바이트 fallback) · `web-recording-storage.ts`(조립 · `createLayeredChunkByteStore` · `persist()` · `decodeAudioData` · `wipeWebRecordingStorage`) · `index.ts` |
| 해시 (신규 1) | `src/shared/lib/sha256.ts` — Web Crypto 만 |
| feature 코어 (신규 8) | `src/features/recording/model/local-records.ts`(기기 레코드 모양 + 가드) · `local-recording-store.ts`(**`RecordingSink` 구현**) · `session-outbox.ts`(**`SessionTransitionPort` 감쌈**) · `upload-queue.ts` · `local-retention.ts`(`D4-29`) · `recording-recovery.ts`(크래시 복구) · `recording-runtime.ts`(조립 — `portsFor(sessionId)`) · `capture-timeline.ts`(AC-4-108 기록기) |
| Mock (신규 4) | `src/mocks/platform/MockRecordingStorage.ts`(메모리 · 파일 수 · 할당량/잘림/유실 주입 · Mock 디코드 규칙) · `MockAppStatePort.ts` · `src/mocks/fixtures/local-recordings.ts`(`seedCrashedRecording` · `seedStaleRecording`) · `src/mocks/recorder/localStoreScenarios.ts`(`resolveLocalStoreSeed`) |
| dev 측정판 (신규 2) | `src/dev/recording-measure/measure-core.ts` · `RecordingMeasurePage.tsx` — `/__dev/ui/recording-measure` |
| 테스트 (신규 11) | `features/recording/model/__tests__/` `runtime-support.ts`(지원) · `local-recording-store.test.ts` · `session-outbox.test.ts` · `upload-queue.test.ts` · `recording-runtime.test.ts` · `capture-timeline.test.ts` / `shared/platform/app-state/__tests__/web-app-state.test.ts` · `shared/platform/recording-storage/__tests__/web-recording-storage.test.ts` · `shared/lib/__tests__/sha256.test.ts` · `mocks/__tests__/local-store-scenarios.test.ts` · `__tests__/local-storage-surface.test.ts`(node, 정적) |
| 수정 (9) | `src/features/recording/index.ts`(export) · `src/mocks/index.ts`(export) · `src/mocks/recorder/recorderScenarios.ts`(**key `local-retention-exceeded`**) · `src/mocks/__tests__/recorder-scenarios.test.ts`(key 목록 +1 — Catalogue 등재 반영, 단정 약화 없음) · `src/shared/lib/session-cleanup.ts`(**`clearLocalRecordings` 필수 dep** — AC-4-72) · `src/shared/lib/__tests__/session-cleanup.test.ts`(순서 4단계 + 실패 경로 1건 추가) · `src/features/settings/model/useSignOut.ts`(주입, 기본 = Web 저장소 삭제) · `src/dev/DevGallery.tsx`(route 1줄) · `docs/API_CONTRACTS.md` **Rev 8.3** |

## E-3. 검증 명령 (마지막 코드 수정 이후 전부 재실행, 2026-10-15)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm test` | ✅ **144 files / 2066 tests** (기준선 134 / 1930 → **+10 / +136**) |
| `pnpm lint:boundaries` | ✅ no dependency violations (692 modules, 2541 dependencies) |
| `pnpm build` | ✅ exit 0 (기존 chunk size 경고만) |
| `pnpm format:check` | ✅ All matched files use Prettier code style |
| `pnpm assert:no-mocks` | ✅ `__HARU_MOCK_SENTINEL__` 0 · `__HARU_DEV_SENTINEL__` 0 · `haru-dev-` 0 (dist 4파일) — dev 측정판·Mock 저장소가 Production 산출물에 없다 |
| `ls apps/api supabase apps/mobile` | 전부 No such file or directory |
| `pnpm test:e2e` (단독 — 다른 Playwright·vitest 0 확인 후) | ⚠️ **1회차 284 passed / 2 failed (23.7m)** → 실패 2건을 **단독 재실행 2 passed (5.3s)**. 실패 2건 = `home.spec.ts:104`(로그인 후 `/` 이동 대기 timeout) · `library.spec.ts:559`(선반 클릭 timeout) — **둘 다 S4-E 가 닿지 않는 경로**이며, 60s 제한 테스트 하나가 **15.7분** 걸린 것은 실행 중 머신 정체를 뜻한다(메모 `playwright-must-run-solo` 의 허위 실패 유형). 실행 이유: **로그아웃 경로가 바뀌었다**(`useSignOut` 이 Web 녹음 저장소도 지운다) — 로그아웃 e2e(`home.spec.ts` `/settings · 로그아웃` 블록) **전부 통과**. baseline 변경 0 (`git status e2e/__screenshots__` 0줄) |

**음성 대조 (테스트가 실제로 잡는지)**: ① `UploadQueue` 에서 **complete 요청 전에** `store.delete` 를 넣으면 AC-4-71 2시점 테스트 · AC-4-30 테스트 **2건 FAIL** ② `LocalRecordingStore` 의 헤더 복제본 쓰기를 빼면 **12건 이상 FAIL** (출력 상위 12건 확인 — 복제본 파일 목록 · 원본 유실 시 복구 · 복구 디코드 · 파일 수 단정 등). 둘 다 원복 후 전부 통과 (`grep "NEGATIVE CONTROL"` 0건).

**실브라우저 저장소 self-test** (dev 측정판 `⑥` = `window.__haruRecordingMeasure.selfTest()`, Playwright 스크립트로 1회 실행 — **커밋된 e2e 가 아니다**, scratch):

| 엔진 | 쓰기 계층 | `persisted()` | 쓰기 후 파일 | 재연결 후 레코드 · `headerVerified` · 미완료 판정 · 바이트 | 삭제 후 파일 · 레코드 |
|---|---|---|---|---|---|
| Chromium 153.0.8010.12 | **OPFS** | `best_effort` | 4 (청크 3 + 헤더 복제 1) | 있음 · true · true · 160 | 0 · 없음 |
| WebKit 26.6 (headless) | **IndexedDB** (fallback) | `best_effort` | 4 | 있음 · true · true · 160 | 0 · 없음 |

⚠️ WebKit 이 IndexedDB 로 간 이유 = **OPFS `createWritable()` 이 `UnknownError: "The operation failed for an unknown transient reason"`** 로 3/3 실패(같은 스크립트로 Chromium 3/3 성공). spike §3.1 의 *"WebKit 창 컨텍스트 쓰기 성공"* 과 **다르다** → E-8 ①.

## E-4. AC 판정 근거 (판정은 QA 가 한다)

| AC | 근거 (`features/recording/model/__tests__/` 기준) | 남은 부분 (담당) |
|---|---|---|
| **27** | `upload-queue.test` "recording-upload-failure" — 시도 2회 모두 실패, **저장소 파일 6개 그대로**(청크 5 + 헤더 복제 1), `failed_retrying`, complete 0건 | — |
| **31** | `upload-queue.test` "offline-queued" — 끊긴 동안 업로드 요청 **0**, `connectivity.goOnline()` + 앱 `online` 신호 **하나로** 업로드 완료 · 파일 0. ⭐ **`drain()` 호출·시계 진행 없음**(시계 값 불변 단정) = 폴링·수동 버튼 없음 | 화면·브라우저 e2e (`S4-F`·`S4-K`) |
| **32** | `upload-queue.test` "upload-stalled-48h" — 48h −1ms 안내 0 · 48h 에 **정확히 1회** · 이후 5시간 재시도에도 1회 · 파일 보존 | 안내 **화면** 1회 (`S4-H2`) |
| **33** | `upload-queue.test` "recording-deleted" — `init → PATCH(거절) → upload-tokens` 후 **포기**: 항목 0 · **파일 0** · `recording_deleted` 이벤트 · 이후 재시도 0 | — |
| **66** | `recording-runtime.test` "start · pause · resume · submit 을 끊긴 채로" — 요청 0 · outbox `[recording, paused, recording, completed]` · online → **같은 순서**로 전송 + 업로드 + 파일 0. `session-outbox.test` — 앞 항목이 막히면 뒤 항목을 보내지 않음 · **재전송도 같은 `Idempotency-Key`** · 5xx 보존 · 4xx 제거 · 재시작 후 이어 보냄 | — |
| **67** | AC-32 와 같은 테스트 (경계 양쪽) + "오프라인으로 시도조차 못 해도 48h 는 적재 시각부터" | 안내 **화면** (`S4-H2`) |
| **71** | `upload-queue.test` "complete 응답 직전 파일 > 0, 직후 = 0" — `recordingApi.complete` 를 감싸 **서버가 확정한 뒤 · 큐가 응답을 받기 직전**에 저장소를 잼: **직전 6 · 직후 0**. 음성 대조 ① 로 실제로 잡는 것을 확인 | — |
| **72** | `session-cleanup.test` — `signOut → draft → **clearLocalRecordings** → Query 캐시` 순서 + 녹음 정리 실패 시에도 캐시 정리·실패 전파. `recording-runtime.test` "clearAll" — 파일 0 · `recordings`·`chunks`·`outbox`·`uploads` 이름 공간 0. `useSignOut` 기본값 = `wipeWebRecordingStorage`(IndexedDB DB 삭제 + OPFS 디렉토리 삭제) | `S4-F` 가 `runtime.clearAll` 을 주입 (E-8 ③) |
| **108** (재현 경로) | **dev 측정판 `/__dev/ui/recording-measure`** — 제품 파이프라인(`WebRecorderAdapter`(실제 마이크) → `CaptureTimeline` → `LocalRecordingStore`(OPFS·IndexedDB) + `WebAppStatePort`). 결과 = `hiddenIntervals[].chunksDuring` · `maxChunkGapMs` · 인터럽션 기록. 기록기 산술은 `capture-timeline.test`(3). ⛔ **e2e 로 재지 않았다** (`M-11`) | ⚠️ **측정 자체는 `NOT VERIFIED`** — 사용자가 iPhone Safari·데스크톱에서 측정판으로 잰다 (`D4-26`·`D4-27`, spike §7.4 절차 그대로, ① 녹음 시작 → 숨김 60초 → ② 종료·요약) |

**이 단위가 함께 닫은 다른 AC 의 큐·저장소 부분**: **26** (`upload-queue.test` 런타임 Submit 경로 — `init → PATCH → complete` · 세션 `analyzing` · 파일 0 · init 이 선언한 part 바이트 = 로컬 바이트 1280 · sha256 실제 해시) · **28** (`upload-retry` — PATCH offset `[0, 0, 640]`, 받은 바이트 합 = 1280 = part 크기, HEAD 1회) · **29** (`init → PATCH → upload-tokens → PATCH → complete` 정확 일치 · 기기 저장 큐 항목에 토큰 0) · **30** (`RECORDING_INCOMPLETE` 동안 파일 보존 · 다음 시도 HEAD 로 서버 offset 확인) · **65 로직** (`recording-runtime.test` 크래시 복구 5건 — 아래) · **113 ②③⑤ 로직** (Discard 2시점 `파일>0·큐0 → 파일0·큐0` · 서버 거절 시 보존 · 오프라인 적재→online 확정 후 삭제).

**spike 권고 반영**:

| 권고 | 구현 | 증거 |
|---|---|---|
| `M-4` 첫 청크 특별 보호 | part 첫 청크 = 원본 + **헤더 복제본** + 원본 **되읽기 크기 확인**(어긋나면 1회 재기록, 복제본도 어긋나면 던짐) → `headerVerified` 기록. 읽기는 원본·복제본 중 긴 쪽 | `local-recording-store.test` 3건 · `recording-runtime.test` "첫 청크 원본을 잃어도 디코드" · 실브라우저 `headerVerified: true` |
| `M-5` 잘린 마지막 청크 유지 | 색인 **먼저**, 바이트 나중. `readPart` 는 없는 파일만 건너뛰고 잘린 파일은 그대로 이어 붙임 | `local-recording-store.test` 2건 · `recording-runtime.test` "잘린 마지막 청크도 복구 바이트에" (`7×256+64`) |
| `M-6` 복구 판정 = 디코드 | `AudioDecodeProbe` 포트 — Web = `OfflineAudioContext.decodeAudioData`(복사본 전달, autoplay 무관). 디코드 길이 = part 길이 | `web-recording-storage.test` 2건 · 복구 테스트(헤더 둘 다 없으면 `decodable:false`, **지우지 않음**) |
| `M-8` / `D4-30` | `LocalRecordingStore.ensurePersistence()` — 영속이 아니면 `persist()` **1회** 요청, 결과를 레코드 `storagePersistence` 에 기록. 비영속(`best_effort`·`unsupported`·미상 `null`) 녹음 = 큐 `priority: 'high'` → **먼저 처리 + 짧은 백오프** (`2s/10s/30s/2m/5m` vs `5s/30s/2m/10m/30m`) | `local-recording-store.test` D4-30 4건 · `upload-queue.test` "best_effort 녹음이 persisted 보다 먼저 init" · "high 는 normal 보다 짧다" |
| `M-10` Worker 없이 | `web-opfs.ts` 창 컨텍스트 `createWritable()` · 능력 탐지 = 실제로 써 보기 | `web-recording-storage.test` probe 3건 |
| `M-11` | AC-4-108 을 e2e 로 재지 않음 — 측정판(사람) + 기록기 단위 테스트 | — |
| spike §8-3 할당량 초과 | **주입 테스트** — `QuotaExceededError` → `LocalStorageWriteError('quota_exceeded')`, 그때까지의 파일 보존, 이후 쓰기 재개 | `local-recording-store.test` · `web-recording-storage.test` |

## E-5. Mock 시나리오 · 전환 방법

| key | 전환 | 동작 |
|---|---|---|
| `recordings:<기존 key>` | URL `?scenario=recordings:<key>` (`S4-C` 그대로) | 큐가 실제로 소비: `recording-upload-success` · `recording-upload-failure` · `upload-retry` · `upload-token-expired` · `recording-incomplete` · `offline-queued` · `upload-stalled-48h` · `recording-deleted` |
| **`recorder:local-retention-exceeded`** ⭐ 신규 (`D4-29`) | `?scenario=recorder:local-retention-exceeded` → `resolveLocalStoreSeed(store)` = `'local-retention-exceeded'` → 조립 지점이 `seedStaleRecording(store, sessionId, clock)` | 14일 + 1분 전 녹음 1건 → `runtime.start()` 의 보관 정리에서 **로컬 삭제** + `retention_expired` |
| `recorder:crash-recovered` (기존 key, seed 신규) | 위와 같은 해석기 → `seedCrashedRecording` | part 1 · 청크 8 · `endPart` 없음 → `start()` 복구 → `completed(recovered_after_crash)` 전송 + 업로드 |
| 7일 안내 | **key 없음** — 주입 clock (`recording-runtime.test` 경계 테스트) | `retention_notice` 1회 (`deleteAtMs` 포함) |
| 저장소·앱 신호 주입 (테스트) | `createMockRecordingStorage({ persistence, persistGrant })` · `controls.failWrites/truncate/removeFile` · `createMockAppStatePort().setConnectivity/setVisibility/emitAudioDevicesChanged` | — |

⚠️ 브라우저에서 seed key 를 쓰려면 **Mock 서버에도 같은 세션**이 있어야 전이·업로드가 성공한다 → 조립(scenario → Mock 세션 준비 → seed)은 **`S4-F`** (seed 함수가 세션 id 를 인자로 받는 이유).

## E-6. 설계 요점 (QA·`S4-F` 가 알아야 할 것)

1. **조립 = `createRecordingRuntime(…).portsFor(sessionId)`** → Controller 의 `sink`(= `LocalRecordingStore`, `discardSession` → 큐 취소 + 로컬 삭제) · `transitions`(= `SessionOutbox`, `to=completed` 면 **전송 전에** 로컬 완료 표시 + 업로드 적재). 앱 시작 시 `runtime.start({ activeSessionIds })` = 복구 → 보관 정리 → outbox·큐·보관 감시 시작.
2. **Submit 은 업로드를 기다리지 않는다** — `UploadQueue.enqueue` 는 적재 후 즉시 resolve 하고 처리는 배경에서 진행 (업로드 시간이 Toast 를 늦추지 않게). 업로드와 `completed` 전이의 도착 순서는 무관하다(RU-5).
3. **오프라인 Discard** — Controller 는 `result: null`(로컬 보존) · outbox 에 `abandoned` 적재 → 나중에 `confirmed(to=abandoned)` 이벤트에서 런타임이 큐 취소 + 로컬 삭제 (`D4-13` 삭제 순서 유지).
4. **업로드 토큰은 기기에 저장하지 않는다** (메모리만). 재시작 후에는 `recordingId` 로 `refreshTokens` 를 부른다. IK(`initKey`·`completeKey`)는 큐 항목에 영속 → 재시도·재시작에도 같은 키.
5. **48h** 기준 = **큐 적재 시각**(로컬 완료 시각). 오프라인이라 한 번도 시도하지 못했어도 잰다. 48h 는 안내일 뿐 삭제가 아니며 재시도는 계속한다. **14일** 기준 = 레코드 `createdAtMs`(첫 part 시작).
6. **`flush`/`drain` 합류 경합을 고쳤다** — 진행 중인 패스에 합류만 하면 그 패스가 이미 목록을 읽은 뒤일 때 방금 적재한 항목이 빠진다. 이제 "진행 중이면 그 다음에 한 번 더" 돈다. `session-outbox.test` IK 테스트가 처음에 이 결함으로 실패했다.

## E-7. `BACKEND_INTEGRATION_PENDING` 예상 (Handoff 반영 대상)

| 항목 | 내용 | Handoff |
|---|---|---|
| RU-14 | outbox 재전송·크래시 복구의 `occurredAt` 은 **과거 시각**(최대 14일 전)이다 — 서버는 수신 시각이 아니라 이 값을 기록하고, **같은 `Idempotency-Key` 재생을 최소 14일**(로컬 보관 상한) 보장해야 중복 전이·중복 스티커가 없다 | `BACKEND_HANDOFF.md` · `API_CONTRACTS.md` §1 |
| RU-15 | `completed(recovered_after_crash)` 의 `recordedSeconds` 는 **디코드 길이 합(없으면 청크 수 × 1초)** 이고, part `durationSeconds` 는 보고 시간을 **바이트 비율**로 나눈 값이다 — 서버 검증은 허용 오차가 필요하다 | `RECORDING_UPLOAD_SPEC.md` |
| RU-16 | 로컬 14일 삭제(`D4-29`)로 **녹음이 끝내 오지 않는 `completed` 세션**이 생긴다 — 서버가 일정 기간 후 녹음 `expired`/분석 종결로 정리해야 한다 (Frontend 는 서버에 알리지 않는다) | `ANALYSIS_PIPELINE_REQUIREMENTS.md` · `DATA_REQUIREMENTS.md` |
| RU-17 | 크래시 복구 part 중 **디코드 실패**(헤더 유실)도 업로드된다 — 서버는 재생 불가 part 를 받을 수 있다 (검증·STT 실패 처리) | `RECORDING_UPLOAD_SPEC.md` |
| RU-18 | 업로드 `init` 이 세션 `recording`/`paused` 상태에서 먼저 올 수 있다(전이 전송보다 업로드가 빠를 때) — `S4-C` RU-5 의 재확인 | `RECORDING_UPLOAD_SPEC.md` |

## E-8. 발견 문제

| 구분 | 내용 |
|---|---|
| Blocking | 없음 |
| Non-blocking | ① **spike §3.1 과 다른 실측** — Playwright WebKit 26.6 headless 에서 OPFS `createWritable()` 이 `UnknownError(transient)` 로 3/3 실패했다(spike 는 "WebKit 쓰기 성공"). 대응: 쓰기 계층을 실측으로 고르고(→ IndexedDB), **읽기·세기·지우기는 두 계층 모두** 보도록 했다(`createLayeredChunkByteStore`) — 탐지가 실행마다 달라져도 바이트가 고립되지 않는다(단위 테스트 2건). **iPhone Safari 실기기의 OPFS 거동은 `D4-27` 확인 때 측정판 `④`(`bytesIn`)로 함께 본다.** ② `useSignOut` 의 기본 정리 = `wipeWebRecordingStorage`(Web 구현을 feature 가 기본값으로 지정) — 런타임이 조립되면 **`S4-F` 가 `app/providers` 에서 `runtime.clearAll` 을 주입**해야 메모리 상태까지 비운다(선택 지점 1곳 원칙). ③ **로그아웃은 업로드 안 된 녹음도 지운다**(`rules/architecture.md` §9 · AC-4-72 그대로) — 로그아웃 확인 화면이 이 사실을 알려야 하는지는 design-agent 확인 대상. ④ **크래시 판정 = "녹음 중인 컨트롤러가 없는 `state: 'recording'` 레코드"** — 따라서 녹음 중 화면을 떠나 `controller.dispose()` 된 세션도 다음 `start()` 에서 `recovered_after_crash` 로 끝난다. 재진입(이어 녹음) 정책은 `S4-F`(`S4-D` D-8 ⑤)가 정하고 `activeSessionIds` 로 제외한다. ⑤ `D4-30` "우선순위를 높인다" 를 **처리 순서 우선 + 짧은 백오프**로 해석했다. 영속 상태 미상(`null` — `ensurePersistence` 전 녹음)도 비영속으로 본다. ⑥ 7일 안내는 Mock key 가 없다(주입 clock). `S4-H2` 가 브라우저에서 안내 화면을 결정적으로 재현해야 하면 Catalogue key 추가가 필요하다(plan-agent). ⑦ 디코드 실패 part 도 업로드 후 로컬 삭제된다(RU-17) — 로컬에 남겨도 재생할 수 없기 때문. 다른 정책을 원하면 결정 필요. ⑧ OPFS 디렉토리 순회를 못 하는 브라우저에서 `countFiles` 는 **수를 지어내지 않고 던진다**(측정 도구 전용 — 큐·복구는 쓰지 않는다) |
| NEEDS_DECISION | 없음 — `D4-28`·`D4-29`·`D4-30` 이 이 단위의 결정 지점을 모두 덮었다. 위 ③·④·⑥·⑦ 은 후속 단위(`S4-F`·`S4-H2`)에서 판단할 사항으로 기록만 한다 |

---

# `S4-J` — Stage 3 이월 처리 (2026-10-15, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-J` 만**. `S4-F`~ 세션 화면 · `S4-H2` 안내 UI · 네이티브 Push 는 착수하지 않았다. **커밋하지 않았다.**

## J-1. Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | `Status: APPROVED (2026-10-13, user)` — 둘 다 확인 |
| 선행 | `S4-C` COMPLETE (Notification API interface · Mock · 메서드 override) · `S4-E` COMPLETE |
| 결정 | `D4-1`(네이티브 Push 제외 — Web 만) · **`D4-31`**(`sharp` 빌드 전용 devDependency, 2026-10-15) · `D4-25`(서재 경로 Context 없음) · Stage 3 `D-4`·`D-11`·`D-13`·`D-16`·`D-18` |
| Scope | 이월 6건(`QA-3-001`·`002`·`003` · `AC-3-22`~`26` · §30.7 Mock 2건 · `QA-3-011`) = AC-4-81~88. **contracts 변경 0** · 신규 dependency = `sharp` 1건(`D4-31`) · Backend 0 · `apps/mobile` 0 · spike 코드 미수정 |

## J-2. 생성 · 수정 파일

신규 **28** · 수정 **31** (이 문서 포함). 경로는 저장소 루트 기준.

| 구분 | 파일 |
|---|---|
| **에셋 파이프라인** (`QA-3-003`) | 신규 `scripts/assets-optimize.mjs` · 산출물 8개 `apps/web/src/shared/assets/character/{headphones,hello-heart,hello-heart-full,home-character}.{avif,webp}` · `apps/web/src/entities/character/CharacterPicture.tsx` / 수정 `package.json`(`sharp` **0.35.5 정확 고정** devDependency + script `assets:optimize`) · `pnpm-lock.yaml` · `scripts/assert-no-mocks.mjs`(sharp 흔적 검사 추가) · `shared/assets/character/index.ts`(`RasterAsset` = png·webp·avif) · `entities/character/CharacterIllustration.tsx` · `CharacterMedallion.tsx` · `character.css`(`.haru-character-picture { display: contents }`) |
| **push 권한** (`QA-3-001`) | 신규 `apps/web/src/shared/platform/push-permission/{push-permission-port.ts, web-push-permission.ts, context.tsx, index.ts}` · `src/mocks/platform/MockPushPermissionPort.ts` · `src/features/notification-preferences/{model/usePushPermission.ts, index.ts}` / 수정 `src/app/providers/apiClients.ts`(**선택 지점** — mock = Mock 포트, http = Web) · `ApiClientProvider.tsx`(`PushPermissionProvider` 공급 · 주입 경로) · `AppProviders.tsx` · `src/mocks/index.ts`(번들 `pushPermission`) |
| **오프라인 카드 캐시** (`QA-3-002`) | 신규 `apps/web/src/shared/lib/activity-card-cache.ts` · `src/features/activity-card-deck/ui/ActivityCardOfflineBanner.tsx` · `src/mocks/activities/activityCardCacheSeed.ts` / 수정 `src/entities/activity-card/useTodayActivityCard.ts`(성공 시 저장 · 오프라인 시 카드 유지/캐시 읽기 · `isCached`) · `features/activity-card-deck/ui/ActivityCardDeck.tsx`(카드가 있으면 오프라인이어도 덱) · `copy.ts`(배너 문구 2) · `index.ts` · `src/pages/home/HomeTopBar.tsx`(배너 조립 — 헤더 밑) · `src/shared/lib/session-cleanup.ts`(**`clearActivityCardCache` 필수 dep**) · `src/features/settings/model/useSignOut.ts` · `src/mocks/activities/MockActivityApi.ts`(key `offline-cached-card`) · `src/mocks/index.ts`(브라우저 seed + 세 번째 인자 `deviceClock`) |
| **§30.7 ②** | 수정 `src/mocks/fixtures/library.ts`(`MOCK_PURCHASE_URL` — Favorites **첫 권만**) · `src/mocks/index.ts`(export) |
| **`QA-3-011`** | 수정 `e2e/toast.spec.ts` |
| 테스트 (신규 9) | `apps/web/src/entities/character/__tests__/CharacterPicture.test.tsx` · `apps/web/__tests__/asset-pipeline.test.ts` · `apps/web/__tests__/push-permission-surface.test.ts` · `src/shared/platform/push-permission/__tests__/web-push-permission.test.ts` · `src/mocks/__tests__/MockPushPermissionPort.test.ts` · `src/features/notification-preferences/__tests__/usePushPermission.test.tsx` · `src/shared/lib/__tests__/activity-card-cache.test.ts` · `src/mocks/__tests__/activity-card-cache-seed.test.ts` · (e2e 는 아래) |
| 테스트 (수정) | `src/shared/lib/__tests__/session-cleanup.test.ts`(순서 5단계 — 단정 강화) · `apps/web/__tests__/home-settings.test.tsx`(로그아웃 전 카드 캐시 seed → 삭제 단정 추가) · `home-stage3.test.tsx`(+5) · `library-sheets.test.tsx`(+2) · `src/dev/__tests__/scenario-selection.test.ts`(Catalogue 허용 목록에 `offline-cached-card` — Catalogue 기존 key) · `src/mocks/__tests__/MockActivityApi.test.ts`(parse 대상에서 실패 key 제외 목록에 `offline-cached-card` 추가 — `offline` 과 같은 이유. NetworkError 는 seed 테스트가 단정) · e2e `home.spec.ts`(+4) · `library.spec.ts`(+1) · `toast.spec.ts`(정밀도) |
| 문서 | `docs/API_CONTRACTS.md` **Rev 8.4** (설계 변경 없음 — 구현 위치) · 이 절 |

## J-3. 검증 명령 (마지막 코드 수정 이후 전부 재실행, 2026-10-15)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 |
| `pnpm test` | ✅ **152 files / 2140 tests** (기준선 144 / 2066 → **+8 / +74**) |
| `pnpm lint:boundaries` | ✅ no dependency violations (719 modules, 2630 dependencies) |
| `pnpm build` | ✅ exit 0 (기존 chunk size 경고만). dist 에 캐릭터 avif·webp·png 각 4 |
| `pnpm format:check` | ✅ All matched files use Prettier code style |
| `pnpm assert:no-mocks` | ✅ 기존 sentinel 3종 0 + **빌드 전용 의존(sharp) 흔적 0건** (dist 4파일). **음성 대조**: dist JS 에 `@img/sharp` 1줄을 넣으면 **exit 1**, 원복 후 exit 0 |
| `pnpm assets:optimize` · `--check` | ✅ 4 마스터 처리 · 검사 OK. **결정성**: 2회 실행 md5 동일 |
| `pnpm test:e2e` (단독 — 다른 Playwright·vitest 0 확인 후) | ✅ **291 passed (6.4m)**, 1 worker — 마지막 수정(AC-4-84 e2e 추가) 이후 전체 재실행. 1회차(추가 전) 290 passed. **baseline 변경 0** (`git status e2e/__screenshots__` 0줄) |
| `ls apps/api supabase apps/mobile` | 전부 No such file or directory |

## J-4. AC 판정 근거 (판정은 QA 가 한다)

| AC | 근거 | 남은 부분 |
|---|---|---|
| **81** `QA-3-001` | 6요소 중 **5 + 흐름 hook**: ① `PushPermissionPort`(`getStatus`·`request`·`getToken` + `platform`) — interface 에 DOM 타입 0(`push-permission-surface.test`) ② **Web 구현** `Notification.permission`/`requestPermission()` 까지만 — `web-push-permission.test` 9건(prompt 상태 조회는 프롬프트 0회 · granted → 자리표시 토큰 · denied 재요청 0 · 미지원 · 구형 콜백) ③ **`push-permission-denied`** = 그룹 `push`(`?scenario=push:push-permission-denied`) — `MockPushPermissionPort.test` ④⑤ contracts `notification-preferences`·`push-devices` · `PushPlatform` 3값 = `S4-B` 그대로 ⑥ 선택 지점 `app/providers/apiClients.ts` 1곳. **흐름**: `usePushPermission.test` 4건 — 마운트만으로는 묻지 않음 · request → granted → 기기 **1회** 등록(token 로그 `[redacted]`, 응답 token 없음) · denied → 등록 0 · 재요청 프롬프트 0 · 등록 실패 → 권한 유지 + 재시도. **grep 증거**: `PushManager`·`pushManager`·`serviceWorker`·`applicationServerKey`·VAPID·OneSignal·firebase·`@capacitor/push-notifications` **0건**, `Notification` 전역은 Web 구현 1파일만 | ⛔ **사전 안내 UX 의 화면(표면)** — J-8 **N-J1**. 표면이 없어 e2e 0 |
| **82** `QA-3-002` | e2e `home.spec` "`offline-cached-card` — 캐시된 카드 3장과 Offline Banner 가 동시에" (배너 = `.haru-app-shell__bar-top` 안 · 헤더 밴드 아래 · 덱 슬롯 안내 0 · 저장 키 3개뿐) + "캐시 없는 `offline` 은 Stage 3 그대로". 단위 `home-stage3.test` 5건(성공 시 저장 · 동시 표시 · 캐시 없으면 Stage 3 안내 · **서버 오류엔 캐시 미사용** · 2일 경과 폐기) | — |
| **83** `QA-3-002` | 유효기간·폐기 규칙 = `activity-card-cache.test` 13건(키·버전·상한 상수 · 1일 유지/2일 폐기+삭제 · schemaVersion · parse 실패 4종 · 다른 아이 · clear · 쓰기 parse · 저장소 예외). 로그아웃 삭제 = `session-cleanup.test`(순서 `signOut → draft → 카드 캐시 → 로컬 녹음 → Query`) · `home-settings.test`(seed 후 로그아웃 → 키 null · `haru.*` 0) · e2e `home.spec` "로그아웃하면 카드 캐시가 지워진다" + 기존 "HARU 키 0" e2e(이제 Home 착지가 카드 캐시를 실제로 쓰므로 **이 변경 없이는 실패하는** 단정이다) | — |
| **84** `QA-3-003` | `pnpm assets:optimize` → **AVIF·WebP 생성**(4 마스터) · `--check` 모드 · 해상도 상한(`D-4` 1440, 캐릭터 `D-13 ②`) 초과 시 PNG fallback 을 줄여 다시 쓴다(현재 4종 모두 상한 안 → PNG 재기록 0). `<picture>`+`srcset` 적용 **2곳**(`CharacterIllustration` · `CharacterMedallion`). 단위 `CharacterPicture.test` 3건 · `asset-pipeline.test` 9건. **DOM e2e** `home.spec` "브라우저가 AVIF 를 고른다" — `currentSrc` `.avif` · `naturalWidth 915` · `picture` `display: contents` | ⚠️ PNG 는 "생성" 이 아니라 **마스터 = fallback** (상한 초과 시에만 재생성) — J-8 ② |
| **85** `QA-3-003` 경계 | 표지 에셋 교체(`P3-BIP-19`)는 **하지 않았다** — `shared/assets/book-covers/*` 변경 0, 파이프라인 그룹에 표지 없음(스크립트 머리말에 Stage 8 게이트 명시). 근거 문서 Plan §2.4 `QA-3-003` 행 · §3 Out of Scope 표(`:376`) | ✅ 법무 (Stage 8) |
| **86** `AC-3-22`~`26` | ⛔ **구현하지 않았다** — J-8 **N-J2** | 결정 필요 |
| **87** §30.7 ① | `S4-C` 에서 구현(`library.savebook:error`). 이번 e2e 에서 다시 통과 | — |
| **88** §30.7 ② | fixture `MOCK_PURCHASE_URL`(`https://books.example/…` — RFC 2606 예약 도메인) **Favorites 첫 권에만**. 단위 `library-sheets.test` 2건(링크 href·`target=_blank` · 링크 없는 `favorite_only` 는 빈 상자 0) · e2e `library.spec` "Favorites 첫 권 시트에 `Where to buy`" | — |
| **`QA-3-011`** | `toast.spec` — ① 각 화면 고유 요소 등장 + 직전 화면 요소 0 을 기다린 뒤 잰다 ② `expectTopBarNotCovered(page, screen, controls)` 에 **TopBar 대화형 요소 목록(실측)** 을 필수로 받아 `toStrictEqual` — `/` `['Settings']` · `/auth/log-in` `['Back']` · `/library` `[]`. **결함 재현 증거**: ② 만 넣고 ① 을 넣기 전 `/library` 가 **`["Go back"]`**(= `/library/add` 의 TopBar)으로 실패했다 → QA 가 지적한 "전환 중 측정" 이 실제로 일어나고 있었다 | — |

## J-5. Mock 시나리오 · 전환 방법

| key | 전환 | 동작 |
|---|---|---|
| **`push:success`** (기본) | `?scenario=push:success` | 포트 `prompt` 시작 → `request()` → `granted` → 토큰 `mock-web-push-token` |
| **`push:push-permission-denied`** ⭐ | `?scenario=push:push-permission-denied` | `request()` → `denied`, 이후 프롬프트 없이 `denied` · 토큰 null |
| `notifications.registerpushdevice:retry` 등 | `S4-C` 메서드 override 그대로 | 기기 등록만 실패/재시도 |
| **`activity-cards:offline-cached-card`** ⭐ | `?scenario=activity-cards:offline-cached-card` (로그인 화면에 붙여 들어간다 — e2e `logIn(page, scenario)`) | API: 조회·선택 `NetworkError`(`offline` 과 같다). 기기: 브라우저 조립 지점이 **기기 시계 오늘 날짜** 카드를 캐시에 seed → Home = 카드 3장 + 헤더 밑 Offline Banner |
| `activity-cards:offline` | 기존 | 캐시가 없으면 Stage 3 덱 슬롯 안내 그대로 |

`push` 그룹과 `offline-cached-card` 는 dev Scenario Panel 에 표시하지 않는다(`S4-C` 의 Stage 4 그룹과 같은 판단 — URL 로 전환). `activity-cards` 그룹은 패널에 있으므로 패널에서 `offline-cached-card` 가 **보인다**.

## J-6. 설계 요점

1. **캐시 seed 는 Mock Adapter 가 아니라 브라우저 조립 지점**이 한다 — 캐시는 서버가 아니라 기기 상태다(`S4-E` 로컬 녹음 seed 와 같은 구조). seed 는 앱과 **같은 저장 경로**(`createActivityCardCache().write` — schema parse)를 쓴다.
2. **seed 날짜 = 기기 시계**. Mock 서버 시계(2026-01-01)로 만들면 `D-11` "2일 이상 과거" 폐기에 걸려 시나리오가 성립하지 않는다. Mock 소스는 시계를 읽지 않는다 — `app/providers/apiClients.ts` 가 `createSystemClock()` 을 넘긴다. ⚠️ 그 결과 **Mock 데모의 평소 카드(2026-01-01)는 캐시에 써지지만 다음 오프라인 진입 때 stale 로 버려진다**. 실제 서버(날짜 = 오늘)에서는 생기지 않는 Mock 전용 거동이다.
3. **"오늘" 판정은 캐시 수명에만** 쓴다 — 화면은 날짜를 판정·표시하지 않는다(`D-10` 유지).
4. **서버 오류에는 캐시를 쓰지 않는다** — 네트워크 오류일 때만. 오류를 오래된 카드로 감추지 않는다.
5. 이번 화면에서 이미 받은 카드가 있으면 재조회가 오프라인으로 실패해도 그 카드 + 배너다(TanStack 이 data 유지). 로컬 캐시는 **받은 카드가 없을 때만** 읽는다.
6. **에셋 품질 = 무손실** — AVIF 무손실 디코드가 PNG 와 **바이트 단위로 같다**(4종 전부 diff 0), WebP 는 `exact: true` 로 알파 0 픽셀까지 같다. 그래서 `<picture>` 전환이 **픽셀을 바꾸지 않았고** baseline 이 그대로 통과한다(e2e 290 · 변경 0). 용량 절감은 WebP −35% · AVIF −22% 수준(손실 q70 이면 PNG 의 약 8%). 손실 전환은 `QUALITY` 상수 1곳 + baseline 재생성 절차(R-BASELINE-1)로 한다.
7. `sharp` 는 **root devDependency 만**(`apps/*`·`packages/*` 매니페스트 0) · 앱 소스 import 0(`asset-pipeline.test`) · http 산출물 흔적 0(`assert:no-mocks`).

## J-7. `BACKEND_INTEGRATION_PENDING` 예상 (Handoff 반영 대상)

| 항목 | 내용 | Handoff |
|---|---|---|
| RU-19 | **Web 의 push 토큰은 자리표시 값**(`web-permission-only:v1`)이다 — 실제 Web Push 구독(`PushManager` + VAPID)은 provider 선정 후 Backend 와 함께 정한다. 서버는 이 값으로 발송할 수 없으며, 같은 값을 여러 계정이 보낼 수 있다(토큰 기준 upsert 가 **계정 간 기기를 합치면 안 된다**) | `BACKEND_HANDOFF.md` (`P4-BIP-13`) |
| RU-20 | 로그아웃 시 `DELETE /v1/push-devices/:id` 를 **부르지 않는다**(표면 없음 — 등록 경로 자체가 화면에 없다). 계정 전환 시 기기 정리 정책은 서버·표면 결정과 함께 | `BACKEND_HANDOFF.md` · `AUTH_REQUIREMENTS.md` |
| RU-21 | Activity Card 캐시 수명은 **기기 로컬 날짜**로 판정한다 — 서버 `card.date` 의 기준 시간대(`D-10`)와 기기 시간대가 다르면 경계가 하루 어긋날 수 있다(폐기 기준 2일이라 표시에는 영향 작음) | `DATA_REQUIREMENTS.md` |

## J-8. 발견 문제

| 구분 | 내용 |
|---|---|
| Blocking | 없음 |
| Non-blocking | ① **Offline Banner 문구는 명세에 없다** — `This is your most recent card. It will update when you're back online.`(제목 `You're offline.`) · `features/activity-card-deck/copy.ts` 1곳. Stage 3 Design Spec §8 은 *"캐시 카드 + Offline Banner"* 만 정했다 → **design-agent 확인 대상**. ② AC-4-84 의 "PNG 생성" 은 **마스터 = fallback** 으로 해석했다(상한 안이면 재인코딩하지 않음 — 이유 없는 바이트 변경을 막는다). 상한 초과 시에만 PNG 를 줄여 다시 쓴다(그때 마스터가 바뀐다 — 원본은 OneDrive). 리터럴 "항상 재생성" 이 필요하면 원본 디렉토리 분리 결정이 필요. ③ 파이프라인 대상은 **캐릭터만** — 표지는 Mock 임시 에셋이고 서버 `coverUrl` 로 대체된다(AC-4-85). `BookCover`(packages/ui)는 `<picture>` 미적용. ④ Stage 3 Design Spec §8 의 *"캐시 날짜가 오늘이 아니면 카드 날짜를 화면에 밝힌다"* 는 **구현하지 않았다** — Home 재구현(approvals §12.8, `AC-3-11` 폐기)으로 날짜 표시 자리가 Figma 에서 사라졌다(최우선 규칙 2). 캐시는 최대 1일 전 카드라 영향이 작다. ⑤ `offline-cached-card` 에서 `★ Save` 는 막지 않았다(오프라인이면 실제 요청이 실패 Toast 로 끝난다). Spec §8 *"선택 CTA disabled"* 의 선택 CTA(`Start Session`)는 이미 `aria-disabled`(`D-3`) |
| NEEDS_DECISION | **N-J1 — push 권한 사전 안내 UX 의 표면.** Stage 3 Design Spec §2.14 가 명세한 표면은 `/settings/notifications`(push 권한 블록만)인데, Stage 4 Plan 은 그 화면을 **Out of Scope**(`D-18` 유지, AC-4-02 *"`/settings/notifications` 화면 0건"*)로 두었고 Figma 에도 다른 진입점이 없다. 그래서 **포트·Web·Mock·흐름 hook 까지만** 만들고 화면은 만들지 않았다(최우선 규칙 2). 또 §2.14 의 granted 상태 `Toggle` 은 `packages/ui` 에 **아직 없다**(가값 `P-20`, Stage 3 미구현). 선택지: ⓐ `/settings/notifications` 를 push 블록만으로 살린다(AC-4-02 문구 수정 + `Toggle` 신규 Shared UI) ⓑ 다른 표면(예: 세션 완료 후)에 사전 안내를 둔다(design-agent 명세 필요) ⓒ 알림 설정 화면 Figma 도착 Stage 로 **표면만 재이월**(AC-4-81 은 표면 부분 PARTIAL). **N-J2 — `AC-4-86`(Reading Context 시트) 미구현.** Design Spec §7.5 가 시트 내용은 명세했지만 ① **진입점(트리거 위치)** 이 없다(Figma 의 그 자리는 `★ Save`) ② picker 수치 규격이 *"`D-18` 이 도달 Stage 로 이월 → 미결"* 로 적혀 있다 ③ 사용 지점은 Activity Card 경로의 **세션 시작**(`D-9` 필수 · `D4-25` 서재 경로는 없음)인데 `Start Session` 활성화는 `S4-F` 범위다 — 지금 만들면 시트를 열 경로가 없다. **권장: `S4-F` 와 함께**(진입점 = `Start Session` 탭 시 시트), 단 트리거·picker 규격 결정이 선행 |

**화면 변경 — design-agent Visual Gap 검토 필요**: ① Home `activity-cards:offline-cached-card` 상태(신규 상태 화면 — 헤더 밑 Offline Banner + 카드 3장). 이 상태의 시각 baseline 은 **만들지 않았다**(Visual Gap 검토·문구 확인 전에 굳히지 않는다 — R-BASELINE-1). ② 캐릭터 `<picture>` 전환은 **픽셀 변화 0**(baseline 290 통과 · 변경 0)이라 시각 검토 대상이 아니다. 그 밖의 화면 변경 0.
