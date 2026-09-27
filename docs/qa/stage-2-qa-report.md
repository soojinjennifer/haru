# Stage 2 QA Report — Auth · Consent · Onboarding · Child Profile · Home skeleton

Status: **PASS** (재검증 3회차 — 2026-09-27, stage-qa-agent) · 2회차 **INCOMPLETE** (2026-09-27) · 1회차 **FAIL** (2026-09-26)
Step: `docs/workflow/stage-2/stage-2-QA.md` · 규칙: `.claude/rules/qa.md`

---

## 1. Summary

> **이 리포트는 2회차(재검증)까지 누적 기록이다.** 각 절의 1회차 판정은 남겨 두고, 재검증 결과를
> `→ 2회차` 로 덧붙였다. 변경 이력 요약은 §14.

| 항목 | 1회차 (2026-09-26) | **2회차 재검증 (2026-09-27)** |
|---|---|---|
| **Stage Verdict** | **`FAIL`** | **`INCOMPLETE`** |
| 근거 | `FAIL` 2건 (`QA-2-001` · `QA-2-002`) | `FAIL` **0**건 · `PARTIAL` **1**건 (AC-2-56) → `rules/qa.md` §2 "FAIL 0 + PARTIAL ≥ 1 → INCOMPLETE" |
| 실행 일시 | 23:30 ~ 00:05 (KST) | 00:40 ~ 01:15 (KST) |
| 대상 | working tree, HEAD `ff5b9c7` | working tree (QA 수정 1회차 반영), branch `main`, HEAD `ff5b9c7` (미커밋) |
| 공통 명령 | 8종 전부 통과 (유닛 997 · e2e 113) | **전부 재실행·통과** — 유닛 **1000/1000** · e2e **121/121** (§3) |
| 결함 | 마우스 클릭 불가 · `/onboarding/saved` CTA 위치 | **둘 다 해소.** 잔여 1건 = `179:1809` 일러스트·여백 Figma 불일치 (`QA-2-004`, 신규 Medium) |

2회차 결과 요약:

| Finding | 1회차 | 2회차 | 근거 |
|---|---|---|---|
| `QA-2-001` (High) | `FAIL` | **`RESOLVED`** | 마우스·키보드·터치·제스처 4경로를 QA 가 headless + headed 로 직접 재현 (§6.1) |
| `QA-2-002` (Medium) | `FAIL` | **`RESOLVED`** | safe-area 적용 시 CTA `y=752 / h=56` ↔ Figma `y=750 / h=58` — **±2px** (§7.1) |
| `QA-2-003` (Low) | `FAIL`(AC-2-56 사유) | **`RESOLVED (등록)`** | `AD-S2-15` 로 허용 차이 등록됨. Design Spec §11.3 반영은 `S2-DESIGN-1` 로 추적 |
| `S2-HOME-2` | QA 수동 대조만 | **`RESOLVED`** | 3개 node 전부 `REGION_SNAPSHOT`(D-12 `0.002/20`) 자동 baseline 추가·통과 |
| **`QA-2-004` (Medium)** | — | **신규 `FAIL` Finding** | `179:1809` 일러스트가 Figma 대비 **높이 −48px · 위치 −117px** → 캐릭터↔제목 여백 **Figma 59px vs 구현 282px**, 등록된 `AD-S2-*` 없음 (§7.2) |

### 1.1 3회차 재검증 (2026-09-27) — **`PASS`**

> 3회차 지시 범위: `QA-2-004` 재판정 · `AC-2-56` 재판정 · `S2-DESIGN-3`(+5.8px) 판단 ·
> 새 에셋 부수 영향 · §2.11 축소 순서 실증 · 공통 검증 명령 재실행. 신규 Finding 은 `QA-2-005` 부터.

| 항목 | 3회차 (2026-09-27) |
|---|---|
| **Stage Verdict** | **`PASS`** |
| 근거 | In Scope 65건 중 `FAIL` **0** · `PARTIAL` **0** · `NOT VERIFIED` **0** → `rules/qa.md` §2 |
| 대상 | working tree (QA 수정 2회차 계속분 반영), branch `main`, HEAD `ff5b9c7` (미커밋) |
| 공통 명령 | 9종 **전부 QA 가 직접 재실행·통과** — 유닛 **1000/1000** · e2e **121/121** (§3.2) |
| `QA-2-004` | **`RESOLVED`** — 일러스트 박스 `307×415` = Figma **Δ0**, 캐릭터↔제목 여백 **Δ −4.2px**(2회차 +223px), 에셋 `614×830` = 정확히 2.0x (§7.5) |
| `AC-2-56` | `PARTIAL` → **`PASS`** (§5.10 · §7.5.5) |
| 신규 Finding | `QA-2-005`(Low) · `QA-2-006`(Low) · `QA-2-007`(Low) — **3건 모두 design-agent 소관 문서 항목이며 Verdict 를 막지 않는다** (§8) |

**판정을 가른 지점**: 2회차 `QA-2-004` 의 실체(일러스트 높이 −48px · 위치 −117px · 빈 띠 +223px)가
**세 지표 모두 ≤9px 로 축소**되었고, 남은 편차 하나하나가 등록된 허용 차이(`AD-S2-12` · `AD-S2-16` ·
`AD-1` · `AD-6`) 또는 **승인된 Design Spec 규칙**(§5.2 `margin-inline: auto` · §2.11 3 : 2 분배)로
설명된다. AC-2-57 이 승인 소스를 "Figma **또는** stage-2 design spec" 으로 정의하므로, 승인된
Design Spec 을 정확히 따른 구현은 일치로 본다. QA 가 **직접 실측한 증거**는 §7.5 다.

> **사용자에게 남기는 판단 재료**: `QA-2-005`(제목 타이포 토큰 배정 — Figma node `179:1813` 는 27/33
> 인데 §2.11 은 `--text-title-2` 22/28 을 지정)는 **등록된 흡수표(`AD-6`: 27→28)에 없는 배정**이다.
> QA 는 이를 **은폐하지 않고 Finding 으로 남기되**, ① 3회차 수정이 만든 회귀가 아니고 ② **승인된
> Design Spec 이 지시한 값**이며 ③ 같은 배정이 Stage 2 전반(`/auth/log-in` `179:1831` = 30px → `title-2`)
> 에 이미 적용되어 1·2회차에서 통과한 기존 상태라는 세 근거로 **Verdict 를 막지 않는다**고 판정했다.
> 사용자가 "등록되지 않은 Figma 불일치는 Stage Gate 를 막아야 한다" 고 판단하면 AC-2-56 은
> `PARTIAL`, Verdict 는 `INCOMPLETE` 로 되돌아간다. **QA 는 스스로 수용하지 않았고, 판단 근거를 모두 공개한다.**

---

**Verdict 가 `PASS` 가 아닌 이유는 단 하나다**: AC-2-56(Figma 일치)이 `179:1809` 한 node 때문에 여전히 `PARTIAL` 이다.
이것은 플로우를 막는 결함이 아니라 **디자인 소스 결정이 필요한 불일치**이며, ① 일러스트 에셋 재export(세로비 0.74) ② Design Spec §2.11/§5.2 조정 ③ 허용 차이 `AD-S2-17` 등록 중 하나로 해소된다. QA 는 스스로 수용하지 않는다.

---

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS (darwin 25.5.0) |
| Node | v24.21.0 · pnpm 12.4.2 |
| 브라우저 | Playwright 번들 Chromium 1.63.0 (headless + **headed 교차 확인**) |
| Viewport | 393×852 / 393×600 / 393×420 / 320 / 600 / 1024, `deviceScaleFactor: 1`, `reducedMotion: reduce` |
| Mock 모드 | `VITE_API_MODE=mock` (dev 서버 `http://localhost:4399`) |
| Mock scenario | URL `?scenario=` 로 `me:consent-missing` · `onboarding:consent-missing` · 기본 `success` |
| 실기기 | 없음 (Capacitor 미도입 — Stage 4) |
| **2회차 추가** | dev 서버 `http://localhost:4399` (`VITE_API_MODE=mock`) · Playwright e2e 서버 `127.0.0.1:4319` · safe-area 에뮬레이션(`--layout-safe-top:56px` / `--layout-safe-bottom:44px` 강제 주입)으로 실기기 프레임 재현 · 200% 텍스트 확대(`html{font-size:32px}`) |

QA 산출물: `docs/qa/evidence/stage-2/` (Figma 참조 3건 + 구현 스크린샷 5건).
QA 전용 재현 스펙(Product Code 아님, 저장소 밖): `/private/tmp/.../scratchpad/qa/spec/*.test.ts`.

---

## 3. Commands Executed

QA 가 직접 실행했다. 모두 종료 코드 0.

| # | 명령 | 결과 |
|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | OK — 6 workspace projects, lockfile up to date |
| 2 | `pnpm typecheck` | OK — root + e2e + 5 패키지 전부 통과 |
| 3 | `pnpm lint` | OK — eslint 위반 0 |
| 4 | `pnpm lint:boundaries` | OK — **no dependency violations (448 modules, 1478 dependencies cruised)** |
| 5 | `pnpm test` | OK — **Test Files 98 passed / Tests 997 passed**, 22.53s |
| 6 | `pnpm build` (기본 = `http`) | OK — `index-ChvqJIQD.js` 505.60 kB |
| 7 | `VITE_API_MODE=http pnpm build` | OK — 동일 산출물 (기본 빌드가 이미 `http` — `vite.config.ts resolveApiMode`) |
| 8 | `VITE_API_MODE=mock pnpm build` | — §5 AC-2-55 참조 (기본 빌드가 http 이므로 mock 모드는 dev 서버로 검증) |
| 9 | `pnpm assert:no-mocks` | OK — `__HARU_MOCK_SENTINEL__` · `__HARU_DEV_SENTINEL__` · `haru-dev-` **각 0건 / 4개 산출물 파일** |
| 10 | `pnpm test:e2e` | OK — **113 passed (1.9m)** |
| 11 | QA 독립 재현 스펙 (vitest, 별도 config) | OK — **12 passed** (privacy 3 + contracts 9) |

추가 직접 검사:

```
$ grep -c "MockAuthGateway" apps/web/dist/assets/*.js.map   → 1 (주석 1회, .js 본문 0건)
$ grep -o "MockAuthGateway" apps/web/dist/assets/index-*.js → 0건
```

### 3.1 재검증 2회차 — QA 가 직접 재실행 (2026-09-27)

지시대로 **공통 검증 명령을 전부 다시 실행**했다. 모두 종료 코드 0.

| # | 명령 | 결과 | 1회차 대비 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | OK — 6 workspace projects, lockfile up to date | 동일 |
| 2 | `pnpm typecheck` | OK — root + e2e + 5 패키지 | 동일 |
| 3 | `pnpm lint` | OK — eslint 위반 0 | 동일 |
| 4 | `pnpm lint:boundaries` | OK — **no dependency violations (448 modules, 1478 dependencies)** | 동일 |
| 5 | `pnpm test` | OK — **Test Files 98 / Tests 1000 passed**, 17.52s | **997 → 1000** (+3 = SwipeDeck 캡처 시점 테스트) |
| 6 | `pnpm build` | OK — `index-Dkw2lUMp.js` 505.90 kB · tokens "provisional 41 / 5 항목 · accepted deviation 3" | 산출물 해시만 변경 |
| 7 | `pnpm assert:no-mocks` | OK — 3 sentinel 각 **0건 / 4개 파일** | 동일 |
| 8 | `pnpm test:e2e` | OK — **121 passed (2.0m)** | **113 → 121** (+8 = 마우스·터치 3 + 온보딩 baseline 3 + 기타 2) |
| 9 | QA 독립 재현 스펙 (vitest, 저장소 밖 config) | OK — **12 passed** (privacy 3 + contracts 9) | 동일 |
| 10 | QA 독립 브라우저 probe (`probe.mjs`) | OK — 로그인→Home→설정→로그아웃 전 구간 저장소 키 0 · 콘솔 PII 0 · 외부 요청 0 | 동일 |
| 11 | **QA 독립 덱 입력 probe (신규, 11 케이스)** | **전부 기대대로** — `docs/qa/evidence/stage-2/r2-deck-input-probe.log` | 신규 |

추가 직접 검사 (2회차):

```
$ ls -d apps/api supabase apps/mobile        → 3건 모두 No such file or directory
$ ls -d apps/* packages/*                    → apps/web · packages/{config,contracts,design-tokens,ui}
$ grep -rniE "CapabilityDiamond|PersonaCard|ProfileResultView|GrowthCapabilityPicker" apps packages | wc -l   → 0
$ grep raw HEX (brand/·테스트 제외)           → 0
$ grep Tailwind arbitrary value               → 0
$ grep "@ts-ignore"                           → 0
$ grep ": any" / "as any" (제품 코드)          → 0
$ find *.sql / *migration*                    → 0건
```

### 3.2 재검증 3회차 — QA 가 직접 재실행 (2026-09-27)

지시대로 **공통 검증 명령을 전부 다시 실행**했다. 모두 종료 코드 0.

| # | 명령 | 결과 | 2회차 대비 |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | OK — 6 workspace projects, lockfile up to date | 동일 |
| 2 | `pnpm typecheck` | OK — root + e2e + 5 패키지 | 동일 |
| 3 | `pnpm lint` | OK — eslint 위반 0 | 동일 |
| 4 | `pnpm lint:boundaries` | OK — **no dependency violations (449 modules, 1479 dependencies cruised)** | 448→449 (에셋 모듈 1) |
| 5 | `pnpm test` | OK — **Test Files 98 / Tests 1000 passed**, 20.32s | 동일 (감소 0) |
| 6 | `pnpm format:check` | OK — All matched files use Prettier code style | 동일 |
| 7 | `pnpm build` | OK — `index-DEtHX82O.js` 506.13 kB · `hello-heart-full-BlZAhjFv.png` **570.74 kB** · `hello-heart-B8YR9j3I.png` 206.74 kB · `headphones-lSSTbzYn.png` 98.34 kB | 에셋 용량만 증가 (§7.5.4) |
| 8 | `pnpm assert:no-mocks` | OK — `__HARU_MOCK_SENTINEL__` · `__HARU_DEV_SENTINEL__` · `haru-dev-` **각 0건 / 4개 파일** | 동일 |
| 9 | `pnpm test:e2e` | OK — **121 passed (2.1m)** | 동일 (감소 0) |

추가 직접 검사 (3회차):

```
$ ls -d apps/api supabase apps/mobile      → 3건 모두 No such file or directory
$ ls -d apps/* packages/*                  → apps/web · packages/{config,contracts,design-tokens,ui}
$ find . -name "*.sql" -o -iname "*migration*"  → 0건
$ grep raw HEX  (apps/web/src · packages/ui/src, 테스트·brand 제외)   → 0건
$ grep Tailwind arbitrary value                                      → 0건
$ grep "@ts-ignore"                                                  → 0건
$ grep ": any" / "as any" (제품 코드)                                 → 0건
   (유일한 `@ts-expect-error` 는 `logger.test.ts:57` — 1·2회차와 동일)
```

