import { ConfirmDialog, InlineAlert, ListGroup, ListRow } from '@haru/ui';
import { useState } from 'react';

import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { settingsCopy } from '../copy';
import { useSignOut } from '../model/useSignOut';

export interface SettingsMenuProps {
  /** 테스트 주입 지점 — 주지 않으면 `localStorage` draft 저장소를 쓴다. */
  draftStore?: OnboardingDraftStore | undefined;
}

/**
 * SettingsMenu — Design Spec §2.14 (`C13-12`), 결정 **D-7**.
 *
 * Stage 2 의 목록은 **로그아웃 1행**이다. `ListGroup` 은 1행이어도 카드 형태를 유지하므로
 * Stage 3·6·8 에서 행만 추가된다 (`C-16`).
 *
 * 로그아웃은 **되돌릴 수 없는 로컬 삭제**(이 기기의 온보딩 응답 — 결정 `D-3` 삭제 시점 ②)를
 * 동반하므로 오탭 한 번으로 실행되지 않게 `ConfirmDialog` destructive 를 거친다.
 * 행 라벨을 빨간색으로만 구분하지 않는다 — 경고는 Dialog 가 전달한다 (WCAG 1.4.1).
 *
 * 성공 후 이동은 하지 않는다. 세션이 사라지면 Route Guard 가 `/auth/welcome` 으로 보낸다.
 */
export function SettingsMenu({ draftStore }: SettingsMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const signOut = useSignOut({ draftStore });

  return (
    <div className="flex flex-col gap-4 py-6">
      {signOut.isError ? (
        <InlineAlert
          tone="error"
          title={settingsCopy.logOut.errorTitle}
          description={settingsCopy.logOut.errorDescription}
        />
      ) : null}

      <ListGroup label={settingsCopy.menuLabel}>
        <ListRow
          title={settingsCopy.logOut.rowLabel}
          onPress={() => {
            setConfirmOpen(true);
          }}
        />
      </ListGroup>

      <ConfirmDialog
        open={confirmOpen}
        title={settingsCopy.logOut.confirmTitle}
        description={settingsCopy.logOut.confirmDescription}
        confirmLabel={settingsCopy.logOut.confirmLabel}
        cancelLabel={settingsCopy.logOut.cancelLabel}
        destructive
        confirming={signOut.isPending}
        onConfirm={() => {
          signOut.mutate(undefined, {
            // 실패해도 로컬 정리는 끝났다 — Dialog 를 닫고 목록 위 안내로 알린다.
            onSettled: () => {
              setConfirmOpen(false);
            },
          });
        }}
        onCancel={() => {
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
