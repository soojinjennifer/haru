/**
 * 책 표지 — **Mock 전용 임시 에셋** (사용자 지시 2026-10-05, `stage-3-approvals.md` §12.12).
 *
 * > "책 이미지도 피그마에 있는 이미지를 이용해서 임시로 노출해주어야 함"
 *
 * ⚠ **Backend 연동 시 전부 교체된다.** 실제 표지는 서버가 `BookSummary.coverUrl` 로 내려주며
 * (`P3-BIP-15`·`P3-BIP-02`), 그때 이 디렉토리와 `mocks/fixtures/saved-books.ts` 의 매핑을
 * 지운다. 화면 코드는 `coverUrl` 만 보므로 교체 범위가 Mock 레이어 안에 갇혀 있다.
 *
 * | 파일 | 출처 Figma 노드 | 원본 크기 | 표시 크기 |
 * |---|---|---|---|
 * | `the-most-magnificent-idea.png` | `30:74` Library `145:1004` `asset/book-cover` image fill | 500×501 → 239×240 | 58×82 |
 * | `grumpy-monkey-play-all-day.png` | `30:74` Library `113:1977` image fill | 193×193 | 58×82 |
 * | `where-the-wild-things-are.png` | `30:74` Library `113:1982` image fill | 135×193 | 58×82 |
 *
 * 전부 표시 크기의 2배 이상이다 (`D-4` 에셋 파이프라인 해상도 규칙). 원본 비율이 제각각이지만
 * `BookCover` 가 **고정 aspect + `object-fit: cover`** 로 흡수한다 (`D-13 ③` · `QA-2-004`).
 */
import grumpyMonkeyPlayAllDay from './grumpy-monkey-play-all-day.png';
import theMostMagnificentIdea from './the-most-magnificent-idea.png';
import whereTheWildThingsAre from './where-the-wild-things-are.png';

export const BOOK_COVER_ASSETS = {
  'the-most-magnificent-idea': theMostMagnificentIdea,
  'grumpy-monkey-play-all-day': grumpyMonkeyPlayAllDay,
  'where-the-wild-things-are': whereTheWildThingsAre,
} as const;

export type BookCoverAssetName = keyof typeof BOOK_COVER_ASSETS;
