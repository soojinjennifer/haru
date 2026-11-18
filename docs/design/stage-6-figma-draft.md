# Stage 6 — Figma DRAFT 기록

Status: **DRAFT — 사용자 승인 전** (2026-11-15). 근거 = `docs/design/stage-6-design-spec.md` (Status DRAFT) · `docs/decisions/stage-6-approvals.md` `D6-1`~`D6-7`.
사용자 요청: *"이번 stage 6에서 생성될 화면을 피그마에 먼저 그려줘. 기존에 그려져 있는 화면을 다치지 않고, 하단에 그려줘"*

> 이 Section 은 **디자이너 프레임이 아니다.** design-agent 명세(C-13 ②)를 시각화한 것이며, 디자이너 `1g · Profile result` · `1h · Growth capability` 가 들어오면 교체 대상이다 (`R6-01`). 승인 전에는 Figma 최우선 규칙의 "Figma 정본"으로 쓰지 않는다.

## 1. 위치

| 항목 | 값 |
|---|---|
| 파일 · 페이지 | `YWWu3AFEJpRxvw0T5klq0k` · `16:2` MVP_KeyScreen_V.2 |
| Section | **`317:1358`** `Stage 6 — DRAFT (design-agent spec, 사용자 승인 전)` |
| Section 위치·크기 | x −508 · y 7515 · 3391 × 5232 (기존 최대 bottom 7115 + 400) |
| 주석 텍스트 | `323:2114` DRAFT note · 행 제목 `319:1373` · `320:1438` · `321:1536` · `323:1778` |

## 2. 기존 노드 불변 확인

| 측정 | 작업 전 | 작업 후 |
|---|---|---|
| page `16:2` 최상위 노드 | 3 (`31:204` · `179:1700` · `296:1127`) | 4 (= 기존 3 + `317:1358`) |
| 기존 3 Section 바운드 | `31:204` −508,0 6309×2177 · `179:1700` −508,2473 4332×1523 · `296:1127` −417,4598 5992×2517 | **동일** |
| 전체 바운드 최대 bottom | 7115 | 기존 노드 7115 그대로 (새 Section 12747) |
| page 전체 노드 수 | 2088 | 3542 = **2088 (기존, 변화 0)** + 1454 (새 Section) |

방법: `use_figma` 읽기 스크립트로 `page.children` 바운드와 `page.findAll()` 개수를 작업 전·후 측정. 재사용 노드(`248:1159` · `243:1147` · `179:1770` · `163:2607` · `243:1155` · `243:1167` · `248:1172` · `248:1175` · `179:1808` · `244:1360/1366` · `244:1314` · `244:1394` 등)는 **`clone()` 만** 했고 원본 속성은 쓰지 않았다. 컴포넌트(`76:439`·`441`·`443`·`445` Tag · `17:4` Button Glass · `76:416` · `76:447` · `244:1239` Input)는 `createInstance()` 만 — 메인 컴포넌트 수정 0. 새 Variable · Style · Component 생성 0.

## 3. 프레임 목록 (25)

### Row 1 — `C13-09` 프로필 결과 (Spec §2.1 · §2.2 · §3.1 · §3.3~3.6 · §10.1)

| 노드 | 이름 | 근거 |
|---|---|---|
| `319:1374` | C13-09 Profile — onboarding · variant A (4 axes) | §2.1 · §3.1 변형 A |
| `319:1546` | C13-09 Profile — onboarding · variant B (Cognitive Flexibility null) | §3.1 변형 B (열린 면 · 점선 축 · *Not seen yet*) |
| `319:1714` | C13-09 Profile — onboarding · variant C (all null) | §3.1 변형 C 캡션 · §3.5 빈 묶음 문장 |
| `319:1876` | C13-09 Profile — revisit · updated (FR-15 UpdateNote) | §2.2 (TopBar *Profile*, CTA 없음) |
| `319:2052` | C13-09 Profile — onboarding · Loading (Skeleton) | §3.6 |
| `319:2115` | C13-09 Profile — onboarding · Error (ErrorState + Continue to Home, N6-37) | §2.3.1 · `N6-37` |

### Row 2 — `C13-10` / `C13-S6-4` 발전 역량 (Spec §2.3 · §3.1 selectable · §3.2 · §10.2)

| 노드 | 이름 |
|---|---|
| `320:1439` | C13-10 Growth — onboarding · default (Suggested preselected) |
| `320:1565` | C13-10 Growth — onboarding · user changed (Suggested stays on original) |
| `320:1691` | C13-10 Growth — onboarding · no suggestion (all null · CTA disabled + reason) |
| `320:1811` | C13-10 Growth — onboarding · save failed (InlineAlert, selection kept) |
| `320:1945` | C13-S6-4 Growth — settings · default (Current · Save disabled) |
| `320:2071` | C13-S6-4 Growth — settings · changed (Save enabled) |
| `320:2196` | C13-S6-4 Growth — settings · offline on save (InlineAlert) |

