/** signed URL 재사용 · 만료 판단 — Stage 7 `S7-E` (Plan §5.2 `expiresAt − 30s` · C7-8 · `N7-17`). */
import { describe, expect, it } from 'vitest';

import {
  isClipRetentionExpired,
  isSignedUrlExpired,
  isSignedUrlReusable,
  SIGNED_URL_REUSE_MARGIN_MS,
} from '../signedUrl';

const NOW = Date.parse('2026-06-01T00:00:00.000Z');
const url = (expiresAt: string) => ({ url: 'https://media.example.test/a', expiresAt });

describe('isSignedUrlReusable — 만료 30초 전까지만 캐시 재사용', () => {
  it('31초 남음 = 재사용 · 30초 남음 = 새로 받는다 · 지남 = 새로 받는다', () => {
    expect(SIGNED_URL_REUSE_MARGIN_MS).toBe(30_000);
    expect(isSignedUrlReusable(url('2026-06-01T00:00:31.000Z'), NOW)).toBe(true);
    expect(isSignedUrlReusable(url('2026-06-01T00:00:30.000Z'), NOW)).toBe(false);
    expect(isSignedUrlReusable(url('2026-05-31T00:00:00.000Z'), NOW)).toBe(false);
  });
});

describe('isSignedUrlExpired — 받은 URL 이 이미 만료(재발급 트리거)', () => {
  it('경계 포함', () => {
    expect(isSignedUrlExpired(url('2026-06-01T00:00:00.000Z'), NOW)).toBe(true);
    expect(isSignedUrlExpired(url('2026-06-01T00:00:01.000Z'), NOW)).toBe(false);
    // Mock 의 유효 URL 만료(2099) · 만료 URL(2025)
    expect(isSignedUrlExpired(url('2099-12-31T23:59:59.000Z'), NOW)).toBe(false);
    expect(isSignedUrlExpired(url('2025-12-31T00:00:00.000Z'), NOW)).toBe(true);
  });
});

describe('isClipRetentionExpired — 보관 만료 클립 (N7-17)', () => {
  it('null = 만료 아님 (OAQ-13 결정 전) · 지난 시각 = 만료', () => {
    expect(isClipRetentionExpired({ expiresAt: null }, NOW)).toBe(false);
    expect(isClipRetentionExpired({ expiresAt: '2025-12-31T00:00:00.000Z' }, NOW)).toBe(true);
    expect(isClipRetentionExpired({ expiresAt: '2026-07-01T00:00:00.000Z' }, NOW)).toBe(false);
  });
});
