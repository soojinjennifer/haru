# Stage 7 Visual Gap

Status: **REVIEW** · design-agent · 단위별로 절을 덧붙인다. 허용 차이 **등록은 사용자 승인 후** (CLAUDE.md 최우선 규칙 6).

---

## S7-A

Contracts + Mock 단위 (`docs/qa/stage-7-handoff.md` H7-1). 검토일 2026-11-19. Playwright 미실행 (다른 lane 점유 가능 — 지시).

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[meta]` | Figma `get_metadata` — 텍스트 노드 이름(= 문자열) · 노드 bounding box | `31:102` 전체(하위 `163:2544`·`2551`·`2564`·`2607`·`2633`·`31:118`) · `110:835` |
| `[ctx]` | Figma `get_design_context` — **선언값** | `110:850` (진행 행: `110:851` track · `110:852` fill · `110:853` span) |
| `[git]` | `git diff --stat` · `git status --porcelain` · 변경 파일 diff 직독 | `apps/web/src` 중 `mocks/` · `shared/api/` · `__tests__/` 밖 |
| `[직독]` | fixture 소스 · `od -c` (따옴표 바이트) · 날짜 산술 | `mocks/fixtures/{weekly-progress,reports,me}.ts` · `mocks/reports/reportState.ts` |

렌더 PNG 는 배치 확인용으로만 1장(`110:850`) 봤다. 값은 전부 선언·텍스트·bbox 에서 읽었다.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG7-A-01` | 사용자 화면 UI 영향 | **UI 영향 없음 — 확인** | — | 아니오 | 불필요 |
| `VG7-A-02` | 주간 수치 · 막대 · chip (`31:102`) | **일치** | — | 아니오 | 불필요 |
| `VG7-A-03` | Moment of the week 인용 (`163:2633`) | **일치** (프로토타입 출처 문장 = Figma 텍스트) | — | 아니오 | 불필요 |
| `VG7-A-04` | Growth themes `level` (`163:2607`) | **불일치 1건** — Intrinsic Motivation 0.30 vs Figma 0.32 | Low | S7-A 아니오 · **S7-C 시각 비교 전 수정** | 불필요 (Figma 값으로 fixture 정정) |
| `VG7-A-05` | 4주 카드 진행 막대 (`110:851`) — H7-1.6 ① | **불일치** — fixture 0.4 vs Figma **폭 100%** | Medium | S7-A 아니오 · **S7-C 시각 비교 전 결정** | **필요** |
| `VG7-A-06` | 4주 카드 기간 · 다음 리포트 날짜 (`110:835`) | **일치** | — | 아니오 | 불필요 |

### 2. 항목 상세

#### `VG7-A-01` UI 영향 없음 — 확인 `[git]`

`mocks/` · `shared/api/` · `__tests__/` · `packages/contracts` 밖의 변경은 4곳뿐:

| 파일 | 변경 | 렌더 결과 |
|---|---|---|
| `app/providers/ApiClientProvider.tsx` | `FileShareProvider` 1단 래핑 + `fileShare?` prop | DOM 출력 0 — `shared/platform/file-share/context.tsx` 는 `<FileShareContext value>{children}` (React context) |
| `app/providers/apiClients.ts` | `AppAdapters` 에 4 client · `fileShare` 등록 | 렌더 무관 (Adapter 선택 지점 1곳 유지) |
| `dev/scenario-panel/devScenarios.ts` | dev Panel 그룹 4개 | **dev 전용** — Production 빌드 미포함(`assert:no-mocks` — H7-1.4), baseline 은 패널을 가린다(`R-BASELINE-1` ②) |
| `shared/platform/file-share/**` (신규) | interface · Web 구현 · context | 컴포넌트 · CSS 0 |

route · page · feature · entities · `packages/ui` · `packages/design-tokens` · CSS 변경 **0** (`git status` 기준). → **"UI 영향 없음" 기록** (workflow §4 · Plan §12.2).

#### `VG7-A-02` 주간 수치 — 일치 `[meta][직독]`

| Figma 노드 (텍스트) | fixture (`MOCK_THIS_WEEK_START` 주) | 판정 |
|---|---|---|
| `31:119` *"May 4 – 10"* | `weekStart 2026-05-04` · end `+6` = 05-10 | ✅ |
| `163:2546` *"5"* · `163:2547` *"sessions"* | `sessionsCount 5` | ✅ |
| `163:2549` *"62m"* | `minutesTogether 62` | ✅ |
| `163:2557` *"1h 12m"* | `totalMinutes 72` | ✅ |
| `163:2560` *"6 of 7 nights · avg 12 min"* | `nightsWithSession 6` · `averageSessionMinutes 12` (표시 문구는 `AD7-2`) | ✅ |
| `163:2558` *"+18% vs last week"* | 필드 없음 (`AD7-1` 미렌더) | ✅ (설계대로) |
| 막대 값 라벨 `163:2567`…`2603` *8m · 13m · — · 16m · 11m · 20m · 4m* | `[8, 13, null, 16, 11, 20, 4]` (월→일) | ✅ |
| 요일 라벨 *M T W T F S S* | `days[i].date` = 05-04(월) … 05-10(일) — 2026-05-04 = 월요일 (2026-01-01 목 + 123일) | ✅ |

`5 sessions` / `6 nights` · `62m` / `72` 의 내적 불일치는 Figma placeholder 그대로 — 기존 `AD7-13` 범위.

#### `VG7-A-03` Moment of the week — 일치 `[meta][직독]`

| Figma | fixture | 판정 |
|---|---|---|
| `163:2635` *"“Maybe she just needs to rest, like me when I’m frustrated.” — Emma"* | `quote` 동일 문장 · 아포스트로피 **U+2019** (`od -c` → `342 200 231`) · `speakerName = MOCK_CHILD_FIRST_NAME = 'Emma'` | ✅ (바깥 따옴표·` — ` 는 화면 포맷 — Spec §3.6) |
| `163:2636` *"Tue · The Most Magnificent Thing, p.14"* | `sessionDate 2026-05-05`(화) · `bookTitle` 동일 · `pageRef 14` | ✅ |

H7-1.6 ⑨ 의 "프로토타입에서 가져온 문장" 은 **Figma 텍스트와 같다** — 추가 조치 없음. `ReportDetail.notableQuotes[0]` 도 같은 문장.

#### `VG7-A-04` Growth themes `level` — 1건 불일치 `[meta]`

트랙 = `163:2613` 등 **w313**. fill 폭 / 313:

| 행 | Figma fill (노드 · 폭) | Figma 비율 | fixture `level` | 판정 |
|---|---|---|---|---|
| Self-Direction · *strong* | `163:2614` · 244 | 0.780 | 0.78 | ✅ |
| Emotion Regulation · *growing* | `163:2620` · 169 | 0.540 | 0.54 | ✅ |
| Cognitive Flexibility · *emerging* | `163:2626` · 100 | 0.319 | 0.32 | ✅ |
| Intrinsic Motivation · *emerging* | `163:2632` · **100** | **0.319** | **0.30** | ❌ Δ ≈ 6px @313 (94 vs 100) |

단계 라벨 4개·행 순서는 일치. 프로토타입 막대 폭이 3값(78·54·32)뿐이라 4번째를 0.30 으로 둔 것으로 보인다 — Figma 에서는 CF 와 **같은 100px**.
→ **development-agent 정정: `MOCK_GROWTH_THEMES` intrinsic_motivation `level 0.32`.** 사용자 결정 불필요 (Figma 값 그대로). S7-C 시각 비교 전에 반영하지 않으면 그 비교에서 6px 차이로 나타난다.

#### `VG7-A-05` 4주 카드 진행 막대 — H7-1.6 ① 판정 `[ctx][meta]`

**"100%" 는 폭이다 (불투명도 아님).**

```
110:851  track  flex-1 · h7 · radius 4 · fill rgba(94,115,112,0.12) · overflow-clip   (bbox w268.47)
└ 110:852 fill  w-full · radius 4 · fill #85bfb6 (불투명, opacity 지정 없음)          (bbox w268.47 = track 과 같다)
110:853  span   34.53×11.5 · 텍스트 없음 (AD7-4)
```

fill 이 `w-full` 로 트랙을 꽉 채워 트랙 색(ink 12%)이 보이지 않는다. fixture `success` = `1440초 / 2세션` → `min(0.4, 0.667) = 0.4` → 구현 시 fill 폭 ≈ 107px (Figma 268px), 나머지 161px 에 트랙 색이 드러난다. **S7-C Figma 나란히 비교에서 눈에 띄는 차이**다.

선택지:

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| ⓐ 허용 차이 등록 (`AD7-14`) | `success` 0.4 유지, Figma 100% 와의 차이를 허용 차이로 | 변경 0 | 기준 비교 화면이 Figma 와 다른 상태로 고정 — 최우선 규칙 1 에 비춰 약함. 허용 차이 목록이 "데이터 차이"로 오염 |
| ⓑ `success` = 1 | `success` 진행 주기를 `3600초 / 3세션` → ratio 1 (eligibility `cycle_in_progress`, 카드 분기는 Spec §2.2 "발행 有 + 진행" 그대로) | Figma 와 픽셀 동일 · 허용 차이 0 | AC-7-76("100% 고정 아님") 판별용 ratio ≠ 1 장면이 `success` 에서 사라진다 |
| ⓒ 시각 전용 scenario 신설 | `success` 0.4 유지 + `reports:figma` 류 seed 추가 | 둘 다 충족 | scenario key·테스트·Panel 항목 증가 (Mock 표면 확장) |

**권고: ⓑ — 단, AC-7-76 판별은 이미 있는 `report-no-previous` 로 옮긴다.** `report-no-previous` 는 `latestReport` 있음(주기 1) + 주기 2 `in_progress` `1440/2` → ratio **0.4** 로, 카드 분기가 `success` 와 **같은 행**("발행 有 + 다음 주기 진행")이다. 따라서 "막대 = `progressRatio`, 100% 고정 아님" 은 그 scenario 로 그대로 구분된다. 새 key 없이(ⓒ 대비) Figma 동일성을 얻고(ⓐ 대비) 허용 차이를 늘리지 않는다.
- ⓑ 채택 시 development-agent: `reportState` `success` 계열 주기 3 = `cycleRecord(3, 'in_progress', 3600, 3)` · 머리말 표 갱신 · `stage7-reports.test.ts` 의 ratio 0.4 단정 위치 조정 · Plan AC-7-76 의 e2e scenario 를 `report-no-previous` 로 기재(plan-agent/QA 공유). `report-published-unviewed` · `report-persona-unchanged` 는 "success 와 같다" 이므로 함께 1 이 된다 — 의도대로.
- **사용자 결정 필요** (ⓐ/ⓑ/ⓒ). S7-A 판정은 막지 않지만 **S7-C 시각 비교 전에** 정해야 한다.

#### `VG7-A-06` 4주 카드 기간 · 다음 리포트 — 일치 `[meta][직독]`

| Figma | fixture | 판정 |
|---|---|---|
| `110:847` *"Apr 13 – May 10 · a deeper read …"* | `latest` = `reportCyclePeriod('2026-03-16', 2)` → **2026-04-13 – 2026-05-10** (주기 1 = 03-16 – 04-12, 28일) | ✅ (뒤 문장은 화면 copy — Spec §2.2) |
| `110:861` *"Next report on Jun 7 · we'll email it too."* | 주기 3 `in_progress` · `nextReportDate = periodEnd` = **2026-06-07** | ✅ (*"· we'll email it too."* 는 `AD7-3` 제거) |
| `110:849` *"Covers the last four weeks of sessions."* | 화면 copy (fixture 무관) | — |

참고: `MOCK_LATEST_SUMMARY_LINE` 은 `110:835` 카드에 쓰이지 않는다(카드 설명은 copy 템플릿 — Spec §2.2). 과거 목록·상세(C-13 화면)에서만 보이므로 Figma 대조 대상 아님.

### 3. 후속

| 대상 | 할 일 | 시점 |
|---|---|---|
| development-agent | `VG7-A-04` IM `level` 0.30 → 0.32 | S7-C 착수 전 (S7-A 보정 또는 S7-C 첫 커밋) |
| 사용자 | `VG7-A-05` ⓐ/ⓑ/ⓒ 결정 (권고 ⓑ) | S7-C 시각 비교 전 |
| development-agent | `VG7-A-05` 결정 반영 (ⓑ 이면 위 항목) | 결정 후 |
| design-agent | S7-C Visual Gap 에서 `31:102` · `110:835` 나란히 비교 — 이 절의 일치 항목을 전제로 사용 | S7-C 구현 후 |

---

## S7-B

Shared UI + 토큰 단위 (`docs/qa/stage-7-handoff.md` H7-2). 검토일 2026-11-19. Playwright 미실행 (다른 lane 이 e2e 실행 중 — 지시). 코드는 직독, baseline 은 PNG 를 PIL 로 직접 읽었다.

### 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[ctx]` | Figma `get_design_context` — **선언값** (fill · effect · 텍스트 스타일). dev 가 타임아웃으로 못 한 호출을 **노드를 쪼개** 다시 했다 | `163:2545`(StatTile) · `163:2565`(8m 일반 열) · `163:2583`(16m 강조 열) · `163:2577`(— 빈 열) |
| `[var]` | `get_variable_defs` | `163:2607` (Growth themes — violet 바인딩 확인) |
| `[meta]` | `get_metadata` — 노드 bbox | `163:2564` 막대 영역 전체 (열 7 · 라벨 · 막대) |
| `[bounds]` | `get_screenshot(163:2545, contentsOnly)` 의 **렌더 크기** → 그림자 겹 수 역산 (`R-FIGMA-1` ②) | 노드 167.5×73 → 렌더 **172×79** |
| `[직독]` | 소스 · 토큰 CSS · `git diff HEAD` | H7-2.3 의 파일 전부 |
| `[px]` | PIL — 옛(`git show HEAD:`)·새 baseline 픽셀 diff + 8-연결 성분 분해 | `v2-material.png` · `stage7-shared-ui.spec.ts/*.png` 6장(육안) |

렌더 PNG 는 배치·겹 수 역산에만 썼다. 색·두께·글자는 전부 선언값.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG7-B-01` | `StatTile` 면 · 그림자 · 기하 · 타이포 (`163:2545`) | **일치** (radius 20→22 는 기존 `AD7-10`) | — | 아니오 | 불필요 |
| `VG7-B-02` | `BarChart` fill · 라벨 색/weight (`163:2564`) — H7-2.7 ⑩ 재조회 | **일치** (+ 스텁 radius 3→4 Δ+1) | Low | 아니오 | `AD7-10` 범위에 스텁 radius 추가 여부 |
| `VG7-B-03` | 막대 최대 높이 **58 vs Figma 63** — H7-2.7 ① | **불일치 (Δ−5, −7.9%)** | Low | S7-B 아니오 · **S7-C 시각 비교 전 결정** | **필요** — 허용 차이 후보 (아래 ⓐ/ⓑ) |
| `VG7-B-04` | 신규 HEX `#ac93c4` = `color/violet/67` | **일치** | — | 아니오 | 불필요 |
| `VG7-B-05` | `color-mix` 색 토큰의 Tier 2 파일 배치 — H7-2.7 ⑧ | **수용 가능** (조건: 문서 기록 — 이번에 반영) | — | 아니오 | 불필요 |
| `VG7-B-06` | AC-7-81 Stage 6 기본값 불변 | **확인** (baseline 바이트 동일 · 코드 기본 경로 불변) | — | 아니오 | 불필요 |
| `VG7-B-07` | `v2-material` 재생성 근거 (`R-BASELINE-1` §5·§6) | **충분** — 클러스터 수치 독립 재현 | — | 아니오 | 불필요 |
| `VG7-B-08` | `DiamondChart.previous` · 범례 (C-13, `P-38`) | **Spec §3.7 · §2.3.1 일치** (범례 점선 길이 = `--space-4` 차용) | Low | 아니오 | 불필요 |
| `VG7-B-09` | `Surface fill="card"` · `ProgressBar` 색 override · `decorative` · Icon 5 | **일치** | — | 아니오 | 불필요 |
| `VG7-B-10` | H7-2.7 판단 11건 검토 | **전부 수용** (①·⑧·⑩·⑪ 은 위 항목으로) | — | 아니오 | ① 만 필요 (`VG7-B-03`) |
| `VG7-B-11` | `COMPONENT_MAP.md` · `DESIGN_TOKEN_MAP.md` 정정 (H7-2.7 ⑪) | **반영함** (design-agent) | — | 아니오 | 불필요 |

**Severity 합계: Critical 0 · High 0 · Medium 0 · Low 3 (`B-02` · `B-03` · `B-08`). Blocking 0.**

### 2. 항목 상세

#### `VG7-B-01` StatTile — 일치 `[ctx][bounds][직독]`

| 항목 | Figma 선언값 (`163:2545`) | 구현 | 판정 |
|---|---|---|---|
| fill | `var(--glass-fill-strong)` = `#ffffffe5` (white 0.898) | `Surface fill="strong"` → `--color-surface-strong` = `--haru-white-a90` | ✅ (0.898 ↔ 0.9) |
| drop | `shadow-[0px_6px_4px_0px_rgba(94,115,112,0.08)]` **1겹** | `material="bubble"` → `--shadow-bubble` 첫 겹 `0 6px 4px` ink-600 8% | ✅ |
| inset | `inset 0 -1 0 ink5%` · `inset 0 1.5 0 white 90%` | `--shadow-bubble` 2·3겹 같은 값 | ✅ |
| 겹 수 검산 | Style 이름은 `HARU/Shadow Rest`(5겹)로 붙어 있다 → **렌더 바운드** 172×79 (노드 167.5×73): 좌우 +2.25 · 아래 +6 → drop **1겹** (3겹이면 아래 +56 이상) | 1겹 | ✅ (`V-10` 선례와 같은 현상) |
| radius | 20 | `--radius-surface` 22 | Δ+2 — **기존 후보 `AD7-10`** |
| padding · gap | `px 8 · py 13` · gap 5 | `--stat-tile-pad-inline`(`--space-2`) · `--stat-tile-pad-block` 13 · `--stat-tile-gap` 5 | ✅ |
| 값 | SF Heavy **860** · 24 · leading normal · `text-primary` | `--font-weight-heavy`(860) · `--stat-tile-value-size` 24 · `line-height: normal` · `--color-fg-primary` | ✅ |
| 라벨 | SF Medium **510** · 11 · normal · `text-secondary` | `Text caption-2 medium secondary` (11/13 · 510 · ink-500) | ✅ (line 13 ↔ normal ≈ 13) |
| 타일 높이 | 13 + 29 + 5 + 13 + 13 = 73 | 같은 합 (H7-2.2) | ✅ |
| `overflow-clip` (타일·행) | 있음 | 없음 | 설계대로 — **기존 후보 `AD7-11`** |

Spec §0.2 의 `[ctx]` 값과 이번 재조회가 같다 → H7-2.7 ⑩ 의 StatTile 부분 **해소**.

#### `VG7-B-02` BarChart fill · 라벨 — 일치 `[ctx][meta][직독]`

| 요소 | Figma 선언값 | 구현 토큰 → 값 | 판정 |
|---|---|---|---|
| 막대 일반 (`163:2568`) | `bg-[rgba(133,191,182,0.55)]` · radius 8 · w16 | `--bar-chart-fill-muted` = `color-mix(srgb, teal 55%, transparent)` → `rgba(133,191,182,.55)` · `--radius-control` 8 · 16px | ✅ |
| 막대 강조 (`163:2586`) | `bg-[#85bfb6]` · `flex-[1_0_0]` (트랙 전체) | `--bar-chart-fill` = `--color-action-primary-bg` = `#85bfb6` | ✅ (높이 규칙은 `AD7-6`) |
| 스텁 (`163:2580`) | `rgba(94,115,112,0.18)` · **h4 · radius 3** | `--bar-chart-empty-fill` = `--color-border-subtle` = ink-600 a18 · h4 · `--radius-indicator` **4** | 색 ✅ · radius **Δ+1** (Spec §3.4 가 이미 `--radius-indicator` 로 명세 — 승인 범위) |
| 값 라벨 일반 | SF **Bold** 10 · `#b3c0bf` | `--font-weight-bold` · `--color-fg-quaternary` = ink-300 `#b3c0bf` | ✅ (크기는 `VG7-B-03`) |
| 값 라벨 강조 | SF **Bold** 10 · `#5e7370` | bold · `--color-action-secondary-fg` = ink-600 `#5e7370` | ✅ |
| 요일 라벨 | SF **Semibold 590** · 10.5 · `#9aabaa` | `--font-weight-semibold` · `--color-fg-tertiary` = ink-400 `#9aabaa` | ✅ |
| 열 gap | 6 (값 라벨 ↔ 막대 ↔ 요일) | `--bar-chart-label-gap` = `--space-1-5` | ✅ |
| 빈 열 "—" ↔ 스텁 | "—" y59 h10 · 스텁 y75 → gap 6 | 같은 plot gap | ✅ |

→ H7-2.7 ⑩ 의 BarChart 부분(**fill 55%/100% · 라벨 weight**) **해소** — dev 가 Spec 에서 옮긴 값이 선언값과 같다.
Low: 스텁 radius 3→4 는 Spec 승인 범위지만 `AD7-10`(radius 흡수 목록)에 이름이 없다 → **`AD7-10` 에 "스텁 3 → indicator 4" 를 함께 올릴 것을 제안** (등록은 사용자 승인 후).

#### `VG7-B-03` 막대 최대 높이 58 vs 63 — 허용 차이 후보 `[meta][직독]`

```
Figma 열 h96 = 값 라벨 10(line 10) + 6 + 막대 63 + 6 + 요일 11(line 10.5→bbox 11)
구현 열 h96 = 값 라벨 13(caption-2 line) + 6 + 트랙 58 + 6 + 요일 13(caption-2 line)
```

- 원인은 **글자 크기(10/10.5 → 11)가 아니라 줄 높이(10/10.5 → 13)** 다. Figma 텍스트 선언은 `leading-[10px]` · `leading-[10.5px]` — 즉 **line-height = font-size(1.0)**. caption-2 의 line 13 을 그대로 써서 줄당 +2~3 이 트랙에서 빠졌다.
- 영향: 최대 막대 63 → 58 (−7.9%) · 막대 아래끝이 열 안에서 2px 위 (Figma y79 → 77). 영역 h110 · 열 폭 · 막대 폭 · gap 은 일치.
- `AD7-6`(비례 높이) 과 겹쳐 16m 막대는 이미 Figma 와 다르다(Figma 63 · 구현 46.4). 이 항목은 **20m(최대) 막대와 전 막대의 축척**에만 해당.

