# HARU Backend Rules — Contract · Mock · Handoff Only

**현재 개발 범위는 Frontend까지다. 이 프로젝트에서 Backend를 구현하지 않는다.**
Backend는 별도 Backend Developer가 이후 개발한다. (CLAUDE.md "Development Scope", `docs/source/prompts/01-stage0-1-1-frontend-scope.md`)

## 1. 구현 금지 (사용자가 별도로 명시 요청하지 않는 한)

- Node.js / Express Production API
- Backend Route / Controller / Service / Repository
- Supabase Database Migration, Production Database Schema 적용
- Supabase Server-side Logic, RLS Policy, Storage Server Logic
- STT Backend, AI Backend
- Analysis Worker, Background Job, Cron Job
- Render Backend Deployment

`apps/api/`, `supabase/` 디렉토리를 생성하지 않는다.

## 2. Backend 관련으로 수행하는 작업

| 작업 | 위치 |
|---|---|
| API Contract 정의, Request / Response Schema, Enum, State Definition, Validation Schema | `packages/contracts`, `docs/API_CONTRACTS.md` |
| Error Code | `packages/contracts`, (Stage 8) `docs/ERROR_CODES.md` |
| Authentication / Authorization Requirement | (Stage 8) `docs/AUTH_REQUIREMENTS.md` |
| Data Requirement, Storage Requirement | `docs/DATA_MODEL.md` (초안) → (Stage 8) `docs/DATA_REQUIREMENTS.md` |
| Recording Upload Contract | `packages/contracts`, (Stage 8) `docs/RECORDING_UPLOAD_SPEC.md` |
| Async Analysis Contract | `packages/contracts`, (Stage 8) `docs/ANALYSIS_PIPELINE_REQUIREMENTS.md` |
| Mock API, Mock Data | `apps/web/src/mocks/` (`.claude/rules/frontend.md` §5) |
| Backend Handoff Documentation | (Stage 8) `docs/BACKEND_HANDOFF.md` |

- `docs/DATA_MODEL.md` 는 Backend Developer를 위한 **Data Requirement 초안**이다. SQL migration으로 옮기지 않는다.
- 각 Stage에서 새로 생긴 Backend 의존 항목(= `BACKEND_INTEGRATION_PENDING`)은 해당 Stage Plan과 QA 리포트에 기록하고, Stage 8 Handoff 문서에 1:1로 반영한다.

## 3. `BACKEND_HANDOFF.md` 최소 포함 항목 (Stage 8)

- 필요한 API 목록
- Request / Response / Error
- Authentication, Authorization Requirement
- 관련 Frontend Screen, 관련 Feature, 관련 PRD ID
- Frontend가 기대하는 상태 변화
- Mock 구현 위치

Backend Developer가 Frontend 코드를 다시 분석하지 않고도 구현을 시작할 수 있는 수준으로 작성한다.

## 4. Handoff 문서에 요구사항으로 기록할 Backend 원칙

아래는 구현 규칙이 아니라 **향후 Backend가 충족해야 할 요구사항**으로 문서화한다.

- 계층: `route → controller → service → repository → infrastructure`, 입력은 `packages/contracts` schema로 검증
- 공통 Error Envelope + contracts Error Code
- Supabase Access Token(JWT) 검증, caregiver → child → session 소유권 확인
- 녹음 시작·업로드 확정·분석 요청 시 서버 측 보호자 동의 강제, Consent History 보존
- 모든 family-owned 테이블 RLS, private Storage bucket + 만료 signed URL
- Raw Audio와 Derived Data 분리 (`recordings`, `transcripts`, `session_metrics`, `observations`, `capability_signals`, `reports`)
- Raw Audio 90일 자동 삭제는 Storage API로 객체까지 삭제 (DB row만 삭제 금지), 세션별·전체 삭제, Audit Log
- AI / STT는 `AIProvider`, `SpeechToTextProvider` 어댑터 뒤에서만 호출, 생성 문구 Safety Filter + 금지어 검증 + 검수 문구 fallback, `ai_generation_logs`
- 분석 파이프라인: Audio → STT → PII Redaction → Metrics Extraction → Capability Signal Analysis → Safety Validation → Structured Result → Feedback / Report; `analysis_jobs` 멱등·재시도
- 로그에 PII / Transcript 원문 금지, Secret은 환경 변수로만
- COPPA 개정 Rule 관련 요구(VPC, 제3자 제공 분리 동의, 서면 보관·보안 정책)는 법무 검토 필요 항목으로 표시
