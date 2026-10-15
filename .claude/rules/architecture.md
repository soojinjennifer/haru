# HARU Architecture Rules (Frontend-only Scope)

상세 설계는 `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_MODEL.md`(Data Requirement 초안) 를 따른다.
이 파일은 구현 중 항상 지켜야 하는 불변 규칙이다. 승인된 문서와 충돌하면 승인된 문서가 우선하며, 충돌 사실을 보고한다.
`[제안]` 표시 항목은 Stage 0 승인 전 권장안이다.

## 1. 원칙 — Pragmatic Clean Architecture

- 관심사 분리, 명확한 Domain Boundary, 높은 Component 재사용성, Type Safety, Testability를 지킨다.
- MVP이므로 Entity class / UseCase class / DI container 같은 Enterprise 구조를 도입하지 않는다.
- 추상화는 **교체가 실제로 예정된 경계**에만 둔다: API Adapter(Mock ↔ Http), RecorderAdapter(Web ↔ Native), AuthGateway, Upload.

## 2. Monorepo 경계

이 프로젝트에서 만드는 것:

```
apps/web                 React + Vite (Caregiver UI) — mocks 포함
apps/mobile              Capacitor iOS/Android 셸 [승인 2026-09-14, Stage 0 #7 → 2026-10-12 D4-1 변경: Stage 4에서 만들지 않음, 후속 단계 S4N-A에서 생성. 그 전까지 apps/mobile 부재가 Stage Exit 조건]
packages/contracts       Zod schema · enum · error code · session state · validation rule (Frontend ↔ 향후 Backend 공식 Interface)
packages/design-tokens   Figma Variables → CSS Variables → Tailwind preset
packages/ui              Shared UI (도메인 지식 없음)
packages/config          tsconfig / eslint / prettier / vitest 공통 설정
```

