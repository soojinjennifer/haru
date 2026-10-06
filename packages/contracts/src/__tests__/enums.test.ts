import { describe, expect, it } from 'vitest';

import {
  ActivityOptionKindSchema,
  AgeBandSchema,
  AnalysisJobStatusSchema,
  AnalysisOutcomeSchema,
  BookOwnershipSchema,
  BookSourceSchema,
  CapabilitySchema,
  CaregiverRelationshipSchema,
  CompletedReasonSchema,
  ConsentActionSchema,
  ConsentSourceSchema,
  ConsentTypeSchema,
  DeletionRequestStatusSchema,
  DeletionScopeSchema,
  GenderFieldSchema,
  GenderSchema,
  GiftRequestStatusSchema,
  LibraryFilterSchema,
  LibrarySectionKeySchema,
  NotificationKindSchema,
  OnboardingStatusSchema,
  OnboardingStepSchema,
  ParentVerificationStatusSchema,
  PlanSchema,
  PromptKindSchema,
  PromptPhaseSchema,
  ReadingContextSchema,
  ReportEligibilitySchema,
  ReportStatusSchema,
  SURVEY_ANSWER_VALUES,
  SessionModeSchema,
  SessionStatusSchema,
  SurveyAnswerValueSchema,
  UploadStatusSchema,
} from '../enums/index.js';

/**
 * enum 값 스냅샷 — `docs/API_CONTRACTS.md` §2.1 · §2.2 표와 **정확히** 일치해야 한다
 * (Stage 1 Plan §11.6 AC-1-31 "enum 값 스냅샷 23종" → Stage 2 Plan §11.8 AC-2-47 로 **26종**
 * → Stage 3 Plan §7.1 로 **29종**: `AgeBand` · `PromptKind` 는 §2.2 표에 없던 추가분(보고 ④),
 * `PromptPhase` 는 **D-8** 승인으로 신설되었다
 * → Library 1라운드 Plan §7.3 으로 **32종**: `LibrarySectionKey`(표시 축) ·
 * `LibraryFilter`(쿼리 축) · `BookSource` 신설. `GiftRequestStatus` 는 **이미 존재**해 신규가
 * 아니다 — 전수 대조가 "enum 신규" 로 잘못 적은 것을 `L-OPEN` 정정에서 바로잡았다).
 * 값·순서를 바꾸려면 문서를 함께 갱신한다.
 */
interface EnumSnapshot {
  name: string;
  options: readonly (string | number)[];
  expected: readonly (string | number)[];
}

