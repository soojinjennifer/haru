/**
 * signed URL · 클립 만료 판단 — Stage 7 Plan §5.2 · §5.4 · `N7-17` (`S7-E`).
 *
 * 순수 함수다. 기준 시각(`nowMs`)은 호출부가 주입한다 — 이 모듈은 시계를 읽지 않는다.
 * 서버 시각 문자열(`IsoDateTime`)을 비교만 한다. 기간·날짜 계산 0.
 */
import type { ReportHighlightClip, SignedMediaUrl } from '@haru/contracts';

/** 캐시된 URL 을 다시 쓰는 여유 — 만료 30초 전부터는 새로 받는다 (Plan §5.2 `expiresAt − 30s`). */
export const SIGNED_URL_REUSE_MARGIN_MS = 30_000;

function epochOf(iso: string): number {
  return Date.parse(iso);
}

/** 캐시에서 꺼내 그대로 재생에 써도 되는가 (만료 30초 이상 남음). */
export function isSignedUrlReusable(url: SignedMediaUrl, nowMs: number): boolean {
  return epochOf(url.expiresAt) - SIGNED_URL_REUSE_MARGIN_MS > nowMs;
}

/** 받은 URL 이 **이미** 만료되었는가 — 재발급 1회 트리거 (C7-8 · AC-7-51). */
export function isSignedUrlExpired(url: SignedMediaUrl, nowMs: number): boolean {
  return epochOf(url.expiresAt) <= nowMs;
}

/**
 * 클립 보관이 끝났는가 — `expiresAt` 이 지난 클립은 **조회 전에도** "더 이상 들을 수 없음" (`N7-17`).
 * `null` = 보관 기간 미정(`OAQ-13`) → 만료 아님.
 */
export function isClipRetentionExpired(
  clip: Pick<ReportHighlightClip, 'expiresAt'>,
  nowMs: number,
): boolean {
  return clip.expiresAt !== null && epochOf(clip.expiresAt) <= nowMs;
}
