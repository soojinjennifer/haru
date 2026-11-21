# Stage 8 — Mock 데모 웹 프리뷰 배포 절차서 (사용자 수행 `S8-I-U`)

Status: **READY FOR USER — rev 2 (Workers + GitHub)** (2026-11-21, development-agent `S8-I` · H8-13) · 근거: Plan `docs/plans/stage-8-plan.md` §5.6 · §12 `S8-I`/`S8-I-U` · 결정 `D8-1` (`N8-11` ⓑ Cloudflare + Cloudflare Access · `N8-12` ⓑ · `N8-13` ⓐ) · 사용자 지시 2026-11-21 *"GitHub 를 써서 배포해서 다른 사람들이 git 과 이 주소에서 확인할 수 있게 하고 싶다"*

> **rev 2 변경**: 배포 방식을 *Pages Direct Upload*(폴더 끌어다 놓기) → **Workers + GitHub 연결(Workers Builds)** 로 바꿨다. Cloudflare 새 대시보드의 *Create an app* 화면이 이 방식이다. 저장소 루트의 `wrangler.jsonc`(정적 자산만 — Worker 스크립트 없음)가 배포 설정이다. 이전 Pages 절차는 **부록 A (대체됨)** 에 남겼다.

이 문서는 **사용자가 직접** Cloudflare 계정을 만들고, GitHub 저장소를 연결하고, 접근을 제한하는 절차다.
Agent 는 계정 생성 · 로그인 · 배포 · GitHub 연결을 하지 않는다 (`D8-1`).

> ⛔ **AC-8-69(아래 §6.1) 확인 전에는 URL 을 누구에게도 공유하지 않는다** (`R8-12`).
> `*.workers.dev` 주소와 Preview 주소는 **기본이 공개**다 ("Preview URLs are public by default"). *Create an app* 화면에서 **Protect with Cloudflare Access = All traffic** 을 반드시 켠다 (§3.3).

메뉴 이름은 2026-11-21 Cloudflare 공식 문서 기준이다. 대시보드 문구가 바뀌었으면 같은 뜻의 메뉴를 고른다.

| 주제 | 공식 문서 (2026-11-21 확인) |
|---|---|
| 정적 자산 전용 Worker · `not_found_handling` | https://developers.cloudflare.com/workers/static-assets/ |
| `wrangler.jsonc` 필드 (`main` 생략 가능 · `assets` · `workers_dev` · `preview_urls`) | https://developers.cloudflare.com/workers/wrangler/configuration/ |
| Workers Builds 설정 (Build / Deploy / Preview command · Root directory · 빌드 변수) | https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ |
| Workers Builds 빌드 이미지 (Node · pnpm 버전 선택) | https://developers.cloudflare.com/workers/ci-cd/builds/build-image/ |
| Workers Builds 개요 (Preview builds = production 이 아닌 브랜치) | https://developers.cloudflare.com/workers/ci-cd/builds/ |
| Worker 에 Cloudflare Access 걸기 (*Previews only* / *All traffic*) | https://developers.cloudflare.com/workers/configuration/cloudflare-access/ |
| Previews (`wrangler preview` · 공개 기본값 · URL 형식) | https://developers.cloudflare.com/workers/previews/ |
| Version URLs (`wrangler versions upload`) | https://developers.cloudflare.com/workers/configuration/previews/ |

---

## 0. 무엇을 배포하는가

