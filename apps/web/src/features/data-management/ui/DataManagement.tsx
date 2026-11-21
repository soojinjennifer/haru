/**
 * `DataManagement` — `/settings/data` 본문 (Stage 8 `C13-S8-2`, Spec §2.2 · §2.9 · §10.2).
 *
 * ```
 * flex col gap-4 py-6
 * ├─ [진행 중 요청] DeletionStatusAlert (InlineAlert info — 최상단, P-41)
 * ├─ section  SectionLabel "RECORDINGS"
 * │   └─ 보관 정책 문장 ({rawAudioDays} = 응답 값) → ListGroup "Recordings"
 * │        └─ ListRow "Session recordings"  subtitle {n} recordings  chevron → /settings/data/recordings
 * └─ section  SectionLabel "DELETE DATA"
 *     └─ 영향 안내 → ListGroup "Delete data"
 *          └─ ListRow "Delete all data"  (동작 행 — chevron 0, `Q8-03` ⓐ)
 * ```
 *
 * - 보관 일수는 응답 `retentionPolicy.rawAudioDays` 로만 쓴다 — 이 파일 · copy 에 수치 리터럴 0 (AC-8-15).
 * - `recordingsCount` = 삭제 가능한 녹음 수 (`VG8-A-04`). 0 이면 *No recordings* — 행은 남는다.
 * - 진행 중 삭제 요청이 있으면 *Delete all data* 행 비활성 + 상단 알림이 이유를 전달 (행 자체 사유 문구 0 — AC-8-18 · `Q8-08`).
 * - Loading = Skeleton · 조회 실패 = `ErrorState`(error | offline) + *Try again* (Spec §2.9).
 *
 * ── 전체 삭제 요청 (`S8-C`, Spec §2.4-② · §2.5 · §6.2 · AC-8-26~31) ──
 * - *Delete all data* → ConfirmDialog ② (destructive · 초기 포커스 = 취소) → `POST /v1/data-deletion-requests` 1회 (IK).
 *   처리 중에는 Esc · scrim · 취소로 닫지 않는다 (요청은 이미 나갔다 — Spec §2.4). 응답 후 닫힌다.
 * - 성공 → 상단 상태 알림(info) · 포커스 = 알림(일시 `tabIndex=-1`, §6.2) · 폴링(`useDeletionRequest` — 5s · 상한).
 * - `DELETION_ALREADY_REQUESTED` → 진행 중으로 표시 (오류 아님 — AC-8-29).
 * - POST 실패 · 오프라인 → 요청 버튼 바로 위 `InlineAlert`(error | offline) — 오프라인은 요청 0 (AC-8-30). 다시 시도 = 행을 다시 누른다.
 * - 서버 `failed` → 상단 알림 error + *Try again*(= ConfirmDialog ② 재진입 · 새 요청).
 * - `completed` → **이 화면은 정리하지 않는다** (`N8-31` ⓐ — `D8-2` ①). 앱 조립 지점 감시자(`useDataDeletionWatch`)가
 *   로컬 정리 → `me` 재조회 → Guard 가 온보딩으로 + Toast 1회를 한다 — 화면 안 · 화면 밖 완료가 같은 경로다.
 *   탈퇴(`scope='account'`) 완료는 이 화면이 다루지 않는다 (`S8-D`).
 *
 * ── 기기 표시 (`N8-31` ⓐ, Plan §5.7 "쓰는 때" · AC-8-97) ──
 * - `POST` 성공 → 요청 id 를 기기에 표시 · 요약에 진행 중 `all_data` 요청이 보이면(진입 · `DELETION_ALREADY_REQUESTED` 후 재조회 ·
 *   다른 기기의 요청) 표시. `scope='account'` 는 표시하지 않는다. 담는 것 = id · scope · 시각 (PII 0).
 * - `all_data` 요청의 상태 조회 · 폴링은 감시자가 한다 — 이 화면은 같은 key 를 **observe** 만 (요청 중복 0).
 */
