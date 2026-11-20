/**
 * `WeekPickerChip` + 주 선택 시트 — Stage 7 Spec §3.2 · §2.7 (Figma `31:118` chip · `C13-S7-6` 시트, `N7-25` · `N7-47`).
 *
 * | 항목 | Figma `31:118` | 구현 |
 * |---|---|---|
 * | 기하 | 115×34 · pad 14/9 · gap 6 · pill | `--week-picker-chip-*` (`T7-12`) · 높이 34 · hit 44(::before) |
 * | 면 · 그림자 | `glass-fill` 74% · drop `0 6 4` 1겹 + inset 2겹 | `--color-surface-glass` · `--shadow-bubble` (`26:40` 과 같은 재질) |
 * | 라벨 | Semibold 13 `text-primary` | `Text footnote semibold primary` (Δ0) |
 * | chevron | `chevron-down` 12 · `#7d9291` | `Icon chevron-down` · `--week-picker-chip-icon-size` · `--color-fg-secondary` |
 *
 * 동작 (Spec §2.7):
 * - 탭 → `Sheet`(bottom) *Choose a week* → `RadioGroup card` (옵션 = `availableWeeks` 서버 순서 = 최신 먼저, 첫 옵션 meta *This week*).
 * - 선택 **즉시** 시트 닫힘 + 그 주 조회. 포커스는 chip 으로 돌아간다 (`Sheet` focus trap 복원).
 * - 선택 가능한 주가 1개(`progress-first-week`)이거나 아직 응답이 없으면 **정적 라벨** — button 아님 · chevron 0 · 포커스 불가.
 * - chip 은 주를 바꾸는 동안 **이전 성공 값**을 유지한다 (`keepPrevious` — Spec §2.9). 데이터가 없으면 정적 *This week*.
 *
 * 리포트 카드는 주 선택과 무관하다 (overview 는 주 파라미터가 없다).
 */
import { Icon, RadioGroup, Sheet, Text } from '@haru/ui';
import { useState } from 'react';

import { useWeeklyProgress } from '../../../entities/weekly-progress';
import { formatCalendarRange } from '../../../shared/lib/calendar-date-format';
import { progressOverviewCopy } from '../copy';
import { useSelectedWeek } from '../model/useSelectedWeek';
import { weekRangeLabel } from '../model/weeklyView';

const copy = progressOverviewCopy.weekPicker;

export function WeekPickerChip() {
  const { weekStart, selectWeek } = useSelectedWeek();
  const { weekly } = useWeeklyProgress({ weekStart, keepPrevious: true });
  const [open, setOpen] = useState(false);

  const selected = weekStart ?? weekly?.week.start;
  const range =
    selected === undefined
      ? null
      : weekly !== undefined && weekly.week.start === selected
        ? formatCalendarRange(weekly.week.start, weekly.week.end)
        : weekRangeLabel(selected);

  const label = (
    <Text as="span" variant="footnote" weight="semibold" tone="primary">
      {range ?? copy.thisWeek}
    </Text>
  );

  const weeks = weekly?.availableWeeks ?? [];
  if (range === null || weeks.length <= 1) {
    return <span className="haru-week-picker-chip haru-week-picker-chip--static">{label}</span>;
  }

  const current = weeks[0];

  return (
    <>
      <button
        type="button"
        className="haru-week-picker-chip haru-focus-ring"
        aria-haspopup="dialog"
        aria-label={copy.changeLabel(range)}
        onClick={() => {
          setOpen(true);
        }}
      >
        {label}
        <span className="haru-week-picker-chip__icon">
          <Icon name="chevron-down" size="sm" tone="inherit" decorative />
        </span>
      </button>
      <Sheet
        open={open}
        title={copy.sheetTitle}
        onClose={() => {
          setOpen(false);
        }}
      >
        <RadioGroup
          legend={copy.legend}
          legendVisuallyHidden
          name="progress-week"
          variant="card"
          options={weeks.map((start, index) => ({
            value: start,
            label: weekRangeLabel(start),
            ...(index === 0 ? { meta: copy.thisWeekMeta } : {}),
          }))}
          value={selected ?? current ?? null}
          onChange={(value) => {
            selectWeek(value === current ? undefined : value);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
