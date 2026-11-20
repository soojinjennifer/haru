/**
 * 리포트 상세 표시 모델 — 순수 함수 (Stage 7 `S7-D`, Spec §2.3 · §9.2).
 * AC-7-38(대체 텍스트 · 오버레이 값) · 39(근거 행) · 40(trigger → copy) · 41(지표) · 43(체크 라벨) · 47(가공 0).
 */
import type { ReportCapabilityChange, ReportPersonaHistoryEntry } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { reflectionCheckLabels } from '../../../entities/reflection';
import { createLatestReportDetail, mockReportSummary } from '../../../mocks/fixtures/reports';
import { reportDetailCopy as copy } from '../copy';
import {
  checkTrendRows,
  dialogueRows,
  evidenceRows,
  growthSummary,
  personaTimeline,
  previousDiamondValues,
  quoteSource,
} from '../model/reportDetailView';

const detail = createLatestReportDetail(mockReportSummary('latest'));

function change(overrides: Partial<ReportCapabilityChange> = {}): ReportCapabilityChange {
  return { ...detail.capabilityChange, ...overrides };
}

describe('evidenceRows — Q6 순서 · null 행 미렌더 (AC-7-39)', () => {
  it('응답 순서가 달라도 Self-Direction → Emotion → Cognitive → Intrinsic 로 놓고 null 은 뺀다', () => {
    const reversed = change({ items: [...detail.capabilityChange.items].reverse() });
    expect(evidenceRows(reversed).map((row) => row.capability)).toStrictEqual([
      'self_directed_agency',
      'emotion_regulation',
      'cognitive_flexibility',
    ]);
  });

  it('문장은 서버 값 그대로 (가공 0)', () => {
    const rows = evidenceRows(detail.capabilityChange);
    for (const row of rows) {
      const source = detail.capabilityChange.items.find(
        (item) => item.capability === row.capability,
      );
      expect(row.evidence).toBe(source?.evidence);
    }
  });
});

describe('previousDiamondValues — 다이아몬드 축 순서 (위 SD → 오른쪽 ER → 아래 CF → 왼쪽 IM)', () => {
  it('이전 점수를 축 순서로 · 결측은 null · previous 없으면 null', () => {
    expect(previousDiamondValues(detail.capabilityChange)).toStrictEqual([4.3, 3.5, 2.5, 3.7]);
    expect(previousDiamondValues(change({ previous: null }))).toBeNull();
    const withMissing = change({
      previous:
        detail.capabilityChange.previous?.map((row) =>
          row.capability === 'cognitive_flexibility' ? { ...row, score: null } : row,
        ) ?? null,
    });
    expect(previousDiamondValues(withMissing)).toStrictEqual([4.3, 3.5, null, 3.7]);
  });
});

describe('growthSummary — 증감·방향 판정 0 · 숫자 0 (N7-15 · N7-39)', () => {
  it('previous 있음 = 리드 + 점선 안내', () => {
    expect(growthSummary('Emma', detail.capabilityChange)).toBe(
      'Growth themes for Emma in this report. The dashed outline shows the previous report.',
    );
  });

  it('previous 없음 + 미관찰 축 = 리드 + Not observed yet 목록 (축 순서)', () => {
    const current = detail.capabilityChange.current.map((row) =>
      row.capability === 'intrinsic_motivation' || row.capability === 'emotion_regulation'
        ? { ...row, score: null }
        : row,
    );
    expect(growthSummary('Emma', change({ previous: null, current }))).toBe(
      'Growth themes for Emma in this report. Not observed yet: Emotion Regulation and Intrinsic Motivation.',
    );
  });

  it('이전보다 점수가 오르거나 내려도 문장은 같다 — 비교를 말로 바꾸지 않는다', () => {
    const swapped = change({
      previous: detail.capabilityChange.current,
      current: detail.capabilityChange.previous ?? detail.capabilityChange.current,
    });
    expect(growthSummary('Emma', swapped)).toBe(growthSummary('Emma', detail.capabilityChange));
    expect(growthSummary('Emma', swapped)).not.toMatch(/\d|more|less|up|down|grew|improv/i);
  });
});

describe('dialogueRows — 응답 값 그대로 · 시간만 분 포맷 (AC-7-41)', () => {
  it('5행 순서 · 0 도 그대로', () => {
    expect(
      dialogueRows(
        { ...detail.dialogueMetrics, emotionWordCount: 0, totalMinutes: 45 },
        'Emma',
      ).map((row) => [row.label, row.value]),
    ).toStrictEqual([
      ['Storytimes', '9'],
      ['Time together', '45m'],
      ['Things Emma said', '146'],
      ['Back-and-forth turns', '64'],
      ['Feeling words', '0'],
    ]);
    expect(dialogueRows(detail.dialogueMetrics, 'Emma')[1]?.value).toBe('1h 58m');
  });
});

