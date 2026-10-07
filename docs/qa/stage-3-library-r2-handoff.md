# Stage 3 Library — 2라운드-1(`/library` 본 화면) development-agent 인계 메모

- 대상: `/library` **본 화면만**. 시트(`LibraryShelfSheet` · `BookDetailSheet`)와 진입점
  (`/library/add` · `/library/gift-requests`)은 **다음 작업**이며 만들지 않았다.
- 전제: 1라운드 토대(커밋 `b45a152`) — 토큰 14건 · `SectionHeader` · `ListGroup`/`ListRow` 정규화 ·
  contracts 7종 · Mock 18 시나리오.
- 근거 문서: `docs/design/stage-3-library-design-spec.md` · `docs/qa/stage-3-library-r1-handoff.md` ·
  `.claude/rules/frontend.md` §6-1(`R-SHADOW-1`) · §9-1(`R-BASELINE-1`).

---

## 1. Gate 확인

| 항목 | 결과 |
|---|---|
| Design Spec 존재 | ✅ `docs/design/stage-3-library-design-spec.md` |
| 1라운드 QA 토대 | ✅ 커밋 `b45a152` (8/8 · e2e 191) |
| Backend 구현 포함 여부 | ✅ 없음 — `apps/api/` · `supabase/` 미생성 확인 |
| 작성 금지 경로 수정 | ✅ `docs/decisions/**` · `.claude/rules/**` 수정 0건 |

---

## 2. 구현 범위

### 2.1 신규 컴포넌트

| 위치 | 컴포넌트 | 근거 |
|---|---|---|
| `entities/book/BookShelfItem.tsx` | 표지(lg) + 제목 1줄 + 캡션 최대 2줄 | Figma `113:1971` |
| `entities/book/BookShelfCarousel.tsx` | 페이지(3권) 단위 가로 scroll-snap + `PageIndicator` | Figma `113:1992` |
| `entities/book/BookListRow.tsx` | `ListRow` 조합 (media · meta · chevron) | Figma `30:141` · `163:2100` |
| `entities/library/ReadingNowCard.tsx` | 표지(xl) + 제목/부제/진행 바/메타 | Figma `145:1145` |
| `features/library/LibraryShelves.tsx` | 4섹션 조립 + 상태 화면 | Design Spec §2.2 · §7.4 |
| `pages/library/LibraryPage.tsx` | Composition 만 (1차 skeleton 대체) | — |

### 2.2 데이터 경로

```
LibraryShelves → useLibraryOverview → libraryApi.getOverview → MockLibraryApi | HttpLibraryApi
```

- `entities/library/libraryKeys.ts` 에 **`overview(childId)`** · **`list(childId, filter)`** 추가
  (`saved` 는 Home 이 쓰는 기존 key — 건드리지 않았다).
- `useLibraryList` 는 **만들지 않았다** — "See all" 시트가 다음 작업이라 소비자가 없다
  (쓰이지 않는 hook 을 선행 작성하지 않는다). key 는 시트가 바로 쓸 수 있게 정의만 해 두었다.
- 조회는 **1회**(`GET …/library/overview`)다. 섹션별 호출 0건을 테스트가 고정한다 (`P3-BIP-18`).

### 2.3 섹션 순서·간격

`Reading now` → `Our curated shelf` → `Favorites` → `Finished together`.
순서는 **서버(`overview.sections`) 그대로**이며 프론트가 재정렬하지 않는다 (`L-OPEN-01`).
Frame 15 는 **gap 16 일정의 세로 flex 하나**다 — 헤더와 본문을 같은 레벨 flex 행으로 두어
헤더↔본문·섹션↔섹션 간격이 모두 16 이 된다 (e2e 가 전 구간 16 을 실측 검증).

---

## 3. ⭐ 캐러셀 그림자 번짐 — **재측정값과 방법**

### 3.1 방법

1. 측정 CSS 는 **`apps/web/dist/assets/index-EvYxPDYn.css`**(빌드 산출물). `packages/design-tokens/dist/index.css`
   는 `@theme static` 소스 번들이라 브라우저가 무시하고 `boxShadow: none` 이 나온다.
2. 흰 배경(`#fff`) 위에 107×151 `.haru-book-cover--lg` 를 놓고 `deviceScaleFactor: 1` 로 렌더.
3. `computedStyle.boxShadow` 를 **괄호 깊이를 세며** 분리해 겹을 전수 확인
   (`color-mix(in srgb, …, transparent)` 안쪽 쉼표에 속지 않는다).
