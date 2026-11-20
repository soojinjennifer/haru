/**
 * Stage 7 Http Adapter 골격 — `S7-A`. 실제 Backend 연동은 `BACKEND_INTEGRATION_PENDING` 이며,
 * 여기서는 **경로 · method · Idempotency-Key · schema parse** 규약만 고정한다 (Mock ↔ Http 교체 가능성).
 * 응답 본문은 Mock 이 만든 값을 그대로 쓴다 — 두 Adapter 가 같은 contract 를 공유한다는 증거.
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import {
  createMockApiClientsBundle,
  MOCK_HIGHLIGHT_CLIP_IDS,
  MOCK_REPORT_IDS,
} from '../../../mocks';
import { createSeededIdFactory } from '../../lib/idFactory';
import { createImmediateTimer } from '../helpers';
import { createHttpApiClients, createHttpClient } from '../http';
import { createHttpHighlightClipApi } from '../http/HttpHighlightClipApi';
import { createHttpProgressApi } from '../http/HttpProgressApi';
import { createHttpReportApi } from '../http/HttpReportApi';
import { createHttpReportPdfApi } from '../http/HttpReportPdfApi';

const BASE_URL = 'https://api.example.invalid/v1';
const CHILD_ID = '44444444-4444-4444-8444-444444444444';
const REPORT_ID = MOCK_REPORT_IDS.latest;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function client(fetchImpl: ReturnType<typeof vi.fn>) {
  return createHttpClient({
    baseUrl: BASE_URL,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    idFactory: createSeededIdFactory('http-stage7'),
  });
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0): [string, RequestInit] {
  return fetchImpl.mock.calls[index] as unknown as [string, RequestInit];
}

function header(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

async function mockBodies() {
  const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
  const { clients } = bundle;
  const weekly = await clients.progress.getWeekly({ childId: CHILD_ID });
  const overview = await clients.reports.getOverview({ childId: CHILD_ID });
  const page = await clients.reports.list({ childId: CHILD_ID });
  const detail = await clients.reports.getDetail({ reportId: REPORT_ID });
  await clients.reportPdf.request({ reportId: REPORT_ID }, { idempotencyKey: 'ik-pdf' });
  await clients.reportPdf.getStatus({ reportId: REPORT_ID });
  const pdfReady = await clients.reportPdf.getStatus({ reportId: REPORT_ID });
  const playback = await clients.highlightClips.getPlaybackUrl({
    clipId: MOCK_HIGHLIGHT_CLIP_IDS[0],
  });
  return { weekly, overview, page, detail, pdfReady, playback };
}

describe('createHttpApiClients — Stage 7 도메인 포함', () => {
  it('progress · reports · reportPdf · highlightClips 메서드 목록', () => {
    const clients = createHttpApiClients({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    expect(Object.keys(clients.progress)).toStrictEqual(['getWeekly']);
    expect(Object.keys(clients.reports).sort()).toStrictEqual([
      'getDetail',
      'getOverview',
      'list',
      'markViewed',
    ]);
    expect(Object.keys(clients.reportPdf).sort()).toStrictEqual(['getStatus', 'request']);
    expect(Object.keys(clients.highlightClips)).toStrictEqual(['getPlaybackUrl']);
  });
});

describe('HttpProgressApi', () => {
  it('getWeekly = GET /children/:id/progress/weekly (+ weekStart query) + 응답 parse', async () => {
    const { weekly } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(weekly)));
    const api = createHttpProgressApi(client(fetchImpl));

    expect(await api.getWeekly({ childId: CHILD_ID })).toStrictEqual(weekly);
    expect(call(fetchImpl)[0]).toBe(`${BASE_URL}/children/${CHILD_ID}/progress/weekly`);
    expect(call(fetchImpl)[1].method).toBe('GET');

    await api.getWeekly({ childId: CHILD_ID, query: { weekStart: '2026-04-27' } });
    expect(call(fetchImpl, 1)[0]).toBe(
      `${BASE_URL}/children/${CHILD_ID}/progress/weekly?weekStart=2026-04-27`,
    );
  });

  it('응답이 contract 와 다르면 VALIDATION_FAILED', async () => {
    const { weekly } = await mockBodies();
    const fetchImpl = vi.fn(() =>
      Promise.resolve(jsonResponse({ ...weekly, days: weekly.days.slice(0, 6) })),
    );
    await expect(
      createHttpProgressApi(client(fetchImpl)).getWeekly({ childId: CHILD_ID }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});

describe('HttpReportApi', () => {
  it('overview · list · detail · viewed 경로와 method', async () => {
    const { overview, page, detail } = await mockBodies();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(overview))
      .mockResolvedValueOnce(jsonResponse(page))
      .mockResolvedValueOnce(jsonResponse(detail))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createHttpReportApi(client(fetchImpl));

    expect(await api.getOverview({ childId: CHILD_ID })).toStrictEqual(overview);
    expect(await api.list({ childId: CHILD_ID, query: { limit: 5, cursor: 'c1' } })).toStrictEqual(
      page,
    );
    expect(await api.getDetail({ reportId: REPORT_ID })).toStrictEqual(detail);
    await expect(api.markViewed({ reportId: REPORT_ID })).resolves.toBeUndefined();

    expect(call(fetchImpl, 0)[0]).toBe(`${BASE_URL}/children/${CHILD_ID}/reports/overview`);
    expect(call(fetchImpl, 1)[0]).toBe(
      `${BASE_URL}/children/${CHILD_ID}/reports?limit=5&cursor=c1`,
    );
    expect(call(fetchImpl, 2)[0]).toBe(`${BASE_URL}/reports/${REPORT_ID}`);
    expect(call(fetchImpl, 3)[0]).toBe(`${BASE_URL}/reports/${REPORT_ID}/viewed`);
    expect(call(fetchImpl, 3)[1].method).toBe('POST');
  });

  it('REPORT_NOT_READY envelope → HaruApiError(details.retryAfter)', async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        jsonResponse(
          {
            error: {
              code: 'REPORT_NOT_READY',
              message: 'not ready',
              details: { retryAfter: '2026-06-09T16:00:00.000Z' },
            },
          },
          409,
        ),
      ),
    );
    const error: unknown = await createHttpReportApi(client(fetchImpl))
      .getDetail({ reportId: REPORT_ID })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HaruApiError);
    expect((error as HaruApiError).code).toBe('REPORT_NOT_READY');
    expect((error as HaruApiError).details).toStrictEqual({
      retryAfter: '2026-06-09T16:00:00.000Z',
    });
  });
});

describe('HttpReportPdfApi', () => {
  it('request = POST …/pdf + Idempotency-Key · getStatus = GET …/pdf · ready refine parse', async () => {
    const { pdfReady } = await mockBodies();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ status: 'queued', downloadUrl: null, expiresAt: null, fileName: null }),
      )
      .mockResolvedValueOnce(jsonResponse(pdfReady));
    const api = createHttpReportPdfApi(client(fetchImpl));

    expect((await api.request({ reportId: REPORT_ID }, { idempotencyKey: 'ik-1' })).status).toBe(
      'queued',
    );
    expect(await api.getStatus({ reportId: REPORT_ID })).toStrictEqual(pdfReady);
    const [url, init] = call(fetchImpl, 0);
    expect(url).toBe(`${BASE_URL}/reports/${REPORT_ID}/pdf`);
    expect(init.method).toBe('POST');
    expect(header(init, 'Idempotency-Key')).toBe('ik-1');
    expect(call(fetchImpl, 1)[1].method).toBe('GET');
  });

  it('ready 인데 downloadUrl 없음 → VALIDATION_FAILED', async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        jsonResponse({ status: 'ready', downloadUrl: null, expiresAt: null, fileName: null }),
      ),
    );
    await expect(
      createHttpReportPdfApi(client(fetchImpl)).getStatus({ reportId: REPORT_ID }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});

describe('HttpHighlightClipApi', () => {
  it('getPlaybackUrl = GET /highlight-clips/:id/playback-url + 응답 parse', async () => {
    const { playback } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(playback)));
    const clipId = MOCK_HIGHLIGHT_CLIP_IDS[0];
    expect(
      await createHttpHighlightClipApi(client(fetchImpl)).getPlaybackUrl({ clipId }),
    ).toStrictEqual(playback);
    expect(call(fetchImpl)[0]).toBe(`${BASE_URL}/highlight-clips/${clipId}/playback-url`);
  });
});
