# Stage 7 Design Spec — Progress (Weekly) · 4-Week Report Card · Report Detail · Highlight Clip · PDF

Status: **APPROVED (2026-11-19, user)** — `D7-5` (`docs/decisions/stage-7-approvals.md`).
Based on:
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — **라이브 조회 2026-11-19** (`mcp__8c8226df…` 커넥터). 조회 노드는 §0.1
- Plan `docs/plans/stage-7-plan.md` **초판 (DRAFT 2026-11-19)** §17 Handoff · 결정 `docs/decisions/stage-7-approvals.md` **`D7-1`~`D7-4`**
- 형식 선례: `docs/design/stage-6-design-spec.md` · 토큰 `packages/design-tokens/src/**` · UI `packages/ui/src/**` · 기존 화면 코드 (전부 읽기만)

Author: design-agent. ⛔ Production Code · Figma 수정 없음. 신규 토큰·컴포넌트 변경은 **요청**이며 구현은 development-agent (승인 후).

> ⚠️ **Figma 도착 시 재정렬 대상 (`R7-01`)** — §2.3~§2.9 의 C-13 9건(`C13-S7-1`~`9`)은 **Figma 근거가 없는 design-agent 명세**다 (`D7-3`). 디자이너 프레임이 들어오면 최우선 규칙에 따라 Figma 로 교체한다. 그래서 C-13 명세는 **기존 Figma 시각 언어(`163:2607` 카드 · `163:2633` 인용 · `110:835` 카드 · `110:854` 버튼)와 기존 Shared UI 조합으로만** 만들고, Figma 근거 없는 값은 가값 `P-38`~ 로 표시한다.

> **개정 2026-11-19 (design-agent, `S7-C` Visual Gap — `docs/design/stage-7-visual-gap.md` §S7-C `VG7-C-09`)** — 구현 중 드러난 **명세 서술 오류만** 정정했다. 결정·Figma 해석은 바꾸지 않았다 (Status 줄 불변). ① §2.0 분 포맷 — StatTile *together* 는 분 단위(`62m`, Figma `163:2549`) ② §2.1.1 · §9.5 — 캐릭터 크롭은 **에셋에 적용**, 새 `overflow` **0** ③ §3.3 헤더 간격 4 · 4 ④ §3.4 `days → bars` 매핑 위치 = `features/progress-overview/model/weeklyView.ts` ⑤ §2.4 SectionLabel weight = bold (Stage 6 recipe 그대로) ⑥ §2.9 리포트 카드 Error = 셸 없는 `ErrorState` 단독 ⑦ §3.2 · §6 pressed opacity — 토큰 `--opacity-pressed` 가 저장소에 없다 → pressed 시각 표시 없음(focus ring 만). 정정 전 문구는 각 위치에 ~~취소선~~ 으로 남겼다.

> **개정 2026-11-20 (design-agent, `S7-D` Visual Gap — `docs/design/stage-7-visual-gap.md` §S7-D `VG7-D-12`)** — 리포트 상세 구현으로 드러난 **명세 서술 오류·누락만** 정정했다. 결정·Figma 해석은 바꾸지 않았다 (Status 줄 불변). ⑧ §2.9 · §7 Not found 코드 `NOT_FOUND` → contract 이름 **`RESOURCE_NOT_FOUND`** ⑨ §2.9 Not found 버튼 = `ErrorState` 회복 버튼 자리(glass) ⑩ §2.9 상세 Loading = header `text 2` → 차트 카드(차트 높이) → `ProfileCard` 안 `text 5` ×2 (`Skeleton` 에 높이 지정 block 없음) ⑪ §3.8 `PersonaCard` 확장 prop 에 **`nameAs?`** 추가 ⑫ §2.3.2 페르소나 1개 eyebrow = *NOW* · C-13 간격 값 기록(`P-39`) ⑬ §2.3 ⑥ 클립 slot 미지정 = 섹션 미렌더 · 셸은 `S7-E` 소유 ⑭ §9.1 상세 heading 수 *h2 ×6* → **h2 ×4 (+ 클립 1) · 페르소나 이름 h3**. 정정 전 문구는 ~~취소선~~ 으로 남겼다.

> **개정 2026-11-20 (design-agent, `S7-E` Visual Gap — `docs/design/stage-7-visual-gap.md` §S7-E `VG7-E-09` · `VG7-E-11`)** — 클립 플레이어 구현으로 드러난 **명세 누락만** 보충했다. 결정·Figma 해석은 바꾸지 않았다 (Status 줄 불변). ⑮ §2.5 · §9.1 진행 막대 낭독 = 시간(`aria-valuetext` *"{elapsed} of {total}"*) · 이름 *Clip progress: {label}* · 옆 시간 텍스트 `aria-hidden` ⑯ §9.1 · §10 SR live 문구 *Playing.* · *Paused.* ⑰ §2.5 ended = idle 표시와 같아 상태 6종(idle · loading · playing · paused · unavailable · error) · 다른 행으로 옮기면 이전 행은 위치를 기억한 paused ⑱ §2.5 C-13 값(`P-39`) — 본문 열 줄 간격 `--space-1` · 진행 행 막대↔시간 `--space-2` · 시간 `nowrap` · 오류 문구 = 진행 행 아래 · 불가 문구 = 진행 행 자리 · 불가 dim = 버튼에만(`--opacity-disabled`) · reduced-motion 로딩 = 정지 arc 만(Spinner 라벨 숨김, SR = 버튼 `aria-busy`). **결정이 필요한 `VG7-E-05`(버튼 세로 정렬) · `VG7-E-06`(시간 텍스트 색) · `VG7-E-10`(iOS 첫 탭)는 고치지 않았다.**

> **개정 2026-11-20 (design-agent, `S7-F` Visual Gap — `docs/design/stage-7-visual-gap.md` §S7-F `VG7-F-08`)** — PDF 액션 구현으로 드러난 **명세 서술 오류·누락만** 정정했다. 결정·Figma 해석은 바꾸지 않았다 (Status 줄 불변). ⑲ §2.6 offline tone = `"offline"`(`wifi-off`, 기존 offline 표현 — Session Feedback · Activity deck 선례) — 괄호 의도와 어긋난 `tone="error"` 표기 정정 ⑳ §2.6 loading = Shared `Button loading` 기존 표현(라벨 폭 유지 · 라벨 숨김 · Spinner, reduced-motion 은 Spinner 라벨 *Loading* — §9.2 공용) ㉑ §2.6 ready 2버튼 DOM·시각 순서 = **Share(secondary) → Save PDF(primary)** (`ButtonGroup` = Figma `86:372` 순서) — 표의 *Save · Share* 는 나열 순서일 뿐 ㉒ §2.6 C-13 값(`P-39`): 버튼 ↔ 상태 문구 `--space-2` · `InlineAlert` ↔ *Try again* `--space-3` · *Try again* = `fullWidth` · live region 1개 상시(`role="status"`) · 단계 전환 시 포커스가 영역 안에 있었으면 새 첫 버튼으로 ㉓ §2.3 ⑦ 위 간격 = 본문 섹션 간격 `--space-5`(20) — ~~mt `--space-3`~~ (본문 열이 gap 으로 간격을 주므로 ⑦ 만 다른 값을 줄 근거 없음, `P-39`) ㉔ §9.1 timeout `InlineAlert` = `tone="info"` → `role="status"` (failed 만 `alert`, offline 은 `status`). **결정 대기 `VG7-F-03`(ready 2버튼 세로 stack) · `VG7-F-05`(상태 문구 색) · `VG7-F-06`(공유 시트 제목)은 고치지 않았다.**

> **개정 2026-11-20 (design-agent, `D7-6` 반영 확인 — `docs/design/stage-7-visual-gap.md` `## D7-6 반영 확인`)** — 사용자 결정 `D7-6`(`docs/decisions/stage-7-approvals.md`)을 명세에 옮겼다. Status 줄은 바꾸지 않았다. ㉕ §2.6 ready `ButtonGroup` = **그룹 폭 < 360 이면 자동 세로 stack** — 폰 폭(카드 안 313 · 상세 345)에서는 세로(위 Share · 아래 Save PDF, gap `--space-3`), 360 이상에서만 가로 2 (`VG7-F-03` ⓐ) ㉖ §10.4 OS 공유 시트 제목 *HARU 4-week report* 추가 (`VG7-F-06` ⓐ) ㉗ **C-13 화면의 정보성 보조 텍스트는 `tone="secondary"`(ink-500)** — 상세 ⑤ `{count}×` 메타 · 클립 시간 · PDF *Preparing…* · 공유 불가 문장 (§2.3 ⑤ · §2.5 · §2.6 · §9.3, `VG7-D-08` · `E-06` · `F-05` ⓑ, 새 가값 0) ㉘ §2.5 클립 행 = 2단 grid — 버튼은 라벨·날짜·진행(불가 = 문구) 3행의 가운데, 오류·offline 문구는 4행(다음 줄) → 6상태 모두 버튼 이동 0 · 문구 `<p>` 자체가 caption-1 16 줄 · 불가 문구 자리는 진행 행 높이(body 줄 22) 유지 (`VG7-E-05` ⓑ · `E-04`) ㉙ §3.4 BarChart 라벨 줄 높이 = `--bar-chart-label-line` 11 (Figma leading 1.0) → 트랙 = 96 − 11 − 6 − 6 − 11 = **62** (Figma 63, `VG7-B-03` ⓑ) ㉚ §2.1.1 · §5.2 `T7-11` 캐릭터 top = **4** (Figma y70 − 66 — 제목 행과 같은 −66 일괄 매핑, 겹침 36) (`VG7-C-02` ⓑ) · TopBar large 빈 leading = 2열(chip 오른쪽 끝 x369, `VG7-C-04` ⓐ). 정정 전 문구는 ~~취소선~~ 으로 남겼다.

---

## 0. 측정 방법과 결과 요약

### 0.1 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[ctx]` | `get_design_context` — **선언값**(fill · effect · padding · gap · 텍스트 스타일 · 변수 참조 여부) | **`31:102`** 전체(하위 `163:2544`·`2551`·`2607`·`2633`·`31:115`·`163:2642`·`40:237` 포함) · **`110:835`** |
| `[var]` | `get_variable_defs` | `31:102` (`110:835` 는 Plan §0.1 에서 `{}` 확인 — 재조회 생략) |
| `[svg]` | `get_design_context` 첨부 SVG 에셋 원문(path) | 아이콘 4개 `110:838` · `110:855` · `163:2562` · `31:120` — **글리프 식별 용도** |
| `[png]` | `163:2643` 이미지 에셋 다운로드 (scratchpad) → PIL 로 모드·알파만 확인 | 941×1672 **RGBA, 모서리 알파 0** (투명 배경) |
| `[계산]` | WCAG 2.x 상대휘도 · 기하 산술 (python) | 대비 · 막대 비율 · 반응형 |
| `[직독]` | 저장소 파일 | 토큰 · `packages/ui` · `AppShell`·`TabLayout` · `ProgressTopBar` · `ProfileCard`·`PersonaCard` · `features/reflection/copy.ts` · contracts `enums/report.ts` |

렌더 PNG 는 **배치 확인 용도만** — 색·그림자·크기는 선언값에서만 읽었다.

### 0.2 핵심 실측 결과 (선언값)

| 블록 | 선언값 `[ctx][var]` | 변수 바인딩 |
|---|---|---|
| 프레임 배경 | gradient `#dbeee7 → #d3e3de(46%) → #c7c9d7` | 없음 — `--gradient-app` 과 같은 값 (`AppBackground`) |
| `31:115` 제목 행 | h40 · `justify-between` · "Progress" **SF Heavy 28** `text-primary` | `text-primary` ✅ |
| `31:118` 주 선택 chip | pad **14/9** · gap **6** · pill · fill `glass-fill` 74% · drop **`0 6 4 ink8%` 1겹** + inset 2겹 · 라벨 **Semibold 13** `text-primary` · chevron-down **12** stroke 1.2 `#7d9291` | `glass-fill` · `text-primary` ✅ / 그림자 raw |
| `163:2642` 캐릭터 프레임 | 347×422 @ (24, 70) · **fill gradient `#daebe5 → #d0e1dc`** · `overflow-clip` · 이미지 `163:2643` h 146.15% · top −15.82% | 없음 (raw) |
| `163:2638` 본문 스택 | @ (24, 346) · w345 · **gap 14** | — |
| `163:2544` StatTile 행 | h84 · py4 · gap10 · **`overflow-clip`** | — |
| `163:2545`/`2548` StatTile | flex-1 · pad **13/8** · gap **5** · radius **20** · fill `glass-fill-strong` 90% · drop `0 6 4 ink8%` 1겹 + inset 2겹 · 값 **SF Heavy 24** `text-primary` · 라벨 **Medium 11** `text-secondary` | fill · 텍스트색 ✅ |
| **`163:2551`** This week's reading | **HTML import 형식**(layer `div`/`span`, 텍스트 HEX raw) · pad 16 · radius 24 · fill **white 82% + backdrop-blur 12** · drop **`0 2 4 / 0 12 28 / 0 28 56`** + inset 2겹 (= `HARU/Glass Rest` drop 3겹) · 제목 Bold 15/18 `#4a5f5c` · 합계 **Bold 26/26 tracking −0.52** · 비교 문구 Bold 12 `#85bfb6` · 보조 Regular 12/15.6 `#9aabaa` · 토글 30×30 radius 15 `rgba(233,240,237,.9)` + chevron-down 16 `#5e7370` | **❌ 0** (`M7-1`) |
| `163:2564` 막대 영역 | h110 · pt14 · gap10 · 열 7 (w≈36.14) · 열 = 값 라벨 **Bold 10** + gap 6 + 막대 w16 radius 8 + gap 6 + 요일 **Semibold 10.5** `#9aabaa` | ❌ 0 |
| 막대 (일반) | fill **teal 55%** · 값 라벨 `#b3c0bf` | ❌ |
| 막대 (강조) | fill **teal 100%** · `flex-1`(=트랙 최대) · 값 라벨 **`#5e7370`** — 16m(목)·20m(토) **2개** | ❌ |
| 막대 (기록 없음) | **h4 · radius 3 · ink 18%** · 값 라벨 "—" `#b3c0bf` | ❌ |
| 막대 높이 | 8m 34.91 · 13m 56.72 · 11m 48 · 4m 17.45 → **4.3636 px/min (= 48/11) 선형** · 16m·20m 은 선형이면 69.8·87.3 인데 트랙 상한 **63.5** 로 **둘 다 잘림** `[계산]` | — (`M7-3`) |
| **`163:2607`** Growth themes | pad 16 · gap 12 · radius 24 · `glass-fill-strong` · drop `0 6 4` 1겹 + inset 2겹 · 제목 Bold 15 · 행 = 라벨 **Semibold 12.5 `#5e7370`** ↔ 단계 **Medium 12 `#9aabaa`** · gap 6 · 막대 h8 radius 4 track ink 12% · fill **`accents/teal` · `accents/pink` · `accents/blue` · `color/violet/67 #ac93c4`** · ⚠️ 4행만 라벨 **Medium 13** (`163:2629`) | fill 4색 ✅ · 행 텍스트 raw |
| **`163:2633`** Moment of the week | pad 16 · gap **7** · radius 24 · fill **teal 16%** · border **1px teal 35%** · **그림자 0** · eyebrow **Semibold 11 tracking 0.4 `#6f8c88`** · 인용 **Medium 14/21** `text-primary` · 출처 Regular 12 `text-secondary` | 텍스트 일부 ✅ · `#6f8c88` raw (팔레트 밖 — `N7-32`) |
| `40:237` 탭바 | `Screen/Tab Bar` Active=Report(라벨 Progress) | 기존 `AppTabBar` 그대로 |
| **`110:835`** 4-week full report | **변수 0** · pad 16 · gap 14 · radius 24 · white 82% + blur 12 · drop Glass Rest 3겹 + inset 2겹 · 헤더 gap 13: 아이콘 타일 **44 · radius 14 · teal 20%** + 글리프 22 (`file-down`, teal, stroke 1.65) · 텍스트 gap 4: 제목 Bold 15/18 · 설명 **Regular 12.5/18.13 `#7d9291`** (2줄) · 보조 **Regular 11.5/14.95 `#9aabaa`** · 진행 행 gap 10: track **h7 radius 4 ink 12%** + fill teal (100%) + 값 span 34.5×11.5 (**빈 텍스트**) · 버튼 **h50 pill teal** · 아이콘 17 (`arrow-down-to-line`, white) gap 9 · 라벨 **Bold 15/15 white** · drop `0 2 2 / 0 12 14 / 0 28 28` · 다음 리포트 줄 **Regular 11.5/16.1 `#9aabaa` 가운데** | **❌ 0** |

