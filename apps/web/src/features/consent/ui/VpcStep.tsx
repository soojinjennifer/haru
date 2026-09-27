/**
 * VPC(보호자 확인) 단계 — Design Spec §2.7 (`C13-03`, **내용 없는 슬롯**).
 *
 * 실제 확인 방식은 법무 **L-01** 미결이다. 그래서 이 화면은 "문구와 검증 수단이 나중에
 * 교체될 수 있는 슬롯" 으로 만든다. 지금 고정하는 것은 세 가지뿐이다.
 *   ① route 가 존재한다 (`/auth/verify-parent`)
 *   ② `Me.parentVerification.status` 4값이 화면 상태를 결정한다
 *   ③ `pending` · `failed` 동안 **온보딩 진입이 막힌다** (Route Guard — AC-2-17)
 *
 * 검증 endpoint·payload 는 contracts 에 **없다**. 실제 확인 요청·결과 기록은
 * `BACKEND_INTEGRATION_PENDING` (P2-BIP-05) 이다. 그래서 "Continue" 는 요청을 보내지 않고
 * 다음 경로로 넘기며, 실제로 통과할지는 Guard 가 `me` 로 판정한다.
 *
 * **이 화면에서는 아동 데이터를 입력받지 않는다.**
 */
import { Button, Icon, InlineAlert, Spinner, Surface, Text } from '@haru/ui';
import type { ParentVerificationStatus } from '@haru/contracts';

import { consentCopy } from '../copy';

export interface VpcStepProps {
  status: ParentVerificationStatus;
  /** 안내 상태에서 다음으로 넘어간다. 이동 자체는 호출자(page)가 한다. */
  onContinue: () => void;
  /** `failed` 에서 다시 시도한다 — 현재는 `me` 재조회다. */
  onRetry: () => void;
  /** 재조회가 진행 중인가. */
  retrying?: boolean;
}

export function VpcStep({ status, onContinue, onRetry, retrying = false }: VpcStepProps) {
  const copy = consentCopy.verifyParent;

  return (
    <div className="flex flex-1 flex-col gap-5 pt-5">
      <Surface fill="strong" radius="card" padding="6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="haru-vpc-badge" aria-hidden="true">
            <Icon name="shield-check" size="lg" decorative />
          </span>
          <Text as="h2" variant="headline" tone="primary" align="center">
            {copy.cardTitle}
          </Text>
          {/* 교체 지점 — 방식이 정해지면 이 한 문장만 바뀐다 (L-01). */}
          <Text variant="subheadline" tone="secondary" align="center">
            {copy.bodySlot}
          </Text>

          {status === 'pending' ? (
            <div className="flex flex-col items-center gap-2 pt-2">
              {/* Spinner 가 `role="status" aria-live="polite"` 로 진행을 알린다 (§4.9). */}
              <Spinner size="md" label={copy.pending} />
            </div>
          ) : null}
        </div>

        {/* 실패 안내는 가운데 정렬 블록 **밖**에 둔다 — 알림 문구는 왼쪽 정렬로 읽는다. */}
        {status === 'failed' ? (
          <div className="pt-4">
            <InlineAlert
              tone="error"
              placement="inline"
              title={copy.failedTitle}
              description={copy.failedDescription}
            />
          </div>
        ) : null}
      </Surface>

      <div className="mt-auto flex flex-col pt-10">
        {status === 'failed' ? (
          <Button variant="accent" size="lg" fullWidth loading={retrying} onPress={onRetry}>
            {copy.tryAgain}
          </Button>
        ) : (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            loading={status === 'pending'}
            onPress={onContinue}
          >
            {copy.continue}
          </Button>
        )}
      </div>
    </div>
  );
}
