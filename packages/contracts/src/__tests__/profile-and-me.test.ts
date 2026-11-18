import { describe, expect, it } from 'vitest';

import {
  BookSummarySchema,
  CAPABILITY_HIGHLIGHT_COUNT,
  CapabilitySnapshotSchema,
  ChildProfileSchema,
  MeResponseSchema,
  PAGE_LIMIT_DEFAULT,
  PersonaSchema,
  ProfileResultSchema,
  SearchBooksRequestSchema,
  SearchBooksResponseSchema,
  SetGrowthCapabilityRequestSchema,
  UpdateCaregiverRequestSchema,
} from '../index.js';

/** Me · Child Profile · 책 검색 — `docs/API_CONTRACTS.md` §4 Stage 2. */
const childId = '4c2a1b9e-0e33-4f8a-bb21-5d8c7a0e1f42';
const caregiverId = '9a1f0c22-4d6b-4e77-bd3a-1e6f8c2b7d05';

const snapshot = {
  id: '7b6d5c4e-3a21-4b0f-9c8d-2e1f0a3b4c5d',
  source: 'onboarding_survey',
  scoringVersion: 'v1',
  createdAt: '2026-09-25T00:00:00Z',
  scores: [
    { capability: 'emotion_regulation', score: 4.5, itemCount: 2, missingCount: 0 },
    { capability: 'self_directed_agency', score: 2.3, itemCount: 3, missingCount: 0 },
    { capability: 'cognitive_flexibility', score: null, itemCount: 0, missingCount: 2 },
    { capability: 'intrinsic_motivation', score: 2, itemCount: 3, missingCount: 0 },
  ],
};

const persona = {
  id: '11111111-2222-4333-8444-555555555555',
  name: 'The Curious Builder',
  description: 'Emma notices small details and likes to try again.',
  isFallback: false,
  createdAt: '2026-09-25T00:00:00Z',
};

const child = {
  id: childId,
  firstName: 'Emma',
  birthYearMonth: '2021-04',
  gender: null,
  languageEnvironment: ['english'],
  readingRoutine: 'daily',
  topicTags: ['narrative'],
  growthGoals: ['emotion_regulation'],
  ownedBooks: [],
  createdAt: '2026-09-25T00:00:00Z',
};

describe('CapabilitySnapshot — D-2 ①', () => {
  it('score: null 을 그대로 parse 한다', () => {
    const parsed = CapabilitySnapshotSchema.parse(snapshot);
    expect(parsed.scores[2]).toEqual({
      capability: 'cognitive_flexibility',
      score: null,
      itemCount: 0,
      missingCount: 2,
    });
  });

  it('4대 역량 전부를 요구한다 (결측도 행으로 존재한다)', () => {
    expect(
      CapabilitySnapshotSchema.safeParse({ ...snapshot, scores: snapshot.scores.slice(0, 3) })
        .success,
    ).toBe(false);
  });

  it('점수 범위를 벗어나면 거부한다', () => {
    const scores = snapshot.scores.map((entry, index) =>
      index === 0 ? { ...entry, score: 5.4 } : entry,
    );
    expect(CapabilitySnapshotSchema.safeParse({ ...snapshot, scores }).success).toBe(false);
  });
});

describe('ChildProfile · ProfileResult', () => {
  it('강점 · growing edge 는 최대 2개이며 결측이 많으면 줄어든다 (D-2 ③)', () => {
    expect(CAPABILITY_HIGHLIGHT_COUNT).toBe(2);
    const profile = ChildProfileSchema.parse({
      child,
      latestSnapshot: snapshot,
      strengths: ['emotion_regulation'],
      growingEdges: ['intrinsic_motivation'],
      persona,
      growthCapability: 'intrinsic_motivation',
      profileUpdatedAt: null,
    });
    expect(profile.strengths).toHaveLength(1);
  });

  it('2개를 넘으면 거부한다', () => {
    expect(
      ChildProfileSchema.safeParse({
        child,
        latestSnapshot: snapshot,
        strengths: ['emotion_regulation', 'self_directed_agency', 'cognitive_flexibility'],
        growingEdges: [],
        persona,
        growthCapability: null,
        profileUpdatedAt: null,
      }).success,
    ).toBe(false);
  });

  it('전 역량 결측이면 growthCapability · suggestedCapability 가 null 일 수 있다 (D-2 ⑤)', () => {
    expect(
      ChildProfileSchema.parse({
        child,
        latestSnapshot: snapshot,
        strengths: [],
        growingEdges: [],
        persona,
        growthCapability: null,
        profileUpdatedAt: null,
      }).growthCapability,
    ).toBeNull();

    expect(
      ProfileResultSchema.parse({ child, snapshot, persona, suggestedCapability: null })
        .suggestedCapability,
    ).toBeNull();
  });

  it('persona 는 fallback 여부만 노출한다 (생성 모드 원값은 화면에 없다)', () => {
    expect(PersonaSchema.parse({ ...persona, isFallback: true }).isFallback).toBe(true);
  });

  it('발전 역량 변경 요청은 역량 하나만 받는다', () => {
    expect(SetGrowthCapabilityRequestSchema.parse({ capability: 'cognitive_flexibility' })).toEqual(
      {
        capability: 'cognitive_flexibility',
      },
    );
    expect(SetGrowthCapabilityRequestSchema.safeParse({ capability: 'grit' }).success).toBe(false);
  });
});

