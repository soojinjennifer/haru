/**
 * 분 → 화면 표기 — Stage 7 Spec §2.0 "분 포맷" (Figma `163:2549` *"62m"* · `163:2557` *"1h 12m"*).
 *
 * `<60` → `{m}m` · `≥60` → `{h}h {m}m` (m = 0 이면 `{h}h`). 값은 서버가 집계한 정수 분이다 — 반올림·합산 0.
 * 단위 표기(`m` · `h`)는 숫자 포맷이지 문장이 아니므로 copy 모듈이 아니라 여기 둔다 (`formatMonthDay` 선례).
 */
export function formatMinutes(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new RangeError('Minutes must be a non-negative integer.');
  }
  if (minutes < 60) return `${String(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${String(hours)}h` : `${String(hours)}h ${String(rest)}m`;
}

/**
 * 분 → 분 단위만 (`62m`) — Figma `163:2549` StatTile *"together"* 는 62 분을 **`62m`** 로 쓴다 (같은 화면의 주간 합계
 * `163:2557` 은 72 분을 `1h 12m`). Spec §2.0 "분 포맷" 규칙(`≥60 → {h}h {m}m`)이 예시로 든 `62m` 과 스스로 어긋나서
 * **Figma 를 따랐다** (최우선 규칙 1 — H7-3 판단 기록). StatTile 은 이 함수, 합계는 `formatMinutes`.
 */
export function formatMinuteCount(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new RangeError('Minutes must be a non-negative integer.');
  }
  return `${String(minutes)}m`;
}
