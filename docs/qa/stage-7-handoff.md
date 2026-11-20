# Stage 7 Handoff

Status: **HANDOFF** · 작업 단위별로 절을 덧붙인다. **커밋하지 않았다.**

---

# `H7-1` `S7-A` — Contracts + Mock (2026-11-19, development-agent)

Status: **HANDOFF** · 작업 단위 **`S7-A` 만**. 화면·route·컴포넌트·토큰(`T7-*`)·`packages/ui` 확장·entities hook 은 만들지 않았다 (`S7-B` 이후).

## H7-1.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-7-plan.md` rev 2 — `Status: APPROVED (2026-11-19, user)` (`D7-5`) ✅ |
| Design Spec | `docs/design/stage-7-design-spec.md` — `APPROVED` (`D7-5`) ✅ (이 단위는 UI 없음 — §14 `S7-A` 행의 fixture 요구만 반영) |
| 이전 Stage | Stage 6 `PASS (accepted: QA-6-005)` (커밋 `a39d7ff`) ✅ |
| `S7-A` 차단 결정 | `N7-01`·`03`·`04`·`05`·`15`·`19` → `D7-1`~`D7-4` · `N7-42`·`N7-35`·`N7-36` → `D7-5` ✅ |
| Backend 작업 | 없음. `apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3) |

## H7-1.2 구현 — Plan §7 C7-1~C7-12 (+ C7-2a · C7-4b)

| # | 구현 | 파일 |
|---|---|---|
| C7-1 · C7-1a | `WeeklyProgressSchema`(days 정확히 7 · growthThemes 4역량 각 1 · level 0..1 · nights 0..7 · moment nullable · 비교/분모 필드 0) · `WeeklyProgressQuerySchema` · `GrowthThemeStageSchema` 3값 | `packages/contracts/src/progress/weekly.ts` |
| C7-2 · C7-2a | `ReportOverviewSchema` · `ReportCycleSchema` · `ReportCycleProgressSchema` (`latestSnapshot`·`archive` 없음). 의미 ①~⑥ 은 파일 머리말 + Mock 동작으로 고정 | `src/reports/overview.ts` |
| C7-3 | `ReportSummarySchema` · `ReportSummaryPageSchema` · `ReportListQuerySchema` | `src/reports/summary.ts` |
| C7-4 · C7-4a · C7-4b | `ReportDetailSchema` (quotes 1..2 · persona ≥1 · previous nullable · clips 0..n · `checkTrends.key` = `ReflectionCheckKey` · **`trigger` = `CapabilitySnapshotSourceSchema` 재사용**) · `CapabilityScoresSchema`(4역량 각 1행) · `deltas` 없음 · `ReportNotReadyDetailsSchema` | `src/reports/detail.ts` |
| C7-5 · C7-8 | `ReportHighlightClipSchema` = `HighlightClipSummarySchema.extend({label, sessionDate})` · `RecordingDeletedDetailsSchema`(`reason?: deleted\|expired`) | `src/reports/highlight-clip.ts` |
| C7-6 · C7-6a | `ReportPdfStatusSchema`(`ready` refine) · `REPORT_PDF_POLL_INTERVAL_MS` 2000 · `REPORT_PDF_POLL_TIMEOUT_MS` 60000 | `src/reports/pdf.ts` |
| C7-7 | `reportApi.markViewed` (204 · `httpClient.send`) | `apps/web/src/shared/api/report-api.ts` |
| C7-9 | `NotificationKind` 변경 0 | — |
| C7-10 | error code 신규 0 (29종 — 테스트) | — |
| C7-11 | `reportCycleIndex` · `reportCyclePeriod` · `shiftCalendarDate` · `calendarDaysBetween` (달력 문자열 순수 산식, `Date` 미사용) | `src/rules/report-cycle.ts` |
| C7-12 | 목록 API(`capability-snapshots`·`personas`) 메서드 0 유지 | — |

API Client 4종 (interface) + Http 골격 4종 + `ApiClients` 등록:
`progressApi.getWeekly` · `reportApi.{getOverview, list, getDetail, markViewed}` · `reportPdfApi.{request(IK 필수), getStatus}` · `highlightClipApi.getPlaybackUrl` — `apps/web/src/shared/api/{progress,report,report-pdf,highlight-clip}-api.ts` · `shared/api/http/Http{Progress,Report,ReportPdf,HighlightClip}Api.ts`. Adapter 선택 지점 `app/providers/apiClients.ts` 1곳 불변.

`FileSharePort` (`N7-19`): interface + Web 구현(`canShare`·`share`·`<a download>` + 다음 task revoke, 환경 주입) + React context — `apps/web/src/shared/platform/file-share/`. Mock 포트 `mocks/platform/MockFileSharePort.ts`(공유만 Mock, 저장은 Web 포트에 위임). `AppAdapters.fileShare` · `ApiClientProvider` 의 `FileShareProvider` · `fileShare?` 주입 prop 추가.

### Mock — 서버 상태 공유 (Plan §8 "상태 저장형 · 결정적")

| 파일 | 역할 |
|---|---|
| `mocks/progress/MockProgressApi.ts` | 그룹 `progress` 8 key. 소유권 `CHILD_NOT_FOUND` · `availableWeeks` 밖 `weekStart` → `VALIDATION_FAILED{fields}` |
| `mocks/reports/reportState.ts` | 리포트 서버 상태 1벌(발행 목록 · 현재 주기 · PDF 작업). scenario = **seed 1회**. 주기 전이표(`in_progress→generating\|deferred` …) · `publishCurrentCycle`(C7-2a ②) · eligibility = `isReportEligible` (+ `in_progress` 충족 시 `cycle_in_progress`) · ratio = `min(초/3600, 세션/3)` |
| `mocks/reports/MockReportApi.ts` | 그룹 `reports` 14 key. overview · list(cursor) · detail(발행 전 id → `REPORT_NOT_READY`/`REPORT_NOT_ELIGIBLE`) · viewed(멱등) · `clip-expired` 표시 겹침 |
| `mocks/reports/MockReportPdfApi.ts` | 그룹 `report-pdf` 10 key. IK 보관소 공용 · 같은 리포트 재요청 = 같은 작업 · `failed` 후만 새 작업 · 진행 = GET 횟수 |
| `mocks/highlight-clips/MockHighlightClipApi.ts` | 그룹 `highlight-clips` 8 key. 발행 스냅샷 안의 클립만 · `RECORDING_DELETED{reason}` · `clip-url-expired` 첫 URL 만료 |
| `mocks/media/{mock-pdf,mock-wav,encoding}.ts` | 가짜 PDF 1쪽(xref 유효) · 합성 톤 WAV(8 kHz 8-bit mono) — 런타임 생성 `data:` URL, 바이너리 커밋 0 |
| `mocks/fixtures/weekly-progress.ts` · `reports.ts` | **Figma 와 같은 수치 1세트** + 달 넘김·연 넘김 주 · 페르소나 3(trigger 3값 · 220자) · 40자 이름 · 긴 summaryLine |
| `mocks/index.ts` | 번들에 4 client + `reportState` 노출 · export |
| `dev/scenario-panel/devScenarios.ts` | Panel 에 `progress` · `reports` · `report-pdf` · `highlight-clips` 그룹 추가 |

## H7-1.3 AC 매핑 (판정은 QA)

| AC | 근거 |
|---|---|
| 04~10 · 12 | `packages/contracts/src/__tests__/stage-7.test.ts` (68 tests) — schema 거부/허용 경계 · trigger 3값/미정의/누락 · ready refine · Stage 5 fixture 확장 parse · error code 29종 |
| 11 | 같은 파일 C7-11 블록(27/28일 · 윤년 2/29 · 연 넘김 · RangeError) + 기존 `report-eligibility.test.ts` 경계 6건 유지 |
| 13 | `docs/API_CONTRACTS.md` **Rev 11.1** (머리말 ①~⑩ + Stage 7 절 구현 메모). `G-01`·`G-11` 상태는 Rev 11(plan-agent) 그대로 |
| 14 | `apps/web/src/mocks/__tests__/stage7-reports.test.ts` — 4그룹 전 key 응답 parse (retry 는 메서드별 1회차 실패 후 parse) |
| 15 · 35 | 같은 파일 "report-not-eligible … isReportEligible 결과와 같다" · "eligibility · progressRatio — #17 경계" (3599/3600 × 2/3 · 저품질 1건 제외 3→2) |
| 16 | "viewed … 반복 호출 멱등" · "멱등 — ready 뒤 같은 리포트 재요청" |
| 17 | "가짜 PDF · WAV" 블록 (`%PDF-` · xref 오프셋 · RIFF/WAVE) · `pnpm assert:no-mocks` OK · 저장소 바이너리 0 |
| 18 | `apps/web/__tests__/mock-source-rules.test.ts` 통과(Mock 소스 `Date.now`/`new Date`/난수 0 · mocks import 지점 불변) · fixture 는 `mocks/**` 에만 |
| 19 | "Stage 7 Mock — 결정성" 3 조합 — 같은 scenario 2회 = 같은 응답 바이트 (StrictMode e2e 는 화면 단위) |
| 82 | "발행 전이 generating → published …" — latestReport 새 리포트 · 다음 주기 `in_progress`(Jun 8–Jul 5) · reportCount +1 · list 맨 앞 · 전부 parse. 허용 안 된 전이 throw |

## H7-1.4 검증 (2026-11-19)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 |
| `pnpm lint` | ✅ exit 0 (1회차 `consistent-type-imports` 1건 → 수정) |
| `pnpm lint:boundaries` | ✅ no dependency violations (975 modules, 3929 dependencies) |
| `pnpm build` | ✅ (청크 크기 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ 4/4 OK |
| `pnpm test` | ✅ **211 files / 3145 tests** — 신규 158 (contracts `stage-7` 68 · `stage7-reports` · `http-stage7` · `web-file-share`). 1회차 실패 = 기존 테스트 3종의 스냅샷 기대값 (아래 H7-1.6 ④⑤⑥) |
| `pnpm format:check` | ✅ |
| `pnpm test:e2e` (단독, 부분) | `e2e/scenarios.spec.ts` · `e2e/tabs.spec.ts` `--grep "Scenario Panel\|X-3"` → **3 passed** (dev Panel 그룹 4개 추가 영향 확인). 나머지 e2e 는 생략 — 화면·CSS 변경 0 |

## H7-1.5 Mock 시나리오 전환

- URL `?scenario=progress:<key>` · `reports:<key>` · `report-pdf:<key>` · `highlight-clips:<key>` (조합 쉼표) · 메서드 단위 `reports.getdetail:error` 등 · dev Scenario Panel 4그룹.
- `reports` key 는 상태 seed(번들당 1회): `success`(Figma `110:835` 조합) · `empty` · `report-eligible` · `report-not-eligible` · `report-deferred` · `report-deferred-first` · `report-delayed` · `report-published-unviewed` · `report-persona-unchanged` · `report-no-previous`.
- 발행 전 리포트 deep link 대상 = `MOCK_REPORT_IDS.pending` (`report-delayed` 등에서 `REPORT_NOT_READY`). 발행 전이는 테스트 helper `publishCurrentCycle(bundle.reportState, …)`.
- 단일 error code 재현 = `error` + 번들 옵션 `errorCodes` (예 `{ 'reports.getdetail': 'RESOURCE_NOT_FOUND' }`).

## H7-1.6 Plan 과 다르게 한 점 · 판단 (QA · design-agent 확인 요청)

1. **`success` 의 `progressRatio` = 0.4 (Figma `110:851` 막대는 100%)** — AC-7-76 "막대 = 다음 주기 ratio, **100% 고정 아님**" 을 e2e 가 구분하려면 ratio ≠ 1 이어야 한다(1 이면 하드코딩 100% 버그도 통과). Figma 대비 막대 폭 차이는 `AD7-1`~`13` 목록에 없다 → **S7-C Visual Gap 에서 허용 차이 후보로 올리거나 fixture 를 1 로 바꿀지 사용자 결정 필요**.
2. **eligibility 결합 규칙 (Mock 해석)** — `N7-14`("주기 끝 전 = `cycle_in_progress`")와 `report-not-eligible`(진행 중 주기에 `insufficient_*` 표시)이 함께 성립하도록: 진행 중 주기는 기준 **충족 시에만** `cycle_in_progress`, 미충족이면 `isReportEligible` 사유. 서버 규칙 확정은 `P7-BIP-04` (Handoff 기록 대상).
3. **`NOT_FOUND` → `RESOURCE_NOT_FOUND`** (기존 code, 신규 0 — 지시대로). `VALIDATION_FAILED` · `CHILD_NOT_FOUND` 도 기존 code.
4. **`ReportDialogueSchema`** (설계 표기 `dialogueMetrics` 의 schema 이름) — Stage 5 표면 테스트(`/metrics/i` export 0, `N5-11`)와 충돌하지 않게 이름만 바꿨다. 필드명 `dialogueMetrics` 불변.
5. **`ReportHighlightClipSchema` 소속 = `reports/`** — Stage 5 `highlight-clips` 모듈 공개 표면 스냅샷(AC-5-08)을 바꾸지 않기 위해.
6. **기존 테스트 기대값 갱신 3건** (약화 아님 — Stage 7 범위가 예정대로 늘어난 것): `stage5-fixtures.test.ts` "클립 메서드 0" → "클립 메서드 = `highlightClips.getPlaybackUrl` 하나뿐"(`N5-22` 가 Stage 7 로 넘긴 그 메서드) · `scenario-selection.test.ts` · `ScenarioPanel.test.tsx` 에 새 4그룹 · Catalogue Stage 7 key. 그 밖에 `ApiClients` 손조립 stub 2곳(`guard-integration` · `providers`)에 새 4 client 추가.
7. **Mock signed URL 만료 = `2099-12-31T23:59:59Z` 고정** — Mock 서버 시계(2026-01-01 고정) + 1h 는 실제 기기 시계에서 이미 과거라, 화면이 만료로 판단해 재발급을 반복한다. 만료 재현은 `clip-url-expired`(과거 시각 + 빈 오디오)로 한다. **S7-E 는 `expiresAt` 을 기기 시계와 비교하므로 이 전제를 유지해야 한다.**
8. **가짜 미디어 = `data:` URL** (Plan 표기 "blob") — `blob:` 은 실행마다 uuid 가 달라 응답 바이트 결정성(AC-7-19)이 깨진다. `<audio src>` · `fetch()` · `<a download>` 모두 그대로 읽는다.
9. **Moment 인용 문구 출처** — Figma `31:102`/`110:522` 원본 HTML 프로토타입(`$HARU_ONEDRIVE/디자인/HARU-Report-2b.html`)의 문장을 그대로 썼다(가상 문장). Growth `level` 도 같은 프로토타입 막대 폭(0.78 · 0.54 · 0.32). 이 세션은 Figma MCP 를 쓰지 못했다 → **S7-C Visual Gap 에서 `163:2633` 텍스트와 대조 필요**.
10. **`progress-multi-week` 의 주 4개는 연속이 아니다** (May 4 · Apr 27 · Jan 5 · Dec 29) — Plan 이 달 넘김·연 넘김 각 1개를 요구하는데 4주 연속으로는 둘을 함께 담을 수 없다. `P7-BIP-01` 의 "첫 세션 주 ~ 이번 주" 연속 범위는 Backend 규칙으로 남긴다.
11. **entities hook 미작성** — Plan §12 `S7-A` 행에 hook 이 없어 화면 단위(`S7-C`~`F`)로 남겼다 (Stage 6 `S6-A` 는 hook 포함 — 단위 정의 차이).
12. PDF 파일명에 아이 이름을 넣지 않았다(`haru-4-week-report-2026-04-13-to-2026-05-10.pdf`) — 로그 안전. 실제 이름 포함 여부는 `P7-BIP-09`.

## H7-1.7 UI 영향

**사용자 화면 UI 영향 없음** — route · page · feature · component · CSS · 토큰 변경 0. UI 에 닿는 변경은 다음 둘뿐이며 둘 다 화면 렌더 결과를 바꾸지 않는다:
- **dev 전용** Scenario Panel 에 그룹 4개 추가 (Production 빌드에 없음 — `assert:no-mocks` · baseline 은 패널을 가린다 `R-BASELINE-1` ②). e2e 3건 통과.
- `ApiClientProvider` 트리에 `FileShareProvider` 1단 추가 (DOM 출력 0 — React context).

→ design-agent: **"UI 영향 없음" 확인 + fixture 수치가 Figma 와 같은지(Spec §13 비교 전제)** 만 기록 대상 (Plan §12.2). 위 ①⑨ 확인 요청.

## H7-1.8 BACKEND_INTEGRATION_PENDING 예상 (Plan §10 그대로)

`P7-BIP-01`~`16`. 이 단위에서 Mock 이 흉내만 내는 서버 규칙: 주 경계·집계(`01`) · Growth 단계 판정(`02`) · Moment 선정(`03`) · 주기·eligibility·`cycle_in_progress` 결합(`04` — 위 ②) · 이월(`05`) · 생성·지연(`06`) · 스냅샷 불변(`07`) · progressRatio 산식(`08` — 권고 산식 그대로) · PDF 생성·멱등·파일명·signed URL(`09`) · 클립 보관·삭제·signed URL(`10`) · viewed 기록(`11`) · 소유권(`13` — `CHILD_NOT_FOUND`/`RESOURCE_NOT_FOUND`만) · overview 의미(`15`) · trigger 동결(`16`).

---

# `H7-2` `S7-B` — Shared UI + 토큰 (2026-11-19, development-agent)

Status: **HANDOFF** · 작업 단위 **`S7-B` 만**. 화면 · route · feature · entities 는 만들지 않았다 (`S7-C` 이후). **커밋하지 않았다.**
`apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3, `ls apps` = `web`).

## H7-2.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `stage-7-plan.md` rev 2 `APPROVED (2026-11-19, user)` (`D7-5`) — §12 `S7-B` 행 · §12.2 ✅ |
| Design Spec | `stage-7-design-spec.md` `APPROVED` (`D7-5`) — §3.1 · §3.4 · §3.7 · §3.9 · §5.2 · §5.3 · §14 `S7-B` 행 ✅ |
| 선행 단위 | `S7-A` (H7-1) ✅ — 이 단위는 contracts 타입을 쓰지 않는다 |
| Backend | 없음 |
| `M7-4` (회고 체크 copy 이동) | Plan §12 = **`S7-D` 첫 작업** → 이 단위에서 **하지 않았다** |

## H7-2.2 Figma 실측 (`R-FIGMA-1` — 무엇을 어떻게 쟀는가)

도구: Figma Dev Mode MCP **로컬 서버** `127.0.0.1:3845/mcp` 에 JSON-RPC 직접 호출(`initialize` → `notifications/initialized` → `tools/call`, 이 세션에 MCP 도구가 노출되지 않아 HTTP 로 불렀다 — Stage 6 H6-10 과 같은 방식). fileKey `YWWu3AFEJpRxvw0T5klq0k`.

| 호출 | 결과 |
|---|---|
| `get_variable_defs(31:102)` | `color/violet/67` = **`#ac93c4`** · `accents/teal` `#85bfb6` · `accents/pink` `#efc3d4` · `accents/blue` `#7faec1` · `glass-fill-strong` `#ffffffe5` · `text-primary` `#4a5f5c` · `text-secondary` `#7d9291` · `HARU/Glass Rest` drop 3겹 `0 2 4 / 0 12 28 / 0 28 56` + inset 2겹 → `T7-1` · Spec §0.2 와 일치 |
| `get_metadata(163:2544)` | 행 345×84 · 타일 167.5×73 @ y5.5 · 값 h29 @ y13 · 라벨 h13 @ y47 → pad 13 · gap 5 (13+29+5+13+13 = 73) · 열 gap 10 → `T7-5` 일치 |
| `get_metadata(163:2564)` | 영역 313×110 · 열 y14 h96 · 값 라벨 h10 → gap 6 → 막대 w16 → gap 6 → 요일 h11 @ y85 · 막대 8m 34.91 · 13m 56.72 · 11m 48 · 4m 17.45 · **16m · 20m 둘 다 63** · 스텁 h4 → `T7-4` · `M7-3` 일치 |
| `get_design_context(163:2544 · 163:2545 · 163:2564)` | **3회 모두 타임아웃** (120s · 120s · 500s, 응답 없음). fill · effect · 텍스트 스타일 선언값은 Spec §0.2 `[ctx]`(design-agent 실측, 같은 날)를 썼다 — **이 단위에서 재확인하지 못한 항목**: 타일 drop 1겹 `0 6 4`(→ `--shadow-bubble`), 값 SF Heavy 24 · 라벨 Medium 11, 막대 teal 55% / 100%, 라벨 Bold 10 · Semibold 10.5 |

## H7-2.3 구현

| 항목 | 파일 | 내용 |
|---|---|---|
| 토큰 Tier 1 | `packages/design-tokens/src/primitive/color.css` | `--haru-violet-67: #ac93c4` (`T7-1`, Figma **변수** — 신규 HEX 1) |
| 토큰 Tier 2 | `…/semantic/color.css` `@theme static` | `--color-growth-theme-{agency,emotion,flexibility,motivation}` (`T7-1`) · `--color-fg-quaternary`=ink-300 (`T7-6`) · `--color-surface-moment` · `--color-border-moment` (`T7-7`) · `--bar-chart-fill` · `-fill-muted`(teal 55%) · `-empty-fill` (`T7-4`) · `--report-card-icon-tile-bg`(teal 20%, `T7-8`) · `--chart-previous-stroke`(ink-400, `T7-10`) |
| 토큰 Tier 3 | `…/component/index.css` 끝 `S7-B` 블록 | 38종 — `T7-4` 7 · `T7-5` 5 · `T7-6` 3 · `T7-7` 4 · `T7-8` 3 · `T7-9` 1 · `T7-10` 3 · `T7-11` 4 · `T7-12` 5 · `T7-14` 2 · `T7-15` 1 |
| 가값 주석 | 위 파일들 | `P-35` 1 · `P-36` 7 · `P-37` 2 · `P-38` 4 · `P-39` 3 = **17 토큰**. `P-40` = `packages/ui/src/chart/barChartLayout.ts` `DEFAULT_EMPHASIS_RATIO` 주석(JS 규칙 — 토큰 없음, `P-17` 선례) |
| `StatTile` (신규) | `packages/ui/src/stat/StatTile.tsx` · `.css` | `Surface fill="strong" material="bubble" radius="surface"` + 본문 `<p>`(값 Heavy 24 + `Text caption-2 medium secondary`) · `overflow` 0 |
| `BarChart` (신규) | `packages/ui/src/chart/BarChart.tsx` · `.css` · `barChartLayout.ts` | 높이 = `value / max` (`N7-29` ⓐ) · 강조 `≥ emphasisRatio × max`(기본 0.75) · `null`/0 = 스텁 h4 · `role="list"` + `listitem` + `haru-visually-hidden` SR 문장 · 시각 라벨 `aria-hidden` · 트랙 높이 = CSS flex 나머지(JS 측정 0) · grow 모션 + reduced-motion 정지 |
| `DiamondChart.previous` (확장) | `packages/ui/src/chart/DiamondChart.tsx` · `.css` | `previous?: DiamondValues \| null` — 같은 사분면 규칙으로 **외곽선만**(면 0 · 꼭짓점 0) · z = 격자 → previous → current · 모션 없음 · `legend?: { previous; current }` (previous 가 있을 때만, `aria-hidden`, 견본 점선 16 · 면 12) |
| `Surface fill="card"` (확장) | `packages/ui/src/surface/Surface.tsx` · `.css` | `--color-surface-card` + blur 12 · glass/strong 과 같은 fallback 2곳 |
| `ProgressBar` (확장) | `packages/ui/src/progress/ProgressBar.tsx` · `.css` | ① fill = `var(--progress-fill-color, var(--color-progress-fill))` — **prop 아님**, 호출 측 CSS 가 조상에 선언(`T7-2`) ② `decorative` 모드 — 루트 `aria-hidden` · role/aria-value* 미생성 · 이 모드에서는 `label` 을 받지 않는 union 타입 (`M7-11`, Plan §5.7 "장식 모드 prop" 안 채택) |
| `ListRow.subtitle` | **변경 0** | `subtitle?` 가 이미 있다. `T7-13` 2줄 clamp 는 호출 측이 `subtitle={<Text truncate="2" …/>}` 로 한다 (기존 `haru-text--truncate-2`) — 새 `overflow` 선언 0 유지 |
| Icon registry | `packages/ui/src/icon/registry.ts` | `file-down` · `arrow-down-to-line` · `share` · `play` · `pause` 추가 (`clock` 기존) |
| export | `packages/ui/src/index.ts` · `styles.css` | `BarChart` · `barChartLayout` · `DEFAULT_EMPHASIS_RATIO` · `normalizeEmphasisRatio` · `StatTile` (+ 타입) |
| gallery (dev) | `apps/web/src/dev/ui-gallery/Stage7ProgressSection.tsx` · `gallery-copy.ts` · `ComponentsPage.tsx` · `dev.css` | 블록 `s7-stat-tile` · `s7-bar-chart`(Figma 수치 8·13·—·16·11·20·4, `Surface fill="card" material="rest"` 셸) · `s7-diamond-previous` · `s7-surface-card` · `s7-progress-fill`(4색 + decorative) · `s7-icons`. **기존 블록(`v2-surface` · `v7-progress` · `v9-icon`)은 건드리지 않았다** |
| 가값 등재 | `apps/web/src/dev/ui-gallery/provisionalItems.ts` | `P-35`~`P-40` (`waiting`) |

## H7-2.4 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| 22 (계산 단위) | `packages/ui/src/chart/__tests__/barChartLayout.test.ts` 10건 — Figma fixture 강조 **16 · 20** · 비율 `0.4 0.65 0 0.8 0.55 1 0.2` · 경계 15 = 강조 / 14.99 = 아님 · null/0/음수/NaN/∞ 스텁 · ratio clamp. e2e `stage7-shared-ui.spec.ts` "막대 높이 …" — 렌더 높이 = `value/20 × 58` · 16m ≠ 20m · 강조 fill teal / 일반 teal 55% / 스텁 ink 18% · 값 라벨 ↔ 막대 6px · aria snapshot(list 이름 + listitem 7 SR 문장, 시각 라벨 제외) |
| 31 (컴포넌트 부분) | `ProgressBar.test.tsx` decorative 3건 · e2e "s7-progress-fill 영역 … progressbar · aria-valuenow 0" (+ `v7-progress` 는 여전히 progressbar) |
| 38 (오버레이 렌더) | `DiamondChart.test.tsx` "previous 레이어" 6건 — 미지정/null → DOM 0 · 외곽선 1 · 면 0 · 꼭짓점 0 · z 순서 · null 축 열림 · 숫자 텍스트 0 · 범례 조건 · CSS 토큰. e2e computed stroke `rgb(154,171,170)` 1.5px `4px, 3px` fill none |
| 67 (컴포넌트) | BarChart list/listitem 이름 · 범례 `aria-hidden` · StatTile `<p>` 한 문단(*"5 sessions"*) · ProgressBar 장식 모드 |
| 70 | 신규 CSS 에 HEX · `rgb()` · px 리터럴 · `overflow` 0 (`BarChart.test.tsx` · `StatTile.test.tsx` CSS 검사) · `pnpm lint` 의 HEX/arbitrary 규칙 통과 · 신규 HEX = `#ac93c4` 1 (Primitive) · 가값 주석 = `provisional.test.ts` EXPECTED 표와 1:1 · **이 단위의 새 `overflow` 선언 0** |
| 79 (타일) | e2e 픽셀 프로브 — 실측 프로파일 아래 `9 9 8 8 7 5 4 3 2 1 0`(번짐 10) · 오른쪽 `5 3 2 1 0` · 왼쪽 `3 2 1 0`(4) · 위 0 → Spec §9.5 `4 / 0 / 10` 과 일치. 가로 프로브는 세로 가운데에서 잰다(아래 모서리는 radius 22 곡선 안이라 0 — 1차 시도 기록). 행(`overflow` 없음)은 `S7-C` |
| 81 | **DOM 비교** — HEAD(Stage 6) 의 `ProgressBar` · `Surface` · `DiamondChart` · `ListRow` 를 임시 파일로 꺼내 같은 props 로 새 버전과 `innerHTML` 비교 **53 케이스 전부 동일** (ProgressBar 6 · Surface 7 fill × 5 material + button · DiamondChart 3 값 × {기본 · `previous=null`+legend · selectable} · ListRow 2). 임시 파일은 삭제했다. 상시 단위: "previous 미지정 · null → 레이어 · 범례 DOM 0" · "기본 모드는 aria-hidden 을 달지 않는다" · e2e "기존 ProgressBar 채움 색 그대로". 시각: H7-2.5 baseline |
| 83 (토큰) | 신규 텍스트 크기 토큰 = `--stat-tile-value-size` 24 · `--weekly-total-size` 26 · `--moment-quote-size` 14 (Spec `T7-5`·`T7-6`·`T7-7` 만) · BarChart 라벨 = `caption-2` 11 (Figma 10 · 10.5 흡수) — e2e 렌더 font-size 최소 11 |

## H7-2.5 검증 (2026-11-19)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ (1회차 2건 — 테스트 제목 문자열 `rgb()` · gallery 문구 HEX → 문구만 고침, 규칙 우회 0) |
| `pnpm lint:boundaries` | ✅ no dependency violations (982 modules, 3956 dependencies) |
| `pnpm build` | ✅ (청크 크기 경고만 — 기존과 같다). 토큰 빌드: primitive 72 · semantic 236 · component 323 · provisional 67 토큰 / 16 항목 |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ (1회차 실패 1 = `stage4-motion-guards` 의 애니메이션 1:1 표 — 새 `haru-bar-chart-grow` 를 `reduce-animation-none` 으로 등재. 수정 후 통과) |
| `pnpm test:e2e` (**단독**) | ✅ **782 passed (17.6m)** — 신규 `e2e/stage7-shared-ui.spec.ts` 15 포함. 이후 그 spec 의 색 단정을 채널 비교로 바꾼 뒤(lint — 색 리터럴 금지) 단독 재실행 15 passed |
| baseline | H7-2.6 |

**기대값 갱신(약화 아님 — 예정된 증가)**: `packages/design-tokens/__tests__/token-tiers.test.ts`(palette 36→37 · semantic color 79→86 · Tier 3 목록 +38) · `fonts.test.ts`(manifest component 285→323 · provisional 50→67 · 항목 +P-35~39) · `provisional.test.ts`(EXPECTED 표 +P-35~39) · `apps/web/__tests__/provisional-registry.test.ts`(토큰 목록 +5 · 토큰 없는 가값 `['P-17']` → `['P-17','P-40']` + **`P-40` 주석이 소스에 남아 있는지 새 단정**) · `gallery-helpers.test.ts`(+P-35~40) · `stage4-motion-guards.test.ts`(+1 애니메이션).

## H7-2.6 baseline — `R-BASELINE-1` (3-1 · 5 · 6)

1. 비교 모드 전체 e2e 통과(위) 후, 스크린샷을 찍는 spec 14개를 **`--update-snapshots=all`** 로 다시 썼다 (391 passed, 9.1m). `git status` 변화 = **`e2e/__screenshots__/darwin/visual.spec.ts/v2-material.png` 1건** + 신규 `stage7-shared-ui.spec.ts/` 6장. **Stage 5 회고 · Stage 6 프로필 · growth · settings baseline 은 바이트 동일** (AC-7-81 시각 증거).
2. **`v2-material` 분해** (토큰 갤러리 `/__dev/ui/tokens` Material 블록): 옛 baseline 대비 **49 px · 최대 채널 Δ4**, 전부 둥근 모서리 안티에일리어싱(행 573–584, x 0–1 · 17–21 · 338–343 · 359–360). 블록 내용(토큰 이름·값) 변화 0. 3회 재생성 결과 서로 0 px 차이 → 결정적.
3. **원인 토글 (런타임, threshold 0 · maxDiffPixels 0)** — 클러스터를 둘로 나눠 각각 재현했다:
   - ⓐ **S7-B 몫**: 이 작업 트리에서 `--haru-violet-67` 견본 1개만 `display: none` → 블록 y 10524 → 10502 (Tier 1 견본 grid 1행 = 22) → **HEAD 렌더와 0 px**. 즉 S7-B 변화 = Primitive 견본 1개 추가로 블록이 22 아래로 내려간 것뿐.
   - ⓑ **기존 스테일 몫 (S7-B 이전부터)**: HEAD 를 scratchpad `git worktree` 로 꺼내(설치 offline · 토큰 빌드 · 포트 4319 자체 서버) 같은 테스트를 돌리면 **HEAD 렌더 자체가 HEAD baseline 과 98 px 다르다** — baseline 은 2026-10-27(`9f759bb`) 이후 갱신되지 않았고 `changed` 모드 비교를 통과해 숨어 있었다(3-1). 그 뒤 추가된 토큰 111개(`gray-6` `S4-G2` · `mist-300` `S5-B` 등)의 견본을 HEAD 에서 숨기면 **옛 baseline 과 0 px**. worktree 는 삭제했다(`git worktree list` = 본 트리 1개).
   → 설명되지 않는 클러스터 0 → `v2-material` 재생성 유지. 신규 6장은 육안 확인(dev 패널 없음 · 과도기 프레임 없음 · settle 후 · `prefers-reduced-motion` 으로 막대 grow 정지 상태).

## H7-2.7 판단 · Spec 과 다르게 한 점 (QA · design-agent 확인 요청)

1. **`BarChart` 막대 최대 높이 58 (Figma 63)** — 라벨 2개를 caption-2 11/13 으로 흡수(`N7-31` · `AD7-7` 후보)하면서 열 h96 안의 트랙이 96 − 13 − 6 − 6 − 13 = 58 이 됐다. 영역 h110 · 열 gap · 막대 폭은 Figma 그대로. → **Visual Gap 에서 `AD7-7` 에 이 5px 를 함께 올릴지** 확인 필요.
2. **`BarChart` prop `srLabel` = 항목 SR 문장 전체** — Spec §3.4 표기는 "`srLabel` (요일 전체)" 이지만 같은 절의 접근성 행이 항목 이름을 *"Monday, 8 minutes"* 로 정한다. `packages/ui` 는 분·요일을 모르므로(AC-7-22) 문장 조립은 `entities/weekly-progress`(S7-C) 몫으로 두었다.
3. **`StatTile` 행은 컴포넌트에 넣지 않았다** — Spec §3.1 "행 2열 flex-1 · gap 10 · 84" 는 S7-C 화면 배치. 타일 루트만 `flex: 1 1 0`. 토큰 `--stat-tile-row-block-size` 는 만들어 두었다(gallery 가 사용).
4. **`DiamondChart.legend`** — Spec §2.3.1 범례(견본 2 + *Earlier* / *This report*)를 **Shared UI 의 선택 prop** 으로 넣었다(`previous` 가 있을 때만). 범례 견본 점선 16 은 `--space-4` 를 길이로 썼다(Spec "16×0" — 신규 토큰 목록 `T7-10` 에 길이 토큰이 없다). 면 견본 12 = `--chart-legend-swatch`.
5. **`ProgressBar` 장식 모드 = prop `decorative`** (Plan §5.7 이 dev 판단으로 둔 두 안 중 prop 안) — 래퍼 `aria-hidden` 은 호출부마다 반복돼 누락 위험. 이 모드는 `label` 을 받지 않는 union 타입이라 "보이지 않는 이름" 이 생기지 않는다.
6. **`--progress-fill-color` 는 토큰 선언이 아니라 CSS fallback** (`var(--progress-fill-color, var(--color-progress-fill))`) — `:root` 에 선언하면 값이 거기서 해석돼 고정된다. Spec `T7-2` "새 값 0 — 변수 경로만" 과 같다. Tier 3 개수에 들지 않는다.
7. **`T7-13` = `ListRow` 변경 0** — `subtitle?` 가 이미 있고 2줄 clamp 는 기존 `Text truncate="2"` 로 된다(새 `overflow` 선언 없이). S7-C 의 과거 목록이 `subtitle={<Text as="span" variant="caption-1" tone="secondary" truncate="2">…}` 로 쓴다.
8. **색 `color-mix` 토큰을 Tier 2 `@theme static` 에 둔 것** — `--bar-chart-fill*` · `--report-card-icon-tile-bg` 는 Spec 이 Tier 3 로 적었지만, Tier 3(`:root`)에 `color-mix()` 를 두면 Tailwind v4 폴리필이 뒤 선언을 CSSOM 밖으로 미는 결함(H6-2)이 있어 Stage 6 `--chart-area-fill` 선례대로 옮겼다. 이름은 Spec 그대로.
9. **`P-35` 는 `--color-fg-quaternary`(ink-300) 1토큰에만** — ink-400 텍스트는 이미 `--color-fg-tertiary` = `P-24` 소속이라 한 토큰에 가값 2개를 달지 않았다. gallery `P-35` 항목 설명에는 두 색을 함께 적었다.
10. **`get_design_context` 로 재확인하지 못한 선언값** — H7-2.2 표 마지막 행. Spec §0.2 `[ctx]` 를 그대로 썼다 → **Visual Gap 에서 `163:2545`(drop 1겹) · `163:2564`(fill 55%/100%, 라벨 weight) 선언값 재조회** 권고.
11. `COMPONENT_MAP.md` · `DESIGN_TOKEN_MAP.md` 정정(Spec §4 "승인 후 정정")은 development-agent 의 문서 범위(handoff · `API_CONTRACTS`) 밖이라 **하지 않았다** — plan/design-agent 몫.

## H7-2.8 Visual Gap 대상 (Plan §12.2 `S7-B` 행)

- dev gallery `/__dev/ui/components` — `s7-stat-tile` ↔ `163:2544` · `s7-bar-chart` ↔ `163:2564`(Figma 수치 · 강조 16·20 · 20 = 트랙 전체 · 막대 최대 58 vs 63 — H7-2.7 ①) · `s7-diamond-previous`(가값 `P-38`, Figma 없음) · `s7-surface-card` · `s7-progress-fill` ↔ `163:2607` 막대 4색 · `s7-icons` ↔ `110:838` · `110:855` 글리프.
- Stage 6 프로필 baseline diff 0 (H7-2.6 ①) · 토큰 값 = Spec §5.2 (`e2e/stage7-shared-ui.spec.ts` computed).
- 허용 차이 후보 해당분: `AD7-7`(11px 흡수 → 막대 트랙 58) — **등록하지 않았다**(사용자 승인 후, 최우선 규칙 6).

## H7-2.9 Mock 시나리오 · BACKEND_INTEGRATION_PENDING

- 이 단위는 Mock · contracts 변경 0 → 새 시나리오 0. gallery 값은 dev 시연 상수(Figma `31:102` 수치)이며 Mock fixture 가 아니다.
- 새 `BACKEND_INTEGRATION_PENDING` 0.

---

# `H7-3` `S7-C` — Progress 탭 (2026-11-19, development-agent)

Status: **HANDOFF** · 작업 단위 **`S7-C` 만**. 리포트 상세 화면·회고 copy 이동(`M7-4`, `S7-D`) · 클립 플레이어(`S7-E`) · PDF(`S7-F`) 는 만들지 않았다. **커밋하지 않았다.**
`apps/api` · `supabase` · `apps/mobile` 부재 (`ls` → `No such file or directory` ×3, `ls apps` = `web`).

## H7-3.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `stage-7-plan.md` rev 2 `APPROVED (2026-11-19, user)` (`D7-5`) — §12 `S7-C` 행 · §12.2 ✅ |
| Design Spec | `stage-7-design-spec.md` `APPROVED` (`D7-5`) — §2.1 · §2.1.1 · §2.2 · §2.4 · §2.7 · §2.8 · §2.9 · §3.2 · §3.3 · §3.5 · §3.6 · §10.1 · §10.2 ✅ |
| 결정 | `D7-1`(Progress = `31:102` + `110:835` 카드만) · `D7-2`(① `+18%` 0 ② `6 nights` ③ 단계 라벨 유지) · `D7-5`(`N7-29`~`50` 권고안 — **`N7-41` chevron 제거**, AC-7-24 개정) ✅ |
| 선행 단위 | `S7-A` (H7-1) · `S7-B` (H7-2) ✅ |
| S7-A Visual Gap 수정 | `VG7-A-04` · `VG7-A-05` ⓑ — 이 단위에서 반영 (H7-3.3) |
| Backend | 없음 |

## H7-3.2 Figma 실측 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

도구: Figma Dev Mode MCP **로컬 서버** `127.0.0.1:3845/mcp` 에 JSON-RPC 직접 호출(S7-B 와 같은 방식). fileKey `YWWu3AFEJpRxvw0T5klq0k`.

| 호출 | 결과 |
|---|---|
| `get_metadata(31:102)` | 캐릭터 `163:2642` (24, 70) 347×422 · 제목 행 `31:115` y66 h40 · chip `31:118` (230, 3) 115×34 · 본문 `163:2638` y346 w345 · ① `163:2544` 345×84 (타일 167.5×73 @ y5.5) · ② `163:2551` y98 h211.6 (헤더 313×69.59: 제목 h18 @0 · 합계 h26 @23 · 보조 h16.59 @53 / 막대 영역 y85.59 h110) · ③ `163:2607` y323.6 h215 (제목 h18 @16 · 행 @46/87/128/169 · 라벨 h15 → +21 막대 h8 · fill 244/169/100/**100** @ track 313) · ④ `163:2633` y552.6 h115 (eyebrow h13 @16 · 인용 h42 @36 · 출처 h14 @85) · 탭바 `40:237` y983 |
| `get_metadata(110:835)` | 345×230.5 · 헤더 `110:836` 313×78 (아이콘 44 · 텍스트 열 x57: 제목 h18 · 설명 h37 @22 · 보조 h15 @63) · 진행 행 `110:850` y108 h11.5 (track 268.47×7 · fill **268.47 = 100%** · span 34.53) · 버튼 `110:854` y133.5 313×50 · footer `110:860` y197.5 h17 |
| `get_metadata(31:115)` | 제목 `31:117` (0, 3.5) 120×33 · chip 라벨 (14, 9) 69×16 · chevron (89, 11) 12×12 |
| `get_design_context(31:115 · 163:2551)` | **타임아웃** (150s · 응답 없음 — S7-B H7-2.2 와 같은 증상). fill · effect · 텍스트 스타일 선언값은 Spec §0.2 `[ctx]`(design-agent, 같은 날 커넥터 실측)를 썼다. 재확인 못한 선언값은 H7-3.8 ⑨ |
| 이미지 `163:2643` | design-agent 가 Spec 작성 때 내려받은 원본(scratchpad `fig/bookworm.png`) — PIL: **941×1672 RGBA**, 모서리 알파 0, 알파 bbox (0, 19, 931, 1648) |

브라우저 실측 (Playwright, 393×852 · dSF 1 · 렌더 후 `getBoundingClientRect`): TopBar y0~40 (공유 `TopBar large`, Library 와 같음) · `main` y40 · 캐릭터 **(24, 14) 347×422** · 스택 **y290** · StatTile 행 **(24, 290) 345×84** · 타일 x24 / x201.5 · 막대 영역 h110 · 막대 폭 16 · chip h34.

## H7-3.3 S7-A Visual Gap 수정 (지시 — `docs/design/stage-7-visual-gap.md` §S7-A)

| ID | 변경 | 파일 |
|---|---|---|
| **`VG7-A-04`** | `MOCK_GROWTH_THEMES` intrinsic_motivation `level` **0.30 → 0.32** (Figma `163:2632` fill 100 / track 313 = 0.319, CF 와 같은 폭) · 머리말 출처 문장 정정 | `apps/web/src/mocks/fixtures/weekly-progress.ts` |
| **`VG7-A-05` ⓑ** | `success` 계열 현재 주기 = `cycleRecord(3, 'in_progress', **3600, 3**)` → `progressRatio` **1** · eligibility `cycle_in_progress`(진행 중 주기가 기준 충족 — `N7-14`) — Figma `110:852` 폭 100% 와 같다. `report-published-unviewed` · `report-persona-unchanged` 도 같은 주기라 함께 1 (Visual Gap 권고대로 의도). seed 표 머리말 갱신 | `apps/web/src/mocks/reports/reportState.ts` |
| AC-7-76 판별 이동 | "막대 = `progressRatio`, **100% 고정 아님**" 판별 장면 = **`report-no-previous`**(발행 有 + 주기 2 `in_progress` 1440/2 → **0.4**). 카드 분기가 `success` 와 같은 행(`published`)이라 그대로 구분된다 | 아래 테스트 |
| 테스트 갱신 | `stage7-reports.test.ts` — `success` 단정: 3600 · 3 · ratio **1** · `cycle_in_progress` / `report-no-previous` 단정 추가: `in_progress` · ratio **0.4** · `insufficient_both`. 약화 아님 — 기대값이 Figma 결정으로 바뀐 것 + 판별 단정은 다른 scenario 로 **이동**(삭제 0) | `apps/web/src/mocks/__tests__/stage7-reports.test.ts` |
| 화면 단정 | 단위 `progress-overview.test.tsx`: `success` 막대 `--progress-fill-size: 100%` · `report-no-previous` **40%** / e2e baseline `s7-report-card-published`(꽉 참) · `s7-report-card-no-previous`(40%) | — |

⚠️ Plan AC-7-76 의 검증 scenario 표기(`success`)는 plan-agent 문서라 고치지 않았다 → **plan-agent · stage-qa-agent: AC-7-76 판별 scenario = `report-no-previous`** 로 읽어 주십시오.

## H7-3.4 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| Page | `pages/progress/ProgressPage.tsx` · `ProgressTopBar.tsx` | 조립만 — `<ProgressOverview />` · `TopBar large` title + trailing `WeekPickerChip`. Stage 3 준비 안내(`EmptyState`) **대체** (AC-7-03) |
| 삭제 | `shared/copy/progress-copy.ts` | `D-2` 준비 안내 copy 제거 — 제목 *Progress* 는 feature copy 로 이동 |
| Feature | `features/progress-overview/` | `copy.ts`(Spec §10.1 · §10.2 전부) · `model/resolveReportCardView.ts`(**10칸 순수 분기** + 과거 목록 규칙) · `model/weeklyView.ts`(days→bars · 보조 줄 · Q6 행 · Moment 출처 · 주 범위 라벨) · `model/useSelectedWeek.ts`(URL `?week=`) · `ui/ProgressOverview.tsx`(캐릭터 + 스택 + 리포트 영역 독립 상태) · `ui/WeeklyProgressView.tsx` · `ui/WeekPickerChip.tsx`(chip + Sheet + RadioGroup card) · `ui/ReportCard.tsx`(5 kind · 헤더 링크 · 장식 막대 · `pdfAction` slot) · `ui/PastReportList.tsx` · `ui/ProgressCharacter.tsx` · `progress-overview.css` |
| Entity | `entities/weekly-progress/` | `progressKeys` · `useWeeklyProgress`(`keepPrevious` — chip 전용) · `formatMinutes` · `formatMinuteCount` · `WeeklyReadingCard` · `GrowthThemesCard` · `weekly-progress.css` |
| Entity | `entities/report/` | `reportKeys` · `useReportOverview`(stale 1분) · `useReportList`(infinite · stale 5분 · `latestId` 키) · `ReportGlassCard`(recipe) · `NotableQuoteCard` · `report.css` |
| Entity 연쇄 | `entities/reflection/useSubmitReflection.ts` | 회고 저장 성공 시 `progressKeys.all` 무효화 1줄 (Plan §5.2) |
| Shared | `shared/lib/calendar-date-format.ts` | 달력 문자열 → `Jun 7` · `May 4 – 10` · `Apr 27 – May 3` · `Dec 29 – Jan 4` · 요일 (기기 시간대 0 — UTC 자정 고정으로 요일만) |
| Shared | `shared/config/routes.ts` | `ROUTES.progressReport` = `/progress/reports/:reportId` + `progressReportPath(id)` (**화면 등록은 `S7-D`**) · `PROGRESS_WEEK_PARAM` = `week` |
| 에셋 | `shared/assets/character/bookworm.{png,webp,avif}` + `index.ts` | `163:2643` 원본 941×1672 → Figma 크롭 창(y 181.04…1325.43) **941×1144** (aspect 0.82227 = 347/422) · `pnpm assets:optimize` 무손실 3포맷 |
| CSS 등록 | `styles/index.css` | `entities/report/report.css` · `entities/weekly-progress/weekly-progress.css` · `features/progress-overview/progress-overview.css` |
| 라우터 주석 | `app/router.tsx` | `/progress` 행 설명만 |

## H7-3.5 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| 03 | `ProgressPage` = `ProgressOverview` · `progress-copy.ts` 삭제 · 단위 "준비 안내(D-2)가 사라지고 …" (`Your first report is on the way` 0) |
| 20 | e2e `progress.spec.ts` ① 기하(캐릭터 · 스택 · StatTile 행 · 막대 영역 · chip h34) + baseline `s7-progress-frame`(393×1105 — Figma 프레임 높이, 같은 수치 fixture). Figma 나란히 비교는 design-agent Visual Gap |
| 21 | StatTile = `sessionsCount` · `minutesTogether`(`formatMinuteCount`) — 단위 `5` · `62m` |
| 22 | 단위 `weeklyView.test.ts`(값 8·13·null·16·11·20·4 · `—` · `MTWTFSS` · SR *Monday, 8 minutes* / *Wednesday, no storytime* · 0 분 = 기록 없음) + 화면 list 7 listitem. 높이·강조 계산 = S7-B `barChartLayout` |
| 23 · 66 | copy 에 `vs` · `of 7` · `%` · `streak` 0 — `stage3-copy-language.test.tsx` 새 단정 + 화면 `textContent` 단정 |
| 24 | 단위 "주간 카드에 접기 chevron 토글이 없다" + e2e ③ (버튼 · `aria-expanded` · 포커스 가능 요소 0 · 포커스 순서 chip → 헤더 링크) |
| 25 | 단위 Q6 순서 · 라벨 #14 · 단계 라벨 · 응답 역순 입력에도 같은 순서 · e2e 4색 = growth-theme 토큰 |
| 26 | 단위 인용 · 출처 · `progress:empty` 에서 Moment 미렌더 |
| 27 | 단위 + e2e ⑥ — chip → 시트(옵션 4 · 서버 순서) → 선택 즉시 닫힘 · URL `?week=` · chip 라벨 · 포커스 복귀 · 그 주 데이터 / `progress-first-week` = 정적 라벨(버튼 0) |
| 28 | 단위 `progress:empty` — `0` · `0m` · *No storytimes yet this week.* · Growth 유지 · Moment 0 · baseline `s7-progress-empty-week` |
| 29 | 단위 — 주간 error ↔ 리포트 카드 존재 · 리포트 error ↔ 주간 존재 · offline 안내 · retry 회복 · baseline `s7-progress-error` |
| 30 · 76 | 단위 `resolveReportCardView.test.ts` **10칸**(+ `published` 방어 · 생성 중/이월/지연에 이전 리포트 0) · 화면 단위 7 scenario(`success` · `report-no-previous` · `empty` · `report-eligible` · `report-not-eligible` · `report-deferred` · `report-deferred-first` · `report-delayed`) · baseline 카드 6장 |
| 31 | 단위 + e2e — `main` 안 `progressbar` · `[aria-valuenow]` **0** (리포트 막대 · Growth 막대 = `ProgressBar decorative`) |
| 32 | 단위 *Next report on Jun 7* · `email` 0 |
| 33 | 단위 + e2e — 링크 1개 · 이름 *Open 4-week report, Apr 13 – May 10* · `href` = `/progress/reports/<latest id>` · 링크 안 인터랙티브 0 · hit ≥ 44 · 클릭 → URL 이동(목적지 화면 = `S7-D`) · 다른 상태 링크 0 |
| 34 | 단위 `resolvePastReportListRule` + 화면: `success` 1건(카드 리포트 제외) · `report-eligible` 2건 · `report-deferred` 1건 · `report-deferred-first` · `report-no-previous` · `empty` 0 · 행 탭 → 상세 경로 · baseline `s7-past-reports` |
| 35 | S7-A 단위 그대로 (`stage7-reports.test.ts` #17 경계) |
| 64 | e2e ⑦ 콘솔 · pageerror 에 *Emma* · 인용 · 책 제목 0. 새 코드에 `console`/`devWarn` 호출 0 |
| 67 | 이름 · 순서(e2e) · 장식 캐릭터 `alt=""` + `aria-hidden` · 터치(chip hit 44 · 헤더 링크 ≥ 44) — 대비 수치는 가값 `P-35`~`P-37` (Spec §9.3) |
| 69 | `pnpm lint:boundaries` 위반 0 — feature 간 import 0 · Page = 조립만 |
| 70 | HEX · arbitrary · inline 수치 0 (`pnpm lint` 통과) · 새 토큰 0(S7-B 토큰만 사용) · **새 `overflow` 선언 0**(Spec 예정 1건 → 0, H7-3.8 ②) · `R-SHADOW-1` 프로브 = e2e ④ |
| 71 | e2e ⑤ 320/393/600/1024 — 가로 스크롤 0 · 컬럼 ≤ 432(480 − 거터) · 캐릭터 = 컬럼 + 2 |
| 72 | H7-3.7 |
| 77 | e2e ② 주간 · 리포트 Surface computed = `--shadow-glass-rest`(5겹) · `--color-surface-card` · `blur(12px)` · 22px (probe 요소와 computed 비교 — Tailwind 유틸리티 포함) |
| 78 | e2e ① 캐릭터 (24, 14) 347×422 · 겹침 146 · `alt=""` · `aria-hidden` · overflow 전부 `visible` (크롭은 에셋 — Spec 의 `overflow: clip` 1건 없음, H7-3.8 ②) · 프레임 gradient 미렌더 |
| 79 | e2e ④ "StatTile 아래 번짐" — 타일 아래 3px · 7px(행 경계 밖) 둘 다 그림자 有 · 행 computed `overflow: visible` |
| 80 | e2e ② eyebrow computed = `--color-fg-secondary` · border 1px · 그림자 none · 화면 코드 `#6f8c88` 0 |
| 83 | e2e ② `main` 안 보이는 텍스트 전부 font-size ≥ 11 |
| 84 | H7-3.9 (등록 0) |

## H7-3.6 검증 (2026-11-19)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ (1회차: e2e `style.evaluate` 의 `node.remove()` 타입 1건 → `(node as Element)` — shadow.spec 선례) |
| `pnpm lint` | ✅ |
| `pnpm lint:boundaries` | ✅ no dependency violations (1013 modules, 4073 dependencies) — 1회차 2건 = 삭제한 `progress-copy` 를 import 하던 기존 테스트 2개(아래) |
| `pnpm build` | ✅ (청크 크기 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ · `pnpm assets:optimize --check` ✅ 5 마스터 |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **219 files / 3240 tests** (이후 offline·retry 단위 2건 추가 → 해당 파일 19 passed) |
| `pnpm test:e2e` (**단독**, 비교 모드 — update 없음) | ✅ **818 passed (18.4m)** — 신규 `e2e/progress.spec.ts` 36 포함 (S7-B 782 + 36). 개발 중 progress.spec 단독 1회차 실패 2건: chip 오른쪽 끝 단정(기존 TopBar 상태 — H7-3.8 ⑯, 단정 제거) · 시트 radio `check()`(선택 즉시 닫혀 상태 확인 불가 → `click()`) |

`R-SHADOW-1` 프로브 실측 (채널합 Δ, `box-shadow: none` 대비 — 좌 6 · 우 6 · 위 6 · 아래 6 · 600 컬럼 밖 3): 주간 카드 320 `[39, 39, 12, 65]` · 393 `[39, 39, 12, 65]` · 600 `[39, 40, 11, 65, 7]` / 리포트 카드 320 `[39, 39, 12, 65]` · 393 `[35, 35, 12, 64]` · 600 `[36, 36, 12, 64, 4]`. 클리핑 조상 = `AppShell` 뷰포트 1개(뷰포트 전 폭) · 새 inset 불필요.

**기존 테스트 변경 (약화 아님)**
- `apps/web/__tests__/home-stage3.test.tsx` — 탭 이동 테스트의 `/progress` 기대값: 준비 안내 문구 · "숫자 0" → 제목 h1 + 주간 카드 h2. 대상 화면이 `D7-1` 로 대체됐다(AC-7-03).
- `apps/web/__tests__/stage3-copy-language.test.tsx` — 검사 대상 `progressCopy` → `progressOverviewCopy`. "`/progress` 안내에 수치 0 (`D-2`)" 단정은 대상 화면이 없어져 **비교·분모·퍼센트·streak 0** 단정(`D7-2` · `N7-05`)으로 교체. 금지어 `behind` 는 Figma `110:847` 원문 구절 *"the moments behind them"* **한 구절만** 예외(정규식은 그대로 — 다른 문장의 `behind` 는 계속 잡힌다).
- `apps/web/src/mocks/__tests__/stage7-reports.test.ts` — H7-3.3.

## H7-3.7 baseline — `R-BASELINE-1`

1. **기존 baseline 변화 0** — 전체 e2e 를 **비교 모드**(update 없음)로 단독 실행해 818 전부 통과. `git status e2e/__screenshots__` 의 기존 파일 변화 = `visual.spec.ts/v2-material.png` 1건뿐이며 이는 **S7-B 가 이미 분해·재생성한 것**(H7-2.6) — 이 단위가 바꾼 것 아님. 따라서 분해 대상 diff 없음. (`--update-snapshots=all` 은 이 단위에서 돌리지 않았다 — 기존 화면·CSS·공유 UI 를 바꾸지 않았고 비교 통과로 충분하다고 판단. QA 가 스테일 확인을 원하면 `all` 재실행 필요.)
2. **신규 13장** (`e2e/__screenshots__/darwin/progress.spec.ts/`, `--update-snapshots=changed` 로 생성): `s7-progress-frame`(393×1105 전체 화면 — Figma `31:102` 나란히 비교용) · `s7-progress-main`(393 · 전체 콘텐츠) · `s7-report-card-{published,first-cycle,generating,deferred,delayed,no-previous}` · `s7-progress-empty-week` · `s7-past-reports` · `s7-week-sheet` · `s7-progress-error`.
3. 조건: `hideDevPanel`(dev 패널 `visibility: hidden`) · 클라이언트 이동 후 `settleImages`(이미지 디코드 + rAF 2) · `reducedMotion: reduce`(막대 grow 정지) · 카드 영역은 `scrollIntoView` 후 `settle`. 육안 확인: dev 패널 0 · 과도기 프레임 0 · Skeleton 0.
4. `s7-progress-error` 는 1차 생성 후 **카드 안 카드**를 발견해(H7-3.8 ⑪) 코드를 고치고 그 1장만 지운 뒤 다시 만들었다.

## H7-3.8 판단 · Spec 과 다르게 한 점 (QA · design-agent 확인 요청)

1. **제목 행 y0 (Figma y10) — 본문은 Figma 절대 좌표 유지.** 공유 `TopBar large` 는 `/library` 와 같이 y0~40 에 그린다(Figma `31:115` y66 = 상태바 아래 10). 본문은 Figma 절대 위치(캐릭터 y14 · 스택 y290)에 맞췄다 — 그래서 제목 ↔ 캐릭터 겹침이 Figma 36 → **26**. 제목 행을 10 내리면 Library 와 어긋나므로 바꾸지 않았다. → **허용 차이 후보(신규)**.
2. **캐릭터 크롭 = 에셋, `overflow` 0건.** Spec §2.1.1 · AC-7-78 은 프레임 `overflow: clip` 1건(근거 주석)을 예정했지만, 크롭 창을 에셋에 미리 적용하면 렌더가 같고 `R-SHADOW-1` ①(overflow 회피 1순위)에 더 맞다. Home `home-character` 재크롭 선례. AC-7-70 "새 overflow = 1건" 은 **0건**이 됐다.
3. **StatTile *together* = `62m`** — Spec §2.0 분 포맷(`≥60 → {h}h {m}m`)대로면 `1h 2m` 인데, Figma `163:2549` 은 `62m`(Spec 이 같은 줄에 예로 든 값). **Figma 우선** → StatTile 은 분 단위만(`formatMinuteCount`), 주간 합계는 `1h 12m`(`formatMinutes`). Spec §2.0 정정 필요(design-agent).
4. **주간 카드 헤더 간격 4 · 4** — Spec §3.3 은 "8 ↓ 합계 → 5 ↓ 보조" 라 적었지만 `get_metadata` 는 제목 h18 → 합계 y23(간격 5) → 보조 y53(간격 4). 제목이 `subheadline` 15/20(Figma 18)이라 간격 `--space-1` 4 · 4 로 합계 y24 · 보조 y54(Δ+1) · 헤더 70(Figma 69.59). 카드 높이 **212**(Figma 211.6).
5. **`days → bars` 매핑 위치 = feature** — Spec §3.4 는 `entities/weekly-progress` 로 적었지만 매핑이 SR 문장·요일 이름(문구)을 만든다 → 문구를 소유한 `features/progress-overview/model/weeklyView.ts` 에 두고, 엔티티 카드는 포맷된 값만 받는다(지시 "copy 는 feature copy 모듈"). Growth 행 · Moment 출처도 같다.
6. **주 범위 라벨의 끝 날짜** — `availableWeeks` 는 **시작일만** 준다. 시트 옵션 *"Apr 27 – May 3"* 의 끝 날짜는 contracts `shiftCalendarDate(start, WEEK_DAY_COUNT − 1)`(달력 문자열 산식, 기기 시간대 0)로 구했다. 주 **경계** 계산이 아니라 계약상 7일 주의 표기다. 선택한 주가 응답과 같으면 응답의 `week.end` 를 쓴다.
7. **주 선택 상태 = URL `?week=`** — chip(TopBar 슬롯)과 본문(page)이 형제 route element 라 React state 를 공유할 수 없다. `replace` 이동(뒤로 가기에 쌓이지 않음) · 다른 query 보존 · 날짜 형식 아니면 무시 · 첫 옵션(이번 주) 선택 = query 제거.
8. **주간 stale = 기본 30s** (Plan §5.2 권고 5분 아님) — 5분은 "세션 완료 시 invalidate" 와 짝인데 세션 완료에 단일 성공 지점이 없다. 회고 저장 시 `progressKeys.all` 무효화는 넣었다. overview 1분 · list 5분은 Plan 대로. list 키에 `latestId` 를 더해 새 발행 시 다른 캐시를 쓴다(Plan "latestReport.id 바뀌면 invalidate").
9. **재확인 못한 선언값** (`get_design_context` 타임아웃) — chip drop 1겹(`--shadow-bubble`) · `163:2551` 텍스트 색(`#9aabaa` → tertiary) · `110:835` 설명 `#7d9291` → secondary · footer `#9aabaa` → tertiary · 아이콘 stroke 1.65(구현 = Lucide 공통 stroke) · Moment eyebrow tracking 0.4. 모두 Spec §0.2 `[ctx]` 값을 그대로 썼다 → Visual Gap 에서 선언값 재조회 권고.
10. **헤더 링크 pressed 표시 없음** — Spec §6 "pressed = opacity `--opacity-pressed`(기존 규칙)" 의 토큰이 저장소에 **없다**(`grep` 0). 새 토큰을 만들지 않고 focus ring 만 둔다.
11. **리포트 카드 오류 = `ErrorState` 단독** — Spec §2.9 "카드 셸 안 ErrorState" 대로 하면 `ErrorState` 가 자체 Surface 라 **카드 안 카드**가 된다(1차 baseline 에서 확인). 주간 오류와 같은 모양으로 셸을 뺐다.
12. **생성 중 Spinner 라벨** — 공유 `Spinner` 는 reduced-motion 에서 자기 라벨 *Loading* 을 보이게 한다. 옆 문장 *This can take a little while.* 과 겹쳐 보여 이 행에서만 라벨을 `display: none`(Spinner 는 `decorative`, 상태 안내 = 행 `role="status"`).
13. **과거 목록 SectionLabel weight = bold** — Spec §2.4 "caption-1 semibold" 이지만 "Stage 6 recipe" 를 가리키며, 그 recipe(`SettingsMenu` · `D6-10` ③)는 bold + `tracking section-label` 이다 → recipe 를 따랐다. SR 용 h2 *Past reports* 는 visually-hidden.
14. **StatTile 라벨 단수** — `1 session` (Figma *sessions* 는 5 일 때). SR *"1 sessions"* 방지.
15. **진행 막대 폭 313** — 숫자 span `110:853` 미렌더(`AD7-4`)로 트랙이 행 전체(Figma track 268.47). `AD7-4` 에 함께 올린다.
16. **chip 오른쪽 끝 x349 (Figma x369)** — 공유 `TopBar large` 가 빈 leading 을 `display: none` 으로 숨긴 뒤 남는 세 번째 grid 열의 column-gap(20) 때문. `/library` 도 같다(stage-3-approvals §30 "trailing right 349" — 기존 상태). 공유 컴포넌트 수정은 Stage 3 baseline 을 바꾸므로 **이 단위에서 고치지 않았다** → design-agent · 사용자 결정 필요.
17. `COMPONENT_MAP.md` 정정(Spec §4)은 development-agent 문서 범위 밖이라 하지 않았다.

## H7-3.9 허용 차이 후보 (등록하지 않았다 — 최우선 규칙 6 · AC-7-84)

| ID | 지점 | Figma | 구현 |
|---|---|---|---|
| `AD7-1` | `163:2558` | *"+18% vs last week"* | 미렌더 (`D7-2` ①) |
| `AD7-2` | `163:2560` | *"6 of 7 nights · avg 12 min"* | *"6 nights · avg 12 min"* (`D7-2` ②) |
| `AD7-3` | `110:861` | *"… · we'll email it too."* | *"Next report on Jun 7"* (`N7-06`) |
| `AD7-4` | `110:853` 진행 값 span · `110:851` track | span 34.53 · track 268.47 | span 미렌더 · track **313** (H7-3.8 ⑮) |
| `AD7-5` | `163:2642` 프레임 fill | gradient `#daebe5 → #d0e1dc` | 미렌더 (`N7-30` ⓐ) |
| `AD7-6` | 막대 16m · 20m | 같은 높이(상한 클립) | 비례 높이 (S7-B) |
| `AD7-7` | 텍스트 10 · 10.5 · 11.5 · 12.5 · 13(4행) + 막대 트랙 | 그 값 · 트랙 63 | 11 · 11 · 11 · 12 · 12 · 트랙 58 (S7-B H7-2.7 ①) |
| `AD7-8` | `163:2634` eyebrow | `#6f8c88` | `--color-fg-secondary` ink-500 |
| `AD7-10` | radius StatTile 20 · 카드 24 · 아이콘 타일 14 · 리포트 헤더 gap 13 | — | 22 · 22 · 12 · 12 |
| `AD7-11` | `163:2544` 행 `overflow-clip` | 타일 아래 그림자 잘림 | 클립 없음 |
| `AD7-12` | `163:2561` chevron 토글 | 30×30 토글 | 미렌더 (`N7-41` ⓐ) |
| `AD7-13` | 수치 placeholder | `31:102` 5/62m | fixture = `31:102` 값 그대로 (`110:522` 6/72m 아님) |
| 🆕 후보 | `31:115` 제목 행 y | y10 (상태바 아래) | y0 — 본문은 Figma 절대 좌표 (H7-3.8 ①) |
| 🆕 후보 | `31:118` chip 오른쪽 끝 | x369 | x349 (H7-3.8 ⑯ — 기존 `TopBar large` 동작) |
| 🆕 후보 | `163:2551` 헤더 · `110:835` 텍스트 줄높이 | 18 · 18.13 · 14.95 | 20 · 16 · 13 (토큰 스케일 흡수 — 리포트 카드 높이 154, Figma 버튼 제외 166.5) |

`AD7-9`(`110:854` 버튼)는 `S7-F`.

## H7-3.10 Mock 시나리오 전환

- `/auth/log-in?scenario=progress:<key>,reports:<key>` 로그인 → 탭 *Progress* (Mock 번들은 첫 진입에 1회 만들어진다). dev Scenario Panel `progress` · `reports` 그룹.
- 화면별: `success`(Figma 수치 · 발행 + 다음 주기 100% · 과거 1) · `progress:empty` · `progress:progress-first-week`(정적 chip) · `progress:progress-multi-week`(시트 4주) · `progress:error|offline|retry|loading` · `reports:empty`(첫 주기) · `reports:report-not-eligible` · `reports:report-eligible`(생성 중 + 과거 2) · `reports:report-deferred` · `reports:report-deferred-first` · `reports:report-delayed` · `reports:report-no-previous`(**막대 40% — AC-7-76 판별**) · `reports:error|offline`.
- 주 선택은 `?week=YYYY-MM-DD` (`availableWeeks` 값).

## H7-3.11 BACKEND_INTEGRATION_PENDING

새 항목 0. 이 단위가 화면으로 드러낸 기존 항목: `P7-BIP-01`(주 집계 · `availableWeeks` 범위 — 화면은 **7일 월~일 주**를 전제로 시작일만 받아 끝 날짜를 표기한다, H7-3.8 ⑥) · `02`(Growth 단계) · `03`(Moment 선정) · `04`·`05`(주기 · 이월) · `06`(생성 · 지연) · `08`(`progressRatio` 산식 — 발행 카드 막대도 이 값) · `13`(소유권) · `15`(overview 의미 — 발행 직후 `currentCycle` = 다음 주기).

---

# `H7-4` `S7-D` — 리포트 상세 (2026-11-19, development-agent)

Status: **HANDOFF** · 작업 단위 **`S7-D` 만**. 하이라이트 클립 플레이어(`S7-E`) · PDF(`S7-F`) 는 만들지 않았다 — 상세 ⑥ · ⑦ 은 **빈 slot**(`clipList` · `pdfAction`, 미지정 = 렌더 0 — S7-C 카드 `pdfAction` 과 같은 방식). **커밋하지 않았다.**
`apps/api` · `supabase` · `apps/mobile` 부재 (`ls apps` = `web`, 루트에 `supabase` 없음).

## H7-4.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `stage-7-plan.md` rev 2 `APPROVED (2026-11-19, user)` (`D7-5`) — §12 `S7-D` 행 · §12.2 · §5.1 `M7-4` ✅ |
| Design Spec | `stage-7-design-spec.md` `APPROVED` (`D7-5`) — §2.3 · §2.3.1~§2.3.4 · §2.9(상세 행) · §3.6 · §3.7 · §3.8 · §9.1 · §9.2 · §10.3 (C-13 `C13-S7-1` · `C13-S7-7` · `C13-S7-9` — `D7-3`) ✅ |
| 결정 | `N7-04`(다이아몬드는 상세에만) · `N7-15`(점수 숫자 0) · `N7-16`(이름 동결) · `N7-23`(Back) · `N7-39` · `N7-42` · `N7-43` · `N7-44` · `N7-45` · `N7-49` ✅ |
| 선행 단위 | `S7-A`(H7-1) · `S7-B`(H7-2 — `DiamondChart.previous` · `legend`) · `S7-C`(H7-3 — `ROUTES.progressReport` · `progressReportPath`) ✅ |
| Backend | 없음 |

## H7-4.2 Figma 실측 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 시도 | 결과 |
|---|---|
| 로컬 Dev Mode MCP `127.0.0.1:3845/mcp` JSON-RPC (`initialize` → `tools/call get_metadata(16:2)`) | **`"No Figma window open"`** (`isError: true`) — 데스크톱 앱에 파일이 열려 있지 않다. 이후 `get_design_context` 도 같은 서버라 시도 불가 |
| 원격 Figma MCP (`plugin:product-management:figma`) | **인증 필요** 상태 — 이 세션에서 쓸 수 없다 |

- 이 화면은 **Figma 프레임이 없다** (Plan §0.1 `get_metadata(16:2)` 전수 · Spec §1 — `C13-S7-1` · `C13-S7-7` · `C13-S7-9`, `D7-3`). 새 프레임이 생겼는지 **이 세션에서 재확인하지 못했다** → design-agent Visual Gap 에서 `16:2` 재조회 권고.
- 재사용 recipe 의 선언값은 기존 실측을 썼다: `ProfileCard` = `163:2607`(Stage 6 · Spec §0.2 `[ctx]`) · 행 라벨 `#5e7370` → `--color-action-secondary-fg`(`163:2611`, Spec §0.3) · `NotableQuoteCard` = `163:2633`(S7-C 구현 그대로) · 다이아몬드 `previous` = 가값 `P-38`(Figma 없음).
- 이 단위에서 **새로 잰 Figma 값 0**. 허용 차이 후보(AD) 도 그래서 Figma 대비가 아니다 (H7-4.8).

## H7-4.3 ① `M7-4` 회고 체크 copy 이동 (선행 — 지시 순서대로 먼저 하고 회귀 확인 후 진행)

| 변경 | 파일 |
|---|---|
| **단일 정의** `REFLECTION_CHECK_ORDER` · `reflectionCheckLabels` (문구·순서·키 Stage 5 그대로) | 🆕 `apps/web/src/entities/reflection/copy.ts` · `entities/reflection/index.ts` export |
| `reflectionCopy.checks` = `reflectionCheckLabels` **참조**(중복 정의 0) · `ReflectionCheckKey` import 제거 | `features/reflection/copy.ts` |
| `REFLECTION_CHECK_ORDER` 를 entity 에서 import · feature 공개 진입점에서 `REFLECTION_CHECK_ORDER` 재export 제거(외부 사용 0 — grep) | `features/reflection/ui/ReflectionCard.tsx` · `features/reflection/index.ts` |

회귀 (이동 직후, 상세 작업 전):
- `pnpm typecheck` ✅ · `pnpm lint:boundaries` ✅ (1014 modules)
- vitest `reflection-card` · `stage5-copy` · `stage5-privacy` · `entities/reflection` → **4 files / 30 tests passed**
- Playwright **단독** 비교 모드(update 없음) — Stage 5 spec 7개(`reflection-card` · `reflection-title-overflow` · `session-complete` · `session-feedback` · `session-regression` · `stage5-cross-cutting` · `today-card-refresh`) → **140 passed (3.7m)** · `git status e2e/__screenshots__` 기존 파일 변화 0 (S7-B 의 `v2-material` 1건 그대로)

## H7-4.4 ② 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| Page | 🆕 `pages/progress/ReportDetailPage.tsx` | 조립만 — `useParams` → `<ReportDetailView reportId />`. slot 2개 미지정 |
| Page | 🆕 `pages/progress/ReportDetailTopBar.tsx` | `TopBar centered` *"4-week report"*(h1) + Back. 앱 안 기록 있음 → `navigate(-1)` · 없음(deep link) → `/progress` replace (`N7-23`) |
| Router | `app/router.tsx` | `/progress/reports/:reportId` = `StackLayout`(탭바 없음) + `RouteGuard` · 표 주석 1행 |
| Shared | 🆕 `shared/lib/in-app-history.ts` | `hasInAppHistory()` — RR `history.state.idx > 0` 읽기만 (쓰기 0) |
| Entity | `entities/report/reportKeys.ts` | `detail(id)` · `viewed(id)`(시도 표식) |
| Entity | 🆕 `entities/report/useReport.ts` | `GET /v1/reports/:id` · stale **Infinity**(불변 스냅샷) · code 그대로 전달 |
| Entity | 🆕 `entities/report/useMarkReportViewed.ts` | 최초 표시 1회 POST — `summary.viewed=true` 면 0 · 표식 있으면 0 · 성공 시 상세 캐시 `viewed=true` + overview·list 무효화 · 실패 무시·재시도 0 · 로그 0 |
| Entity 확장 | `entities/child-profile/PersonaCard.tsx` | `eyebrow?` · `footnote?` (Spec §3.8) + **`nameAs?`**(H7-4.7 ②) — 전부 미지정 시 DOM 불변 |
| Feature | 🆕 `features/report-detail/copy.ts` | Spec §10.3 · §2.9 · §9.2 문구 전부 (서버 문장은 여기 없음) |
| Feature | 🆕 `features/report-detail/model/reportDetailView.ts` | 순수 함수 — `evidenceRows`(Q6 배치 · null 제외) · `previousDiamondValues` · `growthSummary`(판정 0) · `dialogueRows` · `personaTimeline` · `checkTrendRows`(entity 라벨) · `quoteSource` |
| Feature | 🆕 `features/report-detail/ui/ReportDetailView.tsx` | header · ① Growth(다이아몬드 current + previous + 범례 + 근거 `dl`) · ② `PersonaHistory` · ③ 지표 `dl` 5행 + LATELY WE NOTICED · ④ 인용 1~2 · ⑤ 부모 피드백(빈 문구) · ⑥⑦ slot · 상태 Loading / Error / Offline / Not ready(`REPORT_NOT_READY`·`REPORT_NOT_ELIGIBLE`) / Not found(`RESOURCE_NOT_FOUND`) |
| Feature | 🆕 `features/report-detail/ui/PersonaHistory.tsx` | `ol` 타임라인 [rail 16 \| PersonaCard] · SINCE {MON D} / NOW · trigger 출처 · 1개 = rail 0 + *stayed the same* |
| CSS | 🆕 `features/report-detail/report-detail.css` (+ `styles/index.css` 등록) | 토큰만 · **새 `overflow` 0** · rail 점/선 = 기존 `--chart-vertex-size` · `T7-14` `--persona-rail-*` |
| 라우트 주석 | `shared/config/routes.ts` | "화면 등록 = `S7-D`" |

## H7-4.5 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| 37 | 단위 `report-detail.test.tsx` "섹션 순서 ①~⑤" (h2 순서 + `data-section` 순서 + 페르소나 위치) · e2e heading 구조 · baseline `s7-report-detail-main` |
| 38 | 단위 "다이아몬드 = 이전 점선 + 현재 · 범례 · 대체 텍스트" (`.haru-diamond__previous` 1 · 범례 2 · 카드 텍스트 숫자 0 · summary 에 방향/숫자 0) · `report-no-previous` · 과거 리포트(주기 1) = 점선·범례 0 · 모델 단위 `previousDiamondValues` · `growthSummary`(점수 뒤바꿔도 같은 문장) |
| 39 | 단위 근거 3행 = 서버 문장 그대로 · IM(`null`) 미렌더 · 응답 역순이어도 Q6 배치 |
| 40 | 단위 3항목 eyebrow `SINCE MAR 16` · `SINCE APR 20` · `NOW` · 이름 h3 · 출처 3종 전부 노출(`success`) · `report-persona-unchanged` · 주기 1 = rail 0 + *stayed the same* · 모델 trigger→copy 3종 |
| 41 | 단위 지표 5행 `9` · `1h 58m` · `146` · `64` · `19` · 0 그대로 · `%`/`vs`/`average`/`rank` 0 |
| 42 | 단위 인용 2장 = `NotableQuoteCard` · *IN EMMA'S WORDS* · `May 5 · The Most Magnificent Thing` · 책 제목 null → `Apr 22` |
| 43 | 단위 summaryText · 체크 행 = `entities/reflection` 라벨 + `5×`(aria-hidden) + SR *", 5 times"* · 주제 쉼표 나열 · 주기 1 = 빈 문구(카드·h2 유지) · `lint:boundaries` 위반 0 |
| 44 | 단위(StrictMode): `success`(viewed=true) POST 0 · `report-published-unviewed` POST **1** + 다른 화면 → 재진입 후에도 1 · Mock 목록 `viewed=true` · e2e 요청 로그 1 → 재진입 1 / `success` 0 |
| 45 | 단위 Loading(`aria-busy` · 스피너 0) · `reports:retry` 회복 · offline · `report-delayed`(pending id) Not ready · `report-deferred` = 같은 화면 · 모르는 id Not found(재시도 버튼 0 · 자동 재요청 0) · *Back to Progress* → `/progress` · baseline 3장 |
| 46 | e2e 카드 헤더 링크 → 상세 → Back = `/progress`(앱 안 기록) · deep link(기록 0) → Back = `/progress` · 미인증 `goto` → `/auth/*` → 로그인 + SPA 진입 → 상세 · 과거 목록 행 → 상세 · 단위 `hasInAppHistory` 7 케이스. **"로그인 후 원래 경로 복귀" 는 미구현** (H7-4.7 ⑥) |
| 47 | 서버 문장(summaryLine · evidence · persona · 신호 · summaryText · topics · 인용) = 응답 값 그대로 렌더 — Frontend 결합은 쉼표·`“ ” — 이름`·날짜 포맷만 · 모델 단위 "문장은 서버 값 그대로" |
| 48 | **PENDING** (`P7-BIP-06` · `07`) |
| 64 | e2e 콘솔·pageerror 에 *Emma* · 인용 · 책 · 페르소나 이름 · 리포트 id 0 · 새 코드 `console`/`devWarn` 0 |
| 67 · 83 | e2e heading 구조(h1 TopBar → h2 ×4 → 페르소나 h3 ×3) · `progressbar` 0 · 본문 인터랙티브 0(slot 빈 상태) · 렌더 텍스트 ≥ 11px · rail `aria-hidden` |
| 69 | `lint:boundaries` ✅ — `report-detail` → 다른 feature import 0 · Page 조립만 |
| 70 | `pnpm lint`(HEX · arbitrary) ✅ · 새 토큰 0 · **새 `overflow` 0** · `R-SHADOW-1` 세로·가로 프로브 = e2e ④ (320/393/600 — 클리핑 조상 = AppShell 뷰포트 1개 · 좌 2 · 우 2 · 아래 3 · 7px 모두 Δ>0) |
| 71 | e2e 320/393/600/1024 가로 스크롤 0 · 컬럼 ≤ 432 |
| 75 | H7-4.3 (lint:boundaries · grep · Stage 5 e2e 140 · baseline 변화 0) |
| 81 (PersonaCard) | 단위 `persona-card.test.tsx` 3건(미지정 = P·H2·P · `undefined` 명시 = 같은 innerHTML · 확장 렌더) + **HEAD(Stage 6) 컴포넌트를 임시 파일로 꺼내 innerHTML 대조 2 케이스 동일**(임시 파일 삭제) · Stage 6 baseline = 전체 e2e 비교 모드 통과(H7-4.6) |
| 84 | H7-4.8 (등록 0) |

## H7-4.6 검증 (2026-11-19)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ (1회차 2건: 테스트 probe 컴포넌트가 render 중 외부 변수 재할당(`react-hooks/globals`) → `useEffect` · e2e 셀렉터 문자열 `[tabindex]…` 가 arbitrary 규칙에 걸림 → role 기반 계수로 교체. 규칙 우회 0) |
| `pnpm lint:boundaries` | ✅ no dependency violations (1028 modules, 4143 dependencies) |
| `pnpm build` | ✅ · `pnpm assert:no-mocks` ✅ |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **223 files / 3282 tests** (신규: `report-detail.test.tsx` 21 · `reportDetailView.test.ts` · `persona-card.test.tsx` 3 · `in-app-history.test.ts` 2) |
| `pnpm test:e2e` (**단독**, 비교 모드) | 1회차 **835 passed · 5 failed (1.5h)** — 실패 5건 전부 `Test timeout 60000ms` 이고 이 단위와 무관한 spec(`reflection-card:290` · `session-feedback:311` baseline text-null · `session-prompts:1128` · `session-regression:252` · `settings-survey:59`). 실행 시간이 S7-C 18.4m 의 5배 — 머신 경합(메모리 *Playwright 단독* 의 허위 실패 증상). **5건 단독 재실행 → 15 passed (21.9s, 프로젝트별 포함)**. 신규 `e2e/report-detail.spec.ts` 22 포함. 기존 baseline 변화 0 |

개발 중 실패와 원인: ① 단위 "모르는 id 요청 1회" — StrictMode 첫 마운트 언마운트가 signal 을 쓰는 query 를 취소해 dev 에서 2회 요청 → 단정을 "오류 표시 뒤 자동 재요청 0" 으로 바꿨다(약화가 아니라 dev 전용 동작을 기대값에서 뺀 것) ② e2e 과거 목록 행 = `ListRow onPress`(button) — link 로 찾아 실패 → button 으로.

## H7-4.7 baseline — `R-BASELINE-1`

1. **기존 baseline 변화 0** — 전체 e2e 비교 모드 통과(위). Stage 5 회고(copy 이동) · Stage 6 프로필(`PersonaCard` 확장) 은 비교 통과 + 바이트 변화 0 (`git status`). `--update-snapshots=all` 은 돌리지 않았다(지시: `changed`) — 분해 대상 diff 없음.
2. **신규 6장** `e2e/__screenshots__/darwin/report-detail.spec.ts/` (`--update-snapshots=changed`, 이 spec 단독): `s7-report-detail-main`(393 전체 콘텐츠, `success`) · `s7-report-detail-first`(주기 1 — previous 0 · 페르소나 1 · 피드백 빈 문구 · 40자 이름) · `s7-report-detail-frame`(393×852, TopBar 포함) · `s7-report-detail-not-ready` · `s7-report-detail-not-found` · `s7-report-detail-offline`.
3. 조건: `hideDevPanel` · SPA 이동 뒤 `settleImages`(이미지 디코드 + rAF 2) · ready 상태 대기 후 촬영. 육안 확인: dev 패널 0 · Skeleton 0 · 과도기 프레임 0.

## H7-4.8 판단 · Spec 과 다르게 한 점 (QA · design-agent 확인 요청)

1. **Figma 재조회 불가** (H7-4.2) — 새 상세 프레임 유무를 이 세션에서 확인하지 못했다.
2. **`PersonaCard nameAs?` (Spec §3.8 에 없는 3번째 prop)** — 히스토리는 섹션 제목 h2 아래라 이름을 h3 로 둬야 heading 구조가 맞다(기존 h2 그대로면 h2 안에 h2 형제 3개). 기본 `h2` → Stage 6 DOM 불변.
3. **다이아몬드 = `DiamondChart` 직접 + `toCapabilityAxes`** — `CapabilityDiamond` 는 Stage 6 summary(강점·growing edge 문장)를 만들어 Spec §9.2 상세 문장과 다르다. Stage 6 컴포넌트를 바꾸지 않으려고 feature 에서 축·summary 를 조립했다.
4. **Not found 버튼 = `ErrorState` 의 retry 자리에 *Back to Progress*** — `ErrorState` 에 다른 action 자리가 없다. 동작은 이동이지 재시도가 아니다.
5. **viewed 1회 규칙** — 응답 `summary.viewed=true` 면 보내지 않는다(새로고침 후 재진입 포함 — 서버가 이미 안다) + 시도 표식 `reportKeys.viewed(id)`(로그아웃 `QueryClient.clear()` 로 함께 사라짐). 실패해도 표식은 남는다(재시도 0).
6. **AC-7-46 "로그인 후 원래 경로 복귀" 미구현** — Route Guard 에 복귀 경로 기능이 없다(`resolveGuardDecision` — Stage 5 `N5-10` 도 *로그인 후 SPA 진입* 으로 검증). 가드 변경은 앱 전체 동작이라 이 단위 범위 밖으로 두고 **보고**한다 → plan-agent / 사용자 판단.
7. **Back 판단 = RR `history.state.idx`** — `idx 0`(첫 진입) 이면 `/progress` replace. push 알림·새 탭 진입이 이 경우다.
8. **SINCE 날짜** — `effectiveFrom` 은 datetime 이라 **기기 시간대**로 월·일을 낸다(`formatMonthDay`, Stage 6 UpdateNote 선례) · 연도는 붙이지 않는다(Spec `SINCE {MON D}`). 보호자 시간대와 기기 시간대가 다르면 하루 어긋날 수 있다 → BIP 메모(H7-4.10).
9. **⑥ 클립 섹션은 slot 미지정이면 카드·제목째 미렌더** — 빈 *Highlight clips* 카드를 두지 않았다. `S7-E` 가 slot 을 꽂을 때 `ProfileCard h2 "Highlight clips"` 셸을 함께 만든다(클립 0 개면 섹션 미렌더 조건은 이미 view 에 있다).
10. **C-13 레이아웃 값 (가값 `P-39` 범위)** — rail ↔ 카드 간격 `--space-2` 8 · 타임라인 행 간격 `--space-3` 12 · 근거 행 dt↔dd `--space-1` 4 · SectionLabel ↔ 내용 `--space-2` · header 기간 ↔ 문장 `--space-1`. Spec 에 수치가 없어 기존 스케일에서 골랐다. rail 점 = eyebrow 첫 줄 가운데.
11. **Loading** — Spec "header text 2 → block h(차트+40) → block h200 ×2" 를 header `text 2` + 차트 카드(Stage 6 차트 Skeleton 식 — feature 간 import 금지라 같은 CSS 식을 이 feature 에 복제) + `ProfileCard` 안 `text 5` ×2 로 했다. `Skeleton` 에 높이 지정 block 이 없다.
12. **SectionLabel = Stage 6 recipe(caption-1 bold · tracking section-label)** — Spec §2.3.3·§2.3.4 는 이름만 적었다. S7-C H7-3.8 ⑬ 과 같은 판단.
13. **근거 `dl` 위 구분선은 행이 있을 때만** · 지표 값 `numeric`(tabular-nums).
14. `COMPONENT_MAP.md` 정정은 development-agent 문서 범위 밖이라 하지 않았다.

## H7-4.9 허용 차이 후보 (등록하지 않았다 — 최우선 규칙 6 · AC-7-84)

- **Figma 대비 후보 0** — 상세는 Figma 프레임이 없다(C-13). 재사용 recipe(`ProfileCard` · `NotableQuoteCard`)는 기존 단위의 후보(`AD7-8` eyebrow 색 · `AD7-10` radius 22)를 그대로 물려받는다.
- **Spec 대비 차이(design-agent Visual Gap 확인 요청, AD 아님)**: H7-4.8 ② `nameAs` · ④ Not found 버튼 위치 · ⑨ 빈 클립 섹션 미렌더 · ⑩ C-13 간격 값 · ⑪ Loading 블록 높이.

## H7-4.10 Mock 시나리오 전환 · BACKEND_INTEGRATION_PENDING

- `/auth/log-in?scenario=reports:<key>` 로그인 → *Progress* → 카드 헤더 링크 / 과거 목록 행, 또는 주소 `/progress/reports/<id>` 로 SPA 이동. id: `MOCK_REPORT_IDS.latest`(주기 2) · `.earlier`(주기 1 — 첫 리포트 · 페르소나 1 · 피드백 빈 · 40자 이름) · `.pending`(발행 전).
- 상세 화면별: `success` · `report-published-unviewed`(viewed 1회) · `report-persona-unchanged` · `report-no-previous` · `report-delayed` + pending(Not ready) · `report-deferred` + pending(`REPORT_NOT_ELIGIBLE` → Not ready) · 모르는 id(Not found) · `loading` · `error` · `offline` · `retry`.
- **새 BIP 0.** 이 단위가 화면으로 드러낸 기존 항목: `P7-BIP-06`(narrative·근거·신호·요약 생성 + 안전 검증) · `07`(스냅샷 불변 — stale Infinity 의 전제) · `11`(viewed 멱등 · 최초 시각) · `13`(소유권 — `RESOURCE_NOT_FOUND`) · `14`/`N7-16`(상세 이름 = 발행 시점 `childDisplayName`) · `16`(trigger 동결). 메모(새 ID 아님): `personaHistory[].effectiveFrom` 을 화면이 **기기 시간대**로 날짜화한다 — 보호자 시간대 경계 규칙(`P7-BIP-04` · `N7-13`)과 같은 기준이 필요하면 서버가 달력 날짜를 함께 주는 방안을 Handoff 에서 검토.

---

# `H7-5` `S7-E` — 하이라이트 클립 플레이어 (2026-11-20, development-agent)

Status: **HANDOFF** · 작업 단위 **`S7-E` 만**. PDF(`S7-F`)는 만들지 않았다 — 상세 ⑦ `pdfAction` slot 은 **비어 있다**(미지정 = 렌더 0). **커밋하지 않았다.**
`apps/api` · `supabase` · `apps/mobile` 부재 (`ls apps` = `web`, `ls -d supabase apps/api apps/mobile` → 전부 No such file).

## H7-5.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `stage-7-plan.md` rev 2 `APPROVED (2026-11-19, user)` (`D7-5`) — §12 `S7-E` 행 · §12.2 · §5.2(`clipKeys.playback`) · §5.4 · §5.6 · §5.7 클립 행 · §8 `highlight-clips` ✅ |
| Design Spec | `stage-7-design-spec.md` `APPROVED` (`D7-5`) — §2.3 ⑥ · §2.5 · §6 플레이어 · §7 클립 행 · §9.1 클립 버튼 · §9.4 · §10 클립 문구 · §14 `S7-E` (C-13 `C13-S7-3` — `D7-3`, `N7-46`) ✅ |
| 결정 | `N7-17`(만료/삭제 같은 문구 · 만료일 0) · `N7-18`(label) · `N7-20`(합성 WAV) · `N7-46`(IconButton + ProgressBar sm + 시간 · seek 0 · 불가 = 비활성) ✅ |
| 선행 단위 | `S7-A`(H7-1 — `highlightClips` API · Mock 8 key · 합성 WAV · 만료 2099/2025) · `S7-B`(H7-2 — `play`·`pause` 아이콘 · `T7-15` `--clip-row-gap`) · `S7-D`(H7-4 — ⑥ `clipList` slot) ✅ |
| Backend | 없음 |

## H7-5.2 Figma 실측 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 시도 | 결과 |
|---|---|
| 로컬 Dev Mode MCP `127.0.0.1:3845/mcp` — `initialize` → **200 OK**(서버 응답) → `tools/call get_metadata(16:2)` | **`"No Figma window open"`** (`isError: true`) — 데스크톱 앱에 파일이 열려 있지 않다 |
| 원격 Figma MCP (`plugin:product-management:figma`) | **인증 필요** — 이 세션에서 쓸 수 없다 |

- 플레이어는 **Figma 프레임이 없다** (Plan §16 `C13-S7-3` · Spec §1 행 8, `D7-3`). `16:2` 에 새 프레임이 생겼는지 **이 세션에서 재확인하지 못했다** — S7-D Visual Gap(`VG7-D-01`, 2026-11-20)은 "없음"이었다 → design-agent Visual Gap 에서 재조회 권고.
- 재사용 recipe 선언값은 기존 실측 그대로: `ProfileCard`(`163:2607`) · `IconButton glass`(`78:158`, `--shadow-bubble` 1겹 — `V-10`) · `ProgressBar sm`(`179:1779`). **새로 잰 Figma 값 0.**

## H7-5.3 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| Entity | 🆕 `entities/highlight-clip/clipKeys.ts` | `clipKeys.playback(clipId)` (Plan §5.2) |
| Entity | 🆕 `entities/highlight-clip/signedUrl.ts` | 순수 함수 — `isSignedUrlReusable`(만료 **30초 전**까지 캐시 재사용) · `isSignedUrlExpired`(받은 URL 이 이미 만료 = 재발급 트리거) · `isClipRetentionExpired`(`expiresAt` 경과 클립 = 조회 전 불가, `null` = 만료 아님) |
| Entity | 🆕 `entities/highlight-clip/usePlaybackUrl.ts` | 명령형 핸들 `peek`(동기 · 유효 캐시) · `fetch`(stale 0 · retry 0) · `discard`. **자동 조회 `useQuery` 아님** — 탭 전 호출 0 (AC-7-49) |
| Entity | 🆕 `entities/highlight-clip/HighlightClipRow.tsx` · `highlight-clip.css` (+ `styles/index.css` 등록) | 표시 전용 행 — grid [44 \| 1fr] · `IconButton glass` · 라벨 · 날짜 · `ProgressBar sm` + 시간 · live `<p>` 1개 |
| Feature | 🆕 `features/highlight-clip-player/model/clipPlayerState.ts` | 순수 reducer — 행 상태 6종 + 이벤트 9종 · `formatClipTime`(m:ss) |
| Feature | 🆕 `features/highlight-clip-player/model/useClipPlayer.ts` | 부수 효과 — 공유 `<audio>` 1개 · URL 조회/재발급 1회 · `play()` 결과 분류 · 이벤트 구독(`timeupdate`·`ended`·`pause`·`waiting`·`playing`·`error`) · `visibilitychange` · unmount 정리 · 늦은 응답 토큰 폐기 |
| Feature | 🆕 `features/highlight-clip-player/ui/HighlightClipList.tsx` · `copy.ts` · `index.ts` | `ProfileCard` h2 *Highlight clips* + `ul` + `<audio preload="none">` · 상태 → 행 props 매핑(`clipRowView`) · 문구 |
| Page | `pages/progress/ReportDetailPage.tsx` | `clipList` slot 에 `HighlightClipList` 를 꽂는다 (조립만 — 재생 처리 0) · `pdfAction` 미지정 유지 |
| 새 토큰 · 새 Shared UI · `packages/*` 변경 | — | **0** (`T7-15` 는 S7-B 가 이미 정의) |

상태 머신 (Plan §5.4 · Spec §2.5):

```
idle | paused | error ─탭─▶ loading ─play() 성공─▶ playing ─탭─▶ paused
loading: peek(캐시 유효) → 바로 src · play()  |  없으면 fetch → src · play()
         받은 URL 만료 · play() 미디어 오류 → URL 폐기 + 재발급 1회 → 다시 실패 = error
         RECORDING_DELETED → unavailable(종착) · NetworkError → error/offline · 그 밖 → error/generic
playing ─ended─▶ idle(위치 0)   playing ─waiting─▶ loading   playing ─미디어 error─▶ error
다른 행 탭 → 이 행 paused(위치 유지) · src 교체 (동시 재생 1)
화면 이탈 · 문서 숨김 → paused + pause() + src 제거 + load()
```

## H7-5.4 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| 49 | 단위 `highlight-clip-player.test.tsx` "idle"(preload none · src 0 · 요청 0 · 라벨 · *May 5* · `0:00 / 0:12` · `aria-valuemax 12`) · "재생·일시정지·진행"(요청 1 · WAV src · `timeupdate` → `aria-valuenow 4.6` · `0:04 / 0:12` · 일시정지 → 재개 요청 0) · "ended → 0:00" · e2e ① 실제 Chromium(디코드 duration 12 · `paused=false` · 실제 seek 의 timeupdate → `0:04 of 0:12`) · reducer 단위 |
| 50 | 단위 "둘째 클립 → 첫 클립 Play(위치 0:03 유지) · src 교체 · audio 1개 · 재개 시 캐시 재사용(요청 2 유지) · `currentTime 3`" · e2e "재생 중인 media 요소 1개" · reducer "다른 클립 requested → 이전 paused" |
| 51 | 단위 `clip-url-expired`(요청 **2** → 재생 · 빈 오디오 src 0) · 미디어 오류 1회 → 요청 2 → 재생 · 재발급 뒤에도 실패 → error(요청 2에서 멈춤) → 다시 탭 = 새 URL · NotAllowedError = 재발급 0 · e2e `clip-url-expired`(요청 2 · 재발급 URL 이 12초 WAV) |
| 52 | 단위 `recording-deleted`(불가 문구 · `aria-disabled` · *Clip unavailable:* · 진행 숨김 · 다시 눌러도 요청 1) · `clip-expired`(둘째 = 조회 **전** 불가 · 요청 0 · 날짜 표시 0) · reducer "unavailable 은 종착" · e2e 같은 2 시나리오(+ aria-disabled 버튼 포커스 가능) |
| 53 | 단위 "문서 숨김 → src 제거 · load · paused · 재탭 위치 5" · "화면 이탈 → pause · src 제거" · "재생 도중 미디어 error → error · src 제거" · 콘솔 spy 에 URL/id/라벨 0 · e2e Back(정착 대기 후 `paused` · src 0) · 숨김 · 콘솔 수집 |
| 54 | 버튼 이름 *Play clip: {label}* / *Pause clip: …* / *Clip unavailable: …* · 행 live `<p aria-live=polite>` 1개(처음 빈 문자열 → *Playing.* / *Paused.* / 오류·불가 문구) · e2e 44 열 · 버튼 38 · hit 44 |
| 55 | **PENDING** (`P7-BIP-10`) |
| 64 · 65 | 콘솔 0(위) · 로그아웃 = `QueryClient.clear()` 가 `clipKeys.playback` 캐시를 지움(단위) · 이탈 정지(위) |
| 67 | heading h2 *Highlight clips* (`report-detail` e2e heading 표 갱신) · progressbar = 클립 2 · 본문 버튼 = 클립 2 · 텍스트 ≥ 11px(기존 e2e 가 ⑥ 포함해 통과) |
| 69 | `lint:boundaries` ✅ — `report-detail` ↔ `highlight-clip-player` import 0 · page 조립만 |
| 70 · 72 | `pnpm lint`(HEX · arbitrary) ✅ · 새 토큰 0 · **새 `overflow` 0** · `R-SHADOW-1` 버튼 그림자 세로·가로 프로브 320/393/600(클리핑 조상 = AppShell 뷰포트 1개 · 좌 2 · 우 2 · 아래 3 · 7px 전부 Δ>0) · baseline H7-5.6 |
| 71 | 기존 `report-detail` 반응형 e2e 320/393/600/1024 가 ⑥ 포함 상태로 통과 |
| VG7-D-11 | 단위 "첫 리포트(클립 0) + slot 있음 → 섹션 · audio 미렌더" |

## H7-5.5 검증 (2026-11-20)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ (1회차 1건: `exactOptionalPropertyTypes` — `onPress: undefined` 전달 → 조건부 spread 로 수정) |
| `pnpm lint` | ✅ (1회차 2건: `no-useless-assignment`(루프 지역 변수) → `attachedRef` 직접 비교로 정리 · `jsx-a11y/media-has-caption` → 근거 주석 + 1줄 비활성, H7-5.7 ⑬) |
| `pnpm lint:boundaries` | ✅ no dependency violations (1041 modules, 4191 dependencies) |
| `pnpm build` | ✅ · `pnpm assert:no-mocks` ✅ (sentinel · dev · sharp 0건) |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **226 files / 3319 tests** (신규: `highlight-clip-player.test.tsx` 19 · `clipPlayerState.test.ts` 15 · `signedUrl.test.ts` 3 · `report-detail.test.tsx` 2건 갱신). ⚠️ 1회차(갱신 전 · load average 22 — 다른 프로젝트 세션의 `find /` 경합) **1045s · 12 failed** 전부 `session-ready` · `session-recording` 등 Stage 4 파일의 `Test timed out in 5000ms` → 같은 코드 재실행 **54s · 3317 passed**. 최종 코드 재실행 3319 passed |
| `pnpm test:e2e` (**단독**, 비교 모드) | ✅ **862 passed · 0 failed (22.0m)** — 신규 `e2e/highlight-clip.spec.ts` 22(기능 12 · 그림자 3 · baseline 7) 포함 · `report-detail.spec.ts` 22 갱신 통과. 기존 baseline 변화 0(`git status e2e/__screenshots__` = S7-B 의 `v2-material` 1건 그대로 · `report-detail` 6장 중 `main` 만 02:08 재생성, 나머지 mtime 11-19 그대로) |

개발 중 실패와 원인: ① 단위 "재발급 뒤에도 실패 → 재탭 = 새 URL" — 실패한 URL 이 캐시에 남아 재탭이 조회 없이 재생 → 미디어 오류로 실패한 URL 은 버리도록 수정(H7-5.7 ⑦) ② 단위 정리 순서 — 파일 `afterEach` 가 스텁을 먼저 걷어 언마운트 정리가 jsdom 미구현 `pause/load` 를 부름 → `cleanup()` 을 스텁 해제 앞으로 ③ e2e 실제 재생 — 헤드리스 재생 시계 정지(H7-5.7 ⑪) → seek 기반 단정으로 ④ e2e `aria-disabled` 버튼 `click()` 이 actionability 대기로 시간 초과 → `dispatchEvent('click')` ⑤ e2e Back — URL 변경(라우터 전이 시작)이 언마운트 커밋보다 빨라 즉시 단정이 실패 → `expect.poll` 로 정착 대기 ⑥ 첫 전체 e2e 를 소스 수정(재생 도중 `error` 처리) 때문에 중단했는데 `pkill -f "playwright test"` 가 `cli.js test` 프로세스와 맞지 않아 **옛 실행이 계속 돌았다** → PID 로 종료 후 전체를 처음부터 다시 단독 실행(위 결과).

## H7-5.6 baseline — `R-BASELINE-1`

1. **신규 7장** `e2e/__screenshots__/darwin/highlight-clip.spec.ts/` — `s7-clips-idle` · `-loading` · `-playing` · `-paused` · `-unavailable` · `-error` · `-offline` (393, 카드 영역 `REGION_SNAPSHOT`). 조건: `hideDevPanel` · SPA 이동 뒤 `settleImages` · 카드 `scrollIntoView` 후 `settle` · 재생 위치 결정성 = **`play()` 스텁**(resolve | pending) + `currentTime` getter 고정 4 + `timeupdate` (실제 재생 시계는 러너에서 정지 — H7-5.7 ⑪). 버튼 포커스 blur 후 촬영.
   - **1차 생성분 폐기 후 재생성**: 첫 생성에서 ① 시간 텍스트가 줄바꿈(`0:04 /` ↵ `0:12`) ② reduced-motion `Spinner` 라벨 *Loading* 이 38px 버튼 밖으로 넘침 — 육안 확인으로 발견 → CSS 수정(H7-5.7 ⑨ ⑩) 후 디렉터리를 지우고 `--update-snapshots=changed` 로 다시 만들었다. 7장 육안 확인: dev 패널 0 · 과도기 0 · 줄바꿈 0.
2. **기존 1장 변경** `report-detail.spec.ts/s7-report-detail-main.png` — 비교 모드에서 실패(345×2516 → 345×2534) → **분해**: 픽셀 연결성분 **1개**, 행 2326~2515 전 폭 = ⑥ *Highlight clips* 카드가 붙은 자리(크롭 육안 확인), 행 0~2325 차이 0. 원인 = 이 단위의 의도된 추가. 다만 2600 뷰포트에서 콘텐츠가 넘쳐 카드가 잘리므로 테스트의 "전체 콘텐츠" 의도대로 **뷰포트 2600 → 2900** 으로 올리고 이 테스트만 `--update-snapshots=changed`. 재생성본 vs 이전본 행 0~2325: 채널 최대 Δ **5**(>8 = 0) — 뷰포트 높이에 따라 늘어나는 앱 배경 gradient · backdrop blur 차이로 설명됨, 콘텐츠 변화 0. 새 이미지 345×2816 · 아래 크롭 육안 확인(카드 전체 + 하단 여백).
3. 그 밖의 기존 baseline 변화 0 (전체 e2e 비교 모드 — H7-5.5).

## H7-5.7 판단 · Spec 과 다르게 한 점 (QA · design-agent 확인 요청)

1. **Figma 재조회 불가** (H7-5.2) — 로컬 서버는 살아 있으나 파일 미오픈.
2. **진행 막대 낭독 = 시간** (지시: 모호하면 해석을 기록) — Spec §2.5 는 `role="progressbar"` 만, Plan §5.7 클립 행은 "재생 위치는 비교·달성률이 아니며 시각 텍스트 *0:04 / 0:12* 와 같은 정보 · 정보 전달 = 시간 텍스트". `aria-valuetext` 가 없으면 SR 은 **퍼센트**를 읽는다. 해석: **퍼센트 대신 시간을 읽힌다** — `aria-valuetext = "0:04 of 0:12"`, 옆의 보이는 시간 텍스트는 같은 정보라 `aria-hidden`(중복 낭독 방지). role · `aria-valuenow`(초) · `aria-valuemax`(길이) 는 유지.
3. **Spec 에 문장이 없는 SR 문구 4개** (`features/highlight-clip-player/copy.ts`): live *Playing.* · *Paused.* (Spec §9.1 "재생 시작·정지 알림" 요구), progressbar 이름 *Clip progress: {label}*(행마다 구별), 값 *{elapsed} of {total}*. 진단·비교 표현 0 (`of 7` 류 grep 대상 아님 — 분자가 시간).
4. **ended = `idle` + 위치 0** — Spec 표의 7행 중 *ended* 는 표시가 idle 과 같아 별도 상태로 두지 않았다 → 상태 6종(Plan §12.2).
5. **오디오 요소 1개 공유** — 동시 재생 1개를 구조로 보장. 다른 클립으로 옮기면 이전 클립은 **위치를 기억한 paused**(Spec: "해당 행이 paused 로 돌아가는 것뿐")이고, 다시 누르면 캐시 URL 로 그 위치부터 이어 듣는다. 이탈·숨김 뒤 재탭도 같다.
6. **문서 숨김(`visibilitychange: hidden`) = 탭 전환** 으로 해석해 정지 + src 제거 (Plan §5.4 "화면 이탈·탭 전환·로그아웃"). 상세 화면에는 앱 탭바가 없다(`StackLayout`).
7. **재발급 트리거 2가지를 같은 1회로 센다** — ① 받은 URL 의 `expiresAt` 이 이미 지남 ② `play()` 가 `NotAllowedError`·`AbortError` 외로 거절(미디어 오류 — 403 류). 재생에 실패한 URL 은 캐시에서 버린다(다음 탭 = 새 조회). `NotAllowedError`(자동재생 차단)는 URL 문제가 아니라 재발급 없이 error(URL 은 캐시에 남아 다음 탭은 **동기** `play()`).
8. **재생 도중 미디어 `error` 이벤트** → error 상태 + URL 폐기 (Spec 표의 error 행에 포함된다고 봄 — 실제 Storage 스트림 끊김 대비. Mock 은 재현하지 않고 단위 테스트만).
9. **불가 버튼 dim** — `IconButton.css` 의 `:disabled` 규칙은 `aria-disabled` 에 닿지 않는다. 공유 규칙을 바꾸지 않고 `.haru-clip-row__button` 안에서만 `--opacity-disabled` + `cursor: default` + `:active` scale 0 (`entities/survey/survey.css` 선례). 누름 무시는 `onPress` 미지정.
10. **reduced-motion 로딩** — `Spinner` 는 reduced-motion 에서 라벨 *Loading* 을 보이게 하는데 38px 버튼 밖으로 넘쳐 라벨과 겹쳤다(1차 baseline) → 이 버튼에서만 라벨 `display: none` (S7-C `.haru-report-card__status` 선례). 정지한 arc 가 아이콘을 대신하고 SR 은 버튼 `aria-busy`. ⚠️ reduced-motion 사용자에게 로딩 텍스트가 보이지 않는다 — design-agent 확인 요청.
11. **헤드리스 Chromium 재생 시계 정지** (실측) — 이 러너의 `chrome-headless-shell`(`--mute-audio`, 출력 장치 없음)에서 합성 WAV 가 `readyState 4 · duration 12 · paused=false` 인데 `currentTime` 이 **0.064s 에서 멈춘다**(700ms × 4 샘플). 그래서 e2e 는 실제 **seek** 로 `timeupdate`(→ `0:04 of 0:12`)와 `ended`(→ idle) 를 확인하고, 시간이 저절로 흐르는 재생은 **NOT VERIFIED**(수동: 실기기 Safari/Chrome 에서 12초 재생 → 진행 막대 · 시간 · 끝에서 play 아이콘).
12. **iOS Safari 제스처 위험 (NOT VERIFIED)** — 첫 탭은 URL 조회(`await`) 뒤 `play()` 라 iOS 가 사용자 제스처 밖으로 보고 `NotAllowedError` 를 낼 수 있다 → 그 경우 error 문구 *Tap play to try again* → 두 번째 탭은 캐시 URL 로 **동기** `play()` 라 통과할 것으로 예상. 완화안(승인 시): 탭 핸들러 안에서 `audio.load()` 로 요소를 먼저 unlock. 실기기 확인 필요(AC-7-62 와 같은 수동 묶음 권고).
13. **`jsx-a11y/media-has-caption` 규칙 1줄 비활성** — 컨트롤 없는 `<audio>` 는 렌더되지 않고(UA `display: none`), 조작·상태는 버튼 이름 · live 문구 · 서버 캡션(label)이 전달한다. 자막 원문(transcript)은 아동 데이터라 클립 contract(C7-5)에 없다. 선례: `dev/recording-measure/RecordingMeasurePage.tsx`. 접근성 판단은 design-agent · QA 확인 요청.
14. **C-13 레이아웃 값 (가값 `P-39` 범위)** — 행 내부 줄 간격 `--space-1` 4 · 진행 행 막대↔시간 `--space-2` 8 · 시간 `nowrap` · 행 간격 `--clip-row-gap`(T7-15) 12 · 열 44 = `--icon-button-hit-size`. Spec 에 줄 간격 수치가 없어 기존 스케일에서 골랐다.
15. **오류 문구 위치** — error 상태는 진행 행 **아래**에 문구(Spec: 진행 "유지" + 보조 문구), unavailable 은 진행 행 대신 문구.
16. **`RESOURCE_NOT_FOUND`(모르는 클립)** = 일반 error (Spec 은 `RECORDING_DELETED` 만 불가로 규정).
17. **시계** — 보관·URL 만료 판단은 기기 시계(`createSystemClock`, 테스트는 주입). Mock 값(2099 / 2025)은 영향 없음. 기기 시계가 크게 틀리면 판단이 어긋난다 → BIP 메모(H7-5.9).
18. **테스트 갱신(약화 아님 — S7-E 가 slot 을 채운 결과)**: `report-detail.test.tsx` · `e2e/report-detail.spec.ts` 의 "⑥ slot 비어 있음 · progressbar 0 · 본문 인터랙티브 0" 단정을 "h2 +*Highlight clips* · progressbar = 클립 2 · 본문 버튼 = 클립 재생 2 · ⑦ PDF slot 비어 있음" 으로 바꿨다. `s7-report-detail-main` 뷰포트 2600 → 2900 (H7-5.6 ②).
19. 클립 0개 + slot 있음(`VG7-D-11`) — 섹션 · `<audio>` 미렌더 (view 의 기존 조건, 단위 확인).
20. `COMPONENT_MAP.md` 정정(`HighlightClipPlayer` → `HighlightClipRow` + feature)은 development-agent 문서 범위 밖이라 하지 않았다 (H7-4.8 ⑭ 와 같다).

## H7-5.8 허용 차이 후보 (등록하지 않았다 — 최우선 규칙 6 · AC-7-84)

- **Figma 대비 후보 0** — 플레이어는 Figma 프레임이 없다(C-13).
- **Spec 대비 차이 (design-agent Visual Gap 확인 요청, AD 아님)**: H7-5.7 ② 시간 낭독 · ③ SR 문구 · ⑤ 위치 기억 · ⑨ dim 범위 · ⑩ reduced-motion 라벨 숨김 · ⑭ C-13 간격 · ⑮ 오류 문구 위치. Visual Gap 대상 = Plan §12.2 `S7-E` 행 "플레이어 상태 6종" → baseline 7장(H7-5.6 ①).

## H7-5.9 Mock 시나리오 전환 · BACKEND_INTEGRATION_PENDING

- `/auth/log-in?scenario=highlight-clips:<key>` (여러 그룹은 쉼표 — 예 `reports:success,highlight-clips:clip-expired`) 로그인 → *Progress* → 카드 헤더 링크, 또는 `/progress/reports/<MOCK_REPORT_IDS.latest>` SPA 이동 → ⑥.
- key: `success`(합성 WAV 12s · 15s) · `loading`(1.5s 지연 → 버튼 Spinner) · `error` · `retry`(첫 탭 오류 → 다시 탭 재생) · `offline` · `clip-expired`(둘째 클립 조회 전 불가 + playback `RECORDING_DELETED{expired}`) · `recording-deleted`(전부 탭 후 불가) · `clip-url-expired`(클립별 첫 URL 만료 → 재발급 1회). 클립 0 = `MOCK_REPORT_IDS.earlier`(섹션 미렌더).
- **새 BIP 0.** 이 단위가 화면으로 드러낸 기존 항목: `P7-BIP-10`(private Storage · 만료 signed URL · 보관 `OAQ-13` · 삭제 cascade — `P5-BIP-14` 승계) · `07`(발행 리포트 불변이지만 클립 재생은 삭제·만료 시 `RECORDING_DELETED`) · `13`(소유권 — 남의 클립 = `RESOURCE_NOT_FOUND`). 메모(새 ID 아님): ① signed URL `expiresAt` 은 **서버 시각**이고 Frontend 는 기기 시각으로 비교한다(재사용 여유 30초) — 기기 시계 오차가 크면 만료 URL 로 `play()` → 미디어 오류 → 재발급 1회 경로로 회복한다. 서버는 **오디오 길이보다 충분히 긴 만료**(권고 ≥ 5분)를 주면 재생 중 만료가 없다 ② 403 을 미디어 오류로만 구분할 수 있으므로(`<audio>` 는 HTTP status 를 노출하지 않는다) 만료 URL 은 **403 류로 빨리 실패**해야 재발급이 빠르다 ③ Range 요청 지원(seek 없음이지만 이어 듣기 `currentTime` 설정에 필요) — Handoff `RECORDING_UPLOAD_SPEC` / `BACKEND_HANDOFF` 클립 절에서 검토.

---

# `H7-6` `S7-F` — 4주 리포트 PDF (2026-11-20, development-agent)

Status: **HANDOFF** · 작업 단위 **`S7-F` 만** (Stage 7 마지막 구현 단위). 카드 `pdfAction` slot · 상세 ⑦ slot 을 채웠다. **커밋하지 않았다.**
`apps/api` · `supabase` · `apps/mobile` 부재 (`ls apps` = `web`, `ls -d apps/api supabase apps/mobile` → 전부 No such file).

## H7-6.1 Gate

| Gate | 결과 |
|---|---|
| Plan | `stage-7-plan.md` rev 2 `APPROVED (2026-11-19, user)` (`D7-5`) — §12 `S7-F` 행 · §12.2 `S7-F` 행 · §5.2(`reportKeys.pdf`) · §5.3 · §5.5 · §5.6 · §8 `report-pdf` · §11.8 AC-7-56~63 ✅ |
| Design Spec | `stage-7-design-spec.md` `APPROVED` (`D7-5`) — §2.2(카드 action slot) · §2.3 ⑦ · §2.6 `C13-S7-4` · §7 PDF 행 · §9.1 PDF · §10.4 · §11.1 `AD7-9` · §14 `S7-F` ✅ |
| 결정 | `N7-19`(Web Share Port + 저장 대체 — `D7-4`) · `N7-24`(두 진입점 · 같은 key) · `N7-33`(`Button md`) · `N7-40` ⓐ(ready 후 자동 저장 0 · Save/Share 탭 핸들러 — `D7-5`) ✅ |
| 선행 단위 | `S7-A`(H7-1 — `reportPdf` API · Mock 10 key · 가짜 PDF `data:` URL · 만료 2099 · `FileSharePort` Web+Mock) · `S7-B`(H7-2 — `arrow-down-to-line` · `share` 아이콘) · `S7-C`(H7-3 — 카드 `pdfAction` slot) · `S7-D`(H7-4 — 상세 ⑦ slot) ✅ |
| Backend | 없음 |

## H7-6.2 Figma 실측 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 시도 | 결과 |
|---|---|
| 로컬 Dev Mode MCP `127.0.0.1:3845/mcp` — `initialize` → **200 OK** · `notifications/initialized` → `tools/call get_metadata(16:2)` | **`"No Figma window open"`** (`isError: true`) — 데스크톱 앱에 파일이 열려 있지 않다 (H7-5.2 와 같은 상태) |
| 원격 Figma MCP (`plugin:product-management:figma`) | **인증 필요** — 이 세션에서 쓸 수 없다 |

- **`16:2` 에 PDF 프레임이 새로 생겼는지 이 세션에서 확인하지 못했다.** 마지막 조회 = S7-D Visual Gap `VG7-D-01`(2026-11-20, "없음" — 노드 이름 검색 report/clip/pdf 계열 = 기존 노드뿐) → **design-agent Visual Gap 에서 재조회 권고**.
- `110:835` · `110:854` 선언값은 기존 실측을 그대로 썼다 (새로 잰 Figma 값 0): H7-3.2 `get_metadata(110:835)` — 카드 345×230.5 · 진행 행 `110:850` y108 h11.5 · **버튼 `110:854` y133.5 313×50** · footer `110:860` y197.5 h17 / Spec §0.2 `[ctx]` — 버튼 **h50 pill teal · 아이콘 17 `arrow-down-to-line` white gap 9 · 라벨 Bold 15/15 white · drop `0 2 2 / 0 12 14 / 0 28 28`**.

## H7-6.3 구현

| 영역 | 파일 | 내용 |
|---|---|---|
| Entity | `entities/report/reportKeys.ts` | 🆕 `reportKeys.pdf(reportId)` — 카드 · 상세 공유 기록 (서버 캐시가 아니라 상태 머신 소유 메모리 기록 · 로그아웃 `clear()` 가 지운다) |
| Entity | 🆕 `entities/report/useReportPdfRequests.ts` | 명령형 핸들 `request(reportId, IK, signal?)` · `getStatus(reportId, signal?)` — 자동 조회 `useQuery` 아님 (요청 = 탭, 간격·상한 = 상태 머신) |
| Entity | 🆕 `entities/report/loadReportPdfFile.ts` | `ready` signed URL → `fetch` → `arrayBuffer` → `File(application/pdf)` · `isReadyReportPdfStatus` · 오류 메시지에 URL/파일명 0 |
| Feature | 🆕 `features/report-pdf/model/reportPdfState.ts` | 순수 reducer — 단계 7종(`idle` · `requesting` · `generating` · `ready` · `failed` · `timeout` · `offline`) · 이벤트 5종 · 늦은 응답(다른 시도 키) 무시 |
| Feature | 🆕 `features/report-pdf/model/useReportPdf.ts` | POST = **탭 핸들러**(effect 아님 — StrictMode 이중 effect 로 POST 2회 방지) · GET 폴링 = effect(`generating` + 화면 있음) 2s / 60s(contracts `REPORT_PDF_POLL_*`) · `ready` → 파일 미리 받기 · save/share = 포트 동기 호출 · 공유 거절 → 안내 플래그 |
| Feature | 🆕 `features/report-pdf/ui/ReportPdfAction.tsx` · `copy.ts` · `index.ts` · `report-pdf.css` (+ `styles/index.css` 등록) | Spec §2.6 표 그대로 — idle `Button accent md fullWidth` + `arrow-down-to-line` · loading · ready = `ButtonGroup`(primary Save accent · secondary Share glass + Lucide `share`) 또는 Save 1개 · failed/timeout/offline = `InlineAlert` + `Button glass md fullWidth` *Try again* · live region 1개(`role="status"`) |
| Page | `pages/progress/ProgressPage.tsx` · `ReportDetailPage.tsx` | 두 slot 에 `ReportPdfAction` 을 꽂는다 (조립만) |
| Shared UI | `packages/ui/src/button/ButtonGroup.css` | **버그 수정** — 자동 stack(`@container width < 360`)에서 자식 `flex: 1 1 0` 이 남아 basis 0 이 버튼 `block-size` 45 를 덮었다(실측 **25px 로 눌림**). 세로일 때 `flex: none` (H7-6.7 ①) |
| 테스트 조립 | `app/providers/AppProviders.tsx` · `test/harness.tsx` | `AppProviders` 에 `fileShare?` 주입 prop(기존 `pushPermission` 과 같은 모양 — `ApiClientProvider` 로 그대로 전달) · harness 기본 = Mock 포트(저장 기록만) · `harness.fileShare` 노출 |
| 새 토큰 · 새 `overflow` · contracts 변경 | — | **0** |

상태 머신 (Plan §5.3 · Spec §2.6):

```
idle ─탭─▶ requesting (POST · IK) ─queued|generating─▶ generating ─GET 2s…─▶ ready 응답 → 파일 받기 → ready
                                  ─ready(멱등 재요청)──▶ 바로 파일 받기 → ready
requesting|generating ─status failed─▶ failed(serverFailed) ─Try again─▶ 시도+1 · **새 IK**
                      ─그 밖 오류────▶ failed              ─Try again─▶ **같은 IK** (서버가 받았을 수 있다)
                      ─NetworkError──▶ offline             ─Try again─▶ 같은 IK
           generating ─60s─────────▶ timeout (폴링 중단)   ─Try again─▶ 같은 IK
ready ─Save 탭─▶ port.saveFile (동기)   ready ─Share 탭─▶ port.shareFile (동기 호출) → cancelled = 변화 0 · 거절 = 안내
진행 중 · ready 의 재탭 = 무시 (중복 POST 0)   화면 이탈 = 폴링만 멈춤 → 다른 진입점이 뜨면 같은 기록으로 이어서 폴링
```

## H7-6.4 AC 매핑 (판정은 QA)

| AC | 증거 |
|---|---|
| 56 | 단위 `__tests__/report-pdf.test.tsx` "카드: Download PDF(idle) → loading + Preparing… → ready …"(버튼 `aria-busy` · live = *Preparing…* · GET 은 2s 전 0 → 2s 에 1 → 4s 에 2 · ready live = *Your PDF is ready.* · **ready 도달 시 포트 기록 0** · Save 탭 = 저장 1(파일명 `.pdf` · 크기 > 100)) · reducer 단위 "파일 받음 → ready — 저장·공유는 상태가 아니다" · e2e ① 실제 Chromium **`download` 이벤트 ready 시 0 → Save 탭 1** · `suggestedFilename` · 파일 앞 5바이트 `%PDF-` · 남은 `a[download]` 0 |
| 57 | 단위 "진행 중 재탭 = 중복 POST 0 (StrictMode)"(탭 3회 · `request` 호출 1 · IK = uuid) · reducer "진행 중 · ready 의 start 무시 — 같은 객체" · e2e ② 재탭(click + dispatchEvent ×2) → 요청 로그 POST 1 |
| 58 | 단위 `pdf-failed`(alert 문구 2줄 · Try again → POST 2 · **IK 2개 서로 다름**) · `pdf-timeout`(58s 안내 0 → 60s 안내 · GET 28~30 · 이후 20s GET 증가 0 · Try again = **같은 IK**) · `offline`(문구 2줄 · Try again) · `retry`(POST 실패 → 재시도 → GET 실패 → 재시도 → ready, POST 3) · e2e ③ `pdf-failed` · `pdf-timeout`(`page.clock` + `advanceUntil` 70s) · `offline` |
| 59 | 단위 "저장 · 공유는 같은 tick 에 포트 호출"(spy 가 `fireEvent.click` 직후 동기로 1회 · `File` type `application/pdf` · title) · `share-unsupported` = Save 1개 · `share-cancelled` = innerHTML 불변 · alert 0 · NotAllowedError = live *Your PDF is ready.* + *Sharing isn't available here…* · Save 여전히 가능 · e2e ③ 같은 3종(+ 393 세로 2단 · 600 가로 2열 각 45) |
| 60 | Web 포트 `saveFile` = blob URL → 다음 task `revokeObjectURL`(S7-A `web-file-share` 단위) · e2e "남은 a[download] 0" · 단위 `Storage.setItem` pdf/report 키 0 · e2e local/sessionStorage 에 `pdf` 문자열 0 · `File` 은 `reportKeys.pdf` 메모리 기록에만 |
| 61 | 단위 "상세에서 준비 → Progress 카드도 ready · 새 요청 0"(POST 1 · GET 2 그대로) · "생성 중 이탈 → 폴링 멈춤 · 다른 진입점에서 이어서 → ready (POST 1 · GET 4)" · e2e ② 상세 → Back → 카드 Save PDF · 요청 증가 0 · 상세 ⑦ = 본문 마지막 요소 · 비발행 카드(첫 주기 · 생성 중) PDF 영역 0 |
| 62 | **NOT VERIFIED 예상** — iOS Safari 실기기 공유 시트 · 저장 (Chromium 만 자동). 수동: iPhone Safari 에서 `/progress` → Download PDF → Share → 시트 표시 · 취소 시 변화 0 · Save PDF → 파일 앱/미리보기 |
| 63 | **PENDING** (`P7-BIP-09`) |
| 64 | 단위 console spy 에 파일명 · `data:application/pdf` · *Emma* · `e7e7e7e7` 0 · e2e ④ 같은 정규식 0 |
| 65 | 단위 "로그아웃 = `QueryClient.clear()` 가 PDF 기록(File 포함)을 지운다" (`useSignOut` → `clear()` 는 기존 S7-E 근거와 같다) |
| 67 · 70 · 71 · 72 | 버튼 hit = Button md 45 ≥ 44 · 이름 = 라벨 · live 1개 · `pnpm lint`(HEX · arbitrary) ✅ · 새 토큰 0 · **새 `overflow` 0** · `R-SHADOW-1` 세로·가로 프로브 카드 · 상세 × 320/393/600 = 6건(아래 H7-6.5) · baseline H7-6.6 |
| 69 | `lint:boundaries` ✅ — `progress-overview` · `report-detail` ↔ `report-pdf` import 0 · page 조립만 |
| 76 | e2e ⑤ PDF 대상 = `latestReport.id` (상세 경로의 같은 id 와 기록 공유로 간접 확인) |

## H7-6.5 검증 (2026-11-20)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ (HEX · arbitrary 규칙 포함) |
| `pnpm lint:boundaries` | ✅ no dependency violations (1050 modules, 4234 dependencies) |
| `pnpm build` | ✅ (청크 크기 경고만 — 기존과 같다) · `pnpm assert:no-mocks` ✅ (sentinel · dev · sharp 0건) |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **228 files / 3343 tests** (신규: `__tests__/report-pdf.test.tsx` 17 · `features/report-pdf/__tests__/reportPdfState.test.ts` 7 · `report-detail.test.tsx` 1건 갱신) |
| `pnpm test:e2e` (**단독**, 비교 모드 · 최종) | ✅ **886 passed · 0 failed (23.4m)** — 신규 `e2e/report-pdf.spec.ts` 24(기능 8 · 기하 3 = `110:835` 1 + ready 2버튼 2 · 그림자 6 · baseline 7) |
| 1차 전체 e2e (단독, 비교 모드) | 874 passed · **12 failed** — 전부 baseline/단정이 이 단위 변화로 바뀐 것(H7-6.6 분해). 시간 초과 · 손대지 않은 spec 의 실패 **0** → 단독 재실행 대상 없음 |

`R-SHADOW-1` 프로브 (e2e ⑥, 버튼 그림자 off ↔ on 채널합 Δ — 좌 2px · 우 1px · 아래 2 · 6px):

| 위치 | 320 | 393 | 600 | 클리핑 조상 |
|---|---|---|---|---|
| 카드 | 21 · 33 · 89 · 73 | 19 · 31 · 88 · 72 | 21 · 33 · 88 · 72 | AppShell 뷰포트 1개(폭 = 뷰포트) |
| 상세 ⑦ | 14 · 23 · 63 · 53 | 11 · 50 · 77 · 63 | 13 · 22 · 63 · 51 | 같다 |

ready 2버튼 (e2e): 393 = 세로 2단 각 313×45 · gap 12 / 600 = 가로 2열 각 194×45 · gap 12.

개발 중 실패와 원인: ① 단위 — fake-timers 가 tick 중 예약된 `setTimeout(0)`(TanStack 알림 배치)을 1ms 로 바꿔 `advance(0)` 으로 화면이 안 바뀜 → 테스트 helper 가 1ms 더 흘리고 실제 이벤트 루프 1바퀴(`realSetTimeout` 2ms) ② 단위 `retry` — 끝난 GET 신호를 effect 정리에서 abort → Mock 시도 카운터 되돌림 → **제품 코드 수정**(H7-6.7 ⑨) ③ e2e 첫 baseline — ready 2버튼 25px 로 눌림 → **ButtonGroup 수정**(H7-6.7 ①).

## H7-6.6 baseline — `R-BASELINE-1`

1. **신규 7장** `e2e/__screenshots__/darwin/report-pdf.spec.ts/` — `s7-pdf-generating`(pdf-timeout 으로 생성 지속) · `-ready-share` · `-ready-save` · `-failed` · `-offline` · `-timeout`(`page.clock` + `advanceUntil`) · `-detail-ready`(상세 ⑦). idle = 기존 `s7-report-card-published` 갱신본. 조건: `hideDevPanel` · SPA 이동 뒤 `settleImages` · 카드 `scrollIntoView` · 누른 버튼 blur · `settle`. 7장 육안 확인: dev 패널 0 · 과도기 0. ⚠️ **ready 2장은 1차 생성분을 폐기**(버튼 25px 눌림 — ButtonGroup 버그) → 수정 후 재생성.
2. **기존 baseline 변경 — 1차 전체 e2e 비교 모드 실패분을 픽셀 연결성분(Δ>8, 8-이웃 반경 2)으로 분해:**

| baseline | 분해 | 원인 · 확인 |
|---|---|---|
| `progress/s7-report-card-published` · `-no-previous` | 154 → 213 · 성분 1개 y124~153 전 폭 | 버튼 삽입(+45 + gap 14). 위 124행 Δ 0 |
| `progress/s7-progress-main` | 성분 1개 y1064~1270 전 폭 (+ 그 안 4px 2개 Δ9) | 카드 버튼 · 아래 과거 목록 밀림 |
| `progress/s7-progress-frame` | 성분 0 (최대 Δ 8 · 339px) | **런타임 토글**: `.haru-report-pdf{display:none}` 주입 시 기존 baseline 과 **일치(통과)** → 원인 = 버튼(긴 페이지 → 배경 · blur 미세 차) |
| `report-detail/s7-report-detail-main` · `-first` | 성분 1개 각 y2554~2628 · y1430~1504 전 폭 | ⑦ 추가(간격 20 + 45 + 그림자). 위쪽 Δ 0. 뷰포트 2900 안에 들어간다 |
| `highlight-clip/s7-clips-error` · `-offline` | 성분 1개 재생 버튼 둘레(x29~76) Δ21 | **런타임 토글**: ⑦ 숨김 시 7장 전부 기존과 일치 → 원인 = ⑦ 추가로 스크롤 위치가 바뀌어 **클릭 뒤 포인터가 버튼 위에 남던 hover 그림자**가 빠짐. 즉 기존 baseline 이 **hover 상태를 담고 있었다**(과도 상태). → 테스트 `snapCard` 에 `page.mouse.move(0, 0)` 추가(포인터 치움) 후 재생성 — 이 때문에 `-loading` · `-playing` 도 hover → rest 로 재생성. `-idle` · `-unavailable` 은 Δ≤7 이라 비교 통과(재작성 안 됨) |
| `visual/v1-button` | 698 → 744 · 성분 2개: ① y511~697 = ButtonGroup 데모 ② y0~42 | ① **기존 baseline 이 ButtonGroup 눌림 버그를 담고 있었다**(inline 데모가 361 컬럼 안 329 컨테이너 → 자동 stack → 버튼 ~20px). 수정 후 각 45. ② 섹션이 46px 길어져 gallery **sticky 칩 내비가 섹션 위 42px 를 덮는다**(기존도 5px 덮임) — 테스트 레이어 기존 결함, 이 단위에서 고치지 않았다 → **QA 확인 요청** (H7-6.7 ⑱) |

   재생성 = 대상 spec 만 `--update-snapshots=changed` (지시대로). 재생성 후 위 표의 파일만 mtime 이 바뀌었다(11장). 그 밖의 기존 baseline 변화 0 — 최종 전체 e2e 비교 모드 886 통과.

## H7-6.7 판단 · Spec 과 다르게 한 점 (QA · design-agent 확인 요청)

1. **`ButtonGroup` 자동 stack 버그 수정 (Shared UI)** — 첫 baseline 에서 ready 2버튼이 **25px** 로 눌려 있었다(육안 발견 → 원인: `@container (width < 360px)` 가 방향만 column 으로 바꾸고 자식 `flex: 1 1 0` 을 남겨 basis 0 이 `block-size` 를 덮음). 저장소의 `ButtonGroup` 소비처는 dev gallery 와 이 단위뿐이고 gallery 는 360 이상 또는 명시 `stacked` 라 이 경로를 밟은 적이 없다. 수정 = 자동 stack 일 때 자식 `flex: none` (명시 `stacked` 와 같은 모양). 회귀 = e2e "ready 버튼 2개 393 세로 각 45 · gap 12 / 600 가로 각 45 · gap 12" + 전체 e2e 의 gallery baseline.
2. **ready 2버튼 배치 = 393 에서 세로 2단** — Spec §2.6 은 *"ButtonGroup 가로 2"* 인데 `ButtonGroup` 규칙(§4.4 "폭 360 미만 자동 stacked")이 카드 안 313 · 상세 345 에서 늘 세로로 만든다. 600·1024(컬럼 480 → 카드 안 448)에서만 가로. **Spec 서술과 Shared UI 규칙의 충돌** → design-agent 결정 요청(ⓐ 지금처럼 세로 ⓑ 이 자리만 `layout` 고정 가로 — 313 에 버튼 2개 각 150).
3. **DOM · 시각 순서 = Share → Save** — `ButtonGroup` 은 secondary → primary 순서(Figma `86:372`)를 강제한다. Spec 표기 순서는 *Save · Share*. primary = Save(accent), secondary = Share(glass) 로 넣어 세로에서 Share 가 위다 → design-agent 확인 요청.
4. **loading 버튼 = Shared `Button` 의 기존 표현** — Spec *"라벨 유지 · Spinner"* 는 `Button loading` 이 라벨을 `opacity 0` 으로 폭만 유지하고 Spinner 를 가운데 두는 기존 동작으로 충족했다. **reduced-motion 에서는 `Spinner` 가 *Loading* 라벨을 보인다**(§9.2 공용 규칙) — baseline `s7-pdf-generating` 이 그 모습(Playwright 기본 reduced-motion). 공용 규칙이라 바꾸지 않았다.
5. **offline `InlineAlert` tone = `offline`** — Spec §2.6 표기 *`tone="error"`(기존 offline 표현)* 은 두 가지로 읽힌다. 괄호의 "기존 offline 표현" = 저장소 offline 표현(`tone="offline"`, `wifi-off` 아이콘 — Session Feedback · Activity deck 선례)으로 해석했다. 결과: role = `status`(error 면 `alert`) → design-agent 확인 요청.
6. **timeout 의 role** — Spec §9.1 *"failed/timeout `InlineAlert`(role alert)"* 이지만 Spec §2.6 이 timeout 을 `tone="info"` 로 정해 `InlineAlert` 가 `role="status"` 를 낸다. tone 을 따랐다.
7. **IK 정책** — Plan §5.3 *"Idempotency-Key = reportId+attempt"* 를 **시도 단위 uuid 하나**(`createIdempotencyKey`, 저장소 관례)로 구현하고 기록에 담아 두 진입점이 같은 키를 쓴다. 시도는 **서버가 `failed` 를 확정했을 때만** 올린다(새 키). 네트워크 실패 · 일반 오류 · 시간 초과 뒤 재시도는 같은 키(서버 최초 응답 재생 — Mock 도 그렇게 동작). 이유: 응답 유실 뒤 새 키를 쓰면 서버에 같은 리포트 작업 요청이 두 번 간다.
8. **폴링 상한 기준 시각 = 탭 시각(`startedAt`)** — 화면을 떠났다 돌아와도 같은 60s 창을 쓴다(이탈 중 시간이 상한을 넘었으면 돌아오자마자 timeout). 재시도는 새 창.
9. **끝난 요청은 abort 하지 않는다** — 폴링 effect 정리에서 이미 응답이 온 GET 의 신호를 abort 하면 Mock `consumeAttempt` 가 `retry` 시도 카운터를 되돌려(`releaseAttempt`) 재시도가 다시 1회차 실패가 됐다(단위 `retry` 에서 발견). 진행 중 요청 1개만 abort 한다 — 실제 Http 에서도 끝난 요청 취소는 의미가 없다.
10. **포커스 이동 (Spec 에 없음 — 접근성 판단)** — 단계가 바뀌며 누른 버튼이 사라지면(loading → Share/Save · 실패 → Try again) 포커스가 body 로 떨어진다. **포커스가 이 영역 안에 있었을 때만** 새 첫 버튼(세로 2단에서는 Share)으로 옮긴다. 영역 밖(예: 헤더 링크)에 있으면 건드리지 않는다(단위 2건).
11. **live region 1개 상시** — `role="status"` 를 늘 두고 내용만 바꾼다(비어 있으면 높이 0). *Preparing…*(보임) → *Your PDF is ready.*(SR 전용 `haru-visually-hidden`) → 공유 거절 시 안내 문장 추가. `InlineAlert` 는 자기 role 이 있어 영역 밖(중첩 live 0).
12. **새 문구 1개** — `shareTitle` *"HARU 4-week report"* (`navigator.share({ title })` — OS 공유 시트 제목, Spec 에 없음). 아이 이름 · 기간 0.
13. **파일 받기 = `fetch(signed URL)`** — `entities/report/loadReportPdfFile`. Mock `data:` URL · Http signed URL 둘 다 같은 경로. 응답을 `arrayBuffer` 로 받아 `File` 을 만든다(realm 무관). Backend 메모: signed URL 은 **CORS 로 앱 origin 의 `fetch` 를 허용**해야 한다(아래 H7-6.9).
14. **C-13 간격 (가값 `P-39` 범위)** — 버튼 ↔ *Preparing…* · 안내 문장 8(`--space-2`) · `InlineAlert` ↔ *Try again* 12(`--space-3`) · *Try again* = `fullWidth`(Spec 은 폭 미지정 — idle 버튼과 같은 폭). 카드 안 위아래는 기존 본문 gap 14 가 맡는다.
15. **상세 ⑦ 위 간격 = 섹션 간격 20 그대로** — Spec §2.3 *"mt --space-3"* 과 S7-D `report-detail.css` 주석("섹션 간격 자리로 둔다")이 다르다(S7-D Visual Gap 미결 질문). 이 단위는 기존 CSS 를 바꾸지 않았다 → design-agent 결정 대기.
16. **`share` 결과 `'shared'`** — 표시 변화 0 (Toast 없음 — Spec §2.6 "저장 완료 Toast 없음" 과 같은 원칙).
17. **테스트 갱신(약화 아님 — S7-F 가 slot 을 채운 결과)**: `report-detail.test.tsx` "⑦ PDF slot 은 아직 비어 있다" → "본문 버튼 = 클립 2 + *Download PDF* 1 · ⑦ = 본문 마지막 요소" · `e2e/report-detail.spec.ts` 본문 버튼 2 → 3(+ *Download PDF*) · `e2e/highlight-clip.spec.ts` `snapCard` 포인터 치움(H7-6.6 ②).
18. **gallery sticky 내비 겹침 (`v1-button`)** — 기존 테스트 레이어 결함이 섹션 높이 변화로 커졌다(5 → 42px). 고치려면 `visual.spec.ts` 공용 촬영 경로(gallery 내비 가림 또는 스크롤 여백)를 바꿔야 해 범위 밖으로 남겼다 → QA · Orchestrator 판단 요청.
19. **열린 사용자 결정 미변경** — BarChart 라벨 줄높이(`VG7-B-03`) · TopBar(`C-02`) · `5×` 메타 톤(`C-04`) · 캐릭터 top(`D-08`) 손대지 않았다.
20. `COMPONENT_MAP.md` · `API_CONTRACTS.md` 변경 0 — contract 변경 없음(기존 C7-6 그대로), COMPONENT_MAP 정정은 development-agent 문서 범위 밖(H7-5.7 ⑳ 과 같다).

## H7-6.8 `110:835` 카드 재비교 · 허용 차이 후보 (등록하지 않았다 — 최우선 규칙 6 · AC-7-84)

Figma 재조회 불가(H7-6.2) — Figma 값은 H7-3.2 실측 · Spec §0.2 선언값, 구현 값은 e2e ⑤ 브라우저 실측(393×852, `getBoundingClientRect` · computed).

| 요소 | Figma `110:835` | 구현 | Δ · 원인 |
|---|---|---|---|
| 카드 | 345 × **230.5** | 345 × **212** | −18.5 = 줄 높이 흡수 −12.5(VG7-C-11, 🆕 후보) + 버튼 −5(`AD7-9`) − 1(반올림) |
| 진행 행 → 버튼 간격 | 14 (y119.5 → 133.5) | **14** | 0 |
| 버튼 top (카드 기준) | 133.5 | **124** | −9.5 = 위쪽 줄 높이 누적(VG7-C-11 진행 막대 −7) + 막대 행 11.5 → 7(`AD7-4` span 미렌더) |
| 버튼 크기 | 313 × **50** | 313 × **45** · left 16 | `AD7-9` (`N7-33` ⓐ `Button md`) |
| 버튼 라벨 | Bold **15**/15 white | **17** · weight 590 (`Button md` headline) | `AD7-9` 범위 |
| 버튼 아이콘 | 17 · gap 9 | **20** (`--size-icon-md`) · Button 기존 gap | 🆕 후보 — `AD7-9` 에 "아이콘 17 → 20" 포함 제안 |
| 버튼 그림자 | drop `0 2 2 / 0 12 14 / 0 28 28` | `Button accent` 기존 그림자 | Spec §0.3 "기존 Button 규칙(AD-3 선례)" — 새 후보 아님 |
| 버튼 → footer 간격 | 14 (183.5 → 197.5) | **14** | 0 |
| radius | pill | 9999px | 0 |
| footer | *"… · we'll email it too."* | *"Next report on Jun 7"* | `AD7-3` |

