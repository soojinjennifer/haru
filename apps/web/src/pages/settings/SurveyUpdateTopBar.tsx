import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { surveyUpdateCopy } from '../../features/survey-update';

/**
 * `/settings/child/survey` 진입 화면 TopBar — Spec §2.6.1 (`variant=centered`, **제목 없음** — 본문 h1 이 제목,
 * leading = 뒤로 `navigate(-1)`). 설정 하위 화면(`ProfileTopBar` · `ChildInfoEditTopBar`)과 같은 규격이다.
 *
 * 재응답 흐름 안의 이동은 전부 replace 라 흐름이 history 에 한 칸만 남는다 → 뒤로 = 설정 목록.
 */
export function SurveyUpdateTopBar() {
  const navigate = useNavigate();

  return (
    <TopBar
      variant="centered"
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={surveyUpdateCopy.backLabel}
          variant="plain"
          onPress={() => {
            void navigate(-1);
          }}
        />
      }
    />
  );
}