4. 스크린샷을 브라우저 안에서 `createImageBitmap` + `OffscreenCanvas` 로 디코드해 상자 바깥
   픽셀을 **전수 스캔**, 순백 대비 채널차 합이 임계값 이상인 **가장 먼 거리**를 방향별로 구함.

### 3.2 결과

`--shadow-cover` = **겹 2개** — `rgb(94 115 112 / .28) 0 6px 14px` (drop) + `rgb(255 255 255 / .5) 0 1px 0 inset`.
빠뜨린 겹 없음.

| 임계값(채널차 합) | 위 | 아래 | 좌 | 우 |
|---|---|---|---|---|
| ≥ 1 | **8** | **20** | **14** | **14** |
| ≥ 5 | 6 | 18 | 12 | 12 |
| ≥ 12 | 3 | 15 | 9 | 9 |

거리별 최대 delta — 아래: `+2=92 +4=80 +8=52 +12=25 +16=10 +20=3` · 좌우: `±2=52 ±4=38 ±8=17 ±12=6`.

**결론: Design Spec §8.2 의 "아래 20 · 위 8 · 좌우 14" 는 실측과 일치한다.** 그대로 쓴다.
(참고로 같은 방법으로 `--shadow-bubble` 은 겹 3개 · 아래 10 · 위 0 · 좌우 4 — 1라운드가 등록한
`--sheet-content-shadow-inset-*`(10 / 4) 와 일치한다.)

### 3.3 적용 (`R-SHADOW-1` 조건 3개)

| 조건 | 적용 |
|---|---|
| ① 그림자 보호 구조 | `padding-block-start: var(--space-2)`(8) · `padding-block-end: var(--space-5)`(20) + 같은 값의 **음수 `margin-block`**. 좌우 14 는 `margin-inline: -gutter` + `inline-size: calc(100% + 2*gutter)` + `padding-inline: gutter` 의 **bleed(24)** 가 흡수한다 (14 < 24) |
| ② 양축 픽셀 프로브 회귀 테스트 | `e2e/shadow.spec.ts` — **위·아래·좌·우 4방향** × 4폭 |
| ③ 근거 주석 | `apps/web/src/entities/book/book-shelf.css` 상단 + 트랙 블록 |

**`block-size` 를 선언하지 않는다.** 표지 높이가 `aspect-ratio` 로 퍼센트 폭에서 파생되므로
content box 가 내용으로 자동 결정된다 → `box-sizing: border-box` 의 "크기에 inset 가산"(Home 트랙이
필요했던 보정)이 **이 자리에서는 불필요**하다. 가로는 `inline-size` 를 선언하므로 가산했다.

**프로브가 실제로 문다는 것을 확인했다** (toothless guard 방지):

| 제거한 보호 | 결과 |
|---|---|
| `padding-block-start` + 음수 margin | **위** 프로브 4폭 전부 실패 (`delta 0`) |
| gutter bleed 3줄 | **좌** 프로브 4폭 전부 실패 (`delta 0`) |

---

## 4. ⭐ 역량 캡션 11px **실측 폭**과 적용 규칙

빌드 산출물 CSS · `--text-caption-2`(11px / line-height 13) · `--font-weight-regular` 로 렌더해
`getBoundingClientRect().width` 측정. **두 폰트 경로를 모두** 쟀다 (Apple = SF Pro, 그 외 =
self-host Inter woff2).

| 표시 라벨 | SF Pro | Inter | 107 (393 Figma) | 84.36 (320) | 134 (480) |
|---|---|---|---|---|---|
| `Emotion Regulation` | **101.44** | 100.08 | 1줄 ✓ | **2줄** | 1줄 ✓ |
| `Self-Direction` | **72.80** | 71.58 | 1줄 ✓ | 1줄 ✓ | 1줄 ✓ |
| `Cognitive Flexibility` | **101.98** | 101.00 | 1줄 ✓ | **2줄** | 1줄 ✓ |
| `Intrinsic Motivation` | **99.98** | 98.78 | 1줄 ✓ | **2줄** | 1줄 ✓ |
| (Figma 원문) `Emotion` 42.72 · `Resilience` 53.08 · `Confidence` 60.05 | | | | | |
| (최장 단어) `Regulation` 55.56 · `Flexibility` 49.30 · `Motivation` 54.92 | | | | | |

### 4.1 Design Spec §6.3 의 `[추정]` 이 **틀렸다**

§6.3 표는 `Cognitive Flexibility ≈ 118`, `Intrinsic Motivation ≈ 112` 로 추정해 **"107 에 1줄 불가"**
라고 적었다. 실측은 **102.0 / 100.0 으로 둘 다 1줄에 들어간다**(여유 5~7px).

