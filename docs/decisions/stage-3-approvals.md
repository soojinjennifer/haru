# Stage 3 Approval Log

Stage 3 (Home · Activity Card · Library · Book Selection · Recommendation) 진행 중 사용자가 내린 결정.
Plan: `docs/plans/stage-3-plan.md` · 규칙: `.claude/rules/workflow.md` §3

## 1. Stage 3 착수 승인

**2026-09-28, user** — Stage 2 Verdict `PASS` 이후 Stage 3 착수를 승인했다.

## 2. ★ PRD ↔ Figma 우선순위 변경 (2026-09-29, user) — **전 Stage 적용**

> "피그마 디자인이 더 나중에 확정된거라, PRD 와 충돌되는게 있으면 피그마를 우선하는걸로 하되 **어느 부분인지 내 승인은 받아줘**"

**변경 전** (`CLAUDE.md`): PRD = Functional Source of Truth. 불일치는 보고하고 결정 대기.
**변경 후**: **Figma 가 더 나중에 확정된 산출물이므로 PRD 와 충돌하면 Figma 를 우선한다.** 단 **충돌 지점마다 사용자 승인을 받는다** — 자동 적용이 아니다.

운영 규칙:
1. Agent 는 PRD ↔ Figma 충돌을 발견하면 **Figma 안을 기본 제안**으로 올리되 **임의로 적용하지 않는다**
2. 충돌 지점·양쪽 내용·영향 범위(contract · 화면 · Backend 요구)를 명시해 **사용자 승인을 받는다**
3. 승인된 항목은 **PRD 수정 대상**으로 기록한다 (§5). `docs/source/HARU_PRD_v1.4.md` 는 OneDrive 원본의 사본이므로 **저장소에서 직접 고치지 않는다** (`CLAUDE.md` Repository & Environment)
4. Figma 가 명백한 탐색 변형·오타인 경우(예: "Emotion Day Day")는 이 규칙의 대상이 아니다 — 그 사실을 근거로 제시하고 판단을 받는다

`CLAUDE.md` Source of Truth 절에 반영했다.

## 3. Design 차단 결정 (2026-09-29, user)

| ID | 결정 | 비고 |
|---|---|---|
| **D-1** ★ | **`sticky` 를 정본으로 확정** | 구현이 이미 sticky 이고 문서화된 근거가 있다. 파생 규칙 동시 고정: ① 콘텐츠 하단 padding 에서 `--layout-tabbar-height` 를 빼고 `--layout-tabbar-center-overhang`(35) + `--layout-safe-bottom` 만 적용 ② Toast 하단 offset 은 기존 식 유지하되 **실측 검증**(AC-3-07) ③ `.haru-app-shell__bar-bottom` 의 `pt-3`(12) ↔ overhang 35 를 실측해 통일 ④ **Design Spec §2.2·§4.12·§5.2·§6.2 를 같은 패스에서 갱신** — 현재 §2.2 만 sticky 라 문서 내부 모순 |
| **D-4** ★ | **Figma 따름 — Prompt 를 선택 *전* 카드에 노출** | **권장안(PRD) 을 뒤집은 결정.** §2 원칙 적용. `ActivityCardOption` 에 `promptPreview` 를 **추가한다**. PRD FR-07·§7.4("책 선택 후 제시")와 충돌하므로 **PRD 수정 대상**(§5). Figma 변형별 Prompt 개수가 2·4·5 로 제각각인 점은 design-agent 가 개수를 확정해야 한다 |
| **D-5** ★ | **Figma 따름 — 덱 카드마다 다른 역량** | **권장안(PRD) 을 뒤집은 결정.** `options[].capability` 를 **추가한다**. PRD §7.4("오늘의 역량 배지" 하루 1개)·§8.3(날짜 단위 순환 스케줄)과 충돌 → **PRD 수정 대상**(§5). §8.3 순환 규칙과 추천 엔진 요구가 커지므로 Backend Integration Requirement 에 반영한다. **주의**: Figma `163:2648` 의 "Emotion Day Day" 는 오타(M-13)이므로 그대로 옮기지 않는다 |
| **D-6** ★ | **Home 집계는 "이번 주" 기준** | Figma 의 "12-day"(연속 일수)를 쓰지 않는다. **`/progress` 가 산출하는 것과 같은 "이번 주" 창**을 Home 에서도 쓴다 — PRD §7.4 보조 요소 "이번 주 세션 수"와 같은 기준이라 집계 규칙이 하나로 통일된다. 최초 사용자 지시("2 week")는 본인이 정정했다. 화면 표시 항목(세션 수 / 시간 / 둘 다)은 design-agent 가 §15.8-2 로 제안 |

## 4. C-13 — Figma 누락 화면 8건 처리 방식 (2026-09-29, user)

