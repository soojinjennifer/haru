/**
 * Prompt fixture — Stage 3 Design Spec §5.4.1 · §8, `CONFIRMED (D-8 · D-21)`.
 *
 * 규칙
 *  - **가상 데이터만** 담는다 (실제 아동 데이터 금지).
 *  - `phase` · `pageRef` 를 **결정적으로** 채워 배지가 화면에 실제로 보이게 하고,
 *    **둘 다 `null` 인 Prompt 를 최소 1개** 섞어 **미렌더 경로**도 함께 검증한다 (§8 `success`).
 *  - `success` 경로가 **4개 이상**을 담는다 — `D-21` 로 contract 상한이 제거되었음을 기본
 *    경로에서 증명한다. **5개 유지**가 사용자 결정이다 (approvals §12.14) — 앞면 Prompt 영역
 *    186(=pill 4개)을 넘기므로 **내부 스크롤이 실제로 도는지** 검수에서 확인할 수 있다.
 *  - **Prompt 마다 상세 코칭 노트가 1:1 로 붙는다** (§12.14). 카드 뒷면이 `[pill, note]` 를
 *    그 개수만큼 그린다. `follow_up` 은 노트를 갖지 않는다.
 *  - 문구에 진단·판정·비교 표현을 쓰지 않는다 (§10 금지어).
 */
import { PromptSetSchema, type Prompt, type PromptSet } from '@haru/contracts';

/**
 * fixture id 는 scenario 간에도 같아야 비교가 쉽다 (idFactory 와 달리 고정값).
 * uuid 의 마지막 그룹은 **정확히 12자**여야 하므로 seed + index 를 그 길이로 맞춘다.
 */
function fixtureId(prefix: string, tail: string): string {
  return `${prefix}-${tail.padStart(12, '0').slice(-12)}`;
}

function promptId(seed: string, index: number): string {
  return fixtureId('55555555-5555-4555-8555', `${seed}${String(index)}`);
}

interface PromptSeed {
  text: string;
  phase?: 'pre' | 'post' | null;
  pageRef?: string | null;
  /** 질문 Prompt 에만 있다 (`follow_up` 은 `null`). */
  coachingNote?: string;
}

function toPrompts(seed: string, kind: Prompt['kind'], items: readonly PromptSeed[]): Prompt[] {
  return items.map((item, index) => ({
    id: promptId(seed, index),
    kind,
    text: item.text,
    order: index,
    phase: item.phase ?? null,
    pageRef: item.pageRef ?? null,
    coachingNote: item.coachingNote ?? null,
  }));
}

/**
 * 카드 미리보기용 5개 — 배지 조합을 전부 덮는다.
 * `PRE` 단독 / `POST` 단독 / 페이지 단독 / **둘 다**(`AD-S3-24`) / **둘 다 없음**(미렌더).
 *
 * 각 질문에 **상세 코칭 노트가 1:1** 로 붙는다 (§12.14). 노트는 보호자가 **무엇을 보면 되는지**
 * 를 말하며 진단·판정·비교 표현을 쓰지 않는다 (§10 금지어).
 */
export const MOCK_CARD_PROMPTS: readonly PromptSeed[] = [
  {
    text: 'What do you think is behind that door?',
    phase: 'pre',
    coachingNote:
      'Asking before you turn the page lets your child put their own idea into the story first. Whatever they say, say it back to them once — hearing their own idea repeated is what makes them want to offer the next one.',
  },
  {
    text: 'Which part made you want to keep turning the page?',
    phase: 'post',
    coachingNote:
      'This one asks them to look back at the whole story and pick. Give it a few seconds of quiet; choosing takes longer than answering. If they pick a page, open it again and let them show you.',
  },
  {
    text: 'Look at her face here — what is she feeling?',
    pageRef: 'P.6',
    coachingNote:
      'Naming a feeling on someone else is easier than naming your own. Point at what you notice in the picture before you name it, so they have something to look at while they find the word.',
  },
  {
    text: 'If you were in this room, what would you try first?',
    phase: 'post',
    pageRef: 'P.12',
    coachingNote:
      'Putting your child inside the scene turns the story into their plan. Build on whatever they offer instead of correcting it — "and then what?" keeps it going further than a question with a right answer.',
  },
  {
    text: 'What would you tell a friend about this story?',
    coachingNote:
      'Retelling in their own words is where you hear what stayed with them. Let the order be theirs even if it jumps around; the parts they keep are the parts that landed.',
  },
];

/** Prompt 세트 1개. `questions` 는 상한이 없으므로 기본값이 **4개 이상**이다. */
export function createPromptSetFixture(
  seed: string,
  capability: PromptSet['capability'],
): PromptSet {
  return PromptSetSchema.parse({
    id: fixtureId('66666666-6666-4666-8666', seed),
    capability,
    ageBand: '5_6',
    questions: toPrompts(seed, 'question', MOCK_CARD_PROMPTS),
    followUps: toPrompts(`${seed}f`, 'follow_up', [
      { text: 'Tell me more about that.' },
      { text: 'What made you think of it that way?' },
    ]),
  });
}

/** 카드 옵션의 `promptPreview` — 세트와 같은 문구를 쓴다 (선택 전후가 어긋나지 않게). */
export function createPromptPreviewFixture(seed: string): Prompt[] {
  return toPrompts(seed, 'question', MOCK_CARD_PROMPTS);
}
