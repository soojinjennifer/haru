# Stage 3 — development-agent → stage-qa-agent **통합 인계 메모**

Status: 작성 2026-10-09 (development-agent) · **QA 수정 라운드 반영 2026-10-09 → §14**
대상 Agent: `stage-qa-agent` (`.claude/rules/workflow.md` §6 이 지정하는 인계 파일)

> 이 문서는 **QA 의 입구**다. 구현 자랑이 아니라 **판정 근거와 재현 경로**가 목적이다.
> Stage 3 은 7개 라운드로 나뉘어 구현되었고 상세 메모가 5개 파일로 쪼개져 있다.
> **이 문서가 목록과 포인터를 갖고, 수치·방법·실측은 각 메모에 있다** (아래 §1.1 포인터 표).

---

## 0. Gate 확인 (최종)

| 항목 | 결과 |
|---|---|
| Stage 3 Plan `APPROVED` | ✅ `docs/plans/stage-3-plan.md` — `APPROVED (2026-10-05, user)` |
| Stage 3 Design Spec `APPROVED` | ✅ `docs/design/stage-3-design-spec.md` — `APPROVED (2026-10-05, user)` |
| Library Plan / Design Spec | ⚠️ 파일 header 는 `DRAFT` 다. 승인은 **`docs/decisions/stage-3-approvals.md` §20.1** 에 기록되어 있고, 파일 Status 문자열 갱신이 누락되어 있다 → **§9 미해결 ①** |
| 이전 Stage QA | ✅ `docs/qa/stage-2-rework-qa-report.md` |
| Backend 구현 작업 | 없음. `apps/api/` · `supabase/` **미생성** (`ls` 로 확인) |
| Stage 4~8 선행 구현 | 없음. 세션·녹음·회고·분석·리포트·데이터 관리 scenario key 0건 |

---

## 1. 구현 범위 목록

### 1.1 라운드 ↔ 상세 메모 포인터

| 라운드 | 범위 | 상세 메모 |
|---|---|---|
| Home 1차 | `/` Home 골격 · Activity Card 덱 · Prompt 시트 · Reading Context | `stage-3-home-handoff.md` §1–§10 |
| Home 2차 (재구현) | Figma 실측 기반 전면 재구현 — 가로 트랙 · 카드 뒤집기 · `★ Save` | `stage-3-home-handoff.md` §R1–§R10 |
| Home 3차 (Visual Gap) | `V-1`~`V-15` 교정 · 뒷면 코칭 노트 contract 변경 | `stage-3-home-handoff.md` §G1–§G10 |
| Home 4차 (버블) | 버블 높이 가변 · 닫기(x) 버튼 | `stage-3-home-handoff.md` §B1–§B7 |
| Home 5차 (그림자) | 카드 그림자 클리핑 수정 (`R-SHADOW-1` 의 계기) | `stage-3-home-handoff.md` §S1–§S6 |
| Library 1라운드 | 토큰 14건 · Shared UI 5건 · contracts 7 schema · Mock 18 시나리오 | `stage-3-library-r1-handoff.md` |
| Library 2라운드-1 | `/library` 본 화면 (4섹션 · 캐러셀 · Book List) | `stage-3-library-r2-handoff.md` §1–§14 |
| Library 2라운드-1 후속 | `L-R2-01` `BookCover` `sm`·`md` 구조적 결함 수정 | `stage-3-library-r2-handoff.md` §15 |
| Library 2라운드-2 | 시트 2종 (`LibraryShelfSheet` · `BookDetailSheet`) + 진입점 화면 2종 | `stage-3-library-r2b-handoff.md` |
| Library 2라운드-3 | `BookDetailSheet` 추천 이유 + 코칭 노트 **뒤집기** | `stage-3-library-r2c-handoff.md` |
| Library 2라운드-4 | 뒷면 면 색 · 뒷면 ActionBar 제거 · 표지 그림자 **좌우** 자리 | ⚠️ **독립 메모 없음** — 근거는 `e2e/shadow.spec.ts` · `library.css` · `Sheet.css` 주석과 `docs/decisions/stage-3-approvals.md` 에 있다 (§9 미해결 ②) |
| Library 2라운드-5 (이번) | 시트 표지 `--shadow-cover` + radius 10 **실제 적용** · 표지 그림자 **위쪽** 자리 | **§10 (이 문서)** |

### 1.2 화면 · route

| route | 화면 | Figma | Layout |
|---|---|---|---|
| `/` | Home — 캐릭터 배경 · 버블(닫기 가능) · 진행 중 세션 안내 · Activity Card 가로 트랙(3장, 뒤집기) · dots | `163:2649` 외 | `TabLayout` |
| `/library` | 서재 — `Reading now` · `Our curated shelf` 캐러셀 · `Favorites` 캐러셀 · `Finished together` Book List(4행) · 진입점 2행 | L-1 `30:74` | `TabLayout` |
| `/library/add` | 보유 책 직접 등록 — 검색 → 결과 행 / 직접 입력 | **Figma 없음** (`L-OPEN-12`) | `StackLayout` |
| `/library/gift-requests` | 증정 요청 목록 + 접수 안내 | **Figma 없음** (`L-OPEN-12`) | `StackLayout` |
| `/progress` | 리포트 준비 안내 — **수치 0건** (`D-2`) | — | `TabLayout` |

**route 가 아닌 화면** (부모 화면이 상태로 소유한다 — `D-17` 제약 ②)

| 화면 | 소유자 | Figma |
|---|---|---|
| `LibraryShelfSheet` ("See all" 시트, `type=shelf`) | `LibraryShelves` | `163:1898` |
| `BookDetailSheet` **앞면** | `LibraryShelves` | `145:1085` |
| `BookDetailSheet` **뒷면** (코칭 노트) | 〃 (`data-face`) | `86:482` 구성 차용 |
| Home Prompt 시트 → **폐기**, 카드 **뒷면**으로 대체 | `ActivityCardFlip` | `86:482` |

### 1.3 컴포넌트

| 레이어 | 신규 |
|---|---|
| `packages/ui` | `SectionHeader`(`action`·`meta` 2모드) · `Sheet` `variant="inset-card"` · `Sheet` `footer` 슬롯 · `Sheet` `surface` prop · `Sheet` `contentShadowInset`(`true` \| `'cover'`) · `ListRow` `media`·`meta` 슬롯 · `BookCover` size `sm`/`lg`/`xl` 확장 |
| `apps/web/src/entities` | `book/BookShelfItem` · `book/BookCover` · `library/ReadingNowCard` · `activity-card/*`(트랙·뒤집기·버블) · `prompt/PromptPill` · `prompt/CoachingNote` |
| `apps/web/src/features/library` | `LibraryShelves` · `LibraryShelfSheet` · `BookDetailSheet` · `LibraryEntryActions` · `AddOwnBookForm` · `GiftRequestList` · `StartSessionAction` · `bookDisplay.ts` |
| `apps/web/src/pages` | `library/LibraryPage` · `AddOwnBookPage` · `GiftRequestsPage` (+ 각 TopBar) |

### 1.4 contracts (`packages/contracts`)

| 구분 | 내용 |
|---|---|
| 신규 schema | `ReadingProgress` · `LibraryBook`(+`RenderableLibraryBook`) · `LibraryOverview` · `LibraryListRequest`/`Response` · `AddOwnBookRequest` · `CreateGiftRequestRequest`/`GiftRequest`/`GiftRequestListResponse` · `BookPromptsResponse` · `SaveBookTarget`/`SaveBookRequest`/`SavedBook` |
| 신규 enum | `LibrarySectionKey` · `LibraryFilter` · `BookSource` (총 29 → **32종**) |
| 삭제 enum 값 | `ActivityOptionKind.conversation_only` (approvals §12.12) |
| 삭제 필드 | `ActivityOptionCard.title`·`userEnteredBook` · `ActivityOptionCard.coachingLine` · `PromptSet.coachingLine`(→ `coachingNote`) |
| 신규 error code | `BOOK_ALREADY_OWNED`(409) — 총 28 → **29종** |
| 신규 endpoint | `GET /v1/children/:childId/library/overview` · `GET /v1/books/:bookId/prompts?childId=` |

상세·판단 근거: `stage-3-library-r1-handoff.md` §2.4 · `stage-3-home-handoff.md` §R4.1 · §G4.1.

