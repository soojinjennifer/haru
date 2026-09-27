/**
 * Home skeleton 문구 — Design Spec §2.13 (`C13-13`), 결정 **#33**.
 *
 * Home 은 Stage 2 에서 **착지 화면 골격**이라 feature 가 없다 (Activity Card · 추천 · 서재 ·
 * streak · 캐릭터 · 버블 · BottomTabBar 는 전부 Stage 3). 그래서 feature copy 모듈이 아니라
 * 앱 copy 모듈에 둔다 — 문구를 컴포넌트에 흩어두지 않는다는 규칙(`rules/frontend.md` §8)은
 * 그대로 지킨다. Stage 3 에서 Home 이 feature 를 갖게 되면 그 copy 모듈로 옮긴다.
 *
 * 문구 톤: 기능을 약속하지 않고 관찰·안내 언어만 쓴다. 진단·판정·비교 표현 금지.
 * Design Spec §13.1 ⑧ 이 copy 승인 대상으로 올린 `RECOMMENDED` 안을 그대로 구현했다.
 */
export const homeCopy = {
  /** 워드마크 (Figma `26:39`) — 앱 이름 그대로다. */
  wordmark: 'HARU',

  /** 본문 EmptyState — CTA 를 두지 않는다 (Stage 2 에는 이동할 곳이 없다). */
  empty: {
    title: 'Your storytime space is ready.',
    description: "Tonight's activity will show up here.",
  },
} as const;