| 항목 | 값 |
|---|---|
| 배포 설정 | 저장소 루트 `wrangler.jsonc` — Worker 이름 `haru` · `assets.directory = ./apps/web/dist-preview` · `not_found_handling = "single-page-application"` · `workers_dev = true` · `main` **없음**(정적 자산 전용, 서버 코드 0 — *"The `main` key is optional for assets-only Workers"*) |
| 산출물 | Cloudflare 빌드 서버가 GitHub 의 커밋으로 `pnpm build:preview` 를 돌려 만든 `apps/web/dist-preview/` (`index.html` · `assets/`) |
| 모드 | Mock 전용 (`vite build --mode preview` 가 `VITE_API_MODE=mock` 을 강제 — `http` 를 주면 빌드가 멈춘다) |
| 데이터 | 가상 fixture 만 (아이 이름 `Emma` · 이메일 `sam@example.com` 등 예약 도메인). 실제 아동 데이터 0 · Secret 0 |
| 상용 그림책 표지 | 없음 — 중립 단색 표지로 교체됨 (`N8-13` ⓐ) |
| dev 전용 UI | 없음 — UI gallery · Scenario Panel 은 산출물에 들어가지 않는다. 시나리오 전환은 `?scenario=` 쿼리만 (`N8-12` ⓑ) |
| sourcemap | 없음 (프리뷰에서만 끈다 — 로컬 · CI 빌드는 그대로) |
| SPA 처리 | `wrangler.jsonc` 의 `not_found_handling: "single-page-application"` — 모르는 경로에 `index.html` 을 200 으로 준다 (AC-8-68). `404.html` · `_redirects` 는 두지 않는다 (`assert:preview` ⑤) |
| 백엔드 | 없음. Worker 스크립트 · 바인딩 · 환경 변수 0. 앱 테스트 빌드 · Backend 배포도 하지 않는다 (AC-8-72) |
| 주소 | `https://haru.<계정 서브도메인>.workers.dev` (계정 서브도메인은 Cloudflare 가 계정마다 정한다) |

### 0.1 `R8-13` (검사한 것 = 배포한 것) 을 어떻게 지키는가

Pages Direct Upload 때는 *"로컬에서 검사한 폴더를 그대로 올린다"* 로 지켰다. Workers Builds 는 Cloudflare 가 **직접 빌드**하므로, **Build command 안에 검사를 넣는다**:

```
pnpm install --frozen-lockfile && pnpm build:preview && pnpm assert:preview
```

- `&&` 로 이어져 있어 `assert:preview` 가 종료 코드 1 이면 **Build 단계가 실패하고 Deploy command 는 실행되지 않는다** → 검사에 실패한 산출물은 배포되지 않는다.
- 검사 대상(`apps/web/dist-preview`)과 배포 대상(`wrangler.jsonc` 의 `assets.directory`)이 **같은 빌드 안의 같은 폴더**다.
- 검사 항목은 아래 §1 표와 같다 (로컬에서 미리 돌려 볼 수 있다).

---

## 1. (선택) 로컬에서 미리 확인 — Mac 터미널

GitHub 에 올리기 전에 같은 검사를 로컬에서 돌려 볼 수 있다. Cloudflare 빌드는 이것과 **같은 명령**을 돌린다.

```sh
cd ~/dev/haru
pnpm install --frozen-lockfile
pnpm build:preview             # → apps/web/dist-preview/
pnpm assert:preview            # 반드시 "통과" + 종료 코드 0
```

`pnpm assert:preview` 가 검사하는 것 (하나라도 어긋나면 종료 코드 1 — **Cloudflare 빌드도 같은 이유로 실패하고 배포되지 않는다**):

| # | 검사 |
|---|---|
| ⓪ | Mock 모드 표식이 **있다** (http 빌드를 잘못 배포하는 사고 방지) |
| ① | `.map` 파일 · `sourceMappingURL` 주석 0 |
| ② | dev gallery · Scenario Panel · dev CSS · e2e 요청 로그 표식 0 |
| ③ | Secret 패턴 0 (service role · 개인 키 · AWS/Google/OpenAI/Stripe/GitHub/Slack 키 · JWT) |
| ④ | 빌드 환경의 `VITE_*` 이름과 값을 **출력**한다 — 이름이 KEY/SECRET/TOKEN 류면 실패. 정상 출력은 *"없음"* (Cloudflare 빌드 로그에서도 이 줄을 볼 수 있다) |
| ⑤ | 최상위 `404.html` · `_redirects` 0 (SPA 처리는 `wrangler.jsonc` 가 맡는다) |
| ⑥ | 예약 도메인(`example.com` 등) 밖의 이메일 주소 0 · 상용 표지 에셋 0 |

---

## 2. 준비 — Cloudflare 계정 · GitHub