아이콘 식별 `[svg]`: `110:838` = Lucide **`file-down`** · `110:855` = Lucide **`arrow-down-to-line`** · `163:2562` · `31:120` = Lucide **`chevron-down`**.

### 0.3 raw 값 → 기존 토큰 흡수표 (`110:835` · `163:2551` 공통, `R7-09`)

| raw | 토큰 | Δ / 근거 |
|---|---|---|
| white 82% + blur 12 | `--color-surface-card` (`--haru-white-a82`) + `--blur-material-md` 12 | **Δ0** — Activity Card 앞면(`163:2649`) 선례 (`entities/activity-card/activity-card.css`) |
| drop `0 2 4 / 0 12 28 / 0 28 56` + inset 2겹 | **`--shadow-glass-rest`** | **Δ0** — 3겹 전부 일치 (`R-FIGMA-1` ③: `--shadow-rest` 아님 — 첫 겹 `0 2 4`) |
| radius 24 | `--radius-surface` 22 | 확정 흡수 규칙 (radius.css "리포트 24 → surface(22)") |
| pad 16 · gap 14 · gap 13 · gap 10 · gap 4 | `--space-4` · `--space-3-5` · `--space-3`(Δ−1) · `--space-2-5` · `--space-1` | 13 → 12 흡수 |
| `#4a5f5c` · `#5e7370` · `#7d9291` · `#9aabaa` · `#b3c0bf` | `--color-fg-primary` · `--color-action-secondary-fg` · `--color-fg-secondary` · `--color-fg-tertiary` · `--haru-ink-300`(semantic 없음 → `T7-6`) | Δ0 (Primitive 와 일치) |
| `#85bfb6` | `--color-action-primary-bg` / `--color-progress-fill` | Δ0 |
| ink 12% · ink 18% | `--color-progress-track` · `--color-border-subtle` | Δ0 |
| Bold 15/18 | `Text subheadline bold` (15/20) | line Δ+2 |
| Regular 12.5/18.13 | `Text caption-1` (12/16) | 12.5 → 12 확정 흡수 규칙(chip 선례) |
| Regular 11.5 | `Text caption-2` (11/13) | 11.5 → 11 확정 흡수 규칙(field-label 선례) |
| track h7 | `--reading-now-progress-height` 7 과 같은 값 → `T7-9` | 선례 있음 |
| 버튼 h50 · Bold 15 | `Button size="md"`(45) — `N7-33` | Δ−5 (lg 56 은 Δ+6) |
| 버튼 drop `0 2 2 / 0 12 14 / 0 28 28` | `Button accent` 기존 그림자 | 기존 Button 규칙(AD-3 허용 차이 선례) |
| teal 20% (아이콘 타일) · radius 14 | `T7-8` 신규 · `--radius-media` 12 | radius Δ−2 |
| `rgba(233,240,237,.9)` (토글) | `--color-surface-subtle`(mist-50 `#edf3f1`) | Δ(4,3,4) — `N7-41` ⓑ 일 때만 사용 |
| `#6f8c88` (eyebrow) | `--color-fg-secondary` (ink-500 `#7d9291`) | 최근접 Δ(14,6,9) — `N7-32` |

---

## 1. 대상 화면

| # | ID | Route / 위치 | Page · Feature (가칭) | Figma 근거 |
|---|---|---|---|---|
| 1 | — (Figma 有) | `/progress` 본문 | `ProgressPage` · `features/progress-overview` | **`31:102`** (전 블록) |
| 1a | — (Figma 有) | `/progress` 4주 리포트 카드 — **발행 상태** | `features/progress-overview` `ReportCard` | **`110:835`** |
| 2 | **`C13-S7-2`** | 4주 리포트 카드 — 첫 주기 진행 · 생성 중 · 이월 · 지연 | 〃 | `110:835` 셸만 |
| 3 | **`C13-S7-6`** | 주 선택 시트 | `features/progress-overview` `WeekPickerSheet` | `31:118` chip 만 |
| 4 | **`C13-S7-5`** | 과거 리포트 목록 (`/progress` 안, 카드 아래) | `features/progress-overview` `PastReportList` | 없음 |
| 5 | **`C13-S7-8`** | Progress 빈 상태 (이번 주 0 · 리포트 0) | 〃 | 없음 |
| 6 | **`C13-S7-1`** | `/progress/reports/:reportId` 리포트 상세 | `ReportDetailPage` · `features/report-detail` | 없음 — `163:2607` · `163:2633` · `110:854` recipe |
| 7 | **`C13-S7-7`** | 페르소나 히스토리 (상세 섹션) | `features/report-detail` + `entities/child-profile` `PersonaCard` | 없음 |
| 8 | **`C13-S7-3`** | 하이라이트 클립 플레이어 (상세 섹션) | `features/highlight-clip-player` + `entities/highlight-clip` | 없음 |
| 9 | **`C13-S7-4`** | PDF 상태 (카드 · 상세 하단) | `features/report-pdf` `ReportPdfAction` | `110:854` 버튼만 |
| 10 | **`C13-S7-9`** | 공통 상태 (Loading · Error · Offline · Not found · Not ready) | 위 전부 | 기존 `Skeleton` · `ErrorState` · `EmptyState` · `InlineAlert` |

route 신설 = **1개**(`/progress/reports/:reportId`). `/progress/reports` 목록 route **없음** (`N7-11` 권고 — 같은 화면 목록).

---

## 2. 화면별 레이아웃

### 2.0 공통 규칙

| 항목 | 값 | 근거 |
|---|---|---|
| 좌우 거터 | `--layout-gutter` 24 | `P-13` |
| `/progress` 블록 간격 | **`--space-3-5` 14** | `163:2638` gap 14 `[ctx]` (Stage 6 의 20 이 아니다) |
| 상세 섹션 간격 | `--space-5` 20 | Stage 6 §2.0 (C-13 화면 공통) |
| 데이터 카드 (얇은 그림자) | **`ProfileCard`** (`entities/child-profile`, Stage 6) = `Surface strong / surface / 4 / bubble` | `163:2607` 실측 = 기존 recipe 와 **완전 일치** |
| 데이터 카드 (Glass Rest) | **ReportGlassCard recipe** = `Surface fill="card" material="rest" radius="surface" padding="4"` | `163:2551` · `110:835` (§0.3) — `fill="card"` 는 `T7-3` 확장 |
| 카드 제목 | `Text subheadline bold primary` · `h2` | Bold 15 |
| 문구 | **전부 서버 값 또는 copy 모듈** — Frontend 생성·가공 0 (포맷만: 날짜 · 분 → "1h 12m") | `architecture.md` §8 |
| 날짜 포맷 | 기존 `formatMonthDay` 계열. 범위 = `May 4 – 10` (같은 달) · `Apr 27 – May 3` (달 넘김) · 연 넘김은 `Dec 29 – Jan 4` (연도 미표시) | `31:118` · `110:847` |
| 분 포맷 | **주간 합계·막대 라벨**: `<60` → `{m}m` · `≥60` → `{h}h {m}m` (m=0 → `{h}h`) · `null` → `—` / **StatTile *together*: 분 단위만 `{m}m`** (60 이상도 — `formatMinuteCount`) [개정 2026-11-19 ①: ~~한 규칙~~ — Figma `163:2549` 은 62분을 `62m` 로 쓴다] | `163:2549` "62m" · `163:2557` "1h 12m" |
| 아이 이름 | `firstName` 만 (상세는 `childDisplayName` — 발행 시점 동결, `N7-16`) | — |

### 2.1 `/progress` — Figma `31:102` + `110:835`

```
TabLayout  topBar = ProgressTopBar           (기존 TopBar variant="large")
│   TopBar large: title "Progress" (h1, Heavy 28 — 기존)  trailing = WeekPickerChip (§3.2)
│   (빈 leading → 2열 grid, chip 오른쪽 끝 = 컬럼 끝 x369 [개정 ㉚, `D7-6` ③])
└─ ProgressPage (조립만)
   ├─ ProgressCharacter              decorative <img alt="">  (§2.1.1)
   ├─ div.progress-stack  flex col gap --space-3-5   (캐릭터 아래쪽과 겹침)
   │   ├─ WeeklyProgressView          (features/progress-overview)
   │   │   ├─ StatTileRow  StatTile "5" sessions · StatTile "62m" together        (§3.1)
   │   │   ├─ WeeklyReadingCard  (ReportGlassCard)                                 (§3.3)
   │   │   │   ├─ h2 "This week's reading"
   │   │   │   ├─ 합계 "1h 12m"                       (비교 문구 미표시 — D7-2 ①)
   │   │   │   ├─ 보조 "6 nights · avg 12 min"        (D7-2 ②)
   │   │   │   ├─ (N7-41 ⓑ 일 때만) 토글 30
   │   │   │   └─ WeeklyBars 7열                                                   (§3.4)
   │   │   ├─ GrowthThemesCard  (ProfileCard)  h2 "Growth themes" + 4행             (§3.5)
   │   │   └─ NotableQuoteCard  eyebrow "MOMENT OF THE WEEK"  (momentOfWeek ≠ null)  (§3.6)
   │   ├─ ReportCard  (ReportGlassCard)   ← overview 쿼리 (독립 상태)               (§2.2)
   │   │   └─ slot: ReportPdfAction (page 가 features/report-pdf 를 꽂는다)
   │   └─ PastReportList  (reportCount ≥ 2)                                        (§2.4)
   └─ (탭바 — 기존 AppTabBar, Active=Progress)
```

| 항목 | 명세 |
|---|---|
| 블록 순서 | Figma `31:102` 4블록 → **4주 리포트 카드**(`110:835`, `D7-1`) → 과거 리포트(C-13). `110:522` 의 달력 · Minutes per week · 통계 3칸 **0** (`D7-1`) |
| 스크롤 | `AppShell` 뷰포트 세로 스크롤 (393×852 에서 콘텐츠 ≈ 1,300) — **새 `overflow` 선언 0** |
| 쿼리 | weekly(`progressKeys.week`) 와 overview(`reportKeys.overview`) 는 **독립** — 한쪽 Loading/Error 가 다른 쪽을 가리지 않는다 (AC-7-29) |
| 하단 여백 | 탭바 관련 padding 추가 0 (기존 규칙 "이중 계상 금지") |

#### 2.1.1 캐릭터 `163:2642`

| 항목 | 값 | 근거 |
|---|---|---|
| 에셋 | `163:2643` "안경 쓴 책벌레 민트 하루" — **투명 PNG**(941×1672, 알파 0 배경) `[png]` → `shared/assets/character/bookworm.{avif,webp,png}` 로 export (`N7-27`, 기존 `home-character` 와 같은 3포맷) | `[png]` |
| 프레임 | 폭 = 컬럼 + **2** (Figma 347 vs 345 → trailing 2 overhang, Home `--home-character-overhang` 선례) · 비율 **347 / 422** · Figma 크롭(이미지 높이 146.15% · top −15.82%)을 **에셋에 미리 적용** — 원본 941×1672 → 941×1144 (aspect 0.8226 ≈ 347/422) · 프레임 `overflow` **없음** [개정 2026-11-19 ②: ~~프레임 `overflow: clip` 으로 재현~~ — 렌더 동일(VG7-C-03 픽셀 대조)·`R-SHADOW-1` ① 회피 우선] | `[ctx]` |
| 위치 | ~~프레임 top = 상태바 아래 **14** (Figma y70 − 56). 제목 행(y10~50)과~~ 프레임 top = **4** (Figma y70 − 66 — 제목 행 y66 → 0 과 같은 −66 일괄 매핑, `/library` 선례) [개정 ㉚]. 제목 행(y0~40)과 **36 겹친다** → 캐릭터는 스크롤 콘텐츠 첫 블록이며 `margin-block-start` 를 음수로 TopBar 아래까지 끌어올린다 (값 = `--progress-character-top` − 실제 TopBar 블록 높이 — dev 가 computed 로 맞춘다) | `[ctx]` |
| 겹침 | 본문 스택 top = 캐릭터 top + **276** (y346 − 70) → 캐릭터 하단 **146 (= 높이의 34.6%)** 위에 StatTile·주간 카드가 겹친다 — 비율 토큰 `T7-11` 로 폭에 따라 같이 줄어든다 | `[ctx]` |
| z | 캐릭터 < 스택 < sticky TopBar | Figma 레이어 순서 |
| 프레임 fill | Figma 는 gradient `#daebe5 → #d0e1dc` 를 **선언**한다 (이미지가 투명이므로 사각형으로 보일 수 있음). → **렌더하지 않음 권고** (`N7-30`) | 앱 배경 gradient 는 뷰포트 높이 기준이라 Figma 1105 프레임과 위치가 달라 사각 경계가 생긴다 |
| 접근성 | `alt=""` · `aria-hidden` (장식) | — |
| reduced-motion | 모션 없음 | — |

