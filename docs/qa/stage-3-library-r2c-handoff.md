# Stage 3 Library — 2라운드-3(`BookDetailSheet` 보완 2건) development-agent 인계 메모

| | |
|---|---|
| 범위 | **① 추천 이유 `reason` contract 추가 · ② 코칭 노트 뒷면(뒤집기)** — 그 두 건만 |
| 선행 | 2라운드-2 (커밋 `6a66fb9`) · `docs/qa/stage-3-library-r2b-handoff.md` §7.2 · §7.3 |
| 근거 | 사용자 결정 2026-10-09 (`L-R2B-01` · `L-R2B-02`, `docs/decisions/stage-3-approvals.md` §24.1) · Design Spec §3.8 · `stage-3-home-figma-audit.md` §11.5(`86:482`) · `rules/frontend.md` §6-1 `R-SHADOW-1` |
| 결과 | 8/8 검증 통과 — `test` **1580**(1559 → +21) · `test:e2e` **251 passed**(238 → +13) |
| 손대지 않은 것 | **Home 코드 0건** · `LibraryShelfSheet` · 진입점 · `/library/add` · `/library/gift-requests` · `ListGroup`/`ListRow` 기본값 · `useToggleSavedBook` · `packages/ui` **0건** |

---

## 1. ① 추천 이유 — `BookPromptsResponse.reason` 에 뒀다

### 1.1 선정 근거 (`LibraryBook` 이 아닌 이유)

| 근거 | 내용 |
|---|---|
| 1 | **그리는 화면이 하나다.** `LibraryBook` 은 overview · "See all" 목록 · 캐러셀 · `Reading now` 가 공유하는 **행 표현**이고 그 어디에도 이유 줄이 없다 (Design Spec §3.3 · §3.5). 거기에 두면 **표시하지 않는 생성 문장**이 목록 페이지마다 실려 나간다 (생성 비용 · 2초 NFR `P3-BIP-10` 과 같은 지연 위험) |
| 2 | **범위가 같다.** 이유는 *아이 + 책 + 큐레이션* 값이고, 그 범위를 이미 가진 요청이 `GET /v1/books/:bookId/prompts?childId=` 다(응답 `PromptSet.ageBand`·`capability`). 서재 행(`child_books`)에는 큐레이션 맥락이 없다 |
| 3 | **시트에 책 상세 endpoint 가 없다.** 시트가 쓰는 detail 조회는 이 호출 하나다 → **표시하는 시점에 정확히 한 번** 받는다 |
| 4 | **새로운 레이아웃 이동이 없다.** 시트 높이는 Prompt 도착 시점에 이미 한 번 바뀐다(Skeleton → pill 목록). 이유가 같은 응답에 실려 오므로 **같은 한 번**에 흡수된다 |

대가(기록): 카탈로그에 없는 책(`LibraryBook.book === null`)은 이 호출을 하지 않으므로 **이유도 없다.** 그 책에는 큐레이션 근거 자체가 없으므로(같은 이유로 `capability` 도 `null`) 의도된 결과다.

### 1.2 제약

```ts
reason: z.string().min(1).nullable().optional(),   // packages/contracts/src/books/prompts.ts
```

- **`.max()` 없다** (`characterLine` 선례, approvals §13.3). 4,000자도 parse 된다 — 테스트가 고정한다.
- `null`·필드 생략 모두 → 화면은 **줄을 렌더하지 않는다.** 빈 문자열·대체 문구를 만들지 않는다.
- `LibraryBook` 에는 `reason` 을 **두지 않았다** — 테스트가 부재를 고정한다.

### 1.3 화면

Figma `145:1085` 책 블록의 3번째 줄 자리다 — 표지 오른쪽 텍스트 열(`저자 · 역량` 아래). `Text variant="footnote"`, 말줄임 없음.

---

## 2. ② 코칭 노트 — 뒤집기

### 2.1 어포던스: **헤더 trailing 의 두 번째 `IconButton`** (`[flip][닫기]`)

