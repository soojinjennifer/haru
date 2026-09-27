/** `features/consent` 공개 진입점 — pages 만 소비한다 (rules/architecture §3). */
export { consentCopy } from './copy';
export { GuardianConsentForm } from './ui/GuardianConsentForm';
export type { GuardianConsentFormProps } from './ui/GuardianConsentForm';
export { ConsentRow } from './ui/ConsentRow';
export type { ConsentRowProps } from './ui/ConsentRow';
export { VpcStep } from './ui/VpcStep';
export type { VpcStepProps } from './ui/VpcStep';
export {
  buildRecordConsentsRequest,
  canSubmit,
  consentSourceFor,
  isReconsent,
  isSelected,
  missingRequired,
  toggleSelection,
  EMPTY_SELECTION,
} from './model/consentSelection';
export type { ConsentSelection } from './model/consentSelection';
