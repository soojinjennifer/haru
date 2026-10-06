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
3. 승인된 항목은 **PRD 수정 대상**으로 기록한다 (§5). PRD 사본은 OneDrive 원본의 복사본이므로 **저장소에서 단독으로 고치지 않는다** (`CLAUDE.md` Repository & Environment). → **절차는 `D-24`(§11.1) 로 변경됨** — 원본과 사본을 **같은 패스에서 함께** 수정한다. 2026-10-03 적용 완료, 현재 파일은 `docs/source/HARU_PRD_v1.5.md`
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

§2 원칙에 따라 Figma 를 우선해 확정한 결과, **PRD 와 어긋나게 된 지점**이다. ~~PRD 사본은 저장소에서 고치지 않는다 — OneDrive 원본을 갱신한 뒤 사본을 교체한다.~~ → **`D-24`(§11.1) 로 변경** — 원본·사본 동시 수정. **이 표의 1~3번은 2026-10-03 `v1.5` 에 적용 완료**됐다.

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
| **Carousel `overflow` 예외** | **승인 — 그림자 보호안** | `overflow-x: auto` 허용하되 `padding-block` / 음수 `margin-block` 으로 **세로 그림자를 스크롤 박스 안에 넣어** 클리핑을 원천 차단한다. ⚠️ **값 정정 — 상 24 / 하 80 (`D-REQ-4` 정정), §12.15 참조**: 최초 승인한 대칭 `24` 는 `--shadow-glass-rest` 3겹 중 2번째만 세고 3번째(`0 28px 56px`)를 빠뜨린 계산이었다. 실측 번짐은 **아래 77 · 위 22 · 좌우 28~32** 다. `border-box` 이므로 **`block-size` 에 inset 을 가산**해야 한다는 조건이 함께 붙는다. 가로 클리핑은 아이템이 실제로 화면 밖으로 나가는 트랙 끝에서만 발생하므로 의도된 동작이다. **`AppColumn` 안쪽 `overflow-*` 금지 규칙의 유일한 예외**이며, 이 보호 구조 없이는 승인이 아니다 |

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
| 7 | **§7.2 Step 1** | 언어 환경이 **필수** 입력 (`D-C` 2026-09-26) | **선택 사항 + 기본값 영어.** 미선택으로 전진·제출 가능하며, 제출 경계에서만 빈 값을 `['english']` 로 채운다. 사용자의 **명시적 해제는 보존**된다 | `§11.22` (2026-10-04) · `QA-2R-012` |

> ⚠️ **번호 정정**: §11.22 가 이 항목을 "16번" 으로 적었으나 이 표의 실제 다음 번호는 **7번**이다 (`QA-2R-012`). §7~§14 의 plan-agent 산출 8건은 `stage-2-onboarding-rework-plan.md` §15 가 소유하며 번호 체계가 다르다. **PRD 적용 시에는 이 표와 그 §15 를 합쳐 세어야 한다.**

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

---

## 11. 온보딩 설문 재구성 관련 결정 (2026-10-03, user)

> ⚠️ 이 절의 내용은 **Stage 2 화면의 재설계**다. Stage 3 범위가 아니다. Stage 2 Plan·Design Spec 과 `docs/plans/stage-2-onboarding-rework-plan.md` 가 실제 소유 문서이며, 여기에는 **사용자 결정만** 기록한다.

### 11.1 D-24 — PRD 수정 적용 대상

**결정: OneDrive 원본과 저장소 사본을 함께 수정한다.**

- CLAUDE.md 의 "사본은 수정하지 않는다" 규칙은 **두 본이 벌어지는 것을 막으려는 것**이므로, 둘을 같은 패스에서 갱신하면 규칙의 의도와 충돌하지 않는다. 규칙 문구 자체는 이 결정에 맞춰 갱신이 필요하다.
- **백업 완료 (2026-10-03)**: `$HARU_ONEDRIVE/old/HARU_PRD_v1.4.backup-20261003-1612.md`. OneDrive 에는 git 이 없으므로 **수정 전 백업이 필수 절차**다.
- 수정 직전 확인: 원본과 저장소 사본이 **바이트 단위로 동일**(650행)했다. 수정 후에도 `diff` 로 동일함을 확인한다.
- `HARU_PRD_v1.4.docx` 는 **건드리지 않는다** — `.md` 가 작업본이고 `.docx` 는 원래 포맷 보관본이다. 둘이 벌어진다는 사실을 Handoff 에 기록한다.
- **버전**: 수정 결과물은 `v1.5` 로 올린다. `v1.4` 백업이 남아 있으므로 추적이 가능하다.
- 누적된 PRD 수정 대상 **6건**(§5 · §6.2-4 · §9.3 5·6)과 이번 재구성분을 **한 번에** 적용한다.

### 11.2 D-25 — 결함 3건의 수정 시점

**결정: 설문 4단계 재구성과 함께 구현한다.**

- 근거: 재구성이 같은 카드·라디오·CTA 를 전부 다시 건드리므로, 따로 고치면 같은 파일을 두 번 수정하고 Playwright baseline 도 두 번 재생성해야 한다.
- 대상 (design-agent 실측, `stage-2-design-spec.md` §16 개정 6):

| ID | 결함 | 핵심 사실 |
|---|---|---|
| `S2-FIX-1` | CTA 하단 여백 | **사용자·Orchestrator 전제가 틀렸다** — `/auth/sign-up` 도 웹에서 **0px** 다. 보인 44 는 iOS `env(safe-area-inset-bottom)` 34pt. 따라서 온보딩 전용이 아니라 **`StackLayout` 공통 13 route** 문제다. 44 는 Figma `179:1746`·`179:1814`·`179:1844` 3프레임 실측 일치이며 홈 인디케이터를 **포함**하는 값 → `max(safe-bottom, 44)` 이지 **덧셈이 아니다** |
| `S2-FIX-2` | 2줄 선택지 상하 여백 | `RadioGroup.css` 에 **`padding-block` 선언 자체가 없다** — `min-block-size:44` + `align-items:center` 에만 의존해 2줄이면 상하 2px, 3줄이면 0. 추가로 Step 5 비채점 행이 구분선을 **행 박스 안쪽 padding** 으로 그려 상 17 / 하 0 비대칭. `--list-row-height-min`(P-18)은 **무관**(`ListRow` 전용) |
| `S2-FIX-3` | 덱 카드 겹침 | **오프셋 토큰은 Figma 와 이미 정확히 일치**하고 뒤 카드 2장도 정상 렌더된다. 진짜 원인은 **흰 면 4겹** — `SwipeDeck.css` 가 앞 카드에도 표면을 그리는데 `SurveyQuestionCard` 가 `<Surface>` 로 또 그린다. 이는 **승인된 §4.2·§5.3 위반**이며 수정은 그 명세로의 **복귀**다 |

- **회귀 가드 (필수)**: `S2-FIX-3` 은 **`SwipeDeck.tsx` 를 수정하지 않는다** — CSS 선택자 2개 이동 + dev gallery 래핑뿐이다 (`QA-2-001` pointer capture 회귀 방지). `SwipeDeck.css` 에 `overflow` 를 **신규 도입하지 않는다** (`QA-1-L1` 그림자 절단 방지).
- **신규 토큰 1건**: `--layout-cta-bottom-gap: calc(var(--spacing) * 11)` = 44, Tier-2. 기존 스케일에 44 가 없고(`--space-8`=32 · `--space-10`=40), `--size-touch-min`(44)은 터치 타깃 의미라 전용하지 않는다. `S2-FIX-2`·`S2-FIX-3` 은 **신규 토큰 0건**.
- baseline 재생성 **8건** + 확인 후 판단 2건 → 재구성 구현 후 `pnpm test:e2e:update` **1회**.

### 11.3 design-agent 가 올린 승인 필요 항목

| # | 항목 | 상태 |
|---|---|---|
| 1 | `--layout-cta-bottom-gap`(44) 신설 | ✅ **승인** (`D-25`) — Figma 3프레임 실측 일치 |
| 2 | 44 를 `StackLayout` **13 route 전부**에 적용 (CTA 없는 `/`·`/settings` 포함) | ✅ **승인** — 공통 레이아웃 규칙이므로 route 별로 다르게 두지 않는다 |
| 3 | 2줄 이상 라디오 원 = **박스 중앙** | ✅ **승인** — Figma 에 2줄 사례가 없어 확인 불가(`RECOMMENDED`). 사용자 지시 원문이 "텍스트가 중앙으로 오고 여백이 위아래 동일"이므로 중앙 정렬이 지시와 일치한다 |
| 4 | `SwipeDeck` 앞 카드 표면 소유권을 `renderItem` 으로 이전 | ✅ **승인** — 신규 결정이 아니라 승인된 §4.2·§5.3 으로의 복귀 |
| 5 | `--border-hairline`(1px) 신설 | ❌ **보류** — design-agent 스스로 "선택"으로 표시했고 지금 필요가 없다. 필요해지면 그때 올린다 |

### 11.4 설문 재구성 결정 R-01 ~ R-13 (2026-10-03, user)

Plan: `docs/plans/stage-2-onboarding-rework-plan.md`

| ID | 결정 | 비고 |
|---|---|---|
| **R-01** ★ | **받되 전송은 나중에** | Create account 화면에서 아이 이름·생년월·성별을 **입력받되 서버로 보내지 않는다.** 값은 기존 `OnboardingDraftStore` 에 **로컬 저장**했다가 동의 기록 후 `submit` 1회로 전송한다. §11.5 참조 |
| **R-02** | **전체 통산 `n / 15`** | 지시 원문 "상단 제목만 순차적으로 바뀌면서" = 카드 흐름이 하나라는 뜻. 단계 내 표기면 `Growing together` 가 `1 / 1` 이 된다. 단계 경계는 **제목 전환 + ProgressBar** 로 표현. 숫자는 copy 에 쓰지 않고 **파생값**(`questions.length + survey.items.length`) |
| **R-04** | **Q5 로 대체하되 표지는 대체 표현** | 질문지 v1.1 이 PRD v1.4 보다 나중이므로 PRD §7.2 Step 3(책 검색 + 집에 있는 책 목록)을 Q5 표지 그리드로 대체한다. **단 실제 책 표지 이미지를 쓰지 않는다** — 제목 카드 등 저작권 안전한 표현. 저작권이 해결되면 **이미지만 교체**한다 (화면·contract 변경 없음) |
| **R-07** | **미로그인일 때만 표시** | `248:1159` 상단 Trial 안내("Create an account when you are ready")는 **Trial 진입 시에만** 렌더. 가입 후 도달 경로에서는 감춘다. Figma 내부 모순이므로 "Figma 우선" 규칙 대상이 아니다 |
| **R-08** | **인라인 편집 허용** | 가입에서 받아온 이름·생년월을 `About your child` 에서 **탭하면 고칠 수 있게** 한다. 완전 읽기 전용이면 생년월 오입력 시 3~9세 범위를 벗어나 **제출 데드락**이 생긴다 |
| **R-10** | **가입에서 받고 표시만** | 성별은 **Create account** 에서 받고 `About your child` 에서는 표시한다 (이름·생년월과 같은 취급). 전송 시점은 `R-01` 을 따른다 — 즉 가입 요청에 싣지 않는다 |
| **R-13** | **`Capability` 로 간소화** | 화면 노출 제목을 `Capability-items` → **`Capability`**. Baseline 문서의 "No HARU vocabulary" 원칙과 `rules/frontend.md` §8(진단·판정 표현 금지)을 함께 만족시키는 선. 문구는 **copy 모듈** 소유 |

### 11.5 R-01 — 구현 제약 (Privacy Critical)

**"화면에서 입력받는 것"과 "서버로 전송하는 것"을 분리한다.** 사용자 지시(가입에서 받아 설문에서 표시)는 전자만으로 충족되며, 후자를 하면 규칙을 깬다.

