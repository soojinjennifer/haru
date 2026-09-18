# Stage 1 Approval Log

사용자 결정 기록 (Orchestrator 작성). 항목 번호는 `docs/plans/stage-1-plan.md` §16 (D-1~D-10) 기준이며,
Stage 1-A 구현 이후 추가로 발생한 결정은 §2 (S1A-xx) 에 기록한다.
결정과 기존 문서 내용이 다르면 **이 기록이 우선**하며, 해당 문서는 결정 반영 시 갱신한다.
Stage 0 결정(#·C-·D-·P-·L- 계열)은 `docs/decisions/stage-0-approvals.md` 를 그대로 유지한다.

## 1. Stage 1 Plan §16 세부 결정 — 전부 승인 (O)

승인 일자: **2026-09-18, user** (Stage 1 Plan + Stage 1 Design Spec 승인 체크포인트, rules/workflow.md §3).
각 항목은 Plan §16 표의 **권장안 그대로** 확정되었다. 별도 수정·대안 채택은 없다.

| ID | 결정 항목 | 결과 | 확정 내용 (Plan §16 권장안) | 근거 |
|---|---|---|---|---|
| D-1 | import 경계 lint 도구 | **O 승인** | dependency-cruiser 단일 도구 + `.dependency-cruiser.cjs` 규칙 6종 + `pnpm lint:boundaries` | Plan §16 D-1 (사용자가 이번 세션에서 "dependency-cruiser 사용" 명시) |
| D-2 | Lucide 버전 고정 방식 | **O 승인** | `packages/ui` 에 정확 버전 `lucide-react` 고정 + lockfile 커밋 + root `pnpm.overrides` | Plan §16 D-2 |
| D-3 | Inter self-host 방식 | **O 승인** | `@fontsource-variable/inter` (variable, latin subset, woff2) 를 `packages/design-tokens` dependency로 추가, `@font-face` 는 `src/fonts.css` 단일 지점, preload 1개, 외부 CDN 미사용 | Plan §16 D-3 (사용자가 이번 세션에서 "Inter self-host" 명시) |
| D-4 | 이미지 최적화 포맷·해상도 (C-17) | **O 승인** | 벡터 SVG / 래스터 AVIF + WebP + PNG fallback, `<picture>`+`srcset`, 해상도 상한(1440 / 696 / 360 / 216), `pnpm assets:optimize` (devDependency `sharp`) 로 산출물 커밋, Stage 1 범위 = 정책·스크립트·SVG 파이프라인 | Plan §16 D-4 (사용자가 이번 세션에서 "sharp 추가" 명시) |
| D-5 | Mock scenario 전환 방식 | **O 승인** | 3계층 + 우선순위 (URL query > dev Scenario Panel > `VITE_MOCK_SCENARIO` > `success`), 주입 `clock`·`idFactory`·timer 로 결정성 확보 | Plan §16 D-5 |
| D-6 | Production 빌드의 Mock 처리 (OAQ-21) | **O 승인** | `VITE_API_MODE` = `mock` \| `http`, Mock은 동적 import 경계, sentinel + `pnpm assert:no-mocks` 로 `http` 빌드 산출물 검증 | Plan §16 D-6 |
| D-7 | Http Adapter 골격 작성 시점 (OAQ-20) | **O 승인** | 각 Stage에서 Mock과 동시에 작성. Stage 1은 `httpClient` + `HttpHealthApi` | Plan §16 D-7 |
| D-8 | 도메인별 `Mock<Domain>Api` 골격의 Stage 1 범위 | **O 승인** | Stage 1은 `health` 도메인만 완전 구현(레퍼런스) + 공통 helper 완성, 나머지 11개 도메인 stub 파일 생성 금지 | Plan §16 D-8 |
| D-9 | Component 테스트 DOM 환경 | **O 승인** | `jsdom` 기본, 성능 문제 관측 시 `happy-dom` 재검토 | Plan §16 D-9 |
| D-10 | Node LTS / pnpm / 라이브러리 버전 정책 | **O 승인** | **Plan §16.1 버전 표 전체가 승인 범위**에 포함된다 (아래 §1.1) | Plan §16 D-10 · §16.1 |

### 1.1 D-10 — §16.1 버전 표 승인 범위

- Plan `docs/plans/stage-1-plan.md` §16.1 의 **버전 표 전체**와 그 아래 **공통 원칙 1~5**가 승인되었다.
- 사용자가 이번 승인 세션에서 **명시적으로 확인한 항목**:
  - **Vitest 4.1.11** (major 5 미채택)
  - **React Router 8.4.0** (§16.1의 보수적 대안 `7.18.4` 는 채택하지 않음)
  - **sharp 추가** (devDependency, 에셋 최적화 스크립트 전용 — D-4)
  - **dependency-cruiser 사용** (import 경계 검증 — D-1)
  - **Inter self-host** (`@fontsource-variable/inter` — D-3)
- 나머지 행(Node.js, pnpm, TypeScript, typescript-eslint, ESLint, React/React DOM, TanStack Query, Zod, Vite, @vitejs/plugin-react, Tailwind CSS, @testing-library/react, jsdom, Playwright, lucide-react, Prettier, eslint-plugin-react-hooks)도 표에 기재된 권장 버전·고정 방식대로 승인되었다.
- §16.1 공통 원칙 5에 따라 **구현 착수 시점에 registry를 재확인**하고 차이가 있으면 Handoff 메모에 기록한다. 실제 설치된 고정 버전의 최종 기록 위치는 development-agent의 `docs/qa/stage-1-handoff.md` 다.

## 2. 2026-09-19 추가 결정 (Stage 1-A 구현 후 발견 항목)

Stage 1-A 구현 이후 발견된 항목(Finding **F-1~F-4**)에 대한 사용자 결정. 일자: **2026-09-19, user**.
**출처**: `docs/qa/stage-1a-handoff.md` — development-agent가 Stage 1-A 구현 후 작성한 인계 문서. F-1~F-4 는 그 문서의 Finding ID이며, 해당 문서는 후속 구현으로 갱신되어 **§11 이 신설**되었다.
이 결정들은 §1 의 승인 내용을 **뒤집지 않으며**, Plan §16 승인값은 그대로 유지된다.

| ID | 발견 항목 (출처 Finding) | 결정 | 근거 / 확인 |
|---|---|---|---|
| **S1A-1** | **F-1** (`docs/qa/stage-1a-handoff.md`) — Node 버전 고정의 실효성. pnpm 12가 루트 프로젝트의 `engines.node` 를 강제하지 않아 승인된 Node 고정이 실효 없음이 확인됨 (Node v24.16.0 환경에서 `pnpm install --frozen-lockfile` 이 exit 0 으로 통과) | **preinstall 가드 스크립트 추가 + 로컬 Node를 24.21.0 으로 업그레이드.** 승인값(`.nvmrc` = `24.21.0`, `engines.node` = `">=24.21.0 <25"`)은 **변경하지 않는다**. Node 업그레이드는 **사용자가 직접 수행**하며 **Stage 1-B의 선결 조건**이다 | Plan §16.1 D-10 (Node 행) · §9.0 루트 구성. 실행 확인 2026-09-19 |
| **S1A-2** | **F-3** (`docs/qa/stage-1a-handoff.md`) — `eslint-plugin-jsx-a11y` 가 Plan §9.1 에서 "선택"으로만 표기되어 도입 여부가 미확정 | **도입 승인.** §16.1 버전 표에 없던 **신규 devDependency** 이며, 실제 고정 버전은 **development-agent가 Handoff 문서에 기록**한다 | Plan §9.1 (`eslint/react.js` — "react-hooks, jsx-a11y(선택)") · rules/frontend.md §9 접근성. 결정 2026-09-19 |
| **S1A-3** | **F-2** (`docs/qa/stage-1a-handoff.md`) — root script `install`. npm/pnpm에서 `install` 은 설치 라이프사이클 훅이므로 root script로 정의하면 재귀 호출이 된다 | **Plan §9.0 문구를 수정**하고 **코드는 현 상태 유지**. `pnpm install --frozen-lockfile` 은 pnpm **내장 명령**으로 정상 동작함이 확인되었으며, rules/qa.md §4 가 참조하는 명령 자체는 그대로 유효하다 | Plan §9.0 root scripts 목록 · rules/qa.md §4. 확인·결정 2026-09-19 |
| **S1A-4** | **F-4** (`docs/qa/stage-1a-handoff.md`) — Plan 머리말이 참조하는 `docs/decisions/stage-1-approvals.md` 파일이 저장소에 없음 | **이 문서(`docs/decisions/stage-1-approvals.md`)의 생성 승인** | Plan 머리말 Status 줄의 참조. 결정 2026-09-19 |

### 2.1 구현 확정 사실 (2026-09-19, development-agent 구현 완료 · 사용자 재검증)

S1A-1 · S1A-2 의 결정이 구현으로 확정된 내용. 상세는 `docs/qa/stage-1a-handoff.md` §11.

| 대상 | 확정 사실 | 알려진 제약 / 동작 특성 |
|---|---|---|
| **S1A-2** — `eslint-plugin-jsx-a11y` | 고정 버전 **`^6.10.2`** (`packages/config` devDependency, 2026-09-19 registry latest) | 이 플러그인의 peer 범위가 `eslint ^9` 까지라 **ESLint 10 에서 peer 경고 1건**이 발생한다. 실동작은 음성 테스트로 확인됨 (alt 없는 `img`, `onClick` 만 있는 `div` 등에서 규칙 정상 발화) |
| **S1A-1** — preinstall 가드 | **`scripts/check-node-version.mjs`** 를 루트 `package.json` 의 `preinstall` 로 연결. `engines.node` 를 읽어 판정하므로 **버전 하드코딩 없음**, 외부 semver 의존 없음, 우회 옵션 없음 | pnpm 12 는 `node_modules` 가 이미 최신이면 설치 작업과 함께 `preinstall` 도 **건너뛴다**. 따라서 가드는 실제 설치가 발생할 때(fresh clone, lockfile 변경, `--force`, `node_modules` 부재) 발화한다 |

## 3. 반영 상태

- `docs/plans/stage-1-plan.md` §9.0 root scripts 목록: S1A-3 반영 — 나열에서 `install` 제거 + 내장 명령 주석 추가 (2026-09-19)
- `docs/plans/stage-1-plan.md` 머리말 Status 줄: 이 문서 참조가 실제 파일을 가리키며 §2 추가 결정(S1A-1~S1A-4)이 여기에 기록되었음을 명시 (2026-09-19)
- S1A-1 preinstall 가드 스크립트: **구현 완료** (`scripts/check-node-version.mjs` — §2.1). 로컬 Node 24.21.0 업그레이드는 **Stage 1-B 선결 조건**이며 사용자가 직접 수행
- S1A-2 `eslint-plugin-jsx-a11y` 고정 버전: **확정 `^6.10.2`** (§2.1, 출처 `docs/qa/stage-1a-handoff.md` §11)
