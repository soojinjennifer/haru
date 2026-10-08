/**
 * `GiftRequestList` — `/library/gift-requests` 증정 요청 **상태 확인 전용** 화면
 * (FR-22 · PRD §13). Library Design Spec §7.3 (`C13-19` 명세 — **Figma 없음**, `C-13` ② 승인).
 *
 * ```
 * InlineAlert(tone=info)  — `D-15` 접수 안내 (approvals §8.2, 잠정 문구)
 * ListGroup / ListRow(media=BookCover sm, title, subtitle="Requested {date}",
 *                     meta=Tag(status))
 * ```
 *
 * ── 신청 CTA 가 **이 화면에 없다** ──
 * 신청은 `BookDetailSheet` 에서 한다 (`stage-3-design-spec.md` §2.11 유지). 이 화면은 상태만
 * 보여 준다. 그래서 Empty 안내도 "여기서 신청하라" 가 아니라 **어디서 신청하는지**를 알린다.
 *
 * ── 상태 `Tag` 는 `L-OPEN-14` 대상이 **아니다** ──
 * 금지된 것은 서재 **목록**의 보유·증정 구분 표식이고, 여기 상태 표시는 `FR-22` **기능
 * 자체**다 (approvals §17.1 — *"표식이 없다는 것과 기능이 없다는 것은 다르다"*).
 * `GiftRequestStatusSchema` **6종 재사용**이며 새 배지 컴포넌트를 만들지 않는다. 색이 뜻을
 * 전달하지 않도록 **`tone="neutral"` 하나**로 그리고 라벨 텍스트가 상태를 말한다 (WCAG 1.4.1).
 *
 * ── 상태 (§7.3) ──
 * Loading(`Skeleton` 행 3) · **Empty**(신청 0건 — 가장 흔한 상태) · Error/Offline(+Retry).
 * 더 보기를 만들지 않는다 (`useGiftRequests` 주석의 근거).
 */
import {
  EmptyState,
  ErrorState,
  InlineAlert,
  ListGroup,
  ListRow,
  Skeleton,
  Tag,
  Text,
} from '@haru/ui';

import { BookCover } from '../../entities/book';
import { useGiftRequests } from '../../entities/library';
import { giftRequestStatusCopy, libraryCopy, requestedMeta } from '../../shared/copy/library-copy';

/** Loading 자리 행 수. 실제 목록이 짧으므로 3행으로 둔다. */
const SKELETON_ROWS = 3;

export function GiftRequestList() {
  const { requests, isPending, isError, refetch } = useGiftRequests();

  if (isPending) {
    return (
      <div
        className="haru-gift-requests"
        role="status"
        aria-busy="true"
        aria-label={libraryCopy.giftRequests.loading}
      >
        <ListGroup>
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <li key={row} className="haru-shelf-sheet__skeleton-row">
              <Skeleton shape="text" lines={2} />
            </li>
          ))}
        </ListGroup>
      </div>
    );
  }

  /* 실패를 빈 상태로 보여 주지 않는다 (서재 화면과 같은 규칙). */
  if (isError || requests === undefined) {
    return (
      <div className="haru-gift-requests">
        <ErrorState
          title={libraryCopy.giftRequests.errorTitle}
          onRetry={refetch}
          retryLabel={libraryCopy.states.retry}
          announce="status"
          titleAs="h2"
        />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="haru-gift-requests">
        <EmptyState
          icon="info"
          title={libraryCopy.giftRequests.emptyTitle}
          description={libraryCopy.giftRequests.emptyDescription}
          titleAs="h2"
        />
      </div>
    );
  }

  return (
    <div className="haru-gift-requests">
      <InlineAlert
        tone="info"
        title={libraryCopy.giftRequests.noticeTitle}
        description={libraryCopy.giftRequests.noticeDescription}
      />
      <ListGroup label={libraryCopy.giftRequests.listLabel}>
        {requests.map((request) => (
          <ListRow
            key={request.id}
            title={request.book.title}
            media={
              <BookCover
                title={request.book.title}
                author={request.book.author}
                coverUrl={request.book.coverUrl ?? undefined}
                size="sm"
                decorative
              />
            }
            subtitle={
              <Text as="span" variant="caption-2" tone="tertiary">
                {requestedMeta(request.requestedAt)}
              </Text>
            }
            meta={<Tag label={giftRequestStatusCopy[request.status]} size="xs" />}
          />
        ))}
      </ListGroup>
    </div>
  );
}