### 2.2 4주 리포트 카드 — `110:835` (발행) + `C13-S7-2` (그 외 상태)

**데이터 결합 (`M7-6`)**: Figma 카드는 **발행 리포트(기간 · PDF)** 와 **다음 리포트까지의 진행(막대 · Next report on)** 을 **한 카드에** 담는다. 따라서 카드 = `latestReport`(nullable) + `currentCycle` 두 원천. 분기는 응답 `currentCycle.status` · `eligibility` · `latestReport` 로만 한다 (Frontend 재판정 0).

```
ReportGlassCard  (as="section", aria-labelledby=title)
├─ header row  gap --space-3   ← N7-37: latestReport 있으면 이 행 = 상세 링크
│   ├─ IconTile 44  file-down 22 teal                       (T7-8)
│   └─ text col gap --space-1
│       ├─ h2  "4-week full report"          subheadline bold primary
│       ├─ p   {상태별 설명}                   caption-1 secondary
│       └─ p   {상태별 보조}                   caption-2 tertiary
├─ progress row (상태별)  ProgressBar h7 value=progressRatio  (숫자 span 미렌더 — D7-4 N7-05)
├─ action (상태별)  slot = ReportPdfAction                  (§2.6)
└─ footer  "Next report on {Mon D}"  caption-2 tertiary center   (이메일 문구 0 — N7-06)
```

| 상태 (응답) | 설명 줄 (caption-1) | 보조 줄 (caption-2) | 막대 | action | footer | 헤더 링크 |
|---|---|---|---|---|---|---|
| **발행 有 + 다음 주기 진행** (`latestReport ≠ null`, `currentCycle.status ∈ in_progress`) — **Figma `110:835`** | *"{latest.periodStart – periodEnd} · a deeper read on the four themes, with the moments behind them."* | *"Covers the last four weeks of sessions."* | `currentCycle.progressRatio` (`N7-36`) | `ReportPdfAction reportId=latest.id` | `nextReportDate` 있으면 | ✅ → 상세 |
| **첫 주기 진행** (`latestReport = null`, `in_progress`) | *"Your first 4-week report is on its way. It gathers the moments from your storytimes together."* | *"Recorded storytimes count toward it."* | `progressRatio` | 없음 | `nextReportDate` | ❌ |
| **생성 중** (`generating`) | *"{currentCycle 기간} · We're putting your report together."* | — | 숨김 → `Spinner sm` + caption-2 *"This can take a little while."* (`role="status"`) | 없음 — 이전 발행 리포트의 PDF·링크는 **과거 목록**에서 (`N7-35`: 카드 하나가 두 리포트를 가리키지 않는다) | 없음 | ❌ |
| **이월** (`deferred`) | *"There weren't quite enough recorded storytimes for a full report this time, so they'll carry into the next one."* | *"Recorded storytimes count toward it."* | `progressRatio` (새 주기) | 이전 발행 있으면 PDF 없음 — 과거 목록에서 연다 | `nextReportDate` | ❌ |
| **지연** (`delayed`) | *"Your report is taking a little longer than usual. We'll let you know when it's ready."* | — | 숨김 | 없음 | 없음 | ❌ |

- 상태 5종 × 이전 발행 유무 조합을 dev 가 **분기표 단위 테스트**로 고정한다 (AC-7-30). 표에 없는 조합(예: `published` 가 `currentCycle.status` 로 오는 경우) = 발행 상태와 같게.
- 설명 문구의 *"carry into"* · *"on its way"* = 비교·달성률 표현 0. `eligibility` 의 세부 사유(`insufficient_recorded_minutes` 등)는 **화면에 노출하지 않는다** — 분자/분모 미노출(`N7-05`)과 같은 원칙. 사유별 문구 분기 0.
- 막대: `ProgressBar value={progressRatio} max={1} size` = 7 (`T7-9`), `label="Progress toward the next report"`, `valueText` = **없음**(숫자 읽지 않음 — §9.2).

### 2.3 `C13-S7-1` 리포트 상세 `/progress/reports/:reportId`

```
StackLayout  topBar = TopBar centered  title "4-week report"  leading ← Back (N7-23)
└─ ReportDetailView   (features/report-detail — page 가 clip·pdf feature 를 slot 으로 꽂는다)
   ├─ header  pt --space-6
   │   ├─ p   기간 "Apr 13 – May 10"            Text title-3 bold primary  (TopBar 가 h1)
   │   └─ p   summary.summaryLine (서버)        Text subheadline primary
   ├─ ① ProfileCard  h2 "Growth themes"                                   (§2.3.1)
   │   ├─ DiamondChart  current + previous(overlay)   mode="display"
   │   ├─ Legend  ─ ─ "Earlier"   ■ "This report"     (previous ≠ null 일 때만)
   │   └─ dl evidence  — 4역량 중 evidence ≠ null 행만 (Q6 순서)
   ├─ ② PersonaHistory  (C13-S7-7, §2.3.2)
   ├─ ③ ProfileCard  h2 "How you talked together"                       (§2.3.3)
   ├─ ④ NotableQuoteCard ×1~2   eyebrow "IN {FIRSTNAME}'S WORDS"         (§3.6)
   ├─ ⑤ ProfileCard  h2 "What you noticed"                              (§2.3.4)
   ├─ ⑥ ProfileCard  h2 "Highlight clips"   slot = HighlightClipList    (§2.5)  — 0개면 섹션 미렌더 · slot 미지정(S7-E 전)도 미렌더 — 카드 셸은 S7-E 가 slot 과 함께 만든다 [개정 2026-11-20 ⑬]
   └─ ⑦ ReportPdfAction  (카드 밖, 콘텐츠 끝 · 흐름 배치 ~~mt --space-3~~ 섹션 간격 --space-5 [개정 ㉓])    (§2.6)
```

| 항목 | 명세 |
|---|---|
| 섹션 순서 | Plan §2 / PRD §7.7 열거 순서 그대로 (AC-7-37) |
| h 구조 | TopBar *"4-week report"* = h1 · 섹션 = h2 · 인용 카드 eyebrow 는 heading 아님 |
| 카드 recipe | 모든 섹션 = **`ProfileCard`** (`--shadow-bubble`) — Glass Rest 를 쓰지 않는다: 긴 스크롤 화면에서 카드 6~7장이 3겹 그림자를 겹치면 Figma 데이터 카드 선례(`163:2607`)와 달라지고 아래 번짐 77 이 카드 간격 20 을 넘는다 (`R-SHADOW-1`) |
| viewed | 최초 성공 렌더 시 1회 (UI 변화 0) |
| 스크롤 | `AppShell` 뷰포트. 새 `overflow` 0 |

#### 2.3.1 ① Growth themes — 다이아몬드 오버레이 (`DiamondChart.previous`, §3.7)

