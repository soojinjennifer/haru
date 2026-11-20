/**
 * 가짜 PDF — Stage 7 Plan §8 "가짜 PDF" (`N7-20` 선례, AC-7-17).
 *
 * 최소 유효 PDF 1쪽("HARU sample report — mock")을 **런타임에** 만든다. 저장소에 바이너리 0 ·
 * Production 번들 0 (`src/mocks/**` 는 `http` 빌드에서 제거 — `assert:no-mocks`).
 * 실제 리포트 내용·아이 데이터를 담지 않는다. xref 오프셋을 계산해 일반 뷰어가 열 수 있다.
 */
import { toDataUrl } from './encoding';

export const MOCK_PDF_MIME_TYPE = 'application/pdf';
export const MOCK_PDF_TEXT = 'HARU sample report - mock';

function ascii(text: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) bytes[index] = text.charCodeAt(index) & 0x7f;
  return bytes;
}

/** 최소 PDF 1.4 바이트 (결정적). */
export function createMockPdfBytes(): Uint8Array<ArrayBuffer> {
  const stream = `BT /F1 18 Tf 72 720 Td (${MOCK_PDF_TEXT}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) body += `${String(offset).padStart(10, '0')} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return ascii(body);
}

export function createMockPdfDataUrl(): string {
  return toDataUrl(MOCK_PDF_MIME_TYPE, createMockPdfBytes());
}