describe('MeResponse — Route Guard 판정 입력 (D-5 · D-6)', () => {
  const me = {
    caregiver: {
      id: caregiverId,
      displayName: 'Jamie Park',
      timezone: 'America/Los_Angeles',
    },
    consentStatus: {
      required: ['terms_of_service', 'privacy_policy', 'child_voice_data'],
      missing: ['child_voice_data'],
      grantedAt: null,
    },
    parentVerification: { status: 'not_required' },
    onboardingStatus: 'not_started',
    plan: 'free',
  };

  it('동의 전 · 온보딩 전 상태를 표현할 수 있다', () => {
    const parsed = MeResponseSchema.parse(me);
    expect(parsed.child).toBeUndefined();
    expect(parsed.consentStatus.missing).toEqual(['child_voice_data']);
  });

  it('온보딩 완료 후에는 아이 최소 참조가 붙는다 (first name 만 — C-6)', () => {
    const parsed = MeResponseSchema.parse({
      ...me,
      onboardingStatus: 'completed',
      child: { id: childId, firstName: 'Emma' },
    });
    expect(parsed.child).toEqual({ id: childId, firstName: 'Emma' });
  });

  it('프로필 결과 확인 플래그를 갖지 않는다 (D-6)', () => {
    const parsed = MeResponseSchema.parse({
      ...me,
      profileResultAcknowledgedAt: '2026-09-25T00:00:00Z',
    }) as Record<string, unknown>;
    expect(parsed['profileResultAcknowledgedAt']).toBeUndefined();
  });

  it('plan 은 free 하나다 (PRD §7.1)', () => {
    expect(MeResponseSchema.safeParse({ ...me, plan: 'pro' }).success).toBe(false);
  });
});

describe('UpdateCaregiverRequest — D-16', () => {
  it('보호자 소유 필드만 받는다', () => {
    expect(UpdateCaregiverRequestSchema.parse({ timezone: 'America/New_York' })).toEqual({
      timezone: 'America/New_York',
    });
    expect(UpdateCaregiverRequestSchema.parse({ relationship: 'mother' })).toEqual({
      relationship: 'mother',
    });
  });

  it('아이 필드는 parse 결과에 남지 않는다', () => {
    const parsed = UpdateCaregiverRequestSchema.parse({
      relationship: 'father',
      firstName: 'Emma',
      birthYearMonth: '2021-04',
    }) as Record<string, unknown>;
    expect(parsed).toEqual({ relationship: 'father' });
  });
});

describe('책 검색 — D-17 최소 범위', () => {
  const book = {
    id: '33333333-4444-4555-8666-777777777777',
    title: 'The Very Hungry Caterpillar',
    author: 'Eric Carle',
  };

  it('BookSummary 는 id · title · author + 선택 coverUrl 이다', () => {
    expect(BookSummarySchema.parse(book)).toEqual(book);
    expect(
      BookSummarySchema.parse({ ...book, coverUrl: 'https://example.com/c.jpg' }).coverUrl,
    ).toBe('https://example.com/c.jpg');
  });

  it('Stage 3 필드(소유 상태 · 프롬프트)는 parse 결과에 남지 않는다', () => {
    const parsed = BookSummarySchema.parse({
      ...book,
      ownership: 'owned',
      prompts: [{ text: 'x' }],
    }) as Record<string, unknown>;
    expect(parsed['ownership']).toBeUndefined();
    expect(parsed['prompts']).toBeUndefined();
  });

  it('검색 요청은 q 를 요구하고 cursor pagination 기본값을 채운다', () => {
    expect(SearchBooksRequestSchema.parse({ q: 'caterpillar' })).toEqual({
      q: 'caterpillar',
      limit: PAGE_LIMIT_DEFAULT,
    });
    expect(SearchBooksRequestSchema.safeParse({ q: '   ' }).success).toBe(false);
    expect(SearchBooksRequestSchema.safeParse({ q: 'x', limit: 51 }).success).toBe(false);
  });

  it('검색 응답은 items + nextCursor 다 (빈 결과 포함)', () => {
    expect(
      SearchBooksResponseSchema.parse({ items: [book], nextCursor: 'abc' }).items,
    ).toHaveLength(1);
    expect(SearchBooksResponseSchema.parse({ items: [], nextCursor: null })).toEqual({
      items: [],
      nextCursor: null,
    });
  });
});
