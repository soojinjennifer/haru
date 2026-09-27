import { Icon, IconButton, Text, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { settingsCopy } from '../../features/settings';
import { ROUTES } from '../../shared/config/routes';
import { homeCopy } from '../../shared/copy/home-copy';

/**
 * Home 헤더 — Design Spec §2.13 (Figma `26:21` / `26:39` 워드마크 / `26:44` 설정).
 *
 * `TopBar variant="large"` 를 **제목 없이** 쓴다: leading 에 워드마크, trailing 에 설정
 * IconButton 만 두는 구성이다 (`large` 는 `auto 1fr auto` 격자라 양끝 정렬이 된다).
 *
 * Stage 3 에서 이 헤더에 streak chip(`26:40`)이 붙는다. Stage 2 에는 넣지 않는다 (#33).
 *
 * 워드마크는 별도 로고 에셋이 아니라 **텍스트**다 — `COMPONENT_MAP.md` 실측이 `26:39` 를
 * "SF Pro Heavy 21px 텍스트 로고" 로 기록했고 에셋화는 아직 결정되지 않았다. 21px 은 토큰
 * 스케일(`title-2` = 22px)로 흡수한다 (Stage 0 #10 — 화면 raw 값은 스케일로 흡수).
 *
 * Layout 은 `app/router.tsx` 가 씌우므로 TopBar 도 route element 로 주입된다
 * (`pages → app` import 금지 — rules/architecture §3).
 */
export function HomeTopBar() {
  const navigate = useNavigate();

  return (
    <TopBar
      variant="large"
      leading={
        <Text as="span" variant="title-2" weight="heavy" tone="primary">
          {homeCopy.wordmark}
        </Text>
      }
      trailing={
        <IconButton
          icon={<Icon name="settings" size="md" decorative />}
          label={settingsCopy.entryLabel}
          variant="plain"
          onPress={() => {
            void navigate(ROUTES.settings);
          }}
        />
      }
    />
  );
}
