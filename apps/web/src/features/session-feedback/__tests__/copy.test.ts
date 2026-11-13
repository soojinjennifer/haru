/**
 * 피드백 화면 copy — 금칙어 0 (AC-5-44) · 수치·기한 약속 0 (AC-5-36) · Spec §2.3 초안 원문 (`D5-4`).
 */
import { describe, expect, it } from 'vitest';

import { sessionFeedbackCopy } from '../copy';

const FORBIDDEN = [
  'diagnos',
  'delay',
  'behind',
  'normal',
  'score',
  'worse',
  'better than',
  'peers',
] as const;

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
  return [];
}

describe('sessionFeedbackCopy', () => {
  const all = strings(sessionFeedbackCopy);

  it('진단·판정·비교 표현 0', () => {
    for (const text of all) {
      for (const word of FORBIDDEN) expect(text.toLowerCase()).not.toContain(word);
    }
  });

  it('pending 은 수치·기한 약속 0 (진행률 · 시간 숫자 없음)', () => {
    const pending = `${sessionFeedbackCopy.pending.title} ${sessionFeedbackCopy.pending.description}`;
    expect(pending).not.toMatch(/\d/);
    expect(pending).not.toMatch(/%|hour/i);
  });

  it('Spec §2.3 문구 원문', () => {
    expect(sessionFeedbackCopy.title).toBe('Storytime notes');
    expect(sessionFeedbackCopy.pending).toEqual({
      title: "We're preparing today's notes",
      description: "They're usually ready by tomorrow. You can close this screen.",
    });
    expect(sessionFeedbackCopy.failed.title).toBe('This one is taking a little longer');
    expect(sessionFeedbackCopy.noRecording).toEqual({
      title: 'No notes for this storytime',
      description: "The recording for this storytime isn't available, so there are no notes.",
    });
  });
});
