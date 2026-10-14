# Stage 4a Handoff — `S4-A` (Web 녹음 spike)

Status: **HANDOFF (2026-10-14, development-agent)** · 작업 단위 **`S4-A` 만**. `S4-B`~`S4-J` 는 착수하지 않았다.
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