| 그룹 | ID | 화면 | 결정 |
|---|---|---|---|
| 1차 | `C13-14` | Home 본문 IA (카드 덱 배치) | **design-agent 명세** |
| 1차 | `C13-21` | Prompt 공개 화면 | **design-agent 명세** — D-4 가 Figma(선택 전 노출)로 정해져 **카드 안에 흡수될 수 있다**. design-agent 가 판단 |
| 1차 | `C13-15` | Reading Context 선택 시트 + 시간 picker | **design-agent 명세** |
| 2차 | `C13-17` | 보유 책 직접 등록 | **design-agent 명세** |
| 2차 | `C13-18` | 증정 신청 + 배송 상태 | **design-agent 명세** (D-15 배송지 범위 결정 후 착수) |
| 2차 | `C13-20` | 서재 빈 상태 | **design-agent 명세** |
| 3차 | `C13-16` | 덱 대체 카드 3종 (대화전용·재독·책 소진) | **design-agent 명세** |
| 3차 | `C13-19` | 알림 설정 + push 권한 사전 안내 | **design-agent 명세** |

**8건 전부 design-agent 명세.** 디자이너는 Stage 2-B(`C13-09`·`C13-10`)를 작업 중이다.

## 5. PRD 수정 대상 (사용자 조치 — OneDrive 원본)

§2 원칙에 따라 Figma 를 우선해 확정한 결과, **PRD 와 어긋나게 된 지점**이다. `docs/source/HARU_PRD_v1.4.md` 는 사본이므로 저장소에서 고치지 않는다 — **OneDrive 원본을 갱신한 뒤 사본을 교체**한다.

| # | PRD 위치 | 현재 PRD | 확정된 동작 | 근거 |
|---|---|---|---|---|
| 1 | **FR-07 · §7.4** | 대화 Prompt 를 **책 선택 후** 2~3개 제시 | **선택 전 카드에 노출** | `D-4` |
| 2 | **§7.4 · §8.3** | "오늘의 역량 배지" **하루 1개**, 날짜 단위 순환 스케줄 | **덱 카드마다 다른 역량** | `D-5` |
| 3 | **§7.4 보조 요소** | streak · 이번 주 세션 수 · 하이라이트 한 줄 | **Home 집계 창을 "이번 주"로 명시**(`/progress` 와 동일 기준). Figma 의 "12-day" 연속 일수는 채택하지 않음 | `D-6` |

2번은 §8.3 의 역량 순환 규칙 자체를 바꾸므로 **추천 엔진 요구사항**(Backend)에도 반영이 필요하다.

---

## 6. Design Spec 승인 항목 (2026-10-01, user)

design-agent 가 §2 규칙(Figma 우선 + 지점별 승인)에 따라 **임의 적용하지 않고** 올린 항목들.

| ID | 결정 | 비고 |
|---|---|---|
| **N-1** | **Figma 3섹션 승인** — `/library` = 캐러셀 2 + 목록 1 (`30:74`) | PRD FR-20 은 기능 4가지만 규정하고 화면 구성을 정하지 않았다 → **충돌이 아니라 공백 보충**. FR-20 의 4기능을 3섹션이 모두 담는다 |
| **N-2** | **보이는 영역 3개 + 스크롤 확장** | §6.1 참조 — **두 선택지 중간의 결정**이라 별도 규격이 필요하다 |
| **N-3** | **`" Day"` suffix 폐기** | 배지를 역량 라벨만으로 표시한다(`Emotion Regulation`). "오늘은 ~의 날"은 **하루 1개 전제**에서 나온 표현이라 `D-5`(카드마다 다른 역량)와 양립하지 않는다. Figma 세 인스턴스도 없음/있음/오타로 제각각 |
| **Carousel `overflow` 예외** | **승인 — 그림자 보호안** | `overflow-x: auto` 허용하되 `padding-block: 24` / `margin-block: -24` 로 **세로 그림자를 스크롤 박스 안에 넣어** 클리핑을 원천 차단한다. 가로 클리핑은 아이템이 실제로 화면 밖으로 나가는 트랙 끝에서만 발생하므로 의도된 동작이다. **`AppColumn` 안쪽 `overflow-*` 금지 규칙의 유일한 예외**이며, 이 보호 구조 없이는 승인이 아니다 |

### 6.1 N-2 — Prompt 노출 규격 (사용자 지시)

> "보이는 영역에서는 3개 정도로 하되, **스크롤해서 더 확장해서 보일 수 있는 구조**로 만들어줘"

design-agent 가 제안한 "최대 3개 고정"도, Figma 최대치(5개)도 아니다. **개수 상한과 표시 개수를 분리한다.**

| 구분 | 규격 |
|---|---|
| **contract** | `promptPreview` 의 길이를 **3으로 제한하지 않는다.** 서버가 더 많이 내려줄 수 있어야 하며, Frontend 가 잘라내지 않는다 |
| **카드 표시** | 접힌 상태에서 **3개 정도**가 보인다. 나머지는 **스크롤 또는 확장**으로 도달 |
| **구조 제약** | 확장 영역이 `AppColumn` 안쪽 `overflow-*` 금지 규칙과 충돌하지 않아야 한다. 충돌하면 Carousel 예외와 **같은 그림자 보호 구조**를 쓰거나, 높이 확장(accordion) 방식을 택한다 |
| **접근성** | 스크롤·확장으로만 도달하는 Prompt 도 **키보드로 도달 가능**해야 한다. 숨은 콘텐츠를 스크린리더에서 지우지 않는다 |