- `Sheet.trailing` 은 `ReactNode` 다 → **`packages/ui` 수정 0건**으로 두 버튼을 넣었다. `.haru-sheet__trailing` 의 레이아웃 선언을 바꾸면 Stage 2 시트 baseline 이 움직이므로 건드리지 않고, feature 쪽 래퍼(`.haru-book-sheet__header-actions`)가 가로 배치를 갖는다.
- **닫기는 바깥쪽(모서리) 자리를 그대로 지킨다.** 시트를 닫는 방법은 그대로다 (테스트가 순서와 동작을 고정).
- 아이콘은 Home 과 **같은** `haru:flip-to-back`, `aria-pressed` 로 상태를 알리고, 라벨은 Home 카드와 **같은 문구**(`Show prompts and coaching notes` / `Show the book`)다.
- gap 8 은 장식이 아니다 — `IconButton` 은 시각 38 · 터치 44 라 `::before` 가 좌우 3px 씩 넘친다. 8 이면 두 터치 타깃이 **겹치지 않는다**(3+3 = 6 < 8).
- **Prompt 가 도착하고 노트가 하나라도 있을 때만** 버튼이 생긴다. 카탈로그 외 책·조회 실패에는 버튼도 뒷면도 없다.
- ⚠️ Figma `145:1085` 에 이 **두 번째 헤더 아이콘은 없다** — 승인된 추가다 (`L-R2B-02`).

### 2.2 뒷면 내용 — 앞면과 **1:1 거울**

- `questions + followUps` 를 **앞면과 같은 순서·같은 개수**로 `[pill, 코칭 노트]` 로 그린다. 목록을 **거르지 않는다**.
- 제목은 Figma `86:482` 문구 그대로 **단수형** `Prompt of this book`.
- 노트 상자는 Home 뒷면과 **같은 토큰**(`--activity-card-note-pad-block/inline` = Figma 13/12), 같은 컴포넌트(`CoachingNote`).

### 2.3 `coachingNote` 가 `null` 인 kind 처리 — **pill 만 남긴다**

`createPromptCoachingRefine()` 은 `kind === 'question'` 에만 노트를 강제하므로 `follow_up` 은 `null` 이다.

- **거르지 않는 이유**: Figma `86:482` 의 **마지막 항목이 노트 없는 pill** 이다(pill·note·pill·note·**pill**). 즉 "노트 없는 pill" 은 Figma 에 실재하는 모양이다. Home 뒷면도 같은 규칙(`ActivityOptionCard`)이라 두 화면이 갈라지지 않는다.
- 거르는 쪽(= 노트 있는 것만 표시)도 검토했다. 버린 이유: 앞면 pill 개수와 뒷면 항목 개수가 어긋나 "동일 개수 표시"(사용자 결정) 가 깨지고, Figma 의 마지막 pill 을 **빼는** 선택이 된다.
- fixture 기준: 앞면 pill **7** = 뒷면 항목 **7**, 그중 노트 **5**(= 질문 수). 테스트가 세 숫자를 고정한다.

### 2.4 높이 — 뒤집어도 시트가 움직이지 않는다

Home 은 **고정 높이 415/409 + 하단 정렬**이지만 시트 본문은 **높이가 내용에 달렸다.** 그래서 Home CSS 를 재사용하지 않고 다음 구조를 썼다.

```
.haru-sheet__content:has(> .haru-book-sheet__flip)   display:flex; flex-direction:column   ← 이 시트에만
└ .haru-book-sheet__flip        flex item · min-block-size:0 · overflow-x:clip · perspective 1200
  └ .haru-book-sheet__flip-inner  position:relative · min-block-size:0 · preserve-3d · rotateY
    ├ __face--front   흐름 그대로 (display 선언 없음 — 2라운드-2 블록 흐름 유지)
    └ __face--back    position:absolute; inset:0   ← **앞면/상자 높이를 그대로 받는다**
```

