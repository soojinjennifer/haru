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
