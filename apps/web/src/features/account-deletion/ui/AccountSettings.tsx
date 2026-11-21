/**
 * `AccountSettings` — `/settings/account` 본문 (Stage 8 `C13-S8-6`, Spec §2.6 · §2.4-③ · §2.9 · §6.2 · §10.4).
 *
 * ```
 * flex col gap-4 py-6
 * ├─ section  SectionLabel "SIGNED IN AS"
 * │   └─ ListGroup "Signed in as"
 * │        └─ ListRow title = {email}   (표시 전용 — onPress 0 · chevron 0, `C8-10`)
 * └─ section  SectionLabel "DELETE ACCOUNT"
 *     └─ 영향 안내 → [실패 · 오프라인 · 이미 요청됨] InlineAlert → ListGroup "Delete account"
 *          └─ ListRow "Delete account"  (동작 행 — chevron 0) → ConfirmDialog ③
 * ```
 *
 * - 이메일 = `Me.caregiver.email` 응답 값만 (AC-8-33). 요금제 행 0 (`N8-05` ⓐ). 이메일을 로그 · Toast 에 쓰지 않는다 (Plan §5.5).
 * - *Delete account* → ConfirmDialog ③ (destructive · 초기 포커스 = 취소) → `DELETE /v1/me` 1회 (IK).
 *   처리 중에는 Esc · scrim · 취소로 닫지 않는다 (요청은 이미 나갔다 — Spec §2.4).
 * - 성공 → `performSessionCleanup`(로컬 아동 데이터 0) + 세션 종료 → `/auth/welcome` (replace) → Toast neutral 1회
 *   (`N8-10` 탈퇴 ⓐ · `Q8-11` ⓐ). 뒤로 가기로 보호 화면에 다시 들어가면 Route Guard 가 welcome 으로 돌려보낸다 (세션 0).
 * - 진행 중 **탈퇴** 요청이 요약(`activeDeletionRequest.scope='account'` — 다른 기기 · 정리 실패 등)에 보이면 같은 자리에
 *   info 알림(*We're deleting your account* — Spec §2.5 `VG8-C-12`) + *Delete account* 행 `disabled`.
 * - 진행 중 전체 삭제가 있어도 행은 **활성** — 서버가 `DELETION_ALREADY_REQUESTED` 를 주면 InlineAlert info (`Q8-09` ⓐ).
 * - 실패 · 오프라인 → 로컬 보존 · 행 바로 위 InlineAlert(error | offline) · 다시 시도 = 행을 다시 누른다 (AC-8-36).
 *   오프라인은 요청 0 (백그라운드 재전송 0).
 * - Loading = 이메일 행 Skeleton · 조회 실패 = `ErrorState`(error | offline) + *Try again* (Spec §2.9).
 */
import {
  ConfirmDialog,
  ErrorState,
  InlineAlert,
  ListGroup,
  ListRow,
  Skeleton,
  Text,
  useToast,
} from '@haru/ui';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useDataManagementSummary } from '../../../entities/data-management';
import { useMe } from '../../../entities/me';
import { ROUTES } from '../../../shared/config/routes';
import { accountDeletionStatusCopy } from '../../../shared/copy/deletion-status-copy';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { errorName, logger } from '../../../shared/lib/logger';
import { accountDeletionCopy as copy } from '../copy';
import {
  useAccountDeletionCleanup,
  type UseAccountDeletionCleanupOptions,
} from '../model/useAccountDeletionCleanup';
import {
  useDeleteAccount,
  type DeleteAccountFailure,
  type UseDeleteAccountOptions,
} from '../model/useDeleteAccount';

export interface AccountSettingsProps {
  /** 테스트 주입 지점 — 연결 상태 (`useDeleteAccount`). */
  isOnline?: UseDeleteAccountOptions['isOnline'];
  /** 테스트 주입 지점 — 탈퇴 후 로컬 정리 저장소 (`useAccountDeletionCleanup`). */
  cleanup?: UseAccountDeletionCleanupOptions | undefined;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
      {children}
    </Text>
  );
}

function AccountSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 py-6"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
    >
      <div className="haru-section">
        <SectionLabel>{copy.signedIn.sectionLabel}</SectionLabel>
        <ListGroup>
          <ListRow title={<Skeleton shape="text" lines={1} />} />
        </ListGroup>
      </div>
    </div>
  );
}

