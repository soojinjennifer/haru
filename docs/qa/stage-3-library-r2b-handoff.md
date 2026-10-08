# Stage 3 Library — 2라운드-2(시트 2종 + 진입점 화면 2종) development-agent 인계 메모

| | |
|---|---|
| 범위 | `LibraryShelfSheet` · `BookDetailSheet` · `/library/add` · `/library/gift-requests` + `LibraryEntryActions` · `libraryKeys.giftRequests` · query/mutation hook |
| 선행 | 2라운드-1 `/library` 본 화면 (커밋 `0e1f338`) · `docs/qa/stage-3-library-r2-handoff.md` |
| 근거 | `docs/design/stage-3-library-design-spec.md` §3.7 · §3.8 · §3.9 · §6.1 · §7 · §8.1 · `docs/design/stage-3-design-spec.md` §2.8 · §2.9 · §2.11 · `docs/decisions/stage-3-approvals.md` §8.2 · §13.10 · §17.1 · §17.2 · §18.4 · §19.5 · §21.4 · §22 · §23 |
| 결과 | 8/8 검증 명령 통과 — `test` **1559** · `test:e2e` **238 passed** |

---

## 1. Gate 확인

| 항목 | 결과 |
|---|---|
| Plan `APPROVED` | ✅ `docs/plans/stage-3-library-plan.md` (approvals §20.1) |
| Design Spec `APPROVED` | ✅ `docs/design/stage-3-library-design-spec.md` (approvals §20.1) |
| 직전 단계 통과 | ✅ 2라운드-1 Orchestrator 검증 통과 (approvals §22) |
| Plan ↔ PRD/Figma 모순 | 없음. Figma 없는 화면은 `C-13` ②로 승인됨 (`L-OPEN-12`·`L-OPEN-13`) |
| Backend 구현 작업 | 없음. `apps/api/` · `supabase/` **미생성 확인** |

---

## 2. ⭐ `--shadow-bubble` 번짐 **재측정**과 시트 본문 inset

### 2.1 방법 (`rules/frontend.md` §6-1 ③)

1. 측정 CSS 는 **빌드 산출물** `apps/web/dist/assets/index-*.css` 다.
   (`packages/design-tokens/dist/index.css` 는 `@theme static` 소스 번들이라 브라우저가 무시하고 `boxShadow: none` 이 나온다.)
2. 순백 배경 위 345×297 `.haru-list-group`, `deviceScaleFactor: 1`.
3. `getComputedStyle().boxShadow` 를 **괄호 깊이로 분리**해 겹을 전수 확인.
4. 상자 바깥으로 1px 씩 Δ(RGB 채널차 합) 프로파일 측정.

### 2.2 결과 — 1라운드 등록값과 **일치**

`--shadow-bubble` = drop **1겹** `color(srgb .3686 .4510 .4392 / 0.08) 0 6px 4px` + inset ×2. 빠뜨린 겹 없음.

| 임계값 | 위 | 아래 | 좌 | 우 |
|---|---|---|---|---|
| **Δ≥1 (채택)** | **0** | **10** | **4** | **4** |
| Δ≥8 | 0 | 8 | 2 | 2 |

프로파일(아래) `35,35,32,31,28,19,16,10,4,3,0,…`
산술 검산: 아래 6+4=10 ✓ · 위 −6+4<0 → 0 ✓ · 좌우 ±4 ✓
→ `--sheet-content-shadow-inset-block-end: 10px` · `-inline: 4px` 그대로 쓴다.

**방법 검정**: 같은 방법으로 `--shadow-glass-rest`(3겹)를 재면 **아래 78 · 위 22 · 좌우 50** — 기존 기록을 재현한다.

### 2.3 보정 전/후 프로브 — **실제 시트에서** 측정

393×852 · 시트 본문을 끝까지 스크롤한 상태 (목록 하단 기준 Δ):

| | 아래 +0…+12 | 우 +0…+6 |
|---|---|---|
| 보정 **있음** | `55 47 39 31 28 25 16 16 10 4 3 0 0` → **10px 복원** | `0 16 10 4 3 0 0` → **4px 복원** |
| 보정 **없음** | `22 0 0 0 0 0 0 0 0 0 0 0 0` → **완전 절단** | `0 0 0 0 0 0 0` → **완전 절단** |

