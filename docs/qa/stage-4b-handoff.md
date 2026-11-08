# Stage 4b Handoff

Status: **HANDOFF** · 작업 단위별로 절을 덧붙인다. **커밋하지 않았다.**

---

# `S4-F1` — 진입 · ready (2026-10-26, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-F1` 만**. `S4-F2`(recording·paused) · `S4-G1` · `S4-G2` · `S4-H1` · `S4-H2` · `S4-K` 는 착수하지 않았다.

## F1-1. Gate

| Gate | 결과 |
|---|---|
| Plan | `docs/plans/stage-4b-plan.md` 개정 1 — `Status: APPROVED (2026-10-26, user)` (`D4-58`) ✅ |
| Design Spec | `docs/design/stage-4b-design-spec.md` — `Status: APPROVED (2026-10-26, user)` ✅ (ready 본문은 상위 Spec `stage-4-design-spec.md` §2.2·§2.3·§2.6 이 유효 — 4b Spec §13 "유지") |
| 이전 단계 | Stage 4a `docs/qa/stage-4a-qa-report.md` §10 = `PASS (accepted: D4-34, NV-4A-1)` ✅ |
| PRD/Figma 모순 | 없음 — 구현 전 `get_metadata(300:1309)` · `get_design_context(300:1309)` · `get_design_context(163:1588)` 실측 (F1-9) |
| Backend 작업 | 없음. `apps/api` · `supabase` · `apps/mobile` 미생성 (F1-4) |
| 착수 차단 결정 | 없음 (Plan §13 — `S4-F1` 차단 0) |

## F1-2. 구현한 AC (판정은 QA 가 한다)

| AC | 근거 (테스트·명령) |
|---|---|
| **38** Start Session 활성 → `POST /v1/sessions` 1회 | `apps/web/__tests__/session-ready.test.tsx` "선택 확정(selection) 뒤 …정확히 1회" (요청 순서 `selection → sessions` 정확 일치) · 서재 경로 "책 상세 시트의 Start Session" · e2e `session.spec.ts` 전 흐름(`startSession`) |
| **39** 성공 후 `/session/:id` ready | 같은 테스트 — pathname `/session/<id>` + `Start recording` 버튼 표시 |
| **40** ready 버블 = `139:2803` | `session-ready.test` "제목 줄 = Mock `bubble.text`, pill 5개 = Mock `prompts` 글자 그대로" (텍스트 배열 정확 일치) · `tail-top-center`(Type3) · `88:757` 미사용 · n=1/3/7 → 1/3/5 |
| **86** Reading Context 시트 (`D4-35`, 원문 AC-3-22~26) | 6값 확정 라벨(CONFIRMED stage-3-approvals §8.5 ⑨) · `custom_time` 일 때만 시간 행 · 48항목 `HH:mm` · body 포함(`selection` · `sessions` 둘 다) · 미선택 = Continue `aria-disabled`(`D-9`) · 실패 시 시트 유지 + 오류 + 선택 보존 (`session-ready.test` 4건) · 키보드 Enter/화살표/Escape/포커스 복귀 (e2e "키보드: Enter 로 열고 …") |
| **110** `D4-11` | ① `IconButton.test` "declares --shadow-bubble and no longer references --shadow-rest" ② `<IconButton` JSX = HEAD **35곳**(+ 이 단위 신규 2곳 = 37, `.tsx`·테스트 제외) — 전부 같은 `.haru-icon-button--glass` 선언을 받는다(변형별 선언 0) ③ 클러스터 분해 = **F1-6** ④ 재생성 후 단독 실행 = F1-5 |
| **111** ready Record Control · 바 | `RecordControl.test`(Record 변형 · 캡션 · 같은 노드) · `session-ready.test` "Record 변형 + `Tap to recording` · Discard/Submit aria-disabled …" · e2e "Discard · Submit: opacity 0.5 …"(computed opacity 0.5 · 면/라벨 = 토큰 · 포커스 · 사유 · 요청 0) · e2e "Record 를 누르면 같은 노드가 Pause 로"(`data-e2e-mark` 노드 identity) |
| **117** 비활성 = 전역 opacity .5 하나 | e2e 같은 테스트 — 활성 전/후 **opacity 만** 0.5→1, 면·라벨·테두리 동일 · `Button.test` "neutral CSS … no extra disabled rule" ④ ⚠️ **기록 의무**: `opacity .5` 가 `Submit` 흰 라벨 대비를 **2.074 → 그 아래**로, `Discard` 를 **2.211 → 그 아래**로 낮춘다 (WCAG 1.4.3 disabled 제외 조항 — FAIL 아님) |
| **118** 바 가운데 | e2e `AC-4-118` 320 · 393 · 600(=480 컬럼) — 좌우 여백 차 ≤0.5 · 우단 ≤ 컬럼 · 버튼 131.5/135/135 · 393 에서 `{x:57, y:789, 279×45}` · `AD-S4-5`·`AD-S4-10` 등록됨(`D4-49`) |
| **119** `P-25` · `T-13` | `token-tiers.test` "세션 Discard 면이 gray-2 …"(secondary 값 불변 ⓐ) · `provisional.test`(`P-25` = neutral bg/fg 2종 · 활성 7건) · `fonts.test`(manifest provisional 44 · 항목 7) · dev gallery `provisionalItems.ts` 등재 + `gallery-helpers.test`·`provisional-registry.test` · `#aeaeb2` 리터럴 = `packages/design-tokens/src/primitive/color.css` 1곳뿐 |
| **120** 제목 = 응답 값만 · 1줄 clamp | `session-ready.test`(문자열 일치 · `truncate-1` · 긴 인사 가공 0) · e2e 320/393 "긴 인사도 제목 1줄(≤22) · 말줄임 · 높이 식 · Record 침범 0" · `Try this prompt` 리터럴: 제품 코드·fixture·copy 0건 (F1-3 grep) |
| **121** 인사 없음 | `session-ready.test` `greeting-missing`·`greeting-empty` → 제목 노드 0 · e2e "인사 없음 → 정확히 28 짧아진다" |
| **122** n × 제목 조합 | `SessionReadyBubble.test` 10 케이스(DOM) · e2e 8 케이스 높이 = 식 + n=0 미렌더 · ② **n=0 은 contracts 가 거부하지 않는다**(`prompts` 에 `.min` 없음 — 상위 Spec 의 `.min(1)` 기술은 `PromptSet.questions` 의 것이다) → 화면은 버블을 렌더하지 않는다 |
| **123** 오프라인 캐시 Start Session | `InlineAlert.test` `titleId` 2건(있음/없음 — 없음이면 DOM 에 id 0) · `session-ready.test` + e2e "오프라인 캐시: … aria-disabled · opacity .5 · 사유 = 배너 제목 · 요청 0" · 기존 `s4-home-offline-cached-*` baseline 은 **이 단위에서 바뀌지 않았다**(F1-6 실패 목록에 없음) |
| **124** 같은 상태 Save 활성 · 한 패스 | `session-ready.test` 같은 블록(Save `aria-disabled` 없음) · `D-3` 해제와 비활성 규칙이 **같은 변경 세트**(`ActivityCardDeck.tsx` 한 파일)다 — 커밋은 사용자 지시 시 ③ 온라인 복구 시 `isCached=false` → 비활성·`aria-describedby` 둘 다 사라진다(같은 조건 분기, 코드 직독) |
| **136** ready 닫기 | `session-ready.test` 3건(다이얼로그 0 · 전이 1건 `to=abandoned` · `/` · 실패 시 머묾 + 오류 · ready 에 칩 0) · e2e 2건(38×38 @ (331,10) = Figma (331,66) · `::before` inset −3 = hit 44) |
| ⏸ **46** 리마인드 **화면** 부분 | **구현하지 않았다 — NEEDS_DECISION F1-8 ①** (문구 출처 없음). 로직(5분 1회 · 10분 abandoned)은 조립됐다: `sessionRecorderEnvironment.test` "ready 리마인드 = 5분" |

## F1-3. 생성 · 수정 파일

| 구분 | 파일 |
|---|---|
| 토큰 | `packages/design-tokens/src/primitive/color.css`(`--haru-gray-2`) · `semantic/color.css`(`--color-action-neutral-bg/-fg` P-25 · `--color-surface-medallion-ring`) · `semantic/shadow.css`(`--shadow-record-core` T-3) · `semantic/space.css`(`--size-medallion-session` T-11, P-16) · `component/index.css`(Tier-3 **31종** — T-6·T-8·T-9·T-10·T-12·T-14·T-21) · 테스트 3(`token-tiers` · `provisional` · `fonts`) |
| Shared UI | `button/IconButton.css`(**`D4-11`**) · `button/Button.{tsx,css}`(`neutral`) · `feedback/InlineAlert.tsx`(`titleId`) · **신규** `record/RecordControl.{tsx,css}`(`idle`·`recording`) · **신규** `icon/haru/RecordMic.tsx`·`RecordPause.tsx` + `.svg` · `icon/haru/index.ts` · `index.ts` · `styles.css` · 테스트 5(`RecordControl` 신규 · `Button` · `IconButton` · `InlineAlert` · `haru-icons` · `provisional-markers`) |
| entities | **신규** `entities/session/`(`sessionKeys` · `useSessionDetail` · `useCreateSession` · `useCloseReadySession` · `sessionRecorder.tsx` 구독 경계 · `SessionReadyBubble` · `session.css` · 테스트) · `entities/activity-card/PromptPill.tsx`(`density`) · `activity-card.css` · `useSelectActivityOption.ts`(호출별 성공 콜백) · `entities/character/CharacterMedallion.tsx`·`character.css`(`session` 174) |
| features | **신규** `features/storytime-session/`(`StorytimeSessionScreen` · `SessionActionBar` · `copy` · css) · `features/activity-card-deck/`(`ActivityCardDeck` D-3 해제 · **신규** `ReadingContextSheet` · `ActivityCardOfflineBanner` titleId · `copy` · css) · `features/library/StartSessionAction.tsx`·`BookDetailSheet.tsx` · `features/settings/model/useSignOut.ts`(런타임 정리 주입) · `features/recording/`(`READY_REMINDER_AFTER_SECONDS = 300` 상수 1개) |
| pages · app | **신규** `pages/session/` · `app/router.tsx`(`/session/:sessionId` Fullscreen) · `app/providers/apiClients.ts`(녹음 플랫폼 선택 Web\|Mock) · **신규** `app/providers/sessionRecorderEnvironment.ts`(+ 테스트) · `ApiClientProvider.tsx` · `AppProviders.tsx` · `shared/config/routes.ts` · `shared/copy/library-copy.ts` · `styles/index.css` |
| Mock | **신규** `mocks/sessions/sessionFixtureScenarios.ts`(그룹 `session` · `session-greeting`) · **신규** `mocks/platform/mockRecordingPlatform.ts` · `mocks/fixtures/sessions.ts` · `mocks/sessions/MockSessionApi.ts` · `mocks/index.ts`(dev 전용 요청 로그 노출) · `src/test/harness.tsx` |
| 테스트 (앱) | **신규** `__tests__/session-ready.test.tsx`(19) · 수정 `home-stage3.test.tsx` · `library-sheets.test.tsx`(**`D-3` 해제로 단정이 뒤집힘** — 약화 아님: 비활성 단정 → 활성 + 시트 열림 단정) · `provisional-registry.test.ts` · `dev/__tests__/gallery-helpers.test.ts` · `dev/ui-gallery/provisionalItems.ts` |
| e2e | **신규** `e2e/session.spec.ts`(29) · `e2e/support/session.ts` · `e2e/shadow.spec.ts`(세션 양축 프로브 2) · baseline 신규 5 + 재생성 (F1-6) |
| 문서 | `docs/API_CONTRACTS.md` **Rev 8.5** (§5.4 구현 반영) · 이 파일 |

**grep 증거 (F1-1 Scope · Mock 하드코딩 · 리터럴)**

```
ls apps/api supabase apps/mobile            → 전부 No such file or directory
grep -rn "Try this prompt" apps/web/src packages (테스트·dist 제외) → 0건
grep -rn "#aeaeb2" apps/web/src packages/ui/src        → 0건 (토큰 primitive 1곳뿐)
features/storytime-session → features/recording import 0 (lint:boundaries 통과)
```

## F1-4 · F1-5. 검증 명령 (마지막 코드 수정 이후 전부 재실행, 2026-10-26)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | ✅ exit 0 (root · e2e · contracts · design-tokens · ui · web) |
| `pnpm lint` | ✅ exit 0 |
| `pnpm test` | ✅ **156 files / 2197 tests** (4a 기준선 152 / 2140 → **+4 / +57**) |
| `pnpm lint:boundaries` | ✅ no dependency violations (743 modules) |
| `pnpm build` | ✅ exit 0 |
| `pnpm format:check` | ✅ All matched files use Prettier code style |
| `pnpm assert:no-mocks` | ✅ MOCK · DEV sentinel 0 · `haru-dev-` 0 · sharp 흔적 0 (dist 4파일) |
| `pnpm test:e2e` (**단독** — 다른 Playwright 없음 확인) | ✅ **326 passed (8.0m)** (4a 기준선 295 → **+31**: `session.spec.ts` 29 + `shadow.spec.ts` 세션 2) · 재생성 직후 결과와 같고 baseline 추가 변경 0 |
| `ls apps/api supabase apps/mobile` | 전부 No such file or directory |

## F1-6. baseline 변경 분해 (`R-BASELINE-1` ⑤⑥ · AC-4-110 ③)

1회차 단독 e2e(재생성 전, 295) = **24 실패 / 271 통과** (9.8m). 실패 24건의 `*-expected` ↔ `*-actual` 을 **픽셀 연결성분(8-이웃, 채널 차 > 0)** 으로 분해했다 (스크립트: 스크래치 `tools/clusters.cjs`).

| 원인 | 대상 baseline | 클러스터 (Δ≥2) | Δmax |
|---|---|---|---|
| **A. `D4-11`** IconButton glass 그림자 3겹 → 1겹 | `frame-320` · `frame-393` · `frame-600` · `frame-1024` · `frame-320-text-200` (TopBar 좌·우 IconButton 2개) · `v9-icon-button` · `v9-top-bar` · `v9-focus` · `v9-state-{loading,empty,error,offline}` (TopBar back) · `s2-deck` · `s2-deck-{reading-together,books-q3,books-favorites,growing-together,capability}` (설문 덱 이전/다음) | 전부 **IconButton 1개당 1개** — 크기 46–114 × 61–116 (구 3겹 번짐 영역) | 7–17 |
| **B. `D-3` 해제** (`AC-4-38`) — Start Session 이 `aria-disabled`(opacity .5) → 활성 | `s3-home` · `s3-home-deck` · `s3-home-deck-scrolled` · `s3-home-card-save-saved` · `s3-tabbar-top` · `s3-library-book-sheet` | **Start Session 버튼 1개**(Home ActionBar 282×102 · 상세 시트 292×83 등) | 58–60 |
| C. 채널 차 **1** 잔여 | Home 4건(`s3-home` 2649px · `-deck`·`-scrolled` 371px · `s3-tabbar-top` 50px) | Δ1 만 | 1 |

**설명되지 않는 클러스터 0건** — 근거:

1. **런타임 토글 재현** (`R-BASELINE-1` ⑥): `IconButton.css` 를 `--shadow-rest` 로 되돌리고 + Start Session 을 다시 `aria-disabled` 로 두고, **임계값 0 · maxDiffPixels 0 · ratio 0** 으로 실패 24건만 재실행 → **20건 픽셀 완전 일치**, 남은 4건(Home)은 **Δ1 뿐**(Δ≥2 클러스터 0).
2. **C 의 출처**: 같은 4건을 **HEAD(`267ed12`) 코드**(git worktree, 같은 임계값 0)로 돌려도 **같은 픽셀 수(2649 · 371 · 371 · 50)·같은 Δ1** 이 나온다 → 이 단위가 만든 차이가 아니다(기존 baseline ↔ 현재 렌더 환경의 1/255 차, 임계값 0.02 아래). 같은 코드 2회 실행의 actual 은 바이트 동일(결정적).
3. 토글·worktree 는 검증 후 전부 원복했다(`git worktree list` = 본 작업트리 1개).

**`--update-snapshots=all` 재생성 결과 (326 passed, 8.4m) — 바뀐 baseline 31 = 실패 24 + 통과했지만 다시 쓰인 7.** 재생성 후 HEAD baseline ↔ 새 baseline 을 같은 방법으로 분해했다.

| 원인 | 수 | baseline |
|---|---|---|
| **A `D4-11`** | 18 | `frame-320` · `-393` · `-600` · `-1024` · `frame-320-text-200` · `s2-deck` · `s2-deck-{reading-together, books-q3, books-favorites, growing-together, capability}` · `v9-icon-button` · `v9-top-bar` · `v9-focus` · `v9-state-{loading, empty, error, offline}` |
| **B `D-3` 해제** | 7 | `s3-home` · `s3-home-deck` · `s3-home-deck-scrolled` · `s3-home-card-save-saved` · `s3-tabbar-top` · **`s3-tabbar-bottom`**(통과했던 것 — Start Session 클러스터 1개, Δ60) · `s3-library-book-sheet` |
| **C 환경 Δ1** | 5 | `s2-login`(9px) · `s2-welcome`(20px) · `s2-onboarding-saved`(2968px) — **HEAD 코드 임계값 0 실행에서 같은 픽셀 수** · `s2-onboarding-intro` · `s2-onboarding-start`(각 9px Δ1) — HEAD 실행에서도 Δ≤2 가 67~68px 로 나와 **실행마다 흔들리는 가장자리 노이즈**다 |
| **D 토큰 갤러리 증가로 인한 위치 이동** | 1 | `v2-material` — Δ≤4, Stage·마지막 swatch 의 **아래쪽 둥근 모서리 6곳**(3×7 이하). dev 토큰 갤러리가 CSS 를 스캔해 위 섹션에 새 토큰(`--haru-gray-2` · neutral 2 · 메달리온 링 · `--shadow-record-core` · `--size-medallion-session`)을 더 그려 이 블록이 아래로 밀리며 서브픽셀 안티앨리어싱이 달라졌다. **검증**: 새 토큰 항목을 DOM 에서 빼고 찍으면 HEAD baseline 과 **바이트 단위 동일**(차이 채널 0) |

합계 **18 + 7 + 5 + 1 = 31** — 남는 것 없음. 신규 baseline 5 (`s4-session-ready` · `-320` · `-no-greeting` · `-long-greeting` · `s4-reading-context-sheet`).

## F1-7. Mock 시나리오 · 전환 방법

| 전환 | 동작 |
|---|---|
| `?scenario=session:prompts-1` · `prompts-3` · `prompts-7` · `prompts-empty` | 새 ready 세션의 Prompt 1 · 3 · 7 · 0개 (기본 5) |
| `?scenario=session-greeting:greeting-missing` · `greeting-empty` · `greeting-tight` · `greeting-long` | 인사 null · `''` · 320 에서만 넘침 · 두 폭 모두 넘침 (아이 이름 없음) |
| 조합 | `?scenario=session-greeting:greeting-missing,session:prompts-7` |
| 기존 재사용 | `sessions.create:error`(시작 실패 · 시트 유지) · `sessions.transition:error`(ready 닫기 실패) · `activity-cards:offline-cached-card`(Start Session 비활성) · `recorder:*`(Mock 녹음기 — `mock` 모드 조립) |
| e2e 증거 | dev 서버에서 `window.__HARU_MOCK_REQUEST_LOG__.entries()` (DEV 가드 · 탭 단위 공유 로그) |

## F1-8. 발견 문제

| 구분 | 내용 |
|---|---|
| **Blocking** | 없음 |
| **NEEDS_DECISION** | ① **ready 리마인드 버블(AC-4-46 화면 부분)의 문구 출처가 없다** — 상위 Spec §7 ⑦ 은 "같은 버블의 **제목만 교체**" 라고만 적고, contracts `SessionSummary` 에는 `bubble`(인사) 하나뿐이다. 캐릭터 버블 문구는 **API 응답 값만** 표시해야 하므로(`rules/architecture.md` §8, AC-4-120 ②) Frontend 상수로 만들 수 없다. 선택지 ⓐ contracts 에 리마인드 문구 필드 추가(`SessionSummary.reminderBubble` — plan-agent · `API_CONTRACTS` 변경) ⓑ copy 모듈 고정 문구로 예외 허용(`D4-55` 같은 결정) ⓒ 리마인드는 시각 변화 없이 Backend push 등 다른 경로. **컨트롤러 로직(5분 1회 · 10분 abandoned)은 조립 완료** — 화면만 비어 있다 ② **문구 승인** (시안·Spec 에 없음, `S4B-Q9` 목록 밖): `Session actions`(바 group 이름) · `Available after you start recording.`(ready 비활성 사유) · `We couldn't close this session. Please try again.`(닫기 실패 Toast) · `We couldn't open this session.`(세션 조회 실패) · `We couldn't start the session. Please try again.`(시작 실패) · Reading Context `Choose a time`(placeholder) · `Back`(시간 목록 뒤로) — 전부 copy 모듈 한 곳이라 교체 비용 작다 ③ **Reading Context 시트 트리거** — `D4-35` 는 "트리거·시간 선택기 명세를 그때 정한다" 였는데 4b Spec 에 트리거 명세가 없다. Stage 3 Spec §2.4 "카드 CTA → 이 시트 → `POST …/selection`" 을 그대로 따랐다(= Start Session). 시간 목록의 **뒤로** 버튼은 Sheet 의 유일한 헤더 슬롯(`trailing`)에 `chevron-left` 로 두었다 — 확인 필요 |
| **Non-blocking** | ① **ready 닫기는 `RecordingController.discard()` 가 아니라 단일 전이 요청**(`useCloseReadySession`)이다 — 컨트롤러는 전송 실패에도 로컬을 `abandoned` 로 먼저 닫아(오프라인 Discard 를 outbox 에 적재하는 `D4-13` 설계) AC-4-136 ④ "실패 시 화면 유지" 와 맞지 않는다. 컨트롤러는 화면 이탈 시 `dispose()` 된다 ② **세션 화면은 `status === 'ready'` 로 열린 세션만 그린다** — 다른 상태(이미 끝남 · `session-already-active` 의 recording)는 `/` 로 돌아간다. 복귀 경로(AC-4-35)·재진입·크래시 복구 화면은 `S4-F2`/`S4-H2`. `SESSION_ALREADY_ACTIVE` 는 지금 시작 실패 오류로만 보인다 ③ **recording 상태는 과도기 화면이다** — Record 를 누르면 같은 노드가 `Pause` 로 바뀌고 바가 활성화되고 버블이 사라지는 데까지다. 책 칩·상태 블록·Prompts 칩·닫기 다이얼로그·`Discard`/`Submit` 동작은 `S4-F2` (지금 두 버튼은 눌러도 아무 일도 하지 않는다) ④ **제목 line-height = 22** (`--text-headline--line-height`) — 상위 Spec 은 `--text-callout`(16/21, Δ1 흡수)을 적었으나 그러면 본체가 268 이 되어 AC-4-121 ⑤ "정확히 28" · AC-4-122 식(269)이 깨진다. Figma 16/22 그대로가 되도록 기존 Semantic 을 썼다(신규 토큰 아님) ⑤ **tail 돌출 = 10.627** — 상위 Spec §2.2.2 는 {0, 2.63} 으로 좁혔으나 `get_design_context(300:1309)` 원문(컨테이너 22.627 + `mb -12`)과 Figma 렌더 픽셀 프로브(가운데 열 첫 흰 행 329, 본체 337.6)가 **10.6** 을 가리킨다. e2e 가 8–11 범위로 고정 ⑥ **Tier-3·Semantic 추가 중 Spec 표에 없던 것**: `--color-surface-medallion-ring`(Spec §5.1 이 Primitive `--haru-white-a50` 을 직접 적었으나 화면은 Semantic 만 쓸 수 있다) · `--session-medallion-offset`(76) · `--session-medallion-ring-size` · `--session-bubble-offset`(5) · `--session-bottom-gap`(= `--space-4-5`) · `--bubble-session-pad-block-end`(13) · `--bubble-session-title-line` · `--record-icon-offset-labeled`(Spec §2.6.1 이름 그대로) · `--record-pulse-*` — 전부 Figma 실측값 또는 기존 토큰 별칭 ⑦ 닫기 글리프는 Lucide `x`(md 20, 기존 시트 닫기 선례)다 — Figma 는 15×15 stroke 1.375(상위 Spec §12.4 ⑥ 미결) → Visual Gap 판정 대상 ⑧ Reading Context 시트의 `legend` 가 제목과 같은 문장으로 한 번 더 보인다 — `SelectTrigger` 시트(Stage 2)와 같은 선례다 ⑨ mock 모드 조립은 dev StrictMode 에서 번들이 2개 만들어질 수 있다(하나는 버려진다 — 기존 동작). 버려진 쪽의 녹음 런타임도 `warmUp` 된다 — 요청은 가지 않지만 Production(StrictMode 없음)에는 해당 없다 ⑩ `S4-E` E-8 ②(로그아웃 = 런타임 `clearAll`)를 닫았다. E-8 ④(재진입 `activeSessionIds`)는 재진입 경로가 생기는 단위로 넘긴다 |

## F1-9. Figma 실측 (구현 전) · design-agent Visual Gap 검토 대상

| 대상 | 노드 | 실측 방법 | 구현 스크린샷 |
|---|---|---|---|
| ready + 닫기 | **`300:1309`** (닫기 `300:1318`) | `get_metadata` · `get_design_context`(+ 렌더 PNG) · 에셋 SVG 원문(mic · X · 코어 filter · 링 2겹 · 메달리온 링 filter) · 아바타 PNG 대조(= 기존 `headphones` 에셋, 348² vs 376²) | `e2e/__screenshots__/darwin/session.spec.ts/s4-session-ready.png` (393×852) · `s4-session-ready-320.png` |
| ready 버블 | `139:2803` (`88:838` Type3) — `300:1313` | 위 `get_design_context` 원문 | `s4-session-ready-no-greeting.png` · `s4-session-ready-long-greeting.png` |
| Record Control `Record` / `Pause` | `163:1589` / `163:1588` | `get_design_context(163:1588)` + pause SVG 원문 | `s4-session-ready.png` (Record) — Pause 는 F2 baseline |
| 하단 바 | `285:1445` (`300:1315`) | 위 원문 (`gray-2` · teal · 135×45 · gap 9) | `s4-session-ready.png` |
| Reading Context 시트 | Figma **없음** (Stage 3 Spec §2.4 `C13-15` 명세) | — | `s4-reading-context-sheet.png` |
| `D4-11` IconButton | `78:157` · `29:76` · `300:1318` | `get_design_context(300:1318)` — drop `0 6 4 ink8%` 1겹 + inset 2겹 | 재생성된 `frame-*` · `v9-*` · `s2-deck*` |

Visual Gap 에서 볼 것: 닫기 X 글리프(F1-8 ⑦) · 아바타 ↔ 링 · tail 돌출(⑤) · pill 2줄 렌더 · 라벨 `Tap to recording` 11px(Spec §5.4-② 흡수) · Web y = Figma y − 56 으로 생긴 버블 ↔ Record 사이 유연 간격(+56).

## F1-10. `BACKEND_INTEGRATION_PENDING` 예상

| 항목 | 내용 | Handoff |
|---|---|---|
| RU-19 | `POST /v1/sessions` 의 `readyAt` = **클라이언트 시각**이고 ready 리마인드(5분)·방치(10분) 타이머의 기준이다 — 서버 sweeper 도 같은 기준을 써야 클라이언트와 어긋나지 않는다 | `BACKEND_HANDOFF.md` |
| RU-20 | ready 닫기(`D4-57`)와 10분 방치가 **같은 전이**(`ready → abandoned`, caregiver)다 — 사유 필드 없음(`D4-13` 귀결) | `BACKEND_HANDOFF.md` |
| RU-21 | Activity Card 경로는 `POST …/selection` **뒤에** `POST /v1/sessions` 를 보낸다(같은 `readingContext`·`customTime`). 서버는 두 요청의 Reading Context 가 같다고 가정할 수 있다 | `API_CONTRACTS.md` §3.2 |
| 기존 | 인사 문구 생성·길이 제약(`P4-BIP-11`) · `book` 세 경로 채움(`P4-BIP-01`) | 변동 없음 |

## F1-11. Scope 경계에서 보류한 것

| 보류 | 이유 |
|---|---|
| AC-4-46 리마인드 화면 | F1-8 ① NEEDS_DECISION |
| recording·paused 화면 · `Discard`/`Submit` 동작 · 닫기 다이얼로그 · RecordControl 나머지 3변형 · 경청 breathing | `S4-F2` |
| Prompts 칩 · 팝업 · Drawer · `PromptCarousel` · `T-1` | `S4-G1`·`S4-G2` |
| 완료 화면 · 예외 안내(마이크 거부 시트 · 공지 슬롯 · 오프라인 Toast · 크래시 복구) | `S4-H1`·`S4-H2` |
| 진행 중 세션 복귀(AC-4-35) · 재진입 | `S4-F2`/`S4-H2` |
| `session:book-*` 시나리오 | 책 칩이 생기는 `S4-F2` |
| dev Scenario Panel 에 `sessions`·`session`·`session-greeting` 그룹 노출 | 4a 와 같이 URL 전환만 (패널 등재는 요청 시) |

---

# `S4-F1R` — ready 리마인드 화면 + Visual Gap F1 후속 (2026-10-27, development-agent)

근거: `stage-4b-plan.md` §13.1 (개정 1.1) · AC-4-46 화면 부분(§14.1) · `API_CONTRACTS.md` Rev 8.6 §3.2.2 · §5.4 · 4b Spec §16 · §5.3 T-22~T-30 · `stage-4b-visual-gap-f1.md` VG-F1-01 · 결정 `D4-59`·`D4-62`·`D4-63`·`D4-64`.

## F1R-1. Gate

Plan·Spec `APPROVED (2026-10-26, user)` · 개정 1.1 은 APPROVED 유지 · 선행 `S4-F1` 완료 · In Scope 에 Backend 작업 0 · `apps/api`·`supabase`·`apps/mobile` 부재(`ls` 확인) · 신규 dependency 0.

## F1R-2. 구현 항목 (판정은 QA)

| 항목 | 구현 | 증거 |
|---|---|---|
| **`D4-59` contracts** | `SessionSummarySchema.reminderBubble: SessionBubbleCopySchema` (required · nullable · `.max` 없음) | `packages/contracts/src/__tests__/sessions.test.ts` — null · `text: null` · `''` · 문자열 · 500자 통과, 키 누락 거부 |
| **`D4-59` Mock** | `MOCK_READY_REMINDER_BUBBLE` = `Ready when you are!` (ready·active·history fixture 전부) · `session-greeting:reminder-missing` = 인사 정상 + `reminderBubble: null` | Mock 응답 `SessionSummarySchema.parse` 유지 (fixture 생성기가 parse) |
| **AC-4-46 화면** | `SessionReadyBubble` 에 `reminderBubble` · `reminderActive` prop. `StorytimeSessionScreen` 이 `snapshot.readyReminderShown`(컨트롤러 `D4-46` 신호)을 넘긴다. 켜지면 **제목 줄 글자만** 교체 — 같은 노드 · 1줄 clamp · pill 불변. 리마인드 null/`text` null/빈 문자열이면 DOM 불변. 문구 상수·fallback 0 | 단위 `SessionReadyBubble.test.tsx` (같은 노드 · pill outerHTML 동일 · null 3종 × 인사 2종 innerHTML 동일) · 통합 `session-ready.test.tsx` 주입 clock(`createManualScheduler`) ① 4:58 = 인사 · 제목 변화 0 ② 5:00 이후 = 리마인드, 이후 9:58 까지 추가 변화 0(MutationObserver) ③ `reminder-missing` 5분 전후 `.haru-session` innerHTML 동일 ④ 10분 → `abandoned` 1건 → `/` · e2e `s4-session-ready-reminder`(Playwright `page.clock`, 버블 높이·top·pill 높이 불변 · 제목 22) |
| ⑤ 리터럴 grep | `grep -rn "Ready when you are!" apps packages` (node_modules·dist 제외) → `apps/web/src/mocks/` 밖 **0건** | — |
| **VG-F1-01** 닫기 X | HARU 전용 `haru:session-close` (`packages/ui/src/icon/haru/SessionClose.tsx` + `session-close.svg`) — Figma `29:77` export 원문 그대로(viewBox 15 · path 3.125→11.875 · stroke 1.375 · round), `#5E7370` → `currentColor`. 박스 15 = `--icon-button-icon-size-close`(T-30), 사용 지점 `storytime-session.css`. Lucide `x` 대체 | `haru-icons.test.tsx` (svg ↔ 코드 도형 일치 · HEX 0) |
| **`D4-62`** | `--icon-button-fg: var(--color-action-secondary-fg)` (T-29) · `.haru-icon-button--glass { color: var(--icon-button-fg) }`. **plain 은 미변경**(`--color-fg-primary`) | `IconButton.test.tsx` CSS 단정 · 렌더 프로브: 글리프 최암 픽셀 **(94,115,112) = Figma 값**, glass 면 (246,250,249) 대비 **4.80**(세션 닫기) / **4.83**(Home TopBar) ≥ 3:1 |
| **`D4-63`** | `RadioGroup.legendVisuallyHidden?` (opt-in) → legend `.haru-visually-hidden` + 그룹 `--legend-hidden`(options margin-top 0, 새 간격 값 0). `ReadingContextSheet` 두 그룹만 적용. Stage 2 `SelectTrigger` 시트 미변경 | `RadioGroup.test.tsx` (그룹 이름 유지 · 기본 off) · `session-ready.test.tsx` · 시트 높이 487 → **459**(legend 20 + gap 8) |
| **`D4-64`** | `Sheet.leading?` 슬롯 (`[leading] [title] … [trailing]`, 없으면 렌더 0 · 제목 `flex: 1` 은 leading 있을 때만) · 시간 뷰 `Back` = `trailing` → `leading` 이동만. 다른 시트 back 미변경 | `Sheet.test.tsx` · `session-ready.test.tsx` (헤더 첫 자식 · trailing 0 · 시트 안 첫 포커스 대상) |

## F1R-3. 생성 · 수정 파일 (29 + 문서 2 + baseline)

- contracts (2): `packages/contracts/src/sessions/session.ts` · `src/__tests__/sessions.test.ts`
- design-tokens (3): `src/component/index.css` · `__tests__/token-tiers.test.ts` · `__tests__/fonts.test.ts` (Tier 3 183 → 185)
- ui (12): `button/IconButton.css` · `button/__tests__/IconButton.test.tsx` · `field/RadioGroup.tsx` · `field/RadioGroup.css` · `field/__tests__/RadioGroup.test.tsx` · `sheet/Sheet.tsx` · `sheet/Sheet.css` · `sheet/__tests__/Sheet.test.tsx` · `icon/haru/SessionClose.tsx`(신규) · `icon/haru/session-close.svg`(신규) · `icon/haru/index.ts` · `icon/__tests__/haru-icons.test.tsx`
- web (12): `entities/session/SessionReadyBubble.tsx` · `entities/session/__tests__/SessionReadyBubble.test.tsx` · `features/storytime-session/ui/StorytimeSessionScreen.tsx` · `features/storytime-session/storytime-session.css` · `features/activity-card-deck/ui/ReadingContextSheet.tsx` · `mocks/fixtures/sessions.ts` · `mocks/sessions/sessionFixtureScenarios.ts` · `mocks/sessions/MockSessionApi.ts` · `mocks/index.ts` · `features/recording/model/__tests__/controller-support.ts` · `test/harness.tsx`(`recorderTime` 주입 옵션) · `__tests__/session-ready.test.tsx`
- e2e (1): `e2e/session.spec.ts` (+ `s4-session-ready-reminder`)
- 문서 (2): `docs/API_CONTRACTS.md` (Rev 8.7) · 이 절

