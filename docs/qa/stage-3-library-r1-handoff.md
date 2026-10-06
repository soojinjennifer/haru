# Stage 3 Library — 1라운드(토대) development-agent 인계 메모

Status: **구현 완료, QA 대기**
작성: development-agent · 2026-10-07
범위: **토대만**. 화면(Library 섹션 조립 · 시트 · `/library/add` · `/library/gift-requests`)은 **2라운드**다.
근거 문서: `docs/decisions/stage-3-approvals.md` §15–§20 (정본) ·
`docs/design/stage-3-library-design-spec.md` (APPROVED 2026-10-06) ·
`docs/plans/stage-3-library-plan.md` (APPROVED 2026-10-06)

---

## 1. Gate 확인

| 조건 | 결과 |
|---|---|
| `docs/plans/stage-3-library-plan.md` APPROVED | ✅ 2026-10-06 (approvals §20.1) |
| `docs/design/stage-3-library-design-spec.md` APPROVED | ✅ 2026-10-06 (approvals §20.1) |
| 이전 Stage QA PASS | ✅ Stage 2 (재구성 포함). Stage 3 Home 은 커밋 `9173b2b` 로 검증 완료 |
| Plan ↔ PRD / Figma 모순 | 신규 모순 없음. 발견한 문서 불일치 2건은 §8 |
| Plan In Scope 에 Backend 구현 없음 | ✅ `apps/api/` · `supabase/` 미생성 |

---

## 2. 구현 범위

### 2.1 토큰 14건 (`LT-1` ~ `LT-14`)

| ID | Tier | 토큰 | 값 | 비고 |
|---|---|---|---|---|
| `LT-1` | 2 | `--color-fg-tertiary` **재매핑** | `var(--haru-ink-400)` | `provisional: P-24` 주석 + dev gallery 등재 |
| `LT-2` | 2 | **`--radius-media`** 신설 | `12px` | radius **6 → 7단계** (Stage 0 `#10-②` 개정) |
| `LT-3` | 3 | `--book-cover-w-sm` · `-w-xl` · `-h-xl` | 34 / 64 / 90 | `lg` 는 퍼센트 폭이라 px 토큰 없음 |
| `LT-4` | 3 | **`--book-cover-radius-xl`** | `10px` | `--activity-card-cover-radius` 제거(간격 토큰 오용) — **값 동일, 렌더 변화 0** |
| `LT-5` | 3 | `--library-shelf-cover-aspect` | `107 / 151` | 0.7 로 흡수하면 블록이 2px 커진다 |
| `LT-6` | 3 | `--library-shelf-block-size` · `-indicator-gap` | 216px · `--space-4` | 실측 dots y=207 기준 |
| `LT-7` | 3 | `--sheet-inset-inline` · `-block-end` · `-radius` · `-pad` | 14 / 14+safe / 28 / 18 | `L-NEW-03` |
| `LT-8` | 3 | `--reading-now-text-gap` | `3px` | 2·4 동점이라 흡수 불성립 |
| `LT-9` | 3 | `--reading-now-progress-height` | `7px` | 6·8 동점. `ProgressBar` 에 size 를 추가하지 않는다 |
| `LT-10` | 3 | `--library-shelf-item-gap` | `--space-2` | Figma 7 → 8 흡수 |
| `LT-11` | 3 | `--book-list-row-height-min` | `74px` | media 행 최소 높이 |
| `LT-12` | 2 | `--color-scrim` **값 교체** | `rgb(0 0 0 / 0.34)` | 가값 `P-05` **해제** |
| `LT-13` | 3 | `--section-header-action-hit` | `--size-touch-min` | "See all" hit 44 |
| `LT-14` | 3 | `--library-entry-row-height-min` | `56px` | `--list-row-height-min` 과 같은 값이지만 **Tier 3 → Tier 3 참조 금지**라 리터럴 |

추가 2건 (Design Spec §8.1 레시피): `--sheet-content-shadow-inset-block-end: 10px` ·
`--sheet-content-shadow-inset-inline: 4px` — `--shadow-bubble` **픽셀 프로브 실측값**.

Tier 3 합계 **132 → 150** (19 추가 · 1 제거). semantic 신규 **1건**(`--radius-media`), 신규 HEX **0건**.

**바꾸지 않은 것** (Design Spec §5.3 "흡수"): `--color-divider`(ink600 12%) ·
`--color-progress-track`(12%) — Settings·온보딩 전역이라 값 변경 시 Stage 2 baseline 이 바뀐다.

