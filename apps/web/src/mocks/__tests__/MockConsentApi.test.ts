/**
 * `MockConsentApi` scenario 테스트 — AC-2-10 · AC-2-13 · AC-2-15 · AC-2-16 · AC-2-18
 * · AC-2-50 · AC-2-51 · AC-2-52 · AC-2-53.
 */
import {
  ConsentStatusSchema,
  CurrentConsentDocumentsSchema,
  type RecordConsentsRequest,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer, isHaruApiError, NetworkError } from '../../shared/api/helpers';
import { isPlaceholderLegalUrl } from '../../shared/config/legal-links';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { createMockConsentApi, CONSENT_SCENARIO_KEYS } from '../consent/MockConsentApi';
import { createMockConsentState } from '../consent/consentState';
import { createConsentDocumentsFixture } from '../fixtures/consent';
import { createRequestLog, findChildDataKeys } from '../request-log';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const EPOCH = Date.UTC(2026, 0, 1);
const KEY = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER_KEY = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function makeApi(scenario = 'success') {
  const requestLog = createRequestLog();
  const consentState = createMockConsentState();
  const api = createMockConsentApi({
    store: createScenarioStore([createScenarioSource('url', { consents: scenario })]),
    clock: createFixedClock(EPOCH),
    idFactory: createSeededIdFactory('test'),
    timer: createImmediateTimer(),
    consentState,
    requestLog,
  });

  return { api, requestLog, consentState };
}

/** 현재 문서 묶음에서 원하는 종류만 골라 요청을 만든다. */
function requestFor(
  types: readonly RecordConsentsRequest['items'][number]['type'][],
  set: 'current' | 'updated' = 'current',
): RecordConsentsRequest {
  return {
    items: createConsentDocumentsFixture(set)
      .documents.filter((document) => types.includes(document.type))
      .map((document) => ({
        type: document.type,
        documentId: document.documentId,
        action: 'granted' as const,
      })),
    source: 'signup_email',
  };
}

const ALL_REQUIRED = ['terms_of_service', 'privacy_policy', 'child_voice_data'] as const;

describe('scenario catalogue (AC-2-53)', () => {
  it('consents 그룹 key 는 catalogue 값만 쓴다', () => {
    expect([...CONSENT_SCENARIO_KEYS]).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'consent-missing',
      'consent-version-outdated',
    ]);
  });

  it('deprecated alias 와 제거된 key(consent-revoked — C-4) 를 쓰지 않는다', () => {
    const forbidden = ['default', 'slow', 'consent-revoked'];

    expect(CONSENT_SCENARIO_KEYS.filter((key) => forbidden.includes(key))).toStrictEqual([]);
  });
});

