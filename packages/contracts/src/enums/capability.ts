import { z } from 'zod';

/**
 * HARU 4대 내적 역량 — **CONFIRMED (사용자 결정 2026-09-14, #13)**.
 * 근거: `docs/API_CONTRACTS.md` §2.1, PRD §4.
 *
 * 코드 키는 **불변**이다. 화면 표시 라벨(Emotion Regulation · Self-Direction ·
 * Cognitive Flexibility · Intrinsic Motivation)은 contracts 가 아니라
 * `apps/web/src/shared/copy` 가 소유한다 (#14 — 라벨 변경이 데이터 migration 을 유발하지 않게 한다).
 * 역량 색도 contracts 가 아니라 design token 이다 (#19).
 */
export const CapabilitySchema = z.enum([
  'emotion_regulation',
  'self_directed_agency',
  'cognitive_flexibility',
  'intrinsic_motivation',
]);

export type Capability = z.infer<typeof CapabilitySchema>;
