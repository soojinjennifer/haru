# Stage 8 Visual Gap

Status: **REVIEW** · design-agent · 단위별로 절을 덧붙인다. 허용 차이 **등록은 사용자 승인 후** (CLAUDE.md 최우선 규칙 6).

---

## S8-A

Contracts + Mock 단위 (`docs/qa/stage-8-handoff.md` H8-1). 검토일 2026-11-20. Playwright **미실행** (다른 lane 점유 가능 — 지시). 근거 Spec = `docs/design/stage-8-design-spec.md` (`APPROVED`, `D8-1`) §13 `S8-A` 행 = *"UI 영향 없음 확인 · 기록만"*.

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[git]` | `git diff --name-only` · `git status --short --untracked-files=all` | `packages/contracts` · `apps/web/src/{mocks,shared,entities,dev}` · `e2e/` |
| `[diff]` | 변경 파일 diff 직독 | `mocks/fixtures/{me,onboarding}.ts` · `shared/copy/error-copy.ts` · `mocks/sessions/MockSessionApi.ts` |
| `[grep]` | 저장소 grep | `Nova` · `caregiver.email`/`.email` (features · pages · app) · `prefilled-child-info`/`draft-resume` (e2e) · `errorCopyForCode` 소비처 · `recordingsCount` |
| `[직독]` | `e2e/visual.spec.ts` · `packages/ui/src/feedback/InlineAlert.tsx` props | baseline 이 어떤 데이터로 그려지는가 · 표면이 title 을 요구하는가 |

Figma 조회 없음 — 이 단위에 대응 프레임이 없다 (Spec §0.2: Stage 8 대상 디자이너 프레임 0). baseline 비교는 handoff H8-1.4 기록(`890 passed` · `e2e/__screenshots__` 변경 0)을 **참고**로만 인용한다 — 구현자 기록은 증거가 아니며(`qa.md` §1), 이 문서의 판정 근거는 아래 `[git][diff][grep][직독]` 이다.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | Blocking | 사용자 결정 |
|---|---|---|---|---|---|
| `VG8-A-01` | 화면 · route · 컴포넌트 · 토큰 · 아이콘 변경 | **UI 영향 없음 확인** | — | 아니오 | 불필요 |
| `VG8-A-02` | 사용자 노출 값 변경 3건 (§2) — 기존 baseline 노출 0 | **UI 영향 없음 확인** | — | 아니오 | 불필요 |
| `VG8-A-03` | `H8-1-N1` `ACCOUNT_DELETION_PENDING` 제목 | **Spec 개정으로 확정** — *Changes are paused* | — | `S8-B`~`D` 표면 연결 전 | 불필요 (선택 사항 1건 §3.1) |
| `VG8-A-04` | `H8-1-N2` `recordingsCount` 의미 | **Spec 개정으로 확정** — 삭제 가능한 녹음 수(`deleted`·`expired` 제외) | Medium (화면 문구 오해) | `S8-B` 착수 전 contracts 주석 · Mock · 문서 정정 | 불필요 |

### 2. UI 영향 확인 (`VG8-A-01` · `VG8-A-02`)

변경 파일 `[git]`: 코드 경로 수정 36 · 신규 19 (docs 제외). 전부 `packages/contracts/src/**` · `apps/web/src/{mocks,shared/api,shared/copy,entities/data-management,entities/session,dev}/**` · 테스트(`apps/web/__tests__` · `app/**/__tests__` 포함). **`features/` · `pages/` · `app/` 의 비테스트 파일 · `packages/ui` · `packages/design-tokens` · `e2e/` 변경 0.**

| # | 사용자 노출 가능 값 | 어디서 보이는가 | 기존 baseline 노출 | 판정 |
|---|---|---|---|---|
| ① | `ERROR_COPY.ACCOUNT_DELETION_PENDING` 1행 | 아직 어느 화면도 이 code 를 받지 않는다 — 쓰기 차단은 Mock `writeGuard` 가 `data-management:deletion-*` · `account:deletion-pending-write-blocked` key 에서만 낸다 `[diff]` | 0 (해당 key 를 쓰는 e2e 없음 `[grep]`) | 영향 없음 · 문구는 §3.1 |
| ② | 온보딩 서버 draft fixture 아이 이름 `Nova` → `MOCK_CHILD_FIRST_NAME`(`Emma`) | `onboarding:prefilled-child-info` · `draft-resume` | 0 — `s2-onboarding-childinfo{,-trial}` baseline 은 **기기 seed `seedChildDraft(page, 'Yuna', …)`** 로 그려진다 (`e2e/visual.spec.ts` 270~295 `[직독]`). 남은 `Nova` 는 e2e 가 **직접 입력**하는 값(`home.spec.ts:32` · `reflection-title-overflow.spec.ts:30`)과 Mock 단위 테스트 입력뿐이며 fixture 와 무관 `[grep]` | 영향 없음. 오히려 `OBS-5-7` 정합(완료 버블 · 회고 카드 · Me 와 같은 이름) |
| ③ | `Me.caregiver.email` = `sam@example.com` | 표시하는 화면 0 — `features`·`pages`·`app` 의 `.email` 은 전부 로그인·가입 **입력** 폼이다 `[grep]` | 0 | 영향 없음. 첫 노출은 `S8-D` 계정 화면 (Spec §2.6) |
| ④ | `sessions.list` 항목 + `recording` 필드 | 기존 소비처는 필드를 읽지 않는다. 필터는 `hasRecording` 지정 시에만 동작 `[diff]` | 0 | 영향 없음 |
| ⑤ | dev Scenario Panel 그룹 +2 | dev 전용 — Production 제외(`assert:no-mocks`) · baseline 에서 숨김(`R-BASELINE-1` ②) | 0 | 영향 없음 |

`R-BASELINE-1` 3-1 메모: baseline 이 `changed` 모드로 통과한 것은 "변경 없음" 의 근거가 아니다. 이 단위에서는 위 표처럼 **입력 데이터 경로**가 baseline 에 닿지 않음을 직접 확인했으므로 `--update-snapshots=all` 재검토는 필요 없다. `S8-B` 부터 새 baseline 이 생긴다.

### 3. NEEDS_DECISION 응답 (H8-1.6 N1 · N2)

#### 3.1 `VG8-A-03` — `H8-1-N1` `ACCOUNT_DELETION_PENDING` 제목

**결정: 제목 = *Changes are paused* (개발자 가안 확정) · 설명 = Spec §10.4 승인 원문 그대로 *Your data is being deleted, so changes are paused.***

근거:
1. **"설명만" 표면은 지정할 수 없다.** 쓰기 차단이 뜨는 표면(Spec §2.9 — 저장 = `InlineAlert`, 조회 실패 = `ErrorState`)은 `title` 이 **필수 prop** 이다 (`InlineAlert.tsx` `title: string` · `description?` `[직독]`). `errorCopyForCode()` 소비처(비테스트 16 파일) 대부분이 title + description 을 함께 그리고, description 만 쓰는 곳(`OnboardingWizard`)은 표면이 자체 제목을 가진다 `[grep]`. 제목 없는 표면을 만들면 Shared UI 변경 = 새 승인 대상이다.
2. **기존 `ERROR_COPY` 관용과 같다** — 제목 = 사용자가 겪는 **결과**, 설명 = 이유. 선례 *Upload paused* (`UPLOAD_TOKEN_EXPIRED`) · *Deletion already requested*.
3. **Copy 규칙 통과**: 영어 · 진단/판정/비교어 0 · 기한·수치 0 · 아이 이름 0 · 비난/경고 어조 0 (Spec §10.6 금칙어 표 대조).
4. 대안 비교: *Your data is being deleted* (설명과 원인 반복 + 제목이 결과를 말하지 않음) · *Saving is paused* (세션 시작 등 저장 외 쓰기를 포괄 못 함) · *One moment* (사유·지속성 불명, 곧 풀린다는 거짓 기대) → 기각.

표면 규칙 (Spec §2.9 · §10.4 에 반영):
- 2줄 표면(`InlineAlert` · `ErrorState`) = **title + description**.
- 표면이 자체 제목을 가진 경우(`OnboardingWizard` 처럼 `description` 만 쓰는 선례) = **description 만**.
- 새 UI 0 · Toast 로 띄우지 않는다 (기존 실패 표면만).

선택 사항 (비차단 · 사용자 판단 시에만): 2줄 표면에서 *paused* 가 제목·설명에 두 번 나온다. 없애려면 설명을 *Your data is being deleted.* 로 줄여야 하는데, 이는 **`Q8-14` 로 승인된 문구 변경**이므로 이 문서에서 하지 않는다. 현 상태로도 의미 손실·오해는 없다.

#### 3.2 `VG8-A-04` — `H8-1-N2` `recordingsCount` 의미

**결정: `recordingsCount` = 목록 행 중 `recording.uploadStatus ∈ { uploaded, pending, failed }` 인 행 수 = *Delete* 버튼이 있는 행 수. `deleted` · `expired` 행은 세지 않는다.** `success` fixture 기준 **8 → 6**.

근거 (화면이 이 값을 어떻게 쓰는가):
1. **subtitle 은 "보관 중인 녹음" 으로 읽힌다.** Spec §2.2 subtitle *{n} recording(s)* 는 바로 위 보관 정책 문장(*Storytime recordings are kept for {rawAudioDays} days…*) 아래에 있다. 이 맥락에서 이미 지워진 오디오를 세면 **보관 중인 아동 데이터를 부풀려 보여준다** — 개인정보 화면에서 잘못된 신호다.
2. **삭제 피드백이 사라진다.** 행 수 정의면 사용자가 녹음을 지우고 돌아와도 숫자가 그대로다(행은 `Deleted` 로 남음 — `Q8-07` ⓐ). 제외 정의면 지운 만큼 줄어든다.
3. **`expired` 행은 시간이 지날수록 누적**된다. 행 수 정의면 오디오는 줄어드는데 숫자는 계속 커진다.
4. `Q8-07` ⓐ(목록에 남김)는 "어디 갔는지 설명" 을 위한 **목록 표시 규칙**이지, 개수 정의가 아니다. 두 결정은 독립이다.

함께 바뀌는 Spec 규칙 (§2.2 반영):
- `recordingsCount = 0` 이면 subtitle *No recordings* (기존과 같음). 단 이동한 목록은 **빈 상태가 아닐 수 있다** — `deleted`·`expired` 행만 있으면 그 행들을 상태 문구와 함께 보여준다. 빈 상태(§2.3.3)는 **행 0** 일 때만이다.
- 행 삭제 성공 후 데이터 관리 요약을 다시 조회하면(`dataManagementKeys.summary()` 무효화) subtitle 이 줄어든다.

후속 (design-agent 는 해당 문서·코드를 고치지 않는다 — 보고):

| 대상 | 소유 | 할 일 |
|---|---|---|
| `packages/contracts/src/data-management/summary.ts` 주석 · `MockDataManagementApi` 요약 계산 · `success` 기대값(8 → 6) · 관련 단위 테스트 | development-agent | `S8-B` 착수 전 (또는 `S8-B` 첫 작업) 정정 |
| `docs/API_CONTRACTS.md` Rev 12.1 머리말 ④ · §3.13 · §5.4 fixture 행 "`recordingsCount` 와 목록 일치" | development-agent (구현 확정 반영 — `workflow.md` §5) | 정의 문장 교체 |
| `docs/plans/stage-8-plan.md` §8 `success` 행 *"`recordingsCount` = 목록 녹음 수와 일치"* | plan-agent | 문구 정합화 (범위 변경 0 — 같은 의도의 정의 명확화) |
| Backend Handoff (`P8-BIP-04` 계열) | `S8-J` | "삭제·만료 제외 보관 녹음 수" 로 기록 |

Contract **모양**(`recordingsCount: int ≥ 0`)은 바뀌지 않는다 — 값의 정의만 바뀐다.

### 4. 다음 단위로 넘길 것

- `S8-B`: §3.2 정의로 subtitle 숫자 검증(`success` = *6 recordings*, 행 1개 삭제 후 *5 recordings*) · `deleted`/`expired` 만 남은 경우 목록 ≠ 빈 상태.
- `S8-B`~`D`: 쓰기 차단 표면은 §3.1 표면 규칙.
- H8-1-N3 · N4 · N5 는 design-agent 범위 밖(QA · plan-agent) — 이 문서에서 다루지 않는다.

---

## S8-B

설정 확장 · 데이터 관리 · 세션 녹음 목록 (`docs/qa/stage-8-handoff.md` H8-2). 검토일 2026-11-20. Playwright **미실행** (S8-C 병행 — 지시). 근거 Spec = `stage-8-design-spec.md` §2.1~§2.4 · §2.9 · §8.1 · §10.3. 대응 디자이너 프레임 0 (Spec §0.2) → 비교 기준 = Spec + 재사용 근거 DRAFT `321:1537`(설정 목록) · `321:2203`(ConfirmDialog destructive).

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[png]` | 신규 baseline 22장 직독 (393 · 320 나란히 합성, scratchpad) + 흑색 잉크 열 스캔(`L < 170`, 6px 간격으로 단어 묶음)으로 텍스트 폭 실측 | `e2e/__screenshots__/darwin/settings-data.spec.ts/*` |
| `[diff]` | `git show HEAD:<png>` ↔ 작업 트리 PNG — 채널 최대 Δ > 3 인 픽셀의 행 범위 · 띠(5px 이상 끊기면 분리) · 영역별 maxΔ | `settings-child.spec.ts/s6-settings.png` · `visual.spec.ts/s3-dialog-scrim.png` |
| `[var]` | `get_variable_defs` — **선언값** | `321:1537` · `321:2203` |
| `[직독]` | 저장소 | `packages/ui/src/list/List.css` (meta-row) · `dialog/Dialog.css` · `features/recording-deletion/{copy.ts, model/recordingRowView.ts, ui/RecordingList.tsx}` · Library `meta=` 소비처 |

`[var]` 결과: `321:1537` = `text-primary #4a5f5c` · `text-secondary #7d9291` · `stroke #5e73702e` · `glass-fill-strong #ffffffe5` · `HARU/Shadow Rest`(5겹 정의 — 인스턴스는 drop 1겹, Spec §0.3 기록과 같음). `321:2203` = `glass-fill #ffffffbd` · `radius-pill 100` · `HARU/Glass Rest`(BACKGROUND_BLUR 24 포함). 렌더 픽셀로 색·그림자를 판정하지 않았다.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | 분류 |
|---|---|---|---|---|
| `VG8-B-01` | 기존 baseline 변경 2건 = ACCOUNT 2행 추가 영역만 (§2) | 원인 설명됨 · 미설명 클러스터 0 | — | **OK** |
| `VG8-B-02` | 설정 목록 `ACCOUNT` — 순서(이동 행 → Log out) · chevron 유무 · 행 피치 57(56 + divider 1) · `YOUR CHILD` 변경 0 | Spec §2.1 · `321:1537` recipe 일치 | — | **OK** |
| `VG8-B-03` | 데이터 관리 — 섹션 2 · 보관 문장 · subtitle *6 recordings*(`VG8-A-04`) · *Delete all data* 동작 행(chevron 0 · 빨강 0) · 처리 중 = 최상단 info `InlineAlert` + 행 비활성 | Spec §2.2 · §2.5 일치 | — | **OK** |
| `VG8-B-04` | 녹음 목록 — 범위 문장 · 5종 meta · *Storytime* · 제목 2줄(말줄임 0) · trailing glass sm *Delete* · `deleted`/`expired` 행 *Delete* 0 · *Show more* | Spec §2.3 · §2.3.1 일치 | — | **OK** |
| `VG8-B-05` | 상태 — Loading(Skeleton) · Error(`ErrorState` 화면 전체) · Empty(CTA 0 · 범위 문장 0) · 삭제 행 *Deleted* 제자리 · 실패 InlineAlert 목록 위 | Spec §2.3.2 · §2.3.3 · §2.9 일치 | — | **OK** |
| `VG8-B-06` | 확인 다이얼로그 ① — 제목 · 설명 · *Delete recording* destructive → *Keep* 순서 · 폭 393=321 / 320=272(`min(320, 100%)`) | Spec §2.4 · §10.3 원문 일치 | — | **OK** |
| `VG8-B-07` | `H8-2-N1` 행 삭제 실패 설명 문구 | **Spec 개정으로 확정** (§3.1) — 현 구현 문구와 다름 | Low | **FIX** |
| `VG8-B-08` | `H8-2-N2` 행 보조 줄 단어 단위 줄바꿈 (320 전 행 · 393 일부) | 실측 §3.2 — Spec §8.1 의도("meta 가 다음 줄로") 미충족, 기존 `ListRow` 로는 불가 | Medium | **USER_DECISION** (권고 ②) |
| `VG8-B-09` | `H8-2-N5` meta 타이포 = 소비자 `Text caption-1 secondary` | Spec §2.3.1 "`text-secondary` 계열" 충족. 단 handoff 의 "기존 사용처처럼" 은 사실과 다르다 — Library 소비처(`LibraryShelfSheet` · `LibraryShelves`)는 **문자열**을 넘겨 `ListRow__meta` 기본(`fg-tertiary`, `P-24`)을 쓴다. 녹음 목록은 카드 위 대비(`P-01`)를 위해 secondary 를 쓰는 것이 Spec 의도이므로 유지 | — | **OK** (기록) |
| `VG8-B-10` | `H8-2-N3` `/settings/account` 빈 본문 | `S8-D` 범위 — 이 단위 Visual Gap 대상 아님 확인. baseline 없음 `[png]` | — | **OK** |
| `VG8-B-11` | `H8-2-N4` *Delete all data* 미연결 | `S8-C` 범위 — 시각은 Spec §2.2 대로 표시 | — | **OK** |
| `VG8-B-12` | Dialog 배경 블러 부재 — `321:2203` DRAFT 는 `HARU/Glass Rest`(BACKGROUND_BLUR) 선언, `Dialog.css` 는 `surface-strong`(white 90%) 단색 · `backdrop-filter` 0 `[직독]`. 320 baseline 에서 다이얼로그 제목 뒤로 목록 글자가 비친다 | **S8-B 이전부터의 기존 차이**(Shared `Dialog` 변경 0) · DRAFT 는 design-agent 시각화이며 디자이너 근거 아님 | Low | **OK — `S8-G` 감사 이월** (이 단위 결정 불필요) |

