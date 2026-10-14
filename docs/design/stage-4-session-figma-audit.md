# Stage 4 Session — Figma 실측 감사 (Design Spec 선행)

Status: DRAFT (2026-10-11, design-agent) · **개정 2026-10-13 (Figma 갱신 반영 — §15)**

> ## ⚠️ 2026-10-13 — 사용자가 Figma 를 갱신했다. 이 문서의 2026-10-11 측정 중 일부가 **스테일**하다.
>
> 갱신 범위: 신규 섹션 **`285:1126` "Recording"** · 신규 프레임 **`285:1445` "After_record"** · 신규 Button 변형 **`285:1228` `Variant=Accent, State=Secondary`**.
>
> **`R-BASELINE-1` 준수** — 구버전 측정을 지우지 않는다. 아래 본문의 2026-10-11 값은 **그대로 두고**, 바뀐 자리마다 `⟲ 2026-10-13 정정 → §15.x` 를 달았다. 정정 전문·신규 실측은 **§15** 에 있다.
>
> | # | 2026-10-11 측정 | 2026-10-13 Figma 현재 | 정정 위치 |
> |---|---|---|---|
> | 1 | 하단 버튼 = `140:2870` `Resume`(frame-local 60,787 · 281×45), `28:51` 자식 | **`140:2870` 은 `28:51` 에서 사라졌다.** 자리에 신규 프레임 **`285:1445` "After_record"**(67,789 · 279×45) | §1.2 · §2.1 · §2.6 · §6-1 · §15.2 |
> | 2 | `163:1618` `Discard` · `163:1620` `Submit` = **loose**, 셋 다 **동일 teal 스타일**, *"Discard 에 destructive·secondary 스타일이 없다"* | **둘 다 `285:1445` 의 자식으로 배치**됐고, `Discard` 는 신규 변형 **`Accent/Secondary`** = **`--grays/gray-2` `#aeaeb2`** 다 | §1.2 · §2.6 · §6-6 · §10 `C13-16` · §11 `S4F-10` · §15.3 |
> | 3 | `17:20` Button 세트 = **8변형** | **9변형** — `285:1228` `Variant=Accent, State=Secondary` 신설 | §1.3 · §2.6 · §15.4 |
> | 4 | `163:1601`(Pause 참조) 절대 (2691, 740) | 절대 **(2676, 741)** — 섹션 신설로 좌표계가 바뀌었다. **섹션 직계 자식**이며 프레임 안 Record Control 과 **섹션 좌표 y 가 동일(706)** | §1.2 · §15.5 |
> | 5 | `140:2870` `Resume` 의 소속 | 섹션 **밖**(절대 2441,1200 — 섹션 하단 y1160 아래)으로 **이동**. 라벨은 여전히 `Resume` | §15.2 |
>
> **바뀌지 않은 것** (2026-10-13 재조회로 확인): `28:51` 기하(393×852 @ 섹션-local 15,85 = 절대 2256,120) · `28:73`/`28:74` 메달리온 · **`139:2803` 버블(34,336 · 329×258) 그대로 배치** · `163:1591` Record Control(122,621 · 150×150) · `78:353` Frame 7(섹션-local 15,141 · 393×59) · `163:1590` Record Control 변형 **2개(Record·Pause)** · `29:62` 전체.

대상: Figma `YWWu3AFEJpRxvw0T5klq0k` · page `16:2` MVP_KeyScreen_V.2 (section `31:204`) + page `8:2` Design Guide (section `17:367` "02 · HARU Components", section `221:1147` "Chracter")
범위: **실측과 대조만.** Design Spec 은 쓰지 않았다 (사용자 결정 ⛔ 5건 미결 — `docs/plans/stage-4-plan.md` §14.2). Production Code 0줄. Figma 수정 0건.

---

## 0. 읽는 법

### 0.1 표기 규칙

| 표기 | 뜻 |
|---|---|
| `[실측·meta]` | `get_metadata` 가 돌려준 좌표·크기 |
| `[실측·ctx]` | `get_design_context` 가 돌려준 **선언값** (fill / shadow / 타이포 / 텍스트 원문) |
| `[실측·svg]` | Figma 가 내보낸 SVG 파일의 `filter` / `stroke` / `fill` 선언을 직접 읽음 |
| `[계산]` | 위 실측값에서 산술로 유도 |
| `[픽셀]` | 렌더 PNG 를 디코딩해 채널값을 샘플링 (교차 확인용 — **수치 근거로 쓰지 않았다**) |
| `[문서 인용]` | 저장소 문서에서 가져온 서술. **직접 측정이 아니다** |
| `확인 불가` | Figma MCP 로 알 수 없음 |
| `DECISION-NEEDED` | 사용자 결정 전 명세·구현 금지 |

### 0.2 측정 조건

| 항목 | 값 |
|---|---|
| 조회일 | **2026-10-11** |
| 도구 | Figma MCP `get_metadata` · `get_design_context`(screenshot 제외) · `get_variable_defs` · `get_screenshot` |
| 렌더 PNG | `28:51` 393×852 · `29:62` 393×852 · `78:353` 393×60 — `maxDimension` 로 **원본 배율 1:1** 을 받음 (`original_width` = `width` 확인) |
| 에셋 | SVG 9종 · PNG/JPEG 4종을 `curl` 로 내려받아 파일 내용을 직접 읽음 |
| 좌표 | 전부 **프레임 로컬 좌표**. `28:51`/`29:62` 는 iOS 상태바 56px 를 포함한 393×852 프레임이다 |

### 0.3 `R-FIGMA-1` 준수 기록 (`.claude/rules/frontend.md` §6-2)

이 감사에서 규칙별로 **실제로 한 일**:

| 규칙 | 이 감사에서 한 일 |
|---|---|
| ① 색은 렌더 픽셀이 아니라 `fill` 선언을 본다 | 모든 면·선 색을 `get_design_context` / `get_variable_defs` / SVG 원문에서 읽었다. 픽셀은 **배경 그라디언트 교차 확인에만** 썼다. 메달리온 링은 픽셀로 보면 연한 민트지만 선언은 **`white` `fill-opacity="0.5"`** 다 (§6.1) |
| ② Style 이름이 같아도 인스턴스가 그리는 겹 수는 다르다 | `HARU/Shadow Rest`(5겹) 가 "포함된 스타일"로 보고된 노드 7개를 전부 열어 **실제 렌더 겹 수**를 셌다. 7개 중 **6개가 drop 1겹**이었다 (§8.1) |
| ②-검산 렌더 바운드로 겹 수를 역산 | SVG 의 `filter` 영역과 `inset[...]` 확장값으로 **역산**해 교차 검증했다. 예: `28:73` 190px 노드의 SVG 가 198×200 → 좌우 +4 · 위 0 · 아래 +10 → `0 6px 4px` **1겹**만 성립 (3겹이면 좌우 +56 · 아래 +84 여야 한다) |
| ③ 이름이 비슷한 토큰 혼동 금지 | `HARU/Glass Rest`(첫 drop `0 2 4`) ↔ `HARU/Shadow Rest`(첫 drop `0 6 4`) 를 노드마다 구분해 적었다. 저장소 토큰은 각각 `--shadow-glass-rest` / `--shadow-rest` / `--shadow-bubble` 이다 |
| ④ "실측했다"는 서술은 증거가 아니다 | 모든 수치에 `[실측·meta]` / `[실측·ctx]` / `[실측·svg]` / `[계산]` 중 어느 방법인지 붙였다. 저장소 문서에서 가져온 것은 `[문서 인용]` 으로 분리했다 |

---

## 1. Stage 4 관련 Figma 노드 전수 목록

### 1.1 배치 프레임 (page `16:2` · section `31:204`)

| 노드 | 이름 | 절대 x/y | 크기 | 성격 |
|---|---|---|---|---|
| **`28:51`** | `1b · Session — Ready / Recording` | 2256 / 120 | **393 × 852** | 세션 화면. 자식 **6개** |
| **`29:62`** | `1c · Session — Complete & Feedback` | 2890 / 120 | **393 × 852** | 완료 + 회고. 자식 **9개** (하단 `91:691` 은 Stage 5) |

### 1.2 loose 노드 — section `31:204` 직계 자식 (프레임 밖)

> **⟲ 2026-10-13 정정 → §15.1·§15.2** — 이 표의 `163:1618`·`163:1620`·`140:2870` 행은 **더 이상 유효하지 않다**. 아래는 2026-10-11 상태의 기록으로 보존한다.

section 의 top-level 자식 **전체**를 덤프해 확인했다 `[실측·meta]`. Stage 4 와 관련된 loose 노드는 다음 4개다.

| 노드 | 이름 | 절대 x/y | 크기 | `28:51` 기준 위치 | 실제 내용 |
|---|---|---|---|---|---|
| `163:1618` | `Button` | 2317 / 1005 | 281×45 | 프레임 **아래 33px** (852 끝 = abs 972) | 텍스트 **"Discard"** `[실측·ctx]` |
| `163:1620` | `Button` | 2317 / 1066 | 281×45 | 프레임 **아래 94px** | 텍스트 **"Submit"** `[실측·ctx]` |
| `163:1601` | `Record Control` | 2691 / 740 | 150×150 | 프레임 **오른쪽 42px** | `Property 1=Pause` 인스턴스 (pause 아이콘) |
| `78:353` | `Frame 7` | 2256 / 176 | 393×59 | **프레임과 겹침** (local y=56) | 세션 TopBar — §7 |

- `163:1618` / `163:1620` 의 x=**2317** 는 프레임 안 `140:2870`(local x=60 → abs 2316)과 **1px 차이**이고 폭도 **281 동일** → 같은 버튼의 **대체 라벨 3종**(Resume / Discard / Submit)으로 배치된 것이 기하상 명확하다 `[계산]`.
- `91:627`(Select 77×31) · `91:628`(Select 97×33) 도 loose 지만 x=3140 = `29:62` 열이고 `91:691` Feedback Card 자식과 같은 크기 → **Stage 5 회고 칩 변형**이다. Stage 4 범위 밖.

### 1.3 Design Guide 컴포넌트 (page `8:2` · section `17:367`)

| 노드 | 이름 | 크기 | 변형 | 배치 여부 |
|---|---|---|---|---|
| **`163:1590`** | `Record Control` (component set) | 400×190 | **`163:1589` `Property 1=Record`** · **`163:1588` `Property 1=Pause`** — **2개뿐** | Record → `28:51`, Pause → loose `163:1601` |
| **`88:721`** | `Bubble` (component set) | 368×599 | **`50:176` `Type=Type2`**(303×96) · **`88:757` `Type=sessopn`**(297×130) · **`88:838` `Type=Type3`**(329×258) — **3개뿐** | Type2 → Home(`261:1293` 계열), sessopn → **어디에도 미배치**, Type3 → `28:51` (`139:2803`) |
| **`88:960`** | `Prompt Card/Session` | **353 × 331.765** | 변형 없음 (단일 symbol) | **어디에도 미배치** — Prompt Drawer 원본 |
| `17:20` | `Button` (component set) | — | `Variant=Glass\|Accent` × `State=Rest\|Hover\|Pressed\|Disabled` **8종** | `17:12`(Accent/Rest) 가 `140:2870`·`163:1618`·`163:1620`·`91:717` 의 base `[계산: 텍스트 자식 id `I…;17:13` 가 `17:12` 의 자식 `17:13`]` |
| `139:2734` | `Title` (component set) | 385×140 | `78:286` `Titla type=Three`(345×40) · **`139:2735` `Titla type=two`**(289×40) | two → `78:353` 안 `78:342` |
| `78:158` | `Button` (IconButton set) | 226×78 | `78:157` `Icon=Back`(38×38) · `148:1595` `Icon=swape` · `78:156` `Icon=Setting` | Back → `78:342` 안 |
| `50:157` | `Icon` (shape set) | 100×510 | `clock_default` `flip_to_back` `flip_to_front` `clock_small` `right` `left` `thumb_gold` `thumb_white` `attend` `star` `shape11` `13` `home` **`record`(`140:2949` 26×26)** `reply_all` | `right`(`86:286`) → `88:960` 안 |
| `139:2751` | `Prompt Card` `Style=pagetype` | 330×38 | — | `139:2803` 안 5개 |
| `88:789` | `Pagenation` | 46×7 | — | `88:960` 안 |
| `139:2410` | `Pagetag3` | 45×22 | — | `139:2803` pill 안 |
| `90:626` | `Select` | 137×112 | `90:625` `Color=Green`(77×31) · `90:624` `Color=Transparent`(97×33) | Stage 5 |

> **Design Guide 에 Alert · Toast · Banner · Dialog · Snackbar · Sheet 컴포넌트가 없다** `[실측·meta, canvas `8:2` 전수]`. 업로드 실패·오프라인·권한 거부 같은 **안내 UI 의 Figma 원본이 존재하지 않는다**. → §10 C-13.

### 1.4 캐릭터 에셋 (page `8:2` · section `221:1147` "Chracter")

section 직계 자식 **전부**다 `[실측·meta]`.

| 노드 | 이름 | 크기(캔버스) | 실제 파일 `[실측·svg/png 헤더]` | 내용 |
|---|---|---|---|---|
| **`163:2528`** | `asset/avatar-medallion` | 204×245 | **JPEG 200×200** | 헤드폰 + 손 흔드는 캐릭터, **민트→보라 사각 그라디언트 배경** |
| `163:2529` | `Haru_Hello_Heart_t 1` | 1537×1830 | (미다운로드) | 캐릭터 원본 |
| **`163:2530`** | `HARU_Hello_t 1` | 1597×1830 | **PNG 702×1248 RGBA(투명)** | 헤드폰 + 손 흔드는 캐릭터 **투명 배경 원본** |
| `163:2532` | `asset/home-character` | 517×788 | (미다운로드) | Home 캐릭터 (Stage 3) |
| `163:2536` / `163:2543` | `안경 쓴 책벌레 민트 하루 1 / 2` | 1550×1830 / 1505×1830 | (미다운로드) | 안경 캐릭터 (Report 화면이 `163:2646` 로 사용) |

**6개 전부 정지 raster 이미지다.** 프레임 시퀀스·스프라이트 시트·Lottie/Rive 데이터·변형 세트가 **하나도 없다** `[실측·meta: section `221:1147` 자식 6개 전수]`. → §11 `R-16`.

---

## 2. `28:51` — 세션 Ready / Recording 전수 실측

### 2.1 레이아웃 (프레임 로컬 좌표)

```
0    ┌──────────────────────────────── 393 ────┐
     │ 28:52  Screen/Status Bar  0,0  393×56    │
56   ├─────────────────────────────────────────┤
     │            (빈 간격 76)                   │
132  │ 28:73  Medallion Ring   101.5,132 190×190│  ← 가로 정확히 가운데 [계산]
140  │ 28:74  Avatar           109.5,140 174×174│  ← 가로 정확히 가운데 [계산]
314  │                                          │
322  │ ring bottom                              │
327  │   └ bubble tail top (336−9)              │  ← ring bottom 과 간격 5 [계산]
336  │ 139:2803 Bubble          34,336  329×258 │  ← 좌 34 / 우 30 (가운데에서 +2) [계산]
594  │ bubble bottom                            │
621  │ 163:1591 Record Control 122,621  150×150 │  ← 간격 27. 가운데 121.5 대비 +0.5 [계산]
771  │                                          │
787  │ 140:2870 Button          60,787  281×45  │  ← 간격 16. 좌 60 / 우 52 (가운데 아님) [계산]
832  │                                          │
852  └──────────────────────────────── 하단 20 ─┘
```

