/**
 * 경과 시간 표시 형식 — **`mm:ss` 고정** (4b Spec §2.2 `298:1324` 시안 `03:24`, AC-4-127, `D4-51` 귀결).
 *
 * 상위 Spec §7.1 의 `m:ss` 는 4b Spec §13 으로 대체됐다. 값은 컨트롤러의 `recordedSeconds`(실제 녹음
 * 시간, 일시정지 제외 — `RecordingController` 소유)를 그대로 받는다. 이 함수는 **표시 형식만** 만든다.
 * 상한 30:00(`MAX_RECORDED_SECONDS`)도 두 자리 분이다.
 */
export function formatSessionClock(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
