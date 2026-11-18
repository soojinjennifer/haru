/**
 * `ChildInfoEditForm` — 아이 정보 수정 `/settings/child` (Stage 6 `C13-S6-2`, Spec §2.5 · §2.7 · §3.6 · §10.4).
 *
 * ```
 * section  SectionLabel "YOUR CHILD"  → ChildIdentityFields (firstName · lastName · 생년 + 나이 Tag · gender)
 * section  SectionLabel "AT HOME"     → ChildLanguageFields (언어 Chip 카드 — Figma `244:1314`)
 * ChildReadingRoutineField             (섹션 라벨형 legend + Answer card 행 — Figma `244:1415`, `S6-G` G-1)
 * (실패 시) InlineAlert tone="error"
 * CTA  Button accent lg "Save"  (변경 없음 → 비활성)
 * ```
 *
 * - 필드 = Step 1 의 아이 필드 전부, **`relationship` 없음** (`N6-04` → `N6-39`). 입력 묶음은 온보딩과 같은 컴포넌트
 *   (`entities/child`, `R-11`) — 처음부터 편집 모드(표시 행 ↔ 편집 전환 없음).
 * - Save = 바뀐 필드만 body (AC-6-19) · 진행 중 `loading` · 중복 탭 → 요청 1건(`useUpdateChild`).
 * - 성공 → Toast *Saved* → 뒤로(`/settings`) (`N6-40`). 캐시: 프로필 = 응답 · `me` 무효화 (`useUpdateChild`, AC-6-22).
 * - `validation-failed` → 필드별 문구 · 입력 보존 · 첫 오류 필드로 포커스 (AC-6-20).
 * - `error`·`offline` → Save 위 InlineAlert · 입력은 **메모리**에만 (AC-6-21) · 다시 Save = 재시도.
 * - 변경 후 이탈(TopBar 뒤로 · 브라우저 back) → `ConfirmDialog` destructive (`N6-14` ⓐ, AC-6-23).
 * - Loading = `Skeleton text lines=6`, Save 미렌더 (§3.6) · 초기값 조회 실패 = `ErrorState` + *Try again*.
 * - `R-SHADOW-1`: 입력 묶음은 온보딩 Step 1 과 같은 recipe(같은 `AppShell` 스크롤 뷰포트) — 새 overflow 0.
 *   조회 실패 `ErrorState`(Glass Rest)는 `e2e/shadow.spec.ts` 가 393·600 양축 프로브로 본다.
 */
import type { ChildProfile } from '@haru/contracts';
import { Button, ConfirmDialog, ErrorState, InlineAlert, Skeleton, Text, useToast } from '@haru/ui';
import { useEffect, useRef, useState } from 'react';

import {
  ChildIdentityFields,
  ChildLanguageFields,
  ChildReadingRoutineField,
} from '../../../entities/child';
import {
  useCurrentChildProfile,
  useUpdateChild,
  type CurrentChildProfileState,
} from '../../../entities/child-profile';
import { childCopy } from '../../../shared/copy/child-copy';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { validateChildInfo, type ChildInfoFormState } from '../../../shared/lib/child-info';
import { clockDate, createSystemClock, type Clock } from '../../../shared/lib/clock';
import { childInfoEditCopy as copy } from '../copy';
import { useRegisterChildInfoEditBack } from '../model/backRequest';
import {
  buildUpdateChildBody,
  childInfoFormFromChild,
  serverFieldErrors,
} from '../model/childInfoEdit';
import { useLeaveGuard } from '../model/useLeaveGuard';

export interface ChildInfoEditFormProps {
  /** 기기 시각 — 생년 선택지·나이 Tag (D-10). 테스트는 고정 clock 을 넣는다. */
  clock?: Clock | undefined;
}

function EditSkeleton() {
  return (
    /*
      Spec §3.6 "text lines=6" — `Skeleton` 의 `lines` 상한이 5 라 섹션 2개 × 3줄로 그린다 (Shared UI 변경 0).
    */
    <div
      className="flex flex-col gap-5"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-state="loading"
    >
      <Skeleton shape="text" lines={3} />
      <Skeleton shape="text" lines={3} />
    </div>
  );
}

function EditError({
  state,
  onRetry,
}: {
  state: Extract<CurrentChildProfileState, { kind: 'error' }>;
  onRetry: () => void;
}) {
  const message = state.offline ? networkErrorCopy : errorCopyForCode(state.code);

  return (
    <div data-state="error">
      <ErrorState
        title={message.title}
        description={message.description}
        tone={state.offline ? 'offline' : 'error'}
        titleAs="h2"
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
    </div>
  );
}

/** 오류가 있는 첫 필드로 포커스 — 필드 순서 = DOM 순서 (Spec §9.1). */
function focusFirstInvalid(root: HTMLElement | null): void {
  const target = root?.querySelector<HTMLElement>(
    '[aria-invalid="true"], .haru-select-trigger--error button',
  );
  target?.focus();
}

