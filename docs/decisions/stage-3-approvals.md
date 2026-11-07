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

> 4번은 2026-10-03 v1.5 에 적용됐으나 §12.10 이 "접힘 3개 + 확장" 을 폐기해 **무효** — §12.5 9번으로 대체되어 ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md` 에서 교체됐다 (`S3-4` → `S3-9`).

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

> 5·6번은 2026-10-03 v1.5 에 적용 완료. **7번은 **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md`** (`S3-7`).

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

> ⚠️ **2026-11-07 확인**: 15건 중 Plan §15 **13번**("§6 핵심 흐름 ②" = 현 PRD §5.1 표 ②행)은 2026-10-03 에 **반영되지 않았다**. PRD v1.5 개정 3 (2026-11-07) 에서 적용했다 (`RW-13`, `docs/decisions/prd-v1.5-rev3-2026-11-07.md`).

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

> "16번" = §9.3 7번 (`S3-7`). ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md`.

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

> 8·9·10번 — ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md` (`S3-8`·`S3-9`·`S3-10`).

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

> 11번 — ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md` (`S3-11`, §13 "추천할 책 소진" 행 포함).

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

> 12번 — ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md` (`S3-12`).

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

## 16. Library 미결 항목 결정 — 1차 (2026-10-06, user)

`docs/plans/stage-3-library-plan.md` 가 올린 `L-OPEN-01`~`22` 중 **4건**이 결정됐다.

| ID | 항목 | 결정 | 권고와 일치 |
|---|---|---|---|
| **`L-OPEN-01`** | 기준 화면 합성 | **L-1 기준 + `Reading now` 합성** | ✅ |
| **`L-OPEN-12`** | `/library/add` · `/library/gift-requests` 진입점 | **design-agent 가 명세한다** (`C-13` ②) | ✅ |
| **`L-OPEN-18`** | `averageRating` 집계 범위 | **우리 아이 평점만** (자기 아이가 세션에서 남긴 평점의 평균) | ✅ |
| **`L-OPEN-06`** | 시트 scrim 값 | **Figma 값(`rgba(0,0,0,0.34)`)으로 전역 교체** | ❌ 권고는 "현행 유지" |

### 16.1 `L-OPEN-01` — 섹션 순서 확정

**`Reading now` → `Our curated shelf` → `Favorites` → `Finished together`**

근거(plan-agent 실측): L-1 의 세 섹션 위에 `Reading now` 블록(20 + 16 + 118 = 154, 다음 간격 16 → **+170**)을 얹으면
**L-2 content 자식의 실측 y 8개(`0/36/170/206/438/474/706/742`)가 전부 일치**한다.
즉 합성은 창작이 아니라 **L-2 의 기하에 L-1 의 라벨(`Favorites`)·"See all" 집합·4행 목록을 둔 것**이다.

- content `x=24 w=345 y=66` · 제목 행 h40 · Frame15 @y56 h **1039**(869+170) · Frame15→탭바 **32** · 섹션 간격 전부 **16**
- 세 섹션 모두 **"See all" 을 가진다** (L-1 기준 — `163:1626`·`163:1634`·`145:680`)
- `My Saved`(L-2 `145:1156`) 는 **채택하지 않는다** (`L-D1` 이 `Favorites` 를 택했다)
- 허용 차이 신규 등록 대상: `AD-L-01`(Reading now 추가) · `AD-L-02`(My Saved 미채택) · `AD-L-03`(슬롯 3·5 See all 유지) · `AD-L-04`(목록 4행) · `AD-L-05`(L-3 미사용) — **등록은 design-agent 가 spec 에 반영한 뒤**

### 16.2 `L-OPEN-12` — 진입점은 design-agent 명세

- Figma L-1~L-3 **어디에도 버튼·링크가 없다**. `FR-22`(증정 요청)·`FR-23`(책 추가)는 **PRD P0** 이므로 디자이너 판을 기다리면 **Stage 3 완료가 막힌다**
- **`C-13` ② 를 택한다** — design-agent 가 명세하고, 나중에 디자이너 Figma 가 도착하면 그것에 맞춘다
- 현행 spec 의 `LibraryFooterActions`(`design-spec.md:386`)는 **Figma 근거가 없는 명세**임이 확인됐다. 이 결정으로 **명세로서 정당화되지만**, 형태는 design-agent 가 다시 설계한다

### 16.3 `L-OPEN-18` — 평점은 "우리 아이 평점만"

- **전체 사용자 평균을 쓰지 않는다.** 카탈로그 전역 평균은 다른 가정과의 비교를 끌어들여 `rules/frontend.md` §8(진단·판정·비교 표현 금지)과 충돌한다
- Backend 요구(`P3-BIP-16`)에 **모집단 = 해당 Child 의 세션 평점으로 한정**을 명시한다. 표본 최소치·소수 자리·null 처리는 여전히 Backend 결정 대기
- `averageRating: null`(unrated)이면 meta 를 비우고 좌측 정렬을 유지한다 (`L-OPEN-22` 권고 — 별도 확정 필요)

### 16.4 `L-OPEN-06` — scrim 전역 교체 (영향이 Library 밖으로 나간다)

**사용자가 Orchestrator 권고("현행 유지")를 기각하고 Figma 값을 택했다.** 최우선 규칙에 일관된 선택이다.

- `--color-scrim` 을 현행 `#29293a3b`(불투명도 .231) → **Figma 실측 `rgba(0,0,0,0.34)`** 로 교체한다. 블러 없음
- ⚠️ **영향 범위가 Library 를 넘는다**: **Stage 2·3 의 기존 Sheet 5종이 전부 어두워진다**. Library 전용 토큰으로 분리하지 않는다(같은 역할에 두 값이 공존하는 것을 피한다)
- **따라오는 작업**:
  1. 해당 5종의 **시각 baseline 재검증·재생성** — `R-BASELINE-1` ⑤ 에 따라 diff 를 원인별로 분해하고 **scrim 외의 변화가 섞이면 멈춘다**
  2. scrim 위 라벨 **대비 재확인** — 어두워지면 대비는 올라가므로 기존 가값(`P-03`·`P-11`)이 완화될 수 있다. 완화되면 가값 목록을 갱신한다
  3. 색이 `#29293a`(남색 기운) → `#000000`(순검정)으로 **색조도 바뀐다**. 단순 불투명도 조정이 아님을 기록한다

## 17. Library 미결 항목 결정 — 2차 (2026-10-06, user)

| ID | 항목 | 결정 | 권고와 일치 |
|---|---|---|---|
| **`L-OPEN-14`** | 보유·증정(`ownership`) 표식 | **구분 표식 없이 간다** | ❌ 권고는 "design-agent 명세" |
| **`L-OPEN-03`** | "See all" 시트 ActionBar (`type=shelf`) | **Figma 대로 포함** (`AD-S3-19` 철회) | ✅ |
| **`L-OPEN-09`** | `--radius-media: 12px` | **신설** (radius 6단계 → **7단계**) | ✅ |
| **`L-OPEN-07`** | `Finished together` 목록 상자 면·그림자 | **Figma 대로** (74% + `--shadow-bubble`) | ✅ |

### 17.1 `L-OPEN-14` — 구분 표식을 만들지 않는다

