# HARU QA Rules (Frontend-only Scope)

stage-qa-agent의 판정 기준과 검증 체크리스트. 상세 절차는 `.claude/agents/stage-qa-agent.md`.

## 1. Requirement 판정

| 판정 | 조건 |
|---|---|
| `PASS` | QA가 직접 실행한 증거로 충족 확인 |
| `PARTIAL` | 일부 충족, 누락 조건 명시 |
| `FAIL` | 미충족 또는 결함 재현 (Contract 또는 Mock 구현 자체의 오류 포함) |
| `NOT VERIFIED` | Frontend 범위인데 환경·기기·도구 부족으로 미검증 — 이유와 수동 절차 명시 |
| `BACKEND_INTEGRATION_PENDING` | 요구사항 충족에 실제 Backend 구현이 필요해 Frontend 단계에서 검증할 수 없는 부분 |

- PASS는 증거 필수. 코드 존재만으로 PASS 금지. 구현자의 handoff 메모는 증거가 아니다.
- `BACKEND_INTEGRATION_PENDING` 조건:
  1. 해당 요구사항의 **Frontend 부분**(UX, Contract 호출, Mock 시나리오)은 별도 항목으로 PASS/FAIL 판정되어 있어야 한다.
  2. 대기 사유(서버 측 동의 강제, RLS, Retention Job, 실제 Storage, STT/AI, push 발송 등)와 Handoff 문서 대상이 기록되어야 한다.
  3. Contract가 요구사항을 표현하지 못하거나 Mock이 Contract와 다르면 PENDING이 아니라 `FAIL`.
- `BACKEND_INTEGRATION_PENDING` 항목만으로 Stage를 FAIL 처리하지 않는다.

## 2. Stage Verdict

| Verdict | 조건 |
|---|---|
| `PASS` | In Scope 항목이 모두 `PASS` 또는 `BACKEND_INTEGRATION_PENDING` |
| `FAIL` | `FAIL` ≥ 1 |
| `INCOMPLETE` | `FAIL` 0, `PARTIAL` 또는 `NOT VERIFIED` ≥ 1 |

