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
 * Stage 6 `cold-to-warm` — warm 단계(세션 4회~) 추천 문장 (Plan §8 · PRD §8.3).
 * **바뀌는 것은 서버 `reason` 문장뿐**이다 — 책·역량·카드 구조는 cold 와 같다 (Spec §2.8 "UI 영향 없음").
 * 길이는 cold 문장 범위(60~69자)를 지킨다 — Figma 설명 박스 257×40(2줄)에서 카드 높이가 바뀌지 않게.
 * 회고·대화 기록을 말할 뿐 진단·판정·비교 표현은 쓰지 않는다 (§8.4).
 */
const WARM_DECK: readonly OptionSeed[] = [
  {
    kind: 'book',
    capability: 'emotion_regulation',
    bookIndex: 0,
    reason: 'Feelings came up in your last talks, and this one gives them names.',
  },
  {
    kind: 'book',
    capability: 'cognitive_flexibility',
    bookIndex: 1,
    reason: 'Your recent "what if" talks fit a story where plans keep changing.',
  },
  {
    kind: 'book',
    capability: 'intrinsic_motivation',
    bookIndex: 2,
    reason: 'Questions kept coming last time, and these pages leave room for them.',
  },
];

/**
 * Stage 6 `difficulty-lowered` — 직전 회고에 `tricky_today` 가 있으면 다음 today card 는 **더 쉬운 책**이
 * 첫 장에 오고 그에 맞는 `reason` 이 붙는다 (PLANNING Exit · PRD §7.6). 난이도 배지·라벨은 없다 (`PF6-1`).
 * 나머지 두 장은 cold 문장 그대로다 (덱의 역량 3종 순환 유지 — `D-5`).
 */
const LOWERED_DECK: readonly OptionSeed[] = [
  {
    kind: 'book',
    capability: 'intrinsic_motivation',
    bookIndex: 2,
    reason: 'After a tricky night, short pages and a gentle rhythm keep it light.',
  },
  BOOK_DECK[0] as OptionSeed,
  BOOK_DECK[1] as OptionSeed,
];

/** cold 덱 설명 문장 — warm·하향 문장의 길이 기준 (테스트가 같은 범위를 단정한다). */
export const COLD_DECK_REASONS: readonly string[] = BOOK_DECK.map((seed) => seed.reason);
/** Stage 6 에서 추가한 덱 문장 (warm 3 · 하향 1). */
export const STAGE6_DECK_REASONS: readonly string[] = [
  ...WARM_DECK.map((seed) => seed.reason),
  (LOWERED_DECK[0] as OptionSeed).reason,
];

/**
 * 덱 구성 — scenario key 가 고르는 3장 조합.
 *
 * `conversation-only` 모양은 **폐지**되었다 (approvals §12.12). `books-exhausted` 는
 * 재독 카드 3장으로 "추천할 책 소진"(PRD §13)을 표현한다 — 책 없는 카드를 만들지 않는다.
 */
export type ActivityDeckShape = 'books' | 'reread' | 'exhausted' | 'saved' | 'warm' | 'lowered';

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
    case 'warm':
      return WARM_DECK;
    case 'lowered':
      return LOWERED_DECK;
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
