/**
 * 동의 선택 상태 계산 — **부수효과 없는 순수 함수**다 (테스트가 화면 없이 규칙을 고정한다).
 *
 * 규칙의 출처는 전부 **서버(Mock) 응답**이다.
 * - 어떤 항목이 있는가 · 순서 · 라벨 → `ConsentDocument[]`
 * - 무엇이 필수인가 → `ConsentDocument.required` (화면에 목록을 하드코딩하지 않는다 — AC-2-10)
 * - 어떤 문서 버전에 동의했는가 → `ConsentDocument.documentId` (항목별 버전 기록 — P2-BIP-04)
 *
 * 선택하지 않은 **선택 항목은 요청에 넣지 않는다.** `action` 은 `'granted'` 하나뿐이고
 * 철회(`revoked`)는 존재하지 않기 때문이다 (C-4).
 */
import type {
  ConsentDocument,
  ConsentSource,
  ConsentStatus,
  ConsentType,
  RecordConsentsRequest,
} from '@haru/contracts';

/** `ConsentType` → 체크 여부. 응답에 없는 항목은 키도 없다. */
export type ConsentSelection = Readonly<Partial<Record<ConsentType, boolean>>>;

export const EMPTY_SELECTION: ConsentSelection = {};

export function isSelected(selection: ConsentSelection, type: ConsentType): boolean {
  return selection[type] === true;
}

export function toggleSelection(
  selection: ConsentSelection,
  type: ConsentType,
  checked: boolean,
): ConsentSelection {
  return { ...selection, [type]: checked };
}

/** 아직 체크되지 않은 **필수** 항목. 비어 있으면 제출할 수 있다. */
export function missingRequired(
  documents: readonly ConsentDocument[],
  selection: ConsentSelection,
): ConsentType[] {
  return documents
    .filter((document) => document.required && !isSelected(selection, document.type))
    .map((document) => document.type);
}

export function canSubmit(
  documents: readonly ConsentDocument[],
  selection: ConsentSelection,
): boolean {
  // 문서를 아직 받지 못했으면 제출할 것이 없다.
  return documents.length > 0 && missingRequired(documents, selection).length === 0;
}

export function buildRecordConsentsRequest(
  documents: readonly ConsentDocument[],
  selection: ConsentSelection,
  source: ConsentSource,
): RecordConsentsRequest {
  return {
    items: documents
      .filter((document) => isSelected(selection, document.type))
      .map((document) => ({
        type: document.type,
        documentId: document.documentId,
        action: 'granted' as const,
      })),
    source,
  };
}

/**
 * 재동의인가 — **이전에 동의한 기록이 있는데**(`grantedAt`) 지금 필요한 항목이 다시 비어 있는 상태.
 * 최초 동의와 구분해 안내 문구를 바꾸는 데만 쓴다 (Design Spec §2.6).
 */
export function isReconsent(status: ConsentStatus): boolean {
  return status.grantedAt !== null && status.missing.length > 0;
}

/**
 * 동의 기록의 발생 경로 (`consent_events.source` — D-16).
 *
 * 최초 가입 직후인지 재동의인지는 `ConsentStatus` 로 알 수 있다.
 * **`signup_oauth` 는 구분하지 않는다** — 어떤 가입 경로였는지를 기억하는 상태가 현재 없고,
 * 그 상태를 새로 만드는 것은 이 Step 의 범위를 넘는다 (handoff §NEEDS_DECISION 에 기록).
 */
export function consentSourceFor(status: ConsentStatus): ConsentSource {
  return isReconsent(status) ? 'reconsent' : 'signup_email';
}
