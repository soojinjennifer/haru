# Stage 2 Onboarding Rework Plan — 설문 4단계 재구성 + Create account 아동 정보 선행 수집

Status: **APPROVED (2026-10-03, user)**
Based on: PRD v1.4 (§7.2 · FR-03 · FR-24) · 질문지 `HARU_Onboarding_Questionnaire_v1-1.docx.md` (Q1~Q5) · Baseline `HARU_Developmental_Baseline_Survey_v1.docx.md` (10 items) · Figma `YWWu3AFEJpRxvw0T5klq0k` 섹션 `179:1700` (`179:1701` · `179:1724` · `243:1147` · `248:1159` · `179:1748` · `179:1770` · `179:1809` · `179:1820`) · `docs/plans/stage-2-plan.md` · `docs/decisions/stage-0-approvals.md`(C-2 · C-5 · C-8 · C-9 · C-10 · C-12) · `docs/decisions/stage-2-approvals.md`(§8 D-A/D-B/D-C · §9 S2-ONB-1) · `docs/decisions/stage-3-approvals.md` §2(Figma 우선 + 지점별 승인) · 현재 `packages/contracts` · `apps/web`
작성: plan-agent, 2026-10-03
**이 문서는 `docs/plans/stage-2-plan.md` 를 대체하지 않는다.** 승인되면 그 문서의 해당 절을 갱신하기 위한 **변경 제안서**다.

> ⚠️ 이 Plan 의 어떤 항목도 아직 확정이 아니다. §14 의 `R-01`~`R-14` 가 전부 승인되어야 design-agent / development-agent 로 넘어간다.
> 특히 **`R-01`(Create account 아동 정보)은 Privacy Critical** 이며, 승인 없이 구현을 시작하면 `AC-2-13` 을 깨뜨릴 수 있다.

---

## 1. Goal

사용자 지시 2건을 Stage 2 화면 재설계로 반영한다.

1. **설문을 4단계로 재구성**한다 — `Reading together` → `Books and interests` → `Growing together` → `Capability-items`.
   네 단계 모두 Figma `179:1770`(1d · Survey cards) 와 **동일한 카드 디자인**을 쓰고, **상단 제목만 단계에 따라 바뀌며**, **한 카드에 한 문항**이 나온다.
2. **`1c · Survey step 1 intro`(`243:1147`) → `1c · Survey step 1 — About your child`(`248:1159`)** 를 설문 앞에 둔다.
   `About your child` 의 **아이 이름·생년월은 `1b · Create account`(`179:1724`) 에서 받은 값을 읽어와 표시**하고, 설문에서 다시 입력받지 않는다. 나머지 항목만 선택한다.

부수 목표(지시에서 파생된 구조 요구):

- 문항 수·문구·카드 수를 화면 코드가 모르게 한다 — 나중에 문항이 바뀌어도 화면 코드를 고치지 않는다 (2026-09-26 사용자 원칙, `stage-2-approvals.md` §8 D-A 구조 제약 ②·③).
- PRD 와 어긋나는 지점을 **수정 대상 목록**으로 산출한다 (파일은 고치지 않는다).

### 1.1 현행 ↔ 목표 차이 요약

| | 현행 (구현 완료) | 목표 |
|---|---|---|
| 흐름 | `1a Sign up` → `1b Create account`(보호자만) → `/auth/consent` → `1c Survey intro` → Step 1~5 → `1e Baseline saved` | `1a Sign up` → `1b Create account`(보호자 + **아이 이름·생년월**) → `1c Survey step 1 intro`(`243:1147`) → `About your child`(`248:1159`) → `1c Survey intro`(`179:1748`) → **설문 4단계(카드)** → `1e Baseline saved` |
| 단계 수 | 5 (`child-info` · `temperament` · `books` · `goals` · `capability-items`) | 프로필 1 + **설문 4** (`reading-together` · `books-and-interests` · `growing-together` · `capability-items`) |
| 설문 UI | Step 2~4 = 세로 목록(한 화면 여러 문항), Step 5 = 카드 덱 | **4단계 전부 카드 덱**. 한 카드 = 한 문항 |
| 아이 이름·생년월 | 온보딩 Step 1 에서 입력 (C-5) | **Create account 에서 입력**, `About your child` 는 표시 전용 |
| 카드 수 표기 | Step 5 만 `1 / 10` | 4단계 통산 (§4 · `R-02`) |
| Q1+Q2 한 화면 | Step 2 가 Q1·Q4 두 문항을 한 화면에 | **문항마다 카드 1장** |

---

## 2. In Scope (Frontend)

| ID | 범위 | 요구사항 근거 |
|---|---|---|
| **W-01** | `OnboardingStep` enum · slug · 응답 키를 4단계 체계로 재정의 | FR-03, C-9, 사용자 지시 |
| **W-02** | Q1~Q5 · Baseline 10문항의 **4단계 재배치**와 단계별 문항 수 확정 | 질문지 v1.1, Baseline v1, 사용자 지시("단계당 문항 수를 다시 정한다") |
| **W-03** | 설문 4단계를 **단일 카드 덱 UX** 로 통일 (제목만 단계별 전환, 한 카드 한 문항) | Figma `179:1770`, 사용자 지시 |
| **W-04** | `1c · Survey step 1 intro`(`243:1147`) 신규 화면 | Figma |
| **W-05** | `About your child`(`248:1159`) — 이름·생년월 **표시 전용**, 성별·관계·언어·독서 루틴 입력 | Figma, 사용자 지시 |
| **W-06** | `1b · Create account`(`179:1724`) 에 YOUR CHILD 섹션 + 동의 체크 복원 | Figma, 사용자 지시 — **`R-01` 승인 전제** |
| **W-07** | 카드 수·소요 시간 문구의 **하드코딩 제거** (instrument 파생) | 2026-09-26 원칙, `stage-2-approvals.md` §8 D-A ② |
| **W-08** | 필수/선택·단일/복수·상한·배타 규칙 유지 (`S2-ONB-1`) | `stage-2-approvals.md` §9.1 |
| **W-09** | `packages/contracts` 변경 (§7) + `docs/API_CONTRACTS.md` · `docs/DATA_MODEL.md` 갱신 | rules/architecture §5 |
| **W-10** | Mock·fixture·scenario 갱신 (§8) | rules/frontend §5 |
| **W-11** | Playwright 시각 baseline 재수립 + e2e 경로 갱신 (§12) | rules/qa |
| **W-12** | Privacy 불변식 재검증 — 동의 전 아동 데이터 전송 0건 (`AC-2-13` 유지·강화) | ARCHITECTURE §7.3.1, rules/qa Privacy |
| **W-13** | **결함 3건 동시 수정** — `S2-FIX-1`(CTA 하단 여백, `StackLayout` 공통 13 route) · `S2-FIX-2`(2줄 선택지 상하 여백, `RadioGroup.css`) · `S2-FIX-3`(덱 카드 흰 면 4겹) | **`D-25`** (2026-10-03, user, `stage-3-approvals.md` §11.2) |

---

## 3. Out of Scope

- **Backend 구현 일체** — `apps/api/`, `supabase/`, RLS, worker (CLAUDE.md Development Scope).
- `docs/source/HARU_PRD_v1.5.md` **파일 수정** — 사본이므로 저장소에서 고치지 않는다. §10 목록만 산출하고 실제 반영은 사용자가 OneDrive 원본에 한다.
- `docs/design/stage-2-design-spec.md` 수정 — design-agent 소관 (§15).
- Stage 2-B (`/onboarding/profile` · `/onboarding/growth-capability`) 재설계 — 이번 지시 범위 밖. 단 설문 단계 이름 변경이 프로필 결과 화면의 **입력 키**에 영향을 주므로 §5.4 에 연결점만 기록한다.
- Stage 3 이후 (Activity Card · Library · 추천) — 단 `R-04`(Q5 소유 도서) 승인 시 **Stage 3 Library 와 데이터가 겹치므로** 경계를 §5.5 에 명시한다.
- 추천 엔진 로직 구현 — 질문지의 `comfort_zone` · `axis_weight` · `interest_weight` · `channel` 계산은 **Backend 요구사항**이다 (§10 · §11).

---

## 4. 문항 재배치 안 ★ 핵심 산출물

### 4.1 원칙

1. **문항 원문을 바꾸지 않는다.** 아래 표의 "문항(원문)" 은 질문지 v1.1 / Baseline v1 의 parent-facing copy 그대로다.
2. **한 카드 = 한 문항.** 현행 Step 2(Q1+Q4 한 화면)·Step 3(Q3 + 책 검색 + 집 책) 은 이 원칙에 어긋나므로 분리한다.
3. 문항 **문구는 contracts 에 넣지 않는다.** 선택형 문항은 `code` + copy 모듈(또는 서버 `label` override), 역량 문항은 `instrument.survey.items[].prompt` 응답 값이다 (D-A 구조 제약 ①, AC-2-24).
4. **필수 여부는 `S2-ONB-1`(Q1·Q2·Q4 필수) 을 그대로 유지**한다. 재배치가 필수 규칙을 바꾸지 않는다.

