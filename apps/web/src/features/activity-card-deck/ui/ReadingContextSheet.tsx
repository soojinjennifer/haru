/**
 * `ReadingContextSheet` — Activity Card 경로의 "언제 읽을지" 선택 (Stage 3 Design Spec §2.4 `C13-15`,
 * 이월 `AC-3-22`~`26` → Stage 4 `S4-F1` · AC-4-86 · `D4-35`).
 *
 * ```
 * Sheet (bottom, title "When will you read?")
 * ├ RadioGroup variant=card   ReadingContext 6값 (라벨 CONFIRMED)
 * ├ (custom_time 일 때만) SelectTrigger "Time" → 같은 시트 안 목록 뷰 (중첩 금지 — scrim 2겹 방지)
 * │     30분 단위 48항목 `00:00`–`23:30`, 표시·값 모두 `HH:mm` · 네이티브 `<input type="time">` 금지
 * └ footer: Button accent fullWidth "Continue" — 미선택이면 `aria-disabled` (`D-9` 카드 경로 = 필수)
 * ```
 *
 * - 두 `RadioGroup` legend 는 시트 제목과 같은 문장이라 **화면에서만** 숨긴다 (`D4-63` — 이 시트만).
 *   시간 뷰 `Back` 은 헤더 왼쪽 `leading` 이다 (`D4-64`).
 * - 선택 즉시 닫지 않는다 — 확인 버튼으로 진행 (오조작 복구, Stage 4 Spec §7.5).
 * - 전송 중 = Button `loading` · 실패 = 시트 유지 + `InlineAlert tone=error` + **선택 보존**.
 * - ⭐ `S4-H4` — 실패 안내 문구는 **오류 종류별**로 받는다(`failure` — 일반 실패 = 제목만, 열린 세션 · 온보딩 어긋남 =
 *   기존 error copy 제목 + 설명, NB-18). 안내가 **나타날 때 한 번** 시트 내용을 그 안내가 보이도록 스크롤한다
 *   (`D4-146` Q2 ⓑ — 320×568 에서 footer 아래에 남던 줄). 사용자가 스크롤하는 동안 따라가지 않는다.
 * - 문구는 feature copy 모듈에서 온다. 코드 키(`after_pickup` …)를 화면에 노출하지 않는다.
 */
import { Button, Icon, IconButton, InlineAlert, RadioGroup, SelectTrigger, Sheet } from '@haru/ui';
import { useEffect, useRef, useState } from 'react';
import { ReadingContextSchema, type ReadingContext } from '@haru/contracts';

import { activityDeckCopy } from '../copy';

/** 30분 단위 48항목 — `00:00` … `23:30` (stage-3-approvals §9.2 ⑩ CONFIRMED). */
export const READING_TIME_OPTIONS: readonly string[] = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minute = index % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

export interface ReadingContextChoice {
  readingContext: ReadingContext;
  customTime?: string;
}

export interface ReadingContextSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (choice: ReadingContextChoice) => void;
  submitting: boolean;
  /** 마지막 시도의 실패 안내 — `null` 이면 실패 아님 (선택은 그대로다). */
  failure: ReadingContextFailure | null;
}

/** 시트 안 실패 안내 문구 — feature copy · 공통 error copy 에서 온다 (컴포넌트 안에 문구를 쓰지 않는다). */
export interface ReadingContextFailure {
  title: string;
  description?: string | undefined;
}

export function ReadingContextSheet({
  open,
  onClose,
  onConfirm,
  submitting,
  failure,
}: ReadingContextSheetProps) {
  const copy = activityDeckCopy.readingContext;
  const [context, setContext] = useState<ReadingContext | null>(null);
  const [customTime, setCustomTime] = useState<string | null>(null);
  const [view, setView] = useState<'choices' | 'time'>('choices');
  const failureRef = useRef<HTMLDivElement>(null);
  const failureShown = failure !== null && view === 'choices';

  // 안내가 나타나는 순간 1회 — 보이는 만큼만 움직인다(`nearest`). jsdom 에는 `scrollIntoView` 가 없다.
  useEffect(() => {
    if (!failureShown) return;
    failureRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [failureShown]);

  const complete = context !== null && (context !== 'custom_time' || customTime !== null);

  const confirm = () => {
    if (!complete || submitting) return;
    onConfirm(
      context === 'custom_time' && customTime !== null
        ? { readingContext: context, customTime }
        : { readingContext: context },
    );
  };

  const close = () => {
    setView('choices');
    onClose();
  };

  if (view === 'time') {
    return (
      <Sheet
        open={open}
        onClose={close}
        title={copy.timeLabel}
        // `Back` = 헤더 왼쪽 (`D4-64`, 4b Spec §16.7)
        leading={
          <IconButton
            icon={<Icon name="chevron-left" size="md" decorative />}
            label={copy.back}
            variant="plain"
            onPress={() => {
              setView('choices');
            }}
          />
        }
      >
        <RadioGroup
          legend={copy.timeLabel}
          legendVisuallyHidden
          name="reading-time"
          variant="list"
          options={READING_TIME_OPTIONS.map((time) => ({ value: time, label: time }))}
          value={customTime}
          onChange={(value) => {
            setCustomTime(value);
            setView('choices');
          }}
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={copy.title}
      footer={
        <Button
          variant="accent"
          fullWidth
          loading={submitting}
          {...(complete ? {} : { 'aria-disabled': true })}
          onPress={confirm}
        >
          {copy.confirm}
        </Button>
      }
    >
      <div className="haru-reading-context">
        <RadioGroup
          legend={copy.legend}
          legendVisuallyHidden
          name="reading-context"
          variant="card"
          options={ReadingContextSchema.options.map((value) => ({
            value,
            label: copy.options[value],
          }))}
          value={context}
          onChange={(value) => {
            const parsed = ReadingContextSchema.safeParse(value);
            if (parsed.success) setContext(parsed.data);
          }}
        />
        {context === 'custom_time' ? (
          <SelectTrigger
            label={copy.timeLabel}
            placeholder={copy.timePlaceholder}
            value={customTime}
            options={READING_TIME_OPTIONS.map((time) => ({ value: time, label: time }))}
            onChange={setCustomTime}
            onOpen={() => {
              setView('time');
            }}
            required
          />
        ) : null}
        {failure === null ? null : (
          // 스크롤 기준점만 잡는 무스타일 래퍼 — flex 항목 1개는 그대로다 (`InlineAlert` 는 ref 를 받지 않는다)
          <div ref={failureRef}>
            <InlineAlert
              tone="error"
              title={failure.title}
              {...(failure.description === undefined ? {} : { description: failure.description })}
            />
          </div>
        )}
      </div>
    </Sheet>
  );
}
