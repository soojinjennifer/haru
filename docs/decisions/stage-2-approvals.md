# Stage 2 Approval Log

Stage 2 (Auth · Consent · Onboarding · Child Profile · Home 골격) 진행 중 사용자가 내린 결정을 기록한다.
Plan: `docs/plans/stage-2-plan.md` · 규칙: `.claude/rules/workflow.md` §3

## 1. Stage 2 착수 승인

**2026-09-23, user** — Stage 1 Verdict `PASS (accepted: D-01, S1-G-2)` 이후 Stage 2 착수를 승인했다 (Major Stage 승인 게이트, rules/workflow §4).

## 2. C-13 — Figma 누락 화면 13건 처리 방식 (2026-09-23, user)

`.claude/rules/workflow.md` §3 · Stage 0 C-13 에 따라 화면별로 ① 디자이너 Figma 요청 ② design-agent 명세 중 선택받았다. Plan §15.1 의 우선순위 그룹 단위로 제시했다.

| 그룹 | ID | 화면 | 결정 |
|---|---|---|---|
| 1차 | `C13-02` | 보호자 동의 5항목 | **② design-agent 명세** |
| 1차 | `C13-03` | VPC 단계 슬롯 (pending / failed / 재시도) | **② design-agent 명세** |
| 1차 | `C13-12` | 설정 목록 (로그아웃 1행) | **② design-agent 명세** |
| 1차 | `C13-13` | Home skeleton 본문 EmptyState | **② design-agent 명세** |
| 2차 | `C13-04` | 온보딩 Step 1 누락 필드 (관계·언어 환경·독서 루틴) | **② design-agent 명세** |
| 2차 | `C13-05` | 온보딩 Step 2 기질 카드 | **② design-agent 명세** |
| 2차 | `C13-06` | 온보딩 Step 3 책 검색·집 책·주제 태그 | **② design-agent 명세** |
| 2차 | `C13-07` | 온보딩 Step 4 성장 목표 | **② design-agent 명세** |
| 2차 | `C13-08` | Step 5 비채점 6번째 옵션 시각 구분 | **② design-agent 명세** |
| **3차** | **`C13-09`** | **프로필 결과** (다이아몬드 차트 · 강점/growing edge · 페르소나 · "판정 아님" 안내 · null 축) | **① 디자이너 Figma 요청** |
| **3차** | **`C13-10`** | **발전 역량 제시 + 축 탭 변경** | **① 디자이너 Figma 요청** |
| 4차 | `C13-01` | 비밀번호 재설정 (요청 · 발송 안내 · 링크 만료 · 새 비밀번호) | **② design-agent 명세** |
| 4차 | `C13-11` | Trial 가입 유도 (기기 변경 draft 유실 안내) | **② design-agent 명세** |

**결과: design-agent 명세 11건 · 디자이너 Figma 요청 2건.**

3차 그룹을 디자이너에게 맡긴 이유: 다이아몬드 차트·페르소나 카드는 기존 Shared UI 22종 조합으로 도출되지 않는 HARU 고유 시각 자산이고, "진단이 아니라 관찰"이라는 서비스 성격이 가장 직접 드러나는 화면이라 문구 톤과 시각 표현에 디자이너 판단이 필요하다.

## 3. Stage 2 / Stage 2-B 분리 (2026-09-23, user)

C13-09·10 은 온보딩의 **종착점**이다 (Step 5 완료 → 프로필 결과 → 발전 역량 선택 → Home). 디자이너 대기로 두면 온보딩 플로우가 끝까지 이어지지 않으므로 범위를 나눈다.

| 구분 | 범위 | 상태 |
|---|---|---|
| **Stage 2** | C-13 11건 + Figma 근거가 있는 화면 전부 — Auth · 동의 · VPC · 온보딩 Step 1~5 · 설정 · Home skeleton · Route Guard(프로필 결과 단계 제외) · contracts · Mock | **진행** |
| **Stage 2-B** | `C13-09` 프로필 결과 · `C13-10` 발전 역량 제시 + Route Guard 의 "프로필 결과 확인" 단계 연결 | **디자이너 Figma 도착 후** |