### 4.2 4단계 배치표 (제안 — 승인 필요)

| # | 단계 (화면 상단 제목) | step enum | slug | 카드 | 문항 | 출처 | 선택 규칙 | 필수 |
|---|---|---|---|---|---|---|---|---|
| 1 | **Reading together** | `reading_together` | `reading-together` | 2 | ① "When you read to your child, which kinds of stories tend to go best?" | 질문지 **Q1** | 단일 (4지) | **필수** |
| | | | | | ② "During read-aloud, what does your child usually do?" | 질문지 **Q4** | 단일 (5지) | **필수** |
| 2 | **Books and interests** | `books_and_interests` | `books-and-interests` | 2 | ③ "What does your child tend to reach for in books?" | 질문지 **Q3** | 복수 **최대 2**, `not_sure_yet` **배타** | 선택 |
| | | | | | ④ "Which of these does your child already know well?" (표지 그리드 8종, 캡션 "Tap any books you've read together more than a few times.") | 질문지 **Q5** | 복수 **무제한** | 선택 |
| 3 | **Growing together** | `growing_together` | `growing-together` | 1 | ⑤ "Books can do different kinds of work. Which would help you most right now?" | 질문지 **Q2** | 복수 **최대 2**, 최소 1 | **필수** |
| 4 | **Capability-items** | `capability_items` | `capability-items` | 10 | ER1 Recovery · ER2 Naming feelings · AG1 Taking it on · AG2 Persistence · AG3 Self-directed pretend play · CF1 Adjusting to change · CF2 Accepting a substitute · IM1 Carry-over · IM2 Curiosity and questioning · IM3 Absorption | Baseline v1 | 단일 (5점 빈도 + 비채점 `not_observed` = 6옵션) | 10문항 **전부** (제출 시) |
| | | | | **합계 15장** | | | | |

**`R-04` 가 부결되어 Q5 를 빼면 합계 14장**이 된다 (§14 `R-04`).

### 4.3 배치 근거

| 단계 | 왜 이 문항들인가 |
|---|---|
| Reading together | Q1·Q4 는 질문지가 "observable behavioral proxies" 로 묶은 **읽어 주는 순간의 관찰** 2문항이다 (질문지 "What Is Deliberately Out of Scope — Temperament profiling"). 현행 `temperament` 단계의 내용과 동일하며, 단계 이름만 관찰 언어로 바뀐다. |
| Books and interests | Q3(끌리는 것) 과 Q5(이미 아는 책) 는 둘 다 **책 후보 풀**에 작용한다 — Q3 는 `interest_weight`, Q5 는 후보 제외. 같은 단계에 묶는 것이 엔진 관점에서도 자연스럽다. |
| Growing together | Q2 는 **보호자가 무엇을 함께 키우고 싶은지** 고르는 유일한 문항이고 4대 역량과 1:1 이다 (결정 `D-B`). 아이에 대한 관찰이 아니라 보호자의 바람이라 다른 문항과 성격이 달라 **독립 단계**로 둔다. |
| Capability-items | Baseline v1 10문항. Figma `179:1770` 의 정본 디자인이 이 단계다. 역량별 문항 수 비대칭(ER2·AG3·CF2·IM3)은 Baseline 문서가 의도한 것이므로 유지한다 (C-8). |

### 4.4 단계 길이 비대칭에 대하여

`Growing together` 는 카드 1장이다. 승인 선택지는 §14 `R-14` 에 둔다.

- **유지(권장)** — 문항을 창작해 채우지 않는다. 1장이어도 단계 제목이 바뀌는 리듬 자체가 "이제 목표 이야기" 라는 신호가 된다.
- 대안 ① Q2 를 `Books and interests` 뒤에 붙이고 3단계로 — **사용자 지시(4단계)를 어긴다.** 기각 권장.
- 대안 ② `About your child` 의 독서 루틴을 `Reading together` 로 옮겨 균형 — Figma `248:1159` 가 독서 루틴을 `About your child` 에 명시적으로 그려 두었으므로 **Figma 와 어긋난다.** 기각 권장.

### 4.5 `1 / 10` 표기 — 통산인가 단계 내인가 (`R-02`)

Figma `179:1770` 의 `1 / 10` 은 현재 **Capability-items 10문항 기준**이다. 설문이 4단계가 되면 해석이 갈린다.

| 안 | 표기 | 장점 | 단점 |
|---|---|---|---|
| **A. 전체 통산 (권장)** | `1 / 15` … `15 / 15` (단계가 바뀌어도 숫자는 이어짐) | 사용자 지시 "**상단 제목만** 순차적으로 바뀌면서" 와 정확히 일치한다 — 카드 흐름은 하나, 바뀌는 건 제목뿐. 남은 분량을 한 번에 알 수 있다. `179:1748` 의 "about N cards" 와 **같은 분모**를 쓴다 | 15 가 길어 보인다 |
| B. 단계 내 | `1 / 2` · `1 / 2` · `1 / 1` · `1 / 10` | 단계가 짧아 보여 부담이 적다 | `1 / 1` 이 어색하다. 진행률을 알 수 없다. 단계마다 분모가 바뀌어 "한 흐름" 이라는 사용자 지시와 어긋난다 |

**권장: A (전체 통산).** 단계 경계는 **상단 제목 전환 + ProgressBar 구간 색** 으로 표현하고, 카운터는 끊지 않는다.
단계 내 위치 정보가 필요하면 제목 아래 보조 라인(`Reading together · 2 of 2`)을 **copy 슬롯**으로 둘 수 있다 — 이것도 승인 항목이다 (`R-02` 하위).

### 4.6 카드 수·소요 시간 문구의 하드코딩 제거 (`R-03`)

`179:1748` 의 "**About 3 minutes · about 10 cards**" 와 `243:1147` 의 "**About 1 minutes**" 는 지금 실제 카드 수와 맞지 않게 된다 (10 → 15).

**규칙: 화면 코드·copy 문자열에 숫자를 쓰지 않는다.**

- 카드 수 = `instrument.questions.length + instrument.survey.items.length` **파생값**.
- 소요 시간 = instrument 응답 값 (§7 `estimates`).
- copy 모듈은 `surveyIntroMeta(minutes, cards)` 같은 **함수 슬롯**만 제공한다 — 문항이 늘어도 화면 코드와 copy 문자열을 고치지 않는다.
- Figma 의 "about 10 cards" 는 **디자인 시점의 예시값**으로 간주하고 구현에서는 파생값을 쓴다 (허용 차이로 사전 기록 — §12).

### 4.7 선택 규칙·필수 여부 보존 확인표

| 문항 | 현행 contracts | 재배치 후 | 변경 |
|---|---|---|---|
| Q1 `story_comfort` | 단일 / required=true / 회피지 `depends_on_the_day` | 동일 | `step` 값만 |
| Q4 `read_aloud_behavior` | 단일 / required=true | 동일 | `step` 값만 |
| Q3 `topic_tags` | 복수 max 2 / required=false / `not_sure_yet` exclusive | 동일 | `step` 값만 |
| Q2 `growth_goals` | 복수 max 2 / required=true (최소 1) | 동일 | `step` 값만 |
| **Q5 `owned_books`** | **없음** | 복수 무제한 / required=false | **신규** (`R-04`) |
| Baseline 10문항 | 6옵션 / 제출 시 10개 전부 | 동일 | 없음 |

> `ONBOARDING_CHOICE_QUESTIONS[].required` 가 필수 여부를 소유하고 화면은 그 값만 읽는 구조는 **그대로 유지**된다. `S2-ONB-1` 은 재배치의 영향을 받지 않는다.

---

## 5. `About your child` 데이터 흐름 ★ Privacy Critical

### 5.1 Figma 실측 (2026-10-03 확인)

**`179:1724` 1b · Create account**

```
YOU         [Your last name | first name]  "Emma, Kim"
            [Email]                        "Emma@example.com"
            [Password]                     ● 8자 이상 안내
YOUR CHILD  [Child's last name | first name]  "Haru, Kim"   + 성별 pill "Not selected ⌄"
            [Birth month]                     "March. 2023" + 나이 tag "3yr 4mo"
            ☑ I agree to the Terms of Service and Privacy Policy, and to taking part in the pilot.
            [ Create account ]
```

