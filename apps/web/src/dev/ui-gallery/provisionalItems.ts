/**
 * 가값(provisional) 승인 자료 목록 — Plan §17-3 · Design Spec §12.3.
 *
 * **이 표는 확정이 아니다.** gallery 는 사용자 승인 절차에 쓸 자료를 제시할 뿐이고,
 * `유지 / 수정 / 디자이너 대기` 결정은 Orchestrator 가 항목별로 받는다 (Stage 0 #10-④).
 *
 * 값의 단일 기준은 `packages/design-tokens` 의 `provisional` 주석과
 * `docs/decisions/stage-0-approvals.md` §4 이다. 여기에는 "어디를 보고 판단하는가" 만 적는다.
 */
export interface ProvisionalItem {
  readonly id: string;
  readonly title: string;
  readonly adopted: string;
  readonly where: string;
}

export const PROVISIONAL_ITEMS: readonly ProvisionalItem[] = [
  {
    id: 'P-01',
    title: '보조 텍스트 색 --color-fg-secondary / -tertiary',
    adopted: 'Figma text-secondary 유지',
    where: '/a11y 대비표 · TabBar 비선택 라벨 · TextField helper',
  },
  {
    id: 'P-02',
    title: '비텍스트: 진행 바 · 별점 · 칩 경계 · 배지 글자',
    adopted: 'Figma 값 유지',
    where: '/a11y 대비표 · /components ProgressBar · Tag',
  },
  {
    id: 'P-03',
    title: 'focus ring 색 · 굵기 2 · offset 2',
    adopted: '--haru-ink-700 / 2px / 2px',
    where: '/a11y focus 순회 (white · glass · accent 3배경)',
  },
  {
    id: 'P-04',
    title: 'status 색 (info / success / warning / error)',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/components InlineAlert 5 tone · Toast · 필드 에러',
  },
  {
    id: 'P-05',
    title: 'scrim',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/components Sheet · Dialog scrim',
  },
  {
    id: 'P-06',
    title: 'z-index 스케일',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/tokens z-index 표 · Sheet<Dialog<Toast 중첩',
  },
  {
    id: 'P-07',
    title: 'motion duration / easing',
    adopted: 'TOKEN_MAP §4 제안값',
    where: '/tokens motion 표 · reduced-motion 비교',
  },
  {
    id: 'P-08',
    title: 'safe-area inset 토큰',
    adopted: 'env(safe-area-inset-*)',
    where: '/responsive 프레임',
  },
  {
    id: 'P-09',
    title: '아이콘 크기 16 / 20 / 24',
    adopted: '3단계 + 탭 21 예외',
    where: '/components Icon 3단계',
  },
  {
    id: 'P-10',
    title: '공통 상태 화면·컴포넌트 상태 디자인',
    adopted: 'design-agent 명세 (#22)',
    where: '/states 6종 전체',
  },
  {
    id: 'P-11',
    title: 'glass·tinted 위 라벨 대비 (D-01 범위 밖)',
    adopted: 'Figma 값 유지',
    where: '/a11y 대비표 · Glass Button · Chip 라벨',
  },
  {
    id: 'P-12',
    title: '--radius-surface 22 vs 24',
    adopted: '22 유지',
    where: '/tokens radius · SpeechBubble · TextField',
  },
  {
    id: 'P-13',
    title: '--layout-gutter 24 vs 26',
    adopted: '24 유지',
    where: '/responsive 320 · 393 프레임',
  },
  {
    id: 'P-14',
    title: 'gradient stop 46% vs 52%',
    adopted: '46% 유지',
    where: '/tokens gradient swatch',
  },
  {
    id: 'P-15',
    title: '--size-button-lg 56 vs 58',
    adopted: '56 유지',
    where: '/components Button md 45 / lg 56',
  },
  {
    id: 'P-16',
    title: 'medallion 136 / 188 / 232 + ring offset 8',
    adopted: '변경 없음 (컴포넌트는 Stage 2)',
    where: '/tokens size swatch',
  },
];
