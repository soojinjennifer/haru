# Stage 8 Handoff

Status: **HANDOFF** · 작업 단위별로 절을 덧붙인다. **커밋하지 않았다.**

---

## H8-1 (S8-A)

`S8-A` Contracts + Mock (2026-11-20, development-agent). 이 단위는 **contracts · Mock · Http 골격 · query key 만** 만들었다. 화면 · route · feature hook · 컴포넌트는 만들지 않았다 (`S8-B` 이후).

### H8-1.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-8-plan.md` rev 2 — `Status: APPROVED (2026-11-20, user)` (`D8-1`) ✅ |
| Design Spec | `docs/design/stage-8-design-spec.md` — `APPROVED (2026-11-20, user)` (`D8-1`) ✅ (이 단위는 UI 없음 — §7 Mock 요청 `M8-4` · `Q8-10` ⓐ `C8-10` 만 반영) |
| 이전 Stage | Stage 7 `PASS (accepted: QA-7-002, QA-7-003, QA-7-004)` (커밋 `186b396`) ✅ |
| Backend 작업 | 없음. `ls apps/api supabase apps/mobile` → `No such file or directory` ×3 |

### H8-1.2 구현 — Plan §7 · §8

| # | 구현 | 파일 |
|---|---|---|
| `C8-1` | `DataManagementSummarySchema` (`retentionPolicy: RetentionPolicySchema{ rawAudioDays: int>0 }` · `recordingsCount: int≥0` · `activeDeletionRequest: DeletionRequest \| null` — 진행 중 `all_data`·`account` 만 refine) | `packages/contracts/src/data-management/summary.ts` |
| `C8-2` | `SessionListItemSchema = SessionSummary.extend({ recording: RecordingStatus.nullable().default(null) })` · `ListSessionsResponse = paginated(SessionListItem)` · `ListSessionsRequest.hasRecording?: boolean` | `src/sessions/list.ts` |
| `C8-3` | `DeletionRequestSchema` (scope별 `sessionId` · 상태별 `completedAt` refine) · `CreateDeletionRequestSchema { scope: 'all_data', confirmation: true }` `.strict()` · `isDeletionInProgress()` · `IN_PROGRESS_DELETION_STATUSES` | `src/data-management/deletion-request.ts` |
| `C8-4` | `DeletionScope` += `account` (3값) · `DeleteAccountRequestSchema { confirmation: true }` `.strict()` | `src/enums/deletion.ts` · `deletion-request.ts` |
| `C8-5` | `ACCOUNT_DELETION_PENDING` (409) — `DELETION_ALREADY_REQUESTED` 바로 뒤, **30종** · 화면 문구 `ERROR_COPY` 1행 | `src/common/error-codes.ts` · `apps/web/src/shared/copy/error-copy.ts` |
| `C8-6` | **구현 0** (`N8-06` ⓑ) — contracts · API Client · Mock 에 `ConsentHistory` 없음 (테스트로 고정) | — |
| `C8-9` | `DataManagementApi { summary, listRecordingSessions, deleteSessionRecording, createDeletionRequest, getDeletionRequest }` · `AccountApi { deleteAccount }` → `ApiClients.dataManagement` · `.account` · Mock + Http 골격 | `apps/web/src/shared/api/{data-management-api,account-api}.ts` · `http/Http{DataManagement,Account}Api.ts` · `mocks/data-management/MockDataManagementApi.ts` · `mocks/account/MockAccountApi.ts` |
| `C8-10` | `CaregiverSchema.email = z.email()` (필수) · `UpdateCaregiverRequestSchema` 에는 없음 · Me fixture 전부 `MOCK_CAREGIVER_EMAIL = 'sam@example.com'` | `src/me/me.ts` · `mocks/fixtures/me.ts` |
| §5.2 query key | `dataManagementKeys.summary()` · `.request(id)` · `sessionKeys.lists()` · `sessionKeys.list(childId, { hasRecording })` | `apps/web/src/entities/data-management/` · `entities/session/sessionKeys.ts` |
| §8 Mock key | `data-management` 11 key · `account` 6 key (아래 H8-1.5) · dev Scenario Panel 에 두 그룹 등록 | `mocks/data-management/dataManagementScenarios.ts` · `dev/scenario-panel/devScenarios.ts` |
| `M8-4` fixture | 녹음 목록 **8행 · cursor 2페이지(5+3)** = 지난 세션 2(`uploaded`) + `pending` · `failed` · `book=null`(`uploaded`) · 40자 제목 *The Little Owl Who Counted All the Stars*(`uploaded`) · `deleted` · `expired` | `mocks/fixtures/data-management.ts` · `mocks/data-management/recordingHistory.ts` |
| 교차 일관성 | 세션 녹음 삭제 → `sessionState` 녹음 `deleted` → `sessions.getDetail` · 목록 행 · **하이라이트 클립 재생 `RECORDING_DELETED`(`reason` 그대로)** · 업로드 경로 `RECORDING_DELETED`. 전체 삭제 · 탈퇴 `completed` → 세션 · 아이 프로필 · 온보딩 서버 상태 삭제 → `GET /v1/me` = `not_started` · 아이 없음 (탈퇴는 동의도 초기화) | `MockHighlightClipApi.ts` · `MockMeApi.ts` · `sessions/sessionState.ts` (`toRecordingStatus` · `wipeSessionState`) · `mocks/index.ts` (`onDataDeleted`) |
| 쓰기 차단 | 진행 중 `all_data`·`account` 요청이 있으면 쓰기 메서드 → `ACCOUNT_DELETION_PENDING`. **메서드 목록 1곳**(`DELETION_PENDING_WRITE_METHODS`)을 번들 조립 지점에서 감싼다 — 제외: 삭제·탈퇴 endpoint 자신 · `deletePushDevice`(로그아웃 정리) · `uploadTransport`(Storage 바이트) · 읽기 | `mocks/common/writeGuard.ts` · `mocks/data-management/deletionState.ts` |
| 기기 seed | `data-management:recording-delete-local-pending` → `pending` 행 세션에 1시간 전 미업로드 녹음(청크 5) + 큐 항목(다음 시도 1시간 뒤) | `mocks/fixtures/local-recordings.ts` `seedPendingLocalUpload` · `mocks/recorder/deviceSeed.ts` |
| `OBS-5-7` | 온보딩 서버 draft fixture 아이 이름 `Nova` → `MOCK_CHILD_FIRST_NAME`(`Emma`) — 화면 코드 변경 0 | `mocks/fixtures/onboarding.ts` |
| 문서 | `docs/API_CONTRACTS.md` **Rev 12.1** (머리말 ①~⑩ · §1.2 · §2.2 · §3.13 · §4 Stage 8 · §5.4 fixture 행) | — |

### H8-1.3 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| AC-8-04 | contracts `stage-8.test.ts` 진입점 export 목록 · 앱 안 중복 선언 0 (`dataManagementApi`·`accountApi` 는 contracts 타입만 import) |
| AC-8-05 | `stage-8.test.ts` "기존(Stage 4) 목록 항목 … 그대로 통과" · `sessions.test.ts` `paginated(SessionSummary)` 기존 테스트 무수정 통과 |
| AC-8-06 | `stage-8.test.ts` `confirmation` literal · `.strict()` · Http 골격은 `false` 면 전송 0 (`http-stage8.test.ts`) |
| AC-8-07 | `error-envelope.test.ts` 30종 전수 스냅샷 · `stage-8.test.ts` 409 · 순서 |
| AC-8-08 | `stage8-data-management.test.ts` — 전 key 응답 schema parse (Mock 이 경계에서 `parseRequest`/`parseResponse`) |
| AC-8-09 | 같은 파일 "결정성" — `data-management` 11 key · `account` 6 key 각 3회 동일 |
| AC-8-10 | 같은 파일 "세션 녹음 삭제 + 교차 일관성" |
| AC-8-11 | Adapter 선택 지점 = 기존 `app/providers/apiClients.ts` 1곳(변경 0) · `http-stage8.test.ts` (경로 · method · IK · parse · `https:` 거부) |
| AC-8-12 | `API_CONTRACTS.md` Rev 12.1 — 구현과 다른 점 ①~⑩ |
| AC-8-93 | `stage-8.test.ts` (필수 · 형식 · PATCH 에 없음) · `stage8-data-management.test.ts` (`me` 전 key 이메일 · 요청 로그에 이메일 원문 0). e2e console 수집은 화면 단위(`S8-D`)에서 |
| AC-8-94 | fixture 부분만: 행 상태 5종 · `book=null` 1 · 40자 1 · 2페이지 (단위). 화면 · baseline 부분은 `S8-B` |

### H8-1.4 검증 (2026-11-20, 순서대로 실행 · 전부 exit 0)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm lint:boundaries` | 0 — `no dependency violations found (1072 modules, 4370 dependencies cruised)` |
| `pnpm build` | 0 (기존 chunk 크기 경고만) |
| `pnpm test` | 0 — **233 files / 3,463 tests** (이전 230 / 3,382 → 신규 파일 3: contracts `stage-8.test.ts` 18 · `stage8-data-management.test.ts` 51 · `http-stage8.test.ts` 11, `device-seed.test.ts` +1) |
| `pnpm format:check` | 0 |
| `pnpm test:e2e` (단독 실행) | 0 — **890 passed** (20.6m) · failed 0 · flaky 0 |
| `git status --short e2e/__screenshots__` | 변경 0 (baseline 재생성 · 신규 0) |

기존 테스트 수정 (계약 변경을 따라간 것 — 약화 0): `error-envelope.test.ts`(29→30 스냅샷) · `enums.test.ts`(`DeletionScope` 3값) · `stage-5/6/7.test.ts`(각 Stage 불변식 "신규 0" 은 `ACCOUNT_DELETION_PENDING` 을 뺀 29종으로 유지) · `stage-4-surface.test.ts`(export +`SessionListItemSchema`) · `profile-and-me.test.ts` · `resolveGuardDecision.test.ts`(Me 리터럴에 가상 이메일) · `guard-integration.test.tsx` · `providers.test.tsx`(`ApiClients` stub 2도메인) · `scenario-selection.test.ts` · `ScenarioPanel.test.tsx`(패널 그룹 +2) · `onboarding-screens.test.tsx`(`Nova` → fixture 이름 상수).

### H8-1.5 Mock 시나리오 전환

`?scenario=<group>:<key>` (메서드 단위 `?scenario=data-management.deletesessionrecording:error`). dev 서버에서는 Scenario Panel 에도 두 그룹이 있다.

| group | key |
|---|---|
| `data-management` | `success` · `loading` · `empty` · `error` · `retry` · `offline` · `deletion-processing` · `deletion-failed` · `deletion-already-requested` · `recording-deleted` · `recording-delete-local-pending` |
| `account` | `success` · `loading` · `error` · `retry` · `offline` · `deletion-pending-write-blocked` |

- 전체 삭제 진행 = `GET /v1/data-deletion-requests/:id` **조회 횟수**: 1 `received` · 2 `processing` · 3 최종 (`MOCK_DELETION_FINAL_READ`)
- `error` code 지정 = 번들 옵션 `errorCodes` (`data-management` · `account` 키)
- 미가입 기기 draft 는 서버 key 가 아니다 (로컬 draft 주입 — `S8-D`)

### H8-1.6 NEEDS_DECISION

| # | 항목 | 현재 구현 | 결정 요청 |
|---|---|---|---|
| `H8-1-N1` | `ACCOUNT_DELETION_PENDING` 화면 문구의 **제목** | `ERROR_COPY` 는 제목 + 설명 2줄이 필수다. 설명 = Spec §10 원문 *Your data is being deleted, so changes are paused.* · 제목 = *Changes are paused* (**Spec 에 없음**) | design-agent: 제목 문구 확정 또는 "설명만" 표면 지정 (`S8-F`/`S8-D` 에서 표면 연결 전) |
| `H8-1-N2` | `recordingsCount` 의미 | `hasRecording=true` 목록 **행 수** = `deleted`·`expired` 행 포함 (Plan §8 "목록 녹음 수와 일치") → `success` 에서 8 | Spec §2.2 subtitle 이 "녹음 N개" 로 읽히면 삭제된 행까지 세는 것이 맞는지 확인 (아니면 "삭제·만료 제외" 로 바꾸고 문서 갱신) |
| `H8-1-N3` | `SessionListItem.recording` 이 입력에 없을 때 | `.default(null)` — 기존 항목도 parse 통과(AC-8-05). Backend 는 항상 보낸다 | 설계 스케치는 key 필수였다. QA · plan-agent 가 AC-8-05 해석으로 수용하는지 확인 |
| `H8-1-N4` | `deletion-failed` 의 *Try again* | 같은 key 에서는 **매 요청이 실패**한다(결정적) | `S8-C` 에서 "다시 시도 → 성공" 을 재현해야 하면 별도 표기(예: 2번째 요청부터 성공) 필요 여부 결정 |
| `H8-1-N5` | 전체 삭제 · 탈퇴 완료 후 리포트 Mock 상태 | 세션 · 아이 프로필 · 온보딩만 지운다. 리포트 상태는 남는다 (아이가 없으면 Guard 가 온보딩으로 보내 리포트 화면에 닿지 않음) | 재온보딩 후 옛 리포트가 보이는 것을 허용할지 — 프리뷰 데모 범위에서만 영향 |

### H8-1.7 알아 둘 점 (QA · 다음 단위)

- **`recording-delete-local-pending` 큐 항목**은 다음 시도를 1시간 뒤로 둔다. 큐는 `online` · 탭 `visible` 전환 시 **강제 처리**하므로, 실제 브라우저에서 탭을 오가면 삭제 전에 업로드가 끝날 수 있다. headless e2e 에는 영향 없음 — `S8-B` 가 검증할 때 참고.
- 쓰기 차단 guard 는 원래 메서드를 부르지 않으므로 **차단된 요청은 요청 로그에 남지 않는다** (서버 미도달 표현).
- `data-management:deletion-processing` · `deletion-already-requested` 도 진행 중 요청을 seed 하므로 그 key 에서는 **다른 쓰기도 막힌다** (서버 의미 일관).
- `sessions.list` 의 기존 결과(지난 세션 2행)는 바뀌지 않는다 — 녹음 목록 seed 는 데이터 관리 endpoint 가 처음 불릴 때만 들어간다.

### H8-1.8 UI 영향

화면 · route · 컴포넌트 · 토큰 변경 0. 바뀐 사용자 노출 값: ① `ERROR_COPY.ACCOUNT_DELETION_PENDING` 1행(아직 어느 화면도 이 code 를 받지 않는다) ② 온보딩 서버 draft fixture 이름(`prefilled-child-info` · `draft-resume` 에서만 보임) ③ dev 전용 Scenario Panel 그룹 +2 (Production · baseline 제외 — `R-BASELINE-1` ②). design-agent Visual Gap = "UI 영향 없음 확인" 대상 (Plan §12.1).

### H8-1.9 BACKEND_INTEGRATION_PENDING 예상 (Plan §10 그대로)

`P8-BIP-01` 세션 녹음 삭제(Storage 전 part + 클립 · audit · job 취소 · 멱등) · `02` 전체 삭제 파이프라인 · `03` 탈퇴 · `04` `hasRecording` 필터 · 보관 정책 값 · `05` OAuth `redirect_to` · `06` signed URL CORS · `07` 쓰기 차단 409 (Mock 메서드 목록 = `DELETION_PENDING_WRITE_METHODS` 를 대조 기준으로 Handoff 에 옮길 것) · `08` 동의 이력(선택) · `09` `caregiver.email` = 인증 이메일 · 읽기 전용 · 로그 원문 금지.

---

## H8-2 (S8-B)

`S8-B` 설정 확장 · 데이터 관리 · 세션 녹음 목록 (2026-11-20, development-agent). **커밋하지 않았다.**

### H8-2.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-8-plan.md` rev 2.1 — `APPROVED (2026-11-20, user)` (`D8-1`) ✅ |
| Design Spec | `docs/design/stage-8-design-spec.md` — `APPROVED` (`D8-1`) ✅ · §2.2 `VG8-A-04` 개정 반영 |
| 선행 단위 | `S8-A` (H8-1) — Orchestrator 재검증 6종 통과 ✅ |
| Backend 작업 | 없음. `ls apps/api supabase apps/mobile` → `No such file or directory` ×3 |

### H8-2.2 `VG8-A-04` (`H8-1-N2`) 반영 — `recordingsCount` = 삭제 가능한 녹음 수

design-agent 결정(`docs/design/stage-8-visual-gap.md` §3.2)을 따랐다: `uploadStatus ∈ {uploaded, pending, failed}` 행 수, `deleted`·`expired` 제외 → `success` **8 → 6**.

| 파일 | 변경 |
|---|---|
| `packages/contracts/src/data-management/summary.ts` | 주석 정정 (스키마 변경 0) |
| `apps/web/src/mocks/data-management/MockDataManagementApi.ts` | 집계 = `DELETABLE_UPLOAD_STATUSES` 필터 |
| `apps/web/src/mocks/__tests__/stage8-data-management.test.ts` | 기대값 8 → 6 · 행 삭제 후 6 → 5 (목록 행 수는 8 유지) |
| `docs/API_CONTRACTS.md` | Rev 12.1 머리말 ④ · §5.4 fixture 행 문구 |

`H8-1-N1` 제목 *Changes are paused* 는 확정(S8-C/D 사용) — 이 단위에서 표면 연결 없음.

### H8-2.3 구현 — AC 매핑 (판정은 QA)

| AC | 구현 | 증거 |
|---|---|---|
| AC-8-13 | `ACCOUNT_SETTINGS_ROWS`(Data & privacy · Account) — `menuRows.ts` 한 곳 · Log out 마지막 | `stage8-settings-data.test.tsx` · `child-info-edit.test.tsx` · e2e `설정 목록 ACCOUNT` |
| AC-8-14 | `YOUR CHILD` 4행 · 로그아웃 Dialog 회귀 | 위 + `home.spec.ts` · `settings-child.spec.ts` |
| AC-8-15 | 보관 문장 = `retention(rawAudioDays)` · 화면 코드 `90` 리터럴 0 | 단위 copy 함수 · grep 테스트(주석 제외) |
| AC-8-16 | Spec §10.2 · §10.3 원문 | copy 모듈 |
| AC-8-17 | Loading(Skeleton) · Error/Retry · Offline (`ErrorState`) | 단위 · e2e · baseline `data-loading` `data-error` |
| AC-8-18 | 요약 `activeDeletionRequest` → 최상단 `InlineAlert info`(진행률 0) · *Delete all data* 비활성 · 목록 *Delete* 비활성 | 단위 · e2e · baseline `data-deletion-processing` |
| AC-8-19 | 행 = 제목(`Storytime`) · `{Mon D} · {m} min` · 상태 meta 텍스트 · Tag/썸네일 0 · *Show more* | 단위 · e2e |
| AC-8-20 | 행 0 → `EmptyState`(CTA 0, 범위 문장 0) | 단위 · e2e · baseline `recordings-empty` |
| AC-8-21 | *Keep* → 요청 0 · 포커스 = 트리거 | 단위 · e2e |
| AC-8-22 | `DELETE …/recording` 1회 · IK(세션별 보관 — 실패 후 재시도 같은 키) · 연타 0 · 요약 무효화(6 → 5) | 단위(IK 동일) · e2e(요청 로그) |
| AC-8-23 | **서버 확정 후** `deleteLocalRecording` = UploadQueue `cancel` → LocalRecordingStore `delete`. 실패·오프라인 = 호출 0 | 단위(호출 시점 요청 수 = 1) · `sessionRecorderEnvironment.test.ts`(청크·큐 항목 0, 다른 세션 보존) · e2e(아래 H8-2.6) |
| AC-8-24 | `RECORDING_DELETED` → 행 *Deleted*(`expired` 사유면 *Removed after …*) · 오류 표면 0 | 단위 · e2e |
| AC-8-25 | `expired`·`deleted` 행 유지 · *Delete* 0 · 삭제 행 위치 불변 · 포커스 = 그 행(`tabindex=-1`) · live *Recording deleted.* 1회 | 단위 · e2e |
| AC-8-94 (화면) | 5종 meta · *Storytime* · 40자 제목 줄바꿈(말줄임 0) · *Show more* 후 8행 | e2e · baseline 393/320 `recordings-all` |