### 2. 기존 baseline 변경 분해 (`R-BASELINE-1` ⑤) `[diff]`

| baseline | 크기 (HEAD = 신규) | 변경 띠 | 띠 밖 | 원인 |
|---|---|---|---|---|
| `s6-settings.png` | 345×1216 | **1개** — y 337~491 · x 0~344 · 43,055px · maxΔ 170 | Δ 0 (`YOUR CHILD` 그룹 · `ACCOUNT` 라벨 y≈298 포함) | 그룹 첫 행 *Log out* → *Data & privacy* · *Account* · *Log out* (그룹 높이 +114 · 아래 그림자 이동). HEAD/신규 크롭 나란히 확인 |
| `s3-dialog-scrim.png` | 393×852 | **1개** — y 377~545 · x 24~368 · 16,369px · maxΔ 26 | y 0~376 · 546~851 Δ 0. **Dialog 제목·설명 영역(y 305~376) Δ 0** | scrim 뒤 ACCOUNT 그룹 행 증가. Dialog 내부 차이(maxΔ 14 · 확인 버튼 maxΔ 7)는 white 90% 표면을 통한 **배경 비침**이며 Dialog 자체 변경 아님 (`VG8-B-12` 와 같은 기전) |

설명되지 않는 띠 0 → 재생성 정당. 같은 크기 유지는 두 스크린샷 모두 **고정 영역**(요소 1216 · 전체 프레임 852)이기 때문이다.

### 3. NEEDS_DECISION 응답

#### 3.1 `VG8-B-07` — `H8-2-N1` 행 삭제 실패 · 오프라인 설명 문구 → **FIX**

**결정** (Spec §10.3 에 추가 — 개정 이력 `VG8-B-07`):

| 표면 | 제목 | 설명 |
|---|---|---|
| 실패 (`InlineAlert error`) | 기존 `errorCopyForCode(code).title` | *Your recording of {title} from {date} wasn't deleted. You can try again.* |
| 오프라인 (`InlineAlert offline`) | 기존 `networkErrorCopy.title` | *Nothing was sent. Your recording of {title} from {date} wasn't deleted.* |

- `{title}` = 행 제목(책 제목 | *Storytime*) · `{date}` = 행에 보이는 날짜 라벨(`dateLabel` — 연도 규칙 동일).

근거:
1. **제목만으로는 행을 특정할 수 없다.** `success` fixture 에 *Where the Wild Things Are* 2행(Dec 28 · Dec 29) · *Grumpy Monkey* 2행 · *The Most Magnificent Idea* 2행이 있다 `[png]`. *Delete* 접근성 이름이 이미 *{title}, {date}* (Spec §2.3.2) — 같은 식별자를 쓴다.
2. *Storytime*(`book = null`) 단독이면 *"Storytime was not deleted."* 가 녹음이 아니라 활동을 가리키는 것처럼 읽힌다 → *Your recording of …* 로 대상을 명시.
3. 실패 후 행의 *Delete* 가 그대로 남으므로 *You can try again.* 이 다음 행동을 알려준다 (§10.2 실패 *You can ask again.* 과 같은 구조). 오프라인은 §10.2 *Nothing was sent.* 패턴 유지 — 재시도 안내는 연결 회복 전이라 넣지 않는다.
4. 축약형 *wasn't* — §10 승인 문구(*can't be undone* · *couldn't*)와 어조 통일. 진단·판정·비교어 0 · 기한·수치 0 · 아이 이름 0 (§10.6 대조).

development-agent: `features/recording-deletion/copy.ts` `notDeleted` · `notSent` 를 `(title, date)` 2인자로 바꾸고 위 원문 적용 · 관련 단위/e2e 기대값 · baseline `s8-recordings-delete-failed-{393,320}` 재생성(원인 = 문구만, `R-BASELINE-1` ⑤ 분해 기록).

#### 3.2 `VG8-B-08` — `H8-2-N2` 행 보조 줄 줄바꿈 → **USER_DECISION**

**실측** `[png][직독]` — 텍스트 열 = 좌 17 ~ meta 우단(393: 239 · 320: 166). *Delete* 가 없는 행은 카드 우측 패딩까지(393: 327 · 320: 약 255).

| 측정 | 393 | 320 |
|---|---|---|
| 텍스트 열 폭 (*Delete* 있는 행) | 223 | 150 |
| subtitle *Dec 31, 2025 · 11 min* | 118 | (같음) |
| 그중 *, 2025* 몫 (추정 — 같은 글자 폭 환산) | 약 33 | 약 33 |
| meta *Saved* / *Uploading* / *Not uploaded yet* / *Removed after 90 days* | 33 / 56 / 95 / 129 | 같음 |
| meta-row gap | 8 (`--space-2`) | 8 |

계산(subtitle + 8 + meta ≤ 열 폭이면 한 줄):

| 행 | 393 연도 있음 | 393 같은 해(연도 없음 ≈ 85) | 320 연도 있음 | 320 같은 해 |
|---|---|---|---|---|
| Saved | 159 ✅ | ✅ | 159 ❌ | 126 ✅ |
| Uploading | 182 ✅ | ✅ | 182 ❌ | 149 ✅ (여유 1) |
| Not uploaded yet | **≈221 ❌** (계산 여유 2px 이하 — 숫자 글리프 폭 차이로 실제 감김 `[png]`) | 188 ✅ | 221 ❌ | 188 ❌ |
| Removed after 90 days (열 311 / 약 238) | 255 ✅ | ✅ | 255 ❌ | 222 ✅ |

원인: `ListRow__meta` = `flex: 0 0 auto`, meta-row 는 `flex-wrap` 없음(`List.css` L141~164) → **meta 는 줄지 않고 subtitle 이 좁아져 단어마다 끊긴다** (`Dec 28, / 2025 · / 12 min`). Spec §8.1 의 "meta 가 다음 줄로 감김(기존 동작 확인)" 은 **기존 동작이 아니었다** — Spec 기술 오류(design-agent).

보충: baseline 의 연도는 Mock 서버 시계(2026-01-01) 때문이지만, 실제로도 **연도를 넘긴 행은 항상 연도가 붙는다**(1월 초 · `expired` 행은 90일 전 — 해를 넘기기 쉽다). 그래서 393 에서도 실데이터로 재현된다.

| 안 | 내용 | 320 결과 | 비용·위험 |
|---|---|---|---|
| ① 수용 | 현행 | 날짜·길이가 단어 단위로 끊김(3줄) | 0 — 가독성 저하 (*Dec 28, / 2025 ·*) |
| **② (권고)** | `ListRow` **opt-in prop**(예: `metaWrap`) — meta-row `flex-wrap: wrap` + subtitle 을 내용 폭 기준으로 두어, 안 들어가면 **meta 가 통째로 다음 줄**(좌측 정렬)로 내려감 | *Dec 28, 2025 · 12 min* / *Not uploaded yet* — 2줄, 단어 분절 0 | **Shared UI API 확장 = 승인 대상.** 기본값 off → Library 등 기존 사용처 DOM·baseline diff 0. Spec §8.1 원래 의도와 같다 |
| ③ | 상태를 subtitle 로 합침 (*Dec 28, 2025 · 12 min · Not uploaded yet*, meta 슬롯 미사용) — feature 안에서만 | 자연 줄바꿈(구분점 위치는 보장 안 됨) | Shared 변경 0. 단 우측 상태 열이 사라져 393 에서도 상태 훑어보기가 약해진다 · Spec §2.3 레이아웃 변경(승인 대상) |
| ④ | 날짜 축약(연도 항상 생략 / 숫자형 `12/28/25`) | Not uploaded yet 행은 여전히 감김 | 연도 생략 = 해 넘긴 행 모호 · 숫자형 = 공용 `formatMonthDay` 규칙과 다른 날짜 표기 → 기각 권고 |
| (참고) NBSP 묶음 | 날짜·길이 안을 줄바꿈 금지로 묶기 — feature 안에서만 | *Not uploaded yet* 행(320 남는 폭 47) 에서 **글자가 meta 와 겹친다** | 단독 사용 불가 → 기각 |

**권고 ②.** 결정 시 development-agent 작업: `packages/ui` `ListRow` prop 추가 + 단위 테스트 · `RecordingList` 만 opt-in · 320/393 `recordings-*` baseline 재생성(원인 분해) · 기존 `ListRow` 사용처 baseline diff 0 확인. 결정 전까지 현행 유지(차단 아님 — Stage 8 Verdict 에서 일괄 결정).

### 4. Spec 개정 (이 문서 근거)

| 개정 | 위치 | 내용 |
|---|---|---|
| `VG8-B-07` | §10.3 · 개정 이력 | 행 삭제 실패 · 오프라인 설명 원문 추가 |
| `VG8-B-08` | — | **결정 후 개정** — §8.1 320 행 문구("ListRow 기존 동작 확인")는 사실과 다름을 이 문서에 기록해 두고, 사용자 결정(②/③/①)에 맞춰 고친다 |

### 5. 다음 단위로 넘길 것

- `S8-C`: 전체 삭제 실패 InlineAlert 는 §10.2 원문 그대로(이번 `VG8-B-07` 은 행 단위 문구만).
- `S8-G`: `VG8-B-12` Dialog 배경 블러(전 Dialog 공통 — 대비·가독 감사 항목).
- `S8-H`: 200% 텍스트에서 녹음 행 — `VG8-B-08` 결정 반영 후 측정.

---

## S8-C

