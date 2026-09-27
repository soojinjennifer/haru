# HARU Workflow State

> `/haru-stage-runner` 가 읽고 갱신하는 **단일 진행 상태 파일**이다.
> 사람이 읽어도 되지만, 수정은 원칙적으로 Stage Runner가 한다.
> 이 파일과 실제 저장소 상태가 다르면 **저장소 상태가 사실**이며, Runner는 불일치를 보고하고 멈춘다.

## 1. 현재 위치

| 항목 | 값 |
|---|---|
| Major Stage | **Stage 2** — Auth · Consent · Onboarding · Child Profile · Home 골격 |
| Stage Status | **`COMPLETE`** — Verdict `PASS` (2026-09-27, 3회차) |
| Next Step | **없음 — STOP.** Stage 3 진입은 사용자 승인 후 |
| Queue 파일 | `docs/workflow/stage-2/QUEUE.md` |
| QA Fix Loop 횟수 | 2 / 3 (2회차에 해소) |
| 마지막 갱신 | 2026-09-27 (Stage 2 COMPLETE — Verdict PASS) |

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
| `S1-B-3` | Design Spec §14 요약 수치 오류(Tier3 36↔48, provisional 48↔71, Semantic 164↔192) | 1-QA 이후 | design-agent 소관 |
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
| `S2-HOME-2` | 온보딩 화면 3건(`179:1748`·`179:1770`·`179:1809`) **시각 baseline 미생성** — AC-2-56 이 이 node 들을 명시한다 | `2-QA` | 확인 필요 |
| `S2-AUTH-2` | Apple 버튼 표면이 solid white 가 아니라 `variant=glass` — 허용 차이 `AD-S2-13` 등록됨. Design Spec §11.3 표 반영 여부 | design-agent | 정보 |
| `S2-COPY-1` | Figma `179:1763`/`179:1767` 문구가 5단계 소개 화면인데 Step 5 만 설명 — 교체 문구는 **기획 결정 필요**. copy 모듈에 빈 슬롯(`intro.durationSlot`·`formatSlot` = `null`)으로 두었고 슬롯이 비면 해당 InfoRow 를 렌더하지 않는다. 질문지 문서의 "~2.5 minutes · five questions" 는 Q1~Q5 만 센 값이라 **그대로 쓸 수 없다**(Step 1·Step 5 가 더 있다) | `2-ONBOARDING` 처리 완료 · 문구 확정 대기 | **결정 필요** |
| `S2-ONB-1` | 질문지 문서가 Q1·Q2·Q4 를 **Required** 로 적지만 결정 `D-C` 는 Step 2~4 를 **전부 선택**으로 확정 — 구현은 **D-C 를 따랐다**. 추천 엔진 cold-start 품질과의 트레이드오프 | 기획 확인 권장 | 확인 필요 |
| `S2-ONB-2` | 질문지 **Q5 표지 그리드**(8권 프리셋, 2열 커버 썸네일) 미구현 — 표지 이미지가 **Stage 3** 범위(Design Spec §4.3). 같은 데이터는 "집에 있는 책" 제목 입력으로 수집 중 | Stage 3 | 결정 필요 |
| `S2-ONB-3` | `HARU_Onboarding_Questionnaire_v1-1.docx.md` 가 `CLAUDE.md` Source of Truth 표에 **미등재** — 이 Step 으로 온보딩 문항의 근거 문서가 되었다 (approvals §8.3 재확인) | 사용자 판단 | 결정 필요 |
| `QA-1-004` | `devWarn` 주석의 살균 문자 집합 표기 부정확 · "PII 불가" 표현이 실제 보장보다 강함 · `import.meta.env.DEV` 게이트 없어 production 번들 포함 (1회차 `Icon.tsx` 와 동일 동작이라 회귀 아님) | Stage 2 착수 전 | 정보 (AC 는 PASS) |
| `QA-1-002` | TextField `trailingAction` 밑줄 — Figma `76:417` 에는 없음. WCAG 1.4.1 관점에서는 개선일 수 있어 QA 가 단독 판정하지 않음 | 사용자 판단 | **결정 필요** (AC 는 PASS) |
| `QA-1-003` | 일부 baseline 에 gallery nav pill·FAB 가 demo 블록 위에 겹쳐 캡처됨 — 가려진 영역 회귀 미탐지 | 1-QA 이후 | 정보 (AC 는 PASS) |
| `S1-G-6` | 확정 임계값 `maxDiffPixels: 200` 이 전체 프레임 baseline 에서 21px 아이콘 교체를 놓친다 (실측 diff 110–178px). 요소 단위 baseline 은 비율 0.002 로 정상 탐지(`v9-icon` 346px) | 사용자 판단 | 정보 · 조정 가능 |
| `S1-G-7` | source map(`dist/**/*.js.map`)에 소스 주석이 포함된다. 배포 JS/CSS/HTML 에는 dev 문자열 0건이나, map 을 함께 배포하면 소스 텍스트가 공개된다 | Stage 8 (C-18 프리뷰 배포) | 정보 |

**`NEEDS_DECISION` 항목이 다음 Step의 필수 입력이면 Runner는 실행하지 않고 STOP 한다.**
현재 `NEEDS_DECISION` 2건(`S1-D2-5` · `S1-D2-6`)은 **1-G 가 판단 근거(시각 비교 결과·실제 diff 수치)를 생성해야 결정할 수 있는 항목**이다. 근거 없이 지금 결정할 수 없으므로 1-G 는 제안값을 잠정 적용해 실행하고, **1-G 종료 시 실제 수치와 함께 사용자에게 제시**한다.

## 4. Major Stage 진행 (승인 게이트)

| Stage | 범위 | 상태 |
|---|---|---|
| 0 | Architecture · Figma Mapping · Design System · API Contract Planning | `COMPLETE` (승인 2026-09-14) |
| 1 | Frontend Foundation | **`COMPLETE`** (Verdict PASS, 2026-09-21). 이후 P-10 확정 + 그림자 클리핑 결함 수정 (2026-09-23, 미커밋) |
| 2 | Auth · Consent · Onboarding · Child Profile · Home 골격 | **`COMPLETE`** (Verdict PASS, 2026-09-27, 미커밋). **Stage 2-B**(`C13-09`·`C13-10`)는 디자이너 Figma 대기 |
| 3 | Home · Activity Card · Library · Recommendation | `NOT_STARTED` |
| 4 | Storytime Session · Recording Client · Upload UX | `NOT_STARTED` |
| 5 | Reflection · Async Analysis · Short Feedback | `NOT_STARTED` |
| 6 | Personalization · Profile Update · Recommendation Loop | `NOT_STARTED` |
| 7 | 4-Week Report · History · Highlight Audio · PDF UX | `NOT_STARTED` |
| 8 | Final QA · 이월 기능 · Mock 프리뷰 배포 · Backend Handoff → **STOP** | `NOT_STARTED` |

**Major Stage가 PASS해도 다음 Stage로 자동 진입하지 않는다. 반드시 사용자 승인을 기다린다.**
