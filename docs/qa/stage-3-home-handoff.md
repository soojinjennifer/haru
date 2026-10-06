# Stage 3 (1차 — Home) development-agent 인계 메모

Status: **구현 완료, QA 대기**
작성: development-agent · 2026-10-05
범위: 사용자 지시 *"승인하니 시작하고 home 화면 만들면 먼저 검수할 수 있게 해줘"* → **Home 까지만**.
근거 문서: `docs/decisions/stage-3-approvals.md` (정본) · `docs/design/stage-3-design-spec.md` (APPROVED) ·
`docs/plans/stage-3-plan.md` (APPROVED, Rev 3)

---

## 1. Gate 확인

| 조건 | 결과 |
|---|---|
| `docs/plans/stage-3-plan.md` APPROVED | ✅ Rev 3 (2026-10-03), 승인 2026-10-05 |
| `docs/design/stage-3-design-spec.md` APPROVED | ✅ 승인 2026-10-05 |
| 이전 Stage QA PASS | ✅ Stage 2 (재구성 포함) |
| Plan ↔ PRD / Figma 모순 | 신규 모순 없음. 남은 해석 차이는 §7 에 보고 |
| Plan In Scope 에 Backend 구현 없음 | ✅ `apps/api/` · `supabase/` 미생성 (아래 §5) |

---

## 2. 이번 범위에서 구현한 것

### 2.1 화면 · route

| route | 내용 | Layout |
|---|---|---|
| `/` | **Home 본문** — 캐릭터 배경 · 버블 · 진행 중 세션 안내 · Activity Card 덱(3장) · dots · 하이라이트 한 줄 | `TabLayout` |
| `/library` | **탭바 마운트 자리만** (화면 내용은 다음 단계) | `TabLayout` |
| `/progress` | 리포트 준비 안내 — **수치 0건** (`D-2`) | `TabLayout` |

### 2.2 AC 충족 현황 (`AC-3-01` ~ `AC-3-25` + `AC-3-80` · `AC-3-81`)

| AC | 상태 | 증거 |
|---|---|---|
| AC-3-01 | ✅ | `apps/api` · `supabase` · `apps/mobile` 미생성 (§5) |
| AC-3-02 | ✅ | 세션·녹음·회고·분석·리포트·데이터 관리 미구현. Stage 4~8 scenario key 0건 |
| AC-3-03 | ✅ | `pnpm lint:boundaries` 통과 (feature 간 import 0건) |
| AC-3-04 | ✅ | `home-stage3.test.tsx` "항목이 Library / Home / Progress 3개" · `/session` 탭 없음 |
| AC-3-05 | ✅ | 아이콘 = `S1-D2-5` 확정값. 활성 = `aria-current="page"` + 라벨 `semibold` (색 단독 아님) |
| AC-3-06 | ✅ | `e2e/home.spec.ts` "스크롤 끝에서 마지막 콘텐츠가 중앙 버튼에 가려지지 않는다" + `stage3-css-guards` |
| AC-3-07 | ⚠️ 부분 | Toast 하단 offset 식은 `AD-S3-14` 대로 고쳤고 소스 가드로 고정했다. **Toast 가 실제로 마운트되는 Stage 3 화면이 아직 없어** 실행 증거는 없다 → QA 판정 필요 |
| AC-3-08 | ✅ | 탭이 `<a>` 라 Tab 순차 이동 · 접근성 이름 · `aria-current`. hit 44 는 Stage 1 `BottomTabBar` 규격 |
| AC-3-09 | ✅ | 요청 로그에 `GET …/home` · `GET …/activity-cards/today` 2건. Stage 2 EmptyState 문구 0건 |
| AC-3-10 | ⚠️ 부분 | 덱 3장 · 역량 배지 · 제목/저자 · 추천 이유 · 코칭 문장 ✅. **표지 이미지는 placeholder**(§6-1) |
| AC-3-11 | ✅ | `card.date ≠ 기기 오늘` → 안내 렌더. Mock clock 이 2026-01-01 고정이라 **데모에서 상시 노출**(§8) |
| AC-3-12 | ✅ | `shared/copy/capability-copy.ts` 4라벨, `" Day"` suffix 0건 (테스트로 고정) |
| AC-3-13 | ✅ | 추천 이유·코칭 문장·Prompt·버블·하이라이트 전부 응답 값. copy 모듈에는 라벨만 |
| AC-3-14 | ✅ | `loading` 에서 헤더·탭바 즉시 표시 + 덱 Skeleton |
| AC-3-15 | ✅ | `session-already-active` 안내 + `/v1/sessions` 호출 0건 (요청 로그) |
| AC-3-16 | ✅ | 선택 → `POST …/selection` → Prompt 시트에 질문 전부 + 코칭 문장 + follow-up |
| AC-3-17 | ✅ | contracts 단위 테스트(1·2·3·4·10·20 통과 / 0 거부) + fixture 5개 + 접힘 3 + 확장 도달. `slice(` 0건 |
| AC-3-18 | ✅ | 카드 옆 이전/다음 버튼(§3) + `SwipeDeck` 화살표. e2e 에서 버튼만으로 3장 도달 |
| AC-3-19 | ⚠️ 미검증 | `SwipeDeck`·`PromptPreview` 모두 `prefers-reduced-motion` 을 존중한다(기존 CSS + 확장에 모션 없음). **양방향 e2e 미작성** → QA 판정 필요 |
| AC-3-20 | ✅ | `reread-option` · `conversation-only-option` · `books-exhausted` 3종, 라벨+아이콘 식별 |
| AC-3-21 | ✅ | `alt = "{제목} by {저자}"`, `onError` → placeholder 전환 (`BookCover.test.tsx`) |
| AC-3-22 | ✅ | 6값 radio + 라벨 copy 모듈 |
| AC-3-23 | ✅ | `custom_time` 일 때만 시간 입력. contracts 거부 + Adapter 경계 거부 테스트 |
| AC-3-24 | ✅ | 요청 로그 payload 에 `readingContext` 포함 |
| AC-3-25 | ✅ | 키보드 열기·이동·선택·Esc 닫기 + 포커스 트랩(Stage 1 `Sheet` 규약) |
| AC-3-80 | ✅ | `PromptPill` 배지 — 값 있음/없음 양방향 테스트 (`[1,1,1,2,0]`) |
| AC-3-81 | ✅ | fixture 결정성 테스트(2회 호출 바이트 동일) + 하드코딩 0건 |

**이번 범위 밖(미착수)**: `AC-3-26` ~ `AC-3-79` 중 서재·증정·직접 등록·알림·오프라인 캐시·에셋 파이프라인·
responsive/접근성 전수 측정 항목.

---

## 3. 좌우 이동 버튼 — 설문과의 공유/분리

**코드를 공유하지 않고 패턴만 따랐다.** 근거와 차이는 다음과 같다.

| 항목 | 설문 덱 (`features/onboarding-survey`) | Home 덱 (`features/activity-card-deck`) |
|---|---|---|
| 기하 | `.haru-survey-deck__nav` — 앞 카드 중앙, 버튼 중심이 카드 모서리 | `.haru-activity-deck__nav` — **같은 식** |
| 제스처 표면 | 래퍼 `gestureSurfaceRef` | **같음** |
| 접근성 | `aria-hidden` + `tabIndex={-1}` **보조** 어포던스 (1급 경로는 TopBar chevron 1쌍) | **1급 경로** — 포커스 가능 + 접근성 이름 `Previous/Next option` |
| 비활성 | 필수 미응답 = `aria-disabled`(사유 전달) | 덱 끝 = native `disabled` (사유가 "끝" 하나뿐) |

- **코드 공유 불가**: `features/A → features/B` 직접 import 금지(`AC-3-03`). 공통화하려면 `packages/ui` 로
  올려야 하는데, 공유되는 것은 **CSS 4줄**이고 접근성 취급이 정반대라 올리면 두 사용처의 차이를
  prop 으로 다시 벌려야 한다 → `D-14`("해당 화면의 컴포넌트가 나올 때 만든다") 기준으로 **올리지 않았다**.
- 세 번째 사용처가 생기면 그때 `packages/ui` 로 올리는 것이 맞다 — CSS 주석에 그 조건을 남겼다.

---

## 4. contracts · Mock 변경

### 4.1 `packages/contracts` (신규)

| 경로 | 내용 |
|---|---|
| `src/enums/prompt-kind.ts` | `question` · `follow_up` |
| `src/enums/age-band.ts` | `3_4` · `5_6` · `7_9` |
| `src/enums/prompt-phase.ts` | `pre` · `post` (**D-8**) |
| `src/common/time-of-day.ts` | `TimeOfDaySchema` (`HH:mm`) |
| `src/common/datetime.ts` (수정) | `CalendarDateSchema` 추가 (`YYYY-MM-DD`) |
| `src/prompts/prompt.ts` | `PromptSchema`(`phase`·`pageRef` 독립 optional) · `PromptSetSchema`(`questions` **상한 없음**) |
| `src/activity/option.ts` | `ActivityCardOptionSchema` (`capability` · `promptPreview` **상한 없음**) |
| `src/activity/card.ts` | `ActivityCardSchema` (`options` 길이 3, **`targetCapability` 없음** — D-22) |
| `src/activity/selection.ts` | `SelectActivityOptionRequestSchema` + `createCustomTimeRefine()` · `ActivityCardSelectionSchema` |
| `src/home/summary.ts` | `HomeSummarySchema` (**`streakDays` 없음**, `characterLine` 있음) |

- enum 스냅샷 **26 → 29종**. Error Code **신규 0건**.
- `ActivityCardOption` 에 `title: string \| null` 을 두었다 — `conversation_only` 카드가 책 없이 활동 제목을
  가져야 하는데 Plan §7.1 필드 목록에 그 자리가 없었다 (§7-④ 보고).

### 4.2 Mock (`apps/web/src/mocks`)

| 경로 | 내용 |
|---|---|
| `home/MockHomeApi.ts` | scenario 8종 — `success` `loading` `empty` `error` `retry` `offline` `session-already-active` `onboarding-incomplete` |
| `activities/MockActivityApi.ts` | scenario 10종 — 위 6종 + `reread-option` `conversation-only-option` `books-exhausted` `onboarding-incomplete` |
| `fixtures/activity-cards.ts` | 덱 3장 × 4가지 구성. 카드마다 다른 역량 (D-5) |
| `fixtures/prompt-sets.ts` | Prompt **5개**(상한 없음 증거) · 배지 조합 5종(PRE / POST / P.6 / 둘 다 / 없음) |
| `fixtures/home.ts` | `HomeSummary` (버블 문구 · 하이라이트 · 진행 중 세션) |
| `fixtures/me.ts` (수정) | **온보딩 완료 시에만** `child`(id + firstName) 포함 |

- **신규 scenario key 0건** — 전부 `docs/API_CONTRACTS.md` §5.4 Catalogue 기존 값이다.
- 아직 등록하지 않은 Stage 3 key: `offline-cached-card` · `gift-pending` · `gift-duplicate` ·
  `user-entered-book` · `push-permission-denied` (해당 화면이 들어오는 단계에서 등록).

### 4.3 Mock 시나리오 전환 방법

```
?scenario=<group>:<key>[,<group>:<key>…]
```

| 그룹 | key |
|---|---|
| `home` | `success` `loading` `empty` `error` `retry` `offline` `session-already-active` `onboarding-incomplete` |
| `activity-cards` | `success` `loading` `empty` `error` `retry` `offline` `reread-option` `conversation-only-option` `books-exhausted` `onboarding-incomplete` |

예시
- `/?scenario=activity-cards:books-exhausted`
- `/?scenario=activity-cards:loading,home:loading`
- `/?scenario=home:session-already-active`
- `/?scenario=activity-cards:conversation-only-option`