PRD FR-07·§8.2 의 "2~3개"는 **표시 개수**로는 유지되지만 **상한으로는 더 이상 성립하지 않는다** → §5 PRD 수정 대상에 추가.

### 6.2 PRD 수정 대상 추가 (§5 보강)

| # | PRD 위치 | 현재 PRD | 확정된 동작 | 근거 |
|---|---|---|---|---|
| 4 | **FR-07 · §8.2** | 대화 Prompt **2~3개** | **표시 3개 + 스크롤/확장으로 그 이상 도달 가능.** 개수 상한은 서버가 정한다 | `N-2` |

---

## 7. 구현 차단 결정 (2026-10-01, user)

| ID | 결정 | 비고 |
|---|---|---|
| **D-3** | **"Start Session" CTA 비활성 + 사유 안내** | 실제 세션 시작은 Stage 4. design-agent 보완 채택 — `disabled` 속성만 쓰면 스크린리더가 건너뛰어 사유를 읽지 못하므로 **`aria-disabled` + 포커스 가능**으로 한다 (동의 화면·온보딩 CTA 와 같은 패턴) |
| **D-2** | **`/progress` 탭은 "준비 중" 안내 화면** | 탭 3개 구조(#15·`25:87`)를 유지하면서 탭이 죽지 않게 한다. design-agent 조건 채택 — **안내에 수치를 전혀 넣지 않는다** ("3회 중 1회" 같은 표현은 달성률 언어, `rules/frontend.md` §8) |
| **D-7** | **FR-20·FR-22 의 4기능만** | 보유책 · 증정책 · 기록 · 책별 Prompt 보기. Figma 의 평점 · "Reading now" · "My Saved" 는 **구현하지 않고 허용 차이로 기록**한다. 평점은 저장 위치·집계 규칙이 없고 HARU 의 비판정 톤과도 거리가 있다 |
| **D-13** | **933px 에셋 유지 — ≥600px 1.77x 수용** | Figma `221:1147` 확인 결과 1056px 투명 원본이 어디에도 없다. 디자이너 재추출·표시 축소 대신 **현 에셋 유지 + 허용 차이 기록**으로 결정 (§7.1) |

### 7.1 D-13 — Home 캐릭터 해상도 (결정: C — 1.77x 수용)

design-agent 보고: Home 캐릭터 표시 폭이 최대 **528**(480 컬럼 + gutter bleed)이라 2x 면 **1056px** 이 필요한데, 저장소 `hello-heart-full.png` 는 614×830, OneDrive 원본은 941×1672 → **크롭 재추출해도 폭 941 이 한계로 115px 부족**.

사용자 지시: Figma **`221:1147`** 섹션(캐릭터 원본 모음, Stage 2 에서 `163:2529` 를 여기서 찾았다)에 쓸 수 있는 이미지가 있는지 확인할 것.

**확인 결과 (2026-10-01, design-agent — Figma 조회 + 비트맵 실측)**

`221:1147` 자식 6개의 image fill 원본을 모두 내려받아 실측했다.

| 노드 | 이름 | 노드 크기 | image fill 비트맵 |
|---|---|---|---|
| `163:2528` | asset/avatar-medallion | 204×245 | 200×200 |
| `163:2529` | Haru_Hello_Heart_t 1 | 1537×1830 | 941×1672 (불투명 — 체커보드가 그려진 스크린샷본) |
| `163:2530` | HARU_Hello_t 1 | 1597×1830 | 702×1248 |
| `163:2532` | **asset/home-character** | 517×788 | **294×373** (민트 배경 베이크) |
| `163:2536` | 안경 쓴 책벌레 민트 하루 1 | 1550×1830 | 941×1672 |
| `163:2543` | 안경 쓴 책벌레 민트 하루 2 | 1505×1830 | 941×1672 |

- **Figma 로는 해결되지 않는다.** Home `26:22` "HARU Character" 의 image fill 은 `163:2532` 와 **md5 동일 파일**(294×373, 민트 배경 베이크)이다. 즉 Figma 가 가진 Home 캐릭터 아트워크는 294×373 뿐이고, 현재 저장소 에셋(614×830 투명)보다 **열세**다.
- **실제 최대치는 933px.** 투명 원본은 `Haru_Hello_Heart_t.png`(941×1672)가 아니라 **`Haru_Hello_Heart_t 1.png` 933×1659** 이다 (941 쪽은 알파 전부 255 = 불투명 스크린샷). → **1056 대비 123px 부족, 최대 1.77x.** 기존 스펙의 "941 / 115px 부족" 은 이 값으로 정정한다.
- **부족은 ≥600px 브레이크포인트에서만 발생한다.** 393px 뷰포트(표시 폭 441)에서는 933/441 = **2.12x 로 이미 충족**이다. 480 컬럼(표시 폭 528)에서만 1.77x 로 떨어진다.
- 세로는 제약이 아니다 (캐릭터 높이 990 ≥ 필요치 988). **가로만 걸린다.**
- `HARU_Hello_t 1.svg`, `Haru_Hello_Heart_t 1.svg` 는 **벡터가 아니다** — `<path>` 0개, PNG 를 `<pattern>` 으로 감싼 래퍼라 해상도 이득 없음.
- `벤치마킹/Moodeboard/HARU_Hello_heart.png` 에 **1536×2752**(캐릭터 bbox ≈1044) 파일이 있으나 **다른 생성본**이다 — 눈이 더 작고 흰 하이라이트(스페큘러)가 없으며 입·볼터치·하트 형태·털 결이 다르고 배경 그라데이션이 베이크되어 있다. 드롭인 대체 불가이며 **권장하지 않는다**(캐릭터 인상이 바뀐다).

**결정 (2026-10-02, user): C — 933px 에셋을 그대로 쓰고 ≥600px 에서 1.77x 임을 수용한다.**

- 디자이너 재추출(A)·표시 폭 528→466 축소(B)를 모두 선택하지 않았다. 캐릭터 일관성과 Figma 일치를 유지하고 Stage 3 구현을 막지 않는 쪽이다.
- 구현 지시:
  1. Home 캐릭터 에셋은 **투명 원본 `Haru_Hello_Heart_t 1.png` (933×1659)** 에서 Home 크롭(aspect ≈ 0.79)으로 재추출한다. 941 쪽 파일(불투명 스크린샷본)과 Figma `163:2532`(294×373, 민트 베이크)는 **쓰지 않는다**.
  2. `벤치마킹/Moodeboard/HARU_Hello_heart.png` (1536×2752)는 **쓰지 않는다** — 다른 생성본이다.
  3. **허용 차이로 기록**: 표시 폭 528(≥600px 브레이크포인트)에서 픽셀 밀도 1.77x. 393px 뷰포트는 2.12x 로 충족. QA 는 이 항목을 `PASS (accepted: D-13)` 로 판정한다.
  4. Design Spec 의 "941px 한계 / 115px 부족" 표기를 **933px / 123px 부족 / 최대 1.77x** 로 정정한다.
- 후속 여지: 디자이너가 나중에 1056px 이상 투명 원본을 제공하면 **에셋 파일만 교체**하면 된다 (표시 규격·코드 변경 없음).

---

## 8. 잔여 구현 결정 D-8 ~ D-20 (2026-10-02, user)

| ID | 결정 | 비고 |
|---|---|---|
| **D-8** | **Figma 기준 반영 — Prompt 단계 표시를 구현한다** | 사용자 지시: "피그마를 기준으로 반영해줘. 이번 Stage가 아니면 다음 Stage에라도 반영하여 최종적으로 보이게 되어야 돼". → Plan 권장안(prop만 열어두기)과 design-agent 반대 의견을 **모두 기각**. §8.1 참조 |
| **D-9** | **경로별 분리** | Activity Card 경로 = `SelectActivityOptionRequest.readingContext` **필수**, 서재 경로 = `CreateSession.readingContext` **nullable 유지**. Stage 3 에서 실제 구현되는 것은 앞쪽뿐 |
| **D-10** | **서버 기준 신뢰** | 서버가 `caregiver_profiles.timezone` 으로 `card_date` 를 정한다. Frontend 는 응답의 `ActivityCard.date` 를 그대로 신뢰하고 클라이언트에서 "오늘"을 재판정하지 않는다. 기기 기준 오늘과 다르면 화면이 그 날짜를 밝힌다 (AC-3-11) |
| **D-11** | **수동 저장** | `shared/lib/activity-card-cache.ts` → `localStorage` 키 `haru.activity-card.v1` 에 `{ schemaVersion, childId, card }` 만. 읽기·쓰기 모두 `ActivityCardSchema` parse. **TanStack Query persist 플러그인 미도입** |
| **D-12** | **Stage 2 Design Spec 개정으로 처리** | design-agent §13.1 ⑥ 의견 채택. 구현은 Stage 3 에서 하지만 화면 명세 소유는 Stage 2 Spec 에 둔다 — **Stage 3 Design Spec 이 Stage 2 화면을 재명세하지 않는다** |
| **D-13** | **§7.1 참조** (캐릭터 해상도) + **표지는 표시 상한의 2배까지** | 표지 해상도 상한 = `--size-book-cover-*` 기준 **2x** 까지만 산출, 전면 상한(1440)은 캐릭터·일러스트에만. `BookCover` 는 **고정 aspect-ratio + `object-fit: cover`** (`QA-2-004` 재발 방지). fixture `coverUrl` 은 번들 에셋 경로를 쓰되 `BookCover` 는 임의 URL 도 받는다. `sharp` 설치는 D-19 로 승인 |
| **D-14** | **해당 화면의 컴포넌트가 나올 때 만든다** | 사용자 지시 원문. → Stage 3 은 **Stage 3 화면이 실제로 쓰는 것만** 추가한다: `SectionHeader`(`30:74`) · `Carousel`(`113:1993`) · `Toggle`(`17:113`) + `ListRow` media/meta 변형 (28 → 31). Home 덱은 **`SwipeDeck`(depth 3) 재사용** — 신규 덱 컴포넌트 금지. `StatTile`·`TextArea`·`StarRating`·`PromptCarousel`·`SegmentedTabs` 는 **그 화면이 나오는 Stage 에서** 만든다 (선행 구현 금지) |
| **D-15** | **배송지를 입력받지 않는다** | `CreateGiftRequestRequest = { bookId }` 만. 접수 후 안내 문구는 §8.2 참조. 배송지 수집·저장은 운영·법무 결정 후 별도 Stage·승인 |
| **D-16** | **Port + Web 구현 + Mock** | `shared/platform/pushPermission.ts` 에 `PushPermissionPort`(`getStatus`·`request`·`getToken`). Web 구현은 `Notification.permission` / `Notification.requestPermission()` 까지만 — **실제 구독(PushManager)·VAPID 키·provider SDK 사용 금지**, 토큰은 결정적 Mock 값. 선택 지점은 `app/providers` 한 곳. Native 는 Stage 4 |
| **D-17** | **시트는 만들고 route 를 입힌다** | 사용자 지시: "목업용으로 링크만 만들어 놓는다. 백엔드 개발시 삭제할 수 있게 한다" → 확인 질문 답변 **"시트는 만들고 route 를 입힌다"**. §8.3 참조 — Plan 권장안(route화 안 함)을 **기각** |
| **D-18** | **알림 설정 화면만 제외** | 사용자 지시 "피그마를 기준으로 하여 알림 기능은 구현하지 않는다" → 확인 질문 답변 **"설정 화면만 제외"**. §8.4 참조 |
| **D-19** | **신규 런타임 의존 0건, `sharp` 1건만 devDependency** | 캐러셀·덱은 CSS + Pointer Events(#9), 아이콘은 기존 `lucide-react` 1.47.0, 캐시는 `localStorage`(D-11), push 는 Web Notification API(D-16), 이미지는 `<picture>`. `sharp` 는 `pnpm assets:optimize` 전용 — **런타임 import 금지** |
| **D-20** | **Stage 3 추천 입력으로 쓰지 않는다** | 추천 근거는 질문지 Q1~Q5 의 cold-start state vector + `age_months`. `relationship`·`languageEnvironment`·`readingRoutine` 은 프로필 표시·알림 시간 기본값 참고용. 세 필드의 **선택지 목록 확정은 Stage 6** 으로 이월, 그때까지 현재 구현 값 유지 |

### 8.1 D-8 — Prompt 단계·페이지 태그 (Figma 기준 채택)

사용자 결정: **Figma 를 기준으로 반영하고, 최종적으로 화면에 보이게 한다.** (CLAUDE.md PRD↔Figma 우선순위 규칙의 적용 사례 — 승인 완료)

- Figma 근거: `PRE` / `POST` 단계 배지, `P.6` 형태의 페이지 참조.
- **Stage 3 구현 범위**
  1. contracts `Prompt` 에 **optional 필드 2개 추가**: `phase: 'pre' | 'post' | null`, `pageRef: string | null`. optional 로 두는 이유는 전환기에 값이 없는 Prompt 가 섞여도 화면이 깨지지 않게 하는 것이며, **화면에서 생성·가공하지 않고 응답 값만 표시**한다 (`rules/frontend.md` §8).
  2. `PromptPill` 은 값이 있을 때 배지를 렌더하고 없으면 렌더하지 않는다. `phaseTag` 를 **사용처 없는 dead prop 으로 두지 않는다** — design-agent 반대 의견은 "값을 안 쓰는 prop" 에 대한 것이었고, 이번 결정으로 실제 사용처가 생겼다.
  3. Mock fixture 가 `phase`·`pageRef` 를 **결정적으로** 채워 화면에서 실제로 보이게 한다.
- **Backend 요구사항 (`BACKEND_INTEGRATION_PENDING`, Stage 8 Handoff)**
  - `phase` 판정(읽기 전 / 읽은 후) 로직.
  - `pageRef` 는 **책별 페이지 단위 앵커 데이터**가 필요하다 — 큐레이션 20권의 페이지 메타가 없으면 생성할 수 없다. 콘텐츠 제작 범위로 기록한다.
- 라벨 문구는 copy 모듈에 두어 나중에 교체 가능하게 한다 (2026-09-26 사용자 원칙).

### 8.2 D-15 후속 — 증정 접수 안내 문구

design-agent §13.1 ③. 사용자 결정: **잠정 문구를 넣고 사용한다** (빈 슬롯으로 두지 않는다).

- 문구는 copy 모듈에만 둔다. 예: `Your request is in. We'll reach out with delivery details.`
- 수치·기한·배송 소요일을 넣지 않는다 (운영 확정 전 약속이 되어서는 안 된다).
- 운영 표현이 확정되면 **copy 모듈의 값만** 교체한다 — 화면 코드 변경 없음.

### 8.3 D-17 — 시트 route (Mock 전용, 제거 가능한 형태)

사용자 결정: **시트는 구현하고 route 를 입힌다. 단 Mock 데모용이며 Backend 개발 시 제거할 수 있어야 한다.**

- 대상: `LibraryShelfSheet`("See all") · `BookDetailSheet` · `ReadingContextSheet`.
- 구현 제약
  1. route 정의를 **한 파일에 모은다** (예: `app/router/mockPreviewRoutes.tsx`) — 삭제 지점이 한 곳이어야 한다는 사용자 요구를 구조로 보장한다.
  2. route 가 사라져도 시트가 **부모 화면의 상태로 계속 동작**해야 한다. 즉 시트의 열림 상태는 route 에 **의존하지 않고**, route 는 그 상태를 열어주는 **진입점**일 뿐이다. (route 를 유일한 열림 경로로 만들면 삭제 시 기능이 깨진다)
  3. 파일 상단에 제거 조건을 주석으로 명시하고, Stage 8 Handoff 에 **제거 대상**으로 등재한다.
  4. `BookDetailSheet` 뒤로 가기 = **`LibraryShelfSheet` 목록으로 복귀** (design-agent §13.1 ⑦, 사용자 결정). 들어온 경로와 나가는 경로를 일치시킨다.

### 8.4 D-18 — 알림: 설정 화면만 제외

사용자 결정: **Figma 에 없는 알림 설정 화면(시간·요일 입력)만 Stage 3 에서 구현하지 않는다.** D-16(push 권한 Port + Web + Mock)은 **그대로 유효**하다.

- Stage 3 **미구현**: `/settings/notifications` 의 카드 갱신 시간 · 리마인더 요일/시간 입력 UI (`C13-19` — Figma 누락).
- Stage 3 **구현 유지**: `PushPermissionPort` + Web 구현 + Mock 시나리오(`push-permission-denied` 등), 권한 사전 안내 UX. Reading Context 선택 시트는 그대로 구현한다 — **Stage 3 In Scope** (`AC-3-23`).
  - ⚠️ **근거 교정 (2026-10-03)**: 최초 기술의 "Figma 에 있으므로" 는 **부정확**하다. Figma 에는 **결과 chip `86:538` 만** 있고 선택 UI 와 시간 picker 는 `C13-15` 로 **누락 등록**되어 있다 (§4). 구현한다는 **결론은 변하지 않으며**, 근거는 "Figma 에 있음" 이 아니라 **`D-18` 의 제외 범위가 알림 설정 화면에 한정된다**는 것이다. `custom_time` picker 규격의 근거 분리는 §9.2 ⑩ 에서 처리했다.
- contracts `GET/PUT /v1/notification-preferences`, `POST /v1/push-devices`, `DELETE /v1/push-devices/:id` 는 **정의를 유지**한다 (Contract 는 화면보다 앞서 있어도 된다).
- 알림 설정 화면은 **디자이너에게 Figma 요청**하고, 도달 후의 Stage 로 이월한다. Stage 3 QA 에서 FR-08 의 설정 화면 부분은 **Out of Scope** 로 기록한다 (FAIL 아님).

### 8.5 design-agent §13.1 잔여 결정 (2026-10-02, user)

| # | 항목 | 결정 |
|---|---|---|
| ① | `HomeSummary` 캐릭터 버블 문구 | **contracts 에 `characterLine` 필드 추가.** 서버 값만 표시하며 화면에서 생성하지 않는다. 값이 없으면 버블 미렌더 |
| ③ | 증정 접수 안내 문구 | **잠정 문구 사용** — §8.2 |
| ④ | `StreakChip` → `WeekSummaryChip` | **개명 + `HomeSummary.streakDays` 삭제.** D-6(이번 주 기준)의 귀결이며, 연속 일수는 달성률 언어에 가깝다 (`rules/frontend.md` §8). `COMPONENT_MAP.md` §2 · Plan §7.1 갱신 필요 |
| ⑤ | `Toggle` 치수 3종 | **가값 P-20 으로 진행** — `--toggle-track-w/h`, `--toggle-knob-size` 에 `provisional` 주석. 디자이너 값이 오면 토큰 값만 교체 (2026-09-22 사용자 원칙) |
| ⑥ | Q5 표지 그리드 처리 경로 | **Stage 2 Design Spec 개정** — D-12 |
| ⑦ | `BookDetailSheet` 뒤로 가기 | **`LibraryShelfSheet` 목록으로 복귀** — §8.3 (4) |
| ⑧ | `conversation_only` 카드 일러스트 | **기존 캐릭터 에셋 전용, 가값 P-22.** 전용 에셋이 오면 파일만 교체 |
| ⑨ | Reading Context 6값 영문 라벨 | **design-agent 명세값으로 확정.** `API_CONTRACTS.md` §2.2 의 "design 확인" 표시를 해제한다. 문구는 copy 모듈에 모아 교체 가능하게 둔다 |

### 8.6 이 결정들이 만드는 문서 갱신 작업

구현 전에 처리한다. 괄호는 소유 Agent (`rules/workflow.md` §5).

1. `docs/plans/stage-3-plan.md` §16 — D-8 ~ D-20 결과 반영, `☐` → 승인 표시 (plan-agent)
2. `docs/design/stage-3-design-spec.md` — §13.1 ①③④⑤⑦⑧⑨ 반영, "941px / 115px 부족" → **933px / 123px 부족 / 1.77x** 정정, D-8 배지 명세 추가, D-18 알림 설정 화면 제외 (design-agent)
3. `docs/design/stage-2-design-spec.md` — Q5 표지 프리셋 그리드 명세 추가 (D-12) (design-agent)
4. `docs/API_CONTRACTS.md` — `Prompt.phase`·`pageRef`, `HomeSummary.characterLine`, `streakDays` 삭제, Reading Context 라벨 확정 (설계 변경이므로 plan-agent, 구현 확정분은 development-agent)
5. `docs/COMPONENT_MAP.md` §2 — `StreakChip` → `WeekSummaryChip`, 신규 3종 (design-agent)
6. `docs/design/stage-2-designer-request.md` — 알림 설정 화면(`C13-19`) 추가 요청 (design-agent)
7. `docs/workflow/WORKFLOW_STATE.md` §3 — D-13 캐릭터 1.77x 수용 · D-17 Mock route 제거 대상 · D-18 알림 설정 이월 · P-20 · P-22 등재 (Orchestrator)

---

## 9. 문서 갱신 중 발견된 모순 결정 (2026-10-03, user)

plan-agent·design-agent 가 §8.6 문서 갱신을 수행하며 **고치지 않고 올린 모순** 중 사용자 결정이 필요했던 2건.

| ID | 결정 | 비고 |
|---|---|---|
| **D-21** | **Prompt 개수 상한 해제 — contracts 가 거부하지 않는다** | `N-2` 승인문("개수 상한은 서버가 정한다 / Frontend 가 잘라내지 않는다")과 `AC-3-17`("2~3개 범위를 벗어난 응답은 parse 단계에서 **거부**")이 정면 충돌했다. **`N-2` 가 우선**한다. §9.1 참조 |
| **D-22** | **`ActivityCard.targetCapability` 삭제** | `D-5`(카드마다 다른 역량 = `options[].capability`)로 카드 단위 대표 역량의 사용처가 없어졌다. `N-3`(`" Day"` suffix 폐기)과 같은 귀결이다 |

### 9.1 D-21 — Prompt 개수 상한

**결정: 상한을 제거한다. `promptPreview` 와 `promptSet.questions` 모두 길이 상한을 두지 않는다.**

- 근거: `N-2`(§6.1)는 **표시 개수와 개수 상한을 분리**하는 결정이었고, §6.2-4 에서 `FR-07 · §8.2` 의 "2~3개"를 **PRD 수정 대상**으로 올렸다. 하드 제약을 남기면 승인한 결정이 contracts 레벨에서 무효화된다.
- 구현 지시
  1. contracts — `promptPreview`, `promptSet.questions` 에서 `.max(3)` 제거. **`.min(1)` 은 유지**(빈 세트는 화면이 성립하지 않는다). `.min(2)` 로 올리지 않는다 — 서버가 1개만 내려주는 상황을 parse 실패로 만들 근거가 없다.
  2. **Frontend 는 `slice(0, 3)` 하지 않는다.** 접힌 높이가 보이는 개수를 결정하며(`--prompt-preview-collapsed-count: 3` = **cutoff, cap 아님**), 나머지는 확장으로 도달한다.
  3. `AC-3-17` **재작성** — "개수 범위를 벗어난 응답 거부" → **"4개 이상이 와도 parse 가 통과하고, 접힌 상태에서 3개가 보이며 나머지가 확장·키보드로 도달 가능하다"**. Mock 시나리오에 **4개 이상 케이스를 포함**한다 (상한이 실제로 없음을 증명하는 테스트).
  4. `P3-BIP-03`(Prompt 라이브러리)의 "제시 2~3개" 는 **Backend 의 생성 정책**으로 남긴다 — Frontend 검증 조건이 아니다.
- PRD 수정 대상(§5)에 이미 등재되어 있다 (§6.2-4).

### 9.2 design-agent 가 올린 추가 미결 — 처리 방침

| # | 항목 | 처리 |
|---|---|---|
| ⑩ | Reading Context `custom_time` picker 수치 규격 | **`D-18` 에서 분리한다.** 이 시트는 Stage 3 In Scope(`AC-3-23`)이므로 규격 근거를 알림 설정 화면(이월)에 묶어둘 수 없다. design-agent `RECOMMENDED`(30분 단위, 네이티브 `input[type=time]` 금지)를 **Stage 3 규격으로 확정**한다 — 근거는 `D-18` 이 아니라 **이 항목**이다 |
| ⑪ | `phase` 와 `pageRef` 동시 표시 | design-agent `RECOMMENDED`(둘 다 렌더) + 허용 차이 `AD-S3-24` 로 **진행**한다. Figma 에 동시 예시가 없는 것은 **공백이지 충돌이 아니다**(`N-1` 과 같은 성격). 서버가 하나만 보내도록 강제하지 않는다 — contract 는 독립 optional 을 유지한다 |
| ⑫ | Prompt 배지 흰 라벨 1.72:1 가값 ID | **`P-23` 신설**로 둔다. `P-02`(보조 텍스트)에 흡수하지 않는다 — 대상과 교체 조건이 다르다. 2026-09-22 사용자 원칙(Figma 우선 + 가값 표시)을 그대로 적용한다 |
| — | `Toggle` 사용처가 push on/off 1곳으로 축소 | **3종 유지.** `D-14` 원칙("해당 화면의 컴포넌트가 나올 때 만든다")은 **사용처가 1곳이어도 충족**된다. 사용처 0건이 되면 그때 제외한다 |
| — | `Chip` 다중 선택이 Stage 3 에 미마운트 | `P-02` 의 "미선택 Chip 경계" 증빙이 Stage 3 에서 사라진다. **가값 재제시 때 온보딩(Stage 2) 화면을 증빙으로 쓴다** — Chip 자체는 Stage 2 에서 이미 검증되었다 |
| — | PRD `§8.2` 에 `phase`·`pageRef` 개념 부재 | **§5 PRD 수정 대상에 추가** (아래 §9.3) |

### 9.3 PRD 수정 대상 추가 (§5 · §6.2 보강)

| # | PRD 위치 | 현재 PRD | 확정된 동작 | 근거 |
|---|---|---|---|---|
| 5 | **FR-07 · §8.2** | Prompt 에 단계·페이지 개념 없음 | Prompt 에 **`phase`(읽기 전/후) 와 `pageRef`(페이지 참조)** 가 있고 화면에 배지로 표시된다. `pageRef` 는 **책별 페이지 앵커 데이터**(콘텐츠 제작 범위)를 전제한다 | `D-8` · `P3-BIP-13` · `P3-BIP-14` |
| 6 | **FR-07 · §8.2** | Prompt **2~3개** (상한으로 읽힘) | **개수 상한 없음.** 표시 3개 + 확장 도달. 생성 정책(2~3개)은 Backend 소관 | `D-21` (§6.2-4 보강) |

---

## 10. 2차 갱신 중 발견된 항목 (2026-10-03)

### 10.1 D-23 — `activity_cards.target_capability` **DB 열**

`D-22` 는 **contract 필드**만 삭제했고 `docs/DATA_MODEL.md` 의 **DB 열 요구**는 그대로 남아 있었다.

**결정 (user): Backend 개발자 판단으로 남긴다.**

- `docs/DATA_MODEL.md` 와 Stage 8 `DATA_REQUIREMENTS.md` 에는 **요구사항만** 적는다 — *"역량 순환 스케줄(`P3-BIP-02`)이 날짜 단위 중복을 회피해야 한다"*. 열 설계·열 이름은 **지정하지 않는다**.
- Frontend 와 contract 에는 **노출되지 않는다** (`D-22` 로 삭제 확정). 서버 내부 구현 사항이다.
- 이 항목은 `BACKEND_INTEGRATION_PENDING` 이 아니다 — Frontend 가 기다리는 것이 없다. **Handoff 의 설계 재량 항목**으로 기록한다.

### 10.2 가값(provisional) 번호 대장이 3개 문서로 분산되어 있다

| 구간 | 정본 소유 | 비고 |
|---|---|---|
| `P-01` ~ `P-16` | `docs/decisions/stage-0-approvals.md` §4 (+ `DESIGN_TOKEN_MAP.md` §4.1) | |
| `P-17` ~ `P-19` | `docs/design/stage-2-design-spec.md` §6.4 | |
| `P-20` ~ `P-23` | `docs/design/stage-3-design-spec.md` §6.4 | |

- **중복·빈 번호 없음** — `P-18`~`P-23` 6개가 각각 다른 대상 1건에 배정되어 있다.
- 단 `stage-3-plan.md` 가 "신규 가값은 `P-18…`" 로 적고 있다. `P-18`~`P-23` 이 모두 소비되었으므로 **다음 신규 번호는 `P-24`** 다.
- `P-18`(`--list-row-height-min` 56) · `P-19`(`CharacterMedallion ring-offset`) · `P-21`(`--carousel-shadow-inset`) 은 **재제시 목록에 없다**. `P-19` 는 Stage 3 사용처 0건이다.
- **조치**: Stage 1 가값 승인 때와 같은 방식으로, **Stage 3 구현 완료 후** Orchestrator 가 미재제시 3건(`P-18`·`P-19`·`P-21`)을 포함해 항목별로 사용자에게 올린다 (Stage 0 #10-4 절차). 번호 통합·재배정은 **하지 않는다** — 이미 문서·토큰·테스트에서 참조되고 있다.
