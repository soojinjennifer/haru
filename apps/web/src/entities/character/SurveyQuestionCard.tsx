/**
 * `SurveyQuestionCard` — Design Spec §5.3 + 재구성 Design Spec §3.4 · §3.5 (Figma `179:1783`).
 *
 * 설문 카드 1장. **문항 문구를 소유하지 않는다** — 전부 instrument 응답 값이 prop 으로 들어온다
 * (AC-2-24, `.claude/rules/architecture.md` §8). 네 단계가 모두 이 카드를 쓴다.
 *
 * 세로 구성: counter → (eyebrow) → question → (description) → 콘텐츠 → (차단 사유).
 * 스크린리더 읽기 순서도 같다. 고정 높이를 만들지 않는다 (Figma 546 은 결과값 — 텍스트 확대 시
 * 늘어나야 한다).
 *
 * **표면을 이 컴포넌트가 소유한다** (`S2-FIX-3`): `SwipeDeck` 은 앞 카드에 면을 그리지 않는다.
 * 내부 여백은 `--space-6`(Figma 24) 한 겹이다.
 *
 * 해제 버튼은 counter 와 **같은 흐름에 두지 않는다** (§3.5): Figma `179:1804` 는 패딩 영역에
 * 겹쳐 있는 absolute 요소이고, flex row 에 넣으면 행 높이가 16 → 38 로 커져 카드가 22px 높아진다.
 */
import { Icon, IconButton, Surface, Text } from '@haru/ui';
import { useId, type ReactNode } from 'react';

export interface SurveyQuestionCardProps {
  /** "3 / 16" — 문구는 소비자가 만든다 (통산 카운터, `R-02`). */
  counter: string;
  /** 공통 도입 문장 (instrument `stem`). 선택형 문항에는 없다. */
  eyebrow?: string | undefined;
  /** 문항 문구 (instrument `prompt`). */
  question: string;
  /** 문항 아래 보조 설명 (instrument `description`). */
  description?: string | undefined;
  /** 응답 컨트롤 또는 임의 콘텐츠 (좋아하는 책 카드의 입력 + 목록 등). */
  children: ReactNode;
  /** 응답 해제 (`179:1804`). 응답이 없으면 주지 않는다. */
  onClear?: (() => void) | undefined;
  clearLabel: string;
  /** eyebrow 요소의 id — 응답 컨트롤의 `aria-describedby` 가 가리킨다 (§5.3). */
  eyebrowId?: string | undefined;
  /** description 요소의 id — 응답 컨트롤의 `aria-describedby` 가 가리킨다. */
  descriptionId?: string | undefined;
  /** 필수 미응답으로 전진이 막혔을 때의 사유 1행 (옵션 **아래**, 오류 톤 아님 — §3.2). */
  blockedReason?: string | undefined;
  blockedReasonId?: string | undefined;
}

export function SurveyQuestionCard({
  counter,
  eyebrow,
  question,
  description,
  children,
  onClear,
  clearLabel,
  eyebrowId,
  descriptionId,
  blockedReason,
  blockedReasonId,
}: SurveyQuestionCardProps) {
  const questionId = useId();

  return (
    <section aria-labelledby={questionId} className="haru-survey-card">
      <Surface fill="strong" radius="card" padding="6">
        {onClear === undefined ? null : (
          <div className="haru-survey-card__clear">
            <IconButton
              icon={<Icon name="rotate-ccw" decorative />}
              label={clearLabel}
              variant="plain"
              onPress={onClear}
            />
          </div>
        )}

        <div className="flex flex-col gap-10">
          <Text variant="caption-1" tone="secondary">
            {counter}
          </Text>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              {eyebrow === undefined ? null : (
                /* 대문자 표시는 CSS 가 한다 — 응답 값 문자열을 가공하지 않는다. */
                <div className="haru-survey-eyebrow">
                  <Text id={eyebrowId} variant="caption-1" tone="secondary">
                    {eyebrow}
                  </Text>
                </div>
              )}
              <Text id={questionId} variant="title-3" tone="strong" as="h2">
                {question}
              </Text>
              {description === undefined ? null : (
                <Text id={descriptionId} variant="caption-1" tone="secondary">
                  {description}
                </Text>
              )}
            </div>
            {children}
            {blockedReason === undefined ? null : (
              <Text id={blockedReasonId} variant="caption-1" tone="secondary">
                {blockedReason}
              </Text>
            )}
          </div>
        </div>
      </Surface>
    </section>
  );
}
