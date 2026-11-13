import { describe, expect, it } from 'vitest';

import * as analysis from '../analysis/index.js';
import * as highlightClips from '../highlight-clips/index.js';
import * as contracts from '../index.js';
import * as reflections from '../reflections/index.js';
import {
  AnalysisSessionStatusSchema,
  ERROR_CODES,
  HighlightClipSummarySchema,
  REFLECTION_NOTE_MAX_LENGTH,
  ReflectionCheckKeySchema,
  ReflectionSchema,
  SessionAnalysisStatusSchema,
  SignedMediaUrlSchema,
  SubmitReflectionRequestSchema,
  hasReflectionContent,
} from '../index.js';

/**
 * Stage 5 `S5-A` — 회고 · 분석 상태 · 하이라이트 클립 contracts (Plan §7 C-1~C-12, AC-5-03~08).
 */

const SESSION_ID = '77777777-7777-4777-8777-000000000001';
const REFLECTION_ID = '99999999-9999-4999-8999-000000000001';

describe('ReflectionCheckKey (C-1 · AC-5-03)', () => {
  it('5값 · PRD 체크 5종 ↔ Figma 칩 5종 1:1', () => {
    expect(ReflectionCheckKeySchema.options).toEqual([
      'engaged',
      'big_feelings',
      'asked_questions',
      'stayed_focused',
      'tricky_today',
    ]);
  });

  it('Figma 라벨 문자열은 키가 아니다 (라벨은 copy 모듈 — `N5-20`)', () => {
    expect(ReflectionCheckKeySchema.safeParse('Engaged').success).toBe(false);
    expect(ReflectionCheckKeySchema.safeParse('Stay Focus').success).toBe(false);
  });
});

describe('SubmitReflectionRequest (C-2 · AC-5-04)', () => {
  const valid = { rating: 4, checks: ['engaged', 'big_feelings'], note: 'The moon part' };

  it('별 · 칩 · 메모 조합을 받는다', () => {
    expect(SubmitReflectionRequestSchema.safeParse(valid).success).toBe(true);
    expect(
      SubmitReflectionRequestSchema.safeParse({ rating: 1, checks: [], note: null }).success,
    ).toBe(true);
    expect(
      SubmitReflectionRequestSchema.safeParse({
        rating: null,
        checks: ['tricky_today'],
        note: null,
      }).success,
    ).toBe(true);
    expect(
      SubmitReflectionRequestSchema.safeParse({ rating: null, checks: [], note: 'x' }).success,
    ).toBe(true);
  });

  it.each([0, 6, 3.5, -1])('rating %s 거부', (rating) => {
    expect(SubmitReflectionRequestSchema.safeParse({ ...valid, rating }).success).toBe(false);
  });

  it('미등록 키 · 중복 키 거부', () => {
    expect(SubmitReflectionRequestSchema.safeParse({ ...valid, checks: ['bored'] }).success).toBe(
      false,
    );
    expect(
      SubmitReflectionRequestSchema.safeParse({ ...valid, checks: ['engaged', 'engaged'] }).success,
    ).toBe(false);
  });

  it('`note` 는 trim 후 1~500자 — 앞뒤 공백 제거 · 공백만 거부 · 상한 초과 거부', () => {
    expect(SubmitReflectionRequestSchema.parse({ ...valid, note: '  hello  ' }).note).toBe('hello');
    expect(SubmitReflectionRequestSchema.safeParse({ ...valid, note: '   ' }).success).toBe(false);
    expect(SubmitReflectionRequestSchema.safeParse({ ...valid, note: '' }).success).toBe(false);
    expect(REFLECTION_NOTE_MAX_LENGTH).toBe(500);
    expect(
      SubmitReflectionRequestSchema.safeParse({ ...valid, note: 'a'.repeat(500) }).success,
    ).toBe(true);
    expect(
      SubmitReflectionRequestSchema.safeParse({ ...valid, note: ` ${'a'.repeat(500)} ` }).success,
    ).toBe(true);
    expect(
      SubmitReflectionRequestSchema.safeParse({ ...valid, note: 'a'.repeat(501) }).success,
    ).toBe(false);
  });

  it('세 필드가 모두 비면 거부한다 (`N5-05` ⓐ — 빈 회고는 보내지 않는다)', () => {
    expect(
      SubmitReflectionRequestSchema.safeParse({ rating: null, checks: [], note: null }).success,
    ).toBe(false);
    expect(hasReflectionContent({ rating: null, checks: [], note: null })).toBe(false);
    expect(hasReflectionContent({ rating: 2, checks: [], note: null })).toBe(true);
  });

  it('세 key 는 모두 필수다 (nullable) — 누락 거부', () => {
    expect(SubmitReflectionRequestSchema.safeParse({ rating: 3, checks: [] }).success).toBe(false);
    expect(SubmitReflectionRequestSchema.safeParse({ rating: 3, note: null }).success).toBe(false);
    expect(SubmitReflectionRequestSchema.safeParse({ checks: [], note: 'x' }).success).toBe(false);
  });

  it('⛔ PRD 초안 필드(`revisitTopics` · `freeNote` · `skipped`)는 schema 에 없다 (`N5-02` ⓐ · `N5-06` ⓐ)', () => {
    const keys = Object.keys(SubmitReflectionRequestSchema.shape);
    expect(keys.sort()).toEqual(['checks', 'note', 'rating']);
    const parsed = SubmitReflectionRequestSchema.parse({ ...valid, skipped: true, freeNote: 'x' });
    expect(parsed).not.toHaveProperty('skipped');
    expect(parsed).not.toHaveProperty('freeNote');
  });
});