→ **Figma 폭(393)에서는 캡션이 Figma 대로 정확히 1줄**이다. `AD-S3-5` 의 "캡션 2줄 허용" 은
**320px 에서만** 발동한다.

### 4.2 적용 규칙

1. `nowrap` 을 쓰지 않고 **최대 2줄 + 말줄임**(`Text truncate={2}`) — 여유가 5px 뿐이라 폰트
   fallback·글리프 차이에 대비한 안전장치다.
2. **`overflow-wrap: break-word` 를 쓰지 않는다.** 최장 단어 55.56 < 84.36 이라 단어를 끊을
   필요가 **없다**(실측 근거).
3. 제목(캡션 1행)은 **Figma 대로 1줄 + 말줄임**(`truncate={1}`).
4. 말줄임은 시각 축약일 뿐 DOM 에 **전체 라벨이 남는다** → 보조기술은 전체를 읽는다.
   그래서 §6.3 ⑤ 가 요구한 **별도 `aria-label` 을 만들지 않았다** (중복 이름을 만들지 않는다).
5. 캡션 타이포는 **320 에서도 축소하지 않는다** (11px 하한 — e2e 가 `font-size: 11px` 를 고정).

---

## 5. ⭐ 시각 baseline

### 5.1 신규 6건 — 저장 후 **눈으로 확인**

| baseline | 무엇을 · 왜 |
|---|---|
| `s3-library.png` | `/library` 전체 프레임 — 섹션 4개의 레이아웃 회귀 기준 |
| `s3-library-reading-now.png` | `ReadingNowCard` (Figma `145:1145`) — 표지·진행 바·메타 |
| `s3-library-shelf.png` | 큐레이션 캐러셀 (Figma `113:1992`) — 3-up + 캡션 + dots |
| `s3-library-list.png` | `Finished together` 4행 (Figma `30:140`) — divider 3 · `Rated` 2-스타일 |
| `s3-library-favorites-empty.png` | ⭐ **저장 전 기본 상태** — 가장 흔한 실제 화면 |
| `s3-library-empty.png` | 3섹션 안내 동시 노출 + `Reading now` 블록 제거 |

`R-BASELINE-1` 준수: ① `settle()`(+ 표지 이미지 디코드 대기) ② `hideDevPanel`
(`visual.spec.ts` 의 `beforeEach` 가 전역 적용).

**첫 생성본에서 `s3-library-list` 가 탭바에 가려진 채 찍혔다** (`R-BASELINE-1` ② — element
screenshot 은 bounding box 를 찍으므로 위에 뜬 sticky 탭바가 들어온다). 스크롤 컨테이너를
끝까지 내려 다시 찍었고, **겹침이 0 이하인지 단언하는 검사를 테스트 안에 넣었다** — 같은 사고가
조용히 재발하지 않는다. (스크롤 컨테이너는 `document.scrollingElement` 가 아니라 앱 컬럼
바깥의 AppShell 뷰포트다.)

### 5.2 기존 baseline — **재생성 0건**

Home baseline 7종(`s2-home-header` · `s3-home` · `s3-home-deck` · `s3-home-deck-back` ·
`s3-home-deck-scrolled` · `s3-home-card-save-saved` · `s3-tabbar`)을 포함해 **기존 baseline 을 한
장도 재생성하지 않았다.** 전체 e2e 215 passed 가 그 증거다.

Home 을 건드리지 않았다: `useToggleSavedBook` · `activity-card-deck` · `home-overview` ·
`activity-card.css` 수정 0건. `book.css` 는 **`--lg` 전용 규칙만** 추가해 `sm`·`md`·`xl` 에
영향이 없다 (§7.1 참조).

---

