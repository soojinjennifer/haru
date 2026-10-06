/**
 * `/progress` 준비 안내 문구 — `CONFIRMED (D-2)` · Stage 3 Design Spec §2.13.
 *
 * 탭 3개 구조(#15)를 유지하면서 탭이 죽지 않게 하는 안내 화면이다. 리포트 화면 자체는
 * Stage 7 이다.
 *
 * ⚠ **수치를 전혀 넣지 않는다.** "3회 중 1회" 같은 달성률 언어로 미끄러지는 것을 막기 위해
 * 발행 기준도 숫자 없이 설명한다 (`D-2` 승인 조건 · `rules/frontend.md` §8).
 *
 * 이 화면에는 feature 가 없다 (contract 호출 0건 — `ReportOverview` 를 부르지 않는다).
 * 그래서 Stage 2 Home skeleton 과 같은 선례로 앱 copy 모듈에 둔다.
 */
export const progressCopy = {
  title: 'Progress',
  empty: {
    title: 'Your first report is on the way',
    description:
      'Reports open up after you and your child have recorded storytimes together for a while.',
  },
} as const;