- Stage 2 는 이 분리를 전제로 AC 를 조정하고, **깨끗한 `PASS`** 를 받을 수 있어야 한다. C13-09·10 에만 의존하는 AC 는 Stage 2-B 로 이관한다.
- Plan §16 의 **`D-2`**(역량 점수 `null` 표시 규칙) · **`D-6`**(프로필 결과 Guard 단계)은 두 화면에 직접 묶이므로 **Stage 2-B 결정 항목으로 이관**한다.
- 디자이너 작업과 Stage 2 구현이 **병렬로** 진행된다.

### 3.1 사용자 요청 — 디자이너 요청서
> "11건 진행 후 디자인 되어야 하는 화면을 명확히 하여 나에게 알려줘"

design-agent 가 Stage 2 Design Spec 과 함께 **C13-09·10 디자이너 요청서**를 작성한다. 디자이너가 추가 질문 없이 착수할 수 있는 수준이어야 한다 — 화면별 목적·필수 요소·상태·데이터 형태·사용할 토큰·제약(진단 표현 금지 등)·산출물 형식.

---

## 4. Plan §16 세부 결정 D-1 ~ D-17 (2026-09-24, user)

승인 체크포인트에서 5라운드에 걸쳐 항목별로 받았다. **17건 전부 승인**이며, 그중 2건은 design-agent 이견을 채택했다.

| ID | 결정 | 비고 |
|---|---|---|
| **D-1** | `ChildInfoAnswers.lastName` **선택(optional)** | 두 칸 UI 는 유지(D-03). 법무 L-07 이 "수집 불가"로 결론나도 되돌릴 데이터가 없다 |
| **D-2** ★ | 권장안 승인 — `score: null` 유지 · 다이아몬드는 **미관찰**로 표현 · 강점/growing edge 후보 제외 · 발전 역량 기본값 후보 제외 | 시각 표현(②)만 **Stage 2-B**. 나머지는 Stage 2 contracts 에 반영 |
| **D-3** | 권장안 승인 — `localStorage` · 보관 **30일** · 삭제 5시점 | |
| **D-4** | **외부 링크**(`target="_blank" rel="noopener noreferrer"`), `/legal/*` 미생성 | **§4.1 추적 조건 필수** |
| **D-5** | 순수 함수 `resolveGuardDecision(me, pathname)` 분리 | 판정 순서 전수 테스트 가능(AC-2-42) |
| **D-6** ★ | Guard 판정에서 **제외**, 제출 직후는 연속 네비게이션 | `Me` 에 확인 플래그를 추가하지 않는다 → Backend 요구 증가 없음 |
| **D-7** | 로그아웃 **`ConfirmDialog` 사용** | 비가역 로컬 draft 삭제를 동반하므로 |
| **D-8** | 신규 Shared UI **6종만** | `PasswordToggle` 은 TextField `trailingAction` 으로 흡수. design-agent 가 16화면 명세 후 6종으로 충분함을 확인 |
| **D-9** | **design-agent 안 채택** — CSS `scroll-snap` **미사용**, Pointer Events + `transform` | `overflow-x: auto` 가 `AppColumn` 안에 생기면 2026-09-23 수정한 그림자 클리핑이 재발한다. 버튼·키보드는 1급 경로 |
| **D-10** | 권장안 승인 — 년·월 2단 `SelectTrigger` + contracts `createBirthYearMonthSchema(now)` 팩토리 | Figma `179:1740` 과의 차이는 허용 차이 등록 |
| **D-11** | 권장안 승인 — 로컬 debounce **400ms** / 서버는 step 이동 시 **1회** | |
| **D-12** | 권장안 승인 — baseline **2종 분리**: 영역 클립 `0.002 / 20`, 전체 프레임 `0.002 / 200` | Stage 1 `S1-D2-6` 의 한계 해소 |
| **D-13** | 권장안 승인 — `AppShell` 이 스크롤 컨테이너 ref 를 context 로 제공, `useScrolledPast` 가 그것을 구독 | 컨테이너 없으면 `window` 폴백 |
| **D-14** | **밑줄 제거**(Figma `76:417` 일치) + **신규 가값 `P-17`** 등록 | stage-1-approvals §9.0 일반 원칙 적용 |
| **D-15** | **Apple 공식 버튼 규격 우선** + 충돌 시 허용 차이 등록 | 신규 런타임 의존 0건 유지. 브랜드 에셋은 `packages/ui/src/icon/brand/` 에 수정 금지 주석과 함께 |
| **D-16** | 권장안 승인 — 관계·타임존은 `PATCH /v1/me` 로 별도 전송 | 보호자 정보와 아동 데이터를 섞지 않아야 AC-2-13 검증이 깨끗하다 |
| **D-17** | **최소 범위만 Stage 2** — `GET /v1/books/search` + `BookSummarySchema` + `books` Mock. 서재·소유·증정·프롬프트는 Stage 3 | 검색 결과 없음 → **제목 직접 입력** 경로 필수 |

