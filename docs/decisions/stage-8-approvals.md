# Stage 8 Approvals

## D8-1 — Plan + Design Spec 승인 (2026-11-20, user)

사용자 응답(승인 체크포인트, 일괄 질문):

| 질문 | 사용자 선택 |
|---|---|
| Stage 8 Plan · Design Spec 승인 | **승인, 나머지 권고안대로** |
| 전체 데이터 삭제 vs 탈퇴 (`N8-02`) | **두 기능으로 분리** (ⓐ) — 전체 삭제 = 아동 데이터 삭제·계정 유지 / 탈퇴 = 계정 + 전체 데이터 삭제 |
| 프리뷰 호스트 (`N8-11`) | **Cloudflare Pages + Cloudflare Access 접근 제한** (ⓑ) |
| 미가입 기기 draft 삭제 위치 (`N8-07` · `Q8-12`) | **온보딩 Trial 안내(C13-11) 아래 TextLink** (`Q8-12` ⓓ) — Figma 디자이너 프레임 변경 0 |

적용 범위:
- `docs/plans/stage-8-plan.md` `N8-01`~`N8-30` 과 `docs/design/stage-8-design-spec.md` `Q8-01`~`Q8-21` 중 위에서 따로 묻지 않은 항목은 **각 문서의 권고안**으로 확정한다. 주요 항목:
  - C-13 9화면 = design-agent 명세(`Q8-01` ②), 디자이너 요청서 병행 발송(`Q8-21`)
  - 계정 화면 보호자 이메일 = `Caregiver.email` 추가(`Q8-10` ⓐ, `C8-10`)
  - 요금제 미표시(`N8-05` ⓐ) · 동의 이력 제외(`N8-06` ⓑ · `Q8-20`)
  - 삭제 확인 1회(`N8-08` ⓐ) · 신규 `ACCOUNT_DELETION_PENDING`(409)(`N8-09` ⓐ)
  - 기한 수치 없음(`N8-04` ⓐ) · 세션 녹음 삭제 = 원본 오디오 + 클립, 대화 기록·관찰 유지 안내(`N8-03` ⓐ)
  - 삭제·탈퇴 완료 후 상태(`N8-10` 전체 삭제 ⓐ · 탈퇴 ⓐ) · 탈퇴 후 welcome 위 Toast(`Q8-11` ⓐ)
  - 프리뷰 `?scenario=` 쿼리만 허용, 패널 UI 0(`N8-12` ⓑ) · 상용 표지 4종 중립 대체 + 파이프라인(`N8-13` ⓐ)
  - `@axe-core/playwright` dev 의존 도입(`N8-18` · `Q8-18`)
  - `VG6-H-09` = A + ⓑ-1 (실측 실패 시 ⓑ-2), SettingsMenu·Stage 8 화면 포함(`N8-15` · `Q8-15`) · `VG6-H-06` 수용(조건 3) · `VG6-D-12` Back 부모 표(`N8-14` · `Q8-17`)
  - 가값 `P-41` 등록(`Q8-19`) · 나머지 `N8-16`~`N8-29` 권고안
- `N8-30` (Figma 라이브 조회)은 design-agent 가 2026-11-20 라이브 실측으로 해소했다.
- 프리뷰 배포의 호스트 계정 생성·Access 설정·배포 실행은 **사용자 수행** (`S8-I`). Agent 는 계정을 만들지 않는다.
- Spec `M8-1`~`M8-6` 은 Plan rev 2 에서 반영한다 (승인 범위 안의 정합화).

## D8-2 — 구현 중 누적 결정 (2026-11-21, user)

| 항목 | 사용자 선택 |
|---|---|
| `N8-31` · `VG8-C-11` 화면 밖 전체 삭제 완료 시 기기 정리 | **ⓐ 앱 전체에서 완료 감지** — 요청 id 만 기기에 기록(PII 0), `app/providers` 감시자가 완료 시 정리 + Toast 1회. 다른 기기 잔여 데이터(R8-15)는 Handoff 에 한계로 기록 (수용) |
| `VG8-B` ListRow meta 줄바꿈 | **② 공용 `ListRow` 에 opt-in `metaWrap` prop** (기본 off, 녹음 목록에서만 사용, 기존 사용처 diff 0) — Shared UI 변경 승인 |
| `VG8-D-07` `/onboarding/start` Trial 안내 아래 기기 draft 삭제 링크 | **포함** (Step 1 과 같은 규칙, 최우선 규칙 2 에 따른 사용자 승인) |
| Plan B.2-① 로그아웃 확인 창 미업로드 녹음 안내 | **선택하지 않음 → 현행 유지** (문구 추가 0, 항목 닫음) |
| `P-42` 삭제 폴링 5s × 60 | **선택하지 않음 → 가값 유지** (`P-42` provisional, Final QA 가값 재제시 대상) |
| `VG8-A-03` "paused" 제목·설명 반복 | **현행 문구 유지** |

## D8-3 — S8-F · S8-G Visual Gap 누적 결정 (2026-11-21, user)

