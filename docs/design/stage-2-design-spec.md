# Stage 2 Design Spec — Auth · Consent · VPC 슬롯 · Onboarding 5단계 · Settings · Home skeleton

**Status: APPROVED (2026-09-25, user)** (작성 2026-09-23, design-agent)
**Based on**
- Figma HARU_MVP `YWWu3AFEJpRxvw0T5klq0k` — page `16:2`, section `179:1700`(Signup & Baseline survey) · section `31:204`(`26:21` Home 헤더), page `8:2` 컴포넌트. **조회·실측 일자 2026-09-23** (`179:1701` · `179:1724` · `179:1740` · `179:1748` · `179:1759` · `179:1770` · `179:1782` · `179:1789` · `179:1809` · `179:1820` · `163:2145`)
- `docs/plans/stage-2-plan.md` (Stage 2 Plan, 2026-09-23) — §2 In Scope · §5 · §7 · §8 · §9 · §11 · §15 Handoff · §16 D-1~D-17
- `docs/decisions/stage-2-approvals.md` §2(C-13 11건 명세 / 2건 디자이너) · §3(Stage 2 / Stage 2-B 분리)
- `docs/design/stage-1-design-spec.md` — 토큰·Shared UI 22종·공통 상태(P-10)·Layout·접근성의 **정본**. 이 문서는 그 위에 Stage 2 화면만 얹는다.

**개정 (2026-09-27, design-agent)** — QA 2회차 지시 반영 **2건만**. ① `S2-DESIGN-2`: §2.11 `/onboarding/saved` 의 여백 분배 규칙을 Figma `179:1809` **재실측(2026-09-27)** 에 맞게 수정 (`(flex spacer)` 를 일러스트↔제목 사이에 두었던 오류 → 일러스트 위 A / 제목 아래 B 로 3 : 2 분배). ② `S2-DESIGN-1`: §11.3 에 `AD-S2-15` · `AD-S2-16` 등록. 새 요구사항·새 화면·새 허용 차이·신규 토큰은 추가하지 않았다. `Status: APPROVED` 는 2026-09-25 승인 상태 그대로이며, **이 2건의 승인 범위 포함 여부는 사용자 확인 사항**이다.

**개정 2 (2026-09-27, design-agent)** — QA 3회차 문서 항목 **4건만** 반영. ① `S2-TOKEN-1`: 정의되지 않은 토큰 이름 `--space-7`·`--space-10` 참조 8곳 → Figma 재실측 후 **스케일 2단계 신규 제안**(§6.1) + 지점별 값 정정 (§2.1 · §2.2 · §2.3 · §2.8 · §5.3 · §2.11 말미 표). ② `QA-2-005`: `179:1813`(27/33) · `179:1831`(30) 제목 토큰을 `AD-6` 흡수표대로 `--text-title-1` 로 정정, 30→28 은 `AD-S2-17` 로 등록. ③ `QA-2-006`: §2.11 축소 순서를 실제 동작(spacer 최소값 → 스크롤)으로 정정. ④ `QA-2-007`: §2.11 에셋 이름 `hello-heart-full`, 검산 전제(제목 높이) 정정. **새 요구사항·새 화면·Stage 2-B 명세는 추가하지 않았다.** 이 개정은 `/onboarding/saved` · `/auth/log-in` 두 화면의 **구현 변경과 시각 baseline 재생성을 요구한다** (§14-11).

---

## 0. 이 문서를 읽는 법

### 0.1 라벨 (Stage 1 §0.1과 동일)

| 라벨 | 뜻 |
|---|---|
| `CONFIRMED (#id)` / `CONFIRMED (C-xx)` | 사용자 결정 |
| `CONFIRMED (Figma)` | Figma에서 값을 직접 확인 (조회 2026-09-23, 일부 2026-09-18) |
| `가값 (P-xx)` | 남은 가값 5건 — `P-01 · P-02 · P-04 · P-05 · P-16` |
| `D-0x` / `S1-G-x` | 승인된 수용 예외 |
| `Plan D-xx 전제` | **Stage 2 Plan §16의 미승인 권장안을 전제로 작성** — 승인 결과에 따라 이 절이 바뀐다 |
| `RECOMMENDED` | design-agent 제안 (사용자 미결정) |
| `신규 토큰 제안` | 값이 없어 이 문서가 처음 제안 — 승인 필요 |
| `NEEDS DECISION` | 사용자/디자이너/법무 결정 필요 |
| `허용 차이` | Figma ↔ 구현 차이를 사전 등록 — QA는 FAIL 처리하지 않음 (§11.3) |
| `Stage 2-B` | `C13-09`·`C13-10` 의존 — 이 문서에서 명세하지 않는다 |

### 0.2 권한 경계

- design-agent는 **Production Code를 작성하지 않는다.** 이 문서는 명세다.
- **Figma를 수정하지 않는다.** 디자이너 요청은 `docs/design/stage-2-designer-request.md` 와 §13.3에 모은다.
- 화면 값은 **토큰 이름으로만** 적는다. Figma 실측 수치는 "현황 사실"로만 적고 구현 값은 토큰을 거친다.

### 0.3 Stage 2 / Stage 2-B 분리 (approvals §3)

| 구분 | 범위 | 이 문서 |
|---|---|---|
| **Stage 2** | Auth · 동의 · VPC 슬롯 · 온보딩 Step 1~5 · `/onboarding/saved` · 설정 · Home skeleton · Trial 안내 | **명세함** (§1~§12) |
| **Stage 2-B** | `C13-09` 프로필 결과 · `C13-10` 발전 역량 제시 + `CapabilityDiamondChart` · `PersonaCard` · Plan D-2 · D-6 | **명세하지 않음.** 디자이너 Figma 도착 후 별도 Design Spec |

Stage 2-B 의존 항목은 각 절에서 `Stage 2-B` 로 표시하고, Stage 2에서 무엇을 대신할지(§12.1 전이 지점)만 제안한다.

### 0.4 Stage 1에서 확정되어 그대로 적용되는 사실