1. https://dash.cloudflare.com/sign-up 에서 계정을 만든다 (이메일 인증 포함).
2. 2단계 인증(2FA)을 켠다 — **권장** (Worker · Access 설정을 바꿀 수 있는 계정이다).
3. 이 Cloudflare 계정에 다른 사람을 초대하지 않는다 (볼 사람은 Access 허용 목록으로만 정한다 — §4).
4. 배포할 변경이 GitHub `main` 에 **push 되어 있는지** 확인한다 (`wrangler.jsonc` 포함). Cloudflare 는 GitHub 에 있는 커밋만 빌드한다 — 로컬에만 있는 변경은 배포되지 않는다.

---

## 3. Worker 만들기 — *Create an app* (GitHub 연결)

대시보드 → **Workers & Pages** → **Create** (*Create an app*) → **Import a repository** / **Connect GitHub** → GitHub 승인 창에서 Cloudflare GitHub App 이 **`soojinjennifer/haru` 저장소 하나만** 읽도록 고른다 (*Only select repositories* — 모든 저장소 권한을 주지 않는다).

### 3.1 각 칸에 넣을 값

| 칸 | 값 | 비고 |
|---|---|---|
| **Project name** | `haru` | `wrangler.jsonc` 의 `"name": "haru"` 와 **같아야** 한다. 다르면 빌드가 실패하거나 Cloudflare 가 이름을 바꾸는 PR 을 제안한다 — 그 PR 은 받지 말고 이 칸을 `haru` 로 맞춘다 |
| **Production branch** (보이면) | `main` | |
| **Root directory** (보이면, *Advanced*) | 비워 둔다 (= 저장소 루트 `/`) | `wrangler.jsonc` · `pnpm-workspace.yaml` · `.nvmrc` 가 루트에 있다 |
| **Build command** | `pnpm install --frozen-lockfile && pnpm build:preview && pnpm assert:preview` | 검사 실패 시 배포 차단 (§0.1, `R8-13`) |
| **Deploy command** | `npx wrangler deploy` (기본값 그대로) | `wrangler.jsonc` 를 읽어 `apps/web/dist-preview` 를 production 에 올린다 |
| **Enable Preview builds** | **켜도 된다** (끄면 `main` 만 배포 — 더 단순하다) | 켜면 `main` 이 아닌 브랜치 push 마다 아래 Preview command 가 돈다 |
| **Preview command** | `npx wrangler versions upload` | production 으로 승격하지 않는 **Version** 을 만든다 → Version URL `<버전 접두사>-haru.<서브도메인>.workers.dev`. 기본값 `npx wrangler preview`(Worker Previews) 를 쓰지 않는 이유는 §3.2 |
| **Protect with Cloudflare Access** | **켠다** | |
| ↳ **Scope** | **All traffic** | ⚠ *Previews only* 를 고르면 `haru.<서브도메인>.workers.dev` 본 주소가 **공개**로 남는다 |
| ↳ **Authentication policy** | 아래 §4 | **Everyone 금지** |
| **Build variables** (환경 변수) | **넣지 않는다** | Node 는 `.nvmrc`(24.21.0), pnpm 은 `package.json` `packageManager`(pnpm@12.4.2) 로 자동 선택된다 (§3.3). `VITE_*` · Secret 을 넣지 않는다 |

### 3.2 Preview command 를 `wrangler versions upload` 로 두는 이유

- `npx wrangler preview`(대시보드 기본값)는 **Worker Previews** 를 만든다. 문서상 Previews 는 *"don't inherit production settings"* — `wrangler.jsonc` 의 `previews` 블록을 따로 요구하고, **정적 자산 전용 Worker 에서 동작하는지 공식 문서에 적혀 있지 않다** (2026-11-21 확인). 실패하면 브랜치 빌드가 계속 빨갛게 남는다.
- `npx wrangler versions upload` 는 **같은 `wrangler.jsonc`** 로 버전만 올리고 production 에 반영하지 않는다 (Version URL). 문서화된 동작이다.
- 어느 쪽이든 Preview 주소는 **기본 공개**다 → Scope = **All traffic** 이 필수다. Worker 단위 Access 는 *"every domain associated with the Worker, including its routes, Custom Domains, `workers.dev` hostname, and previews"* 를 보호한다. Version URL 이 여기에 포함되는지는 문서 문구로 확정되지 않아 **§6.1 #2 로 직접 확인**한다.
- Preview builds 를 끄면 이 항목 전체가 사라진다 (Version URL 0). 다른 사람에게 `main` 주소 하나만 보여 줄 거라면 끄는 편이 단순하다.