### 2.2 설정 기본값 정규화 (`L-NEW-06` · `L-NEW-07`)

| 대상 | 전 (Stage 2 추정) | 후 (Figma 실근거) |
|---|---|---|
| `ListGroup` 면 | `--color-surface-strong` 90% | **`--color-surface-glass` 74%** (`30:140` `get_variable_defs`) |
| `ListGroup` 그림자 | `--shadow-glass-rest` (drop 3겹) | **`--shadow-bubble`** (drop 1겹) |
| `ListRow` 제목 | `--text-footnote` 13/18 | **`--text-subheadline` 15/20** (원문 `text-[14px]` → §3.3 흡수표) |

→ **Library 전용 변형(`tone="glass"` · `titleVariant`)은 만들지 않았다** (§4 참조).

### 2.3 Shared UI (`packages/ui`)

| 컴포넌트 | 처리 |
|---|---|
| **`SectionHeader`** 신규 | `action` 모드(`<button>`, hit 44) **+ `meta` 모드**(`<span>`, 비대화형) 두 모드. 접근성 이름은 `aria-labelledby`(자신 + 제목)로 `See all {섹션}` 을 만든다 — 문자열을 조립하지 않아 `packages/ui` 가 copy 를 갖지 않는다 |
| `Sheet` `variant="inset-card"` | 좌우/아래 inset 14(+safe) · radius 28 전체 모서리 · grabber 없음 · padding 18 · `max-inline-size = 480 − 28`. **`bottom`·`full` 외형 불변** |
| `Sheet` `contentShadowInset` | opt-in. `R-SHADOW-1` ② 레시피(padding 10/4 + 음수 margin). 기본 `false` |
| `ListRow` `media` · `meta` 슬롯 | media 가 있으면 최소 높이 56 → 74. meta 는 보조 1행 우측(`space-between`) |
| `BookCover` size 확장 | `sm`(34) · `md`(58, 기존) · `lg`(퍼센트 폭 · 비 107/151) · `xl`(64×90). lg·xl 은 `--shadow-cover` 포함 |

`packages/ui` 는 router 를 import 하지 않는다 (AC-1-25 유지) — `SectionHeader` 는 `onPress` 콜백만 받는다.

### 2.4 Contracts (`packages/contracts`)

**신규 schema 7** — `ReadingProgress` · `LibraryBook`(+`RenderableLibraryBook`) · `LibraryOverview` ·
`LibraryListRequest`/`Response` · `AddOwnBookRequest` · `CreateGiftRequestRequest`/`GiftRequest`/`GiftRequestListResponse` ·
`BookPromptsResponse`.
**신규 enum 3** — `LibrarySectionKey` · `LibraryFilter` · `BookSource` (enum 총 29 → **32종**).
**신규 error code 1** — `BOOK_ALREADY_OWNED`(409). `GIFT_REQUEST_DUPLICATE` 는 **기존 등재분**이다 (총 28 → **29종**).
**신규 endpoint 1** — `GET /v1/children/:childId/library/overview`.

**재사용(다시 선언하지 않음)**: `BookSummary` · `BookOwnership`(`favorite_only` 포함) ·
**`GiftRequestStatus`(6종 — 이미 존재. 전수 대조가 "enum 신규"로 잘못 적었다)** ·
`SaveBookTarget`/`SaveBookRequest`/`SavedBook` · `paginated()`/`CursorPageRequest` ·
`Id`/`IsoDateTime`/`Capability`/`PromptKind`/`AgeBand`/`ErrorEnvelope` · **`PromptSet`**.

지킨 결정
- `L-OPEN-20` — `PUT`/`DELETE …/saved-books` 응답은 **`SavedBook` 현행 유지**. 대가로 `libraryKeys.overview` 무효화·재조회를 Handoff 요구로 남긴다
- `averageRating` — **모집단은 해당 Child 의 세션 평점으로 한정**, nullable
- `ReadingProgress` — `progressRatio` 는 **서버 값**(프론트 계산 금지), `plannedNights` **nullable**
- **응답 필드에 길이 제약(`.max()`)을 걸지 않았다** — 남긴 제약은 "없으면 화면을 그릴 수 없는 것"뿐이다
  (`completedNights ≥ 0` · `plannedNights ≥ 1` · `progressRatio 0–1` · `averageRating 1–5`)

### 2.5 Mock + fixtures