function failureAlert(failure: DeleteAccountFailure) {
  if (failure.offline) {
    return (
      <InlineAlert
        tone="offline"
        title={networkErrorCopy.title}
        description={copy.deleteAccount.notSent}
      />
    );
  }
  if (failure.code === 'DELETION_ALREADY_REQUESTED') {
    return (
      <InlineAlert
        tone="info"
        title={copy.deleteAccount.alreadyRequested.title}
        description={copy.deleteAccount.alreadyRequested.description}
      />
    );
  }
  // 제목 = 기존 `errorCopyForCode` · 설명 = 무엇이 바뀌었는가 (Spec §10.4 `VG8-D-03`).
  return (
    <InlineAlert
      tone="error"
      title={errorCopyForCode(failure.code).title}
      description={copy.deleteAccount.notDeleted}
    />
  );
}

export function AccountSettings({ isOnline, cleanup }: AccountSettingsProps = {}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { me, isPending, isError, isOffline, errorCode, refetch } = useMe();
  const summary = useDataManagementSummary();
  const deleter = useDeleteAccount({ isOnline });
  const runCleanup = useAccountDeletionCleanup(cleanup);

  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [failure, setFailure] = useState<DeleteAccountFailure | null>(null);
  const finished = useRef(false);

  if (me === undefined && isError) {
    const message = isOffline ? networkErrorCopy : errorCopyForCode(errorCode);
    return (
      <div className="py-6">
        <ErrorState
          title={message.title}
          description={message.description}
          tone={isOffline ? 'offline' : 'error'}
          titleAs="h2"
          retryLabel={retryLabel}
          retrying={isPending}
          onRetry={refetch}
        />
      </div>
    );
  }

  // 세션 종료 직후(`me === null`)는 Guard 가 welcome 으로 보낸다 — 그 사이에도 같은 골격을 둔다.
  if (me === undefined || me === null) return <AccountSkeleton />;

  const firstName = me.child?.firstName;
  // 요약 조회 실패 · 로딩은 화면을 막지 않는다 — 진행 중 탈퇴 표시만 이 값에 의존한다.
  const accountInProgress = summary.summary?.activeDeletionRequest?.scope === 'account';

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setLeaving(true);
    runCleanup()
      .catch((error: unknown) => {
        logger.error('account_deletion_local_cleanup_failed', { errorName: errorName(error) });
      })
      .finally(() => {
        void navigate(ROUTES.auth.welcome, { replace: true });
        toast.show({ tone: 'neutral', message: copy.deletedToast });
      });
  };

  const submit = () => {
    setFailure(null);
    deleter.submit({
      onSuccess: finish,
      onError: (next) => {
        setConfirming(false);
        setFailure(next);
      },
    });
  };

  const busy = deleter.isPending || leaving;

  return (
    <div className="flex flex-col gap-4 py-6">
      <section className="haru-section">
        <SectionLabel>{copy.signedIn.sectionLabel}</SectionLabel>
        <ListGroup label={copy.signedIn.listLabel}>
          <ListRow title={me.caregiver.email} />
        </ListGroup>
      </section>

      <section className="haru-section">
        <SectionLabel>{copy.deleteAccount.sectionLabel}</SectionLabel>
        <div className="haru-account-section__body">
          <Text variant="footnote" tone="primary">
            {copy.deleteAccount.notice(firstName)}
          </Text>
          {accountInProgress ? (
            <InlineAlert
              tone="info"
              title={accountDeletionStatusCopy.progress.title}
              description={accountDeletionStatusCopy.progress.description(firstName)}
            />
          ) : failure === null ? null : (
            failureAlert(failure)
          )}
          <ListGroup label={copy.deleteAccount.listLabel}>
            <ListRow
              title={copy.deleteAccount.rowLabel}
              disabled={accountInProgress}
              onPress={() => {
                setFailure(null);
                setConfirming(true);
              }}
            />
          </ListGroup>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title={copy.dialog.title}
        description={copy.dialog.description(firstName)}
        confirmLabel={copy.dialog.confirmLabel}
        cancelLabel={copy.dialog.cancelLabel}
        destructive
        confirming={busy}
        onConfirm={submit}
        onCancel={() => {
          // 요청이 이미 나갔으면 닫지 않는다 — 취소해도 철회되지 않는다 (Spec §2.4).
          if (busy) return;
          setConfirming(false);
        }}
      />
    </div>
  );
}
