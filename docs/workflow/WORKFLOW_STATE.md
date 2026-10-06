# HARU Workflow State

> `/haru-stage-runner` 가 읽고 갱신하는 **단일 진행 상태 파일**이다.
> 사람이 읽어도 되지만, 수정은 원칙적으로 Stage Runner가 한다.
> 이 파일과 실제 저장소 상태가 다르면 **저장소 상태가 사실**이며, Runner는 불일치를 보고하고 멈춘다.

## 1. 현재 위치

| 항목 | 값 |
|---|---|
| Major Stage | **Stage 3** — Home · Activity Card · Library · Book Selection · Recommendation |
| Stage Status | `IN_PROGRESS` — 사용자 승인으로 착수 (2026-09-28) |
| Next Step | **승인 체크포인트 — STOP.** Plan·Design Spec 이 아직 `DRAFT` 다. 결정 D-1~D-23 은 전건 승인됐으나 **두 문서에 대한 승인 발화가 없다** (`rules/workflow.md` §3 · Stage 0 #24 — "Stage 수행 요청은 승인이 아니다") |
| Queue 파일 | `docs/workflow/stage-3/QUEUE.md` (plan·design 승인 후 생성) |
| QA Fix Loop 횟수 | 0 / 3 |
| 마지막 갱신 | **2026-10-05** — Stage 2 재구성(설문 4단계·16카드 · 카드 좌우 버튼) 완료·QA PASS·푸시. Stage 3 문서 정합 확인(삭제 contracts·옛 step 이름 참조 0건, PRD v1.5, `SwipeDeck` 변경 무영향) |

### 끼어든 작업 — Stage 2 재구성 (2026-10-03 ~ 10-05, 완료)

Stage 3 착수 전에 사용자 지시로 **Stage 2 온보딩 설문을 재구성**했다. Stage 3 범위가 아니다.

| 항목 | 결과 |
|---|---|
| 구성 | 설문 **4단계 · 16카드**(Trial 15), 카운터 `n / 16`, 한 카드 = 한 문항 |
| 결정 | `stage-3-approvals.md` §11 (R-01~R-13 · S2R-OPEN-* · S2-FIX-1~4 · D-24·D-25) |
| QA | **PASS** (3회차). `AC-2R-01`~`15` + 결함 3건 |
| PRD | **v1.5** — 15건 적용, OneDrive 원본·사본 동일 확인 |
| 검증 | `test` 1103 · `test:e2e` **159** |
| 커밋 | `b58990a` · `fddc6a0` · `56d1a7a` · `2516996` (전부 push 완료) |
| 검수 도구 | `/__dev/screens` — 화면 목록 + Guard 뱃지 + 시나리오 링크 (dev 전용) |

사용자 검수 완료 (2026-10-05).

## 2-0. Step 진행 기록 (Stage 3)

| Step | Agent | 상태 | 비고 |
|---|---|---|---|
| `3-PLAN` | plan-agent | `COMPLETE` | `docs/plans/stage-3-plan.md` (925줄) · AC-3-01~79 · D-1~D-20 · C-13 8건 · PENDING 12건 예상 |
| **승인 체크포인트** | 사용자 | **대기 중** | design 차단: C-13 8건 + `D-1`(탭바 고정) · `D-4`(Prompt 노출) · `D-5`(카드별 역량) · `D-6`(Home IA) |
| `3-DESIGN` | design-agent | `PENDING` | 위 결정 후 |
| `3-IMPL` | development-agent | `PENDING` | 추가 차단: `D-13`(에셋·sharp) · `D-3` · `D-2` · `D-7` |
| `3-QA` | stage-qa-agent | `PENDING` | |

## 2-0. Step 진행 기록 (Stage 2)

| Step | Agent | 상태 | 비고 |
|---|---|---|---|
| `2-PLAN` | plan-agent | `COMPLETE` | `docs/plans/stage-2-plan.md` (875줄) · AC-2-01~68 · D-1~D-17 · PENDING 11건 예상 |
| `2-DESIGN` | design-agent | `COMPLETE` | `docs/design/stage-2-design-spec.md`(1090줄, 16화면) + `stage-2-designer-request.md`(C13-09·10) |
| **승인 체크포인트** | 사용자 | **`COMPLETE`** (2026-09-25 승인) | D-1~D-17 전부 승인(D-9·D-15 는 design-agent 이견 채택) · Layout=StackLayout · route 14 · 디자이너 요청 3건 전달 · P-17 등록 — `docs/decisions/stage-2-approvals.md` §4~§6 |
| `2-CONTRACTS` | development-agent | `COMPLETE` | enum 26종 · 도메인 schema 53 · 순수함수 11(전부 clock 주입) · 테스트 469→560 |
| `2-UI` | development-agent | `COMPLETE` | Shared UI 6종(22→28) · SwipeDeck overflow 0건 · 이월 4건 해소 · 테스트 560→604 |
| `2-AUTH` | development-agent | `COMPLETE` | 화면 5 · AuthGateway 9메서드 · Guard 순수함수(단위 47) · AppBackground 결함 수정 · 테스트 604→758 |
| `2-CONSENT` | development-agent | `COMPLETE` | 동의 5항목 · VPC 3상태 · AC-2-13 전수 검증 · 테스트 758→830 |
| `2-ONBOARDING` | development-agent | `COMPLETE` | Step 1~5 + 제출 + `/onboarding/saved` · instrument 교체 가능 구조(D-A) · 성장 목표=4대 역량(D-B) · Trial 요청 0건 · 테스트 830→979 · e2e 97→102 |
| `2-HOME` | development-agent | `COMPLETE` | Home skeleton(#33) · `/settings` 로그아웃 1행 · ConfirmDialog(D-7) + 로컬 draft·Query 캐시 정리(D-3 ②) · `PlaceholderPage` 삭제 · 인계 통합 `docs/qa/stage-2-handoff.md` · 테스트 979→997 · e2e 102→113 · baseline 38→39 |
| `2-QA` | stage-qa-agent | `COMPLETE` | 1회차 `FAIL` → 2회차 `INCOMPLETE` → **3회차 `PASS`**. In Scope 65건 중 FAIL·PARTIAL·NOT VERIFIED **전부 0**. 사용자 명시 수용 의존 항목 없음 |

**Stage 2-B (디자이너 Figma 대기)**: `C13-09` 프로필 결과 · `C13-10` 발전 역량 + Route Guard 프로필 결과 단계 + Plan `D-2`·`D-6`. 요청서 = `docs/design/stage-2-designer-request.md`

## 2. Step 진행 기록 (Stage 1)

| Step | Agent | 상태 | 커밋 | 비고 |
|---|---|---|---|---|
| `1-A` Toolchain · Workspace · packages/config | development-agent | `COMPLETE` | `67cf838`, `ff64507` | Node preinstall 가드 · dependency-cruiser 6규칙 · root scripts |
| `1-B` packages/design-tokens · Font Foundation | development-agent | `COMPLETE` | `7a0e044` | 토큰 305개(65/192/48) · Inter self-host · provisional 71/15항목 |
| `1-C` packages/contracts | development-agent | `COMPLETE` | `4c4ccaf` | schema 5 · enum 23 · rule 3 · health · zod-only 경계 실검증 |
| `1-D1` Shared UI 8종 | development-agent | `COMPLETE` | `d9a6927` | Button/IconButton/TextField/Checkbox/RadioGroup/Chip/Tag/ProgressBar |
| `1-D2` Shared UI 나머지 14종 | development-agent | `COMPLETE` | 미커밋 | 22종 완성 · 테스트 211→285 · lucide-react 1.47.0 · Tier 1 참조 0건 |
| `1-E` apps/web 기반 (Vite · Tailwind · Router · Layout · Error Boundary) | development-agent | `COMPLETE` | 미커밋 | apps/web 생성 · Tailwind 컴파일 검증 통과 · 테스트 285→313 |
| `1-F` API Client · Mock Layer · health 도메인 | development-agent | `COMPLETE` | 미커밋 | health end-to-end · scenario 5종 결정적 · AC-1-05 2모드 빌드 통과 · http 빌드 sentinel 0건(대조군 검증) · 테스트 313→403 |
| `1-G` Dev UI Gallery · Scenario Panel · Playwright | development-agent | `COMPLETE` | 미커밋 | gallery 6경로 · baseline 27건 · e2e 50 · Production 배제 검증 · 결정 4건 반영 완료 · 테스트 440 |
| `1-QA` Stage 1 최종 검증 | stage-qa-agent | `COMPLETE` | 미커밋 | 1회차 `INCOMPLETE` → QA-1-001 수정 → 2회차 **`PASS (accepted: D-01, S1-G-2)`**. AC 45건 전수 판정, FAIL·PARTIAL·NOT VERIFIED·PENDING 전부 0 |

상태 값: `PENDING` · `IN_PROGRESS` · `COMPLETE` · `BLOCKED` · `FAILED`

## 3. 미결 항목 (다음 Step에서 처리하거나 사용자 결정 필요)

| ID | 내용 | 처리 시점 | 상태 |
|---|---|---|---|
| `S1-D1-1` | Tag `neutral` 배경 → `--color-tag-neutral-bg` 신설 | 1-D2 | ✅ **해소** |
| `S1-D1-2` | `IconButton.size` → `size?: 'md'` 유지, sm/lg 미생성 | 1-D2 | ✅ **해소** |
| `S1-D1-3` | Button/IconButton loading → 공유 `Spinner` 교체 | 1-D2 | ✅ **해소** |
| `S1-D1-4` | `--haru-progress-fill-size` → `--progress-fill-size` 개명 | 1-D2 | ✅ **해소** |
| `S1-D2-5` | 탭 아이콘 → **`book`** + **`chart-no-axes-column-increasing`** | 1-G 수정 | **결정됨** (approvals §8) |
| `S1-D2-6` | 시각 임계값 → **`maxDiffPixelRatio: 0.002` + `maxDiffPixels: 200`** | 1-G 수정 | **결정됨** (approvals §8) |
| `S1-D2-1` | pnpm 12 가 `package.json` 의 `pnpm.overrides` 를 읽지 않아 override 를 `pnpm-workspace.yaml` 로 이동 (고정 의도 동일) | — | 정보 · Plan 문구는 plan-agent 소관 |
| `S1-D2-3` | Design Spec §6.2 의 `<ul role="list">` 가 `jsx-a11y/no-redundant-roles` 와 충돌해 `role` 제거. Safari VoiceOver 확인 필요 | 1-QA | 정보 |
| `S1-B-1` | Tailwind `@theme`/`@utility` 컴파일 검증 | 1-E | ✅ **해소** — 기본 팔레트·`sm:`/`xl:`/`2xl:` 0건, breakpoint md/lg 만 |
| `S1-B-2` | Inter woff2 preload | 1-E | ✅ **해소** — preload href 와 `@font-face` url 동일(중복 다운로드 0) |
| `S1-E-1` | Design Spec §3.4 예시 `border-subtle` → 실제 클래스는 `border-border-subtle` | 1-QA 이후 | 정보 · design-agent 소관 |
| `S1-E-3` | `TabLayout` 이 BottomTabBar 를 `fixed` 가 아니라 앱 컬럼 내 flex 행으로 배치 (시각 결과 동일) | Stage 3 | 정보 · 탭 마운트 시 재확인 |
| `S1-E-5` | 클린 체크아웃에서 `dist/` 부재 시 `prebuild`/`predev` 선행 필요 (폰트 resolve) | — | 정보 |
| ~~`S1-B-3`~~ | ✅ **해소** — §14 정정(Semantic 193 · Tier3 48 · provisional 71→41). 이전 내용: Design Spec §14 요약 수치 오류(Tier3 36↔48, provisional 48↔71, Semantic 164↔192) | 1-QA 이후 | design-agent 소관 |
| `S1-C-1` | `docs/qa/stage-1-handoff.md` 통합 인계 문서 | 1-G | ✅ **해소** |
| `S1-G-1` | **PageIndicator `interactive` dot 의 44 터치 타깃이 현재 기하로 불가능** — Spec §9.3(44 요구) ↔ §4.19(dot 7 + gap 6) 내부 충돌. 이웃 확장 영역이 서로를 덮어 1·2번 dot 은 측정 0×0 | 1-G 수정 | **결정됨** (approvals §8) |
| `S1-G-2` | **TextField 행 높이 42px < 44** (`--field-row-height`, Figma `76:364`). Spec §9.3 터치 표에 TextField 행이 없음 | 1-G 수정 | **결정됨** (approvals §8) |
| `S1-G-3` | Spinner 가 `prefers-reduced-motion: reduce` 에서도 회전 (Spec §9.2 위반) | 1-G | ✅ **해소** — `animation: none` 추가, e2e 양방향 회귀 차단 |
| `S1-G-6` | React StrictMode 이중 마운트가 `retry` scenario 1회차를 소비 | 1-G | ✅ **해소** — `consumeAttempt()` rollback + `retryOnMount: false` |
| `S1-E-2` | 320/393/600/1024 반응형 실측 | 1-G | ✅ **해소** — 앱 컬럼 272/345/480/480, 가로 스크롤 0 |
| `QA-1-001` | `no-console` 전면 차단 + 예외 경로 2개로 축소, `devWarn` 신설 | Fix Loop 1 | ✅ **해소** (QA 재현으로 확인) |
| **`L-02` 약관·개인정보방침 본문** | **외부 링크로만 연결(D-4). 실제 문서 본문·URL 이 없다.** 실제 사용자가 동의 화면을 만나기 전 반드시 준비돼야 하며, Mock 은 가짜 URL 을 쓴다. 걸어둔 곳: 이 표 · Stage 8 `BACKEND_HANDOFF.md` 출시 전 차단 항목 · Mock fixture + QA 확인 항목 | **출시 전 (법무 L-02)** | **추적 중** |
| ~~`D-A`~~ | ✅ **결정 + 반영 완료** — 질문지 문서 기준 + 교체 가능 구조 (approvals §8.1). `2-ONBOARDING` 이 `OnboardingInstrument` 로 구현: 코드=contracts · 문구=feature copy · 문항은 Mock instrument 응답 · 제출에 `{code, version}` 동봉 | `2-ONBOARDING` | 해소 |
| ~~`D-B`~~ | ✅ **결정** — 4대 역량과 **같은 목록 사용**. 비교·판정 표현 금지는 별도 유지 (approvals §8.2) | — | 해소 |
| ~~`D-C`~~ | ✅ **결정** — 현재 기준 유지 | — | 해소 |
| ~~`QA-2-001`~~ | SwipeDeck 마우스 클릭 불가 → 캡처 시점을 8px 이동 후로 지연 | Fix Loop 1 | ✅ **해소** (마우스·키보드·터치 3경로 재확인) |
| ~~`QA-2-002`~~ | 원인은 `StackLayout` 래퍼가 flex 가 아니었던 것 → `flex grow flex-col` | Fix Loop 1 | ✅ **해소** (safe-area 주입 시 Figma 대비 Δ2px) |
| ~~`QA-2-003`~~ | 소개 화면 문구 차이 → 허용 차이 `AD-S2-15` 등록 | Fix Loop 1 | ✅ **해소** |
| ~~`S2-HOME-2`~~ | 온보딩 3화면 영역 클립 baseline 추가 | Fix Loop 1 | ✅ **해소** |
| ~~`QA-2-004`~~ | ✅ **해소** — 진짜 원인은 소스 노드 차이(`179:1819` 미export, medallion 재사용). 사용자가 Figma `221:1147` 제공 → 614×830 2.0x 적용 + §2.11 여백 3:2 규칙 구현. 이전 내용: 캐릭터 에셋 비율 불일치. Figma `179:1819` 는 307×415(0.74)인데 번들 에셋 `hello-heart.png` 는 **464×464(1.00)**, `headphones.png` 도 376×376. 폭 307 에 세로비를 지키면 높이가 108px 모자라 spacer 가 한 곳에 몰려 캐릭터↔제목 여백이 Figma 59px ↔ 구현 282px | **사용자 결정** | **AC-2-56 PARTIAL 사유** |
| `S2-SRC-1` | `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` 가 온보딩 문항의 근거 문서가 되었으나 `CLAUDE.md` Source of Truth 표에 미등재 | 사용자 확인 | **확인 필요** |
| `S2-CONSENT-1` | `consent_events.source` 의 `signup_oauth` 미구분 — Google·Apple 가입도 `signup_email` 로 기록. 수정은 `consentSourceFor()` 한 함수 | 사용자 판단 | 결정 필요 |
| `S2-AUTH-1` | `docs/ARCHITECTURE.md` §7.2 가 `AuthGateway` 8메서드만 나열 — 구현·Plan §2.1·AC-2-06 은 9개(`refreshSession()` 누락) | — | ✅ **해소** (2026-09-26) |
| `S2-HOME-1` | Home 워드마크(`26:39`) **에셋화 여부** — Design Spec §2.13 은 "로고 에셋", `COMPONENT_MAP.md` 는 "SF Pro Heavy 21px 텍스트 로고 · 에셋화 NEEDS DECISION". 에셋이 없어 **텍스트(`--text-title-2` 22px heavy)** 로 구현하고 허용 차이 `AD-S2-14` 등록. 에셋 확정 시 `HomeTopBar` 의 `Text` 1곳만 교체 | 디자이너 | 결정 필요 |
| ~~`S2-HOME-2`~~ | ✅ **해소** — Fix Loop 1 에서 영역 클립 baseline 3건 추가. 이전 내용: 온보딩 화면 3건(`179:1748`·`179:1770`·`179:1809`) **시각 baseline 미생성** — AC-2-56 이 이 node 들을 명시한다 | `2-QA` | 확인 필요 |
| `S2-AUTH-2` | Apple 버튼 표면이 solid white 가 아니라 `variant=glass` — 허용 차이 `AD-S2-13` 등록됨. Design Spec §11.3 표 반영 여부 | design-agent | 정보 |
| `S2-COPY-1` | Figma `179:1763`/`179:1767` 문구가 5단계 소개 화면인데 Step 5 만 설명 — 교체 문구는 **기획 결정 필요**. copy 모듈에 빈 슬롯(`intro.durationSlot`·`formatSlot` = `null`)으로 두었고 슬롯이 비면 해당 InfoRow 를 렌더하지 않는다. 질문지 문서의 "~2.5 minutes · five questions" 는 Q1~Q5 만 센 값이라 **그대로 쓸 수 없다**(Step 1·Step 5 가 더 있다) | `2-ONBOARDING` 처리 완료 · 문구 확정 대기 | **결정 필요** |
| `S2-ONB-1` | 질문지 문서가 Q1·Q2·Q4 를 **Required** 로 적지만 결정 `D-C` 는 Step 2~4 를 **전부 선택**으로 확정 — 구현은 **D-C 를 따랐다**. 추천 엔진 cold-start 품질과의 트레이드오프 | 기획 확인 권장 | 확인 필요 |
| ~~`S2-ONB-2`~~ | 질문지 **Q5 표지 그리드**(8권 프리셋, 2열 커버 썸네일) 미구현 — 표지 이미지가 **Stage 3** 범위(Design Spec §4.3). 같은 데이터는 "집에 있는 책" 제목 입력으로 수집 중 | ✅ **결정** `D-12` | **Stage 2 Design Spec 개정**으로 명세, 구현은 Stage 3. 프리셋은 Mock fixture 값 — 화면 하드코딩 금지 |
| `S2-ONB-3` | `HARU_Onboarding_Questionnaire_v1-1.docx.md` 가 `CLAUDE.md` Source of Truth 표에 **미등재** — 이 Step 으로 온보딩 문항의 근거 문서가 되었다 (approvals §8.3 재확인) | 사용자 판단 | 결정 필요 |
| `QA-1-004` | `devWarn` 주석의 살균 문자 집합 표기 부정확 · "PII 불가" 표현이 실제 보장보다 강함 · `import.meta.env.DEV` 게이트 없어 production 번들 포함 (1회차 `Icon.tsx` 와 동일 동작이라 회귀 아님) | Stage 2 착수 전 | 정보 (AC 는 PASS) |
| ~~`QA-1-002`~~ | ✅ **해소** — 결정 `D-14` 로 밑줄 제거 + `P-17` 가값 등록 (Stage 2-UI). 이전 내용: TextField `trailingAction` 밑줄 — Figma `76:417` 에는 없음. WCAG 1.4.1 관점에서는 개선일 수 있어 QA 가 단독 판정하지 않음 | 사용자 판단 | **결정 필요** (AC 는 PASS) |
| `QA-1-003` | 일부 baseline 에 gallery nav pill·FAB 가 demo 블록 위에 겹쳐 캡처됨 — 가려진 영역 회귀 미탐지 | 1-QA 이후 | 정보 (AC 는 PASS) |
| `S1-G-6` | 확정 임계값 `maxDiffPixels: 200` 이 전체 프레임 baseline 에서 21px 아이콘 교체를 놓친다 (실측 diff 110–178px). 요소 단위 baseline 은 비율 0.002 로 정상 탐지(`v9-icon` 346px) | 사용자 판단 | 정보 · 조정 가능 |
| ~~`S2-TOKEN-1`~~ | `--space-7`(28) · `--space-10`(40) 이 토큰에 미정의인데 Design Spec 이 8곳에서 참조 | design-agent | ✅ **문서 해소** (2026-09-27) — **신규 토큰 2건 제안**, 추가는 development-agent |
| ~~`QA-2-005`~~ | Figma `179:1813`(27/33) · `179:1831`(30) 에 `--text-title-2`(22/28) 배정 — 흡수표 `AD-6`(27→28) 밖 | design-agent | ✅ **문서 해소** — `title-1` 로 정정 + `AD-S2-17` 등록. **구현 변경 필요** |
| ~~`QA-2-006`~~ | §2.11 축소 순서 ②(일러스트 비율 축소)가 실제로 발동하지 않음 | design-agent | ✅ **문서 해소** — 실제 동작으로 재작성 |
| ~~`QA-2-007`~~ | §2.11 이 `asset=hello-heart` 로 적고 검산 전제(제목 66)가 토큰(56)과 자기모순 | design-agent | ✅ **문서 해소** — `hello-heart-full` 정정 + 제목 68 기준 재계산 |
| ~~`S2-FOLLOW-1`~~ | ✅ **해소** (커밋 `ef0443a`·`0825112`) — 실측 검산 기준 대비 ≤0.01px. 이전 내용: 문서 개정에 따른 구현 반영 3건 — ① `--space-7`·`--space-10` 토큰 추가(렌더 변화 0) ② `OnboardingSaved` 제목 `title-2`→`title-1` ③ `LogInPage` 제목 `title-1` + 부제→소셜 간격 24→40. baseline `s2-onboarding-saved`·`s2-login` 재생성 | **development-agent** | **진행 중** |
| `S2-CARD-1` | 설문 카드 내부 간격 환산 정확도 — eyebrow→question 명세 4 ↔ Figma 7, question→옵션 명세 24 ↔ Figma 45. 질문 박스 높이가 실제 행수에 따라 달라져 baseline 과 함께 판단 필요 | 사용자 판단 | 정보 |
| `S2-WELCOME-1` | welcome 상단 여백 Figma 94 ↔ 명세 40 — Figma 에 없는 Apple 버튼(`AD-S2-2`)이 회수분을 쓰므로 복원하려면 화면 세로 재설계 필요 | 사용자 판단 | 정보 |
| `S1-G-7` | source map(`dist/**/*.js.map`)에 소스 주석이 포함된다. 배포 JS/CSS/HTML 에는 dev 문자열 0건이나, map 을 함께 배포하면 소스 텍스트가 공개된다 | **Stage 8 (C-18)** | ✅ **방침 결정** (2026-10-03, user) — **프리뷰 배포 빌드에서는 sourcemap 을 끈다.** 실측: mock 빌드 4.2MB 중 **2.8MB 가 `.map`** (끄면 ~1.4MB). 로컬·CI 빌드는 그대로 유지한다. 구현은 **Stage 8, development-agent** (`apps/web/vite.config.ts` — 선행 구현 금지) |
| `S3-ASSET-1` | Home 캐릭터 2x 미달 — 투명 원본 최대 **933px**(`Haru_Hello_Heart_t 1.png`), 표시 폭 528 기준 **1.77x**(123px 부족). Figma `221:1147` 전수 확인 결과 1056px 원본 없음(Figma Home fill 은 294×373 민트 베이크). 393px 뷰포트는 2.12x 충족 | ✅ **결정** `D-13` | **허용 차이 — QA `PASS (accepted: D-13)`.** 디자이너가 1056px 투명 원본을 주면 **에셋 파일만 교체** |
| `S3-ROUTE-1` | 서재 3개 시트의 **Mock 전용 route** — `app/router/mockPreviewRoutes.tsx` 한 파일에 모으고, route 가 사라져도 시트가 부모 화면 상태로 동작해야 한다 | ✅ **결정** `D-17` | **Stage 8 Handoff 제거 대상 등재 필요** |
| `S3-NOTIF-1` | 알림 **설정 화면**(`/settings/notifications` 시간·요일 입력, `C13-19`) Stage 3 미구현 — Figma 누락. D-16 push 권한 Port·Mock 은 구현 유지, contracts 는 정의 유지 | ✅ **결정** `D-18` | **디자이너 Figma 요청 + 이월.** Stage 3 QA 에서 Out of Scope (FAIL 아님) |
| `S3-PROMPT-1` | `Prompt.pageRef`(Figma `P.6`) 는 **책별 페이지 앵커 데이터**가 필요 — 큐레이션 20권 페이지 메타 없이는 생성 불가 | ✅ **결정** `D-8` | Frontend 는 표시만. **`BACKEND_INTEGRATION_PENDING` + 콘텐츠 제작 범위** |
| `P-20` | `Toggle` 치수 3종(`--toggle-track-w/h`, `--toggle-knob-size`) — iOS kit 외 근거 없음 | ✅ **가값 승인** `§8.5 ⑤` | `provisional` 주석 필수. 디자이너 값 도달 시 **토큰 값만 교체** |
| `P-22` | `conversation_only` 카드 일러스트 — 전용 에셋 없어 기존 캐릭터 에셋 재사용 | ✅ **가값 승인** `§8.5 ⑧` | 전용 에셋 도달 시 **파일만 교체** |
| `S3-COPY-1` | 증정 접수 안내 문구 — 잠정값 사용, 수치·기한 금지 | ✅ **결정** `§8.2` | 운영 표현 확정 시 **copy 모듈 값만 교체** |
| ~~`S3-DOC-1`~~ | §8.6 문서 갱신 7건 (Plan §16 · Stage 3 Spec · Stage 2 Spec · API_CONTRACTS · COMPONENT_MAP · designer-request · 이 파일) | ✅ **완료** (2026-10-03) | 2차 갱신(§9·§10)까지 반영. 추가 변경: `PLANNING.md` · `FIGMA_SCREEN_MAP.md` M-31 · `DESIGN_SYSTEM.md` · `DESIGN_TOKEN_MAP.md` |
| `S3-PROMPT-2` | Prompt 개수 **상한 해제** — `promptPreview`·`promptSet.questions` 에서 `.max(3)` 제거, `.min(1)` 유지. Frontend `slice(0,3)` 금지. `AC-3-17` 재작성 + Mock 에 **4개 이상 케이스** 포함 | ✅ **결정** `D-21` | `N-2` 와 `AC-3-17` 충돌 해소. 상한이 실제로 없음을 증명하는 테스트 필요 |
| `S3-CARD-1` | `ActivityCard.targetCapability` **삭제** — `D-5` 의 `options[].capability` 만 남는다 | ✅ **결정** `D-22` | `N-3` 과 같은 귀결 |
| `P-23` | Prompt 단계 배지 흰 라벨 대비 **1.72:1** — `P-02` 에 흡수하지 않고 신설 | ✅ **가값 승인** `§9.2 ⑫` | 대상·교체 조건이 `P-02` 와 다르다 |
| `S3-CHIP-1` | `Chip` 다중 선택이 **Stage 3 에 미마운트** (요일 선택이 유일 사용처였고 `D-18` 로 제외) → `P-02` 의 "미선택 Chip 경계" 증빙이 Stage 3 에서 사라진다 | ✅ **처리** `§9.2` | 가값 재제시 때 **Stage 2 온보딩 화면**을 증빙으로 쓴다 |
| `S3-TOGGLE-1` | `Toggle` 사용처가 **push on/off 1곳**으로 축소 (`D-18` 로 리마인더 토글 제외) | ✅ **처리** `§9.2` | **3종 유지.** 사용처 0건이 되면 그때 제외 |
| `S3-PRD-1` | PRD 수정 대상 **6건** (approvals §5 · §6.2 · §9.3) — ① FR-07/§7.4 prompt 노출 시점 ② §7.4/§8.3 카드별 역량 ③ §7.4 이번 주 집계 ④ FR-07/§8.2 개수 = 표시 개수 ⑤ FR-07/§8.2 `phase`·`pageRef` 개념 부재 ⑥ FR-07/§8.2 상한 없음 | **사용자 조치** (OneDrive 원본) | **미처리** — 저장소 사본은 수정하지 않는다 |
| `S3-CONTEXT-1` | Reading Context `custom_time` picker 규격(30분 단위, 네이티브 `input[type=time]` 금지)의 근거를 **`D-18` 에서 분리** — 이 시트는 Stage 3 In Scope(`AC-3-23`) | ✅ **결정** `§9.2 ⑩` | `D-18` 이월에 묶여 근거가 사라졌던 항목 |
| `S3-DB-1` | `activity_cards.target_capability` **DB 열** — `D-22` 는 contract 필드만 삭제했다 | ✅ **결정** `D-23` | **Backend 개발자 재량.** `DATA_MODEL`·`DATA_REQUIREMENTS` 에는 "역량 순환 중복 회피" **요구만**, 열 설계 미지정. `BACKEND_INTEGRATION_PENDING` 아님 |
| `S3-PROV-1` | 가값 번호 대장이 **3개 문서로 분산** (`P-01~16` stage-0 §4 / `P-17~19` stage-2 §6.4 / `P-20~23` stage-3 §6.4). 중복·빈 번호 없음. `P-18`·`P-19`·`P-21` 은 **재제시 목록에 없고** `P-19` 는 Stage 3 사용처 0건. Plan 이 "신규는 `P-18…`" 로 낡음 → 실제 다음 번호는 **`P-24`** | **Stage 3 구현 후** | **미처리** — Stage 0 #10-4 절차로 항목별 재제시. 번호 재배정 금지 |
| `P-24` | Library 연한 회색 `--color-fg-tertiary` → `--haru-ink-400`(`#9aabaa`) — **7 사용처 전부 WCAG AA 미달**(최악 **1.56:1**, 최선 2.38:1). `See all`·캐러셀 캡션·`3 of 5 nights`·Book List 메타·`Rated 4.5`·chevron·`ReadingNowCard` 메타. chevron 은 비텍스트 기준(3.0)도 미달 | ✅ **가값 승인** `approvals §18.2·§20.4` | `provisional: P-24` 주석 + dev gallery 등재 **완료**. `P-01`(2.58:1)과 **다른 사례** — 흡수하지 않는다. **디자이너 확인 병행 요청 필요** |
| ~~`P-05`~~ | ~~scrim~~ | ✅ **가값 해제** `approvals §19.4` | scrim 근거가 "DESIGN_TOKEN_MAP 제안" → **Figma 실측값 `rgb(0 0 0 / 0.34)`** 으로 바뀌어 가값 조건이 소멸. 감시 baseline `s3-sheet-scrim`·`s3-dialog-scrim` 신규 추가됨 |
| `S3-PROV-2` | **dev gallery 가값 목록에 `P-18`~`P-23` 이 등재되지 않았다** (`provisionalItems.ts`). Stage 3 Home 라운드에서 생긴 **기존 공백**이며 Library 범위 밖이라 1라운드가 고치지 않았다 | **가값 재제시 전** | **미처리** — 목록이 불완전하면 `#10-4` 항목별 재제시가 성립하지 않는다. `P-24` 는 등재됨 |
| `S8-DEPLOY-1` | **Render 정적 프리뷰 배포 (C-18)** — 사용자 요청으로 방식을 확인했고 **Stage 8 까지 보류**로 결정 (2026-10-03). Mock 빌드는 실측 검증 완료(`VITE_API_MODE=mock pnpm build` exit 0, `apps/web/dist`) | **Stage 8** | **보류.** 확정된 설정: Render **Static Site**(Web Service 아님) · Root Directory 비움 · Build `corepack enable && pnpm install --frozen-lockfile && VITE_API_MODE=mock pnpm build` · Publish `apps/web/dist` · **Rewrite `/*` → `/index.html`**(없으면 새로고침 404) · Node 는 `.nvmrc` 24.21.0, 안 먹으면 `NODE_VERSION` 환경변수. 도메인 불필요(`*.onrender.com` 자동). `assert:no-mocks` 는 이 빌드에 **적용하지 않는다**(mock 이 의도적으로 포함된다) |
| `S8-DEPLOY-2` | Render Static Site 에 **비밀번호 보호 기능이 없다** — URL 을 아는 사람은 누구나 본다 | **Stage 8 전** | **사용자 판단 필요.** 비공개 제품 디자인이 공개된다. Mock 데이터에 실제 아동 정보 없음·`VITE_*` Secret 없음은 확인됨 |

**`NEEDS_DECISION` 항목이 다음 Step의 필수 입력이면 Runner는 실행하지 않고 STOP 한다.**
현재 `NEEDS_DECISION` 2건(`S1-D2-5` · `S1-D2-6`)은 **1-G 가 판단 근거(시각 비교 결과·실제 diff 수치)를 생성해야 결정할 수 있는 항목**이다. 근거 없이 지금 결정할 수 없으므로 1-G 는 제안값을 잠정 적용해 실행하고, **1-G 종료 시 실제 수치와 함께 사용자에게 제시**한다.

## 4. Major Stage 진행 (승인 게이트)

| Stage | 범위 | 상태 |
|---|---|---|
| 0 | Architecture · Figma Mapping · Design System · API Contract Planning | `COMPLETE` (승인 2026-09-14) |
| 1 | Frontend Foundation | **`COMPLETE`** (Verdict PASS, 2026-09-21). 이후 P-10 확정 + 그림자 클리핑 결함 수정 (2026-09-23, 미커밋) |
| 2 | Auth · Consent · Onboarding · Child Profile · Home 골격 | **`COMPLETE`** (Verdict PASS 2026-09-27 · 커밋 `0825112` 까지). **Stage 2-B**(`C13-09`·`C13-10`)는 디자이너 Figma 대기 |
| 3 | Home · Activity Card · Library · Recommendation | **`IN_PROGRESS`** (착수 2026-09-28) |
| 4 | Storytime Session · Recording Client · Upload UX | `NOT_STARTED` |
| 5 | Reflection · Async Analysis · Short Feedback | `NOT_STARTED` |
| 6 | Personalization · Profile Update · Recommendation Loop | `NOT_STARTED` |
| 7 | 4-Week Report · History · Highlight Audio · PDF UX | `NOT_STARTED` |
| 8 | Final QA · 이월 기능 · Mock 프리뷰 배포 · Backend Handoff → **STOP** | `NOT_STARTED` |

**Major Stage가 PASS해도 다음 Stage로 자동 진입하지 않는다. 반드시 사용자 승인을 기다린다.**
