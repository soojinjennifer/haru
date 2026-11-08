# Stage 4b Visual Gap — `S4-H2` · `S4-H2F` 예외·안내 UI

Status: DRAFT — 사용자 결정 대기 (§5)
작성: design-agent, 2026-11-03
Based on: 인계 `docs/qa/stage-4b-handoff.md` `# S4-H2`(H2-1~8) · `# S4-H2F`(H2F-1~9) · 4b Spec `docs/design/stage-4b-design-spec.md` §7.1~§7.3 · §8.2 · §17.1 · 상위 Spec `docs/design/stage-4-design-spec.md` §7 · 결정 `D4-26` · `D4-58`(CP-4/5/6) · `D4-103` · `D4-111`~`D4-118` · Figma `300:1309` · `298:1262` · `298:1340` · `298:1245` (조회 2026-11-03)

Production Code · Figma · 4b Spec 수정 없음 (4b Spec 은 다른 design-agent 가 `S4-H2R`/`H3` 절 작성 중 — 정정 필요 사항은 §4 에 목록으로만 둔다). 허용 차이는 등록하지 않았다 (후보만, §6).

예외 UI 자체는 Figma 에 없다(C-13 명세). 이 검토는 ① **Figma 요소가 움직이거나 가려지지 않았는가** ② 명세·결정과 일치하는가 ③ 기존 컴포넌트·토큰 재사용인가를 본다.

## 0. 측정 방법 (`R-FIGMA-1` ⑤)

- Figma: `get_screenshot` `300:1309`(ready+닫기) · `298:1262`(recording) · `298:1340`(paused) 393×852 1x · `298:1245`(PermissionDenied 변형) 164×169. 예외 UI 노드는 없음.
- 구현: 이 검토 단독으로 dev 서버(포트 4331, 5173 아님)를 띄우고 Playwright 번들 Chromium(library 모드)로 측정. DSF 1, `reducedMotion: reduce`, dev 패널 `visibility: hidden`(`R-BASELINE-1` ②). 시작 전 4319/4331/5173 리슨 0 · Playwright 프로세스 0 확인. 종료 후 내가 띄운 서버만 종료, 4331 리슨 0 확인. 다른 프로세스 kill 없음.
- 진입: 실제 경로(로그인 → Home → `Start Session` → Reading Context `Bedtime` → `/session/:id`), 이미지 디코드 + 2 rAF 후 촬영. 녹음 화면은 `page.clock` 으로 시계를 멈춰 `00:05` 에서 촬영(공지 있음/없음 동일 시각).
- 좌표: `getBoundingClientRect`. 스타일: `getComputedStyle`. 가림 여부: `document.elementFromPoint`.
- 픽셀 대조: 채널 최대차 > 16 인 픽셀 수와 그 bbox. "영역 밖 0" = 해당 UI 를 뺀 나머지 프레임이 픽셀 단위로 같다는 뜻이다.
- ⚠️ Web 측정 환경에 상태바·safe-area 가 없다. 위 앵커 요소는 Web y + 56 = Figma y, 아래 앵커(Record·바)는 같은 y 다 (기존 visual-gap 문서와 동일 조건).
- 측정하지 못한 것: §7.

## 1. 대상별 결과

