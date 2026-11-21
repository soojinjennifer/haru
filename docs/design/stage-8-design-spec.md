# Stage 8 Design Spec — 설정 확장 · 데이터 관리 · 세션 녹음 삭제 · 전체 삭제 · 계정/탈퇴 · 기기 draft 삭제 · Final QA 감사 기준

Status: **APPROVED (2026-11-20, user)** — `D8-1` (`docs/decisions/stage-8-approvals.md`).

Based on:
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — **라이브 조회 2026-11-20** (`mcp__8c8226df…` 커넥터). 조회 범위·방법은 §0.1. **Plan §0.1 의 "라이브 실측 NOT VERIFIED" 를 이 절로 대체한다** (`N8-30` 해소 — 커넥터가 이 세션에서 동작함)
- Plan `docs/plans/stage-8-plan.md` **rev 2.1 (APPROVED 2026-11-20, `D8-1`)** — 본문은 초판(DRAFT 2026-11-20) 기준으로 작성. rev 2 = 이 Spec `M8-1`~`M8-6` 을 Plan 에 반영한 정합화 · rev 2.1 = `S8-0` 부록 B(`N8-21` 처분표, 범위 변경 0). rev 2.1 의 사용자 결정 B.2-①(로그아웃 다이얼로그 미업로드 녹음 안내)은 **`D8-2` 로 닫힘 — 현행 유지, 문구 추가 0** (개정 이력 `D8-2` ④) · rev 2.2 §5.7 `N8-31` = `D8-2` ⓐ 채택(§2.5) · §16 C-13 9건 · §17 Handoff · 결정 후보 `N8-01`~`N8-30` · 작업 단위 `S8-0`~`S8-K`
- 결정 기록 `docs/decisions/stage-0-approvals.md` (**C-13 · C-15 · C-16 · C-18 · C-19** · D-01 · P-01~P-16) · Stage 6 `D6-10` · Stage 7 `D7-7`
- 형식 선례 `docs/design/stage-7-design-spec.md` · Stage 6 설정 recipe `docs/design/stage-6-design-spec.md` §2.0 · §2.4 · §2.7 · Visual Gap `docs/design/stage-6-visual-gap.md` §1.1 (`VG6-H-09`) · `VG6-H-06` · `VG6-D-12`
- 저장소 (읽기만): `packages/ui/src/**` (`ConfirmDialog` · `Dialog.css` destructive · `ListGroup`/`ListRow` · `InlineAlert` · `Toast` · `Skeleton` · `ErrorState` · `EmptyState` · `Button` · `Tag` · `TopBar` · `icon/registry.ts`) · `packages/design-tokens/src/semantic/color.css` · `component/index.css` · `apps/web/src/features/settings/**` · `features/onboarding-survey/ui/OnboardingSaved.tsx` · `packages/contracts/src/{me/me.ts, sessions/session.ts, enums/deletion.ts, enums/upload-status.ts}`

Author: design-agent. ⛔ Production Code · Figma 수정 없음. 신규 컴포넌트 **0** · 신규 토큰 **0** · 신규 아이콘 **0** (§4 · §5). 구현은 development-agent (승인 후).

### 개정 이력

| 개정 | 날짜 | 내용 |
|---|---|---|
| 승인본 | 2026-11-20 | `APPROVED (2026-11-20, user)` — `D8-1` |
| `VG8-A-03` | 2026-11-20 | `H8-1-N1` — `ACCOUNT_DELETION_PENDING` 제목 = *Changes are paused* 확정 · 표면 규칙(2줄 표면 = 제목+설명, 자체 제목 표면 = 설명만). 승인 문구(설명) 변경 0 (§2.9 · §10.4, 근거 `stage-8-visual-gap.md` §3.1) |
| `VG8-A-04` | 2026-11-20 | `H8-1-N2` — `recordingsCount` = 삭제 가능한 녹음 수(`deleted`·`expired` 제외) · 0 일 때 목록 ≠ 빈 상태일 수 있음 (§2.2, 근거 `stage-8-visual-gap.md` §3.2). 후속: contracts 주석 · Mock · `API_CONTRACTS` ④ = development-agent, Plan §8 문구 = plan-agent |
| Based on | 2026-11-20 | Plan 기준 표기 초판 → **rev 2.1** |
| `VG8-B-07` | 2026-11-20 | `H8-2-N1` — 행 삭제 실패 · 오프라인 `InlineAlert` 설명 원문 확정(§10.3 — 제목+날짜로 행 특정). 근거 `stage-8-visual-gap.md` S8-B §3.1. `VG8-B-08`(§8.1 320 행 규칙)은 사용자 결정 후 개정 |
| `VG8-C-04` | 2026-11-20 | `H8-3-N2` — 요청 실패 · 오프라인 `InlineAlert` 은 **action 0 확정**(재시도 = 바로 아래 *Delete all data* 행 → Dialog ② 재확인). §2.2 주석 추가. Plan §5.3 "(재시도 버튼)" 문구 정정은 plan-agent. 근거 `stage-8-visual-gap.md` S8-C §3.2 |
| `VG8-C-05` | 2026-11-20 | `H8-3-N3` — 전체 삭제 요청 실패(오프라인 아님) 설명 원문 *Nothing was deleted. You can try again.* (§10.2 — 제목 = 기존 `errorCopyForCode`). 근거 S8-C §3.3 |
| `VG8-C-08` · `VG8-C-09` | 2026-11-20 | `H8-3-N4` — §2.9 "Toast 0" = **새 Toast 금지**의 뜻으로 명확화. 기존 Toast 실패 표면도 쓰기 차단 대상이며, Toast(1줄 표면)는 **설명만** 쓴다(제목+설명 이어 붙이기 금지 — "paused" 반복). 근거 S8-C §3.4 |
| `VG8-C-12` | 2026-11-20 | `H8-3-N5` — 진행 중 · 실패 요청의 `scope='account'` 문구 추가(§2.5 · §10.2). `S8-D` 구현. 근거 S8-C §3.6 |
| `VG8-D-03` · `VG8-D-04` | 2026-11-20 | `H8-4-N2` · `H8-4-N3` — 탈퇴 요청 실패(오프라인 아님) 설명 *Nothing was deleted. You can try again.* (`VG8-C-05` 와 같은 축) · *이미 요청* 알림을 제목 + 설명 2줄 표면으로 분리(단어 변경 0). §10.4. 근거 `stage-8-visual-gap.md` S8-D §3 |
| `D8-2` ① `N8-31` ⓐ | 2026-11-21 | 화면 밖 전체 삭제 완료 = **앱 전체에서 감지**(`app/providers` 감시자 1곳 — Plan rev 2.2 §5.7). 화면(`/settings/data`)은 **상태 표시만**(정리 0). Toast 는 감시자가 **1회** — 화면 안 완료와 **같은 문구** *Your data was deleted.* · 도착 화면 = Guard 판정 = **온보딩 `/onboarding/start`**(`243:1147` — 정리로 draft 0 → resume 없음). §2.5 · §6.1 · §10.2. 다른 기기 잔여(R8-15) = Handoff 한계 |
| `D8-2` ② `metaWrap` | 2026-11-21 | `VG8-B-08` 결정 — `ListRow` opt-in `metaWrap`(기본 off). **안 들어가면 meta 가 subtitle 아래 다음 줄로 통째로 내려간다**(meta 열 안 줄바꿈 아님). 녹음 목록만 사용. §2.3 · §3 · §6.1 · §8.1 정정 · `COMPONENT_MAP.md` 등재. 실측 근거 `stage-8-visual-gap.md` §3.2 |
| `D8-2` ③ `VG8-D-07` | 2026-11-21 | 기기 draft 삭제 링크 노출 화면에 **`/onboarding/start`(`243:1147`) Trial 안내 아래** 추가 — Step 1 과 같은 규칙(최우선 규칙 2 사용자 승인). §2.7 |
| `VG8-F-04` · `VG8-F-06` · `VG8-F-07` | 2026-11-21 | `S8-F` Visual Gap — §11.1 A 영향 "설정 아이 정보 +5" → **+7** 정정(첫 섹션 라벨 ↔ 내용 8→10 의 +2 누락). 가입(`179:1730` 선언값: 섹션 gap 10 · 라벨 행 ↔ Input gap 0 → 17/42/74) · 프로필(`319:*` = C13-09 DRAFT 카드 eyebrow) 은 **실측 결과 A 미적용**. "모든 섹션 53/35"(섹션 gap 16 화면 = 31/49)은 `VG8-F-05` 결정 후 개정. 근거 `stage-8-visual-gap.md` S8-F |
| `D8-2` ④ B.2-① · `P-42` | 2026-11-21 | Plan B.2-① 로그아웃 확인 창 미업로드 녹음 안내 = **현행 유지, 문구 추가 0 — 닫음**. `P-42` 삭제 폴링 5s × 60 = **가값 유지**(provisional — Final QA 가값 재제시 대상). §5.3 |
| `D8-3` | 2026-11-21 | S8-F · S8-G Visual Gap 결정 반영 (`stage-8-visual-gap.md` S8-F §3 · S8-G §3). ① `VG8-F-05` §11.1 "모든 섹션 53 / 35" **서술 정정** → 라벨 중심 → 내용 18 불변 · 앞 → 중심 = 섹션 gap + 15 (gap 16 화면 31 / 49 현행, 값 변경 0) · §13 `S8-F` 행 ② 허용 차이 장부 **§12.5 신설** — `AD-S8-01`(`VG8-F-09` Δ+13) · `AD-S8-02`(`VG8-F-06` Δ−1/−2) · `AD-S8-03`(회고 입력칸 40) · `AD-S8-04`(`H8-6-N5` 조건부) ③ `H8-6-N1` 리포트 카드 링크 `aria-label` 제거 — §9.4 · **Stage 7 Spec `N7-37` 이름 행 개정** ④ `H8-6-N4` `TextLink` 터치 확장 opt-in 옵션 · 회고 입력칸 예외 — §9.3 · Stage 2 Spec §4.6 ⑤ `H8-6-N5` §8.2 통과 기준에 "설계된 줄 수 제한 = 전체 텍스트 경로 대조표" 추가 ⑥ `H8-6-N3` 가값 **`P-43`** §5.3 · 요청서 `R8-7` §12.3 ⑦ `VG8-B-12` Dialog blur **닫음** §12.5 ⑧ `VG8-G-02` 선택 시트 Esc 유지 동작 = Stage 2 Spec §4.1 (개정 7). 녹음 버튼 이름(`H8-6-N2`)은 §9.4 에 기록만 — Stage 4 Spec §2.6.3 개정은 별도 |
| `D8-4` | 2026-11-21 | S8-H · S8-I 결정 반영 — ① §12.3 `R8-8` 신설(데모용 중립 표지 디자이너 요청 · 현행 단색 유지, `VG8-I-02` 닫음) ② 일시정지 녹음 버튼 이름 *Tap to resume, Resume recording* 은 Stage 4 Spec §2.6.3 · 4b Spec §9.1 에 개정 표기(이 Spec 본문 변경 0). 근거 `stage-8-visual-gap.md` S8-H |

> ⚠️ **전 화면 C-13 (`N8-01`)** — Stage 8 신규 화면은 Figma 디자이너 프레임이 **0** 이다 (§0.2 실측). 아래 §2 명세는 전부 **design-agent 명세**이며, 시각 언어는 **기존 Figma 근거가 있는 recipe(`163:2145` 목록 행 · `17:20` Button · `321:1537`·`321:2203` Stage 6 DRAFT 시각화로 확인된 설정 목록·ConfirmDialog) 와 기존 Shared UI 조합으로만** 만든다. **화면마다 사용자 승인이 필요하다** (`Q8-01`). 디자이너 프레임이 들어오면 최우선 규칙에 따라 Figma 로 교체한다 (`R8-01`).

---

## 0. 측정 방법과 결과 요약

### 0.1 측정 방법 (`R-FIGMA-1` ⑤ — 무엇을 어떻게 쟀는가)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[pages]` | `get_metadata` (nodeId 없음) | 문서 페이지 목록 — `8:2` Design Guide · `16:2` MVP_KeyScreen_V.2 · `125:765` MVP_KeyScreen V.1 · `66:202` Signup & Baseline Survey · `0:1` Page 1 (**5페이지 전부**) |
| `[meta]` | `get_metadata` 페이지별 전체 XML (16:2 = 198,761자 · 125:765 = 94,545자 → scratchpad 저장 후 python 으로 깊이 2 목록 + 이름 키워드 grep) | 키워드(대소문자 무시): `delet` · `data` · `account` · `privacy` · `consent` · `setting` · `withdraw` · `remove` · `retention` · `trash` · `log out` · `logout` · `confirm` · `dialog` · `alert` · `toast` |
| `[ctx]` | `get_design_context` — **선언값** | `321:1537` (설정 목록 DRAFT 시각화) · `321:2203` (ConfirmDialog destructive DRAFT 시각화) |
| `[직독]` | 저장소 파일 | 위 Based on 목록 |

