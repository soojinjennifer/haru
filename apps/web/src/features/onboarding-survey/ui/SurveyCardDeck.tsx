/**
 * 카드 덱 — **네 단계가 모두 이 컴포넌트를 쓴다** (재구성 Design Spec §3 · §14).
 *
 * 한 카드 = 한 문항이고, 카드 종류(단일 선택 · 복수 선택 · 좋아하는 책 · 역량 문항)에 따라
 * **내용만** 분기한다. 카드 목록·개수·순서는 instrument 파생값이며 이 파일에 없다.
 *
 * 접근성 (결정 **D-9**, WCAG 2.5.1)
 * - `SwipeDeck controls="none"` 으로 쓰되 **같은 동작의 버튼을 TopBar 에 둔다**
 *   (`OnboardingWizard` 가 렌더). 제스처 없이 버튼·키보드만으로 모든 카드에 도달한다.
 * - 덱 안에서 `ArrowLeft`/`ArrowRight` 가 카드 이동이다. `RadioGroup` 위에서는 라디오 이동이
 *   우선이므로 (SwipeDeck 의 `KEY_OWNING_SELECTOR`) 옵션 선택과 충돌하지 않는다.
 *
 * 자동 전진 (§14.1 · §14.2)
 * - **단일 선택 카드만** 포인터 선택 후 `--motion-duration-slow`(400ms) 대기 뒤 다음 카드로.
 * - **이미 떠난 적 있는 카드에서는 끈다** — 없으면 오선택을 고치는 순간 또 튕겨나가 수정이
 *   불가능해진다 (§14.2-3).
 * - `prefers-reduced-motion` 은 슬라이드만 없애고 **대기는 유지**한다 (`SwipeDeck.css` 가 모션을
 *   끄므로 이 파일은 대기만 관리한다).
 */
import { SwipeDeck } from '@haru/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnboardingDraftAnswers, OnboardingInstrument } from '@haru/contracts';

import { onboardingCopy } from '../copy';
import { cardPosition, type SurveyCard } from '../model/instrumentView';

import { CapabilityItemCard } from './CapabilityItemCard';
import { ChoiceQuestionCard } from './ChoiceQuestionCard';
import { FavoriteBooksCard } from './FavoriteBooksCard';

/** 자동 전진 대기 — 기존 모션 토큰 `--motion-duration-slow` 와 같은 값이다 (신규 토큰 0건). */
export const AUTO_ADVANCE_DELAY_MS = 400;

export interface SurveyCardDeckProps {
  instrument: OnboardingInstrument;
  /** 이 단계에서 그릴 카드들. */
  cards: readonly SurveyCard[];
  /** 전체 통산 카드 목록 — 카운터 분모와 번호의 출처다 (`R-02`). */
  allCards: readonly SurveyCard[];
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
  index: number;
  onIndexChange: (index: number) => void;
  /** 필수 미응답으로 전진이 막힌 문항의 id 목록 (instrument 판정 결과). */
  missingRequired: readonly string[];
  /**
   * 카드 전환을 알리는 문구 — `{단계 제목} · {n} of N` (§14.3 · §15).
   * `SwipeDeck` 의 `aria-live` 영역이 이 값을 읽는다. 라이브 영역을 두 개 두지 않는다.
   */
  announcement?: string | undefined;
}

export function SurveyCardDeck({
  instrument,
  cards,
  allCards,
  answers,
  onChange,
  index,
  onIndexChange,
  missingRequired,
  announcement,
}: SurveyCardDeckProps) {
  const copy = onboardingCopy.survey;
  const total = allCards.length;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  /**
   * 한 번 떠난 적 있는 카드의 key. **세션 동안 유지**되며, 여기에 있는 카드에서는 자동 전진이
   * 일어나지 않는다 (§14.2-3).
   */
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set<string>());

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  /** 새 카드의 **첫 번째 옵션**으로 포커스를 옮긴다 — 덱 밖으로 떨어지지 않게 (§14.3). */
  const focusFrontCard = useCallback(() => {
    const first = containerRef.current?.querySelector<HTMLElement>(
      '.haru-swipe-deck__card--front input:not([disabled]), .haru-swipe-deck__card--front button:not([disabled])',
    );
    first?.focus();
  }, []);

  const goToCard = useCallback(
    (next: number) => {
      onIndexChange(next);
      // 포커스는 렌더가 끝난 뒤에 옮겨야 새 카드의 요소를 잡는다.
      requestAnimationFrame(focusFrontCard);
    },
    [focusFrontCard, onIndexChange],
  );

  const scheduleAdvance = useCallback(
    (cardKey: string, cardIndex: number) => {
      if (visited.has(cardKey)) return;
      if (cardIndex >= cards.length - 1) return;

      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setVisited((current) => new Set(current).add(cardKey));
        goToCard(cardIndex + 1);
      }, AUTO_ADVANCE_DELAY_MS);
    },
    [cards.length, goToCard, visited],
  );

  /** 수동 이동(스와이프·chevron)도 "떠난 카드" 로 기록한다. */
  const handleIndexChange = useCallback(
    (next: number) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const leaving = cards[index];
      if (leaving !== undefined) {
        setVisited((current) => new Set(current).add(leaving.key));
      }

      onIndexChange(next);
    },
    [cards, index, onIndexChange],
  );

  function renderCard(card: SurveyCard, cardIndex: number) {
    const counter = copy.counter(cardPosition(allCards, card.key), total);
    const advance = () => {
      scheduleAdvance(card.key, cardIndex);
    };

    switch (card.kind) {
      case 'choice':
        return (
          <ChoiceQuestionCard
            question={card.question}
            answers={answers}
            onChange={onChange}
            counter={counter}
            blockedReason={
              missingRequired.includes(card.question.questionId)
                ? onboardingCopy.wizard.requiredBlockedReason
                : undefined
            }
            {...(card.question.selection === 'single' ? { onSingleChoiceCommitted: advance } : {})}
          />
        );
      case 'favorite-books':
        return <FavoriteBooksCard answers={answers} onChange={onChange} counter={counter} />;
      case 'capability-item':
        return (
          <CapabilityItemCard
            instrument={instrument}
            item={card.item}
            stem={card.stem}
            answers={answers}
            onChange={onChange}
            counter={counter}
            onSingleChoiceCommitted={advance}
          />
        );
    }
  }

  return (
    <div ref={containerRef}>
      <SwipeDeck
        items={cards}
        index={index}
        onIndexChange={handleIndexChange}
        renderItem={renderCard}
        label={copy.deckLabel}
        prevLabel={copy.prevQuestion}
        nextLabel={copy.nextQuestion}
        statusLabel={
          announcement ?? copy.counter(cardPosition(allCards, cards[index]?.key ?? ''), total)
        }
        /* 이전/다음 버튼은 TopBar 에 있다 (Figma `179:1772`/`179:1775`). 덱 안에 중복 배치하지 않는다. */
        controls="none"
      />
    </div>
  );
}
