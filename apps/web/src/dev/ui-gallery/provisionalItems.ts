/**
 * 가값(provisional) 승인 자료 목록 — Plan §17-3 · Design Spec §12.3.
 *
 * **표의 `status` 는 사용자 결정 결과를 그대로 옮긴 것이다.** gallery 는 판단 자료를 제시할 뿐이고
 * `유지 / 수정 / 디자이너 대기` 결정은 Orchestrator 가 항목별로 받는다 (Stage 0 #10-④).
 *
 * 값의 단일 기준은 `packages/design-tokens` 의 `provisional` 주석과
 * `docs/decisions/stage-0-approvals.md` §4 이다. 여기에는 "어디를 보고 판단하는가" 만 적는다.
 *
 * 확정 12건 (`docs/decisions/stage-1-approvals.md` §9.1 의 10건 + §9.3 `P-10`, 2026-09-22·23 user
 * + `stage-3-approvals.md` §20.2 `P-05`, 2026-10-06 user):
 *   P-03 · P-05 · P-06 · P-07 · P-08 · P-09 · P-10 · P-11 · P-12 · P-13 · P-14 · P-15
 * 디자이너 대기 7건: P-01 · P-02 · P-04 · P-16 · **P-17**(Stage 2 신규 — 결정 `D-14`)
 * + **P-23**(Stage 3 Home 라운드 신규 — approvals §9.2 ⑫, `QA-3-006` 으로 등재)
 * + **P-24**(Library 1라운드 신규 — `stage-3-approvals.md` §20.4).
 *
 * Stage 8 `S8-G` (Plan 부록 B.2-④ · `S3-PROV-2` 잔여) — 미등재 6건 `P-19` · `P-21` · `P-26`~`P-29` 와
 * Stage 8 신규 `P-41` · `P-42` 를 등재했다. `D8-3` 으로 `P-43` 을, `D8-4` (`D8-3-N3`) 로 `P-18` · `P-22` 를
 * 추가 등재했다. **등재는 결정이 아니다** — `#10-4` 항목별 재제시(`S8-K`)의
 * 선행 조건이며, `stage-0-approvals.md` §4 등재는 Verdict 때 사용자 확정 후다 (Plan §9 `P-42` 행).
 */

/** 사용자 결정 상태. `confirmed` 는 값 변경 없이 확정된 항목이다. */
export type ProvisionalStatus = 'confirmed' | 'waiting';

export interface ProvisionalItem {
  readonly id: string;
  readonly title: string;
  readonly adopted: string;
  readonly where: string;
  readonly status: ProvisionalStatus;
  /** 확정 일자 또는 대기 사유. */
  readonly decision: string;
}

