/**
 * `Start Session` — 서재 시트의 주 CTA (Library Design Spec §3.7 · §6, Stage 4 `S4-F1` — `D-3` 해제).
 *
 * - **책이 정해진 시트(`BookDetailSheet`)** 에서는 활성이다 — 누르면 `POST /v1/sessions` 1회
 *   (`childBookId` = 서재 항목, Reading Context 없음 — `D4-25`) → `/session/:id` (AC-4-38 · AC-4-39).
 * - **대상 책이 없는 시트(`LibraryShelfSheet` "See all")** 에서는 여전히 비활성이다 — 행 탭은 선택이
 *   아니라 상세 시트 전환이라 시작할 책이 없다 (Library Spec §6.1). native `disabled` 대신
 *   `aria-disabled` + 포커스 가능 (Home 덱과 같은 규칙). 사유 슬롯은 비어 있다.
 * - 생성 실패는 Toast 로 알리고 시트에 머문다.
 * - ⭐ `S4-H4` (`D4-145` · `D4-146`): 열린 세션이 `ready` 면 그 세션 화면으로(일반 시작과 같은 push) · `recording`/
 *   `paused` 면 Toast 한 칸에 기존 `SESSION_ALREADY_ACTIVE` 제목·설명(`제목. 설명`, Q1 ⓐ) · 온보딩 미완료는 Route Guard
 *   가 이동한다(그동안 `loading` 유지) · 어긋남은 기존 `ONBOARDING_INCOMPLETE` 문구. 판단은 `useCreateSession` 이 한다.
 * - ⭐ `S4-H2R` (`D4-112` · `D4-119` CP-8): 탭 → **마이크 권한 판정**(미정이면 OS 프롬프트) → 생성(`mode` =
 *   판정 결과). 판정 중에도 같은 `loading` 이다. 판정 중 시트가 닫히면(`open` false · 언마운트) 늦게 온 결과로
 *   생성을 보내지 않는다 (AC-4-145 ⑦).
 *
 * `features/A` → `features/B` import 금지 규칙 때문에 Home 의 구현을 가져오지 않고, 같은 규칙을 서재
 * 안에서 한 번만 구현한다 (문구는 `library-copy` 가 소유한다).
 */
import { Button, useToast } from '@haru/ui';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { LibraryBook } from '@haru/contracts';

import { useCreateSession, useResolveSessionMode } from '../../entities/session';
import { sessionPath } from '../../shared/config/routes';
import {
  deletionPendingToastMessage,
  joinErrorMessage,
  sessionStartBlockedCopy,
} from '../../shared/copy/error-copy';
import { libraryCopy } from '../../shared/copy/library-copy';

export interface StartSessionActionProps {
  /** 사유 문구 id 를 유일하게 만들기 위한 접두사 (시트가 여러 개 열릴 수 있다). */
  id: string;
  /** 시작할 서재 항목. 없으면(Shelf 시트) 비활성이다. */
  book?: LibraryBook | undefined;
  /** 이 버튼을 담은 시트가 열려 있는가 — 닫히면 진행 중인 권한 판정 결과를 버린다 (기본 `true`). */
  open?: boolean;
}

export function StartSessionAction({ id, book, open = true }: StartSessionActionProps) {
  const { label, reason } = libraryCopy.bookSheet.startSession;
  const reasonId = `${id}-start-reason`;
  const navigate = useNavigate();
  const toast = useToast();
  /**
   * 탭 ~ 생성 응답(이동) 또는 실패까지 **끊기지 않는** `loading` (`D4-125`, `VG-H2R-01`) — 판정 종료와 mutation
   * `isPending` 사이의 렌더를 잇는다. 실패 · 결과 버림 · 이동에서 끈다.
   */
  const [launching, setLaunching] = useState(false);
  const createSession = useCreateSession(
    (session) => {
      setLaunching(false);
      void navigate(sessionPath(session.id));
    },
    (errorCode) => {
      setLaunching(false);
      const blocked = sessionStartBlockedCopy(errorCode);
      toast.show({
        // 쓰기 차단 = 설명만 (Toast 1줄 표면, Spec §2.9 `VG8-C-08`)
        message:
          deletionPendingToastMessage(errorCode) ??
          (blocked === null ? libraryCopy.bookSheet.startFailed : joinErrorMessage(blocked)),
        tone: 'error',
      });
    },
  );

  const sessionMode = useResolveSessionMode();
  /** 판정 결과를 써도 되는가 — 시트가 열려 있고 마운트되어 있는 동안만 `true`. */
  const live = useRef(open);
  /** 탭마다 1 증가 — 판정 중 재탭이 와도 마지막 탭 하나만 생성한다 (AC-4-145 ⑥ 생성 1건). */
  const attempt = useRef(0);
  useEffect(() => {
    live.current = open;
    return () => {
      live.current = false;
    };
  }, [open]);

  const blocked = book === undefined;

  return (
    <>
      <Button
        variant="accent"
        loading={launching || sessionMode.isResolving || createSession.isPending}
        {...(blocked ? { 'aria-disabled': true } : {})}
        {...(blocked && reason !== null ? { 'aria-describedby': reasonId } : {})}
        onPress={() => {
          if (book === undefined) return;
          attempt.current += 1;
          const current = attempt.current;
          setLaunching(true);
          void sessionMode.resolve().then((mode) => {
            // 더 새 탭이 있으면 그 탭이 `loading` 을 이어 간다 — 이 결과만 버린다
            if (current !== attempt.current) return;
            if (!live.current) {
              setLaunching(false);
              return;
            }
            createSession.create({
              mode,
              activityCardOptionId: null,
              bookId: null,
              childBookId: book.id,
              readingContext: null,
            });
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