### 3.3 빌드 환경 (공식 문서 기준 — 실제 빌드 로그로 확인)

| 도구 | 선택 방식 (build-image 문서) | 이 저장소 |
|---|---|---|
| Node | `NODE_VERSION` 빌드 변수 또는 루트 `.nvmrc` / `.node-version` (기본 24.22.1) | 루트 `.nvmrc` = `24.21.0` → 24.21.0. (`engines.node` `>=24.21.0 <25` 라 기본값 24.22.1 이 쓰여도 `preinstall` 가드를 통과한다) |
| pnpm | Corepack 으로 실행 — `package.json` `packageManager` 가 1순위 (기본 9.10.0) | `packageManager: pnpm@12.4.2` → pnpm 12.4.2. **`corepack enable` 을 Build command 에 넣지 않는다** (빌드 이미지가 Corepack 으로 처리한다) |
| 의존성 설치 | Workers Builds 가 Build command 전에 **자동 설치**한다 (`SKIP_DEPENDENCY_INSTALL` 로 끌 수 있음) | Build command 의 `pnpm install --frozen-lockfile` 은 중복이지만 **잠금 파일과 다르면 실패**시키는 안전장치로 남긴다 (빠르게 끝난다) |
| wrangler | Deploy / Preview command 의 `npx wrangler …` 가 받는다 | 저장소 의존성에 넣지 않았다 (스택 추가 없음). 로컬 검증은 4.166.0 |

첫 빌드 로그에서 **`Node.js 24.21.0`(또는 24.x) · `pnpm 12.4.2` · `[assert:preview] 통과`** 세 줄을 확인한다. pnpm 이 9.x 로 보이면 멈추고 Orchestrator 에 알린다 (그때 대안: 빌드 변수 `PNPM_VERSION=12.4.2`, 또는 Build command 앞에 `corepack enable &&`).

### 3.4 저장 · 첫 배포

1. **Deploy** (또는 *Save and Deploy*) 를 누른다. 첫 빌드가 `main` 의 최신 커밋으로 시작된다.
2. 빌드가 끝나면 주소 `https://haru.<서브도메인>.workers.dev` 가 보인다. **바로 공유하지 않는다** — §4 · §6.1 을 먼저 한다.
3. *Create an app* 화면에 Access 칸이 없었다면: Worker → **Access** 탭(또는 **Settings** → **Domains & Routes**) → **Protect this Worker behind Access** → **All traffic** → **Apply Access**.

---

## 4. 접근 제한 — Cloudflare Access (Scope = All traffic)

### 4.1 Zero Trust 처음 설정 (한 번만)

- 처음 Access 를 쓰면 대시보드가 **Zero Trust 조직(team name) 만들기**와 **플랜 선택**을 묻는다. **Free** 플랜을 고른다.
  - Free 플랜 인원 상한은 공식 가격 페이지에서 **확인하지 못했다** — 이 화면에서 상한을 확인하고, 허용할 이메일 수가 그 안인지 본다.
  - 결제 수단 입력을 요구하면 Free 플랜(₩0 / $0)인지 확인한 뒤 진행한다.
- 로그인 방식(Login methods)은 기본 **One-time PIN**(이메일로 받는 6자리 코드)이면 충분하다.

### 4.2 Authentication policy — Allow + Emails

*Create an app* 의 Authentication policy 칸(또는 Worker → Access 탭)이 보여 주는 빠른 선택지는 문서 기준 **Cloudflare account**(이 계정 구성원만) · **Email domain**(도메인 전체) 이다.