## F1R-4. 검증 (마지막 코드 수정 이후 전부 재실행)

`pnpm typecheck` ✓ · `lint` ✓ · `test` **2217 / 156 files 통과**(기준선 2197 → +20) · `lint:boundaries` ✓ (744 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ (4종 OK) · `pnpm test:e2e` **단독 327 passed (8.0m)** (기준선 326 + 신규 1).

## F1R-5. baseline 분해 (`R-BASELINE-1` ⑤⑥)

1회차 단독 e2e(재생성 전) = **11 실패 / 316 통과** — `frame-320/393/600/1024` · `frame-320-text-200` · `v9-icon-button` · `v9-top-bar` · `v9-focus` · `s2-deck` · `s4-reading-context-sheet`(크기 487→459) · `s4-session-ready-reminder`(신규). **토글 재현**: glass 색을 `--color-fg-primary` 로 + 시트 legend 숨김 해제 → 실패 10건 전부 통과.
`--update-snapshots=all` 재생성 → **바뀐 baseline 21 + 신규 1**. 재생성 전 사본 ↔ 새 baseline 을 연결성분(8-이웃, Δ>1)으로 분해:

| 원인 | 수 | baseline | 클러스터 |
|---|---|---|---|
| **글리프 색 `D4-62`** | 18 | `frame-320` · `-393` · `-600` · `-1024` · `frame-320-text-200` · `v9-icon-button` · `v9-top-bar` · `v9-focus` · `v9-state-{loading,empty,error,offline}` · `s2-deck` · `s2-deck-{reading-together,books-q3,books-favorites,growing-together,capability}` | 전부 **glass IconButton 글리프 자리**만 (≤17×18), Δmax **20** = `#4a5f5c`→`#5e7370` 채널 차(20/20/20). `s2-deck-*` 5건은 1회차에 **통과했던 스테일**(영역 가장자리 3×5 조각 ≤50px) — 색 토글 후 재생성하면 이전 사본과 **바이트 동일** |
| **X 글리프 VG-F1-01** | 2 | `s4-session-ready` · `-320` | 닫기 자리 **12×12 1개**(61px, Δ147~150 = Lucide 12×12 → Figma 10×10). 색 토글 후에도 이 클러스터만 남는다(도형 차) — 이 둘도 1회차엔 통과한 스테일 |
| **시트 `D4-63`** | 1 | `s4-reading-context-sheet` | 크기 393×487 → 393×459 (−28 = legend 20 + margin 8). 토글(legend 표시) 시 통과 |
| **리마인드 `D4-59`** | +1 신규 | `s4-session-ready-reminder` (393×852, 정착 후 촬영) | — |
| 기타 | 0 | — | — |

**설명되지 않는 클러스터 0건.** 토글은 검증 후 원복(`cmp` 로 원본 CSS 와 동일 확인).

## F1R-6. Mock 시나리오

`?scenario=session-greeting:reminder-missing` (신규) — 인사 정상 · 리마인드 null. 그 밖의 `session-greeting:*` · 기본은 리마인드 = `Ready when you are!`. 5분 경과 재현: 단위 = `createHarness({ recorderTime: createManualScheduler(Date.now()) })` + `advance(ms)` · e2e = `page.clock.install()` + `fastForward('05:01')`.

## F1R-7. 발견 문제 (승인 필요 · 보고)

1. **plain IconButton 색 (`D4-62` 범위 밖)** — 미변경. plain 사용처(TopBar 밀집·시트 헤더 back 등)는 `#4A5F5C` 그대로다. 같게 할지는 사용자 결정.
2. **인사 null + 리마인드 있음** — 현 구현은 5분 시점에 제목 줄이 **새로 생긴다**(버블 +28). §3.2.2 는 "제목 줄만 교체"만 정하고 이 조합을 명시하지 않는다. 대안: 인사 없으면 리마인드도 표시 안 함. plan-agent/사용자 판단.
3. **시간 뷰 진입 시 포커스 자동 이동 없음 (현행 동작)** — Spec §16.7 "시간 뷰 진입 시 첫 포커스 = `Back`". 같은 `Sheet` 인스턴스가 뷰만 바꾸므로 focus trap 초기 포커스가 다시 돌지 않아 포커스가 body 로 빠진다(jsdom 확인). `D4-64` 이전 trailing 배치에서도 같다. DOM 순서상 첫 포커스 대상은 `Back` 이다. 수정은 범위 확대라 보류 — 결정 필요.
4. 다른 시트(`BookDetailSheet` 등)의 trailing back 은 `D4-64` 범위 밖이라 그대로다.
5. `--icon-button-icon-size-close` 는 Tier 3 이름(`icon-button-*`)이지만 사용 지점은 `apps/web` 세션 CSS 다(`SaveStar` 선례와 같은 방식). `S4-F2` recording·paused 닫기도 같은 규칙을 쓰면 된다.

## F1R-8. `BACKEND_INTEGRATION_PENDING` 예상

| 항목 | 내용 | Handoff |
|---|---|---|
| `P4-BIP-11` 확장 | 리마인드 템플릿 1종 — 검수 템플릿 생성 · 안전 슬롯 · 금지어 검증 · fallback · ≤240px(≈28자) · 아이 이름 문장 끝 금지. `POST /v1/sessions` 와 세션 조회 응답 모두에 `reminderBubble` 키(nullable) | `ANALYSIS_PIPELINE_REQUIREMENTS` · `BACKEND_HANDOFF` |

## F1R-9. design-agent Visual Gap 대상

`s4-session-ready-reminder` (393, 제목 줄 교체) · 닫기 X 글리프(`s4-session-ready` vs Figma `300:1319`, 10×10) · glass 글리프 색 대비(위 프로브 4.80/4.83 재측정 확인) · Reading Context 시트 legend 숨김 후 간격(Figma 없음) · 시간 뷰 `Back` 왼쪽 배치 · 포커스 링 잘림 여부.

---

# `S4-F2` — recording · paused (2026-10-29, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-F2` 만**. `S4-G1`(팝업 본체) · `S4-G2` · `S4-H1`(완료 화면 본체) · `S4-H2` · `S4-K` 는 착수하지 않았다. **커밋하지 않았다.**
근거: `stage-4b-plan.md` §13 `S4-F2` · §14 · 4b Spec §2.1~§2.5 · §3.3 · §3.4 · §4 · §5.2 · §6 · §9 · 상위 Spec §2.5 · §6.3 · 결정 `D4-12`·`D4-13`·`D4-17`·`D4-51`·`D4-56`·`D4-58` · 사용자 지시 2026-10-28(Prompts 칩).

## F2-1. Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-10-26, user)` (`D4-58`) ✅ · `S4-F2` 차단 결정 `CP-4` = `D4-58` 권장안 채택 ✅ |
| 선행 | `S4-F1` · `S4-F1R` 완료 (`9f759bb`) ✅ |
| PRD/Figma 모순 | 없음 (X-10 책 칩 = `N4B-09` → `D4-58` NB-3 수용) |
| Backend · 신규 dependency | 0 · `apps/api`·`supabase`·`apps/mobile` 부재 (`ls` — No such file or directory ×3) |
| ⚠ **Figma 실측** | **이 세션에서 Figma MCP 호출이 전부 실패했다** (`get_design_context`·`get_metadata`·`get_screenshot` → *"you don't have edit access"*, debug UUID `3bbdcc24…` 외 3건). 구현 수치는 **4b Spec §2.2·§2.3·§2.5 의 design-agent `[ctx]`·`[var]`·`[svg]` 선언값**(2026-10-26 실측)과 이전 세션이 받아 둔 Figma 렌더 PNG(`298:1262`·`298:1340`·`298:1261`, 2026-10-25)로 대조했다. → **Visual Gap 에서 재실측 필요** (F2-8 Non-blocking ①) |

## F2-2. 구현한 AC (판정은 QA)

| AC | 구현 · 증거 |
|---|---|
| **41** Record → Pause · 바 `Submit` · `Done Reading` 0 | `__tests__/session-recording.test.tsx` "전이 `ready → recording` 1건 · 같은 노드…" (라벨 배열 `[Discard, Submit]` 정확 일치 · `/Done Reading/i` 0) · e2e 전 흐름 |
| **42** Pause → paused · 재개 = **Record Control `paused` 변형 탭**(`Resume` 버튼 0) · 전이 1건씩 | 단위 "시간이 recordedSeconds 로 오르고 · Pause → 고정 …" (전이 `recording → paused → recording` 정확 일치 · `/^Resume$/` 0) · e2e Submit 흐름(`recording·paused·recording·completed`) |
| **43 화면** paused 동안 시간 고정 | 단위: paused 에서 주입 clock 60s → `00:03` 불변, 재개 2s → `00:05` · e2e: 실제 시계 1.5s 대기 → 텍스트 불변 |
| **50** 녹음 시작 지연 ≤1s (실기기 5회 중위값) | ⚠ **실기기 측정은 하지 않았다** — Chromium·Mock 은 대상이 아니다(AC 본문 = 데스크톱 Chrome·Safari·iOS Safari 실기기). 화면 쪽 경로는 F1 그대로(탭 → `start()`). QA 수동 절차 대상 |
| **51** 상태 전환 ≤1s (로컬) | e2e "AC-4-51" — 탭 → `aria-label` 변경까지 `performance.now()` 차 (start · pause · resume, 실측값은 F2-4) |
| **112** `Record` → `Pause` 변형 · 바 활성 · 전이 `ready→recording` 1건 | 단위 같은 테스트(전이 1건 `to: recording` · `aria-disabled` 0) · `canTransition()` 은 4a contracts 테스트 |
| **113** Discard → 확인 후 `→ abandoned`(사유 필드 0) → 서버 확정 후 로컬 삭제 → `/` · 실패 시 보존 · 오프라인 outbox | 단위 3건: ① 확인 → abandoned **1건**, 본문 키 = `occurredAt·sessionId·to`(사유 0) · 로컬 파일 **전 >0 → 후 0** · `/` ② `sessions.transition:error` → 로컬 **전 n → 후 n+1**(캡처 종료가 마지막 조각 1개를 더 쓴다 — 지운 것 0) · `/` ③ `sessions.transition:offline` → 로컬 보존 + **outbox 에 `to: abandoned` 적재** · `/` (Mock 저장소 `controls.files` · `kv.list('outbox')` 2시점) |
| **114** Submit → `completed(user_done)` + Toast `Recording submitted` + `/session/:id/complete` | 단위 recording·paused 2경로 + 두 번 탭 → completed 1건 · e2e (URL · `role=status` Toast · 전이 본문) |
| **115** Discard 다이얼로그 확인 경로 | `ConfirmDialog`(Stage 1) 재사용 · 신규 Shared UI 0 · 문구 copy 모듈 · `alertdialog` + 이름 · 초기 포커스 = `Keep recording`(destructive) — 단위 · e2e |
| **116** 취소 경로 | 단위: 취소 → 요청 0 · 로컬 파일 수 ≥ 전 · `Pause recording` 유지 · **포커스 = Discard** · `Escape` 도 취소(paused 유지) · **다이얼로그 열린 동안 시간 `00:03 → 00:05`(녹음 계속)** · e2e 키보드 |
| **125** 배치 · 재마운트 0 | e2e 393×852: 칩 `{24, 10, h36}`(폭 117±3) · 닫기 `{331,10,38,38}` · 책 칩 y **281**(Figma 337) · 가운데 · 상태 블록 y **344**(400) · 높이 **111** · pill 32 · 시간 `{y386, h41}` · Record `{121.5,621}` · 바 `{57,789,279,45}` · 단위: Record · 바 · 메달리온 · 닫기 노드 identity |
| **126** 책 칩 | 단위 + e2e: 기본 = 요청한 책 제목·표지 이미지 · `book-missing` → 칩 0 · 상태 블록 y **344 불변** · `book-no-cover` → `T-5` 그라디언트 · `book-long-title` → 320·393 모두 1줄 말줄임(`scrollWidth > clientWidth`) · 컬럼 안 · 높이 40 · 리터럴 grep: fixture 제목은 `mocks/` 밖 0건(테스트 1건 제외) |
| **127** 경과 시간 | `formatSessionClock` 단위 9케이스(`mm:ss` · 30:00) · `role="timer"` + `aria-live="off"` · `tabular-nums` · paused 색 secondary(computed `rgb(125,146,145)`) · 보조 줄 `Up to 30:00`(= `MAX_RECORDED_SECONDS` 로 생성) / `Tap the button to keep recording` |
| **128** 상태 pill 텍스트 + dot 형태 | 텍스트 `Recording`/`Paused` · dot 채움 teal / 빈 원(inset 1.5 secondary — computed) · baseline 2장은 전역 `reducedMotion: reduce` 에서 찍었다 |
| **129** recording·paused 닫기 | 단위: 닫기 → **같은** 다이얼로그(제목·설명 동일) · 요청 0 · 취소 → 포커스 닫기 · 확인 → abandoned 1건 → `/` · 재탭 → abandoned 1건(⑤) · e2e 키보드(Enter → 다이얼로그 → 취소 → 포커스 닫기) · 다이얼로그 열린 동안 녹음 계속(④ — Discard 와 같은 다이얼로그 경로) |
| **138** RecordControl 5변형 | `RecordControl.test` 12건(변형별 글리프·캡션·`aria-disabled` · disabled CSS = opacity .5 + 코어 그림자 0 · PD = gray-2 + `mic-off` · 5상태 같은 노드) · `selectRecordControlState` 순수 함수 단위 4건 · e2e gallery computed 5행(이름 · opacity · 코어/링 색 · 코어 그림자 유무 · 캡션) + baseline `s4-record-control` |

## F2-3. 생성 · 수정 파일 (코드 32 + 테스트 · baseline · 문서)

| 구분 | 파일 |
|---|---|
| 토큰 (2) | `packages/design-tokens/src/component/index.css` (Tier-3 **+28** — `T-15`·`T-16`·`T-17`·`T-18`·`T-20`·`T-21` + `--button-icon-stroke-sm` · `--button-hit-size-sm` · `--session-breathing-scale`) · `src/semantic/color.css` (`--gradient-book-cover-placeholder` = `T-5`, 131.19deg · 0% / 70.92%) |
| Shared UI (6) | `record/RecordControl.{tsx,css}` (state 5종 · 글리프 표 · `disabled` 자기 `aria-disabled`) · `button/Button.{tsx,css}` (`size="sm"`) · `icon/registry.ts` (`message-square-text` · `mic-off`) |
| entities (6) | **신규** `entities/session/sessionClock.ts` · `recordControlState.ts` · `SessionStatusBlock.tsx` · `SessionBookChip.tsx` · 수정 `session.css` · `sessionRecorder.tsx`(pause·resume·submit·discard) · `index.ts` |
| features (4) | `features/storytime-session/ui/StorytimeSessionScreen.tsx` · `SessionActionBar.tsx`(`submitting`) · `copy.ts` · `storytime-session.css` |
| app · pages · shared (5) | `app/providers/sessionRecorderEnvironment.ts` · `app/router.tsx` · **신규** `pages/session/SessionCompletePage.tsx` · `pages/session/index.ts` · `shared/config/routes.ts` (`sessionComplete` · `sessionCompletePath`) |
| Mock (3) | `mocks/fixtures/sessions.ts` (`MOCK_SESSION_BOOK_NO_COVER` · `_LONG_TITLE`) · `mocks/sessions/sessionFixtureScenarios.ts` (`book-*` 3 key) · `MockSessionApi.ts` |
| dev gallery (3) | **신규** `dev/ui-gallery/Stage4SessionSection.tsx` (`s4-record-control` · `s4-button-sm`) · `ComponentsPage.tsx` · `gallery-copy.ts` |
| 테스트 | **신규** `apps/web/__tests__/session-recording.test.tsx`(16) · `entities/session/__tests__/session-recording-display.test.tsx`(18) · 수정 `RecordControl.test`(+5) · `Button.test`(+2) · `token-tiers.test` · `fonts.test` · `provisional-markers.test`(P-25 범위 확장) · `test/harness.tsx`(`recordingStorage()`) |
| e2e | **신규** `e2e/session-recording.spec.ts`(18) · baseline 신규 6 (`e2e/__screenshots__/darwin/session-recording.spec.ts/`) |
| 문서 | `docs/API_CONTRACTS.md` **Rev 8.8** (§5.4 `session:book-*` 구현) · 이 절 |

## F2-4. 검증 (마지막 코드 수정 이후)

`pnpm typecheck` ✓ · `lint` ✓ · `test` **2258 / 158 files 통과** (기준선 2217 / 156 → +41 / +2) · `lint:boundaries` ✓ (752 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ (4종 OK) · `pnpm test:e2e` **단독 345 passed (8.6m)** (기준선 327 + 신규 18). `ls apps/api supabase apps/mobile` → 전부 없음.

- 1회차 전체 e2e(25.2m) = 343 passed / 2 failed: ① `s4-session-discard-dialog` — 내 도우미의 경합(`clock.pauseAt(now + 1)` 이 이미 지난 시각 → *"Cannot fast-forward to the past"*). **수정**: 녹음 시작 **전에** 시계를 멈추고(가까운 미래 · 재시도) 시작 → `fastForward` (`recordFrozen`). baseline 6장은 바뀌지 않았다(재실행 통과) ② `shadow.spec.ts` `/auth/reset-password` 1024 — `page.screenshot` 60s 타임아웃(이 단위가 건드리지 않은 화면, 1회차가 평소 8분보다 3배 느렸다). 단독 재실행 통과 · 2회차 전체 통과 → 환경 부하로 판단, 코드 변경 없음
- AC-4-51 실측(Chromium · Mock, 2회차 annotation): 시작 · 일시정지 · 재개 모두 ≤ 1000ms 단정 통과

## F2-5. baseline 분해 (`R-BASELINE-1` ⑤⑥)

**기존 baseline 변경 0.** 1회차 전체 실행에서 기존 327건 중 baseline 비교 실패 0 (실패 2건은 위 F2-4 — 둘 다 baseline 불일치가 아님), `git status e2e/__screenshots__` = 신규 디렉터리 1개뿐 → 재생성(`--update-snapshots`)을 하지 않았다. 토큰 28개 추가로 걱정한 `v2-material`(토큰 갤러리 이동, F1 선례)도 통과했다.

신규 6장 (`e2e/__screenshots__/darwin/session-recording.spec.ts/`) — 전부 정착 후 촬영 · dev 패널 숨김 · 시계 고정:
`s4-session-recording`(393×852, `03:24`) · `s4-session-paused`(393×852, `03:24`) · `s4-session-recording-320` · `s4-session-discard-dialog`(영역) · `s4-record-control`(gallery 영역) · `s4-button-sm`(gallery 영역).
- 생성 중 걸러낸 것 2건: ① paused dot 이 1px 로 렌더된 상태(`border` 1.5 → Chromium 1px)로 찍힌 첫 baseline — CSS 수정 후 **삭제·재촬영** ② gallery 2장에 sticky `.haru-dev-nav` 의 pill 이 블록 위에 찍힌 상태(`R-BASELINE-1` ② dev UI) — 테스트에서 `visibility: hidden` 후 **삭제·재촬영**. 최종 6장은 눈으로 확인했다(과도기 프레임·dev UI 0)

## F2-6. Mock 시나리오 · 전환 방법

| 전환 | 동작 |
|---|---|
| `?scenario=session:book-missing` · `book-no-cover` · `book-long-title` (신규) | 책 칩 null · 표지 없음 · 40자 이상 제목 (Prompt 5) |
| `?scenario=sessions.transition:error` / `sessions.transition:offline` (기존) | 폐기 전이 실패 → 로컬 보존 / 오프라인 → outbox 적재 + 보존 |
| 녹음 시간 | 단위 = `createHarness({ recorderTime: createManualScheduler(Date.now()) })` + `advance(ms)` · e2e = `page.clock.install()` → 녹음 시작 → `pauseAt(now)` + `fastForward(204_000)` = `03:24` |
| 로컬 2시점 | 단위 `harness.recordingStorage()?.controls.files(sessionId)` · `kv.list('outbox')` |

## F2-7. Visual Gap 대상 (design-agent)

| 대상 | Figma | 구현 스크린샷 |
|---|---|---|
| recording 393 | `298:1262` | `e2e/__screenshots__/darwin/session-recording.spec.ts/s4-session-recording.png` |
| paused 393 | `298:1340` | `…/s4-session-paused.png` |
| recording 320 | — (반응형 §8.1) | `…/s4-session-recording-320.png` |
| 닫기·Discard 확인 다이얼로그 (recording 위) | 없음 (`AD-S4-4`·`AD-S4-15`) | `…/s4-session-discard-dialog.png` |
| RecordControl 5변형 | `163:1589`·`163:1588`·`298:1227`·`298:1236`·`298:1245` | `…/s4-record-control.png` |
| Prompts 칩 | `298:1314` | `…/s4-button-sm.png` |

볼 것: 칩 라벨 line-height(`AD-S4-17` 후보) · 칩 아이콘 stroke 1.5 · **`mic-off` path·stroke(미대조)** · paused dot 1.5 링(inset 렌더) · 책 칩 표지(이미지 vs Figma 그라디언트 — AC-4-126 은 `coverUrl` 있으면 이미지) · 책 칩 폭 hug · 시간 숫자 48/41 글리프.

## F2-8. 발견 문제

| 구분 | 내용 |
|---|---|
| **Blocking** | 없음 |
| **NEEDS_DECISION** | ① **확인 다이얼로그 문구 4건**(`Discard this recording?` · 설명 · `Discard` · `Keep recording`)은 상위 Spec §2.5.3 ③ 이 *"전부 사용자 승인 대상"* 으로 남긴 문구다 — `D4-58` NB-8(`S4B-Q9`) 목록에 없다. copy 모듈 한 곳이라 교체 비용 작다 ② **상태 전환 낭독**(*"Recording started." / "Paused." / "Recording resumed."* — 상위 Spec §9 `aria-live`)은 *"문구는 승인 대상"* 이라 **만들지 않았다**. 지금은 Record Control 의 접근성 이름 변화(포커스 시 낭독)뿐이다 |
| **Non-blocking** | ① **Figma MCP 접근 실패**(F2-1) — 구현 전 노드 실측을 이 세션에서 다시 하지 못했다. 수치는 Spec 선언값 + 이전 렌더 PNG 대조. Visual Gap 에서 재실측 필요 ② **`mic-off` 글리프** = Lucide (Spec §2.5 "path 대조는 구현 시") — 대조 못 함. 다르면 HARU SVG export 로 교체 ③ **완료 화면 `/session/:id/complete` 는 빈 Page**(`SessionCompletePage` → `null`) — 본체는 `S4-H1`. 그 전까지 실기기에서 `Submit` 뒤 배경만 보인다(Toast 는 뜬다) ④ **30분 자동 종료 뒤 화면** — 컨트롤러가 `completed(auto_timeout)` 이 되면 화면은 paused 배치로 멈춘다(시간 30:00 고정, Record 탭 무시). 안내·이동은 `S4-H2`(AC-4-64) ⑤ **`disabled`·`permission-denied` 화면 연결 0** — 변형·순수 함수까지만. 동의 없음·마이크 거부·대화 전용·처리 중 연결과 안내 시트는 `S4-H2`(AC-4-134). 그래서 지금 동의 없음에서 Record 를 눌러도 `idle` 그대로다(F1 과 같음) ⑥ **Prompts 칩 = 자리 + 열림 상태**: 칩은 `features/storytime-session` 상단 줄에 있고 열림 상태를 소유한다. 팝업은 `StorytimeSessionScreenProps.PromptsPopover`(컴포넌트 슬롯 — `open`·`popupId`·`focusChip`·`prompts`·`close`)로 Page 가 넣는다. 슬롯이 없으면(지금) 칩에 `aria-expanded`·`aria-controls` 를 달지 않는다 — 눌러도 보이는 변화 0. Spec §4 #8 은 칩까지 `features/session-prompts` 가 소유한다고 적었다 — feature 간 import 금지 때문에 칩은 화면 feature 에 두고 팝업만 슬롯으로 받는 구조로 했다(시각 차이 0, `S4-G1` 이 이 슬롯을 쓴다) ⑦ **Spec 밖 토큰 3**: `--button-icon-stroke-sm`(2 — Lucide 기본 1.5 로 그리면 18 박스에서 1.125, Figma 1.5) · `--button-hit-size-sm`(44) · `--session-breathing-scale`(1.03, 상위 Spec §6.3 값). 신규 HEX 0 ⑧ **paused dot** — `border: 1.5px` 는 Chromium 이 1x 에서 **1px** 로 내린다(실측) → `box-shadow: inset 0 0 0 1.5px` 로 그렸다(획, 번짐 0) ⑨ **가값 `P-26`·`P-27`**(`D4-58` NB-7) — CSS 주석만 달았다. `stage-0-approvals.md` §4 등재와 dev gallery 가값 목록 등재는 아직 없다(토큰 값이 아니라 사용처 가값이라 `provisional-registry` 가드 대상 아님) ⑩ dev gallery 의 sticky 내비(`.haru-dev-nav`)가 영역 클립 위를 덮는다 — 신규 2장(페이지 맨 끝 섹션이라 스크롤 후 내비 아래에 놓인다)은 테스트에서 `visibility: hidden` 으로 가렸다. 기존 gallery baseline 은 확인한 `s3-book-cover` 에서 같은 겹침이 보이지 않았다 ⑪ `S4B-F1-OPEN` ③(인사 없음 + 리마인드) · ④(시간 목록 포커스) — 둘 다 ready/시트 화면이라 **이 단위 영향 0** |

## F2-9. `BACKEND_INTEGRATION_PENDING` 예상

| 항목 | 내용 | Handoff |
|---|---|---|
| `P4-BIP-21` (기존) | 폐기(`→ abandoned`) 확정 응답 뒤 서버가 업로드 세션·Storage 객체를 정리 — Frontend 는 확정 응답을 받은 뒤에만 로컬을 지운다 | `RECORDING_UPLOAD_SPEC` |
| `P4B-BIP-01` (기존) | `SessionSummary.book` 을 세 경로 모두 채운다 — 책 칩 출처 | `BACKEND_HANDOFF` |
| RU-22 (신규 예상) | 오프라인 폐기는 outbox 가 나중에 보낸다 — 서버는 **늦게 도착한 `recording|paused → abandoned`**(그 사이 다른 전이 없음)를 받아들여야 한다. `occurredAt` = 사용자가 확인한 시각 | `BACKEND_HANDOFF` · `API_CONTRACTS` §3.1 |

**F2 후속 (2026-10-29, `VG-F2-01`)** — Figma `298:1254` 를 `get_design_context` 로 재조회해(이번엔 성공) 에셋 SVG 원문을 받았다: path 6개는 Lucide `mic-off` 를 40 박스로 옮긴 것과 같고 **stroke `3.33333`(24 기준 2)** — 구현 1.5 와 달랐다. HARU 전용 `haru:record-mic-off`(`packages/ui/src/icon/haru/RecordMicOff.tsx` · `record-mic-off.svg`, `white` → `currentColor`)로 교체하고 RecordControl `permission-denied` 글리프를 바꿨다. 사용처가 0이 된 Lucide `mic-off` 는 registry 에서 제거. 테스트: `haru-icons.test` 등록 목록 · `RecordControl.test` path 6 · stroke 3.33333. baseline `s4-record-control` 은 `S4-G1` 절 baseline 분해에 포함.

---

# `S4-G1` — Prompts 칩 → 중앙 팝업 (2026-10-29, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-G1` 만** (+ 앞서 `S4-F2` 후속 `VG-F2-01`). `S4-G2`(Drawer) · `S4-H1` · `S4-H2` · `S4-K` 는 착수하지 않았다. **커밋하지 않았다.**
근거: `stage-4b-plan.md` §13 `S4-G1` · §14 (AC-4-52 수정 · 130~133 · 135) · 4b Spec §3.1 · §3.3 · §6 · §7.1 · §8.1 · §9 · §15 · 결정 `D4-52`·`D4-53`·`D4-54`·`D4-55`·`D4-58`(CP-1·CP-2·CP-3 · NB-1·NB-2)·`D4-66` · 사용자 지시 2026-10-28(칩으로 말풍선 재호출).

## G1-1. Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-10-26, user)` (`D4-58`) ✅ · `S4-G1` 차단 결정 CP-1(See all 시안 + 14/17 전용 토큰) · CP-2(pill 38 고정) · CP-3(팝업 = 양육자가 연 목록) = `D4-58` 채택 ✅ |
| 선행 | `S4-F2` HANDOFF (칩 상태 + `PromptsPopover` 슬롯) ✅ |
| PRD/Figma 모순 | 없음 (AC-4-52 수정 = CP-3 수용, PRD 수정 대상 17 — 기록은 plan-agent) |
| Backend · 신규 dependency | 0 · `apps/api`·`supabase`·`apps/mobile` 부재 |
| **Figma 실측 (구현 전)** | **이번 세션은 성공했다.** `get_design_context(296:1257)` — 329×293 · `glass-fill-strong` 90% · radius 22 · drop `0 6 4 #5E737014` + inset 2 · px16 py14 · gap 6 · 제목 `Try this prompt!` Semibold 16/22 · Prompt Card ×5 297×38(pitch 44) · `300:1308` Semibold 14 / normal · `#7d9291` · 밑줄 `from-font` · 가운데. `get_metadata(296:1210)` — 팝업 (34, 328) · ring 132+190 = 322 → +6. `get_screenshot(296:1210)` 393×852 (scratchpad `g1/fig-296-1210.png`). Spec §3.1 값과 **전부 일치** |

## G1-2. 구현한 AC (판정은 QA)

| AC | 구현 · 증거 |
|---|---|
| **52 (수정)** | 팝업은 칩 탭으로만 열린다 · tail 없음 — 단위 "녹음 시작 · 시간 경과 · 일시정지 · 재개 동안 팝업 · tail 버블 0" (`.haru-bubble--tail-none` · `.haru-bubble__tail` 0) |
| **130** | 단위: 열린 동안 3초 → 시간 `00:05` · 로컬 파일 수 증가 · 전이 `['recording']` 그대로 · 키보드 Pause/Resume 동안 열린 채 → 닫기 후 전이 `[recording, paused, recording]` · paused 에서도 열림 · e2e "칩 재탭 → 닫힘 · 녹음 계속" |
| **131** | 제목 = `features/session-prompts/copy.ts` `title` 1곳 · ready 버블 제목(서버 인사)과 다름 — 단위 |
| **132** | e2e 6케이스(n = 1·5·7 × 320/393, 852 높이): y **272**(Figma 328) · 높이 **73 + 44n** · 폭 329 / 272 · pill 전부 **38** · Record 침범 0 · `scrollHeight = clientHeight` · `See all` 보임. + 393×852 상세(pill 상대 y 42/86/130/174/218 · 297×38 · 제목 y14 h22 · `See all` y262 h17 가운데) + **393×796: 팝업 바닥 = Record top 565**(예산 0, 침범 0) |
| **133** | 단위: Submit(포인터) → 닫힘 → 완료 화면 `.haru-session-prompts` 0 · Discard(키보드) → 확인 → 홈 잔존 0 · 닫기(포인터) → 닫힘 → 확인 다이얼로그 · **30분 자동 종료 → 닫힘 + `aria-expanded=false` + 재탭 무시** · `prompts: []` → 칩 `aria-disabled` + `aria-describedby` = `No prompts for this session` · 팝업 노드 0 · 탭 무시 |
| **135** | ① `aria-expanded`/`aria-controls`(= 팝업 id) ② `<section aria-labelledby>`(= region) · `aria-modal`·dialog 0 · `aria-live` 0 (`D4-66`) ③ 열 때 포커스 칩 · `chip.nextElementSibling === popup` ④ `Escape` → 닫힘 + 포커스 칩 — **열린 모달이 있으면 모달이 먼저**(확인 다이얼로그만 닫히고 팝업 유지, 단위) ⑤ 칩 재탭 → 닫힘 ⑥ 바깥 탭(`Pause`) → 닫힘 + paused 전이 1건 (단위 + e2e 실제 포인터) ⑦ 팝업 안 버튼 = `See all` 1개 · scrim 0. e2e 키보드: Enter → 열림 · 포커스 칩 → Tab `See all` → Tab `Close session` → Escape → 칩 |
| 53·55 (팝업 부분, 본 판정은 `S4-G2`) | 팝업 문구 = ready 버블 문구 = fixture 앞 5개 (단위 3 시나리오) · 열기/닫기 동안 `navigator.vibrate`·`HTMLMediaElement.play` 0회 |
| 137 ④ 일부 (`S4-G2`) | `See all` = `<button>` · 터치 44(`::before`, e2e `elementFromPoint` 중심 ±20) · `aria-haspopup="dialog"` 는 **Drawer 가 연결될 때만**(`onSeeAll` 슬롯 — 컴포넌트 단위 테스트에서 close → onSeeAll 순서 확인). 미연결인 지금은 닫고 포커스를 칩으로 |

## G1-3. 생성 · 수정 파일 (G1 코드 15 + 테스트 · baseline · 문서, F2 후속 7)

| 구분 | 파일 |
|---|---|
| feature (신규 4) | `apps/web/src/features/session-prompts/` `copy.ts` · `index.ts` · `session-prompts.css` · `ui/SessionPromptsPopover.tsx` |
| entities (2) | **신규** `entities/session/sessionPromptsSlot.ts`(슬롯 연결 모양 — 두 feature 가 공유, feature 간 import 0) · `index.ts` |
| 화면 feature (3) | `features/storytime-session/ui/StorytimeSessionScreen.tsx`(칩 disclosure · `promptsLive` · 빈 목록 비활성) · `copy.ts`(`noPrompts`) · `storytime-session.css`(`.haru-session { position: relative }` — 팝업 앵커) |
| Page · 스타일 (2) | `pages/session/StorytimeSessionPage.tsx`(`PromptsPopover={SessionPromptsPopover}`) · `styles/index.css` |
| Shared UI (2) | `packages/ui/src/link/TextLink.{tsx,css}` — tone **`subtle`**(Spec §4 #5) + `hasPopup` prop |
| 토큰 (1) | `packages/design-tokens/src/component/index.css` — `T-19` 4종 (`--prompt-popup-pad-block` · `-offset-top` · `-link-size` 14px · `-link-line` 17px) |
| 테스트 | **신규** `apps/web/__tests__/session-prompts.test.tsx`(19) · `e2e/session-prompts.spec.ts`(14) · 수정 `session-recording.test.tsx`(칩 = 닫힌 disclosure) · `token-tiers.test.ts`(213 → 217) · `TextLink.test.tsx`(+2) |
| baseline | **신규** `e2e/__screenshots__/darwin/session-prompts.spec.ts/s4-session-prompts.png` |
| F2 후속 (`VG-F2-01`) | **신규** `packages/ui/src/icon/haru/RecordMicOff.tsx` · `record-mic-off.svg` · 수정 `haru/index.ts` · `registry.ts`(Lucide `mic-off` 제거) · `record/RecordControl.tsx` · `__tests__/haru-icons.test.tsx` · `record/__tests__/RecordControl.test.tsx` |

Mock · contracts · `API_CONTRACTS.md` 변경 없음 — 필요한 시나리오(`session:prompts-1`·`-3`·`-7`·`-empty`)가 이미 있다.

## G1-4. 검증 (마지막 수정 이후)

`pnpm typecheck` ✓ · `lint` ✓ · `test` **2284 / 159 files 통과** (기준선 2258 / 158 → +26 / +1: session-prompts 19 · TextLink 2 · RecordControl·haru-icons 등 +5) · `lint:boundaries` ✓ (758 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ (4종 OK) · `pnpm test:e2e` **단독 **359 passed (7.9m)**** (기준선 345 + 신규 14). `ls apps/api supabase apps/mobile` → 전부 없음.

- 1회차 전체 e2e = 358 passed / 1 failed — `s4-record-control`(G1-5 의 의도된 변경). 원인 분해 후 그 1장만 재생성 → 단독 재실행 통과
- 1회차 뒤 수정: `fonts.test`(빌드 manifest 토큰 수 213 → 217 — 1회차 `test` 는 빌드 전 manifest 로 통과했었다) · e2e 색 기대값을 `rgb()` 리터럴 대신 헬퍼로(lint `no-restricted-syntax`) · `TextLink.test` +2. 그 뒤 위 명령 전부와 e2e 전체를 다시 돌렸다

## G1-5. baseline 분해 (`R-BASELINE-1` ⑤⑥)

**기존 baseline 변경 1장 · 신규 1장.** 기존 345건 중 비교 실패는 `s4-record-control` 1건뿐.

| baseline | diff | 원인 | 확인 |
|---|---|---|---|
| `session-recording.spec.ts/s4-record-control.png` (기존, 미커밋 F2 산출) | Playwright 22px(임계 적용) · Δ>5 픽셀 **279** · 연결성분 **4개, 전부 x73–110 · y576–613**(PD 행 글리프 36×36 bbox 안) | **`VG-F2-01` mic-off stroke 2.5 → 3.333** 단 하나 | 흰 피복량 **321.8 → 423.2** (Figma `[fpng]` 431.6, Δ −2% — 앞 Visual Gap 의 구현 측정 321.8 과 같은 측정기) · 8배 확대 대조(scratchpad `g1/pd-compare.png`) — 다른 4행·캡션 변화 0. 설명 안 되는 클러스터 0 → 이 1장만 `--update-snapshots`(해당 테스트 `-g`) |
| `session-prompts.spec.ts/s4-session-prompts.png` (신규) | — | 팝업 열림 프레임 | 정착 후 촬영(시계 고정 · reduce · `runFor(500)`) · dev 패널 숨김 · 칩 blur(포커스 링 0) — Figma `296:1210` PNG 와 같은 배치(y−56)를 눈으로 확인 |

## G1-6. Mock 시나리오 · 전환 방법

| 전환 | 동작 |
|---|---|
| `?scenario=session:prompts-1` · `session:prompts-7` · (기본 5) | 팝업 pill 1 · 5(컷오프) · 5 |
| `?scenario=session:prompts-empty` | 칩 비활성 + 사유, 팝업 없음 |
| e2e 고정 상태 | `page.clock` 으로 `03:24` 고정 → Pause → 칩 키보드 Enter → blur (Figma `296:1210` 과 같은 상태) |

## G1-7. Visual Gap 대상 (design-agent)

| 대상 | Figma | 구현 스크린샷 |
|---|---|---|
| 팝업 열림 (paused · n=5 · 393×852) | `296:1210` / `296:1257` | `e2e/__screenshots__/darwin/session-prompts.spec.ts/s4-session-prompts.png` (393×852 — Figma y−56, Record 위 여유 56 은 852 뷰포트의 유연 간격) |
| RecordControl PermissionDenied 글리프 (`VG-F2-01`) | `298:1245` / `298:1254` | `e2e/__screenshots__/darwin/session-recording.spec.ts/s4-record-control.png` |
| 320 팝업 | — (§8.1: 272 · pill 240) | e2e 기하만 (baseline 없음) |

볼 것: pill 2줄 글리프가 38 안 padding 으로 1px 들어가는 모양(CP-2, Figma 와 같음 의도) · `See all` 밑줄 위치(`from-font`) · 팝업 그림자가 책 칩·상태 블록 위를 덮는 층위 · 제목 Semibold 굵기.

## G1-8. 발견 문제

| 구분 | 내용 |
|---|---|
| **Blocking** | 없음 |
| **NEEDS_DECISION** | 없음 (새 문구는 Spec 제안 `No prompts for this session` 1건 — `D4-58` NB-2 채택분) |
| **Non-blocking** | ① **짧은 세로(< 796)**: 팝업 top 은 위 묶음에 고정이라 Record Control 을 덮는다 — 압축(`AD-S4-18`, CP-7)은 `S4-K` ② **키보드로 바깥 동작**(예: 팝업 열린 채 Tab → `Discard` Enter)은 포인터가 아니므로 팝업을 닫지 않는다 — Spec 의 닫힘 조건(칩 재탭 · 바깥 **탭** · `Escape`)대로. 확인 다이얼로그가 위에 뜨고, 확인하면 정리된다(AC-4-133) ③ `See all` 미연결 동안은 닫고 포커스를 칩으로 돌린다 — Drawer 는 `S4-G2` 가 `onSeeAll` 로 연결하며 그때 `aria-haspopup="dialog"` 가 붙는다 ④ 슬롯 연결 모양(`SessionPromptsPopoverContext`)을 `features/storytime-session` 에서 `entities/session` 으로 옮겼다 — `features/session-prompts` 가 화면 feature 를 import 하지 않도록(경계 위반 0) ⑤ 열기 모션은 `@starting-style` + `display` 이산 전환(Chromium 117+ · Safari 17.4+). 미지원 브라우저는 즉시 표시(기능 영향 없음). reduce = 전환 없음 ⑥ 토큰 `T-19` 4종은 Spec §5.2 명칭 그대로 — `--prompt-popup-link-*` 14/17 은 스케일 밖 리터럴(CP-1 `S4B-Q3` ⓐ) |

## G1-9. `BACKEND_INTEGRATION_PENDING` 예상

없음 — 팝업은 이미 받은 `SessionSummary.prompts`(`P4B-BIP-01` 과 같은 응답)만 표시한다. 신규 API·필드 0.

**G1 후속 (2026-10-29, `VG-G1-03`)** — `.haru-session-prompts__see-all .haru-text-link` 에 `text-decoration-thickness: from-font` 추가 후 같은 baseline 프레임(393×852 · paused `03:24` · n=5)을 재측정: 글자 잉크 행 **265–276**(팝업 상대, Figma 264–276) · 밑줄 **278 한 행**(Figma 277 진함 + 278 옅음 ≈1.3px) — **변화 없음**(Chromium + 시스템 SF Pro 의 폰트 밑줄 두께가 1px 로 반올림). 차이 = Δ>5 픽셀 **1개**(x231 y550 — 밑줄 skip-ink 틈 1px 가 메워짐). **1px 처짐·두께 차이는 남는다 → 허용 차이 후보**(사용자 승인 사항, 고치지 않았다). baseline `s4-session-prompts` 는 이 1픽셀 클러스터만 바뀐 채 `--update-snapshots=all` 로 재생성했다.

---

# `S4-G2` — `See all prompts` → Prompt Drawer `88:960` (2026-10-29, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-G2` 만** (+ G1 후속 `VG-G1-03`). `S4-K1` · `S4-H1` · `S4-H2` · `S4-K2` 는 착수하지 않았다. **커밋하지 않았다.**
근거: `stage-4b-plan.md` §13 `S4-G2` · §14 (AC-4-53 · 54 · 55 · 56 · 130 Drawer 부분 · 137) · 4b Spec §3.1 · §3.2 · §6 · §8.1 · §15-5 · 상위 Spec §3.2 · §4 #2 · §5.2 `T-1`·`T-10` · §6.5 · §10 · 결정 `D4-49`(`AD-S4-7`) · `D4-52` · `D4-53` · `D4-54` · `D4-58` NB-1 · `D4-66`.

## G2-1. Gate

| Gate | 결과 |
|---|---|
| Plan · Spec | 둘 다 `APPROVED (2026-10-26, user)` (`D4-58`) ✅ |
| 선행 | `S4-G1` HANDOFF (See all 버튼 · 팝업 닫힘) ✅ |
| PRD/Figma 모순 | 없음 |
| Backend · 신규 dependency | 0 · `apps/api`·`supabase`·`apps/mobile` 부재 (`ls` → 없음) |
| **Figma 실측 (구현 전)** | **성공.** `get_design_context(88:960)` — 353×331.765 · pt10/pb18/px20 · gap 10 · radius 30 · `white/-86%` + blur 12 · drop 3겹 + inset 2 · 핸들 40×4 r8 (슬롯 8) · 제목 SF Pro **Bold** 17/22.1 `#4a5f5c` · 부제 Regular 13/18.85 `#7d9291` · pill `88:708` 310×40 (슬롯 45, 위 2.24) `#dbeee7` + 1px 18% · px12 py8 · 좌/우 Icon 24 + 본문 Semibold 11.8/12 `#5e7370` · 노트 `88:681` 313×158 · 1px 18% · r16 · 면 없음 · px15 pt12 pb13.19 · 12/15.6 · dots 46×7. `get_metadata(88:960)` 좌표. `get_design_context(88:684 · 88:700)` — 화살표 SVG 원문: Material 채움 chevron, **활성 `#B0CFC0` · 비활성 `#F2F2F7`** |

## G2-2. 구현한 AC (판정은 QA)

| AC | 구현 · 증거 |
|---|---|
| **137** | ① `See all` 탭 → `close()` → Drawer 열림(같은 핸들러, 순차) — 단위 "팝업 닫힘 + 칩 aria-expanded=false + dialog" ② n=7 → 7페이지 · 서버 순서 · 초기 1번째(열 때마다 초기화, NB-1) — 단위 2 ③ 닫힘(Escape · scrim) → 포커스 Prompts 칩 — 단위 2 + e2e 2 ④ `<button aria-haspopup="dialog">` · 터치 44(G1) |
| **56** | 모달(`Sheet` — scrim · `aria-modal` · focus trap · Escape) · 초기 포커스 = 캐러셀 그룹 · Tab 트랩(Next → Previous) · 키보드 이동 `ArrowLeft/Right` · 복귀 = 칩 · 열린 동안 녹음 계속(e2e 실시간 1.2s 시간 증가) |
| **53** | 세 지점 같은 출처 — Drawer 앞 5개 = 팝업 = ready 버블 문구(단위, n=7) · 하드코딩 0 |
| **54** | 노트 = `Prompt.coachingNote` 그대로 · `null`(follow-up)이면 노트 상자 미렌더(placeholder 0, 단위) |
| **55** | Drawer 열기·이동·닫기 동안 `navigator.vibrate`·`HTMLMediaElement.play` 0회 (단위) |
| **130 (Drawer)** | 열린 동안 시간 `00:05`·청크 증가·전이 `['recording']` 그대로 · paused 에서도 열림 → `['recording','paused']` (단위) |
| 정리 (133 과 같은) | 30분 자동 종료 → Drawer 닫힘 · 포커스 칩 · 재탭 무시 (단위). Submit·Discard 는 모달 아래라 열린 채 누를 수 없다 |
| 97 (화살표) | 24 박스 + `::before` hit 44 — e2e `elementFromPoint` 중심 ±20 |

## G2-3. 생성 · 수정 파일

| 구분 | 파일 |
|---|---|
| feature (신규 1 · 수정 3) | **신규** `features/session-prompts/ui/SessionPromptsDrawer.tsx` · 수정 `ui/SessionPromptsPopover.tsx`(Drawer 소유 · `onSeeAll` 슬롯 제거 → 항상 `aria-haspopup="dialog"` · 닫힘 뒤 포커스 칩) · `copy.ts`(`drawer.*`) · `session-prompts.css`(Drawer 본문 + G1 후속 1줄) |
| entities (2) | `entities/session/sessionPromptsSlot.ts`(+`live`) · `entities/activity-card/PromptPill.tsx`·`activity-card.css`(tone **`bare`** — 면은 캐러셀이 그린다, 배지 규칙 `D-8` 재사용) |
| 화면 feature (1) | `features/storytime-session/ui/StorytimeSessionScreen.tsx`(`live={promptsLive}` 1줄) |
| Shared UI — 확장 1 · 되살림 1 | `packages/ui/src/sheet/Sheet.{tsx,css}` — variant **`floating`** · surface **`drawer`** (다른 variant 외형 불변) · **신규** `packages/ui/src/carousel/PromptCarousel.{tsx,css}`(Spec §4 #2 승인분 — 도메인 없음) · `index.ts` · `styles.css` |
| 아이콘 (신규 2) | `packages/ui/src/icon/haru/CarouselPrevious.tsx`·`CarouselNext.tsx` + `.svg`(Figma 원문 path, fill → `currentColor`) · `haru/index.ts` |
| 토큰 | primitive `--haru-gray-6` · semantic `--color-surface-drawer`(`T-1`) · `--color-carousel-arrow` · `-disabled` · Tier-3 **20** (`--sheet-floating-*` 8 · `--prompt-carousel-*` 7 · `--prompt-drawer-note-*` 5) |
| 테스트 | `apps/web/__tests__/session-prompts.test.tsx`(G1 `See all` 슬롯 2건 → G2 10건) · **신규** `packages/ui/src/carousel/__tests__/PromptCarousel.test.tsx`(5) · `Sheet.test.tsx`(+1) · `haru-icons.test.tsx`(+2 등록) · `token-tiers.test.ts`·`fonts.test.ts`(개수 34→35 · 76→79 · 217→237) · `e2e/session-prompts.spec.ts`(+9) |
| baseline | **신규** `e2e/__screenshots__/darwin/session-prompts.spec.ts/s4-prompt-drawer.png` · 재생성 `s4-session-prompts.png`(G1 후속 1픽셀) |

Mock · contracts · `API_CONTRACTS.md` 변경 없음 — Drawer 는 같은 `SessionSummary.prompts` 를 쓰고 시나리오(`session:prompts-1`·`-3`·`-7`·`-empty`)가 이미 있다.

## G2-4. 검증 (마지막 수정 이후)

`pnpm typecheck` ✓ · `lint` ✓ · `test` **2305 / 160 files 통과** (기준선 2284 / 159 → +21 / +1: session-prompts G2 10 − G1 슬롯 2 · PromptCarousel 5 · Sheet 1 · haru-icons 등록 2 × 4 + 목록 · 토큰 개수 갱신) · `lint:boundaries` ✓ (763 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ (4종 OK) · `pnpm test:e2e` **단독 368 passed (8.1m)** (기준선 359 + 신규 9). `ls apps/api supabase apps/mobile` → 전부 없음.

- 개발 중 1회: e2e 스와이프 테스트가 **움직이는 트랙**의 박스를 재서(translate −100% → x<0) scrim 을 눌렀다 — 테스트를 고정 viewport 측정으로 고쳤다(구현 변경 아님). 토큰 테스트 3건(개수)·`--prompt-carousel-arrow-hit` 가 Tier-3 를 참조한 위반 1건 → `--size-touch-min` 으로 수정. lint 2건(e2e `rgba()` 리터럴 → 헬퍼 · 캐러셀 루트 jsx-a11y → 선례대로 1줄 disable). 그 뒤 위 명령 전부와 e2e 전체를 다시 돌렸다

## G2-5. baseline 분해 (`R-BASELINE-1` ⑤⑥)

| baseline | diff | 원인 | 확인 |
|---|---|---|---|
| `s4-session-prompts.png` (G1 산출) | Δ>5 픽셀 **1** (x231 y550 = `See all` 밑줄 행) | `VG-G1-03` `text-decoration-thickness: from-font` — skip-ink 틈 1px 가 메워짐 | 밑줄 행 외 변화 0 · 기본 비교는 통과(임계 이하) → `--update-snapshots=all` 로 드러내 재생성 |
| `s4-prompt-drawer.png` (신규) | — | Drawer 열림 프레임 (recording `03:24` · n=5 · 1번째 페이지) | 정착 후 촬영(주입 시계 · reduce · 시트 `getAnimations().finished` 대기) · dev 패널 숨김 · 캐러셀 blur(포커스 링 0) · Figma `88:960` PNG 와 같은 구성을 눈으로 확인 |

## G2-6. Mock 시나리오 · 전환 방법

| 전환 | 동작 |
|---|---|
| (기본 5) · `?scenario=session:prompts-1` · `-3` · `-7` | 녹음 시작 → `Prompts` 칩 → `See all prompts` → Drawer 5 · 1 · 3 · 7페이지 |
| `?scenario=session:prompts-empty` | 칩 비활성 → 팝업·Drawer 경로 없음 (G1 그대로) |

## G2-7. Visual Gap 대상 (design-agent)

| 대상 | Figma | 구현 |
|---|---|---|
| Drawer 열림 (393×852 · n=5 · 1번째) | `88:960` (미배치 컴포넌트) | `e2e/__screenshots__/darwin/session-prompts.spec.ts/s4-prompt-drawer.png` |
| 캐러셀 pill 화살표 활성/비활성 | `86:324` `color/arrow_first` · `cppr/arrow_last` · `88:708` | 같은 baseline(Previous = 비활성) · e2e computed 색 |
| 320 · 1024 Drawer 폭 | — (§8.1: 272 · 432) | e2e 기하만 (baseline 없음) |

볼 것: 핸들 40(bottom 시트 36 과 다름) · 제목 Bold · 노트 면 없음 · 아래 여백 24(Figma 근거 없음 — G2-8 ①) · 높이(Figma 선언 331.765 ↔ 내용 합 338.765 — ②) · pill 폭 305(③) · `PRE` 배지(④).

## G2-8. 발견 문제

| 구분 | 내용 |
|---|---|
| **Blocking** | 없음 |
| **NEEDS_DECISION** (비차단 — 지금 값으로 구현, 승인 필요) | ① **Drawer 아래 여백**: `88:960` 은 **미배치 컴포넌트**라 화면 안 세로 위치 근거가 없다. radius 가 네 모서리라 떠 있는 카드로 보고 **좌·우·아래 = gutter 24 + safe-area**(`L-NEW-03` inset-card 의 "아래 = 좌우" 선례)로 두었다. 폭은 `AD-S4-7`(컬럼 100%) 그대로 ② **높이**: Figma 선언 높이 331.765 인데 자식 + padding 합은 338.765(dots 아래 실제 여백 11 ↔ 선언 pb 18). 선언 padding 을 따랐다 → 구현 높이 = 내용(393 · n=5: **345×336** — 제목 22 · 부제 18 흡수로 Figma 내용 합보다 2.765 짧다) ③ **pill 폭**: `T-10` 310 은 Drawer 353 기준 — `AD-S4-7` 로 393 에서 본문이 305 라 `min(310, 100%)` = **305**(480+ 는 310 · 왼쪽 정렬, Figma 처럼 오른쪽 3 여백) ④ **Prompt 배지**: Drawer pill 에 `PRE`/`POST`/페이지 배지를 렌더한다(`D-8` "값이 있으면 렌더" — COMPONENT_MAP 사용처에 Drawer 포함). Figma 인스턴스는 배지 없는 자리표시 문구 |
| **Non-blocking** | ⑤ **Spec 밖 토큰**: primitive `--haru-gray-6`(#f2f2f7) · semantic `--color-carousel-arrow`·`-disabled` — Figma SVG 원문 fill. Spec §5.2 에 없던 값(화살표 색 명세 누락). DESIGN_TOKEN_MAP 미등재 ⑥ **Sheet 확장 2**(variant `floating` · surface `drawer`): Spec 은 "`bottom` + surface" 였으나 `bottom` 은 뷰포트 전폭·위 모서리만 둥글어 `AD-S4-7`(345)·네 모서리 radius·핸들 40·padding 10/20/18·제목 Bold 를 표현할 수 없다 — 다른 시트 외형·baseline 은 불변(1장도 안 바뀜) ⑦ 핸들 40×4 는 **floating 에만** — bottom 시트 36 은 그대로(상위 §12.4-⑤ 미결 유지) ⑧ 제목 끝 공백(§12.4-⑩) 제거 · 접근성 문구 5종(`Prompts` · `Previous prompt` · `Next prompt` · `Prompt n of m`) 신규 — 화면에 보이지 않음 ⑨ dots = 페이지 수(상위 §12.4-④ 제안안) — Figma 는 3 고정 ⑩ 페이지 변경 낭독 없음(`D4-66` 취지) — 위치는 PageIndicator 시각 숨김 텍스트 ⑪ 화살표는 첫/끝에서 `aria-disabled`(native `disabled` 는 누른 버튼의 포커스를 잃게 해 쓰지 않았다) ⑫ `PromptCarousel` 루트에 `jsx-a11y/no-noninteractive-element-interactions` 1줄 disable(`BookShelfCarousel` 선례) ⑬ 닫기 모션은 기존 `haru-sheet-out`(translateY 100%) — 떠 있는 카드라 마지막 프레임에 아래 24px 가 잠깐 보일 수 있다(inset-card 와 같은 동작) |

## G2-9. `BACKEND_INTEGRATION_PENDING` 예상

없음 — Drawer 는 이미 받은 `SessionSummary.prompts`(`text` · `phase` · `pageRef` · `coachingNote`)만 표시한다. 신규 API·필드 0.

---

# `S4-G2` 후속 — Visual Gap 결정 반영 (2026-11-01, development-agent)

Status: **HANDOFF** · `D4-70` · `D4-71` · `D4-73` · `D4-75` · `VG-G2-09` 만. `S4-K1` · `S4-H1` · `S4-H2` · `S4-K2` 는 착수하지 않았다. **커밋하지 않았다.** `D4-69` · `D4-72` · `D4-74` · `D4-76` · `D4-77` 은 현행 유지라 코드 변경이 없다.

## G2F-1. 반영 내용

| 결정 | 처리 | 근거 · 측정 방법 |
|---|---|---|
| `D4-70` | `--sheet-floating-pad-block-end` `--space-4-5`(18) → `11px` | e2e 가 393×852 Drawer 의 `getBoundingClientRect` 로 단정: 시트 높이 **329** = dots y + 7 + 11 · computed `padding-bottom` 11px |
| `D4-71` | `.haru-prompt-carousel__bar` `inline-size: 100%` · `--prompt-carousel-bar-width` 삭제 · Tier 3 237 → **236** (`token-tiers` · `fonts` 테스트) | 393/320/1024 기하 e2e 가 pill 폭 = 시트 폭 − 40 = 노트 폭 단정 (305 / 232 / **392**) |
| `D4-73` | **코드 변경 없음** — `--haru-gray-6: #f2f2f7` 정의 · `--color-carousel-arrow-disabled` 참조 · `--prompt-drawer-note-line: 15.6px` 이미 적용. `T-10` 명칭 정정을 `component/index.css` 주석에 반영 | `grep` + 기존 e2e computed 단정 |
| `D4-75` | **코드 변경 없음** — `PageIndicator count={pages.length}`, `pages = prompts.map(...)` 로 연동 확인. 테스트도 이미 있어 추가하지 않았다 | 단위 n=7 → dots 7 · n=3 → 3, e2e n=5 → 폭 72 |
| `VG-G2-09` | `Sheet.css` `.haru-sheet__grabber` 주석 정정 (bottom 36 · `88:669` 40 은 floating) | — |

## G2F-2. baseline 분해 (`R-BASELINE-1` ⑤⑥)

| baseline | diff | 원인 | 확인 | 처리 |
|---|---|---|---|---|
| `s4-prompt-drawer.png` | 21458px (ratio 0.07) | 시트가 **아래 고정**이라 7 줄면 위 모서리 · 내용 전체가 **7 아래로** 이동한다 (`D4-70`). visual-gap §6 의 "하단 7px 띠" 예상보다 넓지만 같은 원인이다 | PIL: 구 baseline y496–807 ↔ 신 baseline y503–814 (x44–348) 대조 → **maxΔ 2 · Δ>5 픽셀 0** (backdrop blur 잔차). 구 시트 그림자 위쪽 y0–469 변화 **0** · 시트 아래 y≥817 변화 0 | `--update-snapshots=all` 재생성 (`session-prompts.spec.ts` 범위). 백업과 `diff -rq` → **이 1장만** 변경 |
| `s2-onboarding-childinfo.png` · `-trial.png` | 각 85px (Δ>0 274, 배지 1개 영역) | **이번 수정과 무관.** `Birth month 2020-04` 나이 배지가 `6yr 6mo` → `6yr 7mo` — 실제 시계 기준 계산이라 2026-11-01 월이 바뀌며 깨졌다 | 연결성분이 배지 영역뿐. `visual.spec.ts` 에 임시로 `page.clock.setFixedTime(2026-10-15)` 를 넣자 **2 passed** (원복, `git diff` 빈 것 확인) | **재생성하지 않았다** — 재생성해도 12월 1일에 다시 깨진다. 테스트 시계 고정이 근본 수정이나 범위 밖이라 보고 |

## G2F-3. 검증

`typecheck` ✓ · `lint` ✓ · `test` 2305 / 160 files ✓ · `lint:boundaries` ✓ (763 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ · `ls apps/api supabase apps/mobile` → 전부 없음. `pnpm test:e2e` 단독 **366 passed · 2 failed (8.6m)** — 실패 2건은 G2F-2 의 `s2-onboarding-childinfo` · `-trial`(달 변경, 이번 수정과 무관).


---

# `S4-K1` — 짧은 세로 화면 압축 (2026-11-01, development-agent)

Status: **HANDOFF** · AC-4-99 ② · R4B-12 · `S4B-Q5` · `D4-58` CP-7 · `D4-68` · VG-F1-06 · VG-F2-06 · VG-G1-08. `S4-H1` · `S4-H2` · `S4-K2` 는 착수하지 않았다. **커밋하지 않았다.** 허용 차이는 등록하지 않았다 (`K1-6` 후보만).

## K1-1. 구현

| 순서 | 높이 | 내용 | 위치 |
|---|---|---|---|
| ① 유연 간격 → 16 | 702~795 | 기존 flex 가 흡수. 하한 16 = `.haru-session__stage--active` 아래 padding (`height < 702`) — 없으면 648 까지 0 으로 붙는다 | `storytime-session.css` |
| ② 메달리온 sm | < 702 | `--size-medallion-session` → sm 136 · 링 → 신규 `--session-medallion-ring-size-compact` 152 (`.haru-session` 스코프 override). 702 = 위 묶음 455 + 16 + 아래 묶음 231 | 같음 · `component/index.css` |
| ③ pill 목록 내부 스크롤 | < 796 | 팝업 `max-block-size` = 100% − 팝업 top − 231 · 목록만 `overflow-y: auto`(최소 pill 1개) · 제목·`See all` 고정 | `session-prompts.css` |

- 393×852 · 796 은 미디어 쿼리 밖이라 규칙 0건 — baseline 전부 재생성 없이 통과, 목록 `overflow-y: visible` · 팝업 293 e2e 단정.
- 목록은 **넘칠 때만** `tabIndex=0` + `aria-labelledby`(`useListOverflows` — ResizeObserver). 넘치지 않으면 Tab 순서 불변(칩 → `See all`).
- `R-SHADOW-1`: 근거 주석 · pill drop 0겹 → 그림자 inset 0 · 포커스 링 `outline-offset: -4px`(링 2 + 간격 2 를 안쪽, Spec §9.3) · `e2e/shadow.spec.ts` 양축 프로브(팝업 그림자 아래·오른쪽 + `scrollWidth = clientWidth` · pill 좌우 ⊂ 목록).
- 토큰: Tier 3 +1 → **237**. Tier 3 는 Tier 3 를 참조할 수 없어(`token-tiers`) 231 은 토큰이 아니라 CSS `calc` 다. 미디어 쿼리의 702·796 은 토큰을 쓸 수 없어 리터럴이며 식을 주석에 적었다.
- Spec §7.2 공지 슬롯 → Toast 대체는 슬롯 자체가 `S4-H2` 소관이라 이번에 없다. `S4-H2` 는 유연 간격 16~ 구간을 고려해야 한다.

## K1-2. 높이별 실측 (`getBoundingClientRect`, Mock n=5, 임시 스펙 — 팝업 연 recording)

| 뷰포트 | ring | Record | 바 bottom | 팝업 top→bottom | 목록 | 유연 간격 | 판정 |
|---|---|---|---|---|---|---|---|
| 393×852 | 190 | 621 | 834 | 272→565 | 214 | 166 | 변화 없음 |
| 393×796 | 190 | 565 | 778 | 272→565 | 214 | 110 | 변화 없음 |
| 393×759 | 190 | 528 | 741 | 272→528 | 177 | 73 | ✓ |
| 393×702 | 190 | 471 | 684 | 272→471 | 120 | 16 | ✓ |
| 393×700 | 152 | 469 | 682 | 234→469 | 156 | 52 | ✓ (이전 96 겹침) |
| 393×667 | 152 | 436 | 649 | 234→436 | 123 | 19 | ✓ |
| 393×664 | 152 | 433 | 646 | 234→433 | 120 | 16 | ✓ **전부 들어가는 하한** |
| 393×659 | 152 | 433* | 646* | 234→433* | 120 | 16 | △ 바까지 보이나 아래 여백 18 → 13 |
| 320×568 | 152 | 433 | **646** | 234→433 | 120 | 16 | ⛔ 바 전체·Record 아래 15 화면 밖 |
| 375×548 | 152 | 433 | **646** | 234→433 | 120 | 16 | ⛔ 바 전체·Record 아래 35 화면 밖 |

\* 스크롤 0 기준. 실측은 Playwright `click` 의 `scrollIntoView` 로 `overflow: hidden` 뷰포트가 5 밀려 있었다(값 −5). `< 664` 에서는 키보드 포커스로도 같은 밀림이 난다 — VG-F2-06 의 기제이며 **`≥ 664` 에서는 스크롤 여지가 없어 해소**됐다. 칩은 위 표 전 높이에서 y 10(밀리면 5) 이다.

## K1-3. ①~③ 으로 해결되지 않는 높이 (④ 디자이너 — 임의 디자인 없음)

| 높이 | 안 되는 것 |
|---|---|
| 646~663 | 바는 보이지만 아래 여백 18 이 잘린다 (`D4-58` 범위 내 레이아웃 그대로) |
| < 646 | 하단 바가 잘리기 시작 · `Submit`/`Discard` 접근 불가 (601 미만 전부 안 보임) |
| < 583 | Record Control 까지 잘린다 |

e2e: 320×568 바 뷰포트 단정은 `test.fail`(사유 명시)로 넣었다 — 디자인이 정해져 고치면 테스트가 터져 알려준다.

## K1-4. ⛔ ready 는 이번 압축으로 해결되지 않는다 (신규 발견 · 결정 필요)

ready 버블은 내용 높이이고 ③ 은 **팝업 전용**으로 승인됐다. Mock n=5 실측 버블 277 → ready 내용 하한 **790**(ring 190) · **752**(ring 152).

| 뷰포트 | Record top | 바 bottom | 결과 |
|---|---|---|---|
| 393×759 (standalone) | 558.6 | 771.6 | 바 12.6 잘림 |
| 393×702 | 558.6 | 771.6 | 바 전체 밖 (ring 190 구간) |
| 393×700 | 520.6 | 733.6 | 바 대부분 밖 |
| 393×659 (iPhone Safari 예상) | 520.6 | 733.6 | 바 전체 + Record 아래 11.6 밖 |
| 320×568 | 522.6 | 735.6 | Record 대부분 밖 |

ready 의 하단 바는 양쪽 비활성이라 차단 동작은 없지만 Record 는 시작 버튼이다. 메달리온 전환 임계 702 는 recording 기준이다 — ready 를 위해 790 으로 올리면 recording 의 ①→② 순서가 바뀌고, 상태별로 다르게 하면 Record 탭 때 메달리온 크기가 뛴다. 그래서 어느 쪽도 하지 않았다. 선택지: ⓐ ready 버블 pill 목록에도 ③ 적용 ⓑ 임계 상향 ⓒ 디자이너.

## K1-5. 소작업 · baseline

- `e2e/visual.spec.ts` 의 `s2-onboarding-childinfo`·`-trial`: `page.clock.setFixedTime(2026-10-15T12:00Z)` + 출생 연도 2020 고정. 지시에 더해 `seedChildDraft(page, name, birthYear)` 인자를 추가했다 — 기본값이 **실제 연도 − 6** 이라 시계만 고정하면 2027년에 다시 깨진다.
- **baseline 재생성 0장**: 전체 스위트 통과, `git status e2e/__screenshots__` 변경 없음 → 원인 분해 대상 없음.
- 다른 시간 의존 조사: 스펙 7종(시각 baseline 포함 112건)을 브라우저 시계 **2027-03-20** 로 돌렸다(임시, 원복) → 추가 실패 **`s3-sheet-scrim` 1건** — 출생 연도 목록(`birthYearOptions(now)`)이 실제 연도를 따른다. **2027-01-01 에 깨진다.** 지시 범위 밖이라 고치지 않았다. 같은 조건으로 시계를 고정하면 된다.

## K1-6. 허용 차이 후보 (등록하지 않음)

| 후보 | 내용 |
|---|---|
| `AD-S4-18` | §8.2 ①②③ (< 796) — ③ 에서 pill 이 스크롤 경계에서 잘려 보이고, 팝업이 Figma 에 없는 내부 스크롤을 갖는다 |
| 신규 후보 | 646~663 에서 아래 여백 18 잘림 |

## K1-7. 검증

`typecheck` ✓ · `lint` ✓ · `test` **2306** / 160 files ✓ · `lint:boundaries` ✓ (763 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ · `ls apps/api supabase apps/mobile` → 전부 없음. `pnpm test:e2e` 단독 **386 passed (10.0m)** · 실패 0 (`test.fail` 1건 포함).

## K1-8. 수동 확인 (실기기, R4B-12)

`NOT VERIFIED`: 압축은 CSS `height` 미디어 쿼리이고 레이아웃 높이는 `100dvh` 다. iOS Safari 에서 둘이 같은 값인지(툴바 표시 상태) Chromium 으로 검증할 수 없다. 다르면 ② 가 켜지지 않을 수 있다 → 393 iPhone Safari 에서 recording 화면 메달리온이 136 인지, 팝업과 Record 가 떨어져 있는지 확인. 목록 터치 스크롤 + 데스크톱 클래식 스크롤바(폭 감소)도 함께.

## K1-9. `BACKEND_INTEGRATION_PENDING`

없음 — 레이아웃만 바꿨다. 신규 API·필드 0.


---

# `S4-K1 후속` — `D4-78` · `D4-79` · `D4-81` (2026-11-01, development-agent)

Status: **HANDOFF** · 근거 `docs/design/stage-4b-visual-gap-k1.md` · approvals `D4-78`~`D4-81`. `S4-H1` · `S4-H2` · `S4-K2` 는 착수하지 않았다. **커밋하지 않았다.** approvals 문서는 수정하지 않았다. Low(VG-K1-03·04·05)는 손대지 않았다.

⛔ **멈춘 지점: 콘텐츠 높이 628 미만** — §KF-3. `320×568` 의 `test.fail` 은 그래서 유지했다.  → 2차 후속(`D4-82`)에서 해소, 아래 `S4-K1 2차 후속` 절.

## KF-1. 구현

| 결정 | 내용 | 위치 |
|---|---|---|
| `D4-79` | `.haru-session` = `container: haru-session / size`, 안쪽 신규 `.haru-session__body` 가 레이아웃·변수 override·팝업 앵커를 받는다. `@media (height)` 전부 `@container haru-session (height …)` 로 교체. 임계값 796 · 702 불변 | `storytime-session.css` · `StorytimeSessionScreen.tsx` · `session-prompts.css` |
| `D4-78` | `< 796` ready 목록만 `overflow-y: auto`(최소 pill 1) · 제목 고정 · 버블 아래 Figma 14.4 · 넘칠 때만 Tab 정지점 · 포커스 링 inset 4. `useListOverflows` 를 `entities/session` 으로 옮겨 팝업과 공유 | `session.css` · `SessionReadyBubble.tsx` · `useListOverflows.ts` |
| `D4-81` | `< 664` 아래 묶음 slack(= 콘텐츠 높이 − 628)을 나눈다: 아래 여백이 먼저 0(646), 그다음 Record ↔ 바 간격이 0(628). `< 702` stage 하한 205 로 Record 433 고정(ready·recording 공통). 팝업 상한도 이 하한을 쓴다 | `storytime-session.css` · `session-prompts.css` |

- 토큰 Tier 3 +2 → **239**: `--session-bubble-bottom-gap` 14.4 · `--session-stage-min-block-size` 205.
- `visual-gap-k1` §5 는 ready 임계를 790 으로 적었으나 790 은 Mock 문구에 묶인 값이고(§4.2 정정 2) 지시가 "임계값 796 불변" 이라 팝업과 같은 796 으로 했다. 790~795 ready 는 이전과 달리 간격 14.4 로 pill 이 소량 스크롤된다.
- 컨테이너 쿼리 블록은 파일 끝에 둔다 — 같은 특이도의 기본 규칙(`min-block-size: 0` · `gap`)이 뒤에 있으면 진다 (구현 중 실제로 무효였고 실측으로 잡았다).
- `container-type` 은 구형 WebKit 에서 layout containment 를 건다. 이 화면의 fixed 자손(Dialog · Sheet · Toast)은 전부 portal 이라 영향 없음 (코드 확인, 실기기 NOT VERIFIED).

## KF-2. 높이별 실측 (`getBoundingClientRect`, Mock n=5, 393·320 동일, paused = recording)

| 높이 | ring | Record top~bottom | 바 top~bottom | 바↔Record | 아래 여백 | 팝업 top→bottom · 목록 | ready 목록 (넘침) | 판정 |
|---|---|---|---|---|---|---|---|---|
| 759 | 190 | 528~678 | 696~741 | 18 | 18 | 272→528 · 177 | 177 | ✓ |
| 700 | 152 | 469~619 | 637~682 | 18 | 18 | 234→469 · 156 | 156 | ✓ |
| 660 | 152 | 433~583 | 601~646 | 18 | 14 | 234→433 · 120 | 120 | ✓ `AD-S4-21` |
| 646 | 152 | 433~583 | 601~646 | 18 | 0 | 234→433 · 120 | 120 | ✓ |
| 628 | 152 | 433~583 | 583~628 | 0 | 0 | 234→433 · 120 | 120 | ✓ 하한 |
| 600 | 152 | 433~583 | 583~628 | 0 | 0 | 234→433 · 120 | 120 | ⛔ 바 17 보임 · 28 잘림 |
| 568 | 152 | 433~583 | 583~628 | 0 | 0 | 234→433 · 120 | 120 | ⛔ 바 전체 밖 · Record 15 잘림 |

- ready 목록 전체 높이: 393 = 222 · 320 = 224. `≥ 796` 은 전 값 이전과 동일(852: Record 621 · 바 789~834 · 버블 277 · 팝업 293).
- safe-area 59/34 주입 393×852: `.haru-session` rect 759 · `100cqb` 프로브 759 · `container-type: size` · Record 587 · 바 bottom 800(safe 경계 818 안) · 팝업 331→587(이전 624, 37 겹침 해소). `env()` 가 0 이라 토큰 주입이다 — 실기기 아님.

## KF-3. ⛔ 구현하지 않은 높이 (사용자 결정 필요)

`AD-S4-22` 범위 = **628~645**. **627 이하**는 Record bottom 583 + 바 45 = 628 > 높이라 바를 더 올리면 Record 와 겹친다. 간격 0 인 채 멈추고 아래가 잘린다(`393×600` e2e 단정). 568 에서 부족한 높이는 **60** 이다.

바 위치만으로는 해결되지 않는다. Record 를 올리려면 승인 범위 밖 값을 바꿔야 한다: 유연 간격 하한 16(승인값) · ring 위 28 · 책 칩 15 · 상태 블록 23 — 전부 0 이어도 합 82 라 산술로는 546 까지 내려가지만 Figma 기하를 임의로 바꾸는 일이라 하지 않았다. 팝업 앵커도 함께 움직인다.

`AD-S4-22` 기재용 수치: 바 bottom = 콘텐츠 높이(아래 여백 0), Record ↔ 바 간격 = 높이 − 628 (645 → 17 · 628 → 0), 852 대비 18 → 0.

## KF-4. 검증

`typecheck` ✓ · `lint` ✓ · `lint:boundaries` ✓ (764 modules, 위반 0) · `build` ✓ · `format:check` ✓ · `assert:no-mocks` ✓ · `ls apps/api supabase apps/mobile` → 전부 없음. `test` **2308 / 160 files ✓** (최종 실행, load 6~13). 그 전 load 100+ 구간에서는 6회 중 3회 `findBy` 시간 초과 1~2건이 났다 — 실패 테스트가 실행마다 달랐고 해당 파일 단독 재실행은 전부 통과했다. `pnpm test:e2e` 단독 **413 passed (9.8m)** · 실패 0 (`test.fail` 1건 포함 — 320×568).

baseline: 재생성 **0장** — 전부 비교 통과(`threshold 0.02`), 이번 작업 중 변경된 스크린샷 파일 0. 원인 분해 대상 없음. 시각 baseline 은 모두 ≥ 796 이다 — **압축 구간은 baseline 이 아니라 기하 단정으로 지킨다.**

신규 e2e: `D4-78` 14 + 3 · `D4-79` 1 · `D4-81` 6 · 600 비겹침 1 · `e2e/shadow.spec.ts` ready 양축 프로브 2.

## KF-5. 수동 확인

`NOT VERIFIED`: iPhone Safari 실기기 — 컨테이너 높이가 실제 표시 높이를 따르는지(`K1-8` 의 `height`↔`dvh` 불일치는 쿼리 교체로 사라졌다), ready 목록 터치 스크롤. ⚠️ 현재 코드는 ready `Submit` 이 비활성이라(`CP-6` 은 `S4-H2`) "도달 가능" 은 **뷰포트 안 기하**까지만 단정했다.

## KF-6. `BACKEND_INTEGRATION_PENDING`

없음 — 레이아웃만 바꿨다. 신규 API·필드 0.

---

# `S4-K1 2차 후속` — `D4-82` · `D4-83` (2026-11-01, development-agent)

Status: **HANDOFF** · 근거 `docs/design/stage-4b-visual-gap-k1.md` 후속 §5 · §8 · approvals `D4-81`~`D4-85`. `S4-H1` · `S4-H2` · `S4-K2` 는 착수하지 않았다. **커밋하지 않았다.** approvals 문서는 수정하지 않았다. §KF-3 의 멈춘 지점이 해소됐다.

## K2F-1. 구현

| 항목 | 내용 | 위치 |
|---|---|---|
| `D4-82` 스크롤 지점 | `FullscreenLayout` → `AppShell scroll="auto"` (`overscroll-contain` 유지). 뷰포트는 앱 컬럼 바깥 | `FullscreenLayout.tsx` · `AppShell.tsx`(주석) · `router.tsx`(주석) |
| `D4-82` 하한 | `.haru-session` 본 화면에 `min-block-size` = 76 + 152 + 205 + 150 + 45 = **628** (기존 토큰 calc). 대기·오류 화면 제외 | `storytime-session.css` |
| `D4-82` 포커스 | Record · 바 버튼 `scroll-margin-block` = 링 4 | `storytime-session.css` |
| `D4-82` 이중 스크롤 | ready · 팝업 pill 목록의 `overscroll-behavior: contain` **제거** (K2F-3) | `session.css` · `session-prompts.css` |
| `D4-83` | CSS 주석 한 줄 (`@media` 대체 없음의 근거) | `storytime-session.css` |

- ⚠️ `visual-gap-k1` 시뮬레이션과 다른 점: 스크롤을 넘침으로 만들지 않고 **박스 하한**으로 만들었다. `size` 컨테이너의 내용은 조상 높이에 기여하지 않아 넘침만으로는 `AppColumn` 아래 safe-area 가 스크롤에 안 들어가고, layout containment 를 거는 WebKit 에서는 넘침이 스크롤 범위에서 빠질 수 있다. 하한이면 쿼리도 628 로 판단해 627 이하 기하가 628 과 같다.
- `/session/:id/complete`(같은 `FullscreenLayout`)도 `auto` 가 됐다. 넘치는 내용이 없으면 차이 없다.
- `AppShell scroll="none"` 은 사용처가 없어졌다. 공용 prop 이라 지우지 않았다.

## K2F-2. 높이별 실측 (`getBoundingClientRect`, 스크립트 `scrollTop` 조작, recording)

| 뷰포트 | scrollHeight / client | 스크롤 전 Record · 바 | 끝까지 내린 후 Record · 바 | 가로 넘침 |
|---|---|---|---|---|
| 393×852 | 852 / 852 | 621~771 · 789~834 | 스크롤 없음 | 0 |
| 393×796 | 796 / 796 | 565~715 · 733~778 | 스크롤 없음 | 0 |
| 393×628 · 320×628 | 628 / 628 | 433~583 · 583~628 | 스크롤 없음 | 0 |
| 393×627 | 628 / 627 | 433~583 · 583~628 | 432~582 · 582~627 | 0 |
| 393×600 | 628 / 600 | 433~583 · 583~628 | 405~555 · 555~600 | 0 |
| 320×568 | 628 / 568 | 433~583 · 583~628 | 373~523 · 523~568 | 0 |
| 375×548 | 628 / 548 | 433~583 · 583~628 | 353~503 · 503~548 | 0 |
| 393×460 | 628 / 460 | 433~583 · 583~628 | 265~415 · 415~460 | 0 |

- safe-area 주입 20/34 · 320×568: scrollHeight 682, 끝에서 바 bottom **534**(568 − 34) — 홈 인디케이터 위. 토큰 주입이며 실기기 아님.
- `container: none` 근사(`@container` 미지원, Safari 실행 아님) 320×568: scrollHeight 686, 끝에서 바 505~550 — 도달 가능.
- 키보드 320×568: Close → Pause(Record bottom 564, 링 4 확보) → Discard · Submit(바 bottom 568, `scrollTop` 60) → Shift+Tab 복귀 시 맨 위까지 돌아온다. 바는 스크롤 끝이라 링 아래 4 는 화면 끝에 걸린다(628 과 동일, `AD-S4-22`).

## K2F-3. 이중 스크롤 (Chromium `Input.synthesizeScrollGesture` touch, 목록 위에서 시작한 400px 제스처 2회)

| | 제스처 1 | 제스처 2 |
|---|---|---|
| 수정 전 `contain`, 320×568 · 393×460, ready · 팝업 | 목록 끝까지 | ⛔ **뷰포트 `scrollTop` 0 — 갇힘** |
| 수정 후 기본값, 같은 조합 | 목록 끝까지 · 뷰포트 0 | 뷰포트 끝까지(60 · 168) |

목록 밖에서 시작한 제스처는 수정 전후 모두 뷰포트를 움직인다. 628 이상은 뷰포트에 스크롤이 없고 `overscroll-contain` 이 바깥 전파를 막으므로 `contain` 제거의 영향이 없다. 대상은 `e2e/session-prompts.spec.ts` 터치 묶음 4건. iOS Safari 실기기 관성·전달은 `NOT VERIFIED`.

## K2F-4. 수동 확인

`NOT VERIFIED`: iPhone Safari 실기기 — 목록 끝 제스처 전달, 팝업 밖 드래그(코드는 `pointerdown` 에서 닫는다. 합성 제스처에서는 팝업이 열린 채였다), `Submit` 첫 탭이 툴바를 부르는지(`VG-KF-04`).

`AD-S4-23` 기재용 수치: 628 미만 기하 = 628 과 동일(Record 433~583 · 바 583~628), 스크롤 범위 = 628 − 콘텐츠 높이 (568 → 60 · 548 → 80 · 460 → 168), 끝에서 바 bottom = 콘텐츠 영역 하단.

## K2F-5. 검증

`typecheck` ✓ · `lint` ✓ · `lint:boundaries` ✓ (764 modules, 위반 0) · `format:check` ✓ · `build` ✓ · `assert:no-mocks` ✓ · `test` **2308 / 160 files ✓** · `ls apps/api supabase apps/mobile` → 전부 없음. `pnpm test:e2e` 단독 **433 passed (11.1m)** · 실패 0 · `test.fail` 0.

baseline: 재생성 **0장** — 전부 비교 통과, `e2e/__screenshots__` 변경 파일 수 실행 전후 동일(2 — 이번 작업 전부터 있던 변경). 시각 baseline 은 ≥ 796 이라 원인 분해 대상이 없다.

신규 e2e: `session-prompts.spec.ts` `D4-82` 묶음(무스크롤 5 · 스크롤 4 · 키보드 · 팝업 · inset · 미지원 근사 · 터치 4) + `test.fail` 교체 1, `shadow.spec.ts` 양축 프로브 3. Toast 는 portal + `position: fixed` 라 스크롤과 무관하다(코드 확인).

## K2F-6. `BACKEND_INTEGRATION_PENDING`

없음 — 레이아웃만 바꿨다. 신규 API·필드 0.

---

# S4-H1 — 완료 화면 `/session/:id/complete`

Status: **HANDOFF** · `S4-H2` · `S4-K2` 착수 안 함 · 커밋 안 함 · Plan·Spec·approvals 수정 안 함.

## H1-1. 구현

| 항목 | 위치 |
|---|---|
| 화면 | `features/storytime-session/ui/SessionCompleteScreen.tsx` · CSS `storytime-session.css` 끝 |
| Page (composition) | `pages/session/SessionCompletePage.tsx` |
| 스티커 칩 · 완료 버블 | `entities/session/AttendanceStickerChip.tsx` · `SessionCompleteBubble.tsx` · `session.css` |
| 데이터 | `entities/session/useSessionCompletion.ts`, 키 `completionResult` · `completionDetail` |
| 전이 응답 전달 | `SessionRecorderOutcome` 에 `result?` 추가 → `Submit` 이 캐시에 둔 뒤 이동 (contracts 변경 0) |
| 토큰 | `T-4` `--gradient-sticker-badge` · `T-7` `--shadow-sticker-badge` · Tier 3 19종 (239 → 258) |
| 아이콘 | `haru:sticker-thumb` — `90:602` 에셋 원문 path, `white` → `currentColor` |
| Mock | `MOCK_COMPLETION_BUBBLE.text` = `88:929` override 문자열 (시각 대조용) |
| 문구 | `copy.complete.title` = `Session Complete` (`29:75`). 버블·스티커는 응답 값 |
| 모션 | Spec §6.4 C-1~C-3 · reduced-motion 이면 없음 |

`detail` 과 키를 나눈 이유: 세션 화면의 `detail` 은 ready 시점 값을 `staleTime: Infinity` 로 들고 있어 `sticker: null` 이다.

## H1-2. Figma 대조

호출: `get_metadata(29:62)` · `get_design_context(29:62)` · `get_variable_defs(29:62)` + 렌더 PNG. 구현은 Playwright `boundingBox` · computed (`e2e/session-complete.spec.ts`). Web y = Figma y − 56, 전부 일치 단정.

| 요소 | Figma | 구현 (Web y +56 환산) |
|---|---|---|
| 닫기 | 38×38 @ 331,66 | 동일 |
| 제목 중심 y | 76 + 18/2 = 85 | 85 (줄 20, Spec §2.7 흡수) |
| 스티커 / 타일 / 아이콘 | 257×64 @ 68,100 / 44 @ 78,110 / 20 @ 89,121 | 동일 |
| 텍스트 x | 68 + 66 = 134 | 134 |
| 링 / 아바타 | 150 @ 121.5,172 / 136 @ 128.5,179 | 동일 |
| 버블 본체 | 297 @ x48 · top 324 + 22.627 − 12 = 334.627 | 동일 |
| 스티커 면 | `glass-fill` white 74% | computed `rgba(255,255,255,0.74)` |
| 타일 | 140.27deg `#d0cca1`→`#eed2bd` · `0 4px 10px` · inset 1.5 | computed 일치 |
| 버블 주 문구 | Bold 16/22 `#4a5f5c` | computed 700 · 16px · 22px · 일치 |

픽셀 대조 (Figma PNG 크롭 ↔ baseline, 채널 차 > 16 비율): 닫기 2.0% · 타일 영역 0% · 메달리온 2.4% · tail 0.2%. 제목 23% 는 글자 폭 차이다 (구현이 약간 좁다, 크롭 3배 확대로 확인). 정식 판정은 design-agent Visual Gap 몫이다.

⚠️ Spec 표기 정정 필요: y 468 은 `88:929` **선언** 높이의 끝이다. Figma 렌더 본체는 약 432 에서 끝난다 (14 + 44 + 6 + 19 + 14 = 97). 보조 줄이 없는 구현 본체는 Web 351 까지다.

Spec 대로 Figma 와 다른 지점: 스티커 제목 14 → 15/20 (Spec §5.4-① 승인 흡수), 부제 문구 (`AD-S4-1`). 링은 Figma 150 — 토큰 파생 152 는 `AD-S4-8` 승인 대기라 쓰지 않았다.

## H1-3. 사용자 결정 필요 — 구현하지 않은 지점

| # | 지점 | 현재 | 결정할 것 |
|---|---|---|---|
| 1 | **닫기 목적지** (Spec §12.4-⑫ 미결) | Figma 대로 보이지만 **눌러도 동작 없음**. 이 화면에서 나가는 유일한 경로다 | 어디로 가는가. 세션 다른 종료는 전부 홈이다 |
| 2 | **버블 보조 줄** `14 min together · sticker earned` (`88:929`, Spec §12.4-②) | **안 그림** — 응답에 필드가 없고 Frontend 생성 금지(`architecture` §8). Figma 요소가 빠져 있다 | 표시 여부 · `min` 단위 · contract 필드 추가 여부 |
| 3 | **재진입 시 버블** | `completionBubble` 은 전이 응답에만 있어 새로고침·재진입이면 **버블이 없다**. 오프라인 제출(`result: null`)은 스티커도 없다. Plan 은 contract "변경 없음" | `SessionDetail` 에 필드 추가 또는 현행 수용. Contract 가 요구를 못 담으면 QA `FAIL` 사유다 |
| 4 | `AD-S4-8` 링 150 ↔ 152 | Figma 150 으로 구현 | 등록 대기 항목 철회 가능 |
| 5 | Spec §12.4-⑭ Bold · ⑯ 아이콘 · Q12 모션 순서 | Figma 선언대로 Bold · Figma 에셋 · Spec 순서로 구현 | 미결 표기 정리 |

그 밖: 완료되지 않은 세션으로 `/complete` 직접 진입 시 막는 규칙이 Plan·Spec 에 없어 그대로 렌더한다. 30분 자동 종료 경로의 이동·전달은 `S4-H2`(AC-4-64)다. 업로드 슬롯(y 468~521)은 `S4-H2` 다.

## H1-4. AC

| AC | 상태 | 증거 |
|---|---|---|
| 57 | 충족 | 기존 `session-recording` 단위·e2e |
| 58 | **Submit 경로 충족, 재진입 미충족** (결정 3) | 단위 · e2e 텍스트 비교 |
| 59 | 충족 | DOM ↔ Mock 값 · `streak`·`Day \d` 0 |
| 60 | 충족 — 스티커 1개 · 전이 추가 0 · 같은 키 replay 는 기존 Mock 테스트 | 단위 재진입 |
| 61 | 충족 | e2e `y > 412` 요소 0 · 회고 카드 0 |
| 104 | 코드 주석 충족 · QA 리포트 기록은 QA 몫 | `SessionCompleteScreen.tsx` 머리 주석 |
| 107 | 충족 | 문구 `D4-10` · 응답 값 |

`VG-K1S-02`: 393×460 · 375×548 · 320×568 에서 `Submit` 까지 스크롤(`scrollTop` > 0) 후 이동 → `scrollTop` 0 · 닫기 y 10 단정. 같은 테스트에서 끝까지 내려 버블 bottom ≤ 뷰포트 높이 단정. safe-area 주입과 실기기는 측정 안 함.

## H1-5. Mock · BACKEND_INTEGRATION_PENDING

전환 방법 신규 없음. 기존 경로로 Submit 후 진입, 오류는 없는 세션 id 로 재현. 예상 PENDING: 결정 3 의 서버 필드(결정 시) · `P4-BIP-18` 스티커 문구 서버 제공 (기존).

## H1-6. 검증

`typecheck` ✓ · `lint` ✓ · `lint:boundaries` ✓ · `format:check` ✓ · `build` ✓ · `assert:no-mocks` ✓ · `ls apps/api supabase apps/mobile` → 전부 없음.

`test` **2315 / 160 files** — 최근 전체 3회 연속 통과. ⚠️ 그 전 전체 실행 2회가 간헐 실패했다: 5건(로그 미보존, 원인 미확인) · 1건(`AC-4-126 book-no-cover`, S4-H1 코드 경로 밖). `WORKFLOW_STATE` 의 "고부하 시간 초과 원인 미확정" 과 같은 계열로 **추정**할 뿐 확정하지 않았다.

`test:e2e` 재실행 **443 passed (11.3m)**. 1차는 442 passed · 1 failed (16.4m, `shadow.spec.ts:850` delta 9 ≥ 8) — 3일 된 잔존 headless Chromium 이 떠 있었다. 이를 종료한 뒤 해당 테스트 단독 통과, 전체 재실행 통과. 인과는 확정하지 못했다. baseline: 신규 `s4-session-complete.png` 1장, 재생성 0장.


# `S4-H1R` — 완료 화면 결정 반영 (2026-11-02, development-agent)

Status: **HANDOFF** · 작업 단위 **`S4-H1R` 만**. `S4-H2` · `S4-K2` 는 착수하지 않았다. **커밋하지 않았다.** 지시: Plan §13.2(개정 1.3) · `API_CONTRACTS.md` Rev 8.9 §3.2.3 · `stage-4b-visual-gap-h1.md` §7·§8 · `D4-86`~`D4-99`.

## H1R-1. 구현 전 실측

`get_design_context(88:929)` · `get_design_context(29:79)` · `get_metadata(29:79)`: 보조 줄 Regular 13 · leading 19 · `#7d9291` · 가운데 · 부모 gap 6 · `word-break: break-word` · clamp 선언 0. 스티커 제목 `29:84` 590 14 · leading normal · 노드 130×17 @ (0,0), 부제 `29:85` 노드 높이 14 @ y19, 스택 `29:83` 33 @ y15.5.

## H1R-2. 구현 (Plan §13.2 번호)

1. contracts: `subtext` · `SessionDetail.completionBubble`, 테스트 추가.
2. Mock: `toDetail` 완료 계열 한정(결함 1) · 지난 세션 seed `subtext: null`(결함 2) · `session-completion` 3 key. 값은 세션 레코드 하나를 전이 응답과 Detail 이 공유한다.
3. 재진입: `useSessionCompletion` 전이 응답 → `detail.completionBubble`. `selectCompletionBubble` = `D4-95`·빈 값 판정.
4. 화면: `<p class="haru-session-bubble__subtext">`. `Text` 를 쓰지 않은 이유 — `Text` 는 `className` 을 받지 않고 `.haru-text` 면 `session.css` 22 강제에 걸린다. computed `13px / 19px / 400 / rgb(125,146,145) / center / normal` 로 확인.
5. 직접 진입: `leave` (`ready`·`abandoned`, Detail 경로만) → `Navigate replace`. `recording`·`paused` 는 현행 유지(`S4-H2`).
6. 닫기: 홈 `replace`.
7. Toast: ⚠️ **방식이 Plan 과 다르다** → H1R-5 ①.
8. 스티커 제목: `--attendance-sticker-title-size` 14 · `-line` 17, 신규 Primitive 0.
9. 오류 화면: `features/storytime-session/ui/SessionLoadError.tsx` 를 두 화면이 공유, `packages/ui` 변경 0.
10. `D4-92`: 토큰 주석 정정 — 코드 값 불변. 토큰 261 (+3: 위 2 + `--bubble-complete-subtext-line`).

## H1R-3. 실측 (Playwright 번들 Chromium, DSF 1, `getBoundingClientRect` · computed)

| 항목 | 값 | 방법 |
|---|---|---|
| 본체 bottom | Web 375.63 (+56 = 431.63) · 보조 없음 350.63 | e2e 단정 393×852 |
| 보조 줄 | 265×19 · 주 문구와 gap 6.0 | e2e 단정 |
| 320 긴 문구 | 2줄 38 · 본체 bottom 394.63 · 58자 무공백 가로 넘침 0 | 실제 CSS 에 런타임으로 문구 교체 (Scenario key 추가 금지 때문) |
| 스티커 제목 | 14px · 590 · line 17. `line-height: normal` 런타임 토글 = 같은 17 → 선언 대응 확인 | computed + 토글 |
| 스택 | 35 (17 + 2 + 16) ≤ 44 · 제목 y 58.5 | rect. Figma 환산 59.5 → **−1** (H1R-5 ②) |
| 닫기 | 38×38 @ 331,10 불변 · 줄 박스 48 | rect |

## H1R-4. Toast 재측정 (AC-4-142 ②, `D4-89`)

측정: 임시 spec(삭제함)이 `Submit` 직전 rAF 샘플러를 켜고, 안정 후 `elementFromPoint`. 393×852 · 320×568 · 600×900.

| 항목 | 값 |
|---|---|
| Toast | y **64~114** (3뷰포트 동일), inset 48 + 16 · 폭 345 / 272 / 432 |
| 제목(bottom 39) · 닫기(bottom 48) 겹침 | **0** · 닫기 중심 hit = 닫기 |
| ⚠️ **스티커(y 44~108) 겹침** | **세로 44 / 64** (y 64~108), 가로 전폭 — 스티커 중심 hit = Toast. 위 20 만 보인다 |
| ⚠️ 위치 점프 | 첫 프레임(샘플 43~61ms) y 16 → 다음 프레임 y 64. 1회. 등록이 이동 뒤라서다 |
| C-3 pop-in | Toast 4000ms 안에 끝난다 `[계산: 지연 240 + base]` → **전부 Toast 아래에서 재생** |

**허용 차이로 처리하지 않았다** (AC-4-142 ③). 사용자 판단 대상 → H1R-5 ③.

## H1R-5. 결정 필요

① **Toast inset 등록 방식**: Plan §13.2-7 · Spec §2.5.1 = `FullscreenLayout` `topBar` prop. 구현 = **feature 가 닫기 줄(48)을 `useToastTopBarInset` 으로 직접 등록** — Visual Gap 결정 4 권고의 "inset 등록만" 경로. 이유: 슬롯은 layout 소유라 로딩·오류 화면에도 제목이 뜨고(오류 화면 `h1` 2개, AC-4-144 두 경로 기하가 달라진다) `sticky` 라 짧은 세로에서 내용을 덮으며 띠 48 이 스티커 y44 와 겹쳐 Figma 좌표를 깬다. Toast 결과는 같다. 승인 또는 Plan 대로 재작업 판단.
② **스티커 부제 줄 높이**: 구현 16(`caption-1`) ↔ Figma 14. 그래서 스택 35 ↔ 33, 제목 y −1 (부제 중심은 동일). `D4-90` 범위 밖이라 안 건드렸다.
③ **Toast ↔ 스티커 겹침 44** · 점프: 수용 / 다른 처리.

## H1R-6. AC

| AC | 상태 | 증거 |
|---|---|---|
| 58 · 60 | 충족 | 단위 재진입 — 버블 = Detail 값, 전이 추가 0 |
| 139 ①~⑧ | 충족 | 단위 · e2e · grep(`14 min`·`sticker earned` `mocks/` 밖 0 · 완료 화면 3파일 `recordedSeconds` 0 · `SessionReadyBubble` `subtext` 0) |
| 140 ①~④ | 충족 — `abandoned` 는 Mock 단위 + 같은 분기, e2e 는 `ready` | 단위 · e2e · ⑤ 는 `S4-H2` |
| 141 | 충족 | e2e · 단위 |
| 142 ① | 충족 · ②는 H1R-4 · ③ 미처리(사용자 판단) | e2e `elementFromPoint` |
| 143 | 충족 | computed · 토큰 |
| 144 | 충족 | 경로 2 × 오류 2 e2e · 기하 3뷰포트 |

## H1R-7. Mock

`?scenario=session-completion:subtext-missing` · `session-completion:bubble-missing` (세션 생성 시 적용). 조회 오류 = `sessions.getDetail:error`. 없는 세션 = 임의 uuid.

## H1R-8. baseline (`R-BASELINE-1`)

`s4-session-complete.png` 1장 재생성. 분해(채널 Δ>5 연결성분): ① x48~344 y330~381 9241px = 보조 줄 + 본체 25 연장 ② x135~269 y61~73 1255px = 제목 15→14 ③ x134~269 y80~93 684px = 스택 3 축소로 부제 −1.5. **토글 재현**: 현재 빌드에 제목 15/20 · 보조 줄 `display: none` 만 주입 → 옛 baseline 대비 **0px**. 설명 안 되는 클러스터 0. 정착 경로는 기존 테스트 그대로(Toast 퇴장 + `settleImages` · dev 패널 숨김).

## H1R-9. `BACKEND_INTEGRATION_PENDING` 예상

`P4B-BIP-02`(`subtext` 생성) · `P4B-BIP-03`(완료 버블 보존). 둘 다 `API_CONTRACTS.md` §3.2.3 등재.

## H1R-10. 검증

`typecheck` ✓ · `lint` ✓ · `lint:boundaries` ✓ · `format:check` ✓ · `build` ✓ · `assert:no-mocks` ✓ · `test` **2345 / 161 files** ✓ · `ls apps/api supabase apps/mobile` → 전부 없음.

`test:e2e` 재실행 **457 passed (9.6m)**. ⚠️ 1차는 454 passed · 3 failed (**42.1m**): `home.spec.ts:633` · `onboarding.spec.ts:226`(page 준비 타임아웃) · `session-prompts.spec.ts:537`. 3건 모두 이 단위 코드 경로 밖이고 단독 재실행 통과, 전체 재실행도 통과. 1차 때 잔존 프로세스는 시작 전 확인에서 없었고, 소요 4배 차이의 원인은 **확인하지 못했다**(외부 부하 추정). 1차와 2차 사이 코드 변경 0.

Visual Gap 재확인(design-agent) 대상: 본체 bottom 431 · 줄 19 · Toast · 스티커 제목 14 · 오류 화면 명세. 오류 화면 baseline 은 추가하지 않았다(Figma 대조 대상 없음, 명세 대조).

# `S4-H1F` — `S4-H1R` 후속 `D4-100` · `D4-101` (2026-11-02, development-agent)

Status: **HANDOFF** · `S4-H2` · `S4-K2` 착수 안 함. **커밋 안 함.** 지시: `stage-4b-visual-gap-h1.md` §9 · `D4-100` · `D4-101`.

## H1F-1. `D4-100` 구현

| 파일 | 내용 |
|---|---|
| `apps/web/src/features/storytime-session/ui/useStickerEntrance.ts` (신규) | `static` · `held` · `play` 판정 |
| `SessionCompleteScreen.tsx` · `storytime-session.css` | 슬롯 `data-entrance`. 칩은 항상 렌더, `held` = `visibility: hidden`, `play` = C-3 |
| `StorytimeSessionScreen.tsx` | `navigate(..., { state: SUBMIT_ENTRY })` |
| `packages/ui` `ToastProvider.tsx` · `index.ts` | ⚠️ **신규 공개 훅 `useToastPresent`** — 지시에 없던 추가 (H1F-5 ①) |

- 판정: 진입 시점에 `SUBMIT_ENTRY` 이고 Toast 가 있으면 `held`, 그 외 `static`. 새로고침은 history state 가 남아도 Toast 가 없어 `static`.
- 퇴장 신호: `useToastPresent` = 퇴장 애니메이션 끝까지 `true`. `onDismiss` 를 쓰지 않은 이유 — 퇴장 **시작** 시점이고, 교체된 Toast 에서는 불리지 않아 스티커가 영영 안 나타날 수 있다.
- 사용자 닫기: `Submit` Toast 에는 닫기 버튼이 없다(`dismissLabel` 미지정). `dismiss()` · 교체 경로는 단위 테스트로 확인했고 e2e 는 없다.
- 타이머: 이 기능은 타이머를 **만들지 않는다**. 언마운트 시 정리할 것이 없으며, Toast 타이머는 Provider 가 소유한다. 단위 테스트에 `held` 중 언마운트 포함.
- 레이아웃: 슬롯 64 고정 + `visibility` 라 자리 유지. 메달리온 top 이 `held` ↔ 재생 후 동일 (e2e 단정).
- 재진입 범위: `static` 은 C-3 만 끈다. C-1 · C-2 는 재진입에서도 기존대로 재생된다.

## H1F-2. `prefers-reduced-motion` 시점 정의

**연출 없이 진입 즉시 최종 상태로 표시한다 — Toast 퇴장을 기다리지 않는다.** 근거: Spec §6.6 *"최종 상태를 즉시 표시"*, `D4-100` 이 미루는 대상은 **연출**이고 reduced motion 에는 연출이 없다. 숨김 CSS 도 `no-preference` 안이라 JS 분기가 없다.

⚠️ 결과: reduced motion 사용자에게는 Toast 가 스티커 44/64 를 약 4초 가리는 상태(`VG-H1R-01`)가 **남는다** (H1F-5 ③).

## H1F-3. 실측

### C-3 타이밍 — 실제 `Submit`, rAF 샘플러, `no-preference`, dev 서버, CPU 1×, 3회

| 사건 | t (ms, `Submit` 전 샘플러 시작 기준) |
|---|---|
| Toast 첫 프레임 | 43 · 45 · 61 |
| Toast DOM 제거 | 4237 · 4237 · 4251 |
| 칩 opacity > 0 첫 프레임 | 4486 · 4487 · 4501 (이때 Toast 없음, 3회 모두) |
| 칩 opacity 1 · scale 1 | 4718 · 4719 · 4735 |

Toast 제거와 C-3 시작 사이 약 250ms 는 Spec C-3 delay 240 을 그대로 둔 값이다 (H1F-5 ②).

### `D4-101` — Toast 첫 프레임, 393×852, CPU × 3회씩 rAF 샘플 (`.haru-toast` rect · computed opacity · inset 클래스)

| CPU | 수정 전: inset 전 프레임 수 · opacity 최대 · 지속 | 수정 후 |
|---|---|---|
| 1× | 1~2 · 0~0.16 · 0~7ms | 1 · **0** · 0ms |
| 4× | 3~4 · 0.16 · 25~26ms | 2 · **0** · 2~10ms |
| 6× | 5 · **0.5** · 53~58ms | 3 · **0.16** · 17~25ms |

⚠️ **완전히 없어지지 않았다.** 1× · 4× 는 보이는 도약이 사라졌지만 6× 에서는 opacity 0.16 프레임이 남는다 (y 5.9 → 56). 원인: `toast.show` 가 `navigate` 앞이라 Toast 가 완료 화면보다 먼저 커밋되고, 그 사이는 훅이 관여할 수 없다. 수정 전 1× 값은 §9.4(opacity 0)보다 높게 나온 회차가 있다 — 같은 측정의 회차 편차로 본다.

SSR 없음 확인: 저장소 grep `hydrateRoot` · `renderToString` · `renderToPipeableStream` 0건, 진입은 `main.tsx` `createRoot` 뿐.

## H1F-4. 검증

`typecheck` · `lint` · `lint:boundaries` · `format:check` · `build` · `assert:no-mocks` ✓ · `test` **2353 / 162 files** ✓ · `test:e2e` 단독 **460 passed (9.8m)** · `ls apps/api supabase apps/mobile` → 전부 없음. 실행 전후 Playwright 프로세스·포트 4319 리슨 0, 강제 종료 없음. 임시 측정 spec 2개 삭제함.

신규 테스트: e2e 3 (`Submit` 경로 · 재진입 · reduced motion), 단위 8 (`useStickerEntrance` 7 · `useToastPresent` 1). `Submit` e2e 는 `animationstart` 를 페이지 안에서 기록해 시작 순간 Toast 부재를 단정한다. 추가 대상 3건 + `baseline` `--repeat-each=3` 통과.

**baseline 재생성 0장.** e2e 기본이 reduced motion 이고 `s4-session-complete.png` 는 Toast 퇴장 후 최종 상태라 픽셀이 바뀌지 않아 그대로 통과했다.

측정 범위 밖: 실기기 · Production 빌드 타이밍 · VoiceOver 가 `held` → `play` 전환에서 칩의 `role="status"` 를 읽는지.

## H1F-5. 판단 필요

① `useToastPresent` 를 `packages/ui` 에 추가 — 승인 또는 대안 지시.
② 재생 시 C-3 delay 240 유지 — Spec 값을 바꾸지 않았다. 이 delay 는 C-1·C-2 뒤로 미루려던 값이라 Toast 뒤에서는 공백일 뿐이다. 0 으로 두면 약 240ms 빨라진다.
③ reduced motion 에서 Toast 겹침 잔존 — 수용 또는 "Toast 퇴장 후 표시" 로 변경.
④ `D4-101` 6× 잔여 프레임 — 수용 또는 `toast.show` 순서 변경 (별도 결정, 이번 범위 밖).

Visual Gap 재확인(design-agent) 대상: Toast 퇴장 후 C-3 체감 · 대기 약 4.7초. 스티커 연출을 지연한 `VG-H1R-01` 의 실제 해소 판정은 design-agent 몫이다.

## H1F-6. `D4-105` · `D4-106` 구현 (2026-11-02, development-agent)

지시: `stage-4b-visual-gap-h1.md` §10 · `VG-H1F-01` · `VG-H1F-02`. `S4-H2` · `S4-K2` 착수 안 함. **커밋 안 함.** H1F-2 의 시점 정의와 H1F-5 ② · ③ 은 이 절로 대체된다.

| 파일 | 내용 |
|---|---|
| `packages/design-tokens/src/component/index.css` | `--session-complete-sticker-delay` 240ms → **0ms** (`D4-105`). 사용처는 `play` 규칙 1곳, C-1 · C-2 불변 |
| `storytime-session.css` | `held` 숨김 규칙을 `no-preference` media 밖으로 이동 (`D4-106`). 재생 애니메이션은 media 안 그대로 |
| `useStickerEntrance.ts` | 주석만. JS 분기 없음 — 시점은 같고 reduced motion 의 `play` 는 연출 없는 표시 |
| `__tests__/useStickerEntrance.test.tsx` | reduced motion 에서 `held → play` 시점 동일 단정 1건 추가 (+1) |
| `e2e/session-complete.spec.ts` | Submit 경로 C-3 `animation-delay` 0s · C-2 0.12s 단정 추가. reduced motion "Toast 를 기다리지 않는다" 단정을 반전, 재진입 즉시 표시 추가 (+1) |

레이아웃 불변: 슬롯 64 · 칩 `visibility` 숨김 유지. reduced motion `held` ↔ 표시 후 칩 box 동일 (e2e 단정).

실측 — 실제 `Submit`, rAF 샘플러(`.haru-toast` 존재 · 칩 computed visibility/opacity), dev 서버, DSF 1, CPU 1×, 각 3회, t = `Submit` pointerdown 기준. 임시 spec 은 측정 후 삭제.

| | Toast 사라진 첫 프레임 | 칩 첫 표시 | 공백 | 칩 ∩ Toast 프레임 | 시퀀스 |
|---|---|---|---|---|---|
| `no-preference` | 4216.3 · 4214.1 · 4212.8 | 4232.2 · 4230.6 · 4230.4 | **15.9 · 16.5 · 17.6ms** (1프레임, 이전 약 250) | **0 · 0 · 0** | `held → play` |
| reduced motion | 4215.5 · 4213.2 · 4214.6 | 같은 프레임 | **0 · 0 · 0ms** | **0 · 0 · 0** (이전 251프레임) | `held → play`, 칩 opacity 첫 프레임부터 1 |

검증: `typecheck` · `lint` · `lint:boundaries` · `format:check` · `build` · `assert:no-mocks` ✓ · `test` **2354 / 162 files** ✓ · `test:e2e` 단독 **461 passed (10.0m)** · `ls apps/api supabase apps/mobile` → 전부 없음. 실행 전후 Playwright 프로세스 · 포트 4319 리슨 0, 강제 종료 없음.

**baseline 재생성 0장.** `s4-session-complete.png` 는 Toast 퇴장 후 촬영이고 그 시점 reduced motion 최종 상태가 같아 재생성 없이 통과했다. 원인 분해할 diff 없음.

정정 대상(문서, development-agent 범위 밖): Stage 4 Spec §6.4 C-3 지연 240 · §6.6 "즉시 표시" 표현 — `D4-105` · `D4-106` 반영 필요.

측정 범위 밖: 실기기 · Production 빌드 타이밍 · VoiceOver. `D4-107` 은 코드 변경 없음.

---

# S4-H2 — 예외·안내 UI (2026-11-02, development-agent)

Status: **HANDOFF (부분)** · 커밋 안 함 · Plan·Spec·approvals 수정 안 함 · `apps/api` · `supabase` · `apps/mobile` 없음.
근거: Plan §13 `S4-H2` 행 · Spec §7.1~§7.3 · `D4-26` · `D4-44` · `D4-58`(CP-4·5·6) · `D4-111`. Figma 노드 없음(C13-4B-4·8 = design-agent 명세) — Record Control 변형 2종은 `S4-F2` 실측값 그대로.

## H2-1. 구현

| 항목 | 위치 | 내용 |
|---|---|---|
| 구독 경계 | `entities/session/sessionRecorder.tsx` · `app/providers/sessionRecorderEnvironment.ts` | `SessionRecorder` 에 `onNotice`(`background` · `auto_timeout`+전이 결과) · `connectivity`/`onConnectivity`(플랫폼 `AppStatePort`) 추가, 스냅샷에 `mode` · `completedReason`. 조립 지점이 컨트롤러 이벤트를 옮긴다 |
| 변형 연결 (AC-4-134) | `entities/session/recordControlState.ts` `selectSessionRecordGate` | `permission_denied`·`mic_unavailable` → `permission-denied` · `conversation_only` → `permission-denied` · `consent_blocked` → `disabled`(+`aria-describedby`) · `requesting_permission`·`starting`·`stopping` → `disabled` |
| 마이크 거부 시트 (AC-4-63, §7.3) | `features/storytime-session/ui/MicPermissionSheet.tsx` | `Sheet bottom` · 제목 · 안내 문단 · `Not now`(glass, footer). 권한 거부 직후 1회 자동 + `permission-denied` 탭(`aria-haspopup="dialog"`). ⚠ `Talk without recording` **미렌더** — H2-D1 |
| 대화 전용 ready (CP-6) | `SessionActionBar` state `conversation` · `StorytimeSessionScreen` | Record `permission-denied` · `Submit` 활성 · `Discard` 비활성(사유) · `Submit` → `ready → completed(user_done)` → 완료 화면 |
| 공지 슬롯 (AC-4-70, §7.2) | `ui/SessionNoticeSlot.tsx` · `storytime-session.css` `.haru-session__notice` | 녹음 중 탭 숨김(`notice` · `background`) → `InlineAlert info` + `Dismiss`. stage 남는 공간 가운데(`margin-block: auto`), Figma 요소 이동 0. 들어가지 않으면(stage 넘침 측정) 슬롯을 거두고 Toast |
| 오프라인 Toast (§7.1) | `StorytimeSessionScreen` | 연결이 바뀔 때만 `Toast neutral` 1회씩 (S1~S3) |
| 30분 자동 종료 (AC-4-64) | `StorytimeSessionScreen` | `auto_timeout` 전이 결과 → 완료 응답 기억 · `Toast neutral` · 완료 화면(`SUBMIT_ENTRY`). `Recording submitted` 는 띄우지 않는다 |
| 문구 | `features/storytime-session/copy.ts` | Spec 원문: `Microphone is off` · `Mic is off` · `Talk without recording` · `Not now` · `Dismiss`(기존). **초안(승인 대상)**: `record.consentReason` · `micSheet.title`/`description` · `actions.conversationReason` · `notices.background.*` · `connectivity.*` · `autoTimeout` |
| 테스트 | `apps/web/__tests__/session-exceptions.test.tsx`(+13) · `e2e/session-exceptions.spec.ts`(+6) · `src/test/harness.tsx`(`appState()` 접근자) | |
| 기존 테스트 수정 | `__tests__/session-prompts.test.tsx` 2건 | "30분 자동 종료 뒤 세션 화면에 칩이 남아 다시 눌러도 안 열린다" → AC-4-64 로 **완료 화면으로 이동**하므로 "완료 화면 · 팝업/Drawer/칩 잔존 0"(AC-4-133 원문)으로 단정 교체. 약화 아님 — 기대 화면이 바뀌었다 |

## H2-2. AC

| AC | 상태 | 증거 |
|---|---|---|
| **134** 변형 연결 | 구현 | unit: 거부 → `permission-denied` 이름·`aria-haspopup`·라벨, 동의 없음 → `disabled` + 사유 + 탭 요청 0. 처리 중 `disabled` 는 단계 함수 범위(아래 H2-4 ①) |
| **63** 마이크 거부 | **부분** | 안내 시트 · 변형 · 요청 0 ✓. `Talk without recording` → `conversation_only` 전환 **미구현**(H2-D1) — 대화 전용 화면 자체는 `conversation_only` 세션으로 검증(unit 2) |
| **64** 자동 종료 | 구현 | unit: `completed(auto_timeout)` 1건 · 1800s · Toast · 완료 화면 / e2e: 실제 브라우저 시계 30분 |
| **65** 크래시 복구 | **화면 미구현** | 복구 전이·업로드는 4a(`recoverUnfinishedRecordings`). 안내를 띄울 화면이 정해지지 않았다 — H2-D4 |
| **68** 인터럽션 3종 | 현행 화면으로 충족 주장 | unit 3종: paused + `Tap the button to keep recording` · 파일 유지 · 재개 → 전이 `recording,paused,recording`. 별도 안내 UI 없음 — H2-D5 |
| **69** abandoned 후 새 세션 | 확인 | unit: 10분 방치 → 홈 → 다시 Start Session → 새 id · 생성 2건 |
| **70** 백그라운드 경고 | 구현 | unit: 공지 1개 · 녹음 계속 · Dismiss / e2e: 393×852 좌표 불변(책 칩 281 · 상태 344 · Record 621) · 슬롯 x24 w345 · 393×700 → Toast |
| 140 ⑤ | **현행 유지** | H2-D7 |

## H2-3. 결정 필요 (구현하지 않은 것)

| ID | 지점 | 선택지 | 권고 |
|---|---|---|---|
| **H2-D1** | `Talk without recording` → `mode=conversation_only` 전환 수단이 없다 (`mode` 는 생성 시 고정, 전이 body 에 `mode` 없음) | ⓐ 현 세션 `ready → abandoned` + `POST /sessions` `mode=conversation_only` 새 세션(계약 변경 0, 서버에 방치 세션 1건 남음, `SessionSummary` 에 `bookId`/`childBookId`/카드 옵션 id 가 없어 책 연결을 그대로 옮길 수 없음) ⓑ ready 한정 모드 전환 계약 신설(plan-agent + `API_CONTRACTS.md`) ⓒ Start Session 전 권한 확인 후 처음부터 대화 전용 생성(홈 흐름 변경) | **ⓑ** — 세션 1개 · 데이터 일관. AC-4-63 "요청 body 확인" 도 충족 |
| **H2-D2** | 초안 문구 9건 (H2-1 문구 행) | 승인 / 수정 | 승인 후 copy 만 교체 |
| **H2-D3** | 30분 **근접** 경고 임계값 (상위 Spec §7.3 "제안값을 넣지 않았다") | 없음 / 5분 전 1회 / 1분 전 1회 | **없음** — AC-4-64 는 종료 안내만 요구, PRD·Figma 근거 0 |
| **H2-D4** | 크래시 복구 안내 위치 (AC-4-65). 복구는 앱 시작 시 돌고 사용자는 세션·완료 화면에 있지 않다 | ⓐ 앱 시작 후 Toast 1회 ⓑ 홈 InlineAlert ⓒ 그 세션 완료 화면을 열 때만 | **ⓐ** (레이아웃 이동 0) — 문구 필요 |
| **H2-D5** | 인터럽션 안내 (AC-4-68) — Spec §7.1 에 행이 없다 | ⓐ paused 화면(보조 줄)으로 충족 ⓑ 공지 슬롯 `InlineAlert` 추가 | **ⓐ** |
| **H2-D6** | 업로드 / 48h / 14일 화면 (Plan 범위 칸에 있으나 AC 칸 63·64·65·68·69·70·134 에 없음, 4b 목록의 AC-4-30·32·67 화면 부분) | 상위 Spec §7.2 = 신규 `UploadStatusBadge` + 큐 상태 노출 필요 | **별도 단위(`S4-H3`)로 plan-agent 분할** |
| **H2-D7** | AC-4-140 ⑤ `/complete` 직접 진입 + Detail `recording`·`paused` (R4B-15) — 문서에 규칙 없음 | ⓐ 현행(완료 화면) ⓑ 홈 `replace`(`D4-91` 확장) ⓒ `/session/:id` `replace`(지금은 그 화면이 비-ready 를 홈으로 보내 결과는 ⓑ, 재진입 AC-4-35 구현 후 복귀) | **ⓑ** — 오프라인 제출 뒤 새로고침(R4B-15)에서 outbox 가 `completed` 를 보낼 세션을 paused 로 다시 여는 혼선이 없다 |
| **H2-D8** | 대화 전용 `Submit` Toast 가 `Recording submitted`(녹음 없음) · 대화 전용에서 Record 탭 → 같은 마이크 시트 | 별도 문구 / Toast 없음 · 시트 유지 / 탭 무반응 | 별도 문구 · 시트 유지 (AC-4-134 "탭 → 안내") |

## H2-4. 임의 판단 (검토 요청)

① **처리 중 `disabled`** = 컨트롤러 단계 `requesting_permission`·`starting`·`stopping` 만. `pendingTransitions > 0`(서버 응답 대기)은 넣지 않았다 — 컨트롤러가 낙관적으로 전이하므로 Pause·재개마다 변형이 깜빡이고 오프라인 전송 실패까지 막힌다. Submit/Discard 중(`stopping`)에는 잠깐 `disabled` 가 보인다.
② **동의 없음 `disabled`** 는 컨트롤러가 확인한 뒤(`consent_blocked`)부터다. `me.consentStatus` 선판정을 화면에 복제하지 않았다 — 동의 누락 계정은 Guard 가 세션 화면 전에 막는다(`me:consent-missing`).
③ 백그라운드 경고 시점 = 녹음 중 탭이 숨겨졌다 돌아온 **사건 1회**(Mock `web-background-warning` 과 같은 계약). 녹음 시작 때 항상 띄우는 안이 아니다. recording·paused 동안 Dismiss 까지 유지.
④ 슬롯 → Toast 전환 판정 = 렌더 직후 stage `scrollHeight > clientHeight` 1회. 표시 중 창 크기 변경은 다시 재지 않는다.
⑤ 자동 종료 뒤 완료 화면은 `Submit` 과 같은 스티커 등장(`SUBMIT_ENTRY`)을 쓴다.

## H2-5. Mock 시나리오

`?scenario=recorder:mic-permission-denied` · `sessions:consent-missing` · `recorder:web-background-warning` · `recorder.<visibilitychange|devicechange|track-ended>:recording-interrupted` · 오프라인 = 브라우저 offline(Playwright `context.setOffline`) / unit `harness.appState().setConnectivity` · 자동 종료 = 주입 시계 30분. 신규 key 0.

## H2-6. baseline (`R-BASELINE-1`)

신규 2장 — `s4-session-background-notice.png`(393×852, 시계 고정 `00:05`, 공지 표시 후 300ms 진행) · `s4-session-mic-sheet.png`(시트 요소, 등장 후 `settle`). 둘 다 육안 확인: 과도기 프레임·dev 패널 없음. **기존 baseline 재생성 0장** — 전체 실행에서 기존 baseline 전부 비교 통과(공지·시트는 사건이 있을 때만 그려지고 기본 화면 DOM·기하는 그대로다). 분해할 diff 없음.

## H2-7. 검증

`typecheck` · `lint` · `lint:boundaries`(776 modules, 위반 0) · `format:check` · `build` · `assert:no-mocks` ✓ · `test` **2354 → 2367 / 162 → 163 files** ✓ · `test:e2e` 단독 **461 → 467 passed (10.5m)**, 실패 0 · `ls apps/api supabase apps/mobile` → 전부 없음. 실행 전후 Playwright 프로세스 · 포트 4319 리슨 0, 강제 종료 없음.
수동 미확인: iOS Safari 실기기(마이크 거부 시트 · 탭 전환 경고 · AC-4-68 ③ 전화 수신) — `NOT VERIFIED` 예상, 절차 = 실기기에서 `?scenario` 없이 마이크 권한 거부 후 Start recording / 녹음 중 앱 전환 후 복귀.

## H2-8. `BACKEND_INTEGRATION_PENDING` 예상

서버 측 `mode` 전환(H2-D1 ⓑ 시) · 자동 종료 `completed(auto_timeout)` 서버 확정(기존 `P4-BIP`) · 동의 서버 강제(`CONSENT_REQUIRED`, 기존). 신규 0 (H2-D1 결정 전).

---

# S4-H2F — `S4-H2` 후속 `D4-113` · `D4-115` · `D4-117` · `D4-118` (2026-11-03, development-agent)

Status: **HANDOFF** · 커밋 안 함 · Plan·Spec·approvals·`API_CONTRACTS.md` 수정 안 함 · `apps/api` · `supabase` · `apps/mobile` 없음.
범위 밖(이번에 안 함): `D4-112`(Start Session 전 마이크 확인 → 대화 전용 생성) · `Talk without recording` 렌더 — plan-agent 계획 중. 업로드/48h/14일 화면(`S4-H3`, `D4-114`).
Figma 노드 없음 — 새 UI 0. Toast 는 기존 `ToastProvider`(상단) · 기존 tone 그대로.

## H2F-1. 구현

| 결정 | 위치 | 내용 |
|---|---|---|
| **`D4-113`** | `entities/session/useSessionCompletion.ts` | `NOT_COMPLETED` = `ready` · `abandoned` · **`recording` · `paused`**. `/session/:id/complete` 직접 진입(전이 응답 기억 없음) + Detail 이 넷 중 하나면 `leave` → `SessionCompleteScreen` 이 홈 `replace`(기존 `D4-91` 분기 그대로). 전이 응답이 기억된 경로(오프라인 제출 포함)는 판정하지 않는다 — 기존 규칙 유지 |
| **`D4-117`** 크래시 복구 Toast | `app/providers/sessionRecorderEnvironment.ts` · `entities/session/sessionRecorder.tsx` · `features/storytime-session/ui/RecoveredRecordingsToast.tsx` · `app/providers/AppProviders.tsx` | 런타임 `start()` 보고의 `recovered.length` 를 조립 지점이 보관 → `SessionRecorderEnvironment.onRecoveredRecordings(listener)` 로 **앱 실행당 1회** 전달(구독 전에 끝났으면 구독 즉시, 0건이면 전달 0). entity hook `useRecoveredRecordingsNotice` → feature `RecoveredRecordingsToast`(렌더 0, `toast.show({ tone: 'neutral' })`) → `AppProviders` 의 `ToastProvider` 안에 1번 마운트. 레이어: app → features → entities, feature 간 import 0 |
| **`D4-118`** 대화 전용 Submit | `features/storytime-session/ui/StorytimeSessionScreen.tsx` | `conversation`(대화 전용 ready)이면 `copy.conversationSubmitted`, 아니면 기존 `copy.submitted`. tone `success` 그대로 |
| **`D4-118`** Record 탭 | (코드 변경 0) | 대화 전용 `permission-denied` 탭 → 기존 마이크 시트 — 현행 확인 + 테스트 보강 |
| **`D4-115`** | `features/storytime-session/copy.ts` | 해당 키의 `⚠ 초안` → `승인 D4-115` 로 주석만 교체. 문구 변경 0 |
| `D4-116` · `D4-117` 후반 | — | 코드 변경 없음 (근접 경고 없음 · 인터럽션 = 현행 paused 화면) |

## H2F-2. 초안 문구 (승인 대상, `copy.ts` `⚠ 초안`)

| 키 | 문구 | 근거 |
|---|---|---|
| `recovered` | `We saved what was recorded before HARU closed.` | `D4-117` — 건수와 무관한 한 문장(복구가 2건 이상이어도 Toast 1회) |
| `conversationSubmitted` | `Session submitted` | `D4-118` — `Recording submitted` 와 같은 형식, 녹음 언급 없음 |

## H2F-3. AC

| AC | 상태 | 증거 |
|---|---|---|
| **140 ⑤** | 구현 | unit `session-recording.test.tsx` `it.each(recording, paused)`: Detail 상태 확인 → `/complete` 직접 진입 → 홈 · 완료 제목 0 · 전이 추가 0. 변경 되돌리면 2건 실패(확인함). 기존 `ready`(⑤) · 오프라인 제출(④) 테스트 통과 유지 |
| **65** 크래시 복구 안내 | 구현 (unit) | unit `session-exceptions.test.tsx` 3건: 복구 1건 → Toast 1회(`haru-toast--neutral`) + 전이 `completed(recovered_after_crash)` · 다시 마운트 → 0 / 화면보다 복구가 먼저 끝나도 1회 / 복구 0건 → Toast 0 · 전이 0. 마운트를 빼면 2건 실패(확인함). **브라우저 e2e 없음** — H2F-5 ① |
| **63 / 134** 대화 전용 Record 탭 | 확인 | 기존 테스트 보강: `aria-haspopup=dialog` · 같은 시트(제목·안내·`Not now`) · 전이 0 · 로컬 파일 0 |
| 대화 전용 Submit Toast (`D4-118`) | 구현 | unit: `Session submitted` 표시 · `Recording submitted` 0. 분기 되돌리면 1건 실패(확인함). 녹음 세션의 `Recording submitted` 는 기존 AC-4-114 테스트가 유지 |

## H2F-4. 임의 판단 (검토 요청)

① **1회의 단위 = 앱 실행(조립 환경 인스턴스)**. 같은 실행에서 화면 트리를 다시 붙여도 다시 뜨지 않는다. 새로고침 = 새 실행이지만 그때는 이미 복구가 끝나 0건이라 뜨지 않는다.
② **표시 화면 제한 없음** — 앱 시작 직후 어느 route 든(로그인 화면 포함) 뜬다. 로그아웃은 로컬 녹음을 지우므로(AC-4-72) 로그아웃 상태에서 복구 건이 남는 경우는 정상 경로에 없다.
③ Toast 는 큐가 없어 같은 순간 다른 Toast 가 뜨면 교체된다(기존 `ToastProvider` 규칙).
④ 주입 테스트 트리(`clients` 주입, `warmUp` 없음)에서는 첫 세션 화면이 런타임을 열 때 복구가 돈다 — 그때 복구 건이 있으면 세션 화면에서 뜬다. 실제 앱은 `resolveAdapters()` 가 시작 시 `warmUp()` 한다.

## H2F-5. 결정 필요 · 발견

① **`?scenario=recorder:crash-recovered` 가 브라우저에서 저장소를 seed 하지 않는다** (기존 공백). `resolveLocalStoreSeed` 는 정의돼 있으나 `createMockRecordingPlatform` 에 연결되지 않았다(`mocks/fixtures/local-recordings.ts` 주석 "브라우저 조립(scenario → seed)은 `S4-F`"). seed 하려면 Mock 서버에 `recording` 세션도 함께 있어야 한다. 그래서 이번 Toast 는 unit(저장소 선 seed)으로만 검증했고 e2e·데모로는 재현되지 않는다. 연결하려면 Mock 플랫폼에 "시작 전 seed" 단계 + Mock 서버 세션 fixture 가 필요하다 — 범위 확인 요청.
② **`D4-115` "9건" vs 목록 10키** — `record.consentReason` · `micSheet.title` · `micSheet.description` · `actions.conversationReason` · `notices.background.title` · `.description` · `.toast` · `connectivity.offline` · `.online` · `autoTimeout` = 10. 목록에 적힌 10키 모두 `승인 D4-115` 로 표기했다. 숫자 정정이 필요하면 approvals 쪽 수정 대상.

## H2F-6. Mock 시나리오

신규 key 0. 크래시 복구 = unit 에서 Mock 저장소 선 seed(`seedCrashedRecording`) + Mock 서버 `recording` 세션. 대화 전용 = `POST /sessions mode=conversation_only`(기존 테스트 경로).

## H2F-7. baseline (`R-BASELINE-1`)

신규·재생성 0장. 기본 화면 DOM·기하 변경 없음(복구 Toast 는 복구 건이 있을 때만, 대화 전용 문구는 Toast 텍스트만).

## H2F-8. 검증

`typecheck` · `lint` · `lint:boundaries`(777 modules, 위반 0) · `format:check` · `build` · `assert:no-mocks` ✓ · `test` **2367 → 2372 / 163 files** ✓ · `test:e2e` 단독 **467 → 467 passed (10.2m)**, 실패 0 (신규 e2e 0 — H2F-5 ①) · `ls apps/api supabase apps/mobile` → 전부 없음.

## H2F-9. `BACKEND_INTEGRATION_PENDING` 예상

`completed(recovered_after_crash)` 서버 확정·업로드(기존 4a 항목). 신규 0.

---

# S4-H2R — Start Session 전 마이크 판정 → 대화 전용 세션 + `D4-121` (2026-11-03, development-agent)

Status: **HANDOFF** · 커밋 안 함 · Plan·Spec·approvals·`API_CONTRACTS.md` 수정 안 함 · `apps/api` · `supabase` · `apps/mobile` 없음.
근거: Plan rev 1.4 §13.3 · AC-4-63(재정의) · 145~148 · 134 · Spec **§18.2 · §18.10 ⑤ · §18.11** · `D4-112` · `D4-119`(CP-8~11) · `D4-120`(Q15·Q16) · `D4-121` · `D4-122`.
범위 밖: `S4-H3`(업로드·48h·7일·14일). Figma 노드 없음(Spec §18.1) — 새 시각 요소 0 (기존 `Button loading` · `MicPermissionSheet` · Toast 재사용).

## H2R-1. 구현

| 항목 | 위치 | 내용 |
|---|---|---|
| 권한 판정 포트 | `app/providers/sessionRecorderEnvironment.ts` | `resolveSessionMode()` = 판정 전용 녹음기 1개 → `PermissionService.ensure()`(미정이면 프롬프트) → `granted` → `recorded`, `denied`·`unavailable` → `conversation_only` → **`finally` 에서 `dispose()`** (Web 어댑터가 `primed` 스트림을 닫는다 — AC-4-146). 런타임은 열지 않는다. 판정 자체가 throw 하면 `recorded`(H2R-4 ①) |
| entity hook | `entities/session/sessionRecorder.tsx` | `useResolveSessionMode()` → `{ resolve, isResolving }` — 판정 중 재호출은 **같은 promise**(프롬프트 1건). `useConversationEntryNotice(sessionId \| null, cb)` — 조립 환경의 `takeConversationNotice(id)` 가 처음일 때만 cb (앱 실행당 세션별, `D4-120` Q15) |
| Home 경로 | `features/activity-card-deck/ui/ActivityCardDeck.tsx` | 확인 탭 → 판정 → `selection` → `sessions(mode)`. 판정 중 확인 버튼 = 기존 `submitting`(`loading`). 시도 번호(`attempt`) — 시트 닫기·재탭이 올리면 늦게 온 판정은 버린다(AC-4-145 ⑦). 판정 중 닫기는 막지 않는다(§18.2 ①) |
| 서재 경로 | `features/library/StartSessionAction.tsx` · `BookDetailSheet.tsx` | 탭 → 판정 → `sessions(mode)`. `loading` = 판정 중 ∨ 생성 중. 새 prop `open`(BookDetailSheet 가 전달) + 언마운트 → 결과 버림. 탭 번호로 재탭 시 생성 1건 |
| 자동 시트 | `features/storytime-session/ui/StorytimeSessionScreen.tsx` | `conversation_only` ∧ `ready` 로 열린 세션에 `useConversationEntryNotice` → 시트 1회 |
| 포커스 복귀 | 같은 파일 | 시트가 한 번 열렸다 닫히면 effect 가 `RecordControl`(`id`)로 포커스 — `Sheet` 포커스 트랩 복귀(정리 단계)보다 뒤에 돈다. `packages/ui` 변경 0 (§18.10 ⑤) |
| 재개 거부 시트 | 같은 파일 | paused `resume()` 결과가 `permission_denied`·`mic_unavailable` 이면 시트 자동(§18.2 ④ · AC-4-148 ③) — 전에는 ready `start()` 만 열었다 |
| 시트 문단 | `ui/MicPermissionSheet.tsx` · `copy.ts` | prop `conversation` → `micSheet.conversationDescription` / `description`. `talkWithoutRecording` 키·주석 **삭제**(CP-11) |
| **`D4-121`** | `StorytimeSessionScreen.tsx` `SessionTopRow` | 상단 줄(칩·닫기)을 `useToastTopBarInset` 으로 등록 — 줄이 조회 후에야 마운트되므로 줄 컴포넌트 안에서 등록(화면 첫 렌더는 Spinner). CSS 변경 0 |
| Mock | `mocks/recorder/recorderScenarios.ts` · `platform/MockRecorderAdapter.ts` · `platform/mockRecordingPlatform.ts` | key 3 신규(H2R-5). 계획에 `initialPermission` · `permission`(`unavailable` 추가) · `revokedOnStart`. **권한 상태·호출 기록을 플랫폼 하나에 하나로 공유** — 판정 녹음기의 허용을 세션 녹음기가 본다(재프롬프트 0) |
| harness | `src/test/harness.tsx` | `recorderCalls()` · `recorders()` 접근자 |
| 테스트 | `__tests__/session-permission.test.tsx`(신규 22) · `src/app/providers/__tests__/sessionRecorderEnvironment.test.ts`(+9) · `src/mocks/__tests__/MockRecorderAdapter.test.ts`(+4) · `recorder-scenarios.test.ts`(+4, 기존 3건은 key·계획 필드 추가 반영) · `e2e/session-exceptions.spec.ts`(+6) | 기존 수정: `session-exceptions.test.tsx` 녹음 세션 거부 2건 → `mic-permission-revoked`(Start 거부는 이제 대화 전용이라 녹음 세션 거부가 그 경로로만 생긴다) + 포커스·버튼 1개 단정 추가 · 대화 전용 1건 → 자동 시트 닫은 뒤 Record 탭 · 문단 = 대화 전용 변형. e2e 마이크 시트 1건 → `mic-permission-revoked`. 약화 0 |
| `D4-122` | `copy.ts` | `recovered` · `conversationSubmitted` 주석 `⚠ 초안` → `승인 D4-122` (문구 변경 0) |

## H2R-2. 초안 문구 (승인 대상, `copy.ts` `⚠ 초안`)

| 키 | 문구 | 근거 |
|---|---|---|
| `micSheet.conversationDescription` | `This session continues without recording. To record, turn on the microphone and start a new session.` | §18.2 ③ ①~⑤ — 돌아오면 녹음된다 류 0 · 장치 없음에도 사실("turn on") · 이 세션은 계속 + 다음엔 새 세션 · 진단어 0. **실측(Chromium, 문단 폭 272)**: Spec 예시 방향 문장(128자)은 320 에서 **4줄** → 3줄 이내 권장(⑤)을 맞추려 줄였다. 이 문구 = 320 **3줄** · 393 3줄(`D4-115` 녹음 세션 문단과 같은 줄 수) |

## H2R-3. AC

| AC | 상태 | 증거 |
|---|---|---|
| **63** (재정의) | 구현 | unit `session-permission.test.tsx` 매트릭스: 경로 2 × 거부·차단·장치 없음 → body `mode=conversation_only` · 책 id 경로별 동일 · Record `permission-denied` · `Submit` 활성 / Home 대화 전용 `Submit` → `completed` 1건 · 완료 화면 · 녹음기 `start` 0 · `recordings` 요청 0. e2e 3 key(Home): body · 순서 · 시트. 설정 딥링크 = 안내 문단(Web) |
| **145** ①~⑤ | 구현 | unit 경로 2 × 5상태(`granted`=`mic-permission-revoked` 처음 값 · `prompt`→허용 · `prompt`→거부 · `denied` · `unavailable`) — `mode` · `requestPermission` 수(0/1/1/0/0). ③ 권한 API 미지원(`null`)은 **Web 어댑터 단위**(`sessionRecorderEnvironment.test.ts`, 허용·거부 2건) — Mock 은 `null` 을 재현하는 key 가 없다(어댑터가 `null → prompt` 로 접으므로 경로는 ② 와 같다) |
| **145** ⑥ | 구현 | unit: Home 확인 버튼 `aria-busy` · 재탭 2회 → 판정 1 · selection 1 · 생성 1 / 서재 `aria-busy` · 재탭 → 판정 1 · 생성 1 |
| **145** ⑦ | 구현 | unit: 순서 `selection → sessions`(경로 Home 5상태 · e2e 3 key) / 판정 중 Escape → selection 0 · 생성 0 (Home) · 생성 0 (서재) |
| **145** ⑧ | 구현 | `lint:boundaries` 위반 0 — 두 feature 는 `entities/session` hook 만 쓴다 |
| **146** | **unit 구현 · 실브라우저 NOT VERIFIED 예상** | Web 어댑터 + 가짜 미디어 환경: 판정이 연 스트림 수 = 판정 안에서 닫힌 수(허용 1/1, 거부·차단·장치 없음 0/0). e2e 는 Mock 녹음기라 `MediaStreamTrack.readyState` 를 볼 수 없다 → 수동: Chrome 첫 사용 → Start Session 허용 → Home/ready 에서 주소창 마이크 표시등 꺼짐 확인 → Record 탭 녹음 정상 |
| **147** ①~④ | 구현 | unit: 차단·장치 없음 → 시트 자동 · 대화 전용 문단 · `come back to this screen` 0 · 버튼 = `Not now` 1개 · 닫힘 → `activeElement` = Record · 전이 0 / 같은 세션 재진입 → 자동 0, Record 탭 → 시트 / 녹음 세션 자동 0. e2e 3 key: 시트 · 문단 · 포커스 · 전이 0 |
| **148** ① | 구현 | unit + e2e(`mic-permission-revoked`): 시트(녹음 세션 문단) · 생성 1건 그대로 · 전이 0 · 버튼 `Not now` 1개 |
| **148** ② | 구현 | unit: 거부 → `Not now` → 닫기 → `abandoned` → 홈 → Start → 새 id · 생성 body `mode` = `[recorded, conversation_only]` · 프롬프트 0 |
| **148** ③ | 구현 | unit: 녹음 → 캡처 끊김(paused) → `failNextStart('permission_denied')` → Resume 탭 → 시트 · 로컬 파일 유지 · `Submit` → 전이 `[recording, paused, completed]` · 생성 1건 |
| **134** | 회귀 + 경로 추가 | Start 판정 거부 → `conversation_only` → `permission-denied`(매트릭스) |
| **`D4-121`** | 구현 | unit: 세션 화면 Toast 뷰포트 `--below-top-bar`. e2e: ready offline Toast y **64**(상단 줄 0~48) · 닫기 중심 `elementFromPoint` = `Close session` / recording 칩·닫기 가림 0. **수정 되돌리면 e2e 2건 실패**(Toast y 16 · 가림 true) 확인 |

변경 되돌림 확인(unit): 자동 시트 제거 → 3건 실패 · 포커스 effect 제거 → 2건 · inset 제거 → 1건 · Home `mode: 'recorded'` 고정 + 시도 번호 제거 → 9건 · 서재 가드 제거 → 1건.

## H2R-4. 임의 판단 (검토 요청)

① **판정 예외 → `recorded`** — 어댑터가 throw 하는 경우(정상 경로는 throw 하지 않는다). 세션 안 Record 탭이 다시 묻고, 거부면 시트 → 닫고 재시작 경로(CP-11).
② **재개 거부도 시트 자동** — §18.2 ④ "paused 재개 시 거부 → 시트" 를 따랐다(이전 구현은 ready 시작 거부에만 자동).
③ **포커스 복귀는 시트가 닫힐 때마다 Record Control** — 수동으로 열 때도 연 요소가 Record Control 이라 결과는 같다.
④ **"1회" 기록 위치 = 조립 환경(`createSessionRecorderEnvironment`) 메모리** — `D4-117` 복구 안내와 같은 단위(앱 실행). 새로고침 후 다시 뜬다(Q15 권고대로).
⑤ **Mock 권한 상태 공유** — 이전에는 녹음기마다 `prompt` 에서 시작했다. 같은 플랫폼의 다음 세션은 앞 세션에서 정해진 권한을 본다(브라우저와 같다). 기존 테스트 영향 0.
⑥ Toast y 64 는 메달리온 링(y76~266)과 위쪽 12px 겹친다 — 완료 화면 `D4-103` 과 같은 배치(VG-H2-02 권고 · `D4-121`).
⑦ 시트 자동 표시 조건 중 "Prompts 팝업·Drawer·Dialog 열림 중 0"(§18.2 ②)은 대상이 ready 진입 시점뿐이라 별도 조건 코드를 두지 않았다(ready 에는 팝업·Drawer·Dialog 가 없다).

## H2R-5. Mock 시나리오

| key | 판정 | 세션 화면 |
|---|---|---|
| `recorder:success`(기본) | `prompt` → 프롬프트 1 → 허용 → `recorded` | 녹음 정상 |
| `recorder:mic-permission-denied` | `prompt` → 프롬프트 1 → 거부 → `conversation_only` (**의미 변경** — 전에는 세션 안 Record 탭 거부) | 시트 자동 1회 |
| ⭐ `recorder:mic-permission-blocked` | `denied` → 프롬프트 0 → `conversation_only` | 시트 자동 1회 |
| ⭐ `recorder:mic-unavailable` | `unavailable` → 프롬프트 0 → `conversation_only` | 시트 자동 1회 (같은 문단 — Q16) |
| ⭐ `recorder:mic-permission-revoked` | `granted` → 프롬프트 0 → `recorded` | Record 탭 → `permission_denied` → 시트(녹음 세션 문단) · 이후 권한 `denied` |

⚠ **`API_CONTRACTS.md` 반영 필요** (이번에 수정하지 않음): Mock scenario catalogue `recorder` 그룹에 key 3 추가 · `mic-permission-denied` 설명 갱신(Start Session 판정 경로). contracts(`packages/contracts`) 변경 0.

## H2R-6. baseline (`R-BASELINE-1`)

신규 1장 — `s4-session-mic-sheet-conversation.png`(393, 시트 요소, 등장 후 `settle`, dev 패널 숨김). 육안 확인: 정착 프레임 · 대화 전용 문단 3줄 · 버튼 1개. ⚠ 첫 실행이 **문구 교체 전** 이미지를 기록해 삭제 후 재생성했다(스테일 1회 — 현재 파일은 최종 문구). 기존 `s4-session-mic-sheet.png` 는 시나리오만 `mic-permission-revoked` 로 바꿨고 같은 화면이라 비교 통과(재생성 0). 기존 baseline 재생성 0장.

## H2R-7. 검증

`typecheck` · `lint` · `lint:boundaries`(778 modules, 위반 0) · `format:check` · `build` · `assert:no-mocks` ✓ · `test` **2372 → 2411 / 163 → 164 files** ✓ · `test:e2e` 단독 **467 → 473 passed (10.4m)**, 실패 0 · `ls apps/api supabase apps/mobile` → 전부 없음.
수동 미확인(`NOT VERIFIED` 예상) — Plan §15 manual device: iOS Safari · 데스크톱 Safari · Chrome ① 첫 사용 Start Session 프롬프트 → 허용 → Record 탭 시 **재프롬프트 여부**(R4B-16 — 판정 스트림을 닫으므로 Safari 가 다시 물을 수 있다) ② 거부 → 대화 전용 진입 · 시트 ③ 설정에서 허용 후 새 세션 = `recorded` ④ AC-4-146 표시등.

## H2R-8. `BACKEND_INTEGRATION_PENDING` 예상

신규 0. 기존: 대화 전용 미제출 ready 세션 서버 정리(sweeper — `D4-45`, R4B-21 로 비중 상향) · 서버 측 `mode` 수용(생성 body 그대로 — 계약 변경 0).

---

# S4-H3 — 업로드 · 48h · 7일 · 14일 안내 + `D4-123` · `D4-125` · `D4-126` (2026-11-04, development-agent)

Status: **HANDOFF** · 커밋 안 함 · Plan·Spec·approvals 수정 안 함 · `apps/api` · `supabase` · `apps/mobile` 없음 · **`D4-124`(세션 화면 Toast 위치) 손대지 않음**.
근거: Plan rev 1.4 §13.4 · §14 AC-4-149~153 (+ AC-4-30·32·67 화면 부분) · §12 · Spec **§18.3~§18.6 · §18.8 · §18.10 · §18.11** · `D4-114` · `D4-117` · `D4-119`~`D4-127`. Spec 이 Plan 과 다른 곳은 Spec(`D4-119`): 7일 배너 `Try again` 없음 · 허용 차이 번호 `AD-S4-25`~.
Figma 노드 없음(Spec §18.1) — 신규 Shared UI 0 · 신규 토큰 0 · 신규 CSS 0 (`Toast` · `InlineAlert banner` 재사용, `ToastProvider`·`InlineAlert`·`Sheet` 변경 0).

## H3-1. 구현

| 항목 | 위치 | 내용 |
|---|---|---|
| 안내 상태 (도메인) | `features/recording/model/recording-notices.ts` (신규) | `RecordingNoticeCenter` — 런타임과 함께 생성되어 **시작 전부터** 큐·보관 신호를 듣는다. Toast 안내 = `retention_expired` · `upload_stalled` · `recovered` (꺼내는 순서 고정, 꺼내면 소비). 7일 배너 = **레코드에서 파생**(안내 시각 있음 ∧ 로컬에 있음(=미확정) ∧ 닫기 기록 없음 → 가장 이른 `deleteAtMs`). 같은 녹음 우선순위: 14일이 나면 그 녹음의 48h 버림 · 7일 안내가 난 녹음의 48h 내지 않음. 보류 중 업로드 확정 → 48h 버림. 여러 녹음 = 안내 1건. **시작 정리 전에는 꺼내지 않는다**(순서를 시작 보고에서 정한다). React 0 |
| 닫기 기록 | `features/recording/model/local-records.ts` | `retentionDismissedAtMs?` (선택 — 이전 레코드 호환, 가드 갱신). 닫기 = 그 순간 7일 구간의 녹음 전부(§18.3) · 새 녹음이 7일에 들어오면 다시 |
| 48h 시작 점검 | `features/recording/model/upload-queue.ts` | `markStalled()` — 48h 경계만 점검, **전송 0**. 런타임 시작 순서 = 복구 → 보관 정리 → **48h 점검** → outbox·큐·보관 시작 → 센터에 시작 보고(복구 수) |
| 런타임 | `features/recording/model/recording-runtime.ts` | `notices` 노출 · `clearAll` 에 센터 `reset`(AC-4-153 ④) · 확정된 폐기 후 배너 재계산 |
| 조립 | `app/providers/sessionRecorderEnvironment.ts` | `notices`(peek · take · retention · dismissRetention · **capturing** · retryUploads · subscribe). `capturing` = recording·paused 컨트롤러 수(`D4-120` Q13). `retryUploads` = 오프라인이면 `'offline'`(요청 0) · 아니면 큐 `drain({ force })`. `onRecoveredRecordings` 는 센터로 흡수하며 **삭제**. 신규 옵션 `seedDevice`(런타임 시작 전 1회, 실패해도 시작) |
| `warmUp` 위치 | `app/providers/apiClients.ts` → `ApiClientProvider.tsx` | `resolveAdapters()` 안에서 부르던 `warmUp()` 을 **결과를 채택한 쪽**으로 옮겼다 — H3-4 ⑥ |
| entity hook | `entities/session/sessionRecorder.tsx` | `useRecordingAppNotices()` · `useRetentionNotice()` (조립 없음 = 안내 0). 타입 `RecordingAppNotice` · `RetentionNotice` · `SessionRecorderNotices` · `UploadRetryResult` |
| 앱 Toast | `features/storytime-session/ui/RecordingNoticeToasts.tsx` (신규, `RecoveredRecordingsToast` 대체·삭제) | `AppProviders` 의 `ToastProvider` 안 1회 마운트. **한 번에 1개** — `useToastPresent()` 가 false 일 때만 다음을 꺼낸다(다른 화면 Toast 도 기다린다) · **녹음 중 보류** · 48h = `neutral` + `Try again` + `Dismiss` (탭 → Toast 닫힘 + 큐 1회 / 오프라인 → `connectivity.offline` Toast) · 14일 = `neutral`, action 0 · 복구 = 기존 문구 |
| Home 배너 | `features/storytime-session/ui/RetentionNoticeBanner.tsx` (신규) · `features/activity-card-deck/ui/ActivityCardOfflineBanner.tsx` (`fallback` prop) · `pages/home/HomeTopBar.tsx` | `InlineAlert tone="warning" placement="banner"` · 제목 한 문장 + `Dismiss`. Page 가 `<ActivityCardOfflineBanner fallback={<RetentionNoticeBanner />} />` 로 조립 — **같은 슬롯 1개 · 오프라인 캐시 배너 우선**(Q11), feature 간 import 0 |
| 날짜 | `shared/lib/date-format.ts` (신규) | `formatMonthDay(atMs, nowMs, timeZone?)` — `en-US` `Nov 17`, 기준 시각과 해가 다르면 `Jan 3, 2027`. 시계를 읽지 않는다(기준 = 센터가 계산한 `asOfMs`) |
| 문구 | `features/storytime-session/copy.ts` | `uploads.stalled` · `uploads.retentionNotice(date)` · `uploads.retentionExpired` (⚠ 초안 — H3-2). `micSheet.conversationDescription` 주석 → **승인 `D4-126`**(문구 변경 0). `Try again` = `states.retry` · 닫기 = `notices.dismiss` · 오프라인 = `connectivity.offline` 재사용 → 신규 키는 3개뿐 |
| **`D4-123`** 브라우저 seed | `mocks/recorder/deviceSeed.ts` (신규) · `mocks/fixtures/local-recordings.ts` · `mocks/fixtures/sessions.ts` · `mocks/recorder/{recorderScenarios,localStoreScenarios}.ts` · `mocks/index.ts` · `app/providers/apiClients.ts` | H3-5 표. `mock` 조립만 `seedDevice` 를 넘긴다. 번들에 Mock **서버** 시계 `clock` 노출 |
| **`D4-125`** `VG-H2R-01` | `features/activity-card-deck/ui/ActivityCardDeck.tsx` · `features/library/StartSessionAction.tsx` · `entities/activity-card/useSelectActivityOption.ts` | 탭 ~ 이동/실패까지 끊기지 않는 `launching` 상태. 실패·닫기·결과 버림·이동에서 끈다(선택 실패는 `select(…, onSelected, onFailed)` 새 선택 인자). 시각 값 변경 0 |
| **`D4-125`** `VG-H2R-02` | `features/storytime-session/ui/StorytimeSessionScreen.tsx` | 시트 닫힘 후 `focus({ preventScroll: true })` |
| contracts | — | **변경 0** (안내 상태는 클라이언트 전용) |

## H3-2. 초안 문구 (승인 대상, `copy.ts` `⚠ 초안`)

| 키 | 문구 | 근거 · 실측 |
|---|---|---|
| `uploads.stalled` | `Your recording hasn't uploaded yet. It's still saved on this device.` | 48h Toast. `failed`·`error` 0, 로컬 보존 사실(상위 §7.2). 건수 무관 한 문장 |
| `uploads.retentionNotice(date)` | `Go online before ${date} or your recording will be removed.` | 7일 배너 제목 1문장. 삭제 예정 사실(AC-4-150 ③) + 할 일(온라인으로 열기, §18.5 ②). *before* = 삭제 시각이 그날 중이어도 사실. **실측(Chromium)**: 393 **2줄 74** · 320 **3줄 94** · 600 **2줄 74** — H3-3 결정 ① |
| `uploads.retentionExpired` | `A recording that couldn't upload in 14 days was removed from this device.` | 14일 Toast. 이미 일어난 사건 · action 0 |

## H3-3. 결정 필요

| # | 지점 | 실측 · 선택지 | 권고 |
|---|---|---|---|
| ① | **7일 배너 줄 수** — Spec §18.5 목표 "393 1줄 · 320 2줄" 미달 | 후보 3개를 실제 배너 DOM 에 넣어 쟀다: 위 초안 · `Go online by ${date} or this recording will be removed.` · `Go online by ${date} to keep your recording.` → **셋 다 393 2줄(+74) · 320 3줄(+94)**. 320 텍스트 폭(약 156px)에서 날짜 포함 의미 있는 문장은 3줄이 된다. +94 = `G-01` 크기(`D4-32` 에서 줄이기로 한 크기)와 같다 · Spec §18.5 ⓒ 산술 범위(393 54~74 · 320 74~94) 안 | 초안 유지 + `AD-S4-25` 를 **393/600 +74 · 320 +94** 로 등록 판단. 줄이려면 문구가 삭제 예정 사실을 빼야 한다(AC-4-150 ③ 충돌) |
| ② | 초안 문구 3건 (H3-2) | 승인 / 수정 | 승인 후 copy 만 교체 |
| ③ | AC-4-150 ② 문안 "Home `InlineAlert warning` + `Try again`" | `D4-119` 로 `Try again` 없음 — 구현은 Spec 기준 | plan-agent AC 문안 정정 (Spec §18.10 ②) |
| ④ | 허용 차이 후보 | `AD-S4-25`(Home 7일 배너 + 버블·캐릭터 밀림 = 배너 높이) · `AD-S4-26`(앱 수준 48h · 14일 Toast) · `AD-S4-16` 범위 개정(H2R) | 사용자 승인 후 등록 — 등록하지 않았다 |

## H3-4. 임의 판단 (검토 요청)

① **48h · 14일 · 복구 Toast 는 메모리에 보관**(Spec §18.3 "보관 후 구독 시 1회") — 꺼내기 전에 앱이 닫히면(예: 녹음 중 보류 상태에서 탭 종료) 다시 나오지 않는다. 신호가 녹음당 1회라 "재시작 후 재표시 0"(AC-4-153 ①)과 같은 쪽이다. 7일 배너만 레코드에서 파생(재시작해도 남는다).
② **여러 녹음의 같은 안내 = Toast 1건**(`D4-117` "건수 무관 한 문장" 확장) · **보류 중 업로드가 확정되면 48h 버림**.
③ **오프라인 캐시 배너가 없을 때의 오프라인**(카드 캐시 없음 → 덱 슬롯 안내)에서는 7일 배너가 보인다 — Q11 은 "같은 슬롯 1개 · 오프라인 배너 우선" 이고 그 경우 슬롯의 오프라인 배너가 없다.
④ UI 렌더러 2개를 `features/storytime-session` 에 둔 것 — `features/recording` 은 React 를 쓰지 않는다(AC-4-47). 앱 Toast 가 크래시 복구와 **같은 순차 안**에 있어야 해서 `RecoveredRecordingsToast` 를 대체했다. 오프라인 안내는 같은 feature 의 `connectivity.offline` 을 그대로 쓴다(공용 이동·신규 키 0 — Spec §18.10 ⑥ 해소).
⑤ `capturing` 판정 = 컨트롤러 스냅샷 status `recording`·`paused`. 세션 화면을 떠나면(컨트롤러 dispose) 풀린다. 완료 화면으로 가면 `completed` 라 풀린다.
⑥ **`warmUp()` 을 채택 지점으로 이동** — e2e 에서 `crash-recovered` 복구 전이가 **2건** 기록됐다. dev StrictMode 가 `resolveAdapters()` 를 두 번 돌려 한 벌을 버리는데, 버려진 벌도 런타임을 시작했다(공유 요청 로그에 남는다). 이제 `ApiClientProvider` 가 채택한 벌만 `warmUp()`. Production(StrictMode 이중 실행 없음)의 동작은 같다.
⑦ 48h seed 는 업로드 큐 항목을 `kv` 에 **직접** 쓴다(큐에 적재 시각을 정하는 공개 경로가 없다) — `UploadQueueEntry` 타입으로 묶어 tsc 가 일치를 검사한다. 7일 seed 는 큐 항목·서버 세션 없이(배너가 곧바로 사라지지 않게), 14일 seed 는 서버 세션 없이(RU-16 요청 0).
⑧ `useSelectActivityOption().select` 에 선택 인자 `onFailed` 추가(entity, 기존 호출 영향 0).

## H3-5. Mock 시나리오 (`D4-123` — 브라우저에서 재현)

| `?scenario=` | 기기 seed | Mock 서버 | 화면 |
|---|---|---|---|
| `recorder:crash-recovered` | 끝나지 못한 part | 세션 `recording` (`66666666-…-0001`) | 앱 시작 복구 Toast · `completed(recovered_after_crash)` 1건 |
| `recordings:upload-stalled-48h` | 48h+1분 전 적재된 미확정 업로드 | 세션 `completed` (`…-0002`) | 48h Toast + `Try again` (업로드는 계속 실패) |
| ⭐ `recorder:local-retention-notice` (신규 key) | 7일+1분 전 미업로드 녹음 | 없음 | Home 7일 배너 |
| `recorder:local-retention-exceeded` | 14일+1분 전 미업로드 녹음 | 없음 | 14일 Toast · 서버 요청 0 |
| `recorder:local-retention-exceeded,recordings:upload-stalled-48h` | 둘 다 | | 14일 Toast → 사라진 뒤 48h Toast |
| `activity-cards:offline-cached-card,recorder:local-retention-notice` | 카드 캐시 + 7일 | | 오프라인 배너 1개만 |

안내 0 확인: `recordings:recording-upload-success` · `recordings:recording-incomplete`(자동 재시도) — unit. `API_CONTRACTS.md` **Rev 8.11** 로 §5.4 반영(H2R key 3 · `mic-permission-denied` 설명 · `local-retention-notice` · 브라우저 seed). Mock 데이터는 `mocks/` 에만.

## H3-6. AC

| AC | 상태 | 증거 |
|---|---|---|
| **149** ① | 구현 | unit `recording-notices.test.ts`: 적재 48h −1ms peek 0 / 48h `upload_stalled` 1 · 꺼낸 뒤 0 · 재시도 3회 후 0 · **재시작 후 0** / 시작 전에 48h 를 넘은 항목 → 시작 보고 안 |
| **149** ②③④⑤ | 구현 | unit `session-notices.test.tsx`: `neutral` · `Dismiss` · `Try again` → 큐 1회 + 닫힘 · 오프라인 → 요청 0 + `connectivity.offline` · 문구 `fail`/`error` 0. 실조립(seed): `Try again` → 업로드 요청 증가 · 로컬 파일 > 0. e2e 2건(온라인 증가 · 오프라인 0 + 안내) |
| **150** ① ③ ④ | 구현 | unit: 7일 −1분 null / 7일 `deleteAtMs` = 첫 part + 14일 · 같은 값 같은 객체 · 업로드 확정 → null · 여러 녹음 → 가장 이른 날짜 / `date-format.test.ts` 5건(연도 경계 · 시간대) |
| **150** ② | 구현 (Spec 기준) | 배너 `warning` · `banner` · `role="alert"` · 헤더 슬롯 · 버튼 = `Dismiss` 1개 · 닫기 → 0 · 레코드에 닫기 시각 · 다시 붙여도/다시 열어도 0 · 닫은 뒤 새 녹음 7일 → 다시. `Try again` 없음 = `D4-119` (H3-3 ③) |
| **150** ⑤ | 실측 | e2e: 높이 = 34 + 20×줄 · 밀림(캐릭터·버블 top 차) = 배너 높이 — **393 +74 · 320 +94 · 600 +74** · 닫기 → 밀림 0. 허용 차이 `AD-S4-25` 미등록(H3-3 ①④) |
| **151** ①②③④ | 구현 | unit: `retention_expired` 1 · 파일 0 · 요청 0 · 재시작 0. e2e: Toast · action 0 · 업로드 요청 0 |
| **152** ⓐ | 구현 | 업로드 배지 미생성(완료 화면 DOM 불변 — 기존 AC-4-61·104 테스트 통과 유지) · unit: `recording-upload-success` · `recording-incomplete` 자동 재시도 중 Toast 0 · 배너 0 (= AC-4-30 화면 부분, `N4B-32` ⓐ) |
| **153** ① | 구현 | 위 재시작 3종(48h · 7일 닫기 · 14일) |
| **153** ② | 구현 | unit: 같은 녹음 7일+48h → 배너만(48h Toast 0, 판정은 저장) · 48h 보류 중 14일 → 14일만 |
| **153** ③ | 구현 | unit: 시작 시 셋 → 14일 → 48h → 복구 / 시작 전 peek 0 · 가짜 타이머로 한 번에 1개 · 다른 Toast 대기. e2e: 14일 → 48h 순차 · 동시 1개 |
| **153** ④ | 구현 | unit: `clearAll` → Toast 0 · 배너 0 · 레코드 0 · 큐 0 |
| 30·32·67 화면 | 구현 | 30 = 152 ⓐ · 32·67 = 48h Toast 1회 |
| `D4-120` Q13 | 구현 | unit: 녹음 중 Toast 0(60초) → 해제 즉시 1 · 조립 `capturing` recording·paused true / dispose false |
| `D4-123` | 구현 | unit `device-seed.test.ts` 6 · 실조립 3(복구 · 14일 · 48h) · e2e 5 |
| `D4-125` ① | 구현 | **e2e(Chromium)**: 확인 탭 → 이동까지 `aria-busy` 켜짐 **1회**. 수정 되돌리면 **2회**(재현 확인). jsdom 은 이 끊김을 재현하지 못한다(React 가 마이크로태스크 뒤에 렌더) — unit 2건은 연속성·실패 시 해제 가드 |
| `D4-125` ② | 구현 | e2e 320×568: 시트 닫힘 후 Record y 불변(433). 되돌리면 **414**(VG 의 19px 재현). unit: `focus` 인자 `{ preventScroll: true }` — 되돌리면 실패 |
| `D4-126` | 반영 | 주석만 |

되돌림 확인(unit): 7일 우선 규칙 제거 → 1 실패 · 14일이 48h 버림 제거 → 1 · 시작 전 꺼냄 막기 제거 → 1 · 녹음 중 보류 제거 → 1 · 표시 중 대기 제거 → 1.

## H3-7. baseline (`R-BASELINE-1`)

신규·재생성 **0장**. 7일 배너 문구에 실행 날짜(기기 시계 + 7일)가 들어가 매일 바뀐다 — 기하는 수치로 단정했다. 기본 화면 DOM·기하 변경 없음(안내는 seed 가 있을 때만).

## H3-8. 검증

`typecheck` · `lint` · `format:check` · `lint:boundaries`(**786 modules**, 위반 0) · `build` · `assert:no-mocks` ✓ · `test` **2411 → 2460 / 164 → 168 files** ✓ · `ls apps/api supabase apps/mobile` → 전부 없음.

## H3-9. e2e

`test:e2e` 단독 **473 → 485 passed (10.7m)**, 실패 0 (신규 `e2e/session-notices.spec.ts` 12). 실행 전후 다른 Playwright 프로세스 0, 강제 종료 없음. baseline 재생성 0 (`git status e2e/__screenshots__` 변화 없음).

## H3-10. `BACKEND_INTEGRATION_PENDING` 예상

신규 0 (contract·endpoint 0). 기존: RU-16(14일 로컬 삭제로 녹음이 오지 않는 `completed` 세션 서버 정리) · 실제 Storage 업로드·서버 확정·48h 이후 서버 측 상태(`RECORDING_UPLOAD_SPEC`) · push 알림은 `N4B-34` ⓐ(앱 내 안내로 충족)라 신규 아님.

## H3-11. Visual Gap 대상 (design-agent, 최우선 규칙 5)

Home 7일 배너 393 · 320 · 600(밀림 · 줄 수) · 오프라인 배너 우선 · 48h Toast(action · 닫기) · 14일 Toast · `loading` 두 경로 이음매(Chromium). 재현: H3-5 표의 `?scenario=`.

---

# S4-H3F — `D4-128` 세션 Toast 3초 · `D4-129` 문구 승인 반영 (2026-11-04, development-agent)

근거: `docs/decisions/stage-4-approvals.md` `D4-128` · `D4-129`. Plan · Spec · approvals 수정 0.

## H3F-1. `D4-128` — 세션 화면 문구 전용 Toast 3000ms

| 항목 | 내용 |
|---|---|
| 방식 | 세션 feature 소유 훅 `useSessionToast` — `action` 도 `duration` 도 없으면 `duration: SESSION_TOAST_DURATION_MS`(3000, `D4-128` 주석)를 붙여 `useToast().show` 로 넘긴다. 버튼 있는 Toast 는 그대로 → `packages/ui` `TOAST_DURATION_MS.withAction` 6000 |
| `packages/ui` | 변경 0 (`TOAST_DURATION_MS` 기본 4000 / 6000 그대로) |
| 3000 적용 (세션 화면에 머무는 Toast) | `closeFailed`(ready 닫기 실패) · `connectivity.offline` / `online`(ready · recording · paused) · `notices.background.toast`(공지 슬롯이 들어가지 않을 때) |
| 4000 유지 | `submitted` · `conversationSubmitted` · `autoTimeout` — 띄운 직후 완료 화면으로 이동해 **완료 화면에서 보인다**(`D4-128` "완료 화면 4초"). `useStickerEntrance` 가 이 Toast 존재에 기대므로 바꾸지 않았다. Home · 서재 · 그 밖 route 의 Toast 전부 |
| 위치 · 문구 | 변경 0 (y64 · `D4-121` 그대로) |

### 앱 수준 Toast (`RecordingNoticeToasts`, `AppProviders` 에 1번 마운트) — 현재 동작

녹음 중(recording · paused)에는 보류(`D4-120` Q13)되지만 **ready 화면에서는 뜰 수 있다**. 이번 변경은 이 컴포넌트에 손대지 않았으므로:

| Toast | 세션 route(ready)에서 뜰 때 현재 시간 |
|---|---|
| 14일 삭제 통지 `uploads.retentionExpired` (문구 전용) | **4000** |
| 크래시 복구 `recovered` (문구 전용) | **4000** |
| 48h `uploads.stalled` (`Try again` + `Dismiss`) | 6000 |
| 48h `Try again` 오프라인 안내 `connectivity.offline` | 4000 |

권고: **현행 4000 유지**. 이유 — ① 세션 화면 사건이 아니라 앱 시작 시 1회 통지이고 route 와 무관하게 같은 시간이어야 순차 표시(`D4-120` Q14)가 화면마다 달라지지 않는다 ② 14일 통지는 녹음 삭제 사실이라 읽을 시간이 필요하다 ③ 3000 을 적용하려면 앱 수준 컴포넌트가 현재 route 를 알아야 한다(새 결합). `D4-128` 문언("세션 화면의 문구 전용 Toast")을 엄격히 적용하려면 사용자 결정이 필요하다.

## H3F-2. `D4-129` — 문구 승인 표기

`features/storytime-session/copy.ts` 표 머리글 행과 `uploads.stalled` · `uploads.retentionNotice` · `uploads.retentionExpired` JSDoc 의 `⚠ 초안` → `승인 D4-129`. 문구 문자열 변경 0.

## H3F-3. 파일

- 신규 `apps/web/src/features/storytime-session/ui/useSessionToast.ts`
- 신규 `apps/web/src/features/storytime-session/ui/__tests__/useSessionToast.test.tsx` (4)
- 수정 `apps/web/src/features/storytime-session/ui/StorytimeSessionScreen.tsx` (세션 화면 Toast 3곳 → `sessionToast`)
- 수정 `apps/web/src/features/storytime-session/copy.ts` (주석만)

## H3F-4. 테스트 · 되돌림 확인

unit 4: 상수 3000 · 문구 전용 2999ms 표시 → 3000ms 닫힘 · 버튼 있는 Toast 5999ms 표시 → 6000ms 닫힘 · 기본 `useToast` 3999ms 표시 → 4000ms 닫힘(세션 밖 4000 유지). 가짜 타이머.
되돌림: 상수를 4000 으로 바꾸면 **2 실패**(상수 · 2999→3000 닫힘) 확인 후 원복.
⚠️ 남은 사각: 세션 화면이 `sessionToast` 대신 `toast` 를 쓰도록 되돌리는 회귀는 이 unit 이 잡지 않는다(jsdom 통합 테스트는 실제 타이머 + `findBy` 라 가짜 타이머 전환이 어렵다).

## H3F-5. 검증

`typecheck` · `lint` · `format:check` · `lint:boundaries`(788 modules, 위반 0) · `build` · `assert:no-mocks` ✓ · `test` **2460 → 2464 / 168 → 169 files** ✓ · `ls apps/api supabase apps/mobile` → 전부 없음.

## H3F-6. e2e · baseline

`test:e2e` 단독 **485 passed (10.9m)**, 실패 0 (신규 e2e 0). 실행 전 다른 Playwright 프로세스 0, 강제 종료 없음. baseline 신규·재생성 0 (`e2e/__screenshots__` 파일 수정시각 변화 없음 — 미추적 `session-exceptions.spec.ts/` 3장은 11-02 · 11-03 생성분 그대로. Toast 시간은 스냅샷 대상 아님).

## H3F-7. `BACKEND_INTEGRATION_PENDING` 예상

신규 0 (contract · endpoint · Mock 변경 0).

---

# `S4-H3R` — Visual Gap H3 후속 `D4-132` · `D4-134` (2026-11-04, development-agent)

Status: **HANDOFF** · 커밋 안 함 · Plan·Spec·approvals 수정 안 함 · `apps/api` · `supabase` · `apps/mobile` 없음 · 위치·시간·문구 변경 0 · 신규 토큰 0.
근거: `docs/design/stage-4b-visual-gap-h3.md` `VG-H3-01` · `VG-H3-02` · `VG-H3-04` · 결정 `D4-132` · `D4-134`.

## H3R-1. 변경

| 항목 | 파일 | 내용 |
|---|---|---|
| `VG-H3-01` (`D4-132`) | `packages/ui/src/feedback/Toast.css` | `.haru-toast > .haru-icon-button { flex: none }` — 닫기 버튼이 flex-shrink 로 줄지 않는다(`InlineAlert` `.haru-alert__dismiss` 와 같은 처리). 48h Toast `Dismiss` **20.3×38 → 38×38**(hit 44), 높이 393 **76→86** · 320 **86→104** (승인 수치와 일치) |
| `VG-H3-02` (`D4-134`) | `apps/web/src/app/providers/sessionRecorderEnvironment.ts` | 보류(`capturing`)는 컨트롤러가 recording · paused 에 들어가면 켜지고 **컨트롤러 dispose(= 세션 화면 이탈) 때만** 풀린다. 이전: 스냅샷이 `completed` 가 되는 순간 풀림. 이탈 시점에는 `Recording submitted` 가 이미 떠 있어 `RecordingNoticeToasts` 가 기존 `useToastPresent` 규칙으로 그 Toast 가 사라진 뒤 꺼낸다(`RecordingNoticeToasts` 로직 변경 0, 주석만) |
| 〃 | `apps/web/src/entities/session/sessionRecorder.tsx` · `features/storytime-session/ui/RecordingNoticeToasts.tsx` | `capturing()` 계약 주석 갱신 (코드 변경 0) |
| `VG-H3-04` (`D4-134`) | `apps/web/src/shared/lib/focus.ts` (신규) · `features/storytime-session/ui/RetentionNoticeBanner.tsx` | `nextTabbableAfter(container)` — 문서 순서에서 container 뒤 첫 Tab 대상(disabled · `tabindex=-1` · hidden · inert · aria-hidden 제외). 배너 `Dismiss` 시 포커스가 배너(`role="alert"`) 안에 있으면 닫기 직후 그 대상에 `focus({ preventScroll: true })`. `InlineAlert` 는 수정하지 않았다(공통 거동 변경 0 — feature 에서 지정) |

## H3R-2. `VG-H3-02` 원인 확정 (런타임)

1. **재현 + 시각표**: Playwright 임시 probe(문서 전체 `MutationObserver` 로 Toast 문구 · Record Control `aria-label` · `pathname` 변화를 `performance.now()` 와 기록, 시나리오 `recorder:crash-recovered,recordings:upload-stalled-48h`, 48h 표시 중 녹음 시작 → `Submit`). 수정 전:
   `7067` Record Control 이 `Start recording`(컨트롤러 `completed`) · **세션 route** → `7071` 복구 Toast 등장(세션 route) → `7079` `Recording submitted` 로 교체(`/complete`) → 복구 재표시 0.
   = 보류가 **`completed` 스냅샷에서 풀리고**(이탈 전), 같은 tick 의 `toast.show(submitted)` 가 덮었다. 가설 그대로.
2. **토글**: 보류 해제를 dispose 로만 바꾼 뒤 같은 probe → `7039` `Recording submitted`(`/complete`) → `11225` 사라짐 → **`11226` 복구 Toast**(`/complete`) → `15411` 사라짐(체류 4185ms). 되돌리면 다시 유실 → 원인 확정.
3. probe 파일(`e2e/zz-h3r-probe.spec.ts`)은 삭제했다. 같은 판정을 정식 e2e 로 남겼다(H3R-3).

## H3R-3. 테스트 (되돌리면 실패 — 전부 확인)

| 종류 | 위치 | 내용 | 되돌림 확인 |
|---|---|---|---|
| unit | `app/providers/__tests__/sessionRecorderEnvironment.test.ts` (+2) | `submit()` → `completed` 후에도 `capturing` true · dispose 후 false + 구독 알림 / ready 만 거친 화면은 보류 0 | 이전 식으로 되돌리면 1 실패 |
| unit | `__tests__/session-notices.test.tsx` (+1) | 배너 닫기 버튼에 포커스 → 닫기 → `activeElement` = 버블 닫기(`homeOverviewCopy.bubbleDismiss`), `BODY` 아님 | `onDismiss={dismiss}` 로 되돌리면 1 실패 |
| unit | `shared/lib/__tests__/focus.test.ts` (신규, 3) | 뒤 첫 대상 · 제외 규칙 · 없으면 null | — |
| e2e | `e2e/session-notices.spec.ts` `S4-H3R` (+5) | ① `Submit` → 복구 Toast 는 `/complete` 에서 · `Recording submitted` 소멸 **이후** 등장 · 체류 ≥ 4000ms · 각 1회 ② Discard → Home 에서 복구 1회(`visual-gap-h3` §7 권고) ③④ 393 / 320 48h `Dismiss` 38×38 · Toast 높이 86 / 104 ⑤ 배너 키보드 닫기 → 포커스 = 닫기 전 Tab 대상 | ① 수정 전 코드에서 실패(복구 Toast 미표시) · ③④ CSS 규칙 제거 시 실패(폭 20.34) |

`VG-H3-04` 대상 근거: 393 · 320 실측 Tab 순서 = 배너 `Dismiss` → **버블 닫기**(`Dismiss`) → 카드 트랙 → 카드 flip. 즉 "닫기 전 Tab 했을 때 가는 곳"과 같다. 버블이 이미 닫혔으면 같은 규칙으로 카드 트랙이 된다.

## H3R-4. 검증

`typecheck` · `lint` · `format:check` · `lint:boundaries`(790 modules, 위반 0) · `build` · `assert:no-mocks` ✓ · `test` **2464 → 2470 / 169 → 170 files** ✓ · `ls apps/api supabase apps/mobile` → 전부 없음.
`test:e2e` 단독 **485 → 490 passed (11.6m)**, 실패 0. 실행 전 다른 Playwright · vite 프로세스 0, 강제 종료 없음, 포트 5173 사용 0.

## H3R-5. baseline 영향

**0** — 실패 0, 재생성 0, `e2e/__screenshots__` 수정시각 변화 0 (미추적 `session-exceptions.spec.ts/` 3장은 이전 생성분 그대로). 클러스터 분해 대상 없음.
이유: CSS 규칙이 바꾸는 것은 **닫기 버튼 + 긴 문구가 함께 있는 Toast** 뿐이다. Production 에서 Toast 에 닫기를 다는 곳은 48h(`RecordingNoticeToasts`) 하나이고 baseline 이 없다(날짜·시간 의존 안내). Home · 완료 화면(`Recording submitted`) · 세션 화면 Toast 는 닫기 버튼이 없어 영향 0. dev gallery `v9-toast` 의 "with action" 은 문구가 짧아 원래 줄지 않았다(baseline 통과로 확인).

## H3R-6. 임의 판단 (검토 요청)

① `VG-H3-04` 대상을 "배너 다음 Tab 대상"이라는 **위치 규칙**으로 구현했다(버블 닫기를 이름으로 지정하지 않음 — feature 간 import 0, 버블이 없으면 카드 트랙). 포커스가 배너 안에 없었으면(포인터 클릭 · Safari) 옮기지 않는다.
② 헬퍼를 `shared/lib/focus.ts` 에 두었다(앱 공용 순수 DOM 유틸). `InlineAlert` 공통 거동은 바꾸지 않았다.
③ `VG-H3-02` 를 `RecordingNoticeToasts` 가 아니라 조립 환경 `capturing` 의 해제 시점으로 고쳤다 — "완료 Toast 가 사라진 뒤"는 기존 `useToastPresent` 순차 규칙이 이미 보장하므로, 해제가 그 Toast 표시 **뒤**(이탈 시점)로만 가면 된다. 30분 자동 종료 · Discard 도 같은 경로를 탄다.
④ Toast CSS 는 `Toast.tsx` DOM 을 바꾸지 않도록 자식 선택자(`.haru-toast > .haru-icon-button`)로 썼다.

## H3R-7. `BACKEND_INTEGRATION_PENDING` 예상

신규 0 (contract · endpoint · Mock 변경 0).

---

# `S4-K2` — 회귀 · 시각 (AC-4-95 ~ 103 · 109) (2026-11-04, development-agent)

Status: **HANDOFF** · 커밋 안 함 · Plan·Spec·approvals 수정 안 함 · **UI·문구·토큰 변경 0**(테스트만 추가) · `apps/api` · `supabase` · `apps/mobile` 없음 · baseline 재생성 0.
근거: Plan `stage-4b-plan.md` rev 1.5 §13 `S4-K` 행 · 상위 Plan `stage-4-plan.md` §11.10 · §11.11 · AC-4-109 · 대장 `stage-4-approvals.md` §4 · `R-SHADOW-1` · `R-BASELINE-1` · `R-FIGMA-1`.

## K2-1. 추가한 테스트

| 종류 | 위치 | 수 | 내용 |
|---|---|---|---|
| unit (소스 가드) | `apps/web/__tests__/stage4-motion-guards.test.ts` (신규) | 10 | **AC-4-98** CSS 파서로 `animation` 선언마다 reduce 대체 방식을 계산 → 대조표(19종)와 **정확히 일치**(대체 없는 애니메이션 = `UNCOVERED` 0) · 세션 무한 모션 2종(breathing · record pulse)은 reduce 에서 **정지** · reduce 재정의 keyframes 에 이동 0 / **AC-4-109** 워크스페이스 `package.json` · `pnpm-lock.yaml`(전이 포함) 애니메이션 라이브러리 0 · `.lottie`/`.riv`/Lottie JSON 0 · 소스 `.animate(` · 라이브러리 import 0 / **AC-4-100** 세션 CSS 3파일의 `overflow` 선언 목록 고정(4건) + 선언마다 근거 주석(`R-SHADOW-1`) |
| e2e | `e2e/session-regression.spec.ts` (신규) | 25 (`test.fail` 1) | 아래 K2-2 |

되돌림 확인: breathing reduce 블록을 지우면 `UNCOVERED` 로 2 실패(확인 후 원복, `cmp` 동일). e2e AC-4-98 은 no-preference 대조 테스트가 같은 측정으로 `haru-session-breathing` 을 잡는다(프로브가 문다).

## K2-2. e2e `session-regression.spec.ts`

| describe | 내용 |
|---|---|
| **AC-4-97** 터치 타깃 (13 + `test.fail` 1) | 상태별로 **보이는 인터랙티브 요소 전부**를 `elementFromPoint` 로 가운데 + 상하좌우 ±21.5 hit-test(같은 요소여야 44). 모서리 4점은 annotation 기록만 — `IconButton` hit 확장은 Stage 1 부터 원형 44(`--radius-pill`)라 모서리가 원 밖(설계, gallery `button · Back 44x44` 와 같은 기준). 대상: ready · recording+팝업 · paused · Drawer · Discard 다이얼로그 · 마이크 시트(+뒤 `Microphone is off`) · 대화 전용 시트 · 공지 슬롯 · 완료 · 조회 실패 · 7일 배너 · 48h Toast 393/320 |
| **AC-4-98** reduce (2) | ready → recording+공지 슬롯 → 팝업 → paused → Drawer → 완료+Toast 매 상태 `document.getAnimations()` 실행 중 **무한 0 · 이동 0** (남는 것: scrim/sheet/toast opacity 페이드만) · no-preference 대조 |
| **AC-4-99** 반응형 (5) | 320×852 · 393×852 · 600×852 · 1024×852 · 1024×768 × ready · recording+팝업 · paused · 완료: 컬럼 = min(w,480) · 좌우 여백 차 ≤ 0.5 · 문서/뷰포트 가로 넘침 0 · 닫기·메달리온·Record·바·버블·팝업·책 칩·상태 블록이 컬럼 안 · ≥ 796 높이 세로 넘침 0 |
| **AC-4-100** computed overflow (1) | 393×852 ready · recording+팝업+공지 · 393×700 · 320×568 · 완료의 computed `overflow ≠ visible` 박스 목록 고정 — 뷰포트(Tailwind `overflow-y-auto`, `D4-82`) · `__list`(< 796) · 메달리온 원형 crop(Stage 3) · 1줄 말줄임 글자 박스 · sr-only. 전부 그림자 자식 0 또는 기존 양축 프로브 있음 |
| **AC-4-100** 4b 신규 그림자 (3) | 공지 슬롯 · 7일 배너 = `box-shadow: none`(자를 그림자 없음 — 더하면 단정이 깨져 프로브 요구) · 48h Toast = 아래 17 / 오른쪽 18 번짐 보임(fixed portal, overflow 박스 밖) |

## K2-3. AC → 증거 매핑

| AC | 상태 | 증거 (테스트 이름 · baseline) |
|---|---|---|
| **AC-4-95** 허용 차이 · Figma 대조 | 증거 있음 — **판정은 QA** | 기하: `session.spec.ts` "ready 기하 — Figma `300:1309`" · `session-recording.spec.ts` "recording 기하 — Figma `298:1262`" · "paused — Figma `298:1340`" · `session-prompts.spec.ts` "팝업 기하 — Figma `296:1257`" · "Prompt Drawer `88:960` — 기하 (`AD-S4-7`)" · `session-complete.spec.ts` "393×852 — Figma `29:62` 대조" / baseline: `s4-session-ready`(+`-320` · `-no-greeting` · `-long-greeting` · `-reminder`) · `s4-session-recording`(+`-320`) · `s4-session-paused` · `s4-session-prompts`(`296:1210`) · `s4-prompt-drawer` · `s4-record-control`(5변형) · `s4-button-sm` · `s4-session-complete` · `s4-session-discard-dialog`(`AD-S4-4`·`15`) · `s4-session-mic-sheet`(+`-conversation`, `AD-S4-16`) · `s4-session-background-notice`(`AD-S4-14`) / Visual Gap 문서 `docs/design/stage-4b-visual-gap-*.md` / 무효 `AD-S4-2`·`3` 부재: `Discard` 동작 테스트(`session-recording.spec.ts` "Discard: 다이얼로그 …") · ready 버블 = `139:2803` pill 그대로(`session.spec.ts` AC-4-120~122). ⚠️ 대장 §4.1 `AD-S4-7`·`9`·`10` 행 상태 칸은 "승인 대기", 절 제목은 "등록 (2026-10-25, `D4-49`)" — 문서 표기 불일치(수정 안 함) |
| **AC-4-96** 임의 값 신규 0 | 증거 있음 | grep(이번 실행): 세션 3 CSS + `features/recording` · `entities/session` 에서 HEX 0 · Tailwind arbitrary 0 · `style={{` 0. 남은 리터럴 = `@container (height < 796/702/664px)`(토큰 불가, K1-1 기록) · `inset 0 0 0 1px` hairline · `clamp(0px …)` |
| **AC-4-97** 터치 ≥ 44 | **결함 1** (`K2-D1`) | `session-regression.spec.ts` AC-4-97 13건 통과 · 기존 `session-recording.spec.ts` "칩 터치 타깃 = 세로 44" · `session-prompts.spec.ts` "`See all` 터치 44" · "포인터: 화살표 hit 44"(Next 만) · `session.spec.ts` AC-4-136 "닫기 터치 44" · ⛔ `test.fail` "K2-D1 — `Previous prompt` 가로 hit ≥ 44" |
| **AC-4-98** reduced-motion | 증거 있음 | unit `stage4-motion-guards.test.ts` AC-4-98 5건 · e2e `session-regression.spec.ts` AC-4-98 2건 · 기존 `session-recording.spec.ts` "모션 배분 …" · `session-complete.spec.ts` "prefers-reduced-motion" 3건 · `responsive.spec.ts` "reduce 에서 무한 애니메이션이 멈춘다" |
| **AC-4-99** 320/393/600/1024 · 짧은 세로 | 증거 있음 | `session-regression.spec.ts` AC-4-99 5건 · `session.spec.ts` AC-4-118(320/393/600) · `session-prompts.spec.ts` "짧은 세로 압축 (AC-4-99 ②)" · "`D4-81`" · "`D4-82`" · "`D4-78`" · "`D4-79`" · "Prompt Drawer 기하"(320~1024) · `session-complete.spec.ts` "320×568" · "짧은 세로 — 내용 도달" · ⏸ 320×568 바 뷰포트 `test.fail`(K1-3, 디자이너 대기) · iOS Safari `dvh` 는 `NOT VERIFIED`(K1-8) |
| **AC-4-100** overflow · 양축 프로브 | 증거 있음 | unit AC-4-100 · e2e AC-4-100 4건 · 기존 `shadow.spec.ts` "세션 팝업 pill 목록 … (S4-K1)" · "세션 ready pill 목록 … (D4-78)" · "세션 ready 그림자 … (S4-F1)" · "세션 뷰포트 스크롤 … (D4-82)" · `session-prompts.spec.ts` "`R-SHADOW-1` ⑥ — 캐러셀 viewport" |
| **AC-4-101** Stage 1~3 핵심 경로 | 증거 있음 | 전체 e2e: `auth` · `consent` · `onboarding` · `home` · `library` · `tabs` · `scenarios` · `visual` 등 (K2-4) |
| **AC-4-102** 명령 · `any`/`@ts-ignore` 0 | 증거 있음 | K2-4 · 신규 파일 `any`/`@ts-ignore` 0 |
| **AC-4-103** e2e 전체 · baseline 근거 | 증거 있음 | K2-4 · 재생성 0 → 클러스터 분해 대상 없음 |
| **AC-4-109** CSS 모션만 | 증거 있음 | unit `stage4-motion-guards.test.ts` AC-4-109 4건 |

## K2-4. 검증

`typecheck` · `lint` · `format:check` · `lint:boundaries`(791 modules, 위반 0) · `build` · `assert:no-mocks` ✓ · `test` **2470 → 2480 / 170 → 171 files** ✓ · `ls apps/api supabase apps/mobile` → 전부 없음 · 신규 파일 `any`/`@ts-ignore` 0.
`test:e2e` 단독 **490 → 515 passed (12.1m)**, 실패 0 (`test.fail` 2건 = K1-3 320×568 · `K2-D1` 포함). 실행 전 다른 Playwright · vite 프로세스 0, 강제 종료 없음, 포트 5173 사용 0.
baseline: 재생성 0 · `git status e2e/__screenshots__` 변경 0 (미추적 `session-exceptions.spec.ts/` 는 이전 생성분 그대로) → `R-BASELINE-1` ⑤ 분해 대상 없음. 신규 spec 은 baseline 을 만들지 않는다(전부 수치 단정).

## K2-5. ⛔ 드러난 결함 (보고만 — 수정 안 함)

| ID | 내용 | 실측 | 영향 AC | 비고 |
|---|---|---|---|---|
| **`K2-D1`** | Prompt Drawer 1번째 페이지 `Previous prompt`(24×24) 의 오른쪽 hit 확장을 pill 안 배지 `Tag(size="xs")`(`PromptPill.tsx:56-57`, phase / pageRef)가 덮는다 | 가로 hit **33.5**(왼쪽 22.5 · 오른쪽 11), 세로는 통과. `Next prompt` 는 44 | AC-4-97 (Drawer 좌우 화살표) | 기존 S4-G2 테스트가 `Next` 만 쟀다. 해결은 UI 변경(화살표 z-order 또는 배지 `pointer-events`)이라 결정 필요. `test.fail` 로 고정 — 고치면 터진다 |

관찰(결함 아님): `IconButton` 38 의 hit 영역은 원형 44 — 모서리(±21.5,±21.5) 미포함. Stage 1 설계 그대로.
문서 관찰: 대장 §4.1 `AD-S4-7`·`9`·`10` 행 상태 칸 "승인 대기" ↔ 절 제목 "등록 (D4-49)".

## K2-6. `BACKEND_INTEGRATION_PENDING` 예상

신규 0 (테스트만 추가).

---

# `S4-K2F` — `K2-D1` 수정 (`D4-135`) (2026-11-04, development-agent)

| 항목 | 내용 |
|---|---|
| 원인 (실측 정정) | 배지만이 아니다. bar 안 요약 트랙(`.haru-prompt-carousel__track`)이 `translate` 로 **화살표보다 위 층**에 그려져, 1쪽의 트랙 내용 전체가 `Previous prompt` `::before`(44) 오른쪽을 덮었다. 단계별 실측 blocker: 배지 `Tag` → (배지 `pointer-events:none` 시) `.haru-prompt-pill--bare` → (pill 도 끄면) `.haru-prompt-carousel__slide` — 셋 다 가로 hit **33.5** 그대로 |
| 수정 | `packages/ui/src/carousel/PromptCarousel.css` — `.haru-prompt-carousel__bar .haru-prompt-carousel__track { pointer-events: none; }` 한 규칙. `D4-135` 취지(표시 전용 내용이 탭을 받지 않음 · 쌓임 순서 변경 없음 · 시각 0) 그대로, 대상만 배지 → 요약 트랙. 상세 트랙(노트)·`PromptPill`(Home 카드 · Book Detail · 세션 popover)은 변경 없음 |
| 영향 검토 | 트랙 안 포커스·상호작용 대상 0(`PromptPill` = 텍스트 + `Tag` span). 스와이프 `onPointerDown/Up` 은 캐러셀 루트에 있어 이벤트가 그대로 버블된다(`session-prompts.spec.ts` 통과) |
| 테스트 | `e2e/session-regression.spec.ts` `test.fail` → 일반 `test` ("K2-D1 — … 표시 전용 요약 트랙이 탭을 받지 않는다"), 위 Drawer 테스트의 `Previous prompt` 제외 필터 제거. 결과 가로 hit ≥ 44 통과. **되돌림 확인**: 규칙을 `auto` 로 바꾸면 `33.5`(blocker `haru-tag`)로 실패 → 복원 |
| 검증 | typecheck · lint · test(171 files / 2480) · lint:boundaries · build · format:check · assert:no-mocks 통과. test:e2e 단독 **515 passed (12.1m)**, 실패 0 · `test.fail` 1건(K1-3 320×568)만 남음 · baseline 갱신 0 · 다른 Playwright·vite 프로세스 0, 포트 5173 미사용 |
| BACKEND_INTEGRATION_PENDING | 신규 0 |

# `S4-G2M` — Prompt Drawer 닫힘 모션 (`D4-137` · `D4-138`) + `VG-FIN-02` (2026-11-04, development-agent)

## G2M-1. 변경
| 파일 | 내용 |
|---|---|
| `packages/ui/src/sheet/Sheet.css` | 로컬 변수 `--haru-sheet-exit-extra`(기본 `0px`) · `haru-sheet-out` 끝 값과 정적 `.haru-sheet--closing` 을 `translateY(calc(100% + var(--haru-sheet-exit-extra)))` 로 같게 · `.haru-sheet--floating` 만 `var(--sheet-floating-inset-block-end)`. 새 토큰 0 · 새 `@keyframes` 0 · reduce 블록 그대로(opacity 만) |
| `packages/ui/src/sheet/Sheet.tsx` | (Q1 공유) 닫힘 중 `inert` · `aria-modal` 제거 · scrim `onClick` = `dismissible && state === 'open'` (탭은 흡수, `onClose` 재호출 0) |
| 열림 모션 · 서재 `inset-card` | 변경 0 (Q2 · Q4). `inset-card` 닫힘 끝 top 838 (393×852) 그대로 |

## G2M-2. §20.8 검증 (측정 방법은 `e2e/prompt-drawer-close.spec.ts` 머리 주석)
| # | 결과 |
|---|---|
| ① 끝 위치 | 393×852 · 320×568 · 1024×768: keyframe 끝(끝 − 0.01ms seek) top = 정적 값 top = innerHeight (852 / 568 / 768), translateY = 높이 + 24 (353 / 371 / 353). 자연 재생 rAF 샘플 단조 증가, 되튐 0 |
| ② 다른 variant | bottom(Reading Context) translateY 459 = 높이 · inset-card(Library 서가) 798 = 높이 → 현행 `100%`. baseline 재생성 0 |
| ③ 언마운트 프레임 | **기준 미달 → 수정 안 함 (Q3)**. 하단 120px 띠의 채널 차: 393×852 **max 7 / 575px** · 320×568 **max 8 / 393px** · 1024×768 **max 8 / 754px**. 차이가 나는 행은 **뷰포트 맨 아래 2행뿐**. 시트 `box-shadow` 만 꺼서 다시 찍으면 **세 뷰포트 모두 max 0** → 원인은 `--shadow-glass-rest` 위쪽 번짐 잔여로 확정(런타임 토글). 기준 테스트는 `test.fail`(Q3 결정 후 해제) + 원인 분해 테스트는 일반 통과 |
| ④ reduce | 닫힘 전 프레임 transform `none` · top 고정 · opacity 단조 감소 → 끝 < 0.3 |
| ⑤ 포커스 | 닫힘 첫 rAF 프레임 activeElement = Prompts 칩 (no-preference · reduce 둘 다), 기존 AC-4-137 ③ 통과 |
| ⑥ 닫힘 중 | `inert` · `[aria-modal="true"]` 0 · 화살표 좌표 hit = scrim, 클릭해도 `Prompt 1 of 7` 유지 · scrim·Record 자리 연속 탭 → 일시정지 0 · 칩 Enter 로 팝업 재열림 → Escape 로 닫힘(양보 0). `onClose` 1회는 단위 테스트(4 variant) |
| ⑦ | `stage4-motion-guards.test.ts` 변경 없이 통과 |

## G2M-3. 테스트 · 되돌림 확인
- `packages/ui/src/sheet/__tests__/Sheet.test.tsx` +8 (bottom · full · inset-card · floating × 닫힘 중 속성 / scrim 연속 탭 onClose 1회)
- `e2e/prompt-drawer-close.spec.ts` 신규 14 (① 4 · ② 2 · ③ 6(`test.fail` 3 포함) · ⑥ 1 · ④ 1)
- `e2e/session-regression.spec.ts` `VG-FIN-02` +2: 활성 2/7쪽 · 5/5쪽 `Previous prompt` 가로 hit ≥ 44 (`previousHitExtent` 공용화)
- 되돌림: Sheet.css·tsx 를 HEAD 로 → 단위 8 전부 실패, e2e ①×3 · ②×2 · ③ 원인×3 · ⑥ 실패. `PromptCarousel.css` `pointer-events: auto` → K2-D1 · VG-FIN-02 2건 33.5 로 실패(5쪽 blocker = 문구). 전부 복원(`cmp` 확인)

## G2M-4. 공유 `Sheet` 회귀
마이크 시트 · 대화 전용 시트 · Reading Context · 온보딩 선택 시트 · Library 서가/Book Detail 전 e2e 와 시각 baseline 통과, baseline 재생성 0. 시각 변화는 floating 닫힘 거리뿐.

## G2M-5. 검증
typecheck · lint · lint:boundaries(791 modules, 위반 0) · format:check · build · assert:no-mocks 통과. `test` **2480 → 2488 / 171 files**. `test:e2e` 단독 **515 → 531 passed (12.7m)**, 실패 0 (`test.fail` 4 = K1-3 + ③ 3). `e2e/__screenshots__` 변경 0. 다른 Playwright·vite 프로세스 0, 포트 5173 미사용. `apps/api` · `supabase` · `apps/mobile` 없음.

## G2M-6. 사용자 결정 필요
- **Q3**: 언마운트 프레임 그림자 잔여 max 7~8(기준 5) · 바닥 2행. ⓐ 이동 거리에 그림자 위쪽 번짐 추가(토큰 후보 `--sheet-floating-exit-shadow-reach`) ⓑ 닫힘에 opacity 추가(비대칭) ⓒ 수용. 결정 후 ③ `test.fail` 해제.

## G2M-7. `BACKEND_INTEGRATION_PENDING`
신규 0.

# `S4-G2MF` — floating 닫힘 거리 + 그림자 번짐 (`D4-139`) (2026-11-04, development-agent)

## G2MF-1. 번짐 값 (`R-SHADOW-1` 3)
- 겹별 위쪽 도달 = blur − offsetY (spread 0): `0 2 4` → 2 · `0 12 28` → 16 · `0 28 56` → **28**. 합성 도달 = 겹 최댓값 28 (inset 2겹은 박스 밖에 안 그림).
- 픽셀 프로브(Chromium dsf 1, 흰 배경, 300×250 r28 박스 위 1px 열): 겹별 첫 비0 행 2 / 14 / 22, 3겹 합성 채널 차 1px 위 10 · 4px 6 · 8px 4 · 16px 1 · 22px 1 · 23px 이상 0.
- 채택 **28px** (정의 상한 ≥ 실측 22 — 엔진 blur 근사에 기대지 않음).

## G2MF-2. 변경
| 파일 | 내용 |
|---|---|
| `packages/design-tokens/src/component/index.css` | 신규 `--sheet-floating-exit-shadow-reach: 28px` (근거 주석: 겹별 계산 + 실측) |
| `packages/ui/src/sheet/Sheet.css` | `.haru-sheet--floating` `--haru-sheet-exit-extra` = `calc(inset-block-end + exit-shadow-reach)`. keyframe 끝 · 정적 `.haru-sheet--closing` 은 같은 변수라 같은 끝값. 시간 · 이징 · 열림 · reduce · 다른 variant 변경 0 |
| `packages/design-tokens/__tests__/token-tiers.test.ts` | Component 토큰 목록에 신규 1개 |
| `e2e/prompt-drawer-close.spec.ts` | ③ 3건 `test.fail` 해제(기준 ≤ 5 그대로) · ① translateY = 높이 + 24 + 28, staticTop ≥ innerHeight + 28 |
| `docs/DESIGN_TOKEN_MAP.md` §8 | 행 1개 (Spec 번호 없음, `D4-139`) |

## G2MF-3. 결과
- ① 393 / 320 / 1024: translateY 381 / 399 / 381 (= 높이 + 52), top 880 / 596 / 796 (= innerHeight + 28), keyframe 끝 = 정적 값.
- ③ 언마운트 직전↔직후 하단 120px: 세 뷰포트 **max 0 · over 0** (이전 7 / 8 / 8). 원인 분해 테스트도 withShadow · shadowOff 모두 0.
- ② bottom 459 = 높이 · inset-card 798 = 높이 — 불변.
- 되돌림: `--haru-sheet-exit-extra` 를 inset 만으로 → ①×3 · ③×3 실패(`max 7 / 8 / 8`, rows [1,2]) → 복원(`cmp` 확인).
- 관찰: ⑥ 이 스펙 첫 실행에서 1회 `Try this prompt!` 숨김 대기 실패, 단독 4회 반복 · 이후 전체 실행 통과 (변경과 무관한 타이밍으로 판단, 미수정).

## G2MF-4. 검증
build · typecheck · lint · lint:boundaries(791 modules, 위반 0) · format:check · assert:no-mocks 통과. `test` **2488 / 171 files** 통과 (`token-tiers` 목록 +1, `fonts.test` manifest component 261 → 262 — 신규 토큰 반영; 테스트 수 불변). `prompt-drawer-close.spec.ts` 단독 14/14 (`test.fail` 0).
`test:e2e` 단독 전체 2회: **529 passed · 2 failed (15.9m)** → **530 passed · 1 failed (15.9m)**. 실패는 매회 다른 테스트 — 1회차 `onboarding.spec.ts:184` · `session-notices.spec.ts:365`, 2회차 `onboarding.spec.ts:226`. 셋 다 단독 재실행 통과(앞 둘 3/3, onboarding 전체 80/80 ×2). `floating` 변형은 Prompt Drawer 만 쓰므로(`SessionPromptsDrawer`) onboarding 과 무관 — 장시간 실행 타이밍 flake 로 판단, 미수정·QA 확인 요청. `e2e/__screenshots__` 변경 0 (untracked `session-exceptions.spec.ts/` 는 11-02~03 기존 파일). `apps/api` · `supabase` · `apps/mobile` 없음. `BACKEND_INTEGRATION_PENDING` 신규 0.

# `S4-H4` — 4b QA 1회차 후속 (`D4-140`~`D4-146`) (2026-11-07, development-agent)

근거: Plan rev 1.6 §13.5 · §14 (AC-4-35·36 화면 부분 · AC-4-99 ③ · AC-4-103 · AC-4-154~156) · Spec §21 (APPROVED `D4-146`) · 허용 차이 `AD-S4-27`. 실행 순서 Plan §13.5-⑥ 대로 ④ 조사 → ③ → ② → ① → ⑤. 새 UI · 새 문구 0 (기존 `InlineAlert` · Toast · `error-copy.ts` 재사용). contracts · error code · endpoint 변경 0.

## H4-1. 변경

| 파일 | 내용 |
|---|---|
| `packages/ui/src/layout/AppColumn.css` | ③ `min-inline-size: min(var(--layout-min-width), 100%)` (근거 주석 — 원인 · 실측 · `AD-S4-27`). 같은 성질의 Tailwind 유틸리티 `app-column` · `min-w-app`(`design-tokens/src/utilities.css`)는 **사용처 0**(grep)이라 바꾸지 않았다 |
| `apps/web/src/entities/session/useCreateSession.ts` | ①② 시작을 막는 응답 처리 — mutation 안에서: `SESSION_ALREADY_ACTIVE` → `details.sessionId` Detail 1건 → `ready` 면 그 세션을 성공으로(일반 시작과 같은 push) · 아니면 원 오류 · 조회 실패면 그 오류 / `ONBOARDING_INCOMPLETE` → `invalidateQueries(meKeys.detail())`(이전 값 유지) → 미완료면 아무것도 안 함(Guard 이동) · `completed` 면 원 오류. `onFailed(errorCode)` 인자 추가(기존 무인자 호출 호환) |
| `apps/web/src/shared/copy/error-copy.ts` | `sessionStartBlockedCopy(code)` (두 코드만 기존 `ERROR_COPY` 반환, 그 외 `null`) · `joinErrorMessage` (`제목. 설명`, Q1 ⓐ) — 문구 신규 0 |
| `features/activity-card-deck/ui/ReadingContextSheet.tsx` | prop `failed: boolean` → `failure: { title, description? } | null` · 안내가 **나타날 때 1회** `scrollIntoView({ block: 'nearest' })` (Q2 ⓑ — 기존 실패 문구 포함). 기준점용 무스타일 래퍼 `div` 1개(`InlineAlert` 가 ref 를 받지 않음, flex 항목 수 불변) |
| `features/activity-card-deck/ui/ActivityCardDeck.tsx` | 실패 안내 선택 — 생성 실패는 `sessionStartBlockedCopy ?? startFailed`, 선택 확정 실패는 `startFailed` |
| `features/library/StartSessionAction.tsx` | Toast `message` = `joinErrorMessage(blocked)` 또는 기존 `startFailed`. Toast API 변경 0 |
| `mocks/sessions/MockSessionApi.ts` · `mocks/fixtures/sessions.ts` | 신규 key `session-already-active-ready` · `-paused` · `onboarding-incomplete` 가 오류를 낼 때 `onboardingState.markServerIncomplete()` · 활성 세션 fixture 에 상태·기준 시각 인자 |
| `mocks/onboarding/onboardingState.ts` · `mocks/me/MockMeApi.ts` · `mocks/index.ts` | `markServerIncomplete` / `serverIncomplete` — 표시 후 `me` 기본 응답 = `in_progress`(제출이 우선) |
| `apps/web/src/dev/recording-measure/latency-core.ts` (신규) · `RecordingMeasurePage.tsx` | ⑤ 측정판 ⑧ 시작 지연 · ⑨ 판정 스트림 (H4-6) |
| `apps/web/src/test/harness.tsx` | `errorCodes` 옵션 (어긋남 재현용 — Mock 번들 옵션 전달만) |
| `playwright.config.ts` | project `chromium-classic-scrollbar` 추가(`ignoreDefaultArgs: ['--hide-scrollbars']`, `scrollbar-classic.spec.ts` 전용 · 기본 project 는 그 파일 제외) |
| `e2e/support/clock.ts` (신규) · `session-notices` · `session-complete` · `session-regression` spec | ④ Toast 수명 대기 7개 테스트를 실시계 → 주입 clock(`page.clock.runFor`)으로 (H4-2) |
| `e2e/session-start-blocked.spec.ts` · `scrollbar-classic.spec.ts` · `recording-measure.spec.ts` (신규) · `__tests__/session-start-blocked.test.tsx` (신규) · `dev/__tests__/latency-core.test.ts` (신규) · `mocks/__tests__/MockSessionApi.test.ts` | 테스트 (H4-7) |
| `docs/API_CONTRACTS.md` | Rev 8.13 — §5.3 · §5.4 신규 key 2 구현 확정 · `onboarding-incomplete` 개정 |

## H4-2. ④ `QA-4B-003` — 원인 판별 (AC-4-156 ①②)

판별 기준 = Plan §13.5-③. 프로브는 저장소 밖 gitignored `.omc/s4h4/` (`p12.probe.ts` = QA P12 v1 과 같은 흐름 · 심장박동만 · rAF 루프 없음 + `visibilityState` · `hasFocus()` · `freeze`/`resume` · `blur`/`focus` 기록 · 9초 뒤 1회 rAF 요청 후 재측정). 로그 `.omc/s4h4/step1-run1.log` · `step1-run2-trace.log` · `p12-final-50.log`.

| 단계 | 방법 | 결과 |
|---|---|---|
| 1 재현 | P12x `--repeat-each=30`(trace off) + `=40`(trace `retain-on-failure` — 기본 설정과 같은 screencast 조건) | **재현 0 / 69** (30회 중 1건은 측정 중 내가 소스를 고쳐 HMR 이 페이지를 다시 그린 실패 — 원인 기록 · 집계 제외). 전 회차 심장박동 39~42 · 최대 간격 정상 · `visibilityState` 항상 `visible` · `hasFocus` true · `freeze` 0 · Toast `closing` +4004ms → 언마운트 +184ms |
| 1′ QA 실패 기록 재분석 | QA `flake-run2/trace.zip` `1-trace.trace` 직독 | 완료 화면 진입 585890 → 마지막 프레임 586127 → **7,602ms 프레임 0** → 593729 재개. 그 동안 `expect` 폴링(locator 해석 13회)은 응답했다. Toast 4초 타이머가 **+7.8s 에야** 울렸다 — 막힌 것은 JS 가 아니라 **타이머·프레임 작업의 실행 시점**이다. QA P12 v1 실패 1건도 앱과 무관한 심장박동 `setInterval` 이 Toast `closing` 과 같은 250ms 창에서 멈췄고(20/40) `evaluate` 는 응답했다 |
| 2 억제 해제 인자 | `playwright-core@1.63.0` `lib/coreBundle.js` `chromiumSwitches` 직독 | `--disable-background-timer-throttling` · `--disable-backgrounding-occluded-windows` · `--disable-renderer-backgrounding` 가 **이미 기본**이다. 즉 1단계 69회가 곧 "억제 해제 상태" 실행이며 재현 0 |
| 3 제품 측 | `[직독]` `packages/ui/src/feedback/ToastProvider.tsx` timer effect(`[open, toast]` · cleanup `clearTimeout`) · `hooks/usePresence.ts`(`exiting` effect) | 타이머가 도는 상태(심장박동 정상)에서 `closing` 뒤 미언마운트 **0 / 69**. 또 제품 코드는 **남의 `setInterval` 을 멈출 수 없고**, JS 를 막는 경로(동기 루프 · `alert` · 동기 XHR)는 CDP 응답도 막는다 — QA 관측(심장박동 정지 + CDP 응답)과 양립하는 제품 경로가 없다. grep: `apps/web/src` · `packages/ui/src` 에 `alert(`·`confirm(`·`prompt(`·동기 XHR 0 |
| 4 실기기 | `D4-143` 수동 확인 목록에 추가 권고 | 미실시 (사용자) |

**결론: 테스트 환경 요인**(OS·브라우저가 보이지 않는 headless 렌더러의 타이머·프레임 작업을 미룸). 보강 정황: QA 실패 3건의 시각이 전부 **01:13 · 01:38 · 01:44 KST**(사용자 유휴 시간대), 이번 69회는 주간 사용자 활동 중 — 재현 조건(장시간 유휴 · 전원 관리)은 이 세션에서 만들 수 없었다. 이 한계는 판정 근거 ①(독립 심장박동 동시 정지) · ②(CDP 응답 중 타이머·프레임만 정지)로 보완했다.

**조치 (환경 요인 → 기다리는 방식 안정화)**: Toast 수명을 **실시계로 기다리던 7개 테스트**(e2e 전체의 실시계 Toast 대기 전부)를 주입 clock 으로 바꿨다 — `e2e/support/clock.ts` `advanceUntil` / `advanceUntilToastGone` / `advanceUntilToastText` (페이지 로드 전 `page.clock.install()`, 조건이 맞을 때까지 `page.clock.runFor(100)` 반복, 상한 15s 가짜 시간). `runFor` 는 CDP 로 페이지 안 가짜 타이머를 실행하므로 실제 타이머가 미뤄져도 결과가 같다. 고정 ms sleep 0 · 재시도·`skip`·임계값 변경 0 · launch 인자 추가 0(더할 인자가 없다).

| spec | 테스트 | 바뀐 대기 |
|---|---|---|
| `session-notices.spec.ts` | `VG-H3-02` 보류 안내 Submit 경로 (QA 1회차 실패 365 의 짝) · Discard 경로(365) · AC-4-153 14일 → 48h | `toHaveCount(0,{10s})` ×4 · `toHaveText(RECOVERED,{10s})` ×2 · `waitForTimeout(1000)` → `clock.runFor(1000)` · `toContainText(STALLED,{8s})` |
| `session-regression.spec.ts` | 완료 화면 닫기 터치 타깃(351, QA 2회차 실패) · `D4-82` 박스 목록(637) | `submitToComplete` · 637 의 `toHaveCount(0,{8s})` |
| `session-complete.spec.ts` | Submit 경로 스티커 · 재진입 · reduce Submit 경로 | `toHaveCount(0,{8s})` ×3 |

AC-4-156 ③ P12 `--repeat-each=50`: H4-8 참조. ④ 실시계 Toast 대기 신규 0 — grep `toHaveCount(0, { timeout` · `waitForTimeout` (H4-8).

## H4-3. ③ 클래식 스크롤바 (AC-4-99 ③, `QA-4B-004`)

원인 = Spec §21.3 그대로(`AppColumn.css` `min-inline-size: 320px` 가 스크롤 박스 안쪽 305 보다 큼). 수정 `min(var(--layout-min-width), 100%)` (NB-17 ⓐ, `AD-S4-27`). 상설 e2e `e2e/scrollbar-classic.spec.ts` — project `chromium-classic-scrollbar` 전용, **16건**: 환경 확인 1(320×568 Library: 스크롤바 폭 **15** · `clientWidth 305` · 컬럼 **305**) + 5 크기(320×568 · 320×852 · 393×600 · 600×800 · 1024×500) × 3 묶음(Welcome+온보딩 첫 화면 · Home+Library · 세션 ready+recording+완료). 각 화면 양축 프로브: 스크롤 박스 `scrollWidth ≤ clientWidth` · 문서 가로·세로 넘침 0 · 컬럼 중심 = 박스 `clientWidth` 중심 ±0.5 · 컬럼 폭 = `min(clientWidth, 480)` · 스크롤이 생긴 화면은 스크롤바 폭 > 0. 기본(오버레이) project 시각 baseline 재생성 0 (H4-8). `R-SHADOW-1` ⑥ 그림자 세로·가로 프로브 = 기존 `e2e/shadow.spec.ts` 전체 재실행 통과(H4-8).

## H4-4. ② AC-4-36 화면 부분 (`QA-4B-002`, NB-16)

| ① `me` 재조회 1건 → Guard 이동 | unit `session-start-blocked.test.tsx` Home · 서재 (`GET /v1/me` 증가 = 1, 도착 `/onboarding…`) · e2e `session-start-blocked.spec.ts` AC-4-36 2건 (`me` +1 · 도착) |
|---|---|
| ② 일반 실패 문구 0 | 같은 테스트 — `startFailed` · `ONBOARDING_INCOMPLETE` 문구 0, e2e 프레임마다 `[role=alert]`·Toast 0 |
| ③ 어긋남 → 기존 문구 · 이동 0 · 루프 0 | unit — `sessions.create:error` + `errorCodes {'sessions.create':'ONBOARDING_INCOMPLETE'}`(Mock 연동 표시 없음 → `me` 그대로 `completed`) → 시트 `A few setup steps are left` + 설명 · `/` 유지 · 탭마다 `me` 1건(2탭 = 2, 50ms 더 기다려도 불변) · 서재 Toast `제목. 설명` |
| ④ 두 경로 동일 | 위 Home · 서재 짝 |
| T1 · T2 · T5 | e2e 프레임 기록(rAF, 탭 이후): 출발 화면 프레임 전부 `aria-busy` · 알림/Toast 프레임 0 · Guard 전체 화면 Spinner 프레임 0 (Home `/` 2프레임 busy 2 · 서재 `/library` 1 busy 1 → `/onboarding/start`) |
| Mock | `sessions:onboarding-incomplete` 409 뒤 `me` = `in_progress` · 아이 참조 없음 (unit `MockSessionApi.test.ts`) · `error` 로 같은 코드를 내면 연동 0 (unit) |

## H4-5. ① AC-4-35 화면 부분 (`QA-4B-001`, CP-15 ⓐ · NB-18 · `D4-146`)

| 기준 | 증거 |
|---|---|
| ① 일반 실패 문구 0 | unit · e2e `recording`/`paused` 경로 — `We couldn't start…` 0 |
| ② Detail 조회 1건 | unit `GET /v1/sessions/:sessionId` = 탭당 1 (재탭 후 2) · e2e = 1 |
| ③ `ready` → 그 세션 화면 (push) · 새 생성 0 | unit Home · 서재 → `/session/99999999-…0001` + `Start recording` · `POST /v1/sessions` = 1 · e2e `history.length` +1 (push, `D4-146`) |
| ③ `recording`/`paused` → 기존 문구 · 이동 0 · 녹음·로컬 변화 0 | unit 2 key × 2 경로 · e2e Home 2 key(전이·녹음 요청 0) · 서재 Toast = `A storytime is already open. Continue the open storytime, or finish it before starting a new one.` |
| ④ Detail 조회 실패 → 기존 일반 실패 문구 (`D4-146` Q4) | unit Home `startFailed` 시트 · 서재 `startFailed` Toast (`sessions.getdetail:error`) |
| ⑤ 재탭 → 같은 결과 · 이중 요청 0 | unit 재탭 → 생성 2 · Detail 2 (탭당 1) · 같은 문구 · `loading` 중 재탭 무시는 기존 `Button` 규칙 |
| Q2 ⓑ 스크롤 | unit `scrollIntoView({block:'nearest'})` **1회**(이후 재렌더 0) · 기존 실패 문구에도 1회 · e2e 320×568 — 안내 전체가 시트 내용 박스 안 · `Continue` 화면 안 |
| T1 · T2 · T3 (Spec §21.2) | e2e 프레임 기록: 출발 화면 비-busy 프레임 0 · 알림/Toast 프레임 0 · 시트 없는 Home 프레임 0. Mock 응답이 즉시라 이동이 탭과 같은 프레임 안에 끝난다(Home 경로 출발 화면 기록 프레임 0 · 세션 화면 첫 프레임 7 · 서재 2) — "위반 프레임 0" 으로 판정 |
| T4 (권고, 필수 아님) | **하지 않음** — 세션 화면 Detail 은 `staleTime: Infinity` 라 시작 쪽 값을 캐시에 넣으면 그 화면이 재조회하지 않는다. 일반 경로와 같은 Spinner 프레임을 유지했다 |

Mock 시간 기준 (발견 · 처리): 브라우저 Mock 의 서버 시계는 고정 epoch 라 `ready` 활성 세션의 `readyAt` 을 서버 시계로 만들면 기기 녹음 상태 머신이 10분 방치(`D4-45`)로 즉시 정리해 Home 으로 돌아갔다(e2e 첫 실행 실패로 발견). `create` 가 seed 할 때 **요청 본문 `readyAt`(= 기기의 지금) 기준 2분 전**으로 만든다 — 실제 서버(서버 시계 ≈ 기기 시계)와 같은 결과. `getDetail` 이 먼저 seed 하는 경우는 기존대로 서버 시계.

## H4-6. ⑤ 측정판 보강 (AC-4-154 · 155, `D4-144`)

`/__dev/ui/recording-measure` 에 섹션 1개 (`SessionStartMeasure`) — ⑧ `녹음 시작 지연 1회 (n/5)` · ⑧ 기록 지우기 · ⑨ `판정 스트림 관측`.

- **A (AC-4-154)**: 회차마다 **새 제품 `createWebRecorderAdapter`** → `start({ timesliceMs: 1000 })` → 첫 청크(상한 5s) → `stop` · `dispose`. 탭 = 버튼 `click` 이벤트 `timeStamp`, 끝점 = `performance.now()` (같은 시간축). 두 이벤트는 측정 중에만 `MediaRecorder.prototype.start` 를 감싸 **제품이 만든 그 인스턴스에** `start` · 첫 `dataavailable` 리스너를 붙여 잰다 → 별도 `MediaRecorder` 0 · **어댑터·환경 코드 변경 0**(관찰 콜백을 추가하지 않았다 — Plan §13.5-⑤ 의 선택지 중 제품 코드를 건드리지 않는 쪽, 임의 판단으로 보고). 5회 표 + 끝점별 중위값 · UA · 첫 청크 `mimeType` · timeslice 표시. 탭→start 에는 `getUserMedia` 열기가 포함된다(세션 녹음 시작과 같은 경로 — 판정이 연 스트림은 판정 뒤 놓이므로 녹음 시작이 다시 연다). 화면 안내: 권한을 먼저 허용해 프롬프트 시간이 섞이지 않게.
- **B (AC-4-155)**: 측정 전용 `createSessionRecorderEnvironment({ platform: createWebRecordingPlatform, … })` 의 **실제 `resolveSessionMode`** 를 호출(앱이 Mock 모드여도 Web 플랫폼 — 판정은 `clients` 를 쓰지 않는다). 그 동안만 `navigator.mediaDevices.getUserMedia` 를 감싸 반환 스트림을 모으고 `finally` 에서 원복 → 반환 직후 · +1s 트랙 `kind:readyState` · 판정 결과 · 원복 여부 표시 + OS 표시등 육안 확인 안내. ⚠️ 권한이 이미 허용/차단이면 판정은 **스트림을 열지 않는다**(`checkPermission` 만) — 그때 화면이 "판정이 마이크를 열지 않았다 — 권한을 '묻기'로 되돌린 뒤" 를 안내한다. `NV-4B-3` 실측은 권한 '묻기' 상태에서 해야 한다(사용자 절차 메모).
- 🔒 `console` 0(e2e 단정) · 트랙 `label`(장치 이름) 미표시 · Production 제외(`assert:no-mocks` 통과 · `apps/web/dist` grep `measure-start-latency`·`watchedStart`·`watchedGetUserMedia` 0).
- unit `dev/__tests__/latency-core.test.ts` 6건 — 실제 `createWebRecorderAdapter` + 가짜 환경(prototype `start` 를 가진 가짜 네이티브 레코더): 두 끝점 55 / 1025ms · MIME · prototype 원복 · 스트림 해제 / 상한 → `null` / 감싸기가 원래 `start` 를 같은 대상·인자로 부름 / 중위값 / 판정 관측 · 실패해도 원복. e2e `recording-measure.spec.ts` 1건 — Chromium 가짜 마이크(`--use-fake-device-for-media-stream`, 이 파일만 `test.use`)로 5회 표 · 중위값 · ⑨ 판정 `recorded` · 원복 · 320 가로 넘침 0 · console 0.

## H4-7. 추가·수정한 테스트

| 종류 | 파일 | 수 |
|---|---|---|
| unit | `apps/web/__tests__/session-start-blocked.test.tsx` (신규) | 14 |
| unit | `apps/web/src/dev/__tests__/latency-core.test.ts` (신규) | 6 |
| unit | `apps/web/src/mocks/__tests__/MockSessionApi.test.ts` (key 목록 +2 · 신규 5) | +5 |
| e2e | `e2e/session-start-blocked.spec.ts` (신규, 프레임 기록 T1~T5) | 8 |
| e2e | `e2e/scrollbar-classic.spec.ts` (신규, project `chromium-classic-scrollbar`) | 16 |
| e2e | `e2e/recording-measure.spec.ts` (신규, 가짜 마이크) | 1 |
| e2e | `session-notices` · `session-complete` · `session-regression` — Toast 대기 7개 테스트를 주입 clock 으로 (단정 변경 0) | 0 |

테스트 수: unit **2488 → 2513** (171 → 173 files) · e2e **531 → 556** (24 → 26 files, project 2).

## H4-8. 검증 (전부 이 세션 실행, Playwright 단독 — 다른 Playwright 프로세스 0, 포트 4319 만 사용 · 5173/5174 미접촉)

| 명령 | 결과 |
|---|---|
| `pnpm typecheck` | 통과 |
| `pnpm lint` | 통과 |
| `pnpm lint:boundaries` | 위반 0 (794 modules, 3019 dependencies) |
| `pnpm format:check` | 통과 |
| `pnpm test` | **2513 passed / 173 files** |
| `pnpm build` | 통과 (500 kB chunk 경고는 기존과 같다) |
| `pnpm assert:no-mocks` | MOCK · DEV sentinel · `haru-dev-` · sharp 흔적 0 · 추가 grep `apps/web/dist` 에 `measure-start-latency` · `watchedStart` · `watchedGetUserMedia` 0 |
| P12x `--repeat-each=50` (수정 후, trace `retain-on-failure`) | **50 passed (9.7m)** — Toast 잔존 0 · 심장박동 40~41 · visibility 변화 0 (`.omc/s4h4/p12-final-50.log`). ⚠️ 수정 전에도 0/69 였으므로 이 50회는 "환경이 조용할 때 재현 0" 이상을 증명하지 않는다 — 안정화의 근거는 H4-2 의 대기 방식(주입 clock)이다 |
| `pnpm test:e2e` 단독 1회차 (14일 테스트 변환 전) | **556 passed (12.4m)** · 실패 0 |
| `pnpm test:e2e` 단독 2회차 (최종 코드) | **556 passed (12.3m)** · 실패 0 (`.omc/s4h4/e2e-run2.log`) |
| `pnpm test:e2e` 단독 3회차 (최종 코드, 2회차에 이어) | **556 passed (12.3m)** · 실패 0 (`.omc/s4h4/e2e-run3.log`) → **연속 2회 통과** (AC-4-103) |
| `e2e/__screenshots__` | 변경 0 (`git status` = 기존 미추적 `session-exceptions.spec.ts/` 뿐) — baseline 재생성 0 |
| 실시계 Toast 대기 grep (AC-4-156 ④) | `e2e/*.ts` 의 `toHaveCount(0, { timeout` 0 · Toast `{ timeout` 0 (신규 spec 의 Toast 단정은 즉시 표시 확인뿐) |
| `apps/api` · `supabase` | 없음 (`ls` → No such file) |

## H4-9. `BACKEND_INTEGRATION_PENDING` (Plan §13.5-⑧ 그대로)

- 기존 AC-4-35 · 36 서버 부분 — `SESSION_ALREADY_ACTIVE` · `ONBOARDING_INCOMPLETE` 서버 판정 (`BACKEND_HANDOFF` · `ERROR_CODES`)
- **`P4B-BIP-07`** — 탭·기기가 사라져 끝나지 않은 `recording` · `paused` 세션이 새 세션 생성을 무기한 막지 않도록 서버 정리 규칙 (업로드 지연 48h · 14일 `D4-29` 와 충돌 금지)
- **`P4B-BIP-08`** — 세션 endpoint 가 `ONBOARDING_INCOMPLETE` 를 낸 시점에 `GET /v1/me` 의 `onboardingStatus` 도 `completed` 가 아닐 것 (Frontend 는 `me` 로 이동 지점을 정한다 — 어긋나면 안내만 하고 멈춘다)
- 신규 추가 0

## H4-10. 결정 필요 · 임의 판단 (승인 필요)

1. **측정판 A 의 관찰 방식** — Plan §13.5-⑤ 는 "어댑터가 `start` 시각을 내지 않으면 관찰 전용 선택 콜백 1개 추가" 를 적었다. 콜백을 추가하지 않고 **측정 중에만 `MediaRecorder.prototype.start` 를 감싸** 제품 인스턴스에 리스너를 붙였다(제품 코드 변경 0 · 별도 `MediaRecorder` 0 · 원복 unit). 콜백 방식을 원하면 바꾼다.
2. **`NV-4B-3` 실측 절차** — 권한이 이미 허용이면 `resolveSessionMode` 는 스트림을 열지 않는다(제품 동작 — `checkPermission` 만). 마이크 표시등을 관찰하려면 사이트 권한을 "묻기" 로 되돌린 뒤 ⑨ 를 눌러야 한다 → QA 리포트 §6 `NV-4B-3` 절차에 이 전제를 더해야 한다(stage-qa-agent).
3. **Mock `ready` 활성 세션의 시각 기준** — 요청 본문 `readyAt` 기준 2분 전 (H4-5). 서버 시계를 쓰면 브라우저 Mock 에서 즉시 방치 정리되어 재현이 불가했다.
4. **QA-4B-003 범위** — QA 가 실패를 본 2개 테스트 외에 같은 대기 방식의 5개 테스트도 함께 바꿨다(e2e 실시계 Toast 대기 전부, 단정 변경 0). 재현 조건(01시대 유휴)을 이 세션에서 만들지 못했다 — 판정은 QA 기록 재분석 + 메커니즘 근거다. 실기기·일반 창 확인(Plan §13.5-③ 4단계)은 `D4-143` 목록 추가를 권고한다.
5. **T4 캐시 미적용** (권고 항목) — H4-5 사유.
6. 이 단위는 **design-agent Visual Gap**(Spec §21.3 매트릭스 · §21.2 프레임 · 320 클래식 Home 버블 보조 줄 픽셀 확인)이 남아 있다 (CLAUDE.md 최우선 규칙 5).

## H4-11 VG-H4-09 — 버블 보조 줄 말줄임 (`D4-147`, 2026-11-07, development-agent)

- **변경**: `packages/ui/src/bubble/SpeechBubble.css` 한 곳. 오른쪽 padding 을 컴포넌트 지역 변수 `--haru-bubble-padding-end`(기본 `--bubble-padding-x`, dismissible = `--icon-button-size + --bubble-dismiss-inset`)로 한 곳에서 정하고, `.haru-bubble__hint` 에 `margin-inline-end: calc(-1 * 그 값)` + `overflow: hidden` + `text-overflow: ellipsis` (`nowrap` 유지, `Text` 1줄 말줄임과 같은 조합). → 보조 줄 박스 끝 = **버블 가장자리**, 넘칠 때만 말줄임. 새 토큰 0 · arbitrary 값 0. 근거 주석 `D4-147` · `VG-H4-09` · `R-SHADOW-1` 점검.
- **실측 (Home, 수정 전 → 후)** — 보조 줄 `clientWidth`/`scrollWidth`:
  | 환경 | 버블 L–R | 전 | 후 | 렌더 픽셀 diff (전체 프레임) |
  |---|---|---|---|---|
  | 클래식 320×568 | 39–281 | 186/228, 잉크 x281=139·x282=202 (버블 밖) | 226/228 → `…` 말줄임, 잉크 끝 ≈x277, x281~ 배경 | 80px (x269–282 · y115–122, 말줄임 자리만) |
  | 오버레이 320×568 · 320×852 | 39–296 | 201/228 | 241/241 (안 잘림) | **0** |
  | 오버레이·클래식 393×852 · 600×800, 클래식 320×852 | — | — | 안 잘림 | **0** |
- **테스트**: `e2e/scrollbar-classic.spec.ts` (클래식 320×568 — 박스 끝 ≤ 버블 끝 281 · overflow hidden · 말줄임 걸림 · 버블 바로 바깥 4px 띠를 글자 투명 토글과 비교해 동일 = 잉크 0), `e2e/home.spec.ts` (오버레이 320 — `scrollWidth ≤ clientWidth` · 글자 끝 ≤ 296 · 전문 일치). 수정 전 CSS 로 두 테스트 모두 **실패 확인**(칸 기준 단순 `overflow: hidden` 도 home 테스트에서 실패한다).
- **검증**: typecheck · lint · lint:boundaries(위반 0) · format:check · build · assert:no-mocks 통과 · `pnpm test` 2513/173 · `playwright test` 단독(포트 4319) **558 passed (12.3m)** · `e2e/__screenshots__` 변경 0 (기존 미추적 `session-exceptions.spec.ts/` 뿐, `--update-snapshots` 미사용).
- **참고 (승인 필요 아님, 관찰)**: 클래식 320 의 말줄임 `…` 끝 점이 버블 오른쪽 아래 radius 22 곡선 근처에 놓인다(잉크는 버블 안). design-agent Visual Gap 에서 육안 확인 권고.

## H4-12 U-2 — 자르는 끝을 곡선 안쪽으로 (`D4-148`, 2026-11-07, development-agent)

- **변경**: `packages/ui/src/bubble/SpeechBubble.css` `.haru-bubble__hint` 한 줄 — `margin-inline-end: calc(-1 * var(--haru-bubble-padding-end) + var(--space-2))` (명세 `docs/design/stage-4b-visual-gap-h4.md` §3.1). 기존 토큰 `--space-2`(8)만 사용 · 신규 토큰 0 · arbitrary 값 0. 근거 주석에 `D4-148` · `U-2` 추가(`D4-147` 문단의 "버블 가장자리" → "클립 끝"). `overflow: hidden` · `text-overflow: ellipsis` · `nowrap` 그대로. `R-SHADOW-1`: 박스 안 그림자 요소 없음.
- **실측 (테스트 단정)**: 오버레이 320×568 — 버블 R 296 · 보조 줄 박스 R **288** · 문구 끝 283 ≤ 288(여유 5) · `scrollWidth ≤ clientWidth`(말줄임 없음) · 전문 일치. 클래식 320×568 — 버블 R 281 · 박스 R **273** · 말줄임 걸림(`scrollWidth > clientWidth`) · 박스 끝 오른쪽 띠 x273–284 에 보조 줄 잉크 0(글자 투명 토글 비교 동일).
- **테스트 (기존 2건 갱신, 새 파일 0)**: `e2e/home.spec.ts` "320 에서 버블 보조 줄이 말줄임 없이 전부 보인다" — `hintRight === bubbleRight − 8 === 288` · `textRight ≤ hintRight` 추가, 제목에 `D4-148` 병기. `e2e/scrollbar-classic.spec.ts` — `hintRight === bubbleRight − 8 === 273` 단정, 잉크 띠 `x = hintRight`, `width = bubbleRight − hintRight + 4`. **현행 `D4-147` CSS 에서 두 테스트 실패 확인** (288 기대 / 296 수신 · 273 기대 / 281 수신) → 변경 후 통과.
- **검증**: typecheck · lint · lint:boundaries · build · format:check · assert:no-mocks 통과 · `pnpm test` 2513/173 · `playwright test` 단독(포트 4319 재사용) **557 passed / 1 failed (12.3m)** · `e2e/__screenshots__` 변경 0 (미추적 `session-exceptions.spec.ts/` 기존분뿐, `--update-snapshots` 미사용).
- **실패 1건 — U-2 무관 (원인 미조치, 보고)**: `e2e/recording-measure.spec.ts:25` 측정판 ⑧⑨ — `expect(logged).toStrictEqual([])` 에 Chromium 콘솔 경고 *"inter-latin-wght-normal.woff2 was preloaded using link preload but not used within a few seconds"* 1건이 잡힘. 단독 재실행 4회 모두 재현, **`D4-147` CSS 로 되돌려도 동일 실패**(A/B) → 이번 변경과 무관. H4-11 실행(558 passed) 이후 생긴 환경/선행 변경 요인으로 보이며 범위 밖이라 수정하지 않았다 (QA 판단 필요).

## H4-13 OBS-4B-9 — 측정판 콘솔 단정을 측정판 출력으로 좁힌다 (`D4-149`, 2026-11-07, development-agent)

- **변경 (테스트만, 제품 코드 0)**: `e2e/recording-measure.spec.ts` `fromMeasureBoard(message, page.url())`. 기존 제외(`[vite]` · React DevTools 안내)에 더해 **스크립트 위치가 없는 브라우저 발신 메시지** = `location()` 이 `url === 문서 URL && lineNumber 0 && columnNumber 0` 인 것만 제외. 문구 매칭이 아니라 발신 위치 기준이며, `url: ''` 은 제외하지 않는다(좁히지 않음). 근거 주석에 `D4-149` · `OBS-4B-9` 와 실측값 기록.
- **기준 근거 (실측, 임시 프로브 spec — 삭제함)**: preload 경고 `{type: warning, url: 'http://127.0.0.1:4319/__dev/ui/recording-measure', line 0, column 0}` ↔ Vite `/@vite/client:882` · React DevTools `node_modules/.vite/deps/react-dom_client.js:15804` — 스크립트 메시지는 모듈 URL + 실제 줄 번호를 갖는다.
- **재현 (QA 절차)**: development-agent 가 4319 에 dev 서버를 직접 띄움 → 수정 전 spec **통과** → `pnpm --filter @haru/design-tokens run build` (1회, 서버 실행 중) → 수정 전 spec **실패**(preload 경고 1건) → 수정 후 **3/3 통과** (매 회 같은 프로브가 경고 발생을 함께 확인).
- **약화하지 않았다는 증명**: `RecordingMeasurePage` 함수 본문에 `console.warn('OBS-4B-9 TEMP …')` 임시 주입 → 수정된 spec **실패**(`"warning: OBS-4B-9 TEMP injected measure-board output"` 수신) → 백업본으로 원복(`cmp` 동일, 문자열 0건) → 통과. 실험 뒤 내 dev 서버(PID 87918/87961)만 종료, 4319 LISTEN 0. 5173/5174 미접촉(단 design-tokens 재빌드 1회 + `pnpm build` 1회가 5174 에 HMR 될 수 있음).
- **검증**: typecheck · lint · lint:boundaries(794 modules, violations 0) · build · format:check · assert:no-mocks 통과 · `pnpm test` 2513 passed · `playwright test` 단독(Playwright 자체 서버 4319, 다른 Playwright 프로세스 0) **558 passed (13.3m)** · `e2e/__screenshots__` 변경 0(미추적 `session-exceptions.spec.ts/` 기존분뿐) · `apps/api` · `supabase` 미생성. stage-qa-agent `OBS-4B-9` 재검증 요청.

## H4-14 QA-4B-005 — `openReady` 대기를 단계별로 나눈다 (`D4-150`, 2026-11-08, development-agent)

- **변경 (테스트만, 제품 코드 0)**: `apps/web/__tests__/session-recording.test.tsx` · `session-prompts.test.tsx` 의 `openReady`, `session-exceptions.test.tsx` 의 `startFromHome`(같은 절차, `openReady` 가 호출) — Reading Context 확인 뒤 기본 1000ms `findByRole('button', { name: copy.record.start })` 한 번이던 대기를 세 단계로 나눴다: ① `waitFor` 경로 `/^\/session\/[^/]+$/`(세션 생성 mutation → 이동) ② `waitFor` `.haru-session:not(.haru-session--pending)` 존재(상세 query pending Spinner 종료) ③ 기존 `findByRole(Start recording)`. 세 파일에 같은 코드·근거 주석(`QA-4B-005` · `D4-150` · 실측 964ms). 공용화 안 함.
- **근거**: QA §R2-9.2 — 확인 → 녹음 버튼 지연 유휴 85~155ms · 부하 284~964ms, 25/25 도달(멈춤 0), 매번 pending Spinner 를 거침. 지연이 생성·이동·상세 query 에 걸쳐 있으므로 단계마다 기본 창을 따로 주면 한 창에 몰리지 않는다.
- **약화 아님**: 기존 단언(녹음 버튼 등장)은 그대로 마지막에 남고, 앞의 두 단계는 단언을 **추가**한 것이다. timeout 값 변경 · retry · skip · `.only` · 전역 설정 변경 0.
- **검증**: 세 파일 `vitest run` 3 files / 73 passed · `pnpm typecheck` 통과 · `pnpm lint` exit 0 · prettier check 통과 · `pnpm test` 173 files / 2513 passed · **부하 재현 절차**(`yes > /dev/null` ×8 + `apps/web` 전체 `vitest run` 3회) **3/3 통과** (109 files / 1703 passed, 62.3s · 64.0s · 63.3s). Playwright 미실행(지시). `apps/api` · `supabase` 미생성. stage-qa-agent `QA-4B-005` 같은 부하 절차로 재검증 요청.

## H4-15 QA-4B-006 — 같은 유형 대기 전수 수정 (`D4-153`, 2026-11-08, development-agent)

### H4-15-1. "같은 유형" 기준

한 번의 기본 1000ms `findBy*` / `waitFor` 가 **아래 단계 중 둘 이상을 순서대로** 거쳐야 도달하는 대상을 기다리는 곳.

| 단계 | 관찰 지점 (끼워 넣는 중간 대기) |
|---|---|
| ⓐ Route Guard 판정 — 로그인 상태 진입 시 `me` 조회 동안 Guard Spinner(`appCopy.guard.loadingLabel`) | Guard Spinner 소멸 (`waitForGuard`) |
| ⓑ 화면 마운트 + 화면 query (서재 overview · 오늘 카드 · 동의 문서 · 세션 상세 …) | 원래 단언 / 세션 화면은 `.haru-session:not(.haru-session--pending)` (`D4-150` ②) |
| ⓒ mutation 과 그것이 일으키는 이동 — `D4-150` ① 선례대로 **한 단계** | 경로 (`pathname`) |
| ⓓ mutation 뒤에 이어지는 **조회** (열린 세션 Detail · `me` 재조회) | 요청 로그에 그 조회가 찍힘 |

- `QA-4B-006` 자체(`library-entry-screens:73`) = ⓐ + ⓑ. 로그 DOM 이 Guard Spinner 상태였다.
- **제외(단일 단계)**: 이미 마운트된 화면 안의 query 하나 · mutation 하나의 결과 · mutation → 이동(경로 단언) · 시트/다이얼로그 동기 열림 · Layout TopBar/탭바(Guard 밖이라 동기) · **미인증 진입**(세션이 `null` 로 `render()` 의 act 안에서 정해져 Guard 가 동기 판정) · 이미 단계별로 나뉜 곳.
- **제외(과도 프레임)**: 단계 **사이**의 Loading 프레임을 잡는 테스트(`library-screen` Loading Skeleton · `home-stage3` `loading`). RTL 은 대기마다 macrotask 1회를 비우므로 중간 대기를 끼우면 잡으려던 프레임이 지나간다 → 그대로 둠.

### H4-15-2. 대상 (14개 파일, 테스트만)

| 파일 | 수정 |
|---|---|
| `library-entry-screens` | `renderAt` 끝에 ⓐ — 진입 테스트 12건 전부 (`:73` 포함) |
| `library-screen` | `renderLibrary` 끝에 ⓐ (Loading 테스트는 도우미 미사용 → 제외) |
| `library-sheets` | `renderLibrary` 의 shelves 대기 앞에 ⓐ |
| `home-settings` | `/settings` 진입 7건에 ⓐ (Home TopBar·탭 이동·`SettingsMenu` 직접 렌더는 제외) |
| `home-stage3` | `waitForTrack` 앞에 ⓐ + 트랙을 거치지 않는 데이터 진입 10건(서재 섹션 · 버블 · 주간 칩 · empty/error/offline · 캐시 · `session-already-active`)에 ⓐ. 탭바 4건·`loading` 은 제외 |
| `consent-screens` | `renderSignedIn` 끝에 ⓐ · 동의 기록 → 온보딩 경로 5곳에 ⓓ(`POST /v1/consents` **뒤의** `GET /v1/me`) · 가입 → 동의 경로 앞에 ⓓ(`GET /v1/me`) |
| `onboarding-screens` | `renderApp` 에서 `signIn: true` 일 때만 ⓐ (Trial 은 동기 판정) |
| `session-start-blocked` | `confirmFromHome` · `startFromLibrary` 앞에 ⓐ · `ready` 이동 2건에 ⓑ(pending 종료) · `SESSION_ALREADY_ACTIVE`/Detail 실패 5건에 ⓓ(Detail 요청) · `ONBOARDING_INCOMPLETE` 5곳에 ⓓ(`me` 재조회 수) |
| `session-ready` | `firstStartButton` 앞에 ⓐ · `startFromHome`·서재 시작 경로 뒤 ⓑ · 캐시 배너 · 서재 진입 앞에 ⓐ |
| `session-permission` | `openReadingContext` · `openBookSheet` 앞에 ⓐ (경로 → `.haru-record` 는 이미 2단계 — 제외) |
| `session-notices` | `mount` 의 트랙 대기 앞에 ⓐ |
| `session-recording` | `openReady` 트랙 대기 앞에 ⓐ (`H4-14` 는 확인 뒤만 나눴다) · 재진입 `reenter` · 직접 진입 → 홈 2건 · 오류 화면 진입 2건에 ⓐ |
| `session-prompts` | `openReady` 트랙 대기 앞에 ⓐ |
| `session-exceptions` | `waitForHome` 앞에 ⓐ · `openConversation` 링크 이동 뒤 경로 → ⓑ · 복구 후 마운트 1건에 ⓐ |

- 세션 파일의 `waitForGuard` 는 `.haru-session` 밖의 `Loading` 상태만 센다 — 세션 화면 pending Spinner 도 이름이 `Loading` 이라 ⓐ 와 ⓑ 를 다시 한 창에 묶지 않기 위해서다.
- 도우미는 파일마다 같은 코드·근거 주석(`QA-4B-006` · `D4-153`)으로 둔다 (`H4-14` 와 같이 공용화 안 함).

### H4-15-3. 제외한 파일

| 파일 | 사유 |
|---|---|
| `src/app/__tests__/router.test.tsx` · `__tests__/auth-screens.test.tsx` | 미인증 — Guard 가 `render()` act 안에서 판정. 이후 대기는 mutation 하나 또는 mutation → 이동 |
| `src/app/guards/__tests__/guard-integration.test.tsx` | 대기 대상이 Guard 판정 결과 자체(경로 · `<p>`) — 화면 마운트 없음, 단일 단계 |
| `src/app/providers/__tests__/providers.test.tsx` | Mock 모듈 동적 import 1단계 |
| `sessionRecorderEnvironment.test.ts` · `upload-queue.test.ts` · `usePushPermission.test.tsx` · `useHealth.test.tsx` | 화면·이동 없음, 단일 비동기 작업 |
| `packages/**` | `findBy*`/`waitFor` 없음 |

### H4-15-4. 약화 아님

- 원래 단언은 전부 그대로 마지막에 남는다. 추가한 것은 중간 단계 단언뿐이다. 중간 단언 일부는 기존 최종 단언과 같은 값을 **먼저** 기다린다(예: `count(ME) - before === 1` 을 기다린 뒤 기존 `toBe(1)` 그대로).
- timeout 값 · retry · skip · `.only` · 전역 설정 변경 0 (diff 의 `timeout` 일치는 주석뿐). Product Code 0 — 변경 파일 = `apps/web/__tests__/*.test.tsx` 14개.

### H4-15-5. 검증 (참고용 — QA 재검증 대상)

- 변경 파일 = `apps/web/__tests__` 14개뿐(QA 리포트 이후 mtime 기준, `apps` · `packages` 전체) · `apps/api` · `supabase` 미생성.
- `pnpm typecheck` 통과 · `pnpm lint` exit 0 · 14파일 prettier · eslint 통과 · `pnpm test` **173 files / 2513 passed**.
- 부하 절차(`yes > /dev/null` ×8 + `apps/web` 전체 `vitest run`) **5/5 통과** — 각 109 files / 1703 passed, 64~71s. `yes` 잔여 0. Playwright 미실행(지시).
- stage-qa-agent 에 `QA-4B-006` 같은 부하 절차 재검증 요청.