- Stage Verdict `PASS` 전에는 다음 Stage로 진행하지 않는다.
- `INCOMPLETE` 는 PASS가 아니다. 사용자가 잔여 항목을 항목별로 명시 수용한 경우에만 `PASS (accepted: …)` 로 기록한다 [승인 2026-09-14, Stage 0 #25].
- 사전 수용 예외(`docs/decisions/stage-0-approvals.md` §3, D-xx)는 요구사항 판정은 `FAIL` 로 기록하되 Stage Verdict 계산에서는 사용자 수용 항목으로 처리해 `PASS (accepted: D-xx)` 로 기록한다. 수용 범위를 벗어난 부분은 일반 규칙으로 판정한다.
- 가값(`docs/decisions/stage-0-approvals.md` §4, P-xx)은 FAIL 사유가 아니다. QA 리포트에 남은 가값 목록을 기록한다.
- In Scope 판단은 승인된 Stage Plan 기준이며, Out of Scope 구현(선행 구현, Backend 구현)은 `FAIL` Finding이다.

## 3. Severity

| Severity | 기준 |
|---|---|
| Critical | 동의 없이 아동 데이터 전송, Secret 노출, 녹음 유실, Backend 코드 작성(Scope 위반) |
| High | P0 요구사항의 Frontend 부분 미충족, 핵심 플로우 차단, Mock/Contract 불일치 |
| Medium | 부분 기능 결함, Figma 주요 불일치, 상태 화면·Mock 시나리오 누락 |
| Low | 경미한 시각 차이, 문구 |

## 4. 공통 실행 명령

Stage 1에서 확정된 root script를 사용한다 (pnpm — 승인 2026-09-14).

```
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e   # Playwright (스크립트 이름은 Stage 1에서 확정)
```

실행하지 못한 명령은 `NOT VERIFIED` 로 기록한다.
E2E · 시각 비교(구현 screenshot ↔ Figma screenshot) 도구는 **Playwright** 다 (승인 2026-09-14). Stage 1에서 설치·설정되기 전까지 해당 항목은 `NOT VERIFIED` 로 기록한다.

## 5. 체크리스트

### Scope
- [ ] `apps/api/`, `supabase/` 및 Backend 런타임 코드가 생성되지 않았다 (파일 목록 증거)
- [ ] Stage Plan의 모든 In Scope ID와 AC에 판정이 있다
- [ ] Out of Scope 기능이 구현되지 않았다

### Contract / Mock
- [ ] API 타입이 `packages/contracts` 외부에 중복 선언되지 않음
- [ ] Mock Adapter 요청·응답이 contracts schema parse 통과 (테스트 증거)
- [ ] 필수 시나리오 재현: SUCCESS / LOADING / EMPTY / ERROR / RETRY + 해당 Stage의 HARU 특화 시나리오
- [ ] 허용되지 않은 전이·잘못된 입력 → contracts error code
- [ ] Mock Data가 Component / Page / Feature에 하드코딩되지 않음 (grep 증거)
- [ ] Adapter 선택 지점이 한 곳이며, Component가 Adapter를 직접 호출하지 않음

### Figma / Design System
- [ ] 대상 화면 Figma screenshot과 Playwright 구현 screenshot 비교 (Playwright 설정 전에는 NOT VERIFIED)
- [ ] 임의 HEX / arbitrary Tailwind value / inline 수치 신규 사용 없음 (grep 증거)
- [ ] Variant / State가 Design Spec과 일치

### Architecture / Type Safety
- [ ] 레이어 역방향 import 없음, feature 간 직접 import 없음
- [ ] Page에 API 호출 / AI / Recording / 복잡한 로직 / Mock Data 없음
- [ ] `tsc --noEmit` 통과, 신규 `any` / `@ts-ignore` 없음

### State 화면
- [ ] Loading / Empty / Error
- [ ] Offline / Permission Denied / Retry / Pending / Not Eligible (해당 시)

### Responsive / Accessibility
- [ ] breakpoint별 레이아웃 (320 / 600 / 1024px, 앱 컬럼 최대 480px 가운데 정렬)
- [ ] 대비 AA, 터치 타깃, 포커스 표시, 접근성 이름

### Privacy (Frontend 검증 가능 항목)
- [ ] 동의 기록 전 아동 데이터가 Contract로 전송되지 않음 (Mock 요청 로그 증거)
- [ ] 동의 없음 시나리오에서 녹음 시작 UI 차단
- [ ] 세션 녹음 삭제 / 로그아웃 시 로컬 녹음·캐시 정리
- [ ] 콘솔·에러 로그에 PII / Transcript 원문 없음
- [ ] 광고·제3자 분석 SDK 없음
- [ ] 번들 / `VITE_*` / 저장소에 Secret 없음 (grep 증거)

### Privacy / Security (BACKEND_INTEGRATION_PENDING 대상 — Handoff 등록 여부만 확인)
- [ ] 서버 측 동의 강제, Consent History
- [ ] RLS, private Storage, signed URL
- [ ] Raw Audio 90일 삭제 (Storage 객체 포함), 세션별·전체 삭제 처리
- [ ] Audit Log, 암호화

### Recording Client (Stage 4 이후)
| 시나리오 | Web | iOS | Android |
|---|---|---|---|
| 녹음 시작 지연 ≤ 1s | | | |
| Pause / Resume | | | |
| 30분 자동 종료 + 녹음 보존 | | | |
| 마이크 권한 거부 → 대화만 하기 | | | |
| 녹음 중 네트워크 끊김 → 로컬 유지 → 복구 후 업로드(Mock) | | | |
| 업로드 실패 재시도 / 48h 안내 (Mock) | | | |
| 앱 강제 종료 후 로컬 녹음 복구 | | | |
| 백그라운드 전환 / 화면 잠금 중 녹음 유지 | | | |

실기기 검증이 불가하면 `NOT VERIFIED` + 수동 테스트 절차를 남긴다. 실제 Storage 업로드·분석 연결은 `BACKEND_INTEGRATION_PENDING`.

### Regression
- [ ] 이전 Stage AC 핵심 경로 재실행 (Mock 시나리오 포함)
- [ ] 전체 테스트 스위트 통과

### Stage 8 Handoff
- [ ] Handoff 문서 7종 존재: `BACKEND_HANDOFF.md`, `API_CONTRACTS.md`, `DATA_REQUIREMENTS.md`, `AUTH_REQUIREMENTS.md`, `RECORDING_UPLOAD_SPEC.md`, `ANALYSIS_PIPELINE_REQUIREMENTS.md`, `ERROR_CODES.md`
- [ ] 전체 Stage의 `BACKEND_INTEGRATION_PENDING` 항목이 Handoff 문서에 1:1로 반영됨
- [ ] `BACKEND_HANDOFF.md` 필수 항목(API 목록, Request/Response/Error, Auth, Authorization, Screen, Feature, PRD ID, 상태 변화, Mock 위치) 충족
- [ ] `packages/contracts` 최종 검증 (typecheck, test, 문서와 일치)