**QA 독립 실측 스크립트** (Product Code 아님, 저장소 밖에서 실행 후 증거로만 복사):
`docs/qa/evidence/stage-2/r3-measure.mjs.txt` · 결과 `r3-measurements.json`.
dev 서버 `http://localhost:4399` (`VITE_API_MODE=mock`), Playwright 번들 Chromium 1.63.0,
8개 조건(393×852 safe / nosafe / 200%, 320×568 · 320×568+200% · 320×400+200%, 600, 1024).

---

## 4. Stage 2-B 이관 판단 (QA 독립 검증)

`docs/decisions/stage-2-approvals.md` §3 은 `C13-09`(프로필 결과) · `C13-10`(발전 역량) · `D-2` **시각 표현** · `D-6` 프로필 Guard 단계를 Stage 2-B 로 분리했다. handoff §6 의 B-1~B-5 분류를 **그대로 받지 않고** 코드에서 직접 확인했다.

| # | 이관 주장 | QA 확인 | 판단 |
|---|---|---|---|
| B-1 | 프로필 결과 화면 미구현 | `apps/web/src/pages/` = `auth · home · not-found · onboarding · settings` — `ProfileResultPage` 없음. `ROUTES` 에 `/onboarding/profile` 없음 | **타당** |
| B-2 | 발전 역량 화면 미구현 | `features/` 에 `child-profile` 없음. `ApiClients` 에 `children` 없음. `PUT …/growth-capability` 호출부 0건 | **타당** |
| B-3 | `D-2` 시각 표현 미구현 | contracts `scoreCapabilities` 는 `null`·`missingCount` 를 정확히 반환함을 QA 가 직접 테스트로 확인(§5 AC-2-31). 시각 표현만 부재 | **타당 — 단 Stage 2 분(契約)은 PASS 로 별도 판정** |
| B-4 | `D-6` Guard 프로필 단계 제외 | `resolveGuardDecision.test.ts:247` 이 판정 결과에 `growth-capability` 가 없음을 단언 — **의도된 부재가 테스트로 고정**됨 | **타당** |
| B-5 | `CapabilityDiamondChart` · `PersonaCard` 미생성 | `grep -rniE "CapabilityDiamond\|PersonaCard\|ProfileResultView\|GrowthCapabilityPicker"` → **0건** | **타당 (선구현 금지 준수)** |

**결론: 5건 모두 이관이 타당하다.** 선구현 흔적이 없고, 이관되지 않은 Stage 2 분(contracts·Mock·scenario)은 실제로 구현되어 있어 별도로 판정했다.

Verdict 계산에서 제외한 AC: **AC-2-33 · AC-2-34 · AC-2-37** (전부 2-B 의존).
부분 제외(Stage 2 분만 판정): **AC-2-32 · AC-2-35 · AC-2-36 · AC-2-51**.

---

## 5. Requirement Matrix — AC-2-01 ~ AC-2-68

판정 근거의 "QA 직접"은 이 리포트 작성 중 QA 가 실행한 명령·브라우저 조작·독립 테스트를 뜻한다.

### 5.1 Scope (AC-2-01 ~ 03)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-01 | **PASS** | `ls -d apps/api supabase apps/mobile` → 3건 모두 `No such file or directory`. `ls -d apps/* packages/*` → `apps/web` · `packages/{config,contracts,design-tokens,ui}` 뿐 |
| AC-2-02 | **PASS** | route 12 + `*` (§router.tsx) — Activity Card·서재·세션·회고·리포트·데이터관리·탈퇴·동의이력·알림설정 route 0건. `BottomTabBar` 는 **dev gallery(`FramePage.tsx`)에만** 존재하고 제품 route 에 마운트되지 않음. `PATCH /v1/children/:childId` 호출부 0건. Mock 그룹 6개(`health·auth·me·consents·onboarding·books`)뿐이고 `activities/library/sessions/recordings/analysis/reports/notifications/data-management` 디렉토리 0건 |
| AC-2-03 | **PASS** | `pnpm lint:boundaries` → **no dependency violations (448 modules, 1478 dependencies)** |

### 5.2 Auth — FR-01 (AC-2-04 ~ 09)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-04 | **PASS** | e2e `auth.spec.ts` "Welcome → 가입 → 뒤로 → 로그인 → 비밀번호 재설정" 통과. baseline `s2-welcome`(179:1701) · `s2-login`(179:1820) 통과. Google 공식 마크 `GoogleMark.tsx`(4색 공식 HEX) · Apple `AppleMark.tsx` 존재, `brand-marks.test.tsx` 가 색값 고정 |
| AC-2-05 | **PASS** | **QA 독립 테스트**: `SignUpWithEmailInputSchema` 에 `firstName`·`birthYearMonth`·`childId`·`gender` 를 각각 섞으면 4건 모두 parse 실패. 보호자 3필드는 통과 |
| AC-2-06 | **PASS** | 주입 지점 = `app/providers/apiClients.ts` 1곳. `grep "from '.*mocks"` 결과 제품 코드 중 mocks 를 import 하는 곳은 **dev 전용 4파일(`src/dev/**`)** 뿐 — Page·Feature·Query hook 0건 |
| AC-2-07 | **PASS** | `withAuthRefresh.test.ts` 4건 + `guard-integration.test.tsx` "refresh 까지 실패하면 signOut 하고 로그인 화면으로 보낸다" + `MockMeApi` `token-expired`(1회차 만료 → 2회차 성공) — QA 가 테스트 이름과 통과를 직접 확인 |
| AC-2-08 | **PASS** | `MockAuthGateway.test.ts` "provider-cancelled — 오류가 아니라 session:null 성공이다" 통과 |
| AC-2-09 | **PASS** | e2e "비밀번호 재설정 링크 토큰이 없으면 만료 안내를 보여준다". 코드 검사: `MockAuthGateway.requestPasswordReset` 이 계정 존재 여부와 무관하게 `undefined` 반환 (주석 "성공·실패를 계정 존재 여부로 구분하지 않는다") |

### 5.3 Consent · VPC — FR-02 (AC-2-10 ~ 18) · Privacy 핵심

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-10 | **PASS** | QA 브라우저: `/auth/consent` 에 checkbox **5개**. `ConsentRow.tsx:23` 가 `document.required` 로만 필수/선택 라벨을 만든다 — 필수 목록 하드코딩 0건 (`consentSelection.ts:43` 도 `document.required` 사용) |
| AC-2-11 | **PASS** | e2e "필수 미체크 CTA 는 aria-disabled 이고 포커스를 받을 수 있다" + copy `blockedReason: 'Select the required items to continue.'` |
| AC-2-12 | **PASS** | e2e 3건(Email/Google/Apple → `/auth/consent`). QA 브라우저에서 Email 경로 직접 재현: 가입 → `/auth/consent` |
| **AC-2-13** | **PASS** | **§6 별도 절 — QA 독립 재현 3건** |
| AC-2-14 | **PASS** | **QA 독립 테스트**: `onboarding:consent-missing` 에서 `saveStep({step:'child_info', answers:{firstName:'Nova'}})` → `code: 'CONSENT_REQUIRED'` 로 reject. 브라우저: 동의 없는 상태로 `/onboarding/child-info` 진입 시 `/auth/consent` 로 되돌림 |
| AC-2-15 | **PASS** | `MockConsentApi.test.ts` 3건(구버전 id 거부 / 새 버전 배포 / 새 버전으로 기록) + `consent-screens.test.tsx` 재동의 안내 3건 통과 |
| AC-2-16 | **PASS** | `MockConsentApi.test.ts` "같은 key + 같은 body → 최초 응답 재생" · "같은 key + 다른 body → IDEMPOTENCY_KEY_REUSED" · `MockOnboardingApi` submit 동일 |
| AC-2-17 | **PASS** | e2e `consent.spec.ts` "vpc-pending 이면 그 화면에 머문다" · "vpc-failed 면 안내와 재시도가 보이고 온보딩으로 넘어가지 않는다". baseline `s2-vpc-failed` 통과. 기본 `success` 경로도 QA 브라우저에서 통과 확인 |
| AC-2-18 | **PASS (확인 항목: `L-02`)** | `shared/config/legal-links.ts` 5건 전부 `https://haru.invalid/legal/*--placeholder`. `isPlaceholderLegalUrl()` 존재. e2e 가 5링크 모두 `/\.invalid\/.*--placeholder$/` 임을 고정. **약관 본문 문자열은 코드·fixture 어디에도 없음** (fixture 는 `title` + `url` 만). → §8 `L-02` 에 출시 전 차단 항목으로 기록 |

### 5.4 Onboarding — FR-03 · FR-24 (AC-2-19 ~ 30)

| AC | 판정 | 증거 |
|---|---|---|
| **AC-2-19** | 1회차 **FAIL** → **2회차 `PASS`** | 1회차: `QA-2-001` — Step 5 에서 마우스 클릭으로 응답 불가.<br>**2회차**: QA 가 **마우스만으로 10문항 전부 응답 후 `Save profile` 도달**(`K` 케이스, headless·headed 동일). 키보드(`Space`/`ArrowDown`/`Enter`)·터치 탭·터치 스와이프·마우스 드래그 4경로 모두 정상, 드래그가 라디오를 오선택하지 않음. §6.1 |
| AC-2-20 | **PASS** | QA 브라우저: Trial 도중 이탈 후 재진입 시 `/onboarding` 에 "Pick up where you left off" 가 뜨고 클릭하면 `capability-items` 로 복귀, 응답 보존 |
| AC-2-21 | **PASS** | QA 브라우저 Step 1 컨트롤 = `First name` / `Last name` **두 칸**, 성별 트리거 라벨이 `Gender / Not selected`(기본 미선택). `childInfo.ts:147` 이 빈 `lastName` 을 키 자체 생략, `gender` 미선택은 `null` 전송 |
| AC-2-22 | **PASS** | **QA 독립 테스트**(now=2026-09-26): 3세0개월 `2023-09` ✓ · 9세11개월 `2016-10` ✓ · 2세11개월 `2023-10` ✗ · 10세0개월 `2016-09` ✗ · 형식오류 5종 ✗. 화면 나이 표시 `\d+yr \d+mo` 는 입력 파생(unit) |
| AC-2-23 | **PASS** | `onboarding-screens.test.tsx` "검색 결과를 목록으로 보여준다" / "결과가 없으면 제목 직접 입력 경로를 연다"(`books:empty` → `addTyped`) 통과 |
| AC-2-24 | **PASS** | QA 브라우저 Step 5 스크린샷: 문항 `1 / 10`, 옵션 **6개**(빈도 5 + "Haven't had the chance to see this yet") + caption "This one isn't scored.". 화면은 `item.prompt` / `scaleLabels` 만 렌더하며 문항 문자열은 `mocks/fixtures/onboarding.ts`(서버 역할) 와 `features/.../copy.ts`(Trial 오프라인 fallback) 두 **데이터 소유 지점**에만 있다 — 결정 `D-A` §8.1-1·3 구조를 따른다 |
| AC-2-25 | **PASS** | **QA 브라우저**: 포커스 + `Space` 로 10문항 전부 응답, `Next question` 포커스 + `Enter` 로 이동 — 제스처 없이 완주. e2e `onboarding.spec.ts` 동일 경로 통과 |
| AC-2-26 | **PASS** | `onboarding-screens.test.tsx` 가 제출 payload `answers` 키를 `['books','capability_items','child_info','goals','temperament']` 로 단언하고 통과 |
| AC-2-27 | **PASS** | **QA 브라우저**: 미인증 상태로 `/onboarding` → Step 1~5 진행 중 `/v1/` 요청 **0건**(network listener). 저장은 `localStorage['haru.onboarding.draft.v1']` 에만. 추가로 harness 요청 로그도 `[]` |
| AC-2-28 | **PASS** | **QA 브라우저 전 구간 재현**: Trial 5단계 → `Save profile` → `/auth/sign-up` → 가입 → `/auth/consent` → 동의 → `/onboarding`(resume) → `Finish` → **`/onboarding/saved`**, 그리고 `localStorage` draft = **삭제됨**(`draft: false`) |
| AC-2-29 | **PASS** | **QA 브라우저**: 로그아웃 후 `localStorage` · `sessionStorage` 키 **둘 다 `[]`** |
| AC-2-30 | **PASS** | `onboarding-draft.test.ts` — 만료 시 `{draft:null, discarded:'expired'}`, `schemaVersion 99` 폐기, 손상 폐기 케이스 통과 |

### 5.5 Profile · Capability · Persona · Growth (AC-2-31 ~ 38)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-31 | **PASS** | **QA 독립 테스트 4건**: 역량별 문항 수 `ER 2 · AG 3 · CF 2 · IM 3` 확인, `not_observed`·미응답 제외 평균이 소수 1자리, 한 역량 전부 결측 → `score: null` + `missingCount: 2` (0 으로 표시되지 않음), 전부 미응답 → 4축 모두 `null` |
| AC-2-32 | **Stage 2 분 PASS / 시각 표현 Stage 2-B 제외** | contracts 분은 위 AC-2-31 로 직접 검증(0·최저값 아님). `D-2` ②(시각 표현)는 `C13-09` Figma 대기 — **화면 자체가 없으므로 스크린샷 판정 불가** |
| AC-2-33 | **Stage 2-B 제외** | `CapabilityDiamondChart` 미생성 확인(grep 0건). `C13-09` 의존 |
| AC-2-34 | **Stage 2-B 제외** | 프로필 화면 미구현. `C13-09` 의존 |
| AC-2-35 | **Stage 2 분 PASS / 표시 Stage 2-B 제외** | Frontend 에 강점·growing edge·페르소나를 **생성·가공하는 코드가 없음**(`mocks/fixtures/profile-result.ts` 가 값을 제공, 앱 코드에 산출 로직 0건). 표시 화면은 `C13-09` |
| AC-2-36 | **Stage 2 분 PASS / 표시 Stage 2-B 제외** | `MockOnboardingApi` `persona-fallback` 이 **오류가 아니라 200 + fallback 페르소나**를 돌려줌(테스트 통과). `PersonaCard` 표시는 `C13-09` |
| AC-2-37 | **Stage 2-B 제외** | `PUT …/growth-capability` 호출부·`children` API Client 부재 확인. `C13-10` 의존 |
| AC-2-38 | **PASS** | `copy-language.test.ts` 가 `onboardingCopy` 문자열 **40개 초과**를 수집해 금칙 패턴 12종을 검사하고 통과(헛돌기 방지 단언 포함). **결정 `D-B` 위험 확인**: Step 4 prompt 가 "grow together" 이고 4대 역량 코드가 라벨로 노출되지 않음을 테스트가 고정. QA 가 `authCopy`·`consentCopy`·`settingsCopy`·`homeCopy`·`errorCopy` 에 동일 패턴을 직접 grep → **0건** |

