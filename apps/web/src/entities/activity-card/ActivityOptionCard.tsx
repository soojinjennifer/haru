/**
 * `ActivityOptionCard` — Figma `Prompt Card/Home` (`163:2649` `flip=front` · `86:482` `flip=back`).
 *
 * ```
 * .haru-activity-card-flip            block-size 415 (= 트랙 높이), perspective
 * └ __inner                           rotateY(0 | 180deg)
 *   ├ __face--front  409   ┐ 두 면 모두 inset-block-end: 0 → 카드 **하단 모서리**가
 *   └ __face--back   415   ┘ 두 상태에서 같다 (dots·탭바·캐릭터가 움직이지 않는다)
 * ```
 *
 * ── 뒤집기는 카드 **안**에서 끝난다 (approvals §12.2) ──
 * `86:482` 는 별도 시트가 아니라 **뒷면**이다: 컴포넌트 이름이 앞면과 같고, 시그니처에
 * `flip?: "front"` variant 가 있으며, 우상단 아이콘의 Figma 에셋명이 **`flip_to_back`** 이다.
 * 그래서 Shared UI 신규가 필요 없다 — CSS `rotateY` 만으로 성립한다 (audit §16.3).
 *
 * ── 높이를 고정하는 이유 ──
 * 앞면 409 · 뒷면 415 는 Figma 실측이고, 컨테이너 415 가 둘을 모두 담는다. 내용이 설계치를
 * 넘으면 **본문 블록만** 세로 스크롤한다 (`A-5`·`A-11`). 카드 높이를 데이터에 연동하면
 * 트랙 높이가 흔들려 캐릭터 가림 정도와 dots 위치가 달라진다.
 *
 * **모든 문구는 서버 값이거나 주입된 copy 다** (`AC-3-13`). 이 파일에 사용자 노출 문자열
 * 리터럴이 없다.
 */
import { Icon, Text } from '@haru/ui';
import { useState, type ReactNode } from 'react';
import type { ActivityCardOption } from '@haru/contracts';

import { BookCover } from '../book';

import { CapabilityBadge } from './CapabilityBadge';
import { CoachingNote } from './CoachingNote';
import { PromptPill } from './PromptPill';
import { PromptPreview } from './PromptPreview';

export interface ActivityOptionCardCopy {
  /** 앞면 flip 버튼의 접근성 이름 (예: `Show prompts and coaching notes`). */
  showBack: string;
  /** 뒷면 flip 버튼의 접근성 이름 (예: `Show the book`). */
  showFront: string;
  /** 뒷면 제목 — Figma `Prompt of this book` (**단수형**). */
  backTitle: string;
  /** Prompt 목록 블록의 접근성 이름. */
  promptsLabel: string;
}

export interface ActivityOptionCardProps {
  option: ActivityCardOption;
  copy: ActivityOptionCardCopy;
  /** ActionBar 슬롯 — `★ Save` · `Start Session` 은 feature 가 소유한다 (앞면에만 있다). */
  actionBar: ReactNode;
}

/** 카드가 보여 줄 제목·저자. 서버 값만 쓰며 문장을 만들지 않는다. */
export function optionHeadline(option: ActivityCardOption): {
  title: string;
  author: string;
} {
  return { title: option.book.title, author: option.book.author };
}

function FlipButton({
  label,
  pressed,
  onPress,
}: {
  label: string;
  pressed: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      className="haru-activity-card__flip haru-focus-ring"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onPress}
    >
      <Icon name="haru:flip-to-back" size="lg" decorative />
    </button>
  );
}

export function ActivityOptionCard({ option, copy, actionBar }: ActivityOptionCardProps) {
  const [back, setBack] = useState(false);
  const { title, author } = optionHeadline(option);

  function flip(): void {
    setBack((current) => !current);
  }

  return (
    <div className="haru-activity-card-flip" data-face={back ? 'back' : 'front'}>
      <div className="haru-activity-card-flip__inner">
        <div
          className="haru-activity-card-flip__face haru-activity-card-flip__face--front haru-activity-card haru-activity-card--front"
          inert={back}
          aria-hidden={back}
        >
          <div className="haru-activity-card__header">
            <CapabilityBadge capability={option.capability} />
            <FlipButton label={copy.showBack} pressed={back} onPress={flip} />
          </div>

          <div className="haru-activity-card__book">
            <BookCover title={title} author={author} coverUrl={option.book.coverUrl} decorative />
            <div className="haru-activity-card__book-text">
              <Text as="h2" variant="headline" weight="bold" truncate={1}>
                {title}
              </Text>
              <Text variant="caption-1" tone="secondary" truncate={1}>
                {author}
              </Text>
              <Text variant="footnote" truncate={2}>
                {option.reason}
              </Text>
            </div>
          </div>

          <PromptPreview prompts={option.promptPreview} label={copy.promptsLabel} />

          <div className="haru-activity-card__actions">{actionBar}</div>
        </div>

        <div
          className="haru-activity-card-flip__face haru-activity-card-flip__face--back haru-activity-card haru-activity-card--back"
          inert={!back}
          aria-hidden={!back}
        >
          <div className="haru-activity-card__header">
            <Text as="h2" variant="headline" weight="bold">
              {copy.backTitle}
            </Text>
            <FlipButton label={copy.showFront} pressed={back} onPress={flip} />
          </div>

          {/* 스크롤 영역의 키보드 도달 — `PromptPreview` 와 같은 사유다 (WCAG 2.1.1). */}
          {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
          <div
            className="haru-activity-card__back-body"
            tabIndex={0}
            role="group"
            aria-label={copy.backTitle}
          >
            {/*
              Figma `86:482` 의 `[pill, note]` 2쌍은 **예시**이고 개수는 데이터가 정한다
              (`stage-3-approvals.md` §12.14, 사용자 2026-10-05): **Prompt 1개당 상세 코칭 노트
              1개**가 1:1 로 붙는다. 그래서 앞면 pill 개수 = 뒷면 노트 개수이고, 넘치면
              이 블록만 세로 스크롤한다 (트랙 415 불변 — `A-5`·`A-11`).
            */}
            {option.promptPreview.map((prompt) => (
              <div key={prompt.id} className="haru-activity-card__back-item">
                <PromptPill prompt={prompt} />
                {prompt.coachingNote === undefined || prompt.coachingNote === null ? null : (
                  <CoachingNote>{prompt.coachingNote}</CoachingNote>
                )}
              </div>
            ))}
          </div>
          {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
        </div>
      </div>
    </div>
  );
}
