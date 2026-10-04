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

---

## 7. Plan · Design Spec 승인 (2026-09-25, user)

> "커밋해주고, 구현을 시작해줘"

`rules/workflow.md` §3 의 승인 체크포인트를 통과했다. §4~§6 의 세부 결정 21건이 모두 확정된 상태에서 사용자가 구현 착수를 지시했다.

- `docs/plans/stage-2-plan.md` → `APPROVED (2026-09-25, user)`
- `docs/design/stage-2-design-spec.md` → `APPROVED (2026-09-25, user)`
- `docs/design/stage-2-designer-request.md` — 디자이너 전달용, 승인 대상 아님

**Stage 2-B(`C13-09` · `C13-10`)는 이 승인에 포함되지 않는다.** 디자이너 Figma 도착 후 별도 절차를 따른다.

---

## 8. 2026-09-26 온보딩 내용 결정 (D-A · D-B · D-C)

`2-CONTRACTS` 가 올린 3건. 전부 **제품 내용 결정**이라 구현이 정할 수 없었던 항목이다.

| ID | 결정 |
|---|---|
| **D-A** | **`docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` 의 온보딩 질문을 참고해 선택지·문항을 구성한다.** contracts 가 넣어둔 권장 최소 목록을 그 문서 기준으로 교체한다. **단, 문구와 질문을 나중에 바꿔도 문제가 없는 구조**여야 한다 |
| **D-B** | **성장 목표(Step 4)에 4대 역량과 같은 목록을 사용한다** |
| **D-C** | **현재 기준 유지** — Step 1 의 이름·생년월·성별(미응답 허용)·~~언어환경~~만 필수, Step 2~4 전부 선택, Step 5 는 문항별 "관찰한 적 없음" 허용. ⚠️ **언어환경 필수는 2026-10-04 사용자 결정으로 해제**됐다 — **선택 사항 + 기본값 영어** (`stage-3-approvals.md` §11.22). `S2-ONB-1`(Q1·Q2·Q4 필수)은 영향 없음(언어는 질문지 문항이 아니라 Step 1 프로필 필드) |

### 8.1 D-A — 교체 가능 구조 요구사항 (사용자 명시)

> "문구와 질문을 나중에 변경해도 문제가 없도록 구성해줘"

이는 단순 지시가 아니라 **구조 제약**이다. 다음을 만족해야 한다.

1. **코드(machine key)와 표시 문구를 분리**한다. 코드는 `packages/contracts` 가, 문구는 `apps/web` 의 feature copy 모듈이 소유한다. 저장되는 값은 코드이며 문구가 바뀌어도 기존 응답이 무효가 되지 않는다
2. **문항 목록·순서·개수를 코드에 흩지 않는다.** 한 곳(정의 모듈)에서 읽어 화면이 렌더한다. 문항이 늘거나 줄어도 화면 코드를 고치지 않는다
3. **설문 문항은 Mock 이 `instrument` 형태로 내려준다** — 화면이 문항을 하드코딩하지 않는다. 향후 Backend 가 같은 계약으로 문항을 교체할 수 있어야 한다 (`P2-BIP-06` instrument 버전 관리와 연결)
4. 문항·선택지가 바뀌었을 때 **기존 응답과의 호환**을 어떻게 다룰지는 Backend 요구사항으로 기록한다(instrument 버전). Frontend 는 버전을 응답에 담아 보내기만 한다

### 8.2 D-B — 반영 시 주의 (구현·design·QA 공통)

성장 목표가 4대 역량과 **같은 목록**이 되면, Step 4(보호자가 바라는 것)와 프로필 결과(관찰된 신호)가 **같은 라벨로 나란히 놓인다.** 이 자체는 결정 사항이지만, 화면 문구가 아래로 읽히면 `.claude/rules/frontend.md` §8(진단·판정·비교 표현 금지)과 충돌한다.

- 금지: "목표 대비 달성", "기대했던 역량 vs 실제", 점수 비교, 미달 표시
- 유지: Step 4 는 **"무엇을 함께 키우고 싶은지"** 를 고르는 것이고, 프로필 결과는 **"지금 관찰된 신호"** 다. 두 화면이 서로를 평가하지 않는다
- **QA 확인 항목**: Step 4 선택과 프로필 결과를 대조·평가하는 표현이 화면·copy 에 없을 것

### 8.3 문서 위상 보고

`docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` 는 저장소에 있으나 **`CLAUDE.md` 의 Source of Truth 표에 등재돼 있지 않다** (등재된 것은 PRD · Figma · Architecture · Baseline Survey). 이번 결정으로 온보딩 문항의 근거 문서가 되었으므로 등재 여부를 사용자에게 확인해야 한다.

---

## 9. 2026-09-28 미결 항목 정리 (Stage 3 착수 전)