const ENUM_SNAPSHOTS: readonly EnumSnapshot[] = [
  // §2.1 Capability (#13)
  {
    name: 'Capability',
    options: CapabilitySchema.options,
    expected: [
      'emotion_regulation',
      'self_directed_agency',
      'cognitive_flexibility',
      'intrinsic_motivation',
    ],
  },
  // §2.2
  {
    name: 'SessionStatus',
    options: SessionStatusSchema.options,
    expected: [
      'ready',
      'recording',
      'paused',
      'completed',
      'analyzing',
      'analyzed',
      'failed',
      'abandoned',
    ],
  },
  {
    name: 'SessionMode',
    options: SessionModeSchema.options,
    expected: ['recorded', 'conversation_only'],
  },
  {
    name: 'CompletedReason',
    options: CompletedReasonSchema.options,
    expected: ['user_done', 'auto_timeout', 'recovered_after_crash'],
  },
  {
    name: 'AnalysisOutcome',
    options: AnalysisOutcomeSchema.options,
    expected: ['full', 'excluded_low_quality'],
  },
  {
    name: 'UploadStatus',
    options: UploadStatusSchema.options,
    expected: ['pending', 'uploaded', 'failed', 'deleted', 'expired'],
  },
  {
    name: 'ReadingContext',
    options: ReadingContextSchema.options,
    expected: ['now', 'bedtime', 'after_pickup', 'weekend_morning', 'in_the_car', 'custom_time'],
  },
  {
    name: 'ConsentType',
    options: ConsentTypeSchema.options,
    expected: [
      'terms_of_service',
      'privacy_policy',
      'child_voice_data',
      'marketing',
      'pilot_participation',
    ],
  },
  { name: 'ConsentAction', options: ConsentActionSchema.options, expected: ['granted'] },
  // Stage 2 추가 (Plan §7.1 · §18-④) — Stage 1 §2.2 표에 없던 3 종
  {
    name: 'ConsentSource',
    options: ConsentSourceSchema.options,
    expected: ['signup_email', 'signup_oauth', 'settings', 'reconsent'],
  },
  { name: 'Gender', options: GenderSchema.options, expected: ['girl', 'boy', 'prefer_not_to_say'] },
  {
    name: 'SurveyAnswerValue',
    options: SURVEY_ANSWER_VALUES,
    expected: [1, 2, 3, 4, 5, 'not_observed'],
  },
  {
    name: 'ParentVerificationStatus',
    options: ParentVerificationStatusSchema.options,
    expected: ['not_required', 'pending', 'verified', 'failed'],
  },
  {
    name: 'AnalysisJobStatus',
    options: AnalysisJobStatusSchema.options,
    expected: ['queued', 'running', 'succeeded', 'failed', 'cancelled'],
  },
  {
    name: 'ReportEligibility',
    options: ReportEligibilitySchema.options,
    expected: [
      'eligible',
      'insufficient_recorded_minutes',
      'insufficient_recorded_sessions',
      'insufficient_both',
      'cycle_in_progress',
    ],
  },
  {
    name: 'ReportStatus',
    options: ReportStatusSchema.options,
    expected: ['in_progress', 'generating', 'published', 'deferred', 'delayed'],
  },
  {
    name: 'ActivityOptionKind',
    options: ActivityOptionKindSchema.options,
    // `conversation_only` 는 approvals §12.12 로 **폐지**되었다 (SessionMode 쪽은 유지).
    expected: ['book', 'reread_book'],
  },
  {
    name: 'BookOwnership',
    options: BookOwnershipSchema.options,
    expected: ['owned', 'gifted', 'gift_pending', 'favorite_only'],
  },
  {
    name: 'GiftRequestStatus',
    options: GiftRequestStatusSchema.options,
    expected: ['requested', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected'],
  },
  {
    name: 'CaregiverRelationship',
    options: CaregiverRelationshipSchema.options,
    expected: ['mother', 'father', 'grandparent', 'babysitter', 'tutor', 'therapist', 'other'],
  },
  {
    name: 'OnboardingStep',
    options: OnboardingStepSchema.options,
    expected: [
      'child_info',
      'reading_together',
      'books_and_interests',
      'growing_together',
      'capability_items',
    ],
  },
  {
    name: 'OnboardingStatus',
    options: OnboardingStatusSchema.options,
    expected: ['not_started', 'in_progress', 'completed'],
  },
  { name: 'Plan', options: PlanSchema.options, expected: ['free'] },
  {
    name: 'DeletionScope',
    options: DeletionScopeSchema.options,
    expected: ['session_recording', 'all_data'],
  },
  {
    name: 'DeletionRequestStatus',
    options: DeletionRequestStatusSchema.options,
    expected: ['received', 'processing', 'completed', 'failed'],
  },
  {
    name: 'NotificationKind',
    options: NotificationKindSchema.options,
    expected: [
      'session_invite',
      'short_feedback_ready',
      'report_published',
      'report_deferred_encourage',
      'upload_failed_48h',
      'report_delayed',
    ],
  },
  {
    name: 'AgeBand',
    options: AgeBandSchema.options,
    expected: ['3_4', '5_6', '7_9'],
  },
  {
    name: 'PromptKind',
    options: PromptKindSchema.options,
    expected: ['question', 'follow_up'],
  },
  {
    name: 'PromptPhase',
    options: PromptPhaseSchema.options,
    expected: ['pre', 'post'],
  },
  // Library 1라운드 추가 (Library Plan §7.3) — 3 종
  {
    name: 'LibrarySectionKey',
    options: LibrarySectionKeySchema.options,
    expected: ['curated', 'favorites', 'finished'],
  },
  {
    name: 'LibraryFilter',
    options: LibraryFilterSchema.options,
    expected: ['owned', 'gifted', 'history', 'saved', 'curated'],
  },
  {
    name: 'BookSource',
    options: BookSourceSchema.options,
    expected: ['onboarding_favorite', 'library_add', 'gift_program', 'card_save'],
  },
];

describe('enums — API_CONTRACTS §2 값 스냅샷', () => {
  it('Library 1라운드까지 확정된 enum 은 32 종이다', () => {
    expect(ENUM_SNAPSHOTS).toHaveLength(32);
  });

  /*
   * `GiftRequestStatus` 는 Stage 2 에서 이미 등재됐다 — Library 가 **다시 선언하지 않는다**.
   * `BookOwnership` 의 `favorite_only` 도 이미 있다 (`L-D1` 저장 축).
   */
  it('Library 가 기존 enum 을 다시 선언하지 않는다', () => {
    expect(GiftRequestStatusSchema.options).toHaveLength(6);
    expect(BookOwnershipSchema.options).toContain('favorite_only');
  });

  /* 표시 축과 쿼리 축은 **1:1 이 아니다** (`L-OPEN-14`) — 같은 enum 으로 합치지 않는다. */
  it('LibrarySectionKey 와 LibraryFilter 는 서로 다른 축이다', () => {
    expect(LibrarySectionKeySchema.safeParse('saved').success).toBe(false);
    expect(LibraryFilterSchema.safeParse('favorites').success).toBe(false);
    expect(LibrarySectionKeySchema.safeParse('reading_now').success).toBe(false);
  });

  it.each(ENUM_SNAPSHOTS)('$name 의 값과 순서가 문서와 일치한다', ({ options, expected }) => {
    expect(options).toEqual(expected);
  });
});

describe('enums — 결정으로 제외된 값이 존재하지 않는다', () => {
  it('ConsentAction 에 revoked 가 없다 (C-4 — 동의 철회 MVP 제외)', () => {
    expect(ConsentActionSchema.safeParse('revoked').success).toBe(false);
  });

  it('AnalysisOutcome 에 skipped_* 값이 없다 (#16, C-4)', () => {
    expect(AnalysisOutcomeSchema.safeParse('skipped_audio_deleted').success).toBe(false);
    expect(AnalysisOutcomeSchema.safeParse('skipped_consent_revoked').success).toBe(false);
  });

  it('SessionStatus 에 retry 가 없다 (retry 는 상태가 아니라 행위)', () => {
    expect(SessionStatusSchema.safeParse('retry').success).toBe(false);
  });
});

describe('enums — 필드 수준 규약', () => {
  it('Gender 필드는 nullable 이고 미응답은 null 이다 (C-7)', () => {
    expect(GenderFieldSchema.parse(null)).toBeNull();
    expect(GenderFieldSchema.parse('prefer_not_to_say')).toBe('prefer_not_to_say');
    expect(GenderSchema.safeParse(null).success).toBe(false);
  });

  it('SurveyAnswerValue 는 1–5 숫자 또는 not_observed 만 받는다 (C-8)', () => {
    for (const value of [1, 2, 3, 4, 5, 'not_observed'] as const) {
      expect(SurveyAnswerValueSchema.parse(value)).toBe(value);
    }
    expect(SurveyAnswerValueSchema.safeParse(0).success).toBe(false);
    expect(SurveyAnswerValueSchema.safeParse(6).success).toBe(false);
    expect(SurveyAnswerValueSchema.safeParse('1').success).toBe(false);
    expect(SurveyAnswerValueSchema.safeParse(null).success).toBe(false);
  });
});