### 1.5 Mock (`apps/web/src/mocks`)

| 그룹 | 파일 | key 수 |
|---|---|---|
| `home` | `mocks/home/MockHomeApi.ts` | 8 |
| `activity-cards` | `mocks/activities/MockActivityApi.ts` | 10 |
| `library` | `mocks/library/MockLibraryApi.ts` | 19 |
| `books` | `mocks/books/MockBooksApi.ts` | 7 |
| fixtures | `mocks/fixtures/{activity-cards,saved-books,library}.ts` | — |

전부 결정적이다. 시각은 주입 clock 의 **상대 오프셋**으로만 만든다 (`shared/lib/clock.ts` `shiftedIso()`).

### 1.6 Design Token

Tier 3(component) 총 **152종** (`packages/design-tokens/__tests__/token-tiers.test.ts` · `fonts.test.ts` 가 건수를 고정).
Library 1라운드 `LT-1`~`LT-14` 19종 추가·1종 제거(150) → 2라운드-4 `--sheet-content-shadow-inset-inline-cover`(151) → 2라운드-5 `--sheet-content-shadow-inset-block-start-cover`(**152**).

---

## 2. 재현 경로

### 2.1 시나리오 전환 — 3가지 방법

```
① URL      ?scenario=<group>:<key>[,<group>:<key>…]
② dev 패널  우하단 `scenario` 패널 (dev 빌드 전용)
③ 직접      sessionStorage['haru:scenario']
```

우선순위는 **URL > dev 패널 > `VITE_MOCK_SCENARIO` > `success`** 다 (Stage 1 `D-5`).

> ⚠️ **`/library` 로 직접 `goto` 하면 인증을 잃는다.** route guard 가 `/auth/welcome` 로 보낸다.
> 시나리오는 **로그인 화면 URL 에 심고** 탭으로 이동한다 — `sessionStorage` 에 남아 SPA 이동 뒤에도 유지된다.
> ```
> /auth/log-in?scenario=library:empty   → 로그인 → Library 탭
> ```
> e2e 헬퍼 `logInToLibrary` · `goToLibrary` (`e2e/support/*`)가 이 경로를 쓴다.

로그인 자격 (Mock): **`sam@example.com` / `sunny-evening-8`**

> ✅ **dev 패널이 6개 그룹을 모두 등록한다** (`DEV_SCENARIO_GROUPS` —
> `apps/web/src/dev/scenario-panel/devScenarios.ts`):
> `health` · `home` · `activity-cards` · `library` · **`books`** · `__states`.
> `books` 그룹(7 key, `BookDetailSheet` 의 Prompt·추천 이유 — `no-reason` 포함)은
> **패널에서 바로 전환된다** (2026-10-09 등록, 이전 §9 미해결 ③ 해소).
> URL(`?scenario=books:no-reason`)·`sessionStorage` 경로도 그대로 동작한다.
>
> 패널 본문은 key 수와 무관하게 `max-block-size: 60dvh` + `overflow-y: auto` 로 묶여 있다
> (`apps/web/src/dev/dev.css` — `R-SHADOW-1` 근거 주석 포함). 실측(Playwright, 2026-10-09):
> 393×852 Home 에서 패널 `y=133.8 … 719.0`, 320×568 에서 `y=20.2 … 435.0` — **두 폭 모두
> 뷰포트 안**이고 본문만 스크롤한다(내용 1092 / 가시 511). 새 `overflow` 선언은 없다.

### 2.2 화면·상태별 도달 경로

#### Home (`/`)

| 상태 | 경로 |
|---|---|
| SUCCESS | `/` (기본) — 트랙 3장 · 버블 · dots |
| 카드 뒤집기 | 카드의 flip 어포던스 → 뒷면 Prompt pill + beige 코칭 노트 |
| LOADING | `/?scenario=activity-cards:loading` — 트랙 Skeleton(1장 + peek), 헤더·탭바 즉시 표시 |
| EMPTY | `/?scenario=activity-cards:empty` — 트랙 높이 415 점유 + 안내 |
| ERROR / RETRY / OFFLINE | `/?scenario=activity-cards:error` \| `:retry` \| `:offline` |
| 재독 카드 | `/?scenario=activity-cards:reread-option` |
| 책 소진 (3장 전부 재독) | `/?scenario=activity-cards:books-exhausted` |
| 이미 `Saved` 상태 | `/?scenario=activity-cards:book-saved` |
| `★ Save` 실패 → 롤백 + Toast | `/?scenario=library:error` \| `library:offline` |
| `★ Save` 1회 실패 후 성공 | `/?scenario=library:retry` |
| 진행 중 세션 안내 | `/?scenario=home:session-already-active` (+ `/v1/sessions` 호출 0건) |
| 온보딩 미완료 | `/?scenario=home:onboarding-incomplete` |
| Home 집계 상태 | `/?scenario=home:loading` \| `:empty` \| `:error` \| `:retry` \| `:offline` |

#### `/library` 본 화면

| 상태 | 경로 (`/auth/log-in?scenario=library:<key>` → Library 탭) |
|---|---|
| SUCCESS (4섹션 전부) | `success` |
| LOADING | `loading` — 헤더는 실제 텍스트 · 본문만 Skeleton · dots 미표시 · `aria-busy` 1회 |
| EMPTY (3섹션 동시) | `empty` — + `Reading now` 블록 제거 + "See all" 3개 비활성 |
| 섹션별 EMPTY | `favorites-empty` · `finished-empty` · `curated-empty` |
| `Reading now` 없음 | `reading-now-none` — **블록 전체 제거**(간격 회수) → L-1 `30:74` 와 같아진다 |
| 캐러셀 1권 | `shelf-partial` — 열을 접지 않고 **dots 미표시** |
| 평점 없음 | `unrated` — 행 우측 meta **미렌더**, 좌측 정렬 유지 |
| 보유·증정 표식 없음 확인 | `gift-pending` (`L-OPEN-14` 확인용 — 표식이 **없어야** 정상) |
| ERROR / OFFLINE / RETRY | `error` \| `offline` \| `retry` — `ErrorState` + Retry **1개** |
| 카탈로그 외 책 | `user-entered-book` — `BookCover` placeholder(이니셜) |

#### 시트 2종

| 상태 | 경로 |
|---|---|
| `LibraryShelfSheet` | Library → **`See all Our curated shelf`** 버튼 |
| 〃 추가 페이지 로드 | `library:paged` → 시트 하단 sentinel 도달(`IntersectionObserver`) |
| 〃 EMPTY | `library:empty` |
| 〃 ERROR / OFFLINE / RETRY | `library:error` \| `offline` \| `retry` |
| `BookDetailSheet` **앞면** | Library → 캐러셀 항목 탭 · 또는 Shelf 시트 행 탭(**교체** 전환) |
| 〃 닫기 → Shelf 복귀 | Shelf 시트 경유로 열었을 때만 |
| 〃 추천 이유 줄 | `books:success`(기본) |
| 〃 추천 이유 **없음** | `books:no-reason` — 이유 줄만 사라진다 (⚠️ dev 패널에 없는 key) |
| 〃 Prompt LOADING/ERROR | `books:loading` \| `error` \| `retry` \| `offline` — 이때 **flip 버튼이 없다** |
| 〃 카탈로그 외 책 | `library:user-entered-book` — Prompt 미조회 · 이유 없음 · **flip 없음** |
| `BookDetailSheet` **뒷면** | 앞면 헤더 trailing 의 **첫 번째** `IconButton`(`Show prompts and coaching notes`) |
| 〃 `★ Save` → `Saved` | 앞면 ActionBar — 낙관 갱신 후 `PUT …/saved-books` → `libraryKeys.all` 무효화 → overview 재조회 |
| 〃 저장 실패 | `library:error` \| `offline` — `InlineAlert tone="error"` |
| 〃 증정 신청 | `Request this book` |
| 〃 증정 중복 | `library:gift-duplicate` → `GIFT_REQUEST_DUPLICATE` → `InlineAlert tone="info"` |
| 〃 증정 접수 안내 | `library:gift-pending` + 상태 `Tag` |

#### 진입점 2화면

