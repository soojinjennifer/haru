import {
  Book,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Info,
  OctagonAlert,
  RotateCcw,
  Settings,
  TriangleAlert,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';

/**
 * Stage 1 에서 쓰는 Lucide 글리프 — Design Spec §8.1 대응표의 `Stage 1` 행.
 *
 * 전체 라이브러리를 동적으로 열지 않고 **명시 등록**한다.
 *  ① 번들에 쓰지 않는 아이콘이 들어가지 않는다.
 *  ② 사용 가능한 글리프가 대응표와 1:1 로 유지되어 시각 비교 baseline 이 흔들리지 않는다 (D-2).
 * 다음 Stage 의 아이콘(`mail` `list` `clock` `play` …)은 그 Stage 에서 여기에 추가한다.
 *
 * 탭 아이콘 글리프는 `book` / `chart-no-axes-column-increasing` 으로 **확정**되었다
 * (결정 `S1-D2-5`, approvals §8 — Figma `25:87` 16배 확대 대조 결과 path 가 1:1 대응한다).
 */
export const LUCIDE_ICONS = {
  book: Book,
  'chart-no-axes-column-increasing': ChartNoAxesColumnIncreasing,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-check': CircleCheck,
  info: Info,
  'octagon-alert': OctagonAlert,
  'rotate-ccw': RotateCcw,
  settings: Settings,
  'triangle-alert': TriangleAlert,
  'wifi-off': WifiOff,
  x: X,
} satisfies Record<string, LucideIcon>;

export type LucideIconName = keyof typeof LUCIDE_ICONS;

/** Lucide 기본 stroke 2 → HARU 규격 1.5 (§4.2 · §8.3). */
export const LUCIDE_STROKE_WIDTH = 1.5;