describe('Reflection (C-3 · AC-5-05)', () => {
  const reflection = {
    id: REFLECTION_ID,
    sessionId: SESSION_ID,
    rating: 4,
    checks: ['engaged'],
    note: null,
    submittedAt: '2026-01-01T00:20:00Z',
  };

  it('응답 모양을 받는다', () => {
    expect(ReflectionSchema.safeParse(reflection).success).toBe(true);
  });

  it('필수 key 누락 · 빈 회고 · 잘못된 시각 거부', () => {
    const { submittedAt: _omit, ...withoutTime } = reflection;
    expect(ReflectionSchema.safeParse(withoutTime).success).toBe(false);
    expect(ReflectionSchema.safeParse({ ...reflection, rating: null, checks: [] }).success).toBe(
      false,
    );
    expect(
      ReflectionSchema.safeParse({ ...reflection, submittedAt: '2026-01-01T09:00:00+09:00' })
        .success,
    ).toBe(false);
  });
});

describe('SessionAnalysisStatus (C-7 · AC-5-06)', () => {
  const base = {
    sessionId: SESSION_ID,
    sessionStatus: 'analyzing',
    mode: 'recorded',
    outcome: null,
    shortFeedback: null,
  };

  it('표시 상태별 응답을 받는다 (pending · completed · failed · low-quality · feedback 없음 · 녹음 없음)', () => {
    const cases = [
      base,
      { ...base, sessionStatus: 'analyzed', outcome: 'full', shortFeedback: { text: 'Hi.' } },
      { ...base, sessionStatus: 'failed' },
      {
        ...base,
        sessionStatus: 'analyzed',
        outcome: 'excluded_low_quality',
        shortFeedback: { text: null },
      },
      {
        ...base,
        sessionStatus: 'analyzed',
        outcome: 'full',
        shortFeedback: { text: null, templateId: 't' },
      },
      { ...base, sessionStatus: 'completed' },
    ];
    for (const value of cases) {
      expect(SessionAnalysisStatusSchema.safeParse(value).success, JSON.stringify(value)).toBe(
        true,
      );
    }
  });

  it('refine — `outcome !== null ⇒ sessionStatus === analyzed`', () => {
    expect(SessionAnalysisStatusSchema.safeParse({ ...base, outcome: 'full' }).success).toBe(false);
    expect(
      SessionAnalysisStatusSchema.safeParse({
        ...base,
        sessionStatus: 'failed',
        outcome: 'excluded_low_quality',
      }).success,
    ).toBe(false);
  });

  it('응답 상태는 완료 계열 4값뿐이다 — 완료 전·abandoned 는 `ANALYSIS_NOT_AVAILABLE`', () => {
    expect(AnalysisSessionStatusSchema.options).toEqual([
      'completed',
      'analyzing',
      'analyzed',
      'failed',
    ]);
    for (const status of ['ready', 'recording', 'paused', 'abandoned']) {
      expect(
        SessionAnalysisStatusSchema.safeParse({ ...base, sessionStatus: status }).success,
      ).toBe(false);
    }
  });

  it('⛔ `metricsPreview` · 전사 · 발화 · 지표 필드가 없다 (`N5-11` ⓐ · §13)', () => {
    const keys = Object.keys(SessionAnalysisStatusSchema.shape);
    expect(keys.sort()).toEqual(['mode', 'outcome', 'sessionId', 'sessionStatus', 'shortFeedback']);
    const parsed = SessionAnalysisStatusSchema.parse({
      ...base,
      metricsPreview: { emotionWordCount: 3, newWords: ['proud'] },
      transcript: 'raw',
    });
    expect(parsed).not.toHaveProperty('metricsPreview');
    expect(parsed).not.toHaveProperty('transcript');
  });
});

