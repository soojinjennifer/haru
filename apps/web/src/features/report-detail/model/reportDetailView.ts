/**
 * 리포트 상세 표시 모델 — **순수 함수** (Stage 7 `S7-D`, Spec §2.3 · §9.2).
 *
 * 하는 일은 **배치 · 포맷 · copy 선택**뿐이다. 문장 생성·가공·비교·정렬(서버 순서 변경) 0 (`architecture.md` §8 · AC-7-47).
 *
 * | 함수 | 규칙 |
 * |---|---|
 * | `evidenceRows` | 4역량 중 `evidence ≠ null` 행만 · **Q6 축 순서**로 배치 (Spec §2.3.1 — 배치 규칙이지 정렬 가공 아님) |
 * | `previousDiamondValues` | `previous` 점수 → 다이아몬드 축 순서 값 (오버레이). `null` 이면 `null` |
 * | `growthSummary` | 대체 텍스트 — 리드 + (previous 있음 ? 점선 안내) + (미관찰 축 ? 목록). **증감·방향 문장 0** (`N7-39`) |
 * | `dialogueRows` | 지표 5행 — 값은 응답 그대로(시간만 분 포맷). 0 도 그대로 표시 (Spec §2.3.3) |
 * | `personaTimeline` | 서버 순서 그대로 · 마지막 = *NOW* · 그 전 = *SINCE {Mon D}* · 출처 = `trigger` copy (`N7-42`) |
 * | `checkTrendRows` | 회고 체크 라벨(`entities/reflection`) + `{n}×` · 서버 순서 그대로 |
 * | `quoteSource` | `May 5 · {bookTitle}` · 책 제목 없으면 날짜만 (Spec §3.6) |
 */
import type {
  Capability,
  CapabilityScore,
  ReportCapabilityChange,
  ReportCheckTrend,
  ReportDialogue,
  ReportNotableQuote,
  ReportPersonaHistoryEntry,
} from '@haru/contracts';
import type { DiamondValues } from '@haru/ui';

import { CAPABILITY_AXIS_ORDER, joinCapabilityList } from '../../../entities/child-profile';
import { reflectionCheckLabels } from '../../../entities/reflection';
import { formatMinutes } from '../../../entities/weekly-progress';
import { capabilityCopy } from '../../../shared/copy/capability-copy';
import { formatCalendarMonthDay } from '../../../shared/lib/calendar-date-format';
import { formatMonthDay } from '../../../shared/lib/date-format';
import { reportDetailCopy as copy } from '../copy';

export interface EvidenceRow {
  capability: Capability;
  label: string;
  evidence: string;
}

export function evidenceRows(change: ReportCapabilityChange): EvidenceRow[] {
  return CAPABILITY_AXIS_ORDER.flatMap((capability) => {
    const evidence = change.items.find((item) => item.capability === capability)?.evidence ?? null;
    return evidence === null ? [] : [{ capability, label: capabilityCopy[capability], evidence }];
  });
}

function scoreOf(scores: readonly CapabilityScore[], capability: Capability): number | null {
  return scores.find((row) => row.capability === capability)?.score ?? null;
}

/** 다이아몬드 축 순서(위 → 오른쪽 → 아래 → 왼쪽 = Q6)의 이전 점수 — 형상에만 쓴다 (숫자 표시 0, `N7-15`). */
export function previousDiamondValues(change: ReportCapabilityChange): DiamondValues | null {
  const previous = change.previous;
  if (previous === null) return null;
  const [top, right, bottom, left] = CAPABILITY_AXIS_ORDER;
  return [
    scoreOf(previous, top),
    scoreOf(previous, right),
    scoreOf(previous, bottom),
    scoreOf(previous, left),
  ];
}

export function growthSummary(firstName: string, change: ReportCapabilityChange): string {
  const notObserved = CAPABILITY_AXIS_ORDER.filter(
    (capability) => scoreOf(change.current, capability) === null,
  ).map((capability) => capabilityCopy[capability]);

  return [
    copy.growth.summaryLead(firstName),
    change.previous === null ? null : copy.growth.summaryPrevious,
    notObserved.length > 0 ? copy.growth.summaryNotObserved(joinCapabilityList(notObserved)) : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' ');
}

export interface DialogueRow {
  key: 'sessions' | 'minutes' | 'utterances' | 'turns' | 'feelingWords';
  label: string;
  value: string;
}

export function dialogueRows(metrics: ReportDialogue, firstName: string): DialogueRow[] {
  return [
    { key: 'sessions', label: copy.dialogue.storytimes, value: String(metrics.sessionCount) },
    {
      key: 'minutes',
      label: copy.dialogue.timeTogether,
      value: formatMinutes(metrics.totalMinutes),
    },
    {
      key: 'utterances',
      label: copy.dialogue.childSaid(firstName),
      value: String(metrics.childUtteranceCount),
    },
    { key: 'turns', label: copy.dialogue.turns, value: String(metrics.turnTakingCount) },
    {
      key: 'feelingWords',
      label: copy.dialogue.feelingWords,
      value: String(metrics.emotionWordCount),
    },
  ];
}

export interface PersonaTimelineItem {
  key: string;
  entry: ReportPersonaHistoryEntry;
  eyebrow: string;
  source: string;
  isCurrent: boolean;
}

/**
 * `effectiveFrom`(datetime) → *SINCE APR 20*. 연도는 쓰지 않는다 (Spec §2.3.2 `SINCE {MON D}`) — 기준 시각을 같은
 * 값으로 넘겨 `formatMonthDay` 가 연도를 붙이지 않게 한다. 표기 시간대 = 기기 (`timeZone` 은 테스트 주입용).
 */
export function personaTimeline(
  history: readonly ReportPersonaHistoryEntry[],
  timeZone?: string,
): PersonaTimelineItem[] {
  const lastIndex = history.length - 1;
  return history.map((entry, index) => {
    const at = Date.parse(entry.effectiveFrom);
    const isCurrent = index === lastIndex;
    return {
      // 같은 페르소나가 다시 올 수 있다 — 서버 순서 index 를 함께 쓴다
      key: `${String(index)}-${entry.personaId}`,
      entry,
      eyebrow: isCurrent ? copy.persona.now : copy.persona.since(formatMonthDay(at, at, timeZone)),
      source: copy.persona.source[entry.trigger],
      isCurrent,
    };
  });
}

export interface CheckTrendRow {
  key: ReportCheckTrend['key'];
  label: string;
  meta: string;
  spoken: string;
}

export function checkTrendRows(trends: readonly ReportCheckTrend[]): CheckTrendRow[] {
  return trends.map((trend) => ({
    key: trend.key,
    label: reflectionCheckLabels[trend.key],
    meta: copy.feedback.countMeta(trend.count),
    spoken: copy.feedback.countSpoken(trend.count),
  }));
}

export function quoteSource(quote: ReportNotableQuote): string {
  return copy.quotes.source(formatCalendarMonthDay(quote.sessionDate), quote.bookTitle);
}