**`248:1159` 1c · Survey step 1 — About your child** (393×1132)

```
(안내) Your answers stay on this device / Create an account when you are ready, and we will bring them with you.
YOUR CHILD  [Child's last name | first name]  "Haru, Kim"   + 성별 pill "Not selected ⌄"
            [Birth month]                     "March. 2023" + 나이 tag "3yr 4mo"
ABOUT YOU   [Your relationship to this child]  "Mom ⌄"
AT HOME     Languages you use at home — English · Spanish · Korean · Chinese · Vietnamese · French · Another language (chip)
            Reading routine — Just about every day / A few times a week / Mostly on week ends / Every now and then / We're just starting (radio)
            [ Next ]
```

두 화면의 YOUR CHILD 카드는 **같은 컴포넌트**다. 사용자 지시는 "`About your child` 에서는 이름·생년월을 **읽어와 뿌려주고** 이후 항목만 선택" 이다.

### 5.2 ⚠️ `AC-2-13` · `C-5` 충돌 분석 (Critical)

**현재 확정 사항**

| 근거 | 내용 |
|---|---|
| `C-5` (사용자 결정 2026-09-14) | "**가입 화면은 보호자 정보(이름·이메일·비밀번호)만** 받는다. 아이 정보는 **동의 기록 후** 온보딩 Step 1 에서 수집. **Figma 가입 화면(`179:1724`) 수정은 디자이너 요청**" |
| `C-2` | 모든 가입 경로가 가입 **직후 동의 화면**(`/auth/consent` 5항목)을 거친다. 동의 기록 전 아이 정보 서버 전송 금지 |
| `AC-2-05` | `SignUpWithEmailInputSchema` 가 `.strict()` — 아이 필드가 섞이면 **parse 실패** |
| `AC-2-13` | `POST /v1/consents` **성공 이전 구간의 모든 요청에 아동 데이터 0건** (이름·생년월·성별·설문 응답). Mock 요청 로그 전수 검사 |
| `AC-2-56` | Figma 시각 비교에서 `179:1724` 는 "**보호자 영역만**", "아이 섹션·단일 체크박스 제거" 를 **의도된 허용 차이**로 사전 기록 |

**충돌 지점**

1. 디자이너는 `C-5` 의 Figma 수정 요청을 **적용하지 않았고**, 오히려 YOUR CHILD 섹션을 **확장**했다 (이름 → 이름 + 성별 + 생년월).
2. Figma 의 동의 체크는 **한 줄짜리 "Terms of Service and Privacy Policy + pilot 참여"** 다. HARU 의 동의는 `/auth/consent` 의 **5항목 개별 체크**(`C13-02`, `AC-2-10`) + VPC(`C-3`) 다. **한 줄 체크는 아동 데이터 수집 동의를 대체하지 않는다.**
3. 따라서 **`Create account` 요청 body 에 아이 이름·생년월을 넣으면 `AC-2-13` 과 `AC-2-05` 를 동시에 위반**한다 — 동의 기록 전 요청에 아동 식별 데이터가 실린다.

> **정리: "Create account 화면에서 아이 이름·생년월을 *입력받는 것*" 과 "그 값을 *서버로 전송하는 것*" 은 다른 문제다.** 전자는 Figma·사용자 지시대로 가능하고, 후자가 Privacy 불변식과 충돌한다.

### 5.3 선택지 (고치지 않고 올린다 — `R-01`)

| 안 | 내용 | `AC-2-13` | contract 변경 | 흐름 변경 | 평가 |
|---|---|---|---|---|---|
| **A. 로컬 선입력 (권장)** | Create account 화면에서 아이 이름·생년월을 **입력받되 전송하지 않는다.** 값은 기존 `OnboardingDraftStore` 의 `child_info` 슬롯에 **로컬 저장**되고, `/auth/consent` 5항목 기록 성공 후 `POST /v1/onboarding/submit` 에 실려 나간다. `About your child` 는 그 로컬 draft 를 읽어 표시한다 | **유지** (사인업 요청에 아동 필드 0건) | **없음** — `SignUpWithEmailInput` 그대로 `.strict()`, `ChildInfoAnswers` 그대로 | 없음 (`C-2` · `C-12` 그대로) | Figma·사용자 지시를 둘 다 만족하면서 Privacy 불변식을 **깨지 않는 유일한 안**. Trial(`C-12`) 과도 동일한 메커니즘이다 |
| B. 가입 시 전송 | `SignUpWithEmailInput` 에 `child` 객체 추가. 그러려면 **5항목 동의 + VPC 를 가입 이전으로** 옮겨야 한다 | **재정의 필요** — "동의 성공 이전 0건" 을 "가입 요청 1건 허용" 으로 완화 | `.strict()` 의미 상실, `SignUpWithEmailInput` · `AuthGateway` · Mock · Guard 전면 수정 | **큼** — `C-2`(가입 직후 동의) 와 `C-3`(VPC) 순서를 뒤집는다 | COPPA/VPC 관점에서 위험. Critical 등급 재검토 필요. 비권장 |
| C. `C-5` 고수 | Create account 에서 아이 필드 제거, `About your child` 에서 입력 | 유지 | 없음 | 없음 | **사용자 지시와 Figma 를 모두 거스른다.** 선택지로만 기록 |

**권장: A.** 사용자 지시("회원가입에서 받은 정보를 읽어와서 뿌려준다")는 **화면 간 데이터 전달**을 말한 것이고, A 가 그것을 정확히 구현한다. 서버 전송 시점만 동의 이후로 유지된다.

### 5.4 안 A 의 상세 흐름

```
[1b Create account]
  보호자: caregiverName · email · password   ──▶ POST /v1/auth/sign-up  (아동 필드 0건, .strict() 유지)
  아이  : firstName · lastName? · birthYearMonth · gender?
          └─▶ OnboardingDraftStore.child_info 에 **로컬 저장만** (네트워크 0건)
  ☑ 약관·개인정보·파일럿 참여  ─▶ 화면 진행 조건 (서버 동의 기록 아님)
        │
        ▼
[/auth/consent 5항목] ─▶ POST /v1/consents  ← **여기서부터 아동 데이터 전송 허용**
        │
        ▼
[1c Survey step 1 intro 243:1147]
        │
        ▼
[About your child 248:1159]
  이름·생년월  : 로컬 draft 에서 읽어 **표시 전용** 행으로 렌더
  나이 "3yr 4mo": birthYearMonth 에서 **클라이언트 파생** (기존 `childAgeInMonths`, 결정 D-10 유지)
  성별·관계·언어·독서 루틴: 입력
        │ Next → PUT /v1/onboarding/steps/child_info (동의 이후이므로 허용)
        ▼
[1c Survey intro 179:1748] → 설문 4단계 카드 → [1e Baseline saved]
```

- **Trial(`C-12`) 경로**도 동일하다 — 가입 전에는 모든 값이 로컬 draft 에만 있고, 제출 시 `submit` 1회로 나간다. 즉 A 안은 **기존 Trial 메커니즘의 재사용**이지 신규 구조가 아니다.
- `AC-2-13` 의 검증 방식(요청 로그 전수 검사)이 **그대로 유효**하며, 오히려 검사 대상 구간이 넓어진다(가입 요청 포함). 테스트 강화 필요 → `AC-2R-13`.

### 5.5 Figma 내부 불일치 — 안내 문구 (`R-07`)

`248:1159` 상단에 **"Your answers stay on this device / Create an account when you are ready, and we will bring them with you."** 가 있다. 이는 **Trial(미가입) 안내**다 (`C13-11`).

그런데 사용자 지시의 흐름은 **Create account 를 이미 거친 뒤** 이 화면에 온다. 그러면 "Create an account when you are ready" 는 **사실과 다른 문구**가 된다.

| 안 | 내용 |
|---|---|
| **A (권장)** | 안내를 **상태 의존 슬롯**으로 둔다. 미가입(Trial) → Figma 문구 그대로. 가입 완료 → 해당 안내 **비표시**(또는 "Saved to your account" 류 별도 copy). 화면은 `OnboardingNotices` 가 이미 상태별 안내를 담당하므로 구조 변경이 작다 |
| B | 항상 표시 — 가입 후에도 "기기에만 저장" 이 사실이면(동의 전 구간) 틀린 말은 아니다. 단 "Create an account" 문장은 수정 필요 → Figma 문구 변경이 되므로 디자이너 확인 필요 |
| C | 항상 비표시 — Trial 안내를 잃는다. 비권장 |

**이 불일치는 PRD ↔ Figma 충돌이 아니라 Figma 내부 불일치**이므로 `stage-3-approvals.md` §2 의 "Figma 우선" 규칙 대상이 아니다. 사용자 판단이 필요하다.

