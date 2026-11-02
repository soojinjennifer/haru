import {
  Book,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  ExternalLink,
  Info,
  ListChecks,
  Mail,
  MessageCircle,
  MessageSquareText,
  OctagonAlert,
  Pencil,
  RotateCcw,
  Settings,
  ShieldCheck,
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
 * 다음 Stage 의 아이콘(`mail` `play` …)은 그 Stage 에서 여기에 추가한다.
 * Stage 2-UI 추가: `clock` · `list-checks`(소개 화면 InfoRow — Design Spec §4.4) ·
 * `external-link`(TextLink 외부 링크 — §4.6).
 * Stage 2-AUTH 추가: `mail`(Welcome 의 "Sign up with email" — Design Spec §2.1).
 * Stage 2-CONSENT 추가: `shield-check`(VPC 슬롯의 아이콘 배지 — Design Spec §2.7).
 * Stage 2-HOME 추가: `book-open`(Home skeleton EmptyState 아이콘 배지 — Design Spec §2.13).
 * Stage 2 재구성 추가: `pencil`(`About your child` 섹션 헤더의 편집 전환 — 재구성 Design Spec §4.3).
 * Stage 3 추가: `message-circle`(대체 카드 `conversation_only` 식별 — §2.6).
 * `rotate-ccw`(`reread_book`)는 Stage 1 에 이미 있다.
 * Stage 4b `S4-F2` 추가: `message-square-text`(세션 Prompts 칩 `298:1315` — 4b Spec §0.1 `[svg]` 로
 * Lucide 와 같은 path 확인). 같은 단위에서 넣었던 `mic-off`(RecordControl `permission-denied`
 * `298:1254`)는 `S4-F2` 후속(Visual Gap `VG-F2-01`, 2026-10-29)에서 **제거**했다 — Figma 원본 stroke 가
 * 24 기준 2 라 HARU 규격 1.5 와 달라 HARU 전용 `haru:record-mic-off` 로 교체했다(사용처 0건).
 *
 * Stage 3 Visual Gap 3차(2026-10-06, approvals §13.2 `A-23`-icon)에서 **`star` 를 제거**했다.
 * `WeekSummaryChip` 이 유일한 사용처였고, 교체본은 HARU 전용 `haru:session-history`
 * (Figma `50:161` 채움 `history` 글리프) 다.
 *
 * ⚠️ **`star` 는 Figma 근거가 있었다** (approvals §13.2 판정 근거 정정, 2026-10-06 실측):
 * Figma `30:91` 에 5각성 단일 채움 path 가 **실재**하며 fill `#D0CCA1` · 13×13 으로 `50:161` 과
 * 색·크기가 같다. 따라서 *"임의 변경"* 서술은 사실이 아니다 — **결정 문구가 0건**이었던 것과
 * **Figma 근거가 없었던 것**은 다르다. 그럼에도 `history` 로 교체한 근거는 다음 4가지다.
 *  1. 통합 칩이 표시하는 것은 **이번 주 세션 수**(`AD-S3-9`) 로, 두 원본 칩의 내용
 *     (`26:40` 115 Min · `30:91` 12-day streak) **어느 쪽도 아니다** → 어느 아이콘도 내용상
 *     정확히 맞지 않는다.
 *  2. `star` 가 대표한 **streak 는 `D-6` 미채택**으로 contract 에서 `streakDays` 가 삭제됐다 —
 *     기각된 쪽의 표식이다.
 *  3. **`star` 는 성취·평점 언어다.** `rules/frontend.md` §8 이 진단·판정·비교 표현을 금지하고
 *     **`D-7` 이 Figma 의 평점 기능을 같은 이유로 기각**했다. 세션 수에 별을 붙이면 달성률
 *     표식으로 읽힌다.
 *  4. `history`(시계 + 반시계 화살표)는 **지나간 활동**을 가리켜 "이번 주에 한 세션"과 의미가 맞는다.
 *
 * 등록 제거는 규칙 ①(쓰지 않는 글리프를 번들에 넣지 않는다)에 따른 것이며 **되돌리지 않는다**
 * (사용처 0건). 다시 필요해지면 그때 Figma 근거와 함께 등록한다.
 *
 * 탭 아이콘 글리프는 `book` / `chart-no-axes-column-increasing` 으로 **확정**되었다
 * (결정 `S1-D2-5`, approvals §8 — Figma `25:87` 16배 확대 대조 결과 path 가 1:1 대응한다).
 */
export const LUCIDE_ICONS = {
  book: Book,
  'book-open': BookOpen,
  'chart-no-axes-column-increasing': ChartNoAxesColumnIncreasing,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-check': CircleCheck,
  clock: Clock,
  'external-link': ExternalLink,
  info: Info,
  'list-checks': ListChecks,
  mail: Mail,
  'message-circle': MessageCircle,
  'message-square-text': MessageSquareText,
  'octagon-alert': OctagonAlert,
  pencil: Pencil,
  'rotate-ccw': RotateCcw,
  settings: Settings,
  'shield-check': ShieldCheck,
  'triangle-alert': TriangleAlert,
  'wifi-off': WifiOff,
  x: X,
} satisfies Record<string, LucideIcon>;

export type LucideIconName = keyof typeof LUCIDE_ICONS;

/** Lucide 기본 stroke 2 → HARU 규격 1.5 (§4.2 · §8.3). */
export const LUCIDE_STROKE_WIDTH = 1.5;