1. 처음에는 **Cloudflare account** 를 고른다 — 이 시점에는 사용자 본인만 들어갈 수 있다 (가장 좁다).
2. 다른 사람을 허용하려면 **Zero Trust** → **Access** (*Access controls*) → **Applications** → `haru` Worker 애플리케이션 → **Policies** 에서 정책을 추가 · 편집한다:
   - **Action = Allow**, **Include = Emails**, 볼 사람의 이메일을 한 줄씩.
   - 예: 사용자 본인 · `S8-M` 점검용 iPhone 로그인 이메일 · (필요 시) 검토자.
3. **쓰지 않는다**: **Everyone** · **Bypass** · `gmail.com` 같은 공용 메일 도메인의 **Email domain / Emails ending in** (사실상 공개가 된다).
4. 이메일 목록은 저장소 · 문서에 적지 않는다 (개인정보). Orchestrator 에게는 "허용 인원 N명" 만 알려 준다.

### 4.3 다른 사람에게 보여 주기 (초대)

| 보여 줄 것 | 방법 | 결정 |
|---|---|---|
| **배포된 화면** (`haru.<서브도메인>.workers.dev`) | §4.2 의 Allow 정책 **Emails** 에 그 사람 이메일을 추가 → 주소를 전달 → 그 사람은 이메일로 받은 6자리 코드로 들어온다 | 사용자 |
| **코드** (GitHub 저장소) | 저장소는 **private** 이다. GitHub → `soojinjennifer/haru` → **Settings** → **Collaborators** → *Add people* 로 초대 (Read 권한이면 충분) | **사용자 판단** — Agent 는 초대하지 않는다. 저장소에는 원본 기획 · 결정 문서가 함께 있으니 공개 범위를 사용자가 정한다. 저장소를 public 으로 바꾸지 않는다 |

- Cloudflare **계정** 자체에 다른 사람을 초대하지 않는다 (Worker · Access 설정 권한이 생긴다).
- 사람을 뺄 때: Allow 정책에서 이메일 삭제 (이미 받은 세션은 세션 만료까지 남는다 — Access 애플리케이션의 *Session duration* 확인).

---

## 5. 시나리오 전환 (데모용)

- Scenario Panel 은 프리뷰에 **없다**. 전환은 주소 뒤 `?scenario=` 쿼리로만 한다 (`N8-12` ⓑ).
- 쿼리는 **앱을 처음 여는 주소**에 붙인다 (앱 안 이동 뒤에는 유지되지 않는다). 예:
  - `https://haru.<서브도메인>.workers.dev/auth/log-in?scenario=home:session-already-active` → 로그인 → Home 에 *"A storytime is still open — you can pick it back up."*
  - `…/auth/sign-up?scenario=me:consent-missing` → 가입 → 동의 화면
- Mock 로그인: 이메일 `sam@example.com` · 비밀번호 `sunny-evening-8` (가상 계정 — e2e 와 같은 값).
- 새로고침하면 Mock 상태(로그인 포함)는 처음으로 돌아간다 — Mock 서버는 브라우저 메모리에만 있다.

---

## 6. 확인 (사용자 — 결과를 Orchestrator 에 전달)

### 6.1 AC-8-69 접근 제한 — **본 주소 + Preview(Version) 주소 모두**

| # | 방법 | 기대 |
|---|---|---|
| 1 | 시크릿 창에서 `https://haru.<서브도메인>.workers.dev` | 앱이 아니라 **Cloudflare Access 로그인 화면** |
| 2 | (Preview builds 를 켰다면) `main` 이 아닌 브랜치를 하나 push → 빌드 완료 후 Worker → **Deployments** / *Versions* 에서 Version URL(`<접두사>-haru.<서브도메인>.workers.dev`) 을 찾아 시크릿 창에서 연다 | 같은 Access 로그인 화면. (Preview builds 를 껐다면 "해당 없음" 으로 기록) |
| 3 | 1·2 에서 **허용 목록에 없는** 이메일로 코드 요청 | 코드가 오지 않거나 접근 거부 |
| 4 | 1·2 에서 **허용 이메일**로 코드 입력 | 앱이 열린다 (Welcome 화면) |
| 5 | Worker → **Access** 탭(또는 Zero Trust → Access → Applications) | Scope 가 **All traffic** 이고 정책에 **Everyone · Bypass 가 없다** |

