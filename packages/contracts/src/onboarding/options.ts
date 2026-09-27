import { z } from 'zod';

import { CapabilitySchema } from '../enums/capability.js';

/**
 * 온보딩 선택지 **코드** 목록.
 *
 * 근거 문서 (**결정 D-A**, `docs/decisions/stage-2-approvals.md` §8):
 * `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md` — "The Questionnaire" Q1~Q5.
 * Stage 2-CONTRACTS 가 넣어 둔 권장 최소 목록을 그 문서 기준으로 **교체**했다.
 *
 * ── 왜 contracts 가 코드만 소유하는가 (D-A 구조 제약 ①) ──
 * 저장되는 값은 **코드(machine key)** 다. 표시 문구는 `apps/web` 의 feature copy 모듈이
 * 소유하므로, 문구를 바꿔도 이미 저장된 응답이 무효가 되지 않는다. 같은 이유로 4대 역량
 * 라벨을 contracts 에 두지 않는다 (Stage 0 #14).
 *
 * ── 문항 목록·순서·개수 (D-A 구조 제약 ②·③) ──
 * 어떤 문항이 어떤 단계에 몇 개 있는지는 이 파일이 아니라 `instrument.ts` 한 곳이 정의하고,
 * Mock 이 `OnboardingInstrument` 로 내려준다. 화면은 그 값을 렌더한다.
 *
 * 저장 형태는 `docs/DATA_MODEL.md` §5 `children.language_environment` · `topic_tags` ·
 * `growth_goals` (text[]) 와 1:1 이다.
 */

/**
 * 집에서 사용하는 언어 (Step 1, 복수 선택).
 * 질문지 문서에 없는 항목이다 — C13-04(Figma 누락 필드 명세)로 Step 1 에 남는다.
 * 미국 1차 시장 기준 상위 사용 언어 + `other`.
 */
export const LANGUAGE_ENVIRONMENT_CODES = [
  'english',
  'spanish',
  'chinese',
  'korean',
  'vietnamese',
  'tagalog',
  'arabic',
  'french',
  'other',
] as const;

export const LanguageEnvironmentSchema = z.enum(LANGUAGE_ENVIRONMENT_CODES);

export type LanguageEnvironment = z.infer<typeof LanguageEnvironmentSchema>;

/** 가족 내 독서 루틴 (Step 1, 단일 선택). 질문지 문서에 없는 항목 — C13-04. */
export const READING_ROUTINE_CODES = [
  'daily',
  'few_times_a_week',
  'weekends_only',
  'occasionally',
  'just_starting',
] as const;

export const ReadingRoutineSchema = z.enum(READING_ROUTINE_CODES);

export type ReadingRoutine = z.infer<typeof ReadingRoutineSchema>;

/**
 * 아이가 책에서 끌리는 것 (Step 3, 복수 선택 최대 2).
 *
 * 질문지 **Q3** "What does your child tend to reach for in books?" 의 선택지다.
 * 코드는 질문지의 engine variable(`interest_weight.<code>`)을 그대로 쓴다 — 향후 추천 엔진이
 * 별도 매핑 표 없이 소비할 수 있게 한다.
 *
 * | 코드 | 질문지 선택지 | engine |
 * |---|---|---|
 * | `narrative` | Characters and stories | `interest_weight.narrative` 2.0 |
 * | `inquiry` | How things work, animals, the world | `interest_weight.inquiry` 2.0 |
 * | `artistic` | Colors, art, things that look beautiful | `interest_weight.artistic` 2.0 |
 * | `social` | Books with other kids, families, friendships | `interest_weight.social` 2.0 |
 * | `not_sure_yet` | Honestly not sure yet | 가중 없음 (baseline 1.0) |
 *
 * `not_sure_yet` 은 **다른 선택지와 함께 고를 수 없다** (`exclusive` — `instrument.ts`).
 * 질문지가 이 선택지를 "필수"로 규정한 이유가 "확실하지 않은 보호자에게 선택을 강요하면
 * 노이즈가 된다" 이므로, 섞어서 저장하면 그 의도가 깨진다.
 *
 * 필드명(`topicTags`)은 `docs/DATA_MODEL.md` §5 `children.topic_tags` 와 맞추기 위해 유지한다.
 */
export const TOPIC_TAG_CODES = [
  'narrative',
  'inquiry',
  'artistic',
  'social',
  'not_sure_yet',
] as const;

export const TopicTagSchema = z.enum(TOPIC_TAG_CODES);

export type TopicTag = z.infer<typeof TopicTagSchema>;

/** `not_sure_yet` — 다른 선택지와 배타적인 "아직 모르겠다" 응답. */
export const TOPIC_TAG_NOT_SURE: TopicTag = 'not_sure_yet';

/**
 * 보호자가 함께 키우고 싶은 것 (Step 4, 복수 선택 최대 2).
 *
 * **결정 D-B (2026-09-26)** — 질문지 **Q2** "Books can do different kinds of work. Which would
 * help you most right now?" 의 선택지가 4대 역량과 1:1 이므로 **같은 목록**을 쓴다.
 * 목록이 갈라지지 않도록 `CapabilitySchema` 를 그대로 재사용한다 (별도 enum 을 두지 않는다).
 *
 * | 코드 | 질문지 선택지 | engine |
 * |---|---|---|
 * | `emotion_regulation` | Helping with big feelings | `axis_weight.emotion_regulation` 2.0 |
 * | `self_directed_agency` | Building their confidence | `axis_weight.self_direction` 2.0 |
 * | `cognitive_flexibility` | Helping them adjust when things change | `axis_weight.cognitive_flexibility` 2.0 |
 * | `intrinsic_motivation` | Sparking wonder and connection | `axis_weight.intrinsic_meaning` 2.0 |
 *
 * ⚠ **Step 4 와 프로필 결과는 서로를 평가하지 않는다** (approvals §8.2). Step 4 는 보호자가
 * *무엇을 함께 키우고 싶은지* 고르는 것이고, 프로필 결과는 *지금 관찰된 신호* 다.
 * "목표 대비 달성" · "기대 vs 실제" · 점수 비교 · 미달 표시 문구를 만들지 않는다
 * (`.claude/rules/frontend.md` §8). 화면 copy 에 대한 금칙어 테스트가 이를 고정한다.
 */
export const GROWTH_GOAL_CODES = CapabilitySchema.options;

export const GrowthGoalSchema = CapabilitySchema;

export type GrowthGoal = z.infer<typeof GrowthGoalSchema>;
