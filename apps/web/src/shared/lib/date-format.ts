/**
 * 화면용 날짜 표기 — 4b Spec §18.4 (7일 보관 배너의 삭제 예정일, `D4-120` Q12).
 *
 * - **절대 날짜**만 쓴다 (`Nov 17`). `in 7 days` 같은 상대 표기는 배너가 여러 날 남아 있는 동안 틀린 값이 된다.
 * - 영어(`en-US`) · 기기 시간대. 기준 시각(`nowMs`)과 **해가 다르면** 연도를 붙인다 (`Jan 3, 2027`).
 * - 시각은 쓰지 않는다 — 삭제는 그 시각 이후 첫 정리에서 일어나므로 날짜보다 이르지 않다.
 *
 * 시계를 읽지 않는다 — 기준 시각은 호출한 쪽이 넘긴다(주입 clock 으로 테스트한다).
 */
export function formatMonthDay(atMs: number, nowMs: number, timeZone?: string): string {
  const zone = timeZone === undefined ? {} : { timeZone };
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', ...zone });
  const sameYear = year.format(atMs) === year.format(nowMs);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    ...zone,
  }).format(atMs);
}
