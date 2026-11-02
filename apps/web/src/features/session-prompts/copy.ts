/**
 * `features/session-prompts` 사용자 노출 문구 — 영어 1차 (`rules/frontend.md` §8).
 *
 * | 키 | 근거 |
 * |---|---|
 * | `title` | 팝업 제목 줄 `296:1258` **copy 모듈 고정 라벨** `Try this prompt!`(`!` 앞 공백 없음) — `D4-55` (AC-4-131) |
 * | `seeAll` | `300:1308` 시안 원문 `See all prompts` — `D4-52` · `D4-58` CP-1 |
 * | `drawer.title` | Drawer `88:671` 원문 `Prompts of this session ` — **끝 공백 1개는 뺐다**(시각 차이 0, Stage 4 Spec §12.4-⑩) |
 * | `drawer.subtitle` | Drawer `88:673` 원문 그대로 |
 * | `drawer.carousel` · `previous` · `next` · `position` | 접근성 이름 — Figma 에 없는 보이지 않는 문구 (`D4-58` NB-8 시안 외 문구) |
 *
 * Prompt 문구는 여기에 없다 — **서버(Mock) 응답 값만** 표시한다 (`rules/architecture.md` §8).
 * ready 버블 제목 줄(서버 인사)과는 출처가 다르다 (`D4-55` 가 `D4-22` 리터럴 금지 범위를 ready 버블로 한정).
 */
export const sessionPromptsCopy = {
  title: 'Try this prompt!',
  seeAll: 'See all prompts',
  drawer: {
    title: 'Prompts of this session',
    subtitle: 'Just read one aloud when feels right - no rush.',
    carousel: 'Prompts',
    previous: 'Previous prompt',
    next: 'Next prompt',
    position: (index: number, count: number) => `Prompt ${String(index + 1)} of ${String(count)}`,
  },
} as const;