### Row 3 — `C13-S6-1` 설정 목록 · `C13-S6-2` 아이 정보 · `C13-S6-6` (Spec §2.4 · §2.5 · §2.7 · §10.3 · §10.4)

| 노드 | 이름 |
|---|---|
| `321:1537` | C13-S6-1 Settings — list (YOUR CHILD 4 rows · ACCOUNT log out) |
| `321:1668` | C13-S6-6 Settings — Toast success "Saved" (after child info save) |
| `321:1806` | C13-S6-2 Child info — default (no changes · Save disabled) |
| `321:1936` | C13-S6-2 Child info — dirty · save failed (InlineAlert, edits kept) |
| `321:2073` | C13-S6-2 Child info — leave while dirty (ConfirmDialog) |
| `321:2213` | C13-S6-2 Child info — Loading (Skeleton text lines=6, Save hidden) |

### Row 4 — `C13-S6-3` 설문 재응답 · `C13-S6-6` (Spec §2.6 · §10.3)

| 노드 | 이름 |
|---|---|
| `323:1779` | C13-S6-3 Survey update — entry · Start (`243:1147` 복제) |
| `323:1816` | C13-S6-3 Survey update — entry · resume draft (survey-update-draft) |
| `323:1853` | C13-S6-3 Survey update — card (Step 2–5, prefilled · `179:1770` 복제, 변경 0) |
| `323:1894` | C13-S6-3 Survey update — last card · submit failed (InlineAlert + "Save answers") |
| `323:1961` | C13-S6-6 Survey update — state lookup failed (ErrorState + Try again) |
| `323:2027` | C13-S6-3 Survey update — submitted → /settings/profile (Toast + UpdateNote "latest answers") |

## 4. 그리는 방식

- 프레임 = `248:1159` 복제 후 자식 정리(배경 그래디언트 · radius · Status Bar 그대로) · 393 폭. 스크롤 화면은 `248:1159`(1132) 선례대로 **세로만 내용 길이로 늘림**(852 → 936~1150).
- TopBar = `248:1172` Back 버튼 + `248:1175` 제목 텍스트 복제. Home indicator = `179:1808` 복제.
- ProfileCard · ListGroup 면 = `163:2607` 복제(`glass-fill-strong` 바인딩 · Effect Style `HARU/Shadow Rest` · radius 24 · pad 16 · gap 12).
- 텍스트 = 기존 노드 복제 후 문구 교체: h1 `243:1156` · 본문 `243:1157`(fill → `HARU/text-primary`, Spec §2.0 Q2) · SectionLabel `244:1427` · footnote `248:1181` · 카드 제목 `163:2608`.
- 역량 Tag = `76:440` 변형 인스턴스(Self-Direction=green · Emotion=pink · Flexibility=cyan · Motivation=purple, 디자인 토큰 `--color-capability-*` 매핑과 같음).
- RadioGroup = `Answer card 244:1376` 의 행(`244:1360` 미선택 · `244:1366` 선택) 복제 + `meta` 텍스트(caption-1 12) 추가 (§3.2 확장).
- 아이 정보 입력 = `Input 76:417` 변형 인스턴스(`Line_2` · `boxcount2/badge` · `boxcount5`) + 언어 칩 카드 `244:1314` · 독서 루틴 `244:1394` 복제.
- CTA = `243:1167`(Button Accent Rest) 복제, 비활성 = `17:18` Accent Disabled 로 swap. 보조 버튼 = `17:4` Glass Rest 인스턴스.
- 다이아몬드 차트 = SVG 벡터(`createNodeFromSvg`) 후 색을 변수로 재바인딩: 격자·축선 `HARU/stroke` · 면 `accents/teal` + 레이어 opacity 0.3 · 외곽선 teal 2px · 꼭짓점 `accents/{green,pink,cyan,purple}` + 흰 2px 테두리(`grays/white`) · 선택 링 teal r9(=18). 축 순서 위 Self-Direction → 오른쪽 Emotion Regulation → 아래 Cognitive Flexibility → 왼쪽 Intrinsic Motivation. `h = min(100,(313−140)/2) = 86.5`, `r(v)=h·v/5`, 숫자 미노출, 중간 눈금 링 없음, 페르소나 일러스트 없음.
- 아이콘 = Lucide SVG (`rotate-ccw` · `chevron-right` · `triangle-alert` · `circle-alert` · `x`).
- 표시 데이터 = Mock fixture (`MOCK_CHILD_FIRST_NAME` *Emma* · persona *The Quiet Noticer* `apps/web/src/mocks/fixtures/profile-result.ts`). 차트 값은 예시이며 화면에 숫자 노출 없음.

## 5. 생략한 상태 (보고)

