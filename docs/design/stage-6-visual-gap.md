# Stage 6 Visual Gap Review

Author: design-agent (2026-11-15). ⛔ Production Code · Figma 수정 없음. 이 문서는 **판정 제안**이며, 허용 차이 등록은 사용자 승인 이후에만 한다 (CLAUDE.md 최우선 규칙 6).

판정 기준 (`D6-8`): **승인된 `docs/design/stage-6-design-spec.md` 가 구현 기준**이다. Figma DRAFT `317:1358` (`docs/design/stage-6-figma-draft.md`)는 참고이며, **Spec 이 말하지 않는 지점에서만** DRAFT ↔ 구현 차이를 기록한다.

Verdict: `FIX (dev)` = development-agent 수정 · `USER_APPROVAL` = 사용자 결정 필요 · `OK` = Spec 과 일치(또는 Spec 범위 밖 비시각 항목).

---

## S6-E1

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[bl]` | 구현 baseline PNG 육안 + 크롭 3배 확대 (python PIL) — **Playwright 실행 안 함** (병행 실행 금지) | `e2e/__screenshots__/darwin/profile-result.spec.ts/` 8장 (main 클립 345 폭 = 393 − 2×24, 320 은 272 폭) |
| `[code]` | 저장소 직독 | `packages/ui/src/chart/DiamondChart.{tsx,css}` · `packages/ui/src/surface/Surface.{tsx,css}` · `packages/design-tokens/src/{component/index.css, semantic/color.css, semantic/shadow.css}` · `apps/web/src/entities/child-profile/*` · `apps/web/src/features/child-profile-view/*` · `apps/web/src/pages/settings/Profile*.tsx` |
| `[var]` | `get_variable_defs 163:2607` — **선언값** | `glass-fill-strong #ffffffe5` · `HARU/Shadow Rest` = drop 3겹 + inset 2겹 (Style 정의) |
| `[bound]` | `get_metadata 163:2607`(노드 345×215) ↔ `get_screenshot 163:2607`(렌더 **353×225**) | 렌더 바운드 역산: 좌우 ±4 · 아래 +10 → **drop 1겹 `0 6 4`** (3겹이면 좌우 ≥ 28). Spec §0.3 · `--shadow-bubble` 선택이 맞음을 재확인 (`R-FIGMA-1` ②) |
| `[draft]` | `get_screenshot` | DRAFT `319:1374`(변형 A) · `319:1714`(변형 C) · `319:2115`(Error) — Spec 침묵 지점 비교용 |

### 1. Gap 표

| ID | 화면 | Spec ref | Expected | Actual | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|---|
| `VG6-E1-01` | 프로필 온보딩 A (393 · 320) | §3.1 기하 · §11.1 | 다이아몬드 대각선 393 → 173 · 320 → 100 · ≥600 → 200, 1.0 = 20% 반지름, 눈금 링·숫자 0 | 393 다이아몬드 ≈ 170~173 px · 320 ≈ 100 px · 눈금 링 0 · 숫자 0. 크기 식이 CSS grid 가운데 트랙 `min(2·radius-max, 100% − 2·(label-max + gap))` = Spec 식과 동일 | `[bl]` `s6-profile-onboarding` · `-320` · `[code]` `DiamondChart.css` grid | — | OK |
| `VG6-E1-02` | 변형 B (CF null) | §3.1 데이터 면 규칙 · null 축 | 이웃 두 축 값 있는 사분면만 채움 · 열린 변 외곽선 0 · null 축선 점선 `3 4` · 꼭짓점 0 · 라벨 아래 *Not seen yet* (caption-2, 라벨과 같은 색) | 위 두 사분면만 채움 · 수평 열린 변에 teal 선 **없음**(3배 확대 확인) · 아래 축선 점선 · CF 꼭짓점 0 · 캡션 1줄 · 색 = 컨테이너 상속 ink-600 (회색 비활성 0) | `[bl]` `-partial` 확대 · `[code]` `.haru-diamond__axis--missing` · caption-2 `tone` 기본 `inherit` | — | OK |
| `VG6-E1-03` | 변형 C (4축 null) — 차트 카드 캡션 | §2.1 트리 "caption" · §3.1 변형 C (정렬·텍스트 스타일 **언급 없음**) | Spec: 문구 *We'll draw this together as you read.* 만 정의. DRAFT `319:1714`: 카드 안 **왼쪽 정렬** | 구현: `Text footnote primary` **가운데 정렬** (handoff H6-2.4 #8) | `[bl]` `-empty` · `[draft]` `319:1714` | Low | USER_APPROVAL — 가운데(구현) / 왼쪽(DRAFT) 택1 |
| `VG6-E1-04` | 변형 C — 면·꼭짓점 | §3.1 변형 C | 면 0 · 꼭짓점 0 · 격자(외곽 실선 + 축선 점선)·라벨만 | 일치. 4축 라벨 모두 *Not seen yet* 2번째 줄 | `[bl]` `-empty` | — | OK |
| `VG6-E1-05` | ProfileCard ×3 | §3.4 · `T6-9` · §9.5 | `Surface fill=strong · radius=surface(22) · padding=4(16) · material=bubble(--shadow-bubble)` · 내부 gap 12 · 제목 subheadline bold h2 | 일치. `.haru-surface--material-bubble { box-shadow: var(--shadow-bubble) }` (새 값 0). Figma `163:2607` 렌더 바운드가 drop 1겹을 확인 | `[code]` `ProfileCard.tsx` · `Surface.css` · `[var]` · `[bound]` 353×225 | — | OK |
| `VG6-E1-06` | 토큰 `T6-1`~`T6-8` · 가값 | §5.2 · §5.3 | radius-max 100 · label-max 64 · label-gap = space-1-5 · stroke 2 · dash `3 4` · vertex 10 · ring 18 · area-fill teal 30% · area-stroke teal · grid = border-subtle · `provisional: P-30~33` 주석 | 값·이름·Tier 일치, 가값 주석 4종 있음. 신규 HEX 0. Tier 2 위치(`@theme static`, H6-2.4 #5)는 값 변화 0 | `[code]` `component/index.css` L551-563 · `semantic/color.css` L258-268 | — | OK |
| `VG6-E1-07` | 축 라벨 | §3.1 축 라벨 · `T6-2` | caption-1 semibold `--color-action-secondary-fg` · 위/아래 1줄 가운데 · 왼쪽 끝 정렬 · 오른쪽 시작 정렬 · 최대 64 · 2줄 허용 · 말줄임 0 | 일치. `Emotion / Regulation` · `Intrinsic / Motivation` 2줄, 3줄 접힘 0 (393 · 320). `T6-2` 실제 단어 폭은 **이 검토에서 실측하지 않았다**(Playwright 금지) — e2e 는 ≤ 64 만 단정 → 정확 폭은 QA 실측으로 이관 | `[bl]` · `[code]` `.haru-diamond__label--left/right` | — | OK (실측 QA 이관) |
| `VG6-E1-08` | 꼭짓점 · 면 색 | §3.1 · #19 | 꼭짓점 역량색 `--color-capability-{tone}-chart` + 흰 테두리 2 · 축 순서 위 SD → 오른 ER → 아래 CF → 왼 IM (`N6-28`) | 일치. Tag 색과 꼭짓점 색이 같은 출처(`CAPABILITY_TONE`) | `[bl]` · `[code]` | — | OK |
| `VG6-E1-09` | 강점 · growing edge 카드 | §3.5 · §2.1 트리 | `Tag size=sm` 역량 tone · 두 묶음 동일 컴포넌트·간격 · SectionLabel(caption-1 secondary semibold) · Divider 1px `--color-divider` · 빈 배열 = footnote primary 문장 · SR 전용 h2 | 일치. SectionLabel = `ChildInfoStep` recipe 와 동일(letter-spacing 0 — 기존 구현과 같음). 묶음 라벨 `h3`(H6-2.4 #7) 은 Spec 이 레벨을 말하지 않음 · h1→h2→h3 위계 정상 | `[bl]` A·B·C · `[code]` `CapabilityTagList.tsx` | — | OK |
| `VG6-E1-10` | PersonaCard · fallback | §3.3 | eyebrow SectionLabel → h2 title-3 bold → subheadline primary · 말줄임 0 · 일러스트 0 · isFallback 구분 0 | 일치. fallback baseline 이 일반과 같은 구조 | `[bl]` `-fallback` · `-revisit-updated` | — | OK |
| `VG6-E1-11` | 온보딩 헤더 · CTA | §2.1 · §2.0 | header pt `--space-6` · h1 title-3 bold primary · 안내 subheadline **primary**(Q2) · 섹션 간격 20 · CTA accent lg 흐름 배치 `mt-auto pt-8` | 일치. baseline 의 CTA 위 큰 빈 공간은 **촬영 뷰포트 높이 1200** 때문 (852 에서는 콘텐츠 ≈ 900 이라 생기지 않음, handoff H6-2.7) | `[bl]` · `[code]` `ProfileResultView.tsx` | — | OK |
| `VG6-E1-12` | 온보딩 헤더 h1 ↔ 안내 간격 | §2.1 (간격 **언급 없음**) | DRAFT `319:1374`: h1 ↔ 안내 간격이 구현보다 넓다 (육안 ≈ 2배 — DRAFT 는 `243:1156`/`1157` 복제 텍스트) | 구현 `gap-2` (8) | `[bl]` ↔ `[draft]` 육안 비교 (수치 실측 아님) | Low | USER_APPROVAL — 8 유지 / DRAFT 쪽 간격(토큰으로 지정) 택1 |
| `VG6-E1-13` | 재방문 모드 | §2.2 · §9.1 | TopBar centered *Profile* (h1) + Back · CTA·링크 0 · 차트 카드 제목 *Where {firstName} is right now* · UpdateNote(`profileUpdatedAt` non-null) | TopBar·Back·CTA 0·제목 일치. **UpdateNote 없음** — Plan 상 `S6-E2` 소유(H6-2.4 #3). 생략이 아니라 작업 단위 순서 | `[bl]` `-revisit` · `-revisit-updated` · `[code]` `ProfileTopBar.tsx` | — | OK — 단 `S6-E2` 미완료 시 Stage QA 에서 Spec §2.2 누락으로 재판정 |
| `VG6-E1-14` | Error (온보딩) | §2.7 · `N6-37` | `ErrorState` + *Try again* + `TextLink` *Continue to Home* (TextLink 정렬 **언급 없음**) | 구성 일치. TextLink **가운데 정렬**, DRAFT `319:2115` 는 **왼쪽 정렬** | `[bl]` `-error` · `[draft]` `319:2115` | Low | USER_APPROVAL — 가운데(구현) / 왼쪽(DRAFT) 택1 |
| `VG6-E1-15` | Error — ErrorState 그림자 (`R-SHADOW-1`) | §9.5 (**ErrorState 를 표에서 빠뜨림 — design-agent Spec 누락**) | `R-SHADOW-1` ③⑥: overflow 박스 안 그림자는 번짐 합산 + 세로·가로 프로브 | `ErrorState` = `Surface material` 기본 `rest` = `--shadow-glass-rest` 3겹 (3번째 `0 28px 56px` → 좌우 번짐 실측 선례 28~32) > 거터 24. 부모 = `AppShell` 스크롤 뷰포트(`overflow-y: auto` → x 강제). 393 에서는 클립 선이 화면 가장자리라 안 보일 수 있으나 **600 / 1024(앱 컬럼 480)에서는 클립 선이 화면 안**일 수 있다. baseline 이 main 클립이라 확인 불가 · 프로브 없음 | `[code]` `ErrorState.tsx` L50 · `Surface.tsx` L56 · `shadow.css` L17-21 · `[bl]` 클립 영역 밖 | Medium | FIX (dev) — `/onboarding/profile?scenario=children:error` 에서 393·600 가로·세로 픽셀 프로브 추가. 클립 선이 보이면 `R-SHADOW-1` ② inset 적용(또는 대안 제안 후 승인) |
| `VG6-E1-16` | Loading | §3.6 | header text 2 → 카드1 차트 높이 block → 카드2 text 2 → 카드3 text 3 · `aria-busy` + SR *Loading* | 코드 구성 일치(재방문은 header 가 없어 header 줄 생략 — 화면 구조와 일치). Skeleton `shape="rect"` 는 Spec 의 "block" 에 해당하는 기존 이름. **시각 baseline 없음**(Mock 지연, `R-BASELINE-1` ①) | `[code]` `ProfileSkeleton` · `child-profile-view.css` | — | OK (시각 미검증 — QA 이관) |

### 2. Handoff H6-2.4 deviation 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| 1 | `Next` → `/onboarding/growth-capability` 미등록(현재 `:step` 위저드가 child-info 로 보냄) | OK (잠정) | 시각 아님. `S6-E2` route 등록으로 해소 — E2 완료 전 Stage QA PASS 불가 조건으로 추적 |
| 2 | R-7 을 E1 에서 수행 | OK | Orchestrator 지시 · `s2-onboarding-saved` 픽셀 변화 0 |
| 3 | UpdateNote 미구현 | OK (E2 소유) | `VG6-E1-13` |
| 4 | 차트 크기 = CSS grid, JS 측정 0 | OK | Spec §3.1 식과 동일, 실측 100/173/200 = §11.1 |
| 5 | `T6-4`~`6` 을 `@theme static` 블록에 둠 | OK | 이름·값 변화 0, computed 정상 |
| 6 | 미관찰 캡션 `white-space: nowrap` | OK | Spec "라벨 아래 2번째 줄" = 한 줄 캡션을 구현 |
| 7 | 묶음 SectionLabel = `h3` | OK | Spec 침묵 · heading 위계 정상 |
| 8 | 변형 C 캡션 가운데 정렬 · 차트 카드 제목 subheadline bold h2 | 제목 OK (Spec §3.4 명시) · 캡션 정렬 **USER_APPROVAL** | `VG6-E1-03` |
| 9 | `CAPABILITY_TONE` export | OK | 코드 구조, 값 변화 0 |
| 10 | axe 미사용 | 시각 판정 대상 아님 | QA 판정 사항 |

### 3. 집계

- `FIX (dev)` **1** — `VG6-E1-15`
- `USER_APPROVAL` **3** — `VG6-E1-03` · `VG6-E1-12` · `VG6-E1-14` (전부 Spec 침묵 지점의 DRAFT ↔ 구현 정렬·간격 차이, Low)
- `OK` **12** (그중 QA 이관 실측 2: `VG6-E1-07` `T6-2` 라벨 폭 · `VG6-E1-16` Loading 시각)

### 4. design-agent 자기 정정

- Spec §9.5 `R-SHADOW-1` 표가 `ErrorState`(Glass Rest 3겹)를 빠뜨렸다 → `VG6-E1-15`. 같은 누락이 발전 역량 화면(`S6-E2`)·아이 정보 초기값 Error(`S6-B`)·재응답 조회 Error(`S6-C`)에도 걸린다 — 각 단위 VG 에서 같은 프로브를 요구한다.

---

## S6-E2

Author: design-agent (2026-11-15). ⛔ Production Code · Figma 수정 없음 · **Playwright 실행 안 함**(병행 실행 중). 판정 제안이며 허용 차이 등록은 사용자 승인 이후다.

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[bl]` | baseline PNG 육안 + python PIL 픽셀 샘플 (393×1200 · `main` 클립 345 폭) | `growth-capability.spec.ts/` 4장 · `profile-result.spec.ts/s6-profile-revisit-updated` |
| `[px]` | PIL 로 행 배경·글자 최암 픽셀 추출 → WCAG 대비 계산 | 선택 행 배경 · 비활성 사유 caption · *You can change…* · UpdateNote 아이콘/글자 x 좌표 |
| `[code]` | 저장소 직독 | `features/growth-capability/{GrowthCapabilityPicker.tsx, growth-capability.css, copy.ts}` · `packages/ui/src/field/RadioGroup.{tsx,css}` · `packages/ui/src/button/Button.css` · `packages/ui/src/feedback/ErrorState.tsx` · `features/child-profile-view/ui/ProfileResultView.tsx` · `e2e/growth-capability.spec.ts` · `e2e/support/gallery.ts settle()` · tokens `primitive/color.css` · `semantic/{color,motion}.css` |
| `[draft]` | `get_screenshot 320:1439` (DRAFT 온보딩 default) — **Spec 침묵 지점 비교용만** (`D6-8`) | |

### 1. Gap 표

| ID | 화면 | Spec ref | Expected | Actual | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|---|
| `VG6-E2-01` | 발전 역량 온보딩 — 구조 | §2.3 트리 · §2.0 | h1 title-3 bold → 제안 문구 subheadline primary → ProfileCard(제목 없음, 차트 selectable) → RadioGroup card(legend 숨김, 축 순서 `N6-28`) → 선택 설명 → *You can change…* footnote → CTA accent lg 흐름 배치 | 일치. 섹션 gap 20 · `pt-6` · CTA `mt-auto pt-8` · 차트 카드 = `ProfileCard`(`--shadow-bubble`) | `[bl]` `s6-growth-onboarding` · `[code]` | — | OK |
| `VG6-E2-02` | `RadioGroup.meta` | §3.2 | 라벨 오른쪽 끝 caption-1 · 미선택 `--color-action-secondary-fg` · 선택 `--color-selected-fg` · `<label>` 안 · 원래 옵션에 남음 | 일치. 선택 행 meta 픽셀 `#ffffff`, `-changed` 에서 미선택 CF 행 *Suggested* 가 ink 색으로 남음. `margin-inline-start: auto` · 새 토큰 0 | `[bl]` `[px]` · `[code]` `RadioGroup.css` L83-105 | — | OK |
| `VG6-E2-03` | `RadioGroup` meta 없음 | §3.2 "기존 영향 0" | DOM·레이아웃 변경 0 | meta 요소·공백 노드는 `meta !== undefined` 일 때만 렌더 → 기존 옵션 DOM 동일. 설문 baseline 통과는 **handoff 진술**(H6-3.4) — 이 검토에서 재실행 안 함 | `[code]` `RadioGroup.tsx` L131-136 | — | OK (baseline 통과는 QA 재확인) |
| `VG6-E2-04` | **선택 행 + hover** (`-changed` baseline) | §3.2 "선택 행" · Stage 1 §4.17 선택 = teal 채움 | 선택 행 = `--color-selected-bg`(teal) + 흰 라벨 — 포인터가 위에 있어도 같음 (`.haru-radio-group__option--selected:hover` 규칙의 의도) | **선택 행 배경이 `#dbeee7`(= `--color-surface-tinted`, hover 색) + 흰 라벨 → 대비 1.21:1, 라벨이 거의 안 보인다.** 원인: hover 규칙 `.option:hover:not(.option--disabled)` 특이도 (0,3,0) 가 선택 hover 복원 규칙 `.option--selected:hover` (0,2,0) 를 이긴다. 전환 중 프레임이 아님 — 픽셀이 hover 색 **정확히 최종값**(`#dbeee7`), 180ms 전환과 무관. 테스트가 `radio.check()` 로 포인터를 그 행 위에 둔 채 촬영해 **버그 상태가 baseline 에 굳었다**(`R-BASELINE-1`). Stage 1 부터 있던 결함으로 설문(Stage 2)·독서 루틴 선택 행에도 데스크톱 hover 시 같다 | `[px]` `-changed` ER 행 (200,450)=(219,238,231) · `primitive/color.css` `--haru-mist-100: #dbeee7` · `[code]` `RadioGroup.css` L114-122 | **Medium** | **FIX (dev)** — 선택 hover 복원 규칙의 특이도를 hover 규칙 이상으로 올린다(새 값 0). 수정 후 `-changed` 를 `--update-snapshots=all` 로 재생성하고 diff 가 그 행뿐인지 분해. 선택+hover 회귀 테스트(computed `background-color` = selected-bg) 1건 추가 |
| `VG6-E2-05` | 차트 선택 표시 | §3.1 selectable | 선택 축 라벨 bold + `--color-fg-strong` · 꼭짓점 링 18 / stroke 2 `--color-focus-ring` · 목록과 같은 state | 일치. `-changed` 에서 링·bold 가 ER 로 이동, CF 는 일반으로 복귀 | `[bl]` 두 장 비교 | — | OK |
| `VG6-E2-06` | 선택 설명 ↔ *You can change…* 간격 | §2.3 트리(두 `p` 가 형제) · §2.0 섹션 간격 20 — **두 문단 사이 간격은 명시 없음** | Spec 트리 그대로면 형제 = 섹션 gap 20. DRAFT `320:1439` 도 두 문장 사이가 넓다(육안 ≈ 20+) | 구현은 두 문장을 한 묶음(`gap-2` 8)으로 묶었다 | `[code]` L198 · `[bl]` · `[draft]` 육안 | Low | USER_APPROVAL — 8 묶음(구현) / 20 형제(Spec 트리·DRAFT) 택1 |
| `VG6-E2-07` | 헤더 h1 ↔ 제안 문구 간격 | §2.3 (간격 언급 없음) | DRAFT 가 더 넓다 | `gap-2` 8 — 프로필과 같은 구현 | `[code]` L155 · `[draft]` | Low | `VG6-E1-12` 결정을 따른다 (별도 결정 아님) |
| `VG6-E2-08` | 제안 없음 (`-empty`) | §2.3.1 · §2.3.2 | 미선택 시작 · 무제안 문구 · 차트 변형 C · CTA 비활성 + 사유 footnote primary 바로 위 · `aria-describedby` | 일치. 빈 live region 때문에 목록 ↔ *You can change…* 가 8 더 넓다(H6-3.6 #8) — 처음 선택 시 낭독 보장 목적, 수용 가능 | `[bl]` `-empty` · `[code]` L217-228 | — | OK |
| `VG6-E2-09` | 비활성 사유 caption 대비 | §9.3 "비활성 사유 caption 은 VG 에서 실제 배경 픽셀로 재측정 → 미달이면 `P-34` 후보" | 본문 ink-700 ≥ 4.5 | 사유 *Choose one to continue.*(footnote 13, 대형 아님) 배경 = 그래디언트 끝 `(201,206,216)` → **4.32:1** · CTA 쪽 `(200,204,215)` → 4.24. CTA 가 `mt-auto` 로 화면 바닥에 붙으므로 852 높이에서도 그래디언트 끝에 놓인다(852 실측은 안 함). *You can change…* 는 1200 baseline y≈662 배경 `(208,221,220)` → 4.88 ✅ — 852 에서는 더 아래 그래디언트에 놓여 **QA 실측 필요** | `[px]` `-empty` y 1039/1060 · `-onboarding` y 662 | **Medium** | **USER_APPROVAL** — ① 가값 `P-34` 등재(배경 위 본문 4.2~4.3) ② 다른 처리(예: 사유를 카드/CTA 영역 안으로) 택1. Spec §9.3 이 예고한 경로 |
| `VG6-E2-10` | CTA 비활성 (H6-3.6 #4) | §2.3.2 | 비활성 + 사유 `aria-describedby` 연결 | `aria-disabled` (native `disabled` 아님) · 시각 = 기존 `Button[aria-disabled]` (opacity-disabled + glass-rest) — Stage 2 blocked 패턴과 같음 | `[bl]` `-empty` CTA `(166,197,199)` · `[code]` `Button.css` L164 | — | OK (acceptable) |
| `VG6-E2-11` | 저장 실패 (`-save-failed`) | §2.3.1 | 선택 보존 · CTA 위 `InlineAlert tone="error"` · 오프라인 = §10.2 전용 문구 | 일치. 오프라인도 `tone="error"`(octagon-alert 아이콘, H6-3.6 #5) — Spec 문자 그대로 | `[bl]` · `[code]` L214-216 | — | OK (acceptable). 오프라인 아이콘을 `wifi-off` 로 원하면 Spec 정정이 먼저 |
| `VG6-E2-12` | 실패 후 다른 역량 선택 시 안내 해제 (H6-3.6 #6) | §2.3.1 (침묵) | — | `choose()` 에서 `saving.reset()` — 선택 보존, 오래된 오류 문구 제거 | `[code]` L144-148 | — | OK (acceptable) |
| `VG6-E2-13` | 조회 Error · Offline — `ErrorState` 그림자 (`R-SHADOW-1`) | §2.3.1 · §9.5 (**ErrorState 누락 — `VG6-E1-15` 와 같은 Spec 누락**) | overflow 박스 안 그림자: 번짐 합산 + 세로·가로 프로브 | `PickerError` → `ErrorState` = `Surface` material 기본 `rest` = `--shadow-glass-rest` 3겹 (좌우 번짐 선례 28~32 > 거터 24) · 부모 = `AppShell` 스크롤 뷰포트. **E1 과 같은 노출**. baseline 없음(Error/Offline 미촬영) | `[code]` `GrowthCapabilityPicker.tsx` L97-107 · `ErrorState.tsx` L50 | **Medium** | **FIX (dev)** — `VG6-E1-15` 와 한 번에: `/onboarding/growth-capability?scenario=children:error` 393·600 가로·세로 픽셀 프로브. 클립 선이 보이면 `R-SHADOW-1` ② 또는 대안 제안 후 승인 |
| `VG6-E2-14` | Error — *Continue to Home* 정렬 | §2.3.1 · `N6-37` | `ErrorState` + Try again + TextLink(온보딩만) | 구성 일치 · TextLink 가운데 | `[code]` L108-116 | Low | `VG6-E1-14` 결정을 따른다 |
| `VG6-E2-15` | Loading | §3.6 | 제목 text 2 → 차트 block → 행 block ×4 (44) · `aria-busy` + SR *Loading* | 일치(`Skeleton shape="rect"` = Spec "block"). 차트 자리 높이 식 = `DiamondChart.css` 가운데 트랙 식. **시각 baseline 없음** | `[code]` `PickerSkeleton` · `growth-capability.css` | — | OK (시각 미검증 — QA 이관) |
| `VG6-E2-16` | `R-SHADOW-1` — 정상 상태 | §9.5 | ProfileCard `--shadow-bubble` 4/0/10 ≤ 거터·간격 · 새 overflow 0 | 일치. RadioGroup·InlineAlert 그림자 0 · CTA 기존. 새 `overflow` 선언 0 (grep) | `[code]` | — | OK |
| `VG6-E2-17` | 설정 모드 (컴포넌트 단위) | §2.3 · §2.3.1 · `D6-8` 보충 | 본문 제목 0 · 안내 = *Choose the one you'd like to explore together first.* · meta *Current* · 변경 없음 = CTA 비활성(사유 문장 없음) · 저장 → Toast *Saved* → 뒤로 | 코드 일치 (`intro.noSuggestion` · `settings.meta` · `canSubmit`). TopBar·route 는 `S6-D`(H6-3.6 #1) | `[code]` L140-151 · `copy.ts` | — | OK (시각 baseline 은 `S6-D` 에서 — 그때 VG) |
| `VG6-E2-18` | UpdateNote — 위치·구성 | §2.2 · §9.1 | 재방문만 · `profileUpdatedAt` non-null + source 별 2문구 · 카드 위 한 줄 · Icon rotate-ccw 16 decorative · footnote primary · live 아님 | 일치. 아이콘 앞 · gap 8 (H6-3.6 #3, Spec "Text + Icon" 나열만) — 픽셀: 아이콘 글리프 x 2~13, 글자 시작 x 25 (= 16 + 8 + 1) · 노트 ↔ 첫 카드 20 | `[bl]` `-revisit-updated` · `[px]` · `[code]` `ProfileResultView.tsx` L110-123 | — | OK (acceptable) |
| `VG6-E2-19` | UpdateNote 날짜 연도 (H6-3.6 #2) | §2.2 · §10.1 *Updated {Mon D}…* · "날짜 = 기존 `formatMonthDay`" | *Updated Dec 31 …* | `formatMonthDay` 가 기기 연도와 다르면 연도를 붙임 → baseline *Updated Dec 31, 2025 …* (Mock 시계). Spec 이 같은 함수를 지정했으므로 두 문장이 충돌 | `[bl]` · `[code]` | Low | USER_APPROVAL — 연도 포함 유지(권고: 해 넘김 시 모호성 제거, 기존 함수 규칙과 일치) / 항상 생략 택1 |
| `VG6-E2-20` | UpdateNote 줄바꿈 (320) | §2.2 "카드 위 한 줄" · §11 | 한 줄 | 393 에서 글자 폭 ≈ 307 (x 25→332) → 320 컬럼 가용 ≈ 248 에서 **2줄** `[계산]`. `items-center` 라 아이콘이 두 줄 가운데에 온다. Spec 은 줄바꿈 시 아이콘 정렬을 말하지 않는다 (*Nov 14* 실서버 문구도 320 에서 2줄 가능) | `[px]` 폭 · `[code]` `flex items-center` | Low | USER_APPROVAL — 아이콘 가운데(구현) / 첫 줄 정렬(`items-start`) 택1. 320 실측은 QA |
| `VG6-E2-21` | 차트 Skeleton CSS 복제 (H6-3.6 #10) | §3.6 | — | `child-profile-view.css` 와 같은 식 복제(feature 간 import 금지) — 시각 영향 0 | `[code]` | — | OK — 지금은 유지. 공용화는 Stage 7 에서 같은 차트를 쓸 때 `entities/child-profile` 로 내릴 것 권고 |

### 2. Handoff H6-3.6 deviation 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| 1 | 설정 route 미등록 | OK | Spec §15 `S6-D` 소유 · `VG6-E2-17` |
| 2 | UpdateNote 연도 | **USER_APPROVAL** | `VG6-E2-19` |
| 3 | UpdateNote 아이콘 앞 · gap 8 | OK (acceptable) | `VG6-E2-18` |
| 4 | CTA `aria-disabled` | OK (acceptable) | `VG6-E2-10` |
| 5 | 오프라인 저장 실패도 `tone="error"` | OK (acceptable) | `VG6-E2-11` |
| 6 | 다른 역량 선택 시 안내 해제 | OK (acceptable) | `VG6-E2-12` |
| 7 | 제안값 그대로 확정해도 PUT 1건 | OK — 시각 아님 | 서버 구분 규칙은 `P6-BIP` 기존 범위 |
| 8 | 빈 live region 으로 8px 증가 | OK (acceptable) | `VG6-E2-08` |
| 9 | 온보딩 뒤로 = `replace` 로 프로필 | OK | `N6-24` ⓐ 와 일치 · 시각 아님 |
| 10 | 차트 Skeleton CSS feature 별 | OK | `VG6-E2-21` |
| 11 | `COMPONENT_MAP.md` 미갱신 | **design-agent 후속** (FIX 아님) | design-agent 소유 문서 — `RadioGroup.meta` · `GrowthCapabilityPicker`(2모드) · `ProfileResultView` UpdateNote 행 갱신을 다음 design-agent 패스에서 한다(이번 지시 범위는 VG 문서만) |

### 3. 집계

- `FIX (dev)` **2** — `VG6-E2-04` (선택 행 hover 특이도 버그 + baseline 재생성) · `VG6-E2-13` (ErrorState Glass Rest 프로브, `VG6-E1-15` 와 묶음)
- `USER_APPROVAL` **4** — `VG6-E2-06` (설명 문장 간격 8/20) · `VG6-E2-09` (비활성 사유 대비 4.24~4.32 → `P-34`) · `VG6-E2-19` (UpdateNote 연도) · `VG6-E2-20` (UpdateNote 줄바꿈 아이콘 정렬)
- E1 결정 연동 **2** — `VG6-E2-07` → `VG6-E1-12` · `VG6-E2-14` → `VG6-E1-14`
- `OK` **13** (QA 이관 실측: `VG6-E2-03` 설문 baseline 재확인 · `VG6-E2-09` 852 높이 *You can change…* 대비 · `VG6-E2-15` Loading 시각 · `VG6-E2-17` 설정 모드 시각 = `S6-D` · `VG6-E2-20` 320 줄바꿈)

### 4. design-agent 자기 정정

- Spec §9.5 표에 `ErrorState` 누락 (E1 §4 에서 이미 인정) — 발전 역량 화면에도 같은 노출 확인 → `VG6-E2-13`.
- Spec §3.2 는 `RadioGroup.meta` 만 다뤘고 **기존 선택+hover 규칙의 특이도**를 확인하지 않았다. meta 의 흰 글자가 같은 결함에 걸린다 → `VG6-E2-04`.

---

## S6-B

Author: design-agent (2026-11-16). ⛔ Production Code · Figma 수정 없음 · **Playwright 실행 안 함**(병행 실행 중). 판정 제안이며 허용 차이 등록은 사용자 승인 이후다.

범위: 설정 목록 `C13-S6-1` · 아이 정보 수정 `/settings/child` `C13-S6-2`(+ error · save-failed · offline) · 이탈 확인 · `VG6-E2-04` 수정 · `entities/child` 이동(R-11, 온보딩 Step 1 불변).

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[bl]` | baseline PNG 육안 + python PIL 픽셀 샘플 (`main` 클립 345×1216) | `settings-child.spec.ts/` 3장 · `growth-capability.spec.ts/s6-growth-onboarding-changed` · `visual.spec.ts/s2-onboarding-childinfo{,-edit}` |
| `[diff]` | PIL 픽셀 차 (채널 최대 Δ > 2) — HEAD ↔ 작업본 | `visual.spec.ts/s3-dialog-scrim.png` (`git show HEAD:` 추출) |
| `[px]` | 최암 픽셀 → 토큰 원색 대조 | 행 라벨 · SectionLabel · chevron · 선택 행 배경 |
| `[code]` | 저장소 직독 | `features/settings/{ui/SettingsMenu.tsx, settings.css}` · `entities/child/{ChildInfoFields.tsx, child.css}` · `features/child-profile-edit/{copy.ts, ui/ChildInfoEditForm.tsx}` · `packages/ui/src/field/RadioGroup.css` · `ChildInfoStep.tsx` HEAD ↔ 작업본 · `e2e/{settings-child,shadow,growth-capability}.spec.ts` |
| `[fig]` | `get_screenshot 248:1159` (Step 1 — Figma 정본) | 입력 recipe 비교 (Spec §0.3 `[ctx]` 선언값과 함께) |
| `[draft]` | `get_screenshot 321:1537`(설정 목록) · `321:1806`(아이 정보 default) — **Spec 침묵 지점 비교용만** (`D6-8`) | |

### 1. Gap 표

| ID | 화면 | Spec ref | Expected | Actual | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|---|
| `VG6-B-01` | 설정 목록 — 구조 | §2.4 · §10.3 · `N6-38` | 2그룹 · SectionLabel *YOUR CHILD* / *ACCOUNT* · 4행 + Log out 1행 · subtitle 0 · 명세 밖 행 0 | 일치. 행 높이 56/57/57/56 (ListRow 56) · 그룹 간격 16(`gap-4`) · SectionLabel ↔ 그룹 8(`gap-2`, `ChildInfoStep` 라벨↔카드와 같음) · 상단 `py-6` 24 | `[bl]` `s6-settings` 행 경계 y 48/104/161/218/274 · 315/370 · `[code]` L40-82 | — | OK |
| `VG6-B-02` | 설정 목록 — 색 | §2.0 SectionLabel · §2.4 chevron | SectionLabel ink-500 · 행 라벨 ink-700 · chevron 16 `--color-fg-tertiary`(ink-400) `decorative` · Log out chevron 0 | 최암 픽셀: SectionLabel `(125,146,145)`=`#7d9291` · 행 `(74,95,92)`=`#4a5f5c` · chevron `(154,171,170)`=`#9aabaa`. DRAFT `321:1537` chevron 이 더 진하게 보이나 Spec 이 토큰을 지정 → Spec 우선. chevron 대비는 기존 가값 `P-24` | `[px]` · `[code]` `settings.css` · `[draft]` | — | OK |
| `VG6-B-03` | `s3-dialog-scrim` 재생성 | §2.4 (목록 재구성) · `R-BASELINE-1` ⑤ | Dialog 자체 변화 0, 바깥만 목록 재구성 | 바깥 변화 = YOUR CHILD 4행 · ACCOUNT 이동 — handoff H6-4.5 분해와 일치. **정정**: handoff 의 *"Dialog 본문 안 클러스터 0"* 은 임계값 탓이다 — Dialog 상자 `(37,306)-(357,546)` 안에서 **y 306~391 에 778 px, Δ ≤ 8**(모서리 바깥 Δ ≤ 21)이 바뀌었다. 원인 = Dialog 면이 반투명 glass 라 뒤에 새로 놓인 *Growth focus* 행·그룹 가장자리가 비친다(변화가 정확히 그 행 높이 범위). 글자·버튼·Dialog 기하 변화 0 → 의도된 변화 | `[diff]` bbox `(23,64)-(370,415)` · 상자 내부 y 분포 300~390 만 | — | OK (handoff 서술만 정정) |
| `VG6-B-04` | 설정 목록 — *Update survey answers* · *Growth focus* 목적지 | §2.4 (5행 전부 `S6-B`) · §15 (화면 = `S6-C`/`S6-D`) | 행 존재 | 행 있음 · 지금은 Not Found 로 이동 (H6-4.6 ⑥) | `[code]` `menuRows.ts` | — | OK — 단 `S6-C`·`S6-D` 미완료 시 Stage QA 에서 AC-6-16 미완으로 재판정 |
| `VG6-B-05` | 아이 정보 — 구조 · 상태 | §2.5 · §10.4 · `N6-39` | YOUR CHILD(이름·성·생년+나이·성별) → AT HOME(언어 Chip) → 독서 루틴 → (실패 시 InlineAlert) → Save accent lg 흐름 배치 · relationship/ABOUT YOU/Trial notice 0 · 표시 모드 전환 0 · 변경 없음 Save 비활성 | 일치. 섹션 간격 20 · CTA `mt-auto pt-8` (baseline 의 큰 빈 공간은 촬영 높이 1300 때문) · Save 비활성 = 기존 `Button[aria-disabled]` · save-failed: InlineAlert 문구 §10.4 그대로, Save 위, Save 활성(재시도) · 입력 보존(*Mia*) | `[bl]` `s6-settings-child` · `-save-failed` · `[code]` `ChildInfoEditForm.tsx` L162-190 · `copy.ts` | — | OK |
| `VG6-B-06` | 독서 루틴 변형 (H6-4.6 ④) | §2.5 트리 **`RadioGroup variant="card"`** ↔ 같은 절 "Step 1 과 동일" · §0.3 "`ChildInfoStep` recipe 그대로" | **Figma `248:1159` 정본 = Answer card 행**(`244:1394` 341×243, 행 fill `rgba(233,240,237,.8)` · radius 16 · 선택 teal `#85bfb6` + 흰 라벨 — §0.3 `[ctx]`). Stage 2 재구성 Spec(APPROVED 2026-10-03) §4.6 도 `variant="card"` | 구현 = `list`(채움 없는 라디오 행) — **온보딩 Step 1 도 HEAD 부터 `list`**(`git show HEAD:…ChildInfoStep.tsx` L363). 즉 Stage 2 부터 있던 Figma 불일치가 R-11 로 새 화면에 그대로 옮겨왔다. 허용 차이 등록 기록 없음(grep `244:1394` → 명세 2곳뿐) | `[fig]` `248:1159` · `[bl]` `s6-settings-child` · `s2-onboarding-childinfo` · `[code]` | **Medium** | **USER_APPROVAL** — ① Figma 대로 `card` 로 바꾼다(두 화면 함께 · `s2-onboarding-childinfo*` 재생성 — 이번 단위의 "온보딩 불변" 지시와 충돌하므로 별도 승인 필요) **권고 (CLAUDE.md 최우선 규칙 1)** ② `list` 유지 + 허용 차이 등록 + Spec §2.5 트리 정정 |
| `VG6-B-07` | 언어 Chip 묶음 컨테이너 | §0.3 "언어 칩 카드 346 radius 30 `glass-fill-strong` + `0 6 4`" · §2.5 "기존 haru-choice-group" | Figma `248:1159` / `244:1314`: 칩이 **카드 안**(legend 포함) | 카드 없음 — 칩이 배경 위에 바로 놓인다. 온보딩 Step 1 HEAD 와 같다(Stage 2 부터의 불일치, 등록 기록 없음) | `[fig]` · `[bl]` 두 화면 · `[code]` `child.css` | **Medium** | **USER_APPROVAL** — `VG6-B-06` 과 한 결정으로: ① Figma 대로 카드 추가(두 화면, 그림자 `R-SHADOW-1` 확인 포함) **권고** ② 현행 + 허용 차이 등록 |
| `VG6-B-08` | 생년·성별 SelectTrigger 배치 | §2.5 트리: `FieldGroup`(이름·성) 다음 `SelectTrigger` 형제 | Spec 트리 그대로 | 일치 — 이름 2칸만 카드, 생년·성별은 카드 밖. DRAFT `321:1806` 은 생년·성별도 카드(`Input` 변형)이고, Figma `248:1159` 는 **표시 모드만** 있어 편집 모드의 정본이 없다 | `[bl]` · `[draft]` · `[fig]` | Low | OK (Spec 일치). `VG6-B-06/07` ① 을 택하면 함께 재검토 권고 |
| `VG6-B-09` | 나이 Tag 폭 (H6-4.6 ⑧) | §2.5 "Tag(xs) 나이" · `Tag 76:440` = 내용 폭 pill (pad 13/7) | 내용 폭 pill | **앱 컬럼 폭 전체(345)로 늘어난 막대** — `ChildIdentityFields` 의 flex column(`align-items: stretch`) 안에 놓인 탓. Tag 컴포넌트 정의(pill)와 다르고 Figma 어디에도 늘어난 Tag 가 없다. 온보딩 Step 1 편집 모드(생년 선택 후)도 HEAD 부터 같은 결함 — 그 상태의 baseline 이 없어 드러나지 않았다 | `[bl]` `s6-settings-child` y 228~250 · `[code]` `ChildInfoFields.tsx` L109-116 | **Medium** | **FIX (dev)** — Tag 를 내용 폭으로(정렬 유틸리티 1개, 새 값·토큰 0). 온보딩 편집 모드에도 같은 수정이 적용되는 것은 결함 수정이며 기존 baseline 영향 0 예상(해당 상태 baseline 없음) — `=all` 재생성으로 확인. Spec 의 "xs" 는 design-agent 오기 — Step 1 구현값 `sm` 유지 |
| `VG6-B-10` | 성 필드 *Optional* 표기 | §2.5 "TextField lastName (helper *Optional*)" | helper | 라벨 *Last name* + 입력 아래 helper *Optional* — Spec · Step 1 과 일치. DRAFT 는 *Last name · Optional* 라벨 | `[bl]` · `[draft]` | — | OK |
| `VG6-B-11` | 필드 오류 문구 (H6-4.6 ③) | §2.5 "해당 필드 error 문구" — **문구 미정** | — | 생년월 = 기존 `ageOutOfRange` · 그 외 = 새 문장 *"Please check this and try again."* · 언어만 거부 시 Save 위 InlineAlert. 금칙어 0. baseline 없음 | `[code]` `copy.ts` | Low | **USER_APPROVAL** — 문구 확정 (Spec §10.4 누락 — design-agent 명세 공백) |
| `VG6-B-12` | Loading (H6-4.6 ⑤) | §3.6 `text lines=6` | 6줄 | `Skeleton.lines` 상한 5 → 섹션 2 × 3줄. 시각 baseline 없음 | `[code]` | — | OK (acceptable — Shared UI 변경 회피). 시각은 QA |
| `VG6-B-13` | 초기값 Error · Offline — `ErrorState` 그림자 (`R-SHADOW-1`) | §2.5 · §9.5 (ErrorState 누락 — E1 §4 자기 정정) | 번짐 합산 + 세로·가로 프로브 | `e2e/shadow.spec.ts` L1285 `/settings/child` 조회 실패 항목 존재. 결과(handoff): 좌·우 37/37 · 아래 44~45 · 위 13 · 600 컬럼 바깥 6 → 클리핑 조상 = 뷰포트 폭, 클립 선 없음. 대조 테스트(컬럼 `overflow-x: clip` 주입 시 프로브가 문다) 있음 | `[code]` spec 항목 · 수치는 handoff H6-4.4 (재실행 안 함) | — | OK (수치 재현은 QA) |
| `VG6-B-14` | `ListGroup` 그림자 | §9.5 (`--shadow-bubble` 4/0/10) | 거터 24 · 그룹 간격 16 이내 | 일치. 새 `overflow` 0. 프로브: 좌·우 7~8 · 아래 21 (handoff) | `[code]` · H6-4.4 | — | OK |
| `VG6-B-15` | 이탈 확인 Dialog | §2.5 · §10.4 · `N6-14` ⓐ | `ConfirmDialog` destructive · *Discard changes?* / *Your edits to {firstName}'s info won't be saved.* / *Discard* / *Keep editing* | 문구·destructive 일치. `{firstName}` = **서버 값**(편집 중 이름 아님) — 맞다. 시각 = 기존 ConfirmDialog(`s3-dialog-scrim` 과 같은 컴포넌트). 이 화면 Dialog baseline 없음 | `[code]` L193-202 | — | OK (시각은 QA) |
| `VG6-B-16` | 브라우저 back = history sentinel · TopBar 등록 지점 (H6-4.6 ①②) | §2.5 이탈 확인 | — | 시각 아님. Architecture 변경(data router) 없이 처리 | `[code]` | — | OK |
| `VG6-B-17` | 입력 변경 시 실패 안내 해제 (H6-4.6 ⑦) | §2.5 (침묵) | — | `VG6-E2-12` 와 같은 규칙 · 입력 보존 | `[code]` | — | OK (acceptable) |
| `VG6-B-18` | TopBar *Child info* | §1 #4 · §10.4 | centered h1 + Back | baseline 은 `main` 클립이라 TopBar 미포함 | `[code]` `ChildInfoEditTopBar.tsx` | — | OK (시각은 QA — 전체 프레임 비교 권고) |
| `VG6-B-19` | **`VG6-E2-04` 수정** — 선택 행 + hover | §3.2 · Stage 1 §4.17 | card 선택 행 hover 중에도 `--color-selected-bg` · list 변형 선택 hover = 기존 tinted · 미선택 hover = tinted | 규칙 `.option--selected:hover:not(--disabled)` (0,3,0) 을 일반 hover **뒤**에 · list 덮어쓰기 (0,4,0) → 셋 다 성립. `-changed` ER 행 3점 `(133,191,182)` = `#85bfb6` · 라벨 흰색 · meta 흰색 | `[px]` `-changed` (5/200/340, 460) · `[code]` `RadioGroup.css` L113-136 · e2e `growth-capability.spec.ts` L224 회귀 테스트 | — | OK — **해소** |
| `VG6-B-20` | `-changed` 재생성 | `R-BASELINE-1` ⑤ | 바뀐 곳 = 선택 행뿐 | handoff 분해(연결성분 1개, 344×44 ER 행) — 위 `[px]` 와 일치 | `[bl]` · H6-4.5 | — | OK |
| `VG6-B-21` | 온보딩 Step 1 불변 (R-11) | §2.5 재사용 · §14 `S6-B` | DOM·순서·시각 변화 0 | `s2-onboarding-childinfo*` 4장 **재생성 0**(`git status` 에 없음) · Fragment 반환으로 DOM 깊이 불변 · `.haru-choice-group*` 규칙 이동(값 변화 0). 통과 여부는 handoff 진술 — 재실행 안 함 | `[code]` · `git status` | — | OK (baseline 통과는 QA 재확인). 단 `VG6-B-09` FIX 는 편집 모드(생년 선택 후)를 의도적으로 바꾼다 |

### 2. Handoff H6-4.6 deviation 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| 1 | 브라우저 back = history sentinel | OK | `VG6-B-16` · 시각 아님 |
| 2 | TopBar ↔ 폼 등록 지점 | OK | `VG6-B-16` |
| 3 | 필드 오류 문구 | **USER_APPROVAL** | `VG6-B-11` |
| 4 | 독서 루틴 `list` | **USER_APPROVAL** (Spec 정정만으로 닫지 않는다 — Figma `248:1159` 와 불일치) | `VG6-B-06` |
| 5 | Loading 3×2 | OK (acceptable) | `VG6-B-12` |
| 6 | 두 행 Not Found | OK (추적) | `VG6-B-04` |
| 7 | 입력 변경 시 안내 해제 | OK (acceptable) | `VG6-B-17` |
| 8 | 나이 Tag 폭 전체 | **FIX (dev)** | `VG6-B-09` |
| 9 | `COMPONENT_MAP.md` 미갱신 | **해소** — design-agent 가 이번 패스에서 갱신 (2026-11-16) | `DiamondChart` · `RadioGroup.meta` · `Surface material=bubble` · `CapabilityDiamond` · `ProfileCard` · `PersonaCard` · `CapabilityTagList` · `ChildIdentityFields/ChildHomeFields` · `ProfileResultView`/`GrowthCapabilityPicker` · `ChildInfoEditForm` · `SettingsMenu` |
| 10 | `R-8` 단정 승계 | OK — 시각 아님 | `C13-S6-1` 의도 변경 |

### 3. 집계

- `FIX (dev)` **1** — `VG6-B-09` (나이 Tag 내용 폭)
- `USER_APPROVAL` **3** — `VG6-B-06` (독서 루틴 list ↔ Figma Answer card) · `VG6-B-07` (언어 칩 카드 없음 — `-06` 과 한 결정) · `VG6-B-11` (필드 오류 문구)
- `OK` **17** (QA 이관: `VG6-B-12` Loading · `VG6-B-13` 프로브 수치 재현 · `VG6-B-15` Dialog · `VG6-B-18` TopBar · `VG6-B-21` 온보딩 baseline 통과)
- 이전 FIX 해소: `VG6-E2-04` → `VG6-B-19` · `VG6-E1-15`/`VG6-E2-13` → `VG6-B-13` 과 같은 프로브로 확인(handoff 수치, QA 재현)

### 4. design-agent 자기 정정

- Spec §0.3 은 `248:1159` 의 언어 칩 카드·Answer card 독서 루틴을 선언값으로 적어 놓고도 §2.5 를 "`ChildInfoStep` recipe 그대로" 로 써서, **현행 Step 1 구현이 Figma 와 다르다는 사실**을 확인하지 않았다 → `VG6-B-06` · `VG6-B-07`. Spec 트리의 `variant="card"` 와 "Step 1 그대로" 가 서로 모순이었다.
- Spec §2.5 의 나이 Tag `xs` 는 오기(Step 1 = `sm`) · 필드 오류 문구 미정(§10.4 누락) → `VG6-B-09` · `VG6-B-11`.

---

## S6-C

Author: design-agent (2026-11-16). ⛔ Production Code · Figma 수정 없음 · **Playwright 실행 안 함**(병행 실행 중). 판정 제안이며 허용 차이 등록은 사용자 승인 이후다.

범위: 설문 재응답 `C13-S6-3` — 진입 `/settings/child/survey`(+ 이어서 · Loading · Error/Offline) · 카드 `/settings/child/survey/:step`(`entities/survey` 로 이동한 덱 재사용 · feature 가 다시 쓴 TopBar/ProgressBar/CTA) · 제출 실패 · 완료 Toast → 프로필 UpdateNote · 온보딩 불변(`R-5`).

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[bl]` | baseline PNG 육안 (`main` 클립 345 폭) | `settings-survey.spec.ts/` 5장 (`s6-survey-intro` · `-intro-resume` · `-card` · `-error` · `-save-failed`) |
| `[diff]` | python PIL 픽셀 차 (채널 Δ > 2) · 행 단위 밴드 분해 | `s6-survey-card` ↔ `visual.spec.ts/s2-deck-reading-together`(둘 다 345×808) · `s6-survey-intro` ↔ `s2-onboarding-intro` 위 262행 |
| `[px]` | 열 단위 경계 탐지 | 진입 카드 위·아래 경계 · 마지막 카드 ↔ InlineAlert 간격 |
| `[code]` | 저장소 직독 | `features/survey-update/{ui/SurveyUpdateIntro.tsx, ui/SurveyUpdateWizard.tsx, copy.ts, model/useSurveyUpdateWizard.ts}` · `entities/survey/{ui/SurveyIntroLayout.tsx, ui/ChoiceQuestionCard.tsx, instrumentView.ts, copy.ts}` · `pages/settings/SurveyUpdate{Page,StepPage,TopBar}.tsx` · `app/router.tsx` L438-470 · `features/onboarding-survey/ui/OnboardingWizard.tsx` L175-320 · `e2e/shadow.spec.ts` L1290-1296 |
| `[fig]` | `get_screenshot 179:1770` | 카드 정본 — clear(↻) 아이콘 · 카드 옆 chevron 존재 확인 |
| `[git]` | `git status --short e2e/__screenshots__` | 온보딩 baseline 변경 여부 |

### 1. Gap 표

| ID | 화면 | Spec ref | Expected | Actual | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|---|
| `VG6-C-01` | 진입 — 구조·문구 | §2.6.1 · §10.3 | medallion headphones md → Surface strong/card/5 (h1 *Update your answers* + 본문) → InfoRow clock *About 3 minutes* · list-checks *Your earlier answers are filled in* → CTA *Start* 흐름 배치 · Trial/Draft 안내 0 | 일치. 본문 tone = secondary(Spec §2.6.1 "기존 tone 유지") · 시간 = instrument `estimates.surveyMinutes` | `[bl]` `s6-survey-intro` · `[code]` `SurveyUpdateIntro.tsx` · `copy.ts` | — | OK |
| `VG6-C-02` | 진입 — 온보딩 골격과 같은가 (`R-5`) | §2.6.1 "OnboardingIntro 와 같은 골격" | 같은 기하 | 위 262행(medallion + 카드 위 경계) 픽셀 차 **0**. 카드 위 경계 y 251 동일, 아래 경계 341(재응답) / 366(온보딩) = 본문 줄 수 차이뿐. `243:1147` 과의 기존 차이(제목 굵기 등)는 Stage 2 승인 범위 그대로 — 새 차이 0 | `[diff]` bbox `None` · `[px]` | — | OK |
| `VG6-C-03` | 진입 — 이어서 | §2.6.3 | CTA *Continue where you left off* → `currentStep` | 라벨만 바뀌고 나머지 동일 | `[bl]` `-intro-resume` | — | OK (목적지 규칙은 `VG6-C-10`) |
| `VG6-C-04` | 진입 — TopBar | §2.6.1 | centered · 제목 없음 · leading Back | `SurveyUpdateTopBar` = `TopBar variant="centered"` + `IconButton chevron-left` *Back* — 설정 하위 화면과 같은 규격 | `[code]` · baseline 은 `main` 클립이라 TopBar 미포함 | — | OK (시각은 QA — 전체 프레임 권고, `VG6-B-18` 과 같이) |
| `VG6-C-05` | 진입 — Loading (H6-5.6 ⑥) | §2.6.3 "진입 화면 CTA `loading`" | CTA loading | CTA loading · **시계 행은 응답 전 미렌더**(수치가 instrument 에 있음) → 응답 후 InfoRow 1개(≈ 52)가 위에 끼어 들어가며 목록이 한 칸 밀린다. Spec 은 CTA 만 말한다. 새 UI·새 값 0 | `[code]` `SurveyIntroLayout` `duration === undefined` | Low | OK (acceptable) — 밀림이 문제가 되면 시계 행 자리 `Skeleton text lines=1` 을 Spec 에 추가하는 것이 먼저 |
| `VG6-C-06` | 카드 — 온보딩 카드와 같은가 (AC-6-24) | §2.6.2 "동일 컴포넌트·동일 규칙" · §14 `S6-C` | `179:1770` 재사용 · 온보딩과 같은 픽셀 | `s2-deck-reading-together` 대비 **TopBar 차 0 · 카드 위·좌우 경계 차 0**. 차이 밴드 5개 모두 원인 설명됨: ① y 56-61 진행바 구간 경계(카드 수 16 vs 15 — instrument 파생 `cardCountsByStep`) ② y 109-125 카운터 `1 / 16` + clear(↻) 아이콘(답 있음 → 기존 `onClear` 규칙, Figma `179:1770` 에도 있음) ③ y 326-408 선택 행(프리필) · 오른쪽 카드 chevron 가장자리 ④ y 549-691 카드 아래(답 있음 → 필수 사유 캡션 없음 → 카드 높이 차) | `[diff]` 밴드 `(56,61)` `(109,125)` `(326,330)` `(332,408)` `(549,691)` · `[fig]` · `[code]` `ChoiceQuestionCard.tsx` L78-87 | — | OK — 설명되지 않는 클러스터 0 (`R-BASELINE-1` ⑤) |
| `VG6-C-07` | 카드 chrome 을 feature 에서 다시 씀 (H6-5.6 ③) | §2.6.2 "TopBar: 온보딩 위저드 TopBar 그대로" | 같은 TopBar · ProgressBar · 간격(16/24) | `SurveyUpdateWizard` 의 상단 묶음(`gap-4` → TopBar + ProgressBar `accent sm segments`) · 본문 `haru-wizard-body gap-4` · CTA 묶음 `mt-auto pt-8 gap-2` 가 `OnboardingWizard` 카드 분기와 **클래스·순서 동일**. `VG6-C-06` 에서 픽셀로도 확인 | `[code]` 두 파일 대조 · `[diff]` | — | OK (acceptable) — 단 같은 마크업이 두 곳이므로 한쪽만 고치면 갈라진다. 다음에 위저드 chrome 을 바꾸는 단위에서 두 파일을 함께 바꾸도록 `COMPONENT_MAP` 에 기록함 |
| `VG6-C-08` | 마지막 카드 · 제출 실패 | §2.6.2 · §2.6.3 · §10.3 | 마지막 카드에만 CTA *Save answers* · 실패 = CTA 위 `InlineAlert tone="error"` *We couldn't save your answers right now* / *Your answers are still here. Try again.* · 답 보존 · 다음 chevron 비활성 | 일치. 카드 → InlineAlert 간격 49 (덱이 뒤 카드 겹침 자리를 남김 — 온보딩 덱과 같은 컴포넌트) · CTA 는 `mt-auto` 로 화면 끝(촬영 높이 1300 때문에 간격이 큼) · 남은 문항 안내는 0개라 없음 · 온보딩 제출 실패도 같은 자리(덱 다음, CTA 묶음 앞) | `[bl]` `-save-failed` · `[px]` 카드 아래 697 → 경보 746 · `[code]` Wizard L238-266 ↔ Onboarding L286-317 | — | OK |
| `VG6-C-09` | 덱·진행바 접근성 이름 (H6-5.7) | §9.1 "재응답 — 온보딩과 동일" · Spec §10.3 에 이름 없음 | 설정 흐름에 맞는 이름 | 덱 *Onboarding questions* · 진행바 *Onboarding progress* — 설정 화면에서 스크린리더가 "Onboarding" 이라 읽는다. 시각 변화 0. 새 문구가 필요하므로 Agent 가 정할 수 없다 | `[code]` `entities/survey/copy.ts` L64-65 · Wizard `progressLabel` · `SurveyCardDeck` L249 | Low | **USER_APPROVAL** — ① 덱에 `label` prop 을 두고 재응답만 *Survey questions* / *Survey progress* (온보딩 이름·baseline 불변) **권고** ② 두 흐름 공용 중립 문구로 교체(온보딩 이름도 바뀜) ③ 현행 유지 |
| `VG6-C-10` | 이어서 열리는 단계 (H6-5.6 ④) + 이탈 시 저장 (⑤) | §2.6.3 "*Continue where you left off* → `currentStep` 카드로" — `currentStep` 의 의미는 정하지 않음 | 사용자가 떠난 곳 | Mock `currentStep` = **마지막으로 저장된(떠난) 단계**. 단계 1 저장 → 단계 2 에서 나가면 *Continue where you left off* 가 **단계 1** 을 연다. 또 브라우저 back · 탭 닫기는 현재 단계를 저장하지 않아 그 단계에서 고친 답은 사라진다. 버튼 문구와 동작이 어긋난다 — 시각 아님, contract 의미 문제 | `[code]` `useSurveyUpdateWizard` · handoff H6-5.6 ④⑤ | Medium | **USER_APPROVAL** (한 결정) — ① 단계 이동 시 PUT 에 **도착 단계**를 실어 `currentStep` = 지금 보는 단계로(contract 변경 → plan-agent, `P6-BIP` 추가) **권고** ② 현행(저장한 단계로 복귀) 수용 + 버튼 문구 유지 ③ 이탈 시 현재 단계 저장 추가(브라우저 back 은 보장 불가) |
| `VG6-C-11` | 흐름 안 이동 = replace (H6-5.6 ②) | §2.6.3 "제출 성공 → `/settings/profile` replace" | — | 진입 ↔ 카드 · 단계 ↔ 단계 모두 replace → 진입 뒤로 · 제출 후 프로필 뒤로 · 카드 브라우저 back = 설정 목록. TopBar 첫 카드 뒤로 = 진입(Spec 그대로) | `[code]` | — | OK — 시각 아님 |
| `VG6-C-12` | 카드 화면 Loading · Error 에도 TopBar (H6-5.6 ⑦) | §2.6.3 "카드 자리 `Skeleton shape="card"`" · ErrorState | 카드 자리 Skeleton / ErrorState | 그 위에 단계 제목 + 뒤로(→ 진입) TopBar. 진행바는 카드 수를 몰라 없음. 같은 화면 정상 상태의 TopBar 와 같은 컴포넌트 — 새 UI 아님, 탈출 경로 유지 | `[code]` `PlainTopBar` · `WizardPlaceholder` | — | OK (acceptable). 시각 baseline 없음 → QA |
| `VG6-C-13` | 진입 조회 Error · Offline | §2.6.3 · §2.7 | 진입 대신 `ErrorState` + *Try again* | 일치(*Something went wrong* / 오프라인 = `networkErrorCopy`). ErrorState 가 TopBar 바로 아래(`pt` 없음) — `/settings/child` 조회 실패와 같은 배치 | `[bl]` `-error` · `[code]` | — | OK |
| `VG6-C-14` | `R-SHADOW-1` — ErrorState(Glass Rest 3겹) | §9.5 (ErrorState 누락 — E1 §4 자기 정정) | 번짐 합산 + 세로·가로 프로브 | `e2e/shadow.spec.ts` `ERROR_STATE_SCREENS` 에 진입(L1290)·카드(L1295) 2행. 결과(handoff): 좌우 6 · 아래 16 · 위 6 · 600 컬럼 바깥 3 통과. 새 `overflow` 0 · InlineAlert 그림자 0 | `[code]` · 수치는 handoff H6-5.3 (재실행 안 함) | — | OK (수치 재현은 QA) |
| `VG6-C-15` | 완료 Toast → 프로필 | §2.6.3 · §2.2 | `Toast success` *Your answers are saved* → `/settings/profile` replace · UpdateNote *Updated {Mon D} from your latest answers* | 일치 — `toast.show({tone:'success'})` 후 replace · UpdateNote 문구는 `S6-E2` 구현(`source = survey_update`). Toast 는 순간 표시라 baseline 없음 | `[code]` `useSurveyUpdateWizard` L100-106 · `child-profile-view/copy.ts` L32 | — | OK (시각은 QA). UpdateNote 연도·줄바꿈은 `VG6-E2-19`·`-20` 결정을 따른다 |
| `VG6-C-16` | 온보딩 불변 (`R-5`) | §14 `S6-C` · 지시 "Onboarding visuals must be unchanged" | 온보딩 baseline 변화 0 | `visual.spec.ts` s2 온보딩·덱 baseline **변경 0**(`git status` 의 변경은 `s3-dialog-scrim` 1장 — `S6-B` 몫). 통과 여부는 handoff 진술(308 passed) — 기본 `changed` 모드는 통과 시 다시 쓰지 않으므로(`R-BASELINE-1` ③-1) "변경 0" 은 **임계 0.02 안에서 같다**는 뜻 | `[git]` · H6-5.5 | — | OK (QA 재확인) |
| `VG6-C-17` | 이중 탭 제출 1건 (H6-5.6 ①) | §2.6.3 "제출 중 CTA loading" | — | 중복 방지 플래그를 실패 뒤에만 해제 — 시각 아님 | `[code]` | — | OK — 시각 아님 |

### 2. Handoff H6-5.6 · H6-5.7 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| ① | 제출 중복 방지 강화 | OK — 시각 아님 | `VG6-C-17` |
| ② | 흐름 안 이동 전부 replace | OK | `VG6-C-11` |
| ③ | 위저드 chrome 새로 씀(같은 마크업) | OK (acceptable) | `VG6-C-07` · 픽셀 동일 `VG6-C-06` |
| ④ | 복귀 = 마지막 저장 단계 | **USER_APPROVAL** | `VG6-C-10` |
| ⑤ | 브라우저 back · 탭 닫기 시 현재 단계 미저장 | **USER_APPROVAL** (④ 와 한 결정) | `VG6-C-10` |
| ⑥ | 진입 Loading 중 시계 행 미렌더 | OK (acceptable) | `VG6-C-05` |
| ⑦ | 카드 Loading/Error 에도 TopBar | OK (acceptable) | `VG6-C-12` |
| ⑧ | `entities/survey` 신설 · COMPONENT_MAP 미갱신 | **해소** — 이번 패스에서 갱신 | `COMPONENT_MAP.md` §2 `SurveyCardDeck` · `SurveyIntroLayout` · §3 `SurveyUpdateIntro/Wizard` · §4 `SurveyIntroPanel` |
| H6-5.7 | 덱 *Onboarding questions* · 진행바 *Onboarding progress* | **USER_APPROVAL** | `VG6-C-09` |
| H6-5.7 | *Back* · *Go back* · *Loading* 재사용 | OK | 기존 승인 문구, Spec "온보딩 TopBar 그대로" |

### 3. 집계

- `FIX (dev)` **0**
- `USER_APPROVAL` **2** — `VG6-C-09` (덱·진행바 접근성 이름 "Onboarding") · `VG6-C-10` (이어서 열리는 단계 = 저장한 단계 · 이탈 시 미저장 — contract 의미)
- `OK` **15** (그중 acceptable 3: `VG6-C-05` · `-07` · `-12` / QA 이관: `-04` TopBar 전체 프레임 · `-12` 카드 Loading/Error 시각 · `-14` 프로브 수치 · `-15` Toast · `-16` 온보딩 baseline 통과)

### 4. design-agent 자기 정정

- Spec §2.6.3 이 *Continue where you left off* 의 목적지를 `currentStep` 으로만 적고 **그 값이 "저장한 단계"인지 "보고 있던 단계"인지** 정하지 않았다 → `VG6-C-10`.
- Spec §9.1 "재응답 = 온보딩과 동일" 이 덱·진행바의 **접근성 이름까지 같다**는 뜻이 되어 버렸다 — 설정 흐름용 이름을 §10.3 에 넣었어야 했다 → `VG6-C-09`.
- Spec §2.6.3 진입 Loading 은 CTA 만 정해 시계 행(수치가 서버 값)의 자리를 정하지 않았다 → `VG6-C-05`.

---

## S6-D

Author: design-agent (2026-11-17). ⛔ Production Code · Figma 수정 없음 · **Playwright 실행 안 함**(다른 Agent 가 실행 중). 판정 제안이며 허용 차이 등록은 사용자 승인 이후다.

범위: 발전 역량 설정 모드 `C13-S6-4` `/settings/growth-capability`(TopBar · *Current* · `D6-8` 안내 문장 · default / changed / empty / save-failed / loading / error / offline) · 설정 *Profile* 행 → `/settings/profile` 재방문 · `VG6-B-09` 나이 Tag 수정(아이 정보 수정 + 온보딩 Step 1 편집 모드).

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[bl]` | baseline PNG 육안(4장 나란히) + python PIL 픽셀 샘플 (`main` 클립 345×1116 / 345×1216) | `settings-growth.spec.ts/` 4장 · `settings-child.spec.ts/s6-settings-child.png` |
| `[px]` | 점 샘플 · 열 단위 경계 탐지 | 선택 행 배경 · InlineAlert ↔ Save 간격 · 나이 Tag 가로·세로 범위 |
| `[code]` | 저장소 직독 | `pages/settings/{GrowthCapabilityPage, GrowthCapabilityTopBar, ProfileTopBar, ProfilePage}.tsx` · `features/growth-capability/{ui/GrowthCapabilityPicker.tsx, copy.ts, growth-capability.css}` · `features/settings/model/menuRows.ts` · `app/router.tsx` L417-453 · `entities/child/ChildInfoFields.tsx` L109-122 · `features/onboarding-survey/ui/ChildInfoStep.tsx` L168-233 · `grep navigate(-1)` |
| `[draft]` | `get_screenshot 320:1945` (DRAFT 설정 default) — **Spec 침묵 지점 비교용만** (`D6-8`) | |

### 1. Gap 표

| ID | 화면 | Spec ref | Expected | Actual | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|---|
| `VG6-D-01` | 설정 — TopBar | §2.3 · §10.2 | centered *Growth focus* (= h1) + leading Back `navigate(-1)` · 이탈 확인 0 (`N6-46`) | `GrowthCapabilityTopBar` = `TopBar variant="centered"` + `IconButton chevron-left` *Back* — `ProfileTopBar` 와 같은 규격. route `StackLayout topBar` + `RouteGuard` (프로필 재방문과 같은 조립) | `[code]` · baseline 은 `main` 클립이라 TopBar 미포함 | — | OK (시각은 QA 전체 프레임 — `VG6-B-18`·`VG6-C-04` 와 같이) |
| `VG6-D-02` | 설정 — 구조 | §2.3 트리 settings | 본문 제목 0 → 안내 subheadline primary → ProfileCard(차트 selectable) → RadioGroup card(legend 숨김, 축 순서 `N6-28`) → 선택 설명 → CTA *Save* 흐름 배치. *You can change…* 0 | 일치. `pt-6` · 섹션 gap 20 · CTA `mt-auto pt-8`. DRAFT `320:1945` 와 구성·순서 같음(문장만 다름 → `VG6-D-03`) | `[bl]` `s6-growth-settings` · `[code]` L153-237 · `[draft]` | — | OK |
| `VG6-D-03` | 설정 — 안내 문장 | `D6-8` 보충 · §10.2 제안 없음 | *Choose the one you'd like to explore together first.* · *We've suggested…* 0 | 일치 (`intro.noSuggestion`, 설정 모드는 `original` 유무와 무관하게 이 문장). DRAFT `320:1945` 의 *We've suggested…* 는 `D6-8` 이 작도 오류로 정리 — 차이 아님. 393 에서 2줄(*first.* 한 단어 줄) — Spec 이 줄바꿈을 정하지 않으며 새 값 없이 바꿀 수 없음 | `[bl]` 4장 공통 · `[code]` L150-151 · `copy.ts` | — | OK |
| `VG6-D-04` | 설정 default — *Current* · CTA | §2.3.1 settings Default · §3.2 | 현재값 선택 · meta *Current* · CTA 비활성(변경 없음) · 사유 문장 0 | 일치. CF 행 배경 `(133,191,182)` = `#85bfb6`(selected-bg) · meta 흰색 · Save = 기존 `Button[aria-disabled]` · 사유 caption 미렌더(`selected !== null`) | `[bl]` `[px]` (200,470) · `[code]` L140 · L217-228 | — | OK |
| `VG6-D-05` | 설정 changed | §2.3.1 settings User changed | 선택 이동 → CTA 활성 · *Current* 는 원래 옵션에 남음 · 차트 링·bold 이동 | 일치. ER 행 `(133,191,182)` · CF 행 `(237,243,241)`(미선택) + *Current* ink 색 유지. 포인터를 치운 뒤 촬영 — `VG6-E2-04`/`VG6-B-19` 수정이 설정 모드에서도 유지됨 | `[bl]` `-changed` · `[px]` (200,418)/(200,470) | — | OK |
| `VG6-D-06` | 설정 empty (`all-scores-missing`) | §2.3.1 "같은 처리" · §2.3.2 | 미선택 · *Current* 0 · 차트 변형 C · CTA 비활성 + 사유 *Choose one to continue.* 바로 위 + `aria-describedby` | 일치. 4축 *Not seen yet* · 면·꼭짓점 0 · 사유 caption → Save | `[bl]` `-empty` · `[code]` L217-228 | — | OK — 사유 caption 대비는 `VG6-E2-09`(`P-34` 후보, 결정 대기)를 **승계**(같은 그래디언트 끝 위치) |
| `VG6-D-07` | 설정 save-failed | §2.3.1 저장 실패 · §10.2 | 선택 보존 · CTA 위 `InlineAlert tone="error"` *We couldn't save your choice right now* / *Your selection is still here. Try again.* · 다시 누르면 재시도 | 일치. InlineAlert 아래 1047 → Save 위 ≈ 1060 = `gap-3` 12 (온보딩과 같은 묶음) · Save 활성 · ER 선택 유지 | `[bl]` `-save-failed` · `[px]` 열 x=172 경계 | — | OK |
| `VG6-D-08` | 설정 offline (저장) | §2.3.1 · §10.2 오프라인 | 같은 자리 · 전용 문구 | `copy.offline` · `tone="error"` — `VG6-E2-11` 판정과 같음. baseline 없음(단위·e2e 문구 단정, handoff H6-6.3 #31) | `[code]` L142 | — | OK (시각은 QA) |
| `VG6-D-09` | 설정 Loading | §3.6 · §2.3.1 | text 2 → 차트 block → 행 block ×4 · `aria-busy` + SR *Loading* | `PickerSkeleton` 공용 — 설정 모드엔 제목이 없으나 안내 문장이 393 에서 2줄이라 text 2 와 높이가 맞는다. 시각 baseline 없음 | `[code]` L59-83 | — | OK (시각 QA) |
| `VG6-D-10` | 설정 조회 Error · Offline | §2.3.1 settings · §2.7 | `ErrorState` + *Try again* · *Continue to Home* 0 | 일치. `titleAs="h2"`(TopBar 가 h1 — heading 위계 정상) · TextLink 미렌더 → `VG6-E1-14` 정렬 결정은 **설정 모드와 무관**. 그림자 프로브 `ERROR_STATE_SCREENS` 에 1행 추가 — 좌우 6 · 아래 16 · 위 6 · 600 컬럼 바깥 3 통과(handoff 수치) | `[code]` L85-119 · handoff H6-6.3 `R-SHADOW-1` ① | — | OK (수치 재현은 QA) |
| `VG6-D-11` | `R-SHADOW-1` — 차트 카드 | §9.5 | `--shadow-bubble` 4/0/10 ≤ 거터·간격 · 새 overflow 0 · 세로·가로 프로브 | 새 `overflow` 0 · 새 describe "발전 역량 설정 모드 차트 카드 그림자" 393·600 — 클립 조상 폭 ≥ 뷰포트 · 좌우 2 · 아래 4 프로브 통과(handoff) | `[code]` · H6-6.3 ② | — | OK (수치 재현은 QA) |
| `VG6-D-12` | 직접 링크 진입 시 Save / Back = `navigate(-1)` (H6-6.5 ②) | §2.3 settings "Back (navigate(-1))" · "Save → Toast → navigate(-1)" | — | Spec 이 정한 그대로. 앱 안 history 가 없으면 앱 밖으로 나간다. 같은 `navigate(-1)` 가 이미 승인·통과한 TopBar 7곳(`SettingsTopBar` · `ProfileTopBar` · `SurveyUpdateTopBar` · 아이 정보 back · `AddOwnBookTopBar` · `GiftRequestsTopBar` · `AuthTopBar`)에 있다 — `S6-D` 고유 결함이 아니라 앱 공통 동작. Mock 인증이 새로고침에서 지워져 지금은 재현 경로 없음. 시각 변화 0 | `[code]` `grep navigate(-1)` | Low | OK (acceptable) — 추적: Stage 8 웹 프리뷰(`C-18`)는 직접 링크가 가능하므로, 그때 "history 없으면 상위 목록으로" 대체 규칙을 **앱 공통으로 한 번에** 다룰지 확인할 것 (`S6-D` 만 바꾸면 화면 간 동작이 갈라진다) |
| `VG6-D-13` | 저장 중복 방지 강화 (H6-6.5 ①) | §2.3.1 저장 중 | — | 진행 플래그를 실패 뒤에만 해제 — `VG6-C-17` 과 같은 규칙. 시각 변화 0 | `[code]` `useSetGrowthCapability.ts` | — | OK — 시각 아님 |
| `VG6-D-14` | 설정 *Profile* 행 → `/settings/profile` | §2.4 · §2.2 · `D6-4` | 행 → 재방문 모드(TopBar *Profile* h1 · CTA 0 · 뒤로 → 설정) | 행 = `CHILD_SETTINGS_ROWS` 첫 줄(`S6-B`) · route = `S6-E1` 등록 — `S6-D` 는 왕복 단위·e2e 만 추가. 화면 시각은 기존 `profile-result.spec.ts/s6-profile-revisit*` baseline 그대로(재생성 0). *Growth focus* 행도 더는 Not Found 아님 → `VG6-B-04` **해소** | `[code]` `menuRows.ts` · router L417-426 · handoff H6-6.3 #16·#63 | — | OK — UpdateNote 의 `VG6-E2-19`(연도)·`VG6-E2-20`(320 줄바꿈 아이콘 정렬) 결정은 이 진입 경로에 **승계** |
| `VG6-D-15` | `VG6-B-09` 수정 — 아이 정보 수정 | §2.5 "Tag 나이" · `Tag 76:440` 내용 폭 pill | 내용 폭 pill · 크기 `sm` (Spec "xs" 는 오기 — `VG6-B-09`) | pill 가로 **x 0~69 (70)** · 세로 **y 227~252 (26)**, 그 오른쪽 = 배경 `(215,233,227)`. 행 높이·아래 요소 위치 불변(handoff 단일 클러스터 분해와 일치). 확대 크롭으로 *5yr 7mo* pill 확인 | `[bl]` `s6-settings-child` `[px]` y 238 · `[code]` L109-122 | — | OK — **`VG6-B-09` 해소** |
| `VG6-D-16` | `VG6-B-09` 수정 — 온보딩 Step 1 · 래퍼 DOM (H6-6.5 ③) | §2.5 재사용(R-11) | 같은 결함이 편집 모드에서 함께 고쳐짐 · 표시 모드 불변 | `ChildIdentityFields` 는 Step 1 **편집 모드에서만** 렌더(L193-203) · 표시 모드 나이 Tag 는 `DisplayRow trailing`(L219-230)이라 영향 0 → `s2-onboarding-childinfo*` 재생성 0 과 맞다. 래퍼 `div.flex` 1개 — Shared UI(`Tag`) 변경 회피, 새 값 0. 편집 모드 baseline 없음 → e2e computed 단정 2건(handoff) | `[code]` · `git status` | — | OK (acceptable) — 편집 모드 시각은 QA |

### 2. Handoff H6-6.5 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| ① | `useSetGrowthCapability` 중복 방지 강화 | OK — 시각 아님 | `VG6-D-13` |
| ② | 직접 링크 진입 시 Save / Back 이 앱 밖으로 | **OK (acceptable, 추적)** — Spec 정의 동작 · 앱 공통 7곳과 같음 · 현재 재현 경로 없음. Stage 8 프리뷰 배포 때 앱 공통 대체 규칙 여부 확인 | `VG6-D-12` |
| ③ | `VG6-B-09` 래퍼 DOM 노드 1개 | OK (acceptable) | `VG6-D-16` |

### 3. 결정 대기 항목 승계 (재제기 아님)

| 대기 항목 | `S6-D` 승계 여부 |
|---|---|
| `VG6-E1-12` 헤더 h1 ↔ 안내 간격 | **승계 안 함** — 설정 모드는 본문 h1 이 없다(안내 문장만) |
| `VG6-E1-14` *Continue to Home* 정렬 | **승계 안 함** — 설정 모드 Error 에 TextLink 없음 |
| `VG6-E2-06` 설명 ↔ *You can change…* 간격 | **승계 안 함** — 설정 모드에 *You can change…* 없음 |
| `VG6-E2-20` UpdateNote 320 줄바꿈 | **승계** — *Profile* 행 → `/settings/profile` (`VG6-D-14`) |
| (참고) `VG6-E2-09` 사유 caption 대비 · `VG6-E2-19` UpdateNote 연도 · `VG6-B-06`/`07` Step 1 Figma 차이 | 각각 `VG6-D-06` · `VG6-D-14` · `VG6-D-15`(같은 화면, 이번 수정 범위 밖)에 승계 |

### 4. 집계

- `FIX (dev)` **0**
- `USER_APPROVAL` **0** (새 항목 없음 — 대기 항목 승계만, §3)
- `OK` **16** (acceptable 2: `VG6-D-12` · `-16` / QA 이관: `-01` TopBar 전체 프레임 · `-08` offline · `-09` Loading · `-10`·`-11` 프로브 수치 · `-16` Step 1 편집 모드 시각)
- 이전 항목 해소: `VG6-B-09` → `VG6-D-15` · `VG6-B-04` → `VG6-D-14` · `VG6-E2-17`(설정 모드 시각 = `S6-D`) → `VG6-D-02`~`-07`

### 5. design-agent 자기 정정

- Spec §2.3 settings 가 Back · Save 를 `navigate(-1)` 로만 적고 **앱 안 history 가 없을 때의 목적지**를 정하지 않았다 (설정 하위 화면 전부 같은 공백) → `VG6-D-12`. Stage 8 웹 프리뷰 전에 앱 공통으로 정리할 대상으로 기록한다.

---

## S6-G

Author: design-agent (2026-11-18). ⛔ Production Code · Figma 수정 없음 · **Playwright 실행 안 함**(다른 lane). 판정 제안이며 허용 차이 등록은 사용자 승인 이후다 — 아래 `USER_APPROVAL` 항목은 **사용자 승인 필요**이고 design-agent 가 등록하지 않았다.

범위: Plan 개정 3 §12.2 `S6-G` G-1 ~ G-11 (`D6-9`) · 인계 `docs/qa/stage-6-handoff.md` H6-9 · H6-9.6 deviation 1~6 판정. G-2 · G-10 은 시각 변화 없음(동작) — QA 판정 대상.

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[fig]` | `get_design_context(244:1433)` **선언값** — fill · effect · padding · gap · radius · 타이포 (렌더 픽셀 아님) | `244:1314` Languages · `244:1327` 칩 묶음 · `244:1357`/`1358` 라벨 행 · `244:1394` Answer card · `244:1414`/`1415` 섹션 |
| `[fig2]` | `get_design_context(179:1788)` 선언값 — 설문 Answer card(공통 recipe 원본) | 행 라벨 weight 비교 |
| `[meta]` | `get_metadata(319:1425)` · `get_metadata(320:1493)` — 자식 y·h | G-5 간격 역산 |
| `[shot]` | `get_screenshot(244:1433)` 393 폭 — 배치 육안 비교만(값 추출 안 함) | |
| `[bl]` | baseline PNG 육안 + python PIL 열 스캔(x=172) · 글리프 행 탐지 | `settings-child.spec.ts/s6-settings-child.png` · `visual.spec.ts/s2-onboarding-childinfo-trial.png` (+ HEAD 판 비교) |
| `[code]` | 저장소 직독 | `entities/child/{ChildInfoFields.tsx, child.css}` · `shared/hooks/useChipRowSplit.ts` · `packages/ui/src/{field/RadioGroup.css, chip/Chip.css, surface/Surface.css}` · `packages/design-tokens/src/{semantic/*, primitive/color.css, component/index.css}` · `features/growth-capability/ui/GrowthCapabilityPicker.tsx` · `features/child-profile-view/{ui/ProfileResultView.tsx, child-profile-view.css}` · `features/survey-update/copy.ts` · `features/child-profile-edit/copy.ts` · `app/layouts/AppShell.tsx` |
| `[calc]` | WCAG 상대휘도 계산(python) | G-3 |

### 1. Gap 표

| ID | 항목 | Figma / 결정 (선언값) | 구현 | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|
| `VG6-G-01` | G-1 언어 칩 **카드 안** · legend 포함 · `AT HOME` 섹션 | `244:1314` 346 · `flex-col gap 14` · legend `244:1348` Regular 13/18 `text-primary` 왼쪽 · 칩 `244:1327` wrap **justify-center** | `Surface` 카드 안 fieldset · legend footnote primary block(h18) · 칩 가운데 정렬. 두 화면(설정 · Step 1) 같은 `ChildLanguageFields` | `[fig]` · `[bl]` 카드 y353–538(h185) · `[code]` | — | OK |
| `VG6-G-02` | 카드 radius (H6-9.6 ①) | `244:1314` **30** | `--radius-card` **28** (Δ−2). 인계 사유 "30 토큰 없음" 은 **사실과 다르다** — `--reflection-card-radius: 30px` (component, `N5-28` *"card(28)로 흡수하지 않는다"*, `D5-4`)가 이미 있다. 반면 `DESIGN_TOKEN_MAP` §radius 는 `corner radius/30 → --radius-card 흡수`(Stage 0) — **선례 두 개가 충돌** | `[fig]` · `[code]` `component/index.css:387` · `DESIGN_TOKEN_MAP.md:341` | Low | **USER_APPROVAL** — ① 28 흡수 유지(허용 차이 등록) ② 30 component 토큰 신설(`N5-28` 선례, 권고 — 최우선 규칙 1). `--reflection-card-radius` 재사용은 의미가 달라 비권고 |
| `VG6-G-03` | 카드 여백 · 면 · 그림자 (H6-9.6 ②) | pad 20/10/18/10 · legend↔칩 14 · fill `--glass-fill-strong` white 90% · effect drop `0 6 4 #5E7370/8%` + inset `0 1.5 0 white/90%` + inset `0 -1 0 #5E7370/5%` (Style 이름 `HARU/Shadow Rest` 5겹이지만 **인스턴스 = 1+2겹**, `R-FIGMA-1` ②) | `space-5`/`space-2-5`/`space-4-5` · legend gap `space-3-5` (전부 정확값) · `--color-surface-strong` = `--haru-white-a90` · `--shadow-bubble` = 같은 3겹(drop ink-600 8% + inset 2겹) | `[fig]` · `[code]` `shadow.css:52` · `color.css:47` | — | OK |
| `VG6-G-04` | 카드 backdrop blur | `244:1314` effect 목록에 **BACKGROUND_BLUR 없음** | `Surface fill="strong"` 가 `backdrop-filter: blur(--material-blur-md 12)` 를 함께 건다 — Figma 에 없는 효과 추가. 매끈한 세로 그래디언트 위라 시각 영향은 실질 0 으로 추정(측정 안 함) | `[fig]` · `[code]` `Surface.css:93-96` | Low | **USER_APPROVAL** — ① 그대로(허용 차이) ② blur 없는 fill 변형. ReflectionCard(`N5-28`) 도 같은 Surface 를 쓰는지 함께 확인 권고 |
| `VG6-G-05` | 칩 변형 · 간격 (H6-9.6 ④) | 칩 = `Select 90:626` — 미선택 1px `--stroke` · Medium 12.5 `#5e7370` · 선택 teal + white · **체크 없음** · pad 12/8 · gap 7 | `Chip variant="select"`(Stage 5 `D5-4` 신설 변형) · Medium · 12.5→12(`AD-6`) · gap 7→8(Stage 2 흡수 유지) | `[fig]` · `[code]` `Chip.css:94-110` · `[bl]` | — | OK (`outline`→`select` 는 G-1 "Figma 대로" 범위. 흡수는 기존 승인분) |
| `VG6-G-06` | Answer card 행 기하 · 면 (H6-9.6 ③ 일부) | `244:1394` 행 gap 7 · h43(pad 13) · pad-x 15 · 아이콘 gap 11 · fill `rgba(233,240,237,.8)` · radius 16 · 14.5 | `RadioGroup variant="card"` — gap 8 · min-h 44(`--radio-row-height`) · pad-x 16 · gap 12 · `--color-surface-subtle`(mist-50) · `--radius-field` 16 · subheadline 15. 실측 행 586/638/690/742/794 (h44 · gap 8) | `[fig]` · `[bl]` 열 스캔 · Stage 1 Spec §4.17(APPROVED) | — | OK — Stage 1 승인 recipe 의 흡수(43→44 터치, 7→8, 15→16, 11→12, 14.5→15)와 **동일**. 신규 차이 0 |
| `VG6-G-07` | Answer card **행 라벨 weight** (H6-9.6 ③ 일부) | `244:1394` · 설문 원본 `179:1788` **둘 다 SF Pro Semibold(590)** 14.5 | `.haru-radio-group__label` 에 weight 선언 없음 → **Regular**. Stage 1 §4.17 이 weight 를 적지 않아 **설문 카드 · 발전 역량 · 독서 루틴 모두** 같은 차이 — S6-G 가 만든 것이 아니라 공통 recipe 의 기존 누락이 이번에 드러난 것 | `[fig]` · `[fig2]` · `[code]` `RadioGroup.css` · `[bl]` 육안(Figma 대비 가늘다) | **Medium** | **USER_APPROVAL** — ① recipe 전체 Semibold(권고, 최우선 규칙 1 · 설문/발전 역량/Step 1 baseline 재생성 — `R-BASELINE-1` §5 분해) ② 독서 루틴만 ③ Regular 유지(허용 차이). **S6-G 차단 아님**(G-1 구조 요구는 충족) — Stage 6 PASS 전 결정 권고 |
| `VG6-G-08` | *Reading routine* 라벨 타이포 (H6-9.6 ⑤) | `244:1358` **Bold 12 · tracking 0.72** · `#7d9291` · 대소문자 혼용 | caption-1(12) · **semibold** · caption-1 letter-spacing · `--color-fg-secondary`(ink-500 `#7d9291`) — 기존 `YOUR CHILD` · `AT HOME` 라벨과 같은 SectionLabel recipe. 문자열 대소문자 Figma 대로 | `[fig]` · `[code]` `child.css` 끝 · `[bl]` | Low | **USER_APPROVAL** — 앱 공통 SectionLabel 의 Bold→semibold · tracking 차이는 이 단위 이전부터의 recipe 이며 승인 근거를 찾지 못했다(`AD-S2R-*` 에 없음). ① 공통 recipe 를 Figma(Bold · 0.72)로 ② 현행 유지(허용 차이). 독서 루틴만 다르게 하는 안은 비권고 |
| `VG6-G-09` | 언어 카드 → 라벨 → 첫 행 세로 간격 | 섹션 gap 18 → 라벨 행 h34(pad 10 위아래) → gap 1 → 행. 카드 아래 → 첫 행 = **53** · 카드 아래 → 글리프 위 ≈ 31 | 섹션 gap 20(`AD-S2R-04`) → legend(h16) → `space-3` 12 → 행. 카드 아래(538) → 글리프 위(561) **23** · 글리프 아래(571) → 행(586) 15 · 카드 아래 → 첫 행 **48** (Δ−5) | `[fig]` · `[bl]` PIL 열 스캔 | Low | **USER_APPROVAL** — 원인 = 라벨 행 위쪽 pad 10 이 legend 에 없음. ① legend 위 `space-2`(8) 추가로 Δ+3 ② 현행 유지(허용 차이). 다른 섹션 라벨(`AT HOME`)도 Figma 34 행과 다르게 그려져 있어 `VG6-G-08` 과 함께 결정 권고 |
| `VG6-G-10` | 독서 루틴 배치 | `244:1415` = `AT HOME` 의 **형제 섹션** | `ChildReadingRoutineField` 가 `AT HOME` section 다음 형제 — 두 화면 동일 | `[fig]` · `[code]` · `[bl]` | — | OK |
| `VG6-G-11` | G-1a 칩 줄 사이 hit 영역 중간선 분할 | `D6-9` ④ (`D5-6` 방식) | `useChipRowSplit` 를 `shared/hooks` 로 **이동만**(본문 변화 0, feature 간 import 회피). 첫 줄 아닌 칩 `::before` 위쪽 slop = `-(space-2/2 + border 1)` (padding box 기준 → border box 기준 −4 = 줄 간격 8 의 절반) · 선택 칩(border 0) = `-(space-2/2)`. 윗줄 아래 slop 5.5/6.5 ≥ 4 이므로 중간선에서 소유가 바뀐다. 보이는 배치 변화 0 | `[code]` `child.css` G-1a 블록 · `useChipRowSplit.ts` · H6-9.3 프로브(393·320, ±0.5) | — | OK (식 검산은 design-agent, 픽셀 프로브 재현은 QA) |
| `VG6-G-12` | G-3 비활성 사유 · *You can change…* 대비 (`VG6-E2-09` 해소) | `D6-9` ③ — 기존 진한 보조 텍스트 토큰, ≥ 4.5 | `Text tone="strong"` = `--color-fg-strong` = ink-800 `#3b4a48` (신규 토큰 0, `P-34` 미등록). 최악 배경 = 그래디언트 끝 stop `--color-bg-app-end` = dusk-200 `#c7c9d7` → **5.65:1** · 기존 실측 배경 `(201,206,216)` 5.89 · `(200,204,215)` 5.79 · `(208,221,220)` 6.67 | `[calc]` · `[code]` `GrowthCapabilityPicker.tsx:218,230` · `color.css:17,43` | — | OK — 그래디언트 어느 지점이든 끝 stop 보다 밝으므로 하한 5.65 |
| `VG6-G-13` | G-5 헤더 · 설명 간격 20 (`VG6-E1-12` · `E2-06` · `E2-07` 해소) | DRAFT `319:1425` h1 y0 h54 → 본문 y74 (**20**) · `320:1493` h1 y0 h27 → 본문 y47 (**20**) · 설명 `320:1560` y594 h45 → `320:1561` y659 (**20**) | 헤더 `gap-5` · 설명 묶음 `gap-5`(선택 전 0) = `--space-5` 20. baseline 분해 = h1 아래 +12 · 설명 아래 +24 (8→20) 잔차 0 (H6-9.5) | `[meta]` · `[code]` · H6-9.5 | — | OK — DRAFT 값 = 기존 토큰 정확값, 임의 값 0 |
| `VG6-G-14` | G-7 UpdateNote 2줄 아이콘 첫 줄 정렬 (`VG6-E2-20` 해소) | `D6-9` ④ | `<p class="flex items-start">` + 아이콘 상자 `block-size: --text-footnote--line-height` 안 가운데 → 1줄 위치 불변 · 2줄은 첫 줄 중심 | `[code]` `ProfileResultView.tsx:121` · `child-profile-view.css:35` · H6-9.3 프로브 | — | OK (320 시각은 QA) |
| `VG6-G-15` | G-8 · G-9 문구 기록 | `VG6-B-11` *Please check this and try again.* 확정 · `VG6-C-09` 설정만 *Survey questions* / *Survey progress* | copy `child-profile-edit/copy.ts:37` · `survey-update/copy.ts:19-20` · 온보딩 덱 이름 불변(`SurveyCardDeck` `label` prop 기본값) | `[code]` | — | OK — **Spec §10.4 에 두 결정 기록 추가**(이번 패스) |
| `VG6-G-16` | `R-SHADOW-1` 새 언어 카드 | 번짐 = `--shadow-bubble` drop 1겹 `0 6 4` → 좌우 4 · 위 0 · 아래 10 (inset 2겹은 바깥 번짐 0) | 조상 overflow = `AppShell` 뷰포트 `overflow-y-auto` 하나(`AppShell.tsx:67`, Tailwind 유틸리티 — CSS grep 으로는 안 보임 `R-FIGMA-1` ④). 카드 x24 w345 → 좌우 거터 24 ≥ 4 · 세로는 스크롤 축 중간이라 클립 선 없음. `entities/child` · `child-profile-edit` · `ChildInfoStep` · `Surface` · `RadioGroup` 신규 overflow 0. Figma 노드의 `overflow-clip` 미이식 = 옳다(내용이 카드 안) | `[code]` grep (`overflow` 선언 0) | — | OK (세로·가로 프로브 재현은 QA — 기존 `e2e/shadow.spec.ts` 에 이 카드 항목 추가 여부 QA 판단) |
| `VG6-G-17` | G-4 · G-6 · G-11 (변경 0) | `D6-9` ④ 사용자 결정 | `VG6-E1-03` · `E1-14` · `E2-14` 가운데 정렬 유지 · `VG6-E2-19` 연도 유지 · `VG6-D-12` `navigate(-1)` Stage 8 전 앱 공통 결정(추적) | `D6-9` | — | OK — 사용자 결정으로 종결(design-agent 등록 아님). `VG6-D-12` 는 추적 유지 |
| `VG6-G-18` | baseline 메모 (H6-9.5) | `R-BASELINE-1` | ① `s2-onboarding-childinfo*` 는 element 가 뷰포트(852)보다 길어 y≈852 아래가 단색 — **HEAD 판도 같다**(1076→1126, 기존 상태 · 이 단위 원인 아님). 전체 하단(*Next*)은 baseline 이 보증하지 않는다. ② `v2-material` 98px Δ≤6 드리프트 HEAD 복원 — 원인 미확정 | `[bl]` HEAD 비교 · H6-9.5 | Low | QA 확인 — ① 하단 영역 비교 수단(스크롤 후 촬영 등) 필요 여부 ② `v2-material` 원인 분해. design-agent 결정 사항 아님 |
| `VG6-G-19` | (참고) 언어 선택지 목록 | `244:1327` 7개(English · Spanish · Korean · Chinese · Vietnamese · French · Another) | contracts `LANGUAGE_ENVIRONMENT_CODES` 9개(Tagalog · Arabic 포함, Chinese↔Korean 순서) — Stage 2 contracts 기존 목록. S6-G 변경 없음 | `[fig]` · `[code]` `contracts/src/onboarding/options.ts` | — | 기존 상태 기록만(이번 범위 밖). 결정 근거 문서 위치를 찾지 못했다 — 필요 시 plan-agent 확인 |

### 2. Handoff H6-9.6 deviation 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| ① | radius 30 → 28 | **USER_APPROVAL** (인계 사유 "30 토큰 없음" 정정 — `--reflection-card-radius` 30 존재) | `VG6-G-02` |
| ② | 카드 padding · legend gap | OK (정확값) | `VG6-G-03` |
| ③ | 칩 gap 7→8 · 행 gap 7→8 · 행 43→44 · fill → `surface-subtle` | OK (기존 승인 흡수) | `VG6-G-05` · `VG6-G-06` |
| ③ | 행 라벨 Semibold 14.5 → **Regular** 15 | **USER_APPROVAL** (Medium — 공통 recipe 기존 누락) | `VG6-G-07` |
| ④ | 칩 `outline` → `select` | OK | `VG6-G-05` |
| ⑤ | 섹션 라벨 tracking · weight | **USER_APPROVAL** (공통 SectionLabel) | `VG6-G-08` |
| ⑥ | `overflow-clip` 미이식 | OK | `VG6-G-16` |

### 3. 집계

- 차단(blocking) **0**
- `USER_APPROVAL` **5** — `VG6-G-07`(Medium, 행 라벨 weight) · `VG6-G-02`(Low, radius 30) · `VG6-G-04`(Low, backdrop blur 추가) · `VG6-G-08`(Low, SectionLabel 타이포) · `VG6-G-09`(Low, 라벨 세로 간격 Δ−5)
- QA 확인 **1** — `VG6-G-18`(Low)
- `OK` **13** — `-01` · `-03` · `-05` · `-06` · `-10` · `-11` · `-12` · `-13` · `-14` · `-15` · `-16` · `-17` · `-19`(기록만)
- 이전 항목 해소: `VG6-B-06`/`07` → `-01`·`-10` (구조) · `VG6-E2-09` → `-12` · `VG6-E1-12`/`E2-06`/`E2-07` → `-13` · `VG6-E2-20` → `-14` · `VG6-B-11` · `VG6-C-09` → `-15` · `VG6-E1-03`/`E1-14`/`E2-19` → `-17`
- Severity: Medium 1 (`-07`) · Low 5 (`-02` · `-04` · `-08` · `-09` · `-18`) · High · Critical 0

### 4. design-agent 자기 정정

- `VG6-B-06`/`07`(S6-B) 에서 Figma Answer card 를 "같은 recipe" 로만 적고 **행 라벨 weight(Semibold 590)** 를 대조하지 않았다. Stage 1 §4.17 도 weight 를 비워 두어 설문 카드부터 이어진 차이를 이번에야 찾았다 → `VG6-G-07`.
- `DESIGN_TOKEN_MAP` §radius 의 `corner radius/30 → --radius-card 흡수` 행이 Stage 5 `N5-28`(30 비흡수) 이후 갱신되지 않았다 — `VG6-G-02` 결정 후 design-agent 가 표를 맞춘다.

---

## S6-H

Author: design-agent (2026-11-18). ⛔ Production Code · Figma 수정 없음 · **Playwright 실행 안 함**. 판정 제안이며 허용 차이 등록은 사용자 승인 이후다 — `USER_APPROVAL` 항목은 design-agent 가 등록하지 않았다.

범위: `D6-10` ① ② ③ (`VG6-G-07` · `G-02` · `G-04` · `G-08` · `G-09`) 구현 — 인계 `docs/qa/stage-6-handoff.md` H6-10 · H6-10.6 확인 요청 4건 · 재생성 baseline 30장(`git status --short e2e/__screenshots__`).

### 0. 무엇을 어떻게 봤는가 (`R-FIGMA-1` ⑤)

| 표기 | 방법 | 대상 |
|---|---|---|
| `[fig]` | `get_design_context` **선언값** (렌더 픽셀 아님) | `244:1433`(→ `244:1314` · `244:1394` · `244:1313` · `244:1358` · `244:1427` · `244:1430`) · `320:1493` · `179:1788` · `179:1733` · `319:1503` |
| `[meta]` | `get_metadata` 자식 y·h | `244:1433`(섹션 y · 라벨 행 h34 · 내용 y35) · `179:1783`(설문 카드 자식 목록) |
| `[bl]` | 재생성 baseline PIL 열 스캔(x=40 · 172) · 글리프 행 탐지 · HEAD 판과 나란히 육안 비교 | `visual.spec.ts/s2-onboarding-childinfo.png` · `settings-child.spec.ts/{s6-settings-child,s6-settings}.png` · `session.spec.ts/s4-reading-context-sheet.png` · `visual.spec.ts/s2-deck-capability.png` |
| `[code]` | 저장소 직독 (`git diff`) | `packages/ui/src/{text/Text.{tsx,css},field/RadioGroup.css}` · `packages/design-tokens/src/component/index.css` `S6-H` 블록 · `entities/child/child.css` · `ChildInfoStep.tsx` · `ChildInfoEditForm.tsx` · `onboarding.css` · `docs/DESIGN_TOKEN_MAP.md` |

### 1. Gap 표

| ID | 항목 | Figma (선언값) | 구현 | Evidence | Sev | Verdict |
|---|---|---|---|---|---|---|
| `VG6-H-01` | `G-07` Answer card 행 라벨 weight | `179:1788` · `244:1394` · `320:1493` 행 라벨 전부 `SF_Pro:Semibold` `font-[590]` 14.5 (세 노드 직접 조회) | `.haru-radio-group--card .haru-radio-group__label { font-weight: var(--font-weight-semibold) }` = 590. card 변형만 — list 변형(Figma 없음) Regular 유지. 크기 14.5→15 는 Stage 1 §4.17 승인 흡수 그대로 | `[fig]` · `[code]` · `[bl]` `s2-deck-capability` HEAD↔신판(라벨만 굵어짐, 행 기하 불변) | — | **OK** — `VG6-G-07` 해소 |
| `VG6-H-02` | `G-02` 언어 카드 radius | `244:1314` `rounded-[30px]` | Tier 3 `--choice-card-radius: 30px` → `.haru-language-card`. `--reflection-card-radius`(30)와 서로 참조 안 함 — `VG6-G-02` 권고(재사용 비권고)와 일치. Semantic radius 불변 | `[fig]` · `[code]` `component/index.css` S6-H · H6-10.4 클러스터(모서리 4개만) | — | **OK** — `VG6-G-02` 해소 |
| `VG6-H-03` | `G-04` backdrop blur 제거 | `244:1314` 면 = `bg-[var(--glass-fill-strong)]` 단독 · effect = drop `0 6 4 #5E7370/8%` + inset 2겹, **BACKGROUND_BLUR 없음** | `.haru-language-card` = `--color-surface-strong` · `--shadow-bubble` · radius 30 · `backdrop-filter` 없음. `Surface` 컴포넌트 · 다른 사용처 불변 | `[fig]` · `[code]` `child.css` · H6-10.4(G-04 단독 토글 baseline 실패 0 — 매끈한 그래디언트 위라 Δ0, `VG6-G-04` 추정과 일치) | — | **OK** — `VG6-G-04` 해소 |
| `VG6-H-04` | `G-08` 섹션 라벨 타이포 | `244:1313` · `244:1358` · `244:1427` · `244:1430` · `179:1733` · `319:1503` 직접 조회 = 전부 `SF_Pro:Bold` 12 · `tracking-[0.72px]` · `#7d9291` (나머지 `179:1739` · `319:1510` · `319:1540` 은 인계 값 — 같은 recipe) | `Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label"` 11곳 + 독서 루틴 legend(CSS 직접, RadioGroup 이 legend 를 렌더하므로) — 같은 토큰 `--section-label-letter-spacing` 0.72px · bold 700 · `--color-fg-secondary`(ink-500 `#7d9291`). `tracking` modifier 가 variant 규칙보다 **뒤**에 선언돼 같은 특이도에서 이긴다(`Text.css` L76-81 vs L149-152). 잔여 semibold 섹션 라벨 0 (grep) | `[fig]` · `[code]` · `[bl]` `s6-settings` · `s2-onboarding-childinfo` | — | **OK** — `VG6-G-08` 해소. 라벨 **행 기하**(34 행)는 범위 밖 → `VG6-H-09` |
| `VG6-H-05` | `G-09` 언어 카드 → 독서 루틴 첫 행 | `[meta]` `244:1414` 끝 y569 → `244:1415` y587(gap 18) · 라벨 행 h34(텍스트 y10 h14) · 행 y35 → 카드 아래 → 첫 행 **53** · 글자 중심 **+35** | 섹션 gap 20 + `--child-routine-label-offset` 7 + caption-1 줄 16 + `space-2-5` 10 = 53. 실측: Step 1 카드 마지막 행 525 → 첫 행 579 (**53**) · 설정 아이 정보 537 → 591 (**53**) · *Reading routine* 대문자 글리프 556–565 → 중심 ≈560.5 = 카드 아래 +34.5 (Figma 35, 글리프 메트릭 ±0.5) | `[meta]` · `[bl]` x=40 · 172 열 스캔 · `[code]` | — | **OK** — `VG6-G-09` 해소. 7px 은 스케일 밖 값이지만 Tier 3 component 토큰 + 산식 주석으로 둔 것은 규칙(§6 "토큰이 없으면 component 토큰") 범위. 단 같은 화면 다른 섹션과 리듬이 갈라졌다 → `VG6-H-09` |
| `VG6-H-06` | `Text tracking` prop — Shared UI API 추가 (H6-10.6 ①) | — | `tracking?: 'section-label'` 1값 enum · `TextTracking` export · 클래스 `haru-text--tracking-section-label` → Tier 3 토큰. 도메인 개념(HARU 화면·데이터) 없음 — "섹션 라벨"은 타이포 역할 이름. 임의 수치 prop 아님(문자열 union) · 기본 미지정 시 변화 0(단위 테스트) | `[code]` `Text.{tsx,css}` · `Text.test.tsx` | — | **OK (권고: 수용)** — 조건: ① 자간 override 는 이 enum 으로만 늘린다(px/em 수치 prop 금지) ② 두 번째 tracking 값이 생기면 Tier 2 typography 토큰(`--text-*--letter-spacing` 계열)으로 올릴지 그때 재검토 ③ SectionLabel 컴포넌트를 만들지 않는다는 Stage 2 결정 유지. 대안(SectionLabel 컴포넌트 신설)은 같은 recipe 11곳 + 헤더 행(편집 버튼 동반) 변형까지 API 가 커져 지금은 비권고 |
| `VG6-H-07` | 부수 영향 — `SettingsMenu` 섹션 라벨 (H6-10.6 ②) | Figma 없음 (`C13-12`) | *YOUR CHILD* · *ACCOUNT* 가 Bold · 0.72 로 바뀜. 같은 앱의 다른 섹션 라벨과 일치, 레이아웃 변화 없음(글리프 폭만) | `[bl]` `s6-settings` | — | **OK (consequence)** — Figma 프레임 없는 화면이 공통 recipe 를 승계. 더 나빠진 점 없음 |
| `VG6-H-08` | 부수 영향 — Reading Context 시트 · 설문 "not seen" 행 (H6-10.6 ②) | 시트: Figma 없음 (`C13-15`) · 설문 *Haven't had the chance to see this yet* 행: `[meta]` `179:1783` 에 **노드 없음**(Figma 는 5개 행만) | ① 시트 1단계 행(*Now* … *Pick a time…*)이 Semibold — Answer card recipe 그대로, 잘림·줄바꿈 0. 2단계 시간 목록(list 변형)은 Regular 로 남아 **같은 시트 안 단계 간 weight 가 다르다**(list 변형은 Figma 없음 — 기존에도 시각 recipe 가 달랐다). ② 설문 not-seen 행이 Semibold 로 줄바꿈 위치가 *see this / yet* → *see / this yet* 로 이동(2줄 유지, 카드 높이 불변) | `[bl]` `s4-reading-context-sheet` · `s2-deck-capability` HEAD↔신판 | Low | **OK (consequence)** — 둘 다 Figma 프레임 없는 요소가 공통 recipe 를 승계한 결과이며 Figma 와 비교해 나빠진 지점은 없다. 사용자 결정 불필요 — 기록만 |
| `VG6-H-09` | 다른 섹션 라벨 행 기하 (`YOUR CHILD` · `ABOUT YOU` · `AT HOME`) — H6-10.6 ③, **`D6-10` 범위 밖** | `[meta]` 라벨 행 h34(pad 10 · 텍스트 14) → gap 1 → 내용. 섹션 gap 18. 앞 내용 아래 → 글자 중심 **35** · 글자 중심 → 내용 **18** · 합 **53**. `244:1426` YOUR CHILD 행에는 텍스트만(편집 아이콘 없음) | 섹션 gap 20(`AD-S2R-04` 승인 흡수) · 라벨 줄 16 · 라벨↔내용 `gap-2` 8 (ABOUT YOU · YOUR CHILD) / `gap-3` 12 (AT HOME). 아래 표 | `[meta]` · `[bl]` · `[code]` `ChildInfoStep.tsx` L172-262 · `ChildInfoEditForm.tsx` L168-179 · `onboarding.css` L58-65 | Low | **USER_APPROVAL** — 아래 §1.1 |
| `VG6-H-10` | `DESIGN_TOKEN_MAP.md` §5.2 radius 30 정정 | — | `corner radius/30` 행: "흡수하지 않는다 — `--reflection-card-radius` · `--choice-card-radius`, Stage 0 흡수 기록은 `N5-28` · `D6-10` 으로 대체" — `component/index.css` 주석 · `VG6-G-02` 권고와 일치. §3 SectionLabel · Answer card 라벨 기록도 선언값과 일치. **단 같은 문서 안 단계 수가 엇갈린다**: 새 행은 "Semantic radius 7단계(`L-OPEN-09`)" 인데 §5.2 머리말 L336 · 다음 행 L346(32 흡수) · 표 L51 · T-5 L463 은 "6단계". 실제 `semantic/radius.css` 는 7개(`indicator` 4 포함) | `[code]` `git diff docs/DESIGN_TOKEN_MAP.md` · `radius.css` L21-28 | Low | **OK — 충돌 해소 문구는 일관.** "6단계" 잔존 4곳은 `S6-H` 가 만든 것이 아닌 기존 낡은 표기(`L-OPEN-09` 이후 미갱신) — design-agent 가 다음 문서 패스에서 "7단계 (`L-OPEN-09` 로 indicator 추가)" 로 맞춘다(사용자 결정 불필요, 사실 정정) |

#### 1.1 `VG6-H-09` 실측 — 섹션 라벨 행 (`D6-10` 범위 밖, 사용자 결정 항목)

| 섹션 (화면) | 앞 내용 아래 → 글자 중심 (Figma 35) | 글자 중심 → 내용 위 (Figma 18) | 합 (Figma 53) | 실측 |
|---|---|---|---|---|
| `Reading routine` (Step 1 · 설정) | 35 | 18 | **53** ✓ | `VG6-H-05` |
| `AT HOME` (Step 1 · 설정) | 28 (Δ−7) | 20 (Δ+2) | **48 (Δ−5)** | 글자 중심 320 → 카드 위 341 = 21 (Step 1) · 332 → 353 = 21 (설정) — 글리프 메트릭 +1 |
| `ABOUT YOU` (Step 1) | 28 (Δ−7) | 16 (Δ−2) | **44 (Δ−9)** | 카드 아래 204 → 글자 중심 232 = 28 ✓ |
| `YOUR CHILD` (Step 1 표시 모드 — 편집 아이콘 헤더) | (첫 섹션) | **31 (Δ+13)** | — | 글자 중심 77 → 카드 위 108. 헤더 행 `min-block-size: --size-touch-min` 44 로 라벨이 44 행 가운데 — Figma `244:1426` 은 텍스트만 있는 34 행 (편집 아이콘은 Stage 2 §4.3 신호 ② 결정) |
| `YOUR CHILD` (설정 아이 정보 — 아이콘 없음) | (첫 섹션) | 19 (≈18) ✓ | — | 글자 중심 31 → 카드 위 50 |

분류: ① 섹션 gap 20↔18 은 승인된 흡수(`AD-S2R-04`)라 차이가 아니다. ② 실제 차이는 **라벨 행이 34 가 아니라 16(줄 높이)** 이라 라벨 위쪽 여백 10 이 없고, 라벨↔내용 간격이 섹션마다 8/12 로 다르다는 것. ③ `D6-10` 이 독서 루틴만 53 으로 맞춰서 **같은 화면 안에서 독서 루틴만 리듬이 다르다**(AT HOME 48 · ABOUT YOU 44 · 독서 루틴 53) — `S6-H` 가 만든 새 불일치는 아니지만 이번에 드러났다. ④ `ABOUT YOU` 내용이 Figma 카드(`244:1302` 341×67 + pill)가 아니라 맨 `SelectTrigger` 인 것은 기존 `VG6-B-06`/`07` 승계 사항 — 여기서 재제기하지 않는다.

선택지 (사용자 결정):
- **A (권고)** — 섹션 라벨 행을 **공통 recipe 하나**로 Figma 34 리듬에 맞춘다: 라벨 위 여백 = 독서 루틴과 같은 `--child-routine-label-offset` 7 을 공통 이름(예: `--section-label-offset`)으로 승격 · 라벨↔내용 `space-2-5` 10 통일 → 모든 섹션 53 · 글자 중심 35. 독서 루틴 전용 토큰은 공통 토큰으로 흡수. 영향: Step 1(온보딩 · 체험) · 설정 아이 정보 · 가입(`179:1733`/`1739`) · 프로필(`319:*`) · SettingsMenu(Figma 없음) baseline 재생성(`R-BASELINE-1` §5 분해). 가입·프로필은 적용 전 해당 Figma 행 기하를 같은 방식으로 실측해야 한다(이번에는 타이포만 확인)
- **B** — `YOUR CHILD` 편집 아이콘 헤더 행(44)은 Stage 2 결정 유지 — A 를 택해도 이 행만은 44 행 안 정렬을 별도로 정해야 한다(아이콘 hit 44 를 행 밖으로 넘기거나 현행 유지)
- **C** — 현행 유지(허용 차이 등록): AT HOME Δ−5 · ABOUT YOU Δ−9 · YOUR CHILD(아이콘) Δ+13, 독서 루틴만 Figma 값

### 2. Handoff H6-10.6 판정

| # | 내용 | 판정 | 근거 |
|---|---|---|---|
| ① | `Text tracking` prop 추가 | **OK (수용 권고, 조건 3)** | `VG6-H-06` |
| ② | `SettingsMenu` · `ReadingContextSheet` 공통 recipe 승계 | **OK (consequence)** — `D6-10` "같은 공통 스타일 포함" 해석 타당 | `VG6-H-07` · `VG6-H-08` |
| ③ | 다른 섹션 라벨 행 기하 미변경 | 차이 실재 — **USER_APPROVAL** | `VG6-H-09` |
| ④ | `--choice-card-radius` ↔ `--reflection-card-radius` 통합 여부 | **분리 유지 권고** (`VG6-G-02` 와 같은 근거 — 다른 노드 · 다른 의미). 결정 불필요 | `VG6-H-02` |

### 3. 집계

- 차단(blocking) **0** — `D6-10` 5건 전부 Figma 선언값과 일치(`VG6-H-01`~`-05`)
- `USER_APPROVAL` **1** — `VG6-H-09` (Low, 섹션 라벨 행 기하 · `D6-10` 범위 밖 · Stage 6 PASS 차단 아님 — 권고 A)
- `OK` **9** — `-01`~`-05` 해소 · `-06` API 수용 권고 · `-07` · `-08` consequence · `-10`(문서 사실 정정 1건 design-agent 후속)
- 해소: `VG6-G-02` · `G-04` · `G-07` · `G-08` · `G-09` → `VG6-H-02` · `-03` · `-01` · `-04` · `-05`
- Severity: Low 3 (`-08` · `-09` · `-10`) · Medium 이상 0

### 4. design-agent 자기 정정

- `VG6-G-09` 에서 "다른 섹션 라벨도 Figma 34 행과 다르다 — `G-08` 과 함께 결정 권고" 라고만 적고 **섹션별 수치와 선택지를 제시하지 않아** `D6-10` ③ 이 독서 루틴 하나만 정하게 됐다. 그 결과 같은 화면 안에 리듬이 갈라졌다 → `VG6-H-09` 에서 섹션별 실측과 공통 recipe 안으로 다시 제시한다.
