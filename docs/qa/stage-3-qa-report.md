# Stage 3 QA Report — Home · Activity Card · Library · Book Selection · Recommendation (Frontend)

Status: 작성 2026-10-09 · 재검증 2회차 2026-10-09 · **최종 판정 3회차 2026-10-09 (stage-qa-agent)**
대상 커밋: 1회차 `61fee89` — *feat(library): give the sheet cover its shadow and open a QA entry point* / 2회차·**3회차 `80ee2be` — *fix: keep the toast off the tab bar and honour idempotency keys in the mock*** (3회차는 **코드 변경 0** — 문서 변경만)

> **2회차 결과는 §11 에 있다.** §1 Summary · §4 Requirement Matrix · §6 · §8 · §10 은 2회차 결과로 **갱신**했고, §5 Findings 와 §2·§3·§9 의 1회차 측정 기록은 **이력으로 보존**한다 (판정 변화는 각 Finding 머리에 표시).
판정 기준: `.claude/rules/qa.md` · `docs/plans/stage-3-plan.md` (APPROVED 2026-10-05) · `docs/plans/stage-3-library-plan.md` (APPROVED 2026-10-06) · `docs/design/stage-3-design-spec.md` · `docs/design/stage-3-library-design-spec.md` · **`docs/decisions/stage-3-approvals.md` §12~§25 (단일 기준)**

> **증거 표기 규칙** — 이 리포트는 두 가지를 구분한다.
> - **[QA 실행]** = stage-qa-agent 가 이 세션에서 직접 명령을 돌리거나 브라우저로 측정한 것
> - **[문서 인용]** = Plan / Design Spec / approvals / handoff 에 적힌 것을 근거로 쓴 것
>
> `PASS` 판정에는 **[QA 실행]** 증거가 하나 이상 있다. 구현자 handoff 메모는 증거로 쓰지 않았다.

---

## 1. Summary

### Stage Verdict (3회차 최종, 커밋 `80ee2be`): **`PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`**

1회차 `FAIL` → 2회차 `INCOMPLETE` → **3회차 `PASS (accepted: …)`**.
3회차는 **코드 변경이 없다.** 바뀐 것은 **사용자 결정 문서**(approvals §27, 2026-10-09)와 그 결정이 반영된 **Plan 문구**뿐이다. QA 는 8개 명령을 **전부 다시 돌려 기준선과 동일함을 확인**했고(§12.1), 2회차가 차단 요인으로 남긴 4건을 결정에 따라 재산정했다(§12.2).

| 판정 | 1회차 | 2회차 | **3회차** | 변화 |
|---|---|---|---|---|
| `PASS` | — | — | **109** (Stage 3 Plan 71 + Library 38) | `AC-3-86` **PARTIAL → PASS** (범위 축소 후 잔여 조건 충족, QA 실측) |
| `FAIL` | 5 Finding / 7 AC | 3 Finding / 6 AC | **3 Finding / 6 AC — 전부 수용** | 판정 유지, Verdict 산정 제외 |
| `PARTIAL` | 6 AC (Summary 는 3 으로 **잘못 적었다** — §11.5) | 2 AC | **1 AC** (`AC-3L-24` — **수용**) | `AC-3-86` PASS 로 이동 |
| `NOT VERIFIED` | 2 | 2 | **2 — 전부 수용** (`NV-1` · `NV-2`) | approvals §27.3 |
| `BACKEND_INTEGRATION_PENDING` | 11 신규 + 1 갱신 | 11 신규 + 1 갱신 | **11 신규 + 1 갱신 (12)** | — |
| 판정 대상 아님 | — | 1 | **11** = 폐기 1 (`AC-3-34`) · 부분 폐기 1 (`AC-3-86` 의 보호자 직접 입력 분기) · 무효 2 (`AC-3-11`·`AC-3-17`) · Out of Scope 3 (`AC-3-39`~`41`, `D-18`) · Stage 4 이월 5 (`AC-3-22`~`26`) | approvals §26.5 · §27.2 |

#### 전수 집계 — ID 목록 (QA 가 §4 Matrix 전 행을 다시 세었다, `[QA 실행]`)

**Stage 3 Plan — 88 ID**

| 구분 | 건수 | ID |
|---|---|---|
| `PASS` | **71** | `AC-3-01`~`10` · `AC-3-12`~`16` · `AC-3-18`~`21` · `AC-3-27`~`33` · `AC-3-35`~`38` · `AC-3-45` · `AC-3-47`~`48` · `AC-3-50` · `AC-3-52`~`88` (행별 증거는 §4.1) |
| `FAIL` (전부 수용) | **6** | `AC-3-42` · `AC-3-43` · `AC-3-44` (→`QA-3-001`) · `AC-3-46` · `AC-3-49` (→`QA-3-002`) · `AC-3-51` (→`QA-3-003`) |
| `PARTIAL` | **0** | — |
| `NOT VERIFIED` | **0** (AC 단위) | — (`NV-1`·`NV-2` 는 AC 가 아니라 별도 항목 — §7) |
| 폐기 | **1** | `AC-3-34` (approvals §26.5) |
| 무효 | **2** | `AC-3-11` · `AC-3-17` |
| Out of Scope | **3** | `AC-3-39` · `AC-3-40` · `AC-3-41` (`D-18`, approvals §8.4) |
| Stage 4 이월 | **5** | `AC-3-22` ~ `AC-3-26` |
| 합 | **88** | 71 + 6 + 0 + 1 + 2 + 3 + 5 = 88 ✅ |

**Library Plan — 39 ID**

| 구분 | 건수 | ID |
|---|---|---|
| `PASS` | **38** | `AC-3L-01`~`23` · `25`~`39` |
| `PARTIAL` (수용) | **1** | `AC-3L-24` |
| 합 | **39** | 38 + 1 = 39 ✅ |

**AC 밖 항목**

| 구분 | 건수 | ID |
|---|---|---|
| `NOT VERIFIED` (수용) | **2** | `NV-1` (Safari / iOS 실기기) · `NV-2` (뒤집기 중간 프레임 · 저장 실패 동시 잔여 빈 자리) |
| `BACKEND_INTEGRATION_PENDING` | **12** | 신규 11 = `P3-BIP-16` ~ `P3-BIP-26` / 갱신 1 = `P3-BIP-15` (§8) |
| Finding | **9** | `QA-3-001`~`003` **FAIL(수용)** · `QA-3-004`~`007` **PASS** · `QA-3-008` **해소** · `QA-3-009` **폐기** |

> **1회차 집계 오류를 3회차에도 다시 검증했다.** 2회차에서 1회차 Summary 가 `PARTIAL` 을 3 으로 적은 오류를 찾았으므로(§11.5, approvals §27.1), 3회차는 §4.1·§4.2 **표 전 행을 기계적으로 추출해 재집계**했다 — 추출에서 빠진 22행(표기 접두 `✎`/`✓`, 취소선, 묶음 행 `AC-3-39`·`40`·`41`)을 **한 건씩 직접 확인**해 보강했고, 합이 88 / 39 로 맞는 것을 검산했다. **집계 누락 0건.**

### 산정 근거 (`rules/qa.md` §2)