## 6. 검증 명령 결과 (8/8)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ 통과 (5 project) |
| `pnpm lint` | ✅ 0 problems |
| `pnpm test` | ✅ **114 files / 1507 tests** (1라운드 112/1459 → **+2 files / +48 tests**) |
| `pnpm lint:boundaries` | ✅ no violations (567 modules / 1950 deps) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm assert:no-mocks` | ✅ sentinel 0건 (3종 × 4파일) |
| `pnpm test:e2e` | ✅ **215 passed** (단독 실행, 1라운드 191 → **+24**) |

신규 테스트: `library-screen.test.tsx`(17) · `library-copy.test.ts`(15) ·
`library-css-guards.test.ts` +11 · `e2e/library.spec.ts`(14) · `e2e/shadow.spec.ts` +4 ·
`e2e/visual.spec.ts` +6.

---

## 7. 구현 중 발견한 **결함**과 처리

### 7.1 표지 이미지가 상자 높이를 밀어 올렸다 (실측 151 → **152.97**)

`.haru-book-cover--lg` 는 `aspect-ratio: 107/151` 이지만, 표지 **원본 비가 더 세로로 길면**
(예 `135×193` = 0.6995 < 0.7086) 흐름 안의 `<img>` 가 상자를 밀어 올린다 — `aspect-ratio` 는
선호 크기일 뿐 내용이 더 크면 상자가 늘어난다. 캐러셀은 **가장 큰 항목이 블록 높이를 정하므로**
이 1.97px 이 섹션 기하로 그대로 번졌다 (`QA-2-004` 와 같은 부류).

- 수정: `.haru-book-cover--lg { position: relative }` + `.haru-book-cover--lg img { position: absolute; inset: 0 }`
- 결과: 세 표지 모두 정확히 **107 × 151**, 캐러셀 220.97 → **219**
- ⚠️ **`sm`·`md` 에는 같은 구조적 취약점이 남아 있다.** 고치면 Home baseline 이 바뀔 수 있어
  이번 범위에서 손대지 않았다 (`xl` 은 두 변을 직접 두어 영향 없음). → **§9 보고 항목**

### 7.2 다음 페이지가 오른쪽 gutter 에 비쳤다

트랙이 gutter(24)만큼 bleed 하므로 페이지 사이 간격이 0 이면 **page 2 의 첫 표지가 오른쪽
gutter 에 보인다**(실측 page2 x=369 < 뷰포트 393). Figma 에는 peek 이 없다 — 3-up 이 content 345 를
정확히 채운다 `[실측 113:1992]`.

- 수정: `.haru-shelf-track { column-gap: var(--layout-gutter) }` → page2 x = **393**(뷰포트 끝)
- 스냅 간격 계산도 `offsetWidth + columnGap` 으로 고쳤다 (`ActivityCardTrack` 의 `gapOf` 선례)
- 페이지 **안쪽** 기하는 1px 도 바뀌지 않는다

### 7.3 Design Spec §8.2 의 열 간격 퍼센트가 §3.3 의 실측 offset 과 어긋난다

§8.2 는 `31.0145% / 4.0472% / 31.0145% / 3.1862% / 31.0145%` 로 적었으나, 그 값은
- 열 시작을 35.0617% / 69.2634% 로 만들어 §3.3 의 **실측 offset**(35.0574% · 69.2528%)과 어긋나고
- 합이 **100.2769%** 가 되어 §8.2 자신이 적은 합 100.267% 와도 맞지 않는다.

→ **실측 offset 에서 역산**해 `4.0429%` · `3.1809%` 를 썼다 (합 **100.2673%**).
검산(content 345): 표지 **107.000** · x2 **120.948** · x3 **238.922** · 끝 **345.922**
— Figma 실측(107 / 120.948 / 238.922 / 0.92 넘침)과 소수 셋째 자리까지 일치한다.
브라우저 실측도 0 / 120.94 / 238.91 로 재현된다.

---

## 8. Figma 와의 차이 (측정값)

393px 기준. 전부 **승인된 토큰 흡수의 결과**이며 새로 만든 차이가 아니다.

| 요소 | Figma | 구현 | Δ | 원인 |
|---|---|---|---|---|
| `SectionHeader` | h 20 | **22** | +2 ×4 | `--text-headline--line-height` = 22. Design Spec §3.1·§9.1 이 "높이를 고정하지 않는다(20 은 결과값)" 로 정했다 |
| `ReadingNowCard` | 345×118 | **345×118** | 0 | — |
| 캐러셀 블록(curated) | 216 | **219** | +3 | 항목 gap 7→8 ×2(+2) · 제목 line-height 14→16(+2) · dots gap 15→16(+1) − Figma 의 +2 여백 |
| 캐러셀 블록(favorites) | 216 | **216** | 0 | 3권 = 1페이지 → dots 미표시, `min-block-size` 216 이 블록 높이를 Figma 값으로 유지 |
| Book List | 297(화면 사본) | **299** | +2 | divider **3개**(`L-OPEN-05` 가 컴포넌트 `163:2145` 채택). 화면 사본 297 = 74×4 + divider **1개** — 즉 +2 는 승인된 선택의 산술 결과다 |
| Frame 15 | 1039 | **1052** | +13 | 위 항목들의 합 |
| 표지 열 | 0 / 120.948 / 238.922 · 107×151 | **0 / 120.94 / 238.91 · 107×151** | ≤0.01 | 서브픽셀 |
| 섹션 간격 | 16 | **16** (전 구간) | 0 | e2e 실측 |

320px: 표지 **84.36**(= content 272 × 31.0145%, 명세 84.4) · 캡션 11px 유지 · 간격 전부 16 ·
캐러셀 블록 216(`min-block-size` 가 Figma 블록 높이를 지킨다 — 내용 200 보다 커서 dots 아래에
약 16~23px 여백이 생긴다).

---

## 9. 승인·확인이 필요한 항목

1. **Error 상태를 §7.4 와 다르게 구현했다.** §7.4 는 "섹션 본문 자리에 `ErrorState` + Retry,
   헤더 유지" 인데 서재는 **단일 조회**라 실패하면 네 섹션이 동시에 빈다. 섹션마다 두면 같은
   refetch 를 가리키는 Retry 가 4개 생기고 `announce` 가 네 번 울린다. → **`ErrorState` 를 한 번만**
   그리고 헤더를 렌더하지 않는다(헤더의 "See all"·`meta` 가 둘 다 없는 데이터를 가리킨다).
2. **`favorites-empty` 의 `icon=star` 를 `book` 으로 바꿨다.** `star` 는
   `packages/ui/src/icon/registry.ts` 에서 **의도적으로 제거된 글리프**다 (규칙 ③: "`star` 는
   성취·평점 언어다 — `rules/frontend.md` §8 이 진단·판정·비교 표현을 금지하고 `D-7` 이 같은
   이유로 Figma 평점 기능을 기각했다. 되돌리지 않는다"). `finished` 의 `book-open` 과 구분된다.
3. **Design Spec §6.3 의 캡션 폭 `[추정]` 이 실측과 다르다** (§4.1) — 393 에서는 네 라벨 모두
   1줄이다. 명세 표를 실측값으로 갱신할지 판단이 필요하다.
4. **Design Spec §8.2 의 열 간격 퍼센트가 §3.3 실측과 모순된다** (§7.3) — 실측 offset 쪽을
   채택했다. 명세 정정 필요.
5. **`BookCover` `sm`·`md` 에 §7.1 과 같은 취약점이 남아 있다.** 고치면 Home baseline 이 바뀔 수
   있어 손대지 않았다. 별도 승인 후 처리 대상이다.
6. **`SectionHeader` h22 vs Figma 20** (§8) — 허용 차이로 등록할지 판단이 필요하다.
7. **1라운드 보고 4건은 여전히 미결**이다 (`stage-3-library-r1-handoff.md` §8): Plan §7.2 의
   `BookPrompts` 필드 정정 · dev gallery `provisionalItems.ts` 의 `P-18`~`P-23` 누락 등.

---

## 10. Scope 경계에서 보류한 항목

| 항목 | 이유 |
|---|---|
| `LibraryShelfSheet` · `BookDetailSheet` | **다음 작업** (지시 명시) |
| `/library/add` · `/library/gift-requests` · `LibraryEntryActions` | 〃 |
| 캐러셀 항목·Book List 행·`ReadingNowCard` 의 **탭 동작** | 시트가 없어 열 대상이 없다. 아무 일도 하지 않는 `<button>` 을 만들지 않으려고 **비대화형**으로 두었다. chevron 은 Figma 요소이므로 **빼지 않고** 그린다(장식 · `aria-hidden`) |
| "See all" | 지시대로 **버튼은 렌더**한다. `LibraryShelves` 의 `onSeeAll` 을 넘기지 않으면 아무 일도 하지 않는다 — 시트 라운드에서 Page 가 연결한다 |
| `useLibraryList` | 소비자(시트)가 없다. key 만 정의했다 |
| `★ Save` / `useToggleSavedBook` 연결 | 본 화면에 `★ Save` 가 없다(시트 안이다). **Home 의 `useToggleSavedBook` 을 수정하지 않았다** |
| `My Saved` · `Selected` 변형 · 보유·증정 표식 · 섹션 안 "Show more" | **만들지 않는다**(확정 결정). 테스트가 부재를 고정한다 |
| `Finished together` 5행 이상 | **4행 고정** |

---

## 11. Mock 시나리오 전환 방법

1라운드와 동일하다 — `?scenario=library:<key>` · dev Scenario Panel(`/__dev` 우하단) ·
`sessionStorage['haru:scenario']`.

⚠️ **`/library` 로 직접 `goto` 하면 인증을 잃는다.** 시나리오는 **로그인 화면 URL 에 심고**
(`/auth/log-in?scenario=library:empty`) 탭으로 이동한다 — `sessionStorage` 에 남아 SPA 이동
뒤에도 유지된다. e2e 헬퍼(`logInToLibrary` · `goToLibrary`)가 이 경로를 쓴다.

이번 라운드에서 **화면으로 확인된** key:

| key | 화면 |
|---|---|
| `success` | 4섹션 전부 |
| `loading` | 헤더는 실제 텍스트 · 본문만 Skeleton · dots 미표시 · `aria-busy` 1회 |
| `empty` | 3섹션 안내 **동시** + `Reading now` 블록 제거 + "See all" 3개 비활성 |
| `favorites-empty` | Favorites 만 안내, 나머지 정상 |
| `finished-empty` · `curated-empty` | 해당 섹션만 안내 |
| `reading-now-none` | `Reading now` **블록 전체 제거**(간격 회수) → L-1 `30:74` 와 같아진다 |
| `shelf-partial` | 1권 — 열을 접지 않고 **dots 미표시** |
| `unrated` | 행 우측 meta **미렌더**, 좌측 정렬 유지 |
| `gift-pending` | 표식 **없음**(`L-OPEN-14` 확인용) |
| `error` / `offline` / `retry` | `ErrorState` + Retry **1개** |
| `user-entered-book` | `BookCover` placeholder(이니셜) |

`paged` · `book-saved` · `unsave` · `gift-duplicate` 는 **시트·진입점이 생기는 다음 작업**에서
화면으로 확인된다.

---

## 12. `BACKEND_INTEGRATION_PENDING` (갱신·신규)

| ID | 내용 |
|---|---|
| `P3-BIP-18` (확정) | 서재 섹션 **1회 조회**(`GET …/library/overview`). 화면이 그 계약 위에 올라갔고 섹션별 호출 0건을 테스트가 고정한다 |
| `P3-BIP-17` (갱신) | `progressRatio` 는 **서버 소유**. 화면은 서버 값만 그린다 — fixture 의 0.552 와 회차 3/5(0.6)가 다른 것으로 되계산 금지를 검증했다. `plannedNights` 가 `null` 이면 회차 문구를 생략한다 |
| `P3-BIP-16` (갱신) | `averageRating` `null` 이면 행 우측 meta 를 비운다. 서버가 **해당 Child 의 세션 평점만** 집계해야 한다 |
| `P3-BIP-15` (유지) | 저장/해제 응답은 `SavedBook` 유지 → **`libraryKeys.overview` 재조회**가 최신 Favorites 를 돌려줘야 한다. ⚠️ 현재 `useToggleSavedBook` 은 `libraryKeys.saved` 만 무효화하며 그 key 는 `overview` 를 **prefix 로 덮지 않는다**. `★ Save` 가 들어오는 **시트 라운드에서 연결**해야 한다 (Home 경로를 건드리지 않는 범위에서) |
| `P3-BIP-19` (유지) | 표지 에셋 교체 게이트 — **Stage 8 배포 전 필수**. 현재 표지는 Figma 에서 가져온 Mock 전용 임시 에셋이다 |
| 신규 요구 | **표지 이미지 비율** — 서버/운영이 주는 표지가 107:151 과 달라도 레이아웃이 흔들리지 않아야 한다. Frontend 는 `object-fit: cover` + 고정 비로 흡수하지만, **원본 비 편차가 큰 에셋은 잘림이 커진다**. 에셋 가이드(권장 비 107:151)를 Handoff 에 남긴다 |
| 신규 요구 | **`Reading now` 선정 규칙**과 `lastSessionMinutes` 출처가 서버 소유다 (화면은 조각이 없으면 그 조각만 생략한다) |

---

## 13. 파일 목록

### 신규

```
apps/web/src/entities/book/BookShelfItem.tsx
apps/web/src/entities/book/BookShelfCarousel.tsx
apps/web/src/entities/book/BookListRow.tsx
apps/web/src/entities/book/book-shelf.css
apps/web/src/entities/library/ReadingNowCard.tsx
apps/web/src/entities/library/library.css
apps/web/src/entities/library/useLibraryOverview.ts
apps/web/src/features/library/LibraryShelves.tsx
apps/web/src/features/library/library.css
apps/web/src/features/library/index.ts
apps/web/__tests__/library-screen.test.tsx
apps/web/src/shared/copy/__tests__/library-copy.test.ts
e2e/library.spec.ts
e2e/__screenshots__/darwin/visual.spec.ts/s3-library{,-reading-now,-shelf,-list,-favorites-empty,-empty}.png
```

### 수정

```
apps/web/src/entities/book/book.css          — `--lg` 전용 규칙 2개 (§7.1)
apps/web/src/entities/book/index.ts          — 신규 3종 export
apps/web/src/entities/library/index.ts       — hook · 카드 export
apps/web/src/entities/library/libraryKeys.ts — overview · list key 추가
apps/web/src/pages/library/LibraryPage.tsx   — skeleton → LibraryShelves 조립
apps/web/src/shared/copy/library-copy.ts     — 섹션 제목 · 상태 문구 · 포맷터
apps/web/src/styles/index.css                — CSS 3개 import
apps/web/__tests__/library-css-guards.test.ts — 캐러셀 가드 11건 추가
apps/web/__tests__/home-stage3.test.tsx      — `/library` **과도기 기대값** 갱신 (§14)
e2e/shadow.spec.ts                           — 캐러셀 4방향 프로브
e2e/visual.spec.ts                           — Library 화면 baseline 6건
```

---

## 14. 기존 테스트 변경 — 1건, 사유

`home-stage3.test.tsx` 의 **"`/library` 는 탭바 마운트 자리만 잡는다 (화면 내용은 다음 단계)"**.
기대값이 "`EmptyState` 1개" 였는데 그것은 **1차의 과도기 상태**를 단정한 것이고, 이번 라운드에
그 상태가 끝났다. 테스트를 약화한 것이 아니라 **Home 탭 묶음의 관심사만 남겼다** —
"제목 행(`<h1>`) 과 서재 섹션이 함께 마운트된다". 서재 본문의 상세 계약은 신규
`library-screen.test.tsx`(17건)가 **더 강하게** 덮는다.

그 밖의 테스트는 **약화·skip·threshold 조정 0건**이다. `book.css` 의 `overflow` 0건 가드
(`stage3-css-guards.test.ts` · `library-css-guards.test.ts`)는 **그대로 두고**, 캐러셀 CSS 를
`book-shelf.css` 로 분리해 가드를 지켰다 — 가드를 고치지 않고 코드를 가드에 맞췄다.

---

## 15. 후속 — `L-R2-01` `BookCover` `sm`·`md` 구조적 결함 수정 (2026-10-07)

승인: approvals §22.1 `L-R2-01` *"지금 전부 고친다"*.

### 15.1 1단계 — 재현 (실측)

`lg` 에서 쓴 방법(브라우저 실측 + 런타임 토글)을 그대로 썼다.

**① 현재 호출 자리에서는 밀리지 않는다.**

| 자리 | 실측 높이 | 선언값 |
|---|---|---|
| `/library` `Finished together` 썸네일 (`sm` × 4행) | **48.5625** | 48.5625 (= 34 ÷ 0.7, LayoutUnit 내림) |
| Home 활동 카드 표지 (`md` × 3장) | **82** | 82 (`--activity-card-book-size`) |

`sm` 의 부모 `.haru-list-row__media` 는 **row flex** 이고, Home 은 `activity-card.css` 가
`block-size: 82px` 를 직접 선언해 블록축이 definite 이다. 두 자리 모두 결함이 **가려져 있었다.**

**② 구조적 취약점은 실재한다.** `lg` 가 깨졌던 조건(`.haru-shelf-item` = **column flex**)에
같은 상자를 세우면 밀린다. 표지 `where-the-wild-things-are.png`(135×193 = 0.6995):

| size | 선언 | 밀림 | Δ |
|---|---|---|---|
| `sm` | 48.56250 | **48.59375** | +0.031 |
| `md` | 82.84375 | **82.90625** | +0.063 |
| `lg` | 151 | **152.96875** | +1.969 |
| `xl` | 90 | **90** (면역 — 두 변 직접 선언) | 0 |

전부 `폭 × 193/135` 의 LayoutUnit(1/64px) 내림값과 **자릿수까지 일치**한다.

**③ 역검증** (`R-BASELINE-1` ⑥): 실제 캐러셀에서 `lg` 수정을 `position: static` 으로 끄면
**152.96875 가 돌아왔고**(135×193 표지 2장만, 나머지 4장은 151 유지) 다시 켜면 151 로 돌아왔다.

### 15.2 2단계 — 수정

`.haru-book-cover--sm`·`--md` 에 `position: relative`, `--sm img`·`--md img` 에
`position: absolute; inset: 0` (= `lg` 와 같은 해법). `lg` 규칙은 **건드리지 않았다**.
`xl` 은 두 변을 직접 선언해 면역이므로 적용하지 않았다 (실측 확인).

### 15.3 3단계 — 회귀 테스트

- `e2e/book-cover.spec.ts` (신규 2건) — `lg` 가 깨졌던 **column flex** 부모에 `sm`·`md`·`lg`·`xl`
  을 세우고 원본비 3종(135×193 · 100×400 · 400×100) + 이미지 없음에서 상자 높이가 **선언값을
  유지**함을 단정한다. 두 번째 테스트는 `position: absolute` 를 런타임에 끄고 **밀린 값
  (48.59375 / 82.90625 / 152.96875)이 돌아오는지** 확인한다 — 프로브가 실제로 무는지 역검증.
- `library-css-guards.test.ts` (신규 4건) — 수단이 지워지지 않았는지 고정 + `xl` 제외 근거.

**load-bearing 확인**: `--sm img`·`--md img` 규칙을 지우면 신규 e2e 가 실패한다 (실행 확인).

### 15.4 시각 baseline — **재생성 0건**

기존 baseline 전부 통과(`test:e2e` 217 = 215 + 신규 2). `R-BASELINE-1` ⑤ 에 따라 강제
재생성본을 픽셀 연결성분으로 분해해 원인을 전부 댔다.

**노이즈 바닥 = 0** (같은 코드로 2회 재생성 → 변화 0px, 9종 전부). 즉 아래 차이는 노이즈가 아니다.

**이 수정의 기여분** (HEAD 코드 재생성 ↔ 수정 코드 재생성) — 4종, **전부 Δ≤6**:

| baseline | 변화 px | maxΔ | 클러스터 위치 |
|---|---|---|---|
| `s3-home` | 1108 | 6 | 표지 상자 테두리·그림자 둘레 |
| `s3-home-deck` | 1061 | 6 | 같음 |
| `s3-home-deck-scrolled` | 696 | 2 | 같음 |
| `s3-book-cover` | 135 | **1** | `md` 상자 우측 경계 2px (x[119..120]) |

**기하 이동이 아니다.** 1px 이라도 밀렸으면 글리프·경계가 수십~수백 Δ 로 바뀌는데 최대가 6 이다.
원인은 상자가 **positioned 요소**가 되면서 테두리·그림자·이미지 리샘플링이 다시 래스터화된 것
한 가지이며, 40배 증폭 diff 를 육안 확인한 결과 **차이가 표지 상자 둘레에만 갇혀 있고 본문
텍스트는 0** 이다. 기존 baseline 이 그대로 통과하므로 재생성하지 않았다.

### 15.5 ⚠️ 선행 drift 6종 — 내 수정과 **무관**, 손대지 않았다

수정을 되돌린 **HEAD 코드로 재생성해도** 커밋된 baseline 과 다른 것이 6종 있다. 이번 작업
범위가 아니라 **보고만** 한다.

| baseline | 변화 px | maxΔ | 정체 |
|---|---|---|---|
| `frame-1024` | 13190 | **127** | **커밋된 baseline 에 dev Scenario Panel 이 찍혀 있다** (우하단 `scenario` pill). 지금 코드는 `hideDevPanel` 로 가려 찍히지 않는다 → `R-BASELINE-1` ② 유형의 **잔존 1건** |
| `s3-book-cover` | 176 | 2 | 캡션 행(y[338..343]) 텍스트 래스터화 |
| `v7-progress` | 50 | 15 | 좌우 끝 둥근 모서리 안티에일리어싱 |
| `v4-tag-chip` | 88 | 10 | chip 둥근 모서리 |
| `v2-material` | 84 | 4 | 카드 둥근 모서리 |
| `s2-inforow` | 6 | 7 | 상단 모서리 3px × 2 |

`frame-1024` 는 저대비(회색 위 회색)라 `FRAME_SNAPSHOT`(threshold 0.2) 가 거의 세지 않아
**통과한 채로 남아 있었다** — `R-BASELINE-1` ④ 가 경고한 검출 공백 그대로다. 처리 방침은
사용자 판단이 필요하다.

### 15.6 파일

```
수정  apps/web/src/entities/book/book.css            — sm·md 규칙 + 공통 근거 주석
수정  apps/web/__tests__/library-css-guards.test.ts  — 가드 4건 추가
신규  e2e/book-cover.spec.ts                         — 상자 기하 회귀 2건
```

검증: `typecheck` · `lint` · `test`(1511) · `lint:boundaries` · `build` · `format:check` ·
`assert:no-mocks` · `test:e2e`(217) 전부 통과. baseline 재생성 **0건**.
