# Stage 2-CONTRACTS — packages/contracts 도메인 확장

## Scope
Stage 2 가 쓰는 도메인 schema 를 `packages/contracts` 에 추가한다. 화면·Mock·Adapter 는 이후 Step 이다.

## Agent
`development-agent`

## Source Files (필요한 절만)
- `docs/plans/stage-2-plan.md` §7 API Contract Delta (contracts 경로 ↔ API_CONTRACTS 1:1 대응표 · Endpoint Delta) · §6 Data Requirement Delta
- `docs/API_CONTRACTS.md` §1.2 · §2.2 · §3.4(Consent · ChildInfo · Onboarding) · §4 Stage 2
- `docs/decisions/stage-2-approvals.md` §4 — **D-1 · D-2 · D-10 · D-16 · D-17 이 contract 를 직접 바꾼다**
- 기존 `packages/contracts/src/**` — 구조·네이밍 관례

## Required Work
1. **enum 23종 → 26종**: `ConsentSource` · `OnboardingStatus` · `Plan` 추가 (Plan §18-④). 기존 23종 이름·값을 바꾸지 마라
2. **도메인 schema**: Consent(문서·이벤트) · ChildInfo · Onboarding(step · draft · submit · ProfileResult) · Me/UpdateCaregiver · BookSummary + 검색
3. **D-1**: `lastName` = `z.string().trim().max(40).optional()`
4. **D-2**: `score: null` 허용 + `itemCount` · `missingCount`. 강점/growing edge·발전 역량 후보에서 null 역량을 제외하는 **순수 함수**를 contracts 에 둔다(시각 표현은 Stage 2-B)
5. **D-10**: `createBirthYearMonthSchema(now: Date)` **팩토리** — 형식 `YYYY-MM` + 3.0~9.99세 refine. `Date.now()` 직접 호출 금지
6. **D-16**: 관계·타임존은 `ChildInfoAnswers` 가 아니라 `UpdateCaregiver`
7. **D-17**: `BookSummarySchema{id, title, author, coverUrl?}` + 검색 요청/응답만. `LibraryBook`·소유·증정·프롬프트 금지
8. 타입은 `z.infer` 로만 파생. `src/index.ts` re-export 유지(deep import 금지)
9. `docs/API_CONTRACTS.md` 를 구현된 contract 와 일치시킨다 (rules/workflow §5 — 이 반영은 development-agent 소관)

## Forbidden Work
- 화면 · Mock Adapter · Query hook (이후 Step)
- Stage 3 이상 schema: `LibraryBook` · `BookPrompts` · `gift-requests` · Activity · Session · Recording · Report
- **Stage 2-B**: 프로필 결과 **화면** 관련 표시 규칙 (데이터 schema 는 이번 범위)
- zod 외 런타임 의존 추가 · Backend 일체

## Verification
- 공통 7종 + `packages/contracts` 런타임 의존이 **zod 단독**임을 유지 (`lint:boundaries` 음성 테스트 불필요 — 기존 규칙이 검사)
- 단위 테스트: enum 26종 스냅샷 · `lastName` 미입력 통과 · `score: null` parse · null 제외 함수 경계 · 생년월 팩토리(주입 clock 으로 3.0/9.99 경계) · 검색 응답 parse
- 기존 테스트 **469건** 유지 또는 증가

## Exit Criteria
- Stage 2 화면·Mock 이 필요로 하는 schema 가 전부 존재하고 `API_CONTRACTS.md` 와 일치
- 공통 7종 통과, 회귀 0
- `docs/qa/stage-2-contracts-handoff.md` 작성