| 상태 | 이유 |
|---|---|
| 프로필 `persona-fallback` · `persona-changed` · `empty` | Spec 상 **레이아웃·구분 UI 0** (텍스트만 다름 / UpdateNote 0 = 온보딩 모드와 동일 구조) — 별도 프레임 불필요 |
| 프로필 Offline · Retry (조회) | ErrorState `tone=offline` 은 문구·아이콘(`wifi-off`)만 다름 — Error 프레임 1개로 대표 |
| 발전 역량 Loading · 조회 Error · 저장 중(`Button loading`) · null 축 선택 | Loading/Error 는 프로필 프레임과 같은 패턴. `Button loading` 스피너는 Figma 컴포넌트에 상태가 없어 미표현 |
| 아이 정보 `validation-failed` 필드 오류 · 초기값 Error · 오프라인 | 필드 오류 표현(TextField error)이 Figma `Input` 컴포넌트에 없음 → 미표현. 오프라인은 save-failed 와 같은 InlineAlert 패턴 |
| 재응답 Loading(카드 Skeleton) · draft 저장 실패(시각 변화 0) · 오프라인 제출 | 같은 패턴 반복 / Spec 상 시각 변화 없음 |

## 6. 명세와 다르게 / 해석해서 그린 점

1. **카드 그림자** — Spec §3.4 는 `--shadow-bubble`(Surface `material="bubble"`)이나 Figma 에는 해당 Effect Style 이 없다. `163:2607` 을 **복제**했으므로 그 노드의 Style `HARU/Shadow Rest` 바인딩이 그대로 남는다(Spec §0.3 "Style 은 Shadow Rest, 인스턴스 렌더는 1겹" 과 같은 상태). radius 도 Figma 원값 24 (Spec 22 흡수는 코드 규칙).
2. **ListGroup** — Figma 에 ListRow 컴포넌트가 없어 `163:2607` 면 위에 행(56 · subheadline semibold · chevron 16 `text-secondary`)을 직접 구성. 코드의 `surface-glass` 74% 대신 복제 원본의 `glass-fill-strong` 90% 이다.
3. **InlineAlert · ErrorState 배지 · destructive 버튼 색** — Figma 에 대응 변수가 없어 디자인 토큰 값(`#f7e4e1` / `#a8483e` / `#e8a9a0`)을 **하드코딩**. Toast 성공 테두리는 `accents/green`(= `--haru-palette-green`) 변수. Dialog scrim 은 `iOS 26 Colors/misc/alert-overlay` 변수(코드 `--color-scrim` 34% 와 값이 다를 수 있음).
4. **텍스트 크기** — 본문은 `243:1157`(14.5/22.5), h1 은 `243:1156`(Bold 21/27) 복제라 Spec 의 `subheadline`·`title-3` 토큰 px 와 다를 수 있다. 축 라벨은 12 Semibold `HARU/text-button`(= ink-600).
5. **아이 정보 FieldGroup** — Spec 은 TextField ×2 · SelectTrigger ×3 이나 Figma 에는 편집형 필드가 없어 `Input` 변형으로 표현: `Line_2`(First name · Last name · Optional — `Show` 숨김), `boxcount2/badge`(Birth year · Birth month + 나이 Tag `3yr 8mo`, 성별 배지 숨김), `boxcount5`(Gender · *Not selected*). Year/Month SelectTrigger 의 ▾ 표시는 없음.
6. **설정 모드 발전 역량 안내 문구** — Spec §2.3 트리는 두 모드 모두 "제안 문구"를 둔다. 설정 모드에는 제안값 필드가 없지만(M6-3) 트리를 그대로 따라 *"We've suggested a place to begin…"* 를 넣었다 → **확인 필요**: 설정 모드는 무제안 문구 또는 문구 없음이 맞을 수 있음.
7. **재응답 마지막 카드 CTA 위치** — `179:1770` 에 제출 CTA 가 없어 카드 덱 아래(y 760~)에 InlineAlert + *Save answers* 를 두고 프레임을 964 로 늘렸다. 실제 위치는 온보딩 마지막 카드 구현을 따른다. 카운터 `10 / 10` · 진행바 가득 참은 예시.
8. **재응답 진입 화면** — `243:1147` 를 그대로 복제(캐릭터 · InfoRow 아이콘 유지)하고 TopBar Back 만 추가. InfoRow 두 번째 아이콘은 원본 그대로(list) — Spec 의 `list-checks` 와 다를 수 있음.
9. **Toast** — `243:1155`(Glass Rest · white 90%) 복제로 면을 만들고 radius 22 · 좌측 2px 성공 테두리 · 닫기 `x`. 성공 아이콘은 Toast 구현에 없어 넣지 않음.
10. **차트 선택 히트 영역(≥44)·모션·aria** — 시각 요소가 아니므로 레이어 이름에만 표기.
11. **로컬 컴포넌트 미생성** — DiamondChart · ListRow 등을 Figma 컴포넌트로 만들지 않았다(승인 전 Design Guide 오염 방지). 승인 후 필요하면 별도 요청.

## 7. 문제

- Blocking: 없음.
- Non-blocking: §6-6 문구 확인 필요 · §6-1/2/3 은 Figma 에 대응 Style/Variable 이 없어 생긴 차이(디자이너 프레임 도착 시 정리).