`apps/web/src/mocks/fixtures/library.ts` 신규 · `MockLibraryApi` 확장 · `MockBooksApi.getPrompts` 추가.
시나리오 **6 → 18종**. 전부 결정적이며 시각은 주입 clock 의 상대 오프셋으로만 만든다
(`shared/lib/clock.ts` 에 `shiftedIso()` 추가 — Mock 소스가 `new Date(` 를 직접 쓰지 않게 하는 기존
`clockDate()` 선례와 같은 처리).

---

## 3. 검증 명령 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ 통과 (5 project) |
| `pnpm lint` | ✅ 0 problems |
| `pnpm test` | ✅ **112 files / 1459 tests** (신규 ~90) |
| `pnpm lint:boundaries` | ✅ no violations (558 modules / 1909 deps) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm assert:no-mocks` | ✅ sentinel 0건 (mock · dev · `haru-dev-` 3종) |
| `pnpm test:e2e` | ✅ **191 passed** (단독 실행) |

---

## 4. `ListGroup`·`ListRow` 변형 판단 — **불필요**

approvals §20.3 ③ 이 요청한 판단이다. **결론: 만들지 않았다.**

- `tone="glass"` 가 필요했던 이유는 "Library 는 74% + 1겹인데 기본값이 90% + 3겹" 이었기 때문이다.
  기본값을 Figma 실근거(`30:140`)로 정규화했으므로 **기본값 == Library 값**이 되어 변형이 가리킬 차이가 없다.
- `titleVariant` 도 같다 — 기본값이 `subheadline`(15) 이 되어 Book List 행과 같다.
- 변형을 남기면 **"기본값은 틀렸고 Library 만 맞다"** 는 잘못된 전제를 코드에 고정한다. Settings·온보딩도
  같은 Figma 심볼(`163:2145`)을 쓰므로 정규화가 그쪽에도 **옳은 값**이다.

`library-css-guards.test.ts` 가 변형이 되살아나는 것을 막는다 (`tone`·`titleVariant` 문자열 0건).

---

## 5. 시각 baseline — 재생성 4건 · 신규 5건

### 5.1 재생성 (`R-BASELINE-1` ⑤ — diff 를 픽셀 클러스터로 분해해 원인을 댔다)

| baseline | diff | 클러스터 | 원인 |
|---|---|---|---|
| `v9-text` | 315px (0.14%) · maxΔ **29** | 6개 — 전부 x 240–293 / y 413–428 | `tone="tertiary"` 샘플 텍스트 1개. Δ29/25/25 = `ink-500 #7d9291` → `ink-400 #9aabaa` **정확히 일치** (`LT-1`) |
| `v8-color-semantic` | 7684px (5.32%) | ① 156×48 maxΔ**29** = `--color-fg-tertiary` **swatch 칩** ② 37×10 maxΔ130 = 값 텍스트 `#7d9291` → `#9aabaa` ③ 1–2px 3개 = 같은 텍스트 줄의 안티앨리어싱 | `LT-1`. 크롭 이미지로 **눈으로 확인**했다 |
| `s2-listrow` | 289 → **293px (+4)** · 99 클러스터 | 큰 덩어리 = 세로 shift + 면 변화. 텍스트 클러스터 = 제목 재렌더. y=152/156 1px = divider 이동. y=16 1px Δ8 = **위쪽 그림자 소멸**(glass-rest 위 22 → bubble 위 0) | `L-NEW-06`·`L-NEW-07` |
| `s2-deck-books-favorites` | 17502px (6.28%) · 20 클러스터 | 333×208 Δ29 = 면 74%. 13px 높이 3개 Δ181 = 책 제목 3개 재렌더. y 285/502/507 띠 + 좌우/모서리 1–9px = **그림자 번짐 축소**(아래 78 → 10, 좌우 50 → 4) | 〃 |

**+4px 의 산술 검산** (`R-BASELINE-1` ⑥ — 런타임에서 원인을 토글해 재현했다. 임시 프로브 spec 으로
측정 후 삭제):

```
AFTER   blockHeight 293  bg rgba(255,255,255,0.74)  shadowLayers 3  title 15px/20px  rows [56,82,62,56]
BEFORE  blockHeight 289  bg rgba(255,255,255,0.90)  shadowLayers 5  title 13px/18px  rows [56,78,62,56]
```
- 2행만 78 → 82 (+4). 그 행의 제목은 폭 100.86px 에서 **2줄로 접힌다** → `(20 − 18) × 2줄 = +4` ✓
- 1·3·4행은 `min-block-size: 56` 또는 trailing(IconButton 38)이 높이를 정해 **변하지 않았다** ✓
- shadowLayers 5 → 3 = `glass-rest`(drop 3 + inset 2) → `bubble`(drop 1 + inset 2) ✓