### 5.6 표시 전용 필드의 수정 경로 (`R-08`)

`About your child` 에서 이름·생년월이 표시 전용이면 **오타를 어디서 고치는가** 가 반드시 정의되어야 한다. 생년월은 `3~9세` 범위 밖이면 제출 자체가 막히므로(`C-10`) 수정 경로가 없으면 **데드락**이 된다.

| 안 | 내용 | 비용 |
|---|---|---|
| **A (권장)** | `About your child` 의 YOUR CHILD 카드 행을 탭하면 **뒤로 가서 Create account 값을 고치는** 것이 아니라, **같은 카드에서 인라인 편집**으로 전환한다. 즉 "기본은 표시, 탭하면 수정" — 사용자 지시("이후 항목만 선택")의 의도(=다시 타이핑시키지 말 것)를 지키면서 데드락이 없다 | 작음. `ChildInfoStep` 의 기존 입력 로직 재사용 |
| B | 완전 읽기 전용 + 상단 "Edit" 링크 → Create account 화면으로 되돌림 | 가입 완료 후 되돌아갈 화면이 없다. 구조 모순 |
| C | 완전 읽기 전용, 수정은 Stage 6 프로필 수정에서만 | **온보딩 중 잘못된 생년월을 고칠 수 없다** → 제출 불가 데드락. 기각 권장 |

**권장: A.** 더불어 Stage 6 프로필 수정(`PATCH /v1/children/:childId`)은 **별도로 존재**해야 한다 — 이미 Stage 2 Out of Scope 로 기록되어 있다 (`AC-2-02`).

### 5.7 파생 표시값 `3yr 4mo` (`R-09`)

- **클라이언트 파생**이 이미 확정이다 — `childAgeInMonths(birthYearMonth, now)`, 결정 `D-10`, `AC-2-22`("나이 표시는 입력에서 파생된다").
- Figma 가 **Create account 와 About your child 양쪽에 같은 tag** 를 그렸으므로, 두 화면이 같은 순수 함수를 쓴다.
- **서버가 주지 않는다.** `Child` contract 에 `ageMonths` 를 추가하지 않는다 (파생값 중복 저장 금지).
- 변경 없음 → `R-09` 는 **확인 항목**이다.

### 5.8 성별 필드의 위치 (`R-10`)

Figma 는 YOUR CHILD 카드에 성별 pill("Not selected ⌄")을 **Create account 와 About your child 양쪽에** 그렸다. 사용자 지시는 "이름과 생년월일" 만 이월한다고 했다.

| 안 | Create account | About your child |
|---|---|---|
| **A (권장)** | 성별 pill **표시하되 선택은 선택 사항** → 값이 있으면 이월, 없으면 "Not selected" | **편집 가능** (기본 미선택, `gender: null` 허용 — `C-7`) |
| B | 성별 pill 제거 | 편집 가능 |
| C | 성별 Create account 에서만 | 표시 전용 |

권장 A 는 Figma 두 화면을 모두 그대로 구현하면서, 사용자 지시("이름·생년월만 이월, 이후 항목은 선택")와도 모순되지 않는다 — 성별은 양쪽 어디서 골라도 되는 값이다.

---

## 6. Dependencies

| # | 항목 | 상태 |
|---|---|---|
| 1 | `R-01` 승인 (Privacy Critical) | **차단** — 미승인 시 `W-05`·`W-06` 진행 불가 |
| 2 | `R-04` 승인 (Q5 소유 도서 vs PRD Step 3 책 검색) | **차단** — contracts·Mock·AC-2-23 범위가 갈린다 |
| 3 | Q5 표지 이미지 8종 에셋 | **미확보** — `R-04` 승인 시 필요. 저작권 있는 실제 표지는 쓸 수 없다 → 대체 플레이스홀더 디자인 필요 (design-agent) |
| 4 | `243:1147` · `248:1159` 의 토큰·치수 실측 | design-agent 소관 (§15) |
| 5 | 카드 덱 depth 3 · Y 16 · 좌우 8 (design-agent 2026-10-03 실측) | **확보** — `179:1770` |
| 6 | 단계 제목 4종의 사용자 노출 영문 문구 | Figma 는 `Capability-items` 만 확정. 나머지 3개는 사용자 지시 문자열 그대로 쓸지 확인 (`R-13`) |
| 7 | Stage 2 구현 완료본 | **확보** — 재사용 범위 §13 |
| 8 | Stage 2-B(프로필 결과) 디자이너 Figma | 미착수 (C13-09·C13-10) — 이번 범위 밖이나 설문 키 변경의 하류다 |
| 9 | `S2-FIX-1~3` 실측·회귀 가드 (`D-25`) | **확보** — `stage-2-design-spec.md` §16 개정 6. `SwipeDeck.tsx` 미수정 · `overflow` 신규 도입 금지 제약을 `W-13` 구현에서 지킨다 |

---

## 7. API Contract Delta (`packages/contracts`)

> 변경 단위는 **필드**다. 각 항목에 `R-xx` 전제를 표기한다.

### 7.1 `enums/onboarding-step.ts` — step 값 rename

| 현행 | 변경 | 비고 |
|---|---|---|
| `child_info` | `child_info` | 유지. **카드 단계가 아니다**(프로필 입력) — `R-06` |
| `temperament` | **`reading_together`** | |
| `books` | **`books_and_interests`** | |
| `goals` | **`growing_together`** | |
| `capability_items` | `capability_items` | 유지 |

**배열 길이 5 가 그대로**이므로 `OnboardingStateSchema.steps.length(5)` 검증은 변경 없다.

### 7.2 `onboarding/answers.ts` · `save-step.ts` — 응답 키 rename (`R-05`)

`OnboardingDraftAnswers` 의 키는 `OnboardingStep` 값과 **1:1** 이라는 불변식을 유지하기 위해 같이 바꾼다.

```
child_info        → child_info          (유지)
temperament       → reading_together
books             → books_and_interests
goals             → growing_together
capability_items  → capability_items    (유지)
```

- `SaveOnboardingStepRequestSchema` 의 discriminator literal 5종 동일 rename.
- `CompleteOnboardingAnswersSchema` 동일.
- 파일명도 함께 정리 권장: `temperament.ts` → `reading-together.ts`, `goals.ts` → `growing-together.ts`, `books.ts` → `books-and-interests.ts`. **schema 이름(`TemperamentAnswersSchema` 등)도 함께 바꾼다.**
- `children/child.ts` 의 `topicTags` · `growthGoals` **필드명은 유지**한다 — `docs/DATA_MODEL.md` §5 `children.topic_tags` · `growth_goals` 컬럼과 1:1 이고, 단계 이름이 아니라 **데이터 이름**이기 때문이다.

### 7.3 `onboarding/instrument.ts`

| 항목 | 변경 |
|---|---|
| `ChoiceQuestionId` | `temperament.story_comfort` → **`reading_together.story_comfort`** · `temperament.read_aloud_behavior` → **`reading_together.read_aloud_behavior`** · `books.topic_tags` → **`books_and_interests.topic_tags`** · `goals.growth_goals` → **`growing_together.growth_goals`** · (`R-04`) **`books_and_interests.owned_books` 신규** |
| `ONBOARDING_CHOICE_QUESTIONS[].step` | 위 rename 반영. `order`: Reading together = Q1(1) · Q4(2) / Books and interests = Q3(1) · Q5(2) / Growing together = Q2(1) |
| `ONBOARDING_INSTRUMENT_VERSION` | `1.1.0` → **`2.0.0`** (단계 체계가 바뀌므로 major) |
| `ONBOARDING_INSTRUMENT_CODE` | `onboarding_v1_1` 유지 권장 (질문지 문서 버전은 그대로 v1.1 이다). 단계 재배치는 **배치 변경**이지 문항 변경이 아니다 |
| `OnboardingInstrumentSchema` | **`estimates: { profileMinutes: int≥1, surveyMinutes: int≥1 }` 신규** (`R-03`) — `243:1147` "About 1 minutes" · `179:1748` "About 3 minutes" 의 출처 |
| `ChoiceQuestionSchema` | 변경 없음. `selection`·`maxSelections`·`required`·`exclusive`·`prompt`·`label` 그대로 |
| 함수 | `readChoiceAnswer` · `applyChoiceAnswer` · `pruneUnknownChoiceAnswers` 의 switch case 가 새 id 로 바뀐다. **로직은 동일** |

> **카드 수는 contract 에 넣지 않는다** — `questions.length + survey.items.length` 파생값이다 (`R-03`).

### 7.4 `onboarding/books.ts` (`R-04` 전제)