1~3 중 하나라도 앱이 바로 보이면 **멈추고** URL 을 공유하지 않는다 → §4 의 Scope · 정책을 다시 확인한다. #2 만 열리면 Version URL 이 Worker 단위 Access 밖이라는 뜻이다 — Preview builds 를 끄고(또는 `wrangler.jsonc` 에 `"preview_urls": false` 추가 — Orchestrator 경유) Orchestrator 에 알린다.

### 6.2 AC-8-68 SPA 깊은 경로

| # | 방법 | 기대 |
|---|---|---|
| 1 | Access 통과 후 주소창에 `/progress` 를 직접 넣고 새로고침 | Cloudflare 404 가 아니라 **앱이 그려진다** (로그아웃 상태라 Welcome 으로 이동하는 것이 정상) |
| 2 | `/settings/data` 로 같은 확인 | 같음 |
| 3 | (선택) 로그인 후 앱 안에서 Progress · 설정 → 데이터 관리로 이동한 뒤 새로고침 | Cloudflare 404 가 아니다 (Mock 상태가 초기화되어 Welcome 으로 가는 것은 정상 — §5) |

### 6.3 AC-8-70 핵심 흐름 · AC-8-71 시나리오

- 로그인 → Home → 세션(마이크 허용) → Submit → 회고 → Progress → 리포트 상세 → 설정 → 데이터 관리 → 녹음 삭제 (Plan §12.3 F, 약 15분)
- 화면 어디에도 *Mock scenario* 패널이 없다 · §5 의 쿼리 예시가 동작한다

### 6.4 Orchestrator 에 전달할 것

- 본 주소 · (켰다면) Version URL 1개
- 첫 빌드 로그의 Node · pnpm 버전 줄과 `[assert:preview] 통과` 줄 (§3.3)
- §6.1 표 1~5 결과 (각 OK / 아니면 무엇이 보였는지)
- §6.2 · §6.3 결과
- 허용 인원 수 (이메일 주소는 적지 않는다)

---

## 7. 다시 배포할 때

1. 변경을 `main` 에 push 한다 (Orchestrator 가 커밋 · push — 사용자 요청 시).
2. Workers Builds 가 자동으로 빌드 → `assert:preview` → 배포한다. 검사에 실패하면 **배포되지 않고** 이전 버전이 그대로 남는다 → 빌드 로그의 `[assert:preview] FAIL` 줄을 Orchestrator 에 전달한다.
3. Access 는 Worker 단위라 다시 설정할 필요가 없다. 그래도 시크릿 창으로 §6.1 #1 을 한 번 확인한다.

---

## 8. 하지 않는 것 / 바꿀 때 주의

| 항목 | 이유 |
|---|---|
| Worker 스크립트(`main`) · `functions/` · 바인딩(KV · D1 · R2 …) 추가 | 서버 코드 = Backend 범위 밖. `wrangler.jsonc` 는 정적 자산 전용으로 둔다 |
| `_redirects` · `_headers` · `404.html` 추가 | SPA 처리는 `wrangler.jsonc` 가 맡는다 (`assert:preview` ⑤ 가 `_redirects` · `404.html` 을 막는다) |
| Build command 에서 `&& pnpm assert:preview` 를 빼기 | 검사하지 않은 산출물이 배포된다 (`R8-13` 위반) |
| Build variables · `VITE_*` 추가 | 프리뷰에는 필요 없다. 어떤 Secret 도 `VITE_*` · 빌드 변수에 두지 않는다 |
| 계정 ID · API 토큰을 `wrangler.jsonc` · 저장소에 적기 | Workers Builds 는 대시보드에서 계정이 정해진다 — 저장소에 계정 정보가 필요 없다 |
| 사용자 지정 도메인 | 범위 밖. 붙여도 Worker 단위 Access(All traffic)가 보호하지만 §6.1 을 그 도메인으로 다시 확인해야 한다 |
| Access Scope = *Previews only* · Everyone 정책 | 본 주소가 공개된다 |
| 앱 스토어 테스트 빌드 · Backend 배포 | Stage 8 범위 밖 (C-18 · AC-8-72) |

