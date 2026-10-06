# Stage 3 Design Spec — Home · Activity Card 덱 · Reading Context · Library · Book Selection · 알림 설정

**Status: APPROVED (2026-10-05, user)** (작성 2026-09-30, design-agent) — 구현은 **Home 먼저, 검수 후 나머지**

**Based on**

- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `16:2` section `31:204`(Home & Session), page `8:2` 컴포넌트. **조회·실측 일자 2026-09-30** (`26:21` · `26:22` · `26:39` · `26:40` · `26:44` · `27:85` · `27:89` · `88:922` · `163:2648`(+`163:2649–2651`) · `86:438` · `86:482` · `86:512` · `30:74`(+`30:87` 전 계층) · `145:1132` · `163:1669` · `113:1993`(+`113:1991/1992`) · `163:2145`(+`163:2100–2142`) · `25:87` · `140:2971`)
- `docs/plans/stage-3-plan.md` (2026-09-29) — §2 In Scope · §7 Contract Delta · §8 Mock Scenarios · §9 Deliverables · §11 AC · §15 Handoff · §16 `D-1`~`D-20`
- **`docs/decisions/stage-3-approvals.md`** — **§2**(PRD ↔ Figma 우선순위 변경) · **§3**(`D-1`·`D-4`·`D-5`·`D-6` 확정) · **§4**(C-13 8건 전부 design-agent 명세) · **§5**(PRD 수정 대상 3건)
- `docs/design/stage-1-design-spec.md` — 토큰 3-tier·Shared UI 28종·공통 상태(P-10 확정)·Layout·접근성의 **정본**. 이 문서는 그 위에 Stage 3 화면만 얹는다.
- `docs/design/stage-2-design-spec.md` — 구조·라벨·허용 차이 표기 관례(`AD-S2-1`~`AD-S2-19`). **Stage 2 허용 차이는 Stage 3에도 그대로 적용된다.**
- `docs/COMPONENT_MAP.md` §1·§2·§5·§6 · `docs/FIGMA_SCREEN_MAP.md` §1.2 · `docs/DESIGN_SYSTEM.md` · `docs/DESIGN_TOKEN_MAP.md` · `.claude/rules/frontend.md` §6·§8·§9

**이 문서가 같은 패스에서 갱신한 다른 문서** — `D-1` ④ 지시

- `docs/design/stage-1-design-spec.md` **§2.2 · §4.12 · §5.2 · §6.2** (2026-09-30) — 탭바 `sticky` 정본화에 따른 여백·Toast offset 규칙 정합. 상세는 이 문서 §2.1.
- `docs/design/stage-2-design-spec.md` — **갱신 없음**. 검토 결과 Stage 2 문서에는 `fixed` 전제 기술이 없다(탭바 언급 4곳은 전부 "Stage 2에서 마운트하지 않는다" 또는 Stage 1 §2.2 인용).

**개정 2026-10-03 (design-agent)** — `docs/decisions/stage-3-approvals.md` **§9 · §9.1 · §9.2 · §9.3** 반영. 이 개정으로 **§13.1 의 남은 미결 ⑩⑪⑫ 가 전부 종결**되었고, **이 문서에 남은 미결은 0건**이다.

| 반영 | 내용 | 영향 절 |
|---|---|---|
| **approvals §9.2 ⑩** (`D-18` 에서 분리) | Reading Context `custom_time` picker = **30분 단위 48항목 확정**. 근거는 `D-18` 이 **아니라 `AC-3-23` + approvals §9.2 ⑩** 이다 — 이 시트는 Stage 3 In Scope 이므로 picker 규격을 이월 화면(알림 설정)에 묶어두지 않는다 | **§2.4** · §4.6 · §13.1 |
| **approvals §9.2 ⑪** (둘 다 렌더 확정) | `phase` + `pageRef` 동시 값 → **배지 2개 렌더 확정**. Figma 에 동시 예시가 없는 것은 **공백이지 충돌이 아니다**(`N-1` 과 같은 성격)이므로 `RECOMMENDED` 라벨을 해제한다. **contract 는 두 필드를 독립 optional 로 유지**하며 서버에 "하나만 보내라" 를 요구하지 않는다 | **§5.4.1** · §11.3 `AD-S3-24` · §13.1 |
| **approvals §9.2 ⑫** (`P-23` 신설) | Prompt 단계·페이지 배지 흰 라벨 **1.72:1** = **`가값 (P-23)` 신설**. `P-02` 에 흡수하지 **않는다** — 대상(Tier-3 `--prompt-phase-tag-fg`)과 교체 조건이 다르다 | **§6.2 · §6.3 · §6.4** · §5.4.1 · §13.1 |
| **`D-21`** (Prompt 개수 상한 해제, §9.1) | `promptPreview`·`promptSet.questions` **길이 상한 없음**. `--prompt-preview-collapsed-count`(3) 는 **cutoff 이며 cap 이 아니다**. **Frontend 는 `slice(0, 3)` 하지 않는다**. **`n ≥ 4` 표시 규격을 §5.1.1 에 신설**(접힌 높이·확장·키보드 도달이 개수에 무관) | **§5.1.1(신설 블록)** · §5.1 · §12.3 · §14 |
| **`D-22`** (`ActivityCard.targetCapability` 삭제) | 카드 단위 대표 역량이 없어진다 — 배지는 **`options[].capability` 만**을 근거로 렌더한다. `N-3`(`" Day"` suffix 폐기)과 같은 귀결 | §5.2 · §12.4 · `COMPONENT_MAP.md` §2 |
| **approvals §9.2 (Toggle · Chip)** | `Toggle` **3종 유지 확정**(사용처 1곳이어도 `D-14` 충족) · `Chip` 미선택 경계의 `P-02` 증빙은 **Stage 2 온보딩 화면**을 쓴다 | §4.5 · §6.3 · §12.8 |
| **approvals §9.3** | PRD 수정 대상 **5·6번 등재 완료** — §13.3 `N-7`·`N-2` 의 "PRD 수정 대상" 기록을 **§9.3 참조로 연결**(등재 요청이 아니라 완료) | §13.3 |

**개정 2026-10-02 (design-agent)** — `docs/decisions/stage-3-approvals.md` **§7 · §7.1 · §8 · §8.1 ~ §8.6** 반영. 이 개정으로 **`Plan D-xx 전제` 라벨은 전부 해소**되었고(`D-1`~`D-20` 승인 완료), §13.1 의 미결 8건 중 **7건이 결정**되었다(⑥은 Stage 2 Spec 개정으로 이관).

| 반영 | 내용 | 영향 절 |
|---|---|---|
| **D-8** (Figma 기준 채택) | `PromptPill` 이 **`phase`(PRE/POST) · `pageRef`(P.6) 배지를 실제로 렌더**한다. 이전 명세의 "표시하지 않는다 / prop 도 만들지 않는다" 는 **폐기** | §2.5 · **§5.4.1(신설)** · §5.4 · §6.2 · §8 · §10 · §11.2 · §11.3 `AD-S3-15`(재작성)·`AD-S3-24`(신설) · §12.11 · §13.3 N-7 |
| **D-13 / §7.1** (C — 1.77x 수용) | Home 캐릭터 에셋 실측 정정 — **933×1659 투명 원본**이 최대치이며 1056 대비 **123px 부족, 최대 1.77x**. "941 / 115px 부족" 표기는 폐기. **디자이너 대기 사유가 아니라 허용 차이**다 | §12.10 · §13.2 ⑩ · **§11.3 `AD-S3-25`(신설)** · §13.4 ① · §14-10 |
| **D-18** (설정 화면만 제외) | `/settings/notifications` 의 **카드 갱신 시간 · 리마인더 요일/시간 입력 UI 는 Stage 3 Out of Scope**. push 권한 사전 안내 UX 와 Reading Context 시트는 **구현 유지** | §1.1 · §2.14 · §2.15 · §3.1 · §3.2 · §6.3 · §8 · §10 · §11.2 |
| **D-17** (Mock 전용 route) | 서재 3개 시트는 **상태 기반**이며 **Mock 전용 route 가 진입점으로 추가**된다. route 가 사라져도 시트가 동작해야 한다 | §1.1 · §1.2 · §2.4 · §2.5 · §2.8 · §2.9 · §14 |
| **D-14** (원칙 확정) | "해당 화면의 컴포넌트가 나올 때 만든다" — 신규 Shared UI 는 3종 + `ListRow` 변형뿐(28 → 31). 제외 5종은 **그 화면이 나오는 Stage 에서** 만든다 (선행 구현 금지) | §4 · §5.12 · §14-4 |
| **§8.5 ①③④⑤⑦⑧⑨** | 캐릭터 버블 `characterLine` 정식 명세 · 증정 접수 **잠정 문구 사용** · `WeekSummaryChip` **개명 확정 + `streakDays` 삭제** · `Toggle` 치수 **가값 P-20** · `BookDetailSheet` 뒤로 = **Shelf 복귀** · `conversation_only` 일러스트 **가값 P-22** · Reading Context 6값 라벨 **확정** | §2.2 · §2.4 · §2.6 · §2.9 · §2.12 · §4.5 · §5.7 · §6.2 · §6.4 · §12.6 · §13.1 |

**개정 2026-10-01 (design-agent)** — `docs/decisions/stage-3-approvals.md` **§6 · §6.1 · §6.2** 반영. **N-2 외의 명세는 변경하지 않았다.**

- **N-2 Prompt 노출 규격 재작성** — 이전 명세 "카드 미리보기 **최대 3개 고정**"을 폐기하고 **표시 3개 + 확장(개수 상한 없음)** 으로 바꿨다. 영향 절 = §2.3 · §2.5 · §2.9 · **§5.1.1(신설)** · §5.1 · §5.4 · §6.2 · §7 · §8 · §9 · §10 · §11.2 · §11.3 · §12.3 · §12.5 · §13.3 · §14 · §15.
- **`Carousel` `overflow-x` 예외 = 조건부 승인** 반영 (§4.2 · §6.2 · §13.1 ② · §14-3). **`padding-block` / 음수 `margin-block` 그림자 보호 구조가 승인 조건**이며 (값은 상 24 / 하 80 (`D-REQ-4` 정정) — approvals §12.15), 그 구조 없이는 승인이 아니다.
- **N-1(서재 3섹션 채택) · N-3(" Day" suffix 폐기) 승인됨** — 두 항목의 **명세 본문은 변경 없음**. §13.3 의 상태 열만 갱신했다.

---

## 0. 이 문서를 읽는 법

### 0.1 라벨 (Stage 1 §0.1 · Stage 2 §0.1과 동일)

| 라벨 | 뜻 |
|---|---|
| `CONFIRMED (#id)` / `CONFIRMED (C-xx)` / `CONFIRMED (D-x)` | 사용자 결정 (`D-1`·`D-4`·`D-5`·`D-6` = stage-3-approvals §3, **`D-2`·`D-3`·`D-7`·`D-13` = §7, `D-8`~`D-20` = §8**) |
| `CONFIRMED (Figma)` | Figma에서 값을 직접 확인 (조회 2026-09-30) |
| `실측 (2026-09-30)` | design-agent가 브라우저 렌더 또는 Figma 좌표로 직접 측정 |
| `가값 (P-xx)` | 남은 가값 — Stage 0 `§4` 유래 **5건**(`P-01 · P-02 · P-04 · P-05 · P-16`) + Stage 2 신규 `P-17`(+후보 `P-18`·`P-19`) + **Stage 3 신규 `P-20` · `P-21`(후보) · `P-22` · `P-23`**. 현재 할당 집계는 **§6.5** (대장 소유는 분산 — §6.5 머리말) |
| `D-01` / `S1-G-2` | 승인된 수용 예외 |
| ~~`Plan D-xx 전제`~~ | **전부 해소됨 (2026-10-02)** — `D-1`~`D-20` 이 approvals §3·§7·§8 로 승인되었다. 본문에 남은 이 라벨은 **`CONFIRMED (D-xx)` 로 읽는다**. 권장안이 뒤집힌 항목(`D-4`·`D-5`·`D-8`·`D-17`)과 범위가 축소된 항목(`D-18`)은 해당 절에 결과를 반영했다 |
| `RECOMMENDED` | design-agent 제안 (사용자 미결정) |
| `신규 토큰 제안` | 값이 없어 이 문서가 처음 제안 — 승인 필요 |
| `NEEDS DECISION` | 사용자 / 디자이너 / 법무 결정 필요 |
| `허용 차이` | Figma ↔ 구현 차이를 사전 등록 — QA는 FAIL 처리하지 않음 (§11.3) |
| `C13-xx (명세)` | Figma 누락 화면 — approvals §4로 **design-agent 명세**가 승인된 것 |
| **`★ 승인 대기 (PRD↔Figma)`** | approvals §2 규칙에 따라 **Figma 안을 기본 제안으로 올리되 적용 전 사용자 승인이 필요한 새 충돌** (§13.3) |

### 0.2 권한 경계

- design-agent는 **Production Code를 작성하지 않는다.** 이 문서는 명세다.
- **Figma를 수정하지 않는다.** 디자이너 요청은 §13.4에 모은다.
- 화면 값은 **토큰 이름으로만** 적는다. Figma 실측 수치는 "현황 사실"로만 적고 구현 값은 토큰을 거친다.
- **approvals §2 규칙**: PRD ↔ Figma 충돌은 Figma 안을 기본 제안으로 올리되 **임의로 적용하지 않는다**. 이 문서가 새로 발견한 충돌은 전부 §13.3의 **승인 대기 목록**에 있고, 본문에서는 `★ 승인 대기` 로 표시한다.

### 0.3 이 문서가 다루지 않는 것

| 구분 | 이유 |
|---|---|
| **Stage 2-B** — `C13-09` 프로필 결과 · `C13-10` 발전 역량 · `CapabilityDiamondChart` · `PersonaCard` | 디자이너 Figma 대기 중 (stage-2-approvals §3). **Stage 3가 흡수하지 않는다** |
| 세션 화면 · 녹음 · Prompt Drawer(`88:960`) · `PromptCarousel` · 업로드 | Stage 4 |
| `/progress` **내용**(StatTile·차트·리포트) | Stage 7. Stage 3는 **탭 목적지 껍데기만** (`CONFIRMED (D-2)`, §2.13) |
| "My Saved" · 책 평점 · `ReadingNowCard` · 누적 읽기 분 | `CONFIRMED (D-7)`·`D-6` — 명세하지 않고 §11.3 허용 차이로만 등록 |

### 0.4 Stage 1·2에서 확정되어 그대로 적용되는 사실

| 항목 | 내용 | 근거 |
|---|---|---|
| 화면 골격 | 스크롤 컨테이너는 **AppColumn 바깥(뷰포트 전 폭)**, **`AppColumn` 안쪽 요소에 `overflow-*` 선언 금지**, TopBar·BottomTabBar는 `position: sticky` | Stage 1 §2.2 |
| 공통 상태 | Loading(Skeleton 우선) · Empty · Error+Retry · Offline Banner · Toast · Dialog = **P-10 확정 명세** | Stage 1 §5 |
| 토큰 | 3-tier 정의표 = Stage 1 §3 + Stage 2 §6.1(`--space-7`·`--space-10`) | Stage 1 §3 |
| focus ring | `--color-focus-ring` 2px / offset 2px, `:focus-visible` 만 | Stage 1 §9.3 (P-03 확정) |
| 반응형 | 320 / 600(`--bp-md`) / 1024(`--bp-lg`), ≥600은 480 컬럼 가운데 정렬, 다단 없음 | #12 |
| 허용 차이 | `AD-1`~`AD-10`(Stage 1) · `AD-S2-1`~`AD-S2-19`(Stage 2) **그대로 적용** | Stage 2 §11.3 |

---

## 1. 대상 화면 (Figma node → route)

### 1.1 Stage 3 화면·표면 13건

| # | 표면 | Route / 상태 | Layout | Figma | 근거 |
|---|---|---|---|---|---|
| 1 | **Home** | `/` | **Tab** | `26:21`(헤더·캐릭터·버블·dots·탭바) + 덱 `163:2648`·`86:438`·`86:512` | `C13-14 (명세)` — 카드가 배치된 프레임이 없다 (M-30) |
| 2 | **Reading Context 선택 시트** | `/` 위 Sheet | — | 결과 chip `86:538` 만 존재 | `C13-15 (명세)` |
| 3 | **Prompt 공개 시트** | `/` · `/library` 위 Sheet | — | **`86:482` "Prompt of this book"** | `C13-21 (명세)` — §12.5 판단 |
| 4 | **덱 대체 카드 3종** | `/` 덱 카드 변형 | — | 부분 (`86:512` compact) | `C13-16 (명세)` |
| 5 | **Library** | `/library` | **Tab** | `30:74` (+`30:87` 전 계층) | CONFIRMED (Figma) |
| 6 | **LibraryShelfSheet** ("See all") | `/library` 위 Sheet | — | `163:1669` + `163:1807` scrim | CONFIRMED (Figma) |
| 7 | **BookDetailSheet** | `/library` 위 Sheet | — | `145:1132` + `145:1450` scrim | CONFIRMED (Figma) |
| 8 | **Library 빈 상태** | `/library`, `/library/gift-requests` | — | 없음 | `C13-20 (명세)` |
| 9 | **보유 책 직접 등록** | `/library/add` | Stack | 없음 | `C13-17 (명세)` |
| 10 | **증정 신청 · 배송 상태** | `/library/gift-requests` | Stack | 없음 | `C13-18 (명세)` — 배송지 범위는 `CONFIRMED (D-15)` |
| 11 | **push 권한 안내** (알림 설정 화면은 **범위 축소**) | `/settings/notifications` | Stack | Toggle `17:113` 만 | **`CONFIRMED (D-18)`** — **카드 갱신 시간 · 리마인더 요일/시간 입력 UI 는 Out of Scope**. 이 route 는 **push 권한 블록만** 담는다 (§2.14) |
| 12 | **Settings (2행)** | `/settings` | Stack | 없음 (Stage 2 `C13-12` 확장) | C-16 |
| 13 | **Progress 준비 안내** | `/progress` | **Tab** | 없음 (`31:102`는 Stage 7) | `CONFIRMED (D-2)` |