### 5.6 Home skeleton · Settings (AC-2-39 ~ 41)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-39 | **PASS** | **QA 브라우저**: 헤더 텍스트 = `HARU` + `Settings` 버튼, 본문 = `Your storytime space is ready.` / `Tonight's activity will show up here.`. `getByRole('navigation')` **0**, `.haru-tab-bar` **0**. `HomePage.tsx` 는 `EmptyState` 만 조립하고 query hook 0건 → contract 호출 0건 |
| AC-2-40 | **PASS** | **QA 브라우저**: 설정 아이콘 → `/settings`, 본문 = `Log out` **1행** |
| AC-2-41 | **PASS** | **QA 브라우저**: `Log out` → ConfirmDialog(`Log out` / `Cancel`) → `/auth/welcome`, 저장소 전부 비워짐 |

### 5.7 Route Guard (AC-2-42 ~ 45)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-42 | **PASS** | `resolveGuardDecision.ts` 순수 함수 분리. `resolveGuardDecision.test.ts` 가 미인증/동의누락/VPC pending·failed/온보딩미완/완료 × 경로 조합을 전수 단언하고 통과. `D-6` 에 따라 프로필 단계가 **없음**을 같은 파일 247행이 단언 |
| AC-2-43 | **PASS** | `me:onboarding-incomplete` 시나리오 테스트 통과 + QA 브라우저에서 동의 직후 `/onboarding` 리다이렉트 확인 |
| AC-2-44 | **PASS** | 단위 테스트 + QA 브라우저에서 리다이렉트 루프 없음(모든 이동이 1회로 수렴, 12초 관찰에도 URL 안정) |
| AC-2-45 | **PASS** | **QA 브라우저**: 미인증 상태로 `/onboarding`·`/onboarding/child-info`~`/onboarding/goals` 전부 접근 가능, `/v1/` 요청 0건 |

### 5.8 contracts (AC-2-46 ~ 49)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-46 | **PASS** | `packages/contracts/src/` = `auth · books · children · common · consent · enums · health · me · onboarding · rules` — §7.1 표와 대응. `apps/web` 에 `Me`·`ConsentDocument`·`OnboardingState`·`ChildInfoAnswers`·`ProfileResult`·`Persona`·`BookSummary`·`AuthSession` 재선언 **0건**(grep) |
| AC-2-47 | **PASS** | `enums.test.ts` 통과(스냅샷 포함). `ConsentSource`·`OnboardingStatus`·`Plan` 정의 확인 |
| AC-2-48 | **PASS** | `ERROR_CODES` = **28종**(QA 직접 카운트), `TRIAL_ACCOUNT_RESTRICTED` 부재. 신규 코드 0건. `CONSENT_REQUIRED`·`CONSENT_VERSION_OUTDATED`·`CHILD_LIMIT_REACHED`·`PROVIDER_UNAVAILABLE`·`IDEMPOTENCY_KEY_REUSED`·`AUTH_TOKEN_EXPIRED` 재현 테스트 통과 확인 |
| AC-2-49 | **PASS** | `packages/contracts/package.json` dependencies = `{"zod":"^4.6.5"}` 하나. `createBirthYearMonthSchema(now)` clock 주입 팩토리 존재(QA 가 직접 호출해 경계 테스트) |

### 5.9 Mock Infrastructure (AC-2-50 ~ 55)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-50 | **PASS** | Mock Adapter 6종(`health·auth·me·consents·onboarding·books`) 전부 `__tests__` 에서 scenario별 contracts parse 통과. QA 가 997건 통과 로그로 확인 |
| AC-2-51 | **PASS (2 key 의 UI 는 Stage 2-B)** | 고유 17 key 전부 정의·재현. 대응 UI 상태는 15 key 까지 화면으로 확인(QA 브라우저 + e2e). `persona-fallback`·`capability-all-missing` 의 **UI 표현**은 `C13-09` 화면이 없어 Mock 레벨까지만 검증 |
| AC-2-52 | **PASS** | `grep "Date.now()\|Math.random()\|new Date()"` → `mocks/**` 실행 코드 0건(주석·clock 파생만). `capability-all-missing` 2회 실행 `toStrictEqual` 테스트 통과. e2e "같은 scenario 를 두 번 열면 같은 응답 바이트" 통과 |
| AC-2-53 | **PASS** | 사용 key 17종이 `docs/API_CONTRACTS.md` §5.4 Catalogue 에 모두 존재(QA 대조). `default`·`slow`·`active-session-exists` 는 **거부 테스트에서만** 등장 |
| AC-2-54 | **PASS** | fixture 는 `mocks/fixtures/**` 에만 존재. 제품 Component/Page/Feature 에서 fixture import **0건**(유일한 외부 참조는 `features/.../model/__tests__/defaultInstrument.test.ts` — 테스트). 아동 이름은 `Nova` 등 가상값 |
| AC-2-55 | **PASS** | `pnpm assert:no-mocks` 3종 sentinel 각 0건(4개 산출물). 추가로 QA 가 `dist/assets/index-*.js` 본문에 `MockAuthGateway` **0건**임을 직접 grep. `.js.map` 의 1건은 `shared/auth` 주석 문자열(모듈 그래프 아님). e2e 가 "dev 서버에서는 표식이 존재"함을 확인해 **검사가 헛돌지 않음**을 고정 |

### 5.10 Design · Accessibility · Responsive (AC-2-56 ~ 62)

| AC | 판정 | 증거 |
|---|---|---|
| **AC-2-56** | 1회차 **PARTIAL** → 2회차 **`PARTIAL`** → **3회차 `PASS`** (§7.5.5) | 1회차 누락 조건 3개 중 **②③ 해소**. ② `179:1748` 문구 차이 → `AD-S2-15` 등록(§8 `QA-2-003`). ③ 자동 회귀 baseline → `s2-onboarding-intro` · `s2-onboarding-step5` · `s2-onboarding-saved` 3건이 `REGION_SNAPSHOT`(D-12 `0.002/20`, 클립 대상 `main`)으로 추가되어 **e2e 121건에 포함·통과**. **남은 누락 조건 ①**: `179:1809` 의 **CTA·제목은 해소**(§7.4.2)됐으나 **일러스트가 Figma 대비 높이 −48px·위치 −117px** 이라 캐릭터↔제목 여백이 Figma 59px vs 구현 282px 이고 등록된 `AD-S2-*` 가 없다 → **`QA-2-004`** (§7.4.3). 1회차 통과분 4개 baseline(`s2-welcome` 179:1701 · `s2-signup` 179:1724 · `s2-login` 179:1820 · `s2-home-header` 26:21)은 2회차에도 통과 |
| ↳ **AC-2-56 3회차 근거** | **`PASS`** | ① AC 본문 조건(7개 node 비교 수행·기록 + 열거된 의도된 차이 3건 등록)이 충족된다 — `AD-S2-1` · `AD-S2-10`/`AD-S2-15` · `AD-S2-11` 전부 §11.3 등록 확인 ② 2회차 잔여 조건 ①(`179:1809`)이 해소 — QA 직접 실측: 일러스트 박스 `307×415` **Δ0**, 캐릭터 실체 높이 324 vs Figma 321 (**Δ+3**), 캐릭터↔제목 여백 **Δ−4.2px**(2회차 +223), CTA `y752..808` vs `750..808` ③ 남은 편차 전부 ≤9px 이고 각각 `AD-S2-12`(±2) · `AD-S2-16` · `AD-1`(폰트 metric·줄 끝) · 승인된 Design Spec §5.2·§2.11 로 설명된다 (§7.5) ④ 7개 node 전부 자동 baseline 으로 고정, e2e 121건 통과 |
| **AC-2-57** | 1회차 **FAIL** → **2회차 `PASS`** | 1회차: `QA-2-002` — Design Spec §2.11 `(flex spacer)` 미실현. **2회차**: QA 실측으로 §2.11 순서·간격이 그대로 재현됨 — 일러스트 → (spacer) → 제목 → **32px**(= `--space-8`, QA 가 토큰 값 확인) → CTA, CTA 가 앱 컬럼 하단에 고정. 승인되지 않은 누락 화면 구현 0건(§4 재확인). §7.4.2 |
| AC-2-58 | **PASS** | `grep` — 제품 코드에 임의 HEX 0건(유일한 HEX 는 `packages/ui/src/icon/brand/{GoogleMark,AppleMark}.tsx` 공식 브랜드 색 = 결정 `D-15` 브랜드 에셋 예외), `rgb(` 0건, Tailwind arbitrary value 0건, inline 수치 style 0건(dev gallery 의 `var()` 참조만) |
| AC-2-59 | **PASS** | e2e `responsive.spec.ts` — 320/393/600/1024 앱 컬럼 규칙 + 600px↑ 가운데 정렬 + **320px 텍스트 200% reflow** baseline 통과. `auth.spec.ts`·`consent.spec.ts` 도 화면별 가로 스크롤 0 확인 |
| AC-2-60 | **PASS (accepted: S1-G-2)** | e2e a11y — Tab 순회·focus ring·`:focus-visible` 전용·터치 44×44(IconButton `::before` 확장 포함)·대비 측정 통과. 화면별 키보드 제출(가입 폼·동의 5항목) 통과. TextField 42px 는 Stage 1 수용 예외 `S1-G-2` |
| AC-2-61 | **PASS** | **QA 브라우저 직접 재현**: `/onboarding/child-info`(scrollHeight 1224 / client 852)에서 실제 wheel 스크롤 후 TopBar class 가 `haru-top-bar … --sticky` → `… --sticky haru-top-bar--scrolled` 로 전환(scrollTop 372). `useScrolledPast` 단위 테스트(D-13)도 통과 |
| AC-2-62 | **PASS** | `PROVISIONAL_ITEMS` 17건 중 `status:'waiting'` = **6건 = P-01 · P-02 · P-04 · P-05 · P-16 · P-17**(QA 직접 카운트). 신규 가값 `P-17`(결정 `D-14`) 등록 확인. 토큰 CSS 의 `provisional` 주석 43줄 / 5항목 — `build-tokens` 로그 "provisional 41 개 토큰 / 5 항목 · accepted deviation 3" 과 일치 |

### 5.11 Privacy · Security (AC-2-63 ~ 66)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-63 | **PASS** | **QA 브라우저 콘솔 프로브**: 로그인 → Home → 설정 → 로그아웃 전 구간 콘솔 출력이 `[vite] connecting/connected` + React DevTools 안내 **3줄뿐**. 아이 이름·이메일·비밀번호·토큰 **0건** |
| AC-2-64 | **PASS** | **QA 브라우저**: 로그인 직후 `localStorage`·`sessionStorage` 키 **0개**, 비밀번호 문자열 포함 여부 `false`, `accessToken/refreshToken` 패턴 `false`. 요청 로그도 `redactSecrets()` 로 값 제거(QA 독립 테스트가 평문 비밀번호 부재를 단언) |
| AC-2-65 | **PASS** | `grep lastName` — 제품 코드 사용처는 Step 1 **입력 필드 라벨**(`Last name` / `Optional`)과 draft 직렬화뿐. 호칭·인사·알림 문구에 사용 0건 |
| AC-2-66 | **PASS** | **QA 브라우저**: 전 구간 외부 도메인 요청 **0건**. `apps/web` dependencies = `@haru/*` · `@tanstack/react-query` · `react` · `react-dom` · `react-router` · `zod` — 광고·분석 SDK 0건. `service_role`·`client_secret`·API key 패턴 grep 0건. `.env*` 파일 없음, 사용 중인 `VITE_*` 는 `VITE_API_MODE`·`VITE_API_BASE_URL`·`VITE_MOCK_SCENARIO` 3종(Secret 아님) |

### 5.12 회귀 · 실행 (AC-2-67 ~ 68)

| AC | 판정 | 증거 |
|---|---|---|
| AC-2-67 | **PASS** | e2e `scenarios.spec.ts` health 5 scenario + 결정성 + `__states` + Scenario Panel 통과. `visual.spec.ts` 의 Stage 1 baseline(v1~v9, frame 320/393/600/1024) **전부 통과** — 회귀 0. `shadow.spec.ts` 그림자 클리핑 회귀 통과 |
| AC-2-68 | **PASS** | §3 의 명령 전부 통과. 신규 `any` **0건**, `@ts-ignore` **0건**(유일한 `@ts-expect-error` 는 `logger.test.ts:57` — 런타임 이상값 재현용 테스트) |

### 5.13 집계

**1회차 (2026-09-26)**

| 판정 | 건수 | AC |
|---|---|---|
| `FAIL` | 2 | AC-2-19 · AC-2-57 |
| `PARTIAL` | 1 | AC-2-56 |
| Stage 2-B 이관 (Verdict 계산 제외) | 3 | AC-2-33 · AC-2-34 · AC-2-37 |
| `PASS` | 62 | 나머지 전부 |
| `NOT VERIFIED` | 0 | — |

검산 2 + 1 + 3 + 62 = 68 ✓ → In Scope 65 중 `FAIL` 2 → **`FAIL`**

**2회차 재검증 (2026-09-27)**

| 판정 | 건수 | AC |
|---|---|---|
| **`FAIL`** | **0** | — |
| **`PARTIAL`** | **1** | **AC-2-56** (`179:1809` 일러스트·여백 — `QA-2-004`) |
| **Stage 2-B 이관 — Verdict 계산에서 전부 제외** | **3** | AC-2-33 · AC-2-34 · AC-2-37 |
| **`PASS`** | **64** | 1회차 62건 + **AC-2-19** + **AC-2-57** |
| └ 그중 `PASS (accepted: S1-G-2)` | 1 | AC-2-60 (1회차 유지) |
| └ 그중 **Stage 2 분 한정 PASS**(표시·시각 부분은 Stage 2-B 제외) | 4 | AC-2-32 · AC-2-35 · AC-2-36 · AC-2-51 (1회차 유지) |
| **`NOT VERIFIED`** | **0** | — |
| **`BACKEND_INTEGRATION_PENDING`** | **0** (AC 기준) | Backend 대기 항목은 §10 `P2-BIP-01~16` |

검산: 0 + 1 + 3 + 64 = **68** ✓

**Stage Verdict 계산** (`rules/qa.md` §2): In Scope 65건(= 68 − 2-B 제외 3) 중 `FAIL` **0**건, `PARTIAL` **1**건 → **`INCOMPLETE`**.
사전 수용 예외(`D-xx`)나 사용자 명시 수용(`QA-2-###`)에 해당하는 항목은 없다. **`INCOMPLETE` 는 `PASS` 가 아니며 Stage 3 진입 불가다.**

**3회차 재검증 (2026-09-27)**

| 판정 | 건수 | AC |
|---|---|---|
| **`FAIL`** | **0** | — |
| **`PARTIAL`** | **0** | — (AC-2-56 → `PASS`) |
| **Stage 2-B 이관 — Verdict 계산에서 전부 제외** | **3** | AC-2-33 · AC-2-34 · AC-2-37 |
| **`PASS`** | **65** | 2회차 64건 + **AC-2-56** |
| └ 그중 `PASS (accepted: S1-G-2)` | 1 | AC-2-60 (유지) |
| └ 그중 **Stage 2 분 한정 PASS** | 4 | AC-2-32 · AC-2-35 · AC-2-36 · AC-2-51 (유지) |
| **`NOT VERIFIED`** | **0** | — |
| **`BACKEND_INTEGRATION_PENDING`** | **0** (AC 기준) | Backend 대기 항목은 §10 `P2-BIP-01~16` |