| # | 대상 | 측정 | 결과 |
|---|---|---|---|
| 1 | **마이크 시트** (§7.3, `AD-S4-16` 후보) | 시나리오 `recorder:mic-permission-denied` → `Start recording` | 기존 `Sheet variant="bottom"` · 393×215 @y637 · padding 24 · radius 28/28/0/0 · 면 `rgba(255,255,255,.9)` · scrim `rgba(0,0,0,.34)`. 제목 17/22 · 590 · `#4a5f5c` (대비 6.14) · 안내 15/20 · 400 · `#7d9291` (시트 면 실측 `243,243,244` 위 **2.96** — `P-01` 범위 2.91~3.13 안) · `Not now` glass 345×45 @y783. 신규 CSS·토큰 0. **`Talk without recording` 없음** → VG-H2-03 |
| 2 | **PermissionDenied ready** (시트 닫은 뒤) | ready ↔ ready-PD 전체 프레임 대조 | 차이 bbox **(136,635)–(257,756)** = Record Control 안쪽만. **그 영역 밖 0px** ✓. Record 150×150 @121.5,621 불변. 이름 `Microphone is off` · `aria-haspopup="dialog"` · `aria-disabled` 없음 · `Not now` 후 포커스 Record ✓ · 다시 탭 → 같은 시트 ✓ (`D4-118`). 글리프 자체는 `VG-G1-06` 에서 닫힘(bbox 동일, 피복 −1.8%) |
| 3 | **대화 전용 ready** (CP-6) | ⚠️ 브라우저에서 `conversation_only` 세션을 만들 경로가 없다(`D4-112` 미구현) → PD ready 에서 `Submit` 의 `aria-disabled` 만 런타임에 떼어 **시각만 모사** | `Submit` opacity 1 · `Discard` .5 · 차이 bbox (201,789)–(335,833) = `Submit` 만 ✓. 실제 경로·사유 문구(`conversationReason`)는 unit 증거만 (§7) |
| 4 | **공지 슬롯** 393×852 (§7.2, `AD-S4-14` 후보) | `recorder:web-background-warning`, recording·paused 각각 공지 있음/없음 대조 | 슬롯 345×**114** @24,**481** (상태 블록 bottom 455 → 위 26 · Record 621 → 아래 26). **슬롯 밖 0px** (recording · paused 둘 다) ✓ — Figma 요소 이동·가림 0. 책 칩 281 · 상태 344 · Record 621 · 바 789 · 닫기 331,10 불변. `InlineAlert info` · 면 `226,238,243` · 테두리 1px `127,174,193` · radius 22 · padding 16 · **그림자 none**(`R-SHADOW-1` 대상 아님) · `role=status` `aria-live=polite` · `Dismiss` 38×38. 글자 대비 4.93 ✓. paused 로 넘어가도 유지(H2-4 ③) |
| 5 | **공지 → Toast 대체** | 393×760 · 720 · 700 · 320×568 · 320×852 | 393: **760 부터 이미 Toast**(stage 263 < 필요 303). 320×852 는 슬롯 272×**152**(4줄)로 들어간다. Record y 는 대체 전후 불변(700: 469=469). → VG-H2-01 · VG-H2-02 |
| 6 | **오프라인 / 복구 Toast** | ready 에서 `context.setOffline(true/false)` | `Toast neutral` 345×50 @24,**16** · 문구 `You're offline. Your recording stays on this device.` / `You're back online.`. Toast 영역 밖 0px ✓ (이동 0). **닫기(331,10 38×38)를 덮는다** — `elementFromPoint(350,29)` · `(80,28)` = Toast → VG-H2-02 |
| 7 | **30분 자동 종료** | 녹음 1초 → 시계 +1,800,000ms | `/session/:id/complete` 이동 ✓ · Toast `We saved your session at 30:00.` neutral @y**64** (= `D4-103` 닫기 줄 inset, 완료 화면 기준과 같다) ✓ · 스티커는 Toast 퇴장 후(`D4-100`) |
| 8 | **크래시 복구 Toast** (`D4-117`) | — | 브라우저 재현 불가 (H2F-5 ① seed 미연결). 코드 확인: 기존 `Toast neutral`, `ToastProvider` 안 1회 마운트 → 위치는 6 과 같은 규칙(`ToastProvider` 기본 상단, 등록된 inset 이 있을 때만 아래로) |
| 9 | **대화 전용 Submit Toast** (`D4-118`) | — | 3 과 같은 이유로 브라우저 재현 불가. 문구만 다르고 기존 `Toast success` → 완료 화면(inset y64) |
| 10 | **`/complete` 직접 진입** (`D4-113`) | recording 중 SPA 이동(`history.pushState` + `popstate`) | 홈 `/` · 완료 제목 0 ✓. paused 는 unit 증거. 새로고침 경로는 Mock 인증이 메모리라 `/auth/welcome` 으로 가서 측정 불가 (§7) |

