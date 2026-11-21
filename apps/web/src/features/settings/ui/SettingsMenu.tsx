import { ConfirmDialog, Icon, InlineAlert, ListGroup, ListRow, Text } from '@haru/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { settingsCopy } from '../copy';
import { ACCOUNT_SETTINGS_ROWS, CHILD_SETTINGS_ROWS, type SettingsNavRow } from '../model/menuRows';
import { useSignOut } from '../model/useSignOut';

export interface SettingsMenuProps {
  /** 테스트 주입 지점 — 주지 않으면 `localStorage` draft 저장소를 쓴다. */
  draftStore?: OnboardingDraftStore | undefined;
}

/**
 * SettingsMenu — Design Spec §2.14 (`C13-12`), 결정 **D-7** + Stage 6 `C13-S6-1` (Spec §2.4, `N6-38`).
 *
 * ```
 * SectionLabel "YOUR CHILD"  →  ListGroup "Your child"  (Profile · Child info · Update survey answers · Growth focus, chevron)
 * SectionLabel "ACCOUNT"     →  ListGroup "Account"     (Data & privacy · Account — 이동 행, chevron → Log out — 동작 행, chevron 없음)
 * ```
 *
 * Stage 8 `C13-S8-1` (Spec §2.1, `Q8-02` ⓐ): 이동 행을 먼저, 동작 행(Log out)을 끝에 둔다 — chevron 유무가 섞이는 구간을 1곳으로 모은다.
 *
 * - 행 subtitle 없음 — 목록이 데이터(`GET /profile`)에 의존하지 않는다 → Loading/Error 상태 해당 없음 (AC-6-17 N/A).
 * - SectionLabel = `ChildInfoStep` 과 같은 recipe(`caption-1 · secondary · bold · tracking section-label`, Figma `248:1159` — `D6-10` ③) — 컴포넌트를 만들지 않는다.
 * - chevron = Lucide `chevron-right` 16 `--color-fg-tertiary`, 장식 (Library 진입 행과 같은 idiom).
 * - `R-SHADOW-1`: `ListGroup` 그림자 = `--shadow-bubble`(좌우 4 · 아래 10) ≤ 거터 24 · 그룹 간격 16 → 새 overflow 0.
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
  const navigate = useNavigate();

  const renderNavRow = (row: SettingsNavRow) => (
    <ListRow
      key={row.id}
      title={row.label}
      trailing={
        <span className="haru-settings-row__chevron">
          <Icon name="chevron-right" size="sm" tone="inherit" decorative />
        </span>
      }
      onPress={() => {
        void navigate(row.to);
      }}
    />
  );

  return (
    <div className="flex flex-col gap-4 py-6">
      {signOut.isError ? (
        <InlineAlert
          tone="error"
          title={settingsCopy.logOut.errorTitle}
          description={settingsCopy.logOut.errorDescription}
        />
      ) : null}

      <section className="haru-section">
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
          {settingsCopy.groups.child.sectionLabel}
        </Text>
        <ListGroup label={settingsCopy.groups.child.listLabel}>
          {CHILD_SETTINGS_ROWS.map(renderNavRow)}
        </ListGroup>
      </section>

      <section className="haru-section">
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
          {settingsCopy.groups.account.sectionLabel}
        </Text>
        <ListGroup label={settingsCopy.groups.account.listLabel}>
          {ACCOUNT_SETTINGS_ROWS.map(renderNavRow)}
          <ListRow
            title={settingsCopy.logOut.rowLabel}
            onPress={() => {
              setConfirmOpen(true);
            }}
          />
        </ListGroup>
      </section>

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