| 항목 | 사용자 선택 |
|---|---|
| `H8-6-N2` 녹음 버튼 접근성 이름 | **캡션 + 동작 함께** — *"Tap to recording, Start recording"* (label-in-name 충족, 단위 테스트 2곳 갱신) |
| `H8-6-N3` 로그인 *Create an account* 대비 (≈4.1:1, Figma 선언 #4a5f5c 자체 미달) | **신규 가값 `P-43` 등록** — Figma 색 유지, 디자이너 확정 대기 |
| `H8-6-N4` View · Done · Show more 터치 영역 < 44 | **보이는 모습 유지 + 터치 영역만 44** — `packages/ui` TextLink 에 opt-in 옵션 1개 추가 승인 (baseline 0, 이웃 겹침 QA 확인 조건) |

나머지 항목은 **모두 design-agent 권고대로** 확정한다 (`docs/design/stage-8-visual-gap.md` S8-F · S8-G):
- `VG8-F-05` 섹션 간격 16 화면(SettingsMenu·데이터 관리·계정) 31/49 **현행 유지**, Spec "53/35" 서술만 정정
- `VG8-F-09` Step 1 YOUR CHILD 아이콘 헤더 **ⓑ-2 허용 차이 등록 (Δ+13)**
- `VG8-F-06` 가입 화면 Δ−1/−2 **허용 차이 등록**
- `H8-6-N1` 리포트 카드 링크 **aria-label 제거** (보이는 텍스트가 이름, N7-37 개정)
- `H8-6-N4` 회고 입력칸 높이 40 (Figma 91:715) **예외 등록** (WCAG 2.5.8 AA 24 충족, S1-G-2 선례)
- `H8-6-N5` Text spacing · 200% 등가 폭 말줄임 **ⓐ 조건부 허용 차이** — 항목별 전체 텍스트 대체 경로 대조표를 QA 가 작성
- `H8-6-N6` 196 폭 Activity Card 뒤집기 버튼 **ⓐ 원인 진단 후 수정** (393·320 baseline 변화 0 조건)
- `H8-6-N7` `P-18` · `P-22` 를 Final QA 가값 재제시에 **포함** (P-18 registry 주석 정정)
- `H8-6-N8` px 타입 토큰 **기록만**
- `VG8-B-12` Dialog 배경 blur **미적용으로 닫음** (디자이너 근거 없음)
- `VG8-G` F2 선택 시트: 화살표로 옮긴 값은 Esc 로 닫아도 유지 — **Stage 2 Spec §4.1 에 동작 명시**

## D8-4 — S8-H · S8-I 누적 결정 (2026-11-21, user)

| 항목 | 사용자 선택 |
|---|---|
| `D8-3-N1` 일시정지 녹음 버튼 접근성 이름 (캡션 *Tap to resume* ↔ 이름 *Resume recording*) | **같은 규칙 적용** — *"Tap to resume, Resume recording"* |
| `H8-7-N2` · `VG8-I-02` 중립 표지 모양 | **현행(palette 단색 teal/orange/indigo) 유지 + 디자이너에게 데모용 표지 요청 병행** |
| `H8-7-N4` · `R8-17` 프리뷰의 실제 책 제목·저자 (Figma 값) | **현행 유지, 법무 확인 항목 `P3-BIP-19` 에 기록** (Access 접근 제한 비공개 프리뷰) |
| `D8-3-N3` `P-18` · `P-22` provisionalItems 등재 | **등재** (확정 여부는 Final QA 가값 재제시에서 결정) |

## D8-5 — 권한 거부 녹음 버튼 이름 (2026-11-21, user)

| 항목 | 사용자 선택 |
|---|---|
| `D8-3-N2` · `D8-4-N1` 권한 거부 녹음 버튼 (캡션 *Mic is off* ↔ 이름 *Microphone is off*) | **이름을 캡션과 같은 *Mic is off* 로** (화면 변화 0) |

## D8-6 — 프리뷰 배포 방식 변경 (2026-11-21, user)

> 원문: *"github를 써서 배포해서 다른 사람들이 git 과 이 주소에서 확인할 수 있게 하고 싶어, 전체를 커밋하고 배포 준비를 해줘"*

| 항목 | 변경 |
|---|---|
| 배포 방식 (`D8-1` `N8-11` ⓑ 의 Pages Direct Upload) | **Cloudflare Workers(정적 자산) + GitHub 연결 빌드** — 호스트는 Cloudflare 유지, 접근 제한은 Cloudflare Access(**All traffic**) 유지 |
| `R8-13` (검사한 것 = 배포한 것) | Build command 에 `assert:preview` 를 포함해 배포 전 검사를 강제하는 것으로 충족 |
| 커밋 · 푸시 | Stage 8 작업 전체 커밋 + origin main 푸시 (사용자 지시) — Stage 8 Final QA 전 커밋임을 커밋 메시지에 명시 |
| 계정 · Access · 대시보드 설정 · GitHub 공유 | **사용자 수행** (Agent 는 계정 · 배포를 하지 않는다) |

## D8-7 — 프리뷰 책 표지 복원 (2026-11-21, user)

> 원문: *"책 이미지가 하나도 안나오는데 어짜피 초대된 사람들한테만 보여줄꺼라서 책 이미지를 나오게 해줘"*

| 항목 | 변경 |
|---|---|
| `N8-13` ⓐ 상용 표지 중립 대체 · `D8-4` 중립 표지 유지 | **번복 — 실제 책 표지를 프리뷰에 표시**. 근거: 프리뷰는 Cloudflare Access 로 초대된 사람만 본다 |
| 표지 출처 | git 이력의 기존 상용 표지 3종 복원 + Figma(디자이너 화면)에 있는 표지 에셋. Figma 에 없는 책은 지금처럼 placeholder (임의 이미지 수집 · 웹 다운로드 0) |
| `assert:preview` ⑥ 상용 표지 금지 검사 | 이 결정에 맞춰 조정 |
| 위험 | 상용 표지의 저작권 — 공개 배포 금지 유지, 정식 출시 전 법무 확인 `P3-BIP-19` 에 포함 |
