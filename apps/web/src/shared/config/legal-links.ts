/**
 * 약관 · 개인정보방침 **외부 링크** — 결정 `D-4` (`docs/decisions/stage-2-approvals.md` §4).
 *
 * ⚠️ **출시 전 차단 항목 (launch blocker)** — §4.1 추적 조건.
 * 아래 URL 은 **실제 문서가 아니다.** `.invalid` 는 예약 TLD(RFC 2606) 라서 절대 해석되지 않으며,
 * "아직 문서가 없다" 는 사실이 화면에서도 눈에 띄도록 일부러 이렇게 둔다.
 *
 * 교체 시점과 책임:
 *   1. `docs/workflow/WORKFLOW_STATE.md` §3 미결 항목 — 상시 노출
 *   2. Stage 8 `BACKEND_HANDOFF.md` — 출시 전 차단 항목 (법무 L-02)
 *   3. 동의 화면(`2-CONSENT`)의 Mock fixture `ConsentDocument.url` 도 같은 규칙을 따른다
 *
 * `/legal/*` route 는 만들지 않는다 (D-4).
 */
export const LEGAL_LINKS = {
  termsOfService: 'https://haru.invalid/legal/terms-of-service--placeholder',
  privacyPolicy: 'https://haru.invalid/legal/privacy-policy--placeholder',
  /* ── 아래 3건은 `2-CONSENT` 가 추가했다 (동의 5항목 — Stage 0 C-1). ──
   * 새 placeholder **방식**을 만든 것이 아니라 위와 **같은 단일 출처**를 5건으로 채운 것이다.
   * Mock fixture `ConsentDocument.url` 은 이 표에서만 값을 가져온다. */
  childVoiceData: 'https://haru.invalid/legal/child-voice-data--placeholder',
  marketing: 'https://haru.invalid/legal/marketing-communications--placeholder',
  pilotParticipation: 'https://haru.invalid/legal/pilot-participation--placeholder',
} as const;

/** 실제 문서 URL 인지 검사한다 — QA 가 "가짜임이 드러나는가" 를 기계적으로 확인한다. */
export function isPlaceholderLegalUrl(url: string): boolean {
  return url.includes('.invalid/') && url.includes('placeholder');
}
