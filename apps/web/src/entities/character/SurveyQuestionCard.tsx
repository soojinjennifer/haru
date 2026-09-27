/**
 * `SurveyQuestionCard` — Design Spec §5.3 (Figma `179:1783` 실측).
 *
 * 설문 카드 1장. **문항 문구를 소유하지 않는다** — 전부 instrument 응답 값이 prop 으로 들어온다
 * (AC-2-24, `.claude/rules/architecture.md` §8).
 *
 * 세로 구성: counter → eyebrow → question → 옵션. 스크린리더 읽기 순서도 같다.
 * 고정 높이를 만들지 않는다 (Figma 546 은 결과값 — 텍스트 확대 시 늘어나야 한다).
 */
import { Icon, IconButton, Surface, Text } from '@haru/ui';
import { useId, type ReactNode } from 'react';

export interface SurveyQuestionCardProps {
  /** "3 / 10" — 문구는 소비자가 만든다. */
  counter: string;
  /** 공통 도입 문장 (instrument `stem`). */
  eyebrow: string;
  /** 문항 문구 (instrument `items[].prompt`). */
  question: string;
  /** 응답 컨트롤 — `RadioGroup variant="card"`. */
  children: ReactNode;
  /** 응답 해제 (`179:1804`). 응답이 없으면 주지 않는다. */
  onClear?: (() => void) | undefined;
  clearLabel: string;
  /** eyebrow 요소의 id — `RadioGroup` 의 `aria-describedby` 가 가리킨다 (§5.3). */
  eyebrowId?: string | undefined;
}

export function SurveyQuestionCard({
  counter,
  eyebrow,
  question,
  children,
  onClear,
  clearLabel,
  eyebrowId,
}: SurveyQuestionCardProps) {
  const questionId = useId();

  return (
    <section aria-labelledby={questionId}>
      <Surface fill="strong" radius="card" padding="6">
        <div className="flex flex-col gap-10">
          <div className="flex items-start justify-between gap-3">
            <Text variant="caption-1" tone="secondary">
              {counter}
            </Text>
            {onClear === undefined ? null : (
              <IconButton
                icon={<Icon name="rotate-ccw" decorative />}
                label={clearLabel}
                variant="plain"
                onPress={onClear}
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              {/* 대문자 표시는 CSS 가 한다 — 응답 값 문자열을 가공하지 않는다. */}
              <div className="haru-survey-eyebrow">
                <Text id={eyebrowId} variant="caption-1" tone="secondary">
                  {eyebrow}
                </Text>
              </div>
              <Text id={questionId} variant="title-3" tone="strong" as="h2">
                {question}
              </Text>
            </div>
            {children}
          </div>
        </div>
      </Surface>
    </section>
  );
}