- `packages/validation` → `packages/contracts` 병합, `packages/shared-types` 미생성 [승인 2026-09-14, Stage 0 #5]. 패키지 매니저는 pnpm workspaces [승인 #6].
- **만들지 않는 것**: `apps/api`, `supabase/migrations`, `supabase/seed`, 기타 Backend 런타임 코드.

허용 의존 방향:

| 패키지 | import 가능 |
|---|---|
| `apps/web` | `ui`, `design-tokens`, `contracts`, `config` |
| `apps/mobile` | `apps/web` 빌드 산출물 (코드 import 아님) — 후속 단계 S4N-A 에서 생성 후 적용 |
| `packages/ui` | `design-tokens` (도메인·contracts import 금지) |
| `packages/contracts` | `zod` 외 런타임 의존 없음 |
| `packages/design-tokens` | 없음 |

금지: `packages/*` → `apps/*` import, 순환 의존.

## 3. Frontend 레이어 (`apps/web/src`)

```
app → pages → features → entities → shared
```

- 상위 레이어만 하위 레이어를 import 한다. 역방향 import 금지.
- `features/A` 는 `features/B` 를 직접 import 하지 않는다. 조합은 `pages` 에서 한다.
- Page는 Composition만 담당한다. Page에 API 호출, AI 호출, Recording 처리, 복잡한 Business Logic, 복잡한 State Transition을 넣지 않는다.

## 4. API 호출 구조 (필수)

```
UI / Feature Component
↓
Query / Mutation hook        (예: useCreateSession)
↓
API Client Interface         (예: sessionApi.create)
↓
Mock Adapter | Http Adapter  (예: MockSessionApi | HttpSessionApi)
```

- Component는 API Client나 Adapter를 직접 호출하지 않는다.
- Adapter 선택은 앱 조립 지점 한 곳(provider/config)에서만 한다.
- Mock → Http 교체 시 UI·Feature·Query 코드를 수정하지 않아야 한다. 교체 가능성은 QA 대상이다.
- Adapter 경계에서 Request/Response를 `packages/contracts` schema로 검증(parse)한다. Mock도 동일하게 한다.
- Http Adapter는 Contract 기반 골격만 둘 수 있으며, 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` 이다.

## 5. Shared Contract

- Request / Response / Enum / Error Code / Session State / Validation Schema는 `packages/contracts` 에서만 정의한다.
- 타입은 `z.infer` 로 파생한다. 같은 모양의 타입을 앱 안에 다시 선언하지 않는다.
- Contract는 향후 Backend Developer가 그대로 구현할 수 있어야 한다. 변경은 `docs/API_CONTRACTS.md` 갱신과 함께 한다.

## 6. Session State

PRD §12.2:

```
ready → recording ⇄ paused → completed → analyzing → analyzed
                                          analyzing → failed → (재시도) → analyzing
```

- 상태 enum과 허용 전이 표는 `packages/contracts` 에 한 번만 정의하고 Frontend, Mock, 향후 Backend가 공유한다.
- `retry` 는 상태가 아니라 행위다.
- `abandoned`(10분 방치), `mode`(recorded / conversation_only), `completedReason`, `analysisOutcome`, 별도 upload status 는 ARCHITECTURE §10 모델로 승인되었다 [승인 2026-09-14, Stage 0 #16]. `skipped_consent_revoked` 는 C-4(동의 철회 MVP 제외)로 제거되었고, `skipped_audio_deleted` 등 OAQ-17 결정에 의존하는 값은 결정 전까지 enum에 넣지 않는다.
- Mock은 허용되지 않은 전이를 contracts error code로 거부해야 한다.

## 7. Recording Client

Recording은 핵심 Domain이며 단순 React Hook으로 구현하지 않는다.

```
RecordingController (상태 머신, features/recording)
→ ConsentGate / PermissionService
→ RecorderAdapter (Web | Native)
→ LocalRecordingStore (청크 단위 영속, 크래시 복구)
→ SessionOutbox (세션 전이 이벤트 영속·재전송, Idempotency-Key — 오프라인·전이 실패 시 적재)
→ UploadQueue (재시도 / 네트워크 복구 감지)
→ recordingApi (Mock | Http — init / complete / status, Recording Upload Contract)
→ UploadTransport (Mock | TUS — 바이트 전송)
```

- 녹음 시작 전 동의 상태와 마이크 권한을 확인한다.
- 로컬 녹음은 업로드 확정 응답 전까지 삭제하지 않는다 (Mock 확정 응답 포함).
- 사용자 주도 폐기(`Discard`, `D4-12`)는 유실과 다른 사건이다. 서버 전이 확정 응답 후에 로컬을 삭제하고, 실패하거나 오프라인이면 보존한 채 SessionOutbox에 적재한다 (`docs/decisions/stage-4-approvals.md`).
- Mock은 업로드 성공 / 실패 / 지연 / 재시도를 재현한다.
- 백그라운드·화면 잠금 동작은 `docs/ARCHITECTURE.md` 의 승인된 플랫폼 결정을 따른다. Web은 보장 불가.
- 실제 Storage 업로드·서버 확정·분석 Job 연결은 `BACKEND_INTEGRATION_PENDING`.

## 8. AI / STT / Analysis

- Frontend는 AI / STT Provider를 호출하지 않는다. 분석은 Async Analysis Contract(상태·결과 조회)로만 다룬다.
- 사용자에게 노출되는 생성 문구(버블, 페르소나, 피드백, 리포트)는 API 응답 값만 표시한다. Frontend에서 생성·가공하지 않는다.
- 분석 파이프라인(STT → PII Redaction → Metrics → Capability Signals → Safety Validation → Structured Result)과 Provider Adapter 원칙은 Backend Handoff 요구사항으로 문서화한다 (`docs/ANALYSIS_PIPELINE_REQUIREMENTS.md`).

## 9. Privacy / Security

Frontend 책임 (구현·검증):

- 계정 소유자는 Caregiver, 아이는 계정 없음, MVP Child Profile 1명.
- 동의 화면·동의 기록 Contract 호출 전에는 아동 데이터를 서버 Contract로 전송하지 않는다.
- 동의가 없으면 녹음 시작 UI를 막는다.
- 로그아웃·데이터 삭제 시 로컬 녹음·캐시를 정리한다.
- Secret(Service Role Key, AI Key, STT Secret, 기타 권한 Credential)을 번들·`VITE_*`·저장소에 두지 않는다.
- 콘솔 로그·에러 리포트·분석 SDK에 PII(아이 이름, Transcript, 오디오 경로)를 남기지 않는다. 광고·제3자 분석 SDK를 도입하지 않는다.

Backend Handoff 요구사항 (문서화, 구현 안 함):

- 서버 측 동의 강제, Consent History, RLS, private Storage + signed URL, Raw Audio와 Derived Data 분리(`recordings`, `transcripts`, `session_metrics`, `observations`, `capability_signals`, `reports`), Raw Audio 90일 자동 삭제(Storage API), 세션별·전체 삭제, Audit Log, 암호화.