function EditContent({ profile, now }: { profile: ChildProfile; now: Date }) {
  const toast = useToast();
  const rootRef = useRef<HTMLDivElement>(null);
  const [initial] = useState<ChildInfoFormState>(() => childInfoFormFromChild(profile.child));
  const [form, setForm] = useState<ChildInfoFormState>(initial);
  /** 마지막으로 누른 Save 에서 클라이언트 검증이 막았는가 — 누르기 전에는 오류를 보이지 않는다. */
  const [showClientErrors, setShowClientErrors] = useState(false);
  /** 클라이언트 검증이 막은 Save 횟수 — 오류 필드 포커스 트리거. */
  const [failedAttempt, setFailedAttempt] = useState(0);

  const body = buildUpdateChildBody(initial, form);
  const dirty = body !== null;
  const guard = useLeaveGuard(dirty);
  useRegisterChildInfoEditBack(guard.requestBack);

  const saving = useUpdateChild(profile.child.id, {
    onUpdated: () => {
      toast.show({ tone: 'success', message: copy.savedToast });
      guard.leave();
    },
  });

  const client = validateChildInfo(form, now).errors;
  const server =
    saving.errorCode === 'VALIDATION_FAILED' ? serverFieldErrors(saving.invalidFields) : null;
  const fieldErrors = {
    ...(server?.errors ?? {}),
    ...(showClientErrors ? client : {}),
  };
  const failure =
    saving.isError && (server === null || server.unplaced)
      ? saving.isOffline
        ? copy.offline
        : copy.saveFailed
      : null;

  /** 서버 필드 오류가 새로 도착했는가 — 바뀔 때마다 첫 오류 필드로 포커스한다. */
  const serverInvalidKey =
    saving.errorCode === 'VALIDATION_FAILED' ? saving.invalidFields.join(',') : '';

  useEffect(() => {
    if (failedAttempt > 0 || serverInvalidKey !== '') focusFirstInvalid(rootRef.current);
  }, [failedAttempt, serverInvalidKey]);

  const change = (patch: Partial<ChildInfoFormState>) => {
    if (saving.isPending) return;
    // 실패 안내는 다음 입력에서 지운다 — 입력은 그대로다 (발전 역량 화면과 같은 규칙, H6-3.6 ⑥).
    if (saving.isError) saving.reset();
    setForm((current) => ({ ...current, ...patch }));
  };

  const save = () => {
    if (body === null) return;
    if (Object.keys(client).length > 0) {
      setShowClientErrors(true);
      setFailedAttempt((count) => count + 1);
      return;
    }
    setShowClientErrors(false);
    saving.update(body);
  };

  return (
    <div ref={rootRef} className="flex flex-1 flex-col gap-5" data-state="ready">
      <section className="flex flex-col gap-2">
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
          {childCopy.childSection}
        </Text>
        <ChildIdentityFields form={form} onChange={change} now={now} errors={fieldErrors} />
      </section>

      <section className="flex flex-col gap-3">
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
          {childCopy.homeSection}
        </Text>
        <ChildLanguageFields form={form} onChange={change} now={now} errors={fieldErrors} />
      </section>

      {/* Figma `248:1159` — 독서 루틴은 `AT HOME` 다음 형제 섹션(`244:1415`, `S6-G` G-1). */}
      <ChildReadingRoutineField form={form} onChange={change} now={now} errors={fieldErrors} />

      <div className="mt-auto flex flex-col gap-3 pt-8">
        {failure === null ? null : (
          <InlineAlert tone="error" title={failure.title} description={failure.description} />
        )}
        <Button
          variant="accent"
          size="lg"
          fullWidth
          loading={saving.isPending}
          aria-disabled={dirty ? undefined : true}
          onPress={save}
        >
          {copy.save}
        </Button>
      </div>

      <ConfirmDialog
        open={guard.promptOpen}
        title={copy.leave.title}
        description={copy.leave.description(profile.child.firstName)}
        confirmLabel={copy.leave.confirm}
        cancelLabel={copy.leave.cancel}
        destructive
        onConfirm={guard.leave}
        onCancel={guard.keepEditing}
      />
    </div>
  );
}

export function ChildInfoEditForm({ clock }: ChildInfoEditFormProps) {
  const { state, retry } = useCurrentChildProfile();
  const [deviceNow] = useState<Date>(() => clockDate(clock ?? createSystemClock()));

  return (
    <div className="haru-child-info-edit flex flex-1 flex-col pt-6">
      {state.kind === 'loading' ? <EditSkeleton /> : null}
      {state.kind === 'error' ? <EditError state={state} onRetry={retry} /> : null}
      {state.kind === 'ready' ? (
        <EditContent key={state.profile.child.id} profile={state.profile} now={deviceNow} />
      ) : null}
    </div>
  );
}
