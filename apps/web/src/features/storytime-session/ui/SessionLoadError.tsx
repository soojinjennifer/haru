/**
 * 세션 조회 실패 화면 — `/session/:id` · `/session/:id/complete` 공용 (`D4-96`·`D4-99`, AC-4-144).
 * **Figma 없는 UI** 이며 사용자가 직접 승인했다. 명세 = `docs/design/stage-4b-visual-gap-h1.md` §8.2.
 *
 * 없는 세션이면 재시도가 소용없고 이 화면에는 탭바도 없어서, 오류 종류와 무관하게 **출구**를 둔다.
 * 버튼은 `ErrorState` 의 `role="alert"` 밖이다 — 낭독 문장에 섞이지 않고 자동 포커스도 받지 않는다.
 * `ErrorState` 에 두 번째 액션 슬롯이 없어 카드 아래 형제로 둔다 (`packages/ui` 변경 0).
 */
import { Button, ErrorState } from '@haru/ui';
import { useNavigate } from 'react-router';

import { ROUTES } from '../../../shared/config/routes';
import { storytimeSessionCopy as copy } from '../copy';

export interface SessionLoadErrorProps {
  onRetry: () => void;
}

export function SessionLoadError({ onRetry }: SessionLoadErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="haru-session haru-session--error">
      <div className="haru-session__error">
        <ErrorState
          title={copy.states.errorTitle}
          onRetry={onRetry}
          retryLabel={copy.states.retry}
          announce="alert"
          titleAs="h1"
        />
        <Button
          variant="glass"
          size="md"
          onPress={() => {
            void navigate(ROUTES.home, { replace: true });
          }}
        >
          {copy.states.backHome}
        </Button>
      </div>
    </div>
  );
}
