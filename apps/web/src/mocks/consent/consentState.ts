/**
 * Mock 동의 상태 — `MockConsentApi`(쓰기)와 `MockMeApi`(읽기)가 공유하는 **하나의 진실**.
 *
 * 왜 필요한가: `POST /v1/consents` 가 성공했는데 `GET /v1/me` 가 계속 "필수 동의 누락" 을
 * 말하면 Route Guard 가 동의 화면으로 되돌려 보내 동의 → VPC → 온보딩 흐름을 end-to-end 로
 * 검증할 수 없다. 실제 Backend 는 `consent_events` append-only 테이블로 같은 일을 한다
 * (P2-BIP-04).
 *
 * 결정성: 시간·난수를 쓰지 않는다. 상태는 **명시적 호출**로만 바뀌므로 같은 호출 순서는
 * 항상 같은 결과를 낸다 (AC-2-52). 테스트·scenario 전환은 `reset()` 으로 초기화한다.
 *
 * 동의 **철회**는 없다 (C-4). 그래서 `revoke()` 도 만들지 않는다.
 */
import type { ConsentType } from '@haru/contracts';

export interface MockConsentState {
  /** 이번 실행에서 기록된 동의 종류 (입력 순서와 무관하게 안정 정렬). */
  granted(): readonly ConsentType[];
  /** 동의 기록. 이미 있는 종류는 중복 저장하지 않는다 (append-only 의 관찰 가능한 결과). */
  grant(types: readonly ConsentType[]): void;
  /** 아직 기록되지 않은 필수 동의 목록. */
  missingFrom(required: readonly ConsentType[]): ConsentType[];
  reset(): void;
}

export function createMockConsentState(): MockConsentState {
  const granted = new Set<ConsentType>();

  return {
    granted() {
      return [...granted].sort();
    },

    grant(types) {
      for (const type of types) granted.add(type);
    },

    missingFrom(required) {
      return required.filter((type) => !granted.has(type));
    },

    reset() {
      granted.clear();
    },
  };
}