| 안 | 내용 | 트랙 | 장점 | 단점 |
|---|---|---|---|---|
| ⓐ **`AD7-7` 확장** | 현 구현 유지. `AD7-7`(11px 흡수)에 "→ 막대 트랙 58 (Figma 63)" 을 **결과 항목으로 함께 등록** | 58 (Δ−5) | 변경 0 · 근거가 `AD7-7` 과 같은 원인이라 별도 ID 불필요 | Figma 와 5px 차이 고정 |
| ⓑ 라벨 줄 높이 = 글자 크기 | 막대 라벨 2종에 Tier 3 `--bar-chart-label-line` **11px** (font 11 · leading 1.0 — Figma 의 leading 1.0 을 그대로 따른다) | 96 − 11 − 6 − 6 − 11 = **62** (Δ−1) | Figma 축척에 거의 일치 · 신규 텍스트 크기 0 (줄 높이만) | 신규 Tier 3 토큰 1 (승인 필요) · e2e `toBeCloseTo(58)` 단정·baseline `s7-bar-chart` 갱신 · 11px 글자를 11px 줄에 — 위아래 글리프 여유 1px 미만(라벨은 한 줄·`nowrap` 이라 겹칠 대상 없음) |

**권고: ⓑ** — 최우선 규칙 1 에 비춰 Figma 가 선언한 leading 1.0 을 따르는 쪽이 차이를 5 → 1 로 줄이고, 원인(줄 높이)에 직접 대응한다. ⓐ 도 근거는 충분하므로(11px 하한 결정 `N7-31` 의 파생 결과) 사용자가 고른다.
- ⓐ 채택 시: 허용 차이 후보 문구 = *"`AD7-7` 결과: 막대 트랙 최대 58 (Figma 63) — 라벨 caption-2 11/13 흡수로 열 h96 안의 줄 높이 +5"*. **등록하지 않았다** (사용자 승인 후 — 최우선 규칙 6).
- ⓑ 채택 시 development-agent: Tier 3 `--bar-chart-label-line: 11px` · `BarChart.css` 값/요일 라벨 `line-height` 와 막대 `calc()` 의 줄 항 교체 · e2e 단정 62 · `s7-bar-chart` 재생성(`R-BASELINE-1` 3-1·5). **S7-C 시각 비교 전에** 결정.

#### `VG7-B-04` `#ac93c4` = `color/violet/67` — 일치 `[var][직독]`

`get_variable_defs(163:2607)` → `"color/violet/67":"#ac93c4"` (그 밖 `accents/teal #85bfb6` · `accents/pink #efc3d4` · `accents/blue #7faec1` 도 동시 반환). 구현 `--haru-violet-67: #ac93c4` (Primitive) → `--color-growth-theme-motivation`. 신규 HEX 는 이 1개뿐이며 Figma **변수에 바인딩된 값**이라 Primitive 신설이 정당하다 (Spec `T7-1`).

#### `VG7-B-05` `color-mix` 토큰을 Tier 2 파일에 둔 것 — 수용 `[직독]`

| 토큰 | Spec 표기 Tier | 실제 위치 | 판단 |
|---|---|---|---|
| `--bar-chart-fill-muted` · `--report-card-icon-tile-bg` · (`--color-surface-moment` · `--color-border-moment`) | 3 (앞 둘) / 2 (뒤 둘) | `semantic/color.css` `@theme static` | **수용** — `:root` 의 `color-mix()` 가 Tailwind v4 폴리필에 밀리는 결함(H6-2)은 Stage 6 `--chart-area-fill`(Spec 상 차트 component 성격인데 Tier 2 파일)에서 이미 같은 방식으로 처리됐다. 이름이 Spec 그대로라 소비 코드 영향 0 |
| `--bar-chart-fill` · `--bar-chart-empty-fill` | 3 | 같은 블록 | **수용** — `color-mix` 는 아니지만 같은 컴포넌트 색 3개를 한 곳에 두는 편이 추적에 낫다 |
| `--chart-previous-stroke` | 2 | 같은 블록 | Spec 그대로 |

조건 — 문서에 "의미는 Tier 3, 파일은 Tier 2" 를 남길 것. **이번에 `DESIGN_TOKEN_MAP.md` §10 에 Tier 열로 기록했다.** `--color-` 접두가 없어 Tailwind 색 유틸리티가 생기지 않는 것도 의도와 맞다(컴포넌트 CSS 전용). 향후 같은 패턴이 늘면 Tier 판정 규칙("`color-mix` 를 쓰는 컴포넌트 색은 Tier 2 파일 · component 이름")을 DESIGN_SYSTEM 에 한 줄로 고정할 것을 제안.

#### `VG7-B-06` AC-7-81 — 확인 `[px][직독]`

- `git diff --stat HEAD -- e2e/__screenshots__` = **`visual.spec.ts/v2-material.png` 1건** (68996 → 69003 B). `git status --porcelain e2e/__screenshots__` 도 그 1건 + 신규 `stage7-shared-ui.spec.ts/` 뿐 → Stage 5 회고 · Stage 6 프로필/growth/settings baseline **바이트 동일**.
- 코드 기본 경로:
  - `DiamondChart` — `previous = null` 기본 → `previousOutlines === null` 이면 `<g>` 미렌더, 범례는 `previous === null || legend === undefined` 면 미렌더. 기존 path·class 변경 0.
  - `ProgressBar` — `decorative = false` 기본 → `accessibility` 객체 기존과 같은 키 · 루트 `aria-hidden={undefined}`(속성 미출력). fill 색 `var(--progress-fill-color, var(--color-progress-fill))` — 조상 선언이 없으면 기존 값.
  - `Surface` — `card` 는 새 class 1개 추가뿐, 기존 fill class 규칙 불변 (fallback 셀렉터 목록에 추가만).
- dev 의 "53 조합 DOM 동일" 은 임시 파일을 지워 **재현 불가** — 위 코드 직독과 baseline 바이트 동일로 갈음한다 (증거 판정은 QA 몫).

#### `VG7-B-07` `v2-material` 재생성 — 근거 충분 `[px]`

옛 baseline(`git show HEAD:`) ↔ 새 baseline 독립 diff (threshold 0):

| 클러스터 | px | 범위 (x, y) | 위치 |
|---|---|---|---|
| 1 | 15 | (341–343, 573–579) | 안쪽 카드 우하단 모서리 |
| 2 | 9 | (338–341, 581–584) | 〃 |
| 3 | 14 | (17–19, 573–579) | 안쪽 카드 좌하단 모서리 |
| 4 | 7 | (19–21, 581–583) | 〃 |
| 5 | 2 | (359–360, 578) | 바깥 블록 우측 끝 |
| 6 | 2 | (0–1, 578) | 바깥 블록 좌측 끝 |

합계 **49 px · 최대 채널 Δ4** — H7-2.6 ② 수치와 **정확히 같다**. 좌우 대칭 · 아래 모서리에만 · 내용 영역 0 → "블록 위치 이동에 따른 반투명 면 아래 배경 변화 → 모서리 AA" 와 모양이 맞는다.

`R-BASELINE-1` 대조:
- §5 (원인별 분해, 설명 안 되는 클러스터 0) — ✅ 6개 모두 모서리 AA, 설명됨.
- §6 (런타임 토글 재현) — ✅ dev 가 ⓐ violet 견본 1개 숨김 → HEAD 렌더와 0px, ⓑ HEAD worktree 렌더 ↔ HEAD baseline 98px 를 111 견본 숨김으로 0px 재현. 토글 자체는 이 lane 에서 Playwright 금지로 **재실행하지 못했다** — 정적 수치 재현까지만 독립 확인.
- §3-1 (스테일 노출) — ✅ 이 baseline 은 2026-10-27(`9f759bb`) 이후 갱신이 없었고 `changed` 모드에 숨어 있었다는 사실이 `=all` 로 드러났다. **설명은 충분**하다고 판단한다. 다만 "기존 스테일 98px" 가 S7-B 와 무관한 누적분이라는 점은 QA 리포트에도 따로 적어 둘 것을 권고 (다음 회귀 때 원인 추적용).

#### `VG7-B-08` DiamondChart `previous` · 범례 — 명세 일치 (Figma 없음, `P-38`) `[직독][px 육안]`

- 외곽선만 · `fill: none` · `--chart-previous-stroke`(ink-400) · 1.5px · dash `4 3` · round join · `vector-effect: non-scaling-stroke` · z = 격자 → previous → current — Spec §3.7 그대로. 모션 없음 ✅.
- 범례: `caption-1 secondary` · gap `--space-4` · 면 견본 12×12 `--radius-indicator` + `--chart-area-fill` + stroke · `aria-hidden` ✅. baseline `s7-diamond-previous` 육안: "Earlier" 점선 · "This report" 면 견본, 숫자 0.
- Low: 점선 견본 **길이 16** 을 spacing 토큰 `--space-4` 로 썼다 (Spec "16×0" 에 길이 토큰이 없어서). 값은 맞지만 의미가 간격이 아니다. 조치 불필요 수준 — `P-38` 확정 시 `--chart-legend-dash-length` 로 분리할지 함께 정한다.
- `legend` 를 Shared UI 선택 prop 으로 넣은 것(H7-2.7 ④)은 수용 — 범례 견본이 차트 내부 토큰(`--chart-*`)을 공유하므로 차트 쪽에 있는 편이 맞다.

#### `VG7-B-09` Surface `card` · ProgressBar · Icon — 일치 `[직독][px 육안]`

- `fill="card"` = `--color-surface-card`(white 82%) + `blur(--material-blur-md)` · fallback 2곳 — Spec §0.3 Δ0.
- ProgressBar 4색 = `--color-growth-theme-*` → teal · pink · blue · violet-67 (`163:2607` 변수 4개와 1:1, `VG7-B-04`). `s7-progress-fill` 육안 순서 teal→pink→blue→violet ✅.
- Icon: `file-down`(`110:838`) · `arrow-down-to-line`(`110:855`) — Spec §0.2 `[svg]` 식별과 같은 Lucide 이름. `share`·`play`·`pause` 는 C-13.

#### `VG7-B-10` H7-2.7 판단 11건

| # | 내용 | 판정 |
|---|---|---|
| ① | 막대 최대 58 | `VG7-B-03` — 사용자 결정 |
| ② | `srLabel` = 항목 SR 문장 전체 | 수용 — Spec §3.4 접근성 행과 같은 결과, 도메인 문장은 S7-C |
| ③ | 행은 컴포넌트 밖 | 수용 — Spec §3.1 "행" 은 화면 배치. S7-C 에서 `--stat-tile-row-block-size` 사용 확인 |
| ④ | `legend` prop | 수용 (`VG7-B-08`) |
| ⑤ | `decorative` prop | 수용 — union 타입으로 이름 없는 progressbar 차단 |
| ⑥ | `--progress-fill-color` = fallback | 수용 — `T7-2` "변수 경로만" |
| ⑦ | `ListRow` 변경 0 | 수용 — 새 `overflow` 0 유지 |
| ⑧ | Tier 2 배치 | `VG7-B-05` 수용 |
| ⑨ | `P-35` 1토큰 | 수용 — ink-400 은 `P-24` 소속 |
| ⑩ | 선언값 미재확인 | `VG7-B-01` · `-02` 로 **해소** |
| ⑪ | 맵 문서 정정 | `VG7-B-11` 반영 |

#### `VG7-B-11` 문서 정정 (design-agent)

- `docs/COMPONENT_MAP.md` — 갱신 메모 1 · `StatTile` 행(props `unit` 제거 → `value`·`label`, 구현됨) · `BarChart` 행 신설 · `Surface`·`ProgressBar`·`DiamondChart` 행에 Stage 7 확장 기록 · `WeeklyReadingChart`·`NotableQuoteCard`·`ReportArchiveCard`·`HighlightClipPlayer`·`GrowthReportOverview` 행에 Spec §3.9 재분류 주석.
- `docs/DESIGN_TOKEN_MAP.md` — §10 신설: `T7-1`~`T7-15` 토큰 전부(Tier · 실제 파일 · 값 · 가값), `T7-2`·`T7-3`·`T7-13` 은 토큰 아님 표기.

### 3. 허용 차이 후보 (등록 안 함 — 사용자 승인 후)

| 후보 | 내용 | 권고 |
|---|---|---|
| `AD7-7` 확장 | 막대 트랙 최대 58 (Figma 63) — 라벨 줄 높이 13 | `VG7-B-03` ⓑ 를 택하면 Δ−1 로 줄어 **결과 항목으로만 기록** (62 vs 63) |
| `AD7-10` 확장 | `BarChart` 스텁 radius 3 → `--radius-indicator` 4 | 등록 권고 (Spec 승인 범위의 흡수) |

### 4. 후속

| 대상 | 할 일 | 시점 |
|---|---|---|
| 사용자 | `VG7-B-03` ⓐ/ⓑ 결정 (권고 ⓑ) · `AD7-10` 스텁 radius 추가 승인 | S7-C 시각 비교 전 |
| development-agent | ⓑ 이면 `--bar-chart-label-line` 11 · CSS · e2e 단정 · `s7-bar-chart` 재생성 | 결정 후 |
| stage-qa-agent | `v2-material` 기존 스테일 98px(10-27 이후 누적) 를 S7-B 몫과 분리 기록 · AC-7-81 증거로 baseline 바이트 동일 사용 | Stage 7 QA |
| design-agent | S7-C 에서 `StatTile` 행 · `BarChart` 를 `31:102` 와 나란히 비교 (이 절의 선언값 일치 전제) | S7-C 구현 후 |

---

## S7-C

Progress 탭 단위 (`docs/qa/stage-7-handoff.md` H7-3). 검토일 2026-11-19. **Playwright 미실행** (다른 lane 이 e2e 실행 중 — 지시). 구현 쪽은 H7-3.7 의 신규 baseline PNG 를 PIL 로 직접 읽었고, 코드·토큰은 직독했다.

### 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[ctx]` | Figma `get_design_context` — **선언값**. 프레임 전체가 아니라 **작은 노드를 하나씩** 조회 (S7-B 방식) | `31:118`(chip) · `163:2553`(주간 카드 헤더 텍스트 열) · `110:843`(리포트 카드 텍스트 열) · `110:860`(footer) · `110:837`(아이콘 타일) · `163:2634`(eyebrow) |
| `[svg]` | `[ctx]` 첨부 SVG 원문의 `stroke-width` · `stroke` | `110:838` file-down · `31:120` chevron-down |
| `[meta]` | `get_metadata` — bbox | `163:2551` 전 계층 · `110:836` · `30:88`(Library 제목 행 — ⑯ 대조) |
| `[fig]` | `get_screenshot(31:102, maxDimension 1105)` → **393×1105 1:1** · `get_screenshot(110:835, contentsOnly, 393)` → 393×343 1:1(그림자 영역 포함, 카드 = (24, 28) 345×230) | 배치 대조 전용 |
| `[px]` | PIL — Figma 렌더 ↔ baseline `s7-progress-frame`(393×1105) 블록별 **최소 오차 오프셋 탐색**(dy 40~140 · dx ±3, 평균 채널합 차) · 열 단위 막대 높이(teal 화소 수) · 글리프 행 범위 · 밝은 면 x 범위 | `progress.spec.ts/*.png` 13장 중 frame · report-card 6 · error · empty-week · past-reports · week-sheet |
| `[계산]` | 가우시안 근사(σ = blur/2)로 `--shadow-glass-rest` 3겹 합성 → 6px 프로브 지점 예상 Δ | H7-3.6 프로브 수치 대조 |
| `[직독]` | 소스 · 토큰 CSS · `packages/ui/src/top-bar/TopBar.css` · `icon/registry.ts` | — |

렌더 PNG 는 **배치·기하** 대조에만 썼다. 색·두께·글자 값은 전부 `[ctx]`·`[svg]` 선언값.