### H8-2.4 파일

- 신규 feature: `apps/web/src/features/data-management/` (`copy.ts` · `ui/DataManagement.tsx` · `ui/DeletionStatusAlert.tsx` · `data-management.css` · `index.ts`) · `apps/web/src/features/recording-deletion/` (`copy.ts` · `model/recordingRowView.ts` · `model/useDeleteSessionRecording.ts` · `ui/RecordingList.tsx` · `index.ts`)
- entity: `entities/data-management/useDataManagementSummary.ts` · `useRecordingSessions.ts` (key = `sessionKeys.list(childId, { hasRecording: true })`) · `index.ts`
- page: `pages/settings/{DataManagementPage,DataManagementTopBar,RecordingListPage,RecordingListTopBar,AccountPage,AccountTopBar}.tsx` · `index.ts` · `app/router.tsx` · `shared/config/routes.ts`(`settingsData` · `settingsDataRecordings` · `settingsAccount`)
- 설정: `features/settings/{copy.ts,model/menuRows.ts,ui/SettingsMenu.tsx}`
- 녹음 조립: `entities/session/sessionRecorder.tsx`(`SessionRecorderEnvironment.deleteLocalRecording`) · `app/providers/sessionRecorderEnvironment.ts`
- 스타일: `styles/index.css` import 1 · `data-management.css` (`gap: var(--space-3)` — `provisional: P-41` · chevron `P-24`). 신규 토큰 · 컴포넌트 · 아이콘 · overflow **0**
- 테스트: `apps/web/__tests__/stage8-settings-data.test.tsx`(신규 21) · `sessionRecorderEnvironment.test.ts`(+1) · `child-info-edit.test.tsx` · `home-settings.test.tsx`(ACCOUNT 3행으로 갱신 — Spec §2.1) · `__tests__/session-notices.test.tsx`(stub 메서드 +1) · e2e `e2e/settings-data.spec.ts`(신규) · `home.spec.ts` · `settings-child.spec.ts`(ACCOUNT 3행)

### H8-2.5 Mock 시나리오 전환

H8-1.5 그대로. 이 단위가 쓰는 것: `?scenario=data-management:{success|loading|empty|error|retry|offline|deletion-processing|recording-deleted|recording-delete-local-pending}` · 메서드 단위 `data-management.deletesessionrecording:{error|loading|retry}` · `data-management.listrecordingsessions:{error|loading}`. 기기 오프라인 = 브라우저 오프라인(`navigator.onLine === false`) — 요청 0.

### H8-2.6 알아 둘 점 (QA)

- **오프라인 판정**: TanStack mutation 기본 `networkMode: 'online'` 은 오프라인이면 삭제를 **보류했다가 연결 시 전송**한다(되돌릴 수 없는 행위 지연 실행 — Plan §5.3 금지). `networkMode: 'always'` + `navigator.onLine` 직접 판정으로 보내지 않는다. e2e `context.setOffline(true)` 로 확인.
- **AC-8-23 e2e 증거 방식**: Mock 녹음 저장소는 메모리라 창에 노출되지 않는다(새 전역 0). 대신 `recording-delete-local-pending` 에서 연결을 껐다 켜 큐 강제 처리를 유도해 **업로드 시도(`POST /v1/sessions/:sessionId/recordings`) 유무**로 큐 항목 존재를 관측한다 — 대조군(삭제 안 함) = 시도 있음, 삭제 후 = 0. 저장소 계수(청크 · 큐 항목 0)는 단위 테스트.
- **처리 중 닫기**: 확인 처리 중에는 Esc · scrim · *Keep* 모두 무시(요청은 이미 나갔다 — Spec §2.4). `Dialog` 에 `dismissible` 이 있으나 처리 중 전환은 소비자(`onCancel` no-op)로 했다 — Shared UI 변경 0.
- **포커스(성공)**: `ListRow` 가 ref 를 받지 않아 제목 노드 → `closest('li')` 에 `tabindex=-1` 을 주고 blur 시 제거한다 — Shared UI 변경 0.
- **날짜**: `formatMonthDay(완료 시각, 기기 now)` — Mock 서버 시계는 2026-01-01 고정이라 fixture 날짜가 2025년이고, 기기 연도와 달라 **연도가 붙는다**(`Dec 31, 2025`). 실제 데이터에서는 같은 해면 `Mon D`.
- **Back**: 신규 3 TopBar 는 Spec §6.3 부모 표를 바로 적용했다(앱 안 기록 없으면 부모로 replace). 기존 7곳 일반화는 `S8-F`.
- `RECORDING_DELETED` 응답에도 로컬 사본을 지운다 — 서버에 오디오가 없다는 확정이고, 남겨 두면 업로드 큐가 같은 오류로 계속 실패한다.

### H8-2.7 NEEDS_DECISION / 보고 (최우선 규칙 2·3 — 임의 처리하지 않은 지점)

| # | 지점 | 현재 구현 | 결정 요청 |
|---|---|---|---|
| `H8-2-N1` | 행 삭제 실패 · 오프라인 InlineAlert **설명 문구** — Spec §2.3 "해당 행 이름 포함"이나 §10.3 에 원문 없음 | 제목 = 기존 `errorCopyForCode` / `networkErrorCopy` · 설명 = *{title} was not deleted.* / *Nothing was sent. {title} was not deleted.* (§10.2 *Nothing was sent.* 패턴) | design-agent 문구 확정 |
| `H8-2-N2` | **320 폭 행 보조 줄** — Spec §8.1 *"meta 가 다음 줄로 감김(ListRow 기존 동작 확인)"*. 실측: 기존 `ListRow` meta-row 는 감기지 않고(`flex: 0 0 auto`) **subtitle 이 좁아져 단어 단위로 줄바꿈**된다(`Dec 28, / 2025 · / 12 min` — baseline `s8-recordings-all-320`). 393 에서도 *Not uploaded yet* 행은 `12 / min` 이 감긴다 | 기존 동작 그대로 (Shared UI 변경 0) | ① 수용 ② `ListRow` meta-row wrap 변형(Shared UI — 승인 대상) ③ subtitle 문구 축약 |
| `H8-2-N3` | `/settings/account` 본문 | `S8-B` 범위 = route + 진입 행 → TopBar *Account* 만, 본문 0 (`AccountPage` = `null`) | `S8-D` 가 채움 — 그 사이 빈 화면이 Visual Gap 대상이 아님을 확인 |
| `H8-2-N4` | *Delete all data* 행 | 행은 표시하되 `onPress` 미연결(표시 전용 div) — Dialog ② · 요청은 `S8-C`(Spec §14 `S8-C` = §2.4-②) | `S8-C` 가 `DataManagement onDeleteAllData` 로 연결 |
| `H8-2-N5` | `ListRow meta` 타이포 | 기존 사용처처럼 소비자가 `Text caption-1 secondary` 로 감쌌다 (`ListRow__meta` 자체는 크기 지정 없음) — Spec §2.3.1 "`text-secondary` 계열" | 확인 |

### H8-2.9 검증 (2026-11-20, 순서대로 · 전부 exit 0)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm lint:boundaries` | 0 (`no dependency violations found`) |
| `pnpm build` | 0 (기존 chunk 크기 경고만) |
| `pnpm test` | 0 — **234 files / 3,487 tests** (이전 233 / 3,463 → 신규 `stage8-settings-data.test.tsx` 21 · `sessionRecorderEnvironment` +1 · `child-info-edit` +2 · stage8 Mock 기대값 갱신) |
| `pnpm format:check` | 0 |
| `pnpm test:e2e` (단독) | 1차 **926 passed · 2 failed** (21.5m) — 실패 2건 = 아래 기존 baseline 변경(원인 1개). 재생성 후 해당 spec 재실행 통과. 신규 `settings-data.spec.ts` 38건은 `--repeat-each=2` 76/76 통과(결정성) |

#### 기존 baseline 변경 (`R-BASELINE-1` ⑤ 분해 — 픽셀 행 범위 실측)

| baseline | 바뀐 영역 | 원인 | 처리 |
|---|---|---|---|
| `settings-child.spec.ts/s6-settings.png` (345×1216) | y 337~490 만 — `ACCOUNT` 라벨(y≈298) **아래** 그룹 안. 위쪽 `YOUR CHILD` 그룹 · 라벨 diff 0 | ACCOUNT 그룹에 *Data & privacy* · *Account* 2행 추가(Spec §2.1 — AC-8-14 "ACCOUNT 그룹 높이 증가분 외 diff 0" 충족) | `--update-snapshots=all` 로 이 1건만 재생성 |
| `visual.spec.ts/s3-dialog-scrim.png` (393×852, 로그아웃 Dialog 전체 프레임) | y 378~545 — scrim 뒤 설정 목록의 ACCOUNT 그룹 자리 · Dialog 자체 diff 0 | 같은 원인 (배경 목록 행 증가) | 같음 |

설명되지 않는 클러스터 0. 그 밖의 기존 baseline 변경 0 (`git status e2e/__screenshots__` = 위 2건 + 신규 `settings-data.spec.ts/` 22장).

신규 baseline 22장 (`e2e/__screenshots__/darwin/settings-data.spec.ts/`, 393 · 320 각 11): `s8-settings` · `s8-data` · `s8-data-deletion-processing` · `s8-data-error` · `s8-data-loading` · `s8-recordings-all` · `s8-recordings-deleted-row` · `s8-recordings-delete-failed` · `s8-recordings-dialog` · `s8-recordings-empty` · `s8-recordings-loading`. 전부 dev 패널 숨김 · settle 후 (Loading 2종은 `page.clock.install` 로 Mock 지연을 멈추고 가짜 시계 settle).

### H8-2.8 BACKEND_INTEGRATION_PENDING 예상

`P8-BIP-01` 세션 녹음 삭제(서버 Storage 전 part + 클립 실제 삭제 · audit · 업로드 토큰 무효화 · 멱등) · `P8-BIP-04` `hasRecording` 필터 · `recordingsCount` 집계 정의(`VG8-A-04` — 삭제 가능 녹음 수) · 보관 정책 값. 화면 · Contract 호출 · Mock 시나리오는 Frontend 판정 대상.

---

## H8-3 (S8-C)

`S8-C` 전체 데이터 삭제 요청 (2026-11-20, development-agent). **커밋하지 않았다.**

### H8-3.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-8-plan.md` rev 2.1 — `APPROVED (2026-11-20, user)` (`D8-1`) ✅ |
| Design Spec | `docs/design/stage-8-design-spec.md` — `APPROVED` (`D8-1`) §2.2 · §2.4-② · §2.5 · §2.9 · §6.2 · §9.1 · §10.2 ✅ · 쓰기 차단 제목 = `VG8-A-03` (*Changes are paused*) |
| 선행 단위 | `S8-B` (H8-2) — Orchestrator 6종 Gate 통과 (3,487) ✅ |
| Backend 작업 | 없음. `ls apps/api supabase apps/mobile` → `No such file or directory` ×3 |

### H8-3.2 구현 — AC 매핑 (판정은 QA)

| AC | 구현 | 증거 |
|---|---|---|
| AC-8-26 | 영향 안내(기존 §10.2 문장) → *Delete all data* 동작 행 → ConfirmDialog ②(destructive · 초기 포커스 Cancel · 제목 = first name) → `POST /v1/data-deletion-requests` 1회 · payload `{scope:'all_data', confirmation:true}` · IK. 처리 중 Esc · scrim · Cancel 무시 · 연타 1건 | 단위 `stage8-delete-all.test.tsx` · e2e `전체 데이터 삭제 요청` |
| AC-8-27 | `useDeletionRequest(id)` 폴링 **5s · 상한 60회** · 종착(`completed`·`failed`) 정지 · `RESOURCE_NOT_FOUND`·`FORBIDDEN` 정지 · 화면 이탈 시 정지(observer 0). `received → processing` 은 같은 문구라 DOM 불변(재낭독 0) · 진행률/스피너 0 | 단위(순수 · 가짜 시계 · DOM 동일성) · e2e(GET 3회 후 증가 0) |
| AC-8-28 | 서버 `failed` → 상단 `InlineAlert error`(role alert) + *Try again* = Dialog ② 재진입 · 요약 재조회로 행 활성 | 단위 · e2e · baseline `data-deletion-failed` |
| AC-8-29 | POST `DELETION_ALREADY_REQUESTED` → 진행 중 info 알림(오류 표면 0) · 요약 무효화 / `deletion-already-requested` key → 요약의 진행 요청으로 info · 행 비활성 | 단위(API 스텁) · e2e(key) |
| AC-8-30 | `navigator.onLine === false` → 요청 0 · 요청 버튼 위 `InlineAlert offline` (*You are offline* / *Nothing was sent.*) · `networkMode: 'always'` 로 연결 복구 후 재전송 0 · 다시 시도 = 행을 다시 누른다 | 단위 · e2e(`setOffline`) · baseline `data-deletion-offline` |
| AC-8-31 | `completed`(`all_data`) → `performSessionCleanup` 재사용(signOut 없음 — 계정 유지): draft · 카드 캐시 · 로컬 녹음(조립 런타임 정리) · Query 캐시(`me` 외 제거 + `me` reset) → `me` 재조회 → Guard = `/onboarding/start` · Toast success *Your data was deleted.* 1회 | 단위(localStorage 2키 0 · `clearLocalRecordings` 1회 · data-management/sessions 캐시 0 · 경로) · e2e(경로 · Toast · localStorage) |
| AC-8-32 | `deletionPendingCopy()` (shared/copy) — 기존 실패 표면에 문구만: 아이 정보 저장 · 성장 초점 저장 · 설문 재응답 제출 · 내 책 추가 · 홈 시트 선택 확정(`selectOption`) · 세션 시작(`sessionStartBlockedCopy` 확장 — 홈 · 서재 시트) | 단위(아이 정보 저장 · copy) · e2e(아이 정보 · 홈 시트) |

### H8-3.3 H8-1.6 이월 닫기

| # | 처리 |
|---|---|
| `H8-1-N4` RETRY | 신규 key **`data-management:deletion-retry`** — 번들 안 **첫** `all_data` 요청 `failed`, 두 번째부터 `completed` (결정적, 3회 반복 단위). 기존 `deletion-failed`(매번 실패)는 그대로. `API_CONTRACTS.md` Rev 12.2 · §5.4 등재 |
| `H8-1-N5` 리포트 · Progress | 완료 효과(`onDataDeleted`)에 `wipeReportState`(발행 0 · 주기 1 `in_progress` 0/0 · PDF 작업 0 · seed 재적용 0) + `MockProgressApi.isChildDataDeleted` → 빈 주. 단위 `stage8-data-management.test.ts` |

### H8-3.4 파일

- 신규: `entities/data-management/{deletionPolling.ts,useDeletionRequest.ts}` · `features/data-management/model/{deletionSurface.ts,useCreateDeletionRequest.ts,useDataDeletionCleanup.ts}` · `apps/web/__tests__/stage8-delete-all.test.tsx`(16)
- 수정: `features/data-management/{copy.ts,ui/DataManagement.tsx,ui/DeletionStatusAlert.tsx}` · `entities/data-management/index.ts` · `pages/settings/DataManagementPage.tsx`(주석) · `shared/copy/error-copy.ts`(`deletionPendingCopy` · `sessionStartBlockedCopy` +1 code · 주석) · 쓰기 차단 표면 5 (`child-profile-edit/ui/ChildInfoEditForm.tsx` · `growth-capability/ui/GrowthCapabilityPicker.tsx` · `survey-update/{model/useSurveyUpdateWizard.ts,ui/SurveyUpdateWizard.tsx}` · `library/AddOwnBookForm.tsx` · `activity-card-deck/ui/ActivityCardDeck.tsx`)
- Mock: `mocks/data-management/{dataManagementScenarios.ts,MockDataManagementApi.ts}` · `mocks/reports/reportState.ts`(`wipeReportState`) · `mocks/progress/MockProgressApi.ts` · `mocks/index.ts`
- 테스트: `mocks/__tests__/stage8-data-management.test.ts`(+2) · `dev/__tests__/scenario-selection.test.ts`(카탈로그 +1) · e2e `e2e/settings-data.spec.ts`(+7 기능 · +6 baseline)
- 문서: `docs/API_CONTRACTS.md` Rev 12.2
- 신규 컴포넌트 · 토큰 · 아이콘 · `overflow` **0**. `DeletionStatusAlert` 는 포커스 대상용 `div`(block) 1겹만 더한다 — 기존 baseline `s8-data-deletion-processing` 불변.

### H8-3.5 Mock 시나리오 전환

H8-1.5 · H8-2.5 그대로 + `?scenario=data-management:deletion-retry`. 이 단위가 쓰는 것: `data-management:{success|deletion-processing|deletion-failed|deletion-retry|deletion-already-requested}` · 메서드 단위 `data-management.createdeletionrequest:{error|loading|retry}` · `account:deletion-pending-write-blocked`(쓰기 차단). 기기 오프라인 = 브라우저 오프라인.

### H8-3.6 알아 둘 점 (QA)

- **Query 캐시 정리**: `QueryClient.clear()` 는 마운트된 Guard 의 `useMe` observer 를 다시 조회시키지 않아 화면이 멈춘다(실측). 그래서 `me` 외 query 를 **제거**하고 `me` 만 **reset**(활성 observer 재조회)한다 — 아동 데이터 캐시 0, `me` = 삭제 후 서버 상태.
- **Toast 시점**: 정리 완료 후 `toast.show` → Guard 이동. `ToastProvider` 가 router 밖이라 도착 화면(`/onboarding/start`)에 남는다. 이동 전 수 ms 동안 `/settings/data` 위에 겹칠 수 있다.
- **탈퇴(`scope='account'`) 완료**는 이 화면이 처리하지 않는다 — `S8-D` 가 요청 성공 즉시 정리 + 세션 종료한다(`N8-10` 탈퇴 ⓐ). 요약에 진행 중 `account` 요청이 보이면 같은 info 알림만 그린다.
- **포커스(요청 성공)**: `InlineAlert` 가 ref 를 받지 않아 `DeletionStatusAlert` 가 감싼 `div` 에 일시 `tabindex=-1` → blur 시 제거 (S8-B 행 포커스와 같은 방식, Shared UI 변경 0).
- **`DELETION_ALREADY_REQUESTED` 의 e2e**: `deletion-already-requested` key 는 요약부터 진행 요청을 보여 행이 비활성이라 POST 경로에 닿지 않는다. POST 응답 경로는 단위(API 스텁)로 검증했다.
- **baseline 테스트 1건 보정**: `baseline — 320 › data` 가 1차 실행에서 12,001px 차이로 실패 — 원인 = *Delete all data* 행이 이제 `onPress` 를 가진 버튼 행이 되어, 진입 클릭(*Data & privacy*) 위치에 남은 포인터가 그 행의 **hover** 를 찍었다(실측: 행 면 `244,249,247` → `237,243,241`, 행 영역만). baseline 은 그대로 두고 테스트에 `page.mouse.move(0, 0)` 를 더했다 (`R-BASELINE-1` — 과도기·상호작용 상태를 담지 않는다). 393 은 포인터가 행 밖이라 영향 없음.