★ = 구현 착수 전 필수였던 항목.

### 4.1 D-4 후속 — 약관·개인정보방침 본문 추적 (사용자 지시)

> "만들어 올려야 하는 시점에 알려줘서 놓치지 않게 해줘"

외부 링크로 두면 Mock 단계에서는 가짜 URL 이 들어가고, **실제 사용자가 동의 화면을 만나기 전까지 아무도 눈치채지 못한다.** 세 곳에 건다:

1. **`docs/workflow/WORKFLOW_STATE.md` §3 미결 항목** — 상시 노출
2. **Stage 8 `BACKEND_HANDOFF.md`** — "출시 전 차단 항목(launch blocker)"으로 명시. 법무 L-02 와 연결
3. **Mock fixture** — `ConsentDocument.url` 을 **누가 봐도 가짜임이 드러나는 형태**로 두고, stage-qa-agent 가 "실제 문서 URL 아님"을 확인 항목으로 판정

## 5. 문서 불일치 해소 (2026-09-24, user)

| 항목 | 결정 |
|---|---|
| 온보딩 화면 Layout — Plan §9.1 `Fullscreen` ↔ design-agent `StackLayout` | **`StackLayout` 채택.** `Fullscreen` 은 `overflow: hidden` 이라 200% 텍스트 확대(AC-2-59) · 모바일 키보드 열림 · 동의 5행이 잘린다 |
| Stage 2 route 수 15 ↔ 14 | **14.** `/onboarding/profile` · `/onboarding/growth-capability` 가 Stage 2-B 로 빠진 결과이며 별도 결정이 아니다 |

## 6. 디자이너 수정 요청 3건 (2026-09-24, user)

**결정: 구현은 진행하고 요청 목록은 디자이너에게 전달한다.**

| # | 발견 | 구현 처리 | 디자이너 전달 |
|---|---|---|---|
| ① | `179:1775`(Step 5 forward)가 프레임을 **17px 벗어남** (x=410 > 393) | gutter 24 정렬로 구현 (`AD-S2-9`) | 좌표 수정 요청 |
| ② | `179:1763` "About 3 minutes · 10 cards" / `179:1767` "Swipe each card away" 가 **5단계 소개 화면인데 Step 5 만 설명** | **구현 보류 — copy 결정 필요** | 문구 교체 요청 (숫자는 기획 결정) |
| ③ | Step 5 옵션 행 **43px** — 터치 타깃 44 미달 | 44 로 구현 | 규격 확인 요청 |

②는 문구가 정해지기 전까지 해당 화면의 안내 문구를 확정할 수 없다. development-agent 는 copy 모듈에 **플레이스홀더가 아니라 빈 슬롯**으로 두고 보고한다.