부수 관찰: 320×568 에서 녹음 시작 후 Record 433 → 414 · 닫기 y −9 는 Playwright `click` 의 scroll-into-view 때문이다(≤627 세로 스크롤 구간 `D4-82`). 공지와 무관.

## 2. Gap 목록

| ID | 대상 | 기대 (Spec/결정) | 구현 (실측) | Severity | 권고 | 결정 필요 |
|---|---|---|---|---|---|---|
| **VG-H2-01** | 공지 슬롯이 실제로는 거의 안 보인다 | §7.2 "Figma 유연 간격 **110** 안에 `InlineAlert` 1개" | `InlineAlert`(제목+설명+Dismiss) 높이 **114** (393) / **152** (320) > 110. 슬롯이 들어가려면 Web 뷰포트 ≥ **800** (393) / ≥ **838** (320) `[계산: stage 콘텐츠 189 + 슬롯]`. Figma 기준 콘텐츠 높이 796(상태바 제외)에서도 들어가지 않고, iPhone Safari(콘텐츠 ≈ 660~760)에서는 **항상 Toast** 다. e2e 의 393×852 는 상태바가 없어 유연 간격이 166 이라 통과한다 | **Medium** | ⓐ 현행 유지 — 실기기 기본 경로는 Toast 로 받아들이고 VG-H2-02 를 고친다 (**권고**) ⓑ 슬롯 내용을 제목 1줄 + Dismiss 로 줄여 110 안에 넣는다(설명은 Toast/접근성 이름) ⓒ 슬롯 폐지, 항상 Toast | **예** |
| **VG-H2-02** | 세션 화면 Toast 가 상단 줄을 덮는다 | §7.1 "레이아웃 이동 0" — 가림은 명세에 없음. 완료 화면은 `D4-103` 으로 닫기 줄 아래(y64) | 세션 화면은 inset 미등록 → Toast @y16 (높이 50 / 대체 공지 68 / 320 폭 86) 이 **Prompts 칩 · 닫기를 4초간 덮고 탭도 가로챈다**(`elementFromPoint` 확인). 오프라인 · 복구 · 백그라운드 대체 · (기존) `closeFailed` · 크래시 복구 모두 해당. 이동은 0 | **Medium** | 세션 화면에서도 상단 줄(칩·닫기 줄)을 `useToastTopBarInset` 으로 등록 — `D4-103` 과 같은 방식, Toast y = 줄 bottom + 16 ≈ 64. 메달리온 위쪽과 겹치지만 완료 화면과 같은 배치. 신규 토큰 0 | **예** (Figma 밖 배치) |
| **VG-H2-03** | 마이크 시트 버튼 | §7.3 `Button accent` `Talk without recording` + `Button glass` `Not now` | `Not now` 1개 (H2-D1 → `D4-112`: ready 중 모드 전환 없음) | Low (의도된 생략, 결정 반영) | 구현 변경 불필요. `S4-H2R` 명세에서 §7.3 을 "시트 = 안내 + `Not now`" 로 정정할지, `D4-112` 흐름의 다른 진입점을 둘지 확정 | `S4-H2R` 에서 |
| **VG-H2-04** | 4b Spec §7.1 표가 결정과 어긋난다 | — | ① "30분 근접 / 자동 종료 → 공지 슬롯 `InlineAlert warning`" ↔ `D4-116`(근접 없음) · 구현 = 완료 화면 Toast ② "크래시 복구 → S6 완료 화면 상단" ↔ `D4-117`(앱 시작 Toast 1회) ③ "Web 백그라운드 → S2" ↔ 구현은 paused 까지 유지 ④ §7.2 "우선순위: 30분 근접 > 백그라운드" 근거 소멸 | Low (문서) | Spec 정정 — 이번엔 파일 수정 금지라 **다음 Spec 개정 때 반영**(`S4-H2R` 작성자에게 전달) | 아니오 (결정 반영만) |
| **VG-H2-05** | 공지 슬롯의 시각 계열 | Figma 없음. 세션 화면 표면은 전부 glass(white 74%) | `InlineAlert info` = 파랑 계열 면·테두리(`P-04` 가값) · Dismiss 글리프 = Lucide `x` (같은 화면 닫기는 HARU SVG `D4-62`) | Info | 기존 공용 컴포넌트 그대로라 규칙 위반 아님. 디자이너 확인 대상으로만 기록 | 선택 |

