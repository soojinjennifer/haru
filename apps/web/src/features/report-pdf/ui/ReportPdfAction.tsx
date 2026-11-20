/**
 * `ReportPdfAction` — 4주 리포트 PDF (Stage 7 Spec §2.6 `C13-S7-4`, `S7-F`, FR-17). Figma 는 `110:854` idle 버튼만 —
 * 나머지 상태는 design-agent 명세(`D7-3`, 가값 `P-39`).
 *
 * | 상태 | 표시 |
 * |---|---|
 * | idle | `Button accent md fullWidth` *Download PDF* + `arrow-down-to-line` (`110:854` · `N7-33` → `AD7-9`) |
 * | requesting · generating | 같은 버튼 `loading` + caption-2 secondary center *Preparing your PDF…* (`role="status"`) |
 * | ready (공유 가능) | `ButtonGroup` — primary *Save PDF* (accent) · secondary *Share* (glass) |
 * | ready (공유 불가) | *Save PDF* 1개 fullWidth (`share-unsupported`) |
 * | ready + 공유 거절 | ready 유지 + caption-2 secondary *Sharing isn't available here…* |
 *
 * 상태 문구 2종 = `secondary` — C-13 화면의 정보성 보조 텍스트 (`VG7-F-05` ⓑ · `D7-6` ④).
 * | failed · timeout · offline | `InlineAlert` + `Button glass md fullWidth` *Try again* |
 *
 * - **카드(`110:835`) · 상세 ⑦ 공통 1 컴포넌트** — 기록 = `reportKeys.pdf(reportId)` (`N7-24`). Page 가 slot 으로 꽂는다.
 * - 저장 · 공유는 **버튼 탭 핸들러 안에서만** — ready 도달 시 자동 저장 0 (`N7-40` · AC-7-56).
 * - live region 1개(`role="status"`)를 늘 두고 내용만 바꾼다 — *Preparing…*(보임) → *Your PDF is ready.*(SR 전용) 1회 알림.
 *   `InlineAlert` 는 자기 role 을 가지므로 이 영역 밖에 둔다 (중첩 live region 0).
 * - 포커스: 단계가 바뀌며 누른 버튼이 사라지면(loading → Save · 실패 → Try again) 포커스가 body 로 떨어진다 →
 *   포커스가 이 영역 안에 있었을 때만 새 첫 버튼으로 옮긴다 (H7-6 판단).
 */
import { Button, ButtonGroup, Icon, InlineAlert, Text } from '@haru/ui';
import { useEffect, useRef } from 'react';

import { createSystemClock } from '../../../shared/lib/clock';
import { reportPdfCopy as copy } from '../copy';
import { isReportPdfBusy, type ReportPdfJob } from '../model/reportPdfState';
import { useReportPdf } from '../model/useReportPdf';

const systemClock = createSystemClock();
const systemNow = () => systemClock.now();

export interface ReportPdfActionProps {
  /** 발행 리포트 id (카드 = `latestReport.id`, 상세 = 그 리포트 — AC-7-76). */
  reportId: string;
  /** 기준 시각 — 기본 = 시스템 시계. 테스트가 주입한다. */
  now?: (() => number) | undefined;
}

const DOWNLOAD_ICON = <Icon name="arrow-down-to-line" decorative />;

function alertFor(job: ReportPdfJob) {
  switch (job.phase) {
    case 'failed':
      return { tone: 'error', ...copy.failed } as const;
    case 'timeout':
      return { tone: 'info', ...copy.timeout } as const;
    case 'offline':
      return { tone: 'offline', ...copy.offline } as const;
    default:
      return null;
  }
}

export function ReportPdfAction({ reportId, now = systemNow }: ReportPdfActionProps) {
  const { job, canShare, shareRejected, start, save, share } = useReportPdf(reportId, { now });
  const busy = isReportPdfBusy(job);
  const alert = alertFor(job);

  const rootRef = useRef<HTMLDivElement>(null);
  const focusWithin = useRef(false);
  useEffect(() => {
    const root = rootRef.current;
    if (root === null || !focusWithin.current) return;
    const active = root.ownerDocument.activeElement;
    if (active !== null && active !== root.ownerDocument.body && root.contains(active)) return;
    root.querySelector<HTMLButtonElement>('button')?.focus();
  }, [job.phase]);

  let actions;
  if (job.phase === 'ready') {
    const saveButton = (
      <Button variant="accent" size="md" fullWidth leadingIcon={DOWNLOAD_ICON} onPress={save}>
        {copy.save}
      </Button>
    );
    actions = canShare ? (
      <ButtonGroup
        primary={saveButton}
        secondary={
          <Button
            variant="glass"
            size="md"
            fullWidth
            leadingIcon={<Icon name="share" decorative />}
            onPress={share}
          >
            {copy.share}
          </Button>
        }
      />
    ) : (
      saveButton
    );
  } else if (alert !== null) {
    actions = (
      <>
        <InlineAlert tone={alert.tone} title={alert.title} description={alert.description} />
        <Button variant="glass" size="md" fullWidth onPress={start}>
          {copy.retry}
        </Button>
      </>
    );
  } else {
    actions = (
      <Button
        variant="accent"
        size="md"
        fullWidth
        leadingIcon={DOWNLOAD_ICON}
        loading={busy}
        onPress={start}
      >
        {copy.download}
      </Button>
    );
  }

  return (
    <div
      ref={rootRef}
      className="haru-report-pdf"
      data-state={job.phase}
      onFocus={() => {
        focusWithin.current = true;
      }}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && !event.currentTarget.contains(next)) {
          focusWithin.current = false;
        }
      }}
    >
      <div className="haru-report-pdf__actions">{actions}</div>
      <div className="haru-report-pdf__status" role="status">
        {busy ? (
          <Text as="p" variant="caption-2" tone="secondary" align="center">
            {copy.preparing}
          </Text>
        ) : null}
        {job.phase === 'ready' ? <span className="haru-visually-hidden">{copy.ready}</span> : null}
        {job.phase === 'ready' && shareRejected ? (
          <Text as="p" variant="caption-2" tone="secondary" align="center">
            {copy.shareUnavailable}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
