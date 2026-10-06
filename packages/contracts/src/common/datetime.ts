import { z } from 'zod';

/**
 * 모든 시각 값은 ISO 8601 **UTC** 문자열이다 (`2026-09-20T09:00:00Z`).
 * offset 표기(`+09:00`)는 허용하지 않는다.
 * 근거: `docs/API_CONTRACTS.md` §1 Conventions — "시간 | ISO 8601 UTC 문자열".
 */
export const IsoDateTimeSchema = z.iso.datetime();

export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

/**
 * `occurredAt` 규약 (API_CONTRACTS §1 Conventions "시간").
 *
 * 서버가 요청을 수신한 시각과 구분되는 **클라이언트에서 실제로 사건이 발생한 시각**이다.
 * 오프라인 상태에서 발생한 세션 전이를 나중에 재전송할 때, 서버는 수신 시각이 아니라
 * 이 값을 사건 발생 시각으로 기록해야 한다 (Backend Handoff 요구사항).
 *
 * - 값 형식은 `IsoDateTimeSchema` 와 동일하다.
 * - 선택 필드다. 생략되면 서버 수신 시각을 사용한다.
 */
export const OccurredAtSchema = IsoDateTimeSchema;

export type OccurredAt = z.infer<typeof OccurredAtSchema>;

/** 오프라인 재전송 가능한 요청이 공통으로 갖는 `occurredAt` 필드 조각. */
export const OccurredAtFieldsSchema = z.object({
  occurredAt: OccurredAtSchema.optional(),
});

export type OccurredAtFields = z.infer<typeof OccurredAtFieldsSchema>;

/**
 * 달력 날짜 (`YYYY-MM-DD`) — Activity Card 의 `card_date` 처럼 **시각이 아니라 날짜**인 값.
 * 근거: Stage 3 Plan §7.1 `ActivityCardSchema.date`, `docs/API_CONTRACTS.md` §4 Stage 3.
 *
 * 기준 시간대는 **서버**가 소유한다 (`caregiver_profiles.timezone`, 결정 **D-10**).
 * Frontend 는 이 값을 그대로 신뢰하며 클라이언트에서 "오늘" 을 재판정하지 않는다.
 */
export const CalendarDateSchema = z.iso.date();

export type CalendarDate = z.infer<typeof CalendarDateSchema>;