렌더 PNG 는 배치 확인 용도만 — 색·그림자·크기는 선언값에서 읽었다.

### 0.2 결과 — **Stage 8 대상 디자이너 프레임 0** `[pages][meta]`

| 페이지 | 최상위 구성 (깊이 2) | 키워드 일치 |
|---|---|---|
| `16:2` | Section `31:204` Home & Session · `179:1700` Signup & Baseline · `296:1127` Recording(DRAFT 포함) · **`317:1358` Stage 6 — DRAFT (design-agent spec, 사용자 승인 전)** — 2026-11-19 기록(Stage 7 Plan §0.1)과 **같은 구성, 새 Section 0** | 디자이너 프레임 일치 **0**. 일치는 전부 `317:1358` DRAFT 안 — `321:1537` 설정 목록 · `321:1640`/`321:1771` ListGroup "Account" · `321:1666`/`321:1797` ListRow "Log out" · `321:2203` ConfirmDialog destructive · `321:2209` confirm destructive(P-04) · `321:2202` scrim(alert-overlay) · `321:1799`·`323:2092` Toast success · `321:2063`·`320:1935`·`320:2319`·`323:1951` InlineAlert error · `323:1961` ErrorState. 그 외 `179:1722`·`179:1745`(약관 문구) · `179:1724`/`179:1729`/`179:1847`(Create account) — 가입 화면 문구이며 관련 없음 |
| `125:765` V.1 | `125:771` Home & Session (Home · Session · Library ×2 · Report · Ready/Recording) | **0** |
| `66:202` | `163:2786` Signup & Baseline (구판) | **0** (`69:114` · `69:147` 약관 문구만) |
| `0:1` | 캐릭터 · 구판 Session/Home · Prompt Card · Activity card | **0** |
| `8:2` | `17:366` Foundations · `17:367` HARU Components · `17:368` iOS 26 Components · 캐릭터 | 전용 컴포넌트 **0** (데이터 관리 · 삭제 · destructive 버튼 · 목록 그룹 없음) |

**결론**: 데이터 관리 · 녹음 삭제 · 전체 삭제 · 계정/탈퇴 · 동의 이력 · 설정 화면의 **디자이너 프레임은 없다.** 설정 계열 노드는 전부 design-agent 가 만든 Stage 6 DRAFT 시각화(`317:1358`)이며 **디자이너 근거가 아니다** (`stage-6-figma-draft.md`). DRAFT 에도 데이터 관리 · 탈퇴 행은 없다.

### 0.3 재사용 근거 노드 실측 (선언값) `[ctx]`

| 노드 | 선언값 | 저장소 대응 (변경 0) |
|---|---|---|
| `321:1537` TopBar | Back = `78:157` Button `Icon=Back` 38 · glass-fill 74% · drop `0 6 4 ink8%` + inset 2겹 · 제목 "Settings" **Semibold 15/20 `text-primary` 가운데** | `TopBar variant="centered"` + `IconButton` Back (`SettingsTopBar`) |
| `321:1592` content | x24 · y124 · w345 · **flex col gap 16** | `SettingsMenu` `flex flex-col gap-4 py-6` (구현은 섹션 안 라벨↔그룹 `gap-2` 8 — DRAFT 시각화와 다름, `VG6-H-09` 와 같은 축 → `Q8-15`) |
| `321:1593` 섹션 라벨 | **SF Pro Bold 12 · tracking 0.72 · `#7d9291`** | SectionLabel recipe = `Text caption-1 · secondary · bold · tracking="section-label"` (`VG6-H-04` OK) |
| `321:1594` ListGroup | pad-x 16 · **radius 22** · fill `glass-fill-strong` 90% · drop **`0 6 4 ink 8%` 1겹** + inset 2겹 (Style 이름은 `HARU/Shadow Rest` 5겹이지만 인스턴스는 drop 1겹 — `R-FIGMA-1` ②) | `ListGroup` · `--shadow-bubble` |
| `321:1620` ListRow | **h56** · py12 · gap12 · 제목 **Semibold 15/20 `text-primary`** · chevron-right 16 (fg-tertiary, decorative) · divider 1px `stroke` 18% | `ListRow` basic(56) · `Icon chevron-right sm` |
| `321:1666` ListRow "Log out" | 동작 행 — chevron **없음**, 라벨 색 `text-primary` (빨강 아님) | 기존 그대로 (`settingsCopy.logOut` 주석 — WCAG 1.4.1) |
| `321:2203` ConfirmDialog destructive | pad 24 · **radius 28** · gap 12 · fill white 90% + blur 12 · 제목 **Semibold 17** · 설명 **Regular 15/20** `text-primary` · spacer 4 · confirm = **`error-bg` 채움 + 1px `error-border` + `error-fg` 라벨 Semibold 17 pill** (P-04) · cancel = Button glass md · **순서 confirm → cancel** | `ConfirmDialog destructive` (`Dialog.css` L51-58 `provisional: P-04`, 초기 포커스 = 취소) — **Stage 8 삭제·탈퇴 확인은 이 컴포넌트 그대로** (주석 "사용처: … Stage 8 삭제·탈퇴" 가 이미 있다) |
| `17:20` Button | Variant Glass / Accent × State 9종 | `Button` `accent` · `glass` · `neutral` × `sm`/`md`/`lg` |
| `76:440` Tag | Color = green · cyan · pink · purple (+icon) · Boy/Girl · Not selected | `Tag tone` = capability 4 + `neutral` — **status tone 없음** (Plan §0.1 의 "Tag(status)" 는 저장소에 없다 → `M8-3`) |
| `17:292` misc/alert-overlay | scrim | `--color-scrim` (Dialog) |

---

## 1. 대상 화면 (C-13 9건 — 전부 design-agent 명세, 화면별 승인 필요)

