/**
 * `/library` 문구 — **Stage 3 1차에서는 탭바 마운트 자리만** 잡는다.
 *
 * 서재 화면 내용(섹션·캐러셀·목록·시트·증정)은 이번 범위가 아니며, Stage 2 Home skeleton 과
 * 같은 방식으로 **착지 화면 골격**만 둔다. 화면이 생기면 이 문구는 서재 feature copy 모듈로
 * 옮겨진다.
 *
 * 기능을 약속하지 않고 관찰·안내 언어만 쓴다. 진단·판정·비교 표현 금지.
 */
export const libraryCopy = {
  title: 'Library',
  empty: {
    title: 'Your library is taking shape.',
    description: 'Books you read together will be collected here.',
  },
} as const;
