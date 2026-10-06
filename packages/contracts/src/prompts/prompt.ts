import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { AgeBandSchema } from '../enums/age-band.js';
import { CapabilitySchema } from '../enums/capability.js';
import { PromptKindSchema } from '../enums/prompt-kind.js';
import { PromptPhaseSchema } from '../enums/prompt-phase.js';

/**
 * Prompt · PromptSet — 근거: `docs/API_CONTRACTS.md` §4 Stage 3 · PRD §8.2, Stage 3 Plan §7.1.
 *
 * ── 개수 상한이 **없다** (`N-2` · **D-21**, `stage-3-approvals.md` §6.1 · §9.1) ──
 * `questions` 에 `.max(3)` 를 두지 않는다. `.min(1)` 만 둔다 (빈 세트는 화면이 성립하지 않는다).
 * `.min(2)` 로 올리지도 않는다 — 서버가 1개만 내려주는 상황을 parse 실패로 만들 근거가 없다.
 * PRD FR-07 · §8.2 의 "2~3개" 는 **Backend 생성 정책**이며 (`P3-BIP-03`) Frontend 검증 조건이
 * 아니다. 화면의 접힌 상태 3개는 **렌더 컷오프(cutoff)이며 cap 이 아니다**.
 *
 * ── `phase` · `pageRef` (**D-8**, §8.1) ──
 * 둘 다 **선택**이며 `null` 을 허용한다. 전환기에 값이 없는 Prompt 가 섞여도 화면이 깨지지
 * 않게 하기 위해서다. 화면은 **값이 있을 때만** 배지를 렌더하고 값을 생성·추론·가공하지
 * 않는다 (`rules/frontend.md` §8). 두 필드는 **서로 독립**이다 — 서버에 "하나만 보내라" 를
 * 요구하지 않는다 (`stage-3-approvals.md` §9.2 ⑪).
 *
 * `pageRef` 는 서버가 만든 **문자열 그대로** 쓴다 (예: `P.6`). 책별 페이지 앵커 데이터는
 * 콘텐츠 제작 범위다 (`P3-BIP-14`, `BACKEND_INTEGRATION_PENDING`).
 *
 * ── `coachingNote` — **Prompt 1개당 1개** (`stage-3-approvals.md` §12.14, 사용자 2026-10-05) ──
 * 사용자 설명: *"카드 뒷면은 각 페이지별 코칭 노트(아이에게 질문할 프롬프트) 하나당 하나의
 * 상세 코칭 노트가 매칭되어 있음."* 그래서 **카드 단위 `coachingLine` 을 없애고** 코칭 노트를
 * Prompt 에 붙인다 — 앞면 pill 개수 = 뒷면 노트 개수가 **타입으로** 보장된다.
 *
 * `follow_up` 은 노트를 갖지 않으므로 `null` 이다. **`question` 에는 필수**이며 그 규칙은
 * `createPromptCoachingRefine()` 이 소유한다 (같은 규칙을 쓰는 배열이 둘 이상이라 팩토리로
 * 분리한다 — Stage 2 `D-10` "규칙은 팩토리" 원칙).
 */
export const PromptSchema = z.object({
  id: IdSchema,
  kind: PromptKindSchema,
  text: z.string().min(1),
  /** 세트 안의 표시 순서. 서버가 정한다. */
  order: z.number().int().min(0),
  phase: PromptPhaseSchema.nullable().optional(),
  pageRef: z.string().min(1).nullable().optional(),
  /** 부모용 **상세 코칭 노트**. `question` 은 필수, `follow_up` 은 `null` 이다 (§12.14). */
  coachingNote: z.string().min(1).nullable().optional(),
});

export type Prompt = z.infer<typeof PromptSchema>;

/**
 * "질문 Prompt 는 상세 코칭 노트를 **반드시** 동반한다" 규칙 (§12.14).
 *
 * 카드 뒷면이 `[pill, note]` 를 1:1 로 그리므로, 노트가 비면 화면에 빈 자리가 생긴다.
 * 조건문을 복제하지 않도록 팩토리로 둔다 — `ActivityCardOption.promptPreview` 와
 * `PromptSet.questions` 가 같은 규칙을 쓴다.
 */
export function createPromptCoachingRefine() {
  return (prompts: readonly Prompt[], ctx: z.RefinementCtx): void => {
    prompts.forEach((prompt, index) => {
      if (prompt.kind !== 'question') return;
      if (prompt.coachingNote !== undefined && prompt.coachingNote !== null) return;

      ctx.addIssue({
        code: 'custom',
        path: [index, 'coachingNote'],
        message: 'coachingNote is required for question prompts.',
      });
    });
  };
}

export const PromptSetSchema = z.object({
  id: IdSchema,
  capability: CapabilitySchema,
  ageBand: AgeBandSchema,
  /**
   * **상한 없음** (D-21). 최소 1개.
   * 세트 단위 `coachingLine` 은 **삭제**되었다 — 코칭 노트는 `Prompt.coachingNote` 다 (§12.14).
   */
  questions: z.array(PromptSchema).min(1).superRefine(createPromptCoachingRefine()),
  /** 이어 갈 수 있는 문장. 없을 수 있다. 코칭 노트를 갖지 않는다. */
  followUps: z.array(PromptSchema),
});

export type PromptSet = z.infer<typeof PromptSetSchema>;
