import { EmptyState } from '@haru/ui';

import { homeCopy } from '../../shared/copy/home-copy';

/**
 * `/` Home skeleton — Design Spec §2.13, 결정 **#33** · **`C13-13`**.
 *
 * 로그인·온보딩 완료 후의 **착지 화면**이다. Stage 2 에서는 골격만 만든다.
 *
 * | 넣는 것 | 넣지 않는 것 (전부 Stage 3) |
 * |---|---|
 * | 워드마크 `26:39` + 설정 아이콘 `26:44` (헤더는 `HomeTopBar`) | Activity Card 덱 · 추천 · 서재 |
 * | 본문 `EmptyState` (CTA 없음) | streak chip `26:40` · 캐릭터 `26:22` · 버블 `88:922` |
 * | | `BottomTabBar` 마운트 · 알림 설정 |
 *
 * **contract 호출이 0건**이다 (`HomeSummary` · `ActivityCard` 는 Stage 3). 그래서 이 화면에는
 * Loading / Error 상태가 없다 — 표시할 서버 상태가 없기 때문이다 (Design Spec §2.13).
 *
 * Page 는 Composition 만 한다 (rules/frontend §3).
 */
export function HomePage() {
  return (
    // 헤더와의 간격 --space-8 + 남은 높이에서 세로 가운데 정렬 (Design Spec §2.13).
    <div className="flex min-h-full flex-col justify-center py-8">
      <EmptyState
        icon="book-open"
        title={homeCopy.empty.title}
        description={homeCopy.empty.description}
        titleAs="h1"
      />
    </div>
  );
}