→ **설명되지 않는 클러스터 0건.** 멈출 사유 없음.

### 5.2 신규 5건

| baseline | 내용 |
|---|---|
| **`s3-sheet-scrim`** | `/auth/sign-up` `SelectTrigger` 시트가 열린 전체 프레임 |
| **`s3-dialog-scrim`** | `/settings` 로그아웃 `ConfirmDialog` 가 열린 전체 프레임 |
| `s3-section-header` | gallery `action` · `action disabled` · `meta` · 슬롯 없음 4종 |
| `s3-book-cover` | `sm` · `md` · `xl` · `lg` |
| `s3-list-media` | media+meta 행 · `unrated` 행 · media 없는 행 |

scrim 2건은 approvals §19.4 가 지적한 **감시 공백**을 메운다 — 이전에는 열린 Sheet/Dialog/Scrim 을 담은
baseline 이 **0장**이라 scrim 값이 깨져도 잡는 테스트가 없었다.
`R-BASELINE-1` ① `settle()` 호출(두 화면 모두 **클라이언트 이동**이라 `gotoApp` 의 settle 을 거치지 않는다) ·
② `hideDevPanel` 적용(파일 `beforeEach`) 준수. 저장된 그림을 **눈으로 확인**했다 — 시트는 바닥에 붙어 있고
다이얼로그는 Cancel 포커스까지 정착한 상태다.

**Home baseline 7종은 1byte 도 바뀌지 않았다** — `--book-cover-radius-xl` = 10 이 구
`--activity-card-cover-radius`(= `--space-2-5` = 4×2.5 = 10)와 같은 값이기 때문이다 (가드 테스트가 이
산술을 검산한다).

---

## 6. Mock 시나리오 전환 방법

`?scenario=library:<key>` (여러 그룹은 쉼표: `?scenario=library:favorites-empty,books:loading`) ·
dev Scenario Panel(`/__dev` 우하단) · `sessionStorage['haru:scenario']`.

| key | 적용 호출 | 기대 |
|---|---|---|
| `success` | 전체 | 4섹션 전부 채움 (curated 9 · favorites 3 · finished 4 + readingNow) |
| `loading` | 전체 | 주입 timer 지연 → 섹션별 Skeleton |
| `empty` | overview · list · gift | 전체 0건 (`readingNow: null` + 3섹션 0건) |
| `error` / `retry` / `offline` | 전체 | Error Envelope / 1회차 실패 후 성공 / `NetworkError` |
| **`favorites-empty`** | overview | **저장 전 기본 상태** — Favorites 만 0건 |
| `finished-empty` · `curated-empty` | overview | 해당 섹션만 0건 |
| `reading-now-none` | overview | `readingNow: null` → 블록 미렌더 |
| `shelf-partial` | overview | 캐러셀 1권 |
| `unrated` | overview · list | `averageRating: null` |
| `user-entered-book` | overview | `book: null` + 제목만 |
| `gift-pending` | overview | `ownership: gift_pending` 행 |
| `gift-duplicate` | gift 생성 | `GIFT_REQUEST_DUPLICATE` |
| `paged` | list | `nextCursor` 2페이지 |
| `book-saved` · `unsave` | saved-books | 저장 시작 상태 / 해제 성공 |

⚠ 이 Adapter 는 **무상태**다(`savedAt` 멱등 맵만 예외) — `unsave` 후 `getOverview` 의 `Favorites` 가
줄지는 않는다. 상태화 여부는 화면이 생기는 2라운드 판단이다.

---

## 7. `BACKEND_INTEGRATION_PENDING` (신규·갱신)