(`아래+0` 은 상자 **안쪽** 마지막 픽셀이라 inset 겹 때문에 0 이 아니다 — 양쪽 모두.)

회귀 테스트: `e2e/shadow.spec.ts` — **보정 있음**(4폭) + **보정 없음**(4폭) 양방향. 보정이 지워지면 전자가, 프로브가 무의미해지면 후자가 실패한다.

⚠️ **측정 함정 1건 추가 기록**: 보정을 런타임에서 제거하면 Chrome 의 **scroll anchoring** 이 `scrollTop` 을 되돌려 목록 하단이 클립 선에서 2~3px 떨어진 채 측정된다(실측 프로파일 `55,16,7,2,0…`). `scrollSheetContentToBottom()` 이 프레임마다 다시 대입하고 **최댓값 도달을 단언**한다.

### 2.4 시트 **자신**에게는 inset 이 필요 없다

approvals §19.5 그대로 확인했다 — `createPortal(body)` + `position: fixed`, 조상에 `transform`/`filter`/`contain` 없음. 393 에서 좌우 번짐 50 중 36 이 뷰포트 밖으로 나가지만 클립 선이 **화면 가장자리**라 보이지 않는다.

### 2.5 `BookDetailSheet` 에는 `contentShadowInset` 을 켜지 않았다

본문 자식 중 **본문 폭을 꽉 채우는 drop shadow 상자가 없다**: `PromptPill` 은 `inset` 전용(outline) 또는 면(tinted)이다. 대신 표지(`--shadow-cover`, 번짐 위 8 · 아래 20 · 좌우 14)에 **자리별 inset** 을 줬다 (`.haru-book-sheet__cover`).

---

## 3. 구현 범위

### 3.1 신규 파일

```
packages/ui/src/sheet/Sheet.tsx            — `footer` 슬롯 추가 (§5.1)
apps/web/src/entities/book/useBookPrompts.ts
apps/web/src/entities/library/useLibraryList.ts        (useInfiniteQuery)
apps/web/src/entities/library/useGiftRequests.ts
apps/web/src/entities/library/useAddOwnBook.ts
apps/web/src/entities/library/useCreateGiftRequest.ts
apps/web/src/entities/library/useToggleLibrarySave.ts  (§5.2)
apps/web/src/features/library/LibraryShelfSheet.tsx
apps/web/src/features/library/BookDetailSheet.tsx
apps/web/src/features/library/LibraryEntryActions.tsx
apps/web/src/features/library/AddOwnBookForm.tsx
apps/web/src/features/library/GiftRequestList.tsx
apps/web/src/features/library/StartSessionAction.tsx
apps/web/src/features/library/bookDisplay.ts
apps/web/src/pages/library/{AddOwnBookPage,AddOwnBookTopBar,GiftRequestsPage,GiftRequestsTopBar}.tsx
apps/web/__tests__/library-sheets.test.tsx             (17)
apps/web/__tests__/library-entry-screens.test.tsx      (13)
e2e/__screenshots__/darwin/visual.spec.ts/s3-library-{shelf-sheet,book-sheet,entry-actions,add,gift-requests}.png
```

### 3.2 수정 파일

```
packages/ui/src/sheet/Sheet.css              — inset-card `inline-size: auto`(결함 수정 §7.1) · 하단 pad 16 · footer
apps/web/src/entities/activity-card/SaveButton.tsx  — `disabled` prop (§6.2)
apps/web/src/entities/book/{BookShelfItem,BookListRow}.tsx · book-shelf.css — `onPress` · meta 선택화
apps/web/src/entities/book/{bookKeys,index}.ts
apps/web/src/entities/library/{ReadingNowCard.tsx,library.css,libraryKeys.ts,index.ts}
apps/web/src/features/library/{LibraryShelves.tsx,library.css,index.ts}
apps/web/src/pages/library/{LibraryPage.tsx,index.ts}
apps/web/src/app/router.tsx · shared/config/routes.ts
apps/web/src/shared/copy/library-copy.ts
apps/web/src/mocks/library/MockLibraryApi.ts         — `book-already-owned` 시나리오
docs/API_CONTRACTS.md                                — §5.4 catalogue 에 `book-already-owned` 등재
apps/web/__tests__/{library-screen,library-css-guards}.test.* · src/mocks/__tests__ · src/dev/__tests__
e2e/{library,shadow,visual}.spec.ts
```

