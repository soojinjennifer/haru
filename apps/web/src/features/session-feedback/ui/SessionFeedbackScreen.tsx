/**
 * 피드백 · 분석 상태 화면 — Figma 없음 (`C13-S5-1` design-agent 명세, Stage 5 Spec §2.3 · `D5-2` · `D5-4`).
 *
 * 완료 화면(`29:62` 상단)의 **골격·토큰을 그대로** 쓴다 — 새 시각 언어 0:
 *
 * ```
 * close bar   — 완료 화면과 같은 IconButton(glass · haru:session-close · 38) → 홈 replace
 * h1          — 완료 화면 제목과 같은 타이포 · 위치 (--session-complete-title-offset)
 * medallion   — 링 150 / 아바타 136. 스티커는 없다 — 완료 화면과 메달리온 y 가 같도록 스티커 자리 높이만 둔다
 *               (Spec §11 "완료 화면 상단과 골격 좌표 동일(제목·메달리온)")
 * state slot  — AnalysisStatusView (aria-live polite 1개)
 * ```
 *
 * **deep link 전용** (`N5-10` ⓐ) — 앱 안 진입점이 없다. 이전 화면이 없을 수 있어 back 대신 닫기 = 홈 replace
 * (Spec §2.3 Layout). 닫기 줄은 Toast inset 으로 등록한다 (완료 화면 `CompleteCloseBar` 와 같다 — `D4-89`).
 */
import { Icon, IconButton, Text, useToastTopBarInset } from '@haru/ui';
import { useRef } from 'react';
import { useNavigate } from 'react-router';

import { CharacterMedallion } from '../../../entities/character';
import { ROUTES } from '../../../shared/config/routes';
import { sessionFeedbackCopy as copy } from '../copy';
import { useAnalysisDisplay } from '../model/useAnalysisDisplay';

import { AnalysisStatusView } from './AnalysisStatusView';

export interface SessionFeedbackScreenProps {
  sessionId: string;
}

function FeedbackCloseBar() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useToastTopBarInset(ref);

  return (
    <div ref={ref} className="haru-session-feedback__close">
      <IconButton
        icon={<Icon name="haru:session-close" size="md" decorative />}
        label={copy.close}
        variant="glass"
        onPress={() => {
          void navigate(ROUTES.home, { replace: true });
        }}
      />
    </div>
  );
}

export function SessionFeedbackScreen({ sessionId }: SessionFeedbackScreenProps) {
  const { display, retry } = useAnalysisDisplay(sessionId);

  return (
    <div className="haru-session-feedback">
      <FeedbackCloseBar />
      <Text as="h1" variant="subheadline" weight="semibold" tone="primary" align="center">
        {copy.title}
      </Text>
      <div className="haru-session-feedback__medallion">
        <span className="haru-session-feedback__ring" aria-hidden="true" />
        <CharacterMedallion asset="headphones" size="sm" />
      </div>
      <AnalysisStatusView display={display} onRetry={retry} />
    </div>
  );
}