전체 데이터 삭제 요청 (`docs/qa/stage-8-handoff.md` H8-3). 검토일 2026-11-20. Playwright **미실행** (S8-D 병행 — 지시). 근거 Spec = `stage-8-design-spec.md` §2.2 · §2.4-② · §2.5 · §2.9 · §6.1 · §10.2 · §10.4. 대응 디자이너 프레임 0 (Spec §0.2) → 비교 기준 = Spec + 재사용 근거 DRAFT `321:2203`(ConfirmDialog destructive — S8-B §0 `[var]` 결과 재사용, 이 단위 재조회 0).

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[png]` | 신규 baseline 6장 직독 + 열 프로브(x = 폭−40, 인접 픽셀 채널 Δ > 5 인 y 를 경계로 기록)로 상자 경계 실측 | `e2e/__screenshots__/darwin/settings-data.spec.ts/s8-data-deletion-{dialog,failed,offline}-{393,320}.png` · 비교용 `…-processing-*`(S8-B 산출물, mtime 20:03/20:04 — 이 단위 첫 실행 20:47 이전, 재작성 0) |
| `[직독]` | 저장소 | `features/data-management/{copy.ts, ui/DataManagement.tsx, ui/DeletionStatusAlert.tsx, model/deletionSurface.ts}` · `entities/data-management/deletionPolling.ts` · `shared/copy/error-copy.ts` · 쓰기 차단 표면 6 + Toast 실패 표면(`BookDetailSheet` · `ActivityCardDeck` save · `StartSessionAction` · `ReflectionCard`) · `report-pdf/ui/ReportPdfAction.tsx` · `mocks/common/writeGuard.ts` · `entities/library/useToggleLibrarySave.ts` |
| `[grep]` | 저장소 grep | `useDataDeletionCleanup` · `activeDeletionRequest` 소비처 · `deletionPendingCopy` · `sessionStartBlockedCopy` · `joinErrorMessage` |

**신규 baseline 이 없는 상태** (기록): 진행 중(`received`·`processing`)은 S8-B 의 `s8-data-deletion-processing` 을 그대로 쓰며 S8-C 는 새 baseline 을 더하지 않았다. **완료**(로컬 정리 → Guard → `/onboarding/start` 위 Toast)도 baseline 0 — Toast 는 일시 오버레이이고 이동 직전 수 ms 겹침(H8-3.6)이 있어 `R-BASELINE-1` ① 상 baseline 부적합. 완료 표면은 단위 · e2e 기능 단언(경로 · Toast 문구 · localStorage)으로만 확인된다(handoff 기록 — 이 문서는 문구 · tone 을 `[직독]` 으로만 대조).

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | 분류 |
|---|---|---|---|---|
| `VG8-C-01` | 영향 안내 — §10.2 원문 일치 · footnote primary · 섹션 `DELETE DATA` 아래 · *Delete all data* 동작 행(chevron 0 · 빨강 0) | Spec §2.2 일치 `[png][직독]` | — | **OK** |
| `VG8-C-02` | ConfirmDialog ② — 제목 *Delete all of Emma's data?* · 설명 §10.4 원문 · destructive *Delete all data* → *Cancel* 순서 · 폭 393=321 / 320=272 (S8-B `VG8-B-06` 과 같은 규칙) · 처리 중 Esc·scrim·Cancel 무시(`onCancel` 이 `isPending` 이면 반환 — Shared `Dialog` 변경 0) | Spec §2.4-② 일치 | — | **OK** |
| `VG8-C-03` | 상태 표면 — 진행 = `InlineAlert info` 최상단(y 24) · 실패 = `error` 최상단 + *Try again* · **스피너 · 진행률 0** · 실패 알림 → `RECORDINGS` 라벨 간격 16(`gap-4`) · 진행 중 행 `disabled` / 실패 후 행 활성 · `received → processing` DOM 불변(재낭독 0) | Spec §2.5 · `Q8-08` ⓐ · §9.1 일치 `[png][직독]` | — | **OK** |
| `VG8-C-04` | `H8-3-N2` 요청 실패 · 오프라인 알림 action 0 · 위치 = 영향 안내 아래 · 행 바로 위(393 실측: 안내 끝 → 알림 상단 ≈12, 알림 하단 357 → 행 상단 370 = 13, 경계 1px 포함 `P-41` 12) · 오프라인 *You are offline* / *Nothing was sent.* | Spec §2.2 일치 · **action 0 확정** (§3.2) | — | **OK** (Spec 주석 추가 · Plan 문구 정정 = plan-agent) |
| `VG8-C-05` | `H8-3-N3` 요청 실패 설명 = `errorCopyForCode` 설명 그대로 (예: *Please try again in a moment.*) — 파괴적 요청의 결과(지워졌는가)를 말하지 않는다 | **Spec 개정으로 확정** (§3.3) | Low | **FIX** |
| `VG8-C-06` | 완료 Toast — *Your data was deleted.* · `tone success` · 1회 | Spec §2.5 · §10.2 일치 `[직독]` (baseline 0 — 위 기록) | — | **OK** |
| `VG8-C-07` | *Changes are paused* — 2줄 표면 6곳: 아이 정보 · 성장 초점 · 설문 재응답(각 `deletionPendingCopy ?? saveFailed`) · 내 책 추가(제목 + 설명) · 홈 시트 선택 확정(`ReadingContextSheet` 제목 + 설명) · 세션 시작(홈 시트 — `sessionStartBlockedCopy`) | `VG8-A-03` 2줄 규칙 일치 `[직독]` · 시각 baseline 0 → 렌더 확인은 QA(handoff 의 e2e 는 아이 정보 · 홈 시트 2곳만) | — | **OK** |
| `VG8-C-08` | Toast 표면에 제목 + 설명이 이어 붙는다 — 서재 세션 시작(`joinErrorMessage(sessionStartBlockedCopy)`) · 회고 저장(`joinErrorMessage(errorCopyForCode)`) → *Changes are paused. Your data is being deleted, so changes are paused.* ("paused" 반복) | 1줄 표면 규칙 부재 — Spec 개정(§3.4) | Low | **FIX** |
| `VG8-C-09` | `H8-3-N4` 미연결 표면 ① 책 저장/해제 Toast(`BookDetailSheet` · 홈 `ActivityCardDeck` save — `library.saveBook`/`unsaveBook` 은 차단 대상) ② PDF 요청 InlineAlert ③ 온보딩 ④ 백그라운드 | ① ② **FIX** · ③ ④ **OK** (§3.4) | Low | **FIX** / **OK** |
| `VG8-C-10` | `H8-3-N1` 폴링 상한 5s × 60(5분) — 상한 도달 시 UI 변화 0 | 시각 판단 = OK (§3.1). **수치** = Plan 미정 | — | **USER_DECISION** (권고: 5s × 60 유지 · 가값 등재) |
| `VG8-C-11` | **완료를 이 화면 밖에서 맞으면 로컬 정리 0** — 정리(`useDataDeletionCleanup`)는 `/settings/data` 의 폴링만 부른다. 화면 이탈 · 상한 도달 후 서버가 `completed` 되면 재진입 시 `activeDeletionRequest = null` 이라 표면 `none` → 정리 · Toast 0, `me` 재조회로 Guard 만 온보딩으로 보낸다 → **이 기기에 draft · 로컬 녹음 · 카드 캐시가 남는다** (`architecture.md` §9 "데이터 삭제 시 로컬 녹음·캐시 정리") `[grep]` | Spec §2.5 *"다시 들어오면 summary 로 같은 알림"* 은 진행 중만 다뤘다 — **Spec 공백 (design-agent)** | **High** | **USER_DECISION** (권고 §3.5) |
| `VG8-C-12` | `H8-3-N5` `scope='account'` 진행 · 실패 문구 | **Spec 개정으로 확정** (§3.6) — `S8-D` 구현 | Low | **FIX (`S8-D`)** |

Mock 재현성 메모: Mock 은 폴링 조회가 진행을 밀어 `completed` 에 닿으므로(`MockDataManagementApi` — `MOCK_DELETION_FINAL_READ`) `VG8-C-11` 은 현 Mock 으로 재현되지 않는다. 실제 Backend 에서는 시간 기반으로 완료되어 재현된다 — Mock 미재현을 결함 부재의 증거로 쓰지 않는다.

### 2. 기존 baseline 변경

이 단위의 기존 baseline 재작성 0 (`[png]` mtime — handoff H8-3.9 와 일치). `s6-settings` · `s3-dialog-scrim` 수정은 S8-B 산출물로 S8-B §2 에서 분해 완료. 320 `data` 는 baseline 이 아니라 테스트(포인터 치움)를 보정 — hover 프레임을 담지 않는 방향이라 `R-BASELINE-1` 과 부합.

### 3. NEEDS_DECISION 응답 (H8-3.7)

#### 3.1 `VG8-C-10` — `H8-3-N1` 폴링 상한 → **USER_DECISION**

- **시각 판단 (design-agent 결정, OK)**: 상한 도달 시 **표면 변화 0** 이 맞다. 진행 문구 *You can leave this screen — the status will show here.* 는 재진입 시 재개로 여전히 참이며, "업데이트 멈춤" 같은 새 문구 · 새 버튼은 최우선 규칙 2(새 UI) 대상이고 서버 진행률이 없어 사용자에게 줄 정보도 없다.
- **수치 (Plan 소유 — 결정 필요)**: 권고 = **5s × 60회(5분) 유지 + `provisional` 가값 등재**(SLA 법무 입력 `L-xx` 확정 시 교체). 근거: 화면을 5분 넘게 열어 둘 사용자는 드묾 · 요청 수 상한 · 기한 수치 문구 0 원칙과 무관(클라이언트 내부값).
- 단, 이 결정은 `VG8-C-11` 과 묶여 있다 — 상한 후 완료되면 현재 구조로는 정리가 영영 일어나지 않는다.

#### 3.2 `VG8-C-04` — `H8-3-N2` 재시도 버튼 없음 → **OK (action 0 확정)**

1. 파괴적 요청의 재시도는 **Dialog ② 재확인을 거쳐야 한다** (`N8-08` ⓐ 확인 1회 = 요청 1건마다). 알림 안 *Try again* 이 바로 POST 하면 확인을 우회하고, Dialog 를 열면 **바로 아래 행과 같은 진입점이 둘**이 된다(실측 간격 13px).
2. S8-B 행 삭제 실패와 같은 구조 — 실패 후 *Delete* 가 그대로 남아 재시도 = 같은 조작.
3. 서버 `failed`(§2.5)만 *Try again* 을 두는 것은 알림이 **화면 최상단**에 있어 행과 떨어져 있기 때문 — 일관된 기준(알림과 진입점의 거리).

Spec §2.2 에 주석 추가(`VG8-C-04`). Plan §5.3 "(재시도 버튼)" 은 Spec 과 어긋난 문구 → **plan-agent 정정 보고** (사용자 결정 불필요).

#### 3.3 `VG8-C-05` — `H8-3-N3` 요청 실패 설명 → **FIX**

| 표면 | 제목 | 설명 |
|---|---|---|
| 요청 실패 (`InlineAlert error`, 오프라인 아님) | 기존 `errorCopyForCode(code).title` | *Nothing was deleted. You can try again.* |

근거: ① 파괴적 행위의 실패 안내는 **무엇이 바뀌었는가**를 먼저 말한다 — §10.2 서버 실패 *Nothing else changed.* · 오프라인 *Nothing was sent.* 와 같은 축. 일반 설명(*Please try again in a moment.*)은 데이터가 지워졌는지 답하지 않는다. ② *You can try again.* = `VG8-B-07` 과 같은 다음 행동 안내(행이 활성). ③ 5xx 인데 서버가 실제로 요청을 만든 경우에도 재시도 POST 는 `DELETION_ALREADY_REQUESTED` → 진행 info 로 바로잡히며, 그 시점에도 삭제는 아직 끝나지 않았으므로 문장은 거짓이 되지 않는다. ④ §10.6 금칙어 · 수치 0.

development-agent: `features/data-management/copy.ts` 에 `deleteData.notDeleted` 추가 · `DataManagement.tsx` 실패 분기 설명 교체 · 단위 기대값. 이 표면 baseline 은 없다(기존 `failed` baseline 은 서버 `failed` 표면 — 영향 0).

#### 3.4 `VG8-C-08` · `VG8-C-09` — `H8-3-N4` 미연결 표면 · Toast 규칙 → **FIX (①②) / OK (③④)**

Spec §2.9 *"Toast 0"* 의 뜻 = **새 Toast 를 만들지 않는다**. 기존 실패 표면이 Toast 인 곳은 그 Toast 가 "기존 실패 표면"이다 — 이미 서재 세션 시작 · 회고 저장 Toast 는 차단 문구를 띄우고 있어 ①만 빠진 것은 비일관이다. Spec §2.9 를 명확화했다.

| # | 표면 | 판정 | 작업 |
|---|---|---|---|
| 1줄 규칙 | Toast(모든 기존 Toast 실패 표면) | **FIX** (`VG8-C-08`) | `ACCOUNT_DELETION_PENDING` 이면 **설명만** — *Your data is being deleted, so changes are paused.* (자체 제목 표면 = 설명만 규칙의 1줄판). 대상: `StartSessionAction` · `ReflectionCard` + 아래 ① |
| ① | 책 저장/해제 Toast — `BookDetailSheet` · 홈 `ActivityCardDeck` save | **FIX** (`VG8-C-09`) | `useToggleLibrarySave` 의 `onError` 가 code 를 넘기지 않는다 → code 전달(entity hook 시그니처) · 차단이면 위 1줄 문구, 아니면 기존 *saveFailed*. 낙관적 토글 되돌림은 그대로 |
| ② | PDF 요청 InlineAlert (`ReportPdfAction` `failed`) | **FIX** (`VG8-C-09`) — 조건부 | **요청(`reportPdf.request`) 자체가 `ACCOUNT_DELETION_PENDING` 으로 거절된 경우만** 기존 2줄 InlineAlert 에 제목 + 설명. 로컬 job 상태(`features/report-pdf/model`)에 code 를 싣는다 — **contract 변경 0**. 서버 job 이 `failed` 로 끝난 경우는 code 가 없으므로 기존 *copy.failed* 유지. contract 변경이 필요하다고 판명되면 구현하지 말고 보고 |
| ③ | 온보딩 저장 · 제출 | **OK** | 삭제 진행 중에는 온보딩 완료 상태라 도달 불가 (완료 후에는 차단 해제) |
| ④ | 세션 전이 · 녹음 업로드(백그라운드) · `reports.markViewed`(무음) · 푸시 등록(`usePushPermission` — 화면 실패 표면 없음) | **OK** | 실패 표면이 없는 곳에 표면을 새로 만들지 않는다(최우선 규칙 2). 업로드는 로컬 보존 · 재시도 규칙 그대로 |

#### 3.5 `VG8-C-11` — 이 화면 밖에서 완료 → 로컬 정리 0 → **USER_DECISION** (High)

| 안 | 내용 | 비용 · 위험 |
|---|---|---|
| **① (권고)** | 요청 성공 시 **요청 id 만**(PII 0) 기기에 표시해 두고, 앱 조립 지점(`app/providers` 또는 Guard 앞)에서 그 id 를 조회해 `completed` 면 `useDataDeletionCleanup` 과 같은 정리 + Toast 1회 · `failed` 면 표시 제거. 화면의 폴링은 그대로 | 아키텍처 영향(전역 감시 1곳 · 로컬 키 1개) → **plan-agent 재검토 · 승인 필요**. 새 UI 0 |
| ② | `me` 로 판정 — 표시가 있고 `me.child` 가 사라졌으면 정리 | 조회 0 추가. 단 다른 원인(탈퇴 · 서버 불일치)과 구분 약함 |
| ③ | 수용 — 진행 중 화면 이탈을 막지 않고 정리 누락 감수 | 프라이버시 규칙(§9) 위반 상태로 남음 → **비권고** |

결정 전 판정 근거로 남긴다: Spec §2.5 는 *"진행 중 이탈 → 재진입 시 같은 알림"* 만 정의했고 **이탈 중 완료**를 다루지 않았다 — design-agent 명세 누락. 결정 후 §2.5 · §6.1 을 개정한다.

#### 3.6 `VG8-C-12` — `H8-3-N5` 탈퇴 요청 문구 → **FIX (`S8-D` 전달)**

| `scope='account'` 상태 | tone | title | description | action |
|---|---|---|---|---|
| `received` · `processing` | `info` (`status`) | *We're deleting your account* | *Your account and all of {firstName}'s data are being deleted. This can take a little while.* | 없음 |
| `failed` | `error` (`alert`) | *We couldn't finish deleting your account* | *Nothing else changed. You can ask again from Account.* | **없음** |

근거: ① 같은 *We're deleting your data* 는 범위(계정)를 숨긴다. ② 탈퇴 완료는 `/settings/data` 가 처리하지 않으므로(H8-3.6) *the status will show here* 는 약속할 수 없다. ③ 실패의 *Try again* 이 Dialog ②(전체 삭제)를 열면 **범위가 바뀐다** → action 0, 다시 할 곳(*Account*)을 문장으로 안내. ④ *Delete all data* 행은 진행 중 `disabled` 그대로(쓰기 차단 의미 같음).

**S8-D 에 넘길 것 (Orchestrator 전달)**:
1. `DeletionStatusAlert` 에 `scope` 분기 — 위 표 원문 (`features/data-management/copy.ts` 에 `accountProgress` · `accountFailed`), `failed` + `account` 는 `onTryAgain` 을 넘기지 않는다.
2. `/settings/account` 에 진행 중 `account` 요청이 보이면(다른 기기 · 정리 실패 등) 같은 info 알림을 **기존 실패 표면 자리**(영향 안내 아래)에 쓰고 *Delete account* 행 `disabled`. 진행 중 `all_data` 는 Spec §2.6 대로(활성 + 서버 응답 시 *Your data is already being deleted…*) — 변경 0.
3. 단위: scope 별 문구 · action 유무. baseline 은 S8-D 판단(필요 시 393/320 각 1, `R-BASELINE-1` 준수).

### 4. Spec 개정 (이 문서 근거)

| 개정 | 위치 | 내용 |
|---|---|---|
| `VG8-C-04` | §2.2 표 · 개정 이력 | 요청 실패 · 오프라인 알림 action 0 확정 · 이유 |
| `VG8-C-05` | §10.2 · 개정 이력 | 요청 실패 설명 원문 |
| `VG8-C-08` · `VG8-C-09` | §2.9 쓰기 차단 행 · 개정 이력 | "Toast 0" = 새 Toast 금지 · 기존 Toast 표면 포함 · Toast = 설명만 |
| `VG8-C-12` | §2.5 표 + 주석 · §10.2 · 개정 이력 | `scope='account'` 진행 · 실패 문구 |
| `VG8-C-10` · `VG8-C-11` | — | **결정 후 개정** (§6.1 상한 · §2.5 이탈 중 완료) |

### 5. 다음 단위로 넘길 것

- development-agent (S8-C 수정, 결정 불필요): `VG8-C-05` · `VG8-C-08` · `VG8-C-09` ①②.
- `S8-D`: `VG8-C-12` (§3.6 의 1~3).
- plan-agent: Plan §5.3 "(재시도 버튼)" 문구 정정(`VG8-C-04`) · `VG8-C-10` 수치 · `VG8-C-11` 구조 재검토.
- Stage 8 Verdict 일괄 결정: `VG8-C-10` (권고 5s × 60 가값) · `VG8-C-11` (권고 ①).
- QA: `VG8-C-07` 6표면 렌더 확인(e2e 는 2곳만) · `VG8-C-11` 은 Mock 으로 재현 불가 — 단위(시계 주입)로 "이탈 중 완료" 시나리오를 요구.

## S8-D

계정 · 탈퇴 + 미가입 기기 draft 삭제 (`docs/qa/stage-8-handoff.md` H8-4). 검토일 2026-11-20. Playwright **미실행** (Orchestrator 전체 e2e 병행 — 지시). 근거 Spec = `stage-8-design-spec.md` §2.4-③ · §2.6 · §2.7 · §2.9 · §10.4 · §10.5 · `VG8-C-12`. 대응 디자이너 프레임 0 (Spec §0.2) — 단 탈퇴 후 도착 화면 welcome = Figma `179:1701`.

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[png]` | 신규 baseline 13장 직독(393 6장 몽타주 + 320 크기 확인) | `e2e/__screenshots__/darwin/settings-account.spec.ts/*` |
| `[diff]` | Python(PIL · numpy) 픽셀 비교 — 채널 Δ 최대값, 첫 차이 행, 삽입 높이만큼 아래를 밀어 재비교 | `s2-onboarding-childinfo-trial`(HEAD ↔ 작업본) · `s8-welcome-frame` ↔ HEAD `visual.spec.ts/s2-welcome.png` |
| `[meta]` | Figma `get_metadata` `179:1701` (2026-11-20 라이브) | welcome 구조 — 1a · Sign up 393×852, 자식 13(상태바 · 캐릭터 · HARU · 설명 · Button 2 · 로그인 링크 · 약관 · 홈 인디케이터) |
| `[직독]` | 저장소 | `features/account-deletion/{copy.ts, ui/AccountSettings.tsx}` · `features/onboarding-survey/ui/OnboardingIntro.tsx` · `pages/onboarding/OnboardingStartPage.tsx` · `app/guards/resolveGuardDecision.ts` · `shared/config/routes.ts` |

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | 분류 |
|---|---|---|---|---|
| `VG8-D-01` | 계정 화면 — `SIGNED IN AS` · 이메일 행(chevron 0 · 표시 전용) · `DELETE ACCOUNT` · 안내 §10.4 원문 · *Delete account* 동작 행(빨강 0) · 요금제 0 · 실패 알림 위치 = 안내 아래 · 행 바로 위 | Spec §2.6 일치 `[png]` | — | **OK** |
| `VG8-D-02` | Dialog ③ · draft Dialog — 제목/설명/버튼 §10.4 · §10.5 원문 · confirm → cancel 순서 · 폭 393=321 / 320=272 (`VG8-B-06` 규칙) · draft 이름 = *Yuna* | Spec §2.4-③ · §2.7 일치 `[png]` | — | **OK** |
| `VG8-D-03` | `H8-4-N2` 탈퇴 요청 실패 설명 = *Please try again in a moment.* (`errorCopyForCode` 일반 설명) | `VG8-C-05` 와 같은 축으로 **Spec 개정** (§3.2) | Low | **FIX** |
| `VG8-D-04` | `H8-4-N3` *이미 요청* 알림 — 두 문장 전체가 제목(굵게 3줄, 393) | **Spec 개정** — 제목 + 설명 분리 (§3.3) | Low | **FIX** |
| `VG8-D-05` | `H8-4-N4` Loading = `SIGNED IN AS` + 이메일 행 Skeleton 만, 삭제 섹션은 `me` 확정 후 렌더 | Spec §2.9 문언 일치 · 나중 요소는 **아래에 덧붙음**(위 콘텐츠 이동 0) | — | **OK** (§3.4) |
| `VG8-D-06` | Trial draft TextLink — 안내 박스 ↔ 링크 박스 8(`P-41`) · 시작 정렬 · 글자 상단은 박스 아래 약 20 | Spec §2.7 · §9.3 일치 (§3.5) | — | **OK** (`P-41` 설명 보강 = 디자이너 요청서) |
| `VG8-D-07` | `H8-4-N1` `/onboarding/start`(`243:1147`) Trial 안내에 링크 없음 | 새 화면에 UI 추가 = 최우선 규칙 2 (§3.1) | Low | **USER_DECISION** (권고: 포함) |
| `VG8-D-08` | 탈퇴 후 welcome 불변 | `s8-welcome-frame` ↔ HEAD `s2-welcome` **Δ 최대 0 (픽셀 동일)** `[diff]` · Figma `179:1701` 구조 변경 0 · 추가 요소 0 `[meta]` | — | **OK** |
| `VG8-D-09` | `VG8-B-07` 행 삭제 실패 문구 | §10.3 원문 일치(393 3줄 · 320 4줄, 날짜 = 행 라벨 *Dec 30, 2025*) `[png]` | — | **OK** |
| `VG8-D-10` | `VG8-C-12` `scope='account'` 진행 · 실패 | baseline 0 (Mock key 없음 — H8-4.4). 문구 · action 0 은 단위 증거만 → 렌더 확인 = QA | — | **OK** (시각 미확인 기록) |