describe('personaTimeline — 서버 순서 · SINCE / NOW · trigger 출처 (AC-7-40 · N7-42)', () => {
  it('정렬 0 · 마지막만 NOW · 그 전 SINCE {MON D} (연도 없음)', () => {
    const items = personaTimeline(detail.personaHistory, 'UTC');
    expect(items.map((item) => [item.eyebrow, item.entry.name, item.isCurrent])).toStrictEqual([
      ['SINCE MAR 16', detail.personaHistory[0]?.name, false],
      ['SINCE APR 20', detail.personaHistory[1]?.name, false],
      ['NOW', detail.personaHistory[2]?.name, true],
    ]);
  });

  it('trigger 3값 → copy 3종', () => {
    const triggers = ['onboarding_survey', 'survey_update', 'session_analysis'] as const;
    const base = detail.personaHistory[0] as ReportPersonaHistoryEntry;
    const items = personaTimeline(
      triggers.map((trigger) => ({ ...base, trigger })),
      'UTC',
    );
    expect(items.map((item) => item.source)).toStrictEqual([
      'From your answers',
      'From your updated answers',
      'From your storytimes',
    ]);
  });

  it('1개 = NOW 하나 · 같은 페르소나가 다시 와도 key 가 겹치지 않는다', () => {
    const base = detail.personaHistory[0] as ReportPersonaHistoryEntry;
    expect(personaTimeline([base], 'UTC').map((item) => item.eyebrow)).toStrictEqual(['NOW']);
    const keys = personaTimeline([base, base], 'UTC').map((item) => item.key);
    expect(new Set(keys).size).toBe(2);
  });

  it('해가 다른 날짜도 연도를 붙이지 않는다 (Spec SINCE {MON D})', () => {
    const base = detail.personaHistory[0] as ReportPersonaHistoryEntry;
    const items = personaTimeline(
      [{ ...base, effectiveFrom: '2025-12-29T10:00:00.000Z' }, base],
      'UTC',
    );
    expect(items[0]?.eyebrow).toBe('SINCE DEC 29');
  });
});

describe('checkTrendRows — Stage 5 회고 체크 라벨 재사용 (AC-7-43 · N7-43)', () => {
  it('라벨 = entities/reflection 같은 모듈 · 서버 순서 · {n}× · SR n times', () => {
    expect(checkTrendRows(detail.parentFeedbackSummary.checkTrends)).toStrictEqual([
      { key: 'engaged', label: reflectionCheckLabels.engaged, meta: '5×', spoken: ', 5 times' },
      {
        key: 'big_feelings',
        label: reflectionCheckLabels.big_feelings,
        meta: '3×',
        spoken: ', 3 times',
      },
      {
        key: 'asked_questions',
        label: reflectionCheckLabels.asked_questions,
        meta: '2×',
        spoken: ', 2 times',
      },
    ]);
    expect(checkTrendRows([{ key: 'tricky_today', count: 1 }])[0]?.spoken).toBe(', 1 time');
  });
});

describe('quoteSource — 날짜 · 책 제목 (Spec §3.6)', () => {
  it('책 제목 있으면 `May 5 · 제목` · 없으면 날짜만', () => {
    expect(quoteSource(detail.notableQuotes[0] as (typeof detail.notableQuotes)[number])).toBe(
      'May 5 · The Most Magnificent Thing',
    );
    expect(quoteSource(detail.notableQuotes[1] as (typeof detail.notableQuotes)[number])).toBe(
      'Apr 22',
    );
  });
});

describe('copy — 진단·판정·비교·점수 표현 0 (Spec §10.5 · AC-7-66)', () => {
  const FORBIDDEN = [
    'diagnos',
    'score',
    'rating',
    'level',
    'grade',
    'assess',
    'weak',
    'below',
    'behind',
    'average',
    'normal',
    'better',
    'worse',
    'peers',
    ' vs',
    '% of',
    ' of 7',
    'streak',
    'improve',
    'decline',
    'fail',
    'error',
    '!',
  ];

  function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') {
      const fn = value as (...args: unknown[]) => unknown;
      return strings(fn('Emma', 'Emma'));
    }
    if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
    return [];
  }

  it('모든 문구', () => {
    const texts = strings(copy);
    expect(texts.length).toBeGreaterThan(20);
    const hits = texts.flatMap((text) =>
      FORBIDDEN.filter((word) => text.toLowerCase().includes(word)).map(
        (word) => `${word} ← ${text}`,
      ),
    );
    expect(hits).toStrictEqual([]);
  });
});