> **⟲ 2026-10-13 정정 → §15.2** — 마지막 행(`140:2870` @ 60,787)이 **`285:1445` "After_record" @ 67,789 · 279×45** 로 교체됐다. 바뀐 간격: record bottom(771) → bar **18** · bar bottom(834) → frame **18**.

세로 간격 전부 `[계산]` (= 아래 노드 y − 위 노드 bottom):
status bar → ring **76** · ring bottom → tail top **5** · bubble bottom → record **27** · record bottom → button **16** · button bottom → frame **20**.

> **가로 중심이 어긋난 노드 2개** `[계산]`: ① `139:2803` 버블 — 좌 34 / 우 30 (가운데면 32) ② `140:2870` 버튼 — 좌 60 / 우 52 (가운데면 56). Figma 작업 오차로 보이나 **단정하지 않는다**. 구현 시 가운데 정렬할지 Figma 좌표를 그대로 둘지는 결정 대상 (§11 `S4F-11`).

### 2.2 배경

`[픽셀]` 프레임 가장자리(x=6 / x=386) 수직 샘플: y=60 `#daede6` · y=300 `#d5e6e0` · y=500 `#d1dfdd` · y=700 `#ccd4db`.
`29:62` 하단 중앙(y=845) `#c7c9d7`.

→ 저장소 `--gradient-app`(`--color-bg-app-start` `#dbeee7` → `--color-bg-app-mid` `#d3e3de` 46% → `--color-bg-app-end` `#c7c9d7`) 과 **일치한다** `[픽셀 교차 확인]`. **신규 토큰 불필요.** 세션 화면도 Home/Library 와 같은 앱 배경이다.

### 2.3 `28:73` Medallion Ring / `28:74` Avatar

| 항목 | 값 | 근거 |
|---|---|---|
| Ring 크기·위치 | **190×190 @ (101.5, 132)** | `[실측·meta]` |
| Ring **fill** | `<circle r="95" fill="white" fill-opacity="0.5"/>` → **흰색 50% 반투명** | `[실측·svg]` |
| Ring 그림자 | `feOffset dy=6` + `feGaussianBlur stdDeviation=2` + `ink 8%` → **`0 6px 4px rgba(94,115,112,0.08)` 1겹** | `[실측·svg]` |
| Ring inner shadow | `0 1.5px 0 rgba(255,255,255,0.9)` + `0 -1px 0 rgba(94,115,112,0.05)` **2겹** | `[실측·svg]` |
| Ring 렌더 바운드 | SVG `198×200`, 노드 190 → 좌우 +4 · 위 0 · 아래 +10 | `[실측·svg]` → **1겹 검산 성립** `[계산]` |
| Avatar | **174×174 @ (109.5, 140)** — PNG 348×348(2x) | `[실측·meta]` + `[실측·png 헤더]` |
| Avatar 그림자 | **없음** (`get_design_context` 가 그림자를 돌려주지 않는다) | `[실측·ctx]` |
| Ring ↔ Avatar 여백 | (190−174)/2 = **8** 사방 | `[계산]` |

> `HARU/Shadow Rest` 가 "포함된 스타일"로 보고되지만 **실제 렌더는 drop 1겹**이다. 저장소에 이미 같은 모양의 토큰 **`--shadow-bubble`** 이 있다 (`0 6px 4px ink8% + inset 2겹`). **신규 토큰 불필요.**

### 2.4 `139:2803` Bubble (= `88:838` `Type=Type3` 인스턴스)

| 항목 | 값 | 근거 |
|---|---|---|
| 인스턴스 | `329×258 @ (34,336)`, 내부 `Frame 10` 이 `top:-9` 로 올라감 | `[실측·meta]` |
| **Tail** | `22.627×22.627` 컨테이너 안의 **16×16 정사각형, `rotate(-45deg)`, radius 3** | `[실측·ctx]` |
| Tail 색 | `glass-fill-strong` = **`#ffffffe5`** (흰색 90%) | `[실측·ctx + variable_defs]` |
| Tail x | 153.186 (+ 폭 22.627 → 중심 **164.5**) · 버블 폭 329 → **정확히 50%** | `[계산]` |
| Tail 겹침 | `mb-[-12px]` → 본체 위로 12px 파고든다 | `[실측·ctx]` |
| 본체 fill | `glass-fill-strong` **`#ffffffe5`** | `[실측·ctx]` |
| 본체 radius | **22** | `[실측·ctx]` |
| 본체 padding | **px 16 / py 14**, 세로 gap **6** | `[실측·ctx]` |
| 본체 그림자 | **`0 6px 4px rgba(94,115,112,0.08)` drop 1겹** + `inset 0 1.5px 0 rgba(255,255,255,0.9)` + `inset 0 -1px 0 rgba(94,115,112,0.05)` | `[실측·ctx]` |
| 제목 텍스트 | **`Try this prompt !`** (느낌표 앞 공백 포함) | `[실측·ctx]` |
| 제목 타이포 | SF Pro **Semibold(590) 16px / line-height 22px**, `text-primary` **#4a5f5c**, **가운데 정렬**, 폭 100% | `[실측·ctx]` |
| Prompt pill | **5개**, 각 `297×38 @ x=16`, y = **42 / 86 / 130 / 174 / 218** → 간격 **44** (= 38 + gap 6) | `[실측·meta]` + `[계산]` |

#### Prompt pill (`139:2763` 외 4개 — base `139:2751` `Style=pagetype`)

| 항목 | 값 | 근거 |
|---|---|---|
| 면 | `color/spring green/90 2` = **`#dbeee7`** | `[실측·ctx + variable_defs]` |
| 테두리 | `1px solid` `color/cyan/41 18%` = **`#5e73702e`** | `[실측·ctx + variable_defs]` |
| radius / padding | **100 / px 12 py 8** | `[실측·ctx]` |
| 내부 gap | **8** | `[실측·ctx]` |
| 배지 `Pagetag3` | h **22**, px **13** py **7**, radius **28**, 면 `accents/cyan` **`#a0ccdd`** | `[실측·ctx]` |
| 배지 텍스트 | **`P.6`** · SF Pro Semibold(590) **12 / 12**, `color/white/solid` `#ffffff` | `[실측·ctx]` |
| 본문 텍스트 | `"He got sent to his room with no supper. How ` (**끝에서 잘린 placeholder**) | `[실측·ctx]` |
| 본문 타이포 | SF Pro Semibold(590) **11.8px / line-height 12px**, `color/cyan/41` **`#5e7370`** | `[실측·ctx]` |
| **5개 텍스트** | **전부 동일 문자열** — 다섯 칸 모두 같은 placeholder | `[실측·ctx]` |

> `[픽셀]` 렌더에서 본문이 **2줄로 넘쳐** pill 안에 꽉 찬다. line-height 12 × 2 = 24, + py 8×2 = 40 > 선언 높이 38. Figma 자체가 1~2px 넘치는 상태다.

### 2.5 `163:1591` Record Control (= `163:1589` `Property 1=Record`)

변형 판정 근거 `[계산]`: 인스턴스 자식 base id 가 `139:2835` / `139:2836` / `139:2837` / `140:2854` / `139:2838` 이고, 이는 `163:1589 Property 1=Record` 의 자식 id 와 **완전히 일치**한다. `163:1588 Pause` 의 자식은 `139:2843~2845` / `140:2866` 로 다르다.

| 레이어 | 크기·위치(로컬) | 선언 | 근거 |
|---|---|---|---|
| 바깥 링 `139:2835` | **150×150 @ (0,0)** | `<circle r="74" stroke="#85BFB6" stroke-width="2" opacity="0.35"/>` — **fill 없음** | `[실측·svg]` |
| 가운데 링 `139:2836` | **122×122 @ (14,14)** | `<circle r="60" stroke="#85BFB6" stroke-width="2" opacity="0.6"/>` — **fill 없음** | `[실측·svg]` |
| 코어 `139:2837` | **108×108 @ (21,21)** | `<circle r="54" fill="#85BFB6"/>` — **solid** | `[실측·svg]` |
| 코어 그림자 | `feOffset dy=12` + `stdDeviation=14` + `ink 16%` → **`0 12px 28px rgba(94,115,112,0.16)` drop 1겹** | `[실측·svg]` |
| 코어 inner | **`inset 0 2px 0 rgba(255,255,255,0.55)`** (`dy=2`, white **0.55**) — 1겹뿐 | `[실측·svg]` |
| 코어 렌더 바운드 | SVG `164×164`, 노드 108 → 좌우 +28 · 위 +16 · 아래 +40 | `[실측·svg]` → `0 12 28` **1겹 검산 성립** `[계산]` |
| 마이크 아이콘 `139:2838` | **40×40 @ (55,48)** — 캡슐 + 호 + 스템, **전부 white** (`stroke-width 3.333`) | `[실측·svg]` |
| 라벨 `140:2854` | **`Tap to recording`** @ (35,88), 79×12 · SF Pro **Medium(510) 10px** / `normal`, **white** | `[실측·ctx + meta]` |

#### `163:1588` `Property 1=Pause`

| 레이어 | 값 | 근거 |
|---|---|---|
| 링 3겹 | `Record` 와 **동일**(150 / 122 / 108, 같은 SVG 에셋 URL) | `[실측·ctx: `imgEllipse`·`imgEllipse1`·`imgEllipse2` 를 두 변형이 공유]` |
| pause 아이콘 `140:2866` | **40×40 @ (55,55)** — 막대 2개 `x 10–16.67` / `23.33–30`, `y 8.33–31.67` → 막대 폭 **6.67**, 높이 **23.33**, 간격 **6.67**, **모서리 radius 0**, fill white | `[실측·svg]` |
| 라벨 | **없다** | `[실측·meta: 자식 4개뿐]` |

#### 변형 열거 — 질문 2 의 답

| 상태 | Figma 변형 | 있음/없음 |
|---|---|---|
| idle (ready) | **`Property 1=Record`** — 마이크 + `Tap to recording` | **있음** |
| recording | **`Property 1=Pause`** — pause 아이콘, 라벨 없음 | **있음** (= "녹음 중이니 누르면 일시정지") |
| paused (resume 어포던스) | — | **없음** |
| disabled | — | **없음** |
| permission denied | — | **없음** |
| 녹음 경과 시간 표시 | — | **없음** |

> 컴포넌트 **정의**는 `163:1590`(component set) 이고 변형은 **정확히 2개**다 `[실측·meta]`. `28:51` 에 배치된 **인스턴스는 `Record`** 로 설정돼 있다 `[계산: 자식 base id 일치]`. `Pause` 인스턴스(`163:1601`)는 **프레임 밖 loose** 다.
>
> 링 2겹이 35% / 60% 로 투명도가 다른 것은 **맥동(pulse) 모션의 정지 표현**으로 읽히지만, Figma 에 애니메이션 정의는 없다 → §11 `R-16`.

### 2.6 `140:2870` Button — 질문 1 의 답

| 항목 | 값 | 근거 |
|---|---|---|
| **텍스트** | **`Resume`** | **`[실측·ctx]` — `get_design_context` 가 돌려준 `<p>` 본문** |
| 크기·위치 | `281×45 @ (60,787)` | `[실측·meta]` |
| base 컴포넌트 | `17:12` `Variant=Accent, State=Rest` | `[계산: 텍스트 자식 id `I140:2870;17:13`]` |
| variant property | 이 컴포넌트 세트의 property 는 **`Variant`(Glass/Accent) × `State`(Rest/Hover/Pressed/Disabled)** = **8종** | `[실측·meta: `17:20` 자식 8개]` |
| 이 인스턴스의 variant | **Accent / Rest** | `[계산]` |
| 면 | `accents/teal` **`#85bfb6`** + `backdrop-blur 12px` | `[실측·ctx]` |
| radius | `radius-pill` **100** | `[실측·ctx]` |
| padding | **px 26 / py 14** | `[실측·ctx]` |
| 라벨 타이포 | SF Pro **Semibold(590) 17px / line-height 17px**, **white**, `nowrap` | `[실측·ctx]` |
| drop shadow | **2겹** — `0 2px 4px ink8%` + `0 12px 28px ink16%`. **`0 28px 56px ink12%` 는 렌더하지 않는다** | `[실측·ctx: `drop-shadow-[0px_12px_14px_rgba(94,115,112,0.16),0px_2px_2px_rgba(94,115,112,0.08)]` — Tailwind 변환이 Figma blur 를 1/2 로 적는다]` |
| inner shadow | `inset 0 -1px 0 ink5%` + `inset 0 1.5px 0 white90%` | `[실측·ctx]` |

> **`PLANNING.md:331` 의 "Resume" 서술은 이번 직접 조회로 확인됐다.** 다만 이 문서는 그 인용을 재사용하지 않고 `get_design_context` 원문으로 확정했다.
>
> **`163:1618` = `Discard` · `163:1620` = `Submit`** 도 같은 방법으로 확정했다 `[실측·ctx]`. 셋 다 **동일 스타일**(teal Accent/Rest · 281×45 · px26 py14 · drop 2겹) 이며, **Discard 에 destructive·secondary 스타일이 적용돼 있지 않다** — 파괴적 동작과 제출 동작이 **시각적으로 구분되지 않는다**.
>
> **⟲ 2026-10-13 정정 → §15.3** — 위 두 문장은 **스테일하다.** 현재 `163:1618` 은 폭 **135**(281 아님)이고 면이 **`--grays/gray-2` `#aeaeb2`**, base 변형이 신규 **`285:1228` `Variant=Accent, State=Secondary`** 다. **시각 구분이 생겼다** → §11 `S4F-10` 해소.
> **⟲ 2026-10-13 정정 → §15.4** — 세트 `17:20` 은 **8종이 아니라 9종**이다(`Accent/Secondary` 신설).
> **⟲ 2026-10-13 정정 → §15.2** — `140:2870` `Resume` 은 `28:51` 에서 제거되어 섹션 밖(절대 2441,1200)으로 옮겨졌다. 라벨은 그대로 `Resume` 이다 `[실측·ctx 2026-10-13]`.

---

## 3. `29:62` — 세션 Complete & Feedback 전수 실측

### 3.1 레이아웃

```
0    │ 29:63  Screen/Status Bar     0,0    393×56
56   │
66   │ 29:76  Frame(닫기)          331,66   38×38   ← 우측 여백 24 = --layout-gutter [계산]
76   │ 29:75  "Session Complete"   130,76  133×18   ← 가로 가운데 [계산]
94   │
100  │ 29:79  Attendance Sticker    68,100 257×64   ← 가로 가운데. 제목 bottom 과 6 [계산]
164  │
172  │ 29:86  Ellipse(ring)       121.5,172 150×150 ← 가운데. 스티커와 8 [계산]
179  │ 29:87  Ellipse(avatar)     128.5,179 136×136 ← 가운데
315  │
322  │ ring bottom
324  │   └ bubble tail top (338−14)                 ← ring bottom 과 2 [계산]
338  │ 88:929 Bubble                48,338 297×130  ← 가로 가운데 [계산]
468  │
521  │ 91:691 Feedback Card         11,521 370×302  ← Stage 5. 간격 53 [계산]
823  │
852  └ 하단 29
```

