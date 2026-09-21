/**
 * dev 전용 번들 표식 — `pnpm assert:no-mocks` 가 `apps/web/dist/**` 에서 이 문자열을 찾아
 * 1건이라도 나오면 실패한다 (AC-1-42: gallery · Scenario Panel 이 Production 빌드에 포함되지 않음).
 *
 * `src/mocks/index.ts` 의 `__HARU_MOCK_SENTINEL__` 과 같은 역할이며, 값을 바꾸면
 * `scripts/assert-no-mocks.mjs` 도 함께 바꾼다.
 */
export const __HARU_DEV_SENTINEL__ = '__HARU_DEV_SENTINEL__';