| 항목 | 명세 |
|---|---|
| 차트 | Stage 6 `DiamondChart` 기하·축 순서·null 축 규칙 **그대로** + `previous` 레이어 (§3.7). `previous = null`(`report-no-previous`) → 현재만, **범례 미렌더** |
| 범례 | 차트 아래 가로 2항목, gap `--space-4`: 점선 견본(16×0, `--chart-previous-*`) + `Text caption-1 secondary` *"Earlier"* · 면 견본(12×12 radius `--radius-indicator`, `--chart-area-fill` + stroke) + *"This report"*. 범례는 `aria-hidden` (summary 가 같은 정보를 말한다) |
| 근거 문장 | `dl` — 행마다 `dt` = 역량 표시 라벨(#14, `Text caption-1 semibold` `--color-action-secondary-fg` — `163:2611` 행 라벨 recipe) · `dd` = 서버 `evidence` (`Text subheadline primary`). `evidence = null` 행 **미렌더** (AC-7-39). 행 간격 `--space-3` · 차트와 목록 사이 `--color-divider` 1px |
| 숫자 | **0** — 차트·범례·summary·근거 어디에도 점수·증감 숫자 없음 (`N7-15`) |
| summary (SR) | §9.2 — 방향(늘었다/줄었다) **판정 문장 0**. Frontend 가 previous ↔ current 를 비교해 말로 바꾸지 않는다 |

#### 2.3.2 ② `C13-S7-7` 페르소나 히스토리

```
section  aria-labelledby
├─ h2 "{firstName}'s storytime persona"     (Text subheadline bold primary — 카드 밖 섹션 제목)
└─ ol.persona-timeline   (서버 순서 = 오래된 것 먼저, Frontend 정렬 0)
    └─ li ×N  grid [rail 16 | card]
        ├─ rail: 점 10 (--chart-vertex-size) + 세로선 2 --color-border-subtle (마지막 li 는 선 없음)
        │        현재(마지막) 항목 점 = --color-action-primary-bg, 이전 = --color-fg-tertiary
        └─ PersonaCard (기존, eyebrow 대신 날짜행)
             eyebrow  "SINCE {MON D}" (effectiveFrom)  ·  마지막 항목만 "NOW"
             name     title-3 bold
             description  subheadline primary
             source   caption-1 secondary  — trigger 별 문구 (N7-42)
```

| 항목 | 명세 |
|---|---|
| 1개 (`report-persona-unchanged`) | rail 없음 · PersonaCard 1장 + 카드 아래 `Text footnote primary` *"{firstName}'s persona stayed the same through this report."* (AC-7-40) · eyebrow = *NOW* (유일 항목 = 마지막 항목) [개정 2026-11-20 ⑫] |
| 간격 (`P-39`) [개정 2026-11-20 ⑫] | rail ↔ 카드 `--space-2` · 타임라인 행 `--space-3` · 섹션 제목 ↔ 목록 `--space-3` · rail 점 = 카드 eyebrow 첫 줄 가운데 · 선 = 점 아래 ~ 다음 행 점 위 (행 간격 포함). 근거 행 dt↔dd `--space-1` · SectionLabel ↔ 내용 `--space-2` · header 기간 ↔ 문장 `--space-1` — Figma 없음, 기존 스케일에서 선택 (`VG7-D-09`) |
| 재사용 | `entities/child-profile/PersonaCard` 에 **`eyebrow?: string` · `footnote?: string` prop 확장** (기본값 = 현재 동작 — Stage 6 화면 DOM 불변) + **`nameAs?: 'h2' | 'h3'`** (기본 h2 — 히스토리는 h3) [개정 2026-11-20 ⑪] |
| `isFallback` | 구분 UI 0 (Stage 6 규칙) |
| 길이 | name ≤24 · description 110~220 — 말줄임 0 |
| 접근성 | `ol` 이 순서를 전달 · rail 은 `aria-hidden` · 각 li 첫 텍스트 = 날짜 eyebrow |

#### 2.3.3 ③ How you talked together

```
ProfileCard
├─ h2 "How you talked together"
├─ dl  5행 (행 = dt 라벨 caption-1 semibold action-secondary-fg ↔ dd 값 subheadline bold primary, 우측 정렬, tabular-nums)
│    Storytimes · {sessionCount}
│    Time together · {totalMinutes → 분 포맷}
│    Things {firstName} said · {childUtteranceCount}
│    Back-and-forth turns · {turnTakingCount}
│    Feeling words · {emotionWordCount}
└─ (recentSignals.length > 0)  SectionLabel "LATELY WE NOTICED" + ul  subheadline primary (서버 문장 그대로)
```

- 행 구조는 `163:2610`(라벨 ↔ 메타 `justify-between`) recipe. **비교·순위·백분율·기준값 0** (AC-7-41). 막대 없음.
- 숫자 0 인 지표도 그대로 `0` 표시 (숨기지 않는다 — 데이터 은닉으로 읽히지 않게).

#### 2.3.4 ⑤ What you noticed (부모 피드백 요약)

```
ProfileCard
├─ h2 "What you noticed"
├─ p  summaryText (서버, null 이면 미렌더)                         subheadline primary
├─ (checkTrends.length) SectionLabel "WHAT YOU CHECKED"
│   └─ ul 행: 라벨 = 회고 체크 copy(Stage 5, ReflectionCheckKey) ↔ 메타 "{count}×"  (163:2610 recipe · tone secondary [개정 ㉗])
└─ (frequentTopics.length) SectionLabel "TOPICS THAT CAME UP" + p 쉼표 나열 (서버 문자열 그대로)
```

- ⚠️ 회고 체크 라벨 copy 는 현재 **`features/reflection/copy.ts`** 에 있다 → `features/report-detail` 이 import 하면 feature 간 import 위반. **`entities/reflection` (또는 `shared/copy`) 로 이동** 필요 (`M7-4`, `N7-43`).
- 세 블록 모두 비면 카드 대신 `Text footnote primary` *"You didn't leave notes during this report."* — 카드는 유지(섹션 위치 고정).
- 메타 `{count}×` — "3×" 는 횟수 관찰. *"times"* 로 풀어 쓰면 SR 이름 = *"Calmer at bedtime, 3 times"* (§9.1).

### 2.4 `C13-S7-5` 과거 리포트 목록 (`/progress` 안)

```
(reportCount ≥ 2 일 때만)
section
├─ SectionLabel "PAST REPORTS"                (Stage 6 recipe = caption-1 **bold** · tracking section-label · secondary — 개정 2026-11-19 ⑤: ~~semibold~~)
└─ ListGroup label="Past reports"
    └─ ListRow ×N   title = 기간 "Mar 16 – Apr 12" · subtitle = summaryLine (2줄 clamp)
                    trailing chevron-right 16 tertiary → /progress/reports/:id
   + (nextCursor) TextLink "Show earlier reports" → 다음 페이지 append
```

| 항목 | 명세 |
|---|---|
| 대상 | 목록 응답에서 **카드가 보여 주는 리포트를 제외**한 항목 (카드와 중복 0). 카드가 발행 리포트를 보여 주지 않는 상태(생성 중·이월·지연 — `N7-35` ⓐ)에서는 `reportCount ≥ 1` 이면 목록 표시 · 제외 0. 첫 페이지 크기 = Mock/contract 기본값 |
| 미열람 표시 | **없음** (Figma·PRD 근거 없음 — 배지 추가 0) |
| ListRow subtitle | 기존 `ListRow` 에 subtitle 이 없으면 `meta` 확장 선례처럼 **`subtitle?` prop 확장** (`T7-13` — 없을 때 DOM 불변) |
| Loading | 목록 자리 `Skeleton shape="block"` ×2 (행 56) · Error = `InlineAlert` + 재시도 TextLink (카드 영역 보존) |

### 2.5 `C13-S7-3` 하이라이트 클립 플레이어 (상세 ⑥)

```
ProfileCard  h2 "Highlight clips"
└─ ul  gap --space-3
    └─ HighlightClipRow ×N   grid [44 | 1fr]  gap --space-3  align center
        [개정 ㉘] 행 = 2단 grid (row-gap --space-1): 버튼 grid-row 1/span 3 = 라벨·날짜·진행(불가 = 문구) 묶음 가운데 · 오류/offline 문구 = 4행
        ├─ IconButton  play | pause | (loading: Spinner)    38 · hit 44 · glass   aria-label (§9.1)
        └─ col
            ├─ p  label (서버 캡션)               subheadline semibold primary   (1~2줄, 말줄임 0)
            ├─ p  "{Mon D}" sessionDate            caption-1 secondary
            └─ row  ProgressBar sm (value=currentTime/duration) ··· "0:04 / 0:12" caption-2 tabular-nums ~~tertiary~~ secondary [개정 ㉗]
```

| 상태 | 버튼 | 진행 | 보조 문구 |
|---|---|---|---|
| idle (기본) | `play` | 0 · 시간 = `0:00 / {duration}` | — |
| loading (URL 조회·버퍼링) | Spinner (버튼 유지, 누름 무시) | 유지 | — |
| playing | `pause` | 값 갱신 (reduced-motion: 전환 애니메이션 없이 값만) | — |
| paused | `play` | 유지 | — |
| ended | `play` (재생 위치 0 으로) | 0 | — |
| **unavailable** (`expiresAt` 경과 · `RECORDING_DELETED`) | 버튼 **비활성**, 아이콘 `play` + `aria-disabled` | 숨김 | caption-1 secondary *"This clip is no longer available."* (`N7-17` — 만료/삭제 동일 문구, 만료일 표시 0) |
| error (재발급 1회 후 실패 · offline) | `play` (다시 누르면 재시도) — **위치 idle 과 같음** [개정 ㉘] | 유지 | caption-1(줄 16) `--color-status-error-fg` · 진행 행 **아래 다음 줄** *"We couldn't play this clip. Tap play to try again."* · offline = *"You're offline. Tap play to try again when you're back."* |

- **신규 Shared UI 0** — `IconButton`(glass 38, hit 44) + `ProgressBar sm` + `Text` 조합. Domain `entities/highlight-clip/HighlightClipRow` (표시만), 상태 머신 = `features/highlight-clip-player`.
- 동시 재생 1개 · 이탈 시 정지 — 시각 변화는 해당 행이 paused 로 돌아가는 것뿐.
- 진행 막대는 **조작 불가**(seek 없음 — Figma·PRD 근거 없음, 10~15초 클립). `ProgressBar` 는 `role="progressbar"`. [개정 2026-11-20 ⑮: `aria-valuetext` = *"0:04 of 0:12"*(퍼센트 낭독 0) · 이름 *Clip progress: {label}* · 보이는 시간 텍스트는 같은 정보라 `aria-hidden`]
- [개정 2026-11-20 ⑰] *ended* 는 idle 과 표시가 같아 별도 상태로 두지 않는다 → 상태 6종. 다른 행을 재생하면 이전 행은 **위치를 기억한 paused** (다시 누르면 이어 듣기).
- [개정 2026-11-20 ⑱] C-13 값 (`P-39`): 본문 열 줄 간격 `--space-1` · 진행 행 막대↔시간 `--space-2` · 시간 한 줄(`nowrap`) · error 문구는 진행 행 **아래** · unavailable 문구는 진행 행 **자리** · 불가 dim(`--opacity-disabled`)은 **버튼에만** (라벨·날짜는 읽을 수 있게 유지) · reduced-motion loading = 정지한 Spinner arc 만 (38 버튼 안에 라벨 자리 없음 — S7-C `.haru-report-card__status` 선례, SR = 버튼 `aria-busy`).

### 2.6 `C13-S7-4` PDF 상태 — `ReportPdfAction` (카드 · 상세 공통 1 컴포넌트)

| 상태 | 표시 | 비고 |
|---|---|---|
| **idle** | `Button accent md fullWidth leadingIcon=arrow-down-to-line` *"Download PDF"* | `110:854` (`N7-33`) |
| **requesting · generating** | 같은 버튼 `loading` (~~라벨 유지 · Spinner~~ Shared `Button loading` 기존 표현 — 폭 유지 · Spinner [개정 ⑳]) + 아래 caption-2 ~~tertiary~~ secondary [개정 ㉗] center *"Preparing your PDF. This can take up to a minute."* (`role="status"`, 1회 알림) | 폴링 2s / 60s (`N7-24`) |
| **ready** — 공유 가능 (`canShareFile`) | `ButtonGroup` ~~가로 2~~ 2버튼 — **그룹 폭 ≥ 360 가로 · < 360 자동 세로 stack**(폰 폭은 세로: 위 Share · 아래 Save PDF, gap `--space-3`) [개정 ㉕, `VG7-F-03` ⓐ]: `Button accent md` *"Save PDF"* (arrow-down-to-line) · `Button glass md` *"Share"* (Lucide `share`) — DOM·시각 순서 Share → Save PDF [개정 ⑳㉑] | 두 버튼 모두 **사용자 탭 = transient activation** 안에서 save/share 호출 (`R7-04`, `N7-40`) |
| **ready** — 공유 불가 | `Button accent md fullWidth` *"Save PDF"* 1개 | `share-unsupported` |
| share 취소 (`AbortError`) | **변화 0** (ready 유지) | 오류 아님 |
| share `NotAllowedError` | ready 유지 + caption-2 secondary [개정 ㉗] *"Sharing isn't available here. Save the PDF instead."* | — |
| **failed** | `InlineAlert tone="error"` *"We couldn't prepare the PDF."* / *"Please try again."* + `Button glass md` *"Try again"* | 같은 IK 정책은 Plan §5.3 |
| **timeout** (60s 초과) | `InlineAlert tone="info"` *"Your PDF is taking longer than usual."* / *"Try again in a little while."* + *"Try again"* | 폴링 중단 |
| **offline** | ~~`InlineAlert tone="error"`~~ `InlineAlert tone="offline"`(기존 offline 표현, `wifi-off`) [개정 2026-11-20 ⑲] *"You're offline."* / *"Try again when you're back online."* + *"Try again"* | — |

- 카드 안(§2.2)과 상세 하단(§2.3 ⑦) 은 **같은 컴포넌트·같은 상태**(같은 `reportKeys.pdf(reportId)`) — 한쪽에서 준비하면 다른 쪽도 ready (`N7-24`).
- ready 후 **자동 저장 0** — 비동기 대기 후 자동 다운로드는 iOS Safari 에서 차단될 수 있고 공유와 같은 제스처 규칙을 맞춘다 (`N7-40`).
- 저장 완료 Toast **없음** (브라우저 다운로드 UI 가 피드백 — 새 UI 추가 0).
- [개정 2026-11-20 ㉒] C-13 값 (`P-39`): 버튼 ↔ *Preparing…* · 공유 거절 문장 `--space-2` · `InlineAlert` ↔ *Try again* `--space-3` · *Try again* `fullWidth`(idle 버튼과 같은 폭) · live region 1개 상시(`role="status"`, 비면 높이 0 — `InlineAlert` 는 자기 role 이 있어 영역 밖) · 단계가 바뀌어 누른 버튼이 사라질 때 포커스가 영역 안에 있었으면 새 첫 버튼으로 이동.

### 2.7 `C13-S7-6` 주 선택 시트

```
WeekPickerChip (TopBar trailing, §3.2)  ── tap ──▶  Sheet (기존, bottom)  title "Choose a week"
                                                     └─ RadioGroup variant="card" legend "Week" (legendVisuallyHidden)
                                                         └─ 옵션 = availableWeeks (서버 순서 = 최신 먼저)
                                                              label "May 4 – 10" · meta "This week" (첫 항목만, Stage 6 `RadioOption.meta`)
```

| 항목 | 명세 |
|---|---|
| 선택 | 옵션 선택 **즉시** 시트 닫힘 + 해당 주 조회 (확인 버튼 없음 — 단일 선택·취소 비용 0) · 포커스는 chip 으로 복귀 |
| 주 1개 (`progress-first-week`) | chip = **정적 라벨** (button 아님 · chevron 미렌더 · 포커스 불가) (`N7-25`) — 회색 disabled 대신 정보 표시로 |
| 이전 주 선택 중 | chip 라벨 = 선택 주 · 이번 주로 돌아가려면 시트에서 *This week* 선택 (별도 리셋 UI 0) |
| 리포트 카드 | 주 선택과 **무관** (overview 는 주 파라미터 없음) |
| 시트 높이 | 옵션 ≤ 6 은 내용 높이, 초과 시 기존 `Sheet` 본문 스크롤 (기존 `contentShadowInset` — 옵션 행은 그림자 0 이라 inset 불필요) |

### 2.8 `C13-S7-8` Progress 빈 상태

| 경우 (Mock) | 표시 | 이유 |
|---|---|---|
| 이번 주 세션 0 (`empty`) | **레이아웃 유지** — StatTile `0` / `0m` · 합계 `0m` · 보조 줄 = *"No storytimes yet this week."* · 막대 7열 전부 "기록 없음" 스텁 · Growth themes = 응답 그대로 · Moment = `null` → **카드 미렌더** | 별도 EmptyState 화면을 만들면 Figma `31:102` 구성이 사라진다 (최우선 규칙 3). 0 은 사실 표기 |
| 리포트 0 (`empty`) | 카드 = **첫 주기 진행** 상태 (§2.2) · 과거 목록 미렌더 | — |
| 처음 가입 직후 | 위 둘의 결합 — 추가 UI 0 | — |

### 2.9 `C13-S7-9` 공통 상태

| 화면 / 영역 | Loading | Error | Offline | 기타 |
|---|---|---|---|---|
| `/progress` weekly 블록 | StatTile 자리 `Skeleton block` ×2 (h73) · 주간 카드 `block` h212 · Growth `block` h215 (Moment 자리 0) | 4블록 자리에 `ErrorState tone="error"` + *"Try again"* (titleAs h2) | `ErrorState tone="offline"` | chip = 마지막 성공 값 유지(없으면 정적 *"This week"*) |
| `/progress` 리포트 카드 | 카드 셸 안 `Skeleton text lines=3` + `block` h7 | **셸 없이** `ErrorState` 단독 + *"Try again"* (주간 오류와 같은 모양) [개정 2026-11-19 ⑥: ~~카드 셸 안~~ — `ErrorState` 가 자체 Surface 라 카드 안 카드가 된다] | 〃 offline | — |
| 상세 | header `text lines=2` → ~~`block` h(차트 높이 + 40) → `block` h200 ×2~~ 차트 카드(`ProfileCard` 안 차트 높이 rect) → `ProfileCard` 안 `text lines=5` ×2 [개정 2026-11-20 ⑩] | `ErrorState` + *"Try again"* | offline | **Not found** (~~`NOT_FOUND`~~ **`RESOURCE_NOT_FOUND`** [개정 ⑧]) = `ErrorState` *"We couldn't find this report."* + 버튼 *"Back to Progress"* (retry 대신 — `ErrorState` 회복 버튼 자리 그대로, glass [개정 ⑨]) · **Not ready** (`REPORT_NOT_READY`) = `EmptyState icon="clock"` *"This report isn't ready yet."* / *"We'll let you know when it is."* + *"Back to Progress"* · `REPORT_NOT_ELIGIBLE` = Not ready 와 같은 화면 |
| 접근성 | 컨테이너 `aria-busy` + SR *"Loading"* 1개 (기존) | 기존 `ErrorState` announce | 기존 | — |

전체 화면 스피너 0 (Stage 6 §2.7 규칙).

---

## 3. 컴포넌트 — Variant / State / Props

### 3.1 `StatTile` → **`packages/ui` 신규** (Shared — 도메인 비의존)

| 항목 | 값 | 토큰 |
|---|---|---|
| Props | `value: string` (포맷된 값) · `label: string` | 숫자 포맷은 호출부 |
| 면 · 그림자 | glass-fill-strong 90% · drop 1겹 + inset 2겹 | `Surface fill="strong" material="bubble"` (`163:2607` 와 같은 인스턴스 렌더 — `V-10` 선례) |
| radius | 20 → **22** | `--radius-surface` (Δ+2, 16 은 Δ−4) |
| padding · gap | 13/8 · 5 | `T7-5` |
| 값 | **Heavy 24** primary, line normal | `T7-5` `--stat-tile-value-size` (24 = 타입 스케일 밖, title-2 22 흡수 시 Δ−2 — **흡수하지 않음**: 화면 대표 수치) |
| 라벨 | Medium 11 secondary | `Text caption-2` · weight medium · `--color-fg-secondary` (`P-01` 범위) |
| 행 | 2열 flex-1 · gap 10 · 행 높이 84 · 세로 가운데 | `T7-5` `--stat-tile-row-block-size` · `--space-2-5` |
| ⚠️ Figma `overflow-clip` | 행이 `overflow-clip` + py4 → 타일 아래 번짐 10 이 **Figma 에서도 잘려 있다** | **재현하지 않는다** (`R-SHADOW-1` ① — overflow 회피, `M7-11`). 행 아래 gap 14 ≥ 번짐 10 |
| 접근성 | 값+라벨 = 한 텍스트 노드 순서(*"5 sessions"*) · 장식 없음 | — |

### 3.2 `WeekPickerChip` → **Feature 내부 컴포넌트** (`features/progress-overview`)

| 항목 | 값 |
|---|---|
| 구조 | `<button>` · 라벨 `Text footnote semibold primary`(13 ✅ Δ0) + `Icon chevron-down` 12 `--color-fg-secondary` |
| 면 · 그림자 · radius | `--color-surface-glass` 74% · `--shadow-bubble` · `--radius-pill` (`26:40` WeekSummaryChip 과 같은 재질 실측) |
| 기하 | block 34 · pad-inline 14 · gap 6 · **hit 44** (::before 확장 — Button sm 선례) — `T7-12` |
| 상태 | default · ~~pressed(opacity `--opacity-pressed` 기존 규칙)~~ pressed 시각 표시 없음 (개정 2026-11-19 ⑦ — 토큰 부재) · focus-visible(`haru-focus-ring`) · **static**(주 1개 — `<span>`, chevron 0) |
| 왜 `SelectTrigger` 가 아닌가 | `SelectTrigger` 는 폼 필드(radius 22 · 흰 면 · 라벨) — `31:118` 은 pill chip. 왜 `Button sm` 이 아닌가: sm = 36·라벨 15 → Figma 34·13 과 다르다 |
| 왜 Shared UI 가 아닌가 | 사용처 1곳. 2번째 사용처가 생기면 승격 |
| `aria` | `aria-haspopup="dialog"` · 이름 = *"Week: May 4 – 10. Change week"* |

### 3.3 `WeeklyReadingCard` → Domain (`entities/weekly-progress`)

| 항목 | 명세 |
|---|---|
| 셸 | ReportGlassCard recipe (`fill="card" material="rest"`) |
| 헤더 | 좌: h2 *"This week's reading"* (subheadline bold, line 20) → **4** ↓ 합계 `T7-6` (Bold 26/26, tracking −0.52px) → **4** ↓ 보조 줄 `Text caption-1 tertiary` · 우: 토글 (`N7-41` ⓑ 일 때만) [개정 2026-11-19 ③: ~~8 · 5~~ — `get_metadata(163:2552)` 은 제목 h18 → 합계 y23 → 보조 y53 = **간격 5 · 4**. 제목 line 20(Δ+2)을 흡수해 `--space-1` 4 · 4 → 합계 y24 · 보조 y54 (Δ+1)] |
| 합계 | `readingSummary.totalMinutes` 분 포맷 |
| ⛔ 비교 문구 | `163:2558` *"+18% vs last week"* **미렌더** (`D7-2` ①) — 허용 차이 후보 `AD7-1` |
| 보조 줄 | `"{n} nights"` (+ `averageSessionMinutes ≠ null` 이면 ` · avg {m} min`) — **분모 0** (`D7-2` ②, 허용 차이 후보 `AD7-2`). n=1 → *"1 night"* · n=0 → *"No storytimes yet this week."* |
| 막대 | §3.4 |

### 3.4 `WeeklyBars` → **`packages/ui` 신규 `BarChart`** (`N7-21`, 도메인 비의존 — div 막대)

**Props**: `bars: readonly { id; label (요일 1글자); srLabel (요일 전체); value: number | null; valueLabel (포맷된 "8m" | "—"); }[]` · `emphasisRatio?: number` · `summary?: string`.

| 항목 | 값 | 근거 |
|---|---|---|
| 영역 | block **110** (pt 14 포함) · 열 flex-1 · gap **10** → `--space-2-5` | `[ctx]` `T7-4` |
| 열 | col · 아래 정렬 · gap **6** (`--space-1-5`): 값 라벨 → 막대 → 요일 | `[ctx]` |
| 막대 | 폭 16 · radius 8 (`--radius-control`) | `[ctx]` |
| 높이 | **`value / max(values) × 트랙 높이`** (트랙 = 영역 − pt − 두 라벨 − 두 gap) — 최대값 막대 = 트랙 전체 | `N7-29` ⓐ (Figma 의 16m=20m 동일 높이는 상한 잘림 — `M7-3`) |
| 강조 | `value ≥ emphasisRatio × max` (기본 **0.75**) → fill teal 100% + 값 라벨 `--color-action-secondary-fg` bold · 그 외 fill **teal 55%** + 값 라벨 `ink-300` | `N7-29` ⓐ — 이 규칙이 Figma fixture(8·13·—·16·11·20·4)에서 **16·20 두 개**를 정확히 재현 |
| 기록 없음 (`null` 또는 0) | 스텁 **h4 · radius `--radius-indicator` · `--color-border-subtle`** · 값 라벨 *"—"* `ink-300` | `[ctx]` |
| 라벨 크기 | 값 Bold 10 · 요일 Semibold 10.5 → **둘 다 `caption-2` 11** 흡수 (`N7-31`) | 11 미만 텍스트를 토큰 스케일에 만들지 않는다 |
| 라벨 줄 높이 [개정 ㉙] | **`--bar-chart-label-line` 11** (Figma leading 1.0 — `163:2566` 10/10 · `163:2569` 10.5→11) · caption-2 줄 13 을 쓰지 않는다 → 열 96 = 11 + 6 + **트랙 62** + 6 + 11 (Figma 10 + 6 + 63 + 6 + 11, 막대 아래끝 열 y79 = Figma 동일) | `VG7-B-03` ⓑ · `D7-6` ① · 남은 Δ−1 = `AD7-7` 결과 항목 |
| 접근성 | 컨테이너 `role="list"` aria-label = summary(*"Minutes read each day this week"*) · 열 `role="listitem"` 이름 = *"Monday, 8 minutes"* / *"Wednesday, no storytime"* · 시각 라벨 `aria-hidden` | AC-7-22 |
| 모션 | 첫 렌더 막대 높이 grow `--motion-duration-slow` · reduced-motion 즉시 | Stage 6 차트 규칙 |

~~`entities/weekly-progress` 가~~ **`features/progress-overview/model/weeklyView.ts` 가** `days` → bars 매핑(요일 라벨·분 포맷·SR 문장)을 한다 — SR 문장·요일 이름은 copy 이므로 copy 를 소유한 feature 에 둔다. `WeeklyReadingCard`(entity)는 포맷된 값만 받는다. `packages/ui` 는 분·요일을 모른다. [개정 2026-11-19 ④]

### 3.5 `GrowthThemesCard` → Domain (`entities/weekly-progress`) — `163:2607`

| 항목 | 명세 |
|---|---|
| 셸 | **`ProfileCard`** (Stage 6 — 이 노드에서 만든 recipe 그대로) · 제목 h2 *"Growth themes"* |
| 행 | col gap 6: 상단 `justify-between` — 라벨(#14) `Text caption-1 semibold` `--color-action-secondary-fg` ↔ 단계 `Text caption-1 medium` `--color-fg-tertiary` · 하단 막대 |
| 순서 | Self-Direction → Emotion Regulation → Cognitive Flexibility → Intrinsic Motivation (`163:2607` · Q6) — 응답 순서가 달라도 **이 순서로 배치**(배치 규칙이지 데이터 가공 아님) |
| 단계 라벨 | `stage` → copy `strong` / `growing` / `emerging` (`D7-2` ③ — Figma 소문자 그대로) |
| 막대 | `ProgressBar size="md"`(8 · radius 4 · track ink 12% ✅) · `value=level max=1` · **색 = 역량별 growth-theme 토큰** (`T7-1`, `N7-10` — Figma 선언값). `ProgressBar` 에 `tone` 확장 대신 **`fillColor` CSS 변수 override 1개** (`--progress-fill-color`) — `T7-2` |
| 막대 접근성 | 막대는 `aria-hidden` — 정보는 단계 라벨 텍스트가 전달 (숫자 level 을 SR 로 읽지 않음, `N7-15` 일관) |
| ⚠️ 4행 라벨 | Figma `163:2629` 만 Medium 13 → **3행과 같은 Semibold 12** 로 통일 (`N7-31`, Figma 편집 불일치로 판단 — 근거: 같은 컴포넌트 반복 4행 중 1행만 다름) |

### 3.6 `NotableQuoteCard` → Domain (`entities/report`) — `163:2633`

| 항목 | 값 | 토큰 |
|---|---|---|
| Props | `eyebrow` · `quote` · `speakerName` · `source`(포맷된 *"Tue · The Most Magnificent Thing, p.14"*) | — |
| 면 | teal **16%** · border 1px teal **35%** · **그림자 0** | `T7-7` `--color-surface-moment` · `--color-border-moment` |
| radius · pad · gap | 24→22 · 16 · **7** | `--radius-surface` · `--space-4` · `T7-7` `--moment-card-gap` 7 (6/8 동점 — 흡수 안 함) |
| eyebrow | Semibold 11 · tracking 0.4 · 대문자(copy) · `#6f8c88` → `--color-fg-secondary` | `N7-32` |
| 인용 | **Medium 14/21** primary — `“{quote}” — {speakerName}` | `T7-7` `--moment-quote-size` 14 · line 21 (footnote 13/18 · subheadline 15/20 어느 쪽도 Δ1 동점 — 흡수 안 함) |
| 출처 | Regular 12 secondary | `Text caption-1 secondary` |
| 사용처 | Progress *"MOMENT OF THE WEEK"* · 상세 ④ *"IN {FIRSTNAME}'S WORDS"* (인용 2개면 같은 eyebrow 2장, gap 14) | — |
| 출처 형식 | 요일 약어 · 책 제목 · `pageRef` 있으면 `, p.{n}` — 상세(`sessionDate`)는 `Mon D` | `bookTitle = null` → 날짜만 |

### 3.7 `DiamondChart` — **확장**: `previous` 레이어 (Stage 6 자리 예약분)

| 항목 | 명세 |
|---|---|
| Prop | `previous?: readonly [number|null ×4] | null` — `axes` 와 같은 순서 |
| 형상 | **같은 "이웃 축 둘 다 값 있는 사분면" 규칙**으로 외곽선만 — **면 채움 0 · 꼭짓점 0** |
| 선 | `--chart-previous-stroke` (ink-400 `--color-fg-tertiary`) · 1.5px · dash `4 3` · `stroke-linejoin: round` (`T7-10`, 가값 `P-38`) |
| z 순서 | 격자 → **previous** → current 면 → current 외곽선 → 꼭짓점 (현재가 위) |
| 모션 | previous = 즉시 표시 · current = Stage 6 scale+opacity (reduced-motion 즉시) — "이전에서 현재로" 시선 |
| 기존 영향 | `previous` 미지정 → DOM·렌더 **변경 0** (Stage 6 baseline 불변 — 회귀 확인) |
| mode | 리포트는 `display` 만 |

### 3.8 `PersonaCard` — **확장** `eyebrow?` · `footnote?` (§2.3.2) · `nameAs?` (heading 레벨, 기본 `h2` — 개정 2026-11-20 ⑪)

### 3.9 분류

| 컴포넌트 | 분류 | 위치 | 신규/재사용 |
|---|---|---|---|
| `StatTile` | Shared UI | `packages/ui` | **신규** |
| `BarChart` | Shared UI | `packages/ui` | **신규** (`N7-21`) |
| `DiamondChart` `previous` | Shared UI 확장 | `packages/ui` | 확장 |
| `Surface` `fill="card"` | Shared UI 확장 | `packages/ui` | 확장 (`T7-3`) |
| `ProgressBar` fill 색 override | Shared UI 확장 | `packages/ui` | 확장 (`T7-2`) |
| `ListRow` `subtitle?` | Shared UI 확장 | `packages/ui` | 확장 (`T7-13`, 없으면) |
| `WeeklyReadingCard` · `GrowthThemesCard` | Domain | `entities/weekly-progress` | 신규 |
| `NotableQuoteCard` · `ReportGlassCard`(recipe) · `ReportPeriodLabel` 포맷 | Domain | `entities/report` | 신규 |
| `HighlightClipRow` | Domain | `entities/highlight-clip` | 신규 |
| `PersonaCard` `eyebrow`·`footnote` | Domain 확장 | `entities/child-profile` | 확장 |
| 회고 체크 라벨 copy | Domain copy | **`entities/reflection`** 로 이동 | **이동** (`M7-4`) |
| `WeeklyProgressView` · `WeekPickerChip` · `WeekPickerSheet` · `ReportCard` · `PastReportList` | Feature | `features/progress-overview` | 신규 |
| `ReportDetailView` · `PersonaHistory` | Feature | `features/report-detail` | 신규 |
| `HighlightClipList` (상태 머신) | Feature | `features/highlight-clip-player` | 신규 |
| `ReportPdfAction` (상태 머신) | Feature | `features/report-pdf` | 신규 |
| `ProgressCharacter` | Page-only (장식 img) | `features/progress-overview` 또는 page | 신규 |
| 재사용 그대로 | — | — | `TopBar`(large · centered) · `IconButton` · `Button`/`ButtonGroup` · `Sheet` · `RadioGroup`(`meta`) · `ListGroup`/`ListRow` · `TextLink` · `ProgressBar` · `Spinner` · `Skeleton` · `ErrorState` · `EmptyState` · `InlineAlert` · `Text` · `Icon` · `ProfileCard` · `PersonaCard` · `AppTabBar` |

Icon registry 추가 (Lucide): `file-down` · `arrow-down-to-line` · `share` · `play` · `pause` · `clock`(없으면).

---

## 4. 신규 Shared UI / Domain — 요약

- Shared UI **신규 2** (`StatTile` · `BarChart`) + **확장 4** (`DiamondChart.previous` · `Surface fill="card"` · `ProgressBar` 색 override · `ListRow.subtitle`).
- 플레이어·PDF 액션은 Shared UI 를 만들지 않는다 (기존 `IconButton`·`ProgressBar`·`Button` 조합).
- Domain 신규 5 · 확장 1 · 이동 1 · Feature 신규 8.
- 승인 후 `COMPONENT_MAP.md` 의 `StatTile` · `WeeklyReadingChart`(→ `BarChart` + `WeeklyReadingCard`) · `NotableQuoteCard` · `ReportArchiveCard`(→ `ReportCard`) · `HighlightClipPlayer`(→ `HighlightClipRow` + feature) · `GrowthReportOverview` 행을 위 분류로 정정한다 (이 DRAFT 에서는 문서를 고치지 않았다).

---

## 5. 토큰

### 5.1 그대로 쓰는 것 `[직독]`

| 용도 | 토큰 |
|---|---|
| Glass Rest 카드 | `--color-surface-card` · `--blur-material-md` · `--shadow-glass-rest` · `--radius-surface` · `--space-4` |
| 데이터 카드 | `ProfileCard` (`--color-surface-strong` · `--shadow-bubble`) |
| chip | `--color-surface-glass` · `--shadow-bubble` · `--radius-pill` |
| 텍스트 | `--color-fg-primary` · `--color-fg-strong` · `--color-fg-secondary` · `--color-fg-tertiary` · `--color-action-secondary-fg` |
| 막대 · 진행 | `--color-action-primary-bg` · `--color-progress-fill` · `--color-progress-track` · `--color-border-subtle` · `--progress-height-md` · `--radius-indicator` · `--radius-control` |
| 차트 | Stage 6 `--chart-*` 전부 |
| 타이포 | `--text-title-1`(Heavy — 기존 TopBar large) · `--text-title-3` · `--text-subheadline` · `--text-footnote` · `--text-caption-1` · `--text-caption-2` |
| 터치 · 모션 | `--size-touch-min` · `--motion-duration-slow` · `--motion-duration-fast` · `--motion-ease-standard` |

### 5.2 신규 요청 `T7-x` (전부 승인 필요)

| ID | 토큰 | 값 | Tier | 근거 |
|---|---|---|---|---|
| **`T7-1`** | Primitive `--haru-violet-67` | `#ac93c4` | 1 | Figma **변수** `color/violet/67` (`[var]` — 바인딩된 값이므로 신규 Primitive 정당) |
| 〃 | Semantic `--color-growth-theme-agency` · `-emotion` · `-flexibility` · `-motivation` | `--haru-palette-teal` · `--haru-palette-pink` · `--haru-palette-blue` · `--haru-violet-67` | 2 | `163:2607` fill 변수 4개 (`N7-10`). `--color-capability-*`(#19) 와 **별도 세트** — 공존은 디자이너 확인(Q7-10) |
| `T7-2` | `ProgressBar` fill override `--progress-fill-color` (기본 `--color-progress-fill`) | — | 3 | 새 값 0 — 변수 경로만 |
| `T7-3` | (토큰 아님) `Surface fill="card"` → `--color-surface-card` + `--material-blur-md` (+ 기존 fallback 규칙) | 기존 | — | §0.3 |
| `T7-4` | `--bar-chart-block-size` 110 · `--bar-chart-pad-block-start` 14 (`--space-3-5`) · `--bar-chart-gap` (`--space-2-5`) · `--bar-chart-label-gap` (`--space-1-5`) · `--bar-chart-bar-width` 16 · `--bar-chart-bar-radius` (`--radius-control`) · `--bar-chart-fill` (`--color-action-primary-bg`) · `--bar-chart-fill-muted` (`color-mix(… teal 55%)`) · `--bar-chart-empty-size` 4 · `--bar-chart-empty-fill` (`--color-border-subtle`) · **`--bar-chart-label-line` 11px** [개정 ㉙] | — | 3 | `163:2564` `[ctx]` |
| `T7-5` | `--stat-tile-value-size` 24 · `--stat-tile-pad-block` 13 · `--stat-tile-pad-inline` (`--space-2`) · `--stat-tile-gap` 5 · `--stat-tile-row-block-size` 84 | — | 3 | `163:2544` |
| `T7-6` | `--weekly-total-size` 26 · `--weekly-total-line` 26 · `--weekly-total-tracking` −0.52px · Semantic `--color-fg-quaternary` = `--haru-ink-300` (막대 값 라벨 — 가값 `P-35`) | — | 3 / 2 | `163:2557` · `163:2567` |
| `T7-7` | `--color-surface-moment` = `color-mix(teal 16%)` · `--color-border-moment` = `color-mix(teal 35%)` · `--moment-card-gap` 7 · `--moment-quote-size` 14 · `--moment-quote-line` 21 · `--moment-eyebrow-tracking` 0.4px | — | 2 / 3 | `163:2633` |
| `T7-8` | `--report-card-icon-tile-size` 44 · `--report-card-icon-size` 22 · `--report-card-icon-tile-bg` = `color-mix(teal 20%)` · `--report-card-icon-tile-radius` (`--radius-media` 12, Figma 14) | — | 3 | `110:837` |
| `T7-9` | `--report-card-progress-height` 7 | 7px | 3 | `110:851` — `--reading-now-progress-height` 와 같은 값이지만 소유 컴포넌트가 달라 별도 (home chip 리네임 선례) |
| `T7-10` | `--chart-previous-stroke` (`--color-fg-tertiary`) · `--chart-previous-width` 1.5px · `--chart-previous-dash` `4 3` · `--chart-legend-swatch` 12 | — | 2 / 3 | Figma 없음 → `P-38` |
| `T7-11` | `--progress-character-top` ~~14~~ **4** [개정 ㉚] · `--progress-character-aspect` 347 / 422 · `--progress-character-overlap` 0.346 (비율) · `--progress-character-overhang` 2px | — | 3 | `163:2642` |
| `T7-12` | `--week-picker-chip-block-size` 34 · `--week-picker-chip-pad-inline` (`--space-3-5`) · `--week-picker-chip-gap` (`--space-1-5`) · `--week-picker-chip-icon-size` 12 · `--week-picker-chip-hit-size` (`--size-touch-min`) | — | 3 | `31:118` |
| `T7-13` | (토큰 아님) `ListRow.subtitle` 2줄 clamp 규칙 | — | — | §2.4 |
| `T7-14` | `--persona-rail-width` 16 · `--persona-rail-line` 2px (`--color-border-subtle`) | — | 3 | C-13 → `P-39` |
| `T7-15` | `--clip-row-gap` (`--space-3`) — 플레이어 행 | — | 3 | C-13 → `P-39` |

신규 HEX **1** (`#ac93c4` — Figma 변수) · 그 외 신규 HEX 0 (`#6f8c88` · `rgba(233,240,237)` 는 흡수).

### 5.3 신규 가값 (`P-35` 부터, 번호 재배정 금지)

| ID | 대상 | 현재 값 · 대비 `[계산]` | 교체 조건 |
|---|---|---|---|
| **`P-35`** | **ink-400 · ink-300 텍스트** (Figma 선언값) — 보조 줄 *"6 nights…"* · 단계 라벨 · 요일 라벨 · *"Covers…"* · *"Next report on"* = ink-400 on 카드 **2.20~2.35** · 막대 값 라벨 ink-300 **1.72~1.84** (목표 4.5) | 위 | 디자이너 (Q7-15). ⚠️ Stage 6 은 신규 화면 설명문을 본문색으로 올렸지만(`N6-33`) **이 화면은 Figma 가 있다** — 최우선 규칙 1 로 Figma 색을 쓰고 가값 등록 |
| **`P-36`** | 비텍스트 — 막대 teal55% **1.41~1.44** · teal **1.91~2.01** · growth 막대 pink 1.44~1.51 · blue 2.21~2.33 · violet67 2.50~2.63 · 스텁 ink18% 1.25 (목표 3:1) | 위 | 디자이너. 정보는 값 라벨·단계 텍스트·SR 이름이 전달 |
| **`P-37`** | **Moment 카드** (teal 16% 반투명 · 그림자 0) — 인용 ink-700 **3.98~5.20** · eyebrow ink-500 **1.92~2.51** · 출처 ink-500 동일 (배경 gradient 끝일수록 낮다) | 위 | 디자이너 + VG 에서 실제 배경 픽셀 재측정 |
| **`P-38`** | 다이아몬드 `previous` 레이어 — ink-400 1.5px dash `4 3` · 범례 견본 · *"Earlier / This report"* | Figma 없음 | 디자이너 (Q7-1) |
| **`P-39`** | C-13 레이아웃 값 일체 — 페르소나 rail 16/2 · 클립 행 44 grid · PDF ready 2버튼 · 과거 목록 · 시트 · 상태별 카드 문구 배치 | Figma 없음 | 디자이너 (Q7-1~9) |
| **`P-40`** | 막대 강조 규칙 `≥ 0.75 × max` (`N7-29`) | Figma fixture 재현용 추정 | 디자이너 (Q7-13) |

---

## 6. Interaction / Motion (CSS · Pointer Events 전용)

| 대상 | 동작 |
|---|---|
| 주 chip | tap → Sheet 열림 (기존 Sheet 모션) · 선택 즉시 닫힘 · 데이터 교체 중 해당 블록만 `aria-busy` (이전 값 유지 + 0.6 opacity 아님 — Skeleton 으로 교체) |
| 막대 | 첫 렌더 grow (slow) · 주 변경 시 다시 grow · reduced-motion 즉시 |
| 다이아몬드 | §3.7 |
| 리포트 카드 헤더 | ~~링크 pressed = opacity `--opacity-pressed`~~ pressed 시각 표시 없음 (개정 2026-11-19 ⑦ — 토큰 부재) · focus ring 은 헤더 행 박스 |
| 플레이어 | 아이콘 교체만 · 진행 값 갱신(timeupdate) · 애니메이션 0 |
| PDF | Button `loading` (기존) |
| 화면 전환 | 기존 라우팅 (애니메이션 없음) |
| (`N7-41` ⓑ 시) 토글 | 막대 영역 `hidden` 토글 — **높이 애니메이션 0** (`overflow: hidden` 접기 금지 — 그림자 클립 선례 `library.css` ②) |

---

## 7. 상태 화면과 Mock 시나리오 매핑

| 화면 | 상태 | Mock (그룹 · key) | 명세 |
|---|---|---|---|
| Progress weekly | 성공 · 이번 주 0 · 첫 주 · 여러 주 | `progress` `success` · `empty` · `progress-first-week` · `progress-multi-week` | §2.1 · §2.8 · §2.7 |
| 〃 | Loading · Error · Offline · Retry | `progress` `loading` · `error` · `offline` · `retry` | §2.9 |
| 리포트 카드 | 첫 주기 | `reports` `empty` | §2.2 |
| 〃 | 생성 중 + 과거 2건 | `report-eligible` | §2.2 · §2.4 |
| 〃 | 진행(미충족) | `report-not-eligible` | §2.2 (사유 노출 0) |
| 〃 | 이월 · 지연 | `report-deferred` · `report-delayed` | §2.2 |
| 〃 | 발행 (Figma) | `report-published-unviewed` · `success` | §2.2 |
| 상세 | 성공 · 첫 리포트 · 페르소나 1개 | `success` · `report-no-previous` · `report-persona-unchanged` | §2.3 |
| 〃 | Not ready · Not found · Loading · Error · Offline | `report-delayed` · (~~NOT_FOUND~~ `RESOURCE_NOT_FOUND` id — 개정 ⑧) · `loading` · `error` · `offline` | §2.9 |
| 클립 | 재생 · 만료 · 삭제 · URL 재발급 · 오류 · 오프라인 | `highlight-clips` `success` · `clip-expired` · `recording-deleted` · `clip-url-expired` · `error` · `offline` | §2.5 |
| PDF | 성공 · 생성 지속 · 실패 · 타임아웃 · 공유 취소 · 공유 미지원 | `report-pdf` `success` · `pdf-generating` · `pdf-failed` · `pdf-timeout` · `share-cancelled` · `share-unsupported` | §2.6 |
| 공통 | Permission Denied | 해당 없음 | — |

---

## 8. Responsive `[계산]`

### 8.1 가로

| 뷰포트 | 컬럼 | 캐릭터 (폭×높이 / 겹침) | StatTile 폭 | 막대 열 폭 (카드 내부 W−32) | 다이아몬드 h (ProfileCard 내부) |
|---|---|---|---|---|---|
| 320 | 272 | 274 × 333 / 115 | 131 | (240 − 60)/7 = **25.7** ≥ 막대 16 · 값 라벨 "20m"@11 ≈ 19 ✅ | 50 (Stage 6) |
| 393 | 345 | 347 × 422 / 146 (Figma) | 167.5 | 36.1 (Figma) | 86.5 |
| 600 · 1024 | 480 | 482 × 586 / 203 | 235 | 55.4 | 100 |

- 480 컬럼에서 캐릭터 586 은 Figma 비율 그대로 확대된 것 — 이미지 원본 941px 로 2x 해상도 유지(482×2=964 ≈ 941, 허용). 상한 토큰을 두지 않는다 (Home 캐릭터 선례와 같음). 커 보인다는 검수 의견이 나오면 VG 에서 `max-inline-size` 제안.
- chip 라벨 최장 *"Dec 29 – Jan 4"* @13 ≈ 95 + 14×2 + 12 + 6 = 141 — TopBar large 의 trailing 이 제목 *"Progress"*(≈125)와 함께 320 컬럼(272)에 **들어간다** (266).
- 과거 목록 · 상세 · 시트 = 단일 컬럼, 가로 넘침 0.

### 8.2 세로 (393×852)

| 화면 | 콘텐츠 (근사) | 동작 |
|---|---|---|
| Progress | TopBar 50 + 캐릭터 276(겹침 제외) + tiles 84 + 주간 212 + growth 215 + moment 115 + 카드 231 + gap 14×5 + (과거 목록 ≈ 200) ≈ **1,250~1,450** | 스크롤 (Figma 1105 프레임도 스크롤 전제) |
| 상세 | ≈ 2,000+ | 스크롤 |

### 8.3 긴 문자열

- `summaryLine` · `evidence` · persona description · 클립 label · 인용 — **말줄임 0**, `overflow-wrap: break-word` (Stage 5 `D5-14`). 예외: 과거 목록 subtitle 2줄 clamp (목록 밀도 — 전문은 상세에 있다).
- 아이 이름 40자 — 섹션 제목·eyebrow·SR 문장 줄바꿈. TopBar 제목은 이름 미사용.

---

## 9. Accessibility

### 9.1 이름 · 순서 · live region

| 화면 | 포커스 순서 | 비고 |
|---|---|---|
| Progress | TopBar(h1) → chip → (주간 카드 토글 `N7-41` ⓑ) → 리포트 카드 헤더 링크 → PDF 버튼 → 과거 목록 행 → 더 보기 → 탭바 | heading: h1 *Progress* → h2 ×3~4 (*This week's reading* · *Growth themes* · *4-week full report* · SR 전용 h2 *Past reports*). StatTile·Moment 는 heading 없음 |
| 리포트 카드 헤더 링크 | ~~이름 = *"Open 4-week report, Apr 13 – May 10"* (`aria-label`, 설명 문장은 링크 밖 `aria-describedby` 아님 — 짧게)~~ → **개정 (2026-11-21, `D8-3`)**: `aria-label` **제거** — 이름 = 링크 안 보이는 내용(제목 *4-week full report* + 설명 + 보조). 이전 이름이 보이는 제목을 포함하지 않아 WCAG 2.5.3 위반(`H8-6-N1` · `stage-8-visual-gap.md` `VG8-G-06`). 시각 · baseline 0 | `N7-37` · `D8-3` |
| 막대 | §3.4 list · 각 항목 이름 | 총합은 위 텍스트 |
| Growth themes | 행 텍스트 *"Self-Direction, strong"* · 막대 `aria-hidden` | 숫자 읽지 않음 |
| 시트 | 열림 → 제목 포커스(기존 Sheet) → RadioGroup → 닫힘 → chip 복귀 | — |
| 상세 | Back → (본문 비인터랙티브) → 클립 버튼들 → PDF 버튼 | ~~h2 ×6~~ **h2 ×4** (Growth · persona · How you talked · What you noticed) **+ 클립 1** (S7-E) · 페르소나 이름 h3 + `ol` [개정 2026-11-20 ⑭] |
| 클립 버튼 | *"Play clip: Talking about feelings"* / *"Pause clip: …"* · 불가 = `aria-disabled` + 이름 *"Clip unavailable: …"* | 상태 변화 → 행 내부 `aria-live="polite"` 1개(재생 시작·정지·오류 문구) · [개정 2026-11-20 ⑮ ⑯] live 문구 *Playing.* / *Paused.* · 진행 막대 이름 *Clip progress: {label}* + `aria-valuetext` *"{elapsed} of {total}"* |
| 체크 트렌드 행 | *"Calmer at bedtime, 3 times"* (`3×` 는 `aria-hidden`, SR 전용 *"3 times"*) | — |
| PDF | generating 문구 `role="status"` · ~~failed/timeout `InlineAlert`(role alert)~~ failed `InlineAlert`(role alert) · timeout(info)·offline `InlineAlert`(role status) [개정 ㉔] · ready 시 SR *"Your PDF is ready."* 1회 | — |
| Loading | `aria-busy` + SR *"Loading"* 1개 | 기존 |

### 9.2 대체 텍스트 · SR 문장 (숫자 0)

| 대상 | 문장 |
|---|---|
| 다이아몬드 (상세) | *"Growth themes for {firstName} in this report."* + (previous ≠ null ? *" The dashed outline shows the previous report."* : "") + (null 축 ? *" Not observed yet: {E}."* : "") — **증감·방향 판정 0**, 근거 문장은 아래 `dl` 이 시각·SR 모두 제공 |
| 리포트 진행 막대 | 이름 *"Progress toward the next report"* · `aria-valuetext` 없음 → **숫자 미낭독** 이 보장되지 않으므로 `role="progressbar"` 대신 **`aria-hidden` + 옆 footer 텍스트**로 정보 전달 권고 (`N7-05` 일관) |
| 주간 막대 | §3.4 |
| 캐릭터 | 장식 (`alt=""`) |

### 9.3 대비 `[계산]` — 카드 = white 82%/90% over `#dbeee7`·`#d3e3de`·`#c7c9d7`

| 대상 | 값 | 판정 |
|---|---|---|
| 본문 ink-700 (카드) | 6.27~6.69 | ✅ |
| 라벨 ink-600 (카드) | 4.64~4.95 | ✅ |
| 보조 ink-500 (카드) | 3.02~3.23 | 기존 `P-01` |
| ink-400 · ink-300 텍스트 | 2.20~2.35 · 1.72~1.84 | **`P-35`** — Figma 선언 텍스트(Progress `31:102` · `110:835`)에만. [개정 ㉗] **C-13 화면의 정보성 보조 텍스트는 ink-400 을 쓰지 않고 `secondary`(ink-500, `P-01`)** — 상세 `{count}×` · 클립 시간 · PDF 상태 문장 2종 |
| Moment 카드 텍스트 | 1.92~5.20 | **`P-37`** |
| 버튼 흰 라벨 on teal | 2.07 | 수용 예외 `D-01` |
| 비텍스트 | 1.25~2.63 | **`P-36`** · `P-30`(차트, 기존) · `P-38` |

### 9.4 터치 타깃

- chip hit 44 · (토글 30 → hit 44, `N7-41` ⓑ) · 클립 `IconButton` hit 44 · ListRow 56 · Button md 45 · 리포트 카드 헤더 링크 = 헤더 행 전체(≥ 44 × 345).

### 9.5 `R-SHADOW-1`

| 대상 | drop | 번짐 (좌우/위/아래) | overflow 조상 | 처리 |
|---|---|---|---|---|
| 주간 카드 · 리포트 카드 (Glass Rest 3겹) | `0 2 4 / 0 12 28 / 0 28 56` — **3겹 전부 합산** | 실측 선례 **28~32 / 22 / 77** (rules §6-1 ③) | `AppShell` 스크롤 뷰포트 — **뷰포트 전 폭** (`AppShell.tsx` 주석) | 좌우: 거터 24 < 28~32 → 393 이하에서 **화면 가장자리에서만** 4~8 클립(rule ④ — 보이지 않음), 600+ 는 컬럼 밖 여유 ≥ 60 으로 클립 0. 위 22 > 앞 블록 간격 14 → **앞 카드 위로 겹쳐 그려질 뿐 클립 아님**. 아래 77 → 다음 블록 위/탭바 래퍼 아래로 겹침(같은 스크롤 박스, 클립 0). **inset 불필요** — VG 에서 세로·가로 프로브(393·320·600) 필수 |
| StatTile · chip · ProfileCard | `--shadow-bubble` 1겹 | 4 / 0 / 10 | 같음 | 클립 0 · Figma 행 `overflow-clip` 미재현 (§3.1) |
| Moment 카드 | 없음 | — | — | — |
| 캐릭터 프레임 | 없음 (이미지 크롭용 `overflow: clip`) | — | 자기 자신 | **새 overflow 1건** — 그림자 자식 0. 근거 주석 + 프로브(캐릭터 내부 그림자 없음 확인) |
| 시트 옵션 · 과거 목록 | 기존 컴포넌트 | 기존 | 기존 | 변경 0 |
| 다이아몬드 SVG | 0 | — | — | 기존 `overflow: visible` |

새 `overflow` 선언: ~~**1** (캐릭터 크롭 — 그림자 무관)~~ **0** — 개정 2026-11-19 ②: 크롭을 에셋에 적용했으므로 위 표의 캐릭터 프레임 행(`overflow: clip`)은 **해당 없음**. `N7-41` ⓑ 채택 시 토글도 `hidden` 속성으로만(overflow 0).

---

## 10. Copy 초안 (영어 · 진단/판정/비교 0 — 최종 문구는 체크포인트 승인)

### 10.1 Progress
| 키 | 문구 |
|---|---|
| TopBar | *Progress* (기존) |
| chip 이름 (SR) | *Week: {range}. Change week* |
| StatTile | *sessions* · *together* (Figma) |
| 주간 카드 | *This week's reading* · *{n} nights* / *1 night* · * · avg {m} min* · 0 → *No storytimes yet this week.* |
| 막대 SR | *Minutes read each day this week* · *{Weekday}, {n} minutes* · *{Weekday}, no storytime* |
| Growth | *Growth themes* · *strong* / *growing* / *emerging* |
| Moment | *MOMENT OF THE WEEK* |
| 시트 | title *Choose a week* · meta *This week* |
| 과거 목록 | *PAST REPORTS* · *Show earlier reports* |

### 10.2 리포트 카드
| 키 | 문구 |
|---|---|
| 제목 | *4-week full report* |
| 발행 설명 · 보조 | *{range} · a deeper read on the four themes, with the moments behind them.* · *Covers the last four weeks of sessions.* (Figma) |
| 첫 주기 | *Your first 4-week report is on its way. It gathers the moments from your storytimes together.* · *Recorded storytimes count toward it.* |
| 생성 중 | *{range} · We're putting your report together.* · *This can take a little while.* |
| 이월 | *There weren't quite enough recorded storytimes for a full report this time, so they'll carry into the next one.* |
| 지연 | *Your report is taking a little longer than usual. We'll let you know when it's ready.* |
| footer | *Next report on {Mon D}* (Figma 에서 *· we'll email it too.* 제거 — `N7-06`, `AD7-3`) |
| 헤더 링크 SR | *Open 4-week report, {range}* |

### 10.3 리포트 상세
| 키 | 문구 |
|---|---|
| TopBar | *4-week report* |
| 섹션 | *Growth themes* · *{firstName}'s storytime persona* · *How you talked together* · *What you noticed* · *Highlight clips* |
| 범례 | *Earlier* · *This report* |
| 페르소나 | eyebrow *SINCE {MON D}* · *NOW* · 1개 *{firstName}'s persona stayed the same through this report.* · source(`N7-42`) *From your answers* · *From your storytimes* · *From your updated answers* |
| 대화 지표 | *Storytimes* · *Time together* · *Things {firstName} said* · *Back-and-forth turns* · *Feeling words* · *LATELY WE NOTICED* |
| 인용 eyebrow | *IN {FIRSTNAME}'S WORDS* |
| 피드백 | *WHAT YOU CHECKED* · *{n} times*(SR) · *TOPICS THAT CAME UP* · 빈 경우 *You didn't leave notes during this report.* |
| 클립 | *This clip is no longer available.* · *We couldn't play this clip. Tap play to try again.* · *You're offline. Tap play to try again when you're back.* · SR *Play clip: {label}* / *Pause clip: {label}* · *Clip unavailable: {label}* · [개정 2026-11-20 ⑯] live *Playing.* · *Paused.* · 진행 *Clip progress: {label}* · *{elapsed} of {total}* |
| Not ready | *This report isn't ready yet.* / *We'll let you know when it is.* · *Back to Progress* |
| Not found | *We couldn't find this report.* · *Back to Progress* |

### 10.4 PDF
| 키 | 문구 |
|---|---|
| idle | *Download PDF* (Figma) |
| generating | *Preparing your PDF. This can take up to a minute.* |
| ready | *Save PDF* · *Share* · SR *Your PDF is ready.* |
| share 불가 | *Sharing isn't available here. Save the PDF instead.* |
| 공유 시트 제목 (`navigator.share` `title`) | *HARU 4-week report* [개정 ㉖, `VG7-F-06` ⓐ] |
| failed | *We couldn't prepare the PDF.* / *Please try again.* · *Try again* |
| timeout | *Your PDF is taking longer than usual.* / *Try again in a little while.* |
| offline | *You're offline.* / *Try again when you're back online.* |

### 10.5 금칙어 점검 `[계산]`
초안 전부에서 `diagnos` · `score` · `rating` · `level` · `grade` · `assess` · `weak` · `low` · `high` · `below` · `behind` · `average` · `normal` · `better` · `worse` · `peers` · `vs` · `% of` · ` of 7` · `streak` · `improve` · `decline` · 느낌표 · 이모지 **0건**. 예외(승인됨): *strong* (`D7-2` ③ 단계 라벨) · *avg* (`D7-2` ② Figma 문구 유지분 — "average" 판정어가 아니라 세션 길이 관찰). *Error*·*fail* 단어 0 (*couldn't* 로 서술).

---

## 11. PRD ↔ Figma · 허용 차이 후보

### 11.1 `D7-2` 적용 결과 — 허용 차이 후보 (**등록은 사용자 승인 후**, CLAUDE.md 최우선 규칙 6)

| ID | Figma | 구현 | 근거 |
|---|---|---|---|
| `AD7-1` | `163:2558` *"+18% vs last week"* | 미렌더 | `D7-2` ① |
| `AD7-2` | `163:2560` *"6 of 7 nights · avg 12 min"* | *"6 nights · avg 12 min"* | `D7-2` ② |
| `AD7-3` | `110:861` *"… · we'll email it too."* | 제거 | `N7-06` (`D7-4`) |
| `AD7-4` | `110:853` 진행 값 span | 미렌더 | `N7-05` (`D7-4`) |
| `AD7-5` | `163:2642` 프레임 gradient fill | 미렌더 | `N7-30` (승인 필요) |
| `AD7-6` | 막대 16m·20m 동일 높이 | 비례 높이 (20m 만 트랙 전체) | `N7-29` (승인 필요) |
| `AD7-7` | 텍스트 10 · 10.5 · 11.5 · 12.5 · 13(4행) | 11 · 11 · 11 · 12 · 12 | `N7-31` (승인 필요) |
| `AD7-8` | `#6f8c88` eyebrow | ink-500 | `N7-32` (승인 필요) |
| `AD7-9` | 버튼 h50 · 라벨 15 | `Button md` 45 · 라벨 17 | `N7-33` (승인 필요) |
| `AD7-10` | StatTile radius 20 · 카드 radius 24 · 아이콘 타일 14 | 22 · 22 · 12 | 확정 흡수 규칙 / `T7-8` |
| `AD7-11` | StatTile 행 `overflow-clip` (그림자 아래 잘림) | 클립 없음 | `R-SHADOW-1` ① |
| `AD7-12` | 주간 카드 토글 chevron | `N7-41` 결과 | 승인 필요 |
| `AD7-13` | Figma 수치 placeholder `31:102` 5/62m vs `110:522` 6/72m (`M-10`) | 서버 값 | 시각 비교는 같은 수치 fixture 로 (§13) |

### 11.2 PRD 수정 대상 후보 (Plan §15.4 에 추가 없음 — S7-1~4 로 충분)

---

## 12. Figma 누락 / 불일치 / 승인 필요 항목

### 12.1 Plan 과의 대조 — 정정·보완 `M7-##` (Plan 은 고치지 않는다 — plan-agent 보고)

| # | Plan | 실측·확인 | 영향 |
|---|---|---|---|
| **M7-1** | §0.1 · `R7-09`: 변수 바인딩 0 은 `110:522`(HTML import)만 | **`31:102` 안의 `163:2551` "This week's reading" 카드도 HTML import 형식**(layer `div`/`span`, 텍스트·막대 전부 raw HEX) — `31:102` 의 변수는 제목·StatTile·Growth·Moment 일부 텍스트와 fill 4색뿐 | §0.3 흡수표를 두 카드에 공통 적용 |
| **M7-2** | AC-7-24 "주간 카드 접기 chevron 동작(펼침/접힘)" | 토글 `163:2561` 이 **무엇을 펼치는지 Figma 에 없다**. `110:522` 의 같은 카드(`110:557`)가 달력·주별 분·통계로 **확장된 형태**라 chevron = "확장 보기" 로 읽힌다 → 그 내용은 `D7-1` 로 미채택 → **토글의 목적지가 사라졌다** | `N7-41` |
| **M7-3** | AC-7-22 "최대값 강조 규칙 = Spec" | Figma 막대는 **4.36 px/min 선형 + 트랙 상한 63.5 클립** — 16m·20m 이 같은 높이로 잘렸고 강조도 **2개**. "최대값 1개 강조" 가정과 다르다 | `N7-29` |
| **M7-4** | AC-7-43 "checkTrends 칩 라벨 = Stage 5 회고 칩 copy 재사용" | copy 가 `features/reflection/copy.ts` 에 있어 `features/report-detail` 이 import 하면 **feature 간 import 위반**(`architecture.md` §3) | `entities/reflection` 이동 (`N7-43`) — `S7-D` 선행 작업 |
| **M7-5** | C7-4 `personaHistory[].trigger` | **타입 미정의** | Stage 6 스냅샷 `source` enum(`onboarding_survey`·`survey_update`·`session_analysis`) 재사용 권고 (`N7-42`) — plan-agent `API_CONTRACTS` Rev 11 반영 |
| **M7-6** | §2 · AC-7-30 카드 상태 5종(진행 중 · 생성 중 · 이월 · 지연 · 발행) 을 **배타 상태**로 기술 | Figma `110:835` 는 **발행 리포트 + 다음 주기 진행 막대 + Next report on** 을 한 카드에 같이 담는다 → 카드 = `latestReport` × `currentCycle.status` **조합** | §2.2 분기표 (`N7-36`) |
| **M7-7** | AC-7-33 "published 카드 탭 → 상세" | Figma 카드에 **"열기" 어포던스가 없다** (버튼은 Download PDF 하나). 카드 전체를 링크로 만들면 안쪽 PDF 버튼과 **중첩 인터랙티브** | `N7-37` |
| M7-8 | §0.1 캐릭터 = 일러스트 | 프레임 `163:2642` 에 **gradient fill 선언** + 이미지 크롭(146% / −15.8%) | `N7-30` · §2.1.1 |
| M7-9 | §0.1 StatTile 167.5×73 | 행 `163:2544` 이 **`overflow-clip`** — Figma 에서도 타일 그림자가 잘린다 | §3.1 미재현 (`AD7-11`) |
| M7-10 | (언급 없음) Moment eyebrow `#6f8c88` | 팔레트 밖 raw HEX | `N7-32` |
| M7-11 | AC-7-31 진행도 `ProgressBar(110:851)` · "valueText" | `ProgressBar` 는 `role="progressbar"` + `aria-valuenow` 를 내므로 SR 이 **퍼센트를 읽는다** → `N7-05`(숫자 미노출)과 충돌 | §9.2 — 막대 `aria-hidden` + footer 텍스트 |
| M7-12 | §5.3 ready → (save \| share) | ready 도달 시점의 **자동 저장 여부** 미정 | `N7-40` |

### 12.2 **사용자 결정 필요** — `N7-29`~ (전부 권고안 있음)

| ID | 질문 | 선택지 | 권고 | 차단 |
|---|---|---|---|---|
| **`N7-29`** | 주간 막대 높이·강조 (`M7-3`) | ⓐ **비례 높이(최대 = 트랙) + 강조 `≥ 0.75×max`** (Figma fixture 강조 2개 재현) ⓑ 비례 + 최대 1개만 강조 ⓒ Figma 처럼 선형 px/min + 상한 클립 | **ⓐ** — 강조 개수가 Figma 와 같고 높이는 데이터에 정직. 0.75 는 가값 `P-40` | ⛔ `S7-B` |
| **`N7-30`** | 캐릭터 프레임 gradient fill | ⓐ **미렌더** (투명 PNG 그대로) ⓑ 렌더 | **ⓐ** — 뷰포트 기준 배경과 어긋나 사각 경계가 보인다 (`AD7-5`) | `S7-C` |
| **`N7-31`** | 11 미만·비표준 텍스트 크기 | ⓐ **10 · 10.5 · 11.5 → 11, 12.5 · 13(4행) → 12** ⓑ Figma 값 그대로 component 토큰 | **ⓐ** — 기존 흡수 규칙(11.5→11 · 12.5→12) 연장 + 11 미만 텍스트 금지(가독성) | `S7-B`·`C` |
| `N7-32` | Moment eyebrow `#6f8c88` | ⓐ **ink-500 흡수** ⓑ 신규 primitive | **ⓐ** (최근접, 신규 HEX 0) | `S7-C` |
| **`N7-33`** | `110:854` 버튼 (h50 · 15) | ⓐ **`Button md`(45)** ⓑ `Button lg`(56) ⓒ 신규 size 50 | **ⓐ** — 최근접·기존 컴포넌트, 카드 안 보조 CTA 위계 | `S7-F` |
| `N7-34` | 카드 상태별 문구·구성 (§2.2 표) | 표대로 | 승인 요청 (C-13) | ⛔ `S7-C` |
| `N7-35` | 생성 중·이월·지연 상태에서 **이전 발행 리포트**를 카드에 남기는가 | ⓐ **남기지 않음** — 카드 = 현재 주기, 이전 리포트는 과거 목록(이때는 `reportCount ≥ 1` 이면 목록 표시로 조건 완화) ⓑ 이전 리포트 링크·PDF 유지 + 상태 문구 병기 | **ⓐ** — 한 카드가 두 리포트를 가리키면 PDF 대상이 모호. ⚠️ ⓐ 채택 시 §2.4 표시 조건을 "`latestReport` 가 카드에 없으면 `reportCount ≥ 1`" 로 바꾼다 | `S7-C` |
| **`N7-36`** | 발행 카드의 막대 의미 (`M7-6`) | ⓐ **다음 주기 `progressRatio`** (footer *Next report on* 과 짝) ⓑ 항상 100% ⓒ 발행 상태에서 숨김 | **ⓐ** — Figma 구성(막대 + Next report on) 유지 · 100% 고정은 정보 0 | ⛔ `S7-C` |
| **`N7-37`** | 카드 → 상세 진입 (`M7-7`) | ⓐ **헤더 행(아이콘 + 텍스트)을 링크** — 시각 추가 0, pressed/focus 만 ⓑ 헤더 오른쪽 `chevron-right` 추가(새 요소) ⓒ "Open report" 버튼 추가 | **ⓐ** — Figma 요소를 늘리지 않고 중첩 인터랙티브 회피. 발견성은 디자이너 확인(Q7-16) | ⛔ `S7-C` |
| `N7-38` | 과거 리포트 목록 (§2.4) | 카드 아래 ListGroup · 최신 제외 · 미열람 표시 0 · 더 보기 TextLink | 승인 요청 (C-13, `N7-11` 구체화) | `S7-C` |
| `N7-39` | 다이아몬드 SR summary (§9.2) | 방향 판정 문장 0 · 근거는 `dl` | 승인 요청 | `S7-D` |
| **`N7-40`** | PDF ready 이후 (`M7-12`) | ⓐ **자동 저장 0 — Save · Share 버튼 노출** ⓑ ready 시 자동 저장 시도 | **ⓐ** — 비동기 후 자동 다운로드는 iOS 차단 가능 · 공유와 제스처 규칙 일치 (`R7-04`) | ⛔ `S7-F` |
| **`N7-41`** | 주간 카드 chevron 토글 (`M7-2`) | ⓐ **제거** (허용 차이 — 목적지 없음) ⓑ 유지 + 막대 영역 접기(`aria-expanded`, 기본 펼침) ⓒ 유지 + 비인터랙티브 | **ⓐ** — 접기는 Figma·PRD 어디에도 없는 동작을 새로 정의하는 것, ⓒ 는 거짓 어포던스. ⓑ 를 고르면 AC-7-24 유지 | ⛔ `S7-C` (AC-7-24 개정) |
| `N7-42` | 페르소나 히스토리 trigger 문구 (`M7-5`) | source enum 재사용 · 3문구 (§10.3) | 승인 요청 | `S7-A`·`D` |
| `N7-43` | 회고 체크 copy 이동 (`M7-4`) | `entities/reflection` 로 이동 (Stage 5 화면 동작·baseline 불변) | 승인 요청 | `S7-D` |
| `N7-44` | 페르소나 타임라인 형태 (§2.3.2) | ⓐ **오래된 것 → 현재, rail + PersonaCard 전부** ⓑ 현재만 크게 + 이전은 접힌 목록 | **ⓐ** — 서버 순서 그대로 · "변화" 서술에 맞음 | `S7-D` |
| `N7-45` | 대화 지표 표현 (§2.3.3) | ⓐ **라벨↔값 dl 5행** (`163:2610` recipe) ⓑ StatTile 그리드 | **ⓐ** — 5개 타일은 Progress 와 위계가 섞이고 행 recipe 가 Figma 근거 | `S7-D` |
| `N7-46` | 클립 플레이어 (§2.5) | `IconButton` + `ProgressBar sm` + 시간 · seek 없음 · 불가 상태 버튼 비활성 | 승인 요청 (C-13) | `S7-E` |
| `N7-47` | 주 선택 시트 (§2.7) | `Sheet` + `RadioGroup card` · 선택 즉시 닫힘 · 주 1개 = 정적 라벨 | 승인 요청 (C-13, `N7-25` 구체화) | `S7-C` |
| `N7-48` | 이번 주 0 빈 상태 (§2.8) | 레이아웃 유지 + 0 표기 + Moment 미렌더 | 승인 요청 (C-13) | `S7-C` |
| `N7-49` | 상세 Not ready / Not found (§2.9) | `EmptyState` / `ErrorState` + *Back to Progress* | 승인 요청 (C-13) | `S7-D` |
| `N7-50` | growth-theme 색 세트(`T7-1`) 이름 | `--color-growth-theme-*` (capability 세트와 분리) | 승인 요청 (`N7-10` 구현 형태) | `S7-B` |
| `C13-S7-1`~`9` | §2 화면별 명세 · §10 copy | 승인 요청 | ⛔ 전부 |

### 12.3 디자이너 요청서 `Q7-##` (병행 — `D7-3`)

| Q | 요청 | 관련 |
|---|---|---|
| Q7-1 | 리포트 상세 프레임 — 섹션 7개 · 다이아몬드 이전/현재 오버레이 시각(선 스타일·범례) | `C13-S7-1` · `P-38` |
| Q7-2 | 4주 리포트 카드 — 첫 주기 · 생성 중 · 이월 · 지연 4상태 | `C13-S7-2` |
| Q7-3 | 하이라이트 클립 플레이어 — 재생/일시정지/로딩/불가/오류 | `C13-S7-3` |
| Q7-4 | PDF 상태 — 생성 중 · 준비됨(저장/공유) · 실패 · 지연 | `C13-S7-4` |
| Q7-5 | 과거 리포트 목록 | `C13-S7-5` |
| Q7-6 | 주 선택 시트 (chip `31:118` 탭 결과) | `C13-S7-6` |
| Q7-7 | 페르소나 히스토리 타임라인 | `C13-S7-7` |
| Q7-8 | Progress 빈 상태 (이번 주 0 · 첫 가입) | `C13-S7-8` |
| Q7-9 | Loading · Error · Offline · Not found 시각 (현재 공통 컴포넌트) | `C13-S7-9` |
| Q7-10 | Growth themes 막대 색(teal/pink/blue/violet-67) ↔ 역량 Tag·차트 색(#19 green/pink/cyan/purple) — **한 앱에 역량 색 2벌** 유지할지 | `N7-10` · `T7-1` |
| Q7-11 | 주간 카드 chevron 이 여는 것은 무엇인가 (`110:522` 확장안 미채택 후) | `N7-41` |
| Q7-12 | `31:102`(5/62m) ↔ `110:522`(6/72m) placeholder 수치 통일 | `M-10` · `AD7-13` |
| Q7-13 | 막대 강조 규칙 · 16m/20m 동일 높이 의도 | `N7-29` · `P-40` |
| Q7-14 | 10 · 10.5 · 12.5 · 13 텍스트 크기 의도 | `N7-31` |
| Q7-15 | ink-400 · ink-300 텍스트 대비 · Moment 카드(반투명) 대비 | `P-35` · `P-37` |
| Q7-16 | 4주 리포트 카드에서 상세로 가는 어포던스 | `N7-37` |
| Q7-17 | 캐릭터 프레임 gradient fill 의도 · 480 컬럼에서 캐릭터 최대 크기 | `N7-30` · §8.1 |

→ 승인 후 `docs/design/stage-7-designer-request.md` 로 분리 작성 가능 (지금은 이 표가 초안).

---

## 13. Visual Gap 검토 계획 (최우선 규칙 5)

| 단위 | 비교 | 방법 |
|---|---|---|
| `S7-C` Progress (Figma 有) | `31:102` ↔ 구현 393×852 — **같은 수치 fixture**(5 · 62m · 8/13/—/16/11/20/4 · strong/growing/emerging/emerging · Emma 인용) 로 나란히. 허용 차이 `AD7-1`~`13` 지점만 다를 것 | element screenshot (dev 패널 숨김 · settle — `R-BASELINE-1`) + Figma `get_screenshot` |
| 〃 computed | 주간·리포트 카드 `box-shadow = --shadow-glass-rest` · bg `--color-surface-card` · `backdrop-filter blur(12px)` · radius 22 · StatTile/ProfileCard/chip `--shadow-bubble` · 블록 간격 14 · 막대 폭 16 / 영역 110 · Moment border 1px | `getComputedStyle` (`R-FIGMA-1` ④ — Tailwind 유틸리티 포함 computed 로) |
| 〃 캐릭터 | 393 에서 프레임 347×422 @ top 14 · 겹침 146 · trailing overhang 2 · 이미지 크롭 | `getBoundingClientRect` |
| 〃 그림자 | Glass Rest 카드 **세로·가로 프로브** 320 / 393 / 600 — 393 이하 좌우 클립이 화면 가장자리에만 있는지, 600 에서 0 인지 | `R-SHADOW-1` ⑥ (`e2e/shadow.spec.ts` 확장) |
| `S7-B` | `BarChart` 높이 비례 · 강조 규칙 · 스텁 · `StatTile` · `DiamondChart.previous` (미지정 시 Stage 6 baseline diff 0) | 단위(높이 계산) + gallery screenshot |
| `S7-C`·`D`·`E`·`F` (C-13) | 이 Spec 대비 — 카드 상태 5 · 시트 · 과거 목록 · 상세 섹션 · 플레이어 상태 6 · PDF 상태 7 | 상태별 screenshot |
| 회귀 | Stage 6 프로필(`PersonaCard` 확장 · `DiamondChart`) · Stage 5 회고(copy 이동) · Home/Library `WeekSummaryChip` | baseline diff 0 (`--update-snapshots=all` + 원인 분해 — `R-BASELINE-1` 3-1·5) |
| 대비 | Moment 카드 실제 배경 픽셀 · ink-400 텍스트 | 픽셀 샘플 + WCAG 식 → `P-35`·`P-37` 수치 갱신 |

---

## 14. development-agent Handoff (승인 후에만)

| 단위 | 이 Spec 에서 가져갈 것 | 주의 |
|---|---|---|
| **`S7-A`** Contracts + Mock | §7 시나리오 ↔ 화면 상태 · `M7-5`(trigger enum) · fixture 수치 = **Figma 와 같은 값 1세트**(§13 시각 비교용) · 이름 40자 · persona 220자 · summaryLine 긴 문장 1개 · `availableWeeks` 달 넘김/연 넘김 1개씩 | fixture 에 `vs` · `of 7` · `%` · `streak` 0 |
| **`S7-B`** Shared UI | §3.1 `StatTile` · §3.4 `BarChart` · §3.7 `DiamondChart.previous` · `Surface fill="card"` · `ProgressBar` 색 override · `ListRow.subtitle` · `T7-1`~`15` · 가값 `P-35`~`40` 주석 · gallery | `packages/ui` 는 분·요일·역량 enum 모름. `previous` 미지정 시 DOM 불변(회귀 테스트) |
| **`S7-C`** Progress | §2.1 · §2.1.1 · §2.2 · §2.4 · §2.7 · §2.8 · §2.9 · §3.2 · §3.3 · §3.5 · §3.6 · §10.1·10.2 | 카드 분기표 단위 테스트(`M7-6`) · 진행 막대 숫자 미낭독(`M7-11`) · `N7-41` 결과 반영 · 캐릭터 overflow 근거 주석 |
| **`S7-D`** 상세 | §2.3 전체 · `N7-43` copy 이동 먼저 · §3.8 · §9.2 · §10.3 | viewed 1회 · 섹션 순서 · 숫자 0 |
| **`S7-E`** 클립 | §2.5 · §9.1 클립 이름·live | seek 0 · 불가 상태 재시도 버튼 0 |
| **`S7-F`** PDF | §2.6 · §10.4 · `N7-40` | 탭 핸들러 안 `await` 선행 금지(`R7-04`) · 두 진입점 같은 query key |

구현 메모:
1. 가값 토큰에는 `provisional: P-3x` 주석 (frontend §6).
2. 새 `overflow` 는 캐릭터 크롭 1건만 — 근거 주석 + 프로브.
3. 막대·다이아몬드 첫 그리기 모션은 reduced-motion 에서 즉시 (테스트).
4. 콘솔·devWarn 에 이름·인용·클립 URL·PDF 파일명 0.
5. `T7-*` · `N7-29`~`50` · `AD7-*` 는 **승인 후** 적용. 승인 전 임의 값 금지.