| 필드 | 변경 |
|---|---|
| `topicTags` | 유지 (max 2) |
| **`ownedBooks`** | **신규** — `z.array(IdSchema).max(OWNED_BOOKS_MAX)`. 질문지 Q5 `child.owned_books`. 상한 `OWNED_BOOKS_MAX` = 표지 그리드 크기(8~10) — RECOMMENDED |
| `favoriteBooks` | **`R-04` 결과에 따라 제거 또는 Stage 3 이관** (§14) |
| `homeBooks` | 동일 |

### 7.5 `children/child.ts` (`R-04` 전제)

- `ownedBooks: z.array(IdSchema)` 추가 (프로필 결과가 돌려주는 값).

### 7.6 변경 없음 (확인)

- `auth/sign-up.ts` — **`R-01` 안 A 채택 시 변경 0건.** `.strict()` 유지가 `AC-2-05` 의 핵심이다.
- `onboarding/child-info.ts` — 필드·검증 로직 전부 유지. 입력 화면만 바뀐다.
- `onboarding/survey.ts` — Baseline 10문항 구조 전부 유지.
- `enums/capability.ts` · `enums/survey.ts` · `enums/gender.ts` — 변경 없음.

### 7.7 Error code

신규 없음. 기존 `VALIDATION_FAILED` · `CONSENT_REQUIRED` · `ONBOARDING_INCOMPLETE` 로 충분하다.

### 7.8 문서

- `docs/API_CONTRACTS.md` §2.2(단계 enum) · §3.4(요청 schema) · §4 Stage 2 표 갱신 — **plan-agent 소관** (설계 변경, `rules/workflow` §5).
- `docs/DATA_MODEL.md` §5 — `onboarding_responses` 의 step 키 값 rename, (`R-04`) `children.owned_books uuid[]` 추가 요구.

---

## 8. Mock Scenarios

### 8.1 기존 시나리오 — 키 유지, 데이터만 갱신

| key | 영향 |
|---|---|
| `success` | instrument 가 새 단계·문항으로 내려간다 |
| `draft-resume` | `currentStep` 값이 새 slug 체계여야 한다 |
| `consent-missing` | **`R-01` 핵심 회귀** — Create account 에서 입력한 아이 값이 로컬에만 있고, 동의 전 `PUT /v1/onboarding/steps/*` 가 `CONSENT_REQUIRED` 로 거부되는지 |
| `onboarding-incomplete` | 필수 미응답 단계 판정이 새 step 값으로 동작 |
| `capability-all-missing` · `persona-fallback` | 변경 없음 |
| `book-search-empty` | **`R-04` 결과에 따라 폐기 또는 유지** |

### 8.2 신규 시나리오

| key | 재현 | 목적 |
|---|---|---|
| `prefilled-child-info` | Create account 로컬 저장값이 있는 상태로 `About your child` 진입 | 표시 전용 행이 draft 값을 읽는지 (`R-01` A) |
| `missing-prefill` | 로컬 draft 에 `child_info` 가 **없는** 상태로 `About your child` 진입 (기기 변경·draft 폐기 — `D-3`) | **빈 표시 전용 행 데드락 방지** — 인라인 편집 fallback 이 동작해야 한다 (`R-08` A) |
| `instrument-v2` | 서버가 문항 수가 다른 instrument 를 내려줌 (예: 12장) | 카드 수·소요 시간이 **파생값**인지 (`R-03`). 화면 코드 수정 없이 동작해야 한다 |
| `owned-books-empty` (`R-04`) | Q5 표지 그리드가 비어 있는 카탈로그 | EMPTY 상태 |

### 8.3 공통 5종 유지

`SUCCESS` · `LOADING` · `EMPTY` · `ERROR` · `RETRY` 는 각 단계에서 그대로 재현한다. 결정성(`AC-2-52`) 요구 불변.

---

## 9. Frontend Scope

> 상세 UI 는 design-agent 가 확정한다 (§15).

### 9.1 Route

| 현행 | 변경 |
|---|---|
| `/onboarding` (intro `179:1748`) | 유지 — 단 **설문 intro** 로 위치가 뒤로 밀린다 |
| — | **`/onboarding/start` 신규** (`243:1147` Survey step 1 intro) — slug 명은 design 단계에서 확정 |
| `/onboarding/child-info` | 유지 (`248:1159`) — 내용이 표시 전용 + 선택 항목으로 바뀜 |
| `/onboarding/temperament` | → **`/onboarding/reading-together`** |
| `/onboarding/books` | → **`/onboarding/books-and-interests`** |
| `/onboarding/goals` | → **`/onboarding/growing-together`** |
| `/onboarding/capability-items` | 유지 |
| `/onboarding/saved` | 유지 |

`shared/config/routes.ts` 의 `ONBOARDING_STEP_SLUGS` 배열만 바꾸면 `steps.ts` 의 index 연결은 자동으로 따라온다 (**현행 구조의 이득**).

### 9.2 Feature `features/onboarding-survey`

| 파일 | 처리 |
|---|---|
| `ui/ChoiceQuestionList.tsx` | **카드 1장 = 문항 1개 렌더러로 전환.** 목록 레이아웃을 버리고 `SwipeDeck` + `SurveyQuestionCard` 를 쓴다. 단일→`RadioGroup variant="card"`, 복수→`Chip`/`CheckboxGroup` 유지 |
| `ui/CapabilityItemsStep.tsx` | **덱 로직을 공용 `SurveyCardDeck` 으로 승격**하고, 역량 문항 전용 부분(6옵션·비채점 caption)만 남긴다 |
| `ui/ChildInfoStep.tsx` | 이름·생년월 → **표시 전용 행 + 인라인 편집**(`R-08` A). 성별·관계·언어·독서 루틴 입력 유지 |
| `ui/OnboardingIntro.tsx` | **2종으로 분리** — Survey step 1 intro(`243:1147`) / Survey intro(`179:1748`). 수치는 copy 함수 슬롯 |
| `ui/BooksStep.tsx` | `R-04` 결과에 따라 **폐기 또는 Stage 3 이관** |
| `ui/OnboardingWizard.tsx` | 단계 제목 전환 + 통산 카운터(`R-02` A) + ProgressBar 구간 |
| `ui/OnboardingNotices.tsx` | Trial 안내 상태 분기 (`R-07`) |
| `model/steps.ts` | 변경 없음 (enum·slug 배열만 바뀌면 자동 추종). **카드 단계만 세는 헬퍼 1개 추가** (`child_info` 제외) |
| `model/instrumentView.ts` | `questionsForStep` 유지 + **전체 카드 평탄화(flatten) 함수 추가** — 통산 카운터용 |
| `model/childInfo.ts` · `useOnboardingDraft.ts` · `useOnboardingWizard.ts` | 로직 유지. draft 키 rename 반영 |
| `copy.ts` | 단계 제목 4종 · intro 문구 · 카운터/카드 수 **함수 슬롯** |

### 9.3 Auth feature

| 파일 | 처리 (`R-01` A 전제) |
|---|---|
| Create account 화면 | YOUR CHILD 섹션 추가. **입력값은 `OnboardingDraftStore` 로만 간다.** `signUp` mutation payload 에 넣지 않는다 |
| | 한 줄 동의 체크 = **화면 진행 조건**. `POST /v1/consents` 를 호출하지 않는다 (5항목 동의는 `/auth/consent`) |

### 9.4 `packages/ui`

- 신규 컴포넌트 **불필요** — `SwipeDeck` · `RadioGroup(card)` · `Chip` · `CheckboxGroup` · `Tag` · `SelectTrigger` 가 이미 있다.
- `entities/character/SurveyQuestionCard` 를 선택형 문항에도 쓸 수 있게 **props 일반화**가 필요할 수 있다 (design-agent 확인).

---

## 10. Backend Integration Requirements

### 10.1 신규 `BACKEND_INTEGRATION_PENDING`