- **`SignUpWithEmailInput` 의 `.strict()` 를 유지한다** (`AC-2-05`). 아이 필드를 추가하지 않는다 — 추가 키는 parse 단계에서 실패해야 한다.
- **`AC-2-13` 을 유지하되 검사 구간을 확대한다**: 동의 성공 **이전 전 구간**(가입 요청 포함)의 Mock 요청 로그에 아동 필드가 **0건**임을 증명한다.
- 로컬 저장은 **기존 Trial 메커니즘의 재사용**이다 — 신규 저장소를 만들지 않는다. 따라서 **contract 변경 0건**이고 `C-2`·`C-12` 흐름도 바뀌지 않는다.
- **로그아웃·데이터 삭제 시 이 로컬 값도 지운다** (`rules/architecture.md` §9).
- 콘솔·에러 로그에 아이 이름이 남지 않아야 한다.

**`C-5` 갱신 필요**: `stage-0-approvals.md` 의 `C-5`("가입 화면은 보호자 정보만, Figma `179:1724` 수정은 디자이너 요청")가 이 결정으로 **부분 변경**된다 — 화면에서는 받고 전송만 미룬다. `C-5` 의 Privacy 의도는 그대로 지켜지므로 폐기가 아니라 **정밀화**다. 디자이너 요청은 철회한다.

### 11.6 PRD 수정 — 적용 절차 (`D-24` 확정)

plan-agent 가 **8건(7~14번)** 을 산출했고 기존 6건과 합쳐 **총 14건**이다. 적용 시:

1. 백업이 이미 있다 — `$HARU_ONEDRIVE/old/HARU_PRD_v1.4.backup-20261003-1612.md`. 추가 수정 전 재백업한다.
2. **OneDrive 원본 → 저장소 사본 순서**로 반영하고, 끝나면 `diff` 로 **바이트 단위 동일**을 확인한다.
3. 버전을 **v1.5** 로 올린다. 파일명·`CLAUDE.md` Source of Truth 표·참조 문서를 함께 갱신한다.
4. `HARU_PRD_v1.4.docx` 는 **건드리지 않는다**. `.md` 와 벌어진다는 사실을 Stage 8 Handoff 에 기록한다.
5. 14건 중 **5건이 `R-01`·`R-03`·`R-04` 승인에 종속**되었는데 전부 승인되었으므로 **일괄 적용 가능**하다.
6. **`CLAUDE.md` 의 "사본은 수정하지 않는다" 규칙을 `D-24` 에 맞게 갱신**한다 (둘을 같은 패스에서 갱신하는 방식으로).

### 11.7 Design Spec 결정 (2026-10-03, user)

Design Spec: `docs/design/stage-2-onboarding-rework-design-spec.md`