describe('HighlightClip · SignedMediaUrl (C-9 · AC-5-07)', () => {
  it('클립 요약 — 길이 정수 ≥ 1 · 만료 nullable (`OAQ-13`)', () => {
    const clip = { id: REFLECTION_ID, sessionId: SESSION_ID, durationSeconds: 12, expiresAt: null };
    expect(HighlightClipSummarySchema.safeParse(clip).success).toBe(true);
    expect(HighlightClipSummarySchema.safeParse({ ...clip, durationSeconds: 0 }).success).toBe(
      false,
    );
    expect(HighlightClipSummarySchema.safeParse({ ...clip, durationSeconds: 1.5 }).success).toBe(
      false,
    );
  });

  it('signed URL — url 형식 · 만료 필수', () => {
    expect(
      SignedMediaUrlSchema.safeParse({
        url: 'https://media.example.test/clip?sig=x',
        expiresAt: '2026-01-01T01:00:00Z',
      }).success,
    ).toBe(true);
    expect(SignedMediaUrlSchema.safeParse({ url: 'not a url', expiresAt: null }).success).toBe(
      false,
    );
  });
});

describe('Stage 5 contracts — 공개 표면 (AC-5-08)', () => {
  const EXPECTED = {
    reflections: [
      'REFLECTION_NOTE_MAX_LENGTH',
      'REFLECTION_RATING_MAX',
      'REFLECTION_RATING_MIN',
      'ReflectionChecksSchema',
      'ReflectionNoteSchema',
      'ReflectionRatingSchema',
      'ReflectionSchema',
      'SubmitReflectionRequestSchema',
      'hasReflectionContent',
    ],
    analysis: ['AnalysisSessionStatusSchema', 'SessionAnalysisStatusSchema', 'ShortFeedbackSchema'],
    highlightClips: ['HighlightClipSummarySchema', 'SignedMediaUrlSchema'],
  } as const;
  const MODULES = { reflections, analysis, highlightClips } as const;

  it.each(Object.keys(EXPECTED) as (keyof typeof EXPECTED)[])(
    '%s 의 export 가 기대와 같고 진입점에서 같은 참조로 보인다',
    (domain) => {
      const module = MODULES[domain] as Record<string, unknown>;
      expect(Object.keys(module).sort()).toEqual([...EXPECTED[domain]].sort());
      const root = contracts as Record<string, unknown>;
      for (const name of EXPECTED[domain]) expect(root[name], name).toBe(module[name]);
    },
  );

  it('error code 신규 0 — 29종 유지 (C-10)', () => {
    expect(ERROR_CODES).toHaveLength(29);
    expect(ERROR_CODES).toContain('ANALYSIS_NOT_AVAILABLE');
    expect(ERROR_CODES).toContain('REFLECTION_ALREADY_SUBMITTED');
  });

  it('⛔ 폼 정의 · metricsPreview 식별자가 없다 (`N5-03` ⓐ · `N5-11` ⓐ)', () => {
    const exported = Object.keys(contracts);
    expect(exported.filter((name) => /reflectionform|formdefinition/i.test(name))).toEqual([]);
    expect(exported.filter((name) => /metrics/i.test(name))).toEqual([]);
  });
});