| ID | 화면 / 상태 | Route | Page (Plan §5.1 RECOMMENDED) | Feature | Figma | 승인 |
|---|---|---|---|---|---|---|
| `C13-S8-1` | 설정 목록 확장 — `ACCOUNT` 그룹 행 추가 | `/settings` | SettingsPage (기존) | `settings` (행 구성 `menuRows.ts`) | DRAFT `321:1537` 시각화만 | ⛔ `Q8-02` |
| `C13-S8-2` | 데이터 관리 — 보관 정책 · 녹음 목록 진입 · 전체 삭제 · 진행 상태 | `/settings/data` | DataManagementPage | `data-management` | 없음 | ⛔ `Q8-03` |
| `C13-S8-3` | 세션 녹음 목록 · 행 상태 5종 · 빈 상태 | `/settings/data/recordings` | RecordingListPage | `recording-deletion` | 없음 | ⛔ `Q8-04`~`07` |
| `C13-S8-4` | 삭제 확인 다이얼로그 3종 (세션 녹음 · 전체 데이터 · 계정) | (부모 route 위) | — | 각 feature | `321:2203` 시각화 = 기존 컴포넌트 | ⛔ `Q8-13` |
| `C13-S8-5` | 전체 삭제 진행 상태 (received · processing · completed · failed · already requested) | `/settings/data` 안 | — | `data-management` | 없음 | ⛔ `Q8-08`·`09` |
| `C13-S8-6` | 계정 — 이메일 · 탈퇴 진입 · 확인 · 탈퇴 후 1회 안내 | `/settings/account` | AccountPage | `account-deletion` | 없음 (탈퇴 후 안내는 `179:1701` 위에 뜬다) | ⛔ `Q8-10`·`11` |
| `C13-S8-7` | 미가입 기기 draft 삭제 진입 · 확인 | `/onboarding` · Step 1 (Trial 안내 아래) | — | `device-data` | 없음 (C13-11 Trial 안내 확장) | ⛔ `Q8-12` |
| `C13-S8-8` | 동의 이력 (선택 — `N8-06` ⓐ 시에만) | `/settings/privacy` | ConsentHistoryPage | `consent-history` | 없음 | `Q8-20` |
| `C13-S8-9` | 공통 상태 (Loading · Error · Offline · 쓰기 차단) — 신규 화면 | 위 전부 | — | — | 없음 (#22 명세 우선) | ⛔ `Q8-01` |

대상 외 — **UI 영향 없음 확인**: `S8-A`(contracts·Mock) · `S8-I`(프리뷰 빌드) · `S8-J`(Handoff) · `VG6-D-12` Back fallback(`N8-14` — 시각 변화 0, §6.3).

---

## 2. 화면별 레이아웃

### 2.0 공통 규칙 (Stage 6 §2.0 승계 — 값 변경 0)

| 항목 | 값 | 근거 |
|---|---|---|
| 셸 | `StackLayout` + `TopBar variant="centered"` 제목 + leading Back `IconButton`(glass 38 / hit 44) · 탭바 없음 | `321:1537` · `SettingsTopBar` 선례 |
| 좌우 거터 | `--layout-gutter` 24 | `P-13` |
| 본문 세로 | `flex col` · 섹션 간격 `--space-4` 16 · 위아래 `--space-6` 24 (`SettingsMenu` 와 같은 값) | `[직독]` |
| 섹션 라벨 | SectionLabel recipe (`caption-1 · secondary · bold · tracking section-label`) — 컴포넌트 신설 0 · **라벨↔내용 간격은 `Q8-15` (`VG6-H-09`) 결과를 따른다**. 결정 전 기본 = 현행 `gap-2` 8 | `VG6-H-04` · `VG6-H-09` |
| 목록 | `ListGroup label=` + `ListRow` basic(56) · 이동 행 = trailing `chevron-right` 16 decorative · **동작 행 = chevron 없음** | `321:1594` · `321:1666` |
| 설명 문장 | `Text variant="footnote"`(13/18) **`tone="primary"`** — 배경(그래디언트) 위 보조색 ink-500 은 2.0~2.72:1 로 AA 미달 (Stage 6 §2.0 `[계산]`) | Stage 6 §2.0 |
| 파괴적 행위 | **행 라벨은 `text-primary` (빨강 0)** · 경고·범위는 `ConfirmDialog destructive` 가 전달 · 확인 버튼 = error-bg 채움 + 테두리 + 라벨 (색 + 모양 + 문구 3중, WCAG 1.4.1) | `321:2203` · `settingsCopy.logOut` 원칙 · Plan §17-3 |
| 오류·성공 표면 | Stage 6 §2.7 표 그대로: 저장/요청 실패 = 실행 지점 위 `InlineAlert` · 조회 실패 = `ErrorState` · 성공 + 이동 = `Toast` · Loading = `Skeleton` | Stage 6 §2.7 |
| 문구 | 영어 · 진단·판정·비교 0 · **기한·수치 0** (보관 일수만 응답 값) · 아이 이름 = first name | `N8-04` · §10 |
| 신규 `overflow` | **0** — 목록은 문서 스크롤(`AppShell` 뷰포트) 안 흐름 배치 | `R-SHADOW-1` ① |

### 2.1 `C13-S8-1` 설정 목록 `/settings` — `ACCOUNT` 그룹 확장

```
SettingsMenu (기존 flex col gap-4 py-6)
├─ SectionLabel "YOUR CHILD"  → ListGroup "Your child"   (기존 4행 — 변경 0)
├─ SectionLabel "ACCOUNT"
└─ ListGroup label="Account"
    ├─ ListRow "Data & privacy"   trailing chevron-right → /settings/data        🆕 (이동 행)
    ├─ ListRow "Account"          trailing chevron-right → /settings/account     🆕 (이동 행)
    └─ ListRow "Log out"          (동작 행 — chevron 없음, ConfirmDialog — 변경 0)
   [N8-06 ⓐ 시] "Consent history" 행을 "Data & privacy" 다음에 → /settings/privacy
```

| 항목 | 명세 | 결정 |
|---|---|---|
| 순서 | **이동 행 먼저, 동작 행(Log out) 마지막** — 같은 그룹 안에서 chevron 유무가 섞이는 구간을 1곳(끝)으로 모은다 | `Q8-02` |
| 라벨 | *Data & privacy* · *Account* (Plan 가칭 유지 — 보관 정책 안내를 포함하므로 "Data" 단독보다 범위가 맞다) | `Q8-02` · `N8-01` |
| 행 구성 위치 | `menuRows.ts` 에 `ACCOUNT_SETTINGS_ROWS` (이동 행만) 추가 — Log out 은 기존처럼 화면이 직접 렌더 | Plan §5.1 · AC-8-13 |
| subtitle | 없음 (Stage 6 `N6-38` 원칙 유지 — 목록이 데이터에 의존하지 않음 → Loading/Error 없음) | — |
| 회귀 | `YOUR CHILD` 4행 · Log out 동작 · Stage 6 baseline 은 ACCOUNT 그룹 높이 증가분 외 diff 0 | AC-8-14 |

### 2.2 `C13-S8-2` 데이터 관리 `/settings/data`

```
StackLayout  TopBar centered "Data & privacy"  leading Back (→ N8-14 부모 /settings)
└─ DataManagement (features/data-management)   flex col gap-4 py-6
   ├─ [진행 중 요청 있음] DeletionStatusAlert   (§2.5 — 최상단, 상태가 바뀌면 이 자리에서 교체)
   ├─ section
   │   ├─ SectionLabel "RECORDINGS"
   │   ├─ Text footnote primary  보관 정책 문장 (§10.2 — {rawAudioDays} = 응답 값)
   │   └─ ListGroup label="Recordings"
   │       └─ ListRow "Session recordings"  subtitle "{n} recordings"  chevron → /settings/data/recordings
   └─ section
       ├─ SectionLabel "DELETE DATA"
       ├─ Text footnote primary  영향 안내 (§10.2 — 지워지는 것 / 남는 것 · N8-02 ⓐ 기준)
       ├─ [실패 · 오프라인] InlineAlert tone="error" | "offline"   (요청 버튼 바로 위)
       └─ ListGroup label="Delete data"
           └─ ListRow "Delete all data"   (동작 행 — chevron 없음) → ConfirmDialog (§2.4-②)
```

| 항목 | 명세 | 결정 |
|---|---|---|
| 섹션 내부 간격 | 라벨 → 설명 → ListGroup 을 같은 섹션 `gap` 으로 — 값은 `Q8-15` 결과를 따르고, 설명↔ListGroup 은 `--space-3` 12 (가값 `P-41`) | `P-41` |
| 보관 일수 | **응답 `retentionPolicy.rawAudioDays` 만** — 화면·copy 에 `90` 리터럴 0 · 복수형은 copy 함수 | AC-8-15 |
| *Session recordings* subtitle | `recordingsCount` = **삭제 가능한 녹음 수**(`uploadStatus` ∈ `uploaded`·`pending`·`failed` — `deleted`·`expired` 행 제외). 0 이면 *No recordings* (행은 유지). 이동한 목록은 행 0 일 때만 빈 상태(§2.3.3) — `deleted`·`expired` 행만 있으면 그 행들을 보여준다. 행 삭제 후 요약 재조회로 숫자가 줄어든다 (`VG8-A-04`) | AC-8-19·20 |
| 전체 삭제 진입 | **동작 행** (Log out 과 같은 idiom) — 큰 Button 을 두지 않는다. 화면 주 CTA 가 "삭제" 가 되지 않게 하고 기존 시각 언어 안에 둔다 | `Q8-03` |
| 진행 중 요청이 있을 때 | *Delete all data* 행 **비활성(`disabled`)** + 상단 상태 알림이 이유를 전달 (행 자체에 사유 문구 0 — 중복 낭독 방지) | `Q8-08` |
| 요청 중 | ConfirmDialog 확인 버튼 `confirming`(loading) · 연타 무시 · 다이얼로그는 응답 후 닫힘 | AC-8-26 |
| 요청 실패 · 오프라인 `InlineAlert` (`VG8-C-04`) | **action 0** — 다시 시도 = 바로 아래 *Delete all data* 행(활성) → Dialog ② **재확인**. 알림 안 *Try again* 은 파괴적 요청을 확인 없이 다시 보내거나, 같은 Dialog 를 여는 두 번째 진입점이 된다. 서버 `failed`(§2.5)만 *Try again* 을 갖는 이유 = 알림이 화면 최상단이라 행과 떨어져 있다 | `H8-3-N2` |

### 2.3 `C13-S8-3` 세션 녹음 목록 `/settings/data/recordings`

```
StackLayout  TopBar centered "Session recordings"  leading Back (→ /settings/data)
└─ RecordingList (features/recording-deletion)   flex col gap-4 py-6
   ├─ Text footnote primary  범위 안내 1문장 (§10.3 — N8-03 ⓐ)
   ├─ [행 삭제 실패 · 오프라인] InlineAlert tone="error" | "offline"   (목록 위, 해당 행 이름 포함)
   ├─ ListGroup label="Session recordings"
   │   └─ ListRow ×N  (onPress 없음 — trailing 이 인터랙티브)
   │        title    = 책 제목 | "Storytime" (book = null)
   │        subtitle = "{Mon D} · {m} min"        (completedAt ?? readyAt · recordedSeconds)
   │        meta     = 상태 텍스트 (§2.3.1)
   │        metaWrap = true   (`D8-2` ② — 이 목록만. 규칙 §8.1)
   │        trailing = Button glass sm "Delete"   (삭제 가능 상태만)
   └─ [다음 cursor 있음] TextLink "Show more"   (Stage 7 과거 리포트 목록 `N7-38` 선례)
```

#### 2.3.1 행 상태 (`uploadStatus` → 표시) — 색 단독 의존 0

| `recording.uploadStatus` | meta 문구 | trailing | 비고 |
|---|---|---|---|
| `uploaded` | *Saved* | *Delete* | 기본 |
| `pending` | *Uploading* | *Delete* | 로컬 청크 존재 가능 → 서버 확정 후 로컬 삭제 · UploadQueue 취소 (AC-8-23) |
| `failed` | *Not uploaded yet* | *Delete* | 같은 규칙 |
| `expired` | *Removed after {n} days* | **없음** | `{n}` = `rawAudioDays` (응답 값 — 수치 리터럴 0) · AC-8-25 |
| `deleted` | *Deleted* | **없음** | 방금 삭제한 행도 목록에서 빼지 않고 이 상태로 바꾼다 (위치 이동 0 → 포커스 잃지 않음) |

- meta = `ListRow.meta`(보조 행 우측) `tone` 은 기존 그대로(`text-secondary` 계열 — 카드 위 대비 `P-01` 범위, §9.3).
- **Tag 를 쓰지 않는다** — `Tag` 에 status tone 이 없고(capability 4 + neutral), 상태 색을 새로 만들면 새 시각 언어다 (`Q8-05`).
- **썸네일 없음** — Library `media` 행(74) 을 쓰지 않는다 (`Q8-04`: 설정 문맥의 밀도 · `book = null` 행 · 상용 표지 노출 `N8-13` 과 독립).

#### 2.3.2 행 삭제 흐름

```
Delete 탭 → ConfirmDialog destructive (§2.4-①) → 확인 → Button(행) loading 아님 · Dialog confirm loading
  → 성공: 행 meta = "Deleted", trailing 제거 → 포커스 = 그 행의 제목 텍스트 대신 **ListGroup 다음 포커스 가능 요소가 아니라 행 자체**(tabIndex -1 로 일시 포커스) · Toast 없음 (행 변화 + live 1회 §9.1)
  → RECORDING_DELETED: 성공과 같은 표시 (오류 아님, AC-8-24)
  → 실패 · 오프라인: Dialog 닫힘 · 목록 위 InlineAlert · 행 변화 0 · 로컬 보존 · 포커스 = 해당 행 Delete
  → 취소: 요청 0 · 포커스 = 해당 행 Delete (AC-8-21)
```

| 항목 | 명세 | 결정 |
|---|---|---|
| 삭제 컨트롤 | **trailing `Button variant="glass" size="sm"` 텍스트 *Delete*** — 아이콘 전용(trash) 은 registry 에 글리프가 없고(신규 등록 필요), 텍스트가 의미를 직접 전달 | `Q8-06` |
| 접근성 이름 | 시각 라벨 *Delete* 를 포함한 이름 *"Delete recording, {title}, {date}"* (WCAG 2.5.3 label-in-name). `Button` 이 `aria-label`/`aria-describedby` 를 받지 못하면 development-agent 가 **보고**(Shared UI API 확장 = 승인 대상) | §9.1 |
| expired / deleted 행 | **목록에 남긴다** (상태 표시) — 사라지면 "녹음이 어디 갔는지" 를 설명할 곳이 없다 | `Q8-07` |
| 빈 상태 | §2.3.3 | AC-8-20 |

#### 2.3.3 빈 상태 (`data-management:empty` · `D4-40` AC-4-23 화면 부분)

`EmptyState icon="book-open" titleAs="h2"` — 제목 *No recordings to manage* · 설명 *Recordings from storytime will show up here.* · **CTA 없음** (이동할 곳을 약속하지 않는다 — Stage 2 Home skeleton 선례). 범위 안내 문장(§2.3 첫 줄)은 빈 상태에서 렌더하지 않는다.

### 2.4 `C13-S8-4` 확인 다이얼로그 3종 — 전부 `ConfirmDialog destructive` (컴포넌트 변경 0)

| # | 트리거 | title | description (§10) | confirm | cancel |
|---|---|---|---|---|---|
| ① | 녹음 행 *Delete* | *Delete this recording?* | 범위(오디오·클립 삭제 · 대화 기록 유지) + 되돌릴 수 없음 | *Delete recording* | *Keep* |
| ② | *Delete all data* | *Delete all of {firstName}'s data?* | 지워지는 것 · 계정은 유지(`N8-02` ⓐ) · 되돌릴 수 없음 · 기한 수치 0 | *Delete all data* | *Cancel* |
| ③ | *Delete account* | *Delete your account?* | 계정 + 전체 데이터 · 이 기기에서 로그아웃 · 되돌릴 수 없음 | *Delete account* | *Cancel* |

- 확인 강도 = **다이얼로그 1회** (`N8-08` ⓐ) — 문구 타이핑 0.
- 초기 포커스 = **취소** (기존 destructive 규칙) · `Esc` = 취소 · 닫힘 시 포커스 = 트리거 (AC-8-48).
- 확인 처리 중 `confirming` → 확인 버튼 loading · 취소 버튼은 활성 유지하되 **요청이 이미 나갔으면 취소해도 요청은 철회되지 않는다** → 처리 중에는 `Esc`·scrim 닫기 무시 (Dialog 기존 동작 확인 필요 — 없으면 보고).
- 버튼 순서 confirm → cancel = `321:2203` 과 같음.

### 2.5 `C13-S8-5` 전체 삭제 진행 상태 — `DeletionStatusAlert` = `InlineAlert` 상태 매핑 (신규 컴포넌트 0)

| 상태 (`DeletionRequest.status` / 경로) | InlineAlert `tone` | title | description | action | role |
|---|---|---|---|---|---|
| `received` · `processing` | `info` | *We're deleting your data* | *This can take a little while. You can leave this screen — the status will show here.* | 없음 | `status` |
| `DELETION_ALREADY_REQUESTED` (POST 응답) | `info` | 위와 같음 (진행 중으로 표시 — 오류 화면 아님, AC-8-29) | 〃 | 없음 | `status` |
| `failed` | `error` | *We couldn't finish deleting your data* | *Nothing else changed. You can ask again.* | *Try again* (= ConfirmDialog ② 재진입) | `alert` |
| `completed` | — (이 화면에 머물지 않는다) | → **감시자**(`D8-2` ①)가 로컬 정리 → Guard 이동 → 도착 화면(`/onboarding/start`)에 `Toast success` *Your data was deleted.* 1회. 이 화면은 정리하지 않는다 | | | Toast 기존 |
| `scope='account'` · `received` · `processing` (`VG8-C-12`) | `info` | *We're deleting your account* | *Your account and all of {firstName}'s data are being deleted. This can take a little while.* | 없음 | `status` |
| `scope='account'` · `failed` (`VG8-C-12`) | `error` | *We couldn't finish deleting your account* | *Nothing else changed. You can ask again from Account.* | **없음** — *Try again* 이 Dialog ②(전체 삭제)를 열면 범위가 바뀐다 | `alert` |

- `scope='account'` 행: 탈퇴 완료는 이 화면이 처리하지 않으므로(`N8-10` 탈퇴 ⓐ — `S8-D` 가 요청 성공 즉시 정리 + 세션 종료) *the status will show here* 를 쓰지 않는다. 같은 문구를 `/settings/account` 에 진행 중 `account` 요청이 보일 때도 쓴다(위치 = 영향 안내 아래 기존 실패 표면 자리, *Delete account* 행 `disabled`) — `S8-D`.

- **진행률·스피너·퍼센트 0** — 서버가 진행률을 주지 않으며(`C8-3`), 움직이는 표시는 reduced-motion 분기를 늘린다. 상태 전이는 문구 교체 + live 1회로 전달 (`Q8-08`).
- 폴링 중 화면 이탈 가능 — 다시 들어오면 summary 의 `activeDeletionRequest` 로 같은 알림을 렌더.
- **완료 감지 · 정리 소유 = 앱 전체 (`D8-2` ① = `N8-31` ⓐ, Plan rev 2.2 §5.7)**:
  - `app/providers` 의 감시자 1곳이 기기에 남긴 요청 id(PII 0)를 조회해 `completed` 면 로컬 정리(draft · 카드 캐시 · 로컬 녹음) → 표시 삭제. 화면 안 · 화면 밖(이탈 · 폴링 상한 · 앱 재시작) 완료가 **같은 경로**다.
  - `/settings/data` 는 **상태만 표시**한다(진행 · 실패 알림, 행 `disabled`) — 정리 `useEffect` 0. 화면과 감시자는 같은 query key 를 써 요청 중복 0.
  - **Toast 1회** — 감시자만 띄운다. 문구 = 화면 안 완료와 **같은** `Toast success` *Your data was deleted.* (§10.2, 새 문구 0). 정리 실패 시 Toast 0 · 표시 유지 → 다음 시작 때 재시도.
  - **도착 화면 = Guard 판정 그대로**: `me.onboardingStatus ≠ completed` + 정리로 draft 0 → resume 없음 → **`/onboarding/start` (`243:1147`)**. 사용자가 어느 화면에 있었든(설정 · 홈 · 앱 재시작) 여기로 간다. 이 화면의 Trial 안내 · draft 링크(§2.7)는 **인증 상태라 노출 0**.
  - 표시가 있고 첫 조회 전에는 Guard 가 **기존 pending 표현**으로 기다린다 — 정리 전에 온보딩이 그려지지 않는다(새 UI 0).
  - 한계: 요청을 만든 적도 `/settings/data` 를 연 적도 없는 **다른 기기**는 덮지 못한다 → R8-15 · Handoff 한계 기록(수용).
- 진행 중에는 §2.2 *Delete all data* 행 `disabled`, §2.3 행 *Delete* 도 `disabled`(서버 쓰기 차단 `C8-5` 와 같은 의미를 미리 반영 — 요청 0).

### 2.6 `C13-S8-6` 계정 `/settings/account`

```
StackLayout  TopBar centered "Account"  leading Back (→ /settings)
└─ AccountSettings (features/account-deletion)   flex col gap-4 py-6
   ├─ section
   │   ├─ SectionLabel "SIGNED IN AS"
   │   └─ ListGroup label="Signed in as"
   │       └─ ListRow title = {email}   (표시 전용 — onPress 0 · chevron 0)   ← Q8-10 (contract 에 email 없음, M8-1)
   │  [N8-05 ⓑ 시에만] ListRow "Plan"  meta "Beta — free"
   └─ section
       ├─ SectionLabel "DELETE ACCOUNT"
       ├─ Text footnote primary  영향 안내 (§10.4)
       ├─ [실패 · 오프라인] InlineAlert tone="error" | "offline"
       └─ ListGroup label="Delete account"
           └─ ListRow "Delete account"  (동작 행) → ConfirmDialog ③
```

| 항목 | 명세 | 결정 |
|---|---|---|
| 이메일 | ⚠️ **`GET /v1/me` 의 `Caregiver` 에 `email` 이 없다** (`id` · `displayName` · `relationship?` · `timezone` — `[직독]` `me.ts` L24-36). Plan AC-8-33 *"보호자 이메일(응답 값)"* 은 contract 추가가 필요하다 → `M8-1` · `Q8-10` | ⛔ `Q8-10` |
| 요금제 | **미표시** (`N8-05` ⓐ) | `N8-05` |
| 진행 중 전체 삭제가 있을 때 | *Delete account* 는 **활성 유지** (탈퇴는 상위 행위) — 서버가 `DELETION_ALREADY_REQUESTED` 를 주면 `InlineAlert info` *Your data is already being deleted. You can delete your account after it finishes.* | `Q8-09` (서버 의미 `N8-02` 와 함께 확인) |
| 성공 | `performSessionCleanup` → 세션 종료 → `/auth/welcome` (replace) → `Toast neutral` *Your account was deleted.* 1회 (`N8-29`) · 뒤로 가기로 보호 화면 재진입 0 | `Q8-11` |
| 실패 · 오프라인 | 로컬 보존 · InlineAlert · 다시 *Delete account* = 재시도 | AC-8-36 |

> **탈퇴 후 안내는 Figma `179:1701`(welcome) 위에 뜬다.** Toast 는 일시 오버레이라 프레임 레이아웃을 바꾸지 않지만, Figma 화면에 요소가 **나타나는** 것이므로 최우선 규칙 2 에 따라 승인 대상으로 둔다 (`Q8-11`). InlineAlert(레이아웃 삽입) 는 비권고.

### 2.7 `C13-S8-7` 미가입 기기 draft 삭제 (`QA-2R-004`)

⚠️ **Plan `N8-07` 정정 (`M8-2`)** — ⓑ 의 `/onboarding/saved` 는 "Figma 없는 화면" 이 아니다: `OnboardingSaved` = **Figma `179:1809` "1e · Baseline saved"** (`[직독]` 파일 머리 주석 · `[meta]`). 또 이 화면은 설문 **제출 후**라 draft 가 이미 서버로 넘어간 가입자 경로다. ⓐ(`/auth/welcome` `179:1701`) 와 ⓑ 모두 디자이너 프레임에 요소를 추가한다.

**권고 ⓓ** — 이미 C-13 으로 승인된 Trial 안내(`C13-11`, Stage 2 Spec §2.12 — `/onboarding` 과 Step 1 상단 `InlineAlert info` + *Create account*) **바로 아래**에 `TextLink` 1개:

```
InlineAlert tone=info  "Your answers stay on this device" … [Create account]   (기존 C13-11)
TextLink  "Remove my answers from this device"                                  🆕 (draft 있을 때만)
   → ConfirmDialog destructive
        title  "Remove answers from this device?"
        desc   "Your answers about {firstName} will be removed from this device. Nothing was sent to HARU."   ({firstName} 없으면 "your child")
        confirm "Remove"   cancel "Keep"
   → OnboardingDraftStore.clear() (서버 요청 0) → /onboarding (replace, 빈 상태) → Toast neutral "Removed from this device."
```

| 항목 | 명세 |
|---|---|
| 노출 조건 | draft 존재 + 미인증(Trial) 일 때만 (AC-8-37). Trial 안내가 닫혔으면(세션 내 1회 닫기) 링크도 함께 숨는다 — 안내와 한 묶음 |
| 노출 화면 (`D8-2` ③ · `VG8-D-07`) | Trial 안내(C13-11)가 뜨는 **모든 곳** = `/onboarding`(`179:1748`) · **`/onboarding/start`(`243:1147`)** · Step 1. 규칙 · 간격(`P-41` 8) · 문구 · Dialog · 이동은 Step 1 과 **동일**. `/onboarding/start` + draft 는 Step 1 에서 뒤로 왔을 때만 도달(Guard 는 draft 가 있으면 저장 지점으로 보낸다). 디자이너 영역 변경 0 — C13-11 영역 안. 최우선 규칙 2 에 따른 사용자 승인 `D8-2` |
| 위치 간격 | InlineAlert ↔ TextLink `--space-2` 8 (가값 `P-41`) · 정렬 = 시작 |
| 이유 | Figma 디자이너 프레임 변경 0 (C13-11 영역 안) · draft 를 보는 바로 그 자리 · 서버 데이터 없음(C-12)을 문구로 전달 |
| 한계 | welcome 에서 바로 보이지 않는다 — 온보딩에 다시 들어와야 발견된다 (`Q8-12` 에서 ⓐ 병행 여부 결정) |

### 2.8 `C13-S8-8` 동의 이력 `/settings/privacy` — **`N8-06` ⓐ 일 때만** (권고 ⓑ 제외)

`TopBar centered "Consent history"` → 설명 1문장 → `ListGroup label="Consent history"` → `ListRow` 표시 전용 (title = `documentTitle` · subtitle *Version {v} · Agreed {Mon D, YYYY}*) · 철회 UI 0 (C-4) · 빈 상태 `EmptyState` *No consent records yet* (CTA 0) · Loading/Error = §2.9.

### 2.9 `C13-S8-9` 공통 상태 (#22 명세 우선 — Stage 6 §2.7 recipe 그대로)

| 화면 | Loading | 조회 Error / Offline | Empty |
|---|---|---|---|
| `/settings/data` | Skeleton: SectionLabel 자리 text 1 → text 2(설명) → ListGroup 높이 block 1행(56) ×2 섹션 — `Skeleton` 에 높이 지정 block 이 없으면 `text lines` 로 대체(Stage 7 §2.9 ⑩ 선례) | `ErrorState tone="error"|"offline"` + *Try again* (`errorCopyForCode` · `networkErrorCopy`) — 화면 전체 | — |
| `/settings/data/recordings` | ListGroup 안 Skeleton 행 3 (text lines 2) | 〃 | §2.3.3 |
| `/settings/account` | 이메일 행 Skeleton text 1 | 〃 | — |
| 더 보기 실패 | 목록 아래 `InlineAlert error` + *Try again* (이미 받은 행 유지) | | |
| 쓰기 차단 (`C8-5`, `account:deletion-pending-write-blocked`) | — | 각 화면의 **기존 실패 표면**(저장 = InlineAlert, 세션 시작 = 기존 오류 표면)에 문구만: 2줄 표면 = 제목 *Changes are paused* + 설명 *Your data is being deleted, so changes are paused.* · 자체 제목이 있는 표면 = 설명만 — 새 UI 0 · **새** Toast 0 (`VG8-A-03`). **기존 Toast 실패 표면**(책 저장/해제 · 서재 세션 시작 · 회고 저장 등)도 대상이며 Toast 는 1줄 표면이라 **설명만** 쓴다 — `제목. 설명` 이어 붙이기 금지("paused" 반복) (`VG8-C-08` · `VG8-C-09`) | — |

---

## 3. 컴포넌트 — Variant / State / Props (전부 기존)

| 컴포넌트 | 사용 | Variant / State | 변경 |
|---|---|---|---|
| `TopBar` | 3~4 화면 | `centered` + Back | 0 |
| `ListGroup` / `ListRow` | 전 화면 | basic(56) · 이동(chevron) · 동작(chevron 0) · 표시 전용 · trailing Button · `meta` · `disabled` · **`metaWrap`**(🆕 opt-in prop, 기본 off — 녹음 목록만, `D8-2` ② · 규칙 §8.1) | **prop 1 추가**(Shared UI 변경 승인 `D8-2`) — 단 `ListRow` 에 `onPress` 없이 `disabled` 시각(행 dim)이 있는지 확인. 없으면 행이 아니라 **trailing Button `disabled`** 만 쓴다 |
| `Button` | 녹음 행 *Delete* | `glass` `sm` (hit 44 — `--button-hit-size-sm`) · `disabled` | 0 (`aria-label` 지원 여부 확인 — §2.3.2) |
| `ConfirmDialog` | 3종 + draft | `destructive` · `confirming` | 0 |
| `InlineAlert` | 진행 상태 · 실패 · 오프라인 · 이미 요청됨 | `info` · `error` · `offline` · `success`(미사용) · `action` | 0 |
| `Toast` | 완료 · 탈퇴 후 · draft 삭제 후 | `success` · `neutral` | 0 |
| `EmptyState` / `ErrorState` / `Skeleton` | §2.9 | 기존 | 0 |
| `TextLink` | *Show more* · draft 삭제 | 기존 · *Show more* 는 터치 확장 옵션 사용 (`D8-3`, §9.3) | opt-in prop 1 (`D8-3` 승인) |
| `Text` | SectionLabel recipe · 설명 | `tracking="section-label"` (`VG6-H-06` — `Q8-16`) | 0 |
| `Icon` | `chevron-right` · `book-open` | registry 기존 | 0 |

분류 (design-agent §4):

| 이름 | 분류 | 위치 |
|---|---|---|
| `DataManagement` · `DeletionStatusAlert`(InlineAlert 매핑) | Feature | `features/data-management` |
| `RecordingList` · `RecordingRow`(ListRow 조합) | Feature | `features/recording-deletion` |
| `AccountSettings` | Feature | `features/account-deletion` |
| `DeviceDraftRemoval`(TextLink + Dialog) | Feature | `features/device-data` (Trial 안내와의 조합은 page — feature 간 import 금지) |
| 상태 → 문구 매핑 (`uploadStatus` → meta) | 순수 함수 | 해당 feature `model/` + copy |

## 4. 신규 Shared UI / Domain — **0** (기존 `ListRow` prop 확장 1 — `metaWrap`, `D8-2` ②)

- 새 컴포넌트·variant·아이콘 요청 **없음**. Plan §17-2 *"새 컴포넌트가 필요하면 목록으로 먼저 보고"* → 해당 없음.
- 조건부 보고 2건(구현 중 확인): ① `Button` 접근성 이름 override ② `ListRow disabled` 시각 / 처리 중 Dialog 닫기 차단. 없으면 development-agent 가 멈추고 보고한다.

## 5. 토큰

### 5.1 그대로 쓰는 것 `[직독]`

| 용도 | 토큰 |
|---|---|
| 배경 | `--gradient-app` (`AppBackground`) |
| 목록 면 · 그림자 | `--color-surface-strong` · `--shadow-bubble` (drop 1겹 — `321:1594` 선언) |
| 텍스트 | `--color-fg-primary` (제목·설명) · `--color-fg-secondary` (SectionLabel · meta) · `--color-fg-tertiary` (chevron) |
| destructive 확인 | `--color-status-error-bg` · `-fg` · `-border` (`Dialog.css`, provisional **P-04**) |
| 알림 | `--color-status-info-*` · `-error-*` · offline (InlineAlert 기존) — P-04 |
| 간격 | `--layout-gutter` 24 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-6` 24 |
| 타이포 | `caption-1` · `footnote` · `subheadline`(ListRow 제목 15) · `--section-label-letter-spacing` |
| 반경 | ListGroup 기존 · Dialog 기존 · Button pill |
| 터치 | `--size-touch-min` 44 · `--button-hit-size-sm` · `--icon-button-hit-size` |

### 5.2 신규 요청 — **0**

### 5.3 신규 가값 (`P-41` 부터, 번호 재배정 금지)

| ID | 값 | 근거 | 확정 주체 |
|---|---|---|---|
| **`P-41`** | Stage 8 C-13 레이아웃 값 일체 — 설명↔ListGroup `--space-3` 12 · Trial 안내↔draft TextLink `--space-2` 8 · 상태 알림 위치(화면 최상단) · 행 meta 문구 위치 | Figma 없음 (`P-39` 선례) | 디자이너 (`Q8-21` 요청서) |

| **`P-42`** | 전체 삭제 요청 폴링 간격 5s × 상한 60회(5분) — 화면과 감시자(`D8-2` ①) 공유 | Plan rev 2.2 `VG8-C-10` | **가값 유지** (`D8-2` ④ — 사용자 미선택). Final QA 가값 목록에 재제시 |
| **`P-43`** | 로그인 *Create an account* `TextLink`(`179:1847` fill `#4a5f5c` = `--color-fg-link` · Semibold 14) 가 그래디언트 하단(`--gradient-app` 끝 부근) 위에서 **4.0–4.2 : 1** (기준 4.5 미달 — **Figma 선언값 자체가 미달**). 색 유지 | `D8-3` (`H8-6-N3` · `VG8-G-08`) | 디자이너 (`R8-7`). 등재 = `stage-0-approvals.md` §4 · registry `provisionalItems.ts`(development-agent) |

`P-04`(status 색) 는 destructive 확인 버튼 · InlineAlert 에서 **계속 가값**이다 — Final QA 가값 목록(`N8-20`)에 Stage 8 사용처를 추가 기록한다.

---

## 6. Interaction / Motion (CSS · Pointer Events 전용)

### 6.1 신규 화면

| 상호작용 | 동작 |
|---|---|
| 이동 행 | 기존 ListRow pressed/focus — 변경 0 |
| Dialog 열림/닫힘 | 기존 Dialog 전환 · reduced-motion 즉시 |
| 행 상태 교체 (*Saved* → *Deleted*) | **애니메이션 0** — 텍스트 교체 + trailing 제거. `metaWrap` 행은 meta 폭 · 텍스트 열 폭(trailing 제거로 넓어짐)이 바뀌어 **2줄 → 1줄**로 줄 수 있다(행 높이 −1줄) — 허용, 모션 0 (`D8-2` ②) |
| 진행 상태 알림 교체 | 같은 자리 내용 교체 · 등장 모션 0 |
| 폴링 | 화면 · 감시자 같은 query key — 표시가 있는 동안 화면 밖에서도 감시자가 폴링(`P-42` 공유) · 앱 시작 · `visibilitychange` visible 시 조회 (`D8-2` ①, Plan §5.7) |
| 전체 삭제 완료 | 감시자: 정리 → Guard 이동(`/onboarding/start`) → `Toast success` *Your data was deleted.* **1회**. 화면 안에서 완료돼도 같은 경로 — 화면은 표시만 (`D8-2` ①) |

### 6.2 포커스 이동 규칙

| 사건 | 포커스 |
|---|---|
| Dialog 취소 / Esc | 트리거 (행 *Delete* · 동작 행) |
| 행 삭제 성공 | 해당 행(일시 `tabIndex=-1`) — trailing 이 사라지므로 트리거로 돌아갈 수 없다 |
| 행 삭제 실패 | 해당 행 *Delete* (InlineAlert 는 live 로 낭독) |
| 전체 삭제 요청 성공 | 상태 알림(`tabIndex=-1`) |
| 탈퇴 성공 → welcome | 페이지 h1 (기존 route 포커스 관리) |
| draft 삭제 후 → `/onboarding` | 페이지 h1 |

### 6.3 `VG6-D-12` Back fallback (`N8-14`) — **시각 변화 0 확인**

Back 버튼 모양·라벨·위치 변경 0. 동작만: 앱 안 기록이 있으면 `navigate(-1)`, 없으면 아래 **논리적 부모로 `replace`**. Stage 8 신규 route 의 부모를 추가한다.

| 화면 | 부모 | 비고 |
|---|---|---|
| `/settings/profile` · `/settings/child` · `/settings/child/survey` · `/settings/growth-capability` · **`/settings/data`** · **`/settings/account`** · (`/settings/privacy`) | `/settings` | |
| `/settings/child/survey/:step` | `/settings/child/survey` | |
| **`/settings/data/recordings`** | `/settings/data` | |
| `/settings` | `/` | |
| `/library/add` · `/library/gift-requests` | `/library` | |
| `/progress/reports/:reportId` | `/progress` | `D7-7` 일반화 |
| `/auth/sign-up` · `/auth/log-in` · `/auth/forgot-password` · `/auth/reset-password` | `/auth/welcome` | |
| 아이 정보 dirty | 부모 이동 **전에** 기존 ConfirmDialog (`N6-14`) | 순서 유지 |

---

## 7. 상태 화면과 Mock 시나리오 매핑

| 화면 | 상태 | Mock key (Plan §8) | 표면 |
|---|---|---|---|
| `/settings/data` | 기본 | `data-management:success` | §2.2 |
| | Loading | `:loading` | Skeleton §2.9 |
| | Error → Retry | `:error` · `:retry` | ErrorState |
| | Offline (조회) | `:offline` | ErrorState offline |
| | 진행 중 | `:deletion-processing` | InlineAlert info → (completed) Toast + 이동 |
| | 실패 | `:deletion-failed` | InlineAlert error + Try again |
| | 이미 요청됨 | `:deletion-already-requested` | InlineAlert info |
| | 요청 오프라인 | `:offline` (POST) | InlineAlert offline (요청 0) |
| `/settings/data/recordings` | 기본 · 5상태 행 | `:success` (+ fixture 에 pending · failed · deleted 행 추가 요청 — Plan §8 은 uploaded 2 · expired 1) | §2.3.1 |
| | 빈 상태 | `:empty` | EmptyState |
| | 이미 삭제됨 | `:recording-deleted` | 행 *Deleted* (오류 아님) |
| | 로컬 청크 | `:recording-delete-local-pending` | 화면 변화는 성공과 같음 · 저장소 계수로 검증 |
| `/settings/account` | 성공 · 실패 · 오프라인 | `account:success` · `:error` · `:offline` | §2.6 |
| 공통 | 쓰기 차단 | `account:deletion-pending-write-blocked` | 기존 실패 표면 + 문구 |
| Trial | draft 있음 / 없음 | (로컬 draft 주입 — 서버 key 아님) | §2.7 |
| 동의 이력 | `consent:history` · `:history-empty` | (`N8-06` ⓐ 시) | §2.8 |

Mock 요청 사항 (`S8-A`): recordings fixture 에 `pending` · `failed` · `deleted` 각 1행 · `book = null` 1행 · 40자 책 제목 1행 · cursor 2페이지(더 보기 검증) — `M8-4`.

---

## 8. Responsive · 반응형 감사 (FR-25)

### 8.1 신규 화면 규칙 `[계산]`

| 폭 | 콘텐츠 폭 | 규칙 |
|---|---|---|
| 320 | 272 (320 − 48) | ListRow 제목 2줄 허용(truncate 0) · subtitle/meta 한 줄 안 들어가면 **`metaWrap`** 으로 meta 가 다음 줄로 감김 (아래 규칙 — 초판의 "ListRow 기존 동작" 은 사실과 달랐다, `VG8-B-08`) · trailing *Delete* 폭 고정 → 제목 영역 축소 |
| 393 | 345 | 기준 |
| 600 / 1024 | 432 (480 − 48) | 앱 컬럼 480 가운데 · 다단 0 |
| 텍스트 200% | — | 고정 높이 0 (ListRow 최소 56 · 내용 따라 증가) · Dialog 내용 세로 스크롤 허용(기존) · 버튼 라벨 줄바꿈 허용 |

**`metaWrap` 규칙 (`D8-2` ② · `VG8-B-08`)** — 선택: **meta 가 subtitle 아래 다음 줄로 통째로 내려간다.** meta 열 안에서 줄바꿈하는 안은 기각(우측 좁은 열에서 *Not uploaded yet* · *Removed after 90 days* 가 단어마다 끊겨 같은 문제가 meta 쪽으로 옮겨갈 뿐).

| 항목 | 명세 |
|---|---|
| 동작 | meta-row `flex-wrap: wrap` · subtitle = **내용 폭**(`flex: 0 1 auto`, 줄지 않는 한 단어 분절 0) · meta = `flex: 0 0 auto`, `white-space: nowrap`. `subtitle + gap 8 + meta ≤ 텍스트 열` 이면 **한 줄**(meta 우측 정렬 — 기존 `space-between` 그대로), 넘으면 **meta 가 2번째 줄 시작(좌측) 정렬** |
| 간격 | 가로 gap = `--space-2` 8 (기존) · 줄 간격 = 0 (caption 행 높이 그대로 쌓임 — 새 토큰 0) |
| subtitle 자체 줄바꿈 | subtitle 이 열보다 길 때만(200% 텍스트 등) 단어 경계에서 — 320 · 393 100% 에서는 0 (subtitle 118 < 열 150) |
| 기본값 | **off** — off 일 때 DOM · class · CSS 변경 0 → Library(`LibraryShelfSheet` · `LibraryShelves`) 등 기존 사용처 baseline diff 0 |
| 사용처 | `RecordingList`(`/settings/data/recordings`) **만** |

실측 결과 (`stage-8-visual-gap.md` §3.2 — 텍스트 열: *Delete* 있는 행 393 = 223 · 320 = 150, 없는 행 393 ≈ 310 · 320 ≈ 238. subtitle 연도 있음 118 · 같은 해 ≈ 85. meta *Saved* 33 · *Uploading* 56 · *Not uploaded yet* 95 · *Removed after 90 days* 129):

| 행 | 393 연도 있음 | 393 같은 해 | 320 연도 있음 | 320 같은 해 |
|---|---|---|---|---|
| Saved | 1줄 (159/223) | 1줄 | **2줄** (159/150) | 1줄 (126/150) |
| Uploading | 1줄 (182/223) | 1줄 | **2줄** (182/150) | 1줄 (149/150, 여유 1) |
| Not uploaded yet | **2줄** (≈221/223 — 계산 여유 ≤2, 렌더에서 감김) | 1줄 (188/223) | **2줄** (221/150) | **2줄** (188/150) |
| Removed after 90 days (*Delete* 0) | 1줄 (255/310) | 1줄 | **2줄** (255/238) | 1줄 (222/238) |

2줄일 때 = 1줄 *Dec 28, 2025 · 12 min* / 2줄 *Not uploaded yet* — **단어 분절 0** (현행은 *Dec 28, / 2025 · / 12 min* 3줄). 경계값(Uploading 320 같은 해 여유 1 · Not uploaded yet 393 여유 ≤2)은 글리프 폭에 따라 뒤집힐 수 있으며 **어느 쪽이든 분절 0** 이 합격 기준이다 — baseline 은 렌더 결과를 담는다.

### 8.2 감사 방법 (`S8-H` — 전 route, Plan §12.4 목록)

| 축 | 방법 | 통과 기준 |
|---|---|---|
| 뷰포트 | Playwright `setViewportSize` **320×568 · 393×852 · 600×960 · 1024×768** + 가로 웹 **852×393** · 각 route 의 대표 상태(기본 + 시트/다이얼로그 열림 1개) | — |
| 가로 넘침 | `document.scrollingElement.scrollWidth ≤ clientWidth` · **클래식 스크롤바 emulate**(`scrollbar-classic` 프로젝트) 포함 · 모든 요소 `getBoundingClientRect().right ≤ 앱 컬럼 right + 0.5` (그림자 제외 — box 기준) | 0 건 |
| 앱 컬럼 | ≥600: 컬럼 폭 = 480 ±0.5 · 좌측 = (vw − 480)/2 ±1 · <600: 폭 = vw | 전 route |
| 다단 | 컬럼 안 최상위 블록의 `left` 가 2종 이상 섞이지 않음 (가로 트랙·칩 행 예외 목록 명시) | 0 |
| 그림자 클립 (`R-SHADOW-1`) | `overflow ≠ visible` 조상을 가진 drop shadow 요소마다 **세로·가로 픽셀 프로브** (번짐 = box-shadow 겹 합산값) | 화면 안쪽 클립 선 0 |
| 텍스트 200% | ① root `font-size: 200%` 주입 ② `page.setViewportSize` 196×426(= 393/2, 브라우저 줌 200% 등가) · 텍스트 요소 `scrollHeight ≤ clientHeight + 1`(clip/truncate 요소만) · 겹침 = 형제 텍스트 bbox 교차 0 · 인터랙티브 요소 클릭 가능(elementFromPoint 중심 = 자신) | 잘림·겹침·기능 손실 0 (WCAG 1.4.4) |
| Reflow | 320 CSS px 에서 2차원 스크롤 0 (WCAG 1.4.10 — 가로 트랙 · 차트는 예외 목록) | 0 |
| Text spacing | 줄 1.5 · 문단 2 · 자간 0.12 · 단어 0.16em 주입 (WCAG 1.4.12) | 잘림 0 |
| **설계된 줄 수 제한** (`D8-3` 개정 — `H8-6-N5` · `VG8-G-10`) | 위 "텍스트 200%" · "Text spacing" 축에서 말줄임이 늘어난 요소 중 **Figma 레이어가 줄 수를 선언한 것**(Prompt 2줄 · 책 제목 · 목록 제목 · 역량 캡션 등)은 clip/truncate "잘림" 계수에서 분리하고, 요소 종류별로 **전체 텍스트 경로**(책 제목 → 책 상세 시트 · 목록 제목 → 상세 · Prompt → 세션 Prompt 목록 · 접근성 이름 등)를 대조한 표를 **QA 가 작성**한다 | 경로 있음 = **조건부 허용 차이 `AD-S8-04`** (§12.5) · 경로 없음 = 항목별 `USER_DECISION` (자동 허용 아님) · 새 hard clip · 겹침 · 가로 넘침 · 기능 손실은 계속 0 |
| baseline | Stage 8 신규 화면 393 + 320 · settle 후 · dev 패널 숨김 (`R-BASELINE-1` ①②) | — |

---

## 9. Accessibility · 접근성 감사 (WCAG 2.2 AA)

### 9.1 신규 화면 — 이름 · 순서 · live region

| 요소 | 명세 |
|---|---|
| 페이지 제목 | TopBar 제목 = `h1` (기존) · 섹션 라벨은 `h2` 가 아니라 `ListGroup label`(접근성 이름)로 그룹 이름 전달 — Stage 6 설정 목록과 같음 |
| 녹음 행 | 행 = `listitem` · 텍스트 순서 제목 → 날짜·길이 → 상태 · *Delete* 이름 *"Delete recording, {title}, {date}"* |
| 행 상태 변경 | **live 1회**: 목록 위 `role="status"` 영역 1개(시각 숨김)에 *"Recording deleted."* — 행 meta 자체는 live 아님 (중복 낭독 0, AC-8-50) |
| 진행 상태 알림 | `InlineAlert` `announce="auto"` — 상태가 **바뀔 때만** 1회 (폴링마다 재낭독 0) · failed 만 `alert` |
| Dialog | `role="alertdialog"` · 제목·설명 연결 · 초기 포커스 취소 · 배경 inert (기존) |
| Toast | 기존 `role="status"` 1회 |
| disabled 행/버튼 | 이유는 상단 알림이 전달 · `aria-disabled` 로 포커스 가능 유지 여부는 기존 Button 규칙 따름 |

### 9.2 대비 `[계산 — Stage 6 §9.3 재사용]`

| 텍스트 | 배경 | 비 | 판정 |
|---|---|---|---|
| ListRow 제목 ink-700 | white 90% over 그래디언트 | ≥ 5.0 (Stage 6 §9.3) | AA |
| 설명 문장 ink-700 (footnote 13) | 그래디언트 | 4.6~5.3 (Stage 6 §9.3) | AA |
| SectionLabel · meta ink-500 | 그래디언트 / 카드 | 2.0~2.72 / 3.14~3.23 | **`P-01`** (가값 — 신규 아님) |
| destructive 확인 라벨 error-fg on error-bg | Dialog | P-04 측정값 사용 | **`P-04`** |
| Glass *Delete* 라벨 `text-button` | glass | 4.18~4.48 | **`P-11`** (확정 가값) |

→ **신규 미매핑 대비 0 을 목표**로 둔다 (AC-8-54).

### 9.3 터치 타깃

ListRow 56 · *Delete* `Button sm` hit 44 (`--button-hit-size-sm`) · Back 44 · TextLink 는 inline hit 44 (기존 `TextLink` 규칙 확인 — 없으면 보고).

**`D8-3` 개정 (2026-11-21, `H8-6-N4` · `VG8-G-09`)** — 감사에서 `TextLink default` 의 실 hit 가 글자 줄 높이(≈22)뿐인 곳이 확인됐다. 처리:

| 대상 | 처리 | 조건 |
|---|---|---|
| consent *View* ×5 · 아이 정보 편집 *Done* · 녹음 목록 *Show more* | **`TextLink` 터치 확장 옵션** (opt-in prop 1개 — `packages/ui` 공개 API 추가 **승인됨**). `subtle::before` 와 같은 기법: 칠하지 않는 의사요소로 hit 만 **44 × 44 이상**, 색 · 글자 크기 · 밑줄 · 레이아웃 · 포커스 링 위치 **변화 0**. 기본값 = off(기존 사용처 diff 0). prop 이름은 development-agent 가 정하되 **enum/boolean** 으로(수치 prop 금지) — 예: `hit="touch"` | ① baseline **0** ② 확장 hit 가 이웃 인터랙티브(consent 행 Checkbox · *Show more* 위 행 · *Done* 아래 이름 입력)와 **겹치지 않음**을 QA 가 `elementFromPoint` 격자로 확인 — 겹치면 그 사용처는 멈추고 보고 |
| 회고 입력칸 높이 **40** (Figma `91:715` 330×40 선언, Stage 5 Spec §3.3 · `T5-10`) | **예외 — 허용 차이 `AD-S8-03`** (§12.5). Figma 값 유지 | WCAG 2.5.8 AA(24) 충족 · 폭 330 · `S1-G-2` TextField 행 42 선례 |

Stage 2 Spec §4.6 `TextLink` 행에 옵션을 함께 기록했다 (Stage 2 개정 7).

### 9.4 전 route 감사 방법 (`S8-G`) — 기준 정의

| SC (WCAG 2.2) | 방법 | 기준 |
|---|---|---|
| 자동 규칙 엔진 (`N8-18` 승인 시 `@axe-core/playwright`) | 전 route × 대표 상태 · tags `wcag2a` `wcag2aa` `wcag21a` `wcag21aa` `wcag22aa` · iframe 없음 | **serious · critical 0** · `color-contrast` 위반은 끄지 않고 **장부 매핑**(D-01 / P-01 · P-02 · P-04 · P-11 · P-35~P-37 …) — 매핑 안 되는 것 = 결함 |
| 1.1.1 · 4.1.2 이름 | role 쿼리로 인터랙티브 요소 전수 · 이름 빈 값 0 · 아이콘 전용 버튼 이름 | 100% |
| 2.5.3 label-in-name | 시각 라벨이 있는 컨트롤 이름에 시각 라벨 포함 (대소문자 무시) | 100% — `D8-3` 처리 2건: ① `/progress` 4주 리포트 카드 헤더 링크 **`aria-label` 제거** → 이름 = 보이는 내용(h2 *4-week full report* + 설명 + 보조) — **Stage 7 Spec §9 `N7-37` 이름 행 개정** (시각 · baseline 0) ② 녹음 버튼 Record 변형 이름 = *Tap to recording, Start recording* (캡션 먼저 + 동작 — Stage 4 Spec §2.6.3 보완, 해당 Spec 개정은 별도) |
| 1.3.1 · 1.3.2 구조·순서 | heading 계층 건너뜀 0 · DOM 순서 = 시각 순서(bbox 정렬 비교) | 0 |
| 1.4.1 색 단독 | 상태 표시(녹음 행 · 진행 · 오류)가 문구를 가짐 — 수동 표 | 0 |
| 1.4.3 · 1.4.11 대비 | **렌더 픽셀**로 측정: 텍스트를 `visibility:hidden` 으로 숨긴 스크린샷에서 글리프 bbox 배경 중앙값 샘플 + computed `color` 알파 합성 → WCAG 상대휘도. 텍스트 4.5 / 큰 텍스트·비텍스트 3.0 | 미달 = 장부 매핑 필수 |
| 2.1.1 · 2.1.2 키보드 | Tab/Shift+Tab 순회로 각 route 핵심 흐름 완료 · 트랩 0 (Dialog/Sheet 안 순환은 의도) | 완료 |
| 2.4.3 · 2.4.7 · 2.4.11 포커스 | 포커스 링 가시(`--color-focus-ring` 2px 이상, outline computed ≠ none) · 포커스 요소가 sticky TopBar/탭바/Toast 에 **가려지지 않음** (bbox 교차 0) | 0 |
| Dialog · Sheet | 열림 → 내부 첫 요소/지정 요소 · Esc · 닫힘 → 트리거 · 배경 `inert` | 전수 (AC-8-48 · `S4B-F1-OPEN` ④ 포함) |
| 4.1.3 상태 메시지 | live region 계수: 사건 1회당 낭독 1회 (`aria-live` 영역 텍스트 변경 횟수 MutationObserver 계수) | 중복 0 |
| 2.5.8 타깃 (AA 24) + 프로젝트 44 | `elementFromPoint` 격자(4px)로 실 hit 영역 측정 | ≥ 44×44 (예외 = 승인 결정 목록만) |
| `prefers-reduced-motion` | `emulateMedia({ reducedMotion: 'reduce' })` · `getAnimations()` 진행 중 0 (Spinner 정지 arc 예외) | 0 |
| 1.4.4 · 1.4.10 · 1.4.12 | §8.2 | — |
| VoiceOver 수동 | Plan §12.3-B 절차 + Stage 8 추가(설정 → 데이터 관리 → 녹음 삭제 Dialog → 진행 상태 1회 낭독 → 탈퇴 Dialog) | `S8-M` |

---

## 10. Copy 초안 (영어 · 진단/판정/비교 0 · 기한 수치 0 — 최종 문구는 체크포인트 승인, `Q8-14`)

### 10.1 설정 목록

| 키 | 문구 |
|---|---|
| ACCOUNT 행 | *Data & privacy* · *Account* · (*Consent history*) · *Log out*(기존) |

### 10.2 데이터 관리

| 키 | 문구 |
|---|---|
| 제목 | *Data & privacy* |
| 섹션 | *RECORDINGS* · *DELETE DATA* |
| 보관 정책 | *Storytime recordings are kept for {rawAudioDays} days, then removed automatically. Conversation notes and growth signals stay so your reports keep working.* (`N8-03` ⓐ) |
| 녹음 행 | *Session recordings* · subtitle *{n} recording(s)* / *No recordings* |
| 전체 삭제 안내 | *This deletes {firstName}'s profile, recordings, notes, and reports from HARU. Your account stays, so you can start again.* (`N8-02` ⓐ) |
| 동작 행 | *Delete all data* |
| 진행 | *We're deleting your data* / *This can take a little while. You can leave this screen — the status will show here.* |
| 실패 | *We couldn't finish deleting your data* / *Nothing else changed. You can ask again.* / *Try again* |
| 완료 Toast | *Your data was deleted.* |
| 오프라인 | 기존 `networkErrorCopy` + *Nothing was sent.* |
| 요청 실패 (`VG8-C-05`) | 제목 = 기존 `errorCopyForCode` · 설명 *Nothing was deleted. You can try again.* (`DELETION_ALREADY_REQUESTED` 는 실패가 아니라 진행 info — §2.5) |
| 진행 · 실패 — 탈퇴 요청 (`VG8-C-12`) | *We're deleting your account* / *Your account and all of {firstName}'s data are being deleted. This can take a little while.* · *We couldn't finish deleting your account* / *Nothing else changed. You can ask again from Account.* |

### 10.3 녹음 목록

| 키 | 문구 |
|---|---|
| 제목 | *Session recordings* |
| 범위 | *Deleting a recording removes the audio and its highlight clip. Your conversation notes stay.* |
| 상태 | *Saved* · *Uploading* · *Not uploaded yet* · *Removed after {n} days* · *Deleted* |
| 버튼 | *Delete* (이름 *Delete recording, {title}, {date}*) |
| book null | *Storytime* |
| 빈 상태 | *No recordings to manage* / *Recordings from storytime will show up here.* |
| live | *Recording deleted.* |
| 행 삭제 실패 (`VG8-B-07`) | 제목 = 기존 `errorCopyForCode` · 설명 *Your recording of {title} from {date} wasn't deleted. You can try again.* |
| 행 삭제 오프라인 (`VG8-B-07`) | 제목 = 기존 `networkErrorCopy` · 설명 *Nothing was sent. Your recording of {title} from {date} wasn't deleted.* (`{title}` = 행 제목 · `{date}` = 행 날짜 라벨) |
| Dialog ① | *Delete this recording?* / *The audio and its highlight clip will be deleted. Your conversation notes stay. This can't be undone.* / *Delete recording* / *Keep* |
| 더 보기 | *Show more* |

### 10.4 계정

| 키 | 문구 |
|---|---|
| 제목 · 섹션 | *Account* · *SIGNED IN AS* · *DELETE ACCOUNT* |
| 안내 | *Deleting your account also deletes all of {firstName}'s data and signs you out on this device.* |
| 동작 행 | *Delete account* |
| Dialog ③ | *Delete your account?* / *Your account and all of {firstName}'s data will be deleted. This can't be undone.* / *Delete account* / *Cancel* |
| Dialog ② | *Delete all of {firstName}'s data?* / *Profile, recordings, notes, and reports will be deleted. Your account stays. This can't be undone.* / *Delete all data* / *Cancel* |
| 이미 요청 (`VG8-D-04`) | 제목 *Your data is already being deleted* / 설명 *You can delete your account after it finishes.* (`InlineAlert info` 2줄 표면 — §2.5 진행 알림과 같은 구조) |
| 탈퇴 요청 실패 (`VG8-D-03`) | 제목 = 기존 `errorCopyForCode` · 설명 *Nothing was deleted. You can try again.* · 오프라인 = 기존 `networkErrorCopy` + *Nothing was sent.* (§10.2 와 같음) |
| 탈퇴 후 Toast | *Your account was deleted.* |
| 쓰기 차단 | 제목 *Changes are paused* (`VG8-A-03`) / 설명 *Your data is being deleted, so changes are paused.* |

### 10.5 기기 draft

*Remove my answers from this device* · Dialog *Remove answers from this device?* / *Your answers about {firstName} will be removed from this device. Nothing was sent to HARU.* / *Remove* / *Keep* · Toast *Removed from this device.*

### 10.6 금칙어 점검 `[계산]`

진단·판정·비교어(*score · behind · delay · normal · problem · fail(아이 대상)*) 0 · 기한·수치(*within N days · 24 hours*) 0 — `{rawAudioDays}` 는 응답 값이며 리터럴 아님 · 이름 = first name · *permanently* 대신 *can't be undone*.

---

## 11. 이월 Visual Gap 항목

### 11.1 `VG6-H-09` 섹션 라벨 행 리듬 — A / B / C (`N8-15` → `Q8-15`)

Figma 근거: 라벨 행 h34(pad 10 · 텍스트 14) → gap 1 → 내용 · 섹션 gap 18 → **앞 내용 아래 → 글자 중심 35 · 글자 중심 → 내용 18 · 합 53** (`244:1414`~`1415` · `244:1426`). 현재 실측 (`stage-6-visual-gap.md` §1.1, 단위 px):

```
                    앞 내용 아래 → 글자중심   글자중심 → 내용   합      Figma
Reading routine     35                       18               53 ✓    53
AT HOME             28 (Δ−7)                 20 (Δ+2)         48      53
ABOUT YOU           28 (Δ−7)                 16 (Δ−2)         44      53
YOUR CHILD (아이콘)  (첫 섹션)                31 (Δ+13)        —       18
YOUR CHILD (설정)    (첫 섹션)                19 ✓             —       18
```

| 안 | 내용 | 화면 변화 (기술) | 영향 |
|---|---|---|---|
| **A (권고)** | 공통 recipe 1개: 라벨 위 여백 = `--child-routine-label-offset` 7 을 **공통 이름 `--section-label-offset`** 으로 승격(Tier 3, 값 그대로) · 라벨↔내용 = `--space-2-5` 10 통일 → ~~모든 섹션 **53 / 35**~~ **라벨 글자 중심 → 내용 = 18 (전 화면 불변량)** · 앞 내용 아래 → 라벨 글자 중심 = **섹션 gap + 15** → 섹션 gap 20 화면(Step 1 · 설정 아이 정보 — Figma 근거) **35 / 53** · 섹션 gap 16 화면(SettingsMenu · 데이터 관리 · 계정 — §2.0, Figma 없음) **31 / 49 현행** (`VG8-F-05`, `D8-3` — 서술 정정, 값 변경 0) | AT HOME 섹션이 5px, ABOUT YOU 가 9px 아래로 내려간다 · Step 1 전체 높이 +14 · 설정 아이 정보 ~~+5~~ **+7** (`VG8-F-04`) | Step 1(온보딩·Trial) · 설정 아이 정보 · ~~가입(`179:1733`·`1739` — 적용 전 행 기하 실측) · 프로필(`319:*`)~~ → 실측 결과 **미적용** (`VG8-F-06` · `VG8-F-07`) · **SettingsMenu · Stage 8 신규 화면도 같은 recipe**(Figma 없음 — 일관성) · baseline 재생성 + 연결성분 분해(`R-BASELINE-1` §5) |
| **B** (A 의 하위 결정) | `YOUR CHILD` 편집 아이콘 헤더 행(44, Stage 2 §4.3)은 A 로도 맞지 않는다 → ⓑ-1 **hit 44 유지 · 라벨을 44 행 안에서 위 정렬**(라벨 글자 중심 = 행 위 + 7 + 8 → 내용까지 18 에 근접, 아이콘 hit 는 행 아래로 13 넘침 — 겹치는 요소 없음 확인 필요) ⓑ-2 현행 유지(Δ+13 허용 차이) | ⓑ-1: 카드가 13px 위로 | Step 1 표시 모드만 |
| **C** | 현행 유지 — AT HOME Δ−5 · ABOUT YOU Δ−9 · YOUR CHILD(아이콘) Δ+13 허용 차이 등록 | 변화 0 | 독서 루틴만 Figma 값 — 같은 화면 리듬 불일치 지속 |

권고: **A + B ⓑ-1** — 단 ⓑ-1 은 구현 후 실측으로 hit 영역 겹침 0 을 확인하고, 안 되면 ⓑ-2 로 되돌린다. Stage 8 신규 화면은 Q8-15 결과를 그대로 따른다(§2.0).

**결과 (`D8-3`, 2026-11-21)**: A 적용(`S8-F`) · ⓑ-1 은 hit 44 와 Figma 18 이 겹침 없이 양립하지 않아(4px 겹침 — `stage-8-visual-gap.md` S8-F §3.3) **ⓑ-2 로 되돌림 → 허용 차이 `AD-S8-01`** (§12.5). 섹션 gap 16 화면 31 / 49 는 **현행 유지**(`VG8-F-05` — 디자이너 값 `R8-4` 도착 시 교체). 가입 · 프로필은 실측 결과 A 미적용, 가입 잔여 Δ−1/−2 = **`AD-S8-02`**.

### 11.2 `VG6-H-06` `Text tracking` prop (`N8-16` → `Q8-16`)

권고 **수용**. 조건 3: ① 자간 override 는 enum 으로만(`tracking?: 'section-label'`, px/em 수치 prop 금지) ② 두 번째 값이 생기면 Tier 2 typography 토큰 승격 재검토 ③ SectionLabel 컴포넌트 신설하지 않음(Stage 2 결정 유지). **승인 후** `docs/COMPONENT_MAP.md` Text 행에 아래 문구를 design-agent 가 등재한다:

> `Text` — prop `tracking?: 'section-label'` (enum 1값, 기본 미지정 = 변화 0) → `--section-label-letter-spacing` 0.72px (Figma `244:1313` 외 6노드 선언값 Bold 12 tracking 0.72). SectionLabel recipe = `caption-1 · secondary · bold · tracking="section-label"`. 수치 prop 금지 · 두 번째 값 = Tier 2 승격 검토 (`VG6-H-06`, `Q8-16`).

### 11.3 `VG6-D-12` in-app 기록 없을 때 Back (`N8-14` → `Q8-17`)

§6.3 표 — 시각 변화 0. 프리뷰 배포(`S8-I`) **전** 구현(`S8-F`). 검증 = 직접 URL 진입 × 대상 route e2e (AC-8-40).

---

## 12. Figma 누락 / 불일치 / 승인 필요 항목

### 12.1 Plan 과의 대조 — 정정·보완 `M8-##` (Plan 은 고치지 않는다 — plan-agent 보고)

| ID | Plan 위치 | 내용 | 처리 |
|---|---|---|---|
| **`M8-1`** | §2.1 §7.8 · AC-8-33 · §9 | *"계정 화면에 보호자 이메일(응답 값)"* — **`Caregiver`(`GET /v1/me`)에 `email` 필드가 없다**. `C8-1`~`C8-9` 에도 없다 | `Q8-10` — ⓐ 이면 `C8-10` (Caregiver `email` 추가) 를 plan-agent 가 `API_CONTRACTS` Rev 12 에 등재 |
| **`M8-2`** | `N8-07` ⓑ | `/onboarding/saved` 를 "Figma 없는 화면" 으로 적었으나 **Figma `179:1809`** 이며, 제출 **후**(가입자) 화면이라 미가입 draft 삭제 위치로 맞지 않는다 | `Q8-12` ⓓ 권고 |
| `M8-3` | §0.1 · §17-2·4 | 재사용 후보 *"Tag(status)"* — `Tag` 에 status tone 이 없다 (`76:440` = 색 4 + 아이콘 · 성별 · Not selected / 저장소 = capability 4 + neutral) | 행 상태 = 텍스트 (`Q8-05`) |
| `M8-4` | §8 `success` | fixture *"목록 3행(uploaded 2 · expired 1)"* — 행 상태 5종 · `book=null` · cursor 2페이지를 시각 검증하려면 부족 | §7 Mock 요청 |
| `M8-5` | §0.1 · `N8-30` | Figma 라이브 조회 불가 → **이 세션에서 해소** (§0) — `N8-30` 닫음 | — |
| `M8-6` | §11.12 AC-8-56 | 뷰포트 4종 — 가로 웹(852×393) · Text spacing(1.4.12) 이 빠져 있다 | §8.2 에 포함 (AC 추가는 plan-agent 판단) |

### 12.2 **사용자 결정 필요** — `Q8-01`~`Q8-21` (전부 권고안 있음)

⛔ = 해당 단위 착수 차단.

| ID | ↔ N8 | 질문 | 선택지 | 권고 | 차단 |
|---|---|---|---|---|---|
| **`Q8-01`** | `N8-01` | C-13 9건을 design-agent 명세(이 문서 §2)로 진행 · 화면별 승인 | ① 디자이너 Figma 요청 ② **이 명세** (+ 디자이너 요청서 병행 `Q8-21`) | **② 전부** — `D6-2`·`D7-3` 선례 · 신규 컴포넌트/토큰 0 이라 Figma 도착 시 교체 비용 작음 | ⛔ `S8-B`~`D` |
| **`Q8-02`** | `N8-01` · `N8-06` | 설정 `ACCOUNT` 행 라벨·순서 (§2.1) | ⓐ **Data & privacy · Account · Log out** ⓑ Log out 을 가운데 ⓒ 데이터 관리를 별도 그룹(`DATA`)으로 | **ⓐ** — 이동 행 먼저 · 동작 행 끝 · C-16 "ACCOUNT 그룹에 붙는다"(Stage 6 `N6-38`) | ⛔ `S8-B` |
| **`Q8-03`** | `N8-01` | 전체 삭제 진입 형태 (§2.2) | ⓐ **ListGroup 동작 행** (Log out idiom) ⓑ 화면 하단 Button(glass) ⓒ destructive 색 Button | **ⓐ** — 기존 시각 언어 · 주 CTA 가 삭제가 되지 않음 · 경고는 Dialog | ⛔ `S8-B` |
| `Q8-04` | `N8-13` | 녹음 행 썸네일 | ⓐ **없음 (basic 56)** ⓑ Library media 행(34×48 표지, 74) | **ⓐ** — 설정 밀도 · book null 행 · 상용 표지 노출과 분리 | `S8-B` |
| `Q8-05` | — | 행 상태 표현 | ⓐ **meta 텍스트** ⓑ Tag 신규 status tone(새 시각 언어 — 디자이너) | **ⓐ** | `S8-B` |
| **`Q8-06`** | `N8-08` | 행 삭제 컨트롤 | ⓐ **trailing Button glass sm "Delete"** ⓑ 행 전체 탭 → Dialog ⓒ trash 아이콘 IconButton (Lucide `trash-2` 등록) | **ⓐ** — 텍스트가 의미 전달 · 행 탭 오조작 방지 · 아이콘 신규 0 | ⛔ `S8-B` |
| `Q8-07` | — | expired · deleted 행 | ⓐ **목록에 남기고 상태 표시 · 삭제 버튼 0** ⓑ 숨김 | **ⓐ** — AC-8-19·25 와 일치 · "어디 갔는지" 설명 | `S8-B` |
| **`Q8-08`** | `N8-04` · `N8-10` | 진행 상태 표면 (§2.5) | ⓐ **InlineAlert info/error 문구 교체 · 진행률·스피너 0** ⓑ ProgressBar indeterminate ⓒ 전용 상태 카드(신규) | **ⓐ** — 서버가 진행률을 주지 않음 · 기존 컴포넌트 · reduced-motion 분기 0 | ⛔ `S8-C` |
| `Q8-09` | `N8-02` · `N8-10` | 전체 삭제 진행 중 탈퇴 버튼 | ⓐ **활성 + 서버 응답이 막으면 안내** ⓑ 비활성 | **ⓐ** (서버 의미 확정은 `N8-02`) | `S8-D` |
| **`Q8-10`** | `N8-05` | 계정 화면 식별 정보 — `email` 이 contract 에 없음 (`M8-1`) | ⓐ **`Caregiver.email` 추가(`C8-10`) 후 표시** ⓑ `displayName` 표시 ⓒ 식별 정보 없이 탈퇴 섹션만 | **ⓐ** — 어느 계정을 지우는지 확인하는 정보 · OAuth 계정도 email 보유 | ⛔ `S8-A`·`D` |
| **`Q8-11`** | `N8-29` · `N8-10` | 탈퇴 후 1회 안내 | ⓐ **welcome(`179:1701`) 위 Toast neutral** ⓑ welcome 상단 InlineAlert(레이아웃 삽입 — Figma 화면 변경) ⓒ 안내 없음 | **ⓐ** — 일시 오버레이 · Figma 레이아웃 불변. 단 Figma 화면 위 요소이므로 승인 필요 | ⛔ `S8-D` |
| **`Q8-12`** | `N8-07` | draft 삭제 위치 (`M8-2`) | ⓐ welcome 텍스트 링크(`179:1701` 변경) ⓑ `/onboarding/saved`(`179:1809` 변경 · 제출 후라 부적합) ⓒ ⓐ+ⓓ ⓓ **Trial 안내(C13-11) 아래 TextLink** | **ⓓ** — 디자이너 프레임 변경 0. 발견성이 부족하다고 보면 ⓒ | ⛔ `S8-D` |
| **`Q8-13`** | `N8-08` | 확인 다이얼로그 3종 + draft 1종 (§2.4 · §2.7) | 표대로 · 1회 확인 · 초기 포커스 취소 · 처리 중 닫기 무시 | 승인 요청 | ⛔ `S8-B`~`D` |
| **`Q8-14`** | `N8-03` · `N8-04` · `N8-02` | Copy 초안 §10 전체 | 표대로 (법무 확인 병행 — 보관·삭제 범위 문장) | 승인 요청 | ⛔ `S8-B`~`D` |
| **`Q8-15`** | `N8-15` | `VG6-H-09` (§11.1) | **A** · B · C + B 하위 ⓑ-1/ⓑ-2 · A 적용 범위에 SettingsMenu·Stage 8 화면 포함 | **A + ⓑ-1 (실측 실패 시 ⓑ-2) · 범위 포함** | ⛔ `S8-F` |
| `Q8-16` | `N8-16` | `VG6-H-06` (§11.2) | 수용(조건 3) / 비수용(SectionLabel 신설) | **수용** — 승인 후 COMPONENT_MAP 등재 | `S8-F` |
| `Q8-17` | `N8-14` | Back 부모 표 (§6.3) | 표대로 | 승인 요청 | `S8-F` |
| **`Q8-18`** | `N8-18` | 접근성 감사 기준 (§9.4) — axe 도입 + `color-contrast` 를 끄지 않고 장부 매핑 · 렌더 픽셀 대비 측정 · 44 hit 격자 측정 | 표대로 / axe 미도입(수동 체크리스트 — AC-8-46 NOT VERIFIED 가능) | **표대로 + 도입** | ⛔ `S8-G` |
| `Q8-19` | `N8-20` | 신규 가값 `P-41` (§5.3) · `P-04` Stage 8 사용처 추가 기록 | 등록 | 승인 요청 | `S8-B` |
| `Q8-20` | `N8-06` | 동의 이력 (§2.8) | 포함 시 §2.8 명세 / **제외** | **제외** (Plan 권고와 같음) | — |
| `Q8-21` | `N8-01` | 디자이너 요청서 `R8-##` (§12.3) 병행 발송 | 발송 / 보류 | **발송** — Figma 도착 시 교체 (`R8-01`) | — |

**차단 결정 (⛔)**: `Q8-01` · `Q8-02` · `Q8-03` · `Q8-06` · `Q8-08` · `Q8-10` · `Q8-11` · `Q8-12` · `Q8-13` · `Q8-14` · `Q8-15` · `Q8-18` — **12건**. 이 중 contract 영향은 `Q8-10`(`S8-A` 전 필요).

### 12.3 디자이너 요청서 `R8-##` (병행 — `Q8-21`)

| ID | 요청 |
|---|---|
| `R8-1` | 설정 `ACCOUNT` 그룹 3행 · 데이터 관리 · 녹음 목록(상태 5종 · 빈 상태) · 계정 화면 프레임 — 이 Spec §2 를 출발점으로 |
| `R8-2` | destructive 확인 버튼 색(`P-04` error-bg/border/fg) 확정 · 대비 |
| `R8-3` | 보조 텍스트(`P-01`) — SectionLabel · 행 meta 대비 |
| `R8-4` | 섹션 라벨 행 리듬 (`VG6-H-09`) — 설정 계열 공통 값 |
| `R8-5` | Trial 안내 + draft 삭제 링크 배치 (`C13-11` 확장) |
| `R8-6` | `P-41` 간격 값 |
| `R8-7` | 로그인 하단 *Create an account* 대비 (`P-43`) — Figma `179:1847` 색 또는 배경 확정 (`D8-3`) |
| `R8-8` | **Mock · 데모 프리뷰용 중립 책 표지** (`D8-4`, `VG8-I-02`) — 상용 표지 대체. 현행 = palette 단색 `--haru-palette-teal` · `-orange` · `-indigo`(216×309, 7:10, 무늬 · 글자 0) **유지**, 도착 시 교체. 요청 범위: 표지 면 모양(단색 / 무늬 / 제목 표기 여부) · 장수 · teal 이 주 버튼색 · Self-Direction 테마색과 같은 점(`VG8-I-05`) 검토. 틀(크기 · radius · 그림자)은 기존 `BookCover` 그대로 |

### 12.4 PRD ↔ Figma

직접 충돌 **0** (대상 화면 Figma 없음). PRD 내부 `§7.8 요금제` ↔ FR-26 은 `N8-05` (Plan §15.1) 그대로.

### 12.5 Stage 8 허용 차이 (사전 등록 — QA 는 FAIL 처리하지 않는다)

등록 근거 = 사용자 결정 `D8-3` (2026-11-21, `docs/decisions/stage-8-approvals.md`). 형식 선례 = Stage 2 Spec §11.3 `AD-S2-##`. 범위 밖 차이는 일반 규칙으로 판정한다.

| ID | 차이 | 원인 | 허용 범위 |
|---|---|---|---|
| **`AD-S8-01`** | Step 1 `YOUR CHILD` 편집 아이콘 헤더 — 라벨 글자 중심 → 카드 **≈30~31** (Figma `244:1426` 18, **Δ+13**) | 터치 44(`--size-touch-min`) 와 Figma 18 은 hit 4px 겹침 없이 양립 불가 — 편집 모드에서 *Done* 과 이름 입력의 hit 가 겹친다(`VG8-F-09` ⓑ-2) | Step 1(온보딩 · Trial) 표시 모드의 이 1구간, Δ ≤ +13 |
| **`AD-S8-02`** | 가입 `/auth/sign-up` 섹션 리듬 — 라벨 중심 → Input **16** (Figma 17, Δ−1) · hint 글자 중심 → 다음 라벨 중심 **40** (42, Δ−2) · Input 아래 → 다음 Input 위 **72** (74, Δ−2) | 토큰 스케일(8 · 10)로 정확히 맞출 수 없는 1~2px. A recipe 를 적용하면 Δ+7 로 악화(`VG8-F-06`) | 이 3구간, 각 \|Δ\| ≤ 2 |
| **`AD-S8-03`** | 회고 입력칸 높이 **40** — 프로젝트 터치 최소 44 미만 | Figma `91:715` 330×40 선언값 유지(최우선 규칙 1). WCAG 2.5.8 AA(24) 충족 · `S1-G-2` 선례 (`H8-6-N4`) | 회고 입력칸 1종, 높이 40 · 폭 330 |
| **`AD-S8-04`** (조건부) | Text spacing(1.4.12) · 196 폭(200% 등가, 1.4.4) 에서 **설계된 줄 수 제한** 요소의 말줄임 증가 | 줄 수 제한은 Figma 레이어 선언값 — 해제는 Figma 변경 (`H8-6-N5` ⓐ) | **§8.2 대조표에서 "전체 텍스트 경로 있음" 으로 확인된 요소만.** 경로 없음 = 항목별 사용자 결정 |

닫은 항목 (허용 차이 아님 — 기록):
- `VG8-B-12` Dialog 배경 blur — **미적용으로 닫음** (`D8-3`). Dialog 는 Stage 1 Spec §4.22 Figma 없음 → `surface-strong` 단색 명세이고, `321:2203` `HARU/Glass Rest` 는 design-agent DRAFT 라 디자이너 근거가 아니다. blur 를 원하면 디자이너 Figma + 사용자 승인으로 새로 연다.
- `VG8-F-05` 섹션 gap 16 화면 31 / 49 — Figma 프레임이 없어 비교 기준이 없으므로 허용 차이가 아니라 **현행 명세** (§11.1 정정).

---

## 13. Visual Gap 검토 계획 (최우선 규칙 5)

| 단위 | 비교 | 방법 |
|---|---|---|
| `S8-A` | UI 영향 없음 확인 | 기록만 |
| `S8-B` 설정 · 데이터 관리 · 녹음 목록 | 이 Spec §2.1~2.3 대비 · 설정 목록 = `321:1537` recipe(행 56 · radius 22 · `--shadow-bubble` · 라벨 Bold 12) computed | element screenshot 393/320 × 상태(기본 · 5상태 행 · 빈 · Loading · Error · Offline) · `getComputedStyle` |
| `S8-C` 진행 상태 | §2.5 표 4상태 + 완료 이동 · live 1회 | 상태별 screenshot · live 계수 |
| `S8-D` 계정 · 탈퇴 · draft | §2.6 · §2.7 · Toast on welcome(`179:1701` baseline 은 Toast 숨김 후 diff 0) | screenshot · baseline diff |
| `S8-F` | `VG6-H-09` 결정값 측정(라벨 중심 → 내용 18 · 앞 → 중심 = 섹션 gap + 15 — 섹션별 표 재작성, §11.1 정정 `D8-3`) · Back 시각 diff 0 | 측정 e2e · `--update-snapshots=all` + 연결성분 분해 |
| `S8-G` · `S8-H` | 수정으로 바뀐 baseline 전부 원인 분해 · 대비 측정표 · 그림자 프로브 | `R-BASELINE-1` §5·6 |
| `S8-I` · `S8-J` | UI 영향 없음 확인 | 기록만 |

## 14. development-agent Handoff (승인 후에만)

| 단위 | 이 Spec 에서 가져갈 것 | 주의 |
|---|---|---|
| `S8-A` | §7 Mock 요청(`M8-4`) · `Q8-10` 결과(`C8-10`) | 화면 0 |
| `S8-B` | §2.0 · §2.1 · §2.2 · §2.3 · §2.4-① · §2.9 · §3 · §10.1~10.3 | `90` 리터럴 0 · 행 삭제 = 서버 확정 후 로컬 · 포커스 §6.2 · live 1회 |
| `S8-C` | §2.5 · §2.4-② · §6.1 폴링 | 진행률 UI 0 · 폴링마다 재낭독 0 |
| `S8-D` | §2.6 · §2.4-③ · §2.7 · §10.4·10.5 | Toast on welcome 승인 범위만 · draft 삭제 서버 요청 0 |
| `S8-F` | §6.3 · §11 | Back 시각 변화 0 · `VG6-H-09` 는 결정안만 |
| `S8-G` · `S8-H` | §8.2 · §9.4 | 대비 위반을 끄지 말고 장부 매핑 |

구현 메모:
1. 신규 컴포넌트·토큰·아이콘 0 — 필요해 보이면 **멈추고 보고**(§4 조건부 2건).
2. 새 `overflow` 0.
3. 가값 `P-41` 값에는 `provisional: P-41` 주석.
4. 콘솔·devWarn 에 아이 이름 · 책 제목 · 세션 id · 이메일 0.
5. `Q8-*` · `P-41` 은 **승인 후** 적용.
