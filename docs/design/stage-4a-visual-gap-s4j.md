# Stage 4a `S4-J` Visual Gap 검토

Status: **DRAFT (2026-10-15, design-agent)** — 허용 차이 등록 없음(사용자 승인 사항)
Based on: Figma `26:21`(Home frame) · `163:2649`(Prompt Card/Home front) metadata 직접 조회, `search_design_system` (banner/offline) 2026-10-15 · `docs/qa/stage-4a-handoff.md` `S4-J` 절 · Stage 1 Design Spec §5.4 · Stage 3 Design Spec §8 · Stage 4 Design Spec §7 ④ `C13-8` · `stage-3-approvals.md` `D-3`·`D-10`·`D-11`·§12.8

## 0. 측정 방법 (무엇을 어떻게 쟀는가)

- dev 서버(`127.0.0.1:4377`, 별도 포트 — 다른 Playwright 동시 실행 0 확인) + Playwright Chromium 단독 스크립트(scratchpad, 저장소 e2e 미수정). `deviceScaleFactor 1`, `reducedMotion: reduce`.
- 로그인 경로 = e2e `logIn()` 과 동일(`/auth/log-in?scenario=activity-cards:offline-cached-card`). 비교군 = 시나리오 없음(`success`).
- 뷰포트: 393×852 · 320×852 · 320×568 · 600×900. 기하는 `getBoundingClientRect`, 스타일은 **computed style**(선언값 확인 — R-FIGMA-1). 토큰은 `packages/design-tokens/src` 정의를 grep 으로 대조.
- 스크린샷: `docs/design/stage-4a-visual-gap-s4j/*.png` (dev Scenario Panel `scenario` 버튼이 함께 찍혀 있다 — dev 전용, 검토 대상 아님. baseline 아님).
- Figma: Banner/Alert/Offline 컴포넌트는 HARU 라이브러리·Design Guide 에 **0건**(검색 결과는 외부 Community 라이브러리뿐). 배너는 Stage 1 §5.4 명세(#22) 가 유일한 근거다 → 배너 자체는 **Figma 실측 대상 노드가 없다.**

## 1. 실측 요약

### 1.1 배너 (393×852, `offline-cached-card`)

| 항목 | 명세 (Stage 1 §5.4) | 구현 (computed) | 판정 |
|---|---|---|---|
| 컴포넌트 | `InlineAlert tone=offline placement=banner` | 동일 (`.haru-alert--offline.haru-alert--banner`) | 일치 |
| 위치 | TopBar 바로 아래, 앱 컬럼 폭, sticky `--z-sticky` | top 48 = 헤더 하단 48 · x 24–369(컬럼 콘텐츠 폭 345) · `.haru-app-shell__bar-top`(sticky, z 10) 안 | 일치 |
| 색 | `--color-surface-note` / `--color-fg-primary` / border `--color-border-subtle` | `rgb(240,238,230)` / `rgb(74,95,92)` / `1px rgba(94,115,112,.18)` — 토큰 경유 확인 | 일치 |
| 아이콘 | Lucide `wifi-off`, `--size-icon-md` | `wifi-off`, md | 일치 |
| 수동 닫기 | 없음 | dismiss 미전달 → 없음 | 일치 |
| 접근성 | `role=status` `aria-live=polite`, 포커스 이동 없음 | 동일 | 일치 |
| 모션 | 높이 0→auto + fade, `--motion-duration-fast` | opacity fade 만 | **G-05** |
| 그림자 | (없음) | `box-shadow: none` | — |
| 크기 | — | 393: h 94 · 320: h 112(본문 3줄) | **G-01** 참조 |

### 1.2 화면 구성 변화 (배너 유무 비교)

| 뷰포트 | 요소 | `success` | `offline-cached-card` | Δ |
|---|---|---|---|---|
| 393×852 | 버블 top | 51 | 145 | +94 |
| 393×852 | 캐릭터 img top | 29 | 123 | +94 |
| 393×852 | 카드 top / bottom | 296 / 705 | 296 / 705 | 0 (하단 고정) |
| 393×852 | 캐릭터 가시 높이(카드 위) | 267 | 173 | −94 — **얼굴 하반부가 카드 뒤로** |
| 320×568 | 카드 top | 139 | 251 | +112 (스크롤 길이 695→807) |
| 320×568 | 스크롤 후 고정 영역 | 헤더 48 | 헤더 + 배너 **160 (뷰포트의 28%)** | +112 |
| 600×900 | 카드 | 344 | 344 | 0 (393 과 같은 양상) |

### 1.3 R-SHADOW-1

- 배너: `box-shadow: none`. `overflow ≠ visible` 조상 = AppShell 뷰포트(`overflow-y-auto`, padding 0) 1개 — 배너 박스 24–369 가 0–393 안이라 **클립 없음**. 배너 border 4변 렌더 확인(스크린샷).
- 배너 삽입이 트랙 overflow 박스를 바꾸지 않았다: `.haru-activity-track` `overflow-x auto / overflow-y hidden`, padding `24 14 80`, margin `-24 -24 -80` — `success` 와 동일, 카드 좌표 동일(393·320×852·600).
- 버블 그림자(`0 6px 4px` 아래 방향)와 배너 하단 사이 3px — 버블 그림자는 위로 번지지 않아 배너와 겹치지 않는다(기존 헤더↔버블 간격 3 과 같다).
- 트랙 위쪽 inset 24 ↔ 카드 그림자 위 번짐(R-SHADOW-1 기록 실측 22) 은 Stage 3 기존 조건이며 `S4-J` 가 바꾸지 않았다.
- **판정: `S4-J` 로 인한 그림자 클리핑 없음.**

### 1.4 `<picture>` 전환 표본

| 방법 | 결과 |
|---|---|
| 디코드 비교(`sharp`, 4 마스터 × avif·webp ↔ png, RGBA 전 픽셀) | **diff 0** (8쌍 전부, 치수 동일) |
| 브라우저 프레임 비교(393×852 Home, 같은 페이지에서 `<source>` 제거로 png/webp 강제) | 노이즈 대조: 무변경 재촬영 0px · 같은 avif 재할당 34px(주간 칩 backdrop 재래스터, y 28–33). avif↔png **2,683px**, avif↔webp **4,072px**, 칩 노이즈 15px 외에는 **전부 채널당 ≤ 5** · 영역 = 캐릭터 + 그 위 카드 glass |
| 기존 baseline | `git status e2e/__screenshots__` 변경 0 |

→ "픽셀 변화 0" 은 **파일 디코드 수준에서 참, 브라우저 렌더 수준에서는 채널당 ≤5 의 비가시 차이**(Chromium 디코드 경로 차이로 추정 — 원인 토글 미실시). `VISUAL_THRESHOLD_*` 0.02(≈5.3) 바로 아래라 baseline 이 통과한다. **G-08**.

## 2. Gap 목록

| Gap ID | 위치 | Figma / 명세 값 | 구현 값 | 심각도 | 권고 | 사용자 승인 |
|---|---|---|---|---|---|---|
| **G-01** | Home `offline-cached-card` — 배너가 흐름 안에서 스테이지(버블·캐릭터)를 밀어낸다 | Figma `26:21`: 헤더 → 버블 `261:1293`(y107) → 캐릭터 `26:22`(y85, 얼굴이 카드 위로 보이는 구성). 배너 상태는 Figma 없음 — Stage 1 §5.4 는 "TopBar 바로 아래" 만 정하고 스테이지와의 관계는 미정 | 393×852: 버블·캐릭터 +94, 카드는 고정 → 캐릭터 얼굴 하반부가 카드 뒤로 가려짐(눈만 보임). 320×568: 카드 +112, 스크롤 시 헤더+배너 160px 상시 고정 | **Medium** (Figma 주요 구성의 상태별 훼손) | 선택지 — ⓐ 현행 유지(밀어냄 수용) ⓑ **배너를 1줄로 축약**(제목만 또는 제목+짧은 본문, 높이 약 52 — 토큰 `--space-*`·`subheadline` 내) 해 변위를 줄인다 ⓒ 배너가 버블 자리를 **대체**(오프라인 동안 버블 숨김) — Figma 에 없는 구성 변경 ⓓ 배너를 스테이지 위 오버레이로(흐름 미점유) — 버블을 가린다. **design-agent 권고: ⓑ** (명세 범위 안, Figma 구성 훼손 최소). ⓒⓓ 는 Figma 에 없는 배치라 최우선 규칙 2 대상 | **필요** |
| **G-02** | `Start Session` / `★ Save` 의 오프라인 처리 | Stage 3 Spec §8: "선택 CTA `disabled` + 사유 문구" | `Start Session` 은 `D-3` 하드코딩 `aria-disabled` 로 **우연히** 비활성 · `copy.card.startSession.reason = null` · `aria-describedby` 없음 → **오프라인 사유 문구 0**. `★ Save` 는 활성(탭 시 요청 실패 Toast) | **Medium** (명세 미충족 + `S4-F` 가 `D-3` 을 풀면 오프라인에서 활성화되는 **회귀 위험**) | ① 오프라인-캐시 상태 전용 사유 슬롯을 두고 `aria-disabled` + `aria-describedby` 로 연결(시각 문구는 배너가 담당하므로 화면에 새 텍스트를 추가하지 않는 안 — 아래 §3 B). ② `S4-F` 수용 기준에 "`offline-cached-card` 에서 Start Session 비활성 유지" 를 명시(plan-agent 반영 대상). ③ `★ Save` 는 명세의 "선택 CTA" 에 포함되는지 **불명** — 활성 유지(실패 Toast) vs 동일 비활성 중 결정 | **필요** (③ Save 범위, ① 문구) |
| **G-03** | 배너 문구 | 명세 없음(Stage 1 §5.4 범용 문구 "You're offline. We'll reconnect automatically.") | 제목 `You're offline.` / 본문 `This is your most recent card. It will update when you're back online.` | **Low** (문구) | §3 권고안 | **필요** (문구 승인) |
| **G-04** | 캐시 날짜 표시 (`D-10` ③) | Stage 3 Spec §8 `offline-cached-card` 행: "캐시 날짜가 오늘이 아니면 카드 날짜를 밝힌다(`CONFIRMED (D-10)` ③)" | 미구현. 화면에 날짜 문자열 0 (실측) | **Info — 명세 정정 대상, 구현 Gap 아님** | **구현자 주장 확인됨**: Figma `26:21` 자식(텍스트 `26:39` HARU · `26:43` "2week /115 Min" 뿐)과 카드 `163:2649`(Cardtitle=역량 배지 · 책 제목/저자/설명 · Prompt ×4 · Button) 에 날짜 슬롯 **없음**. 또한 ③ 은 **이미 사용자 결정으로 철회**되었다 — `stage-3-approvals.md` §12.8 (2026-10-05) "`AC-3-11` 폐기 … ③ 은 철회". Stage 3 Spec §8 행이 이 철회를 반영하지 못한 **스테일 명세**다. 권고: 날짜 표시 구현하지 않음 · Stage 3 Spec §8 해당 구절에 철회 표기(design-agent 문서 정정 — 지시 시 수행) · 날짜를 말하지 않는 대신 배너 문구가 "오늘 카드" 라고 암시하지 않게 한다(§3) | 불필요 (기결정). Spec 정정 실행 여부만 지시 |
| **G-05** | 배너 등장 모션 | 높이 0→auto + fade, `--motion-duration-fast` | opacity fade 만(높이 전환 없음 → 스테이지가 한 프레임에 94px 점프) | **Low** | G-01 결론 후 함께 처리. reduced-motion 은 명세대로 즉시 표시(일치) | 불필요 (명세 이행) |
| **G-06** | 배너 자체 sticky offset | Stage 1 §5.4 sticky | `.haru-alert--banner { position: sticky; top: var(--topbar-height) /*40*/ }` 이 `.haru-app-shell__bar-top`(이미 sticky) 안에 있어 **무효**. 값 40 은 Home 헤더 실측 48 과도 다르다 | **Low** (현재 시각 영향 0) | 배너를 bar-top 밖에 둘 일이 생기면 8px 겹침 위험 — 그때 정리. 지금은 기록만 | 불필요 |
| **G-07** | 스크롤 시 배너 모서리 (320×568) | — | bar-top 배경 투명 + 배너 `--radius-surface` 22 → 스크롤된 카드가 배너 둥근 모서리 바깥과 헤더 밴드 뒤로 비친다 (`320x568-cached-scrolled.png`) | **Low** | 헤더 투명은 Stage 3 기존 거동(Figma 헤더 배경 없음). 배너 고유 문제 아님 — G-01 ⓑ 로 높이가 줄면 영향도 준다. 별도 조치 권고 없음 | 불필요 |
| **G-08** | 캐릭터 `<picture>` (AVIF/WebP) | 픽셀 동일 주장 | 디코드 diff 0 / 브라우저 렌더 채널당 ≤5 (§1.4) | **Info** | 시각 Gap 아님. 단 차이가 임계값(≈5.3) **바로 아래**다 — 손실 인코딩(`QUALITY` 변경) 시 반드시 baseline 재생성 절차(R-BASELINE-1 §5 원인 분해) 를 따른다. handoff 의 "픽셀 변화 0" 서술은 "디코드 동일, 렌더 ≤5/255" 로 정정 권고 | 불필요 |

**미검증 (NOT VERIFIED)**: 온라인 복구 시 배너 자동 해제 + 재조회(§5.4 "해제") — Mock 시나리오가 고정 offline 이라 전환 재현 불가. `navigator.onLine` 토글 경로는 이번 측정에 포함하지 않았다.

## 3. 배너 문구 권고안 (G-03 · G-02 · G-04 연동)

원칙: 진단·판정 없음, 기기/연결 상태만 기술, "오늘" 을 단정하지 않음(캐시는 최대 1일 전 카드 — `D-11`, `D-10` ③ 철회로 날짜를 밝히지 않으므로), 할 수 없는 행동을 짧게 알림.

| 안 | 제목 | 본문 | 비고 |
|---|---|---|---|
| **A (권고)** | `You're offline.` | `Showing the last card we saved. It'll refresh when you're back online.` | "most recent" → "last … saved" 로 출처(기기 저장)를 밝혀 오늘 카드로 오인하지 않게 함. 2줄(393) |
| B (G-02 결합) | `You're offline.` | `Showing the last card we saved. You can start a session once you're back online.` | 배너가 CTA 비활성 사유를 겸한다 → Start Session `aria-describedby` 가 배너 본문 id 를 가리키면 화면 텍스트 추가 0 |
| C (G-01 ⓑ 1줄) | `Offline — showing your last saved card` | (없음) | 높이 최소화. 세션 불가 사유는 CTA 의 visually-hidden 사유(`Connect to the internet to start a session.`)로 |

현행 문구도 금지 표현은 없다. 권고 사유는 "most recent card" 가 오늘 카드처럼 읽히는 점과 G-01·G-02 와의 결합이다.

## 4. 사용자 결정 필요 항목

1. **G-01** 배너가 스테이지를 밀어내는 구성 — ⓐ 유지 / ⓑ 1줄 축약(권고) / ⓒ 버블 대체 / ⓓ 오버레이
2. **G-02** ① 오프라인 사유 문구 연결 방식(§3 B 또는 C) ② `★ Save` 오프라인 비활성 여부 ③ `S4-F` 에 "오프라인 캐시 상태에서 Start Session 비활성 유지" AC 추가(plan-agent)
3. **G-03** 배너 문구 — §3 A / B / C 또는 현행
4. **G-04** Stage 3 Design Spec §8 `offline-cached-card` 행의 ③ 철회 표기 실행 지시 (결정 자체는 §12.8 로 기결)

## 5. development-agent 메모 (승인 후)

- G-01·G-03 결정 전 `offline-cached-card` 시각 baseline 을 만들지 않는다(handoff 판단 유지 — R-BASELINE-1).
- G-02 는 `D-3` 해제(`S4-F`) 와 같은 패스에서 처리해야 오프라인 활성 회귀가 생기지 않는다. 테스트: `offline-cached-card` 에서 `Start Session` `aria-disabled="true"` + 접근성 설명 존재 단정.
- G-05 높이 전환은 Shared UI(`InlineAlert` banner) 수준 변경 — 다른 화면 배너(`offline`·`offline-queued`)에도 적용된다.