### 3.2 `29:75` / `29:76`

| 노드 | 값 | 근거 |
|---|---|---|
| `29:75` 텍스트 | **`Session Complete`** | `[실측·ctx]` |
| `29:75` 타이포 | SF Pro **Semibold(590) 15px** / `normal`, `text-primary` **#4a5f5c** | `[실측·ctx]` |
| `29:76` 박스 | **38×38**, radius **19**, 면 `glass-fill` **`#ffffffbd`**(흰색 74%) | `[실측·ctx + variable_defs]` |
| `29:76` 그림자 | **`0 6px 4px rgba(94,115,112,0.08)` drop 1겹** + inset 2겹 | `[실측·ctx]` |
| `29:77` 아이콘 | **15×15 @ (11.5,11.5)** — SVG, 렌더상 **✕** | `[실측·meta]` + `[픽셀]` |

> `29:76` 은 `78:157` `Icon=Back` 과 **같은 기하**(38×38 · radius 19 · glass 74% · drop 1겹)지만 **아이콘만 15×15 로 다르다** (`78:157` 은 18×18) `[실측·ctx]`.
>
> ⚠ 저장소 `IconButton` 은 `--shadow-rest`(**drop 3겹**)를 쓴다 `[문서 인용: packages/ui/src/button/IconButton.css:46]`. Figma 인스턴스는 **drop 1겹**이다 → `--shadow-bubble` 과 같은 모양. 이 차이는 Stage 4 에서 처음 드러난 것이 아니라 기존 `IconButton` 전체에 해당한다 → §11 `S4F-12`.

### 3.3 `29:79` Attendance Sticker — 질문 8 의 답

| 항목 | 값 | 근거 |
|---|---|---|
| 박스 | **257×64 @ (68,100)** | `[실측·meta]` |
| radius | **100** (pill) | `[실측·ctx]` |
| 면 | `glass-fill` = **`#ffffffbd`** (흰색 74%) — **단색 아님** | `[실측·ctx + variable_defs]` |
| padding | **pl 10 / pr 20 / py 10**, gap **12** | `[실측·ctx]` |
| 치수 검산 | 10 + 44 + 12 + 171 + 20 = **257** ✓ · 10 + 44 + 10 = **64** ✓ | `[계산]` |
| drop shadow | **`0 6px 4px rgba(94,115,112,0.08)` 1겹** | `[실측·ctx]` |
| inner shadow | `inset 0 -1px 0 ink5%` + `inset 0 1.5px 0 white90%` | `[실측·ctx]` |
| 아이콘 타일 `29:80` | **44×44**, radius **22**, `overflow: clip` | `[실측·ctx]` |
| 타일 면 | **`linear-gradient(140.26769705991268deg, rgb(208,204,161) 0%, rgb(238,210,189) 70.922%)`** = `#d0cca1` → `#eed2bd` | `[실측·ctx]` |
| 타일 그림자 | **`0 4px 10px rgba(94,115,112,0.25)`** + `inset 0 1.5px 0 rgba(255,255,255,0.6)` | `[실측·ctx]` |
| 아이콘 `90:602` | **20×20 @ (11,11)** — **엄지척(thumbs-up) 글리프, `fill="white"`** | `[실측·svg]` |
| 아이콘 정체 | Icon set 의 `90:599 shape=thumb_white` 인스턴스로 판단 (`fill="white"`, `90:594` 는 `thumb_gold`) | `[계산]` — **확정 아님** |
| 제목 `29:84` | **`Attendance sticker`** · SF Pro **Semibold(590) 14px** / `normal`, `text-primary` **#4a5f5c** | `[실측·ctx]` |
| **부제 `29:85`** | **`Day 12 · keep the streak going`** — 가운뎃점은 **U+00B7 MIDDLE DOT**, 앞뒤 공백 각 1 | `[실측·ctx]` |
| 부제 타이포 | SF Pro **Regular(400) 12px** / `normal`, `text-secondary` **`#7d9291`** | `[실측·ctx]` |
| 제목↔부제 gap | **2** | `[실측·ctx]` |

> ⚠ 부제가 **`streak`** 를 쓴다. Stage 3 에서 `D-6` / `AD-S3-9` 로 **"streak·분 표시를 쓰지 않는다"** 가 결정돼 Home 헤더 칩이 `WeekSummaryChip` 으로 바뀌었다 `[문서 인용: docs/design/stage-3-home-figma-audit.md M-09]`. 같은 표현이 여기서 되살아난다 → §9 `PF-09`.

### 3.4 `29:86` / `29:87` 메달리온

| 항목 | 값 | 근거 |
|---|---|---|
| `29:86` Ring | **150×150 @ (121.5,172)** · `<circle r="75" fill="white" fill-opacity="0.5"/>` | `[실측·meta + svg]` |
| Ring 그림자 | `dy=6`, `stdDeviation=2`, ink 8% → **`0 6px 4px` 1겹** + inset 2겹 — **`28:73` 과 완전히 같은 필터** | `[실측·svg]` |
| Ring 렌더 바운드 | SVG `158×160` (노드 150) → 좌우 +4 · 위 0 · 아래 +10 — **`28:73` 과 절대 px 동일** | `[실측·svg]` + `[계산]` |
| `29:87` Avatar | **136×136 @ (128.5,179)** · PNG **272×272(2x)** | `[실측·meta + png 헤더]` |
| Ring ↔ Avatar 여백 | (150−136)/2 = **7** 사방 | `[계산]` |

### 3.5 `88:929` Bubble — 질문 5 의 답

| 항목 | `88:757` (**컴포넌트 변형**) | `88:929` (**`29:62` 안 인스턴스**) |
|---|---|---|
| 종류 | `symbol` `Type=sessopn` — `88:721` Bubble set 의 변형 | `instance` of 위 변형 |
| 배치 | **어떤 프레임에도 배치되지 않음** `[실측·meta: section `31:204` 전수 검색]` | `29:62` 안 `(48,338) 297×130` |
| 주 텍스트 | **`Ready for today's story with Emma?`** · SF Pro **Semibold(590)** 16/22 | **`Storytime success! Emma did wonderfully.`** · SF Pro **Bold(700)** 16/22 |
| 보조 텍스트 | **`Tap record and I'll quietly keep your storytime.`** · SF Pro Regular 13/19 | **`14 min together · sticker earned`** · SF Pro Regular 13/19 |
| 색 | 주 `text-primary` #4a5f5c · 보조 `text-secondary` #7d9291 | 동일 |
| 정렬 | 둘 다 **가운데**, 주 텍스트 폭 **265** 고정 | 동일 |

모두 `[실측·ctx]`.

> **⚠ `get_metadata` 만 보면 틀린다.** `29:62` 의 metadata 는 텍스트 노드 이름을 **`Ready for today's story with Emma?`** 로 돌려준다 — 그건 **컴포넌트 기본 레이어 이름**이고, 인스턴스는 텍스트를 **override** 했다. 실제 렌더는 `Storytime success!…` 다 `[픽셀 교차 확인]`. **레이어 이름을 문자열 근거로 쓰면 안 된다.**

#### 질문 5 결론

| 질문 | 답 |
|---|---|
| 어느 것이 준비(인사) 버블인가 | **`88:757`** — `Type=sessopn` 변형. 텍스트가 PRD §7.5 의 예시("Ready for today's story with Emma?")와 **문자 단위로 일치**한다 |
| 어느 것이 완료 버블인가 | **`88:929`** — `88:757` 의 인스턴스에 완료 문구를 덮어쓴 것. **별도 변형이 아니다** |
| `88:757` 은 어디에도 배치되지 않았는가 | **그렇다.** page `16:2` section `31:204` 를 682 노드까지 덤프해 확인했다 — `88:757` 은 없다. **Design Guide(`8:2`) 의 컴포넌트 정의로만 존재한다** |
| `28:51` 의 버블 | **`139:2803`** = `88:838` `Type=Type3` 인스턴스 = **"Try this prompt !" + pill 5개** |

### 3.6 `91:691` Feedback Card — **Stage 4 에서 구현하지 않는 영역** (질문 9)

> **경계만 기록한다. 실측하지 않았고, 토큰 매핑도 하지 않았다.**
> 근거: `docs/plans/stage-4-plan.md:116` — *"Stage 4 는 상단(…)까지, `91:691` 카드는 건드리지 않는다"* `[문서 인용]`.

`[실측·meta]` 구조만:

| 노드 | 이름 | 로컬 좌표 | 크기 |
|---|---|---|---|
| `91:691` | `Feedback Card` | (11, 521) | 370×302 |
| `91:692` | text `How was storytime with Emma?` | (20,20) | 330×20 |
| `91:693` | Frame → **별 5개** `91:694`·`696`·`698`·`700`·`702` | (20,54) | 330×30, 각 30×30, x 74/112/150/188/226 (간격 8) |
| `91:709` | Frame → **Select 5개** `91:710`~`714` | (20,98) | 330×73, 2행 (77×31 · 97×33 · 111×31 / 93×33 · 101×33) |
| `91:715` | Frame → text `Anything to talk about this time? (optional)` | (20,185) | 330×40 |
| `91:717` | Button — 텍스트 **`Save`** `[실측·ctx]` | (20,239) | 330×45 |

loose 보조: `91:627` Select 77×31 · `91:628` Select 97×33 (= `90:625` Green / `90:624` Transparent 변형).

**Stage 4 경계선**: `29:62` 의 y **0 ~ 468**(버블 bottom)까지가 Stage 4, y **521 ~ 823** 은 Stage 5. 그 사이 **53px 는 빈 간격**이다 `[계산]`. Stage 4 에서 이 프레임을 구현하면 **하단이 의도적으로 비어 있는 화면**이 된다 → QA 증거로 기록 필요.

---

## 4. `88:960` `Prompt Card/Session` — Prompt Drawer 원본 (미배치)

| 항목 | 값 | 근거 |
|---|---|---|
| 크기 | **353 × 331.765** | `[실측·meta]` |
| 배치 | **어느 프레임에도 없다** (Design Guide 컴포넌트 전용) | `[실측·meta]` |
| radius | **`corner radius/30` = 30** | `[실측·ctx]` |
| 면 | **`color/white/-86%` = `rgba(255,255,255,0.86)`** + `backdrop-blur 12px` | `[실측·ctx]` |
| drop shadow | **3겹 전부** — `0 2px 4px ink8%` + `0 12px 28px ink16%` + `0 28px 56px ink12%` | `[실측·ctx]` |
| inner shadow | `inset 0 1.5px 0 white90%` + `inset 0 -1px 0 ink5%` | `[실측·ctx]` |
| → 판정 | **`HARU/Glass Rest` 5겹을 전부 렌더한다.** 저장소 `--shadow-glass-rest` 와 **일치** | `[계산]` |
| padding | **pt 10 / pb 18 / px 20**, 세로 gap **10** | `[실측·ctx]` |

구성 (위→아래) `[실측·ctx + meta]`:

| # | 노드 | 내용 | 치수 |
|---|---|---|---|
| 1 | `88:669` | **드래그 핸들** — `40×4`, radius 8, `color/cyan/41 30%` `rgba(94,115,112,0.3)`. 컨테이너 h 8 | 313×8 |
| 2 | `88:671` | **`Prompts of this session `** (**끝에 공백 1개**) · SF Pro **Bold(700) 17 / 22.1**, `color/cyan/33` **#4a5f5c**, 가운데 | 313×23 |
| 3 | `88:673` | **`Just read one aloud when feels right - no rush.`** · SF Pro **Regular(400) 13 / 18.85**, `color/grey/53` **#7d9291**, 가운데 | 313×19.765 |
| 4 | `88:708` | **Prompt pill 1개** — `310×40`, 면 `#dbeee7`, 테두리 1px `#5e73702e`, radius 100, **px 12 py 8** · **왼쪽 Icon 24×24 + 본문 + 오른쪽 Icon 24×24(`86:286 shape=right`)** · 본문 SF Pro Semibold 11.8/12 `#5e7370` | 컨테이너 313×45 |
| 5 | `88:681` | **코칭 노트** — 테두리 1px `#5e73702e`, radius **16**, **면 없음(투명)**, px 15 / pt 12 / pb 13.19, 본문 SF Pro **Regular 12 / 15.6** `#5e7370` | 313×158 |
| 6 | `88:897` | **Pagenation 46×7** — 활성 막대 `20×7` `#5e7370` radius 4 + 점 `7×7` ×2 `rgba(94,115,112,0.3)`, gap 6 | 313×7 |

노트 본문 원문 `[실측·ctx]`:
> `Invites your child to put a word to a hard feeling right as the story lands it. For Emma, who feels intensely and is learning to name what she feels, this meets her where she's strong — giving the big emotion a shape she can hold`

### 4.1 구조 해석

- **한 번에 Prompt 1개 + 그 코칭 노트**를 보여주고, **pill 좌우 화살표**와 **하단 dots(활성 1 + 점 2 = 3페이지)** 로 넘긴다 → **1 아이템 = 1 페이지 캐러셀**.
- 드래그 핸들(40×4) + 하단 정렬 구성 → **바텀 시트**다.
- **열기 트리거 버튼이 Figma 어디에도 없다** (§10 C-13).

### 4.2 `R-SHADOW-1` — overflow inset 산출 (`.claude/rules/frontend.md` §6-1)

> **번짐은 추정하지 않고 `box-shadow` 겹을 전부 합산해 산출했다** `[계산]`.
> `0 Y B` 의 도달 거리 = 좌우 **B** · 위 **B−Y**(음수면 0) · 아래 **B+Y**.

| 대상 | drop 겹 (실측) | 좌/우 | 위 | 아래 |
|---|---|---|---|---|
| `88:960` 드로어 면 | `0 2 4` / `0 12 28` / `0 28 56` | 4 / 28 / **56** | 2 / 16 / **28** | 6 / 40 / **84** |
| **→ 드로어 필요 inset** | — | **56** | **28** | **84** |
| `88:708` pill (캐러셀 아이템) | **없음** (테두리만) | 0 | 0 | 0 |
| **→ 캐러셀 트랙 필요 inset** | — | **0** | **0** | **0** |
| `140:2870` 버튼 | `0 2 4` / `0 12 28` | **28** | **16** | **40** |
| Record 코어 `139:2837` | `0 12 28` | **28** | **16** | **40** |
| 버블 `88:839` / 스티커 `29:79` / 메달리온 링 / IconButton | `0 6 4` | **4** | **0** | **10** |
| 스티커 아이콘 타일 `29:80` | `0 4 10` | **10** | **6** | **14** |