### H8-3.7 NEEDS_DECISION / 보고 (최우선 규칙 2·3)

| # | 지점 | 현재 구현 | 결정 요청 |
|---|---|---|---|
| `H8-3-N1` | **폴링 상한 수치** — Plan §5.2 · AC-8-27 은 "상한·종료" 만 있고 값이 없다 | 5s × **60회(5분)** 후 정지 · 알림은 진행 중 그대로 · 화면 재진입 시 재개 | plan-agent / 사용자 확정 |
| `H8-3-N2` | 오프라인 · POST 실패 InlineAlert 에 **재시도 action 없음** — Plan §5.3 은 "(재시도 버튼)", Spec §2.2 는 action 없는 InlineAlert | Spec 대로 action 0 · 다시 시도 = *Delete all data* 행을 다시 누른다(행은 활성) | design-agent 확인 |
| `H8-3-N3` | POST 실패(오프라인 아님) 설명 문구 — Spec §10.2 에 원문 없음 | 기존 `errorCopyForCode` 제목 + 설명 그대로 | design-agent 확인 |
| `H8-3-N4` | **AC-8-32 미연결 표면** — ① Toast 실패 표면(책 저장 `saveBook` · 홈/서재) — Spec §2.9 "Toast 0" 이라 문구를 바꾸지 않았다 ② 리포트 PDF 요청(`reportPdf.request`) — job 상태에 error code 가 없다 ③ 온보딩 저장/제출 — 삭제 진행 중에는 온보딩 완료 상태라 도달 불가 ④ 세션 전이 · 녹음 업로드(백그라운드 — 화면 실패 표면 없음) · `reports.markViewed`(무음) · 알림 설정 | 기존 문구 유지 | 범위 확인 (① Toast 표면에 문구를 바꿀지 · ② PDF job 에 code 추가 여부) |
| `H8-3-N5` | 진행 중 `account` 요청(탈퇴)이 요약에 있을 때의 문구 — Spec §2.5 는 전체 삭제 문구만 | 같은 *We're deleting your data* | `S8-D` 에서 확인 |

### H8-3.8 BACKEND_INTEGRATION_PENDING 예상

`P8-BIP-02` 전체 삭제 파이프라인(즉시 `deletion_pending` · job 취소 · Storage prefix · **reports · 주간 집계 포함** hard delete · `received → processing → completed/failed` · 재시도 · 멱등 IK · SLA) · `P8-BIP-07` 쓰기 차단 409 (`DELETION_PENDING_WRITE_METHODS` 대조) · 폴링 대상 `GET /v1/data-deletion-requests/:id` 의 실제 진행 값. 화면 · Contract 호출 · Mock 시나리오 · 로컬 정리는 Frontend 판정 대상.

### H8-3.9 검증 (2026-11-20, 순서대로 · 전부 exit 0)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm lint:boundaries` | 0 (`no dependency violations found`) |
| `pnpm build` | 0 |
| `pnpm test` | 0 — **235 files / 3,506 tests** (이전 234 / 3,487 → 신규 `stage8-delete-all` 16 · Mock +2 · 카탈로그 +1) |
| `pnpm format:check` | 0 |
| `pnpm test:e2e` (단독) | 0 — **941 passed** (22.9m, 실패 0 · 이전 928 → +13) |

신규 baseline 6장 (`e2e/__screenshots__/darwin/settings-data.spec.ts/`, 393 · 320 각 3): `s8-data-deletion-dialog` · `s8-data-deletion-failed` · `s8-data-deletion-offline` — 전부 dev 패널 숨김 · settle · 포인터 치움 · 포커스 해제 후. `baseline` 28건 `--repeat-each=2` 56/56 통과(결정성).

기존 baseline 변경: **0**. `git status e2e/__screenshots__` 의 수정 2건(`s6-settings` · `s3-dialog-scrim`)은 S8-B 산출물(H8-2.9, 파일 시각 20:35 — 이 단위 첫 실행 20:47 이전)이며 이 단위에서 다시 쓰지 않았다. 320 `data` 는 baseline 이 아니라 테스트를 보정했다(H8-3.6).

---

## H8-4 (S8-D)

`S8-D` 계정 · 탈퇴 + 미가입 기기 draft 삭제 (2026-11-20, development-agent). `VG8-B-07`(S8-B FIX) · `VG8-C-12`(S8-C → S8-D 전달) 포함. **커밋하지 않았다.**

### H8-4.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-8-plan.md` rev 2.1 — `APPROVED (2026-11-20, user)` (`D8-1`) ✅ |
| Design Spec | `stage-8-design-spec.md` `APPROVED` (`D8-1`) §2.4-③ · §2.5(`VG8-C-12`) · §2.6 · §2.7 · §6.2 · §10.3(`VG8-B-07`) · §10.4 · §10.5 ✅ |
| 선행 | `S8-A`(`C8-10`) · `S8-B` · `S8-C` — Orchestrator 6종 Gate 통과(3,506) ✅ |
| Backend 작업 | 없음. `ls apps/` → `web` 만 · `supabase` 없음 · `apps/mobile` 없음 |

### H8-4.2 구현 — AC 매핑 (판정은 QA)

| AC | 구현 | 증거 |
|---|---|---|
| AC-8-33 | `/settings/account` = `SIGNED IN AS` · 이메일 행(`Me.caregiver.email` — 표시 전용, 버튼 · chevron 0) · `DELETE ACCOUNT` 영향 안내 · *Delete account* 동작 행. 요금제 0. Loading = 이메일 행 Skeleton · 조회 실패 = `ErrorState` | 단위 `stage8-account.test.tsx`(fixture 이메일 교체 → 화면 변경) · e2e · baseline `s8-account` |
| AC-8-34 | ConfirmDialog ③ destructive(초기 포커스 Cancel · 제목/설명 §10.4) → `DELETE /v1/me` 1회 · payload `{confirmation:true}` · IK. 처리 중 Esc · scrim · Cancel 무시 · 연타 1건 · Cancel = 요청 0, 포커스 = 행 | 단위 · e2e 요청 로그 |
| AC-8-35 | 성공 → `performSessionCleanup`(signOut · draft · 카드 캐시 · 로컬 녹음 · `QueryClient.clear`) + `returnPathStore.clear` → `navigate('/auth/welcome', {replace})` → Toast **neutral** *Your account was deleted.* 1회. 뒤로 가기 = Guard 가 welcome 으로(보호 화면 렌더 0). 진행 중 `all_data` 가 있어도 행 활성 → 서버 `DELETION_ALREADY_REQUESTED` = InlineAlert info (`Q8-09` ⓐ) | 단위(localStorage 2키 0 · 녹음 정리 1회 · signOut 1회 · Query 데이터 0 · 복귀 경로 0) · e2e(goBack ×2) · welcome 프레임 비교(아래) |
| AC-8-36 | 실패 → 행 바로 위 `InlineAlert error`(`errorCopyForCode`) · 로컬 보존 · 같은 IK 재시도 / 기기 오프라인 → 요청 0 · `InlineAlert offline` (*You are offline* / *Nothing was sent.*) | 단위 · e2e · baseline `s8-account-failed` · `s8-account-already-requested` |
| AC-8-37 | Trial 안내(C13-11) **바로 아래** TextLink *Remove my answers from this device* (`standalone` — 터치 44) · `/onboarding` 소개 · Step 1(`child-info`) 에만 · draft 응답 있음 + 미인증일 때만 · 안내 닫으면 함께 숨음 · 간격 8(`P-41`) · 시작 정렬. welcome · saved 추가 요소 0 | 단위 6 · e2e(간격 8 · x 정렬 · 높이 ≥44 실측) · baseline `s8-trial-draft-link` |
| AC-8-38 | ConfirmDialog destructive(*Remove* / *Keep*, 이름 = draft first name · 없으면 *your child*) → `OnboardingDraftStore.clear` · 서버 요청 0 · `/onboarding` replace(빈 상태 — 이름 없는 제목 · *Pick up…* 0) · Toast neutral *Removed from this device.* 1회 · Keep = 변화 0, 포커스 = 링크 | 단위 3 · e2e(요청 로그 `[]`) · baseline `s8-trial-draft-dialog` |
| AC-8-39 | 동의 이력 **미구현 확인**: `/settings/privacy` = NotFound · `consents` client 에 `history` 0 · dev scenario 그룹에 `consent` 0 | 단위 |
| `VG8-B-07` | `recording-deletion/copy.ts` `failure.notDeleted(title, date)` · `notSent(title, date)` = §10.3 원문 · `RecordingList` 가 행 `dateLabel` 전달 | 단위 · e2e 기대값(날짜 = *Delete* 접근성 이름에서 읽음) · baseline 재생성 2 |
| `VG8-C-12` | `shared/copy/deletion-status-copy.ts`(원문 1곳 — 두 feature 공유) · `dataManagementCopy.accountProgress/accountFailed` · `DeletionStatusAlert scope` 분기(`account` 실패 = action 0) · `/settings/account` 에 진행 중 `account` 요청이 요약에 보이면 영향 안내 아래 info + 행 `disabled` | 단위 2 |

### H8-4.3 파일

- 신규: `features/account-deletion/{copy.ts,index.ts,account-deletion.css,model/useDeleteAccount.ts,model/useAccountDeletionCleanup.ts,ui/AccountSettings.tsx}` · `features/device-data/{copy.ts,index.ts,ui/DeviceDraftRemoval.tsx}` · `shared/copy/deletion-status-copy.ts` · `apps/web/__tests__/stage8-account.test.tsx`(23) · `e2e/settings-account.spec.ts`(13 기능 + 12 baseline)
- 수정: `pages/settings/AccountPage.tsx` · `pages/onboarding/{OnboardingIntroPage,OnboardingStepPage}.tsx`(조합 — 슬롯에 `DeviceDraftRemoval`) · `features/onboarding-survey/{ui/OnboardingNotices.tsx(TrialNotice footer 슬롯 · .haru-trial-notice 래퍼),ui/OnboardingIntro.tsx,ui/OnboardingWizard.tsx,index.ts,onboarding.css}` · `features/data-management/{copy.ts,ui/DeletionStatusAlert.tsx,ui/DataManagement.tsx}` · `features/recording-deletion/{copy.ts,ui/RecordingList.tsx}` · `styles/index.css` · `app/router.tsx`(주석) · `pages/settings/AccountTopBar.tsx`(주석) · 테스트 `stage8-settings-data.test.tsx` · `e2e/settings-data.spec.ts`
- 신규 Shared UI · 토큰 · 아이콘 · `overflow` **0**. contracts 변경 0 → `API_CONTRACTS.md` 변경 없음.

### H8-4.4 Mock 시나리오 전환

H8-1.5 그대로. 이 단위가 쓰는 것: `?scenario=account:{success|error|offline|loading|deletion-pending-write-blocked}` · 메서드 단위 `account.deleteaccount:*` · 기기 오프라인 = 브라우저 오프라인. 진행 중 `account` 요청 표시는 Mock key 가 없어 단위(API 스텁)로만 재현 — 실제로는 다른 기기 · 정리 실패 경로. 기기 draft = 로컬 주입(e2e `seedChildDraft`).

### H8-4.5 알아 둘 점 (QA)

- **조합 위치**: Spec §3 대로 `DeviceDraftRemoval` 은 `features/device-data` · Trial 안내와의 조합은 page. 안내가 `onboarding-survey` 안에 있어 `TrialNotice` 에 **render-prop 슬롯**(`trialNoticeFooter`)을 열었다 — draft 저장소는 그 feature 가 소유하므로 `{hasAnswers, childFirstName, clear}` 를 슬롯에 넘긴다.
- **노출 화면 = `/onboarding` · Step 1 만** (Spec §2.7 · AC-8-37 문언). `/onboarding/start`(프로필 소개 `243:1147`)에도 같은 Trial 안내가 있으나 Spec 대상에 없어 **넣지 않았다** → H8-4.7 N1.
- **draft 있음 판정** = 응답이 하나라도 있는 draft(`hasAnyAnswers` — Guard 의 "중도 복귀" 정의와 같음). Step 1 에서 입력하면 링크가 나타난다.
- **간격 8** 은 박스 간격(e2e 실측 8). `standalone` TextLink 는 터치 44 를 세로 padding 12 로 만들므로 **글자 상단은 안내 하단에서 약 20px** 아래다 (baseline 육안).
- **탈퇴 후 welcome 불변**: `s8-welcome-frame` 하나를 두 테스트(직접 연 welcome · 탈퇴 후 Toast 숨김 welcome)가 같이 비교 — 둘 다 통과 = diff 0 (`FRAME_SNAPSHOT` 임계값).
- 이메일은 화면 행에만 쓴다 — Toast · 로그 문구 0, e2e console 수집에 이메일 0.

### H8-4.6 기존 baseline 변경 (원인 분해 — `R-BASELINE-1` ⑤, 3장)

| baseline | 크기 (전 → 후) | 변경 클러스터 | 원인 |
|---|---|---|---|
| `settings-data.spec.ts/s8-recordings-delete-failed-393` | 345×1316 = | 알림 설명 영역 + 그 아래 전부 | `VG8-B-07` 문구 2→3줄(+18). 알림 위(y 0~95) Δ 0 · 알림 아래 **18px 아래로 옮겨 비교 시 Δ≤1** (배경 그래디언트) |
| `settings-data.spec.ts/s8-recordings-delete-failed-320` | 272×1316 = | 같음 | 문구 2→4줄(+36). 위 Δ 0 · 아래 36px 이동 비교 Δ≤2 |
| `visual.spec.ts/s2-onboarding-childinfo-trial` | 345×1131 → 345×1183 | Trial 안내 아래부터 전부 | draft 가 심어진 Trial 화면이라 **기기 draft 삭제 TextLink 가 새로 나타남**(+52 = 간격 8 + 링크 44). 안내까지(y 0~240) Δ 0 · 아래 52px 이동 비교 시 Δ≤4 가 99.7%(배경 그래디언트) · Δ>10 은 뷰포트 하단 클립선(y≈852)에 걸린 *Reading routine* 행뿐 |

설명되지 않는 클러스터 0 → 3장만 `--update-snapshots=all -g` 로 재생성. 그 외 기존 baseline 재작성 0 (`s6-settings` · `s3-dialog-scrim` 은 S8-B 산출물).

### H8-4.7 NEEDS_DECISION / 보고 (최우선 규칙 2·3)

| # | 지점 | 현재 구현 | 결정 요청 |
|---|---|---|---|
| `H8-4-N1` | `/onboarding/start` 도 Trial 안내가 있는데 Spec §2.7 · AC-8-37 은 `/onboarding` · Step 1 만 지정 | 넣지 않음 | design-agent — 포함 여부 |
| `H8-4-N2` | 계정 화면 실패 · 오프라인 문구 — Spec §10.4 원문 없음 | 실패 = `errorCopyForCode` 제목 + 설명 · 오프라인 = `networkErrorCopy` 제목 + *Nothing was sent.*(§10.2 패턴). `VG8-C-05`(전체 삭제 실패 *Nothing was deleted…*)와 같은 축으로 바꿀지 | design-agent |
| `H8-4-N3` | *Your data is already being deleted…* 는 한 문장 — `InlineAlert` 는 `title` 필수 | 전체를 `title` 로(설명 0) | design-agent 확인 |
| `H8-4-N4` | 계정 화면 Loading 은 이메일 섹션 Skeleton 만(삭제 섹션은 `me` 확정 후 렌더 — 이름이 문구에 들어감) | Spec §2.9 "이메일 행 Skeleton text 1" | 확인 |

### H8-4.8 BACKEND_INTEGRATION_PENDING 예상

`P8-BIP-03` 탈퇴(계정 + 전체 데이터 · 토큰 폐기 · auth user 삭제 · 가명화) · `P8-BIP-09` 실제 로그인 이메일 · `P8-BIP-07` 진행 중 `DELETION_ALREADY_REQUESTED`. 화면 · Contract 호출 · Mock · 로컬 정리 · 기기 draft 삭제(서버 0)는 Frontend 판정 대상.

### H8-4.9 검증 (2026-11-20)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm lint:boundaries` | 0 (`no dependency violations found` — 1106 modules) |
| `pnpm build` | 0 |
| `pnpm test` | 0 — **236 files / 3,529 tests** (이전 235 / 3,506 → `stage8-account` +23) |
| `pnpm format:check` | 0 |
| `pnpm test:e2e` (단독) | 963 passed · **3 failed = H8-4.6 의 3 baseline**(원인 설명됨) → 재생성 후 해당 + 신규 baseline `--repeat-each=2` 재실행 결과 아래 |
| 재생성 후 baseline 재실행 | `settings-data` · `visual` · `settings-account` 의 baseline · welcome · draft 테스트 `--repeat-each=2` → **242 passed** (5.9m, 실패 0 — 결정성) |

신규 baseline 13장 (`e2e/__screenshots__/darwin/settings-account.spec.ts/`): `s8-account` · `s8-account-dialog` · `s8-account-failed` · `s8-account-already-requested` · `s8-trial-draft-link` · `s8-trial-draft-dialog` (393 · 320 각 1) + `s8-welcome-frame`(393 전체 프레임 — 두 테스트 공용). 전부 dev 패널 숨김 · settle · 포인터 치움 · 포커스 해제 후.

---

## H8-5 (S8-F)

`S8-F` 앱 공통 정리 + `D8-2` ①②③ + 디자인 FIX (2026-11-21, development-agent). **커밋하지 않았다.**

### H8-5.1 Gate

| Gate | 결과 |
|---|---|
| Plan | rev 2.2 — `APPROVED (D8-1)` · `D8-2` (2026-11-21, user) ✅ |
| Design Spec | `APPROVED (D8-1)` · 개정 이력 `D8-2` ①~④ · §2.5 · §2.7 · §6.3 · §8.1 · §10.2 · §10.4 · §11 ✅ |
| 선행 | `S8-D` — Orchestrator 6-gate(3,529) · e2e 단독 966 ✅ |
| Backend 작업 | 없음. `ls apps/` = `web` · `supabase` 없음 · `apps/mobile` 없음 |

### H8-5.2 구현 — AC 매핑 (판정은 QA)