## 9. 문제 해결

| 증상 | 확인 |
|---|---|
| 빌드 실패 — `[assert:preview] FAIL` | 정상 동작(배포 차단)이다. FAIL 줄을 Orchestrator 에 전달한다 |
| 빌드 실패 — `preinstall` 의 Node 버전 오류 | 로그의 Node 버전 확인. 24.x 가 아니면 빌드 변수 `NODE_VERSION=24.21.0` 추가 (§3.3) |
| 빌드 실패 — pnpm 버전 · `ERR_PNPM_…` lockfile 오류 | 로그의 pnpm 버전이 12.4.2 인지 확인 (§3.3). 잠금 파일 불일치면 로컬 `pnpm install` 후 `pnpm-lock.yaml` 을 커밋해야 한다 — Orchestrator 에 알린다 |
| 빌드 실패 — Worker 이름 불일치 | Project name 과 `wrangler.jsonc` `"name"` 이 둘 다 `haru` 인지 확인 |
| 깊은 경로에서 Cloudflare 404 | 배포된 버전이 `wrangler.jsonc` 의 `not_found_handling` 을 담았는지 — 빌드 로그의 커밋이 이 파일을 포함한 커밋인지 확인 |
| 앱이 *"Something went wrong"* | http 빌드가 배포됐을 수 있다 — Build command 가 `build:preview` 인지 확인 (`assert:preview` ⓪ 이 막는다) |
| Access 화면 없이 앱이 보임 | Scope 가 *Previews only* 이거나 Access 미적용 — **공유 중단**, §3.4-3 · §4 다시 |
| 코드 메일이 안 옴 | 허용 목록 철자 · 스팸함 확인 |

---

## 부록 A — (대체됨) Pages Direct Upload 절차 (rev 1)

> **이 부록은 rev 2 에서 대체되었다.** 현재 절차는 위 §2~§7 (Workers + GitHub) 이다. GitHub 연결 없이 로컬 폴더를 직접 올려야 할 때만 참고한다. 부록 안의 `§` 번호는 rev 1 번호다 (§1 = 로컬 빌드 · 검사, §4.3 = 아래 A.2.3, §6.1 = 위 §6.1 과 같은 확인을 `*.pages.dev` 주소로, §7 = 아래 A.3).
> rev 1 출처: https://developers.cloudflare.com/pages/get-started/direct-upload/ · https://developers.cloudflare.com/pages/configuration/preview-deployments/ · https://developers.cloudflare.com/pages/platform/known-issues/
> rev 1 의 SPA 처리: Pages 는 최상위 `404.html` 이 없으면 SPA 로 간주한다 (`wrangler.jsonc` 는 Pages Direct Upload 에 쓰이지 않는다).

### A.1 Pages 프로젝트 만들기 + 첫 배포 (Direct Upload)

1. 대시보드 → **Workers & Pages** → **Create application** → **Pages** 탭 → **Upload assets**(*Drag and drop your files*) 를 고른다.
   - ⚠ **Git 저장소 연결(Connect to Git)을 고르지 않는다.** Git 연동 프로젝트는 나중에 Direct Upload 로 바꿀 수 없고, Cloudflare 가 **다른 산출물**을 다시 빌드한다 (`R8-13`).
2. **Project name** 을 정한다 — 예: `haru-preview`. 이 이름이 주소가 된다: `https://haru-preview.pages.dev`. 추측하기 어려운 이름이 조금 더 낫지만 **보호 수단은 Access 다** (이름이 비밀 역할을 하지 않는다).
3. **Create project** → 업로드 창에 `apps/web/dist-preview` **폴더**를 끌어다 놓는다 (Finder 에서 폴더째). 파일 약 20개 — 상한(1,000개 · 파일당 25 MiB) 안이다.
4. 업로드가 끝나면 **Deploy site** (또는 *Save and Deploy*).
5. 배포 직후 주소가 보인다. **아직 열어 보거나 공유하지 않는다** — 다음 §4 를 먼저 한다 (그 사이 본 도메인은 공개 상태다. §4 를 바로 이어서 한다).