| ID | 요구 | 기대 동작 | Handoff 문서 |
|---|---|---|---|
| **P2-BIP-12** | **instrument 단계 체계 마이그레이션** — `onboarding_v1_1 / 1.1.0` 로 수집된 기존 응답과 `2.0.0` 의 step 키 대응 | 제출 payload 의 `instrument.version` 으로 분기해 과거 응답을 해석 | `DATA_REQUIREMENTS.md` |
| **P2-BIP-13** (`R-04`) | **`owned_books` 후보 풀 제외** — 선택된 book_id 를 추천 후보에서 제거하고 유사 프로필 책을 **첫 3세션 동안 가중 하향** | 질문지 "Engine use" 원문 | `DATA_REQUIREMENTS.md`, `BACKEND_HANDOFF.md` |
| **P2-BIP-14** | **cold-start state vector 산출** — `comfort_zone`(Q1) · `axis_weights`(Q2) · `interest_weights`(Q3) · `channel`(Q4) · `owned_books`(Q5) · `age_months`(프로필) | 질문지 "Inference & Recommendation Logic" | `BACKEND_HANDOFF.md` |
| **P2-BIP-15** | **`depends_on_the_day` · `not_sure_yet` 처리** — 중간 등급 기본값 + 3세션 후 재보정 / 관심 가중 미적용 | 질문지 전용 절 | `BACKEND_HANDOFF.md` |
| **P2-BIP-16** | **instrument 의 `estimates` 제공** — 소요 시간 값을 서버가 내려준다 | 문항이 바뀌면 서버만 바꾼다 | `BACKEND_HANDOFF.md` |
| **P2-BIP-17** (`R-01` A) | **가입 ~ 동의 사이 로컬 보관 아동 데이터의 서버 측 보호** — `submit` 1회로 들어온 데이터에 대해 동의 기록 존재를 **서버가 강제** | 기존 `P2-BIP-03` 의 적용 구간이 넓어진 것 | `AUTH_REQUIREMENTS.md`, `DATA_REQUIREMENTS.md` |

### 10.2 기존 PENDING 중 영향받는 항목

- `P2-BIP-03`(서버 측 동의 강제) — **범위 확대**. Create account 단계에서 아동 데이터가 클라이언트에 존재하게 되므로, 서버는 `submit`·`PUT steps` 양쪽에서 동의를 확인해야 한다.
- `P2-BIP-06`(instrument 버전 호환) — `P2-BIP-12` 로 구체화.

---

## 11. Acceptance Criteria

> 신규 AC 는 기존 `AC-2-01`~`AC-2-68` 과 충돌하지 않도록 **`AC-2R-xx`** 네임스페이스를 쓴다.

### 11.1 무효화되는 기존 AC (10건)

| AC | 사유 | 대체 |
|---|---|---|
| `AC-2-19` | 5단계 slug 목록이 바뀐다 | `AC-2R-01` |
| `AC-2-21` | "Step 1 이 성·이름 두 칸" — 입력 위치가 Create account 로 이동 | `AC-2R-05` · `AC-2R-06` |
| `AC-2-22` | 생년월 입력·에러 위치 이동 (파생 나이 표시는 유지) | `AC-2R-06` · `AC-2R-07` |
| `AC-2-23` | Step 3 책 검색 — `R-04` 결과에 따라 폐기 | `AC-2R-04` (`R-04` 승인 시) |
| `AC-2-26` | submit payload 의 단계 키 이름이 바뀐다 | `AC-2R-02` |
| `AC-2-56` | Figma 시각 비교 대상 노드·허용 차이 목록이 바뀐다 (`179:1724` "보호자 영역만" 이 더 이상 성립하지 않음) | `AC-2R-12` |
| `AC-2-05` | **문언은 유지**하되 검증 범위가 넓어진다 (가입 화면에 아이 **입력란**이 생기므로 "요청에 0건" 을 더 강하게 증명해야 한다) | `AC-2R-13` 로 보강 |
| `AC-2-13` | **폐기 아님 — 유지·강화.** 검사 구간에 Create account 입력 이후 전 구간 포함 | `AC-2R-13` |
| `AC-2-27`·`AC-2-28` | Trial 경로의 시작점이 바뀐다 (Create account 전/후) | `AC-2R-14` |

### 11.2 유지되는 기존 AC

`AC-2-20`(복귀) · `AC-2-24`(문구 하드코딩 0건) · `AC-2-25`(키보드 전체 도달) · `AC-2-29`·`AC-2-30`(draft 정리) · `AC-2-31`~`AC-2-38` · `AC-2-50`~`AC-2-55` · `AC-2-58`~`AC-2-66`. 단 `AC-2-24`·`AC-2-25` 는 **적용 대상이 4단계 전체로 확대**된다.

### 11.3 신규 AC (14건)

| AC | 요구사항 | 검증 | 근거 | PENDING 예상 |
|---|---|---|---|---|
| **AC-2R-01** | 설문이 **4단계**(`reading-together` · `books-and-interests` · `growing-together` · `capability-items`)이고 각 단계 상단 제목이 바뀌며 **route 가 모두 동작**한다 | e2e | 사용자 지시 | — |
| **AC-2R-02** | 네 단계 **모두 한 화면에 카드 1장 = 문항 1개**이고 동시에 2문항이 보이는 화면이 0건이다 | DOM 검사 + e2e | 사용자 지시 | — |
| **AC-2R-03** | 네 단계 카드가 `179:1770` 과 **같은 덱 구조**다 (depth 3 · Y 오프셋 16 · 좌우 각 8 폭 감소) | Playwright 측정 + Figma 비교 | design-agent 실측 | — |
| **AC-2R-04** | 문항 배치가 §4.2 와 일치한다 — Reading together 2 · Books and interests 2 · Growing together 1 · Capability-items 10 (`R-04` 부결 시 2→1, 합계 14) | instrument 단위 테스트 | 질문지 v1.1, Baseline v1 | — |
| **AC-2R-05** | Create account 화면에 YOUR CHILD 이름 입력이 있고, **그 값이 `signUp` 요청 body 에 0건**이다 | Mock 요청 로그 전수 + 단위 테스트 | `R-01` A, `AC-2-05` | — |
| **AC-2R-06** | `About your child` 의 이름·생년월이 **Create account 입력값에서 읽혀 표시**되고, 기본 상태에서 재입력을 요구하지 않는다 | e2e (`prefilled-child-info`) | 사용자 지시 | — |
| **AC-2R-07** | 생년월이 **3~9세 범위 밖이면 입력 지점(Create account)에서 필드 에러**가 뜨고, `About your child` 에서 인라인 편집으로도 고칠 수 있다 (데드락 0건) | 단위(경계 4건) + e2e (`missing-prefill`) | `C-10`, `R-08` A | — |
| **AC-2R-08** | 카운터가 **전체 통산**(`n / 15`)이고 단계가 바뀌어도 숫자가 끊기지 않는다 | e2e | `R-02` A | — |
| **AC-2R-09** | 카드 수·소요 시간 문구에 **숫자 리터럴이 하드코딩되지 않는다** — `instrument-v2` 시나리오에서 화면 코드 수정 없이 수치가 따라 바뀐다 | grep + 시나리오 테스트 | `R-03`, 2026-09-26 원칙 | — |
| **AC-2R-10** | 필수/선택·단일/복수·상한·배타 규칙이 §4.7 과 일치하고, 화면이 아니라 **instrument `required`/`selection`/`maxSelections`/`exclusive` 값에서만** 판정된다 | 단위 + grep | `S2-ONB-1`, D-A | — |
| **AC-2R-11** | `1c Survey step 1 intro`(`243:1147`)·`About your child`(`248:1159`) 두 화면이 존재하고 흐름이 §5.4 순서대로 이어진다 | e2e | Figma, 사용자 지시 | — |
| **AC-2R-12** | Figma 시각 비교가 수행·기록된다: `179:1724`(**전체** — 아이 섹션 포함) · `243:1147` · `248:1159` · `179:1748` · `179:1770`(4단계 각각) · `179:1809`. 허용 차이(카드 수 파생값, Trial 안내 상태 분기)는 사전 기록 | Figma screenshot ↔ Playwright screenshot | `R-01`·`R-03`·`R-07` | — |
| **AC-2R-13** | **`POST /v1/consents` 성공 이전 구간의 모든 요청(가입 요청 포함)에 아동 데이터가 0건**이다. Create account 입력값은 로컬 저장소에만 존재한다 | Mock 요청 로그 전수 + 저장소 검사 | `AC-2-13` 강화, **Critical** | — |
| **AC-2R-14** | Trial(미가입) 경로에서도 Create account 화면의 아이 입력 → `About your child` 표시가 동일하게 동작하고 **네트워크 요청 0건**이다 | e2e + 요청 로그 0건 | `C-12` | — |
| **AC-2R-15** (`R-04`) | Q5 표지 그리드가 8종을 표시하고 선택값이 `ownedBooks` 로 제출된다. 선택 결과가 추천 후보에서 제외되는 것은 서버 동작이다 | e2e + payload 검사 | 질문지 Q5 | **`P2-BIP-13` BACKEND_INTEGRATION_PENDING** |

---

## 12. Test Strategy