| 항목 | 구현 | 증거 |
|---|---|---|
| **N8-31 ⓐ** AC-8-97 | 기기 표시 `shared/lib/data-deletion-marker.ts` — 키 1개 `haru.data-deletion.pending.v1` = `{requestId, scope:'all_data', savedAt}` (zod 검증 · PII 0 · 저장소 실패 시 메모리). 쓰는 때 = `POST` 성공 · `/settings/data` 요약에 진행 중 `all_data`(이미 요청됨 후 재조회 · 다른 기기 요청 포함). 지우는 때 = 정리 **성공 후** · `failed` · `RESOURCE_NOT_FOUND`/`FORBIDDEN` · 로그아웃 · 탈퇴(`performSessionCleanup` 에 `clearDataDeletionMarker` dep 추가 — 전체 삭제 정리는 no-op). `scope='account'` 표시 0 | 단위 `stage8-cleanup.test.tsx` · `session-cleanup.test.ts` · e2e `stage8-cleanup.spec.ts`(localStorage 3필드 · 이름/이메일/경로 0) |
| **N8-31 ⓐ** AC-8-98 | 감시자 1곳 `app/providers/DataDeletionWatcher.tsx` (AppProviders — Toast · 녹음 환경 안, Router · Guard 밖) → `features/data-management/model/useDataDeletionWatch.ts`: 인증 시 표시 id 를 `useDeletionRequest(id)`(poll)로 조회 · `completed` → `useDataDeletionCleanup` → 표시 삭제 → Toast success *Your data was deleted.* 1회 · 정리 실패 = 표시 유지 · Toast 0 · Guard 대기 해제. `visibilitychange` visible = 1회 조회(상한 후 포함). Guard 대기 = `app/providers/dataDeletionHold.ts` → `useGuardDecision` 이 `PENDING_DECISION`(기존 Spinner, 새 UI 0) — **앱 시작 때 있던 표시**의 첫 조회 전 + `completed` 정리 중에만. `DataManagement.tsx` 의 정리 `useEffect` · `cleanup` prop 삭제 — 화면은 표시만, `all_data` 요청은 같은 key 를 **observe**(조회 0), `account` 만 화면이 폴링 → 요청 중복 0 | 단위: 앱 재시작 완료(정리 1회 · draft/카드/표시 0 · resume 경로 방문 0 · 조회 1) · **가짜 타이머 상한 경로**(60회 정지 → +5 interval 0 → 복귀 1회 조회로 완료 → 정리 · Toast) · 정리 실패 · NOT_FOUND. 기존 `stage8-delete-all` 완료 테스트(조회 3 · 정리 1 · Toast 1) 그대로 통과 · e2e 화면 밖 완료 1 |
| AC-8-99 | Mock key `data-management:deletion-completed-offscreen` — 서버: seed 요청 이미 `completed`(완료 효과 적용) · 요약 진행 0 · `me` 온보딩 전(번들 생성 시 즉시 seed). 기기: `mocks/data-management/dataDeletionMarkerSeed.ts` 가 브라우저 조립 지점에서 표시를 **동기** 주입(카드 캐시 seed 와 같은 구조) | 단위(key 단독 = 정리 0 · 요청 parse `completed`) · `scenario-selection.test.ts` 카탈로그 · `API_CONTRACTS` Rev 12.3 §5.4 등재 · 기존 `deletion-processing`·`failed` 테스트 불변 |
| AC-8-40 `VG6-D-12` | `shared/config/routes.ts` `BACK_PARENT_ROUTES` + `logicalParentPath` (Spec §6.3 표 그대로) · `shared/hooks/useBackNavigation.ts`(기록 있음 = `navigate(-steps)` · 없음 = 부모 replace). 적용: TopBar 11곳(Settings · Profile · SurveyUpdate · GrowthCapability · AddOwnBook · GiftRequests · Auth · ReportDetail · Data · RecordingList · Account) · 아이 정보 Back/이탈(`backRequest` · `useLeaveGuard` — 확인 Dialog 뒤 순서 유지) · 발전 역량 설정 저장 후 이동. 시각 변화 0 | 단위 16 경로 표 + hook 2 · e2e 직접 진입 7 route × Back = 부모 + `goBack` 루프 0 · 기록 있음 = 이전 화면 · 미인증 `/auth/sign-up` → welcome |
| AC-8-41 `VG6-H-09` A | `--child-routine-label-offset` → **`--section-label-offset`** 7 (이름만 승격 — 토큰 수 불변 324) · `shared/styles/section.css` `.haru-section`: 라벨 ↔ 첫 내용 10 · 앞 형제가 있는 섹션만 라벨 위 7 · 내용 사이 간격은 그대로(`--section-content-gap` 8). 적용: Step 1 ABOUT YOU · AT HOME · 설정 아이 정보 2 · SettingsMenu 2 · 데이터 관리 2(+Skeleton) · 계정 2(+Skeleton) | e2e 실측: 모든 섹션 글자 중심 → 내용 **18** · 앞 내용 → 글자 중심 = 섹션 gap + 15 → Step 1 · 아이 정보 **35** (53) · 설정 계열(gap 16) **31** (49) |
| `VG6-H-09` **ⓑ-1 → ⓑ-2** | Step 1 `YOUR CHILD` 편집 아이콘 헤더 — ⓑ-1 구현 후 실측: 라벨 중심 → 카드 18 이지만 아이콘 hit(44) 아래 끝 334 > 카드 위 330 = **4px 침범**(393 Trial, 박스도 1px) → Spec §11.1 대로 **ⓑ-2(현행 유지)** 로 되돌림 | 임시 probe 측정값(삭제) · e2e 가 헤더 행이 recipe 밖임을 단정 |
| AC-8-42 `VG6-H-06` | `COMPONENT_MAP.md` Text 행에 `tracking` prop · 조건 3 등재 (코드 변경 0) | 문서 |
| AC-8-44 B.2 | ① `D8-2` ④ 현행 유지 — 변경 0 · ② `N8-26` 검증만 | — |
| AC-8-45 `N8-26` | 코드 변경 0. Google 가입 → `POST /v1/consents` `source = signup_oauth` 요청 로그 단위 추가 | `consent-screens.test.tsx` |
| `D8-2` ② `metaWrap` | `packages/ui` `ListRow` opt-in `metaWrap`(기본 off — off 면 DOM · class · CSS 0) · `.haru-list-row__meta-row--wrap` (wrap · row-gap 0 · subtitle `0 1 auto` · meta nowrap) · `RecordingList` 만 사용 | 단위 3(off class 불변 · on · meta 없음) · e2e 320/393 8행 실측(subtitle 1줄 · meta 1줄 · 나뉘면 시작 정렬 · 아니면 우측) · **기존 사용처 baseline diff 0**(Library 등 전 e2e 통과 — 재생성 0) |
| `D8-2` ③ `VG8-D-07` | `OnboardingStartPage` 에 Step 1 과 같은 `trialNoticeFooter` 조합 | 단위 2 · baseline 신규 2 |
| `VG8-C-05` | 전체 삭제 요청 실패 설명 *Nothing was deleted. You can try again.* | 단위 |
| `VG8-C-08` | `deletionPendingToastMessage` — Toast = 차단 설명만: `StartSessionAction` · `ReflectionCard` · 서재 저장 | 단위 |
| `VG8-C-09` ① | `useToggleLibrarySave(onError(code))` → `BookDetailSheet` Toast | `library-sheets.test.tsx` (`account:deletion-pending-write-blocked`) |
| `VG8-C-09` ② | PDF: `POST` 거절이 `ACCOUNT_DELETION_PENDING` 일 때만 로컬 job `failed.blocked` → 기존 InlineAlert 에 제목+설명. **contract 변경 0** | 단위 reducer |
| `VG8-D-03` · `D-04` | 탈퇴 실패 설명 *Nothing was deleted…* · 이미 요청 = 제목 *Your data is already being deleted* + 설명 | 단위 · e2e |

### H8-5.3 파일

- 신규: `shared/lib/data-deletion-marker.ts` · `features/data-management/model/useDataDeletionWatch.ts` · `app/providers/{DataDeletionWatcher.tsx,dataDeletionHold.ts}` · `mocks/data-management/dataDeletionMarkerSeed.ts` · `shared/hooks/useBackNavigation.ts` · `shared/styles/section.css` · `__tests__/stage8-cleanup.test.tsx` · `e2e/stage8-cleanup.spec.ts`
- 수정(주요): `features/data-management/{ui/DataManagement.tsx,copy.ts,index.ts,model/useDataDeletionCleanup.ts,data-management.css}` · `entities/data-management/{useDeletionRequest.ts(mode · refetch),deletionPolling.ts(P-42 주석),index.ts}` · `shared/lib/session-cleanup.ts` · `features/settings/model/useSignOut.ts` · `features/account-deletion/{copy.ts,ui/AccountSettings.tsx,model/useAccountDeletionCleanup.ts}` · `app/{providers/AppProviders.tsx,providers/index.ts,guards/useGuardDecision.ts}` · `shared/config/routes.ts` · TopBar 11 · `features/child-profile-edit/model/{backRequest,useLeaveGuard}.ts` · `features/growth-capability/ui/GrowthCapabilityPicker.tsx` · 섹션 5화면 · `features/{library/{StartSessionAction,BookDetailSheet}.tsx,reflection/ui/ReflectionCard.tsx,report-pdf/{model/*,ui/ReportPdfAction.tsx},recording-deletion/ui/RecordingList.tsx}` · `entities/library/useToggleLibrarySave.ts` · `shared/copy/error-copy.ts` · `pages/onboarding/OnboardingStartPage.tsx` · `mocks/{index.ts,data-management/*}` · `packages/ui/src/list/{ListRow.tsx,List.css}` · `packages/design-tokens/src/component/index.css` · 문서 `API_CONTRACTS.md`(Rev 12.3) · `COMPONENT_MAP.md`
- 테스트 수정: `growth-capability.test.tsx`(저장 후 뒤로 = 앱 안 기록 있음을 `history.state.idx` 로 모델 — MemoryRouter 는 window history 를 쓰지 않는다. 기록 없음 경로는 새 테스트가 본다) · e2e `visual.spec.ts` `s2-onboarding-childinfo`(가입 클릭 포인터 치움 + settle — 아래)
- 신규 Shared UI 컴포넌트 · 아이콘 0 · 토큰 0(이름 변경 1) · `overflow` 0

### H8-5.4 Mock 시나리오 전환

`?scenario=data-management:deletion-completed-offscreen` (로그인 전 URL — 표시는 앱 시작 때 주입, 로그인하면 감시자가 정리 → `/onboarding/start` + Toast). 상한 경로는 단위(가짜 타이머)만.

### H8-5.5 기존 baseline 변경 — 원인 분해 (`R-BASELINE-1` ⑤, 행 정렬 분해 · 설명 안 되는 클러스터 0)

| baseline | 분해 (행 오프셋 구간) | 원인 |
|---|---|---|
| `s6-settings` · `s8-settings-{393,320}` · `s8-data-{393,320}` · `s8-data-deletion-offline-*` · `s8-account-{393,320}` · `s8-data-loading-*` | +2 → +9 → +11, 잔여 0 | 첫 섹션 라벨 ↔ 내용 8→10(+2) · 둘째 섹션 라벨 위 7 · 8→10 |
| `s8-data-deletion-{processing,failed}-*` | +7 → +9 → +16 → +18 | 알림 뒤 첫 섹션도 앞 형제가 있어 +7 (recipe 규칙) |
| `s6-settings-child` · `-save-failed` | +2 → +9 → +7, 하단 CTA 0 | YOUR CHILD 8→10 · AT HOME +7 · 12→10. Spec 추정 +5 와 다름(아래 N2) |
| `s2-onboarding-childinfo{,-trial,-edit}` | +7 → +9 → +16 → +14 (높이 +14) | ABOUT YOU +7 · +2 · AT HOME +7 · −2 (Spec "+14" 와 일치) |
| `s8-recordings-{all,deleted-row,delete-failed}-*` · `s8-recordings-dialog-320` | 행마다 meta 줄 띠만 잔여 | `metaWrap` — subtitle 3줄 분절 → 1줄 + meta 다음 줄 (320 −12 · 393 *Not uploaded yet* 행만) · dialog 는 뒤 목록 가장자리 |
| `s8-account-failed-*` · `-already-requested-*` | +11 + 알림 띠 | `VG8-D-03` 설명 교체 · `VG8-D-04` 제목/설명 분리 |
| `s3-dialog-scrim` · `s8-trial-draft-dialog-*` | Dialog 자체 오프셋 0 · 가장자리 띠 | 뒤 화면(설정 목록 · Step 1) 이동이 scrim/가장자리로 보임 |

- 첫 실행 `s2-onboarding-childinfo` 에 **설명 안 되는 띠**(y 749–792)가 있어 멈추고 확인: 행이 14px 내려가 **가입 클릭 위치 포인터 아래 독서 루틴 행 hover** 가 찍혔다 → 테스트에 `mouse.move(0,0)` + `settle` 추가 후 재분해 잔여 0.
- 같은 이유로 첫 recipe 는 `YOUR CHILD` 필드 묶음(fragment) 사이 간격까지 바꿔 +2·+4·+6·+8 계단이 나왔다 → `--section-content-gap` 으로 내용 간격 보존 후 재분해.
- 재생성: 4 spec `--update-snapshots=all` → 백업 대비 바뀐 파일 = 위 34장 + 신규 2(`s8-trial-start-draft-link-{393,320}`) **정확히 일치**, 그 밖 0.

### H8-5.6 NEEDS_DECISION / 보고 (최우선 규칙 2·3·4)

| # | 지점 | 현재 | 요청 |
|---|---|---|---|
| `H8-5-N1` | `VG6-H-09` A 범위 중 **가입(`179:1733`·`1739`) · 프로필(`319:*`)** — Spec 이 "적용 전 Figma 행 기하 실측" 을 요구하나 이 세션에 Figma 도구 없음 | 미적용(리포트 상세 · 지난 리포트 섹션 라벨도 미적용) | design-agent 실측 후 적용 여부 |
| `H8-5-N2` | 섹션 간격 16 화면(SettingsMenu · 데이터 관리 · 계정)은 같은 recipe 로 **31 / 49** (Figma 리듬 35/53 은 섹션 gap 20 전제). 설정 아이 정보 높이 +7(Spec 추정 +5 — 첫 섹션 8→10 포함) | recipe 만 적용, 섹션 gap 16 유지(Spec §2.0) | design-agent Visual Gap |
| `H8-5-N3` | `VG6-H-09` ⓑ-1 실측 실패 → ⓑ-2. Step 1 `YOUR CHILD` 아이콘 헤더 Δ+13 은 **허용 차이 후보**(사용자 등록 전) | 현행 | 사용자 등록 여부 |
| `H8-5-N4` | `VG8-C-09` ① 의 홈 `ActivityCardDeck` 저장 Toast — `useToggleSavedBook`(Home) 은 Stage 3 "수정 금지" 결정 hook 이라 손대지 않음 | 일반 *saveFailed* | 사용자/plan-agent |
| `H8-5-N5` | 아이 정보 이탈 sentinel 이 있는데 앱 안 기록이 없으면 부모 replace 가 sentinel 항목을 바꾼다 — 그 아래 원래 항목이 남아 브라우저 뒤로 1회가 아이 정보로 돌아갈 수 있음 | 수용(확인 Dialog 순서 우선) | QA 확인 |
| `H8-5-N6` | 다른 기기(표시 없음) 잔여 = R8-15 한계 (`D8-2` ① 수용) — Handoff 기록 대상 | — | `S8-J` |

### H8-5.7 BACKEND_INTEGRATION_PENDING 예상

AC-8-98 서버 시간 기반 실제 완료 · 다른 기기 정리 신호(서버 측 삭제 완료 이력 — contract 변경 필요 시 사용자 승인) · AC-8-45 서버 동의 기록 저장.

### H8-5.8 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `lint` · `lint:boundaries`(1113 modules) · `build` · `test` · `format:check` (이 순서) | 전부 0 — **237 files / 3,570 tests** (이전 236 / 3,529) |
| `pnpm test:e2e` 1차 (단독) | 946 passed · 36 failed = 전부 baseline(34 변경 + 2 신규) — 기능 실패 0 |
| 재생성 후 `pnpm test:e2e` (단독, 전체) | **982 passed · 0 failed** (23.8m — 이전 966 + 신규 16: `stage8-cleanup` 12 · metaWrap 2 · baseline 2) |

---

## H8-6 (S8-G)

`S8-G` 접근성 감사 · 수정 (2026-11-21, development-agent). **커밋하지 않았다.**

### H8-6.1 Gate

| Gate | 결과 |
|---|---|
| Plan | rev 2.2 — `APPROVED (D8-1)` · `D8-2` ✅ (`S8-G` = §12 행 · 부록 B.2-③④) |
| Design Spec | `APPROVED (D8-1)` · §8.2 · §9.4 (감사 기준) ✅ |
| 선행 | `S8-F` — H8-5.8 (6-gate 3,570 · e2e 단독 982) ✅ |
| 신규 dev 의존 | `@axe-core/playwright ~4.14.0` (root devDependency — `N8-18` · `Q8-18` 승인). 기존 peer 경고(`eslint-plugin-jsx-a11y` ↔ eslint 10)는 이 단위와 무관 |
| Backend 작업 | 없음. `ls apps/` = `web` · `supabase` 없음 · `apps/mobile` 없음 |

### H8-6.2 감사 도구 · 범위

| 파일 | 내용 |
|---|---|
| `e2e/support/a11y-stops.ts` | Plan §12.4 route × 대표 상태 **49 정류장** (인증 7 · 온보딩 13(+시트 1 · draft 링크/Dialog 2) · Home/서재/Progress 9(+시트 3) · 세션 7(+Prompts 팝업) · 설정 12(+Dialog 4) · 404). 시트 · Dialog 는 부모 route 에서 열린 상태 |
| `e2e/support/a11y.ts` | 측정 한 곳: `runAxe`(tags `wcag2a/2aa/21a/21aa/22aa` · dev 패널 제외 · `color-contrast` **끄지 않음** · 모달 뒤 노드 제외) · `measureRendered`(axe 가 배경을 못 정한 노드 → 글자 투명화 후 Range bbox 배경 **중앙값** + 알파 합성) · `measureTargets`(`elementFromPoint` 중심선 1px 훑기 · label/TextField 행 = 누르는 상자 · 뷰포트 가장자리 잘림 표시) · `focusTour`(정/역방향 · outline 자신/의사요소/위임(`:has` 행 · 스냅 카드) · 5점 가려짐 · 모달 이탈) · `layoutIssues`(clip/말줄임 · 흐름 안 형제 bbox 교차 · 중심 hit) · `runningAnimations` |
| `e2e/a11y-audit.spec.ts` | 정류장마다 ① axe serious/critical ② 대비 장부 매핑 ③ reduced-motion ④ 44 타깃 ⑤ Tab 정/역 순회 ⑥ Text spacing · root 200% · 196×426(줌 200% 등가) — **기본 상태 대비 새로 생긴** 잘림 · 겹침 · 기능 손실 · 가로 넘침. 측정표는 테스트 attachment(`contrast.json` · `targets-below-44.json` · `text-resize.json`) |
| `e2e/a11y-keyboard.spec.ts` | AC-8-43 시간 목록 focus 3 · AC-8-48 Dialog/Sheet 8종(열림 focus · `aria-modal` · 배경 scrim · Tab/Shift+Tab 20회 이탈 0 · Esc · 트리거 복귀) · AC-8-47 키보드 전용 흐름 3(로그인→세션 제출 · 설정→녹음 삭제 Dialog · Trial 아이 정보 선택 시트) · AC-8-50 live 계수 2(녹음 삭제 · 전체 삭제 진행/완료) |