| 상태 | 경로 |
|---|---|
| `/library/add` | Library 하단 진입점 행 → 검색 / 직접 입력 → `/library` 복귀 + Toast |
| 〃 검색 결과 0건 | `books:empty` → 직접 입력 경로 |
| 〃 중복 등록 | `library:book-already-owned` → **안내**(오류 아님), 화면 유지 |
| `/library/gift-requests` | Library 진입점 행 → 접수 안내 + 상태 2건 |
| 〃 EMPTY / ERROR | `library:empty` → 안내 / `library:error` → Retry 1개 |

#### 공통 상태 데모 (dev gallery)

`/__dev/ui/...` + `?scenario=__states:empty` 등 6 key (`success` `loading` `empty` `error` `retry` `offline`).
dev 전용이며 Production 빌드에 **존재하지 않는다** (`assert:no-mocks` 가 고정).

---

## 3. 승인 근거 — **Figma 에 없는데 구현한 것**

> QA 가 "Out of Scope 구현"(= `FAIL` Finding)으로 오판하지 않도록 승인 번호를 짚는다.
> 아래는 **전부 사용자 승인분**이다.

| # | 구현한 것 | Figma | 승인 근거 |
|---|---|---|---|
| ① | `/library/add` · `/library/gift-requests` **진입점 2개 화면** | 없음 | **`L-OPEN-12`** (approvals §16.2) — design-agent 명세 경로(**`C-13` ②**). `FR-22` 증정 요청 기능은 유지되고 표식만 빠진다 (④ 와 구별) |
| ② | **상태 화면 일체** — Loading/Skeleton · Empty · Error/Offline/Retry | 없음 | **`L-OPEN-13`** (approvals §18) — design-agent 명세 (`C-13` ② + Stage 0 **`#22` 명세 우선**) |
| ③ | `BookDetailSheet` **뒤집기 어포던스** (헤더 trailing 두 번째 아이콘) | `145:1085` 에 아이콘 자리 1개뿐 | **`L-R2B-02`** (approvals §28 부근) — `Prompt.coachingNote` 가 화면에서 **도달 불가**였던 결함의 해소책. 형태: `[flip][닫기]`, **닫기가 모서리 자리 유지** |
| ④ | `Sheet` **`footer` 슬롯** | — | Figma `Button/card`(`163:1898` · `145:1085`)의 **카드 하단 고정 ActionBar 를 재현하는 수단**이다. `AD-S3-19` **철회**(= ActionBar 를 Figma 대로 넣기로 한 결정, `L-OPEN-03`)를 구현하려면 본문 스크롤 밖 고정 슬롯이 필요하다 |
| ⑤ | `Sheet` **`surface` prop**(`spring`) | `86:482` 뒷면 면 색 | 뒷면 면 색(사용자 결정 2026-10-09 ①)을 재현하는 **수단**이다. 가운데(본문)만 칠하면 헤더·ActionBar 자리가 흰 채로 남아 "가운데만 초록"이 된다. **opt-in** — 주지 않은 시트는 외형 불변 |
| ⑥ | `Sheet` **`contentShadowInset`**(`true` \| `'cover'`) | — | `R-SHADOW-1`(사용자 결정 2026-10-05)이 **요구하는** 그림자 자리 레시피다. Figma 요소가 아니라 **Figma 의 그림자를 잘리지 않게 그리기 위한 수단** |
| ⑦ | 캐러셀 **`overflow-x` 예외** (`.haru-shelf-track`) | — | **`L-NEW-01`** (approvals §20.1) — `AppColumn` 안쪽 `overflow-*` 금지의 **두 번째 예외**(첫 번째는 Home 가로 트랙). 조건 3개를 충족해야 한다: ① 그림자 보호 구조(`R-SHADOW-1` ②) ② **세로·가로 양축** 픽셀 프로브 회귀 테스트(`R-SHADOW-1` ⑥) ③ 근거 주석 — 셋 다 적용됨 |
| ⑧ | `BookDetailSheet` 뒷면에서 **ActionBar 를 레이아웃에서 뺀다** | `86:482` 뒷면에 ActionBar **없음** | 사용자 결정 2026-10-09 ② — Figma 를 따르는 쪽이다. 구현 수단(음수 margin 400ms 보간)의 사유는 `library.css` 주석에 있다 |
| ⑨ | dev Scenario Panel 본문 `max-block-size: 60dvh` + `overflow-y: auto` | — | approvals §21.6 — dev 전용, Production 영향 0 |
| ⑩ | **캐릭터 버블 닫기(×) 버튼** (Home) | `50:176` 에 **없음** | **approvals §13.4 `W-2`** + `stage-3-home-handoff.md` §B2 — 사용자 지시로 추가했다. 크기 **40 유지**가 그 결정의 내용이다("닫기 버튼 자체가 Figma 에 없으므로 … 결정: 40 을 유지한다"). 허용 차이 등록 + 디자이너 확인 대상(`D-REQ-2`) |

> **⑩ 은 `QA-3-007` 로 추가되었다 (2026-10-09).** 그전까지 이 표는 ①~⑨ 9건이었고 ⑩ 이 빠져 있었다.
> ①~⑨ 는 Library 라운드 산출물이고 ⑩ 은 **Home 라운드** 산출물이라, 통합 입구를 만들 때
> Home 라운드 메모(`stage-3-home-handoff.md` §B2)에서 옮겨 적히지 않았다. 이 표는 "승인분 전부"를
> 선언하므로 1건이라도 빠지면 QA 가 최우선 규칙 #2 위반으로 오판할 수 있다.

---

## 4. 승인 근거 — **Figma 에 있는데 빼기로 한 것**

> 이것도 `FAIL` 사유가 아니다. 전부 사용자 결정분이다.

