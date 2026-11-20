/**
 * `HighlightClipList` — 리포트 상세 ⑥ 하이라이트 클립 (Stage 7 Spec §2.3 ⑥ · §2.5 `C13-S7-3`, `S7-E`, FR-18).
 * Figma 없음 → design-agent 명세 (`D7-3`). 카드 recipe = `ProfileCard` (상세 다른 섹션과 같다).
 *
 * ```
 * ProfileCard  h2 "Highlight clips"
 * └─ ul  gap --clip-row-gap
 *     └─ HighlightClipRow ×N        (entities/highlight-clip — 표시만)
 * <audio preload="none">            목록 전체가 1개를 공유 (동시 재생 1 — AC-7-50) · 재생 탭 전 URL 조회 0 (AC-7-49)
 * ```
 *
 * page 가 `ReportDetailView` 의 `clipList` slot 으로 꽂는다 (feature 간 import 0 — Plan §5.1).
 * 클립 0 개면 섹션을 그리지 않는 조건은 `ReportDetailView` 에 있다 (Spec §2.3 ⑥).
 */
import type { ReportHighlightClip } from '@haru/contracts';
import { Text } from '@haru/ui';

import { ProfileCard } from '../../../entities/child-profile';
import { HighlightClipRow, type HighlightClipRowProps } from '../../../entities/highlight-clip';
import { formatCalendarMonthDay } from '../../../shared/lib/calendar-date-format';
import { createSystemClock } from '../../../shared/lib/clock';
import { highlightClipCopy as copy } from '../copy';
import { formatClipTime, type ClipRowState } from '../model/clipPlayerState';
import { useClipPlayer } from '../model/useClipPlayer';

const systemClock = createSystemClock();

export interface HighlightClipListProps {
  clips: readonly ReportHighlightClip[];
  /** 기준 시각 — 기본 = 시스템 시계. 테스트가 주입한다. */
  now?: (() => number) | undefined;
}

/** 행 상태 → 표시 props (상태 머신 밖의 순수 매핑). */
export function clipRowView(
  clip: ReportHighlightClip,
  row: ClipRowState,
): Omit<HighlightClipRowProps, 'button'> & {
  button: Omit<HighlightClipRowProps['button'], 'onPress'>;
} {
  const unavailable = row.status === 'unavailable';
  const playing = row.status === 'playing';
  const elapsed = formatClipTime(Math.min(row.positionSeconds, clip.durationSeconds));
  const total = formatClipTime(clip.durationSeconds);

  let message: HighlightClipRowProps['message'] = null;
  if (unavailable) message = { text: copy.unavailable, tone: 'secondary' };
  else if (row.status === 'error') {
    message = { text: row.errorKind === 'offline' ? copy.offline : copy.error, tone: 'error' };
  }

  return {
    label: clip.label,
    sessionDateText: formatCalendarMonthDay(clip.sessionDate),
    button: {
      icon: playing ? 'pause' : 'play',
      label: unavailable
        ? copy.unavailableButton(clip.label)
        : playing
          ? copy.pause(clip.label)
          : copy.play(clip.label),
      loading: row.status === 'loading',
      unavailable,
    },
    progress: unavailable
      ? null
      : {
          valueSeconds: Math.min(row.positionSeconds, clip.durationSeconds),
          maxSeconds: clip.durationSeconds,
          timeText: copy.timeText(elapsed, total),
          valueText: copy.progressValue(elapsed, total),
          label: copy.progressLabel(clip.label),
        },
    message,
    announcement: playing ? copy.playing : row.status === 'paused' ? copy.paused : '',
  };
}

function ClipList({ clips, now }: { clips: readonly ReportHighlightClip[]; now: () => number }) {
  const { state, audioRef, toggle } = useClipPlayer(clips, { now });

  return (
    <ProfileCard>
      <div className="contents" data-section="clips">
        <Text as="h2" variant="subheadline" weight="bold" tone="primary">
          {copy.title}
        </Text>
        <ul className="haru-clip-list">
          {clips.map((clip) => {
            const view = clipRowView(clip, state.rows[clip.id] ?? IDLE_ROW);
            return (
              <HighlightClipRow
                key={clip.id}
                {...view}
                button={{
                  ...view.button,
                  onPress: () => {
                    toggle(clip);
                  },
                }}
              />
            );
          })}
        </ul>
        {/*
          컨트롤 없는 `<audio>` 는 렌더되지 않는다 (UA 기본 display: none). src 는 재생 탭 뒤에만 붙는다.
          caption track 없음: 조작·상태는 행의 버튼 이름 · live 문구 · 서버 캡션(label)이 전달하고,
          발화 전사(transcript)는 아동 데이터라 클립 contract 에 없다 (C7-5 · Plan §5.6) — H7-5 판단 기록.
        */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} preload="none" />
      </div>
    </ProfileCard>
  );
}

const IDLE_ROW: ClipRowState = { status: 'idle', positionSeconds: 0, errorKind: null };

export function HighlightClipList({ clips, now = systemClock.now }: HighlightClipListProps) {
  // 클립 구성이 바뀌면(다른 리포트) 상태 머신을 새로 시작한다 — 이전 클립 위치 · 상태가 섞이지 않게.
  const identity = clips.map((clip) => `${clip.id}@${clip.expiresAt ?? ''}`).join('|');
  return <ClipList key={identity} clips={clips} now={now} />;
}
