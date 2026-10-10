# Stage 3 Library Plan — 서재 (Frontend)

Status: **APPROVED (2026-10-06, user)** — 승인 기록: `docs/decisions/stage-3-approvals.md` §20.1
작성: plan-agent, 2026-10-06
범위: Stage 3 의 **Library 라운드**. Home 라운드(`docs/plans/stage-3-plan.md`)는 별도이며 이 문서가 그것을 대체하지 않는다.

**Based on**
- PRD `docs/source/HARU_PRD_v1.5.md` v1.5 — FR-20 · FR-22 · FR-23 · FR-12 · §8.1 · §8.2 · §13
- Figma `YWWu3AFEJpRxvw0T5klq0k` page `16:2` (L-1 `30:74` · L-2 `145:1132` · L-3 `163:1669`), page `8:2` (`113:1993` This Week's Shelf · `163:2145` Book List · `163:1898` `type=shelf` · `86:372` Button/card · `85:592` Cardtitle)
- **전수 대조**: `docs/design/stage-3-library-figma-audit.md` (607줄, design-agent 2026-10-06) — 이 Plan 의 **주 입력**
- **사용자 결정**: `docs/decisions/stage-3-approvals.md` §14(사실관계 정정) · §15(`L-D1`~`L-D4`) · §12.8 `A-9` · §12.10 · §7 `D-7`
- 승인 문서: `docs/API_CONTRACTS.md`(§2.2 · §3.7 · §4 Stage 3 · §5.4) · `docs/DATA_MODEL.md` §7 `child_books` · `docs/DESIGN_TOKEN_MAP.md`
- 규칙: `CLAUDE.md` 최우선 규칙(Figma 그대로) · `.claude/rules/*.md`

**이 Plan 이 직접 실측한 것** (plan-agent 가 Figma 로 재확인, 전수 대조 재인용이 아님)
| 노드 | 확인 내용 |
|---|---|
| `145:928` (L-1 content) | 섹션 3개 = `Our curated shelf`(`163:1625`) · **`Favorites`**(`163:1633`) · `Finished together`(`30:139`). **"See all" 3개 모두 존재**(`163:1626`·`163:1634`·`145:680`). Book List `30:140` = 74pt 행 **4**, divider **1개**(`30:148`), `Rated 4.5` **4곳**(`109:511`·`109:519`·`163:1643`·`163:1654`) |
| `145:1141` (L-2 content) | `Reading now`(`145:1143`) + 액션 `3 of 5 nights`(`145:1144`) · 카드 `145:1145` 345×118 · `Our curated shelf`(**See all 없음**) · **`My Saved`**(`145:1157`, See all 없음) · `Finished together`(+See all) · Book List `145:1162` = 행 **2** |
| `145:779` (Favorites 캐러셀) | `This Week's Shelf` 인스턴스. 자식 텍스트가 `113:1994`(curated)와 **완전히 동일** — override 0건 |
| `113:1994` (curated 캐러셀) | 동일. `The Color Monster/Emotion` · `After the Fall/Resilience` · `The Dot/Confidence`, dots 3개(active=1, x=149.5 중앙 정렬) |

표기: `[실측]` Figma 좌표/구조 · `[추정]` 근거는 있으나 Figma 가 단정하지 않음 · `확인 불가` · `CONFIRMED` / `RECOMMENDED` / `NEEDS DECISION`.

---

## 1. Goal

`/library` 탭을 **Figma L-1 을 기준으로 L-2 의 `Reading now` 블록을 합성한 하나의 화면**으로 구현하고, FR-20 · FR-22 · FR-23 의 Frontend 부분을 Mock 위에서 완성한다.

1. `/library` 가 **4개 블록**(`Reading now` · `Our curated shelf` · `Favorites` · `Finished together`)을 Figma 실측 기하로 렌더한다 — `L-D1`·`L-D2`
2. `★ Save`(이미 동작 중)로 저장한 책이 **`Favorites` 섹션**에 나타나고, 거기서 **해제**할 수 있다 — `L-D1`, `G-13` 의 "해제 표면 = Library 라운드"
3. `Rated 4.5` 를 **Figma 대로 렌더**한다 — `L-D3`
4. `Finished together` 행 → **책 상세**(책별 Prompt 보기 = FR-20 4번째 기능), 섹션 "See all" → **목록 시트**
5. **보유 책 직접 등록**(FR-23)과 **증정 신청·배송 상태**(FR-22)가 Mock 으로 동작한다
6. `packages/contracts` 에 `LibraryBook` · `ReadingProgress` · `averageRating` · 섹션/목록 schema 가 추가되고 단위 테스트로 보증된다
7. 모든 섹션에 **섹션 단위 Loading / Empty / Error** 상태가 있다 — 특히 `Favorites` 0건 = **저장 전 기본 상태**

실제 집계·영속·증정 운영은 **Backend 요구사항**으로만 기록한다 (§10).

---

## 2. In Scope (Frontend)

### 2.1 화면 · 블록 단위

| # | 블록 / 화면 | Figma 근거 | 요구사항 | 비고 |
|---|---|---|---|---|
| **S-1** | `/library` 제목 행 — `Library`(28/Heavy) + streak chip | L-1 `30:88`·`30:89`·`30:90` | PRD §6.1 | **이미 구현됨**(`LibraryTopBar` + `HomeWeekSummary`). 칩 아이콘 차이 `A-23` 는 기등록, Library 에 그대로 적용 |
| **S-2** | **`Reading now`** 섹션 — 헤더(+`3 of 5 nights`) + 카드 345×118 | L-2 `145:1142`·`145:1145` | **`L-D2`** / `LN-2` | 표지 64×90 r10 · 제목 16 Bold · 부제 12 · 진행 바 h7 · 메타 11.5 |
| **S-3** | **`Our curated shelf`** 섹션 — 헤더(+See all) + 3-up 캐러셀 + dots | L-1 `163:1624`·`113:1994` | FR-20 · FR-22 · §8.1 | 큐레이션 20권 |
| **S-4** | **`Favorites`** 섹션 — 헤더(+See all) + 3-up 캐러셀 + dots | L-1 `163:1632`·`145:779` | **`L-D1`** / `LN-3` · `A-9` | `★ Save` 결과 표면. **`My Saved` 는 채택하지 않는다** |
| **S-5** | **`Finished together`** 섹션 — 헤더(+See all) + Book List 4행 | L-1 `30:138`·`30:140` | FR-20 "읽은 책 히스토리" | 행 = 썸네일 34×48 + 제목 + `{n} sessions · finished {date}` + **`Rated 4.5`** + chevron |
| **S-6** | **`Rated 4.5`** meta 렌더 | `109:511`·`109:519`·`163:1643`·`163:1654` | **`L-D3`** / `LN-1` | `Rated ` 11.5 Regular + `4.5` 12 Bold |
| **S-7** | **"See all" 시트** (`LibraryShelfSheet`) | L-3 `163:2347` / 원본 `163:1898` | FR-20 | 헤더 + Book List + (⑥ 결정 시) ActionBar. **형태는 `L-OPEN-03`·`L-OPEN-04` 결정 후** |
| **S-8** | **책 상세 시트** (`BookDetailSheet`) — 책별 Prompt 보기 | L-2 `145:1085`(+scrim `145:1450`) | **FR-20** (4기능 중 "책별 Prompt 보기") | Home 활동 카드 `163:2649` 와 **동일 기하 365×376.78** → 같은 컴포넌트 재사용 |
| **S-9** | **저장 해제** 진입점 | Figma 에 없음 → `L-OPEN-13` 계열 명세 | `G-13`(토글 결정) | contract `DELETE …/saved-books/:bookId` 는 **이미 정의·Mock 구현됨** |
| **S-10** | **`/library/add`** — 보유 책 직접 등록 | **없음** → `C-13` (`L-OPEN-12`) | **FR-23** · PRD §7.2 | 카탈로그 검색(Stage 2 `GET /v1/books/search` 재사용) → 결과 없음 시 제목·저자 직접 입력 |
| **S-11** | **`/library/gift-requests`** — 증정 신청·배송 상태 | **없음** → `C-13` (`L-OPEN-12`) | **FR-22** · PRD §13 | 상태 6종 표시. 배송지 **미수집**(`D-15`) |
| **S-12** | 증정 신청 CTA + 구매 링크 | `BookDetailSheet` 안 | FR-22 | 외부 링크는 `purchaseUrl` 그대로 |
| **S-13** | **섹션 단위 상태 화면** — Loading(Skeleton) / Empty / Error / Offline / Retry | **없음** → `#22` 명세 우선 (`L-OPEN-13`) | `rules/frontend.md` §7 | §8 참조 |
| **S-14** | Contract · Mock · 단위/contract 테스트 | — | 기술 요구사항 | §7 · §8 |

### 2.2 요구사항 ID 매핑

| 요구사항 | 근거 | 이번 라운드 Frontend 범위 | 이번에 **하지 않는** 부분 |
|---|---|---|---|
| **FR-20** 서재 — 증정·보유 라이브러리, 보유 책 직접 등록, 읽은 책 히스토리, 책별 Prompt 보기 (P1) | PRD:569 · §6.1:276 · §8.1 | S-3·S-4·S-5·S-7·S-8·S-10 | 히스토리 행 → **세션 상세 링크**(Stage 4·5). 큐레이션 20권 **콘텐츠 제작**(Handoff) |
| **FR-22** 책 라이브러리·증정 프로그램 (P0) | PRD:571 · §8.1:496 · §13:626 | S-3·S-11·S-12 | 실제 B2B 주문·배송·상태 전이(`P3-BIP-05`), 배송지 저장(`P3-BIP-06`) |
| **FR-23** 보유 책 직접 입력·등록 (P0) | PRD:572 · §7.2:393 | S-10 | 등록 책으로 **세션 시작**(Stage 4). 직접 등록 책의 범용 Prompt 콘텐츠(Handoff) |
| **FR-12** 세션 피드백(회고) 별점 | PRD:561 | **범위 밖**. 단 `L-D3` 의 `averageRating` 이 이 별점의 **집계**로 해석되므로 집계 규칙을 Backend 요구로 등록한다 | 회고 입력 화면(Stage 5) |
| `A-9` / `L-D1` 책 저장 | approvals §12.8 · §14.2 · §15 | S-4 · S-9 (**결과 표면과 해제**) | 없음 — Home 쪽 저장 동작은 이미 구현 |
| `L-D2` 다회차 읽기 진행 | approvals §15 / `LN-2` | S-2 | 진행 계획 **설정 UI**(Figma 에 없다) |
| `L-D3` 책 평점 | approvals §15 / `LN-1` | S-6 | 평점 **입력 UI**(Figma 에 없다) |
| 기술 요구사항 — 레이어·토큰·접근성·반응형 | `rules/*.md` · Stage 0 #10·#12 | §9 · §11 | — |

---

## 3. Out of Scope

| 항목 | 어디로 | 근거 |
|---|---|---|
| **`My Saved` 섹션** (L-2 `145:1156`·`145:1158`) | 채택하지 않는다 | `L-D1` 이 `Favorites` 를 택했다. **합성 기준 화면 L-1 에 없는 섹션**이므로 "빼는 것"이 아니라 "더하지 않는 것"이다 → 허용 차이 등록 대상 `AD-L-02` (§14) |
| **`This Week's Shelf` `Property 1=Selected`** (`113:1991`) — 체크 배지 + `▶ Session` Tag | 보류 | 어느 화면에도 인스턴스가 없다 → `L-OPEN-02` |
| **서재 항목에서 바로 세션 시작** (`LN-5`) | 보류 | PRD 에 흐름이 없고 `Selected` 변형에만 있다 |
| **세션 시작 자체** / 녹음 | Stage 4 | CTA 는 `D-3` 비활성 유지 (approvals §13.10) |
| **회고 별점 입력** | Stage 5 | FR-12 |
| **`/progress` 탭 내용** | Stage 7 | `D-2` 준비 중 안내 유지 |
| **상용 그림책 표지 에셋 교체** | **Stage 8 배포 전 필수** | `L-D4` · approvals §15.4 · §14.4 — 개발 중에는 Figma 표지를 그대로 쓴다 |
| **PRD 수정** (`LN-1`·`LN-2`·`LN-3`) | 사용자 승인 후 `D-24` 절차로 별도 패스 | plan-agent 는 PRD 를 고치지 않는다 |
| `docs/design/stage-3-design-spec.md` 의 `AD-S3-4`·`AD-S3-6`·`AD-S3-7`·`AD-S3-8`·`AD-S3-19` 재정리 | **design-agent** (§15 Handoff) | approvals §14.1 · §15.1 |

### Backend 구현 (전부 Out of Scope — `rules/backend.md` §1)

서재 섹션 집계 · 저장 목록 영속 · 완독 이력 파생 · **책 평점 집계** · **다회차 진행 집계** · 증정 신청 접수/배송 상태 · 카탈로그·표지 CDN · RLS · Idempotency 서버 보관. `apps/api/`, `supabase/` 를 만들지 않는다. §10 에 Integration Requirement 로만 적는다.

---

## 4. Dependencies

| # | 의존 | 상태 |
|---|---|---|
| D-a | Stage 3 Home 라운드 (탭바 마운트 · `SaveButton` · `BookSummary` · `ActivityOptionCard`·`PromptPill`·`CapabilityBadge`·`ProgressBar`·`PageIndicator`·`ListRow`/`ListGroup`·`Sheet`·`EmptyState`/`ErrorState`/`Skeleton`) | **충족** — 구현·QA 완료분 재사용 |
| D-b | `packages/contracts` `SaveBookTarget`/`SavedBook` · `BookOwnership`(`favorite_only` 포함) · `GiftRequestStatus`(6종, **이미 존재**) · `paginated` | **충족** |
| D-c | `MockLibraryApi`(save/unsave) · `libraryKeys.saved` · `mocks/fixtures/saved-books.ts` | **충족** — 목록 조회를 이 그룹에 추가 |
| D-d | **§15.5 미결 13건 + 이 Plan 이 추가한 9건** | **미충족 — 구현 착수 전 결정 필요** (§14) |
| D-e | `/library/add` · `/library/gift-requests` · 진입점 · 상태 화면의 **Figma 부재** | **미충족 — `C-13` 절차** (`L-OPEN-12`·`L-OPEN-13`) |
| D-f | design-agent `stage-3-library-design-spec.md` | 이 Plan 승인 후 |
| D-g | `L-D4` 표지 에셋 — 개발은 현행 유지, Stage 8 배포 게이트 | 조건부 |

---

## 5. Frontend Architecture Impact

레이어 변경은 없다. `app → pages → features → entities → shared` 를 그대로 쓴다.

```
pages/library/LibraryPage               (Composition only)
├ LibraryTopBar                         [기존]
└ features/library/LibraryShelves       섹션 4개 조립 + 섹션 상태
   ├ entities/library/useLibraryOverview        (Query)
   ├ entities/library/ReadingNowCard            (신규, 순수 표시)
   ├ entities/book/BookShelfCarousel            (신규)  → BookShelfItem → BookCover(lg)
   ├ entities/book/BookListRow                  (신규)  → ui/ListRow(media, meta)
   └ ui/SectionHeader                           (신규 Shared UI — 유일한 신규 shared)
features/library/LibraryShelfSheet      "See all"      → ui/Sheet | inset card (L-OPEN-04)
features/library/BookDetailSheet        책 상세·Prompt  → ActivityOptionCard 재사용
pages/library/AddOwnBookPage            → features/library/AddOwnBookForm
pages/library/GiftRequestsPage          → features/library/GiftRequestList
```

규칙 준수 지점:
- **API 호출 경로** `UI → use*(Query/Mutation) → libraryApi/booksApi → MockLibraryApi | HttpLibraryApi`. Page·Component 는 Adapter 를 직접 부르지 않는다
- `features/library` 는 `features/activity-card-deck` 을 import 하지 않는다. 공유되는 것(`ActivityOptionCard`·`SaveButton`·`PromptPill`)은 **`entities/activity-card`** 에 이미 있어 교차 import 가 발생하지 않는다 `[실측 — 현재 디렉터리 구조]`
- `packages/ui` 는 `contracts` 를 import 하지 않는다 → `SectionHeader`·`ListRow` 확장은 **도메인 타입을 받지 않는다**(ReactNode 슬롯)
- 캐러셀·목록은 `overflow` 를 쓴다 → **`R-SHADOW-1` 적용 필수**(그림자 겹 전부 합산 + 픽셀 프로브 + 세로·가로 양축 회귀 테스트). `L-OPEN-07` 이 `--shadow-glass-rest`(아래 77) ↔ `--shadow-bubble`(아래 10) 를 가르므로 **inset 값은 그 결정 후에 산정**한다
- 저장 성공·해제 성공은 `libraryKeys` 를 무효화한다. Home 의 `SaveButton` 과 Library 의 `Favorites` 가 **같은 캐시 축**을 본다

---

## 6. Data Requirement Delta (Backend Handoff 용 — 구현 아님)

`docs/DATA_MODEL.md` §7 `child_books` 기준. **열 설계·이름은 Backend 재량**(`D-23` 과 같은 취급).

| 테이블 | 요구 | 소유권 / 보관 | 상태 |
|---|---|---|---|
| `child_books` | 기존 축 유지(`ownership` 4값 · `source` 4값 + `card_save` · `saved`/`saved_at` · `first_read_at`/`last_read_at`/`read_count` · `user_entered_*` · CHECK) | caregiver→child 소유. FR-21 전체 삭제 대상 | **기존** |
| `child_books` 또는 파생 | **다회차 읽기 진행** — 완료 회차 · **계획 회차**(`of 5 nights`) · 마지막 읽은 시각 · 마지막 세션 길이(분) · 진행 비율 | 〃 | **신규 — `L-D2` / `LN-2`**. ⚠️ **계획 회차의 출처가 어디에도 없다** → `L-OPEN-17` |
| 평점 집계 (`session_reflections` → 책 단위 파생) | **책 단위 평균 별점** | 〃 | **신규 — `L-D3` / `LN-1`**. ⚠️ 집계 범위(해당 아동 자신 vs 카탈로그 전체) 미정 → `L-OPEN-18` |
| `books` | 표지 `cover_url` · `purchase_url` · 연령·주제 태그 · **표지 저작권 메타** | 운영 데이터 | 기존(`P3-BIP-04`) + `L-D4` 교체 요구 |
| `book_gift_requests` | 상태 6종 · `shipping_address_ref`(**Frontend 미수집**) | 성인 PII 결합 — 저장 위치 NEEDS DECISION | 기존(`P3-BIP-06`) |

Privacy: 서재는 **아동 이름·음성·Transcript 를 담지 않는다**. `Favorites`·히스토리는 보호자 행위 기록이며 FR-21 전체 삭제 대상에 포함된다. 로그·에러 리포트에 책 제목과 childId 를 함께 남기지 않는다.

---

## 7. API Contract Delta (`packages/contracts`)

### 7.1 기존 재사용 (신규 선언 금지)

`BookSummarySchema`(`books/search.ts`) · `BookOwnershipSchema`(`owned`/`gifted`/`gift_pending`/**`favorite_only`** — 이미 존재) · **`GiftRequestStatusSchema`**(6종 — **이미 존재**. 전수 대조 §10.1 의 "enum 신규"는 **정정 대상**) · `SaveBookTargetSchema` · `SaveBookRequestSchema` · `SavedBookSchema` · `CursorPageRequestSchema`/`paginated` · `IdSchema` · `IsoDateTimeSchema` · `CapabilitySchema` · `PromptKindSchema` · `AgeBandSchema` · `ErrorEnvelope`/`ErrorCode`.

### 7.2 신규 schema

| 파일 | 내용 | 근거 | 상태 |
|---|---|---|---|
| `src/library/reading-progress.ts` | `ReadingProgressSchema` = `{ completedNights: int ≥0, plannedNights: int ≥1 \| null, progressRatio: number 0–1 \| null, lastReadAt: IsoDateTime \| null, lastSessionMinutes: int ≥0 \| null }` | **`L-D2`** — `145:1144` `3 of 5 nights`, `145:1150` 진행 바, `145:1152` `Last read Tue · 12 min` `[실측]` | **CONFIRMED (L-D2)** / 필드 구성 **RECOMMENDED** · `plannedNights` 출처 **`L-OPEN-17`** |
| `src/library/library-book.ts` | `LibraryBookSchema` = `{ id, book: BookSummary \| null, userEnteredTitle?, userEnteredAuthor?, ownership: BookOwnership, source: BookSource, capability: Capability \| null, saved: boolean, savedAt: IsoDateTime \| null, firstReadAt?, lastReadAt?, readCount: int, sessionCount: int, averageRating: number(1–5, 소수 1자리) \| null, purchaseUrl?: url, giftRequestStatus?: GiftRequestStatus, readingProgress?: ReadingProgress }` | FR-20·22·23 + **`L-D3`**(`averageRating`) + `L-D1`(`saved`). `capability` = 캐러셀 캡션 2행 `[실측 113:1975 등]` | **CONFIRMED (FR-20, L-D1, L-D3)** / 필드명·`capability` 도입 **RECOMMENDED** (`L-OPEN-15`) |
| `src/library/overview.ts` | `LibraryOverviewSchema` = `{ readingNow: LibraryBook \| null, sections: { key: LibrarySectionKey, items: LibraryBook[], hasMore: boolean }[] }` — **화면 1회 조회** | 섹션 4개가 한 화면에 동시에 뜬다 `[실측 145:928 / 145:1141]`. 섹션별 개별 호출은 4-way 로딩이 되어 `P3-BIP-10`(2초) 를 악화시킨다 | **RECOMMENDED** |
| `src/library/list.ts` | `LibraryListRequestSchema` = `CursorPageRequest & { filter: LibraryFilter }`, `LibraryListResponseSchema = paginated(LibraryBookSchema)` — **"See all" 과 더 보기** | FR-20 · `L-OPEN-21` | **RECOMMENDED** |
| `src/library/add-book.ts` | `AddOwnBookRequestSchema` = `SaveBookTargetSchema` **재사용**(판별 union 공용화 — `saved-book.ts` 주석이 예고) → 응답 `LibraryBook` | **FR-23** · PRD §7.2 | **CONFIRMED (FR-23)** / 공용화 **RECOMMENDED** |
| `src/library/gift-request.ts` | `CreateGiftRequestRequestSchema` = `{ bookId }` (**배송지 필드 없음** — `D-15`), `GiftRequestSchema` = `{ id, book: BookSummary, status: GiftRequestStatus, requestedAt, statusUpdatedAt }`, `GiftRequestListResponseSchema = paginated(GiftRequestSchema)` | **FR-22** | **CONFIRMED (FR-22, D-15)** |
| `src/books/prompts.ts` | `BookPromptsResponseSchema` = `{ bookId, prompts: Prompt[], coachingLine, followUps }` — Stage 3 Home 의 `promptSet` 타입과 **중복 선언 금지**(재사용/확장) | **FR-20** "책별 Prompt 보기" · §8.2 | **CONFIRMED (FR-20)** / 재사용 형태 **RECOMMENDED** |

### 7.3 신규 enum

| 파일 | 값 | 근거 | 상태 |
|---|---|---|---|
| `src/enums/library-section.ts` | `LibrarySectionKeySchema` = `curated`, `favorites`, `finished` | **표시 축** — Figma 섹션 제목 3개 `[실측]`. `reading_now` 는 `sections[]` 가 아니라 `readingNow` 단일 필드이므로 enum 에 넣지 않는다 | **RECOMMENDED** |
| `src/enums/library-filter.ts` | `LibraryFilterSchema` = `owned`, `gifted`, `history`, `saved`, `curated` | **쿼리 축** — `API_CONTRACTS.md` §2.2 에 `owned/gifted/history/saved` 로 등재됨. `curated` 추가는 "See all" 때문 | **RECOMMENDED** — ⚠️ 표시 축과 쿼리 축이 **1:1 이 아니다**(§14 `L-OPEN-14`) |
| `src/enums/book-source.ts` | `BookSourceSchema` = `onboarding_favorite`, `library_add`, `gift_program`, `card_save` | `DATA_MODEL.md` §7 · `API_CONTRACTS.md` §2.2 | **RECOMMENDED** |

### 7.4 Error Code

| 코드 | 사용처 | 상태 |
|---|---|---|
| `GIFT_REQUEST_DUPLICATE` (409) | `POST …/gift-requests` 중복 신청 | **기존 계획 유지**(`API_CONTRACTS` · `P3-BIP-05`) — 실제 등재 여부는 development-agent 확인 |
| `BOOK_ALREADY_OWNED` | `POST …/library/books` 중복 등록 | **RECOMMENDED** — 필요 없으면 멱등 응답으로 대체 |
| `VALIDATION_FAILED` · `RESOURCE_NOT_FOUND` · `CHILD_NOT_FOUND` · `IDEMPOTENCY_KEY_REUSED` · `INTERNAL_ERROR` | 전 endpoint | 기존 |

**신규 error code 는 최대 2건**이다. 저장/해제는 `A-9`·§12.10 대로 **신규 0건**을 유지한다.

### 7.5 Endpoint (Contract 만 — 구현은 Backend)

| M | path | req | res | error | auth | IK | 상태 |
|---|---|---|---|---|---|---|---|
| GET | `/v1/children/:childId/library/overview` | — | `LibraryOverview` | `CHILD_NOT_FOUND` | 필요 | — | **신규 RECOMMENDED** |
| GET | `/v1/children/:childId/library?filter=&limit=&cursor=` | — | `Paginated<LibraryBook>` | `VALIDATION_FAILED`, `CHILD_NOT_FOUND` | 필요 | — | 기존 계획 |
| POST | `/v1/children/:childId/library/books` | `AddOwnBook` | `LibraryBook` | `VALIDATION_FAILED`, `IDEMPOTENCY_KEY_REUSED`, (`BOOK_ALREADY_OWNED`) | 필요 | **필수** | 기존 계획 |
| PUT | `/v1/children/:childId/saved-books` | `SaveBook` | **`LibraryBook`** (`SavedBook` → 전환 — `L-OPEN-20`) | `RESOURCE_NOT_FOUND`, `VALIDATION_FAILED` | 필요 | 불필요(멱등) | **구현됨 / 응답 전환 검토** |
| DELETE | `/v1/children/:childId/saved-books/:bookId` | — | **`LibraryBook`**(`saved=false`) 또는 204 | `RESOURCE_NOT_FOUND` | 필요 | — | **구현됨 / 응답 전환 검토** |
| GET | `/v1/books/:bookId/prompts?childId=` | — | `BookPromptsResponse` | `RESOURCE_NOT_FOUND` | 필요 | — | 기존 계획 |
| POST | `/v1/children/:childId/gift-requests` | `CreateGiftRequest` | `GiftRequest` | `GIFT_REQUEST_DUPLICATE`, `VALIDATION_FAILED` | 필요 | **필수** | 기존 계획 |
| GET | `/v1/children/:childId/gift-requests` | — | `Paginated<GiftRequest>` | `CHILD_NOT_FOUND` | 필요 | — | 기존 계획 |
| GET | `/v1/books/search?q=` | — | `Paginated<BookSummary>` | — | 필요 | — | **Stage 2 재사용** (`/library/add`) |

`docs/API_CONTRACTS.md` 갱신은 **설계 변경 부분만** 이 Plan 승인 후 plan-agent 가, 구현 확정 반영은 development-agent 가 한다 (`rules/workflow.md` §5).

---

## 8. Mock Scenarios

`apps/web/src/mocks/library/` 의 기존 `library` 그룹(현재 `success`·`loading`·`error`·`retry`·`offline`·`book-saved`)을 **확장**한다. 모든 시나리오는 결정적이어야 하며 fixture 는 `mocks/fixtures/` 에만 둔다.

### 8.1 공통 5종

| key | 적용 | 기대 |
|---|---|---|
| `success` | overview · list · prompts · add · gift | 4섹션 전부 채워진 기본 상태 |
| `loading` | 〃 | 주입 timer 지연 → **섹션별 Skeleton** |
| **`empty`** | overview · list · gift | **신규 추가** — 전체 0건 (기존 `library` 그룹에는 `empty` 가 없었다: 저장은 상태 설정이라 빈 결과가 없었기 때문) |
| `error` | 〃 | contracts Error Envelope → ErrorState + Retry |
| `retry` | 〃 | 1회차 실패 → 2회차 성공 |

### 8.2 Library 특화 — **섹션별 EMPTY 가 핵심**

| key | 내용 | 검증 대상 |
|---|---|---|
| **`favorites-empty`** | `Favorites` 만 0건, 나머지 정상 | **저장 전 기본 상태** — 가장 흔한 실제 상태다. 섹션이 사라지지 않고 안내가 뜬다 |
| **`reading-now-none`** | `readingNow: null` | `Reading now` 블록 **미렌더 + 상단 간격 회수**(위 섹션이 올라붙음) |
| **`finished-empty`** | `Finished together` 0건 | 히스토리 0건 안내 |
| **`curated-empty`** | 큐레이션 0건 | 운영 데이터 공백(`P3-BIP-04`) |
| **`shelf-partial`** | 캐러셀 항목 **1권 / 2권** | Figma 는 항상 3-up `[실측]` → 1~2권 레이아웃이 Figma 에 **없다**(`L-OPEN-13`) |
| **`unrated`** | `averageRating: null` | **평점 없는 책의 meta 표시** — Figma 에 unrated 상태가 없다 (`L-OPEN-22`) |
| **`book-saved`** | 기존 유지 | 재저장 멱등(같은 `savedAt`) |
| **`unsave`** | 해제 성공 후 `Favorites` 에서 사라짐 | `G-13` 토글 + 캐시 무효화 |
| **`gift-pending`** | `ownership=gift_pending` + 배송 상태 | PRD §13 증정 대기 |
| **`gift-duplicate`** | `GIFT_REQUEST_DUPLICATE` | 중복 신청 안내 |
| **`user-entered-book`** | 표지 없는 직접 등록 책 | `BookCover` placeholder + 범용 Prompt |
| **`paged`** | `hasMore=true` + cursor 2페이지 | "See all" · 더 보기 (`L-OPEN-21`) |
| `offline` | `NetworkError` | 오프라인 경로 = 실패 경로와 동일(사전 차단 UI 를 만들지 않는다) |

`docs/API_CONTRACTS.md` §5.4 시나리오 카탈로그에 신규 key 를 **등재**한다 (등재 자체는 development-agent 가 구현과 함께 확정).

---

## 9. Frontend Scope (route / page / feature / entity)

상세 UI 수치는 design-agent 가 확정한다. 아래는 **배치 단위**다.

| route | page | 형태 | guard | Figma |
|---|---|---|---|---|
| `/library` | `LibraryPage` | Tab | 온보딩 완료 | **합성 기준**: L-1 `30:74` + L-2 `145:1145` (§9.1) |
| `/library/add` | `AddOwnBookPage` | Stack | 온보딩 완료 | **없음 — `L-OPEN-12`** |
| `/library/gift-requests` | `GiftRequestsPage` | Stack | 온보딩 완료 | **없음 — `L-OPEN-12`** |

시트 2종(`LibraryShelfSheet` · `BookDetailSheet`)은 `D-17` 대로 **부모 페이지 상태로 구현하고 Mock 데모용 route 를 한 파일에 모아 추가**한다. route 가 사라져도 시트가 동작해야 한다.

### 9.1 ⭐ 기준 화면 합성 방식 (제안 — 승인 대상 `L-OPEN-01`)

**결론: 기준 = L-1 `30:74`. L-2 에서 가져오는 것은 `Reading now` 블록 하나다.**

**근거 1 — 노드 ID 세션 순서** `[실측]`
Figma 노드 ID 는 `세션ID:로컬ID` 이며 세션 ID 가 클수록 나중 편집 세션이다. Library 계열은 `30 < 113 < 145 < 163` 이다.

| 프레임 | 자식 노드 세션 | 해석 |
|---|---|---|
| **L-1 `30:74`** (content `145:928`) | `163:1624`·`163:1632`·`163:1636`·`163:1647` = **163 세션 편집 포함** | **가장 나중에 손댄 프레임** |
| L-2 `145:1132` (content `145:1141`) | 전부 **145 세션** | 163 세션에서 **건드리지 않았다** |
| L-3 `163:1669` | 163 세션 사본 | 섹션 제목이 `Finished together` 로 **중복** = `163:1633` 이 `Favorites` 로 **텍스트 편집되기 전** 상태의 사본 `[추정]` (Figma 텍스트 편집은 노드 ID 를 바꾸지 않는다) |

→ `Favorites`(`163:1633`) 가 **가장 나중 의도**이고, approvals §14.1 의 정정과 일치한다.

**근거 2 — 노드 이름** `[실측]`: L-1·L-3 은 `2a · Library — Bookshelf & History/Defult shelf`("기본 서재"), **L-2 는 이름이 공백 `" "`** 이며 base 레이어에 책 상세 오버레이를 달고 있다 → L-2 는 **오버레이 스터디 프레임**이다.

**근거 3 — "See all" 분포** `[실측]`: L-1 은 세 헤더 모두 "See all"(`163:1626`·`163:1634`·`145:680`), L-2 는 `Finished together` 하나뿐. 163 세션에서 L-1 에 "See all" 이 **추가**된 것으로 읽힌다 `[추정]`.

**근거 4 — 합성 결과가 L-2 의 y 좌표와 정확히 일치한다** `[실측 — 이것이 결정적이다]`
L-2 content `145:1141` 의 자식 y: `0 / 36 / 170 / 206 / 438 / 474 / 706 / 742`.
L-1 의 3섹션 위에 `Reading now`(헤더 20 + 간격 16 + 카드 118 = 154, 다음 간격 16 → **+170**)를 얹으면:

| 슬롯 | 블록 | 출처 노드 | h | **합성 y** | L-2 실측 y |
|---|---|---|---|---|---|
| 1 | SectionHeader `Reading now` + `3 of 5 nights` | **L-2 `145:1142`** | 20 | **0** | 0 ✓ |
| 2 | Reading now 카드 345×118 r24 | **L-2 `145:1145`** | 118 | **36** | 36 ✓ |
| 3 | SectionHeader `Our curated shelf` + **See all** | L-1 `163:1624` | 20 | **170** | 170 ✓ |
| 4 | `This Week's Shelf` 캐러셀 | L-1 `113:1994` | 216 | **206** | 206 ✓ |
| 5 | SectionHeader **`Favorites`** + **See all** | L-1 `163:1632` | 20 | **438** | 438 ✓ (L-2 는 `My Saved`) |
| 6 | `This Week's Shelf` 캐러셀 | L-1 `145:779` | 216 | **474** | 474 ✓ |
| 7 | SectionHeader `Finished together` + See all | L-1 `30:138` | 20 | **706** | 706 ✓ |
| 8 | Book List **4행** | L-1 `30:140` | 297 | **742** | 742 ✓ (L-2 는 2행 149) |

→ **합성은 창작이 아니다.** L-2 의 기하를 그대로 쓰고, 슬롯 5 의 라벨만 L-1 의 `Favorites` 로, 슬롯 3·5 의 "See all" 을 L-1 대로 복원하고, 슬롯 8 을 L-1 의 4행으로 둔 것이다. 모든 섹션 간격은 **16**(`--space-4`) 이다 `[실측, 두 프레임 공통]`.

**합성 화면 치수**: content `x=24 w=345 y=66` · 제목 행 h40 @y0 · Frame15 @y56 h **1039**(= 869 + 170) · Frame15 하단 → 탭바 상단 **32** `[실측 L-1 규칙 승계]`.

**이 합성이 만드는 차이 — 허용 차이 등록 대상** (사용자 승인 후):

| ID | 차이 | 근거 |
|---|---|---|
| `AD-L-01` | L-1 에 없던 `Reading now` 블록(170pt)을 **추가** | **`L-D2`** |
| `AD-L-02` | L-2 의 `My Saved` 섹션(슬롯 5) 을 **채택하지 않고** L-1 의 `Favorites` 를 쓴다 | **`L-D1`** |
| `AD-L-03` | 슬롯 3·5 의 "See all" 을 **유지**한다 (L-2 에는 없다) | 기준 = L-1 |
| `AD-L-04` | 슬롯 8 Book List 를 **4행**으로 둔다 (L-2 는 2행) | 기준 = L-1. 행 수는 데이터 의존이며 Figma 는 "4행 고정" 을 명시하지 않는다 `[추정]` → `L-OPEN-21` |
| `AD-L-05` | L-3 를 기준으로 쓰지 않는다 (섹션 제목 중복은 사본 아티팩트) | approvals §14.1 |

### 9.2 Feature / Entity / Shared UI

| 분류 | 항목 | 신규/확장 | 근거 |
|---|---|---|---|
| **Shared UI** | **`SectionHeader`** — 제목 17/Bold + 선택적 액션 12/Medium, `space-between`, baseline 정렬, **액션 hit-area 44 확장** | **신규 (유일한 shared 신규)** | `163:1624` 외 7곳 `[실측]` |
| Shared UI | `ListRow` — **`media`(34×48) · `meta`(우측 보조) 슬롯** 추가 | 확장 (소스 주석이 "Stage 3" 로 예고) | `163:2145` |
| Shared UI | `ListGroup` — 면·그림자 변형 | 확장 — **`L-OPEN-07` 결정 후** | `30:140` |
| Shared UI | `Sheet` — inset 카드 변형 | 확장 — **`L-OPEN-04` 결정 후** | `145:1085`·`163:2347` |
| entities/book | `BookCover` size `sm`(34×48) · `xl`(64×90) · `lg`(107×151) | 확장 (현재 `md` 단일) | `[실측]` |
| entities/book | **`BookShelfItem`** — 표지 + 제목 12/Semibold + 캡션 11/Regular, gap 7 | 신규 | `113:1971` |
| entities/book | **`BookShelfCarousel`** — 3-up 가로 scroll-snap + `PageIndicator`(dots y=207, 중앙 정렬, active=1) | 신규 — **`R-SHADOW-1` 대상** | `113:1992` `[실측]` |
| entities/book | **`BookListRow`** — `ListRow(media, meta)` 래퍼 | 신규 | `163:2100` |
| entities/library | **`ReadingNowCard`** — 표지 64×90 + 제목/부제/진행 바/메타 | 신규 | `145:1145` `[실측]` |
| entities/library | `libraryKeys` 확장(`overview`·`list(filter)`·`giftRequests`), `useLibraryOverview`·`useLibraryList`·`useAddOwnBook`·`useGiftRequests`·`useCreateGiftRequest`·`useBookPrompts` | 확장 (`libraryKeys.saved` 기존) | — |
| features/library | `LibraryShelves` · `LibraryShelfSheet` · `BookDetailSheet` · `AddOwnBookForm` · `GiftRequestList` | 신규 | — |
| 재사용(수정 0) | `BottomTabBar` · `TopBar(large)` · `WeekSummaryChip` · `PageIndicator` · `ProgressBar` · `ActivityOptionCard`+`PromptPill`+`CapabilityBadge`+`SaveButton` · `Tag` · `EmptyState`/`ErrorState`/`Skeleton`/`InlineAlert` · `TextField`/`FieldGroup`/`Button` | — | 전수 대조 §4.1 |
| 아이콘 | Lucide `chevron-right`(15, stroke 1.375) · 기존 `haru:flip-to-back` · (⑤ 채택 시) `check`·`play` | **HARU 전용 SVG 신규 0건** | 전수 대조 §5 |

### 9.3 Copy

`apps/web/src/shared/copy/library-copy.ts` 를 확장한다 (현재 `title`·`empty` 만 존재 `[실측]`).
- 섹션 제목은 **Figma 문구 그대로**: `Our curated shelf` · `Favorites` · `Finished together` · `Reading now` · `See all` · `Rated ` · `{n} sessions · finished {date}` · `Last read {day} · {min} min` · `{a} of {b} nights`
- **"Books you own" 을 쓰지 않는다** — Figma 에 없는 문구다 (approvals §14.1)
- 캐러셀 캡션 2행의 역량 라벨은 `capability-copy.ts` 의 **#14 표시 라벨**을 쓴다(`AD-S3-5` 유지). Figma 의 `Resilience`/`Confidence` 는 4대 역량에 없는 이름이다 (`LN-4`, 미결)
- 진단·판정·비교 표현 금지. `Rated 4.5` 는 **서버 값 표시**이며 Frontend 가 등급·우열 문구를 더하지 않는다

---

## 10. Backend Integration Requirements

### 10.1 신규 `BACKEND_INTEGRATION_PENDING`

Stage 3 Home 라운드의 `P3-BIP-01`~`15` 에 이어 **4건**을 추가한다.

| # | PENDING 항목 | Contract 로 표현되는 기대 동작 | Frontend 부분 (별도 판정) | Handoff |
|---|---|---|---|---|
| **P3-BIP-16** | **책 단위 평점 집계** (`L-D3` / `LN-1`) — 어느 모집단의 FR-12 세션 별점을 평균하는지, 표본 최소치, 소수 자리, 평점 없는 책 처리. **비판정 톤 적합성 검토 필요**(`rules/frontend.md` §8) | `LibraryBook.averageRating: number \| null` — **표시 전용**. Frontend 는 평균을 계산·가공·등급화하지 않는다 | **AC-3L-12**(값 그대로 렌더) · **AC-3L-13**(`null` 처리) | `DATA_REQUIREMENTS.md`, `BACKEND_HANDOFF.md` + **NEEDS DECISION `L-OPEN-18`** |
| **P3-BIP-17** | **다회차 읽기 진행 집계** (`L-D2` / `LN-2`) — `completedNights`·**`plannedNights`(출처 불명)**·`progressRatio`·`lastReadAt`·`lastSessionMinutes` 의 소유. "Reading now" 대상 책 1권의 선정 규칙도 서버 소유 | `LibraryBook.readingProgress` + `LibraryOverview.readingNow` — **표시 전용**. 진행 비율을 Frontend 가 재계산하지 않는다 | **AC-3L-07**·**AC-3L-08**·**AC-3L-09** | `DATA_REQUIREMENTS.md`, `BACKEND_HANDOFF.md` + **NEEDS DECISION `L-OPEN-16`·`L-OPEN-17`** |
| **P3-BIP-18** | **서재 섹션 집계 1회 조회** — `curated`/`favorites`/`finished` 의 정렬 규칙·항목 수·`hasMore`, 섹션별 커서 페이지네이션, `Favorites` 영속·순서(저장 시각 역순 `[추정]`) | `GET …/library/overview` → `LibraryOverview`, `GET …/library?filter=` → `Paginated<LibraryBook>` | **AC-3L-02**·**AC-3L-05**·**AC-3L-16** | `BACKEND_HANDOFF.md`, `DATA_REQUIREMENTS.md` |
| **P3-BIP-19** | **표지 에셋 교체 게이트** (`L-D4`) — 상용 그림책 표지 4종(*The Most Magnificent Thing*·*Grumpy Monkey*·*After the Fall*·*Where the Wild Things Are*) 이 Mock 데모 웹 프리뷰(C-18)·스토어 스크린샷에 나가지 않도록 한다. 표지 저작권 메타·CDN 접근 제어 | `BookSummary.coverUrl` 는 그대로. **에셋 교체는 contract 변경 없음** | **AC-3L-27**(Stage 8 재검증 항목으로 이월) | `DATA_REQUIREMENTS.md` + **사용자·법무 확인 (approvals §14.4)** |

### 10.2 기존 PENDING 에 참조만 추가되는 항목

`P3-BIP-04`(카탈로그 20권·표지·구매 링크) · `P3-BIP-05`(증정 운영·상태 전이·중복 판정) · `P3-BIP-06`(배송지 PII) · `P3-BIP-09`(`child_books` 소유·히스토리 파생) · `P3-BIP-10`(2초 NFR — overview 응답이 섹션 4개를 담으므로 **응답 크기 요구가 커진다**) · `P3-BIP-12`(IK 24h — `POST …/library/books`·`…/gift-requests`) · `P3-BIP-15`(저장 상태 서버 소유 — **해제 표면이 이번에 생기므로 `DELETE` 경로가 처음 실사용된다**).

### 10.3 Handoff 에 추가로 남기는 요구

① `averageRating`·`readingProgress`·`reason`·`coachingLine`·Prompt 문구는 **서버 생성/집계 값**이며 Frontend 가 가공하지 않는다 ② `Favorites` 는 **온보딩 `favoriteBooks` 와 다른 데이터**다(§3.7.1 — 설문 스냅샷을 사후 수정하지 않는다) ③ `Favorites` 는 **상한이 없다**(Figma 에 카운터·상한 안내가 없다) ④ FR-21 전체 삭제 대상에 `saved`·히스토리·증정 신청이 포함된다 ⑤ 서재 응답에 **아동 이름·Transcript·오디오 경로를 넣지 않는다**.

---

## 11. Acceptance Criteria

ID 체계 `AC-3L-##` (Stage 3 Library 라운드). Home 라운드의 `AC-3-##` 와 충돌하지 않는다.
"PENDING 예상" = 실제 Backend 없이는 그 부분을 검증할 수 없어 `BACKEND_INTEGRATION_PENDING` 판정이 예상되는 항목. Frontend 부분은 **별도 AC 로 쪼개 두었다**.

### 11.1 합성 기준 화면 · 레이아웃

| ID | 기준 | 검증 방법 | 요구사항 | PENDING |
|---|---|---|---|---|
| **AC-3L-01** | `/library` 가 **슬롯 1~8 을 §9.1 표의 순서와 y 좌표(±2px)** 로 렌더한다. 섹션 간격은 모두 16 이다 | Playwright 구현 screenshot ↔ Figma L-1 + L-2 비교 + DOM 좌표 측정 | `L-D1`·`L-D2`, `[실측]` | — |
| **AC-3L-02** | 섹션 제목 문구가 **`Reading now` / `Our curated shelf` / `Favorites` / `Finished together`** 이며 `Books you own` · `My Saved` 문자열이 번들·DOM 에 **0건** 이다 | e2e DOM 텍스트 + `grep` | approvals §14.1, `L-D1` | — |
| **AC-3L-03** | 슬롯 3·5·7 헤더에 "See all" 이 있고 각 hit-area 가 **≥44×44** 다. 슬롯 1 의 액션 자리는 `{a} of {b} nights` **상태 텍스트**이며 조작 요소가 아니다 | e2e + 접근성 트리 | `[실측 163:1626/163:1634/145:680/145:1144]`, `L-OPEN-17` | — |
| **AC-3L-04** | `/library` 에 BottomTabBar 가 `Active=Library` 로 마운트되고 **SPA 이동**(전체 리로드 0건)한다 | e2e + navigation 이벤트 | `X-1` 회귀 | — |

### 11.2 Favorites (`L-D1`)

| ID | 기준 | 검증 | 요구사항 | PENDING |
|---|---|---|---|---|
| **AC-3L-05** | `Favorites` 섹션이 `GET …/library/overview` 의 `favorites` 섹션 항목만 렌더하고, 하드코딩 fixture 를 쓰지 않는다 | e2e + `grep`(컴포넌트 내 fixture 0건) | `L-D1` | 정렬·항목 수는 **P3-BIP-18** |
| **AC-3L-06** | Home 에서 `★ Save` 성공 → `/library` 의 `Favorites` 에 **그 책이 보인다** (캐시 무효화) | e2e (Mock `success`) | `A-9`·`L-D1` | 영속은 **P3-BIP-15** |
| **AC-3L-07** | `Favorites` 에서 **저장 해제**가 동작하고(`DELETE …/saved-books/:bookId`) 목록에서 사라진다. 실패 시 롤백 + Toast | e2e (`unsave`·`error`) + 요청 로그 | `G-13` | 서버 처리 **P3-BIP-15** |
| **AC-3L-08** | `favorites-empty` 시나리오에서 **섹션이 사라지지 않고** 안내가 뜬다 (저장 전 기본 상태) | e2e | `L-OPEN-13` 명세 | — |

### 11.3 Reading now (`L-D2`)

| ID | 기준 | 검증 | 요구사항 | PENDING |
|---|---|---|---|---|
| **AC-3L-09** | `Reading now` 카드가 345×118 r24 · 표지 64×90 r10 · 제목 16 Bold · 부제 12 · 진행 바 h7 r4 · 메타 11.5 로 렌더된다 | 시각 비교 + DOM 측정 | `[실측 145:1145]` | — |
| **AC-3L-10** | 진행 바 채움과 `{a} of {b} nights` 가 **서버 값에서만** 온다. Frontend 에 비율 계산 로직이 없다 | 코드 검사 + Mock 값 변주 | `rules/frontend.md` §8 | 집계 **P3-BIP-17** |
| **AC-3L-11** | `reading-now-none` 시나리오에서 **블록이 미렌더되고 아래 섹션이 170pt 올라붙는다**(빈 공간 0) | e2e + 좌표 측정 | `L-OPEN-13` | — |
| **AC-3L-12** | `Last read {day} · {min} min` 이 서버 문자열/값을 그대로 쓰고 Frontend 가 상대 시간을 **재계산하지 않는다** | 코드 검사 | `[실측 145:1152]` | **P3-BIP-17** |

### 11.4 Rated (`L-D3`)

| ID | 기준 | 검증 | 요구사항 | PENDING |
|---|---|---|---|---|
| **AC-3L-13** | Book List 행의 우측 meta 에 `Rated ` 11.5 Regular + `4.5` 12 Bold 가 Figma 좌표(텍스트 열 237 중 x=179, w=58)로 렌더된다 | 시각 비교 + DOM | **`L-D3`** `[실측 109:511]` | — |
| **AC-3L-14** | `unrated` 시나리오(`averageRating: null`)에서 **레이아웃이 깨지지 않고** 좌측 정렬이 유지된다 | e2e | `L-OPEN-22` 명세 | 집계 **P3-BIP-16** |
| **AC-3L-15** | 평점 주변에 등급·우열·비교 문구가 **없다**(`Rated` 외 수식어 0건) | copy 검사 | `rules/frontend.md` §8 | — |

### 11.5 Finished together · 시트 · 상세

| ID | 기준 | 검증 | 요구사항 | PENDING |
|---|---|---|---|---|
| **AC-3L-16** | Book List 행 = 썸네일 34×48 r7 + 제목 14/Semibold + `{n} sessions · finished {date}` + meta + chevron 15, 행 높이 72~74, 터치 ≥44 | 시각 비교 + DOM | FR-20 `[실측]` | 집계 **P3-BIP-09** |
| **AC-3L-17** | 행 divider 가 **`L-OPEN-05` 결정대로** 렌더된다 (결정 전 구현 금지) | 시각 비교 | `L-OPEN-05` | — |
| **AC-3L-18** | 섹션 "See all" → `LibraryShelfSheet` 가 열리고 `GET …/library?filter=` 를 호출하며 cursor 로 2페이지를 더 불러온다 | e2e (`paged`) + 요청 로그 | FR-20 | 정렬·커서 **P3-BIP-18** |
| **AC-3L-19** | Book List 행 탭 → `BookDetailSheet` 가 열리고 `GET /v1/books/:bookId/prompts` 응답의 **Prompt·코칭 문장을 그대로** 표시한다 (개수 상한 없음, `slice` 금지) | e2e + 코드 검사 | **FR-20** · `D-21` | 콘텐츠 **P3-BIP-03** |
| **AC-3L-20** | 시트 scrim·형태가 **`L-OPEN-04`·`L-OPEN-06` 결정대로**다. 포커스 트랩·Esc·배경 스크롤 잠금·복귀 포커스가 동작한다 | e2e + 접근성 | `rules/frontend.md` §9 | — |

### 11.6 FR-22 · FR-23

| ID | 기준 | 검증 | 요구사항 | PENDING |
|---|---|---|---|---|
| **AC-3L-21** | `/library/add` 에서 카탈로그 검색(재사용 `GET /v1/books/search`) → 선택 등록, **결과 없음 → 제목·저자 직접 입력** 경로가 모두 동작하고 `Idempotency-Key` 가 전송된다 | e2e + 요청 로그 | **FR-23** · §7.2 | IK 보관 **P3-BIP-12** |
| **AC-3L-22** | 등록된 직접 입력 책이 서재에 표지 **placeholder** 로 나타난다 | e2e (`user-entered-book`) | FR-23 | — |
| ~~**AC-3L-23**~~ | ~~`BookDetailSheet` 의 증정 신청 CTA → `POST …/gift-requests`(IK) 가 발생하고 `gift-duplicate` 시나리오에서 `GIFT_REQUEST_DUPLICATE` 안내가 뜬다~~ → **폐기** (사용자 결정 2026-10-10, `approvals §30.1`) — 증정 **신청** 기능이 제거되어 이 AC 의 주어가 사라졌다 (§29.4). 중복 판정·멱등 처리는 contracts·Mock 에 남아 있으나 **화면에서 도달할 수 없다**. 판정 대상에서 물러난다 | ~~e2e + 요청 로그~~ | **FR-22** | 운영 **P3-BIP-05** |
| **AC-3L-24** | `/library/gift-requests` 가 상태 6종을 표시하고 **배송지 입력 필드가 0개**다 | e2e + DOM | FR-22 · `D-15` | 배송 **P3-BIP-05·06** |
| **AC-3L-25** | 구매 링크가 `purchaseUrl` 를 그대로 외부 열기하며 `rel="noreferrer"` 다 | e2e | FR-22 · §8.1 | 링크 데이터 **P3-BIP-04** |

### 11.7 Contract · Mock · 아키텍처

| ID | 기준 | 검증 | PENDING |
|---|---|---|---|
| **AC-3L-26** | §7 신규 schema·enum 이 `packages/contracts` 에만 선언되고 앱 안 중복 선언 0건, `z.infer` 파생, `pnpm typecheck` 통과 | `grep` + typecheck | — |
| **AC-3L-27** | Mock Adapter 의 모든 요청·응답이 contracts schema parse 를 통과한다 (시나리오 전 key) | contract 테스트 | — |
| **AC-3L-28** | §8 시나리오 **전 key** 가 결정적으로 재현되고 `docs/API_CONTRACTS.md` §5.4 카탈로그와 1:1 이다 | 테스트 + 문서 대조 | — |
| **AC-3L-29** | Mock fixture 가 Component/Page/Feature 에 하드코딩되지 않는다 | `grep` | — |
| **AC-3L-30** | 레이어 역방향·feature 간 직접 import·`ui → contracts` 위반 0건. `LibraryPage` 에 API 호출·복잡 로직·fixture 0건 | lint:boundaries + 코드 검사 | — |
| **AC-3L-31** | `PUT`/`DELETE …/saved-books` 응답 타입 전환(`L-OPEN-20`)이 결정대로 반영되고 Home 의 `SaveButton` 경로가 **회귀 없이 동작**한다 | 단위 + e2e 회귀 | — |

### 11.8 디자인 시스템 · 접근성 · 반응형 · Privacy

| ID | 기준 | 검증 | PENDING |
|---|---|---|---|
| **AC-3L-32** | 신규 코드에 임의 HEX / `rgb()` / Tailwind arbitrary value / inline 수치 **0건**. 신규 토큰은 Tier2 semantic 을 거친다 (`LT-1`·`LT-2` 결정 반영) | `grep` + 토큰 대조 | — |
| **AC-3L-33** | 캐러셀·목록의 `overflow` 박스에서 **그림자가 클리핑되지 않는다** — 겹 전부 합산, 픽셀 프로브, **세로·가로 양축** 회귀 테스트 | Playwright 픽셀 프로브 | — (`R-SHADOW-1`) |
| **AC-3L-34** | `See all` · 캐러셀 캡션 · Book List meta · chevron 의 대비가 **`L-OPEN-10` 결정대로**다 (가값 등록 시 `P-xx` 목록에 기록) | 대비 계산 | — |
| **AC-3L-35** | 320 / 393 / 600 / 1024 에서 레이아웃이 성립한다. **320 의 3-up 처리는 `L-OPEN-11` 결정대로** | Playwright 다폭 | — |
| **AC-3L-36** | 캐러셀이 키보드로 조작 가능하다(가로 scroll-snap 네이티브 경로). `prefers-reduced-motion` 을 존중한다 | 접근성 + e2e | — |
| **AC-3L-37** | 서재 요청·응답·로그에 **아동 이름·Transcript·오디오 경로가 없다**. 콘솔에 PII 0건 | 요청 로그 + 콘솔 검사 | — |
| **AC-3L-38** | `VITE_*`·번들·저장소에 Secret 0건. 광고·제3자 분석 SDK 0건 | `grep` | — |
| **AC-3L-39** | `apps/api/`·`supabase/` 가 생성되지 않았다 | 파일 목록 | — |

---

## 12. Test Strategy

| 층 | 대상 |
|---|---|
| **contracts unit** | `LibraryBook`·`ReadingProgress`·`LibraryOverview`·`LibraryList`·`AddOwnBook`·`GiftRequest` 경계값(`averageRating` 범위·소수, `completedNights ≤ plannedNights` 여부는 **강제하지 않는다** — 서버 소유), enum 값 집합, `SaveBookTarget` 공용화 후 `AddOwnBookRequest` 동등성 |
| **mock contract** | 시나리오 전 key 의 요청·응답 parse, 멱등(`book-saved` 재저장 `savedAt` 동일), error envelope 코드 |
| **unit / component** | `SectionHeader`(액션 유무·hit-area) · `BookShelfCarousel`(1·2·3권, dots) · `BookListRow`(meta 유무) · `ReadingNowCard`(값 `null` 조합) · `ListRow` media/meta 슬롯 |
| **mock scenario (앱)** | 섹션별 Loading/Empty/Error/Retry/Offline, `favorites-empty`, `reading-now-none`, `unrated`, `shelf-partial`, `paged`, `gift-pending`, `gift-duplicate`, `user-entered-book`, `unsave` |
| **e2e (Playwright)** | `/library` 렌더 → "See all" 시트 → 행 탭 → `BookDetailSheet` → 증정 신청 / `/library/add` 두 경로 / Home 저장 → Library `Favorites` 반영 → 해제 / 탭 SPA 이동 |
| **시각 비교** | 합성 기준(§9.1) ↔ Figma L-1 + L-2 screenshot. **`L-OPEN-01`~`07` 결정 전에는 baseline 을 확정하지 않는다** |
| **픽셀 프로브** | `R-SHADOW-1` 세로·가로 양축 |
| **회귀** | Stage 2·3 Home AC 핵심 경로 + 기존 Sheet 5종(`L-OPEN-06` scrim 교체 시 **전부 재검증 대상**) |
| **manual device** | 실기기 가로 스와이프·관성 스크롤·VoiceOver/TalkBack 캐러셀 읽기. 불가 시 `NOT VERIFIED` + 수동 절차 |

plan-agent 는 Playwright 를 실행하지 않았다. 위 항목은 stage-qa-agent 실행 대상이다.

---

## 13. Risks & Mitigations

| # | Risk | 영향 | 완화 |
|---|---|---|---|
| R-1 | **`L-D2`·`L-D3` 가 PRD 에 없는 Backend 집계 2종을 새로 요구한다**(`LN-1`·`LN-2`) — 특히 `plannedNights`(`of 5 nights`)는 **어느 문서에도 출처가 없다** | Backend 범위 증가, Handoff 불완전 | contract 는 **표시 전용 + nullable** 로 설계해 데이터가 없으면 블록이 접히게 한다. `P3-BIP-16`·`17` 로 등록하고 `L-OPEN-17` 결정을 선행 |
| R-2 | **`averageRating` 이 HARU 의 비판정 톤과 충돌할 수 있다** (`rules/frontend.md` §8, `D-7` 의 원래 기각 사유) | 제품 원칙 위반 소지 | `Rated 4.5` 는 **보호자 자신의 회고 별점 집계**로 한정하는 안을 `L-OPEN-18` 로 올린다. Frontend 는 수식어를 더하지 않는다(`AC-3L-15`) |
| R-3 | **진행 바 실측 채움 55.2%(132/239) ≠ 3/5(60%)** `[실측]` | 시각 비교 baseline 불안정 | `L-OPEN-16` 결정 전 baseline 고정 금지. 서버가 `progressRatio` 를 명시 전달하는 안을 권고 |
| R-4 | **`Favorites` 캐러셀이 `curated` 와 완전히 동일한 인스턴스**다(override 0건) `[실측 145:779 vs 113:1994]` → 저장 책의 캡션 2행 데이터 출처가 Figma 에 없다 | 구현 공백 | `L-OPEN-15` 결정 전 구현 금지. `LibraryBook.capability` 를 권고안으로 올림 |
| R-5 | **보유·증정(`ownership`) 구분 표식이 Figma 에 전혀 없다** (전수 대조 §8.2) — `D-7` 의 4기능 중 2개가 화면에 표현될 자리가 없다 | FR-20·FR-22 미충족 위험 | `L-OPEN-14` (§15.5 **미등재 — 신규 보고 항목**) |
| R-6 | **`L-OPEN-06`(scrim) 교체는 Stage 2·3 기존 Sheet 5종을 모두 어둡게 한다** | Library 밖 회귀 | Library 전용 토큰 분리안을 함께 제시. 교체 시 **5종 전부 재검증**을 Test Strategy 에 포함 |
| R-7 | **`L-OPEN-07`(ListGroup 면/그림자) 채택 시 `R-SHADOW-1` inset 재계산**(3겹 아래 77 → 1겹 아래 10) | 그림자 클리핑 4번째 재발 | inset 값을 결정 이후 산정하고 양축 프로브 테스트를 AC 로 고정(`AC-3L-33`) |
| R-8 | **`LT-2 --radius-media: 12px` 는 Stage 0 `#10-②`(radius 6단계 고정) 변경 사안**이다 | 토큰 체계 결정 번복 | `L-OPEN-09` 를 Stage 0 결정 변경으로 명시해 승인받는다. 흡수안 2개를 함께 제시 |
| R-9 | **진입점(`/library/add`·`/library/gift-requests`)이 Figma 에 없다** — 현행 `LibraryFooterActions` 는 Figma 근거 없는 명세다 | 최우선 규칙 #2 위반 소지 | `C-13` 절차(`L-OPEN-12`). 승인 전 구현 금지 |
| R-10 | **상용 그림책 표지**가 데모 프리뷰·스토어 스크린샷에 유출 | 저작권 | `L-D4` — Stage 8 배포 게이트(`P3-BIP-19`). 개발 중에는 유지 |
| R-11 | `LibraryOverview` 1회 조회가 응답을 키워 `P3-BIP-10`(2초) 를 압박 | 성능 | 섹션별 항목 수 상한(캐러셀 ≤9 `[추정]`, 목록 4)을 Backend 요구로 명시. 섹션별 lazy 전환 여지를 남긴다 |
| R-12 | **13+9 = 22건 미결** 상태에서 구현 착수 | 재작업 | §14 를 **구현 전 결정 게이트**로 둔다. 특히 `L-OPEN-01`·`04`·`05`·`06`·`07`·`08`·`09`·`11`·`12`·`13` 은 시각 baseline 에 직접 영향 |

---

## 14. Open Decisions

**plan-agent 는 아무것도 결정하지 않았다.** 아래는 전부 **사용자 승인 대상**이다.

### 14.1 approvals §15.5 미결 13건 — 권고안

| ID | 항목 | 권고 | 근거 | 상태 |
|---|---|---|---|---|
| **L-OPEN-01** | 기준 화면 / 합성 방식 | **기준 = L-1 `30:74`, L-2 에서 `Reading now` 블록만 슬롯 1·2 로 합성** (§9.1) | 노드 ID 세션 순서(L-1 만 163 세션 편집 포함) · L-2 의 이름 공백 = 오버레이 스터디 · **합성 y 가 L-2 실측 y 8개와 전부 일치** `[실측]` | **RECOMMENDED** |
| **L-OPEN-02** | `This Week's Shelf` `Property 1=Selected` (`113:1991`) | **이번 라운드에서 구현하지 않는다** | 어느 Library 화면에도 **인스턴스가 없다** → "Figma 에 있는 것을 빼는 것"이 아니다. 용도(`LN-5` 항목별 세션 시작)는 PRD 에 흐름이 없고 Stage 4 영역이다 | **RECOMMENDED** |
| **L-OPEN-03** | `type=shelf`(`163:1898`) 의 ActionBar(★ Save + Start Session) | **Figma 대로 포함한다**(`AD-S3-19` 철회) | `163:1916` `Button/card` 가 정식 컴포넌트 변형에 있고 L-3 에서 실제 인스턴스화됐다. §12.2 가 같은 유형(`★ Save` 제외)을 **무효**로 뒤집은 전례가 있다. Start Session 은 `D-3` 비활성 유지 | **RECOMMENDED** — 헤더 flip 아이콘의 의미는 `확인 불가`, 디자이너 확인 필요 |
| **L-OPEN-04** | 오버레이 형태 — inset 카드 vs 전폭 Sheet | **Figma 대로 좌우 inset 14 · radius 28 떠 있는 카드**로 `Sheet` 를 확장 | `[실측]` x=14 w=364~365 r28. 최우선 규칙 #1(배치를 임의로 바꾸지 않는다). ⚠️ 세로 앵커는 L-2(하단 37) ↔ L-3(하단 4) 가 달라 `확인 불가` → **하단 여백을 `--space` 로 고정하는 규칙을 별도 승인** | **RECOMMENDED** + 앵커 **NEEDS DECISION** |
| **L-OPEN-05** | Book List divider — 컴포넌트 3개 vs 화면 사본 1개 | **컴포넌트 기준 = 모든 행 사이 divider** | `163:2145` 가 원본이고 화면 사본이 2개를 잃은 것으로 보인다 `[추정]`. 1개만 두면 2·3·4행이 붙어 보인다 | **RECOMMENDED** (Figma 내부 불일치이므로 승인 필요) |
| **L-OPEN-06** | scrim — Figma `rgba(0,0,0,0.34)` `[픽셀]` vs 현행 `--color-scrim` `.231` | **Library 전용으로 교체하지 않고, 전역 교체 여부를 별도 결정**한다 | ⚠️ **Library 안에서 끝나지 않는다** — 교체하면 **Stage 2·3 기존 Sheet 5종이 모두 어두워지고** 승인된 baseline 이 전부 바뀐다. 선택지: ⓐ 전역 교체 + 5종 재검증·재승인 ⓑ 현행 유지 + 차이 등록 ⓒ Library 전용 토큰 분리(토큰 2중화 비용) | **NEEDS DECISION** — 권고는 ⓑ(현행 유지 + 차이 등록), 영향 범위가 이득보다 크다 |
| **L-OPEN-07** | Book List 컨테이너 면/그림자 — Figma 74% + `--shadow-bubble` vs 현행 `ListGroup` 90% + `--shadow-glass-rest` | **`ListGroup` 에 `tone="glass"` 변형을 추가해 Figma 를 따른다** | 최우선 규칙 #1. ⚠️ 채택 시 **`R-SHADOW-1` inset 재계산 필수** — 3겹(아래 **77** · 위 22 · 좌우 28~32) → 1겹(아래 **10**) 로 바뀌므로 현재 inset 이 과대해진다. inset 은 **결정 후 실측 프로브로** 산정 | **RECOMMENDED** + inset 재산정 작업 포함 |
| **L-OPEN-08** | `LT-1` — `--color-fg-tertiary` → `--haru-ink-400`(#9aabaa) | **재매핑한다** | 현재 tertiary 가 secondary 와 **같은 ink-500** 이라 Figma 의 3단계 회색을 표현할 수 없고, 재매핑 없이는 화면 코드가 raw HEX 를 쓰게 되어 `rules/frontend.md` §6 위반이다. `--haru-ink-400` 은 primitive 에 이미 있고 semantic 참조가 0건이다 | **RECOMMENDED** — 단 `L-OPEN-10`(대비)과 **함께** 결정해야 한다 |
| **L-OPEN-09** | `LT-2` — `--radius-media: 12px` 신설 | **신설한다** | 표지 radius 가 7/10/12 3종인데 현행 6단계는 8 다음이 **16** 이라 10·12 를 담을 칸이 없다(8 흡수 Δ−4, 16 흡수 Δ+4 동점). ⚠️ **Stage 0 `#10-②`(radius 6단계 고정) 변경 사안**이다 — 대안 ⓑ 전부 `--radius-control`(8) 흡수 ⓒ 10·12 를 16 으로 흡수 | **NEEDS DECISION (Stage 0 결정 변경)** — 권고는 신설 |
| **L-OPEN-10** | `#9aabaa` 대비 **1.56–2.23:1** (See all · 역량 캡션 11px · Book List meta · chevron) | **Figma 대로 두고 새 가값 `P-xx` 를 등록**한다 | 기존 `P-01`(secondary 2.58:1)과 **다른 새 사례**다. ⓑ secondary 로 올리면 Figma 3단계가 2단계로 무너진다. ⓒ 디자이너 값 요청이 가장 정확하나 일정이 걸린다. **agent 가 임의로 올리지 않는다** | **NEEDS DECISION** — 권고는 가값 등록 + 디자이너 확인 병행 |
| **L-OPEN-11** | 320px 에서 3-up 불성립 (3×107=321 > content 272) | **비례 축소**(표지 폭 = content × 107/345 → 320 에서 84.3, 480 컬럼에서 134) | Figma shelf 그리드가 **퍼센트 기반**(열 offset 35.06%/69.25%)이고 표지만 107 고정이다 `[실측]` → 퍼센트를 따르면 비례가 Figma 의도다. 캡션 타이포(12/11)는 축소하지 않는다(11px 하한, `#10-②`) | **RECOMMENDED** |
| **L-OPEN-12** | `/library/add` · `/library/gift-requests` **진입점이 Figma 에 없다** | **`C-13` ① 디자이너에게 Figma 요청** (진입점 + 두 화면) | L-1~L-3 어디에도 버튼·링크가 없다 `[실측]`. 현행 `LibraryFooterActions` 는 **Figma 근거 없는 명세**이며 최우선 규칙 #2 위반 소지가 있다. 두 화면은 `#22` 공통 상태 화면이 아니고 **화면 1개 분량**(검색·폼·상태 6종 Tag)이다. ⓑ design-agent 명세로 가려면 **화면별 승인**이 필요하다 | **NEEDS DECISION (`C-13` 절차)** — FR-22·FR-23 이 **P0** 이므로 지연 시 Stage 3 가 막힌다 |
| **L-OPEN-13** | 상태 화면(Loading/Skeleton · Empty 섹션별 · Error/Offline/Retry · 1~2권 캐러셀 · 4행 초과)이 Figma 에 없다 | **`C-13` ② design-agent 명세** | Stage 0 `#22` 공통 상태 화면 **명세 우선** 규칙에 해당한다. 단 `Favorites 0건` 문구는 `L-D1` 확정으로 쓸 수 있다 | **RECOMMENDED (`#22` 적용)** |

### 14.2 이 Plan 이 **추가로 발견**한 결정 필요 항목 9건 (§15.5 미등재)

| ID | 항목 | 권고 | 근거 | 상태 |
|---|---|---|---|---|
| **L-OPEN-14** | **보유·증정(`ownership`) 표식이 Figma 에 전혀 없다** — `D-7` 4기능 중 "보유책·증정책" 의 표시 자리가 없다. 표시 축(curated/favorites/finished)과 쿼리 축(owned/gifted/history/saved)이 **1:1 이 아니다** | 항목 단위 `ownership` 표식(Tag 또는 아이콘)을 **design-agent 명세**로 추가하고 섹션은 Figma 대로 3개를 유지한다 | 전수 대조 §8.2 가 *"가장 큰 공백"* 으로 올렸으나 §15.5 에 등재되지 않았다. 섹션 분리로 표현하면 Figma 제목 3개를 바꿔야 해 최우선 규칙 #1 위반이다 | **NEEDS DECISION** |
| **L-OPEN-15** | **`Favorites` 캐러셀 캡션 2행의 데이터 출처** — `145:779` 가 `113:1994` 와 **override 0건 동일 인스턴스** `[실측]` 이므로 Figma 는 저장 책의 캡션을 정의하지 않는다 | `LibraryBook.capability` 를 두고 **#14 표시 라벨**을 쓴다. 역량이 없는 책(직접 입력 등)은 **저자명**으로 대체 | 캡션 2행은 curated 에서 역량 라벨이다 `[실측 113:1975 "Emotion"]`. 저장 책에 역량이 항상 있다고 단정할 수 없다 | **NEEDS DECISION** |
| **L-OPEN-16** | **진행 바 채움 132/239 = 55.2% ≠ 3/5 = 60%** `[실측]` | 서버가 `progressRatio` 를 **명시 전달**하고 Frontend 는 그 값만 쓴다. Figma 의 4.8pp 차이는 디자인 아티팩트로 보고 허용 차이 등록 | Figma 가 비율 산식을 명시하지 않는다 `확인 불가` | **NEEDS DECISION** |
| **L-OPEN-17** | **`{a} of {b} nights` 의 `b`(계획 회차) 출처가 어디에도 없다.** 또 그 텍스트가 조작 요소인지 불명 | ⓐ `plannedNights` 를 **Backend 소유 nullable** 로 두고 값이 없으면 `{a} nights read` 로 대체 ⓑ 조작 요소로 보지 않는다(비대화형 상태 텍스트) | PRD 에 다회차 진행 모델 자체가 없다(`LN-2`). Figma 에 설정 UI 도 없다 | **NEEDS DECISION** |
| **L-OPEN-18** | **`averageRating` 집계 범위** — 해당 아동의 FR-12 회고 별점 평균인가, 카탈로그 전체 사용자 평균인가 | **해당 아동(보호자) 자신의 회고 별점 평균**으로 한정 | 타가정 비교는 `rules/frontend.md` §8 "비교 표현 금지" 와 충돌한다. `D-7` 이 평점을 기각한 원래 사유(*"저장 위치·집계 규칙이 없고 비판정 톤과 거리가 있다"*)가 이 지점이다 | **NEEDS DECISION** |
| **L-OPEN-19** | 슬롯 3·5 의 **"See all" 유무** — L-1 에 있고 L-2 에 없다 | **L-1 대로 유지**(3개 모두 표시) | 기준 화면이 L-1 이고, 163 세션에서 추가된 것으로 읽힌다 `[추정]` | **RECOMMENDED** (`AD-L-03`) |
| **L-OPEN-20** | `PUT`/`DELETE …/saved-books` 응답을 **`SavedBook` → `LibraryBook`** 으로 전환할지 | **전환한다** (`API_CONTRACTS.md` §3.7.3 의 당초 설계대로) | `Favorites` 캐러셀이 `LibraryBook` 을 렌더하므로 저장 응답으로 **캐시를 직접 갱신**할 수 있다. 영향: `MockLibraryApi`·`useToggleSavedBook`·`saved-book.test.ts`·Home `SaveButton` 경로 → `AC-3L-31` 회귀 필수. ⓑ 현행 유지(저변경)도 가능하나 §3.7.3 과 어긋난 상태가 Stage 8 까지 남는다 | **NEEDS DECISION** |
| **L-OPEN-21** | **`Finished together` 4행 초과** — Figma 는 4행 고정, 더 보기 UI 가 없다 | 섹션은 **4행 고정 + "See all" 로 전체 목록**(커서 페이지네이션). 섹션 안에 "Show more" 를 **만들지 않는다** | 최우선 규칙 #2(없는 것을 만들지 않는다). "See all" 이 이미 그 역할의 Figma 자산이다 | **RECOMMENDED** |
| **L-OPEN-22** | **평점 없는 책의 meta 표시** — Figma 에 unrated 상태가 없다 | meta 슬롯을 **비우고 좌측 정렬 유지**(레이아웃 불변) | `L-D3` 은 "Figma 대로 렌더" 이며 없는 값을 꾸미라는 뜻은 아니다. `#22` 상태 화면 명세 범위 | **RECOMMENDED** |

### 14.3 CONFIRMED (재론하지 않음)

`L-D1`(Favorites = 저장 표면) · `L-D2`(Reading now 구현) · `L-D3`(평점 렌더) · `L-D4`(표지 Stage 8 교체) · `A-9`·§12.10(`★ Save` 토글 `G-13`, 초기 상태 반영 `G-14`, 상한 없음, 온보딩 favorites 와 분리, 신규 error code 0건) · `D-3`(Start Session 비활성) · `D-15`(배송지 미수집) · `D-17`(시트 route 처리) · `D-21`(Prompt 상한 없음) · `D-24`(PRD 수정 절차) · `#12`(breakpoint·480 컬럼) · `#14`(역량 표시 라벨) · `#22`(상태 화면 명세 우선) · `AD-S3-5`(역량 캡션 → 표시 라벨) · `A-23`(헤더 칩 차이, Library 에 동일 적용).

### 14.4 PRD 수정 대상 (plan-agent 는 고치지 않는다)

이미 등록됨 (approvals §15.2): **`LN-1`** 책 단위 평점 · **`LN-2`** 다회차 읽기 진행 · **`LN-3`** 책 저장(favorite).
**이 Plan 이 추가로 발견한 PRD 공백**:

| ID | 내용 | 비고 |
|---|---|---|
| `LN-6` (신규 제안) | **PRD §6.1:270 의 하단 탭 구성이 "서재·세션·리포트 3탭"** 인데 확정 구조는 **Library / Home(중앙) / Progress** 다 (`#15`·`D-02`) | Library 라운드에서 탭 라벨을 다루므로 드러났다. Home 라운드 PRD 수정 목록에 있는지 **확인 필요** |
| `LN-7` (신규 제안) | **PRD §6.1:276 서재 설명에 "Favorites"·"Reading now"·평점이 없다** — FR-20 의 4기능만 적혀 있어 `L-D1`~`L-D3` 반영이 필요하다 | `LN-1`·`LN-2`·`LN-3` 과 같은 패스에서 처리 |

`D-24` 절차(OneDrive 원본 `old/` 백업 → 원본·사본 동일 패스 수정 → `diff` 검증)는 **사용자 승인 후 별도**로 수행한다.

---

## 15. Handoff to design-agent

`docs/design/stage-3-library-design-spec.md` 작성 시 다음을 확정한다. **`L-OPEN-*` 결정 전 baseline 확정 금지.**

### 15.1 실측·명세가 필요한 화면·상태

| # | 대상 | 비고 |
|---|---|---|
| H-1 | **합성 기준 화면**(§9.1 슬롯 1~8) 전체 치수·간격·타이포·색 — `L-OPEN-01` 승인 후 | Figma L-1 `30:74` + L-2 `145:1145` 실측 |
| H-2 | `Reading now` 카드 내부 기하 — 텍스트 열 x=92 y=27.5 w=239 h=63, 내부 gap **3**(제목 19 / 부제 22–36 / 바 39–46 / 메타 49–63) `[실측 145:1147~145:1152]` → **토큰 흡수 방식** |
| H-3 | `SectionHeader` 신규 Shared UI — 액션 hit-area 44 확장 방식(`IconButton.hit-area` 선례) |
| H-4 | `BookShelfCarousel` — 열 x `0 / 120.948 / 238.922`, 3번째가 345 를 **0.92 넘어 클립** `[실측]`, dots y=**207**(선언 gap 8 과 15 불일치, 원인 `확인 불가`) 처리 방식 |
| H-5 | `BookShelfItem` **캡션 2행의 데이터 바인딩** — `L-OPEN-15` |
| H-6 | `BookListRow` meta 슬롯 — `Rated 4.5` 2-스타일 합성(`Rated ` 11.5 Reg + `4.5` 12 Bold) + **unrated 상태**(`L-OPEN-22`) |
| H-7 | **시트 2종의 형태·앵커·scrim** — `L-OPEN-03`·`L-OPEN-04`·`L-OPEN-06` |
| H-8 | **상태 화면 명세** (`#22`) — 섹션별 Skeleton / Empty(**`favorites-empty` 가 기본 상태**) / Error / Offline / Retry / 캐러셀 1~2권 / `reading-now-none` 시 간격 회수 |
| H-9 | **`ownership` 표식** — `L-OPEN-14` |
| H-10 | `/library/add` · `/library/gift-requests` · **진입점** — `L-OPEN-12` 승인 경로에 따라 ①디자이너 요청 또는 ②명세 |
| H-11 | 320 / 480 컬럼 반응형 — `L-OPEN-11` |
| H-12 | 토큰 — `LT-1`~`LT-7` (`L-OPEN-08`·`L-OPEN-09`·`L-OPEN-10`, `--color-progress-track` 14%, `--color-divider` 10%) |
| H-13 | **`R-SHADOW-1` inset 재산정** — `L-OPEN-07` 결정 후 겹 전부 합산 + 픽셀 프로브, 세로·가로 양축 |

### 15.2 design-agent 가 **재정리**해야 하는 기존 문서 항목

| 항목 | 처리 |
|---|---|
| `AD-S3-4` ("Books you own") | **무효 — 삭제**. 전제(제목 중복)가 사실이 아니다. `design-spec.md:383`·`:1286` 수정 (approvals §14.1) |
| `AD-S3-6` (평점 미렌더) | **무효 — `L-D3` 으로 렌더한다** |
| `AD-S3-7` (Reading now 미렌더) | **무효 — `L-D2` 로 구현한다** |
| `AD-S3-8` (My Saved·★ Save 미렌더) | **무효** — `★ Save` 는 §12.2 로 이미 무효, `My Saved` 는 `L-D1` 로 해소. `AD-L-02` 로 대체 |
| `AD-S3-19` (시트 ActionBar 없음) | **`L-OPEN-03` 결정에 따름** (권고: 철회) |
| `design-spec.md:386` `LibraryFooterActions` | **Figma 근거 없음** — `L-OPEN-12` 결정 전 명세 유지 금지 |
| `AD-S3-5` (역량 캡션 → #14 라벨) | **유지**. 라벨 길어짐에 따른 11px 1줄 유지 불가 → **줄바꿈/말줄임 규칙 명세 필요** |
| 신규 `AD-L-01`~`AD-L-05` (§9.1) | **사용자 승인 후** 등록 |

### 15.3 design-agent 가 확인만 하면 되는 것 (변경 없음)

`BottomTabBar`(`Active=Library`) · `TopBar(large)` + `WeekSummaryChip`(`A-23` 동일 적용) · `PageIndicator`(Figma 와 완전 일치) · `ProgressBar`(track 색만) · `ActivityOptionCard` 계열(Home 과 동일 기하 365×376.78) · `SaveButton` · `Tag` · 아이콘(**HARU 전용 SVG 신규 0건**).