**결론**:
1. **Prompt Drawer 캐러셀 트랙 자체에는 inset 이 필요 없다** — 캐러셀 아이템(pill)에 drop shadow 가 **0겹**이기 때문이다 `[실측·ctx]`.
2. 반대로 **드로어 면(`88:960`)이 `overflow != visible` 인 조상 안에 들어가면 좌우 56 · 위 28 · 아래 84** 가 필요하다. 이는 `--shadow-glass-rest` 를 쓰는 모든 표면에 공통이다.
3. ⚠ 위 값은 **산술 상한**이다. 저장소의 과거 실측은 같은 `--shadow-glass-rest` 에 대해 **아래 77 · 위 22 · 좌우 28~32** 였다 `[문서 인용: rules/frontend.md §6-1 ③]` — **알파 가시 임계 기준**이라 산술 상한보다 작다. 구현 시 **픽셀 프로브로 다시 재고**, 산술 상한을 보수적 초기값으로 쓴다.
4. 세로 스크롤이 필요한 곳은 `28:51`/`29:62` 어디에도 **없다** — 두 프레임 모두 **852 고정 높이**이고 콘텐츠가 그 안에 들어간다 `[계산]`. 즉 **Stage 4 에서 새 `overflow` 선언이 필요한 곳은 Prompt Drawer 캐러셀(가로) 하나뿐**이고, 그 축에는 그림자가 없다.

---

## 5. `78:353` 세션 TopBar — 질문 7 의 답

| 항목 | 값 | 근거 |
|---|---|---|
| 노드 | `78:353` `Frame 7`, **393×59**, 절대 (2256, 176) | `[실측·meta]` |
| 소속 | **section `31:204` 의 직계 자식** — `28:51` 의 **자식이 아니다** | `[실측·meta: section top-level 목록]` |
| `28:51` 기준 위치 | x **0** (같은 좌변) · y **56** (= 176 − 120) → **상태바 바로 아래에 겹친다** | `[계산]` |
| 자식 순서 | section child 목록에서 `28:51`(483행) **뒤**에 온다(495행) | `[실측·meta]` |
| 렌더 | `get_screenshot(28:51)` 결과에 **나타나지 않는다** — 자식이 아니라 형제이기 때문으로 보인다 | `[픽셀]` · **배치 의도인지 작업 잔여물인지 확인 불가** |
| padding | **10** (사방) | `[실측·ctx]` |
| 구성 | `78:342` `Title` 인스턴스 (`139:2735` `Titla type=two`), 373×40 @ (10,10) | `[실측·meta]` |

### 5.1 `78:342` Title 내부 `[실측·ctx]`

| 요소 | 값 |
|---|---|
| 레이아웃 | 가로 flex, **gap 18**, `items-center` |
| **뒤로가기** `78:157` `Icon=Back` | **38×38**, radius **19**, 면 `glass-fill` `rgba(255,255,255,0.74)`, drop **`0 6px 4px ink8%` 1겹** + inset 2겹. 아이콘 **18×18 @ (10,10)** — `‹` 꺾쇠 SVG |
| **책 칩** `139:2737` `Prompt box` | radius **100**, 면 `glass-fill` `rgba(255,255,255,0.74)`, **px 15 / py 9**, gap **8**, drop **`0 6px 4px ink8%` 1겹** + inset 2겹 |
| └ 표지 자리 `139:2738` | **16×22**, radius **3**, `linear-gradient(131.18592509702313deg, rgb(133,191,182) 0%, rgb(176,207,192) 70.922%)` = `#85bfb6` → `#b0cfc0` |
| └ 제목 `139:2739` | **`The Most Magnificent Thing`** · SF Pro **Semibold(590) 13px** / `normal`, `text-primary` **#4a5f5c**, `nowrap` |

### 5.2 TopBar 에 **없는 것** `[실측·meta: 자식 전수]`

- 화면 제목 텍스트 (예: "Session")
- **종료 / 닫기 버튼**
- 녹음 경과 시간
- Prompt 모아보기 트리거
- 설정 · 더보기

→ **뒤로가기 + 책 칩, 둘뿐이다.**

---

## 6. 정리 — 질문 1~10 의 답

> **⟲ 2026-10-13 정정 → §15** — **질문 1 · 6 · 7** 의 답이 Figma 갱신으로 바뀌었다. **1**: 하단 버튼은 이제 `140:2870` 단일이 아니라 **`285:1445` 2버튼 바**다. **6**: `Discard`/`Submit` 은 **loose 가 아니라 `28:51` 안에 배치**됐고 스타일이 **갈렸다**. **7**: `78:353` 은 여전히 섹션 직계 자식이지만 **섹션 렌더에서 프레임 TopBar 자리에 정확히 겹친다**(§15.6). 질문 **2·3·4·5·8·9·10** 의 답은 2026-10-13 재조회에서도 **유효하다**.