> 첫 배포가 production 이다. 이후 재배포는 §7.

---

### A.2 접근 제한 (Cloudflare Access) — preview + `*.pages.dev` 둘 다

#### A.2.1 Zero Trust 처음 설정 (한 번만)

- 처음 Access 를 쓰면 대시보드가 **Zero Trust 조직(team name) 만들기**와 **플랜 선택**을 묻는다. **Free** 플랜을 고른다.
  - Free 플랜 인원 상한은 Plan 작성 때 공식 가격 페이지에서 **확인하지 못했다** — 이 화면에서 상한을 확인하고, 허용할 이메일 수가 그 안인지 본다 (Plan §0 메모).
  - 결제 수단 입력을 요구하면 Free 플랜(₩0 / $0)인지 확인한 뒤 진행한다.
- 로그인 방식(Login methods)은 기본 **One-time PIN**(이메일로 받는 6자리 코드)이면 충분하다. 다른 로그인 방식을 추가하지 않는다.

#### A.2.2 preview 배포 보호 (*Enable access policy*)

1. **Workers & Pages** → 프로젝트(`haru-preview`) → **Settings** → **General** → **Enable access policy** 를 누른다.
2. 이것만으로는 **preview 배포만** 보호된다 (`<hash>.haru-preview.pages.dev` · `<branch>.haru-preview.pages.dev`). 본 도메인 `haru-preview.pages.dev` 는 아직 **공개**다 → 4.3 으로.

#### A.2.3 본 도메인 `*.pages.dev` 보호 (Known issues 절차 — 빠뜨리지 않는다)

1. 같은 화면 **Settings** → **Enable access policy** 옆 **Manage** 를 누른다 (preview 용으로 만들어진 Access 정책).
2. **Access** → **Applications** 에서 이 프로젝트의 애플리케이션을 고른다 → **Configure**.
3. **Public hostname** 의 **Subdomain** 칸에서 **와일드카드 `*` 를 지우고** **Save**.
4. Pages 프로젝트 → **Settings** → **General** 로 돌아가 **Enable access policy** 를 **다시** 누른다.
5. Access 애플리케이션이 **두 개** 있는지 확인한다 — 하나는 `haru-preview.pages.dev`(본 도메인), 하나는 `*.haru-preview.pages.dev`(preview).

#### A.2.4 허용 이메일 목록 (두 애플리케이션 모두)

1. Zero Trust → **Access** (*Access controls*) → **Applications** → 4.3 의 애플리케이션 **각각**의 **Policies** 를 연다.
2. **Action = Allow** 정책의 **Include** 규칙을 **Emails** 로 두고, 볼 사람의 이메일을 한 줄씩 넣는다.
   - 예: 사용자 본인 이메일 · `S8-M` 점검에 쓸 iPhone 에서 로그인할 이메일 · (필요 시) 검토자 이메일.
   - **Everyone** · **Emails ending in**(도메인 전체) · 공개 규칙(*Bypass*)을 쓰지 않는다.
3. 두 애플리케이션에 **같은 목록**을 넣었는지 확인한다. 한쪽만 넣으면 그쪽 URL 만 열린다.
4. 이메일 목록은 저장소 · 문서에 적지 않는다 (개인정보). Orchestrator 에게는 "허용 인원 N명" 만 알려 준다.

---
### A.3 다시 배포할 때

1. §1 을 처음부터 다시 실행 (`pnpm build:preview` → `pnpm assert:preview` 통과).
2. **Workers & Pages** → 프로젝트 → **Create a new deployment** (또는 *Deployments* → *Upload*).
3. 환경을 고른다 — **Production**(본 도메인에 반영) 또는 **Preview**(브랜치 이름 입력 → `<branch>.haru-preview.pages.dev`).
4. `apps/web/dist-preview` 폴더를 끌어다 놓고 배포.
5. Access 는 프로젝트 단위라 다시 설정할 필요가 없다. 그래도 시크릿 창으로 §6.1 #1 을 한 번 확인한다.

---