describe('GET /v1/consent-documents/current — 5항목 · 필수 여부는 서버 값 (AC-2-10 · C-1)', () => {
  it('contracts schema 를 통과하는 5종을 돌려준다', async () => {
    const { api } = makeApi();
    const response = await api.getCurrentDocuments();

    expect(CurrentConsentDocumentsSchema.parse(response)).toStrictEqual(response);
    expect(response.documents.map((document) => document.type)).toStrictEqual([
      'terms_of_service',
      'privacy_policy',
      'child_voice_data',
      'marketing',
      'pilot_participation',
    ]);
  });

  it('필수 3 · 선택 2 로 내려오고 각 항목에 문서 버전이 있다', async () => {
    const { api } = makeApi();
    const { documents } = await api.getCurrentDocuments();

    expect(documents.filter((document) => document.required).map((d) => d.type)).toStrictEqual([
      ...ALL_REQUIRED,
    ]);
    expect(documents.filter((document) => !document.required).map((d) => d.type)).toStrictEqual([
      'marketing',
      'pilot_participation',
    ]);
    expect(documents.every((document) => document.version.length > 0)).toBe(true);
  });

  it('문서 url 이 실제 문서가 아님이 드러난다 — 출시 전 차단 항목 (approvals §4.1)', async () => {
    const { api } = makeApi();
    const { documents } = await api.getCurrentDocuments();

    expect(documents.map((document) => isPlaceholderLegalUrl(document.url))).toStrictEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
    // 항목마다 서로 다른 문서를 가리킨다 (같은 링크를 돌려쓰지 않는다).
    expect(new Set(documents.map((document) => document.url)).size).toBe(5);
  });

  it('약관 **본문**을 fixture 가 갖고 있지 않다 (AC-2-18, D-4)', async () => {
    const { api } = makeApi();
    const { documents } = await api.getCurrentDocuments();

    for (const document of documents) {
      // 제목·버전·링크만 있고 본문 필드가 없다.
      expect(Object.keys(document).sort()).toStrictEqual([
        'documentId',
        'required',
        'title',
        'type',
        'url',
        'version',
      ]);
    }
  });

  it('같은 scenario 는 항상 같은 응답 바이트다 (AC-2-52)', async () => {
    const first = await makeApi().api.getCurrentDocuments();
    const second = await makeApi().api.getCurrentDocuments();

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('공통 상태 scenario (AC-2-50 · AC-2-51)', () => {
  it('error → Error Envelope 을 던진다', async () => {
    const { api } = makeApi('error');

    await expect(api.getCurrentDocuments()).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'INTERNAL_ERROR',
    );
  });

  it('offline → NetworkError 다 (Error Envelope 없음)', async () => {
    const { api } = makeApi('offline');

    await expect(api.getCurrentDocuments()).rejects.toBeInstanceOf(NetworkError);
  });

  it('retry → 1회차 실패 후 2회차 성공', async () => {
    const { api } = makeApi('retry');

    await expect(api.getCurrentDocuments()).rejects.toSatisfy(isHaruApiError);
    await expect(api.getCurrentDocuments()).resolves.toBeDefined();
  });

  it('loading → 주입 timer 로 지연 후 성공한다', async () => {
    const { api } = makeApi('loading');

    await expect(api.getCurrentDocuments()).resolves.toBeDefined();
  });

  it('consent-missing 에서도 문서 조회·기록은 정상 동작한다', async () => {
    const { api } = makeApi('consent-missing');

    await expect(api.getCurrentDocuments()).resolves.toBeDefined();
    await expect(
      api.record(requestFor(ALL_REQUIRED), { idempotencyKey: KEY }),
    ).resolves.toMatchObject({ missing: [] });
  });
});

describe('POST /v1/consents — 기록 성공', () => {
  it('필수 3종을 기록하면 missing 이 비고 grantedAt 이 생긴다', async () => {
    const { api } = makeApi();
    const status = await api.record(requestFor(ALL_REQUIRED), { idempotencyKey: KEY });

    expect(ConsentStatusSchema.parse(status)).toStrictEqual(status);
    expect(status.missing).toStrictEqual([]);
    expect(status.grantedAt).not.toBeNull();
  });

  it('필수 일부만 담긴 요청은 서버 규칙으로 거부된다 (화면이 막더라도 별도 검사)', async () => {
    const { api, consentState } = makeApi();

    await expect(
      api.record(requestFor(['terms_of_service', 'privacy_policy']), { idempotencyKey: KEY }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'VALIDATION_FAILED',
    );
    // 거부된 요청은 상태를 바꾸지 않는다.
    expect(consentState.granted()).toStrictEqual([]);
  });

  it('선택 항목만 담긴 요청은 필수 누락으로 거부된다 (VALIDATION_FAILED)', async () => {
    const { api } = makeApi();

    await expect(api.record(requestFor(['marketing']), { idempotencyKey: KEY })).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'VALIDATION_FAILED',
    );
  });

  it('동의 기록이 MockConsentState 에 남아 GET /v1/me 와 공유된다', async () => {
    const { api, consentState } = makeApi();
    await api.record(requestFor([...ALL_REQUIRED, 'marketing']), { idempotencyKey: KEY });

    expect(consentState.granted()).toStrictEqual([
      'child_voice_data',
      'marketing',
      'privacy_policy',
      'terms_of_service',
    ]);
    expect(consentState.missingFrom([...ALL_REQUIRED])).toStrictEqual([]);
  });
});

describe('문서 버전 — 구버전 제출 거부 · 재동의 (AC-2-15, P2-BIP-04)', () => {
  it('현재와 다른 documentId 를 제출하면 CONSENT_VERSION_OUTDATED 다', async () => {
    const { api } = makeApi();

    await expect(
      // 갱신본 id 로 제출 — 현재 배포본과 다르다.
      api.record(requestFor(ALL_REQUIRED, 'updated'), { idempotencyKey: KEY }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'CONSENT_VERSION_OUTDATED',
    );
  });

  it('consent-version-outdated 는 버전이 올라간 문서를 내려주고, 그 버전으로는 기록된다', async () => {
    const { api } = makeApi('consent-version-outdated');
    const { documents } = await api.getCurrentDocuments();

    expect(new Set(documents.map((document) => document.version))).toStrictEqual(
      new Set(['2026-06-01']),
    );

    await expect(
      api.record(requestFor(ALL_REQUIRED, 'updated'), { idempotencyKey: KEY }),
    ).resolves.toMatchObject({ missing: [] });
  });

  it('consent-version-outdated 에서 **구버전** id 제출은 여전히 거부된다', async () => {
    const { api } = makeApi('consent-version-outdated');

    await expect(
      api.record(requestFor(ALL_REQUIRED, 'current'), { idempotencyKey: KEY }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'CONSENT_VERSION_OUTDATED',
    );
  });
});

describe('Idempotency-Key 보관·재생 (AC-2-16 · S2-R12)', () => {
  it('같은 key + 같은 body → 최초 응답을 그대로 재생한다', async () => {
    const { api, requestLog } = makeApi();
    const request = requestFor(ALL_REQUIRED);

    const first = await api.record(request, { idempotencyKey: KEY });
    const replay = await api.record(request, { idempotencyKey: KEY });

    expect(replay).toStrictEqual(first);
    // 요청은 두 번 나갔지만 상태는 한 번만 바뀐다.
    expect(
      requestLog.entries().filter((entry) => entry.operation === 'POST /v1/consents'),
    ).toHaveLength(2);
  });

  it('같은 key + 다른 body → IDEMPOTENCY_KEY_REUSED', async () => {
    const { api } = makeApi();
    await api.record(requestFor(ALL_REQUIRED), { idempotencyKey: KEY });

    await expect(
      api.record(requestFor([...ALL_REQUIRED, 'marketing']), { idempotencyKey: KEY }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'IDEMPOTENCY_KEY_REUSED',
    );
  });

  it('다른 key 면 별도 요청으로 처리된다', async () => {
    const { api } = makeApi();
    await api.record(requestFor(ALL_REQUIRED), { idempotencyKey: KEY });

    await expect(
      api.record(requestFor([...ALL_REQUIRED, 'marketing']), { idempotencyKey: OTHER_KEY }),
    ).resolves.toMatchObject({ missing: [] });
  });

  it('retry: 1회차 실패는 저장되지 않아 같은 key 로 재시도하면 성공한다', async () => {
    const { api } = makeApi('retry');
    const request = requestFor(ALL_REQUIRED);

    await expect(api.record(request, { idempotencyKey: KEY })).rejects.toSatisfy(isHaruApiError);
    await expect(api.record(request, { idempotencyKey: KEY })).resolves.toMatchObject({
      missing: [],
    });
  });
});

describe('요청 로그 — 아동 데이터 0건 (AC-2-13)', () => {
  it('문서 조회 · 동의 기록 요청 어디에도 아동 데이터 키가 없다', async () => {
    const { api, requestLog } = makeApi();

    await api.getCurrentDocuments();
    await api.record(requestFor([...ALL_REQUIRED, 'marketing', 'pilot_participation']), {
      idempotencyKey: KEY,
    });

    // 검사가 헛돌지 않도록 요청이 실제로 기록되었는지 먼저 확인한다.
    expect(requestLog.entries().map((entry) => entry.operation)).toStrictEqual([
      'GET /v1/consent-documents/current',
      'POST /v1/consents',
    ]);
    expect(findChildDataKeys(requestLog.entries())).toStrictEqual([]);
  });

  it('아이 필드가 섞여 들어와도 Adapter 경계 parse 가 걷어내 서버·로그로 나가지 않는다', async () => {
    const { api, requestLog } = makeApi();
    const polluted = {
      ...requestFor(ALL_REQUIRED),
      firstName: 'Nova',
    } as unknown as RecordConsentsRequest;

    await api.record(polluted, { idempotencyKey: KEY });

    // `RecordConsentsRequestSchema` 는 contracts 정의대로 알 수 없는 키를 **제거**한다.
    // Adapter 는 원본이 아니라 parse 결과만 기록·전송하므로 아동 데이터가 새지 않는다.
    expect(findChildDataKeys(requestLog.entries())).toStrictEqual([]);
    expect(JSON.stringify(requestLog.entries())).not.toContain('Nova');
  });

  it('필수 필드가 빠진 요청은 Adapter 경계에서 VALIDATION_FAILED 로 거부된다', async () => {
    const { api } = makeApi();
    const broken = { items: [], source: 'signup_email' } as unknown as RecordConsentsRequest;

    await expect(api.record(broken, { idempotencyKey: KEY })).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'VALIDATION_FAILED',
    );
  });
});