실측: 393×852 에서 앞면·뒷면 **둘 다 329×413**, 시트 상자 **365×554 로 뒤집기 전후 동일**(e2e 가 `toStrictEqual` 로 고정).

### 2.5 ⚠️ 뒤집기에서 **발견하고 고친 결함 2건** (둘 다 실측)

| | 증상 | 원인 | 수정 |
|---|---|---|---|
| **A** | 뒷면에서 시트 본문이 **가로로 14px 끌렸다** (`scrollWidth 343 / clientWidth 329`, `scrollLeft` 14 까지 이동) | 3D 가 아니라 **거울상**이다. 앞면 표지는 `--shadow-cover` 자리를 만들려고 `padding-inline:14` + `margin-inline:-14` 로 **좌측 14 를 면 바깥**까지 쓰는데, 뒤집으면 그 14 가 **오른쪽** overflow 가 된다 | `.haru-book-sheet__flip { overflow-x: clip }`. 클립 선이 `.haru-sheet__content` 와 **같은 x** 라 새로 잘리는 그림이 없다(앞면 좌측 overhang 은 지금도 그 선에서 잘린다 — LTR 스크롤 박스는 시작 쪽 overflow 를 되돌릴 수 없다). `clip` 은 다른 축을 스크롤 박스로 만들지 않는다 |
| **B** | **320×568** 에서 뒷면 하단 63px 가 본문 밖으로 나가 ActionBar 뒤에 숨었다 — 목록을 끝까지 내려도 **마지막 항목이 보이지 않는 자리**에 있었다 (마지막 pill 하단 534 > 본문 하단 481) | 시트가 `max-block-size` 에 걸리면 본문이 스크롤하고 **앞면(430)이 본문(367)보다 길어진다.** 뒷면이 `inset:0` 으로 그 높이를 받았다 | 본문을 **세로 flex** 로 만들고(`:has()` 로 이 시트에만) 상자·inner 에 `min-block-size: 0` → 둘 다 **보이는 높이(367)** 로 줄어든다. 앞면은 넘쳐서 본문 스크롤로 그대로 읽힌다. ⚠️ `block-size: 100%` 로는 고칠 수 없었다 — `.haru-sheet__content` 높이는 flex 결과라 퍼센트 기준이 되지 않는다(실측: `auto` 로 떨어져 430 유지) |

두 수정 모두 **CSS 가드 + e2e** 가 고정한다. B 는 세 선언이 함께 있어야 성립하므로 세 개를 한 테스트에서 단언한다.

### 2.6 배경색 — Figma 뒷면의 `#d3e3de` 를 **쓰지 않았다** (보고 대상)

Figma `86:482` 뒷면은 `color/spring green/86` 면이다. 시트에서는 **헤더와 ActionBar 가 뒤집히지 않으므로** 가운데 본문만 초록이 되면 시트가 깨져 보인다. 시트 면(`--color-surface-strong`)을 유지했다. 바꾸려면 `Sheet` 가 면 색을 받아야 한다(Shared UI 변경) → 승인 대상.

---

## 3. ⭐ `R-SHADOW-1` — 뒷면 목록의 그림자 자리 (번짐 **재측정**)

### 3.1 실측 ① 지금 이 상자 안에는 **그림자가 없다**

소스에서 읽고(= `PromptPill--tinted` 는 면뿐, `CoachingNote` 는 `Surface material="none"` → `box-shadow: none`) **브라우저에서 다시 쟀다.**

- 뒷면 전 자식의 `getComputedStyle().boxShadow` 가 **전부 `none`** (drop 겹 0건).
- 마지막 항목 **네 방향** 픽셀 프로브 — **전부 Δ=0**:
  `below 0×14` · `above 0×8` · `left 0×8` · `right 0×8` (393×852 · dSF 1 · 보정 유무와 무관).

### 3.2 실측 ② 그래도 **아래 자리(10)를 만들었다** — 보정 전/후

