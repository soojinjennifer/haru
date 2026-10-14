# Stage 4 Plan — Storytime Session · Recording Client (Web) · Pause/Resume · Prompt Drawer · Local Recording · Upload UX

Status: **APPROVED (2026-10-13, user)**

> **승인 사실** — 사용자 발화 *"승인 — 4a 구현 착수"* (2026-10-13). 승인 범위 = 이 Plan + `docs/design/stage-4-design-spec.md` + **허용 차이 4건**(`AD-S4-1`·`AD-S4-4`·`AD-S4-5`·`AD-S4-6`) + **가값 `P-25`**. 함께 확정된 신규 결정 2건(**`D4-21`·`D4-22`**)은 §0.1 · §0.9 에 있다. 정본 = `docs/decisions/stage-4-approvals.md` §0 · §4 · §5.
> ⚠️ 승인에 **포함되지 않은 것**: `AD-S4-7`~`AD-S4-10` 4건(design-agent 제안 — Drawer 폭 · 메달리온 링 · 버블 x · 320px 버튼 폭)은 **승인 대기**로 approvals §4 에 등재되어 추적된다.

> **개정 이력**
> - 2026-10-11 초판 (plan-agent) — Capacitor 셸·네이티브 Adapter 를 In Scope 로 포함, AC 103건, NEEDS DECISION 20건
> - 2026-10-12 개정 — 사용자 결정 **8건**(§0.1)과 `docs/design/stage-4-session-figma-audit.md`(design-agent, 2026-10-11) 실측 결과를 반영. **Stage 4 범위를 Web 녹음까지로 축소**하고 네이티브를 분리된 후속 단계로 옮겼다. In Scope **23 → 22**, AC **103 → 100**(이동 9 · 신규 6 · 수정 14), NEEDS DECISION **20 → 15**(해소·소멸 9 · 신규 4).
> - 2026-10-13 개정 1 — 사용자 결정 **4건 추가**(`D4-9`~`D4-12`)와 **Figma 갱신**(section `285:1126` "Recording" 신설)을 반영. `D4-7` 무효(`Discard` 채택) · `N4-23` 해소 · **4a/4b 분할**(`D4-9`) · AC **100 → 104** · NEEDS DECISION **15 → 17**.
> - **2026-10-13 개정 2 (이 문서)** — 사용자 결정 **8건 추가**(`D4-13`~**`D4-20`**, §0.1).
>   - ⭐ **`D4-13` — 녹음 폐기 contracts = 안 A 확정.** 전이 **2행만** 추가(`recording → abandoned` · `paused → abandoned`), `AbandonedReason` enum **없음** → **`N4-25` 해소**, **Stage 4a 의 ⛔ 차단이 0건**이 됐다. **Stage 0 #16 변경**이다 (§7.3-A).
>   - ⛔ **`D4-14` — `D4-6` 철회.** ready 버블 = **`139:2803`**(Prompt pill 5개) **Figma 그대로**. 허용 차이 **`AD-S4-3` 무효** · **AC-4-106 폐기** · `N4-24`·`R4-14` 해소. ✅ ready 세로 재배치 불필요 → `ready` **차단 해제**. ⚠️ **`S4F-01`·`S4F-02` 되살아남** + **PRD 수정 대상 7건**(§0.7).
>   - ✅ **`D4-16`~`D4-19`** — `Discard` 대비 = 가값 **`P-25`** · 확인 다이얼로그 **둔다**(`AD-S4-4`) · 비활성 = 전역 **`opacity .5`** · 하단 바 **가운데 정렬**(`AD-S4-5`) → **`N4-26`·`N4-29`·`S4F-11`·`S4F-17`·`C13-17` 해소**.
>   - (중간 집계) In Scope **22** 변동 없음.
>   - **4a/4b 재배분 판단**: `ready` 가 Figma 차단에서 풀렸으나 **화면 AC 는 4b 에 그대로 둔다** — 근거 §16.6.
>   - ⭐ **`D4-20` — PRD FR-10 세션 시작 인사 = 버블 제목 줄.** `139:2803` 의 제목 줄이 **서버 인사 문구**의 자리이고 아래 pill 5개는 Prompt 다. Figma 기하 유지 → **`N4-32` 해소**(plan-agent 권고안 채택). AC **3건 신규**(§11.12-C).
>   - ⚠️ **정정 2건** — ① **토큰 식별자**: `P-25` 의 Tier-2 이름을 **`--color-action-neutral-bg`/`-fg`** 로 고쳤다. `--color-action-secondary-*` 는 **이미 `glass` Button·Chip 의 것이고 가값 `P-11` 의 짝**이다(§0.8). ② **버블 기하**: 선언 **329×269**(258 아님) · 세로 padding 위 14 / 아래 13 · **Record Control 과의 렌더 간격 14.373**(27 아님) — design-agent 2차 정정.
>   - 재집계: AC **104 → 111**(폐기 1 · 신규 8 · 수정 7) · NEEDS DECISION **17 → 15**(해소 5 · 신규 3).
>   - 사용자 결정 전문은 **`docs/decisions/stage-4-approvals.md`**(신규)가 정본이다.

> - ⭐ **2026-10-13 승인 (`APPROVED`)** — 사용자 발화 *"승인 — 4a 구현 착수"*. 승인 범위 = Plan + Design Spec + **허용 차이 4건**(`AD-S4-1`·`AD-S4-4`·`AD-S4-5`·`AD-S4-6`) + **가값 `P-25`**. 함께 **신규 결정 2건** 확정: **`D4-21`**(인사 1줄 제약 ≤240px ≈28자 · 1줄 clamp · PRD §7.5 `:410` 예시 문구가 **수정 대상 15**) · **`D4-22`**(인사 없으면 제목 줄 미렌더 · **28px 단축** · Frontend fallback 0건 · `Try this prompt !` 제품 코드 금지). **AC 3건 정합화**(AC-4-120·121·122 — 신규 0, 합계 **111** 유지). ⚠️ `AD-S4-7`~`AD-S4-10` 4건은 **승인 대기**(approvals §4 등재).

Based on:
- PRD **v1.5** (`docs/source/HARU_PRD_v1.5.md`) — FR-09 · FR-10 · FR-11 · FR-14 · FR-19 · FR-02 · FR-21 · FR-23 · FR-25 · §5.2 · §7.4~§7.6 · §11 · §12.1 · §12.2 · §13
- Figma `YWWu3AFEJpRxvw0T5klq0k` page `16:2` — `28:51` · `29:62` · `88:960` · `88:757` · `139:2803` · `163:1590/1591/1601/1618/1620` · `78:353` (실측 감사는 **design-agent 소관** — §15)
- `CLAUDE.md` (Frontend-only Scope · ⛔ 최우선 규칙 "Figma 를 그대로 구현한다") · `.claude/rules/*.md`
- 승인 문서 — `docs/ARCHITECTURE.md` §10 전체 · §16(OAQ-10·11·16·17) · `docs/API_CONTRACTS.md` §1.2 · §2.2 · §3.1~§3.3 · §4 Stage 4 · §5.1.1 · §5.3 · §5.4 · §6(G-08·G-09) · `docs/DATA_MODEL.md` §8 · `docs/COMPONENT_MAP.md` · `docs/FIGMA_SCREEN_MAP.md` §1.2 · §2 · §3 · `docs/DESIGN_SYSTEM.md` (애니메이션 에셋 부재 = Stage 4 차단) · `PLANNING.md` §4 · §5 Stage 4 · §6 · §7 · §8 · §9.2 · `docs/decisions/stage-0-approvals.md`(#7 · #12 · #16 · #17 · #22 · #27 · C-13 · C-15 · C-16) · `docs/decisions/stage-3-approvals.md` §13.10 · §26.1 · §27.6 · §28.6 · §30.7 · §30.8
- 선행 Verdict — `docs/qa/stage-3-qa-report.md` **§14 (5회차, 커밋 `fe349cb`)**: `PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`
- **사용자 결정 8건 (2026-10-11~12)** — §0.1. 이 Plan 의 다른 모든 서술보다 우선한다.
- **Figma 실측 감사** — `docs/design/stage-4-session-figma-audit.md` (design-agent, 2026-10-11, 705행). 초판의 `[직독, metadata]` 판독을 이 감사가 `[실측·ctx]`·`[실측·svg]` 로 **대체**한다 (§0.2)
- 외부 문서 재확인 (2026-10-11, 초판에서 직접 조회) — Capawesome Audio Recorder · Cap-go `@capgo/capacitor-audio-recorder` → **결정 1 로 Stage 4 범위 밖**이 되었으나, 후속 단계 판단 근거로 §3.0 에 보존한다

> **표기 규칙** — 이 Plan 은 두 가지를 구분한다.
> - **[직독]** = plan-agent 가 이 세션에서 해당 파일·노드를 직접 읽어 확인한 것
> - **[추론]** / **[문서 인용]** = 읽은 자료에서 미루어 쓴 것, 또는 다른 문서의 서술을 근거로 쓴 것
>
> 증거 없는 서술을 사실로 쓰지 않는다. 각 절의 핵심 사실에는 근거 파일·줄·노드를 붙였다.

---

## 0. 사용자 결정 반영 · 선행 정정

### 0.1 사용자 결정 22건 (2026-10-11~13) — 이 개정의 근거

> 전부 **사용자 발화로 확정**된 것이다. 각 행의 "이 Plan 에 반영된 곳" 은 개정 결과다.
> ⭐ **정본은 `docs/decisions/stage-4-approvals.md` 다** (2026-10-13 신규). 이 표와 그 문서가 다르면 **approvals 문서가 우선**한다.
> ⚠️ **Orchestrator 채택(= 사용자 결정 아님)** 은 approvals §7 에 분리해 적었다 — Toast 문구 `Recording submitted` 가 그에 해당한다.

| # | 결정 | 라벨 | 이 Plan 에 반영된 곳 |
|---|---|---|---|
| **D4-1** | **Stage 4 범위 = Web 녹음까지.** Capacitor·네이티브(`apps/mobile` 생성 · 네이티브 녹음 플러그인 · 네이티브 Auth/Push Adapter · portrait lock)를 **Stage 4 In Scope 에서 분리**해 후속 단계로 옮긴다. Stage 4 에 **남기는 것 = `RecorderAdapter` interface + Web 구현** (interface 경계는 유지 — `rules/architecture.md` §1 "교체가 예정된 경계") | **CONFIRMED** | §0.4(Stage 0 #7 변경) · §2.1 · §2.2 · §2.5 · **§3.0 신설** · §5.1 · §9.4 · §11.12(AC 이동 9건) · §13 · §14.1 · §16 |
| **D4-2** | **출석 스티커 부제 — `D-6` 유지, streak 문구 교체.** Figma `29:85` `Day 12 · keep the streak going` 를 **채택하지 않는다.** 대체 문구는 **관찰 언어로 design-agent 가 제안하고 사용자 승인**을 받는다. → **허용 차이 등록 대상**(등록은 사용자 승인 후 — CLAUDE.md 최우선 규칙 6) | **CONFIRMED** | §0.5 · §6(`sticker_awards`) · AC-4-59 수정 · **AC-4-107 신규** · §14.1 (`N4-12` 해소) · §15.5 |
| **D4-3** | **애니메이션 = CSS 모션으로 시작** (Stage 0 #9 선례). **Lottie/Rive 도입 없음.** `prefers-reduced-motion` 대체 정의 **필수** | **CONFIRMED** | §11.10 AC-4-98 수정 · **AC-4-109 신규** · §13 (`R4-04` 해소) · §14.1 (`N4-06` 해소) · §0.6 (`DESIGN_SYSTEM.md:151` 해소 기록 대상) |
| **D4-4** | **실기기 = iOS 있음 / Android 없음.** 단 `D4-1` 로 네이티브가 빠졌으므로 초판의 `NOT VERIFIED` 예상 4건(네이티브 녹음 시작 지연 · 인터럽션 · portrait 회전 · 백그라운드 유지)은 **Stage 4 판정 대상에서 제외**되고 후속 단계로 간다. 대신 **Web 의 백그라운드·탭 비활성 녹음 한계는 Stage 4 에서 판정**한다 (`rules/architecture.md` §7 — "Web 은 보장 불가") | **CONFIRMED** | §2.2 · §11.6 AC-4-50·68·70 수정 · **AC-4-108 신규** · §12 · §14.2 (`N4-21` 신규) |
| **D4-5** | **세션 컨트롤 하단 버튼을 상태별로 쓴다** — `recording` → **`Submit`**(`163:1620`) · `paused` → **`Resume`**(`140:2870`). **`Done Reading` 신규 라벨을 만들지 않는다.** Record Control(`163:1591`)은 `Record`·`Pause` **2변형만** 존재 | **CONFIRMED** | §1 · §2.1 FR-09 · AC-4-41·57·97 수정 · §14.1 (`N4-01` 부분 해소) · §14.2 (`N4-23` 신규 — ready 상태 하단 버튼 미결) |
| ~~**D4-6**~~ | ⛔ **철회 (2026-10-13, `D4-14`)** — 아래 원문은 변경 이력을 위해 남긴다. ~~**Prompt 를 캐릭터 버블에 표시하지 않는다.** 준비 화면 버블 = **`88:757`** 인사 버블(현재 미배치). `139:2803` 의 **Prompt pill 5개 자동 표시는 미채택.** Prompt 는 **Prompt Drawer 에만** 둔다 (FR-11 모아보기). PRD §7.5 와 일치하므로 **PRD 수정 대상 아님**. ⚠️ 이 결정은 사용자 직접 서술을 Orchestrator 가 해석한 것이다 — **사용자 재확인 대상**(`N4-24`)~~ → **재확인 결과 해석이 틀렸다**(`D4-14`) | ~~CONFIRMED (Orchestrator 해석)~~ → **SUPERSEDED (`D4-14`)** | §0.1 `D4-14` 행 · §2.1 FR-10·FR-11 **재작성** · AC-4-40·53 **재수정** · ~~AC-4-106~~ **폐기** · §14.1 (`N4-24` 해소) · §0.5 (`AD-S4-3` **무효**) · **§0.7 PRD 수정 대상 7건** |
| ~~**D4-7**~~ | ⛔ **무효 (2026-10-13)** — ~~*"`Discard` 미채택. `163:1618` 은 구현하지 않는다. contracts 에 녹음 폐기 전이·`completedReason` 신규 값을 추가하지 않는다(전이표 신규 행 0 목표 유지)."*~~ **`D4-12` 가 `Discard` 를 채택**했다. 원문은 변경 이력을 위해 남긴다 | ~~CONFIRMED~~ → **SUPERSEDED (`D4-12`)** | §3.3 **재작성** · §7.3 **재분석** · ~~AC-4-105~~ **폐기** · §14.1 (`N4-03` 재해소) · §0.5 (`AD-S4-2` **무효**) |
| **D4-8** | **C-13 분배** — **안내·상태 UI = design-agent 명세**(Stage 0 #22 선례). **세션 화면 상태별 비주얼 = 디자이너 Figma 요청**: `C13-1`(상태별 세션 화면) · `C13-14`(Record Control paused/disabled/permission-denied). 이 2건에 의존하는 구현은 **Figma 수령 전까지 보류**. ⭐ **2026-10-13 정정** — `C13-6`(대화 전용 흐름) · `C13-13`(Reading Context 시트) 도 **이 분배에 포함되어 design-agent 명세로 갔다**. §4.3 초판이 "분배되지 않았다" 로 적은 것은 **오기**다 (`docs/design/stage-4-design-spec.md` §7.4 · §7.5 · §12.4-③) | **CONFIRMED** | §4.3 **정정** · §15.2 · §16 (S4-F·S4-G 선행) · **§16.3 Stage 4 종결 경계** · §14.2 (`N4-22` 신규) |
| **D4-9** ⭐ 2026-10-13 | **Stage 4 를 `4a` "Recording Core" / `4b` "Session Screens" 로 분할한다** — §16.3 의 권장 ⓑ 채택. 4a = 비시각(contracts·Mock·RecordingController·로컬 영속·업로드 큐·이월), 4b = 세션 화면·Drawer·완료 화면·예외 안내 UI. ⚠️ **plan-agent 권고(§16.3 ③): Stage 4a `PASS` 로 Stage 5 를 시작하지 않는다** — Stage 5 회고 카드(`91:691`)가 완료 화면과 **같은 프레임 `29:62`** 이고 완료 화면은 4b(`S4-H1`)다. 4b 를 건너뛰면 Stage 5 가 **빈 상단 위에** 카드를 얹는다 | **CONFIRMED** | **§16.4 (4a)** · **§16.5 (4b)** 신설 · §16.3 (판단 근거 보존) · §14.1 (`N4-22` 해소) · §18-20 |
| **D4-10** ⭐ 2026-10-13 | **출석 스티커 부제 = `You read together today`** — `D4-2` 가 요구한 "관찰 언어 대체 문구" 를 확정했다. design-agent 측정: 렌더 **136.34px** / `29:85` 선언 폭 **171px** → 여유 약 **20%**. 허용 차이 **`AD-S4-1` 등록 대상 유지**(Figma `Day 12 · keep the streak going` 미채택) | **CONFIRMED** | §0.5 (`AD-S4-1` 문구 확정) · AC-4-107 (문구 고정) · §14.1 (`N4-12` 완전 해소) |
| **D4-11** ⭐ 2026-10-13 | **`S4F-12` 옵션 A 채택** — `IconButton` glass 변형의 `box-shadow` 를 `--shadow-rest`(3겹) → **`--shadow-bubble`(1겹)** 으로 교체한다. ⚠️ **영향 범위 = JSX 호출 `<IconButton` 35곳 / 21파일**(테스트 제외) — **[직독]** `apps/web/src` + `packages/ui/src` 의 `.tsx` 에서 `<IconButton` 을 grep 하고 `__tests__` 를 제외한 결과 = **35행 / 21파일**(2026-10-13). design-agent 가 보고한 *"72곳/20파일"* 은 **이 수치와 다르다** — 72 는 테스트·문서·CSS 를 포함한 전체 grep 으로 보이며, **판정 기준은 35/21** 이다. Stage 1~3 **시각 baseline 재생성이 따라온다** | **CONFIRMED** | §5.3 · **AC-4-110 신규** · §12 (baseline 재생성 절차) |
| **D4-12** ⭐ 2026-10-13 | **녹음 플로우 확정.** 사용자 원문: *"녹음전 준비 단계에서는 'Tap to Recording' 으로 되어 있다가 선택하면 Pause 버튼으로 바뀌고 하단에 'Discard', 'Submit' 버튼이 활성화 되어서 Discard를 선택하면 홈으로 돌아가고, Submit을 선택하면 녹음이 제출되었다는 토스트 팝업과 함께 1c-Compete & Feedback으로 가게 해주세요."* 상태 전환표 = **§2.1-A**. `Discard` **채택**(⇒ `D4-7` 무효) · ready 하단 버튼 **비활성**(⇒ `N4-23` 해소) · `140:2870` `Resume` 는 **`28:51` 에서 제거**됨(⇒ `D4-5` 의 "paused → Resume" 매핑 **재검토 대상**) | **CONFIRMED** | **§2.1-A 신설** · §2.1 FR-09·FR-21 · §3.3 · **§7.3 재분석** · §8 · **AC-4-111 ~ 114 신규** · §14.1·§14.2 · §16.4·§16.5 · **PRD 반영 2026-10-13** |
| **D4-13** ⭐ 2026-10-13 | **녹음 폐기 contracts = 안 A.** `SESSION_TRANSITIONS` 에 **전이 2행만 추가** — `{recording → abandoned}` · `{paused → abandoned}` (actor `caregiver`, modes `['recorded']`). **`AbandonedReason` enum 을 만들지 않는다** (plan-agent 는 **A′ 를 권고**했으나 사용자가 **A** 를 택했다). `SessionStatus` **8값 유지** · `CompletedReason` 신규 0 · error code 신규 **0**. ⚠️ **귀결**: **10분 방치와 사용자 폐기를 구분할 수 없다** — 둘 다 `→ abandoned`·actor `caregiver`. 세션 완료율 지표 분리 집계·폐기 Audit 근거가 전이 기록만으로는 남지 않는다. 사유 값 추가는 **나중의 별도 결정**(`N4-30`). `docs/API_CONTRACTS.md` §6 `G-09`(**[직독]** `:952`)가 이미 같은 안이므로 문서와 일치한다 | **CONFIRMED** (**Stage 0 #16 변경**) | **§7.3 결론 교체** · **§7.3-A ② 확정** · §7.5-13·14 · §8.3(`recording-discarded` 선행 해소) · **AC-4-07 수정** · §14.1 (`N4-25` 해소) · §16.4.5 (**4a ⛔ 0건**) |
| **D4-14** ⭐ 2026-10-13 | **Prompt 버블 유지 — Figma 갱신이 최종.** ready 버블 = **`139:2803`**(`Try this prompt !` + Prompt pill 5개, **선언 329×269** @ (34,336) · pill 간격 6 · 세로 padding 위 14 / 아래 13). **`D4-6` 철회** · `AD-S4-3` **무효** · `N4-24`·`R4-14` 해소. ✅ **좋은 귀결: ready 화면 세로 재배치가 불필요해졌다**(Record Control 과의 **렌더 간격 실측 14.373** 그대로) → **`ready` 가 차단에서 풀린다.** ⚠️ **`S4F-01`**(버블 높이 가변)·**`S4F-02`**(pill 2줄 넘침)는 **되살아난다.** ⚠️ **PRD 와 새 충돌** — §7.5 *"세션 중 Prompt 자동 제시 금지"* + *"버블은 시작·종료 2가지로 제한"*. CLAUDE.md Source of Truth 규칙대로 **Figma 를 따르고 PRD 항목을 수정 대상으로 기록**한다. **지금 PRD 를 고치지 않는다** | **CONFIRMED** (**PRD 수정 대상 발생**) | §0.1 `D4-6` 행 무효 표기 · §0.5(`AD-S4-3` 무효) · **§0.7 신설(수정 대상 7건)** · §2.1 FR-10·FR-11 · AC-4-40·53 **재수정** · ~~AC-4-106~~ **폐기** · §14.1·§14.2(**`N4-32` 신규**) · §16.6 |
| **D4-15** ⭐ 2026-10-13 | **PRD 의 "읽기 완료" 지표·개념 용어 3곳은 그대로 둔다** — `:86`(§1.2 루틴화) · `:161`(첫 세션 전환율) · `:163`(세션 완료율) **[직독]**. 근거: UI 라벨이 아니라 **지표·개념 용어**이고, 바꾸면 Stage 7 리포트·분석 요구와 어긋난다. **추가 조치 없음** | **CONFIRMED** | §0.7 (수정 **제외** 목록) |
| **D4-16** ⭐ 2026-10-13 | **`Discard` 라벨 대비 = Figma 그대로 + 가값 등록.** `#aeaeb2` 면 + 흰 라벨(**2.211:1**)을 구현하고 **신규 가값 `P-25`** 로 등록한다. **`D-01` 범위 확장이 아니다** — `D-01` 은 `--color-action-primary-bg`(`#85bfb6`) 한정이고 이것은 다른 토큰·다른 역할(보조·파괴적)이다. ⚠️ §14.2 `N4-29` 의 **2.19:1 은 스테일** — **2.211:1 이 정본** | **CONFIRMED** | §0.8(가값 `P-25`) · AC-4-95·97 수정 · **AC-4-119 신규** · §14.1 (`N4-29`·`S4F-17` 해소) |
| **D4-17** ⭐ 2026-10-13 | **`Discard` 에 확인 다이얼로그를 둔다.** Figma 에 없고 Design Guide 에 Dialog 컴포넌트가 **0개**이므로 **최우선 규칙 2 의 예외**다 — **design-agent 명세 + 허용 차이 `AD-S4-4` 등록 대상**. 절차 근거 = 공통 상태 화면 명세 우선(Stage 0 #22, Stage 1 `Dialog` 구현됨) | **CONFIRMED** | §0.5(`AD-S4-4` 확정) · §2.1 FR-21 · §4.3 `C13-17` · **AC-4-115·116 신규** · AC-4-113 수정 · §14.1 (`N4-26` 해소) · §15.3 |
| **D4-18** ⭐ 2026-10-13 | **버튼 비활성 시각 = `Submit` 의 `Accent/Disabled`(`17:18`) 와 동일한 전역 `opacity: 0.5`** 를 `Discard` 에도 적용. **`C13-17` 해소**(디자이너 요청에서 제거). ⚠️ **기록할 귀결**: ① 활성·비활성 구분이 **투명도 하나에만** 의존한다 → `aria-disabled` + 사유 안내로 보완(`D-3` 선례) ② `opacity .5` 가 **`Submit` 라벨 대비를 2.07 아래로 더 낮춘다** — WCAG **1.4.3 의 disabled 제외 조항** 범위이므로 위반은 아니나, `D-01` 이 수용한 2.07 은 **활성** 값이라는 점이 다르다 | **CONFIRMED** | §0.5(`AD-S4-6` 판단 요청) · §4.3 `C13-17` **해소** · AC-4-111 수정 · **AC-4-117 신규** · §14.1 (`N4-26` 해소) |
| **D4-19** ⭐ 2026-10-13 | **하단 버튼 바 = 열 가운데 정렬로 보정.** 버튼 폭 **135 고정** + **gap 9 유지**(135+9+135=**279**). Figma `x=67`(가운데면 57)의 **10px 어긋남은 허용 차이 `AD-S4-5` 로 등록**. 근거(Orchestrator 계산): **320px 폭에서 `67+279=346 > 320` 이라 우측이 잘린다**. → **`S4F-11` 해소**. ⚠️ **`S4F-16`**(바 규격 `135×45 ×2` ↔ 기존 주 CTA `56`·컬럼 100% = `P-15`)는 **열린 상태로 유지**(`N4-31`) | **CONFIRMED** | §0.5(`AD-S4-5` 신규) · §2.1-A · **AC-4-118 신규** · AC-4-95·99 수정 · §14.2(`N4-31` 신규) |
| **D4-20** ⭐ 2026-10-13 | **PRD FR-10 세션 시작 인사 = 버블 제목 줄.** `139:2803` 의 제목 줄(현재 `Try this prompt !`)이 **서버가 주는 인사 문구**의 자리이고, 그 아래 **pill 5개는 Prompt** 다. **Figma 기하는 그대로**(329 폭 · pill 5개 · pill 간격 6 · 선언 329×269). → **`N4-32` 해소** — plan-agent 권고안이 **채택**됐다. ⚠️ **전제 정정**: `bubble` 필드는 **기존 필드가 아니다** — **[직독]** `grep -rn 'bubble' packages/contracts/src/` → **0건**. `docs/API_CONTRACTS.md` **`:225`** 의 **코드 스케치에만 있는 계획된 필드**이고 `sessions/` 디렉토리 자체가 없다(§7.1). 즉 *"있던 것이 사라진다"* 가 아니라 **"FR-10(P0)을 담을 자리를 아직 정하지 않았다"** 였다 | **CONFIRMED** | §0.7 (**10·14 재해석**) · §2.1 FR-10 · §7.5-**18** · **AC-4-120~122 신규**(§11.12-C) · §14.1 (`N4-32` 해소) |

| **D4-21** ⭐ 2026-10-13 | **세션 시작 인사를 1줄 제약에 맞춘다.** 인사 문구는 **≤ 240px @ SF Pro Semibold 16 (약 28자)** 여야 하고 **320px 뷰포트에서도 1줄**로 들어가야 한다. **Figma 를 바꾸지 않는다** — 제목 노드(`88:840`, 297×22)가 **1줄 선언**이므로 제목 줄은 **1줄 clamp(말줄임)** 다. clamp 는 **표시 처리**이고 문구 생성이 아니므로 `rules/architecture.md` §8 위반이 아니다. ⚠️ **PRD §7.5 `:410` 의 예시 인사가 수정 대상**이 된다 (design-agent 측정: `Ready for today's story with Emma?` **271.32px** → 320 뷰포트 가용 240 초과 **2줄**). ⚠️ **아이 이름 9자 이상이면 393 에서도 깨진다**(`Sebastian?` **299.50** · `Alexandria?` **304.58** > 297). **Backend 요구사항**: 인사 길이 상한 + **아이 이름을 문장 끝에 두지 않는다**(잘릴 때 이름이 먼저 사라진다) — `P4-BIP-11` 에 연결 | **CONFIRMED** | **§0.9 신설** · §0.7 (**PRD 수정 대상 15 신규**) · **AC-4-120 수정**(clamp 조항) · §10(`P4-BIP-11` 보강) |
| **D4-22** ⭐ 2026-10-13 | **인사 문구가 없으면(null/빈값) 제목 줄을 렌더하지 않는다.** placeholder·빈 줄 **0건** · **Frontend fallback 문구 0건**(fallback 은 **Backend 책임**). 버블은 **렌더되고 기하는 유지**되며 **높이만 줄어든다** — design-agent 계산으로 **28px 짧아진다**(제목 22 + 그 뒤 flex gap 6 이 함께 사라져 **`h = 21 + 6n + Σpill`**). ⛔ **`Try this prompt !` 는 Figma placeholder 이며 제품 코드에 넣지 않는다** | **CONFIRMED** | **§0.9 신설** · **AC-4-121 수정**(28px·높이 식) · AC-4-120 ③ (리터럴 0건 재확인) |

### 0.2 초판 대비 근거 등급 상향 (Figma 감사 반영)

초판은 `28:51`·`29:62` 를 **`get_metadata` 판독**으로만 다뤘다. 2026-10-11 감사가 `get_design_context`·SVG 원문으로 **선언값**을 확정했으므로 아래 사실은 더 이상 `[추론]` 이 아니다.

| 사실 | 감사 근거 |
|---|---|
| `140:2870` 라벨 = **`Resume`** | `[실측·ctx]` 감사 §2.6 — `get_design_context` 가 돌려준 `<p>` 본문 |
| `163:1618` = **`Discard`** · `163:1620` = **`Submit`** | `[실측·ctx]` 감사 §1.2 · §6 질문 6 |
| **`Done Reading` 은 Figma 에 없다** | **3중 확인** — ① section `31:204` 682 노드 덤프 ② page `8:2` 캔버스 전수 ③ 텍스트 노드 11개의 **override 된 실제 문자열**까지 조회. 감사 §6 질문 3 |
| `88:929` 실제 문자열 = **`Storytime success! Emma did wonderfully.`** / **`14 min together · sticker earned`** | `[실측·ctx]` 감사 §3.5. ⚠️ **`get_metadata` 는 레이어 이름(컴포넌트 기본값 `Ready for today's story with Emma?`)을 돌려준다** — 레이어 이름을 문자열 근거로 쓰면 틀린다 |
| `88:929` 버블 그림자 = **drop 1겹** (`0 6px 4px @8%`) — 첨부 Style 은 `HARU/Shadow Rest`(3겹) | `[실측·ctx]` 감사 §8.1. 저장소 `--shadow-bubble` 과 같은 모양 → **신규 토큰 불필요** |
| `140:2870` = **drop 2겹** — 첨부 Style 은 `HARU/Glass Rest`(3겹), `0 28 56` **미렌더** | `[실측·ctx]` 감사 §8.1. 기존 `AD-3` 허용 차이로 **이미 등록**된 패턴 |
| `29:62` 한 프레임에 Stage 5 회고 카드(`91:691`, y=521)가 포함 → **Stage 4 경계 = y 0~468**, 그 사이 **53px 빈 간격** | `[계산]` 감사 §3.6 · §11 `S4F-14` → **AC-4-104 신규** |
| Chracter section 자식 **6개 전부 정지 raster** — 프레임 시퀀스·스프라이트·Lottie/Rive **0건** | `[실측·meta]` 감사 §1.4 → `D4-3`(CSS 모션)의 사실 근거 |

### 0.3 선행 정정 필요 (이 Plan 이 고치지 않는다 — 소관 표시만)

| # | 사실 | 근거 | 소관 |
|---|---|---|---|
| **P4-FIX-1** | `docs/qa/stage-3-qa-report.md` **6행**의 경고문이 스테일이다 — *"현재 유효한 Stage Verdict 는 §13 (4회차) 이다"* 로 적혀 있으나, 같은 파일 §14 가 **5회차(`fe349cb`)** 로 Verdict 를 갱신했고 그것이 유효 판정이다 | **[직독]** `stage-3-qa-report.md:6` vs `:1600`·`:1604` | **stage-qa-agent** (QA 문서 소유 — `rules/workflow.md` §6). plan-agent 는 고치지 않는다 |
| **P4-FIX-2** | `.claude/rules/architecture.md` §7 의 Recording 구성요소 목록에 **`SessionOutbox` 가 없다.** **grep 실측(2026-10-12)**: `.claude/rules/**` **0건** / `docs/ARCHITECTURE.md` **4건**(`:228`·`:380`·`:441`·`:590`) / `PLANNING.md` **2건**(`:240`·`:353`). 즉 **rules 파일에만 빠져 있다** (전이 이벤트 영속·재전송, Idempotency-Key) | **[직독]** 위 grep + `rules/architecture.md` §7 블록 7행 ↔ `ARCHITECTURE.md:441` ↔ `PLANNING.md:240` | **사용자 / Orchestrator** — rules 파일은 plan-agent 쓰기 경로가 아니다. 이 Plan 은 **`SessionOutbox` 를 포함한 ARCHITECTURE §10.4 구성을 기준**으로 삼는다(승인된 문서 우선 — `rules/architecture.md` 머리말). **기록 유지** |
| **P4-FIX-3** | `docs/API_CONTRACTS.md` §2.2 enum 표의 "26종" 표기와 `common/error-codes.ts` 주석의 "29종"이 실제 구현 수와 어긋날 수 있다 — Stage 3 보고 ④ 가 "31종 → 32종" 으로 정정을 예고했고 `AC-3-56` 이 *"29 → 32종"* 으로 다시 정정했다 | **[직독]** `stage-3-plan.md:628`·`:953`, `error-codes.ts` 머리 주석 | **plan-agent (Stage 4 승인 후)** — §7.5 갱신 목록에 포함. **기록 유지** |

### 0.4 ⚠️ Stage 0 #7 결정 변경 — Capacitor 도입 시점

> `D4-1` 은 **승인된 Stage 0 결정 #7 의 변경**이다. `rules/workflow.md` §2 가 *"Architecture / Stack 변경은 구현 전에 이유와 대안을 보고하고 승인을 받는다"* 라고 적으므로, 변경 사실·사유·영향을 여기 명시하고 **문서 갱신은 Plan 승인 후**에 한다 (§18).

| 항목 | 내용 |
|---|---|
| **기존 결정** | Stage 0 **#7** (2026-09-14, CONFIRMED) — *"Capacitor 도입, **Stage 4에서 추가** — Stage 1–3 웹 전용, Stage 4에 셸·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter, 실기기 QA Stage 4부터"* — **[직독]** `PLANNING.md:460` |
| **변경 후** | Capacitor 도입 자체는 유지. **시점을 Stage 4 → 분리된 후속 단계로 이연**한다. Stage 4 는 **Web 녹음까지**이며 `RecorderAdapter` **interface + Web 구현**만 만든다 |
| **사유 (사용자에게 제시된 근거)** | ① **후보 플러그인 둘 다 청크 녹음을 문서화하지 않는다** — Capawesome Audio Recorder(AAC, Insiders 전용 유료) · Cap-go `@capgo/capacitor-audio-recorder`(MPL-2.0, pause/resume 시 파일 분리 없음). 둘 다 **청크/세그먼트 녹음 미문서화** (2026-10-11 직접 조회, §3.0) ② `ARCHITECTURE §10.5` 의 **part 기반 업로드·크래시 복구가 청크를 전제**한다 — 청크 없이는 `partNo`·`sha256` per part 모델이 성립하지 않는다 ③ **자체 플러그인 구현**(Android Kotlin foreground service · iOS Swift `AVAudioSession`)은 **Frontend 범위를 벗어난다** |
| **영향받는 문서 지점** | `PLANNING.md:29`(Stage 4 행) · `:49`(구현 범위 표) · `:66`(8-Stage 대조) · `:106`(FR-25) · `:132`(NFR 안정성) · `:240`(Stage 4 [FE]) · `:351`(기술 결정 1) · **`:369`(`R-02`)** · `:460`(**#7 본문**) · `:465`(#12 portrait lock) + `.claude/rules/architecture.md:19`·`:34`(`apps/mobile` 행) + 각 Stage FR-01·FR-08 행 → **갱신 지점 목록 = §18** |
| **`R-02` 재평가** | `R-02`(*"Stage 2–3 의 Web `AuthGateway`·Push 권한 UX 를 Stage 4 에서 네이티브 Adapter 로 확장할 때 재작업 가능"* — `PLANNING.md:369`) 의 **위험 자체는 사라지지 않고 후속 단계로 이연**된다. 완화책(interface 뒤 구현 → Adapter 추가만)은 Stage 4 에서도 **그대로 지킨다** — 그래서 `RecorderAdapter` interface 를 Web 구현과 함께 Stage 4 에 남긴다 |
| **변경하지 않는 것** | Stage 0 **#12**(세로 고정·앱 컬럼 480) 중 **웹 쪽 규칙은 그대로** 적용한다 (Stage 4 In Scope). `portrait lock` **만** 후속 단계로 간다 |

### 0.5 허용 차이 — ⭐ **등록 완료 (2026-10-13, user)** 4건 + 승인 대기 4건

> *"어긋난 지점은 허용 차이로 등록하되, 등록은 사용자 승인 이후다. Agent 가 스스로 허용 차이로 처리하지 않는다."* (CLAUDE.md 최우선 규칙 6)
> ⭐ **2026-10-13 사용자 승인으로 `AD-S4-1`·`AD-S4-4`·`AD-S4-5`·`AD-S4-6` 4건이 등재되었다.** 대장(정본) = **`docs/decisions/stage-4-approvals.md` §4**.
>
> **⭐ 2026-10-13 승인 후 집계 — 등록 4건 · 무효 2건 · 승인 대기 4건**
>
> | ID | 상태 |
> |---|---|
> | **`AD-S4-1`** 스티커 부제 `You read together today` | ✅ **`APPROVED (2026-10-13, user)`** (`D4-10`) |
> | ~~`AD-S4-2`~~ `Discard` 제거 | ⛔ **무효** (`D4-12`) |
> | ~~`AD-S4-3`~~ ready 버블 교체 | ⛔ **무효** (`D4-14` — Figma 그대로 구현하므로 어긋남이 없다) |
> | **`AD-S4-4`** **`Discard` 확인 다이얼로그** (Figma 에 없다 · Design Guide Dialog 0개) | ✅ **`APPROVED (2026-10-13, user)`** (`D4-17`) |
> | **`AD-S4-5`** **하단 바 x=67 → 가운데 정렬(57), 10px** | ✅ **`APPROVED (2026-10-13, user)`** (`D4-19`) |
> | **`AD-S4-6`** **`Discard` 비활성 시각 = `opacity .5` 확대 적용** | ✅ **`APPROVED (2026-10-13, user)`** (`D4-18`) — "등록 필요 여부" 질문이 **승인으로 종결**됐다 |
> | **`AD-S4-7`**~**`AD-S4-10`** ⭐ **4건** (design-agent 제안 — Drawer 폭 353→컬럼 100% · 메달리온 링 150↔152 · ready 버블 x +2 · 320px 버튼 폭 135→131.5) | ⚠️ **승인 대기** — **이번 승인에 포함되지 않았다.** approvals §4 에 등재해 추적한다. 상세 = `docs/design/stage-4-design-spec.md` §12.4 |

| 후보 ID | 어긋난 지점 | Figma | Stage 4 구현 | 근거 결정 | 등록 전 필요한 것 |
|---|---|---|---|---|---|
| **`AD-S4-1`**(가칭) | 출석 스티커 **부제 문구** | `29:85` = `Day 12 · keep the streak going` `[실측·ctx]` | **채택하지 않음.** 대체 문구 = **`You read together today`** (`D4-10` 로 확정, 렌더 136.34px / 선언 171px) | **`D4-2`** + **`D4-10`** (`D-6`·`AD-S3-9`·PRD §7.4 "streak 표시하지 않는다" 유지) | 문구는 확정됐다 → **등록 승인만** 남았다 |
| ~~**`AD-S4-2`**~~ | ⛔ **무효 (2026-10-13)** — ~~`Discard` 버튼 제거~~ | `163:1618` = **`285:1445` "After_record" 의 자식**이 되었고 배경은 **`--grays/gray-2` `#aeaeb2`** 다 (이전 감사의 "teal `140:2870` 과 동일 스타일" 은 **스테일**) `[M, plan-agent 2026-10-13]` + `[인용]` | **구현한다** | **`D4-12`** (`D4-7` 무효) | 등록 대상 아님. ⚠️ **대신 신규 후보 `AD-S4-4` 가 생긴다**(아래) |
| **`AD-S4-4`**(가칭) ⭐ **범위 축소 (2026-10-13)** | **`Discard` 확인 다이얼로그** — ~~비활성 시각~~ 은 **`D4-18` 로 분리**되어 `AD-S4-6` 가 됐다 | 확인 다이얼로그 frame **없음** + **Design Guide 에 Dialog 컴포넌트 0개** `[M, 2026-10-13 + 감사 §1.3]` | ⭐ **둔다** — design-agent 명세, Stage 1 `Dialog` 재사용(#22 선례) | **`D4-17`** + CLAUDE.md 최우선 규칙 2 의 **예외**(사용자 승인으로 성립) | **등록 승인만** — 둘 것인가는 `D4-17` 로 확정됐다 (`N4-26` 해소) |
| ~~**`AD-S4-3`**~~ | ⛔ **무효 (2026-10-13)** — ~~ready 버블의 Prompt pill 5개 제거 + `88:757` 교체~~ | `28:51` 에 `139:2803`(`Type3`, `Try this prompt !` + pill 5) **고정 배치** `[실측·ctx]` | ⭐ **Figma 그대로 구현한다** — 어긋나는 지점이 없다 | **`D4-14`** (`D4-6` 철회) | **등록 대상 아님.** 대신 **PRD 수정 대상 7건**이 생긴다 → §0.7 |
| **`AD-S4-5`**(가칭) ⭐ 신규 | 하단 버튼 바 **x 좌표** | `285:1445` **x=67**(가운데면 57) `[M, 2026-10-13]` | **열 가운데 정렬(57)** — 버튼 폭 135 · gap 9 · 바 폭 279 유지 | **`D4-19`** | 등록 승인만 — 근거는 확정됐다(320px 잘림) |
| **`AD-S4-6`** ✅ **등록** | `Discard` **비활성 시각** | `Accent/Secondary` 에 **Disabled 짝 없음**. 형제 `17:18` `Accent/Disabled` = *"면·라벨 그대로 + `opacity:.5`"* `[실측·ctx — design-agent]` | **같은 전역 `opacity .5` 를 확대 적용** | **`D4-18`** | ✅ **`APPROVED (2026-10-13, user)`** — 등록 필요 여부 질문이 승인으로 종결 |

### 0.6 다른 문서의 "Stage 4 차단" 표기 해소 기록 대상

| 지점 | 현재 표기 | 해소 근거 | 소관 |
|---|---|---|---|
| **`docs/DESIGN_SYSTEM.md:151`** | *"애니메이션 에셋 없음 … 포맷(Lottie/Rive/스프라이트/비디오) 결정 + 라이브러리 도입 시 승인 필요. **Stage 4 차단**."* **[직독]** | **`D4-3`** — CSS 모션으로 시작, 라이브러리 도입 없음. 차단 해소 | **design-agent** (DESIGN_SYSTEM 소유). plan-agent 쓰기 경로 아님 |
| **`PLANNING.md:383` `R-16`** | *"캐릭터 경청·인사·완료 애니메이션 에셋 부재 … Stage 3 종료 전 포맷 결정"* **[직독]** | **`D4-3`** → `Resolved` | **plan-agent (Plan 승인 후)** — §18 |
| **`PLANNING.md:331` / `docs/FIGMA_SCREEN_MAP.md:219` `M-26`** | *"RecordingController 상태별 UI 정의 불가 → **Stage 4 차단**"* **[직독]** | **`D4-5`**(라벨 확정) + **`D4-8`**(디자이너 Figma 요청으로 처리 경로 확정) → **차단 해소, 산출물 대기**로 등급 변경 | `PLANNING.md` = plan-agent / `FIGMA_SCREEN_MAP.md` = design-agent |


### 0.7 ⭐ PRD 수정 대상 — `D4-14`·**`D4-21`** 귀결 (**이 Plan 은 PRD 를 고치지 않는다**) — **8건**

> `CLAUDE.md` Source of Truth: **PRD ↔ Figma 충돌 시 Figma 우선, 단 지점별 사용자 승인.** `D4-14` 로 Figma 가 채택됐으므로 **어긋나게 된 PRD 지점을 수정 대상으로 기록**한다. 적용은 **사용자 별도 지시 시 `D-24` 절차**(OneDrive 원본 + 저장소 사본 동시 수정, 백업 선행)로 한다.
> 번호는 `stage-3-approvals.md` §5·§6.2·§9.3 표의 **다음 번호 8** 부터 이어 붙였다. 줄 번호는 **[직독]** `docs/source/HARU_PRD_v1.5.md` (2026-10-13).

| # | PRD 지점 | 현재 PRD (요지) | 확정된 동작 |
|---|---|---|---|
| **8** | **§7.5 `:417`** | *"… **세션 중 자동 제시는 하지 않는다**(아이 몰입·대화 방해 금지)"* | **`ready` 상태 버블이 Prompt pill 5개를 자동 표시**한다 (`139:2803`) |
| **9** | **§7.5 `:425`** | *"캐릭터 버블은 세션 시작·세션 종료 **2가지 경우로 제한**한다"* | **횟수 2회는 유지**되지만 **시작 버블의 내용이 인사가 아니라 Prompt 목록**이다 → *"시작 버블 = 인사"* 전제가 깨진다 |
| **10** | **§7.5 `:410`** (상태 표 세션 준비 행) | *"메시지 버블로 양육자에게 인사 … 오늘 책 소개"* | ⭐ **`D4-20` 확정**: 버블 = **인사(제목 줄, 서버 값) + Prompt pill 5개** — **인사는 유지되고 Prompt 가 같은 버블에 함께 온다.** *"오늘 책 소개"* 는 Figma 버블에 **없다**(TopBar `78:353` 후보 — `N4-15`) |
| **11** | **§7.4 `:383`** | *"… (**세션 중 자동 제시는 없으므로**, 세션 전에 확인하는 것이 기본 흐름)"* | 괄호 절이 성립하지 않는다 |
| **12** | **§5.3 `:233`** (세션 4단계 표 ready 행) | *"캐릭터가 메시지 버블로 양육자에게 인사 … 오늘 책 소개"* | 버블 내용 교체 |
| **13** | **§5.4 `:254`** (시나리오 6) | *"캐릭터가 메시지 버블로 엄마에게 인사하고 리딩 세션을 유도한다"* | 버블 내용 교체 |
| **14** | **FR-10 `:562`** | *"캐릭터 메시지 버블 표시 — **세션 시작 인사**(양육자 대상)·종료 피드백"* | ⭐ **`D4-20` 확정: "인사 + Prompt"** — 시작 버블이 **인사를 제목 줄에 유지**하고 **Prompt pill 을 함께** 담는다. **FR-10 의 "시작 인사" 는 충족된다** → 수정은 *"Prompt 가 함께 온다"* 를 **추가**하는 것이지 인사를 **삭제**하는 것이 아니다 |

| **15** ⭐ 2026-10-13 신규 | **§7.5 `:410`** (상태 표 "세션 준비" 행의 **예시 인사 문구**) | *"… (예: **`Ready for today's story with Emma?`**)"* **[직독]** | ⛔ **1줄 제약을 넘는다** — design-agent 측정 **271.32px** @ SF Pro Semibold 16. 제목 노드는 **297×22(1줄)** 이고 **320px 뷰포트 가용 폭은 240** 이므로 320 에서 **2줄**이 된다. **`D4-21` 상한 = ≤ 240px(≈28자)**. 통과 예시로 교체 필요 (`Ready to read with Emma?` **199.94** 등). ⚠️ 함께 적을 요구: **아이 이름을 문장 끝에 두지 않는다** — clamp 로 잘릴 때 이름이 먼저 사라진다 | **`D4-21`** |

⭐ **`D4-20` 반영**: **10·14 는 "인사가 사라진다" 가 아니라 "인사와 Prompt 가 한 버블에 함께 온다"** 로 읽는다. **8·9·11·12·13 은 그대로 수정 대상**이다 — `ready` 에서 Prompt 가 **자동 표시**되는 사실은 변하지 않는다.
⭐ **`D4-21` 반영 (2026-10-13)**: 수정 대상이 **7건 → 8건**(8~15)이 되었다. **15 는 내용 충돌이 아니라 길이 제약**이며, PRD 가 적은 **예시 문구 자체**가 구현 가능한 1줄에 들어가지 않는 문제다. ⛔ **지금 PRD 를 고치지 않는다** — `D-24` 절차는 사용자 지시 시.

**수정하지 않는 지점 (`D4-15`)**: `:86`(§1.2 *"읽기 완료 체크"*) · `:161`(첫 세션 전환율) · `:163`(세션 완료율) — **지표·개념 용어**이므로 그대로 둔다. **추가 조치 없음.**
**충돌 아님 (참고)**: §7.5 `:421` · §7.9 `:489` 의 *"실시간 침묵 감지 기반 자동 제시(조용한 코치 모드) MVP 이후"* 는 **녹음 중 동적 제시**를 말하므로 `D4-14`(ready 정적 표시)와 충돌하지 않는다.

**이미 적용 완료 (PRD v1.5 개정 2, 2026-10-13 — `D4-12` 반영)**: §5.2 · §5.3 · §7.4 · §7.5 · FR-09 · §12.2 · §13 의 *"읽기 완료(Done Reading) 단일 버튼"* → **Record ⇄ Pause + Discard / Submit**. 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-s4recording-20261013-0030.md`(67,543 bytes, 2026-10-13 01:29) · 수정 후 sha1 **`c1b66f3c4a007260fd76b0885b2918ad8e97e265`** — **[직독: `ls` + `shasum`, plan-agent 재검증]**.

### 0.8 ⭐ 신규 가값 `P-25` (`D4-16`) — ⭐ **대장 등재 완료 (2026-10-13, user)**

| # | 항목 | 가값 출처 | 상태 |
|---|---|---|---|
| **`P-25`** | **`Discard` 면 `#aeaeb2` + 흰 라벨 대비 2.211:1** — 토큰 = design Spec **`T-13`**(Primitive `--haru-gray-2: #aeaeb2` + Tier-2 `--color-action-neutral-bg` · `--color-action-neutral-fg`) | Figma 변수 `grays/gray-2` (`163:1618`, 선언 2경로 확인) | ⭐ **대장 등재 (2026-10-13, user)** · 값은 **디자이너 대기** |

- **번호 근거**: `P-01`~`P-24` 전부 소비(정본 = `stage-3-library-design-spec.md` §5.4) · 저장소 전수 grep 에서 `P-25` **0건**(`P3-BIP-25` 는 다른 namespace) · 토큰 소스·dev gallery 최대값 `P-24`. **번호 재배정 금지.**
- **1개만 부여한 이유**: `#aeaeb2` 값과 그 위 흰 라벨 대비는 **대상이 같고 해제 조건도 같다**(디자이너가 `Discard` 색을 확정하면 함께 풀린다). `P-23` 선례(*"대상·교체 조건이 다르면 분리"*)의 반대 경우다.
- 운영은 `stage-0-approvals.md` §4 그대로 — 토큰 정의에 `/* provisional: P-25 */` · dev gallery 등재 · QA 리포트 목록 기록 · **가값은 FAIL 사유 아님**.
- ⚠️ **재제시 대상이 7건으로 늘었다**: `P-01`·`P-02`·`P-04`·`P-16`·`P-23`·`P-24`(Stage 3 잔여, 미처리) **+ `P-25`**.

### 0.9 ⭐ `D4-21`·`D4-22` — 세션 시작 인사의 길이와 부재 (2026-10-13 승인분)

> 두 결정은 `D4-20`(인사의 **자리** = 버블 제목 줄)의 **후속**이다. `D4-20` 이 자리를 정했고, 이 둘이 **길이 제약**과 **부재 시 거동**을 정한다.

**`D4-21` — 길이 제약 (1줄)**

| 항목 | 확정 내용 |
|---|---|
| 상한 | **≤ 240px** @ SF Pro **Semibold 16** (≈ **28자**) |
| 근거 폭 | 제목 노드 `88:840` = **297×22** (1줄 선언) · 320px 뷰포트 가용 폭 = **240** |
| Figma | **바꾸지 않는다** (최우선 규칙 1) |
| 표시 처리 | **1줄 clamp(말줄임)** — 넘치면 자른다. 문구를 **생성·가공하지 않으므로** `rules/architecture.md` §8 위반이 아니다 |
| 2줄이 되면 | 버블 본체 269 → **291** → **Record Control(y621)을 7.6px 침범** `[design-agent 계산]` |
| 통과 예시 `[design-agent 측정]` | `Ready to read with Emma?` **199.94** · `Ready to read with Sebastian?` **228.12** · `Shall we read with Emma?` **196.08** |
| 초과 예시 `[design-agent 측정]` | `Ready for today's story with Emma?` **271.32**(320 에서 2줄) · `Tap record and I'll quietly keep your storytime.` **350.04** · 둘 합 **625.31**(297 폭에서 3줄) |
| 이름 길이 위험 | **9자 이상이면 393 에서도 깨진다** — `Sebastian?` **299.50** · `Alexandria?` **304.58** > **297** |
| Backend 요구사항 (Handoff) | ① 인사 문구 **길이 상한** 을 생성 측에서 지킨다 ② **아이 이름을 문장 끝에 두지 않는다** — clamp 로 잘릴 때 **이름이 먼저 사라진다** → `P4-BIP-11`(검수 템플릿·안전 슬롯 생성) 에 연결. Stage 8 Handoff 대상 |
| PRD | **§7.5 `:410`** 의 예시 인사가 **수정 대상 15** 가 된다 (§0.7). ⛔ **지금 PRD 를 고치지 않는다** — `D-24` 절차는 사용자 지시 시 |

**`D4-22` — 인사 부재 시 거동**

| 항목 | 확정 내용 |
|---|---|
| `bubble` null / 빈 문자열 | **제목 줄을 렌더하지 않는다** |
| placeholder·빈 줄 | **0건** |
| Frontend fallback 문구 | **0건** — fallback 은 **Backend 책임** (`rules/backend.md` §4) |
| 버블 자체 | **렌더된다.** 기하 유지 (pill 간격 6 · 세로 padding 위 14 / 아래 13) |
| 높이 변화 | **28px 짧아진다** `[design-agent 계산]` — 제목 **22** + 그 뒤 **flex gap 6** 이 함께 사라진다 → **`h = 21 + 6n + Σpill`** |
| `Try this prompt !` | ⛔ **Figma placeholder 이며 제품 코드에 넣지 않는다** (리터럴 0건 — AC-4-120 ③) |

---

## 1. Goal

**Storytime 1회를 녹음 유실 없이 끝까지 통과시키고, 업로드 대기·재시도·확정·실패(48h)·크래시 복구를 Mock 위에서 재현 가능하게 만든다 — Web 에서.**
네이티브 셸은 **이 Stage 의 목표가 아니다**(`D4-1`). 그래서 Stage 4 는 **`RecorderAdapter` interface 를 Web 구현과 함께 세워 두는 것**까지만 한다 — 후속 단계가 `NativeRecorderAdapter` 를 **추가만** 하면 되도록.

종료 시점에 성립해야 하는 상태:

1. Home Activity Card / 서재 시트의 **"Start Session" 이 실제로 동작**한다 (Stage 3 `D-3` 로 비활성이던 CTA가 Stage 4 에서 처음 연결된다 — **[직독]** `stage-3-approvals.md` §13.10).
2. `ready → recording ⇄ paused → completed` 가 화면·`RecordingController`·contracts 전이표에서 **같은 규칙으로** 움직인다. 하단은 **`285:1445` SessionActionBar(`Discard` + `Submit`, 135×45 ×2 · gap 9 · **열 가운데 정렬** — `D4-19`)** 이며 **ready 비활성(`opacity .5` — `D4-18`) / 녹음 시작 후 활성**이다. **`Submit` → Toast + 완료 화면** · **`Discard` → 확인 다이얼로그(`D4-17`) → `→ abandoned` 전이(`D4-13`) → 로컬 삭제 → 홈** (§2.1-A. ~~`paused` → `Resume`~~ 매핑은 `N4-27` 로 보류).
3. 동의가 없으면 녹음 시작이 **UI 단계에서 차단**된다 (FR-02 Stage 4 부분).
4. 마이크 권한 거부 → **"대화만 하기"** 경로로 세션이 진행된다 (PRD §13).
5. 오프라인에서 녹음이 되고, 복구 시 **Mock 업로드가 재개**된다. **확정 응답 전에 로컬 파일을 지우지 않는다.**
6. 30분(실제 녹음 시간) 도달 → `completed(auto_timeout)` + 녹음 보존. 10분 방치 → `abandoned`.
7. 브라우저 탭 강제 종료·새로고침 후 재진입에서 **미완료 로컬 녹음이 복구**된다 (`completed(recovered_after_crash)`).
8. 완료 화면에 **종료 버블 + 출석 스티커**가 서버(Mock) 응답 값으로만 표시된다. 스티커 부제에 **streak 언어를 쓰지 않는다** (`D4-2`).
9. ⭐ **ready 버블은 Figma `139:2803` 그대로** — `Try this prompt !` + **Prompt pill 5개**를 서버 `prompts` 값으로 보여준다 (`D4-14`, ~~`D4-6`~~ 철회). Prompt Drawer 는 **녹음 중 재확인** 경로다. ⚠️ 인사 문구(`SessionSummary.bubble`)의 노출 지점은 **`N4-32`** 결정 대상이고, 이 변경은 **PRD 수정 대상 7건**(§0.7)을 만든다.
10. **Web 의 백그라운드·탭 비활성·화면 잠금 녹음 한계가 측정되어 기록**되고, 사용자에게 **보장 불가가 안내**된다 (`D4-4` · `rules/architecture.md` §7).
11. **Stage 3 이월 3건**(`QA-3-001`·`002`·`003`)과 **`AC-3-22`~`26`** 이 처리되거나, 처리 불가 사유가 결정으로 확정된다.

---

## 2. In Scope — 요구사항 ID별 (Frontend 부분)

> 각 행의 "Frontend 부분" 만 Stage 4 에서 만든다. "Backend 요구" 열은 **Contract·Mock·Handoff 로만** 다룬다 (`rules/backend.md` §1).
> 근거 열의 `PLANNING §4.1` 은 **[직독]** 한 요구사항 표의 해당 행이다.

### 2.1-A ⭐ 녹음 플로우 상태 전환표 — **`D4-12` (CONFIRMED, 2026-10-13)** + `D4-13`·`D4-17`·`D4-18`·`D4-19`

> ⭐ **2026-10-13 개정 2 로 확정된 4가지** (아래 표의 미확정 표기를 대체한다)
>
> | 항목 | 확정 내용 | 근거 |
> |---|---|---|
> | **`Discard` 의 전이 표현** | **`recording → abandoned` · `paused → abandoned`** (actor `caregiver`, modes `['recorded']`) — **전이 2행 추가, enum 신규 0** | **`D4-13`** (안 A) |
> | **`Discard` 조작 순서** | **확인 다이얼로그 → 폐기 확정 → 서버 전이 확정 응답 → 로컬 삭제 → 홈 `/`** (전이 실패 시 **로컬 보존**) | **`D4-17`** + §7.3-A ④ |
> | **`ready` 비활성 시각** | **면·라벨 그대로 + 전역 `opacity: 0.5`** (`Submit` 의 `17:18` `Accent/Disabled` 와 동일) + **`aria-disabled` + 사유 안내** | **`D4-18`** |
> | **하단 바 배치** | 버튼 **135 고정** · gap **9** · 바 **279** · **열 가운데 정렬**(Figma x=67 → 57, 10px = `AD-S4-5`) | **`D4-19`** |


> 이 표가 Stage 4 세션 컨트롤의 **단일 기준**이다. §1 Goal 2번, §2.1 FR-09·FR-21, §8 Mock, §11 AC-4-111~114, `docs/FIGMA_SCREEN_MAP.md` §1.4 가 모두 이 표를 참조한다.
> **[직독]** `get_metadata(285:1126)` · `get_metadata(285:1445)` · `get_screenshot(285:1126)` (plan-agent, 2026-10-13). **[인용]** = 사용자 실측 보고를 옮긴 것으로, 이 세션에 `get_design_context` 가 없어 선언값을 재확인하지 못했다.

| 세션 상태 | Record Control (`163:1590` 2변형) | `285:1445` `Discard` (`163:1618`) | `285:1445` `Submit` (`163:1620`) | 사용자 조작 → 결과 |
|---|---|---|---|---|
| **`ready`** | **`Property 1=Record`** — mic + 라벨 **`Tap to recording`** (`163:1591`) | **비활성** — 면·라벨 그대로 + **`opacity .5`** (`D4-18`) + `aria-disabled` | **비활성** — 동일 | Record 탭 → **`recording`** (contracts `ready → recording`, actor `caregiver`, mode `recorded` — **기존 전이**) |
| **`recording`** | **`Property 1=Pause`** — pause 아이콘, 라벨 없음 (`163:1601`) | **활성** | **활성** | Pause 탭 → **`paused`**(기존 전이) · **`Submit`** → **`completed(user_done)`**(기존 전이) + **Toast `Recording submitted`**(⚠️ **Orchestrator 채택, 변경 가능**) + **`29:62` 1c Complete & Feedback 이동** · **`Discard`** → ⭐ **확인 다이얼로그**(`D4-17`) → **`recording → abandoned`**(actor `caregiver`, modes `['recorded']` — **`D4-13` 신규 전이**) → **서버 확정 응답 후** 로컬 녹음 삭제 → 홈 `/` 이동 |
| **`paused`** | ⚠️ **Figma 미확정** — `163:1590` 변형이 `Record`·`Pause` **2개뿐**이고 `140:2870` `Resume` 는 **`28:51` 에서 제거**됐다. Record Control 토글로 재개하는 것으로 **읽히나 단정하지 않는다** (`N4-27`) | 활성 | 활성 | 재개 → `recording`(기존 전이) — **경로 확정 = design-agent 실측 대기**(`C13-14`) · `Submit` 은 `recording` 과 동일 · `Discard` → **`paused → abandoned`**(**`D4-13` 신규 전이**), 나머지 절차 동일 |

**이 표가 바꾸는 선행 결정 2건**

| 선행 | 상태 |
|---|---|
| **`D4-5`** (`recording`→`Submit` · `paused`→**`Resume`**) | **`Submit` 부분은 유지**, **`Resume` 매핑은 재검토 대상**이다 — 근거였던 `140:2870` 이 **프레임에서 제거**됐다 `[M, 2026-10-13]`. 하단 슬롯은 이제 **상태와 무관하게 `Discard`/`Submit` 2개**이고, 재개는 Record Control 쪽에서 일어나는 것으로 읽힌다. **단정하지 않고 design-agent 실측 결과와 맞춘다** (§14.2 `N4-27`) |
| **`N4-23`** (ready 하단 버튼) | ✅ **해소** — ⓐ(버튼 없음)·ⓑ(Prompt Drawer 트리거)·ⓒ 어느 것도 아니고 **`Discard`/`Submit` 이 비활성 상태로 존재**한다. ⚠️ **귀결**: PRD §7.5 의 **"Prompt 모아보기" 보조 버튼이 들어갈 하단 슬롯이 없어졌다** → 진입점 미해결(`C13-4`), §14.2 `N4-28` |

### 2.1 Functional Requirements

| ID | Frontend 부분 (Stage 4) | Backend 요구 (Contract/Handoff) | 근거 |
|---|---|---|---|
| **FR-09** (세션 화면·녹음 시작/완료·Pause/Resume·30분 자동 종료, P0) | `/session/:sessionId` ready·recording·paused 화면, `RecordingController` 상태 머신, Record Control(`Record`↔`Pause` 2변형) + **`285:1445` SessionActionBar(`Discard`·`Submit`) — ready 비활성 / 녹음 시작 후 활성** (`D4-12`, §2.1-A. `Done Reading` 신규 라벨 **없음**), **`Submit` → Toast(`Recording submitted`) + `29:62` 이동** · **`Discard` → 확인 다이얼로그(`D4-17`) → `→ abandoned` 전이(`D4-13`) → 로컬 삭제 → 홈 `/` 이동**, **30분 클라이언트 타이머(실제 녹음 시간 기준, `paused` 제외)**, 전이 호출(`POST …/transitions`), 10분 방치 타이머 + 리마인드 버블 1회 | 서버 전이 판정·저장, 30분 서버 검증, `abandoned` sweeper, **폐기 세션의 서버 측 정리·업로드 중단** | PRD FR-09 · §7.5 · §13 (**2026-10-13 개정**) / `PLANNING §4.1` FR-09 / `#17-②` `MAX_RECORDED_SECONDS=1800` / **`D4-12`** (~~`D4-5`~~ 부분 대체) |
| **FR-10** (캐릭터 버블 — 시작·종료, 검수 템플릿, TTS 없음, P0) | ⭐ **`D4-14` 로 재작성.** 버블 **2회 제한은 유지**(ready · 완료), 녹음 중 개입 없음. **ready 버블 = Figma `139:2803` 그대로** — `Try this prompt !` 제목 줄 + **Prompt pill 5개**(**선언 329×269** @ (34,336) · pill 간격 6 · padding 위 14 / 아래 13). pill 본문은 **`SessionSummary.prompts` 서버 값**이며 Frontend 가 만들지 않는다. 완료 버블 = `88:929` + 응답 `completionBubble`. ⭐ **인사 문구의 자리 = 버블 제목 줄** (`D4-20`) — `SessionSummary.bubble` 서버 값을 제목 줄에 표시하고 pill 은 `prompts` 다. **문구 없음(null)이면 제목 줄을 렌더하지 않고 pill 만 표시**한다(AC-4-121). ⚠️ `bubble` 은 **계획된 신규 필드**이며 기존 필드가 아니다(§7.2). ⚠️ `S4F-01`(버블 높이 가변)·`S4F-02`(pill 2줄) **되살아남** | 검수 템플릿·안전 슬롯 생성 + **Prompt 를 ready 응답에 포함** | PRD FR-10 · §7.5 규칙(⚠️ **§0.7 수정 대상 8~14**) / `rules/frontend.md` §8 / **`D4-3`·`D4-14`**(~~`D4-6`~~ 철회) |
| **FR-11** (경청 인터랙션 + Prompt 모아보기, P0) | **CSS 기반 경청 모션**(라이브러리 0개 — `D4-3`) + `prefers-reduced-motion` 대체, **Prompt Drawer** (`88:960` 실측 기반: grabber 40×4 · 제목 · 부제 · Prompt pill 1개 + 좌우 화살표 · 코칭 노트 · Pagenation 3dots). ⭐ **`D4-14` 로 재정의**: Drawer 는 **Prompt 의 유일한 경로가 아니다** — ready 버블이 이미 Prompt 를 보여준다. Drawer 의 남은 역할 = **녹음 중 재확인**(PRD §7.5 "Prompt 모아보기"). 진입점은 **미해결**(`C13-4`·`N4-28`). **무음·무진동** | — (세션 계약 `prompts` 필드만) | PRD FR-11 · §7.5 "Prompt 확인 방식" / `88:960` **[실측·ctx 감사 §4]** / **`D4-3`·`D4-14`** |
| **FR-14** (업로드 → STT → 분석, P0) — **Stage 4 는 업로드 클라이언트만** | `LocalRecordingStore`(청크 영속·복구 메타) · `SessionOutbox` · `UploadQueue`(재시도·백오프·네트워크 복구 감지·48h 감지) · `recordingApi.init/refreshTokens/complete/status` 호출 · `UploadTransport` part 전송(Mock) | 실제 Storage 수신·part 검증·토큰 발급·STT·분석 파이프라인 — **전부 PENDING** | PRD FR-14 / `ARCHITECTURE §10.5` / `API_CONTRACTS §4 Stage 4` · §5.1.1 |
| **FR-19** (출석체크 스티커, P0) | `completed` 전이 응답의 `stickerAward` 표시(`AttendanceStickerChip` `29:79` — 257×64 pill, glass 74%, gold 그라디언트 타일 44×44), **재진입 시 중복 표시 없음**(같은 요청 replay = 같은 응답). **부제에 streak·`Day N` 언어를 쓰지 않는다** — 대체 문구는 design-agent 제안 + 사용자 승인 (`D4-2`) | 멱등 지급·저장 (`sticker_awards.session_id UNIQUE`) + **표시 문구 제공**(`P4-BIP-18`) | PRD FR-19 · §7.6 / `DATA_MODEL §8 sticker_awards` / **`D4-2`** |
| **FR-02** (보호자 동의, P0) — **Stage 4 부분** | **동의 없음 시 녹음 시작 UI 차단** (`ConsentGate`). 동의 기록 전 아동 데이터·오디오를 Contract 로 보내지 않는다 | 서버 측 동의 강제, `consent_event_id` 고정 | PRD FR-02 / `PLANNING §4.1` FR-02 "S4: 동의 없음 시 녹음 시작 UI 차단" |
| **FR-21** (세션별 녹음 삭제·전체 삭제, P0) — **Stage 4 부분 ⭐ 확대** | `LocalRecordingStore` **삭제 API**(세션 녹음 삭제·로그아웃 정리용) + `performSessionCleanup` 확장(현재는 auth 세션·온보딩 draft·Query 캐시 3종만 — **[직독]** `shared/lib/session-cleanup.ts`) ⭐ **+ `Discard` 경로의 사용자 주도 폐기**(`D4-12`): 진행 중 녹음의 **로컬 청크 삭제 + `UploadQueue`·`SessionOutbox` 항목 취소**. ⚠️ `rules/architecture.md` §7 은 *"로컬 녹음은 업로드 확정 응답 전까지 삭제하지 않는다"* 로 적는데, 그 규칙의 목적은 **유실 방지**이고 `Discard` 는 **사용자가 명시적으로 버리는 행위**다 → **예외가 아니라 다른 사건**으로 다룬다. ⭐ **확인 단계는 `D4-17` 로 "둔다" 확정**(design-agent 명세 + `AD-S4-4` 등록 대상). 전이는 **`→ abandoned` 2행**(`D4-13`)이고, **서버 확정 응답 후** 로컬을 지운다(실패 시 보존 — §7.3-A ④) | Storage 객체 삭제·cascade·audit·SLA + **폐기 세션의 서버 측 part 정리** | PRD FR-21 / `PLANNING §4.1` FR-21 / **`D4-12`** / `rules/architecture.md` §7 |
| **FR-23** (보유 책 직접 입력·자유 선택 세션, P0) — **Stage 4 부분** | 서재/직접 등록 책(`childBookId`)으로 **세션 시작** 경로. `CreateSession` 의 `bookId` / `childBookId` 분기 | DB 외 책의 범용 Prompt | PRD FR-23 / `PLANNING §4.1` FR-23 "S4: 해당 책으로 세션 시작" |
| **FR-25** (웹 반응형, P1) — **Stage 4 부분** | 세션·완료 화면의 **320/393/600/1024 레이아웃**(앱 컬럼 480 가운데 정렬, #12 의 웹 규칙). ~~Capacitor portrait lock~~ → **후속 단계** (`D4-1`, §3.0) | — | `PLANNING §4.1` FR-25 / #12 / **`D4-1`** |
| ~~**FR-01**~~ (가입·로그인) | ⛔ **Stage 4 In Scope 에서 제외** — Stage 4 부분이 **네이티브 Apple/Google Auth Adapter 뿐**이었고 그것이 `D4-1` 로 후속 단계로 갔다. 기존 `AuthGateway` interface·Web 구현은 **Stage 2 산출물로 변경 없음** — **[직독]** `apps/web/src/shared/auth/AuthGateway.ts` 존재 | — | **`D4-1`** → §3.0 `S4N-C` |
| **FR-08** (Context 선택 + invitational push, P0) — **Stage 4 부분 + 이월** | ~~① 네이티브 Push Adapter~~ → **후속 단계**(`D4-1`, §3.0 `S4N-D`). ① **이월 `QA-3-001`**: `PushPermissionPort`(`shared/platform/pushPermission.ts`) + **Web 구현**(`Notification.permission`/`requestPermission()` 까지만 — `D-16`) + 사전 안내 UX + `push-permission-denied` 시나리오 + `notification-preferences`/`push-devices` contracts + `PushPlatform` enum(**`ios`·`android`·`web` 3값 유지** — Contract 는 Backend 요구사항이므로 네이티브 분리와 무관) ② **이월 `AC-3-22`~`26`**: Reading Context 선택 UI(6값 + `custom_time`) — **Figma 진입점 없음, C-13 분배 미지정** (§14.2 `N4-05`) | push 발송·provider·템플릿·평균 시간대 학습 | `PLANNING §4.1` FR-08 / `stage-3-approvals.md` §27.6 / `stage-3-plan.md` §16 `D-16`·`D-18` / **`D4-1`** |

### 2.2 Non-Functional Requirements (PRD §11 / `PLANNING §4.2`)

| 항목 | Frontend 부분 (Stage 4) | 판정 전망 |
|---|---|---|
| 녹음 시작 지연 ≤ 1s | `RecorderAdapter.start()` 호출 → 첫 청크 수신까지 측정 — **Web 전용**(데스크톱 Chrome/Safari + **iOS Safari 실기기**, `D4-4`). ~~네이티브~~ → 후속 단계 | `PASS` 가능. Android 모바일 Web 은 **`NOT VERIFIED`**(기기 부재 — `N4-21`) |
| 캐릭터 버블·인터랙션 응답 ≤ 1s | 로컬 상태 전환·**CSS 모션** 개시 시간 (API 응답 시간 제외) | `PASS` 가능 |
| 백그라운드·화면 잠금·일시정지에도 녹음 유지 | ⚠️ **Stage 4 에서는 "Web 한계를 측정·기록·안내"가 요구사항이다**(`D4-4`) — ① 탭 비활성 ② 브라우저 백그라운드 ③ iOS Safari 화면 잠금 각각에서 청크 수신이 끊기는지 **실측**하고, 끊기면 **사용자에게 보장 불가를 안내**한다 (`rules/architecture.md` §7 "Web 은 보장 불가"). ~~`NativeRecorderAdapter` + iOS `UIBackgroundModes` / Android FGS~~ → 후속 단계 | **측정·안내 `PASS` 가능** (AC-4-108 · AC-4-70). 네이티브 보장은 Stage 4 **판정 대상 아님** |
| 크래시 시 로컬 임시 파일에서 녹음 복구 | `LocalRecordingStore` 복구 흐름 + `crash-recovered` 시나리오 — Web 기준 = **탭 강제 종료·새로고침·브라우저 종료 후 재진입** | `PASS` 가능(시나리오 주입 + 실브라우저 재진입) |
| 오프라인 녹음 + 복구 시 자동 업로드 | `UploadQueue` + `offline-queued` | `PASS` 가능(Mock) |
| 녹음 원본 암호화 저장 | **Frontend 범위 아님** — 로컬은 앱 샌드박스/OPFS | Handoff 요구사항만 |
| 원본 90일 자동 파기 | `RecordingUploadComplete.expiresAt` **표시**(보관 정책 안내) | 표시 `PASS` / 삭제 Job **PENDING** |
| 콘텐츠 안전 — 버블 = 검수 템플릿 | 응답 값만 표시(생성·가공 금지) grep 증거 | `PASS` 가능 |
| 접근성 WCAG AA · 터치 타깃 44×44 | Record Control·`Submit`/`Resume`·Drawer·Dialog 접근성 이름·포커스 + **`prefers-reduced-motion` 대체 정의 필수**(`D4-3`) | `PASS` 가능 (예외 `D-01`·가값 `P-xx` 규칙 적용) |

### 2.3 PRD §13 예외 처리 (Stage 4 해당 분)

| 상황 | Frontend UX | Mock 시나리오 |
|---|---|---|
| 마이크 권한 거부 | 이유 안내 → **설정 딥링크** → "대화만 하기"(녹음 없는 세션) | `mic-permission-denied` |
| 녹음 중 네트워크 끊김 | 로컬 저장 지속 → 복구 시 자동 업로드. **업로드 실패 48h 경과 시 재시도 안내** | `offline-queued` · `upload-retry` · `recording-upload-failure` · `upload-stalled-48h` |
| 세션 준비 후 미시작(방치) | 리마인드 버블 **1회만** → 10분 경과 시 `abandoned` (언제든 재시작) | `abandoned` |
| 세션 30분 초과 | 자동 종료 + 녹음 보존 → "읽기 완료" 처리 → (Stage 5 회고 카드로 전환) | `auto-timeout` |
| 크래시 후 재실행 | 미완료 로컬 녹음 발견 → 복구 안내 → `completed(recovered_after_crash)` → 업로드. **Web 기준** = 탭 강제 종료·새로고침·브라우저 종료 후 재진입 | `crash-recovered` |
| 녹음 중 인터럽션 — **Web 범위로 재정의**(`D4-1`·`D4-4`) | **Web 에서 재현 가능한 것만**: ① **탭 비활성**(`visibilitychange`) ② **오디오 입력 디바이스 변경**(`devicechange` — 블루투스 연결/해제) ③ **트랙 종료**(`MediaStreamTrack.onended` — OS 가 마이크를 빼앗을 때, iOS Safari 전화 수신 포함) → 일시정지·재개 안내 + **로컬 청크 보존**. ~~네이티브 전화·오디오 route 인터럽션 실기기 검증~~ → 후속 단계 | `recording-interrupted` |
| STT 실패·저품질 | **Stage 5** (§3) | — |

### 2.4 Stage 3 이월 (명시 수용 → Stage 4 In Scope)

**[직독]** `stage-3-approvals.md` §26.1 · §27.6 · §28.6-3 · §30.7 · §30.8, `PLANNING.md:29`.

| 이월 ID | Sev | 내용 | Stage 4 에서 어디까지 하는가 |
|---|---|---|---|
| **`QA-3-001`** | **High** | push 권한 기능군 **6요소 전부 0건**: `PushPermissionPort` · Web 구현 · 사전 안내 UX · `push-permission-denied` 시나리오 · `notification-preferences`/`push-devices` contracts · `PushPlatform` enum | **6요소 전부 In Scope** — ⚠️ 단 **`D4-1` 로 근거가 바뀐다.** 초판은 *"네이티브 Push Adapter(#7)가 Stage 4 과제라서 Port 와 함께 만든다"* 였으나 네이티브는 빠졌다. **새 근거**: `QA-3-001` 은 Stage 3 High 이월이고 **6요소 전부가 Web 범위**다 (`D-16` 이 이미 "Web 은 `Notification.permission` 까지만, provider SDK 금지" 로 결정). 네이티브 Push Adapter 추가는 후속 단계(`S4N-D`)이며 **`PushPermissionPort` interface 가 그 확장점**이다. ⚠️ **알림 설정 화면(`/settings/notifications`)은 여전히 Out of Scope** — `D-18` 로 디자이너 Figma 대기이며 이 Plan 이 되살리지 않는다 (§3) |
| **`QA-3-002`** | Medium | Activity Card 오프라인 캐시(`D-11`) 미구현 — `offline-cached-card` key 0건 | **In Scope.** Stage 4 가 오프라인 감지·오프라인 UX 를 처음 만들므로(NFR 오프라인) 같은 기반 위에서 처리한다. 범위 = 최근 카드 캐시 + Offline Banner 동시 표시 + **폐기·로그아웃 삭제** |
| **`QA-3-003`** | Medium | `D-4` 에셋 파이프라인 미구현 (AVIF/WebP 0개 · `<picture>`/`srcset` 0건 · `assets:optimize`·`sharp` 0건) | ⚠️ **경계를 분명히 한다.** Stage 4 는 **파이프라인 도구와 `<picture>`/`srcset` 적용 구조**까지 만든다. **표지 에셋 교체(`P3-BIP-19` — 상용 그림책 표지, 법무 확인 필요)는 Stage 8 게이트로 남는다.** 즉 *"파이프라인은 Stage 4, 들어갈 그림은 Stage 8"* 이다 (`stage-3-approvals.md` §26.1 각주 + §28.6-4) |
| **`AC-3-22`~`AC-3-26`** | — | Reading Context 선택 UI(6값 · `custom_time` picker · 요청 body 포함 · 키보드 조작 · 미선택 진행 여부 `D-9`) | **조건부 In Scope.** contract(`SelectActivityOptionRequest.readingContext`·`customTime`·`createCustomTimeRefine`)는 **이미 있다** (**[직독]** `packages/contracts/src/activity/selection.ts`). 빠진 것은 **진입점 디자인**이다 → **C-13 결정이 선행**(§14.2 `N4-05`). 결정이 "design-agent 명세" 면 Stage 4 In Scope, "디자이너 Figma 요청" 이면 도달 Stage 로 재이월 |
| **§30.7 Mock 2건** | Low | ① `library:save-error` 류 key 부재(그룹 단위 scenario 때문에 "목록 성공 + 저장만 실패" 를 만들 수 없다) ② `purchaseUrl` fixture 0건으로 `favorite_only` 가 아무것도 렌더하지 않는다 | **In Scope** (§30.8 이 development-agent 소관으로 배정) |
| **`QA-3-011`** | Low | `e2e/toast.spec.ts:177` 전환 중 TopBar 측정 + `controls` 루프 공집합 | **In Scope** (테스트 정밀도, §30.8) |

### 2.5 ⭐ In Scope 재집계 (`D4-1`·`D4-8` 반영)

> 초판의 "요구사항 ID 기준 In Scope **23항목**"(= §2.1 FR 11 + §2.3 예외 6 + §2.4 이월 6)을 다시 셌다.

| 구분 | 초판 | 개정 | 변화 |
|---|---|---|---|
| **§2.1 Functional Requirements** | **11** (FR-09·10·11·14·19·02·21·23·25·01·08) | **10** | **−1** — **FR-01 제외**(Stage 4 부분이 네이티브 Auth Adapter 뿐이었다). FR-25 · FR-08 은 **행 유지 + 범위 축소** |
| **§2.3 PRD §13 예외 처리** | **6** (Stage 4 해당분 — STT 저품질 제외) | **6** | **±0** — 1건 **재정의**: "녹음 중 인터럽션" 을 **Web 에서 재현 가능한 3종**(탭 비활성 · devicechange · track onended)으로 한정 |
| **§2.4 Stage 3 이월** | **6** (`QA-3-001`·`002`·`003` · `AC-3-22`~`26` · §30.7 Mock 2건 · `QA-3-011`) | **6** | **±0** — 1건 **재범위**: `QA-3-001` 에서 네이티브 Push Adapter 제외(6요소 자체는 전부 Web) |
| **요구사항 ID 기준 합계** | **23** | **22** | **−1** |
| (참고) §2.2 NFR 항목 | 9 | 9 | ±0 — **2건 재정의**(녹음 시작 지연 = Web 전용 / 백그라운드 = **"Web 한계 측정·기록·안내"가 요구사항**), 1건은 초판부터 "Frontend 범위 아님"(원본 암호화) |

**후속 단계로 나간 In Scope 항목 = 6건** (§3.0): `apps/mobile` 셸 생성 · 네이티브 녹음 플러그인 선정·도입 · `NativeRecorderAdapter` · 네이티브 Apple/Google Auth Adapter · 네이티브 Push Adapter · portrait lock.

---

## 3. Out of Scope

### 3.0 ⭐ 분리된 후속 단계 — 네이티브 (`D4-1`, 2026-10-12)

> **Stage 4 In Scope 가 아니다.** Stage 번호는 **부여하지 않는다** — Stage 5~8 의 기존 번호를 밀지 않기 위해서다. 착수 시점은 **사용자 결정 사항**이며, 이 Plan 은 *"무엇이 나갔고 무엇이 선행인가"* 만 고정한다.
> 가칭 단위 ID `S4N-A`~`S4N-D` 는 §16 의 `S4-*` 와 구분하기 위한 표기다.

| 단위 | 내용 | Stage 4 가 남겨 주는 확장점 | 초판에서 온 AC |
|---|---|---|---|
| **`S4N-A`** | **`apps/mobile` Capacitor 셸 생성** (iOS·Android) + `apps/web` 빌드 산출물 webDir 연결 + **portrait lock**(#12) + 네이티브 권한 선언(iOS `NSMicrophoneUsageDescription`·`UIBackgroundModes: audio` / Android `RECORD_AUDIO`·`FOREGROUND_SERVICE_MICROPHONE`·FGS type `microphone`) | `apps/web` 빌드가 정적 산출물로 완결되어 있다 (Stage 4 Exit) | AC-4-04 · AC-4-73 · AC-4-74 · AC-4-75 · AC-4-76 |
| **`S4N-B`** | **네이티브 녹음 플러그인 선정 + `NativeRecorderAdapter`** | **`RecorderAdapter` interface** 와 Web 구현 + **Adapter 선택 지점 `app/providers` 1곳** (Stage 4 In Scope) | AC-4-77 · AC-4-80 |
| **`S4N-C`** | **네이티브 Apple/Google Auth Adapter** | `AuthGateway` interface (Stage 2 산출물) | AC-4-78 |
| **`S4N-D`** | **네이티브 Push Adapter** (+ provider 선정 — `N4-11`) | `PushPermissionPort` interface + Web 구현 (Stage 4 In Scope, 이월 `QA-3-001`) | AC-4-79 |
| (검증) | **실기기 네이티브 8시나리오** (`rules/qa.md` Recording Client 표의 iOS·Android 열) | Web 열은 Stage 4 에서 채운다 | AC-4-80 |

**후속 단계 착수 전에 결정해야 하는 것** (Stage 4 에서는 묻지 않는다):

| 이연된 미결 | 초판 ID | 내용 |
|---|---|---|
| 녹음 플러그인 선정 | `N4-07` | ⓐ **Capawesome Audio Recorder** — pause/resume · iOS Background Modes · **AAC** · **청크 미문서화** · **Insiders 전용(유료 라이선스 키)** ⓑ **Cap-go `@capgo/capacitor-audio-recorder`** — **MPL-2.0** · pause/resume(파일 분리 없음) · iOS 잠금 중 지속 · **Android FGS 를 플러그인이 만들지 않음** · **청크 미문서화** · 포맷 미명시 ⓒ 자체 플러그인 (2026-10-11 직접 조회) |
| Android foreground service 구현이 Frontend Scope 인가 | `N4-19` | ⓑ 채택 시 Kotlin FGS 를 직접 써야 한다 → `D4-1` 의 사유 ③ |
| 네이티브 실기기 범위 | — | **Android 실기기 없음**(`D4-4`) → Android 네이티브 8시나리오는 후속 단계에서도 `NOT VERIFIED` 예상 |

### 3.1 Stage 5 이후로 넘기는 것 (경계선 명시)

| 항목 | 넘기는 Stage | 경계선 |
|---|---|---|
| **회고(Reflection) 카드** — 별점·칩 5종·주제·자유 후기·skip·멱등 제출 | **5** | ⚠️ Figma `29:62` 는 **완료 화면과 회고 카드가 한 frame** 이다 (**[직독, metadata]** `91:691` Feedback Card 가 `x=11,y=521` 에 같은 frame 안에 있다). Stage 4 는 **상단(제목 `29:75` · 닫기 `29:76` · 스티커 `29:79` · 메달리온 `29:86/87` · 버블 `88:929`)까지**, `91:691` **카드는 건드리지 않는다**. `FIGMA_SCREEN_MAP.md:66` 이 같은 분할("4 (상단) / 5 (카드)")을 이미 적고 있다. ⛔ 최우선 규칙 3("Figma 에 있는 것을 빼지 않는다")과 충돌하지 않도록 **"Stage 4 에서는 이 frame 의 하단 카드를 의도적으로 미구현"** 을 QA 증거로 기록한다 |
| **분석 상태 UX** (`analyzing`/`analyzed`/`failed`/저품질 폴링·안내) | **5** | Stage 4 는 `completed → analyzing` 전이를 **Mock 이 수행하는 것까지만** 확인한다. `GET /v1/sessions/:id/analysis` 호출·표시는 Stage 5 |
| **짧은 성장 피드백** (`/session/:id/feedback`, push deep link 진입 화면) | **5** | Stage 4 는 push **권한·기기 등록**만. deep link **도착 화면**은 Stage 5 |
| STT 저품질·민감 발화 안내 | **5** | `analysisOutcome` 표시 자체가 Stage 5 |
| 하이라이트 클립 재생·만료 | **7** | — |
| 리포트 집계 반영 | **7** | Stage 4 는 `recordedSeconds` 를 **전이 요청에 담는 것까지** |
| **데이터 관리 UI** (보관 정책 안내 화면·세션별 녹음 삭제 UI·전체 삭제 요청·탈퇴) | **8** | Stage 4 는 `LocalRecordingStore` **삭제 API 와 로그아웃 정리**까지 (C-15) |
| `/settings/notifications` 알림 설정 화면(카드 갱신 시간·리마인더 요일/시간) | 디자이너 Figma 도착 후 | `D-18` 유지 — 이 Plan 이 되살리지 않는다 |
| 표지 에셋 교체(`P3-BIP-19`) · Mock 웹 프리뷰 배포(C-18) | **8** | §2.4 `QA-3-003` 경계 |

### 3.2 Backend 구현 (이 프로젝트에서 하지 않는다 — `rules/backend.md` §1)

Express route/controller/service/repository · Supabase migration/RLS/Storage 서버 로직 · **실제 TUS 전송 서버** · 서버 측 전이 판정·강제 · `abandoned` sweeper · part 검증(sha256/bytes/duration) · signed upload token 발급 · 90일 Retention Cron · STT/AI/분석 Worker · 48h 재시도 **push 발송** · Render 배포. `apps/api/`·`supabase/` **생성 금지**.

### 3.3 Stage 4 에서 만들지 않는 Frontend (근거 있는 제외)

| 항목 | 제외 근거 |
|---|---|
| `TusUploadTransport` **실제 전송 구현** | `API_CONTRACTS §5.1.1` — 골격만, 연동 검증은 PENDING. #27(Supabase JS Client 미사용) |
| `HttpRecordingApi`·`HttpSessionApi` **실제 연동 검증** | 골격만. Stage 1~3 선례와 동일 (**[직독]** `shared/api/http/` 에 Http*Api 8종이 골격으로 존재) |
| push provider SDK(OneSignal 등) 도입 | provider **미선정** (§14.2 `N4-11`). `D-16` 이 "provider SDK 금지" 로 이미 결정 |
| ~~**`Discard` 버튼 (`163:1618`)**~~ | ⛔ **이 행 무효 (2026-10-13).** ~~`D4-7` 미채택~~ → **`D4-12` 로 채택**됐다. **In Scope 로 이동** (§2.1 FR-09·FR-21, §2.1-A). ~~`AD-S4-2`~~ 무효, ~~AC-4-105~~ 폐기. contracts 영향은 **§7.3 재분석** 참조 — *"전이표 신규 행 0"* 은 **더 이상 성립하지 않는다** |
| ~~`Submit` 버튼~~ | ⭐ **채택됨. Out of Scope 아니다.** `163:1620` 은 이제 **`285:1445` "After_record" 의 자식**(144,0,135×45)이며, 같은 프레임에 `163:1618` `Discard`(0,0,135×45)와 **gap 9** 로 나란히 있다 `[M, plan-agent 2026-10-13]`. ⚠️ 2026-10-12 개정이 적은 *"loose 좌표에서 유도 · 폭 281 · `140:2870` 과 같은 슬롯"* 은 **스테일**이다 — 실제 폭은 **135**이고 `140:2870` 은 **프레임에서 제거**됐다 |
| **`Discard` 확인(confirm) 다이얼로그** | **Figma 에 없다** `[M, 2026-10-13]`. 최우선 규칙 2 에 따라 **임의로 만들지 않는다** → `AD-S4-4` · `N4-26` 결정 후. 결정 전까지 **구현하지 않는다** |
| **애니메이션 라이브러리 (Lottie / Rive / GSAP 등)** | ⭐ **`D4-3` — 도입하지 않는다.** CSS 모션으로 시작한다 (Stage 0 #9 선례: *"제스처·애니메이션은 CSS / Pointer Events 우선"*). 검증 = **AC-4-109**(의존성 0건) |

---

## 4. Dependencies

### 4.1 선행 Stage

| 선행 | 상태 | Stage 4 가 쓰는 것 |
|---|---|---|
| Stage 1 | `PASS (accepted: D-01, S1-G-2)` | Design Token · `packages/ui`(`Sheet`·`Scrim`·`InlineAlert`·`Toast`·`Dialog`·`SpeechBubble`·`Spinner`·`Skeleton`·`EmptyState`·`ErrorState` — **[직독]** `packages/ui/src/`) · Mock scenario store(3계층 + attempt 카운터) · Adapter 선택 지점(`app/providers`) · `shared/lib/clock.ts`·`idFactory.ts`·`idempotency.ts` |
| Stage 2 | `PASS` (+ 재구성 `PASS`) | `AuthGateway` interface + Web/Mock · Route Guard · 동의 상태(`Me.consentStatus`) · `performSessionCleanup` |
| Stage 3 | **`PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`** — **[직독]** `stage-3-qa-report.md` §14.1 | Activity Card 덱 · `ActivityCardOption` · `PromptSet`/`Prompt`(**`coachingNote` 포함**) · 서재 시트 · "Start Session" CTA 자리(`D-3` 비활성) |

### 4.2 이 Stage 를 차단하는 미결정 사항 (§14 에 전문)

> **개정 2026-10-13 (2차)** — `D4-1`~`D4-19` 반영. ⛔ 차단은 이제 **4a 0건 · 4b 1건**이다 (`D4-13` 이 `N4-25` 를, `D4-17`·`D4-18` 이 `N4-26` 을 해소). 전문은 §14, 단계별 경계는 **§16.4·§16.5**, 재배분 판단은 **§16.6**.

| 차단 등급 | 항목 |
|---|---|
| ✅ **해소** | ~~`M-25`(세션 준비 버블 내용)~~ → ⭐ **`D4-14` — Figma 채택**(`139:2803` 그대로. ~~`D4-6`~~ 철회) → **PRD 수정 대상 7건** §0.7 · ~~`R-16`(애니메이션 포맷)~~ → **`D4-3`** · ~~`G-09`(Discard/Submit)~~ → **`D4-12`**(둘 다 채택; ~~`D4-7`~~ 무효) · ~~`N4-07`(플러그인 선정)~~ → **`D4-1` 로 Stage 4 범위 밖** · ~~`OAQ-10`(Web 녹음 허용)~~ → **`D4-1` 의 직접 귀결**(Stage 4 = Web 녹음까지) |
| ⏳ **산출물 대기 (차단 아님)** | **`M-26`** 잔여 ⭐ **대폭 축소 (2026-10-13)** — Figma section `285:1126` 이 `ready`·`recording` 구성과 하단 액션 영역을 확정했다(§2.1-A). **남은 것 3건**: `paused` 재개 컨트롤(`N4-27`) · 녹음 경과 표시(`C13-3`) · Prompt Drawer 트리거(`C13-4`·`N4-28`). `C13-14` Figma 수령 전까지 `S4-F`·`S4-G` **일부** 보류 → 경계는 **§16.5** |
| ⛔ **완료 판정 차단** | **4a**: ⭐ **0건** — ~~`N4-25`~~ 가 **`D4-13`(안 A)** 으로 해소됐다. · **4b**: **`N4-10`** 잔여 1건(대화 전용 **흐름** 최소안 — C-13 분배는 §4.3 에서 해소됐다). ✅ ~~`N4-22`~~(→`D4-9`) · ~~`N4-23`~~(→`D4-12`) · ~~`N4-25`~~(→`D4-13`) · ~~`N4-26`~~(→`D4-17`·`D4-18`) 해소 |
| ⚠️ **작업 단위별 선행** | **4a**: `N4-04`(`D-9` `readingContext` nullable 범위 → **S4-B 전**) · `N4-09`(`OAQ-11` 로컬 보관 상한 → **S4-E 전**) · `N4-20`(`sharp` → **S4-J 전**) · **4b**: `N4-32`(ready 버블의 인사 문구 노출 지점 — `D4-14` 파생) · `N4-27`(`paused` 재개) · `N4-31`(바 규격 `S4F-16`) · `N4-15`(`78:353` TopBar) **전부 S4-F 전** · `N4-28`(Drawer 진입점 → **S4-G 전**). ✅ ~~`N4-05`~~(§4.3 정정) · ~~`N4-29`~~(→`D4-16`) 해소 |
| 비차단 | `OAQ-17`(`skipped_audio_deleted`) · `OAQ-19`(실제 Supabase Adapter 시점) · `N4-11`(push provider) · `N4-13`(대화 전용 스티커) · `N4-16`~`N4-18` · `G-12`~`G-14`(`★ Save` 후속 — Stage 3 잔여) |

### 4.3 디자인 누락 (C-13) — **`D4-8` 분배 적용**

**[직독]** `docs/FIGMA_SCREEN_MAP.md:102`~`:106` + 감사 §10(**"정말 없는지 확인한 결과"** — `C13-1`~`C13-16` 전수).

> **`D4-8` 분배 규칙**: **안내·상태 UI = design-agent 명세**(Stage 0 #22 선례) · **세션 화면 상태별 비주얼 = 디자이너 Figma 요청**(`C13-1` · `C13-14`).
> 감사의 `C13-1`~`C13-16` 번호와 초판의 `C13-S4-1`~`6` 을 아래에서 **대응**시켰다.

| 초판 ID | 감사 ID | 화면 / 상태 | `D4-8` 분배 | Stage 4 에서 가능한가 |
|---|---|---|---|---|
| **`C13-S4-1`** | **`C13-1`** `C13-3` `C13-4` (+`C13-2` 해소) | `/session/:sessionId` **상태별** (ready / recording / paused 분리, 녹음 경과 표시, Prompt Drawer **트리거**) | ⭐ **디자이너 Figma 요청** → **2026-10-13 부분 수령** | ⭐ **부분 해소** — section `285:1126` 이 **`ready`·`recording` 구성과 하단 액션 영역을 확정**했다 (§2.1-A). **남은 누락 3건**: ⓐ `paused` **재개** 컨트롤(`N4-27`) ⓑ **녹음 경과 표시**(`C13-3`) ⓒ **Prompt Drawer 트리거**(`C13-4` — 하단 슬롯을 Discard/Submit 이 차지, `N4-28`). ~~`C13-2`("Done Reading")~~ 는 **`D4-12` 로 해소** |
| — | **`C13-14`** | **Record Control `paused` / `disabled` / permission-denied 변형** (`163:1590` 은 `Record`·`Pause` **2변형만**) | ⭐ **디자이너 Figma 요청** | ⏳ **여전히 보류.** 2026-10-13 갱신에서도 `163:1590` 변형은 **2개 그대로**다 `[M]` → `paused` 재개 표현·권한 거부 표현 미확정 |
| **`C13-S4-2`** | `C13-5` | 마이크 권한 이유 → 설정 딥링크 → "대화만 하기" | **design-agent 명세** (안내 UI) | ✅ 가능 — `CharacterMedallion` + `Surface` + `Button` ×2 |
| **`C13-S4-3`** | `C13-6` | 대화 전용 세션(`mode=conversation_only`) **흐름** | ⭐ **정정 (2026-10-13)** — **design-agent 명세로 분배됐다.** Orchestrator 가 `D4-8` 분배에 포함해 전달했고, Design Spec **§7.4** 가 이미 명세를 담고 있다 (**[직독]** `docs/design/stage-4-design-spec.md:509`·`:546`~`:553`). 2026-10-12 개정의 *"분배되지 않았다"* 는 **오기** | ✅ **가능 (UI 명세 측면)**. ⚠️ **`N4-10` 의 잔여는 "흐름" 뿐**이다 — Design Spec §7.4 자신이 *"흐름 자체가 미결"* 이라고 적으며 Plan §14.2 의 **최소안**(ready 버블 → Prompt Drawer → `Submit` → `completed`, 녹음·업로드·분석 없음)을 전제로 쓰였다. **흐름 최소안 승인**만 받으면 `S4-H2` 착수 가능 |
| **`C13-S4-4`** | `C13-7`~`C13-10` + Web 백그라운드 경고 | 업로드 진행·실패·재시도 · 오프라인 · **48h 만료** · 크래시 복구 · **Web 백그라운드 보장 불가 경고**(`D4-4`) | **design-agent 명세** (안내·상태 UI) | ✅ 가능 — `InlineAlert`/`Toast`(Stage 1 존재) + **`UploadStatusBadge` 신규**. ⚠️ 감사 §1.3: **Design Guide 에 Alert·Toast·Banner·Dialog·Snackbar·Sheet 컴포넌트가 0개** `[실측·meta, canvas 8:2 전수]` → 안내 UI 의 Figma 원본이 **애초에 없다**. #22 선례가 그대로 적용된다 |
| **`C13-S4-5`** | `C13-11` `C13-12` | 10분 리마인드 버블 · 30분 자동 종료 안내 | **design-agent 명세** (안내 UI) | ✅ 가능 — `SpeechBubble` + `Dialog`/`InlineAlert`. ⚠️ `88:721` Bubble 변형은 **3개뿐**(Type2 / sessopn / Type3)이고 **안내용 변형이 없다** `[실측·meta]` |
| **`C13-S4-6`** | `C13-13` | Reading Context 선택 시트(6값 + `custom_time` picker) — 이월 `AC-3-22`~`26` | ⭐ **정정 (2026-10-13)** — **design-agent 명세로 분배됐다.** Design Spec **§7.5**(+ §3.4 예약 절, 컴포넌트 표 `Sheet`·`RadioGroup`)가 이미 명세를 담고 있다 (**[직독]** `stage-4-design-spec.md:64`·`:323`·`:510`·`:560`~`:569`). 2026-10-12 개정의 *"분배되지 않았다"* 는 **오기** | ✅ **가능** → **`N4-05` 해소** (C-13 절차는 "design-agent 명세" 로 종결). picker 규격안 = `stage-3-plan.md` §9.2 ⑩ (30분 단위 목록, 네이티브 `<input type="time">` 금지). ⚠️ 남는 것은 **디자인 소스가 아니라 `D-9`(Context 없이 세션 시작 허용)** = `N4-04` 뿐 |
| — | `C13-15` | **세션 TopBar `78:353` 배치 여부** — 감사도 *"배치 확인 불가"* (`get_screenshot(28:51)` 에 안 나오고 hidden 플래그도 노출되지 않는다) | ⚠️ `C13-1` Figma 요청에 **포함 권장** | ⚠️ **`N4-15`** |
| — | `C13-16` | `Discard` / `Submit` 의 소속 화면 | ✅ **완전 해소 (2026-10-13)** — Figma 가 두 버튼을 **`285:1445` "After_record"** 로 묶어 **`28:51` 안에 배치**했다 `[M]` | **둘 다 채택** (`D4-12`). ~~`Discard` 미채택~~ 무효 |
| — | ~~`C13-17`~~ | ~~`Discard`·`Submit` 의 disabled 변형~~ · **Discard 확인 다이얼로그** | ⭐ **해소 (2026-10-13)** — **disabled 는 `D4-18`** 로 전역 `opacity .5` 확정 → **디자이너 요청에서 제거**. **다이얼로그는 `D4-17`** 로 *"둔다"* 확정 → **design-agent 명세**(#22 선례, Stage 1 `Dialog` 재사용) + `AD-S4-4` 등록 대상 | ✅ **가능** — `N4-26` 해소. 비활성 시각은 **형제 변형 `17:18` `Accent/Disabled` 의 선언 패턴**을 따른다(임의 창작 아님) |

> **공통 상태 화면**(Loading/Empty/Error/Offline/Toast/Dialog/권한 거부)은 #22 에 따라 Stage 1 에서 이미 design-agent 명세로 구현됐다 — C-13 절차 대상이 아니다. **[직독]** `FIGMA_SCREEN_MAP.md:110`.

---

## 5. Frontend Architecture Impact

### 5.1 새로 생기는 레이어·디렉토리

> ⭐ **`apps/mobile` 은 Stage 4 에서 만들지 않는다** (`D4-1`). Stage 1~3 과 동일하게 **`apps/mobile` 부재가 Stage 4 Exit Criteria** 다 (`PLANNING.md:196` Stage 1 선례와 같은 증거 방식).

```
apps/web/src/
├── features/
│   ├── recording/                  ⭐ RecordingController(순수 TS 상태 머신) · ConsentGate ·
│   │                                  PermissionService · LocalRecordingStore · SessionOutbox · UploadQueue
│   ├── storytime-session/          ⭐ 세션 화면 조립 로직(상태별 컨트롤·버블·타이머 표시)
│   └── prompt-drawer/              ⭐ Prompt 모아보기 Drawer
├── entities/
│   ├── session/                    ⭐ sessionKeys · useCreateSession · useSessionDetail · useSessionTransition
│   └── recording/                  ⭐ recordingKeys · useRecordingStatus (+ 표시 전용 컴포넌트)
├── pages/session/                  ⭐ StorytimeSessionPage · MicPermissionPage · SessionCompletePage (Composition only)
├── shared/
│   ├── api/session-api.ts          ⭐ sessionApi interface
│   ├── api/recording-api.ts        ⭐ recordingApi interface (init · refreshTokens · complete · status)
│   ├── api/notification-api.ts     ⭐ (이월 QA-3-001)
│   ├── platform/                   ⭐ RecorderAdapter(interface + **Web 구현만**) · PushPermissionPort(interface + Web) ·
│   │                                  UploadTransport · network/appState port
│   │                                  ⚠️ Native 구현은 후속 단계 §3.0 — interface 경계는 Stage 4 에서 세운다
│   └── lib/network.ts              ⭐ 온라인·오프라인 감지 (기술 요구사항 — NFR 오프라인·§13)
└── mocks/
    ├── sessions/                   ⭐ MockSessionApi (전이표 canTransition 재현)
    ├── recordings/                 ⭐ MockRecordingApi + MockUploadTransport
    ├── notifications/              ⭐ MockNotificationApi (이월)
    └── platform/                   ⭐ MockRecorderAdapter · MockPushPermissionPort
```

`packages/ui` 신규: `RecordButton` · `UploadStatusBadge`(또는 도메인 레이어) · `PromptCarousel` — **도메인 지식 없는 시각 컴포넌트만** `packages/ui` 에 둔다 (`rules/architecture.md` §2). `AttendanceStickerChip`·`CharacterMedallion`(이미 Stage 2 에서 쓰였는지 design-agent 확인 필요)은 도메인 성격이므로 배치는 Design Spec 에서 확정한다.

### 5.2 지켜야 하는 경계 (QA 대상)

1. **Component → Query/Mutation hook → `<domain>Api` interface → Mock|Http Adapter.** Component 가 Adapter 를 직접 부르지 않는다.
2. **Adapter·Port 선택 지점은 `app/providers` 한 곳.** `RecorderAdapter`(**Stage 4 = Web|Mock**, 후속에 Native 추가) · `PushPermissionPort` · `UploadTransport` 전부 동일 규칙. Feature 안에 플랫폼 분기를 흩지 않는다 — ⭐ **`D4-1` 로 네이티브가 빠져도 이 규칙은 그대로 지킨다**. 후속 단계가 **Adapter 한 줄 추가**로 끝나야 `R-02` 재작업 위험이 실현되지 않는다 (§0.4).
3. **`RecordingController` 는 순수 TS 상태 머신**이며 React 에 의존하지 않는다. 컴포넌트는 **구독만** 한다 (`rules/frontend.md` §4).
4. **`features/storytime-session` 이 `features/recording` 을 직접 import 하지 않는다** — feature 간 직접 import 금지. 조합은 `pages/session` 에서 한다 (`rules/architecture.md` §3). ⚠️ 이것이 Stage 4 에서 가장 깨지기 쉬운 경계다. 세션 화면이 녹음 상태를 알아야 하므로 **`entities/session`·`entities/recording` 의 구독 hook 을 경유**하도록 설계한다.
5. **Page 는 Composition only** — 타이머·전이·업로드 로직을 Page 에 넣지 않는다.
6. `packages/contracts` 가 Request/Response/Enum/Error/전이표의 **유일한 선언 위치**. 클라이언트 전용 상태(`UploadQueue` 내부 상태, 마이크 권한 상태, `RecordingController` client-only 상태)는 **contracts 에 넣지 않는다** (`upload-status.ts` 주석이 이미 그렇게 적고 있다 — **[직독]**).
7. ~~`apps/mobile` → `apps/web` 빌드 산출물 참조~~ → **후속 단계** (`D4-1`). Stage 4 는 `apps/mobile` **부재**를 증거로 남긴다 (AC-4-01 확장).

### 5.3 `R-SHADOW-1` / `R-FIGMA-1` / `R-BASELINE-1` 적용 지점 (Stage 4 신규 위험)

| 규칙 | Stage 4 에서 위험한 곳 |
|---|---|
| `R-SHADOW-1` | ✅ **감사가 inset 을 산출해 두었다** (감사 §4.2, `box-shadow` 겹 **전수 합산**). ① **Prompt Drawer 캐러셀 트랙에는 inset 이 필요 없다** — 캐러셀 아이템 pill(`88:708`)의 drop shadow 가 **0겹**(테두리만)이기 때문이다 `[실측·ctx]` ② 반대로 **드로어 면(`88:960`, `--shadow-glass-rest` 3겹 전부 렌더)이 `overflow != visible` 조상 안에 들어가면 좌우 56 · 위 28 · 아래 84** 가 필요하다(산술 상한) ③ **세로 스크롤이 필요한 곳이 `28:51`/`29:62` 어디에도 없다** — 두 프레임 모두 852 고정이고 콘텐츠가 그 안에 들어간다 `[계산]`. 즉 **Stage 4 신규 `overflow` 는 Drawer 캐러셀(가로) 하나뿐**이고 그 축에 그림자가 없다 ④ ⚠️ 산술 상한 ≠ 가시 번짐 — 저장소 과거 실측은 같은 토큰에 대해 **아래 77 · 위 22 · 좌우 28~32** 였다. **픽셀 프로브로 다시 잰다** ⑤ **버블 본체가 `overflow-clip`** 이다 `[실측·ctx 감사 §8.3]` — 안에 그림자 있는 요소를 추가하면 **즉시 잘린다**(현재 구성은 안전) |
| `R-FIGMA-1` | ✅ **감사가 §8 에서 전수 교차검증했다.** Stage 4 가 이어받을 함정: ① `HARU/Shadow Rest`(정의 5겹)가 첨부된 노드 **13개 중 3겹을 전부 그리는 것은 `88:960` 하나뿐** — 나머지는 **1겹 또는 2겹**이다 → 버블·스티커·메달리온·IconButton 은 **`--shadow-bubble`**(이미 존재) ② 면 색은 **선언**으로: 메달리온 링 = `white` `fill-opacity 0.5`(픽셀로 보면 민트) · 스티커 = `#ffffffbd`(74%) · 드로어 = `rgba(255,255,255,0.86)` ③ Record Control 바깥/가운데 링은 **면이 아니라 `stroke #85BFB6` 2px + opacity 0.35/0.6**, 코어만 solid `#85BFB6` `[실측·svg]` ④ `overflow` 는 **computed 로 확인** (Tailwind 유틸리티는 CSS grep 에 안 걸린다 — 이 저장소 **3회 반복** 사례) ⑤ **레이어 이름을 문자열 근거로 쓰지 않는다** — `88:929` 가 그 사례다 (§0.2) |
| `R-BASELINE-1` | 세션 화면은 **모션이 있다**(맥동·경청·완료 — `D4-3` 으로 **CSS**). 시각 baseline 저장 전 `settle()` 보장 + **모션 정지** 없이는 과도기 프레임이 굳는다. ⭐ `D4-3` 이 CSS 로 확정됐으므로 정지 전략은 **`prefers-reduced-motion: reduce` 강제 + `animation-play-state` 차단**으로 **결정적**이게 만들 수 있다 (Lottie/Rive 였다면 런타임 제어가 필요했다 — 이 점이 `D4-3` 의 부수 이득이다). dev Scenario Panel 은 테스트 레이어에서 가린다. 재생성은 `--update-snapshots=all` |

---

## 6. Data Requirement Delta (Backend Handoff 용 — 구현 아님)

> `docs/DATA_MODEL.md` §8 이 Stage 4 테이블을 **이미 정의**하고 있다 (**[직독]** `DATA_MODEL.md:247`~`:300`). Stage 4 는 **새 테이블을 제안하지 않고**, 아래 "확인·보강 필요" 만 Handoff 로 넘긴다.

| 테이블 | 이미 정의된 것 | Stage 4 에서 확인·보강할 것 |
|---|---|---|
| `storytime_sessions` (R2) | `mode`·`status`(8값)·`completed_reason`·`recorded_seconds ≤1800`·`analysis_outcome`·`consent_event_id`·`client_session_key UNIQUE`·`reading_context` | ① `reading_context` **nullable 허용 범위** = `D-9` 결정 의존 (§14.2 `N4-04`) ② `activity_card_option_id` 와 `child_book_id` 동시 지정 가능성 |
| `session_events` (R2) | `from_status`·`to_status`·`occurred_at`(client)·`received_at`(server)·`idempotency_key UNIQUE`·`source` | **오프라인 outbox 재전송 시 순서 보장** 요구 — 서버가 `occurred_at` 순서로 적용해야 한다 (Frontend 가 지연 전송한다) |
| `session_prompts` (R2) | `shown_in` (`activity_card` \| `prompt_drawer`) | Prompt Drawer **최초 노출 시각** 기록을 Frontend 가 보내야 하는가 — 현재 Contract 에 경로가 **없다** (§7.4 `C4-OPEN-3`) |
| `recordings` (R2) | `upload_status`(5값)·`part_count`·`total_bytes`·`duration_seconds`·`mime_type`·`expires_at = uploaded_at + 90d`·`deletion_reason`·`upload_failed_notice_sent_at` | ① `mime_type` **실제 값 집합**은 Stage 4 spike 가 확정한다 — ⭐ **`D4-1` 로 spike 범위가 Web 전용이 된다**(브라우저별 `MediaRecorder.isTypeSupported` 실측). **네이티브 포맷(AAC/m4a)은 후속 단계에서 추가될 수 있으므로 enum 을 Web 값으로 닫지 않는다** ② `upload_failed_notice_sent_at` 은 서버 push 용이고 **Frontend 48h 안내는 로컬 판정**이다(이중 원천 주의) |
| `recording_parts` (R3) | `part_no`·`storage_path`·`bytes`·`sha256`·`duration_seconds`·`UNIQUE(recording_id, part_no)` | **part 상한** — Contract 초안이 `partNo ≤ 20` 으로 못 박았다(`API_CONTRACTS §3.3`). 30분 세션에서 청크 재시작이 20회를 넘을 수 있는지 spike 로 확인 (§7.4 `C4-OPEN-1`) |
| `sticker_awards` (R2) | `session_id UNIQUE`·`sticker_type('attendance')` | ① **대화 전용 세션도 지급 대상인가** — `DATA_MODEL.md:299` 가 NEEDS DECISION 으로 남겨 둔 항목 (§14.2 `N4-13`) ② ⭐ **`D4-2` 로 해소**: Figma `29:85` 의 `Day 12 · keep the streak going` 을 **채택하지 않으므로 `day_count`/`streak_days` 컬럼을 요구하지 않는다.** 대신 **표시 문구를 서버가 제공**한다(`P4-BIP-18`) → Data Requirement 는 *"`sticker_awards` 에 표시 문구(또는 문구 키)를 담는다 — streak 중립"* 이다. **운영이 문구를 바꿀 때 Frontend 배포가 필요 없게** 하는 것이 이 요구의 목적이다 |
| `notification_preferences` · `push_devices` (R1) | `platform(ios/android/web)`·`provider_token`(암호화 저장 권장)·`last_seen_at`·`revoked_at` | **이월 `QA-3-001`** 로 Stage 4 에서 Contract 가 처음 생긴다. `provider_token` 은 **응답에 반환하지 않는다** |

**소유권·보관 (Handoff 요구사항 — 변경 없음, 재확인만)**: Raw Audio 와 Derived Data 분리 · 모든 family-owned 테이블 RLS · private bucket `recordings` + signed upload token / signed URL · 객체 경로에 이름·이메일 금지 · 90일 Retention 은 **Storage API 로 객체까지** 삭제 · 세션별·전체 삭제 · Audit Log.

---

## 7. API Contract Delta (`packages/contracts`)

### 7.1 ⭐ 이미 있는 것 — **다시 만들지 않는다** (중복 선언 방지)

**[직독]** `packages/contracts/src/` 전체를 읽어 확인했다.

| 이미 존재 | 파일 | Stage 4 에서 할 일 |
|---|---|---|
| `SessionStatusSchema` (8값 — `ready`·`recording`·`paused`·`completed`·`analyzing`·`analyzed`·`failed`·`abandoned`) | `enums/session-status.ts` | **그대로 사용.** 값 추가 없음 |
| `SessionModeSchema` (`recorded`·`conversation_only`) | `enums/session-mode.ts` | 그대로 |
| `CompletedReasonSchema` (`user_done`·`auto_timeout`·`recovered_after_crash`) | `enums/completed-reason.ts` | 그대로 |
| `AnalysisOutcomeSchema` (`full`·`excluded_low_quality`) | `enums/analysis-outcome.ts` | 그대로 (`skipped_audio_deleted` 는 OAQ-17 전까지 **추가 금지**) |
| `UploadStatusSchema` (`pending`·`uploaded`·`failed`·`deleted`·`expired`) | `enums/upload-status.ts` | 그대로. **클라이언트 큐 상태를 여기에 넣지 않는다** |
| `AnalysisJobStatusSchema` | `enums/analysis-job.ts` | 그대로 (화면 미노출) |
| **`SESSION_TRANSITIONS` (12행) + `canTransition()` + `SessionTransitionActorSchema`** | `rules/session-transitions.ts` | **그대로 사용.** Mock 이 이 함수를 호출한다. 전이 행 추가는 §7.3 의 검토 결과에 따름 |
| **`MAX_RECORDED_SECONDS = 1800` · `READY_ABANDON_SECONDS = 600`** | `rules/recording-limits.ts` | 그대로 |
| Error Code **29종** — 필요한 11종이 **전부 이미 있다**: `SESSION_INVALID_TRANSITION` · `SESSION_ALREADY_ACTIVE` · `SESSION_MAX_DURATION_EXCEEDED` · `RECORDING_NOT_ALLOWED_FOR_MODE` · `UPLOAD_TOKEN_EXPIRED` · `RECORDING_INCOMPLETE` · `RECORDING_DELETED` · `CONSENT_REQUIRED` · `ONBOARDING_INCOMPLETE` · `IDEMPOTENCY_KEY_REUSED` · `RESOURCE_NOT_FOUND` + HTTP status 매핑 | `common/error-codes.ts` | ⭐ **신규 error code 0건이 목표다.** 추가가 필요하면 §7.4 미결로 올린다 |
| `PromptSchema`(`coachingNote` 포함) · `PromptSetSchema` · `createPromptCoachingRefine()` | `prompts/prompt.ts` | **Prompt Drawer 가 그대로 쓴다.** `88:960` 의 "Border" 설명 텍스트 = `Prompt.coachingNote` 이며 **신규 필드가 필요 없다** |
| `ReadingContextSchema`(6값) · `createCustomTimeRefine()` · `TimeOfDaySchema` | `enums/reading-context.ts` · `activity/selection.ts` · `common/time-of-day.ts` | 세션 생성 경로에서 **재사용**. 조건문을 복제하지 않는다 |
| `BookSummarySchema` · `paginated()` · `IdSchema` · `ErrorEnvelope` · `CursorPageRequestSchema` | `books/search.ts` · `common/*` | 재사용 |

> **결론**: Stage 4 contracts 작업의 대부분은 **enum·rule·error code 추가가 아니라, 이미 승인된 enum 들을 쓰는 Request/Response schema 를 처음 만드는 일**이다. `API_CONTRACTS §3.2`·§3.3 의 코드 스케치가 설계 기준이고, `packages/contracts/src/sessions/`·`recordings/` 디렉토리는 **아직 존재하지 않는다** (**[직독]** — `ls` 결과에 없음).

### 7.2 ⭐ 신규 — Stage 4 에서 추가

| 파일 (제안) | 내용 | 근거 | 라벨 |
|---|---|---|---|
| `sessions/create-session.ts` | `CreateSessionRequestSchema`(`childId`·`mode`·`activityCardOptionId`·`bookId`·`childBookId`·`readingContext`·`customTime?`·`clientSessionKey`·`readyAt`) + refine("recorded 세션은 책 필요") · `CreateSessionResponseSchema` | `API_CONTRACTS §3.2` · §4 Stage 4 | RECOMMENDED (스케치 기반) |
| `sessions/session.ts` | `SessionSummarySchema`(`id`·`status`·`mode`·`book`·`readingContext`·`readyAt`·`startedAt`·`completedAt`·`completedReason`·`recordedSeconds`·`analysisOutcome`·`prompts`·`bubble`) · **`SessionBubbleCopySchema`**(지금 어디에도 정의가 없다) · `SessionDetailSchema`(summary + recording upload status + reflection? + sticker?) | `API_CONTRACTS §3.2` · §4 Stage 4 | RECOMMENDED |
| `sessions/transition.ts` | `SessionTransitionRequestSchema`(`to` ∈ `recording`·`paused`·`completed`·`abandoned`, `occurredAt`, `recordedSeconds?`, `completedReason?` + refine) · `SessionTransitionResultSchema`(`session`, `completionBubble?`, `stickerAward?`) · **`StickerAwardSchema`** — ⭐ **`D4-2` 반영**: 표시 문구(제목·부제)를 **응답 값으로 받는다**(`title`·`subtitle` 또는 `message`). **`dayCount`·`streakDays` 필드를 넣지 않는다** (streak 중립 — `D-6`·PRD §7.4) | `API_CONTRACTS §3.2` · §4 / **`D4-2`** | RECOMMENDED |
| `sessions/list.ts` | `ListSessionsRequestSchema`(cursor + `status?`) · `paginated(SessionSummarySchema)` | `API_CONTRACTS §4` (`GET /v1/children/:childId/sessions`) | RECOMMENDED — **화면 소비는 Stage 7/8** 이므로 Contract 만 둘지는 §7.4 `C4-OPEN-4` |
| `recordings/upload.ts` | `RecordingUploadInitRequest/Response` · `RefreshUploadTokensRequest`(`partNos`) · `RecordingUploadCompleteRequest/Response` | `API_CONTRACTS §3.3` | RECOMMENDED |
| `recordings/status.ts` | `RecordingStatusSchema`(`recordingId`·`uploadStatus`·`partCount`·`expiresAt`·`deletedAt?`) | `API_CONTRACTS §4` (`recordingApi.status` — §5.1.1 이 `status` 를 interface 메서드로 **확정**) | RECOMMENDED |
| `notifications/preferences.ts` · `notifications/push-device.ts` | `NotificationPreferences` · `RegisterPushDeviceRequest`(`platform`·`token`) · `PushDevice`(`id`·`platform`·`lastSeenAt` — **token 미반환**) | **이월 `QA-3-001`** · `stage-3-plan.md:287` | RECOMMENDED |
| `enums/push-platform.ts` | `PushPlatformSchema` = `ios`·`android`·`web` | **이월 `QA-3-001`** · `DATA_MODEL §7 push_devices.platform` | RECOMMENDED |
| `enums/sticker.ts` | `StickerTypeSchema` = `attendance` | `DATA_MODEL §8 sticker_awards.sticker_type` | RECOMMENDED — 단일 값 enum 을 만들 가치가 있는지 §7.4 `C4-OPEN-5` |

### 7.3 전이표 검토 — **추가가 필요한가**

**[직독]** `SESSION_TRANSITIONS` 12행을 PRD §12.2 · §13 · ARCHITECTURE §10.3 과 대조했다.

| 확인 항목 | 결과 |
|---|---|
| `ready → recording`(recorded) · `ready → completed`(conversation_only) · `ready → abandoned`(client + server) · `recording ⇄ paused` · `recording/paused → completed` · `completed → analyzing`(server) · `analyzing → analyzed/failed`(worker) · `failed → analyzing`(worker) | **전부 존재** |
| `recording → abandoned` / `paused → abandoned` | **없다.** PRD §13 의 방치는 *"세션 준비 후 미시작"* 이므로 `ready` 에서만 발생한다 → **추가하지 않는다** (근거 일치) |
| 크래시 복구 전이 | `completedReason: recovered_after_crash` 로 **표현된다** — `recording → completed` / `paused → completed` 행이 이미 커버. **전이 행 추가 불필요** |
| `conversation_only` 의 `completed` 이후 | `completed → analyzing` 행의 `modes` 가 `['recorded']` 라서 **대화 전용은 종착**이 된다 — 모델과 일치 |
| ⚠️ **`abandoned` 를 클라이언트가 요청할 수 있는가** | 전이표에 `{ ready → abandoned, actor: 'caregiver' }` 가 **있고**, `API_CONTRACTS §3.2` 스케치의 `SessionTransitionRequest.to` 에도 `'abandoned'` 가 **포함**돼 있다 → 일치. 단 **PRD 는 "조용히 정리"** 라서 사용자 조작 없이 타이머가 보내는 것인데 actor 가 `caregiver` 인 것은 **의미상 어색하다**(client timer = caregiver 세션에서 보내는 요청이라는 뜻). 기존 주석이 *"클라이언트 10분 타이머"* 로 설명하고 있어 **변경하지 않는다** — 다만 Mock·AC 에서 혼동이 없도록 명시한다 |

~~**결론: `SESSION_TRANSITIONS` 에 신규 행 0건, `SessionStatus` 신규 값 0건, `CompletedReason` 신규 값 0건.**~~ ⛔ **이 결론은 `D4-12` 로 깨졌다** — 아래 §7.3-A 가 대체한다. (위 표의 **개별 확인 결과는 그대로 유효**하다. 깨진 것은 "신규 0건" 이라는 **총괄 결론**뿐이다.)

> ⭐ **확정된 결론 (2026-10-13, `D4-13` — 사용자 결정)**
>
> | 항목 | 확정 |
> |---|---|
> | `SESSION_TRANSITIONS` | **12 → 14행** — `{recording → abandoned}` · `{paused → abandoned}` (actor `caregiver`, modes `['recorded']`) |
> | `SessionStatus` | **8값 유지** (`discarded` 없음 — 안 B 미채택) |
> | `AbandonedReason` enum | **만들지 않는다** (안 A′ 미채택 — plan-agent 권고는 **기각**됐다) |
> | `CompletedReason` · Error Code · `UploadStatus` | **신규 0건** |
> | `recordingApi.abort()` | **추가하지 않는다** — 서버가 `abandoned` 전이로 part 를 정리한다 (`P4-BIP-21`) |
>
> ⚠️ **귀결 (approvals §1.1 에 명시 기록)**: **10분 방치와 사용자 폐기를 구분할 수 없다.** 세션 완료율 지표 분리 집계와 폐기 Audit 근거가 전이 기록만으로는 남지 않으며, 사유 값 추가는 **나중의 별도 결정**이다 (`N4-30`, 비차단·이연). Frontend 는 **폐기 사유를 보내지 않는다** — Handoff 에 명시한다.
> ⚠️ **이것은 Stage 0 #16 의 변경**이다 (`SESSION_TRANSITIONS` 2행 확장. enum 값은 불변). `rules/workflow.md` §2 에 따라 approvals §1.1 에 기록했고, `PLANNING.md` §12 #16 본문에는 **원문을 지우지 않고 변경 기록을 덧붙인다**(§18-25).
> ✅ **`N4-25` 해소 → Stage 4a 착수 ⛔ 차단 0건.**

> ⛔ ~~`D4-7` 이 이 결론을 지킨다…~~ **무효.** 2026-10-12 개정은 *"`Discard` 를 채택했다면 '완료 전 녹음 폐기' 전이와 신규 값이 필요했고, 그것은 전이표 신규 행 + enum 신규 값 + 동의·삭제 정책을 동시에 연다"* 라고 **스스로 예측했다. 그 예측대로 됐다.**
> ✅ **`Submit` 은 여전히 전이표에 영향이 없다** — `recording → completed(user_done)` · `paused → completed(user_done)` 기존 행 그대로다. 영향은 **`Discard` 에서만** 나온다.

### 7.3-A ⭐ `Discard` 채택의 contracts 영향 — **재분석 (2026-10-13)**

**[직독]** `packages/contracts/src/enums/session-status.ts`(8값) · `enums/completed-reason.ts`(3값) · `enums/session-mode.ts`(2값) · `rules/session-transitions.ts`(12행 + `canTransition()`) 를 이 세션에서 다시 열어 확인했다.

#### ① 기존 enum·전이표로 "녹음 폐기" 를 표현할 수 있는가 — **아니다**

| 후보 | 표현 시도 | 판정 |
|---|---|---|
| **`abandoned` 재사용** | 의미는 가장 가깝다 — *"완료되지 않고 정리된 세션"*. 그러나 **전이표에 `recording → abandoned` · `paused → abandoned` 행이 없다** `[직독: 12행 전수]`. `abandoned` 로 가는 행은 **`ready` 출발 2행뿐**(client timer · server sweeper) | ⛔ **전이 2행 추가 없이는 불가**. `canTransition()` 이 `false` 를 돌려주고 Mock 은 `SESSION_INVALID_TRANSITION` 으로 **거부**한다 |
| **`completed` + `CompletedReason` 신규 값** (예: `discarded`) | enum 1값 추가로 끝나 보인다. 그러나 `completed → analyzing`(actor `server`, mode `recorded`) 가 **이미 존재**하므로 폐기 세션이 **분석 파이프라인으로 들어간다**. 폐기는 "완료" 가 아니다 | ⛔ **의미 충돌**. 막으려면 서버가 `completedReason` 을 보고 분기해야 하는데, 그런 조건부 전이는 **현재 전이표 모델(`from`·`to`·`actor`·`modes`)이 표현하지 못한다** |
| **전이 없이 화면만 홈으로 이동** | 서버 세션은 `recording`/`paused` 에 **영구히 남는다**. `ready → abandoned` sweeper 는 `ready` 만 쓸어 가므로 **정리되지 않는다** `[직독]` | ⛔ **고아 세션 발생**. `SESSION_ALREADY_ACTIVE` 로 **다음 세션 시작이 막힐 수 있다** |
| **`conversation_only` 전환** | mode 전환 전이가 **전이표에 없다** (mode 는 세션 생성 시 고정) | ⛔ 불가 |

#### ② 그러면 무엇을 추가해야 하는가 — ⭐ **결정됨: 안 A** (`D4-13`, 2026-10-13)

> ✅ **사용자가 안 A 를 택했다.** plan-agent 는 **안 A′ 를 권고**했으나 채택되지 않았다. 아래 3안 비교는 **판단 근거로 보존**한다. **구현 기준은 안 A** 이며 §7.3 의 확정 블록이 정본이다.
> ⚠️ **Stage 0 #16 변경**이다 — enum 값은 불변이고 `SESSION_TRANSITIONS` 만 **2행 확장**된다.

| 안 | 내용 | 장 | 단 |
|---|---|---|---|
| **안 A (권장)** | **`SESSION_TRANSITIONS` 에 2행 추가** — `{ recording → abandoned, actor: 'caregiver', modes: ['recorded'] }` · `{ paused → abandoned, actor: 'caregiver', modes: ['recorded'] }`. **`SessionStatus` 신규 값 0 · `CompletedReason` 신규 값 0** | `abandoned` 의 뜻(*"완료되지 않고 정리됨"*)과 일치한다. enum 스냅샷이 그대로다. `docs/API_CONTRACTS.md` **§6 `G-09` 가 이미 같은 안을 적어 두었다** — *"완료 전 폐기 = `abandoned` + 로컬 삭제, 서버 업로드 없음"* **[직독]** `API_CONTRACTS.md:952` | 전이표만 보면 **10분 방치**와 **사용자 폐기**를 구분할 수 없다(둘 다 `→ abandoned`, actor `caregiver`). 세션 완료율 지표(PRD §2)에서 둘을 나누려면 구분 수단이 필요하다 |
| **안 A′** | 안 A + **`AbandonedReason` enum 신규**(`ready_timeout` · `user_discarded`) + `SessionTransitionRequest.abandonedReason?` | 지표·Handoff 에서 둘을 구분할 수 있다. `CompletedReason` 과 **대칭 구조**다 | enum **1종 신규**(= Stage 0 #16 범위 확장). 필드 1개 추가 |
| **안 B** | **`SessionStatus` 에 `discarded` 신규 값** + 전이 2행 | 의미가 가장 명확하다 | **8값 → 9값** = #16 의 가장 큰 변경. `analysisOutcome`·`UploadStatus`·화면 분기·Mock·DATA_MODEL 이 **모두** 새 종착 상태를 알아야 한다. 효용 대비 파급이 크다 |

~~**plan-agent 권고: 안 A′**~~ — ⛔ **기각 (2026-10-13, `D4-13`).** 권고 근거(*"안 A 는 '왜 끝났는지' 를 잃는다 — 아동 음성 데이터를 사용자가 직접 지운 사건은 Audit 대상이다"*)는 **유효하지만 채택되지 않았다**. 그 위험은 **`D4-13` 의 명시된 귀결**로 기록되고, 사유 값 도입은 **Audit·지표 요구가 생기는 시점의 별도 결정**으로 이연된다 (`N4-30`).

#### ③ 함께 필요한 contract 변경

| 항목 | 내용 | 신규? |
|---|---|---|
| `SessionTransitionRequest.to` | `'abandoned'` 가 **이미 포함**돼 있다 (`API_CONTRACTS §3.2` 스케치) | 변경 없음 |
| **업로드 중단** | `recordingApi` 에 **폐기 통지 수단이 없다** — `init`/`refreshTokens`/`complete`/`status` 4메서드뿐 (`API_CONTRACTS §5.1.1`). 이미 올라간 part 를 서버가 정리하려면 **신호가 필요**하다. ⓐ `abandoned` 전이를 서버가 받아 **스스로 정리**(Frontend 변경 0) ⓑ `recordingApi.abort(recordingId)` **신규 메서드** | **ⓐ 권장** — Frontend contract 를 늘리지 않고 **Handoff 요구사항**으로 적는다 (`P4-BIP-21` 신규) |
| **Error Code** | 신규 **0건**. 승인되지 않은 전이는 기존 `SESSION_INVALID_TRANSITION` 이 그대로 처리한다 | 변경 없음 |
| `UploadStatus` | `deleted` 가 **이미 있다** `[직독]` → 폐기 녹음 표현에 신규 값 불필요 | 변경 없음 |

#### ④ 로컬 녹음 삭제 시점과의 관계 — `rules/architecture.md` §7

규칙 원문: *"로컬 녹음은 업로드 확정 응답 전까지 삭제하지 않는다 (Mock 확정 응답 포함)."*

| 질문 | 판정 |
|---|---|
| `Discard` 가 이 규칙을 **위반하는가** | **아니다.** 규칙의 목적은 **유실 방지**(= 사용자가 지키려는 녹음을 시스템이 잃지 않는 것)다. `Discard` 는 **사용자가 명시적으로 버리는 행위**이므로 규칙이 막으려는 사건이 아니다 |
| 그래도 **위험은 남는가** | **남는다** — 되돌릴 수 없고 오조작이면 복구 불가다. ⭐ **`D4-17` 로 확인 다이얼로그를 둔다**(Figma 에 없으므로 최우선 규칙 2 의 예외 · design-agent 명세 · `AD-S4-4` 등록 대상). `N4-26` **해소** |
| **삭제 순서** | **서버 전이 확정 응답을 받은 뒤 로컬을 지운다.** 반대로 하면 전이가 실패했을 때 세션은 `recording` 에 남고 녹음만 사라진다. 오프라인이면 **`SessionOutbox` 에 폐기 전이를 넣고, 전송 확정 전까지 로컬 청크를 보존**한다 (`ARCHITECTURE §10.4`) |
| **QA 증거** | 폐기 **전/후 2시점**의 로컬 청크 수 + `UploadQueue` 항목 수 측정 (AC-4-113). ⭐ **확인 다이얼로그 경유**(AC-4-115) 와 **취소 경로**(AC-4-116)가 별도 AC 다 |

### 7.4 Contract 미결 (`C4-OPEN-*`)

| ID | 미결 | 왜 지금 결정해야 하는가 | 권장안 |
|---|---|---|---|
| `C4-OPEN-1` | `partNo ≤ 20` 상한이 현실적인가 | 30분 세션에서 인터럽션·크래시 재시작이 반복되면 part 가 20을 넘을 수 있다. 넘으면 **업로드 자체가 schema parse 로 막힌다** | **spike 결과로 확정** (§16 `S4-A` — ⭐ **`D4-1` 로 Web 전용 측정**). 넘칠 가능성이 있으면 상한을 올리거나 part 병합 규칙을 둔다 |
| `C4-OPEN-2` | `mimeType` 허용 집합 (`audio/webm`·`audio/mp4`·`audio/aac`·`audio/m4a`) | 플랫폼 실제 출력과 다르면 parse 실패 | **spike 결과로 확정** — ⭐ **`D4-1` 로 Stage 4 측정 대상은 Web 뿐**이다(데스크톱 Chrome/Safari/Firefox + iOS Safari 의 `MediaRecorder.isTypeSupported` 실측). ⚠️ **enum 을 Web 값으로 닫지 않는다** — 후속 단계의 네이티브 포맷(Capawesome=AAC, Cap-go=미명시)이 추가될 수 있다. 권장: **열거형 + 확장 주석**, 또는 Web 값만 넣고 후속 단계에서 추가하는 것을 Handoff 에 명시 |
| `C4-OPEN-3` | Prompt Drawer 최초 노출 기록(`session_prompts.shown_in='prompt_drawer'`) 을 Frontend 가 보내는가 | 보내야 한다면 **endpoint 가 하나 더 필요**하다 (현재 `API_CONTRACTS §4 Stage 4` 표에 없다) | **보내지 않는다** (RECOMMENDED) — 서버가 `prompts` 를 내려준 시점으로 충분하고, 추가 왕복은 "무음·무진동" 원칙과 맞지 않는다. Handoff 에 *"Drawer 노출 시각은 Frontend 가 보고하지 않는다"* 로 명시 |
| `C4-OPEN-4` | `GET /v1/children/:childId/sessions` 를 Stage 4 에서 Contract 로 만들 것인가 (화면 소비는 Stage 7/8) | Contract 는 화면보다 앞서도 된다(`D-18` 선례)지만, 쓰이지 않는 schema 는 drift 한다 | **만든다** (RECOMMENDED) — 세션 목록 없이는 **FR-21 세션별 녹음 삭제 대상 목록**(Stage 8)과 크래시 복구 시 "진행 중 세션 찾기" 를 표현할 수 없다. 단 **Mock fixture 는 최소**로 |
| `C4-OPEN-5` | `StickerType` enum 을 단일 값으로 만들 것인가 | 값이 하나면 enum 비용이 효용을 넘을 수 있다 | **만든다** (RECOMMENDED) — `DATA_MODEL` 이 컬럼으로 두고 있고 PRD §7.9 가 수집 요소 확장을 예고한다. enum 스냅샷 테스트에 1행 추가로 끝난다 |
| `C4-OPEN-6` | `SessionDetail` 에 `reflection?`·`sticker?` 를 **Stage 4 에서** 넣을 것인가 | `reflection` 은 Stage 5 소관 | **`sticker` 는 넣고 `reflection` 은 Stage 5 로** (RECOMMENDED) — 재진입 시 스티커 중복 표시 방지(FR-19)가 Stage 4 AC 라서 `sticker` 는 필요하다 |

### 7.5 `docs/API_CONTRACTS.md` 갱신 필요 지점 — **승인 후 plan-agent 가 수행**

> **소유 판단과 근거**: `rules/workflow.md` §5 는 *"`docs/API_CONTRACTS.md` 소유: **설계·계획 변경은 plan-agent**, 구현으로 확정된 contract 반영은 development-agent. 두 Agent 가 같은 Stage 단계에서 동시에 수정하지 않는다"* 라고 적는다 (**[직독]**). 따라서 아래는 **plan-agent 권한 안**이다.
> 그런데 **이번 작업의 산출물은 `docs/plans/stage-4-plan.md` 하나로 지정**됐고, Stage 3 선례(`stage-3-plan.md:953` 보고 ④)도 *"§2.2 표 갱신은 **Plan 승인 후** plan-agent 가 수행"* 이다. 그래서 **지금은 목록만 만들고 적용하지 않는다.**

| # | 갱신 대상 | 내용 |
|---|---|---|
| 1 | §2.2 enum 목록 | `PushPlatform` · (`C4-OPEN-5` 채택 시) `StickerType` 추가. **enum 총수 표기 정정** (P4-FIX-3) |
| 2 | §3.2 코드 스케치 | 실제 파일 경로(`sessions/create-session.ts`·`session.ts`·`transition.ts`)로 분할 반영, `SessionBubbleCopySchema` 를 **정의로 승격**, `readingContext` 의 nullable 범위를 `D-9` 결정으로 확정 |
| 3 | §3.3 코드 스케치 | `partNo` 상한(`C4-OPEN-1`)·`mimeType` 집합(`C4-OPEN-2`) 을 spike 결과로 확정 |
| 4 | §3 신규 절 | `RecordingStatus`(= `recordingApi.status` 응답) 가 §3 에 스케치가 **없다** → 추가 |
| 5 | §4 Stage 3 표 | 이월로 Stage 4 에서 처음 구현되는 `notification-preferences`·`push-devices` 에 *"구현 Stage = 4 (이월 `QA-3-001`)"* 표기 |
| 6 | §5.4 Scenario Catalogue | §8.3 의 **신규 key** 등재 — ⭐ **`web-background-warning` 은 `D4-4` 로 필수가 되었다**(AC-4-70·108). 나머지: `library:save-error` 류(메서드 단위 override) · `local-retention-exceeded`(`N4-09` 결정 시) · **인터럽션 3종 구분**(`D4-1`). ⚠️ **§5.4 가 scenario key 의 유일한 기준**이므로 Plan·Design Spec·QA 가 쓰기 전에 등재돼야 한다 |
| ~~7~~ | ~~§6 Gap 표~~ | ⛔ **무효 (2026-10-13)** — ~~`G-08` → `D4-6` Resolved · `G-09` → `D4-5`+`D4-7` Resolved~~. **13 · 13-b 로 대체** (`D4-12`·`D4-13`·`D4-14`) |
| 8 | §5.1.1 | `UploadTransport` 의 `uploadPart`/`resume`/`abort` 시그니처를 spike 결과로 구체화 |
| **9** ⭐ | §3.2 `StickerAward` | **`D4-2` 반영** — 표시 문구를 응답 값으로 받는 필드 확정, **`dayCount`/`streakDays` 비포함**을 명시 |
| **10** ⭐ | §5.1.1 `RecorderAdapter` | **`D4-1` 반영** — *"Stage 4 = interface + Web 구현. Native 구현은 분리된 후속 단계"* 를 명시. `PushPermissionPort`·`AuthGateway` 도 동일 문장 추가 |
| **11** ⭐ | §4 Stage 4 endpoint 표 | **`D4-1` 반영** — 네이티브 전용 요구(기기 토큰 등록의 ios/android 분기 등)에 *"후속 단계"* 주석. **endpoint 자체는 제거하지 않는다**(Contract 는 Backend 요구사항) |
| ~~**12**~~ ⭐ | ~~§6 `G-09` 인접~~ | ⛔ **무효 (2026-10-13)** — ~~*"녹음 폐기 전이·`completedReason` 신규 값을 추가하지 않는다"*~~ 는 `D4-7` 전제였다 → **13 으로 대체** |
| **13** ⭐ 2026-10-13 | **§6 `G-09`** | **Resolved 로 갱신.** `Discard`·`Submit` **둘 다 채택**(`D4-12`) + **전이 표현 = 안 A**(`D4-13`). §6 가 이미 적어 둔 *"완료 전 폐기 = `abandoned` + 로컬 삭제, 서버 업로드 없음"*(**[직독]** `:952`)이 **채택된 안과 같다**는 사실을 명시하고, 후보 열의 "예:" 표기를 **확정 서술로** 바꾼다 |
| **13-b** ⭐ 2026-10-13 | **§6 `G-08`** | ⛔ **종전 7번 항목을 뒤집는다.** **Resolved — Figma 채택**(`D4-14`): 세션 준비 버블이 **`139:2803` 그대로** Prompt pill 5개를 보여준다. 현재 계약 열의 *"PRD §7.5(자동 제시 금지) 기준 현 계약 유지"* 를 **교체**하고 **PRD 수정 대상 §0.7 (8~14)** 를 연결한다. ⚠️ `SessionSummary.bubble`(인사 문구)의 노출 지점은 **`N4-32`** |
| **14** ⭐ 2026-10-13 | **§3.1 전이표** | ⭐ **확정 (`D4-13`)** — `recording → abandoned` · `paused → abandoned` **2행 추가**(actor `caregiver`, modes `['recorded']`), **행 수 12 → 14**. **`AbandonedReason` enum 과 `abandonedReason?` 필드는 추가하지 않는다**(안 A′ 미채택). ✅ **§2.2 enum 표는 변경 없음** — enum 신규 0건이므로 |
| **15** ⭐ 2026-10-13 | **§5.1.1 `recordingApi`** | **폐기 시 업로드 중단 처리**를 명시 — **권장 ⓐ**(서버가 `abandoned` 전이를 받아 part 를 스스로 정리, Frontend 메서드 추가 없음). `abort()` 를 **추가하지 않는 이유**를 함께 적는다 |
| **16** ⭐ 2026-10-13 | **§5.4 Scenario Catalogue** | **`recording-discarded`** key 등재 (§8.3). ⭐ **`D4-13` 으로 선행 조건이 풀렸다** — Mock 이 보낼 `to` 값이 **`abandoned`** 로 확정됐다. 함께 등재: **폐기 전이 실패 분기**(로컬 보존 검증 — 공통 `RETRY` 로 덮을지 별도 key 로 둘지는 development-agent 판단) |
| **18** ⭐ 2026-10-13 | **§3.2 `SessionSummary.bubble`** | ⭐ **`D4-20`** — **렌더 지점을 명시**한다: *"`bubble` 은 ready 화면 버블(`139:2803`)의 **제목 줄**에 표시된다. pill 은 `prompts` 다. Frontend 는 문구를 생성·가공하지 않는다"* + **null/빈값 거동**(제목 줄 미렌더, pill 만 표시 — ⭐ **`D4-22`**: placeholder·빈 줄 0건, **Frontend fallback 0건**, 높이 **28px 단축**) + ⭐ **`D4-21` 길이 요구**(*"인사 문구는 **≤ 240px @ SF Pro Semibold 16 (≈28자)** 여야 한다. Frontend 는 **1줄 clamp** 로 표시하므로 상한을 넘기면 **잘린다**. **아이 이름을 문장 끝에 두지 않는다** — 잘릴 때 이름이 먼저 사라진다"*) 를 **Backend 요구사항으로 명시** 하고 `P4-BIP-11` 에 연결. ⚠️ **판정: 신규 contract 항목이 아니다** — `SessionSummary.bubble` · `SessionBubbleCopySchema` 는 **이미 §7.2 의 Stage 4 신규 파일 목록에 있다**(현재 `packages/contracts/src` 에 `bubble` **0건** — **[직독]**). `D4-20` 은 **필드의 노출 지점과 nullable 거동을 확정**하는 것이다 |
| **17** ⭐ 2026-10-13 | **§3.2 `SessionTransitionRequest`** | `to` 가 `'abandoned'` 를 **이미 포함**하므로 필드 변경은 없다. 다만 **주석을 보강**한다 — *"`abandoned` 는 ① ready 10분 클라이언트 타이머 ② 서버 sweeper ③ **사용자 `Discard`**(`D4-13`) 세 경로에서 온다. **사유를 구분하는 필드는 없다**"* |

> ⚠️ **이 목록은 `docs/API_CONTRACTS.md` 를 아직 수정하지 않는다** (Plan 미승인). 승인 후 plan-agent 가 **한 번에** 반영한다. ⭐ **2026-10-13 개정 2 집계**: 항목 **20건**(13-b·17·18 포함) 중 **무효 2건**(~~7~~·~~12~~) 제외 = **18건**.

---

## 8. Mock Scenarios

> **key 는 `API_CONTRACTS §5.4` Catalogue 만 사용한다.** 아래 "기존" 표의 key 는 **[직독]** 으로 §5.4 에 등재돼 있음을 확인했다. "신규 제안" 은 §7.5-6 으로 등재 후 사용한다.

### 8.1 공통 5종

| key | 적용 endpoint 그룹 | 검증 AC |
|---|---|---|
| `success` | sessions · recordings · notifications | AC-4-21 |
| `loading` | sessions · recordings | AC-4-22 |
| `empty` | sessions 목록 | AC-4-23 |
| `error` | sessions · recordings (code 지정) | AC-4-24 |
| `retry` | sessions · recordings | AC-4-25 |

### 8.2 HARU 특화 — 기존 등재 key (Stage 4 최초 사용)

| key | Mock 동작 | 검증 AC |
|---|---|---|
| **`recording-upload-success`** | init → part 전송 → complete → `uploadStatus=uploaded`, 세션 `analyzing` | AC-4-26 |
| **`recording-upload-failure`** | 업로드/complete 지속 실패 → 로컬 보관 유지·재시도 대기 | AC-4-27 |
| `upload-retry` | 1회 이상 실패 후 재시도 성공 | AC-4-28 |
| `upload-token-expired` | `UPLOAD_TOKEN_EXPIRED` → `refreshTokens` 후 성공 | AC-4-29 |
| `recording-incomplete` | complete 시 `RECORDING_INCOMPLETE` | AC-4-30 |
| `offline-queued` | 오프라인 녹음 완료 → 큐 대기 → 복구 후 업로드 | AC-4-31 · AC-4-66 |
| `upload-stalled-48h` | 48h 경과(clock 주입) → 안내 | AC-4-32 · AC-4-67 |
| `recording-deleted` | `RECORDING_DELETED` (upload-tokens 경로) | AC-4-33 |
| `invalid-transition` | `SESSION_INVALID_TRANSITION` → 서버(Mock) 상태 재동기화 | AC-4-34 · AC-4-13 |
| `session-already-active` | `POST /v1/sessions` → `SESSION_ALREADY_ACTIVE` | AC-4-35 |
| `onboarding-incomplete` | `ONBOARDING_INCOMPLETE` → Route Guard | AC-4-36 |
| `consent-missing` | `CONSENT_REQUIRED` + `Me.consentStatus.missing` 비어 있지 않음 | AC-4-37 · AC-4-62 |
| `mic-permission-denied` | `RecorderAdapter` mock 권한 거부 → 안내·대화만 하기 | AC-4-63 |
| `recording-interrupted` | 인터럽션 → 일시정지·재개 안내, 청크 보존. ⭐ **Web 3종으로 한정**(`D4-1`·`D4-4`): `visibilitychange`(탭 비활성) · `devicechange`(오디오 입력 변경) · `MediaStreamTrack.onended`(OS 가 마이크 회수 — iOS Safari 전화 수신 포함). ~~네이티브 전화·오디오 route~~ → 후속 단계 | AC-4-68 |
| `auto-timeout` | 누적 30분 도달 → `completed(auto_timeout)` (clock 주입) | AC-4-64 |
| `crash-recovered` | 미완료 로컬 녹음 발견 → `completed(recovered_after_crash)` → 업로드 | AC-4-65 |
| `abandoned` | ready 10분 경과 → `abandoned` | AC-4-69 |
| `offline` | Adapter 가 network error throw | AC-4-66 · AC-4-82 |
| `offline-cached-card` | **이월 `QA-3-002`** — offline + 최근 카드 캐시 존재 | AC-4-82 |
| `push-permission-denied` | **이월 `QA-3-001`** — platform mock 권한 거부 | AC-4-81 |

### 8.3 신규 제안 key (등재 필요 — §7.5-6)

| 제안 key | 왜 필요한가 | 라벨 |
|---|---|---|
| `library:save-error` 류 (그룹 안 **부분 실패**) | **[직독]** `stage-3-approvals.md` §30.7 — scenario key 가 **그룹 단위**라 `library:error` 가 `getOverview` 까지 실패시켜 "목록 성공 + 저장만 실패" 를 **실브라우저로 재현할 수 없다**. 같은 구조 문제가 Stage 4 에서 더 커진다(sessions 그룹 안에 create/transition/detail 3종) | **RECOMMENDED** — 그룹 안 **메서드 단위 override** 를 scenario 문법에 추가 |
| `web-background-warning` | ⭐ **`D4-4` 로 필수가 되었다.** Stage 4 는 "Web 백그라운드·탭 비활성 녹음 한계" 를 **판정 대상**으로 삼으므로(AC-4-70 · AC-4-108) 경고 UX 를 **결정적으로 재현할 시나리오가 반드시 있어야** 한다. 실제 탭 비활성은 e2e 에서 결정적이지 않으므로 **시나리오로 주입**한다 | **RECOMMENDED → 채택** (`D4-4` 귀결. `OAQ-10` 도 `D4-1` 로 해소) |
| `local-retention-exceeded` | `OAQ-11`(로컬 미업로드 보관 상한) 결정 시 그 경계 UX 를 재현 | **NEEDS DECISION 의존** (`OAQ-11` — §14.2 `N4-09`). 결정이 "상한 없음" 이면 **key 를 만들지 않는다** |
| `recording-interrupted` 하위 구분 | ⭐ **`D4-1`·`D4-4` 로 인터럽션 종류가 Web 3종으로 한정**됐다(§2.3): `visibilitychange` · `devicechange` · `MediaStreamTrack.onended`. 한 key 로 3종을 다 재현하면 **어느 경로가 깨졌는지 QA 가 구분할 수 없다** | **RECOMMENDED** — 기존 `recording-interrupted` key 에 **원인 파라미터**를 받거나 3개 key 로 분할. 어느 쪽이든 §5.4 등재 필요 |
| `sticker-already-awarded` | 재진입 시 스티커 중복 표시 없음(FR-19)을 **멱등 replay 로** 검증 | `API_CONTRACTS §5.4` 단서 *"출석 스티커 멱등성은 같은 요청 replay 테스트"* 가 **key 를 만들지 말라**고 적는다 → **key 를 만들지 않고 replay 테스트로** (CONFIRMED by §5.4) |
| **`recording-discarded`** ⭐ 신규 (`D4-12`) | **`Discard` 경로**를 결정적으로 재현한다 — ① 폐기 전이 **성공** ② **로컬 청크·`UploadQueue` 항목이 비는 것**을 2시점으로 측정 ③ **홈 복귀**. ⚠️ 함께 필요한 **실패 분기**: 폐기 전이가 **실패**했을 때 **로컬 녹음이 보존**되는지(§7.3-A ④ 삭제 순서) — AC-4-113 ②의 증거원이다. ⭐ **확인 다이얼로그 경유**(`D4-17`)이므로 시나리오는 **다이얼로그 확인 이후**부터 재현한다 | ⭐ **선행 해소 (2026-10-13, `D4-13`)** — Mock 이 보낼 값은 **`to: 'abandoned'`** 다(actor `caregiver`, modes `['recorded']`). **`recording-discarded` 를 §5.4 에 등재하고 `S4-C` 에서 구현한다.** 실패 분기는 공통 `RETRY` 로 덮을지 별도 key 로 둘지 development-agent 가 정한다 |

### 8.4 Mock 구현 규칙 (QA 증거 대상)

1. `MockSessionApi` 는 **contracts `canTransition()` 을 직접 호출**해 전이를 판정한다 — 전이표를 Mock 안에 베껴 쓰지 않는다.
2. `MockRecordingApi` + `MockUploadTransport` 는 `API_CONTRACTS §5.1.1` **명칭 그대로** (`RecordingUploadApi`·`MockRecordingUploadTransport` 등 변형 금지).
3. 모든 요청·응답을 contracts schema 로 **parse** 한다.
4. **결정적**이어야 한다 — 시간·ID는 주입된 `clock`/`idFactory` 를 쓴다 (**[직독]** `shared/lib/clock.ts`·`idFactory.ts` 존재).
5. **Idempotency-Key 를 보관·재생**한다 — `IDEMPOTENCY_KEY_REUSED` 포함. Stage 3 `QA-3-005` 가 *"받기만 하고 버린다"* 로 FAIL 됐던 항목이라 Stage 4 는 처음부터 지킨다.
6. Mock Data 를 Component/Page/Feature 에 **하드코딩하지 않는다** (grep 증거).

---

## 9. Frontend Scope (route / page / feature / entity)

> 상세 UI(치수·간격·색·배치·모션)는 **design-agent 가 Figma 실측으로 확정**한다 (§15).

### 9.1 Route

**[직독]** `PLANNING.md` §9.2 와 현재 `apps/web/src/app/router.tsx`(세션 route **0건**).

| path | Page | Layout | Stage 4 범위 |
|---|---|---|---|
| `/session/:sessionId` | `StorytimeSessionPage` | Fullscreen | ⭐ ready·recording·paused. **ready·recording 은 Figma 확정**(`285:1126` + `D4-12`·`D4-14`·`D4-17`~`D4-19`) · **`paused` 만 ⏳ `C13-14` 대기**(`N4-27`). 하단 = `Discard`/`Submit` **2개 고정**(상태 무관, ready 비활성) |
| `/session/:sessionId/permission` | `MicPermissionPage` | Fullscreen | ⭐ (`C13-5`, **design-agent 명세** — `D4-8`) — **route 로 둘지 in-page 상태로 둘지는 §14.2 `N4-18`** |
| `/session/:sessionId/complete` | `SessionCompletePage` | Fullscreen | ⭐ `29:62` **y 0~468 만** (닫기·제목·스티커·메달리온·버블). y **521~823** = Stage 5, 그 사이 **53px 빈 간격** → **AC-4-104** |
| `/session/:sessionId/reflection` | `ReflectionPage` | Fullscreen | ❌ **Stage 5** |
| `/session/:sessionId/feedback` | `ShortFeedbackPage` | — | ❌ **Stage 5** |
| `/` · `/library` · `/library/books/:bookId` | 기존 | Tab/Sheet | ⭐ **"Start Session" CTA 활성화**(`D-3` 해제) + 진행 중 세션 복귀(`session-already-active`) |
| `/settings/notifications` | — | — | ❌ **Out of Scope** (`D-18` 유지) |

### 9.2 Feature

| feature | 책임 | 비고 |
|---|---|---|
| `features/recording` | `RecordingController`(상태 머신) · `ConsentGate` · `PermissionService` · `LocalRecordingStore` · `SessionOutbox` · `UploadQueue` | **순수 TS 중심**, React 의존 최소. 테스트가 1급 산출물 |
| `features/storytime-session` | 상태별 컨트롤 조립(`Record`/`Pause` + **`Discard`/`Submit`** — `D4-12`) · **`Discard` 확인 다이얼로그**(`D4-17`) · 버블 표시 규칙(⭐ **ready `139:2803` = Prompt pill 5개** · 종료 `88:929`, **2회만** — `D4-14`) · 타이머 표시 · 10분/30분 안내 | `features/recording` 을 **직접 import 하지 않는다** (§5.2-4) |
| `features/prompt-drawer` | Drawer 열기/닫기 · 캐러셀 · 무음·무진동. ⭐ **`D4-14` 로 재정의**: 유일 경로가 **아니다** — ready 버블과 **같은 `prompts` 출처**를 쓰며 역할은 **녹음 중 재확인**이다 | `88:960` 실측 기반 (감사 §4) |
| `features/notification-preferences` | **이월** push 사전 안내 → 권한 요청 → 기기 등록 (**Web 한정** — `D-16`) | 설정 **폼은 제외** (`D-18`) |
| `features/activity-card-deck`(기존) | **이월 `QA-3-002`** 오프라인 캐시 + Offline Banner | 기존 feature 확장 |

### 9.3 Entity

| entity | 내용 |
|---|---|
| `entities/session` | `sessionKeys`(factory) · `useCreateSession` · `useSessionDetail` · `useSessionTransition` · 표시 전용 컴포넌트(`SessionBubble` 등) |
| `entities/recording` | `recordingKeys` · `useRecordingStatus` · `UploadStatusBadge` 소비 |

### 9.4 Platform Port / Adapter

> ⭐ **`D4-1`**: Stage 4 는 **Web 열과 Mock 열만** 구현한다. **Native 열은 비워 두되 interface 는 Stage 4 에서 세운다** — 그래야 후속 단계가 Adapter 추가만으로 끝난다 (§0.4 `R-02` 완화).

| Port | **Web (Stage 4)** | ~~Native~~ → 후속 §3.0 | **Mock (Stage 4)** |
|---|---|---|---|
| `RecorderAdapter` | `MediaRecorder` timeslice → OPFS + IndexedDB | `S4N-B` 플러그인 | 가짜 청크 + clock 주입 + 권한·인터럽션(Web 3종)·크래시 주입 |
| `PushPermissionPort` | `Notification.permission` / `requestPermission()` **까지만** (`D-16`) | `S4N-D` | `push-permission-denied` |
| `UploadTransport` | `MockUploadTransport` / `TusUploadTransport`(골격) | — | 성공·실패·지연·토큰 만료 주입 |
| `AuthGateway`(기존) | Web 구현(Stage 2 — **변경 없음**) | `S4N-C` | `MockAuthGateway` |
| network/appState port (⭐ 신규) | `navigator.onLine` + `online`/`offline` + **`visibilitychange`** + `devicechange` | Capacitor App/Network | 주입 |

### 9.5 ~~`apps/mobile` (Capacitor 셸)~~ → **후속 단계 `S4N-A`** (`D4-1`)

Stage 4 는 `apps/mobile` 을 **만들지 않는다.** 아래는 후속 단계용으로 **보존**하는 조사 결과다 — 다시 조사하지 않기 위해서다.

| 항목 | 내용 | 근거 |
|---|---|---|
| 생성 위치 | `apps/mobile` — `apps/web` **빌드 산출물**을 감싼다 | #5 · #7 · `ARCHITECTURE §1.1` |
| 플랫폼 | iOS · Android · **portrait lock** | #7 · #12 |
| 네이티브 권한·설정 | iOS `NSMicrophoneUsageDescription` + `UIBackgroundModes: audio` + `AVAudioSession` · Android `RECORD_AUDIO` + `FOREGROUND_SERVICE_MICROPHONE` + FGS type `microphone` + 상시 알림 | `stage-0-technical-research.md` §2c · §2d (출처 포함) |
| ⚠️ 쓰기 권한 (후속 단계에서 필요) | **`apps/mobile/**` 는 `apps/**` 하위라서 `write_guard.py` 가 `development-agent` 에게만 허용한다.** `apps/api`·`supabase` 처럼 전면 차단되는 경로가 **아니다** — **[직독]** `.claude/hooks/write_guard.py` (`under("apps/api") or under("supabase")` → 전원 deny / `under("apps") or under("packages")` → `agent_type != 'development-agent'` 일 때만 deny). 즉 **`subagent_type: development-agent` 로 호출하면 생성 가능**하다 (초판 `R4-07`) |
| **Stage 4 에서의 의미** | ⭐ **반대로 `apps/mobile` 부재가 Stage 4 Exit Criteria 가 된다** (Stage 1 선례 `PLANNING.md:196`). AC-4-01 에 포함 |

---

## 10. Backend Integration Requirements

> 여기 있는 것은 **구현 계획이 아니라 기대 동작**이다. 전부 `BACKEND_INTEGRATION_PENDING` 후보이며 Stage 8 Handoff 문서로 넘어간다.

| ID | 기대 동작 (Contract 로 표현되는 것) | Handoff 문서 | Stage 4 Frontend 가 대신 하는 것 |
|---|---|---|---|
| `P4-BIP-01` | `POST /v1/sessions/:id/transitions` 가 **서버에서 전이를 강제**한다 (허용 외 전이 → `SESSION_INVALID_TRANSITION`) | `BACKEND_HANDOFF` · `ERROR_CODES` | Mock 이 `canTransition()` 으로 재현 |
| `P4-BIP-02` | **녹음 시작·업로드 확정·분석 요청 시 서버 측 보호자 동의 강제** + `consent_event_id` 고정 | `AUTH_REQUIREMENTS` · `DATA_REQUIREMENTS` | `ConsentGate` 가 **클라이언트 차단**만 |
| `P4-BIP-03` | 30분 상한 **서버 검증** (`SESSION_MAX_DURATION_EXCEEDED`) | `RECORDING_UPLOAD_SPEC` | 클라이언트 타이머(실제 녹음 시간 기준) |
| `P4-BIP-04` | `ready` 10분 방치 **server sweeper** → `abandoned` | `BACKEND_HANDOFF` | 클라이언트 타이머 |
| `P4-BIP-05` | **signed upload token 발급**(경로 고정·짧은 만료, Supabase 최대 24h) + 재발급 | `RECORDING_UPLOAD_SPEC` | Mock 토큰·만료 주입 |
| `P4-BIP-06` | **resumable(TUS) 수신** + part 검증(bytes·sha256·duration) → `RECORDING_INCOMPLETE` | `RECORDING_UPLOAD_SPEC` | `MockUploadTransport` 가 전송을 흉내 |
| `P4-BIP-07` | `complete` 확정 시 **`completed → analyzing`** 전이와 `expiresAt`(= uploaded_at + 90d) 반환 | `RECORDING_UPLOAD_SPEC` · `DATA_REQUIREMENTS` | Mock 응답 |
| `P4-BIP-08` | **Raw Audio 90일 자동 삭제** — Storage API 로 **객체까지** 삭제 (DB row 만 삭제 금지) | `DATA_REQUIREMENTS` | `expiresAt` **표시**만 |
| `P4-BIP-09` | 업로드 실패 **48h 경과 push 발송** | `BACKEND_HANDOFF` | **로컬 안내**만 (Frontend 가 판정) |
| `P4-BIP-10` | **출석 스티커 멱등 지급** (`session_id UNIQUE`) | `DATA_REQUIREMENTS` | 같은 요청 replay = 같은 응답 (Mock) |
| `P4-BIP-11` | **검수 템플릿 버블 생성** + 안전 슬롯(아이 이름·책 제목) + 금지어 검증 + fallback. ⭐ **2026-10-13 보강 (`D4-21`·`D4-22`)**: ① 세션 시작 인사는 **≤ 240px @ SF Pro Semibold 16 (≈28자)** — Frontend 가 **1줄 clamp** 로 표시하므로 상한을 넘기면 **잘린다** ② **아이 이름을 문장 끝에 두지 않는다** (잘릴 때 이름이 먼저 사라진다) ③ **인사 fallback 은 Backend 책임** — Frontend 는 대체 문구를 만들지 않고 `bubble` 이 null/빈값이면 **제목 줄을 렌더하지 않는다** (`D4-22`) | `ANALYSIS_PIPELINE_REQUIREMENTS` | 응답 값만 표시 |
| `P4-BIP-12` | 분석 Job 연결 (`analysis_jobs` 멱등·재시도) | `ANALYSIS_PIPELINE_REQUIREMENTS` | 전이 결과만 관찰 |
| `P4-BIP-13` | **push 발송**(provider 선정 후) · 기기 토큰 등록·폐기 — ⭐ **`D4-1` 로 재범위**: Stage 4 Frontend 가 대신 하는 것은 **Web 권한·등록 UX + Mock 뿐**이다. **네이티브 토큰 등록 UX 는 후속 단계(`S4N-D`)**. ⚠️ Contract(`push_devices.platform` = `ios`/`android`/`web`)는 **3값 그대로 유지**한다 — Backend 요구사항이므로 Frontend 단계 분리와 무관 | `BACKEND_HANDOFF` | **Web** 권한·등록 UX + Mock |
| `P4-BIP-14` | **오프라인 outbox 재전송의 서버 측 순서 적용** — `occurred_at` 기준 | `BACKEND_HANDOFF` · `DATA_REQUIREMENTS` | Idempotency-Key + `occurredAt` 전송 |
| `P4-BIP-15` | 세션별 녹음 삭제 시 **Storage 객체 + parts 삭제 + audit** | `DATA_REQUIREMENTS` | 로컬 삭제만 |
| `P4-BIP-16` | `conversation_only` 세션에 `ANALYSIS_NOT_AVAILABLE` 로 응답 | `ERROR_CODES` | Mock (표시는 Stage 5) |
| `P4-BIP-17` | **이월 `P3-BIP-19`** 상용 그림책 표지 교체 — **법무 확인 필요**, Stage 8 게이트 | `BACKEND_HANDOFF` | Stage 4 는 파이프라인만 (§2.4) |
| **`P4-BIP-18`** ⭐ 신규 | **출석 스티커 표시 문구를 서버가 제공한다** — `stickerAward` 응답에 제목·부제 문구(또는 문구 키)를 담는다. **streak·`Day N` 언어를 쓰지 않는다**(`D-6`·PRD §7.4). 목적: **운영이 문구를 바꿀 때 Frontend 배포가 필요 없게** 하고, Contract 를 streak 중립으로 유지하는 것 | `BACKEND_HANDOFF` · `DATA_REQUIREMENTS` | Mock 이 문구를 응답으로 내려주고 Frontend 는 **표시만** (AC-4-59 · AC-4-107) |

### 10.1 `BACKEND_INTEGRATION_PENDING` 재집계

| 구분 | 수 |
|---|---|
| 초판 | **17** (`P4-BIP-01`~`17`) |
| **개정** | **18** |
| 신규 | **1** — `P4-BIP-18` (`D4-2` 귀결) |
| 재범위 | **1** — `P4-BIP-13` (네이티브 토큰 등록 UX 를 후속 단계로, Contract 3값은 유지) |
| 삭제 | **0** — ⚠️ **네이티브 분리는 BIP 를 줄이지 않는다.** `D4-1` 이 옮긴 것은 **Frontend 작업**이고, BIP 는 *"Backend 가 충족해야 할 기대 동작"* 이라 Frontend 가 Web 이든 네이티브든 변하지 않는다 |

> ⚠️ **후속 단계로 간 항목을 `BACKEND_INTEGRATION_PENDING` 으로 적지 않는다.** `rules/qa.md` §1 의 PENDING 조건은 *"요구사항 충족에 **실제 Backend 구현**이 필요해 Frontend 단계에서 검증할 수 없는 부분"* 이다. `apps/mobile`·네이티브 Adapter 는 **Frontend 작업**이므로 PENDING 이 아니라 **Out of Scope(후속 단계)** 다 — 이 구분이 흐려지면 Stage 8 Handoff 에 네이티브 작업이 Backend 요구로 섞여 들어간다.

---

## 11. Acceptance Criteria

> **각 AC 는 QA 가 측정 가능해야 한다.** "증거" 열에 **무엇을 어떻게 재는지**를 적었다 — *"실측했다"* 는 서술은 증거가 아니다 (`rules/frontend.md` §6-2 ⑤).
> `PENDING?` 열의 ✅ = **`BACKEND_INTEGRATION_PENDING` 예상**, ⚠️ = 기기·환경 부재 시 **`NOT VERIFIED` 예상**.

### 11.1 Scope 준수 (AC-4-01 ~ 04)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-01 | `apps/api/`·`supabase/` **그리고 `apps/mobile/`** 가 **존재하지 않는다** — ⭐ **`D4-1` 로 `apps/mobile` 부재가 Stage 4 Exit 조건에 추가**됐다 (Stage 1 선례 `PLANNING.md:196`) | `ls` + `git status` 파일 목록 | — |
| AC-4-02 | Stage 5 이후 기능이 구현되지 않았다 — `91:691` 회고 카드 · 분석 상태 UX · `/session/:id/reflection`·`/feedback` route · `/settings/notifications` 화면 **0건** | route 표 + grep + 화면 확인 | — |
| AC-4-03 | `packages/contracts` 밖에 Request/Response/Enum/ErrorCode/전이표 **중복 선언 0건** | grep (`SessionStatus`·`UploadStatus`·`canTransition` 등) | — |
| ~~AC-4-04~~ | ⛔ **이동 → 후속 단계 `S4N-A`** (`D4-1`). 내용: *"`apps/mobile` 이 `apps/web` 소스를 import 하지 않는다(빌드 산출물만)"*. **Stage 4 판정 대상 아님** — `apps/mobile` 이 존재하지 않으므로 검증할 대상이 없다. Stage 4 는 **AC-4-01 의 부재 증거**로 대체한다 | — | **이동** |

### 11.2 Contracts (AC-4-05 ~ 20)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-05 | `sessions/` 4파일 · `recordings/` 2파일 · `notifications/` 2파일이 생기고 `index.ts` 가 **전부 re-export** 한다 | 파일 목록 + import 테스트 | — |
| AC-4-06 | `SessionStatus`·`SessionMode`·`CompletedReason`·`AnalysisOutcome`·`UploadStatus` 에 **값 추가 0건** | enum 스냅샷 테스트 diff | — |
| AC-4-07 **(수정 — `D4-13`)** | ⭐ **`SESSION_TRANSITIONS` 행 수가 `12 → 14`** 이고, 추가된 2행이 **`{recording → abandoned, caregiver, ['recorded']}`·`{paused → abandoned, caregiver, ['recorded']}` 정확히 그것뿐**이다. 다른 행은 **문자 단위로 불변**이며 `canTransition()` 로직은 **수정되지 않았다** | 스냅샷 테스트 diff(14행 전수) + `git diff` 로 **승인 범위 외 변경 0건** 증명 | — |
| AC-4-08 | **신규 Error Code 0건** (29종 유지). 추가가 있었다면 `docs/API_CONTRACTS.md` §1.2 갱신이 **같은 커밋**에 있다 | `ERROR_CODES` 스냅샷 + 문서 diff | — |
| AC-4-09 | `CreateSessionRequest` 가 **recorded 세션에서 책 없음을 거부**한다 (`bookId`·`childBookId` 둘 다 null) | 단위 테스트 (양·음 케이스) | — |
| AC-4-10 | `CreateSessionRequest` 가 `custom_time` 일 때 `customTime` 필수 규칙을 **`createCustomTimeRefine()` 재사용**으로 적용한다 (조건문 복제 0건) | 단위 테스트 + grep | — |
| AC-4-11 | `SessionTransitionRequest.to` 가 **클라이언트 요청 가능한 4값**(`recording`·`paused`·`completed`·`abandoned`)만 허용한다 | 단위 테스트 (`analyzing` 거부) | — |
| AC-4-12 | `to='completed'` 인데 `completedReason` 이 없으면 **parse 실패**한다 | 단위 테스트 | — |
| AC-4-13 | `recordedSeconds > MAX_RECORDED_SECONDS` 는 **parse 실패**한다 | 단위 테스트 (1800 통과 / 1801 실패) | — |
| AC-4-14 | `canTransition()` 이 `conversation_only` 의 `completed → analyzing` 을 **거부**한다 | 단위 테스트 | — |
| AC-4-15 **(수정)** | `RecordingUploadInitRequest` 가 `partNo`·`mimeType`·`bytes` 상한을 적용하고, 확정된 집합(§7.4 `C4-OPEN-1`·`2`)과 **일치**한다. ⭐ **`D4-1` 로 집합의 근거가 Web 실측으로 한정**된다 — spike 산출물에 **측정한 브라우저·버전·`isTypeSupported` 결과**가 적혀 있어야 하고, **네이티브 포맷 추가 가능성이 주석으로 남아** 있어야 한다 | 단위 테스트 + spike 결론 참조(브라우저·버전 명시) | — |
| AC-4-16 | `RecordingUploadCompleteRequest.parts[].sha256` 가 `^[a-f0-9]{64}$` 를 강제한다 | 단위 테스트 | — |
| AC-4-17 | `RecordingUploadCompleteResponse` 가 `uploadStatus='uploaded'` 와 `expiresAt` 을 **반드시** 포함한다 | 단위 테스트 | — |
| AC-4-18 | `PushDevice` 응답에 **`token` 필드가 없다** | 단위 테스트 (schema key 집합) | — |
| AC-4-19 | `PushPlatform` enum 이 `ios`·`android`·`web` 3값이고 enum 스냅샷에 등재된다 | 스냅샷 테스트 | — |
| AC-4-20 | 클라이언트 전용 상태(`local_only`·`queued`·`uploading`·`failed_retrying`·`stalled_48h`, 마이크 권한 상태, `RecordingController` client-only 상태)가 **contracts 에 없다** | grep `packages/contracts` | — |

### 11.3 Mock (AC-4-21 ~ 37)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-21 | `success` — sessions·recordings·notifications 전 메서드 응답이 contracts parse 통과 | Mock 테스트 | — |
| AC-4-22 | `loading` — 지연이 걸리고 화면에 Loading/버튼 loading 이 나타난다 | 컴포넌트/e2e | — |
| AC-4-23 | `empty` — 세션 목록 `items: []` 에서 EmptyState 가 나타난다 | 컴포넌트 | — |
| AC-4-24 | `error` — contracts Error Envelope 와 **지정 code** 를 반환하고 ErrorState/InlineAlert 가 나타난다 | Mock 테스트 + 화면 | — |
| AC-4-25 | `retry` — 첫 요청 실패 → 재시도 성공, **입력·녹음 상태가 보존**된다 | e2e | — |
| AC-4-26 | `recording-upload-success` — init → part 전송 → complete 후 `uploadStatus=uploaded` **그리고 세션이 `analyzing`** | Mock 테스트 + 상태 관찰 | — |
| AC-4-27 | `recording-upload-failure` — 지속 실패 상태에서 **로컬 파일이 남아 있다** (파일 수 측정) | 단위 테스트(스토어 조회) | — |
| AC-4-28 | `upload-retry` — n회 실패 후 성공, **part 재전송이 중복 업로드를 만들지 않는다** | Mock 요청 로그 | — |
| AC-4-29 | `upload-token-expired` — `UPLOAD_TOKEN_EXPIRED` → `refreshTokens` 호출 → 성공 (호출 순서 로그) | Mock 요청 로그 | — |
| AC-4-30 | `recording-incomplete` — complete 가 `RECORDING_INCOMPLETE` 를 반환하고 화면이 재시도를 안내한다 | Mock + 화면 | — |
| AC-4-31 | `offline-queued` — 오프라인에서 녹음 완료 → 큐 대기 → online 전환 시 **자동 재개**(폴링·수동 버튼 없이) | e2e + 요청 로그 | — |
| AC-4-32 | `upload-stalled-48h` — 주입된 clock 으로 48h 경과 시 **안내가 1회 나타난다** | 단위 + 화면 | — |
| AC-4-33 | `recording-deleted` — `refreshTokens` 가 `RECORDING_DELETED` 를 반환하면 **큐가 그 항목을 포기하고 로컬 파일을 정리**한다 | 단위 테스트 | — |
| AC-4-34 | `invalid-transition` — Mock 이 `SESSION_INVALID_TRANSITION`(`details: {from,to}`) 을 반환하고 클라이언트가 **서버 상태로 재동기화**한다 | Mock + 상태 관찰 | — |
| AC-4-35 | `session-already-active` — `POST /v1/sessions` 가 `SESSION_ALREADY_ACTIVE` 를 반환하고 **진행 중 세션으로 복귀**하는 경로가 있다 | e2e | — |
| AC-4-36 | `onboarding-incomplete` — 세션 endpoint 가 `ONBOARDING_INCOMPLETE`, Route Guard 가 `/onboarding/:step` 으로 보낸다 | e2e | — |
| AC-4-37 | Mock 이 **Idempotency-Key 를 보관·재생**하고 다른 body 로 같은 key 사용 시 `IDEMPOTENCY_KEY_REUSED` 를 반환한다 (Stage 3 `QA-3-005` 재발 방지) | Mock 테스트 | — |

### 11.4 세션 화면 · RecordingController (AC-4-38 ~ 56)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-38 | Home 덱 / 서재 시트의 **"Start Session" 이 활성**이고 누르면 `POST /v1/sessions` 가 **1회** 발생한다 (`D-3` 해제) | e2e + 요청 로그 | — |
| AC-4-39 | `POST /v1/sessions` 성공 후 `/session/:sessionId` 로 이동하고 **ready 화면**이 나타난다 | e2e | — |
| AC-4-40 **(재수정 — `D4-14`)** | ⭐ **ready 버블 = Figma `139:2803` 그대로다** — ① `Try this prompt !` 제목 줄 + **Prompt pill 5개** 구조가 렌더되고 ② pill 본문이 **Mock 응답 `prompts` 값과 글자 단위로 같다**(Frontend 생성·가공 0) ③ `D-21`(개수 상한 없음) 과 맞물려 **n ≠ 5 일 때의 버블 높이 정책**이 적용된다(`S4F-01`) ④ pill 본문 2줄 처리 규칙이 적용된다(`S4F-02`) ⑤ **`88:757` 로 교체하지 않았다** — ~~`AD-S4-3`~~ 무효. ⚠️ 제목 줄의 출처(서버 `bubble` ↔ copy 모듈)는 **`N4-32` 결정에 따른다** | 텍스트 비교 테스트 + DOM 구조 비교(pill 개수·기하) + grep(하드코딩 0건) + n=1/3/7 가변 케이스 | — |
| AC-4-41 **(수정)** | 녹음 버튼(Record Control `Record`) 탭 → `recording` 전이 요청이 발생하고, **Record Control 이 `Pause` 변형으로** 바뀌며 **하단 버튼 라벨이 `Submit` 이 된다** (`D4-5`). ⚠️ ~~"Done Reading" 로 전환~~ — **그 라벨은 Figma 에 없고 만들지 않는다**(감사 §6 질문 3 의 3중 확인) | e2e + 요청 로그 + **라벨 문자열 단정**(`Submit`) + grep(`Done Reading` **0건**) | — |
| AC-4-42 | `recording` 중 **Pause → `paused`**, **Resume → `recording`** 전이가 발생하고 각 전이가 요청 1건을 만든다 | e2e + 요청 로그 | — |
| AC-4-43 | `paused` 동안 **경과 타이머가 증가하지 않는다** (실제 녹음 시간 기준 — #17-②) | 주입 clock 단위 테스트 (pause 60s 후 `recordedSeconds` 불변) | — |
| AC-4-44 | 누적 `recordedSeconds` 가 **1800 에 도달하면** 자동으로 `completed(auto_timeout)` 전이가 발생한다 | 주입 clock 단위 테스트 | — |
| AC-4-45 | 자동 종료 시 **그때까지의 로컬 녹음이 보존**된다 (파일 수·총 바이트 측정) | 단위 테스트 | — |
| AC-4-46 | `ready` 에서 **10분(600s) 경과 시 `abandoned`** 전이가 발생하고, 그 전에 **리마인드 버블이 정확히 1회** 표시된다 | 주입 clock 단위 + 렌더 횟수 측정 | — |
| AC-4-47 | `RecordingController` 가 **React 를 import 하지 않는다**(순수 TS) | grep + 단위 테스트가 React 없이 돈다 | — |
| AC-4-48 | `RecorderAdapter` 를 mock 한 **상태 머신 테스트**가 전이 전수(허용 12 + 거부 샘플)를 덮는다 | 테스트 목록 + 커버리지 | — |
| AC-4-49 | 허용되지 않은 전이를 클라이언트가 시도하면 **요청 전에 막히거나**, 요청 시 Mock 의 `SESSION_INVALID_TRANSITION` 으로 귀결된다 (둘 중 어느 쪽인지 코드로 결정돼 있다) | 단위 테스트 | — |
| AC-4-50 **(수정)** | **녹음 시작 지연 ≤ 1s** — 버튼 탭 → 첫 청크 수신까지, **동일 기기 5회 중위값**. ⭐ **`D4-1`·`D4-4` 로 측정 대상 = Web**: 데스크톱 Chrome · 데스크톱 Safari · **iOS Safari 실기기**(기기 있음). ~~네이티브~~ → 후속 `S4N-B`. **Android 모바일 Web 은 기기 부재** → `NOT VERIFIED`(`N4-21`) | 계측 스크립트 로그 (브라우저·기기·회차 명시) | ⚠️ **Android 모바일 Web만** |
| AC-4-51 | 버블 등장·상태 전환 **≤ 1s** (로컬 전환 기준, 네트워크 제외) | 계측 | — |
| AC-4-52 | 캐릭터 버블이 **시작·종료 2회만** 나타난다 — `recording`·`paused` 동안 버블 렌더 0건 (PRD §7.5 *"녹음 중 개입 없음"*. ⚠️ 감사 `PF-02`: Figma 프레임 이름이 `Ready / **Recording**` 인데 버블이 배치돼 있었다 — **`D4-6` 으로 ready 전용임을 확정**) | 렌더 로그/스냅샷 | — |
| AC-4-53 **(재수정 — `D4-14`)** | **Prompt Drawer 트리거**가 세션 화면에 있고(⏳ `C13-4`·`N4-28`), 열면 `SessionSummary.prompts` 가 **서버 순서대로** 표시된다. ⭐ **`D4-14` 반영**: Drawer 는 **Prompt 의 유일한 경로가 아니다** — ready 버블이 같은 `prompts` 를 보여준다. 따라서 *"닫힌 상태 DOM 에 Prompt 본문 0건"* 요구는 **폐기**하고, 대신 **① ready 버블과 Drawer 가 같은 출처(`prompts`)를 쓴다**(두 곳에 각각 하드코딩 0건) **② 녹음 중 재확인 경로가 동작한다**(PRD §7.5) 를 요구한다 | e2e + 순서 비교 + **출처 동일성 테스트**(같은 fixture → 두 표시 지점의 텍스트 일치) | — |
| AC-4-54 | Drawer 의 각 Prompt 아래 **코칭 노트가 `Prompt.coachingNote` 값**으로 표시된다 (신규 필드 0건) | 텍스트 비교 + schema 확인 | — |
| AC-4-55 | Drawer 가 **무음·무진동**이다 — 오디오 재생·`navigator.vibrate` 호출 0건 | grep + 런타임 스파이 | — |
| AC-4-56 | Drawer 가 키보드로 **열기·이동·닫기** 가능하고 **초기 포커스·포커스 트랩·복귀**가 동작한다 | 키보드 e2e | — |

### 11.5 완료 화면 · 스티커 (AC-4-57 ~ 61)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-57 **(수정)** | **`Submit`**(`recording` 상태 하단 버튼 — `D4-5`) → `completed(user_done)` 전이 후 `/session/:sessionId/complete` 로 이동한다. ⚠️ ~~"Done Reading"~~ | e2e + 전이 요청 body(`completedReason: 'user_done'`) | — |
| AC-4-58 | 완료 화면의 **종료 버블 문구가 응답 `completionBubble` 값과 같다**. ⚠️ **레이어 이름을 기대값으로 쓰지 않는다** — `88:929` 의 Figma 레이어 이름은 컴포넌트 기본값(`Ready for today's story with Emma?`)이고 **실제 override 문자열은 `Storytime success! Emma did wonderfully.`** 다 (감사 §3.5). 기대값은 **Mock 응답**이다 | 텍스트 비교 (Mock 응답 ↔ DOM) | — |
| AC-4-59 **(수정)** | 응답 `stickerAward` 가 있을 때만 `AttendanceStickerChip` 이 나타나고, **문구는 응답에서만** 온다. ⭐ **`D4-2` 반영**: **`streak`·`Day N` 표현을 쓰지 않는다** — Figma `29:85` `Day 12 · keep the streak going` 미채택. 대체 문구는 **design-agent 제안 + 사용자 승인**을 거친 것이어야 한다 | 화면 + grep(`streak` **0건**, `Day \d` **0건**) + 승인 기록 참조 (AC-4-107 과 교차) | — |
| AC-4-60 | **같은 전이를 같은 Idempotency-Key 로 재요청하면 같은 응답**이고 스티커가 **중복 표시되지 않는다** (재진입 시나리오) | replay 테스트 + 화면 | — |
| AC-4-61 **(수정)** | 완료 화면이 **Stage 5 회고 카드(`91:691`)를 렌더하지 않는다** — 의도적 미구현임이 QA 리포트에 기록된다. ⭐ **경계를 실측값으로 고정**: Stage 4 = `29:62` 의 **y 0~468**(버블 bottom), Stage 5 = **y 521~823**, 그 사이 **53px 는 Figma 자체의 빈 간격**이다 `[계산, 감사 §3.6]`. 빈 영역 처리는 **AC-4-104** | 화면 + Plan §3.1 참조 + **y 468 아래 렌더 요소 목록**(배경 외 0건) | — |

### 11.6 PRD §13 예외 처리 (AC-4-62 ~ 72)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-62 | **동의 없음(`consent-missing`)에서 녹음 시작 UI 가 차단**된다 — 버튼이 눌리지 않고, `recording` 전이 요청이 **0건** | e2e + 요청 로그 (요청 0건이 증거) | — |
| AC-4-63 | **마이크 권한 거부** → 이유 안내 + **설정 딥링크** + **"대화만 하기"** 버튼이 나타나고, 후자를 누르면 `mode=conversation_only` 세션으로 진행된다 | e2e + 요청 body 확인 | — |
| AC-4-64 | `auto-timeout` 시나리오에서 **자동 종료 안내**가 표시되고 완료 화면으로 넘어간다 | e2e | — |
| AC-4-65 | **크래시 복구** — 미완료 로컬 레코드가 있는 상태로 앱을 다시 띄우면 복구 안내가 나타나고 `completed(recovered_after_crash)` 전이 + 업로드가 진행된다 | 저장소 선주입 e2e/단위 | — |
| AC-4-66 | **오프라인 녹음** — `offline` 에서 녹음이 시작·완료되고 전이 이벤트가 **outbox 에 적재**되며, online 복귀 시 **순서대로 재전송**된다 | 요청 로그 순서 비교 | — |
| AC-4-67 | **48h 경과 안내** — 주입 clock 으로 48h 를 넘기면 안내가 나타나고, 그 전에는 나타나지 않는다 (경계 양쪽 측정) | 단위 + 화면 | — |
| AC-4-68 **(수정)** | **인터럽션 발생 시** 일시정지·재개 안내가 나오고 **로컬 청크가 유실되지 않는다**. ⭐ **`D4-1`·`D4-4` 로 Web 3종으로 한정**: ① `visibilitychange`(탭 비활성) ② `devicechange`(오디오 입력 변경) ③ `MediaStreamTrack.onended`(OS 가 마이크 회수 — iOS Safari 전화 수신 포함). **3종 각각** 판정한다. ~~네이티브 `call`·`route_change` 실기기~~ → 후속 `S4N-B` | 어댑터 이벤트 주입(3종 각각) + 파일 수 측정 + **iOS Safari 실기기에서 ③ 1회 수동 확인** | — (실기기 iOS 있음) |
| AC-4-69 | `abandoned` 이후 **언제든 새 세션을 시작할 수 있다** (재시작 = 새 세션) | e2e | — |
| AC-4-70 **(수정)** | **Web 백그라운드·탭 비활성·화면 잠금에서 녹음이 보장되지 않는다는 사실이 사용자에게 안내**된다. ⭐ **`D4-4` 로 필수 판정 항목으로 승격**(초판은 `OAQ-10` 의존 → **`D4-1` 이 "Stage 4 = Web 녹음까지" 로 확정했으므로 `OAQ-10` ⓐ(foreground 허용 + 경고)가 전제**다). 안내 문구·시점·형태는 **design-agent 명세**(`D4-8` 안내 UI) | 화면 + `web-background-warning` 시나리오 e2e + 결정 참조 | — (더 이상 의존 없음) |
| AC-4-71 | **확정 응답 전 로컬 파일이 삭제되지 않는다** — complete 응답 **직전**과 **직후** 파일 수를 각각 측정해 `직전 > 0`, `직후 = 0` | 단위 테스트(두 시점 측정) | — |
| AC-4-72 | 세션 녹음 삭제·로그아웃 시 **로컬 녹음·캐시가 정리**된다 — `performSessionCleanup` 확장이 `LocalRecordingStore.clear()` 를 포함한다 | 단위 테스트 + 저장소 조회 | — |

### 11.7 ~~Capacitor 셸 · 네이티브~~ → **전체 이동 (AC-4-73 ~ 80, 8건)** — `D4-1`

> ⛔ **이 8건은 Stage 4 판정 대상이 아니다.** 후속 단계(§3.0)로 이동한다. **번호를 재부여하지 않는다** — Stage 3 에서 AC 폐기 표기를 누락해 QA 가 막힌 전례(`QA-3-010`)를 되풀이하지 않기 위해, 원문과 이동 대상 단위를 **그대로 남긴다.**
> stage-qa-agent 는 이 8건에 대해 **판정을 내리지 않고 "이동(Out of Scope, `D4-1`)" 으로 기록**한다.

| ID | 원 요구사항 | 이동 대상 | 이동 사유 |
|---|---|---|---|
| ~~AC-4-73~~ | `apps/mobile` 이 생성되고 iOS·Android 프로젝트가 동기화된다 (`cap sync` 성공) | **`S4N-A`** | `D4-1` — `apps/mobile` 을 Stage 4 에서 만들지 않는다 |
| ~~AC-4-74~~ | `apps/mobile` 이 `apps/web` 빌드 산출물을 webDir 로 쓴다 | **`S4N-A`** | 동 |
| ~~AC-4-75~~ | **portrait lock** 이 iOS·Android 설정에 적용돼 있다 (#12) | **`S4N-A`** | 동. ⚠️ #12 의 **웹 쪽 규칙(앱 컬럼 480)은 Stage 4 In Scope** — AC-4-99 가 담당 |
| ~~AC-4-76~~ | iOS `NSMicrophoneUsageDescription`·`UIBackgroundModes: audio`, Android `RECORD_AUDIO`·`FOREGROUND_SERVICE_MICROPHONE`·FGS `microphone` 선언 | **`S4N-A`** | 동 |
| ~~AC-4-77~~ | `NativeRecorderAdapter` 가 `RecorderAdapter` interface 를 그대로 구현하고 선택 지점이 `app/providers` 한 곳이다 | **`S4N-B`** | `D4-1`. ⚠️ **"선택 지점 1곳" 규칙 자체는 Stage 4 에서 지킨다** (§5.2-2) — Web|Mock 2종으로 검증 |
| ~~AC-4-78~~ | 네이티브 Apple/Google Auth Adapter 가 `AuthGateway` 를 구현한다 | **`S4N-C`** | `D4-1` → FR-01 이 Stage 4 In Scope 에서 제외됨 |
| ~~AC-4-79~~ | 네이티브 Push Adapter 가 `PushPermissionPort` 를 구현한다 | **`S4N-D`** | `D4-1`. ⚠️ **`PushPermissionPort` + Web 구현은 Stage 4 In Scope** — AC-4-81 이 담당 |
| ~~AC-4-80~~ | 백그라운드·화면 잠금 녹음 유지가 iOS·Android 실기기에서 확인된다 | **`S4N-B`** | `D4-1`·`D4-4`. ⚠️ **Web 의 같은 상황은 Stage 4 에서 판정한다** — AC-4-70(안내) · **AC-4-108(측정)** |

> ⭐ **`D4-4` 가 없애 준 것**: 초판은 이 절에서 `NOT VERIFIED` 를 **4건**(네이티브 녹음 시작 지연 · 인터럽션 · portrait 회전 · 백그라운드 유지) 예상했고, `rules/qa.md` §2 상 `NOT VERIFIED` 1건 이상은 **`INCOMPLETE`** 다 — 즉 **Stage 4 가 구조적으로 PASS 할 수 없었다**(항목별 명시 수용 없이는). `D4-1`+`D4-4` 로 이 4건이 판정 대상에서 빠지면서 **그 구조적 장애가 사라진다.** 남는 `NOT VERIFIED` 예상은 **Android 모바일 Web 1건**(`N4-21`)뿐이다.

### 11.8 Stage 3 이월 (AC-4-81 ~ 88)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-81 **(수정)** | **`QA-3-001`** — `PushPermissionPort`(`getStatus`·`request`·`getToken`) + **Web 구현**(`Notification.permission`/`requestPermission()` **까지만**) + 사전 안내 UX + `push-permission-denied` 시나리오 + `notification-preferences`/`push-devices` contracts + `PushPlatform` enum(**3값 유지**) **6요소 전부** 존재. ⭐ **`D4-1` 반영**: **네이티브 Push Adapter 는 포함하지 않는다**(→ `S4N-D`, 구 AC-4-79). 6요소는 **전부 Web 범위**다 | 파일 목록 + e2e + grep(`PushManager`·VAPID·provider SDK **0건** · **Capacitor push 플러그인 0건**) | ✅ 실제 발송 |
| AC-4-82 | **`QA-3-002`** — offline 에서 **최근 Activity Card 캐시 + Offline Banner 가 동시에** 표시된다 | e2e(`offline-cached-card`) | — |
| AC-4-83 | **`QA-3-002`** — 캐시가 **로그아웃 시 삭제**되고 유효기간·폐기 규칙이 테스트로 고정된다 | 단위 + 저장소 조회 | — |
| AC-4-84 | **`QA-3-003` (Stage 4 부분)** — 에셋 파이프라인 스크립트(`assets:optimize`)가 존재하고 **AVIF/WebP/PNG 를 생성**하며 `<picture>`+`srcset` 적용 지점이 ≥1 곳 있다 | 명령 실행 + 산출물 목록 + DOM 확인 | — |
| AC-4-85 | **`QA-3-003` (경계)** — **표지 에셋 교체(`P3-BIP-19`)는 Stage 8 게이트로 남아 있음**이 문서로 확인된다 (Stage 4 에서 교체하지 않는다) | Plan §2.4 + `PLANNING` 참조 | ✅ 법무 |
| AC-4-86 | **`AC-3-22`~`26`** — C-13 결정이 "design-agent 명세" 면 Reading Context 6값 선택 UI·`custom_time` 조건부 입력·요청 body 포함·키보드 조작·미선택 진행 규칙(`D-9`)이 구현된다. 결정이 "디자이너 Figma 요청" 이면 **재이월 사실이 Plan·QA 에 기록**된다. ⚠️ **`D4-8` 의 C-13 분배에 이 화면이 포함되지 않았다**(안내 UI 가 아니라 입력 화면) → **`N4-05` 여전히 미결** | 결정 문서 + (구현 시) e2e·단위 | `N4-05` 의존 |
| AC-4-87 | **§30.7 ①** — 그룹 안 **부분 실패**를 재현할 scenario 수단이 생기고, "목록 성공 + 저장만 실패" 가 실브라우저에서 재현된다 | e2e | — |
| AC-4-88 | **§30.7 ②** — `purchaseUrl` fixture 가 ≥1건 생겨 `favorite_only` 가 실제로 무언가를 렌더한다 | 화면 + fixture 확인 | — |

### 11.9 Privacy / Security (AC-4-89 ~ 94)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-89 | 동의 기록 전 **아동 데이터·오디오가 Contract 로 전송되지 않는다** | Mock 요청 로그 전수 검사 | — |
| AC-4-90 | 콘솔·에러 로그에 **PII(아이 이름·Transcript·오디오 경로·로컬 파일 경로)가 없다** | 런타임 콘솔 캡처 + grep | — |
| AC-4-91 | 번들·`VITE_*`·저장소에 **Secret 없음** (업로드 토큰은 **응답으로만** 온다) | grep + 번들 스캔 | — |
| AC-4-92 | **광고·제3자 분석 SDK 0건** (push provider SDK 포함) | 의존성 목록 diff | — |
| AC-4-93 | 로컬 녹음이 **앱 샌드박스/OPFS 에만** 있고 `localStorage`·URL·쿼리에 오디오 데이터·경로가 노출되지 않는다 | 저장소 조회 + grep | — |
| AC-4-94 | Mock **업로드 토큰·objectKey 에 이름·이메일이 들어가지 않는다** (opaque) | fixture 검사 | ✅ 실제 경로는 서버 |

### 11.10 Design / 접근성 / 반응형 (AC-4-95 ~ 100)

| ID | 요구사항 | 증거 | PENDING? |
|---|---|---|---|
| AC-4-95 **(재수정 — `D4-14`·`D4-17`·`D4-18`·`D4-19`)** | 대상 Figma 노드의 **실측 감사 문서가 존재**하고(✅ `stage-4-session-figma-audit.md`, 2026-10-11 — 이미 충족), 구현이 그 값과 일치하거나 **승인된 허용 차이로 등록**돼 있다. ⭐ **등록 대상이 교체됐다** (§0.5): **`AD-S4-1`**(스티커 부제) · **`AD-S4-4`**(Discard 확인 다이얼로그) · **`AD-S4-5`**(하단 바 가운데 정렬 10px) + **`AD-S4-6`**(비활성 `opacity .5` — 등록 여부 판단 대상). ⛔ ~~`AD-S4-2`~~·~~`AD-S4-3`~~ **무효** — 그 2건이 구현에 남아 있으면 **FAIL** 이다(각각 `Discard` 미구현 / `88:757` 교체를 뜻하므로). **등록은 사용자 승인 이후**이며 승인 없이 구현하면 **최우선 규칙 6 위반** | 감사 문서 + Playwright 비교 + **허용 차이 승인 기록** + ~~무효 2건~~의 **부재 증거** | — |
| AC-4-96 | **임의 HEX·arbitrary Tailwind value·inline 수치 신규 0건**. ⚠️ 감사 §7.2 가 신규 토큰 **요청 후보 10건**(`T-1`~`T-10`)을 올렸다 — **채택·흡수 결정 전에는 값을 코드에 넣지 않는다**(`rules/frontend.md` §6) | grep 증거 + 토큰 결정 기록 | — |
| AC-4-97 **(재수정 — `D4-16`·`D4-19`)** | Record Control · **`Discard`** · **`Submit`** · Drawer 트리거 · Drawer 좌우 화살표(`88:960` 의 24×24)의 **터치 타깃 ≥ 44×44**. ⚠️ **하단 바 버튼은 선언 `135×45`** 이므로 세로는 **45 ≥ 44 로 충족**한다 `[계산]`. 화살표 24×24 · 라벨 10px 은 **hit-area 확장**이 필요하다. ⭐ **대비**: `Discard` 흰 라벨 on `#aeaeb2` = **2.211:1** 은 **가값 `P-25`** 로 기록되며 **FAIL 사유가 아니다**(`rules/qa.md` §2). `D-01` 로 처리하지 **않는다** — 범위 밖이다(`D4-16`). ⚠️ ~~`Resume`~~ 는 하단 바에 없다 · ~~`Done Reading`~~ 없음 | 기하 측정(실제 hit area) + 대비 측정 + `P-25` 등재 확인(AC-4-119 와 교차) | — |
| AC-4-98 **(수정)** | **`prefers-reduced-motion`** 에서 맥동·경청·완료 모션이 정지하거나 대체 표현으로 바뀐다. ⭐ **`D4-3` 반영**: 모션이 **CSS** 이므로 대체는 `@media (prefers-reduced-motion: reduce)` 안에서 **선언적으로** 정의돼야 하고, **대체 정의가 없는 애니메이션이 0건**이어야 한다(`D4-3` 의 "대체 정의 필수") | 미디어 쿼리 강제 + 스냅샷 + **`@keyframes`/`animation` 선언 ↔ reduce 블록 1:1 대조** | — |
| AC-4-99 | 320 / 393 / 600 / 1024px 에서 세션·완료 화면이 **앱 컬럼 최대 480px 가운데 정렬**을 지키고 가로 overflow 가 **0** 이다 | 픽셀 프로브 (가로·세로 **양축**) | — |
| AC-4-100 | 새 `overflow` 선언마다 **근거 주석 + 그림자 inset 재산정 + 양축 프로브 회귀 테스트**가 있다 (`R-SHADOW-1`) | grep(computed 확인) + 테스트 목록 | — |

### 11.11 회귀 (AC-4-101 ~ 103)

| ID | 요구사항 | 증거 |
|---|---|---|
| AC-4-101 | Stage 1~3 AC 핵심 경로가 재실행된다 (인증·동의·온보딩·Home 덱·서재·탭 이동) | e2e 결과 |
| AC-4-102 | `pnpm typecheck` · `lint` · `lint:boundaries` · `test` · `build` · `assert:no-mocks` 전부 통과, 신규 `any`/`@ts-ignore` **0건** | 명령 로그 + grep |
| AC-4-103 | `pnpm test:e2e` 전체 통과. 시각 baseline 재생성이 있었다면 **diff 클러스터마다 원인이 규명**돼 있다 (`R-BASELINE-1` ⑤) | Playwright 리포트 + 재생성 근거 |

### 11.12 ⭐ 신규 AC (AC-4-104 ~ 109) — 사용자 결정 8건에서 파생

| ID | 요구사항 | 증거 | 근거 결정 | PENDING? |
|---|---|---|---|---|
| **AC-4-104** | **Stage 4/5 경계의 빈 영역 처리** — `29:62` 구현에서 **y 468 아래(= 53px 빈 간격 + Stage 5 회고 카드 영역 y 521~823)** 에 ① **Figma 에 없는 요소를 넣지 않았고**(최우선 규칙 2) ② **Stage 5 카드를 미리 만들지 않았고**(규칙: 다음 Stage 선행 구현 금지) ③ **하단이 비어 있는 것이 의도임이 코드 주석과 QA 리포트에 기록**돼 있다. ⚠️ 빈 공간을 "채우기 위해" 레이아웃을 재배치하면 **Stage 5 에서 다시 옮겨야 하므로**, Stage 4 는 **`29:62` 의 y 좌표를 그대로** 쓴다 | DOM 요소 목록(y > 468, 배경 외 **0건**) + 주석 grep + QA 리포트 기록 | 감사 §3.6 · `S4F-14` | — |
| ~~**AC-4-105**~~ | ⛔ **폐기 (2026-10-13)** — ~~"`Discard` 미구현 … 화면에 `Discard` 버튼 0건"~~. `D4-12` 가 `Discard` 를 **채택**했으므로 이 AC 는 **반대 사실을 요구**하게 된다. **AC-4-111 ~ 114 가 대체**한다. ⚠️ Stage 3 에서 AC 폐기 표기를 누락해 QA 가 막힌 전례(`QA-3-010`)를 피하려고 **원문과 함께 남긴다** | — | ~~`D4-7`~~ → `D4-12` | **폐기** |
| ~~**AC-4-106**~~ | ⛔ **폐기 (2026-10-13, `D4-14`)** — ~~*"Prompt 를 버블에 표시하지 않는다 — ① ready 버블 서브트리에 Prompt 본문·pill 0건 ② `139:2803` 의 Prompt pill 5개 구조를 구현하지 않았다 ③ Prompt 에 도달하는 경로가 Drawer 하나뿐이다 ④ `AD-S4-3` 등록 대기 기록"*~~. `D4-14` 가 **`139:2803` 을 Figma 그대로 채택**했으므로 이 AC 는 **반대 사실을 요구**하게 된다. **AC-4-40(재수정)·AC-4-53(재수정) 이 대체**한다. ⚠️ Stage 3 에서 AC 폐기 표기를 누락해 QA 가 막힌 전례(`QA-3-010`)를 피하려고 **원문과 함께 남긴다** | — | ~~`D4-6`~~ → `D4-14` | **폐기** |
| **AC-4-107** | **출석 스티커 부제의 streak 언어 0건** — ① `streak` **0건** · `Day \d` 패턴 **0건**(copy 모듈·fixture·컴포넌트 전수) ② 표시 문구가 **Mock 응답 값**이다(하드코딩 0건) ③ 대체 문구가 **design-agent 제안 + 사용자 승인**을 거친 것이다 | grep + Mock 응답 ↔ DOM 대조 + 승인 기록 | **`D4-2`** (`D-6`·`AD-S3-9`·PRD §7.4) | — |
| **AC-4-108** | **Web 녹음의 백그라운드·탭 비활성·화면 잠금 한계가 측정되어 기록**된다 — ① **탭 비활성** ② **브라우저 백그라운드/최소화** ③ **iOS Safari 화면 잠금** 각각에서 **청크 수신이 계속되는지 끊기는지**를 측정하고, **측정 환경(브라우저·버전·OS·기기)과 결과**를 `docs/decisions/stage-4-recording-spike.md` 에 남긴다. ⚠️ *"보장 불가"* 를 **문서 인용으로 적지 않는다** — `rules/frontend.md` §6-2 ⑤: **무엇을 어떻게 쟀는지가 증거다** | 측정 로그(시각·청크 수·중단 시점) + spike 문서 | **`D4-4`** · `rules/architecture.md` §7 | — (iOS 실기기 있음). Android 모바일 Web 은 **`NOT VERIFIED`**(`N4-21`) |
| **AC-4-109** | **애니메이션이 CSS 만으로 구현된다** — ① `package.json` 에 Lottie/Rive/애니메이션 라이브러리 의존성 **0건**(`lottie-web`·`@lottiefiles/*`·`@rive-app/*`·`gsap`·`framer-motion` 등) ② `.lottie`·`.riv`·애니메이션 JSON 에셋 **0건** ③ 모션이 `@keyframes`/`transition`/Pointer Events 로만 구현됐다 | 의존성 목록 diff + 에셋 파일 목록 + grep | **`D4-3`** (Stage 0 #9 선례) | — |

### 11.12-A ⭐ 신규 AC (AC-4-110 ~ 114) — 사용자 결정 `D4-11`·`D4-12` 에서 파생

| ID | 요구사항 | 증거 | 근거 결정 | 4a/4b | PENDING? |
|---|---|---|---|---|---|
| **AC-4-110** | **`IconButton` glass 그림자 교체가 완결됐다** — ① `IconButton` glass 변형의 `box-shadow` 가 **`--shadow-bubble`**(1겹)이고 `--shadow-rest` 참조가 **0건** ② **JSX 호출 35곳 / 21파일**(테스트 제외)이 모두 같은 변형을 쓴다 — 회귀 누락이 없다 ③ **Stage 1~3 시각 baseline 재생성이 `R-BASELINE-1` ⑤ 절차를 거쳤다**: diff 를 **픽셀 연결성분으로 분해**해 **IconButton 주변 클러스터만 바뀐 것을 확인**한 기록이 있고, **설명되지 않는 클러스터가 0건**임을 확인한 뒤 **`--update-snapshots=all`**(기본 `changed` 모드 금지 — `R-BASELINE-1` ③-1)로 재생성했다 ④ 재생성 후 **단독 실행** Playwright 전체 통과 | CSS grep + `<IconButton` grep(`.tsx`, `__tests__` 제외) = **35/21** + 클러스터 분해 기록 + `git log` 의 `--update-snapshots=all` 실행 기록 + Playwright 리포트 | **`D4-11`** (`S4F-12` 옵션 A) | **4a** (코드) + **4b**(baseline 최종) | — |
| **AC-4-111** **(수정 — `D4-18`)** | **`ready` 상태**: Record Control 이 **`Record` 변형**이고 라벨이 **`Tap to recording`** 이며, **`Discard`·`Submit` 이 비활성**이다 — ① **시각이 `opacity: 0.5` 이고 면·라벨 색은 활성과 동일**하다(`D4-18`, `Submit` 의 `17:18` `Accent/Disabled` 와 같은 값) ② **`aria-disabled="true"` + 포커스 가능**이며 **사유가 접근성 이름·안내로 읽힌다**(`D-3` 선례 — `disabled` 속성만 쓰면 스크린리더가 건너뛴다) ③ **클릭해도 전이 요청이 나가지 않는다**(Mock 요청 로그 0건) ④ **상태 전환 시 같은 슬롯에서 토글**되고 **재마운트되지 않는다**(`R-BASELINE-1` — 전환 중 프레임이 baseline 에 굳지 않게) | computed `opacity` 측정 + DOM 속성 + Mock 요청 로그 2시점 + 키보드 탐색 기록 + 마운트 ID 비교 | **`D4-12`·`D4-18`** | **4b** | — |
| **AC-4-112** | **`Record` 탭 → `recording`**: Record Control 이 **`Pause` 변형**으로 바뀌고 **`Discard`·`Submit` 이 활성**된다. 전이 요청은 **`ready → recording`(기존 전이) 1건**이며 전이표 외 값이 나가지 않는다 | DOM 변형 + Mock 요청 본문 + `canTransition()` 단위 테스트 | **`D4-12`** | **4b** | — |
| **AC-4-113** **(수정 — `D4-13`·`D4-17`)** | **`Discard` → 홈**: ① **확인 다이얼로그 확인 이후** 전이가 나가고, 요청이 **`recording → abandoned` 또는 `paused → abandoned`**(actor `caregiver`)다 — **전이표 14행 안의 값**이며 `completedReason`·사유 필드가 **실리지 않는다**(`D4-13` 안 A) ② **서버 전이 확정 응답을 받은 뒤** 로컬을 지운다 — 폐기 **전/후 2시점**의 로컬 청크 수·`UploadQueue` 항목 수 측정 증거 ③ 전이 **실패** 주입 시 **로컬 청크가 그대로**다 ④ 최종적으로 **`/` 로 이동**한다 ⑤ 오프라인이면 **`SessionOutbox` 에 폐기 전이가 적재**되고 로컬은 **보존**된다 | Mock 요청 본문 + 2시점 측정 테스트 + 실패 주입 + route 확인 + Outbox 검사 | **`D4-12`·`D4-13`·`D4-17`** · `rules/architecture.md` §7 · §7.3-A ④ | **4b**(UI) + **4a**(저장소·Outbox 로직) | ✅ 서버 측 part 정리 = **`P4-BIP-21`** |
| **AC-4-114** | **`Submit` → 완료**: ① 전이 요청이 **`recording → completed`** 또는 **`paused → completed`**, `completedReason: 'user_done'` ② **"녹음 제출됨" Toast 가 표시**된다(문구는 copy 모듈, 하드코딩 0건) ③ **`29:62` 완료 화면으로 이동**한다 ④ Toast 와 화면 이동이 **둘 다** 일어난다(하나만 일어나는 경우 FAIL) | Mock 요청 본문 + Toast DOM + route 확인 | **`D4-12`** | **4b** | — |

### 11.12-B ⭐ 신규 AC (AC-4-115 ~ 119) — 사용자 결정 `D4-16`·`D4-17`·`D4-18`·`D4-19` 에서 파생

| ID | 요구사항 | 증거 | 근거 결정 | 4a/4b | PENDING? |
|---|---|---|---|---|---|
| **AC-4-115** | **`Discard` 확인 다이얼로그 — 확인 경로**: ① `Discard` 탭 시 **먼저 다이얼로그가 열리고 전이 요청이 나가지 않는다**(요청 로그 0건) ② 다이얼로그는 **Stage 1 `Dialog` 컴포넌트 재사용**이며 신규 Shared UI 0건 ③ 문구는 **copy 모듈 소유**(하드코딩 0건)이고 **폐기가 되돌릴 수 없다는 사실**을 알린다 ④ 확인 → **`→ abandoned` 전이 1건** → **서버 확정 응답 후** 로컬 삭제 → **`/` 이동** ⑤ 접근성: **포커스 트랩 · 최초 포커스 · `Escape` 로 취소 · `role="dialog"` + 접근성 이름** | 요청 로그 2시점 + 컴포넌트 트리(`Dialog` 재사용) + grep + e2e 전체 경로 + 키보드·스크린리더 검증 | **`D4-17`** (최우선 규칙 2 의 예외 — 사용자 승인으로 성립) | **4b** | — |
| **AC-4-116** | **`Discard` 확인 다이얼로그 — 취소 경로**: ① 취소(또는 `Escape`·scrim 탭) 시 **전이 요청 0건 · 로컬 청크 수 불변 · `UploadQueue` 항목 수 불변** ② **세션 상태가 유지**된다(`recording` 이면 `recording`, `paused` 면 `paused`) ③ **녹음이 계속되거나 일시정지 상태가 유지**된다 — 취소가 녹음을 끊지 않는다 ④ **포커스가 `Discard` 버튼으로 되돌아온다** | 요청 로그 + 2시점 측정 + 상태 머신 단정 + 포커스 위치 측정 | **`D4-17`** | **4b** | — |
| **AC-4-117** | **버튼 비활성 시각이 전역 `opacity: 0.5` 하나로 통일됐다** — ① `Discard`·`Submit` 의 비활성 computed `opacity` 가 **둘 다 0.5** 이고 **면·라벨 색이 활성과 동일**하다 ② **`opacity` 외의 비활성 전용 색·테두리 선언이 0건**이다(grep) ③ 비활성 상태에서도 **`aria-disabled` + 사유 전달**이 있다(AC-4-111 ②와 교차) ④ ⚠️ **기록 의무**: `opacity .5` 가 `Submit` 라벨 대비를 **2.07 아래로 낮춘다**는 사실이 QA 리포트에 기록돼 있다 — WCAG **1.4.3 disabled 제외 조항** 범위이므로 FAIL 아님 | computed 스타일 측정(2버튼) + CSS grep + 대비 계산 기록 | **`D4-18`** | **4b** | — |
| **AC-4-118** | **하단 버튼 바가 앱 컬럼 가운데 정렬이다** — ① 버튼 폭 **135** · gap **9** · 바 폭 **279** 가 실측으로 맞다 ② **좌우 여백이 같다**(393 폭에서 57/57, 480 컬럼에서도 대칭) — Figma `x=67` 을 그대로 쓰지 않았다 ③ **320px 폭에서 우측이 잘리지 않는다**(바 우단 ≤ 컬럼 우단) ④ `AD-S4-5` 등록 대기 기록이 있다 | 기하 측정(320/393/480 3폭) + 좌우 여백 차 = 0 단정 + 클리핑 프로브 | **`D4-19`** | **4b** | — |
| **AC-4-119** | **가값 `P-25` 와 토큰 `T-13` 등재가 완결됐다** — ① `--haru-gray-2: #aeaeb2`(Primitive) + **`--color-action-neutral-bg` · `--color-action-neutral-fg`**(Tier-2) 가 **`packages/design-tokens` 에서만** 정의된다 ⓐ ⛔ **`--color-action-secondary-bg`/`-fg` 의 값이 바뀌지 않았다** — 그 토큰은 `glass` Button·Chip 의 것이고 가값 `P-11` 의 짝이다 (회귀 증거: Stage 1~3 glass 버튼 baseline 불변) ② 토큰 정의에 **`/* provisional: P-25 */` 주석**이 있다 ③ **dev gallery `provisionalItems.ts` 에 `P-25` 가 등재**돼 있다(Stage 3 `QA-3` 차집합 0 선례) ④ **활성 가값 고정 테스트**(`packages/design-tokens/__tests__/fonts.test.ts` 류)의 목록에 `P-25` 가 포함된다 ⑤ 화면 코드에 **`#aeaeb2` 리터럴 0건**이다(`rules/frontend.md` §6) | 토큰 소스 grep + gallery 등재 확인 + 테스트 통과 + 리터럴 grep | **`D4-16`** | **4b** | — |

### 11.12-C ⭐ 신규 AC (AC-4-120 ~ 122) — 사용자 결정 `D4-20` 에서 파생

| ID | 요구사항 | 증거 | 근거 결정 | 4a/4b | PENDING? |
|---|---|---|---|---|---|
| **AC-4-120** | **버블 제목 줄이 API 응답 값만 표시한다** — ① ready 버블 제목 줄 문자열이 **Mock 응답 `bubble` 값과 글자 단위로 같다** ② Frontend 가 인사 문구를 **생성·가공·보간하지 않는다** — 템플릿 문자열 결합·아이 이름 삽입 **0건**(`rules/architecture.md` §8 *"생성 문구는 API 응답 값만 표시"* · `rules/frontend.md` §8) ③ copy 모듈·컴포넌트·fixture 에 **인사 문구 하드코딩 0건**이고 Figma 기본값 **`Try this prompt !` 리터럴이 제품 코드에 0건**이다(기본 예시일 뿐이다) ④ pill 본문은 **`prompts` 값**이며 제목 줄과 **출처가 다르다**(두 값이 섞이지 않는다) ⑤ ⭐ **제목 줄은 1줄 clamp(말줄임)** 다 (`D4-21`) — `white-space: nowrap` + `text-overflow: ellipsis` 류로 **1줄을 넘기지 않으며**, 넘치는 문구는 **잘린다**(줄바꿈·버블 확장 **0건**). 320·393 두 폭에서 **제목 줄 렌더 높이가 22 를 넘지 않음**을 측정한다. ⚠️ clamp 는 **표시 처리**이므로 ①②(생성·가공 금지)와 충돌하지 않는다 ⑥ **상한 초과 문구**(예: `Ready for today's story with Emma?` 271.32px, `Sebastian?` 이름 299.50px) fixture 에서 **버블 본체 높이 269 가 유지되고 Record Control(y621) 침범 0** 이다 — 2줄이 되면 291 로 **7.6px 침범**한다 `[design-agent 계산]` | 응답 ↔ DOM 문자열 비교 + grep(`Try this prompt`·아이 이름 보간·템플릿 결합) + fixture 대조 + ⭐ **긴 문구 fixture 2종(상한 초과·긴 이름) 기하 측정** | **`D4-20`** · ⭐ **`D4-21`** | **4b** | ✅ 검수 템플릿·안전 슬롯 생성 + ⭐ **인사 길이 상한 ≤240px · 아이 이름을 문장 끝에 두지 않기** = `P4-BIP-11` |
| **AC-4-121** | **인사 문구가 없을 때의 거동이 결정적이다** — ① `bubble` 이 **null / 빈 문자열**이면 **제목 줄을 렌더하지 않고** pill 만 표시한다(빈 줄·placeholder·대체 문구 **0건**) ② 그때도 **버블 자체는 렌더**되고 **레이아웃이 깨지지 않는다**(pill 간격 6 · 세로 padding 위 14 / 아래 13 유지, 높이만 줄어든다) ③ **Frontend 가 대체 인사 문구를 만들지 않는다** — fallback 문구 **0건**(fallback 은 Backend 책임, `rules/backend.md` §4) ④ Mock 시나리오로 **결정적으로 재현**된다 ⑤ ⭐ **높이가 정확히 28px 짧아진다** (`D4-22`) — 제목 **22** + 그 뒤 **flex gap 6** 이 **함께 사라진다**. 즉 높이 식은 **`h = 21 + 6n + Σpill`** 이며(제목 있을 때는 `h = 21 + 22 + 6 + 6n + Σpill`), **pill 5개 기준 269 → 241** 이다 `[design-agent 계산]`. 빈 제목 노드가 **자리만 차지하는 구현을 금지**한다 — 측정으로 단정한다 ⑥ ⭐ **`Try this prompt !` 리터럴이 제품 코드·fixture·copy 모듈에 0건**이다 (`D4-22`: Figma placeholder 이며 제품 코드에 넣지 않는다) — AC-4-120 ③ 과 같은 증거를 공유한다 | null·빈값 fixture 2종 + DOM 요소 유무 단정 + ⭐ **높이 차 28px 단정**(제목 있음/없음 두 스냅샷 측정) + grep(fallback 문구 · `Try this prompt`) | **`D4-20`** · ⭐ **`D4-22`** | **4b** | — |
| **AC-4-122** | **pill 개수 × 제목 줄 조합이 전부 성립한다** — ① **n = 0 · 1 · 3 · 5 · 7** 각각에서 버블이 성립한다(`D-21`: 개수 상한 없음, `.min(1)` 만) ② **n = 0** 은 `prompts` 가 빈 배열일 때이며 — ⚠️ **contract 가 `.min(1)` 이면 parse 단계에서 거부되는지**를 테스트가 밝히고, 거부가 맞다면 **화면은 그 경우를 다루지 않는다**(ERROR 경로)는 사실을 기록한다 ③ **n > 5** 에서 Figma 선언 높이(269)를 넘길 때의 처리가 `S4F-01` 정책대로다(확장/스크롤/clamp — design-agent 명세) ④ 제목 줄 **있음 × 없음** 2가지와 위 n 조합이 **모두 렌더**된다(교차 케이스 표) ⑤ pill 본문 2줄 넘침 처리가 `S4F-02` 정책대로다 ⑥ ⭐ **모든 조합의 높이가 한 식으로 설명된다** — **제목 있음 `h = 21 + 22 + 6 + 6n + Σpill`** / **제목 없음 `h = 21 + 6n + Σpill`**, 두 식의 차는 **상수 28** 이다 (`D4-22`). 10 케이스 전부에서 측정값이 식과 일치해야 하며, 어긋나면 **`S4F-01` 정책이 식을 바꾼 것**이므로 design Spec 과 함께 갱신한다 ⑦ ⭐ **제목 줄 clamp 는 n 과 무관하다** (`D4-21`) — 어떤 n 에서도 제목 줄이 2줄이 되지 않는다 | 조합 테스트 표(제목 2 × n 5 = 10 케이스) + 기하 측정(⭐ **식 대조**) + contract parse 테스트 | **`D4-20`** · ⭐ **`D4-21`**·**`D4-22`** · `D-21` · `S4F-01`·`S4F-02` | **4b** | — |

> ⚠️ **`AC-4-122` ②는 contract 결정과 맞물린다** — `promptPreview`/`promptSet.questions` 는 `D-21` 로 **`.min(1)` 유지**다. `SessionSummary.prompts` 에 같은 규칙을 적용할지는 `S4-B` 에서 확정하고, **빈 배열 허용 여부를 AC 로 못박는다**(현재 Plan §7.2 는 `prompts` 의 최소 길이를 명시하지 않았다).



### 11.13 ⭐ AC 재집계 — 폐기 / 이동 / 수정 / 신규

> **번호를 재부여하지 않는다.** Stage 3 에서 AC 폐기 표기를 누락해 QA 가 막힌 전례(`QA-3-010`)를 되풀이하지 않기 위해, **이동한 ID 도 §11.7 에 원문과 함께 남긴다.**

| 구분 | 수 | ID |
|---|---|---|
| 초판 AC | **103** | AC-4-01 ~ AC-4-103 |
| **폐기(삭제)** | **0** | — (어느 것도 "필요 없어졌다" 가 아니다. 네이티브 AC 는 **없어진 것이 아니라 옮겨졌다**) |
| **이동 → 후속 단계 (§3.0)** | **9** | **AC-4-04** (→`S4N-A`) · **AC-4-73**·**74**·**75**·**76** (→`S4N-A`) · **AC-4-77**·**80** (→`S4N-B`) · **AC-4-78** (→`S4N-C`) · **AC-4-79** (→`S4N-D`) |
| **수정** | **14** | **AC-4-01**(apps/mobile 부재 추가) · **AC-4-15**(spike 범위 Web) · **AC-4-40**(ready 버블 = `88:757`, Prompt 비포함) · **AC-4-41**(`Submit`) · **AC-4-50**(Web 전용 + iOS 실기기) · **AC-4-53**(Drawer = Prompt 유일 경로) · **AC-4-57**(`Submit`) · **AC-4-59**(streak 금지) · **AC-4-61**(y 0~468 경계 실측) · **AC-4-68**(Web 인터럽션 3종) · **AC-4-70**(필수 판정 승격) · **AC-4-81**(네이티브 Push 제외) · **AC-4-95**(허용 차이 3건 고정) · **AC-4-97**(`Submit`/`Resume` 라벨) · **AC-4-98**(CSS 모션 대체 정의) → **실제 15건** (AC-4-01 포함). 표기 유지를 위해 **AC-4-01 은 "경미 수정" 으로 별도 세지 않으면 14건** |
| **신규 (2026-10-12)** | **6** | **AC-4-104** ~ **AC-4-109** |
| ~~Stage 4 판정 대상 합계~~ | ~~100~~ | ~~103 − 9 + 6~~ — **아래 2026-10-13 재집계가 대체** |

**⭐ 2026-10-13 재집계 (`D4-10`·`D4-11`·`D4-12`)**

| 구분 | 수 | ID |
|---|---|---|
| 2026-10-12 기준 | **100** | AC-4-01 ~ AC-4-109 (이동 9건 제외) |
| **폐기(삭제)** | **1** | **AC-4-105** (`Discard` 미구현 요구 — `D4-12` 로 반대 사실이 됨). §11.12 에 **원문 보존** |
| **신규** | **5** | **AC-4-110**(`D4-11` IconButton 그림자) · **AC-4-111**~**114**(`D4-12` 녹음 플로우) |
| **수정** | **4** | **AC-4-41**·**AC-4-57**(`Submit` 동작에 **Toast + 화면 이동** 추가 — AC-4-114 와 중복되지 않게 *"버튼 존재·라벨"* 로 좁힌다) · **AC-4-97**(하단 버튼 = 상태 무관 `Discard`/`Submit` 2개, `Resume` 매핑 **보류**) · **AC-4-107**(스티커 부제 문구를 **`You read together today`** 로 고정 — `D4-10`) |
| **Stage 4 판정 대상 합계** | ~~104~~ | ~~100 − 1 + 5~~ — **아래 2026-10-13 개정 2 재집계가 대체** |

**⭐ 2026-10-13 개정 2 재집계 (`D4-13`~`D4-19`)**

| 구분 | 수 | ID |
|---|---|---|
| 개정 1 기준 | **104** | AC-4-01 ~ AC-4-114 (이동 9 · 폐기 1 제외) |
| **폐기(삭제)** | **1** | **AC-4-106**(Prompt 를 버블에 표시하지 않는다 — `D4-14` 로 **반대 사실**이 됨). §11.12 에 **원문 보존** |
| **신규** | ⭐ **8** | **AC-4-115**·**116**(`D4-17` 확인 다이얼로그 — 확인/취소) · **AC-4-117**(`D4-18` 비활성 `opacity .5`) · **AC-4-118**(`D4-19` 바 가운데 정렬) · **AC-4-119**(`D4-16` 가값 `P-25`·토큰 `T-13` 등재) · ⭐ **AC-4-120**~**122**(`D4-20` 버블 제목 줄 = 응답 값 / 인사 없음 거동 / pill 0~7 × 제목 줄 조합) |
| **수정** | **7** | **AC-4-07**(전이표 **12 → 14행** — `D4-13`) · **AC-4-40**(ready 버블 = `139:2803` Figma 그대로 — `D4-14`) · **AC-4-53**(Drawer 가 **유일 경로 아님** — `D4-14`) · **AC-4-95**(허용 차이 목록 교체 + 무효 2건 부재 증거) · **AC-4-97**(`Discard` 터치·대비 `P-25`) · **AC-4-111**(비활성 = `opacity .5` + `aria-disabled`) · **AC-4-113**(확인 다이얼로그 경유 + `→ abandoned` 값 단정) |
| **Stage 4 판정 대상 합계** | ⭐ **111** | 104 − 1 + 8 = **111**. ID 범위 **AC-4-01 ~ AC-4-122** (이동 9건 · 폐기 **2건**(`AC-4-105`·`AC-4-106`) 제외) |
| ⭐ **2026-10-13 승인분 (`D4-21`·`D4-22`)** | **신규 0 · 수정 3** | **AC-4-120**(⑤⑥ clamp·침범 0 추가 — `D4-21`) · **AC-4-121**(⑤⑥ 28px·높이 식·`Try this prompt !` 0건 — `D4-22`) · **AC-4-122**(⑥⑦ 높이 식 대조·clamp 불변 — `D4-21`·`D4-22`). **합계 111 변동 없음** |
| 그중 **4a** | **약 73** | §16.4 — 변동 없음 (AC-4-07 은 수정됐으나 4a 에 그대로 있다) |
| 그중 **4b** | ⭐ **약 38** | §16.5 — 31 − 1(AC-4-106 폐기) + 8(신규) = **38** |

⚠️ **폐기 2건은 "없어진 것" 이 아니라 "반대 사실이 된 것"** 이다. 둘 다 **원문을 남겨 두었다** — QA 가 폐기 사실을 모르고 과거 AC 를 집행하면 `D4-12`·`D4-14` 와 충돌한다 (`QA-3-010` 전례).

**요구사항 ID 매핑 (개정)**:
⭐ **2026-10-13 개정 2**: FR-09 → AC-4-38~52 · 64 · 69 · **111**~**114** · **117**·**118** / FR-10 → AC-4-40 · 52 · 58 · ⭐ **120**·**121**·**122** (~~106~~ **폐기**) / FR-11 → AC-4-53~56 · 98 · **109** (~~106~~ **폐기**) / FR-14 → AC-4-26~33 · 66 · 67 · 71 / FR-19 → AC-4-59 · 60 · **107** / FR-02 → AC-4-62 · 89 / FR-21 → AC-4-72 · 93 · **113** · **115**·**116** / FR-23 → AC-4-09 · 38 / FR-25 → AC-4-99 (~~AC-4-75~~ 이동) / ~~FR-01~~ **제외** (~~AC-4-78~~ 이동) / FR-08 → AC-4-81 · 86 (~~AC-4-79~~ 이동) / NFR → AC-4-50 · 51 · 68 · 70 · 97~100 · **108** (~~AC-4-80~~ 이동) / §13 → AC-4-62~69 / contracts → AC-4-05~20 · **105** / Mock → AC-4-21~37 · 87 · 88 / 이월 → AC-4-81~88 / Privacy → AC-4-89~94 / Design·a11y → AC-4-95~100 · **117**·**118**·**119** / Scope → AC-4-01~03 · **104** · ~~**105**~~·~~**106**~~ **폐기** (~~AC-4-04~~ 이동) / 회귀 → AC-4-101~103.

---

## 12. Test Strategy

| 층 | 도구 | Stage 4 에서 반드시 있어야 하는 것 |
|---|---|---|
| **Unit (contracts)** | Vitest | schema 양·음 케이스 · 전이표 스냅샷(12행) · enum 스냅샷 · `MAX_RECORDED_SECONDS` 경계(1800/1801) · `createCustomTimeRefine` 재사용 |
| **Unit (상태 머신)** | Vitest + `MockRecorderAdapter` + 주입 clock | ⭐ **필수** (`rules/frontend.md` §10): 허용 전이 12 + 거부 샘플 · pause 중 타이머 정지 · 30분 자동 종료 · 10분 방치 · 크래시 복구 · 인터럽션 · **확정 전/후 로컬 파일 수 2시점 측정** |
| **Unit (큐·outbox)** | Vitest | 재시도 백오프 · 48h 경계 · 순서 보존 재전송 · `RECORDING_DELETED` 포기 처리 · Idempotency-Key 재생 |
| **Component** | Vitest + Testing Library | 상태별 컨트롤 렌더 · 버블 2회 제한 · 스티커 표시/미표시 · Drawer 포커스 트랩 |
| **Mock scenario** | Vitest | 시나리오별 contracts parse + 결정성(같은 key = 같은 결과) + 요청 로그 단정 |
| **E2E** | Playwright | Start Session → ready → recording → pause → resume → done → complete · consent-missing 차단 · mic 거부 → 대화만 하기 · offline → online 재개 · session-already-active 복귀 |
| **시각 비교** | Playwright | ⚠️ **모션 정지 전략이 선행 조건**이다 (`R-BASELINE-1`). ⭐ `D4-3`(CSS 모션)으로 **`prefers-reduced-motion: reduce` 강제 + `animation-play-state` 차단**이라는 **결정적** 수단이 생겼다. 임계값은 기존 상수(`VISUAL_THRESHOLD_REGION`·`VISUAL_THRESHOLD_FRAME` = 0.02) 를 **올리지 않는다** |
| **픽셀 프로브** | Playwright | 그림자 클리핑 **가로·세로 양축**(감사 §4.2 의 inset 산출을 초기값으로, **실측으로 재확정**) · 앱 컬럼 정렬 · 터치 타깃 기하 |
| **수동 / 실기기 — ⭐ `D4-1`·`D4-4` 로 재정의** | **iOS 실기기(있음)** · 데스크톱 Chrome/Safari · ~~Android 실기기(없음)~~ | `rules/qa.md` Recording Client 표의 **Web 열만** Stage 4 대상이다. **iOS Safari 실기기에서 검증 가능한 것**: ① 녹음 시작 지연 ≤1s(AC-4-50) ② Pause/Resume ③ 30분 자동 종료(clock 주입 불가 시 축약 파라미터) ④ 마이크 권한 거부 → 대화만 하기 ⑤ 네트워크 끊김 → 로컬 유지 → 복구 업로드 ⑥ 탭 강제 종료 후 로컬 복구 ⑦ **화면 잠금 중 녹음 거동 측정**(AC-4-108) ⑧ **전화 수신 시 `MediaStreamTrack.onended` 거동**(AC-4-68 ③). **iOS·Android 네이티브 열은 Stage 4 판정 대상 아님**(→ §3.0). **Android 모바일 Web 은 기기 부재 → `NOT VERIFIED` + 수동 절차 문서화**(`N4-21`) |
| **Playwright 실행 규칙** | — | ⚠️ **단독 실행**한다 (겹치면 20분대 + 허위 실패) |

---

## 13. Risks & Mitigations

| ID | 위험 | 영향 | 완화 |
|---|---|---|---|
| **`R4-01`** (= `R-02`) | Stage 2~3 의 Web `AuthGateway`·push 권한 UX 를 네이티브 Adapter 로 확장할 때 **재작업** | 2·3·**후속 §3.0** | ⭐ **`D4-1` 로 위험이 사라지지 않고 이연된다**(§0.4). 완화책은 **Stage 4 에서도 그대로** 지킨다: interface 뒤 구현 + Port 선택 지점 `app/providers` 1곳 → 후속 단계가 **Adapter 추가만** 되게 한다. ⚠️ Stage 4 에서 interface 를 Web 전용으로 좁히면(예: `MediaRecorder` 타입을 interface 에 노출) **이 완화가 깨진다** → `S4-D` 완료 판정에 포함 |
| ~~**`R4-02`**~~ | ~~Capacitor 녹음 플러그인이 청크 분할 기록을 문서화하지 않는다~~ | **Stage 4 범위 밖** | ⭐ **이 위험이 `D4-1` 의 사유였다.** 조사 결과는 §3.0 에 **보존**(다시 조사하지 않기 위해). **후속 단계의 Critical 위험으로 이연** — 청크가 끝까지 불가하면 `ARCHITECTURE §10.5` 의 part 모델 자체를 네이티브에서 재검토해야 한다. ⚠️ **Stage 4 의 Web 청크 측정 결과(`S4-A`)가 그 판단의 기준선**이 된다 — 그래서 `S4-A` 는 여전히 착수 첫 작업이다 |
| ~~**`R4-03`**~~ | ~~Android 14+ foreground service 직접 구현~~ | **Stage 4 범위 밖** | `D4-1` 의 사유 ③. §3.0 의 이연 미결(`N4-19`) |
| ~~**`R4-04`**~~ (= `R-16`) | ~~경청·인사·완료 애니메이션 에셋이 없다~~ | ✅ **해소** | ⭐ **`D4-3`** — **CSS 모션으로 시작**(Stage 0 #9 선례와 일치), Lottie/Rive 도입 없음, `prefers-reduced-motion` 대체 필수. 잔여 위험은 *"CSS 로 '듣고 있음'이 충분히 전달되는가"* 이며 이는 **design-agent 명세 + 사용자 검수** 사안이다. `DESIGN_SYSTEM.md:151`·`PLANNING.md:383` 표기 해소 = §0.6 |
| **`R4-05`** ⭐ **등급 상향** | **Web 녹음의 백그라운드·탭 비활성·잠금 보장 불가** (iOS Safari/PWA 는 캡처 중단, Android 모바일 Web 미검증) | **Critical** — `D4-1` 로 **Stage 4 가 Web 뿐**이 되었으므로, 이 한계가 *"네이티브로 보완된다"* 는 전제가 **Stage 4 안에 없다**. PRD NFR *"백그라운드·화면 잠금·일시정지에도 녹음 유지"* 는 Stage 4 에서 **충족되지 않는다** | ① **`D4-4` 로 "측정·기록·안내"가 요구사항이 되었다** → AC-4-108(측정) · AC-4-70(안내) · `web-background-warning` 시나리오 ② **충족되지 않는다는 사실을 Stage 4 QA 리포트와 Stage 8 Handoff 에 명시**한다 — `BACKEND_INTEGRATION_PENDING` 이 아니라 **"후속 단계(네이티브) 의존"** 으로 분류한다(§10.1 주의) ③ **로컬 청크 영속**(`LocalRecordingStore`)이 유일한 방어선이므로 `S4-E` 의 완료 판정을 느슨하게 두지 않는다 |
| **`R4-06`** | **`features/storytime-session` ↔ `features/recording` 직접 import** 로 레이어 규칙이 깨진다 | Medium — `lint:boundaries` FAIL | `entities/session`·`entities/recording` 구독 hook 경유 설계를 Design Spec 단계에서 못 박고, 경계 테스트를 **먼저** 추가 |
| ~~**`R4-07`**~~ | ~~`apps/mobile` 생성이 write guard 에 막힌다~~ | **Stage 4 범위 밖** | `D4-1`. 조사 결과는 §9.5 에 **보존**(후속 단계에서 필요). **Stage 4 에서는 반대로 `apps/mobile` 부재가 Exit 조건**이다 (AC-4-01) |
| **`R4-13`** ⭐ 신규 | **디자이너 Figma(`C13-1`·`C13-14`) 수령이 지연되면 Stage 4 가 닫히지 않는다** (`D4-8`) | **High — 일정** | §16.3 에 **"지금 닫을 수 있는 경계"** 를 제시했다. 선택지: ⓐ Figma 를 기다려 단일 Stage 4 로 닫는다 ⓑ **Stage 4a(비시각) / 4b(시각)로 쪼갠다** → `N4-22` **사용자 결정**. ⚠️ 어느 쪽이든 **`S4-A`~`S4-E`·`S4-J` 는 지금 착수 가능**하므로 대기 중에 멈춰 있을 필요가 없다 |
| ~~**`R4-14`**~~ | ✅ **해소 (2026-10-13)** — ~~`D4-6` 이 Orchestrator 해석이다~~ | — | ⭐ **`D4-14` 로 재확인이 끝났다. 해석은 틀렸고 결정은 뒤집혔다**(ready 버블 = `139:2803` Figma 그대로). 되돌림의 비용은 실제로 발생했다 — `AD-S4-3` 무효 · `AC-4-106` 폐기 · AC-4-40·53 재수정. **교훈은 `rules/frontend.md` §6-2 ⑤ 와 같다**: Orchestrator 해석을 사용자 결정으로 올릴 때는 **해석임을 표기하고 착수 전에 재확인**한다 — 이 Plan 은 그렇게 표기해 두었고(`N4-24`) 그 덕에 **구현 전에** 뒤집혔다 |
| **`R4-15`** ⭐ 신규 | **`D4-14` 로 되살아난 2건이 ready 화면 구현을 늦춘다** — `S4F-01`(Prompt n 가변 시 버블 높이) · `S4F-02`(pill 본문이 **Figma 자체에서 38px 를 넘긴다**) | Medium — `S4-F` | ① `D-21`(개수 상한 없음)과 묶어 **n=1/3/5/7 케이스를 Design Spec 에서 먼저 확정**한다 ② Home pill 선례(`--prompt-pill-text-line: 12` × 2줄)를 **그대로 쓸 수 있는지** 판정한다 ③ ⚠️ **Figma 자체가 넘치는 것**이므로 "Figma 대로" 가 답이 되지 않는다 — 최우선 규칙 4 의 *"실측값과 다르게 구현해야 할 이유"* 를 보고하고 승인받는 경로로 처리한다 |
| **`R4-16`** ⭐ 신규 | **전이표 2행 추가가 승인 범위를 넘어 번진다** — `D4-13` 은 **2행만** 허용했는데, 구현 중 `AbandonedReason`·`abandonedReason?`·`discarded` 가 "필요해 보여" 들어갈 수 있다 (Stage 0 #16 위반) | **High — Scope** | ① **AC-4-07** 이 14행 전수 스냅샷 + `git diff` 로 **승인 범위 외 변경 0건**을 요구한다 ② `S4-B` 완료 판정에 **enum 스냅샷 불변**(AC-4-06)을 함께 둔다 ③ 사유 구분이 필요해지면 **`N4-30` 으로 올린다** — 구현 중에 정하지 않는다 |
| **`R4-08`** | 모션이 있는 화면의 **시각 baseline 에 과도기 프레임이 굳는다** (`R-BASELINE-1` ④ 재발) | Medium | 모션 정지 전략을 **baseline 저장 전에** 확정. `settle()` 보장. 재생성은 `--update-snapshots=all` |
| **`R4-09`** | Stage 4 작업량이 커서 **agent stall** 이 난다 (Stage 3 전례) | Medium → ⭐ **완화됨** | §16(작업 분해)의 **11개 단위**로 쪼개고 각 단위마다 완료 판정 기준을 둔다. 한 단위에 contracts+화면을 섞지 않는다. ⭐ **`D4-1` 이 `S4-I`(Capacitor 셸, 가장 이질적인 단위)를 Stage 4 에서 덜어냈다** — 이것이 이 위험의 가장 큰 완화다 |
| **`R4-10`** | Mock scenario key 가 **그룹 단위**라 Stage 4 의 복합 상태(세션은 성공 + 업로드만 실패)를 재현할 수 없다 | Medium — AC-4-27·30·87 이 막힌다 | §8.3 의 **메서드 단위 override** 를 S4-C 초반에 처리 |
| **`R4-11`** | 로컬 녹음이 기기에 무한정 남는다 (`OAQ-11` 미결) | Medium — 프라이버시·저장공간 | §14.2 `N4-09`. 결정 전에는 **삭제하지 않는 쪽**(유실 방지 우선, `ARCHITECTURE §10.5-6`)을 유지하고 그 사실을 기록 |
| ~~**`R4-12`**~~ | ~~Figma `29:62` 의 스티커 문구가 "keep the streak going" 인데 `D-6` 이 streak 표시를 폐기했다~~ | ✅ **해소** | ⭐ **`D4-2`** — **`D-6` 유지, 문구 교체.** 잔여 작업: ① **대체 문구를 design-agent 가 관찰 언어로 제안** ② **사용자 승인** ③ **허용 차이 `AD-S4-1` 등록**(승인 후). 검증 = AC-4-59 · AC-4-107 |

---

## 14. Open Decisions

> 라벨: `CONFIRMED` = PRD/Figma/사용자 결정으로 확정 · `RECOMMENDED` = 근거 있는 권장안, 승인 필요 · `NEEDS DECISION` = 사용자/법무/비즈니스 결정 필요.
> 차단 표기: **⛔ = Stage 4 완료 판정을 막는다** · **⚠️ = 특정 작업 단위 착수 전에 필요** · 표기 없음 = 비차단.
> ⚠️ **`S4-A`~`S4-E` 착수를 막는 결정은 없다** (§16.3).

### 14.1 ✅ 해소·소멸 — **다시 묻지 않는다**

> ⭐ **2026-10-13 개정 2 로 추가 해소된 4건** (`D4-13`~`D4-19`)
>
> | ID | 해소 근거 |
> |---|---|
> | **`N4-24`** (`D4-6` 해석 재확인) | **`D4-14`** — `D4-6` 자체가 **철회**됐다. 해석의 대상이 사라졌다 |
> | ⛔ **`N4-25`** (녹음 폐기 contracts 표현) | **`D4-13` — 안 A 확정**(전이 2행, enum 신규 0). **Stage 4a 의 유일한 ⛔ 차단이 사라졌다** |
> | ⛔ **`N4-26`** (비활성 시각 · 확인 다이얼로그) | **`D4-18`**(전역 `opacity .5`) + **`D4-17`**(다이얼로그 **둔다**, design-agent 명세). `C13-17` 도 함께 해소 |
> | **`N4-29`** (`Discard` 라벨 대비) | **`D4-16`** — Figma 그대로 + 가값 **`P-25`**. ⚠️ 대비 값은 **2.211:1** 이 정본(종전 2.19 는 스테일) |
> | **`N4-32`** (ready 버블 인사 문구 자리) | ⭐ **`D4-20`** — **버블 제목 줄**이 인사 자리다(서버 값). pill 은 `prompts`. **plan-agent 권고안 채택**. ⚠️ 함께 정정: `bubble` 은 **계획된 신규 필드**이며 기존 필드가 아니다(`packages/contracts/src` grep **0건**) |
>
> 아래는 2026-10-12~13 개정 1 까지의 해소 기록이다.

| 초판 ID | 초판 상태 | 어떻게 처리됐는가 | 잔여 |
|---|---|---|---|
| ⛔ **`N4-01`** (`M-26` 세션 컨트롤 상태 혼합) | **NEEDS DECISION** — `PLANNING.md:331`·`FIGMA_SCREEN_MAP.md:219` 가 *"RecordingController 상태별 UI 정의 불가 → **Stage 4 차단**"* | **부분 해소.** `D4-5` 가 **하단 버튼 라벨을 확정**(`recording`→`Submit` · `paused`→`Resume`, `Done Reading` 미생성)하고, `D4-8` 이 **처리 경로를 디자이너 Figma 요청으로 확정**했다 → **"차단" → "산출물 대기"** 로 등급 변경 | ⏳ `C13-1`·`C13-14` Figma 수령 (§16.3) + **`N4-23`**(ready 상태 하단 버튼) |
| ⛔ **`N4-02`** (`M-25`·`G-08` 준비 버블 내용) | **NEEDS DECISION** | ✅ **해소 — `D4-6`.** ready 버블 = **`88:757`**(`Type=sessopn` 인사 버블, 현재 미배치), `139:2803` Prompt pill 5개 자동 표시 **미채택**, Prompt 는 **Drawer 전용**. PRD §7.5 와 일치하므로 **PRD 수정 대상 아님** | ⚠️ **`N4-24`** — 이 결정은 **Orchestrator 해석**이다 (사용자 재확인 대상) + 허용 차이 `AD-S4-3` 등록 |
| ⛔ **`N4-03`** (`G-09` Discard/Submit) | **NEEDS DECISION** | ✅ **재해소 (2026-10-13) — `D4-12`.** `Submit`(`163:1620`) · `Discard`(`163:1618`) **둘 다 채택**. ~~`D4-5`+`D4-7` 로 'Submit 채택 · Discard 미채택'~~ 은 **무효**. contracts 신규 전이·`completedReason` 값 **0건** | 허용 차이 `AD-S4-2` 등록 (승인 후) |
| ⛔ **`N4-06`** (`R-16` 애니메이션 포맷) | **NEEDS DECISION** — `DESIGN_SYSTEM.md:151` *"**Stage 4 차단**"* | ✅ **해소 — `D4-3`.** **CSS 모션으로 시작**(Stage 0 #9 *"제스처·애니메이션은 CSS / Pointer Events 우선"* 과 일치), **Lottie/Rive 도입 없음**, `prefers-reduced-motion` **대체 정의 필수** | §0.6 문서 표기 해소(소관: design-agent / plan-agent) |
| ⛔ **`N4-07`** (Capacitor 녹음 플러그인 선정) | **NEEDS DECISION** | ⛔ **소멸 (Stage 4 범위 밖) — `D4-1`.** 조사 결과는 §3.0 에 보존. **후속 단계의 선행 결정**으로 이연 | — |
| **`N4-08`** (`OAQ-10` Web 녹음 허용 여부) | **NEEDS DECISION** | ✅ **해소 — `D4-1` 의 직접 귀결.** *"Stage 4 범위 = **Web 녹음까지**"* 는 선택지 ⓐ(**foreground 전용 허용 + 경고**)를 전제한다. ⓑ(Web 은 대화 전용만)는 `D4-1` 과 **모순되므로 소멸** | 경고 문구·시점·형태 = **design-agent 명세**(`D4-8` 안내 UI) → AC-4-70 |
| **`N4-12`** (출석 스티커 streak 언어) | **NEEDS DECISION** | ✅ **해소 — `D4-2`.** `D-6` **유지**, Figma `29:85` `Day 12 · keep the streak going` **미채택**. 대체 문구는 **design-agent 가 관찰 언어로 제안 → 사용자 승인** | 대체 문구 제안·승인 + 허용 차이 `AD-S4-1` 등록 |
| **`N4-14`** (실기기 부재 시 처리) | **NEEDS DECISION** (수용 범위) | ✅ **해소 — `D4-1`+`D4-4`.** 초판이 예상한 **`NOT VERIFIED` 4건(네이티브)이 Stage 4 판정 대상에서 빠졌다** → `rules/qa.md` §2 상 `INCOMPLETE` 를 강제하던 구조적 장애가 사라졌다 | ⚠️ **`N4-21`** 로 분리 — **Android 모바일 Web** 실기기 부재 (`NOT VERIFIED` 예상 **1건**) |
| **`N4-19`** (Android FGS 가 Frontend Scope 인가) | **NEEDS DECISION** | ⛔ **소멸 (Stage 4 범위 밖) — `D4-1`.** 오히려 **이 질문이 `D4-1` 의 사유 ③** 이었다 | 후속 단계 선행 결정 (§3.0) |

### 14.2 결정 필요 — ⭐ **남은 15건** (승인 체크포인트에서 물을 것)

> **⭐ 2026-10-13 개정 2 신규 3건**
>
> | ID | 차단 | 항목 | 권장안 | 라벨 |
> |---|---|---|---|---|
> | ~~**`N4-32`**~~ | ✅ **해소 (`D4-20`)** | ~~ready 버블의 인사 문구 노출 지점~~ — **버블 제목 줄**로 확정. 권고안이 채택됐다. ⚠️ 전제 정정: `bubble` 은 **기존 필드가 아니라 계획된 필드**다(§0.1 `D4-20`) | — | **CONFIRMED** |
> | **`N4-31`** ⭐ | ⚠️ **`S4-F` 전** | **하단 바 규격** — `135×45 ×2 + gap 9`(Figma 선언) ↔ 기존 주 CTA 선례 **높이 56 · 폭 100%**(가값 `P-15` **확정**). `S4F-16` | **Figma 그대로 `135×45` + 세션 전용 Tier-3 토큰**(design Spec `T-12`). `P-15`(56) 는 주 CTA 선례로 **유지하고 범위를 세션 액션 바로 확장하지 않는다** — 최우선 규칙 1 과 일치한다 | **NEEDS DECISION** (design 선행) |
> | **`N4-30`** ⭐ | — (**이연**) | **방치/폐기 사유 구분 수단** — `D4-13` 안 A 의 명시된 귀결. 10분 방치와 사용자 폐기가 **구분되지 않는다** | **Stage 4 에서 추가하지 않는다.** Audit·지표 요구가 실제로 생기는 시점에 `AbandonedReason` 또는 동등 수단을 **별도 결정**한다. ⚠️ 구현 중에 "필요해 보여" 넣지 않는다 (`R4-16`) | **비차단 (이연)** |
>
> **⛔ 차단 집계 (개정 2 최종)**: **4a = 0건** · **4b = 1건**(`N4-10`) · ⚠️ 작업 단위 선행 = ⭐ **6건**(`N4-04`·`N4-09`·`N4-20` → 4a / `N4-27`·`N4-31`·`N4-15` → `S4-F`, `N4-28` → `S4-G`). `N4-32` 는 **`D4-20` 으로 해소**됐다.
>
> 아래 표에서 **`N4-24`·`N4-25`·`N4-26`·`N4-29`·`N4-32` 는 해소**됐다 (§14.1). 원문은 변경 이력을 위해 남긴다.

| ID | 차단 | 항목 | 양쪽 내용 / 선택지 | 권장안 | 라벨 |
|---|---|---|---|---|---|
| ~~**`N4-22`**~~ | ✅ **해소** | **Stage 4 를 어디까지로 닫는가** | ~~Stage 4 를 어디까지로 닫는가~~ → **4a / 4b 분할 확정** (§16.4 · §16.5). 함께 결정된 것: ① 표기 = **`4a` / `4b`** ② `PLANNING.md` §5 반영 = §18-20 ③ **4a `PASS` 로 Stage 5 를 시작하지 않는다**(plan-agent 권고 채택) | — | **CONFIRMED** |
| ~~**`N4-23`**~~ | ✅ **해소** | **`ready` 상태의 하단 버튼** | ~~ready 상태의 하단 버튼~~ → **`Discard`·`Submit` 이 비활성 상태로 존재**한다. 권장했던 ⓑ(Prompt Drawer 트리거)는 **채택되지 않았다** → **`N4-28` 로 분리**(Drawer 진입점이 여전히 없다) | — | **CONFIRMED** |
| ~~**`N4-05`**~~ | ✅ **해소** | **Reading Context 선택 UI 의 디자인 소스** | ~~Reading Context 선택 UI 의 디자인 소스~~ → **design-agent 명세로 이미 분배·작성됐다** (Design Spec §7.5). §4.3 의 "분배되지 않았다" 는 **오기였다**. 남은 것은 디자인 소스가 아니라 **`D-9`(`N4-04`)** | — | **CONFIRMED** |
| ~~**`N4-25`**~~ ✅ **해소 (`D4-13` — 안 A)** | ~~⛔ `S4-B` 전~~ | **녹음 폐기(`Discard`)의 contracts 표현** | **기존 enum·전이표로 표현할 수 없다** (§7.3-A ① — `recording → abandoned`·`paused → abandoned` 행이 **없다**). 선택지: **안 A**(전이 2행만 추가, enum 신규 0) · **안 A′**(안 A + `AbandonedReason` enum `ready_timeout`·`user_discarded`) · **안 B**(`SessionStatus` 에 `discarded` 신규 값). ⚠️ **Stage 0 #16 이 enum·전이표를 `CONFIRMED` 로 못박았으므로 사용자 승인 사항**이다 | **안 A′ 권장** — 상태 수를 지키면서(안 B 회피) *"왜 끝났는지"* 를 남긴다. 아동 음성 데이터를 사용자가 **직접 지운 사건**은 Audit 대상이다. `API_CONTRACTS §6 G-09` 가 이미 안 A 를 적어 둔 것이 보조 근거 | **NEEDS DECISION** (Stage 0 #16 변경) |
| ~~**`N4-26`**~~ ✅ **해소 (`D4-18` 비활성 · `D4-17` 다이얼로그)** | ~~⛔ `S4-F` 전~~ | **`Discard`·`Submit` 의 비활성 시각 + Discard 확인 다이얼로그** | Figma 에 **둘 다 없다** `[M, 2026-10-13]`. `D4-12` 가 *"ready 에서 비활성"* 을 요구하므로 **비활성 시각은 반드시 필요**하다. 확인 다이얼로그는 **선택**이지만 폐기가 **되돌릴 수 없다**. 선택지: ⓐ 디자이너 Figma 요청(`C13-17`) ⓑ design-agent 명세(#22 선례) · 다이얼로그 ⓒ 둔다 ⓓ 두지 않는다 | **비활성 시각 = ⓑ design-agent 명세**(기존 `Button` disabled 토큰 재사용이면 신규 디자인이 아니다) · **다이얼로그 = ⓒ 둔다** 권장 — 유실이 비가역이고 `rules/frontend.md` §7 이 Confirm Dialog 를 공통 상태로 이미 둔다(#22, Stage 1 구현됨). ⚠️ 둘 다 **최우선 규칙 2 대상**이므로 **승인 없이 만들지 않는다** | **NEEDS DECISION** |
| **`N4-27`** ⭐ 신규 | ⚠️ **`S4-F` 전** | **`paused` 재개 경로** | `D4-5` 는 *"paused → `Resume`(`140:2870`)"* 로 정했는데 그 **버튼이 `28:51` 에서 제거**됐다 `[M, 2026-10-13]`. `163:1590` 변형은 **`Record`·`Pause` 2개 그대로**다. Record Control 토글로 재개하는 것으로 **읽히지만 단정할 근거가 없다** — `paused` 에서 어떤 변형·라벨을 보여줄지가 미정이다(`Tap to recording` 은 재개 문구로 맞지 않는다) | **design-agent 실측 결과와 맞춘다** — 이 Plan 은 단정하지 않는다. `C13-14` 디자이너 요청에 *"`paused` 의 Record Control 표현(아이콘·라벨)"* 을 **명시 포함** | **NEEDS DECISION** (design 선행) |
| **`N4-28`** (⭐ **성격 변경 — `D4-14`**) | ⚠️ **`S4-G` 전** | **Prompt Drawer 진입점** — ⭐ ready 에서는 **버블이 이미 Prompt 를 보여주므로**, 남은 요구는 **녹음 중 재확인 경로**다 | `N4-23` 의 권장안 ⓑ(하단 슬롯을 Drawer 트리거로)가 **채택되지 않았다** — 그 자리를 `Discard`/`Submit` 이 차지한다. **PRD §7.5 는 "Prompt 모아보기" 보조 버튼을 요구**하는데 Figma 에 **진입점이 없다**(`C13-4`). PRD ↔ Figma **경합** | ⓐ 다른 위치(예: TopBar `78:353` trailing)에 트리거를 둔다 ⓑ 캐릭터 메달리온 탭 ⓒ 디자이너 Figma 요청. **ⓒ 를 `C13-1` 요청에 묶는 것**을 권장 — 규칙 2 대상이고 왕복이 줄어든다 | **NEEDS DECISION** (PRD ↔ Figma) |
| ~~**`N4-29`**~~ ✅ **해소 (`D4-16` — 가값 `P-25`)** | ~~⚠️ `S4-F` 전~~ | **`Discard` 라벨 대비** ⚠️ 아래 **2.19:1 은 스테일 — 정본 2.211:1** | `#aeaeb2`(`grays/gray-2`) 위 흰 라벨 = **약 2.19:1** `[계산: 상대 휘도 0.4292]`. **`D-01` 수용 예외의 범위 밖**이다 — `D-01` 원문은 *"주요 버튼·선택 칩 등 **`--color-action-primary-bg`** 위 흰 라벨에 **한정**"* 이고 **[직독]** `stage-0-approvals.md` §3), `#aeaeb2` 는 `--color-action-primary-bg`(`#85bfb6`)가 **아니다** | ⓐ **`D-01` 범위를 확장**해 수용 · ⓑ 가값 `P-xx` 로 등록하고 디자이너 대기 · ⓒ 라벨 색 변경(Figma 와 어긋남 → 규칙 1 대상). **ⓑ 권장** — `P-01`·`P-02` 선례와 같은 성격(디자이너 결정 대기)이고, ⓐ 는 **수용 예외의 범위를 Agent 판단으로 넓히는 것**이라 피해야 한다 | **NEEDS DECISION** |
| ~~**`N4-22`** (원문 보존)~~ | ⛔ **Plan 승인 시** | **Stage 4 를 어디까지로 닫는가** | `D4-8` 로 `C13-1`·`C13-14` 가 **디자이너 Figma 대기**다. ⓐ **Figma 를 기다려 단일 Stage 4 로 닫는다**(세션 화면까지 포함, 일정 미정) ⓑ **Stage 4a / 4b 로 쪼갠다** — 4a = contracts·Mock·RecordingController·로컬 영속·업로드 큐·이월(비시각, **지금 닫을 수 있다**) / 4b = 세션 화면·Drawer·완료 화면·예외 안내 UI(Figma 수령 후). 경계 전문 = **§16.3** | **ⓑ 권장** — ⓐ 는 `S4-A`~`S4-E` 가 **완성돼도 PASS 를 못 받는 상태**로 대기하게 만든다. `rules/qa.md` §2 상 미구현은 `FAIL` 이지 `PENDING` 이 아니므로, 단일 Stage 로 두면 **Verdict 를 낼 수 없다** | **NEEDS DECISION** |
| **`N4-23`** ⭐ 신규 | ⛔ **S4-F 전** | **`ready` 상태의 하단 버튼** | `D4-5` 는 `recording`→`Submit` · `paused`→`Resume` **2개만** 정했다. Figma `28:51`(ready/recording 혼합 프레임)에 배치된 하단 버튼은 **`Resume`** 인데 ready 에서 `Resume` 은 의미가 맞지 않는다. 선택지: ⓐ **버튼 없음**(Record Control 만) ⓑ **Prompt Drawer 트리거**로 쓴다(PRD §7.5 *"하단 보조 버튼('Prompt 모아보기')"* 와 일치) ⓒ 다른 라벨 | **ⓑ 권장** — PRD §7.5 가 하단 보조 버튼을 **"Prompt 모아보기"** 로 명시하고, `C13-4`(Drawer 트리거 없음)를 **같은 슬롯으로 동시에 해소**한다. ⚠️ 라벨 신규 생성이므로 **규칙 2 대상** → `C13-1` Figma 요청에 **함께 포함**하는 것이 가장 안전 | **NEEDS DECISION** |
| **`N4-10`** | ⛔ **S4-H2 전** | **`OAQ-16` 대화 전용 세션 흐름** (C-13) | Figma **없음**(감사 `C13-6` 전수 확인). *"녹음 없는 체크리스트 모드"* 가 무엇인지 미정. ⚠️ **`D4-8` 의 분배에 들어 있지 않다** — 안내·상태 UI 가 아니라 **흐름**이기 때문이다. PRD §13 의 **P0**("마이크 권한 거부 → 대화만 하기")가 여기 걸린다 → AC-4-63 | **최소안**: ready 버블 → Prompt Drawer → `Submit` → `completed`(녹음·업로드·분석 없음). **체크리스트 UI 를 새로 만들지 않는다**(규칙 2). 분배는 **design-agent 명세**를 권장 — 새 화면이 아니라 **기존 세션 화면의 녹음 요소 제거판**이므로 | **NEEDS DECISION** (C-13 분배 + 흐름) |
| ~~**`N4-24`**~~ ✅ **해소 (`D4-14` — 해석이 틀렸고 `D4-6` 철회)** | ~~⚠️ S4-F 전~~ | **`D4-6` 의 Orchestrator 해석 재확인** | 사용자 직접 서술은 *"책관현 프롬프트는 버블에 표시하지 않는다"* 였다. Orchestrator 는 이를 ① ready 버블 = `88:757` 교체 ② `139:2803` pill 5개 미채택 ③ Prompt = Drawer 전용 으로 **해석**했다. 틀리면 ready 화면 전체와 `AD-S4-3` 등록이 되돌려진다 (`R4-14`) | **Plan 승인과 함께 확인** — 추가 왕복이 없다 | **NEEDS DECISION** (재확인) |
| **`N4-04`** | ⚠️ **S4-B 전** | **`M-32` 잔여 — Reading Context 없이 세션 시작 허용 여부** (`D-9`) | 서재 시트(`145:1132`·`163:1669`)는 **Context 선택 없이 바로 "Start Session"**. `CreateSession.readingContext` 는 **nullable** 로 이미 허용. Activity Card 경로는 `SelectActivityOptionRequest.readingContext` **필수**(`D-9`) | **서재 경로 `null` 허용 · Activity Card 경로 필수** — Contract 가 **이미 그렇게 표현**하고 있다 (**[직독]** `activity/selection.ts` 주석: *"서재 경로(`CreateSession.readingContext`)는 nullable 로 남으며 그쪽은 Stage 4 다"*). **확인만 받으면 된다** | **RECOMMENDED** |
| **`N4-09`** | ⚠️ **S4-E 전** | **`OAQ-11` 기기 로컬 미업로드 녹음 최대 보관 기간** | 상한 없음 / 7일 / 14일 / 48h+N … ⚠️ **`D4-1` 로 더 중요해졌다** — Stage 4 가 Web 뿐이므로 로컬 저장소는 **OPFS(브라우저 할당량 제약)** 이고, 네이티브 샌드박스보다 **브라우저가 임의로 비울 수 있다** | **상한을 두되 삭제 전 안내** — 권장 **14일 + 7일 시점 안내**. 근거: 48h 안내(§2.3)가 이미 있고 무한 보관은 최소 보관 원칙과 어긋난다. ⚠️ **결정 전에는 삭제하지 않는 쪽**(유실 방지 우선 — `ARCHITECTURE §10.5-6`)을 유지하고 그 사실을 기록한다. 삭제는 **유실**이므로 사용자 결정 필수 | **NEEDS DECISION** |
| **`N4-15`** | ⚠️ **S4-F 전** | **세션 화면 상단 TopBar `78:353`** | `78:353`(= `Title Titla type=two`, **뒤로가기 38×38 + gap 18 + 책 칩**)은 **section `31:204` 의 직계 자식**이고 `28:51` 의 **자식이 아니다**. 캔버스상 `28:51` local y=56 에 **겹친다**. `get_screenshot(28:51)` 에 **나타나지 않는다**. ⚠️ **감사도 "배치 의도인지 작업 잔여물인지 확인 불가"** 로 남겼다 (hidden 플래그가 MCP 에 노출되지 않는다) — 감사 §5 · §13. TopBar 에 **종료 버튼·제목·타이머가 없다** | ⓐ 배치하지 않는다(Figma 대로) / ⓑ `78:353` 을 상단에 쓴다. **세션 중 이탈 경로가 필요하므로 ⓑ 가 실용적**이고, `29:62` 에는 닫기(`29:76`)가 있으나 `28:51` 에는 **어떤 이탈 경로도 없다**. ⚠️ 규칙 2 대상 → **`C13-1` Figma 요청에 "TopBar 를 쓰는가 + 세션 이탈 경로" 를 포함**하는 것을 권장 | **NEEDS DECISION** |
| **`N4-05`** | ⚠️ **S4-J 전** | **`AC-3-22`~`26` Reading Context 선택 UI 의 디자인 소스** (C-13) | Figma 에 **진입점이 없다**(그 자리는 `★ Save`). 결과 chip `86:538` 만 존재. ⚠️ **`D4-8` 의 분배에 들어 있지 않다** — 안내 UI 가 아니라 **입력 화면**이기 때문이다 | ⓐ 디자이너 Figma 요청 / ⓑ design-agent 명세. **권장 ⓐ + 도달 Stage 재이월** — Stage 4 가 이미 크고, `C13-1`·`C13-14` 요청과 **묶어 보내면 왕복이 1회로 줄어든다** | **NEEDS DECISION** (C-13 절차) |
| **`N4-20`** | ⚠️ **S4-J 전** | **`QA-3-003` 에셋 파이프라인 도구** | `sharp` 도입 (스택 외 라이브러리) | **빌드 전용 devDependency 로 `sharp` 도입** — 런타임 번들에 들어가지 않는다. 라이브러리 추가는 승인 사항 (`rules/frontend.md` §1) | **NEEDS DECISION** |
| **`N4-21`** ⭐ 신규 | — | **Android 모바일 Web 실기기 부재 수용 범위** | `D4-4` 로 **Android 실기기가 없다.** Stage 4 는 Web 이므로 **Android Chrome 모바일 Web** 검증이 불가하다 → `NOT VERIFIED` **1건 예상**(AC-4-50 의 Android 모바일 Web 측정, AC-4-108 의 Android 백그라운드 거동). `rules/qa.md` §2 상 `NOT VERIFIED` 1건 이상 = **`INCOMPLETE`** 이므로 **항목별 명시 수용이 필요**하다 (Stage 3 `NV-1`·`NV-2` 선례) | **에뮬레이터·BrowserStack 등으로 대체하지 않는다**(`rules/frontend.md` §6-2 ⑤ — 측정 환경이 증거다). **`NOT VERIFIED` + 수동 절차 문서화**로 처리하고 **Stage Verdict 에서 항목별 수용**을 받는다 | **NEEDS DECISION** (수용 범위) |
| **`N4-11`** | — | **Push provider** | OneSignal(공식 Capacitor 플러그인, FCM+APNs+Web) / FCM·APNs 직접 / 보류 | **Stage 4 에서 선정하지 않는다** — `D-16` 이 이미 "provider SDK 금지" 로 결정했고, ⭐ **`D4-1` 로 네이티브 Push Adapter 자체가 후속 단계(`S4N-D`)로 갔으므로 선정 시점을 더 늦출 수 있다.** 선정은 후속 단계 또는 Backend 착수 시점 | **NEEDS DECISION** (`PLANNING.md:356`) — ⚠️ 알림 문구에 아이 이름이 들어가면 provider 가 **아동 PII** 를 처리한다(법무) |
| **`N4-13`** | — | **대화 전용 세션도 출석 스티커 지급 대상인가** | PRD 는 "세션 완료 시" 로만 적는다. `DATA_MODEL.md:299` 가 NEEDS DECISION 으로 남겨 뒀다 | **지급한다** — "출석"의 의미는 함께 읽은 시간이고, 마이크 거부로 대화만 한 보호자를 벌할 근거가 없다. ⭐ `D4-2` 로 문구가 **서버 제공**이 되었으므로 *"대화 전용에는 다른 문구"* 도 Frontend 변경 없이 가능하다 | **RECOMMENDED** |
| **`N4-16`** | — | **`OAQ-17` `skipped_audio_deleted`** | enum 에 넣을지 미정 (#16 이 "결정 전 제외") | **Stage 4 에서 넣지 않는다** — FR-21 로컬 삭제는 분석 전 단계이고 표시는 Stage 5 다 | **RECOMMENDED** (비차단) |
| **`N4-17`** | — | **Http Adapter 골격 작성 시점** | 각 Stage vs Stage 8 | **각 Stage** — Stage 1~3 이 이미 `Http*Api` 8종을 골격으로 두었다 (**[직독]**). Stage 4 도 `HttpSessionApi`·`HttpRecordingApi` 골격을 만든다 | **RECOMMENDED** (선례 일치) |
| **`N4-18`** | — | **마이크 권한 화면을 route 로 둘 것인가** | `/session/:sessionId/permission`(PLANNING §9.2 안) vs 세션 화면 내 상태 | **in-page 상태** — 권한은 세션의 한 단계이고 route 를 늘리면 뒤로가기 의미가 모호해진다. PLANNING §9.2 의 route 는 **RECOMMENDED** 표기이므로 Stage Plan 에서 확정 가능. ⭐ `D4-8` 로 이 화면이 **design-agent 명세**이므로 **Design Spec 에서 확정**해도 된다 | **RECOMMENDED** |

### 14.3 재집계

| 구분 | 수 |
|---|---|
| 초판 NEEDS DECISION | **20** (`N4-01`~`N4-20`) |
| **해소** | **7** — `N4-01`(부분) · `N4-02` · `N4-03` · `N4-06` · `N4-08` · `N4-12` · `N4-14`(부분) |
| **소멸 (Stage 4 범위 밖)** | **2** — `N4-07` · `N4-19` |
| **남은 초판 항목** | **11** — `N4-04` · `N4-05` · `N4-09` · `N4-10` · `N4-11` · `N4-13` · `N4-15` · `N4-16` · `N4-17` · `N4-18` · `N4-20` |
| **신규** | **4** — `N4-21`(Android 모바일 Web 수용) · `N4-22`(Stage 4 종결 경계) · `N4-23`(ready 하단 버튼) · `N4-24`(`D4-6` 해석 재확인) |
| **2026-10-12 합계** | **15** |

**⭐ 2026-10-13 재집계 (`D4-9`~`D4-12`)**

| 구분 | 수 | ID |
|---|---|---|
| 2026-10-12 기준 | **15** | — |
| **해소** | **3** | **`N4-22`**(`D4-9`) · **`N4-23`**(`D4-12`) · **`N4-05`**(§4.3 오기 정정) |
| **신규** | **5** | **`N4-25`**(폐기 전이 표현) · **`N4-26`**(비활성 시각·확인 다이얼로그) · **`N4-27`**(`paused` 재개 경로) · **`N4-28`**(Prompt Drawer 진입점) · **`N4-29`**(`Discard` 라벨 대비) |
| **2026-10-13 개정 1 합계** | **17** | — |

**⭐ 2026-10-13 개정 2 재집계 (`D4-13`~`D4-19`)**

| 구분 | 수 | ID |
|---|---|---|
| 개정 1 기준 | **17** | — |
| **해소** | ⭐ **5** | **`N4-24`**(`D4-14`) · **`N4-25`**(`D4-13`) · **`N4-26`**(`D4-17`·`D4-18`) · **`N4-29`**(`D4-16`) · **`N4-32`**(`D4-20`) |
| **신규** | **3** | **`N4-30`**(사유 구분 — **비차단·이연**) · **`N4-31`**(바 규격 `S4F-16`) · ~~**`N4-32`**~~(올린 같은 패스에서 **`D4-20`** 으로 해소됐다) |
| **합계** | ⭐ **15** | — |
| ⛔ **Stage 4a 완료 판정을 막는 것** | ⭐ **0** | ~~`N4-25`~~ 해소. **4a 는 결정 대기 없이 착수·종결할 수 있다** |
| ⛔ **Stage 4b 완료 판정을 막는 것** | **1** | **`N4-10`** 잔여 = 대화 전용 **흐름** 최소안 승인(`S4-H2` 전). ~~`N4-26`~~ 해소 |
| ⚠️ **작업 단위 착수 전 필요** | ⭐ **6** | **4a**: `N4-04`(S4-B) · `N4-09`(S4-E) · `N4-20`(S4-J) — **전부 ⚠️ 등급, 착수를 막지 않는다** / **4b**: `N4-27`·`N4-31`·`N4-15`(S4-F) · `N4-28`(S4-G) |
| **`S4-A` 착수를 막는 것** | **0** | 녹음 spike 는 **지금 시작할 수 있다** |
| 비차단 | **5** | `N4-11` · `N4-13` · `N4-16`~`N4-18` · `N4-21`(수용 범위) · `N4-30`(이연) |

### 14.4 이미 확정된 것 (재확인 — 다시 묻지 않는다)

| 항목 | 결정 | 라벨 |
|---|---|---|
| **Capacitor 도입 시점** | ⭐ **변경됨** — #7 의 *"Stage 4 에서 추가"* 를 **분리된 후속 단계로 이연** (`D4-1`, §0.4). 도입 자체는 유지 | **CONFIRMED** (`D4-1`, 2026-10-12 — **#7 변경**) |
| Session 상태 모델 | PRD 7상태 + `abandoned` · `mode` · `completedReason` · `analysisOutcome` · 별도 upload status · retry 는 상태 아님 | `CONFIRMED` (#16) |
| 30분 기준 | **실제 녹음 시간 기준(일시정지 제외)**, `MAX_RECORDED_SECONDS=1800` | `CONFIRMED` (#17-②) |
| 앱 컬럼·breakpoint | `--bp-md` 600 / `--bp-lg` 1024, 최대 480 가운데 정렬 (**웹 규칙 = Stage 4 In Scope**). portrait lock 은 후속 | `CONFIRMED` (#12) + `D4-1` |
| Supabase JS Client | Stage 1~8 **미사용** — `AuthGateway` · `recordingApi` + `UploadTransport` interface + Mock | `CONFIRMED` (#27) |
| 세션 탭 없음 | 세션은 Home 카드·서재 "Start Session" 에서 진입 | `CONFIRMED` (#15, `D-02`) |
| push 권한 구현 방식 | `PushPermissionPort` + Web(`Notification.permission` 까지만) + Mock, **provider SDK 금지** | `CONFIRMED` (`D-16`, 2026-10-02) |
| 알림 설정 **화면** | Stage 3 제외, 디자이너 Figma 대기 | `CONFIRMED` (`D-18`) |
| 데이터 관리·탈퇴 | **Stage 8** | `CONFIRMED` (C-15) |
| Start Session CTA | Stage 3 비활성 유지, **Stage 4 에서 연결** | `CONFIRMED` (§13.10, 2026-10-06) |
| 이월 3건 | `QA-3-001`·`002`·`003` 을 **Stage 4 In Scope 로 올린다** | `CONFIRMED` (§26.1 · §27.6 · §28.6-3) |
| 하단 버튼 | ⭐ **갱신** — 상태와 무관하게 **`Discard` + `Submit` 2개**(`285:1445`). `ready` **비활성** / 녹음 시작 후 **활성**. `Done Reading` **미생성**. ~~`paused`→`Resume`~~ 는 **재검토 대상**(`N4-27`) | **CONFIRMED** (`D4-12`, `D4-5` 부분 대체) |
| `Discard` | ⭐ **채택** — 폐기 + 홈 복귀 | **CONFIRMED** (`D4-12`, ~~`D4-7`~~ 무효) |
| `Submit` | 제출 → **Toast + `29:62` 이동** | **CONFIRMED** (`D4-12`) |
| Stage 4 분할 | **4a Recording Core / 4b Session Screens**. 4a PASS 로 **Stage 5 시작 안 함** | **CONFIRMED** (`D4-9`) |
| 스티커 부제 문구 | **`You read together today`** | **CONFIRMED** (`D4-10`) |
| `IconButton` glass 그림자 | **`--shadow-bubble`(1겹)** 로 교체 — 영향 **35곳/21파일** | **CONFIRMED** (`D4-11`) |
| Prompt 노출 경로 | ⭐ **갱신** — **ready 버블(`139:2803`)에 Prompt pill 5개를 표시**한다. Drawer 는 **녹음 중 재확인** 경로다 | **CONFIRMED** (`D4-14`, ~~`D4-6`~~ 철회) |
| 세션 시작 인사 자리 | **버블 제목 줄** = 서버 `bubble` 값, pill = `prompts`. Figma 기하 유지 | **CONFIRMED** (`D4-20`) |
| 녹음 폐기 contracts | **안 A** — 전이 2행만 추가, `AbandonedReason` **없음**, `SessionStatus` 8값 유지 | **CONFIRMED** (`D4-13`, **Stage 0 #16 변경**) |
| `Discard` 확인 다이얼로그 | **둔다** — design-agent 명세, Stage 1 `Dialog` 재사용, `AD-S4-4` 등록 대상 | **CONFIRMED** (`D4-17`) |
| 버튼 비활성 시각 | **전역 `opacity: 0.5`**(면·라벨 불변) + `aria-disabled` | **CONFIRMED** (`D4-18`) |
| 하단 바 배치 | 버튼 **135** · gap **9** · **열 가운데 정렬**(10px 보정 = `AD-S4-5`) | **CONFIRMED** (`D4-19`) |
| `Discard` 대비 | **Figma 그대로** + 가값 **`P-25`**. `D-01` 범위 **확장 아님** | **CONFIRMED** (`D4-16`) |
| PRD "읽기 완료" 용어 3곳 | **그대로 둔다** (`:86`·`:161`·`:163`) | **CONFIRMED** (`D4-15`) |
| Toast 문구 | **`Recording submitted`** | ⚠️ **Orchestrator 채택 — 변경 가능** (approvals §7) |
| 스티커 부제 | `D-6` 유지, **streak 문구 교체** | **CONFIRMED** (`D4-2`) |
| 애니메이션 | **CSS 모션**, 라이브러리 0개, reduced-motion 대체 필수 | **CONFIRMED** (`D4-3`) |
| 실기기 | **iOS 있음 / Android 없음** | **CONFIRMED** (`D4-4`) |
| C-13 분배 | 안내·상태 UI = **design-agent 명세** / `C13-1`·`C13-14` = **디자이너 Figma 요청** | **CONFIRMED** (`D4-8`) |

---

## 15. Handoff to design-agent

### 15.1 ✅ 선행 Figma 실측 감사 — **완료됨** (2026-10-11)

`CLAUDE.md` **최우선 규칙 4** — *"구현 전에 해당 Figma 노드를 실측한다. 기억·추측·유사 화면으로 대체하지 않는다."*
선례: `docs/design/stage-3-home-figma-audit.md` · `docs/design/stage-3-library-figma-audit.md`.

> ⭐ **`docs/design/stage-4-session-figma-audit.md`(705행, design-agent, 2026-10-11) 가 이미 존재한다.** 초판의 이 요청은 **충족**됐다 (AC-4-95 전반부 통과).
> 아래 표는 **"감사가 무엇을 확정했고 / 무엇을 못 했는가"** 로 성격이 바뀌었다. **다시 감사하라는 요청이 아니다.**

| 노드 | 감사가 확정한 것 | 감사가 **못 한 것** |
|---|---|---|
| **`28:51`** (393×852, 자식 **6개**) | 전 노드 좌표·크기·간격 `[실측·meta]`, fill·그림자·타이포·radius·padding `[실측·ctx/svg]`. 세로 간격: status bar→ring **76** · ring bottom→tail **5** · bubble bottom→record **27** · record→button **16** · button→frame **20**. **가로 중심 어긋남 2건**(버블 +2 · 버튼 좌60/우52) | Prototype 연결(Reactions) — **MCP 가 노출하지 않는다** |
| **`29:62`** | y 0~468 전 노드 실측. 스티커 `29:79` 전수(257×64·radius 100·glass 74%·drop 1겹·gold 그라디언트 타일). **`91:691` 은 의도적으로 측정하지 않았다**(Stage 5) | `90:602` 아이콘이 `90:599 thumb_white` 인스턴스인지 — **master id 가 노출되지 않아 추정** |
| **`88:960`** Prompt Drawer | 전수 실측 + **`R-SHADOW-1` inset 산출**(§4.2). **3겹 전부 렌더하는 유일한 노드** | — |
| **`163:1590`** Record Control | 변형 **2개뿐**(`Record`·`Pause`) 확정. 링 3겹 선언(stroke 2px, opacity 0.35/0.6), 코어 solid + `0 12 28` 1겹 + `inset 0 2 0 white55%` `[실측·svg]` | **component set 의 기본 변형(default variant)** — MCP 미노출 |
| **`78:353`** TopBar | 내용 전수 실측. section 직계 자식임을 확정 | ⚠️ **"배치 의도인지 작업 잔여물인지 확인 불가"** — hidden 플래그 미노출 → **`N4-15`** |
| 캐릭터 에셋 | Chracter section 자식 **6개 전부 정지 raster** 확정 | 라이선스·출처 표기 **없음** → 보고 대상 (Stage 3 와 동일 상태) |

#### ⭐ Stage 4 Design Spec 요청 (감사 이후 — **이것이 이번 handoff 의 본문이다**)

> 감사는 끝났다. 다음 산출물은 **`docs/design/stage-4-design-spec.md`** 이며, 아래 범위로 **나눠서** 쓴다 — `C13-1`·`C13-14` Figma 대기 때문에 전부를 한 번에 쓸 수 없다.

| # | Spec 범위 | 지금 쓸 수 있는가 | 필요한 것 |
|---|---|---|---|
| **A** | **Prompt Drawer** (`88:960`) — 전 치수·토큰 매핑·캐러셀 동작·`R-SHADOW-1` inset(§4.2 산출값을 초기값으로, 픽셀 프로브 재확정)·키보드 경로 | ✅ **가능** (Figma 완비) | **트리거**는 `N4-23` 결정 후 |
| **B** | **완료 화면** (`29:62` y 0~468) — 닫기 `29:76` · 제목 `29:75` · 스티커 `29:79` · 메달리온 `29:86/87` · 버블 `88:929` | ✅ **가능** | ⚠️ 스티커 **부제 대체 문구 제안**(`D4-2`) 포함 + **y 468 아래 빈 영역 처리 방침**(AC-4-104) |
| **C** | **안내·상태 UI** — 마이크 권한(`C13-5`) · 업로드/오프라인/48h/크래시(`C13-7`~`10`) · **Web 백그라운드 경고**(`D4-4`) · 10분 리마인드(`C13-11`) · 30분 자동 종료(`C13-12`) | ✅ **가능** (`D4-8` → design-agent 명세) | ⚠️ 감사 §1.3: **Design Guide 에 Alert·Toast·Banner·Dialog·Sheet 가 0개** → Stage 1 공통 상태 컴포넌트(#22)를 기반으로 명세 |
| **D** | **세션 화면 상태별** (ready/recording/paused) + **Record Control 변형** | ⏳ **보류** | **`C13-1`·`C13-14` 디자이너 Figma** + `N4-23`(ready 하단 버튼) + `N4-15`(TopBar) + `N4-24`(`D4-6` 재확인) |
| **E** | **대화 전용 세션** (`C13-6`) | ⏳ **보류** | **`N4-10`** 결정 (분배 + 흐름) |
| **F** | **Reading Context 선택 시트** (`C13-13`) | ⏳ **보류** | **`N4-05`** 결정 (C-13 분배) |

#### ⭐ design-agent 가 **이번에 반드시 제안해야 하는 것** (`D4-2`·`D4-3` 귀결)

| # | 요청 | 제약 |
|---|---|---|
| **1** | **출석 스티커 부제 대체 문구** (`29:85` `Day 12 · keep the streak going` 대체) | **관찰 언어**(`rules/frontend.md` §8 — 진단·판정·비교 금지, 관찰·신호·성장 힌트). **streak·연속 일수·달성률 금지**(`D-6`·PRD §7.4). ⚠️ **문구는 서버(Mock) 응답 값으로 들어간다**(`P4-BIP-18`) — copy 모듈에 하드코딩하지 않는다. 사용자 승인 후 `AD-S4-1` 등록 |
| **2** | **CSS 모션 명세 4종** (`D4-3`) — ① Record Control **맥동**(링 2겹 opacity 0.35/0.6 이 정지 표현 → 모션 해석) ② 캐릭터 **경청**(FR-11 "듣고 있음") ③ 버블 **등장** ④ **완료**(PRD §7.5 "완료 애니메이션") | **CSS/Pointer Events 만**(Stage 0 #9). 각 모션에 **`prefers-reduced-motion: reduce` 대체 정의 필수**(AC-4-98 이 1:1 대조로 검증). `DESIGN_SYSTEM §9.3-4` *"녹음 중 무한 모션 개수 규칙"* 준수. **시각 baseline 정지 수단**을 함께 명세(`R-BASELINE-1`) |
| **3** | **신규 토큰 10건(`T-1`~`T-10`) 채택/흡수 판정안** (감사 §7.2) | 각 항목에 **흡수 대안**이 이미 적혀 있다. ⚠️ **`T-1`(white a86 ↔ a85 Δ0.01)·`T-7`(스티커 그림자 알파 25↔10)는 감사가 `DECISION-NEEDED` 로 남겼다** — 임의 판정 금지 |
| **4** | **`S4F-01`~`S4F-15` 처리안** (감사 §11 — 이번 실측에서 **새로 드러난** 15건) | 특히 **`S4F-02`**(pill 본문이 Figma 자체에서 38px 를 넘친다) · **`S4F-03/04`**(세션 버블 tail 기하가 Home 과 다르다 — 중앙 50% · skew 없음) · **`S4F-11`**(가로 중심 어긋남) · **`S4F-12`**(저장소 `IconButton` drop 3겹 ↔ Figma 1겹, `AD-3` 열거에 IconButton 이 **없다**) · **`S4F-13`**(타이포 14/10 스케일 부재) |
| **5** | **`C13-1`·`C13-14` 디자이너 요청서 초안** (`D4-8`) | 요청에 **포함할 것**: ready/recording/paused 3상태 프레임 · Record Control `paused`/`disabled`/permission-denied 변형 · **녹음 경과 시간 표시**(`C13-3`) · **Prompt Drawer 트리거**(`C13-4`) · **ready 하단 버튼**(`N4-23`) · **TopBar 배치 여부 + 세션 이탈 경로**(`N4-15`). ⚠️ `N4-05`(Reading Context 시트)를 **같은 요청에 묶으면 왕복이 1회로 줄어든다** |


### 15.2 Figma 에 **없는** 화면 — C-13, **`D4-8` 분배 적용됨**

> `rules/workflow.md` §3 · Stage 0 C-13. **`D4-8` 이 분배를 끝냈으므로 "무엇으로 할지" 를 다시 묻지 않는다** — 단 **`C13-S4-3`·`C13-S4-6` 2건은 `D4-8` 에 포함되지 않았다**(§4.3).

| ID | 감사 ID | 화면 / 상태 | **`D4-8` 분배** | 조합 가능한 기존 컴포넌트 |
|---|---|---|---|---|
| `C13-S4-1` | `C13-1`·`C13-3`·`C13-4`·`C13-14` | `/session/:sessionId` **상태별** + Record Control 변형 + 경과 시간 + Drawer 트리거 — `M-26` | ⭐ **디자이너 Figma 요청** | `RecordButton`(신규) · `Button`(`Submit`/`Resume`) · `PromptDrawer` |
| `C13-S4-2` | `C13-5` | 마이크 권한 안내 → 설정 딥링크 → "대화만 하기" | **design-agent 명세** | `CharacterMedallion` · `Surface` · `Button` ×2 |
| `C13-S4-3` | `C13-6` | **대화 전용 세션 흐름** (`OAQ-16`) | ⛔ **미분배** → **`N4-10`** | **불가 — 흐름 미정** |
| `C13-S4-4` | `C13-7`~`10` | 업로드/오프라인/48h/크래시 복구 안내 · **Web 백그라운드 경고**(`D4-4`) | **design-agent 명세** | `InlineAlert`/`Toast`(Stage 1 존재) + **`UploadStatusBadge` 신규** |
| `C13-S4-5` | `C13-11`·`C13-12` | 10분 리마인드 버블 · 30분 자동 종료 안내 | **design-agent 명세** | `SpeechBubble` · `Dialog` · `InlineAlert` |
| `C13-S4-6` | `C13-13` | Reading Context 선택 시트(6값 + `custom_time`) — 이월 `AC-3-22`~`26` | ⛔ **미분배** → **`N4-05`** | `Sheet` + `Chip`/`RadioGroup` |
| — | `C13-2` | ~~"Done Reading" 버튼~~ | ✅ **해소 — `D4-5`**(`Submit`/`Resume` 사용) | — |
| — | `C13-15` | 세션 TopBar `78:353` 배치 여부 | ⚠️ `C13-1` 요청에 포함 권장 → **`N4-15`** | — |
| — | `C13-16` | `Discard`/`Submit` 소속 화면 | ✅ **해소 — `D4-12`**(둘 다 채택, `285:1445` 에 소속) | — |

### 15.3 신규 Component / Variant / State 요청

| 컴포넌트 | 위치 제안 | Variant / State | 근거 |
|---|---|---|---|
| **`RecordButton`** | `packages/ui` (시각만) | `idle`(= Figma `Record`, 마이크 + `Tap to recording` 10px) · `recording`(= Figma `Pause`, **라벨 없음**) · **`paused`(Figma 없음 — `C13-14`)** · **`disabled`(⭐ **`D4-18`**: 전역 `opacity .5`, 전용 변형 불필요)** · **`permission-denied`(없음 — `C13-14`)** + **CSS 맥동 모션**(`D4-3`) + `prefers-reduced-motion` 대체. 치수 **150/122/108**, 아이콘 40 `[실측·svg]` | `COMPONENT_MAP:125` · `163:1590` · 감사 §2.5 · ⏳ `C13-14` |
| **`UploadStatusBadge`** | 도메인(`entities/recording`) 권장 | `local_only` · `queued` · `uploading` · `uploaded` · `failed_retrying` · `stalled_48h` | `COMPONENT_MAP:132` · `ARCHITECTURE §10.5` |
| **`PromptCarousel`** | `packages/ui` | `first` · `middle` · `last`(화살표 비활성). ⚠️ **1 아이템 = 1 페이지** 구조(감사 §4.1) — pill 1개 + 코칭 노트 1개 + dots | `COMPONENT_MAP:119` · `88:960` |
| **`AttendanceStickerChip`** | 도메인 | — (획득 모션 **Figma 없음** → `D4-3` 으로 **CSS** 명세). ⚠️ **부제 문구는 응답 값**(`D4-2`·`P4-BIP-18`) | `COMPONENT_MAP:124` · `29:79` |
| `CharacterMedallion` 모션 | 기존 확장 | `idle` · **`listening`** · **`celebrate`** — ⭐ **에셋 없이 CSS 로**(`D4-3`). 두 화면의 avatar 는 **같은 그림**이고 ring/avatar 크기만 다르다(190/174 ↔ 150/136) `[실측]` → **크기 variant 2종 + 모션 3종** | `COMPONENT_MAP:111` · 감사 §6 질문 10 |
| 세션 타이머 표시 | 도메인 | 경과 시간 · 30분 근접 경고 | FR-09 (**Figma 없음** — `C13-3`, ⏳ `C13-1` 요청 포함) |

### 15.4 신규 토큰 — ⭐ **감사가 후보 10건을 이미 올렸다** (§7.2 `T-1`~`T-10`)

> 초판의 "요청 후보" 는 감사 §7.2 로 **대체**된다. 아래는 **판정이 필요한 것**만 다시 적는다.

| 후보 | 상태 |
|---|---|
| `T-1` `--haru-white-a86` (드로어 면) | **DECISION-NEEDED** — `--haru-white-a85` 와 Δ0.01. 저장소는 a74/a82/a85/a90 을 **구분 유지**하는 방침 |
| `T-7` `--shadow-sticker-badge` | **DECISION-NEEDED** — `--shadow-icon-chip` 과 **기하는 같고 알파만 다르다**(ink 25↔10, white 60↔50). 흡수하면 **눈에 띄게 연해진다** |
| `T-3` `--shadow-record-core` · `T-4` gradient(스티커) · `T-5` gradient(표지 placeholder) · `T-8` 세션 버블 tail · `T-9`/`T-10` 치수 | **신규 필요** — 기존 토큰으로 표현 불가 (`T-8` 은 Home tail 과 **기하가 다르다**) |
| `T-2` white a55 · `T-6` 링 opacity | 흡수 또는 컴포넌트 CSS 상수 — 유력 |
| ⭐ **`T-13` `--haru-gray-2` `#aeaeb2`** (`Discard` 면) | ⭐ **승인됨 (`D4-16`)** — Primitive 1 + Tier-2 `--color-action-neutral-bg` · `--color-action-neutral-fg`. **저장소에 이 값이 없다**(design-agent grep 0건) · `--haru-ink-300`(`#b3c0bf`, 녹색조)으로 **흡수하지 않는다**(`R-FIGMA-1` ③). **`provisional: P-25` 주석 + dev gallery 등재 필수**(AC-4-119) |
| ⭐ **`T-12`** 바 gap/폭 (Tier-3) | **판정 필요** — `D4-19` 가 폭 135·gap 9 를 확정했고 `N4-31`(`S4F-16`)이 규격 승인 대상이다 |
| ⭐ **모션 토큰** (`D4-3` 신규) | **맥동·경청·등장·완료의 duration/easing** + reduced-motion 대체. `DESIGN_SYSTEM §9` 확장 · *"녹음 중 무한 모션 개수 규칙(§9.3-4)"* 준수 |
| upload status tone (6상태) | `InlineAlert` tone 5종으로 충분한지 판정 — 가값 `P-04` 와 연동 |
| Drawer 그림자 inset | ✅ **감사 §4.2 가 산출**(좌우 56 · 위 28 · 아래 84, 산술 상한). **픽셀 프로브로 재확정** |

### 15.5 design-agent 가 함께 확인할 것

1. ~~`M-26`·`M-25`·`G-09` 의 Figma 실태를 독립 재확인~~ → ✅ **완료** (감사 2026-10-11, `R-FIGMA-1` 준수 기록 §0.3 포함).
2. ~~`29:85` "keep the streak going" 문구 존재 확인~~ → ✅ **완료** (`[실측·ctx]`) → **`D4-2` 로 결정됨**. 남은 일 = **대체 문구 제안**(§15.1 요청 1).
3. **Stage 3 잔여 design-agent 소관 2건**(`AD-L-*` 허용 차이 부여 · Design Spec §6.1 서술 수정 — **[직독]** `stage-3-approvals.md` §30.8)이 **아직 열려 있다**.
4. `88:960` 이 **배치되지 않은 컴포넌트**라는 사실을 전제로, Drawer 가 어느 화면 위에 어떤 트리거로 뜨는지는 **명세 대상**이다 (⭐ `N4-28` 와 연결 — `D4-14` 로 요구가 **녹음 중 재확인 경로**로 좁아졌다).
4-b. ⭐ **`S4F-01`·`S4F-02` 처리안** (`D4-14` 로 되살아났다) — ① Prompt 개수 n 이 가변(`D-21`: 상한 없음)일 때 `139:2803`(**329×269**, pill 5 기준 · padding 위 14 / 아래 13) 의 **높이 정책** ② pill 본문이 **Figma 자체에서 38px 를 2줄로 넘친다** → 1줄 clamp 인지 2줄 허용인지. ⚠️ **Figma 가 스스로 넘치므로 "Figma 대로" 가 답이 아니다** — 최우선 규칙 4 의 *"실측값과 다르게 구현해야 할 이유"* 를 보고하고 승인받는 경로로 처리한다. Home pill 선례(`--prompt-pill-text-line: 12` × 2줄)를 쓸 수 있는지 판정할 것.
4-c. ⭐ **`Discard` 확인 다이얼로그 명세** (`D4-17`) — Stage 1 `Dialog` 재사용(신규 Shared UI 0건) · 문구는 copy 모듈 · **비가역성을 알리는 문장** · 포커스 트랩·`Escape` 취소. 검증 = AC-4-115·116.
4-d. ⭐ **`T-13` 토큰 명세에 `provisional: P-25` 주석**과 **dev gallery 등재**를 포함할 것 (AC-4-119). ⭐ **`S4F-16` 판정안**(`N4-31`) 도 함께.
5. ⭐ **캐릭터 에셋 라이선스 표기가 Figma 에 없다** (`221:1147` 6개 원본 전부 — 감사 §12). Stage 3 와 **같은 상태**다. C-17(권리 확보됨) 이 있으나 **Figma 자체에 표기가 없다는 사실**을 보고 대상으로 유지한다.
6. ⭐ **`163:2528` 메달리온 합성본은 JPEG(투명도 없음)이고 그라디언트 배경이 구워져 있다** (감사 §12) — **앱 배경이 바뀌면 어긋난다.** 권장: ring(white 50%) + **투명 PNG `163:2530`** 조합. `QA-3-003` 에셋 파이프라인(AVIF/WebP)과 함께 처리.

---

## 16. 작업 분해 (검증 가능한 단위) — **`D4-1`·`D4-8` 로 재구성**

> ⚠️ Stage 3 에서 **과도하게 큰 작업 단위가 agent stall 을 일으킨 전례**가 있다 (`R4-09`). 아래는 **한 단위 = 한 번의 development-agent 호출**을 기준으로 쪼갰다. 각 단위는 **그 단위만으로 `pnpm typecheck && lint && test` 가 통과**해야 한다.
> **변경 요약**: `S4-A` **성격 전환**(네이티브 플러그인 조사 → **Web `MediaRecorder` 청크·크래시 복구 검증**) · `S4-H` **분할**(H1 완료 화면 / H2 예외·안내 UI) · `S4-I` **삭제**(→ §3.0 `S4N-A`~`D`). 단위 **11 → 11**(−1 +1).

### 16.1 단위

| 단위 | 범위 | 완료 판정 기준 | 선행 |
|---|---|---|---|
| **`S4-A`** ⭐ **성격 전환 — Web 녹음 spike** | ~~Capacitor 플러그인 조사~~ → **Web 전용**: ① `MediaRecorder` **timeslice 청크 기록** → **OPFS + IndexedDB 영속** ② **크래시 복구** — 탭 강제 종료·새로고침·브라우저 종료 후 **미완료 청크 복원** ③ **실제 `mimeType`** — 데스크톱 Chrome/Safari/Firefox + **iOS Safari** 의 `MediaRecorder.isTypeSupported` 실측 ④ **30분 세션의 실제 part 수** 추정(인터럽션·재시작 반복 시 20 초과 여부) ⑤ **Web 인터럽션 3종** 거동(`visibilitychange`·`devicechange`·`MediaStreamTrack.onended`) ⑥ **백그라운드·탭 비활성·iOS 화면 잠금 시 청크 수신 중단 여부 측정** ⑦ **OPFS 할당량·브라우저 임의 비움** 거동 | **문서 산출물**: `docs/decisions/stage-4-recording-spike.md` — 위 7항목에 **측정 환경(브라우저·버전·OS·기기)과 측정 방법**이 적혀 있다. *"보장 불가"* 같은 **문서 인용이 아니라 실측 로그**여야 한다 (`rules/frontend.md` §6-2 ⑤). **`C4-OPEN-1`·`C4-OPEN-2` 가 결정 가능 상태**가 되고, **AC-4-108 의 측정 데이터가 확보**되며, **`N4-09`(로컬 보관 상한) 판단 근거**(OPFS 거동)가 생긴다. **spike 코드는 제품 코드에 남기지 않는다** | **없음** — ⭐ **지금 착수 가능**(`N4-07` 승인 불필요, 네이티브가 빠졌으므로) |
| **`S4-B`** | **contracts** — `sessions/` 4파일 · `recordings/` 2파일 · `enums/push-platform` · (`sticker`) + 단위 테스트. ⭐ `StickerAward` 에 **문구 필드 포함 · `dayCount` 비포함**(`D4-2`) ⭐ **`SESSION_TRANSITIONS` 에 2행 추가**(`D4-13` 안 A — `recording → abandoned` · `paused → abandoned`) | AC-4-05~20 통과. **전이표 행 `12 → 14`**(추가 2행만) · **enum 값 추가 0** · **error code 추가 0** 이 스냅샷으로 증명됨(**AC-4-07** · AC-4-06 · AC-4-08) + `git diff` 로 **승인 범위 외 변경 0건**(`R4-16`) | `S4-A`(mimeType·part 상한) · ⚠️ **`N4-04`** — ✅ ~~`N4-25`~~ **해소**(`D4-13`) |
| **`S4-C`** | **Mock 기반** — `MockSessionApi` · `MockRecordingApi` · `MockUploadTransport` + scenario **메서드 단위 override** + Idempotency 보관·재생 + ⭐ **`web-background-warning` 시나리오**(`D4-4`) + **인터럽션 3종 구분**(`D4-1`) | AC-4-21~37 · AC-4-87 통과. 모든 응답 parse 통과 + 결정성 테스트 | `S4-B` |
| **`S4-D`** | **RecordingController 코어** (순수 TS) — 상태 머신 · `ConsentGate` · `PermissionService` · 타이머(30분/10분) · ⭐ **`RecorderAdapter` interface + Web 구현**(`D4-1`) | AC-4-43~49 · AC-4-62 통과. **React 의존 0** grep 증거. `MockRecorderAdapter` 상태 머신 테스트 전수. ⭐ **`RecorderAdapter` interface 에 `MediaRecorder`·DOM 타입이 노출되지 않는다**(`R4-01` 완화 — 후속 단계가 Adapter 추가만으로 끝나려면 필수) | `S4-B` |
| **`S4-E`** | **로컬 영속 + 업로드** — `LocalRecordingStore`(OPFS+IndexedDB) · `SessionOutbox` · `UploadQueue` · network/appState port(`visibilitychange`·`devicechange` 포함) | AC-4-27 · 31~33 · 66 · 67 · 71 · 72 통과. **확정 전/후 파일 수 2시점 측정** 테스트 존재. ⭐ **Web 백그라운드 한계 측정(AC-4-108) 재현 경로** 존재 | `S4-D` · ⚠️ **`N4-09`** |
| **`S4-F`** | **세션 화면** — `pages/session` · `features/storytime-session` · `RecordControl` · 상태별 컨트롤(`Record`/`Pause` + `Discard`/`Submit`) · ⭐ **ready 버블 = `139:2803`**(Prompt pill 5개 — `D4-14`) · **비활성 `opacity .5`**(`D4-18`) · **바 가운데 정렬**(`D4-19`) · 타이머 표시 + **"Start Session" CTA 활성화** | AC-4-38~42 · 50~52 · 95~100 · **111**·**112**·**113**(화면·route)·**114**·**115**·**116**(확인 다이얼로그)·**117**·**118**·**119**·⭐ **120**~**122** 통과. Figma 감사 문서와 대조 완료. ⭐ **`Discard` 확인 다이얼로그(`D4-17`)는 이 단위에 포함**된다 — Stage 1 `Dialog` 재사용이므로 신규 Shared UI 0건 | `S4-D` · ⏳ **`C13-14` Figma**(`paused`·permission-denied) · **Design Spec D 승인** · ⚠️ `N4-32`·`N4-27`·`N4-31`·`N4-15` — ✅ ~~`N4-23`~~·~~`N4-26`~~ **해소** |
| **`S4-G`** | **Prompt Drawer** — `features/prompt-drawer` · `PromptCarousel` | AC-4-53~56 통과. 무음·무진동 런타임 스파이 증거. ⭐ **`D4-14` 로 요구가 바뀌었다** — *"닫힌 상태 DOM 에 Prompt 본문 0건"* 은 **폐기**되고(ready 버블이 이미 보여준다), **ready 버블과 Drawer 가 같은 `prompts` 출처를 쓴다**는 동일성 증거로 대체된다(AC-4-53 재수정) | `S4-F`(트리거 슬롯) · ⚠️ **`N4-28`** — ⭐ Spec A(Drawer 본체)는 Figma 완비라 먼저 쓸 수 있다 |
| **`S4-H1`** ⭐ 신규 분할 | **완료 화면** — `SessionCompletePage`(`29:62` y 0~468) · `AttendanceStickerChip` · 종료 버블 | AC-4-57~61 · **104** · **107** 통과. **y 468 아래 렌더 요소 0건** 증거 | `S4-F` · ⚠️ **스티커 대체 문구 승인**(`D4-2`) |
| **`S4-H2`** ⭐ 신규 분할 | **예외·안내 UI** (`D4-8` → **design-agent 명세로 진행 가능**) — 마이크 권한 · 대화 전용 · 업로드/오프라인/48h/크래시 안내 · **Web 백그라운드 경고** | AC-4-63~65 · 68~70 통과 | `S4-E` · **Design Spec C 승인** · ⛔ **`N4-10`**(대화 전용) |
| **`S4-J`** | **이월 처리** — `QA-3-001` push 기능군(**Web 6요소**) · `QA-3-002` 오프라인 캐시 · `QA-3-003` 에셋 파이프라인 · §30.7 Mock 2건 · `QA-3-011` | AC-4-81~88 통과 | `S4-C` · ⚠️ **`N4-20`**·**`N4-05`** |
| **`S4-K`** | **회귀 + e2e + 시각** — 모션 정지 전략(⭐ **CSS 기준** — `prefers-reduced-motion` 강제 + `animation-play-state`) · baseline · 양축 프로브 · 전체 스위트 | AC-4-101~103 · **109** 통과. Playwright **단독 실행** | 전 단위 |
| ~~`S4-I`~~ | ~~Capacitor 셸~~ | ⛔ **삭제 → §3.0 `S4N-A`~`S4N-D`** (`D4-1`) | — |

### 16.2 순서

**권장 순서**: `S4-A → S4-B → S4-C → S4-D → S4-E → S4-J → (Design Spec C 승인) → S4-H2 → (C13-1·C13-14 Figma + Design Spec D 승인) → S4-F → S4-G → S4-H1 → S4-K`

⭐ **초판과 달라진 점**: `S4-J`(이월)와 `S4-H2`(안내 UI)를 **세션 화면보다 앞으로** 당겼다. `D4-8` 로 세션 화면이 Figma 대기이므로, **대기 중에 할 수 있는 일을 먼저 한다.**
**병렬 가능**: `S4-J` 는 `S4-C` 이후 독립. `S4-H2` 는 `S4-E` 이후 독립.

### 16.3 ⭐ Stage 4 종결 경계 — **디자이너 Figma 대기가 완료 판정을 막는가** (`N4-22`)

**판단: 막는다 — 단일 Stage 4 로 두는 한.**

근거:

1. `rules/qa.md` §1 에서 **미구현은 `FAIL`** 이다. `BACKEND_INTEGRATION_PENDING` 은 *"실제 **Backend** 구현이 필요해 검증할 수 없는 부분"* 이고, **디자이너 Figma 대기는 Backend 사유가 아니다.** 따라서 `S4-F`·`S4-G`·`S4-H1` 의 AC(AC-4-38~61 · 95~100 · 104 · 106 · 107)는 **`FAIL` 또는 `PARTIAL`** 로 기록된다.
2. `rules/qa.md` §2 에서 `FAIL ≥ 1` 이면 **Stage Verdict `FAIL`**, `PARTIAL`/`NOT VERIFIED ≥ 1` 이면 **`INCOMPLETE`** 다. 어느 쪽도 **`PASS` 가 아니다.**
3. `rules/workflow.md` §4 에서 **Stage Verdict `PASS` 전에는 다음 Stage(5)로 진행할 수 없다.**

→ 즉 Figma 를 기다리는 동안 `S4-A`~`S4-E`·`S4-J`·`S4-H2` 를 **완성해도 Verdict 를 낼 수 없고, Stage 5 도 시작할 수 없다.**

**지금 닫을 수 있는 경계 (권장 ⓑ — Stage 4a / 4b 분할)**:

| | **Stage 4a — "Recording Core" (지금 닫을 수 있다)** | **Stage 4b — "Session Screens" (Figma 수령 후)** |
|---|---|---|
| **단위** | `S4-A` · `S4-B` · `S4-C` · `S4-D` · `S4-E` · `S4-J` · (+`S4-H2` 는 선택 — Design Spec C 승인 시) | `S4-F` · `S4-G` · `S4-H1` · `S4-K` (+`S4-H2` 가 4a 에 없으면 여기) |
| **In Scope 요구사항** | FR-14(업로드 클라이언트) · FR-02(동의 차단 로직) · FR-21(로컬 삭제 API) · FR-23(contract 분기) · NFR 오프라인·크래시 복구·**Web 백그라운드 한계 측정** · 이월 6건 | FR-09 · FR-10 · FR-11 · FR-19 · FR-25(세션 화면 반응형) · §13 화면 UX |
| **AC** | AC-4-01~03 · 05~37 · 43~49 · 62 · 66·67 · 71·72 · 81~94 · **105** · **108** · **109**(일부) — **약 70건** | AC-4-38~42 · 50~61 · 63~65 · 68~70 · 95~104 · 106 · 107 — **약 30건** |
> ⚠️ **이 표는 2026-10-12 시점의 판단 근거 보존용이다.** AC 집계는 **§16.4.3 · §16.5.3 · §11.13(개정 2, 합계 111)** 가 정본이다 — 위 칸의 `105`·`106` 은 **폐기된 AC** 이므로 집행 대상이 아니다.
| **Verdict 가능?** | ✅ **가능** — 전부 contracts·Mock·순수 TS·테스트로 검증된다. 화면 의존 AC 가 없다 | ⏳ Figma 수령 후 |
| **차단 결정** | ⚠️ `N4-04`(S4-B) · `N4-09`(S4-E) · `N4-20`·`N4-05`(S4-J) — **전부 ⚠️ 등급, 착수를 막지 않는다** | ⛔ `N4-23` · `N4-10`(4a 에 `S4-H2` 를 넣으면 여기도) · ⚠️ `N4-15` · `N4-24` |

⚠️ **분할하지 않고 ⓐ(기다린다)를 택할 경우**: Stage 4 는 **`INCOMPLETE` 로 장기 정체**한다. 그 상태에서 Stage 5 를 시작하면 `rules/workflow.md` §4 위반이므로, **분할 없이 진행하려면 "Figma 수령까지 대기" 를 명시적으로 수용**해야 한다.

⚠️ **4a/4b 로 쪼갤 때 반드시 함께 결정할 것**: ① Stage 번호 표기 방식(`4a`/`4b` vs Stage 4 안의 `Phase 1`/`Phase 2`) ② `PLANNING.md` §5 Stage 표의 반영 방식 ③ **Stage 4a `PASS` 로 Stage 5 를 시작할 수 있는가** — 권장 **아니오**(Stage 5 회고 카드가 `29:62` **같은 프레임**이고 완료 화면(`S4-H1`)이 4b 라서, 4b 를 건너뛰면 Stage 5 가 **빈 상단 위에** 카드를 얹게 된다).

#### ⚠️ design-agent 산출물과의 불일치 1건 (2026-10-12, **사용자 판단 필요**)

이 개정과 **같은 날** design-agent 가 `docs/design/stage-4-designer-request.md`(336행, DRAFT)를 만들었다. 그 §0 한 장 요약은 **`ready` 화면이 막히지 않는다**고 적는다 — *"`ready`(`28:51`) · 완료 상단 · Prompt Drawer · 안내 상태 UI 12종은 Design Spec 으로 병렬 진행한다"*.

**이 Plan 의 판단은 다르다.** 근거:

| 쟁점 | design-agent | 이 Plan |
|---|---|---|
| `ready` 화면을 지금 명세할 수 있는가 | **가능** (`28:51` 이 Figma 에 있다) | **부분만 가능** — `28:51` 의 **하단 버튼은 `Resume`** 이고(`[실측·ctx]`) **`Resume` 은 ready 에서 의미가 맞지 않는다**. `D4-5` 는 `recording`·`paused` 만 정했다 → **`N4-23`** |
| `ready` 버블 | `28:51` 에 배치된 것 | **`D4-6` 으로 `88:757` 로 교체** — 즉 `28:51` 의 ready 구성은 **이미 그대로 쓸 수 없다**(허용 차이 `AD-S4-3`) |
| 결론 | ready 는 비차단 | ready 는 **`N4-23` 해소 후** 명세 가능 — 단 **Drawer 본체·완료 상단·안내 UI 는 양쪽 모두 비차단으로 일치** |

→ **불일치는 "ready 화면 1건" 에 한정**되고, **Spec A/B/C(Drawer·완료 상단·안내 UI)는 양쪽이 일치**한다. 따라서 **진행에는 영향이 없다** — 다만 **`N4-23` 을 결정하기 전에 ready 화면을 명세·구현하면 되돌릴 위험**이 있으므로(`R4-14` 와 같은 성격), Orchestrator 는 **`N4-23` 을 `S4-F` 착수 전 필수로 유지**할 것을 권한다. 어느 쪽이 맞는지는 **사용자 판단 사항**이며 Agent 가 임의로 정하지 않는다.

---

## 16.4 ⭐ Stage 4a — "Recording Core" (`D4-9`, CONFIRMED 2026-10-13)

> **`N4-22` 의 결정 결과다.** §16.3 의 판단 근거는 그대로 유효하며, 이 절은 그 결정을 **실행 가능한 경계**로 고정한다.
> 표기는 **`4a` / `4b`** 다 (Stage 번호를 밀지 않는다 — Stage 5~8 은 그대로).

### 16.4.1 범위

| 포함 단위 | `S4-A`(Web 녹음 spike) · `S4-B`(contracts) · `S4-C`(Mock) · `S4-D`(RecordingController 코어 + `RecorderAdapter` interface + Web 구현) · `S4-E`(로컬 영속 + 업로드 큐) · `S4-J`(Stage 3 이월) |
|---|---|
| **제외** | 세션 화면·Prompt Drawer·완료 화면·예외 안내 UI — 전부 **4b** |
| **`S4-H2`(예외·안내 UI) 는?** | **4b 로 보낸다.** 2026-10-12 개정은 *"Design Spec C 승인 시 4a 에 넣을 수 있다"* 로 열어 뒀으나, `S4-H2` 의 AC(AC-4-63~65·68~70)가 **전부 화면 판정**이고 `N4-10` 잔여(대화 전용 흐름)에 걸려 있다. **4a 를 비시각으로 순수하게 유지**하는 편이 Verdict 를 깨끗하게 만든다 |

### 16.4.2 In Scope 요구사항

| ID | 4a 가 하는 부분 |
|---|---|
| **FR-14** | 업로드 클라이언트 전부 — `LocalRecordingStore` · `SessionOutbox` · `UploadQueue` · `recordingApi` 호출 · `UploadTransport`(Mock) |
| **FR-02** | 동의 없음 시 녹음 시작 차단 **로직**(`ConsentGate`). 차단 **화면**은 4b |
| **FR-21** | `LocalRecordingStore` 삭제 API + `performSessionCleanup` 확장 + ⭐ **`Discard` 의 저장소·Outbox 처리**(`D4-12`). 버튼 **UI 는 4b** |
| **FR-23** | `CreateSession` 의 `bookId`/`childBookId` 분기 (contract + Mock) |
| **FR-09 (일부)** | `RecordingController` 상태 머신 · 30분/10분 타이머 · 전이 호출. **화면은 4b** |
| **NFR** | 오프라인 · 크래시 복구 · **Web 백그라운드 한계 측정**(`D4-4`, AC-4-108) · 녹음 시작 지연 측정 |
| **이월 6건** | `QA-3-001`(push 6요소) · `QA-3-002` · `QA-3-003` · `AC-3-22`~`26`(contract 부분) · §30.7 Mock 2건 · `QA-3-011` |

**요구사항 ID 기준 = 7항목 + 이월 6건.**

### 16.4.3 AC 목록 (**약 73건** — 개정 2 에서 **수 변동 없음**)

`AC-4-01` ~ `03` · `05` ~ `37` · `43` ~ `49` · `62` · `66` · `67` · `71` · `72` · `81` ~ `94` · `104`(경계 기록 중 코드 주석 부분) · `108` · `109` · **`110`**(코드 부분) · **`113`**(저장소·Outbox 부분)
— ⚠️ `AC-4-104` 와 `AC-4-110`·`AC-4-113` 은 **4a/4b 에 걸친다**. 걸친 AC 는 **4a 에서 로직·코드 부분**, **4b 에서 화면·baseline 부분**을 각각 판정하고, QA 리포트에 **어느 쪽을 판정했는지 명시**한다.
— ⭐ **개정 2 영향**: **`AC-4-07` 이 수정**됐다(전이표 `12 → 14`행 — `D4-13`). **4a 에 그대로 남으며**, 추가 2행이 승인 범위와 **정확히 일치**함을 스냅샷 + `git diff` 로 증명한다. 신규 AC **8건**(**115~122**)은 **전부 4b** 다.

### 16.4.4 Exit Criteria

1. 위 AC 가 모두 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` 이다 (`rules/qa.md` §2).
2. `pnpm typecheck && lint && test && build` 통과. Playwright 는 **단독 실행**.
3. **`apps/api/`·`supabase/`·`apps/mobile/` 이 존재하지 않는다** (AC-4-01).
4. `packages/contracts` 의 **enum·전이표 변경이 승인된 범위와 정확히 일치**한다 — `N4-25` 승인안(A / A′ / B) 외의 값·행이 **0건**임을 스냅샷으로 증명한다.
5. `docs/decisions/stage-4-recording-spike.md` 가 **측정 환경과 방법**을 담고 있다 (AC-4-108).
6. ⛔ **Stage 4a `PASS` 로 Stage 5 를 시작하지 않는다** (`D4-9`). 근거: Stage 5 회고 카드 `91:691` 이 완료 화면과 **같은 프레임 `29:62`** 이고 완료 화면(`S4-H1`)은 **4b** 다. 4b 를 건너뛰면 Stage 5 가 **빈 상단 위에** 카드를 얹게 된다.

### 16.4.5 착수를 막는 결정 — ⭐ **⛔ 0건 (2026-10-13 개정 2)**

~~⛔ `N4-25`(폐기 전이 표현)~~ → ✅ **`D4-13`(안 A) 으로 해소**. **Stage 4a 는 ⛔ 차단 없이 착수·종결할 수 있다.**
⚠️ 남은 것은 작업 단위 선행 3건뿐이다: `N4-04`(S4-B — **확인만**) · `N4-09`(S4-E) · `N4-20`(S4-J).
**`S4-A` 는 결정 없이 지금 착수할 수 있다.**

---

## 16.5 ⭐ Stage 4b — "Session Screens" (`D4-9`, CONFIRMED 2026-10-13)

### 16.5.1 범위

| 포함 단위 | `S4-F`(세션 화면) · `S4-G`(Prompt Drawer) · `S4-H1`(완료 화면) · `S4-H2`(예외·안내 UI) · `S4-K`(회귀·e2e·시각) |
|---|---|

### 16.5.2 In Scope 요구사항

**FR-09**(세션 화면·`285:1445` SessionActionBar·상태별 컨트롤) · **FR-10**(버블 2회) · **FR-11**(경청 모션 + Prompt Drawer) · **FR-19**(출석 스티커) · **FR-25**(세션·완료 화면 반응형) · **§13 예외 처리 6건의 화면 UX**.

### 16.5.3 AC 목록 (⭐ **약 38건** — 개정 2)

`AC-4-38` ~ `42` · `50` ~ `61` · `63` ~ `65` · `68` ~ `70` · `95` ~ `103` · `104`(DOM 증거) · `107` · **`110`**(baseline 재생성) · **`111`** · **`112`** · **`113`**(화면·route) · **`114`** · ⭐ **`115`** · **`116`** · **`117`** · **`118`** · **`119`** · ⭐ **`120`** · **`121`** · **`122`**
— ⛔ **`AC-4-106` 은 폐기**됐다 (`D4-14`). 31 − 1 + 8 = **38**.

### 16.5.4 Exit Criteria

1. 위 AC 가 모두 `PASS` 또는 `BACKEND_INTEGRATION_PENDING`.
2. **Figma 대조**: `285:1126` 섹션(= `28:51` + `285:1445` + `163:1601`) 과 `29:62` **상단 y 0~468** 을 Playwright screenshot 과 비교한 기록이 있다. **`R-FIGMA-1` ①~④** 를 지켜 **선언값**(fill·shadow 겹)으로 대조한다.
3. **허용 차이**가 **등록된 것만** 존재한다 — `AD-S4-1`(스티커 부제) · `AD-S4-3`(ready 버블 교체) · (`N4-26` 결과에 따라) `AD-S4-4`. **등록은 사용자 승인 이후**다.
4. `R-SHADOW-1` **양축 프로브 회귀 테스트**가 세션·완료 화면을 덮는다.
5. **Stage 1~3 시각 baseline 재생성**이 `R-BASELINE-1` ⑤ 절차(클러스터 분해 → 설명되지 않는 클러스터 0건 → `--update-snapshots=all`)를 거쳤다 (AC-4-110).
6. Stage 4 전체(4a + 4b) In Scope AC **104건**에 판정이 있다 → **Stage 4 Verdict 보고 → 멈춤**.

### 16.5.5 착수를 막는 결정 — ⭐ **⛔ 1건 (2026-10-13 개정 2)**

⛔ **`N4-10` 잔여**(대화 전용 **흐름** 최소안, `S4-H2` 전) — **유일한 ⛔**.
✅ **해소**: ~~`N4-26`~~(→ `D4-17`·`D4-18`) · ~~`N4-29`~~(→ `D4-16`) · ~~`N4-24`~~(→ `D4-14`).
✅ **추가 해소**: ~~`N4-32`~~(→ **`D4-20`** — 버블 제목 줄).
⚠️ 작업 단위 선행: `N4-27`(`paused` 재개 — `S4-F`) · `N4-31`(바 규격 `S4F-16` — `S4-F`) · `N4-15`(TopBar — `S4-F`) · `N4-28`(Drawer 진입점 — `S4-G`).
⏳ **디자이너 Figma 대기 (축소)**: `C13-14`(Record Control **`paused` · permission-denied** — ⭐ **disabled 는 `D4-18` 로 빠졌다**) · `C13-3`(녹음 경과 표시) · `C13-4`(Drawer 트리거). ~~`C13-17`~~ **제거**(`D4-18`).
⭐ **`ready` 화면은 더 이상 Figma 대기가 아니다** — `D4-14` 로 `139:2803` 이 기준이 됐고 `D4-17`~`D4-19` 가 하단 바·비활성·다이얼로그를 확정했다. 남은 Figma 대기는 **`paused`·permission-denied·경과 표시·Drawer 트리거**뿐이다 → 재배분 판단은 **§16.6**.

---

## 16.6 ⭐ 4a / 4b 재배분 판단 — **`ready` 화면을 4a 로 올릴 수 있는가** (2026-10-13)

> **질문**: `D4-14` 로 `ready` 가 Figma 차단에서 풀렸다. 그러면 `ready` 화면 AC 를 **Stage 4a 로 당길 수 있는가**?
> **판단: 아니다 — `ready` 화면 AC 는 4b 에 그대로 둔다.** 대신 **4b 의 착수 조건이 크게 완화**됐다.

### 16.6.1 판단 근거 5가지

| # | 근거 | 출처 |
|---|---|---|
| **1** | **`rules/qa.md` §2 상 Verdict 가 탁해진다** — 4a 의 가치는 *"전부 contracts·Mock·순수 TS·테스트로 검증된다. **화면 의존 AC 가 없다**"*(§16.3 표)에 있다. 화면 AC 를 하나라도 넣으면 4a Verdict 가 **시각 baseline·Figma 대조·허용 차이 승인**에 묶인다. 이것이 §16.3 에서 분할을 권고한 **원래 논거**이며, `D4-14` 는 그 논거를 바꾸지 않는다 — **Figma 수령 여부와 "화면 AC 인지" 는 다른 축**이다 | `rules/qa.md` §2 · §16.3 |
| **2** | **`ready` 만 떼어낼 수 없다** — `AC-4-111`(ready 비활성) · `AC-4-112`(Record 탭 → `recording` 변형 전환)는 **ready 와 recording 에 걸친 하나의 전환**이다. `recording` 까지 가면 `AC-4-113`·`114`(Discard/Submit 동작)·`AC-4-97`~`100`(터치·대비·반응형)이 따라오고, **`paused` 는 여전히 Figma 미확정**(`N4-27`·`C13-14`)이다. `163:1590` 은 **한 컴포넌트의 2변형**이므로 `paused` 표현이 없는 상태로 구현하면 **`AC-4-97`·`AC-4-41` 이 `PARTIAL`** 이 된다 | §2.1-A · §14.2 `N4-27` |
| **3** | **시각 baseline 이 두 번 재생성된다** — 같은 화면(`/session/:sessionId`)의 baseline 을 4a 에서 만들고 4b 에서 `paused`·안내 UI 가 붙으며 다시 만들면, `R-BASELINE-1` ③-1(`--update-snapshots=all` 필수)·⑤(클러스터 분해)를 **두 번** 수행해야 한다. 이 저장소는 **스테일 baseline 으로 4번 사고**가 났다 — 재생성 횟수를 늘리지 않는 쪽이 안전하다 | `rules/frontend.md` §9-1 |
| **4** | **`S4-F` 인프라가 통째로 끌려온다** — `ready` 를 그리려면 `pages/session` · `features/storytime-session` · `RecordControl` · `SessionActionBar` · 세션 버블 variant 가 필요하고, 이들은 **`recording`·`paused`·완료 화면이 같이 쓰는 것**이다. 즉 `ready` 를 4a 에 넣는 것은 사실상 **`S4-F` 를 4a 로 옮기는 것**이다 | §16.1 `S4-F` · §15.3 |
| **5** | **4a 에 새 차단이 생긴다** — `ready` 화면은 `N4-32`(인사 문구 노출 지점) · `N4-31`(바 규격) · `N4-15`(TopBar) · `S4F-01`·`S4F-02`(버블 높이·pill 2줄) · **`T-13` 토큰 승인** · **`AD-S4-4`·`AD-S4-5` 등록 승인**에 걸린다. 지금 **4a 의 ⛔ 차단은 0건**인데, `ready` 를 넣으면 **대기 항목 7개가 4a 로 들어온다** — 분할의 목적(*"지금 닫을 수 있는 경계"*)이 무너진다 | §14.2 · §0.5 · §0.8 |

### 16.6.2 그래서 무엇이 달라졌는가 — **4b 의 착수 조건 완화**

| 항목 | 개정 1 (2026-10-13) | ⭐ 개정 2 |
|---|---|---|
| **4b ⛔ 차단** | **2건** (`N4-26` · `N4-10`) | **1건** (`N4-10` — 대화 전용 흐름) |
| **`ready` 화면 명세 가능?** | ⛔ **아니다** — 버블 교체(`D4-6`)·하단 버튼(`N4-23`)·비활성 시각(`N4-26`) 미정 | ✅ **가능하다** — `D4-14`(버블) · `D4-12`(버튼) · `D4-17`~`D4-19`(다이얼로그·비활성·정렬) 로 전부 확정 |
| **Figma 대기 범위** | `C13-1` 전체 + `C13-14` + `C13-17` | ⭐ **`paused` · permission-denied · 경과 표시 · Drawer 트리거**만 (`C13-17` **제거**) |
| **design-agent 가 지금 쓸 수 있는 Spec** | A(Drawer) · B(완료 상단) · C(안내 UI) | ⭐ **A · B · C + D(`ready`·`recording` 세션 화면)** — `paused` 변형만 비워 둔다 |
| **`S4-F` 착수** | ⏳ Figma + 결정 대기 | ⚠️ **`N4-32`·`N4-31`·`N4-15`·`N4-27` 확인 후 착수 가능** (전부 ⚠️ 등급) |

> ⚠️ **§16.3 의 design-agent 불일치 1건이 해소됐다.** design-agent 는 *"`ready` 는 막히지 않는다"* 로, 이 Plan 은 *"`N4-23` 해소 후 가능"* 으로 적어 **판단이 달랐다.** `D4-12`+`D4-14`+`D4-17`~`D4-19` 로 **design-agent 쪽 결론이 성립**하게 됐다 — 단 `ready` 가 **4a 로 가는 것은 아니다**(위 5근거). `paused` 는 여전히 양쪽 모두 대기다.

### 16.6.3 권장 순서 (개정)

**`S4-A → S4-B → S4-C → S4-D → S4-E → S4-J`** ⟹ **Stage 4a Verdict** ⟹ **(Design Spec C·D 승인 + `C13-14` 수령)** ⟹ **`S4-H2` → `S4-F` → `S4-G` → `S4-H1` → `S4-K`** ⟹ **Stage 4b Verdict → 멈춤**

- ⭐ **`S4-F` 를 `S4-H2` 뒤에 둔 것은 유지**한다 — `paused` Figma 대기가 남아 있다.
- ⛔ **Stage 4a `PASS` 로 Stage 5 를 시작하지 않는다** (`D4-9`).

---


## 17. 이 Plan 이 승인되면 즉시 할 일 (Orchestrator)

1. ⭐ **갱신 (2026-10-13 개정 2)** — **§14.2 의 `NEEDS DECISION` 15건**을 제시한다. ⛔ **우선 1건**:
   - **`N4-10`** 잔여 — 대화 전용 세션 **흐름 최소안** (`S4-H2` 전). ⛔ **4b 의 유일한 차단**이다. ⚠️ C-13 분배는 이미 design-agent 명세로 끝났다(§4.3) — 남은 것은 흐름뿐이다.
   ⚠️ **`S4-F` 착수 전 3건**(⭐ `N4-32` 는 **`D4-20`** 으로 해소): **`N4-27`**(`paused` 재개 경로) · **`N4-31`**(바 규격 `135×45` ↔ `P-15` 56) · **`N4-15`**(TopBar `78:353`). **`S4-G` 전 1건**: **`N4-28`**(Drawer 진입점 — ⭐ `D4-14` 로 *"녹음 중 재확인 경로"* 로 범위가 좁아졌다).
   그 밖: `N4-04`(확인만) · `N4-09` · `N4-20` · `N4-21` · `N4-11` · `N4-13` · `N4-16`~`N4-18` · `N4-30`(이연 확인).
   ✅ **다시 묻지 않는다**: `N4-22`(→`D4-9`) · `N4-23`(→`D4-12`) · `N4-05`(§4.3 오기 정정) · ⭐ **`N4-24`(→`D4-14`) · `N4-25`(→`D4-13`) · `N4-26`(→`D4-17`·`D4-18`) · `N4-29`(→`D4-16`) · `N4-32`(→`D4-20`)**.
   ⭐ **`N4-25` 해소로 Stage 4a 는 ⛔ 차단 0건**이다 — 승인만 나면 `S4-A`~`S4-J` 를 연속으로 진행할 수 있다.
2. **§0.5 허용 차이 등록을 지점별로 승인받는다** (CLAUDE.md 최우선 규칙 6 — Agent 가 스스로 등록하지 않는다): **`AD-S4-1`**(스티커 부제 — 문구 확정됨) · **`AD-S4-4`**(Discard 확인 다이얼로그) · **`AD-S4-5`**(하단 바 가운데 정렬 10px) + **`AD-S4-6`**(비활성 `opacity .5` — **등록 필요 여부 자체를 묻는다**). ⛔ ~~`AD-S4-2`~~·~~`AD-S4-3`~~ **무효**이므로 승인 대상이 아니다.
2-b. ⭐ **신규 가값 `P-25` 등록을 승인받는다** (§0.8) — `#aeaeb2` + 흰 라벨 2.211:1 / 토큰 `T-13`. 함께 **Stage 3 잔여 가값 6건 재제시**(7번 항목)를 묶으면 왕복이 줄어든다.
2-c. ⭐ **`D4-13` 이 Stage 0 #16 변경임을 확인받는다** — `SESSION_TRANSITIONS` **2행 확장**(enum 불변). `rules/workflow.md` §2 대상이며, 승인되면 `PLANNING.md` §12 #16 에 **변경 기록을 덧붙인다**(§18-25).
2-d. ⭐ **Toast 문구 `Recording submitted` 를 확인받는다** — **Orchestrator 채택**이며 사용자 결정이 아니다 (approvals §7). copy 모듈 소유이므로 교체 비용은 0 이다.
3. **§0.4 Stage 0 #7 변경 승인**을 명시적으로 받는다 — Architecture/Stack 변경이므로 `rules/workflow.md` §2 대상이다. 승인되면 **§18 의 `PLANNING.md` 갱신**을 plan-agent 가 수행한다.
4. **design-agent 에게 Design Spec 을 지시한다** — ⭐ **감사는 이미 끝났다**(§15.1). **지금 쓸 수 있는 것**: **Spec A**(Prompt Drawer) · **Spec B**(완료 화면 + 스티커 문구 `You read together today` 고정) · **Spec C**(안내·상태 UI) · ⭐ **Spec D 추가 가능**(`ready`·`recording` 세션 화면 — `D4-14`·`D4-17`~`D4-19` 로 풀렸다. **`paused` 변형만 비워 둔다**). **Spec E/F 는 `C13-14` 대기**.
   함께 요청: **CSS 모션 명세 4종**(`D4-3`) · **신규 토큰 `T-1`~`T-13` 판정안**(⭐ `T-13` = `--haru-gray-2`, `provisional: P-25`) · ⭐ **`S4F-01`·`S4F-02` 처리안**(`D4-14` 로 **되살아났다** — Prompt n 가변 시 버블 높이 · pill 2줄. ⚠️ **Figma 자체가 38px 를 넘치므로** "Figma 대로" 가 답이 되지 않는다 → 최우선 규칙 4 보고 경로) · ⭐ **`S4F-16` 판정안**(`N4-31`) · ⭐ **`Discard` 확인 다이얼로그 명세**(`D4-17` — Stage 1 `Dialog` 재사용, 신규 Shared UI 0건) · `C13-14` 디자이너 요청서 **갱신**(⭐ `C13-17` **제거** — `D4-18`).
5. **디자이너 Figma 요청을 발송**한다 (`D4-8`) — ⭐ **범위가 줄었다**: `C13-14` 의 **`paused` · permission-denied** · `C13-3`(경과 표시) · `C13-4`(Drawer 트리거). ~~`C13-17`~~ **제거**(`D4-18`), ~~`C13-1` 의 ready/recording 구성~~ **수령 완료**(`285:1126`). ⚠️ **`N4-05`(Reading Context 시트)를 같은 요청에 묶으면 왕복이 1회로 줄어든다.**
6. **`S4-A` Web 녹음 spike 를 착수한다** — ⭐ **선행 결정이 없다**(§16.1). Figma 대기와 무관하게 진행할 수 있고, 결과가 `S4-B`·`N4-09`·AC-4-108 을 풀어 준다.
7. **Stage 3 잔여 후속** — 가값 **7건**(`P-01`·`P-02`·`P-04`·`P-16`·`P-23`·`P-24` + ⭐ **`P-25`**) 항목별 재제시 (Stage 0 `#10-4`, `stage-3-approvals.md` §28.6-2, **아직 미처리**).
8. **§0.3 선행 정정 3건** — **`P4-FIX-1`**(QA 리포트 6행 스테일 경고문) → **stage-qa-agent** · **`P4-FIX-2`**(`rules/architecture.md` §7 `SessionOutbox` 누락 — grep 실측: rules **0** / ARCHITECTURE **4** / PLANNING **2**) → **사용자** · **`P4-FIX-3`**(error code 수 표기) → **plan-agent (§7.5 와 함께)**.
9. **§0.6 다른 문서의 "Stage 4 차단" 표기 해소** — `DESIGN_SYSTEM.md:151`(design-agent) · `FIGMA_SCREEN_MAP.md:219`(design-agent) · `PLANNING.md:331`·`:383`(plan-agent, §18).
10. ⭐ **PRD 수정 대상 7건(§0.7)을 사용자에게 보고**한다 — `D4-14` 귀결. **적용은 사용자 지시 시** `D-24` 절차(백업 → OneDrive 원본 + 저장소 사본 동시 수정 → `diff` 확인). ⚠️ **지금 PRD 를 고치지 않았다.**
11. ⭐ **`docs/decisions/stage-4-approvals.md`(신규)를 결정 정본으로 공지**한다 — Plan §0.1 과 다르면 approvals 가 우선한다.

---

## 18. ⭐ `PLANNING.md` 갱신 필요 지점 (**Plan 승인 후 plan-agent 가 수행** — 지금 수정하지 않는다)

> `D4-1`(Stage 0 #7 변경)·`D4-2`·`D4-3`·`D4-5`·~~`D4-6`~~·~~`D4-7`~~·`D4-8`·`D4-9`~`D4-12`·**`D4-13`~`D4-20`** 가 `PLANNING.md` 의 여러 지점과 어긋난다. **줄 번호는 2026-10-12 기준 [직독]** 이다.
> ⚠️ **갱신 12(`M-25` → `D4-6`)는 갱신 26 이 뒤집는다** — 적용 시 **26 을 따른다**. 같은 행을 두 번 고치지 않도록 **26 만 반영**한다.

| # | 지점 | 현재 내용 | 갱신 내용 | 근거 결정 |
|---|---|---|---|---|
| **1** | **`:29`** (§5 Stage 표 Stage 4 행) | *"… (+ Capacitor 셸 `apps/mobile`·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter·portrait lock — #7, #12)"* | 괄호 전체를 **제거**하고 *"Web 녹음까지. 네이티브(Capacitor 셸·녹음 플러그인·Auth/Push Adapter·portrait lock)는 **분리된 후속 단계** — `D4-1`, 2026-10-12"* 로 교체 | **`D4-1`** |
| **2** | **`:49`** (구현 범위 표) | *"`apps/mobile` (Capacitor 셸 — **Stage 4에서 생성**, CONFIRMED … #7)"* | *"`apps/mobile` (Capacitor 셸 — **분리된 후속 단계에서 생성**, `D4-1` 2026-10-12 로 #7 변경)"* | **`D4-1`** |
| **3** | **`:66`** (8-Stage 대조표 Stage 4 행) | *"… + **Capacitor 셸 `apps/mobile`·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter·portrait lock** (#7, #12)"* | 동일하게 제거 + 후속 단계 표기 | **`D4-1`** |
| **4** | **`:106`** (§4.1 FR-25 행) | *"**S4: Capacitor portrait lock.** S8 반응형 QA …"* | *"S4: 세션·완료 화면 320/393/600/1024 앱 컬럼 준수. **portrait lock = 후속 단계**(`D4-1`)"* | **`D4-1`** |
| **5** | **§4.1 FR-01 행** | *"네이티브 Apple/Google Adapter는 **Stage 4** (#7)"* | *"네이티브 Apple/Google Adapter는 **후속 단계**(`D4-1`). **Stage 4 In Scope 아님**"* | **`D4-1`** |
| **6** | **§4.1 FR-08 행** | 네이티브 Push Adapter 가 Stage 4 | *"**Stage 4 = `PushPermissionPort` + Web 구현**(이월 `QA-3-001`). 네이티브 Push Adapter = 후속 단계"* | **`D4-1`** |
| **7** | **`:132`** (§4.2 NFR 안정성 행) | *"S4 — **NativeRecorderAdapter** (Capacitor Stage 4 도입 CONFIRMED, #7), 실기기 QA는 Stage 4부터"* | *"S4 — **Web 한계 측정·기록·안내**(`D4-4`, AC-4-108·AC-4-70). `NativeRecorderAdapter` 와 네이티브 실기기 QA = **후속 단계**. **Web 실기기 = iOS 있음 / Android 없음**"* | **`D4-1`·`D4-4`** |
| **8** | **`:240`** (§5 Stage 4 `[FE]` 항목) | *"**`apps/mobile` Capacitor 셸 생성** … + 네이티브 Auth/Push Adapter … **착수 첫 작업: 녹음 spike** (Web MediaRecorder + **Capacitor 네이티브 녹음 플러그인** 청크·백그라운드·인터럽션·포맷 …) … 세션 화면(… **Done Reading** …)"* | ① `apps/mobile`·네이티브 Adapter **제거** ② spike 를 **Web 전용 7항목**으로 교체(§16.1 `S4-A`) ③ **"Done Reading" → `Submit`/`Resume`**(`D4-5`) ④ *"ready 버블 = 인사 버블, Prompt 는 Drawer 전용"*(`D4-6`) 추가 | **`D4-1`·`D4-5`·`D4-6`** |
| **9** | **Stage 4 Exit Criteria** (§5) | — | ⭐ **`apps/mobile` 부재**를 Exit 조건에 추가 (Stage 1 선례 `:196` 와 동일 증거 방식) | **`D4-1`** |
| **10** | **`:246`** (Stage 4 Blocking decisions) | *"OAQ-10/11/16, M-25/M-26 (Capacitor #7 … 결정 완료)"* | *"**OAQ-11**(`N4-09`) · **OAQ-16**(`N4-10`) · M-26 잔여(⏳ `C13-1`·`C13-14` Figma 대기) · `N4-22`·`N4-23`. **OAQ-10 해소**(`D4-1`) · **M-25 해소**(`D4-6`)"* | **`D4-1`·`D4-6`·`D4-8`** |
| **11** | **`:331`** (§8 Gap `M-26` 행) | *"RecordingController 상태별 UI 정의 불가 → **Stage 4 차단**"* | *"**부분 해소** — 하단 버튼 라벨 확정(`D4-5`: `Submit`/`Resume`, `Done Reading` 미생성), 처리 경로 = 디자이너 Figma 요청(`D4-8` `C13-1`·`C13-14`). **차단 → 산출물 대기**"* | **`D4-5`·`D4-8`** |
| **12** | **§8 Gap `M-25` 행** | 세션 준비 버블 내용 미결 | **Resolved (`D4-6`)** — ready 버블 = `88:757` 인사 버블, Prompt pill 5개 미채택, Prompt = Drawer 전용 | **`D4-6`** |
| **13** | **§8 Gap `G-09` 인접 행** (있는 경우) | Discard/Submit 용도 불명 | **Resolved (`D4-12`)** — 둘 다 채택 | **`D4-12`** |
| **14** | **`:351`** (§10 기술 결정 1 행) | *"React/Vite + Capacitor 셸 + 네이티브 녹음 플러그인, **Stage 4에서 추가**"* | *"… **분리된 후속 단계에서 추가**(`D4-1`, 2026-10-12). Stage 1~**4** 웹 전용"* | **`D4-1`** |
| **15** | **`:369`** (§11 `R-02`) | *"Capacitor를 Stage 4에 추가(#7)하므로 Stage 2–3의 … 재작업 가능 / 영향 Stage **2, 3, 4** / 완화: … **Stage 4 첫 작업 녹음 spike**; 실기기 QA Stage 4부터"* | *"영향 Stage **2, 3, 후속**. 위험은 **사라지지 않고 이연**된다(§0.4). 완화책(interface 뒤 구현 + Port 선택 지점 1곳)은 **Stage 4 에서도 그대로** 지킨다 — `S4-D` 완료 판정에 *"`RecorderAdapter` interface 에 DOM 타입 비노출"* 을 포함. **Stage 4 첫 작업 = Web 녹음 spike**"* | **`D4-1`** |
| **16** | **`:383`** (§11 `R-16`) | *"캐릭터 경청·인사·완료 애니메이션 에셋 부재, 포맷·라이브러리 미정 / **Stage 3 종료 전 포맷 결정**"* | **`Resolved`** — **`D4-3`**: CSS 모션으로 시작, 라이브러리 0개, `prefers-reduced-motion` 대체 필수 (Stage 0 #9 선례) | **`D4-3`** |
| **17** | **`:460`** (§12 Stage 0 결정 **#7** 본문) | *"도입, **Stage 4에서 추가** — Stage 1–3 웹 전용 …, **Stage 4에 셸·네이티브 녹음 플러그인·네이티브 Auth/Push Adapter**, 실기기 QA Stage 4부터"* | ⭐ **변경 기록을 덧붙인다** (원문을 지우지 않는다): *"**변경 2026-10-12 (`D4-1`)** — 도입 시점을 **분리된 후속 단계로 이연**. Stage 1~4 웹 전용. 사유: 후보 플러그인 둘 다 청크 녹음 미문서화 + `ARCHITECTURE §10.5` part 모델이 청크 전제 + 자체 플러그인은 Frontend 범위 밖. Stage 4 는 `RecorderAdapter` interface + Web 구현만"* | **`D4-1`** |
| **18** | **`:465`** (§12 결정 **#12** 행) | *"… 세로 고정 (**Capacitor portrait lock Stage 4**, 웹 가로 = 앱 컬럼)"* | *"… 세로 고정 (**portrait lock = 후속 단계** `D4-1`, 웹 가로 = 앱 컬럼). **웹 쪽 규칙은 변경 없음**"* | **`D4-1`** |
| **19** | **§9.2 route 표** | `/session/*` route 가 RECOMMENDED | `N4-18` 결정(**in-page 권장**) 반영 — `/session/:sessionId/permission` 를 route 로 둘지 확정 | `N4-18` |
| **20** | **§5 진행 상태 / 머리 요약** | Stage 4 "시작 전" | ⭐ *"Stage 4 Plan **DRAFT (2026-10-13)** — 사용자 결정 **12건** 반영. **Stage 4a / 4b 분할**(`D4-9`). In Scope 22 · AC **104**(이동 9 · 폐기 1 · 신규 11) · NEEDS DECISION **17**(⛔ 4a 1 · 4b 2)"* | 전체 |
| **21** ⭐ 2026-10-13 | **§5 Stage 표 · 8-Stage 대조표** | Stage 4 단일 행 | **`4a` / `4b` 두 행으로 분할** (`D4-9`). 4a = Recording Core(비시각) · 4b = Session Screens. **Stage 5~8 번호는 그대로**. ⛔ *"4a `PASS` 로 Stage 5 를 시작하지 않는다"* 를 **명시** | **`D4-9`** |
| **22** ⭐ 2026-10-13 | **§8 Gap `M-26` 행** (갱신 **17** 과 중복 주의) | *"Stage 4 차단"* | ⭐ **재갱신** — 2026-10-13 Figma(`285:1126`)로 **"차단" 해소**. 잔여 3건(`paused` 재개 · disabled 변형 · 확인 다이얼로그)만 **산출물 대기**. ⚠️ `docs/FIGMA_SCREEN_MAP.md` §5.2 는 **2026-10-13 에 이미 갱신했다**(plan-agent, 사용자 지시) | **`D4-12`** |
| **23** ⭐ 2026-10-13 | **§4.1 FR-21 행** | 로컬 삭제 API | **+ `Discard` 사용자 주도 폐기**(로컬 청크 삭제 + 큐 취소) 추가 | **`D4-12`** |
| **24** ⭐ 2026-10-13 | **§11 위험 표** | — | **`R-02` 아래에 신규 위험 2건 추가 권장**: ① **폐기 전이 미승인 상태로 4a 착수 시 contracts 재작업**(`N4-25`) ② **`IconButton` 그림자 교체로 Stage 1~3 baseline 전수 재생성**(`D4-11`, 35곳/21파일) | **`D4-11`·`D4-12`** |

| **25** ⭐ 2026-10-13 개정 2 | **§12 Stage 0 결정 #16 본문** | `SessionStatus` 8값 · `SESSION_TRANSITIONS` · `CompletedReason` **CONFIRMED** | ⭐ **변경 기록을 덧붙인다 (원문 유지)**: *"**변경 2026-10-13 (`D4-13`)** — `SESSION_TRANSITIONS` 에 **2행 추가**(`recording → abandoned` · `paused → abandoned`, actor `caregiver`, modes `['recorded']`), 행 수 **12 → 14**. **enum 값은 불변**(`SessionStatus` 8값 · `CompletedReason` 3값 · `AbandonedReason` **미생성**). 사유: 사용자 주도 녹음 폐기(`Discard`, `D4-12`)를 기존 enum·전이표로 표현할 수 없었다. 귀결: **방치와 폐기를 구분할 수 없다**"* | **`D4-13`** |
| **26** ⭐ | **§8 Gap `M-25` 행** (갱신 **12** 와 **반대 방향**) | ~~Resolved (`D4-6`) — 버블 = `88:757`, Prompt = Drawer 전용~~ | ⛔ **갱신 12 를 뒤집는다** — **Resolved (`D4-14`) — Figma 채택**: ready 버블 = **`139:2803`**(Prompt pill 5개) 그대로. **PRD 수정 대상 7건** 연결(§0.7) | **`D4-14`** |
| **27** ⭐ | **§4.1 FR-10 · FR-11 행** | FR-10 = 시작 인사·종료 2회 / FR-11 = Prompt 모아보기 | FR-10 에 *"ready 버블(`139:2803`)은 **제목 줄 = 서버 인사 문구 + pill = Prompt** 를 함께 담는다(`D4-20`). 인사 없음이면 제목 줄 미렌더"* · FR-11 에 *"Drawer 는 Prompt 의 유일 경로가 아니다 — 녹음 중 재확인 경로"* | **`D4-14`·`D4-20`** |
| **28** ⭐ | **§11 위험 표** (갱신 **24** 보강) | — | **`R4-15`**(`S4F-01`·`S4F-02` 되살아남) · **`R4-16`**(전이표 2행이 승인 범위를 넘어 번짐) 추가. ⭐ **`R4-14` 는 `Resolved`**(`D4-14` 로 재확인 완료) | **`D4-14`·`D4-13`** |
| **29** ⭐ | **§5 진행 상태 / 머리 요약** (갱신 **20** 대체) | — | *"Stage 4 Plan **DRAFT (2026-10-13 개정 2)** — 사용자 결정 **20건** 반영. **4a / 4b 분할**(`D4-9`). In Scope **22** · AC **111**(이동 9 · 폐기 2 · 신규 19) · NEEDS DECISION **15**(⛔ **4a 0** · **4b 1**)"* | 전체 |

| **30** ⭐ | **§12 결정 #10-4 / 가값 운영** | 가값 목록 | ⭐ **`P-25` 추가**(토큰 **`--color-action-neutral-bg`/`-fg`** · `--haru-gray-2`). ⛔ **`P-11`(= `--color-action-secondary-*`)의 기재를 바꾸지 않는다** — §0.8 정정 사유 |
| **31** ⭐ | **§4.1 FR-21 행** (갱신 **23** 보강) | `Discard` 폐기 | **확인 다이얼로그 경유**(`D4-17`) + **`→ abandoned` 전이**(`D4-13`) 명시 |

**`PLANNING.md` 밖의 갱신 지점 (소관 다름 — plan-agent 가 하지 않는다)**

| 지점 | 내용 | 소관 |
|---|---|---|
| `.claude/rules/architecture.md:19` | `apps/mobile` 행 주석 *"Stage 0 #7 — **Stage 4에서 생성**, Stage 1–3은 웹 전용"* → 후속 단계 | **사용자** (rules 는 plan-agent 쓰기 경로 아님) |
| `.claude/rules/architecture.md:34` | 의존 방향 표의 `apps/mobile` 행 — 유지 가능(후속 단계에서 유효) | 사용자 (변경 불필요 가능) |
| `.claude/rules/architecture.md` §7 | **`SessionOutbox` 누락** (`P4-FIX-2`) | **사용자** |
| `docs/DESIGN_SYSTEM.md:151` | *"**Stage 4 차단**"* → `D4-3` 으로 해소 | **design-agent** |
| `docs/FIGMA_SCREEN_MAP.md:219` | `M-26` 행 *"Stage 4 차단"* → 산출물 대기 | **design-agent** |
| `docs/qa/stage-3-qa-report.md:6` | 스테일 경고문 (`P4-FIX-1`) | **stage-qa-agent** |
| `docs/API_CONTRACTS.md` | §7.5 의 **12건** | **plan-agent (Plan 승인 후)** |
| `docs/decisions/stage-4-approvals.md` (신규) | `D4-1`~`D4-8` 결정 기록 + 허용 차이 `AD-S4-1`~`3` 등록(승인 후) | **plan-agent (Plan 승인 후)** |