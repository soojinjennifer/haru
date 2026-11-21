/**
 * `DeletionStatusAlert` — 전체 삭제 · 탈퇴 요청의 상태 표면 (Spec §2.5 `C13-S8-5` — `InlineAlert` 상태 매핑, 신규 컴포넌트 0).
 *
 * | surface | InlineAlert | role |
 * |---|---|---|
 * | `progress` (`received` · `processing` · `DELETION_ALREADY_REQUESTED`) | `info` · *We're deleting your data* · action 0 | `status` |
 * | `failed` | `error` · *We couldn't finish deleting your data* · *Try again* | `alert` |
 * | `none` · `completed` | 렌더 0 (`completed` 는 이 화면에 머물지 않는다) | — |
 *
 * 탈퇴 요청(`scope='account'`, Spec §2.5 `VG8-C-12`): 진행 = *We're deleting your account* · 실패 = *We couldn't finish deleting
 * your account* + **action 0** (*Try again* 이 전체 삭제 Dialog ② 를 열면 범위가 바뀐다 — 다시 할 곳은 문장이 안내).
 *
 * - 진행률 · 스피너 · 퍼센트 0 (`Q8-08` ⓐ). 위치 = 화면 최상단(`P-41`), 상태가 바뀌면 이 자리에서 내용만 바뀐다.
 * - live: `InlineAlert` 기본(`announce="auto"`) — `received → processing` 은 문구가 같아 DOM 이 바뀌지 않는다 → 폴링마다
 *   재낭독 0 (Spec §9.1).
 * - `focusTarget`: 요청 성공 직후 포커스를 받을 바깥 노드(ref) — Spec §6.2 "전체 삭제 요청 성공 → 상태 알림(`tabIndex=-1`)".
 *   `InlineAlert` 는 ref 를 받지 않으므로 이 컴포넌트가 감싼다 (Shared UI 변경 0). 감싸는 `div` 는 레이아웃에 영향이 없다(block).
 */
import type { DeletionScope } from '@haru/contracts';
import { InlineAlert } from '@haru/ui';
import type { Ref } from 'react';

import { dataManagementCopy } from '../copy';
import type { DeletionSurface } from '../model/deletionSurface';

export interface DeletionStatusAlertProps {
  surface: DeletionSurface;
  /** 추적 중인 요청의 범위. 모르면(`DELETION_ALREADY_REQUESTED` 만 받은 경우) 전체 삭제 문구. */
  scope?: DeletionScope | undefined;
  /** `scope='account'` 진행 문구의 아이 이름 (first name). */
  childFirstName?: string | undefined;
  /** `failed` 의 *Try again* — ConfirmDialog ② 재진입. `scope='account'` 이면 쓰지 않는다. */
  onTryAgain?: (() => void) | undefined;
  focusTarget?: Ref<HTMLDivElement> | undefined;
}

export function DeletionStatusAlert({
  surface,
  scope,
  childFirstName,
  onTryAgain,
  focusTarget,
}: DeletionStatusAlertProps) {
  const account = scope === 'account';
  if (surface === 'progress' && account) {
    return (
      <div ref={focusTarget}>
        <InlineAlert
          tone="info"
          title={dataManagementCopy.accountProgress.title}
          description={dataManagementCopy.accountProgress.description(childFirstName)}
        />
      </div>
    );
  }
  if (surface === 'failed' && account) {
    return (
      <div ref={focusTarget}>
        <InlineAlert
          tone="error"
          title={dataManagementCopy.accountFailed.title}
          description={dataManagementCopy.accountFailed.description}
        />
      </div>
    );
  }
  if (surface === 'progress') {
    return (
      <div ref={focusTarget}>
        <InlineAlert
          tone="info"
          title={dataManagementCopy.progress.title}
          description={dataManagementCopy.progress.description}
        />
      </div>
    );
  }
  if (surface === 'failed') {
    return (
      <div ref={focusTarget}>
        <InlineAlert
          tone="error"
          title={dataManagementCopy.failed.title}
          description={dataManagementCopy.failed.description}
          {...(onTryAgain === undefined
            ? {}
            : { action: { label: dataManagementCopy.failed.action, onPress: onTryAgain } })}
        />
      </div>
    );
  }
  return null;
}
