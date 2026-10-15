import { z } from 'zod';

/**
 * 녹음 part 의 컨테이너 — **CONFIRMED (사용자 결정 2026-10-14, `D4-23`)**.
 * 근거: `docs/qa/stage-4a-spike-report.md` §5.5 권고 A (`M-1`, `C4-OPEN-2` 해소).
 *
 * `RecordingPart.mimeType` 은 브라우저 원문 문자열(`BlobEvent.data.type`)을 **정규화하지 않고**
 * 보관하고, 판별은 이 enum 으로 한다. 실측(2026-10-14): Chromium = `audio/webm;codecs=opus`,
 * WebKit = `audio/mp4; codecs=mp4a.40.2` (세미콜론 뒤 공백 — 문자열 동일성 비교가 엔진마다 깨진다).
 *
 * ⚠️ **Web 값으로 닫힌 enum 이 아니다** (`D4-1`). 후속 네이티브 단계가 다른 컨테이너(AAC 등)를
 * 추가할 수 있다 — 그때는 이 enum 과 `RECORDING_CONTAINER_BASE_MIME_TYPE` 을 함께 늘린다.
 */
export const RecordingContainerSchema = z.enum(['webm', 'mp4']);

export type RecordingContainer = z.infer<typeof RecordingContainerSchema>;

/**
 * 컨테이너별 허용 base MIME type (`;` 앞 부분). `audio/aac`·`audio/m4a` 는 **제거됐다** —
 * 두 엔진 모두 `MediaRecorder` 생성자가 던지는 값이라 Web 에서는 생기지 않는다 (`D4-23`).
 */
export const RECORDING_CONTAINER_BASE_MIME_TYPE: Readonly<Record<RecordingContainer, string>> = {
  webm: 'audio/webm',
  mp4: 'audio/mp4',
};