검산: 0 + 0 + 3 + 65 = **68** ✓

**Stage Verdict 계산** (`rules/qa.md` §2): In Scope 65건 중 `FAIL` **0** · `PARTIAL` **0** · `NOT VERIFIED` **0**
→ **`PASS`**. 사용자 명시 수용(`accepted: QA-2-###`)에 의존한 항목은 **없다**.
신규 Finding `QA-2-005` · `QA-2-006` · `QA-2-007` 은 전부 **design-agent 소관 문서 항목**이며
어떤 AC 도 `FAIL`/`PARTIAL` 로 만들지 않는다 (사유는 각 Finding 과 §1.1).

3회차에서 **2회차 판정을 그대로 유지한 AC**: PASS 64건 + 2-B 제외 3건. 유지 근거는 §3.2 의 공통 명령
전부 재실행(유닛 1000 · e2e 121 · typecheck · lint · boundaries · build · format · assert:no-mocks)과
§3.2 추가 grep, §12.4 회귀 절이다. 지시대로 Stage 2-B 제외 3건(AC-2-33·34·37)과 Stage 2 분 한정
PASS 4건(AC-2-32·35·36·51), `AC-2-60 = PASS (accepted: S1-G-2)` 는 기존 판단을 유지했다.
남은 가값 6건(P-01·P-02·P-04·P-05·P-16·P-17)은 FAIL 사유가 아니다 (§11.2).

2회차에서 **1회차 판정을 그대로 유지한 AC**: 위 표의 PASS 62건 + 2-B 제외 3건. 유지 근거는 §3.1 의 공통 명령 전부 재실행(유닛 1000 · e2e 121 · typecheck · lint · boundaries · build · assert:no-mocks)과 §3.1 추가 grep, §12 회귀 절이다. 지시대로 Stage 2-B 제외 3건(AC-2-33·34·37)과 Stage 2 분 한정 PASS 4건(AC-2-32·35·36·51), `AC-2-60 = PASS (accepted: S1-G-2)` 는 1회차 판단을 유지했다.

---

## 6. Privacy 중점 검증 — AC-2-13 (QA 독립 재현)

지시대로 "검사가 헛돌지 않는지"를 먼저 확인한 뒤 본 검사를 했다.

### 6.1 도구 자체의 건전성

| 확인 | 결과 |
|---|---|
| ① 수집기가 **모든 서버행 호출**을 덮는가 | `grep "requestLog?.record"` → **15개 호출 지점**. Mock 6종의 서버행 메서드 전부(`AuthGateway` 7 + `me` 2 + `consents` 2 + `onboarding` 3 + `books` 1). 기록하지 않는 것은 `getSession`·`onChange`(로컬 구독)뿐 — 누락 없음 |
| ② 탐지기가 **실제로 반응**하는가 (positive control) | **QA 작성 테스트**: 로그에 `{answers:{firstName:'Nova', birthYearMonth:'2021-03'}}` 를 인위적으로 넣자 `findChildDataKeys` 가 `['answers','birthYearMonth','firstName']` 를 정확히 반환 |
| ③ 구현 측 positive control 존재 | `MockOnboardingApi.test.ts:270` — 동의 **이후** 제출 payload 에 대해 `findChildDataKeys(entries).length > 0` 를 단언. 같은 탐지기가 실제 payload 에서 불을 켠다 |
| ④ 금칙 키 목록이 실제 필드명과 맞는가 | `CHILD_DATA_KEYS` = `firstName · lastName · birthYearMonth · gender · answers · draftAnswers · childId · child · temperament · capabilityItems`. Step 2~5 의 세부 필드(`languageEnvironment`·`growthGoals`·`favoriteBooks`·`topicTags`·`itemCode` …)는 **전부 `answers` / `draftAnswers` 아래에 중첩**되고 탐지기가 재귀 순회하므로 구조적으로 포착된다. 보호자 경로(`PATCH /v1/me` = `displayName·relationship·timezone`)와 충돌하는 키가 없어 **오탐도 없다**(결정 `D-16` 의 설계 의도대로) |
| ⑤ 로그가 비어서 통과하는 것은 아닌가 | 아래 ②에서 **구간 길이 > 2 이고 `POST /v1/consents` · `AuthGateway.signUpWithEmail` 이 반드시 포함**됨을 단언 |

### 6.2 QA 가 직접 작성·실행한 재현 (3/3 통과)

```
① 탐지기 자체가 살아 있다 (인위적 누출을 잡는다)                    ✓
② 실제 가입 → 동의 기록 구간 요청에 아동 데이터 0건, 로그는 비어 있지 않다  ✓
③ 동의 전 child_info 저장 시도는 Mock 이 CONSENT_REQUIRED 로 거부한다      ✓
```

②의 단언:

```
idx = entries.findIndex(e => e.operation === 'POST /v1/consents')   → ≥ 0
before = entries.slice(0, idx + 1)
before.length > 2                                                   ✓
findChildDataKeys(before) === []                                    ✓
JSON.stringify(before) 에 평문 비밀번호 없음                          ✓
```

### 6.3 Trial 구간 (가입 전) 서버 요청 0건

| 방법 | 결과 |
|---|---|
| 실제 브라우저 network listener (`/v1/` 필터) | `/onboarding` → Step 1 → 2 → 3 → 4 → 5(10문항 응답) 전 구간 **0건** |
| harness 요청 로그 | `entries()` = `[]` |
| 저장 위치 | `localStorage['haru.onboarding.draft.v1']` 만 생성, `OnboardingDraftSchema` parse 통과 |

**주의로 기록**: e2e `onboarding.spec.ts` 의 `trackApiRequests`(브라우저 network 기반)는 Mock Adapter 가 **인프로세스라 원래부터 HTTP 를 내지 않으므로** 그 자체만으로는 강한 증거가 아니다. AC-2-13 · AC-2-27 의 실질 증거는 `requestLog` 기반 검사이며, 위 ①~⑤로 그 건전성을 확인했다.

**판정: AC-2-13 `PASS`.**

---

### 6.4 (2회차 추가) 재검증 — `QA-2-001` 덱 입력 경로

> 지시: "실제 브라우저에서 마우스로 직접 재현하고, 키보드·터치가 망가지지 않았는지도 확인하라."

#### 6.4.1 검증 방법

QA 가 작성한 독립 probe(`r2-deck.mjs`, 저장소 밖)를 **headless 와 headed 두 번** 실행했다. 1회차와 같은 세 가지 조작 방식을 모두 썼다.
전체 로그: `docs/qa/evidence/stage-2/r2-deck-input-probe.log`.

#### 6.4.2 결과 — 11 케이스 전부 기대대로 (headless · headed 동일)

| # | 케이스 | 1회차 | **2회차** |
|---|---|---|---|
| A1 | 마우스 `label.click()` → 라디오 선택 | `checked=false` ❌ | **`false → true`** ✅ |
| A2 | capture 리스너가 본 click target | `DIV.haru-swipe-deck__card--front` (**리타깃**) ❌ | **`LABEL.haru-radio-group__option` → `INPUT.haru-radio-group__input`** (리타깃 없음) ✅ |
| B | 마우스 `input.click()` | — | `checked=true` ✅ |
| C | **원시 `page.mouse.down()/up()`** | `checked=false` ❌ | **`checked=true`** ✅ |
| D | 카드 안 `Clear this answer` IconButton 을 마우스로 | 반응 없음 ❌ | 버튼 1개 출현 → 클릭 → **`checked=false` 로 해제** ✅ |
| E1 | 키보드 focus + `Space` | 정상 | **정상 유지** ✅ |
| E2 | 라디오 위 `ArrowDown` — 덱이 키를 가로채지 않는가 | — | 선택이 idx 0→1 로 이동하고 **카드는 Q1 그대로** ✅ |
| E3 | `Next question` focus + `Enter` | 정상 | **정상 유지** (Q2 로 이동) ✅ |
| F1 | 터치 탭 (`hasTouch` 컨텍스트) | 정상 | **정상 유지** ✅ |
| G | **터치 스와이프 제스처** (CDP `Input.dispatchTouchEvent` 8단계 이동) | — | Q1 → **Q2** ✅ (제스처 미파손) |
| H1 | **마우스 드래그 제스처** (200px 이동) | — | Q1 → **Q2** ✅ |
| H2 | 드래그가 라디오를 **오선택**하는가 | — | **`false`** ✅ (끌기 중 캡처가 click 을 카드로 흡수 — 의도대로) |
| I | 8px **미만** 흔들린 클릭(`+3`,`+5`px) | — | **`checked=true`** ✅ (`SWIPE_SLOP_PX` 경계 아래는 여전히 클릭) |
| J | **대조군** — 덱 **밖** RadioGroup (`/onboarding/temperament`) | 정상 | **정상 유지** ✅ |
| K | **마우스만으로 10문항 완주** | — | **10/10 전부 선택**, 매 문항 옵션 6개, 종료 시 `Save profile` 도달 ✅ |

`pageerror` 0건.

#### 6.4.3 수정의 정합성 확인 (코드 — 구현 지시 아님)

`packages/ui/src/deck/SwipeDeck.tsx` 는 `pointerdown` 에서 좌표만 기록하고, `pointermove` 에서 이동량이
`SWIPE_SLOP_PX`(8) 를 넘은 시점에만 `setPointerCapture` 를 건다. 끌기 중에는 캡처가 유지된다(`H2` 가 이를 확인).
`SwipeDeck.css` 는 `touch-action: pan-y` 뿐이고 `pointer-events` 회피성 선언이 없다 — **CSS 로 덮은 수정이 아니다.**

#### 6.4.4 회귀 테스트가 실제로 이 경로를 덮는가 (QA 확인)

| 테스트 | 무엇을 고정하는가 |
|---|---|
| `packages/ui/src/deck/__tests__/SwipeDeck.test.tsx` — `포인터 캡처 시점 (QA-2-001)` 3건 | ① 누르기만 하면 `setPointerCapture` **미호출** + 카드 안 radio 가 `checked=true` ② 8px 초과 이동 **후에야** `setPointerCapture(1)` 호출 ③ 버튼 뗀 채 통과 시 끌기 미시작. jsdom 에 없는 Pointer Capture API 를 stub 하고 **afterEach 에서 제거**한다(누수 없음) |
| `e2e/onboarding.spec.ts` — `세 입력 경로 — 마우스 · 키보드 · 터치 (QA-2-001)` | 마우스: 라디오 선택 → 카드 안 `Clear this answer` 로 해제. 터치: `test.use({ hasTouch: true })` 로 탭 + 스와이프 |

1회차에 지적한 "e2e 가 키보드 경로만 검사한다"는 공백이 **실제로 메워졌다.**

---

## 7. 시각 비교 — `S2-HOME-2` (온보딩 3화면, QA 가 직접 생성)

handoff 가 "QA 가 생성하거나 `NOT VERIFIED`" 로 남긴 항목이다. QA 가 **직접 대조를 수행**했다.

증거 파일 (`docs/qa/evidence/stage-2/`):

| Figma | 구현 |
|---|---|
| `figma-179-1748.png` | `impl-onboarding-intro.png` |
| `figma-179-1770.png` | `impl-onboarding-step5.png` · `impl-onboarding-step5-answered.png` |
| `figma-179-1809.png` | `impl-onboarding-saved.png` |

### `179:1748` — `/onboarding` 소개

| 요소 | Figma | 구현 | 판단 |
|---|---|---|---|
| medallion | 원형 캐릭터 | 동일 | 일치 (`AD-S2-3` 지름 차이 허용) |
| 카드 | 제목 + 본문 | 동일 구조 | 일치 |
| 카드 문구 | "Hi — before your first night with Yuna…" / "Ten short questions…" | "Let's set up your child's profile" / "A few questions about what your read-aloud time looks like today…" | **차이 — `AD-S2-*` 미등록** (`QA-2-003`) |
| InfoRow 2행 | "About 3 minutes · 10 cards" / "Swipe each card away…" | **렌더 안 함** (빈 슬롯) | `AD-S2-10` + `S2-COPY-1` — **등록된 허용 차이** |
| Trial 안내 | 없음 | `InlineAlert` "Your answers stay on this device" + `Create account` | `C13-11` 명세 화면 — 타당 |
| CTA | "Start the questions" | "Start" | **차이 — `AD-S2-*` 미등록** (`QA-2-003`) |

### `179:1770` — Step 5 설문 카드

| 요소 | Figma | 구현 | 판단 |
|---|---|---|---|
| TopBar | `<` · "Question 1 of 10" · `>` | 동일 (`Go back` / `Next question`) | 일치. `AD-S2-9` 위치 보정 |
| 진행바 | 1/10 | 동일 + "Step 5 of 5" 텍스트 병기 | 텍스트 병기는 접근성 보강 — 수용 |
| 덱 | stack depth 3 | 동일 | 일치 (`AD-S2-7`) |
| counter / eyebrow / 질문 | `1 / 10` / "IN THE PAST TWO WEEKS" / 동일 문장 | **문자열까지 동일** | 일치 |
| 옵션 | 5행 | 5행 + 6번째 비채점 + "This one isn't scored." | `AD-S2-11` — **등록된 허용 차이** |
| 카드 우상단 `↻`(`179:1804`) | 보임(응답된 상태) | **응답이 있을 때만 렌더** — QA 가 응답 후 `Clear this answer` 버튼 출현 확인 | Figma 도 응답된 상태를 그린 것이므로 **일치** |

### `179:1809` — `/onboarding/saved`

| 요소 | Figma | 구현 (QA 실측) | 판단 |
|---|---|---|---|
| 일러스트 | 상단~중앙 | 상단 | 일치 |
| 제목 | 화면 하단부(≈y 560~610) | y≈370 | **불일치** |
| CTA | 하단(≈y 675, 프레임 852) | **y=451** (main 높이 852) | **불일치 — `QA-2-002`** |
| 라벨 | "Get Started" + `→` | "Get started" + `›` | 경미 |

Design Spec §2.11 은 `(flex spacer)` 로 제목·CTA 를 **아래로 밀도록** 명시했고 `OnboardingSaved.tsx` 도 `flex-1` + `mt-auto` 로 그 의도를 적었으나, 실제로는 적용되지 않아 CTA 가 화면 중간에 뜬다.

> **2회차 정정·갱신 → §7.4.** 위 표의 Figma 좌표 "제목 ≈y 560~610 / CTA ≈y 675" 는 **QA 의 screenshot 추정 오류**다. node 실측은 제목 `y=615`, CTA `y=750` 이다. CTA·제목 불일치는 해소되었고, 일러스트 잔여 불일치는 `QA-2-004` 로 분리했다.

