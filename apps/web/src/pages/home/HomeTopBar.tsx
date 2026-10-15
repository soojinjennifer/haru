import { Icon, IconButton, Text, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { ActivityCardOfflineBanner } from '../../features/activity-card-deck';
import { homeOverviewCopy, HomeWeekSummary } from '../../features/home-overview';
import { settingsCopy } from '../../features/settings';
import { ROUTES } from '../../shared/config/routes';

/**
 * Home 헤더 — Figma `26:21` 실측 2026-10-05 (워드마크 `26:39` · 칩 `26:40` · 설정 `26:44`).
 *
 * | 요소 | Figma (Web y = Figma y − 56) | 비고 |
 * |---|---|---|
 * | 밴드 | padding-block-start **10**, 높이 38 → 총 **48** | 1차는 0 … 40 이었다 |
 * | 워드마크 `26:39` | (26, 19) 64×25 | gutter 24 + 2 |
 * | 칩 `26:40` | (188, 12) 145×34 | 기하는 Figma, **라벨은 `2 this week` 유지** |
 * | 설정 `26:44` | (331, 10) 38×38 | |
 *
 * `TopBar variant="large"` 를 **제목 없이** 쓴다: leading 에 워드마크, trailing 에 칩 + 설정
 * IconButton (`large` 는 `auto 1fr auto` 격자라 양끝 정렬이 된다). 밴드 상단 여백 10 은
 * 바깥 wrapper(`.haru-home-top-bar`)가 소유한다 — `TopBar` 공통 높이를 건드리지 않기 위해서다.
 *
 * ⚠ **헤더 칩 문구는 Figma 와 다르다** (의도된 불일치). Figma `26:43` 은 `2week /115 Min` 이지만
 * 누적 분은 달성률 언어라 `D-6`·PRD §8.4(비교·판정 금지)와 충돌한다 → `2 this week` 유지가
 * 사용자 결정이다 (approvals §12.3 · §12.7, `A-23`). Figma 불일치로 기록한다.
 *
 * 워드마크는 별도 로고 에셋이 아니라 **텍스트**다 — `COMPONENT_MAP.md` 실측이 `26:39` 를
 * "SF Pro Heavy 21px 텍스트 로고" 로 기록했고 에셋화는 아직 결정되지 않았다. 21px 은 토큰
 * 스케일(`title-2` = 22px)로 흡수한다 (Stage 0 #10 — 화면 raw 값은 스케일로 흡수).
 *
 * Layout 은 `app/router.tsx` 가 씌우므로 TopBar 도 route element 로 주입된다
 * (`pages → app` import 금지 — rules/architecture §3).
 *
 * **Offline Banner** (Stage 4 `S4-J`, `D-11` · AC-4-82) — 오프라인 + 최근 카드 캐시일 때만 헤더 밴드 **밑**에
 * 붙는다 (TopBar 바로 아래 — Stage 1 §5.4). 평소에는 아무것도 렌더하지 않아 헤더 기하가 그대로다.
 */
export function HomeTopBar() {
  const navigate = useNavigate();

  return (
    <>
      <div className="haru-home-top-bar">
        <TopBar
          variant="large"
          leading={
            <Text as="span" variant="title-2" weight="heavy" tone="primary">
              {homeOverviewCopy.wordmark}
            </Text>
          }
          trailing={
            <>
              <HomeWeekSummary />
              <IconButton
                icon={<Icon name="settings" size="md" decorative />}
                label={settingsCopy.entryLabel}
                variant="plain"
                onPress={() => {
                  void navigate(ROUTES.settings);
                }}
              />
            </>
          }
        />
      </div>
      <ActivityCardOfflineBanner />
    </>
  );
}