export const PROVISIONAL_ITEMS: readonly ProvisionalItem[] = [
  {
    id: 'P-01',
    title: '보조 텍스트 색 --color-fg-secondary',
    adopted: 'Figma text-secondary 유지 (--haru-ink-500)',
    where: '/a11y 대비표 · TabBar 비선택 라벨 · TextField helper',
    status: 'waiting',
    decision:
      '디자이너 대기 — AA 미달 확인, Figma 값 유지 (approvals §9.2). --color-fg-tertiary 는 P-24 로 분리됐다',
  },
  {
    id: 'P-02',
    title: '비텍스트: 진행 바 · 별점 · 칩 경계 · 배지 글자',
    adopted: 'Figma 값 유지',
    where: '/a11y 대비표 · /components ProgressBar · Tag',
    status: 'waiting',
    decision: '디자이너 대기 — 비텍스트 대비, Figma 값 유지 (approvals §9.2)',
  },
  {
    id: 'P-03',
    title: 'focus ring 색 · 굵기 2 · offset 2',
    adopted: '--haru-ink-700 / 2px / 2px',
    where: '/a11y focus 순회 (white · glass · accent 3배경)',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-04',
    title: 'status 색 (info / success / warning / error)',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/components InlineAlert 5 tone · Toast · 필드 에러',
    status: 'waiting',
    decision: '디자이너 대기 — status 색 (approvals §9.2)',
  },
  {
    id: 'P-05',
    title: 'scrim',
    adopted: '순검정 34% — Figma 실측 (145:1450 · 163:1807 7점 최소제곱)',
    where: '/components Sheet · Dialog scrim',
    status: 'confirmed',
    decision:
      '확정 2026-10-06 — 근거가 TOKEN_MAP 제안값에서 Figma 실측값이 되어 가값 해제 (stage-3-approvals §20.2 L-NEW-09)',
  },
  {
    id: 'P-06',
    title: 'z-index 스케일',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/tokens z-index 표 · Sheet<Dialog<Toast 중첩',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-07',
    title: 'motion duration / easing',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/tokens motion 표 · reduced-motion 비교',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-08',
    title: 'safe-area inset 토큰',
    adopted: 'env(safe-area-inset-*)',
    where: '/responsive 프레임',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-09',
    title: '아이콘 크기 16 / 20 / 24',
    adopted: '3단계 + 탭 21 예외',
    where: '/components Icon 3단계',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-10',
    title: '공통 상태 화면·컴포넌트 상태 디자인',
    adopted: 'design-agent 명세 (#22)',
    where: '/states 6종 전체',
    status: 'confirmed',
    decision: '확정 2026-09-23 (approvals §9.3 — 실기기 확인)',
  },
  {
    id: 'P-11',
    title: 'glass·tinted 위 라벨 대비 (D-01 범위 밖)',
    adopted: 'Figma 값 유지',
    where: '/a11y 대비표 · Glass Button · Chip 라벨',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-12',
    title: '--radius-surface 22 vs 24',
    adopted: '22 유지',
    where: '/tokens radius · SpeechBubble · TextField',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-13',
    title: '--layout-gutter 24 vs 26',
    adopted: '24 유지',
    where: '/responsive 320 · 393 프레임',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-14',
    title: 'gradient stop 46% vs 52%',
    adopted: '46% 유지',
    where: '/tokens gradient swatch',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-15',
    title: '--size-button-lg 56 vs 58',
    adopted: '56 유지',
    where: '/components Button md 45 / lg 56',
    status: 'confirmed',
    decision: '확정 2026-09-22 (approvals §9.1)',
  },
  {
    id: 'P-16',
    title: 'medallion 136 / 188 / 232 + ring offset 8',
    adopted: '변경 없음 (컴포넌트는 Stage 2)',
    where: '/tokens size swatch',
    status: 'waiting',
    decision: '디자이너 대기 — sm/md 실측 근거 없음 (approvals §9.2)',
  },
  {
    id: 'P-17',
    title: 'TextField trailingAction — 밑줄 없이 색만으로 구분 (Show / Hide)',
    adopted: '밑줄 제거 (Figma 76:417 · 76:428 일치, 결정 D-14)',
    where: '/components TextField trailing · /a11y 대비표',
    status: 'waiting',
    decision:
      '디자이너 대기 — Stage 2 신규 (stage-2-approvals §4 D-14). 보완: 라벨이 상태를 전달 + aria-pressed + hit area 44',
  },
  /*
    Home 라운드 신규 — Library 범위 밖이라 1라운드가 등재하지 않았다 (`S3-PROV-2` · `QA-3-006`).
    `P-18`~`P-22` 의 등재 상태는 항목마다 다르다 (`D8-3` `H8-6-N7` 사실 정정 · `D8-4` 등재):
    `P-18` = **토큰이 존재한다**(`--list-row-height-min` 56, `packages/design-tokens/src/component/index.css`)
    — `provisional` 주석이 없을 뿐이며 Stage 8 Spec 이 설정 목록 행 56 을 `321:1537` 실측으로 쓴다(확정 후보) ·
    `P-20` = `--toggle-*` 확정 · `P-22` = `conversation_only` 카드 일러스트(**에셋** 가값 — 토큰 아님, 디자이너 대기) ·
    `P-19` · `P-21` = 후보 토큰(주석 없음). `D8-3` 으로 `P-18` · `P-22` 는 Final QA 가값 재제시(`S8-K`)에
    **포함**된다. ⚠ Stage 8 `S8-G` 가 Plan 부록 B.2-④ 에 따라 그중 `P-19` · `P-21` 을, `D8-4` 가
    `P-18` · `P-22` 를 **재제시 자료로** 등재했다(아래) — 토큰 주석 없음은 그대로다(`P-20` 만 미등재 — 확정). 활성 가값은 `P-01 · P-02 · P-04 · P-16 · P-23 · P-24 · P-25 · P-30~33 · P-35~39` 다 (`P-40` 은 JS 규칙)
    (`packages/design-tokens/__tests__/fonts.test.ts` 가 그 목록을 고정한다).
  */
  /*
    Stage 2 · 3 후보 2건 — `stage-3-approvals.md` §10.2 "재제시 목록에 없다" (`S3-PROV-2` 잔여, Stage 8 `S8-G` 등재).
    둘 다 **토큰에 `provisional` 주석이 없다**(후보로만 기록) — 재제시 때 유지 / 수정 / 디자이너 대기를 받는다.
  */
  /*
    `D8-4` (`D8-3-N3`) 등재 — 토큰은 있으나 `provisional` 주석이 없다(`H8-6-N7`). 확정 여부는 재제시(`S8-K`)에서.
  */
  {
    id: 'P-18',
    title: 'ListRow 최소 높이 --list-row-height-min',
    adopted:
      '56px (Stage 2 Spec §4.3 basic 행 — Figma 74 는 media 행 값, Stage 8 Spec 이 321:1537 실측으로 사용)',
    where:
      '/components ListRow · 설정 메뉴 · 데이터 관리 · Library 진입 행 (packages/ui list/List.css)',
    status: 'waiting',
    decision:
      '확정 후보 · 재제시 대기 (D8-3 · D8-4) — 토큰 값 변화 0, provisional 주석 없음 (token 파일 그대로)',
  },
  {
    id: 'P-19',
    title: 'CharacterMedallion ring-offset --size-medallion-ring-offset',
    adopted: '8px (Stage 2 Spec §6.4 후보 — Figma 에 ring 이 없어 근거 없음)',
    where:
      '사용처 0 — 앱 화면에서 CharacterMedallion ring 을 쓰는 곳이 없다 (/tokens size swatch 만)',
    status: 'waiting',
    decision:
      '후보 · 사용처 0 — Stage 3 Spec §6.5 "P-16 과 같은 처리(가값 유지, 재제시 보류)". 재제시 시 유지/폐기 확인',
  },
  {
    id: 'P-21',
    title: '가로 트랙 그림자 inset --carousel-shadow-inset / -block-end',
    adopted: '위 24 · 아래 80 (실측 번짐 22 / 77 흡수 — R-SHADOW-1)',
    where: '/library 서재 선반 · Home Activity Card 가로 트랙',
    status: 'waiting',
    decision:
      '후보 — Figma 근거가 아니라 그림자 번짐 계산값 (Stage 3 Spec §6.4 · §4.2). 그림자 토큰이 바뀌면 함께 재계산',
  },
  /*
    `D8-4` (`D8-3-N3`) 등재 — **에셋** 가값(토큰 아님 · 주석 대상 없음). `stage-3-approvals.md` §8.5 ⑧.
  */
  {
    id: 'P-22',
    title: 'conversation_only 카드 일러스트 (기존 캐릭터 에셋 전용)',
    adopted: '전용 에셋 없이 기존 캐릭터 에셋 사용 — 전용 에셋이 오면 파일만 교체',
    where: '사용처 0 — conversation_only 카드가 폐지됐다 (stage-3-approvals §12.12 · QA-3-009)',
    status: 'waiting',
    decision: '디자이너 대기 · 재제시 대기 (D8-3 · D8-4) — 사용처 0 이라 재제시 시 유지/폐기 확인',
  },
  {
    id: 'P-23',
    title: 'Prompt 단계·페이지 배지 글자색 --color-prompt-tag-fg',
    adopted: 'Figma 실측 유지 — cyan 배경(--color-prompt-tag-bg) 위 흰 라벨',
    where: '/a11y 대비표 C-5 · Home Activity Card 뒷면 Prompt 단계·페이지 배지',
    status: 'waiting',
    decision:
      '디자이너 대기 — 대비 1.72:1 (AA 4.5 미달). P-02 에 흡수하지 않는다: 역량 팔레트가 바뀌어도 이 Tier-3 토큰은 해소되지 않는다 (approvals §9.2 ⑫ · Design Spec §6.4)',
  },
  {
    id: 'P-24',
    title: '3차 텍스트 색 --color-fg-tertiary (--haru-ink-400)',
    adopted: 'Figma 값 유지 — secondary 와 같던 --haru-ink-500 에서 재매핑',
    where: '/a11y 대비표 B-3 · Library See all · 캐러셀 캡션 2행 · Book List 메타 · chevron',
    status: 'waiting',
    decision:
      '디자이너 확인 요청 — 대비 1.56–2.30:1 (AA 4.5 및 대형 텍스트 3.0 모두 미달, chevron 비텍스트 3.0 미달 포함). P-01 과 다른 사례 (stage-3-approvals §20.4)',
  },
  /*
    Stage 4 신설 — `D4-16` (stage-4-approvals §5). 세션 하단 바 `Discard`(Figma `285:1228`
    `Accent/Secondary`). **`D-01` 범위 확장이 아니다** (D-01 은 teal 면 한정).
  */
  {
    id: 'P-25',
    title: '세션 Discard 면·라벨 --color-action-neutral-bg / -fg (gray-2 위 흰 라벨)',
    adopted: 'Figma 그대로 — grays/gray-2 면 + 흰 라벨',
    where: '/session/:id 하단 바 Discard (Button variant="neutral")',
    status: 'waiting',
    decision:
      '디자이너 대기 — 대비 2.211:1 (AA 4.5 미달). Figma 그대로 구현하고 가값으로 등록 (stage-4-approvals §5 · D4-16)',
  },
  /*
    Stage 4b 신설 2건 — `D4-58` NB-7 (`stage-4-approvals.md` 가값 표). Figma 선언색 그대로의 대비 미달.
    토큰이 아니라 **세션 CSS 주석**이 가값을 갖는다 (`entities/session/session.css`).
  */
  {
    id: 'P-26',
    title: 'paused 경과 시간 색 (--color-fg-secondary · ink-500)',
    adopted: 'Figma 그대로 — --color-fg-secondary',
    where: '/session/:id paused 상태 경과 시간',
    status: 'waiting',
    decision: '디자이너 대기 — 대비 2.42~2.47:1 (D4-58 NB-7, 4b Spec §9.2)',
  },
  {
    id: 'P-27',
    title: 'paused 보조 줄 색 (--color-fg-secondary · ink-500 · 13px)',
    adopted: 'Figma 그대로 — --color-fg-secondary',
    where: '/session/:id 상태 보조 줄 (Up to 30:00 등)',
    status: 'waiting',
    decision: '디자이너 대기 — 대비 2.39~2.40:1 (D4-58 NB-7)',
  },
  /*
    Stage 5 신설 2건 — `D5-4` (`stage-5-approvals.md`). 컴포넌트 CSS 주석이 가값을 갖는다
    (`packages/ui` `TextInput.css` · `StarRating.css`).
  */
  {
    id: 'P-28',
    title: '회고 입력칸 placeholder 대비 (--color-fg-tertiary · ink-400 · 13px)',
    adopted: 'Figma 그대로 (91:716)',
    where: '/session/:id/complete 회고 카드 입력칸',
    status: 'waiting',
    decision: '디자이너 대기 — 대비 2.28~2.35:1 (S5-D 픽셀 실측 2.31, D5-4)',
  },
  {
    id: 'P-29',
    title: 'StarRating 별 히트 영역 38×44',
    adopted: '가로 38 (간격 8 안에서 겹침 0 이 최대) · 세로 44',
    where: '/session/:id/complete 회고 카드 별점',
    status: 'waiting',
    decision:
      '디자이너 대기 — 가로 38 < 44 (D5-4 · Spec M-5). S8-G 감사 터치 타깃 예외 목록에 매핑',
  },
  /*
    Stage 6 `S6-E1` 신설 4건 — Stage 6 Design Spec §5.3 (`D6-8`). DiamondChart 는 Figma 근거가 없는
    design-agent 명세다 (`R6-01`). 디자이너 차트가 도착하면 값만 교체한다.
  */
  {
    id: 'P-30',
    title: '다이아몬드 차트 비텍스트 대비 --chart-area-stroke / --chart-grid-stroke',
    adopted: 'Spec §3.1 — 면 외곽선 teal · 격자 ink 18% · 꼭짓점 역량색(#19) + 흰 테두리',
    where: '/onboarding/profile · /settings/profile 차트 (DiamondChart)',
    status: 'waiting',
    decision:
      '디자이너 대기 — 외곽선 1.98~2.04 · 꼭짓점 1.49~2.01 · 격자 1.25~1.26:1 (목표 3:1). 정보는 라벨 텍스트 · SR summary 가 전달 (Spec §5.3 · 요청서 Q3)',
  },
  {
    id: 'P-31',
    title: '다이아몬드 차트 면 채움 알파 --chart-area-fill',
    adopted: 'Spec §5.2 T6-4 — teal 30%',
    where: '/onboarding/profile · /settings/profile 차트 면',
    status: 'waiting',
    decision: '디자이너 대기 — 알파 30% 는 Figma 근거 없음 (Spec §5.3)',
  },
  {
    id: 'P-32',
    title: '미관찰 축 표현 --chart-missing-dash',
    adopted: 'Spec §3.1 — 축선 점선 3 4 · 꼭짓점 없음 · "Not seen yet" 캡션',
    where:
      '/onboarding/profile 변형 B · C (children:scores-partially-missing · all-scores-missing)',
    status: 'waiting',
    decision: '디자이너 대기 — 미관찰 축의 선 스타일 (요청서 §6.3, Spec §5.3)',
  },
  {
    id: 'P-33',
    title: '다이아몬드 차트 기하 --chart-diamond-radius-max / --chart-diamond-label-max',
    adopted: 'Spec §3.1 — h 상한 100 · 라벨 폭 64 · 1.0 = 반지름 20% · 축 순서 고정',
    where: '/onboarding/profile · /settings/profile 차트',
    status: 'waiting',
    decision: '디자이너 대기 — Figma 근거 없음 (Spec §5.3)',
  },
  /*
    Stage 7 `S7-B` 신설 6건 — Stage 7 Design Spec §5.3 (`D7-5`). `P-35`~`P-37` 은 **Figma 선언값을 그대로 쓴**
    대비 미달(최우선 규칙 1), `P-38`·`P-39` 는 Figma 가 없는 C-13 명세, `P-40` 은 막대 강조 규칙(JS — 토큰 없음,
    `P-17` 처럼 토큰 주석이 없는 예외). 확인 화면 `/progress` · 리포트 상세는 `S7-C` · `S7-D` 에서 생긴다 —
    그 전에는 dev gallery `/__dev/ui/components` 의 `s7-*` 블록에서 본다.
  */
  {
    id: 'P-35',
    title: '4번째 텍스트 색 --color-fg-quaternary (ink-300) + ink-400 보조 텍스트',
    adopted: 'Figma 선언값 유지 — 막대 값 라벨 ink-300 · 보조 줄 · 요일 · 단계 라벨 ink-400',
    where:
      '/__dev/ui/components s7-bar-chart → (S7-C) /progress 주간 카드 · Growth themes · 리포트 카드',
    status: 'waiting',
    decision:
      '디자이너 대기 (Q7-15) — ink-400 2.20~2.35 · ink-300 1.72~1.84:1 (AA 4.5 미달). Figma 가 있는 화면이라 본문색으로 올리지 않는다 (Spec §5.3)',
  },
  {
    id: 'P-36',
    title: '막대 · Growth 4색 비텍스트 --bar-chart-* / --color-growth-theme-*',
    adopted: 'Figma 선언값 — teal 55% / teal / 스텁 ink 18% · teal · pink · blue · violet/67',
    where: '/__dev/ui/components s7-bar-chart · s7-progress-fill → (S7-C) /progress',
    status: 'waiting',
    decision:
      '디자이너 대기 — teal55% 1.41~1.44 · teal 1.91~2.01 · pink 1.44~1.51 · blue 2.21~2.33 · violet67 2.50~2.63 · 스텁 1.25:1 (목표 3:1). 정보는 값 라벨 · 단계 텍스트 · SR 이름이 전달',
  },
  {
    id: 'P-37',
    title: 'Moment 카드 --color-surface-moment / --color-border-moment',
    adopted: 'Figma 선언값 — teal 16% 면 · teal 35% 1px 테두리 · 그림자 0',
    where: '(S7-C) /progress Moment of the week · (S7-D) 리포트 상세 인용',
    status: 'waiting',
    decision:
      '디자이너 대기 + Visual Gap 에서 실제 배경 픽셀 재측정 — 인용 3.98~5.20 · eyebrow · 출처 1.92~2.51:1 (Spec §5.3)',
  },
  {
    id: 'P-38',
    title: '다이아몬드 이전 리포트 선 --chart-previous-* · 범례 견본 --chart-legend-swatch',
    adopted: 'Spec §3.7 — ink-400 1.5px dash 4 3 · 면 0 · 꼭짓점 0 · 범례 Earlier / This report',
    where: '/__dev/ui/components s7-diamond-previous → (S7-D) 리포트 상세 ① Growth themes',
    status: 'waiting',
    decision: '디자이너 대기 (Q7-1) — Figma 근거 없음 (Spec §5.3)',
  },
  {
    id: 'P-39',
    title: 'C-13 레이아웃 값 --persona-rail-* / --clip-row-gap',
    adopted: 'Spec C-13 명세 — 페르소나 rail 16/2 · 클립 행 gap 12 · PDF 2버튼 · 과거 목록 · 시트',
    where: '(S7-D) 페르소나 히스토리 · (S7-E) 하이라이트 클립 · (S7-F) PDF',
    status: 'waiting',
    decision: '디자이너 대기 (Q7-1~9) — Figma 없음 (Spec §5.3)',
  },
  {
    id: 'P-40',
    title: '막대 강조 규칙 value ≥ 0.75 × 주 최대 (DEFAULT_EMPHASIS_RATIO)',
    adopted: 'N7-29 ⓐ — 비례 높이 + 0.75 강조 (Figma fixture 16·20 두 개 재현)',
    where: '/__dev/ui/components s7-bar-chart → (S7-C) /progress 주간 막대',
    status: 'waiting',
    decision:
      '디자이너 대기 (Q7-13) — Figma fixture 재현용 추정. JS 규칙이라 토큰 주석 없음 (packages/ui chart/barChartLayout.ts)',
  },
  /*
    Stage 8 신설 2건 — Stage 8 Spec §5.3 (`Q8-19` · `D8-2` ④). Figma 없는 C-13 화면 값(`P-41`)과 JS 상수(`P-42`).
    `stage-0-approvals.md` §4 등재는 **Verdict 때 사용자 확정 후** (Plan §9) — 여기는 재제시 자료다.
  */
  {
    id: 'P-41',
    title:
      'Stage 8 C-13 레이아웃 값 (설명↔ListGroup 12 · Trial 안내↔draft TextLink 8 · 상태 알림 최상단)',
    adopted: 'Spec §5.3 — --space-3 12 · --space-2 8 · 화면 최상단 · 행 meta 위치',
    where:
      '/settings/data · /settings/account · /onboarding(/start) · Step 1 Trial 안내 아래 draft 링크',
    status: 'waiting',
    decision: '디자이너 대기 (Q8-21 요청서) — Figma 없음, P-39 선례',
  },
  {
    id: 'P-42',
    title: '전체 삭제 폴링 5s × 상한 60회 (DELETION_POLL_INTERVAL_MS · DELETION_POLL_MAX_READS)',
    adopted: 'Plan rev 2.2 VG8-C-10 — 화면과 감시자 공유',
    where: '/settings/data 전체 삭제 진행 알림 · 앱 감시자(DataDeletionWatcher)',
    status: 'waiting',
    decision:
      '가값 유지 (D8-2 ④ — 사용자 미선택). 서버 SLA(L-xx) 확정 시 교체. JS 상수라 토큰 주석 없음 (entities/data-management/deletionPolling.ts)',
  },
  /*
    `D8-3` 신설 (`H8-6-N3` · Visual Gap `VG8-G-08` ⓐ) — Figma 색 그대로 두고 디자이너 확인을 기다린다.
    토큰 값을 바꾸지 않으므로 토큰 주석이 아니라 **사용처 CSS 주석**이 단일 기준이다 (`auth.css`).
  */
  {
    id: 'P-43',
    title: '로그인 하단 Create an account (--color-fg-link) — 앱 배경 그래디언트 아래 끝 위 대비',
    adopted: 'Figma 179:1847 fill (= --color-fg-link · ink-700) 유지 — 4.0–4.2:1 (AA 4.5 미달)',
    where: '/auth/log-in 하단 inline prompt (화면 높이에 따라 값이 바뀐다 — 852 기준 렌더 4.02)',
    status: 'waiting',
    decision:
      '디자이너 대기 (D8-3 · 요청서 R8-7) — Figma 선언 색 자체가 미달. 같은 색이 그래디언트 위쪽에서는 5.1 이상',
  },
];
