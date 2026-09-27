# Stage 2-ONBOARDING — 온보딩 위저드 Step 1~5

## Scope
PRD 5단계 온보딩(C-9)을 구현한다. 제출 응답 parse 까지가 범위이며, **결과 화면은 Stage 2-B** 다.

## Agent
`development-agent`

## Source Files (필요한 절만)
- `docs/design/stage-2-design-spec.md` — `/onboarding`(`179:1748`) · Step 1(`179:1740` + `C13-04`) · `C13-05` 기질 · `C13-06` 책·주제 · `C13-07` 목표 · Step 5(`179:1770` + `C13-08`) · `/onboarding/saved`(`179:1809`) · `C13-11` Trial 안내
- `docs/plans/stage-2-plan.md` — FR-03·FR-04 행 · Onboarding AC 12건
- `docs/decisions/stage-2-approvals.md` §4 **D-1 · D-3 · D-9 · D-10 · D-11 · D-16 · D-17** · §6 디자이너 요청 ②
- Stage 0 **C-6 · C-7 · C-8 · C-9 · C-12**

## Required Work
1. **Step 1 아이 정보**: 성·이름 두 칸(`lastName` 은 **선택** — D-1) · 성별 `SelectTrigger`(Girl / Boy / Prefer not to say, C-7) · 생년월 년·월 2단(D-10) · 나이 Tag 파생 표시
   - **D-16**: 관계·타임존은 `PATCH /v1/me` 로 별도 전송. 화면 1개 / 요청 2개
2. **Step 2 기질 카드** · **Step 3 책·주제**(D-17 — 검색 + **결과 없음 시 제목 직접 입력**) · **Step 4 성장 목표**
3. **Step 5 Baseline 10문항**: `SwipeDeck`(D-9 — Pointer Events, `scroll-snap` 금지) + **비채점 6번째 옵션 시각 구분**(C13-08)
4. **D-3 Trial draft**: `localStorage` 키 `haru.onboarding.draft.v1` · 30일 · 삭제 5시점 · 읽기/쓰기 모두 schema parse. **가입 전 구간 서버 요청 0건**
5. **D-11 저장**: 로컬 400ms debounce / 서버는 step 이동 시 1회
6. **제출**: `POST /v1/onboarding/submit` 응답(`ProfileResult`) **parse 검증까지만**. 화면 표시는 Stage 2-B
7. **전이**: `/onboarding/saved` 의 CTA 는 **`/`(Home) 로 직결**한다. 임시 대기·임시 안내 화면을 만들지 마라 (Design Spec 권장안)
8. **§6 디자이너 요청 ② (`S2-COPY-1`)**: `179:1763`/`179:1767` 문구는 **기획 결정 대기**다. copy 모듈에 **빈 슬롯**으로 두고 그럴듯한 플레이스홀더를 넣지 마라. handoff 에 보고하라
9. **§6 ① ③**: `179:1775` 는 gutter 24 정렬, Step 5 옵션 행은 **44px** 로 구현

## Forbidden Work
- **Stage 2-B**: `/onboarding/profile` · `/onboarding/growth-capability` · `CapabilityDiamondChart` · `PersonaCard` · 다이아몬드 null 축 **시각** 표현
- Stage 3: 서재 · 소유/증정 · `BookPrompts` · Activity Card
- Stage 5: `TextArea` · `StarRating`
- 역량 점수 **산출 로직** — 서버 책임(`BACKEND_INTEGRATION_PENDING`)
- Backend 일체

## Verification
- 공통 7종
- **Privacy**: Trial(가입 전) 구간 서버 요청 **0건**, 동의 전 아동 데이터 전송 0건 (요청 로그 테스트)
- draft: 저장 → 새로고침 → 같은 step 복귀 · 30일 경과 폐기 · 스키마 불일치 폐기
- **D-9 접근성**: 제스처 없이 **버튼·키보드만으로 10문항 전부 도달·응답** 가능
- 생년월 3.0/9.99세 경계 (주입 clock)
- `score: null` 이 섞인 제출 응답이 parse 를 통과

## Exit Criteria
- Step 1~5 + 제출 + `/onboarding/saved` → Home 전이가 Mock 으로 end-to-end 동작
- `S2-COPY-1` 빈 슬롯과 사유가 handoff 에 기록됨
- 공통 7종 통과, 회귀 0
- `docs/qa/stage-2-onboarding-handoff.md` 작성