- **허용 차이 후보 정리**: `AD7-9`(h50→45 · 라벨 15→17 · 🆕 아이콘 17→20) · 줄 높이 🆕 후보(H7-3.9) · `AD7-3` · `AD7-4`. **이 단위가 등록한 것 0.**
- C-13 상태 7종(`C13-S7-4`)은 Figma 프레임이 없다 → Figma 대비 후보 0. Spec 대비 차이는 H7-6.7 ②③④⑤⑥⑩⑭⑮.

## H7-6.9 Mock 시나리오 전환 · BACKEND_INTEGRATION_PENDING

- `/auth/log-in?scenario=report-pdf:<key>` (여러 그룹은 쉼표 — 예 `reports:success,report-pdf:pdf-failed`) 로그인 → *Progress* 카드(발행 상태에서만 버튼) 또는 `/progress/reports/<MOCK_REPORT_IDS.latest>` ⑦.
- key: `success`(POST → GET generating 1회 → ready, 약 4s) · `pdf-generating`(generating 3회 → ready, 약 8s) · `pdf-failed`(첫 작업 failed → Try again = 새 작업 → ready) · `pdf-timeout`(계속 generating → 60s 지연 안내) · `share-cancelled`(Share = 취소, 표시 변화 0) · `share-unsupported`(Save 1개) · `loading` · `error` · `retry` · `offline`.
- 저장(Mock 모드 브라우저) = Mock 포트가 Web 포트로 위임 → 실제 다운로드. 공유만 Mock.
- **새 BIP 0.** 이 단위가 화면으로 드러낸 기존 항목: `P7-BIP-09`(PDF 생성 · 멱등 · 파일명 · signed URL · 생성 시간 ≤ 60s 상한과 짝). 메모(새 ID 아님 — Handoff `BACKEND_HANDOFF` PDF 절 · `RECORDING_UPLOAD_SPEC` 와 같은 Storage 정책에서 검토): ① 화면은 `ready` 에서 **signed URL 을 `fetch` 로 미리 받는다** → Storage 가 앱 origin 에 대해 **CORS GET 허용** · `Content-Type: application/pdf` 필요 ② signed URL 만료는 받기에 충분해야 한다(권고 ≥ 5분 — 받은 뒤에는 메모리 `File` 로 저장·공유하므로 만료와 무관) ③ 같은 리포트 재요청(다른 키) = 같은 작업 · `failed` 뒤에만 새 작업(Mock 규칙 그대로) ④ 파일명에 아이 이름을 넣으면 OS 공유 시트 · 다운로드 폴더에 남는다 — 넣을지는 `P7-BIP-09` 결정 대상.

