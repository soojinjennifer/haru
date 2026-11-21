/**
 * Trial 안내 · draft 폐기 안내 — Design Spec §2.12 (`C13-11`).
 *
 * - 오류가 아니므로 `InlineAlert tone="info"` + 닫을 수 있게 둔다 (세션 내 1회).
 * - **Trial 구간에 "저장 중"·"동기화" 류 표시를 두지 않는다** — 실제로 아무 요청도 나가지
 *   않기 때문이다 (AC-2-27).
 * - draft 폐기 문구는 사용자 책임을 묻지 않는다.
 * - `footer` (Stage 8 `C13-S8-7`, Spec §2.7 · `Q8-12` ⓓ): 안내 **바로 아래** 슬롯 — page 가 기기 draft 삭제 TextLink 를 넣는다
 *   (feature 간 import 금지라 조합은 page). 안내와 한 묶음이라 안내를 닫으면 함께 숨는다.
 */
import { InlineAlert } from '@haru/ui';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '../../../shared/config/routes';
import type { OnboardingDraftDiscardReason } from '../../../shared/lib/onboarding-draft';
import { onboardingCopy } from '../copy';

export interface TrialNoticeProps {
  /** 미인증 체험 구간인가. */
  isTrial: boolean;
  /** 안내 바로 아래 슬롯 (`null` 이면 없음). */
  footer?: ReactNode;
}

/**
 * Trial 안내 아래 슬롯에 넘기는 이 기기 draft 정보 (Stage 8 `C13-S8-7`). 저장소는 이 feature 가 소유하므로 지우는 함수도 함께 준다.
 */
export interface TrialDraftInfo {
  /** 이 기기 draft 에 응답이 하나라도 있는가. */
  hasAnswers: boolean;
  /** draft 의 아이 이름 (first name). */
  childFirstName: string | undefined;
  /** 이 기기 draft 를 지운다 (서버 요청 0). */
  clear: () => void;
}

/** Trial 안내 아래 슬롯 render prop — page 가 조합한다. */
export type TrialNoticeFooter = (draft: TrialDraftInfo) => ReactNode;

export function TrialNotice({ isTrial, footer }: TrialNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const copy = onboardingCopy.notices;

  if (!isTrial || dismissed) return null;

  return (
    <div className="haru-trial-notice">
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
      {footer === null || footer === undefined ? null : (
        <div className="haru-trial-notice__footer">{footer}</div>
      )}
    </div>
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