### H8-6.3 발견 → 수정 (판정은 QA)

| # | 발견 (감사 실측) | 원인 | 수정 | 증거 |
|---|---|---|---|---|
| F1 | **AC-8-43 `S4B-F1-OPEN` ④** — 시간 목록을 열면 focus 가 body | 두 뷰가 같은 `Sheet` 의 내용만 바꿔 trap 이 다시 돌지 않음 — 누른 트리거가 사라짐 | `ReadingContextSheet` — 뷰 전환 뒤 focus 대상(`useId` 의 `id` → IconButton · SelectTrigger 의 기존 `id` prop): 열면 `Back`, Back/선택 후 = 트리거 | 단위 `reading-context-sheet.test.tsx` 2 · e2e `a11y-keyboard` 3 |
| F2 | **2.1.1** — 시간 목록 · 선택 시트(연도 · 월 · 성별 · 관계 등 `SelectTrigger` 전부)에서 **화살표 1회에 시트가 닫혀** 키보드로는 이웃 한 칸만 고를 수 있음 | native radio 는 화살표 = 그 자리 change → 포인터와 같은 `onChange` 로 즉시 닫힘 | 화살표 = 고르기만(목록 유지) · **Enter · (선택된 칸의) Space = 확정**. `packages/ui` 내부 hook `hooks/useRadioListKeyboard.ts`(export 안 함 — 공개 API 변화 0)를 `SelectTrigger` 가 사용, `ReadingContextSheet` 는 같은 규칙을 뷰 전환과 함께 구현. 포인터 동작 변화 0 | 단위 `SelectTrigger.test.tsx` +3 · `reading-context-sheet` 1 · e2e 2 |
| F3 | **AC-8-48** — 연도 선택 시트에서 Tab 1회에 focus 가 body, Shift+Tab 으로 **배경 `Next`** 로 빠짐 | `useFocusTrap` 이 radio 묶음 전체를 정지점으로 세어 "마지막" 판정이 실제 Tab 순서와 어긋남 | `useFocusTrap` — 같은 `name` radio 묶음 = 정지점 1개(선택된 것, 없으면 첫 번째)로 wrap 판정. Dialog · Sheet · SelectTrigger · SwipeDeck 공통 | 단위 `Sheet.test.tsx` +2 · e2e 감사 역방향 순회 · `a11y-keyboard` AC-8-48 8종 |
| F4 | **2.4.11** — Library 에서 Tab 으로 간 *See all* 이 탭바 밑(y 776–792 ⊂ 766–836)에 **완전히 가려짐** | 브라우저 focus 스크롤은 뷰포트 가장자리까지만 — sticky 탭바 · TopBar 가 그 가장자리를 덮음 | `app-shell.css` — `[data-app-shell-viewport]:has(.haru-app-shell__bar-bottom)` `scroll-padding-block-end` = safe + overhang + 바 + 간격(토큰 합 121) · `:has(.haru-app-shell__bar-top)` `scroll-padding-block-start` = safe + `--topbar-height`. **정지 레이아웃 · 픽셀 변화 0**(스크롤 정렬 기준선만) | e2e 감사 49 정류장 정/역 순회 가려짐 0 |

### H8-6.4 감사 결과 요약 (49 정류장 — 수정 후)

| 축 | 결과 |
|---|---|
| axe serious/critical (`color-contrast` 제외) | **3건 — 전부 `label-content-name-mismatch`(2.5.3)**, 결정 대기 `H8-6-N1`·`N2` (아래). 그 밖 0. moderate `meta-viewport` 49 = `maximum-scale=1` — 기존 결정 `D5-13` · 허용 차이 `AD-S5-2`(iOS 는 핀치 확대 유지) |
| 대비 (AC-8-54) | axe 위반 212 노드 + 렌더 픽셀 221 노드 측정(그중 미달만 장부 대조). **미매핑 0 · 결정 대기 1(`H8-6-N3`)** — 아래 표 |
| 터치 44 (AC-8-51) | 승인 예외: `S1-G-2` TextField 행 42 · `P-29` 별 38×44 · `D5-6`/`D6-9` 칩 중간선 분할(41~43) · 본문 안 링크(`haru-auth-inline-prompt` · 약관 링크 — Stage 2 Spec §4.6 default 변형). **미승인 → 결정 대기 `H8-6-N4`**. 뷰포트 위 가장자리에 닿은 TopBar 버튼 hit(44×42)은 가장자리 잘림으로 표시 · 판정 제외 |
| 키보드 · focus (AC-8-47) | 정/역방향 순회: focus 표시 없음 0 · 완전히 가려짐 0(F4 후) · 모달 이탈 0(F3 후) |
| Dialog · Sheet (AC-8-48) | 8종 전부 통과(F1·F3 후). "배경 inert" = `aria-modal="true"` + focus trap + scrim 이 포인터를 받음 — **`inert` 속성 자체는 쓰지 않는다**(기존 구현 · Spec §9.1 "기존") |
| live 1회 (AC-8-50) | 녹음 삭제 *Recording deleted.* 1회 · 전체 삭제 진행 문구 · 완료 Toast *Your data was deleted.* 각 1회, 중복 0. 분석 상태 · PDF ready 는 기존 단위 테스트(Stage 5 · 7) 범위 — 이 단위에서 e2e 추가 안 함 |
| reduced-motion (AC-8-53) | 49 정류장 진행 중 애니메이션 0 (Spinner 예외 해당 없음) |
| Text spacing (AC-8-96) | 새 잘림(hard clip) 0 · 겹침 0 · 기능 손실 0 · 가로 넘침 0. **Figma 줄 수 제한 말줄임이 새로 생김 38건** → `H8-6-N5` |
| 200% (AC-8-52) | ① root `font-size: 200%` — 새 문제 0. 단 **타입 토큰이 px** 라 글자 크기가 실제로 바뀌지 않는다(측정 무효에 가까움 — 기록) ② 196×426(줌 200% 등가) — hard clip 0 · 겹침 0 · 가로 넘침 0 · 말줄임 새로 117건(`H8-6-N5`) · **기능 손실 2(Activity Card 뒤집기 버튼 중심이 카드 면에 덮임)** → `H8-6-N6` |

대비 측정표 (장부별, 49 정류장 합산 — axe + 렌더 픽셀 미달 노드):

| 장부 | 노드 | 대비 범위 | 비고 |
|---|---|---|---|
| `D-01` 수용 예외 | 35 | 2.05–2.07 | accent 위 흰 라벨 (버튼 · 선택 카드 · 선택 radio) |
| `P-01` | 161 | 1.94–3.28 | ink-500 보조 텍스트 (Dialog 설명 3.01–3.04 포함 · 세션 paused `P-26`/`P-27` 같은 색) |
| `P-02` | 14 | 1.56–4.14 | 배지(Tag) 글자 — 역량 4색 · neutral |
| `P-11` | 10 | 4.17–4.18 | glass/tinted 위 text-button (PromptPill · 저장) |
| `P-23` | 30 | 1.72 | Prompt 단계 · 페이지 배지 |
| `P-24` | 29 | 1.80–2.34 | ink-400 3차 텍스트 (서재) |
| `P-25` | 3 | 2.21 | 세션 Discard |
| `P-35` | 18 | 1.81–2.34 | Progress 막대 값 · 요일 · ink-400/300 |
| `P-37` | 6 | 2.26–2.32 | Moment / 인용 eyebrow |
| **`H8-6-N3`** | 1 | 4.02 | 결정 대기 (아래) |

### H8-6.5 `VG8-B-12` Dialog 배경 blur — 감사 결과 (코드 변경 0)

- 근거 상태: Dialog 는 Stage 1 Spec §4.22 **Figma 없음 → 명세**(`surface-strong` white 90% 단색). `321:2203` 의 `HARU/Glass Rest` 는 design-agent DRAFT(디자이너 근거 아님 — `VG8-B-12`). 최우선 규칙 2 에 따라 **blur 를 추가하지 않았다.**
- 렌더 픽셀 실측(Dialog 5종 · scrim 위): 제목 ink-700 **6.23–6.30** · 확인/취소 라벨 **4.92–4.96** · 설명 ink-500 **3.01–3.04**(= `P-01`, Dialog 밖 같은 색과 같은 장부). 배경 비침으로 **새로 생긴 미달 0** — 가독 결함 근거 없음.
- → 닫음 제안: `VG8-B-12` = 감사 완료, 변경 불필요. blur 를 원하면 디자이너 Figma 근거 + 사용자 승인 필요.

### H8-6.6 NEEDS_DECISION / 보고 (최우선 규칙 2·3 — 임의 처리하지 않은 지점)

e2e 감사는 아래 항목을 **결정 대기 목록으로 명시**해 통과시킨다(`AXE_PENDING` · `contrastPending` · `targetPending` · `ZOOM_UNCLICKABLE_PENDING`). **수용이 아니다** — 결정 전까지 해당 AC 는 QA 판정 대상이다.

| # | 지점 | 현재 (승인 근거) | 선택지 · 권고 |
|---|---|---|---|
| `H8-6-N1` | `/progress` 리포트 카드 링크 — 이름 *Open 4-week report, {range}* 가 보이는 제목 *4-week full report* + 설명을 포함하지 않음 (2.5.3 · axe serious) | Stage 7 Spec `N7-37` 이 이름을 정함 | ⓐ `aria-label` 제거 → 이름 = 보이는 내용(제목+설명, 길다) **권고** ⓑ 현행 유지(예외 수용). ⓐ 는 Spec 변경 + 테스트 3곳(`progress-overview` · `report-pdf` · e2e 2) 이름 갱신 |
| `H8-6-N2` | 세션 녹음 버튼 — 보이는 캡션 *Tap to recording*(Figma `140:2854`) ↔ 이름 *Start recording* (2.5.3) | Stage 4 Spec 이름 | ⓐ 이름에 캡션 포함(예: *Start recording, Tap to recording*) — 부분 일치 쿼리는 그대로 통과 ⓑ 현행 유지(캡션 `aria-hidden`). 음성 제어 사용자는 *Tap to recording* 으로 누를 수 없다 |
| `H8-6-N3` | 로그인 하단 *Create an account*(ink-700) — 앱 배경 그래디언트 아래 끝 위 **4.02:1** (4.5 미달, 기존 장부 없음) | Figma 색 · 그래디언트 그대로 | 신규 가값 번호(design-agent 배정) 등재 or 디자이너 확인. 화면 높이에 따라 값이 바뀐다(852 기준) |
| `H8-6-N4` | 44 미만 · 승인 결정 없음: consent *View* 링크 57×22 (5개) · 아이 정보 편집 *Done* 41×22 · 녹음 목록 *Show more* 86×22 · 회고 입력칸 높이 40(Figma `91:715` · `T5-10`) | 단독 줄/행 안 링크인데 `TextLink default`(본문 안 변형) 사용 | ⓐ `TextLink standalone` 또는 `subtle` 의 `::before` 44 확장처럼 **hit 만** 넓히는 방식(시각 변화 0 가능 — 겹침 확인 필요) ⓑ 예외 등록. 입력칸 40 은 Figma 값 — 예외 등록 여부 |
| `H8-6-N5` | **Figma 줄 수 제한(말줄임)** 이 Text spacing 에서 38건 · 196 폭에서 117건 새로 생김 (Prompt 2줄 · 책 제목 · 목록 제목 · 역량 캡션 등). Spec §8.2 기준("clip/truncate 요소 잘림 0")으로는 미달 | Figma 줄 수 그대로 (전체 문구는 접근성 이름 · 상세 화면에 있음) | ⓐ 허용 차이 등록(설계된 말줄임 — 전체 텍스트 다른 경로 제공) ⓑ 텍스트 확대 시 줄 수 제한 해제(디자인 변경 — 디자이너). design-agent 판정 필요 |
| `H8-6-N6` | 196×426 에서 Activity Card 뒤집기 버튼(2개 카드) 중심을 카드 면이 덮음 → 그 점을 누르면 버튼이 아니라 면이 받음 | 393 이상에서는 정상 | design-agent 가 196 폭(줌 200% 등가)을 감사 대상으로 유지할지 + 원인 분석 후 수정 범위 결정. 이 단위에서 미수정 |
| `H8-6-N7` | Plan 부록 B.2-④ 문구 *"P-18·20·22·23 은 등재됨"* 은 사실과 다르다 — 등재된 것은 `P-23` 뿐(`P-20` 확정 · `P-18`·`P-22` 미등재) | 이번 단위는 지시대로 `P-19`·`P-21`·`P-26`~`P-29`·`P-41`·`P-42` 만 등재 | `P-18`·`P-22` 재제시 포함 여부 (plan-agent / Orchestrator) |
| `H8-6-N8` | 타입 토큰이 px 라 root `font-size: 200%`(브라우저 글꼴 크기 설정)가 글자에 반영되지 않음 | 1.4.4 는 페이지 줌으로 충족 가능 | 기록만 (rem 전환은 범위 밖 · 디자인 시스템 결정) |

### H8-6.7 가값 등재 (`S3-PROV-2` 잔여 · Plan 부록 B.2-④)

`apps/web/src/dev/ui-gallery/provisionalItems.ts` — `P-19`(사용처 0 표기) · `P-21`(후보) · `P-26` · `P-27` · `P-28` · `P-29` · `P-41` · `P-42` 등재 (전부 `waiting`). 확정 12 / 대기 26. 가드: `gallery-helpers.test.ts`(목록 · 대기 목록) · `provisional-registry.test.ts`(토큰 밖 가값 = 소스 주석 존재 — `P-26`/`27` session.css · `P-28` TextInput.css · `P-29` StarRating.css · `P-41` CSS 3곳 · `P-42` JS 상수 2개). `stage-0-approvals.md` §4 등재는 하지 않았다(Verdict 때 사용자 확정 후 — Plan §9).

### H8-6.8 파일

- 신규: `e2e/a11y-audit.spec.ts` · `e2e/a11y-keyboard.spec.ts` · `e2e/support/a11y.ts` · `e2e/support/a11y-stops.ts` · `packages/ui/src/hooks/useRadioListKeyboard.ts` · `apps/web/__tests__/reading-context-sheet.test.tsx`
- 수정: `packages/ui/src/hooks/useFocusTrap.ts` · `packages/ui/src/field/SelectTrigger.tsx` · `apps/web/src/features/activity-card-deck/ui/ReadingContextSheet.tsx` · `apps/web/src/app/layouts/app-shell.css` · `apps/web/src/dev/ui-gallery/provisionalItems.ts` · 테스트 `packages/ui/src/sheet/__tests__/Sheet.test.tsx` · `packages/ui/src/field/__tests__/SelectTrigger.test.tsx` · `apps/web/__tests__/provisional-registry.test.ts` · `apps/web/src/dev/__tests__/gallery-helpers.test.ts` · `package.json` · `pnpm-lock.yaml`
- 신규 컴포넌트 · 토큰 · 아이콘 0 · `overflow` 선언 0 · 화면 HEX/arbitrary 0 · 공개 Shared UI API 변화 0

### H8-6.9 Mock 시나리오

신규 0. 감사는 기본 시나리오 + 기존 key(`me:consent-missing` · `me:vpc-failed` · `analysis:analysis-completed`)만 쓴다.

### H8-6.10 BACKEND_INTEGRATION_PENDING 예상

없음 (Frontend 접근성 단위).

### H8-6.11 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `lint` · `lint:boundaries`(1115 modules) · `build` · `test` · `format:check` | 전부 0 — **238 files / 3,579 tests** (이전 237 / 3,570 → Sheet +2 · SelectTrigger +3 · reading-context-sheet +3 · registry +1) |
| `pnpm test:e2e` (단독, 전체 1회) | **1047 passed · 0 failed** (27.1m — 이전 982 + 신규 65: `a11y-audit` 49 · `a11y-keyboard` 16) |
| baseline | **변경 0 · 재생성 0** — 수정(F1~F4)은 정지 화면 픽셀을 바꾸지 않는다. 이 단위 시작 이후 수정된 baseline 파일 0 (`find -newer package.json` 0건 · `git status` 의 변경 9건은 S8-B~F 산출물) |

---

## H8-7 (S8-I)

`S8-I` 프리뷰 빌드 · 배포 준비 (2026-11-21, development-agent). **커밋하지 않았다.** 외부 계정 생성 · 로그인 · `wrangler` 설치 · 배포 실행 **0** (`D8-1` — 배포는 사용자 `S8-I-U`). `S8-H` 범위는 건드리지 않았다.

### H8-7.1 Gate

| Gate | 결과 |
|---|---|
| Plan | rev 2.2 `APPROVED (D8-1)` — §5.6 · §12 `S8-I` 행 · AC-8-65~67 · 71(빌드) · 72 |
| Design Spec | `APPROVED (D8-1)` — UI 영향 = 표지 교체만 (Plan §12.1 "`S8-I` 의 표지 교체는 Library · Home · 세션 baseline 분해 대상") |
| 선행 | `S8-G` H8-6.11 (e2e 1047) ✅ · `S8-H` 는 사용자 결정 대기로 순서 뒤로 (Orchestrator 지시) |
| Backend 작업 | 없음. `ls apps/` = `web` 만 (`api` · `mobile` 없음) · `supabase/` 없음 |

### H8-7.2 구현

