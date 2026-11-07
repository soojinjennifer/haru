# Stage 0 Approval Log

사용자 결정 기록 (Orchestrator 작성). 항목 번호는 `PLANNING.md` §10 Stage 1 Pre-Approval Checklist 기준.
결정과 기존 문서 내용이 다르면 **이 기록이 우선**하며, 해당 문서는 결정 반영 시 갱신한다.

## 1. 승인된 결정

| # | 항목 | 결정 | 일자 |
|---|---|---|---|
| 2 | 개발 범위 | Frontend-only (Backend = Contract · Mock · Handoff, Stage 8 후 STOP) | 2026-09-14 |
| 5 | 패키지 구조 | 권장안 승인 — `validation` → `contracts` 병합, `shared-types` 미생성, `apps/mobile` 추가 (생성 시점은 #7 결정에 따름) | 2026-09-14 |
| 6 | Package manager | pnpm workspaces + Node LTS | 2026-09-14 |
| 8 | Mock 구조 | 도메인별 `Mock<Domain>Api` / `Http<Domain>Api` + 공통 helper, MSW 미사용 | 2026-09-14 |
| 13 | Capability 코드 키 | `emotion_regulation` · `self_directed_agency` · `cognitive_flexibility` · `intrinsic_motivation` (사용자 노출 라벨은 #14 별도) | 2026-09-14 |
| 16 | Session 상태 모델 | ARCHITECTURE §10 모델 승인 — PRD 7상태 + `abandoned`, `mode`, `completedReason`, `analysisOutcome`, 별도 upload status, retry는 상태 아님 (OAQ-08·OAQ-17 의존 값은 결정 전 제외) | 2026-09-14 |
| 20 | Dark mode | MVP 제외 (Light 전용) | 2026-09-14 |
| 24 | 승인 체크포인트 | Stage 수행 요청 ≠ Plan/Spec 승인. 전체 구현 요청은 plan-agent + design-agent 산출물 후 1회 멈춤 → 사용자 승인 → development-agent | 2026-09-14 |
| 25 | Stage Verdict | `INCOMPLETE` (FAIL 0 + PARTIAL/NOT VERIFIED ≥ 1) 는 PASS 아님. 사용자가 QA-N-### 단위로 명시 수용 시 `PASS (accepted: …)` | 2026-09-14 |
| 26 | 쓰기 경로 강제 hook | 도입 승인 — `apps/api/**`, `supabase/**` 전 Agent 차단, `apps/**`·`packages/**` 는 development-agent 외 차단. **설정 시점: 새 저장소 구성 시 `.claude/settings.json`** | 2026-09-14 |
| 27 | Supabase JS Client | Stage 1–8 미사용, Auth·Upload는 interface + Mock | 2026-09-14 |
| 4 | 저장소 | 로컬 `~/dev/haru` (OneDrive 밖) + origin `https://github.com/soojinjennifer/haru.git` (private, GitHub = 백업·다기기 동기화). 포함: Stage 0 문서·설정, `docs/source/` (PRD·8Stage v0.2 사본), `docs/source/prompts/` (사용자 지시 원문). 미포함: Baseline Survey 문서. 홈 디렉토리 git(Lawservice)은 그대로 둔다. 초기 구성·첫 커밋·push 즉시 진행 | 2026-09-14 |
| 9 | Stack 외 라이브러리 | 제안대로 — 차트 inline SVG, 제스처·애니메이션 CSS / Pointer Events 우선 (라이브러리는 필요 시 별도 승인), dev 전용 UI gallery route, import 경계 lint 도구, (필요 시) TanStack Query persist. 아이콘 라이브러리 여부는 #21 결정에 따름 | 2026-09-14 |
| 28 | E2E·스크린샷 도구 | Playwright | 2026-09-14 |
| 29 | Tailwind | v4 (CSS-first `@theme`) | 2026-09-14 |
| 7 | Capacitor | **도입, Stage 4에서 추가** — Stage 1–3은 웹 전용으로 개발(`AuthGateway`·Push 권한 UX는 Web + Mock), Stage 4에서 `apps/mobile` Capacitor 셸 + 네이티브 녹음 플러그인·네이티브 Auth/Push Adapter 추가. 실기기 녹음 QA는 Stage 4부터 | 2026-09-14 |
| 18 | WCAG 대비 (부분) | ① 주요 버튼: **현재 색 유지** — 파스텔 teal `#85bfb6` 위 흰 라벨 2.07:1. PRD §11 WCAG AA 미충족을 사용자가 수용 (§3 D-01). ② 보조 텍스트 색 ③ 비텍스트 요소(진행 바·별점·칩 경계·배지 글자) ④ focus ring: **디자이너 결정 대기** | 2026-09-14 |
| 10 | 토큰 정규화·신규 토큰 | ① 3-tier 구조(primitive → semantic → component) 채택, 값은 Figma만 기준(로컬 `_ds` CSS 참조 금지), Figma 자동 생성 Variable 이름 정리는 디자이너에게 요청 ② 화면 raw 값은 스케일로 흡수 — 텍스트는 iOS 타입 스케일(최소 11px), radius 6단계, 흰색 알파 3단계 ③ 신규 토큰(status 색, scrim, z-index, motion, breakpoint, app max width, safe-area): **이름·용도 확정, 값은 디자이너** — 그 전까지 design-agent 제안 값을 가값으로 사용 ④ 디자이너 대기 항목은 **가값으로 Stage 1 진행**, Stage 1 구현 후 항목별 유지/수정 승인 요청 (§4) | 2026-09-14 |
| 11 | 폰트 | **혼합** — Apple 기기(iOS·macOS)는 시스템 폰트(SF Pro), 그 외(Android·Windows 등)는 Inter(SIL OFL). 로컬 `SF-Pro.ttf` 는 저장소·빌드에 포함 금지. 권장 font stack: `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` — `system-ui` 를 Inter 앞에 두지 않는다(Android에서 Roboto가 먼저 선택됨). Inter 파일 self-host 권장(외부 CDN 요청 없음), 세부는 Stage 1 Plan | 2026-09-14 |
| 12 | 반응형 | ① 전 화면 Figma 모바일 레이아웃 사용, 넓은 화면은 가운데 정렬 앱 컬럼(최대 폭 480px), 다단 레이아웃 없음 ② breakpoint `--bp-md` 600px / `--bp-lg` 1024px (320–599px 모바일) ③ 세로 고정 — Capacitor 앱 portrait lock(Stage 4), 웹 가로 화면은 앱 컬럼으로 표시 | 2026-09-14 |
| 15 | 내비게이션 | **Figma 탭바 컴포넌트 `25:87` 채택** — 하단 탭 Library / Home(가운데, 집 아이콘 `140:2971`) / Progress. 세션은 Home의 Activity Card와 서재의 "Start Session"에서 시작하며 세션 전용 탭은 두지 않는다. 설정은 Home 상단 아이콘(`26:44`). 리포트 탭 화면 표시 이름은 **Progress** (기능·문서 명칭 "리포트/Report"는 유지). Figma `110:522` 의 탭바(Library / Session / Report)는 사용하지 않는다. M-08 해소. PRD §6.1과 다름 → §3 D-02 | 2026-09-14 |
| 14 | Capability 표시 라벨 | **Figma Growth themes(`31:102`) 명칭** — `emotion_regulation` = Emotion Regulation · `self_directed_agency` = Self-Direction · `cognitive_flexibility` = Cognitive Flexibility · `intrinsic_motivation` = Intrinsic Motivation. 라벨에 Resilience는 표시하지 않지만 역량 정의는 PRD §4(회복탄력성·인지 유연성)를 따른다. 배지·차트용 짧은 표기(예: Figma "Emotion Day")는 design-agent가 이 라벨 기준으로 정리. 책장 캡션 "Confidence"(4대 역량 외)는 4대 역량 라벨로 교체 — Figma 수정은 디자이너에게 요청 | 2026-09-14 |
| 19 | Capability 색 매핑 | **배지(Tag) 색으로 통일** — `self_directed_agency` green `#90bfad` · `emotion_regulation` pink `#efc3d4` · `cognitive_flexibility` cyan `#a0ccdd` · `intrinsic_motivation` purple `#c9b8d4`. 배지 배경과 차트(Growth themes 포함)에 같은 색 사용 (teal=주요 버튼, blue=탭 선택과 의미 분리). Figma `31:102` 차트 색 수정은 디자이너 요청. 배지 글자 색은 P-02 (디자이너 대기) | 2026-09-14 |
| 21 | 아이콘 소스 | **일반 아이콘 = Lucide** (npm `lucide-react`, 라이선스 ISC — 2026-09-14 npm registry 확인, 당시 최신 1.45.0; 버전 고정은 Stage 1 Plan). **HARU 전용 아이콘 = Figma SVG export** (출석 스티커 `attend`, thumb, record, flip 등). Figma의 일반 아이콘(settings, close, back, chevron 등)과 누락 아이콘(apple 제외)은 Lucide 대응 아이콘으로 대체. Google·Apple 로고는 공식 브랜드 에셋만 사용. 아이콘 크기 단계 값은 가값 P-09. Stack 외 라이브러리 추가 승인 포함 | 2026-09-14 |
| 22 | 공통 상태 화면 | **design-agent 명세로 Stage 1에서 먼저 구현** — Loading · Empty · Error+Retry · Offline 배너 · Toast · Dialog, 컴포넌트 focus·error·loading 상태. 기존 토큰·컴포넌트만 사용한다. Stage 1 구현 후 가값 항목과 함께 화면을 제시하고 하나씩 유지/수정 승인 요청 (P-10). 디자이너는 이후 Figma에 반영할 수 있다 | 2026-09-14 |
| 17 | contracts 상수 (OAQ-09·OAQ-12) | ① 리포트 최소 녹음 세션 수 **3** (누적 녹음 1시간 이상 조건과 함께, PRD §7.7) ② 세션 30분 자동 종료 = **실제 녹음 시간 기준(일시정지 제외)**, `MAX_RECORDED_SECONDS = 1800` ③ STT 실패·저품질 세션(`analysisOutcome: excluded_low_quality`)은 리포트 발행 기준(세션 수·누적 녹음 시간)에서 **제외** ④ 4주 주기는 **첫 세션 완료일부터 28일 단위 반복** — 대화 전용 세션 포함 여부·시간대 경계 등 세부는 Stage 7 Plan | 2026-09-14 |
| C-1 | 동의 항목 (M-01·M-02) | PRD 기준 분리 + **파일럿 참여 동의 추가** — 필수 ① 이용약관 ② 개인정보처리방침 ③ 아동 음성·성장 데이터 처리 보호자 동의(별도 체크), 선택 ④ 마케팅 수신, 추가 ⑤ 파일럿(베타) 참여 동의 — 필수/선택 여부와 문구는 법무 확인 (§6 L-02). 각 동의는 문서 버전과 함께 기록. Figma 단일 체크박스는 디자이너에게 수정 요청 | 2026-09-14 |
| C-2 | 소셜 가입 동의 시점 (M-27) | **소셜 로그인 직후 동의 화면 필수** — 이메일·Google·Apple 모든 가입 경로가 같은 동의 화면을 거친다. 동의 기록 전에는 아이 정보를 서버로 전송하지 않는다 (ARCHITECTURE §7.3.1) | 2026-09-14 |
| C-3 | VPC 방식 | **법무 확인 후 결정** (§6 L-01). Stage 2 Frontend는 동의 화면 뒤에 VPC 단계를 끼울 수 있게 설계하고 Mock으로 진행 | 2026-09-14 |
| C-4 | 동의 철회 (#32, OAQ-08) | **MVP 제외** — 탈퇴·전체 데이터 삭제 요청(FR-21)만 제공. `consent-revoked` scenario key, `skipped_consent_revoked` 값, 동의 철회 Contract는 범위에서 제거. COPPA 보호자 권리(추가 수집 거부·삭제)와의 관계는 법무 확인 (§6 L-03) | 2026-09-14 |
| C-5 | 아이 정보 수집 위치 (M-28) | **온보딩 Step 1로 이동** — 가입 화면은 보호자 정보(이름·이메일·비밀번호)만 받는다. 아이 정보는 동의 기록 후 온보딩 Step 1에서 수집 (PRD §7.2). Figma 가입 화면(`179:1724`) 수정은 디자이너 요청 | 2026-09-14 |
| C-6 | 아이 이름 필드 | **성·이름 두 칸 (Figma `179:1740` 유지)** — PRD "이름(닉네임)"·최소 수집 원칙과 다름 → §3 D-03, 법무 확인 §6 L-07. 화면·알림 호칭은 이름(first name)만 사용 | 2026-09-14 |
| C-7 | 아이 성별 (M-38) | **선택 항목** Girl / Boy / Prefer not to say, 기본값 선택 안 함, 미응답으로도 진행 가능. contracts 값: `girl` · `boy` · `prefer_not_to_say`, 미응답은 `null` | 2026-09-14 |
| C-8 | 온보딩 역량 문항 (M-03) | **Baseline Survey v1 10문항 채택** (`docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md`, 원본 `$HARU_ONEDRIVE/기존 자료/`) — "In the past two weeks" 기준 빈도 5단계(Never · Rarely · Sometimes · Often · Almost always, 내부 1–5점) + 비채점 응답 "Haven't had the chance to see this yet"(결측). 역량별 문항 ER 2 · AG 3 · CF 2 · IM 3. 역량 점수 = 응답한 문항 평균(1.0–5.0, 다이아몬드 그래프 입력). 한 역량의 문항이 모두 결측일 때의 처리는 Stage 2 Plan. PRD "역량별 동일 문항 수"와 다름 → §3 D-04 | 2026-09-14 |
| C-9 | 온보딩 단계 (M-06) | **PRD 5단계 유지** — Step 1 아이 정보 → 2 기질 카드 → 3 책·선호 주제 → 4 성장 목표 → 5 역량 문항(C-8), 중도 저장·복귀(FR-03). Figma 설문 소개의 "About 3 minutes · 10 cards" 문구는 전체 소요 시간에 맞게 수정 필요(디자이너·카피). Step 1~4 화면 디자인 방식은 별도 결정 | 2026-09-14 |
| C-10 | 대상 연령 (M-04) | **PRD대로 3~9세** 가입 허용. 4세 이상용 문항·Prompt가 준비되기 전까지 3세용·범용 콘텐츠 사용(콘텐츠 준비는 운영 범위). Baseline v1 문항(3.0–4.0세 대상 설계)의 4세 이상 적합성은 기획·전문가 확인 필요 | 2026-09-14 |
| C-11 | Exit 설문 (M-05) | **MVP 제외** — PRD 범위 유지. 설정의 설문 재응답(PRD §7.8)으로 보호자가 직접 다시 응답할 수는 있음 | 2026-09-14 |
| C-12 | Trial → 계정 전환 (FR-24) | **기기에만 저장하는 체험** — 가입 전 온보딩 응답은 기기 로컬 draft로만 저장하고, 프로필 저장 시 가입 → 동의(C-2) → 서버 전송(`POST /v1/onboarding/submit`). 동의 전 아이 정보는 서버로 보내지 않는다. 다른 기기에서 이어하기는 지원하지 않으며 익명 계정 방식은 쓰지 않는다 | 2026-09-14 |
| C-13 | Figma 누락 화면 디자인 방식 (M-06·M-07·M-16 등) | **해당 Stage에서 화면별로 결정** — 구현 Stage의 plan/design 단계에서 Orchestrator가 누락 화면마다 사용자에게 ① 디자이너에게 Figma 디자인 요청 ② design-agent가 명세 작성 중 무엇으로 할지 묻고, 사용자 승인 후 작업한다. 승인 전에는 누락 화면을 디자인·구현하지 않는다. Apple 로그인 버튼은 Apple 공식 가이드 버튼을 사용한다 | 2026-09-14 |
| C-14 | Baseline Survey 문서 | **저장소 `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md` 에 사본 추가** (#4-2 포함 범위 확장) | 2026-09-14 |
| C-15 | 이월 항목 위치 (#30) | **Stage 8 유지** — FR-21 데이터 관리 UI(P0: 보관 정책 안내·세션별 녹음 삭제·전체 삭제 요청), 동의 이력 보기(선택 기능, C-19), 탈퇴를 Stage 8에서 구현. Stage 8 = Frontend Final QA + Accessibility + Responsive + Regression + 이월 기능 + Backend Handoff → STOP | 2026-09-14 |
| C-16 | 설정 진입점 (#31) | **Home 상단 설정 아이콘(`26:44`)을 Stage 2부터 연결하고 최소 목록에서 확장** — Stage 2 로그아웃 → Stage 3 알림 설정 → Stage 6 전체 설정(아이 프로필 수정·발전 역량 변경 등) → Stage 8 데이터 관리·동의 이력 보기·탈퇴. 목록 화면 디자인은 C-13 규칙에 따라 해당 Stage에서 확인 | 2026-09-14 |
| C-17 | 에셋 사용 권리 (#23, M-35) | **캐릭터·책 표지 모두 바로 사용** — 사용자 확인: 권리 확보됨. 이미지 최적화 포맷·해상도는 Stage 1 Plan | 2026-09-14 |
| C-18 | Stage 8 배포 (#3 잔여) | **Mock 데모용 웹 프리뷰만** — Mock 모드로 동작하는 웹을 정적 호스팅에 배포(시연·Backend Developer 인계용, 실제 아동 데이터 없음). 호스팅 서비스는 Stage 8 Plan에서 확인. 앱 테스트 빌드(TestFlight·Play)와 Backend 배포는 포함하지 않음 | 2026-09-14 |
| 33 | Stage 2 착지 화면 | **Home 화면 골격 먼저** — Stage 2에서 Home 상단(워드마크 · 설정 아이콘 `26:44`)과 빈 상태 안내만 있는 Home 골격을 만들어 로그인·온보딩 완료 후 착지 화면으로 사용한다. Activity Card 등 Home 콘텐츠와 하단 탭바는 Stage 3에서 추가. 설정 아이콘은 처음부터 최종 위치(C-16) | 2026-09-14 |
| C-19 | 동의 이력 보기 (C-15 보완) | **선택 기능** — Stage 8에서 여유가 있으면 구현하는 읽기 전용 목록. 미구현이어도 QA FAIL 아님. Stage 8 필수 이월 기능은 데이터 관리 UI · 탈퇴 | 2026-09-14 |
| 1 | Stage 0 산출물 승인 | **승인** — 문서 9종(PLANNING, ARCHITECTURE, DATA_MODEL, API_CONTRACTS, FIGMA_SCREEN_MAP, COMPONENT_MAP, DESIGN_SYSTEM, DESIGN_TOKEN_MAP, FRONTEND_IMPLEMENTATION_PLAN) + 이 결정 기록 + CLAUDE.md · rules · agents (#33 · C-19 반영 기준). Stage 1은 사용자가 진행을 요청하면 plan-agent → design-agent → 승인 체크포인트 순서로 시작한다 | 2026-09-14 |

## 2. 결정 대기 — 요청 순서

| 순서 | # | 항목 | 비고 |
|---|---|---|---|
| ~~1~~ | 7 | Capacitor 도입 여부·시점 | **결정 완료** (§1) |
| ~~2~~ | 4 | 저장소 세부 (로컬 경로, 이전 방식, 홈 git) | **결정 완료** (§1) |
| 3 | 18 | WCAG 대비 수정 방식 | ① 결정 완료 (현재 색 유지, D-01) · ②③④ 디자이너 결정 대기 — 가값 운영 (§4) |
| ~~4~~ | 10 | 토큰 정규화 + 신규 토큰 값 | **결정 완료** (§1) — 값은 가값 운영 (§4) |
| ~~5~~ | 11 | 폰트 | **결정 완료** (§1) |
| ~~6~~ | 12 | Breakpoint · 앱 컬럼 최대폭 | **결정 완료** (§1) |
| ~~7~~ | 15 | 내비게이션 구조 | **결정 완료** (§1, D-02) |
| ~~8~~ | 14 | Capability 사용자 노출 라벨 | **결정 완료** (§1) |
| ~~9~~ | 19 | Capability 색 매핑 | **결정 완료** (§1) |
| ~~10~~ | 21 | 아이콘 소스 | **결정 완료** (§1) |
| ~~11~~ | 22 | 공통 상태 디자인 방식 | **결정 완료** (§1) |
| ~~12~~ | 17 | contracts 상수 가값 | **결정 완료** (§1) |
| ~~13~~ | 1 | Stage 0 산출물 전체 승인 | **승인 완료** (2026-09-14) |
| — | (없음) | Stage 2 전 결정 C-1~C-18 모두 완료 | — |

## 3. 사용자 수용 예외 (Accepted Deviations)

PRD 요구사항과 다르게 가기로 사용자가 명시적으로 결정한 항목. stage-qa-agent는 해당 요구사항을 `FAIL` 로 기록하되, Stage Verdict 계산에서는 사용자 수용 항목으로 처리한다 (`PASS (accepted: D-xx)`, `.claude/rules/qa.md` §2).

| ID | PRD 요구 | 결정 | 범위 | 일자 |
|---|---|---|---|---|
| D-01 | §11 접근성: 양육자 화면 WCAG AA | Accent(주요) 버튼의 파스텔 teal `#85bfb6` 배경 + 흰 라벨(2.07:1) 유지 | 주요 버튼·선택 칩 등 `--color-action-primary-bg` 위 흰 라벨에 한정. 보조 텍스트·비텍스트·focus는 포함하지 않음 (디자이너 결정 대기) | 2026-09-14 |
| D-02 | §6.1 내비게이션: 하단 3탭 서재 / 세션(중앙 강조) / 리포트, 홈 = 상단 집 아이콘 | 하단 탭 Library / Home(중앙) / Progress (Figma `25:87`). 세션은 Activity Card·서재에서 시작 | 탭 구조, 라우트(세션 탭 진입점 없음), 리포트 탭 라벨 | 2026-09-14 |
| D-03 | §7.2 Step 1 "이름(닉네임)", §11 아동 데이터 최소 수집 | 아이 이름을 성·이름 두 칸으로 수집 (Figma `179:1740`) | 아이 이름 입력 필드. 화면 호칭은 이름(first name)만 사용. 법무 확인 L-07 | 2026-09-14 |
| D-04 | §7.2 Step 5: 역량별 동일 문항 수, 5점 리커트 | Baseline Survey v1 10문항 (역량별 2/3/2/3, 빈도 5단계 + 비채점 응답) | 온보딩 Step 5 문항·역량 점수 산출 | 2026-09-14 |
| **D-05** | §7.1 동의: 이용약관·개인정보처리방침 본문 제시 | 실제 약관·방침 **본문과 URL 없이 그대로 진행**한다. Mock 은 가짜 URL 을 쓰고 동의 화면은 외부 링크 슬롯만 유지한다 | Frontend 구현·QA 범위에서 **FAIL·차단 사유가 아니다**. 출시 전 차단 항목으로는 **유지**된다 — 법무 `L-02` 는 `검토 대기` 그대로 | 2026-11-07 |
| **D-06** | `L-D4` 저작권: 데모 배포 전 표지 에셋 교체 (`P3-BIP-19`) | Figma 에서 가져온 **상용 그림책 표지 4종 임시 에셋을 교체하지 않고 그대로** 둔다 — *The Most Magnificent Thing* · *Grumpy Monkey* · *After the Fall* · *Where the Wild Things Are* | Stage 8 배포 게이트에서 **FAIL 사유로 삼지 않는다**. 표지 에셋 교체 작업은 Stage 8 Deliverable 에서 제외한다 | 2026-11-07 |

참고: 미국 시장 앱 접근성(ADA 등) 관련 분쟁 가능성은 출시 전 법무 검토 항목에 포함한다.

⚠️ **D-06 에 남는 위험 (Orchestrator 보고, 2026-11-07)** — 이 수용은 *저장소와 개발·QA 범위*에서 게이트를 해제한다. 그러나 `C-18` Mock 데모 웹 프리뷰는 **정적 호스팅에 공개 배포**하는 산출물이고, 상용 그림책 표지가 외부에 노출되는 지점은 바로 거기다. 저작권 노출 위험 자체는 수용으로 사라지지 않는다. Stage 8 Plan 에서 다음 중 하나를 선택하도록 **열어 둔다**: ① 프리뷰를 링크 비공개·접근 제한으로 배포 ② 프리뷰 빌드에서만 표지를 대체 이미지로 치환 ③ 위험을 그대로 안고 공개. 사용자 결정 전까지 ①·② 중 하나를 권장안으로 제시한다.

## 4. 가값 (Provisional Values) 운영

디자이너 결정 전까지 가값으로 구현하는 항목 (Stage 0 #10-4, 2026-09-14).

운영 규칙:
1. development-agent는 `packages/design-tokens` 의 해당 토큰 정의에 `provisional` 표시(주석)를 남긴다. 컴포넌트는 토큰만 참조하므로 값 교체 시 컴포넌트 코드를 수정하지 않는다.
2. **Stage 1 구현 완료 후** Orchestrator가 아래 항목을 **하나씩** 사용자에게 제시하고 `유지(확정)` / `수정(새 값)` / `디자이너 대기 유지` 승인을 요청한다.
3. 결정된 값은 이 표와 `docs/DESIGN_TOKEN_MAP.md` 에 반영하고 `provisional` 표시를 제거한다.
4. stage-qa-agent는 남은 가값 목록을 QA 리포트에 기록한다 (가값 자체는 FAIL 사유가 아니다).

| # | 항목 | 가값 출처 | 상태 |
|---|---|---|---|
| P-01 | 보조 텍스트 색 `--color-fg-secondary` (#18-2) | 현재 Figma `text-secondary` `#7d9291` | 디자이너 대기 |
| P-02 | 비텍스트 요소: 진행 바·별점·칩 경계·배지 글자 (#18-3) | 현재 Figma 값 | 디자이너 대기 |
| P-03 | focus ring `--color-focus-ring` (#18-4) | design-agent 제안 (`--haru-ink-700`) | 확정 (2026-09-22) |
| P-04 | status 색 (info/success/warning/error) | DESIGN_TOKEN_MAP §4 제안 | 디자이너 대기 |
| P-05 | scrim | DESIGN_TOKEN_MAP §4 제안 | 디자이너 대기 |
| P-06 | z-index 스케일 | DESIGN_TOKEN_MAP §4 제안 | 확정 (2026-09-22) |
| P-07 | motion duration / easing | DESIGN_TOKEN_MAP §4 제안 | 확정 (2026-09-22) |
| P-08 | safe-area inset 토큰 | DESIGN_TOKEN_MAP §4 제안 (breakpoint 600/1024 · 앱 컬럼 480은 #12에서 확정) | 확정 (2026-09-22) |
| P-09 | 아이콘 크기 단계 `--size-icon-sm/md/lg` | DESIGN_SYSTEM §7 · TOKEN_MAP §4 제안 | 확정 (2026-09-22) |
| P-10 | 공통 상태 화면·컴포넌트 상태 디자인 (#22) | design-agent 명세 (DESIGN_SYSTEM · FRONTEND_IMPLEMENTATION_PLAN Stage 1) | 사용자 확인 중 |
| P-11 | glass·tinted 표면 위 `text-button`(`#5e7370`) 라벨 대비 4.18–4.48:1 — Glass 버튼 라벨, PromptPill, 설문 "Question 1 of 10" 등 (D-01 범위 밖) | 현재 Figma 값 | 확정 (2026-09-22) |
| P-12 | `--radius-surface` 22px vs 24px | Figma 화면 값 혼재 (DESIGN_TOKEN_MAP) | 확정 (2026-09-22) |
| P-13 | 화면 좌우 gutter 24px vs 26px | Figma 화면 값 혼재 | 확정 (2026-09-22) |
| P-14 | 배경 gradient stop 위치 46% vs 52% | Figma 화면 값 혼재 | 확정 (2026-09-22) |
| P-15 | 버튼 높이 (56px / 58px 혼재) | Figma 화면 값 혼재 | 확정 (2026-09-22) |
| P-16 | 캐릭터 medallion 크기 (188 / 200 / 232px 등 혼재) | Figma 화면 값 혼재 | 디자이너 대기 |

디자이너 확인이 필요한 값이 새로 발견되면 같은 규칙(#10-4)으로 P-xx를 추가한다 (2026-09-14 critic 검토에서 P-11~P-16 추가).

## 5. 반영 상태

- `CLAUDE.md`, `.claude/rules/*`, `.claude/agents/*`: #5, #6, #8, #16, #24, #25, #26(설정 예정), #27, #9, #28, #29, #7, #4 반영 (2026-09-14)
- 저장소 이전: OneDrive `HARU Dev` → `~/dev/haru` (2026-09-14). `docs/source/` 사본으로 경로 참조 교체, `$HARU_ONEDRIVE` 경로 정의는 CLAUDE.md
- #26 hook: `.claude/settings.json` + `.claude/hooks/write_guard.py`, `scope_check.py` 설정 완료 (다음 세션부터 적용)
- `PLANNING.md`, `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_MODEL.md`, 디자인 문서 5종: 남은 Stage 1 차단 결정 수집 후 plan-agent / design-agent가 라벨·내용 일괄 반영 예정
- Stage 0 문서 9종에 결정 반영 완료 → 독립 검토(critic) 반영 → 사용자 승인 (2026-09-14)

## 6. 법무 검토 필요 항목 (Legal Review)

출시 전 미국 변호사 검토가 필요한 항목. 결정이 나면 해당 결정 행과 문서를 갱신한다.

| ID | 항목 | 관련 결정 | 상태 |
|---|---|---|---|
| L-01 | COPPA 검증 가능한 보호자 동의(VPC) 방식 | C-3 | 검토 대기 |
| L-02 | 파일럿 참여 동의의 필수/선택 여부·문구 | C-1 | 검토 대기 — **약관·방침 본문·URL 부재는 `D-05` 로 수용**(2026-11-07). 법무 질의 자체는 열려 있고 출시 전 차단 항목으로 남는다 |
| L-03 | 동의 철회 미제공(C-4)이 COPPA 보호자 권리와 충돌하는지, 전체 삭제 요청(FR-21)으로 충분한지 | C-4 | 검토 대기 |
| L-04 | 접근성(ADA 등) — 주요 버튼 대비 수용 예외 | D-01 | 검토 대기 |
| L-05 | 개정 COPPA 서면 데이터 보관 정책·정보보안 프로그램 | research §12 | 검토 대기 |
| L-06 | STT·AI·Push 벤더의 아동 데이터 처리 조건 (ZDR·DPA) | Backend Handoff | 검토 대기 |
| L-07 | 아이 성(last name) 수집이 개정 COPPA 최소 수집 원칙에 맞는지 | C-6, D-03 | 검토 대기 |