Critical · High 없음.

## 3. 일치 확인 (Gap 아님)

- Figma 요소 이동 0: 공지(recording·paused) · 오프라인 Toast · PD 변형 · 대화 전용 모사 모두 해당 UI bbox 밖 **0px**.
- 신규 토큰 · 신규 CSS 값 0. 새 CSS 는 `.haru-session__notice { flex:none; inline-size:100%; margin-block:auto }` 하나(값 없음). 새 `overflow` 0.
- `R-SHADOW-1`: `InlineAlert` 그림자 none, Toast·Sheet 는 기존 컴포넌트(overflow 조상 변경 없음).
- 접근성 이름·`aria-haspopup`·포커스 복귀·`role=status` 는 Spec §9.1 과 같다.
- 자동 종료 Toast 위치 = `D4-103` (y64) ✓.

## 4. Spec 정정 대상 (4b Spec — 이번에 수정하지 않음)

§7.1 행 4건(VG-H2-04 ①~④) · §7.2 "110 안에 1개" 전제(VG-H2-01 결정 후) · §7.3 버튼 구성(VG-H2-03, `S4-H2R`) · Toast 세로 위치를 세션 화면에도 적용할지(VG-H2-02 결정 후 §17.1 확장).

## 5. 사용자 결정 필요

| # | 질문 | 권고 |
|---|---|---|
| 1 | VG-H2-01 공지 슬롯: ⓐ 현행(실기기 = Toast) / ⓑ 슬롯을 1줄로 축소 / ⓒ 슬롯 폐지 | ⓐ + 2번 |
| 2 | VG-H2-02 세션 화면 Toast 를 상단 줄 아래(y≈64)로 내릴지 (`D4-103` 방식 확장) | 내린다 |
| 3 | VG-H2-05 공지 면 색(info 파랑) · Lucide `x` 를 그대로 둘지 | 그대로 (디자이너 확인 항목으로만) |

## 6. 허용 차이 등록 후보 (등록 금지 — 사용자 승인 사항)

| 후보 | 내용 | 조건 |
|---|---|---|
| **`AD-S4-14`** | 세션 공지 슬롯(`InlineAlert info`, 유연 간격 가운데) + 세션 화면 `Toast neutral`(오프라인 · 복구 · 공지 대체) | 결정 1 · 2 반영 뒤 최종 배치로 등록 |
| **`AD-S4-16`** | 마이크 거부 안내 시트(`Sheet bottom`, 제목 · 안내 · `Not now`) | `S4-H2R` 에서 버튼 구성 확정 뒤 등록 |

## 7. 측정하지 못한 것

| 항목 | 이유 | 대체 증거 / 절차 |
|---|---|---|
| 크래시 복구 Toast 브라우저 표시 | `?scenario=recorder:crash-recovered` 가 브라우저 저장소를 seed 하지 않는다 (H2F-5 ①) | unit 3건. seed 연결 후 393×852 에서 Toast y·가림 재측정 |
| 대화 전용 ready 실경로 · `Session submitted` Toast | 브라우저에서 `conversation_only` 생성 경로 없음 (`D4-112` 미구현) | §1-3 시각 모사 + unit. `S4-H2R` 구현 후 재측정 |
| `/complete` 새로고침 진입 (paused) | Mock 인증이 메모리라 새로고침 → `/auth/welcome` | SPA 이동(recording) + unit(paused) |
| iOS Safari 실기기 (safe-area · dvh · 탭 전환 경고) | 기기 없음 | VG-H2-01 의 계산이 실기기에서 맞는지(Toast 로 대체되는지) 확인 |

측정 산출물(저장소 밖): `/private/tmp/claude-501/-Users-soojin-dev-haru/7b50a86b-2be0-48a1-abae-023eff5d2b12/scratchpad/vgh2/` (`impl/*.png` · `impl/results.json` · `figma/*.png`).
