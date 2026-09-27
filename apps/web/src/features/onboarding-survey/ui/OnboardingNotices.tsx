/**
 * Trial 안내 · draft 폐기 안내 — Design Spec §2.12 (`C13-11`).
 *
 * - 오류가 아니므로 `InlineAlert tone="info"` + 닫을 수 있게 둔다 (세션 내 1회).
 * - **Trial 구간에 "저장 중"·"동기화" 류 표시를 두지 않는다** — 실제로 아무 요청도 나가지
 *   않기 때문이다 (AC-2-27).
 * - draft 폐기 문구는 사용자 책임을 묻지 않는다.
 */
import { InlineAlert } from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '../../../shared/config/routes';
import type { OnboardingDraftDiscardReason } from '../../../shared/lib/onboarding-draft';
import { onboardingCopy } from '../copy';

export interface TrialNoticeProps {
  /** 미인증 체험 구간인가. */
  isTrial: boolean;
}

export function TrialNotice({ isTrial }: TrialNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const copy = onboardingCopy.notices;

  if (!isTrial || dismissed) return null;

  return (
    <InlineAlert
      tone="info"
      title={copy.trialTitle}
      description={copy.trialDescription}
      action={{
        label: copy.trialAction,
        onPress: () => {
          void navigate(ROUTES.auth.signUp);
        },
      }}
      onDismiss={() => {
        setDismissed(true);
      }}
      dismissLabel={copy.dismiss}
    />
  );
}

export interface DraftDiscardNoticeProps {
  reason: OnboardingDraftDiscardReason | null;
  onDismiss: () => void;
}

export function DraftDiscardNotice({ reason, onDismiss }: DraftDiscardNoticeProps) {
  const copy = onboardingCopy.notices;

  if (reason === null) return null;

  return (
    <InlineAlert
      tone="info"
      title={reason === 'expired' ? copy.expired : copy.unreadable}
      onDismiss={onDismiss}
      dismissLabel={copy.dismiss}
    />
  );
}
