/**
 * Activity Card fixture — Stage 3 Plan §8.2, Figma `163:2648` 재대조(2026-10-05).
 *
 * - 덱은 **정확히 3장**이다 (PRD §7.9).
 * - 카드마다 **다른 역량**을 쓴다 (`CONFIRMED (D-5)`). 카드 단위 대표 역량은 없다 (`D-22`).
 * - **모든 옵션에 책이 있다** — `conversation_only` 카드는 폐지되었다 (approvals §12.12).
 *   추천할 책이 소진된 상황은 **재독 카드**로 표현한다.
 * - `promptPreview` 는 **5개**다 (`D-21` · approvals §12.14 "데모 5개 유지"). Frontend 는
 *   자르지 않으며, 앞면 186(= pill 4개)을 넘는 만큼 **목록이 내부 스크롤**한다.
 * - **코칭 노트는 Prompt 마다 1개**다 (§12.14) — 카드 단위 `coachingLine` 은 contract 에서
 *   삭제되었고 뒷면이 `[pill, note]` 를 1:1 로 그린다.
 * - `date` 는 **주입된 clock** 에서 나온다 — 같은 key 를 두 번 불러도 같은 값이다 (`D-10`).
 *   화면은 이 날짜를 **표시하지 않는다** (`AC-3-11` 폐기 — approvals §12.8).
 * - `saved` 는 `G-14` 로 추가된 초기 저장 상태다. `book-saved` 모양이 켜진 카드만 `true` 다.
 */
import { ActivityCardSchema, type ActivityCard, type ActivityCardOption } from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';
import { toCalendarDate } from '../../shared/lib/clock';

import { createPromptPreviewFixture } from './prompt-sets';
import { DECK_BOOKS } from './saved-books';

export const MOCK_ACTIVITY_CARD_ID = '77777777-7777-4777-8777-000000000001';

function optionId(index: number): string {
  return `88888888-8888-4888-8888-${String(index + 1).padStart(12, '0')}`;
}

type OptionSeed = Pick<ActivityCardOption, 'kind' | 'capability'> & {
  bookIndex: number;
  reason: string;
};

const BOOK_DECK: readonly OptionSeed[] = [
  {
    kind: 'book',
    capability: 'emotion_regulation',
    bookIndex: 0,
    reason: 'A big feeling gets a shape your child can point at and name.',
  },
  {
    kind: 'book',
    capability: 'cognitive_flexibility',
    bookIndex: 1,
    reason: 'The plan keeps falling apart, which opens up a lot of "what if" talk.',
  },
  {
    kind: 'book',
    capability: 'intrinsic_motivation',
    bookIndex: 2,
    reason: 'Short pages and a steady rhythm, easy to follow when energy is low.',
  },
];

const REREAD_SEED: OptionSeed = {
  kind: 'reread_book',
  capability: 'self_directed_agency',
  bookIndex: 0,
  reason: 'You read this one together before, and tonight it comes with a new set of prompts.',
};

function toOption(seed: OptionSeed, position: 0 | 1 | 2, saved: boolean): ActivityCardOption {
  const book = DECK_BOOKS[seed.bookIndex] ?? DECK_BOOKS[0];
  if (book === undefined) throw new Error('DECK_BOOKS fixture is empty.');

  return {
    id: optionId(position),
    position,
    kind: seed.kind,
    capability: seed.capability,
    book,
    reason: seed.reason,
    promptPreview: createPromptPreviewFixture(`0000${String(position)}`),
    saved,
  };
}

/**
 * 덱 구성 — scenario key 가 고르는 3장 조합.
 *
 * `conversation-only` 모양은 **폐지**되었다 (approvals §12.12). `books-exhausted` 는
 * 재독 카드 3장으로 "추천할 책 소진"(PRD §13)을 표현한다 — 책 없는 카드를 만들지 않는다.
 */
export type ActivityDeckShape = 'books' | 'reread' | 'exhausted' | 'saved';

function seedsFor(shape: ActivityDeckShape): readonly OptionSeed[] {
  switch (shape) {
    case 'reread':
      return [REREAD_SEED, BOOK_DECK[1] as OptionSeed, BOOK_DECK[2] as OptionSeed];
    case 'exhausted':
      return [
        REREAD_SEED,
        { ...REREAD_SEED, capability: 'emotion_regulation', bookIndex: 1 },
        { ...REREAD_SEED, capability: 'intrinsic_motivation', bookIndex: 2 },
      ];
    default:
      return BOOK_DECK;
  }
}

export function createActivityCardFixture(
  clock: Clock,
  shape: ActivityDeckShape = 'books',
): ActivityCard {
  const seeds = seedsFor(shape);
  // `saved` 모양은 **첫 카드만** 저장된 상태다 — 저장/미저장이 한 화면에 같이 보여야 한다.
  const saved = (position: 0 | 1 | 2): boolean => shape === 'saved' && position === 0;

  return ActivityCardSchema.parse({
    id: MOCK_ACTIVITY_CARD_ID,
    date: toCalendarDate(clock.now()),
    options: [
      toOption(seeds[0] as OptionSeed, 0, saved(0)),
      toOption(seeds[1] as OptionSeed, 1, saved(1)),
      toOption(seeds[2] as OptionSeed, 2, saved(2)),
    ],
  });
}
