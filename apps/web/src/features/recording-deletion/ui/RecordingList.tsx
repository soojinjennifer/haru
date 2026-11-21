/**
 * `RecordingList` — `/settings/data/recordings` 본문 (Stage 8 `C13-S8-3`, Spec §2.3 · §2.4-① · §2.9 · §6.2 · §9.1).
 *
 * ```
 * flex col gap-4 py-6
 * ├─ 범위 안내 1문장 (footnote primary)
 * ├─ [행 삭제 실패 · 오프라인] InlineAlert error | offline (목록 위 — 해당 행 이름 포함)
 * ├─ ListGroup "Session recordings"
 * │   └─ ListRow ×N (onPress 없음)  title = 책 제목 | Storytime · subtitle = {Mon D} · {m} min · meta = 상태 문구
 * │        trailing = Button glass sm "Delete" (uploaded · pending · failed 만)
 * ├─ [다음 페이지] TextLink "Show more"   ·   [더 보기 실패] InlineAlert error + Try again (받은 행 유지)
 * └─ live region (시각 숨김, role=status) — 삭제 성공 1회 "Recording deleted."
 * ```
 *
 * - 상태는 **문구**로만 — Tag · 상태 색 · 썸네일 0 (`Q8-04`·`Q8-05` ⓐ). `expired` · `deleted` 행은 남고 *Delete* 0 (`Q8-07` ⓐ).
 * - 삭제: *Delete* → ConfirmDialog destructive → 확인 → 서버 확정 → (로컬 정리) → 행 *Deleted* (위치 이동 0).
 *   처리 중에는 Esc · scrim · 취소로 닫지 않는다 (요청은 이미 나갔다 — Spec §2.4).
 * - 포커스 (§6.2): 취소 · 실패 = 그 행 *Delete* (Dialog focus trap 이 트리거로 되돌린다) · 성공 = **그 행**(일시 `tabIndex=-1`).
 *   `ListRow` 는 ref 를 받지 않으므로 제목 노드에서 행(`li`)을 찾는다 — Shared UI 변경 0.
 * - 진행 중 전체 삭제 · 탈퇴 요청이 있으면 *Delete* 비활성 (Spec §2.5 — 서버 쓰기 차단 `C8-5` 를 미리 반영, 요청 0).
 * - Loading = ListGroup 안 Skeleton 행 3 · 조회 실패 = ErrorState · 행 0 = EmptyState (`D4-40`). 요약 `recordingsCount` 가 0 이어도
 *   `deleted` · `expired` 행이 있으면 목록을 보여 준다 (`VG8-A-04`).
 * - `R-SHADOW-1`: 새 overflow 0 — 문서 스크롤 안 흐름 배치.
 */
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InlineAlert,
  ListGroup,
  ListRow,
  Skeleton,
  Text,
  TextLink,
} from '@haru/ui';
import type { ErrorCode } from '@haru/contracts';
import { useEffect, useRef, useState } from 'react';

import { useDataManagementSummary, useRecordingSessions } from '../../../entities/data-management';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { createSystemClock, type Clock } from '../../../shared/lib/clock';
import { recordingDeletionCopy as copy } from '../copy';
import { toRecordingRowView, type RecordingRowView } from '../model/recordingRowView';
import {
  useDeleteSessionRecording,
  type UseDeleteSessionRecordingOptions,
} from '../model/useDeleteSessionRecording';

export interface RecordingListProps {
  /** 테스트 주입 지점 — 날짜 표기의 기준 시각(해가 다르면 연도). 주지 않으면 기기 시계. */
  clock?: Clock | undefined;
  /** 테스트 주입 지점 — 로컬 녹음 삭제 · 연결 상태. */
  deletion?: UseDeleteSessionRecordingOptions | undefined;
}

interface FailureAlert {
  readonly offline: boolean;
  readonly code: ErrorCode | undefined;
  readonly title: string;
  /** 행에 보이는 날짜 라벨 — 같은 책의 다른 녹음과 구분한다 (`VG8-B-07`). */
  readonly dateLabel: string;
}

function ListSkeleton() {
  return (
    <div className="py-6" role="status" aria-busy="true" aria-label={copy.loading}>
      <ListGroup>
        {[0, 1, 2].map((index) => (
          <ListRow key={index} title={<Skeleton shape="text" lines={2} />} />
        ))}
      </ListGroup>
    </div>
  );
}