`--shadow-bubble` 번짐은 2라운드-2 재측정값 **아래 10 · 위 0 · 좌우 4** (drop 1겹이라 빠뜨릴 겹이 없다). 그 값을 담은 **기존 토큰**(`--sheet-content-shadow-inset-block-end`)을 `padding-block-end` 로 썼다.

pill 에 `--shadow-bubble` 을 **주입**해 측정 (마지막 pill 하단 −1…+12, 끝까지 스크롤):

| | 아래 프로파일 |
|---|---|
| 보정 **있음** | `22 32 32 29 28 25 16 15 10 4 3 0 0 0` → **10px 복원** |
| 보정 **없음** | `22 0 0 0 0 0 0 0 0 0 0 0 0 0` → **완전 절단** |

(`−1` 은 상자 **안쪽** 마지막 픽셀이라 두 경우 모두 0 이 아니다.)
회귀 테스트: `e2e/shadow.spec.ts` — 보정 **있음** 4폭 + 보정 **없음** 4폭 + "자식에 drop shadow 가 없다" 1건 = **9건**. 주입해서 재는 이유는 실제 자식이 그림자를 갖지 않기 때문이며, 세 번째 테스트가 그 전제를 고정한다 — 누군가 그림자를 더하면 **그 테스트가 먼저 실패**한다.

### 3.3 음수 margin 을 쓰지 않았다 (`contentShadowInset` 과 다른 점)

스크롤 박스의 `padding-block-end` 는 **스크롤 영역에 포함**되고 이 블록은 `flex: 1 1 auto` 로 남는 높이를 채우므로 바깥 크기가 변하지 않는다. 음수 margin 을 더하면 상자가 뒷면 밖으로 10px 삐져나와 **`.haru-sheet__content`(또 다른 클리핑 박스)에 잘린다.**

### 3.4 좌우는 이 상자에서 해결할 수 없다 (기록)

주입 상태의 우측 프로파일은 보정 유무와 **무관하게 `3,0,0,…`** 이다. 목록 상자가 본문 폭을 꽉 채우므로 폭을 넓히면 `.haru-sheet__content` 가 자른다. 본문 폭을 꽉 채우는 **drop shadow 상자가 실제로 생기면** `Sheet contentShadowInset`(좌우 4 + 음수 margin)을 함께 켜야 한다 — `LibraryShelfSheet` 와 같은 처리다. 현재 좌우 번짐이 0 이므로 적용 대상이 없다.

### 3.5 측정 함정 — 지시받은 2건 그대로 확인

- ⓐ **빌드 산출물 CSS 를 쓴다** — 이번 측정은 **dev 서버(e2e 대상)** 에서 했고 `getComputedStyle` 이 실제 값을 돌려준다. 함정은 `packages/design-tokens/dist/index.css` 를 **단독 파일로** 띄울 때 생긴다(`@theme static` 소스 번들이라 브라우저가 무시) — 그 경로를 쓰지 않았다.
- ⓑ **scroll anchoring** — 보정을 런타임에서 지우면 `scrollTop` 이 되돌아간다. `scrollNotesToBottom()` 이 프레임마다 재대입하고 **최댓값 도달을 단언**한다.

---

## 4. 생성·수정 파일

