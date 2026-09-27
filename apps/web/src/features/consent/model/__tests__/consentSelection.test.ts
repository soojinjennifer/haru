/**
 * 동의 선택 규칙 — 순수 함수 단위 테스트. AC-2-10 · AC-2-11 · C-1 · C-4.
 *
 * 화면 없이 규칙을 고정한다: **필수 여부는 응답 값에서만 나온다**, 선택하지 않은 항목은
 * 요청에 들어가지 않는다, 항목별 문서 버전이 기록된다.
 */
import { RecordConsentsRequestSchema, type ConsentDocument } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import {
  buildRecordConsentsRequest,
  canSubmit,
  consentSourceFor,
  EMPTY_SELECTION,
  isReconsent,
  isSelected,
  missingRequired,
  toggleSelection,
} from '../consentSelection';

/** 테스트 전용 문서 — Mock fixture 와 독립적으로 "서버가 뭐라고 하든" 규칙이 도는지 본다. */
function doc(
  type: ConsentDocument['type'],
  required: boolean,
  documentId: string,
): ConsentDocument {
  return {
    type,
    documentId,
    version: '2026-01-01',
    required,
    title: `${type} document`,
    url: `https://haru.invalid/legal/${type}--placeholder`,
  };
}

const DOCUMENTS: readonly ConsentDocument[] = [
  doc('terms_of_service', true, '11111111-1111-4111-8111-111111111111'),
  doc('privacy_policy', true, '22222222-2222-4222-8222-222222222222'),
  doc('child_voice_data', true, '33333333-3333-4333-8333-333333333333'),
  doc('marketing', false, '44444444-4444-4444-8444-444444444444'),
  doc('pilot_participation', false, '55555555-5555-4555-8555-555555555555'),
];

function selectAll(types: readonly ConsentDocument['type'][]) {
  return types.reduce((selection, type) => toggleSelection(selection, type, true), EMPTY_SELECTION);
}

describe('필수 여부는 응답 값에서만 나온다 (AC-2-10)', () => {
  it('아무것도 고르지 않으면 required=true 인 항목이 모두 missing 이다', () => {
    expect(missingRequired(DOCUMENTS, EMPTY_SELECTION)).toStrictEqual([
      'terms_of_service',
      'privacy_policy',
      'child_voice_data',
    ]);
  });

  it('서버가 필수 여부를 바꾸면 규칙도 그대로 따라간다 (하드코딩 0건)', () => {
    const flipped = DOCUMENTS.map((document) => ({ ...document, required: !document.required }));

    expect(missingRequired(flipped, EMPTY_SELECTION)).toStrictEqual([
      'marketing',
      'pilot_participation',
    ]);
  });

  it('문서가 0건이면 제출할 수 없다', () => {
    expect(canSubmit([], EMPTY_SELECTION)).toBe(false);
  });
});

describe('제출 가능 조건 (AC-2-11)', () => {
  it('필수 3종을 모두 고르면 제출할 수 있다 (선택 항목은 없어도 된다)', () => {
    const selection = selectAll(['terms_of_service', 'privacy_policy', 'child_voice_data']);

    expect(canSubmit(DOCUMENTS, selection)).toBe(true);
  });

  it('필수 1종이라도 빠지면 제출할 수 없다', () => {
    const selection = selectAll(['terms_of_service', 'privacy_policy', 'marketing']);

    expect(canSubmit(DOCUMENTS, selection)).toBe(false);
    expect(missingRequired(DOCUMENTS, selection)).toStrictEqual(['child_voice_data']);
  });

  it('체크를 해제하면 다시 막힌다', () => {
    const selection = toggleSelection(
      selectAll(['terms_of_service', 'privacy_policy', 'child_voice_data']),
      'child_voice_data',
      false,
    );

    expect(isSelected(selection, 'child_voice_data')).toBe(false);
    expect(canSubmit(DOCUMENTS, selection)).toBe(false);
  });
});

describe('요청 조립 — 항목별 문서 버전 · 철회 없음 (C-1 · C-4)', () => {
  it('고른 항목만 담고, 각 항목에 그 문서의 documentId 를 붙인다', () => {
    const request = buildRecordConsentsRequest(
      DOCUMENTS,
      selectAll(['terms_of_service', 'privacy_policy', 'child_voice_data', 'marketing']),
      'signup_email',
    );

    expect(RecordConsentsRequestSchema.parse(request)).toStrictEqual(request);
    expect(request.items).toStrictEqual([
      {
        type: 'terms_of_service',
        documentId: '11111111-1111-4111-8111-111111111111',
        action: 'granted',
      },
      {
        type: 'privacy_policy',
        documentId: '22222222-2222-4222-8222-222222222222',
        action: 'granted',
      },
      {
        type: 'child_voice_data',
        documentId: '33333333-3333-4333-8333-333333333333',
        action: 'granted',
      },
      { type: 'marketing', documentId: '44444444-4444-4444-8444-444444444444', action: 'granted' },
    ]);
  });

  it("action 은 언제나 'granted' 다 — 철회는 존재하지 않는다 (C-4)", () => {
    const request = buildRecordConsentsRequest(DOCUMENTS, selectAll(['marketing']), 'settings');

    expect(request.items.every((item) => item.action === 'granted')).toBe(true);
  });

  it('고르지 않은 선택 항목은 요청에 들어가지 않는다 (거부를 전송하지 않는다)', () => {
    const request = buildRecordConsentsRequest(
      DOCUMENTS,
      selectAll(['terms_of_service', 'privacy_policy', 'child_voice_data']),
      'signup_email',
    );

    expect(request.items.map((item) => item.type)).not.toContain('marketing');
    expect(request.items.map((item) => item.type)).not.toContain('pilot_participation');
  });

  it('요청 payload 에 아동 데이터 필드가 없다 (AC-2-13)', () => {
    const request = buildRecordConsentsRequest(DOCUMENTS, selectAll(['marketing']), 'signup_email');
    const serialized = JSON.stringify(request);

    for (const key of ['firstName', 'lastName', 'birthYearMonth', 'gender', 'answers', 'child']) {
      expect(serialized).not.toContain(key);
    }
  });
});

describe('재동의 판정 (Design Spec §2.6)', () => {
  it('이전 기록이 있고 지금 빠진 항목이 있으면 재동의다', () => {
    expect(
      isReconsent({
        required: ['terms_of_service'],
        missing: ['terms_of_service'],
        grantedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('최초 동의(기록 없음)는 재동의가 아니다', () => {
    expect(
      isReconsent({
        required: ['terms_of_service'],
        missing: ['terms_of_service'],
        grantedAt: null,
      }),
    ).toBe(false);
  });

  it('빠진 항목이 없으면 재동의가 아니다', () => {
    expect(
      isReconsent({
        required: ['terms_of_service'],
        missing: [],
        grantedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('source 는 재동의면 reconsent, 아니면 가입 경로다', () => {
    expect(
      consentSourceFor({
        required: [],
        missing: ['marketing'],
        grantedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe('reconsent');
    expect(consentSourceFor({ required: [], missing: [], grantedAt: null })).toBe('signup_email');
  });
});
