import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { ConsentTypeSchema } from '../enums/consent.js';

/**
 * 동의 문서 1건 — **CONFIRMED (구조: 사용자 결정 2026-09-14, C-1)**.
 * 근거: `docs/API_CONTRACTS.md` §3.4 코드블록 · §4 Stage 2 `GET /v1/consent-documents/current`.
 *
 * - `required` 는 **서버가 내려주는 값**이다. Frontend 는 필수/선택을 하드코딩하지 않고
 *   이 값으로 화면을 그린다 (`pilot_participation` 의 필수 여부는 법무 L-02 결과).
 * - `url` 은 외부 링크로 연다 (D-4). Stage 2 는 in-app 문서 뷰어를 만들지 않는다.
 */
export const ConsentDocumentSchema = z.object({
  type: ConsentTypeSchema,
  documentId: IdSchema,
  version: z.string().min(1),
  required: z.boolean(),
  title: z.string().min(1),
  url: z.url(),
});

export type ConsentDocument = z.infer<typeof ConsentDocumentSchema>;

/** `GET /v1/consent-documents/current` 응답 — 공개 endpoint 다 (인증 불필요). */
export const CurrentConsentDocumentsSchema = z.object({
  documents: z.array(ConsentDocumentSchema),
});

export type CurrentConsentDocuments = z.infer<typeof CurrentConsentDocumentsSchema>;