| # | 뺀 것 | Figma 위치 | 승인 근거 |
|---|---|---|---|
| ① | **보유·증정 표식**(`ownership`) | L-1 등 | **`L-OPEN-14`** (approvals §17.1) — 구분 표식 없이 간다. ⚠️ Orchestrator 권고("design-agent 명세")를 사용자가 **기각**한 건이다. `library:gift-pending` 에서 표식이 **없는 것이 정상** |
| ② | **`My Saved` 섹션** | L-2 `145:1156` | **`L-D1`** (approvals §15) — `Favorites`(L-1 `163:1632`/`163:1633`)를 채택. `My Saved` 자체는 미채택 |
| ③ | **`Selected` 변형** | `113:1991` | **`L-OPEN-02`** (approvals §18) — 어느 화면에도 **인스턴스가 없어** "Figma 에 있는 것을 빼는" 건이 아니다 |
| ④ | 섹션 안 **"Show more"** | `Finished together` | **`L-OPEN-21`** (approvals §18) — 4행 고정 + "See all" 전체 목록. "Show more" 를 **만들지 않는다**(최우선 규칙 #2) |
| ⑤ | `BookDetailSheet` **뒷면 헤더 문구** `Prompt of this book` | `86:482` 헤더 | **사용자 결정 2026-10-09 (이번 라운드)** — "현재대로 두고 차이 등록". 시트 헤더는 **책 제목 유지**(dialog 접근성 이름 불변), Figma 문구는 **본문 h3** 에 남는다 |
| ⑥ | Home Prompt **별도 시트** | `86:482` = 별도 시트로 읽었던 해석 | approvals §12 — `AD-S3-23`·Spec §12.5 **무효**. `86:482` 는 **카드 뒷면**이다 → 뒤집기로 구현 |
| ⑦ | `conversation_only` 옵션 카드 | — | approvals §12.12 — enum 값까지 삭제. `AC-3-20` 의 해당 분기 **폐기** |
| ⑧ | Reading Context 진입점·시트 | — | approvals §12.3 ⑧ — **Stage 3 이월**. contract·Mock 은 유지(`AC-3-22`~`26` 이월) |

---

## 5. 무효가 된 허용 차이 (`AD-S3-*`)

> 설계 문서(`docs/design/stage-3-design-spec.md` §11.3)에 `AD-S3-*` 표가 남아 있으나
> 아래 항목은 **무효/철회**다. QA 가 낡은 허용 차이를 근거로 판정하면 안 된다.

| ID | 원래 내용 | 처리 | 근거 |
|---|---|---|---|
| `AD-S3-4` | 2번째 섹션 제목 → "Books you own" | **무효 — 삭제** | **전제가 사실이 아니었다.** "제목 두 번 중복"은 L-1 이 아니라 **L-3 `163:1669`** 의 일이고, L-1 의 세 제목(`163:1625` `Our curated shelf` · `163:1633` **`Favorites`** · `30:139` `Finished together`)은 **전부 다르다**. "Books you own" 은 **Figma 에 없는 문구**였다 (최우선 규칙 #2 위반) — approvals **§14.1** |
| `AD-S3-6` | `Rated 4.5` 미렌더 | **무효** | **Figma 대로 렌더한다** (`L-D3`). 집계 모집단은 해당 Child 의 세션 평점만(`L-OPEN-18`), unrated 는 meta 를 비운다(`L-OPEN-22`) — approvals **§15** |
| `AD-S3-7` | `Reading now` 카드 미렌더 | **무효** | **Figma 대로 구현한다** (`L-D2`, `145:1145`) — approvals **§15** |
| `AD-S3-8` | `My Saved` · `★ Save` 미렌더 | **무효** | `★ Save` 는 approvals §12.2 로 **이미 구현**됨. `My Saved` 는 `L-D1`(`Favorites` 채택)으로 해소 — approvals **§15** |
| `AD-S3-19` | "See all" 시트 ActionBar 제거 | **철회** | `163:1898`(`type=shelf`)에 `Button/card`(★ Save + Start Session)가 **실재**하고 L-3 에 인스턴스가 있다. **Figma 대로 ActionBar 를 넣는다**. 시트의 `Start Session` 도 `D-3` 대로 비활성(`aria-disabled`) — approvals **§17.2** (`L-OPEN-03`) |

함께 무효가 된 것: `AC-3-11` · `AC-3-17`(폐기) · `AC-3-22`~`26`(이월) · `D-7` 의 "평점·Reading now·My Saved 미구현" · `D-14` Home 덱 부분.

---

## 6. `BACKEND_INTEGRATION_PENDING`

### 6.1 Stage 3 에서 새로 확정된 항목 (신규)

| ID | 내용 |
|---|---|
| **`P3-BIP-16`** | **책 평점 집계** — `LibraryBook.averageRating`. 모집단은 **해당 Child 의 세션 평점으로 한정**해야 한다(`L-OPEN-18`). nullable 이며 `null` 이면 행 우측 meta 를 비운다(`L-OPEN-22`). Frontend 는 집계를 하지 않는다 |
| **`P3-BIP-17`** | **다회차 진행** — `ReadingProgress.progressRatio` 는 **서버 값**이며 Frontend 가 되계산하지 않는다 (fixture 의 0.552 와 회차 3/5(0.6)가 **다른 것**으로 되계산 금지를 테스트가 고정). ⚠️ **`plannedNights` 의 출처가 불명**이다 — 사용자 입력인지 서버 추정인지 결정되지 않았다. nullable 이고 `null` 이면 회차 문구를 생략한다 |
| **`P3-BIP-18`** | **서재 섹션 1회 조회** — `GET /v1/children/:childId/library/overview` 가 4섹션을 **한 번에** 돌려준다. 섹션별 호출 0건을 테스트가 고정한다 |
| **`P3-BIP-19`** | **표지 에셋 교체 게이트** — 현재 표지는 Figma 에서 가져온 **Mock 전용 임시 에셋**이다. **Stage 8 배포 전 필수**. 권장 비 107:151 (편차가 크면 `object-fit: cover` 잘림이 커진다) |
| **`P3-BIP-20`** | **커서 페이지네이션** — `GET …/library?filter=&limit=&cursor=`. `nextCursor` 는 불투명 문자열이고 **같은 정렬에서 중복·누락이 없어야** 한다 |
| **`P3-BIP-21`** | **`BOOK_ALREADY_OWNED`(409)** — 같은 책 재등록. 화면은 오류가 아니라 **안내**로 처리한다 |
| **`P3-BIP-22`** | **`Idempotency-Key`** — `POST …/library/books` · `POST …/gift-requests` 필수. 같은 키 재시도는 **최초 응답을 재생** |
| **`P3-BIP-23`** | **`GET /v1/books/:bookId/prompts?childId=`** — 연령대·역량에 따라 세트가 달라진다. 카탈로그 외 책(`LibraryBook.book === null`)에는 세트가 없고 화면이 **호출하지 않는다**. `BookDetailSheet` 의 **유일한 detail 조회**이며 시트를 열 때 1회 |
| **`P3-BIP-24`** | **증정 요청 상태 전이** — `requested → approved → shipped → delivered` / `cancelled` · `rejected`. 전이 규칙·알림은 서버 소유. 화면은 라벨 텍스트만 표시 |
| **`P3-BIP-25`** | **`LibraryBook.purchaseUrl`** — 안전한(허용 도메인) URL 보장은 서버 책임 |
| **`P3-BIP-26`** | **`BookPromptsResponse.reason` 생성 책임은 서버다.** Frontend 는 생성·가공·접두어 추가를 하지 않는다. ① 아이·책 조합에 맞춘 1~2문장 ② **진단·판정·비교 표현 금지**(PRD §11 · `rules/frontend.md` §8) ③ **길이 상한은 contract 에 없다** — 2문장은 서버 생성 정책이고 초과해도 화면이 깨지지 않아야 한다 ④ 문장이 없으면 **생략 또는 `null`** (화면이 줄을 생략) ⑤ 카탈로그 외 책은 이 endpoint 를 호출하지 않으므로 이유도 없다 |

### 6.2 갱신된 기존 항목

| ID | 갱신 |
|---|---|
| `P3-BIP-15` | 저장/해제 응답은 `SavedBook` **현행 유지**(`L-OPEN-20`). 서재는 `libraryKeys.all` 무효화 → **재조회**로 최신 `Favorites` 를 받는다. 서버는 저장 직후 `overview` 가 **즉시 일관**(read-after-write)이어야 한다 |

### 6.3 Handoff 에 남길 추가 요구

- **표지 이미지 비율** — 원본 비가 107:151 과 크게 다른 에셋은 잘림이 커진다. 에셋 가이드를 `BACKEND_HANDOFF` 에 남긴다
- **`Reading now` 선정 규칙**과 `lastSessionMinutes` 출처가 서버 소유다 (조각이 없으면 그 조각만 생략)

---

## 7. 가값(provisional)

| ID | 내용 | 상태 |
|---|---|---|
| **`P-24`** (신규) | **연한 회색 대비** — `--color-fg-tertiary` = `--haru-ink-400`. **7 사용처 전부 AA(4.5) 및 대형 텍스트 기준(3.0) 미달**이고 **최악 1.56:1**(`See all` 12px · 캐러셀 캡션 11px · `3 of 5 nights` 12px, 앱 배경 직접) ~ 최선 2.38:1. chevron 은 비텍스트 기준(3.0)도 미달 — 단 행 전체가 버튼이고 접근성 이름이 책 제목이라 chevron 단독 정보 전달은 없다. 토큰 정의에 `/* provisional: P-24 */` 주석 + dev gallery 등재 완료 — approvals **§20.4** |
| **`P-05`** | scrim | **해제** — 근거가 "DESIGN_TOKEN_MAP 제안" → **"Figma 실측"** 으로 바뀌었다 (`L-NEW-09`, approvals §19·§20.1). 감시 baseline `s3-sheet-scrim` · `s3-dialog-scrim` 신규 |
| 남은 목록 | `P-01` · `P-02` · `P-04` · `P-16` · `P-23` · `P-24` (`fonts.test.ts` 가 고정) |

### ~~⚠️ `S3-PROV-2` — dev gallery 가값 목록 미등재~~ → **해소 (2026-10-09, `QA-3-006`)**

**대상은 `P-23`(`--color-prompt-tag-fg`) 1건이었다.** 이 문서가 처음 적은 `P-18`~`P-23` 6건은 틀렸다 —
`P-18`~`P-22` 는 **토큰 자체가 없어 등재 대상이 아니다**(`P-20` `--toggle-*` 은 확정, 나머지는 미생성).
QA 가 `provisional` 주석 전수 조사로 approvals §21.5 의 기록을 정정했다 (approvals §26.5).

등재 기준은 **`packages/design-tokens` 의 `provisional` 주석**이며 현재 활성 가값은
`P-01 · P-02 · P-04 · P-16 · P-23 · P-24` 6건, dev gallery 목록도 같은 6건을 담는다.
수정 내용은 **§14 ③**.

---

## 8. 시각 회귀 설정이 **바뀌었다** (2026-10-08 사용자 결정)

| 설정 | 값 | 비고 |
|---|---|---|
| `VISUAL_THRESHOLD_REGION` | **`0.02`** | 픽셀당 색 차이 (pixelmatch 기준 채널당 약 5.3) |
| `VISUAL_THRESHOLD_FRAME` | **`0.02`** | 값이 같을 뿐 **별개 상수**다. 한쪽을 바꿔도 다른 쪽은 따라가지 않는다 |
| `VISUAL_MAX_DIFF_PIXELS` (전역/프레임) | **50** | 200 → 50. 실측 노이즈 바닥 0px · 최악 사례 5px 의 **10배 여유** |
| `VISUAL_MAX_DIFF_PIXELS_REGION` (영역) | **20** | — |
| `VISUAL_MAX_DIFF_PIXEL_RATIO` | `0.002` | 두 종류 공통 |

⚠️ `threshold` 와 `maxDiffPixels` 는 AND 가 아니라 **직렬**이다 — `threshold` 가 먼저 픽셀을 걸러내고
**살아남은 수**만 개수 상한과 비교된다. 근거 수치는 `playwright.config.ts` 주석에 전부 있다.

> ⚠️ **스테일 baseline 확인은 `--update-snapshots=all` 로만 드러난다.**
> 일반 실행은 "현재 코드와 다른가"만 본다. 기준 이미지에 **Production 에 없는 UI** 가 박혀 있는 식의
> 오염(실제 사례: `frame-1024` 에 dev Scenario Panel 이 통째로 찍혀 있었다)은 전량 재생성으로만 보인다.
> QA 가 스테일 여부를 보려면 `playwright test --update-snapshots=all` 후 `git diff --stat e2e/__screenshots__` 를 본다.

---

## 9. 미해결로 남긴 것

| # | 항목 | 상태 |
|---|---|---|
| ① | **Library Plan / Design Spec 의 `Status:` 가 `DRAFT` 다** | 승인은 approvals §20.1 에 있으나 **파일 header 문자열이 갱신되지 않았다**. `workflow.md` §3("승인되면 `Status:` 를 `APPROVED (YYYY-MM-DD, user)` 로 갱신")의 누락. 문서 소유가 plan/design-agent 라 development-agent 가 고치지 않았다 |
| ② | **Library 2라운드-4 독립 인계 메모가 없다** | 근거는 코드 주석(`e2e/shadow.spec.ts` · `library.css` · `Sheet.css`)과 approvals 에 분산되어 있다. 이 문서 §1.1 이 그 사실을 명시한다 |
| ③ | ~~**`books` 시나리오 그룹이 dev 패널에 없다**~~ → **해소 (2026-10-09)** | `DEV_SCENARIO_GROUPS` 에 `library` 다음으로 등록했다. 패널 전환·`aria-pressed`·URL·`sessionStorage` 왕복을 브라우저에서 실측 확인. 시각 baseline 74종은 `--update-snapshots=all` 재생성 후 **바이트 동일**(패널은 `hideDevPanel` 로 가려진다). → §2.1 |
| ④ | **둥근 모서리 AA 띠의 원인 커밋을 특정하지 못했다** | 채널차 ≤ 6 의 안티에일리어싱 띠가 여러 baseline 둘레에 남아 있다. 육안 동일이고 `0.02` 가 걸러내지만 **언제 들어왔는지** 역추적하지 못했다 |
| ⑤ | **Safari / iOS 실기기 미확인** | 모든 측정이 Playwright 번들 Chromium(darwin, dSF 1)이다. `overflow-x: clip` · `:has()` · `inert` · `backface-visibility` + `rotateY` 조합은 **Safari 에서 확인되지 않았다** → QA `NOT VERIFIED` 후보 |
| ⑥ | **뒤집기 중간 프레임의 ActionBar 잔상** | ActionBar 는 `Sheet.footer` 라 뒤집히지 않고 음수 margin + opacity 로 400ms 에 걸쳐 접힌다. 전환 **중간 프레임**에 반투명 ActionBar 가 뒷면 위에 겹쳐 보인다. `prefers-reduced-motion` 에서는 전이가 꺼져 나타나지 않는다 |
| ⑦ | **저장 실패 `InlineAlert` + 뒤집기 동시 상황의 잔여 빈 자리** | 접기 양은 CSS 상수(ActionBar 45 + 시트 gap 12 = 57)다. 실패 알림이 함께 떠 있으면 footer 가 45 보다 높아 **그 차이만큼 빈 자리가 남는다**. 내용 손실·겹침은 없다. CSS 로는 footer 의 실제 높이를 알 수 없다 |
| ⑧ | **320×568 뒷면에서 본문을 63px 더 내릴 수 있다** | 앞면의 넘친 높이가 스크롤 영역에 남아 **빈 자리가 보인다**. 내용 손실 없음. 없애려면 뒤집힌 동안 앞면을 접어야 하는데 전환 중 앞면이 갑자기 사라진다 |
| ⑨ | ~~**`AC-3-07` Toast 하단 offset**~~ → **해소 (2026-10-09, `QA-3-004`)** | ⚠️ **이 칸의 전제가 틀렸다.** 원문은 *"Toast 가 실제로 마운트되는 Stage 3 화면이 없어 실행 증거가 없다"* 였는데, `ActivityCardDeck.tsx:49`(저장 실패)와 `AddOwnBookForm.tsx:68`(등록 성공)이 **둘 다 Toast 를 띄운다**. 경위와 수정은 **§14** |
| ⑩ | **`AC-3-86`** "보호자 직접 입력 책" 분기 | 부분 충족 — `stage-3-home-handoff.md` §R8 ④ |

---

## 10. 알려진 제약 (설계상 그렇게 했다)

| # | 제약 |
|---|---|
| ① | **`See all` 시트가 `LibraryShelfSheet` 하나로 세 섹션을 처리한다.** 섹션별 시트 컴포넌트를 만들지 않고 `filter`(`curated` / `favorites` / `finished`)를 받아 같은 시트가 목록을 바꾼다. 접근성 이름은 `See all {섹션}` 으로 섹션마다 다르다. QA 는 **세 섹션 모두**에서 열어 봐야 한다 |
| ② | **저장/해제 후 반영은 목록 재조회다** (`L-OPEN-20`). 응답은 `SavedBook` 뿐이어서 `Favorites` 섹션을 응답만으로 갱신할 수 없다 → `libraryKeys.all` 무효화 → `overview` 재조회. 따라서 **낙관 갱신(라벨) + 재조회(섹션)** 2단계로 보인다 |
| ③ | **Shelf 시트 ActionBar 두 버튼이 둘 다 `aria-disabled`** 다. `type=shelf` 에는 선택된 책이 없고 `type=selected` 변형은 미구현 확정(`L-OPEN-02`)이라 저장 대상이 정해지지 않는다. Figma 요소를 빼지 않고 `Start Session` 과 같은 방식(`D-3`)으로 비활성 |
| ④ | **`Start Session` 은 Stage 3 전체에서 비활성**이다 (`D-3`, approvals §13.10). 세션은 Stage 4 |
| ⑤ | **`BookDetailSheet` 뒷면은 앞면 높이를 그대로 쓴다** (`position: absolute; inset: 0`). `inset-card` 는 아래가 고정이라 높이가 바뀌면 **윗변이 튄다** |
| ⑥ | **Mock clock 이 고정 시각**이라 상대 시각 문구(`finished May 2` 등)가 실행 시각과 무관하게 같다. 결정성을 위한 설계다 |
| ⑦ | **`ReadingContextSheet`** 는 Stage 3 이월 (approvals §12.3 ⑧). contract·Mock 은 남아 있고 화면 진입점이 없다 |
| ⑧ | **`D-17` Mock 전용 route** 는 추가하지 않았다. 제약 ②("route 가 사라져도 부모 화면 상태로 동작")는 이미 충족 — 시트 열림 상태를 `LibraryShelves` 가 소유하고 route 가 존재하지 않는다 |

---

## 11. 2라운드-5 (이번 라운드) — 시트 표지 그림자

사용자 결정 2026-10-09 ①. 상세 주석은 `library.css` · `Sheet.css` · `packages/design-tokens/src/component/index.css` · `e2e/shadow.spec.ts` 에 있다.

### 11.1 고친 것

**Figma `145:1085` 의 책 블록은 Home 카드 `163:2649` 와 같은 규격**이고 그 규격의 출처 `85:536` 이
`--shadow-cover`(drop `0 6px 14px ink28%` + inset highlight) + radius **10** 을 갖는다. **즉 Figma 에는 그림자가 있다.**
그런데 구현에는 없었다 — `BookCover md` **기본값에 그림자가 없고**(`book.css`) Home 만
`.haru-activity-card__book .haru-book-cover` 로 덮기 때문이다. 시트는 그 범위 밖이라 `box-shadow: none` 이었다
(2라운드-4 e2e 가 그 사실을 `expect(shadow).toBe('none')` 으로 고정하고 있었다).

**`BookCover` 기본값을 바꾸지 않았다.** `md` 에 넣으면 Home 과 선언이 중복되고 `sm`(Book List 썸네일 —
Figma `30:142` 는 그림자 없음)까지 번질 위험이 있다. Home 과 **같은 방식으로 시트 범위에만** 덮었다.

### 11.2 위쪽 자리 (8) — 네 방향 실측

`--shadow-cover` 는 offset-y `+6` 이라 번짐이 **비대칭**이다. 네 방향을 **같은 패스에서** 픽셀 프로브로 쟀다
(dev 서버 · dSF 1 · 표지에 그림자 ON/OFF 토글 Δ):

| 방향 | 프로파일 (1…px) | 번짐 | 자리 소유자 |
|---|---|---|---|
| 아래 | `99 91 86 80 72 65 58 52 44 24 22 17 12 11 10 9 9 5 3 3 0 …` | **20** | `.haru-book-sheet__cover` (기존) |
| 좌 | `52 46 38 33 30 22 16 13 13 9 9 6 3 3 0 …` | **14** | `__flip` + `Sheet contentShadowInset="cover"` (2라운드-4) |
| 우 | `52 46 41 34 30 25 19 16 13 9 9 6 3 3 0 …` | **14** | 〃 |
| **위** | 보정 **전** `0 0 0 …` / 보정 **후** `17 15 13 9 9 6 3 3 0 …` | **8** | **`.haru-sheet__content--shadow-inset-cover`** (이번) |

산술 검산: Chrome 의 blur 번짐 폭 = blur radius **14**, offset-y +6 → 아래 6+14=**20** · 위 14−6=**8** · 좌우 ±14.
**네 값 모두 실측과 일치한다.** drop 1겹이라 빠뜨릴 겹이 없다.

### 11.3 헤더 ↔ 본문 간격이 유지된다 (실측)

| 측정 | 보정 전 | 보정 후 |
|---|---|---|
| header bottom | 340.15625 | 340.15625 |
| content **border** box top | 352.15625 | **344.15625** (−8) |
| content `padding-block-start` | 0 | **8** |
| content `margin-block-start` | 0 | **−8** |
| content **content** box top | 352.15625 | **352.15625** (불변) |
| **헤더↔본문 간격** | **12** | **12** (= 시트 flex `gap` `--space-3`) |
| content border box 높이 | 412.84375 | 420.84375 (+8) |
| content **content** box 높이 | 412.84375 | **412.84375** (불변) |
| `__flip` top · content bottom | 352.15625 · 765 | 352.15625 · 765 (불변) |

(393×852 · dev 서버. `box-sizing: border-box` + `flex: 1 1 auto` 이므로 음수 margin 이 늘려 준 8 을 padding 이 그대로 흡수한다.)

### 11.4 두 박스 중 **한 박스만** 처리했다

좌우는 **두 박스**(`.haru-sheet__content` + `.haru-book-sheet__flip`)가 필요했다 — 바깥만 켜면 안쪽
`overflow-x: clip` 이 먼저 자른다. **위쪽은 `.haru-sheet__content` 하나로 끝난다**:
`overflow-x: clip` 은 다른 축을 scroll container 로 만들지 않아 `overflow-y` 가 `visible` 로 남는다
(**실측 computed `{ x: 'clip', y: 'visible' }`**). e2e 가 computed 값과 프로브로 양쪽을 고정한다.

### 11.5 위쪽 프로브는 **번짐 폭을 센다** (1점 Δ 가 아니다)

320 에서 `.haru-book-sheet__book` 은 `align-items: center` 이고 **텍스트 열이 표지보다 높다**
(좁은 폭에서 제목·이유가 더 줄바꿈된다) → 표지가 **2.58px 내려간다**(실측 표지 top 116.578 vs 본문 content box top 114).
그만큼은 보정이 없어도 우연히 살아 있어서 **고정 거리 1점 프로브가 "보정 없이도 보인다" 로 오탐했다.**
그래서 위쪽은 Δ≥2 가 연속되는 **폭**을 센다.

| 보정 | 320 | 393 | 600 | 1024 |
|---|---|---|---|---|
| 있음 | **8** | **8** | **8** | **8** |
| 없음 | **3** (우연한 여유) | **0** | **0** | **0** |

### 11.6 측정 함정 3건 — 지시받은 대로 확인

| 함정 | 처리 |
|---|---|
| ⓐ `packages/design-tokens/dist/index.css` 는 `@theme static` **소스 번들**이라 브라우저가 무시한다 | 전부 **dev 서버의 computed style** 로 쟀다 (`getComputedStyle` + `page.screenshot` 1×1) |
| ⓑ scroll anchoring | 프로브는 스크롤을 쓰지 않는 자리(본문 상단)이고 각 측정 전에 `settle()`(`document.fonts.ready` + rAF×2)을 다시 돌린다 |
| ⓒ **시트 면이 반투명이라 뒤 서재 표지가 로딩 중이면 프로파일이 전 구간 오염된다** | `openBookSheetFront` 가 `waitForLoadState('networkidle')` 후에 잰다 (2라운드-4 가 넣은 가드 그대로 사용) |

### 11.7 baseline — **1종만 바뀌었다**

`s3-library-book-sheet.png`(앞면) 1종. 변화를 픽셀 클러스터로 분해해 **전부 설명한 뒤** 재생성했다.

| 분해 | 수 | 설명 |
|---|---|---|
| 전체 변화 | **4322px · 연결 성분 1개** | bounding box x 4…89 · y 60…170 = 표지 상자(x 18…75 · y 68…150) ⊕ 번짐(위 8 · 아래 20 · 좌우 14) **정확히 일치** |
| 표지 **밖** | 4190px | 새로 그려진 drop shadow. 상 442 · 하 1138 · 좌 1123 · 우 1123 · 모서리 364 |
| 표지 **안** | 132px | radius 8 → 10 (img) + 상자 radius 신설. **전부 모서리 11px 안** |
| 표지 안 · 모서리 11px **밖** | **0px** | 표지 이미지가 **움직이지도 재샘플되지도 않았다** |

**설명되지 않는 변화는 없다.**
`s3-library-book-sheet-back`(뒷면)은 **통과**했다 — 뒷면에는 표지가 없다.
**Home baseline 7종과 Library 목록·캐러셀 baseline 은 1종도 변하지 않았다** (`BookCover` 기본값을 건드리지 않았다).

### 11.8 회귀 테스트 (이번 추가)

| 위치 | 테스트 |
|---|---|
| `e2e/shadow.spec.ts` | 위쪽 자리 **보정 있음** 4폭 (번짐 == 8) · **보정 없음** 4폭 (< 8) · `__flip` 되돌려도 위쪽 불변 + computed `{clip, visible}` · 표지에 `--shadow-cover` + radius 10 이 **있다**(이전의 `toBe('none')` 을 대체) |
| `apps/web/__tests__/library-css-guards.test.ts` | 시트 범위 override 존재 + **`BookCover` `md`·`sm` 기본값에 그림자 없음** + Home override 불변 · 위쪽 토큰 8 과 padding↔음수 margin 짝 · `__flip` 에 세로 자리가 **없다** |
| `packages/design-tokens/__tests__` | Tier 3 토큰 **152종** (`token-tiers` 목록 + `fonts` 건수) |

### 11.9 뒷면 헤더 문구 — **바꾸지 않았다**

사용자 결정 2026-10-09: "현재대로 두고 차이 등록". 시트 헤더는 **책 제목 유지**(dialog 접근성 이름 불변),
Figma `86:482` 의 `Prompt of this book` 은 **본문 h3** 에 남는다. → §4 ⑤

---

## 12. 생성·수정 파일 (이번 라운드)

```
수정  apps/web/src/features/library/library.css                     시트 표지 box-shadow + radius 10 (+ img)
수정  packages/ui/src/sheet/Sheet.css                               --shadow-inset-cover 에 위쪽 8 자리
수정  packages/design-tokens/src/component/index.css                --sheet-content-shadow-inset-block-start-cover: 8px
수정  apps/web/__tests__/library-css-guards.test.ts                 가드 3건 신규
수정  packages/design-tokens/__tests__/token-tiers.test.ts          151 → 152
수정  packages/design-tokens/__tests__/fonts.test.ts                151 → 152
수정  e2e/shadow.spec.ts                                            위쪽 프로브 9건 · "그림자 있다" 로 교체
수정  e2e/visual.spec.ts                                            baseline 재생성 근거 주석
수정  e2e/__screenshots__/darwin/visual.spec.ts/s3-library-book-sheet.png
신규  docs/qa/stage-3-handoff.md                                    이 문서
```

---

## 13. 검증 명령 결과 (이번 라운드 · 8/8)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ (의존성 변경 없음) |
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm lint:boundaries` | ✅ no dependency violations (586 modules · 2066 dependencies) |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **1596 passed** / 116 files (이전 1593 → +3 CSS 가드) |
| `pnpm build` | ✅ |
| `pnpm test:e2e` | ✅ **271 passed** (이전 262 → +9 위쪽 프로브) |
| `pnpm assert:no-mocks` | ✅ |

`apps/api/` · `supabase/` **미생성 확인** ✅

---

## 14. QA 수정 라운드 (`docs/qa/stage-3-qa-report.md` → 2026-10-09)

> 대상은 **사용자가 이월하지 않은 `FAIL` 2건 + Low 2건**이다.
> **이월 3건은 손대지 않았다** — `QA-3-001`(push 권한 기능군) · `QA-3-002`(오프라인 캐시) ·
> `QA-3-003`(에셋 파이프라인)은 사용자 결정으로 **Stage 4 In Scope** 다 (approvals §26.1).
> `QA-3-008`(AC 문구 낡음) · `QA-3-009`(`AC-3-34` 폐기 표기)는 **Plan 문서 소유**라 건드리지 않았다.

### ① `QA-3-004` (Medium) — Toast 가 탭바를 덮어 탭 3개 클릭을 막았다

**원인.** `ToastProvider` 는 "화면당 Toast 1개" 를 보장하려고 **앱 조립 지점**
(`AppProviders.tsx` — router **바깥**)에 한 번 마운트된다. 그 지점은 현재 route 가 탭 화면인지
스택 화면인지 알 수 없는데, 탭바 보정은 `withTabBar` **prop** 으로만 켤 수 있었다.
→ 넘길 수 있는 자리가 없어 저장소 전체에서 **0건**, `.haru-toast-viewport--tabbar` 는
**도달 불가 코드**였다. 측정값: Toast `y 786–836` ↔ 탭바 `y 766–836`(**50px 겹침**),
`--z-toast`(60) > `--z-tabbar`(20) → 탭 3개 중심의 `elementFromPoint` 가 전부 Toast.

**수정 (구조를 바꿨다 — prop → 런타임 등록).**

| 파일 | 내용 |
|---|---|
| `packages/ui/src/feedback/ToastProvider.tsx` | `withTabBar` **prop 을 없애고** `useToastTabBarInset()` 등록 hook 을 신설. provider 안에 **참조 수**(`tabBarCount`)를 두고 `> 0` 일 때 수식어를 붙인다 |
| `packages/ui/src/index.ts` | `useToastTabBarInset` export |
| `apps/web/src/app/layouts/TabLayout.tsx` | `useToastTabBarInset(tabBar !== undefined)` — **탭바를 실제로 렌더하는 지점**이 소유자다 |

**어디서 넘기기로 했는지 + 왜.** `AppProviders` 에 하드코딩하지 **않았다** — `true` 로 고정하면
탭바가 없는 온보딩·설정·`/library/add` Toast 가 탭바 높이(70+overhang)만큼 떠서 **스택 화면이
깨진다**. `TabLayout` 은 탭바 슬롯의 유일한 소유자이고, **`tabBar` 가 주어졌을 때만** 등록하므로
탭바가 없는 `TabLayout` 사용(Stage 1 `/`)에서도 보정이 켜지지 않는다.
참조 수를 세는 이유: route 전환은 "새 Layout 마운트 + 옛 Layout 정리" 가 한 커밋에 일어나고
StrictMode 는 effect 를 mount→unmount→mount 로 두 번 돈다 — boolean 이면 순서에 따라 뒤집힌다.

**스택 화면 회귀 확인** (실행):
- `e2e/tabs.spec.ts` "탭바가 없는 화면의 Toast 는 보정 없이 하단 16 에 머문다" — `/auth/reset-password`
  성공 Toast 에서 `--tabbar` **미부착** + `window.innerHeight − rect.bottom === 16` 실측
- jsdom: `StackLayout` · `FullscreenLayout` · **tabBar 없는 `TabLayout`** 3종 미부착 + **탭→스택
  전환에서 보정 해제**
- 시각 baseline: 전량 재생성 후 **74종 바이트 동일** (dev gallery 는 `BottomTabBar` 를 직접
  렌더하고 `TabLayout` 을 쓰지 않으므로 `v9-toast` 컷의 Toast 위치가 바뀌지 않는다)

**검증 수단을 CSS 문자열에서 런타임으로 옮겼다** (approvals §26.3):

| 층 | 파일 | 무엇을 단정하는가 |
|---|---|---|
| e2e (393px) | `e2e/tabs.spec.ts` | Toast 가 떠 있는 상태에서 **Toast bottom ≤ 탭바 top** + 탭 3개 중심 `elementFromPoint` 가 탭바 |
| jsdom | `apps/web/src/app/layouts/__tests__/layouts.test.tsx` | Layout 별 **클래스 적용 여부** (4건) |
| 소스 가드 | `apps/web/__tests__/stage3-css-guards.test.ts` | 기존 단정 유지 + **"이것은 선언 존재만 증명한다"** 주석 + 런타임 테스트 포인터 |

**수정 전 FAIL 출력** (원문):

```
  ✘  1 [chromium] › e2e/tabs.spec.ts:178:3 › Toast 가 떠 있어도 탭 3개가 가려지지 않는다 (`QA-3-004`)

    Error: Toast 가 탭바를 덮는다 {"toastPresent":true,"barPresent":true,
    "viewportClass":"haru-toast-viewport","insetBlockEnd":"16px",
    "toast":{"top":786,"bottom":836},"bar":{"top":766,"bottom":836},
    "links":[{"label":"Library","inTabBar":false,"inToast":true,
              "topNode":"haru-toast haru-toast--error haru-toast--open"},
             {"label":"Home","inTabBar":false,"inToast":true,"topNode":"…"},
             {"label":"Progress","inTabBar":false,"inToast":true,"topNode":"…"}]}

    expect(received).toBeLessThanOrEqual(expected)
    Expected: <= 766
    Received:    836
```

→ 수정 후 **7 passed** (`e2e/tabs.spec.ts` 전체).

⚠️ **`.click()` 을 주 단정으로 쓰지 않은 이유**: Toast 는 4s 뒤 자동 해제되므로, 가려져 있어도
Playwright 가 기다리는 동안 Toast 가 사라져 클릭이 **늦게 성공**한다 — 결함을 통과시킨다.
hit-test 는 즉시·결정적이며, Toast 존재 확인을 **같은 `evaluate` 안**에서 하므로 헛돌 수 없다.

### ② `QA-3-005` (Medium) — `MockLibraryApi` 가 `Idempotency-Key` 를 버렸다

**원인.** `ApiMutationOptions.idempotencyKey` 를 받아서 쓰지 않았다. 같은 키로 두 번 호출하면
리소스가 두 번 만들어지고 `IDEMPOTENCY_KEY_REUSED` 경로가 0건이었다 (`AC-3-36`).

**Stage 2 선례와 맞춘 방식** — `MockConsentApi.ts:101·214` · `MockOnboardingApi.ts:137·396` 과
**같은 구조**다:

1. 모듈 수준 `fingerprint(request) = JSON.stringify(request)` (Adapter 경계 parse 를 통과한 뒤라
   키 순서가 정규화되어 **결정적**이다)
2. Adapter 인스턴스 안의 `Map<key, { body, response }>` — **호출별로 분리**
   (`addBookIdempotency` · `giftIdempotency`). 섞으면 등록 응답이 증정 신청으로 재생된다
3. 판정 위치도 선례와 같다: **요청 로그 직후, 시나리오 분기보다 앞**. 한 번 성공한 요청은 그 뒤
   scenario 가 무엇이든 같은 응답을 돌려줘야 재시도가 안전하다
4. 같은 key + 같은 body → **최초 응답 그대로 재생**(`idFactory.next()` 를 다시 돌리지 않으므로
   `id` 까지 동일) / 같은 key + 다른 body → **`IDEMPOTENCY_KEY_REUSED`**(기존 Error Code,
   **신규 0건**) / 실패한 시도는 **보관하지 않는다**(`retry` 1회차 → 같은 key 재시도 성공)

대상은 **`Idempotency-Key` 필수인 비멱등 POST 2종**이다 (`shared/api/library-api.ts` 표):
`addOwnBook` · `createGiftRequest`. `saveBook`/`unsaveBook` 은 본래 멱등이고 IK 를 보내지 않으므로
그대로다 (`savedAt` 고정 맵이 이미 멱등을 보장한다).

**테스트 7건** (`apps/web/src/mocks/__tests__/MockLibraryApi.test.ts`, Stage 2 블록과 동일 구성):
재생(2) · 다른 body 거절(2) · 다른 key 분리(1) · `retry` 1회차 미보관(1) · **두 호출 보관함 분리**(1).
수단을 제거하면 **4건이 깨진다**(실측: 재생 반환 제거 → 2 FAIL, 보관 자체 제거 → 4 FAIL).

**남는 PENDING**: 서버 측 24h 보관은 그대로 `P3-BIP-22` 다 (§6).

### ③ `QA-3-006` (Low) — `P-23` dev gallery 등재

- `apps/web/src/dev/ui-gallery/provisionalItems.ts` — **`P-23`**(`--color-prompt-tag-fg`) 추가.
  `P-18`~`P-22` 는 **만들지 않았다** — 토큰 자체가 없어 등재 대상이 아니다 (approvals §26.5 가
  이 문서 §7 의 "`P-18`~`P-23` 6건" 기록을 정정했다)
- `apps/web/src/dev/ui-gallery/A11yPage.tsx` — 대비 쌍 **`C-5`**(`--color-prompt-tag-fg` on
  `--color-prompt-tag-bg`, 가값 `P-23`) 추가. 이 페이지의 규칙이 *"수치는 문서에서 옮겨 적지 않고
  **실제 렌더 결과에서 측정**한다"* 이고, 가값 재제시(Stage 0 `#10-4`)에는 측정값이 필요하다.
  `P-24` 가 `B-3` 을 갖는 것과 같은 짝이다. **a11y 페이지는 시각 baseline 이 없다** → 영향 0
- **재발 방지 (신규)** `apps/web/__tests__/provisional-registry.test.ts` — **토큰 소스를 기준**으로
  비교한다: `packages/design-tokens/src/**` 의 `provisional: P-xx` 주석 전수 ↔ dev gallery 목록.
  기존 단정(`gallery-helpers.test.ts`)은 "지금 목록이 이것이다" 라 **새 가값이 생겨도 알려주지
  않았다** — 그래서 `P-23` 이 한 라운드 내내 빠져 있었다

> ⚠️ 이 ③ 이 **`QA-3-006` 의 지시 범위를 한 칸 넘는다**: QA 의 `Suspected area` 는
> `provisionalItems.ts` 1개였고, `A11yPage.tsx` 의 `C-5` 와 재발 방지 테스트는 내 판단으로 넣었다.
> 근거는 `P-24` 선례(목록 + `B-3` 대비 행이 같이 들어왔다)와 가값 재제시의 성립 조건이다.
> **되돌리라면 되돌린다.**

### ④ `QA-3-007` (Low) — 이 문서 정정 2건

| 위치 | 정정 |
|---|---|
| **§3** | "Figma 에 없는데 구현한 것" 이 **9건 → 10건**. 빠진 것은 **캐릭터 버블 닫기(×) 버튼**(승인 근거 approvals **§13.4 `W-2`** + `stage-3-home-handoff.md` §B2). 경위: ①~⑨ 는 Library 라운드 산출물이고 ⑩ 은 **Home 라운드** 산출물이어서, 통합 입구를 만들 때 Home 라운드 메모에서 옮겨 적히지 않았다 |
| **§9 ⑨** | 전제가 **틀렸다**. *"Toast 가 실제로 마운트되는 Stage 3 화면이 없어 실행 증거가 없다"* → `ActivityCardDeck.tsx:49`(저장 실패)·`AddOwnBookForm.tsx:68`(등록 성공)이 **둘 다 띄운다**. 내가 **소스 가드(CSS 문자열)를 증거로 받아들이고 실행 측정을 생략**했고, 그 생략 때문에 `QA-3-004` 를 놓쳤다. QA 가 전제를 믿지 않고 직접 쟀기 때문에 드러났다 |
| **§7** | `S3-PROV-2` 블록 — 대상이 `P-18`~`P-23` 6건이 아니라 **`P-23` 1건**이었음을 반영하고 해소로 표시 |

### ⑤ 생성·수정 파일 (이 라운드)

```
수정  packages/ui/src/feedback/ToastProvider.tsx                     withTabBar prop → useToastTabBarInset 등록
수정  packages/ui/src/index.ts                                       useToastTabBarInset export
수정  apps/web/src/app/layouts/TabLayout.tsx                         tabBar 가 있을 때만 보정 등록
수정  apps/web/src/mocks/library/MockLibraryApi.ts                   IK 보관·재생 2종 (addOwnBook · createGiftRequest)
수정  apps/web/src/dev/ui-gallery/provisionalItems.ts                P-23 등재
수정  apps/web/src/dev/ui-gallery/A11yPage.tsx                       대비 쌍 C-5 (P-23)
수정  apps/web/src/app/layouts/__tests__/layouts.test.tsx            Toast 보정 배선 런타임 단정 5건
수정  apps/web/src/mocks/__tests__/MockLibraryApi.test.ts            IK 보관·재생 7건
수정  apps/web/src/dev/__tests__/gallery-helpers.test.ts             P-23 반영 (대기 6 → 7)
수정  apps/web/__tests__/stage3-css-guards.test.ts                   "선언 존재만 증명한다" 주석 + 런타임 포인터
수정  e2e/tabs.spec.ts                                               Toast ↔ 탭 hit-test 2건 (정·역방향)
신규  apps/web/__tests__/provisional-registry.test.ts                토큰 provisional 주석 ↔ gallery 목록 대조
수정  docs/qa/stage-3-handoff.md                                     §3 ⑩ · §7 · §9 ⑨ 정정 + 이 §14
```

**시각 baseline: 변경 0종.** `--update-snapshots=all` 전량 재생성 후 `git status e2e/__screenshots__`
가 **비어 있다**(74종 바이트 동일). Toast 를 담은 baseline 은 `v9-toast`(dev gallery 컷) 1종인데,
gallery 는 `BottomTabBar` 를 직접 렌더하고 `TabLayout` 을 쓰지 않아 **보정이 켜지지 않는다**.

### ⑥ 검증 명령 결과 (8/8)

| 명령 | 결과 |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ (의존성 변경 없음) |
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm lint:boundaries` | ✅ no dependency violations (587 modules · 2072 dependencies) |
| `pnpm format:check` | ✅ |
| `pnpm test` | ✅ **1611 passed** / 117 files (1596 → **+15**: Toast 배선 5 · IK 7 · 가값 가드 3) |
| `pnpm build` | ✅ |
| `pnpm test:e2e` | ✅ **273 passed** (271 → **+2**) · **단독 실행 5.7분** |
| `pnpm assert:no-mocks` | ✅ |
| `--update-snapshots=all` | ✅ 재생성 후 baseline diff **0종** |

`apps/api/` · `supabase/` **미생성** 재확인 (`ls apps` → `web` 만, `supabase` 없음).