1. **`FAIL` 6 AC (Finding 3건) — 사용자 수용.** `QA-3-001`(push 권한 기능군) · `QA-3-002`(오프라인 캐시) · `QA-3-003`(에셋 파이프라인)을 사용자가 항목별로 명시 수용했다 (approvals §26.1). 규칙대로 **요구사항 판정은 `FAIL` 로 남기고**(`AC-3-42`·`43`·`44`·`46`·`49`·`51`) Verdict 계산에서만 수용 항목으로 처리한다. **6 AC 전부가 이 세 Finding 에 1:1 로 매핑**되는 것을 확인했다 (§4.1 각 행, `[QA 실행]`) — 수용 범위 밖의 `FAIL` 은 **0건**이다.
2. **`AC-3-86` — 수용이 아니라 요구사항 범위가 줄었다 → `PASS`.** 사용자 결정(approvals §27.2)이 *"보호자 직접 입력 옵션은 `title`(+`author?`)"* **분기만 폐기**하고 *"카탈로그 책 저장 부분은 그대로 판정"* 하도록 정했고, 그 표기가 `docs/plans/stage-3-plan.md:1041` 에 반영됐다(`[QA 실행]` diff 확인). 2회차 PARTIAL 의 **미충족 조건이 그 분기 하나였으므로**, 남은 조건을 QA 가 다시 측정해 충족을 확인했다 → **`PASS`** (§12.2). 그래서 `AC-3-86` 은 `accepted:` 목록에 넣지 않는다.
3. **`AC-3L-24` · `NV-1` · `NV-2` — 사용자 수용** (approvals §27.3). 판정은 각각 `PARTIAL` · `NOT VERIFIED` 로 **남기고** Verdict 계산에서만 수용 항목으로 처리한다. ⚠️ `AC-3L-24` 는 **고칠 수 있는 항목**(`GiftRequestStatus` fixture/시나리오 추가)인데 사용자가 수용을 택했다 — **증정 상태 4종(`approved`·`delivered`·`cancelled`·`rejected`)은 화면 확인 없이 남는다.**
4. **수용으로 덮이지 않는 잔여 항목: 0건.** `FAIL` 6 AC → 수용 / `PARTIAL` 1 → 수용 / `NOT VERIFIED` 2 → 수용 / 그 밖의 판정은 전부 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` 이다. `rules/qa.md` §2 — *"In Scope 항목이 모두 `PASS` 또는 `BACKEND_INTEGRATION_PENDING`"* + 항목별 명시 수용 → **`PASS (accepted: …)`**.
5. **가값(`P-xx`)은 FAIL 사유가 아니다** (`rules/qa.md` §2). 활성 6건을 §6 에 기록했고 3회차에 변화 없음을 확인했다.

> **수용 문자열 전체**: `PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`
> 괄호 안 6건이 **사용자가 항목별로 명시 수용**한 전부다 (approvals §26.1 3건 + §27.3 3건).
> 괄호에 **넣지 않은** 결정 2건은 수용이 아니라 **요구사항 폐기·축소**다 — `AC-3-34` **전부 폐기**(§26.5) · `AC-3-86` **보호자 직접 입력 분기만 폐기**(§27.2, 잔여 범위는 `PASS`). approvals §27.4 는 이 4종(수용 6 + 폐기 2)을 묶어 *"수용 항목 전체"* 로 적었으나, `rules/qa.md` 의 기록 형식상 **`accepted:` 에는 수용만 넣고 폐기는 판정 대상에서 물러난 것으로 적는다.**

### 2회차에서 해소된 것 (`[QA 실행]`)

| ID | 1회차 | 2회차 | QA 가 직접 확인한 것 |
|---|---|---|---|
| `QA-3-004` | FAIL (Medium) | **PASS** | Toast ↔ 탭바 **겹침 −23px**, 탭 3개 `elementFromPoint` 전부 탭바 (393·320) |
| `QA-3-005` | FAIL (Medium) | **PASS** | Mock Adapter 직접 호출 7항목 — 재생·`IDEMPOTENCY_KEY_REUSED`·보관함 분리·`retry` 미보관 |
| `QA-3-006` | FAIL (Low) | **PASS** | `P-23` 등재 + 재발 방지 가드가 **실제로 문다**(변조 시뮬레이션) |
| `QA-3-007` | FAIL (Low) | **PASS** | handoff §3 **10건**, §9 ⑨ 전제 정정 확인 |
| `QA-3-008` | PARTIAL ×2 | **해소** | Plan `AC-3-56`(32종) · `AC-3-59`(29종) 문구 정정 확인 |
| `QA-3-009` | PARTIAL | **폐기** | Plan `AC-3-34` 취소선 + 폐기 사유 확인 |

### 8개 명령 (2회차, `[QA 실행]`)

`typecheck` · `lint` · `lint:boundaries` · `test` **1611 passed / 117 files** · `build` · `format:check` · `assert:no-mocks` · `test:e2e` **273 passed (단독 5.8분)** — **전부 exit 0**, 기준선(1611 / 273)과 일치. 전량 재생성(`--update-snapshots=all`) 후 baseline **74종 바이트 동일**. 상세는 §11.1.

### 무엇이 잘 되어 있는가 (1회차 기록 유지)

- **Scope 위반 0건** — `apps/api/` · `supabase/` 추적 파일 **0건**(2회차 재확인: `apps/` = `web` 하나, `packages/` = `config`·`contracts`·`design-tokens`·`ui`), Stage 4~8 route·scenario key 0건
- **Contract / Mock 경계가 깨끗하다** — `z.object(` 가 `packages/contracts` 밖에 0건, 신규 `any`/`@ts-ignore` 0건, Mock fixture 하드코딩 0건, Adapter 선택 지점 1곳
- **Figma 대조** — Home `26:21` · Library L-1 `30:74` 를 QA 가 직접 받아 구현 baseline 과 대조했고, 차이는 **전부 승인 번호가 있는 것**이었다

### 2회차의 차단 요인 4건이 어떻게 해소됐는가 (3회차)

2회차는 `PARTIAL` 2 + `NOT VERIFIED` 2 를 남겨 `INCOMPLETE` 였다. 3회차에 네 건 전부 처리됐다 — **코드 수정 0건**, 처리 경로는 서로 다르다.

| 차단 요인 (2회차) | 3회차 처리 | 경로 |
|---|---|---|
| **`AC-3-86` PARTIAL** — *"보호자 직접 입력 옵션 = `title`(+`author?`)"* 분기가 화면 경로로 없다 | **`PASS`** | **요구사항 축소** (수용 아님). 사용자 결정 §27.2 가 그 분기만 폐기하고 카탈로그 부분은 판정 유지로 정했다. QA 가 잔여 조건을 **다시 측정**해 충족 확인 (§12.2) |
| **`AC-3L-24` PARTIAL** — `GiftRequestStatus` 6종 재현 Mock 시나리오 없음 | **`PARTIAL` 유지 + 수용** | **사용자 수용** §27.3. 고칠 수 있는 항목이나 사용자가 수용을 택했다 |
| **`NV-1`** Safari / iOS 실기기 미검증 | **`NOT VERIFIED` 유지 + 수용** | **사용자 수용** §27.3 (현 환경 불가). 수동 절차 §7 |
| **`NV-2`** 뒤집기 중간 프레임 잔상 · 저장 실패 동시 잔여 빈 자리 | **`NOT VERIFIED` 유지 + 수용** | **사용자 수용** §27.3 (60fps 녹화 필요). 수동 절차 §7 |

> 2회차 §11.12 가 제시한 두 경로 중 **`AC-3-86` 은 (B) 잔여 항목 처리**(결정 공백 해소 → 범위 축소 → 잔여 조건 재측정)로, **나머지 3건은 (A) 사용자 추가 수용**으로 끝났다. 그래서 `accepted:` 목록은 2회차가 예상한 7건이 아니라 **6건**이다.

### 수용으로 덮이지 않은 항목

**없다 (0건).** §4.1·§4.2 전수 재집계에서 `PASS`·`BACKEND_INTEGRATION_PENDING`·수용 6건·판정 대상 아님 11건 밖에 남는 항목이 **0** 임을 확인했다. 합 검산: Stage 3 Plan 88 = 71 + 6 + 1 + 2 + 3 + 5, Library 39 = 38 + 1.

### 1회차에 `FAIL` 로 보지 않은 것 (유지)

| 분류 | 처리 | 근거 |
|---|---|---|
| Figma 에 없는데 구현한 것 **10건** | 전부 승인분 — Finding 아님 | handoff §3 (2회차에 **10건으로 정정 확인**) |
| Figma 에 있는데 뺀 것 **8건** | 전부 사용자 결정 — Finding 아님 | `L-OPEN-14` · `L-D1` · `L-OPEN-02` · `L-OPEN-21` · `L-R2D-02` 등 |
| 무효가 된 허용 차이 **5건** | 판정 근거로 쓰지 않았다 | `AD-S3-4`·`6`·`7`·`8`·`19` |
| 응답 필드에 `.max()` 없음 | **의도된 설계** — Finding 아님 | approvals §13.3. 길이 요구는 `P3-BIP-26` |
| `favorites-empty` | **정상 화면** — 예외 아님 | `L-OPEN-13` · `AC-3L-08` |
| `P-24` 연한 회색 1.56:1 | **승인된 가값** — §6 목록에 기록 | approvals §20.4 |
| Library 의 Offline = Error 같은 경로 | 승인된 Design Spec §7.4 | approvals §20.1 |
| `Start Session` 전면 비활성 | `D-3` (approvals §13.10) | — |
| **2회차 범위 초과 2건** | **Orchestrator 승인분 — Finding 아님.** 부작용 검증 결과는 §11.6 | `ToastProvider` 공개 API 변경 · `A11yPage` `C-5` + 재발 방지 테스트 |

---

## 2. Environment

| 항목 | 값 |
|---|---|
| OS | macOS 26.5 (darwin 25.5.0, arm64) |
| Node | v24.21.0 |
| pnpm | 12.4.2 |
| Playwright | 1.63.0 (번들 Chromium, `deviceScaleFactor: 1`) |
| 기본 viewport | 393×852 (`playwright.config.ts`) |
| Mock 모드 | `VITE_API_MODE=mock`, 기본 scenario `success` |
| dev 서버 | `http://127.0.0.1:4319` (`pnpm --filter @haru/web run dev`) |
| 실기기 | **없음** — iOS / Android / Safari 미검증 (§7) |
| 작업 트리 | 검증 전후 모두 `git status --porcelain` **빈 출력** — QA 가 Product Code 를 수정하지 않았음 |

시나리오 전환 경로 (`[QA 실행]` 확인): `/auth/log-in?scenario=<group>:<key>` → 로그인(`sam@example.com` / `sunny-evening-8`) → 탭 이동. 그룹 6종(`health` · `home` · `activity-cards` · `library` · `books` · `__states`)이 `DEV_SCENARIO_GROUPS` 에 전부 등록되어 있다.

---

## 3. Commands Executed  `[QA 실행]`

8개 명령 전부 QA 가 직접 실행했다. `test:e2e` 는 **단독 실행**했다 (다른 Playwright 실행과 겹치지 않음).

| # | 명령 | 결과 | 소요 | 숫자 |
|---|---|---|---|---|
| 1 | `pnpm typecheck` | ✅ exit 0 | 10.7s | `tsc --noEmit` × 3 (root · e2e · workspace) |
| 2 | `pnpm lint` | ✅ exit 0 | 6.5s | 0 problems |
| 3 | `pnpm lint:boundaries` | ✅ exit 0 | 0.9s | **no dependency violations** (586 modules · 2067 dependencies) |
| 4 | `pnpm test` | ✅ exit 0 | 39.9s | **1596 passed** / 1596 · **116 files** |
| 5 | `pnpm build` | ✅ exit 0 | 1.7s | `index.js` 577.29 kB (gzip 172.41) · `index.css` 122.63 kB (gzip 18.52). chunk>500kB 경고 1건(기존) |
| 6 | `pnpm format:check` | ✅ exit 0 | 4.1s | — |
| 7 | `pnpm assert:no-mocks` | ✅ exit 0 | 0.2s | `__HARU_MOCK_SENTINEL__` 0 · `__HARU_DEV_SENTINEL__` 0 · `haru-dev-` 0 (4파일 검사) |
| 8 | `pnpm test:e2e` | ✅ exit 0 | **6.1m (369s)** | **271 passed** / 271 · 0 failed |

- 기준선(`test` 1596 / `test:e2e` 271)과 **일치**한다.
- `test:e2e` 소요 **6.1분**은 정상 대역(4~6분)이다. 20분대 지연·허위 실패는 재현되지 않았다.

### 추가 실행 ① — 시각 baseline 스테일 검사  `[QA 실행]`

```
pnpm test:e2e --update-snapshots=all     → 271 passed (6.1m, exit 0)
git status --porcelain e2e/__screenshots__ → (빈 출력)
git diff --stat e2e/__screenshots__        → (빈 출력)
```

**baseline 74종 전량 재생성 후 변경 0바이트.** `--update-snapshots`(기본 `changed` 모드)로는 드러나지 않는 스테일(approvals §23.2 의 `frame-1024` dev 패널 오염 유형)이 **현재 0건**임을 확인했다. 파일 수도 74 (`responsive.spec.ts` 1 + `visual.spec.ts` 73)로 handoff 기록과 일치한다.

### 추가 실행 ② — Toast 런타임 측정  `[QA 실행]`

테스트가 없는 지점이라 QA 가 직접 쟀다 → **`QA-3-004`** (§5).

### 추가 실행 ③ — 200% 텍스트 확대 reflow  `[QA 실행]`

`responsive.spec.ts` 는 dev frame, `auth.spec.ts` 는 로그인 화면만 본다. **Home·Library 실화면은 테스트가 없어** QA 가 직접 쟀다 (320×568 + `html { font-size: 200% }`):

| 화면 | `document` 가로 넘침 | 잘림 |
|---|---|---|
| Home `/` | **0px** | 없음 — 책 제목·캡션만 `text-overflow: ellipsis`(승인된 말줄임, §20.2·§21.3) |
| Library `/library` | **0px** | 〃 |

`overflow: clip` 으로 잡힌 2건(`2 storytimes this week` · `Option 1 of 3: …`)은 **`haru-visually-hidden`**(`clip-path: inset(50%)`, `width: 1px`) 스크린리더 전용 라벨이었다 — 시각 잘림이 아니다. → `AC-3-71` PASS.

---

## 4. Requirement Matrix

### 4.1 Stage 3 Plan — `AC-3-01` ~ `AC-3-88`

판정 대상 **81건** (총 88 − 무효 2(`AC-3-11`·`AC-3-17`) − 이월 5(`AC-3-22`~`26`)).

#### Scope (§11.1)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-01` | **PASS** | `[QA 실행]` `git ls-files \| grep -E '^(apps/api\|supabase\|apps/mobile)/'` → **0건**. 추적 top-level = `apps/web` · `packages/{config,contracts,design-tokens,ui}` · `docs` · `e2e` |
| `AC-3-02` | **PASS** | `[QA 실행]` `routes.ts` 실측 — `/`·`/auth/*`·`/onboarding/*`·`/library`·`/library/add`·`/library/gift-requests`·`/progress`·`/settings`·`*`. `/session`·`/reflection`·`/report`·`/settings/notifications`·데이터 관리 route **0건**. `mocks/` 하위 = `auth consent onboarding me home activities books library health` — `sessions`·`recordings`·`analysis`·`reports`·`data-management` **디렉토리 0건**. Stage 4~8 scenario key 0건 |
| `AC-3-03` | **PASS** | `[QA 실행]` `pnpm lint:boundaries` → no dependency violations (586 modules · 2067 deps) |

#### 내비게이션 (§11.2)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-04` | **PASS** | `[QA 실행]` `test:e2e` — `tabs.spec.ts` 3건(Home→Library · Library→Home · Home→Progress, 전부 SPA·`document` 요청 0건) + `home.spec.ts:42`. 탭 3개, `/session` 탭 없음 |
| `AC-3-05` | **PASS** | `[QA 실행]` `shared/config/tabs.ts` 실측 — `book` · `haru:tab-center-home` · `chart-no-axes-column-increasing` = `S1-D2-5` 확정값. 활성 구분은 `v3-tab-bar` baseline + `a11y.spec` 통과 |
| ✎ `AC-3-06` | **PASS** | `[QA 실행]` `test:e2e` — `home.spec.ts:146` *"카드 하단이 탭바를 덮지 않고 탭바 아래 16px 이 남는다"*, `:169` *"ActionBar 가 1행이고 `Save` 가 최소 87px 이다 (320px 포함)"*, `responsive.spec` 4폭 전부 통과. Rev 4 의 **320px FAIL(M-01) 해소 확인** |
| `AC-3-07` | ~~FAIL~~ → **PASS** (2회차) | `[QA 실행 2회차]` QA 독립 측정(393·320) — Toast 하단 `743` ↔ 탭바 상단 `766` = **겹침 −23px**, 탭 3개 중심 `elementFromPoint` 가 **전부 탭바**. 스택 화면(`/auth/reset-password`)은 보정 **미적용**·하단 16px. `inset-block-end` 16 → **121px**. Sheet 부분은 1회차 PASS 유지. → §11.2 `QA-3-004` |
| `AC-3-08` | **PASS** | `[QA 실행]` `tabs.spec.ts:161`(수식 키 클릭 분기) · `a11y.spec.ts` 터치 타깃 표 + `home.spec.ts:505` 키보드 경로. `aria-current` 는 `v3-tab-bar` + 단위 테스트 |

#### Home · Activity Card (§11.3)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-09` | **PASS** | `[QA 실행]` `PlaceholderPage` grep **0건**. `home.spec.ts:42` 착지 확인. `useHomeSummary`·`useTodayActivityCard` 2개 조회 |
| ✎ `AC-3-10` | **PASS** | `[QA 실행]` `s3-home.png` baseline 육안 확인 — 역량 배지(`Emotion Regulation`) · 표지 · 제목 · 저자 · 추천 이유 1문장 · pill 4개. 코칭 문장은 뒷면(`home.spec.ts:235` *"뒷면이 Prompt 와 코칭 노트를 1:1 로 보여 주고 본문만 스크롤한다"*) |
| ⛔ `AC-3-11` | — | **폐기** (approvals §12.8). 살아남는 부분은 `AC-3-82`. `home.spec.ts:443` 이 지난 날짜 배너 부재를 고정 |
| `AC-3-12` | **PASS** | `[QA 실행]` `shared/copy/capability-copy.ts` 실측 — `Emotion Regulation` · `Self-Direction` · `Cognitive Flexibility` · `Intrinsic Motivation` (Stage 0 #14 그대로). `--color-capability-*` 4종 semantic 토큰 존재. Figma 오타 `Emotion Day Day` 복제 0건 |
| `AC-3-13` | **PASS** | `[QA 실행]` 책 제목·저자·이유 문구 grep → `features/`·`pages/`·`entities/` 에 **주석 2건뿐**(`bookDisplay.ts:36` · `ReadingNowCard.tsx:42`), 실제 값 0건. 생성 문구는 전부 Mock 응답 |
| ✎ `AC-3-14` | **PASS** | `[QA 실행]` `test:e2e` + `activity-cards:loading` 시나리오. `s3-home-deck` baseline 과 트랙 공식 테스트(`home.spec.ts:104`)가 높이 점유를 고정 |
| `AC-3-15` | **PASS** | `[QA 실행]` `home.spec.ts:278` *"진행 중 세션을 버블이 알리고 캐릭터를 가리지 않는다 (V-15)"* + `:424` *"닫기는 그 문구에만 적용된다 — 상태 알림이 영구히 묻히지 않는다"* |
| ✎ `AC-3-16` | **PASS** | `[QA 실행]` `home.spec.ts:206`·`:235`. 별도 Sheet 가 아니라 뒷면 flip |
| ⛔ `AC-3-17` | — | **무효** (approvals §12.4). 살아남는 부분은 `AC-3-83` |
| ✎ `AC-3-18` | **PASS** | `[QA 실행]` `home.spec.ts:70` *"키보드(←/→/Home/End)만으로 3장 전부에 도달한다"* + `:59` 좌우 버튼 부재 |
| ✓ `AC-3-19` | **PASS** | `[QA 실행]` `home.spec.ts:206`(카드 하단 모서리 불변) + Playwright `reducedMotion: 'reduce'` 전역 + `responsive.spec.ts:86` |
| `AC-3-20` | **PASS** | `[QA 실행]` `ACTIVITY_SCENARIO_KEYS` 실측 — `reread-option` · `books-exhausted` 존재. `conversation-only-option` 은 **approvals §12.12 로 폐기**(enum 값까지 삭제) — AC 의 해당 항목은 승인으로 제거된 것이지 미구현이 아니다 |
| `AC-3-21` | **PASS** | `[QA 실행]` `BookCover.tsx` 실측 — `coverUrl` 없음·빈값·`onError` 3경로 전부 placeholder 로 전환. `e2e/book-cover.spec.ts` 통과 |

#### Reading Context (§11.4)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-22` ~ `AC-3-26` | — | **이월** (approvals §12.3 ⑧). contract(`readingContext`·`customTime`·`createCustomTimeRefine`)는 **유지 확인** — 진입점만 없다. Out of Scope 이므로 FAIL 아님 |

#### 서재 (§11.5)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-27` | **PASS** | `[QA 실행]` `s3-library.png` baseline 육안 확인 + Figma L-1 `30:74` 대조 — 4섹션(`Reading now` · `Our curated shelf` · `Favorites` · `Finished together`). 조회는 **`GET …/library/overview` 1회**(승인 `P3-BIP-18`)로 바뀌었다 — AC 문구의 `GET …/library` 는 "See all" 시트가 쓴다 |
| `AC-3-28` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:205` *"요청 query 가 contracts schema 를 통과하고 limit 기본값이 채워진다"* · `:213` *"잘못된 filter 는 요청 단계에서 거부된다"* · `:237` *"쿼리 축과 표시 축이 1:1 이 아니다 — `saved` 는 Favorites 를 돌려준다"*. 클라이언트 재필터링 없음. `owned`/`gifted` 는 `L-OPEN-14` 로 **표시 축에서 제거**된 결과 UI 진입점이 없다(승인분) |
| `AC-3-29` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:172` *"진행률은 서버 값이다 — fixture 가 `progressRatio` 를 직접 담는다"*. `features/library` 에 세션 재계산 로직 0건 |
| `AC-3-30` | **PASS** | `[QA 실행]` `library-entry-screens.test.tsx:184` *"직접 입력 등록은 `POST …/library/books` + **`Idempotency-Key`** 로 나가고 `/library` 로 돌아간다"*. 검색 → 선택 등록 / 결과 없음 → 직접 입력 양 경로 통과 |
| `AC-3-31` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:155` + `s3-library-list.png` 4행째 `Goodnight Moon` **`GM` placeholder** 육안 확인 |
| `AC-3-32` | **PASS** | `[QA 실행]` `TextLink.tsx:91` — `external` 이면 `target="_blank" rel="noopener noreferrer"`. `BookDetailSheet.tsx:441` 이 `purchaseUrl` 에 사용. Prompt 표시는 `library.spec`·`library-sheets.test.tsx` |
| `AC-3-33` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:278` *"증정 신청은 `requested` 로 시작한다"* + `library-entry-screens.test.tsx`. 배송지 입력 필드 grep **0건** |
| ~~`AC-3-34`~~ | **폐기 — 판정 대상 아님** (2회차) | 사용자 결정 2026-10-09 (approvals §26.5 `QA-3-009`) 로 **AC 자체가 폐기**됐다. `docs/plans/stage-3-plan.md:584` 가 취소선 + 폐기 사유로 갱신된 것을 `[QA 실행]` 확인했다. 근거: 대화 전용 세션이 approvals §12.12 로 폐기됐다. 배송 상태 표시는 `AC-3-33`·`AC-3-35` 가 덮는다. ⟨1회차 기록⟩ `[QA 실행]` `library:gift-pending` 시나리오로 **배송 상태 `Tag` 는 표시**된다(`MockLibraryApi.test.ts:164`). 그러나 `§13` 이 요구하는 *"보유 책 직접 입력 또는 **대화 전용 세션** 안내"* 중 **대화 전용 세션 안내는 없다** — `ActivityOptionKind.conversation_only` 가 approvals §12.12 로 폐기되었기 때문이다. **미충족 조건**: 증정 대기 중 대체 행동 안내가 "직접 등록" 1개뿐. 폐기 결정이 이 AC 를 어떻게 바꾸는지는 **결정 기록에 없다** → §5 `QA-3-009` |
| `AC-3-35` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:300` *"`gift-duplicate` 는 `GIFT_REQUEST_DUPLICATE` 다"* + `BookDetailSheet` 가 `InlineAlert tone="info"` 로 처리(오류 화면 아님) |
| `AC-3-36` | ~~FAIL~~ → **PASS** (2회차) | `[QA 실행 2회차]` QA 가 **Mock Adapter 를 직접 호출**해 7항목 측정 — 같은 key+같은 body = 응답 **바이트 동일 + `id` 동일**(요청 로그 2건, 생성 1건) / 같은 key+다른 body = **`IDEMPOTENCY_KEY_REUSED`**(`addOwnBook`·`createGiftRequest` 양쪽) / 다른 key = 별도 리소스 / 두 호출 보관함 **분리** / `retry` 1회차 실패 **미보관**. → §11.3 `QA-3-005` |
| `AC-3-37` | **PASS** | `[QA 실행]` `library:empty` + `s3-library-empty.png` baseline. 진입점 2행(`/library/add` · `/library/gift-requests`)이 `LibraryShelves` **밖**에 있어 Empty 상태에서도 다음 행동으로 연결된다(`library.spec.ts:502`) |
| `AC-3-38` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:222` *"`paged` 는 `nextCursor` 를 주고 2페이지에서 끝난다"* + `library.spec` 시트 sentinel. 중복·유실 없음은 Mock 결정성 테스트가 고정 |

#### 알림 설정 · push (§11.6)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-39`·`40`·`41` | — | **Out of Scope** (`D-18`, approvals §8.4). FAIL 아님. `TimeOfDay` contracts 는 `common/time-of-day.ts` 로 **존재 확인** |
| `AC-3-42` | **FAIL** (수용 — Stage 4 이월) | → **`QA-3-001`**. 판정은 `FAIL` 로 남긴다. Stage Verdict 산정에서는 사용자 수용 항목으로 처리한다 (approvals §26.1) |
| `AC-3-43` | **FAIL** (수용 — Stage 4 이월) | → **`QA-3-001`** |
| `AC-3-44` | **FAIL** (수용 — Stage 4 이월) | → **`QA-3-001`** |
| `AC-3-45` | **PASS** | `[QA 실행]` `apps/web/package.json` dependencies = `@haru/{contracts,design-tokens,ui}` · `@tanstack/react-query` · `react` · `react-dom` · `react-router` · `zod` **7종뿐**. push provider SDK · 광고 · 제3자 분석 SDK **0건**. root devDeps 에도 없음 |

#### 오프라인 · 캐시 (§11.7)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-46` | **FAIL** (수용 — Stage 4 이월) | → **`QA-3-002`** |
| `AC-3-47` | **PASS** | `[QA 실행]` `library:offline`·`activity-cards:offline` 시나리오가 `NetworkError` 로 차단하고 안내한다(`MockLibraryApi.test.ts:407` · `ActivityCardDeck.tsx:52` `isOffline` 분기). 로컬 outbox grep **0건** |
| `AC-3-48` | **PASS** | `[QA 실행]` 로컬 저장소 전수 검사 — `localStorage` 사용처는 **온보딩 draft 1종**(`shared/lib/onboarding-draft.ts`, 키 `haru.onboarding.draft.v1`)뿐. `lastHighlightLine`·아이 이름·서재 목록·증정 배송 정보 저장 **0건**. (단 Activity Card 캐시 자체가 없어 공허하게 충족된다 — `QA-3-002` 와 묶인다) |
| `AC-3-49` | **FAIL** (수용 — Stage 4 이월) | → **`QA-3-002`**. 검사 대상 캐시가 존재하지 않는다 |
| `AC-3-50` | **PASS** | `[QA 실행]` 서재 — `library:offline` 에서 `ErrorState` + Retry 1개 렌더(빈 화면·무한 로딩 아님), `LibraryShelves.tsx:143` 이 `isError` 를 Empty 보다 **앞에** 둔다. 알림 설정 부분은 Out of Scope(`D-18`). ⚠ 관찰: Library 는 승인된 Design Spec §7.4(`:595` *"Offline 은 Error 와 같은 경로"*)대로 **오프라인 전용 문구를 쓰지 않는다** — 사용자는 "We could not load your library" 를 본다. 승인 범위 안이라 Finding 아님 |

#### 에셋 (§11.8)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-51` | **FAIL** (수용 — Stage 4 이월) | → **`QA-3-003`** |
| `AC-3-52` | **PASS** | `[QA 실행]` `BookCover.tsx` 는 `coverUrl: string` 만 받고 경로 규칙을 모른다. 번들 에셋 매핑은 `shared/assets/book-covers/index.ts` + `mocks/fixtures/` 에만 있다 |
| `AC-3-53` | **PASS** | `[QA 실행]` `s3-library.png` · `s3-library-list.png` · `s3-home.png` 육안 대조 — 표지 ↔ 제목이 **전부 일치**한다(Figma L-1 의 placeholder 불일치를 복사하지 않았다). 카탈로그 외 책만 이니셜 placeholder |

#### contracts (§11.9)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-54` | **PASS** | `[QA 실행]` `z.object(` grep — `apps/web/src` · `packages/ui/src` **0건**(테스트 제외). `pnpm typecheck` exit 0 |
| `AC-3-55` | **PASS** | `[QA 실행]` `contracts/src/__tests__/library.test.ts` 통과 + `LibraryBookSchema` 가 `BookSummarySchema` 를 포함. `BookSummary` 변경 없음 |
| `AC-3-56` | ~~PARTIAL~~ → **PASS** (2회차) | `[QA 실행 2회차]` AC 문구가 정정됐다 (`stage-3-plan.md:628`, approvals §26.5 `QA-3-008`) — 실제 신규는 `LibrarySectionKey`·`LibraryFilter`·`BookSource` 이며 **29 → 32종**, `PushPlatform` 은 **Stage 4 이월**(`QA-3-001`). QA 확인: `enums.test.ts:252` `toHaveLength(32)` 통과 + `enums.test.ts:21~22` 에 `LibraryFilterSchema`·`LibrarySectionKeySchema` import, `:43~46` 주석이 29→32 경위를 고정. ⟨1회차 기록⟩ `[QA 실행]` `enums.test.ts:253` `expect(ENUM_SNAPSHOTS).toHaveLength(32)` 통과. 신규 enum 중 `PromptKind`·`AgeBand`·`LibraryFilter`·`BookSource` **4종 존재**, **`PushPlatform` 없음**. 총수 31 → 32 는 Library Plan §7.3 승인분이라 문제 아님. **미충족 조건**: `PushPlatform` — `QA-3-001` 에 종속 |
| `AC-3-57` | **PASS** | `[QA 실행]` `activity-card.test.ts` 통과 (`options` 길이 3 강제) |
| `AC-3-58` | **PASS** | `[QA 실행]` `packages/contracts/package.json` 런타임 의존 = `zod` 1건. clock 주입 팩토리는 `rules/` 테스트가 고정 |
| `AC-3-59` | ~~PARTIAL~~ → **PASS** (2회차) | `[QA 실행 2회차]` AC 문구가 정정됐다 (`stage-3-plan.md:631`) — `BOOK_ALREADY_OWNED` 1건 추가로 **29종**. QA 확인: `error-envelope.test.ts:14~17` `expect(ERROR_CODES).toHaveLength(29)` + 중복 0 통과. (1회차의 `QA-3-010` 참조는 **오타**다 — 이 항목은 `QA-3-008` 이다.) ⟨1회차 기록⟩ `[QA 실행]` `error-envelope.test.ts:15` `expect(ERROR_CODES).toHaveLength(29)`. AC 원문은 "신규 0건(28종 유지)" 인데 **`BOOK_ALREADY_OWNED`(409) 1건이 추가**되어 29 다. 이것은 Library Plan §7.4 의 승인된 신규이므로 **결함이 아니라 AC 문구가 낡은 것**이다. 미충족 조건: AC 문구 갱신 필요 (`QA-3-010`) |

#### Mock Infrastructure (§11.10)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-60` | **PASS** | `[QA 실행]` `mocks/__tests__/Mock*.test.ts` 8종 통과. `MockLibraryApi.test.ts` 만 해도 `LibraryOverviewSchema`·`LibraryListResponseSchema`·`LibraryBookSchema`·`GiftRequestSchema`·`GiftRequestListResponseSchema`·`SavedBookSchema` **6개 schema 를 `safeParse` 로 검증**한다 |
| `AC-3-61` | **PASS** | `[QA 실행]` 실측 key 수 — `home` 8 · `activity-cards` 10 · `library` 19 · `books` 7 · `health` 5 · `__states` 6. 전부 `API_CONTRACTS.md` §5.4 catalogue 값이고 신규·alias **0건**(`scenario-selection.test.ts` 가 고정) |
| `AC-3-62` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:180` *"두 번 불러도 응답 바이트가 같다"* · `:422` · `MockActivityApi.test.ts` 동등 테스트 · `scenarios.spec.ts:55` |
| `AC-3-63` | **PASS** | `[QA 실행]` grep — `mocks/` 밖에서 fixture import **0건**(걸린 3건은 전부 주석·test harness). 책 제목·저자·이메일 문자열도 주석 2건뿐 |
| `AC-3-64` | **PASS** | `[QA 실행]` Adapter 선택 지점 = **`app/providers/apiClients.ts` 한 곳**(`await import('../../mocks')`). Component·Feature 의 Mock import **0건** |
| `AC-3-65` | **PASS** | `[QA 실행]` `shared/api/http/httpClient.ts` 존재 + `https:` 전용 규칙 테스트 통과 |

#### Design · Accessibility · Responsive (§11.11)

| AC | 판정 | 증거 |
|---|---|---|
| ✎ `AC-3-66` | **PASS** | `[QA 실행]` ① `visual.spec.ts` 영역·프레임 baseline **73종 통과**(임계값 `0.02`/`0.02`, `maxDiffPixels` 50/20) ② `--update-snapshots=all` 후 **74종 바이트 동일 — 스테일 0건** ③ QA 가 Figma `26:21`·`30:74` 를 직접 받아 `s3-home.png`·`s3-library.png` 와 대조 — 차이는 전부 승인분(헤더 칩 문구·아이콘, `Reading now` 합성, 역량 캡션 라벨, 버블 문구·닫기 버튼). Home baseline 5장 재생성·`s3-home-deck-back`·`s3-home-deck-scrolled` 신규·`s3-home-deck-prompts-expanded` 폐기 전부 확인 |
| `AC-3-67` | **PASS** | `[QA 실행]` ① HEX grep 15건 → **전부 주석 11건 + 공식 브랜드 에셋 4건**(`GoogleMark`·`AppleMark`, `rules/frontend.md` §6 예외) ② arbitrary Tailwind value grep 2건 → **둘 다 주석**(`List.css:13`·`ListRow.tsx:40` 의 Figma 원문 인용 `text-[14px]`) ③ inline style 수치 → dev gallery 토큰 데모 5건 + `ProgressBar` 의 데이터 파생값 1건뿐. **신규 임의값 0건** |
| `AC-3-68` | **PASS** | `[QA 실행]` `responsive.spec.ts` 320/393/600/1024 — column 320/393/**480/480**, content 272/345/432/432, 좌우 여백 ≤1px 차 가운데 정렬, 가로 넘침 ≤0. 실화면은 `home.spec.ts:527`·`library.spec.ts:152`·`:528` 4폭 전부 |
| `AC-3-69` | **PASS** | `[QA 실행]` `home.spec.ts:70`(덱) · `library.spec.ts:119`(캐러셀 ←/→ 페이지 단위) · `library.spec.ts:483`(시트) |
| `AC-3-70` | **PASS (가값 기록)** | `[QA 실행]` `a11y.spec.ts:80` 터치 타깃 표(알려진 예외 `div · Password` 외 전부 44 도달) · `:100` IconButton hit 44 · `library.spec.ts:188` *"See all 은 시각 크기를 유지한 채 hit area 가 44 다"* · `:502` 진입점 행 56/44 · `home.spec.ts:372` 버블 닫기 44×44. 대비는 `a11y.spec.ts:112`. **수용 예외 `D-01`**, **가값 `P-01`·`P-02`·`P-04`·`P-16`·`P-23`·`P-24`** → §6 |
| `AC-3-71` | **PASS** | `[QA 실행]` **추가 실행 ③** — 320×568 + 200% 에서 Home·Library 모두 `document` 가로 넘침 **0px**, 잘림 없음(승인된 ellipsis 만). 알림 설정은 Out of Scope |
| `AC-3-72` | **PASS** | `[QA 실행]` `stage3-copy-language.test.tsx` — `activityDeckCopy`·`homeOverviewCopy`·`progressCopy`·`libraryCopy` 전수를 **금지 패턴 11종**(streak·goal·on track·behind·missed·`n/7`·`%`·rejected·diagnos/assessment/evaluate/percentile·compared to·stage N/coming soon)으로 검사하고 통과. `/progress` 수치 0건도 고정 |

#### Privacy · Security (§11.12)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-73` | **PASS** | `[QA 실행]` `console.*` 직접 호출은 **`shared/lib/logger.ts` 1곳 + `packages/ui/src/lib/devWarn.ts` 1곳**뿐. logger 는 `ALLOWED_CONTEXT_KEYS` 12종 **화이트리스트 밖 키를 런타임에서 버리고**, event 이름도 `^[a-z][a-z0-9_]*$` 만 허용한다. Production 은 no-op, 원격 transport 없음 |
| `AC-3-74` | **PASS** | `[QA 실행]` `.env.example` = `VITE_API_BASE_URL` · `VITE_API_MODE` · `VITE_MOCK_SCENARIO` **3개뿐, 신규 0건**. secret 패턴 grep → `redactSecrets` 유틸과 테스트 fixture(`value="secret"`)만. Service Role Key / AI Key / STT Secret **0건** |
| `AC-3-75` | **PASS** | `[QA 실행]` `scenarios.spec.ts:127` *"gallery 전 화면에서 외부 도메인 요청이 없다"* 통과. 표지·캐릭터는 번들 에셋. 구매 링크는 `target="_blank"` 사용자 클릭 |
| `AC-3-76` | **PASS** | `[QA 실행]` `useSignOut.ts` — `draftStore.clear()` + `queryClient.clear()`. `home.spec.ts:454` *"→ Welcome + 로컬 draft 삭제"* 통과. push device 상태는 존재하지 않음(`QA-3-001`) |

#### 회귀 · 실행 (§11.13)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-77` | **PASS** | §8 참조 |
| `AC-3-78` | ~~PARTIAL~~ → **PASS** (2회차) | `[QA 실행 2회차]` 8개 명령 **전부 통과** (`test` **1611**/117 files · `test:e2e` **273** 단독 5.8분 · 전량 재생성 5.9분, §11.1), 신규 `any`/`@ts-ignore` 0건(`git show 80ee2be` 전수 — 코드 추가분 0, 문서 언급만). PARTIAL 사유였던 "§5 의 실동작 결함 5건" 은 **2건 수정 확인 + 3건 사용자 수용(이월)** 으로 해소됐다. 남은 PARTIAL(`AC-3-86`·`AC-3L-24`)·`NOT VERIFIED` 2건은 명령 통과와 무관한 별개 항목이며 Stage Verdict 가 반영한다 |
| `AC-3-79` | **PASS** | `[QA 실행]` `pnpm assert:no-mocks` exit 0 — 3개 sentinel 전부 0건(4파일 검사). dev gallery·Scenario Panel·request-log 가 Production 산출물에 없음 |

#### Prompt 단계·페이지 태그 (§11.14)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-80` | **PASS** | `[QA 실행]` `s3-home.png` baseline 육안 — pill 4개가 `PRE` / `POST` / `P.6` / `POST`+`P.12` 로 **값 있을 때만** 배지·페이지 참조를 렌더. 라벨은 `shared/copy/prompt-copy.ts` |
| `AC-3-81` | **PASS** | `[QA 실행]` `MockActivityApi.test.ts` 결정성 테스트 + fixture 가 `phase`·`pageRef` 를 담는다. 화면·feature 하드코딩 grep 0건 |

#### Rev 4 신규 (§20.2)

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3-82` | **PASS** | `[QA 실행]` `activity-cards:empty` + `home.spec.ts:443` *"Figma 에 없는 UI 가 화면에 없다"*(지난 날짜 배너 DOM 부재 포함) |
| `AC-3-83` | **PASS** | `[QA 실행]` `contracts/src/__tests__/activity-card.test.ts` 통과(상한 없음·`.min(1)`). `slice(` grep → Prompt 목록에 쓰인 곳 0건. `s3-home.png` 가 pill **4개 전부 노출**을 보인다. `books` fixture 는 5개 |
| `AC-3-84` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:332` *"같은 책을 두 번 저장해도 **같은 응답**이다"* · `:340` 상한 없음 · `:352` `RESOURCE_NOT_FOUND`. `library-api.ts` 표가 `saveBook` = IK **보내지 않는다** 로 고정 |
| `AC-3-85` | **PASS** | `[QA 실행]` **QA 직접 측정** — `library:error` 로 Home 에서 `★ Save` 클릭 후 라벨이 `Save` → `Save` 로 **낙관 갱신이 롤백**되고 `We couldn't save that book. Try again.` Toast 가 떴다. `library:retry` 시나리오가 재시도 경로를 재현 |
| `AC-3-86` | ~~PARTIAL~~ → **PASS** (3회차) | `[QA 실행 3회차]` **요구사항 범위가 줄었다** — 사용자 결정(approvals §27.2)으로 *"보호자 직접 입력 옵션 = `title`(+`author?`)"* 분기가 **폐기**되고(`stage-3-plan.md:1041` 반영 확인) 카탈로그 부분만 판정 대상이다. 잔여 조건을 QA 가 **다시 측정**했다: ① `home-stage3.test.tsx:644` — 저장 요청 payload 가 `{ target: { bookId: DECK_BOOKS[0].id } }` 로 **보이는 카드의 책과 일치**(verbose 재실행 8 passed) ② **QA 자작 Playwright 측정** — 카드 3장이 각자 Save 를 갖고, `End` 로 **3번째 카드 스냅**(live region `Option 3 of 3: Grumpy Monkey: Play All Day`) 후 그 카드의 Save 를 누르면 **그 카드만** `Saved`/`aria-pressed=true`, 1·2번째는 `Save`/`false` 유지 → **스냅 위치가 바뀌면 대상도 바뀐다** ③ `ActivityCardDeck.tsx:126` 이 `option.book.id` 를 옵션 단위로 닫는다. ⚠️ 1회차가 적은 증거 위치(`MockLibraryApi.test.ts:312`·`home.spec.ts:187`)는 **다른 단정을 가리키는 오기**였다 — 3회차에 바로잡았다. ⚠️ Library 의 `userEnteredTitle`(`/library/add`, `FR-23`)은 **남는다** |
| `AC-3-87` | **PASS** | `[QA 실행]` `home.spec.ts:104` *"트랙 공식이 성립한다 — 카드 = W − 28, peek = 8"* + `:59` 좌우 버튼 DOM 부재. 4폭 통과 |
| `AC-3-88` | **PASS** | `[QA 실행]` `ActivityCard.date` 를 기기 날짜와 비교하는 분기 grep **0건**, 날짜 문자열 렌더 0건. `home.spec.ts:443` 이 배너 부재를 고정 |

### 4.2 Library Plan — `AC-3L-01` ~ `AC-3L-39`

| AC | 판정 | 증거 |
|---|---|---|
| `AC-3L-01` | **PASS** | `[QA 실행]` `library.spec.ts:55` *"섹션 간격이 전부 16 이다"* + `s3-library.png` ↔ Figma L-1 `30:74` 대조(슬롯 순서·구성 일치) |
| `AC-3L-02` | **PASS** | `[QA 실행]` `s3-library.png` 에 `Reading now` / `Our curated shelf` / `Favorites` / `Finished together` 4제목 육안 확인. `Books you own`·`My Saved` grep **0건** (approvals §14.1 — `163:1633` 은 `Favorites` 가 맞다) |
| `AC-3L-03` | **PASS** | `[QA 실행]` `library.spec.ts:188`(hit 44) · `:214`(접근성 이름 3개 구분) · 슬롯 1 은 `3 of 5 nights` 상태 텍스트(비대화형, `s3-library.png` 확인) |
| `AC-3L-04` | **PASS** | `[QA 실행]` `tabs.spec.ts` 3건 — `document` 요청 0건, 양방향 |
| `AC-3L-05` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:80`(overview 4섹션 schema 통과) + fixture 하드코딩 grep 0건 |
| `AC-3L-06` | **PASS** | `[QA 실행]` `library.spec`/`library-screen.test.tsx` 통과 + `useToggleLibrarySave` 가 `libraryKeys.all` 무효화 → overview 재조회 |
| `AC-3L-07` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:367` *"해제하면 `saved: false` · `savedAt: null` 이다"* · `:377` 멱등 · `library:unsave` 시나리오 |
| `AC-3L-08` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:110` *"⭐ `favorites-empty` 는 Favorites 만 0건이다 (저장 전 기본 상태)"* + `s3-library-favorites-empty.png` baseline. 섹션이 사라지지 않는다 |
| `AC-3L-09` | **PASS** | `[QA 실행]` `s3-library-reading-now.png` baseline + `library.spec` 기하 테스트 |
| `AC-3L-10` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:172` — fixture `progressRatio` 0.552 와 회차 3/5(0.6)가 **다른 값**으로 고정되어 되계산을 금지한다 |
| `AC-3L-11` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:101` + `library:reading-now-none` 시나리오. 블록 전체 제거 |
| `AC-3L-12` | **PASS** | `[QA 실행]` `bookDisplay.ts` 가 서버 문자열을 조립만 한다 (상대 시간 계산 0건) |
| `AC-3L-13` | **PASS** | `[QA 실행]` `s3-library-list.png` baseline — 4행 전부 `Rated 3.5 / 4 / 4.5 / 3.5` 우측 정렬 육안 확인 |
| `AC-3L-14` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:147` *"`unrated` 는 평점을 비운다"* + 좌측 정렬 유지 |
| `AC-3L-15` | **PASS** | `[QA 실행]` `stage3-copy-language.test.tsx` 가 `libraryCopy` 전수를 비교·판정 금지어로 검사. `s3-library-list.png` 에 `Rated` 외 수식어 없음 |
| `AC-3L-16` | **PASS** | `[QA 실행]` `s3-library-list.png` + `library.spec`·`library-screen.test.tsx` 기하·터치 타깃 |
| `AC-3L-17` | **PASS** | `[QA 실행]` `s3-library-list.png` — **4행 사이 divider 3개 전부** 육안 확인 (`L-OPEN-05` 대로) |
| `AC-3L-18` | **PASS** | `[QA 실행]` `s3-library-shelf-sheet.png` + `MockLibraryApi.test.ts:222`(`paged` cursor 2페이지) + `library.spec.ts:249`~ 시트 기하 |
| `AC-3L-19` | **PASS** | `[QA 실행]` `s3-library-book-sheet.png`·`-back.png` baseline + `library-sheets.test.tsx`. `slice(` 0건 |
| `AC-3L-20` | **PASS** | `[QA 실행]` `library.spec.ts:250` *"좌우 inset 14 · radius 28(네 모서리) · grabber 없음"* · `:289` · `:308` · `:483`(스크롤·닫기). scrim 은 `s3-sheet-scrim`·`s3-dialog-scrim` baseline |
| `AC-3L-21` | **PASS** | `[QA 실행]` `library-entry-screens.test.tsx:184`. (IK **보관·재생**은 `AC-3-36` 소관 → `QA-3-005`) |
| `AC-3L-22` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:259` + `library:user-entered-book` + `s3-library-list.png` placeholder |
| `AC-3L-23` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:278`·`:300` |
| `AC-3L-24` | **PARTIAL** (수용 — approvals §27.3) | `[QA 실행]` `s3-library-gift-requests.png` baseline + 배송지 입력 필드 **0건** 확인. **미충족 조건**: `GiftRequestStatus` enum 은 6종(`enums.test.ts:261` 고정)이나 `library:gift-pending` fixture 는 **2건만** 보여 준다(`mocks/fixtures/library.ts:331-332` — `shipped`·`requested`) — "상태 6종을 표시한다"를 실행으로 확인할 시나리오가 없다. **3회차: 판정 `PARTIAL` 유지 + 사용자 수용**(approvals §27.3). 고칠 수 있는 항목이나 사용자가 수용을 택했고, **`approved`·`delivered`·`cancelled`·`rejected` 4종은 화면 확인 없이 남는다** |
| `AC-3L-25` | **PASS** | `[QA 실행]` `TextLink.tsx:91` `rel="noopener noreferrer"`(AC 가 요구한 `noreferrer` 포함) |
| `AC-3L-26` | **PASS** | `[QA 실행]` `z.object(` 앱 내 0건 + `pnpm typecheck` exit 0 |
| `AC-3L-27` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts` 전 시나리오 schema `safeParse` 통과 (§4.1 `AC-3-60` 참조) |
| `AC-3L-28` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:54` *"공통 5종 + offline + Library 특화 13종이다"* = **19 key**, `scenario-selection.test.ts` 가 catalogue 준수를 고정 |
| `AC-3L-29` | **PASS** | `[QA 실행]` grep 0건 (§4.1 `AC-3-63`) |
| `AC-3L-30` | **PASS** | `[QA 실행]` `lint:boundaries` 0 violations + `LibraryPage.tsx` **30줄, import 1개**(`features/library`), API 호출·fixture·로직 0건. `AddOwnBookPage` 11줄 · `GiftRequestsPage` 12줄 |
| `AC-3L-31` | **PASS** | `[QA 실행]` 응답 타입 `SavedBook` **유지 확인**(`saved-book.test.ts` + `MockLibraryApi.test.ts:316`). Home `SaveButton` 경로는 `home.spec.ts:187` 통과 — 회귀 없음 |
| `AC-3L-32` | **PASS** | `[QA 실행]` §4.1 `AC-3-67`. 신규 토큰은 Tier 3 152종으로 `token-tiers.test.ts`·`fonts.test.ts` 가 고정 |
| `AC-3L-33` | **PASS** | `[QA 실행]` `shadow.spec.ts` **보정 있음/없음 양방향 × 4폭** — 캐러셀 표지(`:246`) · 시트 본문(`:444`/`:463`) · 뒷면 목록(`:636`/`:651`) · 표지 좌우(`:810`/`:827`) · 표지 위쪽(`:881`/`:898`) + `:849`(안쪽 clip 박스 되돌리면 다시 잘린다) + `:953`(`--shadow-cover` + radius 10 존재). **"보정 없음" 쪽이 실제로 실패하도록 짜여 있어 프로브가 무는 것을 증명**한다 |
| `AC-3L-34` | **PASS (가값 `P-24`)** | `[QA 실행]` `--color-fg-tertiary` = `--haru-ink-400` 매핑 확인, 토큰 정의에 `/* provisional: P-24 */`, dev gallery `provisionalItems.ts` 등재 확인. 대비 미달은 approvals §20.4 승인 가값 |
| `AC-3L-35` | **PASS** | `[QA 실행]` `library.spec.ts:152` 4폭 + `:165` *"320px 에서 표지가 비례 축소된다 (content × 31.0145% ≈ 84.4) — 캡션 타이포는 그대로"* |
| `AC-3L-36` | **PASS** | `[QA 실행]` `library.spec.ts:119`·`:144` + Playwright `reducedMotion: 'reduce'` 전역 |
| `AC-3L-37` | **PASS** | `[QA 실행]` `MockLibraryApi.test.ts:437` *"아동 데이터 키가 요청 본문에 실리지 않는다 (경로 파라미터 `childId` 포함)"* · `:463` *"읽기 호출에도 `childId` 가 payload 로 새지 않는다"*. 콘솔은 §4.1 `AC-3-73` |
| `AC-3L-38` | **PASS** | `[QA 실행]` §4.1 `AC-3-74`·`AC-3-45` |
| `AC-3L-39` | **PASS** | `[QA 실행]` `git ls-files` 0건 |

---

## 5. Findings

### `QA-3-001` | Severity: **High**

> **2회차 (2026-10-09)**: 판정 **`FAIL` 유지**. 사용자가 **명시 수용**해 Stage 4 로 이월했다 (approvals §26.1). Stage Verdict 산정에서만 수용 항목으로 처리한다. 재구현 여부는 묻지 않았다 — Stage 4 Plan In Scope 항목은 §11.10.

**Requirement**: `AC-3-42` · `AC-3-43` · `AC-3-44` (+ `AC-3-56` 부분) / FR-08 Frontend 부분 / `D-16`

**Steps to reproduce**
1. `find apps/web/src -iname '*push*'` → **0건**
2. `ls apps/web/src/shared/platform/` → **디렉토리 없음**
3. `grep -rl 'NotificationPreferences\|PushDevice' packages/contracts/src` → **0건**
4. `ls packages/contracts/src/enums/ | grep push` → **0건** (`PushPlatform` 부재)
5. scenario key 목록 전수 → `push-permission-denied` **0건**
6. `apps/web/src/dev/__tests__/scenario-selection.test.ts:195` 주석: *"`offline-cached-card` · `push-permission-denied` 는 해당 화면이 들어오는 단계에서 등록한다"*

**Expected**
`D-16` (approvals §8 `D-16`, §8.4 재확인, Plan §3.1):
> *"`shared/platform/pushPermission.ts` 에 `PushPermissionPort`(`getStatus`·`request`·`getToken`). Web 구현은 `Notification.permission` / `Notification.requestPermission()` 까지만 … 선택 지점은 `app/providers` 한 곳."*
> *"Stage 3 **구현 유지**: `PushPermissionPort` + Web 구현 + Mock 시나리오(`push-permission-denied` 등), 권한 사전 안내 UX."*
> *"contracts `GET/PUT /v1/notification-preferences`, `POST /v1/push-devices`, `DELETE /v1/push-devices/:id` 는 **정의를 유지**한다."*

**Actual**
Port · Web 구현 · 사전 안내 UX · Mock 시나리오 · contracts **5개 전부 존재하지 않는다**. `D-18`(2026-10-02)은 **알림 설정 화면만** 이월했고 *"D-16(push 권한 Port + Web + Mock)은 **그대로 유효**하다"* 를 명시한다. 이 기능군을 Stage 3 밖으로 보낸 **사용자 결정은 `stage-3-approvals.md` 어디에도 없다** (`grep -n "push" docs/decisions/stage-3-approvals.md` 전수 확인).

`AC-3-45`(SDK 미도입)만 공허하게 충족된다 — 도입할 기능 자체가 없기 때문이다.

**Evidence**: 위 1~6 전부 `[QA 실행]`
**Suspected area** (수정 지시 아님): `apps/web/src/shared/platform/` (미생성) · `packages/contracts/src/notifications/`(미생성) · `apps/web/src/mocks/notifications/`(미생성) · `apps/web/src/app/providers/`

> **판정 선택 사유**: `BACKEND_INTEGRATION_PENDING` 이 아니다 — 요구된 것은 **Frontend Port + Web 구현 + Mock + contract 정의**이고, 실제 push 발송만 Backend 소관(`P3-BIP-08`)이다. `rules/qa.md` §1 의 PENDING 조건 ①(*"Frontend 부분은 별도 항목으로 PASS/FAIL 판정되어 있어야 한다"*)을 충족할 Frontend 구현물이 없다.

---

### `QA-3-002` | Severity: **Medium**

> **2회차**: 판정 **`FAIL` 유지** · **사용자 명시 수용**(Stage 4 이월, approvals §26.1). → §11.10

**Requirement**: `AC-3-46` · `AC-3-49` / PRD §11 NFR 오프라인 / `D-11`

**Steps to reproduce**
1. `grep -rn 'offline-cached-card' apps/web/src` → **주석 1건뿐**(`scenario-selection.test.ts:195` — 이월을 선언하는 주석)
2. `ACTIVITY_SCENARIO_KEYS` 전수 = `success loading empty error retry offline reread-option books-exhausted book-saved onboarding-incomplete` → `offline-cached-card` **없음**
3. `localStorage` 사용처 전수 → **온보딩 draft 1종뿐**(`shared/lib/onboarding-draft.ts`). Activity Card 캐시 저장소 **0건**
4. `schemaVersion` 참조처 → 온보딩 draft 전용

**Expected**
- `AC-3-46`: *"`offline-cached-card` 에서 **캐시된 Activity Card + Offline Banner**가 함께 표시된다"*
- `AC-3-49`: *"캐시가 schemaVersion 불일치·parse 실패·날짜 경과 시 폐기되고, **로그아웃 시 삭제**된다"*
- Plan §1 목표 8: *"네트워크가 없으면 **최근 Activity Card 캐시**를 표시하고 Offline Banner를 함께 노출한다"*

**Actual**
Activity Card 로컬 캐시가 존재하지 않는다. `activity-cards:offline` 은 `NetworkError` → 오프라인 상태 화면만 보여 주고 **캐시된 카드를 보여 주지 않는다**. 따라서 `AC-3-49` 의 검사 대상(캐시 폐기·로그아웃 삭제)도 성립하지 않는다.

`AC-3-47`·`AC-3-48`·`AC-3-50` 은 충족되지만, `AC-3-48`("캐시는 Activity Card만 저장한다")은 **저장하는 것이 없어서** 공허하게 충족된다.

이 기능군의 Stage 3 제외 결정은 approvals 에 **없다** (`grep "offline-cached\|오프라인 캐시\|AC-3-4[6-9]"` 전수 0건).

**Evidence**: 위 1~4 전부 `[QA 실행]`
**Suspected area**: `apps/web/src/entities/activity-card/` · `apps/web/src/shared/lib/`(캐시 저장소 미생성) · `apps/web/src/mocks/activities/MockActivityApi.ts`

---

### `QA-3-003` | Severity: **Medium**

> **2회차**: 판정 **`FAIL` 유지** · **사용자 명시 수용**(Stage 4 이월, approvals §26.1). → §11.10

**Requirement**: `AC-3-51` / C-17 / Stage 1 `D-4`

**Steps to reproduce**
1. `find apps -name '*.avif' -o -name '*.webp'` → **0건**
2. `grep -rl 'srcSet\|<picture' apps/web/src packages/ui/src` → **0건**
3. `grep -rn 'assets:optimize\|sharp' package.json apps/web/package.json scripts/` → **0건**
4. 래스터 에셋 전수 = `book-covers/*.png` 3 + `character/*.png` 4 = **PNG 7개뿐**

**Expected**
Stage 1 `D-4` (`stage-1-approvals.md:18`, **O 승인**):
> *"벡터 SVG / 래스터 **AVIF + WebP + PNG fallback**, **`<picture>`+`srcset`**, 해상도 상한(1440 / 696 / 360 / 216), **`pnpm assets:optimize`**(devDependency `sharp`) 로 산출물 커밋"*

`AC-3-51` 은 이 파이프라인이 **Stage 3 에서 처음 실사용**되는 것을 확인하는 AC 다 (Plan §1 목표 10).

**Actual**
단일 PNG + `<img src>` 뿐이다. AVIF·WebP 산출물, `<picture>`/`srcset`, `assets:optimize` 스크립트, `sharp` devDependency 가 **전부 없다**. `shared/assets/book-covers/index.ts` 주석이 *"전부 표시 크기의 2배 이상이다 (`D-4` 에셋 파이프라인 해상도 규칙)"* 라고 적지만, 그것은 **해상도 상한 조항만** 지킨 것이고 포맷·`<picture>` 조항은 지키지 않았다.

`stage-3-home-handoff.md:246` 이 *"표지 에셋 파이프라인(`AC-3-51`~`53`)이 이번 범위 밖"* 이라고 적지만, **그 범위 조정에 대한 사용자 결정이 approvals 에 없다**.

**Evidence**: 위 1~4 전부 `[QA 실행]`
**Suspected area**: `scripts/`(미생성) · `apps/web/src/shared/assets/` · `packages/ui/src/book-cover/BookCover.tsx` · `apps/web/src/entities/character/CharacterIllustration.tsx`

---

### `QA-3-004` | Severity: **Medium**  ⭐ QA 가 직접 측정해 찾은 신규 결함

> **2회차: `FAIL` → `PASS`.** QA 가 다시 측정해 겹침 **−23px** · 탭 3개 hit-test 전부 탭바를 확인했다. 아래 측정값은 **1회차(결함 상태) 기록**이다. → §11.2

**Requirement**: `AC-3-07` / `§16 D-1` / Design Spec §4.12 · §6.2

**Steps to reproduce** (Mock 시나리오 포함)
1. `pnpm --filter @haru/web run dev --port 4319`
2. `/auth/log-in?scenario=library:error` → `sam@example.com` / `sunny-evening-8` 로 로그인 → Home 착지
3. Activity Card 의 **`★ Save`** 클릭 → 저장 실패 Toast 가 뜬다
4. Toast 가 떠 있는 동안 탭바 링크 3개의 **중심점에서 `document.elementFromPoint`** 를 읽는다

**Expected**
`Toast.css` 가 정의한 탭바 보정이 적용되어야 한다:
```css
.haru-toast-viewport--tabbar {
  inset-block-end: calc(
    var(--layout-safe-bottom) + var(--space-4) + var(--layout-tabbar-height)
      + var(--layout-tabbar-center-overhang)
  );
}
```
→ Toast 가 탭바 **위쪽**에 뜨고 탭 3개를 가리지 않는다. `AC-3-07` = *"Toast 와 Sheet가 탭바 위에 정상 표시되고 z-index·**하단 offset**이 §16 D-1 규칙과 일치한다"*.

**Actual** (393×852 · deviceScaleFactor 1 실측)

```json
{
  "viewportClass": "haru-toast-viewport",          ← --tabbar 수식어가 붙지 않았다
  "insetBlockEnd": "16px",                          ← 보정 전 값
  "toastRect":   { "top": 786, "bottom": 836 },
  "tabbarRect":  { "top": 766, "bottom": 836 },     ← 탭바를 50px 덮는다
  "toastZ": "60", "tabbarZ": "20"
}
```

탭 링크 중심점의 `elementFromPoint` (393px · 320px **양쪽 동일**):

| 탭 | 좌표(393) | 최상단 요소 | 가려짐 |
|---|---|---|---|
| Library | (82, 801) | `haru-toast haru-toast--error haru-toast--open` | **예** |
| Home | (197, 801) | 〃 | **예** |
| Progress | (312, 801) | 〃 | **예** |

→ Toast 표시 시간 동안 **하단 탭 3개 전부 클릭이 가로막힌다**. 탭바 상단 20px(y 766~786)만 노출된다.

**원인** (분석, 수정 지시 아님)
`ToastProvider` 는 `withTabBar` prop 으로 수식어를 붙이는데(`packages/ui/src/feedback/ToastProvider.tsx:52` 기본값 `false`, `:108` 분기), **`apps/web/src/app/providers/AppProviders.tsx:39` 가 `<ToastProvider>{children}</ToastProvider>` 로 인자 없이 마운트**한다. 저장소 전수 grep 결과 `withTabBar` 를 넘기는 곳이 **0건** — `haru-toast-viewport--tabbar` 는 Production 에서 **도달 불가 코드**다.

**왜 테스트가 못 잡았나**
`apps/web/__tests__/stage3-css-guards.test.ts:70` 이
```js
const viewport = /\.haru-toast-viewport--tabbar\s*\{([^}]*)\}/.exec(TOAST_CSS)?.[1] ?? '';
expect(viewport).toContain('--layout-tabbar-height');
```
로 **CSS 규칙 문자열만** 본다. 그 클래스가 실제로 붙는지는 보지 않는다. `e2e/` 전체에서 `toast` 문자열은 `visual.spec.ts:76`(gallery 컴포넌트 컷) **1건뿐**이고 탭 화면 Toast 를 띄우는 e2e 는 0건이다.

**Evidence**: `[QA 실행]` 위 측정 2종 (393 · 320), 재현 100%
**Suspected area**: `apps/web/src/app/providers/AppProviders.tsx` · `packages/ui/src/feedback/ToastProvider.tsx` · `apps/web/__tests__/stage3-css-guards.test.ts`(가드 자체의 검출력)

---

### `QA-3-005` | Severity: **Medium**

> **2회차: `FAIL` → `PASS`.** QA 가 Mock Adapter 를 직접 호출해 7항목을 확인했다. → §11.3

**Requirement**: `AC-3-36` / `P3-BIP-12` Frontend 부분

**Steps to reproduce**
1. `grep -n 'idempotency' apps/web/src/mocks/library/MockLibraryApi.ts` → **0건**
2. 비교군: `MockConsentApi.ts:109` `const idempotency = new Map<...>()`, `:215`~`:229` 재생·`IDEMPOTENCY_KEY_REUSED` 분기 존재. `MockOnboardingApi.ts:163`·`:397`~`:412` 동일
3. `MockLibraryApi.test.ts:246` 은 IK 를 **넘기기만** 하고 replay 를 단언하지 않는다

**Expected**
`AC-3-36`: *"같은 Idempotency-Key + 같은 body replay가 **동일 응답**을 돌려주고, 다른 body는 `IDEMPOTENCY_KEY_REUSED` 다"* (검증 방법 = **Mock replay 테스트**). `shared/api/library-api.ts` 주석 표가 `addOwnBook`·`createGiftRequest` 를 **IK 필수**로, 오류 목록에 `IDEMPOTENCY_KEY_REUSED` 를 포함한다.

**Actual**
`MockLibraryApi` 는 `ApiMutationOptions.idempotencyKey` 를 **받아서 버린다**. 같은 키로 두 번 호출하면 **새 리소스가 두 번 만들어지고**, 다른 body 로 같은 키를 써도 `IDEMPOTENCY_KEY_REUSED` 가 나오지 않는다. Stage 2 Mock 2종은 같은 요구를 구현해 두었으므로 **선례와 불일치**이기도 하다.

`AC-3L-21` 의 PENDING 열은 *"IK **보관** `P3-BIP-12`"* 로 서버 보관을 Backend 로 넘기지만, `AC-3-36` 은 **Mock 재현**을 In Scope 로 남겨 두었고 무효화된 적이 없다 (`grep -rn "AC-3-36" docs/` 전수 — 무효·이월 기록 0건).

> `rules/qa.md` §1: *"Contract가 요구사항을 표현하지 못하거나 **Mock이 Contract와 다르면 PENDING이 아니라 `FAIL`**"*.

**Evidence**: 위 1~3 전부 `[QA 실행]`
**Suspected area**: `apps/web/src/mocks/library/MockLibraryApi.ts` · `apps/web/src/mocks/__tests__/MockLibraryApi.test.ts`

---

### `QA-3-006` | Severity: **Low**

> **2회차: `FAIL` → `PASS`.** `P-23` 등재 + 재발 방지 가드가 실제로 무는 것을 확인했다. → §11.4

**Requirement**: Stage 0 `#10-4` 가값 재제시 절차의 선행 조건 (`S3-PROV-2`, approvals §21.5)

**Steps to reproduce**
1. `grep -rn 'provisional' packages/design-tokens/src/ | grep -oE 'P-[0-9]+' | sort -u` → `P-01 P-02 P-04 P-16 **P-23** P-24`
2. `grep "id: 'P-" apps/web/src/dev/ui-gallery/provisionalItems.ts` → `P-01`~`P-17`, `P-24` — **`P-23` 없음**
3. `packages/design-tokens/__tests__/fonts.test.ts:157` 이 활성 가값을 `P-01 P-02 P-04 P-16 P-23 P-24` 로 고정

**Expected**: 활성 가값 전부가 dev gallery 목록에 등재되어야 항목별 재제시(Stage 0 `#10-4`)가 성립한다.
**Actual**: **`P-23`**(`--color-prompt-tag-fg`, Stage 3 Home 라운드 신설)이 등재되지 않았다. `P-05` 는 `status: 'confirmed'` + 해제 사유로 올바르게 갱신되어 있고, `P-24` 는 등재되어 있다. `P-18`~`P-22` 는 토큰 자체가 없어 등재 대상이 아니다.
**Evidence**: 위 1~3 전부 `[QA 실행]`
**Suspected area**: `apps/web/src/dev/ui-gallery/provisionalItems.ts`

---

### `QA-3-007` | Severity: **Low**

> **2회차: `FAIL` → `PASS`.** handoff §3 **10건** · §9 ⑨ 전제 정정 확인. → §11.5

**Requirement**: 인계 문서 정확성 (`rules/workflow.md` §6 — handoff 가 QA 의 판정 근거다)

**내용 2건**

1. **handoff §3 "Figma 에 없는데 구현한 것" 표가 9건인데 실제는 10건이다.** 빠진 것은 **버블 닫기(x) 버튼**이다. 승인 근거는 존재한다 — `stage-3-home-handoff.md` §B2(*"Figma `50:176` 에 없는 요소다. 사용자 지시로 추가했으며 허용 차이 등록 + 디자이너 확인 대상(`D-REQ-2`)"*) + approvals §13.4 `W-2`(*"닫기 버튼 자체가 Figma 에 없으므로 … **결정: 40 을 유지한다**"*). **FAIL 사유가 아니지만**, 통합 입구 문서가 목록을 선언해 놓고 1건을 빠뜨리면 QA 가 최우선 규칙 #2 위반으로 오판할 수 있다.
2. **handoff §9 ⑨ 의 전제가 사실이 아니다.** *"Toast 가 실제로 마운트되는 Stage 3 화면이 없어 실행 증거가 없다"* → `ActivityCardDeck.tsx:49`(저장 실패)와 `AddOwnBookForm.tsx:68`(등록 성공)이 **둘 다 Toast 를 띄운다**. 그 전제 때문에 실행 측정이 생략되었고, QA 가 측정하자 **`QA-3-004`** 가 나왔다.

**Evidence**: `[QA 실행]` grep + handoff `[문서 인용]`
**Suspected area**: `docs/qa/stage-3-handoff.md` §3 · §9 (문서, Product Code 아님)

---

### `QA-3-008` | Severity: **Low**

> **2회차: 해소.** Plan `AC-3-56`(32종) · `AC-3-59`(29종) 문구 정정 확인 → 두 AC **`PASS`**. → §11.5

**Requirement**: `AC-3-59` · `AC-3-56` 문구 ↔ 구현 불일치 (결함이 아니라 **AC 문구가 낡음**)

- `AC-3-59` = *"Error Code **신규 추가 0건**(28종 유지)"* ↔ 실제 **29종**(`BOOK_ALREADY_OWNED` 409). 이 추가는 Library Plan §7.4 승인분이다.
- `AC-3-56` = *"신규 enum 5종(… `PushPlatform`) … 총수 **31종**"* ↔ 실제 **32종**, `PushPlatform` 부재. 32 는 Library Plan §7.3 승인분, `PushPlatform` 부재는 `QA-3-001` 종속.

**판정 처리**: 두 AC 모두 `PARTIAL` 로 기록하되 **승인된 변경분은 결함으로 세지 않았다**. Stage 3 Plan §11.9 의 AC 문구 갱신이 필요하다.
**Evidence**: `[QA 실행]` `error-envelope.test.ts:15` · `enums.test.ts:253`
**Suspected area**: `docs/plans/stage-3-plan.md` §11.9 (문서)

---

### `QA-3-009` | Severity: **Low**

> **2회차: 해소.** 사용자 결정으로 **`AC-3-34` 가 폐기**됐다 (approvals §26.5, `stage-3-plan.md:584`) → **판정 대상 아님**. → §11.5

**Requirement**: `AC-3-34` / PRD §13 (증정 배송 대기 예외 처리)

`AC-3-34` 는 *"`gift-pending` 에서 서재에 배송 상태가 표시되고, **'보유 책 직접 입력 또는 대화 전용 세션' 안내**가 함께 제공된다"* 를 요구한다. 배송 상태 `Tag` 와 직접 입력 경로는 있으나 **"대화 전용 세션" 안내가 없다** — `ActivityOptionKind.conversation_only` 가 approvals §12.12 로 폐기되었기 때문이다.

§12.12 는 *"§13 의 '마이크 권한 거부 → 대화만 하기' 는 그대로 유지된다 — 이건 녹음 이야기이고 Stage 4 소관"* 이라고만 적고, **PRD §13 의 "증정 대기 중 대화 전용 세션" 쪽을 `AC-3-34` 에서 어떻게 처리할지는 결정하지 않았다** (PRD 수정 대상 11번은 §7.4 규칙만 다룬다).

**판정 처리**: `AC-3-34` **PARTIAL**. 결정 공백이므로 사용자 판단이 필요한 항목으로 올린다.
**Evidence**: `[QA 실행]` `MockLibraryApi.test.ts:164` + 시나리오 실측 / `[문서 인용]` approvals §12.12
**Suspected area**: 결정 문서 (`AC-3-34` 재정의 필요)

---

## 6. 남은 가값(provisional) 목록  `[QA 실행]` 확인

`packages/design-tokens/__tests__/fonts.test.ts:157` 이 **활성 6종**을 고정한다.

| ID | 내용 | 상태 | dev gallery 등재 |
|---|---|---|---|
| `P-01` | 보조 텍스트 `#7d9291` 2.58:1 | 디자이너 대기 | ✅ |
| `P-02` | 비텍스트 요소 대비 | 디자이너 대기 | ✅ |
| `P-04` | — (Stage 1 §9) | 디자이너 대기 | ✅ |
| `P-16` | — (Stage 2 `D-14`) | 디자이너 대기 | ✅ |
| **`P-23`** | `--color-prompt-tag-fg` (Stage 3 Home 라운드) | 디자이너 대기 | ✅ **2회차 등재 확인** (`provisionalItems.ts:178`) + A11yPage 대비 쌍 `C-5` |
| **`P-24`** | `--color-fg-tertiary` = `--haru-ink-400`. **7 사용처 전부 AA(4.5)·대형 텍스트(3.0) 미달, 최악 1.56:1** | 디자이너 확인 요청 | ✅ |

**해제된 가값**: `P-05`(scrim) — 근거가 "DESIGN_TOKEN_MAP 제안" → **"Figma 실측"** 으로 바뀌어 해제(`L-NEW-09`, approvals §20.2). 감시 baseline `s3-sheet-scrim`·`s3-dialog-scrim` **존재 확인**, 둘 다 전량 재생성에서 바이트 동일.

**수용 예외**: `D-01`(Accent 버튼 흰 라벨 2.07:1) — `a11y.spec.ts:118` 이 `A-1` 을 `< 4.5` 로 **명시 단언**해 수용 상태를 고정한다.

> 가값은 `rules/qa.md` §2 에 따라 **FAIL 사유가 아니다**. `P-24` 를 근거로 `AC-3-70`·`AC-3L-34` 를 FAIL 처리하지 않았다.

---

## 7. NOT VERIFIED — 수동 테스트 절차

> **3회차: `NV-1` · `NV-2` 모두 사용자 수용**(approvals §27.3, 2026-10-09). 판정은 `NOT VERIFIED` 로 **유지**하고 Verdict 산정에서만 수용 항목으로 처리한다. 아래 수동 절차는 **남는다** — 실기기·60fps 녹화가 가능해지면 수행한다.

### `NV-1` — Safari / iOS / Android 실기기

**이유**: 모든 측정이 Playwright 번들 Chromium(darwin · `deviceScaleFactor: 1`)이다. 승인된 E2E 도구는 Playwright 뿐이고 실기기는 이 환경에 없다. Stage 1–3 은 웹 전용(Capacitor 는 Stage 4)이지만, **Safari 에서만 깨질 수 있는 CSS 조합이 Stage 3 에서 새로 들어왔다**.

**영향 AC**: `AC-3-68` · `AC-3-69` · `AC-3L-33` · `AC-3L-35` · `AC-3L-36` 의 Safari 분

**검증 대상 (handoff §9 ⑤ 와 동일 판단)**

| 대상 | 쓰는 곳 | Safari 위험 |
|---|---|---|
| `overflow-x: clip` | `.haru-sheet__content` · `.haru-book-sheet__flip` | 다른 축이 `visible` 로 남는지 (Chromium 실측 `{x:'clip', y:'visible'}`) |
| `:has()` | 그림자 inset 선택자 | 지원 버전 |
| `inert` | 뒤집힌 면의 비활성화 | 폴리필 필요 여부 |
| `backface-visibility` + `rotateY` | 카드·시트 뒤집기 | 뒷면 깜빡임 |
| `scroll-snap` + `dvh` | 가로 트랙 · dev 패널 | 주소창 높이 변화 |

**수동 절차**
1. macOS Safari 최신 + iOS Safari(실기기 또는 Simulator)에서 `pnpm --filter @haru/web run dev --host` 로 띄운다
2. `/auth/log-in` → 로그인 → Home. **① 카드 뒤집기** 앞↔뒤 전환에 잔상·깜빡임이 없는지 ② **가로 트랙 스냅**이 1카드=1페이지인지 ③ **카드 하단 그림자가 잘리지 않는지**
3. Library 탭 → **④ 캐러셀 표지 그림자** 상 8 / 하 20 / 좌우 14 가 보이는지 ⑤ "See all" 시트에서 **목록 그림자**가 잘리지 않는지 ⑥ `BookDetailSheet` **뒤집기** 후 뒷면 목록 스크롤
4. 320·393·600·1024 폭 각각에서 2~3 반복
5. VoiceOver 로 캐러셀·Book List 행·시트 dialog 이름을 읽혀 본다
6. 결과를 `docs/qa/evidence/` 에 스크린샷으로 남긴다

### `NV-2` — 뒤집기 중간 프레임 ActionBar 잔상 (handoff §9 ⑥) · 저장 실패 + 뒤집기 동시의 잔여 빈 자리 (handoff §9 ⑦)

**이유**: ① 은 ~170ms · 약 15% 투명도의 **전환 중간 프레임**이라 `animations: 'disabled'` 를 쓰는 시각 baseline 체계로는 포착되지 않는다. ② 는 handoff 자신이 *"코드 추론, 미재현"* 으로 적은 미재현 항목이고, 접기 양이 CSS 상수(ActionBar 45 + gap 12 = 57)라 `InlineAlert` 가 함께 뜨면 차이만큼 빈 자리가 남는다는 **추론**이다.

**수동 절차**
1. ①: `/library` → 캐러셀 항목 탭 → 시트 헤더 trailing **첫 번째** `IconButton`(`Show prompts and coaching notes`) 클릭. 400ms 전환을 **화면 녹화**(60fps)해 중간 프레임에 반투명 ActionBar 가 뒷면 위에 겹치는지 확인. `prefers-reduced-motion: reduce` 에서는 나타나지 않아야 한다
2. ②: `/auth/log-in?scenario=library:error` → Library → 캐러셀 항목 탭 → `★ Save` 클릭(실패 `InlineAlert` 노출) → **즉시** 뒤집기. 뒷면 하단에 빈 자리가 남는지와 그 높이를 측정. 내용 손실·겹침이 없어야 한다
3. 320×568 에서도 반복한다(handoff §9 ⑧ 의 63px 여백과 합쳐질 수 있다)

### 참고 — 미해결이지만 NOT VERIFIED 로 세지 않은 것

**둥근 모서리 AA 띠의 원인 커밋 미특정** (handoff §9 ④ · approvals §23.7): 채널차 ≤ 6 의 안티에일리어싱 커버리지 차이이고 **기하·extent·색이 불변**임이 픽셀로 규정되어 있다. QA 의 전량 재생성에서 **변경 0바이트**로 현재 안정 상태임을 확인했다. 요구사항 판정에 영향이 없어 Finding 으로 올리지 않는다.

---

## 8. BACKEND_INTEGRATION_PENDING

`rules/qa.md` §1 의 **조건 3개**를 각 항목에서 확인했다 — ① Frontend 부분이 별도 AC 로 판정되어 있고 ② 대기 사유와 Handoff 대상이 기록되어 있고 ③ **contract 가 요구를 표현하며 Mock 이 contract 와 일치**한다(`MockLibraryApi.test.ts`·`MockBooksApi.test.ts` schema parse 통과로 확인).

### 8.1 Stage 3 신규

| ID | 대기 사유 | Frontend 부분 판정 | Handoff 대상 문서 |
|---|---|---|---|
| `P3-BIP-16` | **책 평점 집계** `LibraryBook.averageRating` — 모집단을 **해당 Child 의 세션 평점으로 한정**(`L-OPEN-18`). Frontend 는 집계하지 않는다 | `AC-3L-13` PASS · `AC-3L-14` PASS · `AC-3L-15` PASS | `BACKEND_HANDOFF.md` · `DATA_REQUIREMENTS.md` |
| `P3-BIP-17` | **다회차 진행** `ReadingProgress.progressRatio` 는 서버 값. ⚠ **`plannedNights` 출처 미결**(사용자 입력인지 서버 추정인지 결정 없음) | `AC-3L-09`·`10`·`11`·`12` PASS | `BACKEND_HANDOFF.md` · `DATA_REQUIREMENTS.md` |
| `P3-BIP-18` | **서재 섹션 1회 조회** `GET …/library/overview` 가 4섹션을 한 번에 | `AC-3-27` PASS · `AC-3L-05` PASS | `BACKEND_HANDOFF.md` |
| `P3-BIP-19` | **표지 에셋 교체 게이트** — 현재는 Figma 상용 그림책 표지(Mock 전용 임시). **Stage 8 배포 전 필수**(`L-D4` · approvals §14.4 법무 확인) | `AC-3-52` PASS · `AC-3-53` PASS | `BACKEND_HANDOFF.md` + **Stage 8 배포 체크리스트** |
| `P3-BIP-20` | **커서 페이지네이션** `nextCursor` 불투명 문자열, 같은 정렬에서 중복·누락 없음 | `AC-3-38` PASS · `AC-3L-18` PASS | `BACKEND_HANDOFF.md` |
| `P3-BIP-21` | **`BOOK_ALREADY_OWNED`(409)** 재등록 — 화면은 오류가 아니라 안내 | `AC-3-30` PASS (`library:book-already-owned`) | `ERROR_CODES.md` |
| `P3-BIP-22` | **`Idempotency-Key` 서버 24h 보관·재생** | **2회차 갱신** — 전송 `AC-3-30`·`AC-3L-21` PASS, **Mock 재현 `AC-3-36` PASS** (1회차 FAIL → 수정 확인, §11.3). `rules/qa.md` §1 조건 ③ 충족 → 이제 **서버 측 24h 보관·만료만** PENDING 이다 | `BACKEND_HANDOFF.md` · `ERROR_CODES.md` |
| `P3-BIP-23` | **`GET /v1/books/:bookId/prompts?childId=`** — 연령대·역량별 세트. 카탈로그 외 책은 호출 0건 | `AC-3-32` PASS · `AC-3L-19` PASS | `BACKEND_HANDOFF.md` |
| `P3-BIP-24` | **증정 요청 상태 전이** `requested → approved → shipped → delivered` / `cancelled` · `rejected`. 전이 규칙·알림은 서버 소유 | `AC-3L-24` **PARTIAL**(6종 표시를 재현할 시나리오 없음 — **수용**, approvals §27.3) · `AC-3-33` PASS. contract 는 6종을 표현한다(`enums.test.ts:261`)므로 `rules/qa.md` §1 조건 ③ 은 충족 — PENDING 유지 | `BACKEND_HANDOFF.md` · `DATA_REQUIREMENTS.md` |
| `P3-BIP-25` | **`LibraryBook.purchaseUrl` 허용 도메인 보장** | `AC-3-32` PASS · `AC-3L-25` PASS (`rel="noopener noreferrer"`) | `BACKEND_HANDOFF.md` |
| `P3-BIP-26` | **`BookPromptsResponse.reason` 생성 책임 = 서버.** ① 1~2문장 ② 진단·판정·비교 금지 ③ **길이 상한은 contract 에 없다**(§13.3 — 초과해도 화면이 깨지지 않아야) ④ 없으면 `null`·줄 생략 ⑤ 카탈로그 외 책은 호출 없음 | `AC-3-13` PASS · `books:no-reason` 시나리오 존재 확인 | `BACKEND_HANDOFF.md` · `ANALYSIS_PIPELINE_REQUIREMENTS.md` |

### 8.2 갱신

| ID | 갱신 내용 | Frontend 부분 | Handoff 대상 |
|---|---|---|---|
| `P3-BIP-15` | 저장/해제 응답은 `SavedBook` **현행 유지**(`L-OPEN-20`). 서버는 저장 직후 `overview` 가 **즉시 일관**(read-after-write)이어야 한다 | `AC-3-84`·`85` PASS · **`AC-3-86` PASS (3회차)** · `AC-3L-06`·`07`·`31` PASS | `BACKEND_HANDOFF.md` · `DATA_REQUIREMENTS.md` |

### 8.3 Handoff 에 추가로 남길 요구

- **표지 이미지 비율** — 권장 **107:151**. 크게 벗어나면 `object-fit: cover` 잘림이 커진다
- **`Reading now` 선정 규칙**과 `lastSessionMinutes` 출처가 서버 소유 (조각이 없으면 그 조각만 생략)
- **`characterLine` 길이** — 서버가 약 120자 이내(UI 4줄 상한, approvals §13.3)

### 8.4 PENDING 으로 처리하지 **않은** Backend 인접 항목

| 항목 | 왜 PENDING 이 아닌가 |
|---|---|
| push 권한 (`QA-3-001`) | 요구된 것은 Frontend **Port + Web 구현 + Mock + contract 정의**다. 실제 발송만 `P3-BIP-08`. PENDING 조건 ①(Frontend 부분이 별도 판정) 을 충족할 구현물이 없다 → **FAIL** (2회차: 판정 유지, Stage 4 이월 수용 — approvals §26.1) |
| Idempotency Mock 재현 (~~`QA-3-005`~~) | `rules/qa.md` §1 — Mock 이 contract 와 다르면 **FAIL**. **2회차에 수정 확인되어 이 칸은 해소**됐다. 서버 보관은 `P3-BIP-22` 로 남는다 |
| 오프라인 캐시 (`QA-3-002`) | 순수 Frontend 기능(`localStorage`)이다. Backend 의존 0 |
| 에셋 파이프라인 (`QA-3-003`) | 빌드 타임 Frontend 작업이다. Backend 의존 0 |

---

## 9. Regression

### 9.1 전체 스위트  `[QA 실행]`

| | 결과 |
|---|---|
| `pnpm test` | **1596 passed / 116 files** — 기준선 1596 과 일치, 실패 0 |
| `pnpm test:e2e` | **271 passed** — 기준선 271 과 일치, 실패 0 |
| 시각 baseline | `--update-snapshots=all` 후 **74종 전부 바이트 동일** |

### 9.2 Stage 1·2 핵심 경로 (`AC-3-77`) — **PASS**  `[QA 실행]`

`test:e2e` 통과 내역에서 직접 확인한 경로:

| 경로 | spec | 결과 |
|---|---|---|
| 가입 3경로 → 동의 → VPC | `auth.spec.ts` · `consent.spec.ts` | ✅ |
| 온보딩 5단계 → `/onboarding/saved` → `/` 착지 | `onboarding.spec.ts` (**#88~#120**, 자동 전진·복귀·경계·3입력경로 전부) | ✅ |
| Guard 리다이렉트 | `auth.spec.ts` + `/library` 직접 goto 시 `/auth/welcome` 리다이렉트(handoff §2.1 재현 경로로 확인) | ✅ |
| `AC-2-13` 동의 전 아동 데이터 0건 | `consent.spec.ts` + `MockConsentApi.test.ts` + `MockLibraryApi.test.ts:437`·`:463` | ✅ |
| 로그아웃 → Welcome + 로컬 draft 삭제 | `home.spec.ts:454`·`:487`·`:505` | ✅ |
| 320px + 200% 확대 가로 스크롤 0 | `auth.spec.ts:150` | ✅ |

### 9.3 ⚠ 이번 라운드 집중 회귀 — `ListGroup`·`ListRow` 정규화 (`L-NEW-06`·`L-NEW-07`) — **PASS**  `[QA 실행]`

Stage 2 가 추정으로 정한 기본값을 Figma 실측으로 **전역 교체**했다: 면 90%(`--color-surface-strong`) → **74%(`--color-surface-glass`)**, 그림자 3겹(`--shadow-glass-rest`) → **1겹(`--shadow-bubble`)**, 제목 13(`footnote`) → **15(`subheadline`)**. 파급 대상은 Settings(`SettingsMenu`) · 온보딩 즐겨찾는 책(`FavoriteBooksCard`) · dev gallery 다.

| 검사 | 결과 |
|---|---|
| Stage 2 화면 e2e | `onboarding.spec.ts` 전건 통과(#88~#120 포함) · `home.spec.ts:454`~`:505` 설정·로그아웃 3건 통과 |
| Stage 2 단위·컴포넌트 | `onboarding-screens.test.tsx` · `home-settings.test.tsx` · `rework-css-guards.test.ts` 전부 통과 (1596 중) |
| 재생성 baseline 2종 | `s2-listrow` · `s2-deck-books-favorites` — 원인이 approvals §21.2 에 **픽셀 클러스터 단위로 규명**되어 있고(위쪽 그림자 소멸 glass-rest 22 → bubble 0, 아래 78→10, 좌우 50→4, 2행 제목 line-height 18→20 = +4px), QA 의 전량 재생성에서 **추가 변경 0건** |
| 미재생성 baseline | `s2-consent` · `s2-login` · `s2-signup` · `s2-welcome` · `s2-onboarding-*` 7종 · `s2-home-header` · `s2-vpc-failed` 등 **전부 바이트 동일** — 정규화가 범위를 넘지 않았다 |
| 변형 부활 방지 | `tone="glass"` · `titleVariant` grep **0건**, 가드 테스트가 고정 |

→ **정규화로 인한 Stage 2 회귀 0건**을 실행으로 확인했다.

### 9.4 Home 라운드 ↔ Library 라운드 상호 회귀 — **PASS**  `[QA 실행]`

| 검사 | 결과 |
|---|---|
| Home baseline 7종 | `s3-home` · `s3-home-deck` · `s3-home-deck-back` · `s3-home-deck-scrolled` · `s3-home-card-save-saved` · `s3-tabbar-top` · `s3-tabbar-bottom` — 전량 재생성에서 **바이트 동일** |
| `BookCover` `sm`·`md` 수정(`L-R2-01`)의 Home 영향 | `s3-home*` 변경 0 + `library-css-guards.test.ts` 가 *"`BookCover` `md`·`sm` 기본값에 그림자 없음 + Home override 불변"* 을 고정 |
| 시트 표지 그림자(`L-R2D-01`)의 Home 영향 | `s3-library-book-sheet.png` 1종만 변경(커밋본), Home·Library 목록·캐러셀 baseline 변경 0 |
| Home `SaveButton` ↔ Library `useToggleLibrarySave` 분리(`L-OPEN-20`) | `home.spec.ts:187` + `saved-book.test.ts` 통과, Home 경로 회귀 0 |
| `scrim` 전역 교체(`L-OPEN-06`)의 Stage 2 영향 | `s3-sheet-scrim`(`SelectTrigger` 시트) · `s3-dialog-scrim`(로그아웃 `ConfirmDialog`) 감시 baseline 2종 통과 + 바이트 동일 |

---

## 10. 재검증 이력

| 회차 | 일시 | 대상 | Verdict | 비고 |
|---|---|---|---|---|
| 1 | 2026-10-09 | 커밋 `61fee89` | **`FAIL`** | 최초 Stage 3 QA. Finding 9건(High 1 · Medium 4 · Low 4) |
| 2 | 2026-10-09 | 커밋 `80ee2be` | **`INCOMPLETE`** | 재검증 4건 **전부 PASS**(`QA-3-004`·`005`·`006`·`007`) · `QA-3-008` 해소(AC 문구 정정 확인) · `QA-3-009` 폐기 확인. `QA-3-001`·`002`·`003` 은 판정 `FAIL` 유지 + **사용자 수용**(Stage 4 이월)으로 Verdict 산정 제외. 남은 차단 요인은 **PARTIAL 2 (`AC-3-86`·`AC-3L-24`) + `NOT VERIFIED` 2 (`NV-1`·`NV-2`)** → §11 |
| 3 | 2026-10-09 | 커밋 `80ee2be` (**코드 변경 0** — 문서 변경만) | **`PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`** | 사용자 결정(approvals §27)으로 차단 요인 4건 처리: `AC-3-86` **PARTIAL → PASS**(범위 축소 + QA 잔여 조건 재측정) · `AC-3L-24`·`NV-1`·`NV-2` **판정 유지 + 수용**. 8개 명령 전부 재실행 — 기준선 일치(`test` 1611/117 · `test:e2e` 273). baseline 전량 재생성 스테일 **0건**. **전수 재집계로 수용 미적용 잔여 0건 확인** → §12 |

### 1회차가 남긴 다음 라운드 안내 (이력)

- `QA-3-001` ~ `QA-3-005` 가 수정 대상이다. 수정은 **development-agent** 가 한다.
- `QA-3-001`·`QA-3-002`·`QA-3-003` 은 **세 기능군이 통째로 없는 것**이라 구현량이 크다. 사용자가 이 셋을 **Stage 3 에서 이월**하기로 결정하면 `rules/qa.md` §2 에 따라 항목별 명시 수용으로 처리할 수 있다 — **QA 가 스스로 수용을 가정하지 않았다.** → **2026-10-09 사용자 결정(approvals §26.1)으로 세 건 모두 명시 수용되었다.**
- `QA-3-004` 는 **수정 비용이 작고 영향이 크다**(탭 3개 클릭 차단). 재검증 시 **CSS 문자열 가드가 아니라 렌더 측정**으로 고정되었는지를 본다. → **2회차에서 그렇게 확인했다** (§11.2).
- `QA-3-009` 는 결정 공백이라 development-agent 가 아니라 **사용자 결정**이 먼저 필요하다. → **2026-10-09 `AC-3-34` 폐기 결정**으로 해소.
- 재검증 시 **항목 번호를 유지**하고 판정 변화를 이 표에 기록한다.


---

## 11. 재검증 2회차 — 커밋 `80ee2be` (2026-10-09)

> **증거 표기** — 이 절의 모든 수치는 **`[QA 실행]`** 이다. 비교군으로 인용한 handoff·approvals·Plan 문장은 **`[문서 인용]`** 으로 표시한다.
> 작업 트리: 검증 시작·종료 모두 `git status --porcelain` **빈 출력** — QA 가 Product Code 를 수정하지 않았다. 측정 스크립트는 저장소 밖(scratchpad)에 두고 사용 후 제거했으며, 제거 후 `git status` 가 비어 있음을 확인했다.

### 11.1 8개 명령  `[QA 실행]`

| # | 명령 | 결과 | 소요 | 숫자 |
|---|---|---|---|---|
| 1 | `pnpm typecheck` | ✅ exit 0 | 8.7s | `tsc --noEmit` × 3 (root · e2e · workspace) |
| 2 | `pnpm lint` | ✅ exit 0 | 6.9s | 0 problems |
| 3 | `pnpm lint:boundaries` | ✅ exit 0 | 1.0s | **no dependency violations** (587 modules · 2072 dependencies) |
| 4 | `pnpm test` | ✅ exit 0 | 31.8s | **1611 passed / 1611 · 117 files** (기준선 1611 / 117 일치) |
| 5 | `pnpm build` | ✅ exit 0 | 1.3s | `index.js` 577.59 kB (gzip 172.55) · `index.css` 122.63 kB (gzip 18.52). chunk>500kB 경고 1건(기존) |
| 6 | `pnpm format:check` | ✅ exit 0 | 4.0s | All matched files use Prettier code style |
| 7 | `pnpm assert:no-mocks` | ✅ exit 0 | 0.2s | `__HARU_MOCK_SENTINEL__` 0 · `__HARU_DEV_SENTINEL__` 0 · `haru-dev-` 0 |
| 8 | `pnpm test:e2e` | ✅ exit 0 | **5.8m (347s)** | **273 passed / 273 · 0 failed** (기준선 273 일치) |

- **`test:e2e` 는 단독 실행했다.** 다른 Playwright·dev 서버 프로세스를 먼저 종료한 뒤 돌렸고, 소요 **5.8분**은 정상 대역(4~6분)이다. 20분대 지연·허위 실패는 재현되지 않았다.
- `test` 가 1596 → **1611** (+15), 파일 116 → **117** (+1) 이다. 증가분은 수정 라운드가 추가한 런타임 단정이며 QA 가 파일별로 확인했다: `layouts.test.tsx` Toast 배선 5건 · `MockLibraryApi.test.ts` IK 7건 · 신규 `provisional-registry.test.ts` 3건.

#### 시각 baseline 스테일 검사  `[QA 실행]`

```
pnpm test:e2e --update-snapshots=all        → 273 passed (5.9m, exit 0)
git status --porcelain e2e/__screenshots__  → (빈 출력)
git diff --stat e2e/__screenshots__         → (빈 출력)
find e2e/__screenshots__ -name '*.png' | wc -l → 74
```

**전량 재생성 후 74종 전부 바이트 동일 — 스테일 0건.** 기본 `changed` 모드로는 드러나지 않는 오염(approvals §23.2 `frame-1024` 유형)이 현재 없음을 확인했다. Toast 를 담은 baseline 은 `v9-toast.png`(dev gallery 컷) 1종이며 이것도 바이트 동일이다 — gallery 는 `BottomTabBar` 를 직접 렌더하고 `TabLayout` 을 쓰지 않아 탭바 보정이 켜지지 않는다는 `[문서 인용]` handoff §14 ①의 주장이 **실측으로 확인**됐다.

#### spec 별 통과 내역 (273건)  `[QA 실행]`

`visual` 72 · `shadow` 52 · **`onboarding` 40** · `library` 26 · `home` 22 · **`consent` 15** · **`auth` 13** · `scenarios` 11 · `responsive` 8 · **`tabs` 7** · `a11y` 5 · `book-cover` 2.
Stage 1·2 회귀 경로(`onboarding`·`consent`·`auth` **68건**)가 전건 통과했다 — §11.6 ①의 회귀 확인 근거다.

---

### 11.2 `QA-3-004` (Medium) — Toast 가 탭 3개 클릭을 막았다 → **PASS**

**판정 변화**: 1회차 `FAIL` → 2회차 **`PASS`**. 영향 AC: `AC-3-07`.

**QA 가 직접 측정했다** (`[QA 실행]`). 1회차와 같은 경로를 쓰되, **구현자가 추가한 e2e 를 믿지 않고 독립 스크립트로** 쟀다 (Playwright Chromium, `deviceScaleFactor: 1`, dev 서버 `http://127.0.0.1:4321`).

재현: `/auth/log-in?scenario=library:error` → `sam@example.com` / `sunny-evening-8` → Home → Activity Card `★ Save` 클릭(저장 실패 Toast) → 측정.

| 측정 | 393×852 | 320×568 | 1회차 (결함 상태) |
|---|---|---|---|
| viewport class | `haru-toast-viewport haru-toast-viewport--tabbar` | 동일 | `haru-toast-viewport` (수식어 없음) |
| `inset-block-end` | **121px** | **121px** | 16px |
| Toast top / bottom | 693 / **743** | 409 / **459** | 786 / 836 |
| 탭바 top / bottom | **766** / 836 | **482** / 552 | 766 / 836 |
| 겹침 (toast.bottom − bar.top) | **−23px** | **−23px** | **+70px (50px 가림)** |
| 탭 3개 중심 `elementFromPoint` | Library·Home·Progress **전부 `.haru-tab-bar` 내부** | 동일 | 전부 `haru-toast …` |

**스택 화면 회귀도 직접 쟀다** — 보정을 하드코딩했다면 여기서 Toast 가 떠야 한다.

| 경로 | 측정값 |
|---|---|
| `/auth/reset-password?token=mock-reset-token` 성공 Toast | 수식어 **미부착** · `inset-block-end` **16px** · 화면 하단 간격 **16px** · 탭바 없음 |
| **탭 → 스택 실제 in-app 이동** (`/` Toast 띄운 상태에서 설정 진입) | 이동 직후 `/settings` 에서 수식어 **해제** · 16px · Toast 는 계속 열려 있음(ToastProvider 가 router 밖이므로 살아남는다) — 즉 **참조 수 해제가 실동작한다** |
| `/library/add` 등록 성공 → `/library` 자동 이동 | 스택 구간 16px → 탭 화면 정착 후 **121px** · 겹침 **−35px** · 탭 3개 전부 클릭 가능 |

> ⚠️ **1회차 방식의 함정을 기록한다.** 처음에 `history.pushState` + `PopStateEvent` 로 탭→스택 이동을 흉내 내 쟀을 때 *"스택인데 수식어가 남아 있다(121px)"* 로 보였다. 같은 프레임에서 읽어 **React 의 해제 렌더 전 상태**를 잰 것이었고, **실제 사용자 경로(링크 클릭)로 다시 재니 16px 로 정상**이었다. 인공 이동으로 잰 값을 결함으로 올리지 않았다.

**수단이 런타임으로 옮겨졌는지 확인** (approvals §26.3 의 요구):

| 층 | 통과 확인 |
|---|---|
| e2e 393px | `tabs.spec.ts:178` *"Toast 가 떠 있어도 탭 3개가 가려지지 않는다 (`QA-3-004`)"* ✅ 811ms · `tabs.spec.ts:248` *"탭바가 없는 화면의 Toast 는 보정 없이 하단 16 에 머문다 (역방향)"* ✅ 733ms — QA 가 실행 로그에서 **이름과 통과를 직접 확인**했다 |
| jsdom | `layouts.test.tsx` *"Toast 탭바 보정 배선 (`QA-3-004`)"* **5건 전부 통과** — `TabLayout`+`tabBar` 부착 / `tabBar` 없는 `TabLayout` 미부착 / `StackLayout` 미부착 / `FullscreenLayout` 미부착 / **탭→스택 전환 해제** |
| 소스 가드 | `stage3-css-guards.test.ts:78` 유지 + *"선언 존재만 증명한다"* 주석 |

**배선 지점 확인**: `TabLayout.tsx:42` `useToastTabBarInset(tabBar !== undefined)`. `router.tsx` 의 `TabLayout` 사용 **3곳(`/`·`/library`·`/progress`)이 전부 `tabBar={<AppTabBar />}` 를 넘기고**, 스택 화면은 `StackLayout` 이다 (`[QA 실행]` grep). `withTabBar` 를 넘기던 곳은 저장소에 **0건**이었고 지금도 0건이다.

---

### 11.3 `QA-3-005` (Medium) — Mock 이 `Idempotency-Key` 를 버렸다 → **PASS**

**판정 변화**: 1회차 `FAIL` → 2회차 **`PASS`**. 영향 AC: `AC-3-36` (+ `P3-BIP-22` 의 Frontend 부분).

**QA 가 Mock Adapter 를 직접 호출해 측정했다** (`[QA 실행]`). 구현자가 추가한 테스트를 증거로 쓰지 않고, 저장소 밖 1회성 vitest project(`--config` 로 주입, Product Code·기존 테스트 **무수정**)에서 `createMockLibraryApi` 를 조립해 호출했다. 측정 결과:

| # | 시나리오 | 측정값 | 판정 |
|---|---|---|---|
| ① | `addOwnBook` 같은 key + 같은 body | `firstId` = `replayId` = `89530a6d-…ccc6`, **응답 바이트 동일**, 요청 로그 `POST /v1/children/:childId/library/books` **2건** | ✅ 재생. 생성은 1회 — `idFactory` 가 두 번째 id 를 만들지 않았다 |
| ② | `addOwnBook` 같은 key + **다른 body** | `HaruApiError` · code **`IDEMPOTENCY_KEY_REUSED`** | ✅ |
| ③ | `addOwnBook` 다른 key | `secondId` = `ca615341-…a316` ≠ `firstId` | ✅ 별도 리소스 |
| ④ | `createGiftRequest` 가 같은 key 사용 | `giftId` = `d299de4c-…c304` ≠ `addId` | ✅ **보관함 분리** (섞이면 등록 응답이 증정으로 재생된다) |
| ⑤ | `createGiftRequest` 같은 key + 같은 body | 응답 바이트 동일 | ✅ 재생 |
| ⑥ | `createGiftRequest` 같은 key + 다른 body | **`IDEMPOTENCY_KEY_REUSED`** | ✅ |
| ⑦ | `library:retry` 1회차 실패 후 같은 key 재시도 | 1회차 throw, **2회차 성공** (`source: 'library_add'`, 정상 `LibraryBook`) | ✅ 실패는 미보관 — 재시도가 막히지 않는다 |

구현 확인: `MockLibraryApi.ts:190~191` 보관함 2개(`addBookIdempotency` · `giftIdempotency`), `:196~211` `replay()`, `:338~339`·`:432~433` **요청 로그 직후·시나리오 분기보다 앞**에서 판정, `:380`·`:453` 성공 시에만 보관. Stage 2 선례(`MockConsentApi` · `MockOnboardingApi`)와 같은 구조다.

구현자 테스트도 **이름과 통과를 직접 확인**했다 — `MockLibraryApi.test.ts` *"Idempotency-Key 보관·재생 (AC-3-36 · P3-BIP-22)"* **7건 전부 통과**. 신규 Error Code **0건**(`ERROR_CODES` 29종 유지, `error-envelope.test.ts` 통과) — `IDEMPOTENCY_KEY_REUSED` 는 기존 코드다.

---

### 11.4 `QA-3-006` (Low) — `P-23` dev gallery 등재 → **PASS**

**판정 변화**: 1회차 `FAIL` → 2회차 **`PASS`**.

| 검사 | 측정값 `[QA 실행]` |
|---|---|
| 토큰 소스의 활성 가값 | `grep -rn 'provisional' packages/design-tokens/src/` → `P-01 P-02 P-04 P-16 **P-23** P-24` (6건) |
| dev gallery 목록 | `provisionalItems.ts` → `P-01`~`P-17` + **`P-23`**(`:178`) + `P-24`(`:187`) |
| 미등재 차집합 | **0건** |
| ⚠️ `P-18`~`P-22` | **등재 대상이 아니다** — 토큰 자체가 없다. 1회차에 QA 가 approvals §21.5 기록을 정정한 내용이며, `provisionalItems.ts:173~175` 주석과 handoff §7 이 그대로 반영했다 |
| 활성 가값 고정 테스트 | `packages/design-tokens/__tests__/fonts.test.ts` + `provisional-registry.test.ts` 3건 통과 |

**재발 방지 가드가 실제로 무는지 확인했다** (`[QA 실행]`). Product Code 를 고치지 않기 위해, `provisional-registry.test.ts` 의 판정 로직(토큰 CSS `provisional: P-xx` 전수 ↔ gallery 목록 차집합)을 **실제 토큰 소스와 변조된 목록**에 그대로 적용했다:

```
inTokens            = ["P-01","P-02","P-04","P-16","P-23","P-24"]
missing (현재 상태)  = []            ← 통과
missing (P-23 등재 제거) = ["P-23"]   ← toStrictEqual([]) 위반 → 깨진다
```

→ **수단을 제거하면 깨진다.** 기존 `gallery-helpers.test.ts` 의 "지금 목록이 이것이다" 식 단정은 새 가값이 생겨도 알려주지 않았고(그래서 `P-23` 이 한 라운드 내내 빠져 있었다), 이번 가드는 **토큰 소스를 기준**으로 비교한다.

---

### 11.5 `QA-3-007` (Low) — handoff 정정 2건 → **PASS** / `QA-3-008`·`QA-3-009` 처리

**`QA-3-007`** 판정 변화: 1회차 `FAIL` → 2회차 **`PASS`**.

| 대상 | 2회차 확인 `[QA 실행]` |
|---|---|
| handoff **§3** | 표가 **①~⑩ 10건**이다. ⑩ = **캐릭터 버블 닫기(×) 버튼**(Figma `50:176` 없음, 승인 근거 approvals §13.4 `W-2` + `stage-3-home-handoff.md` §B2, 크기 40 유지). 표 아래에 *"⑩ 은 `QA-3-007` 로 추가되었다"* 경위까지 적혀 있다 |
| handoff **§9 ⑨** | 전제가 정정됐다 — *"⚠️ 이 칸의 전제가 틀렸다 … `ActivityCardDeck.tsx:49`(저장 실패)와 `AddOwnBookForm.tsx:68`(등록 성공)이 둘 다 Toast 를 띄운다"*. QA 가 `grep -rn 'useToast(' apps/web/src` 로 **호출 지점 3곳**(`ActivityCardDeck` · `AddOwnBookForm` · `ResetPasswordPage`)을 독립 확인했다 — 온보딩·설정 화면은 Toast 를 **마운트하지 않는다** |
| handoff **§7** | `S3-PROV-2` 가 *"대상은 `P-23` 1건"* 으로 정정되고 해소 표시됐다 |

**`QA-3-008`** (AC 문구 낡음) — **해소**. `[QA 실행]` 확인:

| AC | 정정된 문구 (`stage-3-plan.md`) | 구현 실측 |
|---|---|---|
| `AC-3-56` | `:628` — 신규는 `LibrarySectionKey`·`LibraryFilter`·`BookSource`, **29 → 32종**. `PushPlatform` 은 **Stage 4 이월**로 명시 | `enums.test.ts:252` `toHaveLength(32)` 통과 · `:21~22` 에 두 schema import · `:43~46` 주석이 29→32 경위 고정 → **일치** |
| `AC-3-59` | `:631` — `BOOK_ALREADY_OWNED` 1건 추가로 **29종** | `error-envelope.test.ts:14~17` `toHaveLength(29)` + 중복 0 통과 → **일치** |

→ 두 AC 는 **`PASS`**. 1회차가 AC-3-59 행에 적은 `QA-3-010` 은 **오타**이며 `QA-3-008` 이다 (QA-3-010 이라는 Finding 은 존재하지 않는다).

**`QA-3-009`** — **판정 대상에서 물러났다.** `stage-3-plan.md:584` 가 `AC-3-34` 를 취소선 + *"**폐기** (사용자 결정 2026-10-09, approvals §26.5)"* 로 갱신한 것을 확인했다. 근거는 대화 전용 세션 자체의 폐기(§12.12)이며, 배송 상태 표시는 `AC-3-33`·`AC-3-35` 가 덮는다.

**⚠️ 1회차 Summary 집계 오류를 정정한다** (`[QA 실행]` 자기 검증). 1회차 §1 은 `PARTIAL` 을 **3** 으로 적었으나, §4 Matrix 의 `PARTIAL` 행은 실제로 **6건**이었다 — `AC-3-34` · `AC-3-56` · `AC-3-59` (Finding 연결분 3건) + **`AC-3-78` · `AC-3-86` · `AC-3L-24`** (Finding 없이 PARTIAL 로 둔 3건). Summary 가 뒤쪽 3건을 세지 않았다. 이 누락 때문에 "`PARTIAL` 3건은 `QA-3-008`·`QA-3-009` 로 전부 해소된다" 는 추론이 성립해 보였으나, **실제로는 `AC-3-86`·`AC-3L-24` 2건이 남는다.** §1 표를 정정했다.

---

### 11.6 승인된 범위 초과 2건 — 부작용 검증  `[QA 실행]`

둘 다 **Orchestrator 승인분**이므로 Finding 으로 올리지 않았다. 지시받은 대로 부작용만 쟀다.

#### ① `packages/ui` 공개 API 변경 — `ToastProvider.withTabBar` prop 제거 + `useToastTabBarInset` export

| 검사 | 결과 |
|---|---|
| 깨진 사용처 | **0건.** `grep -rn 'withTabBar' packages apps e2e` → 남은 것은 **주석·테스트 설명 문자열뿐**이고 prop 전달 0건. `ToastProviderProps` 는 이제 `children` 단일 필드다 |
| **스택 화면 Toast 위치가 틀어졌는지** | **틀어지지 않았다.** `/auth/reset-password` 실측 **16px · 수식어 미부착**(§11.2 표). 탭→스택 **실제 in-app 이동**에서도 16px 로 해제 |
| 보정이 켜지는 조건 | `TabLayout.tsx:42` 가 **`tabBar !== undefined`** 일 때만 등록한다 → `tabBar` 없는 `TabLayout`(Stage 1 `/` 형태)에서도 켜지지 않는다. jsdom 5건 중 2건이 이 경우를 단정하고 통과 |
| Toast 를 띄우는 화면 전수 | `useToast()` 호출 **3곳** — `ActivityCardDeck`(탭) · `AddOwnBookForm`(스택→탭) · `ResetPasswordPage`(스택). **온보딩·설정 화면은 Toast 를 마운트하지 않는다** → 그 경로에 위치 변화가 생길 여지가 애초에 없다 |
| 참조 수(`tabBarCount`) 설계 | `ToastProvider.tsx:91`·`:150`. StrictMode 의 mount→unmount→mount 와 route 전환의 "새 Layout 마운트 + 옛 Layout 정리" 동시 커밋에서 boolean 이 뒤집히는 문제를 피한다 — jsdom "탭 화면에서 스택 화면으로 바뀌면 보정이 해제된다" 1건 + QA 의 실 이동 측정으로 양쪽 확인 |
| Stage 1·2 회귀 | `onboarding` 40 · `consent` 15 · `auth` 13 = **68 e2e 전건 통과** · Stage 2 단위(`onboarding-screens` · `home-settings` · `rework-css-guards`) 통과 · baseline **74종 바이트 동일**(`s2-*` 전부 포함) |
| 레이어 경계 | `lint:boundaries` **no violations**. `packages/ui` → `design-tokens` 외 의존 추가 없음 |

> 판단: 이 변경이 **같은 결함의 재발 경로를 없앤다**는 점은 측정과 일치한다 — 보정은 이제 "탭바를 렌더하는 지점" 이 소유하며, 넘길 자리가 없는 prop 이 남아 있지 않다.

#### ② `A11yPage` 대비 쌍 `C-5`(`P-23`, 1.72:1) + `provisional-registry.test.ts`

| 검사 | 결과 |
|---|---|
| **재발 방지 테스트가 실제로 무는지** | **문다.** 변조 시뮬레이션에서 `P-23` 등재를 제거하면 차집합이 `["P-23"]` 이 되어 `toStrictEqual([])` 가 깨진다 (§11.4). 세 번째 단정(`waiting` 인데 토큰 주석이 없는 항목 = `P-17` 하나)도 양방향 누락을 잡는다 |
| 시각 baseline 영향 | **0건.** a11y dev 페이지는 baseline 이 **없다**(`find e2e/__screenshots__ -iname '*a11y*'` → 0건). 전량 재생성에서도 74종 바이트 동일 |
| 가값 목록 테스트 | `gallery-helpers.test.ts` *"P-01 … P-17 + P-23 + P-24 를 제시한다"* · *"확정 12건 / 디자이너 대기 7건"* 통과 |
| Production 영향 | dev 전용 경로다. `assert:no-mocks` 가 `__HARU_DEV_SENTINEL__` · `haru-dev-` **0건**을 보증 |
| 1.72:1 수치 | A11yPage 규칙대로 **실제 렌더 결과에서 측정**하게 되어 있다. QA 는 Chromium 렌더 기준 수치 자체를 재검증하지 않았다 — `P-23` 은 **디자이너 대기 가값**이고 `rules/qa.md` §2 에 따라 FAIL 사유가 아니다 (§6 목록에 기록) |

---

### 11.7 2회차 Scope · Privacy 재확인  `[QA 실행]`

| 항목 | 결과 |
|---|---|
| Backend 코드 생성 | **0건.** `git ls-files` 결과를 `apps/api/` · `supabase/` 접두로 필터 → **0건**. `apps/` = `web` 하나, `packages/` = `config`·`contracts`·`design-tokens`·`ui` |
| 커밋 `80ee2be` 변경 파일 | 16개 — `packages/ui` 2 · `apps/web` 7(테스트 5 포함) · `e2e` 1 · `docs` 4. **`apps/api`·`supabase` 0** |
| 신규 `any` / `@ts-ignore` / `eslint-disable` | **0건** (`git show 80ee2be` 추가 줄 전수 — 걸린 것은 문서 문장뿐) |
| contracts 밖 schema 선언 | 변경 없음 (`packages/contracts` 미수정 — 커밋 파일 목록으로 확인) |
| Mock Data 하드코딩 | 변경 없음. IK 보관함은 **Adapter 인스턴스 내부 상태**이고 fixture 가 아니다 |
| 동의 전 아동 데이터 전송 | 1회차 PASS 유지 — `consent.spec.ts` 15건 + `MockLibraryApi.test.ts` 요청 로그 검사 통과 |

---

### 11.8 `BACKEND_INTEGRATION_PENDING` 최종 목록 (2회차)

**신규 11 + 갱신 1 = 12건**, 1회차와 **항목 수 동일**. 내용이 바뀐 것은 하나다.

| ID | 2회차 상태 |
|---|---|
| `P3-BIP-16` 책 평점 집계 | 유지 |
| `P3-BIP-17` 다회차 진행 (`plannedNights` 출처 미결) | 유지 |
| `P3-BIP-18` 서재 섹션 1회 조회 | 유지 |
| `P3-BIP-19` 표지 에셋 교체 게이트 (Stage 8 배포 전 필수) | 유지 |
| `P3-BIP-20` 커서 페이지네이션 | 유지 |
| `P3-BIP-21` `BOOK_ALREADY_OWNED`(409) | 유지 |
| **`P3-BIP-22`** IK **서버** 24h 보관·재생 | **갱신** — Frontend/Mock 부분이 `AC-3-36` **PASS** 로 바뀌어 `rules/qa.md` §1 조건 ③ 충족. 이제 **서버 보관·만료만** PENDING |
| `P3-BIP-23` 책별 Prompt 세트 | 유지 |
| `P3-BIP-24` 증정 요청 상태 전이 | 유지 (Frontend `AC-3L-24` **PARTIAL** — 6종 재현 시나리오 없음) |
| `P3-BIP-25` `purchaseUrl` 허용 도메인 | 유지 |
| `P3-BIP-26` `reason` 생성 책임 | 유지 |
| `P3-BIP-15` (갱신분) `SavedBook` 현행 유지 + read-after-write | 유지 |

**PENDING 으로 처리하지 않은 것**: `QA-3-001`(push 권한 — Frontend Port/Mock/contract 가 요구이므로 `FAIL`, 수용·이월) · `QA-3-002`(순수 Frontend `localStorage`) · `QA-3-003`(빌드 타임 Frontend). 상세는 §8.4.

---

### 11.9 남은 가값(provisional) — 2회차

**활성 6건: `P-01` · `P-02` · `P-04` · `P-16` · `P-23` · `P-24`.** 전부 dev gallery 등재 확인(2회차에 `P-23` 등재 확인으로 **차집합 0**). 해제 1건 `P-05`(scrim — 근거가 Figma 실측으로 바뀜). 수용 예외 `D-01`(Accent 버튼 흰 라벨 2.07:1) 유지. 상세는 §6.

가값은 `rules/qa.md` §2 에 따라 **FAIL 사유가 아니다.** Stage 0 `#10-4` 의 항목별 재제시는 이제 **6건 전부에 대해 성립한다** — 1회차에는 `P-23` 이 빠져 있어 성립하지 않았다.

---

### 11.10 Stage 4 Plan 에 올려야 할 이월 항목 (사용자 수용분)

approvals §26.1 — *"⚠️ 세 건은 Stage 4 Plan 에 In Scope 로 반드시 올린다. 이월은 삭제가 아니다"* `[문서 인용]`. QA 는 **재구현 여부를 묻지 않았고** 이월 사실만 기록한다.

| ID | Sev | Stage 4 Plan 에 올릴 In Scope | 영향 AC (Stage 3 판정 `FAIL` 유지) |
|---|---|---|---|
| **`QA-3-001`** | **High** | `shared/platform/pushPermission.ts` `PushPermissionPort`(`getStatus`·`request`·`getToken`) · Web 구현(`Notification.permission`) · 권한 사전 안내 UX · `push-permission-denied` 시나리오 · contracts `notification-preferences`/`push-devices` · **`PushPlatform` enum**(`AC-3-56` 의 원문 포함분) · adapter 선택 지점 1곳 | `AC-3-42` · `AC-3-43` · `AC-3-44` |
| **`QA-3-002`** | Medium | Activity Card **오프라인 캐시**(`D-11`) — 저장소 · `schemaVersion` 불일치/parse 실패/날짜 경과 폐기 · 로그아웃 삭제 · `offline-cached-card` 시나리오(캐시 카드 + Offline Banner 동시) | `AC-3-46` · `AC-3-49` (`AC-3-48` 은 공허 충족 상태) |
| **`QA-3-003`** | Medium | `D-4` 에셋 파이프라인 — AVIF + WebP + PNG fallback · `<picture>`+`srcset` · 해상도 상한(1440/696/360/216) · `pnpm assets:optimize`(`sharp`) 산출물 커밋 | `AC-3-51` (표지 에셋 교체 `P3-BIP-19` 와 함께 Stage 8 게이트) |

⚠️ Stage 4 Plan 작성은 **plan-agent** 소관이다. QA 는 `docs/plans/**` 를 수정하지 않았다.

---

### 11.11 2회차에서 QA 가 **직접 실행·측정한 것** vs **문서를 인용한 것**

| 구분 | 내용 |
|---|---|
| **`[QA 실행]` — 명령** | 8개 검증 명령 전부(§11.1) + `test:e2e --update-snapshots=all` 전량 재생성 + 대상 테스트 4파일 verbose 재실행(83 passed) + `git status`/`git diff`/`git show`/`git ls-files` |
| **`[QA 실행]` — 브라우저 실측** | Toast ↔ 탭바 기하·hit-test (393 · 320) · 스택 화면 Toast 위치(`/auth/reset-password`) · **탭→스택 실 이동 해제** · `/library/add` 성공 Toast 의 스택→탭 전이 — 모두 **QA 자작 Playwright 스크립트**(저장소 밖, 사용 후 제거) |
| **`[QA 실행]` — Mock 직접 호출** | `createMockLibraryApi` 를 QA 가 조립해 IK 7항목 측정(§11.3). 1회성 vitest project 를 `--config` 로 주입, Product Code·기존 테스트 **무수정** |
| **`[QA 실행]` — 변조 시뮬레이션** | `provisional-registry.test.ts` 의 판정 로직을 실제 토큰 소스 + 변조 목록에 적용해 **가드가 무는지** 확인(§11.4). Product Code 를 고치지 않기 위해 테스트 파일 변조 대신 **같은 로직을 외부에서 재현**했다 |
| **`[QA 실행]` — 정적 확인** | `withTabBar` 전수 grep · `useToast()` 호출 지점 전수 · `router.tsx` 의 `TabLayout`/`StackLayout` 사용 전수 · `provisional` 주석 ↔ gallery 목록 차집합 · enum/Error Code 총수 테스트 · baseline 74종 개수 |
| **`[문서 인용]`** | approvals §26 (수용 결정 · NV 유지 · Low 4건 처리) · handoff §3·§7·§9·§14 (수정 경위·설계 사유) · `stage-3-plan.md:584`·`:628`·`:631` (AC 문구 정정) · `rules/qa.md` §1~§3 (판정 규칙) |
| **증거로 쓰지 않은 것** | 구현자 handoff 의 *"실측했다"* 서술. §11.2·§11.3 의 수치는 **QA 가 다시 쟀다**. 구현자 테스트는 **이름·통과 로그를 직접 확인**한 범위에서만 보조 증거로 썼다 |

---

### 11.12 다음 라운드 안내 (2회차) — **이력. 3회차 §12 로 대체됨**

> ⚠️ 아래는 **2회차 시점의 안내**다. 그 뒤 사용자 결정(approvals §27)으로 차단 요인 4건이 모두 처리되어 **3회차 Verdict 는 `PASS (accepted: …)`** 다 (§1 · §12). 아래 2번의 두 경로 중 **`AC-3-86` 은 (B)**, **나머지 3건은 (A)** 로 끝났고, 그래서 2번이 예상한 `accepted:` 7건은 실제로 **6건**이 됐다 (`AC-3-86` 은 수용이 아니라 요구사항 축소 — §12.2).

1. **Stage Verdict 는 `INCOMPLETE` 다 — 다음 Stage 진입 불가** (`rules/workflow.md` §4).
2. `PASS` 로 가는 경로는 둘 중 하나다. **QA 가 고르지 않는다.**
   - **(A) 사용자 추가 수용** — `AC-3-86` · `AC-3L-24` · `NV-1` · `NV-2` 를 **항목별로 명시 수용**하면 `PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3-86, AC-3L-24, NV-1, NV-2)` 로 기록한다.
   - **(B) 잔여 항목 처리** — `AC-3-86` 은 **결정 공백**이다(`AC-3-34` 처럼 폐기·재정의 중 사용자 결정 필요, `docs/plans/**` 는 plan-agent 소관). `AC-3L-24` 는 **development-agent** 가 `GiftRequestStatus` 6종 fixture/시나리오를 추가하면 QA 가 실행으로 확인할 수 있다. `NV-1`·`NV-2` 는 §7 의 수동 절차(실기기 · 60fps 화면 녹화)가 필요하며 현재 환경에서는 수행할 수 없다.
3. **`QA-3-001`·`QA-3-002`·`QA-3-003` 은 Stage 4 Plan 에 In Scope 로 올라가야 한다** (§11.10). 이월은 삭제가 아니다.
4. 재검증 시 **항목 번호를 유지**하고 판정 변화를 §10 에 기록한다.

---

## 12. 최종 판정 3회차 — 커밋 `80ee2be` · 코드 변경 0 (2026-10-09)

> **대상 상태**: 2회차와 **같은 커밋**(`80ee2be`). 바뀐 것은 `docs/decisions/stage-3-approvals.md` §27(사용자 결정)과 `docs/plans/stage-3-plan.md:1041`(그 결정의 Plan 반영)뿐이다. `git status --porcelain` 이 검증 시작 시 **문서 3개만** 변경 상태였고 `apps/**`·`packages/**`·`e2e/**` 는 **무변경**임을 확인했다 (`[QA 실행]`).
> 3회차 과제는 **Verdict 산정 + 문서 반영 확인 + 기준선 재확인**이다. 새 Finding 발굴을 위한 전면 재감사는 하지 않았다. 수용·폐기된 7건의 재구현·재측정도 하지 않았다.

### 12.1 8개 명령 — 기준선 재확인  `[QA 실행]`

| # | 명령 | 결과 | 소요 | 숫자 | 기준선 대비 |
|---|---|---|---|---|---|
| 1 | `pnpm typecheck` | ✅ exit 0 | 8s | `tsc --noEmit` × 3 (root · e2e · workspace) | 일치 |
| 2 | `pnpm lint` | ✅ exit 0 | 8s | 0 problems | 일치 |
| 3 | `pnpm lint:boundaries` | ✅ exit 0 | 1s | **no dependency violations** (587 modules · 2072 dependencies) | 일치 |
| 4 | `pnpm test` | ✅ exit 0 | 33s | **1611 passed / 1611 · 117 files** | **기준선 1611 / 117 정확 일치** |
| 5 | `pnpm build` | ✅ exit 0 | 1s | `built in 640ms`, design-token 산출물 2종 | 일치 |
| 6 | `pnpm format:check` | ✅ exit 0 | 4s | — | 일치 |
| 7 | `pnpm assert:no-mocks` | ✅ exit 0 | 0s | `__HARU_MOCK_SENTINEL__` 0 · `__HARU_DEV_SENTINEL__` 0 · `haru-dev-` 0 (4파일) | 일치 |
| 8 | `pnpm test:e2e` | ✅ exit 0 | **6.0m (359s)** | **273 passed / 273 · 0 failed** | **기준선 273 정확 일치** |

- **`test:e2e` 는 단독 실행했다.** 1~7 이 **전부 끝난 뒤** 시작했고, 동시에 다른 Playwright·dev 서버 프로세스를 돌리지 않았다. 소요 **6.0분**은 정상 대역(4~6분)이며 **20분대 지연·허위 실패는 재현되지 않았다.**
- 코드 변경이 없으므로 **숫자가 기준선과 달라야 할 이유가 없고, 실제로 달라지지 않았다.** 기준선과 다른 결과는 **0건**이다.

#### 시각 baseline 스테일 검사 — 전량 재생성  `[QA 실행]`

```
pnpm test:e2e --update-snapshots=all        → 273 passed (6.1m / 367s, exit 0)   ← 단독 실행
git status --porcelain e2e/__screenshots__  → (빈 출력)
git diff --stat e2e/__screenshots__         → (빈 출력)
find e2e/__screenshots__ -name '*.png' | wc -l → 74
```

**baseline 74종 전량 재생성 후 변경 0바이트 — 스테일 0건.** 기본 `changed` 모드로는 드러나지 않는 오염(approvals §23.2 `frame-1024` dev 패널 유형)이 현재 없음을 **3회차에도 직접 확인**했다. 파일 수 74 도 2회차와 동일하다.

### 12.2 `AC-3-86` 재측정 — `PARTIAL` → `PASS`  `[QA 실행]`

사용자 결정(approvals §27.2)으로 **보호자 직접 입력 분기가 폐기**되어 판정 대상이 *"저장 대상 = 현재 보이는 옵션의 카탈로그 책(`bookId`), 스냅 위치가 바뀌면 대상도 바뀐다"* 로 **줄었다.** 2회차 PARTIAL 의 미충족 조건이 폐기된 분기 **하나뿐**이었으므로, QA 는 잔여 조건을 **자기 측정으로 다시 확인**했다.

| 측정 | 방법 | 결과 |
|---|---|---|
| ① 요청 payload = 보이는 카드의 책 | `pnpm vitest run apps/web/__tests__/home-stage3.test.tsx -t "Save" --reporter=verbose` → **8 passed**. `:644` 가 `expect(saves[0]?.payload).toStrictEqual({ target: { bookId: DECK_BOOKS[0]?.id } })` 를 단언하고 `PUT …/saved-books` 요청이 **1회**임도 같은 테스트가 고정 | **충족** |
| ② 스냅 위치가 바뀌면 대상도 바뀐다 | **QA 자작 Playwright 스크립트**(저장소 밖, 사용 후 제거). 393×852 · Mock `success` · 로그인 후 카드 3장 확인(`Where the Wild Things Are` · `The Most Magnificent Idea` · `Grumpy Monkey: Play All Day`) → `End` 로 스냅, live region `Option 3 of 3: Grumpy Monkey: Play All Day` → **3번째 카드의 Save 클릭** | 클릭 전 3장 모두 `Save`/`false` → 클릭 후 **3번째만** `Saved`/`aria-pressed=true`, 1·2번째는 `Save`/`false` **유지**. 저장 상태가 **덱 전역이 아니라 옵션 단위**다 → **충족** |
| ③ 바인딩 지점 | `apps/web/src/features/activity-card-deck/ui/ActivityCardDeck.tsx:126` — `save.toggle({ bookId: option.book.id, saved: !option.saved })` 가 `option` 단위로 닫힌다 | **충족** (보조 증거) |

⚠️ **1회차 증거 위치가 오기였다.** 1회차는 카탈로그 경로 근거로 `MockLibraryApi.test.ts:312`·`home.spec.ts:187` 을 적었는데, QA 가 그 줄을 직접 열어 보니 전자는 **`AC-3-36` Idempotency 블록**, 후자는 **`G-13` Save 토글 테스트**였다 — 저장 대상 단정이 아니다. 실제 단정은 `home-stage3.test.tsx:644` 다. 3회차에 §4.1 행을 바로잡았다. **판정을 올리면서 인용 위치를 검산한 결과다.**

⚠️ **Library 의 `userEnteredTitle` 은 폐기 대상이 아니다.** `packages/contracts/src/library/library-book.ts` 의 `userEnteredTitle` 과 `/library/add`(`FR-23`) 경로는 **그대로 남는다** — 폐기된 것은 **Activity Card 의 보호자 직접 입력 선택지**(`contracts/src/activity/option.ts:24`, `conversation_only` 폐기와 함께 사라진 `userEnteredBook`)뿐이다. `AC-3-30`·`AC-3-31`·`AC-3L-21` 은 3회차에도 **PASS 유지**다.

### 12.3 문서 반영 확인 4건  `[QA 실행]`

| 대상 | 위치 | 확인 결과 |
|---|---|---|
| **`AC-3-86`** | `docs/plans/stage-3-plan.md:1041` | ✅ **반영됨**. `~~보호자 직접 입력 옵션은 `title`(+`author?`)~~ → **이 부분만 폐기** (사용자 결정 2026-10-09, `approvals §27.2`)` + `contracts/src/activity/option.ts:24` 근거 + *"Library 의 `userEnteredTitle` 은 남는다"* 주의까지 기재. PENDING 칸의 `G-12` 미결 주석도 제거됨. `git diff docs/plans/stage-3-plan.md` 에서 **이 1줄만** 변경된 것을 확인 |
| **`AC-3-34`** | `docs/plans/stage-3-plan.md:584` | ✅ **반영됨**. ID·요구사항·검증 방법 전부 **취소선** + *"**폐기** (사용자 결정 2026-10-09, `approvals §26.5` `QA-3-009`)"* + 근거(`approvals §12.12` 대화 전용 세션 폐기) + 대체 커버(`AC-3-33`·`AC-3-35`) 기재 |
| **`AC-3-56`** | `docs/plans/stage-3-plan.md:628` | ✅ **반영됨**. `31종`·`PushPlatform` 포함 → **32종**, `PushPlatform` **Stage 4 이월**(`QA-3-001`), 신규 3종(`LibrarySectionKey`·`LibraryFilter`·`BookSource`) 명기 + *"결함이 아니라 AC 문구 문제"* |
| **`AC-3-59`** | `docs/plans/stage-3-plan.md:631` | ✅ **반영됨**. "신규 0건(28종 유지)" → **29종**, `BOOK_ALREADY_OWNED` 1건 추가 근거 기재 |

`AC-3-34`·`56`·`59` 는 2회차 시점에 이미 반영돼 있었고(2회차가 확인), 3회차 `git diff` 에서 **새로 바뀐 Plan 줄은 `:1041` 하나**다. 세 건은 현재 문서 상태를 다시 읽어 **유지됨**을 확인했다.

### 12.4 Scope · 작업 트리 재확인  `[QA 실행]`

```
git ls-files | grep -E '^(apps/api|supabase)/' | wc -l   → 0
ls apps                                                   → web
ls packages                                               → config contracts design-tokens ui
git status --porcelain                                    → docs 3개만 (approvals · plan · 이 리포트)
```

**Scope 위반 0건.** Backend 런타임 코드·`apps/mobile`(Stage 4) 생성 0건. QA 는 Product Code 를 수정하지 않았다 — 측정 스크립트는 저장소 밖 scratchpad 에 두고 사용 후 제거했으며, `dev` 서버도 측정 후 종료했다.

### 12.5 남은 가값(provisional) — 3회차

활성 **6건**: `P-01` · `P-02` · `P-04` · `P-16` · `P-23` · `P-24` — **변화 없음**(§6). `packages/design-tokens/__tests__/fonts.test.ts:157` 이 6종을 고정하고, 6건 전부 dev gallery 등재 완료(차집합 0, 2회차 확인). 해제: `P-05`. 수용 예외: `D-01` 유지.
approvals §27.7 — **Stage 0 `#10-4` 항목별 재제시가 6건 전부에 성립한다**(`S3-PROV-2` 해소). 재제시는 **Orchestrator 소관**이며 QA 가 수행하지 않는다. 가값은 `rules/qa.md` §2 에 따라 **FAIL 사유가 아니다.**

### 12.6 Stage 4 Plan 에 올릴 이월 항목 (변동 없음)

§11.10 과 동일하다. **이월은 삭제가 아니다** — Stage 4 Plan **In Scope** 로 올라가야 한다 (작성은 **plan-agent** 소관, QA 는 `docs/plans/**` 를 수정하지 않았다).

| ID | Sev | Stage 4 In Scope | Stage 3 판정 (유지) |
|---|---|---|---|
| **`QA-3-001`** | **High** | `PushPermissionPort`(`getStatus`·`request`·`getToken`) + Web 구현(`Notification.permission`) + 권한 사전 안내 UX + `push-permission-denied` 시나리오 + contracts `notification-preferences`/`push-devices` + **`PushPlatform` enum** + adapter 선택 지점 1곳 | `AC-3-42`·`43`·`44` **FAIL(수용)** |
| **`QA-3-002`** | Medium | Activity Card 오프라인 캐시(`D-11`) + `schemaVersion` 불일치·parse 실패·날짜 경과 폐기 + 로그아웃 삭제 + `offline-cached-card` 시나리오(캐시 카드 + Offline Banner 동시) | `AC-3-46`·`AC-3-49` **FAIL(수용)** (`AC-3-48` 은 공허 충족 상태) |
| **`QA-3-003`** | Medium | `D-4` 에셋 파이프라인 — AVIF + WebP + PNG fallback · `<picture>`+`srcset` · 해상도 상한(1440/696/360/216) · `pnpm assets:optimize`(`sharp`) 산출물 커밋 | `AC-3-51` **FAIL(수용)**. `P3-BIP-19`(표지 에셋 교체)와 함께 **Stage 8 게이트** |

추가로 Stage 4 이후에 남는 것:
- **`AC-3L-24`** (수용) — `GiftRequestStatus` `approved`·`delivered`·`cancelled`·`rejected` **4종은 화면 확인 없이 남는다.** fixture/시나리오를 추가하면 QA 가 실행으로 확인할 수 있다 (사용자가 수용을 택했으므로 Stage 3 차단 요인은 아니다)
- **`NV-1`** (수용) — 실기기가 확보되면 §7 절차로 Safari / iOS / Android 확인
- **`NV-2`** (수용) — 60fps 녹화 수단이 확보되면 §7 절차로 확인
- **`AC-3-22`~`26`** — Stage 3 Plan 이 이미 Stage 4 로 이월한 5건 (판정 대상 아님)

### 12.7 3회차에서 QA 가 **직접 실행·측정한 것** vs **문서를 인용한 것**

| 구분 | 내용 |
|---|---|
| **`[QA 실행]` — 명령** | 8개 검증 명령 **전부 재실행**(§12.1, `test:e2e` 단독) + `test:e2e --update-snapshots=all` **전량 재생성**(단독) + `git status`/`git diff`/`git ls-files` + `pnpm vitest run … -t "Save" --reporter=verbose`(8 passed) |
| **`[QA 실행]` — 브라우저 실측** | `AC-3-86` 옵션 단위 저장 바인딩 — dev 서버 `127.0.0.1:4319` 기동 후 **QA 자작 Playwright 스크립트**로 카드 3장 · `End` 스냅 · 3번째 카드 Save 클릭 · 3장 라벨/`aria-pressed` 전후 비교 (저장소 밖, 사용 후 제거, dev 서버 종료 확인) |
| **`[QA 실행]` — 전수 재집계** | §4.1·§4.2 **표 전 행 기계 추출 + 누락 22행 개별 확인 + 합 검산**(88 / 39). 1회차 집계 오류(approvals §27.1)의 재발을 막기 위한 절차다 |
| **`[QA 실행]` — 정적 확인** | `stage-3-plan.md:1041`·`:584`·`:628`·`:631` 4건 현재 문자열 직접 확인 + `git diff` 로 **변경된 Plan 줄이 `:1041` 하나**임을 확인 · `ActivityCardDeck.tsx:126` 바인딩 · `home-stage3.test.tsx:644`·`:714-721` 단정 위치 · 1회차 인용 위치 오기 2건 검산 · Scope grep |
| **`[문서 인용]`** | **approvals §27**(사용자 결정 — `AC-3-86` 부분 폐기 · 남은 3건 수용 · 가값 6건 · 이월 재확인) · approvals §26(1·5·6) · `rules/qa.md` §1~§3 (판정·Verdict·Severity 규칙) · `rules/workflow.md` §4 (Stage Gate) |
| **증거로 쓰지 않은 것** | 구현자 handoff 의 *"실측했다"* 서술 · Orchestrator 의 산식 제시 · **1회차가 적은 증거 위치**(검산 결과 2건이 오기였다 — §12.2) |
| **하지 않은 것** | 수용·폐기된 7건(`QA-3-001`·`002`·`003` · `AC-3L-24` · `NV-1` · `NV-2` + 폐기 `AC-3-34`·`AC-3-86` 부분)의 **재구현·재측정** · 새 Finding 발굴 목적의 전면 재감사 · Product Code 수정 · `docs/decisions/**`·`docs/plans/**`·`docs/design/**`·`.claude/rules/**` 수정 |

### 12.8 다음 단계

1. **Stage Verdict: `PASS (accepted: QA-3-001, QA-3-002, QA-3-003, AC-3L-24, NV-1, NV-2)`** — `rules/workflow.md` §4 에 따라 **다음 Stage 진입이 가능**하다. 단 **사용자 지시가 있을 때** 시작한다. QA 는 Verdict 보고 후 멈춘다.
2. **Orchestrator 할 일**: `PLANNING.md` 진행 상태 갱신 · 가값 6건 **항목별 재제시**(Stage 0 `#10-4`) · Stage 4 착수 지시 대기.
3. **Stage 4 Plan(plan-agent) 할 일**: §12.6 의 이월 3건을 **In Scope 로 등재**. `AC-3-22`~`26` 도 함께 다룬다.
4. **Stage 8 게이트로 남는 것**: `QA-3-003`(에셋 파이프라인) + `P3-BIP-19`(표지 에셋 교체 — 상용 그림책 표지 Mock 전용, 법무 확인).
5. 재검증이 다시 필요해지면 **항목 번호를 유지**하고 판정 변화를 §10 에 기록한다.