- **시트 4건(#2 · #3 · #6 · #7)의 열림 상태는 부모 페이지가 소유한다.** 단 **`CONFIRMED (D-17)`** 로 `LibraryShelfSheet`(#6) · `BookDetailSheet`(#7) · `ReadingContextSheet`(#2) 에 **Mock 데모 전용 route 가 진입점으로 추가**된다 (approvals §8.3).
  - **설계 제약(§8.3 (2))**: route 는 **열림 상태를 열어주는 진입점일 뿐**이며 **시트의 열림 조건이 아니다**. route 를 삭제해도 시트는 부모 화면의 상태로 그대로 동작해야 한다. → 시트를 `route === '…'` 로 조건부 렌더하는 구조를 **명세가 금지**한다.
  - route 정의는 **한 파일에 모은다**(삭제 지점 1곳). Stage 8 Handoff 에 **제거 대상**으로 등재한다. 구조·파일 위치는 development-agent 결정이며 이 문서는 **"route 유무와 무관하게 동작"** 만 요구한다.
  - Prompt 공개 시트(#3)는 **`BookDetailSheet` 안의 뷰 전환**이므로 별도 route 를 두지 않는다 (§2.5).
- Stage 2에서 만든 `/` Home skeleton(`C13-13`)은 #1이 **대체**한다.

### 1.2 화면 간 이동 (Prototype 연결은 MCP로 노출되지 않음 — **확인 불가**)

```
BottomTabBar (3탭 고정, #15)
  Library ──→ /library ──┬─ "See all"        → LibraryShelfSheet   (#6)
                         ├─ 책 행/아이템 탭  → BookDetailSheet     (#7)
                         │                      └ "Prompts"        → Prompt 시트 (#3)
                         ├─ "Add a book"     → /library/add        (#9)
                         └─ 증정 상태 진입   → /library/gift-requests (#10)
  Home    ──→ /      ────┬─ 덱 카드 선택     → ReadingContextSheet (#2) → 선택 확정
                         └─ 카드 "See prompts" → Prompt 시트 (#3)
  Progress ─→ /progress  (준비 안내, #13)

/ 헤더 설정 아이콘 → /settings → "Notifications" 행 → /settings/notifications (#11, push 권한 블록만)
```

**Stage 3에서 실행되지 않는 이동**: 카드·시트의 "Start Session" → 세션 화면 (`CONFIRMED (D-3)` — 버튼은 렌더하되 `aria-disabled`).

**Mock 전용 route 진입점 (`CONFIRMED (D-17)`)** — 위 흐름과 **병렬**로 존재하며, 위 흐름이 유일한 열림 경로다. route 는 같은 상태를 외부에서 열어줄 뿐이다.

| 시트 | 부모 화면 경로 (정규) | Mock route 진입점 |
|---|---|---|
| `LibraryShelfSheet` | `/library` "See all" | `/library` 의 시트 열림 상태로 진입 |
| `BookDetailSheet` | `/library` 행 탭 · Shelf 행 탭 | 〃 (책 식별자 포함) |
| `ReadingContextSheet` | `/` 카드 CTA | 〃 |

- route 가 제거되면 **위 표의 "부모 화면 경로" 만 남고 기능은 그대로**여야 한다 — 이것이 §8.3 (2) 의 요구다.

---

## 2. 화면별 레이아웃 구조

> 모든 화면은 `AppColumn`(min 320 / max 480 / gutter `--layout-gutter`) 안에 있고, 스크롤 컨테이너는 컬럼 **바깥**이다. **`AppColumn` 안쪽 요소에 `overflow-*` 를 선언하지 않는다** (Stage 1 §2.2 · `QA-1-L1`). 유일한 예외 요청은 §4.2 `Carousel` 이며 그 절에 별도 근거와 승인 요청을 적었다.

### 2.1 ★ BottomTabBar 고정 방식·여백 규칙 — `CONFIRMED (D-1)` + **실측 2026-09-30**

`sticky` 가 정본이다(`D-1`). 파생 규칙 4행을 **실제 렌더 측정**으로 확정한다.

**측정 방법** — `TabLayout` 의 DOM·CSS 기하를 그대로 재현한 정적 문서를 Playwright(Chromium)로 렌더하고 `getBoundingClientRect()` 를 읽었다. 조건 = **폭 320 / 393 / 600 / 1024 × 스크롤 상단 / 하단 × 래퍼 `padding-top` 12 vs 35** (총 16 케이스). 뷰포트 높이 812, `env(safe-area-inset-bottom)=0`(데스크톱).

| 측정 항목 | 결과 (4폭 전부 동일) |
|---|---|
| 탭바 하단 모서리 | **항상 `bottom = 812`** = 뷰포트 하단. 스크롤 상단·하단 모두 동일 |
| 탭바 상단 모서리 | 항상 `top = 742` (= 812 − `--layout-tabbar-height` 70) |
| 중앙 버튼 상단 | 항상 `top = 707` (= 742 − `--layout-tabbar-center-overhang` 35) |
| 탭바 폭 | 320 → 288 · 393 → 361 · 600/1024 → **448** (= 480 − 2×16 gutter) |
| `pt-3`(12)일 때 `main` 하단 ↔ 중앙 버튼 상단 | 스크롤 하단에서 **`main` 이 23px 더 아래** = 중앙 버튼이 마지막 콘텐츠를 23px 덮는다 ❌ |
| `pt-35`일 때 | **겹침 0px** ✅ |

**확정 규칙 4행**

| 항목 | 확정값 | 근거 |
|---|---|---|
| **고정 방식** | `position: sticky; inset-block-end: var(--layout-safe-bottom)` | `CONFIRMED (D-1)`. 측정 결과 좌표가 `fixed` 와 **동일**하다 (`main flex-1` 이 남는 높이를 전부 먹어 탭바가 항상 뷰포트 하단에 온다) |
| **콘텐츠 하단 확보량** | **`--layout-tabbar-center-overhang` + `--layout-safe-bottom`**. `--layout-tabbar-height` 는 **더하지 않는다** | sticky = 흐름 안이라 바 높이는 이미 레이아웃에 잡혀 있다. 더하면 70px 빈 공간이 생긴다 (`D-1` ①) |
| **확보 지점 (이중 계상 금지)** | overhang = `.haru-app-shell__bar-bottom` 의 `padding-block-start`, safe-bottom = `AppColumn` 의 기존 `padding-block-end`. **페이지·`main`·EmptyState는 탭바 관련 하단 padding 을 추가하지 않는다** | 두 곳에서 각각 35를 주면 70이 된다. 단일 소유 지점을 래퍼로 고정한다 |
| **`pt-3`(12) ↔ overhang(35) 통일값** | **`var(--layout-tabbar-center-overhang)`(35)** — `pt-3` 은 **23px 부족**하다 | 위 실측. `pt-3` 은 리터럴이기도 해서 토큰 참조로 바꾸는 편이 rules/frontend §6에도 맞다 |
| **Toast 하단 offset** | `calc(--layout-safe-bottom + --space-4 + --layout-tabbar-height + --layout-tabbar-center-overhang)` — **기존 식에 overhang 을 더한다** | **기존 식은 검증 실패.** 기존 식이면 Toast 하단 `y=726`, 중앙 버튼 상단 `y=707` → **19px 겹친다**. `--z-toast`(60) > `--z-tabbar`(20) 이므로 Toast 가 홈 버튼을 덮는다. overhang 을 더하면 Toast 하단이 중앙 버튼 위 `--space-4` 지점(`y=691`)에 놓인다 |

- `.haru-tab-bar` 자체는 `position: relative` 이고 중앙 아이콘이 `position: absolute; inset-block-start: calc(-1 * var(--layout-tabbar-center-overhang))` 이다 — **이 구조는 유지**한다. 바꾸는 것은 래퍼 `padding-block-start` 와 Toast offset **2곳뿐**이다.
- 이 4행에 맞춰 `docs/design/stage-1-design-spec.md` **§2.2(확인 필요 블록) · §4.12(Toast 치수/배치) · §5.2(EmptyState 하단 padding) · §6.2(중앙 버튼 접근성 항목)** 을 같은 패스에서 갱신했다 (2026-09-30).
- **탭바 마운트로 재생성이 필요한 기존 baseline**: Stage 1·2의 42건 중 **0건**. 탭바는 Stage 1·2 어느 화면에도 마운트되지 않았고(Stage 2 §0.4 · §3.1), Toast offset 변경은 `--layout-tabbar-height` 를 쓰는 **탭바 있는 Layout 에서만** 적용된다. dev gallery 의 `s1-*` 탭바 baseline은 래퍼 `pt` 를 쓰지 않으므로 영향이 없다 — 단 gallery 에서 `TabLayout` 을 통째로 렌더하는 baseline이 있다면 그 1건은 재생성 대상이다 (§14-2에서 development-agent가 확인).

### 2.2 `/` Home — `C13-14 (명세)` · Figma `26:21` + 덱 `163:2648`

**Figma 현황(사실)**: `26:21` 에는 헤더(`26:39` 워드마크 · `26:40` chip · `26:44` 설정) · 버블 `88:922` · 캐릭터 `26:22`(441×560, x=−24 → 좌우 gutter 만큼 bleed) · deck dots `27:85` · 탭바 `27:89` 만 있고 **Activity Card 가 배치되어 있지 않다**(M-30). 카드 변형 4종은 loose 노드다.

**IA 제안 (`RECOMMENDED` — C13-14 핵심)**: 캐릭터를 **배경 레이어**로 두고 덱을 그 위에 얹는다. `26:21` 의 좌표가 이미 그 구조다 — 캐릭터는 y=96–656을 차지하고 dots 는 y=734, 탭바는 y=766이라 **카드(≈358–377 높이)가 들어갈 자리는 캐릭터의 하반신 위뿐**이다.

```
TabLayout
├ TopBar (variant=inline, sticky)                       ← Figma 26:39 / 26:40 / 26:44
│   ├ leading  Text "HARU"  --text-title-2  (AD-S2-14 그대로)
│   ├ trailing WeekSummaryChip (§5.7)                    ← 26:40 자리
│   └ trailing IconButton(icon=settings, label) → /settings   ← 26:44
├ main (스크롤)
│   └ HomeStage  (position: relative — page-only 조립 블록)
│       ├ [레이어 0] CharacterIllustration(asset=home-character, decorative)
│       │     inline: 컬럼 좌우 gutter 까지 bleed (Figma 441 = 393 + 2×24)
│       │     block : 스테이지 상단 정렬, aspect 그대로, `object-fit: cover`
│       │     ※ position:absolute · z-index 없음(DOM 먼저) — overflow 선언 없음
│       └ [레이어 1] 흐름 콘텐츠
│           ├ CharacterBubble(tail=bottom-left)          ← 88:922
│           │     gap ↓ (flex spacer, 최소 --space-6)
│           ├ ActiveSessionNotice (조건부, §5.9)
│           ├ ActivityCardDeck = SwipeDeck(depth 3)      ← 163:2648 / 86:438
│           │     └ ActivityOptionCard × 3 (§5.1)
│           ├ DeckControls (prev / next 버튼, §4.2 규칙 동일)
│           ├ PageIndicator(count=3, index)              ← 27:85
│           └ HomeFooterNote — 지난 세션 하이라이트 한 줄 (§5.8)
└ BottomTabBar (sticky, §2.1)                            ← 27:89 / 25:87
```

| 영역 | 규격 |
|---|---|
| TopBar | `variant=inline`, `--topbar-height`. 워드마크 ↔ chip ↔ IconButton = `--topbar-gap` |
| 캐릭터 bleed | `margin-inline: calc(-1 * var(--layout-gutter))`, `inline-size: calc(100% + 2 * var(--layout-gutter))`. **`overflow` 선언 없음** — 바깥 스크롤 뷰포트가 이미 뷰포트 폭에서 클리핑한다 (§0.4) |
| 버블 | `SpeechBubble` + `CharacterBubble`. 상단 여백 `--space-6`, 좌측 정렬(Figma x=26 ≈ gutter 24) |
| 버블 ↔ 덱 | `flex spacer` — 남는 높이를 흡수하되 **최소 `--space-6`**. 캐릭터 얼굴이 카드에 덮이지 않도록 하는 유일한 장치다 |
| 덱 | 카드 폭 = 콘텐츠 폭 100%. `--deck-inset-x`(8) · `--deck-peek-y`(16) · `--deck-depth`(3) 는 Stage 2 값 그대로 |
| 덱 ↔ 컨트롤 ↔ dots | `--space-3` / `--space-3` |
| dots ↔ 하이라이트 한 줄 | `--space-4` |
| 하단 | §2.1 규칙 — **페이지는 탭바 관련 하단 padding 을 넣지 않는다** |

- **캐릭터는 `decorative`(`aria-hidden`)** 다. 의미는 버블 문구가 담당한다.

**캐릭터 버블 — `CONFIRMED (§8.5 ①, 2026-10-02)`**

`HomeSummary` 에 **`characterLine` 필드가 추가**되어 버블이 정식 명세 대상이 되었다 (이전 "contract 공백" 상태 해소). contract 반영은 plan-agent / development-agent 소관이며 이 절은 **화면 규격만** 정한다.

| 항목 | 규격 |
|---|---|
| 컴포넌트 | `SpeechBubble`(Shared, 시각) + `CharacterBubble`(Domain, 문구) — Figma `88:922` |
| 데이터 | **`HomeSummary.characterLine` 값만 표시**한다. Frontend 가 문장을 만들거나 가공하지 않으며 접두어·접미어를 붙이지 않는다 (`rules/frontend.md` §8) |
| **값 없음** | `characterLine` 이 `null`·빈 문자열이면 **버블 자체를 렌더하지 않는다** (Stage 2 `S2-COPY-1` 빈 슬롯 규칙). placeholder·기본 문구를 넣지 않는다 |
| 위치 | 캐릭터 레이어 위 흐름 콘텐츠의 첫 요소. 상단 여백 `--space-6`, 좌측 정렬(Figma x=26 ≈ gutter 24), tail = `bottom-left` |
| 타이포 | `--text-subhead` 계열 (Stage 1 `SpeechBubble` 규격 그대로), 줄 수 제한 없음 — **고정 높이를 두지 않는다** |
| 길이 | 버블이 길어지면 아래 덱이 밀린다. 덱과의 간격은 `flex spacer`(최소 `--space-6`)가 흡수한다 |
| 접근성 | 버블 텍스트가 **캐릭터의 의미를 전달하는 유일한 수단**이다. `aria-hidden` 금지. 로딩 중에는 Skeleton 1~2줄 |
| 문구 규칙 | §10 금지어 적용 — 서버 문구가 금지어를 포함하면 **화면이 교정하지 않고 그대로 표시**하며, Mock fixture 는 금지어를 넣지 않는다 |
- `26:21` 의 `88:909`(66×27 미상 프레임)은 역할을 특정할 수 없어 **렌더하지 않는다** → §11.3 `AD-S3-18`.

### 2.3 `/` Activity Card 덱 — `SwipeDeck` 재사용 (`CONFIRMED (D-14)`)

**판단: 스택이 맞다 → `SwipeDeck`(depth 3) 재사용.** 근거 = ① `26:21` 이 **PageIndicator(dots) 3점**을 쓰고 가로로 이어진 트랙을 두지 않았다 ② PRD §7.9 "카드 덱 3장 스와이프" ③ `163:2648` 의 가로 3열은 **폭 1134px 짜리 탐색용 frame**(화면 아님, FIGMA_SCREEN_MAP §1.2)이라 배치 근거가 아니다 ④ `SwipeDeck` 은 이미 Pointer Events + prev/next 버튼 + `prefers-reduced-motion` 로 검증되어 있다.

`SwipeDeck` 에 필요한 Stage 3 동작 (**신규 컴포넌트 없이 prop 수준**):

| 항목 | Stage 2(설문) | Stage 3(Home 덱) |
|---|---|---|
| 진행 방향 | 앞으로만 (응답 → 다음) | **양방향** — `index` controlled, prev/next 모두 활성 |
| 종료 | 마지막 카드 후 제출 | 종료 없음. 선택은 **카드 안 CTA**가 한다 (스와이프 ≠ 선택) |
| 순환 | 없음 | **없음**(`loop=false`) — 끝에서 버튼 `disabled`, 사라지지 않음 |
| 접근성 이름 | "Previous/Next question" | **"Previous option" / "Next option"** |
| **카드 높이** | 사실상 고정(문항 카드) | **가변** — Prompt 확장(§5.1.1)으로 front 카드 높이가 늘어난다. `SwipeDeck` 은 `block-size` 를 고정하지 않는다 |

- **세로 확장은 스와이프와 축이 겹치지 않는다** — 카드 안에 `overflow-*` 스크롤 박스를 만들지 않고(§5.1.1) 확장은 **단일 버튼 press** 로만 일어나므로, 덱의 가로 드래그 판정(폭 25% 임계, §7)과 경쟁하는 연속 제스처가 없다. 카드 안에 `touch-action` 도 선언하지 않는다.
- **인덱스가 바뀌면 Prompt 확장은 접힌다** (§5.1.1) — 펼쳐진 뒤 카드가 앞으로 올라오면 덱 높이가 급변한다.
- **스와이프로 선택이 확정되지 않는다.** 선택은 카드의 주 CTA(§5.1)로만 일어난다 — 오조작 시 되돌릴 수 없는 mutation 을 제스처에 묶지 않는다.
- 카드 전환 시 `aria-live="polite"` 문구 형식: **`"Option {n} of 3: {book title}"`** (책이 없는 대체 카드는 `"Option {n} of 3: {kind label}"`). `RECOMMENDED`.

### 2.4 `/` Reading Context 선택 시트 — `C13-15 (명세)`

**구현 근거 (정정 2026-10-03)** — 이 시트는 **Figma 에 있어서** 구현하는 것이 아니다. Figma 에 있는 것은 **선택 결과 chip `86:538` 하나뿐**이고 **선택 UI 와 시간 picker 는 `C13-15` 로 Figma 누락 등록**되어 있다(§1.1 · §13.4 ⑩). 구현 근거는 **① `C13-15` = design-agent 명세로 진행(approvals §4) ② Stage 3 In Scope (`AC-3-23`)** 이다. `approvals §8.4` 의 "Figma 에 있으므로" 표현은 부정확하며 **정본이 교정되었다** — 구현한다는 결론은 동일하다. 디자이너 판이 오면 이 절이 대체된다.

`Sheet`(title) + `RadioGroup`(variant=card) 6항목 + 조건부 시간 picker + ActionBar.

```
Sheet (title="When will you read?")           ← 문구 RECOMMENDED
├ RadioGroup  role=radiogroup  (ReadingContext 6값)
│   ├ Now
│   ├ Bedtime
│   ├ After pickup            ← contracts `after_pickup` (PRD "유치원 하원 후")
│   ├ Weekend morning
│   ├ In the car
│   └ Pick a time…            ← `custom_time`
├ (custom_time 선택 시에만) SelectTrigger "Time" → 중첩 없이 **같은 시트 안에서 목록 전환**
│     30분 단위 48항목 (`CONFIRMED`, approvals §9.2 ⑩), `00:00`–`23:30`, `HH:mm`
└ ActionBar: Button(accent, fullWidth) "Continue"   — 미선택 시 aria-disabled
```

**6값 영문 라벨 — `CONFIRMED (§8.5 ⑨, 2026-10-02)`**

사용자 결정으로 **design-agent 명세값이 확정 라벨**이 되었다. `docs/API_CONTRACTS.md` §2.2 의 "영문 라벨 design 확인" 표시는 해제 대상이다 (문서 갱신은 plan-agent / development-agent 소관).

| contracts enum | 화면 라벨 (확정) | 비고 |
|---|---|---|
| `now` | **Now** | |
| `bedtime` | **Bedtime** | |
| `after_pickup` | **After pickup** | PRD "유치원 하원 후" |
| `weekend_morning` | **Weekend morning** | |
| `in_the_car` | **In the car** | |
| `custom_time` | **Pick a time…** | 선택 시 시간 목록으로 전환 |

- 라벨 문자열은 **feature 단위 copy 모듈 한 곳**에 모은다 (2026-09-26 사용자 원칙 — 문구가 바뀌어도 화면 코드를 고치지 않는다). 컴포넌트에 문자열을 박지 않는다.
- 선택 결과를 읽는 접근성 이름도 같은 라벨을 쓴다. 라벨 뒤에 설명을 덧붙이지 않는다.

| 규칙 | 내용 |
|---|---|
| 시간 picker | **`CONFIRMED (approvals §9.2 ⑩, 2026-10-03)`** — **30분 단위 48항목**(`00:00` ~ `23:30`, 표시·값 모두 `HH:mm`), **네이티브 `<input type="time">` 금지**. 시트 **중첩 금지** — `SelectTrigger` 를 누르면 같은 Sheet 안에서 목록 뷰로 전환하고 back 으로 돌아온다 (scrim 2겹 방지, P-05 일관성). **근거는 `D-18` 이 아니라 `AC-3-23` + approvals §9.2 ⑩** 이다 — 이 시트는 **Stage 3 In Scope** 이므로 picker 수치 규격을 이월 화면(알림 설정 `C13-19`)의 디자인 도착에 묶어두지 않는다. 알림 설정 화면이 나중에 다른 단위를 쓰더라도 이 시트의 규격은 바뀌지 않는다 |
| 결과 표시 | 확정 후 카드 ActionBar 의 `ReadingContextChip`(`86:538` "Bedtime · 9:00 PM")에 반영 |
| 진입 시점 | 카드 CTA → 이 시트 → `POST …/selection`. **`CONFIRMED (D-9)`** — 카드 경로는 `readingContext` **필수**, 서재 경로는 nullable |
| route | **열림 상태는 `/` 가 소유**한다. Mock 전용 route 는 진입점으로만 추가된다 (§1.2, `D-17`) |
| 상태 | 전송 중 = Button loading · 실패 = 시트 유지 + `InlineAlert tone=error` + 선택 보존 |

### 2.5 `/` Prompt 공개 시트 — `C13-21 (명세)` · Figma **`86:482`**

**`86:482` "Prompt of this book" 이 이 화면의 Figma 근거다.** 구조(실측): 제목 + trailing icon, 그 아래 `PromptPill` ↔ `CoachingNote`(beige) 쌍 반복, 마지막 pill.

```
Sheet (title = "Prompts of this book", trailing = IconButton close)
└ 반복 × n   (n = 서버가 준 Prompt 전부. 상한 없음 — §5.1.1)
    ├ PromptPill (tone=tinted)                 ← 질문 (말줄임 없음)
    └ CoachingNote (tone=neutral/beige)        ← 부모용 코칭 문장 (PromptSet.coachingLine / Prompt별)
```

| 규칙 | 내용 |
|---|---|
| 개수 | **서버가 준 전부 — 상한 없음** (`CONFIRMED (N-2)`, §5.1.1). `86:482` 실측 3 은 **예시 개수이며 상한이 아니다** |
| **이 시트만 갖는 것** | ① **코칭 문장**(`CoachingNote`) ② **말줄임 없는 질문 전문**(카드는 접힘·펼침 모두 2줄 말줄임) ③ **카드가 없는 경로**(서재)의 Prompt 보기. 카드 확장(§5.1.1)은 **질문 목록만** 드러내므로 이 시트는 **폐지하지 않는다** (§12.5) |
| **단계·페이지 배지** | **표시한다 — `CONFIRMED (D-8, approvals §8.1)`**. `PromptPill` 이 `phase`(PRE/POST) · `pageRef`(P.6) 배지를 렌더한다. 규격은 **§5.4.1**. 이 시트는 카드보다 폭 여유가 같으므로 **카드와 동일한 배지 규격**을 쓴다 |
| 진입점 | ① **Home 카드 헤더 우상단 `IconButton`** — Figma `86:438` 우상단 아이콘 자리, 접근성 이름 "Prompts with coaching notes" (기존 "See all prompts" `TextLink` 는 폐지 → §11.3 `AD-S3-23`) ② `BookDetailSheet` 안에서는 **시트를 겹치지 않고 같은 `Sheet` 안에서 Prompt 뷰로 전환**한다 — §2.4 의 "시트 중첩 금지"(scrim 2겹 방지)와 동일 처리, back 으로 복귀. FR-20 "책별 Prompt 보기" |
| 데이터 | Home 경로 = `ActivityCardSelection.promptSet`, 서재 경로 = `GET /v1/books/:bookId/prompts` |
| route | **만들지 않는다.** 이 시트는 `BookDetailSheet` 안의 **뷰 전환**이거나 Home 카드 헤더에서 열리는 상태이므로 `D-17` 의 Mock route 대상 3건에 포함되지 않는다 (§1.2) |

### 2.6 `/` 덱 대체 카드 3종 — `C13-16 (명세)`

`ActivityOptionCard` 의 `kind` 변형이며 **새 컴포넌트가 아니다**. Figma 근거는 `86:512`(compact, "Alternative" 캡션)까지이고 **종류 식별 표현이 없다** → 아래가 명세다.

| `kind` | 표지 자리 | 제목 자리 | 식별 표현 (색 단독 금지) | 보조 |
|---|---|---|---|---|
| `book` | `BookCover` | 책 제목 + 저자 | 없음(기본) | 추천 이유 1–2문장 |
| `reread_book` | `BookCover`(같은 책) | 책 제목 + 저자 | **`Tag tone=neutral` "Read again"** + 아이콘(Lucide `rotate-ccw`) | "새 Prompt" 를 문장으로 밝힌다 (서버 `reason` 값) |
| `conversation_only` | **`BookCover` 대신 일러스트 슬롯** — **기존 캐릭터 에셋 전용(轉用), `가값 (P-22)`** (`decorative`) | **책 제목 없음** → 활동 제목 1줄 (서버 값) | **`Tag tone=neutral` "No book tonight"** + 아이콘(Lucide `message-circle`) | 〃 |

- **책 소진 상황**(§13, `books-exhausted`)은 **별도 `kind` 가 아니다** — 덱 3장이 전부 `reread_book`/`conversation_only` 로 채워진 상태다. 그 위에 **덱 상단 `InlineAlert tone=info` 1줄**(서버 문구 슬롯)을 얹고, 하단에 `TextLink` "Request a book" → `/library/gift-requests` · "Add a book you own" → `/library/add` 를 둔다.
- `86:512` 의 **"Alternative" 캡션**은 위 `Tag` 로 대체한다 → §11.3 `AD-S3-12`.
- `86:512` 의 **빈 라벨 pink 배지**는 `CapabilityBadge` 의 라벨을 채운다 → §11.3 `AD-S3-11`.

**`conversation_only` 일러스트 슬롯 — `가값 (P-22)` 확정 (`§8.5 ⑧, 2026-10-02`)**

| 항목 | 규격 |
|---|---|
| 에셋 | **기존 캐릭터 에셋만 전용한다.** 신규 에셋을 만들지 않으며, 외부 이미지·AI 생성 이미지를 쓰지 않는다 |
| 사용 에셋 | `CharacterIllustration` 이 이미 쓰는 에셋 중 하나를 **1개 고정**으로 쓴다 (카드마다 바뀌지 않는다). 구체 파일 선택은 development-agent 가 §12.10 의 해상도 규칙 안에서 정한다 |
| 슬롯 규격 | `BookCover(md)` 와 **같은 박스**(폭 `--book-cover-w-md`, `--book-cover-aspect`)를 차지한다 — 카드 레이아웃이 `kind` 에 따라 흔들리지 않게 한다. `object-fit: contain`, 배경 `--color-surface-tinted`, radius `--radius-control` |
| 접근성 | `decorative`(`aria-hidden`). 의미는 `Tag` "No book tonight" 과 활동 제목이 담당한다 |
| 가값 이유 | 전용 에셋이 없어 **다른 맥락의 캐릭터 이미지를 빌려 쓴다**. 전용 에셋이 도착하면 **파일만 교체**하며 슬롯 규격·코드는 바뀌지 않는다 → §6.4 `P-22` · §13.4 ⑬ |

### 2.7 `/library` — Figma `30:74` (+`30:87`)

**Figma 실측 (2026-09-30)** — Content x=24 w=345.

| 블록 | Figma 좌표 | 명세 |
|---|---|---|
| 제목 행 | y=0 h=40. "Library" 33 tall · chip 135×34 우측 | `TopBar variant=large`, trailing = `WeekSummaryChip` |
| 제목 → 첫 섹션 | 40 → 56 = **16** | `--space-4` |
| SectionHeader | h=20. title 좌 · "See all" 우(14 tall) | §4.1 |
| header → 캐러셀 | 36 − 20 = **16** | `--space-4` |
| 캐러셀 | h=216 (커버 블록 + 캡션 + PageIndicator) | §4.2 |
| 섹션 ↔ 섹션 | 268 − 252 = **16** | `--space-4` |
| 목록 행 | h=**74**, padding-inline 16, 썸네일 34×48 @(16,13), 텍스트 x=62(gap 12), chevron 15 @ x=314(우 inset 16), divider 1px | §4.3 |

```
TabLayout
├ TopBar(variant=large, title="Library", trailing=WeekSummaryChip)
├ main
│   ├ SectionHeader("Our curated shelf", action="See all")   ← 30:74 / 163:1624
│   │   └ Carousel(BookShelfItem × n) + PageIndicator        ← 113:1994
│   ├ SectionHeader("Books you own",     action="See all")   ← ★ 아래 주 참조
│   │   └ Carousel(BookShelfItem × n) + PageIndicator        ← 145:779
│   ├ SectionHeader("Finished together", action=null)
│   │   └ ListGroup(BookListRow × n)  + "Show more"          ← 30:140 / 163:2145
│   └ LibraryFooterActions
│        ├ Button(variant=glass, fullWidth) "Add a book you own"  → /library/add
│        └ TextLink "Gift requests"                               → /library/gift-requests
└ BottomTabBar
```

> ⚠️ **이 절(§2.7)과 §2.8 의 Library 구조는 `docs/design/stage-3-library-design-spec.md` 가 대체한다** (2026-10-06, approvals §14~§19). 아래 위 ASCII 트리와 "Books you own" 표기는 **낡은 것이며 구현 근거가 아니다.**

- ★ **정정 (approvals §14.1, Orchestrator 가 Figma 로 직접 검증)** — L-1 `30:74` 의 섹션 제목은 **중복이 아니다**: `163:1625` `Our curated shelf` · **`163:1633` `Favorites`** · `30:139` `Finished together` **세 개가 전부 다르다**. 제목이 중복된 프레임은 L-1 이 아니라 **L-3 `163:1669`** 다 (`163:1684`·`163:1688`). 따라서 이 문서가 적었던 "두 번 중복" 은 **사실이 아니며**, 그 전제로 등록된 `AD-S3-4`("Books you own")는 **무효·삭제**다. Figma 문구는 **`Favorites`** 이고 **"Books you own" 은 Figma 에 없는 문구**(최우선 규칙 #2 위반)였다. 섹션은 FR-20 의 `gifted`/`owned`/`history` 필터와 1:1 대응하지 **않는다** — 표시 축은 `curated`/`favorites`/`finished` 3개이고 `owned`/`gifted` 는 표식으로 드러내지 않는다 (`L-OPEN-14`).
- 캡션 "Emotion" / "Resilience" / "Confidence" → **4대 역량 표시 라벨**로 교체 (#14, M-13) → §11.3 `AD-S3-5`. **보완**: 표시 라벨이 Figma 캡션보다 길어 11px 1줄에 들어가지 않는다 → 줄바꿈·말줄임 규칙은 `stage-3-library-design-spec.md` §6.3 이 정한다.
- **정정 (approvals §15)** — `Rated 4.5`(`L-D3`) · `Reading now`(`L-D2`) 는 **Figma 대로 구현한다**. `My Saved`(L-2 `145:1156`)는 채택하지 않고 L-1 의 **`Favorites`**(`L-D1`)를 쓴다. 따라서 `AD-S3-6`·`AD-S3-7`·`AD-S3-8` 은 **무효**이며 `AD-L-02` 로 대체된다. `D-7` 의 "평점·Reading now·My Saved 미구현" 은 이 결정들로 뒤집혔다 (approvals §15.1).
- `/library/add` · `/library/gift-requests` 진입점이 Figma 에 없다 → **`C-13` ② 로 design-agent 가 명세한다** (`L-OPEN-12`, approvals §16.2). 이 결정으로 명세 자체는 정당화되지만 **`LibraryFooterActions`(Button + TextLink) 라는 형태는 Figma 근거가 없어 폐기**하고, `stage-3-library-design-spec.md` §7 의 `LibraryEntryActions`(`ListGroup` + `ListRow` ×2) 로 다시 설계했다.

### 2.8 `/library` LibraryShelfSheet ("See all") — Figma `163:1669` · `163:1807`

```
Scrim (--color-scrim, 가값 P-05)
└ Sheet (title = 섹션 제목, trailing = IconButton close, snap = large)
    ├ ListGroup(BookListRow × 전체, 커서 페이지네이션)
    └ (하단 고정 없음 — 행 탭 → BookDetailSheet 로 교체 전환)
```

- ~~Figma 의 시트 하단 ActionBar(Save / Start Session)는 **책이 선택된 상태**의 표현이다. Stage 3에서는 행 선택이 곧 `BookDetailSheet` 전환이므로 시트 자체에는 ActionBar 를 두지 않는다.~~ → **철회 (approvals §17.2, `L-OPEN-03`)**. `163:1898`(`type=shelf`)에 헤더 + Book List + `Button/card`(★ Save + Start Session)가 실재하고 L-3 에 실제 인스턴스가 있다. **Figma 대로 ActionBar 를 넣는다** → `AD-S3-19` **철회**. 시트의 `Start Session` 도 `D-3` 에 따라 비활성(`aria-disabled`)이다 (approvals §13.10). 규격은 `stage-3-library-design-spec.md` §4.6.
- 스크롤은 시트 내부가 아니라 **시트 본문 자체가 늘어나고 바깥 스크롤 컨테이너가 스크롤**한다 (§0.4 overflow 금지 규칙). 시트 최대 높이는 §9.
- **열림 상태는 `/library` 가 소유**한다. Mock 전용 route 는 같은 상태를 외부에서 열어주는 **진입점**일 뿐이며, route 가 제거돼도 "See all" 경로가 그대로 동작해야 한다 (`CONFIRMED (D-17)` · §1.2).

### 2.9 `/library` BookDetailSheet — Figma `145:1132` (+`145:1450`)

Figma 의 시트 내용 = `ActivityOptionCard(density=full, face=front)` 와 **같은 구성**이다(`145:1085`). 따라서 **같은 도메인 컴포넌트를 재사용**한다.

```
Scrim
└ Sheet
    └ ActivityOptionCard(density=full, context=library)
        ├ CapabilityBadge
        ├ BookSummary (BookCover 58 + 제목 + 저자 + 추천 이유)
        ├ PromptPreview (§5.1.1)  접힌 상태 PromptPill × min(3, n) + [n>3] "Show all {n} prompts"
        │      ※ 코칭 문장 보기 = 헤더 우상단 IconButton → **같은 Sheet 안 Prompt 뷰 전환**(중첩 금지, §2.5)
        └ ActionBar
            ├ (ownership 에 따라) Button(glass) "Request this book" | TextLink "Where to buy"
            └ Button(accent) "Start Session"   ← Stage 3 disabled (`CONFIRMED (D-3)`)
```

| ownership | ActionBar 보조 슬롯 |
|---|---|
| `owned` · `gifted` | 보조 없음 |
| `favorite_only` | `Button(glass)` "Request this book" (증정 신청, `POST …/gift-requests`) + `TextLink` "Where to buy"(외부, 새 탭 표기) |
| `gift_pending` | `Button` 자리에 **`GiftStatusTag`** + `InlineAlert tone=info` — §13 대기 중 대체 안내(직접 등록 / 대화 전용) |

**뒤로 가기 — `CONFIRMED (§8.5 ⑦ · §8.3 (4), 2026-10-02)`**

| 진입 경로 | 뒤로 가기 결과 |
|---|---|
| `/library` 목록 행 탭 → `BookDetailSheet` | **`/library` 로 복귀** (시트만 닫힌다) |
| **`LibraryShelfSheet` 행 탭 → `BookDetailSheet`** (교체 전환) | **`LibraryShelfSheet` 목록으로 복귀** — 둘 다 닫지 않는다 |
| Mock route 직접 진입 | 부모(`/library`)로 복귀. route 는 진입점일 뿐이므로 **뒤로 가기 규칙을 바꾸지 않는다** |

- 원칙: **들어온 경로와 나가는 경로를 일치시킨다.** 교체 전환(§7)으로 들어왔으면 교체 전환으로 되돌린다.
- Shelf 복귀 시 **Shelf 의 스크롤 위치와 포커스(해당 행)를 복원**한다 (§10 "교체 전환 시에도 포커스를 잃지 않는다").
- 시트는 `Esc`·닫기 버튼으로도 닫히며, 그 경우에는 **현재 시트만** 닫힌다(= 뒤로 가기와 같은 결과).

### 2.10 `/library` 빈 상태 — `C13-20 (명세)`

| 위치 | 조건 | 표현 |
|---|---|---|
| "Our curated shelf" | `gifted` 0건 | **섹션 자체를 숨기지 않는다.** `EmptyState`(inline, 캐러셀 자리) — 설명 + `Button(glass)` "See the curated shelf" |
| "Books you own" | `owned` 0건 | `EmptyState`(inline) + `Button(accent)` **"Add a book you own"** → `/library/add` |
| "Finished together" | `history` 0건 | `EmptyState`(inline), 액션 없음 (첫 세션은 Stage 4) |
| `/library` **전체 0건** | 세 필터 모두 0 | **화면 단위 `EmptyState`**(세로 가운데) — 일러스트 + 제목 + 설명 + 주 CTA "Add a book you own" + 보조 `TextLink` "Request a book" |
| `/library/gift-requests` 0건 | 신청 0건 | 화면 단위 `EmptyState` + `TextLink` "Browse the curated shelf" |

- 시각 규격은 **Stage 1 §5.2 EmptyState(P-10 확정)** 그대로. 이 절은 **배치와 다음 행동만** 정의한다.
- **하단 padding 은 넣지 않는다** — §2.1 확보 지점 규칙.
- 문구는 성취·비교 언어를 쓰지 않는다: "You haven't finished any books" ❌ → **"Finished storytimes will show up here."** ✅ (`RECOMMENDED`).

### 2.11 `/library/add` 보유 책 직접 등록 — `C13-17 (명세)`

```
StackLayout
├ TopBar(variant=inline, leading=back, title="Add a book")
├ main
│   ├ TextField(type=search, label="Search by title", trailingAction=clear)  ← 가값 P-17
│   ├ [결과 있음]  ListGroup(BookListRow(media) × n, 탭 → 확인 다이얼로그 없이 바로 등록)
│   ├ [결과 없음]  EmptyState(inline)
│   │     └ Button(glass) 'Add "{query}" as a title'      ← Stage 2 Step 3 선례와 동일 패턴
│   └ [직접 입력 폼] FieldGroup
│         ├ TextField "Title"   (필수, 1–200)
│         └ TextField "Author"  (선택, ≤120)
└ 하단 ActionBar: Button(accent, fullWidth) "Add to my books"
```

| 규칙 | 내용 |
|---|---|
| 검색 endpoint | Stage 2 `GET /v1/books/search` **재사용** |
| 등록 성공 피드백 | **Toast**(tone=success) + `/library` 로 복귀 + 해당 책이 "Books you own" 캐러셀 **선두**에 나타남. 시각 강조(하이라이트)는 두지 않는다 |
| 직접 입력 책의 표지 | 없음 → **`BookCover variant=placeholder`** (§5.3). 대체 표지는 pastel + 제목 이니셜 |
| 에러 | 필드 에러 = `TextField errorText`(가값 P-04). 전송 실패 = `InlineAlert tone=error` + **입력 보존** |
| 중복 제출 | `Idempotency-Key`(계획 §7.2). UI는 버튼 loading 으로 2회 탭을 막는다 |

### 2.12 `/library/gift-requests` 증정 신청 · 배송 상태 — `C13-18 (명세)`

```
StackLayout
├ TopBar(variant=inline, leading=back, title="Gift requests")
├ main
│   ├ InlineAlert(tone=info)  ← 접수 안내 문구 (잠정 문구 사용 — 아래 표)
│   └ ListGroup
│        └ BookListRow(media)
│             ├ leading  BookCover(sm 34×48)
│             ├ title    책 제목
│             ├ subtitle "Requested {date}"        ← 상대시간 표현 금지, 절대 날짜
│             └ trailing GiftStatusTag(status)     ← §5.6
└ (빈 상태는 §2.10)
```

- **신청 CTA 는 이 화면에 없다** — 신청은 `BookDetailSheet`(§2.9)에서 한다. 이 화면은 **상태 확인 전용**이다.
- **접수 직후 흐름**: 시트에서 신청 → 시트가 `InlineAlert tone=success` 로 전환(신청 접수 + 대기 중 대체 안내) → `TextLink` "See gift requests" 로 이 화면 진입.
- **중복 신청**(`GIFT_REQUEST_DUPLICATE`): 오류 화면이 아니라 시트 안 `InlineAlert tone=info` — "You already requested this book." + 상태 링크.
- **배송지 입력 UI 는 만들지 않는다** — `CONFIRMED (D-15)`. 요청 payload 는 `{ bookId }` 뿐이다.
- 상태 6종의 tone 매핑은 §5.6. status 색 = **가값 P-04**.

**증정 접수 안내 문구 — `CONFIRMED (§8.5 ③ · §8.2, 2026-10-02)`**

이전 명세의 "슬롯을 비워 둔다(= 미렌더)" 는 **폐기한다.** 사용자 결정은 **잠정 문구를 넣고 사용**하는 것이다.

| 항목 | 규격 |
|---|---|
| 적용 지점 | ① `BookDetailSheet` 신청 직후 `InlineAlert tone=success` ② `/library/gift-requests` 상단 `InlineAlert tone=info` |
| 잠정 문구 | approvals §8.2 예시 — `Your request is in. We'll reach out with delivery details.` |
| **금지** | **수치·기한·배송 소요일을 넣지 않는다** ("in 3–5 days", "within 2 weeks", "무료" 등). 운영 확정 전에 약속이 되는 표현을 쓰지 않는다 |
| 소유 | 문구는 **copy 모듈에만** 둔다. 운영 표현이 확정되면 **copy 모듈 값만 교체**하며 화면 코드는 바뀌지 않는다 |
| 미렌더 조건 | 빈 슬롯 규칙은 **유지**한다 — copy 값이 비면 `InlineAlert` 자체를 렌더하지 않는다. 다만 Stage 3 기본값은 위 잠정 문구이므로 **정상 경로에서는 항상 렌더된다** |
| 톤 | 사실 진술 + 다음에 일어날 일. 감탄사·이모지 금지 (§10) |

### 2.13 `/progress` 준비 안내 — `CONFIRMED (D-2)`

```
TabLayout
├ TopBar(variant=large, title="Progress")
├ main → EmptyState (세로 가운데)
│   ├ 일러스트  CharacterIllustration(asset=bookworm)  ← 163:2642 재사용, decorative
│   ├ 제목      "Your first report is on the way"                 (RECOMMENDED)
│   ├ 설명      리포트 발행 기준(#17: 녹음 세션 3회 + 누적 1시간)을 **설명**하는 1–2문장
│   └ 액션      없음
└ BottomTabBar
```

- **진행도 수치·차트·`ReportOverview` 호출 0건** (`CONFIRMED (D-2)`). 진행률 표시는 "3회 중 1회" 같은 **달성률 언어**로 미끄러지므로 Stage 3에서는 **수치를 아예 넣지 않는다**.
- 탭 활성 상태는 §4.4의 비색상 표시 규칙을 따른다.

### 2.14 `/settings/notifications` — **push 권한 블록만** · `CONFIRMED (D-18, approvals §8.4)`

> **★ 범위 축소 (2026-10-02).** 사용자 결정 "알림 설정 화면만 제외" 에 따라 **카드 갱신 시간 · 리마인더 요일/시간 입력 UI 는 Stage 3 Out of Scope** 다. 이전 판의 `"Daily card"` · `"Storytime reminder"` 두 `ListGroup` 명세는 **이번 Stage 에서 구현하지 않는다**. QA 는 FR-08 의 설정 화면 부분을 **Out of Scope** 로 기록한다 (FAIL 아님).

**Stage 3 In Scope / Out of Scope**

| 구분 | 항목 |
|---|---|
| **In Scope** | push 권한 **사전 안내 → 요청 → 허용/거부** UX 전체 · `PushPermissionPort` 를 통한 권한 상태 3종 표현 (`D-16`) · Mock 시나리오 `push-permission-denied` · `/settings` 의 "Notifications" 행(C-16) |
| **Out of Scope (이월)** | `cardRefreshTime` 시간 입력 · `reminderDays` 요일 선택 · `reminderTime` 시간 입력 · 리마인더 on/off 행 · 변경 즉시 `PUT /v1/notification-preferences` 호출 UX |
| **contract 는 유지** | `GET/PUT /v1/notification-preferences` · `POST /v1/push-devices` · `DELETE /v1/push-devices/:id` 정의는 **그대로 둔다** (Contract 는 화면보다 앞서도 된다 — approvals §8.4) |
| 이월 대상 | 알림 설정 화면은 **디자이너 Figma 요청**(§13.4 ⑭) 후 도달 Stage 로 이월. **이 화면의** `cardRefreshTime`·`reminderTime` picker 수치 규격과 `Chip` 7개는 **그 Stage 에서 결정**한다. **Reading Context 시트의 picker 는 여기에 묶이지 않는다** — `approvals §9.2 ⑩` 으로 **Stage 3 규격(30분 단위 48항목)이 확정**되었고 근거가 `AC-3-23` 이다(§2.4). 알림 설정 화면이 나중에 다른 단위를 쓰더라도 §2.4 규격은 바뀌지 않으며, 반대로 §2.4 가 이 화면의 규격을 선결하지도 않는다 |

**이 route 가 남는 이유** — ① `/settings` 의 "Notifications" 행(C-16)이 가리킬 목적지가 필요하다 ② push 권한 사전 안내 UX 가 놓일 표면이 필요하다. 따라서 route 는 유지하되 **내용은 push 권한 블록 하나**다.

```
StackLayout
├ TopBar(variant=inline, leading=back, title="Notifications")
├ main
│   └ ListGroup "Push notifications"
│        ├ [권한 default] 사전 안내 블록 + Button(accent) "Turn on notifications"
│        ├ [권한 granted] ListRow(title="Push notifications", trailing=Toggle)  ← pushEnabled
│        └ [권한 denied]  InlineAlert(tone=info) + 기기 설정 안내 (재요청 버튼 없음)
│   (Out of Scope — 이 화면에 "Daily card" · "Storytime reminder" 그룹을 만들지 않는다)
└ (pushEnabled 변경은 즉시 반영 — 별도 저장 버튼 없음)
```

| 항목 | 규격 |
|---|---|
| **권한 사전 안내** | 권한 요청 **전에** 무엇을 언제 보내는지 1–2문장으로 밝힌 뒤 사용자가 버튼을 눌러야 OS 프롬프트가 뜬다. 화면 진입만으로 권한을 요청하지 않는다 |
| **권한 거부** | OS 프롬프트는 재표시되지 않으므로 **앱 안에 "다시 요청" 버튼을 두지 않는다** — 기기 설정 경로를 문장으로 안내한다. 거부해도 **화면의 다른 요소는 계속 조작 가능**해야 한다 |
| `Toggle` | 권한 `granted` 일 때만 렌더. 규격은 §4.5 (치수 = **가값 P-20**) |
| 저장 실패 | 해당 행만 이전 값으로 되돌리고 `InlineAlert tone=warning`. 화면 전체를 오류로 바꾸지 않는다 |
| 문구 | "You'll miss your streak" 같은 압박 문구 금지. 무엇을 보내는지 사실만 적는다. 이월된 설정 항목을 **"곧 나옵니다" 류로 예고하지 않는다** (약속이 된다) |
| 빈 화면 아님 | 권한 블록 1개만 남아도 `EmptyState` 를 쓰지 않는다 — 조작 가능한 컨트롤이 있는 화면이다 |

### 2.15 `/settings` 2행 — C-16

Stage 2의 1행(Log out) 위에 **"Notifications" 행 1개**를 더한다.

```
ListGroup
├ ListRow(title="Notifications", chevron)  → /settings/notifications
└ ListRow(title="Log out", destructive)    → ConfirmDialog (Stage 2 그대로)
```

- 그룹 순서는 **이동 행 → 파괴적 행** 이며 두 행 사이에 `Divider` 를 둔다. 구조·토큰은 Stage 2 §2.14 그대로다.

---

## 3. 사용 컴포넌트와 Variant / State

### 3.1 기존 Shared UI 28종 재사용 매트릭스 (Stage 3에서 실제로 마운트되는 것)

| 컴포넌트 | Stage 3 사용처 | 신규로 쓰는 variant / state |
|---|---|---|
| `Surface` | 카드 · 시트 · 칩 · 탭바 · 목록 그룹 | `material=raised`(덱 상단 카드) |
| `AppBackground` · `AppColumn` | 전 화면 | — |
| `Text` | 전 화면 | — |
| `Icon` | 탭바 · chevron · 상태 아이콘 · 대체 카드 식별 아이콘 | Lucide `rotate-ccw` · `message-circle` · `gift` · `plus` 신규 사용 |
| `Button` | 카드 ActionBar · 시트 · 빈 상태 · 권한 요청 | **`disabled` + `aria-disabled`**(Start Session, `CONFIRMED (D-3)`) |
| `ButtonGroup / ActionBar` | 카드 · 시트 하단 | `layout=inline`(보조 + 주) |
| `IconButton` | 헤더 설정 · 시트 close | — |
| `TopBar` | 전 화면 | **`variant=large`**(Library · Progress) 첫 실사용 |
| **`BottomTabBar`** | `/` · `/library` · `/progress` | **첫 실마운트** (§2.1 · §4.4) |
| `Tag` | 대체 카드 식별 · 증정 상태 · 역량 배지 base | `tone=neutral` 신규 사용 |
| `Chip` | **Stage 3 사용 없음** — 요일 다중 선택이 `D-18` 로 Out of Scope (§2.14) | — |
| `SelectTrigger` | **Reading Context 시트의 `custom_time` 1곳만** (카드 갱신·리마인더 시간은 `D-18` Out of Scope) | — |
| `FieldGroup + TextField` | `/library/add` 검색·직접 입력 | `type=search` + `trailingAction=clear`(가값 P-17) |
| `RadioGroup(card)` | Reading Context 6값 | — |
| `ProgressBar` | **사용 없음** | — |
| `PageIndicator` | 덱 dots · 캐러셀 dots | — |
| `Sheet + Scrim` | Context · Prompt · Shelf · BookDetail · 시간 목록 | `snapPoints`(large) |
| `ListGroup + ListRow` | 서재 목록 · 증정 목록 · 설정 · 알림 설정 | **`media` + `meta` 변형**(§4.3, 확장) |
| `SectionHeader` | 서재 3섹션 | **신규**(§4.1) |
| `InfoRow` | 미사용 | — |
| `DividerWithLabel` | 미사용 | — |
| `TextLink` | "See all" · 외부 구매 링크 · 보조 액션 | 외부 링크 표기 규칙 적용 |
| `SpeechBubble` | Home 버블 | — |
| `StarRating` | **사용 없음** (`CONFIRMED (D-7)`) | — |
| `StatTile` | 사용 없음 (Stage 7) | — |
| **`Carousel`** | 서재 2섹션 | **신규**(§4.2) |
| `SwipeDeck` | Home 덱 | **재사용**(§2.3) |
| **`Toggle`** | **push on/off 1곳만** (리마인더 토글은 `D-18` Out of Scope) | **신규**(§4.5) — 치수 **가값 P-20** |
| `Spinner / Skeleton` | 덱 · 서재 · 목록 | Stage 1 §5.1 그대로 |
| `EmptyState` | 서재 3섹션 · 증정 · Progress | Stage 1 §5.2 그대로 |
| `ErrorState(+Retry)` | 전 데이터 화면 | Stage 1 §5.3 그대로 |
| `InlineAlert / Banner` | 오프라인 · **증정 접수 안내(잠정 문구, §2.12)** · 증정 대기 · 권한 거부 · 책 소진 | `tone=offline` · `info` · `success` · `warning` |
| `Toast` | 등록 성공 · 재시도 | **하단 offset 변경**(§2.1) |
| `Dialog / ConfirmDialog` | 로그아웃(기존) | — |

### 3.2 화면 × 신규/확장 컴포넌트

| 화면 | `SectionHeader` | `Carousel` | `Toggle` | `ListRow(media/meta)` |
|---|---|---|---|---|
| `/` | — | — | — | — |
| `/library` | ✓ ×3 | ✓ ×2 | — | ✓ |
| `/library` 시트 | — | — | — | ✓ |
| `/library/add` | — | — | — | ✓ |
| `/library/gift-requests` | — | — | — | ✓ (meta=`GiftStatusTag`) |
| `/settings/notifications` | ✓(그룹 제목 ×1) | — | ✓ ×1 (push on/off) | ✓ ×1 |

> `D-18` 범위 축소 반영 — 알림 설정 화면의 `Toggle` 2개 중 **리마인더 토글은 Out of Scope** 이고 `Chip` ×7(요일)도 Stage 3 사용처가 없다 (§2.14).

---

## 4. 신규 Shared UI 3종 + 1종 확장 명세 (28 → 31) — `CONFIRMED (D-14)`

**원칙 (사용자 지시 원문, 2026-10-02): "해당 화면의 컴포넌트가 나올 때 만든다."**

| | 내용 |
|---|---|
| Stage 3 에서 **만드는 것** | `SectionHeader`(§4.1) · `Carousel`(§4.2) · `Toggle`(§4.5) + `ListRow` **media·meta 변형 확장**(§4.3) → **28 → 31** |
| Home 덱 | **`SwipeDeck`(depth 3) 재사용** — 신규 덱 컴포넌트를 만들지 않는다 (§2.3 · §12.7) |
| Stage 3 에서 **만들지 않는 것** | `StatTile` · `TextArea` · `StarRating` · `PromptCarousel` · `SegmentedTabs` — **그 화면이 나오는 Stage 에서** 만든다. Stage 3 에 사용처가 없으므로 지금 만들면 **다음 Stage 선행 구현**이다 (§5.12 · §14-4) |
| 적용 범위 | 이 원칙은 Shared UI 뿐 아니라 Domain 컴포넌트에도 적용된다 (§5.12 목록) |

### 4.1 `SectionHeader` — Figma `30:74` / `163:1624` · `163:1632` · `30:138`

| 항목 | 규격 |
|---|---|
| 구조 | `title`(좌) · `action`(우, 선택) 한 행. Figma h=20 |
| variant | `default` (제목만) · `withAction` (제목 + `TextLink`) |
| state | action 이 `TextLink` 이므로 rest / hover / pressed / **focus-visible** / disabled 를 `TextLink` 가 소유 |
| 치수 | 행 높이 = 내용 높이(고정 금지). 제목 ↔ action `--space-3` 이상, action 은 우측 정렬 |
| 토큰 | 제목 `--text-headline` / `--color-fg-primary`. action `--text-caption-1` / `--color-fg-link`. 아래 여백은 **부모가** `--space-4` |
| 접근성 | 제목은 `<h2>`. `action` 의 접근성 이름은 **"See all {섹션 제목}"** — "See all" 단독은 링크 목적이 불분명하다 (WCAG 2.4.4) |
| 터치 | action hit area **44×44** (시각 높이는 14 유지, hit slop 확대) |
| Figma 근거 | `CONFIRMED (Figma)` — 제목 20 tall, "See all" 14 tall, 우측 x=306(우 inset 39 = 라벨 폭) |

### 4.2 `Carousel` — Figma `113:1993` (+`113:1991/1992`) · 사용 `113:1994` · `145:779`

**Figma 실측**: 트랙 345 폭, 블록 216 높이, 아이템 3열 동시 노출. `PageIndicator` 가 트랙 아래 중앙.

| 항목 | 규격 |
|---|---|
| 구조 | `viewport`(가로) → `track`(flex) → `item` × n, 그 아래 컨트롤 + `PageIndicator` |
| 아이템 폭 | **`calc((100% - 2 * var(--space-3)) / 3)`** — 트랙 345 · gap `--space-3`(12) 기준 3열. 폭이 줄면 열 수가 아니라 아이템이 줄어든다 (`AD-S3-20`) |
| 페이지 | 3개 단위. `PageIndicator count = ceil(n / 3)` |
| variant | `default` (shelf) — Stage 3에 다른 variant 없음 |
| state | item: rest / hover / pressed / **focus-visible** / **selected**(`113:1991` pastel + check) / disabled(없음) |
| 토큰 | gap `--space-3`, 트랙 아래 `--space-3` → `PageIndicator`. 아이템 radius·그림자는 `BookShelfItem` 소유 |
| **제스처 대체 수단 (WCAG 2.5.1)** | **prev / next `IconButton`(glass, 32 시각 / 44 hit)을 `SectionHeader` 행 우측, "See all" 왼쪽에 배치**한다. 캐러셀 위에 얹거나 아이템을 가리지 않는다. 첫·마지막에서 `disabled` 이며 **사라지지 않는다** |
| 키보드 | `viewport` 는 `role="group"` + `aria-roledescription="carousel"` + `aria-label`(섹션 제목). 아이템은 각각 포커스 가능한 링크/버튼이라 **Tab 순차 이동이 1급 경로**다. `←`/`→` 는 아이템 간 이동(roving tabindex), `Home`/`End` 는 처음/끝 |
| 페이지 전환 알림 | `aria-live="polite"` — **"Showing {a}–{b} of {n}"** |
| 자동 재생 | **없음** |

> ★ **`overflow` 예외 = 조건부 승인됨 (2026-10-01, approvals §6)** — 가로 캐러셀은 구현 수단이 셋뿐이고 전부 §0.4("`AppColumn` 안쪽 `overflow-*` 금지")와 충돌한다. **(A)안이 승인되었고, `padding-block` / 음수 `margin-block` 그림자 보호 구조가 승인 조건 자체다.** 값은 상 24 / 하 80 (`D-REQ-4` 정정) — approvals §12.15.
>
> **이 보호 구조 없이 `overflow-x` 를 선언하면 승인이 아니다.** 또한 이 예외는 **`Carousel` 1건·가로 축에만** 적용되며, 다른 컴포넌트나 세로 축으로 확장되지 않는다 (Prompt 확장에 세로 스크롤을 쓰지 않는 근거 = §5.1.1 (A)안 기각).
>
> | 안 | 내용 | 그림자 클리핑 | 접근성 |
> |---|---|---|---|
> | **(A) 승인됨 (조건부)** | `viewport` 에 `overflow-x: auto` + `scroll-snap` **미사용**(#9) + **`padding-block: var(--carousel-shadow-inset)`(상 24) / `var(--carousel-shadow-inset-block-end)`(하 80) + 음수 `margin-block`** (상 24 / 하 80 (`D-REQ-4` 정정)) 로 세로 그림자를 스크롤 박스 **안에** 넣는다 — **이 두 선언이 승인 조건**이다(`--space-3`(12)로는 부족하다, 아래 참조). 가로 클리핑 지점은 아이템이 실제로 화면 밖으로 나가는 트랙 끝이다 | 세로 **해소**, 가로는 의도된 지점 | 네이티브 스크롤 + `scrollIntoView` 로 포커스 추적이 공짜 |
> | (B) | `transform` 트랙 + `overflow: hidden` | 세로도 잘림 → 카드 그림자 재발 | 포커스 이동 시 수동 보정 필요 |
> | (C) | `overflow: clip` + `overflow-clip-margin` | 해소되나 지원 편차 | (B)와 동일 |
>
> `--space-3`(12)은 `--shadow-glass-rest` 의 세로 번짐(offset 12 + blur 28 의 가시 범위)을 전부 담지 못한다. **상쇄값은 상 `--space-6`(24) / 하 `80px`** 이다 → §6.2 Tier-3 `--carousel-shadow-inset` + `--carousel-shadow-inset-block-end`. ⚠️ 최초 승인한 대칭 24 는 3겹 중 `0 28px 56px` 를 빠뜨린 계산이었다 (상 24 / 하 80 (`D-REQ-4` 정정)). 실측 아래 77 · 위 22. `border-box` 라 `block-size` 에 **가산** 필수. **값을 줄이거나 보호 구조를 빼면 승인 범위를 벗어난다** (QA Finding 대상).

### 4.3 `ListRow` 확장 — `media` · `meta` — Figma `163:2145`(+`163:2100`) · `30:141`

**Figma 실측 (2026-09-30)**: 행 **74** 높이, padding-inline **16**, 썸네일 **34×48** @(16,13), 텍스트 컬럼 x=**62**(썸네일 우측에서 gap **12**), 제목 17 tall, meta 14 tall(제목에서 +19 → gap 2), trailing chevron **15×15** 우 inset 16, 행 사이 **1px divider**.

| 항목 | 규격 |
|---|---|
| 신규 prop | `leading`(media 노드) · `trailing`(meta 노드 — `Text` 또는 `GiftStatusTag`) |
| 높이 | **최소 74**(`--list-row-height-media`), 내용이 넘치면 늘어난다. **고정 높이 금지**(200% 텍스트) |
| media | 폭 `--book-cover-w-sm`(34), 높이 = aspect(§6.2). radius `--radius-control`. `object-fit: cover` |
| gap | media ↔ 텍스트 `--space-3`(12). 제목 ↔ subtitle `--space-0-5`(2) |
| 토큰 | 제목 `--text-subheadline` / `--color-fg-primary`(Figma 17 tall 흡수, `AD-6`). subtitle · meta `--text-caption-1` / `--color-fg-secondary`(가값 P-01). divider `--color-divider` |
| state | rest / hover / pressed / **focus-visible** / disabled / (selected 없음) |
| 접근성 | 행 전체가 하나의 링크/버튼. 접근성 이름 = **제목 + subtitle + meta 를 이어 읽는 순서**. 썸네일은 `alt=""`(제목이 이미 텍스트로 있음) |
| 터치 | 74 ≥ 44 ✓. chevron 은 장식(`aria-hidden`) |
| 기존 basic 행 | Stage 2 값(`--list-row-height-min` 56) **변경 없음**. **가값 P-18 후보였던 56은 media 74와 별개**이며, media 실측으로 basic 56 이 확정되지는 않는다 → 가값 유지 |

### 4.4 `BottomTabBar` — 첫 실마운트 (Figma `25:87` · `140:2971`)

컴포넌트 자체는 Stage 1에 이미 있다. Stage 3은 **마운트 규칙**만 확정한다.

| 항목 | 규격 |
|---|---|
| 항목 | Library / **Home(중앙)** / Progress — `CONFIRMED (#15)`. Session 탭 없음 |
| 아이콘 | Library = Lucide `book`, Progress = Lucide `chart-no-axes-column-increasing`, Home = HARU SVG `tab-center-home.svg` — `CONFIRMED (S1-D2-5)` |
| 고정·여백 | §2.1 |
| 활성 표시 | `aria-current="page"` + **색 + 굵기 2중 전달**. 미선택 라벨 `--color-fg-secondary`(가값 P-01) / 선택 `--color-fg-primary` + `--font-weight-semibold`. **색 단독 금지**(WCAG 1.4.1) |
| 중앙 버튼 활성 | 중앙 항목은 항상 강조 원형이므로 **활성/비활성 구분을 원형 색으로 하지 않는다** — 라벨 굵기와 `aria-current` 로 구분한다 |
| 키보드 | Tab 순차 이동. 탭바 내부 화살표 순환 없음 (링크 목록, Stage 1 §6.2) |
| Badge | Stage 3에서 **사용하지 않는다** (`count` 근거 없음) |

### 4.5 `Toggle` — Figma `17:113` (iOS 26 kit)

**결정 (`RECOMMENDED`, COMPONENT_MAP §6 위임)**: **iOS kit 모양을 복제하지 않고 HARU 토큰으로 구현한다.**

근거 — ① iOS 26 kit(`17:368`)은 **외부 라이브러리**이고 COMPONENT_MAP §6이 "재구현 금지 / 조건부"로 분류한 영역이다 ② HARU 화면은 전부 glass + pastel 이라 iOS system green 트랙은 팔레트 밖 색이 된다 ③ 같은 화면의 `Chip`·`Checkbox` 선택 색이 `--color-action-primary-bg` 인데 Toggle 만 다른 초록이면 "선택됨"의 시각 규칙이 깨진다 ④ Web/Android 에서도 같은 컴포넌트를 쓴다(웹 우선, Capacitor는 Stage 4).

| 항목 | 규격 |
|---|---|
| 구조 | 트랙 + 노브. `<button role="switch" aria-checked>` |
| 치수 | 트랙 `--toggle-track-w` × `--toggle-track-h`, 노브 `--toggle-knob-size`, radius `--radius-pill` — **`가값 (P-20)` 확정 (`§8.5 ⑤`, 2026-10-02)**. 세 토큰 정의에 **`provisional` 주석**을 남기고, 디자이너 값이 오면 **토큰 값만 교체**한다 (2026-09-22 사용자 원칙). 값 자체는 §6.2 참조 |
| 사용처 | **Stage 3 는 push on/off 1곳뿐**이다 (§2.14 — 리마인더 토글은 `D-18` Out of Scope). **그래도 3종(`SectionHeader`·`Carousel`·`Toggle`) 유지가 확정**이다 — `CONFIRMED (approvals §9.2, 2026-10-03)`. 근거: `D-14` 원칙은 **"해당 화면의 컴포넌트가 나올 때 만든다"** 이며 **사용처가 1곳이어도 충족**된다(선행 구현 금지의 반대 방향이 아니다). 제외 판단은 **사용처 0건이 될 때** 한다 |
| 색 | on = `--color-action-primary-bg` · off = `--color-progress-track`(가값 P-02) · 노브 = `--haru-white` |
| state | off / on / pressed / **focus-visible** / disabled(`--opacity-disabled`) |
| **색 단독 금지** | on/off 를 색으로만 구분하지 않는다 — **노브 위치 이동(기하)** 이 2번째 전달 수단이고, `role="switch"` + `aria-checked` 가 3번째다. 텍스트 "On/Off" 를 별도로 붙이지 않는다(스크린리더가 상태를 읽음) |
| 터치 | hit area **44×44** (시각 트랙은 그보다 작다) |
| 모션 | 노브 이동 `--motion-duration-fast` / `--motion-ease-standard`. `prefers-reduced-motion` → 즉시 전환 |
| 라벨 | 항상 `ListRow` 의 title 이 라벨이다. `aria-labelledby` 로 연결하고 **행 전체 탭으로도 토글**된다 |

### 4.6 컴포넌트를 새로 만들지 않는 것 (조합으로 해결)

| 필요 | 해결 |
|---|---|
| 덱 카드 컨테이너 | `SwipeDeck`(Stage 2) 재사용 — §2.3 |
| 시간 picker | `SelectTrigger` + `Sheet` 목록 (Stage 2 성별 선택 선례). Stage 3 사용처는 **Reading Context `custom_time` 1곳** |
| ~~요일 선택~~ | `Chip` 다중 선택 그룹 — **Stage 3 사용처 없음** (`D-18` Out of Scope, §2.14) |
| 진행 중 세션 안내 | `InlineAlert tone=info` + `TextLink` — **`ActiveSessionNotice` 는 page-only 조립**(§5.9) |
| 증정 상태 배지 | `Tag` + tone 매핑 = `GiftStatusTag`(domain, §5.6) |
| 캐러셀 prev/next | `IconButton`(glass) |
| 대체 카드 식별 | `Tag tone=neutral` + `Icon` |

---

## 5. Domain 컴포넌트 명세 (`apps/web/src/entities/*`)

### 5.1 `ActivityOptionCard` — 통합 후보 I · Figma `86:438` · `86:512` · `163:2649–2651` · `145:1085`

**Figma 실측 `86:438`(366×452)**: padding-inline **18** · 배지 행 y=18 h=26 · gap **12** · BookSummary y=56 h=82(커버 **58×83**, gap 14, 제목 21 / 저자 16 / 이유 40) · gap **12** · Prompt 목록 y=150 h=232(**pill 42, gap 6, 5개**) · gap **9** · ActionBar h=45 · 하단 padding 16.

| 축 | 값 | 근거 |
|---|---|---|
| `density` | `full`(`86:438`) · `compact`(`86:512`) | Figma |
| `kind` | `book` · `reread_book` · `conversation_only` | contracts `ActivityOptionKind` · §2.6 |
| `context` | `home`(덱) · `library`(BookDetailSheet) | §2.9 — `86:438` 과 `145:1085` 가 같은 구성 |
| ~~`face`~~ | **폐기** — `86:482` 는 카드 뒷면이 아니라 **별도 시트**다 (§12.5) | §2.5 |
| `type=shelf` | **폐기** — `LibraryShelfSheet` 로 분리 | COMPONENT_MAP §2 |

**레이아웃 (overflow 결함 해소안)** — `163:2648` 은 Prompt 4번째 pill 이 ActionBar 아래로 밀려 **겹친다**. 원인은 카드 높이(377)가 콘텐츠 높이보다 작은 **고정 프레임**이라서다.

```
Surface(fill=strong, material=raised, radius=--radius-card, padding=--space-5)  ← 18 흡수
├ 헤더 행        CapabilityBadge (좌)              [+ Tag(kind) (좌, kind≠book)]
│                (우) IconButton → Prompt 시트/뷰 (§2.5)  ← Figma 우상단 아이콘 자리
├ --space-3
├ BookSummary    BookCover(md 58) | 제목 / 저자 / 추천 이유(최대 2줄)
├ --space-3
├ [compact 만]  CoachingNote(tone=pink, eyebrow="REMEMBER TONIGHT")  ← 86:527
├ --space-3
├ PromptPreview  PromptPill × **min(3, n)** (gap --space-1-5 = 6)   ← 접힌 상태
│                + [n > 3] 확장 트리거 1행 "Show all {n} prompts"    ← §5.1.1 (개수 상한 없음)
├ --space-3
└ ActionBar      [ReadingContextChip | Button(glass) "Save"]  +  Button(accent) "Start Session"
```

- **카드 높이는 고정하지 않는다.** ActionBar 는 흐름의 마지막 요소이며 `position: absolute` 를 쓰지 않는다 → `163:2648` 의 겹침이 구조적으로 재발할 수 없다 → §11.3 `AD-S3-3`.
- **접힌 카드 높이**: Prompt 3개 기준 452 − (42+6)×2 = **358**, 여기에 `n > 3` 일 때 확장 트리거 1행(텍스트 1줄 ≈20 + gap `--space-2`) → **≈386**. `163:2648`(377)과 +9. `n ≤ 3` 이면 트리거가 없어 358 이다. **확장 시 +(42 + 6) × (n − 3)** 이며 **상한을 두지 않는다** (§5.1.1 · §11.3 `AD-S3-1`·`AD-S3-22`).
- `Save`(★) 버튼은 **PRD 근거가 없다**(북마크 = `CONFIRMED (D-7)`로 기각) → **렌더하지 않는다** → §11.3 `AD-S3-8`. 그 자리에 `home` 컨텍스트에서는 `ReadingContextChip`(선택 후) 또는 빈 슬롯.
- **`Start Session` 은 Stage 3에서 `disabled`** (`CONFIRMED (D-3)`). 설명 문구는 copy 슬롯이며 비면 설명 없이 `aria-disabled` 만 적용한다.
- state: rest / **active(덱 최상단)** / behind(뒤 카드, `aria-hidden`) / pressed / focus-visible / loading(선택 전송 중).

#### 5.1.1 ★ Prompt 노출 규격 — `CONFIRMED (N-2, approvals §6 · §6.1)`

design-agent 의 이전 명세("카드 미리보기 **최대 3개 고정**", `promptPreview: string[]` 1–3)는 **폐기**한다. 사용자 결정은 **개수 상한과 표시 개수를 분리**한다.

| 구분 | 규격 |
|---|---|
| contract | `ActivityCardOption.promptPreview: string[]` — **길이 상한 없음**(`.max(3)` 를 넣지 않는다). `.min(1)` 만 둔다(빈 세트는 화면이 성립하지 않는다). `PromptSet.questions` 도 같다 — `CONFIRMED (D-21, approvals §9 · §9.1)`. **Frontend 는 배열을 잘라내지 않는다 — `slice(0, 3)`·`.filter`·`take(3)` 를 쓰지 않는다**. 접힘은 **렌더 단계의 컷오프**이며 데이터는 전부 보관한다 |
| 접힌 상태 | `PromptPill × min(3, n)` — 보이는 영역에 **3개** |
| 나머지 도달 | **높이 확장(disclosure)** + 그 결과로 길어진 카드를 **바깥 스크롤 컨테이너로 스크롤**. 두 수단이 **하나의 구조**로 동시에 성립한다 |
| 트리거 | `n > 3` 일 때만 렌더. `n ≤ 3` 이면 트리거가 없다 |
| 상한 | **UI 에도 contract 에도 없다.** 개수는 서버가 정한다 — `CONFIRMED (D-21, approvals §9.1)`. PRD FR-07 · §8.2 의 "2~3개" 는 **생성 정책**이며 **수정 대상**이다 (approvals §6.2 #4 · **§9.3 #6**) |

**표시 방식 비교 — 권고는 (B) 높이 확장이다.**

| 안 | 내용 | 덱 제스처 | §0.4 `overflow` 금지 | 텍스트 200% | 판정 |
|---|---|---|---|---|---|
| (A) 카드 안 세로 스크롤 | Prompt 목록에 `overflow-y: auto` | **충돌** — 카드 면적의 절반을 차지하는 스크롤 박스가 포인터 시퀀스를 가로챈다. 축을 나누려고 `touch-action: pan-y` 를 걸면 **그 영역에서 가로 스와이프가 죽고**, `none` 을 걸면 스크롤이 죽는다. 게다가 페이지 자체가 세로 스크롤이라 **중첩 스크롤 체이닝**이 생긴다(홈을 아래로 밀면 Prompt 목록이 먼저 움직인다) | **위반** — `Carousel` 조건부 승인은 **가로 캐러셀 1건**에 한정된다(§4.2). 두 번째 예외를 만들어야 한다 | 스크롤 박스에 **고정 높이**가 필요 → "고정 높이 컨테이너 금지"(§9)와 충돌 | ✗ |
| **(B) 높이 확장 (disclosure)** | 접힌 3개 + 버튼으로 전체 렌더 | **충돌 없음** — 확장은 연속 제스처가 아니라 **단일 press** 다. 카드 안에 스크롤 박스도 `touch-action` 선언도 생기지 않는다 | **위반 없음** — `overflow` 선언 0 | 고정 높이 없음 ✓ | **권고** |

**권고 근거** ① 사용자가 말한 "스크롤해서 더 보인다"는 **페이지 스크롤**로 이미 충족된다 — 카드 안에 **두 번째 스크롤 축**을 만들 이유가 없다 ② `SwipeDeck` 은 Pointer Events + `transform` 으로 가로 드래그를 판정하므로(Stage 2 §4.2) 네이티브 스크롤 컨테이너와 축을 나눠 가질 수 없다 ③ §0.4 의 `overflow-*` 금지 규칙에 **예외를 하나 더 만들지 않는다** ④ 확장은 "더 있다"는 사실을 **버튼 라벨로 고지**하므로 스크롤보다 발견 가능성이 높다.

**구조**

```
├ PromptPreview   (컨테이너 — overflow / touch-action / 고정 높이 선언 없음)
│   ├ PromptPill × min(3, n)                   ← 접힌 상태에도 항상 보인다
│   ├ [expanded] PromptPill × (n − 3)          ← 렌더 ↔ 미렌더 (클리핑 아님)
│   └ [n > 3] 트리거  TextLink(onPress → <button type="button">)
│               접힘 "Show all {n} prompts"  ·  펼침 "Show fewer"
│               aria-expanded + aria-controls = 나머지 pill 목록 id
├ --space-2       (Prompt 목록 ↔ 트리거)
```

| 항목 | 규격 |
|---|---|
| 상태 소유 | **`ActivityOptionCard` 내부 로컬 상태**. 서버 상태·전역 상태가 아니다. `context` = `home` · `library` 공통 |
| 초기값 | **항상 접힘.** 덱 인덱스가 바뀌면 접힘으로 되돌린다 (§2.3) |
| 트리거 컴포넌트 | 기존 **`TextLink`** (`onPress` → `<button type="button">`). **`href` 를 쓰지 않는다** — 이동이 아니라 상태 전환이다. **신규 Shared UI 아님**(§4 범위 유지) |
| 숨김 방식 | 접힘 = 나머지 pill **미렌더**(또는 `hidden`). `max-height` + `overflow: hidden` 클리핑을 쓰지 않는다 (§0.4) |
| 높이 모션 | **없다.** 높이 보간은 `overflow: hidden` 클리핑을 요구하므로 채택하지 않는다. 새로 나타난 블록만 `opacity` 0→1 (`--motion-duration-fast`), `prefers-reduced-motion` = 즉시 (§7) |
| 접기 후 스크롤 | **트리거의 뷰포트 위치를 유지**한다. 트리거가 뷰포트를 벗어날 때만 `scrollIntoView({block:'nearest'})`, reduced-motion 에서 `behavior:'auto'`. **카드 상단으로 점프시키지 않는다** |
| 말줄임 | 카드에서는 접힘·펼침 **모두 2줄 말줄임**(§5.4). 질문 전문은 시트가 담당한다 → **시트 역할 유지** (§12.5) |
| 토큰 | 신규 semantic **0건**. pill gap `--space-1-5`(6) · Prompt↔트리거 `--space-2`(8) · Tier-3 `--prompt-preview-collapsed-count`(3, §6.2) |

**접근성**

| 항목 | 규격 |
|---|---|
| 키보드 도달 | 트리거가 **Tab 순서의 1급 경로**다. 확장으로만 도달하는 Prompt 도 **키보드로 도달 가능**하다(트리거 → Enter/Space → 문서 순서에 나타남) |
| 숨은 콘텐츠 고지 | 트리거 라벨에 **개수를 담는다** — "Show all {n} prompts". 접힌 상태에서도 **더 있다는 사실이 접근성 이름만으로 전달**된다. 접근성 이름에서 개수를 빼지 않는다 |
| `aria-hidden` 금지 | **렌더된 pill 에 `aria-hidden` 을 걸지 않는다.** 접힘은 `aria-expanded=false` + 미렌더로만 표현한다 — "보이는데 읽히지 않는" 상태를 만들지 않는다 |
| pill 포커스 | `PromptPill` 은 계속 **포커스를 받지 않는다**(§5.4, 텍스트다). 확장으로 드러난 pill 도 같다 |
| live region | 확장은 **카드·페이지 전환이 아니다** → 덱의 `aria-live`("Option {n} of 3…")를 **발화하지 않는다**. `aria-expanded` 변화가 상태를 전달하므로 **별도 live region 을 두지 않는다**(이중 발화 방지) |
| 터치 타깃 | 트리거 **hit 44**(시각 높이는 텍스트 1줄). §10 "시각 크기와 별개로 hit 44" 규칙과 동일 |
| 뒤 카드 | 뒤 카드는 `aria-hidden` + `inert` 이므로 뒤 카드의 트리거는 포커스를 받지 않는다 |

**덱 레이아웃 · `PageIndicator` 영향**

| 항목 | 규격 |
|---|---|
| `SwipeDeck` 높이 | **고정하지 않는다.** 스택 높이 = **front 카드 높이 + `--deck-peek-y` × (`--deck-depth` − 1)**. Stage 2 §4.2 의 546 / 521 실측은 **결과값**이며 고정값이 아니다 |
| 뒤 카드 | 높이를 **front 카드 박스에서 받는다**(레벨마다 좌우 `--deck-inset-x`, 아래 `--deck-peek-y`). 자기 콘텐츠로 높이를 만들지 않으므로 front 가 확장돼도 **peek 기하가 유지**되고 뒤 카드가 흔들리지 않는다 |
| `PageIndicator` | `count = 3` · `index` **불변**. 확장은 페이지 수·인덱스를 바꾸지 않는다 |
| dots 위치 | 덱 아래 **흐름 요소**다. 확장하면 Δ 만큼 아래로 밀린다. **`position: sticky`·고정 좌표를 쓰지 않는다** |
| 아래로 밀리는 것 | dots → `HomeFooterNote` (탭바는 sticky — 영향 없음). 최종 결과는 **페이지 스크롤 길이 증가**뿐이다 |
| 최악 높이 | n 에 상한이 없으므로 카드 높이에도 상한이 없다. **어떤 n 에서도 잘리지 않는다** — §5.1 의 "카드 높이 고정 금지"(= `163:2648` 겹침 결함의 원인 제거)가 그대로 방어한다 |
| 320px | 확장 상태에서도 pill 이 2줄 말줄임이므로 **행 높이가 폭에 따라 커지지 않는다**(§9-①) |

**`n ≥ 4` 표시 규격 — `CONFIRMED (D-21, approvals §9 · §9.1)`**

`D-21` 로 contract 의 길이 상한이 제거되었으므로 **4개 이상이 실제로 내려온다**. 아래 3가지는 **n 에 무관하게 성립해야 하는 불변식**이다.

| 불변식 | 규격 | n 의존성 |
|---|---|---|
| **접힌 높이** | `n ≥ 4` 면 항상 **pill 3개 + 트리거 1행**이다. `n` 이 4든 8든 20이든 **접힌 높이는 같다**(≈386). 접힌 높이가 `n` 에 따라 달라지면 덱 카드가 개수마다 다른 크기로 보인다 — 그렇게 만들지 않는다 | **없음** (상수) |
| **확장 동작** | 트리거 1회 press → `n` 전부 렌더. **단계·부분 확장("Show 3 more")을 두지 않는다** — 확장은 2-state(접힘/전체)다. 높이 = 386 + `(--prompt-pill-height-min + --space-1-5)` × (`n` − 3) = **386 + 48 × (n − 3)**, 상한 없음 | 선형, 상한 없음 |
| **키보드 도달** | **Tab stop 수가 `n` 에 무관하다** — `PromptPill` 은 포커스를 받지 않으므로(§5.4) 카드의 tab stop 은 헤더 `IconButton` · 확장 트리거 · ActionBar 버튼으로 **상수**다. 확장으로 드러난 Prompt 는 **문서 순서에 나타나 스크린리더 읽기 순서로 도달**하며, 포커스 이동 횟수는 늘지 않는다 | **없음** (상수) |

**레이아웃 성립 검토 (393px 기준, 접힘 386 / 증분 48)**

| `n` | 접힘 | 확장 | 덱 스택 높이(확장, +`--deck-peek-y`×2 = 32) | 판정 |
|---|---|---|---|---|
| 3 | 358 (트리거 없음) | — | 390 | ✓ |
| 4 | 386 | **434** | 466 | ✓ |
| 5 | 386 | **482** | 514 | ✓ — Figma 최대 변형(`86:438`, 5개)과 같은 개수 |
| 8 | 386 | **626** | 658 | ✓ — 카드 1장이 가시 영역을 넘지만 **페이지 스크롤로 흡수**된다 |
| 20 | 386 | **1202** | 1234 | ✓ — 위와 같다. 상한을 두지 않는 선택의 직접 결과다 |

**깨지는 개수는 없다.** 근거 — ① 카드·pill·덱·시트에 **고정 높이가 하나도 없다**(§5.1 · §9 "고정 높이 컨테이너 금지") ② ActionBar 가 **흐름의 마지막 요소**이고 `position: absolute` 가 아니므로 `163:2648` 의 겹침 결함이 재발할 수 없다(`AD-S3-3`) ③ 뒤 카드는 **front 카드 박스에서 높이를 받으므로** front 가 길어져도 peek 기하가 유지된다 ④ `PageIndicator` 는 `count = 3` 고정이며 **흐름 요소**라 아래로 밀릴 뿐이다(`sticky`·고정 좌표 금지) ⑤ pill 이 **2줄 말줄임**이라 행 높이가 폭·텍스트 길이에 따라 커지지 않는다 → 증분이 320px 에서도 48 로 일정하다.

**깨짐은 아니지만 기록해 두는 결과 2건**

| 항목 | 내용 | 처리 |
|---|---|---|
| 확장 시 CTA 가 fold 밖으로 밀린다 | 393×852 에서 카드 위 영역(헤더·캐릭터·버블)을 빼면 가시 높이 ≈560 → **`n ≥ 7` 부터 확장 카드가 1화면을 넘고 `Start Session` 이 스크롤 아래로 간다** | **허용**. 페이지 스크롤로 도달하며, Stage 3 의 `Start Session` 은 `disabled`(`D-3`)라 플로우를 막지 않는다. **ActionBar 를 `sticky` 로 바꾸지 않는다** — `AppColumn` 안쪽 고정·`overflow` 금지 규칙(§0.4)을 건드린다 |
| 트리거 라벨이 2줄이 될 수 있다 | 320px 에서 `n` 이 3자리면 "Show all 128 prompts" 가 1줄을 넘을 수 있다 | **허용**. 접힌 높이가 +≈20 되는 것 외에 영향이 없다(고정 높이가 없다). **라벨에서 개수를 빼지 않는다** — 개수 고지가 접근성 요건이다(§5.1.1 접근성) |

> **Figma 대조 기준은 바뀌지 않는다** — 접힌 상태만 대조하며(§11.2), 개수 차이는 `AD-S3-1`(상한 없음)·`AD-S3-22`(트리거 1행)로 이미 사전 등록되어 있다. `n ≥ 4` 케이스를 위해 **새 허용 차이를 추가하지 않는다**.

### 5.2 `CapabilityBadge` — Figma `163:2649–2651` · `85:592` · `Tag 76:439–445`

| 항목 | 규격 |
|---|---|
| 4역량 라벨 | Emotion Regulation · Self-Direction · Cognitive Flexibility · Intrinsic Motivation — `CONFIRMED (#14)` |
| **데이터 원천** | **`options[].capability` 만**을 근거로 렌더한다 — `CONFIRMED (D-22, approvals §9, 2026-10-03)`. `ActivityCard.targetCapability`(카드/하루 단위 대표 역량)는 **contract 에서 삭제**되므로 **덱 상단·카드 바깥·헤더에 "오늘의 역량" 배지를 두지 않는다**(§12.4 와 동일 결론). 카드마다 자기 option 의 역량 배지 1개를 가진다. 서버가 `capability` 를 비워 보내면 **배지를 렌더하지 않는다**(기본 역량으로 대체하지 않는다) |
| 색 | `--color-capability-{emotion\|agency\|flexibility\|motivation}-bg/-fg` — `CONFIRMED (#19)` |
| size | `sm`(26h, `--tag-height-sm`) · `xs`(`--tag-height-xs`) |
| **suffix "Day"** | **폐기한다 — `CONFIRMED (N-3, approvals §6)` + `D-22` 의 직접 귀결** (§12.4-②). `targetCapability` 삭제로 "하루 1개 대표 역량" 자체가 데이터에서 사라져 "오늘의 X Day" 를 만들 근거가 남지 않는다 — `D-5` 로 **덱 카드마다 역량이 달라졌으므로** "오늘의 역량 = X Day" 라는 의미가 성립하지 않는다. Figma 도 `163:2649` 는 "Self-Direction"(suffix 없음), `163:2651` 은 "Intrinsic Motivation Day", `163:2650` 은 **"Emotion Day  Day"(오타 M-13)** 로 이미 제각각이다. **전체 표시 라벨만** 쓴다 |
| 대비 | 흰 글자 = **가값 P-02** (1.56–1.86:1). 색 단독 전달 금지 — **라벨 텍스트가 본체**이므로 충족 |
| 접근성 | 배지는 텍스트다. 아이콘만으로 역량을 표현하지 않는다 |

### 5.3 `BookCover` — Figma `113:1991/1992` · `86:438` 내 `85:610` · `163:2101`

| 항목 | 규격 |
|---|---|
| **aspect** | **7 / 10 (0.700)** — `신규 토큰 제안 --book-cover-aspect`. 실측 58×83(0.6988, 카드) · 34×48(0.7083, 목록) 을 모두 ±1.2% 로 흡수한다. **원본 비율 편차는 `object-fit: cover` 가 흡수**한다 (Stage 2 `QA-2-004` 재발 방지, `CONFIRMED (D-13)` ③) |
| size | `sm` 34(목록) · `md` 58(카드·시트) · `lg` = 캐러셀 열 폭 공식(§4.2, 345 트랙에서 **107**) |
| variant | `default` · `selected`(`113:1991` — pastel 배경 + check 아이콘) · **`placeholder`**(표지 없음 / 로드 실패) |
| `placeholder` | pastel 배경(`--color-surface-tinted`) + 제목 **이니셜 1–2자** + 테두리 `--color-border-subtle`(가값 P-02). **"No cover" 같은 판정 문구를 넣지 않는다** |
| `alt` | **필수**. 형식 = **"{제목} by {저자}"**, 저자가 없으면 "{제목}". 장식이 아니다. 단 **`ListRow` 안에서는 제목이 이미 텍스트로 있으므로 `alt=""`** (중복 읽기 방지) |
| radius | `--radius-control` |
| 로드 실패 | `onError` → `placeholder` 로 전환 (`AC` 대상, Plan §8.3) |

### 5.4 `PromptPill` — 통합 후보 H · Figma `86:438` 내 pill · `86:482`

| 항목 | 규격 |
|---|---|
| tone | `outline`(카드 미리보기) · `tinted`(시트) |
| 치수 | 높이 **최소 42**(`--prompt-pill-height-min`, Figma 42), 내용이 넘치면 늘어난다. gap `--space-1-5`(6) |
| **단계·페이지 배지** | **렌더한다 — `CONFIRMED (D-8, approvals §8.1)`**. props = `phase`(`'pre' \| 'post' \| null`) · `pageRef`(`string \| null`). 값이 없으면 **배지를 렌더하지 않는다**. 규격 전부는 **§5.4.1** → §11.3 `AD-S3-15`(재작성) |
| 줄 수 | 카드 = **접힘·펼침 모두 최대 2줄 + 말줄임** (§5.1.1). 시트 = **줄임 없음** — 이것이 시트를 유지하는 이유 중 하나다 (§12.5) |
| 개수 | 카드가 렌더하는 개수는 `min(3, n)`(접힘) / `n`(펼침)이며 **상한 없음** (`N-2`, §5.1.1). 컴포넌트는 개수를 알지 못한다 — 부모가 목록을 넘긴다 |
| 대비 | tinted 배경 위 라벨 4.18:1 = **가값 P-11** |
| 접근성 | pill 은 **텍스트다 — 버튼이 아니다**. 탭 대상이 아니며 포커스를 받지 않는다(확장으로 드러난 pill 도 같다). **나머지 Prompt 도달**은 §5.1.1 확장 트리거(`aria-expanded`)가, **코칭 문장 포함 전체 보기**는 카드 헤더 `IconButton`(§2.5)이 담당한다 |
| arrow 계열 | `86:324` 의 arrow variant 는 pill 이 아니라 캐러셀 컨트롤 → **Stage 4 `PromptCarousel`** 로 분리 |

#### 5.4.1 ★ 단계·페이지 배지 — `CONFIRMED (D-8, approvals §8 · §8.1)`

이전 명세("`PRE`/`POST`/`P.6` 를 표시하지 않는다", "prop 도 만들지 않는다" — §12.11 design-agent 이견)는 **폐기한다.** 사용자 결정은 **Figma 기준 반영**이며, 배지가 **최종적으로 화면에 보여야** 한다.

**Figma 근거 (조회·실측 2026-10-02)**

| 노드 | 이름 | 크기 | 라벨 |
|---|---|---|---|
| `I86:438;139:2492;139:2413` | `Pagetag1` | **50×22** | `PRE` |
| `I86:438;139:2493;139:2413` | `Pagetag2` | **60×22** | `POST` |
| `I86:438;139:2574;139:2413` | `Pagetag3` | **45×22** | `P.6` |
| 컴포넌트 원본 | `Pagetag1–3 139:2410–2412` (COMPONENT_MAP §5 통합 후보 E) | — | 텍스트만 다른 **동일 컴포넌트** |

- 배치: pill 내부 **leading**, 배지 좌측 inset 12–13, 배지 ↔ 질문 텍스트 gap **10** (3 인스턴스 모두 동일), 배지 라벨 좌우 inset 13.
- 색: **3종 모두 같은 배경** `#a0ccdd`(`accents/cyan`) + 흰 라벨. 실측으로 확인했다 — Figma 가 단계별로 색을 나누지 않는다.
- 폭은 **라벨에 따라 가변**(45 / 50 / 60)이며 고정 폭이 아니다.

**명세**

| 항목 | 규격 |
|---|---|
| 데이터 | **서버 값만 표시**한다. `phase` 는 enum → 라벨 매핑(copy 모듈), `pageRef` 는 **서버 문자열 그대로** 출력한다. Frontend 가 페이지 번호를 계산·추정·포맷하지 않는다 (`rules/frontend.md` §8) |
| 라벨 | `phase='pre'` → **`PRE`**, `phase='post'` → **`POST`**. `pageRef` → 값 그대로(예: `P.6`). **라벨 문자열은 copy 모듈 한 곳**에 두어 나중에 교체 가능하게 한다 (approvals §8.1, 2026-09-26 원칙) |
| **값 없음** | `phase`·`pageRef` 가 `null`·빈 문자열이면 **해당 배지를 렌더하지 않는다.** 빈 배지·placeholder·`—` 를 넣지 않는다. 둘 다 없으면 **배지 영역 자체가 없고** 질문 텍스트가 pill 의 leading inset 부터 시작한다 |
| **둘 다 있을 때** | **`CONFIRMED (approvals §9.2 ⑪, 2026-10-03)`** — `phase` → `pageRef` 순서로 **2개를 렌더**한다, 배지 사이 gap `--space-1`(4). Figma 에 동시 표시 예시가 **없는 것은 공백이지 충돌이 아니다**(`N-1` 과 같은 성격) → `RECOMMENDED` 라벨 해제. **contract 는 `phase`·`pageRef` 를 독립 optional 로 유지**하며, 서버에 "하나만 보내라" 를 요구하지 않는다. 시각 차이는 §11.3 `AD-S3-24` 로 사전 등록되어 있다 |
| 기반 컴포넌트 | **`Tag`(Shared, `size=xs`) 재사용.** 신규 Shared UI 를 만들지 않는다 (`D-14` 원칙). 도메인 값(`phase`)을 tone 으로 바꾸는 매핑은 **`PromptPill`(entities) 이 소유**한다 — `packages/ui` 는 도메인을 모른다 |
| 치수 | 높이 `--tag-height-xs`(19; Figma 22 → **Δ−3**, §11.3 `AD-S3-15`), padding-inline `--tag-padding-x`(`--space-3` = 12; Figma 13 흡수), radius `--radius-pill`. **폭은 내용 기반**이며 고정하지 않는다 |
| 색 | 배경 `--prompt-phase-tag-bg` · 라벨 `--prompt-phase-tag-fg` — **§6.2 Tier-3 신규 토큰 제안**. 값은 `--haru-palette-cyan` / `--haru-white` 이며, **`--color-capability-flexibility-bg` 를 직접 쓰지 않는다** (같은 primitive 지만 "Cognitive Flexibility" 라는 의미를 Prompt 배지에 붙이면 역량 색 규칙이 오염된다 — §13.2 ⑪) |
| 타이포 | `--text-caption-2`(11) + `--font-weight-semibold`. **대문자 변환을 CSS 로 하지 않는다**(`text-transform` 금지 — 스크린리더 철자 단위 발음 회피, §5.5 eyebrow 와 같은 규칙). 대문자는 **copy 값 자체**가 대문자다 |
| 레이아웃 | pill 안에서 배지는 **`flex-shrink: 0`**, 질문 텍스트가 남은 폭을 가진다. 배지 ↔ 텍스트 gap **`--space-2-5`(10, Figma 10 — Δ0)**. 배지는 **첫 줄에 세로 정렬**(`align-self: flex-start`)하며, 질문이 2줄이어도 배지가 세로 중앙으로 내려가지 않는다 |
| 2줄 말줄임 | 배지가 차지한 폭만큼 질문 텍스트 폭이 줄어든다. **2줄 말줄임 규칙(§5.4)은 그대로**이며 배지 때문에 줄 수를 늘리지 않는다 |
| 320px | 콘텐츠 272 기준 배지 2개(최대 ≈60+45+4=109) + gap 10 → 질문 폭 ≈ 128. **배지를 줄바꿈시키지 않는다** — 질문이 2줄 말줄임으로 흡수한다 (§9-① 검증 대상에 추가) |
| 사용 표면 | **카드(`ActivityOptionCard`)와 Prompt 시트(§2.5) 양쪽**에서 같은 규격으로 렌더한다. 접힌 상태·확장 상태(§5.1.1) 모두 동일 |
| 접근성 | 배지는 **텍스트다 — 버튼이 아니며 포커스를 받지 않는다**(pill 과 같은 규칙, §5.4). 읽기 순서 = `{배지 라벨} … {질문}` 이며 pill 전체가 하나의 텍스트 블록으로 읽힌다. 아이콘을 쓰지 않는다(색·아이콘 단독 전달 금지 — 라벨이 본체) |
| 대비 | 흰 라벨 / cyan 배경 **1.72:1** — 기존 `P-02` 와 **같은 종류의 미결**이다(DESIGN_SYSTEM §대비표 "Pagetag" 행에 이미 기록). 색 단독 전달이 아니므로 정보 손실은 없다. §6.3 재제시 증빙에 **Prompt 배지 사용처를 추가**한다 |
| Mock | fixture 가 `phase`·`pageRef` 를 **결정적으로** 채워 화면에서 실제로 보이게 한다 (approvals §8.1). `null` 케이스도 같은 fixture 세트에 포함해 **미렌더 경로**를 검증한다 (§8) |
| Backend 의존 | `phase` 판정 로직과 `pageRef` 의 **책별 페이지 앵커 데이터**는 서버·콘텐츠 제작 범위다 → `BACKEND_INTEGRATION_PENDING` (approvals §8.1, Stage 8 Handoff) |

### 5.5 `CoachingNote` — Figma `86:527`(pink) · `86:482` 설명 블록(beige)

| tone | 배경 | 사용처 |
|---|---|---|
| `pink` | `--color-surface-tinted` | compact 카드 "REMEMBER TONIGHT" |
| `neutral` | `--color-surface-note` | Prompt 시트의 설명 블록 |

- `eyebrow` 는 **선택**. 대문자 표기는 `--text-caption-2` + `letter-spacing` 그대로(폰트 대문자 변환을 CSS 로 하지 않는다 — 스크린리더가 철자 단위로 읽는 문제 회피).
- radius `--radius-control`, padding `--space-4`.
- 문구는 **서버 값만** 표시한다.

### 5.6 `GiftStatusTag` — Figma 없음 → 명세

| status | tone | 라벨 (`RECOMMENDED`) |
|---|---|---|
| `requested` | `info` | Requested |
| `approved` | `info` | Approved |
| `shipped` | `info` | On the way |
| `delivered` | `success` | Delivered |
| `cancelled` | `neutral` | Cancelled |
| `rejected` | `neutral` | Not available |

- status 색 = **가값 P-04**. **색 단독 금지** → 라벨 텍스트가 본체이고, `delivered` 에만 check 아이콘을 병기한다.
- `rejected` 를 "Rejected"(판정 어감)로 쓰지 않는다 — **"Not available"**(사실 진술).

### 5.7 `WeekSummaryChip` — `CONFIRMED (D-6 · §8.5 ④)` · 통합 후보 J 해소 · Figma `26:40` · `30:91`

**개명·필드 삭제 확정 (2026-10-02, user — approvals §8.5 ④)**

| 항목 | 결정 |
|---|---|
| 컴포넌트 이름 | `StreakChip` → **`WeekSummaryChip`** — **확정**(제안 아님). `docs/COMPONENT_MAP.md` §2 · §5 통합 후보 J 갱신 완료 |
| contract | **`HomeSummary.streakDays` 삭제** — `D-6`(이번 주 기준)의 귀결이며 연속 일수는 달성률 언어에 가깝다 (`rules/frontend.md` §8). schema 반영은 plan-agent / development-agent 소관 |
| 화면 영향 | 없음 — 이 문서는 이미 streak 을 표시하지 않는 명세였다. **필드가 사라지므로 "표시하지 않는 필드"라는 예외 설명도 사라진다** |

**`D-6` 적용 결과 `StreakChip` 이라는 이름과 내용이 더 이상 맞지 않는다.** Figma 의 두 칩(`26:40` clock + "12-day/115 Min", `30:91` star + "12-day streak")을 **하나로 통합**하고 표시 항목을 바꾼다.

| 항목 | 결정 |
|---|---|
| **표시 항목** | **이번 주 세션 수 1개만** (§12.6 제안) — `HomeSummary.sessionsThisWeek` |
| 표시하지 않는 것 | **누적 읽기 분("115 Min")** = PRD 보조 요소에 없음(G-02) · **연속 일수("12-day")** = `D-6` 로 미채택, **`streakDays` 필드 자체가 삭제**된다 (§8.5 ④) |
| 아이콘 | `30:91` 의 star 를 쓴다(`26:40` 의 clock 은 "분" 표시용이라 근거가 사라졌다) |
| 라벨 | **"{n} this week"** + 아이콘. n=0 이면 **"None yet this week"** (`RECOMMENDED`) |
| 문구 규칙 | 목표·달성률·비교 표현 금지. "streak", "goal", "on track", "{n}/7" 를 쓰지 않는다 |
| 접근성 이름 | **"{n} storytimes this week"** (아이콘만으로 의미를 전달하지 않는다) |
| 사용처 | `/` TopBar trailing · `/library` TopBar trailing — **두 화면이 같은 값·같은 창**을 쓴다 |
| 치수 | Figma `30:90` 135×34 → 높이 `--tag-height-sm` 계열, padding-inline `--space-3`(Figma 14 흡수), 아이콘 ↔ 라벨 `--space-1-5`(Figma 6) |
| 이름 | `StreakChip` → **`WeekSummaryChip`** — **확정** (`§8.5 ④`, 2026-10-02). `COMPONENT_MAP.md` §2 · §5(J) 갱신 완료 |

### 5.8 `HomeFooterNote` — 지난 세션 하이라이트 한 줄

- `HomeSummary.lastHighlightLine` 이 있을 때만 렌더. 없으면 **미렌더**(빈 슬롯 규칙).
- `--text-caption-1` / `--color-fg-secondary`(가값 P-01), 최대 2줄.
- **서버 값만** 표시하며 Frontend 가 문장을 만들지 않는다. 앞에 "Last time:" 같은 접두어를 붙이지 않는다(서버 문구가 이미 완성문).

### 5.9 `ActiveSessionNotice` — Figma 없음 → 명세

- `HomeSummary.activeSession` 이 있을 때 덱 **위**에 `InlineAlert tone=info` 1개.
- 내용 = 진행 중 세션이 있다는 **사실 진술** + `TextLink`. **Stage 3에서 링크는 `disabled`**(진입 대상은 Stage 4) — `CONFIRMED (D-3)`와 같은 처리.
- 닫기 버튼 없음(상태가 사라지면 자동으로 사라진다).

### 5.10 `BookShelfItem` / `BookListRow` — Figma `113:1991/1992` · `163:2145`

| 컴포넌트 | 규격 |
|---|---|
| `BookShelfItem` | `BookCover(lg)` + 제목(`--text-caption-1`, 2줄 말줄임) + **역량 캡션**(`--text-caption-2`, `--color-fg-secondary`). `selected` = `113:1991` pastel + check. 전체가 하나의 버튼 |
| 역량 캡션 | Figma "Emotion"/"Resilience"/"Confidence" → **#14 표시 라벨**로 교체 (M-13) → `AD-S3-5` |
| `BookListRow` | §4.3 `ListRow(media/meta)` 조합. subtitle = "{n} sessions · finished {date}". meta = **없음**(평점 미렌더, `AD-S3-6`) |

### 5.11 `ReadingContextChip` — Figma `86:538`

- 표시 전용. `"{Context label} · {time}"`, 시간은 `custom_time` 일 때만.
- `--tag-height-sm`, `Surface fill=glass`, 아이콘 = Lucide `clock`.
- 선택 UI 는 §2.4 feature 가 소유한다.

### 5.12 Stage 3에서 만들지 않는 컴포넌트 — `CONFIRMED (D-14)`

**원칙: "해당 화면의 컴포넌트가 나올 때 만든다."** 아래는 Stage 3 화면에 사용처가 없으므로 **지금 만들면 선행 구현**이다.

| 분류 | 컴포넌트 | 만드는 Stage |
|---|---|---|
| Shared UI | `StatTile` | **Stage 7** (`/progress` 내용) |
| Shared UI | `TextArea` · `StarRating` | **Stage 5** (회고) |
| Shared UI | `PromptCarousel` | **Stage 4** (Prompt Drawer) |
| Shared UI | `SegmentedTabs` | 사용처가 생기는 Stage (현재 없음) |
| Domain | `ReadingNowCard` | **만들지 않는다** — `CONFIRMED (D-7)`, PRD 근거 없음 |
| Domain | `AttendanceStickerChip` · `RecordButton` · `UploadStatusBadge` | Stage 4 |
| Domain | `AnalysisStatusCard` | Stage 5 |
| Domain | `CapabilityProgressRow` · `WeeklyReadingChart` · `NotableQuoteCard` | Stage 7 |
| Domain | `CapabilityDiamondChart` · `PersonaCard` | **Stage 2-B** (디자이너 Figma 대기) |

- "나중에 쓸 것 같으니 미리 만든다" 를 하지 않는다. 미리 만든 컴포넌트는 **그 화면의 요구를 모른 채 API 가 굳어** 해당 Stage 에서 다시 고쳐야 한다.
- Prompt 단계·페이지 배지도 같은 원칙을 따른다 — **별도 `PromptPhaseTag` 컴포넌트를 만들지 않고** 기존 `Tag(size=xs)` 조합으로 해결한다 (§5.4.1).

---

## 6. 사용 토큰

Stage 3 화면은 Stage 1 §3 + Stage 2 §6.1 의 토큰으로 표현된다. **semantic 토큰 신규 제안은 0건**이다. 아래는 **Tier-3(컴포넌트) 토큰** 제안과 실사용 근거다.

### 6.1 신규 **semantic** 토큰 — **0건**

- 색·타이포·spacing·radius·shadow·material 전부 기존 semantic 으로 표현된다.
- Figma raw 값 흡수: **18 → `--space-5`(20, Δ+2)** (카드 padding) · **14 → `--space-3`(12, Δ−2)** (칩 padding-inline) · **9 → `--space-2`(8, Δ−1)** (Prompt ↔ ActionBar) · **6 → `--space-1-5`(6, Δ0)` · **74 → `--list-row-height-media`**(§6.2). 전부 `AD-6` 흡수 규칙(#10-②) 범위이며 §11.3에 등록한다.

### 6.2 신규 **Tier-3(컴포넌트) 토큰 제안** — `packages/ui` · `entities` 내부 전용

| 토큰 | 값 | 근거 | 라벨 |
|---|---|---|---|
| `--list-row-height-media` | **74** | Figma `163:2100` · `30:141` 행 높이 74 (2곳 일치) | **CONFIRMED (Figma)** |
| `--book-cover-aspect` | **7 / 10** | 58×83(0.6988) · 34×48(0.7083) 흡수 (§5.3) | **신규 토큰 제안** |
| `--book-cover-w-sm` | `--space-8` + `--space-0-5` = 34 → **34** | Figma `163:2101` 34 | **CONFIRMED (Figma)** |
| `--book-cover-w-md` | **58** | Figma `85:610` 58 | **CONFIRMED (Figma)** |
| `--prompt-pill-height-min` | **42** | Figma `86:438` pill 42 (4개 일치) | **CONFIRMED (Figma)** |
| **`--prompt-preview-collapsed-count`** | **3** | 카드 접힌 상태 **표시 개수**(§5.1.1). **cutoff 이며 cap 이 아니다** — `promptPreview` 길이 제한이 아니고, 이 토큰으로 배열을 자르지도 않는다(`slice` 금지) | **CONFIRMED (user N-2, approvals §6.1 + `D-21`, §9.1)** |
| `--carousel-columns` | **3** | Figma 345 트랙에 3열 | **CONFIRMED (Figma)** |
| `--carousel-gap` | `--space-3` (12) | 위 열 폭 역산 | **RECOMMENDED** |
| **`--carousel-shadow-inset`** | `--space-6` (24) — **상단 전용**. 하단은 `--carousel-shadow-inset-block-end` (80px, 상 24 / 하 80 (`D-REQ-4` 정정)) | §4.2 (A)안의 세로 그림자 상쇄값. `--shadow-glass-rest` 세로 번짐 범위 | **CONFIRMED (approvals §6 — 조건부 승인)**. 이 상쇄 구조가 **승인 조건 자체**이며, 보호 구조를 빼거나 실측 번짐(아래 77 · 위 22)보다 줄이면 승인 범위를 벗어난다 |
| `--toggle-track-w` · `--toggle-track-h` · `--toggle-knob-size` | **가값** | iOS `17:113` 외 근거 없음 | **`가값 (P-20)` — 확정 (`§8.5 ⑤`, 2026-10-02)** |
| **`--prompt-phase-tag-bg`** | `--haru-palette-cyan` (`#a0ccdd`) | Figma `Pagetag1–3` 3 인스턴스 **동일 배경** 실측 (§5.4.1) | **신규 토큰 제안** |
| **`--prompt-phase-tag-fg`** | `--haru-white` | 〃 흰 라벨. 대비 **1.72:1** | **신규 토큰 제안** + **`가값 (P-23)` — 신설 확정 (approvals §9.2 ⑫, 2026-10-03)**. `P-02` 에 흡수하지 **않는다** (§6.4) |
| **`--prompt-phase-tag-gap`** | `--space-2-5` (10) | 배지 ↔ 질문 텍스트 gap, Figma 3 인스턴스 **10 일치 (Δ0)** | **CONFIRMED (Figma)** |

> **`--toggle-*` 3건 = `가값 (P-20)`** — 사용자 결정으로 **가값으로 진행**한다. development-agent 는 토큰 정의에 **`provisional` 주석**을 남기고 QA 리포트의 가값 목록에 올린다. 디자이너 값이 오면 **토큰 값만 교체**하며 컴포넌트 코드는 바뀌지 않는다. 임시값은 §4.5 의 구조(트랙 + 노브 + hit 44)를 만족하는 범위에서 development-agent 가 정한다 — **iOS kit 수치를 "확정값"으로 기록하지 않는다**.

> **`--prompt-phase-tag-fg` = `가값 (P-23)`** — 사용자 결정으로 **별도 ID 신설**이다(approvals §9.2 ⑫). `P-02`(역량 배지·비텍스트 경계·진행 바)에 흡수하지 않는 이유는 **대상과 교체 조건이 다르다**는 것이다: `P-02` 는 **역량 색 4종 위 흰 라벨**이고 디자이너가 역량 팔레트를 손대면 함께 해소되지만, `P-23` 은 **Prompt 단계·페이지 배지 전용 Tier-3 토큰**이라 역량 팔레트가 바뀌어도 해소되지 않는다(§6.2 분리 근거와 같은 논리). 2026-09-22 사용자 원칙(**Figma 값 우선 + `provisional` 표시**)을 그대로 적용해 **Figma 실측값(cyan + 흰 라벨)으로 진행**하고, 디자이너 값이 오면 **토큰 값만 교체**한다.

> **`--prompt-phase-tag-*` 2건을 `--color-capability-flexibility-*` 로 대체하지 않는 이유** — 둘은 같은 primitive(`--haru-palette-cyan`)를 가리키지만 **의미가 다르다**. 역량 색 토큰을 Prompt 단계 배지에 쓰면 "cyan = Cognitive Flexibility" 라는 결정 #19 의 규칙이 깨지고, 나중에 역량 색을 바꾸면 Prompt 배지까지 따라 바뀐다. **Tier-3 토큰으로 분리**해 둔다 → §13.2 ⑪.

### 6.3 남은 가값(P-xx) Stage 3 실사용처 — 재제시용 증빙 목록

| P | 토큰 | **Stage 3 실사용 화면·요소** |
|---|---|---|
| **P-01** | `--color-fg-secondary` · `--color-fg-tertiary` | **BottomTabBar 미선택 라벨 3탭 중 2탭**(첫 실사용, 상시 노출) · 카드 저자명·추천 이유 · `BookListRow` subtitle("4 sessions · finished May 2") · `BookShelfItem` 역량 캡션 · `SectionHeader` 아래 설명 · `HomeFooterNote` · 증정 목록 "Requested {date}" · 알림 설정 그룹 제목 · EmptyState 설명 |
| **P-02** | `--color-border-subtle` · `--color-progress-track` · `--color-progress-fill` | **`CapabilityBadge` 흰 글자 4종**(덱 3장 + 시트, 상시 노출) · `BookCover placeholder` 테두리 · **`Toggle` off 트랙**(신규) · `Carousel` 아이템 미선택 경계. **미선택 `Chip` 경계 증빙 = Stage 2 온보딩 화면**(`CONFIRMED (approvals §9.2, 2026-10-03)`) — `D-18` 로 Stage 3 요일 `Chip` 이 마운트되지 않으므로 Stage 3 증빙이 없으나, **`Chip` 자체는 Stage 2 에서 이미 검증**되었다. 가값 재제시 때 Stage 2 온보딩 화면을 증빙으로 제시한다. **Prompt 단계·페이지 배지 흰 글자(1.72:1)는 `P-02` 가 아니라 `P-23`** 이다 (approvals §9.2 ⑫) |
| **P-23** | `--prompt-phase-tag-fg` | **Prompt 단계·페이지 배지 흰 글자 1.72:1** — Home 덱 카드 pill(접힘 3 + 확장 전부, pill 마다 1–2개) · Prompt 시트(`86:482`) · `BookDetailSheet` 카드. **신규이자 유일한 사용처**이며 `D-8` 로 상시 노출된다 (§5.4.1) |
| **P-04** | `--color-status-*` (16) | **`GiftStatusTag` 6종**(신규 최대 사용처) · **증정 접수 안내 `tone=success`/`info`**(잠정 문구, §2.12) · 증정 중복 `tone=info` · 책 소진 `tone=info` · push 권한 거부 `tone=info` · push 저장 실패 `tone=warning` · `/library/add` 필드 에러 · 등록 성공 Toast `tone=success` |
| **P-05** | `--color-scrim` | **Sheet 5종 동시 도입** — ReadingContext · Prompt · LibraryShelf · BookDetail · 시간 목록. Stage 2(2곳)에서 **표면 수가 크게 늘어난다** |
| **P-16** | `--size-medallion-sm/md/lg` | **Stage 3 사용처 0건** — Home·서재는 `CharacterMedallion` 이 아니라 `CharacterIllustration` 을 쓴다. **가값 유지**(sm 136은 여전히 미검증) |
| **P-17** | `TextField.trailingAction` 구분 방식 | **`/library/add` 검색 필드의 clear 액션** — Stage 2의 "Show/Hide" 에 이어 **두 번째 사용처**. 같은 문제(색 단독 구분)가 재현된다 |

> 재제시 시점은 Plan §17.3 절차를 따른다. **P-01·P-02·P-04·P-05 는 Stage 3에서 사용량이 크게 늘어나므로 Stage 3 구현 완료 시점이 재제시의 적기다.**

### 6.4 신규 가값

| ID | 항목 | 상태 | 사유 · 해소 조건 |
|---|---|---|---|
| **P-20** | `--toggle-track-w/h`, `--toggle-knob-size` | **확정 (`§8.5 ⑤`, 2026-10-02)** | §6.2 — iOS kit 외 근거 없음. 토큰 정의에 `provisional` 주석. **디자이너 값 도착 시 토큰 값만 교체**(§13.4 ⑪) |
| **P-21 (후보)** | `--carousel-shadow-inset` | 후보 | §4.2 — 그림자 번짐 상쇄값은 Figma 근거가 아니라 계산값 |
| **P-22** | `conversation_only` 카드의 일러스트 슬롯 에셋 | **확정 (`§8.5 ⑧`, 2026-10-02)** | §2.6 — 전용 에셋이 없어 **기존 캐릭터 에셋을 전용(轉用)** 한다. 전용 에셋 도착 시 **파일만 교체**(§13.4 ⑬) |
| **P-23** | `--prompt-phase-tag-fg` 흰 라벨 대비 **1.72:1** (cyan `#a0ccdd` 배경) | **신설 확정 (approvals §9.2 ⑫, 2026-10-03)** | §5.4.1 · §6.2 — **`P-02` 에 흡수하지 않는다**: 대상이 역량 색 4종이 아니라 **Prompt 배지 전용 Tier-3 토큰**이고, 역량 팔레트 변경으로 해소되지 않으므로 **교체 조건이 다르다**. 2026-09-22 원칙대로 **Figma 실측값으로 진행 + 토큰에 `provisional` 주석**. 해소 조건 = 디자이너가 Prompt 배지 전경/배경 색을 확정 → **토큰 값만 교체**(컴포넌트 코드 불변). 색 단독 전달이 아니므로 정보 손실은 없다(라벨 텍스트가 본체). 증빙 사용처 = §6.3 |
| ~~P-18~~ | `--list-row-height-min` 56 | 가값 유지 | media 74 실측이 basic 56 을 확정해 주지 않는다 (§4.3) |

### 6.5 가값 ID `P-17` ~ `P-23` 현재 할당 — **집계(참조용)**

> **이 표는 대장이 아니다.** 가값 대장은 **분산 소유**다: `P-01`~`P-16` 정본 = `docs/decisions/stage-0-approvals.md` §4 (+ `docs/DESIGN_TOKEN_MAP.md` §4.1 표) · `P-17`·`P-18`·`P-19` = `docs/design/stage-2-design-spec.md` §6.4 · `P-20`~`P-23` = 이 문서 §6.4 · 재제시 절차 = `docs/plans/stage-3-plan.md` §17.3. **`P-17` 이후 구간에 단일 소유 문서가 없다** — 번호는 어느 문서에서도 임의로 재배정하지 않는다. 아래는 혼동을 막기 위한 **현재 할당 집계**다 (2026-10-03 기준).

| ID | 대상 | 신규 등록 문서 | 상태 | Stage 3 사용처 |
|---|---|---|---|---|
| **P-17** | `TextField.trailingAction` 구분 방식 (색 단독 구분 — WCAG 1.4.1) | Stage 2 Spec §6.4 | 디자이너 대기 | ✓ `/library/add` 검색 필드 clear (두 번째 사용처, §6.3) |
| **P-18** | `--list-row-height-min` **56** | Stage 2 Spec §6.4 (**후보**) | **가값 유지** — media **74** 실측이 basic 56 을 확정해 주지 않는다 (§4.3 · §6.4) | 간접 (`ListRow` basic 행) |
| **P-19** | `CharacterMedallion` `ring-offset` | Stage 2 Spec §6.4 (**후보**) | **후보 유지** | **0건** — Stage 3 는 `CharacterMedallion` 을 쓰지 않는다(`CharacterIllustration` 사용, §6.3 `P-16` 과 같은 사유) |
| **P-20** | `--toggle-track-w/h` · `--toggle-knob-size` | **이 문서 §6.4** | **확정** (가값으로 진행 — `§8.5 ⑤`, 2026-10-02) | ✓ `/settings/notifications` push 토글 (§4.5) |
| **P-21** | `--carousel-shadow-inset` | **이 문서 §6.4** (**후보**) | 후보 — Figma 근거가 아니라 계산값 | ✓ `Carousel` 2곳 (§4.2) |
| **P-22** | `conversation_only` 카드 일러스트 슬롯 에셋 | **이 문서 §6.4** | **확정** (기존 캐릭터 에셋 전용 — `§8.5 ⑧`, 2026-10-02) | ✓ 덱 대체 카드 (§2.6) |
| **P-23** | `--prompt-phase-tag-fg` 흰 라벨 **1.72:1** | **이 문서 §6.4** | **신설 확정** (approvals §9.2 ⑫, 2026-10-03) — `P-02` 흡수 아님 | ✓ `PromptPill` 배지 (카드 접힘 3 + 확장 전부 · Prompt 시트 · BookDetailSheet, §5.4.1) |

- **P-19 는 Stage 3 사용처가 0건**이므로 Stage 3 QA 증빙으로 쓸 수 없다. `P-16` 과 같은 처리(**가값 유지, 재제시 보류**)가 맞다 — §6.3 에 행을 만들지 않은 이유다.
- 재제시 순서는 Plan §17.3 이 소유한다 (현재 `P-02 → P-01 → P-04 → P-05 → P-16 → P-17 → P-23`). **`P-18`·`P-19`·`P-21` 은 그 목록에 없다** → 소유자 불명 구간이며 보고 대상이다.

---

## 7. Interaction / Motion

| 대상 | 동작 | 토큰 | reduced-motion |
|---|---|---|---|
| Home 덱 카드 전환 | `translateX(±60%)` + fade, 뒤 카드 전진 (Stage 2 `SwipeDeck` 그대로) | `--motion-duration-base` / `--motion-ease-standard` | **즉시 교체** |
| 덱 임계 미만 복귀 | 원위치 스프링 | `--motion-duration-fast` / `--motion-ease-spring` | 즉시 |
| **Prompt 확장 / 접기** | **높이 모션 없음** (높이 보간은 `overflow: hidden` 클리핑을 요구 — §0.4). 새로 나타난 pill 블록만 fade in (§5.1.1) | `--motion-duration-fast` | **즉시 표시** |
| 카드 선택 → Context 시트 | Sheet 진입 (Stage 1 §4.21) | `--motion-duration-base` | fade only |
| Carousel 페이지 이동 | `scrollTo({behavior:'smooth'})` | — | **`behavior:'auto'`** |
| Toggle 노브 | 좌↔우 이동 | `--motion-duration-fast` / `--motion-ease-standard` | 즉시 |
| Sheet 전환(Shelf → BookDetail) | **교체 전환**(닫고 열지 않음) — fade + 6px 상승 | `--motion-duration-fast` | fade only |
| Skeleton | Stage 1 §5.1 | — | 펄스 제거 |
| InlineAlert(오프라인·증정) | 높이 0→auto + fade | `--motion-duration-fast` | 즉시 표시 |
| Toast | Stage 1 §4.12 + **하단 offset 변경**(§2.1) | — | — |
| 캐릭터 일러스트 | **모션 없음** (idle 애니메이션 에셋 없음 — DESIGN_SYSTEM §9.2) | — | — |

- 드래그 임계: 카드 폭의 **25%** 또는 속도 기반 — Stage 2와 동일.
- **자동 재생·자동 전환 없음**. 캐러셀은 자동으로 넘어가지 않는다.
- 덱·캐러셀 모두 **제스처가 유일한 수단이 되지 않는다** (WCAG 2.5.1).

---

## 8. 상태 화면과 Mock 시나리오 매핑

> 공통 상태의 **시각 규격은 Stage 1 §5(P-10 확정)** 그대로. 여기는 "어느 화면에서 어떤 상태가 나오는가"만 정의한다. key 는 Plan §8.2의 **16종**이며 신규 key 는 없다.

| Mock key | 화면 | 상태 표현 |
|---|---|---|
| `success` | 전체 | 정상. **Home 카드·BookDetailSheet 카드는 Prompt 접힘(3개)으로 진입**하며 `promptPreview.length > 3` 이면 확장 트리거가 보인다 (§5.1.1). fixture 는 **4개 이상 케이스를 반드시 포함**한다(신규 mock key 없음 — `success` fixture 변형) — **`D-21` 로 contract 상한이 제거되었으므로 이 케이스가 "상한이 실제로 없음" 의 증거다**(approvals §9.1). **`D-8` 추가**: 같은 fixture 세트가 `phase`·`pageRef` 를 **결정적으로** 채워 배지가 실제로 보이게 하고, **둘 다 `null` 인 Prompt 를 최소 1개** 섞어 미렌더 경로도 함께 검증한다 (§5.4.1) |
| `loading` | `/`, `/library`, `/library/add`, `/library/gift-requests`, `/settings/notifications` | **Skeleton**: Home = 카드 1장 형태(역량 배지/커버/텍스트 3줄/pill 3줄 = **접힌 상태 기준**) + dots. **pill skeleton 에 단계 배지 자리를 따로 그리지 않는다**(값 유무를 모른다). 확장 트리거 자리는 skeleton 에 넣지 않는다(개수를 모른다). 서재 = 캐러셀 3열 + 목록 3행. 150ms 미만이면 미표시. 액션은 Button loading |
| `empty` | `/`(카드 없음), `/library`(§2.10), `/library/gift-requests` | Home 카드 없음 = **화면 단위 EmptyState 아님** → 덱 자리에 inline EmptyState + 설명(서버 문구 슬롯). 서재는 §2.10 |
| `error` | 전체 | 화면 전체 실패 = `ErrorState` + Retry. 부분 실패(캐러셀 1개) = 해당 섹션만 inline `InlineAlert tone=error` + 재시도 |
| `retry` | 전체 | Error → 재시도 → 정상. **`/library/add` 입력값·스크롤 위치 유지** |
| `offline` | 전체 | `InlineAlert tone=offline placement=banner`, TopBar 바로 아래 sticky. 수동 닫기 없음 |
| **`offline-cached-card`** | `/` | **캐시 카드 표시 + Offline Banner 동시**. 카드는 정상 렌더하되 **선택 CTA `disabled`** + 사유 문구. 캐시 날짜가 오늘이 아니면 **카드 날짜를 화면에 밝힌다**(`CONFIRMED (D-10)` ③) |
| **`conversation-only-option`** | `/` | 덱에 `kind=conversation_only` 카드 (§2.6) |
| **`reread-option`** | `/` | 덱에 `kind=reread_book` 카드 (§2.6) |
| **`books-exhausted`** | `/` | 덱 3장 전부 대체 카드 + 덱 상단 `InlineAlert tone=info` + 하단 2개 `TextLink`(§2.6) |
| **`session-already-active`** | `/` | 덱 위 `ActiveSessionNotice`(§5.9). 링크는 Stage 3에서 `disabled` |
| **`gift-pending`** | `/library`, `BookDetailSheet`, `/library/gift-requests` | 서재 아이템에 `GiftStatusTag`. 시트는 §2.9 `gift_pending` 행. §13 대체 안내(`/library/add` · 대화 전용 카드) 링크 |
| **`gift-duplicate`** | `BookDetailSheet` | 시트 안 `InlineAlert tone=info` + 상태 링크. **오류 화면 아님** |
| **`user-entered-book`** | `/library`, `/library/add` | `BookCover variant=placeholder`. 검색 결과 없음 → `Add "{query}" as a title` |
| **`push-permission-denied`** | `/settings/notifications` | 권한 거부 블록(§2.14) — 재요청 버튼 없음, 기기 설정 안내. **`D-18` 로 이 화면에는 push 권한 블록만 있다** |
| `onboarding-incomplete` | `/`, `/library` | Route Guard 가 온보딩으로 되돌린다 (Stage 2 회귀) |

**상태 매트릭스 (화면 × 상태)**

| 화면 | Loading | Empty | Error+Retry | Offline | Permission | Pending | Duplicate | Placeholder |
|---|---|---|---|---|---|---|---|---|
| `/` | ✓ | ✓ | ✓ | ✓ (+캐시) | — | ✓(active session) | — | ✓ |
| `/library` | ✓ | ✓ ×4 | ✓ | ✓ | — | ✓(gift) | — | ✓ |
| `LibraryShelfSheet` | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |
| `BookDetailSheet` | ✓ | — | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Prompt 시트 | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| `/library/add` | ✓ | ✓(검색 0건) | ✓ | ✓ | — | — | — | ✓ |
| `/library/gift-requests` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| `/settings/notifications` (push 권한 블록만) | ✓ | — | ✓ | ✓ | ✓ | — | — | — |
| `/progress` | — | ✓(상시) | — | ✓ | — | — | — | — |

---

## 9. Responsive Rule (#12 확정 규칙 위에서)

| 폭 | 규칙 |
|---|---|
| **320** | 콘텐츠 272. **검증 대상**: ① 덱 카드 내부(추천 이유 2줄 + **접힌 pill 3개 + 확장 트리거 1행** + ActionBar 2버튼) · **확장 상태에서 pill 이 2줄 말줄임을 유지하는지**(§5.1.1) · **단계·페이지 배지 1–2개가 붙은 pill 의 질문 폭(≈128)에서 2줄 말줄임이 유지되는지**(§5.4.1) ② **캐러셀 3열 → 열당 (272−24)/3 = 82.7 → 커버 높이 118** ③ 탭바 3항목 라벨 1줄 ④ `ListRow` 제목 + meta 줄바꿈 ⑤ ActionBar 2버튼 가로 → **세로 스택 전환 임계 `RECOMMENDED`** |
| **393** | Figma 기준 폭. 시각 비교 baseline |
| **600** | 앱 컬럼 480 고정 + 가운데. 캐러셀 열 폭 = (432−24)/3 = 136 |
| **1024** | 동일(480 컬럼). 다단 없음 |
| **텍스트 200% (320px)** | 전 화면 세로 reflow. **고정 높이 컨테이너 금지** — 카드·pill·`ListRow`(74)·캐러셀 아이템·시트 전부 콘텐츠 높이 |

Stage 3 고유 규칙:

1. **덱 카드 폭 = 콘텐츠 폭 100%.** 고정 폭 금지(Stage 1 §7.1). `--deck-inset-x`(8)·`--deck-peek-y`(16)는 폭과 무관.
2. **캐러셀 열 수는 항상 3** (`--carousel-columns`). 폭이 줄면 열이 줄지 않고 **아이템이 작아진다** — 열 수를 바꾸면 `PageIndicator` 의 페이지 수가 폭마다 달라져 `aria-live` 문구가 흔들린다. → `AD-S3-20`.
3. **캐릭터 일러스트 bleed** 는 항상 `--layout-gutter` 만큼이며 컬럼 밖으로 더 나가지 않는다. ≥600px 에서는 480 컬럼 기준 528 폭.
4. **Sheet 최대 높이** = `calc(100dvh - var(--layout-safe-top) - var(--space-8))`. 내용이 넘치면 시트가 아니라 **바깥 스크롤 컨테이너**가 스크롤한다(§0.4).
5. **하단 CTA·ActionBar 는 스크롤 컨테이너 안**에 둔다 — 소프트 키보드에 가려지지 않게 (`/library/add`).
6. **탭바 중앙 버튼 위치**는 폭과 무관하게 바 가로 중앙이며, 바 폭은 `min(컬럼, 480) − 2×gutter` 다 (실측: 288 / 361 / 448 / 448).

---

## 10. Accessibility 메모

| 항목 | 규격 |
|---|---|
| 터치 타깃 | 44×44. 예외 = 입력 행 42(`PASS (accepted: S1-G-2)`). **`SectionHeader` "See all"·캐러셀 화살표·`Toggle` 은 시각 크기와 별개로 hit 44 확보** |
| 포커스 | `:focus-visible` 만, `--color-focus-ring` 2px/offset 2px. Sheet 5종 전부 focus trap + 닫힐 때 트리거 복귀. **Shelf → BookDetail 교체 전환 시에도 포커스를 잃지 않는다** |
| **제스처 대체 (WCAG 2.5.1)** | 덱 = prev/next 버튼(§2.3) · 캐러셀 = `SectionHeader` 행의 prev/next(§4.2). 둘 다 **끝에서 `disabled` 이며 사라지지 않는다** |
| **덱 전환 알림** | `aria-live="polite"` — "Option {n} of 3: {제목 \| kind 라벨}" |
| **Prompt 확장** | 트리거 = `<button>` + `aria-expanded` + `aria-controls`, 라벨에 **개수 포함**("Show all {n} prompts" / "Show fewer"). 확장은 **live region 을 쓰지 않는다**(`aria-expanded` 로 충분 — 덱 알림과 이중 발화 방지). **렌더된 pill 에 `aria-hidden` 금지**, 확장으로만 도달하는 Prompt 도 **키보드 도달 가능**. 트리거 hit 44 (§5.1.1). **`D-21`**: pill 이 포커스를 받지 않으므로 **tab stop 수가 `n` 에 무관**하다 — 개수가 늘어도 키보드 사용자의 이동 횟수가 늘지 않는다. 트리거 라벨에서 **개수를 빼지 않는다**(상한이 없으므로 "더 있다" 의 양을 알려주는 유일한 수단이다) |
| **캐러셀 전환 알림** | `aria-live="polite"` — "Showing {a}–{b} of {n}" |
| **Prompt 단계·페이지 배지** | 배지는 **텍스트이며 포커스를 받지 않는다**(§5.4.1). 읽기 순서 = `{PRE\|POST\|P.n} … {질문}`. 아이콘·색 단독 전달 금지 — **라벨 텍스트가 본체**다. 값이 없으면 배지를 렌더하지 않으므로 **스크린리더가 빈 요소를 읽지 않는다** |
| **Home 캐릭터 버블** | `characterLine` 이 캐릭터의 의미를 전달하는 **유일한 수단**이다 — `aria-hidden` 금지. 값이 없으면 버블을 렌더하지 않는다 (§2.2) |
| 뒤 카드 | `aria-hidden="true"` + `inert` (포커스 진입 금지) |
| **표지 `alt`** | "{제목} by {저자}". `ListRow` 안에서는 `alt=""`(중복 방지). 장식 아님 — `BookShelfItem` 은 커버가 유일한 시각 단서다 |
| **탭바 활성 비색상 표시** | `aria-current="page"` + 라벨 `--font-weight-semibold`. **중앙 버튼의 원형 강조는 활성 표시가 아니다**(항상 강조) |
| 캐릭터 일러스트 | `decorative`(`aria-hidden`). 의미는 버블 텍스트가 담당 |
| **서재 읽기 순서** | 섹션 제목(h2) → 캐러셀(group) → 아이템 → 목록(list) → 행. 필터는 섹션 제목으로 구분되므로 별도 필터 컨트롤의 접근성 이름이 필요 없다 |
| **증정 상태 읽기 순서** | 행 이름 = "{제목}, requested {date}, {status label}" |
| `Toggle` | `role="switch"` + `aria-checked` + `aria-labelledby`(행 제목). 행 전체 탭으로도 토글 |
| ~~`Chip` 다중 선택~~ | **Stage 3 사용처 없음** — 리마인더 요일 선택이 `D-18` 로 Out of Scope (§2.14). 규격은 알림 설정 화면이 도달하는 Stage 에서 재검토 |
| 시간 `SelectTrigger` | `aria-haspopup="dialog"` + 현재 값이 접근성 이름에 포함. Stage 3 사용처는 **Reading Context `custom_time` 1곳** |
| 외부 링크 | "Where to buy" 는 링크 텍스트 + 시각 숨김 "Opens in a new tab" |
| `disabled` CTA | `aria-disabled="true"` + **포커스 가능**해야 사유를 읽는다 (`CONFIRMED (D-3)`) |
| 대비 | 본문·제목 = 확정 토큰. **탭바 미선택 라벨(P-01) · 역량 배지 흰 글자(P-02) · 증정 상태 색(P-04) 은 미달 가능** — §6.3이 재제시 증빙 |
| 모션 | `prefers-reduced-motion: reduce` 에서 덱·시트·캐러셀·Toggle 모션 제거 (§7) |
| **언어** | 영어. **진단·판정·비교 표현 금지**. Stage 3 고위험 지점 = **Home 집계 · 증정 상태 · 빈 상태** → 금지어: `streak`, `goal`, `on track`, `behind`, `missed`, `{n}/7`, `%`, `rejected`(→ "Not available"), "You haven't…". 패턴 = `<사실> + <다음에 할 수 있는 것>` |
| PII | 화면·알림 문구에 `lastName` 금지(C-6). **콘솔·에러 로그에 아이 이름 + 책 제목 조합 금지**(Plan §2.1) |

---

## 11. Figma node 참조 · 시각 비교 · 허용 차이

### 11.1 Stage 3 참조 node (조회·실측 2026-09-30)

| 화면 | node |
|---|---|
| Home | `26:21` `26:22` `26:39` `26:40` `26:44` `88:922` `27:85` `27:89` `88:909`(미사용) |
| 덱 카드 | `163:2648` `163:2649` `163:2650` `163:2651` · `86:438`(+`85:643` `85:608–617` `139:2491–2721` `86:383`) · `86:512` `86:545` · `86:527` `86:538` |
| Prompt 시트 | `86:482` |
| Library | `30:74` `30:87` `30:88` `30:89` `30:90/91/93` `163:1624–1626` `163:1632–1634` `30:138/139` `30:140–146` `163:1636–1655` `113:1994` `145:779` |
| Library 시트 | `163:1669` `163:1807` · `145:1132` `145:1450` `145:1085` `145:1141`(미사용) |
| 컴포넌트 | `113:1993` `113:1991` `113:1992` · `163:2145`(+`163:2100–2142`) · `25:87` `140:2971` · `17:113`(Toggle, iOS kit) |
| Progress | `31:102` `163:2642`(일러스트만 재사용) |

### 11.2 시각 비교 baseline 제안 (`Stage 2 §11.2 방식 유지`)

| ID | 대상 | 범위 |
|---|---|---|
| `s3-home` | `/` 전체 프레임 | 프레임 |
| `s3-home-deck` | 덱 카드 1장(active) + dots — **Prompt 접힘**(n=5 fixture → pill 3 + 트리거), **단계·페이지 배지 포함**(`86:438` 과 동일 구성) | 영역 클립 |
| `s3-home-deck-prompts-expanded` | 같은 카드 **Prompt 확장 상태**(n=5) + dots 위치 | 영역 클립 |
| `s3-card-alt` | 대체 카드 2종(`reread_book`·`conversation_only`) | 영역 클립 |
| `s3-context-sheet` | Reading Context 시트 | 영역 클립 |
| `s3-prompt-sheet` | Prompt 시트 (`86:482` 대조) | 영역 클립 |
| `s3-library` | `/library` 전체 프레임 | 프레임 |
| `s3-library-carousel` | 캐러셀 1개 + SectionHeader | 영역 클립 |
| `s3-library-list` | `BookListRow` 3행 + divider | 영역 클립 |
| `s3-book-detail` | BookDetailSheet | 영역 클립 |
| `s3-add-book` · `s3-gift-requests` · `s3-progress` | 각 route 전체 프레임 | 프레임 |
| `s3-notifications` | `/settings/notifications` 전체 프레임 — **`D-18` 범위 축소 후 구성**(push 권한 블록만, 권한 3상태) | 프레임 (**회귀 전용** — Figma 대조 대상 아님) |
| `s3-tabbar` | 탭바 + 중앙 버튼 (스크롤 상단/하단 2컷) | 영역 클립 |
| `s3-prompt-pill-tags` | `PromptPill` 배지 3종(`PRE` · `POST` · `P.6`) + 배지 없는 pill 1종 (dev gallery) — Figma `Pagetag1–3` 대조 | 영역 클립 |
| `s3-sectionheader` · `s3-carousel` · `s3-toggle` · `s3-listrow-media` | 신규 컴포넌트 (dev gallery) | 영역 클립 |

- 전체 프레임 baseline = 레이아웃 회귀 전용(`0.002 / 200`), 영역 클립 = Figma 대조용(`0.002 / 20`).
- **`s3-tabbar` 는 스크롤 상단·하단 2컷을 모두 남긴다** — §2.1의 sticky 규칙이 회귀하면 여기서 잡힌다.
- **`s3-home-deck-prompts-expanded` 는 Figma 에 대응 프레임이 없다** (확장 구조는 `N-2` 사용자 결정) → **회귀 전용**(`0.002 / 200`)이며 Figma 대조 대상이 아니다. Figma 대조는 `s3-home-deck`(접힌 상태)로만 한다 → §11.3 `AD-S3-22`.

### 11.3 Stage 3 허용 차이 (사전 등록 — QA는 FAIL 처리하지 않는다)

| ID | 차이 | 원인 | 허용 범위 |
|---|---|---|---|
| **AD-S3-1** | 카드 Prompt = **접힌 상태 3개 + 확장**, **개수 상한 없음** (Figma 는 변형마다 고정 개수: `86:438` 5 · `163:2648` 4 · `86:512` 2 · `86:482` 3) | `CONFIRMED (N-2, approvals §6·§6.1)` — 표시 개수와 상한을 분리했다 (§5.1.1) | **pill 개수 차이 전부 허용** + 그에 따른 카드 높이 차이 **상한 없음**(기존 "±96px" 폐기). pill 높이·gap·순서 차이는 불허. **Figma 대조는 접힌 상태로만** 한다 (§11.2) |
| **AD-S3-2** | 역량 배지에 **" Day" suffix 없음**, `163:2650` "Emotion Day  Day" → **"Emotion Regulation"** | 오타 M-13 + `D-5`(카드마다 다른 역량)로 "오늘의 X Day" 의미 소멸 (§5.2) | 라벨 **문구 비교 제외**. 배지 위치·색·높이 차이는 불허 |
| **AD-S3-3** | 카드 ActionBar 가 **흐름의 마지막 요소** (Figma `163:2648` 은 Prompt 위에 겹침) | Figma 고정 프레임(377)의 **overflow 결함**. 겹침을 그대로 옮길 수 없다 (§5.1) | ActionBar 세로 위치 차이 허용. 좌우 정렬·버튼 크기 차이는 불허 |
| ~~**AD-S3-4**~~ | ~~`/library` 2번째 섹션 제목 "Finished together" → "Books you own"~~ | **무효 — 삭제 (approvals §14.1)**. 전제("제목 중복")가 **사실이 아니다**. `163:1633` 의 텍스트는 **`Favorites`** 이고, 중복은 L-3 `163:1669` 에만 있다. "Books you own" 은 **Figma 에 없는 문구**였다 | **없음 — 이 허용 차이는 존재하지 않는다.** 구현 문구는 `Favorites` 이며 차이가 아니다 |
| **AD-S3-5** | `BookShelfItem` 캡션 **"Emotion"/"Resilience"/"Confidence" → #14 표시 라벨** + **라벨이 길어 11px 1줄에 안 들어간다** | `CONFIRMED (#14)` — 뒤 2개는 4대 역량에 없는 이름 (M-13). **보완 (approvals §19.1 ⑥)**: `Emotion Regulation`(19자) · `Cognitive Flexibility`(21자) · `Intrinsic Motivation`(20자) 은 11px 에서 열 폭 107 을 넘는다 (Figma 원본은 7–10자 / 43–60px). Figma 는 `whitespace-nowrap` 1줄이다 | 문구 비교 제외 + **캡션 행 수 1 → 2 허용**(블록 높이 +13). 줄바꿈·말줄임 규칙은 `stage-3-library-design-spec.md` §6.3 이 정하고, **캡션의 x·폰트 크기·색 차이는 불허** |
| ~~**AD-S3-6**~~ | ~~"Rated 4.5" 미렌더~~ | **무효 (approvals §15, `L-D3`)** — **Figma 대로 렌더한다**. 집계 범위는 "우리 아이 평점만"(`L-OPEN-18`), unrated 는 meta 를 비운다(`L-OPEN-22`) | **없음.** 규격 `stage-3-library-design-spec.md` §4.5 |
| ~~**AD-S3-7**~~ | ~~"Reading now · 3 of 5 nights" 카드 미렌더~~ | **무효 (approvals §15, `L-D2`)** — **Figma 대로 구현한다**(`145:1145`, 345×118 r24, 표지 64×90 r10, 진행 바). `progressRatio` 는 서버가 직접 준다(`L-OPEN-16`), `plannedNights` 는 nullable(`L-OPEN-17`) | **없음.** 규격 §4.2. 합성으로 블록이 추가되는 차이는 **`AD-L-01`** 이 받는다 |
| ~~**AD-S3-8**~~ | ~~"My Saved"·"Save"(★) 미렌더~~ | **무효** — `★ Save` 는 approvals §12.2 로 이미 무효(구현됨), `My Saved` 는 `L-D1`(`Favorites` 채택)으로 해소 | **없음.** `My Saved` 섹션을 쓰지 않는 차이는 **`AD-L-02`** 가 받는다 |
| **AD-S3-9** | 상단 chip **"12-day / 115 Min" → "{n} this week"** | `CONFIRMED (D-6)` (§5.7) | 문구·아이콘 비교 제외. 칩 위치·높이 차이는 불허 |
| **AD-S3-10** | Home 이 **스크롤 페이지**이고 캐릭터 위에 덱이 얹힌다 (`26:21` 은 카드 미배치 852 고정 프레임) | `C13-14 (명세)` — 카드를 넣을 자리가 Figma에 없다 (M-30) | **레이아웃 전체 차이 허용**. 비교는 §11.2 영역 클립으로 수행 |
| **AD-S3-11** | compact 카드의 **빈 라벨 pink 배지 → 역량 라벨** | `86:512` 의 배지가 라벨 없는 placeholder | 문구 차이 허용, 배지 폭 차이 허용 |
| **AD-S3-12** | compact 카드 **"Alternative" 캡션 → `Tag`(kind)** | `C13-16 (명세)` — 종류 식별 표현이 Figma에 없다 | 해당 요소 형태·위치 차이 허용 |
| **AD-S3-13** | 탭바 래퍼 `padding-block-start` **12 → 35** | `CONFIRMED (D-1)` + 실측 (§2.1) | 탭바 상단 여백 **+23px** |
| **AD-S3-14** | Toast 하단 offset **+ overhang(35)** | `CONFIRMED (D-1)` ② 의 "실측 검증" 결과 — 기존 식은 홈 버튼과 19px 겹친다 (§2.1) | Toast 세로 위치 **−35px** |
| **AD-S3-15** | **(재작성 2026-10-02)** Prompt 단계·페이지 배지 **높이 22 → `--tag-height-xs`(19)**, padding-inline **13 → `--space-3`(12)** | `CONFIRMED (D-8)` 로 배지를 **표시**하게 되었다. 이전 판의 "미표시" 허용 차이는 **폐기**한다. 남는 차이는 **토큰 스케일 흡수**뿐이다 (#10-②) | 배지 **높이 −3px · 폭 −2px**. 배지의 **존재·라벨·색·위치 차이는 불허** |
| **AD-S3-16** | 카드·시트의 **"Start Session" `disabled`** | `CONFIRMED (D-3)` | 버튼 **상태(색·투명도)** 차이만 허용. 문구·위치·크기 차이는 불허 |
| **AD-S3-17** | `ListRow` 높이 74 → **최소 74, 내용에 따라 증가** | 200% 텍스트 reflow (고정 높이 금지, DESIGN_SYSTEM §11.2) | 행 높이 **+∞**(축소는 불허) |
| **AD-S3-18** | `26:21` 의 **`88:909`(66×27) 미렌더** | 역할을 특정할 수 없는 무명 프레임 | 해당 요소 차이 허용 |
| ~~**AD-S3-19**~~ | ~~`LibraryShelfSheet` 에 ActionBar 없음~~ | **철회 (approvals §17.2, `L-OPEN-03`)** — `163:1898` `type=shelf` 에 `Button/card`(★ Save + Start Session)가 실재하고 L-3 에 인스턴스가 있다. **Figma 에 있는 것을 빼는** 건이었다 | **없음.** ActionBar 를 Figma 대로 넣는다 (§4.6). 시트의 `Start Session` 비활성은 **`AD-S3-16`**(`D-3`) 이 이미 받는다 |
| **AD-S3-20** | 캐러셀 **열 수 항상 3** (폭에 따라 아이템이 작아진다) | `PageIndicator` 페이지 수·`aria-live` 문구의 폭 독립성 (§9-2) | 320px 에서 아이템 폭 **82.7** 까지 축소 허용 |
| **AD-S3-21** | 카드 padding **18 → `--space-5`(20)**, 칩 padding-inline **14 → `--space-3`(12)**, Prompt↔ActionBar **9 → `--space-2`(8)** | 토큰 스케일 흡수 (#10-②) | 각 **±2px** |
| **AD-S3-22** | 카드에 **Prompt 확장 트리거 1행 추가** (Figma 전 변형에 없는 요소) | `CONFIRMED (N-2)` — 확장 구조 자체가 사용자 결정이다 | 트리거 행의 **존재 자체**와 그에 따른 접힌 카드 높이 **+≈28px** 허용. 위치(Prompt 목록 아래·ActionBar 위)·정렬 차이는 불허. **확장 상태는 Figma 대조 대상이 아니다** |
| **AD-S3-23** | 카드의 **"See all prompts" `TextLink` 폐지** — 시트 진입은 **헤더 우상단 `IconButton`**(Figma `86:438` 우상단 아이콘 자리) | `N-2` 의 귀결 — "전체 보기" 약속의 절반이 확장으로 이동해 같은 약속을 하는 컨트롤이 2개가 된다 (§2.5 · §5.1.1) | Prompt 목록 아래 **링크 부재** 허용. 헤더 아이콘 위치·크기 차이는 불허 |

| **AD-S3-24** | `phase` 와 `pageRef` 가 **동시에 있을 때 배지 2개**를 렌더 (Figma 는 pill 당 1개만 보여준다) | **`CONFIRMED (approvals §9.2 ⑪, 2026-10-03)`** — Figma `86:438` 5개 pill 이 각각 `PRE` / `POST` / `P.6` ×3 으로 **동시 표시 예시를 한 번도 두지 않았다**. 이는 **공백이지 충돌이 아니다**(`N-1` 과 같은 성격)이므로 `RECOMMENDED` 가 아니라 확정 규칙이다. contract 는 두 필드를 **독립 optional 로 유지**한다 (§5.4.1) | 배지 **개수 차이(1 → 2)와 그에 따른 질문 텍스트 폭 감소** 허용. 순서(phase → pageRef)·gap·높이 차이는 불허 |
| **AD-S3-25** | Home 캐릭터 에셋 픽셀 밀도 **≥600px 브레이크포인트에서 1.77x** (2x 미만) | `CONFIRMED (D-13, approvals §7.1 — C 안)`. 투명 원본 최대치가 **933×1659** 이고 480 컬럼 표시 폭 528 의 2x = 1056 에 **123px 부족**하다. 디자이너 재추출(A)·표시 폭 축소(B)를 선택하지 않았다 | **≥600px 에서 밀도 1.77x 허용**. **393px 뷰포트(표시 폭 441)는 2.12x 로 충족**이므로 허용 대상이 아니다. QA 는 `PASS (accepted: D-13)` 로 판정한다. 캐릭터의 **크기·위치·bleed·aspect 차이는 불허** |


#### Library 신규 허용 차이 `AD-L-01`~`AD-L-08` (2026-10-06)

근거·치수는 **`docs/design/stage-3-library-design-spec.md`** 에 있다. `AD-L-01`~`AD-L-05` 는 approvals §16.1 이 등록 대상으로 지정한 항목이고, `AD-L-06`~`AD-L-08` 은 이 라운드에서 **design-agent 가 추가로 발견**해 **승인 대기**인 항목이다.

| ID | 차이 | 원인 | 허용 범위 | 상태 |
|---|---|---|---|---|
| **AD-L-01** | L-1 `30:74` 에 없던 **`Reading now` 블록(170pt)을 맨 위에 추가** | `CONFIRMED (L-D2, approvals §15 · §16.1)` — 합성 기준 화면. L-2 content 자식 y 8개(`0/36/170/206/438/474/706/742`)가 전부 일치해 **창작이 아니라 L-2 의 기하** | 섹션 전체가 **아래로 +170** 이동. Frame15 높이 869 → **1039**. 블록 내부 기하 차이는 불허 | 등록 |
| **AD-L-02** | L-2 의 **`My Saved` 섹션(`145:1156`)을 채택하지 않고** L-1 의 **`Favorites`**(`163:1632`)를 쓴다 | `CONFIRMED (L-D1, approvals §15)` — `163` 세션 편집이 포함된 L-1 이 더 나중 의도이고, 사용자 지시 문구("Library 의 favorites")와 이름이 일치한다 | 슬롯 5 **제목 문구 차이**(`My Saved` → `Favorites`) 허용. 위치·크기·"See all" 유무 차이는 `AD-L-03` 이 받는다 | 등록 |
| **AD-L-03** | 슬롯 3·5 헤더의 **"See all" 을 유지**한다 (L-2 에는 없다) | 기준 화면 = L-1 (`163:1626`·`163:1634` 실재). `L-OPEN-19` = **세 섹션 모두** | 슬롯 3·5 에 **액션 1개 추가** 허용 (x=306 w=39, L-1 과 동일 좌표). 그 밖의 차이는 불허 | 등록 |
| **AD-L-04** | 슬롯 8 `Finished together` 목록을 **4행**으로 둔다 (L-2 는 2행) | 기준 화면 = L-1(`30:140` 4행 297). `L-OPEN-21` = **4행 고정 + "See all" 전체 목록**, 섹션 안 "Show more" 는 **만들지 않는다** | 행 수 2 → **4**(블록 149 → 297) 허용. 행 내부 기하 차이는 불허 | 등록 |
| **AD-L-05** | **L-3 `163:1669` 를 기준 화면으로 쓰지 않는다** | approvals §14.1 — L-3 의 섹션 제목 중복("Finished together" ×2)은 **`163:1633` 이 `Favorites` 로 편집되기 전 사본의 아티팩트**다 `[추정]` | L-3 **base 레이어 전체**를 대조 대상에서 제외. L-3 의 **오버레이**(`163:1807`+`163:2347`)는 제외 대상이 **아니다**(`L-OPEN-03`·`L-OPEN-04` 근거) | 등록 |
| **AD-L-06** | `/library` 하단에 **`LibraryEntryActions` 블록 추가**(`ListGroup` 2행, **섹션 제목 없음**) | `C13 ② (L-OPEN-12, approvals §16.2)` — `FR-22`·`FR-23` 은 PRD P0 인데 진입점이 Figma L-1~L-3 **어디에도 없다**. 디자이너 판을 기다리면 Stage 3 가 막힌다 | 블록의 **존재 자체**와 그에 따른 페이지 높이 **+129**(간격 16 + 행 56×2 + divider 1) 허용. 디자이너 Figma 가 도착하면 교체한다 | **승인 대기** |
| **AD-L-07** | 상태 화면(**Skeleton · 섹션별 Empty · Error · Offline · Retry**) | `C13 ② (L-OPEN-13)` + Stage 0 `#22`(공통 상태 화면은 명세 우선) — Figma 에 **전부 없다** | 해당 상태 화면 **전체 차이 허용**. `success` 상태의 기하 차이는 불허 | **승인 대기** |
| **AD-L-08** | 표지 에셋이 **단일 이미지**다 (Figma 는 **합성**: 캐러셀 = 베이스 이미지 + 제목 텍스트 + `asset/book-cover` **opacity 80**, Book List 썸네일 = 틸 그라데이션 + 표지 **opacity 60**) | Figma 의 합성은 **임시 표지 에셋의 연출**이며 `coverUrl` 1장을 받는 `BookCover` 로는 재현되지 않는다. `L-D4`(Stage 8 배포 전 표지 교체) 로 어차피 사라진다 | 표지 **내부 질감·불투명도·베이크된 제목 차이 허용**. 표지 **크기·radius·그림자·위치 차이는 불허** | **승인 대기** |

- Stage 1 `AD-1`~`AD-10`, Stage 2 `AD-S2-1`~`AD-S2-19` 는 **그대로 적용**된다.

---

## 12. 판단 보고 (Plan §15.8 대응)

### 12.1 ★ 탭바 4행 실측 확정 (§15.8-1)

§2.1 참조. 4행 전부 확정했고 **Toast 식은 검증 실패 → overhang 추가**가 결론이다. Stage 1 Design Spec §2.2·§4.12·§5.2·§6.2 를 같은 패스에서 갱신했다.

### 12.2 ★ Home IA 제안 — Figma 근거 / 명세 구분 (§15.8-2)

| 요소 | 출처 |
|---|---|
| 워드마크 · chip 자리 · 설정 아이콘 · 버블 · 캐릭터 · dots · 탭바 | **Figma `26:21`** (좌표·크기 포함) |
| 카드 내부 구성(배지·표지·제목·저자·이유·Prompt·ActionBar) | **Figma `86:438` / `86:512`** (좌표·크기 포함) |
| **카드가 화면 어디에 놓이는가** | **명세** (`C13-14`) — Figma 에 배치 없음 |
| **캐릭터를 배경 레이어로 두고 덱을 그 위에 얹는 구조** | **명세** — 단 `26:21` 의 y 좌표(캐릭터 96–656, dots 734, 탭바 766)가 그 구조 외에는 카드가 들어갈 자리를 남기지 않는다는 **간접 근거**는 있다 |
| 버블 ↔ 덱 사이 `flex spacer` | **명세** |
| `ActiveSessionNotice` · `HomeFooterNote` 위치 | **명세** (PRD §7.4 보조 요소가 근거, Figma 배치 없음) |
| 덱 prev/next 컨트롤 | **명세** (WCAG 2.5.1) |

### 12.3 ★ Prompt 개수 확정 (§15.8-4 · `D-4`)

**확정: 표시 3개 + 스크롤/확장으로 그 이상 도달. 개수 상한은 UI 에 없다.** — `CONFIRMED (N-2, approvals §6 · §6.1)`

design-agent 의 이전 결론("최대 3개 고정", `promptPreview: string[]` 1–3)은 **사용자 결정으로 대체되었다**. 규격 전문은 **§5.1.1**.

| 구분 | 이전 명세 (폐기) | **확정** |
|---|---|---|
| contract | `promptPreview: string[]` **1–3** | `string[]` **상한 없음**. Frontend 가 잘라내지 않는다 |
| 카드 | 최대 3개 렌더, 그 이상 없음 | **접힘 `min(3, n)` + 확장으로 `n` 전부** |
| PRD | FR-07 "2~3개" 를 상한으로 해석 | "2~3개"는 **표시 개수로만** 유지되고 **상한으로는 성립하지 않는다** → approvals §6.2 **PRD 수정 대상 #4** |
| Figma | 변형 2·4·5 를 "탐색 변형"으로 분류하고 3 채택 | Figma 4개 변형은 **전부 고정 개수**이며 확장 구조가 없다 → 개수·트리거는 §11.3 `AD-S3-1`·`AD-S3-22` 로 등록 |

**`D-21` 로 contract 레벨 상한까지 제거되었다 (approvals §9 · §9.1, 2026-10-03)** — `N-2` 승인문("개수 상한은 서버가 정한다 / Frontend 가 잘라내지 않는다")과 `AC-3-17`("2~3개 범위를 벗어난 응답은 parse 단계에서 **거부**")의 정면 충돌이 **`N-2` 우선**으로 종결됐다. 표시 규격 쪽 귀결은 3가지다: ① `--prompt-preview-collapsed-count`(3) 는 **cutoff 이며 cap 이 아니다** ② **Frontend 는 `slice(0, 3)` 하지 않는다** ③ **`n ≥ 4` 표시 규격**(접힌 높이·확장·키보드 도달이 개수에 무관)을 **§5.1.1 에 신설**했다 — 깨지는 개수는 없다. contracts·AC·Mock 쪽 작업(`.max(3)` 제거, `AC-3-17` 재작성, 4개 이상 fixture)은 **plan-agent / development-agent 소관**이며 design-agent 는 schema 를 쓰지 않았다.

**남는 사실 2개** (이전 판단에서 유효한 부분):

- `86:482`(3) 과 `163:2648`(4) 의 **겹침 결함 원인은 개수가 아니라 고정 카드 높이**였다 (§5.1). 개수 상한을 없애도 **카드 높이를 고정하지 않는 규칙**이 그대로 방어한다.
- 접힌 카드 높이 ≈386(트리거 포함)로 `163:2648`(377)과 +9 → **덱에 그대로 들어간다**.

### 12.4 ★ 덱 카드별 역량 (§15.8-5 · `D-5`)

- **디자인 의도로 본다.** `163:2649/2650/2651` 세 배지가 **서로 다른 색 + 서로 다른 라벨**이며 placeholder 라면 같은 값이 반복되는 것이 자연스럽다. `D-5` 가 이미 확정한 방향과 일치한다.
- **`options[].capability` 를 카드 안 배지로 렌더**한다. 덱 상단(카드 바깥)에는 배지를 두지 않는다 — 두면 카드 배지와 충돌한다.
- **"Emotion Day  Day"(`163:2650`)는 그대로 옮기지 않는다** — `--` 오타(M-13). `Emotion Regulation`(#14 표시 라벨)으로 표기한다.
- **`D-22` (2026-10-03, approvals §9): `ActivityCard.targetCapability` 삭제.** 위 두 줄("덱 상단에 배지를 두지 않는다", "카드 안 배지로 렌더")이 **contract 레벨에서 확정**되었다 — 카드 단위 대표 역량 필드가 없어지므로 **덱 밖 배지는 만들 수 없고, 만들어도 채울 값이 없다**. 표시 명세 변경은 없으며(이미 option 기준) `COMPONENT_MAP.md` §2 `CapabilityBadge` 행의 `suffix` prop·"덱 카드 suffix" 권고만 갱신했다.
- ② **" Day" suffix 자체를 폐기**한다 (§5.2). COMPONENT_MAP §2가 기록한 이전 권고("전체 라벨 + ' Day'")는 **`D-5` 이전 전제**(하루 1개 역량)에서 나온 것이며, 카드마다 역량이 다른 지금은 "X Day" 가 세 개 동시에 보이는 모순이 생긴다. Figma `163:2649` 도 suffix 가 없다. → **COMPONENT_MAP 갱신 필요** (§13.1 ④).

### 12.5 ★ `C13-21` Prompt 공개 — 별도 화면인가 (§approvals §4)

**별도 route 는 만들지 않는다. 두 지점으로 분해된다.**

| 지점 | 내용 | 근거 |
|---|---|---|
| **카드 안 노출** | `PromptPill` — 접힘 `min(3, n)` / 확장 `n` 전부. **질문 텍스트만**, 접힘·펼침 모두 **2줄 말줄임** | `D-4`(선택 전 노출) + `N-2`(표시 3 + 확장) + `86:438`/`86:512` |
| **Prompt 시트** (`86:482`) | 질문 + **부모용 코칭 문장** 쌍 반복, **말줄임 없음**, **카드가 없는 경로**(서재)의 Prompt 보기 | `86:482` 가 이미 이 화면이다. 카드에 코칭 문장을 n개 다 넣으면 카드가 2배 이상이 된다 |

**★ `N-2` 이후 — 시트는 여전히 필요한가: 필요하다(유지).** 카드 확장으로 **질문은 전부 볼 수 있게 되었지만**, 시트만 갖는 것이 셋 남는다.

| 시트만 갖는 것 | 카드로 대체 불가한 이유 |
|---|---|
| ① **코칭 문장**(`CoachingNote` × n) | 질문 1개당 beige 블록 1개가 붙으면 카드 높이가 **2배 이상**이 되고, 덱 3장 스택에서 스와이프 대상이 화면을 벗어난다. 카드는 "고르는" 표면이고 시트는 "읽는" 표면이다 |
| ② **말줄임 없는 질문 전문** | 카드 pill 은 접힘·펼침 모두 **2줄 말줄임**이다(§5.4). 긴 질문의 전문을 볼 곳이 필요하다 |
| ③ **서재 경로**(`GET /v1/books/:bookId/prompts`) | `/library` → `BookDetailSheet` 에는 Home 덱 카드가 없다. FR-20 "책별 Prompt 보기"는 이 표면이 유일한 충족 지점이다 |

**진입점 정리 (`N-2` 반영)**

| 경로 | Prompt 질문 | 코칭 문장 포함 전체 보기 |
|---|---|---|
| Home 덱 카드 | 카드 안 확장 (§5.1.1) | **헤더 우상단 `IconButton`** → Prompt 시트 (Figma `86:438` 우상단 아이콘 자리) |
| `BookDetailSheet` | 같은 카드 컴포넌트의 확장 | 헤더 `IconButton` → **같은 `Sheet` 안 Prompt 뷰로 전환** (시트 중첩 금지 — §2.4 와 동일 처리) |

즉 **`C13-21` 의 절반은 `D-4`+`N-2` 로 카드에 흡수되었고, 나머지 절반(코칭 문장 포함 전체 보기)은 Figma `86:482` 시트**다. 새로 디자인할 화면은 없다. **폐지된 것은 카드 안 "See all prompts" `TextLink` 뿐**이며(→ `AD-S3-23`), 그 약속은 확장 트리거와 헤더 `IconButton` 으로 나뉘었다.

> **발견한 불일치**: 이전 명세의 진입점 ②("`BookDetailSheet` 의 'Prompts' → Prompt 시트")는 **시트 위에 시트를 겹치는 구조**여서 §2.4 가 확정한 "시트 중첩 금지(scrim 2겹 방지, P-05 일관성)"와 충돌했다. 위 표의 **같은 시트 안 뷰 전환**으로 교정했다.

### 12.6 ★ Home 집계 표시 항목 제안 (`D-6`)

**제안: 이번 주 세션 수 1개만 표시한다.**

| 후보 | 판단 |
|---|---|
| **세션 수** ✅ | PRD §7.4 보조 요소에 **명시**. `/progress` 와 같은 창(`D-6`)이라 두 화면 수치가 어긋나지 않는다. 0일 때도 압박 없는 문장이 가능하다 |
| 시간(분) ❌ | PRD 보조 요소에 **없다**(G-02). "얼마나 오래 했는가" 는 **성과 비교 언어**로 미끄러지기 가장 쉬운 축이고, 15분 권장 세션에서 "8분" 이 표시되면 사실상 미달 판정이 된다 (`rules/frontend.md` §8 위반 위험) |
| 둘 다 ❌ | 위 이유 + 320px 에서 칩이 2줄이 된다(Figma `26:40` 도 "12-day/115 Min" 을 `/` 로 욱여넣었다) |
| 연속 일수(streak) ❌ | `D-6` 이 미채택. 연속이 끊기면 **상실 프레이밍**이 된다 |

문구: **"{n} this week"**, n=0 → **"None yet this week"**. 접근성 이름 "{n} storytimes this week". 목표·달성률·비교 표현 금지 (§10).

> **`HomeSummary.streakDays` 는 삭제된다** — `CONFIRMED (§8.5 ④, 2026-10-02)`. 화면에서 표시하지 않는 것을 넘어 **contract 에서도 사라진다**. 컴포넌트 이름도 `WeekSummaryChip` 으로 확정되었다 (§5.7). schema 반영은 plan-agent / development-agent 소관이며 이 문서는 화면 규격만 소유한다.

### 12.7 `SwipeDeck` 재사용 적합성 (§15.8-6)

§2.3 참조. **스택이며 `SwipeDeck`(depth 3) 재사용이 맞다.** `Carousel` 확장은 부적합 — 캐러셀은 "여러 개를 훑어본다", 덱은 "3개 중 하나를 고른다"로 과업이 다르고, `PageIndicator` 3점이 이미 스택을 전제한다.

### 12.8 `Toggle` 스타일 결정 (§15.8-7)

§4.5 참조. **HARU 토큰으로 구현**(iOS kit 복제 안 함). 치수 3개는 근거가 iOS kit 뿐이라 **`가값 (P-20)` 으로 진행**한다 (`§8.5 ⑤`, 2026-10-02) — `provisional` 주석 + 디자이너 값 도착 시 **토큰 값만 교체**.

**`D-18` 로 사용처가 1곳(push on/off)으로 줄었지만 신규 3종은 그대로 유지한다** — `CONFIRMED (approvals §9.2, 2026-10-03)`. `D-14` 원칙("해당 화면의 컴포넌트가 나올 때 만든다")은 **사용처 개수 조건이 아니다**: 1곳이라도 그 화면이 Stage 3 In Scope 면 만든다. 사용처가 **0건**이 되면 그때 제외한다(지금 `Toggle` 은 §2.14 에서 실제로 마운트된다).

### 12.9 탭바 마운트로 재생성이 필요한 기존 baseline (§15.8-8)

**원칙적으로 0건.** 근거는 §2.1 말미. `TabLayout` 전체를 렌더하는 gallery baseline 이 있다면 그 1건만 재생성 — development-agent 가 §14-2에서 확인한다.

### 12.10 책 표지·캐릭터 원본 실측 (§15.8-3 · `CONFIRMED (D-13)`)

| 대상 | Figma 노드 · 실측 | 표시 폭 | 필요 해상도 (2x 상한, `D-13` ②) | 판단 |
|---|---|---|---|---|
| **책 표지** | `85:610` **58×83**(0.6988) · `163:2101`/`30:142` **34×48**(0.7083) · 캐러셀 열 **107** | 34 / 58 / 107 | **120w · 240w** 2단계로 전부 충족(107×2=214 ≤ 240) | ✅ 문제 없음. `--book-cover-aspect` 7/10 + `object-fit: cover` |
| **Home 캐릭터** | `26:22` **441×560**(0.7875, x=−24 → gutter bleed) | **최대 528**(480 컬럼 + 2×24) | 2x = **1056** | **허용 차이로 수용** — `CONFIRMED (D-13, §7.1 C안)`. 투명 원본 최대치 **933**, 1056 대비 **123px 부족 = 최대 1.77x**. **393px 뷰포트는 2.12x 로 충족**이고 **≥600px 에서만** 1.77x 다 → §11.3 `AD-S3-25` |
| **Progress 일러스트** | `163:2642` (Stage 3에서는 이미지만 재사용) | 컬럼 폭 이하 | `--size-illustration-max`(1440) 범위 | 별도 확인 필요 없음 |

#### 12.10.1 ★ Home 캐릭터 에셋 — 정정 실측과 결정 (`CONFIRMED (D-13, approvals §7.1)`)

**이전 판의 "원본 941px / 115px 부족" 표기는 폐기한다.** Figma `221:1147`(캐릭터 원본 모음) 자식 6개의 image fill 을 전부 내려받아 재실측한 결과다.

| 사실 | 값 |
|---|---|
| **투명 원본 최대치** | **`Haru_Hello_Heart_t 1.png` 933 × 1659** |
| 941 쪽 파일(`Haru_Hello_Heart_t.png` 941×1672) | **쓰지 않는다** — 알파가 전부 255 인 **불투명 스크린샷본**(체커보드가 그려져 있다) |
| Figma `163:2532` `asset/home-character` | **쓰지 않는다** — 294×373, 민트 배경 베이크. Home `26:22` 의 image fill 과 md5 동일이며 현재 저장소 에셋(614×830 투명)보다 **열세** |
| `벤치마킹/Moodeboard/HARU_Hello_heart.png` (1536×2752) | **쓰지 않는다** — **다른 생성본**이다(눈 크기·하이라이트·입·볼터치·하트 형태·털 결이 다르고 배경이 베이크됨). 드롭인 대체 불가 |
| `*.svg` 2건 | **벡터가 아니다** — `<path>` 0개, PNG 를 `<pattern>` 으로 감싼 래퍼라 해상도 이득 없음 |

| 폭 | 캐릭터 표시 폭 | 933px 기준 밀도 | 판정 |
|---|---|---|---|
| **393** (Figma 기준 뷰포트) | 441 | **2.12x** | **충족** — 허용 차이 대상이 아니다 |
| **≥600** (480 컬럼 + 2×24) | 528 | **1.77x** | **허용 차이 `AD-S3-25`** (1056 대비 **123px 부족**) |

- **세로는 제약이 아니다** (캐릭터 높이 990 ≥ 필요치 988). **가로만 걸린다.**
- **결정은 C — 1.77x 수용**이다 (2026-10-02, user). 디자이너 재추출(A)·표시 폭 528→466 축소(B)를 **모두 선택하지 않았다**. 따라서 이 항목은 **"부족하므로 디자이너 대기"가 아니라 허용 차이**이며, Stage 3 구현을 막지 않는다. QA 판정은 `PASS (accepted: D-13)`.
- 구현 지시: Home 캐릭터 에셋은 **투명 원본 933×1659 에서 Home 크롭(aspect ≈ 0.79)으로 재추출**한다.
- **후속 여지**: 디자이너가 1056px 이상 투명 원본을 제공하면 **에셋 파일만 교체**하면 된다 — 표시 규격·코드·이 명세는 바뀌지 않는다 (§13.4 ①).

### 12.11 Plan §16 `D-xx` 결정 결과와 design-agent 의견의 처리

> **2026-10-02 갱신** — `D-1`~`D-20` 이 전부 승인되었다(approvals §3·§7·§8). 아래 표는 **의견 제출 당시 원문을 보존**하고, 각 행에 **결정 결과**를 덧붙였다. **결정이 의견보다 우선한다.**

| ID | design-agent 의견 (원문) | **결정 결과 (2026-10-02)** |
|---|---|---|
| `D-2` `/progress` EmptyState | **동의.** 단 §2.13대로 **수치를 전혀 넣지 않기**를 덧붙인다 — "3회 중 1회" 형태가 들어가면 달성률 언어가 된다 | **승인 — 의견 채택.** 수치 미표기 조건이 approvals §7 에 명문화되었다 |
| `D-3` CTA `disabled` | **동의.** 다만 `aria-disabled` 버튼은 **포커스 가능**해야 사유를 읽는다(§10). 완전 `disabled` 속성만 주면 스크린리더가 건너뛴다 | **승인 — 의견 채택.** `aria-disabled` + 포커스 가능이 approvals §7 에 명문화되었다 |
| `D-7` 서재 범위 | **동의.** `AD-S3-6/7/8` 로 사전 등록했다 | **승인.** 평점·"Reading now"·"My Saved" 는 **허용 차이로 기록**(approvals §7) |
| `D-8` phaseTag | **동의 + 이견 1** — `PromptPill.phaseTag` prop 을 "정의하되 쓰지 않는다"는 **미사용 prop 을 남기는 것**이라 lint·테스트에서 죽은 코드가 된다. **prop 정의도 Stage 3에서 하지 않고**, 채택 시 추가할 것을 권고한다 (Figma 근거는 이 문서 §11.3 `AD-S3-15` 가 이미 보존한다) | **★ 이견 기각 — Figma 기준 반영 결정** (approvals §8 · §8.1). 사용자 지시: "피그마를 기준으로 반영해줘. 이번 Stage가 아니면 다음 Stage에라도 반영하여 최종적으로 보이게 되어야 돼". **`phaseTag` 는 더 이상 '사용처 없는 prop' 이 아니다** — `PromptPill` 이 배지를 **실제로 렌더**한다(§5.4.1). 이견의 전제(값을 쓰지 않는 prop)가 결정으로 사라졌다 |
| `D-9` Context 필수 범위 | **동의** | **승인.** 카드 경로 필수 / 서재 경로 nullable (§2.4) |
| `D-10` timezone | **동의.** §8 `offline-cached-card` 에서 **카드 날짜를 화면에 밝히는** 처리를 명세에 넣었다 | **승인.** 서버 기준 신뢰 — 클라이언트 재판정 금지 |
| `D-11` 수동 캐시 | **동의**(UI 영향 없음) | **승인.** `localStorage` 수동 캐시 (UI 영향 없음) |
| `D-12` Q5 표지 그리드 | **이견 있음 (§13.1 ⑥)** — Stage 3 design 범위 밖(온보딩 Step 3 = Stage 2 화면)이고, 되돌릴 경우 **Stage 2 §2.10 Step 3 명세와 통과한 시각 baseline 1건이 무효화**된다. Stage 3 Design Spec 이 Stage 2 화면을 재명세하는 것은 문서 소유 경계를 흐린다 → **별도 Stage 2 Design Spec 개정**으로 처리할 것을 권고한다 | **의견 채택 — Stage 2 Design Spec 개정으로 처리** (approvals §8 · §8.5 ⑥). **Stage 3 Spec 은 Stage 2 화면을 재명세하지 않는다.** 명세는 `docs/design/stage-2-design-spec.md` §2.10 Step 3 에 추가했고 **구현 Stage 는 Stage 3** 다 |
| `D-13` 에셋 | **조건부 동의** — ②의 "2x 상한"은 **책 표지에는 충분하지만 Home 캐릭터에는 원본이 모자란다**(§12.10) | **결정 = C — 1.77x 수용** (approvals §7.1). 의견의 "원본이 모자란다"는 사실은 유지되지만 **처리 방식이 디자이너 대기가 아니라 허용 차이**로 결정되었다 → §12.10.1 · `AD-S3-25` |
| `D-14` Shared UI 3종 + `SwipeDeck` 재사용 | **동의** (§12.7) | **승인 — 원칙 확정**: "해당 화면의 컴포넌트가 나올 때 만든다". 제외 5종은 **그 화면이 나오는 Stage 에서** 만든다 (§4 · §5.12) |
| `D-15` 배송지 미수집 | **동의.** 안내 문구 슬롯이 비면 `InlineAlert` 자체를 미렌더한다(§2.12) | **승인 — 단 안내 문구는 빈 슬롯이 아니라 잠정 문구를 쓴다** (approvals §8.2). 의견의 "비면 미렌더" 는 규칙으로 남지만 **기본값이 잠정 문구**이므로 정상 경로에서는 렌더된다 (§2.12) |
| `D-16` push 구현 방식 | **동의.** UI 영향 = §2.14의 권한 3상태뿐 | **승인.** Port + Web 구현 + Mock. **`D-18` 로 설정 화면만 제외되며 이 항목은 그대로 유효**하다 |
| `D-17` 시트 비route화 | **동의.** 단 `BookDetailSheet` 만 history 1개 — `LibraryShelfSheet → BookDetailSheet` 교체 전환 시 **뒤로 가기가 Shelf 로 돌아가는지 BookDetail 을 닫는지**가 모호하다 → **뒤로 = Shelf 복귀** 를 권고(§13.1 ⑦) | **★ 권장안 기각 — 시트는 만들고 Mock 전용 route 를 입힌다** (approvals §8 · §8.3). 뒤로 가기는 **의견대로 Shelf 복귀**로 채택되었다(§8.3 (4)). route 가 사라져도 시트가 동작해야 한다는 제약이 추가되었다 (§1.2 · §2.9) |
| `D-18` 시간·요일 입력 | **동의.** 단 시트 **중첩 금지**(§2.4) — `SelectTrigger` 가 이미 시트 안에 있을 때는 같은 시트에서 목록 뷰로 전환한다 | **★ 범위 축소 — 알림 설정 화면만 Stage 3 제외** (approvals §8 · §8.4). picker 수치 규격(30분 단위 · `Chip` 7개)은 **그 화면이 도달하는 Stage 에서 재검토**한다. Reading Context 시트와 push 권한 UX 는 **구현 유지** (§2.14) |
| `D-19` 런타임 의존 0건 | **동의.** 캐러셀도 CSS + 네이티브 스크롤로 충족(§4.2 (A)안) | **승인.** 신규 런타임 의존 0건, `sharp` 만 devDependency |
| `D-20` Step 1 필드 미사용 | **동의**(UI 영향 없음) | **승인.** 세 필드의 선택지 확정은 **Stage 6 이월** |

---

## 13. Figma 누락 / 불일치 / 승인 필요

### 13.1 승인·결정 항목 — **①~⑫ 전부 종결. 남은 미결 0건 (2026-10-03)**

> ②는 2026-10-01(approvals §6)에, **①③④⑤⑦⑧⑨는 2026-10-02**(approvals §8 · §8.5)에, **⑩⑪⑫는 2026-10-03**(approvals §9 · §9.2)에 결정되었다. ⑥은 **Stage 2 Design Spec 개정으로 이관**되어 이 문서의 미결에서 빠진다.
>
> **남은 미결 = 0건.** 이 절에서 결정을 기다리는 항목이 더 이상 없다. §13.3 의 PRD ↔ Figma 승인 대기도 **0건**이다(N-1·N-2·N-3·N-7 종결, N-4~N-6·N-8 은 `D-7`·`D-6` 으로 PRD 유지). 남아 있는 것은 **미결이 아닌 2종류**뿐이다 — ① **가값 `P-xx`**(§6.4, 재제시 절차는 Plan §17.3) ② **디자이너 Figma 요청**(§13.4, 전부 차단 요청 아님).

**1단 — 종결 항목 (①~⑨, 2026-10-01 · 2026-10-02)**

| # | 항목 | 결정 (2026-10-02, user) | 반영 절 |
|---|---|---|---|
| ① | `HomeSummary` 캐릭터 버블 문구 필드 부재 | **`characterLine` 필드 추가.** 서버 값만 표시하며 화면에서 생성하지 않는다. 값이 없으면 **버블 미렌더**(규칙 유지) | **§2.2** (정식 명세) |
| ~~②~~ | `Carousel` 의 `overflow-x` 예외 | **조건부 승인 (2026-10-01, approvals §6)** — (A)안 + `padding-block` / 음수 `margin-block` 그림자 보호 구조가 **승인 조건 자체**다 (값 상 24 / 하 80 (`D-REQ-4` 정정)). 이 구조 없이 `overflow-x` 를 쓰면 승인 범위 밖이며, `AppColumn` 안쪽 `overflow-*` 금지의 **유일한 예외**다 | §4.2 · §6.2 · §14-3 |
| ③ | 증정 접수 안내 문구 | **잠정 문구를 넣고 사용한다** (approvals §8.2). 예: `Your request is in. We'll reach out with delivery details.` **수치·기한·배송 소요일 금지.** copy 모듈에만 두고 확정 시 값만 교체 | **§2.12** (이전 "비워 둔다" 폐기) |
| ④ | `StreakChip` → `WeekSummaryChip` · `streakDays` 존치 | **개명 확정 + `HomeSummary.streakDays` 삭제** | **§5.7 · §12.6** · `COMPONENT_MAP.md` §2·§5 |
| ⑤ | `Toggle` 치수 3종 | **`가값 (P-20)` 으로 진행** — 토큰에 `provisional` 주석, 디자이너 값이 오면 **값만 교체** | **§4.5 · §6.2 · §6.4** |
| ⑥ | Q5 표지 그리드 처리 경로 | **Stage 2 Design Spec 개정** (`D-12`). **Stage 3 Spec 은 Stage 2 화면을 재명세하지 않는다** — 명세는 `stage-2-design-spec.md` §2.10 Step 3, **구현 Stage 는 Stage 3** | 이 문서 범위 밖 |
| ⑦ | `BookDetailSheet` 뒤로 가기 | **`LibraryShelfSheet` 목록으로 복귀** (들어온 경로 = 나가는 경로) | **§2.9** |
| ⑧ | `conversation_only` 카드 일러스트 | **기존 캐릭터 에셋 전용, `가값 (P-22)`.** 전용 에셋이 오면 **파일만 교체** | **§2.6 · §6.4** |
| ⑨ | Reading Context 6값 영문 라벨 | **design-agent 명세값으로 확정.** `API_CONTRACTS.md` §2.2 의 "design 확인" 표시 해제, 문구는 copy 모듈에 모은다 | **§2.4** |

**2단 — 종결 항목 (⑩⑪⑫, 2026-10-03 · approvals §9.2)**

| # | 항목 | 결정 (2026-10-03, user) | 반영 절 |
|---|---|---|---|
| ⑩ | Reading Context 시트의 `custom_time` picker 수치 규격 | **`D-18` 에서 분리.** design-agent `RECOMMENDED`(**30분 단위 48항목** + 네이티브 `<input type="time">` 금지)를 **Stage 3 규격으로 확정**한다. **근거는 `D-18` 이 아니라 `AC-3-23` + approvals §9.2 ⑩** — 이 시트는 Stage 3 In Scope 이므로 규격을 이월 화면(알림 설정 `C13-19`)에 묶어두지 않는다 | **§2.4** (`Plan D-18 전제` 참조 제거) · §4.6 |
| ⑪ | `phase` 와 `pageRef` 동시 표시 | **둘 다 렌더 = 확정. `AD-S3-24` 유지.** Figma 에 동시 예시가 **없는 것은 공백이지 충돌이 아니다**(`N-1` 과 같은 성격) → `RECOMMENDED` 라벨 해제. **서버에 "하나만 보내라" 를 요구하지 않는다** — contract 는 `phase`·`pageRef` 를 **독립 optional 로 유지**한다 | **§5.4.1** · §11.3 `AD-S3-24` |
| ⑫ | Prompt 배지 흰 라벨 1.72:1 의 가값 ID 귀속 | **`P-23` 신설** (`P-02` 흡수 **아님**) — **대상과 교체 조건이 다르다**: `P-02` 는 역량 색 4종 위 흰 라벨이라 역량 팔레트 확정으로 해소되지만, `P-23` 은 Prompt 배지 전용 Tier-3 토큰(`--prompt-phase-tag-fg`)이라 그렇지 않다. 2026-09-22 사용자 원칙(**Figma 우선 + `provisional` 표시**) 적용 | **§6.2 · §6.4** (등재) · **§6.3** (증빙) · §5.4.1 |

**같은 패스에서 반영한 나머지 §9 결정 (미결이 아니라 모순 해소)**

| 항목 | 결정 | 반영 절 |
|---|---|---|
| **`D-21`** Prompt 개수 상한 해제 (§9.1) | 표시 규격 쪽 귀결 3건 — cutoff ≠ cap · `slice(0, 3)` 금지 · **`n ≥ 4` 표시 규격 신설**(깨지는 개수 없음) | **§5.1.1** · §5.1 · §12.3 · §14 |
| **`D-22`** `ActivityCard.targetCapability` 삭제 | 배지는 **`options[].capability` 만** 근거로 렌더. 덱 밖 "오늘의 역량" 배지를 두지 않는다 | **§5.2**(데이터 원천 행 신설) · §12.4 · `COMPONENT_MAP.md` §2 |
| `Toggle` 사용처 1곳 축소 | **3종 유지 확정** — `D-14` 는 사용처 1곳이어도 충족. 0건이 되면 그때 제외 | §4.5 · §12.8 |
| `Chip` 다중 선택 Stage 3 미마운트 | `P-02` 미선택 `Chip` 경계 증빙 = **Stage 2 온보딩 화면** | §6.3 |
| PRD §8.2 수정 대상 | approvals **§9.3 #5·#6 등재 완료** — §13.3 기록을 §9.3 참조로 연결 | §13.3 `N-7` · `N-2` |

### 13.2 Figma 내부 불일치 · 신규 발견 (실측 2026-09-30)

| # | 내용 |
|---|---|
| ① | **`163:2650` 배지 "Emotion Day  Day"** — 오타(M-13 기지). `D-5`·approvals §2.4에 따라 그대로 옮기지 않는다 |
| ② | **역량 배지 suffix 불일치** — `163:2649` "Self-Direction"(suffix 없음) vs `163:2651` "Intrinsic Motivation Day". 같은 컴포넌트의 세 인스턴스가 서로 다르다 |
| ③ | **`163:2648` Prompt ↔ ActionBar overflow** — 4번째 pill(y=142, h=42)이 ActionBar 영역과 겹친다. 카드 프레임 높이 377이 콘텐츠보다 작다 |
| ④ | **Prompt 개수 2·4·5 제각각** — `86:512` 2 · `163:2648` 4 · `86:438` 5 · `86:482` 3 |
| ⑤ | **`/library` 섹션 제목 "Finished together" 2회 중복** (`163:1633` · `30:139`) |
| ⑥ | **`BookShelfItem` 캡션이 4대 역량 밖** — "Resilience" · "Confidence" (M-13) |
| ⑦ | **`86:512` 배지 라벨이 비어 있다** (pink 색만) |
| ⑧ | **`26:21` 의 `88:909`(66×27) 무명 프레임** — 역할 특정 불가 |
| ⑨ | **`113:1993` 컴포넌트 이름 "This Week's Shelf"** 인데 `30:74` 에서 "Our curated shelf" · "Finished together" 2곳에 쓰인다 — 컴포넌트 이름이 사용처와 불일치 |
| ⑩ | **Home 캐릭터 원본 해상도 부족** — Figma `221:1147` 안에 쓸 수 있는 고해상 투명 원본이 **없다**. `163:2532` `asset/home-character` 는 **294×373 민트 배경 베이크**이며 Home `26:22` 의 image fill 과 동일 파일이라, Figma 가 가진 Home 캐릭터 아트워크가 저장소 에셋(614×830 투명)보다 **열세**다 (§12.10.1). **처리 = 허용 차이 `AD-S3-25`** |
| ⑪ | **`Pagetag1–3`(`139:2410–2412`) 가 역량 색 cyan(`#a0ccdd`)을 그대로 쓴다** — 결정 #19 는 cyan 을 **Cognitive Flexibility** 에 배정했는데, Prompt 단계·페이지 배지가 같은 색을 써서 **역량 색 규칙과 의미가 겹친다**. 명세는 Tier-3 토큰(`--prompt-phase-tag-bg`)으로 **분리**해 두었다 (§5.4.1 · §6.2) → 디자이너 요청 §13.4 ⑮ |

### 13.3 ★ PRD ↔ Figma 불일치 — **승인 대기 목록** (approvals §2 규칙)

> **design-agent 는 아래를 임의로 적용하지 않았다.** Figma 안을 기본 제안으로 올리되, 이 문서의 본문은 **"승인 전까지 PRD/기존 결정을 따르는 상태"** 로 작성되어 있다. 항목별 현재 명세 상태를 마지막 열에 적었다.

| # | 항목 | PRD (섹션/ID) | Figma (node) | **제안 (Figma 우선)** | 영향 | 이 문서의 현재 상태 |
|---|---|---|---|---|---|---|
| **N-1** | **서재 섹션 구성 3개** | FR-20 = 증정·보유 / 직접 등록 / 히스토리 / 책별 Prompt **4가지 기능**, 화면 구성 규정 없음 | `30:74` = **캐러셀 2 + 목록 1** 3섹션 | Figma 3섹션 구성을 채택 | 화면 구조 · `LibraryFilter` 3값 사용 방식 | **승인됨 (2026-10-01, approvals §6)** — Figma 3섹션 채택. §2.7 **명세 변경 없음** |
| **N-2** | **Prompt 노출 개수** | FR-07 · §8.2 = **2~3개** | `86:438` 5 · `163:2648` 4 · `86:512` 2 · `86:482` **3** (전부 **고정 개수**, 확장 구조 없음) | ~~PRD(2–3) 유지~~ → **어느 쪽도 아님** | 카드 높이 · `promptPreview` 배열 길이 · 카드 구조 | **결정됨 (2026-10-01, approvals §6.1)** — **표시 3개 + 스크롤/확장, 개수 상한 없음**. 재명세 완료: **§5.1.1** · §12.3 · §2.5 · §5.1 · §5.4 · §11.3 `AD-S3-1`·`AD-S3-22`·`AD-S3-23`. PRD FR-07·§8.2 는 **수정 대상** — approvals §6.2 #4 → **§9.3 #6 으로 보강 등재 완료**("개수 상한 없음. 표시 3개 + 확장 도달. 생성 정책 2~3개는 Backend 소관", 근거 `D-21`) |
| **N-3** | **역량 배지 " Day" suffix** | §7.4 "오늘의 역량 배지" (하루 1개 전제) | `163:2649` suffix 없음 / `163:2651` " Day" / `163:2650` 오타 | **suffix 폐기** (Figma `163:2649` 와 일치) | 배지 라벨 문구, COMPONENT_MAP §2 기록 | **승인됨 (2026-10-01, approvals §6)** — suffix 폐기. §5.2 · §12.4 **명세 변경 없음** |
| **N-4** | **책 평점 표시** | FR-12 = 세션 회고 별점(세션 단위) | `163:2108` 등 "Rated 4.5" = **책 단위** | **미채택**(PRD 유지) | `LibraryBook.averageRating` 필드 | **PRD 유지** — `CONFIRMED (D-7)`가 이미 다루는 항목. `AD-S3-6` |
| **N-5** | **읽기 진행 계획(다회차)** | 없음 | `145:1141` "3 of 5 nights" | **미채택**(PRD 유지) | 데이터 모델 | **PRD 유지** — `CONFIRMED (D-7)`. `AD-S3-7` |
| **N-6** | **북마크("My Saved" / ★ Save)** | 없음 | `86:383` 좌측 ★ Save 버튼 · "My Saved" | **미채택**(PRD 유지) | `LibraryBook.saved` | **PRD 유지** — `CONFIRMED (D-7)`. `AD-S3-8` |
| **N-7** | **Prompt 단계·페이지 태그** | §8.2 = 질문 / 코칭 / Follow-up (phase·page 개념 없음) | `Pagetag1–3 139:2410–2412` — PRE · POST · **P.6** | **Figma 채택** | contracts `Prompt.phase`·`pageRef` optional 2필드 · 화면 배지 · **콘텐츠 제작 범위(책 판본별 페이지 앵커)** | **결정됨 (2026-10-02, approvals §8 · §8.1)** — **Figma 기준 반영**. 화면 규격은 **§5.4.1** 신설, `AD-S3-15` 재작성 · `AD-S3-24` 신설. **PRD §8.2 수정 대상 = approvals §9.3 #5 로 등재 완료** (2026-10-03) — 등재 요청이 아니라 **완료**다. 등재 내용: "Prompt 에 `phase`(읽기 전/후)·`pageRef`(페이지 참조)가 있고 화면에 배지로 표시된다. `pageRef` 는 **책별 페이지 앵커 데이터**(콘텐츠 제작 범위)를 전제한다" (근거 `D-8` · `P3-BIP-13` · `P3-BIP-14`). `phase` 판정 로직과 페이지 앵커 데이터는 `BACKEND_INTEGRATION_PENDING` |
| **N-8** | **Home 상단 누적 분 표시** | §7.4 보조 요소에 없음 | `26:40` "115 Min" | **미채택** | `HomeSummary.totalMinutes` | **미채택으로 명세함** — `D-6` 의 직접 귀결. `AD-S3-9` |

**N-4 ~ N-6 은 `D-7` 로, N-7 은 `D-8` 로 종결되었다.** `D-7` 은 **PRD 유지**(미채택), **`D-8` 은 Figma 채택**이다 — 같은 묶음이지만 결론이 반대이므로 혼동하지 않는다. **N-1 · N-2 · N-3 은 2026-10-01 사용자 결정으로 종결되었다**(approvals §6). N-1 · N-3 은 기존 명세 그대로 승인되었고, **N-2 만 규격이 바뀌어 §5.1.1 신설과 관련 절 갱신을 수반했다**. 남은 PRD↔Figma 승인 대기 항목은 **없다**.

### 13.4 디자이너 요청 목록 (Figma 수정 — design-agent 는 수정하지 않는다)

| # | 요청 |
|---|---|
| ① | **Home 캐릭터 고해상도 재추출** — Home 크롭(aspect ≈ 0.79) 기준 **가로 1056px 이상, 투명 배경**. 현재 투명 원본 최대치는 **933px** 이라 480 컬럼(표시 폭 528) 2x 에 **123px 모자란다** (§12.10.1). **차단 요청이 아니다** — `D-13` 결정으로 **1.77x 를 수용하고 Stage 3 를 진행**하며(`AD-S3-25`), 에셋이 도착하면 **파일만 교체**한다 (표시 규격·코드 변경 없음) |
| ② | `163:2650` 배지 라벨 오타 수정 — "Emotion Day  Day" → 4대 역량 표시 라벨 |
| ③ | 덱 카드 3인스턴스의 **배지 suffix 표기 통일** (§13.2 ②) |
| ④ | `163:2648` **카드 프레임 높이 / Prompt 개수 정리** — 현재 4번째 pill 이 ActionBar 와 겹친다 (§13.2 ③) |
| ⑤ | `/library` **두 번째 섹션 제목 중복 수정** ("Finished together" ×2) |
| ⑥ | `BookShelfItem` 캡션을 **4대 역량 표시 라벨**로 교체 ("Resilience"·"Confidence" 는 4대 역량 밖) |
| ⑦ | `86:512` **배지 라벨 채우기** (현재 빈 pink) |
| ⑧ | `113:1993` **컴포넌트 이름**을 실제 용도에 맞게 변경 ("This Week's Shelf" → "Book Shelf Carousel" 등) |
| ⑨ | `26:21` **`88:909` 무명 프레임 정리 또는 의도 설명** |
| ⑩ | **Reading Context 선택 UI · 시간 picker** 가 없다 (`C13-15` 는 명세로 진행하되, 디자이너 판 수령 시 이 절이 대체된다) |
| ⑪ | **`Toggle` 의 HARU 판 치수** (§13.1 ⑤) |
| ⑫ | BottomTabBar variant 이름 `Report` → `Progress` (Stage 0 이월 요청, 미처리) |
| ⑬ | **`conversation_only` 카드 전용 일러스트** — 현재는 기존 캐릭터 에셋을 전용(轉用)하며 **`가값 (P-22)`** 다 (§2.6). 전용 에셋이 오면 파일만 교체한다. 필요 규격 = `BookCover(md)` 슬롯과 같은 박스, 투명 배경, 표시 폭 58 기준 **2x = 116px 이상** |
| ⑭ | **알림 설정 화면(`C13-19`) Figma** — `D-18` 로 Stage 3 Out of Scope 가 되었고 **디자이너 판을 기다려 도달 Stage 로 이월**한다. 상세 요청은 `docs/design/stage-2-designer-request.md` §9.1 |
| ⑮ | **`Pagetag1–3`(`139:2410–2412`) 색 분리 검토** — 현재 배경이 역량 색 cyan(`#a0ccdd`)과 같아 "cyan = Cognitive Flexibility"(#19) 규칙과 의미가 겹친다 (§13.2 ⑪). Prompt 단계 배지 전용 색을 지정해 주면 토큰 값만 바꾸면 된다 |

---

## 14. development-agent 인계 메모

1. **§2.1 탭바 2곳만 바꾼다** — ① `.haru-app-shell__bar-bottom` 의 `pt-3` → `padding-block-start: var(--layout-tabbar-center-overhang)` ② `.haru-toast-viewport--tabbar` 의 `inset-block-end` 에 `+ var(--layout-tabbar-center-overhang)` 추가. **페이지·`main`·EmptyState 에 탭바 관련 하단 padding 을 추가하지 않는다**(이중 계상 금지).
2. **기존 시각 baseline 42건은 원칙적으로 유효**하다. `TabLayout` 전체를 렌더하는 gallery baseline 이 있으면 그 1건만 재생성하고 QA 리포트에 근거를 남긴다 (§12.9).
3. **`AppColumn` 안쪽 `overflow-*` 금지 규칙은 유지**한다. **예외는 `Carousel` 1건뿐이며 조건부 승인**이다(approvals §6): §4.2 (A)안 + **`padding-block` 상 `--carousel-shadow-inset`(24) / 하 `--carousel-shadow-inset-block-end`(80) + 음수 `margin-block`** 그림자 보호 구조를 (상 24 / 하 80 (`D-REQ-4` 정정)) **함께 구현해야 승인 범위 안**이다. 이 구조 없이 `overflow-x` 만 쓰면 승인 위반이다. **이 예외를 다른 컴포넌트·세로 축으로 확장하지 않는다** — Prompt 확장은 `overflow` 없이 구현한다(§5.1.1).
4. **신규 Shared UI 는 3종 + `ListRow` 확장뿐**이다(§4, `CONFIRMED (D-14)`). **`StatTile`·`TextArea`·`StarRating`·`PromptCarousel`·`SegmentedTabs` 를 만들지 않는다 — 선행 구현 금지**(§5.12). Prompt 단계 배지도 **기존 `Tag(size=xs)` 조합**으로 해결하며 별도 컴포넌트를 만들지 않는다(§5.4.1). `ActivityOptionCard`·`BookCover`·`CapabilityBadge`·`PromptPill`·`CoachingNote`·`GiftStatusTag`·`WeekSummaryChip`·`BookShelfItem`·`BookListRow`·`ReadingContextChip` 은 **`entities/*`(도메인)** 이며 `packages/ui` 에 넣지 않는다.
5. **`packages/ui` 는 `@haru/contracts` 를 import 하지 않는다.** `Carousel` 아이템·`ListRow` media·`Toggle` 라벨은 전부 props 주입.
6. **카드 높이를 고정하지 말 것**(§5.1). ActionBar 를 `position: absolute` 로 두면 `163:2648` 의 겹침 결함이 그대로 재현된다.
7. **문구는 전부 feature 단위 copy 모듈**에 모은다. 슬롯이 비면 **해당 요소를 렌더하지 않는다**(Stage 2 `S2-COPY-1` 선례). 금지어 목록은 §10.
8. **`disabled` CTA 는 `aria-disabled` + 포커스 가능**으로 구현한다(속성 `disabled` 단독 금지) — §12.11 `D-3`.
9. **`BookCover` 는 고정 aspect + `object-fit: cover`** 로 구현한다(§5.3). `onError` → `placeholder` 전환 테스트 필수.
10. **에셋 (`CONFIRMED (D-13)`)**: 책 표지는 **표시 상한의 2배까지만** 산출한다 — 표지 크기 토큰(`--book-cover-w-sm` 34 / `--book-cover-w-md` 58 / `lg` = 캐러셀 열 폭 **107**) 기준 **120w · 240w 2단계로 전부 충족**(107×2=214 ≤ 240). **전면 상한 1440(`--size-illustration-max`)은 캐릭터·일러스트에만 적용**하며 표지에 쓰지 않는다. `BookCover` 는 **고정 `aspect-ratio`(`--book-cover-aspect` 7/10) + `object-fit: cover`** 로 구현한다 (`QA-2-004` 재발 방지) — 원본 비율 편차를 CSS 가 흡수하게 두고 이미지마다 크기를 조정하지 않는다. fixture `coverUrl` 은 번들 에셋 경로를 쓰되 `BookCover` 는 임의 URL 도 받는다. **Home 캐릭터는 투명 원본 933×1659 에서 Home 크롭(aspect ≈ 0.79)으로 재추출**하고, 941 쪽 파일(불투명 스크린샷본)·Figma `163:2532`(294×373 민트 베이크)·`벤치마킹/Moodeboard` 1536×2752(다른 생성본)는 **쓰지 않는다**. **≥600px 1.77x 는 허용 차이 `AD-S3-25`** 이며 QA 는 `PASS (accepted: D-13)` 로 판정한다 (§12.10.1).
11. **`PromptPill` 은 포커스를 받지 않는다**(§5.4). 탭 대상으로 만들지 말 것.
12. **`--toggle-*` 3종 = `가값 (P-20)`**(§6.2 · §4.5). 토큰에 **`provisional` 주석** + 임시값을 넣고 QA 리포트의 가값 목록에 올린다. **iOS kit 수치를 확정값으로 기록하지 않는다.** 디자이너 값이 오면 **토큰 값만** 교체한다.
13. **§13.1 ①~⑫ 는 전부 종결**되었다(2026-10-03). **남은 미결은 0건**이고 §13.3 PRD↔Figma 대기도 **0건**이다 — 이 문서에는 "결정을 기다리는 항목" 이 없다. 남은 것은 **가값 `P-xx`**(§6.4, 재제시 절차 Plan §17.3)와 **디자이너 Figma 요청**(§13.4, 전부 차단 요청 아님)뿐이며 둘 다 구현을 막지 않는다. contract 변경(①④⑨ · `D-8` 의 `phase`·`pageRef` · `D-21` 의 `.max(3)` 제거 · `D-22` 의 `targetCapability` 삭제)은 **plan-agent / development-agent 소관**이며 design-agent 가 schema 를 쓰지 않았다.
14. **D-8 배지 (§5.4.1)** — ① `PromptPill` 이 `phase`·`pageRef` 배지를 **실제로 렌더**한다 (prop 만 열어 두는 구조 금지) ② **값이 없으면 배지를 렌더하지 않는다** — 빈 배지·`—` 금지 ③ 라벨 문자열(`PRE`/`POST`)은 **copy 모듈 한 곳**에, `pageRef` 는 **서버 값 그대로** ④ `text-transform: uppercase` 를 쓰지 않는다 ⑤ **`Tag(size=xs)` 재사용** — 신규 컴포넌트 금지 ⑥ 색은 `--prompt-phase-tag-bg/-fg` Tier-3 토큰이며 **`--color-capability-flexibility-*` 를 직접 쓰지 않는다** ⑦ 배지는 `flex-shrink: 0` + `align-self: flex-start`, 질문은 2줄 말줄임 유지 ⑧ Mock fixture 가 **결정적으로** 값을 채우고 `null` 케이스도 포함한다.
15. **D-17 Mock route (§1.2)** — route 정의를 **한 파일에 모으고** 상단에 제거 조건을 주석으로 남긴다. **시트의 열림 상태가 route 에 의존하면 안 된다** — route 를 지워도 "See all"·행 탭·카드 CTA 경로로 시트가 그대로 열려야 한다. Stage 8 Handoff 에 **제거 대상**으로 등재한다.
16. **D-18 범위 (§2.14)** — `/settings/notifications` 에 **"Daily card"·"Storytime reminder" 그룹을 만들지 않는다.** push 권한 블록만 구현하며, `Chip` 요일 선택·시간 `SelectTrigger` 2곳은 Stage 3 에서 마운트되지 않는다. contracts `notification-preferences`·`push-devices` **정의는 유지**한다.
17. **문구 슬롯 (§2.12)** — 증정 접수 안내는 **빈 슬롯이 아니라 잠정 문구**다. copy 모듈에만 두고 **수치·기한·배송 소요일을 넣지 않는다**.
18. **Home 캐릭터 버블 (§2.2)** — `HomeSummary.characterLine` 값만 표시하고 **없으면 버블 미렌더**. 접두어·기본 문구를 붙이지 않는다.
19. **Prompt 노출(`N-2` + `D-21`, §5.1.1)** — ① `promptPreview` 를 **`slice(0, 3)`·`take(3)`·`filter` 로 자르지 않는다**(접힘 컷오프는 렌더 단계이고 데이터는 전부 보관한다) ② Prompt 목록·확장 영역에 **`overflow-*`·`touch-action`·고정 높이를 선언하지 않는다** ③ 높이 전환 애니메이션을 넣지 않는다(`max-height` 보간 금지 — 클리핑을 요구한다) ④ 트리거는 `TextLink` + `onPress`(`<button>`)이며 **`href` 를 쓰지 않는다** ⑤ 덱 인덱스 변경 시 확장 상태를 **접힘으로 리셋**한다 ⑥ 접힘 시 트리거의 뷰포트 위치를 유지한다.
20. **`D-21` 개수 상한 해제 (§5.1.1 `n ≥ 4` 블록)** — ① **`packages/contracts` 에 `.max(3)` 를 넣지 않는다**(`.min(1)` 만). 넣으면 `N-2`·`D-21` 위반이며 QA Finding 대상이다 ② Mock fixture 는 **길이 4 이상 케이스를 반드시 포함**한다(§8 `success` 변형) — 길이 3 뿐이면 확장 경로가 테스트되지 않는다 ③ **접힌 높이가 `n` 에 따라 달라지지 않게** 구현한다(`n ≥ 4` 면 항상 pill 3 + 트리거 1행) ④ **단계적·부분 확장("Show 3 more")을 만들지 않는다** — 2-state(접힘/전체)다 ⑤ `--prompt-preview-collapsed-count` 를 **데이터 슬라이스 인자로 쓰지 않는다** — 렌더 컷오프 전용이다 ⑥ `n` = 5·8·20 에서 레이아웃이 깨지지 않는지 확인한다(고정 높이 0건이면 자동 충족).
21. **`D-22` `targetCapability` 삭제 (§5.2 · §12.4)** — 역량 배지는 **`options[].capability` 만**으로 렌더한다. **덱 상단·카드 바깥·헤더에 "오늘의 역량" 배지를 만들지 않는다**(채울 데이터가 없다). `capability` 가 비면 **배지 미렌더**이며 기본 역량으로 대체하지 않는다. `" Day"` suffix 를 붙이지 않는다(`N-3`).
22. **`approvals §9.2 ⑩` picker (§2.4)** — `custom_time` 시간 목록은 **30분 단위 48항목**(`00:00`~`23:30`)이며 **네이티브 `<input type="time">` 을 쓰지 않는다**. 같은 `Sheet` 안에서 목록 뷰로 전환한다(시트 중첩 금지). 이 규격은 알림 설정 화면(이월)과 **독립**이다.
23. **`approvals §9.2 ⑫` `P-23` (§6.2 · §6.4)** — `--prompt-phase-tag-fg` 는 **`가값 (P-23)`** 이다. 토큰 정의에 **`provisional` 주석**을 남기고 QA 리포트 가값 목록에 **`P-20`·`P-22` 와 나란히 `P-23` 을 올린다**. `P-02` 와 **같은 항목으로 묶지 않는다**. 디자이너 값이 오면 토큰 값만 교체한다.

---

## 15. 요약

| 항목 | 내용 |
|---|---|
| 명세한 표면 | **13건** (route 8 + 시트/상태 5) — §1.1. 단 `/settings/notifications` 는 **`D-18` 로 push 권한 블록만** (§2.14) |
| C-13 처리 | **8건 전부 명세 완료**. `C13-21` 은 별도 route 없이 **카드 미리보기 + `86:482` 시트** 로 분해 (§12.5) |
| `D-1` | **실측 완료**. `pt-3`(12) → **35**, Toast offset **+ overhang** (기존 식은 홈 버튼과 19px 겹침). Stage 1 Design Spec 4개 절 갱신 |
| `D-4` + **`N-2`** + **`D-21`** | Prompt = **접힘 3개 + 확장, 개수 상한 없음** (UI·contract 모두). 표시 방식 = **높이 확장(disclosure)** — 카드 안 세로 스크롤은 덱 제스처·`overflow` 금지 규칙과 충돌해 기각. `D-21` 로 **`.max(3)` 제거**가 확정되어 **`slice(0, 3)` 금지 + `n ≥ 4` 표시 규격**을 §5.1.1 에 신설했다 — **깨지는 개수는 없다**(고정 높이 0건) |
| `D-5` + **`D-22`** | 카드마다 `options[].capability` 배지. "Emotion Day  Day" 오타 폐기, **" Day" suffix 자체 폐기**. `D-22` 로 **`ActivityCard.targetCapability` 삭제** — 덱 밖 "오늘의 역량" 배지를 두지 않는다 |
| `D-6` | Home 집계 = **이번 주 세션 수 1개만**. 분·streak 미표시 |
| 신규 Shared UI | **3종 + 1종 확장** (`CONFIRMED (D-14)`, 28 → 31). `SwipeDeck` 재사용. 제외 5종은 **그 화면이 나오는 Stage 에서** 만든다 (선행 구현 금지) |
| 신규 semantic 토큰 | **0건**. Tier-3 제안 **13건** (`--prompt-phase-tag-bg/-fg/-gap` 3건 신설, `--toggle-*` 3건은 `가값 (P-20)`, **`--prompt-phase-tag-fg` 는 `가값 (P-23)` 신설** — `P-02` 흡수 아님) |
| 허용 차이 | **`AD-S3-1` ~ `AD-S3-25`** 25건 사전 등록 (`D-8` 로 **`AD-S3-15` 재작성**·`AD-S3-24` 신설, `D-13` 으로 **`AD-S3-25` 신설**) |
| 승인 완료 (2026-10-01) | **N-1**(서재 3섹션) · **N-2**(Prompt 표시 3 + 확장) · **N-3**(" Day" suffix 폐기) · **`Carousel` `overflow` 조건부 예외** |
| **결정 완료 (2026-10-02)** | **`D-1`~`D-20` 전부 승인** — `Plan D-xx 전제` 라벨 소멸. **N-7 Figma 채택**(`D-8` Prompt 단계·페이지 배지 **렌더**) · **`D-13` 1.77x 수용** · **`D-18` 알림 설정 화면 Out of Scope** · **`D-17` Mock 전용 route** · **`D-14` "화면이 나올 때 만든다"** · §13.1 **①~⑨ 종결** |
| **결정 완료 (2026-10-03)** | approvals **§9** 반영 — §13.1 **⑩⑪⑫ 종결**(⑩ picker **30분 단위 48항목 확정**, 근거를 `D-18` → `AC-3-23`+§9.2 ⑩ 으로 교체 · ⑪ `phase`+`pageRef` **둘 다 렌더 확정**, contract 는 독립 optional 유지 · ⑫ **`P-23` 신설**) · **`D-21`** Prompt 개수 상한 해제(표시 규격 쪽: cutoff ≠ cap · `slice` 금지 · `n ≥ 4` 블록 신설) · **`D-22`** `targetCapability` 삭제 · `Toggle` **3종 유지** · `Chip` `P-02` 증빙 = **Stage 2 온보딩** · PRD 수정 대상 **§9.3 #5·#6 등재 완료** |
| **승인 대기** | **0건.** §13.1 미결 0 · §13.3 PRD↔Figma 대기 0. 남은 것은 **가값 `P-xx`**(§6.4 — `P-01`·`P-02`·`P-03`·`P-04`·`P-05`·`P-11`·`P-16`·`P-17`·`P-18`·`P-20`·`P-21`·`P-22`·`P-23`, 재제시는 Plan §17.3)와 **디자이너 Figma 요청**(§13.4 15건, 전부 차단 요청 아님)뿐이며 **둘 다 미결 결정이 아니고 구현을 막지 않는다** |
| 디자이너 요청 | §13.4 **15건** (⑬ `conversation_only` 전용 일러스트 · ⑭ 알림 설정 화면 `C13-19` · ⑮ Prompt 배지 색 분리 추가). ①(Home 캐릭터 1056px)은 **차단 요청이 아니다** — 도착 시 파일만 교체 |