### 3.3 데이터 경로 (Component → hook → API Client → Adapter)

```
LibraryShelfSheet → useLibraryList      → libraryApi.getList          → Mock | Http
BookDetailSheet   → useBookPrompts      → booksApi.getPrompts         → Mock | Http
                  → useToggleLibrarySave→ libraryApi.save/unsaveBook  → Mock | Http
                  → useCreateGiftRequest→ libraryApi.createGiftRequest→ Mock | Http
AddOwnBookForm    → useBookSearch       → booksApi.search             → Mock | Http
                  → useAddOwnBook       → libraryApi.addOwnBook       → Mock | Http
GiftRequestList   → useGiftRequests     → libraryApi.getGiftRequests  → Mock | Http
```

Component 가 Adapter 를 직접 부르는 곳 **0건**, fixture import **0건** (`lint:boundaries` · `mock-source-rules` 통과).

---

## 4. 전환·상태 구현

| 트리거 | 결과 | 근거 |
|---|---|---|
| "See all" | `LibraryShelfSheet`(섹션 제목·filter) | §6.1 |
| 캐러셀 항목 · Book List 행 · `Reading now` 카드 | `BookDetailSheet` | §6.1 |
| Shelf 행 | `BookDetailSheet` **교체 전환** (Shelf 를 닫지 않는다) | §2.9 |
| `BookDetailSheet` 닫기 | 들어온 경로로 복귀 — Shelf 에서 왔으면 **Shelf 복귀** | §2.9 (4) |
| 진입점 행 | `/library/add` · `/library/gift-requests` route 이동 | §7.1 |

시트는 **동시에 하나만** 보인다 (scrim 2겹 방지) — `LibraryShelfSheet.open = shelf !== undefined && book === undefined`.

상태 화면: Shelf 시트 Loading(Skeleton 4행)·Empty·Error/Offline(+Retry 1개)·추가 로드(Skeleton 2행) / BookDetail Prompt Loading·Error(+Retry)·조회 불가(카탈로그 외 책) / `/library/add` 검색 Loading·Empty·Error·중복 / `/library/gift-requests` Loading·Empty·Error.

---

## 5. Shared UI 변경 2건 (⚠️ 승인 대상 — §7.2·§7.3)

### 5.1 `Sheet` `footer` 슬롯 **신규**

Figma `163:1898`·`145:1085` 의 `Button/card` ActionBar 는 **카드 하단에 고정**이고 목록만 스크롤한다 `[실측]`. 본문(`overflow-y: auto`) 안에 두면 ① 스크롤 시 CTA 가 사라지고 ② 목록이 스크롤 박스의 바닥에 닿지 않아 **그림자가 잘릴 자리 자체가 없어져** `contentShadowInset` 이 무의미해진다(실제로 처음 구현에서 그렇게 됐고 프로브가 잡아냈다).
`footer` 를 주지 않으면 **아무것도 렌더하지 않는다** → `bottom`·`full` 시트 외형 불변 (`s3-sheet-scrim`·`s3-dialog-scrim` baseline 바이트 동일로 확인).
동반 CSS: `.haru-sheet--inset-card .haru-sheet__content { flex: 1 1 auto; min-block-size: 0 }` — **`inset-card` 에만** 건다.

### 5.2 `entities/library/useToggleLibrarySave` **신규** (Home hook 미수정)

사용자 결정은 *"Home `useToggleSavedBook` **수정 금지**, Library 는 **목록 재조회**"* (approvals §18.4) 다. 그 hook 은 `activityCardKeys.today` 를 낙관적으로 패치하고 `libraryKeys.saved` 만 무효화하는데, `saved` 는 `overview` 를 prefix 로 덮지 않는다(`P3-BIP-15`). 콜백을 더하면 Home 경로 코드가 바뀌므로 **정책이 다른 두 번째 hook** 을 뒀다 — `libraryKeys.all` 무효화. 중복되는 것은 mutation 배선뿐이고 타입은 contracts 하나다. **`useToggleSavedBook` 과 Home 코드 변경 0건.**

