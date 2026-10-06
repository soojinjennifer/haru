import { EmptyState } from '@haru/ui';

import { libraryCopy } from '../../shared/copy/library-copy';

/**
 * `/library` — **Stage 3 1차에서는 탭바 마운트 자리만** 잡는다 (사용자 지시: Home 먼저 검수).
 *
 * 서재 화면 내용(섹션 3개 · 캐러셀 · 목록 · `LibraryShelfSheet` · `BookDetailSheet` · 직접 등록 ·
 * 증정)은 **이번 범위가 아니다**. Stage 2 Home skeleton 과 같은 골격만 둔다 — contract 호출
 * 0건이라 Loading / Error 상태도 아직 없다.
 *
 * 하단에 탭바 관련 padding 을 넣지 않는다 (§2.1 이중 계상 금지).
 */
export function LibraryPage() {
  return (
    <div className="flex min-h-full flex-col justify-center py-8">
      <EmptyState
        icon="book"
        title={libraryCopy.empty.title}
        description={libraryCopy.empty.description}
        titleAs="h2"
      />
    </div>
  );
}