**추가 관찰(1회차 시점 — 2회차에 해소)**: 위 3개 node 에는 당시 자동 회귀 baseline 이 없었다. 2회차에 3건 모두 `REGION_SNAPSHOT` baseline 으로 추가되어 통과한다. QA 의 수동 대조는 이번 회차에만 유효하다. baseline 추가는 development-agent 작업이다.

---

### 7.4 (2회차) `179:1809` 재대조 — `QA-2-002` 해소 확인과 잔여 불일치

#### 7.4.1 Figma 실측 좌표 — **1회차의 "≈675" 는 틀렸다**

지시대로 QA 가 Figma `get_metadata` 로 **직접 재확인**했다.

```
frame 179:1809 "1e · Baseline saved"  393 × 852
  179:1810  Screen/Status Bar     y=0    h=56
  179:1819  HARU Character        x=52   y=163  307 × 415
  179:1813  "Thank you — that's the starting point"  x=26  y=615  341 × 66
  179:1814  Button                x=24   y=750  345 × 58     ← CTA
  179:1818  Rectangle (home indicator)  y=838  140 × 5
```

**판정: development-agent 가 보고한 `y=750` 이 맞다.** 1회차 리포트의 "CTA ≈ y 675" 는 QA 가
device bezel 이 포함된 screenshot 에서 눈으로 추정한 값이었고, node 실측과 **75px 어긋났다.**
이 항목은 QA 측 오류로 정정한다 (이하 판정은 전부 `y=750` 실측 기준이다).

#### 7.4.2 `QA-2-002` — **해소**

Figma 프레임은 상단 56px(status bar)·하단 44px(home indicator)을 기기 영역으로 비워 둔다. 구현은 이를
`--layout-safe-top` / `--layout-safe-bottom`(= `env(safe-area-inset-*)`) 으로 흡수하며 데스크톱 브라우저에서는
둘 다 `0px` 이다. QA 가 **그 두 변수를 56px / 44px 로 강제 주입해 실기기 프레임을 재현**하고 실측했다.

| 요소 | Figma node | 구현 (데스크톱 `env=0`) | **구현 (safe 56/44 주입)** | Δ vs Figma |
|---|---|---|---|---|
| CTA `Get started` | `y=750` `h=58` (bottom 808) | `y=796` `h=56` (bottom 852) | **`y=752` `h=56` (bottom 808)** | **+2 / 0** ✅ |
| 제목 (box) | `y=615` `h=66` | `y=708` `h=56` | `y=664` `h=56` | +49 |
| main | — | `x=24 y=0 345×852` | `x=24 y=56 345×752` | — |

- 1회차 Actual(`CTA y=451`, 아래 340px 공백)은 **재현되지 않는다.**
- Design Spec §2.11 의 `(flex spacer)` 가 실제로 작동한다 — 제목↔CTA 간격은 **32px** 이고 이는 `--space-8`(= `calc(--spacing * 8)` = 32, QA 가 `packages/design-tokens/src/semantic/space.css:29` 에서 확인) 로 §2.11 명세와 **정확히 일치**한다.
- 데스크톱 `y=796` 과 Figma `y=750` 의 차이는 허용 차이 **`AD-S2-16`**(하단 safe-area flush, ±48px) 범위 안이고, QA 가 그 **근거 자체를 검증**했다: safe-area 를 주입하면 오차가 46px → **2px** 로 줄어든다. `AD-S2-16` 의 설명은 사실이다.
- **부수 영향 대상 화면도 같은 방식으로 확인**: `/auth/welcome` 법적 각주 = 구현 `y=820`(데스크톱) → safe 주입 시 `y≈776`, Figma `179:1722` `y=788` → Δ 12px, `AD-S2-16` 범위 안.
- 200% 텍스트 확대(`html{font-size:32px}`)에서 세로·가로 오버플로 **둘 다 없음**, 블록 순서 유지.

증거: `docs/qa/evidence/stage-2/r2-impl-onboarding-saved.png` (데스크톱) · `r2-impl-onboarding-saved-safearea.png` (safe 56/44) · `r2-figma-179-1809-clean.png`.

**판정: `QA-2-002` `RESOLVED`. AC-2-57 → `PASS`.**

#### 7.4.3 잔여 불일치 — 일러스트와 중앙 여백 (`QA-2-004` 신규)

`QA-2-002` 수정으로 `(flex spacer)` 가 살아나면서 **1회차에는 압축돼 보이지 않던 차이가 드러났다.**
QA 가 Figma clean render(`contentsOnly`, device bezel 제외)와 구현 screenshot을 **픽셀 단위 bounding box 로 계산**해 비교했다
(두 이미지를 393×852 node 좌표계로 정규화, 배경 대비 임계 40).

| 밴드 | Figma `179:1809` (node 좌표) | 구현 (safe 56/44) | Δ |
|---|---|---|---|
| status bar | `y 0–37` | (safe-top 으로 흡수 — 정상) | — |
| **캐릭터 실체** | **`y 218–550` (h 333)** · `x 77–357` (w 281) | **`y 101–386` (h 285)** · `x 74–342` (w 268) | **높이 −48 (−14%) · 상단 −117 · 하단 −164** |
| **캐릭터↔제목 여백** | **59px** | **282px** | **+223px** |
| 제목 1행 | `y 609–632` | `y 668–689` | +59 |
| 제목 2행 | `y 639–666` | `y 696–717` | +57 |
| CTA | `y 750–808` | `y 752–808` | **+2 / 0** ✅ |

원인 (구현 지시 아님): Figma node `179:1819` 는 **307×415 (비율 0.74)** 이고 Design Spec §5.2 도
"Figma 307×415, 비율 ≒ 0.74 / 세로비 유지 / 고정 높이 금지" 로 적었는데, 번들된 에셋
`apps/web/src/shared/assets/character/hello-heart.png` 는 **464×464 (비율 1.0)** 이다. 폭 307 에 세로비를 지키면
높이가 **307** 이 되어 Figma 대비 108px 짧아지고, 남는 공간을 `(flex spacer)` 가 한 지점에 모두 몰아
화면 중앙에 큰 빈 띠가 생긴다.

등록된 허용 차이 중 이를 덮는 것은 **없다**:

| 후보 | 덮는가 | 이유 |
|---|---|---|
| `AD-S2-16` | ✗ | 범위가 "세로 위치 하단 ±48px, **블록 순서·간격·크기 차이 없음**" — 여기는 간격 +223, 크기 −48 |
| `AD-S2-3` | ✗ | 대상이 소개 화면 `CharacterMedallion`(200→188). `CharacterIllustration` 이 아니다 |
| `AD-S2-12` | ✗ | Button 규격 전용 |

**이것은 새 회귀가 아니라 1회차 `AC-2-56` 누락 조건 ①(`179:1809` 불일치)의 잔여분**이다.
따라서 AC-2-56 은 `PARTIAL` 을 유지하고, 잔여분을 `QA-2-004` 로 분리 기록한다.

---

### 7.5 (3회차) `179:1809` 재대조 — `QA-2-004` 해소 확인

#### 7.5.1 측정 방법 (1·2회차와 비교 가능하게 유지 + **정밀도 개선**)

1·2회차와 같은 두 축을 썼다 — ① **safe-area 주입**(`--layout-safe-top:56px` / `--layout-safe-bottom:44px`)
으로 실기기 프레임 재현 ② **픽셀 bounding box** 로 캐릭터 실체 측정.
3회차에서 **한 가지를 개선**했다:

> **2회차의 Figma 절대 좌표는 렌더 배율 때문에 ~13px 어긋나 있었다.** 2회차는 `422×852` 로 축소된
> 렌더(`original 449×908`)를 393×852 로 정규화했다. 3회차는 `maxDimension=908` 로 **1:1 렌더**를 받고,
> 알파 solid bbox 로 프레임 원점을 찾아(`x=28, y=16`, 크기 **정확히 393×852** 확인) 좌표를 읽었다.
> 그래서 3회차의 Figma 캐릭터 좌표(`y 241..561`)가 2회차 기록(`y 218..550`)과 다르다 — **높이는
> 331~333 으로 일치**하므로 2회차의 "여백 +223px" 이라는 결론 자체는 유효했고, 절대 위치만 정정한다.

임계: 행별 배경(좌측 gutter 12px 중앙값) 대비 **maxdiff > 40**. Figma·구현에 **동일 알고리즘**을 적용했다.

#### 7.5.2 박스 기하 — QA 직접 실측 (393×852, safe 56/44)

| 요소 | Figma `179:1809` | 1회차 | 2회차 | **3회차 (QA 실측)** | Δ vs Figma |
|---|---|---|---|---|---|
| 일러스트 박스 | `y 163..578` · **307×415** | — | `y 80..387` · **307×307** | **`y 171.8..586.8` · `307×415`** | 크기 **0 / 0** · 위치 **+8.8** |
| 일러스트 가로 | `x 52` (좌 52 / 우 34) | — | — | **`x 43`** (가운데 정렬) | **−9** (§5.2 `margin-inline:auto`) |
| 제목 박스 | `y 615..681` (h **66**) | `y≈370` | `y 664..720` | **`y 618.8..674.8` (h 56)** | **+3.8** / h **−10** |
| CTA | `y 750..808` (h 58) | **`y 451`** | `y 752..808` | **`y 752.0..808.0` (h 56)** | **+2 / 0** ✅ |
| spacer A : B | 107 : 69 (1.55) | — | — | **115.8 : 77.2 = `1.5000`** | 규칙 **정확** |

**§2.11 의 3 : 2 규칙이 오차 없이 구현되어 있다.** QA 검산:
`usable 752 − (일러스트 415 + gap 32 + 제목 56 + CTA 56) = 193` → `A = 193×3/5 = 115.8` · `B = 77.2`.
실측값과 **소수점까지 일치**한다.

#### 7.5.3 캐릭터 실체 · 여백 — `QA-2-004` 의 직접 대상

| 지표 | Figma | 2회차 | **3회차** | 3회차 Δ vs Figma |
|---|---|---|---|---|
| 캐릭터 실체 높이 | **321** (`y 241..561`) | 285 | **324** (`y 246..569`) | **+3 (+0.9%)** (2회차 −48) |
| 캐릭터 실체 폭 | 275 (`x 84..358`) | 268 | **277** (`x 73..349`) | +2 / 위치 −11 |
| **캐릭터↔제목 여백** (박스 기준) | **54** | **282** | **49.8** | **−4.2** (2회차 **+223**) |
| 캐릭터↔제목 여백 (잉크 기준) | 61 | — | **55** | −6 |
| 제목 1행 잉크 top | 622 | — | **624** | **+2** |
| 제목 2행 잉크 top | 653 | — | **652** | **−1** |

**세 지표 모두 ≤9px 로 들어왔다.** 나란히 둔 증거: `docs/qa/evidence/stage-2/r3-saved-figma-vs-impl.png`
(좌 Figma 1:1 · 우 구현 safe 56/44).

#### 7.5.4 새 에셋 검증 — 업스케일이 아님을 QA 가 직접 확인

`development-agent` 의 "941×1672 원본에서 2.0x 다운샘플" 주장을 **보고가 아니라 파일로** 검증했다.

| 검사 | 결과 | 판정 |
|---|---|---|
| 파일 크기·비율 | `614×830` → **0.73976** = `307/415` (0.73975) | **정확히 2.0x** ✅ |
| 알파 | RGBA, `alpha<5` 44.6% · `alpha>250` 48.7% | **투명 배경 실재** ✅ |
| 기하 동일성 | 새 에셋을 Figma node 배경에 합성 후 **같은 알고리즘**으로 bbox 측정 → 임계 20 에서 `x 23..306 / y 65..398`, Figma node 렌더 `x 23..306 / y 68..398` | **Δ ≤3px — 기하 동일** ✅ |
| 선명도 (라플라시안 분산, 표시 폭 307 기준) | Figma node 렌더 **74.3** → 새 에셋 **254.7** (네이티브 614 에서 1037.0) | **정보량 3.4배 증가 = 실제 다운샘플**, 업스케일 아님 ✅ |
| 투명 전환의 시각 영향 | Figma `179:1809` 안에서 일러스트 노드의 그라데이션 사각형과 프레임 배경의 **최대 채널 차이 = 4/255** (21개 지점 측정) | **Figma 에서도 보이지 않는 사각형** → 제거가 Figma 에 더 가깝다 ✅ |
| 다른 화면 영향 | `hello-heart-full` 사용처 = `OnboardingSaved.tsx` **1곳**. `CharacterIllustration` 사용처도 그 1곳. medallion 2종(`hello-heart` · `headphones`)은 파일 mtime `Sep 25` 로 **무변경** | **격리됨** ✅ |
| 회귀 | e2e **121/121 통과**, 변경 baseline 은 `s2-onboarding-saved.png` **1건**뿐(mtime 확인), 나머지 41건 무변경 | **회귀 0** ✅ |

**관찰(결함 아님)**: 에셋 용량이 `108.6 kB → 570.7 kB` (+462 kB) 로 늘었다. 승인 문서에 성능·번들
예산 AC 가 없어(plan·design spec grep 0건) **판정 사유가 아니다**. 2.0x 정책의 대가이며,
용량이 문제가 되면 포맷·양자화 최적화는 별도 결정 사항이다.

#### 7.5.5 `S2-DESIGN-3` (+5.8px) 판단 — **원인은 구현이 보고한 것과 "방향은 같고 정체는 다르다"**

구현은 "제목 높이 56(토큰 `title-2` 22/28) vs Figma 66(line-height 33) 이라는 **기존 타이포 토큰과
Figma 의 차이**" 라고 보고했다. QA 가 직접 확인한 결과:

1. **산술은 맞다.** 제목 높이가 10px 짧으면 3 : 2 분배로 위쪽에 **+6**, 아래쪽에 +4 가 간다.
   Figma line-height(33)로 검산하면 일러스트 top 165.8(Figma 163, **Δ+2.8**) · 제목 top 612.8(615, **Δ−2.2**) ·
   CTA 752(750, +2) 로 **전부 ±3px** 안에 들어온다. 즉 **여백 규칙이 만든 편차가 아니다** — 이 부분은 구현 주장대로다.
2. **다만 "기존 타이포 토큰이 Figma 와 다르다" 는 부정확하다.** QA 가 Figma node 를 직접 조회했다:
   - `179:1813` = **`font-size: 27px` · `line-height: 33px` · `font-weight: 1000`**
   - 승인된 `DESIGN_TOKEN_MAP` §3.1 의 Figma Style `iOS 26/Title 2` = **22 / 28** — **토큰은 Figma Style 과 정확히 일치한다.**
   - 문제는 **node 가 Style 을 따르지 않는다**는 점, 그리고 **Design Spec §2.11 이 27px node 에 `--text-title-2`(22) 를 배정**했다는 점이다.
   - 등록된 흡수표 `AD-6` 은 **27→28**(= `title-1` 28/34) 을 명시한다. `27→22` 는 흡수표에 없다.
   → 이 항목을 **`QA-2-005`(Low, design-agent 소관)** 로 신규 기록한다.
3. **기존 허용 차이가 덮는가** — 항목별로 나눠 판정한다:

| 잔여 편차 | 크기 | 덮는 근거 | 판정 |
|---|---|---|---|
| CTA 세로 +2 · 높이 −2 | 2px | **`AD-S2-12`**(높이 ±2, 좌우 ±2) + **`AD-S2-16`**(하단 앵커 ±48) | **덮인다** |
| 제목 줄바꿈 위치 차이 (Figma 2행 / 구현 2행, 줄 끝 다름) | — | **`AD-1`** "글리프 폭·자간·베이스라인·**줄 끝 위치** 차이 허용". **행 수 증가 없음**(둘 다 2행) | **덮인다** |
| 제목 잉크 위치 +2 / −1 | ≤2px | `AD-1` + `AD-S2-12` 급 오차 범위 | **덮인다** |
| 일러스트 가로 −9 | 9px | 승인된 **Design Spec §5.2 `margin-inline: auto`**. Figma `179:1819` 자체가 좌 52 / 우 34 로 비대칭이며 이는 design-agent 가 `S2-VISUAL-1` 로 이미 기록 | **승인 소스 일치**(AC-2-57 "Figma **또는** stage-2 design spec") |
| 일러스트 세로 +8.8 · 제목 박스 −10 | ≤9px | **어느 `AD-S2-*` 도 직접 덮지 않는다.** 승인된 §2.11 3 : 2 규칙을 오차 없이 적용한 **산술적 결과**이며, 원인은 §2.11 의 토큰 배정(`QA-2-005`) | **`QA-2-005` 로 기록. Verdict 는 막지 않는다** (사유 §1.1) |

**결론**: `S2-DESIGN-3` 의 +5.8px 은 **이번 여백 규칙이 만든 것이 아니다**(구현 주장 인정).
정확한 정체는 "토큰 line-height 오류" 가 아니라 **§2.11 의 타이포 토큰 배정**이며 `QA-2-005` 로 옮긴다.
기존 허용 차이는 CTA·제목 잉크·줄바꿈을 덮고, 일러스트 세로 +8.8px 은 덮지 않는다.

#### 7.5.6 §2.11 축소 순서 — 320px · 200% 확대 **직접 확인**

QA 가 8개 조건을 브라우저에서 실행하고, 매 조건마다 **CTA 를 실제로 클릭해 `/` 로 이동하는 것까지**
확인했다 (`ctaReachable.clickable = true`). 200% 확대는 타이포 primitive 11종을 전부 2배로 주입해 재현했다.

| 조건 | spacer A | 일러스트 | 제목 | CTA | 스크롤 | 가로 overflow | **CTA 클릭 → `/`** |
|---|---|---|---|---|---|---|---|
| 393×852 (safe) | 115.8 | 307×415 | 56 (2행) | `752..808` | 없음 | 0 | ✅ |
| 393×852 (safe) **+200%** | **48.6** | 307×415 | **168 (3행)** | `752..808` | 없음 | 0 | ✅ |
| **320×568** | **24 (최소)** | 272×367.7 | 56 | `567.7..623.7` | **있음** (668/568) | 0 | ✅ |
| **320×568 +200%** | **24 (최소)** | 272×367.7 | **224 (4행)** | `735.7..791.7` | **있음** (836/568) | 0 | ✅ |
| 320×400 +200% (극단) | **24 (최소)** | 272×367.7 | 224 | `735.7..791.7` | **있음** (836/400) | 0 | ✅ |
| 600×852 / 1024×852 | 132.6 | 307×415 | 28 (1행) | `752..808` | 없음 | 0 | ✅ |

- **제목·CTA 가 잘리는 조건은 하나도 없다.** 600/1024 에서 앱 컬럼 432px 가운데 정렬도 유지된다(AC-2-59 재확인).
- `S2-LAYOUT-1` **확인**: 축소 순서 ②(일러스트 세로 축소)는 **실제로 발동하지 않는다.**
  computed style 이 `flex: 0 1 auto` · `min-block-size: 0px` · **`aspect-ratio: auto`** 이고, 래퍼 높이가
  콘텐츠 높이라서 `img { max-block-size: 100% }` 에 걸리는 제약이 생기지 않는다. 320px 에서 일러스트가
  272×367.7 로 줄어드는 것은 **가로 폭**(`min(100%, 307px)`) 때문이지 ② 때문이 아니다.
  → ①(spacer 최소값) 다음 바로 ③(스크롤)로 간다. **사용자 요구(잘림 없음 · CTA 도달)는 ③ 으로 충족**되므로
  결과 요구사항은 만족한다. 명세와 구현 주석이 ② 를 "구현했다" 고 적은 부분만 사실과 다르다 → **`QA-2-006`(Low)**.

증거: `docs/qa/evidence/stage-2/r3-measurements.json` · `r3-impl-saved-393-safe.png` · `r3-impl-saved-320-200.png`.

---

## 8. Findings

> 2회차 재검증 후 상태: `QA-2-001` **RESOLVED** · `QA-2-002` **RESOLVED** · `QA-2-003` **RESOLVED (허용 차이 등록)** · **`QA-2-004` 신규**.
> **3회차 재검증 후 상태**: `QA-2-004` **RESOLVED** (§7.5) · 신규 **`QA-2-005` · `QA-2-006` · `QA-2-007`**(전부 Low · design-agent 소관 문서 항목 · Verdict 비차단).
> 항목 번호는 1회차와 동일하게 유지한다.

```
QA-2-001 | Severity: High | 2회차: RESOLVED (§6.4)
Requirement: AC-2-19 (FR-03 / FR-24 Step 5) · 부수적으로 AC-2-24 조작 경로
Steps to reproduce (Mock 시나리오: 기본 success):
  1. pnpm --filter @haru/web run dev  (VITE_API_MODE=mock)
  2. 브라우저(데스크톱, 마우스)로 http://localhost:<port>/onboarding/capability-items 접속
  3. 설문 카드의 옵션 행 "Sometimes" 를 마우스로 클릭한다
Expected:
  라디오가 선택되고(checked=true) 카드 우상단에 "Clear this answer" 가 나타난다.
Actual:
  선택되지 않는다 (checked=false). 카드 안의 "Clear this answer" IconButton 도
  마우스 클릭에 반응하지 않는다(응답이 지워지지 않음).
  키보드(focus + Space)와 터치(tap)는 정상 동작한다.
Evidence:
  - Playwright locator.click() (label / input) → checked=false  (headless · headed 둘 다)
  - page.mouse.down()/up() 원시 이벤트 → checked=false
  - capture 리스너: click 이벤트의 target 이
      "DIV.haru-swipe-deck__card haru-swipe-deck__card--front"
    로 **리타깃**된다 (radio 에 도달하지 않음)
  - 대조군: 덱 밖 RadioGroup(`/onboarding/temperament`) 은 마우스 클릭으로 정상 선택됨
  - 터치 대조: hasTouch 컨텍스트에서 tap → checked=true
Suspected area (수정 지시 아님):
  packages/ui/src/deck/SwipeDeck.tsx:147 `event.currentTarget.setPointerCapture(event.pointerId)`
  — mouse pointer 캡처가 후속 click 의 target 을 카드 컨테이너로 바꾼다.
  기존 e2e(onboarding.spec.ts)는 키보드 경로만 검사해 이 경로를 덮지 못한다.
  2회차 재현 결과: 위 Steps 를 그대로 실행했을 때 라디오가 선택되고(checked=true)
  "Clear this answer" 가 나타나며 그 버튼도 마우스로 동작한다. 마우스만으로 10문항 완주.
  키보드·터치·스와이프 제스처 모두 유지. 대조군(덱 밖 RadioGroup)도 정상.
```

```
QA-2-002 | Severity: Medium | 2회차: RESOLVED (§7.4.2)
Requirement: AC-2-57 (승인된 디자인 소스와 구현 일치) · AC-2-56
Steps to reproduce:
  1. Trial 온보딩 5단계 완료 → 가입 → 동의 → 재개 → Finish
  2. /onboarding/saved 에 착지한 상태에서 레이아웃을 측정한다
Expected:
  Design Spec §2.11 / Figma 179:1809 — 일러스트 위, "(flex spacer)", 제목,
  --space-8, CTA 가 **화면 하단**에 온다 (프레임 852 기준 CTA ≈ y 675).
Actual:
  main 높이는 852 인데 CTA bounding box 가 { y: 451, height: 56 } 이고
  그 아래로 약 340px 의 빈 공간이 남는다. 제목도 y≈370 으로 올라와 있다.
  flex-1 / mt-auto 가 실제로 여백을 흡수하지 못한다.
Evidence:
  - docs/qa/evidence/stage-2/impl-onboarding-saved.png  ↔  figma-179-1809.png
  - page.locator('main').boundingBox()            → {x:24,y:0,width:345,height:852}
  - getByRole('button', {name:/Get started/}).boundingBox() → {x:24,y:451,...}
Suspected area (수정 지시 아님):
  apps/web/src/features/onboarding-survey/ui/OnboardingSaved.tsx 의
  최상위 `div.flex.flex-1.flex-col` 과 StackLayout 콘텐츠 래퍼의 높이 전달.
  이 화면은 시각 baseline 이 없어 e2e 가 잡지 못했다.
  2회차 재현 결과: safe-area 주입 시 CTA bounding box = { y: 752, height: 56 },
  Figma 실측 { y: 750, height: 58 } → Δ 2px. 아래 빈 공간 없음.
  **1회차 Expected 의 "CTA ≈ y 675" 는 QA 의 screenshot 추정 오류였다** — Figma node
  실측은 y=750 이다 (§7.4.1). 정정 후에도 판정은 동일하게 RESOLVED.
```

```
QA-2-003 | Severity: Low | 2회차: RESOLVED (허용 차이 등록)
Requirement: AC-2-56 (의도된 차이의 사전 기록)
Steps to reproduce:
  /onboarding 화면을 Figma 179:1748 과 대조한다.
Expected:
  Figma 와 다른 부분은 AD-S2-* 로 사전 등록되어 있어야 한다.
Actual:
  AD-S2-10 은 "소개 화면 InfoRow 문구 변경"만 덮는다.
  카드 **제목**("Hi — before your first night with Yuna…" → "Let's set up your
  child's profile"), **본문**, **CTA 라벨**("Start the questions" → "Start")의
  변경은 어떤 AD-S2-* 에도 등록되어 있지 않다.
Evidence:
  docs/qa/evidence/stage-2/figma-179-1748.png ↔ impl-onboarding-intro.png
  docs/qa/stage-2-handoff.md §5 (AD-S2-1 ~ AD-S2-14 전수 확인)
Suspected area (수정 지시 아님):
  docs/design/stage-2-design-spec.md §11.3 허용 차이 표 (문서 등록 누락).

  2회차 확인: `docs/qa/stage-2-handoff.md` §5 에 **AD-S2-15** 가 등록되었고
  제목·본문·CTA 3건의 변경과 사유(이름 수집 전 화면이라 "Yuna" 를 쓸 수 없음,
  "Ten short questions"·"Start the questions" 가 Step 5 만 설명, "no right answers"
  의미 보존)가 명시되어 있다. QA 가 구현 문구와 표의 문구가 **일치**함을 확인했다.
  Design Spec §11.3 본표 반영은 design-agent 소관이며 `S2-DESIGN-1` 로 추적 중이다
  (1회차에 AD-S2-13·AD-S2-14 를 같은 방식으로 인정한 것과 동일한 처리).
  함께 등록된 `AD-S2-16`(하단 safe-area flush)은 QA 가 근거까지 직접 검증했다 (§7.4.2).
```

```
QA-2-004 | Severity: Medium | 신규 (2회차)
Requirement: AC-2-56 (Figma 일치 — node 179:1809)
Steps to reproduce (Mock 시나리오: me:consent-missing → 기본 success):
  1. pnpm --filter @haru/web run dev  (VITE_API_MODE=mock)
  2. /onboarding?scenario=me:consent-missing 부터 Trial 5단계 → 가입 → 동의 →
     "Pick up where you left off" → Finish 로 /onboarding/saved 에 착지한다
  3. (실기기 프레임 재현) :root{--layout-safe-top:56px; --layout-safe-bottom:44px} 를 주입한다
  4. 화면을 Figma 179:1809 과 대조한다
Expected:
  Figma 179:1809 — 캐릭터 실체가 y 218–550 (높이 333) 을 차지하고 캐릭터와 제목 사이
  여백은 59px 이다. 차이가 있다면 AD-S2-* 로 사전 등록되어 있어야 한다.
Actual:
  캐릭터 실체가 y 101–386 (높이 285) 으로 **48px 짧고 117px 위**에 있어, 캐릭터와 제목
  사이에 **282px 의 빈 띠**가 생긴다 (Figma 59px). 이 차이를 덮는 AD-S2-* 가 없다.
  (CTA·제목 간격은 §7.4.2 대로 정상이다 — 이 Finding 은 일러스트 한 요소에 한정된다.)
Evidence:
  - docs/qa/evidence/stage-2/r2-figma-179-1809-clean.png  (Figma contentsOnly render)
    ↔ r2-impl-onboarding-saved-safearea.png (safe 56/44) / r2-impl-onboarding-saved.png
  - e2e baseline e2e/__screenshots__/darwin/visual.spec.ts/s2-onboarding-saved.png
    (현재 baseline 자체가 이 빈 띠를 고정하고 있다)
  - QA 픽셀 bounding box 계산 (393×852 정규화, 배경 대비 임계 40):
      Figma  캐릭터 y 218–550 (h 333) x 77–357 (w 281)
      구현    캐릭터 y 101–386 (h 285) x 74–342 (w 268)
  - Figma node 179:1819 = 307×415 (비율 0.74)
    vs apps/web/src/shared/assets/character/hello-heart.png = 464×464 (비율 1.00)
Suspected area (수정 지시 아님):
  apps/web/src/shared/assets/character/hello-heart.png (에셋 세로비)
  · docs/design/stage-2-design-spec.md §5.2 "Figma 307×415, 비율 ≒ 0.74" / §2.11 (flex spacer)
  해소 경로는 ① 에셋 재export ② Design Spec 조정 ③ 허용 차이 AD-S2-17 등록 중 하나이며,
  어느 쪽인지는 design-agent·사용자 결정 사항이다. QA 는 스스로 수용하지 않는다.

  3회차 재현 결과: **재현되지 않는다 → RESOLVED.** 해소 경로 ①(에셋)과 ②(Design Spec §2.11)가
  둘 다 수행되었다. 같은 절차(Trial 완주 → safe-area 56/44 주입 → 픽셀 bbox)로 QA 가 직접 실측:
    - 일러스트 박스 307×415 = Figma **Δ0** (2회차 307×307)
    - 캐릭터 실체 높이 324 vs Figma 321 → **Δ+3** (2회차 −48)
    - 캐릭터↔제목 여백 49.8 vs Figma 54 → **Δ−4.2** (2회차 **+223**)
    - CTA y 752..808 vs Figma 750..808 → Δ+2 / 0 (유지)
    - 에셋 614×830 = 정확히 2.0x · 투명 · 선명도 74→255 (다운샘플 실증, §7.5.4)
  남는 편차(일러스트 세로 +8.8 · 가로 −9 · 제목 박스 −10)는 §7.5.5 표대로 등록된 허용 차이 또는
  승인된 Design Spec 규칙으로 설명되며, 그 중 토큰 배정 문제만 `QA-2-005` 로 분리했다.
```