---

## 6. 판단한 항목 (근거 포함 — 확인 요청)

### 6.1 Shelf 시트 ActionBar 의 두 버튼을 **둘 다 `aria-disabled`** 로 뒀다
Figma `163:1898`(`type=shelf`)에 ActionBar 가 실재하므로 **빼지 않고 그린다**(approvals §17.2). 그런데 이 변형에는 **선택된 책이 없다** — 행 탭은 선택이 아니라 교체 전환이고(§6.1) `type=selected` 변형은 **미구현**(확정 결정)이다. 저장 대상이 없으므로 `★ Save` 도 `Start Session` 과 같은 방식(`D-3`: 설명 슬롯이 비면 설명 없이 `aria-disabled`)으로 뒀다. 실제 저장은 `BookDetailSheet` 에서 한다.

### 6.2 `SaveButton` 에 `disabled` prop 추가
6.1 을 구현하는 수단. 기본 `false` → Home 호출부 동작·렌더 불변 (Home baseline 7종 바이트 동일).

### 6.3 시트 Error 를 `ErrorState` **1개**로 (본 화면 선례와 같은 판단)
본 화면은 단일 조회라 1개로 뒀고 Orchestrator 가 수용했다(§22.2 ①). 시트는 **조회 구조가 다르다** — 시트 하나당 목록 조회가 **하나**(`useLibraryList(section)`)이므로 애초에 `ErrorState` 가 1개뿐이다. 그래서 §7.4 의 "본문 자리에 `ErrorState` + Retry" 를 **그대로** 따랐고, 본 화면처럼 명세를 벗어난 축약이 아니다. `/library/gift-requests` 도 조회 1개 → `ErrorState` 1개.
공통 규칙으로 지킨 것: **실패를 빈 상태로 보여 주지 않는다**(`isError` 를 Empty 보다 **앞**에 둔다). 테스트가 "Error 일 때 Empty 문구가 없다" 를 고정한다.

### 6.4 "See all" 시트 행의 좌측 부제 — 세션 0회면 **저자명**
`finishedMeta` 를 그대로 쓰면 큐레이션 전체 목록에 `0 sessions` 가 찍힌다. 횟수 0 은 정보가 아니고 결핍처럼 읽힌다. `bookCaption` 이 `L-OPEN-15` 에서 쓰는 **저자명 대체 규칙**을 같은 자리에 적용했다. Figma 에 "See all" 시트 행 부제의 근거가 없다 → **보고 대상**.

### 6.5 `/library/add` 검색 입력을 `FieldGroup` 으로 감쌌다
`TextField` 는 "`FieldGroup` 카드 안의 한 행" 으로 정의돼 있다(Stage 2 §4.13). 카드 없이 두면 라벨·입력선이 배경 위에 떠서 아래 직접 입력 블록과 모양이 어긋난다(첫 baseline 에서 육안 확인).

### 6.6 `/library/gift-requests` 상태 라벨
`GiftRequestStatus` 6종을 **`Tag tone="neutral"` 하나**로 그리고 뜻은 라벨 텍스트가 전달한다(색 의존 금지). `rejected` → **`Not approved`** (요청의 처리 결과이며 아이·보호자 판정이 아니다). 전부 `RECOMMENDED`.

---

## 7. Figma / 명세와의 차이 — **승인 필요**

### 7.1 (결함 수정) `inset-card` 가 393 에서 **오른쪽으로 14px 넘쳤다**
1라운드가 남긴 결함이다: base 의 `inline-size: 100%` 때문에 `position: fixed` + `inset-inline: 14` 의 오른쪽 값이 무시되어 폭이 393 이 되고 `right = innerWidth + 14` 가 됐다(실측). 시트가 처음 쓰이면서 드러났다. **`inline-size: auto`** 로 고쳤다 → 393 에서 365(= 393 − 28), 1024 에서 452. e2e 기하 테스트가 고정한다.