⚠️ **좌표 기준**: Figma 프레임은 상태바 393×56 을 포함한다. 구현 baseline 은 상태바가 없으므로 **Figma y = 구현 y + 56** 으로 맞춰 비교했다 (`[px]` 오프셋 탐색에서 캐릭터 · StatTile · 막대 요일 행이 모두 **dy = 56, dx = 0** 에서 최소).

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG7-C-01` | `31:102` 나란히 — 블록 구성 · 순서 · 수치 | **일치** (허용 차이 후보 지점 제외) | — | 아니오 | 불필요 |
| `VG7-C-02` | 제목 행 y0 (Figma y10) — 겹침 26 vs 36 (H7-3.8 ①) | **불일치** — 본문은 −56, 제목은 −66 으로 **좌표 매핑이 섞였다** | Low | 아니오 | **필요** (ⓐ/ⓑ/ⓒ) |
| `VG7-C-03` | 캐릭터 크롭 = 에셋, `overflow` 0 (②) | **일치** — 픽셀 대조 동일 | — | 아니오 | 불필요 (Spec 정정함) |
| `VG7-C-04` | chip 오른쪽 끝 x349 (Figma x369) (⑯) | **불일치 Δ−20** — 공유 `TopBar large` 결함, **Library 도 같다** (Figma `30:90` 도 x369) | Medium | 아니오 (Stage 7 QA 전 결정) | **필요** (ⓐ/ⓑ) |
| `VG7-C-05` | H7-3.8 ⑨ 선언값 재조회 6건 | **5건 일치 · 1건 불일치**(아이콘 stroke) | Low | 아니오 | 허용 차이 후보 1 |
| `VG7-C-06` | StatTile `62m` (③) | **일치** (Figma 문자열 그대로) | — | 아니오 | 불필요 (Spec 정정함) |
| `VG7-C-07` | 주간 카드 헤더 간격 4·4 (④) | **Δ+1~2** (줄 높이 흡수) | Low | 아니오 | 줄 높이 후보에 포함 |
| `VG7-C-08` | Growth themes 카드 높이 (**신규** — H7-3.9 에 없음) | **약 +7** → Moment · 리포트 카드가 아래로 밀림 | Low | 아니오 | 줄 높이 후보에 포함 |
| `VG7-C-09` | Spec 정정 (§2.0 · §2.1.1 · §3.3 · §3.4 · §2.4 · §2.9 · §3.2/§6 · §9.5) | **반영함** (design-agent, 개정 노트) | — | 아니오 | 불필요 |
| `VG7-C-10` | 막대 축척 — `VG7-B-03` 이 frame 에서 어떻게 보이는가 | 정보 — 눈에 띄는 차이의 **주 원인은 `AD7-6`(비례 높이)** 이지 B-03 이 아니다 | Low | 아니오 | `VG7-B-03` 결정 시 참고 |
| `VG7-C-11` | `110:835` ↔ 리포트 카드 6장 | **발행 = 일치** (줄 높이 · `AD7-3`·`4`·`9` 지점 제외) · C-13 5상태 = Spec §2.2 표 일치 | Low | 아니오 | 불필요 |
| `VG7-C-12` | 리포트 카드 Error = 셸 없음 (⑪) · SectionLabel bold (⑬) · 막대 폭 313 (⑮) | **수용** | — | 아니오 | 불필요 (⑮ 는 `AD7-4` 문구 확장) |
| `VG7-C-13` | `R-SHADOW-1` 프로브 수치 sanity (H7-3.6) | **이론값과 일치** | — | 아니오 | 불필요 |
| `VG7-C-14` | H7-3.8 나머지 (⑤⑥⑦⑧⑩⑫⑭) | **수용** | — | 아니오 | 불필요 |
| `VG7-C-15` | `COMPONENT_MAP.md` (⑰) | **반영함** (design-agent) | — | 아니오 | 불필요 |

**Severity 합계: Critical 0 · High 0 · Medium 1 (`C-04`) · Low 6 (`C-02` · `C-05` · `C-07` · `C-08` · `C-10` · `C-11`). Blocking 0.** 사용자 결정 2건(`C-02` · `C-04`)은 **Stage 7 QA 의 Figma 대조 전에** 정한다.

### 2. 항목 상세

#### `VG7-C-01` `31:102` 나란히 — 일치 `[fig][px]`

| 블록 | 최소 오차 오프셋 (Figma − 구현) | 평균 채널합 차 | 판정 |
|---|---|---|---|
| 캐릭터 (y150~330) | dy **56** · dx **0** | 5.2 | ✅ 크롭·배율 동일 (`C-03`) |
| StatTile 행 | dy **56** · dx 0 | 13.5 | ✅ (y290 · 345×84 — H7-3.2 실측과 같다) |
| 주간 카드 제목 · 합계 | dy **54** | 29~80 (글자 영역) | Δ+2 (`C-07`) |
| 막대 요일 행 | dy **56** | 4.0 | ✅ (막대 아래끝은 Δ−1~2 — `VG7-B-03`) |
| Growth 제목 / 행 | dy 54 / **52** | 21~50 | Δ+2 / +4 (`C-08`) |
| Moment 본문 | dy **49** | 30.5 | Δ+7 (`C-08` 누적) |

구성: 캐릭터 → StatTile 2 → This week's reading → Growth themes → Moment → (Figma `110:835` 카드, `D7-1`) 순서 일치. 수치(5 · 62m · 1h 12m · 8/13/—/16/11/20/4 · strong/growing/emerging/emerging · Emma 인용)·IM 막대 = CF 막대(`VG7-A-04` 반영) 일치. 다른 지점은 허용 차이 후보 `AD7-1`(+18%) · `AD7-2`(6 nights) · `AD7-5`(프레임 fill) · `AD7-6`·`7`(막대) · `AD7-12`(토글) 뿐.

#### `VG7-C-02` 제목 행 y0 vs Figma y10 — 사용자 결정 `[px][meta][직독]`

- 측정: "Progress" 글리프 행 = Figma **y76~99**(→ 웹 기준 20~43) · 구현 **y10~34** → **구현이 10 위**. 가로 x26~142/144 일치. chip 세로도 Figma y69(→13) vs 구현 y3 (같은 10).
- 원인: 공유 `TopBar large` 는 `/library` 와 같이 y0 에 그린다. **Library 는 Figma 를 −66(상태바 56 + 위 여백 10)으로 일괄 매핑했다** (`stage-3-library-figma-audit.md` §공통: Content y66 → 웹 0, 제목 → 첫 섹션 16 유지). Progress 는 **제목만 −66, 본문(캐릭터 y14 · 스택 y290)은 −56** 으로 매핑해 두 기준이 섞였다 → 제목 ↔ 캐릭터 겹침 36 → **26**, 제목 아래 ↔ StatTile 거리 Figma 240 → 250.
- Spec §2.1.1 의 "프레임 top = 상태바 아래 14 (y70 − 56)" 가 이 혼합의 출처다 (Spec 은 제목이 y10 에 그려진다고 전제했다). 결정 사항이라 Spec 은 고치지 않았다.

| 안 | 내용 | 결과 | 장점 | 단점 |
|---|---|---|---|---|
| ⓐ 허용 차이 등록 | 현 구현 유지 (본문 Figma 절대 좌표) | 겹침 26 · 본문 위치 Figma 절대값과 같다 | 변경 0 | 상단 구도(제목과 캐릭터의 관계)가 Figma 와 다르다 — 최우선 규칙 1 에 약함 |
| ⓑ **본문도 −66 으로 일괄** | `--progress-character-top` **14 → 4** (토큰 값 1개). 스택 y290 → 280 은 같은 식에서 따라온다 | 제목·chip·캐릭터·스택 **상대 기하 전부 Figma 동일** (겹침 36) | Library 와 같은 매핑 규칙 · 변경 1 토큰 · 허용 차이 0 | 캐릭터 프레임이 TopBar 위쪽 4 에 붙는다(에셋 위 투명 여백 ≈35 라 헤드폰은 y≈39) · e2e 기하 단정 14→4 · 290→280 · baseline `s7-progress-frame`·`main` 재생성 |
| ⓒ `TopBar large` 위 여백 10 (전역) | 공유 TopBar 에 `padding-block-start` 10 | 두 화면 모두 Figma 절대 좌표 | 상태바 아래 10 을 그대로 재현 | 공유 컴포넌트 변경 → **Library·Settings 류 baseline 전부** 변경 · Stage 3 결정 재개방 |

**권고: ⓑ.** 웹에는 상태바가 없으므로 Figma 를 **한 오프셋으로 옮기는 것**이 유일하게 일관된 매핑이고, 이미 Library 가 그렇게 승인됐다. ⓒ 는 범위가 크고 ⓐ 는 Figma 구도를 바꾼 채 고정한다.
- ⓐ 채택 시 허용 차이 후보 문구: *"`31:115` 제목 행 y0(Figma 상태바 아래 10) — 본문은 −56 매핑, 제목 ↔ 캐릭터 겹침 26 (Figma 36)"*. **등록하지 않았다**.
- ⓑ 채택 시 development-agent: `packages/design-tokens/src/component/index.css` `--progress-character-top: 4px` (주석 "Figma y70 − 66") · e2e ① 단정 · baseline 재생성(`R-BASELINE-1` 3-1·5).

#### `VG7-C-03` 캐릭터 크롭 = 에셋 — 일치 `[px][직독]`

- 에셋 `shared/assets/character/bookworm.png` = **941×1144 RGBA** · aspect 0.82255 (347/422 = 0.82227, Δ0.03%).
- Figma 렌더 ↔ baseline 캐릭터 영역(310×180) 최소 오차 = **dy 56 · dx 0 · 평균 채널합 5.2/765** — 크롭 창·배율 동일. 주변 ±1px 이동만으로 오차가 커진다(dx −1 = 15.3).
- `overflow` 0 은 `R-SHADOW-1` ① 에 더 맞다 → **수용**, Spec §2.1.1 · §9.5 정정(개정 ②). AC-7-70 의 "새 overflow 1건" 기대값이 0 이 된 것은 QA 가 Plan 쪽에서 읽을 것.

#### `VG7-C-04` chip 오른쪽 끝 x349 — 사용자 결정 `[px][meta][직독]`

- 측정: chip 밝은 면 x — Figma **254~368** · 구현 **235~348** (폭 114~115 동일, **20 왼쪽**).
- 원인 (`TopBar.css` 직독): `--large` = `grid-template-columns: auto minmax(0,1fr) auto` + `column-gap: --topbar-gap`(20). 빈 leading 을 `display: none` 으로 빼면 center → 1열, trailing → **2열(1fr)** 로 밀리고 빈 3열 앞에 **gap 20** 이 남는다.
- **Library 도 같다**: Figma `30:88` 제목 행 = chip `30:90` x211 + w134 = **345**(→ x369). 구현 `/library` trailing right **349** (stage-3-approvals §30.3 의 실측 문장). 이 349 는 **승인된 허용 차이가 아니라** 띠 폭 수정 전후가 같다는 기록일 뿐이다 (`grep 349` — 허용 차이 0). → **Stage 3 부터 있던 미발견 차이**.

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| ⓐ **공유 `TopBar large` 수정** | leading 이 비면 2열 그리드(`minmax(0,1fr) auto`) — 예: `.haru-top-bar--large:has(> .haru-top-bar__leading:empty)` 또는 center 를 `grid-column: 2` 로 고정해 빈 열을 gap 없이 접는다 (방식은 dev) | Progress · Library **둘 다 Figma x369** · 허용 차이 0 | Stage 3 Library baseline(제목 행 포함 장면) 재생성 · `progress.spec` 에서 뺀 chip 오른쪽 끝 단정 복구 |
| ⓑ 허용 차이 등록 (두 화면) | 현 상태 유지 | 변경 0 | 20px 은 393 폭에서 눈에 띈다 (Medium) · 같은 결함을 두 번 등록 |

**권고: ⓐ.** 최우선 규칙 1 · 3 에 비춰 공유 컴포넌트 결함은 원인에서 고친다. leading 이 있는 TopBar(pill · 설정 하위)는 영향이 없도록 `large` + 빈 leading 조건으로만 좁힌다.
- ⓐ 채택 시: 회귀 대상 = `TopBar variant="large"` 사용처 4곳(`grep`): `LibraryTopBar` · `ProgressTopBar`(빈 leading — **바뀜**) · `HomeTopBar`(leading = 워드마크 — 조건 밖, **불변이어야 함**) · dev gallery · `--update-snapshots=all` + 원인 분해(`R-BASELINE-1` 3-1·5).

#### `VG7-C-05` H7-3.8 ⑨ 선언값 재조회 `[ctx][svg]`

| 항목 | Figma 선언값 | 구현 | 판정 |
|---|---|---|---|
| chip 그림자 (`31:118`) | `shadow-[0_6_4_0_rgba(94,115,112,0.08)]` **drop 1겹** + inset `0 -1 ink5%` · `0 1.5 white90%` (Style 이름은 `HARU/Shadow Rest` 5겹 — `R-FIGMA-1` ② 와 같은 현상) | `--shadow-bubble` = 같은 3겹 | ✅ |
| chip 면 · 라벨 | `var(--glass-fill)` 74% · SF **Semibold 590 · 13 · leading normal** · `text-primary` | `--color-surface-glass` · `footnote semibold primary` | ✅ |
| `163:2551` 텍스트 색 (`163:2553`) | 제목 `#4a5f5c` Bold 15/**18** · 합계 `#4a5f5c` Bold 26/26 tracking **−0.52px** · 보조 `#9aabaa` Regular 12/**15.6** | primary · `--weekly-total-*`(26/26/−0.52px) · `caption-1 tertiary` | ✅ (색 · 크기) / 줄 높이 → `C-07` |
| `110:835` 설명 · 보조 (`110:843`) | 설명 `#7d9291` Regular 12.5/18.13 · 보조 `#9aabaa` Regular 11.5/14.95 · 제목 `#4a5f5c` Bold 15/18 · 열 gap 4 | `caption-1 secondary` · `caption-2 tertiary` · subheadline bold primary · `--space-1` | ✅ 색 (크기 = `AD7-7`, 줄 높이 = `C-11`) |
| `110:835` footer (`110:861`) | `#9aabaa` Regular 11.5/**16.1** 가운데 | `caption-2 tertiary center` | ✅ 색 |
| 아이콘 타일 (`110:837`) | `rgba(133,191,182,0.2)` · radius 14 · 글리프 22 | `--report-card-icon-tile-bg`(teal 20%) · `--radius-media` 12(`AD7-10`) · 22 | ✅ |
| **아이콘 stroke** | `110:838` file-down **1.65** `#85BFB6` · `31:120` chevron-down **1.2** `#7D9291` | Lucide 공통 `LUCIDE_STROKE_WIDTH` **1.5** (`icon/registry.ts`) · 색 = teal · `--color-fg-secondary` | ❌ Δ−0.15 / Δ+0.3 · 색 ✅ |
| Moment eyebrow (`163:2634`) | SF Semibold 590 · 11 · **tracking 0.4px** · `#6f8c88` | `--moment-eyebrow-tracking` 0.4px · caption-2 semibold · secondary | ✅ tracking (색 = 기존 `AD7-8`) |

→ ⑨ 6건 중 **stroke 1건만 불일치**. 아이콘별 stroke 를 바꾸려면 `Icon` 에 stroke prop/토큰을 새로 열어야 하고, 두 글리프 모두 12·22px 에서 0.15~0.3 차이라 시각 영향이 작다. **허용 차이 후보(신규)**: *"Lucide 아이콘 stroke 공통 1.5 — Figma `110:838` 1.65 · `31:120` 1.2"*. 등록하지 않았다.

#### `VG7-C-06` StatTile `62m` — 일치 `[직독]`

Figma `163:2549` 문자열 = *"62m"*. Spec §2.0 의 단일 분 포맷(→ `1h 2m`)은 **같은 줄에 예로 든 Figma 값과 모순**이었다 → dev 판단(③ Figma 우선) **수용**, Spec §2.0 정정(개정 ①): StatTile = `formatMinuteCount` · 주간 합계 = `formatMinutes`.

#### `VG7-C-07` 주간 카드 헤더 — Δ+1~2 `[meta][px]`

- `[meta] 163:2552`: 제목 h18 @0 · 합계 h26 @23 · 보조 h16.59 @53 → **간격 5 · 4** (Spec §3.3 의 "8 · 5" 는 오기 — 개정 ③).
- 구현: 제목 line 20(subheadline) + 4 + 26 + 4 → 합계 y24 · 보조 y54. `[px]` 글리프 기준 제목·합계 **+2** (줄 상자 20 안 가운데 정렬 +1 + 합계 +1). 헤더 70 (Figma 69.59) · 카드 212 (211.6) — dev 보고와 같다.
- 판정: 토큰 스케일 흡수(subheadline 15/20)의 결과. dev 의 🆕 줄 높이 후보에 들어 있다 → 수용.

#### `VG7-C-08` Growth themes 카드 약 +7 — 신규 `[px][직독]`

- 카드 오른쪽 모서리 열(x366) 밝기 전이: Figma **683 → 871** · 구현 **682 → 878** → 높이 **+7~8**. 행 글리프는 +4, Moment 본문은 **+7**(dy 49).
- 원인: 제목 subheadline line **20**(Figma 18, +2) · 행 라벨 caption-1 line **16** × 4행(Figma 15, +4) · 단계 라벨 baseline 정렬 +1 내외. 행 gap 12 · 라벨 ↔ 막대 6 · 막대 h8 은 일치(`weekly-progress.css`).
- H7-3.9 🆕 줄 높이 후보는 `163:2551` · `110:835` 만 적었다 → **`163:2607` 을 같은 후보에 추가할 것을 제안** (같은 원인 · 같은 흡수 규칙). 결과적으로 리포트 카드 · 과거 목록도 +7 아래.

#### `VG7-C-09` Spec 정정 — 반영 (개정 노트 `stage-7-design-spec.md` 머리)

| # | 위치 | 정정 |
|---|---|---|
| ① | §2.0 분 포맷 | StatTile = 분 단위(`62m`) · 합계·막대 = h/m (`C-06`) |
| ② | §2.1.1 · §9.5 | 크롭 = 에셋 941×1144 · 새 `overflow` **0** (`C-03`) |
| ③ | §3.3 | 헤더 간격 8·5 → **4·4** (Figma 5·4 @ line 18) (`C-07`) |
| ④ | §3.4 | `days → bars` 매핑 = `features/progress-overview/model/weeklyView.ts` (copy 소유 feature) |
| ⑤ | §2.4 | SectionLabel weight semibold → **bold** (Spec 이 가리킨 Stage 6 recipe 자체가 bold + `tracking section-label`) |
| ⑥ | §2.9 | 리포트 카드 Error = 셸 없는 `ErrorState` 단독 (`ErrorState` 가 자체 Surface — 카드 안 카드 방지) |
| ⑦ | §3.2 · §6 | pressed opacity `--opacity-pressed` — 저장소에 토큰 **없음** (`grep` 0) → pressed 시각 표시 없음 (H7-3.8 ⑩) |

Status 줄은 바꾸지 않았다. 결정이 필요한 `C-02`(§2.1.1 위치 행)는 **고치지 않았다**.

#### `VG7-C-10` 막대 축척 — `VG7-B-03` 과의 상호작용 `[px]`

열 중심 teal 화소 수 (Figma `[meta]` 와 ±1 일치):

| 요일 | 값 | Figma | 구현 (트랙 58) | ⓑ 채택 시 (트랙 62, 계산) |
|---|---|---|---|---|
| M | 8m | 34.9 | 23 | 24.8 |
| T | 13m | 56.7 | 38 | 40.3 |
| T | 16m | 63 (클립) | 46 | 49.6 |
| F | 11m | 48 | 32 | 34.1 |
| S | 20m | 63 (클립) | **58** | **62** |
| S | 4m | 17.45 | 12 | 12.4 |

- Figma 막대는 **4.36 px/분 선형 + 상한 63 클립**이고, 구현은 `AD7-6`(`N7-29` ⓐ 승인) **최댓값 = 트랙** 비례다 → 20m 를 제외한 모든 막대가 **−30~35%** 짧다. frame 에서 보이는 차이의 대부분은 이것이다.
- `VG7-B-03` ⓑ(라벨 줄 11)는 축척을 58 → 62 로 **+7%** 바꿀 뿐이라 20m 막대 Δ 5 → 1, 나머지는 여전히 −28~33%. 막대 아래끝 Δ−1~2 도 ⓑ 로 해소된다.
- **사용자 참고**: `VG7-B-03` 결정은 이 화면에서 "최대 막대 높이·아래끝 정렬"만 바꾼다. "막대들이 Figma 보다 낮아 보인다"는 인상은 `AD7-6` 의 결과이며 B-03 으로 풀리지 않는다 (재검토하려면 `N7-29` 를 다시 여는 결정 — 이 리포트는 제안하지 않는다).

#### `VG7-C-11` `110:835` ↔ 리포트 카드 6장 `[fig][px]`

발행 카드(`s7-report-card-published` 345×154 ↔ Figma 카드 영역 345×230) 글리프 행:

| 요소 | Figma (카드 기준 y) | 구현 | Δ | 원인 |
|---|---|---|---|---|
| 제목 | 19~32 | 21~35 | +2 | line 20 vs 18 |
| 설명 1·2줄 | 43~53 · 61~71 | 44~54 · 60~70 | +1 · −1 | caption-1 line 16 vs 18.13 · 12 vs 12.5 (`AD7-7`) |
| 보조 | 83~90 | 80~87 | −3 | 누적 |
| 진행 막대 | y111 · x16~**283** | y104 · x16~**328** | −7 · 폭 268 → 313 | 줄 높이 누적 · `AD7-4`(span 미렌더 → ⑮) |
| 버튼 | 133~182 | — | — | `AD7-9` (`S7-F`) |
| footer | *"… · we'll email it too."* | *"Next report on Jun 7"* | — | `AD7-3` |
| 카드 높이 | 230.5 (버튼 제외 166.5) | 154 | −12.5 | 줄 높이 4줄(설명 2 · 보조 · footer) |

- 설명 문장 줄바꿈 위치(*"…on the four / themes, …"*) 동일 · 아이콘 글리프 +1 · 막대 꽉 참(`VG7-A-05` ⓑ 반영 ✅).
- C-13 5상태(`first-cycle` · `generating` · `deferred` · `delayed` · `no-previous`) = Spec §2.2 표의 문구 · 막대 유무 · footer 유무와 일치 (육안). `no-previous` 막대 40% ✅ (AC-7-76 판별 장면).
- 판정: 차이는 전부 기존 후보(`AD7-3`·`4`·`7`·`9`·`10`) 또는 줄 높이 🆕 후보 범위.

#### `VG7-C-12` ⑪ · ⑬ · ⑮ — 수용 `[직독][px]`

- ⑪ `s7-progress-error`: 주간·리포트 두 영역 모두 같은 `ErrorState`(카드 안 카드 없음). 독립 오류(AC-7-29)라 같은 패널이 둘 보이는 것은 의도 — Spec §2.9 정정(⑥).
- ⑬ `s7-past-reports`: *PAST REPORTS* bold + tracking — Stage 6 `SettingsMenu` recipe 와 같은 모양. Spec §2.4 정정(⑤).
- ⑮ 막대 트랙 313: `AD7-4` 의 직접 결과 → **`AD7-4` 문구에 "track 268.47 → 313" 포함 제안** (H7-3.9 표가 이미 그렇게 적었다).

#### `VG7-C-13` `R-SHADOW-1` 프로브 sanity `[계산]`

`--shadow-glass-rest` drop 3겹(`0 2 4 / 8%` · `0 12 28 / 16%` · `0 28 56 / 12%`, ink-600) 을 **3겹 전부** 가우시안(σ = blur/2)으로 합성해 카드 가장자리 밖 **6px** 지점 예상 채널합 Δ (ink-600 ↔ 앱 배경 차 ≈ 350):

| 위치 | 겹별 알파 (1 · 2 · 3) | 합성 알파 | 예상 Δ | H7-3.6 실측 (393) | 판정 |
|---|---|---|---|---|---|
| 좌 · 우 | ≈0 · 0.053 · 0.050 | 0.10 | **≈35** | 39 · 39 (리포트 35 · 35) | ✅ |
| 위 (offset 이 아래라 유효 거리 8 · 18 · 34) | ≈0 · 0.016 · 0.014 | 0.03 | **≈10** | 12 | ✅ |
| 아래 (유효 거리 4 · −6 · −22) | 0.013 · 0.107 · 0.094 | 0.20 | **≈70** | 65 · 64 | ✅ (아래 배경이 더 밝은 카드면이라 약간 작다) |

- 4방향 모두 이론값 ±5 안 → 프로브가 **3겹을 다 보고 있다**(2번째 겹만 셌다면 아래 ≈37). 600 의 "컬럼 밖 3px" 4~7 > 0 → 컬럼 밖에서 **잘리지 않음** 확인.
- 한계: 6px 프로브는 **존재**를 보고 **도달 거리**(좌우 28~32)는 재지 않는다. 393 이하 좌우 클립은 화면 가장자리(뷰포트 전 폭 스크롤 박스)에서만 일어나 보이지 않는다(rule ④) — 클리핑 조상 1개 · 새 `overflow` 0 이라는 H7-3.6 서술과 모순 없음.

#### `VG7-C-14` H7-3.8 나머지 — 수용

| # | 판정 |
|---|---|
| ⑤ 매핑 위치 | 수용 — Spec 정정 ④ |
| ⑥ 끝 날짜 = 시작 + 6 (`shiftCalendarDate`) | 수용 — 표기 산식이며 `P7-BIP-01` 에 전제 기록됨 |
| ⑦ 주 선택 = URL `?week=` | 수용 — 시각 영향 0 |
| ⑧ stale 30s | 수용 — 시각 영향 0 (Plan 판단은 QA) |
| ⑩ pressed 표시 없음 | 수용 — Spec 정정 ⑦. 토큰을 만들려면 별도 요청 |
| ⑫ 생성 중 Spinner 라벨 숨김 | 수용 — `s7-report-card-generating` 에 *Loading* 중복 0 · 행 `role="status"` |
| ⑭ `1 session` 단수 | 수용 — Figma *sessions* 는 5 일 때의 문자열 |

#### `VG7-C-15` `COMPONENT_MAP.md` — 반영 (design-agent)

갱신 메모 1 · Domain 행: `WeeklyReadingCard`(구 `WeeklyReadingChart` 행) · `NotableQuoteCard`(props `eyebrow`·`quote`·`speakerName`·`source`, 구현됨) · 신규 `GrowthThemesCard` · `ReportGlassCard` · Feature 행: `GrowthReportOverview` → `ProgressOverview`(구성 실제 이름) · `ReportArchiveCard` 행에 `ReportCard` 구현 기록 · Page-only `ProgressTopBar`.

### 3. 허용 차이 후보 (등록 안 함 — 사용자 승인 후)

| 후보 | 내용 | 권고 |
|---|---|---|
| `C-02` ⓐ 일 때만 | `31:115` 제목 행 y0 · 겹침 26 (Figma 36) | ⓑ 를 권고 — 채택되면 후보 소멸 |
| `C-04` ⓑ 일 때만 | `31:118` · `30:90` chip 오른쪽 끝 x349 (Figma x369) | ⓐ 를 권고 — 채택되면 후보 소멸 |
| 🆕 아이콘 stroke | Lucide 공통 1.5 — Figma `110:838` 1.65 · `31:120` 1.2 (`C-05`) | 등록 권고 |
| 🆕 줄 높이 흡수 (H7-3.9 확장) | `163:2551` · `110:835` + **`163:2607`**(카드 약 +7 → 아래 블록 +7) | 등록 권고 — 범위에 `163:2607` 추가 |
| `AD7-4` 문구 | span 미렌더 **+ track 268.47 → 313** (⑮) | 등록 권고 |
| `AD7-7` 결과 항목 | 막대 트랙 58 (B-03 ⓐ) 또는 62 (B-03 ⓑ) | `VG7-B-03` 결정에 따름 |

### 4. 후속

| 대상 | 할 일 | 시점 |
|---|---|---|
| 사용자 | `VG7-C-02` ⓐ/ⓑ/ⓒ (권고 ⓑ) · `VG7-C-04` ⓐ/ⓑ (권고 ⓐ) · `VG7-B-03` (미결 — `C-10` 참고) · 허용 차이 후보 §3 | Stage 7 QA Figma 대조 전 |
| development-agent | `C-02` ⓑ: `--progress-character-top` 4 · e2e · baseline / `C-04` ⓐ: `TopBar large` 빈 leading 2열 · Library·Progress baseline `=all` 재생성 + 원인 분해 · chip 오른쪽 끝 단정 복구 | 결정 후 |
| stage-qa-agent | AC-7-70 "새 overflow" 기대 = **0** (Spec 개정 ②) · AC-7-76 판별 scenario = `report-no-previous` (H7-3.3) · `C-13` 프로브 한계(도달 거리 미측정) 기록 | Stage 7 QA |
| plan-agent | AC-7-70 · AC-7-78 문구의 "`overflow: clip` 1건" → 0 반영 여부 | Plan 개정 시 |

---

## S7-D

리포트 상세 `/progress/reports/:reportId` 단위 (`docs/qa/stage-7-handoff.md` H7-4). 검토일 2026-11-20. **Playwright 미실행** (다른 lane 이 e2e 실행 중 — 지시). 신규 baseline 6장(`e2e/__screenshots__/darwin/report-detail.spec.ts/*.png`)을 PIL 로 직접 읽었고 코드·토큰·spec 은 직독했다.

**비교 기준**: 이 화면은 Figma 프레임이 없는 C-13 화면(`C13-S7-1` · `C13-S7-7` · `C13-S7-9`, `D7-3`)이다 → 기준 = 승인 Spec `stage-7-design-spec.md` §2.3 · §2.3.1~4 · §2.9 · §3.6~3.8 · §9 · §10.3 + 재사용 요소의 Figma 시각 언어(`163:2607` 데이터 카드 · `163:2633` 인용 · Stage 6 `PersonaCard`/`DiamondChart`).

### 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[meta]` | Figma `get_metadata(16:2)` — **라이브 조회 2026-11-20** (`mcp__8c8226df…`). 결과 197,909자 전량을 스크립트로 읽어 depth ≤ 2 frame/section 목록 + 전 노드 이름 정규식(`report|clip|pdf|highlight|4-week|persona|stage 7|C13-S7`) | 새 프레임 유무 (H7-4.2 의 미확인 항목) |
| `[fig]` | `get_screenshot(163:2607, 400)` → 353×225 | 데이터 카드 시각 언어 대조 |
| `[px]` | PIL — baseline 6장. 카드 경계 열/행 밝기 전이 · 그림자 영역 채널합 Δ(배경 대비) · 실제 배경 픽셀 위 대비 계산 | `main`(345×2516) · `first`(345×1916) · `frame`(393×852) · 상태 3장(345×768) |
| `[계산]` | `--shadow-bubble` drop 1겹(`0 6 4 ink-600 8%`) 가우시안(σ = blur/2) → 프로브 지점 예상 Δ · WCAG 대비 | `VG7-D-13` · `VG7-D-06` · `VG7-D-08` |
| `[직독]` | `features/report-detail/**` · `PersonaCard.tsx` · `ErrorState.tsx` · `EmptyState.tsx` · `e2e/report-detail.spec.ts` · 토큰 CSS · contracts `error-codes.ts` | — |

참고: `main`·`first` 아래쪽 빈 배경(각 210 · 506px)은 spec 이 뷰포트를 2600 · 2000 으로 키운 뒤 `main` 을 찍은 결과다 (`report-detail.spec.ts:327·338`) — 콘텐츠 결함 아님.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG7-D-01` | Figma `16:2` 새 프레임 (상세 · 클립 · PDF, Q7) | **없음** — Figma 우선 대상 0 | — | 아니오 | 불필요 |
| `VG7-D-02` | 화면 골격 · 섹션 순서 · 카드 recipe · heading | **일치** (Spec §2.3) | — | 아니오 | 불필요 |
| `VG7-D-03` | ① 다이아몬드 + previous 오버레이 · 범례 · 근거 `dl` | **일치** | — | 아니오 | 불필요 |
| `VG7-D-04` | ② 페르소나 타임라인 (다항목 · 1항목) | **일치** (1항목 eyebrow *NOW* 는 Spec 미기재 → 정정) | — | 아니오 | 불필요 |
| `VG7-D-05` | ③ 대화 지표 · ⑤ 부모 피드백 | **일치** | — | 아니오 | 불필요 |
| `VG7-D-06` | ④ 인용 카드 — `P-37` 실제 배경 재측정 | 일치 · 인용 ink-700 **4.28~4.39** · 출처/eyebrow ink-500 **2.06~2.12** (기존 `P-37` 범위 안) | Low | 아니오 | 불필요 (`P-37` 유지 — 디자이너) |
| `VG7-D-07` | H7-4.8 ② `PersonaCard nameAs?` (Spec 밖 3번째 prop) | **수용** — Spec 정정 ⑪ | — | 아니오 | 불필요 |
| `VG7-D-08` | ⑤ 체크 트렌드 메타 `5×` = `fg-tertiary` (ink-400) on 카드 **2.31~2.39** | **명세 공백** — 가값 목록에 없는 저대비 텍스트 | Low | 아니오 | **필요** (ⓐ/ⓑ) |
| `VG7-D-09` | H7-4.8 ⑩ C-13 간격 값 (`P-39`) | **수용** — Spec §2.3.2 에 기록 (정정 ⑫) | — | 아니오 | 불필요 |
| `VG7-D-10` | 상태 화면 (Not ready · Not found · Offline · Error · Loading) + H7-4.8 ④ · ⑪ | **일치** · Not found 버튼 위치 · Loading 높이 **수용** | — | 아니오 | 불필요 |
| `VG7-D-11` | H7-4.8 ⑨ 빈 클립 섹션 미렌더 | **수용** — Spec 정정 ⑬ | — | 아니오 | 불필요 |
| `VG7-D-12` | Spec 정정 ⑧~⑭ | **반영함** (design-agent, 개정 노트) | — | 아니오 | 불필요 |
| `VG7-D-13` | `R-SHADOW-1` 프로브 — 합산 그림자 대비 | **이론값과 일치** (아래 · 좌우 모두 baseline 픽셀로 재측정) | — | 아니오 | 불필요 |
| `VG7-D-14` | `COMPONENT_MAP.md` (H7-4.8 ⑭) | **반영함** (design-agent) | — | 아니오 | 불필요 |
| `VG7-D-15` | `N7-15` 점수 숫자 0 · 관찰 언어 | **일치** | — | 아니오 | 불필요 |

**Severity 합계: Critical 0 · High 0 · Medium 0 · Low 2 (`D-06` · `D-08`). Blocking 0.** 사용자 결정 1건(`D-08`). 허용 차이(AD) 후보 **0** — Figma 프레임이 없어 Figma 대비 차이가 성립하지 않는다 (재사용 recipe 는 기존 `AD7-8` · `AD7-10` 을 물려받을 뿐).

### 2. 항목 상세

#### `VG7-D-01` Figma `16:2` 새 프레임 — 없음 `[meta]`

- `16:2` 하위 section 4개(`31:204` Home & Session · `179:1700` Signup & Baseline · `296:1127` Recording · `317:1358` Stage 6 DRAFT) — **Stage 7 section 없음**. `31:204` 아래 Report 관련 frame 은 기존 `31:102`(*2b · Report — Weekly Growth*) · `110:522` 뿐.
- 전 노드 이름 검색: report/clip/pdf/highlight 계열 = `31:102` · `31:209` · `110:845` *4-week full report* · `110:859` *Download PDF* · `110:861` · `110:875` 만 (모두 S7-C 에서 쓴 기존 노드). persona 계열 = Stage 6 DRAFT 의 `PersonaCard (illustration none)` 5개(`319:*` · `323:2072` — design-agent 초안, 디자이너 프레임 아님).
- → Q7-1~9 디자이너 프레임 **미도착**. 최우선 규칙(Figma 우선) 적용 대상 0. Spec `R7-01`(도착 시 재정렬) 유지.

#### `VG7-D-02` 골격 · 순서 · recipe — 일치 `[px][직독]`

| 항목 | Spec | 구현 | 판정 |
|---|---|---|---|
| TopBar | centered *4-week report* h1 + Back | `ReportDetailTopBar` — `frame` 에 `<` + 가운데 제목 | ✅ |
| header | pt `--space-6` · 기간 title-3 bold · summaryLine subheadline | 같음 (`frame` y≈66 *Apr 13 – May 10*) | ✅ |
| 섹션 순서 | header → ① → ② → ③ → ④ → ⑤ → ⑥ → ⑦ | 같음 (⑥⑦ slot 비어 있음) | ✅ |
| 섹션 간격 | `--space-5` 20 | `main` 지표 카드 아래끝 y1736 → 인용 카드 y1756 = **20** | ✅ |
| 카드 | 전부 `ProfileCard` (`--shadow-bubble`) · Glass Rest 0 | 같음 — 인용만 `NotableQuoteCard`(그림자 0) | ✅ |
| 카드 시각 언어 | `163:2607` (흰 카드 · 제목 Bold 15 · 행 라벨 ink-600 · 메타 ink-400) | 제목 subheadline bold · 행 라벨 `--color-action-secondary-fg` · 메타 tertiary — `[fig]` 와 같은 위계 | ✅ |
| 새 `overflow` | 0 | 0 (`report-detail.css` 직독 · e2e 클리핑 조상 1개 단정) | ✅ |

#### `VG7-D-03` ① Growth themes — 일치 `[px][직독]`

- 다이아몬드 = Stage 6 기하 + `previous` 점선(외곽선만 · 꼭짓점 0) · 현재 면 위. `first`(주기 1, previous `null`) = 점선 0 · 범례 0 ✅ (`report-no-previous` 와 같은 분기).
- 범례 *--- Earlier* · *▢ This report* 차트 아래 가운데 (S7-B `legend` 그대로).
- 근거 `dl`: `dt` caption-1 semibold `--color-action-secondary-fg` · `dd` subheadline primary · 행 간격 12 · 차트와 사이 `--color-divider` 1px (행 있을 때만 — H7-4.8 ⑬, 수용). IM `evidence = null` 행 미렌더 ✅ (`main` 3행 · `first` 2행).
- SR summary: *"Growth themes for {name} in this report."* + 점선 안내 + 미관찰 축 — 방향·증감 문장 0 (`growthSummary` 직독) ✅.
- H7-4.8 ③ (`CapabilityDiamond` 대신 `DiamondChart` 직접 + `toCapabilityAxes`) — Stage 6 summary 문장이 상세 §9.2 와 달라서. **시각 영향 0 → 수용**.

#### `VG7-D-04` ② 페르소나 타임라인 — 일치 `[px][직독]`

- 다항목(`main`): 섹션 제목 h2 카드 밖 → `ol` [rail 16 | 카드]. eyebrow *SINCE MAR 16* · *SINCE APR 20* · *NOW* · 출처 3종(*From your answers* · *From your storytimes* · *From your updated answers*). 현재 점 = teal(`--color-action-primary-bg`) · 이전 = ink-400 · 마지막 행 선 없음 ✅.
- rail 점 세로 위치: `frame` 점 중심 ≈ y790, eyebrow 글리프 y786~795 → **eyebrow 첫 줄 가운데** ✅ (CSS 식 = 카드 pad 16 + (caption-1 line − 10)/2).
- 1항목(`first`): rail 0 · 카드 1장 + *"… persona stayed the same through this report."* footnote primary ✅. eyebrow = *NOW* — Spec 은 "마지막 항목만 NOW" 만 적었고 1항목을 따로 말하지 않았다. 유일 항목 = 마지막 항목이므로 같은 규칙 → **수용, Spec 정정 ⑫**.
- 40자 이름(`first`): 섹션 제목 2줄 줄바꿈 · 말줄임 0 ✅.

#### `VG7-D-05` ③ 지표 · ⑤ 피드백 — 일치 `[px][직독]`

- ③ 5행 `9` · `1h 58m` · `146` · `64` · `19` (주기 1: `0` 그대로 표시 ✅). 라벨 ↔ 값 `justify-between` · baseline 정렬 · 값 bold tabular-nums. 긴 이름에서 라벨 *Things Alexandria … said* 2줄 · 값은 첫 줄 baseline 에 붙음 — 읽힘 문제 없음.
- *LATELY WE NOTICED* SectionLabel(caption-1 bold · tracking) + 서버 문장 목록 ✅.
- ⑤ summaryText → *WHAT YOU CHECKED* (체크 라벨 = `entities/reflection` · `5×` · `3×` · `2×`) → *TOPICS THAT CAME UP* 쉼표 나열 ✅. 주기 1 = 카드 · h2 유지 + *"You didn't leave notes during this report."* footnote ✅.
- 메타 색 → `VG7-D-08`.

#### `VG7-D-06` ④ 인용 — 일치 · `P-37` 재측정 `[px][계산]`

- 2장 · 같은 eyebrow *IN EMMA'S WORDS* · gap `--space-3-5` 14 (Spec §3.6) · 출처 *May 5 · The Most Magnificent Thing* / 책 없음 → *Apr 22* ✅.
- Spec `P-37` 은 "VG 에서 실제 배경 픽셀 재측정" 을 요구했다. `main` 인용 카드 면(배경 gradient 아래쪽 lavender 구간) 실제 픽셀 `(191~193, 208~211, 211~213)`: 인용 ink-700 **4.28~4.39** · eyebrow/출처 ink-500 **2.06~2.12**. 상세는 스크롤이 길어 인용 카드가 **gradient 끝(lavender)** 에 놓이므로 Progress 보다 낮은 쪽에 붙는다 — 기존 `P-37` 범위(3.98~5.20 · 1.92~2.51) 안. **새 가값 아님**, 디자이너 확인(Q7-15) 때 이 수치를 함께 전달.

#### `VG7-D-07` `PersonaCard nameAs?` — 수용 `[직독]`

- 히스토리는 섹션 h2 아래 카드 3장 → 이름이 h2 면 형제 h2 가 섹션 제목과 같은 레벨이 된다. h3 가 맞다. 기본 `h2` → Stage 6 DOM 불변(H7-4.5 AC-81 증거: HEAD 컴포넌트 innerHTML 대조). 시각 변화 0 (`Text variant` 고정).
- 같은 역할·같은 API 의 확장이라 새 컴포넌트 불필요. **Spec §3.8 · §2.3.2 에 추가 (정정 ⑪)**.

#### `VG7-D-08` 체크 트렌드 메타 `5×` 대비 — 사용자 결정 `[px][계산]`

- 구현 = `caption-1 medium tertiary` (ink-400 `#9aabaa`). 카드 면 `#fafbfb` 위 **2.31** (흰 면 2.39). 목표 4.5.
- Spec §2.3.4 는 "`163:2610` recipe" 라고만 적었고, Figma 그 recipe 의 메타(*strong* 등) 색이 ink-400 이라 구현은 Spec 을 따랐다. 그러나 **`P-35` 는 Progress 의 지정 텍스트만** 나열했고, 이 화면은 Figma 프레임이 없는 C-13 이다. Stage 6 은 C-13 화면 보조 텍스트를 본문색 쪽으로 올렸다(`N6-33`).
- `aria-hidden` 이라 SR 은 *", 5 times"* 를 듣지만, **시각 사용자에게는 횟수 정보가 이 글자뿐**이다.

| 안 | 내용 | 대비 | 장점 | 단점 |
|---|---|---|---|---|
| ⓐ `P-35` 범위 확장 | 현 구현 유지, 가값 목록에 "상세 ⑤ 메타" 추가 | 2.31 | 변경 0 · `163:2610` recipe 와 같은 모양 | Figma 근거 없는 화면에서 저대비를 새로 등록 |
| ⓑ **`tone="secondary"`** (ink-500) | `Text tone` 1곳 변경 | **3.17** (기존 `P-01` 범위) | `N6-33` 선례와 일관 · 새 가값 0 · `163:2610` 의 라벨/메타 위계(라벨 진함 · 메타 연함)는 유지 | baseline `s7-report-detail-main` 1장 재생성 |

**권고: ⓑ.** C-13 화면에서 정보를 담은 유일한 시각 표시를 `P-35` 수준으로 두지 않는다. 같은 판단으로 ① 근거 · ③ 지표 라벨은 이미 ink-600 이라 해당 없음.
- ⓑ 채택 시 development-agent: `ReportDetailView.tsx` FeedbackSection 메타 `tone="tertiary"` → `"secondary"` · `s7-report-detail-main` 재생성 + 원인 분해(`R-BASELINE-1` 5 — 변화 = 메타 3글자 영역만이어야 함).

#### `VG7-D-09` C-13 간격 값 (`P-39`) — 수용 `[직독][px]`

rail ↔ 카드 8 · 타임라인 행 12 · 섹션 제목 ↔ 목록 12 · 근거 dt↔dd 4 · SectionLabel ↔ 내용 8 · header 기간 ↔ 문장 4 — 전부 기존 `--space-*` 스케일. 같은 화면의 다른 카드 내부 간격(ProfileCard gap)과 리듬이 맞고, `main`·`frame` 육안에서 덩어리 구분이 분명하다. **수용**, Spec §2.3.2 에 값 기록(정정 ⑫). `P-39` 가값 그대로(디자이너 프레임 도착 시 교체).

#### `VG7-D-10` 상태 화면 — 일치 · H7-4.8 ④ ⑪ 수용 `[px][직독]`

| 상태 | Spec §2.9 | baseline | 판정 |
|---|---|---|---|
| Not ready (`REPORT_NOT_READY` · `REPORT_NOT_ELIGIBLE`) | `EmptyState clock` + 문구 2 + *Back to Progress* | `not-ready` — 시계 아이콘 · accent 버튼 | ✅ |
| Not found | `ErrorState` *We couldn't find this report.* + *Back to Progress* | `not-found` — 경고 아이콘 · **glass** 버튼 | ✅ (④ 수용) |
| Offline | `ErrorState tone="offline"` | `offline` — wifi-off · *Try again* | ✅ |
| Error · Loading | `ErrorState` + Try again · Skeleton | 단위 테스트 증거(H7-4.5 AC-45) — baseline 없음 | ✅ (직독) |

- ④ Not found 버튼 = `ErrorState` 회복 버튼 자리: `ErrorState` 는 회복 버튼을 **glass** 로 그리고 아이콘이 없다(`ErrorState.tsx` 직독 — 재시도 아이콘 0). 그래서 *Back to Progress* 라벨이 "재시도" 로 오인될 시각 단서가 없다. Not ready(accent)와 같은 행동인데 강조가 다른 점은 **오류 화면의 회복 버튼 = glass** 라는 앱 공통 규칙의 결과 → **수용**. Spec 정정 ⑨.
- ⑪ Loading: Spec 의 `block h(차트+40) → block h200 ×2` 는 `Skeleton` 에 높이 지정 block 이 없어 그대로 못 만든다. 구현 = header `text 2` → `ProfileCard` 안 차트 높이 rect(Stage 6 식 복제) → `ProfileCard` 안 `text 5` ×2. 실제 카드 모양에 더 가깝다 → **수용**, Spec 정정 ⑩. (Stage 6 식 복제는 feature 간 import 금지 때문 — 두 번째 복제가 생기면 entity 로 올릴 후보.)

#### `VG7-D-11` 빈 클립 섹션 미렌더 — 수용 `[직독]`

Spec §2.3 은 "클립 0개면 섹션 미렌더" 였다. S7-E 전에는 slot 이 없어 클립이 있어도 그릴 수 없으니, 빈 *Highlight clips* 카드를 두면 **기능 없는 섹션**이 된다. 미렌더가 맞다. 셸(`ProfileCard h2`)은 S7-E 가 slot 과 함께 만든다 → Spec 정정 ⑬. S7-E Visual Gap 에서 클립 0개 · slot 있음 조합을 다시 본다.

#### `VG7-D-12` Spec 정정 — 반영 (개정 노트 `stage-7-design-spec.md` 머리)

| # | 위치 | 정정 |
|---|---|---|
| ⑧ | §2.9 · §7 | Not found 코드 `NOT_FOUND` → contract 이름 **`RESOURCE_NOT_FOUND`** (`packages/contracts/src/common/error-codes.ts`) |
| ⑨ | §2.9 | Not found 버튼 = `ErrorState` 회복 버튼 자리(glass) (`D-10`) |
| ⑩ | §2.9 | 상세 Loading 구성 (`D-10`) |
| ⑪ | §3.8 · §2.3.2 | `PersonaCard nameAs?` 추가 (`D-07`) |
| ⑫ | §2.3.2 | 1항목 eyebrow *NOW* · C-13 간격 값 기록 (`D-04` · `D-09`) |
| ⑬ | §2.3 ⑥ | slot 미지정 = 미렌더 · 셸은 S7-E (`D-11`) |
| ⑭ | §9.1 | 상세 heading *h2 ×6* → **h2 ×4 (+ 클립 1)** · 페르소나 이름 h3 — 인용 · PDF 는 heading 이 없어 6 이 될 수 없다 (서술 오류) |

Status 줄은 바꾸지 않았다. 결정이 필요한 `D-08`(§2.3.4 메타 색)은 **고치지 않았다**.

#### `VG7-D-13` `R-SHADOW-1` 프로브 — 합산 그림자 대비 `[계산][px]`

`ProfileCard` = `--shadow-bubble` → drop **1겹** `0 6 4 ink-600 8%` (+ inset 2겹 — 카드 안쪽이라 밖 번짐 0). 합산할 겹은 1개뿐이다 (Glass Rest 3겹 아님 — Spec §2.3 이 상세에서 Glass Rest 를 뺀 이유). 이론 번짐: 좌우 ≈4 · 위 0(offset 6 > blur 4) · 아래 6 + 4 = **10**.

e2e ④ 는 Δ>0 만 단정하고 수치를 남기지 않았다(H7-4.5 AC-70) → **baseline 픽셀로 직접 재측정**:

| 지점 | e2e 프로브 | 이론 Δ (ink-600 ↔ 배경 ≈ 346 × 알파) | baseline 실측 Δ | 판정 |
|---|---|---|---|---|
| 아래 3px (`bottom+2`) | ✓ | 0.08 × Φ(1.75) → **≈27** | `main` 지표 카드 x172: **23** | ✅ |
| 아래 7px (`bottom+6`) | ✓ | 0.08 × (1 − Φ(0.25)) → **≈11** | **12** | ✅ |
| 아래 도달 | — | 10 | Δ 3 @ +10 · **0 @ +11** | ✅ |
| 왼쪽 2px · 오른쪽 2px | ✓ | 0.08 × (1 − Φ(0.75)) → **≈6** | `frame` Growth 카드 y400: 왼 **8** · 오른 **8** (1px 12) | ✅ |
| 좌우 도달 | — | ≈4 | Δ ≤ 3 @ 3~4px · 0 @ 5px | ✅ |
| 위 | — | 0 | (프로브 없음 — 이론상 번짐 0) | ✅ |

- 아래 번짐 10 < 섹션 간격 20 · 좌우 4 < 거터 24 → **겹침·클립 0**. 클리핑 조상 = AppShell 뷰포트 1개(뷰포트 전 폭) — e2e ④ 단정과 모순 없음.
- 프로브가 2·6px 지점을 고른 것은 1겹 번짐(4 / 10) 안쪽이라 적절하다. 한계: Glass Rest 와 달리 도달 거리 자체가 짧아 S7-C 의 "도달 거리 미측정" 한계는 여기서 실질 영향이 없다.

#### `VG7-D-14` `COMPONENT_MAP.md` — 반영 (design-agent)

갱신 메모 1 · Domain `PersonaCard` 행에 `eyebrow?` · `footnote?` · `nameAs?` · Feature `ReportDetailView, ReportPdfAction` 행에 `ReportDetailView` · `PersonaHistory` 구현 기록(구성 · props · 상태) · Page-only `ReportDetailTopBar` 신규 행.

#### `VG7-D-15` `N7-15` 숫자 0 · 관찰 언어 — 일치 `[직독][px]`

- ① 차트 · 범례 · summary · 근거 어디에도 점수·증감 숫자 0 (`main` · `frame` 육안 + `growthSummary` 직독 — 점수는 형상에만).
- 화면에 보이는 숫자는 ③ 횟수·시간(Spec §2.3.3 승인 — 비교·순위·백분율 0) · ⑤ `{n}×` 횟수 · 날짜뿐.
- `features/report-detail/copy.ts` 전 문구에 Spec §10.5 금칙어 0 (*Earlier* · *This report* · *stayed the same* — 방향 판정 아님).

### 3. 허용 차이 후보 (등록 안 함 — 사용자 승인 후)

| 후보 | 내용 | 권고 |
|---|---|---|
| — | **없음** — Figma 프레임이 없는 C-13 화면이라 Figma 대비 차이가 성립하지 않는다. 재사용 recipe 는 기존 `AD7-8`(eyebrow 색) · `AD7-10`(radius) 후보를 그대로 물려받는다 | — |
| (가값) `D-08` ⓐ 일 때만 | `P-35` 범위에 "상세 ⑤ 메타 `{n}×` ink-400 2.31" 추가 — AD 가 아니라 가값 | ⓑ 권고 — 채택되면 소멸 |

### 4. 후속

| 대상 | 할 일 | 시점 |
|---|---|---|
| 사용자 | `VG7-D-08` ⓐ/ⓑ (권고 ⓑ) | Stage 7 QA 전 |
| development-agent | `D-08` ⓑ: 메타 tone secondary · `s7-report-detail-main` 재생성 + 원인 분해 | 결정 후 |
| design-agent | S7-E: 클립 0개 + slot 있음 조합 · `Highlight clips` 셸 (`D-11`) / S7-F: ⑦ PDF 배치(`mt --space-3` vs 섹션 간격 20 — `report-detail.css` 주석은 "섹션 간격 자리로 둔다") | S7-E · S7-F Visual Gap |
| stage-qa-agent | AC-7-67 heading 기대값 = h2 ×4 (+ 클립 1) (Spec 정정 ⑭) · Not found 코드 `RESOURCE_NOT_FOUND` (정정 ⑧) · `P-37` 상세 실측(`D-06`) 가값 목록 기록 | Stage 7 QA |
| 디자이너 (Q7) | 상세 · 클립 · PDF 프레임 여전히 미도착 (`D-01`) — 도착 시 `R7-01` 재정렬 | 병행 |

---

## S7-E

하이라이트 클립 플레이어 — 리포트 상세 ⑥ slot (`docs/qa/stage-7-handoff.md` H7-5). 검토일 2026-11-20. **Playwright 미실행** (다른 lane 이 e2e 실행 중 — 지시). 신규 baseline 7장(`e2e/__screenshots__/darwin/highlight-clip.spec.ts/*.png`)과 변경 1장(`report-detail.spec.ts/s7-report-detail-main.png`)을 PIL 로 직접 읽었고 코드·토큰·Spec 은 직독했다.

**비교 기준**: Figma 프레임이 없는 C-13 화면 `C13-S7-3` (`D7-3`, `N7-46`) → 기준 = 승인 Spec `stage-7-design-spec.md` §2.3 ⑥ · §2.5 · §6 플레이어 · §9.1 · §9.3~9.5 · §10 클립 행 + 재사용 요소(`ProfileCard` · `IconButton glass` `78:158` · `ProgressBar sm` `179:1779`).

### 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[meta]` | Figma `get_metadata(16:2)` — **라이브 조회 2026-11-20** (`mcp__8c8226df…`, 이번엔 응답 성공 — dev 세션은 실패, H7-5.2). XML 197,909자 전량을 스크립트로 읽어 depth ≤ 2 frame/section 목록 + 전 노드 이름 1,849개 정규식(`report\|clip\|pdf\|highlight\|4-week\|stage 7\|C13-S7\|player\|audio`) | 새 프레임 유무 |
| `[px]` | PIL — 상태 7장(345×208 / 345×256) · `main` 신·구. 텍스트 열(x 72~330) 잉크 행 run 으로 줄 위치 · 버튼 열(x 28~50) 아이콘 run 으로 버튼 중심 · 버튼 경계 밖 채널합 Δ · 실제 카드 면 픽셀 위 WCAG 대비 | `VG7-E-02~08` |
| `[diff]` | PIL `ImageChops.difference` — 재생성 `main`(345×2816) vs **S7-D 본** | `VG7-E-03` |
| `[직독]` | `entities/highlight-clip/**` · `features/highlight-clip-player/**` · `ReportDetailPage.tsx` · `IconButton.tsx/.css` · `Spinner.css` · `ProgressBar.css` · typography/color 토큰 · `index.css` body | — |

S7-D 본 출처: `main` 은 **untracked**(HEAD 에 없음 — `git ls-files` 0)라 `git diff` 불가. 대신 dev 가 비교 모드 실패 때 남긴 Playwright 산출물 `scratchpad/diff/s7-report-detail-main-expected.png`(345×2516, 02:08 — **S7-D 승인 baseline 과 같은 크기**)를 S7-D 본으로 썼다.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG7-E-01` | Figma `16:2` 새 프레임 (클립 · Q7-3) | **없음** — Figma 우선 대상 0 | — | 아니오 | 불필요 |
| `VG7-E-02` | 6상태 · 행 레이아웃 · 버튼 · 진행 · 시간 · 불가/오류 문구 | **일치** (아래 `E-04` · `E-05` 제외) | — | 아니오 | 불필요 |
| `VG7-E-03` | `main` 변경 — ⑥ 위 콘텐츠 불변 (dev 주장 검증) | **확인** — 행 0~2325 최대 Δ **5**(>8 = 0행), 차이는 아래로 갈수록 1→5 증가(배경 gradient 늘어남) · 2326~ = 클립 카드 · 섹션 간격 20 | — | 아니오 | 불필요 |
| `VG7-E-04` | 오류/불가 문구 줄 높이 **22**(body) — Spec caption-1 = **16** | **불일치** (구현 결함) | Low | 아니오 | 불필요 (수정) |
| `VG7-E-05` | error/offline 에서 재생 버튼이 **24px 아래로 이동** — 재시도 탭 자리 이탈 | **Spec 결함** (`align center` 의 결과) | Medium | 아니오 (QA 전 결정 권고) | **필요** (ⓐ/ⓑ) |
| `VG7-E-06` | 시간 텍스트 ink-400 on 카드 **2.29~2.31** | **Spec 대로** — `P-35` 열거 밖 저대비 텍스트 (`VG7-D-08` 과 같은 유형) | Low | 아니오 | **필요** (ⓐ/ⓑ) |
| `VG7-E-07` | 그 밖 대비 (날짜 · 불가 문구 · 오류 문구 · 진행 막대) | 날짜·불가 ink-500 **3.15~3.17**(`P-01`) · 오류 `#a8483e` **5.50** ✅ · track 1.16 / fill(teal) 비텍스트 `P-02` | — | 아니오 | 불필요 |
| `VG7-E-08` | `R-SHADOW-1` — 버튼 `--shadow-bubble` | **이론값과 일치** · 새 `overflow` 0 · 그림자 든 overflow 박스 0 | — | 아니오 | 불필요 |
| `VG7-E-09` | H7-5.7 판단 ②③④⑤⑨⑩⑬⑭⑮ | **전부 수용** — Spec 보충(정정 ⑮~⑱) | — | 아니오 | 불필요 |
| `VG7-E-10` | H7-5.7 ⑫ iOS Safari 첫 탭 | **승인 필요** (완화안) | Medium (실기기 NOT VERIFIED) | 아니오 | **필요** (ⓐ/ⓑ/ⓒ) |
| `VG7-E-11` | Spec 보충 · `COMPONENT_MAP.md` | **반영함** (design-agent) | — | 아니오 | 불필요 |

**Severity 합계: Critical 0 · High 0 · Medium 2 (`E-05` · `E-10`) · Low 2 (`E-04` · `E-06`). Blocking 0.** 사용자 결정 3건(`E-05` · `E-06` · `E-10`). 허용 차이(AD) 후보 **0** — Figma 프레임이 없어 Figma 대비 차이가 성립하지 않는다.

### 2. 항목 상세

#### `VG7-E-01` Figma `16:2` — 없음 `[meta]`

- section 4개 그대로(`31:204` · `179:1700` · `296:1127` · `317:1358` Stage 6 DRAFT). Stage 7 section 없음.
- 이름 검색 hit = `31:102` · `31:209` · `110:845` · `110:859` · `110:861` · `110:875` (S7-C 기존 노드) — *clip · player · audio · highlight* **0**.
- → Q7-3 디자이너 프레임 미도착. `R7-01`(도착 시 재정렬) 유지.

#### `VG7-E-02` 6상태 · 행 — 일치 `[px][직독]`

| 상태 | Spec §2.5 | baseline | 판정 |
|---|---|---|---|
| idle | `play` · 진행 0 · `0:00 / {dur}` | `idle` — 두 행 `0:00 / 0:12` · `0:00 / 0:15` | ✅ |
| loading | Spinner · 버튼 유지 · 누름 무시 · 진행 유지 | `loading` — 1행 정지 arc(reduced-motion) · 진행·시간 유지 · `onPress` 는 `IconButton` 이 loading 중 무시 | ✅ |
| playing | `pause` · 값 갱신 · reduced-motion 값만 | `playing` — ⏸ · fill 4/12 · `0:04 / 0:12` · `ProgressBar.css` reduced-motion `--motion-duration-instant` | ✅ |
| paused | `play` · 진행 유지 | `paused` — ▷ · fill 유지 | ✅ |
| ended | `play` · 0 | = idle (판단 ④) | ✅ |
| unavailable | 버튼 비활성 `play` · 진행 숨김 · caption-1 secondary 문구 · 만료일 0 | `unavailable` — 2행 ▷ dim · 진행 행 자리에 *This clip is no longer available.* · 날짜 *Apr 22* 유지(세션 날짜 — 만료일 아님) | ✅ |
| error · offline | `play` · 진행 유지 · caption-1 error-fg 문구 | `error`/`offline` — ▷ · 진행 유지 · 진행 아래 빨간 2줄 문구 | ✅ (줄 높이 `E-04` · 버튼 위치 `E-05`) |

- 행: grid [44 \| 1fr] · gap 12 · 버튼 38(경계 y62~98 = 37~38px) · 라벨 subheadline semibold primary · 날짜 caption-1 secondary · 진행 행 막대 ··· 시간(`nowrap` — 1차 baseline 줄바꿈 수정 확인, 7장 모두 한 줄) ✅.
- 카드: `ProfileCard` + h2 *Highlight clips* subheadline bold (다른 상세 카드와 같은 recipe) ✅. 행 간격(1행 진행 아래끝 → 2행 라벨) idle 기준 18~20 — `ul gap` 12 + 행 세로 가운데 정렬 여백.
- 클립 0 + slot 있음(`VG7-D-11` 후속) — `ReportDetailView` 조건으로 섹션·`<audio>` 미렌더 (H7-5.4 단위 증거) ✅.

#### `VG7-E-03` `main` 재생성 — 위 콘텐츠 불변 확인 `[diff]`

| 구간 (행) | 최대 채널 Δ |
|---|---|
| 0~500 | 1 |
| 500~1000 | 2 |
| 1000~1500 | 3 |
| 1500~2000 | 4 |
| 2000~2325 | 5 |
| 2326~2515 | 127 (클립 카드) |

- Δ>8 행은 **2326~2515 뿐**(190행) — 단일 영역 = ⑥ 카드. 위쪽 Δ 가 아래로 갈수록 선형 증가 = 뷰포트 2600 → 2900 으로 앱 배경 gradient 가 늘어난 것 (dev 설명과 일치, 콘텐츠 변화 0).
- 앞 카드(⑤) 아래끝 y2305 → 클립 카드 y2326: 그림자 10(2306~2316) 포함 **간격 20** = 섹션 간격 `--space-5` ✅.
- 새 이미지 아래 빈 배경 ≈ 560px — 뷰포트를 키운 결과 (S7-D 와 같은 성격, 결함 아님).

#### `VG7-E-04` 문구 줄 높이 22 ≠ caption-1 16 — Low, 수정 `[px][직독]`

- 실측: `error` 문구 2줄 잉크 run y126~136 · y148~158 → **줄 간격 22**. `--haru-type-caption-1-line` = 16, `--haru-type-body-line` = 22.
- 원인: live `<p class="haru-clip-row__message">` 는 글꼴 지정이 없어 **body 17/22 를 상속**하고, 안의 `Text`(caption-1)가 **inline `span`** 이라 줄 상자 높이는 `<p>` 의 strut(22)이 정한다. 1줄인 unavailable 도 줄 상자 22(위아래 3px 씩 여유).
- 영향: 오류 2줄 블록 48 → 36 이어야 한다(−12). `E-05` 의 버튼 이동량도 키운다(24 → 18).
- 수정(development-agent, 결정 불요): 문구 `<p>` 자체에 caption-1 타입(크기·줄 높이 토큰)을 주거나 `Text` 를 block 으로 — **live region 노드는 그대로 유지**(노드 교체 시 알림 누락, 행 주석). 재생성 대상 = `s7-clips-error` · `-offline` · `-unavailable` + 원인 분해(`R-BASELINE-1` 5 — 변화 = 문구 영역·그 아래 행 이동만).

#### `VG7-E-05` 오류 문구가 뜨면 재생 버튼이 내려간다 — Medium, 사용자 결정 `[px]`

| 상태 | 1행 버튼 아이콘 중심 y | idle 대비 |
|---|---|---|
| idle · loading · playing · paused | 80.5 | 0 |
| error · offline | **104.5** | **+24** |

- 원인: Spec §2.5 `align center` — 버튼이 본문 열(라벨 · 날짜 · 진행 · **문구**) 전체 높이의 가운데에 선다. 문구가 붙으면 열이 길어져 버튼이 문구 높이의 절반만큼 내려간다.
- 문제: 문구가 *"Tap play to try again"* 인데, 방금 누른 자리를 다시 누르면 **hit 44 의 위끝(104.5 − 22 = 82.5)보다 2px 위** → 빗나간다. `E-04` 를 고쳐도 이동 18 (여유 4px), 텍스트 확대·좁은 폭(3줄)에서는 다시 빗나간다(3줄 = +28).
- 이것은 design-agent 명세의 결함이다(구현은 Spec 대로). C-13 화면이라 Spec 변경은 사용자 승인 대상.

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| ⓐ 현행 유지 (`E-04` 만 수정) | 가운데 정렬 그대로 | 변경 최소 | 이동 18, 3줄·확대 시 재시도 탭 빗나감 |
| ⓑ **버튼 = 라벨·날짜·진행 블록의 가운데** | 행을 2단으로: 1단 [버튼 \| 라벨·날짜·진행] 가운데 정렬 · 2단 [빈 칸 \| 문구] — 문구가 생겨도 버튼 위치 0 이동. unavailable 은 문구가 진행 자리를 대신하므로 지금과 같은 높이 | 6상태 모두 버튼 위치 고정 · idle 모양 불변(baseline 4장 그대로) | 행 구조 변경(live `<p>` 노드 유지 필수) · error/offline/unavailable baseline 재생성 |
| ⓒ 버튼 위 정렬 (`align-items: start`) | 버튼을 라벨 첫 줄에 붙임 | 단순 | idle 모양이 바뀐다(버튼이 위로 ≈ 10 이동) · 새 시각 결정 |

**권고: ⓑ.** 재시도를 안내하는 문구 때문에 재시도 버튼이 도망가지 않아야 한다. idle·재생 상태 모양은 지금과 같다.

#### `VG7-E-06` 시간 텍스트 ink-400 대비 2.29~2.31 — Low, 사용자 결정 `[px][계산]`

- 구현 = Spec §2.5 그대로 `caption-2 tabular-nums tertiary` (ink-400 `#9aabaa`, 11px). 실제 카드 면 픽셀 `(250, 250~251, 251)`(idle · error · `main` 공통 — 상세는 카드 면이 불투명에 가까워 위치별 차이 ≤ 1) 위 **2.29~2.31**. 목표 4.5.
- Spec §9.3 은 "ink-400 텍스트 → `P-35`" 라 적었지만 `P-35` 본문(§5.3)은 **Progress 의 Figma 선언 텍스트만** 열거한다 — Figma 근거로 낮은 대비를 받아들인 가값이고, 이 플레이어는 Figma 가 없는 C-13 이다. `VG7-D-08` 과 같은 구조.
- 보완 요소: 시간은 `aria-hidden` 이고 SR 은 `aria-valuetext` 로 같은 정보를 듣는다. 시각 사용자에게는 진행 막대(비텍스트 `P-02`)가 같은 정보를 대략 준다. 그래서 `D-08`(유일한 시각 정보)보다 무게는 낮다.

| 안 | 내용 | 대비 | 장점 | 단점 |
|---|---|---|---|---|
| ⓐ `P-35` 범위 확장 | 현행 유지, 가값에 "클립 시간 텍스트" 추가 | 2.31 | 변경 0 | Figma 근거 없는 화면에서 저대비를 새로 등록 |
| ⓑ **`tone="secondary"`** (ink-500) | `HighlightClipRow` 시간 `Text tone` 1곳 | **3.17** (`P-01` 범위) | `D-08` ⓑ · `N6-33` 과 일관 · 새 가값 0 · 위계(라벨 진함 > 날짜 = 시간)는 유지 | 클립 baseline 7장 + `main` 재생성 |

**권고: ⓑ** — `VG7-D-08` 과 **같은 안으로 함께** 결정한다 (상세 화면 C-13 보조 텍스트를 한 기준으로). ⓑ 채택 시 날짜(secondary)와 같은 색이 되어 시간·날짜의 구분은 크기(11 vs 12)·위치로만 남는다 — 진행 막대 옆이라 혼동 없음.

#### `VG7-E-07` 그 밖 대비 `[px][계산]`

| 대상 | 색 | 카드 면 위 | 판정 |
|---|---|---|---|
| 라벨 | ink-700 | 6.53~6.57 | ✅ |
| 날짜 · 불가 문구 | ink-500 | 3.15~3.17 | 기존 `P-01` |
| 오류 · offline 문구 | `--color-status-error-fg` `#a8483e` | **5.50** (렌더 최암부 `(163,73,64)` — 안티앨리어싱으로 선언값보다 짙다) | ✅ |
| 진행 track · fill | ink-600 12% · teal | 1.16 · ≈1.9 | 비텍스트 `P-02` (기존) |
| 불가 버튼 dim | `--opacity-disabled` | — | 비활성 컨트롤 — WCAG 1.4.3 예외 · 사유는 문구(3.15)·버튼 이름이 전달 |

#### `VG7-E-08` `R-SHADOW-1` `[px][직독]`

- 그림자 요소 = `IconButton glass` 1개/행, `--shadow-bubble` drop **1겹** `0 6 4` (inset 2겹은 안쪽). 이론 번짐 좌우 ≈4 · 위 0 · 아래 10.
- `idle` 1행 버튼 x=38 세로: 경계 아래끝 y98 → 채널합 Δ(카드 752 대비) **+1: 34 · +2: 34 · +5: 26 · +8: 13 · +10: 1 · +11: 0** ✅. 가로 y=80: 왼쪽 x16~18 Δ 3~7 · 오른쪽 x57~59 Δ 3~9 · 4px 밖 0 ✅. 위 Δ 0 ✅.
- overflow 조상: `highlight-clip.css` · `report-detail.css` · `ProfileCard` 에 `overflow` 선언 0 (grep 은 `overflow-wrap` 만 — `R-FIGMA-1` ④ 대로 computed 확인은 dev e2e 프로브 "클리핑 조상 = AppShell 뷰포트 1개" 를 근거로 함). `ProgressBar` track 의 기존 `overflow: hidden` 안에는 그림자 0.
- 버튼 아래 번짐 10 < 버튼 아래끝 → 다음 행 라벨까지 ≈ 31 · 카드 패딩 16 → **겹침·클립 0**. 새 `overflow` 0 이라 신규 프로브 의무 없음 — dev 의 세로·가로 프로브(320/393/600)는 초과 충족.

#### `VG7-E-09` H7-5.7 판단 — 전부 수용 `[직독][px]`

| # | 판단 | 판정 | 근거 |
|---|---|---|---|
| ② | 진행 막대 = `aria-valuetext` *"0:04 of 0:12"* · 보이는 시간 `aria-hidden` | **수용** | Plan §5.7 "정보 전달 = 시간 텍스트". 퍼센트는 달성률처럼 들린다(§10.5 정신). 같은 정보 두 번 낭독 방지. role · valuenow(초) · valuemax 유지라 AT 가 값을 못 읽을 일 없음 |
| ③ | SR 문구 4개 (*Playing.* · *Paused.* · *Clip progress: {label}* · *{e} of {t}*) | **수용** — Spec §9.1 · §10 에 기록(⑮ ⑯) | 진단·비교 0. 행마다 이름이 달라 progressbar 2개 구별 가능. 다른 행 재생 시 이전 행 *Paused.* + 새 행 *Playing.* 2회 알림 — polite 라 순차 낭독, 허용 |
| ④ | ended = idle | **수용** (⑰) | 표시 동일 |
| ⑤ | 이전 행 = 위치 기억 paused | **수용** (⑰) | Spec "paused 로 돌아가는 것뿐" 과 일치 |
| ⑨ | 불가 dim = 버튼에만 | **수용** (⑱) | 라벨·날짜까지 흐리면 무엇이 불가한지 읽기 어렵다(비활성 예외는 컨트롤에만 적용). 공유 `IconButton.css` 무변경 + `survey.css` 선례 |
| ⑩ | reduced-motion 에서 Spinner 라벨 숨김 → 로딩 텍스트 없음 | **수용** (⑱) | 38 버튼 안에 라벨 자리가 없고(1차 baseline 겹침 실측), 정지 arc ↔ ▷ 모양 차이가 시각 단서로 남는다. 로딩은 짧고(Mock 1.5s) 끝나면 ⏸ 로 바뀐다. S7-C `.haru-report-card__status` 선례. 한계: SR 은 `aria-busy` 만이라 낭독이 보조기기마다 다르다 — Spec §9.1 은 로딩 알림을 요구하지 않으므로 결함 아님 |
| ⑬ | `media-has-caption` 1줄 비활성 | **수용** | `<audio>` 는 컨트롤 없이 렌더 0. 전사는 아동 데이터라 contract 에 없음(C7-5) — 캡션 트랙을 만들 원문이 없다. 클립 주제는 서버 캡션 label 로 시각·SR 모두 전달 |
| ⑭ | C-13 간격 (`P-39`) | **수용** (⑱) | 기존 `--space-*` 스케일 · 라벨/날짜/진행 덩어리 구분 분명(육안) |
| ⑮ | 오류 문구 = 진행 아래 · 불가 문구 = 진행 자리 | **수용** (⑱) | Spec 표 "진행 유지/숨김" 그대로의 귀결. 단 버튼 위치는 `E-05` |
| ⑯ | `RESOURCE_NOT_FOUND` = 일반 error | **수용** | Spec 은 `RECORDING_DELETED` 만 불가로 규정 · 소유권 실패를 "삭제됨" 으로 말하지 않는 편이 맞다 |

#### `VG7-E-10` iOS Safari 첫 탭 (H7-5.7 ⑫) — Medium, 사용자 결정 `[직독]`

- 현행: 첫 탭 = URL 조회(`await`) → 그 뒤 `play()`. iOS Safari(·WKWebView 기본 설정)는 사용자 제스처 밖의 `play()` 를 `NotAllowedError` 로 거절할 수 있다 → 빨간 *"We couldn't play this clip. Tap play to try again."* → 둘째 탭은 캐시 URL 로 **동기** `play()` 라 재생될 것으로 예상. 실기기 미확인(NOT VERIFIED).
- 영향: 1차 시장(미국) iOS 사용자가 **모든 클립의 첫 탭에서 오류 문구**를 볼 수 있다 — 오류가 아닌데 오류로 보이는 UX. 시각 변화를 동반하므로(오류 문구 · `E-05` 버튼 이동) design 판단 대상이다.

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| ⓐ 현행 유지 + 실기기 확인 | 수동 묶음(AC-7-62 와 함께)에서 확인 후 필요 시 수정 | 변경 0 | 확인 전까지 위험 잔존 · 확인 결과에 따라 Stage 7 안에서 재작업 |
| ⓑ **제스처 안에서 공유 `<audio>` 를 먼저 깨운다** | 탭 핸들러 **동기 구간**에서 공유 요소에 `play()` 를 한 번 호출(무음·빈 src 거절은 무시)해 요소를 사용자 활성화 상태로 만든 뒤, URL 도착 후 같은 요소에 src 를 넣고 `play()`. dev 제안의 `load()` 단독은 iOS 에서 잠금 해제가 보장되지 않는다 — **`play()` 호출이 제스처 안에 있어야** 한다 | 시각 변화 0 · 요소 1개 공유 구조와 맞음 · 탭 전 URL 조회 0(AC-7-49) 유지 | 실기기 확인은 여전히 필요 · 무음 재생 시도 1회의 부작용(다른 앱 오디오 일시 중단 가능)은 실기기에서 확인 |
| ⓒ URL 선조회 (섹션 표시 시) | 탭 전에 signed URL 을 받아 두고 첫 탭에서 동기 `play()` | 가장 확실 | **AC-7-49 위반**(탭 전 요청 0) · 아동 음성 URL 을 보지도 않을 때 발급 — Privacy 원칙과 충돌. 비권고 |

**권고: ⓑ** + 실기기 확인(AC-7-62 수동 묶음). 실기기에서 ⓑ 가 효과 없으면 ⓐ 의 "둘째 탭 재생" 폴백이 남는다(현 동작과 같음). 어느 안이든 `NotAllowedError` 를 일반 오류 문구로 보여 주는 지금 경로는 폴백으로 유지된다. 후속 Capacitor(S4N-A)에서는 WKWebView `mediaTypesRequiringUserActionForPlayback` 설정으로 별도 해소 가능 — Handoff 메모 대상.

#### `VG7-E-11` Spec 보충 · `COMPONENT_MAP.md` — 반영 (design-agent)

| # | 위치 | 보충 |
|---|---|---|
| ⑮ | §2.5 · §9.1 | 진행 막대 `aria-valuetext` 시간 · 이름 *Clip progress: {label}* · 시간 텍스트 `aria-hidden` |
| ⑯ | §9.1 · §10 | live *Playing.* · *Paused.* · SR 문구 목록 (+ *Clip unavailable: {label}* 를 §10 에도) |
| ⑰ | §2.5 | ended = idle · 상태 6종 · 이전 행 = 위치 기억 paused |
| ⑱ | §2.5 | C-13 값(`P-39`) · 문구 위치 · dim 범위 · reduced-motion 로딩 |

- Status 줄 불변. 결정 대기 `E-05`(버튼 정렬) · `E-06`(시간 색) · `E-10`(iOS)은 **Spec 을 고치지 않았다**.
- `COMPONENT_MAP.md`: 갱신 메모 1 · Stage 0 `HighlightClipPlayer` 행 → `HighlightClipRow` + `HighlightClipList` 구현 기록(구성 · props · 상태) · 요구사항 표 행 해소 표시 · `ReportDetailView` ⑥ slot 채움.

### 3. 허용 차이 후보 (등록 안 함 — 사용자 승인 후)

| 후보 | 내용 | 권고 |
|---|---|---|
| — | **없음** — Figma 프레임이 없는 C-13 화면 | — |
| (가값) `E-06` ⓐ 일 때만 | `P-35` 범위에 "클립 시간 텍스트 ink-400 2.31" 추가 — AD 가 아니라 가값 | ⓑ 권고 — 채택되면 소멸 |

### 4. 후속

| 대상 | 할 일 | 시점 |
|---|---|---|
| 사용자 | `VG7-E-05` ⓐ/ⓑ/ⓒ (권고 ⓑ) · `VG7-E-06` ⓐ/ⓑ (권고 ⓑ, `VG7-D-08` 과 함께) · `VG7-E-10` ⓐ/ⓑ/ⓒ (권고 ⓑ) | Stage 7 QA 전 |
| development-agent | `E-04` 문구 줄 높이 caption-1 (결정 불요) · 결정 후 `E-05` 행 2단 · `E-06` 시간 tone · `E-10` 제스처 내 unlock — baseline 재생성은 **한 번에** 묶고 원인 분해 | 결정 후 |
| stage-qa-agent | AC-7-54 SR 문구 기대값 = Spec 보충 ⑮ ⑯ · 재생 시계 정지로 NOT VERIFIED 인 자연 재생(H7-5.7 ⑪)과 iOS 첫 탭(`E-10`)을 AC-7-62 수동 묶음에 포함 · 가값 목록에 `P-39`(클립 간격) | Stage 7 QA |
| 디자이너 (Q7-3) | 클립 플레이어 프레임 미도착 (`E-01`) — 도착 시 `R7-01` 재정렬 | 병행 |

---

## S7-F

4주 리포트 PDF 액션 — 카드 `pdfAction` slot · 상세 ⑦ slot (`docs/qa/stage-7-handoff.md` H7-6). 검토일 2026-11-20. **Playwright 미실행** (지시). 신규 baseline 7장(`e2e/__screenshots__/darwin/report-pdf.spec.ts/*.png`) · 변경 1장(`visual.spec.ts/v1-button.png`)을 PIL 로 직접 읽었고 코드·토큰·Spec 은 직독했다. **Stage 7 마지막 단위.**

**비교 기준**: idle 버튼만 Figma `110:854`(카드 `110:835` 안). 나머지 6상태는 Figma 프레임이 없는 C-13 `C13-S7-4` (`D7-3`) → 기준 = 승인 Spec §2.6 · §2.3 ⑦ · §9.1 · §9.5 · §10.4 · `N7-19` · `N7-33` · `N7-40`.

### 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[meta]` | Figma `get_metadata(16:2)` — **라이브 조회 2026-11-20** (`mcp__8c8226df…`, 이번엔 성공 — dev 세션은 실패, H7-6.2). 응답 텍스트 197,909자(래핑 JSON 222,764자) 전량을 XML 로 파싱: depth ≤ 2 frame/section 목록 + 전 노드 1,850개 이름 정규식(`report\|clip\|pdf\|highlight\|4-week\|stage 7\|C13-S7\|player\|audio\|share\|save\|download`) | 새 PDF 프레임 유무 |
| `[meta]` | `get_metadata(110:835)` | 카드 · 버튼 · 아이콘 · 라벨 박스 |
| `[ctx]` | `get_design_context(110:854)` — 버튼 노드 1개(작은 자식 단위, 스크린샷 포함) | 버튼 선언값(높이 · 아이콘 · gap · 라벨 · 그림자 · fill) |
| `[px]` | PIL — 상태 7장(345×102~321) 텍스트 행의 배경(상위 10% 밝기 평균)·글자(하위 0.5% 평균) → WCAG 대비 / `v1-button` 신(361×744)·HEAD 본(361×698, `git show HEAD:`) 차분 Δ>8 · 반경 2 팽창 · 8-이웃 연결성분 / 버튼 경계 열 x180 밝기 전이로 버튼 높이 | `F-04` · `F-05` · `F-07` · `F-12` |
| `[계산]` | `--shadow-glass-rest` drop **3겹 전부**(`0 2 4 · 8%` / `0 12 28 · 16%` / `0 28 56 · 12%`, ink-600) 가우시안(σ = blur/2) 313×45 사각 → 프로브 지점 α · 채널합 Δ(배경합 703 − ink 321 = 382 기준) · 도달 거리 | `F-09` |
| `[직독]` | `features/report-pdf/**` · `packages/ui/src/button/ButtonGroup.{tsx,css}` · `Button.css` · `InlineAlert.{tsx,css}` · `report-detail.css` · `shadow.css` · `component/index.css` · `e2e/report-pdf.spec.ts` · `grep ButtonGroup` | — |

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG7-F-01` | Figma `16:2` 새 PDF 프레임 (Q7-4) | **없음** — 노드 수 1,850 · 텍스트 길이 S7-D/E 조회와 동일(197,909자). 정규식 hit = 기존 `110:845`·`859`·`861` 과 Stage 6 *Save* 계열뿐 | — | 아니오 | 불필요 |
| `VG7-F-02` | `110:854` 재실측 — 버튼 h50 · 아이콘 17 · gap 9 · 라벨 Bold 15/15 | **선언값 확인** (dev 의 H7-3.2 값과 같음) · 구현 45 · 20 · 8 · 17/590 → `AD7-9` **확장 후보** | Low | 아니오 | AD 등록 시 (§3) |
| `VG7-F-03` | ready 2버튼 — 폰 폭에서 **세로 stack** (Spec "가로 2") | **Spec ↔ Shared UI 규칙 충돌** (구현은 공유 규칙대로) | Low | 아니오 | **필요** (ⓐ/ⓑ) |
| `VG7-F-04` | Shared `ButtonGroup` 자동 stack 수정 · `v1-button` 분해 · Stage 2–6 영향 | **확인** — 성분 2개 모두 설명됨 · 소비처 = gallery + 이 단위뿐 · Stage 2–6 baseline 변경 0 | — | 아니오 | 불필요 |
| `VG7-F-05` | 상태 문구 *Preparing…* · *Sharing isn't available…* ink-400 대비 **2.23** | **Spec 대로** — `P-35` 열거 밖 C-13 저대비 텍스트 (`D-08` · `E-06` 과 같은 유형) | Low | 아니오 | **필요** (ⓐ/ⓑ) |
| `VG7-F-06` | 새 문구 `shareTitle` *"HARU 4-week report"* (OS 공유 시트 제목) | **Spec 에 없음** — 승인 필요 | Low | 아니오 | **필요** (ⓐ/ⓑ) |
| `VG7-F-07` | 7상태 Spec 적합성 | **일치** (`F-03` · `F-08` 정정 지점 제외) | — | 아니오 | 불필요 |
| `VG7-F-08` | H7-6.7 판단 ③④⑤⑥⑩⑪⑭⑮⑯ (Share 먼저 · loading 표현 · offline tone · timeout role · 포커스 · live · C-13 간격 · ⑦ 간격 20) | **전부 수용** — Spec 정정 ⑲~㉔ | — | 아니오 | 불필요 |
| `VG7-F-09` | `R-SHADOW-1` 프로브 6건 ↔ 3겹 합산 | **이론과 일치** (1건 상한 초과 — 원인 미확정, 아래) · 새 `overflow` 0 | Low | 아니오 | 불필요 |
| `VG7-F-10` | Spec 정정 · `COMPONENT_MAP.md` | **반영함** (design-agent) | — | 아니오 | 불필요 |
| `VG7-F-11` | `v1-button` gallery sticky 내비 겹침 42px | **테스트 레이어 결함** (기존 5px → 42px) — 첫 버튼 행 절반이 baseline 에서 가려진다 | Low | 아니오 | 불필요 (QA/Orchestrator) |
| `VG7-F-12` | 그 밖 대비 (InlineAlert 3종 · glass 라벨 · accent 라벨) | ✅ 4.65~5.86 · glass 라벨 5.03~5.05 · 흰 라벨 on teal 2.06 = `D-01` | — | 아니오 | 불필요 |

**Severity 합계: Critical 0 · High 0 · Medium 0 · Low 6 (`F-02` · `F-03` · `F-05` · `F-06` · `F-09` · `F-11`). Blocking 0.** 사용자 결정 3건(`F-03` · `F-05` · `F-06`) + AD 확장 1(`F-02`). 결정 종합은 아래 `## Stage 7 결정 대기 종합`.

### 2. 항목 상세

#### `VG7-F-01` Figma `16:2` — 없음 `[meta]`

depth ≤ 2 목록: section `31:204` · `179:1700` · `296:1127` · `317:1358`(Stage 6 DRAFT) — 2026-11-20 S7-D/E 조회와 같다. PDF · 공유 · 저장 관련 새 프레임 0. Q7-4(PDF 상태 프레임) 미도착 → 6상태는 C-13 명세 그대로, 도착 시 `R7-01` 재정렬.

#### `VG7-F-02` `110:854` 버튼 재실측 → `AD7-9` 확장 후보 `[meta][ctx]`

| 요소 | Figma 선언 (2026-11-20 라이브) | 구현 (H7-6.8 e2e ⑤ · 토큰 직독) | Δ |
|---|---|---|---|
| 박스 | `110:854` 313 × **50** · radius pill (`rounded 100px`) · fill `#85bfb6` | 313 × **45** (`Button md`) · pill · `accent` | −5 (`AD7-9` 기존) |
| 아이콘 | `110:855` **17 × 17** (x89 y16.5) | `--size-icon-md` **20** | +3 (🆕) |
| 아이콘 ↔ 라벨 | `gap 9` (115 − 106) | `--button-gap` = `--space-2` **8** | −1 (🆕) |
| 라벨 | `110:859` SF **Bold(700)** **15/15** white | `Button md` headline **17** · semibold **590** | 크기 = `AD7-9` 기존 · weight 🆕 |
| 그림자 | `drop-shadow` 3겹 `0 2 2 · 8%` / `0 12 14 · 16%` / `0 28 28 · 12%` | `--shadow-glass-rest` `0 2 4` / `0 12 28` / `0 28 56` | 기존 `AD-3`(Button raw 그림자 — Spec §0.3) — **새 후보 아님** |

- 위 🆕 3건은 전부 **`N7-33` ⓐ "Shared `Button md` 그대로" 결정의 파생 결과**다 — 같은 원인이라 새 ID 대신 `AD7-9` 문구를 넓힌다: *"`110:854` 버튼 h50 · 라벨 Bold 15 · 아이콘 17 · gap 9 → `Button md` 45 · 라벨 17/590 · 아이콘 20 · gap 8"*. **등록하지 않았다** (최우선 규칙 6).
- 카드 높이 230.5 → 212 의 나머지(−12.5)는 기존 줄 높이 후보(`AD7-16` 번호 제안, `VG7-C-11`)와 `AD7-4` 몫 — dev 분해(H7-6.8)와 일치. 진행 행 → 버튼 14 · 버튼 → footer 14 · left 16 은 Figma 그대로.

#### `VG7-F-03` ready 2버튼 세로 stack — 사용자 결정 `[직독][px]`

- `ButtonGroup` 규칙(Stage 1 Design Spec §4.4, Figma `86:372`): **그룹 폭 < 360 이면 자동 stack**. 그룹 폭 = 카드 안 313 · 상세 345 (393 기준) → 폰 폭 전부 세로, 600+ (컬럼 480 → 카드 안 448) 에서만 가로 194 × 2. 실측 `ready-share` 카드 270 = 발행 213 + 45 + 12.
- Spec §2.6 *"ButtonGroup 가로 2"* 는 이 공유 규칙을 놓친 서술이다(design-agent 명세 결함). Figma 프레임은 없다(C-13).

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| ⓐ **세로 stack 수용** (Spec 정정) | 현행. 폰 = Share 위 · Save PDF 아래, 600+ = 가로 | 공유 규칙 그대로 · 라벨 잘림 0 · Figma `86:372` 순서(primary 가 아래·엄지 쪽) · 변경 0 | 카드가 57px 길어진다 (ready 동안만) |
| ⓑ 이 자리만 가로 고정 | `ButtonGroup` 에 자동 stack 끄는 옵션 추가(Shared API 변경) → 313 에 각 150.5 | Spec 원문대로 · 카드 높이 불변 | Shared UI API 확장 · 150px 안에 아이콘 20 + 8 + *Save PDF* 17/590 + 좌우 padding — 큰 글자(Dynamic Type/200%)에서 라벨 잘림 위험 · 360 규칙의 근거(좁은 폭 라벨 보호)를 이 자리만 깬다 |

**권고: ⓐ.** ⓐ 채택 시 design-agent 가 §2.6 ready 행을 *"`ButtonGroup`(inline — 그룹 폭 < 360 자동 stack, 폰 = 세로)"* 로 정정한다 (이번엔 결정 대기라 고치지 않았다).

#### `VG7-F-04` `ButtonGroup` 수정 · `v1-button` 분해 · 영향 범위 `[px][직독]`

- 수정 직독: `@container (width < 360px)` 에서 `.haru-button-group__row--inline > * { flex: none }` 추가. 이전엔 column 방향에 `flex: 1 1 0` 이 남아 **basis 0 이 `block-size` 를 이겼다** (flex item 의 main-size 는 basis 가 정하고 `block-size` 는 basis `auto` 일 때만 쓰인다). 명시 `stacked` 와 같은 결과(명시 쪽은 기본 `0 1 auto` — column 에 높이 제약이 없어 shrink 차이 무의미). **props · DOM 불변.**
- `v1-button` HEAD(361×698) ↔ 신(361×744) 위 정렬 차분 Δ>8 연결성분 **정확히 2개**:
  1. **y509~697 (전 폭, 52,606px)** — ButtonGroup 데모. 버튼 경계 열 x180 전이: HEAD 첫 inline 데모 **510→530 · 544→566 (≈20~22px — 눌림)** → 신 **510→555 · 567→612 (45 · gap 12)**, 아래 명시 `stacked` 데모 624→669 (45) 와 같은 모양. 섹션 +46 = (45−20)+(45−22)−2 반올림.
  2. **y0~44 (전 폭, 10,973px)** — gallery sticky 칩 내비(*Responsive · Accessibility*)가 섹션 위끝을 덮는 범위가 커짐 (`F-11`).
  - **y45~508 Δ>8 = 0행** — 버튼 variant 행들은 불변. 설명되지 않는 성분 0 (`R-BASELINE-1` ⑤ 충족).
- 즉 **HEAD baseline 이 눌림 버그를 담고 있었다** (Stage 1 이래, `R-BASELINE-1` 사고 유형 ①). 이번 갱신은 버그 상태 → 정상 상태.
- Stage 2–6 영향: `grep -rln ButtonGroup apps/web/src packages/ui/src`(테스트 제외) = `ReportPdfAction.tsx` · `report-pdf.css`(주석) · `dev/ui-gallery/ComponentsPage.tsx` · `packages/ui` 자체뿐 — **Stage 2–6 화면 소비처 0**. `git status` 의 수정 baseline = `v1-button` · `v2-material`(S7-B 이전부터 누적된 스테일, `VG7-B` §4 기록) 2장뿐이고 Stage 2–6 spec 폴더 변경 0. → 320 의 Stage 2–6 화면 영향 **없음**.

#### `VG7-F-05` 상태 문구 ink-400 대비 — 사용자 결정 `[px][계산]`

- *Preparing your PDF. This can take up to a minute.* · *Sharing isn't available here. Save the PDF instead.* = Spec §2.6 대로 `caption-2 tertiary`(ink-400). 실제 배경 = **카드 아래쪽 면 `(230,234,233)`**(카드 glass 가 아래쪽 어두운 배경 위라 위쪽보다 어둡다): 픽셀 **2.23** · 선언색 계산 **1.97**. 목표 4.5.
- 바로 아래 footer *Next report on …* 도 ink-400(2.20)이지만 그것은 Figma `110:861` 선언 텍스트라 `P-35` 범위다. 이 두 문장은 **Figma 없는 C-13 문구** — `VG7-D-08` · `VG7-E-06` 과 같은 구조.
- 보완 요소: *Preparing…* 은 live region 이라 SR 은 듣는다. 시각 사용자에게는 버튼 Spinner 가 같은 정보를 준다. 공유 거절 문장은 **대체 수단(Save)을 알려 주는 유일한 시각 안내**다.

| 안 | 내용 | 대비 (이 면) | 장점 | 단점 |
|---|---|---|---|---|
| ⓐ `P-35` 범위 확장 | 현행, 가값에 "PDF 상태 문구 2종" 추가 | 1.97 (px 2.23) | 변경 0 · footer 와 같은 색 | Figma 근거 없는 저대비 추가 등록 |
| ⓑ **`tone="secondary"`** (ink-500) | `Text tone` 2곳 | **2.71** (카드 위쪽 면 3.0대 — `P-01` 범위) | `D-08` ⓑ · `E-06` ⓑ · `N6-33` 과 한 기준 · 새 가값 0 | `s7-pdf-generating` 1장 재생성 · 카드 아래쪽 면에서는 `P-01` 하한(3.02)보다 낮다 — `P-01` 값 목록에 이 면을 기록 |

**권고: ⓑ — `D-08` · `E-06` 과 함께** ("C-13 화면의 정보성 보조 텍스트 = secondary" 한 규칙으로).

#### `VG7-F-06` 새 문구 `shareTitle` — 사용자 결정 `[직독]`

- `navigator.share({ files, title: 'HARU 4-week report' })` — 앱 화면이 아니라 **OS 공유 시트 머리**에 보인다(iOS 는 파일 미리보기 옆). Spec §10.4 에 없다 → 최우선 규칙 2 에 따라 승인 대상.
- 아이 이름 · 기간 0 (Privacy — 공유 시트·수신 앱 미리보기에 남는다). 진단·비교 표현 0.

| 안 | 내용 | 장점 | 단점 |
|---|---|---|---|
| ⓐ **승인** — Spec §10.4 에 등재 | *HARU 4-week report* | 수신 측에서 무엇인지 알 수 있다 · 이름 0 | 새 문구 1 |
| ⓑ `title` 생략 | 파일만 공유 | 새 문구 0 | 시트 제목 = 파일명 (`P7-BIP-09` 파일명 결정에 의존 — 이름을 넣으면 오히려 노출) |

**권고: ⓐ.**

#### `VG7-F-07` 7상태 Spec 적합성 `[px][직독]`

| 상태 | Spec §2.6 | baseline · 코드 | 판정 |
|---|---|---|---|
| idle | `Button accent md fullWidth` + `arrow-down-to-line` *Download PDF* | `s7-report-card-published`(기존 갱신) · e2e ⑤ 313×45 left 16 | ✅ (`AD7-9`) |
| requesting · generating | 버튼 `loading` + caption-2 tertiary center *Preparing…* `role="status"` | `generating` — Spinner + (reduced-motion) *Loading* · 문구 가운데 · 버튼 ↔ 문구 8 | ✅ — 표현은 Shared `Button loading` 그대로 (정정 ⑳) · 색 = `F-05` |
| ready (공유 가능) | ButtonGroup Save accent + Share glass(`share`) | `ready-share` · `detail-ready` — Share glass 위 · Save accent 아래 · 각 313/345×45 · gap 12 | 배치 = `F-03` · 순서 = 정정 ㉑ |
| ready (공유 불가) | Save 1개 fullWidth | `ready-save` ✅ | ✅ |
| share 취소 / 거절 | 변화 0 / caption-2 안내 | baseline 없음 — 코드: 취소 = 상태 불변 · 거절 = ready 유지 + 문장 (`status` 영역 안) | ✅ (색 = `F-05`) |
| failed | `InlineAlert error` 2줄 + `Button glass md` *Try again* | `failed` ✅ (빨강 tint · alert 아이콘 · fullWidth · 사이 12) | ✅ |
| timeout | `InlineAlert info` 2줄 + *Try again* | `timeout` ✅ (제목 2줄 wrap — 345 폭에서 정상 줄바꿈, 말줄임 0) | ✅ |
| offline | `InlineAlert`(기존 offline 표현) | `offline` — `tone="offline"` (note 면 · `wifi-off` · primary 글자) | ✅ — 정정 ⑲ |

- 7장 육안: dev 패널 0 · 과도 프레임 0 · hover/pressed 그림자 0 (누른 버튼 blur — H7-6.6). `detail-ready` 위끝에서 Share 그림자가 잘려 보이는 것은 **element screenshot bbox** 때문이며 렌더 클립이 아니다(`F-09` 클리핑 조상 = 뷰포트 폭 1개).
- 문구: §10.4 와 글자 단위 일치 (`copy.ts` 직독) · 금칙어 0.

#### `VG7-F-08` H7-6.7 판단 — 수용 · Spec 정정 `[직독]`

| H7-6.7 | 판단 | 근거 | Spec |
|---|---|---|---|
| ③ Share → Save 순서 | 수용 | `ButtonGroup` DOM = secondary → primary(Figma `86:372` *Save · Start Session* — 주 동작이 뒤). Spec 표의 *Save · Share* 는 나열 순서 | 정정 ㉑ |
| ④ loading 표현 | 수용 | 공용 `Button loading`(폭 유지 · 라벨 숨김 · Spinner) — "라벨 유지" 서술이 부정확 | 정정 ⑳ |
| ⑤ offline tone | 수용 | Spec 괄호 *"기존 offline 표현"* 이 의도. 저장소 offline 표현 = `tone="offline"` 3곳(`AnalysisStatusView` · `ActivityCardDeck` · `ActivityCardOfflineBanner`). `error` 는 오기 | 정정 ⑲ |
| ⑥ timeout role | 수용 | §2.6 의 `info` tone 이 우선 — 지연은 오류가 아니라 `status` 가 맞다 | 정정 ㉔ |
| ⑩ 포커스 이동 · ⑪ live 1개 | 수용 | 누른 버튼이 사라질 때 body 로 떨어지는 포커스 복구 — 시각 변화 0, 접근성 보충 | 정정 ㉒ |
| ⑭ C-13 간격 8 / 12 · *Try again* fullWidth | 수용 (`P-39`) | 기존 `--space-*` · idle 버튼과 같은 폭 — baseline 에서 덩어리 구분 분명 | 정정 ㉒ |
| ⑮ 상세 ⑦ 위 간격 20 | **수용 (`P-39`)** | 상세 본문은 flex `gap: --space-5` 로 모든 섹션을 20 으로 띄운다(`report-detail.css` 직독). ⑦ 만 12 로 하려면 음수 margin 이나 래퍼가 필요하고 근거(Figma)가 없다. `VG7-D` §4 의 미결 질문은 이것으로 닫는다 | 정정 ㉓ |
| ⑯ 공유 성공 표시 0 | 수용 | Spec §2.6 "Toast 없음" 원칙 | — |

이 표는 전부 **승인된 Spec 의 서술 오류·누락 보충**이며 화면 결정을 바꾸지 않는다. 사용자가 ⑦ 간격을 12 로 원하면 `P-39` 값 교체로 처리한다(이의 시).

#### `VG7-F-09` `R-SHADOW-1` — 프로브 ↔ 3겹 합산 `[계산][직독]`

| 프로브 (e2e ⑥, 그림자 off↔on 채널합 Δ) | 이론 (3겹 · 배경합 703) | 카드 320/393/600 | 상세 ⑦ 320/600 | 상세 ⑦ 393 |
|---|---|---|---|---|
| 왼쪽 −2 | 33 | 21 · 19 · 21 | 14 · 13 | 11 |
| 오른쪽 +1 | 39 | 33 · 31 · 33 | 23 · 22 | **50** |
| 아래 +2 | 82 | 89 · 88 · 88 | 63 · 63 | 77 |
| 아래 +6 | 65 | 73 · 72 · 72 | 53 · 51 | 63 |

- 카드 · 상세 320/600 은 이론과 같은 모양(아래 > 옆, 오른쪽 +1 > 왼쪽 −2, +2 > +6). 상세가 낮은 것은 배경이 더 어두워 (배경 − ink) 차가 작기 때문으로 일관된다.
- ⚠️ **상세 393 오른쪽 50** 은 흰 배경(배경합 765)에서도 이론 상한 **45** 를 넘는다 → 이 그림자만으로는 설명되지 않는다. 추정으로 적지 않는다(`R-BASELINE-1` ⑥) — 단정은 `> 0` 이라 판정에 영향 없음. QA 가 단독 실행 annotation 을 다시 보고 재현 여부를 기록할 것.
- 도달 거리 (이론, Δ<4 기준): 옆 ≈ 28 · 위 ≈ 20 · 아래 ≈ 70~77 — 규칙 §6-1 ③ 실측(28~32 / 22 / 77)과 같다. **프로브는 1~6px 만 보므로 도달 거리를 재지 않는다** (`C-13` 한계와 같은 유형):
  - 카드 버튼 left = 거터 24 + 16 = 40 > 28~32 → 옆 클립 0. 상세 ⑦ left = 24 → 화면 가장자리에서 4~8 잘림 = 규칙 ④ "가장자리라 안 보임"(Spec §9.5 카드 행과 같은 처리).
  - 클리핑 조상 1개 = `AppShell` 뷰포트(폭 ≥ 뷰포트) — 새 `overflow` 0.
  - 상세 ⑦ 은 본문 마지막 요소다. `box-shadow` 는 스크롤 영역에 포함되지 않으므로 **최대 스크롤에서 아래 번짐 77 이 하단 여백보다 크면 스크롤 박스 아래끝에서 잘린다** — 그 선이 화면 하단 가장자리면 안 보인다(규칙 ④). 프로브가 이 장면을 찍지 않았다 → QA 가 393 최대 스크롤 하단 1장으로 확인.

#### `VG7-F-10` Spec 정정 · `COMPONENT_MAP.md` — 반영 (design-agent)

- `stage-7-design-spec.md`: 개정 노트 1 + 정정 ⑲(§2.6 offline) · ⑳(§2.6 loading) · ㉑(§2.6 순서) · ㉒(§2.6 C-13 값) · ㉓(§2.3 ⑦ 간격) · ㉔(§9.1 role). **Status 줄 불변.** 결정 대기 `F-03` · `F-05` · `F-06` 은 고치지 않았다.
- `COMPONENT_MAP.md`: 갱신 메모 1 · `ButtonGroup` 행(사용처 · 자동 stack 수정 · DOM 순서) · `ReportDetailView, ReportPdfAction` 행(`ReportPdfAction` 구현 기록 — props · 7상태 · slot 공유) · `ReportArchiveCard` 행 `pdfAction` slot 채움.

#### `VG7-F-11` `v1-button` sticky 내비 겹침 — QA/Orchestrator `[px]`

- 신 baseline y0~44 에 gallery sticky 칩 내비가 그려져 **섹션 첫 버튼 행(*Start session* md/lg) 위 절반을 덮는다** (HEAD 는 5px). 원인은 섹션이 46px 길어져 element screenshot 시 스크롤 위치가 바뀐 것(`F-04` ②). 제품 화면 영향 0 (dev gallery).
- 영향: 이 baseline 은 첫 버튼 행의 위쪽 절반을 **회귀 감시하지 못한다** — 지금 상태로 굳히면 `R-BASELINE-1` ② 유형(dev UI 가 baseline 에 들어감)이다.
- 권고: `visual.spec.ts` 공용 촬영에서 gallery 내비를 테스트 레이어에서 가림(`visibility: hidden`, `R-BASELINE-1` ③) → `v1`·`v2` 등 gallery baseline `=all` 재생성 + 분해. 이 단위 범위 밖 — **Stage 7 QA 에서 Finding 으로 기록**하고 수정 시점은 Orchestrator 가 정한다. design 결정 아님.

#### `VG7-F-12` 그 밖 대비 `[px]`

| 대상 | 배경 | 대비 | 판정 |
|---|---|---|---|
| failed 제목 · 설명 (`status-error-fg`) | `(247,228,225)` | 4.71 · 4.65 | ✅ (antialias 측정 — 선언색은 더 높다) |
| timeout 제목 · 설명 (`status-info-fg`) | `(226,238,243)` | 4.93 · 4.94 | ✅ |
| offline 제목 · 설명 (primary on note) | `(240,238,230)` | 5.86 · 5.77 | ✅ |
| *Share* · *Try again* glass 라벨 | 흰 glass | 5.03 · 5.05 | ✅ |
| *Save PDF* · *Download PDF* 흰 라벨 on teal | teal | 2.06 | 수용 예외 `D-01` |
| footer *Next report on* | 카드 아래쪽 | 2.20 | `P-35` (Figma 선언) |

### 3. 허용 차이 후보 (등록 안 함 — 사용자 승인 후)

| 후보 | 내용 | 권고 |
|---|---|---|
| `AD7-9` 확장 | 라벨 weight Bold 700 → 590 · 아이콘 17 → 20 · gap 9 → 8 (`N7-33` ⓐ 파생) | 등록 권고 — 새 ID 불필요 |
| (가값) `F-05` ⓐ 일 때만 | `P-35` 범위에 PDF 상태 문구 2종 — AD 가 아니라 가값 | ⓑ 권고 — 채택되면 소멸 |

### 4. 후속

| 대상 | 할 일 | 시점 |
|---|---|---|
| 사용자 | 아래 `## Stage 7 결정 대기 종합` 일괄 | Stage 7 QA 전 |
| development-agent | `F-05` ⓑ: `ReportPdfAction` 문구 `tone="secondary"` 2곳 · `s7-pdf-generating` 재생성 / `F-03` ⓑ 이면 `ButtonGroup` 옵션(Shared) + ready 2장 재생성 — 다른 결정과 **한 번에** 묶어 baseline 재생성 + 원인 분해 | 결정 후 |
| stage-qa-agent | `F-11` gallery 내비 겹침 Finding · `F-09` 상세 393 오른쪽 Δ50 재현 여부 · 상세 최대 스크롤 하단 그림자 1장 · AC-7-67 PDF role 기대값 = 정정 ㉔(timeout·offline = status) · AC-7-62 iOS 수동 묶음(공유 시트 · 저장 + `E-10`) · 가값 목록 `P-39`(PDF 간격) | Stage 7 QA |
| 디자이너 (Q7-4) | PDF 상태 프레임 미도착 (`F-01`) — 도착 시 `R7-01` 재정렬 | 병행 |

---

## Stage 7 결정 대기 종합

S7-A~F Visual Gap 의 **열린 사용자 결정 전부** (2026-11-20 기준). 닫힌 것: `VG7-A-05` ⓑ(→ `AD7-14` 소멸) · `VG7-A-04`(수정 완료) · `VG7-D` §4 ⑦ 간격(`F-08` 수용). 결정 불요 수정 대기: `VG7-E-04`(클립 오류 문구 줄 높이 22 → 16).

| # | ID | 질문 | 선택지 | 권고 | 묶음 |
|---|---|---|---|---|---|
| 1 | `VG7-B-03` | 주간 막대 최대 높이 58 (Figma 63) | ⓐ 유지 + `AD7-7` 결과로 기록 · ⓑ 라벨 줄 높이 11(`--bar-chart-label-line`) → 62 | **ⓑ** | — |
| 2 | `VG7-C-02` | Progress 제목 y0 vs Figma y10 (캐릭터 겹침 26 vs 36) | ⓐ AD 등록 · ⓑ `--progress-character-top` 14 → 4 (−66 일괄 매핑) · ⓒ `TopBar large` 전역 위 여백 10 | **ⓑ** | — |
| 3 | `VG7-C-04` | chip 오른쪽 끝 x349 vs 369 (Library 도 같음) | ⓐ 공유 `TopBar large` 빈 leading 2열로 수정 · ⓑ 두 화면 AD 등록 | **ⓐ** | — |
| 4 | `VG7-D-08` | 상세 ⑤ `5×` 메타 ink-400 2.31 | ⓐ `P-35` 확장 · ⓑ `secondary` | **ⓑ** | 4·6·9 한 규칙 |
| 5 | `VG7-E-05` | 클립 오류 시 재생 버튼 24px 아래로 이동 | ⓐ 유지 · ⓑ 행 2단(버튼 = 라벨 블록 가운데) · ⓒ 위 정렬 | **ⓑ** | — |
| 6 | `VG7-E-06` | 클립 시간 텍스트 ink-400 2.31 | ⓐ `P-35` 확장 · ⓑ `secondary` | **ⓑ** | 4·6·9 |
| 7 | `VG7-E-10` | iOS Safari 첫 탭 `NotAllowedError` 위험 | ⓐ 현행 + 실기기 확인 · ⓑ 탭 핸들러 동기 구간에서 `play()` 선호출 + 실기기 확인 · ⓒ URL 선조회(AC-7-49 위반, 비권고) | **ⓑ** | AC-7-62 수동 |
| 8 | `VG7-F-03` | PDF ready 2버튼 폰 폭 세로 stack (Spec "가로 2") | ⓐ stack 수용 · Spec 정정 · ⓑ 가로 고정 옵션(Shared API 확장) | **ⓐ** | — |
| 9 | `VG7-F-05` | PDF 상태 문구 ink-400 2.23 | ⓐ `P-35` 확장 · ⓑ `secondary` | **ⓑ** | 4·6·9 |
| 10 | `VG7-F-06` | 새 문구 *HARU 4-week report* (OS 공유 시트 제목) | ⓐ 승인 · ⓑ title 생략 | **ⓐ** | — |
| 11 | AD 일괄 | 아래 허용 차이 후보 등록 (최우선 규칙 6) | 항목별 승인 / 보류 | 전부 등록 권고 (조건부 2건은 2·3 결정에 따름) | — |

**권고안 전부 채택 시 영향**: 토큰 2(`--bar-chart-label-line` 신설 · `--progress-character-top` 값) · Shared 1(`TopBar large`) · tone 4곳 · 클립 행 구조 1 · 클립 탭 핸들러 1 · AD 조건부 2건 소멸. baseline 재생성은 **한 번에** `--update-snapshots=all` + 원인 분해(`R-BASELINE-1` 3-1·5) — 대상 예상: `s7-bar-chart` · Progress 3장 · Library 계열 · 상세 `main` · 클립 7장 · `s7-pdf-generating`.

### Stage 7 허용 차이 후보 전체 (등록 0 — 현재 문구)

| ID | Figma | 구현 | 근거 | 상태 |
|---|---|---|---|---|
| `AD7-1` | `163:2558` *"+18% vs last week"* | 미렌더 | `D7-2` ① | 후보 |
| `AD7-2` | `163:2560` *"6 of 7 nights · avg 12 min"* | *"6 nights · avg 12 min"* | `D7-2` ② | 후보 |
| `AD7-3` | `110:861` *"… · we'll email it too."* | 제거 → *"Next report on {date}"* | `N7-06` (`D7-4`) | 후보 |
| `AD7-4` | `110:853` 진행 값 span | 미렌더 **+ 트랙 268.47 → 313** (S7-C ⑮ 확장) | `N7-05` (`D7-4`) | 후보 |
| `AD7-5` | `163:2642` 캐릭터 프레임 gradient fill | 미렌더 | `N7-30` | 후보 |
| `AD7-6` | 막대 16m·20m 동일 높이 | 비례 높이 | `N7-29` | 후보 |
| `AD7-7` | 텍스트 10 · 10.5 · 11.5 · 12.5 · 13 | 11 · 11 · 11 · 12 · 12 (+ `B-03` ⓐ 이면 "막대 트랙 58 (Figma 63)" 결과 항목, ⓑ 이면 62) | `N7-31` | 후보 |
| `AD7-8` | `#6f8c88` eyebrow | ink-500 | `N7-32` | 후보 |
| `AD7-9` | `110:854` 버튼 h50 · 라벨 Bold 15 · 아이콘 17 · gap 9 | `Button md` 45 · 라벨 17/590 · 아이콘 20 · gap 8 (**S7-F 확장**) | `N7-33` | 후보 |
| `AD7-10` | StatTile radius 20 · 카드 24 · 아이콘 타일 14 | 22 · 22 · 12 (+ S7-B 확장: `BarChart` 스텁 radius 3 → 4) | 흡수 규칙 / `T7-8` | 후보 |
| `AD7-11` | StatTile 행 `overflow-clip` (그림자 잘림) | 클립 없음 | `R-SHADOW-1` ① | 후보 |
| `AD7-12` | 주간 카드 토글 chevron | `N7-41` 결과 | `N7-41` | 후보 |
| `AD7-13` | placeholder 수치 `31:102` 5/62m ↔ `110:522` 6/72m | 서버 값 (시각 비교는 같은 fixture) | `M-10` | 후보 |
| `AD7-14` | `110:835` 진행 막대 100% | — | `VG7-A-05` ⓑ 채택 | **소멸** |
| `AD7-15` (번호 제안) | 아이콘 stroke `110:838` 1.65 · `31:120` 1.2 | Lucide 공통 1.5 | `VG7-C-05` | 후보 |
| `AD7-16` (번호 제안) | 텍스트 줄 높이 (`163:2551` · `110:835` · `163:2607`) | 토큰 typography 줄 높이 흡수 — 카드 높이 차(예: `110:835` 230.5 → 212 중 −12.5) | H7-3.9 · `VG7-C-11` | 후보 |
| (조건부) | `31:115` 제목 행 y0 · 겹침 26 (Figma 36) | — | `C-02` ⓐ 일 때만 | 권고안이면 소멸 |
| (조건부) | `31:118` · `30:90` chip 오른쪽 끝 x349 (Figma x369) | — | `C-04` ⓑ 일 때만 | 권고안이면 소멸 |

활성 후보 **15건**(`AD7-1`~`13` · `15` · `16`) + 조건부 2 · 소멸 1. 가값 후보(AD 아님): `D-08` · `E-06` · `F-05` 의 ⓐ 를 택할 때만 `P-35` 확장.

---

## D7-6 반영 확인

design-agent · 2026-11-20 · 대상 = `D7-6`(`docs/decisions/stage-7-approvals.md`) ①~⑤ · `VG7-E-04` 수정 + dev 인계 `H7-7`(`docs/qa/stage-7-handoff.md`). Playwright 실행 0 — 증거는 dev 가 재생성한 baseline(`e2e/__screenshots__/darwin/`)과 `git show HEAD:` 원본을 **PIL 로 직접** 잰 값이다. Production Code · Figma · approvals 문서 수정 0.

### 0. 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 방법 |
|---|---|
| `[meta]` | `get_metadata` — `163:2564`(막대 영역) · `31:102`(Progress 전체) · `30:88`(Library 제목 행) 선언 좌표 |
| `[fig]` | `get_screenshot` `31:102` 393×1105 · `30:74` 393×1103 (1:1) |
| `[shift]` | baseline ↔ Figma 렌더의 영역 정합 — dy 50~80 · dx ±1 전수 탐색, 평균 채널합 오차 최소값 |
| `[px]` | baseline 픽셀 — 잉크 행(run) · 밝은 면 열 · 색 표본(가장 어두운 픽셀) |
| `[diff]` | `git show HEAD:<path>` ↔ 작업본: Δ 채널합 > 15 · 반경 3 연결성분 · 후보 이동 shift 잔차 (`R-BASELINE-1` §5) |
| `[직독]` | 코드 직독 — `TopBar.css` · `BarChart.css` · `component/index.css` · `highlight-clip.css` · `HighlightClipRow.tsx` · `ReportDetailView.tsx` · `ReportPdfAction.tsx` · `ButtonGroup.css` · `ReportDetailTopBar.tsx` · `in-app-history.ts` · `LogInPage.tsx` |

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 결정 필요 |
|---|---|---|---|---|---|
| `VG7-R-01` | 막대 트랙 62 vs Figma 63 (`D7-6` ①) | **일치** (Δ−1 = `AD7-7` 결과) · 막대 아래끝 = Figma 열 y79 | — | 아니오 | 아니오 |
| `VG7-R-02` | Progress 캐릭터 (24,4) · 겹침 36 (`D7-6` ②) | **일치** — 캐릭터·제목·chip·StatTile 모두 Figma 와 **dy 66 한 값**으로 정합 | — | 아니오 | 아니오 |
| `VG7-R-03` | chip 오른쪽 끝 x369 — Progress · Library, Home 불변 (`D7-6` ③) | **일치** | — | 아니오 | 아니오 |
| `VG7-R-04` | `secondary` tone 4곳 (`D7-6` ④) | **일치** — 코드 4곳 + 렌더 색 `#7d9291` | Low (F-05 1곳 대비 기록) | 아니오 | 아니오 |
| `VG7-R-05` | 클립 버튼 중심 33 — 7상태 (`D7-6` ⑤) | **일치** | — | 아니오 | 아니오 |
| `VG7-R-06` | 클립 오류 문구 줄 높이 16 (`VG7-E-04`) | **일치** | — | 아니오 | 아니오 |
| `VG7-R-07` | Stage 3 baseline 3장 분해 (`R-BASELINE-1` §5) | **전부 TopBar 이동으로 설명** · 미설명 클러스터 0 | — | 아니오 | 아니오 |
| `VG7-R-08` | H7-7.6 ① 불가 문구 = 진행 자리 높이 22 유지 | **수용** | — | 아니오 | 아니오 |
| `VG7-R-09` | H7-7.6 ⑤ 로그인 복귀 후 상세 Back = Home | **사용자 결정** — AC-7-46 의 "Back = `N7-23`" 문언과 다르다 | Medium | Stage 7 QA 의 AC-7-46 판정에 영향 | **예** |
| `VG7-R-10` | Spec 정정 6건 | 반영 (개정 ㉕~㉚) | — | 아니오 | 아니오 |
| `VG7-R-11` | AD 최종 목록 | 아래 `## Stage 7 허용 차이 최종 (D7-6 등록)` | — | 아니오 | 등록 = 사용자/Orchestrator |
| `VG7-R-12` | `COMPONENT_MAP` · `DESIGN_TOKEN_MAP` | 반영 | — | 아니오 | 아니오 |
| `VG7-R-13` | 관찰 (정보) — `:has()` 미지원 폴백 · `:nth-child(3)` 결합 · Library chip 폭 | 수용 · 기록만 | — | 아니오 | 아니오 |

**Severity 합계: Critical 0 · High 0 · Medium 1 (`R-09`) · Low 1 (`R-04` F-05 대비 기록). Blocking 0** (design 문서 기준 — `R-09` 는 QA 의 AC-7-46 판정 전에 사용자 결정 권장). 사용자 결정 1건. 새 허용 차이 후보 0 · 새 가값 0 · 새 토큰 제안 0.

### 2. 항목 상세

#### `VG7-R-01` 막대 트랙 62 — 일치 `[meta][px][직독]`

```
Figma 163:2564 열 h96 (16m · 20m 열) = 값 라벨 y0 h10 → +6 → 막대 y16 h63 (아래끝 79) → +6 → 요일 y85 h11
구현 열 h96                           = 값 라벨 11 (--bar-chart-label-line) → +6 → 트랙 62 (아래끝 79) → +6 → 요일 11
```

- `[px] s7-bar-chart`: teal 100% 막대 2개 = **y64~125 (62행, 20m)** · **y76~125 (50행, 16m = 0.8 × 62 = 49.6)** — 트랙 62 · 비례(`AD7-6`) 그대로, 두 막대 아래끝 같은 행.
- 막대 아래끝 열 y79 = Figma 와 같다 (B-03 의 "아래끝 Δ−2" 해소). 남은 Δ−1 은 **위쪽 값 라벨 줄 11 vs Figma 10** 뿐 → `AD7-7`(11px 하한) 의 결과 항목.
- `[직독]` `BarChart.css` 라벨 `line-height: var(--bar-chart-label-line)` · 막대 `calc()` 의 줄 항도 같은 토큰. `component/index.css:594` `--bar-chart-label-line: 11px`. 하드코딩 0.

#### `VG7-R-02` Progress 캐릭터 (24,4) · 겹침 36 — 일치 `[meta][fig][shift]`

- `[meta] 31:102`: Content `31:115` y66 h40 · 캐릭터 `163:2642` (24, 70) 347×422 · 스택 `163:2638` y346. −66 매핑 → 제목 행 0~40 · 캐릭터 **(24, 4)** · 스택 **280** · 겹침 = 40 − 4 = **36** · 스택 − 캐릭터 = 276.
- `[shift]` `s7-progress-frame` ↔ Figma: 캐릭터 영역 **dy 66 · dx 0 (오차 4.5/765)** · StatTile 행 **dy 66** (10.8) · chip **dy 66** · 제목 **dy 66** — 이전(VG7-C-03)은 캐릭터 dy 56 · 제목 dy 66 으로 **두 값이 섞여** 있었다. 이제 상단 전체가 **한 오프셋**이다.
- `[px]` 제목 잉크 행: Figma y76~99(→ −66 = 10~33) · 구현 **10~34** ✅.
- chip · 제목의 dx −1 (오차 12.3 vs 19.7)은 글리프 렌더(SF ↔ Inter/시스템) 차이 범위 — 박스 기하는 e2e `getBoundingClientRect` 369 와 아래 `R-03` 이 확인.
- `--progress-character-top: 4px` (`component/index.css:625`, 주석 "Figma y70 − 66") · `DESIGN_TOKEN_MAP` `T7-11` 행 값 4 ✅.

#### `VG7-R-03` chip 오른쪽 끝 x369 — 일치 `[meta][fig][px][직독]`

| 화면 | Figma (선언) | Figma 렌더 밝은 면 (y 중간 행) | baseline 밝은 면 | 판정 |
|---|---|---|---|---|
| Progress `31:118` | 24 + 230 + 115 = **369** | — | ~368 (그림자 제외) · e2e 369 | ✅ |
| Library `30:90` | 24 + 211 + 134 = **369** | x235~**368** | x258~**368** · 이전 HEAD **348** | ✅ (+20) |
| Home | — (leading 워드마크 → 조건 밖) | — | Home 계열 baseline **변경 0** (`git status` — `s3-home*`·`s2-home*` 무변경) | ✅ 불변 |

- `[직독] TopBar.css`: `.haru-top-bar--large:has(> .haru-top-bar__leading:empty) { grid-template-columns: minmax(0,1fr) auto }` — 직계 자식 · `:empty` 로 좁혀 Home(leading 있음)·pill·centered 영향 0. 결정 ③ 의 조건 그대로.
- Library chip **폭**(구현 ≈111 vs Figma 134)은 라벨이 다르기 때문이다(*2 this week* vs Figma placeholder *2Week streak* — Stage 3 `WeekSummaryChip` 확정 결정 `D-6`, 아이콘 `A-23`). D7-6 범위 밖이며 새 차이 아님 → `R-13`.

#### `VG7-R-04` `secondary` 4곳 — 일치 `[직독][px]`

| # | 위치 | 코드 | 렌더 색 |
|---|---|---|---|
| 1 | 상세 ⑤ `{count}×` 메타 | `ReportDetailView.tsx:240` `tone="secondary"` | (dev 분해 — 글자 영역만 Δ) |
| 2 | 클립 시간 | `HighlightClipRow.tsx:96` `tone="secondary"` | `s7-clips-idle` 시간 최암 픽셀 **(125,146,145) = `#7d9291` ink-500** — 같은 행 날짜(secondary)와 동일 |
| 3 | PDF *Preparing…* | `ReportPdfAction.tsx:138` | 최암 (118,139,138) — ink-500 위 AA 겹침 범위 |
| 4 | 공유 불가 문장 | `ReportPdfAction.tsx:144` | (장면 baseline 없음 — 코드 확인) |

- 세 기능 폴더(`report-detail` · `report-pdf` · `highlight-clip-player`) + `entities/highlight-clip` 의 텍스트 `tone="tertiary"` **0** (grep). 새 가값 0.
- **Low (기록)**: H7-7.5 대로 `F-05` *Preparing…* 이 카드 아래쪽 면에서 **2.71** — `P-01` 범위(ink-500 보조 텍스트)의 값 목록에 추가 기록 대상(QA 가값 목록). 새 가값 아님.

#### `VG7-R-05` 클립 버튼 위치 고정 — 일치 `[px][직독]`

`[px]` 재생 글리프 잉크 중심 − 같은 행 라벨 잉크 top (행 기준 상대값):

| 상태 | 1행 | 2행 |
|---|---|---|
| idle · loading · playing · paused | 80.5 − 53 = **27.5** | 158.5 − 131 = **27.5** |
| error · offline (1행에 문구) | 80.5 − 53 = **27.5** | 194.5 − 167 = **27.5** |
| unavailable (2행 불가) | 27.5 | 158.5 − 131 = **27.5** |

- 7상태 × 2행 **전부 같은 상대 위치** — e2e 의 "행 top 기준 중심 33" 과 같은 사실(라벨 잉크 top = 행 top + 5.5). 이전 error = +24.
- error 2행 라벨 top 131 → 167 (+36 = 문구 2줄 32 + row-gap 4) — 문구가 **다음 줄**에 붙는다 ✅.
- `[직독]` `.haru-clip-row` grid `row-gap: var(--space-1)` · 버튼 `grid-row: 1 / span 3` · 본문 `display: contents`. 토큰 외 값 0.

#### `VG7-R-06` 오류 문구 줄 높이 16 — 일치 `[px][직독]`

- `s7-clips-error` 문구 잉크 run **121~131 · 137~147** → 줄 간격 **16** (이전 22). offline 같음. 카드 256 → **244** (−12 = 2줄 × 6).
- `[직독]` `.haru-clip-row__message { font-size: var(--text-caption-1); line-height: var(--text-caption-1--line-height) }` — live `<p>` 노드 그대로(클래스만 토글) ✅.

#### `VG7-R-07` Stage 3 baseline 3장 분해 — 전부 설명됨 `[diff]`

| baseline (`visual.spec.ts/`) | Δ 픽셀 | 성분 | shift(+20, 0) 잔차 | 원인 |
|---|---|---|---|---|
| `s3-library.png` | 2,215 | x238~271 y3~42 (873) · x271~368 y3~42 (1,342) | **0 · 0** | `D7-6` ③ chip +20 |
| `s3-library-empty.png` | 2,215 | 같음 | **0 · 0** | 같음 |
| `s3-library-favorites-empty.png` | 2,215 | 같음 | **0 · 0** | 같음 |

- 제목 *Library* (x25~118) · 본문 · 탭바 Δ **0**. 성분은 y3~42(chip 행) 밖에 없다.
- chip 이 비운 왼쪽 띠(x≈235~257)가 성분에 없는 이유: glass 면 가장자리 ↔ 배경 차가 채널합 ≤ 9(예 x236 `(216,235,228)` vs 배경 `(219,238,231)`)로 문턱 15 아래 — 원인 같음, 별도 클러스터 아님.
- 같은 폴더의 다른 `s3-library-*` 9장 무변경: 영역 스냅샷(345 폭 — TopBar 없음) 5장 · 다른 route(`/library/add` · `/library/gift-requests` — TopBar 다름) 2장 · 시트 2장. 3장만 바뀐 것과 정합.
- **미설명 클러스터 0** → `R-BASELINE-1` §5 충족. (dev 의 런타임 토글 증거 H7-7.4 와도 일치.) `v1-button` · `v2-material` 의 작업본 변경은 이전 단위(S7-B · S7-F, `VG7-B-07` · `VG7-F-04`) 몫이며 이 분해 대상 아님.

#### `VG7-R-08` H7-7.6 ① 불가 문구 진행 자리 높이 22 — 수용 `[px][직독]`

- 근거: 22 = 진행 행(시간 span 이 body 줄 상자 상속)의 **기존 idle 높이** — 새 값이 아니라 기존 행 높이를 보존. 토큰 `--text-body--line-height` 사용, 신설 0.
- 효과: 불가 2행 버튼 상대 위치 27.5 = idle (`R-05`), 카드 208 = idle. 결정 ⑤ "어느 상태에서도 버튼 이동 0" 을 충실히 따른 구현. **결정 불요 — 수용.** Spec §2.5 개정 ㉘ 에 기록했다.

#### `VG7-R-09` H7-7.6 ⑤ 로그인 복귀 후 상세 Back = Home — 사용자 결정 `[직독]`

- 동작(직독): 미인증 deep link → Guard 가 Welcome 으로 → Welcome → Log in **push**(`WelcomePage.tsx:65`) → 로그인 성공 `navigate(returnPath, { replace: true })`(`LogInPage.tsx:51`) → 상세의 `history.state.idx = 1` → `hasInAppHistory()` 참 → `navigate(-1)` → Welcome → Guard 규칙 6(인증 사용자 auth 화면) → **Home**.
- 문제: AC-7-46 은 "로그인 후 복귀 · **Back = `N7-23`**", `N7-23` 은 "앱 안 기록 없음(deep link 진입) → `/progress`". 사용자 관점에서 이 진입은 deep link 다 — 앞에 있는 Welcome · Log in 은 **콘텐츠 화면이 아니라 관문**이다. Home 은 탭 루트이기는 하나 리포트의 부모(`/progress`)가 아니다.

| 안 | 내용 | 변경 범위 | 장점 | 단점 |
|---|---|---|---|---|
| ⓐ 수용 (Back = Home) | 현행. AC-7-46 문언을 "로그인 복귀 진입의 Back = Home" 으로 정정 | 코드 0 · Plan AC 문언 | 변경 0 · 인증 화면에 머물지 않음은 이미 보장 | `N7-23` 과 진입 방식에 따라 목적지가 갈린다(직접 deep link = `/progress`, 로그인 경유 = Home) |
| ⓑ **복귀 이동에 "관문 경유" 표식** | 로그인 성공의 복귀 `navigate` 에 router `state`(예 `{ viaAuthReturn: true }`, 경로·PII 아님)를 싣고, 상세 Back 판정이 이 표식이면 "기록 없음"으로 취급 → `/progress` replace | `LogInPage` 1줄 + `ReportDetailTopBar`/`in-app-history` 판정 1곳 (Stage 7 범위 안) · e2e 단정 1건 교체 | `N7-23` 과 일치 · 두 진입이 같은 결과 · Stage 2 흐름 불변 | `in-app-history.ts` 의 "`history.state` 읽기만" 원칙에 router state 1개 예외(앱 데이터 아님, 플래그) |
| ⓒ Welcome → Log in 을 replace 로 | 관문 기록 자체를 남기지 않음 → idx 0 → `/progress` | Stage 2 `WelcomePage` | 표식 불필요 | **Log in 화면의 Back 이 Welcome 이 아니라 앱 밖**으로 — Stage 2 승인 흐름 변경 · Stage 2 회귀. 비권고 |
| ⓓ Stage 8 로 이월 | `VG6-D-12`(앱 전체 Back 규칙)와 함께 결정, 지금은 ⓐ 상태로 QA | 0 | 앱 전체 규칙과 한 번에 | AC-7-46 이 Stage 7 에서 PARTIAL/수용 처리 필요 |

**권고: ⓑ** — 사용자 결정 ⑨ 의 취지("로그인 후 원래 리포트로")는 *deep link 로 들어온 사람에게 리포트를 보여준다*는 것이고, 그 사람의 Back 은 `N7-23` 이 이미 정한 `/progress` 가 자연스럽다. 변경이 Stage 7 코드 2곳으로 작고 Stage 2 를 건드리지 않는다. 비용을 0 으로 하려면 ⓐ(AC 문언 정정)도 가능하다.

#### `VG7-R-10` Spec 정정 — 반영 (`stage-7-design-spec.md` 개정 노트 ㉕~㉚, Status 줄 불변)

㉕ §2.6 ready `ButtonGroup` 그룹 폭 < 360 자동 세로 stack(폰 폭 = 세로: 위 Share · 아래 Save PDF, gap `--space-3` — `ButtonGroup.css` `@container (width < 360px)` 직독) · ㉖ §10.4 공유 시트 제목 *HARU 4-week report* · ㉗ C-13 정보성 보조 텍스트 = `secondary` 규칙 (§2.3 ⑤ · §2.5 · §2.6 · §9.3) · ㉘ §2.5 클립 행 2단 grid · 오류 문구 다음 줄 · 문구 줄 16 · 불가 자리 22 유지 · ㉙ §3.4 · §5.2 BarChart 라벨 줄 `--bar-chart-label-line` 11 → 트랙 62 · ㉚ §2.1 · §2.1.1 · §5.2 캐릭터 top 4(−66 일괄) · TopBar large 빈 leading 2열.

#### `VG7-R-11` AD 최종 — 아래 `## Stage 7 허용 차이 최종 (D7-6 등록)`

D7-6 수정이 바꾼 것: `AD7-7` 결과 항목 58 → **62** (줄 높이 원인 해소, 크기 하한만 남음) · `AD7-6` 수치 갱신(트랙 62 기준) · 조건부 2건(`C-02` ⓐ · `C-04` ⓑ) **미채택 제외**. 나머지 문구는 S7-A~F 종합표 그대로(확장 `AD7-4` ⑮ · `AD7-9` F-02 · `AD7-10` 스텁 radius · `AD7-16` 범위 `163:2607` 포함).

#### `VG7-R-12` `COMPONENT_MAP.md` · `DESIGN_TOKEN_MAP.md` — 반영

- `COMPONENT_MAP`: 머리 갱신 노트 · **TopBar 행에 large 열 규칙**(leading 있음 3열 / 비어 있음 2열) · `ProgressTopBar` 행 x349 결정 대기 → 해소 · `BarChart` 행 트랙 62.
- `DESIGN_TOKEN_MAP`: 개정 줄 추가. `T7-4` `--bar-chart-label-line` 11px 행 · `T7-11` top 4 행은 dev 가 이미 넣었고 코드(`component/index.css:594` · `:625`)와 **대조 일치** 확인.

#### `VG7-R-13` 관찰 — 기록만 `[직독]`

- `:has()` 미지원 브라우저(Safari < 15.4 · Chromium < 105)에서는 3열로 돌아가 chip 이 x349 — **열화만 있고 깨짐 없음**. 지원 범위는 Stage 0 브라우저 정책 대상이며 여기서 새 조치 없음.
- 불가 높이 규칙이 `.haru-clip-row__body > .haru-clip-row__message:nth-child(3)` — "불가 = 진행 미렌더(문구가 3번째)"라는 **DOM 순서에 결합**. 현재 `progress: null` 은 unavailable 일 때뿐(`HighlightClipList.tsx:65`)이라 정확하다. 본문 자식 순서를 바꾸면 이 규칙도 같이 볼 것(주석 있음). 결함 아님.
- Library chip 폭 차이는 `R-03` 끝 — Stage 3 확정 라벨의 결과, 새 차이 아님.

---

## Stage 7 허용 차이 최종 (D7-6 등록)

`D7-6` ⑪ 에 따라 등록할 **최종 문구·수치** (D7-6 ①~⑤ 반영 후, 2026-11-20). Orchestrator 가 `docs/decisions/stage-7-approvals.md` 로 옮긴다 — 이 문서는 approvals 를 수정하지 않았다. 조건부 2건(`C-02` ⓐ · `C-04` ⓑ)은 미채택으로 **제외**, `AD7-14` 는 `VG7-A-05` ⓑ 로 **소멸**(번호 결번).

| ID | 지점 (Figma) | Figma 값 | 구현 값 | 근거 결정 | 출처 |
|---|---|---|---|---|---|
| `AD7-1` | `163:2558` 주간 비교 문구 | *"+18% vs last week"* | 미렌더 | `D7-2` ① | `VG7-A-02` |
| `AD7-2` | `163:2560` 주간 보조 줄 | *"6 of 7 nights · avg 12 min"* | *"6 nights · avg 12 min"* | `D7-2` ② | `VG7-A-02` |
| `AD7-3` | `110:861` 다음 리포트 줄 | *"Next report on Jun 7 · we'll email it too."* | *"Next report on {date}"* (이메일 문구 제거) | `N7-06` (`D7-4`) | `VG7-A-06` |
| `AD7-4` | `110:853` 진행 값 span · `110:851` 트랙 | 값 span 34.53×11.5 · 트랙 폭 268.47 | span 미렌더 · 트랙 폭 **313** (행 전체) | `N7-05` (`D7-4`) | `VG7-C-12` ⑮ |
| `AD7-5` | `163:2642` 캐릭터 프레임 fill | gradient `#daebe5 → #d0e1dc` | 미렌더 (투명 에셋만) | `N7-30` (`D7-5`) | `VG7-C-01` |
| `AD7-6` | `163:2564` 주간 막대 높이 | 선형 4.36 px/분 + 상한 63 클립 (16m · 20m 모두 63) | 비례 높이 — 최댓값 = 트랙 **62** (20m 62 · 16m 49.6) · 강조 `≥ 0.75 × max` | `N7-29` ⓐ (`D7-5`) | `VG7-C-10` · `VG7-R-01` |
| `AD7-7` | `163:2564` 막대 라벨 · `163:2551`·`110:835`·`163:2607` 텍스트 | 크기 10 · 10.5 · 11.5 · 12.5 · 13(4행) | 11 · 11 · 11 · 12 · 12 — **결과 항목: 막대 트랙 최대 62 (Figma 63, Δ−1)** · 막대 라벨 줄 높이는 Figma leading 1.0 그대로(11) | `N7-31` ⓐ (`D7-5`) · `D7-6` ① | `VG7-B-03` · `VG7-R-01` |
| `AD7-8` | `163:2634` Moment eyebrow 색 | `#6f8c88` | `--color-fg-secondary` (ink-500 `#7d9291`) | `N7-32` ⓐ (`D7-5`) | `VG7-C-05` |
| `AD7-9` | `110:854` Download PDF 버튼 | h50 · 라벨 Bold 700 15/15 · 아이콘 17 · gap 9 | `Button md` h45 · 라벨 headline 17 / 590 · 아이콘 20 · gap 8 | `N7-33` ⓐ (`D7-5`) | `VG7-F-02` (확장) |
| `AD7-10` | radius — StatTile `163:2545` · 카드 `163:2551`/`110:835` · 아이콘 타일 `110:837` · 막대 스텁 `163:2580` | 20 · 24 · 14 · 3 | `--radius-surface` 22 · 22 · `--radius-media` 12 · `--radius-indicator` 4 | 토큰 흡수 규칙 (Stage 0 #10) · `T7-8` | `VG7-B-01` · `VG7-B-02` (확장) |
| `AD7-11` | `163:2544` StatTile 행 | `overflow-clip` (타일 그림자 잘림) | 클립 없음 (그림자 번짐 표시) | `R-SHADOW-1` ① | `VG7-B-01` |
| `AD7-12` | `163:2561` 주간 카드 토글 | chevron 30×30 | 미렌더 (버튼·`aria-expanded` 0, 막대 상시 표시) | `N7-41` ⓐ (`D7-5`) | AC-7-24 |
| `AD7-13` | `31:102` ↔ `110:522` placeholder 수치 | 5 sessions / 62m ↔ 6 / 72m (서로 불일치) | 서버 값 표시 (시각 비교는 `31:102` 와 같은 수치 fixture) | `M-10` | `VG7-A-02` |
| `AD7-15` | 아이콘 stroke `110:838` · `31:120` | 1.65 · 1.2 | Lucide 공통 1.5 | Stage 0 #21 (Lucide) | `VG7-C-05` |
| `AD7-16` | 텍스트 줄 높이 `163:2551` · `110:835` · `163:2607` | 제목 18 · 설명 18.13 · 보조 14.95/16.1 · 행 라벨 15 | 토큰 typography 줄 높이 (subheadline 20 · caption-1 16 · caption-2 13) — 카드 높이 `163:2551` 211.6 → 212 · `110:835`(버튼 제외) 166.5 → 154 중 줄 높이분 · `163:2607` +7 (아래 블록 +7) | 토큰 흡수 규칙 (Stage 0 #10) | `VG7-C-07` · `C-08` · `C-11` |

**등록 대상 15건** (`AD7-1`~`AD7-13` · `AD7-15` · `AD7-16`; `AD7-9` · `AD7-10` · `AD7-4` 확장 문구 포함). 소멸 1 (`AD7-14`) · 제외 2 (조건부). 가값 변화 0 — `D-08` · `E-06` · `F-05` 는 ⓑ(`secondary`)로 `P-35` 확장 없음; `F-05` 대비 2.71 은 `P-01` 값 목록 기록(`VG7-R-04`).
