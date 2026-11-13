/**
 * 회고 fixture — Stage 5 Plan §8 (`session-completion:reflection-submitted`) · `docs/API_CONTRACTS.md` §3.10.
 *
 * 가상 데이터만 담는다 (실제 아동 데이터 금지). 값 모양은 Figma `91:691` 예시 상태와 같다 — 별 4 ·
 * 칩 `91:710` `Engaged` + `91:712` `Ask Questions` 선택 (Stage 5 Spec §0.2). 키는 contracts enum 기준.
 */
import { ReflectionSchema, type Reflection } from '@haru/contracts';

/** 이미 제출된 회고의 입력값 (재진입 읽기 전용 표시 — `N5-08` ⓐ, AC-5-30). */
export const MOCK_SUBMITTED_REFLECTION_INPUT: Readonly<
  Pick<Reflection, 'rating' | 'checks' | 'note'>
> = {
  rating: 4,
  checks: ['engaged', 'asked_questions'],
  note: 'Talk about the moon again',
};

export function createReflectionFixture(input: {
  id: string;
  sessionId: string;
  submittedAt: string;
  rating: Reflection['rating'];
  checks: Reflection['checks'];
  note: Reflection['note'];
}): Reflection {
  return ReflectionSchema.parse({
    id: input.id,
    sessionId: input.sessionId,
    rating: input.rating,
    checks: input.checks,
    note: input.note,
    submittedAt: input.submittedAt,
  });
}