| # | 질문 | 답 | 근거 |
|---|---|---|---|
| **1** | `140:2870` 라벨 | **`Resume`**. variant = `Variant=Accent, State=Rest`(`17:12`). 세트 property 는 `Variant`(Glass/Accent) × `State`(Rest/Hover/Pressed/**Disabled**) = **8종** | `[실측·ctx]` §2.6 |
| **2** | `163:1591` variant·state | 컴포넌트 세트 **`163:1590`**, 변형 **2개뿐** = `Property 1=Record` · `Property 1=Pause`. **이 인스턴스는 `Record`**. **paused·disabled·permission-denied 변형 없음**. 경과 시간 표시 없음 | `[실측·meta + 계산]` §2.5 |
| **3** | `Done Reading` 존재 여부 | **존재하지 않는다.** ① section `31:204` 682 노드 덤프에 `Done` 0건 ② page `8:2` Design Guide 캔버스 전수에 `Done` 0건 ③ 세션 영역의 **텍스트를 가진 노드 전부**(`140:2870`·`163:1618`·`163:1620`·`163:1591`·`139:2803`·`88:929`·`78:342`·`29:75`·`29:84`·`29:85`·`91:717`)를 `get_design_context` 로 열어 **override 된 실제 문자열**까지 읽었다 — 어디에도 없다 | `[실측·meta + ctx]` |
| **4** | `139:2803` 내용 / 자동 제시 여부 | 제목 **`Try this prompt !`** + **Prompt pill 5개**(5개 모두 `P.6` 배지 + 동일 placeholder `"He got sent to his room with no supper. How `). **캐릭터 말풍선**이다 — ① `88:721` Bubble 세트의 `Type=Type3` 변형 ② tail 이 버블 **정중앙(50%)에서 위를 향해** 바로 위 메달리온을 가리킨다 ③ 프레임에 **고정 배치**(y=336)되어 있고 **여는 트리거 버튼이 프레임에 없다**. → **사용자 조작 없이 Prompt 5개가 화면에 떠 있는 구조**다 | `[실측·ctx + meta + 계산]` §2.4 |
| **5** | `88:757` vs `88:929` | `88:757` = **인사(준비) 버블 컴포넌트 변형** `Type=sessopn`, **어디에도 미배치**. `88:929` = **그 변형의 인스턴스**가 `29:62` 에 배치되고 텍스트가 **완료 문구로 override** 된 것. `28:51` 의 버블은 `139:2803`(Type3) | `[실측·ctx]` §3.5 |
| **6** | `163:1618` / `163:1620` | **`Discard`** / **`Submit`**. 둘 다 `281×45`, **teal Accent/Rest · px26 py14 · radius 100 · drop 2겹** — `140:2870` 과 **완전히 같은 스타일**. 어느 프레임에도 **배치되지 않았고**, `28:51` 프레임 **아래 33px / 94px** 에 `140:2870` 과 같은 x(±1)·같은 폭으로 놓여 있다 | `[실측·ctx + meta + 계산]` §1.2 |
| **7** | `78:353` | **세션 TopBar 다.** section 직계 자식(= `28:51` 의 자식 아님)이며 캔버스상 `28:51` local y=56 에 겹친다. 내용 = **뒤로가기 38×38 + gap 18 + 책 칩**(표지 16×22 그라디언트 + `The Most Magnificent Thing` 13 Semibold). **종료 버튼·제목·타이머 없음**. 배치 의도 여부는 **확인 불가** | `[실측·ctx + meta]` §5 |
| **8** | `29:79` 스티커 | 257×64 · radius **100** · 면 **흰색 74%(`#ffffffbd`)** · drop **1겹** `0 6px 4px ink8%` · pl10/pr20/py10 · gap12. 타일 44×44 radius22 **gold 그라디언트 `#d0cca1`→`#eed2bd` 140.27°** + `0 4px 10px ink25%` + `inset 0 1.5px 0 white60%`, 아이콘 **엄지척 20×20 white**. 제목 `Attendance sticker` SF Pro Semibold **14**. 부제 **`Day 12 · keep the streak going`** SF Pro Regular **12** `#7d9291`, 제목과 gap **2** | `[실측·ctx + svg]` §3.3 |
| **9** | `91:691` | **Stage 4 범위 밖**. 경계만 기록 — 별 5개(30×30, 간격8) · Select 5개(2행) · 입력 1개(`Anything to talk about this time? (optional)`) · Button(**`Save`**) 330×45. Stage 4 는 `29:62` 의 **y 0~468** 까지 | `[실측·meta + ctx]` §3.6 |
| **10** | 메달리온 | `28:51` ring **190** / avatar **174** (여백 8), `29:62` ring **150** / avatar **136** (여백 7) — **상태별 변형이 아니라 같은 구성의 크기 차이**다. 두 ring 의 **fill(white 50%)·그림자 필터가 완전히 동일**하고, 두 avatar 는 **같은 그림**(각각 348²·272² PNG)이다. 원본은 `163:2528`(JPEG 200²) / `163:2530`(투명 PNG 702×1248). **에셋은 정지 이미지뿐이고, `R-16` 애니메이션 에셋은 Figma 에 없다** — Chracter section 자식 6개 전부 정지 raster 이며 프레임 시퀀스·스프라이트·Lottie/Rive 가 0건이다 | `[실측·svg + png + meta]` §1.4 · §2.3 · §3.4 |

---

## 7. 기존 토큰 매핑

### 7.1 그대로 쓰는 것 (신규 0건)

| Figma 값 | 저장소 토큰 | 근거 |
|---|---|---|
| `accents/teal` `#85bfb6` | `--haru-palette-teal` → `--color-action-primary-bg` | `[문서 인용: primitive/color.css:14]` |
| `accents/cyan` `#a0ccdd` | `--haru-palette-cyan` → `--color-prompt-tag-bg` | `primitive/color.css:13` |
| `color/spring green/90 2` `#dbeee7` | `--haru-mist-100` → `--color-surface-tinted` | `primitive/color.css:69` |
| `color/cyan/33` `#4a5f5c` | `--haru-ink-700` → `--color-fg-primary` | `primitive/color.css:46` |
| `color/cyan/41` `#5e7370` | `--haru-ink-600` | `primitive/color.css:47` |
| `color/grey/53` `#7d9291` | `--haru-ink-500` → `--color-fg-secondary` | `primitive/color.css:48` |
| `color/cyan/41 18%` `#5e73702e` | `--haru-ink-600-a18` → `--color-border-subtle` | `semantic/color.css:65` |
| `color/cyan/41 30%` `rgba(94,115,112,.3)` | `--haru-ink-600-a30` → `--color-indicator-inactive` | `semantic/color.css:93` |
| `glass-fill` `#ffffffbd` (74%) | `--haru-white-a74` → `--color-surface-glass` | `semantic/color.css:46` |
| `glass-fill-strong` `#ffffffe5` (90%) | `--haru-white-a90` → `--color-surface-strong` | `semantic/color.css:47` |
| white 50% (메달리온 링 fill) | `--haru-white-a50` | `primitive/color.css:65` |
| 배경 그라디언트 | `--gradient-app` | §2.2 `[픽셀]` |
| radius **22** (버블) | `--radius-surface` | `semantic/radius.css` |
| radius **16** (코칭 노트) | `--radius-field` | 동 |
| radius **100** (pill·버튼·스티커) | `--radius-pill` | 동 |
| radius **30** (`88:960`) | **`--radius-card`(28)** — radius.css 의 "26·30·32 → card(28)" 흡수 규칙 | `[문서 인용: semantic/radius.css 주석]` |
| radius **4** (dots) | `--radius-indicator` | 동 |
| radius **19** (38×38 아이콘 버튼) | `--radius-pill` (38/2=19 = 완전 원) | `[계산]` |
| drop 1겹 + inset 2겹 (`0 6 4`) | **`--shadow-bubble`** | `[문서 인용: semantic/shadow.css]` — 버블·스티커·메달리온 링·IconButton 전부 이 모양 |
| drop 3겹 + inset 2겹 (`0 2 4`/`0 12 28`/`0 28 56`) | **`--shadow-glass-rest`** | `88:960` 드로어 |
| 아이콘 타일 `0 4px 10px ink?% + inset white` | `--shadow-icon-chip`(`0 4px 10px ink10% + inset 0 1.5px 0 white50%`) — **ink 알파 25 vs 10, white 60 vs 50 으로 다르다** | §7.2 참조 |
| 버튼 38×38 | `--icon-button-size` | `component/index.css:29` |
| 버튼 45 / px26→24 / py14 / pill | `--button-height-md` · `--button-padding-x` · `--button-padding-y-md` · `--button-radius` | `component/index.css:20~26` |
| blur 12 / 24 | `--material-blur-md` / `-lg` | `semantic/material.css` |
| 타이포 16/22 | **`--text-callout`(16/21) 과 line-height 1px 차이** | §7.3 |
| 타이포 13/19 · 13/18.85 | **`--text-footnote`(13/18) 과 1px 미만 차이** | §7.3 |
| 타이포 17/22.1 · 17/17 | `--text-headline`(17/22) | §7.3 |
| 타이포 12/15.6 · 11.8/12 | `--text-caption-1`(12/16) 또는 기존 `--prompt-pill-text-*` | §7.3 |
| 타이포 15 / 14 / 10 | §7.3 |

### 7.2 신규 토큰 **요청 후보** — 값을 코드에 직접 넣지 않는다

> 전부 **제안**이다. 채택·흡수 여부는 사용자 결정이다. 각 항목에 **흡수 대안**을 함께 적었다.

| # | 이름(제안) | Figma 값 | 흡수 대안 | 판단 근거 |
|---|---|---|---|---|
| **T-1** | `--haru-white-a86` | `color/white/-86%` `rgba(255,255,255,0.86)` — `88:960` 드로어 면 | `--haru-white-a85`(Δ0.01) 로 흡수 | 저장소는 이미 a74 / **a82** / **a85** / a90 을 **구분해 유지**하고 있다 `[문서 인용: primitive/color.css:60~64]`. a85 와 Δ0.01 이면 **흡수가 합리적**이나, 기존 방침은 구분 유지다 → **DECISION-NEEDED** |
| **T-2** | `--haru-white-a55` | Record 코어 `inset 0 2px 0 rgba(255,255,255,0.55)` | `--haru-white-a50`(Δ0.05) 로 흡수 | 단일 사용처. 흡수 쪽이 유력 |
| **T-3** | `--shadow-record-core` | `0 12px 28px ink16%` + `inset 0 2px 0 white55%` | 없음 — 기존 어떤 shadow 토큰과도 모양이 다르다 | `--shadow-glass-rest` 의 **2번째 drop 1겹만** + inset 1겹. `[실측·svg]` 로 확정 |
| **T-4** | `--gradient-sticker-badge` | `linear-gradient(140.26769705991268deg, #d0cca1 0%, #eed2bd 70.922%)` | 없음 | start `#d0cca1` = **기존 `--haru-palette-yellow`** `[문서 인용: primitive/color.css:17]`. end `#eed2bd` 는 **palette 에 없다** → primitive 1건(`--haru-palette-peach`?) + gradient 1건 |
| **T-5** | `--gradient-book-cover-placeholder` | `linear-gradient(131.18592509702313deg, #85bfb6 0%, #b0cfc0 70.922%)` | 없음 | start = 기존 teal. end `#b0cfc0` 은 palette 에 **없다**. TopBar 책 칩 표지 자리 |
| **T-6** | `--record-ring-opacity-outer` / `-inner` | **0.35** / **0.6** (teal stroke 2px) | — | `[실측·svg]`. 토큰화할지 컴포넌트 CSS 상수로 둘지는 구현 결정 |
| **T-7** | `--shadow-sticker-badge` | `0 4px 10px rgba(94,115,112,0.25)` + `inset 0 1.5px 0 rgba(255,255,255,0.6)` | **`--shadow-icon-chip`** (= `0 4px 10px ink**10%**` + `inset 0 1.5px 0 white**50%**`) | 기하는 같고 **알파만 다르다**(ink 25↔10, white 60↔50). 흡수하면 그림자가 **눈에 띄게 연해진다** → **DECISION-NEEDED** |
| **T-8** | 세션 버블 tail 기하 | 22.627 컨테이너 · **16×16 정사각 `rotate(-45deg)` radius 3** · **중앙 50%** · `mb -12` | 기존 `--bubble-tail-*` 은 Home 용(`50:174`: 22.49×16.35, **76.32%**, `rotate -36.02deg` + `skew 17.97deg`) `[문서 인용: component/index.css:79~86]` | **기하가 다르다** — 회전만 있고 skew 가 없으며 위치가 중앙이다. 기존 토큰으로 표현 불가 → Tier-3 신규 세트 |
| **T-9** | Record Control 치수 | 150 / 122 / 108 / 아이콘 40 / 라벨 10px | — | Tier-3 컴포넌트 토큰 신규 |
| **T-10** | 세션 버블·드로어 치수 | 버블 329·297 / 드로어 353 / pill 297·310 / 노트 h158 | — | Tier-3 컴포넌트 토큰 신규 |

### 7.3 타이포 — Figma ↔ 저장소 스케일 대조

| Figma (크기/line-height/weight) | 사용처 | 저장소 스케일 | 차이 |
|---|---|---|---|
| 16 / 22 / Semibold(590) | `139:2803` 제목 · `88:757` 주 문구 | `--text-callout` 16/**21** | line-height **+1** |
| 16 / 22 / **Bold(700)** | `88:929` 주 문구 (override) | 동 | 동 + **weight 가 다르다**(590↔700) |
| 13 / 19 / Regular | 버블 보조 문구 | `--text-footnote` 13/**18** | **+1** |
| 17 / 22.1 / Bold(700) | `88:960` 제목 | `--text-headline` 17/**22** | **+0.1** |
| 13 / 18.85 / Regular | `88:960` 부제 | `--text-footnote` 13/**18** | **+0.85** |
| 12 / 15.6 / Regular | `88:960` 코칭 노트 | `--text-caption-1` 12/**16** | **−0.4** |
| 11.8 / 12 / Semibold | pill 본문 | **기존 `--prompt-pill-text-size`(caption-1 12) + `--prompt-pill-text-line`(space-3 = 12)** `[문서 인용: component/index.css:163~164]` | 흡수 선례 있음 |
| 12 / 12 / Semibold | `Pagetag3` 배지 | 동 | 동 |
| 17 / 17 / Semibold | 버튼 라벨 | `--text-headline` 17/22 (`--button-label-size`) | line-height **−5** — 단 `nowrap` + 세로 가운데라 시각 영향 없음 `[계산]` |
| **15** / normal / Semibold | `29:75` `Session Complete` | `--text-subheadline` 15/20 | line-height `normal` ↔ 20 |
| **14** / normal / Semibold | `29:84` 스티커 제목 | **없다** — footnote 13 과 subheadline 15 사이 | **신규 또는 흡수 DECISION-NEEDED** |
| 12 / normal / Regular | `29:85` 스티커 부제 | `--text-caption-1` 12/16 | — |
| **10** / normal / **Medium(510)** | `140:2854` `Tap to recording` | **없다** — 최소가 `--text-caption-2` **11**/13 | **신규 또는 11 로 흡수 DECISION-NEEDED** |
| 13 / normal / Semibold | TopBar 책 제목 | `--text-footnote` 13/18 | — |

---

## 8. `R-FIGMA-1` 교차 검증 기록

### 8.1 "Style 이름이 같아도 인스턴스가 그리는 겹 수는 다르다" — 전수 확인

`HARU/Shadow Rest`(정의 **5겹**: drop 3 + inset 2) 또는 `HARU/Glass Rest`(정의 **6겹**: blur 1 + drop 3 + inset 2) 가 "포함된 스타일"로 보고된 노드를 **전부** 열어 실제 렌더 겹 수를 셌다.

| 노드 | 보고된 Style | **실제 렌더 drop 겹** | 검산(렌더 바운드/변환 원문) |
|---|---|---|---|
| `28:73` Medallion Ring | Shadow Rest (5) | **1** (`0 6 4`) | SVG 198×200 (노드 190) → 좌우+4 위0 아래+10 `[실측·svg]` |
| `29:86` Ellipse Ring | Shadow Rest (5) | **1** (`0 6 4`) | SVG 158×160 (노드 150) → 좌우+4 위0 아래+10 `[실측·svg]` |
| `139:2803` 버블 본체 | Shadow Rest (5) | **1** (`0 6 4`) | `shadow-[0px_6px_4px_0px_rgba(94,115,112,0.08)]` `[실측·ctx]` |
| `88:929` / `88:757` 버블 | Shadow Rest (5) | **1** (`0 6 4`) | 동 |
| `29:79` Attendance Sticker | Shadow Rest (5) | **1** (`0 6 4`) | 동 |
| `29:76` 닫기 · `78:157` 뒤로 | Shadow Rest (5) | **1** (`0 6 4`) | 동 |
| `139:2737` 책 칩 | Shadow Rest (5) | **1** (`0 6 4`) | 동 |
| `140:2870` / `163:1618` / `163:1620` / `91:717` 버튼 | Glass Rest (6) | **2** (`0 2 4` + `0 12 28`) | `drop-shadow-[0px_12px_14px_…0.16,0px_2px_2px_…0.08]` — **blur 가 1/2 로 적힌다** `[실측·ctx]` |
| `139:2837` Record 코어 | (스타일 미바인딩) | **1** (`0 12 28`) + inset white **0.55** | SVG 164×164 (노드 108) → 좌우+28 위+16 아래+40 `[실측·svg]` |
| **`88:960` Prompt Drawer** | Glass Rest (6) | **3 (전부)** | `shadow-[0px_2px_4px…,0px_12px_28px…,0px_28px_56px…]` `[실측·ctx]` |

> **13개 중 3겹을 전부 그리는 것은 `88:960` 하나뿐이다.** 나머지는 1겹 또는 2겹이다. 저장소에는 이 패턴을 위해 **`--shadow-bubble`(1겹) 이 이미 존재**한다 `[문서 인용: semantic/shadow.css, `V-10`]` — **이번에도 같은 함정이 반복될 수 있었던 지점**이다.
>
> 버튼의 **2겹**은 `--shadow-glass-rest`(3겹) 와 다르지만, 저장소는 *"Figma 의 Button / TabBar / Input instance 는 Effect Style 을 바인딩하지 않고 raw 그림자를 쓰며, 그 차이는 §10.3 **AD-3 허용 차이**"* 로 **이미 등록**해 두었다 `[문서 인용: semantic/shadow.css 머리 주석]` → **신규 이슈 아님**.
>
> ⚠ 반면 **IconButton** 은 `--shadow-rest`(drop **3겹**)를 쓰는데 Figma 인스턴스(`78:157`·`29:76`)는 **1겹**이다 `[실측·ctx + 문서 인용: IconButton.css:46]`. AD-3 의 열거(Button/TabBar/Input)에 IconButton 이 **없다** → §11 `S4F-12` 로 올린다.

### 8.2 "면이 균일하지 않으면 단색이 아니다"

| 노드 | 픽셀로 보면 | **선언** | 함정 |
|---|---|---|---|
| `28:73` / `29:86` 메달리온 링 | 연한 민트 단색처럼 보인다 | **`white` `fill-opacity="0.5"`** | 배경 그라디언트가 비쳐 **세로 위치마다 색이 달라진다** |
| `29:79` 스티커 | 거의 흰색 | **`glass-fill` `#ffffffbd`(74%)** | 동일 |
| `88:960` 드로어 | 흰색 | **`rgba(255,255,255,0.86)` + `backdrop-blur 12`** | 동일 |
| Record 바깥/가운데 링 | 연한 teal 선 | **`stroke #85BFB6` + `opacity 0.35` / `0.6`, fill 없음** | 면이 아니라 **2px 선**이다 |

### 8.3 "`overflow` 를 CSS grep 으로만 찾지 마라"

Figma 쪽 `overflow` 선언 `[실측·ctx]`:

| 노드 | 선언 |
|---|---|
| `139:2803` Speech Bubble `88:839` | **`overflow-clip`** |
| `88:757` / `88:929` Speech Bubble | **`overflow-clip`** |
| `29:79` Attendance Sticker · `29:80` 타일 | **`overflow-clip`** |
| `29:83` 텍스트 Frame | **`overflow-clip`** |
| `78:157` 뒤로가기 · `29:76` 닫기 | **`overflow-clip`** |
| `139:2737` 책 칩 | **`overflow-clip`** |
| `88:960` 드로어 | 선언 없음 (`overflow: visible`) |

→ 버블 본체가 `overflow-clip` 이다. 버블 **안쪽**에는 drop shadow 를 가진 요소가 없으므로(§4.2) 현재 구성에서는 inset 이 필요 없다. 다만 **버블 안에 그림자 있는 요소를 추가하면 즉시 잘린다.**

---

## 9. PRD ↔ Figma 불일치 (사용자 결정 대상)

> **design-agent 가 판단하지 않는다.** 지점별로 ① Figma 가 가진 것 ② PRD 가 요구하는 것 ③ 영향 범위를 적고 결정을 올린다 (`CLAUDE.md` Source of Truth · 2026-09-29 결정).

| ID | 지점 | ① Figma | ② PRD | ③ 영향 범위 | 상태 |
|---|---|---|---|---|---|
| **PF-01** | **세션 중 Prompt 제시** | `28:51` 에 `139:2803` 버블이 **고정 배치** — `Try this prompt !` + pill 5개. **여는 트리거 없음** `[실측]` | §7.5 *"세션 중 자동 제시는 하지 않는다(아이 몰입·대화 방해 금지)"*, *"세션 중에는 'Prompt 모아보기' 버튼으로 양육자가 필요할 때만 조용히 확인"* `[문서 인용]` | `/session/:sessionId` 화면 구조 전체 · `SessionSummary.bubble` ↔ `prompts` contract 역할 · `88:960` Drawer 채택 여부 · AC-4-40·52·53 | **DECISION-NEEDED** (plan `N4-02`) |
| **PF-02** | **녹음 중 캐릭터 버블** | 프레임 이름이 `Ready / **Recording**` 인데 버블이 배치돼 있다 `[실측]` | §7.5 *"캐릭터 버블은 세션 시작·세션 종료 **2가지 경우로 제한**한다(**녹음 중 개입 없음**)"* `[문서 인용]` | recording 상태 화면 구성 | **DECISION-NEEDED** |
| **PF-03** | **"읽기 완료" 버튼** | **없다.** 하단 버튼은 `Resume` 이고, loose 로 `Discard`·`Submit` 이 있다 `[실측]` | FR-09 · §7.5 *"녹음 버튼 → '읽기 완료(Done Reading)' 버튼으로 전환"* `[문서 인용]` | `RecordingController` 상태 전이 UI · `completed(user_done)` 전이 트리거 · AC-4-41·57 | **DECISION-NEEDED** (plan `N4-01`) |
| **PF-04** | **준비 화면 "오늘의 책 카드"** | `28:51` 에 **없다**. 책을 표시하는 유일한 노드는 **미배치 TopBar `78:353`** 의 칩(`The Most Magnificent Thing`) `[실측]` | §7.5 준비 상태 *"상단에 오늘의 책 카드"* `[문서 인용]` | ready 화면 상단 구성 · `78:353` 채택 여부 | **DECISION-NEEDED** |
| **PF-05** | **"Prompt 모아보기" 트리거** | **없다.** Drawer 컴포넌트 `88:960` 만 존재하고 여는 버튼이 어느 프레임에도 없다 `[실측]` | §7.5 *"하단 보조 버튼('Prompt 모아보기')"* · 녹음 중 상태 *"'Prompt 모아보기' 보조 버튼"* `[문서 인용]` | Drawer 진입 경로 · AC-4-52 | **DECISION-NEEDED** (C-13 §10) |
| **PF-06** | **녹음 버튼 맥동 애니메이션** | 링 2겹(opacity 0.35 / 0.6)으로 **정지 표현**만 있다. 애니메이션 정의 **없음** `[실측·svg]` | §7.5 *"중앙 녹음 버튼 표시(**맥동 애니메이션**)"* `[문서 인용]` | 모션 명세 · `prefers-reduced-motion` · `R-16` | **DECISION-NEEDED** (plan `N4-06`) |
| **PF-07** | **녹음 중 캐릭터 "듣고 있음" 표정·동작** | avatar 에셋 **1종뿐**(두 화면 동일 그림) `[실측·png]` | §7.5 *"듣고 있음을 표시하는 표정·동작만 표시"* `[문서 인용]` | 캐릭터 상태 표현 · 에셋 요청 | **DECISION-NEEDED** (`R-16`) |
| **PF-08** | **완료 애니메이션** | **없다** `[실측·meta: Chracter section 6개 전부 정지 이미지]` | §7.5 읽기 완료 *"**완료 애니메이션** + 출석체크 스티커 지급"* `[문서 인용]` | 동 | **DECISION-NEEDED** (`R-16`) |
| **PF-09** | **`streak` 표현 부활** | `29:85` 부제 **`Day 12 · keep the streak going`** `[실측·ctx]` | PRD §7 의 **진단·판정·비교 표현 금지** 및 Stage 3 결정 `D-6`/`AD-S3-9`("streak·분 표시를 쓰지 않는다" → Home 칩 교체) `[문서 인용]` | 완료 화면 문구 · copy 모듈 · 기존 Stage 3 결정과의 일관성 | **DECISION-NEEDED** |
| **PF-10** | **`Discard` 버튼** | loose 로 **있다**(`163:1618`), teal 기본 스타일 `[실측]` | PRD 에 **녹음 폐기 전이가 없다** `[문서 인용: plan `N4-03`]` | 최우선 규칙 2(없는 것을 만들지 않는다) ↔ 3(있는 것을 빼지 않는다) 가 **동시에 걸린다**. 채택 시 `abandoned` 전이·로컬 삭제·동의 정책 정의 필요 | **DECISION-NEEDED** (plan `N4-03`) |
| **PF-11** | **`Submit` 버튼** | loose 로 **있다**(`163:1620`) `[실측]` | 세션 완료 제출은 `29:62` 의 `91:717` **`Save`**(Stage 5) 가 담당한다 `[실측]` | `Submit` 이 세션 버튼인지 회고 버튼의 대체 라벨인지 **확인 불가** (x 좌표는 세션 열, 라벨 의미는 회고 쪽) | **DECISION-NEEDED** |
| **PF-12** | **녹음 경과 시간 표시** | **없다** — 어느 노드에도 타이머가 없다 `[실측]` | FR-09 30분 자동 종료 · plan `AC-4-97` 이 "녹음 경과 표시" 를 요구 `[문서 인용]` | recording 화면 · 30분 타이머 UX | **C-13** (§10) |

---

## 10. C-13 대상 — Figma 에 **없는** 화면·상태

> `rules/workflow.md` §3 · Stage 0 `C-13`: **사용자가 화면별로 ⓐ 디자이너에게 Figma 요청 ⓑ design-agent 명세 중 하나를 승인하기 전에는 명세하지 않는다.**
> 아래는 **"정말 없는지 확인한 결과"** 다 — 추정이 아니다.

> **⟲ 2026-10-13 정정 → §15.8** — `C13-1`(부분) · `C13-16`(전부) 이 Figma 갱신으로 **해소**됐다. `C13-2`·`C13-14`·`C13-15` 는 **그대로 남는다**. 아래 표는 2026-10-11 상태 기록이며, 현재 상태는 §15.8 이다.

| # | 항목 | 확인 방법 | 결과 |
|---|---|---|---|
| **C13-1** | **상태별 세션 화면** (ready / recording / paused 분리) | `28:51` 자식 6개 전수 + loose 4개 + Record Control 변형 2개 | **없음.** 한 프레임에 **idle 컨트롤(`Record`) + paused 버튼(`Resume`)** 이 동시에 놓여 있다 |
| **C13-2** | **"Done Reading" 버튼** | §6 질문 3 의 3중 확인 | **없음** |
| **C13-3** | **녹음 경과 시간 표시** | 두 프레임 + loose + Design Guide 컴포넌트 전수 | **없음** |
| **C13-4** | **Prompt Drawer 열기 트리거** | `28:51` 자식 전수 · Design Guide 에 `Button/Filter`·`Button/White`·`Button/card` 외 보조 버튼 없음 | **없음** (Drawer 본체 `88:960` 만 존재) |
| **C13-5** | **마이크 권한 거부 화면·상태** | `31:204` 682 노드 + `8:2` 캔버스 전수에서 `Permission`/`Mic` 0건. Record Control 에 `disabled` 변형 없음 | **없음** |
| **C13-6** | **대화 전용(conversation_only) 흐름** | 동일 전수 검색 | **없음** |
| **C13-7** | **업로드 진행·실패·재시도 안내** | Design Guide 에 **Alert·Toast·Banner·Snackbar·Dialog 컴포넌트가 0개**. Bubble 변형 3개 모두 안내용이 아님 | **없음** |
| **C13-8** | **오프라인 안내** | 동 | **없음** |
| **C13-9** | **48h 업로드 만료 안내** | 동 | **없음** |
| **C13-10** | **크래시 복구 안내** | 동 | **없음** |
| **C13-11** | **10분 방치 리마인드 버블** | `88:721` Bubble 변형 **3개뿐**(Type2 / sessopn / Type3) | **없음** |
| **C13-12** | **30분 자동 종료 안내** | 동 | **없음** |
| **C13-13** | **Reading Context 선택 시트** | `86:512`/`86:545` 에 `Bedtime · 9:00 PM` **칩**만 있고(Home 카드 변형, Stage 3 범위) 시트·선택 UI 없음 | **없음** |
| **C13-14** | **Record Control `paused` / `disabled` / permission-denied 변형** | `163:1590` 변형 2개(Record · Pause) | **없음** |
| **C13-15** | **세션 TopBar 의 배치 여부** | `78:353` 은 section 직계 자식이고 렌더에 나타나지 않음 | **배치 확인 불가** — 쓸지 말지가 결정 대상 |
| **C13-16** | **`Discard` / `Submit` 의 소속 화면** | 두 노드 모두 loose | **배치 없음** — 쓸지 말지가 결정 대상 |

---

## 11. Stage 4 디자인 미결 목록 (`S4F-xx`)

> 위 §9·§10 과 중복되지 않는, **이번 실측에서 새로 드러난** 항목이다.

| ID | 항목 | 실측 사실 | 결정 필요 내용 |
|---|---|---|---|
| **S4F-01** | `139:2803` 버블의 pill 5개가 **전부 같은 placeholder** | `[실측·ctx]` | Prompt 개수(n)와 텍스트 길이가 가변일 때 버블 높이 정책. Figma 는 **5개 고정 예시**만 보여준다 |
| **S4F-02** | pill 본문이 Figma 자체에서 **38px 안에 2줄로 넘친다** | 선언 h 38 ↔ 내용 40 `[계산]` | 1줄 clamp 인지 2줄 허용인지. Home pill 은 `--prompt-pill-text-line: 12` × 2줄 = 24 로 **2줄 전제** `[문서 인용]` |
| **S4F-03** | `139:2803` 버블 tail 이 **정중앙(50%)** | `[계산]` | 기존 `--bubble-tail-start: 76.32%`(Home) 와 **다르다**. Tier-3 신규 세트 필요 (T-8) |
| **S4F-04** | 버블 tail 이 **16×16 정사각 `rotate(-45deg)`**, skew 없음 | `[실측·ctx]` | 기존 `--bubble-tail-rotate/-skew`(Home `50:174`) 와 **기하가 다르다** |
| **S4F-05** | `88:929` 주 문구가 **Bold(700)**, `88:757` 은 **Semibold(590)** | `[실측·ctx]` | 같은 컴포넌트 변형인데 인스턴스가 weight 를 override 했다. 완료 문구만 Bold 로 둘지 |
| **S4F-06** | `88:960` 제목 문자열 끝에 **공백 1개** (`Prompts of this session `) | `[실측·ctx]` | 오타로 보이나 **단정하지 않는다**. copy 확정 필요 |
| **S4F-07** | `88:960` 코칭 노트가 **면 없이 테두리만** | `[실측·ctx]` | Home 뒷면 코칭 노트는 **beige `#f0eee6` 면**이다 `[문서 인용: stage-3-home-figma-audit §1 ⑤]`. 두 화면이 다르다 |
| **S4F-08** | `88:960` dots 가 **3페이지**(활성 1 + 점 2) | `[실측·ctx]` | Prompt n 이 3이 아닐 때의 dots 정책 |
| **S4F-09** | `88:960` pill **양쪽에 24×24 화살표** | `[실측·ctx]` | 가로 스와이프 + 화살표 병행인지, 화살표만인지. `AC-4-?` 키보드 경로(WCAG 2.5.1)와 연결 |
| ~~**S4F-10**~~ | ~~`Discard`·`Submit`·`Resume` 이 **시각적으로 구분되지 않는다**~~ | ~~셋 다 teal Accent/Rest~~ | ⟲ **2026-10-13 해소 → §15.3** — `Discard` 가 신규 변형 `Accent/Secondary`(`#aeaeb2`) 를 쓴다. **새 쟁점으로 대체**: 흰 라벨 on `#aeaeb2` 대비 **2.211:1** 이 `D-01` 범위 밖이다 → `S4F-17` |
| **S4F-11** | `28:51` 의 버블(+2)·버튼(좌60/우52) **가로 중심 어긋남** | `[계산]` | 가운데 정렬로 보정할지 Figma 좌표를 그대로 쓸지 |
| **S4F-12** | 저장소 `IconButton` = `--shadow-rest`(drop 3겹) ↔ Figma `78:157`/`29:76` = **1겹** | `[실측·ctx + 문서 인용]` | `AD-3` 허용 차이 열거에 IconButton 이 **없다**. 토큰을 `--shadow-bubble` 로 바꿀지, AD-3 를 확장할지 |
| **S4F-13** | 타이포 **14 / 10** 스케일이 저장소에 없다 | §7.3 | 신규 스텝 추가 vs 13·11 로 흡수 |
| **S4F-14** | `29:62` 에서 Stage 4 구현 시 **y 468~852 가 빈다** | `[계산]` | 의도적 미구현을 QA 증거로 남기는 방식 확정 |
| **S4F-15** | `78:353` TopBar 책 표지 자리가 **16×22 그라디언트 플레이스홀더** | `[실측·ctx]` | 실제 표지 이미지를 넣을지, Figma 대로 플레이스홀더를 둘지 |

---

## 12. 에셋 / 라이선스 메모

| 에셋 | 형식 | 비고 |
|---|---|---|
| 세션 아바타 (`28:74` / `29:87`) | PNG 348² / 272² (2x), 원형 마스크 적용본 | **같은 그림**. 원본 = `163:2530` `HARU_Hello_t 1` PNG 702×1248 RGBA |
| 메달리온 합성본 `163:2528` | **JPEG 200×200** (투명도 없음) | 그라디언트 배경이 **구워져 있다**. 앱 배경이 바뀌면 어긋난다 → ring(white 50%) + 투명 PNG 조합이 안전 |
| Record Control 링 3겹 | **SVG** | CSS 로 재현 가능 (stroke 2px + opacity, fill, box-shadow) — SVG 로 넣을 필요 없음 |
| 마이크 / pause 아이콘 | **SVG 40×40**, white | `lucide-react` 대조 필요. pause 막대는 **radius 0** 이라 `lucide` `pause`(둥근 끝)와 **모양이 다를 수 있다** → 글리프 대조 필요 |
| 스티커 엄지척 `90:602` | **SVG 20×20**, white | Icon set 의 `thumb_white` 로 보이나 **확정 아님** |
| 뒤로가기 `‹` / 닫기 `✕` | SVG 18×18 / 15×15 | 기존 Stage 1~3 아이콘 재사용 가능성 확인 필요 |
| 캐릭터 라이선스 | — | `221:1147` "Chracter" section 의 6개 원본에 **출처·라이선스 표기가 없다** `[실측·meta]`. Stage 3 에서도 같은 상태였다 → **보고 대상** |

---

## 13. 확인하지 못한 것

| 항목 | 이유 |
|---|---|
| Prototype 연결(Reactions) — 화면 전환 경로 | Figma MCP 가 노출하지 않는다 |
| `78:353` TopBar 가 **의도적 배치인지 작업 잔여물인지** | section 직계 자식이라 `get_screenshot(28:51)` 에 포함되지 않았고, hidden 플래그도 노출되지 않는다 |
| `90:602` 아이콘이 `90:599 thumb_white` 인스턴스인지 | SVG fill=white 와 id 순서로 **추정**했을 뿐, 인스턴스의 master id 는 노출되지 않았다 |
| `163:2529`(`Haru_Hello_Heart_t 1`) · `163:2532`(`asset/home-character`) · `163:2536`/`163:2543`(안경 캐릭터) 의 픽셀 내용 | Stage 4 범위 밖이라 다운로드하지 않았다. **정지 raster 라는 사실만** metadata 로 확인 |
| `91:691` Feedback Card 내부 실측값 | **의도적으로 측정하지 않았다** (Stage 5 범위 — 지시 9) |
| 두 화면의 **애니메이션·모션 명세** | Figma 에 존재하지 않는다 (= `R-16` 미결) |
| Figma 변형 property 의 **기본값(default variant)** | component set 의 기본 변형 지정은 MCP 가 노출하지 않는다 |

---

## 14. 이 문서가 **하지 않은 것**

- Design Spec 을 쓰지 않았다 (⛔ 5건 미결 — `N4-01`·`N4-02`·`N4-03`·`N4-06`·`N4-07`).
- Figma 에 없는 화면·상태를 **명세하지 않았다** (§10 은 "없다"는 확인 결과일 뿐이다).
- PRD ↔ Figma 충돌을 **임의로 판단하지 않았다** (§9 는 전부 `DECISION-NEEDED`).
- Production Code 를 수정하지 않았다. 신규 토큰은 **요청 후보**로만 올렸다 (§7.2).
- Figma 를 수정하지 않았다.

---

## 15. ⭐ 2026-10-13 Figma 갱신 — 신규 실측과 정정 전문

### 15.0 측정 조건

| 항목 | 값 |
|---|---|
| 조회일 | **2026-10-13** |
| 도구 | Figma MCP `get_metadata`(`285:1126` · `163:1601` · `163:1591` · `17:20` · `140:2870`) · `get_design_context`(`285:1445` · `17:20` · `163:1590` · `140:2870`) · `get_variable_defs`(`285:1445`) · `get_screenshot`(`285:1126`, `maxDimension 1250` → 705×1205, 원본 625×1125) |
| 좌표계 | **섹션 `285:1126` 로컬** 좌표(절대 원점 **x 2241 / y 35**)와 **프레임 `28:51` 로컬** 좌표를 구분해 적었다. 2026-10-11 본문은 `31:204` 기준이라 **같은 노드의 숫자가 다르다** — 비교할 때 반드시 기준을 확인하라 |
| 표기 | §0.1 과 동일 (`[실측·meta]` / `[실측·ctx]` / `[실측·svg]` / `[계산]` / `[직독]` / `[문서 인용]` / `[픽셀]`) |

> **`R-FIGMA-1` ①·② 준수 기록**: `#aeaeb2` 는 렌더 PNG 샘플링이 아니라 **`get_variable_defs` 의 변수 선언**(`"grays/gray-2":"#aeaeb2"`)과 `get_design_context` 의 `bg-[var(--grays\/gray-2,#aeaeb2)]` **두 경로**로 읽었다 `[실측·ctx + variable_defs]`. 그림자 겹 수는 Style 이름(`HARU/Glass Rest` = 6겹)이 아니라 **인스턴스가 실제로 돌려준 `drop-shadow-[...]` 원문 2겹**으로 세고, 렌더 바운드로 역산 검산했다(§15.7).

---

### 15.1 섹션 `285:1126` "Recording" — 구조 전수

`[실측·meta]` — 섹션 직계 자식 **4개**가 전부다.

| 노드 | 이름 | 섹션-local x/y | 크기 | 성격 |
|---|---|---|---|---|
| **`28:51`** | `1b · Session — Ready / Recording` | 15 / 85 | **393 × 852** | 세션 프레임. 자식 **6개** |
| `163:1601` | `Record Control` | 435 / 706 | 150×150 | **참조 인스턴스** (프레임 오른쪽 밖) — §15.5 |
| `31:206` | text `1b · Session — Ready / Recording` | 15 / 21 | 243×18 | 섹션 라벨 |
| `78:353` | `Frame 7` | 15 / 141 | 393×59 | 세션 TopBar — §15.6 |

섹션 자체: **625 × 1125 @ 절대 (2241, 35)** `[실측·meta]`.

`28:51` 절대 좌표 = (2241+15, 35+85) = **(2256, 120)** `[계산]` → **2026-10-11 과 동일** ✓. 프레임은 움직이지 않았고 **섹션이 새로 씌워진 것**이다.

#### `28:51` 자식 6개 `[실측·meta]`

| 노드 | 이름 | frame-local x/y | 크기 | 2026-10-11 대비 |
|---|---|---|---|---|
| `28:52` | `Screen/Status Bar` | 0 / 0 | 393×56 | 동일 |
| `28:73` | `Medallion Ring` | 101.5 / 132 | 190×190 | 동일 |
| `28:74` | `Avatar` | 109.5 / 140 | 174×174 | 동일 |
| `139:2803` | `Bubble` | 34 / 336 | **329×258** | **동일 — 그대로 배치돼 있다** ⚠️ §15.9 |
| `163:1591` | `Record Control` | 122 / 621 | 150×150 | 동일 |
| **`285:1445`** | **`After_record`** | **67 / 789** | **279×45** | ⭐ **신규** (`140:2870` `Resume` 281×45 @ 60,787 을 대체) |

---

### 15.2 `285:1445` "After_record" — 신규 하단 버튼 바

#### 기하 `[실측·meta + 실측·ctx]`

| 항목 | 값 | 근거 |
|---|---|---|
| 노드 | `285:1445` `frame` `After_record` | `[실측·meta]` |
| 크기·위치 | **279 × 45** @ frame-local **(67, 789)** | `[실측·meta]` |
| 레이아웃 | `flex` · `items-center` · **`gap: 9`** · `size-full` | `[실측·ctx: `content-stretch flex gap-[9px] items-center relative size-full`]` |
| 자식 1 | `163:1618` `Button` **135×45** @ (0, 0) · `shrink-0 w-[135px]` | `[실측·meta + ctx]` |
| 자식 2 | `163:1620` `Button` **135×45** @ (**144**, 0) · `shrink-0 w-[135px]` | `[실측·meta + ctx]` |
| **폭 검산** | 135 + **9** + 135 = **279** ✓ · 자식 2 의 x 144 = 135 + 9 ✓ | `[계산]` |
| **버튼은 고정 폭이다** | `shrink-0 w-[135px]` — `flex: 1` 이 **아니다**. 279 컬럼에서 둘이 정확히 채운다 | `[실측·ctx]` |

#### 세로 간격 — 바뀐 값 `[계산]`

| 구간 | 2026-10-11 | **2026-10-13** |
|---|---|---|
| Record Control bottom (621+150 = **771**) → 하단 바 top | **16** (787−771) | **18** (789−771) |
| 하단 바 bottom | 787+45 = **832** | 789+45 = **834** |
| 하단 바 bottom → frame bottom (852) | **20** | **18** |

→ 녹음 컨트롤 아래 **18 / 바 45 / 프레임까지 18** 로 **위아래 여백이 같아졌다** `[계산]`.

#### 가로 위치 `[계산]`

- 좌 **67** / 우 393 − (67+279) = **47**. 가운데라면 (393−279)/2 = **57** → **+10 오른쪽으로 치우쳐 있다**.
- 2026-10-11 의 `140:2870` 은 좌 60 / 우 52 → **+4** 였다. **치우침이 +4 → +10 으로 커졌다.**
- → §11 `S4F-11`(가로 중심 어긋남)은 **해소되지 않았고 값만 바뀌었다**. 가운데 정렬 보정 여부는 여전히 결정 대상이다.

#### `140:2870` `Resume` 의 현재 상태 `[실측·meta + ctx]`

| 항목 | 값 |
|---|---|
| 존재 여부 | **존재한다** — 삭제되지 않았다 |
| 위치 | 절대 **(2441, 1200)** · 281×45 |
| 소속 | 섹션 `285:1126` 은 y 35~**1160** 이다 `[계산]` → **섹션 밖, 아래쪽**. `28:51` 의 자식이 **아니다** |
| 라벨 | **`Resume`** — 여전히 그대로다 `[실측·ctx: `<p>Resume</p>`]` |
| 변형 | `17:12` `Variant=Accent, State=Rest` `[계산: 텍스트 자식 id `I140:2870;17:13`]` · 면 `accents/teal` `#85bfb6` |

> **판정**: `Resume` 버튼은 **지워지지 않았지만 세션 화면에서 빠졌다**. "섹션 밖으로 밀어낸" 배치는 **폐기 또는 보류**로 읽히나, Figma 가 hidden/deprecated 플래그를 노출하지 않으므로 **단정하지 않는다**. → §15.10 `S4F-18`.

---

### 15.3 `163:1618` `Discard` / `163:1620` `Submit` — 전수 재실측

둘 다 **`285:1445` 의 자식**이다 (2026-10-11 의 "loose" 상태는 **해소**). `[실측·meta]`

| 항목 | **`163:1618` `Discard`** | **`163:1620` `Submit`** | 근거 |
|---|---|---|---|
| 크기 | **135 × 45** | **135 × 45** | `[실측·meta]` |
| 위치 (바 로컬) | (0, 0) | (144, 0) | `[실측·meta]` |
| 텍스트 | **`Discard`** | **`Submit`** | `[실측·ctx: `<p>` 본문]` |
| 텍스트 노드 id | **`I163:1618;285:1229`** | `I163:1620;17:13` | `[실측·meta/ctx]` |
| **base 변형** | ⭐ **`285:1228` `Variant=Accent, State=Secondary`** | `17:12` `Variant=Accent, State=Rest` | **`[계산]`** — 텍스트 자식 base id `285:1229` 는 `285:1228` 의 자식, `17:13` 은 `17:12` 의 자식 (§15.4 세트 덤프로 대조) |
| **면** | ⭐ **`--grays/gray-2` = `#aeaeb2`** | `--accents/teal` = `#85bfb6` | `[실측·ctx + variable_defs]` |
| backdrop blur | **12** | **12** | `[실측·ctx]` |
| radius | `--radius-pill` **100** | 동 | `[실측·ctx + variable_defs]` |
| padding | **px 26 / py 14** | 동 | `[실측·ctx]` |
| 라벨 타이포 | SF Pro **Semibold(590) 17 / line-height 17**, **white**, `nowrap`, `word-break: break-word` | 동 | `[실측·ctx]` |
| drop shadow | **2겹** `0 12px 14px rgba(94,115,112,.16)` + `0 2px 2px rgba(94,115,112,.08)` (Tailwind 변환 — Figma blur 의 1/2) | 동 | `[실측·ctx]` |
| inner shadow | `inset 0 -1px 0 rgba(94,115,112,.05)` + `inset 0 1.5px 0 rgba(255,255,255,.9)` | 동 | `[실측·ctx]` |

#### Tailwind blur 환산 — `R-FIGMA-1` ② 검산 `[계산]`

`get_variable_defs` 가 돌려준 `HARU/Glass Rest` **선언 원문**:
`DROP_SHADOW #5E737014 offset (0,2) radius 4` · `DROP_SHADOW #5E737029 offset (0,12) radius 28` · `DROP_SHADOW #5E73701F offset (0,28) radius 56` · `INNER #FFFFFFE5 (0,1.5)` · `INNER #5E73700D (0,-1)` + `BACKGROUND_BLUR 24`.

알파 환산 `[계산]`: `0x14` = 20/255 = **7.8% ≈ 8%** · `0x29` = 41/255 = **16.1% ≈ 16%** · `0x1F` = 31/255 = **12.2% ≈ 12%`.

인스턴스가 렌더한 것은 **앞 2겹뿐**이고(`0 28 56` 미렌더), Tailwind 출력의 blur 는 Figma radius 의 **1/2**(28→14, 4→2)로 적힌다 `[실측·ctx]`.
→ **CSS 로 쓸 실제 값**: `0 2px 4px rgba(94,115,112,.08)` + `0 12px 28px rgba(94,115,112,.16)` `[계산]`.

#### `R-SHADOW-1` — `285:1445` 번짐 재산출 `[계산]`

> `0 Y B` 의 도달 거리 = 좌우 **B** · 위 **max(0, B−Y)** · 아래 **B+Y**. 겹을 **전부 합산**한다(최대값).

| drop 겹 | 좌/우 | 위 | 아래 |
|---|---|---|---|
| `0 2px 4px` | 4 | 2 | 6 |
| `0 12px 28px` | 28 | 16 | 40 |
| **합산 상한** | **28** | **16** | **40** |

2026-10-11 의 `140:2870` 산출(좌우 28 / 위 16 / 아래 40)과 **동일하다** — 그림자 선언이 같기 때문이다 `[계산]`. **버튼이 281→135 로 좁아져도 번짐은 변하지 않는다.**

클리핑 검토 `[계산]`:
- **가로**: 바 좌 67 − 28 = **39** · 우 346 + 28 = **374** → 393 폭 안. **프레임에서는 잘리지 않는다.**
- **세로 아래**: 바 bottom 834 + 40 = **874** > 프레임 852 → **프레임 밖으로 22 넘친다.** 구현에서 하단 클립 선이 **화면 가장자리와 겹치면 보이지 않는다**(`R-SHADOW-1` ④). 앱 컬럼 안쪽에서 자르면 **보인다** → Design Spec §10 에서 다룬다.
- `285:1445` 자체에는 `overflow` 선언이 **없다**(`get_design_context` 출력에 `overflow-clip` 없음) `[실측·ctx]` → **Figma 쪽에서는 inset 이 필요 없다.**

---

### 15.4 `17:20` Button 컴포넌트 세트 — **8종 → 9종**

`[실측·meta]` 자식 전수:

| 노드 | 이름 | 2026-10-11 |
|---|---|---|
| `17:4` | `Variant=Glass, State=Rest` | 있었음 |
| `17:6` | `Variant=Glass, State=Hover` | 있었음 |
| `17:8` | `Variant=Glass, State=Pressed` | 있었음 |
| `17:10` | `Variant=Glass, State=Disabled` | 있었음 |
| `17:12` | `Variant=Accent, State=Rest` | 있었음 |
| ⭐ **`285:1228`** | **`Variant=Accent, State=Secondary`** | **없었음 (신규)** |
| `17:14` | `Variant=Accent, State=Hover` | 있었음 |
| `17:16` | `Variant=Accent, State=Pressed` | 있었음 |
| `17:18` | `Variant=Accent, State=Disabled` | 있었음 |

→ property 는 여전히 `Variant`(Glass\|Accent) × `State` 이지만, **`State` 에 `Secondary` 가 추가**됐고 **`Glass/Secondary` 는 없다**. 2×5 = 10 이 아니라 **9종**이다 `[실측·meta]`.

#### 변형별 선언 전수 `[실측·ctx — `get_design_context(17:20)` 가 돌려준 조건부 원문]`

| 변형 | 면 | blur | 라벨 색 | drop shadow | inner shadow | opacity |
|---|---|---|---|---|---|---|
| `Glass/Rest` | `--glass-fill` `rgba(255,255,255,.74)` | 12 | `--text-button` `#5e7370` | `0 12 14` + `0 2 2` | `-1px ink5%` + `1.5px white90%` | 1 |
| `Glass/Hover` | 동 | **6** | 동 | **`18 18 20 ink20%` + `4 4 4 ink10%`** | 동 | 1 |
| `Glass/Pressed` | 동 | 12 | 동 | **`0 1 1.5 ink8%`** | **`inset 0 1 3 ink16%` + `inset 0 3 8 ink20%`** | 1 |
| **`Glass/Disabled`** | 동 | 12 | 동 | `0 12 14` + `0 2 2` | `-1px` + `1.5px` | **0.5** |
| `Accent/Rest` | `--accents/teal` `#85bfb6` | 12 | **white** | `0 12 14` + `0 2 2` | 동 | 1 |
| ⭐ **`Accent/Secondary`** | ⭐ **`--grays/gray-2` `#aeaeb2`** | **12** | **white** | `0 12 14` + `0 2 2` | 동 | **1** |
| `Accent/Hover` | teal | **6** | white | `18 18 20` + `4 4 4` | 동 | 1 |
| `Accent/Pressed` | teal | 12 | white | `0 1 1.5` | pressed inset 2겹 | 1 |
| **`Accent/Disabled`** | **teal (면은 Rest 와 같다)** | 12 | **white (색 변화 없다)** | `0 12 14` + `0 2 2` | `-1px` + `1.5px` | ⭐ **0.5** |

#### ⭐ Disabled 시각 — 질문의 답

| 질문 | 답 | 근거 |
|---|---|---|
| `Submit` 의 disabled 변형이 Figma 에 있는가 | **있다** = `17:18` `Accent/Disabled`. **면·라벨 색은 Rest 와 동일**하고 **버튼 전체 `opacity: 0.5`** 만 걸린다 | `[실측·ctx: `state === "Disabled" ? "drop-shadow-[…] opacity-50"`]` |
| `Discard` 의 disabled 변형이 Figma 에 있는가 | ⛔ **없다.** `Accent/Secondary` 에는 **Hover·Pressed·Disabled 짝이 하나도 없다** — `Secondary` 는 **단일 변형**이다 | `[실측·meta: 세트 자식 9개 전수]` |
| disabled 라벨 색이 바뀌는가 | **바뀌지 않는다.** 두 variant 모두 `State` 에 따른 라벨 색 분기가 없고, `Accent` 는 항상 white 다 | `[실측·ctx: 라벨 className 의 분기가 `variant === "Accent" ? "text-white" : …` 뿐]` |

> ⚠️ **`opacity: 0.5` 의 접근성 귀결** `[계산]`: 앱 배경(`#dbeee7`~`#c7c9d7`) 위에서 teal 면 50% 합성 → 약 `#b0d7d2`~`#a6c4c6`, 그 위 **white 50%** 라벨 → 대비가 **2.07:1 보다 더 떨어진다**. Disabled 는 WCAG 1.4.3 대비 요구 대상이 아니지만(disabled 제외 조항), **"눌러도 되는지"의 구분을 투명도 하나에만 맡긴다**는 점은 Design Spec §9 에서 다룬다.

---

### 15.5 `163:1591` vs `163:1601` — variant 판정 (자식 base id 역산)

`163:1590` `Record Control` 세트의 변형은 **여전히 2개**다: `163:1589 Property 1=Record` · `163:1588 Property 1=Pause` `[실측·ctx: `get_design_context(163:1590)` 가 `property1?: "Pause" | "Record"` 만 돌려준다]`.

| 인스턴스 | 자식 base id `[실측·meta]` | **판정** | 근거 |
|---|---|---|---|
| **`163:1591`** (frame-local 122,621) | `139:2835` · `139:2836` · `139:2837` · **`140:2854`(text `Tap to recording`)** · `139:2838`(`Frame` = 마이크) | ⭐ **`163:1589` `Property 1=Record`** | `[계산]` — `get_design_context(163:1590)` 가 `isRecord` 분기에서만 `140:2854` 와 `139:2838` 을 렌더하고, 링 3개의 base id 를 `Record` 쪽에서 `139:2835/2836/2837` 로 적는다 |
| **`163:1601`** (섹션-local 435,706) | `139:2843` · `139:2844` · `139:2845` · **`140:2866`(`pause`)** — **텍스트 노드 없음** | ⭐ **`163:1588` `Property 1=Pause`** | `[계산]` — 동 함수의 `isPause` 분기가 `140:2866` 만 렌더하고 링 base id 를 `139:2843/2844/2845` 로 적는다 |

#### ⭐ `Pause` 변형의 실제 시각 — 재확인 결과

| 항목 | 값 | 근거 |
|---|---|---|
| 링 3겹 | `Record` 와 **완전히 동일** — 세 변형 모두 **같은 SVG 에셋 URL**(`imgEllipse`·`imgEllipse1`·`imgEllipse2`)을 공유한다 | `[실측·ctx: 두 분기 밖 공통 코드]` |
| 코어 그림자 | 공통 — `inset[-14.81% _-25.93% _-37.04% _-25.93%]` 이 코어(108)에 걸린다. 환산 `[계산]`: 좌우 0.2593×108 = **28** · 위 0.1481×108 = **16** · 아래 0.3704×108 = **40** → `0 12px 28px` **1겹** 역산 성립 (3겹이면 좌우 56·아래 84 여야 한다) | `[실측·ctx + 계산]` |
| pause 아이콘 | **40×40 @ (55, 55)** — `Record` 의 마이크는 **(55, 48)** 이다. **아이콘이 7px 아래로 내려온다** (라벨이 없어 세로 가운데로 복귀) | `[실측·meta + ctx]` |
| **라벨** | ⛔ **없다** (자식 4개뿐) | `[실측·meta]` |
| **녹음 경과 시간** | ⛔ **없다** | `[실측·meta: 텍스트 노드 0개]` |
| **맥동(pulse) 정의** | ⛔ **없다.** 링 2겹의 `opacity 0.35 / 0.6` 는 **정지 표현**이고, Figma 에 애니메이션·Smart Animate 정의는 노출되지 않는다 | `[실측·svg §2.5 + 실측·ctx 2026-10-13]` |

#### `163:1601` 의 배치 의도 — 새 근거 `[계산]`

- `163:1601` 섹션-local y = **706**.
- 프레임 안 `163:1591` 의 섹션-local y = 85(프레임 y) + 621 = **706**.
- → **두 Record Control 의 y 가 정확히 같다.** x 만 435 vs 15+122 = 137 로 다르다(프레임 오른쪽 밖 **27px**: 프레임 우변 15+393 = 408, 인스턴스 좌변 435).
- → *"같은 자리의 컨트롤이 `Pause` 로 바뀐다"* 는 **참조 표기**로 읽힌다. 2026-10-11 의 "loose 잔여물" 해석보다 **의도가 분명해졌다.** 다만 Figma 가 주석·연결을 노출하지 않으므로 **단정하지 않는다.**

---

### 15.6 `78:353` 세션 TopBar — 배치 의도 재평가

| 항목 | 2026-10-11 | **2026-10-13** | 근거 |
|---|---|---|---|
| 소속 | section `31:204` 직계 자식 | **section `285:1126` 직계 자식** — 여전히 `28:51` 의 **자식이 아니다** | `[실측·meta]` |
| 좌표 | 절대 (2256, 176) | 섹션-local (15, 141) = 절대 (**2256**, **176**) — **같다** | `[계산]` |
| `28:51` 기준 | x **0** · y **56** (상태바 바로 아래) | **동일** (141 − 85 = 56) | `[계산]` |
| 렌더 | `get_screenshot(28:51)` 에 **나타나지 않았다** | ⭐ `get_screenshot(285:1126)` 에서 **프레임 TopBar 자리에 정확히 겹쳐 렌더된다** — 뒤로가기 `‹` + `The Most Magnificent Thing` 책 칩이 상태바 바로 아래에 보인다 | `[픽셀: 705×1205 렌더 육안 확인]` |
| 내용 | 뒤로 38×38 + gap 18 + 책 칩 | **변화 없음** (자식 `78:342` `Title` 373×40 @ (10,10)) | `[실측·meta]` |

**판정**:
- ✅ **의도 추정의 근거는 강해졌다** — 섹션이 새로 그어지면서 이 프레임이 **세션 화면 묶음 안으로 명시적으로 들어왔고**, 섹션 렌더에서 TopBar 슬롯에 **정확히** 들어맞는다.
- ⛔ **그래도 "확인 불가" 를 유지한다.** ① 여전히 `28:51` 의 **자식이 아니다** ② Figma MCP 가 hidden 플래그·주석·프로토타입 연결을 노출하지 않는다 ③ *"왜 자식으로 넣지 않았는가"* 가 설명되지 않는다(겹치게 둔 것이 의도인지, 자식화를 안 한 것인지).
- → `C13-15` 는 **해소되지 않는다.** 디자이너 요청서 Q5 를 유지하되, **질문의 무게를 낮춘다**(= "쓸지 말지" 가 아니라 **"자식으로 넣어 확정해 달라"**).

---

### 15.7 `R-FIGMA-1` 교차 검증 기록 — 2026-10-13 분

| 규칙 | 이번에 실제로 한 일 |
|---|---|
| ① 색은 렌더 픽셀이 아니라 `fill` 선언 | `#aeaeb2` 를 **`get_variable_defs`(`"grays/gray-2":"#aeaeb2"`)** 와 **`get_design_context`(`bg-[var(--grays\/gray-2,#aeaeb2)]`)** 두 경로로 읽었다. 렌더 PNG 는 **"회색으로 보인다"는 교차 확인에만** 썼고 수치로 쓰지 않았다. ⚠️ `#aeaeb2` 는 **불투명 단색**이다(알파 선언 없음) — 유리 면과 달리 배경에 따라 변하지 않는다 |
| ② Style 이름 ≠ 인스턴스 렌더 겹 수 | `HARU/Glass Rest` 는 **6겹**(blur 1 + drop 3 + inner 2)인데 `163:1618`·`163:1620` 인스턴스가 돌려준 `drop-shadow-[...]` 는 **2겹**이다. `0 28px 56px` 는 **렌더되지 않는다** → 기존 **`AD-3` 허용 차이**와 같은 패턴 |
| ②-검산 렌더 바운드 역산 | Record 코어의 `inset[-14.81% _-25.93% _-37.04% _-25.93%]` × 108 = 좌우 **28** · 위 **16** · 아래 **40** → `0 12 28` **1겹** 확정. 3겹이었다면 좌우 56 · 아래 84 여야 한다 |
| ③ 이름이 비슷한 토큰 | `--grays/gray-2`(Figma 변수) ↔ 저장소 `--haru-ink-300` `#b3c0bf` 를 **섞지 않았다**. 둘은 Δ가 크고(ink 는 녹색조, gray-2 는 중성 보라조) 역할도 다르다 — §15.10 `S4F-17` |
| ④ 무엇을 어떻게 쟀는가 | 모든 수치에 도구명을 적었다. `[픽셀]` 은 **렌더 육안 확인 2건**(TopBar 겹침 · Discard 회색)에만 쓰고 **수치 근거로 쓰지 않았다** |

---

### 15.8 ⭐ `C13` 재평가 — 이번 갱신으로 무엇이 해소됐는가

| # | 항목 | 2026-10-11 | **2026-10-13 판정** | 근거 |
|---|---|---|---|---|
| **`C13-1`** | 상태별 세션 화면 (ready/recording/paused 분리) | **없음** | ⚠️ **부분 해소.** ⓐ 해소: **하단 버튼의 구성·기하·스타일이 확정**됐고(`285:1445`) ⓑ 해소: **`Pause` 변형이 어느 자리에 오는지**가 y 일치로 드러났다(§15.5) ⓒ **미해소**: 여전히 **프레임이 1개**다 — ready/recording/paused **각각의 완성된 화면**은 없고, 어느 상태에 무엇이 보이는지(버블·경과 시간·버튼 활성)가 **Figma 에 그려져 있지 않다** | `[실측·meta: 섹션 자식 4개 — 세션 프레임은 `28:51` 하나]` |
| **`C13-2`** | "Done Reading" 버튼 | 없음 | **그대로 없음.** 섹션 전수 텍스트에 `Done` 0건 (`Discard`·`Submit`·`Resume`·`Tap to recording` 뿐) | `[실측·ctx 전수]` |
| **`C13-3`** | 녹음 경과 시간 표시 | 없음 | **그대로 없음.** `Pause` 변형 자식 4개에 텍스트 노드 0개 | `[실측·meta]` |
| **`C13-4`** | Prompt Drawer 열기 트리거 | 없음 | **그대로 없음.** `28:51` 자식 6개에 트리거 버튼 없음 | `[실측·meta]` |
| **`C13-14`** | Record Control `paused`/`disabled`/permission-denied 변형 | 없음 | **그대로 없음.** 세트 변형은 **여전히 2개**(`Record`·`Pause`) | `[실측·ctx: `property1?: "Pause" \| "Record"`]` |
| **`C13-15`** | `78:353` 배치 여부 | 배치 확인 불가 | ⚠️ **미해소, 근거는 강화.** §15.6 |
| **`C13-16`** | `Discard`/`Submit` 의 소속 화면 | 배치 없음 | ✅ ⭐ **완전 해소.** 둘 다 `28:51` → `285:1445` 의 **자식**이다. 소속·기하·스타일·상대 위치가 전부 확정됐다 | `[실측·meta]` |
| **신규** | `Discard` **disabled 시각** | — | ⛔ **없다.** `Accent/Secondary` 에 Disabled 짝이 없다 (§15.4) → **신규 C-13 대상 `C13-17`** | `[실측·meta: 세트 9종 전수]` |
| **신규** | `Submit` **disabled 시각** | — | ✅ **있다.** `17:18` `Accent/Disabled` = 면·라벨 그대로 + **`opacity: .5`** (§15.4) | `[실측·ctx]` |

---

### 15.9 ⛔ `139:2803` 버블 — 사용자 결정 `D4-6` 과의 충돌 (판단하지 않고 올린다)

**사실** `[실측·meta 2026-10-13]`:
- `139:2803` `Bubble`(= `88:838` `Type=Type3`, **`Try this prompt !` + Prompt pill 5개**)이 **`28:51` 안 (34, 336) 329×258 로 그대로 배치돼 있다.**
- 이번 갱신에서 **제거되지도, 교체되지도 않았다.** 섹션 렌더(`285:1126`)에도 **보인다** `[픽셀]`.

**충돌 지점**:

| | 내용 | 출처 |
|---|---|---|
| **① Figma (2026-10-13)** | `139:2803` `Type3` 버블 — 329×258 @ y336, **Prompt pill 5개 자동 표시** | `[실측·meta + ctx]` |
| **② 사용자 결정 `D4-6`** | *"Prompt 를 캐릭터 버블에 표시하지 않는다. 준비 화면 버블 = `88:757` 인사 버블. `139:2803` 의 Prompt pill 5개 자동 표시는 **미채택**"* — 단, Plan 자체가 **"Orchestrator 해석이며 사용자 재확인 대상(`N4-24`)"** 으로 표시해 두었다 | `[직독: docs/plans/stage-4-plan.md:40]` |
| **③ PRD §7.5** | *"세션 중 자동 제시는 하지 않는다"* · *"캐릭터 버블은 세션 시작·종료 2가지로 제한"* | `[문서 인용]` |

**어느 쪽을 택하면 무엇이 달라지는가** `[계산]`:

| | ⓐ Figma 를 따른다 (`139:2803` 유지) | ⓑ `D4-6` 을 따른다 (`88:757` 교체) |
|---|---|---|
| 버블 크기 | **329 × 258** @ (34, 336) | **297 × 130** @ y336 (가로 가운데 48) |
| 버블 bottom | **594** | **466** |
| Record Control(y621) 과의 간격 | **27** — Figma 가 그린 그대로 | **155** — 빈 자리가 생긴다 |
| 세로 재배치 필요 | **없음** | **있음** — ⓑ-1 간격 155 를 그대로 둔다 / ⓑ-2 Record Control 을 y**493** 으로 올린다 / ⓑ-3 버블을 y**464** 로 내린다. **셋 다 Figma 에 없는 배치다** |
| 내용 | Prompt pill **5개**(전부 같은 placeholder, `P.6` 배지) | 인사 문구 2줄 (`Ready for today's story with Emma?` + `Tap record and I'll quietly keep your storytime.`) |
| Prompt 노출 경로 | 버블 **+** Drawer(`88:960`) **이중** | Drawer **단독** (FR-11 "모아보기") |
| PRD §7.5 | **어긋난다** | 일치한다 |
| CLAUDE.md 최우선 규칙 | **규칙 1·3 을 지킨다**(Figma 대로, 빼지 않는다) | **규칙 3 위반**(Figma 에 있는 것을 뺀다) → 허용 차이 등록 + 사용자 승인 필요 |
| 컴포넌트 영향 | `SpeechBubble` + `PromptPill ×n` + 버블 높이 가변 정책(`S4F-01`) 필요 | `SpeechBubble` 2줄 — 단순 |

> ⛔ **design-agent 는 선택하지 않는다.** `D4-6` 은 Plan 이 스스로 *"Orchestrator 해석 · 사용자 재확인 대상"* 으로 적어 둔 결정이고, **이번 Figma 갱신은 그 해석과 반대 방향의 신호**다(사용자가 섹션을 새로 그으면서도 `139:2803` 을 **그대로 두었다**). → **`D4-6` 재확인이 필요하다** (`N4-24` 를 **차단 등급으로 격상**).

---

### 15.10 신규 미결 (`S4F-17` · `S4F-18`) + 갱신된 기존 항목

| ID | 항목 | 실측 사실 | 결정 필요 내용 |
|---|---|---|---|
| ⭐ **`S4F-17`** | **흰 라벨 on `#aeaeb2` 대비** | **2.211:1** `[계산: WCAG 2.x 상대휘도 — `L(#aeaeb2)=0.4027`, `L(#fff)=1.0`, (1.05)/(0.4527)]` | **`D-01` 범위 밖이다** `[직독: docs/decisions/stage-0-approvals.md:83 — "주요 버튼·선택 칩 등 **`--color-action-primary-bg` 위** 흰 라벨에 한정"]`. `#aeaeb2` 는 `--color-action-primary-bg`(= teal `#85bfb6`)가 **아니고**, `Discard` 는 **주요 버튼이 아니라 보조·파괴적** 동작이다. → Design Spec §12 에 대안 제시, **선택은 사용자** |
| ⭐ **`S4F-18`** | **`140:2870` `Resume` 의 처분** | 섹션 밖 절대 (2441,1200) 으로 이동, 라벨 `Resume` 유지 `[실측·meta + ctx]` | 폐기인가 보류인가. `D4-5`(*"`paused` → `Resume`"*)의 **근거 노드가 화면에서 빠졌다** → `D4-5` 재검토 필요 |
| ⭐ **`C13-17`** | **`Discard` 의 disabled 시각** | `Accent/Secondary` 에 Disabled 짝 **없음** `[실측·meta]` | 사용자 지시는 *"ready 에서 비활성 → recording 에서 활성"* 이다. `Submit` 은 `17:18` 이 있고 `Discard` 는 **없다** → ⓐ 디자이너 Figma 요청 ⓑ `opacity .5` 규칙을 `Secondary` 에도 적용(= `17:18` 과 같은 방식) 중 **사용자 결정** |
| **`S4F-11`** (갱신) | 하단 바 가로 중심 어긋남 | **+4 → +10** 으로 커졌다 (좌 67 / 우 47, 가운데는 57) `[계산]` | 가운데 정렬 보정 여부 — **미해소** |
| **`S4F-16`** (갱신) | 버튼 규격이 기존 선례와 다르다 | **281×45 → 135×45 ×2 + gap 9 = 279×45**. 기존 주 CTA 선례는 **높이 56 · 폭 100%**(`P-15` 확정) `[문서 인용]` | 세션 전용 규격을 쓸지 — **미해소, 폭이 더 벌어졌다** |
| ~~`S4F-10`~~ | `Discard`/`Submit` 시각 미구분 | ✅ **해소** — `Secondary` 신설 | — |