| 항목 | 내용 | 파일 |
|---|---|---|
| 프리뷰 빌드 | `pnpm build:preview` = `vite build --mode preview` → `apps/web/dist-preview/`. `--mode preview` 는 **`VITE_API_MODE=mock` 강제**(`http` 를 주면 빌드 중단) · **sourcemap 끔**(프리뷰만 — 로컬 · CI `pnpm build` 는 `sourcemap: true` 유지, `S1-G-7`) · 출력 폴더를 http 빌드 `dist/` 와 분리(`assert:no-mocks` 대상 보존). `vite preview --mode preview` 도 같은 폴더를 서빙(판정에 `command` 를 쓰지 않음 — `command==='build'` 조건이었을 때 `vite preview` 가 http `dist/` 를 서빙해 *"VITE_API_BASE_URL is not a valid absolute URL"* 로 앱이 죽는 것을 실측하고 고침) | `apps/web/vite.config.ts` · `apps/web/package.json` · `package.json` |
| 표지 파일 URL | 중립 표지(0.6 KB)가 Vite 기본 인라인 한도(4 KB) 아래라 `data:` URI 로 박히던 것을 `assetsInlineLimit` 로 표지 디렉토리만 제외 → 프리뷰도 dev 처럼 **파일 URL** (`coverUrl` = 서버 URL 의미 유지) | `apps/web/vite.config.ts` |
| `assert:preview` | ⓪ Mock 표식 **존재**(http 빌드 오업로드 방지) ① `.map` · `sourceMappingURL` 0 ② dev 표식(`__HARU_DEV_SENTINEL__` · `haru-dev-` · `__HARU_MOCK_REQUEST_LOG__`) 0 ③ Secret 패턴 9종 0 ④ `VITE_*` 이름·값 출력 + Secret 류 이름 실패 ⑤ 최상위 `404.html` · `_redirects` 0 ⑥ 예약 도메인 밖 이메일 0 · 상용 표지 에셋 0. 인자로 다른 폴더 검사 가능(회귀 테스트용) | `scripts/assert-preview.mjs` · 테스트 `apps/web/__tests__/assert-preview.test.ts`(15 — 위반 11종이 실제로 실패하는지 가짜 산출물로 확인) |
| 표지 중립 대체 (`N8-13` ⓐ · `P3-BIP-19`) | 상용 표지 PNG 3개 삭제(`where-the-wild-things-are` · `the-most-magnificent-idea` · `grumpy-monkey-play-all-day`) → **단색 표지 3개** `neutral-cover-{teal,orange,indigo}.png` 216×309. 무늬 · 글자 0, 색 = design-tokens `--haru-palette-teal/orange/indigo` (스크립트가 `primitive/color.css` 에서 읽음 — HEX 재기재 0). 책 제목 · 저자(Figma 값)는 그대로 | `apps/web/src/shared/assets/book-covers/*` · `mocks/fixtures/saved-books.ts` · `mocks/fixtures/library.ts`(주석) |
| 에셋 파이프라인 (`QA-3-003`) | `pnpm assets:optimize` 에 `book-covers` 그룹 추가 — 마스터를 **생성**(같은 픽셀이면 다시 쓰지 않음) · `D-4` 상한 216 검사 · `--check` 는 사양 불일치 시 실패. 표지 포맷 = PNG 하나(contract `coverUrl` 이 단일 URL 이라 `<picture>` 로 포맷을 고를 수 없음 — 쓰이지 않을 WebP/AVIF 를 만들지 않음). 캐릭터 그룹은 변화 0 | `scripts/assets-optimize.mjs` · 테스트 `apps/web/__tests__/asset-pipeline.test.ts` +2 |
| 무시 목록 | `dist-preview/` — `.gitignore` · `.prettierignore` · eslint `HARU_IGNORES` · vitest coverage · dependency-cruiser | 각 파일 |
| 배포 절차서 | 사용자용 — 산출물 만들기 → Cloudflare 계정 → Pages Direct Upload → Access(preview + `*.pages.dev` Known issues 절차) → 허용 이메일 → AC-8-68 · 69 · 70 · 71 확인 → 재배포 · 금지 · 문제 해결. 메뉴 이름은 Cloudflare 공식 문서 3곳(2026-11-21 조회) 기준 | `docs/qa/stage-8-preview-deploy.md` |

### H8-7.3 `?scenario=` 쿼리 실측 (Mock 프로덕션 빌드 — AC-8-71 빌드 부분)

`vite preview --mode preview`(dist-preview) + Chromium, 393×852. 스크립트 · 원자료: `docs/qa/evidence/stage-8/s8-i/measure-preview.mjs` · `preview-scenario-query-measure.json`.

| 확인 | 결과 |
|---|---|
| 쿼리 없음 → 로그인 → Home | *A storytime is still open* 0 · Scenario Panel 0 · `__HARU_MOCK_REQUEST_LOG__` 없음 · console error 0 · 표지 = `/assets/neutral-cover-*.png` 3개 |
| `/auth/log-in?scenario=home:session-already-active` → 로그인 → Home | 안내 문구 **1** (쿼리 동작) · Panel 0 · console error 0 |
| 깊은 경로 직접 로드 `/progress` · `/settings/data` | 200 · 앱 렌더(로그아웃 → `/auth/welcome` 이동, 정상). Cloudflare 위 동작은 AC-8-68 사용자 확인 |
| `/dev/gallery` | 앱의 *Page not found* — dev route 없음 |

- 관찰(변경 안 함): Mock scenario store 의 2순위 계층(dev Panel 이 쓰는 `sessionStorage['haru:scenario']`)은 프로덕션 Mock 빌드에서도 읽힌다. 패널 UI 는 없으므로 개발자 도구로 직접 값을 넣지 않는 한 쓰이지 않는다. `N8-12` ⓑ "패널 UI 0" 은 충족 — 계층 자체를 막을지는 QA 판단에 맡긴다.

### H8-7.4 baseline 분해 (R-BASELINE-1)

1차 전체 e2e(단독): **1027 passed · 20 failed** — 전부 시각 비교. 연결성분 분해(채널차 > 5, 2px 병합) 원자료: `docs/qa/evidence/stage-8/s8-i/baseline-decomposition.json`.

| 묶음 | 파일 | 성분 | 원인 |
|---|---|---|---|
| Home | `s3-home` · `s3-home-deck` · `s3-home-deck-scrolled` · `s4-home-offline-cached-393/320` | 58×82 1개 (mode = teal / orange) | Activity Card 표지 |
| Library | `s3-library` · `-reading-now` · `-shelf` · `-list` · `-favorites-empty` | 107×151 · 64×90 · 34×48 (mode = palette 3색) + 탭바 아래 1~2개 | 표지 + 유리 탭바(backdrop blur) 뒤에 비친 표지 |
| Library 시트 | `s3-library-shelf-sheet` · `-book-sheet` · `-book-sheet-back` | 표지 + 시트 유리면 · 글자 가장자리 다수 | 반투명 시트 · blur 뒤의 표지 (글자 AA 가 배경을 따라 바뀜) |
| 세션 | `s4-session-recording` · `-paused` · `-recording-320` · `s4-session-background-notice` | 16×22 1개 (mode = teal) | 세션 책 칩 표지 |
| 세션 오버레이 | `s4-prompt-drawer` · `s4-session-prompts` · `s4-reading-context-sheet` | 같은 16×22 자리 / 시트 상단 | Drawer scrim · 팝업 · 시트 유리 뒤의 표지 |

- **런타임 토글 확인**: 원래 상용 표지 3개를 임시로 되돌리고 실패 20건만 재실행(`--last-failed`) → **20 passed**. 표지가 유일한 원인임을 확정한 뒤 되돌렸다(임시 파일 삭제 · `assets:optimize --check` OK).
- 재생성: `pnpm test:e2e --update-snapshots=all`(단독) — **1047 passed**. 바이트가 바뀐 baseline **21개** = 위 20 + `s4-session-discard-dialog`(321×240, 성분 3개 · 23px, x 64–80 상단 = Dialog 반투명 면 뒤의 세션 표지 자리 — 1차에서는 임계값 아래라 통과했었다). 그 밖 baseline 변화 0 (md5 전후 비교).
- 재생성 후 전체 e2e 단독 재실행: **1047 passed · 0 failed** (27.1m).

### H8-7.5 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| AC-8-65 | `pnpm build` + `pnpm assert:no-mocks` 0 (http 빌드 전용 그대로) |
| AC-8-66 | `pnpm build:preview && pnpm assert:preview` ⓪①② 0 · `pnpm build` 는 sourcemap 유지(`assert-preview.test.ts` 설정 고정) |
| AC-8-67 | `assert:preview` ③④⑥ · 이메일 2개 = `sam@example.com` · `name@example.com` · 표지 = 중립 3종 (`asset-pipeline.test.ts`) |
| AC-8-68 | 스크립트 부분 = ⑤ 0 · 배포 URL 부분 = 사용자 (`stage-8-preview-deploy.md` §6.2) |
| AC-8-71 | 빌드 부분 = H8-7.3 실측 · 배포 URL 부분 = 사용자 §6.3 |
| AC-8-72 | 앱 테스트 빌드 · Backend 배포 0 (`apps/mobile` 없음 · 배포 실행 0) |
| AC-8-69 · 70 | 사용자 `S8-I-U` (절차서 §6.1 · §6.3) |

### H8-7.6 보고 · 결정 필요

| # | 내용 |
|---|---|
| `H8-7-N1` | **Plan 은 "상용 표지 4종"** 이지만 저장소 에셋은 **3개**뿐이었다. 4번째로 Library Plan 이 적은 *After the Fall* 표지 파일 · 참조는 저장소에 없다(grep 0). 교체 대상 = 3개 — plan-agent 문구 정정 필요 |
| `H8-7-N2` | **중립 표지의 모양은 Figma · Spec 어디에도 없다** (최우선 규칙 2). 승인된 결정(`N8-13` ⓐ "중립 대체")의 최소 해석으로 **무늬 · 글자 없는 palette 단색**을 택했다. design-agent Visual Gap · 사용자 확인 필요 — 다른 모양을 원하면 `COVER_SPECS` 만 바꾸면 된다 |
| `H8-7-N3` | 상용 표지 원본은 작업 트리에서 지웠지만 **git 기록(이전 커밋)에는 남아 있다**. 저장소는 private 이고 프리뷰 산출물에는 0 — 기록 정리(이력 재작성)는 하지 않았다 |
| `H8-7-N4` | 책 **제목 · 저자**(*Where the Wild Things Are* 등 실제 상용 도서)는 Figma 값 그대로 유지했다 — 결정 범위가 표지에 한정. 프리뷰에 제목이 나가는 것이 괜찮은지는 법무 확인 항목(`P3-BIP-19`)과 함께 |
| `H8-7-N5` | 프리뷰 dist 크기: 캐릭터 PNG/WebP/AVIF 3포맷이 모두 산출물에 포함(약 7 MB) — 기존 동작, 변경 안 함 |

### H8-7.7 Mock 시나리오 · BACKEND_INTEGRATION_PENDING

- 신규 Mock 시나리오 0 · fixture 변경 = 표지 매핑만.
- PENDING 신규 0. (프리뷰 호스팅 · Access 는 Backend 가 아니라 사용자 수행 `S8-I-U`.)

### H8-7.8 파일

- 신규: `scripts/assert-preview.mjs` · `apps/web/__tests__/assert-preview.test.ts` · `docs/qa/stage-8-preview-deploy.md` · `apps/web/src/shared/assets/book-covers/neutral-cover-{teal,orange,indigo}.png` · `docs/qa/evidence/stage-8/s8-i/*`
- 삭제: `apps/web/src/shared/assets/book-covers/{where-the-wild-things-are,the-most-magnificent-idea,grumpy-monkey-play-all-day}.png`
- 수정: `apps/web/vite.config.ts` · `apps/web/package.json` · `package.json` · `scripts/assets-optimize.mjs` · `apps/web/src/shared/assets/book-covers/index.ts` · `apps/web/src/mocks/fixtures/{saved-books,library}.ts` · `apps/web/__tests__/asset-pipeline.test.ts` · `.gitignore` · `.prettierignore` · `.dependency-cruiser.cjs` · `packages/config/eslint/base.js` · `packages/config/vitest/base.ts` · baseline 21개(H8-7.4)
- 화면 코드 · 컴포넌트 · 토큰 변경 0 · 화면 HEX/arbitrary 0 · `overflow` 선언 0

### H8-7.9 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `lint` · `lint:boundaries`(1116 modules) · `build` · `test` · `format:check` | 전부 0 — **239 files / 3,596 tests** |
| `pnpm assert:no-mocks` | 0 |
| `pnpm build:preview && pnpm assert:preview` | 0 — ⓪~⑥ 전부 OK · `VITE_*` 0개 |
| `pnpm assets:optimize --check` | 0 — 마스터 8 (캐릭터 5 · 표지 3) |
| `pnpm test:e2e` (단독) | 1차 1027/20 실패(표지) → 토글 확인 20 passed → `=all` 재생성 1047 → **재실행 1047 passed · 0 failed** |

---

## H8-8 (D8-3)

`D8-3`(2026-11-21 사용자 결정) 코드 반영 (2026-11-21, development-agent). **커밋하지 않았다.** 근거: `docs/decisions/stage-8-approvals.md` D8-3 · `docs/design/stage-8-visual-gap.md` §3 (`VG8-G-06`~`12`) · H8-6.6.

### H8-8.1 Gate

| Gate | 결과 |
|---|---|
| Plan | rev 2.3 `APPROVED (D8-1)` — §11.11.1 `D8-3` 반영 표기 · §12.5 Q-1~Q-3 |
| Design Spec | `APPROVED (D8-1)` · Visual Gap S8-G §3 권고 = D8-3 확정분 |
| 결정 | `D8-3` (사용자 2026-11-21) — `packages/ui` TextLink opt-in 옵션 1개 승인 포함 |
| Backend 작업 | 없음. `ls apps/` = `web` 만 · `supabase/` 없음 |

### H8-8.2 반영 (판정은 QA)

| 결정 | 구현 | 파일 | 증거 |
|---|---|---|---|
| `H8-6-N2` 녹음 버튼 이름 | `idle` · `disabled` 변형 이름 = **`Tap to recording, Start recording`** (보이는 캡션 먼저 — 2.5.3). 상수 하나(`storytimeSessionCopy.record.start`)만 바꿔 모든 사용처가 따른다. `recording`(`Pause recording`)은 캡션 없음 → 변화 0 | `features/storytime-session/copy.ts` · `dev/ui-gallery/gallery-copy.ts` | 단위 `RecordControl.test.tsx` 2곳(exact 이름) 갱신 · e2e 정확 비교 4곳(`session-regression` 터치 표 · `session-recording` 지연 측정 · 변형 표 2 · `a11y-keyboard` `tabTo`) 갱신. 부분 일치 쿼리(`{ name: 'Start recording' }`) 17 파일은 그대로 통과 |
| `H8-6-N1` 리포트 카드 링크 | `aria-label` 제거 → 이름 = 보이는 제목 + 범위가 든 설명 (`N7-37` 개정). 안 쓰이게 된 `reportCard.openLabel` 삭제 | `features/progress-overview/ui/ReportCard.tsx` · `copy.ts` | 단위 `progress-overview`(+`aria-label` 없음 단언) · `report-pdf` · e2e `progress` · `report-detail` 2 |
| `H8-6-N3` → 가값 **`P-43`** | Figma 색 그대로. registry 등재(`waiting` — 디자이너 대기, 요청서 `R8-7`) + 사용처 CSS `provisional: P-43` 주석. 토큰 값 변화 0 | `dev/ui-gallery/provisionalItems.ts` · `features/auth/auth.css` | `gallery-helpers.test.ts`(목록 · 대기 27) · `provisional-registry.test.ts`(토큰 밖 가값 목록 · 소스 주석) |
| `H8-6-N4` 링크 3종 | `packages/ui` **`TextLink hitArea?: 'text' \| 'touch'`** (기본 `'text'` — 기존 사용처 diff 0). `'touch'` = `position: relative` + 칠하지 않는 `::before` 를 가로 · 세로 각각 `min(0%, (100% − 44)/2)` 만큼 바깥으로 → 누르는 영역 ≥ 44×44, 글자 상자가 44 보다 큰 축은 넓히지 않음. consent *View* ×5 · Step 1 *Done* · 녹음 목록 *Show more* 에 적용 | `packages/ui/src/link/TextLink.{tsx,css}` · `features/consent/ui/ConsentRow.tsx` · `features/onboarding-survey/ui/ChildInfoStep.tsx` · `features/recording-deletion/ui/RecordingList.tsx` | 단위 `TextLink.test.tsx` +1 (opt-in · 선언이 배치 기준점뿐 · 칠하는 속성 0). **e2e 신규 `text-link-hit.spec.ts` 6** (393 · 320 × 3곳): ① modifier 를 떼고 다시 찍어 **바이트 동일**(시각 변화 0) ② 넓힌 44 영역 1px 격자 전부 링크가 받음 ③ 이웃 인터랙티브 상자 안에서 링크가 받는 점 0 (겹침 0) |
| `H8-6-N4` 회고 입력칸 40 | **수용 예외(근거 `D8-3`)** — 코드 변화 0. 감사에서 `haru-text-input` 높이 ≥ 40 = `D8-3` 예외 | `e2e/a11y-audit.spec.ts` | 감사 ④ |
| `H8-6-N6` 196 폭 뒤집기 버튼 | **원인 실측**: Activity Card 헤더의 역량 Tag 가 `white-space: nowrap` + flex `min-inline-size: auto` 라 글자 폭(140.3) 아래로 줄지 않아 헤더(내용 132)를 넘쳤다(scrollWidth 186). 그 뒤의 뒤집기 버튼이 카드 면 밖 · **뷰포트 밖**(중심 x 196.3 / 폭 196)으로 밀려 `elementFromPoint` = 없음. design-agent 가설("다음 카드 면이 덮음")과 다르다 — 첫 카드는 화면 밖, 나머지는 트랙의 다른 페이지. **수정**: 헤더 안 Tag `min-inline-size: 0` + 글자 span 말줄임(`overflow: hidden` · `text-overflow: ellipsis`). 글자 span 의 클립이 **글리프 잉크**(`g` 내림획 1행 · 오른쪽 AA 1열 = 10px)를 자르는 것을 픽셀 토글로 찾아 `R-SHADOW-1` ② 방식(padding `--space-0-5` · margin −padding)으로 클립 선만 2px 물렸다 — 바깥 상자 크기 · 위치 불변 | `entities/activity-card/activity-card.css` | 실측(수정 후): 393 · 320 Tag 폭 140.3 · 141.6 · 139.5 그대로 · 196 앞면/뒤집은 면 버튼 중심 hit = 버튼. e2e `shadow.spec.ts` 신규 3 (393 · 320 토글 바이트 동일 · 196 말줄임 + 버튼 hit) · 감사 ⑥ 196 기능 손실 예외 제거 |
| `H8-6-N7` `P-18` 주석 | registry 주석 정정 — `P-18` 은 **토큰이 있다**(`--list-row-height-min` 56, `provisional` 주석만 없음) · `P-22` = 에셋 가값 · 둘 다 Final QA 재제시 포함. 같은 오기가 있던 `gallery-helpers.test.ts` 주석도 정정 | `provisionalItems.ts` · `dev/__tests__/gallery-helpers.test.ts` | 주석만 — 목록 변화 0 (아래 H8-8.4 ③) |
| a11y 감사 — 드러난 묻힘 1건 | `targetPending` 을 비우자 Welcome 법적 고지 문장 안 링크 *Terms* 55×16 · *Privacy Policy* 99×16 이 "승인 예외 밖"으로 드러났다 — 이전에는 `haru-text-link--default` 전체를 `H8-6-N4` 로 묶은 판정에 **묻혀** 있었다(H8-6.6 표에는 없던 항목). 문장 안 링크라 기존 `inline` 예외(Stage 2 Spec §4.6 · WCAG 2.5.8 inline)와 같은 성격 → `targetException` 의 inline 조건에 `haru-auth-legal` 추가. 기존 조건의 `haru-legal-links` 는 소스에 없는 클래스(죽은 조건)다 — 그대로 둠 | `e2e/a11y-audit.spec.ts` | 감사 `welcome` 정류장 |
| a11y 감사 결정 대기 목록 | `AXE_PENDING` 에서 `progress`(N1) · `session-ready`(N2) 제거 · `contrastPending` → `P-43` 장부(`contrastLedger`) · `targetPending` → 비움(링크 3종은 이제 44, 입력칸은 `D8-3` 수용 예외) · `ZOOM_UNCLICKABLE_PENDING` 삭제 | `e2e/a11y-audit.spec.ts` | 감사 49 정류장 |

### H8-8.3 Shared UI API 변화

`TextLink` 공개 prop **1개 추가**(`hitArea`, 기본 `'text'`) — `D8-3` 승인 범위. 그 밖 `packages/ui` 공개 API · 토큰 · 아이콘 변화 0. 기존 `TextLink` 사용처(11곳) 변화 0.