우선순위는 **URL > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`** 이며, dev 패널(우하단 `scenario`)
에도 두 그룹이 등록되어 있다.

---

## 5. 검증 명령 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ 5 workspace 전부 Done |
| `pnpm lint` | ✅ 0 problems |
| `pnpm test` | ✅ **107 files / 1236 tests** 통과 |
| `pnpm lint:boundaries` | ✅ no dependency violations (529 modules) |
| `pnpm build` | ✅ (`home-character` 991 kB 경고는 §6-2) |
| `pnpm format:check` | ✅ All matched files use Prettier code style |
| `pnpm test:e2e` | ✅ **164 passed** (단독 실행) |
| `pnpm assert:no-mocks` | ✅ sentinel 0건 |

`apps/api/` · `supabase/` · `apps/mobile/` 미생성 확인:

```
$ ls apps
web
$ ls | grep -x supabase   # 출력 없음
```

### 5.1 신규 · 재생성 시각 baseline

| 파일 | 상태 |
|---|---|
| `s2-home-header.png` | **재생성** — `26:40` 자리에 `WeekSummaryChip` 추가 (`AD-S3-9`) |
| `s3-home.png` | 신규 (전체 프레임, 회귀 전용) |
| `s3-home-deck.png` | 신규 (앞 카드 + dots, Prompt 접힘 · 단계 배지 포함 — `86:438` 대조) |
| `s3-home-deck-prompts-expanded.png` | 신규 (**회귀 전용** — Figma 대응 프레임 없음, `AD-S3-22`) |
| `s3-tabbar-top.png` · `s3-tabbar-bottom.png` | 신규 (스크롤 상단/하단 2컷 — §2.1 sticky 회귀) |

Stage 1·2 의 나머지 baseline 42건은 **변경 없이 통과**했다 (Design Spec §12.9 예상대로 `TabLayout` 을 통째로
렌더하는 gallery baseline 이 없었다).

---

## 6. `BACKEND_INTEGRATION_PENDING` 예상 항목 (이번 범위에서 새로 확정된 것)

| ID | 내용 | Frontend 쪽 상태 |
|---|---|---|
| `P3-BIP-01` | 일일 Activity Card 생성 잡 · `UNIQUE(child_id, card_date)` · caregiver timezone 기준 | `GET …/activity-cards/today` Mock + Http 골격 |
| `P3-BIP-02` | Cold/Warm 추천 로직 · 역량 순환 스케줄 (카드마다 다른 역량) · 추천 이유 문장 생성 | `options[].capability` · `reason` 표시만 |
| `P3-BIP-03` | Prompt 라이브러리 콘텐츠 · 전문가 감수 · 재독 시 새 세트 | `promptSet` 표시만. **개수 정책은 서버 소관** (D-21) |
| `P3-BIP-10` | Activity Card 응답 2초 이내 | Skeleton 으로 체감 처리 |
| `P3-BIP-11` | 진행 중 세션 판정의 서버 권한 | `activeSession` **표시만**, 진입은 Stage 4 |
| `P3-BIP-13` | **`Prompt.phase` 판정 로직**(읽기 전/후) | contract optional + 값 있을 때만 배지 |
| `P3-BIP-14` | **`Prompt.pageRef` 책별 페이지 앵커 데이터**(콘텐츠 제작 범위) | 서버 문자열 그대로 출력 |
| 신규 | `GET …/home` 의 `characterLine` · `lastHighlightLine` **문구 생성**(Safety Filter 포함) | 서버 값만 표시, 없으면 미렌더 |
| 신규 | `sessionsThisWeek` 집계 기준(주 시작 요일 · timezone) | 숫자 표시만 |

---

## 7. 명세 오류 · 모순 — **고치지 않고 보고**

1. **`--prompt-phase-tag-bg/-fg` 가 Tier 규칙과 충돌한다.** Design Spec §6.2 는 값을
   `--haru-palette-cyan` / `--haru-white`(**Primitive**)로 적었는데, 토큰 빌드 불변식 3-4 가
   *Tier3 → Primitive 직접 참조*를 금지한다. 같은 절이 `--color-capability-flexibility-*` 재사용도
   금지하므로 **semantic 2건 신설이 유일한 합법 경로**였다 →
   `--color-prompt-tag-bg` · `--color-prompt-tag-fg`(가값 `P-23`) 추가. §6.1 "신규 semantic 0건" 과
   어긋나므로 **design-agent 확인이 필요**하다.
2. **선택(`POST …/selection`)을 시작하는 CTA 가 명세에 없다.** §5.1 ActionBar 는 `ReadingContextChip`(선택
   **후**) 또는 **빈 슬롯**이고, 주 CTA `Start Session` 은 `D-3` 로 비활성이다. 그러면 `AC-3-22`~`25` 에
   도달할 수단이 없다 → ActionBar 좌측 슬롯(폐지된 `Save` 자리, `AD-S3-8`)에 glass Button
   **"Pick a time"** 을 두고, 선택 후에는 `ReadingContextChip` 을 감싼 버튼("Change reading time,
   currently …")으로 바꿨다. **승인 필요 항목**이다.
3. **Prompt 시트의 진입 조건이 모호하다.** §2.5 는 Home 경로 데이터를 `ActivityCardSelection.promptSet`
   으로 적었는데, 그러면 **선택 전에는 헤더 아이콘이 열 것이 없다**. 카드가 이미 `promptPreview` +
   `coachingLine` 을 가지고 있으므로 **선택 전에는 그 값**, 선택 후에는 서버 `promptSet`(follow-up 포함)을
   같은 뷰로 그리게 했다. 결과적으로 "선택 전 비활성 아이콘 + 지어낸 사유 문구"를 만들지 않아도 됐다.
4. **`conversation_only` 의 활동 제목 필드가 contract 에 없다.** Plan §7.1 `ActivityCardOption` 목록에
   `book` / `userEnteredBook` 은 있으나 §2.6 이 요구하는 "활동 제목 1줄(서버 값)" 자리가 없다 →
   `title: string | null` 을 추가했다. **plan-agent 확인 필요**.
5. **`SpeechBubble` 에 `bottom-left` tail 이 없었다.** §2.2 가 요구하는 방향인데 Stage 1 컴포넌트는
   `bottom-right` · `top-center` · `none` 뿐이다 → `bottom-right` 의 좌우 대칭으로 1종 추가(신규 토큰 0건).
6. **`TextLink` 에 `aria-expanded`/`aria-controls` 를 줄 수 없었다.** §5.1.1 은 확장 트리거를 기존
   `TextLink` 로 지정했는데 props 가 닫혀 있었다 → optional `expanded` · `controls` 2개 추가
   (`<button>` 경로 전용).
7. **`SelectTrigger` 가 자기 `Sheet` 를 연다.** §2.4 는 "시트 중첩 금지 · 같은 Sheet 안에서 목록 뷰 전환"
   을 요구하는데 기존 구현은 항상 내부 `Sheet` 를 렌더한다 → optional `onOpen` 추가(주면 내부 Sheet 를
   렌더하지 않는다).
   > ⑤⑥⑦ 은 전부 **승인된 Design Spec 을 그대로 구현하기 위한 기존 컴포넌트 확장**이며 신규 Shared UI 는
   > 0건이다 (`D-14` 범위 유지). 그래도 `packages/ui` 변경이므로 보고한다.
8. **`BookSummary.coverUrl` 이 `z.url()` 이다.** §14-10 은 "fixture `coverUrl` 은 **번들 에셋 경로**를
   쓴다"고 적었는데, Vite 번들 경로(`/assets/x-hash.png`)는 절대 URL 이 아니라 **parse 를 통과하지 못한다**.
   표지 에셋이 들어오는 단계에서 schema 를 `z.union([z.url(), 상대경로])` 로 완화할지 결정이 필요하다.
9. **`/progress` 일러스트.** §2.13 은 `CharacterIllustration(asset=bookworm)`(`163:2642`)을 지정했으나
   그 에셋이 저장소에 없다 → Lucide 아이콘 배지로 대체했다. 에셋 추출은 서재 단계와 함께 처리한다.
10. **`PromptPill` radius 가 명세에 없다.** §5.4 치수표에 radius 가 없어 `--radius-surface`(22)로 두었다
    (2줄 pill 에서 capsule 끝이 어색해지는 것을 피함). Figma 대조 때 확인이 필요하다.

---

## 8. Home 검수 시 봐야 할 지점

**실행**: `pnpm dev` → 로그인(`sam@example.com` / `sunny-evening-8`) → `/` 착지.

| # | 봐야 할 것 | 기대 |
|---|---|---|
| 1 | **"This card was prepared for January 1, 2026."** 안내 | **의도된 동작이다.** Mock clock 이 `MOCK_EPOCH`(2026-01-01)에 고정이라 카드 날짜가 기기 오늘과 다르고, `D-10`·`AC-3-11` 이 "그 날짜를 밝히라"고 정했다. 실제 Backend 가 오늘 카드를 주면 사라진다. **이 배너를 없애려고 Mock 시계를 "오늘"로 바꾸면 `AC-1-39`(응답 바이트가 실행 시점과 무관) 가 깨진다** — 그래서 바꾸지 않았다 |
| 2 | 캐릭터가 카드 뒤로 많이 가려진다 | 버블↔덱 spacer 는 **남는 높이가 있을 때만** 벌어진다(§2.2). 카드가 길어 393×852 에서는 최소값(24)이라 가려진다. 허용 범위인지 판단 필요 |
| 3 | 책 표지가 **이니셜 상자**(`GM` 등) | 표지 에셋 파이프라인(`AC-3-51`~`53`)이 이번 범위 밖이라 `coverUrl` 을 비웠다. `BookCover` 는 URL 이 오면 그대로 그린다 |
| 4 | Prompt pill 의 `PRE` / `POST` / `P.6` 배지 | `D-8` 반영. 5번째 pill 은 **배지가 없다**(미렌더 경로) — 확장해서 확인 |
| 5 | `Show all 5 prompts` → 확장 | 접힘 3개는 **cutoff 이며 cap 이 아니다**. 확장하면 5개 전부. 카드를 넘기면 다시 접힌다 |
| 6 | 카드 좌우 `<` `>` 버튼 | 설문과 같은 자리. **포커스를 받고 이름이 있다**(설문은 보조 어포던스라 `aria-hidden`) |
| 7 | `Pick a time` → 시트 | 6값 + `Pick a time…` 선택 시에만 시간 목록(30분 48항목). **시트를 겹치지 않고** 같은 시트 안에서 전환 |
| 8 | 선택 완료 후 | 칩이 `Bedtime` 으로 바뀌고 Prompt 시트가 자동으로 열려 **코칭 문장 + follow-up** 을 보여 준다 |
| 9 | `Start Session` | **비활성**(`aria-disabled`)이지만 포커스는 받는다. 사유 문구는 `D-3` 대로 **비워 두었다** |
| 10 | 탭바 | Library / Home(가운데) / Progress. 스크롤 끝까지 내려도 마지막 콘텐츠가 중앙 버튼에 가리지 않는다 |
| 11 | `/progress` | 준비 안내. **숫자가 한 글자도 없다**(`D-2`) |
| 12 | `/library` | 탭바 자리만. 내용은 다음 단계 |

시나리오로 확인할 것

```
/?scenario=activity-cards:loading           # 덱 Skeleton (헤더·탭바는 즉시)
/?scenario=activity-cards:empty             # 카드 없음 안내
/?scenario=activity-cards:error             # ErrorState + Try again
/?scenario=activity-cards:offline           # 오프라인 안내
/?scenario=activity-cards:reread-option     # "Read again" 대체 카드
/?scenario=activity-cards:conversation-only-option   # "No book tonight"
/?scenario=activity-cards:books-exhausted   # 3장 전부 대체 카드
/?scenario=home:session-already-active      # 덱 위 이어하기 안내
```

---

## 9. 가값(provisional) 현황

| ID | 대상 | Stage 3 Home 사용처 |
|---|---|---|
| `P-01` | `--color-fg-secondary` · `-tertiary` | 탭바 미선택 라벨 2탭 · 저자명 · 추천 이유 · 하이라이트 한 줄 |
| `P-02` | 역량 배지 흰 글자 · `--color-border-subtle` | `CapabilityBadge` · `BookCover placeholder` 테두리 · Prompt pill outline |
| `P-05` | `--color-scrim` | 읽기 상황 시트 · Prompt 시트 |
| **`P-23`** | `--color-prompt-tag-fg` (흰 라벨 **1.72:1**) | **Prompt 단계·페이지 배지** — 신규이자 유일한 사용처, 상시 노출 |
| `P-22` | `conversation_only` 일러스트 슬롯 에셋 | 기존 캐릭터 에셋 전용(轉用) |

`P-20`(Toggle) · `P-21`(Carousel) · `P-16` · `P-17` 은 이번 범위에 사용처가 없다.

---

## 10. 이번 범위에서 **만들지 않은 것** (확인용)

- 서재 화면 내용 · `LibraryShelfSheet` · `BookDetailSheet` · 직접 등록 · 증정 신청
- Mock 전용 route(`D-17`) · 알림 설정 화면(`D-18`)
- `SectionHeader` · `Carousel` · `Toggle` · `ListRow` media/meta 확장 (서재·설정 화면과 함께)
- `--book-cover-w-sm` · `--book-cover-lg` · `--list-row-height-media` · `--carousel-*` · `--toggle-*` 토큰
- Activity Card 로컬 캐시(`D-11`) · `offline-cached-card` scenario
- push 권한 Port(`D-16`) · 표지 에셋 파이프라인(`sharp`, `D-19`)
- Stage 4 이후 전부 (`POST /v1/sessions` 0건)

---

# Stage 3 Home **재구현** 인계 메모 (2026-10-05, 2차)

> 위 §1~§10 은 **1차 구현**의 기록이며 이력으로 남긴다. 아래가 **Figma 전수 재대조 후 재구현**의
> 결과이고, 충돌하면 **이 절이 정본**이다.
>
> 입력: `CLAUDE.md` ⛔ 최우선 규칙(2026-10-05) · `docs/decisions/stage-3-approvals.md` **§12 전체** ·
> `docs/design/stage-3-home-figma-audit.md` **§10 · §11 · §16 · §17 · §19** ·
> `docs/plans/stage-3-plan.md` **Rev 4 §20** · `docs/API_CONTRACTS.md` **§3.7**

## R1. Gate 확인

| 항목 | 결과 |
|---|---|
| Plan `Status: APPROVED` | ✅ `docs/plans/stage-3-plan.md` — APPROVED (2026-10-05, user), Rev 4 |
| Design Spec / 감사 문서 | ✅ `docs/design/stage-3-home-figma-audit.md` (§16~§19 가 최신 명세) |
| 선행 Stage QA | ✅ Stage 2 `PASS` (2026-09-28) |
| Plan ↔ PRD / Figma 모순 | 모순은 **approvals §12 가 전부 해소**했다. 잔여는 §R8 보고 |
| In Scope 에 Backend 구현 | 없음. `apps/api/` · `supabase/` 미생성 (§R10) |
| 구현 차단 `G-12` | **소멸** — `conversation_only` 옵션이 폐지되어 결정 자체가 불필요해졌다 (approvals §12.12) |

## R2. Figma 실측 ↔ 구현 실측 대조

측정 조건: Playwright Chromium, viewport **393×852**, `deviceScaleFactor: 1`, `reducedMotion: reduce`.
Figma 좌표는 상태바 56px 를 제거한 **Web y** 다 (audit §11.0).

| 항목 | Figma | 구현 | Δ |
|---|---|---|---|
| 헤더 밴드 | 0 … 48 | 0 … 48 | **0** |
| 설정 IconButton `26:44` | (331, 10) 38×38 | (331, 10) 38×38 | **0** |
| 워드마크 `26:39` | (26, 19) 64×25 | (24, 15) 63.8×28 | x −2 (gutter 24 흡수, `P-13`) · y −4 (`title-2` 22/28 흡수) |
| 헤더 칩 `26:40` | (188, 12) 145×34, `2week /115 Min` | (213, 16) 110×26, `2 this week` | **의도된 불일치** (`A-23` 사용자 결정) |
| 캐릭터 `26:22` | (24, 29) **357×442** | (24, 29) **357×442.05** | **0** |
| 버블 `261:1293` | (39, 51) 303 폭 | (39, 51) **303** 폭 | **0** (높이는 §R8 ②) |
| 버블 tail | left **76.32%**, 22.49×16.35 | left 76.32% (x 270.2), 22.48×16.34 | **0** |
| 트랙 `163:2648` pad / gap | 14 / 6 | 14 / 6 | **0** |
| **카드 폭** | **365** | **365** | **0** |
| **peek** | **8** | **8** (카드 2 x = 385) | **0** |
| 트랙 높이 | 415 (`86:482`) | 415 | **0** |
| 카드 하단 | 705 | **705** | **0** |
| 앞면 `163:2649` | 409 (18+26+12+82+12+186+12+45+16) | (14, **296**) 365×**409** | **0** |
| 뒷면 `86:482` | 415 | (14, **290**) 365×**415** | **0** |
| 카드 padding | 18 / 18 / 16 | 18 / 18 / 16 | **0** |
| 표지 `85:536` | 58×82, radius 10 | (32, 352) 58×82 | **0** |
| Prompt 영역 `I163:2649;85:550` | 329×**186** (pill 42×4 + gap 6×3) | (32, 446) 329×**186** | **0** |
| PromptPill | 42 (330 폭) | 42 (**329** 폭) | 폭 −1 (§R8 ①) |
| Pagetag | h **22** | h 22 | **0** |
| ActionBar `86:373` | 330×45, gap 8 | 329×45, gap 8 | 폭 −1 (§R8 ①) |
| `★ Save` `117:973` | **87**×45 | **87**×45 | **0** |
| `Start Session` `86:369` | 235×45 | **234**×45 | −1 (Figma `left-18`/`right-17` 비대칭 반올림 — audit §11.4 가 예고) |
| flip 버튼 | 24×24, 우측 inset 18 | 24×24, inset 18 | **0** |
| dots `261:1233` | (174, 717) 46×7 | (173.5, 717) 46×7 | x −0.5 (가운데 정렬) |
| 탭바 `27:89` | (24, 766) 345×70 | (24, 766) 345×70 | **0** |
| **탭바 하단 간격** | **16** | **16** | **0** |

반응형 공식 검증 (`AC-3-87`, e2e 측정) — `트랙 = min(W, 480)` · `카드 = 트랙 − 28` · `peek = pad − gap = 8` 불변:

| W | 트랙 | 카드 | peek | 트랙 높이 |
|---|---|---|---|---|
| 320 | 320 | **292** | 8 | 415 |
| **393** | **393** | **365 (Figma 일치)** | 8 | 415 |
| 600 | 480 | 452 | 8 | 415 |
| 1024 | 480 | 452 | 8 | 415 |

네 폭 모두 **카드 하단 ≤ 탭바 상단(겹침 0)** + **탭바 하단 16** 을 e2e 가 측정으로 확인한다
(`AC-3-06` M-01 Critical 해소).

## R3. 구현한 AC

| AC | 결과 | 근거 |
|---|---|---|
| `AC-3-06` | **해소** | ActionBar 1행(`Save` 87 고정 + `Start` flex) → 320 포함 4폭 겹침 0 · 탭바 하단 16 |
| `AC-3-09` · `AC-3-13` | 유지 | 두 endpoint 호출 · 화면 문자열은 전부 서버 값 또는 copy 모듈 |
| `AC-3-10` (수정) | 충족 | 앞면 = 역량 배지 · 표지 · 제목 · 이유 / **코칭 문장은 뒷면 beige 노트** |
| `AC-3-12` | 유지 | 역량 라벨 · `--color-capability-*`, `" Day"` suffix 0건 |
| `AC-3-14` (수정) | 충족 | Skeleton = **가로 트랙 1장 + peek**, ActionBar 자리는 `Skeleton rect`. `empty`/`error`/`offline` 이 트랙 높이 415 점유 |
| `AC-3-15` | 유지 | `session-already-active` 안내 + `/v1/sessions` 호출 0건 (⚠ §R8 ③) |
| `AC-3-16` (수정) | 충족 | Prompt 전체 + 코칭 노트가 **카드 뒷면** (별도 Sheet 아님) |
| `AC-3-18` (수정) | 충족 | 좌우 버튼 **DOM 부재** + 트랙 `tabindex=0` ←/→/Home/End 로 3장 도달, 스냅 끝 도달 측정 |
| `AC-3-19` (유효화) | 충족 | flip transition 이 `prefers-reduced-motion: reduce` 에서 제거되고 스크롤도 즉시 이동 |
| `AC-3-20` (수정) | 충족 | `reread-option` · `books-exhausted` 2종. `conversation-only-option` 은 **폐기** |
| `AC-3-21` | 유지 | 표지 `alt` + 로드 실패 placeholder (고정 aspect + `object-fit: cover`) |
| `AC-3-66` | 충족 | Home baseline **전면 재생성** (§R6) |
| ⭐ `AC-3-82` | 충족 | `empty` 안내 + **지난 날짜 배너 DOM 부재** (전 상태) |
| ⭐ `AC-3-83` | 충족 | 앞면이 fixture 개수(5)를 **전부** 렌더 · `slice(` 0건 · contracts 상한 없음 |
| ⭐ `AC-3-84` | 충족 | `PUT …/saved-books` **1회** · 멱등(같은 응답) · `Idempotency-Key` 미전송 |
| ⭐ `AC-3-85` | 충족 | `library:error` · `library:offline` 에서 낙관값 **롤백** + Toast |
| ⭐ `AC-3-86` | **부분** | 요청 body = 보이는 옵션의 **책 id**. ⚠ "보호자 직접 입력 책" 분기는 §R8 ④ |
| ⭐ `AC-3-87` | 충족 | 4폭 트랙 공식 측정 + 좌우 버튼 DOM 부재 |
| ⭐ `AC-3-88` | 충족 | 날짜 문자열 화면 노출 0건 · 클라이언트 날짜 재판정 코드 **삭제**(`formatCardDate`·`stale`) |
| ⛔ `AC-3-11` · `AC-3-17` | 폐기 | 해당 UI 제거 |
| ⏭ `AC-3-22`~`26` | 이월 | Reading Context 진입점·시트·시간 목록 **제거** (contract·Mock 은 유지) |

## R4. contracts · Mock 변경

### R4.1 `packages/contracts`

| 변경 | 내용 |
|---|---|
| `enums/activity.ts` | `ActivityOptionKind` 에서 **`conversation_only` 제거** → `['book', 'reread_book']` (approvals §12.12) |
| `activity/option.ts` | `book` **non-null** · `title` **삭제** · `userEnteredBook` **삭제** · **`saved: boolean` 추가**(`G-14`) |
| `library/saved-book.ts` **(신규)** | `SaveBookTargetSchema`(bookId ↔ title+author) · `SaveBookRequestSchema` · `SavedBookSchema` |
| Error Code | **신규 0건** — 28종 유지 (`RESOURCE_NOT_FOUND` · `VALIDATION_FAILED` 재사용) |
| `enums/session-mode.ts` | **건드리지 않았다** — `SessionMode.conversation_only` 는 Stage 4 소관이고 유지된다 |

테스트: `packages/contracts/src/__tests__/saved-book.test.ts` **신규**, `activity-card.test.ts` · `enums.test.ts` 갱신.

### R4.2 Mock

| 파일 | 내용 |
|---|---|
| `mocks/library/MockLibraryApi.ts` **(신규)** | 저장/해제. **멱등**(첫 저장 시각 고정) · 상한 없음 · 결정적 |
| `mocks/fixtures/saved-books.ts` **(신규)** | `DECK_BOOKS` 3권 + 표지 매핑 + `resolveSaveTarget` |
| `mocks/fixtures/activity-cards.ts` | `conversation-only` 모양 **삭제** · `saved` 모양 추가 · 덱 책을 **Figma 책 3권**으로 교체 |
| `mocks/activities/MockActivityApi.ts` | key `conversation-only-option` → **`book-saved`** |
| `shared/api/library-api.ts` · `http/HttpLibraryApi.ts` **(신규)** | interface + Http 골격 (IK 미전송) |

### R4.3 Mock 시나리오 전환 방법

URL 쿼리 · dev 패널 · `VITE_MOCK_SCENARIO` 셋 다 Stage 1 `D-5` 방식 그대로다.

```
/?scenario=activity-cards:book-saved        # 첫 카드가 처음부터 `Saved` (G-14)
/?scenario=activity-cards:reread-option     # 재독 카드 1장
/?scenario=activity-cards:books-exhausted   # 3장 전부 재독 카드 (책 소진)
/?scenario=activity-cards:loading           # 트랙 Skeleton (1장 + peek)
/?scenario=activity-cards:empty             # 카드 없음 안내 (트랙 높이 점유)
/?scenario=activity-cards:error             # ErrorState + 재시도
/?scenario=activity-cards:offline           # 오프라인 안내
/?scenario=library:error                    # ★ Save 실패 → 롤백 + Toast
/?scenario=library:offline                  # ★ Save 오프라인 → 같은 실패 경로
/?scenario=library:retry                    # 1회차 실패 후 성공
/?scenario=home:session-already-active       # 이어하기 안내
```

신규 그룹 **`library`** (6 key). `book-saved` 는 `API_CONTRACTS.md` §5.4 catalogue 등재 key 다.

## R5. 검증 명령 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm test` | ✅ **109 파일 / 1304 테스트** |
| `pnpm lint:boundaries` | ✅ 위반 0 (542 모듈 · 1841 의존) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm assert:no-mocks` | ✅ sentinel 0건 |
| `pnpm test:e2e` (단독) | ✅ **172 통과** |

## R6. 시각 baseline

**기존 Home baseline 5장을 전부 삭제하고 재생성했다.**

| baseline | 상태 | 대상 Figma |
|---|---|---|
| `s2-home-header` | **재생성** | `26:21` 헤더 |
| `s3-home` | **재생성** | `26:21` |
| `s3-home-deck` | **재생성** | `163:2649` |
| `s3-home-deck-back` | **신규** | `86:482` |
| `s3-home-deck-scrolled` | **신규** | `163:2648` (카드 2 스냅) |
| `s3-home-card-save-saved` | **신규** | `117:973` (saved 변형 부재 — `D-REQ-1a`) |
| `s3-tabbar-top` · `s3-tabbar-bottom` | **재생성** | `25:87` + 하단 16 |
| `s3-home-deck-prompts-expanded` | **삭제(폐기)** | — |
| `v6-bubble` | **재생성** | `SpeechBubble` 이 `88:721` → **`50:176` Type2** 기준으로 바뀜 |

## R7. 토큰 · 에셋 · 컴포넌트 최종 건수

| 구분 | 건수 | 내용 |
|---|---|---|
| Tier 1 primitive | **+1** | `--haru-white-a82` |
| Tier 2 semantic | **+7** | `--space-4-5`(18) · `--layout-tabbar-bottom-gap`(16) · `--shadow-cover` · `--color-surface-card` · `--color-surface-spring` · `--color-icon-flip` · `--color-icon-save-star` |
| Tier 3 component | **+56 순증** (58 → **114**) | bubble 재정의 · `--home-*` 10 · `--activity-*` 33 · `--prompt-*` 6 |
| HARU 아이콘 | **+2** | `haru:flip-to-back`(24×24) · `haru:save-star`(14×13) — 둘 다 Figma SVG export + `currentColor` 변환 |
| 래스터 에셋 | **+3 신규 / 1 교체** | 책 표지 3종(**Mock 전용 임시**) / `home-character.png` **재crop**(915×1133, aspect 0.80759) |
| Shared UI 신규 컴포넌트 | **0** | `SpeechBubble` 은 기존 확장(`hint` 슬롯) |

⚠ 감사 §16.8 은 semantic/primitive **3건**을 예상했는데 실제는 **8건**이다. 늘어난 5건은 전부
**Tier 3 → Primitive 직접 참조 금지**(`build-tokens` 규칙 3-4) 때문에 semantic 경유가
유일한 경로인 경우다 — `--color-prompt-tag-*` 가 Stage 3 에서 같은 사유로 신설된 선례와 같다.
**신규 색 값(HEX)은 0건**이다: `#d3e3de`=`--haru-mist-200` · `#b0cfc0`=`--haru-palette-mint` ·
`#d0cca1`=`--haru-palette-yellow` 로 **전부 기존 palette 안에 있었다** (→ `D-REQ-1c` 해소).

## R8. 명세 오류 · 모순 — **고치지 않고 보고**

| # | 내용 | 영향 | 처리 |
|---|---|---|---|
| ① | **Figma 내부 폭 불일치** — 카드 내부 컨테이너는 **329**(`I163:2649;85:593`·`85:535`·`85:550`)인데 그 안의 pill·ActionBar 는 **330** 이다. 카드 365 − padding 36 = 329 이므로 330 은 1px 넘친다 | pill·ActionBar 폭이 Figma 대비 −1 | 329(= 내부 폭 100%)로 구현. **Figma 수정 대상** |
| ② | **버블 높이** — Figma 프레임 `261:1293` 은 96 인데 본체는 60.73 이고 tail 끝이 ~68.7 이다. 즉 프레임에 **27px 빈 공간**이 있다 | 구현은 내용 높이로 자란다 (현재 copy 가 2줄이라 ~81) | 고정 높이를 두지 않았다. 세로 배치는 spacer 가 흡수하므로 **카드·dots·탭바 위치는 Figma 그대로**다 |
| ③ | **`AC-3-15`(이어하기 안내)의 자리가 Figma 에 없다** — `26:21` 자식 목록에 해당 요소가 없다 | `home:session-already-active` 에서만 보이는 조건부 블록 | AC 가 **유효**하므로 트랙 바로 위에 렌더했다. **디자인 확인 필요** |
| ④ | **`AC-3-86` ↔ approvals §12.12 충돌** — AC 는 "보호자 직접 입력 옵션은 `title`(+`author?`)" 를 요구하는데, §12.12 가 `book` 을 non-null 로 만들면서 `userEnteredBook` 이 사라졌다 | Home 의 Save 는 항상 `{bookId}` 를 보낸다 | contract 의 `SaveBookTarget` 은 **양쪽을 유지**한다 (Library 라운드에서 쓰인다). AC-3-86 의 두 번째 분기는 Home 에서 **검증 불가** |
| ⑤ | **뒷면 CoachingNote 개수** — Figma `86:482` 는 `[pill, note] × 2 + pill` 로 노트가 **2개**인데 contract 는 옵션당 `coachingLine` **1개**다 | 뒷면 노트 1개 | 첫 pill 뒤에 1개만 렌더했다 (없는 문장을 지어내지 않는다). **Figma ↔ contract 중 하나를 맞춰야 한다** |
| ⑥ | **`AC-3-20` 이 `conversation-only-option` 을 여전히 명시**한다 (Plan §11.3) | 해당 시나리오 삭제 | approvals §12.12 가 **나중 결정이라 우선**. Plan 본문 갱신 대상 |
| ⑦ | **Figma `26:40` 칩이 `2week /115 Min`** 인데 구현은 `2 this week` 다 | 헤더 칩 | `A-23` 사용자 결정대로 유지. **Figma 불일치로 등록** |
| ⑧ | **감사 §16.8 의 "semantic/primitive 3건"** 이 Tier 규칙상 성립하지 않는다 (§R7) | 토큰 8건 | 값은 전부 기존 palette 안이라 **디자인 영향 0**. 보고만 |
| ⑨ | **Figma 뒷면 gap 이 6/8/8/8 혼재** (`A-22`) | 뒷면 블록 간격 | 감사 권고대로 **8 통일** |
| ⑩ | **Figma 트랙 gap 이 6 ↔ 10 혼재** (`A-3`) | peek 8 ↔ 4 | 감사 §11.3 대로 **6 채택**(peek 8). `--activity-track-gap` **1줄**로 교체 가능 |

## R9. `BACKEND_INTEGRATION_PENDING` (이번 범위에서 새로 확정)

| ID | 내용 |
|---|---|
| **`P3-BIP-15`** | **책 저장 상태의 서버 소유** — `child_books.saved`·`saved_at` 생성·멱등 보장, `PUT` 재호출 시 **같은 `savedAt`**, `DELETE` 멱등, `LibraryFilter=saved` 조회, `source=card_save` 기록, 전체 삭제(FR-21) 포함. Handoff = `BACKEND_HANDOFF.md`·`DATA_REQUIREMENTS.md` |
| `P3-BIP-10` (범위 확대) | **카드 응답에 서재 조인이 생긴다** — `ActivityCardOption.saved`(`G-14`)를 채우려면 `activity_cards` 조회가 `child_books` 를 조인해야 한다. **2초 NFR 에 영향** |
| `P3-BIP-01` · `P3-BIP-02` (범위 변경) | **서버는 항상 책이 있는 카드를 내려준다** (approvals §12.12). 추천할 책이 없으면 **재독 카드**로 해결하며 책 없는 카드를 만들지 않는다 |
| `P3-BIP-01` (판정 AC 교체) | ~~`AC-3-11`~~ → `AC-3-82` · `AC-3-12` · `AC-3-88` |
| `P3-BIP-03` (판정 AC 교체) | ~~`AC-3-17`~~ → `AC-3-83`. "확장 도달" 기대 삭제 |
| 표지 이미지 | **`BookSummary.coverUrl` 은 Backend 가 제공한다.** 현재 Frontend 의 Figma export 3종은 **Mock 전용 임시 에셋**이며 연동 시 교체된다 (`shared/assets/book-covers/index.ts` 주석) |

## R10. Scope 경계에서 **보류 / 미생성**

- `apps/api/` · `supabase/` — **미생성** (확인됨)
- Reading Context 진입점·시트·시간 목록 — **제거**(이월). `useSelectActivityOption` 과
  `POST …/selection` contract·Mock 은 **유지**하며 `mocks/__tests__/MockActivityApi.test.ts` 가 계속 검증한다
- `Carousel` (`packages/ui`) — **만들지 않았다.** Library Figma 재대조 전에는 공유 API 를 설계할 수 없다 (audit §16.2)
- `BookSource` += `card_save` / `LibraryFilter` += `saved` — **Library 라운드 항목**. 두 enum 자체가 아직 없다
- `LibraryBook` — 정의하지 않았다. 저장 응답은 `SavedBook` 이며 Library 라운드에서 `LibraryBook` 으로 흡수한다
- `SwipeDeck` — **삭제하지 않았다.** Stage 2 온보딩 설문이 계속 쓴다 (Home 에서 사용만 중단)

---

# Stage 3 Home — Visual Gap 교정 (2026-10-05, 3차)

> design-agent 의 **구현 후 Visual Gap 검토**(`docs/design/stage-3-home-figma-audit.md` §20)와
> 사용자 결정 4건(`docs/decisions/stage-3-approvals.md` §12.14)을 반영했다. 위 §R1~§R10 중
> 충돌하는 항목은 **이 절이 정본**이다.

## G1. High — pill 테두리가 높이를 밀어내던 결함 (`V-1`·`V-2`)

**원인**: `border: 1px solid` 가 padding box **바깥**에 붙어 2줄 pill 이 42 → **44** 가 되었다.
Figma 의 stroke 는 높이에 더해지지 않는다.

**해법**: `box-shadow: inset 0 0 0 1px` 로 교체 (`V-1`·`V-2`·`V-3` 동시 해소).
pill 에는 다른 그림자가 없으므로 겹치지 않는다 — 카드 그림자는 `.haru-activity-card--front`,
`Save` 그림자는 `.haru-activity-card__save` 가 따로 소유한다. `.haru-prompt-pill--outline`
한 규칙에만 적용해 다른 컴포넌트로 번지지 않는다.

| 폭 | 수정 전 | **수정 후** |
|---|---|---|
| 393 | 42 / **44** / **44** / **44** / 42 → 합 **192 > 186** → 4번째 pill 하단 **6px 잘림** | **42 / 42 / 42 / 42 / 42** → 4개 합 **186 = 186** |
| 320 | 5개 전부 **44** → **244 vs 186** | **42 × 5** |

**잘림 해소 실측**: 4번째 pill `bottom = 632` = Prompt 목록 `bottom = 632` → **잘림 0** (393·320 동일).
5번째는 설계대로 목록 내부 스크롤(`clientHeight 186` ↔ `scrollHeight 234`)로 간다.

## G2. V-4 ~ V-8 실측 전 / 후

| ID | Figma | 수정 전 | **수정 후** |
|---|---|---|---|
| `V-4` Tag 타이포 | padding 13 · line-height 12 · Semibold | padding 12 · lh 16 · weight 400 | **13 / 12 / 590** ✅ (카드 안에서만 override — 공유 `Tag` 는 26·12·16 그대로) |
| `V-5` 워드마크 | web (26, 19) 64×25 | (24, 15) 63.77×28 | **(26, 19) 63.77×25** ✅ (폭 Δ0.23 = 폰트 메트릭) |
| `V-6` Streak 칩 | `26:40` (188, 12) **145×34**, icon 13×13 | (213, 16) 110×**26**, icon 16 | **(212, 12) 110.95×34**, icon **13×13** ✅ — **문구 `2 this week` 유지**, 폭은 hug (`A-23`) |
| `V-7` tail 돌출 | — | 8 | **8 유지 — 변경 없음 (§G5 ① 참조)** |
| `V-8` 버블 높이 | 303×96 (주 텍스트 **1줄**) | 303×82 (주 텍스트 **2줄**) | **82 유지 — copy 길이 문제 (§G5 ②)** |

## G3. Low 7건

| ID | 처리 |
|---|---|
| `V-3` pill padding-inline | 12 → **13** (`--prompt-pill-pad-inline`). Pagetag x = 32 + 13 = **45** ✅ |
| `V-9` hint `nowrap` | `white-space: nowrap` 적용 ✅ |
| `V-10` 버블 그림자 | `--shadow-rest`(drop 3겹) → **신규 `--shadow-bubble`**(drop 1겹 + inset 2겹) ✅ |
| `V-11` `Save` 배경 | 0.90 → **0.85** (`--haru-white-a85` → `--color-action-white-bg`). 실측 `rgba(255,255,255,0.85)` ✅ |
| `V-12` note padding | 14 → **13** ✅ (실측 `padding-block-start: 13px`) |
| `V-13` 뒷면 하단 여백 | 8 → **7** ✅ |
| `V-14` 제목/저자 line-height | 22 / 16 → **20.4 / 15.6** (실측 박스 20.41 / 15.59) ✅ |

`V-9` 주의: 320px 에서 hint 는 **228px**, 버블 content box 는 **225px** 다. nowrap 이라
3px 가 content box 를 넘지만 좌우 padding 16 안쪽이므로 **버블 밖으로 나가지 않는다**
(텍스트 우측 끝 283 < 버블 우측 끝 296). 시각 결함 없음.

## G4. §12.14 사용자 결정 반영

### G4.1 뒷면 코칭 노트 — **contract 변경**

**채택한 모양: `Prompt.coachingNote`** (Prompt 에 필드 추가).

```ts
// packages/contracts/src/prompts/prompt.ts
coachingNote: z.string().min(1).nullable().optional(),

export function createPromptCoachingRefine() { /* question 이면 non-null 강제 */ }
```
- `ActivityCardOption.promptPreview` · `PromptSet.questions` 에 `.superRefine(createPromptCoachingRefine())`
- **`ActivityCardOption.coachingLine` 삭제** · **`PromptSet.coachingLine` 삭제**

**선택 근거 (평행 배열을 쓰지 않은 이유)**

1. **1:1 이 타입으로 보장된다.** 별도 배열(`coachingNotes: string[]`)이면 길이·순서 불일치를
   런타임에서만 잡을 수 있다. 지금은 `question` 에 노트가 없으면 **parse 가 거부**한다
   (`path: ['promptPreview', i, 'coachingNote']`).
2. **뒷면 렌더에 인덱스 조인이 없다** — `promptPreview.map(p => [pill(p), note(p.coachingNote)])`.
   잘못된 쌍 매칭이 구조적으로 불가능하다.
3. `phase` · `pageRef` 와 같은 **"Prompt 에 붙는 메타"** 계열이라 기존 모양과 일관된다.
4. `follow_up` 은 노트를 갖지 않으므로 `nullable` 이고, 규칙은 **질문 Prompt 에만** 건다 —
   없는 데이터를 요구하지 않는다.

⚠ `docs/API_CONTRACTS.md` 동기화는 **plan-agent 소관**이라 수정하지 않았다.
⚠ Backend 요구: `P3-BIP-03` 범위 확대 — **Prompt 마다 상세 코칭 노트**를 동반해야 한다.

### G4.2 `V-15` — `ActiveSessionNotice` 제거

- `entities/home/ActiveSessionNotice.tsx` **삭제**, `homeOverviewCopy.activeSession` **삭제**
- `home:session-already-active` 에서 Mock 이 **다른 `characterLine`** 을 내려준다:
  `A storytime is still open — you can pick it back up.`
- 화면은 **서버 값을 그대로 표시**할 뿐이고 조건부로 문구를 만들지 않는다 (`rules/frontend.md` §8)

**실측 (scenario `home:session-already-active`, 393×852)**

| 항목 | 값 |
|---|---|
| `.haru-alert` / `.haru-inline-alert` | **0개** |
| 버블 문구 | `A storytime is still open — you can pick it back up.` |
| 버블 | (39, 51) 303×82 → **하단 133** |
| 트랙 | (0, **290**) 393×415 |
| **캐릭터** | (24, **29**) **357×442.05** — 불변 |
| 가림 여부 | 버블 하단 133 … 트랙 상단 290 **사이가 비어 있다** → 캐릭터 얼굴(눈 ≈184 · 입 ≈201)이 **가려지지 않는다** ✅ |
| dots / 탭바 | (173.5, 717) / (24, 766) — 불변 |

### G4.3 뒷면 5쌍 — 내부 스크롤 실측

| 항목 | 값 |
|---|---|
| pill 개수 / note 개수 | **5 / 5** (1:1) |
| 본문 블록 | (y 342) 356 높이 = Figma 52…408 ✅ |
| `clientHeight` ↔ `scrollHeight` | **356 ↔ 808** → 스크롤 발생 ✅ |
| 끝까지 스크롤 | `scrollTop = 452` (= 808 − 356) ✅ |
| **뒷면 카드** | (290) **415** — 스크롤 전/후 **불변** ✅ |
| **트랙** | (0, 290) 393×**415** — 스크롤 전/후 **불변** ✅ |

## G5. 보고 — 고치지 않은 2건 (근거 첨부)

### ① `V-7` 버블 tail 돌출 16.2 → **수정하지 않았다. 8 이 Figma 값이다.**

design-agent 는 `get_metadata` 의 `y=60.54` 를 tail **상단**으로 읽어 "본체 하단(60.73)부터
16.345 돌출" 로 계산했다. **Figma 렌더를 픽셀로 재서 반증했다**:

```
get_screenshot(261:1293) 311×96 (세로 베젤 0) → 밝기 임계로 면 판정
  본체 면: row 0 … 59      (= 60.73 ✓)
  tail  면: row 60 … 67, x 236…256
  ⇒ 본체 아래 돌출 = 67 − 59 ≈ 8px
```
`get_design_context` 의 inset 값(`top 54.55%` → 52.37, `height 16.35` → bottom 68.72)과도
일치한다: tail 박스의 **위쪽 절반은 본체에 가려** 있고 **보이는 돌출은 8** 이다.
구현 실측도 본체 하단 133 ↔ tail 하단 141 = **8** 이다. → **Figma 와 일치. 변경 없음.**

### ② `V-8` 버블 96 (주 텍스트 1줄) → **copy 길이 때문에 불가. 문구는 바꾸지 않았다.**

- 버블 content box = **271px** (303 − 좌우 16)
- Figma 주 텍스트 `Hi! Ready for Emma's story tonight?` = 271×20 → **1줄**
- Mock `characterLine` = `Fifteen minutes together is plenty for tonight.`
  → 1줄에 필요한 폭 **≈ 460px** (393 에서 1행 264.75 + 2행 192.13) ≫ 271 → **2줄**

→ 높이 차이는 기하가 아니라 **서버 값 길이**다. `characterLine` 은 서버(Mock) 값이므로
**임의로 줄이지 않았다.** 1줄로 맞추려면 **≤ 271px(약 35자)** 짜리 `characterLine` 이 필요하다
→ **문구 결정 요청**.

> 참고: Figma 프레임 `261:1293` 은 96 이지만 **본체 60.73 + tail 8 = 약 69** 에서 콘텐츠가
> 끝나고 나머지 27 은 프레임 여백이다. 구현은 내용 높이로 자라며, 세로 배치는 spacer 가
> 흡수하므로 **카드·dots·탭바 위치는 Figma 그대로**다.

## G6. `s3-tabbar-bottom` 재촬영

**원인이 뷰포트 하나가 아니었다.** 393×600(실제 스크롤됨)으로 바꿔도 **바 요소만 클립하면
2컷이 그대로 같았다** — 유리 바 뒤에 구분되는 콘텐츠가 없기 때문이다.

→ ① **393×600** + ② **화면 하단 220px 영역**을 통째로 촬영하도록 바꿨다. 그래야
"마지막 콘텐츠가 중앙 버튼에 가리는가"(§2.1 sticky 규칙)가 그림에 들어온다.
테스트 안에 `scrollHeight − clientHeight > 0` 단언을 넣어 전제가 깨지면 **실패**하게 했다.

| baseline | md5 |
|---|---|
| `s3-tabbar-top` | `f8fbbf0ca51f7a8558d57319a06d5082` |
| `s3-tabbar-bottom` | `5eed2fb6a608ff1a60af06212de32267` |

→ **달라졌다** (이전에는 둘 다 `5cfbcdc6…`). 상단 컷은 스크롤 전(마지막 콘텐츠가 바 뒤),
하단 컷은 스크롤 끝(카드 하단 + dots + 탭바 + 하단 16)이 보인다.

## G7. e2e "1건 실패" 의 정체 — **경합이 아니라 실제 결함이었다**

- **테스트**: `e2e/home.spec.ts` › `트랙 공식이 성립한다 — 카드 = W − 28, peek = 8 (AC-3-87)`
- **증상**: 첫 루프(320px)에서 `measured.track` 이 **0**
- **원인**: `logIn()` 은 **URL 만** 기다린다. 측정 직전에 로드 완료 트랙을 기다리지 않아
  레이아웃 도중 폭 0 을 읽었다. 단독 실행에서는 타이밍이 맞아 통과하던 **실제 flake 결함**이며,
  다른 Playwright 와의 경합이 아니다 (단독 실행에서 재현됨 — `RUN-A`).
  ⚠ 2차 보고 때 넣었다고 적은 대기 보강이 **prettier 재포맷 때문에 패치가 적용되지 않았다**.
- **수정**: `.haru-activity-track:not(.haru-activity-track--skeleton)` 가 보이고
  `clientWidth > 0` 이 될 때까지 대기한 뒤 측정.
- **확인**: 단독 전체 실행 **2회 연속 174/174 통과** (`RUN-B` · `RUN-C`).

## G8. 검증 명령 결과 (최종)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm test` | ✅ **109 파일 / 1313 테스트** |
| `pnpm lint:boundaries` | ✅ 위반 0 (541 모듈 / 1838 의존) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm test:e2e` (**단독**) | ✅ **174 통과** (2회 연속) |
| `pnpm assert:no-mocks` | ✅ |

## G9. 토큰 최종 건수 (갱신)

| 구분 | 2차 | **3차** |
|---|---|---|
| Tier 1 primitive 색 | 31 | **32** (+`--haru-white-a85`) |
| Tier 2 semantic 색 | 71 | **72** (+`--color-action-white-bg`) |
| Tier 2 semantic shadow | — | **+1** `--shadow-bubble` |
| Tier 3 component | 114 | **127** (+13: 워드마크 3 · 칩 3 · 카드 6 · 버블 1) |

## G10. 회귀 가드 (새로 고정한 것)

`apps/web/__tests__/stage3-css-guards.test.ts` 에 Visual Gap 교정분을 소스 수준으로 고정했다 —
`V-1`(`border` 금지 + inset box-shadow) · `V-3` · `V-4`(+ 공유 `Tag` 불변) · `V-11` · `V-12` ·
`V-13` · `V-14` · `V-5`/`V-6`(+ 공유 `Tag` 높이 26 불변).
e2e 에는 **뒷면 1:1 + 내부 스크롤 + 트랙 415 불변**, **`V-15` 캐릭터 비가림**을 추가했다.

---

# Stage 3 Home — 버블 변경 (2026-10-05, 4차)

> 사용자 결정(`V-8` 에 대한 답, 2026-10-05): *"버블 문구를 **2줄 이상으로 늘어날 수 있도록 허용**
> 하고 **x 버튼을 두어서 메시지를 삭제**할 수 있게 한다."*

## B1. 버블 높이 — 내용에 따라 자람

- **Mock `characterLine` 을 그대로 두었다** (문구를 줄이지 않았다).
- 버블에 고정 높이가 없다. 늘어난 높이는 **spacer 가 흡수**하므로 하단 고정 요소가 움직이지 않는다.
- **`V-8` 은 Figma 불일치로 등록**한다 — Figma 프레임 96(주 텍스트 1줄) ↔ 구현은 **내용 기반**.
  (Figma 96 중 실제 콘텐츠는 본체 60.73 + tail 8 ≈ 69 이고 나머지 27 은 프레임 여백이다.)

### 실측 (393×852, 주 문구 line-height 20)

| 주 문구 | 버블 높이 | 버블 하단 | 트랙 y | dots y | 탭바 y | 캐릭터 |
|---|---|---|---|---|---|---|
| **2줄 (기본)** | 82 | 133 | **290** | **717** | **766** | (24,29) 357×442 |
| 3줄 | 102 | 153 | **290** | **717** | **766** | 불변 |
| 4줄 | 122 | 173 | **290** | **717** | **766** | 불변 |
| 5줄 | 142 | 193 | **290** | **717** | **766** | 불변 |
| 8줄 | 202 | 253 | **290** | **717** | **766** | 불변 |
| 13줄 | 302 | 353 | 353 (밀림) | 780 | 766 | 불변 |

- **3줄·4줄에서 캐릭터 얼굴이 가려지지 않는다** — 버블 하단 153 / 173 < 눈 **184**.
- ⚠ **5줄부터는 눈(184)을 덮기 시작한다** (하단 193). 기하 결함이 아니라 **문구 길이**의 결과다.
- ⚠ **13줄쯤부터 spacer 가 0 이 되어** 카드가 아래로 밀리고 `main` 이 스크롤된다 — §11.1 이
  정의한 동작(뷰포트 높이 709 미만과 같은 경로)이며 결함이 아니다.
- e2e 가 **8·12·16·30 단어**에서 ① 하단 고정 요소 불변 ② `lines ≤ 4` 면 얼굴 비가림
  ③ 어떤 길이에서도 카드(290)를 밀지 않음을 검사한다.

## B2. 닫기(x) 버튼

⚠ **Figma `50:176` 에 없는 요소다.** 사용자 지시로 추가했으며 **허용 차이 등록 + 디자이너 확인**
대상이다 (`D-REQ-2`).

| 항목 | 선택 | 근거 |
|---|---|---|
| 컴포넌트 | **기존 `IconButton variant="plain"`** | 신규 Shared UI 0건. `InlineAlert` 의 닫기와 **같은 구성**이다 |
| API | `SpeechBubble` 에 `onDismiss` + `dismissLabel` 추가 | `InlineAlert` 와 **prop 이름까지 동일**. 둘 다 있을 때만 렌더 → 접근 가능한 이름 없는 버튼이 생기지 않는다 |
| 아이콘 | **기존 `Icon name="x"`** (lucide `X`) | `Toast` · `InlineAlert` · 온보딩 favorites 가 이미 쓴다. 신규 에셋 0건 |
| 접근성 이름 | **`Dismiss`** | **신규 문구가 아니다** — `onboarding-survey` 의 `notices.dismiss` 와 **같은 문자열**이다. feature 간 copy import 은 금지(`AC-3-03`)라 `homeOverviewCopy.bubbleDismiss` 로 값을 다시 선언했다 |
| 터치 타깃 | **44×44** | `IconButton` 의 `::before` 확장(`--icon-button-hit-size`)이 보장. e2e 가 계산으로 검증 |
| 배치 | 버블 **본체 안** 우상단 `absolute`, inset 2 | **본체 기하를 건드리지 않는다** — 303 폭 · radius 22 · tail left 76.32% · 돌출 8 **전부 불변** |
| 글자 겹침 | `padding-inline-end` 를 버튼 폭만큼 확장 | 글자가 버튼 밑으로 들어가지 않는다. Figma 에 버튼이 없으므로 "정답 폭"이 없고, 겹치는 것보다 자리를 비우는 쪽을 택했다 |

신규 Tier 3 토큰 **1건**: `--bubble-dismiss-inset: 2px` (버튼 폭은 `--icon-button-size` 재사용).

> ⚠ 더 구체적인 접근성 이름(`Dismiss message` 등)은 **새 문구**라 임의로 만들지 않았다.
> 필요하면 문구 결정이 필요하다 — **보고 항목**.

## B3. 닫기 유지 범위 — **지금 그 문구에 한정 (컴포넌트 state)**

```ts
const [dismissedLine, setDismissedLine] = useState<string | null>(null);
const showBubble = characterLine !== null && characterLine.length > 0
  && characterLine !== dismissedLine;
```

**근거**

1. **범위를 넓히지 않는다** — `localStorage`/`sessionStorage` 는 저장소 추가이고
   `rules/architecture.md` §9(로컬 데이터·Privacy) 범위 확대라 **승인 대상**이다. 임의로 하지 않았다.
2. **`AC-3-15` 를 지킨다** — 닫기를 **문구 단위**로 기억하므로 `characterLine` 이 바뀌면
   **다시 보인다**. `home:session-already-active` 처럼 **상태를 알리는 문구가 닫힌 채 묻히지 않는다**.
   (`AC-3-15` 의 검증 지점이 버블이다 — `V-15`.)
3. **선례와 같다** — `onboarding-survey` 의 `TrialNotice` 가 같은 모양(`useState` dismissed)이다.
4. 렌더 중 비교라 **effect 가 없다** — 닫힘 상태를 되돌리는 동기화 코드가 필요 없다.

**`characterLine` 변경 시 재표시: 예.** 위 2번이 그 이유다. 서버가 새 문장을 주면(상태 변화·날짜
변화·세션 발생) **그 문장은 닫힌 적이 없으므로** 그대로 표시된다. 같은 문장이 다시 오면 닫힌 채다
— 사용자가 "그 메시지"를 지웠다는 의도와 일치한다.

**재마운트(라우트 이동·새로고침) 시 복귀한다.** 영속을 원하면 저장소가 필요하므로 **별도 승인**
대상이다.

## B4. 회귀 테스트 5종

| # | 요구 | 어디 |
|---|---|---|
| 1 | 2줄·3줄에서 캐릭터 얼굴 비가림 | e2e `버블이 2줄·3줄·4줄로 자라도 다른 요소가 움직이지 않는다` |
| 2 | x 버튼 **44×44** 터치 타깃 | e2e `버블 닫기 — 터치 타깃 44×44…` (`::before` inset 계산) |
| 3 | 닫아도 다른 요소가 밀리지 않는다 | 같은 e2e — 트랙 **290** · dots **717** · 탭바 **766** 닫기 전후 `toStrictEqual` |
| 4 | 상태 문구가 영구히 묻히지 않는다 | e2e `닫기는 **그 문구에만** 적용된다…` + jsdom `characterLine 이 다르면…` |
| 5 | 키보드로 닫기 도달·실행 | jsdom `닫기 버튼이 키보드로 도달·실행된다` + `packages/ui` `is reachable by keyboard` |

## B5. 검증 명령 결과

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ |
| `pnpm test` | ✅ **109 파일 / 1319 테스트** |
| `pnpm lint:boundaries` | ✅ 위반 0 (541 모듈 / 1840 의존) |
| `pnpm build` | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm test:e2e` (**단독**) | ✅ **177 통과** |
| `pnpm assert:no-mocks` | ✅ |

## B6. baseline 변경

- **`s3-home` 1장만 재생성**되었다 (버블에 x 버튼이 생겼고 그 폭만큼 글자가 재배치된다).
- `s3-home-deck` · `-back` · `-scrolled` · `s3-home-card-save-saved` · `s2-home-header` ·
  `s3-tabbar-top/bottom` · `v6-bubble` 은 **변경 없음** — 버블이 프레임 밖이거나(덱 클립),
  dev gallery 가 `onDismiss` 를 주지 않기 때문이다.
- `s3-tabbar-top` `f8fbbf0c…` ↔ `s3-tabbar-bottom` `5eed2fb6…` — **여전히 서로 다르다**.

## B7. Figma 에 없어서 만든 것 (전수)

| # | 항목 | 사유 | 상태 |
|---|---|---|---|
| 1 | **버블 닫기(x) 버튼** | 사용자 지시 2026-10-05 | **허용 차이 등록 + 디자이너 확인 요청 (`D-REQ-2`)** |

그 외는 **0건**이다. `ActiveSessionNotice`(이전 1건)는 `V-15` 로 **제거**되었다.

---

# S. 카드 그림자 클리핑 수정 (approvals §12.15 · audit §22 · 2026-10-06)

사용자 검수 지적 *"카드 하단 쉐도우가 컨테이너에 갇혀서 짤려 보인다"* 의 수정. 결함은 지적보다
심했다 — 트랙 border box 하단 = 카드 하단(둘 다 y=705)이라 **그림자 자리가 0px**, 카드 하단
1px 아래부터 **완전 절단**이었다. `overflow-y: hidden` 만 지워도 해결되지 않는다(가로 스크롤을
쓰는 한 세로도 클립 박스다).

## S1. 적용한 CSS

**토큰 2종 신규** (`packages/design-tokens/src/component/index.css`, Tier 3)

| 토큰 | 값 | 용도 | 근거 |
|---|---|---|---|
| `--carousel-shadow-inset` | `var(--space-6)` = 24 | `padding-block-start` | 상단 번짐 실측 22 |
| `--carousel-shadow-inset-block-end` | `80px` | `padding-block-end` | 하단 번짐 실측 77. `--space-*` 는 40 에서 끝나므로 **Tier 3 직접 선언** (`--activity-card-track-size: 415px` 선례) |

**`.haru-activity-track`** (`apps/web/src/features/activity-card-deck/activity-card-deck.css`) —
`overflow-x: auto` · `overflow-y: hidden` 은 **그대로 두고** 비대칭 inset 을 넣었다.

```
block-size: calc(
  var(--activity-card-track-size) + var(--carousel-shadow-inset) +
    var(--carousel-shadow-inset-block-end)
);                                 /* 415 + 24 + 80 = 519 — ★ 가산이 승인 조건의 일부 */
padding-block-start: var(--carousel-shadow-inset);
padding-block-end: var(--carousel-shadow-inset-block-end);
margin-block-start: calc(-1 * var(--carousel-shadow-inset));
margin-block-end: calc(-1 * var(--carousel-shadow-inset-block-end));
```

`block-size` 가산이 필수인 이유: 트랙이 `box-sizing: border-box` 라서 `padding-block` 만 넣으면
content box 가 415 보다 **줄어** 카드가 찌그러진다. 음수 `margin-block` 이 레이아웃 점유와
scrollable overflow 를 되돌리므로 세로 배치는 1px 도 안 움직인다 (S3).

`.haru-activity-track--skeleton`(`overflow: hidden`)은 **수정하지 않았다** — 기본 규칙을 상속해
함께 고쳐진다 (audit §22.5 예측대로 실측 확인).

15행 머리말 주석을 "유일한 클리핑 박스" → "**가로·세로 모두 자르는** 유일한 클리핑 박스"로
정정하고 `R-SHADOW-1` 근거 주석을 선언 자리에 남겼다.

## S2. 세로 프로브 — 수정 **전** FAIL 확인 (`R-SHADOW-1` #6)

`e2e/shadow.spec.ts` 는 **가로만** 봤다. 그래서 이 결함을 못 잡았다. 세로 프로브를 추가했다
(카드 하단 +16px, `box-shadow` 있음/없음 두 번 렌더 → RGB 채널 차 합, 경계 8 — 같은 파일의
기존 방식). 프로브 x 는 카드 폭 25% 지점(가운데는 dots), 거리 16px(하단 바가 +26 부터 덮는다).

| 뷰포트 | 수정 전 | 수정 후 |
|---|---|---|
| 320 / 393 / 600 / 1024 | **4/4 FAIL — delta 0** | **4/4 PASS** |

수정 전 실패 메시지 예: `카드 하단 +16px (399, 637) 에서 그림자가 보이지 않는다 (delta 0)`.
→ 이 프로브는 **실제 검출력이 있다**.

## S3. 불변 항목 실측 (7개 뷰포트 — `getBoundingClientRect`)

| 뷰포트 | 카드 h | 카드 bottom | dots y | 탭바 y | 캐릭터 (x,y,w,h) | peek | 스냅 잔여 | 트랙 세로 스크롤 |
|---|---|---|---|---|---|---|---|---|
| 320×568 | **415** | 548 | 560 | 482 | (24,29,284,352) | **8** | **0** | 없음 (519=519) |
| 320×700 | **415** | 553 | 565 | 614 | (24,29,284,352) | **8** | **0** | 없음 |
| **393×852** | **415** | **705** | **717** | **766** | **(24,29,357,442)** | **8** | **0** | 없음 |
| 393×1000 | **415** | 853 | 865 | 914 | (24,29,357,442) | **8** | **0** | 없음 |
| 430×932 | **415** | 785 | 797 | 846 | (24,29,394,488) | **8** | **0** | 없음 |
| 600×800 | **415** | 653 | 665 | 714 | (84,29,444,550) | **8** | **0** | 없음 |
| 1024×768 | **415** | 621 | 633 | 682 | (296,29,444,550) | **8** | **0** | 없음 |

- `pad` 14 · `gap` 6 · `peek` = pad − gap = **8** 전 폭 불변. 스냅 후 카드 좌변 − 트랙 좌변 = **14**.
- 마지막 카드 스냅 `scrollLeft` == `scrollWidth − clientWidth` → **잔여 공백 0**, 우측 여백 14.
- 트랙 `scrollHeight == clientHeight`(519) → **세로 스크롤이 생기지 않는다**.
- 앱 셸 `scrollHeight` = 뷰포트 높이 (568/700/852/1000/932/800/768) — 적용 전과 동일.
- **카드를 뒤집은 뒤**(뒷면 415)에도 카드 h/bottom · dots · 탭바 전부 동일. 뒷면 내부 스크롤 유지.
- **바뀐 것은 트랙 자기 border box 하나뿐**: `y 290 h 415` → `y 266 h 519` (설계대로).

## S4. 포커스 링 (`R-SHADOW-1` #5)

트랙은 `tabIndex=0` 이고 UA 포커스 링은 **border box** 에 그려진다. inset 적용 후 링이
`266..785` 로 벌어져 dots·탭바 영역까지 감쌌다. `outline: none` 으로 끄고 **스냅된 카드**에
링을 옮겼다.

```
.haru-activity-track:focus-visible { outline: none; }
.haru-activity-track:focus-visible
  .haru-activity-track__item[data-active='true'] .haru-activity-card-flip { outline: … }
```

`ActivityCardTrack.tsx` 의 `__item` 에 `data-active={position === index ? 'true' : undefined}`
1줄 추가 (`index` 는 이미 prop). 토큰 3개 모두 기존 값(`--focus-ring-width` 2 ·
`--focus-ring-offset` 2 · `--color-focus-ring`). 기존 링은 화면 양끝까지 full-bleed 로
그려졌으므로 **개선**이다.

## S5. 깨진 테스트 — 판정과 근거

| 파일 / 단언 | 판정 | 근거 |
|---|---|---|
| `e2e/home.spec.ts` 트랙 공식 `measured.height).toBe(415)` | **의도된 변경** | 415 는 `--activity-card-track-size` = **카드** 높이다. 트랙 border box 가 우연히 같았을 뿐이다 → 측정 대상을 `.haru-activity-track__item` 으로 바꿨다 (값 415 유지) |
| 버블 성장 `base/grown.track?.y).toBe(290)` | **의도된 변경** | 290 은 **카드 상단**이다 → `__item` 측정으로 바꿨다 (값 290 유지) |
| 버블 닫기 `after.track).toBe(290)` **(2곳 — design-agent 예고에 없던 3번째 위치)** | **의도된 변경** | 같은 이유 → `__item` 측정 (값 290 유지) |
| `V-15` `bubble.bottom < track.y` | **의도된 변경** | 의도는 "버블 아래 ~ **카드 위** 공백" 이다. 트랙 border box(266)는 그림자 자리를 포함해 기준이 될 수 없다 → `__item` 측정 |
| 뒷면 스크롤 `trackAfter.height === trackBefore.height` | **그대로 통과** | 상대 비교 |
| `packages/design-tokens/__tests__/token-tiers.test.ts` Tier 3 개수 | **의도된 변경** | 128 → **130** + 토큰 2종 목록 추가 |
| `packages/design-tokens/__tests__/fonts.test.ts` `manifest.counts['component']` | **의도된 변경** | 128 → **130**. ⚠ `build` 로 manifest 를 다시 생성한 **뒤에만** 깨진다 — design-agent 예고에 없었고 `pnpm test` 단독 실행만으로는 드러나지 않는다 |

**어느 단언에서도 기대값을 느슨하게 바꾸지 않았다.** 전부 "측정 대상이 틀렸다"의 교정이며
수치(415 · 290 · 717 · 766)는 그대로다. 회귀는 **0건**이다.

## S6. baseline 재생성 + `v6-bubble` threshold 판단

재생성 (`--update-snapshots=all`, 지정 테스트만). 변화량은 재생성 전/후 PNG 를 픽셀 단위로
직접 비교해 측정했다.

| baseline | 변화 픽셀 | 비율 | 최대 픽셀 변화(RGB 합/765) | `threshold 0.2` 초과 픽셀 | 설정 임계값에서 |
|---|---|---|---|---|---|
| `s3-home` | 28,716 | 8.58% | 113 (14.8%) | **0** | 통과했었다 |
| `s3-home-deck` | 6,555 | 4.38% | 113 (14.8%) | **0** | 통과했었다 |
| `s3-home-deck-back` | 6,555 | 4.38% | 86 (11.2%) | **0** | 통과했었다 |
| `s3-home-deck-scrolled` | 14,940 | 9.98% | 442 (57.8%) | **1,751** | **유일하게 FAIL** |
| `s3-tabbar-top` | 22,036 | 25.49% | 58 (7.6%) | **0** | 통과했었다 |
| `s3-tabbar-bottom` | 26,567 | 30.73% | 117 (15.3%) | **0** | 통과했었다 |
| `s3-home-card-save-saved` | 300 | 2.03% | 7 (0.9%) | **0** | 통과했었다 |
| **`v6-bubble`** | **63,510** | **68.72%** | 81 (10.6%) | **0** | 통과했었다 |
| `s2-home-header` | **0** | 0% | 0 | 0 | 영향 없음 (예고대로) |

### `v6-bubble` — 왜 낡았는가

`SpeechBubble.css` 는 `V-10` 에서 `--bubble-shadow`(drop **1겹** + inset 2겹)로 바뀌었는데
baseline 은 `--shadow-glass-rest`(drop **3겹**) 시절 커밋 `1e6bf7b` 의 이미지였다.
**픽셀의 68.72% 가 다른데도 통과한다** — 최대 픽셀 변화가 10.6% 라 `threshold 0.2` 가 전부
"같은 픽셀" 로 세기 때문이다. 즉 **그림자 회귀에 대한 검출력이 0** 이다. 재생성했다.

### threshold 를 낮추는 게 맞는가 — **맞다. 단 사용자 승인이 필요하다 (적용하지 않았다)**

- 현재 `playwright.config.ts` 는 `maxDiffPixelRatio` 와 `maxDiffPixels`(영역 20 / 프레임 200)만
  정하고 **`threshold` 는 Playwright 기본 0.2 를 쓴다**. 두 knob 은 AND 가 아니라 **직렬**이다 —
  `threshold` 가 먼저 픽셀을 걸러내므로 **개수 상한이 아무리 빡빡해도 저대비 회귀는 안 걸린다**.
  위 표가 그 증거다: 최대 30% 픽셀이 바뀐 baseline 7종 중 **6종이 통과**했다.
- **렌더 노이즈 바닥을 실측했다**: 코드 변경 없이 같은 테스트를 2회 재생성해 비교한 결과
  `v6-bubble` · `s3-home-deck` · `s3-home` 모두 **변화 픽셀 0개 · 최대 변화 0** — 이 환경의
  렌더링은 비트 단위로 결정적이다(고정 viewport · `deviceScaleFactor 1` · `scale: 'css'` ·
  `animations: 'disabled'` · reduced motion · 폰트 번들). 즉 **지금 threshold 를 낮추는 비용이 0** 이다.
- **권고값**: `REGION_SNAPSHOT` 에만 `threshold: 0.02` 를 추가. 위 7종의 실제 그림자 변화
  (최소 7.6%)는 전부 잡고, 노이즈 수준인 `s3-home-card-save-saved`(0.9%)는 안 잡는 —
  **잘 분리된 절단면**이다. `FRAME_SNAPSHOT` 은 "폰트 힌팅·안티에일리어싱 누적 차이 흡수"가
  목적이고 상한 200 과 충돌하므로 **건드리지 않기를 권고**한다.
- **적용하지 않은 이유**: `threshold`/상한은 승인된 결정값이다 (`S1-D2-6` approvals §8 ·
  `D-12` stage-2-approvals §4). 또 baseline 은 플랫폼별(`{platform}`)이라 다른 macOS·CI
  러너에서는 노이즈 바닥이 0 이 아닐 수 있다 — **CI 이식성 영향이 있는 결정 변경**이므로
  development-agent 가 임의로 바꾸지 않았다. (측정 수치는 RGB 채널 합 근사이고 Playwright 의
  `threshold` 는 YIQ 거리다 — 값 확정 시 재측정이 필요하다.)

## S7. 후속 점검 — `Sheet.css` · `Dialog.css` (보고만, 수정 안 함)

| 대상 | 스크롤 박스 | 안쪽 drop shadow 요소 | 클립 여유 | 요구(실측 번짐) | 판정 |
|---|---|---|---|---|---|
| `packages/ui/src/dialog/Dialog.css` `.haru-dialog` | **자기 자신**이 스크롤 박스 (`overflow-y: auto`) | **있다 — 2개**: `.haru-button--glass` · `.haru-button--accent` (`.haru-button` 기본에 `--shadow-glass-rest`) | 좌 24 · 우 24 · 하 **24**(마지막 버튼) / 58(위 버튼) | 좌우 28~32 · 아래 **77** | **같은 결함 있음 (경증)** — 좌우 4~8px, 하단 53px 꼬리가 잘린다. 전면 절단은 아니다 |
| `packages/ui/src/sheet/Sheet.css` `.haru-sheet__content` | 내부 본문 블록 | **현재 0개** (gallery 는 `Text` 만 넣는다) | `__content` 는 자체 padding **0** → 폭을 꽉 채우는 자식의 여유 = **0** | 같음 | **잠재 결함** — Button·InfoRow·Surface 를 Sheet 본문에 넣으면 트랙과 **같은 전면 절단**이 난다 |

- Dialog 자신의 `box-shadow` 는 안 잘린다 (`overflow` 는 자손만 자른다).
- 둘 다 **현재 앱 화면에서는 dev gallery 에만 쓰인다** (`ComponentsPage.tsx`).
- `R-SHADOW-1` #2 를 적용하면 Dialog 는 `padding` 24 → 상 24 / 하 80 / 좌우 32 + `max-block-size`
  가산, Sheet 은 `__content` 에 같은 구조가 필요하다. **범위 밖이라 수정하지 않았다.**
- 측정에서 발견한 것: `--shadow-glass-rest` 는 **drop 3겹 + inset 2겹**이다. `computedStyle`
  로 그림자 요소를 찾을 때 문자열 전체에 `inset` 포함 여부로 걸러내면 **전부 놓친다** —
  반드시 **겹 단위**로 갈라야 한다 (audit §22.3 의 "3번째 겹 누락" 과 같은 종류의 실수다).

## S8. 검증 명령 결과 (8/8 통과 — `test:e2e` 단독 실행)

| # | 명령 | 결과 |
|---|---|---|
| 1 | `pnpm typecheck` | **PASS** |
| 2 | `pnpm lint` | **PASS** (eslint 0) |
| 3 | `pnpm test` | **PASS** — 109 files / **1319 tests** |
| 4 | `pnpm lint:boundaries` | **PASS** — 위반 0 (541 modules / 1840 deps) |
| 5 | `pnpm build` | **PASS** |
| 6 | `pnpm format:check` | **PASS** |
| 7 | `pnpm assert:no-mocks` | **PASS** — sentinel 0건 |
| 8 | `pnpm test:e2e` (**단독**) | **PASS** — **181 passed / 0 failed** (4.1m) |

## S9. 범위 밖으로 둔 것

| 항목 | 사유 |
|---|---|
| 좌우 그림자 ≥600px 절단 | **수용 (`D-REQ-3`)**. `pad` 는 카드 폭·peek 공식의 입력값이라 키우면 트랙이 앱 컬럼 480 을 넘는다 |
| `SwipeDeck.css` `overflow` 신규 도입 | `QA-1-L1` 가드 |
| `Sheet` · `Dialog` inset | S7 보고만 — 별도 결정 사안 |
| `REGION_SNAPSHOT` threshold | S6 권고만 — 승인된 결정값 변경 |
| `--space-*` 스케일 확장 (80 추가) | 승인된 스케일 변경이므로 Tier 3 직접 선언으로 대체 |

## S10. 문서 정정 필요 (development-agent 가 결정 문서를 수정하지 않았다)

audit §22.12 `D-REQ-4` 가 지적한 대로, 승인 문구의 "inset 24" 는 **상 24 / 하 80** 으로 정정이
필요하다: `docs/decisions/stage-3-approvals.md` §6, `docs/design/stage-3-design-spec.md`
672 · 678 · 682 · 1074 · 1105 · 1120 · 1485 · 1571행.

---

# T. `REGION_SNAPSHOT` threshold 0.02 적용 (사용자 승인 2026-10-05)

§S6 권고가 승인되어 적용했다. **영역 baseline 만** — `FRAME_SNAPSHOT` 은 안티에일리어싱 흡수가
목적이고 상한 200 과 충돌하므로 그대로 둔다.

## T1. 적용

`playwright.config.ts` — `VISUAL_THRESHOLD_REGION = 0.02` 신설, `REGION_SNAPSHOT` 에 추가.
주석에 ① `threshold`/`maxDiffPixels` 가 AND 가 아니라 **직렬**이라는 사실 ② §S6 실측 근거
③ **CI 이식성 경고** ("노이즈 바닥은 이 환경에서 실측 0 이었다. 다른 macOS·CI 러너에서 0 이
아닐 수 있으므로, CI 에서 flake 가 나면 **값을 올리기 전에 노이즈 바닥을 먼저 실측한다**")
를 남겼다.

`REGION_SNAPSHOT` 사용처는 `e2e/visual.spec.ts` 뿐이다 (gallery `v1`~`v6` + `s2-*` + `s3-*`).
`responsive.spec.ts` · `a11y.spec.ts` 는 사용하지 않는다.

## T2. 적용 후 깨진 영역 baseline — **0건**

`pnpm test:e2e` 단독 실행 → **181 passed / 0 failed**. 낡은 baseline 이 드러나지 않았다.
`v6-bubble` 은 §S6 에서 이미 재생성했고, 나머지 영역 baseline(`v1`~`v5` · `s2-*`)은 생성 이후
해당 컴포넌트 CSS 가 바뀌지 않았다. **추가 재생성 0건.**

## T3. YIQ 기준에서 실제로 분리되는가 — **된다 (실측)**

§S6 측정은 RGB 채널 합 근사였다. Playwright 의 `threshold` 는 pixelmatch 의 **YIQ 거리**이고
`maxDelta = 35215 × threshold²` 이다 (0.02 → **14.1**, 0.2 → 1408.6). 실제 공식으로
다시 쟀다.

| 대상 | 성격 | 변화 픽셀 | **max YIQ delta** | `0.2` 에서 | **`0.02` 에서** |
|---|---|---|---|---|---|
| `s3-home-card-save-saved` | **노이즈** (backdrop-filter 재래스터화) | 2.03% | **3.46** | 0 px pass | **0 px pass** |
| 렌더 노이즈 바닥 (2회 재생성) | **노이즈** | 0% | **0** | 0 px pass | **0 px pass** |
| `s3-tabbar-top` | 실제 그림자 (**가장 약함**) | 25.49% | 188.0 | 0 px pass | **1,120 px FAIL** |
| `v6-bubble` (낡음) | 실제 그림자 | 68.72% | 368.4 | 0 px pass | **22,354 px FAIL** |
| `s3-home-deck-back` | 실제 그림자 | 4.38% | 400.4 | 0 px pass | **6,427 px FAIL** |

- 절단선 `maxDelta 14.1` 은 노이즈 **최대** 3.46 의 **4.1배 위**, 가장 약한 실제 그림자 변화
  188.0 의 **13배 아래**다. 노이즈 쪽은 "적게 세어진다"가 아니라 **한 픽셀도 세어지지 않는다**.
- `threshold 0.01`(maxDelta 3.5)로 더 조여도 노이즈는 여전히 **0 px** 이다 → `0.02` 는
  칼날 위가 아니라 **여유 있는 위치**다.
- 중간값들: `0.1` → `v6-bubble` 48 px(비율 게이트에 걸려 **통과** — 여전히 blind),
  `0.05` → 12,672 px FAIL. 즉 **`0.1` 로는 부족하고 `0.05`~`0.02` 구간이 유효**하다.

## T4. 검출력 회복 — 동일 회귀 주입 실험

`SpeechBubble.css` 를 `V-10` 이전 상태(`--shadow-glass-rest`, drop 3겹)로 **일시 되돌려** 같은
회귀를 재현하고 양쪽 임계값에서 돌렸다.

| 임계값 | Playwright 결과 |
|---|---|
| `0.2` (이전) | **1 passed** — 세어진 픽셀 0. 검출력이 **문자 그대로 0** 이었다 |
| **`0.02` (적용)** | **1 failed** — `21513 pixels (ratio 0.24) are different` |

실험 후 CSS(`box-shadow: var(--bubble-shadow)`)와 baseline 을 **원상 복구**했고
(`shadow-glass-rest` 잔존 0건, baseline md5 일치 확인) 전체 재검증을 다시 돌렸다.

## T5. 느슨하게 바꾼 기대값 — **0건**

임계값은 **조이는 방향**(0.2 → 0.02)으로만 움직였다. 상한(`maxDiffPixels` 20 / 비율 0.002)은
건드리지 않았다. `FRAME_SNAPSHOT` 은 사용자 결정대로 변경 없음. skip·`.only`·단언 삭제 없음.

## T6. 검증 명령 결과 (8/8 — `test:e2e` 단독)

| # | 명령 | 결과 |
|---|---|---|
| 1 | `pnpm typecheck` | **PASS** |
| 2 | `pnpm lint` | **PASS** |
| 3 | `pnpm test` | **PASS** — 109 files / **1319 tests** |
| 4 | `pnpm lint:boundaries` | **PASS** — 위반 0 |
| 5 | `pnpm build` | **PASS** |
| 6 | `pnpm format:check` | **PASS** |
| 7 | `pnpm assert:no-mocks` | **PASS** |
| 8 | `pnpm test:e2e` (**단독**) | **PASS** — **181 passed / 0 failed** (3.7m) |

---

# `X-1` — 하단 탭바 클릭이 전체 문서 리로드를 일으켰다 (2026-10-06)

## X1. 원인 (코드 실측)

`apps/web/src/shared/config/tabs.ts` 의 `TAB_ITEMS` 는 세 항목 모두에 `href` 를 준다
(§6.2 "링크 의미 유지"). 그래서 `BottomTabBar` 는 `<button>` 이 아니라 `<a>` 로 렌더된다.

그런데 `packages/ui/src/tab-bar/BottomTabBar.tsx` 의 클릭 핸들러가 `event` 를 받지 않아
`preventDefault()` 가 없었다.

```ts
const handleClick = () => { onSelect(item.key); };   // ← 수정 전
```

결과: `AppTabBar` 의 `navigate()`(SPA 이동)와 **브라우저 기본 이동이 동시에** 일어나
전체 문서 리로드 → 메모리에만 있는 Mock 세션 소멸 → Route Guard 가 `/auth/welcome` 으로
되돌림. 즉 **탭이 전혀 동작하지 않았다**.

`AppTabBar.tsx:5` 주석이 *"클릭은 SPA 이동으로 처리한다"* 로 설계 의도를 명시하고 있으므로
의도된 동작이 아니라 버그다.

## X2. 왜 e2e 가 필수인가 — 단위 테스트로는 못 잡는다

jsdom 은 `<a>` 의 기본 이동(문서 교체)을 **수행하지 않는다**. `fireEvent.click` 은
"Not implemented: navigation to another Document" 만 남기고 DOM 은 그대로다. 그래서 수정
전·후 단위 테스트 결과가 똑같다. 탭 이동 e2e 커버리지가 **0건**이었던 것이 이 결함이
통과한 직접 원인이다.

## X3. 수정 **전** FAIL 확인 (`R-SHADOW-1` #6 과 같은 절차)

`e2e/tabs.spec.ts` 를 **먼저** 작성해 돌렸다 — `4 failed`.

```
Running 4 tests using 1 worker
  ✘  1 … Home → Library 가 SPA 이동이고 Welcome 으로 튕기지 않는다 (12.6s)
  ✘  2 … Library → Home 도 SPA 이동이다 (역방향) (11.1s)
  ✘  3 … Home → Progress 도 SPA 이동이다 (탭 3개 전부) (12.3s)
  ✘  4 … 수식 키 클릭은 현재 탭을 이동시키지 않는다 (링크 의미 유지) (10.9s)

  1) Home → Library …
    Error: expect(page).toHaveURL(expected) failed
    Expected pattern: /\/library$/
    Received string:  "http://127.0.0.1:4319/auth/welcome"
```

받은 URL 이 `/auth/welcome` 이라는 것이 리로드 → 세션 소멸 → Guard 리다이렉트 경로를
그대로 보여 준다. 기대값을 현재 동작에 맞추지 않았다.

## X4. 수정

`BottomTabBar.tsx` 의 `<a>` 분기에만 `handleLinkClick` 을 둔다 (`<button>` 분기는 기본 이동이
없어 그대로다).

```ts
const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
  const browserHandlesIt =
    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  if (browserHandlesIt) return;

  event.preventDefault();
  onSelect(item.key);
};
```

| 클릭 | 동작 | 근거 |
|---|---|---|
| 왼쪽 클릭 · 키보드 Enter (`button 0`, 수식 키 없음) | `preventDefault()` + `onSelect` | 이동은 router 가 소유한다 |
| `metaKey` (macOS 새 탭) · `ctrlKey` (Win/Linux 새 탭) · `shiftKey` (새 창) · `altKey` | 기본 동작에 넘김, **`onSelect` 호출 안 함** | `href` 를 준 이유가 §6.2 링크 의미 유지다 |
| `button !== 0` (중클릭 = 새 탭) | 〃 | 〃 |

예외에서 `onSelect` 를 호출하지 않는 이유: 새 탭으로 열면서 **현재 탭까지 이동하면** 사용자가
보고 있던 화면이 사라진다.

`packages/ui` 는 여전히 router 를 import 하지 않는다 (AC-1-25) — `href` 는 앱이 주입하고
판단은 전부 DOM 이벤트 속성으로만 한다. `TabBarItem` 에 `target` · `download` · `rel` 은
**없다**. 나중에 추가하면 위 예외 판정에도 함께 넣어야 하며, 그 사실을 코드 주석에 남겼다.

## X5. 추가한 테스트

| 파일 | 내용 |
|---|---|
| `e2e/tabs.spec.ts` (신규) | Home → Library · Library → Home · Home → Progress · 수식 키 클릭 — 4건. 각 이동에서 **`resourceType === 'document'` 요청 0건**(`page.on('request')`)과 URL 유지(1초 후 재확인)를 본다 |
| `packages/ui/src/tab-bar/__tests__/BottomTabBar.test.tsx` | 평범한 왼쪽 클릭 → `defaultPrevented` + `onSelect` / 수식 키·중클릭 5종 → 기본 동작 유지 + `onSelect` 미호출 / `href` 없는 `<button>` 분기 유지 — 7건 추가 |

부정 단정(`not.toHaveURL`)은 조건이 맞는 순간 즉시 통과해 리다이렉트를 못 잡으므로,
`expectUrlStays()` 로 **1초 뒤 같은 URL 인지 다시 단정**한다.

`Home → Progress` 만 1024px 에서 돌린다 — 393px 에서는 dev 전용 Scenario Panel(fixed 우하단)이
가장 오른쪽 탭을 덮어 클릭이 패널에 먹힌다. 결함은 폭과 무관하며, 실제 마우스 클릭을
유지하려고 폭을 넓혔다 (테스트 주석에 근거를 남겼다).

## X6. 수정 후 PASS

```
  ✓  1 … Home → Library 가 SPA 이동이고 Welcome 으로 튕기지 않는다 (2.2s)
  ✓  2 … Library → Home 도 SPA 이동이다 (역방향) (1.9s)
  ✓  3 … Home → Progress 도 SPA 이동이다 (탭 3개 전부) (1.8s)
  ✓  4 … 수식 키 클릭은 현재 탭을 이동시키지 않는다 (링크 의미 유지) (1.9s)

  4 passed (9.3s)
```

## X7. 검증 명령 결과 (8/8 — `test:e2e` 단독)

| # | 명령 | 결과 |
|---|---|---|
| 1 | `pnpm typecheck` | **PASS** (exit 0) |
| 2 | `pnpm lint` | **PASS** (exit 0) |
| 3 | `pnpm test` | **PASS** — 109 files / **1326 tests** (이전 1319 + 7) |
| 4 | `pnpm lint:boundaries` | **PASS** — 541 modules / 1841 deps, 위반 0 |
| 5 | `pnpm build` | **PASS** (exit 0) |
| 6 | `pnpm format:check` | **PASS** |
| 7 | `pnpm assert:no-mocks` | **PASS** — sentinel 3종 0건 |
| 8 | `pnpm test:e2e` (**단독**) | **PASS** — **185 passed / 0 failed** (4.0m) (이전 181 + 4) |

## X8. 손대지 않은 것

Home 레이아웃 · 그림자 · 토큰 · Figma 관련 항목(Visual Gap 3차 "검수 가능"), `A-23` 헤더 칩
아이콘, `W-2` 버블 padding 43, `D-REQ-3` — **전부 변경 0건** (사용자 결정 대기 항목).
느슨하게 바꾼 기대값 · skip · `.only` 도 0건이며, 시각 baseline 재생성도 하지 않았다.

---

# Visual Gap 3차 결정 반영 (2026-10-06) — `A-23`-icon · `W-5` · `X-3`

근거: `docs/decisions/stage-3-approvals.md` **§13**. 3건만 손댔고, §13.4~§13.7 의 "현행 유지" 항목은
**변경 0건**이다.

## V1. `A-23`-icon — 헤더 칩 아이콘을 Figma 글리프로 교체 (§13.2)

| 항목 | 내용 |
|---|---|
| 증상 | `entities/home/WeekSummaryChip.tsx` 가 **Lucide `star`** 를 썼다. Figma `26:40` 안의 `50:161` 은 다른 글리프다 |
| 판정 | 그 변경을 승인한 결정 문구가 **0건** → 임의 변경. 최우선 규칙 1 위반 |
| 글리프 정체 | **Material Design `history`**(시계 + 반시계 화살표)를 24 → 13 으로 축소 (배율 0.541666). 검산 `13·3·9·12 × 0.5417` = `7.0417 / 1.625 / 4.875 / 6.5` 가 path 좌표와 일치 |
| Lucide 대체 불가 | lucide `history` 는 24×24 **stroke** 다. Figma 는 **채움** 단일 path → 재현 불가. `SaveStar` 와 같은 사유이므로 Stage 0 #21 과 충돌하지 않고 **HARU 전용**으로 넣는다 |
| 렌더 확인 | SVG 를 260×260 으로 렌더해 글리프가 `history` 임을 **눈으로 확인**했다 (추정 아님) |

추가·수정한 것:

| 파일 | 내용 |
|---|---|
| `packages/ui/src/icon/haru/session-history.svg` (신규) | `viewBox="0 0 13 13"` · 단일 채움 path · `fill="currentColor"` (Figma 원본 `#D0CCA1` 을 치환) |
| `packages/ui/src/icon/haru/SessionHistory.tsx` (신규) | 기존 3종과 같은 패턴. Lucide 로 못 바꾸는 이유와 노드 ID `50:161` 을 주석에 남겼다 |
| `packages/ui/src/icon/haru/index.ts` | `haru:session-history` 등록 (HARU 전용 **4종**) |
| `packages/ui/src/icon/registry.ts` | **Lucide `star` 제거** — 유일한 사용처가 이 칩이었다. 등록부 규칙 ①("쓰지 않는 글리프를 번들에 넣지 않는다")에 따라 import 까지 함께 뺐다 |
| `apps/web/src/entities/home/WeekSummaryChip.tsx` | `name="star"` → `name="haru:session-history"` |

**유지한 것**: 칩 문구 `2 this week` (PRD §8.4) · 아이콘 크기 `--home-chip-icon-size` 13px (`V-6`).

### 새 semantic 토큰 — `--color-icon-session-history`

| 항목 | 내용 |
|---|---|
| 값 | `var(--haru-palette-yellow)` = `#d0cca1` (Figma `50:161` fill 과 동일) |
| Tier 3 | `--home-chip-icon-color: var(--color-icon-session-history)` |
| 적용 | `apps/web/src/features/home-overview/home-overview.css` 의 `.haru-home-top-bar .haru-tag__icon { color: … }` |

**왜 `--color-icon-save-star` 를 재사용하지 않았나** — 값은 같지만 의미가 **`★ Save` 별 전용**이다.
의미가 다른 토큰을 공유하면 한쪽 색이 바뀔 때 다른 쪽이 조용히 끌려간다.
**왜 primitive 를 직접 보지 않았나** — Tier 3 → Primitive 직접 참조는 build-tokens 규칙 3-4 위반이라
semantic 신설이 규칙을 지키는 유일한 경로다 (`--color-prompt-tag-*` 와 같은 사유).

## V2. `W-5` — 캐릭터 버블 4줄 상한 (§13.3)

| 파일 | 내용 |
|---|---|
| `packages/design-tokens/src/component/index.css` | `--bubble-content-max-lines: 4` 신설 (근거를 주석에) |
| `packages/ui/src/bubble/SpeechBubble.css` | `.haru-bubble--clamp .haru-bubble__content` → `-webkit-box` + `line-clamp: var(--bubble-content-max-lines)`. `display` 가 바뀌어 죽는 `gap` 은 `margin-block-start` 로 되돌렸다 |
| `packages/ui/src/bubble/SpeechBubble.tsx` | `clampContent?: boolean` (**기본 꺼짐**) |
| `apps/web/src/entities/home/CharacterBubble.tsx` | `clampContent` 지정 |

- **고정 높이로 바꾸지 않았다** — 1~4줄은 그대로 가변이고 5줄째부터 말줄임이다.
- 기본값을 끈 이유: 상한 근거가 **Home 캐릭터 얼굴 실측**이라 다른 화면 버블에 적용할 근거가 없다.
- `R-SHADOW-1` 점검: 이 `overflow` 박스 **안에 그림자 요소가 없다**(버블 그림자·tail 은 바깥
  `.haru-bubble` 이 그린다) → shadow inset 불필요. 근거를 CSS 주석에 남겼다.
- 닫기(x) 버튼 여백은 **40 유지** — 건드리지 않았다 (`W-2`).

### Contract 요구 등록 — `P3-BIP-16`

| 위치 | 내용 |
|---|---|
| `docs/API_CONTRACTS.md` **§3.8** (신규) | `HomeSummary.characterLine` **약 120자 이내** = Backend 요구사항. Stage 8 Handoff 대상(`BACKEND_HANDOFF.md` · `ANALYSIS_PIPELINE_REQUIREMENTS.md`) 명시 |
| `docs/API_CONTRACTS.md` §4 Stage 3 행 | `GET …/home` 응답 설명에 §3.8 참조 추가 |
| `packages/contracts/src/home/summary.ts` | 주석으로만 기록. **`.max()` 를 걸지 않았다** |

**Zod `.max()` 를 쓰지 않은 이유** — `characterLine` 은 **응답** 필드다. 길이 제약을 걸면 Backend 가
121자를 보내는 순간 `HomeSummarySchema.parse` 가 던져 **Home 전체가 빈 화면**이 된다.
말줄임 degrade 보다 나쁜 실패다. `packages/contracts/src/__tests__/activity-card.test.ts` 에
**긴 문구도 parse 된다**는 테스트를 넣어 이 결정을 고정했다.

**추정과 실측의 구분** (문서에도 그대로 적었다):

| 값 | 성격 |
|---|---|
| 캐릭터 눈 상단 **y=183** | **실측** |
| 높이 `20n+42` → 4줄 173 / 5줄 193 | **실측 기반 계산** |
| **"1줄 ≈ 30자" → 120자** | ⚠ **추정** (design-agent 환산). Backend 는 하드 제한이 아니라 **생성 길이 가이드**로 쓴다 |

## V3. `X-3` — dev Scenario Panel 이 393px 에서 탭을 덮던 문제

### 수정 전 FAIL (원문)

```
    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Progress' })
        - locator resolved to <a href="/progress" class="haru-tab-bar__link haru-focus-ring">…</a>
      - attempting click action
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - <button type="button" aria-expanded="false" class="haru-dev-panel__toggle">scenario</button> from <div data-dev-sentinel="__HARU_DEV_SENTINEL__">…</div> subtree intercepts pointer events
        - retrying click action
        …
  1 failed
    [chromium] › e2e/tabs.spec.ts:104:3 › BottomTabBar 이동 (`X-1`) › Home → Progress 도 SPA 이동이다 (탭 3개 전부)
```

### 수정

`apps/web/src/dev/dev.css` — **탭바가 떠 있는 화면에서만** 패널을 바 위로 올린다.

```css
:root:has(.haru-app-shell__bar-bottom) .haru-dev-panel {
  inset-block-end: calc(
    var(--layout-tabbar-bottom-gap) + var(--layout-tabbar-height) +
      var(--layout-tabbar-center-overhang) + var(--space-3)
  );
}
```

= 16 + 70 + 35 + 12 = **133** → 393×852 에서 패널 하단 **719** < 중앙 버튼 상단 731 < 바 상단 766.
수치를 직접 쓰지 않았다 — 탭바 기하가 바뀌면 함께 움직인다.

**전역으로 올리지 않은 이유 (실행으로 확인)**: 처음엔 `.haru-dev-panel` 자체의 `inset-block-end` 를
바꿨더니 **시각 baseline 39종이 깨졌다**. 이 패널은 dev 전용인데도 baseline 에 함께 찍히며,
올라간 패널이 UI gallery **영역 클립**(`v1-button` · `v9-*` · `s2-textlink` …) 안으로 들어갔다.
탭을 가리는 문제를 고치면서 **Figma 대조 측정 영역을 오염**시키는 교환이라 범위를 좁혔다.

중간 단계에서 `:root:has(.haru-tab-bar)` 로 썼더니 **19종**이 깨졌다 — gallery 의 `v3-tab-bar`
데모가 `.haru-tab-bar` 를 본문에 그리기 때문이다. 겹침을 만드는 건 데모가 아니라 **화면 하단에
고정된 실제 바**이므로 선택자를 `.haru-app-shell__bar-bottom` 으로 바꿔 **7종**까지 줄였다.

| 선택자 | 깨지는 baseline |
|---|---|
| 전역 (`.haru-dev-panel`) | **39** |
| `:has(.haru-tab-bar)` | **19** |
| `:has(.haru-app-shell__bar-bottom)` ← 채택 | **7** |

**기능·시나리오 전환 동작은 변경 0건.** 위치만 바꿨다.

## V4. 추가·수정한 테스트

| 파일 | 내용 |
|---|---|
| `e2e/tabs.spec.ts` | 테스트 3 을 **393px 기본 viewport 로 되돌렸다**(1024px 우회 제거). + `X-3` 전용 케이스 신규 — 탭 3개 중심의 `elementFromPoint` 가 `.haru-tab-bar` 안이고 `.haru-dev-panel` 이 아님을 단정. 가려지면 `.click()` 은 60s timeout 으로만 죽어 원인이 안 남는다 |
| `e2e/home.spec.ts` | 버블 테스트에 **80 단어** 구간 추가 + 조건부였던 "눈을 가리지 않는다"를 **무조건 단정**으로 바꾸고 `visibleLines ≤ 4` 를 추가 |
| `packages/ui/src/bubble/__tests__/SpeechBubble.test.tsx` | `clampContent` 기본 꺼짐 / 켜도 기하·tail·hint 불변 — 2건 |
| `packages/ui/src/icon/__tests__/haru-icons.test.tsx` | `haru:session-history` 를 SVG 규격 검사 대상에 추가 (HARU 전용 4종) |
| `packages/contracts/src/__tests__/activity-card.test.ts` | `characterLine` 에 길이 제약이 **없음**을 고정 (`W-5`) |
| `packages/design-tokens/__tests__/token-tiers.test.ts` · `fonts.test.ts` | semantic color **72 → 73**, Tier 3 **130 → 132** |

## V5. 검증 명령 결과 (8/8 — `test:e2e` 단독)

| # | 명령 | 결과 |
|---|---|---|
| 1 | `pnpm typecheck` | **PASS** (exit 0) |
| 2 | `pnpm lint` | **PASS** (exit 0) |
| 3 | `pnpm test` | **PASS** — 109 files / **1333 tests** (이전 1326 + 7) |
| 4 | `pnpm lint:boundaries` | **PASS** — 542 modules / 1842 deps, 위반 0 |
| 5 | `pnpm build` | **PASS** (exit 0) |
| 6 | `pnpm format:check` | **PASS** |
| 7 | `pnpm assert:no-mocks` | **PASS** — sentinel 3종 0건 |
| 8 | `pnpm test:e2e` (**단독**) | **179 passed / 7 failed** (3.9m, 총 186 = 이전 185 + `X-3` 1건) — 실패 7건은 **전부 시각 baseline** 이며 아래 V6 참조. 기능 e2e 실패 0건 |

## V6. 깨진 시각 baseline 7종 — **재생성하지 않았다** (사용자 판단 대기)

| baseline | 원인 | 성격 |
|---|---|---|
| `s2-home-header` | **칩 아이콘 교체** (`A-23`-icon) | **의도된 변경** — Figma `50:161` 에 맞춘 결과 |
| `s3-home` | 칩 아이콘 교체 **+** dev 패널 이동 | 섞여 있다 |
| `s3-home-deck` | dev 패널 이동 | dev 전용 chrome |
| `s3-home-deck-back` | 〃 | 〃 |
| `s3-home-deck-scrolled` | 〃 | 〃 |
| `s3-home-card-save-saved` | 〃 | 〃 |
| `s3-tabbar` | 〃 | 〃 |

diff 를 눈으로 확인한 결과 **버블은 1픽셀도 바뀌지 않았다** — `W-5` 클램프는 현재 2줄 문구에
영향이 없다 (상한일 뿐이다).

⚠ **드러난 구조 문제**: dev 전용 Scenario Panel 이 **시각 baseline 에 찍히고 있다.**
그래서 dev 패널을 어디로 옮겨도 Home baseline 이 깨진다. 근본 해결은 위치 조정이 아니라
**시각 테스트에서 dev 패널을 숨기는 것**이지만, 그 역시 baseline 재생성을 요구하므로
**사용자 결정 전까지 하지 않았다.**

## V7. 손대지 않은 것 (§13 "현행 유지")

`W-2` 버블 닫기 여백 **40** · `A-3` 카드 간격 **6** · `W-1` 5번째 Prompt 어포던스 **미추가** ·
`D-REQ-3` ≥600 좌우 그림자 **미결 그대로** · Start Session CTA **`D-3` 비활성 유지** ·
그림자 inset(상 24 / 하 80) — **전부 변경 0건**. 시각 baseline **재생성 0건**,
테스트 skip·`.only`·기대값 완화 **0건**.

---

# W. 4차 — 사실관계 정정 + 시각 baseline 위생 (2026-10-06)

사용자 지시 2건. ① `A-23`-icon 판정 근거 정정 ② dev Scenario Panel 을 시각 baseline 에서 제외.
**Production 코드 동작 변경 0건** — 바꾼 것은 주석 2곳과 **e2e 테스트 레이어**뿐이다.

## W1. `A-23`-icon — 코드 주석의 사실관계 정정

Orchestrator 가 Figma `30:91` 을 SVG export 로 실측한 결과 **star 글리프가 실재**한다
(5각성 단일 채움 path, fill `#D0CCA1`, 13×13 — `50:161` 과 색·크기가 같다).
3차에서 `star` 를 **"승인 근거 0건인 임의 변경"** 으로 적은 서술은 **사실이 아니다**:
*결정 문구가 없었던 것*과 *Figma 근거가 없었던 것*은 다르다.

**결론(`haru:session-history` 채택)은 유지**하고 근거만 교체했다 (approvals §13.2 판정 근거 정정).

| # | 교체된 근거 |
|---|---|
| 1 | 통합 칩이 표시하는 것은 **이번 주 세션 수**(`AD-S3-9`) 로, 두 원본 칩의 내용(`115 Min` · `12-day streak`) **어느 쪽도 아니다** → 어느 아이콘도 내용상 정확히 맞지 않는다 |
| 2 | `star` 가 대표한 **streak 는 `D-6` 미채택**으로 contract 에서 `streakDays` 가 삭제됐다 — 기각된 쪽의 표식이다 |
| 3 | **`star` 는 성취·평점 언어다.** `rules/frontend.md` §8 이 진단·판정·비교 표현을 금지하고 **`D-7` 이 Figma 의 평점 기능을 같은 이유로 기각**했다 |
| 4 | `history`(시계 + 반시계 화살표)는 **지나간 활동**을 가리켜 "이번 주에 한 세션"과 의미가 맞는다 |

수정 파일: `apps/web/src/entities/home/WeekSummaryChip.tsx` · `packages/ui/src/icon/registry.ts` (주석만).
**`Lucide star` 등록 제거는 되돌리지 않았다** (사용처 0, 등록부 규칙 ①).

## W2. dev Scenario Panel 을 시각 스냅샷에서 제외

### 방식 — 테스트 레이어 1곳

`e2e/support/gallery.ts` 에 `hideDevPanel(page)` 을 추가했다. `page.addInitScript` 으로
`<style>.haru-dev-panel { visibility: hidden !important }</style>` 를 주입한다.
`e2e/visual.spec.ts` 는 파일 수준 `test.beforeEach` 로, `e2e/responsive.spec.ts` 는 baseline 을
남기는 단일 테스트에서만 호출한다.

**Production 동작을 바꾸지 않았다는 근거**

| 근거 | 증거 |
|---|---|
| Production 산출물에 패널이 애초에 없다 | `pnpm assert:no-mocks` — `haru-dev-` **0건** (4개 파일 검사) |
| dev 코드·CSS 변경 0건 | `apps/web/src/dev/**` 변경 파일 0 |
| 패널은 여전히 렌더·클릭된다 | `e2e/scenarios.spec.ts`(시나리오 전환) · `e2e/tabs.spec.ts`(`.haru-dev-panel` visible 단정) **전부 통과** |
| 영향 범위가 스냅샷 스펙에 한정된다 | 주입은 `hideDevPanel` 을 부른 page 에만 적용 |

`display: none` 이 아니라 **`visibility: hidden`** 을 쓴 이유: ① 요소를 트리에서 빼지 않아
`:has(.haru-app-shell__bar-bottom)` 등 선택자가 보는 구조가 그대로다 ② 패널은 `position: fixed`
라 레이아웃 기여가 0 이다 ③ 그림자까지 함께 사라진다 (`e2e/shadow.spec.ts` 프로브 선례).

### 왜 "선택자 좁히기"로는 끝나지 않았는가

Playwright 의 **element screenshot 은 그 요소의 bounding box 를 찍으므로 위에 떠 있는
`position: fixed` 패널이 함께 들어온다.** 3차의 39 → 19 → 7 축소는 **겹치는 영역만 줄인 것**이고,
패널이 baseline 에 들어간다는 사실 자체는 그대로였다. 실측: 패널을 가리자 **28종**의 baseline 이
바뀌었다 — 즉 7종이 아니라 **28종이 dev 전용 UI 를 담고 있었다**.

### 재생성한 baseline — 28종 (사유 1건씩)

재생성 전 모든 diff 를 픽셀 클러스터로 분해해 원인을 확인했다
(`PIL` 기반 연결성분 분석, 임계값 채널당 8).

**(a) dev 패널 제외만 — 25종.** diff 가 **패널 발자국 1개 클러스터**로만 설명된다
(패널 실측 94×66 + 그림자 번짐 ~28 → 관측 클러스터 전부 ≤ 120×105, 이미지 오른쪽 끝에 접함).

`frame-320` · `frame-393` · `frame-600` · `frame-320-text-200`(responsive) ·
`v1-button` · `v5-field` · `v9-text` · `v9-focus` · `v9-spinner-skeleton` · `v9-state-cards` ·
`v9-state-loading` · `s2-signup` · `s2-consent` · `s2-onboarding-intro` ·
`s2-onboarding-childinfo` · `s2-onboarding-childinfo-trial` · `s2-onboarding-childinfo-edit` ·
`s2-onboarding-saved` · `s2-deck-reading-together` · `s2-deck-books-q3` ·
`s2-deck-books-favorites` · `s2-deck-growing-together` · `s2-deck-capability` ·
`s3-tabbar-top` · `s3-tabbar-bottom`

**(b) 칩 아이콘 교체만 — 1종.** `s2-home-header` — 클러스터 1개(x200–216, y8–32, 59px)뿐이다.

**(c) 세 원인이 섞인 것 — 1종.** `s3-home` — 패널(x272–392 y768–856) + 칩 아이콘(x224–240 y16–40)
+ **버블 3픽셀**(아래 W3).

**(d) 과도기 프레임이 굳어 있던 것 — 1종.** `s2-vpc-failed` (아래 W4).

3차에 깨져 있던 7종 중 `s3-home-deck` · `s3-home-deck-back` · `s3-home-deck-scrolled` ·
`s3-home-card-save-saved` **4종은 재생성이 필요 없었다** — 그 baseline 들은 애초에 패널을 담고
있지 않았고, 3차에 깨진 이유가 **패널이 올라오며 클립 안으로 들어온 것**이었기 때문에
패널을 가리자 **원래 baseline 그대로 통과**했다.

### 재생성 후 확인 — 패널이 없다 (사용자 조건 ④)

`frame-393` · `s2-consent` · `s3-home` · `v9-text` · `v5-field` · `frame-320-text-200` 의
해당 영역을 전후 비교했다: `scenario` 칩이 사라졌고, **그 아래 가려져 있던 제품 UI
(`Progress` 탭 등)가 드러났다.**

## W3. ⚠ 버블은 **1픽셀도 안 바뀌지 않았다** — 3픽셀 바뀌었다 (3차 보고 정정)

3차 §V6 의 *"버블은 1픽셀도 바뀌지 않았다"* 는 **틀렸다.** `s3-home` 의 구 baseline ↔ 신 baseline
차이에서 칩·패널 영역을 제외하면 **정확히 3픽셀**이 남는다.

```
(x=54, y=92) Δ3   (x=54, y=93) Δ12   (x=54, y=94) Δ8
구 (238,242,241) → 신 (251,253,252)
```

- 위치: `.haru-bubble__content` 상자(x=55)의 **바로 왼쪽 1열**, 본문 **2번째 줄** 구간 →
  2줄째 첫 글리프의 **왼쪽 안티에일리어싱**이다. 글자·줄 수·버블 기하는 그대로다.
- **원인은 `W-5` 클램프다 (추정 아님 — 실측).** 런타임에서 `.haru-bubble--clamp` 클래스만
  제거하고 같은 영역을 다시 찍자 **같은 3픽셀이 같은 Δ(3/12/8)로 되돌아왔다.**
  `display: -webkit-box` 가 텍스트 래스터화를 바꾼 것이다.
- **임계값 아래다**: `s3-home` 은 `FRAME_SNAPSHOT`(threshold 기본 0.2 ≈ 채널당 53) 이라
  Δ12 는 애초에 세어지지도 않는다. 그래서 `s3-home` 은 이 3픽셀만으로는 깨지지 않았었다.
- `v6-bubble`(gallery) baseline 은 **재생성 대상이 아니었다** — 0픽셀 변화.
- 레이아웃·줄 수 영향 **0**. 2줄 문구가 3줄이 되거나 잘리지 않는다.

## W4. ⚠ `s2-vpc-failed` — baseline 에 **과도기 프레임이 굳어 있었다** (신규 발견)

패널 제외로 타이밍이 1프레임 밀리자 드러났다. **두 원인(칩·패널)으로 설명되지 않는 유일한 diff**
였고, 추적 결과 **구 baseline 쪽이 틀린 그림**이었다.

| 항목 | 내용 |
|---|---|
| 증상 | `Try again` CTA 가 구 baseline 에서는 카드 바로 아래(y≈465), 현재 렌더에서는 열 바닥(y=752). 59,325 px 차이 |
| 정답 | **y=752 가 최종 레이아웃**이다. `VpcStep` 의 CTA 래퍼가 `mt-auto` 라 열 바닥에 붙는다 |
| 실측 | `getBoundingClientRect().y` 를 패널 숨김/비숨김 각각 + 0 / 300 / 1800ms 시점에 측정 → **6회 모두 752** |
| 원인 | 이 테스트만 **`settle()` 을 부르지 않았다.** 가입 후 **클라이언트 이동**으로 들어오므로 `gotoApp` 의 settle 을 거치지 않는데, 이동 직후 곧바로 찍어 **셸이 높이를 받기 전 프레임**이 저장됐다 |
| 왜 지금까지 통과했나 | 같은 타이밍이 재현돼 과도기 프레임끼리 맞았기 때문이다. `hideDevPanel` 의 init script 가 한 프레임을 밀자 최종 레이아웃이 찍혀 불일치가 드러났다 |
| 수정 | `s2-vpc-failed` · `s2-consent` 두 테스트에 **`settle(page)` 추가** (테스트 레이어). `s2-consent` 는 settle 전후 diff 가 **7,450 px 로 동일** — 내용 변화 0, 패널뿐이다 |
| 재생성 | `s2-vpc-failed` baseline 을 **최종 레이아웃으로 교체**했다. 구 baseline 은 제품이 머무르지 않는 상태를 담고 있었다 |

⚠ **사용자 확인 요청**: 이 1종은 사용자가 승인한 두 원인(①칩 ②패널) 밖이다.
교체가 부적절하다고 판단되면 `git checkout` 으로 되돌릴 수 있다 (변경은 baseline 1개 + settle 2줄).

## W5. 검증 명령 결과 (8/8 — `test:e2e` 단독)

| # | 명령 | 결과 |
|---|---|---|
| 1 | `pnpm typecheck` | **PASS** (exit 0) |
| 2 | `pnpm lint` | **PASS** (exit 0) |
| 3 | `pnpm test` | **PASS** — 109 files / **1333 tests** (변화 0) |
| 4 | `pnpm lint:boundaries` | **PASS** — 542 modules / 1842 deps, 위반 0 |
| 5 | `pnpm build` | **PASS** (exit 0) |
| 6 | `pnpm format:check` | **PASS** |
| 7 | `pnpm assert:no-mocks` | **PASS** — sentinel 3종 **0건** (`haru-dev-` 포함) |
| 8 | `pnpm test:e2e` (**단독**) | **186 passed / 0 failed** (3.8m) |

테스트 skip·`.only`·기대값 완화 **0건**. Production 코드 변경 **0건**(주석 제외).
