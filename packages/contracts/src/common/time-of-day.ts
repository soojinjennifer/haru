import { z } from 'zod';

/**
 * 하루 중 시각 (`HH:mm`, 24시간) — `customTime` · `cardRefreshTime` · `reminderTime` 공용.
 * 근거: Stage 3 Plan §7.1 `src/common/time-of-day.ts` (중복 선언 방지).
 *
 * **날짜·시간대를 담지 않는다.** 사용자가 고른 "몇 시" 이며 해석(어느 날의 그 시각인지)은
 * 서버가 보호자 시간대로 수행한다 (결정 **D-10** 과 같은 원칙).
 */
export const TimeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;