**사용자가 Orchacestrator 권고를 기각했다.** Figma 에 없는 UI 를 만들지 않는 쪽(최우선 규칙 #2)을 택한 것이다.

- 화면의 표시 축은 **`curated` / `favorites` / `finished` 3개뿐**이다. `owned` / `gifted` 구분은 **목록에 표식으로 드러내지 않는다**
- **따라오는 영향**: 사용자는 목록에서 **증정받은 책과 직접 보유한 책을 구별할 수 없다**. 이것은 수용된 결과다
- `D-7` 의 "보유책 · 증정책" 중 **표시 측면은 범위에서 빠진다**. 단 **`FR-22` 증정 요청 기능 자체는 `/library/gift-requests` 화면으로 유지**된다 (`L-OPEN-12` 로 design-agent 명세) — 표식이 없다는 것과 기능이 없다는 것은 다르다
- Contract 의 `BookOwnershipSchema` 는 **그대로 둔다** (데이터는 존재하고, 표시만 하지 않는다). 나중에 표식이 필요해지면 토큰·컴포넌트만 추가하면 된다

### 17.2 `L-OPEN-03` — 시트 ActionBar 를 Figma 대로 넣는다

- Figma `163:1898`(`Prompt Card/Home` 변형 `type=shelf`)에 **헤더 + Book List + `Button/card`(★ Save + Start Session)** 가 실재하고, **L-3 에 실제 인스턴스**가 있다
- 현행 `design-spec.md:758` 의 "폐기" 처리와 `AD-S3-19`(ActionBar 제거)는 **Figma 에 있는 것을 빼는** 건이었다 → **`AD-S3-19` 철회**
- ⚠️ 시트의 `Start Session` 도 **`D-3` 에 따라 비활성(`aria-disabled`)** 이다 (approvals §13.10 — 실제 세션 시작은 Stage 4). Home 카드와 동일하게 처리한다
- `★ Save` 는 Home 과 같은 `SaveButton` 을 쓴다 (`G-14` 저장 상태 포함)

### 17.3 `L-OPEN-09` — `--radius-media: 12px` 신설 (Stage 0 `#10-②` 변경)

- Figma 표지 radius 가 **7 / 10 / 12** 3종인데 현행 스케일은 8 다음이 16 이다. **12 는 8(Δ−4)·16(Δ+4) 어느 쪽으로도 동점**이라 자동 흡수가 성립하지 않는다
- **radius 스케일을 6단계 → 7단계로 확장**한다. Stage 0 `#10-②`("radius 6단계 고정")를 이 결정으로 **개정**한다
- 7 / 10 의 처리(별도 토큰인지 `--radius-media` 로 흡수인지)는 design-agent 가 실측 근거로 제안한다

### 17.4 `L-OPEN-07` — 목록 상자를 Figma 대로 (⚠️ `R-SHADOW-1` 재산정 필수)

- Figma: 면 **74%** + **`--shadow-bubble`**(1겹) ↔ 현행 `ListGroup`: 90% + `--shadow-glass-rest`(3겹)
- **Figma 를 따른다.** `ListGroup` 에 `tone="glass"` 류 변형을 추가하되, 기존 사용처의 외형은 바꾸지 않는다
- ⚠️ **그림자 번짐이 3겹 → 1겹으로 줄어든다**: 아래 **77 → 약 10**. `.claude/rules/frontend.md` `R-SHADOW-1` ③ 에 따라 **추정하지 말고 픽셀 프로브로 실측**해 inset 을 다시 산정한다
- 이 변경은 Home 의 트랙 inset(상 24 / 하 80)과 **무관하다** — Home 카드는 여전히 3겹 `--shadow-glass-rest` 다. **두 값을 섞지 않는다**

## 18. Library 미결 항목 결정 — 3차 (2026-10-06, user)

### 18.1 권고 일괄 채택 8건

사용자가 **"전부 권고대로"** 로 일괄 승인했다. 각 항목의 근거는 `docs/plans/stage-3-library-plan.md` §5·§6 에 있다.

| ID | 결정 |
|---|---|
| `L-OPEN-02` | `Selected` 변형(`113:1991`) **구현하지 않는다** — 어느 화면에도 인스턴스가 없어 "Figma 에 있는 것을 빼는" 건이 아니다 |
| `L-OPEN-05` | Book List divider 는 **모든 행 사이**에 둔다 (컴포넌트 `163:2145` 기준. 화면 사본이 2개를 잃은 것으로 보인다) |
| `L-OPEN-11` | 320px 는 **표지 비례 축소** — content × 107/345 → 320 에서 **84.3**, 480 컬럼에서 **134**. Figma 그리드가 퍼센트 기반(35.06%/69.25%)이라는 실측 근거. **캡션 타이포는 축소하지 않는다** |
| `L-OPEN-13` | 상태 화면(Loading/Skeleton · Empty · Error/Offline/Retry)은 **design-agent 명세** (`C-13` ② · Stage 0 `#22` 명세 우선) |
| `L-OPEN-15` | `Favorites` 캐러셀 캡션 2행 = **`LibraryBook.capability`(역량명)**, 없으면 저자명. Figma `145:779` 가 `113:1994`(curated)와 **override 0건 동일 인스턴스**라 저장 책의 캡션을 정의하지 않는다 |
| `L-OPEN-19` | "See all" 은 **세 섹션 모두** (L-1 기준 유지) |
| `L-OPEN-21` | `Finished together` 는 **4행 고정 + "See all" 전체 목록**. 섹션 안 "Show more" 를 **만들지 않는다** (최우선 규칙 #2) |
| `L-OPEN-22` | `averageRating: null`(unrated) 이면 **meta 를 비우고 좌측 정렬 유지** |

### 18.2 `L-OPEN-08` · `L-OPEN-10` — 연한 회색은 Figma 유지 + 가값 등록

- `--color-fg-tertiary` 를 **`--haru-ink-400`(`#9aabaa`)** 으로 재매핑한다. 현재 tertiary 가 secondary 와 **같은 `ink-500`** 이라 Figma 의 3단계 회색을 표현할 수 없고, 재매핑 없이는 화면 코드가 raw HEX 를 쓰게 되어 `rules/frontend.md` §6 위반이다
- 이 색의 앱 배경 위 대비는 **1.56~2.23:1** 로 **WCAG AA(4.5:1) 미달**이다. 사용처: `See all` · 역량 캡션 · 행 메타 · chevron
- **결정: Figma 값을 유지하고 가값(provisional)으로 등록한다.** 2026-09-22 `P-02` 결정("접근성 미달 값도 Figma 를 따르되 `provisional` 표시를 남겨 나중에 토큰 값만 바꾼다")과 **같은 방식**이다
- 기존 `P-01`(`#7d9291`, 2.58:1)과 **다른 새 사례**이므로 **새 가값 ID 를 부여**한다. 토큰 정의에 `provisional` 주석을 남기고, 디자이너 확인을 병행 요청한다
- 가값 재제시는 Stage 0 `#10-4` 절차에 따라 **항목별로** 한다

### 18.3 `L-OPEN-16` · `L-OPEN-17` — 진행률은 서버가 직접 준다

- Figma 진행 바 채움이 **132/239 = 55.2%** 인데 표시 문구는 **`3 of 5 nights`(60%)** 다. **산식이 일치하지 않는다**
- **결정: 서버가 `progressRatio` 를 명시 전달하고 Frontend 는 받은 비율만 그린다.** 프론트에서 회차로 계산하지 않는다
- **계획 회차(`plannedNights`, 위 예시의 `5`)의 출처가 PRD·Figma 어느 문서에도 없다.** 값이 없으면 **회차 문구를 생략**한다 (nullable). 그 텍스트는 **비대화형**이다
- `P3-BIP-17` 에 다음을 Backend 요구로 명시한다: `progressRatio` 산식 · `plannedNights` 출처 · "Reading now" 대상 책 **선정 규칙**

### 18.4 `L-OPEN-20` — 저장/해제 API 응답은 **현행 유지**

**사용자가 plan-agent 권고(`SavedBook` → `LibraryBook` 전환)를 기각했다.**

- `PUT`/`DELETE …/saved-books` 응답 타입을 **바꾸지 않는다**
- 근거: 전환은 **Home 의 `SaveButton` 경로를 건드린다** (`MockLibraryApi`·`useToggleSavedBook`·`saved-book.test.ts`). Home 은 방금 재구현·검증을 마쳤고(커밋 `9173b2b`) 회귀 위험을 다시 들이지 않는다
- **대가**: Library 는 저장/해제 후 **캐시를 직접 갱신하지 못하고 목록을 다시 불러와야 한다**. 이것은 수용된 결과다
- `P3-BIP-15`(해제 표면이 생겨 `DELETE` 경로가 처음 실사용된다)는 그대로 유지된다

### 18.5 `L-OPEN-04` — 오버레이는 Figma 대로 떠 있는 카드

- **Figma 대로** 구현한다: **좌우 inset 14 · radius 28(전체 모서리) 의 떠 있는 카드**. 현행 `Sheet`(전폭 하단 고정)에 **변형을 추가**하며 **기존 사용처의 외형은 바꾸지 않는다**
- **세로 앵커는 내용 높이에 맞춘다.** Figma 내부가 어긋나 있어(L-2 하단 **37** ↔ L-3 하단 **4**) 고정값을 고를 근거가 없었는데, **시트 높이가 내용에 따라 정해지고 아래 여백만 고정**이면 두 화면의 차이가 **내용 분량 차이로 설명된다**
- 아래 여백 고정값은 design-agent 가 실측 근거로 제안한다. 두 값(37 · 4) 중 하나를 그대로 쓰는 것이 아니다
- ⚠️ 떠 있는 카드가 되면 **그림자가 좌우·하단으로 번진다**. `R-SHADOW-1` 에 따라 **inset 과 클리핑 박스를 함께 설계**한다 — `AppColumn` 안쪽 `overflow-*` 금지 규칙의 예외는 현재 `Carousel` 1건뿐이므로, 시트가 `overflow` 를 필요로 하면 **별도 승인 대상**이다

---

## 19. Library 결정 완료 — `L-OPEN-01`~`22` 전건 처리 (2026-10-06)

`docs/plans/stage-3-library-plan.md` 가 올린 미결 **22건 전부**가 §16·§17·§18 에서 결정됐다.
**사용자가 Orchestrator 권고를 기각한 것은 4건**이다 (`L-OPEN-06` scrim 전역교체 · `L-OPEN-14` 표식 없이 · `L-OPEN-20` 응답 현행유지 · 그리고 §15 의 `L-D2`·`L-D3`).

### 19.1 design-agent 가 받을 선행 작업 (구현 전 필수)

1. **`R-SHADOW-1` inset 재산정 2건** — ① `L-OPEN-07` 목록 상자(3겹 → 1겹, 아래 77 → 약 10) ② `L-OPEN-04` 떠 있는 시트. **추정 금지, 픽셀 프로브 실측**
2. **scrim 전역 교체의 파급** (`L-OPEN-06`) — Stage 2·3 기존 Sheet **5종** baseline 재검증. `R-BASELINE-1` ⑤ 에 따라 diff 를 원인별로 분해하고 **scrim 외 변화가 섞이면 멈춘다**
3. **radius 7단계 개정** (`L-OPEN-09`) — Stage 0 `#10-②` 개정 반영. 7 / 10 의 처리 방식 제안
4. **새 가값 ID 부여** (`L-OPEN-08`·`10`) — `#9aabaa` 대비 1.56~2.23:1. `P-01` 과 별개 사례
5. **`AD-S3-*` 재정리** — `AD-S3-4` **무효 삭제**(+ `design-spec.md:383`·`:1286` 수정) · `AD-S3-6`·`AD-S3-7`·`AD-S3-8` **무효** · `AD-S3-19` **철회** · `:386` `LibraryFooterActions` 근거 보정 · 신규 `AD-L-01`~`05` 등록
6. **`AD-S3-5` 보완** — 역량 표시 라벨이 Figma 캡션보다 길어 **11px 1줄에 안 들어간다** → 줄바꿈/말줄임 규칙 명세 필요

### 19.2 PRD 수정 대상 누적 (적용은 승인 후 `D-24` 절차)

| ID | 내용 |
|---|---|
| `LN-1` | 책 단위 평점 (PRD `FR-12` 는 세션 단위) — **"우리 아이 평점만"** 으로 범위 확정 (§16.3) |
| `LN-2` | 다회차 읽기 진행 — `progressRatio` 는 **서버 전달**, `plannedNights` 는 **nullable** (§18.3) |
| `LN-3` | 책 저장(favorite) 및 그 표면 `Favorites` |
| `LN-6` | PRD §6.1:270 하단 탭이 *"서재·세션·리포트 3탭"* — 확정 구조는 Library / Home(중앙) / Progress (`#15`·`D-02`) |
| `LN-7` | PRD §6.1:276 서재 설명에 `Favorites`·`Reading now`·평점이 없다 |

`LN-4`(역량 캡션 이름) · `LN-5`(항목별 세션 시작) 는 **여전히 미결**이다.

> `LN-1`·`LN-2`·`LN-3`·`LN-6`·`LN-7` — ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md`. `LN-4`·`LN-5` 는 미결이라 **보류**.

### 19.3 신규 `BACKEND_INTEGRATION_PENDING`

`P3-BIP-16`(책 평점 집계 — **모집단 = 해당 Child 세션 평점으로 한정**) · `P3-BIP-17`(다회차 진행 — `progressRatio` 산식·`plannedNights` 출처·"Reading now" 선정 규칙) · `P3-BIP-18`(서재 섹션 1회 조회) · `P3-BIP-19`(표지 에셋 교체 게이트 — **Stage 8 배포 전 필수**, `L-D4`)

### 19.4 ⚠️ §16.4 정정 — scrim 교체의 파급을 Orchestrator 가 잘못 적었다 (2026-10-06)

§16.4 와 §19.1 ② 에 Orchestrator 가 적은 두 전제가 **사실이 아니다.** design-agent 가 지적하고 Orchestrator 가 코드로 직접 확인했다.

| §16.4 의 서술 | 실제 (검증 방법) |
|---|---|
| *"Stage 2·3 의 기존 Sheet 5종이 전부 어두워진다"* | **그 5종은 전부 미구현이다.** `ReadingContextSheet`·`LibraryShelfSheet`·`BookDetailSheet` 파일이 존재하지 않는다 (`find` 결과 없음). `P-05` 대장의 5종은 **설계 목록**이었다 |
| *"해당 5종의 시각 baseline 재검증·재생성"* | **재생성 대상 0건.** `e2e/visual.spec.ts` 에 `sheet`·`dialog`·`scrim` 문자열이 **0건**이다 — **열린 Sheet/Dialog/Scrim 을 담은 baseline 이 없다**. `R-BASELINE-1` ⑤ 의 적용 대상 자체가 없다 |
| *"기존 가값 `P-03`·`P-11` 이 완화될 수 있다"* | **둘 다 scrim 과 무관하다.** `stage-0-approvals.md:104` **`P-03` = focus ring `--color-focus-ring`**(2026-09-22 확정) · `:112` **`P-11` = glass·tinted 표면 위 `text-button`(#5e7370) 4.18–4.48:1**. **scrim 의 가값은 `:106` `P-05`**("디자이너 대기") 다 |
| *"어두워지면 대비는 올라간다"* | **반대다.** `Scrim` 은 자식 없는 `aria-hidden` 장식 레이어이고 **scrim 위에 직접 올라가는 텍스트·아이콘이 없다**. 콘텐츠는 그 위 **90% 흰 시트 면**에 있으므로, scrim 이 어두워지면 면이 미세하게 어두워져 시트 면 위 본문(`#4a5f5c`) 대비가 **6.50 → 6.29** (상단) 로 **내려간다**. AA 여유 1.6 이상 |

**실제 scrim 렌더 지점** (`--color-scrim` 참조점은 `Sheet.tsx:59` · `Dialog.tsx:62` **2곳뿐**, 컴포넌트 코드 변경 0):
`SignUpForm` `SelectTrigger` 시트 3 + `ChildInfoStep` 4 + `SettingsMenu` `ConfirmDialog` 1 = **8 인스턴스 / 2화면 + 설정**

**결론**: `L-OPEN-06`(scrim 전역 교체) 결정 자체는 **유효하다.** 파급이 Orchestrator 가 적은 것보다 **작다**. 다만 **회귀 감시가 비어 있다**:
→ `s3-sheet-scrim` · `s3-dialog-scrim` baseline **신규 추가 권고** (승인 필요 — design-agent 가 지금 추가하지 않았다)
→ **`L-NEW-09`**: `P-05` 의 근거가 "DESIGN_TOKEN_MAP 제안" → **"Figma 실측"** 으로 바뀌므로 **가값 해제 제안**

### 19.5 ⚠️ §17.4 정정 — inset 적용 위치

§17.4 는 `L-OPEN-07` 의 inset 을 `Finished together` 목록 상자에 거는 것으로 읽혔으나, **적용 위치가 다르다.**

- **페이지 위의 `Finished together` 목록에는 inset 이 필요 없다.** 스크롤 컨테이너가 `AppShell` 뷰포트(**앱 컬럼 바깥**, 뷰포트 전폭)라 **클립 선이 화면 밖**이다 (`R-SHADOW-1` ④)
- **inset 이 실제로 필요한 곳은 `LibraryShelfSheet` 안**이다 — `.haru-sheet__content { overflow-y: auto }`(기존 선언)가 "See all" 전체 목록을 스크롤하면서 `ListGroup` 그림자를 자른다
- **`L-OPEN-04` 떠 있는 시트 자신에게도 inset 이 필요 없다** — `createPortal(document.body)` + `position: fixed` 이고 조상에 `transform`/`filter`/`contain` 이 없어 `useBodyScrollLock` 의 overflow 가 fixed 를 클립하지 않는다. 393 에서 좌우 번짐 50 중 36 이 뷰포트 밖으로 나가지만 **클립 선이 화면 가장자리**라 보이지 않는다 (Figma 도 393 프레임에서 같은 양이 잘린다)

**실측값** (빌드된 앱 CSS 로 측정 — `packages/design-tokens/dist/index.css` 는 `@theme static` 소스 번들이라 브라우저가 무시하므로 그 파일로 재면 `boxShadow: none` 이 나온다. **측정 함정으로 기록**):

| 그림자 | 아래 | 위 | 좌우 | 비고 |
|---|---|---|---|---|
| `--shadow-glass-rest` (3겹) | **78** | **22** | **50** | 기록값(하 77 / 상 22)과 세로 ≤1px 일치 → **방법 검정됨** |
| `--shadow-bubble` (1겹) | **10** | **0** | **4** | §17.4 의 "약 10" 예상 적중. 1겹이라 누락할 겹이 없다 |
| `--shadow-cover` | 20 | 8 | 14 | 캐러셀용 |

보정 레시피 실증: 보정 없으면 `overflow-y:auto` 안 자식의 아래·우측 Δ 프로파일이 **전부 0**(완전 클립), 보정(`padding: 0 4 10 4` + 음수 margin + border-box 크기 가산) 후 아래 **10** · 우측 **4** **완전 복원**.

### 19.6 ⚠️ `L-NEW-08` — 기존 그림자 기록의 임계값이 섞여 있다

`--shadow-glass-rest` 의 **좌우 기록 `28~32` 는 Δ≥8 기준**이고, **세로 기록 `77/22` 는 Δ≥1 기준**이다. **같은 Δ≥1 에서 좌우는 50** 이다.
→ Home 가로 트랙의 가로 여유가 기록보다 작게 잡혀 있다. 다만 **gutter(24) bleed 로 뷰포트까지 밀어내 보이는 클립은 없다** → **즉시 결함은 아니다.**
→ 기록을 정정하고, Home 가로 트랙 여유는 **재검토 대상**으로 남긴다. 임계값을 명시하지 않은 그림자 수치는 앞으로 쓰지 않는다.

## 20. Library Plan · Design Spec 승인 + `L-NEW-*` 결정 (2026-10-06, user)

### 20.1 승인

- **`docs/plans/stage-3-library-plan.md` APPROVED (2026-10-06, user)**
- **`docs/design/stage-3-library-design-spec.md` APPROVED (2026-10-06, user)**
- 승인에 **`L-NEW-01` 표지 캐러셀 `overflow-x` 예외**가 포함된다 — `AppColumn` 안쪽 `overflow-*` 금지의 **두 번째 예외**(첫 번째는 Home 가로 트랙). 조건: ① 그림자 보호 구조(`R-SHADOW-1` ②) ② **세로·가로 양축 픽셀 프로브 회귀 테스트**(`R-SHADOW-1` ⑥) ③ 근거 주석
- → development-agent 구현 단계로 진행한다

### 20.2 `L-NEW-*` 결정

| ID | 항목 | 결정 | 권고와 일치 |
|---|---|---|---|
| `L-NEW-02` | `ReadingNowCard` `overflow: clip` | **clip 을 걸지 않는다** — 표지 그림자를 살리고 Figma 와의 차이를 허용 차이로 등록 | ✅ |
| **`L-NEW-06`·`L-NEW-07`** | `ListGroup`·`ListRow` **기본값**이 Figma 와 다름 | **지금 함께 정규화한다** | ❌ 권고는 "다음 라운드" |
| `L-NEW-09` + 감시 | scrim | **감시 baseline 신규 추가 + `P-05` 가값 해제** | ✅ |
| `L-NEW-03` | 떠 있는 시트 아래 여백 | **`calc(var(--space-3-5) + var(--layout-safe-bottom))`** = 14 + safe-area | ✅ |
| `L-NEW-04` | `type=shelf` 하단 padding | **13 → 16** (`--activity-card-pad-bottom` 재사용, Δ+3) | ✅ |
| `L-NEW-05` | 표지 합성 연출 | **Figma 대로** — 캐러셀 = 베이스 + 베이크된 제목 + 표지 opacity 80, Book List 썸네일 = 틸 그라데이션 + 표지 opacity 60 → `AD-L-08` | ✅ |
| 320px | Book List 메타 2열 겹침 | **제목만 말줄임**(`min-inline-size:0` + `line-clamp:1`), **평점은 줄이지 않는다** | ✅ |
| 문구 | 진입점·상태 화면 영어 문구 | **design-agent 제안대로** | ✅ |

### 20.3 ⚠️ `L-NEW-06`·`L-NEW-07` 을 지금 고치는 것의 파급

**사용자가 Orchestrator 권고("다음 라운드")를 기각하고 지금 정규화를 택했다.**

원인: **Stage 2 가 Figma 실제 노드를 보지 않고 추정으로 기본값을 정했다.**
- `L-NEW-06` `ListGroup` 기본 면·그림자 — Stage 2 가 **90% + `--shadow-glass-rest`** 를 `RECOMMENDED`("symbol 에 컨테이너가 없음")로 **추측**했는데, 실근거 `30:140` 은 **74% + 1겹**이다 (`get_variable_defs` 확인)
- `L-NEW-07` `ListRow` 기본 title — Stage 2 가 텍스트 **높이 17** 로 `13`(`footnote`)을 추정했으나 실제 `font-size` 는 **14** 다 (`text-[14px]` 원문 확인). §3.3 흡수표는 `14 → subheadline`(15) CONFIRMED

**따라오는 작업**:
1. **Stage 2 Settings 화면의 시각 baseline 이 바뀐다.** `R-BASELINE-1` ⑤ 에 따라 **diff 를 원인별로 분해**하고, 정규화 외의 변화가 섞이면 **멈춘다**
2. `ListGroup` 그림자가 3겹 → 1겹으로 바뀌면 **Settings 쪽 번짐도 아래 78 → 10 으로 줄어든다.** 기존에 그림자 공간을 확보해둔 곳이 있으면 함께 조정
3. 이 정규화는 **Library 변형(`tone="glass"`)을 불필요하게 만들 수 있다** — 기본값이 Figma 와 같아지면 변형이 필요 없다. development-agent 가 판단해 보고한다

### 20.4 신규 가값 `P-24` — 연한 회색 대비 (AA 미달 7 사용처)

`L-OPEN-08`·`L-OPEN-10` 결정(§18.2)의 구체화다. `P-01`~`P-23` 이 전부 소비되어 **`P-24`** 를 부여한다.

| 사용처 | 유효 배경 | 최악 대비 |
|---|---|---|
| `See all` 12px · 캐러셀 캡션 11px · `3 of 5 nights` 12px | 앱 배경 직접 | **1.56** |
| Book List 메타 11.5px · `Rated 4.5` · chevron 15px | glass 74% 위 | 2.15 |
| `ReadingNowCard` 메타 11.5px | strong 90% 위 | 2.30 |
| 시트 안 Book List 메타 | 시트 90% over scrim .34 | 2.16 |

**최악 1.56:1 ~ 최선 2.38:1 — 전부 AA(4.5) 및 대형 텍스트 기준(3.0) 미달.** chevron 의 비텍스트 기준(3.0) 미달도 포함한다 (단 행 전체가 버튼이고 접근성 이름이 책 제목이라 chevron 단독으로 전달하는 정보는 없다).
토큰 정의에 `/* provisional: P-24 */` 주석 + dev gallery `provisionalItems.ts` 등재. 재제시는 Stage 0 `#10-4` 절차.

### 20.5 `LN-4` 보강 — Figma 자신이 역량 이름을 일관되게 쓰지 않는다

design-agent 가 이번 패스에서 새로 발견했다:
- 캐러셀 `113:1975`/`1980`/`1985` = **`Emotion` / `Resilience` / `Confidence`**
- **`ReadingNowCard` `145:1149` = `Self-Direction`** (= Stage 0 `#14` 의 표시 라벨 그 자체)

→ `AD-S3-5`(역량 캡션을 4대 역량 표시 라벨로 교체)의 **근거가 강해진다**. `LN-4` 자체는 **여전히 미결**이다.

## 21. Library 1라운드(토대) 완료 + 후속 결정 (2026-10-07)

구현: `docs/qa/stage-3-library-r1-handoff.md`. Orchestrator 독립 검증 — 8개 명령 전부 통과, `test:e2e` **191 passed / 0 failed**.

### 21.1 `ListGroup`·`ListRow` 변형을 만들지 않았다 (채택)

`L-NEW-06`·`L-NEW-07` 정규화로 **기본값 == Library 값**이 되어 `tone="glass"`·`titleVariant` 가 가리킬 차이가 사라졌다.
변형을 남기면 *"기본값은 틀렸고 Library 만 맞다"* 는 잘못된 전제를 코드에 고정한다. Settings·온보딩도 **같은 Figma 심볼 `163:2145`** 를 쓰므로 정규화가 그쪽에도 옳은 값이다. 가드 테스트가 변형 부활을 막는다.
그림자 공간을 미리 확보해 둔 곳은 **없었다** (`--carousel-shadow-inset*` 은 Home 가로 트랙 전용) → 조정 불필요.

### 21.2 재생성 baseline 4건 — 원인 전부 규명 (`R-BASELINE-1` ⑤·⑥ 준수)

| baseline | 원인 |
|---|---|
| `v9-text` · `v8-color-semantic` | `LT-1` — `#7d9291` → `#9aabaa`. **Δ 29/25/25 가 색 변화와 정확히 일치** |
| `s2-listrow` | `L-NEW-06`·`L-NEW-07`. 위쪽 그림자 소멸(glass-rest 위 22 → bubble 위 0) 포함 |
| `s2-deck-books-favorites` | 〃 + 그림자 번짐 축소(아래 78→10, 좌우 50→4) |

**`+4px` 를 추정으로 적지 않고 런타임 토글로 재현했다**: 2행 제목이 폭 100.86px 에서 2줄로 접히고 line-height 18 → 20 → `(20−18)×2 = +4`. 1·3·4행은 `min-block-size: 56` 또는 trailing(IconButton 38)이 높이를 정해 불변.
→ **설명되지 않는 클러스터 0건.** Orchestrator 확인: **Home baseline 7종은 변경 0** (`--book-cover-radius-xl` 10 = 구 `--space-2-5` 10 → 렌더 변화 없음).

신규 baseline 5건: **`s3-sheet-scrim` · `s3-dialog-scrim`**(§19.4 의 감시 공백을 메움) · `s3-section-header` · `s3-book-cover` · `s3-list-media`. 둘 다 `settle()` + `hideDevPanel` 적용.

### 21.3 결정 — Book List 좌측 메타 (2026-10-07, user)

320px 에서 좌측 메타(`4 sessions · finished May 2`)가 우측 `Rated 4.5` 와 겹친다. §20.2 는 "제목만 말줄임 · 평점은 유지"만 정했고 **좌측 메타는 미정**이었다.

**결정: 좌측 메타는 자르지 않고 줄바꿈한다.** 자르면 `finished {date}` 가 사라진다. 320px 에서만 행 높이가 늘고 `AD-S3-17` 이 그 증가를 허용한다. **평점은 줄이지 않는다**(§20.2 유지).

### 21.4 기록 정정 — Plan §7.2 `BookPrompts` 필드 목록이 낡았다

Plan §7.2 가 `BookPrompts` 에 **`coachingLine`** 을 적고 있으나, 그 필드는 **approvals §12.14 로 삭제**됐다 (`ActivityCardOption.coachingLine`·`PromptSet.coachingLine` 제거, `coachingNote` 로 대체).
구현은 되살리지 않고 **`{ bookId, promptSet }`**(`PromptSet` 재사용)으로 했다 — 올바른 판단이다. **Plan §7.2 를 수정 대상으로 기록한다.**

### 21.5 ⚠️ 기존 공백 — dev gallery 가값 목록에 `P-18`~`P-23` 이 없다

`P-23`(`--color-prompt-tag-fg`) 등 **Home 라운드에서 만든 가값이 dev gallery `provisionalItems.ts` 에 등재되지 않았다.** Library 범위 밖이라 1라운드가 고치지 않았다 (옳은 판단).

→ **가값 재제시(Stage 0 `#10-4`) 전에 반드시 메운다.** 목록이 불완전하면 항목별 재제시 자체가 성립하지 않는다. 이번에 추가된 **`P-24`** 는 등재됐다.

### 21.6 dev Scenario Panel 넘침 수정 (범위 내 처리)

library 시나리오 키가 6 → 18 로 늘어 패널이 뷰포트를 벗어나 `scenarios.spec.ts` 가 실패했다. 본문을 `max-block-size: 60dvh` + `overflow-y: auto` 로 바꿨다.
dev 전용이고 상자 안에 그림자 요소가 없어 `R-SHADOW-1` 대상이 아니다 (근거 주석 포함). **Production 영향 0** (`assert:no-mocks` 통과).

## 22. Library 2라운드-1 (`/library` 본 화면) 결과와 결정 (2026-10-07)

구현: `docs/qa/stage-3-library-r2-handoff.md`. 시트·진입점 화면은 **다음 작업**이다.

### 22.1 확정 결정 (user)

| ID | 항목 | 결정 | 권고와 일치 |
|---|---|---|---|
| `L-R2-01` | `BookCover` `sm`·`md` 구조적 결함 | **지금 전부 고친다** | ✅ |
| `L-R2-02` | `SectionHeader` 높이 22 ↔ Figma 20 | **22 로 두고 허용 차이 등록** | ✅ |

**`L-R2-01`** — 표지 이미지의 원본 종횡비가 세로로 길면 **상자 높이를 밀어 올리는** 결함이다 (`lg` 에서 151 → **152.97** 로 관측). 2라운드-1 이 `lg` 만 `position: absolute` 로 고쳤고 `sm`·`md` 는 **Home 시각 baseline 이 걸려 손대지 않았다**(옳은 판단 — 범위 밖 변경을 피했다).
→ **이제 `sm`·`md` 도 고친다.** Home baseline 이 바뀔 수 있으므로 **`R-BASELINE-1` ⑤** 를 지킨다: diff 를 **픽셀 클러스터로 분해**해 원인을 대고, **이 결함 수정으로 설명되지 않는 변화가 섞이면 멈춘다.**

**`L-R2-02`** — `--text-headline--line-height` 가 22 라서 나온 **결과값**이고, 명세가 20 을 직접 박는 것을 금지한다. **토큰 일관성을 택하고 2px 차이를 허용 차이로 등록**한다 (ID 는 design-agent 가 `AD-L-*` 로 부여).

### 22.2 Orchestrator 가 받아들인 판단 3건 (별도 승인 불필요)

1. **Error 상태를 `ErrorState` 1개로** — Design Spec §7.4 는 "섹션 본문 자리에 `ErrorState` + Retry" 였으나, 단일 조회(`GET …/library/overview`)라 실패 시 네 섹션이 **동시에** 빈다. 섹션마다 두면 **같은 refetch 를 가리키는 Retry 가 4개**, `announce="alert"` 가 **4번** 울린다.
   → `h1 Library` 는 `LibraryTopBar` 가 **router TopBar 슬롯**에서 담당하므로 **에러 상태에서도 제목이 남는다** (Orchestrator 코드 확인). 렌더하지 않은 것은 **섹션 헤더**다. 판단 타당.
2. **`favorites-empty` 아이콘 `star` → `book`** — `star` 는 `A-23`(§13.2) 으로 registry 에서 **의도적으로 제거된 글리프**이고 "성취·평점 언어" 라는 사유가 붙어 있다. 되살리지 않은 것이 맞다.
3. **`home-stage3.test.tsx` 1건 갱신** — 기존 기대값이 *"`/library` 는 탭바 마운트 자리만 잡는다(= `EmptyState` 1개)"* 라는 **과도기 상태 단정**이었고 본문이 생긴 지금 **사실이 아니다**. 새 단정은 `h1` 을 유지하면서 `h2` 섹션 마운트까지 확인하므로 **더 강하다** (Orchestrator diff 확인 — 테스트 약화 아님).

### 22.3 Design Spec 실측 정정 2건 (수정 대상)

**`[추정]` 이 실측과 달랐다.** 2라운드-1 이 브라우저에서 직접 재서 바로잡았다.

| 위치 | 명세의 `[추정]` | 실측 |
|---|---|---|
| §6.3 역량 캡션 폭 | `118`·`112` → **"11px 1줄 불가"** | SF Pro 기준 `Emotion Regulation` **101.44** · `Self-Direction` **72.80** · `Cognitive Flexibility` **101.98** · `Intrinsic Motivation` **99.98** → **107(Figma 393)에서 네 라벨 모두 1줄**(여유 5~7px). **2줄은 320px(열 84.36)에서만** 발동 |
| §8.2 캐러셀 열 간격 % | 명세의 퍼센트가 **§3.3 실측 offset 과 모순**이고 합도 자기 기술과 불일치 | 실측 offset 역산 **`4.0429%` / `3.1809%`** → 검산 `107.000 / 120.948 / 238.922 / +0.922` **완전 일치** |

적용 규칙: 캡션 최대 **2줄 + 말줄임**, `break-word` 미사용(최장 단어 `Regulation` 55.56 < 84.36), 제목은 Figma 대로 1줄, **별도 `aria-label` 미생성**(clamp 는 DOM 텍스트를 숨기지 않는다), **11px 축소 금지**(e2e 로 고정).

### 22.4 캐러셀 그림자 — 승인값이 실측과 일치했다

**`--shadow-cover` 는 2겹**(`rgb(94 115 112 / .28) 0 6px 14px` + `rgb(255 255 255 / .5) 0 1px 0 inset`)이고 **빠뜨린 겹이 없다.**

| 임계값 | 위 | 아래 | 좌 | 우 |
|---|---|---|---|---|
| Δ≥1 | **8** | **20** | **14** | **14** |

→ Design Spec §8.2 의 20/8/14 와 일치. `padding-block-start: --space-2` / `-end: --space-5` + 음수 margin, 좌우 14 는 gutter(24) bleed 로 흡수. `block-size` 는 미선언(표지 높이가 `aspect-ratio` 파생이라 content box 자동) — **가산 보정 불필요**, 가로는 `inline-size` 선언이라 가산.

**프로브 민감도를 역검증했다** (`R-SHADOW-1` ⑥ 의 취지): `padding-block-start` 제거 → **위** 4폭 전부 `delta 0` 실패 / gutter bleed 제거 → **좌** 4폭 전부 `delta 0` 실패. 즉 테스트가 실제로 문다.

### 22.5 `R-BASELINE-1` 이 또 한 번 작동했다

신규 baseline 6건(`s3-library` · `-reading-now` · `-shelf` · `-list` · `-favorites-empty` · `-empty`) 중
**`s3-library-list` 의 첫 생성본이 sticky 탭바에 가려진 채 찍혔다.** 스크롤 컨테이너가 `document.scrollingElement` 가 아니라 **`AppShell` 뷰포트**인 것을 반영해 끝까지 내려 재생성하고, **겹침 ≤ 0 단언을 테스트에 넣었다.**
→ `R-BASELINE-1` ② 의 "덮개가 함께 찍힌다" 유형이며, **저장 후 육안 확인** 단계가 잡아냈다.

**기존 baseline 재생성 0건. Home baseline 7종·Home 코드 변경 0건** (Orchestrator 확인).

### 22.6 부수 수정 2건 (보고 수용)

1. **다음 페이지가 오른쪽 gutter 에 비쳤다** — Figma 캐러셀에는 peek 이 **없다**(Home 트랙의 peek 8 과 다르다). `column-gap: var(--layout-gutter)` 로 page2 를 뷰포트 끝(393)에 붙이고 스냅 stride 도 gap 포함으로 수정
2. `BookCover` `lg` 표지 높이 결함 (→ `L-R2-01` 로 `sm`·`md` 까지 확장)

### 22.7 승인된 흡수의 산술 결과 (Figma 와의 차이, 결함 아님)

캐러셀 블록 **219 vs 216**(+3) · Book List **299 vs 297**(+2 — divider 3개 선택 `L-OPEN-05` 의 결과. 화면 사본 297 = 74×4+1) · Frame15 **1052 vs 1039**.
정확히 일치한 것: `ReadingNowCard` **118** · 표지 **107×151** · **섹션 간격 전 구간 16**.

## 23. 시각 회귀 임계값 — 전역 프레임까지 확장 (2026-10-08, user)

### 23.1 발단 — 커밋된 baseline 에 dev 패널이 들어 있었다

`e2e/__screenshots__/darwin/visual.spec.ts/frame-1024.png` 에 **dev Scenario Panel 이 찍혀 있었다.**
Orchestrator 가 PNG 를 직접 디코드해 확인: 우하단에 흰 pill **2,531px** + 어두운 글자 픽셀 **59개**(x 941–988, y 721–726).
해당 baseline 은 **`27c9af4`(2026-09-25)** 것이고 `hideDevPanel` 도입 **이전**이다. **Production 에 없는 UI 가 baseline 에 있는데 계속 통과했다.**

### 23.2 ⭐ 진짜 원인 — `--update-snapshots` 의 기본 모드

**`--update-snapshots`(= `changed` 모드)는 비교를 통과하면 baseline 을 다시 쓰지 않는다.**
그래서 재생성을 돌려도 `git status` 가 비어 있었고 **스테일이 보이지 않았다.** 드러내려면 **`--update-snapshots=all`** 이어야 한다.

→ **이것이 이 저장소에서 스테일이 오래 숨어 있던 주된 이유다.** 임계값보다 더 근본적이다. `.claude/rules/frontend.md` `R-BASELINE-1` **③-1** 로 등재했다.

### 23.3 Orchestrator 전제 정정 (2건)

| 내가 적은 것 | 실제 |
|---|---|
| "낡은 6종이 전역 프레임 기준이 느슨해서 통과했다" | 6종 중 `FRAME_SNAPSHOT` 을 쓰는 것은 **`frame-1024` 하나**다. 나머지 5종(`s3-book-cover`·`v7-progress`·`v4-tag-chip`·`v2-material`·`s2-inforow`)은 **이미 `0.02` 를 쓰는 영역 baseline** 이고 **델타가 작아서** 통과했다 |
| "`0.2` 가 과하게 느슨했다" | **아슬아슬했다.** dev 패널이 **143px** 로 통과했고 상한 200 까지 **57px(28%)** 밖에 남지 않았다. 조금만 더 큰 패널이면 저절로 잡혔다 |

### 23.4 결정 — `VISUAL_THRESHOLD_FRAME = 0.02` · `VISUAL_MAX_DIFF_PIXELS = 50`

**노이즈 바닥 = 0 px** (코드 변경 없이 `--update-snapshots=all` 2회 → baseline **68종 전부 바이트 동일**, `diff -rq` exit 0).

| threshold | 채널당 컷 | `frame-1024`(검출) | `s3-home`(노이즈 최악) | 판정 |
|---|---|---|---|---|
| 0.002 | ~1.7 | 13190 | **868** | ❌ 오탐 (>200) |
| 0.01 | ~3.7 | 9727 | 35 | 여유 5.7배 |
| **0.02** | **~5.3** | **8481** | **5** | ✅ **선택** |
| 0.1 | ~11.8 | 5274 | 0 | 느슨 |
| **0.2 (이전)** | ~52.8 | **143** | 0 | ❌ **통과시켰다** |

- **검출 여유**: dev 패널 8,481px = 상한 **42.4배**. 검출은 임계값 선택에 둔감하고 **`0.1`→`0.2` 구간에서 절벽처럼 무너진다**(5274 → 143)
- **노이즈 여유**: 최악 사례 5px = 상한의 **1/40**. 실측 노이즈가 0 이므로 사실상 무한대
- **`maxΔ 2` 를 검출 대상으로 삼지 않는다**: `0.0075` 이하로 내려야 세어지는데, 같은 구간에서 노이즈 여유가 2~4배로 쪼그라들고 **검출력은 전혀 늘지 않는다**. 선은 **maxΔ 6 바로 위**에 그었다
- 상수는 **`VISUAL_THRESHOLD_REGION` / `VISUAL_THRESHOLD_FRAME` 으로 분리**했다 — 값이 같을 뿐이며 한쪽을 바꿔도 다른 쪽이 따라가지 않는다

**`VISUAL_MAX_DIFF_PIXELS` 200 → 50** (사용자 승인): 원래 근거("폰트 힌팅 누적 차이 흡수")는 이제 `threshold` 가 더 정확하게 한다. 최악 노이즈 5 대비 **10배 여유**이고 통과 사각을 **14×14 → 7×7 블록**으로 줄인다. `VISUAL_MAX_DIFF_PIXELS_REGION = 20` · `VISUAL_MAX_DIFF_PIXEL_RATIO = 0.002` 는 유지.

**남은 사각 (기록)**: 전역에서 채널당 5.3 이상 바뀐 픽셀이 **50개 이하**인 회귀는 통과한다. 컴포넌트 정밀도는 `REGION_SNAPSHOT`(상한 20)이 맡는다.

### 23.5 주입 실험으로 검출력을 증명했다

`hideDevPanel` 을 임시로 끄고 dev 패널이 다시 찍히게 만든 뒤:

| 임계값 | 결과 |
|---|---|
| **`0.02`** (새 값) | **failed** — `7595 pixels (ratio 0.01 of all image pixels) are different` |
| `0.2` (이전) | **passed** — 공백 재현 |

확인 후 원복했다.

### 23.6 ⚠️ CI 이식성 (설정 주석에도 기재)

위 여유는 **이 머신 실측**이다. 다른 러너의 폰트 힌팅 차이는 노이즈가 아니라 **글리프 모양 차이**라 채널당 5.3 을 쉽게 넘고 **`0.2` 로도 못 막는다.**
→ 그 경우 **임계값을 올리지 말고 플랫폼별 baseline**(`snapshotPathTemplate` 의 `{platform}`)을 만든다.

### 23.7 재생성 6종 + 추가 결정 3종

**재생성 (원인 전부 규명, 설명되지 않는 클러스터 0건)**:
`frame-1024`(dev 패널) · `s3-book-cover`(커밋 `eb6b1aa` BookCover 수정) · `v7-progress`·`v4-tag-chip`·`v2-material`·`s2-inforow`(둥근 모서리 **AA 커버리지** 띠)

AA 띠는 **"모양이 아니라 커버리지"** 임을 픽셀로 규정했다 — 바깥 순백(255)과 안쪽 solid(217/218)가 **비트 단위 동일**하고 arc 혼합 픽셀만 최대 커버리지 6% 차이. 기하·extent·색 불변. **제품 회귀일 수 없는 대역**이다.
⚠️ **그 띠가 어느 변경 때문에 생겼는지는 특정하지 못했다** (스크롤 위치·컴포지팅 승격·`contain`·`isolation`·`opacity`·radius 표기·브라우저 빌드·의존성·토큰 값 등 **가설 다수를 실측으로 반증**). 미해결로 기록한다.

**추가 결정 (2026-10-08, user)**: `s3-home` · `s3-home-deck` · `s3-home-deck-scrolled` **3종도 재생성한다.**
같은 커밋 `eb6b1aa` 의 같은 결과물인데 **네 장 중 한 장만** 갱신되어, 두면 셋은 계속 **옛 BookCover 를 기준**으로 삼는다.

## 24. Library 2라운드-2 (시트 2종 + 진입점 2종) 결과와 결정 (2026-10-09)

구현: `docs/qa/stage-3-library-r2b-handoff.md`. 커밋 `6a66fb9`. Orchestrator 독립 검증 — 8개 통과, `test` **1559**, `test:e2e` **238 passed**, **Home 코드·baseline 변경 0건**.

### 24.1 사용자 결정 2건 (2026-10-09)

| ID | 항목 | 결정 |
|---|---|---|
| **`L-R2B-01`** | `BookDetailSheet` 추천 이유 줄 미렌더 | **Contract 에 `reason` 을 추가한다** |
| **`L-R2B-02`** | `BookDetailSheet` 에서 코칭 노트를 볼 방법이 없다 | **뒤집는 방식으로** (Home 카드와 같이) |

**`L-R2B-01`** — `ActivityCardOption` 은 `reason`(서버가 만든 추천 이유)을 요구하는데 `LibraryBook` + `BookPromptsResponse` 에 그 필드가 없어 지어낼 수 없었다. **지어내지 않은 판단은 옳다** (`rules/frontend.md` §8 — 생성 문구는 API 응답 값만 표시).
→ **nullable 로 추가**하고 없으면 줄을 생략한다. 대체 문구를 만들지 않는다. **`.max()` 류 제약을 걸지 않는다**(`characterLine` 선례 §13.3). Backend 요구로 등록: **서재 책에도 이유 문구를 주어야 하며 문구 생성 책임은 서버에 있다.**

**`L-R2B-02`** — 헤더 아이콘 자리가 하나뿐이고 §4.5 가 그것을 닫기로 확정해 뒤집기를 넣지 못했고, 그 결과 **`Prompt.coachingNote` 가 화면에서 도달 불가**였다.
→ **Home 카드 뒷면(`86:482`)과 같은 뒤집기**로 한다. 뒷면 규격은 기존 사용자 결정을 따른다 — **Prompt 1개당 상세 코칭 노트 1개 매칭, 동일 개수 표시, 스크롤 가능.**
→ **뒤집기 어포던스는 Figma 에 없는 요소이며 사용자가 그것을 승인했다.** 형태는 development-agent 가 설계하고 보고한다. **닫기 버튼은 유지**한다. 뒷면에서도 **`Start Session` 은 `D-3` 비활성**이다.
→ ⚠️ 뒷면 목록이 스크롤되면 `overflow` 가 생겨 그림자가 잘린다 — **`R-SHADOW-1` inset 을 함께 설계**하고 보정 전/후 프로브 회귀 테스트를 붙인다.

### 24.2 Orchestrator 가 받아들인 판단 8건 (별도 승인 불필요)

1. **`Sheet` `footer` 슬롯 추가** — Figma `Button/card` ActionBar 는 카드 하단 **고정**이고 목록만 스크롤한다. 본문에 두면 CTA 가 스크롤로 사라지고 `contentShadowInset` 이 **무의미해진다** — 그것을 **프로브가 잡았다**. 미지정 시 아무것도 렌더하지 않아 `bottom`·`full` 시트 외형 불변(baseline 바이트 동일로 확인)
2. **Shelf 시트 `★ Save` 를 `aria-disabled`** — `type=shelf` 에는 선택된 책이 없고 `type=selected` 변형은 미구현 확정(`L-OPEN-02`)이라 저장 대상이 정해지지 않는다. **Figma 요소를 빼지 않고** `Start Session` 과 같은 방식(`D-3`)으로 비활성. `SaveButton` 에 `disabled` prop 추가(기본 false → Home 불변)
3. **시트 Error 는 §7.4 명세대로** — 본 화면이 `ErrorState` 1개로 줄인 이유는 *단일 조회인데 섹션이 4개*라서였다(§22.2 ①). **시트는 조회가 하나**라 §7.4 를 지켜도 자연히 1개다. 공통 불변식 유지: **실패를 빈 상태로 보여 주지 않는다**(`isError` 를 Empty 보다 앞에)
4. **진입점 = `ListGroup` + `ListRow` 2행** — `Finished together` 와 같은 컴포넌트·idiom. **섹션 제목을 만들지 않고** 시각 비노출 `aria-label` 만 둔다(Figma 에 없는 문구 발명 회피). 폐기된 `LibraryFooterActions` 부재를 테스트가 고정
5. **진입점을 `LibraryShelves` 밖(Page 조립)에** — 서재 조회가 실패·로딩 중일 때도 두 화면에 갈 수 있어야 한다
6. **"See all" 행 부제: 세션 0회면 저자명** — `finishedMeta` 를 그대로 쓰면 큐레이션 목록에 `0 sessions` 가 찍혀 **결핍처럼 읽힌다**. `L-OPEN-15` 의 저자명 대체 규칙 적용
7. **`useToggleLibrarySave` 신규** — §18.4("Home `useToggleSavedBook` 수정 금지 + Library 는 목록 재조회")를 지키는 유일한 경로. 중복은 mutation 배선뿐, 타입은 contracts 하나
8. **Mock scenario `book-already-owned` 신설** + `API_CONTRACTS.md` §5.4 catalogue 등재 — Design Spec §7.2 의 중복 등록 안내를 재현할 key 가 없었다

**기록만**: 증정 블록을 ActionBar 밖(본문 마지막)에 뒀다 — Figma `Button/card` 는 329×45 **1행**이라 버튼을 더 넣으면 그 요소 자체가 달라진다. `design-spec.md` §2.9 트리와 배치가 다르다. `D-17` Mock 전용 route 는 만들지 않았다(산출물 밖, 제약은 이미 충족).

### 24.3 결함 수정 1건 + 측정 함정 1건 (신규)

- **`inset-card` 시트가 393 에서 오른쪽으로 14px 넘쳤다** (`right = innerWidth + 14`). 1라운드가 opt-in 으로만 넣어둔 변형이 **처음 쓰이면서 드러난** 결함이며 `inline-size: auto` 로 고쳤다. e2e 기하 테스트가 고정한다
- ⚠️ **측정 함정 (신규)**: 그림자 보정을 런타임에서 제거하면 Chrome **scroll anchoring** 이 `scrollTop` 을 되돌려 목록 하단이 클립 선에서 2~3px 떨어진 채 측정된다(실측 `55,16,7,2,0…`). **프레임마다 재대입하고 최댓값 도달을 단언**해야 한다

### 24.4 `contentShadowInset` 실측 (1라운드 등록값과 일치)

`--shadow-bubble` = drop **1겹** + inset ×2, 괄호 깊이로 전수 분리 → **빠뜨린 겹 없음.**

| 임계값 | 위 | 아래 | 좌 | 우 |
|---|---|---|---|---|
| Δ≥1 | **0** | **10** | **4** | **4** |

방법 검정: 같은 방법으로 `--shadow-glass-rest`(3겹)를 재면 **아래 78 · 위 22 · 좌우 50** — 기존 기록을 재현한다.

**실제 시트에서 보정 전/후**: 보정 **없으면** 아래 프로파일이 `22, 0, 0, …` 로 **완전 절단**, 우측도 전부 0. 보정 **있으면** 아래 **10** · 우측 **4** 복원. 회귀 테스트 양방향 × 4폭 = **8건**.

### 24.5 baseline — 신규 5 · 재생성 2 (원인 전부 규명)

신규: `s3-library-shelf-sheet` · `s3-library-book-sheet`(**앞면**) · `s3-library-entry-actions` · `s3-library-add` · `s3-library-gift-requests`
**육안 확인이 결함 1건을 잡았다** — 첫 생성본에서 `/library/add` 검색 입력이 `FieldGroup` 없이 배경 위에 떠 있었다.

재생성 2건은 **진입점 블록이 흐름에 들어온 결과**다: `s3-library-empty`(빈 상태는 내용이 짧아 블록이 뷰포트 안에 들어왔다) · `s3-library-list`(목록이 마지막 블록이 아니게 되어 스크롤 위치가 바뀌고 반투명 glass 뒤 배경 gradient 가 달라졌다 — 채널 최대 Δ **8**).
**런타임 토글로 확정**: 진입점 블록을 흐름에서 빼고 같은 절차로 찍으면 두 baseline 모두 **커밋본과 0 픽셀 차이**. 이 실험이 "대화형 전환(`div`→`button`)이 rest 렌더를 바꾸지 않았다"는 증거이기도 하다.
`--update-snapshots=all` 후 위 7건 외 변경 **없음** — **Home 7종 · `s3-sheet-scrim` · `s3-dialog-scrim` 포함 전부 바이트 동일.**

## 25. Library 2라운드-3·4 결과와 마무리 결정 (2026-10-09)

커밋 `bd34f94`(뒤집기 · `reason` · 뒷면 Figma 정합) 이후 분.

### 25.1 사용자 결정 2건

| ID | 항목 | 결정 |
|---|---|---|
| **`L-R2D-01`** | 시트 표지에 `--shadow-cover` 가 없다 (Figma `85:536` 에는 있다) | **그림자를 넣는다** (+ radius 10, 위쪽 자리 8 도 함께) |
| **`L-R2D-02`** | 뒷면 시트 헤더가 책 제목이다 (Figma 뒷면은 `Prompt of this book`) | **현재대로 두고 차이 등록** — 헤더는 책 제목 유지, Figma 문구는 본문 h3 에 남는다. 시트를 여는 스크린리더가 어떤 책인지 계속 알 수 있다 |

### 25.2 ⚠️ Orchestrator 지시의 전제가 또 틀렸다 — 그림자가 "잘린" 게 아니라 "없었다"

§24 에서 내가 `L-R2B` 보고를 받아 *"앞면 표지 좌측 그림자 14px 가 잘린다"* 를 **결함으로 지시**했는데, 재측정 결과:

- **`BookCover md` 자체에는 그림자가 없다.** Home 만 `.haru-activity-card__book .haru-book-cover` 가 `--activity-card-cover-shadow` 를 덮는다. `BookDetailSheet` 는 그 범위 밖이라 **`box-shadow: none`** 이었다
- 즉 **자리는 잘려 있던 것이 맞고 고친 것도 맞지만, 화면 픽셀은 1개도 바뀌지 않았다** — 앞면 baseline 이 **바이트 동일**한 것으로 증명됐다
- 그래서 `L-R2D-01`(그림자 자체를 넣을지)이 **별도 결정**으로 올라왔고 승인됐다

**교훈**: "그림자가 잘린다"는 보고를 받으면 **그림자가 존재하는지부터** 확인한다. 자리 문제와 존재 문제는 다르다.

### 25.3 ⭐ 프로브 방식 — 1점 Δ 로는 위쪽을 판정할 수 없다 (측정 교훈)

좌우에 쓴 **1점 고정거리 Δ** 방식이 위쪽에서 **오탐**을 냈다.

- 320px 에서 `.haru-book-sheet__book` 이 `align-items: center` 이고 텍스트 열이 표지보다 높아(좁은 폭 줄바꿈) **표지가 2.58px 내려간다**(표지 top 116.578 ↔ 본문 content box top 114)
- 그만큼은 **보정 없이도 우연히 살아 있어** 프로브가 "보정 없이도 보인다"로 읽혔다. **e2e 가 320 에서 FAIL 해서 드러났다**
- → 위쪽은 **번짐 폭을 센다**: 보정 있음 **8/8/8/8**(320·393·600·1024) ↔ 없음 **3/0/0/0**

`.claude/rules/frontend.md` `R-SHADOW-1` ③ 의 "픽셀 프로브로 실측한다" 에 **측정 지점이 요소와 함께 움직일 수 있다**는 조건이 붙는다.

### 25.4 `--shadow-cover` 네 방향 실측 (산술 검산 일치)

| 방향 | 번짐 |
|---|---|
| 아래 | **20** |
| 위 | **8** |
| 좌 · 우 | **14** |

검산: blur radius **14**, offset-y **+6** → 아래 6+14=20 · 위 14−6=8 · 좌우 ±14. **네 값 전부 실측과 일치.** drop 1겹이라 빠뜨릴 겹 없음.

**좌우와 위쪽의 차이**: 좌우는 **바깥 상자만 켜면 무효**다(안쪽 `.haru-book-sheet__flip` 의 `overflow-x: clip` 이 먼저 자른다). 위쪽은 **한 박스로 끝난다** — `overflow-x: clip` 은 다른 축을 scroll container 로 만들지 않아 `overflow-y` 가 `visible` 로 남는다(실측 computed `{ x: 'clip', y: 'visible' }`).

**헤더↔본문 간격은 불변**이다: `border-box` + `flex: 1 1 auto` 라 음수 margin 이 늘린 8 을 padding 이 흡수한다 — 간격 **12**(= 시트 flex gap) 유지, content box top·높이 불변.

### 25.5 Orchestrator 가 빠뜨린 절차 — `Status:` 갱신

`rules/workflow.md` §3 이 *"승인되면 해당 문서의 `Status:` 를 `APPROVED (YYYY-MM-DD, user)` 로 갱신한다"* 를 **Orchestrator 책임**으로 정했는데, §20.1 에서 승인을 받고도 **갱신을 빠뜨렸다.**
그 상태로 QA 에 넘기면 **Stage Gate 불충족으로 읽힌다.** development-agent 가 발견해 보고했고 Orchestrator 가 갱신했다:

| 문서 | 갱신 후 |
|---|---|
| `docs/plans/stage-3-library-plan.md` | `APPROVED (2026-10-06, user)` |
| `docs/design/stage-3-library-design-spec.md` | `APPROVED (2026-10-06, user)` |
| `docs/design/stage-3-home-figma-audit.md` | **반영 완료** (결정 §12~§13, 구현 `9173b2b`) |
| `docs/design/stage-3-library-figma-audit.md` | **결정 완료** (`L-OPEN-01`~`22` 전건) |

`docs/plans/stage-3-plan.md` · `docs/design/stage-3-design-spec.md` 는 이미 `APPROVED (2026-10-05, user)` 였다.

### 25.6 QA 인계 입구 — `docs/qa/stage-3-handoff.md`

`rules/workflow.md` §6 이 지정한 파일인데 인계 메모가 **5개로 쪼개져** 있었다. 통합 입구를 만들고 기존 5개는 **지우지 않고 참조**한다.
담긴 것: 구현 범위 + 메모 포인터 · **재현 경로**(URL · 시나리오 키 · 로그인 자격 · dev 패널) · **승인 근거 표 2종**(Figma 에 없는데 만든 **9건** / Figma 에 있는데 뺀 **8건**, 승인번호 명시) · **무효 허용차이 5건** · `BACKEND_INTEGRATION_PENDING` · 가값(`P-24` · `P-05` 해제 · `S3-PROV-2`) · **시각 회귀 설정 변경 + `--update-snapshots=all` 주의** · 미해결 · 알려진 제약.

### 25.7 `books` 시나리오 그룹 등록 (QA 오판 방지)

`booksScenarioGroup`(7 key, `no-reason` 포함)이 `DEV_SCENARIO_GROUPS` 에 **등록되지 않아** URL·`sessionStorage` 로만 전환됐다 — QA 가 패널에서 찾다가 "시나리오 없음"으로 오판할 수 있었다. 등록했다(6그룹).
1라운드의 "키 증가 → 패널 넘침" 재발 조건이 아님을 실측 확인: 본문 `clientHeight` 가 **이미 60dvh 캡값**(511 @852 · 341 @568)과 일치해 key 추가는 `scrollHeight` 만 늘린다. **CSS 수정 0줄, 새 `overflow` 선언 없음.**
baseline **74종 전량 재생성 후 바이트 동일** — 패널은 `position: fixed` + `hideDevPanel` 로 가려져 기준 이미지에 영향이 없다.

### 25.8 남은 미해결 (QA 에 그대로 넘긴다)

- 둥근 모서리 AA 띠의 **원인 커밋 미특정** (가설 다수를 실측으로 반증, 제품 회귀일 수 없는 대역으로 규정)
- **Safari / iOS 실기기 미확인** — 모든 측정이 Chromium(darwin, dSF 1)
- 뒤집기 중간 프레임 ActionBar **잔상**(~170ms, 약 15% 투명도)
- 저장 실패 `InlineAlert` + 뒤집기 동시 상황의 **잔여 빈 자리** (코드 추론, 미재현)
- `S3-PROV-2` — dev gallery 가값 목록에 `P-18`~`P-23` **미등재** (기존 공백, 가값 재제시 전 선행 조건)

## 26. Stage 3 QA 결과와 수용 결정 (2026-10-09, user)

리포트: `docs/qa/stage-3-qa-report.md` (728줄). 대상 커밋 `61fee89`. **Stage Verdict: `FAIL`** (`FAIL` 5 Finding / 7 AC).

8개 명령은 **전부 통과**했고 Orchestrator 측정과 일치한다 (`test` 1596 · `test:e2e` 271 passed 단독 6.1분).
QA 가 `--update-snapshots=all` 로 **스테일 baseline 0건 / 74종 바이트 동일**도 확인했다 — §23.2 의 교훈이 QA 절차에 반영됐다.

### 26.1 명시 수용 — Stage 4 로 이월 (사용자 결정)

`rules/qa.md` §2 에 따라 **항목별 명시 수용**이며 Stage Verdict 는 **`PASS (accepted: QA-3-001, QA-3-002, QA-3-003)`** 으로 기록한다.

| ID | Sev | 내용 | 수용 사유 |
|---|---|---|---|
| **`QA-3-001`** | **High** | **push 권한 기능군 전체 미구현** — `PushPermissionPort` · Web 구현 · 사전 안내 UX · `push-permission-denied` 시나리오 · `notification-preferences`/`push-devices` contracts · `PushPlatform` enum **6개 전부 0건**. Orchestrator 확인: 앞 둘은 **0 파일**, 나머지는 **`docs/API_CONTRACTS.md` 와 dev 테스트에만** 존재(구현 없음) | 알림 설정 화면(`C13-19`)이 **디자이너 Figma 대기** 상태라 도달 Stage 로 이월하는 것이 자연스럽다 |
| **`QA-3-002`** | Medium | Activity Card **오프라인 캐시(`D-11`) 미구현** — `offline-cached-card` key 0건, `localStorage` 사용처는 온보딩 draft 1종뿐 | 기능군 전체 미구현이라 수정 비용이 크다 |
| **`QA-3-003`** | Medium | **`D-4` 에셋 파이프라인 미구현** — AVIF/WebP 0개, `<picture>`/`srcset` 0건, `assets:optimize`·`sharp` 0건 | 〃. 표지 에셋 교체(`L-D4`·`P3-BIP-19`)가 Stage 8 게이트이므로 그때 함께 보는 것이 낫다 |

⚠️ **세 건은 Stage 4 Plan 에 In Scope 로 반드시 올린다.** 이월은 삭제가 아니다.
⚠️ QA 가 **스스로 수용을 가정하지 않았다** — 올바른 처리다 (`rules/qa.md`: Agent 는 스스로 승인하지 않는다).

### 26.2 즉시 수정 — 남은 `FAIL` 2건

| ID | Sev | 내용 |
|---|---|---|
| **`QA-3-004`** | Medium | **Toast 가 하단 탭바를 50px 덮어 탭 3개 클릭을 전부 가로막는다** (393·320 양쪽 재현 100%) |
| **`QA-3-005`** | Medium | **`MockLibraryApi` 가 `Idempotency-Key` 를 받기만 하고 버린다** — 보관·재생·`IDEMPOTENCY_KEY_REUSED` 0건. Stage 2 `MockConsentApi`·`MockOnboardingApi` 는 구현되어 있어 **선례와도 불일치**. `rules/qa.md` §1 "Mock 이 Contract 와 다르면 PENDING 이 아니라 `FAIL`" (AC-3-36) |

**`QA-3-004` 원인 (Orchestrator 코드 확인)**: `ToastProvider` 의 `withTabBar` 기본값이 `false` 인데 **`AppProviders.tsx:39` 가 인자 없이 마운트**하고, 저장소 전체에서 `withTabBar` 를 넘기는 곳이 **0건**이다 → `haru-toast-viewport--tabbar` 는 **Production 도달 불가 코드**다.

### 26.3 ⭐ 또 "도달 불가 코드 위에서 통과하는 테스트" — 6번째 사례

`QA-3-004` 를 놓친 가드는 `apps/web/__tests__/stage3-css-guards.test.ts:70` 이다:

```ts
const viewport = /\.haru-toast-viewport--tabbar\s*\{([^}]*)\}/.exec(TOAST_CSS)?.[1] ?? '';
expect(viewport).toContain('--layout-tabbar-height');
```

**CSS 규칙 안에 토큰이 있는지만 보고, 그 클래스가 실제로 붙는지는 보지 않는다.** `e2e/` 전체에서 `toast` 는 gallery 컷 1건뿐이었다.

이 세션에서 같은 유형이 반복됐다: ① `s2-onboarding-childinfo` 가 버그 상태를 담았다 ② 테스트가 `Go back → 1/15` 라는 버그를 기대값으로 단정했다 ③ drag 시작점을 옮겨 회귀를 가렸다 ④ `s2-vpc-failed` 가 과도기 프레임을 담았다 ⑤ `frame-1024` 가 dev 패널을 담았다 ⑥ **이번 건**.
→ **CSS 문자열 가드는 "선언이 존재한다"만 증명하고 "적용된다"는 증명하지 못한다.** 적용 여부는 런타임(`e2e` 또는 Testing Library)에서 단정해야 한다.

### 26.4 QA 가 자기 측정으로 찾은 것 (handoff 전제 오류)

`docs/qa/stage-3-handoff.md` §9 ⑨ 가 *"Toast 가 마운트되는 Stage 3 화면이 없다"* 고 적었으나 **틀렸다** — `ActivityCardDeck.tsx:49`(저장 실패)·`AddOwnBookForm.tsx:68`(등록 성공)이 둘 다 띄운다. **그 전제 때문에 실행 측정이 생략됐고**, QA 가 직접 런타임 측정을 해서 결함을 찾았다.
→ handoff 메모의 전제를 그대로 믿지 않고 측정한 것이 올바른 QA 수행이다.

### 26.5 Low 4건 처리

| ID | 처리 |
|---|---|
| `QA-3-006` | `P-23`(`--color-prompt-tag-fg`) dev gallery 미등재 → **수정한다.** `S3-PROV-2` 의 실제 내용이며, `P-18`~`P-22` 는 **토큰 자체가 없어 대상이 아니다**(§21.5 의 내 기록을 QA 가 정정했다) |
| `QA-3-007` | handoff §3 의 "Figma 에 없는데 구현한 것" 이 **9건이 아니라 10건**(버블 닫기 x 버튼 누락, 승인 근거는 §13.4) + §9 ⑨ 전제 오류 → **handoff 수정** |
| `QA-3-008` | `AC-3-59`(28→29) · `AC-3-56`(31→32) **AC 문구가 낡음, 결함 아님** → Plan 문구 정정 대상으로 기록 |
| **`QA-3-009`** | **AC-3-34("대화 전용 세션 안내")를 폐기로 표기한다** (사용자 결정 2026-10-09) — 해당 기능은 §12.12 로 폐기됐다(*"책 없이 대화만 하는 카드가 있을 수 없음"*). **AC 도 폐기로 맞춘다.** 판정 대상에서 물러난다 |

### 26.6 `NOT VERIFIED` 2건 (그대로 유지)

- **`NV-1` Safari / iOS 실기기** — `overflow-x: clip` · `:has()` · `inert` · `backface-visibility` + `rotateY` · `scroll-snap` + `dvh` 가 **Chromium 에서만** 확인됨. 수동 절차는 QA 리포트 §7
- **`NV-2`** 뒤집기 중간 프레임 ActionBar 잔상(~170ms, `animations: disabled` 로는 포착 불가) + 저장 실패 `InlineAlert` 동시 상황의 잔여 빈 자리

### 26.7 QA 가 PASS 로 확인한 것 (기록)

Scope 위반 **0** · `z.object(` contracts 밖 **0건** · 신규 `any`/`@ts-ignore` **0건** · Mock fixture 하드코딩 **0건** · Adapter 선택 지점 **1곳** · 임의 HEX/arbitrary value 신규 **0건**(걸린 것은 전부 주석·공식 브랜드 에셋) · logger 화이트리스트 PII 차단 · **`ListGroup`/`ListRow` 정규화의 Stage 2 회귀 0건** · **200% 텍스트 확대에서 가로 넘침 0px**(QA 가 실화면 측정, 테스트 공백이었다) · Figma `26:21`·`30:74` 직접 대조 결과 차이가 **전부 승인 번호를 가진 것**

## 27. Stage 3 QA 2차 결과와 최종 수용 결정 (2026-10-09, user)

리포트: `docs/qa/stage-3-qa-report.md` (1021줄, §11 재검증 신설). 대상 커밋 `80ee2be`. **2차 Verdict: `INCOMPLETE`** (1차 `FAIL` → 재검증 4건 전부 `PASS`, `FAIL` 0).

### 27.1 ⚠️ §26.1 의 전제가 틀렸다 — QA 가 자기 1차 집계 오류를 찾았다

§26.1 에서 내가 *"`PARTIAL` 3건"* 으로 적고 *"`QA-3-008`·`009` 로 전부 해소된다"* 를 전제했는데, **실제 `PARTIAL` 은 6건**이었다. QA 1차 §1 Summary 가 `AC-3-78`·`AC-3-86`·`AC-3L-24` **세 건을 세지 않았다**(QA 자신의 오류).
→ 그래서 `PASS (accepted: QA-3-001, QA-3-002, QA-3-003)` 산식이 성립해 보였을 뿐이다.
→ **QA 가 임의로 `PASS` 로 메우지 않고 `INCOMPLETE` 로 보고했다.** `rules/qa.md` 와 "Agent 는 스스로 승인하지 않는다" 를 지킨 올바른 처리다.

`AC-3-78` 은 PARTIAL 사유(결함 5건)가 해소되어 **QA 가 `PASS` 로 재판정**했고 근거를 리포트 §4·§11.5 에 명시했다.

### 27.2 결정 — `AC-3-86` 중 **보호자 직접 입력 부분만 폐기 표기** (user)

`AC-3-86` 원문은 저장 대상을 *"카탈로그 책은 `bookId`, **보호자 직접 입력 옵션은 `title`(+`author?`)**"* 로 요구한다. 그런데 **그 선택지 자체가 `conversation_only` 폐기(§12.12)와 함께 사라졌다** — `packages/contracts/src/activity/option.ts:24` 가 *"`userEnteredBook` 이 사라졌다"* 고 적고 있고, AC 자신도 *"`conversation_only` 는 `G-12` 결정 전 검증 불가"* 라는 주석을 달고 있다.
**결정 기록은 0건이었다** (Orchestrator 가 approvals 전수 grep 으로 확인) — `AC-3-34` 와 **같은 종류의 결정 공백**이다.

**결정**: **카탈로그 책 저장 부분은 그대로 판정**하고, **보호자 직접 입력 부분만 폐기로 표기**한다.
⚠️ Library 의 `userEnteredTitle`(`library/library-book.ts:45`)은 **남는다** — 그것은 `/library/add`(`FR-23`) 경로용이며 Activity Card 저장과 별개다.

### 27.3 결정 — 남은 3건 **모두 수용** (user)

| ID | 내용 | 수용 사유 |
|---|---|---|
| **`AC-3L-24`** | `GiftRequestStatus` **6종 표시를 재현할 Mock 시나리오 없음** — fixture 에 `shipped`·`requested` **2종만** (Orchestrator 확인: `mocks/fixtures/library.ts:331-332`) | 고칠 수 있는 항목이지만 사용자가 수용을 택했다. **증정 상태 4종은 화면 확인 없이 남는다** |
| **`NV-1`** | **Safari / iOS 실기기 미확인** — `overflow-x: clip` · `:has()` · `inert` · `backface-visibility`+`rotateY` · `scroll-snap`+`dvh` 가 Chromium 에서만 확인됨 | 현 환경에서 불가 (실기기 필요) |
| **`NV-2`** | 뒤집기 중간 프레임 ActionBar **잔상**(~170ms) + 저장 실패 `InlineAlert` 동시 상황의 잔여 빈 자리 | 현 환경에서 불가 (60fps 녹화 필요) |

### 27.4 최종 Stage Verdict 산정

수용 항목 전체: **`QA-3-001` · `QA-3-002` · `QA-3-003`**(§26.1) + **`AC-3L-24` · `NV-1` · `NV-2`**(§27.3) + `AC-3-86` 부분 폐기(§27.2) + `AC-3-34` 폐기(§26.5).
→ `rules/qa.md` §2 에 따라 **항목별 명시 수용**이 성립한다. **최종 Verdict 는 stage-qa-agent 가 판정한다** — Orchestrator 가 계산해 선언하지 않는다.

### 27.5 QA 가 자기 측정으로 바로잡은 것 (기록)

`QA-3-004` 재검증 중 `pushState`+`popstate` 로 흉내 낸 이동에서 *"스택인데 121px 로 남음"* 이 관측됐으나, **해제 렌더 전 같은 프레임을 읽은 것**이었다. 실제 링크 클릭으로 다시 재니 **16px 정상**이었다.
→ **인공 이동 값을 결함으로 올리지 않았다.** 측정 방법이 만든 허상을 스스로 걸러낸 사례로 기록한다.

또 QA 는 **구현자 handoff 의 "실측했다" 서술을 증거로 쓰지 않고 수치를 다시 쟀다** (자작 Playwright 스크립트, Mock Adapter 직접 호출, 변조 시뮬레이션). `rules/qa.md` 의 "구현자의 handoff 메모는 증거가 아니다" 를 지킨 것이다.

### 27.6 Stage 4 Plan 에 올릴 이월 항목 (재확인)

**이월은 삭제가 아니다.** Stage 4 Plan 작성 시 In Scope 로 올린다:
- **`QA-3-001` (High)** — `PushPermissionPort` + Web 구현 + 사전 안내 UX + `push-permission-denied` 시나리오 + `notification-preferences`/`push-devices` contracts + **`PushPlatform` enum**
- **`QA-3-002` (Medium)** — Activity Card 오프라인 캐시(`D-11`) + `offline-cached-card`(캐시 카드 + Offline Banner 동시) + 폐기·로그아웃 삭제
- **`QA-3-003` (Medium)** — `D-4` 에셋 파이프라인(AVIF/WebP/PNG · `<picture>`+`srcset` · 해상도 상한 · `assets:optimize`) — `P3-BIP-19`(표지 에셋 교체)와 함께 **Stage 8 게이트**

### 27.7 남은 가값 — 활성 6건

`P-01` · `P-02` · `P-04` · `P-16` · `P-23` · `P-24` — **전부 dev gallery 등재 완료**(차집합 0, QA 확인). 해제: `P-05`. 수용 예외: `D-01` 유지.
→ **Stage 0 `#10-4` 항목별 재제시가 이제 6건 전부에 성립한다** (`S3-PROV-2` 해소).

## 28. Stage 3 최종 Verdict (2026-10-09, stage-qa-agent 3회차)

리포트: `docs/qa/stage-3-qa-report.md` (1193줄, §12 신설). 대상 커밋 `80ee2be`.

### 28.1 Verdict

> **`PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`**

### 28.2 ⚠️ §27.4 정정 — `accepted:` 에는 **수용만** 넣는다

내가 §27.4 에서 수용 6건과 폐기 2건을 **"수용 항목 전체"로 묶어** 적었는데, QA 가 바로잡았다.
`rules/qa.md` 기록 형식상 `accepted:` 괄호에는 **항목별 명시 수용만** 들어가고, **폐기는 판정 대상에서 물러난 것**이라 괄호에 넣지 않는다. 그래서 2회차가 예상한 7건이 아니라 **6건**이다.

| 구분 | 항목 |
|---|---|
| **수용 6건** (괄호 안) | `QA-3-001` · `QA-3-002` · `QA-3-003` (§26.1) + `AC-3L-24` · `NV-1` · `NV-2` (§27.3) |
| **폐기 2건** (괄호 밖) | `AC-3-34` 전부 폐기(§26.5) · `AC-3-86` 보호자 직접 입력 분기만 폐기(§27.2) |

`AC-3-86` 은 요구사항이 줄어든 뒤 **잔여 범위를 QA 가 다시 측정해 `PASS`** 로 올렸다.

### 28.3 전수 집계 (QA 가 전 행 기계 추출 + 누락 22행 개별 확인 + 합 검산)

| 대상 | `PASS` | `FAIL`(전부 수용) | `PARTIAL` | `NOT VERIFIED` | 그 밖 | 합 |
|---|---|---|---|---|---|---|
| Stage 3 Plan | **71** | **6** | 0 | 0 | 폐기 1 · 무효 2 · Out of Scope 3 · 이월 5 | **88** ✅ |
| Library Plan | **38** | 0 | **1**(수용) | 0 | — | **39** ✅ |
| AC 밖 | — | — | — | **2**(수용) | `PENDING` 12 · Finding 9 | — |

**합계: `PASS` 109 · `FAIL` 6 · `PARTIAL` 1 · `NOT VERIFIED` 2 · `BACKEND_INTEGRATION_PENDING` 12**
**수용으로 덮이지 않은 항목 0건** — `FAIL` 6 AC 는 전부 `QA-3-001`/`002`/`003` 에 1:1 매핑된다.

1회차 집계 오류(§27.1)의 재발을 막으려 **전 행을 기계 추출한 뒤 추출에서 빠진 22행을 한 건씩 직접 확인**했다. 집계 누락 0건.

### 28.4 ⚠️ 1회차 증거 인용 2곳이 오기였다 (QA 자체 발견)

1회차가 `AC-3-86` 의 카탈로그 경로 근거로 `MockLibraryApi.test.ts:312` · `home.spec.ts:187` 을 적었는데, 그 줄을 직접 열어 보니 전자는 **`AC-3-36` Idempotency 블록**, 후자는 **`G-13` Save 토글 테스트**였다 — **저장 대상 단정이 아니다.**
실제 단정은 `home-stage3.test.tsx:644` 의 `expect(saves[0]?.payload).toStrictEqual({ target: { bookId: DECK_BOOKS[0]?.id } })` 다.
→ **판정을 올릴 때 인용 위치를 검산해서 나온 발견**이다. 리포트 §4.1 을 바로잡았다.

### 28.5 수용의 대가 (명시해 둔다)

- **`GiftRequestStatus` 의 `approved`·`delivered`·`cancelled`·`rejected` 4종은 화면 확인 없이 남는다** (`AC-3L-24`) — **고칠 수 있었던 항목**이다
- **Safari / iOS 실기기 미확인** (`NV-1`) — `overflow-x: clip` · `:has()` · `inert` · `backface-visibility`+`rotateY` · `scroll-snap`+`dvh` 가 Chromium 에서만 확인됨
- 뒤집기 중간 프레임 잔상·잔여 빈 자리 (`NV-2`)
- push 권한 · 오프라인 캐시 · 에셋 파이프라인 **3개 기능군이 Stage 3 에 없다** (Stage 4 이월)

### 28.6 Orchestrator 후속 작업

1. **`PLANNING.md` 진행 상태 갱신** — Stage 3 완료
2. **가값 6건 항목별 재제시** (Stage 0 `#10-4`) — `P-01` · `P-02` · `P-04` · `P-16` · `P-23` · `P-24`. `S3-PROV-2` 가 해소되어 **이제 6건 전부에 절차가 성립한다**. 재제시는 Orchestrator 소관이며 **사용자 승인이 필요하다**
3. **Stage 4 Plan 에 이월 3건을 In Scope 로 올린다** (`QA-3-001`·`002`·`003`) + 이미 이월된 `AC-3-22`~`26` 5건
4. **Stage 8 게이트로 남는 것**: `QA-3-003`(에셋 파이프라인) + `P3-BIP-19`(상용 그림책 표지 교체 — **법무 확인 필요**)
5. **Stage 4 는 사용자 지시가 있을 때 시작한다** (`rules/workflow.md` §4 — 한 Stage 승인은 다음 Stage 로 확장되지 않는다)

## 29. 사용자 검수 수정 6건 (2026-10-10, user)

Stage 3 가 `PASS` 로 닫힌 뒤(§28) 사용자가 화면을 검수하고 **6건**을 지시했다. 전부 반영했고 회귀 테스트 1건을 추가로 붙였다.

| # | 지시 | 결과 |
|---|---|---|
| 1 | 프롬프트 텍스트를 박스 **세로 중앙**에 | 완료 — `.haru-prompt-pill { align-items: center }` |
| 2 | 썸네일 ↔ 프롬프트 박스 간격을 **프롬프트 간 간격과 일관되게** | 완료 — `margin-block-end: var(--prompt-pill-gap)`(6) |
| 3 | 저장 실패 에러를 **상단 토스트**로 | 완료 — 인라인 알림 제거, 토스트 뷰포트를 상단으로 |
| 4 | 그 에러가 **모든 책 카드에 나오는** 문제 | 완료 — 상태를 없애 해결 |
| 5 | TopBar 가 스크롤 시 **흰색으로 바뀌는 것** | 완료 — 앱 바탕과 **같은 gradient** |
| 6 | `Request this book` 버튼·기능 **제거** | 완료 — **신청만**, 조회는 유지 |

### 29.1 `#4` — 같은 파일에 올바른 패턴이 있었는데 한 곳만 빠졌다

`BookDetailSheet` 는 **단일 인스턴스를 모든 책에 재사용**한다(`LibraryShelves.tsx:133` 이 `book` prop 만 갈아 끼운다). `pending`·`face` 는 **`{ bookId, … }` 로 키를 걸어** 다른 책이 들어오면 자동 폴백되는데 **`save.isError` 만 키가 없어** 한 번 실패하면 이후 모든 책에 남았다.

**해결: 키를 하나 더 만들지 않고 토스트로 바꿔 상태 자체를 없앴다.** 인라인 알림은 **렌더 상태**를 읽지만 토스트는 `onError` 에서 **한 번 호출하는 사건**이라 새어 나갈 상태가 사라진다. 키잉을 추가하면 지워야 할 상태를 다시 만드는 것이고 Home `ActivityCardDeck` 과 패턴도 갈린다.

재현 증거: 책 A 저장 실패 → 책 B 로 교체 후 **책 B 의 시트 DOM 안에 책 A 의 문구가 그대로** 남은 출력을 받았다.

### 29.2 `#3` — 토스트 상단 이동이 같은 결함을 **반대 방향으로** 재현했다

`QA-3-004`(하단 토스트가 탭바를 덮음)를 고친 직후였는데, 상단으로 옮기자 **TopBar 를 가렸다**(`inToast: true` / `inTopBar: false` — 설정 아이콘·뒤로 가기 자리의 hit-test 결과).

⚠️ **"탭바 보정을 그냥 두는 것"이 안전하지 않았다.** 남아 있던 `--tabbar` 수식어가 `inset-block-end` 를 계속 걸어 `inset-block-start` 와 동시에 적용되자 **토스트 높이가 715px 로 늘어나** 탭바까지 덮었다. 그래서 삭제했다.

**`useToastTabBarInset` → `useToastTopBarInset(ref)` 로 대체**했다:

| | 이전 | 이후 |
|---|---|---|
| 페이로드 | 참조 **개수**(boolean 성) | 등록 요소 Set + **실측 최대 높이** |
| 등록 지점 | `TabLayout`(탭 전용) | `AppShellTopBar`(Tab·Stack·Fullscreen **공용 1곳**) |

근거: 탭바는 높이가 토큰 고정이라 boolean 이면 충분했지만 **TopBar 는 화면마다 다르다**(실측 **40 / 48** — Home 은 `--topbar-height` 40 + 상단 여백 10). **토큰 상수로는 8px 부족**하다. 또 TopBar 는 탭 전용이 아니어서(`/settings`·`/auth/*`·`/library/add`) 등록을 공용 래퍼로 올렸다. 겹치는 전환에서는 **큰 쪽**을 쓴다 — 과보정은 토스트가 조금 내려가는 것으로 끝나고 **과소보정은 즉시 클릭 불능**이다.

→ **`AD-S3-14`**("Toast 하단 offset 에 탭바 높이 + 중앙 버튼 overhang 을 더한다")는 **폐기**한다. 상단 이동으로 성립하지 않는다.

### 29.3 `#5` — 완전 투명은 **측정으로 기각**됐다

사용자 지시는 *"바탕이 그대로 유지된 것처럼"* 이었고 1차 시도는 완전 투명이었다. 제목 글리프를 숨기고 **뒤 픽셀 3,298개를 각각** 재니:

| | 투명안 | **채택안(gradient)** |
|---|---|---|
| 대비 최소 | **1.00** (글자가 사라지는 픽셀) | **5.55** |
| 3:1 미만 비율 (scrollTop 260) | **82.3%** | **0%** |

**같은 색 단색도 불가**하다 — 앱 바탕이 **gradient** 라 고정 단색은 어긋난다.
→ **채택: `background-image: var(--gradient-app)` + `background-attachment: fixed`.** `AppBackground` 가 `position: fixed; inset: 0` 이라 gradient 박스가 뷰포트이고, `attachment: fixed` 가 배경 위치 영역을 뷰포트로 만들어 **띠의 DOM 위치와 무관하게 같은 램프**를 쓴다.
- 경계 색차 **최대 1**(gradient 램프가 아니라 디더 — 가운데 행이 **0** 이라 `[1,0,1]`), y+2 에서 0
- 콘텐츠 통과 픽셀 **0** — 띠 13,800px 중 순수 바탕과 다른 1,252px 의 **1,221px 이 제목 글리프 자신**
- `box-shadow`(하단 경계선)·`backdrop-filter` 제거, `prefers-reduced-transparency` 는 `--color-bg-app-start` 단색
- **인쇄 분기 신설** — `AppBackground` 가 인쇄에서 투명해지는데 불투명 띠를 두면 **흰 종이에 띠가 남는 회귀**가 생긴다

→ **Design Spec §6.1 의 "스크롤 시 glass 배경" 서술은 수정 대상**이다 (design-agent 소관).

### 29.4 `#6` — 증정 **신청만** 제거, 조회는 유지 (사용자 결정)

제거: 버튼 UI · `useCreateGiftRequest` 사용 · `requestBook` 문구.
유지: `/library/gift-requests` · `GiftRequestList` · `LibraryEntryActions` 진입점 · **contracts·Mock 전부**.

⚠️ **`FR-22` 가 PRD P0 에 *"초기 20권 라이브러리·증정 신청·구매 링크"* 로 적혀 있다 → PRD 수정 대상**(`D-24` 절차). `LN-8` 로 등록한다.

> **`D-26` (2026-11-08, user)** — 원문 *"증정 신청은 따로 랜딩페이지에서 받는것으로 하고 prd에 기록만 한다"*. **증정 신청 접수 경로 = 앱 밖 별도 랜딩페이지.** PRD FR-22 의 "미결"을 이 결정으로 교체했다(PRD v1.5 개정 3 보완, 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3b-20261108-0031.md`, sha1 `3452f7c1fd7e857d28ee01fcbe6c5e66e2e2830b`). **기록만** — 앱 내 링크·UI 등 새 요구사항 없음, 랜딩페이지는 HARU 앱 범위 밖. 보류 B-3 해소.

> `LN-8` — ✅ **PRD v1.5 개정 3 적용 (2026-11-07)** — 백업 `$HARU_ONEDRIVE/old/HARU_PRD_v1.5.pre-rev3-20261107-1924.md` · 적용 후 sha1 `e6016ec6a7fa621ecf7f82300cf88ecae649afcd` · 대조표 `docs/decisions/prd-v1.5-rev3-2026-11-07.md`. 앱 내 신청 제거 · 조회 유지를 반영했고, **신청 접수 경로는 결정이 없어 FR-22 에 "미결"로 명기**했다 (보류 B-3).

**사용처 0건이 된 것 8종** (지우지 않았다 — Backend 인터페이스라 **사용자 결정 필요**):
`useCreateGiftRequest` hook · `CreateGiftRequestMutation` · `libraryApi.createGiftRequest` · `CreateGiftRequestRequestSchema` · **`GIFT_REQUEST_DUPLICATE`**(어떤 화면도 표시할 수 없다) · `ERROR_COPY.GIFT_REQUEST_DUPLICATE` · `library:gift-duplicate` Mock 시나리오 · `createGiftRequestFixture`

테스트는 **삭제하지 않고 부재 단정으로 뒤집었다.** 이름에 copy 키 대신 **리터럴 `/request this book/i`** 를 써서 copy 키를 되살려도 저절로 통과하지 않게 했다.

### 29.5 Figma 허용 차이 — 간격 **12 ↔ 6** (사용자 결정)

| 지점 | Figma | 기존 구현 | 현재 |
|---|---|---|---|
| `BookDetailSheet` 책 블록 ↔ Prompt 목록 | `145:1085` **12** | **0** (이미 어긋나 있었다) | **6** (사용자 지시 — 프롬프트 간 간격과 일치) |

→ **6 유지 + 허용 차이 등록** (ID 는 design-agent 가 `AD-L-*` 로 부여). Home 카드(`163:2649`)는 Figma 12 = 구현 12 **일치를 유지**했다.
`#1`(1줄 pill 세로 중앙)은 **Figma 에 1줄 pill 예시가 없어** 충돌 없음 — 2줄은 Figma 실측 9/9 그대로다.

**320px 잔여 차이 수용**: 책 제목이 길어 텍스트 열이 표지보다 2.58 아래까지 내려가므로 **표지 이미지 기준 간격이 8.58** 로 보인다. 393·1024 에서는 정확히 6. **그대로 둔다**(사용자 결정) — 맞추려면 행 정렬을 바꿔야 하고 그러면 텍스트가 표지와 어긋난다.

### 29.6 회귀 감시 추가 — `e2e/top-bar-scrolled.spec.ts`

**스크롤된 TopBar 를 찍거나 재는 e2e 가 하나도 없었다.** TopBar 배경은 이번이 **두 번째** 수정이라 감시 없이 두면 또 조용히 어긋난다.
⚠️ 구현 agent 가 추가를 권고했으나 **내가 완료 조건에 테스트 수를 고정해 둬서 넣지 못했다** — 내 제약이 과했다. 해제하고 추가했다.

**검출력을 5가지 되돌림으로 증명**했다:

| 되돌림 | 결과 |
|---|---|
| 투명 | 테스트 2 FAIL — 대비 1.00 / 18.3% |
| glass 면 | 테스트 1 FAIL — 단차 **27** |
| 하단 경계선 부활 | 테스트 1 FAIL — 단차 **25** |
| gradient 압축 | 테스트 1 FAIL — 단차 **36** |
| `attachment: scroll` 만 | **둘 다 통과** — **검출 공백**(실기기 검증 대상) |

**투명 되돌림에서 테스트 1 은 통과한다** — 투명하면 띠 픽셀이 곧 바탕이라 단차가 0 이다. 그래서 **두 단정이 둘 다 필요**하고 서로 다른 회귀를 문다.

임계값: 대비 **3** 은 **이 머신 실측이 아니라 WCAG 값**(제목 28px heavy = large text) 이라 다른 러너에 그대로 옮겨진다. 단차 **4** 는 실측 바닥 **1** 의 4배이며, 그 1 이 램프가 아니라 **디더**라는 증거는 **가운데 행이 0**(`[1,0,1]`)이라는 것이다 — 램프라면 단조 증가해야 한다.

### 29.7 보고만 하고 고치지 않은 것

| 항목 | 내용 |
|---|---|
| 띠 옆 **gutter 24px 로 그림자가 비침** | `AppColumn` 이 TopBar 를 좌우 24 안쪽에 두어 그 영역엔 **CSS 로 무엇을 해도 띠 배경이 닿지 않는다**. glass 시절부터 같았고 **최대 채널차 5**(219→214) 라 거의 분간되지 않는다. 고치려면 기하 변경 필요 |
| `transition-property` 가 **아무것도 전이시키지 않는다** | `.haru-top-bar` 가 `background-color, box-shadow` 를 전이 대상으로 두는데 `--scrolled` 는 **`background-image`** 를 바꾸고 `box-shadow` 를 주지 않는다. 기본 경로에서 gradient 가 **즉시 교체**된다. 의도한 페이드인지 명세 확인 필요 |
| `/onboarding/:step` **토스트 보정 사각지대** | 위저드가 TopBar 를 `main` 안에서 렌더해 Layout 슬롯이 비어 있다. **현재 온보딩에 토스트를 띄우는 코드가 없어 실제 결함은 없다.** 생기면 위저드 헤더를 가린다 |
| Home 헤더 대비 **미감시** | 스크롤된 띠의 대비를 잴 수 있는 화면이 `/library` 하나뿐이다 — Home 은 `h1` 없이 워드마크 `span` 이라 측정 대상이 없고, 그 위 주간 칩·설정 아이콘 대비는 이 테스트가 보지 않는다 |
| `prefers-reduced-transparency` · `print` 분기 미검증 | Playwright 가 그 media feature 를 에뮬레이트하지 않는다 (CDP 설정 필요 — 프로젝트 설정 변경이라 범위 밖) |

### 29.8 ⚠️ 검증되지 않은 것 — **토스트 진입 애니메이션**

*"위에서 내려왔다가 사라지는"* 움직임은 **픽셀로 확인되지 않았다.** Playwright 가 항상 `reducedMotion: reduce` + `animations: disabled` 로 돌아 keyframe 이 종료 상태로 고정되기 때문이다. **CSS keyframe 소스 가드로만** 고정했다.
→ **사용자 육안 검수 대상**이다.

## 30. 검수 수정 후 QA 4회차와 마무리 결정 (2026-10-10, user)

QA 재검증(커밋 `4f85b8e`) **Verdict `INCOMPLETE`** — `FAIL` 0 이고 **차단 요인은 `QA-3-010` 1건, 코드 문제가 아니었다.**

### 30.1 ⚠️ §29.4 에서 **내가 AC 수준 처리를 빠뜨렸다**

증정 **신청** 제거(`#6`)로 아래 3개 AC 의 **주어가 사라졌는데** 폐기 기록이 없었다 (Orchestrator 가 approvals 전수 grep 으로 **0건** 확인):

| AC | 원문 요지 |
|---|---|
| `AC-3-33` | 증정 신청 CTA → `POST …/gift-requests`(IK) → 접수 안내 |
| `AC-3-35` | `gift-duplicate` 에서 `GIFT_REQUEST_DUPLICATE` 가 중복 안내로 표현된다 |
| `AC-3L-23` | `BookDetailSheet` 의 증정 신청 CTA → IK `POST` + 중복 안내 |

§26.5(`AC-3-34`)·§27.2(`AC-3-86`) 때는 *"이 AC 를 폐기한다"* 를 명시했는데 §29.4 는 **기능 제거와 PRD 수정 대상(`LN-8`)까지만** 적었다. QA 는 요구사항을 스스로 폐기하지 않으므로(`rules/qa.md` §2) 세 건을 `PARTIAL` 로 두었다 — **올바른 처리다.**

**결정 (user): 세 건 모두 폐기 표기.** Plan `:583`·`:585`, Library Plan `:414` 에 반영 완료.
⚠️ **중복 판정·멱등 처리 자체는 contracts·Mock 에 남는다** — 화면에서 도달할 수 없을 뿐이다.

> QA 가 **`AC-3L-23` 의 라벨 선택을 솔직히 밝혔다**: 엄격히 읽으면 UI 트리거가 전부 사라져 `FAIL` 인데, AC 가 이름한 두 메커니즘이 사용자 결정으로 보존되어 실행 증거까지 있다는 이유로 `PARTIAL` 에 뒀고 라벨은 사용자 결정 사항이라고 적었다.

### 30.2 ⚠️ §29.7 수치 정정 — gutter 는 5 가 아니라 **16**

내가 "최대 채널차 5" 로 적은 것은 **과소 기재**였다. QA 실측:

| 위치 | 수정 전 |
|---|---|
| 띠 **안쪽** | **0** (완전 차폐) |
| 좌우 gutter 24px | 최대 **16** |
| 띠 경계 바로 밖 `x369` | **콘텐츠 원색** `[252,206,0]` — 차 **230** |

### 30.3 결정 — **띠를 앱 컬럼 전 폭으로 넓힌다** (user)

구현: `AppColumn` 이 자기 좌우 인셋을 CSS 변수로 내려보내고, `--scrolled` 가 그것을 **음수 margin 으로 되돌린 뒤 같은 크기 padding 을 다시 넣는다.**
→ `width: auto` stretch 박스라 **content box 폭이 345 로 불변** = **제목·아이콘이 1px 도 움직이지 않는다**(`h1 x24` · `trailing right 349` 전후 동일).

**결과 (실측, 393×852)**: gutter 통과 채널차가 네 scrollTop 전부 **0**. 띠 rect `24…369` → **`0…393`** = 컬럼 rect 와 일치.

**≥600px 은 컬럼 border box(480)까지만** 덮는다. 근거: 컬럼 **밖** 60px 의 콘텐츠 통과 채널차가 **y 0…500 전 구간 0**(`/library`·Home 양쪽)이라 **거기로는 콘텐츠가 지나가지 않는다** — 같은 프로브가 컬럼 안쪽에서는 231 을 읽었으므로 민감도 부족이 아니다. 컬럼 밖까지 늘리면 Figma 에 없는 "전 폭 페이지 배너" 가 된다.

신규 토큰 0건 · 임의 HEX·수치 0건.

### 30.4 회귀 테스트가 왜 이걸 못 잡았는지 (기록)

기존 테스트 ①의 **clip 이 띠 rect 자신**이라 **띠가 좁아지면 clip 도 같이 좁아져** gutter 를 볼 수 없었다. 신규 ③·③-b 는 clip 을 **컬럼 rect** 로 잡는다.
되돌림 실험이 그것을 증명한다 — margin/padding 4줄을 빼면 **①② 는 통과하고 ③③-b 만 FAIL**(`Expected: 0 / Received: 24`, 768px 에서 `Expected: 144 / Received: 168`). 기하 단정을 빼고 픽셀 단정만 남겨도 FAIL 한다.

임계값 `OCCLUSION_MAX_CHANNEL_DELTA = 1` — 같은 띠에서 **콘텐츠 가시성만 다른** 측정이라 바닥이 디더가 아니라 **정확히 0** 이어야 한다. 2 로 올리면 scrollTop 60 의 `2` 를 놓친다.

### 30.5 QA 가 "검증 불가" 2건을 **PASS 로 올렸다**

앞선 agent 들이 *"Playwright 가 `animations: disabled` 로 돌아 못 본다"* 로 남긴 것을 **우회**했다:

- **토스트 진입·퇴장 모션** (§29.8) — 애니메이션을 끄지 않은 자작 세션에서 **rAF 26프레임**: `translateY` **−12 → 0**, `opacity` **0 → 1**, 화면 top **52 → 64**. 퇴장은 `transform: none` 의 fade only. Design Spec §9.1 과 일치
- **`prefers-reduced-transparency` · `print`** (§29.7) — **CDP `Emulation.setEmulatedMedia`** 로 직접 에뮬레이트. reduce → 띠·`AppBackground` 둘 다 `rgb(219,238,231)` 단색(경계 없음), print → 둘 다 transparent(흰 종이에 띠 안 남음)

### 30.6 QA 신규 Finding — Low 2건 (차단 아님)

| ID | 내용 |
|---|---|
| **`QA-3-011`** | `e2e/toast.spec.ts:177` 이 **전환 중 `/library/add` 의 TopBar 를 잴 수 있다**(URL 전환과 DOM 커밋 사이). 또 `/auth/log-in`·`/library` TopBar 는 **대화형 요소가 0개**라 `controls` 루프가 **공집합** — 대화형 요소 가림을 실제로 무는 것은 **Home 뿐**이다. 제품 동작은 QA hit-test 로 PASS 확인됐으므로 **테스트 정밀도** 문제다 |
| **`QA-3-012`** | §29.7 gutter 수치 과소 기재 → **§30.2 로 정정**, **§30.3 으로 해소** |

### 30.7 Stage 4 로 이월되는 Mock 보강 2건 (QA 발견)

- **`#4` 를 실브라우저로 재현할 수 없다** — scenario key 가 **그룹 단위**라 `library:error` 가 `getOverview` 까지 실패시켜 `/library` 에 **열 책 행이 0개**가 된다. "목록 성공 + 저장만 실패" key 가 없다 → **`library:save-error` 류 추가 필요**
- **`favorite_only` 가 모든 Mock 시나리오에서 아무것도 렌더하지 않는다** — `purchaseUrl` fixture **0건**이라 `GiftBlock` 이 항상 `null`. `AC-3-32` 는 `TextLink` 단위 증거로 PASS 유지

### 30.8 남은 소관

| 소관 | 할 일 |
|---|---|
| **plan-agent** | (완료 — Orchestrator 가 Plan 3줄 반영) |
| **design-agent** | 허용 차이 `AD-L-*` 부여(시트 간격 12↔6, §29.5) · Design Spec §6.1 *"스크롤 시 glass 배경"* 서술 수정(§29.3) |
| **development-agent** | `QA-3-011` 테스트 정밀도 · Stage 4 Mock 2건(§30.7) · `/onboarding/:step` 토스트 보정(토스트 도입 시) |
| **Stage 8** | Handoff 에 **"증정 신청은 Frontend 에 없다"** 명시 |
| **사용자** | PRD `FR-22` 수정 (`LN-8`, `D-24` 절차) |

## 31. Stage 3 최종 Verdict — 검수 반영 후 (2026-10-10, stage-qa-agent 5회차)

리포트: `docs/qa/stage-3-qa-report.md` §14. 대상 커밋 `fe349cb`.

### 31.1 Verdict

> **`PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`**

**수용 문자열은 3회차(§28)와 동일하다** — 4·5회차가 수용을 추가하지 않았다.
경과: `1회차 FAIL → 2 INCOMPLETE → 3 PASS(accepted) → 4 INCOMPLETE → 5 PASS(accepted)`

⚠️ **두 번의 `INCOMPLETE` 는 모두 코드가 아니라 Orchestrator 의 기록 누락이 원인이었다** (§27.1 집계 전제, §30.1 AC 폐기 표기 누락).

### 31.2 전수 집계

| 대상 | `PASS` | `FAIL`(수용) | `PARTIAL` | `NOT VERIFIED` | 폐기 | 그 밖 | 합 |
|---|---|---|---|---|---|---|---|
| Stage 3 Plan | **69** | 6 | 0 | 0 | **3** | 무효 2 · OoS 3 · 이월 5 | **88** ✅ |
| Library Plan | **37** | 0 | **1**(수용) | 0 | **1** | — | **39** ✅ |

`BACKEND_INTEGRATION_PENDING` **12**(변동 0) · 가값 **6**(변동 0) · **수용·폐기로 덮이지 않은 AC 0건**

**폐기 5건은 `PASS` 로 올리지 않았다** — 요구사항이 없어진 것이라 충족·미충족을 말할 대상이 없다. QA 가 `AC-3L-23` 의 라벨 문제를 *"폐기로 소멸했다"* 로 정리했다.
**중복 판정·멱등 처리는 contracts·Mock 에 그대로 남는다** (QA 가 7개 파일 grep 으로 확인) — `AC-3-36` PASS 유지, `P3-BIP-05`·`24` PENDING 유지.

### 31.3 QA 가 자기 프로브로 다시 잰 것

QA 는 **Orchestrator 가 제시한 "채널차 전부 0" 을 증거로 쓰지 않고** 저장소 밖 자작 프로브(raw chromium + 자작 PNG 디코더)로 **같은 축을 다시 쟀다**:
- 393×852 네 scrollTop 전부 띠 rect **0.0…393.0 = 컬럼 rect**, gutter 통과 채널차 **0**, 가로 overflow 0
- 되돌림 재현 시 좌 **17** · 우 **231**, 좌 프로파일 `1,1,2,3,3,4,5,6,7,9,11,13,15,17`
- 제목·아이콘 불변 (Home 320 의 **`Settings` 아이콘 258.0…296.0 까지** 전후 동일)
- 768 `144.0…624.0` · 1024 `272.0…752.0` = 컬럼 border box
- **컬럼 경계 수직 이음선 0** (QA 가 추가로 본 축) — "전 폭 배너" 회귀 0건이며 **baseline 이 안 바뀐 것이 누락이 아니라 일치의 증거**임을 보였다

### 31.4 `QA-3-013` — 제거된 경로를 안내하던 문구 (수정 완료)

`/library/gift-requests` 빈 상태가 *"You can request a book from its detail sheet."* 로 **방금 제거한 신청 CTA 를 안내**했다. **사용자에게 없는 기능을 쓰라고 말하는 문구**라 묻지 않고 고쳤다.

> **`When a book is gifted to you, its delivery status shows up here.`**

- 사용자가 할 수 없는 동작을 안내하지 않는다 (`request`·`tap`·`sheet` 없음)
- **수동태**로 운영 쪽에서 채워지는 성격을 드러낸다
- 수량·부재 표현 없이 "이 자리를 채우는 것"만 말한다 — `librarySectionEmpty` 의 기존 어법(`show up here`)과 일치
- `emptyTitle`(`No gift requests yet`)은 **유지** — 수치가 없고 화면 이름과 일치하며 `yet` 이 "앞으로 채워질 자리"를 표시한다

**`GiftRequestList.tsx` 헤더 주석도 고쳤다** — *"Empty 안내도 어디서 신청하는지를 알린다"* 로 **이번 결함을 만든 설명이 코드에 남아 있었다.** 남겨두면 되살아난다.

**QA 가 4회차에 못 잡은 이유 (기록)**: grep 패턴이 `/request this book/i` 였는데 이 문구는 `request a book` 이고, 테스트가 그 문구의 **존재를 단정**하고 있어 통과했다. 새 단정은 **3개 리터럴 패턴**(`request (this|a|the|your own) book` · `you can request` · `detail sheet`)을 문구 전체 JSON 에 건다. 옛 문구로 되돌리면 **2 failed** 로 실제로 문다(실측).

### 31.5 남은 소관

| 소관 | 할 일 |
|---|---|
| **design-agent** | 허용 차이 **`AD-L-*` ID 부여**(시트 간격 12↔6, §29.5) · **Design Spec §6.1 수정** — *"스크롤 시 glass 배경"* 뿐 아니라 **"컬럼 전 폭"** 까지 반영 |
| **development-agent** | `QA-3-011`(e2e 정밀도 — 전환 중 측정·공집합 루프) · Stage 4 Mock 2건(`library:save-error` 류 · `purchaseUrl` fixture) · `/onboarding/:step` 토스트 보정 |
| **plan-agent (Stage 4)** | 이월 3건(`QA-3-001`·`002`·`003`) + `AC-3-22`~`26` In Scope 등재 |
| **Stage 8** | Handoff 에 **"증정 신청은 Frontend 에 없다"** · `QA-3-003` · `P3-BIP-19`(표지 교체, 법무) |
| **사용자** | PRD `FR-22` 수정(`LN-8`, `D-24` 절차) · **가값 6건 재제시** 수락 |
| **실기기 확보 시** | `NV-1`(`background-attachment: scroll` 검출 공백 포함) · `NV-2` |

### 31.6 Stage 4 는 사용자 지시가 있을 때 시작한다

`rules/workflow.md` §4 — 한 Stage 승인은 다음 Stage 로 확장되지 않는다.

## 32. 주간 집계 칩 통일 + 유리 재질 (2026-10-10, user)

사용자 지시: *"Library 에 있는 것과 Home 에 있는 것을 **동일한 디자인, 아이콘도 동일하게** 맞추고 **이를 컴포넌트로 등록**해줘"*

### 32.1 원인 — 컴포넌트는 같은데 **CSS 가 화면에 묶여 있었다**

`LibraryTopBar` 가 `HomeWeekSummary` → `WeekSummaryChip` 을 **그대로 쓰고 있었다.** 문제는 외형 CSS 가 `.haru-home-top-bar` 로 범위가 묶여 Home 에서만 적용된 것이다.

| | Home (적용) | Library (기본 `Tag`) |
|---|---|---|
| 높이 · 여백 | 34 · 14 | 26 · 12 |
| 아이콘 | **13×13** · `#d0cca1` | **16** · currentColor |

→ **칩이 자기 클래스(`.haru-week-summary-chip`)로 외형을 소유**하게 하고 규칙을 컴포넌트 옆(`entities/home/home.css`)으로 옮겼다. 공유 `Tag` 전역 기본값은 **건드리지 않았다**.
→ **토큰 이름을 `--home-chip-*` → `--week-summary-chip-*` 로** 바꿨다(값 무변경). 이름이 `home-` 으로 남으면 **다음 사람이 또 화면 범위로 묶는다** — 이번 결함의 원인이 정확히 그 오해였다.
→ **dev gallery 에 등록**했다(`/__dev/ui/components` §32). gallery 에는 TopBar 조상이 없으므로 **거기서 같게 보이는 것 자체가 "칩이 외형을 소유한다"의 증거**다.
→ 위치는 `entities/home/` **유지** — 칩이 그리는 값(`sessionsThisWeek`)과 그 query key·hook 이 같은 엔티티에 있다. 레이어 위반 없음(`pages → features → entities`).

### 32.2 ⚠️ Orchestrator 의 전달 오류 4건 (연쇄)

**내가 앞선 agent 보고를 검증 없이 다음 지시에 옮겨 적어** 네 번 틀렸다. agent 들이 **매번 멈춰서** 바로잡았다.

| # | 내가 전달한 것 | 실제 (MCP·코드로 확인) |
|---|---|---|
| 1 | Figma 칩 배경 = **`#f3f7f6` 단색** | **`glass-fill #ffffffbd` = 흰색 74% 반투명.** `#f3f7f6` 은 **합성 결과**였다. 칩 내부가 균일하지 않은 것(위 `245,250,248` ↔ 중간 `243,247,246`)이 단서였는데 넘어갔다 |
| 2 | `--shadow-glass-rest` = `HARU/Shadow Rest` | **`HARU/Glass Rest`** 다. `--shadow-rest` 가 `HARU/Shadow Rest` 이며 **저장소 주석이 이미 구분해 두었다** |
| 3 | 3겹이라 번짐 **78/22/50**, 클리핑 위험 | **인스턴스는 drop 1겹 + inset 2겹만 렌더**한다. 번짐 **아래 10 · 위 0 · 좌우 3** |
| 4 | 칩→뷰포트에 `overflow` 선언 **없음** | **있다** — `AppShell` 뷰포트가 **Tailwind 유틸리티 `overflow-y-auto`** 다. 보정 불필요 사유는 "박스 없음"이 아니라 **`R-SHADOW-1` ④ 클립 선이 화면 밖** |

**교훈 3건**:
- **렌더 픽셀은 결과이지 선언이 아니다.** 색을 가져올 때 렌더 PNG 샘플링으로 단정하지 말고 **fill 속성을 직접 조회**한다 (`get_variable_defs` / `get_design_context`)
- **Style 이름이 같아도 인스턴스가 그리는 것은 다를 수 있다.** 이 저장소는 `V-10`(말풍선)에서 이미 겪고 `--shadow-bubble` 을 만들었는데 그 선례를 떠올리지 못했다. **렌더 바운드로 검산**하라 — `153×44`(노드 `145×34`)는 1겹, 3겹이면 `257×124`
- **CSS 파일 grep 은 Tailwind 유틸리티를 놓친다** (이번 세션 **세 번째** 사례)

### 32.3 결정 — 유리 재질 전체 (user)

- **배경** = `--color-surface-glass`(`rgb(255 255 255 / 0.74)`) — **Figma `glass-fill` 과 완전 일치, 신규 토큰 0**
- **그림자** = `--shadow-bubble` 값 (**1겹 + inset 2겹**) — 사용자 결정: *"실제 렌더대로 1겹"*
- ⚠️ **`backdrop-filter` 를 주지 않는다** — `26:40` 에 **BACKGROUND_BLUR 가 없다**

**토큰 이름은 `--shadow-bubble` 재사용**으로 결정됐다. `--color-icon-save-star` 때와 **상황이 다르다** — 그쪽은 값이 **우연히 같았던 독립된 두 Figma fill** 이라 갈라질 수 있었고 실제로 갈라졌지만, 이쪽은 **같은 Effect Style 하나**를 바인딩한 것이라 **갈라질 수 없다**. 결합이 사고가 아니라 사실이다. `--shadow-bubble` 은 이미 말풍선 전용이 아니다(`ListGroup`·`ReadingNowCard`).

### 32.4 ⚠️ 허용 차이 — 아이콘 색 (사용자 결정)

| | Figma `50:161` | 구현 |
|---|---|---|
| 아이콘 색 | **`#d0cca1`** | **`#78733c`** |
| 유리 배경 대비 | **1.57:1** (실측 1.01 — 옛 불투명 면) | **4.62:1** (start) · **4.52** (mid) |

Figma 값은 **유리 배경에서도 1.57:1** 로 사실상 보이지 않는다. 사용자가 *"4.5:1 정도로 더 진하게"* 를 택했다.
**hue 54.9° → 55.0°(Δ 0.1°) · 채도 33.3% 동일 · 명도만** 내렸다 → **같은 금색으로 읽힌다**(올리브로 빠지지 않는다).
기각한 후보: `#7a753d`(mid **4.41** 미달) · `#857532`·`#8d7b35`(미달 + hue 48° 로 **눈에 보이는 이동**).

토큰 경로: Tier 1 **신규 `--haru-palette-yellow-700`** → Tier 2 `--color-icon-session-history` **참조만 교체** → Tier 3 **무변경**.
⚠️ **`--color-icon-save-star`(★ Save)는 `#d0cca1` 유지** — 그쪽은 Figma 값 그대로다.
→ **적용 범위는 주간 집계 칩 아이콘뿐.** ID 부여는 design-agent 소관(`AD-L-*`).

### 32.5 회귀 테스트 공백을 메웠다

`e2e/week-summary-chip.spec.ts` 가 배경을 **캡처만 하고 단정하지 않아** 어떤 값을 넣어도 통과했다 — Home↔Library **동일성만** 보기 때문에 **둘 다 틀린 경우**를 못 잡는다. 그림자는 측정조차 하지 않았다.
→ 면·그림자·아이콘 색을 **결정값과 직접 단정**하고, **토큰 해석값과 채널 숫자를 둘 다** 본다("토큰 갈아끼움"과 "둘 다 똑같이 틀림"을 각각 잡는다). 되돌리면 **vitest 2 + playwright 5** 가 깨진다(실측).
→ **두 화면 비교 + Figma 절대값 비교**를 함께 두는 구조가 이번에 값을 했다.

### 32.6 `e2e/top-bar-scrolled.spec.ts` 측정 범위 조정 (보고)

칩이 **스크롤된 띠 안**에 있어 새 그림자가 띠 아래 행을 어둡게 만들었고 접합 단정이 `[3,4,4]` → `[3,4,5]`(상한 4)로 FAIL 했다.
→ **임계값을 올리지 않고**(그 파일 자신이 *"임계값만 올리면 검출력이 사라진다"* 고 경고한다) 접합 측정 시 **칩 그림자 한 겹만 끄도록** 했다. **칩 x 구간을 제외하지 않으므로 칩 뒤 접합선은 계속 본다.** 결과 `[1,0,1]`(문서화된 디더 바닥)로 복귀.

### 32.7 baseline 7종 재생성 — 원인 전부 귀속

`s3-home` · `s3-library` · `s3-library-empty` · `s3-library-favorites-empty` · `s2-home-header` · `s3-library-shelf-sheet` — 변경 픽셀이 **전부 칩 상자 + 번짐 안**이고 최대 Δ **101**(아이콘 blue 채널 161→60).
`v2-material` — **신규 primitive 1개가 토큰 페이지 스와치를 한 칸 늘려** 아래 섹션 y 가 소수점만큼 밀렸고 둥근 모서리 래스터화가 달라졌다(Δ≤3). 대조 실험으로 *"내 변경이 원인이지만 material 값 변화는 아니다"* 를 확인했다.
→ agent 가 지시(상자 밖 변경 불수용)에 따라 되돌렸고, **Orchestrator 가 재생성했다** — 원인이 완전히 규명됐고 **낡은 baseline 을 남기지 않는다**는 원칙이 우선한다.

**강제 전수 재생성 후 74종 해시 동일 — 스테일 0건** (Orchestrator 확인).