| 항목 | 내용 | 근거 |
|---|---|---|
| 화면 골격 | 스크롤 컨테이너는 **AppColumn 바깥(뷰포트 전 폭)**, `AppColumn` 안쪽 요소에 `overflow-*` 선언 금지, TopBar·BottomTabBar는 `position: sticky` | Stage 1 §2.2 |
| 공통 상태 | Loading(Skeleton 우선) · Empty · Error+Retry · Offline Banner · Toast · Dialog = **P-10 확정 명세** | Stage 1 §5 |
| 토큰 | 3-tier 정의표 = Stage 1 §3. Stage 2는 **semantic 토큰을 새로 만들지 않는다** (§6) | Stage 1 §3 |
| focus ring | `--color-focus-ring` 2px / offset 2px, `:focus-visible` 만 | Stage 1 §9.3 (P-03 확정) |
| 터치 타깃 | 최소 44×44. **TextField 입력 행 42px = `PASS (accepted: S1-G-2)`** | Stage 1 §9.3 |
| 시각 임계값 | `maxDiffPixelRatio 0.002` + `maxDiffPixels 200`, 영역 클립 baseline은 `Plan D-12 전제` | Stage 1 §10.3 |
| 가값 | 남은 5건 = `P-01 · P-02 · P-04 · P-05 · P-16` | Stage 1 §3.6 |
| BottomTabBar | Stage 2에서도 **마운트하지 않는다** | Plan §3.1 (#33) |

---

## 1. 대상 화면 (Figma node → route)

### 1.1 Stage 2 화면 16건

| # | Route | Page | Layout | 디자인 소스 | C-13 |
|---|---|---|---|---|---|
| 1 | `/auth/welcome` | `WelcomePage` | Stack (TopBar 없음) | **Figma `179:1701`** | — |
| 2 | `/auth/sign-up` | `SignUpPage` | Stack (TopBar `centered`) | **Figma `179:1724`** (보호자 영역만) | — |
| 3 | `/auth/log-in` | `LogInPage` | Stack (TopBar `centered`) | **Figma `179:1820`** | — |
| 4 | `/auth/forgot-password` | `ForgotPasswordPage` | Stack (TopBar `centered`) | 명세 | **C13-01** |
| 5 | `/auth/reset-password` | `ResetPasswordPage` | Stack (TopBar `centered`) | 명세 | **C13-01** |
| 6 | `/auth/consent` | `GuardianConsentPage` | Stack (TopBar `centered`, 하단 CTA) | 명세 | **C13-02** |
| 7 | `/auth/verify-parent` | `ParentVerificationPage` | Stack (TopBar `centered`) | 명세 (**내용 없는 슬롯**) | **C13-03** |
| 8 | `/onboarding` | `OnboardingIntroPage` | Stack (TopBar 없음) | **Figma `179:1748`** | — |
| 9 | `/onboarding/child-info` | `OnboardingStepPage` | Stack (TopBar `centered` + 진행바) | **Figma `179:1740`**(일부) + 명세 | **C13-04** |
| 10 | `/onboarding/temperament` | 〃 | 〃 | 명세 | **C13-05** |
| 11 | `/onboarding/books` | 〃 | 〃 | 명세 | **C13-06** |
| 12 | `/onboarding/goals` | 〃 | 〃 | 명세 | **C13-07** |
| 13 | `/onboarding/capability-items` | 〃 | Stack (TopBar `centered` + 진행바 + 덱) | **Figma `179:1770`** + 6번째 옵션 명세 | **C13-08** |
| 14 | `/onboarding/saved` | `OnboardingSavedPage` | Stack (TopBar 없음) | **Figma `179:1809`** | — |
| 15 | `/` | `HomePage` (skeleton) | Stack (탭 없음) — Home 헤더 | **Figma `26:21`** 헤더(`26:39` 워드마크 · `26:44` 설정) + 본문 명세 | **C13-13** |
| 16 | `/settings` | `SettingsPage` | Stack (TopBar `centered`) | 명세 | **C13-12** |

**화면이 아닌 상태 1건**: `C13-11` Trial 가입 유도 · draft 유실/만료 안내 — `/onboarding/*` 안의 상태로 명세한다 (§2.11).

### 1.2 Stage 2-B (이 문서 범위 밖)

| Route | 화면 | C-13 |
|---|---|---|
| `/onboarding/profile` | 프로필 결과 (다이아몬드 · 강점/growing edge · 페르소나 · null 축) | **C13-09** — 디자이너 Figma |
| `/onboarding/growth-capability` | 발전 역량 제시 + 축 탭 변경 | **C13-10** — 디자이너 Figma |

> Plan §9.1의 route 표는 15개(+`*`)이지만, 위 2건은 approvals §3에 따라 **Stage 2 router에 등록하지 않는다.** Stage 2 router = 14 route(`*` 포함). Stage 2-B에서 2건을 추가한다. — `NEEDS DECISION`(표기 정합, §13.1 ①)

### 1.3 Layout 선택 — Plan §9.1 "Fullscreen" 과의 불일치

Plan §9.1은 `/auth/*` · `/onboarding/*` 의 Layout을 **Fullscreen** 으로 적었다. 그러나 Stage 1 §2.3에서 `FullscreenLayout` 은 **스크롤 없음(overflow hidden)** 이고 사용처는 `/session/:id`(Stage 4)이며, `/auth/*` · `/onboarding/*` · `/settings` 는 **StackLayout** 으로 배정되어 있다.

**이 문서는 StackLayout을 채택한다.** 근거:
1. AC-2-59가 **320px + 텍스트 200% 확대 reflow** 를 요구한다. `overflow: hidden` 화면에서는 확대 시 콘텐츠가 잘려 충족 불가다.
2. 동의 5항목(§2.6)·온보딩 Step 1/3(§2.9·§2.11)은 콘텐츠 높이가 852px를 넘는다.
3. 소프트 키보드가 올라오면 입력 행이 가려진다 — 스크롤이 필요하다.
4. `FullscreenLayout` 을 쓰면 Stage 1의 "하단 고정 CTA는 스크롤 컨테이너 **내부**"(§2.2, 키보드 가림 방지) 규칙을 적용할 수 없다.

→ `NEEDS DECISION` (§13.1 ②). TopBar 유무는 위 표대로이며, Figma의 "전체 화면처럼 보이는" 인상은 **TopBar 없음 + 배경 gradient 전면**으로 만든다.

---

## 2. 화면별 레이아웃 구조

> 공통: 모든 화면은 `AppBackground` → 뷰포트 스크롤 컨테이너 → `AppColumn`(min 320 / max 480, 좌우 `--layout-gutter`) 안에 놓인다 (Stage 1 §2.2). 아래 "세로 흐름"은 `AppColumn` 안의 순서이며 모두 **세로 Auto Layout(gap 명시)** 이다. 고정 높이 컨테이너를 만들지 않는다.

### 2.1 `/auth/welcome` — Figma `179:1701`

```
[safe-top]
 (gap --space-10)   ← 40 · **신규 토큰 제안 §6.1**. Figma 94 — 압축 근거는 아래 마지막 주석
 CharacterMedallion  size=lg (232)  asset=hello-heart       ← 179:1703/1704, decorative
 (gap --space-8)
 Text  "HARU"            --text-large-title / --font-weight-heavy / --color-fg-primary   ← 179:1707
 (gap --space-2)
 Text  tagline 2줄       --text-subheadline / --color-fg-secondary  가운데 정렬   ← 179:1708 `가값 (P-01)`
 (gap --space-8)
 Button  variant=glass  size=lg  fullWidth  leadingIcon=brand/google   "Continue with Google"   ← 179:1709
 (gap --space-3)
 Button  variant=glass  size=lg  fullWidth  leadingIcon=brand/apple    "Continue with Apple"    ← Figma 없음 (C-13 확정: Apple 공식 가이드 버튼)
 (gap --space-3)
 Button  variant=accent size=lg  fullWidth  leadingIcon=mail           "Sign up with email"     ← 179:1715
 (gap --space-4)
 [Text "Already have an account?" + TextLink "Log in"]  가운데, gap --space-1-5   ← 179:1719–1721
 (flex spacer)
 Text  legal footnote  --text-caption-1 / --color-fg-secondary  가운데   ← 179:1722  `가값 (P-01)`
[safe-bottom]
```

- Figma 실측: medallion 232, 버튼 341×56(x=26) / 345×58은 다른 화면. **gutter 24 통일** → 폭은 `AppColumn` 100%. (`허용 차이 AD-10`)
- `179:1722` 는 **동의 기록이 아니다** (C-1·C-2). 단순 고지 문구이며, 실제 동의는 `/auth/consent` 에서만 기록한다. 이 문장 안의 "Terms"·"Privacy Policy" 는 `TextLink`(외부 링크, `Plan D-4 전제`).
- 순서 근거: Google → Apple → Email. Apple 버튼은 Apple 공식 "Sign in with Apple" 규격(로고·라벨·최소 높이·모서리)을 따르며 `Button` 의 glass 표면을 그대로 쓴다 (`Plan D-15 전제`). Apple 규격과 glass 표면이 충돌하면 **Apple 규격이 우선**이고 그 사실을 `허용 차이` 로 등록한다 — `NEEDS DECISION` (§13.1 ③).
- **상단 여백 40 의 근거** (Figma 재실측 2026-09-27 · `S2-TOKEN-1`): Figma 는 safe-top(56) → medallion(`179:1703` y=150) = **94**, medallion bottom(382) → "HARU"(`179:1707` y=450) = **68** 이다. 명세·구현은 이 두 구간을 `--space-10`(40) + `--space-8`(32) = **72** 로 압축한다. 회수한 **90** 은 Figma 에 없는 Apple 버튼(56 + gap 12 = **68**, `AD-S2-2`)과 하단 각주·프롬프트 행 여백(`AD-S2-16`)이 차지한다. 즉 40 은 Figma 94 의 흡수가 아니라 **버튼 1개 추가에 따른 세로 재분배 결과**다. Figma 94 로 되돌리려면 이 화면의 세로 구성을 다시 설계해야 하므로 **값 변경은 사용자·Orchestrator 결정 사항**이며, 이번 개정은 값을 바꾸지 않고 근거만 기록한다. 현 구현(`pt-10` = 40)은 이 명세와 일치한다.

### 2.2 `/auth/sign-up` — Figma `179:1724` (보호자 영역만)

```
TopBar  variant=centered   leading=IconButton(chevron-left, "Back")   title="Create your account"   ← 179:1726/1729
 (gap --space-6)
 SectionLabel  "YOU"        ← recipe (§4.7), 179:1733
 (gap --space-2)
 FieldGroup
   ├ TextField  label="Your name"      autoComplete=name          ← 179:1734 row1
   ├ TextField  label="Email"          type=email autoComplete=email inputMode=email
   └ TextField  label="Password"       type=password autoComplete=new-password
                trailingAction="Show"/"Hide"                      ← §4.8 (Plan D-14 전제)
 (gap --space-2)
 HelperText  "At least 8 characters."   --text-caption-1 / --color-fg-secondary   ← 179:1736
 (flex spacer, 최소 --space-10)   ← 40 = spacer **하한(floor)** · 신규 토큰 제안 §6.1
 Button  variant=accent size=lg fullWidth  "Create account"       ← 179:1746  (스크롤 컨테이너 내부 하단)
[safe-bottom]
```

- **`179:1737`–`179:1745` ("YOUR CHILD" FieldGroup + 단일 동의 체크박스)는 렌더하지 않는다** — `CONFIRMED (C-5 · C-1)`. 시각 비교에서 **사전 등록된 허용 차이**다 (`AD-S2-1`, §11.3).
- 제출 성공 → 항상 `/auth/consent` (C-2). 실패 → 필드 에러(§8) 또는 `InlineAlert tone=error`.
- **`--space-10` 은 이 화면의 렌더 값이 아니다** (`S2-TOKEN-1`): Figma `179:1724` 는 helper text 블록 bottom(326) → CTA(`179:1746` y=750) 사이가 **424** 여서 spacer 가 항상 하한보다 크다. 40 은 텍스트 200%·소형 화면에서 helper text 와 CTA 가 붙지 않게 하는 **하한**이며 간격 실측값이 아니다.

### 2.3 `/auth/log-in` — Figma `179:1820`

```
TopBar  variant=centered  leading=IconButton(chevron-left)  title 없음(투명)   ← 179:1828
 CharacterMedallion  size=md (188)  asset=headphones   ← 179:1822/1823  CONFIRMED (Figma 실측 188)
 (gap --space-6)
 Text "Welcome back"      --text-title-1 / --color-fg-primary        ← 179:1831 (Figma 30px → 28 흡수 · `AD-S2-17`)
 (gap --space-1-5)
 Text "Tonight's book is waiting."  --text-subheadline / --color-fg-secondary  ← 179:1832 `가값 (P-01)`
 (gap --space-10)   ← Figma **38** (`179:1832` bottom 390 → `179:1833` y 428) → 40 흡수 · 신규 토큰 §6.1
 Button variant=glass size=lg fullWidth leadingIcon=brand/google  "Continue with Google"  ← 179:1833
 (gap --space-3)
 Button variant=glass size=lg fullWidth leadingIcon=brand/apple   "Continue with Apple"   ← Figma 없음 (C-13)
 (gap --space-5)
 DividerWithLabel  "or with email"      ← 179:1839–1841  §4.5
 (gap --space-5)
 FieldGroup
   ├ TextField label="Email"    autoComplete=email
   └ TextField label="Password" type=password autoComplete=current-password trailingAction="Show"
 (gap --space-3)
 TextLink "Forgot password?"   우측 정렬    ← 179:1843 → /auth/forgot-password
 (flex spacer)
 Button variant=accent size=lg fullWidth  "Log in"   ← 179:1844
 (gap --space-4)
 [Text "New to HARU?" + TextLink "Create an account"]  가운데   ← 179:1845–1847
```

- Figma는 Apple 버튼이 없다 (M-16 Resolved). Apple 버튼 추가는 **의도된 차이** (`AD-S2-2`).
- **2026-09-27 정정 2건 — 구현 변경이 따라온다** (§14-11 ③): ① 제목 `179:1831` 은 **30px**(박스 h=36)이므로 `--text-title-2`(22/28)가 아니라 `--text-title-1`(28/34)이다 (`QA-2-005` · 등록 `AD-S2-17`). ② 부제 → 소셜 버튼 간격은 Figma **38** 이므로 `--space-10`(40, Δ+2)이다. 현 구현은 이 칼럼의 모든 형제 간격을 `gap-6`(24)로 통일해 두었다 → 제목 크기와 이 간격 2곳이 변경 대상이고 **시각 baseline 재생성이 필요하다**.

### 2.4 `/auth/forgot-password` — **C13-01 (명세)**

목적: 비밀번호 재설정 링크 요청. 계정 존재 여부를 노출하지 않는다.

```
TopBar variant=centered  leading=IconButton(chevron-left)  title="Reset password"
 (gap --space-6)
 Text  "Enter the email you use for HARU."  --text-body / --color-fg-primary
 (gap --space-5)
 FieldGroup └ TextField label="Email" type=email autoComplete=email
 (flex spacer)
 Button variant=accent size=lg fullWidth "Send reset link"
 (gap --space-4)
 TextLink "Back to log in"  가운데
```

**요청 성공 상태(같은 route, 뷰 교체)**

```
 Surface fill=strong radius=card padding=--space-6
   ├ 아이콘 배지 48  (Lucide `mail-check`, `--color-status-info-*` `가값 (P-04)`)
   ├ Text "Check your email"        --text-headline
   └ Text "If that email is registered, a reset link is on the way. The link works for a limited time."
                                     --text-subheadline / --color-fg-secondary
 (gap --space-5)
 TextLink "Back to log in"  가운데
```

- 문구는 **계정 존재 여부를 확인해 주지 않는다**(enumeration 방지). "We couldn't find that account" 류 금지.
- 재전송(resend) 버튼은 PRD·Figma 근거가 없어 **넣지 않는다**. 필요하면 별도 승인 (§13.1 ④).

### 2.5 `/auth/reset-password` — **C13-01 (명세)**

메일 링크로 진입한다(토큰은 URL). 링크 유효성은 진입 시 확인한다.

```
TopBar variant=centered  title="New password"   (leading 없음 — 링크 진입)
 FieldGroup
   ├ TextField label="New password"     type=password autoComplete=new-password trailingAction="Show"
   └ TextField label="Confirm password" type=password autoComplete=new-password
 (gap --space-2)
 HelperText "At least 8 characters."
 (flex spacer)
 Button variant=accent size=lg fullWidth "Save new password"
```

| 상태 | 표현 |
|---|---|
| **링크 만료·무효** | 콘텐츠 영역을 `ErrorState`(Stage 1 §5.3)로 교체. 제목 "This link isn't active anymore", 설명 "Reset links expire after a while.", 카드 내부 Button `variant=glass` **"Request a new link"** → `/auth/forgot-password` |
| 불일치 | 두 번째 필드 `error` + `errorText` "Both fields need to match." |
| 성공 | Toast "Password updated." → `/auth/log-in` 이동, 입력값 즉시 폐기(AC-2-64) |

### 2.6 `/auth/consent` — **C13-02 (명세)** · Privacy 핵심

목적: **아동 데이터 입력 화면에 들어가기 전** 보호자 동의 5항목을 개별로 기록한다 (AC-2-13).

```
TopBar variant=centered  title="Before we begin"   (leading 없음 — 뒤로 갈 수 없는 필수 단계)
 (gap --space-5)
 Text  intro  --text-body / --color-fg-primary
       "Please review each item. You can open any document to read it in full."
 (gap --space-5)
 Surface fill=strong radius=card padding-x=--space-5 padding-y=--space-2
   CheckboxGroup  legend="Consent items" (시각 숨김)
     ├ ConsentRow × N          ← N · 순서 · 라벨 · required 는 모두 API 응답 값
     │   ├ Checkbox (22)  hit area = 행 전체, 행 최소 높이 44
     │   ├ 본문 열
     │   │   ├ Text  document.title          --text-footnote / --color-fg-primary
     │   │   ├ Text  "Required" | "Optional" --text-caption-1 / --color-fg-secondary   ← 색 단독 금지
     │   │   └ TextLink "View" + icon `external-link`(--size-icon-sm)  → document.url (새 창)
     │   └ 행 구분선 1px --color-divider (행 사이에만)
 (gap --space-3)
 Text  버전 각주 "Version {version} · updated {date}"  --text-caption-2 / --color-fg-secondary  (문서별 1줄 또는 하단 요약)
 (flex spacer, 최소 --space-8)
 [하단 CTA 영역 — 스크롤 컨테이너 내부]
   Text  비활성 사유 (필수 미체크일 때만)  --text-caption-1 / --color-fg-secondary
         "Select the required items to continue."          ← id 로 버튼에 aria-describedby 연결
   Button variant=accent size=lg fullWidth "Continue"
```

| 규칙 | 내용 |
|---|---|
| 항목 수·필수 여부 | **`ConsentDocument.required` 값으로만** 결정한다. 화면에 5개를 하드코딩하지 않는다 (Plan §2.1 FR-02). 현재 기대값 = 필수 3(`terms_of_service` · `privacy_policy` · `child_voice_data`) + 선택 2(`marketing` · `pilot_participation`), 확정은 법무 **L-02** |
| "모두 동의" 일괄 체크 | **두지 않는다.** 아동 음성 데이터 동의는 개별 의사 확인이 필요하다 (C-1). PRD·Figma 근거도 없다 |
| 문서 열기 | 외부 링크 `target="_blank" rel="noopener noreferrer"` (`Plan D-4 전제`). 링크에 `external-link` 아이콘 + 시각 숨김 텍스트 "Opens in a new tab" |
| 버튼 비활성 | `disabled` 속성 대신 **`aria-disabled="true"` + 포커스 가능**으로 둔다. 이유 문구를 스크린리더가 읽을 수 있어야 한다 (§10) |
| 진행 차단 | 동의 기록(`POST /v1/consents`) 성공 전에는 `/onboarding/*` 의 **아동 데이터 입력·전송 경로로 넘어가지 않는다** (§2.12 순서) |

### 2.7 `/auth/verify-parent` — **C13-03 (명세, 내용 없는 슬롯)**

VPC 실제 방식은 법무 **L-01 미결**이다. 화면은 **문구·검증 수단이 나중에 교체될 수 있는 슬롯**으로 만든다.

```
TopBar variant=centered  title="One more step"
 Surface fill=strong radius=card padding=--space-6
   ├ 아이콘 배지 48 (Lucide `shield-check`, `--color-status-info-*` `가값 (P-04)`)
   ├ Text  제목      --text-headline
   ├ Text  본문 슬롯 --text-subheadline / --color-fg-secondary   ← copy 모듈 1개 키, 교체 지점
   └ [상태별 영역]
 (flex spacer)
 Button variant=accent size=lg fullWidth  "Continue"
```

| 상태 | scenario | 표현 |
|---|---|---|
| 안내(기본) | `success` | 위 기본 구성. Continue → Mock이 `verified` 로 전이 |
| 진행 중 | `vpc-pending` | 카드 안 `Spinner size=md` + Text "We're confirming this step." + `role="status" aria-live="polite"`. Continue 버튼 `loading` |
| 실패 | `vpc-failed` | 카드 안 `InlineAlert tone=error placement=inline` (`가값 (P-04)`) + 본문 "We couldn't complete this step yet." + Button `variant=accent` **"Try again"**. 온보딩 진입은 계속 차단(Guard) |

- 실패 문구에 사용자 귀책·판정 표현을 쓰지 않는다("verification failed", "invalid" 금지).
- 이 화면에서는 **아동 데이터를 입력받지 않는다.**

### 2.8 `/onboarding` 소개 — Figma `179:1748`

```
[safe-top]
 (gap --space-6)   ← 구현 현황 기록: Figma 54 (`179:1750` y=110 − 56) ↔ 명세·구현 24. 아래 마지막 주석
 CharacterMedallion size=md (Figma 200 → md 188, 허용 차이 AD-S2-3)  asset=headphones   ← 179:1750/1751
 (gap --space-7)   ← Figma **29** (medallion bottom 310 → `179:1756` y 339) → 28 흡수 · 신규 토큰 §6.1
 Surface fill=strong radius=card padding=--space-5   ← 179:1756
   ├ Text  제목 2줄  --text-title-3 / --color-fg-primary    ← 179:1757 (아이 first name 사용, C-6)
   └ Text  본문 3줄  --text-subheadline / --color-fg-secondary  ← 179:1758 `가값 (P-01)`
 (gap --space-7)   ← Figma **29** (카드 bottom 533 → `179:1759` y 562) → 28. 이전 판의 `--space-5`(20) 은 실측과 Δ9 였다 (`S2-TOKEN-1`)
 InfoRow  icon=clock  "소요 시간·단계 수"        ← 179:1759  §4.4
 (gap --space-2)
 InfoRow  icon=list-checks  "진행 방식"          ← 179:1764
 (flex spacer)
 Button variant=accent size=lg fullWidth  "Start"   ← 179:1768
```

- **문구 불일치**: Figma `179:1763` "About 3 minutes · 10 cards" 와 `179:1767` "Swipe each card away to move on" 은 **Step 5(설문 10문항)만** 설명한다. 5단계 전체 소개 화면으로는 맞지 않는다 (§13.2 ②). 대체 문구는 `NEEDS DECISION`(copy 소유자). 소요 시간은 실측 근거가 없어 **design-agent가 숫자를 정하지 않는다.**
- Trial(미인증) 진입 시 §2.11 안내가 이 화면 상단에 붙는다.
- **상단 여백 (2026-09-27 실측 · 이전 판에는 명세 값이 없었다)**: Figma 는 safe-top(56) → medallion(`179:1750` y=110) = **54** 다. 명세·구현은 `--space-6`(24)이며, 회수한 30 은 Figma 에 없는 항목(InfoRow 6번째 옵션 안내·Trial `InlineAlert`, `AD-S2-10`·§2.12)과 하단 CTA 정렬(`AD-S2-16`)이 쓴다. §2.1 과 같은 성격의 **세로 재분배**이며 값 변경은 사용자·Orchestrator 결정 사항이다 — 이번 개정은 구현 현황을 명세에 적어 **명세 공백만 닫는다**(구현 변경 없음).

### 2.9 `/onboarding/:step` 공통 chrome (Step 1~5)

```
TopBar variant=centered
   leading  = IconButton(chevron-left)  — Step 1에서는 /onboarding 으로
   title    = step 제목 (Step 5는 "Question n of 10")     ← 179:1778
   trailing = Step 5에서만 IconButton(chevron-right)      ← 179:1775
 (gap --space-4)
 ProgressBar  tone=accent size=sm  +  "Step n of 5" 텍스트 병기   ← 179:1779/1780  `가값 (P-02)`
 (gap --space-6)
 [step 본문]
 (flex spacer, 최소 --space-8)
 [하단 CTA — 스크롤 컨테이너 내부]
   Button variant=accent size=lg fullWidth  "Next" (Step 5 마지막 카드 = "Save profile" / 인증 상태면 "Finish")
```

| 항목 | 규격 |
|---|---|
| 진행 의미 | Step 1–4 = `value = step / 5`. **Step 5 = Figma 그대로 문항 진행(`n / 10`)** 이고 TopBar 제목도 "Question n of 10" 이다. 두 의미가 섞이므로 Step 5 진행바 위에 "Step 5 of 5" 를 caption으로 병기한다 — `RECOMMENDED` (§13.1 ⑤) |
| 값 표시 | 진행바 색만으로 값을 전달하지 않는다 — 항상 텍스트 병기 (Stage 1 §4.18) |
| 이전/다음 | Step 1–4의 "이전"은 TopBar leading. "다음"은 하단 CTA. **Step 5는 카드 단위 이동이 TopBar leading/trailing** 이다 |
| 저장 | 로컬 draft = 입력 변경 debounce, 서버 draft = step 이동 시 1회 (`Plan D-11 전제`) — 디자인 영향: **저장 중 표시를 만들지 않는다**(조용한 저장). 저장 실패 시에만 `InlineAlert tone=warning placement=inline` |
| step 전환 모션 | 없음(즉시 교체) — `RECOMMENDED`. 위저드 이동마다 화면 전환 애니메이션을 넣지 않는다 |
| 라이브 영역 | step 전환 시 제목을 `aria-live="polite"` 로 알린다 |

### 2.10 Step별 본문

#### Step 1 `child-info` — Figma `179:1740` + **C13-04**

```
SectionLabel "ABOUT YOUR CHILD"
FieldGroup A
  ├ TextField  label="First name"  required  autoComplete=given-name       ← 179:1740 row1 (분리)
  ├ TextField  label="Last name"   optional  autoComplete=family-name      ← Plan D-1 전제(선택)
  ├ Row: SelectTrigger label="Birth year" | SelectTrigger label="Birth month"   (1행 2열, gap --space-3)
  │      trailingAccessory = Tag tone=flexibility size=sm  "3yr 4mo"  ← 179:1740 row2 · 입력에서 파생
  └ SelectTrigger label="Gender"  placeholder="Not selected"
        옵션 Girl / Boy / Prefer not to say (기본 미선택, 미응답 진행 가능 — C-7)
(gap --space-6)
SectionLabel "ABOUT YOU"
FieldGroup B
  └ SelectTrigger label="Your relationship to this child"
        옵션 = CaregiverRelationship 7값 (mother · father · grandparent · babysitter · tutor · therapist · other)
(gap --space-6)
SectionLabel "AT HOME"
  Text  "Languages you use at home"   --text-footnote
  Chip multi-select (wrap, gap --space-2)              ← languageEnvironment[] (배열)
  (gap --space-5)
  Text  "Reading routine"             --text-footnote
  RadioGroup variant=list                              ← readingRoutine (단일 값)
```

| 항목 | 근거·판단 |
|---|---|
| 이름 2칸 | `CONFIRMED (C-6, D-03)`. Figma `179:1740` 은 한 칸("Haru, Kim")이다 → **허용 차이 `AD-S2-4`** |
| 생년월 | `Plan D-10 전제` — 자유 텍스트("March. 2023") 대신 년·월 SelectTrigger. **허용 차이 `AD-S2-5`**. 범위 밖(3세 미만·10세 이상) 선택 시 필드 에러 `--color-field-fg-error` (`가값 (P-04)`) + 문구 "HARU is built for ages 3 to 9 right now." |
| 나이 Tag | 입력에서 파생 표시(서버 값 아님). 색 단독 정보 금지 — 텍스트가 정보 본체 |
| 성별 | SelectTrigger **`row` variant** 사용. Figma의 pill(`Tag Boy/Girl/Not selected`, 81×18)은 "Prefer not to say" 라벨 길이·44 터치·320px reflow를 만족하지 못한다 → **허용 차이 `AD-S2-6`** (§4.2) |
| 관계·언어·루틴 옵션 문구 | contracts enum + copy 모듈 값만 표시한다. 이 문서가 문구를 확정하지 않는다 (`NEEDS DECISION`) |
| 전송 경로 | `relationship` 은 `PATCH /v1/me`, 나머지는 `ChildInfoAnswers` (`Plan D-16 전제`) — **디자인상 한 화면이지만 요청이 2개**라는 점을 구현 메모로 남긴다 |

#### Step 2 `temperament` — **C13-05 (명세)**

Figma 없음. Step 5의 `SwipeDeck` 을 재사용하지 않는다(4개 문항은 덱 비용이 더 크다). **세로 스크롤 카드 목록**으로 명세한다.

```
Text  step 안내 1줄  --text-subheadline / --color-fg-secondary
(gap --space-5)
QuestionBlock × 4   (gap --space-6)
  ├ Text  질문        --text-headline / --color-fg-strong
  ├ Text  보조 설명(선택) --text-caption-1 / --color-fg-secondary
  └ 응답 컨트롤
      · 활동성 · 낯가림 · 집중 성향 → RadioGroup variant=card (단일 선택)
      · 선호 활동                   → Chip multi-select (wrap)
```

- 4개 축(활동성·낯가림·집중 성향·선호 활동)은 PRD §7.2 Step 2 문언 그대로이며, **옵션 값·문구는 contracts(`TemperamentAnswersSchema`, Plan §7.1 RECOMMENDED) 확정 후 주입**한다.
- "기질 카드 선택형"의 카드 = `RadioGroup variant=card` 의 카드 행으로 해석한다. 이미지 카드·일러스트는 에셋이 없어 만들지 않는다 (§13.1 ⑥).
- 미응답 허용 여부는 contracts 결정에 따른다. 필수면 하단 CTA를 `aria-disabled` + 사유 문구로 처리(§2.6과 동일 패턴).

#### Step 3 `books` — **C13-06 (명세)**

```
SectionLabel "BOOKS YOUR CHILD LOVES"   (최대 5권)
TextField  label="Search a book"  leadingIcon=search  trailingAction="Clear"  inputMode=search
(gap --space-3)
[검색 결과 영역]
  · 입력 없음      → 아무것도 렌더하지 않음
  · 로딩           → ListRow Skeleton × 3 (Stage 1 §5.1)
  · 결과 있음      → ListGroup / ListRow  (title + subtitle=author + trailing Checkbox)
  · 결과 없음(empty)→ 목록 자리에 EmptyState (가운데 정렬 아님, Stage 1 §5.2)
                     제목 "No match yet."  설명 "You can add the title yourself."
                     Button variant=glass size=md  "Add “{query}” as a title"      ← PRD §7.2 필수 예외 경로
  · 오류           → InlineAlert tone=error placement=inline + 인라인 "Try again"
(gap --space-5)
선택된 책 (최대 5)  ListGroup / ListRow  (title + trailing IconButton(x, "Remove"))
   5권 도달 시 검색 결과 행은 `aria-disabled` + caption "You can pick up to 5."
(gap --space-6)
SectionLabel "BOOKS AT HOME"
  TextField label="Add a book at home" trailingAction="Add"  → ListGroup 누적, 행마다 Remove
(gap --space-6)
SectionLabel "TOPICS YOUR CHILD LIKES"
  Chip multi-select (wrap, gap --space-2)
```

- 검색은 `GET /v1/books/search` 최소 범위 (`Plan D-17 전제`). 표지 이미지(`ListRow media`)는 **Stage 3** 이므로 Stage 2 행에는 표지를 넣지 않는다 (§4.3).
- 입력 디바운스·요청 타이밍은 구현 결정. 화면은 **150ms 미만 응답 시 Skeleton을 그리지 않는다**(Stage 1 §5.1).

#### Step 4 `goals` — **C13-07 (명세)**

```
Text  "What would you like to grow together?"   --text-title-3
Text  "Choose as many as feel true."            --text-subheadline / --color-fg-secondary
(gap --space-5)
Chip multi-select (wrap, gap --space-2)         ← growthGoals[]
```

- 목표 항목이 4대 역량과 **같은 개념이 아니다**. 역량 라벨(#14)을 그대로 쓰면 Step 5 결과와 혼동되므로, 목표 문구는 contracts/copy 값으로 따로 둔다 (`NEEDS DECISION` — 목록 소유자).
- 선택 0개 허용 여부는 contracts 결정. Chip 선택은 색 + **leading `check` 아이콘** 이중 표시(Stage 1 §4.16).

#### Step 5 `capability-items` — Figma `179:1770` + **C13-08**

```
TopBar centered:  leading=IconButton(chevron-left, "Previous question")   ← 179:1772
                  title="Question n of 10"                               ← 179:1778
                  trailing=IconButton(chevron-right, "Next question")    ← 179:1775
ProgressBar tone=accent size=sm  value = n/10                            ← 179:1779/1780
(gap --space-5)
SwipeDeck  depth=3                                                       ← 179:1781–1783
  └ SurveyQuestionCard (front)
      ├ Text  counter "n / 10"   --text-caption-1 / --color-fg-secondary     ← 179:1785
      ├ IconButton(rotate-ccw, "Clear this answer")  카드 우상단              ← 179:1804
      ├ Text  eyebrow "IN THE PAST TWO WEEKS"  --text-caption-1 / letter-spacing 기본 / 대문자  ← 179:1786
      ├ Text  question  --text-title-3 / --color-fg-strong (최대 4~5줄)        ← 179:1787
      └ RadioGroup variant=card  6 options                                   ← 179:1788
           ├ 1–5  빈도 옵션 (instrument scaleLabels[0..4])
           ├ 구분선 1px --color-divider  (gap --space-4 위·아래)
           └ 6     비채점 옵션 (scaleLabels[5]) — options[].variant='muted'
```

**6번째(비채점) 옵션 시각 구분 — C13-08 명세**

| 항목 | 값 | 근거 |
|---|---|---|
| 배치 | 5개 빈도 옵션 아래, `--space-4` 간격 + 1px `--color-divider` 로 **그룹 분리** | 척도의 6번째 눈금이 아니라 **다른 종류의 응답**임을 위치로 전달 |
| 미선택 배경 | `--color-surface-note` (paper) — 다른 옵션의 `--color-surface-subtle`(mist)과 **재질만 다르게** | 색의 명도·채도를 낮추면 "낮은 점수"로 읽힌다. 계열을 바꾸되 위계는 낮추지 않는다 |
| 선택 상태 | 1–5와 **완전히 동일** (`--color-selected-bg` + `--color-selected-fg`, 원 채움) | 비채점 응답이 "덜 유효한 선택"으로 보이면 안 된다 (C-8: 결측이지 낮은 점수가 아님) |
| 라벨 | instrument `scaleLabels[5]` 값 그대로 ("Haven't had the chance to see this yet") | 문구 하드코딩 금지 |
| 보조 안내 | 그룹 하단 caption 1줄 `--text-caption-1 / --color-fg-secondary`: "This one isn't scored." | 텍스트로도 성격을 전달 (색·위치 단독 금지) |
| 접근성 | RadioGroup `aria-describedby` 가 위 caption을 가리킨다. 옵션 순서는 SR에서도 6번째 | |

- `179:1804` refresh 아이콘의 동작이 Figma에 정의되어 있지 않다(M-36). **"Clear this answer"(현재 카드 응답 해제)** 로 명세한다 — `RECOMMENDED`, §13.1 ⑦.
- **제스처 전용 금지**: prev/next IconButton과 키보드가 1급 경로다 (`Plan D-9 전제`, WCAG 2.5.1). §4.2 SwipeDeck 참조.

### 2.11 `/onboarding/saved` — Figma `179:1809`

```
[safe-top]
 (flex spacer A — grow 3, 최소 --space-6)
 CharacterIllustration  asset=hello-heart-full   ← 179:1819 (Figma 307×415, 세로비 유지)
 (gap --space-8)
 Text  "Thank you — that's the starting point"  --text-title-1 / --font-weight-heavy / 가운데   ← 179:1813 (Figma 27/33 → 28/34 흡수 · `AD-6`)
 (flex spacer B — grow 2, 최소 --space-8)
 Button variant=accent size=lg fullWidth trailingIcon=arrow-right  "Get started"   ← 179:1814/1815
[safe-bottom]
```

**여백 분배 규칙** (design-agent 재실측 2026-09-27 · `179:1809` 393×852. 이전 버전은 spacer 를 일러스트↔제목 **사이**에 두어 Figma와 반대였다 — `S2-DESIGN-2` 수정)

| 구간 | Figma 실측 | 규칙 | 근거 |
|---|---|---|---|
| safe-top(56) ~ 일러스트 top(163) | **107** | **flex spacer A** — `flex: 3 1 0`, `min-height: --space-6`(24) | 여백은 일러스트 **위**에 있다. 고정값으로 박지 않는다 |
| 일러스트 bottom(578) ~ 제목 top(615) | **37** | **고정** `--space-8`(32) | 37 은 비스케일 raw 값 → spacing 스케일로 흡수 (#10-② · `DESIGN_TOKEN_MAP` §5.1 "7·13·18·26 같은 비스케일 값 금지"). Δ −5. §6.1 로 `--space-10`(40)이 정의되면 40 이 Δ+3 로 더 가깝지만, 이 간격을 8px 늘리면 3 : 2 분배가 다시 바뀌어 **이미 통과한 시각 baseline 을 한 번 더 무효화**한다. 32 로도 아래 검산이 ±4px 안에 들어오므로 **32 를 유지한다** (2026-09-27 판단) |
| 제목 bottom(681) ~ CTA top(750) | **69** | **flex spacer B** — `flex: 2 1 0`, `min-height: --space-8`(32) | |
| CTA bottom(808) ~ 프레임 bottom(852) | 44 | `[safe-bottom]` = `--layout-safe-bottom` | `AD-S2-16` (§11.3) |

- **여백은 일러스트 위(A)와 제목 아래(B)에 3 : 2 로 분배한다.** Figma 잔여 여백 107 : 69 = 1.55 : 1 ≒ 3 : 2 다. `flex-grow` 는 **단위 없는 비율**이므로 spacing 토큰 대상이 아니며 "임의 px" 도 아니다. 고정 값은 `--space-8`(간격) · `--space-6`/`--space-8`(spacer 최소값) 만 쓴다 → **이 화면은 신규 토큰 0건**이다 (§6.1 의 제안 2건은 §2.1·§2.3·§2.8·§5.3 지점에서 나온다).
- **393×852 검산** (제목 = `--text-title-1` 28/34 기준 — `QA-2-005` 반영): usable = 852 − safe-top 56 − safe-bottom 44 = 752. 콘텐츠 = 일러스트 415 + 32 + 제목 **68**(2행 × line-height 34. Figma `179:1813` 박스 높이 **66** = 2행 × 33 → Δ+2, `AD-6`) + CTA 56(`AD-S2-12`) = **571**. 잔여 181 → A ≈ 108.6 / B ≈ 72.4. 결과 위치는 일러스트 top ≈ **164.6**(Figma 163, Δ+1.6) · 제목 top ≈ **611.6**(615, Δ−3.4) · CTA top ≈ **752**(750, Δ+2) → **오차 ≤ 4px**. 기존 `AD-S2-12`(±2) · `AD-S2-16`(하단 ±48) 범위 안에서 해소되므로 **신규 허용 차이를 만들지 않는다**.
  - 이전 판은 콘텐츠 합에 제목 **66**(Figma line-height 33 기준)을 쓰면서 토큰은 `--text-title-2`(22/28 → 2행 **56**)로 배정해 **검산 전제와 토큰이 어긋나 있었다** (`QA-2-007` ②). 토큰을 `title-1` 로 고치면 68 : 66 으로 맞는다.
  - `--text-title-2`(56)로 같은 계산을 하면 콘텐츠 559 · A ≈ 115.8 → 일러스트 top ≈ **171.8** = Figma 163 대비 **+8.8**. QA 3회차 실측 편차와 정확히 일치하며 이것이 `QA-2-005` 의 실제 원인이다.
- **고정 높이·고정 여백으로 박지 않는다** (§5.2 · §9 "고정 높이 컨테이너 금지"). 107 · 69 를 px 로 적지 않는 이유가 이것이다.
- **공간 부족 시 실제 동작** (`QA-2-006` 반영 — 2026-09-27 실증으로 확인된 단계만 적는다):
  ① spacer A·B 가 3 : 2 비율을 유지하며 각자 최소값(24 / 32)까지 줄어든다.
  ② 그다음은 **앱 컬럼 스크롤**이다. CTA 는 스크롤 컨테이너 내부에 남아 도달 가능하고, **제목·CTA 는 어느 단계에서도 잘리지 않는다** (§9-4 · Stage 1 §2.2).
  - **세로 높이에 따른 일러스트 비율 축소 단계는 존재하지 않는다.** `AppColumn` 은 콘텐츠 높이만큼 자라는 grid 여서 세로 음수 여유가 생기지 않고, 래퍼 높이가 콘텐츠 높이라 `max-block-size: 100%` 가 제약으로 작동하지 않는다. 이전 판은 이 단계를 ②로 적었으나 **발동하지 않는다** (QA 실측: computed `aspect-ratio: auto`). 일러스트가 작아지는 경로는 **가로 폭 제약 하나뿐**이다 — `width: min(100%, --size-illustration-max)` + 세로비 유지(아래 320px 항목).
  - 이 서술 정정은 **구현 변경을 요구하지 않는다** — 결과 요구(제목·CTA 잘림 없음 · CTA 도달)는 6개 조건에서 이미 충족되어 있다. 단 `character.css` 의 "②를 구현했다" 주석은 사실과 달라 정정이 필요하다 (§14-11 ④, 코드 주석은 development-agent 소관).
- **320px**: 콘텐츠 폭 = 320 − gutter 48 = 272 → 일러스트 = `min(100%, --size-illustration-max)` = 272×368(비율 0.74)로 자동 축소되어 415 대비 47px 여유가 먼저 생긴다 (§9-3 · §5.2). 잘림 없음.
- **텍스트 200%**: 제목이 다수 행으로 늘고 CTA 라벨이 커지면 잔여가 **spacer 에서 먼저 흡수**된다(3 : 2 유지) → 최소값 도달 후 **② 스크롤**로 이어진다. 320px × 200% 에서 스크롤로 귀착되는 것이 정상 동작이며, 고정 높이가 없으므로 겹침·잘림·버튼 밀림이 발생하지 않는다.

- **에셋 = `hello-heart-full`** (`QA-2-007` ① 정정): Figma `179:1819` 307×415 **전신** 이미지에서 export 한 별도 파일(2x = 614×830)이다. medallion 이 쓰는 `hello-heart`(원형 크롭, `163:2528` 계열)와 **다른 에셋**이므로 이름을 섞지 않는다 (§5.2).
- Figma의 `179:1813` weight는 Black(1000)이다 → Inter 최대치로 근사 (`AD-2`).
- **Stage 2에서 "Get started" 의 목적지는 `/` (Home skeleton)** 이다. PRD §5.1 ③④(프로필 결과 → 발전 역량)는 **Stage 2-B** 에서 이 사이에 삽입된다 (§12.1).

**같은 `(flex spacer)` 패턴을 쓰는 다른 화면 — 영향 점검 (2026-09-27)**

| 화면 | spacer 위치 | 판정 |
|---|---|---|
| `/auth/welcome` §2.1 · `/auth/sign-up` §2.2 · `/auth/log-in` §2.3 · `/auth/forgot-password` §2.4 · `/auth/reset-password` §2.5 · `/auth/consent` §2.6 · `/auth/verify-parent` §2.7 · `/onboarding` §2.8 · `/onboarding/:step` §2.9 | 모두 **하단 앵커 요소(CTA·각주) 직전 1개** | **영향 없음** — Figma 도 같은 화면들에서 잔여 여백을 하단 블록 위에 둔다(예: `179:1701` 로그인 유도 행 bottom 729 → 각주 top 788 = 59, `179:1748` InfoRow bottom 666 → CTA top 724 = 58). `S2-DESIGN-2` 는 `/onboarding/saved` **단독 결함**이었다 |

- **2026-09-27 개정 2: 미정의 토큰 참조 정리 (`S2-TOKEN-1`)** — 이전 판은 `--space-7`(28) · `--space-10`(40) 을 정의된 토큰처럼 참조했으나 `packages/design-tokens/src/semantic/space.css` 의 스케일은 2·4·6·8·10·12·14·16·20·24·**32** 까지였다. Figma 재실측 결과 두 값 모두 근거가 있고 기존 스케일로 흡수하면 Figma 와 더 멀어져 **스케일 2단계 추가를 제안한다**(§6.1). 지점별 결과:
  | 지점 | Figma 실측 | 정정 후 명세 | 구현 영향 |
  |---|---|---|---|
  | §2.1 `/auth/welcome` safe-top → medallion | **94** (`179:1703` y=150 − 56) | `--space-10`(40) 유지 + 압축 근거 기록 (§2.1) | 없음 (`pt-10`) · Figma 값 복원은 사용자 결정 |
  | §2.2 `/auth/sign-up` spacer 하한 | 해당 없음 (여유 424) | `--space-10`(40) 유지 — 하한임을 명시 (§2.2) | 없음 (`pt-10`) |
  | §2.3 `/auth/log-in` 부제 → Google | **38** (`179:1832` bottom 390 → `179:1833` y 428) | `--space-7`(28) → **`--space-10`(40)**, Δ+2 | **있음** — 현재 `gap-6`(24) (§14-11 ③) |
  | §2.8 `/onboarding` medallion → 카드 | **29** (`179:1750` bottom 310 → `179:1756` y 339) | `--space-7`(28) 유지, Δ−1 | 없음 (`gap-7`) |
  | §2.8 카드 → InfoRow 1 | **29** (카드 bottom 533 → `179:1759` y 562) | `--space-5`(20) → **`--space-7`(28)**, Δ−1 | 없음 — 구현이 이미 28 이다 (이전 판이 Δ9 틀렸다) |
  | §2.8 safe-top → medallion | **54** (`179:1750` y=110 − 56) | 명세 공백 → `--space-6`(24) 기록 (§2.8) | 없음 |
  | §5.3 설문 카드 counter → eyebrow | **40 정확** (`179:1784` bottom 38 → `179:1786` y 78) | `--space-10`(40) 유지 | 없음 (`gap-10`) |

### 2.12 `C13-11` Trial 가입 유도 · draft 유실/만료 안내 (`/onboarding/*` 내 상태)

| 상태 | 위치 | 표현 |
|---|---|---|
| Trial 진행 중(미인증) | `/onboarding` 과 Step 1 상단 | `InlineAlert tone=info placement=inline` (`가값 (P-04)`) — "Your answers stay on this device until you create an account." + `TextLink "Create account"` |
| 마지막 CTA | Step 5 마지막 카드 하단 | Button `variant=accent` 라벨 **"Save profile"** → `/auth/sign-up` (인증 후 동의 → (VPC) → submit 1회) |
| draft 만료(보관 상한 경과) | `/onboarding` 진입 시 1회 | `InlineAlert tone=info` — "Your saved answers expired, so we're starting fresh." (책임 표현 금지) |
| draft 손상(parse 실패) | 〃 | 동일 컴포넌트, 문구만 "We couldn't read the saved answers, so we're starting fresh." |
| 기기 변경 | 새 기기의 `/onboarding` | 별도 화면 없음 — 위 "this device" 안내가 예방 문구다. 서버 복구 경로는 없다 (C-12) |

- 안내는 **닫을 수 있게** 한다(세션 내 1회). 오류가 아니므로 `role="status"`.
- Trial 구간에는 어떤 요청도 나가지 않는다 — 화면에 "저장 중"·"동기화" 류 표시를 두지 않는다 (AC-2-27).

### 2.13 `/` Home skeleton — Figma `26:21` 헤더 + **C13-13**

```
[Home 헤더 — TopBar variant=large 확장형, sticky]
   leading  = 워드마크 (HARU 로고 에셋)                  ← 26:39
   trailing = IconButton(settings, "Settings") → /settings  ← 26:44 (우측 --layout-gutter, 시각 38 / hit 44)
 (gap --space-8)
 콘텐츠 영역 (세로 가운데 정렬)
   EmptyState (Stage 1 §5.2)
     ├ 아이콘 배지 48   (Lucide `book-open`)
     ├ 제목  --text-headline
     └ 설명  --text-subheadline / --color-fg-secondary (최대 2줄)
```

| 결정 | 내용 |
|---|---|
| contract 호출 | **0건** (`HomeSummary` 는 Stage 3) → 이 화면에 Loading/Error 상태가 없다 |
| 캐릭터 일러스트 | **넣지 않는다.** `26:22` 캐릭터·`88:922` 버블·`26:40` streak·덱·BottomTabBar는 전부 Stage 3 (#33) |
| 액션 버튼 | EmptyState에 **CTA를 두지 않는다** — Stage 2에 이동할 곳이 없다 |
| 문구 | 기능을 약속하지 않는 관찰 톤. 예: 제목 "Your storytime space is ready." / 설명 "Tonight's activity will show up here." — `RECOMMENDED`, copy 승인 필요 (§13.1 ⑧) |

### 2.14 `/settings` — **C13-12 (명세)**

```
TopBar variant=centered  leading=IconButton(chevron-left, "Back")  title="Settings"
 (gap --space-6)
 ListGroup
   └ ListRow  title="Log out"   trailing 없음(액션 행)   onPress → ConfirmDialog
 (gap --space-4)
 Text  앱 버전 등 각주 — **두지 않는다** (근거 없음)
```

- 로그아웃은 `ConfirmDialog` **destructive** (`Plan D-7 전제`, Stage 1 §4.22): 제목 "Log out?", 본문 "Onboarding answers saved on this device will be removed.", 확인 "Log out" / 취소 "Cancel", 초기 포커스 = **취소**.
- 행 라벨을 빨간색으로만 구분하지 않는다. destructive 신호는 **Dialog에서** 전달한다.
- Stage 3·6·8에서 행이 추가된다 (C-16) — `ListGroup` 은 목록이 1행이어도 카드 형태를 유지한다.

---

## 3. 사용 컴포넌트와 Variant / State

### 3.1 기존 Shared UI 22종 재사용 매트릭스 (Stage 2에서 실제로 마운트되는 것)

| 컴포넌트 | Stage 2 사용 variant | 사용 화면 |
|---|---|---|
| `Text` | large-title · title-1/2/3 · headline · body · callout · subheadline · footnote · caption-1/2 | 전 화면 |
| `Icon` | Lucide: `chevron-left` `chevron-right` `settings` `mail` `mail-check` `shield-check` `search` `x` `check` `rotate-ccw` `list-checks` `clock` `book-open` `triangle-alert` `wifi-off` `external-link` / brand: google · apple | 전 화면 |
| `Surface` + `AppBackground` | fill=strong · radius=card/surface | 소개·VPC·동의·상태 카드 |
| `Button` | `accent`(lg, fullWidth) · `glass`(lg/md) · `loading` · `disabled` | 전 화면 |
| `IconButton` | back · forward · settings · clear · remove | TopBar, 카드, 목록 |
| `TopBar` | **`centered`** (Auth·온보딩·설정) · **`large` 확장형**(Home 헤더) | §2 |
| `AppColumn` | padded(기본) | 전 화면 |
| `Spinner` / `Skeleton` | inline spinner(VPC pending) · skeleton(동의 문서, 책 검색) | §8 |
| `ErrorState` / `EmptyState` | 화면 전체 오류 · 목록 비어 있음 · Home skeleton | §8, §2.13 |
| `InlineAlert` | tone=`info`(Trial·재동의) · `warning`(step 저장 실패) · `error`(VPC 실패·부분 실패) · `offline`(배너) | §8 |
| `Toast` | 비밀번호 변경 완료 등 되돌릴 필요 없는 확인 | §2.5 |
| `TextField` + `FieldGroup` | rest/focus/filled/error/disabled + `trailingAction`(Show/Hide, Add, Clear) + `trailingAccessory`(age Tag) | Auth, Step 1·3 |
| `Checkbox` + `CheckboxGroup` | unchecked/checked/focus/disabled, 행 전체 hit area | 동의 5항목, 책 선택 |
| `Tag` | tone=flexibility size=sm — **나이 표시 전용** | Step 1 |
| `Chip` | filled(선택)/outline(미선택), multi-select, leading `check` | Step 1 언어, Step 3 주제, Step 4 목표 |
| `RadioGroup` | `card`(설문·기질) · `list`(독서 루틴), `options[].variant='muted'`(비채점 옵션) | Step 2·5, Step 1 |
| `ProgressBar` | tone=accent size=sm, determinate + 텍스트 병기 | 온보딩 chrome |
| `PageIndicator` | **사용하지 않음** (표시 전용 확정, 덱 진행은 ProgressBar가 담당) | — |
| `SpeechBubble` | **사용하지 않음** (Stage 2 화면에 버블 없음 — §5.4) | — |
| `Sheet` + `Scrim` | bottom — **SelectTrigger 옵션 선택** (`Plan D-8 전제`) | Step 1 |
| `Dialog` / `ConfirmDialog` | destructive — 로그아웃 | `/settings` |
| `BottomTabBar` | **마운트하지 않음** (Stage 3) | — |

### 3.2 화면 × 신규 컴포넌트

| 화면 | SelectTrigger | SwipeDeck | ListGroup/Row | InfoRow | DividerWithLabel | TextLink |
|---|---|---|---|---|---|---|
| `/auth/welcome` | | | | | | ✓ |
| `/auth/sign-up` | | | | | | |
| `/auth/log-in` | | | | | ✓ | ✓ |
| `/auth/forgot-password` · `/auth/reset-password` | | | | | | ✓ |
| `/auth/consent` | | | | | | ✓ |
| `/onboarding` | | | | ✓ | | |
| Step 1 | ✓ | | | | | |
| Step 3 | | | ✓ | | | |
| Step 5 | | ✓ | | | | |
| `/settings` | | | ✓ | | | |

---

## 4. 신규 Shared UI 6종 명세 (22 → 28)

> 공통: `packages/ui` 는 `@haru/contracts` 를 import하지 않는다. 옵션·아이템은 props 주입. 모든 컴포넌트에 `:focus-visible` 링(P-03 확정값), 접근성 이름, 키보드 조작, 44×44 터치를 적용한다.

### 4.1 `SelectTrigger` — Figma `179:1740`(Tag Boy/Girl/Not selected) · `31:118`

| 항목 | 내용 |
|---|---|
| variant | **`row` 단일** (FieldGroup 안의 1행). Figma의 pill 형태(`pill`)는 Stage 2에서 만들지 않는다 → `허용 차이 AD-S2-6`, pill은 Stage 7(`31:118`)에서 재검토 |
| state | `rest` · `hover` · `pressed` · `focus` · `filled`(값 선택됨) · `placeholder`(미선택) · `error` · `disabled` |
| 치수 | 행 높이 `--field-row-height`(42, `S1-G-2` 동일 근거) · 내부 padding `--space-1` · label↔value gap `--space-0-5` · chevron `--size-icon-sm`(16) 우측 정렬 |
| 색 | label `--text-caption-2` / `--color-fg-secondary`(`가값 (P-01)`) · value `--text-callout` / `--color-fg-strong` · placeholder `--color-fg-secondary` · chevron `--color-fg-secondary` · error 시 행 하단 1px `--color-field-border-error`(`가값 (P-04)`) |
| 선택 UI | **기존 `Sheet variant=bottom` 재사용** (`Plan D-8 전제`). Sheet 제목 = 필드 label, 본문 = `RadioGroup variant=list`, 항목 선택 즉시 반영 후 닫힘. scrim `--color-scrim`(`가값 (P-05)`) |
| 미선택 표현 | placeholder 텍스트("Not selected") + chevron. 값이 없음을 색으로만 표현하지 않는다 |
| props | `label`, `value`, `placeholder`, `options`(`{value,label}[]`), `onChange`, `error`, `disabled`, `required`, `sheetTitle` |
| 접근성 | 트리거는 `<button>` + `aria-haspopup="dialog"` + `aria-expanded`. 접근성 이름 = `label + 현재 값`. Sheet는 focus trap, 닫히면 트리거로 포커스 복귀. 키보드: Enter/Space 열기, Esc 닫기, Sheet 안에서 화살표 이동 |
| Figma 없음 | 옵션 Sheet 레이아웃 · error · disabled · focus → 명세 |

### 4.2 `SwipeDeck` — Figma `179:1781–1783` (실측 2026-09-23)

| 항목 | 내용 |
|---|---|
| 구조 | 카드 스택 depth **3**. Figma 실측: front `345×546`(x24,y164) · 2nd `329×521`(x32,y205) · 3rd `313×521`(x38,y221) → **레벨마다 좌우 각 8px 안쪽, 아래로 16px 더 보임** |
| Tier-3 토큰 | `--deck-inset-x` = `--space-2`(8) · `--deck-peek-y` = `--space-4`(16) · `--deck-depth` = 3 (`신규 토큰 제안`, `packages/ui` 내부) |
| 카드 표면 | 뒤 카드 `--color-surface-strong` + `--radius-card`. Figma 실측 fill `rgba(255,255,255,.85)` · radius `30` → 토큰으로 흡수 (`AD-S2-7`) |
| state | `idle` · `dragging` · `advancing` · `returning`(임계 미만 복귀) · `first`/`last`(이전/다음 비활성) |
| **조작(1급)** | TopBar leading/trailing `IconButton`(`179:1772`/`179:1775`) + 키보드 `ArrowLeft`/`ArrowRight`. 제스처는 **부가 기능**이다 (WCAG 2.5.1, `Plan D-9 전제`) |
| **구현 방식 — Plan D-9에 대한 이견** | `CSS scroll-snap` 대신 **Pointer Events + `transform: translate3d`** 를 권장한다. `scroll-snap` 은 `overflow-x: auto` 컨테이너를 `AppColumn` 안에 만들어야 하는데, Stage 1 §2.2가 **"AppColumn 안쪽 요소에 `overflow-*` 선언 금지"**(카드 `--shadow-glass-*` 가로 28px 번짐이 직사각형으로 잘림, handoff §18.1–18.2)를 확정했다. transform 방식은 overflow를 만들지 않아 이 규칙과 충돌하지 않고, 라이브러리 미도입·CSS/Pointer Events 우선(#9)이라는 D-9의 취지도 그대로 지킨다. → §12.3 |
| 모션 | 진행 `translateX(±60%) + opacity 0`, `--motion-duration-base` / `--motion-ease-standard`. 뒤 카드가 앞으로 올라오며 `--deck-inset-x`·`--deck-peek-y` 가 0으로 수렴. **reduced-motion = 즉시 교체(모션 없음)** |
| props | `items`, `index`, `onIndexChange`, `renderItem`, `prevLabel`, `nextLabel`, `depth` |
| 접근성 | 컨테이너 `role="group"` + `aria-roledescription="card deck"`, 현재 카드만 접근성 트리에 노출(뒤 카드 `aria-hidden`). 카드 변경 시 `aria-live="polite"` 로 "Question n of 10" 알림. 드래그 중에도 포커스를 빼앗지 않는다 |
| Figma 없음 | dragging·returning·키보드·reduced-motion → 명세 |

### 4.3 `ListGroup` / `ListRow` — Figma `163:2145` (Book List, 실측)

| 항목 | 내용 |
|---|---|
| `ListGroup` | 카드 셸 — `--color-surface-strong` + `--radius-surface`(22) + `--shadow-glass-rest`, padding-x `--space-4`(16, Figma 행 내부 좌우 16과 일치), 행 사이 1px `--color-divider`(Figma `163:2111` 1px), 첫·끝 구분선 없음. props `children`, `label`(외부 SectionLabel과 구분) — 카드 배경·radius는 `RECOMMENDED`(Figma symbol에 컨테이너 없음) |
| `ListRow` variant | **Stage 2 = `basic`**: `title` + `subtitle?` + `trailing?`(chevron · IconButton · Checkbox). **`media`(표지 34×48)·`meta`(우측 보조 텍스트)는 Stage 3** |
| 치수 | 행 최소 높이 **56** (`--list-row-height-min`, `신규 토큰 제안`). Figma 74는 media 행 값이므로 basic 행에 그대로 쓰지 않는다. 좌우 padding `--space-4`, 세로 padding `--space-3`, trailing chevron `--size-icon-sm`(15→16 흡수) |
| 타이포 | title `--text-footnote`(13/590) `--color-fg-primary` (Figma 17px 높이 텍스트) · subtitle `--text-caption-1` `--color-fg-secondary` (`가값 (P-01)`) |
| state | `rest` · `hover` · `pressed` · `focus` · `disabled` · `selected`(trailing Checkbox) |
| props | `title`, `subtitle`, `trailing`, `onPress`, `disabled`, `selected` |
| 접근성 | `onPress` 가 있으면 행 전체가 `<button>`(또는 `<a>`), 접근성 이름 = title(+subtitle). chevron은 `aria-hidden`. 행 높이 56 ≥ 44 ✓ |
| `subtitle` 추가 근거 | Step 3 책 검색 결과가 저자를 함께 보여줘야 한다(`BookSummary.author`). 텍스트 1행 추가이며 `media` 슬롯은 열지 않는다 → 다음 Stage 선행 구현이 아니다 |

### 4.4 `InfoRow` — Figma `179:1759` · `179:1764` (실측 2026-09-23)

| 항목 | 내용 |
|---|---|
| 구성 | glass pill 1행: `icon`(19 → `--size-icon-md` 20) + gap `--space-3`(12) + `text` |
| 치수 | padding `--space-4`/`--space-3-5`(16/14) — Figma px16 py14 ✓, **고정 높이 없음**(텍스트 확대 대응). Figma 높이 47은 결과값 |
| 표면 | `--color-surface-glass` + `--material-blur-md`(12) + `--shadow-glass-rest`, radius **`--radius-surface`(22)** — Figma 실측 radius 20 → 스케일 흡수 (`AD-S2-8`), fill 실측 `rgba(255,255,255,.72)` → `--haru-white-a74` 흡수 |
| 텍스트 | `--text-subheadline`(15, Figma 14.5) `--color-fg-primary` (Figma `#4a5f5c` = `--haru-ink-700`) |
| state | 없음 (표시 전용, 인터랙티브 아님) |
| props | `icon`, `children` |
| 접근성 | 순수 표시. 아이콘 `aria-hidden`, 정보는 텍스트가 전달한다 |

### 4.5 `DividerWithLabel` — Figma `179:1839–1841` (실측)

| 항목 | 내용 |
|---|---|
| 구성 | 좌측 rule(flex) + label + 우측 rule(flex). Figma: rule 120×1 × 2, label 93 가운데 |
| 색·치수 | rule 1px `--color-divider`, 좌우 gap `--space-2`(Figma 146→150 = 4px 여백 ×2, `--space-1` 도 가능 → `--space-2` 로 흡수) |
| 텍스트 | `--text-caption-1`(12) `--color-fg-secondary` (`가값 (P-01)`) |
| props | `label` |
| 접근성 | 장식 rule은 `aria-hidden`. 의미상 구분이므로 `role="separator"` 를 쓰지 않고 일반 텍스트로 둔다(폼 구조를 깨지 않도록) |

### 4.6 `TextLink`

| 항목 | 내용 |
|---|---|
| variant `tone` | `default`(본문 안 링크) · `standalone`(단독 줄) |
| state | `rest` · `hover` · `pressed` · `focus` · `visited 미구분` · `disabled` |
| 색·장식 | `--color-fg-link` + **`text-decoration: underline`** — `CONFIRMED (Figma `179:1721` underline 확인, Stage 1 §3.2.1)`. 링크는 색 단독 구분이 아니다 ✓ |
| 타이포 | 주변 텍스트 스타일 상속. 단독 줄은 `--text-footnote`(13/590) |
| 외부 링크 | trailing `external-link` `--size-icon-sm` + 시각 숨김 "Opens in a new tab" (동의 문서, `Plan D-4 전제`) |
| props | `href`, `onPress`, `tone`, `external`, `children` |
| 접근성 | 경로 이동 = `<a>`, 동작 = `<button>`. hit area 44(세로 padding 확보). 링크 텍스트만으로 목적지를 알 수 있어야 한다("here" 금지) |

### 4.7 컴포넌트를 새로 만들지 않는 것 (조합으로 해결)

| 요소 | 처리 | 근거 |
|---|---|---|
| `SectionLabel` ("YOU" `179:1733`, "YOUR CHILD" `179:1739`) | **recipe** — `Text` + `--text-caption-1` + `text-transform: uppercase` + `--color-fg-secondary` + 하단 `--space-2`. 컴포넌트를 만들지 않는다 | `SectionHeader` 는 Stage 3 (Plan D-8 제외 목록). Stage 2는 텍스트 1줄이면 충분 |
| `PasswordToggle` | `TextField.trailingAction` 으로 흡수 | Plan D-8 · COMPONENT_MAP §1 |
| `SocialAuthButton` | `Button variant=glass` + `leadingIcon=brand/*` | 신규 컴포넌트 불필요. 브랜드 마크만 `packages/ui/src/icon/brand/` (수정 금지) |
| `WizardProgress` | `ProgressBar` + `Text` 조합, `features/onboarding-survey` 소유 | Shared UI 아님 |
| `ConsentRow` | `Checkbox` + `Text` + `TextLink` 조합, `features/consent` 소유 | 도메인 지식 포함 → Shared 아님 |

### 4.8 `TextField.trailingAction` — `Plan D-14 전제` (design-agent 의견 포함)

- **밑줄을 제거해 Figma `76:417` 에 맞춘다.** stage-1-approvals §9.0 일반 원칙("접근성 미달 값은 Figma 우선 + `provisional` 유지")의 명시적 적용 대상이다.
- 결과적으로 "Show"/"Hide" 는 **색만으로 구분**되어 WCAG 1.4.1 미달 상태가 된다 → **신규 가값 `P-17`** 로 등록하고 디자이너 결정을 기다린다.
- 미달 상태를 줄이는 보완(색 교체·밑줄 없이 가능): ① 라벨을 상태 동사로 바꿔 **텍스트 자체가 상태를 전달**("Show" ↔ "Hide") ② `aria-pressed` 제공 ③ hit area 44 확보. 이 3가지는 P-17과 무관하게 **지금 적용한다.**
- 이견: 없음. 다만 사용자가 "여기는 접근성을 맞춰라"로 판단하면 밑줄 유지가 정답이며 §9.0 예외로 기록해야 한다 (Plan D-14 대안 ① 그대로).

---

## 5. Domain 컴포넌트 명세 (Stage 2 범위)

### 5.1 `CharacterMedallion` — **P-16 실측 결과**

2026-09-23 Figma 실측 (ellipse + character 동일 bounds):

| 화면 | node | 실측 지름 | 내부 글리프 frame |
|---|---|---|---|
| `/auth/welcome` | `179:1703` / `179:1704` | **232** | `179:1705` 96×96 |
| `/onboarding` intro | `179:1750` / `179:1751` | **200** | `179:1752` 96×96 |
| `/auth/log-in` | `179:1822` / `179:1823` | **188** | `179:1824` 92×92 |

| 항목 | 값 | 상태 |
|---|---|---|
| `--size-medallion-lg` | **232** | **CONFIRMED (Figma 실측 2026-09-23)** — `/auth/welcome` |
| `--size-medallion-md` | **188** | **CONFIRMED (Figma 실측 2026-09-23)** — `/auth/log-in` |
| `--size-medallion-sm` | 136 | **`가값 (P-16)` 유지** — Stage 2 화면에 사용처가 **없다**. 136·174는 세션 화면(`28:73/74`, `29:86/87`, Stage 4)에서 재실측한다 |
| 소개 화면 200 | → `md`(188)로 흡수 | `허용 차이 AD-S2-3` (−12px, −6%). 3단계 스케일 유지를 위한 흡수 |
| ring / ring-offset | **Figma에 ring 없음** — ellipse와 character가 동일 bounds다. `ring-offset` 토큰은 Stage 2에서 값을 정하지 않는다 | **`NEEDS DECISION`** (§13.1 ⑨) |
| props | `asset`, `size`(sm·md·lg), `decorative`(기본 true) | RECOMMENDED |
| 접근성 | 장식이므로 `aria-hidden`. 의미를 전달해야 하면 주변 텍스트가 담당한다 | |
| 모션 | Stage 2는 정지 이미지만. idle/listening/celebrate 에셋 없음 (FR-11, Stage 4) | |

### 5.2 `CharacterIllustration` — `179:1819`

| 항목 | 값 |
|---|---|
| 사용처 | `/onboarding/saved` (`179:1819`, Figma 307×415, 비율 ≒ 0.74) |
| 에셋 이름 | **`hello-heart-full`** — `179:1819` 전신 이미지에서 export 한 별도 파일(2x = 614×830). medallion 의 `hello-heart`(원형 크롭, `163:2528` 계열)와 **다른 파일**이므로 이름을 섞지 않는다 (`QA-2-007` ①) |
| 크기 규칙 | 폭 = `min(100%, 307px)`, 세로비 유지, `object-fit: contain`. **고정 높이 금지**(200% 텍스트 reflow) |
| 에셋 | Stage 1 D-4 파이프라인에 따라 export. 2배·3배 래스터 + 가능하면 무손실 압축. 원본 PNG 1MB+ 그대로 번들 금지 |
| 접근성 | 장식 → `aria-hidden` |
| 라이선스 | 캐릭터 사용 권리 `CONFIRMED (C-17)`. medallion 원본 `163:2528` 과 동일 캐릭터 계열 |

### 5.3 `SurveyQuestionCard` — `179:1783` (실측)

| 항목 | 값 |
|---|---|
| 카드 | `--color-surface-strong` + `--radius-card`(28) + `--shadow-glass-rest`, padding `--space-6`(Figma 24) |
| 세로 구성 | counter(y24, 박스 `179:1784` bottom 38) → (gap `--space-10`(40) — Figma **40 정확 일치**, 신규 토큰 §6.1) eyebrow(y78) → (gap `--space-1`) question(y99) → (gap `--space-6`) 옵션(y248). Figma 절대 좌표를 gap 으로 환산했으며, **고정 높이(546)를 만들지 않는다**. eyebrow→question(Figma 7) · question→옵션(Figma 잔여 45, 단 질문 박스 104 = 4행 기준)의 환산 정확도는 이번 개정 범위가 아니다 — §13.2 에 기록 |
| counter | `--text-caption-1` `--color-fg-secondary` (`가값 (P-01)`) |
| eyebrow | `--text-caption-1` 대문자 `--color-fg-secondary`. 대비는 P-11 확정값 계열 |
| question | `--text-title-3` `--color-fg-strong` (Figma 104px 높이 = 4줄까지 자연 증가) |
| children | `RadioGroup variant=card` 6옵션 (§2.10 Step 5) |
| trailing | `IconButton(rotate-ccw)` 카드 우상단 — "Clear this answer" (`RECOMMENDED`) |
| 접근성 | 카드 = `<section aria-labelledby={questionId}>`. SR 읽기 순서 **counter → eyebrow → question → 옵션**. `RadioGroup` 의 `aria-describedby` = eyebrow id + 비채점 caption id |

### 5.4 Stage 2에서 만들지 않는 Domain 컴포넌트

| 컴포넌트 | 사유 |
|---|---|
| `CapabilityDiamondChart` | **Stage 2-B** (`C13-09`). Plan D-2(`score: null` 표현)도 함께 이관 |
| `PersonaCard` | **Stage 2-B** (`C13-09`) |
| `CharacterBubble` | Stage 2 화면에 버블이 없다. Welcome·Intro 인사는 **버블이 아니라 본문 텍스트**다(Figma `179:1707/1708`, `179:1757/1758`). → **Stage 3(`26:21` 홈 버블)으로 미룬다** — Plan §15.4는 "Stage 2 사용 범위(Welcome·Intro 인사)"로 적었으나 Figma 근거가 없다 (§13.1 ⑩) |
| `CapabilityBadge` | 역량 배지 표시 화면이 Stage 2-B다 |

---

## 6. 사용 토큰

### 6.1 신규 **semantic** 토큰 — **2건 제안** (2026-09-27 · `S2-TOKEN-1`)

Stage 2 화면은 Stage 1 §3.2 의 semantic 토큰만으로 표현된다. 화면 고유 HEX·px·radius 를 쓰지 않는다.

다만 승인본은 **정의되지 않은 이름** `--space-7` · `--space-10` 을 8곳에서 참조했다 — `packages/design-tokens/src/semantic/space.css` 의 스케일은 2·4·6·8·10·12·14·16·20·24·**32** 다. Figma 재실측(2026-09-27) 결과 두 값 모두 실측 근거가 있고 **기존 스케일로 흡수하면 Figma 와 더 멀어진다** → 스케일 **2단계 추가를 제안한다**. 값은 Figma 기준이며 신규 "임의 px" 이 아니다.

| 제안 토큰 | 값 | Tailwind 단계 | Figma 실측 근거 | 흡수 대안과의 비교 | 라벨 |
|---|---|---|---|---|---|
| `--space-7` | `calc(var(--spacing) * 7)` = **28** | `7` (`gap-7`·`pt-7`) | `179:1748` medallion bottom 310 → 카드 `179:1756` y 339 = **29** · 카드 bottom 533 → InfoRow `179:1759` y 562 = **29** (2곳) | 28 = Δ−1 · 24 = Δ−5 · 32 = Δ+3 | **RECOMMENDED / 신규 토큰 제안** |
| `--space-10` | `calc(var(--spacing) * 10)` = **40** | `10` (`gap-10`·`pt-10`) | `179:1783` counter 박스 `179:1784` bottom 38 → eyebrow `179:1786` y 78 = **40 정확 일치** · `179:1820` 부제 bottom 390 → 버튼 `179:1833` y 428 = **38** | 40 = Δ0 / Δ+2 · 32 = Δ−8 / Δ−6 | **RECOMMENDED / 신규 토큰 제안** |

- 두 값은 **Tailwind 4px 스케일의 기존 단계**(7·10)다. `DESIGN_TOKEN_MAP` §5.1 의 "7·13·18·26 같은 **비스케일** 값 금지" 는 raw 7·13·18·26 을 가리키며 28·40(=4의 배수)은 그 대상이 아니다.
- **정의해도 렌더 픽셀은 변하지 않는다** — 구현은 이미 `pt-10`(40) 4곳 · `gap-7`(28) · `gap-10`(40) 을 쓰고 있고 이 유틸리티는 `calc(var(--spacing) * n)` 으로 같은 값을 낸다. 토큰이 필요한 이유는 ① 명세가 값을 **이름으로만** 표현해야 하고(rules/frontend §6) ② `features/onboarding-survey/onboarding.css` 처럼 `var(--space-*)` 를 직접 참조하는 CSS 가 있기 때문이다.
- **design-agent 는 토큰을 직접 추가하지 않는다** — `space.css` 수정은 development-agent 소관이다 (§14-11 ①).
- 대안(모두 32 이하로 흡수)은 채택하지 않았다: `179:1784→1786` 의 **정확한 40** 을 Δ−8 로 깨고, 값이 바뀌는 지점이 4곳으로 늘어 **통과한 시각 baseline 을 더 많이 무효화**한다.

### 6.2 신규 **Tier-3(컴포넌트) 토큰 제안** — `packages/ui` 내부 전용

| 토큰 | 값 | 근거 | 라벨 |
|---|---|---|---|
| `--deck-inset-x` | `--space-2` (8) | Figma `179:1781–1783` 실측 (345→329→313, 레벨당 좌우 8) | **CONFIRMED (Figma)** |
| `--deck-peek-y` | `--space-4` (16) | 실측 (카드 하단 710→726→742) | **CONFIRMED (Figma)** |
| `--deck-depth` | 3 | 실측 (카드 3장) | **CONFIRMED (Figma)** |
| `--list-row-height-min` | 56 | Figma 74는 media 행 값. basic 행 최소값은 근거 없음 → 44 이상 + 2행(title+subtitle) 수용 | **RECOMMENDED / 신규 토큰 제안** |
| `--select-trigger-height` | `--field-row-height` (42) | TextField 행과 같은 그리드 (`S1-G-2` 동일 근거) | **RECOMMENDED** |

### 6.3 남은 가값(P-xx) Stage 2 실사용처 — 재제시용 증빙 목록

| P | 토큰 | Stage 2 실사용 화면·요소 |
|---|---|---|
| **P-01** | `--color-fg-secondary` · `--color-fg-tertiary` | Welcome tagline `179:1708` · legal footnote `179:1722` · sign-up helper "At least 8 characters." `179:1736` · Log in 부제 `179:1832` · 소개 카드 본문 `179:1758` · 설문 counter/eyebrow `179:1785/1786` · 동의 "Required/Optional" 및 버전 각주 · SelectTrigger label/placeholder · ListRow subtitle · DividerWithLabel label · EmptyState 설명 |
| **P-02** | `--color-border-subtle` · `--color-progress-fill` · `--color-progress-track` | **온보딩 진행바**(Step 1–5, `179:1779/1780`) · 미선택 Chip 경계(Step 1 언어 · Step 3 주제 · Step 4 목표) · 미선택 Checkbox 경계(동의 5항목 · 책 선택) · RadioGroup 미선택 원 경계(Step 2·5) |
| **P-04** | `--color-status-*` (16) · `--color-field-border-error` · `--color-field-fg-error` | **`vpc-failed` InlineAlert**(§2.7) · 가입/로그인/재설정 필드 에러 · Step 1 생년월 범위 에러 · Trial 안내 `tone=info`(§2.12) · 재동의 안내 `tone=info` · step 저장 실패 `tone=warning` · 로그아웃 ConfirmDialog destructive 테두리 |
| **P-05** | `--color-scrim` | **SelectTrigger 옵션 Sheet**(Step 1 — Stage 2 첫 실사용) · 로그아웃 `ConfirmDialog` |
| **P-16** | `--size-medallion-sm/md/lg` | Welcome 232 · Log in 188 = **실측 확정**, Intro 200 = 흡수. **sm 136은 Stage 2 사용처 없음** → 가값 유지 (§5.1) |

> 재제시 시점은 **Stage 2 Verdict 보고 후 · Stage 3 착수 전**이다 (Plan §17.3). P-16은 md·lg만 확정 가능하다.

### 6.4 신규 가값 후보

| ID | 항목 | 사유 |
|---|---|---|
| **P-17** | `TextField.trailingAction` 구분 방식 ("Show"/"Hide") | `Plan D-14 전제` — 밑줄 제거 시 색 단독 구분(WCAG 1.4.1 미달). 디자이너 결정 대기 (§4.8) |
| **P-18 (후보)** | `--list-row-height-min` 56 | Figma basic 행 근거 없음. Stage 3 서재 목록에서 media 행과 함께 재확인 |
| **P-19 (후보)** | CharacterMedallion `ring-offset` | Figma에 ring이 없어 값의 근거가 없다 (§5.1) |

---

## 7. Interaction / Motion

| 대상 | 동작 | 토큰 | reduced-motion |
|---|---|---|---|
| SwipeDeck 카드 진행 | `translateX(±60%)` + fade out, 뒤 카드 전진 | `--motion-duration-base` / `--motion-ease-standard` | **즉시 교체** |
| SwipeDeck 임계 미만 복귀 | 원위치 스프링 | `--motion-duration-fast` / `--motion-ease-spring` | 즉시 |
| ProgressBar 값 변화 | width transition | `--motion-duration-fast` / `--motion-ease-standard` | 즉시 |
| Sheet(SelectTrigger) | Stage 1 §4.21 그대로 | `--motion-duration-base` | fade only |
| ConfirmDialog | Stage 1 §4.22 그대로 | `--motion-duration-fast` | fade only |
| InlineAlert(Trial·offline) | 높이 0→auto + fade | `--motion-duration-fast` | 즉시 표시 |
| Button loading | 라벨 폭 유지 + 내부 Spinner | Stage 1 §4.4 | Spinner 회전 유지(진행 표시) |
| step 전환 | **모션 없음** | — | — |
| TopBar glass 전환 | 스크롤 > 8px에서 glass (`Plan D-13 전제`로 컨테이너 구독 수정 후 동작) | `--motion-duration-fast` | 즉시 |

- 드래그 임계: 카드 폭의 **25%** 또는 속도 기반 — `RECOMMENDED`.
- 자동 재생·자동 전환 애니메이션을 두지 않는다.

---

## 8. 상태 화면과 Mock 시나리오 매핑

> 공통 상태의 **시각 규격은 Stage 1 §5(P-10 확정)** 를 그대로 쓴다. 아래는 "어느 화면에서 어떤 상태가 나오는가"만 정의한다.

| Mock key | 그룹 | 화면 | 상태 표현 |
|---|---|---|---|
| `success` | 전체 | 전 화면 | 정상 |
| `loading` | 전체 | `/auth/consent`(문서), Step 3(검색), Step 5(instrument), 제출 | **Skeleton**(목록·카드 구조), 액션은 **Button loading**. 150ms 미만이면 Skeleton 미표시 |
| `error` | 전체 | 전 화면 | 화면 전체 실패 = `ErrorState` + 카드 내부 "Try again". 부분 실패 = `InlineAlert tone=error` + 인라인 재시도. 폼 입력값 보존 |
| `retry` | 전체 | 〃 | Error → 재시도 → 정상. **입력값·스크롤 위치 유지** |
| `empty` | `books` | Step 3 | 목록 자리 `EmptyState` + **"Add “{query}” as a title"** 경로 (§2.10 Step 3) |
| `offline` | 전체 | 전 화면 | `InlineAlert tone=offline placement=banner`, TopBar 바로 아래 sticky. 수동 닫기 없음 |
| `token-expired` | `auth`,`me` | 전 화면 | **화면 변화 없음**(1회 refresh 후 성공). 2회 실패 시 `/auth/log-in` + Toast "Please log in again." |
| `provider-cancelled` | `auth` | `/auth/welcome`, `/auth/log-in` | **오류 화면이 아니다.** 같은 화면 유지 + `InlineAlert tone=info` "You can pick another way to continue." |
| `consent-missing` | `me`,`consents`,`onboarding` | Guard → `/auth/consent` | 동의 화면. 동의 전 `child_info` 저장 시도는 Mock이 `CONSENT_REQUIRED` 로 거부 → 화면은 동의 화면으로 이동 |
| `consent-version-outdated` | `me`,`consents` | `/auth/consent` | 상단 `InlineAlert tone=info` "Our documents were updated. Please review them again." + 해당 항목 체크 해제 상태로 재수집 |
| `vpc-pending` | `me`,`onboarding` | `/auth/verify-parent` | §2.7 진행 중 |
| `vpc-failed` | `me`,`onboarding` | `/auth/verify-parent` | §2.7 실패 (온보딩 진입 차단 유지) |
| `onboarding-incomplete` | `me`,`onboarding` | Guard → `/onboarding/:step` | 해당 step으로 착지 |
| `draft-resume` | `onboarding` | `/onboarding/:step` | 저장된 step으로 복귀 + 입력값 복원. **별도 안내 문구 없음**(조용한 복귀) — `RECOMMENDED` |
| `persona-fallback` | `onboarding`(submit) | **Stage 2 화면 없음** | Stage 2에서는 submit 응답 parse만 검증한다. `PersonaCard fallback` 표시는 **Stage 2-B** |
| `capability-all-missing` | `onboarding`(submit) | **Stage 2 화면 없음** | 〃 다이아몬드 null 축 표현은 **Stage 2-B**(Plan D-2) |
| `child-limit-reached` | `onboarding`(submit) | `/onboarding/capability-items` 제출 시 | `ErrorState` 대신 `InlineAlert tone=warning` + 안내 "This account already has a child profile." (판정 표현 금지) |

**Mock key가 아닌 상태 (화면에는 존재)**

| 상태 | 화면 | 표현 |
|---|---|---|
| 필수 동의 미체크 | `/auth/consent` | Button `aria-disabled` + 사유 문구 (§2.6) — 서버 왕복 없음 |
| Trial(미인증) 안내 · draft 만료 · draft 손상 | `/onboarding/*` | §2.12 |
| 링크 만료 | `/auth/reset-password` | §2.5 |
| 입력 검증(나이 범위·비밀번호 길이·이메일 형식) | Auth, Step 1 | 필드 `error` + `errorText` |

**Stage 2에서 만들지 않는 상태**: 마이크 권한, 업로드, 분석 대기/실패, 리포트 미충족, 오프라인 캐시 카드 — 각 Stage.

---

## 9. Responsive Rule (#12 확정 규칙 위에서)

| 폭 | 규칙 |
|---|---|
| 320 | `AppColumn` 320, 콘텐츠 폭 272(gutter 24×2). **검증 대상**: 동의 5행(체크박스 22 + 본문 + "View" 링크 줄바꿈), Step 1 년·월 2열(각 ≥ 118px — 미만이면 세로 2행으로 전환), 설문 카드 옵션 라벨 1줄 유지 여부 |
| 393 | Figma 기준 폭. 시각 비교 baseline |
| 600 | 앱 컬럼 480 고정 + 가운데 정렬. 배경 gradient는 뷰포트 전 폭 |
| 1024 | 동일(480 컬럼). 다단 레이아웃 없음 |
| 텍스트 200% (320px) | 모든 화면 세로 reflow. **고정 높이 컨테이너 금지** — 설문 카드·InfoRow·ListRow·medallion 영역 전부 콘텐츠 높이 |

Stage 2 고유 규칙:

1. **Step 1 년·월 2열**: `min-width: 118px` 미만이면 1열 2행으로 전환 (`flex-wrap`). 임계값은 `RECOMMENDED`.
2. **SwipeDeck**: 카드 폭 = 콘텐츠 폭 100%. `--deck-inset-x`(8)·`--deck-peek-y`(16)는 폭과 무관하게 고정.
3. **medallion**: `min(--size-medallion-*, 콘텐츠 폭)` 로 클램프해 320px에서 잘리지 않게 한다.
4. **하단 CTA**: 스크롤 컨테이너 내부에 두어 소프트 키보드에 가려지지 않게 한다 (Stage 1 §2.2).
5. **Chip wrap 그룹**: 줄바꿈 gap `--space-2`, 칩 간 최소 8 유지(터치 44 hit slop과 겹치지 않도록).

---

## 10. Accessibility 메모

| 항목 | 규격 |
|---|---|
| 터치 타깃 | 44×44. 예외 = TextField/SelectTrigger 입력 행 42 → `PASS (accepted: S1-G-2)`. Checkbox·RadioGroup은 행 전체 hit area |
| 포커스 | `:focus-visible` 만, `--color-focus-ring` 2px/offset 2px. Sheet·Dialog는 focus trap + 닫힐 때 트리거 복귀 |
| 위저드 진행 | step 전환 시 제목 `aria-live="polite"`. ProgressBar는 `role="progressbar"` + `aria-valuenow/min/max` + **텍스트 병기**("Step 2 of 5", "n / 10") |
| 설문 카드 | SR 순서 counter → eyebrow → question → 옵션. `RadioGroup` 은 `role="radiogroup"` + `aria-labelledby`(question) + `aria-describedby`(eyebrow + 비채점 caption). 화살표 이동 + Space 선택(roving tabindex) |
| **비채점 옵션** | 색·배경 차이에 의존하지 않는다 — 위치 분리 + 구분선 + caption 텍스트("This one isn't scored.")로 3중 전달 |
| SwipeDeck | 제스처 전용 금지. prev/next 버튼 접근성 이름 "Previous question"/"Next question", 첫·마지막에서 `disabled` + 이유 없이 사라지지 않음. 뒤 카드 `aria-hidden` |
| 동의 화면 | `CheckboxGroup` = `<fieldset>`+`<legend>`. 각 행의 접근성 이름 = 문서 제목 + "Required"/"Optional". Continue는 `aria-disabled="true"` + `aria-describedby`(사유) — **포커스 가능해야 이유를 읽는다** |
| 외부 문서 링크 | 링크 텍스트에 문서명을 포함하고 "Opens in a new tab" 시각 숨김 텍스트 병기 |
| 비밀번호 토글 | `<button aria-pressed>`, 라벨 "Show password"/"Hide password", hit 44 |
| 자동완성 | `name` · `email` · `new-password` · `current-password` · `given-name` · `family-name` |
| 색 단독 금지 | 나이 Tag(텍스트가 본체) · Chip 선택(check 아이콘 병행) · Required/Optional(텍스트) · 로그아웃 행(Dialog에서 경고) · 진행바(수치 텍스트) |
| 대비 | 본문·제목 = 확정 토큰. **보조 텍스트 P-01(2.91~3.13:1) · 비텍스트 P-02 · status P-04 는 미달 가능** — §6.3 실사용처 목록이 재제시 증빙이다 |
| 모션 | `prefers-reduced-motion: reduce` 에서 덱·시트·다이얼로그 모션 제거 (§7) |
| 언어 | 사용자 노출 언어 영어. **진단·판정·비교 표현 금지** — "failed"·"invalid"·"low"·"behind" 금지, `<무슨 일이 있었는지> + <다음에 할 수 있는 것>` 패턴 (Stage 1 §5.0) |
| PII | 화면·알림 문구에 `lastName` 을 쓰지 않는다 (C-6, AC-2-65). 콘솔·에러 로그에 아이 이름·이메일·비밀번호 금지 |

---

## 11. Figma node 참조 · 시각 비교 · 허용 차이

### 11.1 Stage 2 참조 node (조회 2026-09-23)

| 화면 | node |
|---|---|
| Welcome | `179:1701` `179:1702` `179:1703/1704` `179:1707` `179:1708` `179:1709` `179:1710` `179:1715` `179:1719–1722` |
| Create account | `179:1724` `179:1726` `179:1729` `179:1733` `179:1734` `179:1736` `179:1746` (+ 미사용 `179:1737–1745`) |
| Step 1 필드 소스 | `179:1740` (+ 내부 `163:2800–2804`, `76:451–458`) |
| Survey intro | `179:1748` `179:1750/1751` `179:1756–1758` `179:1759` `179:1763` `179:1764` `179:1767` `179:1768` |
| Survey cards | `179:1770` `179:1772/1773` `179:1775/1776` `179:1778` `179:1779/1780` `179:1781` `179:1782` `179:1783` `179:1784–1787` `179:1788–1803` `179:1804` |
| Baseline saved | `179:1809` `179:1813` `179:1814/1815` `179:1819` |
| Log in | `179:1820` `179:1822/1823` `179:1828` `179:1831/1832` `179:1833` `179:1839–1841` `179:1842` `179:1843` `179:1844` `179:1845–1847` |
| Home 헤더 | `26:21` `26:39` `26:44` |
| 컴포넌트 | `163:2145`(ListRow) · `31:118`(SelectTrigger pill, 미사용) · `76:417`(TextField) · `76:428`(trailingAction) · `163:2528`(캐릭터 에셋) |

### 11.2 시각 비교 baseline 제안 (`Plan D-12 전제` — 영역 클립 baseline)

| ID | 대상 | 범위 |
|---|---|---|
| `s2-welcome` | `/auth/welcome` 전체 프레임 | 프레임 |
| `s2-signup` | `/auth/sign-up` **보호자 영역만** (헤더 + FieldGroup + helper) | 영역 클립 |
| `s2-login` | `/auth/log-in` 전체 프레임 | 프레임 |
| `s2-intro` | `/onboarding` 카드 + InfoRow 2행 | 영역 클립 |
| `s2-survey-card` | Step 5 덱(카드 3장 + 진행바) | 영역 클립 |
| `s2-saved` | `/onboarding/saved` 전체 프레임 | 프레임 |
| `s2-home-header` | `/` 헤더(워드마크 + 설정 아이콘) | 영역 클립 |
| `s2-selecttrigger` · `s2-inforow` · `s2-listrow` · `s2-dividerlabel` · `s2-deck` | 신규 컴포넌트 (dev gallery) | 영역 클립 |

- 전체 프레임 baseline은 레이아웃 회귀 전용(`0.002 / 200`), 영역 클립은 Figma 대조용(`0.002 / 20`) — `Plan D-12 전제`.
- Stage 1의 `AD-1`~`AD-10` 은 **그대로 적용**된다.

### 11.3 Stage 2 허용 차이 (사전 등록 — QA는 FAIL 처리하지 않는다)

| ID | 차이 | 원인 | 허용 범위 |
|---|---|---|---|
| **AD-S2-1** | `/auth/sign-up` 에서 Figma `179:1737–1745`("YOUR CHILD" FieldGroup + 단일 동의 체크박스)를 **렌더하지 않음** | `CONFIRMED (C-5 · C-1)` — 가입 화면은 보호자 정보만, 동의는 별도 화면 | 해당 영역 전체 차이 허용. 비교는 보호자 영역 클립으로 수행 |
| **AD-S2-2** | Welcome·Log in에 **Apple 버튼 추가** (Figma에 없음) | `CONFIRMED (C-13 · M-16)` — Apple 공식 가이드 버튼 | 버튼 1개분 레이아웃 차이 허용 |
| **AD-S2-3** | 소개 화면 medallion **200 → 188** | P-16 3단계 스케일 흡수 (§5.1) | 지름 ±12px |
| **AD-S2-4** | Step 1 아이 이름 **1행 → 2행**(First/Last 분리) | `CONFIRMED (C-6 · D-03)` | FieldGroup 행 1개 증가 허용 |
| **AD-S2-5** | 생년월 **자유 텍스트 → 년·월 SelectTrigger** | `Plan D-10 전제` (오입력·로캘) | 컨트롤 형태 차이 허용 |
| **AD-S2-6** | 성별 **pill(Tag) → SelectTrigger `row`** | "Prefer not to say" 라벨 길이 · 터치 44 · 320px reflow | 행 1개 증가·형태 차이 허용 |
| **AD-S2-7** | 덱 카드 fill `.85` → `--color-surface-strong`(.90), radius 30 → 28 | 토큰 스케일 흡수 (#10-②) | 알파 ±0.05, radius ±2 |
| **AD-S2-8** | InfoRow radius 20 → 22, fill `.72` → a74 | 〃 | radius ±2, 알파 ±0.02 |
| **AD-S2-9** | Step 5 TopBar trailing IconButton **x=372 → 우측 gutter 24(x=331)** | Figma 값이 프레임(393)을 17px 넘어간다 (§13.2 ①) | 위치 차이 허용. 구현은 gutter 정렬 |
| **AD-S2-10** | 소개 화면 InfoRow 문구 변경 (10 cards → 5단계 기준) | Figma 문구가 Step 5만 설명 (§13.2 ②) | 문구 비교 제외 (`AD-9` 확장) |
| **AD-S2-11** | Step 5 RadioGroup **6옵션**(Figma 5옵션) | `CONFIRMED (C-8 · D-04)` | 옵션 1개분 + 구분선·caption 차이 허용 |
| **AD-S2-12** | Button 높이 58 → 56, 폭 341/345 → 컬럼 100%(gutter 24) | `가값 P-15 확정(56)` + `AD-10` gutter 통일 | 높이 ±2, 좌우 ±2 |
| **AD-S2-15** | `/onboarding` 소개 화면(`179:1748`)의 **제목 `179:1757` · 본문 `179:1758` · CTA 라벨 `179:1768`** 문구가 Figma와 다름 | Figma 문구를 그대로 쓸 수 없다 — ① 제목이 아이 이름("Yuna")을 부르지만 이 화면은 **이름을 받기 전**이다 (이름은 Step 1 수집, C-6) ② "Ten short questions" · "Start the questions" 는 **Step 5(10문항)만** 설명하는데 실제 온보딩은 5단계다 (§13.2 ②) — 이미 등록된 `AD-S2-10`(InfoRow 문구)과 **같은 사유**이며 그 등록이 제목·본문·CTA 를 덮지 못했을 뿐이다 ③ "No right answers" 의 **의미는 보존**했다 (진단·판정 금지, `rules/frontend.md` §8) | 해당 3개 텍스트의 **문구 비교 제외** (`AD-9` · `AD-S2-10` 확장). 블록 수·위치·크기·톤 차이는 허용하지 않는다. **최종 문구는 `S2-COPY-1` 결정에 묶여 있다** |
| **AD-S2-16** | 화면 **하단 앵커 블록이 앱 컬럼 맨 아래에 붙는다** — Figma 프레임은 하단 약 44px(iOS home indicator 영역, `179:1723`·`179:1747`·`179:1818` `y=838`)을 비우고 버튼·각주를 `y≈750`/`788` 에 두지만, 데스크톱 baseline 은 `y≈796` 이다 | 그 44px 은 **`--layout-safe-bottom`(= `env(safe-area-inset-bottom)`)** 이 맡는 영역이고 데스크톱 브라우저에서는 `env()` 가 `0px` 이다. Figma 상단 status bar 56px 을 `--layout-safe-top` 으로 흡수한 것과 **같은 처리**다. QA 가 근거를 직접 검증했다 (safe-area 주입 시 오차 46px → 2px) | **하단 앵커 요소의 세로 위치 ±48px**. 블록 순서·간격·크기 차이는 허용하지 않는다. 대상: `/auth/welcome` 각주 · `/auth/sign-up` CTA · `/auth/consent` CTA · `/onboarding` CTA · `/onboarding/saved` CTA |
| **AD-S2-17** | 텍스트 크기 흡수 **30 → 28**(`--text-title-1`) — `/auth/log-in` 제목 `179:1831` (Figma 30px, 박스 h=36) | `AD-6` 흡수표(11.5→11 · 12.5→12 · 14.5→15 · 21→22 · 27→28)에 **30 항목이 없다**. 이웃 스타일은 `title-1` 28(Δ−2) 과 `large-title` 34(Δ+4) 뿐이고 **신규 텍스트 스타일은 만들지 않는다**(#10-②) → 가까운 28 을 배정한다 (`DESIGN_TOKEN_MAP` §3.3 "두 스타일 사이 값의 택1은 design-agent") | font-size ±2 · line-height 36 → 34(±2). **`/onboarding/saved` 제목 `179:1813`(27/33)은 `AD-6` 의 27→28 항목이 그대로 덮으므로 신규 등록 없이 `--text-title-1`** 이다 (`QA-2-005`) |

- `AD-S2-14`(Home 워드마크 텍스트 렌더)는 `docs/qa/stage-2-home-handoff.md` 에 기록되어 있으며, 에셋화 여부가 `S2-HOME-1`(디자이너 결정) 으로 열려 있어 이 표에 확정 등록하지 않는다.
- `AD-S2-13`(Apple 버튼 glass 표면)은 `docs/qa/stage-2-auth-handoff.md` §6 에 기록되어 있다. 이번 갱신 지시 범위(`AD-S2-15`·`AD-S2-16`)가 아니므로 이 표에 옮겨 적지 않았다 — §11.3 등록 여부는 별도 결정 사항이다.

---

## 12. 판단 보고 (Plan §15.8 대응)

### 12.1 ★ Step 5 완료 직후의 전이 지점 — Stage 2에서 어떻게 처리하는가

PRD §5.1 흐름은 `Step 5 완료 → ③ 프로필 결과 → ④ 발전 역량 선택 → Home` 이다. ③④가 **Stage 2-B**(디자이너 대기)이므로 Stage 2에는 전이 공백이 생긴다.

**권장안**: `/onboarding/saved` `179:1809` 의 "Get started" 를 **`/` (Home skeleton)로 직결**한다. 임시 화면·임시 문구를 만들지 않는다.

| 근거 | 내용 |
|---|---|
| ① | `POST /v1/onboarding/submit` 은 **동기 응답**으로 `ProfileResult` 를 돌려준다. "분석 대기"가 아니므로 대기 화면(pending)을 만들면 **존재하지 않는 상태를 디자인**하는 것이 된다 |
| ② | Figma `179:1809` 의 prototype 연결이 이미 `26:21` Home 이다 (FIGMA_SCREEN_MAP §흐름 M-07). Stage 2는 **Figma 원형 그대로**이고, Stage 2-B가 그 사이에 2화면을 삽입한다 |
| ③ | 임시 안내("Your profile is being prepared")는 **사실이 아니며**, 나중에 삭제할 문구를 copy 모듈·테스트·baseline에 남긴다 |
| ④ | `179:1813` "Thank you — that's the starting point" 자체가 이미 종결 문구로 성립한다 |

**대안(기각)**

| 대안 | 기각 사유 |
|---|---|
| `/onboarding/saved` 에 "프로필 준비 중" 안내 추가 | 실제 상태가 아님. Stage 2-B에서 전부 되돌려야 함 |
| `/onboarding/profile` 를 임시 화면(점수 텍스트 목록)으로 선구현 | C13-09를 디자이너에게 맡긴 결정(approvals §2·§3)을 우회. "판정 아님" 톤이 가장 중요한 화면을 임시 디자인으로 노출 |
| Step 5 완료 후 Home 대신 설정으로 보냄 | 근거 없음 |

**Stage 2-B 진입 시 변경 지점(미리 고정)**: ① router에 `/onboarding/profile` · `/onboarding/growth-capability` 2 route 추가 ② `/onboarding/saved` CTA 목적지를 `/onboarding/profile` 로 교체 ③ `resolveGuardDecision` 은 변경 없음(`Plan D-6 전제`). **①②만 바뀌므로 Stage 2 구조를 되돌릴 필요가 없다.**

### 12.2 ★ P-16 medallion 실측 (Plan §15.8-1)

§5.1 표 참조. 요약: **lg 232 · md 188 = Figma 실측 확정**, **sm 136 = Stage 2 사용처 없음 → 가값 유지(Stage 4 재실측)**, Intro 200 = md로 흡수. `ring-offset` 은 Figma에 ring 자체가 없어 **값의 근거가 없다** → 가값 유지 또는 토큰 폐기 (`NEEDS DECISION`).

### 12.3 Plan §16 `D-xx` 권장안에 대한 design-agent 의견

| D | 의견 | 비고 |
|---|---|---|
| D-1 `lastName` 선택 | **동의** | 화면은 "Last name (optional)" 로 표기 |
| D-2 `score: null` | **Stage 2-B로 이관에 동의** | 다이아몬드 표현이 결정의 본체다 |
| D-3 draft 저장소·30일 | **동의** | 화면 영향 = 만료 안내 1건(§2.12) |
| D-4 동의 문서 외부 링크 | **동의**. 단 외부 링크 표식(아이콘 + "Opens in a new tab")을 **명세에 추가**했다 (§4.6) | |
| D-5 Guard 순수 함수 | 동의 (UI 영향 없음) | |
| D-6 프로필 Guard 제외 | **Stage 2-B로 이관에 동의** | §12.1 ③과 정합 |
| D-7 로그아웃 ConfirmDialog | **동의** | destructive, 초기 포커스 = 취소 |
| D-8 신규 Shared UI 6종 | **동의**. 추가 제안 없음. `SectionLabel` 은 **recipe로 해결**해 7종이 되지 않게 했다 (§4.7) | |
| **D-9 SwipeDeck 구현** | **부분 이견** — "라이브러리 미도입 + 버튼/키보드 1급"에는 전적으로 동의하나, **`CSS scroll-snap` 은 권장하지 않는다.** `overflow-x: auto` 컨테이너가 `AppColumn` 안에 생기면 Stage 1 §2.2 확정(“AppColumn 안쪽 요소에 `overflow-*` 선언 금지”)을 위반하고 카드 `--shadow-glass-*`(가로 28px 번짐)가 잘린다. **Pointer Events + `transform`** 을 권장한다 (§4.2) | 결정 필요 |
| D-10 년·월 SelectTrigger | **동의** (`AD-S2-5` 등록) | 년 범위 = 오늘 기준 3.0~9.99세를 만족하는 연도만 노출 |
| D-11 저장 트리거 | **동의**. 화면에 "저장 중" 표시를 두지 않는 것으로 명세 (§2.9) | |
| D-12 영역 클립 baseline | **동의** — §11.2에 Stage 2 목록을 제안했다 | |
| D-13 `useScrolledPast` | **동의** — Stage 2에서 TopBar glass 전환이 첫 실사용이다 | |
| **D-14 trailingAction 밑줄** | **동의(권장안 채택)** + 보완 3가지를 명세에 넣었다. 신규 가값 `P-17` 등록 (§4.8) | |
| D-15 브랜드 에셋·의존 0건 | **동의**. 단 **Apple 공식 버튼 규격이 glass 표면과 충돌할 수 있다** — 충돌 시 Apple 규격 우선 + 허용 차이 등록 (§13.1 ③) | 확인 필요 |
| D-16 관계·타임존 분리 전송 | **동의**. 화면은 1개지만 요청이 2개인 점을 구현 메모에 남겼다 (§14) | |
| D-17 책 검색 최소 범위 | **동의**. `empty → 제목 직접 입력` 경로를 필수로 명세했다 (§2.10 Step 3) | |

### 12.4 Plan §15.8-4 — 시각 비교 사전 기록

`179:1724` 의 "YOUR CHILD" 섹션·단일 체크박스를 사용하지 않는 것은 **`AD-S2-1` 허용 차이**로 §11.3에 등록했다.

### 12.5 Plan §17.1 — Stage 1 문서 갱신 7항목 반영 확인

| # | 대상 | 상태 |
|---|---|---|
| 1 | Stage 1 §4.19 `PageIndicator interactive` 폐기 | **반영 완료** (`S1-G-1`) |
| 2 | Stage 1 §8.1 탭 아이콘 `book` · `chart-no-axes-column-increasing` | **반영 완료** (`S1-D2-5`) |
| 3 | Stage 1 §9.3 TextField 42px 행 + `S1-G-2` | **반영 완료** |
| 4 | Stage 1 §10.3 임계값 `0.002 / 200` | **반영 완료** (`S1-D2-6`) |
| 5 | Stage 1 §2.2 스크롤 컨테이너·sticky 정정 | **반영 완료** |
| 6 | Stage 1 §3.6 남은 가값 5건 | **반영 완료** |
| 7 | `docs/COMPONENT_MAP.md` 1·2·3 반영 + Stage 2 6종 행 | **반영 완료** (2026-09-23 갱신 주석 확인) |

---

## 13. Figma 누락 / 불일치 / 승인 필요

### 13.1 승인·결정이 필요한 항목 (design-agent가 정하지 않는다)

| # | 항목 | 필요한 결정 |
|---|---|---|
| ① | **Stage 2 route 수** — Plan §9.1은 15개, approvals §3 분리에 따르면 Stage 2는 **14개**(`/onboarding/profile` · `/onboarding/growth-capability` 제외) | Plan 표기 정정 여부 (plan-agent 소관) |
| ② | **Layout 배정 불일치** — Plan §9.1 "Fullscreen" ↔ Stage 1 §2.3 "StackLayout". 이 문서는 **StackLayout** 을 채택했다 (§1.3) | 확정 필요 (AC-2-59 reflow와 직결) |
| ③ | **Apple 버튼 규격 vs glass 표면** — Apple 공식 가이드(색·모서리·여백·라벨)가 `Button variant=glass` 와 충돌할 경우 Apple 규격 우선 | 승인 + 허용 차이 등록 |
| ④ | **비밀번호 재설정 resend** — PRD·Figma 근거 없어 명세에서 제외 | 필요하면 추가 승인 |
| ⑤ | **Step 5 진행 의미 이중화** — 진행바가 Step 1–4는 5단계, Step 5는 10문항 | 권장안(병기) 승인 |
| ⑥ | **Step 2 기질 "카드"의 형태** — 이미지·일러스트 카드 에셋 없음 → `RadioGroup variant=card` 로 해석 | 디자이너 의도 확인 |
| ⑦ | **`179:1804` refresh 아이콘 동작** — Figma 미정의(M-36) → "Clear this answer" 로 명세 | 확정 필요 |
| ⑧ | **Home skeleton EmptyState 문구·일러스트 유무** — 일러스트 없음으로 명세 | copy 승인 |
| ⑨ | **medallion `ring-offset`** — Figma에 ring 없음 | 토큰 유지 / 폐기 |
| ⑩ | **`CharacterBubble` Stage 2 사용 여부** — Plan §15.4는 "Welcome·Intro 인사"로 적었으나 두 화면의 Figma는 **버블이 아니라 본문 텍스트**다 | Stage 3으로 이월 확인 |
| ⑪ | **동의 항목 문구·필수 여부** | 법무 **L-02** |
| ⑫ | **VPC 방식·문구** | 법무 **L-01** |
| ⑬ | **`lastName` 수집 적합성** | 법무 **L-07** |
| ⑭ | **Step 1 관계/언어/루틴, Step 2 기질, Step 4 목표의 옵션 값·문구** | contracts 확정 + copy 소유자 |

### 13.2 Figma 내부 불일치 · 신규 발견 (2026-09-23 실측)

| # | 항목 | 실측 | 처리 |
|---|---|---|---|
| ① | **`179:1775`(Step 5 forward IconButton) 가 프레임을 벗어난다** — x=372, w=38 → 우측 끝 410 > 프레임 393 | 17px 초과 | 구현은 gutter 24(x=331) 정렬. `AD-S2-9` + 디자이너 수정 요청 |
| ② | **`179:1763` "About 3 minutes · 10 cards" / `179:1767` "Swipe each card away"** 가 5단계 온보딩 소개 화면에 붙어 있으나 **Step 5만 설명**한다 | — | 문구 교체 필요(숫자는 design-agent가 정하지 않음). `AD-S2-10` + 디자이너·copy 요청 |
| ③ | **medallion 3종 크기 혼재** 188 / 200 / 232 (Stage 2 화면 내) | 실측 | 3단계 스케일로 흡수(`AD-S2-3`), 디자이너 확인 요청 |
| ④ | **Button 규격 2종 혼재** — 소셜/보조 `341×56`(x=26), 주 CTA `345×58`(x=24) | 실측 | `--button-height-lg` 56 확정값 + gutter 24 통일(`AD-S2-12`, `AD-10`) |
| ⑤ | **설문 카드(`179:1783`) 내부 간격 환산 정확도** (2026-09-27 재실측) — eyebrow `179:1786` bottom 92 → question `179:1787` y 99 = **7**(명세 `--space-1` = 4), question 박스 bottom 203 → 옵션 `179:1788` y 248 = **45**(명세 `--space-6` = 24). 질문 박스 104 는 **4행 기준 높이**여서 실제 렌더 행수에 따라 잔여가 달라진다 | 실측 | **이번 개정 범위 밖**(`S2-TOKEN-1` 4건에 포함되지 않음). 값을 바꾸지 않고 기록만 한다 — 조정은 카드 실측 baseline 과 함께 판단해야 하며 사용자·Orchestrator 결정 사항 |
| ⑤ | **덱 카드 fill/radius 가 컴포넌트 값과 다름** — `179:1782` `rgba(255,255,255,.85)` / radius 30 (Surface는 .90 / 28) | 실측 | 토큰 흡수 `AD-S2-7` |
| ⑥ | **InfoRow radius 20 / fill .72** (semantic은 22 / .74) | 실측 | 토큰 흡수 `AD-S2-8` |
| ⑦ | **`179:1740` 아이 이름이 한 칸**("Haru, Kim")인데 라벨은 "Child's last name \| first name" | 실측 | 2칸 분리 (C-6·D-03), `AD-S2-4` |
| ⑧ | **Step 5 옵션 행 43px** (`179:1789`) — 터치 44 미달 | 실측 | 44로 확장 (Stage 1 §4.17 확정 규칙) |
| ⑨ | `179:1813` weight Black(1000) | 실측 | Inter 최대치 근사 (`AD-2`) |

### 13.3 PRD ↔ Figma 불일치 (Stage 2 범위, 표 형식)

| 항목 | PRD (섹션/ID) | Figma (node id) | 영향 | 결정 필요 |
|---|---|---|---|---|
| 온보딩 소요 시간·범위 문구 | §7.2 (5단계) | `179:1763` "About 3 minutes · 10 cards" | 사용자가 Step 5만 있다고 오해 | **Yes** — copy (§13.1 ⑤·⑧ 관련) |
| 설문 옵션 수 | §7.2 Step 5 + C-8 (빈도 5 + 비채점 1 = **6**) | `179:1788–1803` = **5** | 옵션 1개 추가 → 레이아웃 차이 | Resolved (C-8·D-04) — `AD-S2-11` |
| 가입 화면 아동 정보 | NFR 최소 수집 / §7.2 Step 1 | `179:1737–1745` 가입 화면에 아이 정보·단일 동의 | 동의 전 아동 PII 입력 위험 | Resolved (C-5·C-1) — `AD-S2-1` |
| 동의 구조 | FR-02 (5항목 개별) | `179:1742/1745` 단일 체크박스 | 개별 동의 기록 불가 | Resolved (C-1) — 화면 신규 명세 |
| Apple 로그인 | FR-01 | 없음 (`179:1709` Google만) | App Store 4.8 | Resolved (C-13) — `AD-S2-2` |
| 프로필 결과·발전 역량 | §7.3 / FR-04·05·06 | frame 없음 | 온보딩 종착점 부재 | Resolved (C-13 ①) — **Stage 2-B** |
| 비밀번호 재설정 | FR-01 §6.2 | 링크 `179:1843` 만 | 화면 4상태 부재 | Resolved (C-13 ②) — §2.4·§2.5 명세 |
| 설정 목록 | §7.8 / C-16 | 진입 아이콘 `26:44` 만 | 로그아웃 경로 부재 | Resolved (C-13 ②) — §2.14 명세 |

### 13.4 디자이너 요청 목록 (Figma 수정 — design-agent는 수정하지 않는다)

| # | 요청 | 근거 |
|---|---|---|
| 1 | **`C13-09` 프로필 결과 · `C13-10` 발전 역량** 화면 디자인 | approvals §2 3차 그룹 → `docs/design/stage-2-designer-request.md` |
| 2 | `179:1775` 위치를 프레임 안(우측 gutter 24)으로 수정 | §13.2 ① |
| 3 | `179:1724` 의 "YOUR CHILD" 섹션·단일 체크박스 제거 (또는 별도 동의 화면 추가) | C-5·C-1 |
| 4 | `179:1748` InfoRow 문구를 5단계 기준으로 교체 | §13.2 ② |
| 5 | `179:1770` 에 **6번째 비채점 옵션** 반영 | C-8 |
| 6 | medallion 크기 3단계 통일(sm/md/lg) 확인 | §13.2 ③ |
| 7 | Button 규격 2종(56/58, gutter 24/26) 통일 | §13.2 ④ |
| 8 | 덱 카드·InfoRow 의 fill/radius를 명명된 스타일에 바인딩 | §13.2 ⑤⑥ |
| 9 | Apple 로그인 버튼 프레임 추가(공식 가이드 기준) | C-13 |
| 10 | Figma 화면 없는 Stage 2 화면 8건(재설정 2 · 동의 · VPC · Step 2·3·4 · 설정 · Home 본문)은 **이 명세가 소스**임을 Figma에 표기하거나 사후 반영 | C-13 ② |

---

## 14. development-agent 인계 메모

1. **Production Code는 development-agent만 작성한다.** 이 문서의 값은 전부 토큰 이름이다. **2026-09-27 개정으로 semantic 토큰 2건(`--space-7` 28 · `--space-10` 40)이 추가 대상이 되었다**(§6.1 — 렌더 값 변화 없음). Tier-3 토큰 5건은 `packages/ui` 내부에 추가한다(§6.2).
2. **`Plan D-xx` 전제 표기가 붙은 절은 승인 전 구현하지 않는다.** 특히 D-9(SwipeDeck 구현 방식)는 §12.3의 이견을 포함해 결정이 필요하다.
3. **Stage 2-B 항목을 선구현하지 않는다**: `CapabilityDiamondChart` · `PersonaCard` · `/onboarding/profile` · `/onboarding/growth-capability` · Plan D-2 · D-6.
4. **`overflow-*` 규칙**: `AppColumn` 안쪽 요소에 `overflow` 를 선언하지 않는다. SwipeDeck·Chip wrap·목록 모두 해당한다 (Stage 1 §2.2, `QA-1-L1` 회귀).
5. **문구는 전부 copy 모듈**(`features/*/copy`)에 둔다. 동의 항목·설문 문항·페르소나는 **API(Mock) 응답 값만** 표시한다. 이 문서의 영어 문장은 예시이며 승인 대상이다.
6. **`aria-disabled` 패턴**: 필수 동의 미체크 시 Continue를 `disabled` 로 두지 말고 `aria-disabled` + `aria-describedby` 로 사유를 읽을 수 있게 한다.
7. **Step 1은 화면 1개 / 요청 2개**(`PATCH /v1/me` + `PUT /v1/onboarding/steps/child_info`) — `Plan D-16 전제`.
8. **Trial 구간 요청 0건**: `/onboarding/*` 미인증 상태에서 어떤 API도 호출하지 않는다. 화면에 동기화 표시를 두지 않는다.
9. **시각 baseline**: §11.2 목록 + §11.3 허용 차이를 QA에 그대로 전달한다.
10. `provisionalItems.ts` 는 남은 5건 + 신규 `P-17`(§6.4)로 갱신한다.
11. **2026-09-27 개정 2가 요구하는 구현 변경** (문서 항목 4건 처리 결과. 이 순서로 하고, ②③ 은 한 번에 처리해 baseline 재생성을 1회로 묶는다):
    ① `packages/design-tokens/src/semantic/space.css` 에 `--space-7: calc(var(--spacing) * 7)` /* 28 */ · `--space-10: calc(var(--spacing) * 10)` /* 40 */ 추가 (§6.1). **렌더 값 변화 없음** — 기존 `gap-7`/`pt-10`/`gap-10` 과 같은 값이다. 새 화면 값을 만들지 않는다.
    ② `/onboarding/saved` 제목 `title-2` → **`title-1`** (`OnboardingSaved.tsx` 1줄, §2.11). 결과: 제목 박스 56 → 68, 3 : 2 재분배로 일러스트가 약 **10px 위로** 올라가 Figma 163 에 가까워진다(현 +8.8 → 약 +1.6). **baseline 재생성 대상은 `e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-saved.png` 1건이다** (`s2-welcome`·`s2-onboarding-intro`·`s2-onboarding-step5`·`s2-deck` 은 영향 없음).
    ③ `/auth/log-in` 제목 `title-2` → **`title-1`**, 부제 → 소셜 버튼 간격 `gap-6`(24) → **`--space-10`(40)** (§2.3). **baseline 재생성 대상은 `s2-login.png` 1건이다.** 이 칼럼의 다른 간격(소셜↔divider↔폼 = 현재 `gap-6`)은 이번 개정 대상이 아니다 — 함께 바꾸지 않는다.
    ④ `entities/character/character.css` 의 "축소 순서 ② (일러스트 비율 축소) 구현" 주석을 실제 동작(spacer 최소값 → 스크롤)으로 정정 (§2.11 · `QA-2-006`). **동작·렌더 변경 없음, 주석만.**
    ⑤ **변경하지 않는 것**: `/onboarding` 소개 화면(현재 `gap-7` = 28 이 개정된 명세와 일치) · `/auth/welcome`(`pt-10` = 40 유지) · `/auth/sign-up`(`pt-10` = 40 하한 유지) · `SurveyQuestionCard`(`gap-10` = 40 유지) · §2.11 일러스트↔제목 `--space-8`(32) 유지.

---

## 15. 요약

| 항목 | 값 |
|---|---|
| 명세한 화면 | **16** (Figma 근거 7 + C-13 명세 9) + 화면 아닌 상태 1(`C13-11`) |
| C-13 처리 | **11건 전부 명세** (`C13-01`~`08` · `11`~`13`), `C13-09`·`C13-10` = **Stage 2-B** |
| 신규 Shared UI | **6종** (Plan D-8 범위 그대로, 추가 없음) |
| 신규 semantic 토큰 | **2건 제안** — `--space-7`(28) · `--space-10`(40). 스케일 2단계 추가, 렌더 값 변화 없음 (§6.1, 2026-09-27 `S2-TOKEN-1`) |
| 신규 Tier-3 토큰 | 5건 (`--deck-inset-x` · `--deck-peek-y` · `--deck-depth` · `--list-row-height-min` · `--select-trigger-height`) |
| 신규 가값 | `P-17` (확정 후보) + `P-18`·`P-19` 후보 |
| 확정된 가값 | **P-16 부분 확정** — md 188 · lg 232 (Figma 실측), sm 136은 유지 |
| 허용 차이 | `AD-S2-1` ~ `AD-S2-12` + `AD-S2-15` · `AD-S2-16` · `AD-S2-17` (15건) 사전 등록 (§11.3) |
| 결정 대기 | §13.1 14건 (그중 법무 3건) + Plan D-9 이견 1건 |