| 계층 | 범위 |
|---|---|
| **contracts 단위** | step enum ↔ 응답 키 1:1 · `ChoiceQuestionId` ↔ 저장 위치 매핑 전수 · `toggleChoiceSelection`(배타·상한) · `unansweredRequiredQuestions`(단계별/전체) · 생년월 경계 4건 |
| **Mock 단위** | `instrument` 응답 parse · 새 step 키 `PUT steps` discriminated union · `consent-missing` 거부 · `instrument-v2` 결정성 |
| **Privacy 회귀 (Critical)** | 금칙 키(`firstName`·`lastName`·`birthYearMonth`·`gender`·`answers`) 가 **동의 이전 요청 전체**에 0건 — 가입 요청 포함. CI 고정 (`AC-2R-13`) |
| **Component** | 카드 1장 = 문항 1개 · 표시 전용 행 ↔ 인라인 편집 전환 · 통산 카운터 |
| **e2e (Playwright)** | 전체 흐름 1건(Create account → consent → step1 intro → About your child → survey intro → 4단계 → saved) · Trial 1건 · `missing-prefill` 1건 · 키보드 전용 15카드 도달 1건 |
| **시각 baseline** | **재수립 필요** — `s2-signup.png`(Create account 변경) · `s2-onboarding-intro.png` · `s2-onboarding-step5.png` · `s2-onboarding-saved.png`. 신규: step1 intro · about-your-child · 4단계 카드 각 1장 |
| **수동** | 393px 실기기에서 15장 스와이프 피로도, `248:1159` 가 852 를 넘는 1132 높이라 스크롤 동작 확인 |

### 12.1 영향받는 테스트 파일

```
e2e/onboarding.spec.ts          경로·단계 수 전면 수정
e2e/visual.spec.ts              baseline 4장 폐기 + 신규 7장
e2e/support/onboarding.ts       completeOnboardingToSaved 헬퍼 전면 수정
e2e/auth.spec.ts                Create account 폼 필드 추가
e2e/scenarios.spec.ts           신규 scenario 4종
e2e/a11y.spec.ts                카드 덱 4단계로 확대
apps/web/src/features/onboarding-survey/model/__tests__/*  5개 전부 키 rename
packages/contracts/src/__tests__/*                          step enum 테스트
```

---

## 13. 코드 재사용 / 폐기 범위

### 13.1 그대로 재사용 (구조적 이득)

| 자산 | 이유 |
|---|---|
| `SwipeDeck` · `SurveyQuestionCard` · `RadioGroup variant="card"` · `Chip` · `CheckboxGroup` | `179:1770` 정본 디자인이 이미 구현되어 있다. **4단계 통일은 이 컴포넌트의 적용 범위를 넓히는 작업**이다 |
| `instrument` 기반 렌더링 구조 (D-A 구조 제약 ②·③) | 문항 목록·순서·개수가 화면 코드에 없다. **단계 재배치가 `step` 필드 값 변경으로 끝난다** |
| `toggleChoiceSelection` · `readChoiceAnswer` · `applyChoiceAnswer` · `unansweredRequiredQuestions` · `stepsMissingRequiredAnswers` | 순수 함수. id 문자열만 바뀐다 |
| `OnboardingDraftStore` · `useOnboardingDraft` | **`R-01` 안 A 의 핵심 재사용 자산** — Create account 입력값 로컬 보관에 그대로 쓴다 |
| `childAgeInMonths` · `createBirthYearMonthSchema` | 나이 파생·범위 검증 로직 무변경 |
| `model/steps.ts` index 연결 | slug 배열과 enum 배열의 순서만 맞추면 자동 추종 |
| `mocks/fixtures/books.ts` | **Q5 의 8권이 이미 전부 들어 있다** (Goodnight Moon … The Snowy Day) |

### 13.2 폐기 / 전면 수정

| 자산 | 처리 |
|---|---|
| `ChoiceQuestionList` 의 **세로 목록 레이아웃** | 폐기 — 카드 렌더러로 교체 |
| `BooksStep.tsx` (230줄, 검색·집 책 입력) | **`R-04` 승인 시 폐기 또는 Stage 3 Library 로 이관** |
| `ChildInfoStep.tsx` 의 이름·생년월 **입력 블록** | 표시 전용 + 인라인 편집으로 재작성 |
| 시각 baseline 4장 | 폐기 후 재촬영 |
| `s2-onboarding-step5` 라는 **이름** | 단계 번호가 바뀌므로 이름 재정의 |

### 13.3 순 변경량 추정

- contracts: 7파일 수정 + (R-04 시) 1필드 추가. **구조 변경 없음, 주로 rename.**
- feature: 8파일 중 3파일 전면 수정, 5파일 rename 반영.
- mocks: 3파일.
- e2e: 6파일 + baseline 11장.

---

## 14. Open Decisions ★ 사용자 승인 필요

| ID | 항목 | 라벨 | 권장안 |
|---|---|---|---|
| **R-01** ★★ | **Create account 에서 아이 이름·생년월을 받는 방식** — `C-5`·`AC-2-05`·`AC-2-13` 과의 충돌 (§5.2·§5.3) | **NEEDS DECISION (Privacy Critical)** | **A. 로컬 선입력** — 화면에서는 받되 **서버로 전송하지 않는다.** 동의 기록 후 `submit` 1회로 전송. contract 변경 0건 |
| **R-02** | `1 / N` 카운터 — 통산 vs 단계 내 (§4.5) | **NEEDS DECISION** | **A. 전체 통산** (`n / 15`). 사용자 지시 "상단 제목만 바뀌면서" 와 일치 |
| **R-03** | 카드 수·소요 시간 문구를 instrument 파생값으로 (§4.6) | **RECOMMENDED** | 채택. `OnboardingInstrument.estimates` 추가 |
| **R-04** ★ | **Q5 표지 그리드가 PRD §7.2 Step 3(책 검색 최대 5권 + 집 책 리스트)을 대체하는가** | **NEEDS DECISION** | **대체 권장.** 근거 ① 질문지 v1.1(2026-04) 이 PRD v1.4 보다 뒤에 확정됐고 Q5 를 "단일 최고 ROI 문항" 으로 규정 ② 검색+목록 입력은 **카드 1장에 담기지 않아** 사용자 지시와 구조적으로 충돌 ③ "집에 있는 책 리스트" 는 Stage 3 Library 의 소유 상태와 중복. **단 표지 이미지 저작권 확보가 전제**(§6-3) |
| **R-05** | step enum rename 시 응답 키도 함께 rename (§7.2) | **RECOMMENDED** | 채택 (1:1 불변식 유지). `children.topic_tags`·`growth_goals` 컬럼명은 유지 |
| **R-06** | `child_info` 를 `OnboardingStep` enum 에 유지 (카드 단계가 아님) | **RECOMMENDED** | 유지. 배열 길이 5 가 보존돼 `OnboardingState` 검증·복귀 로직이 무변경 |
| **R-07** | `248:1159` 의 Trial 안내 문구 — 가입 후에도 표시? (§5.5) | **NEEDS DECISION** | **A. 상태 의존 슬롯** — 미가입에만 표시 |
| **R-08** | 표시 전용 이름·생년월의 **수정 경로** (§5.6) | **NEEDS DECISION** | **A. 같은 카드 인라인 편집** (데드락 방지) |
| **R-09** | `3yr 4mo` 는 클라이언트 파생 | **CONFIRMED (D-10 · AC-2-22)** | 변경 없음 — 확인만 |
| **R-10** | 성별 pill 의 수집 위치 (§5.8) | **NEEDS DECISION** | **A. 양쪽 모두 — Create account 선택 가능(선택 사항), About your child 편집 가능** |
| **R-11** | 관계(ABOUT YOU "Mom")는 **보호자 데이터** → `PATCH /v1/me` 로 전송 (`D-16`) | **CONFIRMED (D-16)** | 변경 없음. 단 화면 위치는 `About your child` 유지 |
| **R-12** | `243:1147` Survey step 1 intro 신규 route slug | **RECOMMENDED** | `/onboarding/start` — design 단계 확정 |
| **R-13** | 단계 제목 4종의 노출 문구 — `Capability-items` 가 Baseline 문서의 "No HARU vocabulary" 원칙과 어긋나 보인다 | **NEEDS DECISION (Low)** | Figma 가 Visual SoT 이므로 **그대로 유지** 권장. 변경하려면 디자이너 확인 필요 |
| **R-14** | `Growing together` 카드 1장 비대칭 (§4.4) | **RECOMMENDED** | 유지 — 문항을 창작해 채우지 않는다 |

---

## 15. PRD 수정 대상

`docs/decisions/stage-3-approvals.md` §5 의 1~6번에 **이어지는 번호**로 기록한다.

> **적용 방식은 `D-24`(2026-10-03, user, `stage-3-approvals.md` §11.1) 를 따른다** — OneDrive 원본과 저장소 사본을 **같은 패스에서 함께** 수정하고, 결과물 버전은 **v1.5** 다. 누적 6건(§5 · §6.2-4 · §9.3 5·6)과 아래 8건을 **한 번에** 적용한다.
> **이 Plan 은 PRD 파일을 수정하지 않는다** — 목록 산출까지가 plan-agent 범위다.