| ID | 결정 | 비고 |
|---|---|---|
| **S2R-OPEN-4** ★ | **카드 단계 하단 CTA 제거** | 사용자 지시: "피그마 화면의 `1d survey card` 화면에는 CTA 버튼이 없는데 이를 확인해서 만들어줘". **확인 완료** — `179:1770` 트리에 Button 노드가 **0건**이고, `179:1748` 이 "Swipe each card away to move on" 으로 전진 수단을 명시한다. §11.8 참조 |
| **C-13 ①** | **복수 선택 = Checkbox 컴포넌트를 만들고 사후 승인** | design-agent 명세로 진행. 신규 시각 언어가 아니라 Figma 승인 요소 2개의 조합이다 — 행 기하 `179:1788`(43 / 7 / 좌15) + Checkbox `179:1742`(22, inner 13). **구현 후 디자이너 사후 확인 요청**, 차이는 CSS 로 흡수 |
| **C-13 ②** | **§11.9 로 재정의** | 사용자가 문항 구성 자체를 바꿨다 — 아래 참조 |
| **C-13 ③** | **design-agent 명세** | `missing-prefill` = `About your child` 의 모드 분기, `instrument-v2` = 카드 수가 전부 파생값이라 **레이아웃 변화 0**. 디자이너에게 요청할 "그림"이 없다 (Stage 0 #22 명세 우선) |
| **S2R-OPEN-3** | **단일 선택만 자동 전진** | 단일 선택 카드는 선택 후 짧은 지연을 두고 다음 카드로. 복수 선택은 수동. `prefers-reduced-motion` 을 존중하고, **자동 전진 후에도 이전 카드로 돌아갈 수 있어야 한다**(오선택 수정 경로) |

### 11.8 S2R-OPEN-4 — 세로 예산 (재구성의 전제)

design-agent 실측 (393×852, Playwright 검산):

| 조건 | 결과 |
|---|---|
| **CTA 없음** | **15장 전부 들어감** — 최장 629 ≤ 예산 678, 여유 49 |
| CTA 유지 (현행 ≈90px) | 예산 588 → **10장 초과** |

- 예산 = 852 − 98(카드 top) − 44(`--layout-cta-bottom-gap`) − 32(뒤 카드 peek) = **678**
- 최장 3장: ER2 · AG1 · IM1 = **629** (문항 5줄)
- 마지막 카드에만 제출 CTA 를 붙이면 669 ≤ 678 로 그것도 들어간다
- 320px 에서는 넘친다 → 페이지 스크롤. 320 은 원래 reflow 전제 폭(`AC-2-59`)이라 **FAIL 사유 아님**
- **부수 회수 22px**: 해제 IconButton 이 현행 구현에서 counter 와 같은 flex row 에 있다. Figma `179:1804` 는 패딩 안쪽 겹침 = absolute. 바로잡으면 **Figma 와 일치하면서 22px 회수**
- 예산이 빠듯한 원인은 Figma 에 없는 **비채점 6번째 옵션**(`C13-08`, 2줄 64 + 구분선 33 = 97)이다. 승인된 명세이므로 **제거하지 않고 기록만** 한다

### 11.9 Books and interests 문항 구성 (2026-10-03, user)

사용자 지시: *"Books your child loves 의 답변으로 책 제목을 입력받는 질문은 남겨 두고, Books at home(add a book at home) 질문은 삭제한다"* → 확인 질문 답변 **"남긴다 — 카드 3장"**.

**세 항목은 출처가 다르다** (사용자 질문에 대한 확인 결과):

| 항목 | 출처 | 데이터 | 처리 |
|---|---|---|---|
| Books your child loves (검색 + 제목 입력, 최대 5권) | PRD §7.2 Step 3 | `favoriteBooks` | ✅ **유지** |
| Books at home (제목 입력, 최대 50권) | PRD §7.2 Step 3 | `homeBooks` | ❌ **삭제** |
| **Q5 "Which of these does your child already know well?"** (8권 체크) | **질문지 v1.1** | `child.owned_books` | ✅ **신규 추가** |

- `Books at home` 삭제는 `R-04`(Q5 가 PRD Step 3 을 대체)와 **같은 방향**이다. Q5 가 그 자리를 대신한다.
- **Q5 를 자유 입력으로 대체할 수 없는 이유**: Q5 의 엔진 용도는 *"Removes selected books from the recommendation candidate pool"* 인데, 제목 자유 입력은 오타·판본·번역서 때문에 **book ID 매칭이 불가능**하다. 질문지도 *"the engine can only act on owned-book data for books it knows about"* 로 인벤토리 8권 한정을 명시한다.
- **결과: Books and interests = 카드 3장** (Q3 · Q5 · favorites) → **전체 16장**.
- ⚠️ **세로 예산 재검산 필요**: favorites 카드는 **검색 입력 + 결과 목록 + 선택 목록**이 한 카드에 들어가야 한다. design-agent 가 "검색+목록은 카드 1장에 안 들어감" 을 Q5 그리드 검산에서 지적했으므로, **이 카드가 678 예산에 들어가는지 별도 검산**해야 한다. 안 들어가면 그 사실을 보고하고 결정을 받는다 — 임의로 문항을 쪼개지 않는다.
- `FAVORITE_BOOKS_MAX`(5) 유지. `HOME_BOOKS_MAX`·`homeBooks` 는 contracts 에서 제거.

### 11.10 design-agent 가 올린 나머지 항목 — 처리

| ID | 항목 | 처리 |
|---|---|---|
| `S2R-OPEN-1` | `179:1748` 본문의 숫자·기간 절이 사실과 다름 | ✅ **A 채택** — 숫자·기간 절 제거, 남은 Figma 문장만 사용 (문구 창작 0건). `R-02` 와 같은 원칙 |
| `S2R-OPEN-2` | intro 2연속 | ✅ **Figma 그대로 유지** — 제목·본문·InfoRow 가 다르고 사이에 폼이 끼어 경계 신호가 된다 |
| `S2R-OPEN-5` | 하위 보조 라인 `Reading together · 2 of 2` | ✅ **두지 않는다** — 통산 `n/16` 과 중복이고 "제목만 바뀐다" 지시와 어긋난다 |
| `S2R-OPEN-6` | 문항→옵션 간격 Figma 45 ↔ 현행 24 | ✅ **24 유지** + 허용 차이 등록. 45 면 전 카드 +21 로 예산이 다시 빠듯해진다 |
| `S2R-OPEN-7` | `179:1724` 한 줄 동의 체크 | **법무·기획 보류.** design-agent 기록대로 "이 체크는 **아동 데이터 수집 동의가 아니다**"만 확정한다. `L-02`(법무 문서)와 함께 다룬다 |
| copy 분리 | 현행 `onboardingCopy.intro` 가 사실 `243:1147` 문구 | ✅ **`intro.profile` / `intro.survey` 2벌로 분리** |
| Figma 내부 슬립 3건 | `248:1159` 이름 · `179:1775` 프레임 밖 · `About 1 minutes` 오타 | ✅ **허용 차이 `AD-S2R-*` 등록**. PRD↔Figma 충돌이 아니므로 §2 "Figma 우선" 규칙 대상이 아니다 |

**신규 토큰 2건 승인**: `--book-cover-sm-width: 34px` · `--book-cover-sm-height: 48px` (Tier-3, Figma `163:2101` 실측). Q5 셀과 Stage 3 `ListRow` media 가 **같이 쓰므로** 한 곳에서 정의한다.

`--layout-cta-bottom-gap`(44) 의 Figma 근거가 **5프레임**으로 늘었다 (`248:1159` Next bottom 1088 → frame 1132 = 44).

### 11.11 C-13 ② Q5 — **그리드 없이 제목 목록** (2026-10-03, user)

**결정: Q5 를 2열 표지 그리드가 아니라 제목 체크박스 목록으로 만든다.**

- 질문지 v1.1 의 *"Display the following covers in a 2-column grid with title underneath each"* 는 **채택하지 않는다.** `R-04`(표지 이미지 미사용)로 표지 자리가 비는데, 빈 썸네일 8개를 2열로 늘어놓을 이유가 없다.
- 결과적으로 **C-13 "창작" 문제가 사라진다** — Q2·Q3 와 동일한 복수 선택 카드 형식이므로 `C-13 ①`(Checkbox 컴포넌트) 하나로 Q2·Q3·Q5 가 전부 해결된다. 디자이너 대기 0건.
- 세로도 가장 짧다 (design-agent 검산: 2열 그리드 524 vs 목록은 그보다 작다).
- 캡션 *"Tap any books you've read together more than a few times."* 는 질문지 원문이므로 유지한다 (문구 창작 금지).
- 8권 제목은 **Mock fixture 소유** — 화면·copy 모듈에 하드코딩하지 않는다. 이미 `apps/web/src/mocks/fixtures/books.ts` 에 8권이 전부 있다.
- **후속 여지**: 저작권이 해결되고 디자이너가 표지 그리드를 원하면, 선택지 행에 media 슬롯을 더하는 변경이다. contract(`owned_books`)는 바뀌지 않는다.
- ⚠️ **신규 토큰 2건의 근거가 바뀐다**: `--book-cover-sm-width/height`(34×48)를 Q5 가 더 이상 쓰지 않는다. **Stage 3 `ListRow` media 슬롯 전용**으로 남으므로, **Stage 2 에서는 추가하지 않고 Stage 3 에서 추가**한다 (선행 구현 금지).

### 11.12 확정된 설문 구성 (최종)

| # | 단계 | 화면 제목 | 카드 | 문항 |
|---|---|---|---|---|
| 1 | Reading together | (그대로) | 2 | Q1 · Q4 |
| 2 | Books and interests | (그대로) | **3** | Q3 · **Q5(제목 목록)** · favorites(검색+입력) |
| 3 | Growing together | (그대로) | 1 | Q2 |
| 4 | **Capability** | `Capability-items` 아님 (`R-13`) | 10 | Baseline |
| | | | **16** | |

카운터 = **전체 통산 `n / 16`** (`R-02`). 숫자는 copy 에 쓰지 않고 파생값.

### 11.13 favorites 카드 — 검색 제거 (2026-10-03, user)

사용자 질문: *"favorites 는 검색에 대한 내용이 없는데 검색 결과가 왜 필요하지?"* + Figma `30:74` 재확인 지시.

**확인 결과: Figma 어디에도 책 검색이 없다.**

- `30:74` (Library) = `Our curated shelf` · `Favorites` · `Finished together` 세 섹션의 **캐러셀 + 목록**. **검색 입력도 검색 아이콘도 0건**.
- `179:1770` (설문 카드)에도 없다.
- 검색은 **PRD §7.2 Step 3**("책 검색 5권 + 집 책 리스트")만을 근거로 현재 구현에 들어간 것이다. 질문 문장(`Books your child loves`)은 검색을 요구하지 않는다.

**결정: 검색을 제거하고 제목 직접 입력만 남긴다 (최대 5권).**

- 검색이 하던 유일한 일은 고른 책을 인벤토리 `bookId` 로 매칭하는 것인데, **그 역할은 Q5 가 8권 체크로 이미 정확히 수행**한다(`owned_books`).
- 질문지 v1.1 이 정의한 추천 state vector(`comfort_zone` · `axis_weights` · `interest_weights` · `channel` · `owned_books`)에 **favorites 는 들어 있지 않다.** favorites 는 질문지가 아니라 PRD 에서 온 항목이라 엔진 용도가 정의되어 있지 않다 → 자유 입력으로 충분하다.
- PRD ↔ Figma **충돌**이며 §2 규칙대로 **Figma 우선 + 사용자 승인** 절차를 거쳤다. **PRD 수정 대상에 추가**한다.

**이 결정이 없앤 것**

| | 상태 |
|---|---|
| 검색 Sheet (`C-13` 신규 1건) | ✅ **소멸** — 디자이너 대기 0건 유지 |
| favorites 카드 넘침 (검색결과 8 + 선택 5 = 1110) | ✅ **소멸** — 가변 블록이 1개로 줄어 상한을 걸 수 있다 |
| baseline `s2-books-search-sheet` | ✅ **불필요** → 신규 11 → **10건** |
| `copy.search*` · `emptyTitle` · `addTyped` · `tryAgain`(검색) | ✅ **제거 대상** |
| 책 검색 API 호출 (온보딩 경로) | ✅ **제거** — Mock 시나리오도 함께 |

**남는 것**: 제목 입력 + 선택 목록(최대 5) + `Up to 5.` 힌트. `FAVORITE_BOOKS_MAX`(5) 유지. `FavoriteBookSchema` 의 `bookId` 는 **선택 필드로 유지**한다 — Stage 3 서재에서 인벤토리 책을 favorites 로 넣는 경로가 생길 수 있고, contract 를 좁히면 그때 다시 넓혀야 한다.

### 11.14 S2R-OPEN-8 — favorites 문항 문구

**결정: 기존 섹션 라벨 `Books your child loves` 를 그대로 문장으로 쓴다.**

- **문구 창작 0건**이다. design-agent 측정도 이 기준(1줄)으로 끝났다.
- 질문지 문항이 아니므로 `ONBOARDING_CHOICE_QUESTIONS` 가 아니라 **별도 카드 타입**으로 다룬다. 문구는 copy 모듈 소유 — 나중에 기획이 문장을 다시 쓰면 **copy 값만 교체**된다 (2026-09-26 사용자 원칙).

### 11.15 접근성 — 상한 초과 처리가 문항마다 다르다

design-agent 가 보고한 불일치. **의도된 차이로 확정**한다.

| 문항 | 상한 | 초과 시 |
|---|---|---|
| Q2 · Q3 | 2 | **가장 오래된 선택을 교체**. 나머지를 `disabled` 로 만들지 않는다 — 비활성 이유를 알 수 없기 때문 |
| favorites | 5 | **거절** + `You can pick up to 5.` — 사용자가 직접 타이핑한 5권을 임의로 빼면 안 된다 |

- 이유: Q2·Q3 는 **제시된 선택지 중 고르는 것**이라 교체가 자연스럽고, favorites 는 **사용자가 만들어 넣은 항목**이라 임의 삭제가 데이터 손실로 느껴진다.
- **copy 가 이 차이를 설명해야 한다.** QA 가 불일치로 볼 수 있으므로 `qa.md` 판정 시 이 절을 근거로 `PASS` 처리한다.

### 11.16 Stage 2 재구성 — 최종 구성 (`§11.12` 대체)

| # | 단계 | 카드 | 문항 | 최장 높이 |
|---|---|---|---|---|
| 1 | Reading together | 2 | Q1(483) · Q4(450) | 483 |
| 2 | Books and interests | 3 | Q3(583) · **Q5 목록(638)** · **favorites(검색 없음)** | 638 |
| 3 | Growing together | 1 | Q2(478) | 478 |
| 4 | Capability | 10 | Baseline (최장 ER2·AG1·IM1 = 630) | 630 |
| | | **16** | | 예산 **678** |

- 최장 **Q5 638**, 여유 40. 마지막 카드 IM3 580 + 제출 CTA 90 = **670 ≤ 678**.
- 320px 에서 3장 초과(Q5 728 · Q3 688 · AG1 680) — reflow 전제 폭(`AC-2-59`)이라 **FAIL 사유 아님**.
- favorites 카드는 검색 제거로 **582 → 더 작아진다**. design-agent 가 재측정한다.
- **신규 토큰 0건** · **가값 0건** · **디자이너 대기 0건**.

### 11.17 S2R-OPEN-9 — favorites 입력 필드 라벨

**결정: 보이는 라벨을 두지 않는다** (design-agent 권장 A).

- 쓸 수 있는 **승인된 문자열이 없다** — `searchLabel`("Search a book")은 제거 대상이고 `homeLabel`("Add a book at home")은 삭제되는 블록의 문구다. 새 문자열을 만드는 것은 **문구 창작 금지** 원칙에 걸린다.
- 접근성은 `aria-labelledby` = 카드 문항(`Books your child loves`), `aria-describedby` = helper(`Up to 5.`) 로 충족한다. **`placeholder` 를 라벨 대신 쓰지 않는다** (WCAG 3.3.2).
- **레이아웃 영향 0** (design-agent 실측: 라벨 유무 높이 차이 0 — 행 높이는 `Add` 액션 44 가 정한다). 따라서 기획이 나중에 문구를 정하면 **라벨만 추가**하면 되고 카드 높이도 안 바뀐다.
- 상한 도달 시 입력 필드를 **`disabled` 로 두되 숨기지 않는다** — 사라지면 "입력이 없어졌다"로 읽힌다.

### 11.18 Stage 2 재구성 — 승인 체크포인트 대상

| 문서 | 상태 |
|---|---|
| `docs/plans/stage-2-onboarding-rework-plan.md` | `DRAFT` → 승인 대기 |
| `docs/design/stage-2-onboarding-rework-design-spec.md` (개정 2) | `DRAFT` → 승인 대기 |

**미결 0건** — `C-13` 잔여 0 · 디자이너 대기 0 · 신규 토큰 0 · 가값 0.

PRD 수정 대상 누적: 기존 6 + plan-agent 8 + 검색 제거 1 = **15건**. `D-24` 절차(OneDrive 원본 + 사본 동시, v1.5)로 적용한다.

### 11.19 구현 중 발견 항목 (2026-10-03)

development-agent 가 고치지 않고 올린 9건 중 결정이 필요했던 것.

| ID | 결정 |
|---|---|
| **7-2 동의 직후 착지** | **중도 복귀면 이어서, 아니면 프로필 안내.** 처음 도달하면 `/onboarding/start`(프로필 안내), 저장된 draft 가 있으면 그 지점으로 보낸다. Guard 분기가 하나 늘지만 두 요구(새 흐름 · resume 경로 `Pick up where you left off`)를 모두 만족한다 |

**결정 불필요 — 그대로 수용**

| ID | 내용 | 처리 |
|---|---|---|
| 7-1 | **Trial 15장 / 인증+동의 16장** — Q5 선택지가 책 카탈로그인데 Trial 은 서버 요청 0건(`AC-2-27`·`C-12`)이라 카탈로그를 받을 수 없다 | **정상 동작.** 카드 수가 파생값이라 화면이 자동 추종한다. `owned-books-empty`(16→15)와 같은 메커니즘. **QA 는 `AC-2R-08` 판정 시 분모가 구간별로 다름을 전제**해야 한다 |
| 7-3 | `copy.books.homeAdd` 가 §6.2 제거 대상 ↔ §8.3 유지로 모순 | 키 제거 + 문자열 `'Add'` 를 중립 키 `addAction` 으로 이전. 타당 |
| 7-4 | 생년월 표시 `March. 2023`(Figma) ↔ `2021-04`(현행) | **허용 차이로 기록.** 월 이름 12종은 신규 문구라 만들지 않은 것이 맞다 (문구 창작 금지) |
| 7-5 | `S2R-OPEN-7` 한 줄 동의 체크 미구현 | **맞다.** 법무 보류 항목은 구현하지 않는다 |
| 7-6 | `SwipeDeck` JSDoc 계약 ↔ diff 0줄 가드 충돌 | **가드 우선이 맞다.** 계약을 `SwipeDeck.css` 헤더로 옮긴 처리 수용 |
| 7-7 | 파일명 `*Step` → `*Card` | 카드 1장 단위가 되었으므로 이름이 사실과 맞다 |
| 7-8 | `OWNED_BOOKS_MAX`(10) ↔ "무제한 복수 선택" | 문항에 `maxSelections` 없이 저장 schema 에만 sanity bound — 타당. 카탈로그가 10권 초과하면 조정 |
| 7-9 | `CheckboxGroup variant="card"` gallery 데모 미추가 | `v5-field` baseline 재변경 회피. 디자이너 사후 확인은 `s2-deck-books-q3`·`s2-deck-growing-together` baseline 으로 가능 |

**Orchestrator 가 직접 찾은 항목**

- ⚠️ **`apps/web/src/features/auth/model/childDraft.ts` 에 테스트 파일이 없다.** `R-01` Privacy Critical 경로인데 단위 테스트가 없다. QA 가 `AC-2R-13` 검증 시 이 공백을 확인해야 한다.

**신규 BIP 2건**: `P2-BIP-18`(Q5 책 카탈로그를 `instrument.questions[owned_books].options` 로 제공 — Frontend 는 책 제목을 보유하지 않는다) · `P2-BIP-19`(`children.owned_books uuid[]`).

### 11.20 QA 재검증에서 나온 결정 (2026-10-04)

| ID | 결정 |
|---|---|
| **`QA-2R-002`** | **간격 24 로 수정** — `TopBar → ProgressBar` 16(`--space-4`), `ProgressBar → 카드` **24**(`--space-6`) 분리. Design Spec §3.1 명시값 |
| **`QA-2R-005`·`006`·`007`·`008`** (Low) | **등재만 하고 이번엔 미처리** — handoff 에 후속 대상으로 기록. Stage Verdict 계산에서 **사용자 명시 수용**으로 제외 (`rules/qa.md` §2) |
| **`QA-2R-009`** | **수정** — 수용하지 않는다. §11.21 참조 |
| **언어 환경** | **선택 사항 + 기본값 영어** — §11.22 |

#### 11.20.1 간격 24 의 측정된 대가

QA 실측 (인증+동의 16장 전수):
- **393px**: 예산 690, 최장 **662**(ER2·AG1·IM1) → 여유 28. **초과 0장**
- **320px**: 초과 카드가 **2장 → 3장**으로 1장 증가. 새로 걸린 Q3 는 **−6px**(뒤 카드 peek 32→26 수준, 잘림·겹침 없음). 320 은 reflow·스크롤 전제 폭(`AC-2-59`)이라 **FAIL 사유 아님**
- QA 가 구현자 보고를 정정: 마지막 카드 + CTA 의 26px 초과는 페이지 스크롤이 아니라 **앱 스크롤 컨테이너 내부**이고, 간격 16 비교군에서도 이미 18px 이었다 → **간격 24 기여분은 +8px**

### 11.21 `QA-2R-009` — 언어 환경 손실 (실제 버그, 수정)

**증상**: Trial 에서 고른 언어가 가입 시 **조용히 사라진다**. 다른 필드는 보존되고 언어만 날아간다.

**왜 수용하지 않았나**: 동의 직후 Guard 가 저장된 단계로 되돌리므로(`§11.19` 7-2) 해피 패스에서 `About your child` 를 **다시 지나지 않는다** → 아무 안내 없이 빈 언어로 제출된다. **사용자가 알아챌 방법이 없다.**

**근본 원인 1지점** — `apps/web/src/shared/lib/child-info.ts` 의 `partialChildInfoAnswers` 가 `languageEnvironment` 를 빈 배열이어도 무조건 포함했다. 같은 함수의 다른 필드는 전부 조건부 spread 였고, **바로 위 주석이 "빈 값은 키를 넣지 않는다"고 적혀 있었다** — 코드를 주석에 맞췄다.

**이번 재구성이 만든 결함이 아니다.** `QA-2R-003`(baseline 분리)이 드러냈고, 그 신규 baseline 자체가 **언어 칩 전부 해제된 버그 상태**를 시각 기준으로 고정하고 있었다(함께 재촬영).

**판단 2건 (구현자, 타당):**
- `gender` 는 **언어와 다르게** 키를 항상 보낸다 — `null` 은 빈 값이 아니라 **"미응답"이라는 선택**이다(C-7). 키를 빼면 미응답 사용자의 제출이 잘못 차단된다. 성별은 두 화면이 저장값을 폼으로 되살리지만 **언어는 가입 화면에 입력 자체가 없어** 되살릴 값이 없었던 것이 차이다
- contract `.min(1)` **미적용** — 이미 `[]` 가 저장된 기기의 제출을 깨뜨리고, 같은 enum 이 응답 schema·Mock·Backend 까지 번진다

### 11.22 언어 환경 — **선택 사항 + 기본값 영어** (2026-10-04, user)

> "선택으로 하고 디폰트는 영어로 한다" / "언어 선택을 하지 않으면 디폴트는 영어임"

구현자가 올린 **남은 틈 2건을 동시에 없애는 결정**이다:

| 틈 | 해소 |
|---|---|
| 언어 미선택으로 전진 → 제출에서 **안내 없이 되돌아옴**(`showErrors` 초기화로 인라인 오류 미표시) | 필수가 아니므로 **되돌아올 일이 없다** |
| 이미 `[]` 가 저장된 기기가 빈 언어로 제출 | 빈 값이 **정상**이 되고 기본값이 채운다 |

- **UI 기본 선택**: `English` 가 **미리 선택된 상태**로 보인다. "미선택 → 조용히 영어 전송"보다 **화면에 보이는 기본값**이 정직하다. **신규 문구 0건** — 선택 상태일 뿐이다
- 사용자는 **전부 해제할 수 있고**, 해제해도 전진이 막히지 않는다
- **제출 경계에서만** 빈 값을 `['english']` 로 채운다. ⚠️ **draft 저장 시점에는 채우지 않는다** — 저장소가 해제 상태를 영어로 되돌리면 해제가 불가능해진다
- `.min(1)` 은 **여전히 넣지 않는다** — 빈 배열이 정상 값이 되었으므로 더욱 그렇다
- **`S2-ONB-1`(Q1·Q2·Q4 필수)과 충돌하지 않는다** — 언어는 질문지 문항이 아니라 Step 1 프로필 필드다
- 근거: 미국 1차 시장(CLAUDE.md)

**PRD 영향**: §7.2 의 언어 환경이 필수에서 선택으로 바뀐다. PRD 수정 대상 **16번**으로 등재하고 `D-24` 절차로 적용한다.

### 11.23 설문 카드 좌우 이동 버튼 (2026-10-05, user)

사용자 지시: *"survey card 에 좌우 이동 버튼을 만들어야 할 것 같애. **지금 카드 스와이프 동작은 그대로 두고**, 버튼을 두어서 … **다중 선택을 해야 할 때 좌우 버튼을 선택해도 넘어갈 수 있도록** 해줘."* + Figma `179:1770` 갱신.

**배경**: TopBar `<` `>` 는 **이미 동작한다**(실측 `3/15 → 4/15 → 3/15`). 즉 기능이 아니라 **발견 가능성** 문제였다 — 카드에서 멀어 자동 전진이 없는 복수 선택·입력 카드에서 넘어갈 방법이 안 보인다.

명세: `docs/design/stage-2-onboarding-rework-design-spec.md` **§18 개정 3**

| 항목 | 결정 |
|---|---|
| 위치 — 가로 | **버튼 중심 = 카드 세로 모서리** (안 19 / 밖 19). 이 규칙에서 화면 가장자리·옵션 행과의 간격이 **폭 무관 2px 상수**로 떨어진다 |
| 위치 — 세로 | **앞 카드 세로 중앙**. Figma 의 `y=415` 를 고정값으로 굳히면 **favorites 선택 0건(높이 235)에서 버튼이 카드를 완전히 벗어난다**. 카드 높이가 235~638 로 변한다 |
| 겹침 | 의도. `z-index` 선언 0건(DOM 순서), **신규 `overflow` 0건** — 버튼이 카드 밖 19px 나가지만 `AppColumn` 의 `padding-inline`(24) 안쪽이라 border box 를 안 벗어난다 |
| 터치 타깃 | **추가 명세 0건** — `IconButton` 이 시각 38 / 히트 44(`--size-touch-min`)를 이미 처리하고 회귀 테스트도 있다 |
| 컴포넌트 | **기존 `IconButton` 그대로.** Figma glass fill `#ffffffbd` = `--color-surface-glass` 정확히 일치, 그림자도 `--shadow-rest` 일치. `packages/ui` 변경 0건 |
| 핸들러 | 카드 버튼이 TopBar 와 **같은 핸들러**(`handlePrevious`·`handleNextCard`)를 prop 으로 받는다. **로직 복제 금지** |
| 신규 토큰 | **0건** · 신규 문구 0건 (기존 `copy.survey.prevQuestion`·`nextQuestion` 재사용) |

**`S2R-OPEN-14` 접근성 — 카드 버튼은 포인터 전용** (`aria-hidden="true"` + `tabIndex={-1}`)

- **라벨 차별화는 오답이다.** WCAG **SC 3.2.4**(Consistent Identification)는 같은 기능에 **같은** 라벨을 요구한다. 두 쌍은 같은 핸들러를 부르는 완전히 같은 기능이므로, 다르게 쓰면 "결과가 다르다"는 틀린 정보가 된다.
- TopBar 를 남기는 이유: ① 설문을 빠져나가는 **유일한 `Go back`** ② **위치가 고정**(카드 버튼은 카드 높이마다 움직인다) ③ 사용자가 호소한 건 **시각적 발견 가능성**이라 AT 노드를 늘려도 해결되지 않는다.
- `tabIndex={-1}` 필수 — `aria-hidden` 만 주면 axe `aria-hidden-focus` 위반.
- 키보드 경로는 그대로다 (TopBar 2버튼 + 덱 `ArrowLeft`/`ArrowRight`) → WCAG 2.1.1 · 2.5.1 유지.

#### 사용자 결정 3건

| ID | 결정 |
|---|---|
| **`S2-FIX-4`** | **같이 고친다.** 2·3·4단계 첫 카드에서 TopBar leading 라벨이 `Go back` 인데 실제로는 **이전 단계의 마지막 카드**로 간다 (16장 중 **3장**, WCAG **2.4.6** 위반). 원인은 `cardIndex` 가 **단계 안 번호**라 `cardIndex === 0` 판정이 틀린 것. 올바른 규칙 = 통산 `globalIndex > 0` 이면 `Previous question`. 조건 1줄, **신규 문구 0건** |
| **`S2R-OPEN-15`** | **필수 미응답 시 다음 버튼을 흐리게 표시한다.** 카드 바로 옆이라 "눌렀는데 아무 일 없음"이 상단보다 훨씬 두드러진다. `IconButton` 공유 규칙과 승인된 §3.2 동작을 함께 바꿔야 하므로 **영향 범위를 보고**받는다 |
| **`S2R-OPEN-16`** | **전체 첫 카드에서는 카드 좌측 버튼을 렌더하지 않는다.** 카드에 붙은 `<` 는 "카드 사이 이동"으로 읽히므로 설문 **밖**으로 나가는 동작과 어긋난다. 설문을 빠져나가는 경로는 **TopBar 에만** 남긴다 |

#### 부수 정정 — `AD-S2R-03` 은 오독이었다

Figma `get_metadata` 의 `x` 는 **transform 원점**이고 우측 요소는 `scaleX = -1` 이다. 기존 기록 *"TopBar `>` 가 x=372 → 우측 끝 410 > 393 으로 프레임 밖 = Figma 슬립"* 은 반전을 못 본 것으로, **실제 우측 끝은 372 로 프레임 안**이다. ID 는 유지하고 내용을 "우측 gutter 3px 비대칭 흡수"로 바꿨다.

> ⚠️ **일반화**: Figma 좌표를 읽을 때 **반전된 instance 를 주의**한다. 렌더 bbox 와 metadata `x` 가 다를 수 있다. 스크린샷 배율로 검산하는 것이 안전하다.

#### 남은 미결 (구현 후 재검토)

- `S2R-OPEN-13` — `--survey-deck-peek-total` 이 `SwipeDeck` 의 `depth = 3` 을 복제한다. 근본 해결은 `SwipeDeck` 에 `controls="overlay"` 를 여는 것인데, 이번엔 **스와이프 동작을 그대로 두라는 지시**로 `SwipeDeck.tsx` 를 열지 않았다
- TopBar chevron 이 Figma 에서는 `HARU/Glass Rest` 인데 구현은 `variant="plain"` (Stage 1 §4.5 결정). 되돌리면 두 쌍이 똑같이 보여 구분이 약해지므로 **유지**

---

## 12. Home — Figma 대조 결과와 결정 (2026-10-05, user)

사용자 검수: *"지금은 디자인을 다 무시하고 마음대로 디자인되어 있다"* → **`CLAUDE.md` 최우선 규칙 신설** (Figma 를 그대로 구현한다).

감사: `docs/design/stage-3-home-figma-audit.md` — 사용자 지적 8건 + **추가 불일치 21건**.

### 12.1 Orchestrator 절차 잘못

`rules/workflow.md` 가 design-agent 의 **구현 후 Visual Gap 검토**를 규정하는데, Orchestrator 가 그 단계를 건너뛰고 development-agent → 사용자 검수로 넘겼다. 테스트 통과와 AC 충족만 확인했고 **"Figma 와 같은가"를 아무도 보지 않았다.** 최우선 규칙 5번에 이 금지를 명문화했다.

### 12.2 구조를 뒤집는 발견 3건

| # | 발견 | 무효가 되는 것 |
|---|---|---|
| **가로 스크롤** | Figma 카드 **365 + 좌우 14 + 14 = 393** = 뷰포트 폭 **정확히 일치** → "1 카드 = 1 페이지" 스냅 트랙. 기존 명세의 "스택" 판단은 **이 산술을 검토하지 않아** 틀렸다. `SwipeDeck` 은 4개 전제가 충돌해 **유지 불가** | **`D-14`**(Home 덱 `SwipeDeck` 재사용) 부분 무효 |
| **`86:482` = 뒷면** | 컴포넌트 이름이 앞면과 **동일**하고 **같은 좌표의 같은 24×24 아이콘**을 들고 있다. 우상단 아이콘 → flip | **`AD-S3-23`** · Spec §12.5("별도 시트") |
| **`★ Save` 를 뺐다** | Figma `I86:438;86:383;117:973` 에 **87×45 ★ Save** 가 있는데 명세가 *"PRD 근거 없음"* 으로 제외하고, 그 자리에 Figma 에 **없는** `Pick a time` 을 넣었다 — 최우선 규칙 **2·3 동시 위반** | **`D-7`** · **`AD-S3-8`** |

### 12.3 사용자 결정

| # | 결정 |
|---|---|
| ⑦ **dots + 카드 간격 + 캐릭터 + 메시지 카드** | **Figma `26:21` 을 사용자가 다시 수정했다** (2026-10-05, 감사 이후). 페이지네이션 위치 조정 · **카드 간격을 줄여 다음 카드가 살짝 보이게**(다음 카드가 있음을 알림) · **캐릭터를 키워 몸체가 더 보이게** · 메시지 카드 크기 조정. → **재실측 후 그대로 구현.** 사용자 지시: *"반드시 지켜줘"* |
| ⑧ **Reading Context 진입점** | **Stage 3 에서 제외.** 별도 디자인을 **다음에 요청**한다 → `AC-3-22`~`26` **이월**. `★ Save` 는 Figma 대로 복원 |
| **헤더 칩** | **`2 this week` 유지.** Figma 의 `12-day/115 Min` 은 **채택하지 않는다** — `D-6`(이번 주 기준)과 PRD 비교·판정 금지 원칙을 지킨다. **Figma 불일치로 기록** |
| **덱 좌우 버튼** | **제거.** 가로 scroll-snap 은 네이티브 키보드 경로가 있어 제스처 전용이 아니다 → WCAG 2.5.1 충족. Figma 와 일치시킨다 |
| ① 파란 안내 카드 | **삭제** (사용자 지적 1번). Figma 에 없는 요소다. `AC-3-11` 의 UI 형태 근거가 사라지므로 **AC 재정의 필요** |

### 12.4 확정된 수정 대상 (Figma 대로)

- **탭바 하단 간격 16px** — 현재 **0**. 신규 토큰 `--layout-tabbar-bottom-gap: 16px` (Figma 852−(766+70) 근거)
- **캐릭터 폭 441** — 현재 **393**. 원인은 CSS `100%` 가 뷰포트가 아니라 **컬럼(345)** 으로 풀린 것
- **버블** — Figma 224 ↔ 구현 341, **보조 문구 한 줄 누락**, tail 방향 반대(Figma 우측 76%), 폰트 Bold ↔ 구현 400
- **`Show all 5 prompts` 제거** — Figma 에 확장 트리거가 없고 pill 4~5개가 **전부 노출**된다 → **`AC-3-17` 무효**
- **pill** 330×42(padding 13/9, gap 6) ↔ 구현 305×58(padding 16/10, gap 8)
- **카드 padding 18** ↔ 구현 20. ⚠️ `DESIGN_TOKEN_MAP.md:316` 이 "16·18·20 → 16·20" 으로 흡수했는데 **Figma 실측은 18** 이다 — 흡수 규칙 재검토 대상
- **M-01 Critical** — **320px 에서 카드가 탭바를 16.8px 덮는다.** `AC-3-06` 현재 **FAIL**
- 헤더 워드마크 y −13 · 설정 아이콘 y −9 · 카드 배경 `white 85%` + glass blur 24 ↔ `rgba(255,255,255,0.9)`

### 12.5 PRD 수정 대상 추가 (§5 에 이어서)

| # | PRD 위치 | 현재 | 확정 동작 | 근거 |
|---|---|---|---|---|
| 8 | **§7.9** | 카드 덱 **"좌우 스와이프"** | **가로 스크롤(scroll-snap)** — 1 카드 = 1 페이지 | Figma `163:2648` 실측 (365+14+14=393) |
| 9 | **FR-07 · §7.4** | Prompt **2~3개** 제시 | **4~5개 전부 노출**(확장 트리거 없음) | Figma `163:2649`(4) · `86:438`(5) |
| 10 | **§7.4** | — | **카드 뒷면**(우상단 아이콘 → flip)에 Prompt 전체 + 코칭 노트 | Figma `86:482` |

### 12.6 미결 — 다음 라운드에서 결정

`A-2`(카드↔탭바 정확값) · `A-4`(**≥600px 규칙 전무** — Figma 에 600px 프레임 없음) · `A-5`(뒷면 pill n>3) · `A-6`(16px ↔ iOS safe-area 합성) · `A-7`(**버블 보조 문구의 출처** — contract / 고정 copy) · `A-9`(**`★ Save` 의 동작·contract 가 없다**) · `A-11`(Prompt n>5) · `A-12`(320px) · `A-16`(flip 중 높이 377↔415) · `A-17`(**"부모용 코칭 문장"이 Figma 앞면에 없다** — `AC-3-10`)

### 12.7 Figma 재실측 (2026-10-05, 사용자 수정 후)

사용자가 `26:21` 을 감사 이후 다시 수정했다. 재실측 결과 지시가 정확히 반영됐다.

| | 1차 | **2차** | 의미 |
|---|---|---|---|
| 카드 gap | 14 | **6** | `peek = 14 − gap` → **peek 8px** 생김 ("다음 카드가 살짝 보이도록") |
| 캐릭터 `26:22` | 441×560, 뷰포트 bleed | **357×442** @ (24,85), aspect 0.7875 → **0.8077** | 단순 축소가 아니라 **재크롭** → **에셋 재export 필요** |
| 버블 | `88:922` 224×87 | **`261:1293` `Bubble type=Type2` 303×96** | **컴포넌트 교체** |
| dots | `88:909` 래퍼 안 | `26:21` 직접 자식 **(174,717)** | 기하(46×7·활성 20×7·gap 6)는 **구현과 완전 일치**, 위치만 이동 |

- **트랙 공식**: `pad 14 + 카드 + gap 6 + peek 8 = 393`. 카드 폭 = `W − 28` → 320 에서 292 · **393 에서 365(Figma 정확 일치)** · ≥600 에서 452. **peek 8 이 전 구간 불변.**
- **flip 이 Figma 데이터로 확정**: 컴포넌트 시그니처에 **`flip?: "front"` variant**, 우상단 아이콘 에셋명 **`flip_to_back`**. 추측이 아니다.
- **`AC-3-06` 320px FAIL 해소**: 원인은 ActionBar 2행(102px)이었고 `Save` 고정 87 + `Start Session` flex 로 1행 유지 → 카드 하단 705, 탭바 766, **겹침 0**.
- 헤더 `26:40` 텍스트가 `12-day/115 Min` → **`2week /115 Min`** 으로 바뀌었다. §12.3 결정(`2 this week` 유지)은 **그대로 둔다** — 누적 분(115 Min)이 여전히 달성률 언어다. Figma 불일치로 기록.

### 12.8 구현 차단 4건 — 결정 (2026-10-05, user)

| ID | 결정 |
|---|---|
| **A-7** 버블 보조 문구 | **`Please select the book and start session` 으로 변경.** Figma 의 `Tap me to say hi` 는 **채택하지 않는다** — Stage 3 에 캐릭터 탭 동작이 없어 **거짓 어포던스**가 된다. 고정 copy 로 두되 **copy 모듈 소유**(문구 교체가 화면 코드를 안 건드리게) |
| **A-9** `★ Save` | **현재 카드를 Library 의 favorites 에 저장한다.** → **신규 contract 필요.** Home 에서 저장 동작은 이번에 구현하고, **저장 결과를 보는 Library 화면은 다음 차례** |
| **A-17** 코칭 문장 | **뒷면 `86:482` 의 beige 노트가 그 역할.** Figma 근거가 가장 확실하고 기하도 그대로 쓸 수 있다. `AC-3-10` 의 **검증 지점만 뒷면으로 이동** |
| **`AC-3-11`** | **폐기.** 파란 안내 카드를 삭제하고 지난 날짜 안내 요구 자체를 없앤다. `D-10` 의 "서버 `date` 신뢰"는 유지되나 ③("화면이 그 날짜를 밝힌다")은 **철회** |

### 12.9 Plan 이 반영해야 할 것

**무효**: `AC-3-11`(폐기) · `AC-3-17`(확장 트리거 — Figma 에 없음) · `AC-3-22`~`26`(Reading Context 이월) · `D-14` Home 덱 부분 · `D-7`·`AD-S3-8`(`★ Save` 제외) · `AD-S3-23`·Spec §12.5(`86:482` = 별도 시트)

**수정**: `AC-3-06`(320 해소안 반영) · `AC-3-18`(버튼 → 가로 트랙 네이티브 키보드) · `AC-3-16`(Sheet → 뒷면) · `AC-3-10`(뒷면 beige 노트) · `AC-3-14`(Skeleton 가로 1장 + peek) · `AC-3-66`(baseline 교체)

**신규**: `★ Save` → Library favorites contract · `AC-3-19` 는 flip 이 실제로 생겨 **유효해진다**

**PRD 수정 대상 8·9·10** (§12.5): 덱 전환 방식 · Prompt 개수 · 카드 뒷면

### 12.10 `★ Save` 와 Prompt 노출 — 결정 (2026-10-05, user)

| ID | 결정 |
|---|---|
| **`G-13`** Save 토글 | **토글 — 다시 누르면 해제.** contract 는 `PUT`/`DELETE …/saved-books` 양방향. ⚠️ **저장됨 상태의 시각 표현이 Figma `117:973` 에 없다**(saved 변형 부재) → **디자이너 확인 필요**. 그때까지는 접근성으로만 구분하지 말고(색 단독 구분 금지) 최소한 `aria-pressed` + 식별 가능한 시각 변화를 둔다 |
| **`G-14`** 초기 저장 상태 | **반영한다.** 어제 저장한 책이 오늘 카드에 나오면 저장된 상태로 보인다 → `ActivityCardOption.saved` 가 필요하다. ⚠️ 카드 응답에 **서재 조인**이 생기므로 **`P3-BIP-10`(2초 NFR)에 영향** — Backend 요구사항에 명시 |
| **`N-2` Prompt 노출** | **Figma 대로 전부 노출.** 접힘 3개 + 확장 규격을 **폐기**한다. **`D-21`(개수 상한 없음)은 그대로 유지** — 상한과 표시 개수는 다른 문제다 |
| **Library Figma 재대조** | **구현 전에 수행.** Home 에서 지적 8 + 추가 21 = **29건**이 나왔고 Library·Book Select 는 **같은 명세 패스**에서 쓰였다. 재대조 없이 구현하면 같은 재작업이 반복된다 |

**`Save` ↔ 온보딩 favorites 분리 승인** (plan-agent RECOMMENDED):
- 온보딩 `favoriteBooks` 는 **제출된 설문 응답**이다. Home Save 가 이를 쓰면 사후에 설문을 고쳐 쓰는 셈이고 cold-start state vector(`P3-BIP-02`) 출처가 깨진다
- `FAVORITE_BOOKS_MAX = 5` 는 **설문 instrument 제약**이다. 공유하면 6권째 저장이 막히는데 **그 상한을 알리는 UI 가 Figma 에 없다** → 반응 없는 버튼이 된다. **Save 는 상한 없음**
- 저장 대상 = **선택된 옵션의 책**(카드 아님). 카드는 하루 단위로 사라지는 자원이라 저장 항목이 만료되는데 그 UX 가 Figma 에 없다
- 같은 표면(`child_books` → `LibraryBook`)에서 만난다. `saved`·`saved_at` 축 추가, `ownership` 에 값을 더하지 않는다(두 축이 독립)
- `PUT` 은 자원 상태 설정이므로 **멱등**, IK 불필요. **Error code 신규 0건**

### 12.11 미결 — 다음 라운드

`G-12`(`conversation_only` 카드의 Save 대상 — book·userEnteredBook 둘 다 없다) · `A-3`(Figma gap 6↔10) · `A-5`(뒷면 pill n>3) · `A-11`(Prompt n>5) · `A-20`(`DESIGN_TOKEN_MAP` spacing 흡수 16·18·20→16·20 ↔ Figma 실측 **18**) · `A-23`(헤더 칩 — `2 this week` 유지로 결정했으나 Figma 가 `2week /115 Min` 으로 바뀜. **누적 분이 달성률 언어**라 유지)

### 12.12 `conversation_only` 카드 폐지 + 표지 임시 에셋 (2026-10-05, user)

사용자 지시 원문:
> "**책없이 대화만 하는 카드가 있을 수 없음.** 책은 백엔드에서 자동으로 추천해 주는 것으로 별도의 DB를 이후에 구축하고 추천 로직을 붙일 예정임. **프론트에서는 책이 있다고 생각하고 목업으로** 만들어 주어야 함. 그리고 **책 이미지도 피그마에 있는 이미지를 이용해서 임시로 노출**해주어야 함"

#### ⚠️ 이름이 같은 **두 개념**을 혼동하지 말 것

| | 위치 | 성격 | 처리 |
|---|---|---|---|
| **`ActivityOptionKind.conversation_only`** | Home Activity Card 의 옵션 (`book: null`) | "보유 책이 없을 때 책 없이 대화" | **폐지** |
| **`SessionMode.conversation_only`** | `packages/contracts/src/enums/session-mode.ts` | **마이크 권한 거부·녹음 미동의** 시의 녹음 없는 세션 (**Stage 4**) | **유지** — 책과 무관하고 PRD §13 예외 처리의 근거다 |

#### 결정

- **Home 카드에 `conversation_only` 옵션을 만들지 않는다.** Frontend 는 **항상 책이 있다고 가정**한다
- `ActivityCardOption.book` 은 **non-null** 로 다룬다. `title`(책 없는 활동 제목) 필드는 사용하지 않는다
- **Mock 시나리오 `conversation-only-option` 폐기** → `AC-3-20` 에서 해당 항목 제거 (`reread-option` · `books-exhausted` 2종은 유지)
- `G-12`(`conversation_only` 카드의 Save 대상) **소멸** — 결정 불필요
- **책 표지 이미지는 Figma 의 이미지를 임시로 쓴다.** 현재 이니셜 상자(`GM`) placeholder 를 교체한다. Figma `30:74` Library 와 `163:2648` 카드의 표지 image fill 을 export

#### PRD 수정 대상 추가

| # | PRD 위치 | 현재 | 확정 동작 | 근거 |
|---|---|---|---|---|
| 11 | **§7.4 규칙** | *"라이브러리 책을 보유하지 않은 경우 증정 신청 버튼을 제공하고, 도착 전에는 **'책 없이 대화만 하기' 옵션**으로 대화 전용 세션을 지원한다"* | **Home 카드는 항상 책을 동반한다.** 책 추천은 Backend 소관이며 보유 여부와 무관하게 추천된다 | 사용자 지시 2026-10-05 |

> §13 의 *"마이크 권한 거부 → 대화만 하기(녹음 없는 체크리스트 모드)"* 는 **그대로 유지**된다 — 이건 녹음 이야기이고 Stage 4 소관이다.

#### Backend 요구사항

- **서버는 항상 책이 있는 카드를 내려준다.** 추천할 책이 없는 상황(`books-exhausted`)은 **재독 카드**로 해결하며 책 없는 카드를 만들지 않는다 → `P3-BIP-01`·`P3-BIP-02` 에 명시
- 표지 이미지는 Backend 가 `coverUrl` 로 제공한다. **Frontend 의 Figma export 는 Mock 전용 임시 에셋**이며 Backend 연동 시 교체된다

### 12.13 `A-20` spacing — 18 토큰 추가 (2026-10-05, user)

**`--space-4-5: 18px` 를 semantic 스케일에 추가**하고 `DESIGN_TOKEN_MAP.md:316` 의 "16·18·20 → 16·20" 흡수 규칙을 수정한다.

- 0.5 스텝 규칙(`0-5`·`1-5`·`2-5`·`3-5` 기존)에 그대로 부합
- 18 은 카드 앞면·뒷면·(예상) Library 시트에서 반복된다
- ⚠️ **현행 20 으로 두면 카드 내부 폭이 329 → 325 가 되어 Figma pill 330 이 들어가지 않는다** — 선택이 아니라 필수였다
- Figma 의 0.5 스텝 밖 값(9·13·7·22·26·42·45·58·82)은 **component tier(Tier 3)로만 흡수**한다 (Stage 0 #10)

### 12.14 Visual Gap 검토 결과와 결정 (2026-10-05, user)

design-agent 가 development-agent 의 "Δ 0" 보고를 **독립 실측**해 결함을 찾았다. **이 단계를 1차에서 건너뛴 것이 Figma 이탈 29건의 원인이었다** (§12.1).

**High 2건**: pill 의 `border` 가 padding box 바깥에 붙어 2줄 pill 이 42 → **44** → 4개 합 192 > 186 → **4번째 pill 하단 테두리 6px 잘림**. 320px 에선 5개 전부 44 라 244 vs 186.
**통과 확인**: 반응형 4폭 겹침 0(`AC-3-06` 해소) · flip 시 카드 하단 **705 고정** · 가로 스크롤 **잔여 공백 0** · **키보드만으로 3장 도달** · `reduce` 즉시 전환 · DOM 유무 검사 전부 정상.
**baseline 검증력**: `s3-tabbar-bottom` 이 `s3-tabbar-top` 과 **md5 동일** — 393×852 는 스크롤이 안 생겨 2컷의 **검증력이 0** 이었다. 실제 스크롤되는 뷰포트에서 재촬영.

#### 사용자 결정 4건

| ID | 결정 |
|---|---|
| **`V-15`** 이어하기 안내 | **버블 문구로 통합.** Figma 에 없는 `ActiveSessionNotice` 를 제거하고, `home:session-already-active` 에서 **버블의 `characterLine` 이 그 상태를 말하게** 한다. → **신규 UI 0건**, 캐릭터 얼굴을 가리지 않는다. `AC-3-15` 는 검증 지점이 버블로 이동 |
| **뒷면 코칭 노트** | ★ **prompt 1개당 상세 코칭 노트 1개.** 사용자 설명: *"카드 뒷면은 각 페이지별 코칭 노트(아이에게 질문할 프롬프트) 하나당 하나의 상세 코칭 노트가 매칭되어 있음. 따라서 뒷면에도 앞면의 각 문구별 상세 노트가 **동일한 개수만큼** 표시되고 **스크롤**될 수 있게 하여 다 볼 수 있게 해야 한다."* → **contract 변경**: 카드 단위 `coachingLine` 1개 → **`Prompt` 마다 코칭 노트** |
| 데모 Prompt 수 | **5개 유지** — 내부 스크롤이 실제로 동작하는지 검수에서 확인할 수 있다. `D-21`(상한 없음)을 데모로 보이는 의미도 있다 |
| `userEnteredBook` | **삭제 유지** — `book` 이 항상 있으면 의미가 없다. 필요해지면 Library 라운드에서 재도입 |

#### 뒷면 구조 (확정)

```
Prompt 1  →  코칭 노트 1
Prompt 2  →  코칭 노트 2
   …           …
(앞면과 같은 개수, 넘치면 내부 스크롤)
```

- Figma `86:482` 의 `[pill, note]` 2쌍은 **예시**이며 개수는 **데이터가 정한다**
- 앞면 pill 개수 = 뒷면 노트 개수 (1:1)
- 넘치면 **본문만 내부 스크롤**, 트랙 415 불변 (`A-5`·`A-11` 승인안 유지)
- `AC-3-10`("부모용 코칭 문장") 검증 지점 = **뒷면의 prompt 별 노트**

#### Backend 요구사항 변경

`P3-BIP-03`(Prompt 라이브러리) 범위 확대 — **Prompt 마다 상세 코칭 노트를 동반**해야 한다. 기존 "질문 + 부모용 코칭 문장 + Follow-up" 중 코칭 문장이 **세트 단위가 아니라 Prompt 단위**임을 명시.

#### PRD 수정 대상 추가

| # | PRD 위치 | 현재 | 확정 동작 |
|---|---|---|---|
| 12 | **§8.2** | *"각 세트는 질문 + **부모용 코칭 문장** + Follow-up 질문으로 구성"* (세트 단위로 읽힘) | **Prompt 마다** 상세 코칭 노트가 1:1로 붙는다 |

### 12.15 카드 그림자 클리핑 (2026-10-05, user)

사용자 검수 지적: *"카드 하단 쉐도우가 컨테이너에 갇혀서 짤려 보인다"*

**지적보다 심했다** — "흐려지다 잘린다"가 아니라 **카드 하단 1px 아래부터 완전 절단**이었다. 트랙의 border box 하단이 **카드 하단과 정확히 같은 지점**(y=705)이라 **그림자 자리가 0px** 이었다 (`align-items: flex-end` + `block-size: 415` + `box-sizing: border-box`).

⚠️ **`overflow-y: hidden` 을 지워도 해결되지 않는다** — 한 축이 `visible` 이 아니면 다른 축도 될 수 없으므로, 가로 스크롤을 쓰는 한 세로도 클립 박스다.

| ID | 결정 |
|---|---|
| **`D-REQ-4`** | **하단 inset 80px.** §6 이 승인한 **24 는 부족하다** — 그림자 3겹 중 2번째(`0 12px 28px`)만 세고 3번째(`0 28px 56px`)를 빼뜨린 계산이었다. **실측 번짐: 아래 77 · 위 22 · 좌우 28~32.** 24 로는 절단선이 그대로 남는다(d=24 에서 delta 32 → 0). 상단은 승인값 **24 그대로 유효** |
| **`D-REQ-3`** | **좌우 그림자 ≥600px 절단을 수용한다.** ≤480 에서는 클립 선이 화면 가장자리라 안 보이고, ≥600 에서는 앱 컬럼 안쪽이라 보인다. `pad` 는 카드 폭·peek 공식의 **입력값**이라 키우면 트랙이 앱 컬럼 480 을 넘는다 → 세로와 같은 방법으로 해결 불가. **허용 차이로 등록** |
| **`D-REQ-5`** | **`R-SHADOW-1` 을 `.claude/rules/frontend.md` §6-1 로 승격** (완료) |

**§6 정정**: 승인 조건의 `padding-block: 24 / margin-block: -24` 를 **상 24 / 하 80** 으로 바꾼다. 보호 구조 자체는 유지되며, `block-size` 에 inset 을 **가산**해야 한다는 조건이 추가된다(`border-box` 라 안 더하면 카드가 415 보다 작아진다).

**세로 배치 불변 확인**: 트랙 카드 415 · 카드 하단 705 · dots 717 · 탭바 766 · 캐릭터 (24,29) — 6개 뷰포트에서 **1px 도 안 움직인다**. 앱 셸 `scrollHeight` 도 동일(음수 margin 이 scrollable overflow 를 되돌린다).

**토큰**: `--carousel-shadow-inset` = 24 (승인값 재사용, 상단) + **`--carousel-shadow-inset-block-end` = 80px** (신규, Tier 3 — `--space-*` 스케일이 40 에서 끝난다).

**테스트 공백이 드러났다**: `e2e/shadow.spec.ts` 가 **가로만** 프로브해서 이 결함을 못 잡았다. **세로 프로브 추가**가 필요하다.

## 13. Visual Gap 3차 이후 결정 (2026-10-06, user)

design-agent Visual Gap 검토 3차(`docs/design/stage-3-home-figma-audit.md` §23) 결과에 대한 결정이다.
3차 판정은 **"수정 필요"** 였으나, 그 사유는 그림자 수정과 무관한 **신규 발견 결함 `X-1`** 이었다.
**그림자 수정(`D-REQ-4`)과 시각 임계값 변경은 3차에서 "검수 가능"** 으로 확인되었다.

### 13.1 `X-1` — 하단 탭바가 SPA 이동이 아니라 전체 리로드 (결함, 승인 대상 아님)

| 항목 | 내용 |
|---|---|
| 증상 | Library·Progress 탭 클릭 → document 요청 발생 → 전체 리로드 → 메모리 세션 소멸 → `/auth/welcome` 리다이렉트 |
| 원인 | `packages/ui/src/tab-bar/BottomTabBar.tsx` `handleClick` 이 `event` 를 받지 않아 `preventDefault()` 가 없다. `apps/web/src/shared/config/tabs.ts` 가 `href` 를 실제로 주입하므로 `<a href>` 분기로 렌더되어 **`navigate()` 와 브라우저 기본 이동이 동시에** 일어난다 |
| 판정 근거 | `apps/web/src/app/layouts/AppTabBar.tsx` 주석이 *"클릭은 SPA 이동으로 처리한다"* 라고 **설계 의도를 명시**한다 → 의도된 동작이 아니라 **버그**다. 따라서 디자인 변경 승인 대상이 아니며 즉시 수정한다 |
| 검출 실패 원인 | **탭 이동 e2e 케이스가 0건**이었다. jsdom 단위 테스트는 `<a>` 기본 이동을 수행하지 않아 통과한다 — **단위 테스트만으로는 재발을 막지 못한다** |
| 수정 조건 | `preventDefault()` 추가. 단 `metaKey`·`ctrlKey`·`shiftKey`·`altKey`·`button !== 0` 은 **기본 이동을 유지하고 `onSelect` 도 호출하지 않는다** (새 탭으로 열면서 현재 탭까지 이동하면 안 된다). `href` 를 준 이유가 Design Spec §6.2 "링크 의미 유지" 이므로 그 의도를 깨지 않는다. `packages/ui` 에 router 를 import 하지 않는다 (AC-1-25) |
| 회귀 테스트 | e2e 에 탭 이동 케이스 필수 — URL 유지 + `resourceType === 'document'` 요청 0건, 양방향. **수정 전 FAIL 확인을 증거로 남긴다** |

### 13.2 `A-23`-icon — 헤더 칩 아이콘 → **Figma SVG 로 교체** (승인)

- Figma `26:40` 내 `50:161` 13×13 = **시계/타이머 계열 글리프, 앰버 톤**. 구현은 **Lucide `star`** (`entities/home/WeekSummaryChip.tsx`)
- `docs/decisions/**` · design-spec 전수 grep 결과 **칩 아이콘을 `star` 로 바꾼다는 결정 문구는 0건**이다 — 문구(`2 this week`)만 결정되어 있었다

> ### ⚠️ 판정 근거 정정 (2026-10-06, Orchestrator 실측)
>
> design-agent 는 이것을 **"승인 근거 0건인 임의 변경"** 으로 판정했으나 **그 근거는 틀렸다.**
> Figma `30:91` 을 SVG 로 export 해 확인한 결과 **실제로 star 글리프가 존재한다**:
> `M6.5 1.08333L8.07083 4.44167L11.6458 4.875L8.99167 7.36667L9.69583 10.9417L6.5 9.20833…`
> — 5각성 단일 채움 path, fill `#D0CCA1`, 13×13 으로 `50:161` 과 **색·크기가 같다**.
>
> 즉 `star` 는 **Figma 에 근거가 있었다.** `WeekSummaryChip.tsx` 주석도 *"Figma 의 두 칩(`26:40` clock + 115 Min, `30:91` star + 12-day streak)을 하나로 통합"* 이라고 적고 있다.
> **결정 문구가 없었던 것**과 **Figma 근거가 없었던 것**은 다르다.
>
> **그럼에도 결론은 `history`(`50:161`) 가 맞다.** 근거를 다음으로 교체한다:
>
> 1. 통합 칩이 표시하는 것은 **이번 주 세션 수**(`AD-S3-9`) 로, 두 원본 칩의 내용(`115 Min` · `12-day streak`) **어느 쪽도 아니다**. 따라서 **어느 아이콘도 내용상 정확히 맞지 않는다**
> 2. `star` 가 대표한 **streak 는 `D-6` 미채택**으로 contract 에서 `streakDays` 가 **삭제**됐다 — 기각된 쪽의 표식이다
> 3. **`star` 는 성취·평점 언어다.** `rules/frontend.md` §8 이 진단·판정·비교 표현을 금지하며, **`D-7` 이 Figma 의 평점 기능을 같은 이유로 기각**했다. 세션 수에 별을 붙이면 달성률 표식으로 읽힌다
> 4. `history`(시계 + 반시계 화살표)는 **지나간 활동**을 가리켜 "이번 주에 한 세션"과 의미가 맞는다
>
> **구현 결과는 유지한다.** `WeekSummaryChip.tsx` 와 `packages/ui/src/icon/registry.ts` 의 주석에 남은
> *"임의 변경"* 서술은 **사실과 다르므로 위 근거로 교체한다**.
- §21 `V-6` 은 아이콘 **크기 13×13 만** 확인하고 글리프를 보지 않아 놓쳤다
- **결정: Figma 노드에서 SVG 를 export 해 HARU 전용 아이콘으로 넣는다** (Stage 0 #21 — HARU 전용 아이콘 = Figma SVG export). Lucide `clock` 대체는 채택하지 않는다
- ⚠️ design-agent 는 Figma 칩 아이콘의 **정식 이름을 확인하지 못했다**(컴포넌트명이 `Icon` 뿐, 렌더 픽셀로 "시계/타이머 계열"로 판독). export 시 노드를 다시 확인한다
- 문구 `2 this week` 는 **유지**한다 (PRD §8.4)

### 13.3 `W-5` — characterLine 길이 → **4줄 상한 + Contract 요구 등록** (승인)

- 캐릭터 **눈 상단 y=183**(어두운 픽셀 경계 실측). 버블 높이 `20n+42`, 본체 하단 `51+높이`
- → **4줄 173 (여유 10) / 5줄 193 (눈을 덮는다)**. 레이아웃이 밀리는 건 10줄부터지만 **얼굴이 먼저 깨진다**
- **결정: UI 는 4줄에서 말줄임**하고, **서버가 약 120자 이내로 보내도록 Contract 요구사항에 등록**한다
- 문구는 서버(Mock) 응답 값이므로(`A-7`) Frontend 가 길이를 보장할 수 없다 → Stage 8 Handoff 의 Backend 요구사항으로 간다
- ⚠️ "1줄 ≈ 30자" 환산은 design-agent 의 **추정**이다 (§21 계산 인용). 실측으로 확정된 값은 눈 상단 y=183 과 버블 높이 공식이다

### 13.4 `W-2` — 버블 닫기 버튼 여백 → **40 유지** (승인)

- 본문 상자 right **302** > 히트 원 left **299** 로 3px 역전이 있으나, `elementFromPoint(300,53)` → `div.haru-bubble` 로 **현재 오작동이 없다**(원형 히트 영역)
- 닫기 버튼 자체가 Figma 에 없으므로 40 도 43 도 Figma 근거는 없다
- **결정: 40 을 유지한다.** 잠재 결함으로만 기록하고 본문 폭 3px 을 희생하지 않는다

### 13.5 `A-3` — 카드 간격 → **6 유지 + 디자이너 수정 요청** (승인)

- Figma `163:2648` 카드 x **245 / 616 / 991**(폭 365) → 간격이 **1→2 는 6, 2→3 은 10** 으로 **Figma 내부가 불일치**한다. 균일 gap 으로 둘 다 만족할 수 없다
- 6 → peek **8**, 10 → peek **4**(radius 28 곡선에 거의 먹힌다)
- **결정: 6 을 유지**한다 (`--space-1-5`). Figma 내부 불일치는 **디자이너 수정 요청 항목**으로 등록한다

### 13.6 `W-1` — 5번째 Prompt 스크롤 어포던스 → **추가하지 않는다** (현행 유지)

- Figma 앞면 `163:2649` Prompt 컨테이너 = **329×186 에 pill 4개**(42×4 + 6×3 = 186). **Figma 에 5번째도 어포던스도 없다**
- 구현의 "5개 + 내부 스크롤"은 `D-21` 결정이다. 페이드·그림자·잘린 조각은 모두 **Figma 에 없는 신규 UI** 이므로 최우선 규칙 #2 에 따라 별도 승인 없이 추가하지 않는다

### 13.7 미결 — `D-REQ-3` (≥600 좌우 그림자)

- ≥600 앱 컬럼에서 좌측 그림자가 모서리에서 절단된다 (실측: 현재 `14:20 → 16:0`, `overflow` 해제 시 `16:16 20:14 24:12 28:4`)
- **설계상 미수정 상태이며 사용자 결정 대기 항목**이다. 신규 결함이 아니다 (§12.6 과 동일 재현)

### 13.8 3차 검토에서 **기각된** 의심 항목 (`X-2`)

- 프레임 하단의 밝은 띠를 Gap 으로 의심했으나 **모서리 반경 55 바깥의 Figma 캔버스 배경**으로 기각
- 검산 `y = 852 − 55 + √(55² − (55−x)²)` → x=4 **817.6** · x=30 **846.0** (실측 818 / 846 일치), x=200 에서는 나타나지 않음
- 추정을 실측으로 스스로 접은 사례로 기록한다

### 13.9 측정 함정 (기록)

실제 Home(393×852)은 **탭바 상단 766 = 카드 하단 +61** 이므로, `d ≥ 61` 지점의 픽셀 프로브는 **탭바에 가려 0** 이 된다.
이 프로파일을 근거로 *"하단 inset 80 이 과하다"* 를 결론 내면 안 된다. 번짐 끝 **77** 은 덮개를 제거한 조건(393×1000, 하단 바·dots `visibility:hidden`)에서 측정한 값이다.

### 13.10 Start Session CTA — **`D-3` 비활성 유지** (2026-10-06, user)

사용자가 *"Start Session 버튼이 모두 비활성이야. 책은 백엔드에서 추천해서 주어질 것이므로 활성화해주어야해"* 라고 지시했으나,
**원인 확인 결과 지시의 전제와 실제 원인이 달랐다**:

| 전제 | 실제 |
|---|---|
| 책이 없어서 비활성이다 | **책은 이미 들어 있다.** `mocks/fixtures/activity-cards.ts` 가 `DECK_BOOKS` 에서 카드마다 책을 붙인다 (`kind: 'book'`, `bookIndex`) |
| — | 비활성 원인은 `features/activity-card-deck/ui/ActivityCardDeck.tsx` 의 **`aria-disabled` 하드코딩**이며 근거는 승인된 **`D-3`** ("실제 세션 시작은 Stage 4") |

활성화하려면 **누른 뒤 갈 곳**이 필요한데 지금은 없다:

- `POST /v1/sessions` 는 `docs/API_CONTRACTS.md` §697 에 **문서로만** 있고 `packages/contracts/src/` 에 `sessions/` 디렉토리가 **없다**
- `/session` route 도 **없다** (`shared/config/routes.ts` — Stage 3 탭은 Library / Home / Progress 3개)
- 즉 세션을 실제로 시작하려면 contract + Mock + route + 화면이 모두 필요하고 그것은 **Stage 4 전체**다

**결정: 지금은 비활성을 유지한다** (`D-3` 그대로). Stage 4 에서 한 번에 연결한다. 코드 변경 0건.

> **기록해 둘 관찰**: 사용자가 이 버튼을 **결함으로 인지**했다. `D-3` 은 사유 문구 슬롯(`copy.card.startSession.reason`)을
> 의도적으로 비워 두었고("곧 나옵니다" 류는 개발 단계를 사용자에게 드러내므로 `D-3` 대안 ③ 으로 기각),
> 그래서 화면에 **비활성 사유가 보이지 않는다**. 검수자·사용자가 같은 혼동을 반복할 수 있다.
> 운영 문구가 정해지면 `reason` 값만 채우면 되므로 구조 변경은 필요 없다. 지금은 조치하지 않는다.

## 14. Library Figma 전수 대조 — 사실관계 정정 (2026-10-06, Orchestrator 실측)

design-agent 전수 대조(`docs/design/stage-3-library-figma-audit.md`) 중 **현행 설계 문서의 노드 오독**이 보고되었고,
**Orchestrator 가 Figma 로 직접 검증해 사실로 확인**했다.

### 14.1 `AD-S3-4` 의 전제가 사실이 아니다 — **무효**

`docs/design/stage-3-design-spec.md` **:383** 과 **:1286** 은 이렇게 적고 있다:

> *"Figma 는 섹션 제목을 'Our curated shelf' / 'Finished together' / 'Finished together' 로 **두 번 중복**한다(`163:1633` · `30:139`). 두 번째 캐러셀은 내용상 **보유 책**이므로 제목을 바꾼다 → `AD-S3-4`"*

**실측 결과 `163:1633` 의 텍스트는 "Favorites" 다.** `get_metadata` 로 확인:

```
<frame id="163:1632" name="Frame" x="0" y="268" width="345" height="20">
  <text id="163:1633" name="Favorites" x="0" y="0" width="79" height="20" />
  <text id="163:1634" name="See all" x="306" y="5" width="39" height="14" />
</frame>
```

L-1 (`30:74` — 노드 이름이 **`2a · Library — Bookshelf & History/Defult shelf`**) 의 세 섹션은 **중복이 아니라 전부 다르다**:

| 순서 | 노드 | 제목 | 내용 |
|---|---|---|---|
| 1 | `163:1625` | `Our curated shelf` | 표지 캐러셀 `113:1994` |
| 2 | **`163:1633`** | **`Favorites`** | 표지 캐러셀 `145:779` |
| 3 | `30:139` | `Finished together` | Book List 4행 (`30:140`) |

제목이 실제로 중복된 프레임은 L-1 이 아니라 **L-3 (`163:1669`)** 이다. 즉 설계 문서가 **L-1 과 L-3 를 혼동**했다.

**결과**:
- **`AD-S3-4` 는 무효**다. 근거(중복)가 존재하지 않는다
- `AD-S3-4` 가 만든 **"Books you own" 은 Figma 에 없는 문구**이며 **최우선 규칙 #2**("Figma 에 없는 것을 만들지 않는다") 위반이다
- 2번째 섹션의 Figma 문구는 **`Favorites`** 다
- `design-spec.md:383`·`:1286` 은 **수정 대상**으로 기록한다

### 14.2 이 정정이 `A-9` 충돌을 해소한다

§12.8 `A-9` 는 *"현재 카드를 Library 의 favorites 에 저장한다 … 저장 결과를 보는 Library 화면은 **다음 차례**"* 로 결정되어 있었고,
`D-7` 은 **"My Saved" 미구현**이어서 **저장한 책이 갈 곳이 없는** 상태였다 (`SaveButton` 은 이미 동작하고 `BookOwnershipSchema.favorite_only`·`saved-books.ts` fixture 도 존재한다).

**Figma L-1 에 `Favorites` 섹션이 "See all" 과 함께 실재하고, 사용자 지시 문구("Library 의 favorites")와 이름이 정확히 일치한다.**
따라서 저장한 책의 표면은 **Figma 에 이미 있는 `Favorites` 섹션**이며, 새 UI 를 만들 필요가 없다. `D-7` 은 이 섹션을 **언급조차 하지 않았다**.

### 14.3 추가 확인 사항 (실측)

- L-1 헤더 칩은 **star + `2Week streak`** (`30:91` star frame + `30:93` 텍스트) 다 → `A-23` 차이가 Library 에도 적용된다 (§13.2)
- `Rated 4.5` 는 L-1 Book List 4행에 **각각 존재**한다 (`109:511` · `109:519` · `163:1643` · `163:1654`)
- Book List 에 **실제 상용 그림책 제목**이 들어 있다 (`30:144` *Where the Wild Things Are*, `30:152`·`163:1639`·`163:1650` *Grumpy Monkey*) → §14.4
- `/library/add` · `/library/gift-requests` **진입점이 L-1~L-3 어디에도 없다** → 현행 spec 의 `LibraryFooterActions` 는 Figma 근거가 없는 명세다 (`C-13` 대상)

### 14.4 ⚠️ 표지 에셋 라이선스 — 법무 확인 필요

Figma 표지 에셋에 **실제 상용 그림책 표지**가 그대로 들어 있다고 보고되었다:
*The Most Magnificent Thing* · *Grumpy Monkey* · *After the Fall* · *Where the Wild Things Are*.

- Figma 내부 디자인 참고용으로는 통상 문제가 되지 않으나, **Mock 데모 웹 프리뷰 배포(Stage 0 C-18)** 와 앱 스토어 스크린샷에 그대로 나가면 **저작권 문제가 될 수 있다**
- Frontend 구현 판단 사항이 아니라 **사용자 확인 사항**으로 등록한다. Stage 8 배포 전에 결론이 필요하다
- 대안: 자체 제작 더미 표지 · 퍼블릭 도메인 표지 · 도형 placeholder

## 15. Library 범위 결정 (2026-10-06, user)

`docs/design/stage-3-library-figma-audit.md` 전수 대조와 §14 정정을 근거로 한 결정이다.
**네 건 중 둘에서 사용자가 Orchestrator 권고를 기각하고 Figma 쪽을 택했다** — 최우선 규칙("Figma 를 그대로 구현한다")에 일관된 선택이다.

| ID | 항목 | 결정 | 권고와 일치 |
|---|---|---|---|
| **L-D1** | 저장한 책(`★ Save`)의 표면 | **`Favorites` 섹션** (Figma L-1 `163:1632`/`163:1633` + 캐러셀 `145:779` + "See all") | ✅ |
| **L-D2** | `Reading now` 섹션 | **Figma 대로 구현** (L-2 `145:1145`, 345×118, r24, 표지 64×90 r10, 진행 바) | ❌ 권고는 "이번엔 제외" |
| **L-D3** | 책 평점 `Rated 4.5` | **Figma 대로 렌더** | ❌ 권고는 "미렌더 유지(`D-7`)" |
| **L-D4** | 상용 그림책 표지 에셋 | **지금은 그대로, 배포 전 교체** | ✅ |

### 15.1 `D-7` 은 이 결정들로 상당 부분 **뒤집혔다**

`D-7` 원문은 *"FR-20·FR-22 의 4기능만 — 보유책 · 증정책 · 기록 · 책별 Prompt 보기. Figma 의 평점 · Reading now · My Saved 는 구현하지 않고 허용 차이로 기록한다"* 였다.

| `D-7` 항목 | 현재 상태 |
|---|---|
| 평점 미구현 | **뒤집힘 — `L-D3` 으로 렌더한다** |
| `Reading now` 미구현 | **뒤집힘 — `L-D2` 로 구현한다** |
| `My Saved` 미구현 | `L-D1` 이 **`Favorites`** 를 택해 **해소**. `My Saved`(L-2 `145:1156`) 자체는 채택하지 않는다 |
| `Favorites` | `D-7` 이 **언급조차 하지 않았다**. `L-D1` 로 **채택** |

→ **`AD-S3-6`(평점 미렌더) · `AD-S3-7`(Reading now 미렌더) · `AD-S3-8`(My Saved 미렌더) 는 재정리 대상**이다.
→ `AD-S3-4` 는 §14.1 로 **이미 무효**다 (전제가 사실이 아니었다).

### 15.2 PRD 수정 대상이 늘어난다

Figma 를 택한 결과 PRD 에 없는 요구가 확정됐다. **`D-24` 절차**(OneDrive 원본 + 저장소 사본 동일 패스, `old/` 백업, 작업 후 `diff` 검증)로 반영한다.

| ID | 내용 | 사유 |
|---|---|---|
| **LN-1** | 책 단위 평점 | PRD `FR-12` 는 **세션 단위** 평점이다. 책 단위는 PRD 에 없다 → `L-D3` 으로 확정 |
| **LN-2** | 다회차 읽기 진행 (`3 of 5 nights`, `Last read Tue · 12 min`) | PRD 에 다회차 진행 모델이 없다 → `L-D2` 로 확정 |
| **LN-3** | 책 저장(favorite) | PRD 에 없는데 `A-9` 로 채택되고 **이미 구현**되어 있다 → `L-D1` 로 표면까지 확정 |

`LN-4`(역량 캡션 `Resilience`/`Confidence` 가 4대 역량 이름과 다름) · `LN-5`(항목별 세션 시작) 는 **아직 미결**이다.

### 15.3 Contract 영향 (`L-D2`·`L-D3` 채택으로 확정)

`packages/contracts` 에 **추가로** 필요해졌다 (전수 대조 §5 중 "채택 시에만 필요" 항목이 확정된 것):

- `averageRating` — `L-D3`
- `ReadingProgress` (진행률 · 마지막 읽은 시각 · 회차) — `L-D2`

기존 재사용 가능: `BookSummarySchema` · `BookOwnershipSchema`(**`favorite_only` 이미 존재** — `L-D1` 에 그대로 쓴다) · `SavedBookSchema` · `Pagination`.

### 15.4 `L-D4` — 표지 에셋 교체는 **Stage 8 배포 전 필수 항목**

- 개발 중에는 Figma 표지를 그대로 쓴다
- **Stage 8 Mock 데모 웹 프리뷰 배포(Stage 0 `C-18`) 전에 교체**한다. 앱 스토어 스크린샷도 같은 대상이다
- 대상: *The Most Magnificent Thing* · *Grumpy Monkey* · *After the Fall* · *Where the Wild Things Are*
- 교체 후보: 자체 제작 더미 표지 · 퍼블릭 도메인 표지 · 도형 placeholder

### 15.5 아직 결정되지 않은 Library 항목

전수 대조가 `DECISION-NEEDED` 로 올린 것 중 **이번에 결정되지 않은 것**이다. 구현 착수 전에 처리한다.

| ID | 항목 |
|---|---|
| 기준 화면 | L-1 / L-2 / L-3 중 최신 의도를 노드 ID 순서로 판정 불가. `L-D2` 채택으로 L-2 요소가 들어오므로 **합성 방식**이 필요하다 |
| ⑤ | `113:1991` `Selected` 변형(체크 배지 + `▶ Session` Tag) — 어느 화면에도 인스턴스가 없다 |
| ⑥ | `type=shelf`(`163:1898`) — 현행 spec 이 "폐기" 처리했으나 Figma 에 실재한다 (**Figma 에 있는 것을 빼는** 건) |
| ⑦ | 오버레이 형태 — Figma 는 좌우 inset 14 · radius 28 떠 있는 카드, 현행 `Sheet` 는 전폭 하단 고정 |
| ⑧ | Book List divider — 컴포넌트 3개 vs 화면 사본 1개 (Figma 내부 불일치) |
| ⑨ | scrim 값 — 실측 `rgba(0,0,0,0.34)` vs 현행 `--color-scrim`(.231). 교체하면 **Stage 2·3 기존 Sheet 5종이 모두 어두워진다** |
| ⑩ | `ListGroup` 면/그림자 — Figma 74% + `--shadow-bubble` vs 현행 90% + `--shadow-glass-rest`. Figma 를 택하면 **`R-SHADOW-1` inset 재계산 필요**(3겹 아래 77 → 1겹 아래 10) |
| LT-1 | `--color-fg-tertiary` → `--haru-ink-400`(#9aabaa). 현재 tertiary 가 secondary 와 같은 값이라 Figma 3단계 회색을 표현 못 한다 |
| LT-2 | `--radius-media: 12px` 신설 — 표지 radius 가 7/10/12 3종인데 현행 6단계는 8 다음이 16. **Stage 0 `#10-②`(6단계 고정) 변경 사안** |
| 대비 | Library 가 쓰는 `#9aabaa` 는 앱 배경 위 **1.56–2.23:1** — 기존 가값 `P-01`(2.58:1)과 **다른 새 사례** |
| 320px | 표지 3-up 이 성립하지 않는다 (3×107=321 > content 272). 비례 축소안이 `RECOMMENDED` 로 올라와 있다 |
| 진입점 | `/library/add` · `/library/gift-requests` 진입점이 Figma 에 **없다** → `C-13` 절차 (현행 `LibraryFooterActions` 는 Figma 근거 없는 명세) |
| 상태 화면 | Loading/Skeleton · Empty · Error/Offline/Retry 가 Figma 에 없다 → `#22` 에 따라 **명세 우선** 권고 |
