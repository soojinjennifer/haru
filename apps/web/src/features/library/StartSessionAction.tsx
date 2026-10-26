/**
 * `Start Session` — 서재 시트의 주 CTA (Library Design Spec §3.7 · §6, Stage 4 `S4-F1` — `D-3` 해제).
 *
 * - **책이 정해진 시트(`BookDetailSheet`)** 에서는 활성이다 — 누르면 `POST /v1/sessions` 1회
 *   (`childBookId` = 서재 항목, Reading Context 없음 — `D4-25`) → `/session/:id` (AC-4-38 · AC-4-39).
 * - **대상 책이 없는 시트(`LibraryShelfSheet` "See all")** 에서는 여전히 비활성이다 — 행 탭은 선택이
 *   아니라 상세 시트 전환이라 시작할 책이 없다 (Library Spec §6.1). native `disabled` 대신
 *   `aria-disabled` + 포커스 가능 (Home 덱과 같은 규칙). 사유 슬롯은 비어 있다.
 * - 생성 실패는 Toast 로 알리고 시트에 머문다.
 *
 * `features/A` → `features/B` import 금지 규칙 때문에 Home 의 구현을 가져오지 않고, 같은 규칙을 서재
 * 안에서 한 번만 구현한다 (문구는 `library-copy` 가 소유한다).
 */
import { Button, useToast } from '@haru/ui';
import { useNavigate } from 'react-router';
import type { LibraryBook } from '@haru/contracts';

import { useCreateSession } from '../../entities/session';
import { sessionPath } from '../../shared/config/routes';
import { libraryCopy } from '../../shared/copy/library-copy';

export interface StartSessionActionProps {
  /** 사유 문구 id 를 유일하게 만들기 위한 접두사 (시트가 여러 개 열릴 수 있다). */
  id: string;
  /** 시작할 서재 항목. 없으면(Shelf 시트) 비활성이다. */
  book?: LibraryBook | undefined;
}

export function StartSessionAction({ id, book }: StartSessionActionProps) {
  const { label, reason } = libraryCopy.bookSheet.startSession;
  const reasonId = `${id}-start-reason`;
  const navigate = useNavigate();
  const toast = useToast();
  const createSession = useCreateSession(
    (session) => {
      void navigate(sessionPath(session.id));
    },
    () => {
      toast.show({ message: libraryCopy.bookSheet.startFailed, tone: 'error' });
    },
  );

  const blocked = book === undefined;

  return (
    <>
      <Button
        variant="accent"
        loading={createSession.isPending}
        {...(blocked ? { 'aria-disabled': true } : {})}
        {...(blocked && reason !== null ? { 'aria-describedby': reasonId } : {})}
        onPress={() => {
          if (book === undefined) return;
          createSession.create({
            mode: 'recorded',
            activityCardOptionId: null,
            bookId: null,
            childBookId: book.id,
            readingContext: null,
          });
        }}
      >
        {label}
      </Button>
      {blocked && reason !== null ? (
        <span className="haru-visually-hidden" id={reasonId}>
          {reason}
        </span>
      ) : null}
    </>
  );
}
