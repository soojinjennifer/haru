import { z } from 'zod';

/**
 * 온보딩 Step 2 — 읽기 상황에서 관찰되는 성향.
 *
 * 근거 (**결정 D-A**): `docs/source/HARU_Onboarding_Questionnaire_v1-1.docx.md`
 * "The Questionnaire" **Q1**(자극 편안 범위) · **Q4**(읽어 주는 동안의 모습).
 *
 * 질문지가 명시한 범위 제한을 그대로 따른다:
 * > "Temperament profiling. The full Motor / Attention / Fear schema … is **not invoked at
 * > onboarding**. The MVP uses observable behavioral proxies (Q1, Q4)."
 *
 * 그래서 Stage 2-CONTRACTS 의 4축(활동성 · 낯가림 · 집중 성향 · 선호 활동)을 **관찰 가능한
 * 행동 2문항으로 교체**했다. 추상적 기질 형용사를 보호자에게 묻지 않는다.
 *
 * 두 문항 모두 **필수**다 (`S2-ONB-1`, approvals §9.1 — 질문지가 Q1 · Q4 를 Required 로 규정하며
 * 결정 `D-C` 의 "Step 2~4 전부 선택"을 일부 뒤집는다). 필수 여부를 이 파일이 아니라 문항 정의
 * (`instrument.ts` `ONBOARDING_CHOICE_QUESTIONS[].required`)가 소유하므로, 화면·Mock 은 그 값만 읽는다.
 * 표시 문구는 `apps/web` feature copy 모듈이 소유한다 (D-A 구조 제약 ①).
 */

/**
 * Q1 — "When you read to your child, which kinds of stories tend to go best?" (단일 선택)
 *
 * 질문지의 가장 중요한 문항이다. 아이의 **자극 편안 범위(comfort zone)** 를 정하며,
 * 추천 후보 책의 자극 프로필(EI · NL · NT · RC)에 hard filter 로 작용한다.
 * "아이가 불안이 많나요?" 를 선호 질문의 형태로 묻는 장치라, 문구를 진단형으로 바꾸면 안 된다.
 *
 * | 코드 | 질문지 선택지 | engine `comfort_zone` |
 * |---|---|---|
 * | `quiet_gentle` | Quiet, gentle stories | EI≤2, NL≤2, NT≤2, RC≥5 |
 * | `some_adventure` | A bit of adventure | EI≤3, NL≤3, NT≤3, RC≥4 |
 * | `wild_ride` | They love a wild ride | EI≤4, NL≤4, NT≤4, RC≥4 |
 * | `depends_on_the_day` | It really depends on the day | `some_adventure` 기본값 + 3세션 후 재보정 |
 */
export const STORY_COMFORT_CODES = [
  'quiet_gentle',
  'some_adventure',
  'wild_ride',
  'depends_on_the_day',
] as const;

export const StoryComfortSchema = z.enum(STORY_COMFORT_CODES);

export type StoryComfort = z.infer<typeof StoryComfortSchema>;

/**
 * Q4 — "During read-aloud, what does your child usually do?" (단일 선택)
 *
 * 움직임/집중 채널을 **관찰 가능한 형태**로 받는다. MVP 에서는 몸으로 참여하는 책 쪽으로
 * 가볍게 가중할 뿐이며, 문항별 프롬프트 선택은 post-MVP 다.
 *
 * | 코드 | 질문지 선택지 | engine `channel` |
 * |---|---|---|
 * | `sits_and_listens` | Sits close and listens | `still` |
 * | `points_and_touches` | Wants to point, touch, turn pages | `mixed-still` |
 * | `acts_it_out` | Acts things out, can't sit still | `motor` |
 * | `asks_questions` | Asks lots of questions | `still-sustained` |
 * | `moves_but_listens` | Moves around but is clearly listening | `mixed-motor` |
 */
export const READ_ALOUD_BEHAVIOR_CODES = [
  'sits_and_listens',
  'points_and_touches',
  'acts_it_out',
  'asks_questions',
  'moves_but_listens',
] as const;

export const ReadAloudBehaviorSchema = z.enum(READ_ALOUD_BEHAVIOR_CODES);

export type ReadAloudBehavior = z.infer<typeof ReadAloudBehaviorSchema>;

export const TemperamentAnswersSchema = z.object({
  storyComfort: StoryComfortSchema.optional(),
  readAloudBehavior: ReadAloudBehaviorSchema.optional(),
});

export type TemperamentAnswers = z.infer<typeof TemperamentAnswersSchema>;