import { isDeletionInProgress, type DeletionRequest } from '@haru/contracts';
import {
  ConfirmDialog,
  ErrorState,
  Icon,
  InlineAlert,
  ListGroup,
  ListRow,
  Skeleton,
  Text,
} from '@haru/ui';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useDataManagementSummary, useDeletionRequest } from '../../../entities/data-management';
import { useMe } from '../../../entities/me';
import { ROUTES } from '../../../shared/config/routes';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { createSystemClock, type Clock } from '../../../shared/lib/clock';
import {
  dataDeletionMarkerStore,
  type DataDeletionMarkerStore,
} from '../../../shared/lib/data-deletion-marker';
import { dataManagementCopy as copy } from '../copy';
import { resolveDeletionSurface, trackedDeletionRequest } from '../model/deletionSurface';
import {
  useCreateDeletionRequest,
  type CreateDeletionRequestFailure,
  type UseCreateDeletionRequestOptions,
} from '../model/useCreateDeletionRequest';

import { DeletionStatusAlert } from './DeletionStatusAlert';

export interface DataManagementProps {
  /** 테스트 주입 지점 — 연결 상태 (`useCreateDeletionRequest`). */
  isOnline?: UseCreateDeletionRequestOptions['isOnline'];
  /** 테스트 주입 지점 — 전체 삭제 요청 기기 표시 (`N8-31` ⓐ). 기본 = 앱 공용 인스턴스. */
  markerStore?: DataDeletionMarkerStore | undefined;
  /** 테스트 주입 지점 — 표시 시각. */
  clock?: Clock | undefined;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
      {children}
    </Text>
  );
}

function DataManagementSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 py-6"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
    >
      {[0, 1].map((index) => (
        <div key={index} className="haru-section">
          <Skeleton shape="text" lines={1} />
          <div className="haru-data-section__body">
            <Skeleton shape="text" lines={2} />
            <ListGroup>
              <ListRow title={<Skeleton shape="text" lines={1} />} />
            </ListGroup>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DataManagement({
  isOnline,
  markerStore = dataDeletionMarkerStore,
  clock: clockOption,
}: DataManagementProps = {}) {
  const navigate = useNavigate();
  const { me } = useMe();
  const query = useDataManagementSummary();
  const creator = useCreateDeletionRequest({ isOnline });
  const [clock] = useState<Clock>(() => clockOption ?? createSystemClock());

  const [confirming, setConfirming] = useState(false);
  const [created, setCreated] = useState<DeletionRequest | null>(null);
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [submitFailure, setSubmitFailure] = useState<CreateDeletionRequestFailure | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const statusNode = useRef<HTMLDivElement | null>(null);

  const active = query.summary?.activeDeletionRequest ?? null;
  const base = created ?? active;
  // `all_data` = 감시자가 같은 key 로 폴링한다 → 이 화면은 observe 만 (`N8-31` ⓐ). `account` = 이 화면이 폴링한다.
  const polling = useDeletionRequest(base?.id ?? null, {
    mode: base?.scope === 'all_data' ? 'observe' : 'poll',
  });
  const tracked = trackedDeletionRequest(created, active, polling.request);
  const surface = resolveDeletionSurface(tracked, alreadyRequested);
  const trackedScope = tracked?.scope;

  // 요약에 진행 중 `all_data` 요청이 보이면 기기에 표시한다 — 진입 · 이미 요청됨 후 재조회 · 다른 기기 요청 (Plan §5.7)
  const activeAllDataId =
    active !== null && active.scope === 'all_data' && isDeletionInProgress(active)
      ? active.id
      : null;
  useEffect(() => {
    if (activeAllDataId !== null) markerStore.save(activeAllDataId, clock);
  }, [activeAllDataId, markerStore, clock]);

  // 요청 성공 → 포커스 = 상태 알림 (Spec §6.2). Dialog 가 트리거로 포커스를 되돌린 **뒤** 옮긴다.
  useEffect(() => {
    if (focusRequest === 0) return;
    const node = statusNode.current;
    if (node === null) return;
    node.setAttribute('tabindex', '-1');
    node.addEventListener(
      'blur',
      () => {
        node.removeAttribute('tabindex');
      },
      { once: true },
    );
    node.focus();
  }, [focusRequest]);

  const openDialog = () => {
    setSubmitFailure(null);
    setConfirming(true);
  };

  const submit = () => {
    setSubmitFailure(null);
    creator.submit({
      onSuccess: (request) => {
        // 요청 id 를 기기에 표시 — 화면을 떠나도 감시자가 완료를 잡는다 (`N8-31` ⓐ, AC-8-97). scope = `all_data` 뿐
        if (request.scope === 'all_data') markerStore.save(request.id, clock);
        setConfirming(false);
        setAlreadyRequested(false);
        setCreated(request);
        setFocusRequest((count) => count + 1);
      },
      onError: (failure) => {
        setConfirming(false);
        if (failure.code === 'DELETION_ALREADY_REQUESTED') {
          // 진행 중으로 표시 — 오류 화면 아님 (AC-8-29). 요약 재조회가 진행 중 요청을 가져온다.
          setCreated(null);
          setAlreadyRequested(true);
          setFocusRequest((count) => count + 1);
          return;
        }
        setSubmitFailure(failure);
      },
    });
  };

  if (query.isPending) return <DataManagementSkeleton />;

  if (query.isError || query.summary === undefined) {
    const message = query.isOffline ? networkErrorCopy : errorCopyForCode(query.errorCode);
    return (
      <div className="py-6">
        <ErrorState
          title={message.title}
          description={message.description}
          tone={query.isOffline ? 'offline' : 'error'}
          titleAs="h2"
          retryLabel={retryLabel}
          retrying={query.isRefetching}
          onRetry={query.refetch}
        />
      </div>
    );
  }

  const { summary } = query;
  const writesBlocked = surface === 'progress' || surface === 'completed';
  const failureMessage =
    submitFailure === null
      ? null
      : submitFailure.offline
        ? { title: networkErrorCopy.title, description: copy.deleteData.notSent }
        : // 제목 = 기존 `errorCopyForCode` · 설명 = 무엇이 바뀌었는가 (Spec §10.2 `VG8-C-05`).
          {
            title: errorCopyForCode(submitFailure.code).title,
            description: copy.deleteData.notDeleted,
          };

  return (
    <div className="flex flex-col gap-4 py-6">
      <DeletionStatusAlert
        surface={surface}
        scope={trackedScope}
        childFirstName={me?.child?.firstName}
        onTryAgain={openDialog}
        focusTarget={statusNode}
      />

      <section className="haru-section">
        <SectionLabel>{copy.recordings.sectionLabel}</SectionLabel>
        <div className="haru-data-section__body">
          <Text variant="footnote" tone="primary">
            {copy.recordings.retention(summary.retentionPolicy.rawAudioDays)}
          </Text>
          <ListGroup label={copy.recordings.listLabel}>
            <ListRow
              title={copy.recordings.rowTitle}
              subtitle={copy.recordings.rowSubtitle(summary.recordingsCount)}
              trailing={
                <span className="haru-data-row__chevron">
                  <Icon name="chevron-right" size="sm" tone="inherit" decorative />
                </span>
              }
              onPress={() => {
                void navigate(ROUTES.settingsDataRecordings);
              }}
            />
          </ListGroup>
        </div>
      </section>

      <section className="haru-section">
        <SectionLabel>{copy.deleteData.sectionLabel}</SectionLabel>
        <div className="haru-data-section__body">
          <Text variant="footnote" tone="primary">
            {copy.deleteData.notice(me?.child?.firstName)}
          </Text>
          {submitFailure === null || failureMessage === null ? null : (
            <InlineAlert
              tone={submitFailure.offline ? 'offline' : 'error'}
              title={failureMessage.title}
              description={failureMessage.description}
            />
          )}
          <ListGroup label={copy.deleteData.listLabel}>
            <ListRow
              title={copy.deleteData.rowLabel}
              disabled={writesBlocked}
              onPress={openDialog}
            />
          </ListGroup>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title={copy.dialog.title(me?.child?.firstName)}
        description={copy.dialog.description}
        confirmLabel={copy.dialog.confirmLabel}
        cancelLabel={copy.dialog.cancelLabel}
        destructive
        confirming={creator.isPending}
        onConfirm={submit}
        onCancel={() => {
          // 요청이 이미 나갔으면 닫지 않는다 — 취소해도 철회되지 않는다 (Spec §2.4).
          if (creator.isPending) return;
          setConfirming(false);
        }}
      />
    </div>
  );
}