```
packages/contracts/src/books/prompts.ts            `reason` 추가 (+ 선정 근거 주석)
packages/contracts/src/__tests__/library.test.ts   +3 (선택 · 길이 상한 없음 · LibraryBook 부재)
apps/web/src/entities/book/useBookPrompts.ts       `reason: string | null` 노출
apps/web/src/features/library/BookDetailSheet.tsx  이유 줄 · 헤더 flip · 뒷면(`NotesFace`)
apps/web/src/features/library/library.css          flip 구조 · 뒷면 목록 · 헤더 2버튼 · 결함 A·B 수정
apps/web/src/shared/copy/library-copy.ts           `showNotes` · `showBook` · `notesTitle`
apps/web/src/mocks/fixtures/books.ts               `createBookReasonFixture` (결정적)
apps/web/src/mocks/books/MockBooksApi.ts           `reason` 응답 + `no-reason` scenario
apps/web/src/mocks/__tests__/MockBooksApi.test.ts  +3
apps/web/__tests__/library-sheets.test.tsx         +7 (이유 2 · 뒤집기 5)
apps/web/__tests__/library-css-guards.test.ts      +8 / 기존 2건 갱신
e2e/library.spec.ts                                +3 (기하 불변 · 가로 끌림 · 뒷면 스크롤+닫기)
e2e/shadow.spec.ts                                 +9 (보정 있음 4 · 없음 4 · 자식 그림자 0건 1)
e2e/visual.spec.ts                                 +1 (뒷면 baseline)
docs/API_CONTRACTS.md                              prompts 응답에 `reason` · scenario `no-reason`
e2e/__screenshots__/darwin/visual.spec.ts/s3-library-book-sheet-back.png   신규
e2e/__screenshots__/darwin/visual.spec.ts/s3-library-book-sheet.png        재생성
```

`packages/ui` **수정 0건** · Home 코드 **0건** · 신규 토큰 **0건**.

---

## 5. 시각 baseline

### 5.1 신규 1건 — 저장 후 **눈으로 확인**

`s3-library-book-sheet-back` — 뒤집은 **직후**(목록 최상단) 프레임. 확인한 것: 제목 `Prompt of this book`(단수) · `[pill, beige 노트]` 쌍 · 헤더 `[flip][닫기]` 유지 · ActionBar 그대로(`Start Session` 비활성 톤).
스크롤 끝 상태를 기준에 넣지 않았다 — 항목 높이가 1px 만 달라져도 전체가 밀린다. 그 상태의 그림자 자리는 `shadow.spec.ts` 프로브가 **픽셀로** 고정한다.

### 5.2 재생성 1건 — 클러스터 **전부 규명**, 설명되지 않는 것 0건

`s3-library-book-sheet`(앞면). 채널 Δ>5 변화 픽셀 3,531개 / 클러스터 12개 — **전부 두 영역 안**이다:

| 영역 | 클러스터 | 원인 |
|---|---|---|
| `x 274..289 · y 29..44` | 1개 (139px) | **헤더 flip 아이콘**(24×24, 닫기 안쪽) |
| `x 88..331 · y 85..135` | 11개 (3,392px) | **추천 이유 줄 2줄 추가 + 부제가 위로 이동**(텍스트 열이 세로 중앙 정렬이라 자식이 늘면 부제가 올라간다) |

그 밖의 영역(표지 · Prompt pill 7개 · 증정 블록 · ActionBar · 모서리)은 **변화 0**. 책 블록 높이는 표지(82)가 정하므로 **아래 블록이 밀리지 않았다**.

### 5.3 그 밖 — 재생성 0건

`pnpm playwright test e2e/visual.spec.ts --update-snapshots=all`(스테일을 드러내는 모드) 후 `git status` 에 위 2건 외 **변경 0건**. Home 7종 · `s3-sheet-scrim` · `s3-dialog-scrim` 포함 전부 바이트 동일.

---