```
QA-2-005 | Severity: Low | 신규 (3회차) — **design-agent 소관 문서 항목, Verdict 비차단**
Requirement: AC-2-56 / AC-2-57 (Figma ↔ 승인 디자인 소스 일치) · `S2-DESIGN-3` 의 정확한 정체
Steps to reproduce:
  1. Figma node 179:1813 (/onboarding/saved 제목) 의 텍스트 속성을 조회한다
  2. docs/design/stage-2-design-spec.md §2.11 의 해당 줄과 대조한다
  3. docs/design/stage-1-design-spec.md §10.3 `AD-6` 흡수표와 대조한다
Expected:
  Figma node 값이 등록된 흡수표(`AD-6`: 11.5→11 · 12.5→12 · 14.5→15 · 21→22 · **27→28**)의
  항목으로 흡수되거나, 흡수표 밖이면 별도 허용 차이로 등록되어 있어야 한다 (`AD-6` "흡수표 항목만 허용").
Actual:
  Figma `179:1813` = font-size **27px** / line-height **33px** / weight 1000 인데
  Design Spec §2.11 은 `--text-title-2`(**22 / 28**) 를 배정했고 구현이 이를 따른다.
  `27→22` 는 `AD-6` 흡수표에 없다 (표는 27→28 = `title-1` 28/34 을 지시한다).
  같은 배정이 `/auth/log-in` 에도 있다 — Figma `179:1831` = **30px** → 구현 `title-2`(22).
  (`/auth/log-in` 은 3회차 실측 대상이 아니어서 화면 실측은 하지 않았다 — node 값만 확인했다.)
  결과적으로 /onboarding/saved 제목 박스가 66 → 56 이 되고, §2.11 의 3 : 2 분배를 통해
  일러스트가 +5.8~8.8px 내려간다 (= development-agent 가 보고한 `S2-DESIGN-3` 의 원인).
Evidence:
  - Figma get_design_context 179:1813 → `leading-[33px] text-[27px] font-[1000]`
  - Figma get_design_context 179:1831 → `text-[30px] font-[1000]`
  - docs/DESIGN_TOKEN_MAP.md §3.1 — `iOS 26/Title 2` = 22/28 (**토큰은 Figma Style 과 일치**)
  - docs/design/stage-1-design-spec.md:1374 `AD-6`
  - docs/qa/evidence/stage-2/r3-saved-figma-vs-impl.png (제목 크기 차이 육안 확인 가능)
Suspected area (수정 지시 아님):
  docs/design/stage-2-design-spec.md §2.11(제목 토큰 배정) · §2.3(`179:1831`) · §11.3(미등록)
  해소 경로: ① §2.11/§2.3 토큰 배정을 `AD-6` 흡수표대로 조정 ② 흡수표 밖 배정을 `AD-S2-17` 로 등록
  ③ 흡수표 자체를 개정. **어느 쪽이든 design-agent·사용자 결정 사항이며 QA 는 스스로 수용하지 않는다.**
Verdict 비차단 사유 (§1.1):
  ① 3회차 수정이 만든 회귀가 아니다 (승인된 Design Spec 이 지시한 값이고 1·2회차 baseline 에 이미 고정)
  ② AC-2-57 이 승인 소스를 "Figma **또는** stage-2 design spec" 으로 정의한다
  ③ 결과 편차가 ≤9px 이고 프로젝트가 등록해 온 허용 차이 규모(AD-S2-3 ±12 · AD-S2-16 ±48) 안이다
```

```
QA-2-006 | Severity: Low | 신규 (3회차) — **비차단**
Requirement: Design Spec §2.11 "공간 부족 시 축소 순서 ②"
Steps to reproduce:
  1. /onboarding/saved 를 320×568 · 393×852+200% 등으로 연다
  2. `.haru-character-illustration` 의 computed style 과 실제 높이를 본다
Expected:
  §2.11 ② — "일러스트가 `aspect-ratio`(307/415) + `object-fit: contain` + `min-height: 0` 으로
  남은 높이에 맞춰 축소된다". `character.css` 주석도 ②를 구현했다고 적는다.
Actual:
  ②는 **어떤 조건에서도 발동하지 않는다.** computed `aspect-ratio: auto`(명세가 말한 속성이 없음),
  래퍼 높이가 콘텐츠 높이라 `img{max-block-size:100%}` 가 제약이 되지 않는다. 320px 에서의 축소는
  **가로 폭**(`min(100%,307px)`) 때문이다. 실제 동작은 ①(spacer 최소값) → ③(스크롤) 이다.
  **사용자 요구(제목·CTA 잘림 없음 · CTA 도달 가능)는 6개 조건 전부에서 충족된다** (§7.5.6).
Evidence:
  docs/qa/evidence/stage-2/r3-measurements.json (`illustrationCss.aspectRatio = "auto"`,
  6개 조건의 일러스트 높이·스크롤·CTA 클릭 성공 기록)
Suspected area (수정 지시 아님):
  apps/web/src/entities/character/character.css (②를 구현했다는 주석) ·
  docs/design/stage-2-design-spec.md §2.11 축소 순서 ② · `AppShell` grid 높이 체인
  (= development-agent 가 `S2-LAYOUT-1` 로 보고한 내용. QA 가 독립 확인했다.)
```

```
QA-2-007 | Severity: Low | 신규 (3회차) — **문서 최신화, 비차단**
Requirement: AC-2-57 (승인된 디자인 소스와 구현 일치 — 문서 측)
Steps to reproduce:
  docs/design/stage-2-design-spec.md §2.11 의 일러스트 줄과 구현을 대조한다.
Expected:
  Design Spec 이 실제 사용 에셋을 가리킨다.
Actual:
  §2.11 은 여전히 `CharacterIllustration  asset=hello-heart` 로 적혀 있는데,
  구현은 `asset="hello-heart-full"` (신규 에셋, Figma 179:1819 / 163:2529) 을 쓴다.
  §2.11 "393×852 검산" 도 제목 높이 **66**(Figma line-height 33)을 전제로 "오차 ≤4px" 라고 적는데,
  같은 문서가 지정한 토큰(`--text-title-2` 22/28)으로는 제목이 **56** 이라 검산이 자기모순이다
  (실측 오차는 일러스트 +8.8px — §7.5.2).
Evidence:
  docs/design/stage-2-design-spec.md:482 · :500 ↔ apps/web/src/features/onboarding-survey/ui/OnboardingSaved.tsx:24
Suspected area (수정 지시 아님):
  docs/design/stage-2-design-spec.md §2.11 (design-agent 소관 문서 갱신)
```

---

## 9. NOT VERIFIED

**없음.** 이번 회차에서 QA 가 실행하지 못한 검증 명령은 없다.

참고로 다음은 이 Stage 의 검증 대상이 아니다 (Scope 밖, `NOT VERIFIED` 로 계상하지 않음):

| 항목 | 사유 |
|---|---|
| 실기기 iOS / Android | Capacitor 미도입 — Stage 4 (`apps/mobile` 부재가 정상, AC-2-01) |
| 녹음 클라이언트 시나리오 표 | Stage 4 이후 |

---

## 10. BACKEND_INTEGRATION_PENDING

AC 자체는 전부 Frontend 분만 묻기 때문에 AC 판정에는 `BACKEND_INTEGRATION_PENDING` 이 없다. Backend 대기 항목은 `docs/qa/stage-2-handoff.md` §4 의 **`P2-BIP-01` ~ `P2-BIP-16`** 로 기록되어 있으며, QA 가 목록과 Handoff 대상 문서 지정을 확인했다.

| 대기 사유 | ID | Handoff 대상 |
|---|---|---|
| 실제 인증 Provider · `GET /v1/me` · 비밀번호 재설정 메일 · OAuth 취소 · 서버 세션 무효화 | P2-BIP-01 · 01a · 02 · 12 · 15 | `AUTH_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| **서버 측 동의 강제** · `consent_events` append-only · 문서 버전 | P2-BIP-03 · 04 | `AUTH_REQUIREMENTS.md` · `DATA_REQUIREMENTS.md` · `ERROR_CODES.md` |
| VPC 실제 방식 (법무 `L-01`) | P2-BIP-05 | `AUTH_REQUIREMENTS.md` |
| 온보딩 서버 draft · instrument 배포/버전 (신규 요구 4건) | P2-BIP-06 | `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |
| 역량 스코어 서버 재사용 · 스냅샷 저장 · 아동 1명 UNIQUE | P2-BIP-07 · 09 · 10 | `DATA_REQUIREMENTS.md` |
| 페르소나 생성 · Safety Filter · fallback | P2-BIP-08 | `ANALYSIS_PIPELINE_REQUIREMENTS.md` |
| `Idempotency-Key` 24h 보관·재생 | P2-BIP-11 | `BACKEND_HANDOFF.md` |
| 책 검색 코퍼스 | P2-BIP-13 | `DATA_REQUIREMENTS.md` |
| `PATCH /v1/me` 보호자 프로필 | P2-BIP-14 | `AUTH_REQUIREMENTS.md` · `DATA_REQUIREMENTS.md` |
| 서버 측 사용자 데이터 삭제 경로 | P2-BIP-16 | `DATA_REQUIREMENTS.md` · `BACKEND_HANDOFF.md` |

Contract 는 있으나 endpoint 가 없는 추적 항목(동의 문서 본문 호스팅 = `L-02`, `signup_oauth` 미구분 = `S2-CONSENT-1`, `ConsentDocument.updatedAt`, RLS·소유권)도 handoff §4 말미에 기록되어 있다. QA 확인 완료.

---

## 11. 추적 항목

### 11.1 `L-02` — 약관·개인정보방침 (출시 전 차단, 확인 항목 판정)

| 확인 | 결과 |
|---|---|
| Mock `ConsentDocument.url` 이 실제 문서인가 | **아니다.** 5건 전부 `https://haru.invalid/legal/*--placeholder` (`.invalid` = RFC 2606 예약 TLD, 절대 해석되지 않음) |
| 화면 노출 | 노출된다 — Welcome 고지문 2건, 동의 5항목 링크 |
| 가짜임이 드러나는가 | 드러난다. `isPlaceholderLegalUrl()` 로 기계 검사 가능하고 e2e 가 5건 전부 고정 |
| 약관 **본문**이 코드·fixture 에 있는가 | **없다** (AC-2-18) |
| 교체 방법 | `shared/config/legal-links.ts` 상수 5줄 교체 |

**판정: 확인 완료 — `ConsentDocument.url` 은 실제 문서 URL 이 아니다.** 실제 사용자가 동의 화면을 만나기 전 교체되어야 한다 (`WORKFLOW_STATE.md` §3 · Stage 8 `BACKEND_HANDOFF.md` launch blocker · 법무 `L-02`).

### 11.2 남은 가값 (provisional) 6건 — FAIL 사유 아님

`rules/qa.md` §2 에 따라 목록만 기록한다. `PROVISIONAL_ITEMS` 의 `status:'waiting'` 6건과 1:1 일치함을 QA 가 확인했다.

| P | 토큰 | Stage 2 실사용처 |
|---|---|---|
| **P-01** | `--color-fg-secondary` / `-tertiary` | Auth·온보딩 helper 텍스트, 설문 eyebrow, Home EmptyState 설명 |
| **P-02** | 비텍스트 (진행 바 · 칩 경계 · 배지 글자) | 온보딩 진행바, Step 3 Chip |
| **P-04** | `--color-status-*` (16) · field error 2 | VPC 실패 InlineAlert, 필드 에러, Trial 안내, 로그아웃 ConfirmDialog·실패 InlineAlert |
| **P-05** | `--color-scrim` | 성별 선택 Sheet, 로그아웃 ConfirmDialog |
| **P-16** | medallion sm/md/lg + ring-offset | `CharacterMedallion` — Welcome · Intro · Log in |
| **P-17** | TextField `trailingAction` 밑줄 제거 (결정 `D-14`) | Auth 비밀번호 Show/Hide, Step 1 Add/Clear |

### 11.3 결정 대기 (QA 가 재확인한 것)

| ID | 내용 | 대상 |
|---|---|---|
| `S2-COPY-1` | 소개 화면 소요 시간·진행 방식 문구 미확정 — **빈 슬롯로 구현됨**(`durationSlot`·`formatSlot` = `null`, 테스트가 고정). 플레이스홀더 문구 없음 확인 | 기획 |
| `S2-ONB-1` · `S2-ONB-2` · `S2-ONB-3` | 질문지 Required 표기 / Q5 표지 그리드(Stage 3) / 질문지 문서 Source of Truth 미등재 | 기획 · 사용자 |
| `S2-CONSENT-1` | `consent_events.source` 의 `signup_oauth` 미구분 | 사용자 |
| `S2-HOME-1` | Home 워드마크 에셋화 여부 (`AD-S2-14` — 현재 텍스트) | 디자이너 |
| 디자이너 요청 3건 | `179:1775` 좌표 · `179:1763/1767` 문구 · Step 5 옵션 44px | 디자이너 |

---

## 12. Regression

### 12.1 1회차

| 항목 | 결과 |
|---|---|
| Stage 1 AC 핵심 경로 | e2e `scenarios.spec.ts` — 전부 통과 |
| Stage 1 시각 baseline | `v1`~`v9`, frame 320/393/600/1024 — 전부 통과 |
| 그림자 클리핑 회귀 | `shadow.spec.ts` 통과 |
| 전체 테스트 | 997 / 997 · e2e 113 / 113 |

### 12.2 2회차 — `StackLayout` 변경의 부수 영향 점검 (지시 4)

`StackLayout` 의 콘텐츠 래퍼가 `grow` → `flex grow flex-col` 로 바뀌면 **`StackLayout` 을 쓰는 모든 화면**의
세로 배치가 달라질 수 있다. QA 가 영향 범위를 직접 측정했다.

**(a) 재생성된 baseline 4건이 실제로 의도된 변화인가**

| baseline | 변화 | QA 확인 |
|---|---|---|
| `s2-welcome` | 법적 각주가 하단으로 이동 | 구현 `y=820`(데스크톱) → safe 주입 `y≈776` ↔ Figma `179:1722` `y=788`. **Figma 에 더 가까워졌다** (`AD-S2-16` 범위) |
| `s2-login` | 하단 "New to HARU? / Create an account" 가 하단으로 | 구현 `y≈822`, 오버플로 0 |
| `s2-signup` | CTA 가 하단으로 (`y=796`) | 영역 클립(`form`) baseline 통과 |
| `s2-consent` | CTA 가 하단으로 (`y=796`), 그 위 차단 사유 `y=772` | 통과 |

4건 모두 e2e 121건 안에서 **통과**한다.

