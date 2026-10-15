/**
 * `ActivityCardOfflineBanner` — 오프라인인데 **최근 Activity Card 캐시**를 보여 줄 때의 Offline Banner
 * (`D-11`, 이월 `QA-3-002`, AC-4-82 · Stage 3 Design Spec §8 `offline-cached-card`).
 *
 * 배치는 **TopBar 바로 아래** (Stage 1 §5.4 · Stage 4 Design Spec §7 ④ `C13-8`) — 그래서 덱 안이 아니라
 * Home 헤더(`pages/home/HomeTopBar`)가 이 컴포넌트를 조립한다. `features/A → features/B` 직접 import 를
 * 피하려고 Page 가 조립한다 (`rules/architecture.md` §3).
 *
 * 카드가 **없는** 오프라인은 이 배너가 아니라 덱 슬롯의 안내가 맡는다 (Stage 3 그대로). 수동 닫기 없음.
 */
import { InlineAlert } from '@haru/ui';

import { useTodayActivityCard } from '../../../entities/activity-card';
import { activityDeckCopy } from '../copy';

export function ActivityCardOfflineBanner() {
  const { isCached } = useTodayActivityCard();
  if (!isCached) return null;

  return (
    <InlineAlert
      tone="offline"
      placement="banner"
      title={activityDeckCopy.states.cachedTitle}
      description={activityDeckCopy.states.cachedDescription}
    />
  );
}