## 6. 검증 명령 결과 (8/8)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ 5 project |
| `pnpm lint` | ✅ 0 problems |
| `pnpm lint:boundaries` | ✅ no violations (586 modules / 2066 deps) |
| `pnpm test` | ✅ **116 files / 1580 tests** (2라운드-2 1559 → **+21**) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm assert:no-mocks` | ✅ sentinel 3종 × 4파일 0건 |
| `pnpm test:e2e` | ✅ **251 passed** (단독 실행, 238 → **+13**) |

`pnpm install --frozen-lockfile` 은 **의존성 변경이 없어** 실행하지 않았다 (`package.json`·lockfile 무변경).
`apps/api/` · `supabase/` **미생성 확인**.

---

## 7. Mock 시나리오 전환 방법

2라운드-2 와 동일하다 — `?scenario=<group>:<key>` · dev Scenario Panel · `sessionStorage['haru:scenario']`.
⚠️ `/library` 로 직접 `goto` 하면 인증을 잃는다. 시나리오는 **로그인 화면 URL 에 심고**(`/auth/log-in?scenario=books:no-reason`) 탭으로 이동한다.

| key | 화면 |
|---|---|
| `books:success`(기본) | `BookDetailSheet` 앞면에 **추천 이유 줄**, 헤더에 flip, 뒷면에 `[pill, 노트]` 7쌍 |
| **`books:no-reason`** (신규) | **이유 줄만 사라진다** — Prompt·뒷면은 그대로 |
| `books:loading` / `error` / `retry` / `offline` | Prompt Skeleton · `InlineAlert`+Retry — 이때 **flip 버튼이 없다**(뒤집을 노트가 없다) |
| `library:user-entered-book` | 카탈로그 외 책 → Prompt 미조회 · 이유 없음 · **flip 없음** |

---

## 8. `BACKEND_INTEGRATION_PENDING`

| ID | 내용 |
|---|---|
| **신규 `P3-BIP-26`** | **`BookPromptsResponse.reason` — 서재 책에도 추천 이유 문구를 준다.** ① **문구 생성 책임은 서버**다 (Frontend 는 생성·가공·접두어 추가를 하지 않는다). ② 아이·책 조합에 맞춘 **1~2문장**, 진단·판정·비교 표현 금지(PRD §11 · `rules/frontend.md` §8). ③ **길이 상한은 contract 에 없다** — 2문장 요구는 서버 생성 정책이며 초과해도 화면이 깨지지 않아야 한다. ④ 아직 문장이 없으면 **필드를 생략하거나 `null`** 을 보낸다 (화면이 줄을 생략한다). ⑤ 카탈로그에 없는 책은 이 endpoint 를 호출하지 않으므로 이유도 없다 |
| `P3-BIP-23` (보강) | 같은 endpoint 가 이제 **Prompt 세트 + 추천 이유**를 함께 돌려준다. `BookDetailSheet` 의 **유일한 detail 조회**이며 시트를 열 때 1회 호출된다 |
| `P3-BIP-15` ~ `P3-BIP-25` | 2라운드-2 그대로 유지 |

---

## 9. 보고 대상 (승인 필요 / 기록)

| # | 항목 | 성격 |
|---|---|---|
| 1 | **헤더 두 번째 아이콘(flip)** — Figma `145:1085` 에 없다 | 사용자가 승인한 추가(`L-R2B-02`). **형태 보고**: `[flip][닫기]`, 닫기가 모서리 |
| 2 | **뒷면 배경이 Figma 의 `#d3e3de` 가 아니다** (§2.6) | 승인 필요 — 바꾸려면 `Sheet` 가 면 색을 받아야 한다 |
| 3 | **뒷면에도 ActionBar 가 보인다** (Figma `86:482` 뒷면에는 ActionBar 가 없다) | 시트 ActionBar 는 `Sheet.footer` 라 뒤집히지 않는다. `Start Session` 은 **`D-3` 비활성 유지** |
| 4 | **320×568 뒷면에서 본문을 63px 더 내릴 수 있다** (앞면의 넘친 높이가 스크롤 영역에 남는다 — 빈 자리가 보인다) | 기록. 내용 손실 없음. 없애려면 뒤집힌 동안 앞면을 접어야 하는데 전환 중 앞면이 갑자기 사라진다 |
| 5 | **앞면 표지의 좌측 그림자 자리(14)는 2라운드-2 부터 `.haru-sheet__content` 경계에서 잘린다** (이번 변경과 무관, 측정 중 확인) | 기록. 고치려면 `Sheet contentShadowInset` 을 켜야 한다 (§3.4 와 같은 처리) |