Stage 2 종료 후 쌓인 추적 항목을 사용자가 항목별로 결정했다.

| ID | 결정 | 비고 |
|---|---|---|
| **`S2-ONB-1`** | **질문지 문서대로 Q1 · Q2 · Q4 를 필수로** | **결정 `D-C` 를 일부 뒤집는다** — §8 의 "Step 2~4 전부 선택"이 아니라 Q1·Q4(Step 2 기질) · Q2(Step 4 성장 목표)가 필수가 된다. Q3(Step 3 주제)는 선택 유지. 추천 cold-start 품질을 위해 질문지 설계를 따른다. **구현 변경 필요** — 단계별 검증·CTA 조건 |
| **`S2-CONSENT-1`** | **`signup_oauth` 를 지금 구분한다** | 동의 출처는 "이 사용자가 어떤 경로로 동의했는가"를 감사할 때 쓰이는 값이라 법무 관점에서 의미가 있다. 나중에 고치면 **이미 기록된 이벤트가 잘못된 출처로 남고 소급 보정이 어렵다**. 구현 방식은 development-agent 판단(계약 확장 / provider 전달) |
| **`S2-COPY-1`** | **빈 슬롯 유지** | 소개 화면의 소요 시간·문항 수 InfoRow 를 렌더하지 않는다. 틀린 숫자를 보여주는 것보다 안 보여주는 게 낫고, 실제 소요 시간을 측정한 뒤 채운다 |
| **`S2-HOME-1`** | **워드마크 텍스트 유지** | 폰트 렌더라 고해상도 문제가 없고 텍스트 확대·스크린리더에 유리하다. 단순 워드마크라 에셋화 이득이 적다. 허용 차이 `AD-S2-14` 유지 |
| **`S2-SRC-1` / `S2-ONB-3`** | **`CLAUDE.md` Source of Truth 표에 등재** | `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` 가 온보딩 문항의 근거 문서임을 명시한다 |
| **`S1-G-6`** | **전체 프레임 임계값 `maxDiffPixels: 200` 유지** | 전체 프레임은 **레이아웃 회귀 전용**이고 아이콘·라디오스 수준은 Stage 2 가 도입한 영역 클립(`0.002 / 20`)이 담당한다. 역할이 나뉘었으므로 더 조이면 무해한 렌더링 차이에도 CI 가 깨진다 |
| **`S2-CARD-1` · `S2-WELCOME-1`** | **둘 다 현재 유지 + 허용 차이 등록** | ① 설문 카드 내부 간격은 질문 박스 높이가 실제 행수에 따라 달라져 Figma 잠재값과 단순 비교가 어렵다 ② welcome 상단 여백은 Figma 에 없는 Apple 버튼(`AD-S2-2`)이 회수분을 쓰므로 복원하려면 화면 세로 재설계가 필요하다 |

### 9.1 `S2-ONB-1` 이 `D-C` 를 바꾸는 범위

| 단계 | §8 `D-C` (2026-09-26) | **§9 확정 (2026-09-28)** |
|---|---|---|
| Step 1 아이 정보 | 이름·생년월·성별(미응답 허용) 필수. **언어환경은 선택 + 기본값 영어** (2026-10-04 결정, `stage-3-approvals.md` §11.22 — 최초 기록은 "언어환경 필수"였다) | 2026-10-04 갱신 |
| Step 2 기질 (Q1 · Q4) | 선택 | **필수** |
| Step 3 책·주제 (Q3) | 선택 | 선택 유지 |
| Step 4 성장 목표 (Q2) | 선택 | **필수** |
| Step 5 Baseline 10문항 | 문항별 "관찰한 적 없음" 허용 | 변경 없음 |

"관찰한 적 없음" 류의 **회피 선택지가 있는 문항은 그 선택지를 고르는 것도 응답**이다 — 필수화가 보호자에게 없는 답을 강요하지 않도록 한다.

### 9.2 결정이 필요 없던 항목 (에이전트 작업으로 해소)

`S1-E-1`(Design Spec §3.4 클래스명) · `S2-AUTH-2`(`AD-S2-13` §11.3 등록) · `QA-1-004`(devWarn 주석·DEV 게이트) · `onboarding.css` 축소 순서 주석 · `QA-1-003`(gallery baseline 겹침)

### 9.3 Stage 배정으로 해소되는 항목

`S1-E-3` BottomTabBar `sticky`↔`fixed`(**Stage 3** — 탭바 실마운트 시) · `S2-ONB-2` Q5 표지 그리드(**Stage 3**) · `S1-G-7` source map(**Stage 8** 프리뷰 배포) · `L-02` 약관 본문(**출시 전** 차단 항목) · `S1-D2-3` Safari VoiceOver(실기기 검증)