| ID | 내용 |
|---|---|
| `P3-BIP-16` | 책 평점 집계 — **모집단 = 해당 Child 의 세션 평점으로 한정** (approvals §16.3) |
| `P3-BIP-17` | 다회차 진행 — **`progressRatio` 산식은 서버 소유**(프론트 계산 금지) · `plannedNights` 출처 미정(그래서 nullable) · "Reading now" 선정 규칙 |
| `P3-BIP-18` | 서재 섹션 **1회 조회**(`GET …/library/overview`) — 섹션별 호출 금지 |
| `P3-BIP-19` | 표지 에셋 교체 게이트 — **Stage 8 배포 전 필수** (`L-D4`). 현재 표지는 Figma 에서 가져온 Mock 전용 임시 에셋 |
| `P3-BIP-15` (갱신) | `saved`·`savedAt` 서버 소유 · 멱등 · `source=card_save` 기록. **저장/해제 응답은 `SavedBook` 유지**이므로 서버는 `libraryKeys.overview` 재조회가 최신 Favorites 를 돌려주도록 보장해야 한다 |
| `P3-BIP-03` · `P3-BIP-14` (참조 추가) | `GET /v1/books/:bookId/prompts` 가 같은 Prompt 생성 정책·페이지 앵커를 쓴다 |
| 신규 요구 | `BOOK_ALREADY_OWNED`(409) — 중복 등록을 오류로 할지 **멱등 응답**으로 할지는 Backend 가 택할 수 있다. Frontend 는 두 경로 모두 처리 가능하다 |
| 길이 요구 | `LibraryBook.book.title`·`userEnteredTitle` 등에 **schema 제약을 걸지 않았다**. 길이 상한은 **Backend 요구사항**으로만 남긴다 (`characterLine` 선례 — 응답 제약은 화면을 통째로 비운다) |

---

## 8. 보고 — 승인/확인이 필요한 항목

1. **Plan §7.2 의 `BookPrompts` 필드 목록이 낡았다.** `{ bookId, prompts, coachingLine, followUps }` 로
   적혀 있으나 세트 단위 `coachingLine` 은 approvals §12.14 로 **삭제**되었고 코칭 노트는
   `Prompt.coachingNote`(질문 1개당 1개)다. 되살리지 않고 **`PromptSet` 재사용**(`{ bookId, promptSet }`)으로
   구현했다. → Plan 쪽 기록 정정 필요.
2. **dev gallery `provisionalItems.ts` 에 `P-18`~`P-23` 이 없다.** 토큰 가값인 `P-23`
   (`--color-prompt-tag-fg`)이 목록에 빠져 있다 — **Stage 3 Home 라운드에서 생긴 기존 공백**이며 이번
   범위가 아니라 고치지 않았다. 가값 재제시(Stage 0 `#10-4`) 전에 메워야 한다.
3. **dev Scenario Panel 이 세로로 넘쳤다.** `library` 그룹이 6 → 18 키가 되면서 패널이 뷰포트를 넘어가
   위쪽 그룹을 누를 수 없었다(`scenarios.spec.ts` 실패). 패널 본문을 `max-block-size: 60dvh` +
   `overflow-y: auto` 로 바꿨다 — **dev 전용**이고 상자 안에 그림자 요소가 없어 `R-SHADOW-1` inset 이
   필요하지 않다(근거 주석 포함).
4. **Book List 행의 좌측 메타는 말줄임하지 않는다.** approvals §20.2 는 "제목만 말줄임 · 평점은 줄이지
   않는다" 만 정했다. 좁은 폭에서 좌측 메타를 자르면 `finished {date}` 가 사라지므로 **줄바꿈**을 택했다
   (행 높이는 최소값이라 늘어나도 된다 — `AD-S3-17`). 다른 판단을 원하면 알려 달라.

---

## 9. 2라운드로 넘긴 항목

- Library 화면 전부: `LibraryShelves`(4섹션 조립) · `BookShelfCarousel` · `BookShelfItem` ·
  `ReadingNowCard` · `BookListRow` · `LibraryShelfSheet` · `BookDetailSheet` · `LibraryEntryActions` ·
  `AddOwnBookForm` · `GiftRequestList` · `LibraryPage`/`AddOwnBookPage`/`GiftRequestsPage`
- `entities/library` query·mutation hook (`libraryKeys.overview`·`list`·`giftRequests`,
  `useLibraryOverview`·`useLibraryList`·`useAddOwnBook`·`useGiftRequests`·`useCreateGiftRequest`·`useBookPrompts`)
- `L-NEW-01` 캐러셀 `overflow-x` 예외 + **세로·가로 양축 픽셀 프로브 회귀 테스트**(`R-SHADOW-1` ⑥)
- `Sheet contentShadowInset` 의 **실제 사용처**(`LibraryShelfSheet`) + 보정 전/후 픽셀 프로브 회귀 테스트
- `shared/copy/library-copy.ts` 확장 (섹션 제목 · 상태 화면 문구 · 진입점 문구)
- 상태 화면 구현(Design Spec §7.4 표 전체) + 화면 단위 시각 baseline
- `AD-S3-5` 보완(역량 캡션 줄바꿈 규칙 — 11px 렌더 폭 **실측 필요**)
- `unsave` 후 `Favorites` 감소를 Mock 에서 상태로 재현할지 판단
