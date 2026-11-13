/**
 * `AnalysisStatusView` — 피드백 화면의 state slot (Stage 5 Spec §2.3 표, `C13-S5-1`, AC-5-35~42).
 *
 * | 표시 상태 | 렌더 |
 * |---|---|
 * | `loading` | `Spinner` (*"Loading"*) |
 * | `pending` | `InlineAlert info` |
 * | `analyzed` | 버블 = `shortFeedback.text` 그대로 · `text: null` 이면 **아무것도 그리지 않는다** (AC-5-37) |
 * | `low-quality` | `text` 있으면 버블 + 그 아래 `InlineAlert info` / 없으면 `InlineAlert` 만 |
 * | `failed` | `InlineAlert info` — 재시도 버튼 없음 (`N5-15` ⓐ) |
 * | `not-available` | `InlineAlert info` — 대화 전용(기존 `ANALYSIS_NOT_AVAILABLE` 문구) · 녹음 없음(사유 문구) |
 * | `error` · `offline` | `ErrorState` + *"Try again"* — 폭 = InlineAlert 와 같은 컨테이너 폭 (`D5-9`) |
 * | `not-found` | `ErrorState error` + *"Go home"* (재시도 없음) |
 *
 * 상태 안내는 UI copy 이므로 버블이 아니라 `InlineAlert` 다 — 캐릭터가 말하는 것처럼 보이지 않게 (Spec §2.3 원칙).
 * slot 은 `aria-live="polite"` 하나 (Spec §9.1) — 안쪽 `InlineAlert` · `ErrorState` 는 `announce="none"` 으로
 * 자체 live role 을 끈다 (중첩 live region 이중 낭독 방지, `D5-10` / `VG5C-2`). 버블 등장 모션은 **폴링으로** pending · failed → 피드백이 됐을 때만
 * 완료 화면 C-2 enter 를 재사용한다 (Spec §6) — 처음부터 결과가 있으면 정지 상태로 보인다.
 */
import { ErrorState, InlineAlert, Spinner } from '@haru/ui';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { ShortFeedbackBubble } from '../../../entities/analysis';
import { ROUTES } from '../../../shared/config/routes';
import {
  ERROR_COPY,
  errorCopyForCode,
  networkErrorCopy,
  retryLabel,
} from '../../../shared/copy/error-copy';
import { sessionFeedbackCopy as copy } from '../copy';
import type { AnalysisDisplayState } from '../model/analysisDisplayState';

export interface AnalysisStatusViewProps {
  display: AnalysisDisplayState;
  onRetry: () => void;
}

function FeedbackBubble({ text, entrance }: { text: string; entrance: boolean }) {
  return (
    <div className="haru-session-feedback__bubble" data-entrance={entrance ? 'play' : 'static'}>
      <ShortFeedbackBubble text={text} />
    </div>
  );
}

function StatusAlert({ title, description }: { title: string; description: string }) {
  return (
    <div className="haru-session-feedback__alert">
      <InlineAlert tone="info" title={title} description={description} announce="none" />
    </div>
  );
}

export function AnalysisStatusView({ display, onRetry }: AnalysisStatusViewProps) {
  const navigate = useNavigate();
  // 대기 상태를 한 번이라도 보였는가 — 버블 등장 모션 조건 (Spec §6). render 중 갱신(파생 state 패턴).
  const waiting = display.kind === 'pending' || display.kind === 'failed';
  const [sawWaiting, setSawWaiting] = useState(waiting);
  if (waiting && !sawWaiting) setSawWaiting(true);

  let content: ReactNode = null;
  switch (display.kind) {
    case 'loading':
      content = (
        <div className="haru-session-feedback__loading">
          {/* D5-12 (VG5C-3) — slot 이 live region 이므로 안쪽 role · aria-live 를 끈다. 라벨은 남는다. */}
          <Spinner size="md" label={copy.loading} announce="none" />
        </div>
      );
      break;
    case 'pending':
      content = <StatusAlert {...copy.pending} />;
      break;
    case 'analyzed':
      content =
        display.text === null ? null : <FeedbackBubble text={display.text} entrance={sawWaiting} />;
      break;
    case 'low-quality':
      content = (
        <>
          {display.text === null ? null : (
            <FeedbackBubble text={display.text} entrance={sawWaiting} />
          )}
          <StatusAlert {...copy.lowQuality} />
        </>
      );
      break;
    case 'failed':
      content = <StatusAlert {...copy.failed} />;
      break;
    case 'not-available':
      content = (
        <StatusAlert
          {...(display.reason === 'conversation'
            ? ERROR_COPY.ANALYSIS_NOT_AVAILABLE
            : copy.noRecording)}
        />
      );
      break;
    case 'offline':
      content = (
        <div className="haru-session-feedback__alert">
          <ErrorState
            announce="none"
            tone="offline"
            title={networkErrorCopy.title}
            description={networkErrorCopy.description}
            retryLabel={retryLabel}
            onRetry={onRetry}
          />
        </div>
      );
      break;
    case 'error':
    case 'not-found': {
      const message = errorCopyForCode(display.code);
      content = (
        <div className="haru-session-feedback__alert">
          <ErrorState
            announce="none"
            tone="error"
            title={message.title}
            description={message.description}
            retryLabel={display.kind === 'not-found' ? copy.goHome : retryLabel}
            onRetry={
              display.kind === 'not-found'
                ? () => {
                    void navigate(ROUTES.home, { replace: true });
                  }
                : onRetry
            }
          />
        </div>
      );
      break;
    }
  }

  return (
    <div className="haru-session-feedback__state" aria-live="polite" data-state={display.kind}>
      {content}
    </div>
  );
}