| # | PRD 위치 | 현재 PRD | 바뀔 내용 | 근거 | 전제 |
|---|---|---|---|---|---|
| **7** | **§7.2 구성 요소** | 온보딩 **5 Step** (Step 1 아이 기본 정보 / Step 2 성격·기질 / Step 3 책·선호도 / Step 4 성장 목표 / Step 5 4대 역량 문항) | **프로필 1 화면 + 설문 4단계** — `About your child` / `Reading together` / `Books and interests` / `Growing together` / `Capability-items` | 사용자 지시, Figma `179:1700` | — |
| **8** | **§7.2 Step 2** | "카드 선택형 문항(**활동성, 낯가림, 집중 성향, 선호 활동** 등)" | **관찰 가능한 행동 2문항**(Q1 이야기 자극 선호 · Q4 읽어 주는 동안의 모습). 추상 기질 축을 묻지 않는다 | 질문지 v1.1 "Temperament profiling … not invoked at onboarding" · 결정 `D-A` | 이미 Stage 2 구현에 반영됨 — PRD 만 미갱신 |
| **9** | **§7.2 Step 3 · §7.2 규칙** | "좋아하는 책·자주 읽는 책 **검색 선택(최대 5권)**, **집에 있는 책 리스트 입력**, 좋아하는 주제 태그(동물/탈것/공주/과학 등)" | **Q3 관심 영역 4종(+ not sure yet) + Q5 이미 아는 책 표지 그리드 8종**. 자유 입력 책 목록은 **Stage 3 Library 로 이관** | 질문지 v1.1 Q3·Q5, 사용자 지시(한 카드 한 문항) | **`R-04` 승인 시** |
| **10** | **§7.2 Step 1** | "아이 기본 정보: **이름(닉네임), 생년월**, 성별(선택), 관계, 언어 환경, 가족 내 독서 루틴" | **이름·생년월은 회원가입(Create account)에서 수집**하고 온보딩 프로필 화면은 **표시 + 나머지 항목 입력** | 사용자 지시, Figma `179:1724`·`248:1159` | **`R-01` 승인 시** |
| **11** | **§7.1 가입 / §7.2 전제** | 가입은 보호자 정보만 (`C-5` 로 확정된 해석) | 가입 화면이 **아이 이름·생년월(·성별)을 입력받는다.** 단 **서버 전송은 동의 기록 이후**이며 "동의 전 아동 데이터 미전송" 원칙은 유지된다 | 사용자 지시, `R-01` A | **`R-01` 승인 시**. `C-5` 도 함께 갱신 필요 |
| **12** | **§7.2 서두** | "전체 **5~7분**" | 측정 기준 변경 — 프로필 약 1분 + 설문 약 3분 (**instrument `estimates` 가 소유**, PRD 는 고정 수치를 명시하지 않는다) | Figma `243:1147`·`179:1748`, `R-03` | `R-03` 승인 시 |
| **13** | **§6 핵심 흐름 ②** | "온보딩 설문 … 아이 이름·나이·성격·기질, 언어 환경·독서 루틴, 좋아하는 책·집에 있는 책 리스트, 성장 목표, 4대 역량 문항 (**5~7분**)" | 7·9·10·12 번의 결과를 반영한 문장으로 교체 | 상동 | 상동 |
| **14** | **FR-03** | "온보딩 설문 위저드(아이 정보·언어 환경·독서 루틴·기질·선호 책·집에 있는 책 리스트·성장 목표·4대 역량 문항), 중도 저장·복귀" | 단계 구성 문구를 4단계 체계로 교체. **중도 저장·복귀 요구는 유지** | 상동 | 상동 |

> **8번은 `R-xx` 전제가 없다** — 이미 Stage 2 에서 결정 `D-A` 로 구현에 반영됐는데 PRD 만 갱신되지 않은 **기존 누락**이다. 이번에 함께 정리할 것을 권장한다.

**합계 8건 (7~14번).** 이 중 `R-01`·`R-04`·`R-03` 승인에 종속된 것이 5건이다.

---

## 16. Risks & Mitigations

| ID | 위험 | 심각도 | 완화 |
|---|---|---|---|
| **W-R1** | **동의 전 아동 데이터 전송** — Create account 화면에 아이 입력란이 생기면서 mutation·로그·자동 저장 중 하나가 새면 Critical | **Critical** | `R-01` A 채택 + `AC-2R-13` 전수 검사 테스트를 CI 고정. 입력값이 `OnboardingDraftStore` **한 경로만** 통과하도록 경계화. `SignUpWithEmailInput.strict()` 유지 |
| **W-R2** | 15장 카드가 길게 느껴져 이탈 | Medium | 통산 카운터 + ProgressBar + 단계 제목 전환으로 리듬 제공. `R-04` 부결 시 14장 |
| **W-R3** | Q5 표지 이미지 **저작권** | High | 실제 표지 사용 불가 전제. design-agent 가 **텍스트/일러스트 대체 카드** 설계. 미해결 시 `R-04` 보류 |
| **W-R4** | step/응답 키 rename 이 Stage 2-B(프로필 결과)·Stage 3 fixture 에 번지는 회귀 | Medium | contracts 를 단일 출처로 유지하고 타입 에러로 전수 검출. `pnpm typecheck` 가 1차 게이트 |
| **W-R5** | 시각 baseline 11장 재수립 중 "의도된 변경" 과 "회귀" 가 섞인다 | Medium | 변경 전에 폐기 목록(§13.2)과 허용 차이(`AC-2R-12`)를 **문서로 먼저 고정**하고 재촬영 |
| **W-R6** | `About your child` 가 1132px 높이 — 모바일 1화면을 넘는다 | Low | 스크롤 전제. 393/320px 과 200% 텍스트 확대에서 reflow 확인 (`AC-2-59` 회귀) |
| **W-R7** | 사용자 지시와 `C-5`(2026-09-14 사용자 결정)가 상충 — 둘 다 사용자 발화다 | High | **최신 지시 우선** 원칙(CLAUDE.md)에 따라 이번 지시가 우선하나, `C-5` 는 Privacy 결정이므로 **명시적 재승인**(`R-01`)을 받고 `stage-0-approvals.md` 의 `C-5` 를 갱신 대상으로 기록 |

---

## 17. Handoff to design-agent

`R-01`~`R-14` 승인 후 design-agent 가 확정할 항목.

| # | 대상 | 확인 사항 |
|---|---|---|
| 1 | `179:1724` Create account | YOUR CHILD 카드 실측(행 높이, 성별 pill, 나이 tag 위치), 한 줄 동의 체크의 토큰·터치 타깃, YOU 카드와의 간격 |
| 2 | `243:1147` Survey step 1 intro | 전체 실측 — **신규 화면**. 일러스트/캐릭터 유무, CTA, "About 1 minutes" 의 copy 슬롯 위치 |
| 3 | `248:1159` About your child | 1132px 레이아웃, **표시 전용 행 ↔ 인라인 편집**의 시각 구분(`R-08` A), 언어 chip wrap, 독서 루틴 radio 카드, Trial 안내 상태 분기(`R-07`) |
| 4 | `179:1748` Survey intro | 수치 문구의 copy 슬롯화 후 레이아웃 영향 |
| 5 | **`179:1770` 디자인의 4단계 적용** | 상단 제목 전환 규격, 통산 카운터 표기 위치(`R-02`), **복수 선택 카드**(Q3·Q2·Q5)가 단일 선택 카드와 같은 덱 안에서 어떻게 보이는지 — Figma 에 복수 선택 카드 변형이 **없다** |
| 6 | **Q5 표지 그리드 카드** (`R-04` 승인 시) | 카드 1장 안의 2열 그리드 8종, 선택 표시, **저작권 대체 표현** |
| 7 | ProgressBar | 4단계 구간 표현 방식 (통산 카운터와 중복되지 않게) |
| 8 | 단계 제목 4종 | 타이포 토큰·줄바꿈 (`Books and interests` 가 가장 길다) |
| 9 | 상태 화면 | `missing-prefill`(선입력 없음) · `instrument-v2`(문항 수 상이) 에서의 레이아웃 |
| 10 | 접근성 | 15장 카드의 키보드 전체 도달(`AC-2-25` 확대), 복수 선택 카드의 `role`/`aria` 설계, 표시 전용 행의 접근성 이름 |

**Figma 에 없어 `C-13` 절차(①디자이너 요청 / ②design-agent 명세)가 필요한 항목**: 5번(복수 선택 카드 변형) · 6번(표지 그리드 카드) · 9번(상태 화면).
