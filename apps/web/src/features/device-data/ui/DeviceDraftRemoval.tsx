/**
 * `DeviceDraftRemoval` — 미가입(Trial) 기기 draft 삭제 진입 (Stage 8 `C13-S8-7` · `QA-2R-004`, Spec §2.7 · §6.2 · §10.5, `Q8-12` ⓓ).
 *
 * ```
 * (Trial 안내 InlineAlert — C13-11, onboarding-survey 가 그린다)
 * TextLink "Remove my answers from this device"          ← 이 컴포넌트 (draft 있을 때만)
 *   → ConfirmDialog destructive (초기 포커스 = Keep)
 *   → onRemove() = OnboardingDraftStore.clear (서버 요청 0 — 서버에 데이터가 없다, C-12)
 *   → /onboarding (replace, 빈 상태) → Toast neutral "Removed from this device." 1회
 * ```
 *
 * - Trial 안내와의 조합은 page 가 한다 (feature 간 import 금지 — Spec §3 분류). 이 컴포넌트는 draft 저장소를 모른다:
 *   존재 여부 · 아이 이름 · 지우는 함수를 받는다.
 * - 노출 조건(draft 있음 + 미인증 + 안내가 열려 있음)은 호출자가 정한다 — 안내를 닫으면 함께 숨는다 (안내와 한 묶음).
 * - 포커스: 취소 = 트리거(Dialog 기존) · 삭제 후 = 이동한 페이지 h1 (기존 route 포커스 관리, Spec §6.2).
 */
import { ConfirmDialog, TextLink, useToast } from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '../../../shared/config/routes';
import { deviceDataCopy as copy } from '../copy';

export interface DeviceDraftRemovalProps {
  /** 이 기기에 지울 응답이 있는가. 없으면 렌더 0. */
  hasDraft: boolean;
  /** draft 의 아이 이름 (first name). 없으면 *your child*. */
  childFirstName?: string | undefined;
  /** 이 기기의 draft 를 지운다 (서버 요청 0). */
  onRemove: () => void;
}

export function DeviceDraftRemoval({
  hasDraft,
  childFirstName,
  onRemove,
}: DeviceDraftRemovalProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  if (!hasDraft && !confirming) return null;

  return (
    <>
      {hasDraft ? (
        <TextLink
          tone="standalone"
          hasPopup="dialog"
          onPress={() => {
            setConfirming(true);
          }}
        >
          {copy.link}
        </TextLink>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title={copy.dialog.title}
        description={copy.dialog.description(childFirstName)}
        confirmLabel={copy.dialog.confirmLabel}
        cancelLabel={copy.dialog.cancelLabel}
        destructive
        onConfirm={() => {
          setConfirming(false);
          onRemove();
          void navigate(ROUTES.onboarding.intro, { replace: true });
          toast.show({ tone: 'neutral', message: copy.removedToast });
        }}
        onCancel={() => {
          setConfirming(false);
        }}
      />
    </>
  );
}
