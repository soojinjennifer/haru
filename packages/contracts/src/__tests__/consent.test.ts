import { describe, expect, it } from 'vitest';

import {
  ConsentDocumentSchema,
  ConsentSourceSchema,
  CurrentConsentDocumentsSchema,
  RecordConsentsRequestSchema,
  ConsentStatusSchema,
  hasAllRequiredConsents,
} from '../index.js';

const documentId = '2a8b6f7e-9d51-4a0c-8f2e-7c5b1d3e4a90';

const document = {
  type: 'child_voice_data',
  documentId,
  version: '2026-09-01',
  required: true,
  title: "Child's voice data",
  url: 'https://haru.example.com/legal/child-voice-data',
};

/** 동의 contracts — `docs/API_CONTRACTS.md` §3.4 · §4 Stage 2 (C-1 · C-4). */
describe('ConsentDocument', () => {
  it('required 는 서버가 내려주는 값이다 — Frontend 가 필수 여부를 만들지 않는다', () => {
    expect(ConsentDocumentSchema.parse(document).required).toBe(true);
    expect(ConsentDocumentSchema.parse({ ...document, required: false }).required).toBe(false);
  });

  it('url 은 절대 URL 이어야 한다 (외부 링크로 연다 — D-4)', () => {
    expect(ConsentDocumentSchema.safeParse({ ...document, url: '/legal/tos' }).success).toBe(false);
  });

  it('current 응답은 문서 배열이다', () => {
    expect(CurrentConsentDocumentsSchema.parse({ documents: [document] }).documents).toHaveLength(
      1,
    );
  });
});

describe('RecordConsentsRequest — C-4', () => {
  const request = {
    items: [{ type: 'terms_of_service', documentId, action: 'granted' }],
    source: 'signup_email',
  };

  it('granted 기록만 받는다', () => {
    expect(RecordConsentsRequestSchema.parse(request)).toEqual(request);
  });

  it("action: 'revoked' 는 거부된다 (동의 철회 MVP 제외)", () => {
    const revoked = {
      ...request,
      items: [{ type: 'terms_of_service', documentId, action: 'revoked' }],
    };
    expect(RecordConsentsRequestSchema.safeParse(revoked).success).toBe(false);
  });

  it('source 는 ConsentSource 값이어야 한다', () => {
    expect(ConsentSourceSchema.options).toContain('reconsent');
    expect(RecordConsentsRequestSchema.safeParse({ ...request, source: 'import' }).success).toBe(
      false,
    );
  });

  it('빈 items 는 거부된다', () => {
    expect(RecordConsentsRequestSchema.safeParse({ ...request, items: [] }).success).toBe(false);
  });
});

describe('ConsentStatus · hasAllRequiredConsents', () => {
  it('missing 이 비어 있어야 필수 동의 충족이다', () => {
    const granted = ConsentStatusSchema.parse({
      required: ['terms_of_service', 'privacy_policy', 'child_voice_data'],
      missing: [],
      grantedAt: '2026-09-25T00:00:00Z',
    });
    expect(hasAllRequiredConsents(granted)).toBe(true);

    const pending = ConsentStatusSchema.parse({
      required: ['terms_of_service', 'privacy_policy', 'child_voice_data'],
      missing: ['child_voice_data'],
      grantedAt: null,
    });
    expect(hasAllRequiredConsents(pending)).toBe(false);
  });
});
