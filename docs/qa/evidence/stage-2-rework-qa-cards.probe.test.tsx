/** QA probe — 카드 수 분모: Trial 15 / 인증+Q5 16 / owned-books-empty 15 / instrument-v2. */
import { describe, expect, it } from 'vitest';

import {
  surveyCards,
  cardCountsByStep,
} from '/Users/soojin/dev/haru/apps/web/src/features/onboarding-survey';
import { CARD_STEPS } from '/Users/soojin/dev/haru/apps/web/src/features/onboarding-survey/model/steps';
import {
  createOnboardingInstrumentFixture,
  createOwnedBookOptions,
} from '/Users/soojin/dev/haru/apps/web/src/mocks/fixtures/onboarding';

function dump(label: string, instrument: ReturnType<typeof createOnboardingInstrumentFixture>) {
  const cards = surveyCards(instrument, CARD_STEPS);
  // eslint-disable-next-line no-console
  console.log(
    `QA-CARDS ${label} total=${String(cards.length)} byStep=${JSON.stringify(
      cardCountsByStep(cards, CARD_STEPS),
    )} keys=${JSON.stringify(cards.map((c) => c.key))}`,
  );
  return cards.length;
}

describe('QA probe — 카드 수 분모', () => {
  it('구간별 카드 수', () => {
    const authed = dump('인증+Q5카탈로그', createOnboardingInstrumentFixture({ ownedBookOptions: createOwnedBookOptions() }));
    const trial = dump('Trial(카탈로그 없음)', createOnboardingInstrumentFixture({ ownedBookOptions: [] }));
    const dflt = dump('기본 fixture', createOnboardingInstrumentFixture());
    expect(authed).toBeGreaterThan(0);
    expect(trial).toBeGreaterThan(0);
    expect(dflt).toBeGreaterThan(0);
  });
});
