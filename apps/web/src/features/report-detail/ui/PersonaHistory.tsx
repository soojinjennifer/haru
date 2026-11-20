/**
 * `PersonaHistory` — 리포트 상세 ② 페르소나 히스토리 (`C13-S7-7`, Spec §2.3.2 · `N7-44` ⓐ). Figma 없음 → 명세.
 *
 * ```
 * section aria-labelledby
 * ├─ h2 "{firstName}'s storytime persona"   (카드 밖 섹션 제목)
 * └─ ol  서버 순서 = 오래된 것 먼저 (Frontend 정렬 0)
 *     └─ li  [rail 16 | PersonaCard]   eyebrow = SINCE {MON D} · 마지막만 NOW · footnote = trigger 출처 (`N7-42`)
 * ```
 *
 * - 1개(`report-persona-unchanged`) = rail 없음 · 카드 1장 + 카드 아래 *"… stayed the same …"* (AC-7-40).
 * - rail 은 `aria-hidden` — 순서는 `ol` 이 전달한다. 현재(마지막) 점 = action-primary, 이전 = fg-tertiary.
 * - 페르소나 이름은 섹션 h2 아래라 `h3` (`PersonaCard nameAs`).
 * - `isFallback` 구분 UI 0 (Stage 6 규칙) — 이 화면은 그 필드를 받지도 않는다.
 */
import { Text } from '@haru/ui';
import type { ReportPersonaHistoryEntry } from '@haru/contracts';
import { useId } from 'react';

import { PersonaCard } from '../../../entities/child-profile';
import { reportDetailCopy as copy } from '../copy';
import { personaTimeline } from '../model/reportDetailView';

export interface PersonaHistoryProps {
  firstName: string;
  history: readonly ReportPersonaHistoryEntry[];
}

export function PersonaHistory({ firstName, history }: PersonaHistoryProps) {
  const titleId = useId();
  const items = personaTimeline(history);
  const single = items.length === 1;

  return (
    <section className="haru-report-persona" aria-labelledby={titleId}>
      <Text as="h2" id={titleId} variant="subheadline" weight="bold" tone="primary">
        {copy.persona.title(firstName)}
      </Text>
      {single ? (
        <div className="haru-report-persona__single">
          {items.map((item) => (
            <PersonaCard
              key={item.key}
              firstName={firstName}
              persona={item.entry}
              eyebrow={item.eyebrow}
              footnote={item.source}
              nameAs="h3"
            />
          ))}
          <Text variant="footnote" tone="primary">
            {copy.persona.unchanged(firstName)}
          </Text>
        </div>
      ) : (
        <ol className="haru-report-persona__timeline">
          {items.map((item) => (
            <li
              key={item.key}
              className="haru-report-persona__item"
              data-current={item.isCurrent ? '' : undefined}
            >
              <span className="haru-report-persona__rail" aria-hidden="true">
                <span className="haru-report-persona__dot" />
              </span>
              <PersonaCard
                firstName={firstName}
                persona={item.entry}
                eyebrow={item.eyebrow}
                footnote={item.source}
                nameAs="h3"
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
