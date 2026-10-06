# Stage 3 Plan — Home · Activity Card · Library · Book Selection · Recommendation (Frontend)

Status: **APPROVED (2026-10-05, user)** — 구현은 **Home 먼저, 검수 후 나머지** 로 나눈다 (사용자 지시 2026-10-05)
Revision: **Rev 4 (2026-10-05, plan-agent)** — ⛔ **Home Figma 전수 재대조 반영.** `CLAUDE.md` **최우선 규칙**(Figma 를 그대로 구현한다, 2026-10-05 신설) + `stage-3-approvals.md` **§12 전체**(§12.1~§12.9) + `docs/design/stage-3-home-figma-audit.md`(§10~§15 재실측·구현 명세). **무효**: `AC-3-11`(폐기) · `AC-3-17`(확장 트리거) · `AC-3-22`~`26`(Reading Context 이월) · `D-14` Home 덱 부분 · `D-7`·`AD-S3-8`(`★ Save` 제외) · `AD-S3-23`. **수정**: `AC-3-06`·`AC-3-10`·`AC-3-14`·`AC-3-16`·`AC-3-18`·`AC-3-66`, `AC-3-19` 유효화. **신규**: `★ Save` contract(`A-9` — `API_CONTRACTS.md` §3.7) · `AC-3-82`~`AC-3-88` · `P3-BIP-15`. 상세 = **§20**. 정본 = `docs/decisions/stage-3-approvals.md` §12.
Revision: **Rev 3 (2026-10-03, plan-agent)** — `stage-3-approvals.md` §9 반영: **D-21**(Prompt 개수 상한 해제 — AC-3-17 재작성 · `questions`·`promptPreview` 상한 제거 · §12 4개 이상 케이스) · **D-22**(`ActivityCard.targetCapability` 삭제) · §9.2 ⑩(`custom_time` picker 를 D-18 에서 분리) · §9.3 PRD 수정 대상 5·6 · §15.1 C-13 서술 갱신. Rev 2 (2026-10-02) — §16 D-1~D-20 전건 승인 결과 기입 · §7.1 `HomeSummary`(`streakDays` 삭제 · `characterLine` 추가)·`Prompt`(`phase`·`pageRef`)·`ActivityCardOption`(`capability`·`promptPreview`)·`CreateGiftRequestRequest` · `StreakChip`→`WeekSummaryChip` 개명 · D-18 알림 설정 화면 Out of Scope · D-17 Mock 전용 시트 route · §10 `P3-BIP-13`·`P3-BIP-14` 추가 · AC-3-80·81 추가. 정본 = `docs/decisions/stage-3-approvals.md`
Based on:
- PRD v1.4 — `docs/source/HARU_PRD_v1.5.md` (FR-07 · FR-08 · FR-19(제외) · FR-20 · FR-22 · FR-23, §6.1 내비게이션 · §6.2 화면 맵 · §7.4 홈 · §7.8 설정 · §8.1 책 라이브러리 · §8.2 Prompt 라이브러리 · §8.3 추천 로직 · §8.4 언어 규칙 · §11 NFR 성능·오프라인·접근성 · §12.1 ActivityCard/Book/PromptCard · §13 증정 대기·책 소진)
- Onboarding Questionnaire v1.1 — `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` (Q1~Q5 → cold-start state vector, Q5 표지 그리드)
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `16:2` MVP_KeyScreen_V.2 (`26:21` Home, `163:2648` Activity card, `30:74` Library, `163:1669` 서재 시트, `145:1132` Book Select), page `8:2` Design Guide (`86:*` Prompt Card/Home, `25:87` Tab Bar, `113:1993` This Week's Shelf, `163:2145` Book List, `17:113` Toggle)
- Scope — `CLAUDE.md` Development Scope, `docs/source/prompts/01-stage0-1-1-frontend-scope.md`
- 승인 문서 — `PLANNING.md` §4.1 · §4.2 · §4.3 · §5 Stage 3 · §6 (M-09·M-14·M-29·M-30·M-31·M-32) · §9.2, `docs/ARCHITECTURE.md` §2.3 · §2.4 · §5 · §6.3 · §13 · §16(OAQ-15), `docs/API_CONTRACTS.md` §1.2 · §2.2 · §4 Stage 3 · §5.3 · §5.4 · §6(G-01~G-07), `docs/DATA_MODEL.md` §7, `docs/COMPONENT_MAP.md` §1 · §2 · §3 · §7, `docs/FIGMA_SCREEN_MAP.md` §1.2 · §2 · §3
- 결정 기록 — `docs/decisions/stage-0-approvals.md` (#9 · #13 · #14 · #15 · #16 · #17 · #19 · #21 · #22 · C-13 · C-16 · **C-17** · D-01 · D-02), `docs/decisions/stage-1-approvals.md` (§1 D-4 에셋 파이프라인 · D-5 scenario 전환 · D-7 Http 골격 · §9 가값), `docs/decisions/stage-2-approvals.md` (§4 D-1~D-17 · **§9 2026-09-28 미결 정리** · §9.3 Stage 배정)
- 선행 Stage — `docs/plans/stage-2-plan.md` (APPROVED 2026-09-25), `docs/design/stage-2-design-spec.md`, `docs/qa/stage-2-handoff.md`, `docs/qa/stage-2-qa-report.md` (Verdict **`PASS`**, 2026-09-28)
- ⛔ **최우선 규칙 — `CLAUDE.md` "Figma 를 그대로 구현한다"** (2026-10-05). 이 Plan 의 다른 모든 항목보다 우선한다.
- Home 재대조 — `docs/design/stage-3-home-figma-audit.md` (감사 §0~§9 · **재실측 §10** · **구현 명세 §11** · 차단 §12 · 미결 §13 · AC 목록 §14 · 구현 순서 §15), `docs/decisions/stage-3-approvals.md` **§12**
- Rules — `.claude/rules/workflow.md` · `architecture.md` · `frontend.md` · `backend.md` · `qa.md`

라벨: `CONFIRMED` (PRD/Figma/사용자 결정으로 확정) · `RECOMMENDED` (근거 있는 권장안, 승인 필요) · `NEEDS DECISION` (사용자/법무/비즈니스 결정 필요)

> 이 Plan은 **Frontend Plan**이다. Backend는 구현 계획을 쓰지 않고 Integration Requirement와 Contract만 정의한다 (`.claude/rules/backend.md`).
> 사용자의 "Stage 3 착수 승인"(2026-09-28)은 **워크플로 시작 승인**이며 Plan/Design Spec 승인이 아니다 (rules/workflow.md §3, 결정 #24). 이 문서 + `docs/design/stage-3-design-spec.md` 가 나온 뒤 승인 체크포인트에서 사용자 승인을 받아야 development-agent가 시작한다.
> **갱신 2026-10-03 — §16 D-1 ~ D-22 22건과 §15.1 C-13 화면 8건은 모두 사용자 승인이 끝났다** (`docs/decisions/stage-3-approvals.md` §3 · §4 · §7 · §7.1 · §8 · **§9**). **D-21**(Prompt 개수 상한 해제) · **D-22**(`ActivityCard.targetCapability` 삭제)는 §9 에서 추가 결정되었다. 승인 결과가 이 Plan 본문의 권장안과 다른 항목(**D-4 · D-5 · D-8 · D-17** = 권장안 기각, **D-18** = 범위 축소)은 **§16 의 `결정` 열이 정본**이며, 결정 기록과 이 문서가 다르면 **결정 기록이 우선한다.**
> **Stage 2-B(`C13-09` 프로필 결과 · `C13-10` 발전 역량 + Guard 프로필 단계 + Stage 2 `D-2`·`D-6`)는 디자이너 Figma 대기 상태이며 Stage 3가 흡수하지 않는다** (stage-2-approvals §3).

---

## 1. Goal

Home 착지 화면을 **콘텐츠가 있는 첫 화면**으로 만들고, 오늘의 Activity Card에서 책과 Prompt와 Context를 고르는 경로, 그리고 서재에서 책을 관리하는 경로를 **Mock 기반 end-to-end**로 성립시킨다. Stage 3가 끝나면 다음이 성립해야 한다.

1. **BottomTabBar가 처음 마운트된다** — Library / Home(가운데) / Progress 3탭 (#15 · D-02). 탭 간 이동과 활성 표시가 동작하고, 고정 방식(`sticky`)과 콘텐츠 하단 여백·Toast offset·중앙 버튼 overhang이 **한 규칙으로 정합**한다 (§16 D-1).
2. `/` Home이 `GET /v1/children/:childId/home` + `GET /v1/children/:childId/activity-cards/today` 를 호출해 **오늘의 역량 배지 · 추천 책 · 추천 이유 · 부모용 코칭 문장**을 담은 3장 덱을 표시하고, 스와이프와 **버튼·키보드 대체 조작**으로 전 카드에 도달할 수 있다 (FR-07, §7.9, WCAG 2.5.1).
3. 카드 옵션 선택 → `POST /v1/activity-cards/:cardId/selection` → **대화 Prompt 목록 + 코칭 문장 + Follow-up** 이 표시된다 (FR-07, 노출 시점은 §16 D-4). **개수 상한은 없다** — 접힌 상태 표시 3개 + 확장 도달 (§16 **D-21**, N-2).
4. Reading Context(지금 / 잠자리 전 / 하원 후 / 주말 아침 / 차 안 / 직접 시간)를 선택하면 선택 요청에 포함된다 (FR-08 Frontend 부분).
5. `/library` 서재가 증정·보유 책, 읽은 책 히스토리, 책별 Prompt 보기를 표시하고, **보유 책 직접 등록**(DB 검색 + 제목 직접 입력)과 **증정 신청·배송 상태**가 Mock으로 동작한다 (FR-20 · FR-22 · FR-23).
6. **push 권한 사전 안내 → 권한 요청 → 기기 등록** UX 가 Web + Mock 으로 동작한다 (FR-08 Frontend 부분, C-16 · D-16). **갱신 2026-10-02 — D-18 (§8.4)**: `/settings/notifications` **알림 설정 화면(카드 갱신 시간 · 리마인더 요일/시간 입력)은 Stage 3 에서 제외**되고 디자이너 Figma 요청 후 이월된다. push 권한 Port·Web 구현·Mock·contracts 정의는 유지한다.
7. PRD §13 예외 2건의 Frontend UX가 동작한다 — **증정 책 미보유·배송 대기**(직접 입력 또는 대화 전용 안내, 배송 상태는 서재), **추천할 책 소진**(재독 카드 + 대화 전용 카드).
8. NFR 오프라인 — 네트워크가 없으면 **최근 Activity Card 캐시**를 표시하고 Offline Banner를 함께 노출한다.
9. `packages/contracts` 에 Stage 3 도메인 schema(home · activity · prompts · library · gift-requests · notifications · push-devices)가 추가되고 단위 테스트로 보증된다. **`BookSummary` 는 Stage 2 최소 형태를 유지한 채 `LibraryBook` 이 이를 포함한다** (비파괴적 확장).
10. **책 표지·캐릭터 래스터 에셋(C-17)이 Stage 1 `D-4` 파이프라인(AVIF + WebP + PNG, `<picture>`+`srcset`, 해상도 상한)으로 처음 실사용된다.**
11. Backend 런타임 코드(`apps/api/`, `supabase/`)와 Stage 4 산출물(`apps/mobile`)이 여전히 **존재하지 않는다**.

**Non-Goal**: 세션 생성·녹음·Prompt Drawer·Pause/Resume·업로드(Stage 4), 회고·분석·짧은 피드백(Stage 5), 추천 로직의 Warm 전환·프로필 갱신(Stage 6), `/progress` 리포트 화면 내용·주간 지표(Stage 7), 데이터 관리·탈퇴(Stage 8), **Stage 2-B 프로필 결과·발전 역량 화면**. 출석 스티커(FR-19)는 세션 완료에 종속되므로 Stage 4다. 다음 Stage 기능의 선행 구현은 QA에서 `FAIL` Finding이다 (rules/qa.md §2).

---

## 2. In Scope

표기: **[FE]** Frontend 구현 · **[C·M]** contracts 정의 + Mock · **[HO]** Backend Handoff 요구사항 기록만 · **[기술 요구사항]** PRD에 직접 문장은 없으나 근거 요구사항 ID를 위해 필요한 항목.

### 2.1 요구사항 ID별

| ID | 근거 | Stage 3에서 하는 부분 | Stage 3에서 하지 않는 부분 |
|---|---|---|---|
| **FR-07** (오늘의 Activity Card 일일 생성, 카드 덱 3장 스와이프, 책 선택 후 Prompt 2~3개, P0 — **PRD 원문 인용**. 실제 확정 동작은 Prompt **선택 전** 노출(D-4) + **개수 상한 없음**(D-21)이며 PRD 는 수정 대상 §18 ⑨) | PRD FR-07, §7.4, §7.9, §12.1 / M-09 · M-30 · M-31 | [FE] `/` Home 콘텐츠 — 역량 배지(#14 라벨 · #19 색) · 추천 책(표지·제목·추천 이유 1~2문장) · 부모용 코칭 문장 · 3장 덱(`SwipeDeck` depth 3 재사용, §16 D-14) · `PageIndicator` · 캐릭터 일러스트 + 버블 · streak · 이번 주 세션 수 · 지난 세션 하이라이트 한 줄. 옵션 선택 → Prompt 공개. [C·M] `GET …/home`, `GET …/activity-cards/today`, `POST /v1/activity-cards/:cardId/selection` | 서버 07:00 카드 생성·역량 순환 스케줄·추천 알고리즘([HO]). Warm 추천(Stage 6). 카드에서 **세션 시작 실행**(Stage 4 — CTA 처리는 §16 D-3) |
| **FR-08** (세션 Context 선택 + 초대형 푸시 알림, P0) | PRD FR-08, §7.4 규칙, §7.8 / C-16 · #7 | [FE] Reading Context 선택 시트(6값 + 직접 시간) → `SelectActivityOption.readingContext`/`customTime`. `/settings/notifications` 카드 갱신 시간·리마인더 요일/시간·push on/off. **push 권한 사전 안내 → 권한 요청 → 기기 등록** UX (Web Notification API + platform adapter Mock, §16 D-16). [C·M] `GET/PUT /v1/notification-preferences`, `POST /v1/push-devices`, `DELETE /v1/push-devices/:id` | 실제 push 발송·초대형 문구 생성·시간 미지정 Context의 평균 시간대 학습([HO]). **네이티브 Push Adapter는 Stage 4**(#7). deep link 진입 화면(Stage 5 `/session/:id/feedback`) |
| **FR-20** (서재 — 증정·보유 라이브러리, 보유 책 직접 등록, 읽은 책 히스토리, 책별 Prompt 보기, P1) | PRD FR-20, §8.1 / M-14 | [FE] `/library` — This Week's Shelf 캐러셀 · "Our curated shelf" 시트 · 읽은 책 히스토리 목록 · BookDetailSheet(책별 Prompt). 필터 `owned` / `gifted` / `history`. [C·M] `GET /v1/children/:childId/library?filter=&cursor=`, `GET /v1/books/:bookId/prompts?childId=` | "My Saved" 북마크 · 책 평점 · "Reading now · 3 of 5 nights" 다회차 읽기 계획 = **PRD 근거 없음**(G-04, M-14 — §16 D-7). 히스토리의 세션 링크(Stage 4·5) |
| **FR-22** (책 라이브러리·증정 프로그램 — 큐레이션 20권, 신청 기반 증정, 구매 링크, P0) | PRD FR-22, §8.1, §13 / DATA_MODEL §7 | [FE] 증정 신청 CTA(BookDetailSheet) · `/library/gift-requests` 신청·배송 상태 목록 · 구매 링크(외부). [C·M] `POST /v1/children/:childId/gift-requests`(IK), `GET /v1/children/:childId/gift-requests`, `GIFT_REQUEST_DUPLICATE` | 실제 B2B 주문·배송·상태 전이·**배송지 PII 저장**([HO] + §16 D-15 NEEDS DECISION). 큐레이션 20권 콘텐츠 제작([HO]) |
| **FR-23** (보유 책 직접 입력·등록, P0) | PRD FR-23, §7.2 규칙, §8.1 | [FE] `/library/add` — 카탈로그 검색(Stage 2 `GET /v1/books/search` 재사용) + **검색 결과 없음 → 제목·저자 직접 입력**. 등록된 책이 덱·서재·상세에 나타난다. [C·M] `POST /v1/children/:childId/library/books`(IK) → `LibraryBook` | 직접 등록 책의 **범용 Prompt 콘텐츠 제작**([HO]). 등록 책으로 세션 시작(Stage 4) |
| **홈 보조 요소** (FR ID 없음) | PRD §7.4 "보조 요소" / M-30 · G-02 | [FE] **`WeekSummaryChip`**(이번 주 기준 — `StreakChip` 에서 개명, `stage-3-approvals.md` §8.5 ④) · 이번 주 세션 수 · 지난 세션 하이라이트 한 줄 · **캐릭터 버블 `characterLine`**(§8.5 ①). 값은 `HomeSummary` 응답만 표시 | **연속 일수(`streakDays`) 표시·필드 모두 삭제**(달성률 언어) · **누적 읽기 분("115 Min") 미표시** — D-6 확정 (2026-09-29, §3) |
| **내비게이션 — BottomTabBar 마운트** (기술 요구사항) | PRD §6.1 / **#15 · D-02** · `S1-E-3` | [FE] `TabLayout` 실사용, 3탭(Library / Home / Progress) + 중앙 강조 Home 버튼. 활성 표시·키보드·접근성 이름. 고정 방식과 여백 규칙 정합(§16 D-1). `/progress` 탭 목적지(§16 D-2) | 리포트 화면 내용(Stage 7). `/session` 탭 = **없음**(#15) |
| **알림 설정 진입** (FR ID 없음) | PRD §7.8 / **C-16** | ~~[FE] `/settings` 목록에 알림 설정 1행 추가~~ → **Stage 3 제외 (D-18, §8.4)** — `/settings` 는 로그아웃 1행 유지 | 아이 프로필 수정·설문 재응답·발전 역량 변경(Stage 6), 데이터 관리·탈퇴(Stage 8) |
| **NFR 성능 — Activity Card 로딩 2초 이내** | PRD §11 | [FE] Skeleton·낙관적 캐시 표시로 체감 지연 최소화, 초기 렌더 blocking 요청 최소화. 표지 이미지는 `loading`/`decoding` 속성과 해상도 상한 적용 | 실 API 2초 달성 = `BACKEND_INTEGRATION_PENDING` |
| **NFR 오프라인 — Activity Card 최근 카드 캐시** | PRD §11 | [FE] `activityCardKeys.today` 결과 캐시 + 오프라인 시 캐시 표시 + Offline Banner. 저장 방식 §16 D-11. **아동 이름·전사 등 민감 데이터는 캐시 제외**(ARCHITECTURE §6.3) | 서버 캐시 정책([HO]) |
| **NFR 접근성** (WCAG AA, 터치 타깃, 텍스트 의존 최소화) | PRD §11 / D-01 · S1-G-2 · P-01·P-02·P-04·P-05·P-16·P-17 | [FE] 덱·캐러셀·시트·탭바에 **제스처 전용 금지**(WCAG 2.5.1) — 버튼·키보드 1급 경로. 표지 이미지 `alt` 필수. 탭바 활성 상태의 비색상 표시. `prefers-reduced-motion`. 200% 텍스트 reflow | 전체 화면 감사·스크린리더 실기기(Stage 8) |
| **NFR 프라이버시 — 로그 PII 금지 / 제3자 SDK 없음** | PRD §11 / ARCHITECTURE §13 | [FE] 아이 이름·책 제목 조합을 콘솔·에러 리포트에 남기지 않음. **push provider SDK를 Stage 3에 도입하지 않는다**(§16 D-16). 증정 배송지를 Frontend 로컬에 저장하지 않는다 | 서버 audit log·push payload PII 최소화([HO]) |
| **PRD §13 예외 — 증정 책 미보유·배송 대기** | PRD §13 / PLANNING §4.3 | [FE] 증정 신청 접수 후 **보유 책 직접 입력 또는 대화 전용 세션 안내**, 배송 상태는 서재에서 확인. `gift-pending` · `gift-duplicate` 시나리오 | 배송 운영([HO]) |
| **PRD §13 예외 — 추천할 책 소진** | PRD §13, §8.3 / PLANNING §4.3 | [FE] **재독 카드(새 Prompt 세트) + 대화 전용 카드**로 대체 표시. `books-exhausted` · `reread-option` · `conversation-only-option` 시나리오 | 대체 카드 규칙·운영팀 라이브러리 보강 알림([HO]) |
| **기술 요구사항 — 진행 중 세션 안내** | ARCHITECTURE §10 / §5.4 `session-already-active` | [FE] `HomeSummary.activeSession` 존재 시 Home에 **이어하기 안내**를 표시한다 (표시만). 진입 대상 화면은 Stage 4 | `POST /v1/sessions` · 세션 화면 · 전이(Stage 4) |
| **기술 요구사항 — Stage 3 Shared UI** | COMPONENT_MAP §1 | [FE] `SectionHeader` · `Carousel` · `Toggle` 3종 추가(28 → 31) + `ListRow` media·meta 변형 확장. 범위·근거는 §16 D-14 | `StatTile`(S7) · `TextArea`·`StarRating`(S5) · `PromptCarousel`(S4) |
| **기술 요구사항 — 에셋 파이프라인 실사용** | **C-17** · stage-1-approvals D-4 | [FE] 책 표지·캐릭터 래스터를 AVIF+WebP+PNG로 산출(`pnpm assets:optimize`), `<picture>`+`srcset`, 해상도 상한. **`sharp` devDependency 설치가 Stage 3에서 처음 필요**(§16 D-13) | 실제 표지 CDN·서버 리사이즈([HO]) |
| **기술 요구사항 — Stage 2 이월 정리** | stage-2-approvals §9 · WORKFLOW_STATE §3 | [FE] `S2-CONSENT-1`(`signup_oauth` 구분) 구현, `S1-E-3` 확정 반영(§16 D-1), `S2-ONB-2` 처리(§16 D-12) | §17 참조 |

### 2.2 산출물 요약

- `packages/contracts` Stage 3 도메인 schema + 신규 enum — §7.1
- `packages/ui` Shared UI 3종 추가 + `ListRow` 변형 확장 (28 → 31) — §9.2
- `apps/web` route 5개 추가 · feature 6개 · entity 4개 · Mock 도메인 6개 추가 — §9.3
- `docs/plans/stage-3-plan.md`(이 문서), `docs/design/stage-3-design-spec.md`(design-agent), `docs/qa/stage-3-handoff.md`(development-agent), `docs/qa/stage-3-qa-report.md`(stage-qa-agent)

---

## 3. Out of Scope

### 3.1 다음 Stage로 넘기는 항목 (선행 구현 금지)

| 항목 | 이관 Stage | 근거 |
|---|---|---|
| **Stage 2-B — `C13-09` 프로필 결과 · `C13-10` 발전 역량 + Route Guard "프로필 결과 확인" 단계 + Stage 2 `D-2`(score null 표시)·`D-6`** | 2-B (디자이너 Figma 도착 후) | stage-2-approvals §3. **Stage 3가 흡수하지 않는다.** `CapabilityDiamondChart`·`PersonaCard` 를 Stage 3에서 만들지 않는다 |
| 세션 생성·세션 화면·녹음·Pause/Resume·Prompt Drawer(`88:960`)·`PromptCarousel`·업로드, `POST /v1/sessions`, `POST /v1/sessions/:id/transitions`, `apps/mobile` Capacitor 셸, 네이티브 Push Adapter | 4 | FR-09~FR-11 · #7. Home·서재의 "Start Session" CTA 처리는 §16 D-3 |
| 출석 스티커(FR-19), `AttendanceStickerChip` | 4 | 세션 완료에 종속 |
| 회고·분석 상태·짧은 피드백, `TextArea`·`StarRating` | 5 | FR-12 · FR-13 |
| Warm 추천 전환·프로필 갱신·`cold-to-warm`·`persona-changed`·`difficulty-lowered`, 설정의 아이 프로필 수정·설문 재응답·발전 역량 변경 | 6 | FR-15 · C-16 |
| `/progress` 리포트 화면 내용·주간 지표(G-01)·`StatTile`·`WeeklyReadingChart`·`CapabilityProgressRow`·`NotableQuoteCard`·PDF | 7 | FR-16~FR-18 · M-10. Stage 3는 **탭 목적지만** 다룬다 (§16 D-2) |
| **알림 설정 화면** `/settings/notifications`(카드 갱신 시간 · 리마인더 요일/시간 입력 UI) + `/settings` 의 알림 설정 행 | 디자이너 Figma 도착 후 Stage | **D-18** (2026-10-02, `stage-3-approvals.md` §8 · §8.4) — Figma 누락(`C13-19`). **push 권한 Port·Web·Mock·contracts 정의는 Stage 3 유지**(D-16). QA 는 FR-08 설정 화면 부분을 Out of Scope 로 기록(FAIL 아님) |
| 데이터 관리·탈퇴·동의 이력 보기, Mock 웹 프리뷰 배포 | 8 | C-15 · C-19 · C-18 |
| 동의 **철회** UI·Contract·`consent-revoked` | 없음 (MVP 제외) | **C-4** |
| ~~"My Saved" 북마크~~ · 책 평점 · 다회차 읽기 계획(`ReadingNowCard`) · 주간 Progress 지표 · 리포트 이메일 | 결정 전까지 없음 | G-01 · G-04 · G-11 (M-10 · M-11 · M-14) — §16 D-7 에서 기각안 제시. ⛔ **부분 개정 (Rev 4 — approvals §12.8 `A-9`)**: **책 저장(`★ Save`)은 In Scope 로 복귀**한다 (Figma `I86:438;86:383;117:973` 에 실재 + 사용자 결정) → §20.3 · `API_CONTRACTS.md` §3.7. **평점 · reading plan · 주간 Progress · 리포트 이메일은 그대로 Out of Scope** (`D-7` 의 그 부분은 유효). Library 의 **저장 목록 화면**은 다음 라운드 |
| **Reading Context 선택 UI** (6값 시트 · `custom_time` picker · `AC-3-22`~`26`) | **별도 디자인 요청 후 재배정** | **approvals §12.3 ⑧** (2026-10-05) — Figma 카드 앞면에 **진입점이 없다**. 그 자리는 `★ Save` 다. **contract 는 유지**하고 진입점만 없다. `D-9` 결정도 함께 이월 |
| **Library 의 저장 표면 ("My Saved" 목록 · `LibraryFilter=saved` · 저장 해제 UI)** | **다음 라운드 (Stage 3 Library)** | **approvals §12.8 `A-9`** — *"저장 결과를 보는 Library 화면은 다음 차례"*. Home 라운드는 **저장 동작과 contract 까지**다 |
| 카드 앞면의 `Remember tonight` Overlay (`86:512`/`86:545`) | 없음 (미채택) | audit §12 `A-17` ⓑ 기각 — 다른 컴포넌트(`Prompt Card/Min/*`)이고 앞면 높이가 377→452 로 커져 §11 기하가 전부 바뀐다. 코칭 문장은 **뒷면 beige 노트**가 담당 |
| Stage 4~8 scenario key(`invalid-transition`·`mic-permission-denied`·`upload-*`·`analysis-*`·`report-*`·`deletion-*` …) | 각 Stage | API_CONTRACTS §5.4 최초 FE Stage |
| 나머지 도메인 `Mock<Domain>Api`(sessions · recordings · analysis · reports · data-management) | 각 도메인 Stage | Stage 1 D-8 — 빈 stub 파일도 만들지 않는다 |

### 3.2 Backend 구현 항목 (이 프로젝트에서 구현하지 않음)

`apps/api/`, `supabase/migrations`, `supabase/seed`, RLS Policy, Storage Server Logic, Express route/controller/service/repository, 추천 엔진, Prompt 라이브러리 생성, push 발송 worker, 07:00 카드 생성 cron, STT/AI Backend, Analysis Worker, Render Backend 배포, Production DB schema 적용 — 전부 **생성 금지** (CLAUDE.md Development Scope, rules/backend.md §1).

Stage 3는 **추천·콘텐츠·운영(증정 배송)·push 발송**이라는 새 Backend 축을 연다. 전부 `packages/contracts` 와 `docs/API_CONTRACTS.md` 로만 표현하고, 실제 동작 검증은 `BACKEND_INTEGRATION_PENDING` 으로 기록한다 (§10).

---

## 4. Dependencies

| 구분 | 항목 | 상태 |
|---|---|---|
| 선행 Stage | Stage 2 QA Verdict **`PASS`** (2026-09-28), In Scope 65건 중 FAIL·PARTIAL·NOT VERIFIED 0 | **완료** |
| 선행 Stage | Stage 2 미결 항목 사용자 결정 (stage-2-approvals §9 — `S2-ONB-1`·`S2-CONSENT-1`·`S2-COPY-1`·`S2-HOME-1`·`S1-G-6`·`S2-CARD-1`·`S2-WELCOME-1`) | **완료** (2026-09-28) |
| 선행 결정 | #9 Stack 외 라이브러리 · #13 키 · #14 라벨 · **#15 내비게이션** · #16 세션 모델 · #17 상수 · #19 역량 색 · #21 아이콘 · #22 공통 상태 · **C-16 설정 목록 확장** · **C-17 에셋 권리** · D-01 · **D-02 탭 구성** | **완료** |
| 선행 구현 | `packages/contracts` common 5 · enum 26 · rule 3 + auth·me·consent·onboarding·children·books / Shared UI **28종**(`SwipeDeck` 포함) / `apps/web` router·layout(`TabLayout` 포함)·providers·Mock 인프라·`request-log`·Route Guard 순수 함수 | **완료** (Stage 1·2) |
| 병행 | **Stage 2-B** — `C13-09`·`C13-10` 디자이너 Figma 대기. 도착 시 별도 흐름으로 처리하며 Stage 3와 **범위를 섞지 않는다** | **대기 — Stage 3 비차단** |
| 디자인 | **Figma 누락 화면 8건 — C-13 절차 필요** (§15.1). Orchestrator가 화면마다 ① 디자이너 Figma 요청 ② design-agent 명세 중 선택을 사용자에게 묻고 **승인 후에만** 디자인·구현 | **승인 필요 — design 단계 진입 조건** |
| 디자인 | **Home IA 확정 불가** (M-30) — `26:21` 프레임에 Activity Card가 배치되어 있지 않고, 카드 변형(`163:2648` · `86:438` · `86:512/545`)마다 코칭 문장·Context·Prompt 구성이 다르다 | **§16 D-6 — 구현 착수 전 필수** |
| 디자인 | Design Spec §5.2 · §4.12 · §6.2 가 아직 **`fixed` 전제**의 하단 padding 기술을 유지 (Stage 1 Design Spec §2.2 확인 필요 주석) | **§16 D-1 — 구현 착수 전 필수** |
| 에셋 | **책 표지 래스터**(`145:929–145:1010`, `163:2531–2534`, `113:1992`) · 캐릭터(`26:22` home, `163:2642` bookworm) export. 권리 확보됨(C-17). Stage 1 `D-4` 파이프라인 첫 실사용. **`sharp` 미설치** | **§16 D-13 — 구현 착수 전 필수** |
| 가값 | **P-02**(비텍스트 대비 — CapabilityBadge 흰 글자 1.56~1.86:1 · ProgressBar 1.73~1.94:1 · Chip 경계)가 Stage 3 덱 카드·서재에서 **대량 실사용**된다. P-01 · P-04 · P-05 · P-16 · P-17도 사용처가 있다 | 차단 아님 — §17.3 |
| 미결 제품 결정 | **M-09**(Prompt 노출 시점) · **M-14**(서재 개념) · **M-29**(Prompt phase/page) · **M-30**(홈 IA) · **M-31**(덱 카드별 역량) · **M-32 잔여**(Context 없이 세션 시작) — PLANNING §5 Stage 3 "Blocking decisions" | **§16 D-4 · D-5 · D-6 · D-7 · D-8 · D-9 — 승인 필요** |
| 미결 기술 결정 | **OAQ-15** Activity Card 07:00 갱신 시간대 기준 | **§16 D-10** |
| 법무·운영 | 증정 **배송지 저장 위치**(DATA_MODEL §7 "NEEDS DECISION 운영·법무"), push provider 선정(PLANNING §7-6 OneSignal 권장), L-02 약관 본문 | 미결 — Stage 3 Frontend 비차단 (§14) |
| 미결정 사항 | §16 D-1 ~ D-20 — **20건 전건 승인 완료** (2026-09-29 / 10-01 / 10-02, `stage-3-approvals.md` §3·§7·§7.1·§8) | **해소** (D-4·D-5·D-8·D-17 은 권장안 기각, D-18 은 범위 축소 — §16 `결정` 열 참조) |

**Blocking decisions (단계별)**

- **Plan 작성 단계: 없음.** 이 문서가 §16으로 미결 항목을 전부 제시한다.
- **Design 단계: 있음 —**
  1. **C-13 화면 8건**(§15.1)의 디자인 소스 선택. C-13이 정한 정규 절차이며 승인 전에는 디자인·구현하지 않는다.
  2. **§16 D-1**(BottomTabBar 고정 방식·여백 규칙) — 화면 골격이 바뀌므로 Design Spec 작성 전에 정해야 한다.
  3. **§16 D-6**(홈 IA / M-30) — 덱·버블·streak의 배치가 정해지지 않으면 Home Design Spec을 쓸 수 없다.
  4. **§16 D-4**(Prompt 노출 시점 / M-09) — 카드 앞면·뒷면 구성이 바뀐다.
  5. **§16 D-5**(덱 카드별 역량 / M-31) — 배지 개수·위치가 바뀐다.
- **구현 단계: 있음 —**
  1. **§16 D-13**(에셋 파이프라인·`sharp` 설치) — 표지 이미지 없이는 Home·서재가 성립하지 않는다.
  2. **§16 D-3**("Start Session" CTA의 Stage 3 동작) — Stage 4 경계.
  3. **§16 D-2**(`/progress` 탭 목적지) — 탭바를 마운트하는 순간 필요하다.
  4. **§16 D-7**(서재 개념 / M-14) — contract 필드가 바뀐다.
  나머지 D 항목은 권장안대로 진행 가능하다.

---

## 5. Frontend Architecture Impact

Stage 3는 ARCHITECTURE의 **탭 내비게이션 · 추천 도메인 · 오프라인 캐시 · 에셋 파이프라인**을 처음 실체화한다. 새로운 구조 결정은 §16 외에는 없다.

### 5.1 Tab Shell — `TabLayout` 첫 실사용 (Design Spec §2.3, #15 · D-02)

```
AppShell (뷰포트 스크롤 컨테이너, 전 폭)
  └ AppColumn (320–480 가운데 정렬, gutter 24, safe-area)
      ├ .haru-app-shell__bar-top     position: sticky; inset-block-start: --layout-safe-top
      ├ main  flex-1                 ← 콘텐츠
      └ .haru-app-shell__bar-bottom  position: sticky; inset-block-end: --layout-safe-bottom
            └ BottomTabBar (Library / Home 중앙 / Progress)
```

- Stage 1이 구현한 구조는 **`sticky`** 다 (`apps/web/src/app/layouts/app-shell.css`, stage-1-handoff §18.2). `main` 이 `flex-1` 이므로 콘텐츠가 짧아도 탭바는 뷰포트 하단에 온다.
- `sticky` 는 **흐름 안**에 있어 콘텐츠를 덮지 않는다 → `--layout-tabbar-height` 하단 padding이 **불필요**하다. 반면 **중앙 버튼 overhang 35**(`--layout-tabbar-center-overhang`, Figma `140:2983` top=-35)는 바 위로 튀어나와 콘텐츠를 덮는다.
- Design Spec §5.2 · §4.12(Toast) · §6.2는 아직 `fixed` 전제의 "하단 padding = `--layout-tabbar-height` + `--layout-safe-bottom`" 기술을 유지하고 있다 (Design Spec §2.2 확인 필요 주석). **§16 D-1에서 한 규칙으로 확정**한다.
- 탭 항목 3개는 `items` config로 주입한다(COMPONENT_MAP §1). 아이콘은 `S1-D2-5` 확정값 — Library = Lucide `book`, Progress = Lucide `chart-no-axes-column-increasing`, Home = HARU SVG(`140:2971`).
- `/progress` 탭의 Stage 3 목적지는 §16 D-2. **Stage 7 화면을 선행 구현하지 않는다.**

### 5.2 Activity Card 도메인 경계 (rules/architecture §3 — `features/A → features/B` 금지)

| feature | 책임 | 조합 지점 |
|---|---|---|
| `features/activity-card-deck` | 오늘 카드 조회, 덱 index 상태, 옵션 선택 mutation, 오프라인 캐시 표시 | `pages/home` |
| `features/book-selection` | 선택 결과의 Prompt 공개(카드 뒷면 또는 별도 상태), 코칭 문장·Follow-up 표시 | `pages/home`, `pages/library` |
| `features/reading-context` | Context 선택 시트(6값 + 직접 시간), 선택값을 상위로 반환 | `pages/home` |
| `features/library` | 서재 목록·필터·시트, 책 상세, 보유 책 등록, 증정 신청 | `pages/library` |
| `features/notification-preferences` | **push 권한 사전 안내·요청·기기 등록만** (D-16). **알림 설정 폼은 Stage 3 제외 — D-18 (§8.4)** | `pages/settings` |
| `features/settings` | **Stage 3 변경 없음** — 설정 목록은 로그아웃 1행 유지 (D-18 로 알림 설정 행 제외, §8.4) | `pages/settings` |

- `book-selection` 과 `reading-context` 는 서로를 import하지 않는다. "옵션 선택 + Context" 를 하나의 요청으로 보내는 조합은 **`pages/home`** 이 한다. 공유 상태가 필요하면 `shared/lib` 의 순수 함수 + props 주입으로 푼다.
- `entities/*` 신설: `home`(homeKeys · useHomeSummary) · `activity-card`(activityCardKeys · useTodayActivityCard · useSelectActivityOption · `ActivityOptionCard`·`CapabilityBadge`·`CoachingNote`·`PromptPill`·`ReadingContextChip`) · `library`(libraryKeys · useLibrary · useAddOwnBook · useGiftRequests · `BookShelfItem`·`BookListRow`) · `notification`(notificationKeys · useNotificationPreferences · useRegisterPushDevice). `entities/book` 은 Stage 2의 검색 hook에 `BookCover` · `BookSummaryView` 를 추가한다.
- **Component는 API Client·Adapter를 직접 호출하지 않는다** (ARCHITECTURE §2.3). Stage 2 규약 그대로.

### 5.3 오프라인 Activity Card 캐시 (NFR 오프라인, ARCHITECTURE §6.3)

```
useTodayActivityCard()
  ├ TanStack Query (activityCardKeys.today(childId))
  └ ActivityCardCache (shared/lib/activity-card-cache)   ← 저장 방식 §16 D-11
        write: 성공 응답을 contracts parse 후 저장 (cardId · date · options)
        read : 네트워크 실패 시 1회 (schemaVersion·date 검사)
        clear: 로그아웃 · schemaVersion 불일치 · parse 실패 · 날짜 경과
```

- 캐시는 **contracts schema로 읽을 때·쓸 때 모두 parse** 한다. parse 실패 = 폐기.
- **캐시 대상은 Activity Card 하나**다. `HomeSummary`(streak·하이라이트 한 줄) 와 서재 목록은 캐시하지 않는다 — 하이라이트 한 줄은 아이 발화 파생 텍스트라 로컬 잔존을 최소화한다 (ARCHITECTURE §6.3 "아동 이름·전사 등 민감 데이터 캐시 제외").
- 캐시 표시 시 **Offline Banner(InlineAlert tone=offline)** 를 함께 노출하고, "오늘 카드"가 아니면 날짜를 밝힌다. 오프라인 상태에서 선택 mutation은 막는다(Stage 3에 outbox를 만들지 않는다 — Stage 4 UploadQueue와 혼동 금지).
- 로그아웃 시 `session-cleanup.ts`(Stage 2)에 캐시 삭제를 **추가**한다.

### 5.4 에셋 파이프라인 첫 실사용 (C-17, stage-1-approvals `D-4`)

```
원본 (Figma export / OneDrive)
  → pnpm assets:optimize   (devDependency sharp — §16 D-13에서 설치)
  → AVIF + WebP + PNG, 해상도 상한 1440 / 696 / 360 / 216
  → <picture> + srcset (packages/ui 또는 entities/book 의 BookCover)
```

- **Stage 3는 표지를 번들 에셋으로 다룬다** — Mock fixture의 `coverUrl` 은 번들 에셋 경로를 가리킨다. 실 서비스의 원격 표지 URL(CDN)은 `BACKEND_INTEGRATION_PENDING` 이다. `BookCover` 는 두 경우를 모두 받을 수 있게 `src` 를 props로 받고 **어떤 경로 규칙도 컴포넌트에 하드코딩하지 않는다** (§16 D-13).
- `BookCover` 는 `placeholder` variant(표지 없음 — pastel 대체 + 제목, Figma `113:1991`)를 반드시 갖는다. 직접 등록 책(`user-entered-book`)과 표지 로드 실패가 이 경로를 쓴다.
- **표지 이미지에는 `alt` 가 필수**다. 장식이 아니라 책 식별 정보다 (COMPONENT_MAP §2 "alt 필수").
- Figma placeholder 데이터(표지 ↔ 제목 불일치 `113:1992` 등, M-36)를 fixture로 복사하지 않는다.

### 5.5 Privacy (Architecture Requirement, ARCHITECTURE §13 — Stage 3 해당분)

| 통제 | Stage 3 Frontend 책임 (검증 가능) |
|---|---|
| 로컬 캐시 최소화 | Activity Card만 캐시, `HomeSummary.lastHighlightLine`·서재 목록·증정 배송지는 캐시하지 않음 (§5.3) |
| 로그 PII 금지 | 아이 이름·하이라이트 문장·책 제목 조합을 `logger`·`devWarn`·에러 바운더리에 넣지 않음. Mock 요청 로그(`request-log`)는 dev 전용 유지 |
| 제3자 SDK 없음 | **push provider SDK(OneSignal 등)를 Stage 3에 도입하지 않는다** — Web Notification API + platform adapter Mock만 (§16 D-16). 광고·분석 SDK 0건 |
| 증정 배송지 | Stage 3 Frontend는 배송지를 **입력받지 않는다** (§16 D-15 권장안). 저장 위치가 미결이므로 아동 데이터와 결합되는 성인 PII를 Frontend에 두지 않는다 |
| push 토큰 | `POST /v1/push-devices` 로 전송만 하고 로컬 저장소에 남기지 않는다. 로그아웃 시 `DELETE /v1/push-devices/:id` 호출 + 로컬 상태 정리 |
| Secret 미노출 | `.env.example` 에 신규 키 추가 없음. push provider key·CDN 서명 키를 Frontend에 두지 않는다 |
| 아동 데이터 전송 경계 | Stage 2 AC-2-13 회귀 유지 — Stage 3 신규 요청도 동의 이후에만 발생한다 (Guard가 이미 강제) |

**Backend Handoff 요구사항(문서화만)**: 서버 측 소유권 검증(caregiver → child → card/library), push payload PII 최소화, 배송지 저장 분리, 표지 저작권 메타·CDN 접근 제어 — §10.

### 5.6 Stage 2 이월 구조 수정

| 항목 | 수정 내용 | 결정 |
|---|---|---|
| `S1-E-3` BottomTabBar 고정 방식 | Design Spec §2.2 ↔ §5.2·§4.12·§6.2 불일치 해소, 여백 규칙 1개로 확정 | §16 D-1 |
| `S2-CONSENT-1` `signup_oauth` | `consentSourceFor()` 한 함수에서 provider 가입 경로를 구분 | §17.2 |
| `session-cleanup.ts` | Activity Card 캐시 삭제 + push device 해지 추가 | §5.3 · §5.5 |
| `ROUTES` | Stage 3 route 5개 추가, `/progress` 는 §16 D-2 결과에 따름 | §9.1 |

---

## 6. Data Requirement Delta (Backend Handoff용 — 구현 아님)

Stage 3는 `docs/DATA_MODEL.md` §7에 이미 초안이 있다. 이 Plan은 **새 테이블을 추가하지 않고**, Stage 3 Contract가 요구하는 소유권·제약·보관 조건을 확정 대상으로 정리한다. 실제 migration·RLS는 Backend Developer 몫이다.

| 대상 (DATA_MODEL §7) | Stage 3 Contract가 요구하는 것 | 라벨 |
|---|---|---|
| `books` — R4 | `title`·`author`·`cover_image_path`·`age_min_months`/`age_max_months`·`topic_tags`·`difficulty`·`est_reading_minutes`·`purchase_url`·`capability_relevance`·`is_curated`·`is_giftable`. **Frontend가 필요한 최소 노출**은 `id·title·author·coverUrl?·purchaseUrl?` 이며 `capability_relevance`·`difficulty` 는 **노출하지 않는다**(추천 근거는 `reason` 문장으로만 — §8.4 판정 언어 금지) | **CONFIRMED (§8.1)** / 노출 범위 RECOMMENDED |
| `child_books` — R1 | ⭐ **Rev 4 추가 (`A-9`)**: **`saved`·`saved_at` 축** — `ownership` 과 **독립**이다(보유 중인 책도 저장될 수 있고, `favorite_only` 재사용은 설문 응답과 보호자 저장을 섞는다). `source` 에 **`card_save`** 추가, ~~`onboarding_home_list`~~ 제거(온보딩 `homeBooks` 삭제 — approvals §11.9). **열 설계·이름은 Backend 재량**(`D-23` 과 같은 취급). 상세 = `DATA_MODEL.md` §7 · `API_CONTRACTS.md` §3.7. 기존: `ownership` 4값(`owned`·`gifted`·`gift_pending`·`favorite_only`) · `source` 4값(`onboarding_favorite`·`onboarding_home_list`·`library_add`·`gift_program`) · `user_entered_title`/`user_entered_author` · `first_read_at`·`last_read_at`·`read_count`. **CHECK `book_id IS NOT NULL OR user_entered_title IS NOT NULL`**. 서재 필터 `owned`/`gifted`/`history` 가 이 테이블 위에서 성립해야 한다 | **CONFIRMED (FR-20·22·23)** / `source` enum 화는 **보고 ④** |
| `book_gift_requests` — R1 | `status` 6값 · 같은 `(child_id, book_id)` 진행 중 신청 중복 금지 → `GIFT_REQUEST_DUPLICATE`(409). **`shipping_address_ref` 는 참조만** — 배송지 본문 저장 위치는 **NEEDS DECISION (운영·법무)**, Frontend는 입력받지 않는다(§16 D-15) | **CONFIRMED (FR-22)** / 배송지 = NEEDS DECISION |
| `prompt_sets` / `prompts` — R4 | `prompt_sets`: `book_id null`(범용) · `capability` · `age_band` 3값 · `coaching_line` · `status`(`draft`·`expert_reviewed`·`active`). `prompts`: `kind`(`question`·`follow_up`) · `text` · `order`. **책별 최소 6개, 선택 시 2~3개 제시**(§8.2) — **Backend 생성 정책**이며 contract 상한이 아니다(**D-21**). `active` 가 아닌 세트는 Frontend에 내려오지 않아야 한다 | **CONFIRMED (§8.2)** / `phase`·`page_ref` **추가 확정 (D-8, 2026-10-02 §8.1)** — `pageRef` 는 책별 페이지 앵커 데이터 전제(`P3-BIP-14`) |
| `activity_cards` — R2 | `card_date` **UNIQUE(child_id, card_date)** · `target_capability` · `generator_version` · `recommendation_phase`(cold/warm) · `selected_option_id` · `adopted_session_id` · `reading_context`·`custom_time`. **카드 날짜 기준 timezone** = §16 D-10 (OAQ-15) | **CONFIRMED (FR-07)** / `recommendation_phase` **노출은 Stage 6** |
| `activity_card_options` — R2 | `position`(0=today, 1·2=alternative) · `option_kind` 3값 · `reason_text` · `coaching_line` · `prompt_set_id`. **카드 단위 역량 1개 vs 옵션 단위 역량** = §16 D-5 (G-05) | **CONFIRMED (덱 3장 §7.9)** / 역량 단위 = 결정 대기 |
| `notification_preferences` — R1 | `card_refresh_time` default 07:00 · `reminder_days smallint[]` · `reminder_time` · `push_enabled` · `marketing_opt_in`(consent 반영값 캐시). **`marketing_opt_in` 은 Frontend가 쓰지 않는다** — 동의는 `consent_events` 가 원본이며 알림 설정에서 동의를 바꾸지 않는다(C-4 철회 미제공과 경계 유지) | **CONFIRMED (FR-08, §7.8)** / 읽기 전용 표시 여부 RECOMMENDED |
| `push_devices` — R1 | `platform` 3값(`ios`·`android`·`web`) · `provider_token`(**암호화 저장 요구**) · `last_seen_at`·`revoked_at`. 로그아웃 시 해지 | **RECOMMENDED** / `platform` enum 화는 **보고 ④** |
| **신규 요구 (Stage 3에서 확정)** | ① Idempotency 결과 보관 24h — `POST …/library/books`, `POST …/gift-requests` ② 서재 `history` 필터는 `child_books.last_read_at` 기준 정렬이며 **세션 테이블 조인 결과를 Frontend가 재계산하지 않는다** ③ `ActivityCard` 응답은 **옵션 3개 고정**(PRD §7.9 "오늘의 추천 + 대안 2장") ④ 추천 이유(`reason_text`)·코칭 문장(`coaching_line`)은 **서버 생성 문구**이며 Frontend는 가공하지 않는다(§8.4, rules/frontend §8) | RECOMMENDED |

**보관·삭제 요구 (Handoff)**: `child_books`·`book_gift_requests`·`activity_cards`·`notification_preferences`·`push_devices` 는 전체 삭제 요청(Stage 8, FR-21) 대상에 포함된다. 로컬 Activity Card 캐시는 Frontend 책임(§5.3 · §16 D-11).

`docs/DATA_MODEL.md` §7의 미결 표기(배송지 저장 위치, 재독 시 prompt_set 선택 규칙)는 §16 D-8 · D-15 결과로 Plan 승인 후 갱신한다.

---

## 7. API Contract Delta

### 7.1 `packages/contracts` Stage 3 범위 ↔ `docs/API_CONTRACTS.md` 1:1 대응

Stage 1·2에서 이미 있는 것: `common/*` 5 · `enums/*` **26** · `rules/*` 3 + `health`·`auth`·`me`·`consent`·`onboarding`·`children`·`books`(검색 최소). **Stage 3는 여기에 추천·서재·알림 도메인을 더한다.**

| contracts 경로 (신규) | 내용 | API_CONTRACTS 근거 | 라벨 |
|---|---|---|---|
| `src/home/summary.ts` | `HomeSummarySchema` = `{ todayCard: ActivityCard \| null, sessionsThisWeek, characterLine: string \| null, lastHighlightLine?, activeSession?: { sessionId, status } }`. **`streakDays` 없음** (삭제 — D-6 "이번 주" 기준의 귀결, `stage-3-approvals.md` §8.5 ④). `characterLine` = Home 캐릭터 버블 문구, **서버 값만 표시하고 없으면 버블 미렌더**(§8.5 ①) | §4 Stage 3 `GET …/home` → `HomeSummary` | **CONFIRMED (2026-10-02, §8.5 ①·④)** |
| `src/activity/option.ts` | `ActivityCardOptionSchema` = `{ id, position(0\|1\|2), kind: ActivityOptionKind, book: BookSummary \| null, userEnteredBook?: { title, author? }, reason(1–2문장), coachingLine }` + **`capability` = D-5 승인으로 추가**(2026-09-29, §3) · **`promptPreview: Prompt[]` = D-4 승인으로 추가**(2026-09-29, §3 — 선택 *전* 카드에 노출). **길이 상한 없음 · `.min(1)`** (N-2 §6.1 + **D-21** §9.1): `.max(3)` 를 두지 않고 **Frontend 가 `slice` 하지 않는다** | §4 Stage 3 `ActivityCard.options[3]` · DATA_MODEL `activity_card_options` | RECOMMENDED |
| `src/activity/card.ts` | `ActivityCardSchema` = `{ id, date(YYYY-MM-DD), options: [opt, opt, opt] (length 3) }` — **`targetCapability` 는 넣지 않는다** (**D-22** 삭제 결정, 2026-10-03 §9): `D-5` 로 역량이 `options[].capability` 단위가 되어 카드 단위 대표 역량의 사용처가 없다 | §4 Stage 3 `GET …/activity-cards/today` → `ActivityCard` | **CONFIRMED (덱 3장 §7.9 · 필드 D-22)** |
| `src/activity/selection.ts` | `SelectActivityOptionRequestSchema` = `{ optionId, readingContext: ReadingContext, customTime?: 'HH:mm' }` + `createCustomTimeRefine()`(`custom_time` 일 때만 필수). `ActivityCardSelectionSchema` = `{ option, promptSet: PromptSet }` | §4 Stage 3 `POST /v1/activity-cards/:cardId/selection` | **CONFIRMED (FR-07·FR-08)** / 필드 RECOMMENDED. `readingContext` 필수 여부 = §16 D-9 |
| `src/prompts/prompt.ts` | `PromptSchema` = `{ id, kind: 'question' \| 'follow_up', text, order, phase: 'pre' \| 'post' \| null (optional), pageRef: string \| null (optional) }` — **`phase`·`pageRef` 는 D-8 승인으로 Stage 3 에서 실제 추가하고 화면에 표시한다** (2026-10-02, §8.1). 표시 전용 — Frontend 생성·가공 금지. `PromptSetSchema` = `{ id, capability, ageBand: '3_4' \| '5_6' \| '7_9', questions, coachingLine, followUps }` — `questions` 는 **`.min(1)` · 상한 없음**: **D-21**(2026-10-03, §9.1): `.max(3)` 를 제거하고 `.min(2)` 로 올리지 않는다. 표시 개수(접힌 상태 3개)는 **cutoff 이며 cap 이 아니다** | §4 Stage 3 `ActivityCardSelection.promptSet` · §8.2 | **CONFIRMED (§8.2 구성)** / 필드 RECOMMENDED |
| `src/prompts/book-prompts.ts` | `BookPromptsSchema` = `{ bookId, ageBand, promptSets: PromptSet[] }` | §4 Stage 3 `GET /v1/books/:bookId/prompts?childId=` → `BookPrompts` | RECOMMENDED |
| `src/enums/prompt-kind.ts` | `PromptKindSchema` = `question`, `follow_up` | DATA_MODEL §7 `prompts.kind` — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/enums/age-band.ts` | `AgeBandSchema` = `3_4`, `5_6`, `7_9` | PRD §8.2 · DATA_MODEL §7 `prompt_sets.age_band` — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/library/library-book.ts` | `LibraryBookSchema` = `{ id, book: BookSummary \| null, userEnteredTitle?, userEnteredAuthor?, ownership: BookOwnership, source: BookSource, firstReadAt?, lastReadAt?, readCount, purchaseUrl?, giftRequestStatus?: GiftRequestStatus }`. **`BookSummary` 는 Stage 2 정의를 그대로 포함**(비파괴 확장) | §4 Stage 3 `GET …/library` → `Paginated<LibraryBook>` · DATA_MODEL `child_books` | RECOMMENDED |
| `src/enums/library-filter.ts` | `LibraryFilterSchema` = `owned`, `gifted`, `history` | §4 Stage 3 쿼리 파라미터 — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/enums/book-source.ts` | `BookSourceSchema` = `onboarding_favorite`, `onboarding_home_list`, `library_add`, `gift_program` | DATA_MODEL §7 `child_books.source` — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/library/list.ts` | `LibraryListRequestSchema` = `CursorPageRequest & { filter: LibraryFilter }`, `LibraryListResponseSchema = paginated(LibraryBookSchema)` | §4 Stage 3 | RECOMMENDED |
| `src/library/add-book.ts` | `AddOwnBookRequestSchema` = discriminated union — `{ bookId }` 또는 `{ title(1–200), author?(≤120) }` | §4 Stage 3 `POST …/library/books`(IK) → `LibraryBook` | **CONFIRMED (FR-23, §7.2 규칙)** / 길이 RECOMMENDED |
| ⭐ `src/library/saved-book.ts` **(Rev 4 신규)** | `SaveBookTargetSchema` = `{ bookId }` \| `{ title, author? }` (판별 union — `AddOwnBookRequest` 와 **같은 구조이므로 공용화**하고 중복 선언하지 않는다), `SaveBookRequestSchema` = `{ target }`. 응답은 **신규 타입 없이 `LibraryBook`**. `LibraryBookSchema` 에 **`saved: boolean` · `savedAt: IsoDateTime \| null`** 추가(비파괴). `BookSource` 에 **`card_save`**, `LibraryFilter` 에 **`saved`** 추가 | `API_CONTRACTS.md` **§3.7** · §4 Stage 3 `PUT/DELETE …/saved-books` | **CONFIRMED (사용자 결정 2026-10-05, approvals §12.8 `A-9` — Figma `I86:438;86:383;117:973`)** / 필드·경로·멱등 규격 **RECOMMENDED** |
| `src/library/gift-request.ts` | `CreateGiftRequestRequestSchema` = `{ bookId }` (**배송지 필드 없음** — §16 D-15), `GiftRequestSchema` = `{ id, book: BookSummary, status: GiftRequestStatus, requestedAt, statusUpdatedAt }`, `GiftRequestListSchema` | §4 Stage 3 `POST/GET …/gift-requests` | **CONFIRMED (2026-10-02, §8 D-15 — 배송지 미수집 확정)** |
| `src/notifications/preferences.ts` | `NotificationPreferencesSchema` = `{ cardRefreshTime: 'HH:mm', reminderDays: number[0–6], reminderTime?: 'HH:mm', pushEnabled }`, `UpdateNotificationPreferencesRequestSchema`(부분 갱신) | §4 Stage 3 `GET/PUT /v1/notification-preferences` | RECOMMENDED |
| `src/notifications/push-device.ts` | `RegisterPushDeviceRequestSchema` = `{ platform: PushPlatform, token }`, `PushDeviceSchema` = `{ id, platform, lastSeenAt }` (**token 미반환**) | §4 Stage 3 `POST /v1/push-devices`, `DELETE /v1/push-devices/:id` | RECOMMENDED |
| `src/enums/push-platform.ts` | `PushPlatformSchema` = `ios`, `android`, `web` | DATA_MODEL §7 `push_devices.platform` — **§2.2 enum 표에 없음** | RECOMMENDED — **보고 ④** |
| `src/common/time-of-day.ts` | `TimeOfDaySchema` = `^([01]\d\|2[0-3]):[0-5]\d$` — `cardRefreshTime`·`reminderTime`·`customTime` 공용 | 기술 요구사항 (중복 선언 방지) | RECOMMENDED |
| `src/index.ts` (수정) | 신규 도메인 re-export (deep import 금지) | ARCHITECTURE §1.2 | CONFIRMED |

**Stage 3에서 하지 않는 contracts 작업**: `§3.2 CreateSession*`·`§3.3 RecordingUpload*`(Stage 4), `Reflection*`(Stage 5), `RecommendationPhase` 노출·`profileUpdatedAt`(Stage 6), `ReportOverview`·`WeeklyProgress`(Stage 7), `ConsentHistory`·`DataDeletion*`(Stage 8), ~~G-04 `LibraryBook.saved`~~·`averageRating`·reading plan(§16 D-7에서 기각) — ⛔ **`LibraryBook.saved` 는 Rev 4 에서 In Scope 로 복귀**한다 (approvals §12.8 `A-9`). `averageRating`·reading plan 은 **그대로 제외**.

**Error Code**: Stage 1의 **28종을 그대로 쓴다. 신규 코드 추가 없음.** (Rev 4 재확인 — `★ Save` 도 **신규 error code 0건**: 중복 저장은 오류가 아니라 멱등 성공이고, 없는 `bookId` = `RESOURCE_NOT_FOUND`, 입력 오류 = `VALIDATION_FAILED`. 상한을 두지 않으므로 상한 초과 코드도 필요 없다 — `API_CONTRACTS.md` §3.7.3) Stage 3가 새로 사용하는 코드 = `ONBOARDING_INCOMPLETE`(home·activity-cards), `RESOURCE_NOT_FOUND`(selection·prompts), `GIFT_REQUEST_DUPLICATE`, `SESSION_ALREADY_ACTIVE`(표시용), `VALIDATION_FAILED`, `IDEMPOTENCY_KEY_REUSED`.

### 7.2 Endpoint Delta

| Method | Path | Request | Response | Key errors | 인증 | IK | Stage 3 |
|---|---|---|---|---|---|---|---|
| GET | `/v1/children/:childId/home` | — | `HomeSummary` | `ONBOARDING_INCOMPLETE`, `CHILD_NOT_FOUND`, `FORBIDDEN` | 필요 | — | **In** |
| GET | `/v1/children/:childId/activity-cards/today` | — | `ActivityCard` | `ONBOARDING_INCOMPLETE` | 필요 | — | **In** |
| POST | `/v1/activity-cards/:cardId/selection` | `SelectActivityOption` | `ActivityCardSelection` | `RESOURCE_NOT_FOUND`, `VALIDATION_FAILED` | 필요 | — | **In** |
| GET | `/v1/children/:childId/library?filter=&limit=&cursor=` | — | `Paginated<LibraryBook>` | `VALIDATION_FAILED`, `CHILD_NOT_FOUND` | 필요 | — | **In** |
| POST | `/v1/children/:childId/library/books` | `AddOwnBook` | `LibraryBook` | `VALIDATION_FAILED`, `IDEMPOTENCY_KEY_REUSED` | 필요 | **필수** | **In** |
| PUT | `/v1/children/:childId/saved-books` | `SaveBook` | `LibraryBook`(`saved=true`) | `RESOURCE_NOT_FOUND`, `VALIDATION_FAILED` | 필요 | **불필요**(PUT=상태 설정, 멱등) | **In (Rev 4 — `A-9`)** |
| DELETE | `/v1/children/:childId/saved-books/:bookId` | — | 204 | `RESOURCE_NOT_FOUND` | 필요 | — | **In (contract)** / 화면 진입점은 **Library 라운드** (`G-13`) |
| GET | `/v1/books/:bookId/prompts?childId=` | — | `BookPrompts` | `RESOURCE_NOT_FOUND` | 필요 | — | **In** |
| POST | `/v1/children/:childId/gift-requests` | `CreateGiftRequest` | `GiftRequest` | `GIFT_REQUEST_DUPLICATE`, `VALIDATION_FAILED`, `IDEMPOTENCY_KEY_REUSED` | 필요 | **필수** | **In** |
| GET | `/v1/children/:childId/gift-requests` | — | `GiftRequest[]` | `CHILD_NOT_FOUND` | 필요 | — | **In** |
| GET | `/v1/notification-preferences` | — | `NotificationPreferences` | — | 필요 | — | **In** |
| PUT | `/v1/notification-preferences` | `UpdateNotificationPreferences` | `NotificationPreferences` | `VALIDATION_FAILED` | 필요 | — | **In** |
| POST | `/v1/push-devices` | `RegisterPushDevice` | `PushDevice` | `VALIDATION_FAILED` | 필요 | — | **In** |
| DELETE | `/v1/push-devices/:id` | — | 204 | `RESOURCE_NOT_FOUND` | 필요 | — | **In** |
| GET | `/v1/books/search` | — | `Paginated<BookSummary>` | — | 필요 | — | **재사용** (Stage 2 — `/library/add` 가 같은 endpoint를 쓴다) |
| POST | `/v1/sessions` | — | — | — | — | — | **Out → Stage 4** ("Start Session" CTA = §16 D-3) |
| GET | `/v1/children/:childId/reports/overview` | — | — | — | — | — | **Out → Stage 7** (`/progress` 탭 = §16 D-2) |

- **동의 가드(CG)**: Stage 3 endpoint는 전부 온보딩 완료 이후에만 호출되므로 Route Guard(Stage 2)가 이미 경계를 지킨다. Mock은 `onboarding-incomplete` 시나리오에서 `ONBOARDING_INCOMPLETE` 를 반환한다.
- **Http Adapter**는 Stage 1 `D-7` 결정대로 **Mock과 동시에 골격을 작성**한다. 실제 서버 연동 검증은 `BACKEND_INTEGRATION_PENDING`(§10).

### 7.3 contracts 사용 규약 (Stage 1·2에서 고정, Stage 3도 동일)

- 타입은 `z.infer` 로만 파생. `apps/web` 에 같은 모양 재선언 금지 (QA grep).
- 응답 schema는 Zod 기본 `strip`. Stage 3는 `.strict()` 요청 schema를 **추가하지 않는다**(Stage 2 `SignUpWithEmailInput` 만 예외 유지).
- Mock/Http **양쪽** Adapter가 요청·응답을 parse. 실패는 `VALIDATION_FAILED` Error Envelope으로 변환.
- `packages/contracts` 런타임 의존은 `zod` 하나. 시간·날짜 검증(오늘 카드 날짜, `customTime` 조건부 필수)은 **clock을 인자로 받는 팩토리**로 만든다 (Stage 2 `D-10` 원칙 유지).
- **표시 문구는 contracts가 아니라 feature copy 모듈이 소유한다** — `ReadingContext` 라벨, 서재 필터 이름, 알림 요일 이름. contracts에는 코드 키만 둔다.

---

## 8. Mock Scenarios

**machine key의 유일한 기준은 `docs/API_CONTRACTS.md` §5.4 Catalogue 다.** 아래 표의 key는 전부 catalogue에 존재하는 값이며, **신규 key를 만들지 않는다**. deprecated alias(`default`·`slow`·`active-session-exists`·`os-permission-denied` …) 사용 금지.

### 8.1 Scenario 그룹 (Stage 1·2의 6그룹에 Stage 3 그룹 6개 추가 → 12그룹)

| 그룹 key | 대상 | §5.3 행 |
|---|---|---|
| `home` | `GET /v1/children/:childId/home` | home / activity-cards |
| `activity-cards` | `GET …/activity-cards/today`, `POST /v1/activity-cards/:cardId/selection` | 〃 |
| `library` | `GET …/library`, `POST …/library/books`, `GET /v1/books/:bookId/prompts`, ⭐ **`PUT/DELETE …/saved-books` (Rev 4)** | library / books / gift-requests / saved-books |
| `gift-requests` | `POST/GET …/gift-requests` | 〃 |
| `notifications` | `GET/PUT /v1/notification-preferences` | notifications / push-devices |
| `push-devices` | `POST /v1/push-devices`, `DELETE /v1/push-devices/:id`, platform 권한 mock | 〃 |
| `books` (Stage 2 기존, 확장) | `GET /v1/books/search` — `/library/add` 가 재사용. Stage 3에서 `user-entered-book` 추가 | 〃 |

### 8.2 Stage 3 필수 scenario (§5.4 catalogue)

| Machine key | 적용 그룹 | Mock 동작 | 검증 대상 화면·상태 |
|---|---|---|---|
| `success` | 전체 | contracts parse를 통과하는 성공 fixture | 정상 경로 |
| `loading` | 전체 | 주입 timer 지연 | 덱 Skeleton(**2초 이내 NFR 체감**), 서재 Skeleton, 버튼 loading |
| `empty` | `home`, `activity-cards`, `library`, `gift-requests` | `todayCard: null` / `items: []` | 카드 없음 안내, **서재 빈 상태**(보유 0권·히스토리 0건 — C13-20), 증정 신청 없음 |
| `error` | 전체 | Error Envelope (그룹별 code 지정 가능) | ErrorState + Retry, 폼 필드 에러 |
| `retry` | 전체 | 1회차 `error` → 2회차 `success` | 재시도 UX + **입력 보존**(직접 등록 폼) |
| `offline` | 전체 | Adapter가 network error throw | Offline Banner |
| **`offline-cached-card`** | `home`, `activity-cards` | `offline` + 최근 Activity Card 캐시 존재 | **캐시 카드 표시 + Offline Banner + 선택 mutation 차단** (NFR 오프라인) |
| **`conversation-only-option`** | `activity-cards` | 옵션에 `kind=conversation_only` 포함 | "책 없이 대화만 하기" 카드 변형 (§7.4 규칙, C13-15) |
| **`reread-option`** | `activity-cards` | 옵션에 `kind=reread_book` 포함 | 재독 카드 + **새 Prompt 세트**(§8.3) |
| **`books-exhausted`** | `activity-cards` | 재독·대화 전용 대체 카드만 반환 | §13 "추천할 책 소진" — 3장 전부 대체 카드 |
| **`session-already-active`** | `home` | `HomeSummary.activeSession` 존재 | Home **이어하기 안내 표시**(진입 대상은 Stage 4) |
| **`gift-pending`** | `library`, `gift-requests` | `ownership=gift_pending` + 배송 상태 | §13 증정 대기 — 서재 배송 상태, **직접 입력·대화 전용 안내** |
| **`gift-duplicate`** | `gift-requests` | `GIFT_REQUEST_DUPLICATE` | 중복 신청 안내 |
| **`user-entered-book`** | `library`, `books` | DB 외 직접 등록 책 포함 (범용 Prompt, 표지 없음) | `BookCover placeholder`, 검색 결과 없음 → 제목 직접 입력 (FR-23) |
| **`push-permission-denied`** | `push-devices` | platform mock: OS push 권한 거부 | 권한 거부 안내 + 재요청 경로, 기기 등록 미수행 |
| `onboarding-incomplete` | `home`, `activity-cards` | `ONBOARDING_INCOMPLETE` | Guard 경계 회귀 (Stage 2 key 재사용) |
| ⭐ **`book-saved`** (Rev 4 신규) | `library` (saved-books) | 대상 책이 **이미 저장된 상태**(`LibraryBook.saved=true`) | `★ Save` **재저장 멱등성**(같은 응답·같은 `savedAt`) + (`G-14` ⓑ 채택 시) 초기 표시. **catalogue 에 신규 등재** = `API_CONTRACTS.md` §5.4 |

~~**총 16 key** … **신규 key 0건**~~ → ⭐ **Rev 4: 총 17 key** (공통 6 + Stage 3 특화 10 + 재사용 1). **신규 key 1건 = `book-saved`** 이며 `API_CONTRACTS.md` §5.4 catalogue(단일 기준)에 **먼저 등재했다** — 임의 key 가 아니다. 나머지 16 key 는 변동 없다.

⭐ **Rev 4 — Mock 영향 (approvals §12.9 · audit §11.11)**: ① `activity-cards` fixture 의 `date` 가 **`2026-01-01` 고정**이라 항상 `stale` 이 된다 → **주입 clock 기준 '오늘' fixture 로 교체**한다 (배너 삭제와 무관하게 필요). ② `loading` 의 덱 Skeleton 은 **가로 1장 + peek 8**, `empty`/`error`/`offline` 은 **트랙 높이 415 를 점유**한다. ③ `AC-3-11` 폐기로 **지난 카드 안내 시나리오는 없어지지만 `empty` 는 유지**된다. ④ Reading Context 이월로 `POST …/selection` 의 **`readingContext` 입력 경로가 화면에서 사라진다** — Mock·contract 는 그대로 두고 **단위/contract 테스트로만** 검증한다(화면 e2e 대상 아님). ⑤ 새 key `book-saved` 는 `library` 그룹에 붙는다.

**fixture 규격 — Prompt 개수 상한 없음 (D-21, §9.1-3)**: `activity-cards` 의 **`success` fixture 가 옵션 1개에 `promptPreview` 4개를 담고**, `POST …/selection` 의 `promptSet.questions` 도 **4개**를 반환한다. 기본 경로에서 **상한이 없음 + 접힌 상태 3개 cutoff + 확장 도달**을 동시에 증명한다 (AC-3-17). **신규 scenario key 를 만들지 않는다** — §5.4 catalogue 변경 없음.

### 8.3 Mock API가 아닌 검증 (§5.4 "Key로 만들지 않는 것")

| 항목 | 검증 방법 |
|---|---|
| **Activity Card 로컬 캐시** | scenario key가 아니라 **로컬 저장소 테스트** — 저장/복원/날짜 경과/schemaVersion 불일치/parse 실패/로그아웃 삭제 (§16 D-11) |
| Idempotency-Key 재생 | 같은 key + 같은 body **replay 테스트** (`POST …/library/books`, `POST …/gift-requests`) |
| 단일 error code 재현(`RESOURCE_NOT_FOUND`, `VALIDATION_FAILED` 필드 에러) | `error` + code 지정 |
| 덱 index·스와이프·키보드 조작 | 컴포넌트 테스트 (서버 왕복 없음) |
| 표지 이미지 로드 실패 → `BookCover placeholder` | 컴포넌트 테스트 (`onError`) |
| Web Notification 권한 상태 3종(`default`/`granted`/`denied`) | **platform adapter mock** — `push-permission-denied` 는 `denied` 경로만 담당 |

### 8.4 Stage 3에서 만들지 않는 scenario

`invalid-transition` · `mic-permission-denied` · `auto-timeout` · `crash-recovered` · `recording-interrupted` · `abandoned` · `upload-*` · `recording-*` · `reflection-*` · `analysis-*` · `cold-to-warm` · `persona-changed` · `difficulty-lowered` · `report-*` · `pdf-generating` · `clip-expired` · `share-cancelled` · `deletion-*` — **정의도 fixture도 만들지 않는다**.

`sessions` 그룹은 Stage 4다. Stage 3의 `session-already-active` 는 **`home` 그룹에만** 적용하며 `POST /v1/sessions` 를 만들지 않는다.

### 8.5 Scenario 전환 (Stage 1 `D-5` 방식 유지)

- 조합 표기 `?scenario=<group>:<key>[,…]`, 우선순위 **URL > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`**.
- 결정성: 주입된 `clock`·`idFactory`·timer만 사용. `Date.now()`/`Math.random()` 직접 호출 금지.
- **Stage 3 신규 요구**: `activity-cards` 의 `success`·`reread-option`·`conversation-only-option`·`books-exhausted` 는 **같은 key로 반복 실행 시 동일한 3장 구성·동일 문구**가 나와야 한다. `POST …/selection` 이 돌려주는 `promptSet` 도 결정적이어야 한다 (덱·Prompt가 Playwright baseline 대상이기 때문).
- Scenario Panel에 그룹 6개를 등록한다 (dev 전용, Production 제외 — Stage 1 AC-1-42 회귀).

---

## 9. Frontend Scope — Deliverables

> 상세 UI(variant·state·치수·토큰 매핑·누락 화면 레이아웃)는 design-agent `docs/design/stage-3-design-spec.md` 가 확정한다. 아래는 **존재해야 할 것의 목록**이다.

### 9.1 Route 표 (PLANNING §9.2 기준, Stage 3 확정)

| path | Page | Layout | Guard | Figma |
|---|---|---|---|---|
| `/` | `HomePage` (**콘텐츠 + 탭바** — Stage 2 skeleton 대체) | **Tab** | 온보딩 완료 | `26:21` (카드 미배치 — M-30) + 덱 `163:2648` · `86:438` · `86:482` · `86:512/545`; Tab Bar `25:87` |
| `/library` | `LibraryPage` | **Tab** | 온보딩 완료 | `30:74`, 시트 `163:1669`, 책 상세 `145:1132` |
| `/library/add` | `AddOwnBookPage` | Stack | 온보딩 완료 | **없음 — C13-17** |
| `/library/gift-requests` | `GiftRequestsPage` | Stack (PLANNING의 "Tab" 표기는 **Stack 으로 확정** — 탭 항목이 3개로 고정이므로) | 온보딩 완료 | **없음 — C13-18** |
| ~~`/settings/notifications`~~ | **Stage 3 제외 — D-18 (2026-10-02, `stage-3-approvals.md` §8 · §8.4)**: 알림 **설정 화면만** 구현하지 않는다. 디자이너 Figma 요청 후 도달 Stage 로 이월. QA 는 FR-08 의 설정 화면 부분을 **Out of Scope**(FAIL 아님)로 기록 | — | — | **없음 — C13-19** (디자이너 요청) |
| `/progress` | **"준비 중" 안내 화면** (D-2 승인 2026-10-01, §7) — `EmptyState` 성격. **안내에 수치를 전혀 넣지 않는다**(달성률 언어 금지), contract 호출 0건. Stage 7 이 실제 리포트 화면으로 대체 | Tab | 온보딩 완료 | `31:102` (Stage 7) |
| `/settings` (기존) | `SettingsPage` — **Stage 3 변경 없음**(로그아웃 1행 유지). 알림 설정 행은 **D-18 로 제외** | Stack | 온보딩 완료 | 없음 (C-16) |

**시트의 route 처리 — D-17 승인으로 변경 (2026-10-02, §8 · §8.3)**: 세 시트(`LibraryShelfSheet` "See all" `163:1669` · `BookDetailSheet` `145:1132` · `ReadingContextSheet`)는 **부모 페이지의 상태로 구현하되 Mock 데모용 route 를 추가로 입힌다**. ① route 정의는 **한 파일**(예: `app/router/mockPreviewRoutes.tsx`)에 모아 삭제 지점을 한 곳으로 둔다 ② route 가 사라져도 시트가 부모 상태로 **계속 동작**해야 한다 (열림 상태가 route 에 의존하지 않는다) ③ 파일 상단에 제거 조건 주석 + **Stage 8 Handoff 제거 대상 등재** ④ `BookDetailSheet` 뒤로 가기 = `LibraryShelfSheet` 목록 복귀. Prompt 공개 상태(`86:482` flip)는 **route 없이 부모 상태로만** 둔다. 알림 deep link가 필요한 경우만 route화하며 Stage 3에는 해당 없음.

### 9.2 `packages/ui` — Shared UI 3종 추가 + 1종 확장 (28 → 31)

```
packages/ui/src/
├── section/SectionHeader.tsx     (1) title + optional action (TextLink) — Figma `30:74` "Our curated shelf · See all"
├── carousel/Carousel.tsx         (2) 가로 스크롤 + snap + PageIndicator 연동 — Figma `113:1993` This Week's Shelf
│                                     **키보드·버튼 대체 조작 필수** (WCAG 2.5.1)
├── field/Toggle.tsx              (3) on/off — Figma `17:113` (iOS kit 복제가 아니라 HARU 토큰, COMPONENT_MAP §6)
└── list/ListRow.tsx  (확장)       leading media(썸네일) · trailing meta 변형 추가 — Figma `163:2145` Book List
```

- `SwipeDeck`(Stage 2 기존)을 **Home 덱에 재사용**한다. `Carousel` 은 서재의 다건 브라우징용이며 역할이 다르다 (§16 D-14).
- `packages/ui` 는 여전히 `@haru/contracts` 를 import하지 않는다. `Carousel` 아이템·`ListRow` media는 props 주입.
- `BookCover`·`CapabilityBadge`·`PromptPill`·`CoachingNote`·`BookShelfItem`·`BookListRow`·`ActivityOptionCard`·`ReadingContextChip`·**`WeekSummaryChip`**(개명 — §8.5 ④) 은 **도메인 컴포넌트**이므로 `apps/web/src/entities/*` 에 둔다 (COMPONENT_MAP §2).
- 모든 신규 컴포넌트에 focus-visible(P-03 확정값), 접근성 이름, 키보드 조작, 44×44 터치를 적용한다.

### 9.3 `apps/web` 구조 (Stage 1·2 위에 추가)

```
apps/web/src/
├── app/
│   ├── router.tsx                    ★ route 5개 추가, `/` 를 TabLayout 으로 전환
│   └── providers/apiClients.ts       (수정) Stage 3 도메인 6개 추가
├── pages/
│   ├── home/            HomePage            ★ skeleton → 콘텐츠
│   ├── library/         LibraryPage · AddOwnBookPage · GiftRequestsPage        ★
│   └── settings/        (변경 없음 — `NotificationSettingsPage` 는 D-18 로 Stage 3 제외)
├── features/
│   ├── activity-card-deck/  ActivityCardDeck · DeckControls · OfflineCardNotice · copy   ★
│   ├── book-selection/      PromptReveal · PromptSetView · copy                          ★
│   ├── reading-context/     ReadingContextSheet · CustomTimePicker · copy                ★
│   ├── library/             LibraryShelves · LibraryShelfSheet · BookDetailSheet
│   │                        AddOwnBookForm · GiftRequestFlow · copy                      ★
│   ├── notification-preferences/  NotificationPreferencesForm · PushPermissionPrompt
│   │                              · usePushRegistration · copy                           ★
│   └── settings/            (변경 없음 — 알림 설정 행은 D-18 로 Stage 3 제외)
├── entities/
│   ├── home/            homeKeys · useHomeSummary · WeekSummaryChip · CharacterBubble · ActiveSessionNotice  ★
│   ├── activity-card/   activityCardKeys · useTodayActivityCard · useSelectActivityOption
│   │                    ActivityOptionCard · CapabilityBadge · CoachingNote · PromptPill
│   │                    · ReadingContextChip                                             ★
│   ├── library/         libraryKeys · useLibrary · useAddOwnBook · useBookPrompts
│   │                    · useGiftRequests · useCreateGiftRequest
│   │                    BookShelfItem · BookListRow · GiftStatusTag                      ★
│   ├── notification/    notificationKeys · useNotificationPreferences
│   │                    · useUpdateNotificationPreferences · usePushDevice               ★
│   └── book/ (확장)      BookCover · BookSummaryView                                      ★
├── shared/
│   ├── api/             home-api · activity-api · library-api · notifications-api
│   │                    (+ http/ 골격 4개)                                                ★
│   ├── lib/             activity-card-cache.ts ★ · session-cleanup.ts (수정)
│   ├── platform/        pushPermission.ts (interface) ★ — Web 구현 + Mock (§16 D-16)
│   ├── assets/books/    표지 AVIF/WebP/PNG 산출물 (D-4 파이프라인)                          ★
│   └── config/routes.ts (수정) ROUTES + 탭 items
└── mocks/
    ├── home/            MockHomeApi                                                      ★
    ├── activities/      MockActivityApi                                                  ★
    ├── library/         MockLibraryApi (library · books/prompts · gift-requests)          ★
    ├── notifications/   MockNotificationsApi · MockPushPermission                         ★
    ├── fixtures/        books(카탈로그) · activity-cards · prompt-sets · library
    │                    · gift-requests · notification-preferences  (**가상 데이터만**)
    └── scenarios/       (수정) 그룹 6개 등록
```

`.claude/rules/frontend.md` §5의 Mock 폴더 이름(`activities`·`library`·`notifications`)을 그대로 쓴다. `mocks/home` 은 규칙 §5 목록에 없으나 endpoint 그룹이 `home` 이므로 추가한다 (**보고 ⑤**).

### 9.4 명시적 비생성

- `apps/api`, `supabase/`, `apps/mobile` — **생성하지 않는다** (hook + QA 파일 목록 증거).
- `mocks/sessions` · `recordings` · `analysis` · `reports` · `data-management` — 빈 stub도 만들지 않는다 (Stage 1 `D-8` 유지).
- `SessionPage` · `PromptDrawer` · `PromptCarousel` · `RecordButton` · `AttendanceStickerChip` · `CapabilityDiamondChart` · `PersonaCard` · `StatTile` · `WeeklyReadingChart` — 각 Stage / Stage 2-B.
- `/session/*` · `/progress/reports/:reportId` · `/settings/child` · `/settings/growth-capability` · `/settings/account` · `/settings/privacy` · `/settings/data` · `/legal/*` route — 만들지 않는다.

---

## 10. Backend Integration Requirements

Stage 2는 `BACKEND_INTEGRATION_PENDING` 이 11건이었다. ~~Stage 3는 **14건**~~ → ⭐ **Rev 4: 15건** — `★ Save` 저장 상태의 서버 소유(`P3-BIP-15`)가 추가된다 (approvals §12.8 `A-9`). **무효가 된 PENDING 은 없다**; `P3-BIP-01`·`P3-BIP-03` 의 **Frontend 판정 AC 참조만 교체**된다 (`AC-3-11` 폐기 · `AC-3-17` 무효). (Rev 3: D-8 승인으로 **P3-BIP-13 · P3-BIP-14** 추가, 2026-10-02 — `stage-3-approvals.md` §8.1). 각 항목은 ① Frontend 부분이 별도 AC로 PASS/FAIL 판정되고 ② 대기 사유와 Handoff 문서 대상이 기록되어야 한다 (rules/qa.md §1).

| # | PENDING 항목 | Contract로 표현되는 기대 동작 | Frontend 부분 (별도 판정) | Handoff 문서 |
|---|---|---|---|---|
| **P3-BIP-01** | **일일 Activity Card 생성 잡** — 매일 07:00(설정 가능) 카드 갱신, `UNIQUE(child_id, card_date)`, caregiver timezone 기준 | `GET …/activity-cards/today` → `ActivityCard{ date, options[3] }` (`targetCapability` 없음 — **D-22**), `NotificationPreferences.cardRefreshTime` | ~~AC-3-11~~ → ⭐ **AC-3-82**(오늘 카드 없음 = `empty` 안내) · **AC-3-12**(배지) · **AC-3-88**(서버 `date` 를 그대로 신뢰, 클라이언트 재판정 0건). `AC-3-11` 은 **폐기**(Rev 4, approvals §12.8) — 날짜를 **화면에 밝히는 요구가 없어졌다**. `D-10` 의 서버 `date` 신뢰는 유지 | `BACKEND_HANDOFF.md`, `DATA_REQUIREMENTS.md` |
| **P3-BIP-02** | **Cold/Warm 추천 로직 · 역량 순환 스케줄 · 주제 태그 매칭** (§8.3) — 온보딩 Q1~Q5 state vector 소비 | `ActivityCard.options[].capability`(**D-5** — 카드 단위 `targetCapability` 는 **D-22** 로 삭제), `options[].reason`(추천 이유 문장), `activity_cards.recommendation_phase` | AC-3-13 (응답 값만 표시, Frontend 가공 0건) | `BACKEND_HANDOFF.md`, `ANALYSIS_PIPELINE_REQUIREMENTS.md` |
| **P3-BIP-03** | **Prompt 라이브러리 콘텐츠·전문가 감수·재독 시 새 세트 선택** (§8.2, §8.3) — 책별 최소 6개, **제시 2~3개 = Backend 생성 정책**, 동일 주제 연속 3일 지양. **이 개수는 Frontend 검증 조건이 아니다** — contracts 는 상한을 강제하지 않는다 (**D-21** §9.1-4) | `ActivityCardSelection.promptSet{ questions, coachingLine, followUps }` (`questions` = `.min(1)` · 상한 없음), `GET /v1/books/:bookId/prompts` | AC-3-16 (표시 — **뒷면으로 이동**) · ~~AC-3-17~~ → ⭐ **AC-3-83**(상한 없음 · `slice` 금지 · 4개 이상 fixture). **"확장 도달" 부분은 무효** — Figma 에 확장 트리거가 없고 4~5개가 전부 노출된다 | `BACKEND_HANDOFF.md` |
| **P3-BIP-04** | **책 카탈로그 20권 큐레이션 · 표지 저장/CDN · 구매 링크 · 연령 게이팅** (§8.1) | `BookSummary{ id, title, author, coverUrl? }`, `LibraryBook.purchaseUrl` | AC-3-27 · AC-3-52 (원격 URL·번들 에셋 모두 렌더) | `DATA_REQUIREMENTS.md`, `BACKEND_HANDOFF.md` |
| **P3-BIP-05** | **증정 프로그램 운영** — B2B 라이선스 주문·배송·상태 전이(`requested→approved→shipped→delivered`), 중복 판정 | `POST/GET …/gift-requests`, `GIFT_REQUEST_DUPLICATE`(409) | AC-3-33 · AC-3-34 · AC-3-35 (Mock 재현) | `BACKEND_HANDOFF.md`, `ERROR_CODES.md` |
| **P3-BIP-06** | **증정 배송지 저장 위치·보호** — 아동 데이터와 결합되는 성인 PII (`shipping_address_ref`) | Stage 3 Contract에 배송지 필드 **없음**(§16 D-15) | 해당 없음 (Frontend 미수집) | `DATA_REQUIREMENTS.md` + **NEEDS DECISION (운영·법무)** |
| **P3-BIP-07** | **초대형(invitational) push 발송** — Context별 문구, 시간 미지정 Context의 평균 시간대 학습, 리마인더 스케줄 | `NotificationPreferences{ cardRefreshTime, reminderDays, reminderTime, pushEnabled }`, `NotificationKind.session_invite` | AC-3-40 · AC-3-41 (설정 저장·표시) | `BACKEND_HANDOFF.md` |
| **P3-BIP-08** | **push provider 선정·기기 토큰 저장(암호화)·해지·payload PII 최소화** | `POST /v1/push-devices{ platform, token }` → `PushDevice`(token 미반환), `DELETE /v1/push-devices/:id` | AC-3-43 · AC-3-44 (등록·해지 호출, 권한 거부) | `BACKEND_HANDOFF.md`, `AUTH_REQUIREMENTS.md` + **NEEDS DECISION (provider)** |
| **P3-BIP-09** | **`child_books` 소유 상태 파생 · 읽은 책 히스토리 갱신** (sessions 기반 `first_read_at`·`last_read_at`·`read_count`) | `LibraryBook{ ownership, source, firstReadAt?, lastReadAt?, readCount }`, `filter=history` | AC-3-28 · AC-3-29 (필터·정렬 표시) | `DATA_REQUIREMENTS.md` |
| **P3-BIP-10** | **Activity Card 로딩 2초 이내 (NFR 성능)** — 실 API 응답 시간 | 응답 크기·필드 수를 최소화한 `ActivityCard` 계약 | AC-3-14 (Skeleton·캐시로 체감 지연 처리) | `BACKEND_HANDOFF.md` |
| **P3-BIP-11** | **진행 중 세션 판정의 서버 권한** — `HomeSummary.activeSession`, `SESSION_ALREADY_ACTIVE` | `HomeSummary.activeSession{ sessionId, status }` | AC-3-15 (표시만) | `BACKEND_HANDOFF.md` |
| **P3-BIP-12** | **Idempotency-Key 서버 보관 24h·재생** (`POST …/library/books`, `POST …/gift-requests`) + **카드 채택률 KPI 로깅**(`selected_option_id`·`adopted_session_id`, §2.3) | 두 endpoint의 IK 요구, `POST …/selection` 이 `selected_option_id` 를 기록 | AC-3-30 · AC-3-36 (Mock replay) | `BACKEND_HANDOFF.md`, `ERROR_CODES.md` |
| **P3-BIP-13** | **Prompt 단계(`phase`) 판정 로직** — 각 Prompt 가 읽기 **전**(`pre`) / 읽은 **후**(`post`) 중 어디에 속하는지 서버가 정한다. Prompt 라이브러리 콘텐츠 설계와 함께 결정된다 (§16 D-8, `stage-3-approvals.md` §8.1) | `Prompt.phase: 'pre' \| 'post' \| null` — **optional · 표시 전용**. Frontend 는 값을 **생성·가공·추론하지 않는다**. 값이 없으면 배지를 렌더하지 않는다 | AC-3-80 (값 있을 때만 배지 렌더) · AC-3-81 (Mock fixture 결정적 값 · 하드코딩 0건) | `BACKEND_HANDOFF.md`, `ANALYSIS_PIPELINE_REQUIREMENTS.md` (Prompt 라이브러리 항목) |
| **P3-BIP-14** | **Prompt 페이지 앵커(`pageRef`) 데이터** — `P.6` 형태의 책별 페이지 참조. **책별 페이지 단위 앵커 데이터가 선행 필요**하며, 큐레이션 20권의 **페이지 메타가 없으면 생성할 수 없다** → Backend 구현 범위를 넘어 **콘텐츠 제작 범위**로도 기록한다 (§16 D-8, §8.1) | `Prompt.pageRef: string \| null` — **optional · 표시 전용**(서버 문자열을 그대로 표시, Frontend 포맷팅·번역 금지) | AC-3-80 · AC-3-81 (동일 — 값 유무에 따른 렌더, fixture 결정성) | `BACKEND_HANDOFF.md`, `DATA_REQUIREMENTS.md`(책별 페이지 메타 테이블) + **콘텐츠 제작 범위 — 큐레이션 20권 페이지 메타 수집 필요** |

| ⭐ **P3-BIP-15** **(Rev 4 신규)** | **책 저장 상태의 서버 소유** — `★ Save` 가 만든 `child_books.saved`·`saved_at` 의 생성·멱등 보장·`LibraryFilter=saved` 조회, `source=card_save` 기록. 저장이 **추천 신호로 쓰일지는 Backend·제품 결정**(Frontend 는 기대하지 않는다). 전체 삭제(FR-21) 대상에 포함 | `PUT /v1/children/:childId/saved-books` → `LibraryBook{ saved, savedAt }` (같은 책 재저장 = **같은 응답·같은 `savedAt`**), `DELETE …/saved-books/:bookId` → 204. 신규 error code **0건** (`RESOURCE_NOT_FOUND`·`VALIDATION_FAILED` 만) | **AC-3-84**(요청 발생·멱등) · **AC-3-85**(실패·오프라인 UX) · **AC-3-86**(저장 대상 = 선택된 옵션의 책) | `BACKEND_HANDOFF.md`, `DATA_REQUIREMENTS.md` + **NEEDS DECISION**: 초기 저장 여부 노출(`G-14`) · 토글 여부(`G-13`) · `conversation_only` 대상(`G-12`) |

**향후 Backend가 재사용해야 할 Stage 3 산출물**: `packages/contracts` 의 home/activity/prompts/library/notifications schema + 신규 enum 5종(`PromptKind`·`AgeBand`·`LibraryFilter`·`BookSource`·`PushPlatform`) + `TimeOfDay`. Backend 모듈에서 별도 schema/type 재선언 금지 (rules/backend.md §4).

**Stage 3가 Handoff에 추가로 남기는 요구**: ① 추천 이유·코칭 문장·Prompt 문구는 **서버 생성 문구**이며 안전 필터·금지어 검증을 통과해야 한다(§8.4) ② `ActivityCard.options` 는 **항상 3개**다 ③ `active` 가 아닌 prompt_set은 내려오지 않는다 ④ 카드 날짜 기준 timezone을 서버가 소유한다(§16 D-10).

---

## 11. Acceptance Criteria

판정 규칙: rules/qa.md §1. PASS는 QA가 직접 실행한 증거 필요. 모든 AC는 **Frontend 부분만** 판정하며, `BACKEND_INTEGRATION_PENDING` 은 §10의 P3-BIP-01~14로 **별도 항목**으로 기록한다.

### 11.1 Scope 준수

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-01** | `apps/api/`, `supabase/`, `apps/mobile/` 이 저장소에 **존재하지 않는다** | `git ls-files` / `ls` | CLAUDE.md, #7 |
| **AC-3-02** | Out of Scope(§3.1)가 구현되지 않았다 — 세션 생성·세션 화면·녹음·Prompt Drawer·출석 스티커·회고·분석·리포트 화면 내용·데이터 관리·탈퇴·**Stage 2-B 프로필/발전 역량 화면**·`CapabilityDiamondChart`·`PersonaCard`, Stage 4~8 scenario key, 나머지 도메인 Mock stub | route 목록 · 디렉토리 목록 · scenario 목록 · grep | §3.1, rules/workflow §2 |
| **AC-3-03** | import 경계 위반 0건 — `packages/* → apps/*`, `ui → contracts`, **`features/A → features/B`**(activity-card-deck · book-selection · reading-context · library · notification-preferences · settings 6개), 레이어 역방향, 순환 | `pnpm lint:boundaries` | ARCHITECTURE §4, §5.2 |

### 11.2 내비게이션 — BottomTabBar 첫 마운트 (#15 · D-02)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-04** | `/` 와 `/library` 에 BottomTabBar가 마운트되고 항목이 **Library / Home(가운데) / Progress 3개**이며 `/session` 탭이 없다 | e2e + DOM 검사 | **#15 · D-02** |
| **AC-3-05** | 탭 아이콘이 `S1-D2-5` 확정값(`book` · HARU SVG `140:2971` · `chart-no-axes-column-increasing`)이고, 활성 상태가 **색상만이 아닌 수단**(아이콘 채움·라벨 강조 등)으로도 구분된다 | 시각 비교 + 대비 측정 | `S1-D2-5`, WCAG 1.4.1 |
| ✎ **AC-3-06** | 탭바 고정 방식이 **§16 D-1 승인안대로** 구현되고, 320/393/600/1024px에서 **콘텐츠가 탭바·중앙 버튼 overhang에 가려지지 않는다**(스크롤 끝 기준 마지막 요소 전체 가시) | Playwright 4폭 × 2화면 | `S1-E-3`, Design Spec §2.2 <br>✎ **수정 (Rev 4 — approvals §12.9 · audit §11.6 · §12.4 M-01)**: 현재 **320px FAIL** — 카드가 탭바를 **16.8px 덮는다**. 원인은 ActionBar 2행(102px)이다. 해소안 = ActionBar 를 **`Save` 고정 87 + gap 8 + `Start Session` flex** 로 1행 유지 → 카드 하단 705, 탭바 766, **겹침 0**. 여기에 **탭바 하단 16px**(신규 토큰 `--layout-tabbar-bottom-gap`, Figma 852−(766+70))을 포함해 재검증한다 |
| **AC-3-07** | Toast(§4.12)와 Sheet가 탭바 위에 정상 표시되고 z-index·하단 offset이 §16 D-1 규칙과 일치한다 | 컴포넌트 + e2e | Design Spec §4.12 · §6.2 |
| **AC-3-08** | 탭 전환이 키보드만으로 가능하고 각 탭에 접근성 이름과 `aria-current` 가 있다. 터치 타깃 ≥ 44×44 | 키보드 e2e + 측정 | NFR 접근성 |

### 11.3 Home · Activity Card (FR-07)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-09** | `/` 가 Stage 2 skeleton을 대체하고 `GET …/home` + `GET …/activity-cards/today` 를 호출한다. `PlaceholderPage`·빈 `EmptyState` 잔존 0건 | e2e + Mock 요청 로그 | #33 → Stage 3 |
| ✎ **AC-3-10** | 덱이 **정확히 3장**이고 각 카드에 **역량 배지 · 추천 책(표지·제목) · 추천 이유 1~2문장 · 부모용 코칭 문장**이 표시된다 | 화면 + 컴포넌트 테스트 | FR-07, §7.4 <br>✎ **수정 (Rev 4 — approvals §12.8 `A-17`)**: "부모용 코칭 문장"의 **검증 지점을 카드 뒷면(`86:482`) beige 노트**(`color/grey/92` #f0eee6, 330×102/98)로 이동한다. Figma 앞면(`163:2649`·`86:438`)에는 코칭 문장 블록이 **없다** — 앞면 검증 항목은 역량 배지 · 추천 책(표지·제목) · 추천 이유까지다. 앞면에 코칭 문장 블록을 **추가하지 않는다**(최우선 규칙 2) |
| ⛔ **AC-3-11** | 카드 `date` 가 오늘이 아니면 화면이 **그 사실을 밝힌다**(캐시·지난 카드 표시). 오늘 카드가 없으면(`empty`) 안내를 표시한다 | 시나리오 테스트 | §16 D-10 <br>⛔ **폐기 (Rev 4 — approvals §12.8 `AC-3-11` 결정, 사용자 2026-10-05)**: Figma 에 없는 파란 안내 카드를 삭제하면서 **"지난 날짜를 밝힌다"는 요구 자체를 없앤다**. `D-10` 의 **서버 `ActivityCard.date` 신뢰 / 클라이언트 재판정 금지는 유지**되고, ③("화면이 그 날짜를 밝힌다")만 **철회**한다. audit §14.3 의 3안(R-1·R-2·R-3) 중 **R-3 채택**. ⚠️ `empty`(오늘 카드 없음) 안내는 **유지** → §20.2 신규 `AC-3-82` 로 분리 |
| **AC-3-12** | 역량 배지 라벨이 #14 표시 라벨이고 색이 `--color-capability-*`(#19)다. Figma "Emotion Day Day" 오타를 복제하지 않는다 | grep + 시각 비교 | #14 · #19 |
| **AC-3-13** | 추천 이유·코칭 문장·Prompt 문구가 **API(Mock) 응답 값만** 표시되고 Frontend가 생성·가공하지 않는다. 하드코딩 문구 0건 | grep + 코드 검사 | rules/frontend §8, §8.4 |
| ✎ **AC-3-14** | `loading` 에서 덱 Skeleton이 표시되고, 초기 렌더가 카드 응답을 **blocking 하지 않는다**(헤더·탭바 즉시 표시) | 시나리오 테스트 + 프로파일 | NFR 성능 2초 <br>✎ **수정 (Rev 4 — approvals §12.9 · audit §11.11)**: 덱 Skeleton 형태를 **가로 트랙 1장 + peek 8px** 로 바꾼다(현재 스택 형태). `empty`/`error`/`offline` 도 **트랙 높이 415 를 차지**해 레이아웃이 튀지 않아야 한다. "초기 렌더가 카드 응답을 blocking 하지 않는다"는 부분은 그대로 유효 |
| **AC-3-15** | `session-already-active` 에서 Home에 **이어하기 안내**가 표시된다. `POST /v1/sessions` 호출 0건 | 시나리오 테스트 + 요청 로그 | §5.4, Stage 4 경계 |
| ✎ **AC-3-16** | 옵션 선택 → `POST /v1/activity-cards/:cardId/selection` → **응답의 Prompt 전체 + 코칭 문장 + Follow-up** 이 §16 D-4 승인안대로 표시된다 (개수 상한을 전제하지 않는다 — D-21) | e2e | FR-07, §8.2 <br>✎ **수정 (Rev 4 — approvals §12.9 · §12.7)**: Prompt 전체 + 코칭 문장의 표시 지점이 **별도 Sheet → 카드 뒷면(flip)** 으로 이동한다. 근거는 추측이 아니라 **Figma 데이터**다 — `86:482` 가 앞면과 **같은 컴포넌트**이고 시그니처에 **`flip?: "front"` variant**, 우상단 아이콘 에셋명이 **`flip_to_back`** 이다. `AD-S3-23`·Design Spec §12.5("별도 시트")는 **무효** |
| ⛔ **AC-3-17** | **Prompt 가 4개 이상인 응답도 contracts parse 를 통과하고**(`promptPreview` · `promptSet.questions` 모두 상한 없음, `.min(1)` 만), 접힌 상태에서 **3개가 보이며**(cutoff), **나머지가 확장·키보드로 도달 가능하다**. Frontend 가 `slice` 한 흔적이 0건이다 | ① contracts 단위 테스트(4개·10개 통과 / 0개 거부) ② `success` fixture 에 **4개 이상 케이스** 포함 상태의 컴포넌트·키보드 e2e ③ `slice(` grep | **D-21** (§9.1), N-2 (§6.1) <br>⛔ **무효 (Rev 4 — approvals §12.4 · §12.9)**: Figma 에 **확장 트리거(`Show all 5 prompts`)가 없고** pill 4~5개가 **전부 노출**된다(`163:2649`=4 · `86:438`=5) → 최우선 규칙 2 위반이라 제거한다. ⚠️ **살아남는 부분은 §20.2 신규 `AC-3-83` 으로 옮긴다**: `promptPreview`·`promptSet.questions` **상한 없음**(`.min(1)` 만) · Frontend `slice` 금지 · 4개 이상 fixture — 이것들은 `D-21` 소관이며 `D-21` 은 **무효가 아니다**. n>5 처리(`A-11`)는 미결 |
| ✎ **AC-3-18** | **덱 전 카드에 제스처 없이 도달 가능**하다 — 이전/다음 버튼과 키보드(←/→)로 3장 모두 열람·선택할 수 있다 | 키보드 e2e | **WCAG 2.5.1**, `SwipeDeck` 규약 <br>✎ **수정 (Rev 4 — approvals §12.3 "덱 좌우 버튼 제거" · audit §11.3)**: "이전/다음 **버튼**과 키보드" → **"가로 scroll-snap 트랙에서 네이티브 키보드(←/→/Home/End)만으로 3장 모두 열람·선택 가능"**. 좌우 버튼은 **제거**한다 — Figma 에 없고, 가로 스크롤은 제스처 전용이 아니라 네이티브 키보드 경로가 있어 **WCAG 2.5.1 을 충족**한다. 포커스가 트랙 밖으로 튀지 않는지, 스냅 위치와 `aria` 현재 항목 표기가 일치하는지를 함께 검증한다 |
| ✓ **AC-3-19** | `prefers-reduced-motion: reduce` 에서 덱 전환·flip 애니메이션이 비활성화되고 동작은 유지된다 | e2e 양방향 | DESIGN_SYSTEM §9 <br>✓ **유효해진다 (Rev 4 — approvals §12.9)**: 지금까지 Stage 3 에 flip 애니메이션이 없어 공허한 AC 였으나, **flip 이 실제로 생기므로** 요구가 의미를 갖는다. `reduce` 에서는 **전환 없이 즉시 앞↔뒷면 교체**하고 동작(도달·조작·포커스)은 유지한다. 가로 트랙의 스냅 스크롤도 `reduce` 에서 동작이 유지되어야 한다 |
| **AC-3-20** | `conversation-only-option` · `reread-option` · `books-exhausted` 3종이 각각 **책 표지 없는 대체 카드**를 렌더하고 카드 종류가 사용자에게 식별된다 | 시나리오 테스트 | §7.4 규칙, §13 |
| **AC-3-21** | 표지 이미지에 의미 있는 `alt` 가 있고, 로드 실패 시 `BookCover placeholder`(대체 표지 + 제목)로 전환된다 | 컴포넌트 테스트 | COMPONENT_MAP §2 |

### 11.4 Reading Context (FR-08 Frontend 부분)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| ⏭ **AC-3-22** | Context 선택 UI가 **6값**(now · bedtime · after_pickup · weekend_morning · in_the_car · custom_time)을 제공하고 라벨이 copy 모듈에서 온다 | 화면 + grep | `ReadingContext` enum, §7.4 <br>⏭ **이월 (Rev 4 — approvals §12.3 ⑧, 사용자 2026-10-05)**: Context 선택 UI 6값 — **Stage 3 에서 제외.** Figma 카드 앞면에 **Reading Context 진입점이 없다**. 명세가 그 자리에 Figma 에 없는 `Pick a time` 을 넣은 것이 최우선 규칙 2 위반이었고, 그 자리는 **Figma 대로 `★ Save` 로 복원**된다. 별도 디자인을 **다음에 요청**한다. ⚠️ **contract(`SelectActivityOptionRequest.readingContext`·`customTime`·`createCustomTimeRefine`)는 삭제하지 않는다** — 진입점만 없다. `D-9`(미선택 진행 가능 여부)는 **이월된 결정**이 된다 |
| ⏭ **AC-3-23** | `custom_time` 선택 시에만 시간 입력이 나타나고, `customTime` 없이 제출하면 contracts가 거부한다 | 컴포넌트 + 단위 테스트 | §7.1 `createCustomTimeRefine` <br>⏭ **이월 (Rev 4 — approvals §12.3 ⑧, 사용자 2026-10-05)**: `custom_time` 조건부 입력 — **Stage 3 에서 제외.** Figma 카드 앞면에 **Reading Context 진입점이 없다**. 명세가 그 자리에 Figma 에 없는 `Pick a time` 을 넣은 것이 최우선 규칙 2 위반이었고, 그 자리는 **Figma 대로 `★ Save` 로 복원**된다. 별도 디자인을 **다음에 요청**한다. ⚠️ **contract(`SelectActivityOptionRequest.readingContext`·`customTime`·`createCustomTimeRefine`)는 삭제하지 않는다** — 진입점만 없다. `D-9`(미선택 진행 가능 여부)는 **이월된 결정**이 된다 |
| ⏭ **AC-3-24** | 선택한 Context가 `POST …/selection` 요청 body에 포함된다 (Mock 요청 로그 증거) | 요청 로그 테스트 | PLANNING Exit Criteria <br>⏭ **이월 (Rev 4 — approvals §12.3 ⑧, 사용자 2026-10-05)**: 요청 body 포함 — **Stage 3 에서 제외.** Figma 카드 앞면에 **Reading Context 진입점이 없다**. 명세가 그 자리에 Figma 에 없는 `Pick a time` 을 넣은 것이 최우선 규칙 2 위반이었고, 그 자리는 **Figma 대로 `★ Save` 로 복원**된다. 별도 디자인을 **다음에 요청**한다. ⚠️ **contract(`SelectActivityOptionRequest.readingContext`·`customTime`·`createCustomTimeRefine`)는 삭제하지 않는다** — 진입점만 없다. `D-9`(미선택 진행 가능 여부)는 **이월된 결정**이 된다 |
| ⏭ **AC-3-25** | Context 선택 시트가 키보드로 열기·이동·선택·닫기 가능하며 초기 포커스·포커스 트랩·복귀가 동작한다 | 키보드 e2e | NFR 접근성, Sheet 규약 <br>⏭ **이월 (Rev 4 — approvals §12.3 ⑧, 사용자 2026-10-05)**: 시트 키보드 조작 — **Stage 3 에서 제외.** Figma 카드 앞면에 **Reading Context 진입점이 없다**. 명세가 그 자리에 Figma 에 없는 `Pick a time` 을 넣은 것이 최우선 규칙 2 위반이었고, 그 자리는 **Figma 대로 `★ Save` 로 복원**된다. 별도 디자인을 **다음에 요청**한다. ⚠️ **contract(`SelectActivityOptionRequest.readingContext`·`customTime`·`createCustomTimeRefine`)는 삭제하지 않는다** — 진입점만 없다. `D-9`(미선택 진행 가능 여부)는 **이월된 결정**이 된다 |
| ⏭ **AC-3-26** | §16 D-9 승인안대로 **Context 미선택 시 진행 가능 여부**가 구현되고, 그 규칙이 contracts와 화면에서 일치한다 | 단위 + e2e | M-32 잔여 <br>⏭ **이월 (Rev 4 — approvals §12.3 ⑧, 사용자 2026-10-05)**: 미선택 진행 가능 여부(`D-9`) — **Stage 3 에서 제외.** Figma 카드 앞면에 **Reading Context 진입점이 없다**. 명세가 그 자리에 Figma 에 없는 `Pick a time` 을 넣은 것이 최우선 규칙 2 위반이었고, 그 자리는 **Figma 대로 `★ Save` 로 복원**된다. 별도 디자인을 **다음에 요청**한다. ⚠️ **contract(`SelectActivityOptionRequest.readingContext`·`customTime`·`createCustomTimeRefine`)는 삭제하지 않는다** — 진입점만 없다. `D-9`(미선택 진행 가능 여부)는 **이월된 결정**이 된다 |

### 11.5 서재 (FR-20 · FR-22 · FR-23)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-27** | `/library` 가 `GET …/library` 를 호출해 This Week's Shelf(캐러셀) · "Our curated shelf"(시트) · 읽은 책 히스토리 목록을 표시한다 | e2e | FR-20, `30:74`·`163:1669` |
| **AC-3-28** | 필터 `owned` / `gifted` / `history` 가 동작하고 각 필터가 **요청 쿼리로 전달**된다(클라이언트 재필터링 아님) | 요청 로그 테스트 | §4 Stage 3 |
| **AC-3-29** | 히스토리 항목이 `lastReadAt`·`readCount` 를 서버 값 그대로 표시한다. Frontend가 세션 데이터를 재계산하지 않는다 | 코드 검사 | P3-BIP-09 |
| **AC-3-30** | `/library/add` 에서 카탈로그 검색(재사용 `GET /v1/books/search`) → 선택 등록, **검색 결과 없음 → 제목·저자 직접 입력** 경로가 모두 동작하고 `Idempotency-Key` 가 전송된다 | e2e + 요청 로그 | **FR-23**, §7.2 규칙 |
| **AC-3-31** | 직접 등록 책(`user-entered-book`)이 서재·덱·상세에서 **표지 placeholder + 제목**으로 정상 표시된다 | 시나리오 테스트 | `user-entered-book` |
| **AC-3-32** | `BookDetailSheet` 가 `GET /v1/books/:bookId/prompts` 로 **책별 Prompt**를 표시하고 구매 링크를 외부 링크(`rel="noopener noreferrer"`)로 연다 | e2e + DOM | FR-20, §8.1 |
| **AC-3-33** | 증정 신청 CTA → `POST …/gift-requests`(IK) → 접수 안내가 동작하고, **배송지 입력 필드가 존재하지 않는다** | e2e + grep | FR-22, §16 D-15 |
| **AC-3-34** | `gift-pending` 에서 서재에 **배송 상태**가 표시되고, "보유 책 직접 입력 또는 대화 전용 세션" 안내가 함께 제공된다 | 시나리오 테스트 | **§13** |
| **AC-3-35** | `gift-duplicate` 에서 `GIFT_REQUEST_DUPLICATE` 가 중복 안내로 표현되고 오류 화면으로 빠지지 않는다 | 시나리오 테스트 | §5.4 |
| **AC-3-36** | 같은 Idempotency-Key + 같은 body replay가 **동일 응답**을 돌려주고, 다른 body는 `IDEMPOTENCY_KEY_REUSED` 다 | Mock replay 테스트 | P3-BIP-12 |
| **AC-3-37** | 서재 `empty`(보유 0권 · 히스토리 0건)에서 EmptyState가 표시되고 **다음 행동**(직접 등록 / 증정 신청)으로 연결된다 | 시나리오 테스트 | C13-20 |
| **AC-3-38** | 서재 목록이 cursor 페이지네이션으로 추가 로드되며 중복·유실이 없다 | 시나리오 테스트 | `Paginated<LibraryBook>` |

### 11.6 알림 설정 · push (FR-08 Frontend 부분, C-16)

> **갱신 2026-10-02 — D-18 (§8 · §8.4)**: 알림 **설정 화면만** Stage 3 에서 제외된다. **AC-3-39(설정 목록 2행) · AC-3-40(설정 저장) · AC-3-41(시간 입력 규격) 은 Out of Scope** 로 이월하고 QA 는 FAIL 로 판정하지 않는다. **AC-3-42 ~ AC-3-45(push 권한 사전 안내 · 기기 등록/해지 · 거부 시나리오 · SDK 미도입)는 그대로 In Scope** 다 (D-16 유효). contracts `GET/PUT /v1/notification-preferences` · `POST /v1/push-devices` · `DELETE /v1/push-devices/:id` 는 **정의를 유지**하며, 설정 화면 없이도 contract·Mock 자체는 AC-3-50 계열(contracts/Mock)에서 검증된다.

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-39** | ~~`/settings` 목록이 **2행**(로그아웃 + 알림 설정)이고 알림 설정 행이 `/settings/notifications` 로 연결된다~~ → **Out of Scope (D-18)**: 알림 설정 행·화면 모두 Stage 3 제외. `/settings` 는 로그아웃 1행을 유지한다 | — (이월) | **C-16** + §8.4 |
| **AC-3-40** | **Out of Scope (D-18)** — 알림 설정 저장 플로우는 설정 화면과 함께 이월 (contract 정의는 유지) | — (이월) | FR-08, §7.8, §8.4 |
| **AC-3-41** | **Out of Scope (D-18)** — 시간·요일 입력 UI 이월. 단 **`TimeOfDay`(`HH:mm`) contracts 검증은 Reading Context `customTime` 경로에서 In Scope** 로 유지한다 (AC-3-23) | 단위 테스트(`customTime` 경로만) | `TimeOfDay`, §8.4 |
| **AC-3-42** | push on 시도 시 **권한 요청 전에 사전 안내**가 표시되고, 사용자가 동의해야 OS 권한 요청이 호출된다 | e2e + platform mock | FR-08, C13-19 |
| **AC-3-43** | 권한 허용 → `POST /v1/push-devices{platform, token}` 호출, 응답에 **token이 포함되지 않는다**. 로그아웃 시 `DELETE /v1/push-devices/:id` 호출 + 로컬 상태 정리 | 요청 로그 + 코드 검사 | §5.5, P3-BIP-08 |
| **AC-3-44** | `push-permission-denied` 에서 거부 안내와 재요청 경로가 표시되고 **기기 등록 요청이 발생하지 않는다** | 시나리오 테스트 | §5.4 |
| **AC-3-45** | push provider SDK·광고·제3자 분석 SDK가 **의존성에 없다** | `package.json` + 번들 grep | §5.5, rules/frontend §1 |

### 11.7 오프라인 · 캐시 (NFR 오프라인)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-46** | `offline-cached-card` 에서 **캐시된 Activity Card + Offline Banner**가 함께 표시된다 | 시나리오 테스트 | **NFR 오프라인** |
| **AC-3-47** | 오프라인 상태에서 선택 mutation이 차단되고 그 이유가 안내된다. 로컬 outbox를 만들지 않는다 | 시나리오 + 코드 검사 | §5.3 |
| **AC-3-48** | 캐시는 **Activity Card만** 저장한다 — `lastHighlightLine`·아이 이름·서재 목록·증정 배송 정보가 로컬 저장소에 남지 않는다 | 저장소 전수 검사 테스트 | ARCHITECTURE §6.3 · §13 |
| **AC-3-49** | 캐시가 schemaVersion 불일치·parse 실패·날짜 경과 시 폐기되고, **로그아웃 시 삭제**된다 | 로컬 저장소 단위 테스트 | §5.3, §16 D-11 |
| **AC-3-50** | `offline` 에서 서재·알림 설정도 Offline 상태 화면을 갖는다(빈 화면·무한 로딩 없음) | 시나리오 테스트 | rules/frontend §7 |

### 11.8 에셋 (C-17 · Stage 1 `D-4`)

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-51** | 표지·캐릭터 래스터가 **AVIF + WebP + PNG**로 산출되고 `<picture>`+`srcset` 로 제공되며 해상도 상한(1440/696/360/216)을 넘지 않는다 | 빌드 산출물 검사 | **D-4** |
| **AC-3-52** | `BookCover` 가 **번들 에셋 경로와 원격 URL 모두** 렌더하며 경로 규칙을 컴포넌트에 하드코딩하지 않는다 | 컴포넌트 테스트 + grep | §5.4 |
| **AC-3-53** | Figma placeholder 데이터(표지 ↔ 제목 불일치 등, M-36)가 fixture로 복사되지 않았다 | fixture 검사 | §5.4 catalogue 주석 |

### 11.9 contracts

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-54** | Stage 3 schema가 `packages/contracts` 에만 정의되고 `apps/web` 에 같은 모양 타입 재선언이 없다 | grep + `tsc --noEmit` | rules/architecture §5 |
| **AC-3-55** | `BookSummarySchema`(Stage 2)가 **변경되지 않았고** `LibraryBookSchema` 가 이를 포함한다 | 단위 테스트 + diff | §7.1 비파괴 확장 |
| **AC-3-56** | 신규 enum 5종(`PromptKind`·`AgeBand`·`LibraryFilter`·`BookSource`·`PushPlatform`)이 스냅샷 테스트로 고정되고 enum 총수가 **31종**이 된다 | 단위 테스트 | §7.1, 보고 ④ |
| **AC-3-57** | `ActivityCardSchema.options` 가 **길이 3**을 강제하고, 위반 응답은 parse 실패한다 | 단위 테스트 | §7.9 |
| **AC-3-58** | `packages/contracts` 런타임 의존이 `zod` 하나이고, 시간 의존 검증은 clock 주입 팩토리다 | 의존 검사 + 단위 테스트 | Stage 2 `D-10` 원칙 |
| **AC-3-59** | Error Code **신규 추가 0건**(28종 유지) | diff | §7.1 |

### 11.10 Mock Infrastructure

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-60** | Mock Adapter 6종이 모든 요청·응답을 contracts schema로 parse 한다 | Mock 단위 테스트 | rules/architecture §4 |
| **AC-3-61** | §8.2의 **16 key**가 전부 재현되고 전부 §5.4 catalogue 값이다. 신규 key·alias 사용 0건 | scenario 목록 대조 | §5.4 Single Source |
| **AC-3-62** | 같은 scenario key로 2회 호출 시 **동일 바이트** 응답이 나온다(덱 3장 구성·Prompt 문구 포함) | 결정성 테스트 | §8.5 |
| **AC-3-63** | Mock Data가 Component / Page / Feature에 하드코딩되지 않았다 (fixture는 `mocks/` 에만) | grep | rules/frontend §5 |
| **AC-3-64** | Component·Feature가 Mock Adapter를 직접 import하지 않고 Adapter 선택 지점이 `app/providers` **한 곳**이다 | grep | ARCHITECTURE §2.3 |
| **AC-3-65** | Http Adapter 골격 4종이 존재하고 `https:` 전용 규칙이 유지된다 | 코드 검사 + 단위 테스트 | Stage 1 `D-7` |

### 11.11 Design · Accessibility · Responsive

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| ✎ **AC-3-66** | Stage 3 화면 Figma 대조(영역 클립 baseline, `0.002 / 20`) — `26:21`(헤더·버블·dots) · `163:2648`/`86:512` 카드 · `30:74` 서재 · `163:1669` 시트 · `145:1132` 책 상세 · `25:87` 탭바. **허용 차이는 사전 기록**한다 | Playwright 시각 비교 | Stage 2 `D-12` 체계 <br>✎ **수정 (Rev 4 — approvals §12.9 · audit §11.12)**: **기존 Home baseline 5장은 전부 무효 → 재생성.** Home 대상 baseline = `s3-home`(`/` 393×852 ↔ `26:21`) · `s3-home-deck`(트랙 = 카드 1 + peek 8 ↔ `163:2649`) · **`s3-home-deck-back`**(카드 뒷면 ↔ `86:482`, 신규) · **`s3-home-deck-scrolled`**(카드 2 스냅, 좌우 peek 8/8, 신규) · `s3-tabbar-bottom`(하단 16px). **`s3-home-deck-prompts-expanded` 폐기**(확장 트리거 제거). 서재·시트·책 상세 baseline 은 그대로 |
| **AC-3-67** | 임의 HEX / arbitrary Tailwind value / inline 수치 **신규 사용 0건** | grep | rules/frontend §6 |
| **AC-3-68** | 320 / 393 / 600 / 1024px 에서 덱·캐러셀·시트·탭바가 가로 스크롤 없이 배치되고 앱 컬럼 최대 480px 가운데 정렬을 지킨다 | Playwright 4폭 | #12 |
| **AC-3-69** | 캐러셀·시트·덱이 **제스처 전용이 아니며** 전 항목에 키보드로 도달 가능하다 | 키보드 e2e | WCAG 2.5.1 |
| **AC-3-70** | 신규 컴포넌트 focus 표시·접근성 이름·44×44 터치 타깃을 충족한다 (수용 예외 D-01·S1-G-2는 `PASS (accepted: …)`, 가값 P-01·P-02·P-04·P-05·P-16·P-17은 목록 기록) | 측정 + 대비 계산 | NFR 접근성 |
| **AC-3-71** | 200% 텍스트 확대에서 덱 카드·서재 행·알림 설정이 잘리지 않고 reflow 된다 | Playwright | NFR 접근성 |
| **AC-3-72** | 사용자 노출 문구에 **진단·판정·비교 표현이 없다**("strong"·"emerging"·"+18% vs last week" 등 M-12 대상 표현 0건) | copy 모듈 grep | **§8.4**, rules/frontend §8 |

### 11.12 Privacy · Security

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-73** | 콘솔·에러 로그에 아이 이름·하이라이트 문장·push token이 남지 않는다 | 로그 전수 검사 | ARCHITECTURE §13 |
| **AC-3-74** | 번들 / `VITE_*` / 저장소에 Secret이 없고 `.env.example` 신규 키 0건 | grep | NFR 보안 |
| **AC-3-75** | 외부 도메인 네트워크 요청 0건(구매 링크는 사용자 클릭 시 새 탭) | e2e 네트워크 로그 | §5.5 |
| **AC-3-76** | 로그아웃 시 Activity Card 캐시 · push device 상태 · Query 캐시가 모두 정리된다 | e2e + 저장소 검사 | §5.3 · §5.5 |

### 11.13 회귀 · 실행

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-77** | Stage 1·2 AC 핵심 경로 재실행 통과 — 가입 3경로 → 동의 → VPC → 온보딩 5단계 → `/onboarding/saved` → `/` 착지, Guard 리다이렉트, **AC-2-13 동의 전 아동 데이터 0건** | e2e 회귀 | rules/qa §5 |
| **AC-3-78** | `pnpm typecheck` · `lint` · `test` · `build` · `test:e2e` 전부 통과, 신규 `any`/`@ts-ignore` 0건 | 명령 실행 | rules/qa §4 |
| **AC-3-79** | dev 전용 산출물(Scenario Panel · UI gallery · `request-log`)이 Production 빌드에 포함되지 않는다 | 빌드 sentinel | Stage 1 AC-1-42 |

### 11.14 Prompt 단계·페이지 태그 (D-8 추가 승인분 — 2026-10-02)

> D-8 이 **권장안 기각 → Figma 기준 구현**으로 뒤집히면서 추가된 AC다 (`stage-3-approvals.md` §8.1). Backend 부분은 P3-BIP-13 · P3-BIP-14.

| AC | 요구사항 | 검증 방법 | 근거 |
|---|---|---|---|
| **AC-3-80** | `PromptPill` 이 `phase` 값이 있을 때만 `PRE`/`POST` 배지를, `pageRef` 값이 있을 때만 페이지 참조를 렌더하고 **둘 다 없으면 아무 것도 렌더하지 않는다**. 라벨 문구는 copy 모듈에서 온다 | 컴포넌트 테스트(값 있음/없음 양방향) + grep | §16 D-8, §8.1 |
| **AC-3-81** | Mock fixture 가 `phase`·`pageRef` 를 **결정적으로** 채워 화면에 실제로 표시되고, Frontend 가 두 값을 **생성·추론·가공하지 않는다**(화면·feature 하드코딩 0건, 동일 key 2회 호출 → 동일 값) | Mock 결정성 테스트 + grep + 코드 검사 | §16 D-8, rules/frontend §8 |

~~**AC 총 81건 (AC-3-01 ~ AC-3-81).**~~ → ⭐ **Rev 4: AC 총 88건 (AC-3-01 ~ AC-3-88)** — 신규 7건(`AC-3-82`~`88`, §20.2) · **무효 2건**(`AC-3-11` 폐기 · `AC-3-17`) · **이월 5건**(`AC-3-22`~`26`) → **판정 대상 81건**. 상세·수정 내역 = **§20**. AC-3-80·81 은 D-8 승인(2026-10-02)으로 추가되었다. 요구사항 ID 매핑: FR-07 → AC-3-09~21 · FR-08 → AC-3-22~26·39~45 · FR-20 → AC-3-27~29·32·37·38 · FR-22 → AC-3-33~36 · FR-23 → AC-3-30·31 · 내비게이션(#15·D-02) → AC-3-04~08 · NFR 오프라인 → AC-3-46~50 · C-17/D-4 에셋 → AC-3-51~53 · contracts → AC-3-54~59 · Mock → AC-3-60~65 · 디자인/접근성/반응형 → AC-3-66~72 · Privacy/보안 → AC-3-73~76 · Scope → AC-3-01~03 · 회귀 → AC-3-77~79.

---

## 12. Test Strategy

> ⭐ **Rev 4 추가 (2026-10-05)**: ① 덱 테스트는 **스택 index 모델이 아니라 가로 scroll-snap 트랙**을 대상으로 한다 — 스냅 위치·peek 8·네이티브 키보드(←/→/Home/End)·버튼 **부재**. ② **flip 상태 머신 테스트**(앞↔뒷면, `reduce` 즉시 교체, 포커스 이동)를 추가한다. ③ `★ Save` 는 **요청 로그 + replay(멱등) + `error`/`offline` 복구** 테스트. ④ Reading Context 는 **화면 e2e 가 아니라 contracts 단위 테스트**로만 남는다. ⑤ **Home 시각 baseline 전면 재생성** (§20.6 ⑦).

| 계층 | 도구 | Stage 3 범위 |
|---|---|---|
| **contracts 단위** | Vitest (Node) | `ActivityCardSchema.options` 길이 3 강제 + **`targetCapability` 필드 부재**(D-22) · **`PromptSet.questions` 상한 없음 — 4개·10개 parse 통과 / 0개 거부(`.min(1)`), `promptPreview` 동일**(D-21, §9.1) · `SelectActivityOptionRequest` 의 `custom_time` 조건부 `customTime` 필수(clock 주입) · `TimeOfDay` 형식 경계(`00:00`·`23:59`·`24:00`·`7:00`) · `AddOwnBookRequest` discriminated union(bookId 경로 / title 경로 / 둘 다 없음) · `LibraryBook` 이 `BookSummary` 를 포함하고 Stage 2 정의가 불변 · 신규 enum 5종 스냅샷(총 31종) · `NotificationPreferences.reminderDays` 0–6 범위 |
| **Mock 단위** | Vitest | Mock Adapter 6종 × scenario 16종 × contracts parse · **결정성**(동일 key 2회 → 동일 바이트, 덱 구성·Prompt 문구 포함) · Idempotency replay 2종 · cursor 페이지네이션 중복·유실 0 · `GIFT_REQUEST_DUPLICATE`·`ONBOARDING_INCOMPLETE` 거부 로직 · 요청 로그 수집기로 **필터 쿼리 전달·Context 포함** 검증 |
| **로컬 캐시 단위** | Vitest | `ActivityCardCache` — 저장/복원/날짜 경과/schemaVersion 불일치/parse 실패/로그아웃 삭제 · **민감 필드 미저장**(`lastHighlightLine`·아이 이름 키 부재 전수 검사) |
| **Component** | Vitest + Testing Library | `SectionHeader` · `Carousel`(키보드·버튼 이동, 제스처 없이 전 항목 도달) · `Toggle`(키보드·`aria-checked`) · `ListRow` media/meta 변형 · `BookCover`(placeholder·`onError`·`alt`) · `ActivityOptionCard`(3 kind × density) · `CapabilityBadge`(4역량 라벨·색) · `PromptPill` · `CoachingNote` · `ReadingContextChip` · `StreakChip` · `GiftStatusTag` · `ReadingContextSheet`(`custom_time` 조건부 입력) |
| **Feature/Query** | Vitest + Testing Library | `useHomeSummary` · `useTodayActivityCard` · `useSelectActivityOption` · `useLibrary` · `useAddOwnBook` · `useBookPrompts` · `useGiftRequests` · `useNotificationPreferences` · `usePushDevice` × scenario → Loading / Success / Empty / Error+Retry / Offline 전이 |
| **Privacy 회귀 테스트** | Vitest | ① 로컬 저장소 전수 검사 — Activity Card 외 키 0건, 금칙 키(`firstName`·`lastHighlightLine`·`token`·`address`) 0건 (AC-3-48) ② 로그아웃 후 저장소·Query 캐시 잔존 0건 (AC-3-76) ③ 콘솔 로그 PII 0건 (AC-3-73) ④ **Stage 2 AC-2-13 재실행**(동의 전 아동 데이터 0건) |
| **E2E** | Playwright | ① 탭 3개 전환 + 활성 표시 ② Home 덱 3장 **키보드만으로** 열람·선택 → Prompt 표시 ③ Context 선택 → 요청 포함 ④ 서재 필터 3종 + 상세 시트 + 책별 Prompt ⑤ `/library/add` 검색 → 없음 → 직접 입력 등록 → 서재 반영 ⑥ 증정 신청 → 대기 안내 → 배송 상태 ⑦ 알림 설정 저장 → 재진입 유지 ⑧ push 사전 안내 → 권한 허용/거부 2경로 ⑨ 오프라인 캐시 카드 + Banner ⑩ 로그아웃 → 캐시·push 정리 ⑪ **Stage 1·2 회귀 경로** ⑫ 외부 도메인 요청 0건 |
| **시각 비교** | Playwright | AC-3-66 영역 클립 baseline (Stage 2 `D-12` 체계 — `0.002 / 20`) + Stage 3 화면 전체 프레임 baseline(`0.002 / 200`, 레이아웃 회귀 전용). **탭바 마운트로 기존 baseline 재생성이 필요한 화면 목록을 handoff에 남긴다** |
| **정적 검사** | eslint / dependency-cruiser / grep | 경계 위반 0 · arbitrary value 0 · Adapter 직접 import 0 · scenario key catalogue 대조 · Secret grep · mock sentinel · 판정 언어 grep(AC-3-72) · 에셋 산출물 포맷·해상도 검사 |

- **수동 기기 테스트**: Stage 3는 웹 전용이다. 단 ① 탭바 sticky·safe-area(홈 인디케이터) ② 덱 스와이프 제스처 ③ Web Push 권한 다이얼로그는 **모바일 실기기 육안 확인을 권장**한다. 불가하면 `NOT VERIFIED` + 수동 절차를 남긴다.
- Playwright baseline은 Chromium · 고정 DPR · 폰트 로드 대기 · **이미지 디코드 대기** 조건으로 결정적으로 생성한다 (표지 래스터가 처음 들어오므로 로드 대기 조건이 추가된다).

---

## 13. Risks & Mitigations

| # | 위험 | 영향 | 완화 |
|---|---|---|---|
| S3-R1 | **탭바 고정 방식 불일치**(Design Spec `fixed` ↔ 구현 `sticky`)를 정하지 않고 구현하면 하단 여백·Toast·중앙 overhang이 화면마다 달라지고 기존 baseline이 대량 깨진다 | 레이아웃 회귀 | **§16 D-1을 구현 착수 전 필수 결정**으로 분류. 승인 후 Design Spec §5.2·§4.12·§6.2를 한 규칙으로 갱신(design-agent)하고, AC-3-06·07이 4폭 × 2화면으로 강제 |
| S3-R2 | **Home IA 미확정**(M-30) — Figma `26:21` 에 카드가 없고 카드 변형 4종의 구성이 서로 다르다. 임의 조합하면 디자이너 확정 후 전면 재작업 | 재작업 | §16 D-6을 **design 단계 진입 전 결정**으로 분류. 결정 전에는 Home Design Spec을 쓰지 않는다. 카드 컴포넌트는 `density`·`face` props로 변형을 흡수해 재작업 비용을 낮춘다 |
| S3-R3 | **Prompt 노출 시점**(M-09) — Figma 모든 카드 변형이 선택 **전** Prompt를 노출하는데 PRD는 선택 **후** "다음 카드"다. 잘못 고르면 contract(`options[].promptPreview`)와 화면이 함께 바뀐다 | contract + 화면 재작업 | §16 D-4에서 PRD 우선 권장안 + Figma 채택 시의 contract 변경안을 함께 제시. 어느 쪽이든 `ActivityCardSelection.promptSet` 은 유지되므로 변경 범위가 옵션 필드 1개로 제한된다 |
| S3-R4 | **판정 언어 유입** — 추천 이유·역량 배지·서재 캡션에 "strong / emerging / 부족" 류 표현이 섞이면 PRD §8.4 위반 (Figma에 실제 사례 존재: `163:2611–2629`, "Confidence") | 제품 원칙 위반 | 문구는 **API 응답 값만** 표시(AC-3-13)하고 copy 모듈에 금칙어 grep 테스트(AC-3-72)를 둔다. Figma 캡션 "Confidence"는 #14 라벨로 교체(M-13 해소) |
| S3-R5 | **가값 P-02 대량 실사용** — CapabilityBadge 흰 글자 1.56~1.86:1, ProgressBar 1.73~1.94:1이 덱·서재 전면에 노출된다 | 접근성 미달 누적 | stage-1-approvals §9.0 원칙 유지(Figma 값 + `provisional`). Stage 3 QA 후 P-02를 **실제 화면 스크린샷과 함께** 재제시(§17.3). 배지 라벨은 아이콘·텍스트 병행으로 색 의존을 낮춘다 |
| S3-R6 | **에셋 파이프라인이 처음 돌아간다** — `sharp` 미설치, 원본 해상도·비율 불일치(Stage 2 `QA-2-004` 전례) | 일정·시각 QA | §16 D-13을 구현 착수 전 결정으로 분류. 원본 노드·크기·비율을 **design-agent가 먼저 실측**해 §15.8에 보고하고, `BookCover` 는 비율 고정(aspect-ratio) + `object-fit` 으로 원본 편차를 흡수 |
| S3-R7 | Stage 4 경계 침범 — "Start Session" CTA를 동작시키려고 `POST /v1/sessions`·세션 화면을 선행 구현 | **QA FAIL**(Out of Scope 구현) | §16 D-3에서 CTA 처리 방식을 확정하고 AC-3-15가 `POST /v1/sessions` 호출 0건을 요청 로그로 강제 |
| S3-R8 | Stage 2-B(프로필 결과·발전 역량)가 Stage 3에 섞여 들어감 — 서재·홈에서 역량을 다루므로 `CapabilityDiamondChart` 를 만들고 싶어진다 | 범위 위반 | AC-3-02가 `CapabilityDiamondChart`·`PersonaCard` 부재를 명시 검사. Stage 3의 역량 표현은 **`CapabilityBadge` 뿐**이다 |
| S3-R9 | 캐러셀·덱·시트가 제스처 전용이 되어 WCAG 2.5.1 위반 + 키보드 사용자가 대안 카드에 도달 불가 | 접근성 FAIL | `SwipeDeck`(Stage 2)의 버튼·키보드 1급 경로 규약을 `Carousel` 에도 동일 적용. AC-3-18·69로 강제 |
| S3-R10 | 오프라인 캐시에 민감 데이터가 섞여 로컬에 남음 | 프라이버시 | 캐시 대상을 **Activity Card 1건**으로 좁히고(§5.3), 저장소 전수 검사 테스트(AC-3-48)를 CI에 고정. 로그아웃 정리는 `session-cleanup.ts` 한 곳 |
| S3-R11 | **탭바 마운트로 기존 Playwright baseline 다수 무효화** (Stage 1·2의 `/` 관련 baseline 42건 중 일부) | QA 노이즈 | 재생성 대상 목록을 Design Spec·handoff에 사전 기록하고, 영역 클립 baseline은 탭바 영역을 포함하지 않도록 clip을 좁힌다 |
| S3-R12 | push 권한 UX를 Web Notification API로 구현했는데 Stage 4 네이티브(Capacitor) 전환 시 재작업 | 재작업 | `shared/platform/pushPermission.ts` **interface + Web 구현 + Mock** 구조로 두고(§16 D-16), Stage 4는 Native 구현만 추가한다 (RecorderAdapter와 동일 패턴) |
| S3-R13 | 서재 G-04 요소(My Saved·평점·읽기 계획)가 Figma에 크게 보이므로 "있어 보여서" 구현됨 | 범위·contract 오염 | §16 D-7에서 명시적으로 기각하고 AC-3-02 Out of Scope 검사에 포함 |

---

## 14. Open Decisions

> ⭐ **Rev 4 추가 (2026-10-05)**: Home 재대조로 생긴 승인 필요 항목 10건은 **§20.10**, 모순·보고 항목 7건은 **§20.9** 에 있다. 아래 표는 Rev 3 기준이다.

| ID | 항목 | 라벨 | 처리 |
|---|---|---|---|
| §16 D-1 ~ D-22 | Stage 3 세부 확정 항목 | **CONFIRMED — 22건 전건 승인** (2026-09-29 §3 / 10-01 §7·§7.1 / 10-02 §8 / **10-03 §9**) | 권장안 채택 15건 · 권장안 기각 4건(**D-4 · D-5 · D-8 · D-17**) · 범위 축소 1건(**D-18**) · 모순 해소 2건(**D-21** 상한 해제 · **D-22** `targetCapability` 삭제). 구현 지시는 §16 `결정` 열 |
| §15.1 C-13 화면 8건 | Figma 누락 화면의 디자인 소스 | **CONFIRMED — 8건 전부 design-agent 명세** (2026-09-29, approvals §4) | Stage 3 명세 대상 **7건**. `C13-19` 는 **D-18 로 이월 + 디자이너 Figma 요청** |
| M-09 · M-14 · M-29 · M-30 · M-31 · M-32 잔여 | PRD ↔ Figma 불일치 (Stage 3 범위) | **CONFIRMED — 전건 결정 완료** | §16 D-4 · D-7 · D-8 · D-6 · D-5 · D-9 (approvals §3 · §7 · §8). 어긋난 PRD 항목은 **PRD 수정 대상** (approvals §5 · §6.2 · §9.3 — §18 ⑨) |
| OAQ-15 | Activity Card 07:00 갱신 시간대 기준 | **CONFIRMED** (2026-10-02, approvals §8 D-10) | 서버가 `caregiver_profiles.timezone` 으로 `card_date` 를 정하고 Frontend 는 `ActivityCard.date` 를 그대로 신뢰한다 (AC-3-11) |
| P-01 · P-02 · P-04 · P-05 · P-16 · P-17 · **P-23** | 가값 — Stage 3가 **P-02의 대량 실사용처**. **P-23 = Prompt 배지 흰 라벨 1.72:1** 신설 (2026-10-03, §9.2 ⑫ — P-02 에 흡수하지 않는다) | 가값 (stage-1-approvals §9.4-3) | Stage 3 QA 후 항목별 재제시 (§17.3). **`Chip` 미선택 경계(P-02) 증빙은 Stage 2 온보딩 화면을 쓴다** (§9.2) |
| D-01 · S1-G-2 | Accent 버튼 대비 · TextField 행 높이 | 사용자 수용 예외 (CONFIRMED) | `PASS (accepted: …)` 유지 |
| 증정 배송지 저장 위치 | 아동 데이터와 결합되는 성인 PII | **NEEDS DECISION (운영·법무)** | Frontend는 수집하지 않음(§16 D-15). Handoff P3-BIP-06 |
| push provider 선정 (OneSignal / FCM / APNs) | payload PII 최소화 포함 | **NEEDS DECISION (Backend Developer)** | Stage 3는 SDK 미도입(§16 D-16). Handoff P3-BIP-08 |
| L-01 · L-02 · L-03 · L-07 | VPC 방식 · 약관 본문 · 철회 미제공 · 성 수집 | NEEDS DECISION (법무) | Stage 3 무관 또는 출시 전 차단 항목 |
| M-10 · M-11 · M-12 · M-25 · M-26 | 주간 리포트 IA · 이메일 발송 · 성장 표현 언어 · 세션 버블 · 세션 컨트롤 | NEEDS DECISION | **Stage 3와 무관** — Stage 4·7에서 결정. 단 M-12(언어)는 AC-3-72로 Stage 3 문구에 선제 적용 |
| OAQ-10 · OAQ-11 · OAQ-13 · OAQ-14 · OAQ-16 · OAQ-17 · OAQ-19 | 아키텍처 미결 | NEEDS DECISION | Stage 4~8 / 비차단 |

---

## 15. Handoff to design-agent

> ⭐ **Rev 4 추가 (2026-10-05)**: Home Figma 재대조로 생긴 design-agent 인계 항목 7건은 **§20.8** 에 있다 (`★ Save` 버튼 명세 · 가로 트랙 컴포넌트 선택 · 카드 뒷면 · `conversation_only` ActionBar · Library 3화면의 `★ Save` · Figma raw 값 흡수 정책 · **Library 전수 Figma 재대조**). 아래 §15.1~§15.8 은 Rev 3 기준이며 Home 관련 항목은 §20 이 우선한다.

design-agent는 `docs/design/stage-3-design-spec.md` 를 작성한다. **Figma는 수정하지 않는다.**
**Stage 2-B(`C13-09`·`C13-10`) 디자이너 요청서는 이미 전달되어 있다** (`docs/design/stage-2-designer-request.md`). Stage 3 Design Spec은 그 두 화면을 다루지 않는다.

### 15.1 C-13 — Figma 누락 화면 8건 — **처리 방식 결정 완료 (2026-09-29, `stage-3-approvals.md` §4)**

> **갱신 2026-10-03.** C-13 절차(화면별 ① 디자이너 Figma 요청 / ② design-agent 명세 선택)는 **8건 전부 ② design-agent 명세 작성으로 결정**되었다 (`stage-3-approvals.md` §4). 단 **`C13-19`(알림 설정 화면)는 `D-18` 로 Stage 3 에서 이월**되어 디자이너 Figma 요청 대상이 되었다 (§8.4). 따라서 **Stage 3 design-agent 명세 대상은 7건**(`C13-14` ~ `C13-18`, `C13-20`, `C13-21`)이며, 아래 표의 "사용자 선택 필요" 서술은 **해소**되었다.

| # | 화면 / 상태 | Route | PRD | 기존 컴포넌트로 조합 가능? |
|---|---|---|---|---|
| **C13-14** | **Home 본문 IA** — Activity Card 덱의 실제 배치, 캐릭터·버블·streak·이번 주 세션 수·하이라이트 한 줄의 위치 관계 (M-30) | `/` | FR-07, §7.4 | **부분** — `26:21` 에 **카드가 배치되어 있지 않다**. 헤더·캐릭터·버블·dots만 있고 카드 변형 4종(`163:2648`·`86:438`·`86:512/545`·`86:482`)은 loose 노드다. **§16 D-6 과 한 세트** |
| **C13-15** | **Reading Context 선택 시트** — 6값 + **직접 시간 선택 picker**(`custom_time`) | `/` 위 Sheet | FR-08, §7.4 | **Figma 누락 → design-agent 명세**(`C13-15`, §4 결정). 결과 chip `86:538` 만 존재하고 **선택 UI·시간 picker 는 Figma 에 없다**. 조합 기반은 Sheet + Chip/RadioGroup. **구현은 Stage 3 In Scope**(AC-3-22 ~ AC-3-26) — picker 규격 근거는 `D-18` 이 아니라 **§9.2 ⑩**(2026-10-03): 30분 단위 목록, 네이티브 `<input type="time">` 금지 |
| **C13-16** | **덱 대체 카드 3종** — `conversation_only`("책 없이 대화만 하기") · `reread_book`(재독 + 새 Prompt) · **책 소진 대체 카드** + 증정 신청 CTA | `/` | §7.4 규칙, §13 | 부분 — `ActivityOptionCard` 변형(표지 대신 일러스트). 카드 종류 식별 표현 누락 |
| **C13-17** | **보유 책 직접 등록** — 카탈로그 검색 + **검색 결과 없음 → 제목·저자 직접 입력** | `/library/add` | FR-23, §8.1 | 부분 (FieldGroup + ListRow 검색 결과). 등록 성공 피드백 누락 |
| **C13-18** | **증정 신청 플로우 + 배송 상태** — 신청 CTA·접수 안내·상태 6종·§13 대기 중 대체 안내 | BookDetailSheet, `/library/gift-requests` | FR-22, §13 | 부분 (ListRow + Tag(status) + InlineAlert) |
| **C13-19** | **알림 설정 + push 권한 사전 안내** — 카드 갱신 시간·리마인더 요일/시간 picker, 권한 사전 안내 → 요청 → 거부 상태 | `/settings/notifications` | FR-08, §7.8 | 부분 (ListGroup + Toggle `17:113`). **시간 picker·요일 선택 누락**. **설정 화면은 `D-18` 로 Stage 3 이월 + 디자이너 Figma 요청 대상**(§8.4). push 권한 사전 안내 UX 는 **Stage 3 유지**(D-16, AC-3-42~45) |
| **C13-20** | **서재 빈 상태** — 보유 0권 · 히스토리 0건 · 증정 신청 0건 | `/library`, `/library/gift-requests` | FR-20 | 부분 (EmptyState #22 명세 조합). 다음 행동 CTA 배치 필요 |
| **C13-21** | **Prompt 공개 화면/상태** — §16 D-4 결정 반영(카드 flip back vs 다음 카드 vs 시트) | `/` 카드 상태 | FR-07, §8.2 | 부분 — flip back `86:482` 가 후보이나 PRD "다음 카드"와 형태가 다름. **§16 D-4 와 한 세트** |

**C-13 예외 (질문 불필요)**: 공통 상태(Loading · Empty · Error+Retry · Offline · Toast · Dialog)는 **#22 · P-10 확정 명세**를 그대로 사용한다. BottomTabBar 자체는 Figma `25:87` 근거가 있으므로 C-13 대상이 아니다(고정 방식은 §16 D-1).

### 15.2 C-13 승인 우선순위 (부분 승인 시 착수 순서)

1차(핵심 경로 차단): **C13-14** Home IA · **C13-21** Prompt 공개 · **C13-15** Context 선택
2차(서재 완주): C13-17 직접 등록 · C13-18 증정 · C13-20 빈 상태
3차(보조): C13-16 대체 카드 (~~C13-19 알림 설정~~ → **D-18 로 Stage 3 제외·디자이너 요청**)

### 15.3 ★ BottomTabBar — 고정 방식·여백 규칙 정합 (§16 D-1 결과 반영)

design-agent가 Design Spec에서 **한 규칙으로** 확정해야 하는 것:

| 항목 | 현재 문서 | 현재 구현 | 확정 필요 |
|---|---|---|---|
| 고정 방식 | Design Spec §2.2 = **`sticky`** (2026-09-27 갱신, line 123) / §5.2·§4.12·§6.2 = **`fixed` 전제 기술** | `position: sticky; inset-block-end: --layout-safe-bottom` (`app-shell.css`) | 문서 3절을 sticky 기준으로 재작성 |
| 콘텐츠 하단 padding | "`--layout-tabbar-height` + `--layout-safe-bottom`" (§5.2 · §8.73) | `TabLayout` 은 하단 padding을 적용하지 않음 | sticky = 흐름 안 → **`--layout-tabbar-height` 불필요**. **중앙 버튼 overhang 35 는 덮으므로 필요** |
| Toast 하단 offset | "`calc(--layout-safe-bottom + --space-4)`, 탭바 있으면 `+ --layout-tabbar-height`" (§4.12) | 탭바 미마운트라 미검증 | sticky + `main flex-1` 이면 탭바가 항상 뷰포트 하단 → 기존 식 유지 가능. **검증 후 확정** |
| 중앙 버튼 overhang | `--layout-tabbar-center-overhang` 35, "콘텐츠 하단 padding = height + overhang + safe-bottom" (§6.2 · §8.1033) | `.haru-app-shell__bar-bottom` 에 `pt-3`(12) | **35 vs 12 불일치 해소** — 래퍼 padding-top이 overhang을 흡수하는지 확인 |

design-agent는 **실제 렌더 측정**(4폭 × 스크롤 상단/하단)으로 위 4행을 확정하고 Design Spec §2.2·§4.12·§5.2·§6.2를 동시에 갱신한다.

### 15.4 Shared UI 3종 + 1종 확장 — 컴포넌트별 variant / state 표

`SectionHeader` · `Carousel` · `Toggle` · `ListRow`(media/meta 확장) 각각에 대해: variant · state(rest/hover/pressed/disabled/**focus**/selected) · 치수(높이·padding·radius·gap) · 사용 토큰 · 접근성 요구(role · 접근성 이름 · 키보드 조작 · 터치 타깃) · Figma node 근거 또는 "Figma 없음 → 명세".

특히 명세가 유일한 기준인 것:
- **`Carousel` 의 버튼·키보드 조작** — `113:1993` 에는 가로 스크롤과 `PageIndicator` 만 있다. 제스처 대체 수단의 위치·표현을 명세해야 한다 (WCAG 2.5.1).
- **`Toggle`** — `17:113` 은 iOS 26 kit이다. COMPONENT_MAP §6 "iOS 모양 복제 vs HARU 스타일" 을 design-agent가 결정해 보고한다.
- **`ListRow` media 변형** — `163:2145` Book List의 썸네일 크기·비율·trailing meta 배치.

### 15.5 Domain 컴포넌트 명세

| 컴포넌트 | 명세 필요 항목 |
|---|---|
| **`ActivityOptionCard`** (통합 후보 I) | `density`(compact `86:512` / full `86:438`) × `face`(front / back `86:482`) × `kind`(book / reread_book / conversation_only) 조합 표. **`163:2648` 의 카드 하단 Prompt ↔ ActionBar overflow 결함을 해소한 레이아웃**. `type=shelf` 는 카드가 아니라 `LibraryShelfSheet` 로 분리 |
| **`BookCover`** | `default` / `selected`(`113:1991` pastel + check) / **`placeholder`**(표지 없음·로드 실패) 3 variant, 고정 aspect-ratio + `object-fit`, `alt` 규칙, 해상도 단계(§16 D-13) |
| **`CapabilityBadge`** | 4역량 × size, **suffix 없음 — 역량 표시 라벨만**(`" Day"` suffix 는 **N-3** 으로 폐기, §6; Figma `163:2648` "Emotion Day Day" 오타 미복제), **흰 글자 대비 = 가값 P-02** 표기, 색 의존을 낮추는 병행 수단 |
| **`PromptPill`** (통합 후보 H) | `outline` / `tinted`, **`phase` 배지 + `pageRef` 표기 = D-8 승인으로 표시 확정**(§8.1) — 둘이 동시에 올 수 있고 **둘 다 렌더**한다(§9.2 ⑪, 허용 차이 `AD-S3-24`), 값 없으면 미렌더. Prompt 배지 흰 라벨 대비 = 가값 **P-23**(§9.2 ⑫), tinted 배경 라벨 대비 = 가값 P-11. **arrow 계열은 pill이 아니라 캐러셀 컨트롤** → Stage 4 `PromptCarousel` 로 분리 |
| **`CoachingNote`** | `86:527`("Remember tonight", pink tint) · `86:482` 설명 블록(beige) 2 tone |
| **`BookShelfItem`** / **`BookListRow`** | `113:1993`(Default/Selected + "▶ Session" Tag) · `163:2145` 행. 캡션 "Confidence" → **#14 표시 라벨로 교체**(M-13). 평점·"Reading now" 는 §16 D-7 기각 대상이므로 **명세하지 않는다** |
| **`WeekSummaryChip`** (옛 `StreakChip`, 통합 후보 J) | `26:40`(clock + "12-day/115 Min") vs `30:91`(star + "12-day streak") 통합안. **D-6 확정(2026-09-29, §3)에 따라 연속 일수·누적 분을 모두 쓰지 않고 "이번 주" 지표만 표시**한다. 개명 근거 = `stage-3-approvals.md` §8.5 ④ (`COMPONENT_MAP.md` §2 반영은 design-agent 소관) |
| **`ReadingContextChip`** | `86:538` "Bedtime · 9:00 PM" — 표시 전용, 선택 UI는 feature |
| **`GiftStatusTag`** | 상태 6종(`requested`~`rejected`)의 tone 매핑. status 색 = 가값 P-04 |
| **`ActiveSessionNotice`** | Figma 없음 — 진행 중 세션 안내(표시만, Stage 4 진입 전). InlineAlert 조합 가능 여부 판단 |

### 15.6 화면별 상태 매트릭스

각 Stage 3 화면에 대해 Loading / Empty / Error+Retry / **Offline(+캐시 카드)** / **Permission Denied(push)** / **Pending(증정 대기)** / **Duplicate(증정 중복)** / **Placeholder(표지 없음)** 중 해당 상태를 #22 · P-10 확정 명세 위에서 배치한다.

### 15.7 접근성 · 반응형

- 덱·캐러셀의 **제스처 대체 수단** 위치와 접근성 이름, 카드 전환 시 `aria-live` 문구 형식.
- 탭바 활성 상태의 **비색상 구분 수단**(WCAG 1.4.1).
- 표지 이미지 `alt` 문장 형식(제목 + 저자, 장식 아님).
- 서재 필터·증정 상태의 스크린리더 읽기 순서.
- 320 / 393 / 600 / 1024px 에서 덱 카드 폭, 캐러셀 아이템 폭·snap, 시트 최대 높이, 탭바 중앙 버튼 위치.
- 200% 텍스트에서 카드 내부 텍스트(추천 이유 2문장 + 코칭 문장)의 reflow·잘림 방지.

### 15.8 design-agent가 판단해 보고할 것

1. **★ 탭바 4행 실측 확정** (§15.3) — Design Spec §2.2·§4.12·§5.2·§6.2 갱신안.
2. **★ Home IA 제안** (M-30 / §16 D-6) — `26:21` + 카드 변형 4종을 어떻게 한 화면으로 조립할지, 그리고 그중 무엇이 Figma 근거이고 무엇이 명세인지 구분.
3. **★ 책 표지·캐릭터 원본 노드 실측** (§16 D-13) — 노드 id · 픽셀 크기 · 비율 · 필요한 해상도 단계. Stage 2 `QA-2-004`(비율 불일치) 재발 방지.
4. **Prompt 노출 시점**(§16 D-4)에 대한 design-agent 의견 — `86:482` flip back을 PRD "다음 카드"로 볼 수 있는지.
5. **덱 카드별 역량**(§16 D-5) — `163:2648` 3장의 서로 다른 배지가 디자인 의도인지 placeholder인지 판단.
6. **`SwipeDeck` 재사용 적합성** — Home 덱이 "스택"인지 "가로 페이징"인지. 스택이면 `SwipeDeck`(depth 3) 재사용, 페이징이면 `Carousel` 확장이 맞다 (§16 D-14).
7. **`Toggle` 스타일 결정** (iOS kit 복제 vs HARU 토큰, COMPONENT_MAP §6).
8. **탭바 마운트로 재생성이 필요한 기존 baseline 목록**(Stage 1·2 42건 중).
9. Figma 디자이너 수정 요청 목록 (§18 ⑥) 과 Stage 3 신규 가값 후보(`P-18…`).
10. **`S2-ONB-2` Q5 표지 그리드**(§16 D-12)에 대한 의견 — 온보딩 Step 3로 되돌릴 경우의 화면 변경 범위.

---

## 16. Stage 3에서 확정해야 할 세부 결정 — **D-1 ~ D-22 전건 승인 완료**

> 근거: `PLANNING §5 Stage 3` "Blocking decisions: M-09/M-14/M-29/M-30/M-31, M-32 잔여", `API_CONTRACTS §6` G-01~G-07, `ARCHITECTURE §16` OAQ-15, `docs/decisions/stage-2-approvals.md` §9.3(Stage 3 배정 2건), COMPONENT_MAP §1·§2·§6.
> **갱신 2026-10-02 — D-1 ~ D-20 20건 모두 사용자 승인으로 확정되었다.** 정본은 `docs/decisions/stage-3-approvals.md` 다 (D-1·D-4·D-5·D-6 = §3, 2026-09-29 / D-2·D-3·D-7·D-13 = §7·§7.1, 2026-10-01 / D-8 ~ D-20 = §8·§8.1~§8.6, 2026-10-02). 이 표와 결정 기록이 다르면 **결정 기록이 우선한다.**
>
> `권장안` 열은 **승인 당시 plan-agent 가 올린 안을 원문 그대로 보존**한 것이다 — 결정 추적용이며 구현 지시가 아니다. **`결정` 열이 구현 지시다.** 권장안이 뒤집힌 항목은 `권장안 기각` 으로 표시했다 (**D-4 · D-5 · D-8 · D-17**, D-18 은 범위 축소). **★ = 착수 전 필수 결정이었던 항목.**

| ID | 결정 항목 | 권장안 (승인 전 제안 — 원문 보존) | 근거 | 대안 (기각 사유) | **결정 (승인 결과)** |
|---|---|---|---|---|---|
| **D-1** ★ | **BottomTabBar 고정 방식 확정과 여백 규칙 정합** (`S1-E-3`, Design Spec §2.2 = sticky ↔ §5.2·§4.12·§6.2 = fixed 전제) | **`sticky` 를 정본으로 확정**한다. 그리고 파생 규칙을 다음으로 고정한다. ① 콘텐츠 하단 padding에서 **`--layout-tabbar-height` 를 빼고**, **`--layout-tabbar-center-overhang`(35) + `--layout-safe-bottom`** 만 적용한다 ② **Toast 하단 offset은 기존 식 유지**(`safe-bottom + space-4 + tabbar-height`) — `main flex-1` 때문에 탭바가 항상 뷰포트 하단에 오므로 `fixed` 와 결과가 같다 ③ `.haru-app-shell__bar-bottom` 의 `pt-3` 가 overhang을 흡수하는지 **실측 후** 12 ↔ 35 중 하나로 통일한다(design-agent §15.3) ④ Design Spec §2.2·§4.12·§5.2·§6.2를 같은 패스에서 갱신한다 | ① 구현이 이미 `sticky` 이고 그 선택에는 문서화된 근거가 있다 — `fixed` 로 되돌리면 컬럼 폭·gutter·safe-area 정렬을 레이아웃에서 재계산해야 하고, flex 행으로 되돌리면 `AppColumn` 3중 safe-area(iPhone 기준 59px 빈 공간)가 생긴다 (stage-1-handoff §18.2 3안 비교) ② `sticky` 는 흐름 안에 있어 스크롤 끝에서 마지막 콘텐츠를 영구히 가리지 않는다 — `fixed` 전제의 `--layout-tabbar-height` padding을 그대로 두면 **하단에 70px 빈 공간이 생긴다** ③ 반면 중앙 버튼은 바 위로 35px 나오므로 overhang만큼은 여전히 필요하다 ④ `packages/ui`·`AppColumn` API 변경 0 | ① `fixed` 로 전환 (기각 — 컬럼 폭·gutter·safe-area 재계산, `AppColumn` props 변경 필요, 이미 검증된 sticky 구현 폐기) ② flex 행 복귀 (기각 — safe-area 3중 적용 결함, stage-1-handoff §18.2에서 이미 기각) ③ 문서만 sticky로 바꾸고 여백 규칙은 그대로 (기각 — 70px 빈 공간이 남고 AC-3-06이 FAIL) ④ 결정 보류 (기각 — 탭바가 **이번 Stage에 처음 마운트**되므로 지금 정하지 않으면 모든 Stage 3 화면의 하단 여백과 baseline이 임시값 위에 쌓인다) | **승인 — 권장안 채택** (2026-09-29, `stage-3-approvals.md` §3). `sticky` 를 정본으로 확정하고 파생 규칙 ①~④ 를 동시 고정. 조건 추가: ② Toast 하단 offset 은 기존 식을 유지하되 **실측 검증**(AC-3-07)을 거친다 |
| **D-2** ★ | **`/progress` 탭의 Stage 3 목적지** (탭바는 Stage 3에 마운트되는데 리포트 화면은 Stage 7) | **`/progress` route를 만들고 "아직 준비 중" 성격의 EmptyState 화면을 둔다.** 문구는 리포트 발행 기준(#17: 녹음 세션 3회 + 누적 1시간)을 **설명하는 안내**로 쓰고, 진행도 수치·차트·`ReportOverview` 호출은 **넣지 않는다**(contract 0건). Stage 7이 이 페이지를 실제 리포트 화면으로 대체한다 | ① 탭이 3개 고정(#15)이라 항목을 뺄 수 없다 ② 탭을 눌렀는데 아무 일도 없거나 404가 뜨면 내비게이션 자체가 결함으로 보인다 ③ EmptyState는 Stage 1에 이미 있고 #22 확정 명세라 신규 디자인이 필요 없다 ④ contract 호출 0건이면 Stage 7 선행 구현이 아니다(Stage 2 Home skeleton과 같은 패턴, #33) | ① 탭 비활성화(disabled) (기각 — 3탭 중 하나가 늘 비활성이면 탭바 자체가 미완성으로 보이고, disabled 탭의 접근성 처리 근거가 없다) ② Stage 7 화면 선행 구현 (기각 — Out of Scope, M-10 미결이라 IA도 정해지지 않았다) ③ `/progress` 를 만들지 않고 탭 2개로 (기각 — #15·D-02 확정 구성 변경) ④ Home으로 리다이렉트 (기각 — 탭을 눌렀는데 다른 탭이 활성화되는 혼란) | **승인 — 권장안 채택** (2026-10-01, §7). 조건 추가: 안내에 **수치를 전혀 넣지 않는다** — "3회 중 1회" 같은 달성률 언어 금지 (`rules/frontend.md` §8) |
| **D-3** ★ | **"Start Session" CTA의 Stage 3 동작** (Figma `163:2648`·`145:1132`·`163:1669` ActionBar의 주 버튼. `POST /v1/sessions` 와 세션 화면은 Stage 4) | **CTA를 렌더하되 Stage 3에서는 `disabled` 로 둔다.** ① 문구·위치·크기는 Figma 그대로 ② `aria-disabled` + 접근 가능한 설명을 **copy 모듈의 슬롯**으로 두고, 슬롯이 비면 설명 없이 disabled만 적용한다(문구를 지어내지 않는다 — `S2-COPY-1` 선례) ③ `POST /v1/sessions` 호출 0건을 AC-3-15가 강제 ④ Stage 4는 **handler만 연결**하고 레이아웃을 건드리지 않는다 | ① 카드·시트 레이아웃의 ActionBar는 Figma 근거가 있는 구조다. 버튼을 빼면 카드 높이·정렬이 달라져 Stage 4에서 레이아웃과 baseline을 다시 만들어야 한다 ② `POST /v1/sessions` 를 Stage 3에 넣으면 세션 상태 머신·전이 표·`SESSION_ALREADY_ACTIVE` 처리까지 딸려 와 **Out of Scope 구현(QA FAIL)** 이 된다 ③ 없는 문구를 만들어 넣지 않는 것은 `S2-COPY-1`에서 사용자가 이미 채택한 원칙이다 | ① CTA 생략 (기각 — ActionBar 레이아웃·baseline을 Stage 4에서 재작업) ② `POST /v1/sessions` 최소 구현 (기각 — Stage 4 contract·상태 머신 선행 구현, QA FAIL) ③ "Stage 4 예정" 류 안내 문구 (기각 — 사용자 노출 문구에 개발 단계를 드러낸다) ④ 클릭 시 Toast (기각 — 지어낸 문구 필요, 오탭을 오류처럼 보이게 함) | **승인 — 권장안 채택 + 보완** (2026-10-01, §7). `disabled` 속성만 쓰면 스크린리더가 건너뛰어 사유를 읽지 못하므로 **`aria-disabled` + 포커스 가능**으로 한다 (동의 화면·온보딩 CTA 와 같은 패턴) |
| **D-4** ★ | **Prompt 노출 시점** (M-09 / G-07 — PRD §7.4·FR-07 = 책 선택 **후** "다음 카드", Figma 모든 카드 변형 = 선택 **전** 노출) | **PRD를 따른다** — 선택 전 카드에는 Prompt를 노출하지 않고, `POST …/selection` 응답의 `promptSet` 을 **선택 직후 화면**(카드 뒷면 `86:482` 또는 후속 카드, 형태는 design-agent §15.8-4)에 표시한다. `ActivityCardOption` 에 **`promptPreview` 를 추가하지 않는다**. 단 Figma `86:512/545`(compact, Prompt 2개)와의 차이를 **허용 차이로 사전 기록**한다 | ① PRD FR-07이 "책 선택 후 대화 Prompt 2~3개 카드 제시"로 명시하고 §7.4가 "세션 중 자동 제시는 없으므로 **세션 전에 확인하는 것이 기본 흐름**"으로 흐름을 설명한다 — Functional Source of Truth가 명확하다 ② Figma 카드 변형들은 Prompt 개수가 2·4·5개로 제각각이고(`86:512`=2, `163:2648`=4, `86:438`=5) 어느 것도 PRD의 "2~3개"와 맞지 않는다 — 확정 디자인이라기보다 탐색 변형이다 ③ 선택 전에 3장 × Prompt까지 내려주면 응답이 커져 **Activity Card 2초 NFR**에 불리하다 ④ contract 변경이 0이라 Stage 4 Prompt Drawer와도 충돌하지 않는다 | ① Figma 채택 — `options[].promptPreview` 추가 (기각 — PRD와 정면 충돌, 응답 크기 증가, Prompt 개수 기준이 Figma 내부에서도 불일치) ② 양쪽 다 — preview 1개 + 선택 후 전체 (기각 — PRD에 근거 없는 절충, "미리보기 1개"의 개수 기준이 없다) ③ 결정 보류 (기각 — 카드 앞면 구성이 정해지지 않으면 Home Design Spec을 쓸 수 없다) | **권장안 기각 — 사용자 결정은 "Figma 따름: Prompt 를 선택 *전* 카드에 노출"** (2026-09-29, §3). 권장안은 PRD(선택 후 제시)를 따르자는 것이었으나 §2 PRD↔Figma 우선순위 원칙을 적용해 뒤집혔다. → `ActivityCardOption.promptPreview` 를 **추가한다**. PRD FR-07·§7.4 는 **PRD 수정 대상** §5-1. 표시 개수는 별도 결정 **N-2**(§6.1)로 확정 — 접힌 상태 3개 + 스크롤/확장, contract 는 길이를 3으로 제한하지 않는다 |
| **D-5** ★ | **덱 카드별 역량** (M-31 / G-05 — PRD §7.4 "오늘의 역량 배지"(하루 1개) · §8.3 역량 순환 ↔ Figma `163:2648` 3장이 각각 다른 역량) | **PRD를 따른다** — `ActivityCard.targetCapability` **카드(하루) 단위 1개**를 유지하고 `options[].capability` 를 추가하지 않는다. 배지는 **덱 상단(카드 바깥)에 1개** 표시하고, 옵션 카드에는 배지를 반복하지 않는다. Figma 3장 3배지와의 차이를 허용 차이로 기록한다 | ① PRD §7.4가 "오늘의 역량 배지 — 4대 역량 순환 스케줄상 **오늘의** 목표 역량"으로 하루 1개임을 명시한다 ② §8.3 "제시 역량을 주 2회 배치하고 나머지를 순차 배치"는 **날짜 단위 스케줄**이다 — 옵션마다 역량이 다르면 순환 스케줄이 성립하지 않는다 ③ Figma `163:2648` 의 배지 중 하나는 **"Emotion Day Day" 오타**(M-13)라 확정 디자인으로 보기 어렵다 ④ 배지를 덱 밖에 1개 두면 "오늘은 자기주도 데이!"라는 PRD 예시 표현과 정확히 맞는다 | ① Figma 채택 — `options[].capability` 추가 (기각 — §8.3 순환 스케줄 규칙 자체를 바꿔야 하고 추천 엔진 요구가 커진다) ② 카드 단위 1개 + 옵션마다 같은 배지 반복 (기각 — 같은 정보를 3번 반복해 시각 노이즈, 화면 폭 낭비) ③ 결정 보류 (기각 — 배지 개수·위치가 카드 레이아웃을 결정한다) | **권장안 기각 — 사용자 결정은 "Figma 따름: 덱 카드마다 다른 역량"** (2026-09-29, §3). 권장안은 PRD(카드 단위 1개)를 따르자는 것이었으나 §2 원칙으로 뒤집혔다. → `options[].capability` 를 **추가한다**. PRD §7.4·§8.3 은 **PRD 수정 대상** §5-2 이며 §8.3 역량 순환 규칙은 **추천 엔진 Backend 요구**(P3-BIP-02)에 반영. 배지는 역량 라벨만 표시하고 `" Day"` suffix 는 폐기(**N-3**, §6), Figma `163:2648` 의 "Emotion Day Day"(M-13)는 오타이므로 옮기지 않는다. **후속 — `D-22`(2026-10-03, §9): 카드 단위 `ActivityCard.targetCapability` 는 사용처가 없어져 삭제한다** |
| **D-6** ★ | **Home IA 확정** (M-30 / G-02 — `26:21` 에 카드 미배치, 누적 분 "115 Min" 의 근거 없음) | **PRD §7.4 구성 요소를 기준으로 IA를 확정한다**: 상단 헤더(워드마크 + **StreakChip** + 설정) → 캐릭터 + 버블 → **오늘의 역량 배지 1개** → **Activity Card 덱 3장 + PageIndicator** → 보조 정보(이번 주 세션 수 · 지난 세션 하이라이트 한 줄). **누적 읽기 분("115 Min")은 표시하지 않는다** — `HomeSummary` 에 `totalMinutes` 를 추가하지 않는다. 구체 배치·간격은 design-agent가 §15.8-2로 제안한다 | ① PRD §7.4 "구성 요소"와 "보조 요소"가 화면에 무엇이 있어야 하는지 명시한다 — Figma에 프레임이 없다고 요구사항이 없는 것이 아니다 ② `26:40`/`26:43` 의 "115 Min"은 **PRD 보조 요소 목록(streak · 이번 주 세션 수 · 하이라이트 한 줄)에 없다**(G-02). 집계 기간(누적/이번 주/streak 기간)도 정의되지 않아 계약을 정할 수 없다 ③ 추가하면 서버가 집계 규칙을 새로 정의해야 하고, 시간 합계는 §8.4 "달성률·성과 비교" 언어로 미끄러지기 쉽다 ④ 필요해지면 `HomeSummary` 에 필드 1개를 더하는 비파괴 확장이다 | ① Figma 채택 — `HomeSummary.totalMinutes` 추가 (기각 — PRD 근거 없음, 집계 기간 미정의, 판정·성과 언어 위험) ② 덱을 Home이 아닌 별도 route로 (기각 — PRD §7.4가 홈 화면이라고 명시, #33도 Home 콘텐츠로 확정) ③ design-agent에게 전권 위임 (기각 — IA는 요구사항 범위 결정이라 plan 소관. 배치·간격만 design-agent) | **승인 — Home 집계는 "이번 주" 기준으로 확정** (2026-09-29, §3). Figma 의 "12-day" 연속 일수는 채택하지 않고 `/progress` 와 같은 "이번 주" 창을 쓴다. 누적 분 미표시는 권장안대로 유지. **귀결** (2026-10-02, §8.5 ④): `StreakChip` → **`WeekSummaryChip`** 개명 + `HomeSummary.streakDays` **삭제** (연속 일수는 달성률 언어). 표시 항목은 design-agent §15.8-2 제안으로 확정 |
| ⛔ **D-7** ★ **부분 무효 (Rev 4 §20.1)** | **서재 개념 범위** (M-14 / G-04 — Figma "My Saved" · "Rated 4.5" · "Reading now · 3 of 5 nights" · "Last read Tue · 12 min") | **전부 Stage 3 범위에서 제외한다.** 서재는 PRD FR-20의 4가지 — 증정·보유 라이브러리 / 보유 책 직접 등록 / 읽은 책 히스토리 / 책별 Prompt 보기 — 만 구현한다. `LibraryBook` 에 `saved`·`averageRating`·reading plan 필드를 넣지 않고 `ReadingNowCard` 를 만들지 않는다. Figma 차이는 **허용 차이로 사전 기록**한다 | ① PRD FR-20·§8.1 어디에도 북마크·평점·다회차 읽기 계획이 없다 — rules "PRD/Figma에 없는 요구사항을 임의로 추가하지 않는다" ② 책 평점은 PRD가 **세션 회고 별점(FR-12)** 으로만 정의한다. 책 단위 평점을 만들면 집계 주체·표시 기준을 새로 정해야 하고 §8.4 비교 언어 위험이 있다 ③ reading plan("3 of 5 nights")은 목표 설정·진행도 모델이 필요해 **새 도메인**이 생긴다 ④ 셋 다 나중에 필드·테이블 추가로 비파괴 확장이 가능하다 | ① 전부 채택 (기각 — PRD 근거 없는 3개 도메인 신설, Stage 3 범위 2배) ② "My Saved" 만 채택 (기각 — 북마크 하나만으로도 `child_books` 에 컬럼 + endpoint 2개 + 서재 필터 1개가 늘고, "보유"와 "저장"의 차이를 사용자에게 설명해야 한다) ③ 결정 보류하고 화면만 먼저 (기각 — 화면에 자리를 비워두면 레이아웃이 확정되지 않는다) | **승인 — 권장안 채택** (2026-10-01, §7). FR-20·FR-22 의 4기능만 구현한다. 평점 · "Reading now" · "My Saved" 는 **구현하지 않고 허용 차이로 기록** — 평점은 저장 위치·집계 규칙이 없고 HARU 의 비판정 톤과도 거리가 있다. ⛔ **부분 무효 (2026-10-05, approvals §12.2 · §12.8 `A-9` · §12.9)**: **`★ Save` 제외 부분만 무효**다 — Figma `I86:438;86:383;117:973` 에 `Button/White 87×45 ★ Save` 가 **실재**하고(최우선 규칙 3: 있는 것을 빼지 않는다), 명세가 그 자리에 Figma 에 **없는** `Pick a time` 을 넣어 최우선 규칙 **2·3 을 동시에 위반**했다. 사용자 결정 = *"현재 카드를 Library 의 favorites 에 저장한다"*. → `LibraryBook.saved` + `PUT/DELETE …/saved-books` 를 **추가**한다 (§20.3, `API_CONTRACTS.md` §3.7). **평점(`averageRating`)·reading plan(`ReadingNowCard`) 제외는 그대로 유효**하다. 기각 사유였던 "북마크 하나로 컬럼+endpoint 2개+필터 1개가 늘고 보유↔저장 차이를 설명해야 한다"는 **비용 판단이었고, 최우선 규칙이 그 판단에 우선한다** |
| **D-8** | **Prompt 단계·페이지 태그** (M-29 / G-03 — Figma PRE / POST / P.6) | **Stage 3에는 넣지 않는다** — `Prompt` 는 `kind`(question / follow_up) 만 유지하고 `phase`·`pageRef` 를 추가하지 않는다. `PromptPill` 의 `phaseTag` prop은 **정의하되 Stage 3에서는 사용하지 않는다**(Figma 근거가 있어 컴포넌트 API는 열어둔다). 채택 결정이 나면 contracts 필드 + 콘텐츠 제작 범위를 함께 정한다 | ① PRD §8.2는 Prompt를 "질문 + 부모용 코칭 문장 + Follow-up"으로 정의하고 **읽기 전/후·페이지 번호 개념이 없다** ② `pageRef`("P.6")는 **책 판본마다 페이지가 달라** 콘텐츠 제작·검수 비용이 급증한다(책별 최소 6개 × 판본) ③ `phase` 채택은 Prompt 라이브러리 스키마·전문가 감수 범위를 바꾸는 **콘텐츠 운영 결정**이라 Frontend가 먼저 정할 수 없다 ④ 컴포넌트 prop만 열어두면 채택 시 UI 재작업이 없다 | ① `phase` 만 채택 (기각 — 콘텐츠 제작 범위 결정이 선행되어야 하고, 지금 넣으면 Mock fixture가 근거 없는 값을 갖는다) ② `phase` + `pageRef` 채택 (기각 — 판본 의존, 운영 비용) ③ `phaseTag` prop도 만들지 않음 (기각 — Figma `139:2410–2412` 근거가 있어 채택 시 컴포넌트를 다시 열어야 한다) | **권장안 기각 — 사용자 결정은 "Figma 기준으로 실제 구현한다"** (2026-10-02, §8 · §8.1). 사용자 지시: "피그마를 기준으로 반영해줘. 이번 Stage가 아니면 다음 Stage에라도 반영하여 최종적으로 보이게 되어야 돼" → 권장안(prop 만 열어두기)과 design-agent 반대 의견을 **모두 기각**. 기각 사유: Figma 에 `PRE`/`POST` 배지와 `P.6` 페이지 참조가 실재하므로 §2 원칙상 Figma 가 우선하고, "값을 안 쓰는 dead prop" 으로는 최종 화면에 보이지 않는다. **Stage 3 구현 범위**: ① contracts `Prompt` 에 optional `phase: 'pre' \| 'post' \| null` · `pageRef: string \| null` **추가** (전환기에 값 없는 Prompt 가 섞여도 깨지지 않게 optional, 화면은 응답 값만 표시 — 생성·가공 금지) ② `PromptPill` 은 값이 있을 때 배지를 렌더하고 없으면 렌더하지 않는다 ③ Mock fixture 가 두 값을 **결정적으로** 채워 화면에 보이게 한다 ④ 라벨 문구는 copy 모듈. **Backend**: `phase` 판정 로직 = **P3-BIP-13**, `pageRef` 책별 페이지 앵커 데이터(콘텐츠 제작 범위 포함) = **P3-BIP-14** |
| **D-9** | **Reading Context 없이 진행 허용 여부** (M-32 잔여 — 서재 `145:1132`·`163:1669` 에서 Context 선택 없이 "Start Session") | **Activity Card 경로는 Context 필수, 서재 경로는 Context 없이 진행 허용**으로 나눈다. contracts는 `SelectActivityOptionRequest.readingContext` 를 **필수**로 두고(카드 선택은 항상 Context를 동반), 서재의 "Start Session"(Stage 4)은 `CreateSession.readingContext` 를 **nullable 로 유지**한다(이미 허용). Stage 3에서 실제로 구현되는 것은 앞쪽뿐이다 | ① PRD §7.4가 Activity Card의 구성 요소로 "Context 선택"을 명시하고, **선택한 Context에 맞춰 알림 문구와 대화 톤을 조정**한다고 규정한다 — 카드 경로에서는 Context가 기능의 일부다 ② FR-23(보유 책 자유 선택)은 "지금 바로 읽기"를 전제하므로 서재 경로에 Context를 강제하면 마찰이 커진다 ③ `CreateSession.readingContext` nullable은 **이미 계약에 반영**되어 있어 변경이 없다 ④ 두 경로의 차이가 화면에서도 자연스럽다(카드 = 계획, 서재 = 즉시) | ① 양쪽 다 필수 (기각 — 서재 즉시 시작 흐름과 FR-23 취지에 마찰, Figma 서재 시트에도 Context UI가 없다) ② 양쪽 다 선택 (기각 — Context가 없으면 알림 문구·대화 톤 조정이라는 FR-08 기능이 카드 경로에서도 작동하지 않는다) ③ Stage 4로 이월 (기각 — `SelectActivityOptionRequest` 가 Stage 3 contract이므로 지금 정해야 한다) | **승인 — 권장안 채택(경로별 분리)** (2026-10-02, §8). Activity Card 경로 = `SelectActivityOptionRequest.readingContext` **필수**, 서재 경로 = `CreateSession.readingContext` **nullable 유지**. Stage 3 에서 실제 구현되는 것은 앞쪽뿐이다 |
| **D-10** | **Activity Card 날짜 기준 timezone** (OAQ-15 — 07:00 갱신) | **서버가 `caregiver_profiles.timezone` 을 기준으로 `card_date` 를 정한다.** Frontend는 ① Stage 2에서 이미 전송하는 기기 감지 timezone(`PATCH /v1/me`)을 유지하고 ② **응답의 `ActivityCard.date` 를 그대로 신뢰**하며 클라이언트에서 "오늘"을 재판정하지 않는다 ③ `date` 가 기기 기준 오늘과 다르면 화면이 그 날짜를 밝힌다(AC-3-11) | ① 카드 생성은 서버 배치 잡이므로 **생성 시점의 기준 시간대는 서버가 소유**해야 `UNIQUE(child_id, card_date)` 가 성립한다 ② 클라이언트가 재판정하면 여행·시차·기기 시계 변경 시 "오늘 카드가 없다"는 오탐이 생긴다 ③ Stage 2가 이미 timezone 전송 경로(`D-16`)를 만들어 두어 추가 계약이 없다 ④ 날짜를 밝히는 UX는 오프라인 캐시 카드 표시와 동일한 규칙이라 화면이 하나로 정리된다 | ① 클라이언트 기기 timezone 기준 (기각 — 서버 배치 잡과 기준이 달라져 카드 없음·중복이 발생) ② UTC 고정 (기각 — 미국 사용자의 07:00이 실제 아침이 아니게 된다) ③ 사용자에게 timezone 입력받기 (기각 — PRD에 요구 없음, 입력 부담. Stage 2 `D-16`에서 이미 기각) | **승인 — 서버 기준 신뢰** (2026-10-02, §8). 서버가 `caregiver_profiles.timezone` 으로 `card_date` 를 정하고 Frontend 는 `ActivityCard.date` 를 그대로 신뢰한다. **클라이언트에서 "오늘"을 재판정하지 않으며**, 기기 기준 오늘과 다르면 화면이 그 날짜를 밝힌다 (AC-3-11) |
| **D-11** | **Activity Card 오프라인 캐시 저장 방식** (ARCHITECTURE §6.3 — "TanStack Query persist 플러그인 승인됨(#9), 사용 여부는 Stage 3 Plan. 대안은 수동 저장") | **수동 저장**을 채택한다 — `shared/lib/activity-card-cache.ts` 가 `localStorage` 키 `haru.activity-card.v1` 에 **`{ schemaVersion, childId, card }`** 만 저장한다. 읽기·쓰기 모두 `ActivityCardSchema` parse. 폐기 조건 = schemaVersion 불일치 · parse 실패 · `card.date` 가 오늘보다 과거로 2일 이상 · 로그아웃. **TanStack Query persist 플러그인은 도입하지 않는다** | ① persist 플러그인은 **Query 캐시 전체**를 대상으로 하므로 `HomeSummary.lastHighlightLine`(아이 발화 파생)·서재 목록·`me` 까지 로컬에 남는다. 화이트리스트를 걸어도 "무엇이 저장되는가"가 라이브러리 내부 규칙에 의존해 **AC-3-48 전수 검사가 어려워진다** ② 캐시 대상이 1건이라 수동 구현이 수십 줄이다 ③ Stage 2 `OnboardingDraftStore`(localStorage + schema parse + 폐기 조건)와 **같은 패턴**이라 새 개념이 없다 ④ 신규 런타임 의존 0건(§16 D-19) | ① TanStack Query persist (기각 — 저장 범위가 넓어 프라이버시 검증이 어렵고, 신규 런타임 의존이 생긴다) ② IndexedDB (기각 — 비동기 읽기로 첫 렌더 깜빡임, 수 KB 데이터에 과한 복잡도. Stage 2 `D-3`와 동일 판단) ③ 캐시 없음 (기각 — **NFR 오프라인 "Activity Card는 최근 카드 캐시 표시"** 미충족) ④ `HomeSummary` 도 캐시 (기각 — 하이라이트 한 줄이 아이 발화 파생 텍스트다) | **승인 — 수동 저장** (2026-10-02, §8). `shared/lib/activity-card-cache.ts` → `localStorage` 키 `haru.activity-card.v1` 에 `{ schemaVersion, childId, card }` 만 저장. 읽기·쓰기 모두 `ActivityCardSchema` parse. **TanStack Query persist 플러그인 미도입** |
| **D-12** | **`S2-ONB-2` — 온보딩 질문지 Q5 표지 그리드(8권 프리셋, 2열 커버 썸네일)** (Stage 2에서 표지 이미지 부재로 Stage 3 배정) | **온보딩 Step 3(`books`)로 되돌린다.** Stage 3에서 책 표지 에셋과 `BookCover` 가 준비되므로, Step 3의 "집에 있는 책" 입력 위에 **8권 프리셋 커버 그리드(2열, 다중 선택, 선택 안 함 허용)** 를 추가한다. 프리셋 목록은 **Mock instrument/fixture 응답 값**으로 내려오며 화면에 하드코딩하지 않는다. 기존 제목 직접 입력 경로는 **유지**한다(프리셋 밖 책) | ① 질문지 v1.1이 Q5를 "**the single highest-ROI question**"으로 명시한다 — 이미 보유한 책을 추천 후보에서 제거하는 것이 cold-start 추천 품질의 핵심이다 ② 제목 자유 입력만으로는 `book_id` 매칭이 불확실해 **엔진이 쓸 수 있는 데이터가 되지 않는다**(질문지 Open Decision 1: "엔진이 아는 책이어야 한다") ③ Stage 3가 표지 에셋·`BookCover`·카탈로그 fixture를 모두 갖게 되는 **첫 시점**이다 ④ 온보딩 Step 3 화면은 이미 존재하므로 추가 route·Guard 변경이 없다 ⑤ 프리셋을 서버 값으로 두면 8권 선정(질문지 Open Decision 1)이 바뀌어도 코드 변경이 없다 | ① Library 안에서만 다룬다 (기각 — 온보딩 시점의 cold-start 입력이 목적인데 서재는 가입 이후 화면이라 **첫 추천에 반영되지 않는다**) ② 구현하지 않고 제목 입력 유지 (기각 — 질문지 문서가 Required로 설계한 최고 ROI 문항을 데이터 형태가 다른 방식으로 대체하게 된다) ③ Stage 6(개인화)로 이월 (기각 — cold-start는 Stage 3 추천의 입력이라 Stage 6에서는 늦다) ④ 표지 없이 제목 8개 체크박스 (기각 — 질문지가 "2열 커버 썸네일"을 명시했고, 표지 없이는 보호자가 소장 여부를 빠르게 식별하기 어렵다) | **승인 — Stage 2 Design Spec 개정으로 처리** (2026-10-02, §8 · §8.5 ⑥). design-agent §13.1 ⑥ 의견 채택. 구현은 Stage 3 에서 하지만 화면 명세 소유는 Stage 2 Spec 에 둔다 — **Stage 3 Design Spec 이 Stage 2 화면을 재명세하지 않는다** |
| **D-13** ★ | **C-17 에셋 파이프라인 실사용** (Stage 1 `D-4` 결정의 첫 적용. **`sharp` 미설치**) | ① **`sharp` 를 root devDependency로 설치**하고 `pnpm assets:optimize` 를 실제로 돌린다(런타임 의존 아님) ② 책 표지 해상도 상한 = **`--size-book-cover-*` 기준의 2배(2x)까지**만 산출하고 전면 상한(1440)은 캐릭터·일러스트에만 적용한다 — 표지는 카드/서재에서 최대 폭이 작다 ③ `BookCover` 는 **고정 aspect-ratio + `object-fit: cover`** 로 원본 비율 편차를 흡수한다(Stage 2 `QA-2-004` 재발 방지) ④ fixture의 `coverUrl` 은 **번들 에셋 경로**를 쓰되 `BookCover` 는 임의 URL도 받는다 ⑤ 원본 노드·크기·비율은 design-agent가 §15.8-3으로 먼저 실측 보고한다 | ① `D-4`는 이미 승인된 결정이고 `sharp` 추가도 사용자가 명시했다 — 남은 것은 **실행 시점**뿐이며 그것이 Stage 3다 ② 표지를 1440까지 만들면 20권 × 3포맷 × 4해상도로 저장소·빌드가 불필요하게 커진다. 표시 크기 대비 2x면 Retina에서 충분하다 ③ Stage 2에서 캐릭터 에셋의 **원본 비율이 Figma와 달라** 여백이 282px 어긋난 사례(`QA-2-004`)가 있었다 — 비율을 컴포넌트가 강제해야 반복되지 않는다 ④ 원격 URL 수용은 Backend 연동 시 재작업을 없앤다 | ① `sharp` 없이 수동 변환 (기각 — 재현 불가능하고 산출물 검증(AC-3-51)을 자동화할 수 없다) ② PNG만 사용 (기각 — `D-4` 승인 결정 위반, 표지 20권이면 용량 부담이 크다) ③ 표지도 1440 상한 (기각 — 표시 크기 대비 과잉, 빌드·저장소 비용) ④ 원격 URL만 지원 (기각 — Mock 단계에서 표지를 표시할 수 없어 Home·서재가 성립하지 않는다) | **승인 — 권장안 ①~⑤ 채택** (2026-10-02, §8). `sharp` devDependency 설치는 D-19 와 함께 승인. **캐릭터 해상도는 §7.1 로 분리 결정 — 안 C: 933px 에셋을 그대로 쓰고 ≥600px 에서 1.77x 를 수용한다**: 에셋은 투명 원본 **`Haru_Hello_Heart_t 1.png` (933×1659)** 에서 Home 크롭(aspect ≈0.79) 재추출, 필요치 1056 대비 **123px 부족 / 최대 1.77x** (393px 뷰포트는 표시 폭 441 → 2.12x 로 충족, 480 컬럼 528 에서만 부족). **쓰지 않는 것**: 941×1672 파일(알파 전부 255 인 **불투명 스크린샷본**) · Figma `163:2532`(294×373, 민트 배경 베이크) · `벤치마킹/Moodeboard/HARU_Hello_heart.png`(1536×2752, **다른 생성본**). Design Spec 의 "941px 한계 / 115px 부족" 표기는 **933px / 123px 부족 / 1.77x** 로 정정한다(design-agent 소관). QA 판정 = `PASS (accepted: D-13)`. 후속: 1056px 이상 투명 원본이 오면 **에셋 파일만 교체** |
| ⛔ **D-14** **Home 덱 부분 무효 (Rev 4 §20.1)** | **Stage 3 신규 Shared UI 범위와 `SwipeDeck` 재사용** | **3종만 추가**: `SectionHeader`(`30:74`) · `Carousel`(`113:1993`) · `Toggle`(`17:113`) + `ListRow` media/meta 변형 확장 (28 → **31**). **Home 덱은 `SwipeDeck`(depth 3) 을 재사용**한다 — 신규 덱 컴포넌트를 만들지 않는다. 제외: `StatTile`(S7) · `TextArea`·`StarRating`(S5) · `PromptCarousel`(S4) · `SegmentedTabs`(사용처 없음) | ① 3종 모두 Stage 3 화면에 **Figma 근거가 있는 사용처**가 있다 ② `SwipeDeck` 은 Stage 2에서 "3장 스택 + 버튼/키보드 대체 조작 + Pointer Events + `prefers-reduced-motion`" 으로 이미 구현·검증되었고 **PRD §7.9 "3장 덱 좌우 스와이프로 선택"** 과 동작이 일치한다. `scroll-snap` 미사용이라 카드 내부 인터랙션(`QA-2-001` 수정 포함)도 검증되어 있다 ③ `Carousel` 은 **다건 브라우징**(서재 책장, 스냅 가로 스크롤)이라 역할이 다르다 — 하나로 합치면 두 인터랙션이 한 컴포넌트에 섞인다 ④ 제외한 것들은 Stage 3 사용처가 없어 만들면 "다음 Stage 선행 구현"이다 | ① Home 덱용 신규 컴포넌트 (기각 — `SwipeDeck` 과 기능 중복, 접근성 경로를 다시 검증해야 한다) ② `SwipeDeck` 을 `Carousel` 로 통합 (기각 — 스택 선택 ↔ 다건 브라우징은 키보드·포커스·`aria` 규약이 다르고, 통합하면 Stage 2 검증 결과가 무효화된다) ③ `Toggle` 대신 Checkbox 재사용 (기각 — 설정의 on/off는 즉시 적용 스위치라 폼 제출형 Checkbox와 의미가 다르다. Figma `17:113` 근거 존재) ④ `SectionHeader` 를 page-only 로 (기각 — 서재·(향후) 리포트에서 반복되는 패턴) | **승인 — 원칙 확정: "해당 화면의 컴포넌트가 나올 때 만든다"** (사용자 지시 원문, 2026-10-02 §8). 그 원칙의 적용 결과가 권장안과 같다: **3종 추가**(`SectionHeader`·`Carousel`·`Toggle`) + `ListRow` media/meta 확장 (28 → 31), Home 덱은 **`SwipeDeck`(depth 3) 재사용**(신규 덱 컴포넌트 금지). 제외 5종(`StatTile`·`TextArea`·`StarRating`·`PromptCarousel`·`SegmentedTabs`)은 **그 화면이 나오는 Stage 에서** 만든다 — **선행 구현 금지**. ⛔ **Home 덱 부분 무효 (2026-10-05, approvals §12.2 · §12.9)**: Figma `163:2648` 실측이 **카드 365 + 좌 14 + 우 14 = 393 = 뷰포트 폭 정확히 일치** → **"1 카드 = 1 페이지" 가로 scroll-snap 트랙**이다. 기존 "스택" 판단은 **이 산술을 검토하지 않아 틀렸다**. 2차 재실측에서 gap 이 14→**6** 으로 줄어 **peek 8px** 이 생겼고(= "다음 카드가 있음을 알린다"), 트랙 공식 `pad 14 + 카드 + gap 6 + peek 8 = W` 로 **peek 8 이 320/393/≥600 전 구간 불변**이다. 따라서 **`SwipeDeck` 재사용은 불가**하다(4개 전제 충돌 — audit §3.2). ✓ **나머지는 유효**: Shared UI 3종(`SectionHeader`·`Carousel`·`Toggle`) + `ListRow` 확장, 제외 5종 선행 구현 금지. 트랙 컴포넌트는 **`Carousel` page 모드 확장(권장) 또는 신규 1종** — audit §11.10, design-agent 확정 |
| **D-15** | **증정 신청의 배송지 입력 범위** (DATA_MODEL §7 "배송지는 아동 PII와 결합되는 성인 PII — 저장 위치 NEEDS DECISION") | **Stage 3 Frontend는 배송지를 입력받지 않는다.** `CreateGiftRequestRequest = { bookId }` 만 보내고, 접수 후 **"배송 정보는 별도로 안내드립니다" 성격의 안내**를 표시한다(문구는 copy 슬롯 — 확정 전에는 슬롯을 비운다). 배송지 수집·저장은 운영·법무 결정 후 별도 Stage/승인으로 다룬다 | ① 배송지는 **아동 프로필과 결합되는 성인 PII**이고 저장 위치(별도 테이블 / 외부 풀필먼트)가 **미결**이다(DATA_MODEL §7). 위치가 정해지지 않은 데이터를 Frontend가 먼저 수집하면 잘못된 곳으로 전송될 위험이 있다 ② COPPA 관점에서 아동 데이터와 배송지의 결합은 법무 검토 대상이다(rules/backend §4) ③ PRD FR-22·§13 어디에도 "앱에서 배송지를 입력한다"는 문장이 없다 — "신청을 받아 증정"까지만 규정한다 ④ 나중에 `CreateGiftRequest` 에 필드를 더하는 것은 비파괴 확장이다 | ① 배송지 폼을 지금 만든다 (기각 — 저장 위치 미결, 법무 미검토 상태에서 PII 수집) ② 주소 대신 이메일만 (기각 — PRD 근거 없음, 이미 계정 이메일이 있다) ③ 증정 기능 자체를 Stage 8로 이월 (기각 — FR-22가 **P0**이고 §13 "증정 대기 중 대체 흐름"이 Stage 3 In Scope다) | **승인 — 배송지를 입력받지 않는다** (2026-10-02, §8). `CreateGiftRequestRequest = { bookId }` **확정**. 접수 후 안내는 **잠정 문구를 copy 모듈에만** 둔다 (§8.2, 예: `Your request is in. We'll reach out with delivery details.`) — 수치·기한·배송 소요일 금지, 운영 표현 확정 시 **copy 값만** 교체. 배송지 수집·저장은 운영·법무 결정 후 별도 Stage·승인 (P3-BIP-06) |
| **D-16** | **push 권한·기기 등록의 Stage 3 구현 방식** (#7 — 네이티브 Push Adapter는 Stage 4) | **interface + Web 구현 + Mock**: `shared/platform/pushPermission.ts` 에 `PushPermissionPort`(`getStatus` · `request` · `getToken`)를 정의하고 ① **Web 구현** = `Notification.permission` + `Notification.requestPermission()` 까지만 사용하고 **실제 구독(PushManager)·VAPID 키·provider SDK는 사용하지 않는다** — 토큰은 결정적 Mock 값 ② **Mock 구현** = `push-permission-denied` 등 시나리오용 ③ 선택 지점은 `app/providers` 한 곳. Stage 4가 Native 구현만 추가한다 | ① `RecorderAdapter`·`AuthGateway` 와 **같은 어댑터 패턴**이라 새 개념이 없고 Stage 4 전환 비용이 handler 추가로 끝난다 ② provider가 **미선정**(PLANNING §7-6: OneSignal 권장, NEEDS DECISION)이므로 SDK를 넣으면 교체 비용이 생긴다 ③ VAPID·서버 키는 Backend 소관이고 Frontend에 Secret을 둘 수 없다(NFR 보안) ④ `Notification.permission` 만으로도 **사전 안내 → 요청 → 허용/거부** 라는 FR-08의 Frontend UX 전부를 검증할 수 있다 | ① Web Push 전체 구현(PushManager + VAPID) (기각 — provider·서버 키 미정, Frontend Secret 금지, Stage 4 네이티브 전환 시 재작업) ② provider SDK(OneSignal 등) 도입 (기각 — 미선정 상태, 제3자 SDK 도입은 승인 사항이며 PII 전송 경로가 생긴다) ③ Mock만 만들고 실제 권한 API 미사용 (기각 — 브라우저 권한 다이얼로그 UX가 검증되지 않아 FR-08 Frontend 부분이 비어 있게 된다) | **승인 — Port + Web 구현 + Mock** (2026-10-02, §8). `shared/platform/pushPermission.ts` 의 `PushPermissionPort`(`getStatus`·`request`·`getToken`), Web 구현은 `Notification.permission` / `requestPermission()` 까지만 — **실제 구독(PushManager)·VAPID 키·provider SDK 금지**, 토큰은 결정적 Mock 값. 선택 지점은 `app/providers` 한 곳. Native 는 Stage 4. **D-18 로 설정 화면만 제외되며 이 항목은 그대로 유효하다** |
| **D-17** | **서재 시트의 route화 여부** (PLANNING §9.2 "시트로 디자인된 화면은 부모 페이지 상태가 기본, 딥링크 필요 시 route") | **route화하지 않는다** — `LibraryShelfSheet`("See all") · `BookDetailSheet` · `ReadingContextSheet` · Prompt 공개는 전부 **부모 페이지의 상태**다. 단 `BookDetailSheet` 는 **뒤로 가기로 닫히도록** history 항목을 하나 쌓는다(`navigate` 대신 `history.pushState` 수준의 처리는 Router의 `location.state` 사용 — 구현 방식은 development-agent) | ① PLANNING §9.2가 기본 원칙으로 명시했고 Figma도 시트로 디자인했다 ② Stage 3에 **알림 deep link 대상이 없다**(push deep link는 Stage 5 `/session/:id/feedback`) ③ route화하면 `/library/books/:bookId` 에 직접 진입했을 때 부모 목록이 없는 상태를 따로 처리해야 한다 ④ 모바일에서 시트가 뒤로 가기로 닫히지 않으면 사용자가 앱을 벗어난다 — 이것만 별도로 해결한다 | ① 전부 route화 (기각 — 부모 없는 진입 상태 처리 비용, Figma 디자인과 불일치) ② `BookDetailSheet` 만 route화 (기각 — 딥링크 요구가 없고, history 처리만으로 뒤로 가기 문제가 해결된다) ③ 뒤로 가기 처리도 하지 않음 (기각 — 모바일에서 시트 탈출 경로가 닫기 버튼 하나뿐이 된다) | **권장안 기각 — 사용자 결정은 "시트는 만들고 Mock 전용 route 를 입힌다"** (2026-10-02, §8 · §8.3). 사용자 지시: "목업용으로 링크만 만들어 놓는다. 백엔드 개발시 삭제할 수 있게 한다" + 확인 질문 답변 "시트는 만들고 route 를 입힌다" → 권장안(route화 안 함)을 **기각**. 기각 사유: Mock 데모에서 시트에 직접 링크로 도달할 수 있어야 한다는 요구가 있었고, 삭제 가능성은 route 구조로 보장한다. **제약 4개 필수**: ① route 정의를 **한 파일에 모은다**(예: `app/router/mockPreviewRoutes.tsx`) — 삭제 지점이 한 곳 ② route 가 사라져도 시트가 **부모 화면의 상태로 계속 동작**해야 한다. 열림 상태는 route 에 **의존하지 않고** route 는 진입점일 뿐이다 ③ 파일 상단에 제거 조건을 주석으로 명시하고 **Stage 8 Handoff 에 제거 대상으로 등재** ④ `BookDetailSheet` 뒤로 가기 = **`LibraryShelfSheet` 목록으로 복귀**. 대상: `LibraryShelfSheet`("See all") · `BookDetailSheet` · `ReadingContextSheet` |
| **D-18** | **알림 설정의 시간·요일 입력 방식** (Figma 누락 — C13-19) | **시간** = `SelectTrigger` + Sheet 목록(**30분 단위**, `HH:mm`). **요일** = `Chip` 다중 선택 7개(일~토, `reminderDays: 0–6`). 네이티브 `<input type="time">` 을 쓰지 않는다 | ① `<input type="time">` 은 **브라우저·OS마다 UI와 로캘 형식이 달라** Playwright 시각 baseline이 불안정해지고 토큰으로 스타일을 통제할 수 없다 ② `SelectTrigger` + `Sheet` 는 Stage 2 성별 선택에서 이미 검증된 조합이라 새 패턴이 없다(P-05 scrim 일관성 유지) ③ 30분 단위면 목록이 48개로 스크롤 가능한 범위이고, 카드 갱신·리마인더 용도에 분 단위 정밀도가 필요 없다 ④ `Chip` 다중 선택은 온보딩 Step 3 주제 태그에서 이미 쓰인 패턴이다 | ① `<input type="time">` (기각 — 크로스 브라우저 UI 편차, 토큰 통제 불가, baseline 불안정) ② 자유 텍스트 입력 (기각 — 로캘·오입력 처리 비용) ③ 5분 단위 (기각 — 목록 288개, 필요 없는 정밀도) ④ 요일을 Toggle 7개로 (기각 — Toggle은 설정 on/off 의미이고, 다중 선택은 Chip이 맞다) | **범위 축소 — 알림 설정 화면만 Stage 3 제외** (2026-10-02, §8 · §8.4). 사용자 지시 "피그마를 기준으로 하여 알림 기능은 구현하지 않는다" + 확인 질문 답변 **"설정 화면만 제외"**. → **미구현**: `/settings/notifications` 의 카드 갱신 시간 · 리마인더 요일/시간 입력 UI (`C13-19`, Figma 누락). QA 는 FR-08 의 설정 화면 부분을 **Out of Scope** 로 기록한다 (FAIL 아님). → **유지**: D-16 push Port + Web 구현 + Mock 시나리오(`push-permission-denied` 등) · 권한 사전 안내 UX · **Reading Context 선택 시트**(Figma 는 결과 chip `86:538` 만 존재 — 선택 UI·시간 picker 는 **Figma 누락 → design-agent 명세 `C13-15`**, 구현은 Stage 3 In Scope) · contracts `GET/PUT /v1/notification-preferences` · `POST /v1/push-devices` · `DELETE /v1/push-devices/:id` **정의 유지**(Contract 는 화면보다 앞서도 된다). 화면은 **디자이너에게 Figma 요청** 후 도달 Stage 로 이월하며, 권장안의 picker 규격(`SelectTrigger`+Sheet 30분 단위, `Chip` 7개)은 **그 Stage 에서 재검토**한다. ★ **Reading Context `custom_time` picker 는 이 항목에서 분리되었다** (2026-10-03, §9.2 ⑩): Stage 3 In Scope 이며 규격(30분 단위 목록, 네이티브 `<input type="time">` 금지)은 **Stage 3 규격으로 확정**, 근거는 `D-18` 이 아니라 **§9.2 ⑩ / AC-3-23** 이다 |
| **D-19** | **Stage 3 신규 런타임 의존** | **신규 런타임 의존 0건.** 캐러셀·덱은 CSS + Pointer Events(#9), 아이콘은 기존 `lucide-react` 1.47.0, 캐시는 `localStorage`(D-11), push는 Web Notification API(D-16), 이미지는 `<picture>`. **devDependency는 `sharp` 1건 추가**(D-13, 에셋 최적화 스크립트 전용) | ① 결정 #9가 "제스처·애니메이션은 CSS / Pointer Events 우선"으로 이미 승인되어 있고 `SwipeDeck` 이 그 방식으로 검증되었다 ② 런타임 의존 0건이면 Stage 1·2의 번들 검사·시각 결정성이 그대로 유지된다(AC-3-45 · AC-3-79) ③ `sharp` 는 빌드 타임 전용이라 번들에 포함되지 않는다 | ① 캐러셀 라이브러리(`embla-carousel` 등) (기각 — Stack 확장 승인 필요, 번들 증가, Playwright baseline 불안정) ② 이미지 라이브러리 (기각 — `<picture>`+`srcset` 로 충분, `D-4` 결정과 중복) ③ push provider SDK (기각 — D-16) | **승인 — 신규 런타임 의존 0건, `sharp` 1건만 devDependency** (2026-10-02, §8). 캐러셀·덱 = CSS + Pointer Events(#9), 아이콘 = 기존 `lucide-react` 1.47.0, 캐시 = `localStorage`(D-11), push = Web Notification API(D-16), 이미지 = `<picture>`. `sharp` 는 `pnpm assets:optimize` 전용 — **런타임 import 금지** |
| **D-20** | **Step 1의 관계·언어 환경·독서 루틴 값이 Stage 3 추천에 쓰이는가** (온보딩 질문지 v1.1에 해당 문항이 없어 선택지 근거가 design-agent 명세뿐 — `C13-04`) | **Stage 3 추천 입력으로 쓰지 않는다.** 추천 근거는 질문지 Q1~Q5가 만드는 cold-start state vector(comfort_zone · axis_weights · interest_weights · channel · owned_books)와 `age_months` 이며, `relationship`·`languageEnvironment`·`readingRoutine` 은 **프로필 표시·알림 시간 기본값 참고용**으로만 둔다. 세 필드의 **선택지 목록 확정은 Stage 6**(설정의 아이 프로필 수정)로 이월하고, 그때까지 현재 구현 값을 유지한다 | ① 질문지 v1.1 "Cold-start state vector"가 추천 함수의 입력을 **명시적으로 열거**하며 그 목록에 세 필드가 없다 ("Engineering should treat this as the source of truth for the recommendation function") ② 세 필드는 PRD §7.2·§12.1 ChildProfile에 근거가 있어 **수집 자체는 정당**하다 — 문제는 선택지 목록의 근거뿐이다 ③ 추천에 쓰지 않으면 선택지가 바뀌어도 추천 결과가 흔들리지 않으므로 Stage 3가 차단되지 않는다 ④ Stage 6은 이 값들을 실제로 수정하는 화면을 만드는 Stage라 선택지 확정의 자연스러운 시점이다 | ① 지금 선택지를 확정한다 (기각 — 근거 문서가 없어 plan-agent가 임의로 정하게 된다. rules "PRD/Figma에 없는 요구사항을 임의로 추가하지 않는다") ② 세 필드를 추천 입력에 포함 (기각 — 질문지 문서가 정의한 추천 입력을 Frontend가 확장하는 것이며, 서버 추천 엔진 요구가 바뀐다) ③ 세 필드를 제거 (기각 — PRD §7.2·§12.1 근거가 있고 Stage 2에서 이미 수집·저장된다) | **승인 — Stage 3 추천 입력으로 쓰지 않는다** (2026-10-02, §8). 추천 근거는 질문지 Q1~Q5 의 cold-start state vector + `age_months` 다. `relationship`·`languageEnvironment`·`readingRoutine` 은 프로필 표시·알림 시간 기본값 참고용. 세 필드의 **선택지 목록 확정은 Stage 6 으로 이월**하고 그때까지 현재 구현 값을 유지한다 |

★ = 착수 전 필수 결정이었던 항목 (**D-1 · D-2 · D-3 · D-4 · D-5 · D-6 · D-7 · D-13**) — 전건 승인 완료.

**승인 결과 요약**: 권장안 채택 15건 · **권장안 기각 4건**(D-4 · D-5 · D-8 · D-17) · **범위 축소 1건**(D-18 — 알림 설정 화면만 제외, D-16 push Port·Mock·contracts 정의는 유지).

**추가 결정 D-21 · D-22 (2026-10-03, `stage-3-approvals.md` §9)** — 문서 갱신 중 발견된 모순에 대한 사용자 결정이다.

| ID | 항목 | 결정 |
|---|---|---|
| **D-21** | **Prompt 개수 상한** — `N-2`("상한은 서버가 정한다 / Frontend 가 잘라내지 않는다") ↔ 구 `AC-3-17`("2~3개 벗어난 응답 거부") 정면 충돌 | **`N-2` 우선 — 상한 제거.** `promptPreview` · `promptSet.questions` 모두 `.max(3)` 없음, `.min(1)` 유지(`.min(2)` 로 올리지 않는다). Frontend `slice(0,3)` 금지 — 접힌 높이 3개는 **cutoff, cap 아님**. `AC-3-17` 재작성(4개 이상 parse 통과 + 3개 표시 + 확장·키보드 도달), `success` fixture 에 4개 이상 케이스 포함. `P3-BIP-03` 의 "제시 2~3개" 는 **Backend 생성 정책**으로만 남는다 |
| **D-22** | **`ActivityCard.targetCapability` 존속** (구 §7.1 "유지" = RECOMMENDED) | **삭제.** `D-5` 로 역량이 `options[].capability` 단위가 되어 카드 단위 대표 역량의 사용처가 없다 (`N-3` 과 같은 귀결). §7.1 `card.ts` · `API_CONTRACTS.md` §3.6 · §4 · §6 G-05 반영 |

**이 승인이 만드는 문서 갱신 작업**은 `stage-3-approvals.md` §8.6 에 소유 Agent 와 함께 정리되어 있다. plan-agent 소관은 ① 이 표(완료) ② `docs/API_CONTRACTS.md` 설계 변경분(완료 — `Prompt.phase`·`pageRef` 추가, `HomeSummary.characterLine` 추가, `streakDays` 삭제, Reading Context 라벨 확정, `CreateGiftRequestRequest` 확정) ③ §10 P3-BIP 추가 2건(완료 — P3-BIP-13 · P3-BIP-14) ④ **§9 D-21 · D-22 반영(완료 2026-10-03)** — `AC-3-17` 재작성 · §7.1 `questions`·`promptPreview` 상한 제거(`.min(1)` 명시) · §7.1 `card.ts` `targetCapability` 삭제 · §12 4개 이상 케이스 · `API_CONTRACTS.md` §3.6 · §4 · §6 G-05/G-07 이다. 구현으로 확정되는 contract 반영은 development-agent 소관이다 (`rules/workflow.md` §5).

---

## 17. Stage 2 이월 항목 처리 계획

### 17.1 design-agent 문서 갱신 — **Stage 3 design 단계에서 처리**

| # | 대상 | 갱신 내용 | 근거 |
|---|---|---|---|
| 1 | Design Spec(Stage 1) **§2.2 · §4.12 · §5.2 · §6.2** | BottomTabBar `sticky` 기준으로 **하단 padding · Toast offset · 중앙 overhang** 기술을 한 규칙으로 재작성 | `S1-E-3`, §16 D-1, §15.3 |
| 2 | `docs/COMPONENT_MAP.md` | Stage 3 신규 3종(`SectionHeader`·`Carousel`·`Toggle`) + `ListRow` 변형 확장 행 갱신, `ReadingNowCard` "보류" → **제외 확정**(§16 D-7), `PromptPill.phaseTag` 사용 보류 표기(§16 D-8) | §16 D-7 · D-8 · D-14 |
| 3 | Stage 3 Design Spec | Figma 차이 **허용 차이(AD-S3-xx) 사전 등록** — Prompt 선택 전 노출(D-4) · 카드별 역량 3개(D-5) · "115 Min"(D-6) · My Saved/평점/Reading now(D-7) · Start Session disabled(D-3) | §16 |
| 4 | Stage 3 Design Spec | 가값 목록에 **P-02 실사용처**(CapabilityBadge · ProgressBar · Chip 경계)를 화면 단위로 기록 | §17.3 |

> **plan-agent는 Design Spec을 수정하지 않는다.** 이 표는 design-agent에게 전달할 작업 목록이며, Orchestrator는 design 단계 시작 시 1번을 먼저 지시한다(§16 D-1 승인 후).

### 17.2 development-agent 이월 작업

| # | 항목 | 처리 | AC |
|---|---|---|---|
| 1 | **`S2-CONSENT-1`** — `consent_events.source` 의 `signup_oauth` 미구분 (Google·Apple 가입도 `signup_email` 로 기록) | 사용자 결정(2026-09-28)에 따라 `consentSourceFor()` 한 함수에서 provider 가입 경로를 구분한다. contracts enum(`ConsentSource`)은 이미 4값을 갖고 있어 **contract 변경 0** | AC-3-77 (회귀) |
| 2 | `PlaceholderPage` 잔존 여부 확인 후 Home 콘텐츠로 완전 교체 | Stage 2에서 삭제되었으나 `/` 가 skeleton → 콘텐츠로 바뀌므로 재확인 | AC-3-09 |
| 3 | `session-cleanup.ts` 확장 | Activity Card 캐시 삭제 + push device 해지 추가 | AC-3-76 |
| 4 | `ROUTES` · 탭 items config | Stage 3 route 5개 + 탭 3개 등록 | AC-3-04 |
| 5 | `sharp` devDependency 설치 + `pnpm assets:optimize` 최초 실행 | §16 D-13 승인 후 | AC-3-51 |
| 6 | Playwright baseline 재생성 | 탭바 마운트 영향 화면(design-agent §15.8-8 목록) | AC-3-66 |

### 17.3 가값 재제시 절차 (P-01 · P-02 · P-04 · P-05 · P-16 · P-17 · **P-23**)

stage-1-approvals §9.4-3 "남은 건은 해당 화면이 나올 때 재제시한다"에 따른다. **Stage 3는 P-02의 첫 대량 실사용처**다.

| P | Stage 3 실사용처 | 재제시 시 함께 제시할 것 |
|---|---|---|
| **P-02** 비텍스트 대비 | **CapabilityBadge**(**카드별 배지** — D-5 로 덱 상단 1개가 아니다 · 서재 캡션) · **ProgressBar** · Chip 경계(서재 필터·주제 태그) · **BookCover selected 체크** | 배지 흰 글자 1.56~1.86:1 · 바 1.73~1.94:1 + **실제 Home·서재 스크린샷** |
| **P-01** `--color-fg-secondary/-tertiary` | 추천 이유 2문장 · 코칭 문장 · 서재 부제(저자·마지막 읽은 날) | 실측 대비값(2.91~3.13:1) + 실제 화면 |
| **P-04** status 색 | **증정 상태 Tag 6종** · Offline Banner · 권한 거부 InlineAlert | 상태 6종이 한 화면에 나열되는 `/library/gift-requests` 스크린샷 |
| **P-05** `--color-scrim` | **서재 "See all" 시트** · **BookDetailSheet** · Context 선택 시트 (Figma `163:1807`·`145:1450`) | 시트 내용 위 분리감 (모바일 실기기 권장) |
| **P-16** medallion sm/md/lg | Home 캐릭터(`26:22`) · 서재 bookworm(`163:2642`) — Stage 2 실측값 재확인 | Stage 2 확정 여부 확인 후 필요 시에만 |
| **P-17** TextField `trailingAction` 구분 | `/library/add` 검색 필드 | Stage 2 `D-14` 결정(밑줄 제거) 유지 여부 |
| **P-23** Prompt 배지 흰 라벨 대비 1.72:1 | **`PromptPill` 의 `phase`(`PRE`/`POST`) · `pageRef` 배지** (D-8 로 Stage 3 에서 실제 표시) | 신설 근거 = `stage-3-approvals.md` **§9.2 ⑫** (2026-10-03) — **P-02 에 흡수하지 않는다**(대상·교체 조건이 다르다). 실측 대비값 + Prompt 공개 화면 스크린샷 |

절차: **Stage 3 Verdict 보고 후 · Stage 4 착수 전**에 Orchestrator가 P-02 → P-01 → P-04 → P-05 → P-16 → P-17 → **P-23** 순서로 하나씩 `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지` 를 받는다. 신규 가값은 `P-18…` 로 추가한다.

### 17.4 Stage 3가 처리하지 않는 이월 항목

| ID | 이유 |
|---|---|
| `S2-HOME-1` 워드마크 에셋화 | **결정 완료 — 텍스트 유지**(stage-2-approvals §9). 허용 차이 `AD-S2-14` 유지 |
| `S2-COPY-1` 온보딩 소개 문구 | **결정 완료 — 빈 슬롯 유지**(§9). 실제 소요 시간 측정 후 채운다 |
| `S2-ONB-1` Q1·Q2·Q4 필수화 | **결정 완료 + 구현 완료** (commit `20f6a26`) |
| `S1-G-6` 전체 프레임 임계값 | **결정 완료 — `maxDiffPixels: 200` 유지**(§9) |
| `S2-CARD-1` · `S2-WELCOME-1` | **결정 완료 — 현재 유지 + 허용 차이 등록**(§9) |
| `S2-SRC-1` / `S2-ONB-3` CLAUDE.md Source of Truth 등재 | **결정 완료**(§9)이나 `CLAUDE.md` 는 plan-agent 쓰기 허용 경로가 아니다 → **Orchestrator 처리 필요** (§18 ⑦) |
| `S1-D2-3` Safari VoiceOver | 실기기 검증 항목 |
| `S1-G-7` source map | Stage 8 프리뷰 배포 |
| `L-02` 약관 본문 | 출시 전 차단 항목 (법무) |
| **Stage 2-B** `C13-09`·`C13-10` + Stage 2 `D-2`·`D-6` | 디자이너 Figma 대기. **Stage 3 범위 아님**(stage-2-approvals §3) |

---

## 18. 보고 항목 — 문서 불일치 · 확인 요청

> 승인된 결정을 뒤집는 제안이 아니라, 구현 전에 **표기·범위 수준의 정합**을 맞추기 위한 보고다. ①~④는 Stage 3 구현에 영향이 있고, ⑤~⑨는 문서 동기화·전달이다.

| # | 항목 | 내용 | 이 Plan의 처리 |
|---|---|---|---|
| ① | **Design Spec 내부 모순 — BottomTabBar 고정 방식** | Stage 1 Design Spec §2.2는 2026-09-27에 `sticky` 로 갱신되었으나 **§5.2 · §4.12 · §6.2 는 여전히 `fixed` 전제**의 하단 padding 기술을 유지하고 있다(§2.2 확인 필요 주석이 명시). 탭바가 이번 Stage에 처음 마운트되므로 지금 해소해야 한다 | **§16 D-1** — `sticky` 정본 확정 + 파생 규칙 4행. 승인 후 design-agent가 §17.1-1로 문서 4절 동시 갱신 |
| ② | **`/progress` 탭의 목적지가 어느 문서에도 없다** | PLANNING §9.2는 `/progress` 를 Stage 7로 배정했으나, 탭바는 **Stage 3에 마운트**된다. 탭 3개 중 하나가 갈 곳이 없다 | **§16 D-2** — contract 호출 0건의 안내 화면 권장 (Stage 2 Home skeleton과 같은 패턴) |
| ③ | **"Start Session" CTA의 Stage 경계가 문서에 없다** | Figma 카드·서재 시트의 주 CTA인데 `POST /v1/sessions` 는 Stage 4다. PLANNING Stage 3 Exit Criteria에도 세션 시작이 없다 | **§16 D-3** — 렌더 + `disabled`, 호출 0건을 AC-3-15로 강제 |
| ④ | **신규 enum 5종이 API_CONTRACTS §2.2 표(26종)에 없다** | `PromptKind`(`prompts.kind`) · `AgeBand`(`prompt_sets.age_band`, PRD §8.2) · `LibraryFilter`(§4 Stage 3 쿼리) · `BookSource`(`child_books.source`) · `PushPlatform`(`push_devices.platform`) | contracts에 추가하고, **API_CONTRACTS §2.2 표 갱신은 Plan 승인 후 plan-agent가 수행**(rules/workflow §5 문서 소유). "enum 26종" 표기는 **31종**이 된다 |
| ⑤ | **`mocks/home` 폴더가 rules/frontend §5 목록에 없다** | §5 목록은 `auth/ children/ onboarding/ activities/ library/ sessions/ recordings/ analysis/ reports/ notifications/ data-management`. endpoint 그룹 `home` 에 대응하는 폴더가 없다 | `mocks/home/` 을 추가하고 **rules 갱신은 하지 않는다**(rules는 plan-agent 쓰기 경로 밖). §9.3에 근거를 남기고 보고 |
| ⑥ | **디자이너 수정 요청 (Figma) — Stage 3 해당분** | ⓐ `163:2648` 배지 "Emotion Day  Day" 오타 → #14 표시 라벨 + " Day" (M-13) ⓑ `113:1992` 책장 캡션 **"Confidence"**(4대 역량 외) → #14 라벨로 교체 (M-13) ⓒ `31:102` Growth themes 차트 색 → `--color-capability-*-chart`(#19) ⓓ `25:87` Tab Bar variant 이름 `Report` → `Progress` (#15) ⓔ `163:2648` 카드 하단 Prompt ↔ ActionBar **overflow** ⓕ `113:1992` 표지 ↔ 제목 placeholder 불일치 (M-36) ⓖ `17:57` 템플릿 "Activity Card"(Morning Walk) 이름 충돌 정리 (M-37) | Figma 수정은 **디자이너 몫**. 구현은 수정 없이 진행하고 차이를 AC-3-66 "허용 차이"로 사전 기록 (§15.8-9) |
| ⑦ | **`CLAUDE.md` Source of Truth 표에 온보딩 질문지 미등재** (`S2-SRC-1` / `S2-ONB-3`) | 사용자가 2026-09-28에 **등재하기로 결정**했으나 `CLAUDE.md` 는 plan-agent 쓰기 허용 경로가 아니다 | **Orchestrator 처리 요청** — `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` 를 Source of Truth 표(참고 또는 Functional 보조)에 추가 |
| ⑧ | **PLANNING §9.2의 `/library/gift-requests` Layout 표기** | "Tab"으로 적혀 있으나 탭은 **3개 고정**(#15)이라 증정 목록이 탭이 될 수 없다 | 이 Plan은 **Stack** 으로 확정한다(§9.1). 승인 시 PLANNING §9.2 갱신 |
| ⑨ | ⭐ **PRD 수정 대상 10건 (사용자 조치)** — Rev 4 에서 **8·9·10 추가 등재** | Figma 우선 적용으로 PRD 와 어긋난 지점이다. **정본 목록 = `stage-3-approvals.md` §5(1~3) · §6.2(4) · §9.3(5~7) · §12.5(8~10)** — 이 Plan 은 **등재만** 하고 `docs/source/**` 는 **수정하지 않는다**. **1** FR-07·§7.4 Prompt 선택 후 제시(`D-4`) · **2** §7.4·§8.3 하루 1개 역량 배지·날짜 단위 순환(`D-5`) · **3** §7.4 보조 요소 집계 창(`D-6`) · **4** FR-07·§8.2 Prompt "2~3개" 를 표시 개수로만 유지(`N-2`) · **5** FR-07·§8.2 Prompt 에 `phase`·`pageRef` 개념 부재(`D-8` · `P3-BIP-13` · `P3-BIP-14`) · **6** FR-07·§8.2 Prompt **개수 상한 없음**(`D-21`) · **7** §7.2 Step 1 언어 환경 **선택 사항 + 기본값 영어**(§11.22 · `QA-2R-012` — **Stage 2 소관**) · ⭐ **8** §7.9 카드 덱 **"좌우 스와이프" → 가로 스크롤(scroll-snap)**, 1 카드 = 1 페이지 (근거: Figma `163:2648` 실측 365+14+14=393, approvals §12.5) · ⭐ **9** FR-07·§7.4 Prompt **"2~3개 제시" → 4~5개 전부 노출**(확장 트리거 없음) (근거: Figma `163:2649`=4 · `86:438`=5) — **4·6 과 같은 문장을 다루므로 PRD 적용 시 한 번에 반영**해야 한다 · ⭐ **10** §7.4 에 **카드 뒷면(flip) 개념 신설** — 우상단 아이콘으로 뒤집어 Prompt 전체 + 코칭 노트를 본다 (근거: Figma `86:482` + 컴포넌트 시그니처 `flip?: "front"` · 아이콘 `flip_to_back`) | ⚠️ 적용 절차는 **`D-24`**(§11.1·§11.6) = **OneDrive 원본과 저장소 사본을 동시 수정**한다. ~~"사본이므로 저장소에서 고치지 않는다"~~ 는 Rev 3 서술은 `D-24` 로 **대체되었다**(§20.9 모순 ①). **plan-agent 는 `docs/source/**` 를 수정하지 않는다** — 적용은 Orchestrator·사용자. **Orchestrator 처리 요청** |

**PRD ↔ Figma 불일치 (Stage 3 범위) — 신규 발견 없음.**
Stage 3 관련 불일치는 전부 이미 등록되어 있으며 이 Plan이 §16으로 결정안을 제시한다: **M-09**(→ D-4) · **M-14**(→ D-7) · **M-29**(→ D-8) · **M-30**(→ D-6) · **M-31**(→ D-5) · **M-32 잔여**(→ D-9). 해소된 항목: M-08·M-19(→ #15·D-02), M-13(→ #14·#19, Figma 수정 요청 ⓐⓑⓒ), M-21·M-22(→ #12·C-18), M-35(→ C-17), M-36·M-37(→ 보고 ⑥ⓕⓖ). M-10·M-11·M-12·M-15·M-25·M-26은 Stage 4·5·7 항목이다(단 M-12 판정 언어는 AC-3-72로 Stage 3 문구에 선제 적용).

---

## 19. 요약 — 승인 체크포인트 제시용

> ⭐ **Rev 4 델타 (2026-10-05, Home Figma 재대조 — §20)**
> - **In Scope 추가**: **`★ Save`**(`PUT/DELETE …/saved-books` + `LibraryBook.saved` — approvals §12.8 `A-9`) · **카드 뒷면(flip)** · **가로 scroll-snap 트랙**(peek 8) · 탭바 하단 16px
> - **Out of Scope 변경**: **Reading Context 선택 UI 이월**(`AC-3-22`~`26`) · Library 의 **저장 표면("My Saved")은 다음 라운드** · G-04 중 **"My Saved" 만 In Scope 로 복귀**(평점·읽기 계획은 그대로 제외)
> - **AC**: **88건**(신규 `AC-3-82`~`88` 7건, 무효 2, 이월 5 → **판정 대상 81건**)
> - **Mock scenario**: **17 key** (신규 `book-saved` 1건 — `API_CONTRACTS.md` §5.4 에 등재)
> - **PENDING**: **15건** (`P3-BIP-15` 신규)
> - **enum**: `BookSource` += `card_save` / −`onboarding_home_list`, `LibraryFilter` += `saved` → **`AC-3-56` 총수 재계산 대상**
> - **무효 결정**: `D-7`(Save 부분) · `D-14`(Home 덱 부분) · `AD-S3-8` · `AD-S3-23`
> - **승인 필요**: **10건** (§20.10) / **모순·보고**: **7건** (§20.9)

- **In Scope**: FR-07 · FR-08(FE — Web + Mock) · FR-20 · FR-22 · FR-23 + 홈 보조 요소(§7.4) + **BottomTabBar 첫 마운트**(#15 · D-02) + 알림 설정 진입(C-16) + NFR(카드 로딩 UX · **오프라인 캐시** · 접근성 · 로그 PII) + §13 예외 2건(증정 대기 · 책 소진) + 기술 요구사항(Shared UI 3종 · **C-17 에셋 파이프라인 실사용** · Stage 2 이월 정리)
- **Out of Scope**: **Stage 2-B(프로필 결과 · 발전 역량 — 디자이너 대기)**, 세션 생성·녹음·Prompt Drawer·출석 스티커, 회고·분석, Warm 추천·프로필 갱신, `/progress` 리포트 내용·주간 지표, 데이터 관리·탈퇴, **G-04 서재 확장(My Saved · 평점 · 읽기 계획)**, `apps/mobile`, Backend 전부
- **Deliverables**: `packages/contracts` Stage 3 도메인 schema 17개 파일 + 신규 enum 5종(26 → **31**) · `packages/ui` 3종 추가 + `ListRow` 확장(28 → **31**) · `apps/web` route **5개 추가** / feature 6 / entity 5 / Mock 도메인 4 · 책 표지 에셋 파이프라인
- **Acceptance Criteria**: **81건** (AC-3-01 ~ AC-3-81 — AC-3-80·81 은 D-8 승인으로 2026-10-02 추가)
- **Mock scenario**: **16 key** (§5.4 catalogue만, **신규 key 0**) · scenario 그룹 6개 추가 (6 → 12) · `activity-cards` `success` fixture 에 **Prompt 4개 이상 케이스** 포함 (D-21)
- **결정 상태**: **D-1 ~ D-22 22건 전건 승인 완료** (§16 — 2026-09-29 D-1·D-4·D-5·D-6 / 2026-10-01 D-2·D-3·D-7·D-13 / 2026-10-02 D-8~D-20 / **2026-10-03 D-21·D-22**). 권장안 채택 15건, **권장안 기각 4건**(D-4 Prompt 선택 전 노출 · D-5 카드별 역량 · D-8 Prompt 단계·페이지 태그 실제 구현 · D-17 시트 Mock route), **범위 축소 1건**(D-18 알림 설정 화면만 제외), **모순 해소 2건**(D-21 Prompt 개수 상한 해제 · D-22 `ActivityCard.targetCapability` 삭제). 정본은 `docs/decisions/stage-3-approvals.md`
- **C-13 Figma 누락 화면**: **8건** (§15.1, `C13-14` ~ `C13-21`) — **8건 전부 ② design-agent 명세로 결정**(approvals §4). `C13-19` 는 **D-18 로 Stage 3 이월 + 디자이너 Figma 요청** → **Stage 3 명세 대상 7건**
- **`BACKEND_INTEGRATION_PENDING` 예상**: **14건** (P3-BIP-01 ~ P3-BIP-14, §10 — P3-BIP-13·14 는 D-8 승인으로 2026-10-02 추가)
- **Blocking**: Plan 단계 없음 / **Design 단계 = C-13 8건 + D-1 · D-6 · D-4 · D-5** / **구현 단계 = D-13 · D-3 · D-2 · D-7**
- **신규 라이브러리**: **런타임 0건** (§16 D-19). **devDependency `sharp` 1건**(에셋 최적화 전용, Stage 1 `D-4` 승인 결정의 실행)
- **가값**: Stage 3가 **P-02의 첫 대량 실사용처**다. Stage 3 QA 후 P-02 · P-01 · P-04 · P-05 · P-16 · P-17 재제시 (§17.3)

---

## 20. Rev 4 — Home Figma 전수 재대조 반영 (2026-10-05)

> **입력 (정본 순서)**
> 1. ⛔ `CLAUDE.md` **"최우선 규칙 — Figma 를 그대로 구현한다"** (2026-10-05 신설). **이 Plan 의 다른 모든 항목보다 우선한다.**
> 2. `docs/decisions/stage-3-approvals.md` **§12 전체** (§12.1~§12.9) — **결정 정본**
> 3. `docs/design/stage-3-home-figma-audit.md` — design-agent 감사 + 2차 재실측(§10) + 구현 명세(§11~§15)
>
> **이 절의 성격**: Rev 3 본문을 **삭제하지 않고**, 무효가 된 항목에 **사유와 근거를 병기**해 추적 가능하게 한 뒤 여기에 집계한다. 본문 각 행에는 ⛔(무효) · ⏭(이월) · ✎(수정) · ✓(유효화) · ⭐(신규) 마커를 달았다.
> **발단 (approvals §12.1)**: `rules/workflow.md` 가 규정한 **design-agent 의 구현 후 Visual Gap 검토를 Orchestrator 가 건너뛰었다.** 테스트 통과와 AC 충족만 확인했고 **"Figma 와 같은가"를 아무도 보지 않았다.** 그래서 AC 를 다 통과한 구현이 Figma 와 크게 어긋났다 — **AC 설계 자체의 결함**이지 구현만의 문제가 아니다.

### 20.1 무효 처리 — 6건 (삭제하지 않고 사유 병기)

| 대상 | 처분 | 사유 | 근거 | 본문 위치 |
|---|---|---|---|---|
| **`AC-3-11`** | **폐기** | 파란 안내 카드가 **Figma 에 없어 삭제**되면서 "지난 날짜를 밝힌다"는 요구의 UI 근거가 사라졌다. 사용자가 요구 자체를 없애기로 결정. audit §14.3 의 R-1/R-2/R-3 중 **R-3** | approvals **§12.3 ①** · **§12.8** (사용자 2026-10-05) | §11.3 |
| **`AC-3-17`** | **무효** (살아남는 부분은 `AC-3-83`) | Figma 에 **확장 트리거(`Show all 5 prompts`)와 cutoff 가 없고** pill 이 **4~5개 전부 노출**된다. 명세가 만든 확장 트리거는 최우선 규칙 2 위반 | approvals **§12.4** · §12.9. Figma `163:2649`(4) · `86:438`(5) | §11.3 |
| **`AC-3-22` ~ `AC-3-26`** | **이월** (Stage 3 제외) | Reading Context **진입점이 Figma 카드 앞면에 없다.** 명세가 그 자리에 Figma 에 **없는** `Pick a time` 을 넣었고, 그 자리는 **`★ Save`** 다. 별도 디자인을 다음에 요청 | approvals **§12.3 ⑧** (사용자 2026-10-05) | §11.4 · §3.1 |
| **`D-14`** — Home 덱 `SwipeDeck` 재사용 **부분만** | **무효** | `163:2648` 실측 **365 + 14 + 14 = 393 = 뷰포트 폭 정확히 일치** → **1 카드 = 1 페이지 가로 scroll-snap**. 기존 "스택" 판단은 **이 산술을 검토하지 않아 틀렸다**. `SwipeDeck` 은 4개 전제가 충돌해 유지 불가 | approvals **§12.2** · §12.7 · audit §3.2 | §16 `D-14` |
| **`D-7`** — `★ Save` 제외 **부분만** · **`AD-S3-8`** | **무효** | Figma `I86:438;86:383;117:973` 에 `Button/White` **87×45 `★ Save`** 가 **실재**한다. "PRD 근거 없음"으로 뺀 것은 최우선 규칙 **3** 위반이고, 그 자리에 Figma 에 없는 `Pick a time` 을 넣은 것은 규칙 **2** 위반이다 | approvals **§12.2** · **§12.8 `A-9`** | §16 `D-7` · §3.1 · §7.1 |
| **`AD-S3-23`** · Design Spec **§12.5** (`86:482` = 별도 시트) | **무효** | `86:482` 는 **뒷면**이다. 컴포넌트 이름이 앞면과 **동일**하고, 시그니처에 **`flip?: "front"` variant**, 우상단 아이콘 에셋명이 **`flip_to_back`** 이다 — **추측이 아니라 Figma 데이터** | approvals **§12.2** · **§12.7** · audit §10.7 | §11.3 (`AC-3-16`) |

**무효가 *아닌* 것** (혼동 방지):

- **`D-21`**(Prompt 개수 상한 해제) — **유효**. `AC-3-17` 이 무효인 것은 **"확장 트리거" 부분**이고, contract 상한 없음·`slice` 금지는 `D-21` 소관이라 `AC-3-83` 으로 살린다.
- **`D-10`** — **유효**. 서버 `ActivityCard.date` 신뢰 / 클라이언트 재판정 금지는 유지되고 ③("화면이 그 날짜를 밝힌다")만 철회된다 → `AC-3-88`.
- **`D-7`** 의 평점(`averageRating`) · reading plan(`ReadingNowCard`) 제외 — **유효**.
- **`D-14`** 의 Shared UI 3종(`SectionHeader`·`Carousel`·`Toggle`) + `ListRow` 확장 · 제외 5종 선행 구현 금지 — **유효**.
- **`D-9`**(Context 미선택 진행 가능 여부) — 폐기가 아니라 **이월**. Reading Context 진입점과 함께 다음 라운드로 간다. contract(`readingContext`·`customTime`·`createCustomTimeRefine`)는 **삭제하지 않는다**.
- **헤더 칩 `2 this week`** — **유지**. Figma `26:40` 이 `12-day/115 Min` → `2week /115 Min` 으로 바뀌었어도 **누적 분(115 Min)이 달성률 언어**라 `D-6` 과 §8.4 비교·판정 금지 원칙을 지킨다. **Figma 불일치로 기록**한다 (approvals §12.3 · §12.7, 재확인 필요 = `A-23`).

### 20.2 수정 — 6건 + 유효화 1건

| AC | 수정 내용 (본문에 병기됨) |
|---|---|
| **`AC-3-06`** | **현재 320px FAIL** (카드가 탭바를 **16.8px** 덮는다 — audit M-01 Critical). 원인 = ActionBar 2행(102px). 해소안 = **`Save` 고정 87 + gap 8 + `Start Session` flex** 로 1행 유지 → 카드 하단 705 / 탭바 766 / **겹침 0**. **탭바 하단 16px**(신규 토큰 `--layout-tabbar-bottom-gap`, Figma 852−(766+70)) 포함해 재검증 |
| **`AC-3-10`** | "부모용 코칭 문장" 검증 지점 → **카드 뒷면 `86:482` beige 노트**(`A-17` ⓐ). 앞면에 코칭 문장 블록을 **추가하지 않는다** |
| **`AC-3-14`** | 덱 Skeleton → **가로 트랙 1장 + peek 8**. `empty`/`error`/`offline` 은 **트랙 높이 415 점유** |
| **`AC-3-16`** | Prompt 전체 + 코칭 문장 → **별도 Sheet 가 아니라 카드 뒷면(flip)** |
| **`AC-3-18`** | 이전/다음 **버튼 제거** → **가로 트랙 네이티브 키보드(←/→/Home/End)** 로 3장 도달. 가로 스크롤은 제스처 전용이 아니므로 **WCAG 2.5.1 충족** |
| **`AC-3-66`** | **기존 Home baseline 5장 전부 무효 → 재생성.** `s3-home` · `s3-home-deck` · **`s3-home-deck-back`**(신규) · **`s3-home-deck-scrolled`**(신규) · `s3-tabbar-bottom`. **`s3-home-deck-prompts-expanded` 폐기** |
| **`AC-3-19`** | ✓ **유효해진다** — flip 이 실제로 생겨 `prefers-reduced-motion` 요구가 의미를 갖는다. `reduce` = **전환 없이 즉시 교체 + 동작 유지** |

#### 신규 AC — `AC-3-82` ~ `AC-3-88` (총 **88건**; 이 중 무효 2 · 이월 5)

| AC | 요구사항 | 검증 방법 | 근거 | PENDING 예상 |
|---|---|---|---|---|
| ⭐ **AC-3-82** | `empty`(오늘 카드 없음)에서 **`EmptyState` 안내가 표시**되고 트랙 높이 415 를 점유해 레이아웃이 튀지 않는다. **지난 날짜 배너는 어떤 상태에서도 렌더되지 않는다** | 시나리오 테스트 + DOM 부재 검사 | `AC-3-11` 폐기 시 살아남는 부분 (approvals §12.8 · audit §14.3) · 공통 상태 화면 #22 | 아니오 |
| ⭐ **AC-3-83** | `promptPreview` · `promptSet.questions` 가 **상한 없이**(`.min(1)` 만) parse 되고, **4·5·10개 응답이 전부 통과**하며 **Frontend `slice` 흔적 0건**. 앞면이 Figma 대로 **전부 노출**한다(4~5개) | ① contracts 단위 테스트(4·5·10 통과 / 0 거부) ② `success` fixture 4개 이상 ③ `slice(` grep ④ 앞면 렌더 개수 = 응답 개수 | **`D-21`**(유효) + approvals §12.4. `AC-3-17` 에서 **확장 트리거 부분만 제거** | 아니오 |
| ⭐ **AC-3-84** | `★ Save` 를 누르면 **`PUT /v1/children/:childId/saved-books`** 가 **1회** 발생하고, **같은 책을 2회 저장하면 같은 응답(`savedAt` 포함)** 이 온다. **Idempotency-Key 헤더를 보내지 않는다**(PUT = 상태 설정) | Mock 요청 로그 + replay 테스트 | `A-9` · `API_CONTRACTS.md` §3.7.3 | Frontend 부분 아니오 / 서버 보장 = **`P3-BIP-15`** |
| ⭐ **AC-3-85** | 저장 실패(`error`) · 오프라인에서 **낙관적 표시가 되돌려지고** 사용자에게 상태가 알려지며, **재시도 경로**가 있다. 저장 요청이 **큐에 쌓여 중복 발사되지 않는다** | `error`·`retry`·`offline` 시나리오 e2e | rules/frontend §7 · §5.3 오프라인 | 아니오 |
| ⭐ **AC-3-86** | 저장 대상이 **현재 보이는 옵션의 책**이다 — 카탈로그 책은 `bookId`, 보호자 직접 입력 옵션은 `title`(+`author?`). 요청 body 가 **화면에 보이는 책과 일치**한다(스냅 위치가 바뀌면 대상도 바뀐다) | 요청 로그 + 트랙 스냅 e2e | `API_CONTRACTS.md` §3.7.2 | 아니오. ⚠️ `conversation_only` 는 **`G-12` 결정 전 검증 불가** |
| ⭐ **AC-3-87** | 가로 트랙이 **1 카드 = 1 페이지 스냅**이고 공식 `pad 14 + 카드 + gap 6 + peek 8 = W` 가 **320(카드 292) · 393(카드 **365**, Figma 정확 일치) · ≥600(카드 452)** 에서 성립한다. **peek 8 이 전 구간 불변**이고 좌우 이동 **버튼이 존재하지 않는다** | Playwright 3폭 측정 + 버튼 DOM 부재 검사 | approvals §12.7 트랙 공식 · audit §11.3·§11.6·§11.7 | 아니오 |
| ⭐ **AC-3-88** | 화면이 **서버 `ActivityCard.date` 를 그대로 신뢰**하고 클라이언트가 날짜를 **재판정하지 않는다**(기기 날짜 비교 분기 0건). 날짜 문자열을 **화면에 표시하지 않는다** | grep + 코드 검사 | **`D-10`** 유지분 (③ 철회 — approvals §12.8) | 서버 timezone 소유 = `P3-BIP-01` |

> **요구사항 ID 매핑 갱신**: FR-07 → AC-3-09·10·12~16·19~21 + **82·83·87·88** / FR-08 → ~~22~26~~(이월) · 39~45 / FR-20 확장(`★ Save`, Figma 우선 + 사용자 결정) → **84·85·86** / 무효 = `AC-3-11`·`AC-3-17`.

### 20.3 `★ Save` contract — 설계 결론 (`A-9`)

전문은 **`docs/API_CONTRACTS.md` §3.7** (3.7.1 데이터 판정 · 3.7.2 저장 대상 · 3.7.3 schema·멱등 · 3.7.4 초기 상태). 요약:

| 질문 | 결론 | 라벨 |
|---|---|---|
| 온보딩 `favoriteBooks` 와 **같은 데이터인가** | **다르다. 재사용하지 않는다.** ① Home Save 가 `favoriteBooks` 를 쓰면 **제출 완료된 설문 스냅샷을 사후 수정**한다(cold-start state vector 출처 훼손, 온보딩 응답 수정은 Stage 6) ② **상한 5**(`FAVORITE_BOOKS_MAX`, PRD §7.2 Step 3)에 걸려 6권째 Save 가 `VALIDATION_FAILED` 가 되는데 **그 상한을 알리는 UI 가 Figma 에 없다** ③ "이미 좋아하는 책"(과거)과 "저장해 둔 추천"(의도)은 추천 엔진이 **다르게 소비해야 하는 신호**다 ④ `child_books.source` 에 이미 **`onboarding_favorite`** 값이 있다 = 온보딩 favorites 는 **서재로 파생되는 입력**이라는 설계가 이미 있다 | **RECOMMENDED — 승인 필요** |
| 그러면 어디에 저장하나 | **`child_books` 에 `saved`·`saved_at` 축을 추가**한다. **새 테이블 없음.** `ownership`(`owned`·`gifted`·`gift_pending`·`favorite_only`)에 값을 더하지 **않는다** — 보유 책도 저장될 수 있어 **두 축이 독립**이고 `favorite_only` 재사용은 설문 응답과 보호자 저장을 다시 섞는다 | **RECOMMENDED** |
| **무엇을 저장하는가** | **선택된 옵션의 *책*** (카드가 아니다). 근거: ① 같은 ActionBar 가 Library 시트 `163:2347` · Book Select `145:1085` 에도 쓰이고 그 화면들은 **책 1권**을 다룬다 ② 저장 결과 표면 `145:1157` 이 **"My Saved" = 책 목록**이다 ③ 카드/옵션을 저장하면 `activity_card_options` 를 가리키는 **새 도메인**이 필요하고, 카드는 **하루 단위로 사라지는 자원**(`UNIQUE(child_id, card_date)`)이라 저장 항목이 만료된다 — **그 만료 UX 가 Figma 에 없다** | **RECOMMENDED** |
| 상한 | **없다.** Figma `Save` 버튼에 카운터·상한 표시·상한 안내가 **없다** (최우선 규칙 2) | **RECOMMENDED** |
| 멱등성·중복 저장 | `PUT /v1/children/:childId/saved-books` = **자원 상태 설정** → 같은 책 재저장은 **같은 응답·같은 `savedAt`**, **오류 아님**. `POST` 가 아니므로 **Idempotency-Key 를 요구하지 않는다** (`POST …/library/books`·`POST …/gift-requests` 와 다르다) | **RECOMMENDED** |
| 해제(토글) | **contract 는 양방향 지원**(`PUT` + `DELETE …/saved-books/:bookId`). **Home 버튼이 토글인지는 Figma 근거가 없다** — `117:973` `Button/White` 에 saved(채움) 변형이 **없다** → **`G-13` NEEDS DECISION**. ⚠️ 어느 안이든 **해제 경로가 Library 라운드에 있어야 한다** — 저장만 있고 해제가 없으면 보호자가 자기 데이터를 되돌릴 수 없다 | **NEEDS DECISION** |
| 신규 Error Code | **0건.** `RESOURCE_NOT_FOUND`(없는 `bookId`) · `VALIDATION_FAILED` 로 충분하다. 중복은 멱등 성공, 상한은 없음 → Stage 1 **28종 유지**(`AC-3-59` 그대로) | **CONFIRMED (원칙)** / 매핑 RECOMMENDED |
| enum delta | `BookSource` += **`card_save`**(Save 로 행이 처음 생기는 경로 — FR-23 의 `library_add` 와 구분), `LibraryFilter` += **`saved`**("My Saved" 표면). ~~`onboarding_home_list`~~ 는 **제거**(온보딩 `homeBooks` 삭제 — approvals §11.9). **`AC-3-56` 의 "enum 5종 / 총 31종"이 재계산 대상이다** | **RECOMMENDED** |
| `BookSummary` 확장 | **금지** — Stage 2 `BookSummary` 불변 원칙(`AC-3-55`). 저장 상태는 `LibraryBook`(또는 `G-14` ⓑ 채택 시 `ActivityCardOption`)에 둔다 | **CONFIRMED** |

**아이콘 (audit §12 `A-9` 별건, 미결)**: Figma 글리프는 **14×13**. `lucide star`(획 두께·크기 다름) vs Figma SVG export → **design-agent 판단 대상** (Stage 0 #21: 일반=Lucide / HARU 전용=Figma SVG).

### 20.4 PRD 수정 대상 8·9·10 — 등재 (§18 ⑨ 로 통합)

`stage-3-approvals.md` §5(1~3) · §6.2(4) · §9.3(5~7) 에 이어 **§12.5 의 8·9·10** 을 §18 ⑨ 에 등재했다 (총 **10건**).

| # | PRD 위치 | 현재 | 확정 동작 | 근거 |
|---|---|---|---|---|
| **8** | **§7.9** | 카드 덱 **"좌우 스와이프"** | **가로 스크롤(scroll-snap)** — 1 카드 = 1 페이지 | Figma `163:2648` 실측 (365+14+14=393) |
| **9** | **FR-07 · §7.4** | Prompt **2~3개** 제시 | **4~5개 전부 노출**(확장 트리거 없음) | Figma `163:2649`(4) · `86:438`(5) |
| **10** | **§7.4** | — | **카드 뒷면**(우상단 아이콘 → flip)에 Prompt 전체 + 코칭 노트 | Figma `86:482` + `flip?: "front"` variant · `flip_to_back` 아이콘 |

- ⚠️ **9 는 4·6 과 같은 문장(FR-07·§8.2 "2~3개")을 다룬다** — PRD 적용 시 **한 번에** 반영해야 하며, 따로 적용하면 서로를 덮어쓴다.
- ⚠️ 적용 절차는 **`D-24`** = **OneDrive 원본 + 저장소 사본 동시 수정**. **plan-agent 는 `docs/source/**` 를 수정하지 않는다** (지시·금지 사항). **목록만 만들었다.**

### 20.5 `BACKEND_INTEGRATION_PENDING` 변화

| 변화 | 항목 | 내용 |
|---|---|---|
| **신규 1건** | ⭐ **`P3-BIP-15`** | **책 저장 상태의 서버 소유** — `saved`·`saved_at` 생성·멱등 보장, `LibraryFilter=saved` 조회, `source=card_save` 기록, 전체 삭제(FR-21) 포함. 저장이 **추천 신호로 쓰일지는 Backend·제품 결정**이며 **Frontend 는 기대하지 않는다**. Handoff = `BACKEND_HANDOFF.md`·`DATA_REQUIREMENTS.md` |
| **무효 0건** | — | **무효가 된 PENDING 은 없다.** Reading Context 이월도 PENDING 을 줄이지 않는다 — `readingContext` 는 contract 에 남고 서버가 소비한다 |
| **범위 변경 2건** | `P3-BIP-01` | Frontend 판정 AC 가 ~~`AC-3-11`~~ → **`AC-3-82`**(= `empty` 안내) · `AC-3-12` · **`AC-3-88`**(서버 `date` 신뢰) 로 교체. **대기 사유(07:00 생성 잡 · `UNIQUE(child_id, card_date)` · caregiver timezone)는 그대로** |
| | `P3-BIP-03` | Frontend 판정 AC 가 ~~`AC-3-17`~~ → **`AC-3-83`** 으로 교체. **"확장 도달" 기대 삭제** — Figma 는 전부 노출이다. "책별 최소 6개 · 제시 2~3개 = Backend 생성 정책"은 그대로 |
| **참고** | `P3-BIP-10` | `G-14` ⓑ(`ActivityCardOption.saved` 추가)를 채택하면 카드 응답에 **서재 조인**이 생겨 **2초 NFR** 에 영향이 간다 → ⓐ 권장 사유 중 하나 |

**→ Stage 3 PENDING 총 15건** (`P3-BIP-01` ~ `P3-BIP-15`).

### 20.6 Mock 시나리오 영향

| # | 영향 | 조치 |
|---|---|---|
| ① | **`fixtures/activity-cards.ts` 의 `date` 가 `2026-01-01` 고정**이라 항상 `stale` 이 된다 | **주입 clock 기준 "오늘" fixture 로 교체.** 배너 삭제와 **무관하게 필요**한 수정이다 (audit §11.11) |
| ② | 덱 Skeleton 형태 | `loading` = **가로 1장 + peek 8**. `empty`/`error`/`offline` = **트랙 높이 415 점유** |
| ③ | 지난 카드(`stale`) 안내 시나리오 | **없어진다** (`AC-3-11` 폐기). `empty` 는 **유지** (`AC-3-82`) |
| ④ | Reading Context 이월 | `POST …/selection` 의 **`readingContext` 입력 경로가 화면에서 사라진다.** Mock·contract 는 **그대로 두고** 단위·contract 테스트로만 검증한다 (화면 e2e 대상에서 제외) |
| ⑤ | **신규 key `book-saved` 1건** | `library`(saved-books) 그룹. **`API_CONTRACTS.md` §5.4 catalogue(단일 기준)에 먼저 등재했다** — 임의 key 가 아니다. §8.2 **총 16 → 17 key** |
| ⑥ | `success` fixture 의 Prompt 개수 | **4개 이상 유지** (`D-21`·`AC-3-83`). 단 **앞면이 전부 노출**하므로 "접힘 3 + 확장" 전제의 테스트는 폐기 |
| ⑦ | baseline | **Home baseline 5장 전부 재생성** + 신규 2장 (`s3-home-deck-back` · `s3-home-deck-scrolled`), `s3-home-deck-prompts-expanded` 폐기 |

### 20.7 Stage 3 나머지(Library 이후) 범위에 미치는 영향

| # | 영향 | 비고 |
|---|---|---|
| ① | ⭐ **favorites 가 Library 화면에 나타나야 한다** — Figma `145:1157` **"My Saved"**. Home 에서 저장한 책을 **보고·해제할 수 있는 표면**이 Library 라운드의 **필수 항목**이 된다 (`LibraryFilter=saved`) | 사용자 결정: *"저장 결과를 보는 Library 화면은 다음 차례"* (approvals §12.8). ⚠️ **해제 경로가 없으면 보호자가 자기 데이터를 되돌릴 수 없다** |
| ② | **`D-7` 재검토 범위가 Library 전체로 번진다** — Library `30:74` · 시트 `163:1669` · Book Select `145:1132` 의 **`★ Save` ActionBar 는 Home 과 같은 컴포넌트**다. `AD-S3-6`·`AD-S3-7`(평점·`ReadingNowCard`)은 유효하지만, **`AD-S3-8`(Save 미렌더)은 세 화면 모두에서 무효**다 | Design Spec 갱신 = **design-agent 소관** |
| ③ | **Library 도 Figma 전수 재대조 대상이다** — Home 에서 **사용자 지적 8건 + 추가 불일치 21건**이 나왔고, Library·Book Select 는 **같은 명세 패스에서 작성**되었다. 재대조 없이 구현하면 같은 재작업이 반복된다 | **RECOMMENDED — Library 구현 착수 전 design-agent Figma 대조 선행** |
| ④ | **`Carousel` 컴포넌트가 두 용도를 떠안는다** — Library 책장(다건 브라우징) + Home 트랙(1 카드 = 1 페이지 page 모드). audit §11.10 은 `Carousel` page 모드 확장을 권장하고 신규 1종도 선택지로 둔다 | **design-agent 확정 필요.** `D-14` 가 경계를 그었던 "스택 ↔ 캐러셀" 구분이 사라졌다 |
| ⑤ | **Reading Context 가 이월되어 세션 시작 경로가 Library 쪽만 남는다** — `145:1132`·`163:1669` 의 "Start Session" 은 **Context 선택이 없다**(M-32). `D-9`(미선택 진행 가능 여부)가 이월되면 **Library 의 Start Session 규칙도 함께 미결**이 된다 | **보고 항목** — Stage 4 경계(`D-3`)와 함께 재확인 필요 |
| ⑥ | **`AC-3-56` enum 총수 재계산** — `BookSource` 값 변경(+`card_save`, −`onboarding_home_list`) · `LibraryFilter` +`saved` | 숫자(31종)는 Library 라운드 구현 시점에 확정 |
| ⑦ | **`AC-3-66` 의 서재·시트·책 상세 baseline 은 그대로** 유효하다 (무효는 Home 5장) | — |

### 20.8 design-agent 에게 넘길 항목 (§15 에 추가)

| # | 항목 | 비고 |
|---|---|---|
| ① | **`★ Save` 버튼 명세** — `Button/White` 87×45 고정 + `Start Session` flex(1행 유지), 아이콘 14×13 (`lucide star` vs Figma SVG export), 저장 성공·실패·(토글 채택 시) saved 상태 | `G-13` 결정 후 |
| ② | **가로 트랙 컴포넌트 선택** — `Carousel` page 모드 확장 vs 신규 1종 | audit §11.10 권장 ⓐ |
| ③ | **카드 뒷면 명세** — `86:482` beige 노트(코칭 문장) · 뒷면 pill n>3 처리(`A-5`, Figma 근거 없음) · flip 높이 377↔415 (audit §11.5) | `A-5` 승인 필요 |
| ④ | **`conversation_only` 카드의 ActionBar** — Figma 에 변형이 없다 (`G-12`) | 사용자 결정 선행 |
| ⑤ | **Library·시트·Book Select 의 `★ Save`** — `AD-S3-8` 무효 반영 | §20.7 ② |
| ⑥ | **Figma raw 값 흡수 정책** (`A-20`) — 최우선 규칙(정확히) ↔ Stage 0 #10(스케일 흡수) 충돌. `DESIGN_TOKEN_MAP.md:316` 이 카드 padding 을 "16·18·20 → 16·20" 으로 흡수했는데 **Figma 실측은 18** 이다 | **흡수 규칙 재검토 대상** |
| ⑦ | **Library 전수 Figma 재대조** | §20.7 ③ |

### 20.9 모순·보고 항목 (고치지 않고 기록)

| # | 모순 | 양쪽 내용 | 처리 |
|---|---|---|---|
| ① | **PRD 사본 수정 방침** | §18 ⑨ (Rev 3) = *"사본이므로 저장소에서 고치지 않는다 — OneDrive 갱신 후 사본 교체"* ↔ **`D-24`**(approvals §11.1·§11.6) = **원본·사본 동시 수정** | `D-24` 가 **나중 결정이므로 우선**. §18 ⑨ 서술을 `D-24` 기준으로 갱신했다 |
| ② | **`AC-3-18` 과 `D-14` 의 "버튼·키보드 대체 조작"** | `D-14` 승인 근거가 *"`SwipeDeck` 은 버튼/키보드 대체 조작으로 이미 검증"* ↔ approvals §12.3 = **버튼 제거** | `D-14` 의 **Home 덱 부분이 무효**이므로 충돌이 해소된다. 다만 `SwipeDeck` **자체는 Stage 2 에서 계속 쓰인다** — 제거하지 않는다 |
| ③ | **§1 Goal 2번 문장** | *"스와이프와 **버튼·키보드 대체 조작**으로 전 카드에 도달"* — Rev 4 와 어긋난다 | **Goal 본문은 고치지 않았다** (승인된 문안). §20.2 `AC-3-18` 이 정본이다. **보고 항목** |
| ④ | **§1 Goal 3번 · §7.1 `promptPreview` 주석** | *"접힌 상태 표시 3개 + 확장 도달"*(N-2) ↔ Figma = **4~5개 전부 노출** | **`N-2` 의 "표시 3개 + 확장" 규격이 Figma 와 충돌한다.** approvals §12.4 는 확장 트리거 제거만 결정했고 **`N-2` 자체의 무효 여부는 결정되지 않았다** → **NEEDS DECISION**. 현재 Plan 은 Figma(전부 노출)를 따른다 |
| ⑤ | **`A-23` 헤더 칩** | approvals §12.3 = `2 this week` 유지(Figma 불일치 기록) ↔ §12.7 = Figma 가 `2week /115 Min` 로 바뀌어 *"현행 유지 결정을 그대로 둘지 재확인 필요"* | **미결.** 최우선 규칙과 `D-6`·§8.4(비교·달성률 언어 금지)가 **정면 충돌**하는 유일한 지점이다 → **사용자 재확인 필요** |
| ⑥ | **`AC-3-02` Out of Scope 검사** | *"`S3-R13` — G-04 요소가 '있어 보여서' 구현되는 것을 AC-3-02 로 막는다"* ↔ 이제 **`★ Save` 는 In Scope** | `AC-3-02`·`S3-R13` 의 G-04 항목에서 **"My Saved" 만 제외**해야 한다. 평점·reading plan 은 그대로 금지 — **development-agent·QA 혼동 방지용 보고 항목** |
| ⑦ | **`DESIGN_TOKEN_MAP.md:316`** | spacing 흡수 규칙이 "16·18·20 → 16·20" ↔ Figma 카드 padding 실측 **18** | **흡수 규칙 재검토 대상**(`A-20`) — design-agent 소관 |

### 20.10 승인 필요 항목 (Rev 4)

| # | 항목 | 라벨 |
|---|---|---|
| 1 | **`★ Save` 를 온보딩 `favoriteBooks` 와 분리**하고 `child_books` 에 `saved` 축을 둔다 (§20.3) | **RECOMMENDED** |
| 2 | 저장 경로 `PUT/DELETE /v1/children/:childId/saved-books` · **IK 불필요** · 상한 없음 · 신규 error code 0건 | **RECOMMENDED** |
| 3 | `BookSource` += `card_save` / −`onboarding_home_list`, `LibraryFilter` += `saved` | **RECOMMENDED** |
| 4 | **`G-12`** `conversation_only` 카드의 Save 대상 (비활성 / 미렌더) | **NEEDS DECISION** |
| 5 | **`G-13`** Home 버튼이 토글인가 (1방향 + Library 해제 / 양방향) | **NEEDS DECISION** |
| 6 | **`G-14`** 저장 여부 초기 표시 (ⓐ 미반영 권장 / ⓑ `ActivityCardOption.saved`) | **NEEDS DECISION** |
| 7 | **`A-23`** 헤더 칩 `2 this week` 유지 재확인 (최우선 규칙 ↔ `D-6`·§8.4) | **NEEDS DECISION** |
| 8 | **`N-2`**("표시 3개 + 확장")의 무효 여부 — Figma 는 전부 노출 (§20.9 ④) | **NEEDS DECISION** |
| 9 | **`A-5`** 뒷면 pill n>3 (Figma 근거 없음) · **`A-11`** Prompt n>5 · **`A-3`** gap 6 vs 10 · **`A-19`**·**`A-20`**·**`A-22`**·**`A-24`** | **NEEDS DECISION** (audit §13) |
| 10 | **Library 구현 착수 전 Figma 전수 재대조** 선행 (§20.7 ③) | **RECOMMENDED** |