---

# H7-7 — `D7-6` 결정 반영 (2026-11-20, development-agent)

## H7-7.1 Gate

- Plan · Spec `APPROVED (2026-11-19, user)` — `D7-5`. S7-A~F 완료(H7-1~H7-6).
- `D7-6`(2026-11-20, `docs/decisions/stage-7-approvals.md`) — Visual Gap 결정 대기 일괄. 선택지 상세 = `docs/design/stage-7-visual-gap.md` 각 VG 항목 · `## Stage 7 결정 대기 종합`.
- 범위 = 아래 8항목만. `VG7-F-03` ⓐ(세로 stack 수용) · `VG7-F-06` ⓐ(공유 제목 승인)은 Spec 정정 = design-agent 몫이라 **코드 변경 0**. 허용 차이 등록(`D7-6` ⑪)도 이 단위가 하지 않는다 — 최종 수치만 아래 H7-7.5 에 제공.
- `apps/api` · `supabase` · `apps/mobile` 부재 확인(`ls apps` = `web`). commit 0.

## H7-7.2 항목 → 변경 → 증거

| # | 결정 | 변경 | 증거 |
|---|---|---|---|
| 1 | `VG7-B-03` ⓑ | Tier 3 **`--bar-chart-label-line: 11px`** 신설(`component/index.css` T7-4) · `BarChart.css` 값/요일 라벨 `line-height` + 막대 `calc()` 줄 항 교체 · `DESIGN_TOKEN_MAP` 행 추가 · token-tiers 323 → **324** | e2e `stage7-shared-ui` 트랙 **62**(`toBeCloseTo(62)`) + 라벨 computed `line-height` 전부 `11px` · baseline `s7-bar-chart` 재생성 |
| 2 | `VG7-C-02` ⓑ | `--progress-character-top` **14 → 4** (Figma y70 − 66). 스택은 같은 식에서 y290 → **280** | e2e `progress` ① 캐릭터 (24, **4**) 347×422 · 스택 y**280** · 겹침 146 · StatTile 행 y280 · 신규 "TopBar ↔ 캐릭터 상대 거리 4"(Figma 70 − 66) |
| 3 | `VG7-C-04` ⓐ | 공유 `TopBar.css` — `.haru-top-bar--large:has(> .haru-top-bar__leading:empty)` = `minmax(0,1fr) auto` 2열 | e2e: Progress chip 오른쪽 끝 **369** · 2열 / Library trailing 오른쪽 끝 **369** · 2열 · 제목 x24 / **Home = 3열 · leading `flex` · trailing 오른쪽 369 그대로**(leading 이 있어 조건 밖) — Home baseline 변화 0(전체 e2e) |
| 4 | `VG7-D-08` · `VG7-E-06` · `VG7-F-05` | `tone="tertiary"` → **`"secondary"`**: 상세 ⑤ `5×` 메타 (`ReportDetailView`) · 클립 시간 (`HighlightClipRow`) · PDF *Preparing…* · 공유 불가 문장 (`ReportPdfAction` 2곳) | baseline 분해 표 — 해당 글자 영역만 변화 |
| 5 | `VG7-E-05` ⓑ | 행 grid 에 `row-gap 4` · 본문 열 `display: contents` → 라벨 · 날짜 · 진행 · 문구가 2열 행. 버튼 `grid-row: 1 / span 3` = 라벨·날짜·진행 묶음 가운데. 오류/offline 문구 = 4행(다음 줄). 불가 문구 = 진행 자리(3행)에서 진행 행 높이 유지(`min-block-size: --text-body--line-height` · 가운데) | 신규 e2e "재생 버튼은 어느 상태에서도 움직이지 않는다": 버튼 중심(행 top 기준) idle **33** = error **33** = offline **33** · 불가(2행) **33** = idle 2행 **33** (이전 error +24) |
| 6 | `VG7-E-04` | live `<p>` 자체에 caption-1 크기 · 줄 높이(16). 노드 그대로(같은 `<p>`) | 같은 e2e: 문구 `line-height` **16px** · 높이 16 배수(2줄 32, 이전 44) · `s7-clips-error/-offline` 카드 높이 256 → **244**(−12) |
| 7 | `VG7-E-10` ⓑ | `useClipPlayer.toggle` — URL 조회가 필요한 탭(붙지 않음 · 캐시 URL 없음)에서 **조회 전 동기 구간**에 공유 `<audio>` 에 `play()` 1회(`unlockForGesture`, 거절 · 동기 예외 무시). 붙어 있거나 캐시 URL 이면 기존대로 동기 `play()` 라 생략. `preload="none"` 유지 · 탭 전 조회 0 | 단위 4건(`highlight-clip-player.test.tsx`): 호출 순서 **`unlock`(조회 0 · src 없음 · preload none) → 조회 1 → src(WAV) → `play`** · click 동기 구간 끝 시점에 이미 `unlock` · 거절 · 동기 예외 → 오류 문구 0 · 콘솔 0 · 재개/캐시 URL = unlock 0. 실제 Chromium e2e(재생 · 동시 재생 · 재발급 · 불가 · 오류) 회귀 0 |
| 8 | AC-7-46 | `shared/lib/return-path.ts` (탭 메모리 1칸 + `toSafeReturnPath`) · `useGuardDecision` — 미인증 리다이렉트 시 `pathname+search+hash` 기억, 인증 사용자가 `/auth/*` 밖 화면에 **도달(allow)** 하면 지움, **이 Guard 가 인증 상태를 본 적이 있으면 기억 안 함(로그아웃 · 세션 만료)** · `resolveGuardDecision` 규칙 6 목적지 = `returnPath ?? Home`(순수 함수 유지) · `LogInPage` 성공 = `peek() ?? Home` · 테스트 하네스가 매번 비움 | 단위: `return-path.test.ts`(허용 5 · 거절 14 — 절대 URL · `//` · `/\` · 역슬래시 · `javascript:` · `data:` · 상대 · 탭 · 개행 · 공백 · 빈 값 · `/auth/*` · `/auth` · 비문자열) · `resolveGuardDecision` 2건(규칙 6 목적지 · 게이트 우선) · `login-return-path.test.tsx` 8건(리포트 복귀 · query 보존 · Guard 규칙 6 경로 · 콘솔 0 · 복귀 없음 → Home · 동의 누락 → consent · 온보딩 미완료 → start · 로그아웃 후 로그인 → Home) / e2e `report-detail`: 실제 `page.goto` 미인증 → Welcome → Log in → **`/progress/reports/:id` 상세 ready** · 콘솔에 id/경로 0 · 복귀 없음 → Home |

## H7-7.3 검증 (2026-11-20)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm lint:boundaries` | ✅ no dependency violations |
| `pnpm build` | ✅ (청크 크기 경고만 — 기존과 같다) |
| `pnpm test` | ✅ **230 files / 3379 tests** (신규 `login-return-path.test.tsx` · `return-path.test.ts` · 클립 unlock 4 · Guard 2). ⚠️ `design-tokens` `fonts.test` 는 **빌드 산출물 manifest** 를 읽는다 — 토큰 수가 바뀐 직후 build 전에 돌리면 323 ≠ 324 로 실패하고 build 후 통과(첫 실행에서 실제로 겪음) |
| `pnpm format:check` | ✅ |
| `pnpm test:e2e` 1차 (단독, 비교 모드) | 870 passed · **19 failed** — 18 = baseline(아래 분해) · 1 = 신규 AC-7-46 테스트의 Back 단정(⑤ 판단) |
| `pnpm test:e2e` 최종 (단독, 비교 모드) | ✅ **890 passed · 0 failed (20.4m)** — 신규 e2e 5건(클립 버튼 고정 1 · Home TopBar 1 · Progress 상대 거리 1 · Library 칩 1 · AC-7-46 복귀 없음 → Home 1) + AC-7-46 복귀 1건 교체. 시간 초과 · 손대지 않은 spec 실패 0 → 단독 재실행 대상 없음 |

## H7-7.4 baseline — `R-BASELINE-1` §5 분해 (Δ 채널합 > 15, 반경 3 연결성분, 후보 이동별 잔차)

**런타임 토글(§6)**: 이 단위의 시각 원인 6개(`--bar-chart-label-line` 13 · `--progress-character-top` 14 · TopBar `:has` 규칙 · 클립 행 레이아웃/문구 줄 높이 · tone 3종)를 **임시로 되돌리고** 실패 18장을 포함한 29개 baseline 을 비교 모드로 돌렸다 → **29 전부 기존 baseline 과 일치(통과)**. 즉 18장의 diff 는 전부 이 원인들이며 그 밖의 변화 0. 되돌림은 원복 후 재확인.

| baseline | 성분 | 원인 |
|---|---|---|
| `visual/s3-library` · `-empty` · `-favorites-empty` | 각 2개 · y3~42 x238~368(주간 칩) | **C-04** — shift(+20, 0) 잔차 **0** · 그 밖 Δ 0 (제목 · 본문 불변) |
| `progress/s7-progress-frame` · `s7-week-sheet` | TopBar 칩 3개 y3~42 → shift(+20,0) 잔차 **0** · 캐릭터 대성분 y37~405 → shift(0,−10) 잔차 495/60660(제목 · 칩 뒤 합성 경계) · StatTile · 주간 카드 성분 → shift(0,−10) 잔차 **0** · 막대 영역 잔차 ≈180 | **C-04** + **C-02**(본문 −10) + **B-03**(막대 트랙 · 라벨 줄 — 같은 −10 위에 막대 높이 변화) · 합성 경계 잔차는 토글로 확인 |
| `progress/s7-progress-main` · `-empty-week` · `-error` | 칩 y0~2 shift(+20,0) 잔차 0 · 캐릭터/본문 shift(0,−10) 잔차 0~194 · 막대 성분 | 같다 (empty-week y502 20px = 스텁 · 요일 줄 위치 — B-03) |
| `stage7-shared-ui/s7-bar-chart` | 27개 — 값 라벨 7 · 막대 위끝 7 · 요일 7 · 스텁 | **B-03** — 트랙 58 → 62(비례라 막대마다 이동량이 다르다, 단일 shift 아님 · 토글로 확인) |
| `report-detail/s7-report-detail-main` | 11개 — x314~327 y2160~2229 3개(`5×` 메타 3행) · x271~328 y2427~2434 · y2505~2512 각 4개(클립 시간 2행) | **D-08** · **E-06** 색만 — 클립 버튼 · 행 위치 Δ 0 (idle) |
| `report-pdf/s7-pdf-generating` | 10개 · y180~190 x44~300 (*Preparing…* 한 줄 글자들) | **F-05** 색만 |
| `highlight-clip/s7-clips-idle` · `-loading` · `-playing` · `-paused` | 각 8개 · 시간 텍스트 2행 x271~328 | **E-06** 색만 — 버튼 · 막대 Δ 0 (idle 모양 불변) |
| `highlight-clip/s7-clips-unavailable` | 11개 · 1행 시간 4 + 2행 문구 글자 y175~189 6 | **E-06** + **E-04**(문구 줄 상자 body strut → 16, 진행 자리 높이 22 유지 → 카드 높이 208 그대로) |
| `highlight-clip/s7-clips-error` · `-offline` | 27·26개 · 버튼 y72~129(위로 24) · 문구 y120~159(줄 22 → 16) · 2행 이하 shift(0,−12) 잔차 **0** · 카드 아래끝 잔차 3 · 시간 색 | **E-05**(버튼 고정) + **E-04**(2줄 44 → 32, 카드 256 → **244**) + **E-06** |

재생성 = 해당 6 spec 을 grep 범위로 `--update-snapshots=changed`. 재생성된 파일 = 위 **18장뿐**(mtime 확인). 육안: dev 패널 0 · 과도기 0 (`s7-clips-error` · `s7-progress-frame` 확인).

## H7-7.5 허용 차이 최종 수치 (등록은 사용자/Orchestrator — 이 단위는 등록 0)

| 후보 | 최종 수치 |
|---|---|
| `AD7-7` 결과 항목 | 막대 트랙 최대 **62** (Figma 63, **Δ−1**) — 라벨 글자 10/10.5 → 11 흡수분. 줄 높이는 Figma leading 1.0 그대로(11) · 막대 아래끝 Δ−1~2 해소 |
| `VG7-C-02` | 허용 차이 **0** — 제목 행 y0 · 캐릭터 y4 · 스택 y280 · 겹침 **36**(Figma 동일) · 제목 아래 ↔ StatTile 거리 Figma 와 같다 |
| `VG7-C-04` | 허용 차이 **0** — Progress chip · Library 칩 오른쪽 끝 **x369** (Figma `31:118` · `30:90`) |
| `VG7-D-08` · `E-06` · `F-05` | 새 가값 0 — ink-500(`P-01` 범위). F-05 카드 아래쪽 면 대비 2.71 은 `P-01` 값 목록 기록 대상(design-agent) |

## H7-7.6 판단 (QA · design-agent 확인 요청)

1. **불가 상태 진행 자리 높이 22 유지** — E-04 로 문구 줄이 16 이 되자 불가 행 3행이 22 → 16 으로 줄어 버튼이 **3px** 위로 갔다(실측). 지시 "버튼은 어느 상태에서도 움직이지 않는다"에 따라 3번째 자리 문구에만 `min-block-size: var(--text-body--line-height)` + 가운데. 22 의 출처 = 진행 행 시간 span 이 body 줄 상자를 상속(기존 idle 높이 — 바꾸지 않음). 토큰 신설 0.
2. **본문 열 `display: contents`** — live `<p>` 노드 · DOM 순서 그대로 두고 grid 에 참여시키려는 선택. div 라 접근성 트리 영향 없음(역할 없는 wrapper).
3. **unlock 은 URL 조회가 필요한 탭에서만** — 캐시 URL · 붙은 클립은 이미 제스처 안 동기 `play()` 라 생략. 빈 요소 `play()` 의 Chromium 동작(거절)은 e2e 재생 시나리오 전부 회귀 0 으로 확인. **iOS 실기기 = NOT VERIFIED** → 아래 수동 절차.
4. **복귀 경로 저장 = 탭 메모리** — storage · URL 에 쓰지 않는다(닫으면 소멸, 로그 0). 실제 OAuth 처럼 전체 페이지를 떠나는 로그인은 값을 잃는다 → **BACKEND_INTEGRATION_PENDING 메모**(Auth 연동 시 `state` 파라미터 또는 sessionStorage 로 옮길지 결정 — `AUTH_REQUIREMENTS` 대상, 새 ID 아님).
5. **복귀 후 Back = Home** — 복귀 진입에는 앱 안 기록(Welcome · Log in)이 남아 `N7-23` 의 "기록 0 → `/progress`" 가 아니라 `navigate(-1)` → Welcome → (인증 사용자) 규칙 6 → **Home** 이 된다. 인증 화면에 머물지 않음은 e2e 단정. `/progress` 로 보내려면 Welcome → Log in 이동 방식(Stage 2) 또는 상세 Back 규칙을 바꿔야 해 범위 밖 → design-agent/사용자 판단 요청.
6. **로그아웃 · 세션 만료는 기억하지 않는다** — 그렇지 않으면 로그아웃한 화면(예 `/settings`)이 다음 로그인 목적지가 되어 Stage 2 기본값(Home)이 깨진다(단위로 확인). 세션 만료 뒤 원래 화면 복귀는 이번 결정 범위 밖.
7. **게이트 우선** — 동의 누락 · VPC · 온보딩 미완료는 복귀 경로보다 먼저다. 게이트 화면 도달은 "allow" 가 아니라 경로를 지우지 않지만, 게이트 완료 후 Home(allow)에 도달하면 지워진다 → 게이트를 거친 사용자는 Home 으로 끝난다(기존 흐름 그대로).

## H7-7.7 AC-7-62 수동 묶음 추가 (iOS Safari 실기기 — NOT VERIFIED)

기존 AC-7-62(공유 시트 · 저장)와 같은 세션에서:
1. iOS Safari(최신) · 음소거 스위치 **해제** · 무선 이어폰 미연결 → Mock 데모 로그인 → `/progress/reports/<latest>` ⑥.
2. **첫 탭**(앱 로드 후 어떤 클립도 재생 안 한 상태)으로 클립 1 재생 → 기대: 오류 문구 없이 재생 · 버튼 ⏸.
3. 다른 앱 음악 재생 중 2 반복 → 다른 앱 오디오가 끊기는지 기록(unlock 무음 재생 부작용 확인).
4. 클립 2 첫 탭 → 재생 · 클립 1 정지.
5. 홈 화면 → 복귀 → 같은 클립 재탭(URL 캐시 · src 제거 후) → 재생.
6. 실패 시: 오류 문구 → 둘째 탭 재생 여부(폴백) 기록. WKWebView(후속 S4N-A)는 `mediaTypesRequiringUserActionForPlayback` 설정으로 별도 해소 가능.

## H7-7.8 Mock 시나리오 · BACKEND_INTEGRATION_PENDING

- 시나리오 변경 0. AC-7-46 확인: 로그아웃 상태에서 주소창에 `/progress/reports/<MOCK_REPORT_IDS.latest>` → Welcome → Log in(`sam@example.com` / `sunny-evening-8`) → 상세.
- 새 BIP ID 0. 메모: ① H7-7.6 ④(OAuth 전체 페이지 이동 시 복귀 경로 보존) ② 서버 리다이렉트 허용 목록이 생기면 같은 출처 · 앱 경로 규칙(`toSafeReturnPath`)과 맞출 것.

---

# H7-8 — `D7-7` 결정 반영 · `VG7-R-09` ⓑ (2026-11-20, development-agent)

## H7-8.1 Gate

- `D7-7`(2026-11-20, `docs/decisions/stage-7-approvals.md`) — 로그인 복귀(AC-7-46)로 들어온 리포트 상세의 Back = `/progress` (`N7-23`). 선택지 = `docs/design/stage-7-visual-gap.md` `VG7-R-09`.
- 범위 = 복귀 이동의 router state 표식 + 상세 Back 판정. Welcome → Log in **push** · 로그인 성공 **replace** 등 Stage 2 이동 방식 불변.
- `apps/api` · `supabase` · `apps/mobile` 부재 확인(`ls apps` = `web`). commit 0.

## H7-8.2 변경

| 파일 | 변경 |
|---|---|
| `apps/web/src/shared/lib/in-app-history.ts` | `AUTH_RETURN_STATE = { viaAuthReturn: true }` 정의 · `hasInAppHistory` 가 `history.state.usr` 에 이 표식이 있으면 `idx` 와 무관하게 **false**(앱 안 기록 없음). 그 밖의 router state 는 판정 영향 0 |
| `apps/web/src/pages/auth/LogInPage.tsx` | 성공 이동: 복귀 경로가 있을 때만 `state: AUTH_RETURN_STATE` (Home 이동은 표식 없음 · `replace: true` 그대로) |
| `apps/web/src/app/guards/resolveGuardDecision.ts` | 규칙 6 의 **복귀 경로** 리다이렉트에만 `state: AUTH_RETURN_STATE` (Home 목적지 · 다른 규칙 불변, 순수 함수 유지) · `GuardDecision` redirect 에 선택 필드 `state` |
| `apps/web/src/app/guards/RouteGuard.tsx` | `<Navigate state={decision.state}>` 전달 1곳 |

`ReportDetailTopBar.tsx` 는 변경 0 — 기존 `hasInAppHistory()` 판정이 표식을 읽는다.

**design-agent 추정(2파일)과 다른 점 — 확인 요청:** 브라우저 실측(`history.pushState/replaceState` 가로채기)에서 이메일 로그인의 복귀 이동은 **`LogInPage` 가 아니라 Guard 규칙 6 의 `<Navigate replace>`** 가 수행했다. 로그인 성공 → `me` 갱신 → Guard 가 `/auth/log-in` 을 먼저 떠나게 해 `LogInForm` 이 언마운트되고, TanStack `mutate(…, { onSuccess })` 콜백은 언마운트된 observer 에서 호출되지 않는다. `LogInPage` 만 고친 1차 구현은 `replace` 2건 모두 `usr: null` → Back = Home 그대로(e2e 실패로 확인). 그래서 Guard 복귀 리다이렉트에도 같은 표식을 실었다(소셜 로그인 경로도 이 경로다). jsdom 에서는 `LogInPage` 이동이 먼저 일어나므로 두 경로 모두 표식을 싣는다. 수정 후 실측 = `replace` 2건 모두 `usr: {"viaAuthReturn":true}`.

## H7-8.3 테스트

- 단위 `in-app-history.test.ts` +2: 표식 있음(idx 1 · 3) = false / 표식 아님(`false` · `'true'` · 다른 state) = 기존 판정 그대로.
- 단위 `resolveGuardDecision.test.ts`: 규칙 6 복귀 = `state: AUTH_RETURN_STATE` (`/auth/log-in` · `/auth/welcome`) · Home 목적지 = 표식 없음(`toStrictEqual`) · 게이트 우선 단정 그대로.
- 단위 `login-return-path.test.tsx`: 이메일 로그인 복귀 location.state = 표식 (신규 1건) · Guard 규칙 6 경로(소셜 상당) = 표식 · 복귀 없음 → Home = state `null`.
- e2e `report-detail.spec.ts` AC-7-46 테스트의 Back 단정 **교체**: Home → **`/progress`** + Progress h1 + 브라우저 뒤로 가기가 리포트 상세로 돌아가지 않음(replace). 일반 앱 안 진입(Progress 카드 → 상세 → Back = `/progress`, `navigate(-1)`) · 직접 deep link(→ `/progress` replace) 테스트는 변경 없이 통과.

## H7-8.4 검증 (2026-11-20)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `pnpm lint` · `pnpm lint:boundaries` | ✅ · ✅ · ✅ no dependency violations |
| `pnpm build` (test 전) | ✅ |
| `pnpm test` | ✅ **230 files / 3382 tests** |
| `pnpm format:check` | ✅ |
| `pnpm test:e2e` (단독, 비교 모드) | ✅ **890 passed · 0 failed (20.5m)** |

## H7-8.5 baseline — `R-BASELINE-1`

- 변경 0. 비교 모드 전부 통과 · 이 단위 첫 수정 파일보다 새로운 `e2e/__screenshots__` 파일 **0개**(`find -newer`). 시각 변화 없는 수정(router state 만)이라 분해 대상 없음. `git status` 의 기존 `M`/`??` baseline 은 H7-1~H7-7 산출물(이 단위와 무관).

## H7-8.6 판단 · Mock · BACKEND_INTEGRATION_PENDING

1. H7-7.6 ⑤(복귀 후 Back = Home)는 이 단위로 **대체** — Back = `/progress`.
2. 표식이 붙은 상세 엔트리는 이후 앱 안 이동 뒤 Back 으로 그 엔트리에 돌아와도 표식을 유지한다 → 다시 Back = `/progress`(앞 기록이 여전히 인증 관문이므로 의도와 일치).
3. 동의 · VPC · 온보딩 게이트를 거치면 게이트 리다이렉트에는 표식이 없다(그 흐름은 Home 으로 끝남 — H7-7.6 ⑦ 그대로).
4. 표식 = 불리언 1개. 경로 · id · PII 를 router state · 로그에 넣지 않는다. 시나리오 변경 0 · 새 BIP 0.

# H7-9 — `QA-7-001` 수정 (AC-7-72 · `VG7-F-11`) (2026-11-20, development-agent)

## H7-9.1 원인 · 범위

- gallery 상단 칩 내비 `.haru-dev-nav` 는 `position: sticky; inset-block-start: 0` 이다. 영역 클립은 대상을 화면 안으로 스크롤한 뒤 찍기 때문에, 내비가 대상의 일부를 덮은 채 baseline 에 들어갔다. 393 폭에서 내비는 두 줄로 접혀 높이가 97px 이다. dev 전용 UI 라서 `R-BASELINE-1` ② 위반이다.
- 고친 곳은 테스트 레이어뿐이다. 제품 코드와 gallery 코드는 바꾸지 않았다. `apps/api` · `supabase` · `apps/mobile` 은 없다(`ls apps` = `web`). commit 하지 않았다.

## H7-9.2 변경

| 파일 | 변경 |
|---|---|
| `e2e/support/gallery.ts` | `hideGalleryNav(page)` 추가: `addInitScript` 로 `.haru-dev-nav { visibility: hidden !important; }` 를 주입한다. `display: none` 을 쓰면 sticky 가 흐름에서 빠져 아래 콘텐츠가 당겨지므로 쓰지 않았다(§3) |
| `e2e/visual.spec.ts` | `gotoGallerySection()` = `hideGalleryNav` + `gotoStable`. gallery **영역 클립 4개 블록 전부**(V-1~V-8, V-9, Stage 2 §11.2, Library 1라운드)에 적용했다. `frame-*` 는 스크롤 0 의 전체 프레임이라 내비가 대상을 덮지 않으므로 적용하지 않았다 |

## H7-9.3 분해 — `R-BASELINE-1` §5 · §6

비교 모드에서 실패한 것은 4건이다. 각 실패마다 아래 세 가지를 나눠 비교했다: ⓐ 내비를 가린 렌더와 내비를 보인 렌더(런타임 토글), ⓑ 내비를 보인 렌더와 기존 baseline, ⓒ ⓑ 의 잔여분을 다시 토글한 결과(`[data-demo="v1-button"]{margin-block-end:-46px}` 로 페이지 오프셋을 HEAD 와 같게 맞춤). 클러스터는 8-연결(반경 2) 성분이며, Δ 는 채널 최대 차이다.

| baseline | ⓐ 가림↔보임 (= 이 수정의 효과) | ⓑ 보임↔기존 baseline (잔여) | ⓒ 오프셋 토글 후 ↔ 기존 | 판정 |
|---|---|---|---|---|
| `v1-button` (361×744) | 1 클러스터 y0–42 전폭, 15,314px, Δ124 = 내비 띠 | 0px | — | 재생성 |
| `v5-field` (361×1568) | y358–454 전폭(97px 높이, 21,595px, Δ130) + y360 경계선(287px, Δ10). 둘 다 내비 띠 안이다 | 11 클러스터, 1,592px, Δ≤13 (AA·글자 가장자리) | **0px** | 재생성 |
| `v9-spinner-skeleton` (361×790) | y0–65 전폭(23,548px, Δ181) + y0–2 x0–3(12px). 둘 다 띠 안이다 | 12 클러스터, 155px, Δ≤15 | **0px** | 재생성 |
| `v9-state-cards` (361×1264) | y206–302 전폭(97px 높이, 30,813px, Δ161) = 내비 띠 | 6 클러스터, 26px, Δ≤15 | **0px** | 재생성 |

- ⓐ 에서 나온 클러스터는 모두 내비 띠 안에 있다. ⓑ 의 잔여분은 S7-F 로 `v1-button` 섹션이 46px 길어져 아래 섹션의 페이지 오프셋이 바뀐 데서 생긴 래스터 차이다. ⓒ 에서 0px 이 되어 원인이 확정됐다. 이 잔여분은 기존 비교 모드도 허용 범위 안에서 통과하던 차이다. 설명되지 않은 클러스터는 0개다.
- `v5-field` · `v9-spinner-skeleton` · `v9-state-cards` 의 기존 baseline 에도 내비가 찍혀 있었다(2026-10-06 이후, ⓐ 로 확인). 따라서 `v1-button` 뿐 아니라 이 세 장도 R-BASELINE-1 ② 위반이었다.
- 가림 렌더는 두 번 연속 실행에서 바이트가 같았다(결정적). `--update-snapshots=changed` 로 쓴 4장은 가림 렌더와 바이트가 같다. `v1-button` 위쪽 140px 을 눈으로 확인했다: *Start session* 행이 온전히 보인다.

## H7-9.4 `--update-snapshots=all` (`visual.spec.ts` 단독, §3-1)

- 74 passed. `git status` 기준 신규 변화는 4장이다. 이 4장은 **내비 때문이 아니므로 재생성 대상에서 제외하고 작업본을 이전 상태로 되돌렸다**. 아래 판정 기록만 남긴다.

| baseline | diff (`=all` 렌더 ↔ 작업본) | 원인 |
|---|---|---|
| `s2-textlink` | 4 클러스터, 61px, Δ≤13 | +46px 오프셋. 내비를 가린 상태에서 오프셋만 토글하자 기존 baseline 과 0px 이 됐다 |
| `v4-tag-chip` | 9 클러스터, 119px, Δ≤13 | 위와 같다(토글 후 0px) |
| `v9-icon-button` | 1 클러스터, 42px, Δ12 | 위와 같다(토글 후 0px) |
| `s3-library-shelf-sheet` (앱 화면, 마지막 커밋 `7628e6b` 2026-10-10) | 2 클러스터(y0–3 x328–351 41px Δ5 · y1 x231–250 20px Δ1), 61px | **원인 미확인**. 렌더는 두 번 실행에서 같았다(결정적). §5 에 따라 재생성하지 않고 멈췄다. 사용자 판단이 필요하다 |

- 앞의 세 장(gallery)은 S7-F 가 남긴 스테일 baseline 이다. 재생성할지는 사용자가 결정한다. 비교 모드에서는 통과한다.
- **`v2-material`**: `=all` 로 다시 써도 바이트 변화가 없다. 작업본은 H7-2.6 의 재생성본 그대로이고, HEAD 대비 `M` 도 그대로다. 이번 단위의 영향은 없다.

## H7-9.5 검증 (2026-11-20)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` · `lint` · `lint:boundaries` · `build` | 전부 exit 0. boundaries: no dependency violations (1053 modules) |
| `pnpm test` | **230 files / 3382 tests** passed |
| `pnpm format:check` | exit 0 |
| `pnpm test:e2e` (단독, 비교 모드) | **890 passed · 0 failed (20.5m)** |

Mock 시나리오 변경 0 · 새 BIP 0. 재검증은 stage-qa-agent 에 요청한다.

# H7-10 — `D7-8` ② 스테일 baseline 7장 재생성 (`QA-7-005`) (2026-11-20, development-agent)

## H7-10.1 절차 (R-BASELINE-1 §3-1 · §5)

- 시작 전 `e2e/__screenshots__` 전체 167개 파일의 sha256 을 기록하고 사본을 scratchpad 에 백업했다.
- 1차 시도 `pnpm test:e2e -- --update-snapshots=all` 은 pnpm 이 `--` 를 그대로 넘겨(`playwright test -- --update-snapshots=all`) **플래그가 무시되었다**. 결과적으로 비교 모드 실행이 되었고(890 passed), 파일 변화는 0개였다. 그래서 다시 실행했다.
- 2차 `pnpm test:e2e --update-snapshots=all` (**단독**, 전체 스위트): **890 passed (21.0m)**.
- 전후 sha256 diff 결과 바뀐 파일은 **정확히 기대한 7장**이었다. 작업본에서 이미 M 상태이던 baseline 8장(`s3-library` · `s3-library-empty` · `s3-library-favorites-empty` · `v1-button` · `v2-material` · `v5-field` · `v9-spinner-skeleton` · `v9-state-cards`)은 변화가 0이었다. 그 밖의 변화도 0이어서 되돌린 파일이 없다.
- Product Code 변경 0 · commit 없음.

## H7-10.2 변경 파일 · sha256

| baseline | 원인 | before | after |
|---|---|---|---|
| `visual.spec.ts/s2-textlink.png` | S7-F +46px | `974f4d3c…5df4` | `7a0e7eee…c62d` |
| `visual.spec.ts/v4-tag-chip.png` | S7-F +46px | `8f8f796a…f9e` | `04a4a493…c44b` |
| `visual.spec.ts/v9-icon-button.png` | S7-F +46px | `d3940635…b9b8c1d6` | `813ae116…25fb9` |
| `stage7-shared-ui.spec.ts/s7-icons.png` | S7-F +46px | `5c1e50dc…e713` | `9b41a8a8…330d` |
| `stage7-shared-ui.spec.ts/s7-surface-card.png` | S7-F +46px | `2b8f581d…b7b8` | `964555f9…b37a` |
| `session-recording.spec.ts/s4-record-control.png` | S7-F +46px | `95fe906f…8a927d` | `8b9da0d1…210287` |
| `visual.spec.ts/s3-library-shelf-sheet.png` | `D7-6` ③ 칩 그림자 | `d96a7693…f4` | `3bd35a01…529b` |

전체 해시 (경로 prefix `e2e/__screenshots__/darwin/`):

```
s2-textlink             974f4d3cc5699fc21f691667c3b2c05c268388ffbc562ce0b0248b3a9ebd5df4 → 7a0e7eee191034135e3f95b46a79b4675cd98d5e2148d31bfd3842c705bac62d
v4-tag-chip             8f8f796a102c7b307a638fc3facfbe314852c8cba45334320421359b80542f9e → 04a4a493bc9fdde403241be17b5fbfb3a9c9cc84b33a837f02e97fc6d6c0c44b
v9-icon-button          d3940635ce821f96af383e08b9d6416f602aac13e4f843bfe4355883b9b8c1d6 → 813ae11658dd65d7122276738862fdf1874844574301507d36df010ed7225fb9
s7-icons                5c1e50dcfdc1730bb79dc17f3dec5b78e843f2aee2d79922d6e6818fa050e713 → 9b41a8a8d0de5c736ee2c735fab6e4983408c96d373d598265bcec1f33d9330d
s7-surface-card         2b8f581d0d9da14fe6e6bc201c47abdfa9866a090441e044864157250bafb7b8 → 964555f9fe9ef6734cf560295d849fba306e514a44c8315f7d9c9742ed55b37a
s4-record-control       95fe906f10bec6dc57471cda46fabd8c0ea6dd901e3b62eb8d40b0616a8a927d → 8b9da0d1f7d506342a1e2a4a8c299c13fb307ee2c4c0174187be69d506210287
s3-library-shelf-sheet  d96a7693e1ed187886a977d8d0839a31ee8ec7882dffe3a27791d99bcb27bd87 → 3bd35a0102ff2d06c4b3e0957aa79181a934116874549693fc2b2d2c2d36529b
```

## H7-10.3 비교 모드 검증

| 명령 | 결과 |
|---|---|
| `pnpm test:e2e` (단독, 비교 모드) | **890 passed · 0 failed (20.5m)** · 실행 뒤 baseline sha256 변화 0 |

재검증은 stage-qa-agent 에 요청한다.
