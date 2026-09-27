# Stage 2-AUTH — Auth 화면 · AuthGateway Mock · Route Guard

## Scope
가입·로그인·비밀번호 재설정 화면과 `AuthGateway` Mock, Route Guard 판정 로직을 구현한다.

## Agent
`development-agent`

## Source Files (필요한 절만)
- `docs/design/stage-2-design-spec.md` — `/auth/welcome`(`179:1701`) · `/auth/sign-up`(`179:1724`) · `/auth/log-in`(`179:1820`) · `C13-01` 재설정 4화면
- `docs/plans/stage-2-plan.md` — FR-01·FR-02 행 · AC 중 Auth·Route Guard 그룹
- `docs/decisions/stage-2-approvals.md` §4 — **D-5 · D-6 · D-15** · §6 디자이너 요청
- `docs/ARCHITECTURE.md` §2.4(판정 순서) · `.claude/rules/frontend.md` §4

## Required Work
1. **화면**: Welcome · 가입 · 로그인 · 비밀번호 재설정(요청 · 발송 안내 · 링크 만료 · 새 비밀번호)
   - 가입 화면은 **보호자 영역만** 렌더한다 (Figma 의 아이 섹션·단일 체크박스는 허용 차이로 제외 — Design Spec `AD-S2-*`)
2. **`AuthGateway` interface + `MockAuthGateway`** — Supabase JS Client 미사용(#27). Adapter 선택은 기존 provider 한 곳
3. **D-5 Route Guard**: `useMe()` + 순수 함수 `resolveGuardDecision(me, pathname)`. 판정 순서 = 미인증 → 동의 → VPC → 온보딩 → Home. **D-6 에 따라 "프로필 결과 확인" 단계는 넣지 마라.** `me` 미해결 = `pending`
4. **D-15 브랜드 에셋**: Google 공식 로고 · Apple 공식 "Sign in with Apple" 버튼 규격. `packages/ui/src/icon/brand/` 에 **수정 금지** 주석. 규격이 `Button variant=glass` 와 충돌하면 **Apple 규격 우선** + 허용 차이 기록
5. **Mock scenario**: `success` · `loading` · `error` · `retry` · `offline` + Auth 고유 시나리오(잘못된 자격 증명, 링크 만료 등 §5.4 catalogue key 만)
6. 문구는 feature 단위 **copy 모듈**. 컴포넌트에 흩어두지 마라

## Forbidden Work
- 동의·VPC 화면 (`2-CONSENT`) · 온보딩 (`2-ONBOARDING`) · Home 콘텐츠 (`2-HOME`)
- **Stage 2-B**: `/onboarding/profile` · `/onboarding/growth-capability` · Guard 의 프로필 결과 단계
- 실제 인증 Provider 연동 · Supabase JS Client · Backend 일체
- 소셜 로그인 실제 OAuth 흐름 (Mock 까지)

## Verification
- 공통 7종
- **Route Guard 판정 순서 전수 테스트** (AC-2-42) — 순수 함수라 Router·Query 없이 검증 가능해야 한다
- **Privacy**: Auth 구간 요청에 **아동 데이터 0건** (요청 로그 테스트)
- 접근성: 폼 label 연결 · `aria-invalid`/`aria-describedby` · 키보드 · 200% reflow
- Figma 대조는 **영역 클립 baseline**(D-12) 로 수행

## Exit Criteria
- Auth 전 화면 동작 + Guard 가 판정 순서대로 리다이렉트
- 공통 7종 통과, 회귀 0
- `docs/qa/stage-2-auth-handoff.md` 작성
