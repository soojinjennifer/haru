/**
 * `Start Session` — **Stage 3 에서는 비활성**이다 (`CONFIRMED (D-3)`, approvals §13.10 ·
 * `AD-S3-16`). 실제 세션 시작은 Stage 4 다.
 *
 * Home 덱(`ActivityCardDeck`)과 **같은 방식**이다:
 *   - native `disabled` 를 쓰지 않는다 — 스크린리더가 건너뛰어 존재와 사유를 전달할 수 없다.
 *   - `aria-disabled` + 포커스 가능.
 *   - 사유 슬롯(`reason`)이 비어 있으면 **설명 없이** 비활성만 적용한다 (`D-3` 대안 ③ 기각:
 *     "곧 나옵니다" 류는 사용자 노출 문구에 개발 단계를 드러낸다).
 *
 * `features/A` → `features/B` import 금지 규칙 때문에 Home 의 구현을 가져오지 않고, 같은
 * 규칙을 서재 안에서 한 번만 구현한다 (문구는 `library-copy` 가 소유한다).
 */
import { Button } from '@haru/ui';

import { libraryCopy } from '../../shared/copy/library-copy';

export interface StartSessionActionProps {
  /** 사유 문구 id 를 유일하게 만들기 위한 접두사 (시트가 여러 개 열릴 수 있다). */
  id: string;
}

export function StartSessionAction({ id }: StartSessionActionProps) {
  const { label, reason } = libraryCopy.bookSheet.startSession;
  const reasonId = `${id}-start-reason`;

  return (
    <>
      <Button
        variant="accent"
        aria-disabled
        {...(reason === null ? {} : { 'aria-describedby': reasonId })}
      >
        {label}
      </Button>
      {reason === null ? null : (
        <span className="haru-visually-hidden" id={reasonId}>
          {reason}
        </span>
      )}
    </>
  );
}