### 2. 기존 baseline 변경 분해 (`R-BASELINE-1` ⑤) `[diff]`

| baseline | 결과 |
|---|---|
| `visual.spec.ts/s2-onboarding-childinfo-trial` | 345×1131 → 345×1183 (+52 = 간격 8 + 링크 44). 첫 차이 행 y 260(안내 하단 이후) — **위쪽 Δ 0**. 260 이후를 52 밀어 비교: Δ>10 픽셀 17,734 가 **전부 y 800~851 한 띠**(52행 × 전폭) — 뷰포트 클립선(y≈852, HEAD 에도 있는 아래 공백) 위의 *Reading routine* 내용이 밀려 클립 아래로 넘어간 것. 나머지 행 Δ≤4 (배경 그래디언트). 설명되지 않는 클러스터 0 → **재생성 수용**. handoff 의 "99.7%" 는 클립 띠 제외 기준이며 전체 기준은 94.0% — 결론은 같다 |
| `settings-data.spec.ts/s8-recordings-delete-failed-393` · `-320` | ⚠️ **git HEAD 판이 없다** — `settings-data.spec.ts/` 디렉터리 전체가 미추적(S8-B 산출물, 아직 커밋 0)이라 HEAD 대비 분해 불가. 대신 내용 직독: 알림 설명 = §10.3 `VG8-B-07` 원문, 알림 아래 목록 · 행 구조 S8-B 와 같음. 크기 345×1316 · 272×1316 불변(handoff 와 일치). 이전 판 비교는 handoff 의 실행 중 diff 기록만 근거 |
| `s8-welcome-frame` (신규) | HEAD `s2-welcome` 과 393×852 전 픽셀 동일 → Figma `179:1701` 대비 기존 허용 차이 그대로, 신규 차이 0 |

### 3. NEEDS_DECISION 응답 (H8-4.7)

#### 3.1 `VG8-D-07` — `H8-4-N1` `/onboarding/start` 포함 여부 → **USER_DECISION (권고: 포함)**

- 사실 `[직독]`: Stage 2 Spec §2.12 의 C13-11 위치 "`/onboarding` 과 Step 1" 은 **R-12 재구성 전** 기준이다. 재구성 후 `/onboarding/start`(`243:1147`, 동의 직후 첫 화면)도 같은 `OnboardingIntro` 로 **같은 Trial 안내**를 띄운다. 승인(`Q8-12` ⓓ)의 문언은 "Trial 안내(C13-11) 아래" 이고 Spec §2.7 은 "안내와 한 묶음" 이다.
- 도달 경로: Guard 는 draft 가 있으면 저장 지점으로 보내므로 `/onboarding/start` + 응답 있음은 **Step 1 에서 뒤로 왔을 때**뿐이다. 이때 링크가 사라지면 "안내와 한 묶음" 규칙이 깨진다(같은 안내, 다른 내용).
- 권고 **ⓐ 포함** — `OnboardingStartPage` 에 같은 슬롯 조합 1줄 · 단위 · baseline 393/320. 새 컴포넌트 · 토큰 0, `243:1147` 디자이너 영역 변경 0(C13-11 영역 안 — `/onboarding` `179:1748` 과 같은 성격). ⓑ 미포함 = 현 상태 유지(발견성 동일 — Step 1 에 있음).
- Spec 에 없는 화면 위치이므로 **사용자 승인 후** §2.7 노출 화면에 `/onboarding/start` 를 추가한다.

#### 3.2 `VG8-D-03` — `H8-4-N2` 실패 · 오프라인 문구 → **FIX**

| 표면 | 제목 | 설명 |
|---|---|---|
| 탈퇴 요청 실패 (오프라인 아님) | 기존 `errorCopyForCode(code).title` | *Nothing was deleted. You can try again.* |
| 기기 오프라인 | 기존 `networkErrorCopy` | *Nothing was sent.* (현 구현 유지) |

근거: `VG8-C-05` 와 같다 — 파괴적 요청 실패는 **무엇이 바뀌었는가**를 먼저 말한다. 탈퇴 범위(계정 + 전체 데이터) 어느 쪽도 지워지지 않았으므로 *Nothing* 이 정확하다. *You can try again.* = 바로 아래 행이 활성. 금칙어 · 수치 0. development-agent: `features/account-deletion/copy.ts` 설명 추가 · 실패 분기 교체 · 단위 기대값 · `s8-account-failed` 393/320 재생성(이 변경만 원인).

#### 3.3 `VG8-D-04` — `H8-4-N3` 한 문장 알림 → **FIX**

