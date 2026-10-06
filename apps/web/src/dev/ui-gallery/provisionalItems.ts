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
 * 디자이너 대기 6건: P-01 · P-02 · P-04 · P-16 · **P-17**(Stage 2 신규 — 결정 `D-14`)
 * + **P-24**(Library 1라운드 신규 — `stage-3-approvals.md` §20.4).
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
  {
    id: 'P-24',
    title: '3차 텍스트 색 --color-fg-tertiary (--haru-ink-400)',
    adopted: 'Figma 값 유지 — secondary 와 같던 --haru-ink-500 에서 재매핑',
    where: '/a11y 대비표 B-3 · Library See all · 캐러셀 캡션 2행 · Book List 메타 · chevron',
    status: 'waiting',
    decision:
      '디자이너 확인 요청 — 대비 1.56–2.30:1 (AA 4.5 및 대형 텍스트 3.0 모두 미달, chevron 비텍스트 3.0 미달 포함). P-01 과 다른 사례 (stage-3-approvals §20.4)',
  },
];
