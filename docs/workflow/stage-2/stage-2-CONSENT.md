# Stage 2-CONSENT — 보호자 동의 · VPC

## Scope
보호자 동의 5항목과 VPC(보호자 확인) 단계를 구현한다. **Stage 2 의 Privacy 핵심 구간**이다.

## Agent
`development-agent`

## Source Files (필요한 절만)
- `docs/design/stage-2-design-spec.md` — `C13-02` 동의 5항목 · `C13-03` VPC 슬롯(pending / failed / 재시도)
- `docs/plans/stage-2-plan.md` — Consent·VPC AC 그룹(9건) · **AC-2-13**
- `docs/decisions/stage-2-approvals.md` §4 **D-4**(외부 링크) · §4.1(약관 본문 추적) · Stage 0 **C-1**(동의 5종) · **C-4**(철회 MVP 제외)
- `docs/API_CONTRACTS.md` §3.4 Consent

## Required Work
1. **동의 화면**: 필수/선택 구분이 명확한 5항목. **필수 미체크 시 CTA 는 `disabled` 가 아니라 `aria-disabled` + `aria-describedby`** (Design Spec 인계 메모)
2. **D-4 문서 링크**: `<a href={doc.url} target="_blank" rel="noopener noreferrer">` + 외부 링크 표식. `/legal/*` 페이지·본문 fixture 를 **만들지 마라**
3. **§4.1 추적**: Mock fixture 의 `ConsentDocument.url` 을 **누가 봐도 가짜임이 드러나는 형태**로 두고, 그 사실을 handoff 에 기록해 QA 가 확인 항목으로 잡게 한다
4. **VPC 슬롯**: `pending` · `failed` · 재시도 상태. 실제 확인 방식은 법무 L-01 미결이므로 **Contract·Mock·UX 까지만**
5. **동의 철회 UI 를 만들지 마라** (C-4, MVP 제외)
6. Mock scenario: 공통 5종 + `consent-missing` 등 §5.4 catalogue key

## Forbidden Work
- 온보딩 (`2-ONBOARDING`) · 동의 이력 보기(Stage 8, C-19) · 철회(C-4)
- 서버 측 동의 강제 구현 — **`BACKEND_INTEGRATION_PENDING`** 으로 문서화만
- 실제 VPC Provider 연동 · Backend 일체

## Verification
- 공통 7종
- **AC-2-13 전용 테스트**: 동의 기록 성공 **이전** 구간의 모든 Mock 요청을 수집해 **아동 데이터 0건**을 전수 검사
- 동의 없이 온보딩(아동 데이터 입력)으로 진행 불가
- VPC `failed` → 재시도 경로 동작
- 접근성: 5항목 체크박스 group semantics · 필수 미충족 안내가 스크린리더에 전달

## Exit Criteria
- 동의 → VPC 흐름이 Mock 으로 end-to-end 동작
- Privacy 불변식 테스트 통과
- 공통 7종 통과, 회귀 0
- `docs/qa/stage-2-consent-handoff.md` 작성
