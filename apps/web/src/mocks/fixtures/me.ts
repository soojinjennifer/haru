/**
 * `me` fixture — `.claude/rules/frontend.md` §5 "fixture 는 `mocks/` 에만 둔다".
 *
 * **가상 보호자 데이터만** 있다. 아이 데이터는 온보딩 제출 이후에만 생기므로 Stage 2-AUTH
 * fixture 에는 `child` 가 없다 (AC-2-13 — 동의 전 구간에 아동 데이터 0건).
 *
 * 값은 주입된 `clock` 에서만 나온다 — 같은 scenario 는 항상 같은 응답 바이트다 (AC-2-52).
 */
import {
  MeResponseSchema,
  type ConsentType,
  type MeResponse,
  type OnboardingStatus,
  type ParentVerificationStatus,
} from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';

import { MOCK_REQUIRED_CONSENT_TYPES } from './consent';

/** 고정 uuid — `idFactory` 와 달리 fixture 식별자는 scenario 간에도 같아야 비교가 쉽다. */
export const MOCK_CAREGIVER_ID = '11111111-1111-4111-8111-111111111111';

/** 가상 보호자 표시 이름. 실제 사용자 이름이 아니다. */
export const MOCK_CAREGIVER_DISPLAY_NAME = 'Sam Rivera';

/** Mock 이 쓰는 고정 타임존. 실행 기기의 타임존에 의존하지 않는다 (결정성). */
export const MOCK_TIMEZONE = 'America/Los_Angeles';

/**
 * 현재 정책상 필수 동의 — Mock 기준값. 화면은 이 값을 하드코딩하지 않는다 (AC-2-10).
 *
 * 값은 **동의 문서 fixture 의 `required`** 에서 파생한다 (`fixtures/consent.ts`).
 * `GET /v1/me` 와 `GET /v1/consent-documents/current` 가 서로 다른 필수 목록을 말하면
 * Guard 와 화면이 어긋나므로 출처를 하나로 둔다.
 */
export const MOCK_REQUIRED_CONSENTS: readonly ConsentType[] = MOCK_REQUIRED_CONSENT_TYPES;

export interface MeFixtureOptions {
  missingConsents?: readonly ConsentType[];
  parentVerification?: ParentVerificationStatus;
  onboardingStatus?: OnboardingStatus;
  /**
   * 마지막 동의 기록 시각. 주지 않으면 "누락이 없으면 기록됨" 규칙을 쓴다.
   *
   * 명시로 넘길 수 있어야 **재동의**(이전에 동의했지만 문서 버전이 올라가 다시 필요한 상태)를
   * 표현할 수 있다: `grantedAt !== null` + `missing` 이 비어 있지 않음 (Design Spec §2.6 재동의 안내).
   */
  grantedAt?: string | null;
}

function defaultGrantedAt(clock: Clock, missing: readonly ConsentType[]): string | null {
  return missing.length === 0 ? clock.nowIso() : null;
}

export function createMeResponseFixture(clock: Clock, options: MeFixtureOptions = {}): MeResponse {
  const missing = options.missingConsents ?? [];

  return MeResponseSchema.parse({
    caregiver: {
      id: MOCK_CAREGIVER_ID,
      displayName: MOCK_CAREGIVER_DISPLAY_NAME,
      timezone: MOCK_TIMEZONE,
    },
    consentStatus: {
      required: [...MOCK_REQUIRED_CONSENTS],
      missing: [...missing],
      grantedAt:
        options.grantedAt === undefined ? defaultGrantedAt(clock, missing) : options.grantedAt,
    },
    parentVerification: { status: options.parentVerification ?? 'not_required' },
    onboardingStatus: options.onboardingStatus ?? 'completed',
    plan: 'free',
  });
}
