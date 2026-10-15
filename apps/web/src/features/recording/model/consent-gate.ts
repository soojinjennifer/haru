/**
 * `ConsentGate` — 녹음 시작 전 보호자 동의 확인 (FR-02 Stage 4 부분, AC-4-62, `docs/ARCHITECTURE.md` §10.4).
 *
 * 판정은 **클라이언트 차단**이다. 서버 측 강제(`CONSENT_REQUIRED`)는 Backend Handoff 요구사항
 * (`P4-BIP-02`)이며 Mock `consent-missing` 이 재현한다.
 *
 * 규칙 (fail-closed — 모르면 막는다):
 * 1. 동의 상태를 아직 모르면(`null`/`undefined`) 막는다.
 * 2. `missing` 이 비어 있지 않으면 막는다 (`hasAllRequiredConsents` — contracts 규칙 재사용).
 * 3. `child_voice_data` 가 `required` 에 없으면 막는다 — 그 경우 `missing` 만으로는 녹음 동의를
 *    확인할 수 없다 (`ConsentStatus` 는 "필수 중 누락" 만 알려 준다).
 *
 * 막히면 Controller 는 녹음기도 전이 요청도 부르지 않는다 → **`recording` 요청 0건** (AC-4-62).
 */
import { hasAllRequiredConsents, type ConsentStatus, type ConsentType } from '@haru/contracts';

/** 녹음에 반드시 필요한 동의 종류 (`docs/API_CONTRACTS.md` §1 "CG"). */
export const RECORDING_CONSENT_TYPE: ConsentType = 'child_voice_data';

export type ConsentGateResult =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly reason: 'unknown' | 'missing';
      /** 누락된 동의 종류 — 상태를 모르면 빈 배열. */
      readonly missing: readonly ConsentType[];
    };

export interface ConsentGate {
  evaluate(): ConsentGateResult;
}

/** `readStatus` 는 호출 시점의 최신 동의 상태를 돌려준다 (예: `Me` query 캐시의 `consentStatus`). */
export function createConsentGate(readStatus: () => ConsentStatus | null | undefined): ConsentGate {
  return {
    evaluate() {
      const status = readStatus();
      if (status === null || status === undefined) {
        return { allowed: false, reason: 'unknown', missing: [] };
      }
      if (!hasAllRequiredConsents(status)) {
        return { allowed: false, reason: 'missing', missing: [...status.missing] };
      }
      if (!status.required.includes(RECORDING_CONSENT_TYPE)) {
        return { allowed: false, reason: 'missing', missing: [RECORDING_CONSENT_TYPE] };
      }
      return { allowed: true };
    },
  };
}