제목 *Your data is already being deleted* (마침표 없음 — §2.5 *We're deleting your data* 와 같은 제목 관례) / 설명 *You can delete your account after it finishes.* 단어 변경 0. 근거: ① 현재 굵은 제목 3줄(393)은 같은 화면의 실패 알림(제목 1줄 + 설명)과 위계가 다르다 ② `VG8-A-03` 2줄 표면 규칙 · `VG8-C-12` 진행 알림과 같은 구조 ③ 첫 문장이 상태, 둘째가 다음 행동이라 분리선이 자연스럽다. development-agent: copy 분리 · 단위 · `s8-account-already-requested` 393/320 재생성.

#### 3.4 `VG8-D-05` — `H8-4-N4` Loading 범위 → **OK**

Spec §2.9 "이메일 행 Skeleton text 1" 문언 그대로다. 삭제 섹션은 이름(`{firstName}`)이 문구에 들어가 `me` 전에는 그릴 수 없고, 나타날 때 **이미 보이는 요소 아래에 덧붙으므로** 위 콘텐츠 이동이 없다(`/settings/data` 처럼 두 섹션을 Skeleton 으로 만들 이유 없음). Spec 변경 0.

#### 3.5 `VG8-D-06` — TextLink 글자가 안내 아래 약 20 → **OK**

- `P-41` 8 은 **박스 간격**으로 정의했고 구현이 그대로다. 글자 위 12 는 §9.3 터치 44 의 padding 이다.
- 음수 margin 으로 당기면 링크 hit 영역이 **안내 박스 하단 padding 과 겹친다** → 안내를 누르려던 손가락이 파괴적 진입점을 연다. 거부.
- 근접성 `[png]`: 글자는 안내 쪽(≈20)이 다음 섹션 라벨(*YOUR CHILD*, ≈50)보다 가까워 안내에 묶여 읽힌다.
- 디자이너 요청서(`R8-##`, `Q8-21`)의 `P-41` 항목에 "박스 8 = 시각 ≈20(터치 44 포함)" 을 덧붙인다 — 디자이너 확정 시 박스 간격 기준으로 교체.

### 4. Spec 개정 (이 문서 근거)

| 개정 | 위치 | 내용 |
|---|---|---|
| `VG8-D-03` · `VG8-D-04` | §10.4 · 개정 이력 | 탈퇴 요청 실패 설명 · *이미 요청* 제목/설명 분리 |
| `VG8-D-07` | — | **결정 후 개정** (§2.7 노출 화면) |

### 5. 다음 단위로 넘길 것

- development-agent (결정 불필요): `VG8-D-03` · `VG8-D-04` (baseline `s8-account-failed` · `s8-account-already-requested` 393/320 각 재생성 — 원인 = 이 문구만).
- 사용자 결정: `VG8-D-07` (권고 ⓐ 포함). 승인되면 `OnboardingStartPage` 슬롯 조합 + baseline 2.
- QA: `VG8-D-10` `scope='account'` 알림 렌더 확인(시각 baseline 0) · `settings-data.spec.ts/` baseline 은 HEAD 판이 없어 S8-B 이후 변경을 git 으로 추적할 수 없다 — 커밋 시점 정리 필요(Orchestrator).

---

## S8-F

앱 공통 정리 + `D8-2` ①②③ + 디자인 FIX 단위 (`docs/qa/stage-8-handoff.md` H8-5). 검토일 2026-11-21. Playwright **미실행** (다른 lane 동시 개발 — 지시). 근거 = Plan rev 2.2 · Spec (`APPROVED (D8-1)` + `D8-2`) §2.5 · §2.7 · §6.3 · §8.1 · §10 · §11.1 · `stage-8-approvals.md`.

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[fig]` | `get_design_context` **선언값**(auto-layout gap · padding · 텍스트 스타일) — 렌더 픽셀 아님 | `179:1730`(가입 Frame 8 → `179:1731`~`1745`) · `321:1592`(Stage 6 DRAFT 설정 content) |
| `[meta]` | `get_metadata` 자식 x·y·h | `179:1724`(가입) · `319:1374`(C13-09 프로필 DRAFT, `319:1477` · `319:1514`) · `179:1733` · `179:1739` · `319:1503` |
| `[code]` | 구현 CSS/마크업 직독 | `shared/styles/section.css` · `--section-label-offset` · `SignUpForm.tsx` L127-170 · `ChildInfoStep.tsx` L172-200 · `onboarding.css` L58-65 · `ChildInfoEditForm.tsx`(diff) · `ProfileCard.tsx` · `PersonaCard.tsx` · `SettingsMenu`/`DataManagement`/`AccountSettings` 컨테이너 gap · `DataDeletionWatcher` · `useDataDeletionWatch` · `useGuardDecision`(diff) · copy 3파일 · `error-copy.ts` · `ReportPdfAction.tsx` |
| `[px]` | baseline PNG 행 프로브(라벨색 `#7d9291` ±22 · 흰 면 ≥250 행 전이, 스크립트 = 스크래치) — HEAD 판과 현재 판 비교 | `visual.spec.ts/s2-signup` · `settings-child.spec.ts/s6-settings-child`(HEAD ↔ 현재) |
| `[png]` | baseline 육안 | `s8-recordings-all-320` · `s8-trial-start-draft-link-320` |

글자 중심 기준: Figma 텍스트 박스 h14(12px · leading normal) → 중심 +7. 구현 `caption-1` 줄 16 → 중심 +8. `[px]` 글리프 중심은 줄 중심과 ±0.5 이내로 일치했다.

### 1. 결과 요약

| ID | 항목 | Figma 근거 | 구현 | 판정 | 사용자 결정 |
|---|---|---|---|---|---|
| `VG8-F-01` | `N8-31` ⓐ 감시자 표면 — Toast · Guard 대기 | 디자이너 프레임 0 (Spec §2.5 명세) | Toast `tone:'success'` *Your data was deleted.* = 화면 안 완료와 같은 `copy.completedToast` 1개 · Guard 대기 = 기존 `PENDING_DECISION`(기존 Spinner) — 새 UI · 새 문구 0 `[code]` | **OK** | 불필요 |
| `VG8-F-02` | `VG6-D-12` Back fallback | §6.3 — 모양 · 라벨 · 위치 변경 0 | `useBackNavigation` 동작만 · TopBar 마크업 불변 · handoff H8-5.5 의 baseline 변경 목록에 Back 원인 0 `[code]` | **OK** (시각 변화 0) | 불필요 |
| `VG8-F-03` | `VG6-H-09` A — Step 1 · 설정 아이 정보 리듬 | `244:1414`~`1415` · `244:1426`: 35 / 18 / 53 | 섹션 gap 20 + offset 7 + 줄 중심 8 = **35** · 8 + 10 = **18** — ABOUT YOU · AT HOME · 설정 YOUR CHILD/AT HOME 전부 ✓ (§2 표) | **OK** | 불필요 |
| `VG8-F-04` | 설정 아이 정보 높이 +7 (Spec 추정 +5) | — | `[px]` HEAD → 현재: YOUR CHILD 라벨→카드 16 → 18(+2) · AT HOME 라벨 +9 · 그 아래 +7 | **OK — Spec 서술 오류** (+5 는 첫 섹션 8→10 의 +2 를 빠뜨림). Spec §11.1 정정 | 불필요 |
| `VG8-F-05` | `H8-5-N2` 섹션 gap 16 화면(SettingsMenu · 데이터 관리 · 계정) **31 / 18 / 49** | 디자이너 프레임 0. Stage 6 DRAFT `321:1592` = flex gap 16 단일(라벨 ↔ 그룹도 16) — design-agent 시각화이며 승인 근거 아님 `[fig]` | 16 + 7 + 8 = 31 · 18 `[code]` | **USER_DECISION** (Low) — 권고 ⓐ 현행 (§3.2) | **필요** |
| `VG8-F-06` | `H8-5-N1` 가입 `179:1733`·`1739` — A 적용 여부 | `[fig]` 섹션 gap **10** · 라벨 행 py10(h34) · 라벨 행 ↔ Input gap **0** · hint 행 py8 → 라벨 중심 → Input **17** · hint 글자 중심 → 다음 라벨 중심 **42** · Input 하단 → 다음 Input 상단 **74** | 현행: **16** · **40** · **72** `[code]` (`[px]` 16.5 · 40 · 73) | **OK — A 미적용 확정** (A 적용 시 18 · 47 · 81 → Δ+7 로 악화, §3.1) | 잔여 Δ−1/−2 허용 차이 등록 여부 (Low) |
| `VG8-F-07` | `H8-5-N1` 프로필 `319:1503`·`1510`·`1540` — A 적용 여부 | `[meta]` 세 노드 모두 **`317:1358` Stage 6 DRAFT 안 C13-09 `319:1374`** (디자이너 프레임 아님) · 카드 **안** eyebrow: 카드 pad 16 · 라벨 h14 → gap 12 → 내용 · Divider → 라벨 12 | `ProfileCard` padding 16 · `gap-3` 12 — 같은 구조(라벨 중심 → 내용 19 vs 20, 줄 박스 14 vs 16) · `VG6-E1-05` OK 기존 판정 | **OK — A 미적용 확정** (페이지 섹션 행이 아니라 카드 eyebrow — recipe 대상 아님) | 불필요 |
| `VG8-F-08` | 리포트 상세 · 지난 리포트 섹션 라벨 미적용 | Stage 7 C-13(Figma 0) · Spec §11.1 A 범위 목록에 없음 | 기존 `P-39` 간격 그대로 | **OK** (범위 밖 — 선행 적용 금지) | 불필요 |
| `VG8-F-09` | `H8-5-N3` Step 1 `YOUR CHILD` 아이콘 헤더 ⓑ-1 → ⓑ-2 되돌림 | Figma 라벨 중심 → 카드 **18** | 헤더 행 44(`--size-touch-min`) · 라벨 중심 22 · gap 8 → **≈30~31 (Δ+12~13)** `[code]` | **USER_DECISION** — 권고: **ⓑ-2 허용 차이 등록** (§3.3) | **필요** |
| `VG8-F-10` | `D8-2` ② `metaWrap` — 녹음 목록 | Spec §8.1 규칙 | `[png]` 320: subtitle 1줄 · 안 들어가는 행은 meta 다음 줄 **시작 정렬** · 들어가는 행(*Deleted* · trailing 없음)은 같은 줄 **우측** · 단어 분절 0 | **OK** — 한 목록 안에 정렬 두 가지가 섞이는 것은 승인된 규칙의 결과(관찰 기록, 조치 0) | 불필요 |
| `VG8-F-11` | `D8-2` ③ `/onboarding/start` draft 링크 | Spec §2.7 · `P-41` 8 | `[png]` 안내 박스 아래 · 시작 정렬 · Step 1 과 같은 조합 · `243:1147` 디자이너 영역 변경 0 | **OK** | 불필요 |
| `VG8-F-12` | 문구 FIX `VG8-C-05` · `C-08` · `C-09`① · `D-03` · `D-04` | §10.2 · §10.4 · §2.9 | `data-management/copy.ts` L44 *Nothing was deleted. You can try again.* · `account-deletion/copy.ts` L31 같은 문장 · L37 제목 *Your data is already being deleted*(+ 설명 분리) · `deletionPendingToastMessage` = 설명만 · `BookDetailSheet` 차단 Toast 연결 `[code]` | **OK** (원문 일치) | 불필요 |
| `VG8-F-13` | `VG8-C-09` ② PDF 쓰기 차단 | §2.9 — 2줄 표면 = 제목 + 설명 | `ReportPdfAction` L50: `blocked` 면 `ERROR_COPY.ACCOUNT_DELETION_PENDING`(*Changes are paused* / 설명) → 기존 InlineAlert · contract 0 `[code]` | **OK** (렌더 baseline 없음 — QA 렌더 확인) | 불필요 |
| `VG8-F-14` | `H8-5-N4` 홈 카드 저장 Toast 일반 문구 | — | Stage 3 "수정 금지" hook — design 판단 대상 아님 | **기록만** (plan-agent/사용자) | (plan-agent) |

FIX **0**. 신규 토큰 · 컴포넌트 · 아이콘 · `overflow` 0 (`[code]` · handoff H8-5.3 대조).

### 2. `VG6-H-09` 섹션별 표 (재작성 — Spec §13 `S8-F` 행)

단위 px. "앞 → 중심" = 앞 내용 아래 → 라벨 글자 중심, "중심 → 내용" = 라벨 글자 중심 → 첫 내용 위.

```
화면 / 섹션                 앞 → 중심   중심 → 내용   합     기준(Figma)          판정
Step 1  YOUR CHILD(아이콘)   (첫 섹션)   ≈30~31        —      18  (244:*)           VG8-F-09 결정
Step 1  ABOUT YOU            35          18            53     35/18/53 (244:*)      ✓
Step 1  AT HOME              35          18            53     35/18/53              ✓
Step 1  Reading routine      35          18            53     35/18/53              ✓ (불변)
설정 아이 정보 YOUR CHILD     (첫 섹션)   18            —      18                    ✓ (이전 16)
설정 아이 정보 AT HOME        35          18            53     35/18/53              ✓
SettingsMenu · 데이터 · 계정  31          18            49     Figma 없음            VG8-F-05 결정
가입 YOU / YOUR CHILD         (미적용)    16            —      17 (179:1730)         VG8-F-06
                             helper→라벨 중심 간 40 (Figma hint→라벨 42)
프로필 카드 eyebrow           (미적용 — 카드 안 구조)  20     19 (319:* DRAFT)      VG8-F-07
```

### 3. NEEDS_DECISION 응답 (H8-5.6)

#### 3.1 `VG8-F-06` · `VG8-F-07` — `H8-5-N1` 가입 · 프로필 실측 → **A 미적용 확정 (OK)**

**가입 `179:1724`** `[fig][meta]` — 선언값 `Frame 8` = `flex-col gap 10` / `Frame 6`·`Frame 7` = `flex-col` **gap 0** / 라벨 행 `px 26 · py 10` (텍스트 `SF Pro Bold 12 · tracking 0.72 · #7d9291`, h14) / hint 행 `py 8` / Input `179:1734`·`1740` 은 라벨 행 바로 아래(y34). 즉 가입 화면 리듬은 Step 1 `244:*`(라벨 행 → **gap 1** → 내용 · 섹션 gap 18)과 **다른 구조**다.

| 측정 | Figma | 현행 | A 적용(gap-6 24 유지) | A + gap 20 |
|---|---|---|---|---|
| 라벨 중심 → Input | 17 | 16 (Δ−1) | 18 (Δ+1) | 18 (Δ+1) |
| hint/helper 글자 중심 → 다음 라벨 중심 | 42 | 40 (Δ−2) | 47 (Δ+5) | 43 (Δ+1) |
| Input 아래 → 다음 Input 위 | 74 | 72 (Δ−2 · `[px]` 73 은 흰 면 경계 ±1) | 81 (**Δ+7**) | 77 (Δ+3) |

현행이 Figma 에 가장 가깝다 → **A 를 적용하지 않는다** (Spec §11.1 "가입 — 적용 전 행 기하 실측" 조건의 결과). 잔여 Δ−1 · −2 · −2 는 토큰 스케일(8 · 10)로 정확히 맞출 수 없는 1~2px 이다 — 허용 차이 등록 여부는 **사용자 결정**(권고: 등록, Low). 등록 전까지 현행 유지 · 코드 변경 0.

**프로필 `319:1503`·`1510`·`1540`** `[meta]` — 세 노드 모두 `319:1374` "C13-09 Profile — onboarding · variant A" 안에 있다 = Stage 6 **design-agent DRAFT**(`317:1358`), 디자이너 프레임이 아니다. 그리고 페이지 섹션 행이 아니라 **카드 안 eyebrow**(카드 pad 16 → 라벨 h14 → gap 12 → 내용; `319:1477` 은 Divider 하단 → 라벨 12)다. 구현 `ProfileCard`(pad 16 · `gap-3` 12)는 같은 구조로 이미 `VG6-E1-05` OK. A(페이지 섹션 recipe)는 대상이 아니다 → **미적용 확정**. 코드 변경 0.

#### 3.2 `VG8-F-05` — `H8-5-N2` 섹션 gap 16 화면 31/49 → **USER_DECISION (권고 ⓐ)**

사실: Spec §11.1 A 의 결과 서술 "모든 섹션 53 / 35" 는 섹션 gap 20 을 전제했다. 같은 Spec §2.0 은 설정 계열 섹션 간격 16(Stage 6 승계, 값 변경 0)을 정했다. 두 서술이 설정 계열에서 충돌한다 — **design-agent Spec 서술 오류**. 구현은 §2.0 을 지켜 31 / 49 다.

| 안 | 내용 | 결과 | 비용 |
|---|---|---|---|
| **ⓐ (권고)** | 현행 — recipe 의 불변량은 **라벨 중심 → 내용 18** (전 화면 동일), "앞 → 중심" = 섹션 gap + 15 | 설정 계열 31/49, Figma 근거 화면 35/53 | 0. Spec §11.1 서술만 정정 |
| ⓑ | 설정 계열 3화면 섹션 gap 16 → 20 (`gap-5`) | 전 화면 35/53 | Stage 6 승인 값 변경 · 같은 flex 안의 InlineAlert · 설명 문장 간격도 +4 · baseline 약 25장 재생성 |

근거(ⓐ): ① 설정 계열은 디자이너 프레임이 없어 35 를 강제할 Figma 값이 없다 ② 라벨과 **자기 내용**의 결속(18)은 전 화면 같다 — 섹션 구분은 앞 간격이 맡는데, 설정 계열은 내용이 카드(ListGroup)라 경계가 이미 뚜렷하다 ③ 디자이너 요청서 `R8-4`(설정 계열 공통 값)가 이미 열려 있다 — 디자이너 값이 오면 그 값으로 교체. 결정 시 Spec §11.1 문구 정정(ⓐ) 또는 development-agent 작업(ⓑ).

#### 3.3 `VG8-F-09` — `H8-5-N3` Step 1 `YOUR CHILD` 아이콘 헤더 → **USER_DECISION (권고: ⓑ-2 허용 차이 등록)**

기하 `[code]`: 아이콘 hit 44 를 라벨과 세로 중심 정렬하면 hit 아래 끝 = 라벨 중심 + 22. Figma 18 을 맞추면 카드 위 = 라벨 중심 + 18 → **어떤 배치든 4px 겹친다** (handoff 실측 hit 334 > 카드 330 과 일치). 대안을 모두 검토했다.

| 안 | 결과 | 판단 |
|---|---|---|
| **ⓑ-2 (권고)** 현행 유지 + 허용 차이 등록 | Δ+12~13 (라벨 → 카드 ≈30~31 vs 18) | 겹침 0 · 터치 44 유지 · 변경 0 |
| ⓑ-4 4px 겹침 수용 | Δ0 | **기각** — 표시 모드는 아이콘 · 행 모두 `startEditing` 이라 무해하지만, **편집 모드**에서 헤더는 *Done* `TextLink` 이고 아래는 이름 **입력 필드**다 → 서로 다른 동작의 hit 가 겹친다 |
| ⓑ-5 아이콘만 4px 위로 | Δ0, 겹침 0 | **기각** — 연필 글리프가 라벨 글자보다 4px 높아 행 정렬이 깨진다(Figma 에 없는 어긋남을 새로 만든다) |
| ⓑ-6 hit 36 | Δ0 | **기각** — 프로젝트 터치 최소 44(frontend §9) 위반 |

등록 문안(승인 시): *"`AD-S8-01` Step 1 `YOUR CHILD` 편집 아이콘 헤더 — 라벨 중심 → 카드 ≈31 (Figma `244:1426` 18, Δ+13). 사유: 터치 44 와 Figma 18 은 hit 겹침 4 없이 양립 불가."* 등록 위치 = Stage 8 허용 차이 장부(Orchestrator 지정).

### 4. Spec 개정 (이 문서 근거)

| 개정 | 위치 | 내용 |
|---|---|---|
| `VG8-F-04` | §11.1 표 "설정 아이 정보 +5" | **+7** 로 정정 (첫 섹션 8→10 +2 누락) |
| `VG8-F-06` · `VG8-F-07` | §11.1 A 영향 열 | 가입 · 프로필 = 실측 결과 **A 미적용** 기록 |
| `VG8-F-05` | §11.1 "모든 섹션 53 / 35" | **결정 후 개정** (ⓐ 이면 "라벨 → 내용 18 전 화면 · 앞 → 라벨 = 섹션 gap + 15") |

### 5. 다음 단위로 넘길 것

- 사용자 결정: `VG8-F-05`(권고 ⓐ 현행) · `VG8-F-09`(권고 ⓑ-2 등록) · `VG8-F-06` 잔여 Δ−1/−2 등록 여부(권고 등록, Low).
- development-agent: 결정 전 작업 **0** (FIX 0). `VG8-F-05` ⓑ 선택 시에만 설정 계열 섹션 gap 변경 + baseline 재생성.
- plan-agent / 사용자: `H8-5-N4`(홈 카드 저장 Toast) — design 판단 대상 아님.
- QA: `VG8-F-13` PDF 차단 InlineAlert 렌더 확인(baseline 0) · `VG8-F-01` Guard 대기 Spinner 는 기존 표현 — 새 baseline 불필요.

---

## S8-G

접근성 감사 · 수정 단위 (`docs/qa/stage-8-handoff.md` H8-6). 검토일 2026-11-21. **Playwright 미실행** (지시 — 다른 lane 개발 중). 근거 = Plan rev 2.2 · Spec (`APPROVED`, `D8-1`) §8.2 · §9.4 · §13 `S8-G` 행 · `stage-0-approvals.md` D/P 장부.

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[diff]` | `git diff` 직독 | `useFocusTrap.ts` · `SelectTrigger.tsx` · `useRadioListKeyboard.ts`(신규) · `ReadingContextSheet.tsx` · `app-shell.css` |
| `[find]` | `find e2e/__screenshots__ -newer packages/ui/src/hooks/useRadioListKeyboard.ts` | S8-G 시작 이후 바뀐 baseline — **0건** (`git status` 의 M 7 · ?? 2 는 S8-B~F 산출물) |
| `[ctx]` | Figma `get_design_context` 선언값 | `179:1845`(로그인 하단 행) · `163:1589`(Record Control `Property 1=Record`, 자식 `140:2854`) |
| `[meta]` | Figma `get_metadata` | `179:1820` "1f · Log in" 자식 배치 |
| `[계산]` | WCAG 상대휘도 (토큰 primitive 값 · `--gradient-app` 정지점 선형 보간) | `H8-6-N3` |
| `[직독]` | Spec · CSS · 컴포넌트 | Stage 2 Spec §4.1 · Stage 4 Spec §2.6.3 · §7.5 · 4b Spec §16.7 · Stage 5 Spec §3.3 · Stage 7 Spec `N7-37` · `TextLink.css` · `activity-card.css` · `activity-card-deck.css` · `consent.css` · `ChildInfoStep.tsx` |

구현자 handoff 의 실측 수치(4.02 · 57×22 · 117건 등)는 **참고로만 인용**한다 — 이 단위에서 내가 재현하지 않았다. 내가 직접 낸 근거는 위 표기가 붙은 것뿐이다.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | 사용자 결정 |
|---|---|---|---|---|
| `VG8-G-01` | F1 시간 목록 focus 이동 | **OK** | — | 불필요 (QA 확인 1건 §2.1) |
| `VG8-G-02` | F2 선택 시트 화살표 = 고르기만 · Enter/Space = 확정 | **OK — Figma 충돌 없음** | — | 불필요 (Spec 개정 1건 §4) |
| `VG8-G-03` | F3 focus trap radio 묶음 = 정지점 1 | **OK** (시각 변화 0) | — | 불필요 |
| `VG8-G-04` | F4 AppShell `scroll-padding` | **OK** (정지 픽셀 0 `[find]`) | — | 불필요 |
| `VG8-G-05` | `VG8-B-12` Dialog 배경 blur | **닫음 동의 (OK)** | — | 불필요 |
| `VG8-G-06` | `H8-6-N1` 리포트 카드 링크 이름 (2.5.3) | **USER_DECISION** (권고 ⓐ) | Medium | 필요 |
| `VG8-G-07` | `H8-6-N2` 녹음 버튼 이름 ↔ 캡션 (2.5.3) | **USER_DECISION** (권고 ⓑ) | Medium | 필요 |
| `VG8-G-08` | `H8-6-N3` *Create an account* 대비 | **USER_DECISION** (권고 ⓐ `P-43`) | Low | 필요 |
| `VG8-G-09` | `H8-6-N4` 터치 44 미만 4종 | **USER_DECISION** (권고 링크 ⓐ · 입력칸 ⓒ) | Medium | 필요 |
| `VG8-G-10` | `H8-6-N5` 말줄임 증가 | **USER_DECISION** (권고 ⓐ 조건부) | Medium | 필요 |
| `VG8-G-11` | `H8-6-N6` 196 폭 뒤집기 버튼 | **USER_DECISION** (권고 ⓐ 유지 + 진단 후 FIX) | Medium (기능 손실) | 필요 |
| `VG8-G-12` | `H8-6-N7` P-18 · P-22 재제시 | **USER_DECISION** (권고 ⓐ 포함) | Low | 필요 (Orchestrator) |
| `VG8-G-13` | `H8-6-N8` px 타입 토큰 | **기록만 (OK)** | Low | 불필요 (권고 ⓐ) |

**FIX (development-agent 즉시 작업) = 0.** 결정 후 작업은 §3 각 항목의 "작업" 열.

### 2. 수정 4건 판정

#### 2.1 `VG8-G-01` — F1 → **OK**

- 열면 `Back`, 돌아오면 트리거 — 4b Spec §16.7 DOM 순서(Back → 제목 → 본문) · Spec §9.4 Dialog/Sheet 행(*"열림 → 내부 첫 요소/지정 요소 … 닫힘 → 트리거"*) 와 일치 `[diff][직독]`. 요소 · 토큰 · 위치 변경 0.
- **QA 확인 1건**: 포인터로 시간 목록을 열 때 `Back` 에 포커스 링이 **보이지 않아야** 한다(`:focus-visible` 휴리스틱 — 마우스/터치 뒤 programmatic focus). 시간 목록 열린 상태를 담은 baseline 이 **없어서**(`e2e/visual.spec.ts` · `home.spec.ts` grep 0) baseline 0 이 이것을 증명하지 않는다.

#### 2.2 `VG8-G-02` — F2 → **OK, Spec/Figma 전환 방식과 충돌 없음**

| 대조 | 근거 | 결과 |
|---|---|---|
| Figma | 옵션 시트 = **Figma 없음 → 명세** (Stage 2 Spec §4.1 *"Figma 없음 \| 옵션 Sheet 레이아웃 · error · disabled · focus → 명세"*). 시간 목록 = **Figma 없음** (Stage 4 Spec §7.5 *"결과 칩 `86:538` 만 있고 진입점·시트가 없다"*) `[직독]` | 대조할 Figma 전환이 **없다** — 최우선 규칙 1 대상 아님 |
| 포인터 | Stage 2 §4.1 *"항목 선택 즉시 반영 후 닫힘"* — 포인터 경로는 `onChange` → 닫힘 그대로 `[diff]` | **불변** |
| 키보드 | Stage 2 §4.1 접근성 행 *"Esc 닫기, Sheet 안에서 화살표 이동"* — 수정 전에는 화살표 1회에 닫혀 이 명세를 **어기고** 있었다 | 수정이 **명세를 실현** |
| 모션 | Sheet open/close 모션 · scrim · 레이아웃 변경 0 `[diff]` | 전환 방식 불변 |

- 관찰 (Low · 변경 불필요): 화살표 이동은 `onChange` 를 **즉시** 부른다 — 화살표로 옮긴 뒤 Esc · scrim 으로 닫으면 **옮긴 값이 남는다**(되돌리지 않음). 포인터 "즉시 반영" 원칙과 같은 모델이라 OK 로 둔다. Spec 문구로 확정한다(§4).
- 코드 메모 (디자인 판정 무관): `ReadingContextSheet` 가 `useRadioListKeyboard` 와 같은 규칙을 **복제** 구현(hook 미export). 규칙이 갈라지지 않게 QA 가 두 경로를 같은 키 시나리오로 확인할 것.

#### 2.3 `VG8-G-03` — F3 → **OK**

Tab 정지점 계산만 바뀐다(같은 `name` radio 묶음 = 1). DOM · 스타일 · 초기 focus 변경 0 `[diff]`. native Tab 순서(묶음당 1 정지점)와 trap 판정이 일치하게 된 것 — Dialog · Sheet · SelectTrigger · SwipeDeck 공통 시각 영향 없음.

#### 2.4 `VG8-G-04` — F4 → **OK**

- 값 = 기존 토큰 합(`--layout-safe-*` · `--topbar-height` · `--layout-tabbar-*`) — 신규 수치 · 토큰 0 `[diff]`. `scroll-padding` 은 정지 레이아웃을 바꾸지 않는다 · S8-G 이후 baseline 변경 0 `[find]`.
- 부수 효과 (의도와 같은 방향 — OK): ① `scrollIntoView({block:'nearest'})` 2곳(`ReflectionCard` 저장 · `ReadingContextSheet` 실패 안내 — 단, 후자는 시트 안 스크롤이라 영향 없음)도 바 밑으로 숨지 않게 된다 ② PageDown/Space 페이지 스크롤 양이 바 높이만큼 줄어든다(가려진 줄을 건너뛰지 않음). 앱 셸 뷰포트에 `scroll-snap` 없음 `[grep]` — 스냅 위치 변화 0.

#### 2.5 `VG8-G-05` — `VG8-B-12` Dialog blur → **닫음 동의**

Dialog = Stage 1 Spec §4.22 **Figma 없음 → 명세**(`surface-strong` 단색). `321:2203` 의 `HARU/Glass Rest` 는 **design-agent DRAFT** 이지 디자이너 근거가 아니다(`VG8-B-12` 원문). 최우선 규칙 2 에 따라 blur 추가 = Figma 에 없는 것 추가. 구현자 실측(설명 3.01–3.04 = `P-01` · 새 미달 0)은 참고값 — 판정은 근거 상태(Figma 없음)로 충분하다. → `VG8-B-12` **종료**. blur 를 원하면 디자이너 Figma + 사용자 승인으로 새로 연다.

### 3. NEEDS_DECISION 응답 (H8-6.6)

#### 3.1 `VG8-G-06` — `H8-6-N1` `/progress` 리포트 카드 링크 이름

- 근거: 링크 = 헤더 행(아이콘 + h2 *4-week full report* + 설명 + 보조) 전체 (`N7-37` ⓐ — Figma 카드 `110:835` 에 열기 어포던스가 없어 요소를 늘리지 않은 결정). 현재 `aria-label` = *Open 4-week report, {range}* — 보이는 제목 문자열이 **포함되지 않는다**(*4-week **full** report*) `[직독: progress-overview/copy.ts:68-69]`.

| 선택지 | 시각 · baseline | 승인된 결정 변경 | 비고 |
|---|---|---|---|
| **ⓐ `aria-label` 제거** → 이름 = 보이는 내용 전체 (범위 포함 설명이 이미 있다) | 0 · 0 | Stage 7 Spec §9 `N7-37` 이름 행 개정 | 이름이 길다(설명 2문장). 2.5.3 · 음성 제어 완전 충족 |
| ⓑ `aria-label` = *4-week full report, {range}* (제목으로 시작) | 0 · 0 | 같은 행 개정 | 짧다. 단 axe 규칙은 **하위 보이는 텍스트 전체**를 보므로 설명 문장이 링크 안에 남으면 **여전히 경고**될 수 있다 — 효과 불확실 |
| ⓒ 현행 유지 (예외 등록) | 0 | 없음 | 음성 제어 *"click 4-week full report"* 실패 |

**권고 ⓐ** — 보이는 것이 곧 이름이라 2.5.3 을 확실히 충족하고, 설명이 범위를 이미 포함한다. 작업: copy `openLabel` 제거 + 테스트 이름 갱신(handoff 기준 3곳). Figma 영향 0.

#### 3.2 `VG8-G-07` — `H8-6-N2` 녹음 버튼 이름 ↔ 캡션 `Tap to recording`

- 근거 `[ctx]`: `140:2854` = `Tap to recording` · SF Pro Medium 510 · 10px · white · `163:1589` 의 **Record 변형에만** 존재. 현재 이름 *Start recording* = Stage 4 Spec §2.6.3 *"상태가 아니라 동작을 읽는다"* 결정 · 4b Spec 이름 표 `[직독]`. 캡션은 사용자 지시 원문(2026-10-13 *"'Tap to Recording' 으로 되어 있다가"*)이므로 **문구 변경은 선택지에서 뺀다.**

| 선택지 | 시각 · baseline | 테스트 | 승인된 결정 변경 |
|---|---|---|---|
| ⓐ 이름 = *Tap to recording* (캡션 그대로) | 0 · 0 | e2e **17 파일** 이름 쿼리 *Start recording* 이 **불일치**(Playwright 부분 일치라도 문자열이 없다) + 단위(`RecordControl.test` 2 · copy 상수 경유는 자동) | Stage 4 §2.6.3 "동작 이름" **폐기** |
| **ⓑ 이름 = *Tap to recording, Start recording*** (보이는 캡션 **먼저** + 동작) | 0 · 0 | e2e 부분 일치 쿼리 **그대로 통과** · 단위 exact 쿼리 2(`RecordControl.test`)만 갱신 | Stage 4 §2.6.3 이름 **보완**(동작 이름 유지) |
| ⓒ 현행 유지 (캡션 `aria-hidden` · 예외 등록) | 0 | 0 | 없음 — 음성 제어 사용자는 *Tap to recording* 으로 누를 수 없다 |

**권고 ⓑ** — 2.5.3 Understanding 의 모범 사례(보이는 라벨로 **시작**)를 따르면서 승인된 "동작 이름"을 지킨다. handoff 예시(*Start recording, Tap to recording*)는 순서만 반대 — 충족은 하나 모범 사례는 라벨 선행이다. ~~`recording` · `paused` 변형은 Figma 캡션이 없어 이름 변경 0.~~ **정정 (2026-11-21, S8-H §3.4)**: 캡션이 없는 것은 `recording`(`163:1588`)뿐이다. `paused`(`298:1227`)는 캡션 *Tap to resume* 이 **있다** — 4b Spec §2.5 표에 이미 적혀 있던 것을 이 절이 잘못 옮겼다(사실 오기, `D8-3-N1`). → `D8-4` 로 같은 규칙 적용. `disabled` 는 캡션이 있으므로 같은 규칙.

#### 3.3 `VG8-G-08` — `H8-6-N3` 로그인 *Create an account* 대비

- 근거 `[ctx][meta]`: `179:1847` fill **`#4a5f5c`**(= `--haru-ink-700` = `--color-fg-link`) · SF Pro **Semibold 590 · 14** · underline · 위치 y 820–837 / 852. 큰 텍스트(≥18.66 bold) **아님** → 기준 4.5. **구현은 Figma 그대로**다.
- `[계산]` 배경 `--gradient-app` 선언값(46% `#d3e3de` → 100% `#c7c9d7`, 프레임 높이 기준) 보간 → y 820 `#c8cbd7` **4.21** · y 837 **4.17** · 끝 `#c7c9d7` **4.14**. 구현자 렌더 실측 4.02 는 렌더 위치·높이 차이로 더 낮다 — **어느 쪽이든 4.5 미달**, Figma 자체가 미달이다.
- 같은 색이 그래디언트 위쪽(*Forgot password?* y 644 · 중간 stop 부근)에서는 5.1 이상 `[계산]` — 문제는 **하단 끝 위치** 하나다.

| 선택지 | 시각 · baseline | 승인된 결정 변경 |
|---|---|---|
| **ⓐ 신규 가값 `P-43` 등재** — *"그래디언트 하단(`--color-bg-app-end` 부근) 위 `fg-link` 4.0–4.2:1"*, 현재 Figma 값 · 디자이너 확인 대기(요청서 `R8-7` 신설) | 0 · 0 | 없음 (`P-11` 과 같은 처리 선례 — 4.17–4.48 확정 가값) |
| ⓑ `--color-fg-strong`(ink-800 `#3b4a48`, 끝 위 **5.65** `[계산]`)로 변경 | 로그인 1 · 가입 계열 같은 행이 있으면 추가 baseline 재생성 | **Figma 색 변경** — 최우선 규칙 1 · 사용자 승인 + 디자이너 |
| ⓒ `D-01` 류 **수용 예외** 등록 | 0 | 수용 예외 장부 추가 |

**권고 ⓐ** — Figma 값을 바꾸지 않고(최우선 규칙) 장부에 올려 Final 가값 재제시에서 디자이너 답을 받는다. 번호: 마지막 `P-42` 다음 **`P-43`** (재배정 금지). 등재 자체는 사용자 승인 후(`stage-0-approvals.md` §4 · registry `provisionalItems.ts` 는 development-agent).

#### 3.4 `VG8-G-09` — `H8-6-N4` 터치 44 미만 (승인 결정 없음)

| 대상 | 현재 (handoff 실측 — 참고) | Figma | 주변 여유 `[직독]` |
|---|---|---|---|
| consent *View* ×5 | `TextLink default` 57×22 | 동의 화면 링크 — 높이 규정 없음 | 행 `padding-block 8` + Checkbox(라벨 + 설명 2줄) — 행 높이 ≥ 44 로 추정, 22 링크를 세로 중앙 정렬 → `::before` 44 가 **행 안에 들어갈 가능성 높음** (QA 프로브 필요) |
| 아이 정보 편집 *Done* | 41×22 | `244:1426` 헤더 행 h34 — 같은 자리 IconButton 은 hit 44 (rework Spec) | 같은 자리 IconButton 44 가 이미 쓰는 공간 — 겹침 새로 생기지 않음 |
| 녹음 목록 *Show more* | 86×22 | Figma 없음 (C-13) | 목록 끝 단독 — 위 행과 간격 QA 프로브 필요 |
| 회고 입력칸 높이 40 | 330×40 | **`91:715` 330×40 선언** (Stage 5 Spec §3.3 · `T5-10`) | — |

링크 3종:

| 선택지 | 시각 · baseline | 승인된 결정 변경 |
|---|---|---|
| **ⓐ hit 만 44 로 확장** — `TextLink` 에 `subtle::before` 와 **같은 기법**의 modifier(예: `hit="touch"`) 추가, 색 · 크기 · 레이아웃은 default 그대로 | 0 · 0 (의사요소는 칠하지 않는다) | `packages/ui` **공개 prop 1 추가** → Shared UI API 변경 승인 필요. Stage 2 Spec §4.6 TextLink 행 개정 |
| ⓑ `TextLink standalone` 적용 | 높이 44 · 13/590 로 **보이는 크기 변경** → 동의 · 아이 정보 · 녹음 목록 baseline 재생성 + Figma 와 다름 | 최우선 규칙 1 저촉 — **비권고** |
| ⓒ 예외 등록 (2.5.8 AA 24 는 22 높이라 **미충족** — 예외 근거로 "inline/spacing 예외"를 써야 한다) | 0 | 장부 추가 |

입력칸 40:

| 선택지 | 비고 |
|---|---|
| ⓐ 44 로 키움 | **Figma `91:715` 값 변경** — 디자이너 · 사용자 승인. 회고 baseline 재생성 |
| ⓒ **예외 등록 (권고)** | Figma 선언값 · 폭 330 · WCAG 2.5.8 AA(24) 충족 · `S1-G-2` TextField 행 42 와 같은 성격의 선례 |

**권고: 링크 3종 ⓐ · 입력칸 ⓒ.** ⓐ 조건 — 확장 hit 이 이웃 인터랙티브와 겹치지 않음을 QA 가 `elementFromPoint` 로 확인(특히 consent 행 경계 · *Show more* 위 행).

#### 3.5 `VG8-G-10` — `H8-6-N5` 말줄임 증가 (Text spacing 38 · 196 폭 117)

- 근거: 줄 수 제한은 Figma 레이어의 **선언된 줄 수**(Prompt 2줄 · 책 제목 · 목록 제목 · 역량 캡션 — 각 Stage Spec 이 Figma 대로 옮긴 것). 새 hard clip · 겹침 · 가로 넘침은 0(handoff — 참고). Spec §8.2 기준 *"clip/truncate 요소 잘림 0"* 은 **설계된 말줄임을 구분하지 않은 기준**이라 그대로는 Figma 와 충돌한다.
- WCAG 1.4.12 · 1.4.4 는 "내용 손실"을 본다 — 전체 텍스트가 **다른 경로**(상세 화면 · 시트 · 접근성 이름)로 제공되면 손실이 아니다.

| 선택지 | 시각 · baseline | 승인된 결정 변경 |
|---|---|---|
| **ⓐ 허용 차이 등록 — 조건부**: 말줄임 요소마다 "전체 텍스트 경로"(책 제목 → 책 상세 시트, 목록 제목 → 상세, Prompt → 세션 Prompt 목록 등)가 있으면 허용. **경로 없는 항목만** ⓑ 대상으로 분리 | 0 · 0 | Spec §8.2 통과 기준 개정("설계된 줄 수 제한 = 경로 표 대조") |
| ⓑ 텍스트 확대 시 줄 수 제한 해제 | Text spacing 은 CSS 로 감지 불가 → 사실상 **전역 해제** = Figma 줄 수 변경(393 baseline 다수 재생성). 196 폭 한정(`@media` 폭 < 320)은 393/320 baseline 0 이지만 **Figma 에 없는 규칙** 추가 | 최우선 규칙 1·2 — 디자이너 |
| ⓒ 전부 허용 차이 (조건 없음) | 0 | 경로 없는 항목이 있으면 실제 손실을 덮는다 — 비권고 |

**권고 ⓐ.** 작업: QA(또는 development-agent 감사 attachment)가 38 · 117 건을 **요소 종류별로 묶어** "전체 텍스트 경로" 열을 채운 표를 낸다 — 이 문서는 attachment(`text-resize.json`)가 디스크에 없어 항목 단위 판정을 하지 않았다. 경로 없음 = 개별 `USER_DECISION`.

#### 3.6 `VG8-G-11` — `H8-6-N6` 196×426 Activity Card 뒤집기 버튼

- 원인 가설 `[직독]` (**미검증 — Playwright 금지**): 트랙 아이템 = `flex: 0 0 100%`(트랙 content 폭), 면 = `position:absolute; inset-inline:0`. 196 폭에서 카드 내용(헤더 · 책 행 · 버튼 행)의 min-content 가 아이템 폭을 넘으면 헤더 오른쪽 끝의 뒤집기 버튼이 **면 박스 밖(다음 아이템 자리)** 으로 밀리고, DOM 상 뒤에 오는 **다음 카드 면**(`preserve-3d` 쌓임)이 그 점을 덮는다 — "2개 카드"(마지막 카드 제외)와 맞는다. 393 · 320 에서 정상인 것과도 맞는다.
- 196 폭 = 393 기기의 브라우저 줌 200% 등가이고, `H8-6-N8`(px 토큰) 때문에 root `font-size:200%` 측정이 무효에 가까우므로 **1.4.4 의 유일한 유효 측정**이다.

| 선택지 | 시각 · baseline | 비고 |
|---|---|---|
| **ⓐ 196 유지 + 진단 후 FIX** — ① 196 에서 버튼 rect ⊄ 면 rect 인지, 넘치는 행이 무엇인지 computed 로 확인 ② 넘치는 행에 `min-inline-size:0`/말줄임(`H8-6-N5` 규칙 안) 등 **393 · 320 에서 계산값이 같은** 수정만 | 393/320 baseline **0 이어야 함**(조건 — 바뀌면 멈추고 보고) | 가설이 틀리면 원인 보고 후 재판정 |
| ⓑ 196 을 감사 대상에서 제외 | 0 | 1.4.4 가 `NOT VERIFIED` 로 남는다 (`N8` 때문) |
| ⓒ 예외 등록 | 0 | 기능 손실(누를 수 없음)을 예외로 두는 것 — 비권고 |

**권고 ⓐ.** 196 은 Spec §8.2 가 정한 측정 축이므로 유지한다.

#### 3.7 `VG8-G-12` — `H8-6-N7` `P-18` · `P-22` 재제시

`[직독]` `P-18` = `--list-row-height-min` 56 — **토큰이 존재한다**(`component/index.css:160`). registry 주석(*"`P-18`~`P-22` 는 토큰 자체가 없어"*)은 `P-18` 에 대해 **사실과 다르다**. Stage 8 Spec 은 설정 목록 행 56 을 `321:1537` recipe 실측으로 쓰고 있어 Figma 근거가 생겼다. `P-22` = `conversation_only` 카드 일러스트(에셋 — 디자이너 요청 `Q16`).

| 선택지 | 비고 |
|---|---|
| **ⓐ 둘 다 재제시 포함** — `P-18` = **확정 후보**(근거 `321:1537` 행 56), `P-22` = **디자이너 대기 유지** | registry 주석 정정(development-agent) · Plan B.2-④ 문구 정정(plan-agent) |
| ⓑ 제외 — Plan 문구만 정정 | `P-18` 이 장부 밖에서 토큰으로 계속 쓰인다 |

**권고 ⓐ.** 결정 주체는 Orchestrator / 사용자(가값 재제시 절차 Stage 0 #10-4).

#### 3.8 `VG8-G-13` — `H8-6-N8` px 타입 토큰 → **기록만**

ⓐ 기록만 (**권고**) — 1.4.4 는 페이지 줌(= 196 폭 측정, §3.6)으로 충족 판정한다. ⓑ rem 전환 — 디자인 시스템 전역 변경 · 범위 밖 · 별도 승인. 기본 16px 에서는 픽셀 동일하나 전 화면 회귀 위험이 크다.

### 4. Spec 개정 (결정 후 — 이 문서 근거)

| 개정 | 위치 | 내용 |
|---|---|---|
| `VG8-G-02` | Stage 2 Spec §4.1 접근성 행 (결정 불필요 — 명세 구체화) | *"화살표 = 선택 반영(목록 유지) · Enter/선택된 칸 Space = 확정 닫힘 · Esc/scrim = 현재 값으로 닫힘(되돌림 없음)"* |
| `VG8-G-06` | Stage 7 Spec §9 `N7-37` 이름 행 | 결정에 따라 |
| `VG8-G-07` | Stage 4 Spec §2.6.3 · 4b Spec 이름 표 | 결정에 따라 (ⓑ: *Tap to recording, Start recording* · disabled 동일) |
| `VG8-G-10` | 이 Spec §8.2 통과 기준 | ⓐ 시 "설계된 줄 수 제한 = 전체 텍스트 경로 표 대조" 추가 |
| `VG8-G-08` | §5.3 신규 가값 | ⓐ 시 `P-43` 추가 · §12.3 `R8-7` |

### 5. 다음 단위로 넘길 것

- 사용자 결정: `VG8-G-06`(ⓐ) · `07`(ⓑ) · `08`(ⓐ `P-43`) · `09`(링크 ⓐ · 입력칸 ⓒ) · `10`(ⓐ 조건부) · `11`(ⓐ) · `12`(ⓐ) — 괄호 = 권고.
- development-agent: 결정 전 **FIX 0**. 결정 후 — 이름 2건(baseline 0) · TextLink hit modifier(baseline 0, Shared UI API 승인 필요) · 196 진단(393/320 baseline 0 조건).
- QA: `VG8-G-01` 포인터 열림 시 `Back` 링 비표시 · `VG8-G-02` `SelectTrigger` 와 `ReadingContextSheet` 두 경로 같은 키 시나리오 · `VG8-G-09` ⓐ 겹침 프로브 · `VG8-G-10` 말줄임 경로 표.

---

## S8-I

프리뷰 빌드 · 표지 중립 대체 단위 (`docs/qa/stage-8-handoff.md` H8-7). 검토일 2026-11-21. **Playwright 미실행** (지시 — 다른 lane 동시 실행). 근거 = Plan rev 2.2 `N8-13` ⓐ · `D8-1` · Spec §13 (`S8-I` = "UI 영향 없음 확인" — 실제로는 **표지 면 교체**가 있어 이 절에서 분해) · Stage 3 Library Spec §11.4 (`L-D4` · `P3-BIP-19`).

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[git]` | `git status` · `git show HEAD:<baseline>` (HEAD 판 = S8-I 이전) · `find e2e/__screenshots__ -newer neutral-cover-teal.png` | 바뀐 baseline 목록 · S8-I 이전 판 |
| `[px]` | 스크래치 스크립트(PIL · numpy): HEAD ↔ 현재 채널차 > 5 마스크 → 2px 팽창 연결성분 → 성분별 bbox · 변화 픽셀 수 · **현재 판 bbox 안 최빈색** | 21장 전부 |
| `[png]` | HEAD · 현재 · 마스크 3단 육안 | `s3-library-book-sheet` · `s3-library-shelf-sheet` · `s3-library-favorites-empty` · `s3-home` · `s4-session-recording` |
| `[asset]` | 표지 PNG 색 수(`getcolors`) · 크기 | `neutral-cover-{teal,orange,indigo}.png` |
| `[직독]` | `primitive/color.css` · `semantic/color.css` · `book-covers/index.ts` · `saved-books.ts`(diff) · `assets-optimize.mjs` `COVER_SPECS` · Stage 3 Spec §5.3 `BookCover placeholder` · Stage 4 Spec `T-5` | 색 출처 · 대체 표지 언어 |

Figma 는 이번에 **다시 조회하지 않았다** — 표지 **틀**(크기 · radius · 그림자 · 위치)은 `BookCover` · 책 칩 코드 변경 0(`git status` — `entities/book` · `packages/ui` 표지 관련 diff 0)이고, 바뀐 것은 Figma 에 원래 **상용 이미지 fill** 로만 있던 면이다. 이 면의 대체 모양에는 비교할 Figma 값이 **없다**.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | 사용자 결정 |
|---|---|---|---|---|
| `VG8-I-01` | 표지 틀(크기 · 비율 · radius · 그림자 · 위치) | **OK** — 변화 0 | — | 불필요 |
| `VG8-I-02` | 중립 표지 **모양**(palette 단색 · 무늬 · 글자 0) — Figma · Spec 없음 | ~~USER_DECISION~~ → **닫음 (`D8-4`, 2026-11-21)** — ⓐ 현행 유지 + ⓓ 디자이너 요청 병행(Stage 8 Spec §12.3 `R8-8`) | Low | 결정됨 |
| `VG8-I-03` | 표지 색 = palette 원시값 | **OK** | — | 불필요 |
| `VG8-I-04` | 바뀐 baseline 21장 — 표지 교체로만 설명되는가 | **OK — 21/21 설명됨** (§2) | — | 불필요 |
| `VG8-I-05` | teal 표지가 주 버튼색 · Self-Direction 테마색과 같다 | **관찰** — `VG8-I-02` 선택지 ⓑ 로 흡수 | Low | (`VG8-I-02` 와 함께) |
| `VG8-I-06` | 대체 표지 언어 2종 공존(이니셜 placeholder ↔ 단색) | **관찰 (조치 0)** | Low | 불필요 |
| `VG8-I-07` | 실제 책 **제목 · 저자**가 Figma 값 그대로 프리뷰에 노출 | **기록만** — 법무 `P3-BIP-19` | — | (법무 · 사용자) |
| `VG8-I-08` | 상용 표지 "4종" ↔ 저장소 3개 · git 이력 잔존 | **기록만** — design 판단 대상 아님 | — | (plan-agent · Orchestrator) |

**FIX (development-agent 즉시 작업) = 0.** 신규 토큰 · 컴포넌트 · 아이콘 · `overflow` 0 (handoff H8-7.8 · `[직독]`).

### 2. `VG8-I-04` — baseline 21장 분해 (`R-BASELINE-1` ⑤) `[git][px][png]`

- **목록 일치**: 작업 트리에서 HEAD 대비 바뀐 baseline 28장 중 **표지 PNG 생성 시각(03:03) 이후** 바뀐 것 = **정확히 21장** `[git]` — handoff H8-7.4 의 21장과 1:1. 나머지 7장(`s6-settings*` 3 · `s2-onboarding-childinfo*` 3 · `s3-dialog-scrim`)은 01:11–01:14 = S8-B~F 산출물(S8-B §2 · S8-F 에서 분해 완료)이다. 따라서 21장의 HEAD 판 = S8-I 직전 판이다.
- 크기 변화 0 (21장 모두 HEAD 와 같은 W×H).

| 묶음 | 파일 (현재 판 W×H) | 성분 `[px]` | 최빈색 (현재 판 bbox 안) | 설명 |
|---|---|---|---|---|
| Activity Card | `s3-home` · `s4-home-offline-cached-393` · `-320` (393/320×852) · `s3-home-deck` · `-deck-scrolled` (345×434) | **1개** · 62×86 · 4,687px (5장 동일) | teal 86% · *scrolled* = orange 86% | 카드 표지 58×82 + 그림자 가장자리. 스크롤 판은 다음 책(orange) |
| Library 본면 | `s3-library` · `-favorites-empty` (393×852) · `-shelf` (345×219) · `-list` (345×299) · `-reading-now` (345×118) | 캐러셀 111×155 ×3(× 2행) · 목록 38×52 ×3 · Reading now 68×94 · *favorites-empty* 탭바 밑 40×56 · 38×11 | palette **3색 각각** 77–95% | 표지 3크기(107×151 · 64×90 · 34×48)+그림자. 탭바 밑 성분 = **유리 탭바 blur 뒤로 비친 표지** (`[png]` 확인 — 탭바 자체 변화 아님) |
| Library 시트 | `s3-library-shelf-sheet` (365×798) · `-book-sheet` (365×560) · `-book-sheet-back` (365×503) | shelf-sheet: 목록 38×52 ×3(palette 3색) + 시트 오른쪽 가장자리 13×154 ×2 · book-sheet: **37개**(최대 111×141) · back: 4개 · 97px | 시트 면색(`f1f2f3`·`eff2f2`·흰색) | 반투명 시트 · blur **뒤** 서재 캐러셀 표지가 바뀌어 시트 면 · 글자 AA 가 따라 바뀜. book-sheet 의 시트 **안** 표지(58×82)도 teal 로 교체 `[png]` — 텍스트 · 칩 · 버튼 모양 변화 0 |
| 세션 책 칩 | `s4-session-recording` · `-paused` · `s4-session-background-notice` (393×852) · `s4-session-recording-320` (320×852) | **1개** · 20×26 · 350px — 393 은 x 98, 320 은 x 62 | teal 63% | 칩 표지 16×22 + 그림자 |
| 세션 오버레이 | `s4-prompt-drawer` (393×852) · `s4-session-prompts` (393×852) · `s4-reading-context-sheet` (393×459) · `s4-session-discard-dialog` (321×240) | 1개씩: 20×26 · 20×25 · 62×43 · 20×7(23px) | `587e78` · `f3f9f8` · `eff2f2` · `eff2f2` | 같은 칩 자리가 scrim/시트/Dialog **뒤**에 있다. `587e78` = teal × 0.66(세 채널 같은 비 — 균일 scrim) · discard-dialog 성분 x 62 = 칩 x 98 − Dialog 오프셋 36((393−321)/2) — **위치 산수 일치** |

- 21장 모든 성분이 **표지 자리 또는 표지가 비치는 반투명 면 뒤**에 있다. 설명되지 않는 성분 **0** → `R-BASELINE-1` ⑤ 통과.
- 런타임 토글(⑥)은 구현자가 수행(상용 표지 복원 → 실패 20건 `--last-failed` 20 passed) — **참고로만 인용**, 나는 재현하지 않았다(Playwright 금지). 내 근거는 위 성분 위치 · 최빈색이다.

### 3. `VG8-I-01` · `VG8-I-03` — 틀 · 색 `[asset][직독][px]`

- 표지 PNG 3개 = **216×309**(7:10, `--book-cover-aspect` · `D-4` 상한 216) · **색 수 1** — 무늬 · 글자 · 그라데이션 0 `[asset]`.
- 픽셀값 `(133,191,182)` · `(238,210,189)` · `(169,182,207)` = `--haru-palette-teal #85bfb6` · `-orange #eed2bd` · `-indigo #a9b6cf` 와 **정확히 일치**. 이 palette 는 Figma `17:129` accents 선언값이다 — 색 자체는 Figma 출처 `[직독]`.
- 성분 bbox 가 HEAD/현재 같은 자리 · 같은 크기(예: 캐러셀 111×155 ×3 이 같은 x 에서 교체) → 틀 변화 0. 생성 스크립트가 색을 `primitive/color.css` 에서 읽는다 — HEX 재기재 0.

### 4. `VG8-I-02` — 중립 표지 모양 → **USER_DECISION**

사실: Figma 의 표지는 상용 이미지 fill 뿐이고, Spec 은 "중립 대체"(`N8-13` ⓐ)만 정했지 **모양을 정하지 않았다**. 구현자의 선택(palette 단색)은 최소 해석이지만 **Figma 에 없는 시각 요소**다 → 최우선 규칙 2 에 따라 사용자 확인.

관찰 `[png][직독]`:
- (`VG8-I-05`) teal = `--color-action-primary-bg`(Start Session · Home 탭) = `--color-growth-theme-agency`(Self-Direction). Home 카드에서 **Emotion Regulation(분홍 태그) 책에 teal 표지**가 붙는다 — 색 코딩으로 읽힐 여지는 작지만 0 은 아니다. orange · indigo 는 테마/동작색과 겹치지 않는다.
- (`VG8-I-06`) 표지 없는 책은 기존 `BookCover placeholder`(tinted 면 + 이니셜, Stage 3 Spec §5.3) — shelf sheet 에 **단색 3개 + 이니셜 6개**가 섞인다. 둘 다 "표지 자리" 로 읽혀 혼동은 낮다. (*Where the Wild Things Are* 가 teal · `WT` 두 번 나오는 것은 S8-I 이전부터의 fixture 중복 — 표지 교체와 무관.)
- 무늬 · 글자가 없어 Skeleton(로딩)과 구별되는가: Skeleton 은 무채색 · 애니메이션, 표지는 palette 유채색 · 정지 — 구별됨.

| 안 | 내용 | 시각 · baseline | 비용 |
|---|---|---|---|
| **ⓐ (권고)** 현행 유지 — palette 단색 teal/orange/indigo | 변화 0 | 0. 실제 표지(서버 `coverUrl`)가 오면 Mock 디렉토리째 사라진다 — 실제 표지도 색이 임의라 색 신호 문제는 Mock 고유가 아니다 |
| ⓑ teal 만 테마/동작색이 아닌 palette 로 교체(예: `--haru-palette-yellow` · `-brown`) | teal 표지(또는 그 비침)가 담긴 baseline 재생성 — 위 21장 중 **대부분**(orange 만 담은 `s3-home-deck-scrolled` · `s3-library-reading-now` 등 제외) | `COVER_SPECS` 1줄 + `assets:optimize` + `--update-snapshots=all` + 분해 1회 |
| ⓒ `coverUrl = null` → 기존 이니셜 placeholder 로 통일 | Library · Home · 세션 칩 전부 변경, 세션 칩은 `T-5` 그라디언트 | **비권고** — 프리뷰에서 "이미지 표지가 있는 책" 경로가 사라져 실서비스 모양과 멀어지고 Mock 의미(`coverUrl` = 서버 URL)가 바뀐다 |
| ⓓ 디자이너에게 Mock/데모용 중립 표지 요청 (`R8-8` 신설 제안 — `R8-7` 은 `VG8-G-08` `P-43` 이 선점) | 도착 시 교체 | ⓐ · ⓑ 와 **병행** 가능 |

**결과 (`D8-4`, 2026-11-21): ⓐ + ⓓ 병행 채택 — 닫음.** 요청서 = Stage 8 Spec §12.3 `R8-8`.

**권고: ⓐ + ⓓ 병행.** 근거: ① 새 시각 언어를 만들지 않는 가장 작은 해석이고 색이 Figma palette 다 ② Mock 전용이라 Backend 연동 시 전부 교체된다 ③ teal 겹침(`VG8-I-05`)이 신경 쓰이면 ⓑ — 비용이 baseline 재생성뿐이다. 결정 전 코드 변경 0.

### 5. 기록만

- `VG8-I-07` — 책 **제목 · 저자**(*Where the Wild Things Are* · *The Most Magnificent Idea* · *Grumpy Monkey: Play All Day* 및 서재 목록의 실제 도서명)가 Figma 값 그대로 프리뷰에 나간다. `N8-13` 결정 범위가 **표지**에 한정돼 구현자가 유지했다(H8-7-N4). 제목 노출 가능 여부는 법무 `P3-BIP-19` 와 함께 확인할 사항이며 **design 판단 대상이 아니다**. 바꾸게 되면 fixture 문자열만 바뀌고 레이아웃 규칙(말줄임 · 줄 수)은 그대로다 — 단 글자 길이가 달라 baseline 재생성은 필요하다.
- `VG8-I-08` — Plan "상용 표지 4종" ↔ 저장소 3개(H8-7-N1): Stage 3 Library Spec §11.4 가 Figma 에서 6개(*After the Fall* `113:1979` 등)를 실측했으나 저장소에 export 된 것은 3개뿐 — Plan 문구 정정은 plan-agent. git 이력 잔존(H8-7-N3)은 Orchestrator · 사용자.
- `assetsInlineLimit` 로 프리뷰도 파일 URL — 시각 영향 0 (같은 PNG).

### 6. Spec 개정

없음 — 결정 후 `VG8-I-02` 결과를 Stage 8 Spec §12 에 기록한다(ⓓ 채택 시 §12.3 `R8-8`).

### 7. 다음 단위로 넘길 것

- 사용자 결정: `VG8-I-02` (권고 ⓐ + ⓓ 병행 · teal 겹침이 문제면 ⓑ).
- development-agent: 결정 전 **0**. ⓑ 선택 시 `COVER_SPECS` teal 교체 + baseline 재생성 + 연결성분 분해.
- plan-agent: `VG8-I-08` 문구 ("4종" → 3개). 법무: `VG8-I-07` (`P3-BIP-19`).
- QA: 21장 분해는 이 절 표로 대조 가능 — 토글 재현(⑥)은 QA 가 독립 수행 권장.

---

## S8-H

`D8-3` 반영(H8-8) · 반응형 · 회귀 · baseline 단위(H8-9) 검토 (`docs/qa/stage-8-handoff.md`). 검토일 2026-11-21. **Playwright 미실행** (지시). 근거 = Plan rev 2.3 · Spec (`APPROVED`, `D8-1`) §8.2 · §9.3 · 결정 `D8-3` · `D8-4`.

### 0. 측정 방법 (`R-FIGMA-1` ⑤)

| 표기 | 도구 | 대상 |
|---|---|---|
| `[ctx]` | Figma `get_design_context` 선언값 (2026-11-21 라이브) | `163:2649`(Activity Card `86:396` — Cardtitle `85:593` · Tag `I85:593;85:585`) · `298:1227`(Record Control `Paused`) |
| `[meta]` | Figma `get_metadata` | `163:1589` Record · `298:1227` Paused · `298:1261`(추가 변형 프레임) |
| `[diff]` | `git diff` 직독 | `activity-card.css` · `packages/ui/src/link/TextLink.{tsx,css}` · `TextLink.test.tsx` |
| `[직독]` | CSS · 컴포넌트 · 토큰 | `Tag.{tsx,css}` · `ActivityOptionCard.tsx` · `base.css`(focus ring) · `component/index.css` · `layout.css` · `e2e/text-link-hit.spec.ts` |

구현자 실측(Tag 폭 140.3 · 196 scrollWidth 186 · 바이트 동일 토글 · `=all` 변화 0)은 **참고로만 인용** — 나는 재현하지 않았다.

### 1. 결과 요약

| ID | 항목 | 판정 | Severity | 사용자 결정 |
|---|---|---|---|---|
| `VG8-H-01` | 196 폭 Activity Card 역량 Tag 축소 + 말줄임 ↔ Figma Tag 명세 | **OK** — Figma 정의 폭(393 · 320) 변화 0, Tag 선언값 불변 | — | 불필요 (`D8-3` ⓐ 범위) |
| `VG8-H-02` | 말줄임된 역량 라벨의 **전체 텍스트 경로** (`H8-6-N5` 대조표 편입) | **QA 확인 필요** | Low | 경로 없음이면 개별 결정 |
| `VG8-H-03` | Tag 글자 span `overflow` — `R-SHADOW-1` | **OK** | — | 불필요 |
| `VG8-H-04` | `TextLink hitArea="touch"` 시각 변화 0 | **OK (rest)** · focus 상태 QA 확인 1건 | Low | 불필요 |
| `VG8-H-05` | `H8-9-N1` 852×393 하단 TabBar 가 화면 약 ⅓ 덮음 | **OK — 기록만** (규칙상 정상) | Low | 불필요 |
| `VG8-H-06` | `D8-3-N1` paused 캡션 실측 · S8-G §3.2 오기 정정 | **정정 완료** → `D8-4` 로 결정됨 | — | 결정됨 (`D8-4`) |
| `VG8-H-07` | `D8-3-N2` permission-denied *Mic is off* ↔ *Microphone is off* | **기록 — 결정 필요 시 제시** | Low | (Orchestrator 판단) |
| `VG8-H-08` | Figma Paused/Disabled/PermissionDenied 가 **`[DRAFT]` 프레임**에 있음 | **기록만** | Info | 불필요 |

**FIX (development-agent 즉시 작업) = 0.** `D8-4` 이름 개정(paused)은 결정 반영 작업이다(아래 §5).

### 2. `VG8-H-01` — 역량 Tag 축소 + 말줄임 `[ctx][diff][직독]`

Figma 선언 (`163:2649` 안 `85:593` Cardtitle):

| 항목 | Figma | 구현 (S8-H 이후) |
|---|---|---|
| Cardtitle 행 | `flex` · `justify-between` · 폭 329 · Tag 슬롯 221×26 + Icon 24 | 헤더 `flex` · `space-between` · gap 12 (변화 0) |
| Tag 면 | 배경 `accents/green` · padding 13 / 7 · radius 100 · **hug** | `--activity-card-tag-pad-inline` 13 · `--tag-height-sm` 26 · pill — **변화 0** (선언은 `.haru-tag` 바깥 상자가 아니라 **글자 span** 에만 추가) |
| 라벨 | SF Pro Semibold 590 · 12 / 12 · white · 한 줄 | 변화 0 |
| 말줄임 · 고정 폭 | **선언 없음** (`text-overflow` · `truncate` 0 — Figma 정의 폭에서 글자가 늘 들어간다) | 헤더 안 Tag 에만 `min-inline-size: 0` + 글자 span `overflow: hidden` · `text-overflow: ellipsis` |

판정 **OK**:
- Figma 는 **196 폭 레이아웃을 정의하지 않는다**(프레임 393, 저장소 최소 320). 393 · 320 에서는 Tag 글자 폭(≈140)이 남는 폭보다 작아 **축소가 일어나지 않는다** → 계산된 배치 동일(구현자 바이트 토글 · `=all` 변화 0 — 참고). 196 의 말줄임은 Figma 값을 바꾸는 것이 아니라 **Figma 가 정의하지 않은 폭에서 기능(뒤집기 버튼)을 지키는 규칙**이며, `D8-3` `H8-6-N6` ⓐ("넘치는 행에 `min-inline-size:0`/말줄임 — 393 · 320 계산값 같은 수정만")의 승인 범위 안이다.
- 선택자가 `.haru-activity-card__header > .haru-tag` 로 한정 — `packages/ui` Tag API · Stage 1 Spec §4.15 · 다른 화면 Tag(성장 · 리포트 · `PromptPill` 배지) 변화 0 `[직독]`.
- 글자 span 의 `padding: --space-0-5` + `margin: −padding`: inline/block 양 축 모두 margin box 크기가 원래 content 와 같아 **바깥 Tag 크기 · 글자 위치 불변**, 클립 선만 2px 바깥 `[계산]`. 말줄임 기호는 줄 상자(content) 끝에서 걸린다.
- 196 에서 남는 폭 `[계산 — 구현자 수치 인용]`: 헤더 내용 132 − 뒤집기 24 − gap 12 = Tag **96** → 글자 칸 96 − 13×2 = **70**. 4역량 라벨(*Self-Direction* · *Emotion Regulation* · *Cognitive Flexibility* · *Intrinsic Motivation*) **전부** 말줄임된다.
- Spec 반영: Stage 3 Spec §5.2 `CapabilityBadge` 에 "좁은 폭" 행 추가(이 문서 근거).

### 3. 나머지 판정

#### 3.1 `VG8-H-02` — 전체 텍스트 경로 → **QA 확인**

`D8-3` `H8-6-N5` ⓐ 조건(말줄임 요소마다 전체 텍스트 경로)이 이 Tag 에도 적용된다. 접근성 트리에는 전체 라벨이 있다(`accessibleLabel` 미사용 → 글자 span 이 이름) `[직독]`. **보이는 경로**(카드 뒷면 · Prompt 시트 · 세션 화면 등 196 폭에서 역량명이 전부 보이는 곳)는 확인하지 않았다 — QA 의 `H8-6-N5` 대조표에 **"Activity Card 역량 Tag (196)"** 행으로 넣어 판정. 경로가 없으면 개별 `USER_DECISION`(선택지: 허용 차이 등록 / 196 폭에서 Tag 를 2줄 허용 — 후자는 Figma 26 높이 변경이라 비권고).

#### 3.2 `VG8-H-03` — `R-SHADOW-1`

Figma Tag `I85:593;85:585` 에 effect **없음** `[ctx]` → 잘릴 그림자 없음. 글리프 잉크(내림획 · AA)는 ② 방식 inset 으로 보호, 근거 주석 + 세로 · 가로 프로브(`e2e/shadow.spec.ts` +3)가 있다(⑥ 충족, 구현자 실행 — 참고). **OK.**

#### 3.3 `VG8-H-04` — `TextLink hitArea="touch"` 시각 변화 0 `[diff][직독]`

- 추가 선언 = `position: relative`(오프셋 0 → 배치 불변) + `::before { position:absolute; inset: min(0%, (100% − 44)/2); content:'' }` — 배경 · 테두리 · 그림자 0 (단위 테스트가 금지 속성 부재를 단언). 색 · 글자 · 밑줄 · tone 클래스 그대로. 사용처 3곳 모두 `tone` 기본(`default`) — `subtle` 의 `::before` 와 병용 0.
- `min(0%, …)` 로 글자 상자가 44 이상인 축은 넓히지 않는다(이웃 쪽 불필요한 번짐 0). TextLink 는 `inline-flex`(한 줄 상자)라 `%` 기준이 명확하다.
- **확인 1건 (QA, Low)**: `e2e/text-link-hit.spec.ts` 의 바이트 토글은 **rest 상태**만 찍는다 `[직독: 113–120행]`. 포커스 링은 `outline`(`base.css` `.haru-focus-ring:focus-visible`)이라 원칙상 border box 기준이지만, 엔진에 따라 절대 위치 자손을 outline 범위에 넣는 경우가 있다 — **`:focus-visible` 상태에서도 토글 바이트 동일**인지 QA 가 1회 확인. 다르면(링이 44 상자로 커지면) Stage 8 Spec §9.3 "포커스 링 위치 변화 0" 조건 위반 → FIX 대상.

#### 3.4 `VG8-H-06` — paused 캡션 실측 `[meta][ctx]` → S8-G 오기 정정

| 변형 | 노드 | 캡션 | 이름 (결정 후) |
|---|---|---|---|
| Record (`idle`) | `163:1589` | `140:2854` *Tap to recording* (35,88) 79×12 | *Tap to recording, Start recording* (`D8-3`) |
| Pause (`recording`) | `163:1588` | **없음** (Stage 4 Spec §2.6.2 실측) | *Pause recording* (변화 0) |
| **Paused** | **`298:1227`** | **`298:1231` *Tap to resume*** — (40.5,88) 69×12 · SF Pro Medium 510 · 10 · white(`color/white/solid`) · 가운데(x75) | ***Tap to resume, Resume recording*** (`D8-4`) |
| Disabled | `298:1236` | *Tap to recording* | `idle` 과 같음 (`D8-3`) |
| PermissionDenied | `298:1245` | *Mic is off* | *Microphone is off* (변화 0 — `VG8-H-07`) |

S8-G §3.2 의 *"`recording` · `paused` 변형은 Figma 캡션이 없어"* 는 **사실 오기**였다 — 4b Spec §2.5 표에 *Tap to resume* 이 이미 기록돼 있었다. 그 절에 정정 표기했다. 선택지 · 권고는 `D8-4` 결정으로 불필요(같은 규칙 적용). Spec 개정: Stage 4 Spec §2.6.3 · 4b Spec §9.1 접근성 이름 행.

#### 3.5 `VG8-H-07` — `D8-3-N2` *Mic is off* ↔ *Microphone is off* (기록)

캡션 문자열이 이름에 들어 있지 않다(*Mic* ≠ *Microphone*) → 2.5.3 기준상 같은 유형. 이름은 `S4B-Q9`/`D4` 승인 문구이고 axe 정류장이 없어 실측 경고는 없다. 결정이 필요하면: ⓐ 이름 = *Mic is off* (캡션 = 이름, 의미 동일 · 중복 낭독 없음 — **권고**) ⓑ *Mic is off, Microphone is off* (같은 규칙 — 같은 뜻 두 번 읽음) ⓒ 현행 유지 + 기록. 세 안 모두 시각 · baseline 0. 승인 문구 변경이라 사용자 결정 사항이다.

#### 3.6 `VG8-H-08` — Figma 추가 변형의 지위 (기록)

`298:1227` · `298:1236` · `298:1245` 는 프레임 **`298:1261` "Record Control — [DRAFT] 추가 변형 (Claude 2026-10-25)"** 안에 있다 `[meta]` — 디자이너 확정본이 아니라 초안 프레임이다. 4b Spec 승인(`D4-58`)으로 기준이 되었으므로 판정은 바뀌지 않지만, *Tap to resume* · *Mic is off* 캡션 문구가 바뀌면 `D8-3` · `D8-4` 이름도 함께 바뀌어야 한다(디자이너 확정 시 재확인).

#### 3.7 `VG8-H-05` — `H8-9-N1` 852×393 TabBar ⅓ → **OK, 기록만**

- TabBar = `--layout-tabbar-height` 70 + 하단 간격 16 + 가운데 Home 64(위로 돌출) `[직독]` — 393 높이의 약 ¼~⅓(구현자 관찰 ⅓ — 참고).
- Figma 에 **가로 화면이 없다.** 규칙(`rules/frontend.md` §9, Stage 0 #12): 앱은 세로 고정, 웹 가로는 앱 컬럼으로 표시. 852×393 은 그 규칙의 결과이며 Figma 값(TabBar 70 · Home 64 · 유리 면)을 그대로 쓴다.
- 기능: 모든 인터랙티브가 스크롤로 도달 · 중심점 hit (`responsive-routes` ④ — 참고) → 1.4.10 Reflow 손실 없음.
- 짧은 높이에서 TabBar 축소 · 숨김은 **Figma 에 없는 규칙**(최우선 규칙 2)이라 제안하지 않는다. 사용자가 원하면 디자이너 요청 사항.

### 4. Spec 개정 (이 문서 근거)

| 개정 | 위치 | 내용 |
|---|---|---|
| `VG8-H-01` | Stage 3 Spec §5.2 `CapabilityBadge` | "좁은 폭" 행 — Activity Card 헤더 안에서만 말줄임, 393 · 320 변화 0 |
| `D8-3` · `D8-4` | Stage 4 Spec §2.6.3 · 4b Spec §9.1 | 접근성 이름 — `idle`/`disabled` *Tap to recording, Start recording* · `paused` *Tap to resume, Resume recording* |
| `D8-3` (`D8-3-N4`) | `COMPONENT_MAP.md` TextLink 행 · Stage 2 Spec §4.6 props 행 | `hitArea?: 'text' \| 'touch'` (기본 `'text'`) · 사용처 3곳 |
| `D8-4` | Stage 8 Spec §12.3 · 개정 이력 | `R8-8` 데모용 중립 표지 요청 · `VG8-I-02` 닫음 |
| `VG8-H-06` | 이 문서 S8-G §3.2 | paused 캡션 오기 정정 |

### 5. 다음 단위로 넘길 것

- development-agent (`D8-4`): paused 이름 *Tap to resume, Resume recording* — copy 상수 1곳 + exact 이름 테스트 갱신(부분 일치 *Resume recording* 쿼리는 그대로 통과 예상) · 감사 `AXE_PENDING['session-paused']` 제거. 시각 · baseline 0.
- QA: `VG8-H-02` 역량 Tag(196) 전체 텍스트 경로 대조표 행 · `VG8-H-04` `:focus-visible` 상태 토글 바이트 동일 1회.
- Orchestrator: `VG8-H-07`(*Mic is off*) 결정 필요 여부.