**(b) `/auth/*` 4화면 — 레이아웃 · 200% 확대 · 키보드**

| 화면 | 세로 오버플로 | 가로 오버플로 | 200% 텍스트(`font-size:32px`) | 키보드 |
|---|---|---|---|---|
| `/auth/welcome` | 없음 | 없음 | 오버플로 0 · 모든 블록 스크롤 도달 가능 | (1회차 유지) |
| `/auth/log-in` | 없음 | 없음 | 동일 | 1회차 유지 |
| `/auth/sign-up` | 없음 | 없음 | 동일 | 1회차 유지 |
| `/auth/consent` | 없음 | 없음 | 동일 | **2회차 직접 재현**: 필수 3항목을 focus + `Space` 로 체크 → 3건 모두 `checked=true`, `Continue` 의 `aria-disabled` 가 해제되고 `Enter` 로 제출 → `/onboarding` 이동 ✅ |

체크박스는 여전히 **5개**(필수 3 + 선택 2) — AC-2-10 회귀 없음.

**(c) 온보딩 전 화면 × 승인된 breakpoint 4폭**

`/onboarding` · `/child-info` · `/temperament` · `/books` · `/goals` · `/capability-items` 6화면을
320 / 393 / 600 / 1024px 에서 측정 — **가로 오버플로 0건**, 앱 컬럼 규칙 유지:

```
320  → main x=24  w=272
393  → main x=24  w=345
600  → main x=84  w=432   (최대 480 컬럼 가운데 정렬)
1024 → main x=296 w=432
```

**(d) 소개 화면 `179:1748` 재대조** (CTA 가 하단으로 이동했으므로 다시 확인)

| 요소 | Figma | 구현 (safe 56/44) | 판단 |
|---|---|---|---|
| medallion | `96.5,110` 200×200 | `103,80` 188×188 | `AD-S2-3` |
| 제목·본문 | `179:1757` / `179:1758` | 문구 다름 | **`AD-S2-15`** (2회차 등록) |
| InfoRow 2행 | `y 562` / `y 619` | 렌더 안 함 | `AD-S2-10` + `S2-COPY-1` |
| Trial 안내 블록 | 없음 | `y 530–676` | `C13-11` 명세 화면 |
| CTA | `y=724` `h=58` | `y=753` `h=56` | Δ 29 / −2 → `AD-S2-16`(±48) + `AD-S2-12`(±2) 범위 |

**부수 영향 결론: 회귀 0건.** 변화는 전부 `(flex spacer)` 의도대로이고 Figma 에 더 가까워지는 방향이다.
다만 그 결과 `/onboarding/saved` 의 일러스트 불일치가 드러났다 — `QA-2-004` (§7.4.3).

### 12.3 2회차 전체 스위트

| 항목 | 결과 |
|---|---|
| Stage 1 시각 baseline (`v1`~`v9`, frame 4폭) | **전부 통과** |
| 그림자 클리핑 회귀 `shadow.spec.ts` | 통과 |
| Stage 1 `scenarios.spec.ts` (health 5 scenario · 결정성 · `__states` · Scenario Panel) | 통과 |
| 전체 유닛 | **1000 / 1000 (98 파일)** |
| 전체 e2e | **121 / 121 (2.0m)** |
| QA 독립 스펙 (privacy 3 + contracts 9) | **12 / 12** |
| QA 독립 브라우저 probe | 저장소 키 0 · 콘솔 PII 0 · 외부 요청 0 |
| dev 산출물 분리 | `assert:no-mocks` 3 sentinel 0건 |

---

### 12.4 3회차 전체 스위트 · 부수 영향 점검

| 항목 | 결과 |
|---|---|
| 전체 유닛 | **1000 / 1000 (98 파일)** — 2회차 대비 감소 0 |
| 전체 e2e | **121 / 121 (2.1m)** — 2회차 대비 감소 0 |
| Stage 1 시각 baseline (`v1`~`v9`, frame 4폭) | **전부 통과** |
| Stage 2 화면 baseline 42건 | **전부 통과**, 변경된 파일은 `s2-onboarding-saved.png` **1건**뿐 (mtime 확인) |
| 그림자 클리핑 회귀 `shadow.spec.ts` | 통과 |
| `scenarios.spec.ts` (health 5 scenario · 결정성 · `__states` · Scenario Panel) | 통과 |
| dev 산출물 분리 | `assert:no-mocks` 3 sentinel 0건 / 4개 파일 |
| Scope | `apps/api` · `supabase` · `apps/mobile` 미생성, `*.sql`·migration 0건 |
| 3회차 변경 파일 범위 (mtime > 12:00) | 제품 코드 **4건**(`hello-heart-full.png` · `assets/character/index.ts` · `entities/character/character.css` · `features/onboarding-survey/{onboarding.css,ui/OnboardingSaved.tsx}`) + baseline 1 + 문서 2 |
| 격리 확인 | `CharacterIllustration` · `hello-heart-full` 사용처 = `/onboarding/saved` **1곳**. medallion 화면(`/auth/welcome` · `/auth/sign-up` · `/auth/log-in` · `/onboarding`)은 `hello-heart` · `headphones` 를 그대로 쓰며 파일 무변경 |
| 반응형 재확인 | 320 / 393 / 600 / 1024 + 200% 확대 6조건 직접 실행 — 가로 overflow 0, 앱 컬럼 432px 가운데 정렬 유지, CTA 전 조건 클릭 가능 (§7.5.6) |

**부수 영향 결론: 회귀 0건.** 투명 배경 전환은 Figma 기준으로도 보이지 않던 사각형을 제거한 것이라
Figma 에 더 가까워지는 방향이고(§7.5.4), 용량 증가는 승인 문서에 예산 AC 가 없어 판정 사유가 아니다.

---

## 13. 다음 단계

> **3회차 갱신 (2026-09-27)** — 아래 2회차 항목은 **해소되었다**. 3회차 기준 다음 단계는 §13.1 이다.

**Stage Verdict `INCOMPLETE` — Stage 3 진입 불가.** 남은 항목은 하나다.

1. `QA-2-004` (Medium · AC-2-56) — `/onboarding/saved` 일러스트가 Figma `179:1819`(307×415, 비율 0.74) 대비
   높이 −48px·위치 −117px 이고 캐릭터↔제목 여백이 59px vs 282px 이다. 해소 경로 3가지 중 하나를 **사용자·design-agent 가 결정**해야 한다:
   | 경로 | 담당 | 효과 |
   |---|---|---|
   | ① `hello-heart` 에셋을 Figma 세로비(0.74)로 재export | design-agent 요청 → development-agent | Figma 와 가장 가까움. `s2-onboarding-saved` baseline 재생성 필요 |
   | ② Design Spec §2.11 / §5.2 조정 (예: spacer 분배 변경·최소 높이) | design-agent | 구조 자체를 재정의 |
   | ③ 허용 차이 `AD-S2-17` 로 등록 | design-agent (§11.3) | 현 구현 유지. **등록되면 AC-2-56 은 `PASS`** |
2. `S2-DESIGN-1` — Design Spec §11.3 에 `AD-S2-15` · `AD-S2-16` (+ ③ 선택 시 `AD-S2-17`) 반영 (design-agent 소관).
3. 사용자가 `QA-2-004` 를 **항목 단위로 명시 수용**하면 `PASS (accepted: QA-2-004)` 로 기록할 수 있다
   (`rules/qa.md` §2 · Stage 0 #25). **QA 는 스스로 수용하지 않는다.**
4. Stage 3 는 Stage Verdict `PASS` 및 사용자 지시 이후에만 시작한다.

### 13.1 3회차 기준 다음 단계

**Stage Verdict `PASS`.** `rules/workflow.md` §4 에 따라 Stage 3 진입은 **사용자 지시가 있을 때만** 시작한다.
QA 는 여기서 멈춘다 — 다음 Stage 를 시작하지 않는다.

| # | 항목 | 성격 | 담당 |
|---|---|---|---|
| 1 | `QA-2-005` — Figma node 27/33 · 30px 에 `--text-title-2`(22/28) 배정. `AD-6` 흡수표(27→28) 밖 | **문서 결정** (Verdict 비차단) | design-agent → 사용자 |
| 2 | `QA-2-006` — §2.11 축소 순서 ② 가 실제로 발동하지 않음 (결과 요구는 ③ 으로 충족) | **문서·설계 결정** (비차단) | design-agent → 사용자 |
| 3 | `QA-2-007` — Design Spec §2.11 의 `asset=hello-heart` 표기와 검산 전제(제목 66) 최신화 | **문서 최신화** (비차단) | design-agent |
| 4 | `--space-7` · `--space-10` 미정의 토큰을 Design Spec 이 8곳에서 참조 (구현은 미사용 → 런타임 영향 0) | 3회차 **범위 밖**, 별도 처리 | design-agent |
| 5 | 남은 가값 6건 (P-01 · P-02 · P-04 · P-05 · P-16 · P-17) | FAIL 사유 아님 | 사용자 확인 |
| 6 | `S2-COPY-1` · `S2-HOME-1` · `S2-ASSET-1`(해소) 등 기존 열린 항목 | 기존 추적 | 기존 담당 |

1~3 은 전부 **`docs/design/**` 문서 갱신**으로 닫히며 제품 코드 수정을 요구하지 않는다.
사용자가 "등록되지 않은 Figma 불일치는 Stage Gate 를 막아야 한다" 고 판단하면 **AC-2-56 은 `PARTIAL`,
Verdict 는 `INCOMPLETE`** 로 되돌아간다 (§1.1 에 판단 근거를 전부 공개했다).

수정이 발생하면 `stage-qa-agent` 재검증에서 항목 번호(`QA-2-001`~`007`)를 유지하고 §14 에 판정 변화를 기록한다.

---

## 14. 재검증 이력

| 회차 | 일시 | Verdict | 변화 |
|---|---|---|---|
| 1 | 2026-09-26 | **FAIL** | 최초 검증. `QA-2-001`(High) · `QA-2-002`(Medium) · `QA-2-003`(Low) 신규. AC-2-19 · AC-2-57 `FAIL`, AC-2-56 `PARTIAL`. `S2-HOME-2`(온보딩 3화면 시각 대조)는 QA 가 수동으로 수행 |
| **2** | **2026-09-27** | **INCOMPLETE** | `QA-2-001` → **RESOLVED** (AC-2-19 `FAIL` → `PASS`) · `QA-2-002` → **RESOLVED** (AC-2-57 `FAIL` → `PASS`) · `QA-2-003` → **RESOLVED**(`AD-S2-15` 등록) · `S2-HOME-2` → **RESOLVED**(자동 baseline 3건). **`QA-2-004`(Medium) 신규** → AC-2-56 `PARTIAL` 유지(사유 축소). 공통 명령 전부 재실행: 유닛 997→**1000**, e2e 113→**121**, 나머지 동일. **QA 자체 정정**: 1회차의 Figma "CTA ≈ y 675" 는 screenshot 추정 오류 — node 실측 `y=750` 이 맞다 (§7.4.1) |
| **3** | **2026-09-27** | **PASS** | `QA-2-004` → **RESOLVED** (AC-2-56 `PARTIAL` → **`PASS`**). QA 직접 실측: 일러스트 박스 **Δ0**, 캐릭터 실체 높이 Δ+3, 캐릭터↔제목 여백 Δ−4.2 (2회차 +223), 에셋 614×830 = 정확히 2.0x·투명·선명도 3.4배(다운샘플 실증). 공통 명령 **9종 전부 재실행** — 유닛 1000 · e2e 121 (감소 0). 신규 **`QA-2-005` · `QA-2-006` · `QA-2-007`**(전부 Low · design-agent 소관 문서 항목 · Verdict 비차단). **QA 자체 정정**: 2회차의 Figma 절대 좌표는 축소 렌더 정규화로 ~13px 어긋나 있었다 — 1:1 렌더 기준이 맞다 (§7.5.1) |

### 14.1 2회차 판정 변화표

| AC / Finding | 1회차 | 2회차 | 사유 |
|---|---|---|---|
| AC-2-19 | `FAIL` | **`PASS`** | 마우스 10문항 완주 + 4경로 probe (§6.4) |
| AC-2-57 | `FAIL` | **`PASS`** | §2.11 구성 실현 확인 (§7.4.2) |
| AC-2-56 | `PARTIAL` | `PARTIAL` | 누락 조건 ②③ 해소, ① 잔여 → `QA-2-004` |
| AC-2-01 ~ 18 · 20 ~ 55 · 58 ~ 68 | `PASS` | **유지** | 공통 명령 전부 재실행 + 회귀 점검 (§3.1 · §12) |
| AC-2-33 · 34 · 37 | Stage 2-B 제외 | **유지** | 선구현 흔적 재확인 (grep 0건) |
| AC-2-32 · 35 · 36 · 51 | Stage 2 분 한정 `PASS` | **유지** | 지시대로 1회차 판단 유지 |
| AC-2-60 | `PASS (accepted: S1-G-2)` | **유지** | 지시대로 유지 |
| 가값 P-01 · P-02 · P-04 · P-05 · P-16 · P-17 | 목록 기록 | **유지** | FAIL 사유 아님 (§11.2) |

### 14.2 3회차 판정 변화표

| AC / Finding | 1회차 | 2회차 | **3회차** | 사유 |
|---|---|---|---|---|
| **AC-2-56** | `PARTIAL` | `PARTIAL` | **`PASS`** | 잔여 조건 ①(`179:1809`) 해소 + 남은 편차 ≤9px 이 전부 등록 허용 차이·승인 Design Spec 으로 설명 (§7.5.5) |
| `QA-2-004` | — | 신규 `FAIL` | **`RESOLVED`** | 해소 경로 ①(에셋) + ②(§2.11) 수행 확인, QA 직접 실측 (§7.5.2·7.5.3) |
| `QA-2-005` · `QA-2-006` · `QA-2-007` | — | — | **신규 (Low)** | design-agent 소관 문서 항목. 어떤 AC 도 `FAIL`/`PARTIAL` 로 만들지 않는다 (§1.1 · 각 Finding) |
| `QA-2-001` · `QA-2-002` · `QA-2-003` | `FAIL` | `RESOLVED` | **유지** | 3회차 변경이 해당 영역을 건드리지 않았고 e2e·유닛 감소 0 (§12.4) |
| AC-2-01 ~ 55 · 57 ~ 68 | — | `PASS` | **유지** | 공통 명령 9종 전부 재실행 + 회귀 점검 (§3.2 · §12.4) |
| AC-2-33 · 34 · 37 | Stage 2-B 제외 | 유지 | **유지** | 지시대로 유지. 선구현 흔적 grep 0건 재확인 |
| AC-2-32 · 35 · 36 · 51 | Stage 2 분 한정 `PASS` | 유지 | **유지** | 지시대로 유지 |
| AC-2-60 | `PASS (accepted: S1-G-2)` | 유지 | **유지** | 지시대로 유지 |
| 가값 P-01 · P-02 · P-04 · P-05 · P-16 · P-17 | 목록 기록 | 유지 | **유지** | FAIL 사유 아님 |
