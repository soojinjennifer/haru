import { z } from 'zod';

/**
 * 푸시 기기 플랫폼 — `push_devices.platform` (`docs/DATA_MODEL.md` §7, 이월 `QA-3-001`).
 * 근거: `docs/API_CONTRACTS.md` §2.2 "Stage 4 에서 추가 예정 2 종", Stage 4 Plan §7.2.
 *
 * **3값 유지** — 네이티브 분리(`D4-1`)로 값을 줄이지 않는다. Contract 는 Backend 요구사항이며
 * `ios`·`android` 는 후속 네이티브 단계에서 실제로 등록된다. Stage 4 Frontend 는 `web` 만 보낸다.
 */
export const PushPlatformSchema = z.enum(['ios', 'android', 'web']);

export type PushPlatform = z.infer<typeof PushPlatformSchema>;
