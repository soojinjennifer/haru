/**
 * 동의 문서 fixture — `.claude/rules/frontend.md` §5 "fixture 는 `mocks/` 에만 둔다".
 *
 * 5종 구성은 Stage 0 **C-1** 확정이다: 필수 3 (`terms_of_service` · `privacy_policy` ·
 * `child_voice_data`) + 선택 2 (`marketing` · `pilot_participation`).
 * `required` 는 **서버가 내려주는 값**이며 화면은 이 값으로만 필수/선택을 그린다 (AC-2-10).
 * `pilot_participation` 의 최종 필수 여부는 법무 **L-02** 결정이다 — 지금은 선택으로 둔다.
 *
 * ⚠️ **`url` 은 실제 문서가 아니다 (출시 전 차단 항목 — approvals §4.1, 법무 L-02).**
 * 값은 전부 `shared/config/legal-links.ts` 한 곳에서 오며 `.invalid` 예약 TLD(RFC 2606) +
 * `--placeholder` 접미사라 **누가 봐도 가짜임이 드러난다**. 링크를 눌러도 어떤 문서도 열리지
 * 않는다. `isPlaceholderLegalUrl()` 로 기계 검사할 수 있으며 테스트가 이를 고정한다.
 * 약관 **본문**은 Frontend 코드·fixture 어디에도 두지 않는다 (결정 D-4, AC-2-18).
 *
 * 문구(`title`)는 Mock 응답 값이다. 화면은 이 값을 그대로 표시하고 자체 문구를 만들지 않는다
 * (`.claude/rules/frontend.md` §8).
 */
import {
  ConsentTypeSchema,
  CurrentConsentDocumentsSchema,
  type ConsentDocument,
  type ConsentType,
  type CurrentConsentDocuments,
} from '@haru/contracts';

import { LEGAL_LINKS } from '../../shared/config/legal-links';

/** 현재 배포 중인 문서 버전. */
export const MOCK_CONSENT_VERSION = '2026-01-01';

/** 갱신된 문서 버전 — `consent-version-outdated` scenario 가 쓴다 (재동의). */
export const MOCK_CONSENT_VERSION_UPDATED = '2026-06-01';

/**
 * 고정 uuid — `(type, version)` 쌍마다 하나다.
 * 항목별 문서 버전을 기록해야 재동의 판정이 가능하기 때문에 버전이 다르면 id 도 다르다
 * (`consent_events.consent_document_id` — DATA_MODEL §5, P2-BIP-04).
 */
const DOCUMENT_IDS: Readonly<Record<ConsentType, { current: string; updated: string }>> = {
  terms_of_service: {
    current: '21111111-1111-4111-8111-111111111111',
    updated: '22111111-1111-4111-8111-111111111111',
  },
  privacy_policy: {
    current: '21222222-2222-4222-8222-222222222222',
    updated: '22222222-2222-4222-8222-222222222222',
  },
  child_voice_data: {
    current: '21333333-3333-4333-8333-333333333333',
    updated: '22333333-3333-4333-8333-333333333333',
  },
  marketing: {
    current: '21444444-4444-4444-8444-444444444444',
    updated: '22444444-4444-4444-8444-444444444444',
  },
  pilot_participation: {
    current: '21555555-5555-4555-8555-555555555555',
    updated: '22555555-5555-4555-8555-555555555555',
  },
};

interface ConsentDocumentSeed {
  type: ConsentType;
  required: boolean;
  title: string;
  url: string;
}

/**
 * 표시 순서까지 fixture 가 정한다 — 화면은 응답 배열 순서를 그대로 그린다.
 * 필수 3종을 먼저, 선택 2종을 뒤에 둔다.
 */
const SEEDS: readonly ConsentDocumentSeed[] = [
  {
    type: ConsentTypeSchema.enum.terms_of_service,
    required: true,
    title: 'Terms of Service',
    url: LEGAL_LINKS.termsOfService,
  },
  {
    type: ConsentTypeSchema.enum.privacy_policy,
    required: true,
    title: 'Privacy Policy',
    url: LEGAL_LINKS.privacyPolicy,
  },
  {
    type: ConsentTypeSchema.enum.child_voice_data,
    required: true,
    title: "Recording your child's voice",
    url: LEGAL_LINKS.childVoiceData,
  },
  {
    type: ConsentTypeSchema.enum.marketing,
    required: false,
    title: 'Product news by email',
    url: LEGAL_LINKS.marketing,
  },
  {
    type: ConsentTypeSchema.enum.pilot_participation,
    required: false,
    title: 'Taking part in the HARU pilot',
    url: LEGAL_LINKS.pilotParticipation,
  },
];

export type ConsentDocumentSetName = 'current' | 'updated';

export function createConsentDocumentFixture(
  seed: ConsentDocumentSeed,
  set: ConsentDocumentSetName,
): ConsentDocument {
  return {
    type: seed.type,
    documentId: DOCUMENT_IDS[seed.type][set],
    version: set === 'current' ? MOCK_CONSENT_VERSION : MOCK_CONSENT_VERSION_UPDATED,
    required: seed.required,
    title: seed.title,
    url: seed.url,
  };
}

/** 문서 5종 응답. `set='updated'` 는 버전이 올라간 문서 묶음이다 (재동의 검증용). */
export function createConsentDocumentsFixture(
  set: ConsentDocumentSetName = 'current',
): CurrentConsentDocuments {
  return CurrentConsentDocumentsSchema.parse({
    documents: SEEDS.map((seed) => createConsentDocumentFixture(seed, set)),
  });
}

/** 현재 정책상 **필수**인 동의 종류 — fixture 의 `required` 에서 파생한다 (하드코딩 아님). */
export const MOCK_REQUIRED_CONSENT_TYPES: readonly ConsentType[] = SEEDS.filter(
  (seed) => seed.required,
).map((seed) => seed.type);