### 7.2 `BookDetailSheet` 에서 `ActivityOptionCard` 를 **재사용하지 못했다**
Design Spec §3.8 은 "같은 규격 → 재사용" 을 적지만, 그 컴포넌트는 `ActivityCardOption` 을 받는다. 서재가 가진 것은 `LibraryBook` + `BookPromptsResponse` 이고 **`reason`(추천 이유) · `position` · `kind` 가 없다**. `reason` 은 서버가 만든 문장이라 Frontend 가 지어낼 수 없다(`rules/frontend.md` §8). 그래서 같은 하위 부품(`BookCover` · `PromptPill` · `SaveButton`)으로 같은 구성을 만들되 **추천 이유 줄을 렌더하지 않는다**.
→ Figma 요소 1개를 빼는 것이다(최우선 규칙 #3). contract 에 `reason` 을 추가할지는 **사용자 결정 사항**.

### 7.3 `BookDetailSheet` 헤더 구성
Figma 카드의 `Cardtitle` 행에는 역량 Tag + flip 아이콘이 있고 제목은 본문에 있다. 시트에서는 그 행이 `Sheet` 헤더이고 trailing 은 **닫기 `IconButton`** 으로 확정돼 있다(§4.5 · `stage-3-design-spec.md` §2.8). 그래서
① 책 제목을 헤더로 올렸다(타이포는 Figma 카드 제목과 같은 `headline`),
② 역량은 본문 부제 `저자 · 역량` 으로 보인다(`ReadingNowCard` 와 같은 규칙),
③ **flip 아이콘을 넣지 않았다** — 24×24 슬롯이 하나이고 닫기가 그 자리를 쓴다.
③ 때문에 **코칭 노트(`Prompt.coachingNote`)를 렌더하지 않는다** — 접힌 자리를 만들면 Figma 에 없는 UI 를 추가하게 된다. 전부 보고 대상.

### 7.4 증정 블록의 위치
`stage-3-design-spec.md` §2.9 는 ActionBar 안에 신청 CTA 를 둔다. Figma 의 `Button/card` 는 **329×45 1행**이라 버튼을 더 넣으면 그 요소가 달라진다. 그래서 신청 CTA·접수 안내는 **본문 마지막 블록**으로 뒀다.

### 7.5 `/library/add` 결과 행의 등록 버튼 크기
§7.2 는 `Button size=sm` 을 적지만 `ButtonSize` 는 `md`(45) · `lg`(56) 둘뿐이다(Stage 1 `S1-D1-2` — Spec 에 없는 크기를 만들지 않는다). `md` 를 썼다.

### 7.6 `D-15` 접수 안내를 두 자리에서 **같은 문구**로 쓴다
`BookDetailSheet` 신청 직후와 `/library/gift-requests` 상단. approvals §8.2 가 잠정 문구 1개를 정했고 운영 확정 시 **copy 모듈 값만** 교체한다.

---

## 8. 시각 baseline

### 8.1 신규 5건 — 저장 후 **눈으로 확인**

| baseline | 내용 | 확인한 것 |
|---|---|---|
| `s3-library-shelf-sheet` | 떠 있는 카드 365×798 · 제목 + 닫기 · 9행 목록 · 고정 ActionBar | 좌우 inset 14 · 네 모서리 28 · grabber 없음 · 두 버튼 비활성 톤 |
| `s3-library-book-sheet` | 표지 + `저자 · 역량` + Prompt pill 7개(PRE/POST/P.6/P.12 배지) + ActionBar | Prompt 도착 **후** 프레임 (Skeleton 아님) |
| `s3-library-entry-actions` | 진입점 2행 + chevron | 탭바 겹침 ≤ 0 단언 포함 |
| `s3-library-add` | 검색 FieldGroup · `or` · 직접 입력 · CTA 비활성 | 첫 생성본에서 **검색 입력이 카드 없이 떠 있던 것**을 잡아 §6.5 로 수정 후 재생성 |
| `s3-library-gift-requests` | 접수 안내 + 2행(Shipped / Requested) | 상태 라벨이 색이 아니라 **텍스트**로 보인다 |

### 8.2 재생성 2건 — 원인 **전부 규명**, 설명되지 않는 클러스터 0건

| baseline | Δ | 원인 |
|---|---|---|
| `s3-library-empty` | 30,826px | `LibraryEntryActions` 블록이 **뷰포트 안에 들어왔다**. 빈 상태는 내용이 짧아 하단이 보인다 |
| `s3-library-list` | 198px(임계값 기준) / Δ≥1 93,036px · **채널 최대 Δ 8** | 목록이 더 이상 마지막 블록이 아니라 **스크롤 위치가 바뀌었다** → 반투명 glass 면 뒤의 배경 gradient 가 달라져 **영역 전체가 균일하게** 미세 변화(클러스터 1개) + 글리프 AA 클러스터 9개(최대 35px, 전부 텍스트 좌표) |

**런타임 토글로 원인을 확정했다** (`R-BASELINE-1` ⑥): 진입점 블록을 `display: none` 으로 흐름에서 빼고 같은 절차로 찍으면 두 baseline 모두 **커밋본과 0 픽셀 차이**였다.
→ 같은 실험이 **대화형 전환(`<div>` → `<button>`)이 rest 렌더를 바꾸지 않았다**는 증거이기도 하다. `s3-library` · `-reading-now` · `-shelf` 는 캐러셀 항목·카드가 버튼이 된 뒤에도 **무변경 통과**했다.

### 8.3 그 밖의 baseline — **재생성 0건**

`pnpm test:e2e --update-snapshots=all`(= 스테일을 드러내는 모드, `R-BASELINE-1` ③-1) 후 `git status` 에 위 7건 외 **변경 0건**. Home 7종 · `s3-sheet-scrim` · `s3-dialog-scrim` 포함 전부 바이트 동일.

---

## 9. 검증 명령 결과 (8/8)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ 5 project |
| `pnpm lint` | ✅ 0 problems |
| `pnpm lint:boundaries` | ✅ no violations (586 modules / 2063 deps) |
| `pnpm test` | ✅ **116 files / 1559 tests** (2라운드-1 114/1511 → **+2 files / +48**) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm assert:no-mocks` | ✅ sentinel 3종 × 4파일 0건 |
| `pnpm test:e2e` | ✅ **238 passed** (단독 실행, 2라운드-1 217 → **+21**) |

`pnpm install --frozen-lockfile` 은 **의존성 변경이 없어** 실행하지 않았다 (`package.json`·lockfile 무변경).

신규 테스트: `library-sheets.test.tsx`(17) · `library-entry-screens.test.tsx`(13) · `library-css-guards.test.ts` +12 · `library-copy.test.ts` +6 · `MockLibraryApi.test.ts` +1 · `e2e/library.spec.ts` +8 · `e2e/shadow.spec.ts` +8 · `e2e/visual.spec.ts` +5.

---

## 10. Mock 시나리오 전환 방법

2라운드-1 과 동일하다 — `?scenario=library:<key>` · dev Scenario Panel(`/__dev` 우하단) · `sessionStorage['haru:scenario']`.
⚠️ `/library` 로 직접 `goto` 하면 인증을 잃는다. 시나리오는 **로그인 화면 URL 에 심고**(`/auth/log-in?scenario=library:empty`) 탭으로 이동한다.

이번 라운드에 **화면으로 확인된** key:

| key | 화면 |
|---|---|
| `success` | 두 시트 · 진입점 · 두 하위 화면 전부 |
| `paged` | Shelf 시트 1페이지 + sentinel 로 추가 로드 (`IntersectionObserver`) |
| `empty` | Shelf 시트 안내 · 증정 목록 안내 |
| `error` / `offline` / `retry` | Shelf 시트 · 증정 목록 · 검색 — 각각 `ErrorState` + Retry **1개** |
| `gift-pending` | `BookDetailSheet` 접수 안내 + 상태 `Tag` |
| `gift-duplicate` | 신청 → `GIFT_REQUEST_DUPLICATE` → `InlineAlert tone=info` |
| **`book-already-owned`** (신규) | `/library/add` 중복 등록 안내 |
| `user-entered-book` | `BookDetailSheet` — Prompt **미조회** + 안내 문구 |
| `books:empty` | `/library/add` 검색 결과 0건 → 직접 입력 경로 |

`book-saved` · `unsave` 는 `BookDetailSheet` 의 `★ Save` 경로로 이어지며, 저장 성공 후 **`libraryKeys.all` 무효화 → overview 재조회**를 테스트가 고정한다.

---

## 11. `BACKEND_INTEGRATION_PENDING`

| ID | 내용 |
|---|---|
| `P3-BIP-15` (해소 경로 확정) | 저장/해제 응답은 `SavedBook` **현행 유지**. 서재는 `libraryKeys.all` 무효화 → **재조회**로 최신 `Favorites` 를 받는다. 서버는 저장 직후 `overview` 가 **즉시 일관**되어야 한다 (read-after-write) |
| `P3-BIP-16` · `P3-BIP-17` · `P3-BIP-18` · `P3-BIP-19` | 2라운드-1 그대로 유지 |
| 신규 `P3-BIP-20` | **커서 페이지네이션** — `GET …/library?filter=&limit=&cursor=` 의 `nextCursor` 는 불투명 문자열이고 **같은 정렬에서 중복·누락이 없어야** 한다. 화면은 시트 하단 도달 시 자동으로 다음 페이지를 요청한다 |
| 신규 `P3-BIP-21` | **`BOOK_ALREADY_OWNED`(409)** — 같은 책을 다시 등록하면 서버가 이 코드를 돌려줘야 한다. 화면은 오류가 아니라 **안내**로 처리한다 |
| 신규 `P3-BIP-22` | **`Idempotency-Key`** — `POST …/library/books` · `POST …/gift-requests` 는 필수. 같은 키 재시도는 **최초 응답을 재생**해야 한다 |
| 신규 `P3-BIP-23` | **`GET /v1/books/:bookId/prompts?childId=`** — 아이의 연령대·역량에 따라 세트가 달라진다. 카탈로그에 없는 책(`LibraryBook.book === null`)에는 세트가 없으며 화면이 호출하지 않는다 |
| 신규 `P3-BIP-24` | **증정 요청 상태 전이** — `requested → approved → shipped → delivered` / `cancelled` · `rejected`. 화면은 상태를 **라벨 텍스트**로만 표시한다. 전이 규칙·알림은 서버 소유 |
| 신규 `P3-BIP-25` | **`LibraryBook.purchaseUrl`** — 있으면 `Where to buy` 외부 링크가 뜬다. 안전한(허용 도메인) URL 보장은 서버 책임 |

---

## 12. Scope 경계에서 보류한 항목

| 항목 | 이유 |
|---|---|
| `D-17` **Mock 전용 route**(`app/router/mockPreviewRoutes.tsx`) | 지시된 4개 산출물에 없다. `D-17` 제약 ②("route 가 사라져도 부모 화면 상태로 동작")는 **이미 충족** — 시트 열림 상태를 `LibraryShelves` 가 소유하고 route 는 존재하지 않는다. 추가는 비파괴적이므로 다음 지시에서 올릴 수 있다 |
| `ReadingContextSheet` | Stage 3 에서 **이월** (approvals §12.3 ⑧) |
| `My Saved` · `Selected` 시트 변형 | **미구현** 확정 결정. 테스트가 부재를 고정한다 |
| `Start Session` 활성화 | `D-3` 비활성 유지 (approvals §13.10) |
| 증정 목록 더 보기 | Figma·명세에 없다. `hasMore` 는 hook 에 노출만 해 뒀다 |
| 코칭 노트 뷰 | §7.3 ③ — 승인 필요 |

---

## 13. QA 가 재현할 수 있는 핵심 경로

1. 로그인 → Library 탭 → "See all Our curated shelf" → 시트 기하(좌우 14 · radius 28 · 하단 pad 16) · 목록 스크롤 · ActionBar 비활성
2. 시트 행 탭 → `BookDetailSheet` 교체 → 닫기 → **Shelf 복귀**
3. 캐러셀 항목 탭 → `BookDetailSheet` → `★ Save` → 라벨 즉시 `Saved` → `PUT …/saved-books` → overview 재조회
4. `?scenario=library:gift-duplicate` → `BookDetailSheet`(Favorites 항목) → `Request this book` → 중복 안내
5. 진입점 → `/library/add` → 검색 / 직접 입력 → `/library` 복귀 + Toast
6. `?scenario=library:book-already-owned` → 직접 입력 → 중복 안내(화면 유지)
7. 진입점 → `/library/gift-requests` → 접수 안내 + 상태 2건 / `library:empty` → 안내 / `library:error` → Retry 1개