export function RecordingList({ clock, deletion }: RecordingListProps) {
  const [deviceClock] = useState<Clock>(() => clock ?? createSystemClock());
  const [nowMs] = useState(() => deviceClock.now());
  const summary = useDataManagementSummary();
  const list = useRecordingSessions();
  const remover = useDeleteSessionRecording(deletion);

  const [confirming, setConfirming] = useState<RecordingRowView | null>(null);
  const [failure, setFailure] = useState<FailureAlert | null>(null);
  const [announcement, setAnnouncement] = useState('');
  // 포커스를 옮길 행 — 렌더에 쓰지 않으므로 ref 에 두고, 커밋 신호만 state 로 준다.
  const pendingFocusRow = useRef<string | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const titleNodes = useRef(new Map<string, HTMLElement>());

  // 삭제 성공 → 그 행으로 포커스 (trailing *Delete* 가 사라져 트리거로 돌아갈 수 없다 — Spec §6.2).
  // Dialog 닫힘(focus trap 해제 → 트리거 복귀 시도)과 같은 커밋이면 effect 순서상 이 이동이 마지막이다.
  useEffect(() => {
    const target = pendingFocusRow.current;
    if (target === null) return;
    pendingFocusRow.current = null;
    const row = titleNodes.current.get(target)?.closest('li');
    if (row instanceof HTMLElement) {
      row.tabIndex = -1;
      row.addEventListener(
        'blur',
        () => {
          row.removeAttribute('tabindex');
        },
        { once: true },
      );
      row.focus();
    }
  }, [focusRequest]);

  if (summary.isPending || list.isPending) return <ListSkeleton />;

  if (summary.isError || list.isError || summary.summary === undefined) {
    const offline = summary.isError ? summary.isOffline : list.isOffline;
    const code = summary.isError ? summary.errorCode : list.errorCode;
    const message = offline ? networkErrorCopy : errorCopyForCode(code);
    return (
      <div className="py-6">
        <ErrorState
          title={message.title}
          description={message.description}
          tone={offline ? 'offline' : 'error'}
          titleAs="h2"
          retryLabel={retryLabel}
          retrying={summary.isRefetching || list.isRefetching}
          onRetry={() => {
            if (summary.isError) summary.refetch();
            if (list.isError) list.refetch();
          }}
        />
      </div>
    );
  }

  const { rawAudioDays } = summary.summary.retentionPolicy;
  const writesBlocked = summary.summary.activeDeletionRequest !== null;
  const rows = list.items
    .map((item) => toRecordingRowView(item, rawAudioDays, nowMs))
    .filter((row): row is RecordingRowView => row !== null);

  if (rows.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          icon="book-open"
          titleAs="h2"
          title={copy.empty.title}
          description={copy.empty.description}
        />
      </div>
    );
  }

  const failureMessage =
    failure === null ? null : failure.offline ? networkErrorCopy : errorCopyForCode(failure.code);

  return (
    <div className="flex flex-col gap-4 py-6">
      <Text variant="footnote" tone="primary">
        {copy.scope}
      </Text>

      {failure === null || failureMessage === null ? null : (
        <InlineAlert
          tone={failure.offline ? 'offline' : 'error'}
          title={failureMessage.title}
          description={
            failure.offline
              ? copy.failure.notSent(failure.title, failure.dateLabel)
              : copy.failure.notDeleted(failure.title, failure.dateLabel)
          }
        />
      )}

      <ListGroup label={copy.listLabel}>
        {rows.map((row) => (
          <ListRow
            key={row.sessionId}
            title={
              <span
                ref={(node) => {
                  if (node === null) titleNodes.current.delete(row.sessionId);
                  else titleNodes.current.set(row.sessionId, node);
                }}
              >
                {row.title}
              </span>
            }
            subtitle={row.subtitle}
            meta={
              // 보조 행과 같은 크기 · 색 (Spec §2.3.1 — `text-secondary` 계열, 카드 위 대비 `P-01`)
              <Text as="span" variant="caption-1" tone="secondary">
                {row.meta}
              </Text>
            }
            // 안 들어가면 meta 가 통째로 다음 줄로 — 날짜 · 길이가 단어마다 끊기지 않는다 (`D8-2` ② · Spec §8.1, 이 목록만)
            metaWrap
            {...(row.deletable
              ? {
                  trailing: (
                    <Button
                      variant="glass"
                      size="sm"
                      aria-label={copy.deleteName(row.title, row.dateLabel)}
                      disabled={writesBlocked}
                      onPress={() => {
                        setConfirming(row);
                      }}
                    >
                      {copy.deleteLabel}
                    </Button>
                  ),
                }
              : {})}
          />
        ))}
      </ListGroup>

      {list.isFetchNextPageError ? (
        <InlineAlert
          tone={list.isOffline ? 'offline' : 'error'}
          title={(list.isOffline ? networkErrorCopy : errorCopyForCode(list.errorCode)).title}
          action={{ label: retryLabel, onPress: list.fetchNextPage }}
        />
      ) : list.hasNextPage ? (
        <div>
          {/* `D8-3` (`H8-6-N4`) — 목록 끝 단독 링크: 보이는 모습 그대로, 누르는 영역만 44. */}
          <TextLink hitArea="touch" onPress={list.fetchNextPage}>
            {copy.showMore}
          </TextLink>
        </div>
      ) : null}

      <div className="haru-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>

      <ConfirmDialog
        open={confirming !== null}
        title={copy.dialog.title}
        description={copy.dialog.description}
        confirmLabel={copy.dialog.confirmLabel}
        cancelLabel={copy.dialog.cancelLabel}
        destructive
        confirming={remover.isPending}
        onConfirm={() => {
          if (confirming === null) return;
          const target = confirming;
          setFailure(null);
          setAnnouncement('');
          remover.remove(target.sessionId, {
            onSuccess: () => {
              setConfirming(null);
              setAnnouncement(copy.deletedAnnouncement);
              pendingFocusRow.current = target.sessionId;
              setFocusRequest((count) => count + 1);
            },
            onError: ({ offline, code }) => {
              setConfirming(null);
              setFailure({ offline, code, title: target.title, dateLabel: target.dateLabel });
            },
          });
        }}
        onCancel={() => {
          // 요청이 이미 나갔으면 닫지 않는다 — 취소해도 철회되지 않는다 (Spec §2.4).
          if (remover.isPending) return;
          setConfirming(null);
        }}
      />
    </div>
  );
}