### H8-8.4 NEEDS_DECISION / 보고

| # | 내용 |
|---|---|
| **`D8-3-N1`** | **paused 녹음 버튼도 같은 2.5.3 위반이다** — 보이는 캡션 *Tap to resume*(Figma `298:1227`) ↔ 이름 *Resume recording*. 감사 `session-paused` 정류장에서 axe `label-content-name-mismatch` 가 그대로 남는다(실측). Visual Gap §3.2 는 *"`recording` · `paused` 변형은 Figma 캡션이 없어 이름 변경 0"* 이라 적었으나 **paused 는 캡션이 있다** — 사실 오기. `D8-3` 문구는 Record 변형 이름만 정했으므로 임의로 바꾸지 않았다. 같은 규칙(*"Tap to resume, Resume recording"*) 적용 여부 = 사용자 결정. 감사는 `AXE_PENDING['session-paused']` 를 `D8-3-N1` 로 유지 |
| `D8-3-N2` | `permission-denied` 변형도 캡션 *Mic is off* ↔ 이름 *Microphone is off* 로 캡션 문자열이 이름에 들어 있지 않다(*Mic* ≠ *Microphone*). 감사 정류장에 이 상태가 없어 axe 실측은 없다 — 기록만 |
| `D8-3-N3` | `P-18` · `P-22` 를 registry 에 **항목으로** 넣지는 않았다 — 지시 범위가 "주석 사실 정정"이었다. Final QA 재제시(`S8-K`, Plan §12.5 Q-3)는 Orchestrator 가 장부(`stage-0-approvals.md` §4 · `stage-3-approvals.md` §10.2)로 진행 가능. registry 에도 넣을지는 결정 |
| `D8-3-N4` | `docs/COMPONENT_MAP.md` · Stage 2 Spec §4.6 TextLink 행에 `hitArea` 를 적는 문서 개정은 design-agent 몫 (이 단위는 `docs/design` 을 건드리지 않았다) |
| `D8-3-N5` | 위 Welcome 법적 링크의 inline 예외 편입은 **기존 예외 규칙의 적용 범위 확인**이며 새 예외가 아니라고 판단했다. QA 가 다르게 보면 Finding |

### H8-8.5 Mock 시나리오 · BACKEND_INTEGRATION_PENDING

신규 Mock 시나리오 0 · fixture 변경 0 · PENDING 신규 0.

### H8-8.6 검증

H8-9.6 과 같은 실행(이 단위와 `S8-H` 를 한 번에 검증했다).

---

## H8-9 (S8-H)

`S8-H` 반응형 · 회귀 · baseline (2026-11-21, development-agent). **커밋하지 않았다.** Plan §12 `S8-H` 행 그대로 — 전 route 4폭 + 가로 웹 852×393 spec · `scrollbar-classic` 확장 · 그림자 프로브 · `--update-snapshots=all` 분해 · `v2-material`.

### H8-9.1 Gate

| Gate | 결과 |
|---|---|
| Plan | rev 2.3 `APPROVED (D8-1)` — §11.12 AC-8-56~59 · **95** · §11.15 AC-8-73~77 · `N8-17` |
| 선행 | `S8-G` H8-6 · `S8-I` H8-7 · `D8-3` H8-8 |
| Backend 작업 | 없음. `ls apps/` = `web` · `supabase/` 없음 · `apps/mobile` 없음 |

### H8-9.2 구현 (테스트만 — 화면 코드 변화 0)

| 파일 | 내용 | AC |
|---|---|---|
| `e2e/responsive-routes.spec.ts` 신규 (49) | 접근성 감사와 **같은 정류장 목록**(`support/a11y-stops.ts`, Plan §12.4 route × 대표 상태 · 시트/다이얼로그 열림 포함)을 열고 뷰포트만 바꿔 320×568 · 393×852 · 600×800 · 1024×768 · **852×393** 에서 ① 문서 · 앱 스크롤 박스 가로 넘침 0 ② 앱 컬럼 폭 = min(clientWidth, 480) · 가운데 ±0.5 ③ **다단 0** — 보이는 글자 · 컨트롤의 *그려지는* 가로 범위(가로를 자르는 조상과의 교집합)가 컬럼 안. 852×393 은 추가로 ④ 인터랙티브마다 `scrollIntoView` 후 중심점을 그 요소가 받음(하단 TabBar · 버튼 바가 기능을 막지 않음, 비활성 · 가로 트랙의 다른 페이지 제외) | 56 · 57 · 95 |
| `e2e/scrollbar-classic.spec.ts` 확장 (+49) | 같은 49 정류장을 **클래식 스크롤바(15px)** project 에서 320×568 · 393×600 · 1024×500 · 852×393 — 기존 프로브(가로 넘침 · 문서 세로 스크롤 0 · 컬럼 = clientWidth 가운데 · 스크롤바 실재) | 56 · 95 |
| `e2e/shadow.spec.ts` (+3) | Stage 8 의 **유일한 새 `overflow` 선언**(H8-8 `H8-6-N6` Tag 글자 span) — 393 · 320 픽셀 토글 바이트 동일(세로 · 가로 · 사방 12px) + 196 말줄임 · 버튼 hit. Stage 8 다른 단위의 새 `overflow` = 0 (각 CSS 머리 주석 · H8-6.8 · H8-7.8) | 58 |

프로브가 실제로 무는지: 첫 실행에서 ③ 이 Home 1024 의 가로 트랙 화면 밖 카드(잘려 안 보임)를, ④ 가 `/library/add` 의 비활성 *Add to library*(`pointer-events: none`)를 잡았다 — 둘 다 판정 오류라 측정 규칙을 고쳤다(교집합 · 비활성 제외). 화면 결함은 0.

### H8-9.3 결과 (판정은 QA)

| 축 | 결과 |
|---|---|
| 4폭 + 852×393 · 49 정류장 | 가로 넘침 0 · 컬럼 480 가운데 · 다단 0 · 852×393 가려져 못 누르는 요소 0 |
| 클래식 스크롤바 · 49 정류장 × 4크기 | 전부 통과 |
| AC-8-59 Stage 8 신규 화면 baseline | `settings-data` · `settings-account` (393 + 320, S8-B~D 산출물 — dev 패널 가림 · settle 후) — 이번 `=all` 에서 바이트 변화 0 |
| AC-8-76 Mock key 회귀 | 단위 239 files / 3,597 (Mock parse · 결정성 테스트 포함) |
| AC-8-77 Stage 2–7 핵심 경로 | 전체 e2e 1,154 통과 (아래) |

### H8-9.4 `--update-snapshots=all` 분해 (AC-8-75 · `N8-17` · `R-BASELINE-1` ③-1 · ⑤)

1. 비교 모드 전체 e2e(단독) **1153 passed · 1 failed**(감사 `welcome` — H8-8 묻힘 1건, baseline 아님) → 수정 후 해당 정류장 통과. **baseline 실패 0** — `D8-3` 수정(TextLink hit · Tag 말줄임 · 이름 · 주석)이 정지 픽셀을 바꾸지 않았다.
2. 210장 md5 기록 → `pnpm test:e2e --update-snapshots=all`(단독) **1154 passed (30.6m)** → md5 재기록 비교: **바뀐 파일 0 · 새 파일 0 · 사라진 파일 0**. 연결성분 분해 대상 0 → 설명 안 되는 클러스터 0.
3. **`v2-material`**: `=all` 재렌더가 HEAD(`de12e98` Stage 7 재생성본)와 바이트 동일 — Stage 6·7 에서 보고된 드리프트는 **현재 재현되지 않는다**. 재생성 · 원인 추가 조사 불필요(현재 상태 = 스테일 0).
4. Playwright 가 `=all` 에서 `test-results/rebaselines.patch` 를 제안했다 — `stage7-shared-ui.spec.ts` aria snapshot 의 분 값 4개를 정규식(`\d+ minutes`)으로 바꾸는 패치. **적용하지 않았다** — 기대값을 약화하는 변경이고, 비교 모드에서 현재 값이 통과한다.
5. 재생성 후 전체 e2e 단독 재실행 **1154 passed · 0 failed (29.8m)**.

원자료: `docs/qa/evidence/stage-8/s8-h/` — `decompose.py`(분해 도구 · 채널차 > 5 · 2px 병합) · `baseline-decomposition.json`(`[]`) · `baseline-md5-before.txt` · `baseline-md5-after-update-all.txt`.

### H8-9.5 보고 (Plan 에 없는 것 — 보고만)

| # | 내용 |
|---|---|
| `H8-9-N1` | 852×393 에서 Library 하단은 TabBar(+Home 버튼)가 화면 높이의 약 ⅓ 을 덮는다. 판정 ④(스크롤로 도달 가능)는 통과하지만 **보이는 콘텐츠 영역이 좁다** — 앱은 세로 고정이고 웹 가로는 앱 컬럼 표시가 규칙(`rules/frontend.md` §9)이라 변경하지 않았다. 디자인 판단 필요 시 design-agent |
| `H8-9-N2` | `git status` 의 baseline `M` 30건 · 신규 디렉토리 2개는 **이 단위 산출물이 아니다**(S8-B~F · S8-I 산출물, md5 전후 동일) |

### H8-9.6 검증 (2026-11-21 — H8-8 포함)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries`(1116 modules) · `test` · `build` · `format:check` | 전부 0 — **239 files / 3,597 tests** (이전 3,596 + `TextLink` 1) |
| `pnpm assert:no-mocks` · `pnpm build:preview && pnpm assert:preview` | 0 · 0 |
| `pnpm test:e2e` (단독) | 비교 1153/1 → 수정 → `=all` 1154 (baseline 변화 0) → **재실행 1154 passed · 0 failed (29.8m)** — 이전 1047 + `text-link-hit` 6 · `shadow` 3 · `responsive-routes` 49 · `scrollbar-classic` 49 |
| Backend 경계 | `apps/` = `web` 만 · `supabase/` 없음 |

---

## H8-14 (D8-7)

`D8-7`(2026-11-21 사용자 결정 — 프리뷰 책 표지 복원) 반영 (2026-11-21, development-agent). **커밋하지 않았다.** 근거: `docs/decisions/stage-8-approvals.md` D8-7 · 조사 `docs/design/stage-8-visual-gap.md` `## D8-7 표지 복원 목록`.

### H8-14.1 Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | rev 2.3 `APPROVED (D8-1)` · `APPROVED (D8-1)` |
| 결정 | `D8-7` (사용자 2026-11-21) — `N8-13` ⓐ · `D8-4` 중립 표지 유지 번복 |
| Backend 작업 | 없음. `apps/` = `web` 만 · `supabase/` 없음 · `apps/mobile` 없음 |
| 에셋 출처 | design-agent 가 Figma `download_assets` 로 받은 image fill (scratchpad `covers/`). 웹 다운로드 0 |

### H8-14.2 반영 (판정은 QA)

| 항목 | 구현 | 파일 |
|---|---|---|
| 표지 3종 복원 | Figma 고해상도판 `where-the-wild-things-are` (748×1050) · `the-most-magnificent-idea` (500×501) · `grumpy-monkey-play-all-day` (500×500) 를 마스터로 넣고 `pnpm assets:optimize` 가 **상한 360** 으로 축소 → 360×505 (305 KB) · 360×361 (141 KB) · 360×360 (184 KB). `the-most-magnificent-thing` 은 쓰지 않음 | `apps/web/src/shared/assets/book-covers/*.png` · `index.ts` |
| 상한 216 → 360 | 원본이 정사각(500)이라 216 상한이면 `lg` 107×151 칸(`object-fit: cover`)에서 높이 1.4배밖에 안 됨. 360 = 정사각 높이 기준 2.4배 · Wild Things 폭 기준 3.4배 (`D-4` 단계 중 하나) | `scripts/assets-optimize.mjs` |
| 중립 표지 삭제 | `neutral-cover-{teal,orange,indigo}.png` 삭제 · 생성 코드(`COVER_SPECS` · `COVER_SIZE` · palette 읽기) 제거 | 위 2곳 |
| 같은 id = 같은 표지 | 신규 `mocks/fixtures/book-covers.ts` `mockCoverFor(bookId)` — 책 id → 표지 매핑 한 곳. `DECK_BOOKS` 3권과 `MOCK_BOOKS[3]`(Wild Things, 같은 id `…0004`)이 같은 URL. curated 7번째 칸이 placeholder → 표지. 책 추가 · 삭제 0 | `fixtures/{book-covers,saved-books,books,library}.ts` |
| `assert:preview` ⑥ | 상용 표지 금지 검사 **제거** → 표지 에셋 **목록 출력**(실패 조건 아님). 이메일 검사 · ⓪~⑤ 유지 | `scripts/assert-preview.mjs` |
| 테스트 | `assert-preview.test.ts` ⑥ 상용 표지 실패 케이스 → "표지는 목록 출력 · exit 0" 케이스 · `asset-pipeline.test.ts` 표지 디렉토리 = D8-7 3종만 · `the-most-magnificent-thing`/`neutral-cover` 부재 · `MockBooksApi.test.ts` "검색 결과는 표지 없음" → "같은 id 는 덱과 같은 coverUrl · 표지 없는 책은 없음"(양쪽 존재 확인) | `apps/web/__tests__/*` · `mocks/__tests__/MockBooksApi.test.ts` |
| 문서 | 배포 절차서 §0 "상용 그림책 표지" 행 · §1 ⑥ 행 정정 (공개 배포 금지 · `P3-BIP-19`) · `BACKEND_HANDOFF.md` P3-BIP-19 2행 | `docs/qa/stage-8-preview-deploy.md` · `docs/BACKEND_HANDOFF.md` |

화면 코드 · 토큰 · Shared UI · contracts 변화 0. 온보딩 검색은 표지를 그리지 않으므로 Wild Things `coverUrl` 추가의 화면 영향 0. Mock 시나리오 신규 0 · PENDING 신규 0 (`P3-BIP-19` 서술만 갱신).

### H8-14.3 baseline (R-BASELINE-1)

비교 모드 1차 전체 e2e: **20 failed · 1134 passed** — 전부 시각 비교. diff 를 픽셀 연결성분(채널 Δ>5, 3px 팽창)으로 분해:

| 원인 | baseline |
|---|---|
| 표지 칸 자체 (클러스터 크기 = 표지 크기 58×82 · 107×151 · 64×90 · 34×48 · 16×22, 1차 expected 안 중립 단색 비율 94~99%) | `s3-home` · `s3-home-deck` · `-scrolled` · `s4-home-offline-cached-393/320` · `s3-library-shelf` · `-reading-now` · `-list` · `s4-session-recording` · `-paused` · `-recording-320` · `s4-session-background-notice` |
| curated 7번째 Wild Things placeholder → 표지 (같은 id 정합) | `s3-library-shelf-sheet` (y 531 칸) |
| 반투명 시트 · scrim · glass 탭바 뒤 비침 (책 칩 · 서재 표지 위치와 일치, 육안 확인) | `s4-prompt-drawer` · `s4-session-prompts`(scrim 아래 책 칩) · `s4-reading-context-sheet`(시트 위 상단 카드 표지) · `s3-library-book-sheet`(시트 뒤 서재 표지) · `-book-sheet-back`(시트 상단 모서리) · `-shelf-sheet`(시트 가장자리) · `s3-library` · `-favorites-empty`(탭바 glass 아래 Finished 표지) |
| 임계 아래라 1차에서 통과했으나 `=all` 로 재기록 | `s4-session-discard-dialog` — 19px, x 67–79 · y 2–4 = 다이얼로그 상단 너머 책 칩 표지 |

설명되지 않는 클러스터 0 → `pnpm test:e2e --update-snapshots=all` (**1154 passed**, 31.6m). 변경 baseline **21개**(위 표), 나머지 189개 md5 동일.

### H8-14.4 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `typecheck` · `lint` · `lint:boundaries` · `test` · `build` · `format:check` · `assert:no-mocks` · `build:preview` · `assert:preview` · `assets:optimize --check` | 전부 exit 0 — **239 files / 3,598 tests**. `assert:preview` ⑥ 표지 3개 목록 출력 |
| 재생성 후 전체 e2e 단독 (비교 모드) | **1154 passed · 0 failed (31.0m)** · 실행 전후 baseline 210개 md5 동일 |

### H8-14.5 보고

| # | 내용 |
|---|---|
| `H8-14-N1` | 표지 상한을 216 → **360** 으로 올렸다 (위 근거). `D-4` 단계 안의 값이지만 표지 그룹 상한 변경이므로 확인 요청 |
| `H8-14-N2` | Wild Things 표지는 Figma 원본 그대로 DVD 표지(등급 마크 포함) — 바꾸지 않음 (visual-gap D8-7 §3-3) |

---

## H8-13 (S8-I 배포 방식 변경 — Workers + GitHub)

사용자 지시(2026-11-21) *"GitHub 를 써서 배포해서 다른 사람들이 git 과 이 주소에서 확인할 수 있게 하고 싶다"* 반영 (2026-11-21, development-agent). **커밋하지 않았다.** 배포 · 로그인 · 계정 접근 · GitHub 연결은 하지 않았다 (`D8-1` — 사용자 수행 `S8-I-U`).

### H8-13.1 Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | rev 2.3 `APPROVED (D8-1)` · `APPROVED (D8-1)` — `N8-11` ⓑ(Cloudflare + Access) 범위 안의 **배포 경로 변경**. 화면 변화 0 |
| 결정 | 사용자 지시 2026-11-21 (Orchestrator 경유). Pages Direct Upload → Workers Builds 는 `stage-8-approvals.md` 기록 대상 — Orchestrator |
| Backend 작업 | 없음. `ls apps/` = `web` 만 · `supabase/` 없음 · `apps/mobile` 없음. `wrangler.jsonc` 에 `main`(Worker 스크립트) · 바인딩 · vars 0 |

### H8-13.2 변경

| 파일 | 내용 |
|---|---|
| `wrangler.jsonc` (신규, 루트) | `name: "haru"` · `compatibility_date: "2026-11-21"` · `assets.directory: "./apps/web/dist-preview"` · `assets.not_found_handling: "single-page-application"` · `workers_dev: true`. `main` 없음 (정적 자산 전용). 출처 URL 주석 |
| `scripts/assert-preview.mjs` | 주석 ⑤ 를 Workers 기준으로 갱신 · 통과 메시지 "업로드" → "배포". **검사 로직 변화 0** (⑤ `404.html` · `_redirects` 금지는 `not_found_handling` 과 충돌하지 않고 그대로 유효) |
| `.gitignore` · `.prettierignore` | `.wrangler/` 추가 (wrangler 실행 시 루트에 생기는 로컬 상태) |
| `docs/qa/stage-8-preview-deploy.md` | rev 2 — Workers + GitHub 절차로 개정. 대시보드 칸별 값(§3.1) · 빌드 환경(§3.3) · Access Scope **All traffic** + Allow/Emails(Everyone 금지, §4) · 초대 방법(§4.3) · AC-8-69 본 주소 + Version URL 확인(§6.1) · AC-8-68(§6.2) · `R8-13` 충족 방식(§0.1). Pages 절차는 **부록 A (대체됨)** |

대시보드 값:

| 칸 | 값 |
|---|---|
| Build command | `pnpm install --frozen-lockfile && pnpm build:preview && pnpm assert:preview` |
| Deploy command | `npx wrangler deploy` (기본값) |
| Preview command | `npx wrangler versions upload` (Preview builds 는 선택 — 끄면 Version URL 0) |
| Protect with Cloudflare Access | Scope **All traffic** · 정책 Allow + Emails (처음엔 *Cloudflare account*) · Everyone / Bypass / 공용 메일 도메인 금지 |

`R8-13`: Build command 가 `&&` 로 `assert:preview` 를 포함하므로 검사 실패 시 Deploy command 가 실행되지 않고, 검사 폴더 = `assets.directory` 다.

### H8-13.3 확인한 것 / 미확인

| 항목 | 결과 |
|---|---|
| 설정 파일 유효성 | `npx wrangler@4.166.0 deploy --dry-run --outdir <scratchpad>` (로그인 없음, `WRANGLER_SEND_METRICS=false`) → *"Read 25 files from the assets directory …/apps/web/dist-preview"* · *"No bindings found."* · exit 0. 실행 후 생긴 루트 `.wrangler/` 는 삭제 · ignore 등록 |
| Node 선택 | 문서: `.nvmrc` / `.node-version` / `NODE_VERSION` (기본 24.22.1). 저장소 `.nvmrc` = 24.21.0 (`.node-version` 은 없다 — 지시문의 `.node-version` 은 `.nvmrc` 로 읽었다) |
| pnpm 선택 | 문서: Corepack, `packageManager` 1순위 → 12.4.2. `corepack enable` 불필요로 판단 |
| 실제 Workers Builds 빌드 (Node · pnpm 버전 · assert 로그) | **NOT VERIFIED** — 계정 없음. 절차서 §3.3 · §6.4 에서 사용자가 빌드 로그로 확인 |
| Version URL 이 Worker 단위 Access(All traffic)에 포함되는지 | **NOT VERIFIED** — 문서 문구 *"workers.dev hostname, and previews"* 만 확인. 절차서 §6.1 #2 실측 + 실패 시 대안(`preview_urls: false` 또는 Preview builds 끄기) |
| *Create an app* 화면의 Authentication policy 선택지 | 문서상 빠른 선택 = *Cloudflare account* · *Email domain*. 개별 이메일은 Zero Trust 에서 편집 — 실제 화면 **NOT VERIFIED** |
| `npx wrangler preview`(기본 Preview command) 가 정적 자산 전용 Worker 에서 동작하는지 | 문서에 없음 → 채택하지 않음 (`versions upload` 채택) |

### H8-13.4 보고 · 결정 필요

| # | 내용 |
|---|---|
| `H8-13-N1` | Preview builds 켜기 / 끄기 — 사용자 선택 (끄면 공개 표면이 본 주소 하나로 준다) |
| `H8-13-N2` | GitHub private 저장소 collaborator 초대 — 사용자 판단 (저장소에 원본 기획 · 결정 문서 포함) |
| `H8-13-N3` | `stage-8-approvals.md` 에 배포 경로 변경(Pages Direct Upload → Workers Builds) 기록 — Orchestrator |

Mock 시나리오 · fixture · PENDING 신규 0. 화면 · 토큰 · Shared UI 변화 0 → Playwright 미실행 (화면 변화 없음).

### H8-13.5 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries`(1116 modules) · `test` · `build` · `format:check` · `assert:no-mocks` · `build:preview` · `assert:preview` | 전부 exit 0 — **3,598 tests** passed (H8-11.4 와 같음) |
| `npx wrangler@4.166.0 deploy --dry-run` | exit 0 (위 H8-13.3) |
| e2e | 실행하지 않음 — 화면 변화 0 |

---

## H8-12 (D8-5)

`D8-5`(2026-11-21 사용자 결정) 반영 (2026-11-21, development-agent). **커밋하지 않았다.** 근거: `docs/decisions/stage-8-approvals.md` D8-5 · 선행 `D8-3-N2` · `D8-4-N1`.

### H8-12.1 Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | rev 2.3 `APPROVED (D8-1)` · `APPROVED (D8-1)` |
| 결정 | `D8-5` (사용자 2026-11-21) |
| Backend 작업 | 없음. `ls apps/` = `web` 만 · `supabase/` 없음 · `apps/mobile` 없음 |

### H8-12.2 반영 (판정은 QA)

| 결정 | 구현 | 파일 | 증거 |
|---|---|---|---|
| `D8-3-N2` · `D8-4-N1` permission-denied 녹음 버튼 이름 | 이름 *Microphone is off* → **`Mic is off`** (보이는 캡션 `micOffCaption` 과 동일 — 2.5.3). 상수 `storytimeSessionCopy.record.micOff` · gallery `stage4Session.micOff` 만 변경, 사용처(`StorytimeSessionScreen` · `Stage4SessionSection`)는 상수 참조. 캡션 · 마크업 변화 0 | `features/storytime-session/copy.ts` · `dev/ui-gallery/gallery-copy.ts` | 단위 `RecordControl.test.tsx` 이름 갱신 · `session-exceptions.test.tsx` 제목만 갱신(본문은 상수 참조). e2e 정확 비교 갱신: `session-recording` 변형 표 1 · `session-regression` 이름 목록 1 · `session-exceptions` 포커스 쿼리 2(`exact: true`) |
| a11y 감사 목록 정합 | `AXE_PENDING` 은 이미 `{}` (이 버튼은 등재 이력 없음) — 주석에 `D8-5` 정합 기록만 | `e2e/a11y-audit.spec.ts` | 전체 e2e 내 a11y-audit 통과 |

Mock 시나리오 · fixture · PENDING 신규 0. Shared UI 공개 API · 토큰 변화 0. `D8-4-N1` 해소.

### H8-12.3 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries`(1116 modules) · `test` · `build` · `format:check` · `assert:no-mocks` · `build:preview && assert:preview` | 전부 0 — **239 files / 3,598 tests** (수 변화 0) |
| `pnpm test:e2e` 전체 (단독 1회, 비교 모드) | **1154 passed · 0 failed (32.8m)**. 실행 전후 baseline PNG 210개 md5 동일 (변화 0) |

---

## H8-11 (D8-4)

`D8-4`(2026-11-21 사용자 결정) 중 코드 반영분 (2026-11-21, development-agent). **커밋하지 않았다.** 근거: `docs/decisions/stage-8-approvals.md` D8-4 · 선행 H8-8.4 `D8-3-N1` · `D8-3-N3`. `H8-7-N2` · `H8-7-N4` 는 코드 변화 0 결정이라 이 단위 대상이 아니다.

### H8-11.1 Gate

| Gate | 결과 |
|---|---|
| Plan / Design Spec | rev 2.3 `APPROVED (D8-1)` · `APPROVED (D8-1)` |
| 결정 | `D8-4` (사용자 2026-11-21) |
| Backend 작업 | 없음. `ls apps/` = `web` 만 · `supabase/` 없음 · `apps/mobile` 없음 |

### H8-11.2 반영 (판정은 QA)

| 결정 | 구현 | 파일 | 증거 |
|---|---|---|---|
| `D8-3-N1` paused 녹음 버튼 이름 | `paused` 변형 이름 = **`Tap to resume, Resume recording`** (보이는 캡션 먼저 — 2.5.3, `record.start` 와 같은 규칙). 상수 하나(`storytimeSessionCopy.record.resume`)만 바꿔 모든 사용처가 따른다. 보이는 캡션 · 마크업 변화 0 | `features/storytime-session/copy.ts` · `dev/ui-gallery/gallery-copy.ts` | 단위 `RecordControl.test.tsx` paused 이름 갱신 · apps/web 단위 테스트는 상수 참조라 그대로 통과. e2e 정확 비교 3곳 갱신(`session-recording` 지연 측정 `aria-label` 2 · 변형 표 1). 부분 일치 쿼리(`{ name: 'Resume recording' }`)는 그대로 통과 |
| a11y 감사 결정 대기 목록 | `AXE_PENDING['session-paused']`(`D8-3-N1`) 제거 → `AXE_PENDING = {}` | `e2e/a11y-audit.spec.ts` | 감사 `session-paused` 정류장 axe serious/critical 0 |
| `D8-3-N3` `P-18` · `P-22` 등재 | registry 에 `waiting` 으로 등재(재제시 자료 — 확정은 `S8-K`). `P-18` = 토큰 `--list-row-height-min` 56 존재 · `provisional` 주석 없음(토큰 파일 변화 0) · `P-22` = 에셋 가값, 사용처 0(`conversation_only` 카드 폐지 §12.12) | `dev/ui-gallery/provisionalItems.ts` | `gallery-helpers.test.ts`(목록 · 대기 27 → **29**) · `provisional-registry.test.ts`(토큰 밖 가값 목록 +2 · 신규 1: `P-18` 토큰 56 존재 + 주석 없음 · `P-22` 토큰 소스 부재) |

### H8-11.3 보고

| # | 내용 |
|---|---|
| `D8-4-N1` | `permission-denied` 변형(`D8-3-N2`, 캡션 *Mic is off* ↔ 이름 *Microphone is off*)은 `D8-4` 범위 밖이라 그대로다 |

Mock 시나리오 · fixture · PENDING 신규 0. Shared UI 공개 API · 토큰 변화 0.

### H8-11.4 검증 (2026-11-21)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` · `typecheck` · `lint` · `lint:boundaries`(1116 modules) · `test` · `build` · `format:check` · `assert:no-mocks` | 전부 0 — **239 files / 3,598 tests** (H8-9.6 3,597 + registry 1) |
| e2e 단독 (`session-recording` · `a11y-audit` · `a11y-keyboard` · `session-regression` · `visual`) | **184 passed · 0 failed (6.0m)** — 비교 모드. 실행 전후 baseline PNG 210개 md5 동일(변화 0) |
| 전체 e2e | 이 단위에서 실행하지 않음 (`NOT VERIFIED` — QA 재실행 대상) |

---

## H8-10 (S8-J)

`S8-J` Backend Handoff Package 완성 (2026-11-21, development-agent). **커밋하지 않았다.** 문서만 변경 — Production Code · contracts · Mock · 테스트 변경 **0** (Mock key 덤프용 임시 테스트 1개를 만들어 실행 후 삭제). `docs/design/**` · `docs/COMPONENT_MAP.md` 는 건드리지 않았다(design-agent 동시 작업).

### H8-10.1 Gate

| Gate | 결과 |
|---|---|
| Plan | rev 2.3 `APPROVED (D8-1)` — §12 `S8-J` 행 · §11.16 AC-8-78~85 · 부록 A · 부록 B.3 · B.4 |
| 결정 | `D8-1` ~ `D8-4` (`docs/decisions/stage-8-approvals.md`) |
| 선행 | `S8-A`~`S8-I` (H8-1~H8-9) — contract · Mock 위치 변경 없음 확인 |
| Backend 작업 | 없음. `ls apps` = `web` · `supabase/` 없음 · `apps/mobile` 없음 |

### H8-10.2 산출물

| 문서 | 상태 | 내용 |
|---|---|---|
| `docs/BACKEND_HANDOFF.md` | COMPLETE | §3 API 목록 **57행**(E-01~E-57) — 3.1 Request/Response/Error/Auth/Authorization · 3.2 Screen/Feature/PRD/상태 변화/Mock 위치 (모든 행 값) · §4 객체별 상태 · §5 교체 방법 · Mock 전용 route 제거 대상 = 0(`S3-ROUTE-1`) · Scenario 그룹 26개 · §6 PENDING 장부 172행(+ §6.9 QA AC ↔ 장부 대응) · §7 출시 전 차단 · §8 메모 · §9 미결 |
| `docs/DATA_REQUIREMENTS.md` | COMPLETE | Part A = Stage 2–8 Delta · `D8-1`/`D8-2` 결정(scope `account` · 쓰기 차단 · 탈퇴/전체 삭제 분리 · reports 포함 삭제 · `recordingsCount` 정의 · 다른 기기 한계) · 로컬 데이터 키 / Part B = `DATA_MODEL.md` §1–§14 원문 이관(제목 단계만 1단 내림 — diff 로 본문 동일 확인) |
| `docs/DATA_MODEL.md` | 머리에 "이관됨" 1줄 | AC-8-82 |
| `docs/AUTH_REQUIREMENTS.md` | COMPLETE | `AuthGateway` 9 메서드 시그니처 · `AuthSession` 모양 · `toSafeReturnPath` 규칙 · Guard 입력 · 동의 강제 · `signup_oauth` 구현 사실(초안의 "현재 signup_email 로 기록됨" 은 스테일 — 정정) · 탈퇴/삭제 결정 · R8-15 · 서버 기준 완료 시점 |
| `docs/RECORDING_UPLOAD_SPEC.md` | COMPLETE | 상수 12종 코드 재대조(위치 포함) · Endpoint 8행 · RU-1~22 + RU-19~21 (4b) · `UploadTransport` 최종 시그니처 · Mock 파일 · key |
| `docs/ERROR_CODES.md` | COMPLETE | 30종 — FE 처리(위치) · Mock 재현 key · `details` 모양 · 쓰기 차단 대상 메서드 ↔ endpoint 표(`DELETION_PENDING_WRITE_METHODS`) |
| `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` | ⚠️ **저장소에 쓰지 못함** — 아래 H8-10.4 | 본문 완성: Plan 부록 A + Frontend 표면 · Contract · Mock 위치 · 표시 제약 · 결정 대기 |
| `docs/API_CONTRACTS.md` | **Rev 12.4** | 아래 H8-10.3 |

### H8-10.3 `packages/contracts` ↔ 문서 대조 (AC-8-81 · 85)

| 대조 | 결과 |
|---|---|
| `ERROR_CODES` 배열 · `ERROR_CODE_HTTP_STATUS` ↔ `API_CONTRACTS.md` §1.2 ↔ `ERROR_CODES.md` §2 | 30종 · 순서 · HTTP 값 **1:1** (스크립트 대조) |
| Http Adapter 경로 · method · IK ↔ §4 endpoint 표 | 일치. API Client 없는 행 = `capability-snapshots` · `personas`(schema 만) · `GET /v1/consents`(문서 전용) |
| Mock Scenario 그룹 26개 · key 전부 ↔ §5.4 Catalogue | **불일치 4 → 정정**: `onboarding` 의 `prefilled-child-info` · `missing-prefill` · `instrument-v2` · `owned-books-empty` 가 Catalogue 에 없었다(Stage 2 재구성 Plan §8 정의 · Mock 구현됨) → §5.4 에 4행 등재 |
| §3.8 `characterLine` 추적 ID | `P3-BIP-16` 이 Stage 3 QA 의 *책 평점 집계* 와 충돌 → `HX-3-03` 으로 정정 |
| §5.1 폴더 트리 | Stage 0 설계안 그대로 두고 "구현된 폴더" 메모 추가 |
| contract 결함 | **0** — 고칠 contract 없음 |
| `pnpm --filter @haru/contracts typecheck` · `test` | exit 0 · **26 files / 569 tests** (문서 수정 전후 2회) |

### H8-10.4 ⚠️ `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` 생성 차단 — Orchestrator 조치 필요

development-agent 의 새 파일 `Write` 가 하네스 가드(*"Subagents should return findings as text, not write report files"*)에 막혔다 — plan-agent 초판이 막힌 것과 같은 가드다. 기존 파일 덮어쓰기는 통과했다(나머지 6종). 가드를 Bash 로 우회하지 않았다. **완성 본문은 scratchpad 에 있다**:

`/private/tmp/claude-501/-Users-soojin-dev-haru/af713c9a-6f8c-46d9-a529-ccbe52d26603/scratchpad/ANALYSIS_PIPELINE_REQUIREMENTS.md.txt`

Orchestrator(메인 세션)가 이 파일을 `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` 로 복사하면 AC-8-78 7종이 갖춰진다. 본문 머리 Status 줄에 "Orchestrator 가 옮겼다" 가 이미 적혀 있다.

### H8-10.5 PENDING 집계 (AC-8-79)

| 구분 | 행 |
|---|---|
| Stage 2 / 3 / 4 / 5 / 6 / 7 / 8 | 25 / 26 / 52 (P4 19 · P4B 8 · RU 22 · RU(4b) 3) / 16 / 13 / 16 / 9 |
| HX (번호 없던 본문 항목 — 신규 ID) | 15 |
| **합계** | **172** (`P4B-BIP-06` 은 "해당 없음 — `N4B-34` ⓐ" 로 닫힘 → 유효 171) |

- `docs/qa/*.md` · `docs/plans/*.md` 의 BIP ID **127개** 전부 장부에 있음 (`comm` 누락 0 · 장부에만 있는 ID 0). RU-1~22 전부 `RECORDING_UPLOAD_SPEC.md` §4 에 있음.
- QA 리포트 AC 단위 PENDING 행(Stage 2R · 3 · 4a · 4b · 5 · 6 · 7 · 8 예상) ↔ 장부 대응표 = `BACKEND_HANDOFF.md` §6.9. Stage 1 = 0.
- 새로 찾은 ID 충돌 2건 (재번호 없이 접미사로 구분): `RU-19`~`21` 이 4a · 4b 에서 다른 내용 → `(4b)` · `P3-BIP-16` 이 §3.8 에서 다른 뜻으로 재사용 → `HX-3-03`.
- 사용자 지시 필수 포함분: R8-15 다른 기기 잔여 = **HX-8-01** · 서버 기준 삭제 완료 시점 = **HX-8-02** · 동의 기록 서버 저장 = **HX-2-02** (+ P2-BIP-03 · 04).

### H8-10.6 Mock 시나리오 · BACKEND_INTEGRATION_PENDING

신규 Mock 시나리오 0 · fixture 변경 0. PENDING 신규 ID = HX 15건(본문 서술 항목에 ID 부여 — 새 요구 아님).

### H8-10.7 보고 · 결정 필요

| # | 내용 |
|---|---|
| `H8-10-N1` | `ANALYSIS_PIPELINE_REQUIREMENTS.md` 저장소 반영 (H8-10.4) — Orchestrator 복사 |
| `H8-10-N2` | Mock 재현 key 가 없는 error code 3종(`FORBIDDEN` · `PDF_NOT_READY` · `RATE_LIMITED`) — Frontend 는 일반 표면 · 재시도 분류로 처리. contract · Mock 결함은 아니다(Catalogue 규칙 "단일 code 재현은 `error` + code 지정") — QA 판단 |
| `H8-10-N3` | `REPORT_NOT_ELIGIBLE.details.eligibility` — `API_CONTRACTS.md` §1.2 설계에는 있으나 Mock 은 보내지 않고 Frontend 도 읽지 않는다(`details` 는 선택). 문서에 그대로 기록 |
| `H8-10-N4` | `ARCHITECTURE.md` §10.4 `RecorderAdapter` 시그니처 갱신(부록 B.2-⑦)은 plan-agent 담당이라 이 단위에서 하지 않았다 |

### H8-10.8 검증

| 명령 | 결과 |
|---|---|
| `pnpm --filter @haru/contracts typecheck` · `test` | 0 · 26 files / 569 tests |
| 6종 gate · Playwright | **실행하지 않음** — 코드 변경 0 · 화면 변화 0 (지시: 코드 변경이 생길 때만). docs 는 `.prettierignore` 대상, docs 를 읽는 테스트 0 (grep) |
| Backend 경계 | `ls apps` = `web` · `supabase/` 없음 |
