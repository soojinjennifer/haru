/**
 * `HighlightClipRow` — 하이라이트 클립 한 행 (Stage 7 Spec §2.5 `C13-S7-3`, Figma 없음 → design-agent 명세 · 가값 `P-39`).
 *
 * ```
 * li  grid [44 | 1fr]  column-gap --clip-row-gap · row-gap 4  align center
 * ├─ IconButton glass 38 · hit 44   play | pause | (loading: Spinner)   행 1–3 가운데 (`VG7-E-05` ⓑ)
 * └─ col (display: contents — 아래가 2열 행)
 *    ├─ p  label (서버 캡션)            subheadline semibold primary  (말줄임 0)
 *    ├─ p  sessionDate "{Mon D}"         caption-1 secondary
 *    ├─ row  ProgressBar sm ··· "0:04 / 0:12"  caption-2 tabular-nums secondary (`VG7-E-06` ⓑ)  (unavailable 이면 숨김)
 *    └─ p  aria-live polite  caption-1 16  보조 문구 (불가 = 진행 자리 · 오류 = 다음 줄) + SR 전용 재생/정지 알림
 * ```
 *
 * **표시 전용** (Domain) — 상태 머신·문구·시간 포맷은 `features/highlight-clip-player` 가 정해서 넘긴다.
 * 새 Shared UI 0 (`IconButton` + `ProgressBar` + `Text` 조합 — Spec §2.5 · §3.9).
 *
 * - 진행 막대는 조작 불가(seek 0). `role="progressbar"` 유지 + `aria-valuetext` = 시간 문장 →
 *   SR 은 퍼센트가 아니라 시간을 읽는다 (Plan §5.7 클립 행 — H7-5 판단 기록). 옆 시간 텍스트는 같은 정보라 `aria-hidden`.
 * - 불가 상태: native `disabled` 가 아니라 `aria-disabled` — 포커스로 사유를 읽을 수 있게 (Spec §9.1). 누름 무시는 `onPress` 미지정.
 * - live region 은 행마다 1개, 처음부터 DOM 에 있다 (내용 변화만 읽힌다).
 */
import { Icon, IconButton, ProgressBar, Text } from '@haru/ui';

export type HighlightClipRowMessageTone = 'secondary' | 'error';

export interface HighlightClipRowProps {
  /** 서버 캡션 (`ReportHighlightClip.label`) — 그대로 표시. */
  label: string;
  /** 포맷된 세션 날짜 (예 *"May 5"*). */
  sessionDateText: string;
  button: {
    icon: 'play' | 'pause';
    /** 접근성 이름 (예 *"Play clip: Talking about feelings"*). */
    label: string;
    loading: boolean;
    /** `aria-disabled` — 불가 상태. */
    unavailable: boolean;
    onPress?: (() => void) | undefined;
  };
  /** `null` = 진행 행 숨김 (불가 상태). */
  progress: {
    valueSeconds: number;
    maxSeconds: number;
    /** 시각 텍스트 (예 *"0:04 / 0:12"*). */
    timeText: string;
    /** SR 값 문장 (예 *"0:04 of 0:12"*). */
    valueText: string;
    /** progressbar 접근성 이름. */
    label: string;
  } | null;
  /** 보이는 보조 문구 (불가 · 오류). live region 안에 있다. */
  message: { text: string; tone: HighlightClipRowMessageTone } | null;
  /** SR 전용 재생 상태 알림 (예 *"Playing."*). 보이는 문구가 있으면 그쪽이 우선이다. */
  announcement: string;
}

export function HighlightClipRow({
  label,
  sessionDateText,
  button,
  progress,
  message,
  announcement,
}: HighlightClipRowProps) {
  return (
    <li className="haru-clip-row">
      <span className="haru-clip-row__button">
        <IconButton
          icon={<Icon name={button.icon} size="md" decorative />}
          label={button.label}
          variant="glass"
          loading={button.loading}
          aria-disabled={button.unavailable ? true : undefined}
          {...(button.unavailable || button.onPress === undefined
            ? {}
            : { onPress: button.onPress })}
        />
      </span>
      <div className="haru-clip-row__body">
        <Text as="p" variant="subheadline" weight="semibold" tone="primary">
          {label}
        </Text>
        <Text as="p" variant="caption-1" tone="secondary">
          {sessionDateText}
        </Text>
        {progress === null ? null : (
          <div className="haru-clip-row__progress">
            <ProgressBar
              value={progress.valueSeconds}
              max={progress.maxSeconds}
              size="sm"
              label={progress.label}
              valueText={progress.valueText}
            />
            <span className="haru-clip-row__time" aria-hidden="true">
              <Text as="span" variant="caption-2" tone="secondary" numeric>
                {progress.timeText}
              </Text>
            </span>
          </div>
        )}
        {/*
          live region 노드는 상태와 무관하게 **같은 `<p>`** 다 (class 만 바뀐다) — 노드가 갈아 끼워지면 알림이 빠진다.
          보이는 문구가 없을 때는 `haru-visually-hidden`(absolute)이라 column gap 을 만들지 않는다.
        */}
        <p
          className={
            message === null
              ? 'haru-clip-row__message haru-visually-hidden'
              : 'haru-clip-row__message'
          }
          aria-live="polite"
        >
          {message === null ? (
            announcement
          ) : (
            <Text
              as="span"
              variant="caption-1"
              tone={message.tone === 'error' ? 'inherit' : 'secondary'}
            >
              <span
                className={
                  message.tone === 'error' ? 'haru-clip-row__message-text--error' : undefined
                }
              >
                {message.text}
              </span>
            </Text>
          )}
        </p>
      </div>
    </li>
  );
}
