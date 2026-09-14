# HARU Frontend Implementation Plan (Design → Build Order)

Status: APPROVED (2026-09-14, user) — Stage 0 산출물 (Rev: #33 · C-19 반영)
Based on: `docs/decisions/stage-0-approvals.md` (기존 문서보다 우선), `docs/FIGMA_SCREEN_MAP.md`, `docs/COMPONENT_MAP.md`, `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_TOKEN_MAP.md` (2026-09-14), `PLANNING.md` §5, `docs/ARCHITECTURE.md` §2, `docs/API_CONTRACTS.md` §4–§5; Scope: **Frontend-only — CONFIRMED (사용자, 2026-09-14)**, `CLAUDE.md`, `.claude/rules/frontend.md` §1·§5, `.claude/rules/qa.md`
Author: design-agent (2026-09-14)

라벨: `CONFIRMED (사용자 결정 2026-09-14, #id)` = 사용자 결정 · `CONFIRMED` = PRD·Figma 확정 · `가값 (P-xx)` = 승인 로그 §4 가값 · `D-xx` = 승인 로그 §3 수용 예외 · `RECOMMENDED` = design-agent 제안 (사용자 미결정 세부) · `NEEDS DECISION` = 미결정

## 0. 전제와 사용법

- **Frontend-only — CONFIRMED (사용자, 2026-09-14)**: `UI/Feature → Query/Mutation → API client interface → Mock Adapter` (Http Adapter 는 Backend 연동 시점). 인증은 `AuthGateway`, 녹음 업로드는 `recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 등 **interface + Mock Adapter** 로만 구현하고 Supabase JS 를 직접 사용하지 않는다 (rules/frontend §1). Mock fixture 는 `apps/web/src/mocks/` 에만 둔다 (UI 하드코딩 금지, rules/frontend §5).
- 이 문서가 **Stage 번호의 단일 기준**이다. COMPONENT_MAP 의 Stage 열은 이 문서를 따른다.

| Stage | 제목 (사용자 확정 Frontend-only) |
|---|---|
| 0 | Frontend Architecture + Figma Mapping + Agent Setup + Design System + API Contract Planning |
| 1 | Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure |
| 2 | Auth + Consent + Onboarding + Child Profile |
| 3 | Home + Activity Card + Library + Book Selection + Recommendation |
| 4 | Storytime Session + Recording Client + Pause/Resume + Prompt Drawer + Local Recording + Upload UX |
| 5 | Reflection + Async Analysis Status + Short Feedback |
| 6 | Personalization + Profile Update + Recommendation Loop |
| 7 | 4-Week Report + History + Highlight Audio + PDF UX |
| 8 | Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능(데이터 관리·탈퇴 필수, 동의 이력 보기 = 선택 기능 C-19, C-15) + Mock 데모 웹 프리뷰 배포(C-18) + Backend Handoff Package → **STOP** |

Stage 0 = 이 문서를 포함한 design-agent 5종 + plan-agent 문서 (구현 없음).

**승인된 기술·운영 전제** (모두 CONFIRMED (사용자 결정 2026-09-14)): pnpm workspaces + Node LTS (#6) · Tailwind CSS v4 CSS-first `@theme` (#29) · Playwright (E2E·스크린샷, #28) · MSW 미사용, 도메인별 `Mock<Domain>Api` (#8) · Supabase JS Client 미사용 (#27) · Dark mode 제외 (#20) · Capacitor 는 **Stage 4 에서 추가** — Stage 1–3 웹 전용, `apps/mobile` 은 Stage 4 에 생성 (#7) · 폰트 Apple=시스템(SF Pro) / 그 외=Inter (#11) · 아이콘 Lucide + HARU 전용 Figma SVG (#21) · 차트 inline SVG, 제스처·애니메이션 CSS/Pointer Events, dev 전용 UI gallery route (#9) · 반응형 = 모바일 레이아웃 + 가운데 480px 앱 컬럼, 세로 고정 (#12) · 캐릭터·책 표지 에셋 사용 권리 확보 (C-17).

**가값 운영** (승인 로그 §4, #10-④·#22): P-01–P-16 은 가값으로 구현하고 **Stage 1 구현 완료 후 Orchestrator 가 항목별로 하나씩** 사용자 승인(유지 / 수정 / 디자이너 대기 유지)을 받는다 (§1.7). 가값은 FAIL 사유가 아니며 stage-qa-agent 가 남은 목록을 기록한다.
- 이 문서는 **디자인 관점의 빌드 순서·Mock 상태·디자인 차단 요인·Visual QA 기준**만 정한다. Stage 범위·AC 는 plan-agent 의 `docs/plans/stage-N-plan.md` 가 우선한다.
- 각 Stage 착수 시 design-agent 가 `docs/design/stage-N-design-spec.md` 를 작성한다 (design-agent 규칙 §7).
- **Mock scenario key 의 단일 기준은 `docs/API_CONTRACTS.md` §5.4 Scenario Key Catalogue** 다. 이 문서의 표는 §5.4 machine key 만 쓰고, rules/frontend §5 표시명은 key 옆에 병기한다: SUCCESS=`success`, LOADING=`loading`, EMPTY=`empty`, ERROR=`error`, RETRY=`retry`, recording upload success=`recording-upload-success`, recording upload failure=`recording-upload-failure`, analysis pending=`analysis-pending`, analysis completed=`analysis-completed`, analysis failed=`analysis-failed`, report eligible=`report-eligible`, report not eligible=`report-not-eligible`. 표 열 제목(SUCCESS · LOADING · EMPTY · ERROR / RETRY)은 표시명이다. Deprecated alias(default, slow, upload-failure …)는 사용하지 않는다. §5.4 에 전용 key 가 없는 경우는 `error` + error code 지정(예: `RECORDING_NOT_ALLOWED_FOR_MODE`), replay test, 또는 OAQ 결정 항목으로 표시한다.
- 실제 Backend 가 있어야만 검증되는 부분(실 인증 Provider, 서버 동의 강제, Storage 업로드 수신, STT/AI 분석 결과, 카드 생성 Job, push 발송, PDF 생성, 삭제 cascade 등)은 **`BACKEND_INTEGRATION_PENDING`** 으로 기록한다. 이는 **디자인 차단 요인이 아니며** Stage 8 Backend Handoff Package 에 1:1 로 넘긴다 (rules/qa).
- **Visual QA** = `get_screenshot` 결과(Figma node) ↔ 구현 스크린샷 비교, 393×852 viewport. 캡처·비교 도구 = **Playwright** — CONFIRMED (사용자 결정 2026-09-14, #28). 폰트는 Apple=SF Pro / 그 외=Inter (#11) 이므로 Figma(SF Pro) 비교 기준 렌더는 Apple 시스템 폰트 환경이며, Inter 렌더의 허용 오차·실행 환경은 Stage 1 Plan 에서 정한다. Figma placeholder 데이터 불일치(M-36)는 비교 대상에서 제외. 캡처 환경을 실제로 실행하지 못한 checkpoint 만 `NOT VERIFIED` (rules/qa).
- 공통 금지: Figma 에 없는 화면을 임의 디자인하지 않는다. **Figma 누락 화면은 해당 Stage 의 plan/design 단계에서 Orchestrator 가 화면마다 사용자에게 ① 디자이너 Figma 요청 ② design-agent 명세 중 무엇으로 할지 묻고, 승인 후에만 디자인·구현한다** — CONFIRMED (사용자 결정 2026-09-14, C-13). 예외: 공통 상태 화면·컴포넌트 상태는 design-agent 명세로 Stage 1 에서 먼저 구현 (#22, `가값 (P-10)`).
- `consent-revoked` scenario, `skipped_consent_revoked` 값, 동의 철회 UI·Contract 는 **범위에서 제거** — CONFIRMED (사용자 결정 2026-09-14, C-4, 법무 L-03). 이 문서의 어떤 Stage 에도 쓰지 않는다.

---

## Stage 1 — Frontend Foundation + Shared UI + Router + Layout + Design Tokens + Mock Infrastructure

### 1.0 Foundation 전제 (CONFIRMED (사용자 결정 2026-09-14))
- 저장소·도구: pnpm workspaces + Node LTS (#6), Tailwind CSS **v4** CSS-first `@theme` (#29), Playwright (#28), import 경계 lint 도구(구체 도구 Stage 1 Plan, #9).
- 앱: `apps/web` 만 생성. **`apps/mobile` 은 만들지 않는다** — Capacitor 셸은 Stage 4 (#7).
- 아이콘: `lucide-react` 추가(ISC, 버전 고정은 Stage 1 Plan) + HARU 전용 Figma SVG export + Google/Apple 공식 브랜드 에셋 (#21).
- 폰트: `--font-sans` = `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (`system-ui` 를 Inter 앞에 두지 않음), Inter self-host, `SF-Pro.ttf` 저장소·빌드 포함 금지 (#11).
- 에셋: 캐릭터·책 표지 사용 권리 확보 (C-17). 이미지 최적화 포맷·해상도는 Stage 1 Plan.
- dev 전용 **UI gallery route** (Production 제외)로 Shared UI·토큰·공통 상태를 확인한다 (#9). Storybook 은 도입하지 않는다.
- Dark mode 없음, `color-scheme: light` (#20).

### 1.1 Tokens (`packages/design-tokens`) — 3-tier CONFIRMED (사용자 결정 2026-09-14, #10)
1. Primitive: palette 12 (violet `#ac93c4` 미사용, #19), ink/mist/dusk/paper, white alpha 3단계 (a50·a74·a90), ink alpha 3단계 (TOKEN_MAP §2)
2. Semantic color (TOKEN_MAP §2.6) — `--color-action-primary-bg` = teal + 흰 라벨 (D-01), `--color-fg-secondary` = `가값 (P-01)`, 비텍스트(진행 바·별점·칩 경계·배지 글자) = `가값 (P-02)`
3. Capability color (TOKEN_MAP §2.7): `-bg`·`-chart` = Tag 색 (#19), `-fg` = `가값 (P-02)`
4. Typography: iOS text style 11종 (최소 11px) + weight 5종 + `--font-sans` (#10, #11)
5. Spacing scale, layout gutter `가값 (P-13)`, touch min, 아이콘 크기 `가값 (P-09)`, 컴포넌트 크기(버튼 lg `가값 (P-15)`, medallion `가값 (P-16)`)
6. Radius 6단계 (`--radius-surface` `가값 (P-12)`), shadow 5종 + highlight, material fill/blur/fallback, 배경 gradient (stop `가값 (P-14)`), glass 라벨 대비 `가값 (P-11)`
7. 신규 토큰 (이름 CONFIRMED #10): focus ring `가값 (P-03)`, status colors `가값 (P-04)`, scrim `가값 (P-05)`, z-index `가값 (P-06)`, motion duration/easing `가값 (P-07)`, safe-area `가값 (P-08)`, opacity-disabled (Figma 0.5). Breakpoint `--bp-md` 600 / `--bp-lg` 1024, 앱 컬럼 최대폭 480, 최소 폭 320 은 **값 CONFIRMED** (#12)
8. **가값 토큰은 정의에 `provisional` 주석** (승인 로그 §4 규칙 1). 컴포넌트는 토큰만 참조
9. Tailwind v4 `@theme`: semantic 만 노출, 기본 네임스페이스 초기화, arbitrary value lint 금지 (TOKEN_MAP §1.1)

### 1.2 Shared UI 빌드 우선순위 (`packages/ui`)

| 순위 | Component | 이유 (다음 Stage 의존) | Figma 기준 node |
|---|---|---|---|
| 1 | **Text** + font stack | 모든 컴포넌트 기반 | `17:298` |
| 2 | **Icon** (일반 = Lucide, HARU 전용 = Figma SVG export, 브랜드 로고 = 공식 에셋, 크기 `가값 (P-09)`) | 버튼·탭·헤더 | `50:157` (HARU 전용만) |
| 3 | **Surface** (material rest/raised/pressed, fill glass/strong, fallback) + **AppBackground** | 모든 카드·버튼의 재질 | `17:332`, `16:24` |
| 4 | **Button** (glass/accent × md/lg × rest/hover/pressed/disabled/**focus**/**loading**) + ButtonGroup | 모든 화면 CTA | `17:20`, `86:245`, `86:372` |
| 5 | **IconButton** (44 hit area) | 헤더 | `78:158` |
| 6 | **TopBar** (large/inline/centered/pill) | 모든 Stack·Fullscreen 화면 | `139:2734`, `179:1726–1778`, `29:75` |
| 7 | **Layouts**: `TabLayout`, `FullscreenLayout`, `StackLayout`, 앱 컬럼 컨테이너(safe area) | Router | 화면 frame 구조 |
| 8 | **BottomTabBar** — Library / Home(가운데) / Progress, Session 탭 없음 (#15, D-02) | TabLayout | `25:87`, `140:2971` (`110:522` 탭바 사용 안 함) |
| 9 | **Spinner / Skeleton** | Loading 상태 (전 Stage) | Figma 누락 → design-agent 명세 (#22, `가값 (P-10)`) |
| 10 | **ErrorState** (+Retry), **EmptyState** | Error/Empty 상태 (전 Stage) | Figma 누락 → design-agent 명세 (#22, `가값 (P-10)`) |
| 11 | **InlineAlert / Banner** (tone: info · success · warning · error · offline) | 동의·오프라인·업로드 | Figma 누락 → design-agent 명세 (#22, `가값 (P-10)`), status 색 `가값 (P-04)` |
| 12 | **Toast** | 저장·재시도 피드백 | Figma 누락 → design-agent 명세 (#22, `가값 (P-10)`) |
| 13 | **TextField + FieldGroup** (label, trailing action/accessory, helper, **error**, disabled) | Stage 2 Auth | `76:417` |
| 14 | **Checkbox / CheckboxGroup** (checked/unchecked/error/focus) | Stage 2 동의 | `179:1742` |
| 15 | **Tag** (tone, size sm/xs) | 배지·Pagetag | `76:440`, `139:2410–2412` |
| 16 | **Chip** (selected, filled/outline/glass) | 회고·Context·온보딩 Step | `90:626`, `40:316` |
| 17 | **RadioGroup** (card) | 설문 | `179:1788` |
| 18 | **ProgressBar** | 온보딩 진행 | `179:1779/1780` |
| 19 | **PageIndicator** | 덱·캐러셀 | `88:789` |
| 20 | **SpeechBubble** (tail top/bottom-right) | CharacterBubble (S2–S4) | `88:721` |
| 21 | **Sheet + Scrim** | S3 서재 시트, S4 Drawer (S1 에서 만들면 S2 동의 문서 보기에도 사용) | `163:1807`, `88:960` |
| 22 | **Dialog / ConfirmDialog** | **S1 구현** — 사용처: S4 녹음 폐기·S8 삭제 | Figma 누락 |

S2 이후로 미룸 (RECOMMENDED): SwipeDeck(S2), SelectTrigger(S2), InfoRow·DividerWithLabel·TextLink 변형(S2), ListGroup/ListRow 기본 행(S2 — 설정 목록 "Log out", C-16), ListRow media·meta 변형·SectionHeader·Carousel·Toggle(S3), TextArea·StarRating(S5), StatTile(S7).

**공통 상태 (P-10)**: 9–12행과 22행(Dialog), 모든 인터랙티브 Shared UI 의 focus·error·loading 상태는 Figma 가 아니라 **design-agent 명세(Stage 1 design spec)로 먼저 구현**하고 기존 토큰·컴포넌트만 사용한다 — CONFIRMED (사용자 결정 2026-09-14, #22). 디자이너는 이후 Figma 에 반영할 수 있다.

### 1.3 Mock / Dev 기반
- API client interface + 도메인별 `Mock<Domain>Api` + scenario switch (dev 전용, 방식은 Stage 1 Plan, MSW 미사용 #8) — plan-agent 소관. `AuthGateway`·`recordingApi` (`MockRecordingApi` / `HttpRecordingApi`) + `UploadTransport` (`MockUploadTransport` / `TusUploadTransport`) 도 interface + Mock Adapter 골격. 디자인 요구: scenario 전환(`loading` · `empty` · `error` · `retry` · `offline`)으로 상태 컴포넌트를 실제 화면 컨텍스트에서 결정적으로 재현 가능해야 함.
- Shared UI·토큰 swatch·공통 상태 확인용 **dev 전용 UI gallery route** (Production 제외) — CONFIRMED (사용자 결정 2026-09-14, #9). Storybook 은 도입하지 않는다. §1.7 가값 승인 시 이 gallery 화면을 사용자에게 제시한다.

### 1.4 Mock scenarios (Stage 1)
| 대상 | Scenarios |
|---|---|
| `GET /v1/health` | `success`, `loading`, `error`, `retry`, `offline` |
| 공통 상태 컴포넌트 데모 | `loading`(Skeleton), `empty`, `error`, `retry`(실패 후 성공), `offline`(Banner) |

### 1.5 Design blockers (Stage 1 착수 전)

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 없음 (health 포함 전부 Mock).

디자인 차단 요인: **없음**. 이전 차단 항목 D-1 폰트(#11), D-2 대비(#18 ① + D-01, ②③④ = P-01–P-03), D-3 토큰 정규화(#10), D-4 신규 토큰(#10, 값 = P-03–P-09), D-5 breakpoint·최대폭(#12), D-6 내비게이션(#15, D-02), D-7 아이콘 소스(#21), D-8 Dark mode(#20), D-10 공통 상태(#22, P-10) 모두 사용자 결정 완료 (2026-09-14). 디자이너 대기 항목은 가값으로 진행한다 (#10-④).

### 1.6 Visual QA checkpoints (Playwright, #28)
| Figma node | 비교 대상 | 비고 |
|---|---|---|
| `17:20` Button 8 variants | Button gallery | Accent 흰 라벨 유지 (D-01) — 차이 없음이 기대값 |
| `17:332` / `16:24` HARU Material | Surface 3 material | blur·그림자 레이어 |
| `25:87` Screen/Tab Bar 3 variants | BottomTabBar | Library / Home / Progress (D-02). variant 이름 Report ↔ 라벨 Progress 는 이름 차이일 뿐 시각 동일 |
| `76:440` Tag, `90:626` Select, `40:316` Button/Filter | Tag, Chip | |
| `76:417` Input 4 variants | FieldGroup + TextField | |
| `88:721` Bubble (꼬리·radius·fill 만) | SpeechBubble | 문구 제외 |
| `88:789` Pagenation, `163:1590` Record Control(시각만, S4 에서 재검) | PageIndicator | |
| `17:366` Foundations | 토큰 swatch 페이지 | 색·타입 스케일 |
| 추가 기준 | focus ring, 320px reflow, 600/1024px 앱 컬럼(최대 480) 가운데 정렬, 200% 텍스트 확대, reduced-motion, 공통 상태 화면 | Figma 없음 → Stage 1 design spec 기준 |

### 1.7 가값 승인 단계 (Stage 1 구현 완료 후, Stage 2 착수 전) — CONFIRMED (사용자 결정 2026-09-14, #10-④·#22)

Stage 1 구현·QA 후 Orchestrator 가 dev UI gallery 화면으로 아래 항목을 **하나씩** 제시하고 `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지` 승인을 받는다. 결정 값은 승인 로그 §4 와 `docs/DESIGN_TOKEN_MAP.md` 에 반영하고 `provisional` 주석을 제거한다. 가값 자체는 Stage 1 FAIL 사유가 아니다.

| 순서 | # | 항목 | 가값 (TOKEN_MAP §4.1) |
|---|---|---|---|
| 1 | P-01 | 보조 텍스트 색 `--color-fg-secondary` | 현재 Figma `#7d9291` |
| 2 | P-02 | 비텍스트: 진행 바·별점·칩 경계·배지 글자(`--color-capability-*-fg`) | 현재 Figma 값 |
| 3 | P-03 | focus ring `--color-focus-ring` · width · offset | `--haru-ink-700`, 2px, 2px |
| 4 | P-04 | status 색 info/success/warning/error | design-agent 제안 |
| 5 | P-05 | scrim | Figma `misc/alert-overlay` |
| 6 | P-06 | z-index 스케일 | design-agent 제안 |
| 7 | P-07 | motion duration / easing | 로컬 프로토타입 기반 제안 |
| 8 | P-08 | safe-area inset 토큰 | `env(safe-area-inset-*)` |
| 9 | P-09 | 아이콘 크기 `--size-icon-sm/md/lg` | 16 / 20 / 24 |
| 10 | P-10 | 공통 상태 화면·컴포넌트 상태 디자인 | Stage 1 design spec |
| 11 | P-11 | glass·tinted 표면 위 `text-button` 라벨 대비 (Glass 버튼·PromptPill·"Question 1 of 10") | 현재 Figma `#5e7370` |
| 12 | P-12 | `--radius-surface` | 22px |
| 13 | P-13 | `--layout-gutter` | 24px |
| 14 | P-14 | 배경 gradient 중간 stop 위치 | 46% |
| 15 | P-15 | 버튼 lg 높이 `--size-button-lg` | 56px |
| 16 | P-16 | 캐릭터 medallion 크기 `--size-medallion-sm/md/lg` | 136 / 188 / 232px |

---

## Stage 2 — Auth + Consent + Onboarding + Child Profile

### 2.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | SelectTrigger, SwipeDeck, InfoRow, DividerWithLabel, TextLink, PasswordToggle, ListGroup/ListRow 기본 행(설정 목록) | `179:1740`, `179:1781–1783`, `179:1759`, `179:1839`, `163:2145` |
| 2 | Domain | CharacterMedallion(sm/md/lg), CharacterIllustration, SurveyQuestionCard, CharacterBubble(기본), **CapabilityDiamondChart**(누락, inline SVG), **PersonaCard**(누락) | `179:1703`, `179:1819`, `179:1783` |
| 3 | Feature | SocialAuthButtons(Google 공식 로고 + **Apple 공식 가이드 버튼**), SignUpForm(**보호자 정보만**), LogInForm, PasswordResetForm(누락), GuardianConsentForm(누락, **5항목**), VpcStep(Mock 슬롯), OnboardingWizard(**5단계**), ProfileResultView(누락), GrowthCapabilityPicker(누락), SettingsMenu(**로그아웃만**) | |
| 3a | Page-only | **Home skeleton** — HomeHeader(AppHeader: wordmark `26:39` + settings IconButton `26:44` → `/settings`) + EmptyState 안내. 로그인 후·온보딩 완료 후 **착지 화면** — CONFIRMED (사용자 결정 2026-09-14, #33). Activity Card 덱·기타 Home 콘텐츠·**BottomTabBar 는 Stage 3** | `26:21` 헤더 영역만 |
| 4 | Pages | HomePage `/` (skeleton, #33), WelcomePage `179:1701`, SignUpPage `179:1724`(아이 섹션·체크박스 제외), LogInPage `179:1820`, ForgotPassword/ResetPassword(누락), GuardianConsentPage(누락), OnboardingIntroPage `179:1748`, OnboardingStepPage `/onboarding/:step` (slug = PLANNING §9.2, RECOMMENDED) — Step 1 `child-info`(`179:1740` 필드 + 누락 필드), Step 2–4(누락), Step 5 `179:1770`, OnboardingSavedPage `179:1809`, ProfileResultPage(누락), GrowthCapabilityPage(누락), SettingsPage(누락, 로그아웃 1행) | |

**Stage 2 결정 사항** (모두 CONFIRMED (사용자 결정 2026-09-14)):
- **동의 (C-1·C-2·C-3·C-4)**: 필수 ① 이용약관 ② 개인정보처리방침 ③ 아동 음성·성장 데이터 처리 보호자 동의(별도 체크), 선택 ④ 마케팅 수신, 추가 ⑤ 파일럿(베타) 참여 동의(필수/선택·문구 = 법무 L-02). 각 동의는 문서 버전과 함께 기록. **이메일·Google·Apple 모든 가입 경로가 가입 직후 같은 동의 화면**을 거치며, 동의 기록 전 아이 정보는 서버로 보내지 않는다. 동의 화면 뒤 **VPC 단계 슬롯을 두고 Mock 으로 진행** (방식 = 법무 L-01). 동의 철회 UI 없음.
- **가입 (C-5)**: 가입 화면은 보호자 이름·이메일·비밀번호만. 아이 정보는 동의 기록 후 온보딩 Step 1.
- **온보딩 (C-9·C-6·C-7·C-8·C-10·C-11)**: PRD 5단계 — Step 1 아이 정보(성·이름 두 칸 D-03, 화면 호칭은 first name 만 / 성별 Girl·Boy·Prefer not to say 선택 항목, 기본 미선택 / 생년월 — 대상 3~9세) → 2 기질 카드 → 3 책·선호 주제 → 4 성장 목표 → 5 **Baseline Survey v1 10문항** (빈도 5단계 + 비채점 "Haven't had the chance to see this yet", D-04). 중도 저장·복귀. Exit 설문 없음. 소개 화면 "About 3 minutes · 10 cards" 문구는 전체 소요 시간에 맞게 수정(디자이너·카피).
- **Trial (C-12)**: 가입 전 온보딩 응답은 **기기 로컬 draft** 로만 저장 → 프로필 저장 시 가입 → 동의 → `POST /v1/onboarding/submit`. 다른 기기 이어하기·익명 계정 없음.
- **설정 (C-16)**: Home 상단 설정 아이콘 `26:44` 를 Stage 2 부터 연결, 목록은 **로그아웃** 1항목.
- **착지 화면 (#33)**: Stage 2 는 **Home skeleton** (HomeHeader = wordmark `26:39` + settings IconButton `26:44`, 본문 EmptyState 안내) 을 로그인 후·온보딩 완료 후 착지 화면으로 만든다. Activity Card 덱·기타 Home 콘텐츠·BottomTabBar 는 Stage 3 에서 추가한다.
- **Figma 누락 화면 (C-13)**: 비밀번호 재설정, 동의, Step 1 누락 필드·Step 2–4, Step 5 비채점 옵션 표시, 프로필 결과, 발전 역량, Trial 가입 유도, 설정 목록 — **화면마다 Orchestrator 가 사용자에게 ① 디자이너 Figma 요청 ② design-agent 명세 중 선택을 묻고 승인 후 작업**. Apple 버튼은 Apple 공식 가이드 버튼 (디자인 불필요).
- 역량 라벨 (#14), 에셋 권리 (C-17): 결정 완료.

### 2.2 Mock scenarios
> Scenario key 는 `docs/API_CONTRACTS.md` §5.3 그룹 / §5.4 Catalogue 이름을 그대로 쓴다. Stage 2 그룹: **me / consents / auth** = `consent-missing` · `consent-version-outdated` · `token-expired` · `provider-cancelled` · `onboarding-incomplete` · `vpc-pending` · `vpc-failed` / **onboarding / children profile** = `draft-resume` · `persona-fallback` · `child-limit-reached` · `capability-all-missing`. Trial 로컬 draft 는 scenario key 가 아니라 로컬 저장소 테스트로 검증한다 (§5.4, C-12).

| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Welcome / Log in | `success`: 로그인 → `/v1/me` 라우팅 (동의 없음 → `/auth/consent`) | `loading`: 버튼 loading | — | `error`(잘못된 자격 증명) → `retry`, `provider-cancelled`, `offline` | `token-expired` (`AUTH_TOKEN_EXPIRED` refresh), `onboarding-incomplete` (Route Guard → `/onboarding/:step`) |
| Sign up (보호자 정보만) | `success`: 가입 → `/auth/consent` | `loading` | — | `error`(이메일 중복, `VALIDATION_FAILED` 필드 에러) → `retry` | — |
| Guardian consent (5항목) | `success`: 동의 기록(문서 버전 포함) → VPC 슬롯 | `loading`: 문서 로딩 | — | `error` → `retry` | `consent-missing` (Me.consentStatus.missing, 소셜 가입 직후 포함), `consent-version-outdated` 재동의, 필수 미체크 시 버튼 disabled |
| VPC 단계 (Mock 슬롯, `/auth/verify-parent` RECOMMENDED) | 통과 → 온보딩 | `loading` | — | `error` → `retry` | `vpc-pending` (Route Guard 가 VPC 슬롯에 머묾), `vpc-failed` (의미·동작은 API_CONTRACTS §5.4 기준), 방식 확정 전 Mock (법무 L-01) |
| Onboarding intro/steps (5단계) | `success`: draft 저장 | `loading` | — | `error` → `retry`(입력 보존) | `draft-resume` (`currentStep=n`, onboarding 그룹), `consent-missing` → consent 로, Step 5 결측 응답 포함 제출 |
| Baseline saved → Profile | `success`: `ProfileResult` | `loading`: persona 생성 대기 ≤3s | — | `error`(`ONBOARDING_INCOMPLETE`) → `retry`, `child-limit-reached` | `persona-fallback`, `capability-all-missing` (한 역량 문항 전부 결측 → 해당 역량 `score: null` 의 프로필·다이아몬드 표시, 처리 규칙 Stage 2 Plan) |
| Growth capability | `success`: 설정 완료 | `loading` | — | `error` → `retry` | 기본값 = 최저 스코어 역량 |
| Settings (로그아웃) | `success`: 로그아웃 → Welcome | `loading` | — | `error` → `retry` | 로그아웃 시 로컬 draft·캐시 정리 |
| Home skeleton (착지 화면, #33) | `success`: HomeHeader + EmptyState 안내 표시 (로그인 후·온보딩 완료 후) | — | EmptyState 가 기본 본문 (콘텐츠는 Stage 3) | — | `onboarding-incomplete` → Route Guard 가 `/onboarding/:step` 으로 이동, 설정 아이콘 → `/settings` |

### 2.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 실제 Email/Google/Apple 인증 Provider, 서버측 동의 강제·`consent_events` 기록, VPC 실제 방식, 온보딩 스코어링, persona LLM 생성·금지어 검증.

해소된 이전 차단 요인: M-01/M-02/M-27 (C-1·C-2), M-03 (C-8, D-04), M-04 (C-10), M-05 (C-11), M-06/M-07/M-16 (C-13, C-9), M-28 (C-5·C-6, D-03), M-38 (C-7), M-13 (#14), 에셋 권리 (C-17).

남은 차단·확인 요인:
- Figma 누락 화면별 디자인 소스 선택 (C-13 — Stage 2 plan/design 단계에서 화면마다 사용자 확인).
- 한 역량의 문항이 모두 결측일 때 점수·다이아몬드 표시 (C-8 → Stage 2 Plan).
- 동의 문구·파일럿 동의 필수 여부(L-02), VPC 방식(L-01), 성 수집(L-07) — 법무. 화면은 Mock·가문구로 진행.
- Figma 수정 요청(디자이너): `179:1724` 아이 섹션·단일 체크박스 제거, 소개 문구.

### 2.4 Visual QA checkpoints (Playwright)
`179:1701`, `179:1724` (보호자 영역만 — 아이 섹션·체크박스 제거는 의도된 차이), `179:1748` (소개 문구 수정 시 의도된 차이), `179:1770` (선택 상태 1개, 6번째 옵션은 spec 기준), `179:1809`, `179:1820` — 393×852 비교. Home skeleton(#33)은 `26:21` 헤더 영역(wordmark·설정 아이콘)만 비교하고 본문 EmptyState 는 stage-2 design spec 기준. 누락 화면은 C-13 에서 승인된 디자인 소스(Figma 또는 stage-2 design spec) 기준.

---

## Stage 3 — Home + Activity Card + Library + Book Selection + Recommendation

### 3.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | ListGroup/ListRow, SectionHeader, Carousel, Toggle, ButtonGroup 확정 | `163:2145`, `30:74`, `113:1993`, `17:113`, `86:372` |
| 2 | Domain | CapabilityBadge, BookCover, BookShelfItem, BookListRow, BookSummary, PromptPill, PromptPhaseTag(M-29 결정 시), CoachingNote, ActivityOptionCard(compact/full, front/back), ReadingContextChip, StreakChip, CharacterBubble(home) | `76:440`, `113:1991/1992`, `86:324`, `86:397`, `86:512`, `86:538`, `26:40`, `88:922` |
| 3 | Feature | ActivityCardDeck(+오프라인 캐시 표시, "Start Session" → `/session/:sessionId`), PromptReveal(flip), ReadingContextSelector(누락), LibraryShelves, LibraryShelfSheet, BookDetailSheet("Start Session"), AddOwnBookForm(누락), GiftRequestFlow(누락), NotificationPreferencesForm·PushPermissionPrompt(누락, **Web + Mock** — 네이티브 Push Adapter 는 Stage 4, #7), SettingsMenu 에 **알림 설정** 항목 추가 (C-16) | |
| 4 | Pages | HomePage `26:21`+`163:2648` — Stage 2 skeleton(#33)에 StreakChip·캐릭터·버블·Activity Card 덱 콘텐츠와 **BottomTabBar**(Library / Home / Progress, D-02) 추가, LibraryPage `30:74`/`163:1669`/`145:1132`, AddOwnBookPage(누락), GiftRequestsPage(누락), NotificationSettingsPage(누락 — Stage 3 범위 CONFIRMED (사용자 결정 2026-09-14, C-16)) | |

Figma 누락 화면(Context 선택·시간 picker, 대화 전용/재독/소진 카드, 서재 Empty, 책 직접 등록, 증정 신청, 알림 설정·push 사전 안내, 설정 목록 확장)은 C-13 규칙으로 화면마다 디자인 소스를 사용자에게 확인한 뒤 작업한다.

### 3.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Home (HomeSummary + today card) | `success`: 3 options | `loading` ≤2s → Skeleton (NFR 2s) | `empty`: 카드 없음(07:00 이전) — 표시 방식 누락 | `error` → `retry` | `offline-cached-card` (최근 캐시 + Banner), `offline`, `reread-option` / `conversation-only-option`, `books-exhausted`, `session-already-active` (세션 복귀), `onboarding-incomplete` → onboarding |
| Card selection (Prompt reveal) | `success`: promptSet 2–3 | `loading` | — | `error`(`RESOURCE_NOT_FOUND`) → `retry` | Context 선택 저장 (`now`, `bedtime`, `custom_time`) |
| Library | `success`: owned/gifted/history | `loading` | `empty` (첫 사용자, 히스토리 없음) | `error` → `retry` | `gift-pending` 배송 상태, `user-entered-book` |
| Book detail / prompts | `success`: BookPrompts | `loading` | `empty` / `user-entered-book`: 범용 Prompt | `error` → `retry` | `session-already-active` (`POST /v1/sessions`) |
| Add own book | `success`: 등록 | `loading`: 검색 중 | `empty`: 검색 결과 없음 → 제목 직접 입력 | `error`(`VALIDATION_FAILED`) → `retry` | `user-entered-book` |
| Gift request | `success`: 신청 | `loading` | `empty`: 신청 내역 없음 | `error` → `retry`, `gift-duplicate` | `gift-pending` (`requested → shipped → delivered`) |
| Notification prefs / push (설정 목록 항목, Web + Mock) | `success`: 저장 | `loading` | — | `error` → `retry` | `push-permission-denied` |

### 3.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 07:00 Activity Card 생성 Job·Cold 추천 규칙, push 발송·기기 등록 수신, 증정 신청 처리·배송 상태 갱신, 표지 등 콘텐츠 운영 데이터.

해소된 이전 차단 요인: M-08 내비게이션·세션 탭 (#15, D-02), M-13 "Confidence" (#14), M-35 표지 권리 (C-17), T-4 capability 색 (#19), 알림 설정 Stage 배치 (C-16), Figma 누락 화면 디자인 방식 (C-13).

남은 디자인 차단 요인:
M-09 Prompt 노출 시점·flip, M-30 홈 구성(카드 배치·코칭·Context·streak 지표), M-31 카드별 역량 vs 일일 역량, M-29 PRE/POST/P.n 태그, M-14 Save/My Saved/Reading now/Rated, M-32 서재에서 바로 세션 시작, 홈 버블 CTA 여부, 덱 prev/next 버튼(제스처 대안), iOS Toggle 모양 vs HARU 스타일(COMPONENT_MAP §6), 그리고 누락 화면별 디자인 소스 선택(C-13 — Context 선택·시간 picker, 대화 전용/재독/소진 카드, 서재 Empty, 책 직접 등록·증정 신청, 알림 설정·push 사전 안내).

### 3.4 Visual QA checkpoints (Playwright)
`26:21` (카드 배치 결정 반영), `163:2648` 카드 1장 (overflow 수정 = 의도된 차이), `86:512` compact 카드, `86:482` flip back, `30:74` 상단 852px 영역 + 스크롤 하단, `163:1669` 시트, `145:1132` 시트, `113:1993` Default/Selected.

---

## Stage 4 — Storytime Session + Recording Client + Pause/Resume + Prompt Drawer + Local Recording + Upload UX

### 4.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 0 | Platform | **Capacitor 셸 `apps/mobile` 추가** + 네이티브 녹음 플러그인 Adapter(RecorderAdapter), 네이티브 Auth / Push Adapter (Stage 1–3 의 Web + Mock interface 뒤에 구현 교체), **portrait lock** — CONFIRMED (사용자 결정 2026-09-14, #7, #12). 플러그인 선정·버전은 Stage 4 Plan. 실기기 녹음 QA 는 이 Stage 부터 | — |
| 1 | Shared | Dialog/ConfirmDialog 재사용 (S1 구현), Sheet snap(Drawer) 추가 | `88:960` |
| 2 | Domain | RecordButton(idle/recording/paused/disabled/permission-denied), CharacterMedallion motion(idle/listening/celebrate), CharacterBubble(ready/complete), PromptCarousel, AttendanceStickerChip, UploadStatusBadge(누락) | `163:1590`, `28:73/74`, `88:757`, `88:929`, `29:79` |
| 3 | Feature | StorytimeSessionView(RecordingControls: Record·Done Reading·Pause/Resume, 경과 표시, 10분 리마인드 / **30분 자동 종료 = 실제 녹음 시간 기준(일시정지 제외), `MAX_RECORDED_SECONDS = 1800`** (#17-②)), PromptDrawer + 트리거, MicPermissionGate + ConversationOnlyMode, UploadQueueNotice/RecoveryNotice, SessionCompleteView | `28:51`, `88:960`, `29:62` 상단 |
| 4 | Pages | StorytimeSessionPage `28:51` (진입 = Home Activity Card · 서재 "Start Session", **`/session` 탭 페이지 없음** — #15, D-02), MicPermissionPage(누락), SessionCompletePage `29:62` 상단 | |
| 5 | Motion | record pulse, listening 표시, 완료·스티커, 버블 pop-in, reduced-motion 대체 (duration/easing `가값 (P-07)` 또는 승인된 값) | 프로토타입 `haru-pulse`/`haru-ring`/`haru-bar` [P] |

### 4.2 Mock scenarios (API + RecorderAdapter mock)

> Session 상태 모델(PRD 7상태 + `abandoned`, `mode`, `completedReason`, `analysisOutcome`, 별도 upload status, retry 는 상태 아님)은 CONFIRMED (사용자 결정 2026-09-14, #16) — 값 목록은 ARCHITECTURE §10 / API_CONTRACTS §2 기준, OAQ-17 의존 값은 결정 전 제외. 실기기 녹음 QA 는 Stage 4 부터 가능하며 수행하지 못한 항목만 `NOT VERIFIED` + 수동 절차, 실제 Storage 수신·서버 전이는 `BACKEND_INTEGRATION_PENDING`.
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Session create (ready) | `success`: bubble + prompts | `loading` | `empty`: prompts 0 (대화 전용·범용) | `error` → `retry` | `session-already-active` 복귀, `consent-missing` → 녹음 시작 차단, `onboarding-incomplete` |
| Recording controls | `success`: ready→recording→paused→recording→completed | `loading`: 권한 요청 / 녹음 시작 대기(≤1s) | — | `invalid-transition` → 서버(Mock) 상태 재동기화 | `mic-permission-denied` → permission page·대화만 하기, `recording-interrupted` (전화·route change 인터럽션 / Web background 경고), `abandoned` (10분 방치 → 리마인드 1회), `auto-timeout` (**실제 녹음 1800초 도달, 일시정지 시간 제외** — #17; 경계 1799/1800s), `crash-recovered` (상태·사유 값은 #16 확정 모델, ARCHITECTURE §10 기준) |
| Upload | recording upload success (`recording-upload-success`) → `analyzing` | `loading`: 업로드 진행 | — | recording upload failure (`recording-upload-failure`, 지속 실패), `upload-retry` (재시도 후 성공) | `offline-queued` (로컬 보관 `local_only`/`queued`), `upload-token-expired`, `recording-incomplete`, `upload-stalled-48h` |
| Complete | `success`: completionBubble + stickerAward | `loading`: 전이 대기 | — | `offline` → outbox 대기 표시, `retry` | 스티커 멱등 = **replay test** (동일 전이 재요청 시 중복 지급 표시 없음, scenario key 아님) |
| Prompt Drawer | `success`: prompts 2–3 | — | `empty`: Prompt 없음 안내 | — | 무음·무진동 |
| Conversation only | `success`: `ready → completed` | — | — | — | `error` + code `RECORDING_NOT_ALLOWED_FOR_MODE` |

### 4.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): Storage resumable 업로드 수신·complete 검증, 서버 세션 전이·abandoned sweeper, 48h push, audit log. (녹음 캡처 자체는 Frontend 범위 — 실기기 불가 시 `NOT VERIFIED`)

해소된 이전 차단 요인: `/session` 탭 진입 (#15, D-02 — 탭 없음), 30분 기준 (#17-②), Session 상태 모델 (#16), Capacitor 도입 시점 (#7), FR-21 세션별 녹음 삭제 UI 위치 (C-15 — Stage 8), Figma 누락 화면 디자인 방식 (C-13).

남은 디자인 차단 요인:
**M-25** 세션 버블 내용, **M-26** 상태별 컨트롤 화면(Done Reading·Pause/Resume·Discard/Submit 용도), Prompt Drawer 트리거, 대화 전용 흐름(OAQ-16), **캐릭터 경청·완료 애니메이션 에셋과 포맷**(DESIGN_SYSTEM §8, §9.2), 녹음 중 무한 모션 개수 규칙(§9.3-4), 네이티브 플러그인 선정(Stage 4 Plan), 그리고 누락 화면별 디자인 소스 선택(C-13 — 상태별 세션 화면, 마이크 권한, 업로드/오프라인/48h/크래시 복구, 10분·30분 안내).

### 4.4 Visual QA checkpoints (Playwright + 실기기 수동 확인)
`28:51` (M-25/M-26 결정 반영 후), `163:1590` Record/Pause, `163:1601`, `88:960` Drawer, `88:757` ready 버블, `29:62` 상단(≈ y 0–470), `78:353` 헤더 채택 시. 모션은 Figma 기준 없음 → stage-4 design spec 의 duration/easing 표 기준 녹화 비교.

---

## Stage 5 — Reflection + Async Analysis Status + Short Feedback

### 5.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | StarRating, TextArea | `91:693`, `91:715` |
| 2 | Domain | AnalysisStatusCard(누락), CharacterBubble(short feedback) | |
| 3 | Feature | ReflectionForm(별점·칩 5·주제 입력·자유 후기 카드·skip), ShortFeedbackView(push deep link) | `91:691` |
| 4 | Pages | ReflectionPage `29:62` 하단, ShortFeedbackPage(누락) | |

### 5.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Reflection | `success`: 제출 → 완료 | `loading` (`GET /v1/reflection-form`) | `empty`: 선택 없이 제출(skip) | `error` → `retry`(입력 보존), `offline` 대기 | `reflection-already-submitted` (멱등 재제출 = 동일 응답), `invalid-transition` (completed 이전) |
| Analysis / short feedback | analysis completed (`analysis-completed`: shortFeedback, metricsPreview) | analysis pending (`analysis-pending`: 24h 안내, 폴링) | — | analysis failed (`analysis-failed`: 재시도 중 안내) | `analysis-low-quality` ("다음엔 조용한 곳에서" 안내, 리포트 발행 기준에서 제외됨 — #17-③), `analysis-not-available` (conversation_only), `recording-deleted` (`skipped_audio_deleted` — 표현 방식 OAQ-17 결정 전) |

### 5.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): STT·역량 분석 파이프라인 결과, short feedback 생성·safety 검증, 분석 완료 push.

디자인 차단 요인:
M-15 잔여(자유 후기 "다음 카드", skip 버튼, 칩 문구 "Stay Focus", 칩=on/off 확정), 분석 상태·짧은 피드백·저품질 안내 화면 전체, push deep link 진입 화면, 진단 표현 금지 copy 리뷰.

### 5.4 Visual QA checkpoints (Playwright)
`29:62` 하단 Feedback Card `91:691` (별점·칩 선택 상태), 자유 후기·분석 상태는 stage-5 design spec 기준.

---

## Stage 6 — Personalization + Profile Update + Recommendation Loop

### 6.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | ListGroup 설정 변형, ConfirmDialog 재사용 | — |
| 2 | Domain | CapabilityDiamondChart 업데이트 표시(최신 스냅샷), PersonaCard 변경 표시, 추천 사유 라벨(warm) | **Figma 누락** |
| 3 | Feature | SettingsMenu 를 **전체 설정**으로 확장 (아이 프로필 수정·설문 재응답·발전 역량 변경 등 — C-16), ChildProfileEditor(설문 재응답 = OnboardingWizard 재사용), GrowthCapabilityPicker(설정 진입) | **Figma 누락** (`26:44` 진입만) — 화면별 디자인 소스 C-13 |
| 4 | Pages | SettingsPage(항목 추가), ChildProfileEditPage, GrowthCapabilitySettingsPage | **Figma 누락** — 화면별 디자인 소스 C-13 |

### 6.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Profile (updated) | `success`: 최신 스냅샷 + `profileUpdatedAt` | `loading` | `empty`: 스냅샷 1개(설문만) | `error` → `retry` | `cold-to-warm`, `persona-changed` |
| Settings / child edit | `success`: 저장 | `loading` | — | `error`(`VALIDATION_FAILED`) → `retry` | 설문 재응답 중도 이탈 복귀 — Catalogue 의 `draft-resume` 은 **onboarding 그룹** key 이므로 재응답이 onboarding endpoint 를 재사용할 때만 적용. 별도 endpoint 면 Stage 6 Plan 에서 key 추가 요청 (API_CONTRACTS §5.3 profile update 그룹에는 없음) |
| Growth capability change | `success`: `SetGrowthCapability` | `loading` | — | `error` → `retry` | 다음 카드 반영 안내 |
| Activity card (warm) | `success`: `recommendationPhase=warm`, `reasonKey` | `loading` | — | `error` | `cold-to-warm`, `difficulty-lowered` |

### 6.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 세션 분석 기반 스냅샷·페르소나 갱신, recommendation 규칙 v2 (Warm).

디자인 차단 요인:
프로필 업데이트 노출 방식, 설정 IA·화면 전체, 추천 사유 표시 여부(Figma 없음), 다이아몬드·페르소나 컴포넌트(S2 에서 확보되어야 함).

### 6.4 Visual QA checkpoints (Playwright)
Figma 기준 없음 → stage-6 design spec + S2 에서 승인된 CapabilityDiamondChart/PersonaCard 스크린샷을 baseline 으로 회귀 비교.

---

## Stage 7 — 4-Week Report + History + Highlight Audio + PDF UX

### 7.1 빌드 순서
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Shared | StatTile, SelectTrigger(기간) | `163:2545`, `31:118` |
| 2 | Domain | CapabilityProgressRow(M-12 결정), WeeklyReadingChart(M-10 채택 시), NotableQuoteCard, ReportArchiveCard, CapabilityDiamondChart(overlay), HighlightClipPlayer(누락), AttendanceCalendar(채택 시) | `163:2607`, `163:2551`, `163:2633`, `110:844` |
| 3 | Feature | GrowthReportOverview, ReportDetailView(누락), ReportPdfAction(생성·다운로드·공유) | `31:102`, `110:522` (탭바 제외) |
| 4 | Pages | ReportOverviewPage `31:102`/`110:522` `/progress` — **탭 표시 이름 Progress** (#15, D-02; 경로명 RECOMMENDED, PLANNING §9.2; 기능 명칭 report 유지), ReportDetailPage `/progress/reports/:reportId` (누락, 경로명 RECOMMENDED) | |

**리포트 상수** — CONFIRMED (사용자 결정 2026-09-14, #17, contracts 상수로 표시): 발행 기준 = **녹음 세션 최소 3회** + **누적 녹음 1시간 이상** (PRD §7.7). STT 실패·저품질 세션(`analysisOutcome: excluded_low_quality`)은 세션 수·누적 시간 **모두에서 제외**. 4주 주기 = **첫 세션 완료일부터 28일 단위 반복**. 대화 전용 세션 포함 여부·시간대 경계 세부는 Stage 7 Plan. 진행도 UI 는 이 상수를 contracts 에서 읽고 화면에 하드코딩하지 않는다.

### 7.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Report overview | report eligible (`report-eligible`: archive 1+) | `loading` | `empty`: 첫 주기 진행 중 / archive 0 | `error` → `retry` | report not eligible (`report-not-eligible`: 진행도 녹음 분·세션 수, 경계 3599/3600s · 2/3 세션, 저품질 세션이 섞여 기준 미달이 되는 경우), `report-deferred` 이월 안내, `report-delayed` 지연 안내 |
| Report detail | `success`: ReportDetail 전체 | `loading` | `empty`: 인용 0개, 클립 0개 | `report-delayed` (`REPORT_NOT_READY`), `report-not-eligible`, `error` → `retry` | persona history 1건(변화 없음). `excluded_low_quality` 세션은 발행 기준에서 제외 (#17-③, 이전 OAQ-12 해소) |
| Highlight clip | `success`: 재생 | `loading`: signed URL 요청 | `empty`: 클립 없음 | `error` → `retry` | `clip-expired` / `recording-deleted` → "expired" 표시 |
| PDF | `success`: ready → 다운로드·공유 | `pdf-generating` (폴링) | — | `error` → `retry` | `share-cancelled` (공유 시트 취소) |

### 7.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 리포트 scheduler·eligibility 집계·narrative 생성, PDF 생성, 하이라이트 클립 추출·signed URL, (M-11 채택 시) 이메일 발송.

해소된 이전 차단 요인: M-13 역량 라벨 (#14), T-4 capability·chart 색 (#19), OAQ-12 발행 기준·주기·저품질 제외 (#17), 탭 라벨 Progress (#15), Figma 누락 화면 디자인 방식 (C-13).

남은 디자인 차단 요인:
**M-10** 리포트 탭 IA(주간 Progress 채택 여부) + 주간 지표 contract 부재, **M-11** 이메일, **M-12** strong/growing/emerging·+18%·80% 표현, 차트 대체 텍스트 규칙, OAQ-13 하이라이트 클립 보관 기간(만료 표시), 그리고 누락 화면별 디자인 소스 선택(C-13 — 4주 리포트 상세, 미충족·지연 상태, 하이라이트 클립 플레이어·만료, PDF 상태·공유 UX).

### 7.4 Visual QA checkpoints (Playwright)
`31:102` (852px 상단 + 스크롤), `110:522` 채택 부분(아카이브 카드 `110:844`, 달력 채택 시), `163:2607` Growth themes, `163:2633` Moment 카드. 수치 placeholder 불일치(M-10/M-36)는 비교 제외.

---

## Stage 8 — Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능 + Mock 웹 프리뷰 배포 + Backend Handoff Package → STOP

### 8.1 빌드 순서

> **이월 기능 위치 = Stage 8** — CONFIRMED (사용자 결정 2026-09-14, C-15·C-19): **필수** = FR-21 데이터 관리 UI(P0: 보관 정책 안내·세션별 녹음 삭제·전체 삭제 요청), 탈퇴. **선택 기능 (C-19)** = 동의 이력 보기 — 여유가 있으면 읽기 전용 목록으로 구현, 미구현이어도 QA FAIL 아님. 설정 목록에 데이터 관리·탈퇴 항목 추가(동의 이력 보기는 구현 시에만) (C-16). **동의 철회는 범위에서 제거** (C-4, 법무 L-03).
| 순서 | 계층 | 항목 | Figma |
|---|---|---|---|
| 1 | Feature — 이월 (C-15) | **필수**: DataManagementPanel(FR-21: 보관 정책·세션별 녹음 삭제·전체 삭제 요청·진행 상태), AccountActions(탈퇴·플랜 표시 여부). **선택 기능 (C-19)**: ConsentHistory(읽기 전용 목록) | **Figma 누락** — 화면별 디자인 소스 C-13 |
| 2 | Pages — 이월 (C-15) | **필수**: DataManagementPage, AccountPage, LegalDocumentPage, SettingsPage 항목 추가 (C-16). **선택 기능 (C-19)**: PrivacyConsentPage(이력 보기) | **Figma 누락** — 화면별 디자인 소스 C-13 |
| 3 | 전역 | WCAG AA 감사 수정(대비·focus·label·reduced-motion·reduced-transparency — D-01 항목은 `PASS (accepted: D-01)`), 반응형 QA(320 / Figma 393 / 600 / 1024 이상, 480px 앱 컬럼, 웹 가로 화면 = 앱 컬럼), 로그아웃·삭제 시 로컬 녹음·캐시 정리 UX | DESIGN_SYSTEM §11–§12 |
| 4 | Deploy | **Mock 모드 웹 프리뷰만** 정적 호스팅에 배포 (시연·Backend Developer 인계용, 실제 아동 데이터 없음). 호스팅 서비스는 Stage 8 Plan. 앱 테스트 빌드(TestFlight·Play)·Backend 배포 없음 — CONFIRMED (사용자 결정 2026-09-14, C-18) | — |
| 5 | Handoff | Backend Handoff Package 디자인 입력: Stage 2–7 `BACKEND_INTEGRATION_PENDING` 목록, 화면 ↔ contract 매핑(FIGMA_SCREEN_MAP §1), 실 데이터 연동 시 재검증할 Visual QA 목록, 남은 가값 목록 → **STOP** | — |

### 8.2 Mock scenarios
| 화면 | SUCCESS | LOADING | EMPTY | ERROR / RETRY | HARU 필수·추가 scenario / 상태 |
|---|---|---|---|---|---|
| Data management | `success`: 요약(rawAudioDays 90, recordingsCount) | `loading` | `empty`: 녹음 0건 | `error` → `retry` | `deletion-already-requested`, `recording-deleted`, `deletion-processing` (`received → processing → completed/failed`), 로컬 미업로드 녹음 존재 경고 — Catalogue 의 `offline-queued` 는 **recordings 그룹**(Stage 4) key 이므로 데이터 관리 화면에서는 recordings Mock 상태를 함께 켜서 재현 (data management 그룹 key 아님) |
| Consent history (**선택 기능 (C-19)** — 구현 시에만 적용) | `success`: 이력 목록(항목·문서 버전·일시, 읽기 전용) | `loading` | `empty` | `error` → `retry` | 철회 UI·scenario 없음 (C-4). 미구현이면 이 행 전체 해당 없음 (QA FAIL 아님) |
| Account / delete | `success`: 탈퇴 요청 | `loading` | — | `error` → `retry` | `deletion-processing`; 탈퇴 확인 문구 입력 방식 채택 시(RECOMMENDED — 법무·디자인 확인) 입력 불일치 |
| Web preview (Mock 모드) | 배포 URL 에서 Stage 1–8 주요 흐름 Mock 동작 | — | — | — | scenario switch 노출 범위는 Stage 8 Plan |

### 8.3 Design blockers

`BACKEND_INTEGRATION_PENDING` (디자인 차단 아님): 삭제 cascade·Retention(90일) Job·RLS·암호화 검증 → Backend Handoff Package 에 1:1 등록 여부만 확인.

해소된 이전 차단 요인: 이월 기능 Stage 위치 (C-15), 동의 철회 (C-4), Dark mode (#20), 데스크톱 레이아웃 (#12 — 추가 없음), 배포 범위 (C-18).

남은 디자인 차단 요인:
누락 화면별 디자인 소스 선택(C-13 — 데이터 관리·탈퇴·약관 문서; 동의 이력 보기는 선택 기능 C-19 구현 시에만), 삭제 확인 문구·SLA 안내(법무), 탈퇴 = 전체 삭제 여부, 구독 표시 여부(P2), 동의 철회 미제공과 COPPA 권리 관계(법무 L-03, 결과에 따라 문서 갱신).

### 8.4 Visual QA checkpoints (Playwright)
Stage 1–7 전체 baseline 회귀 (Figma node 목록 = 각 Stage §x.4 합집합) × viewport 320 / 393 / 600 / 1024 + 텍스트 200% + reduced-motion. Figma 기준이 없는 화면은 승인된 stage design spec 의 스크린샷 baseline. **동의 이력 보기(선택 기능, C-19)는 Stage 8 exit·Visual QA 필수 항목이 아니다** — 구현한 경우에만 비교하며, 미구현은 FAIL 이 아니다.

---

## 9. Stage 별 Figma 누락 요약

각 Stage 의 plan/design 단계에서 Orchestrator 가 아래 화면마다 **① 디자이너 Figma 요청 ② design-agent 명세** 중 무엇으로 할지 사용자에게 묻는다 (C-13). 승인 전에는 디자인·구현하지 않는다. Stage 1 공통 상태만 #22 로 design-agent 명세가 이미 결정되었다. 디자이너에게 보낼 **기존 Figma 수정 요청**은 마지막 열에 모았다.

| 필요 Stage | 누락 화면 / 상태 (디자인 소스 C-13) | 기존 Figma 수정 요청 (디자이너) | 관련 불일치 |
|---|---|---|---|
| 1 | (없음 — 공통 상태 패턴·focus·error·loading 상태는 design-agent 명세, #22, P-10) | P-01–P-09 · P-11–P-16 가값 확정, Variable rename (§6.2), focus variant 추가(선택) | M-33, M-34 |
| 2 | 보호자 동의 5항목, VPC 슬롯, 비밀번호 재설정, 온보딩 Step 1 누락 필드·Step 2–4, Step 5 비채점 옵션, 프로필 결과·다이아몬드·페르소나, 발전 역량 제시·변경, Trial 가입 유도, 설정 목록(로그아웃) | `179:1724` 아이 섹션·단일 체크박스 제거 (C-1·C-5), 성별 옵션 Prefer not to say (C-7), 설문 소개 문구 (C-9), Apple 버튼은 공식 가이드 (디자인 불필요) | M-01, M-02, M-03, M-06, M-07, M-16, M-27, M-28, M-38 (모두 결정 완료) |
| 3 | Context 선택·시간 picker, 대화 전용/재독/소진 카드, 덱 prev/next, 서재 Empty·직접 등록·증정 신청, 알림 설정·push 사전 안내 | 책장 "Confidence" → 역량 라벨 (#14), 배지 "Emotion Day Day" 오타, Tab Bar variant Report → Progress (#15) | M-09, M-14, M-29, M-30, M-31 (미결정) · M-08, M-13 (결정 완료) |
| 4 | 세션 ready/recording/paused 화면, Done Reading·Pause/Resume, Prompt Drawer 트리거, 마이크 권한·대화 전용, 업로드·오프라인·48h·크래시 복구, 10분/30분 안내, 캐릭터 경청·완료 애니메이션 | — | M-25, M-26 (미결정) |
| 5 | 자유 후기 카드·skip, 분석 상태·짧은 성장 피드백·저품질 안내 | — | M-15 (미결정) |
| 6 | 프로필 업데이트 표시, 설정 전체(아이 프로필 수정·발전 역량 변경) | — | — |
| 7 | 4주 리포트 상세, 미충족·지연, 하이라이트 클립, PDF 상태 | `31:102` 차트 색 = capability 색 (#19), Growth themes 라벨 (#14) | M-10, M-11, M-12 (미결정) |
| 8 | 데이터 관리·삭제 확인, 계정·탈퇴, 약관 문서 (이월 필수, C-15) · 동의 이력 보기 = 선택 기능 (C-19) | — | — |
