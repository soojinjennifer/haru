/**
 * `consent` query key factory — `.claude/rules/frontend.md` §4 "Query key 는 entity 별 factory".
 */
export const consentKeys = {
  all: ['consent'] as const,
  /** `GET /v1/consent-documents/current` */
  documents: () => [...consentKeys.all, 'documents'] as const,
} as const;

export type ConsentDocumentsQueryKey = ReturnType<typeof consentKeys.documents>;
