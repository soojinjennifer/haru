# Stage 2-HOME — Home skeleton · 설정 · 로그아웃 · 인계 통합

## Scope
착지 화면(#33)과 설정 목록·로그아웃을 구현하고, Stage 2 인계 문서를 통합한다. Stage 2 의 마지막 구현 Step 이다.

## Agent
`development-agent`

## Source Files (필요한 절만)
- `docs/design/stage-2-design-spec.md` — Home 헤더(`26:21`/`26:39`/`26:44`) · `C13-13` 본문 EmptyState · `C13-12` 설정 목록
- `docs/plans/stage-2-plan.md` — #33 Home skeleton 행 · Home·Settings AC · §17.2 이월
- `docs/decisions/stage-2-approvals.md` §4 **D-7**(로그아웃 ConfirmDialog) · **D-3**(로그아웃 시 draft 삭제)
- 이전 Step handoff: `docs/qa/stage-2-{contracts,ui,auth,consent,onboarding}-handoff.md`

## Required Work
1. **Home skeleton (#33)**: 워드마크 · 설정 아이콘(`26:44`) · **본문은 EmptyState**. Activity Card·추천·서재는 **Stage 3** 이므로 콘텐츠를 만들지 마라
2. **`PlaceholderPage` → `HomePage` 교체** 후 `PlaceholderPage` **삭제** (§17.2)
3. **`BottomTabBar` 를 마운트하지 마라** — Stage 3 (결정 #33·Plan Out of Scope)
4. **설정 목록 (`C13-12`)**: 로그아웃 1행만. 데이터 관리·탈퇴·동의 이력은 **Stage 8**
5. **D-7 로그아웃**: `ConfirmDialog` + "이 기기에 저장된 온보딩 응답이 삭제됩니다" 취지 안내. 확인 시 **로컬 draft·캐시 정리**(D-3 삭제 시점 ②)
6. **인계 통합**: 각 Step handoff 를 **`docs/qa/stage-2-handoff.md`** 로 통합한다. AC-2-01~68 대응표 · `BACKEND_INTEGRATION_PENDING` 목록 · 허용 차이 `AD-S2-*` · Stage 2-B 이월 · 남은 가값(P-01·02·04·05·16·17) · 디자이너 요청 3건 · `L-02` 약관 추적 · `S2-COPY-1` 을 포함하라

## Forbidden Work
- Stage 3: Activity Card · 추천 · 서재 · BottomTabBar 마운트 · 알림 설정
- Stage 8: 데이터 관리 · 탈퇴 · 동의 이력 보기
- **Stage 2-B** 화면
- Backend 일체

## Verification
- 공통 7종
- 로그아웃 후 **로컬 draft·캐시가 실제로 비는지** 확인 (localStorage 검사)
- Route Guard: 온보딩 완료 사용자가 `/` 에 착지
- Home 이 320/393/600/1024 에서 앱 컬럼 규칙 유지
- `apps/api/` · `supabase/` 부재 · `PlaceholderPage` 잔존 0건

## Exit Criteria
- `/` 가 Home skeleton 이고 설정·로그아웃이 동작
- `docs/qa/stage-2-handoff.md` 통합 완료
- 공통 7종 통과, 회귀 0
