/**
 * Activity Card 덱 문구 — Figma `163:2648` · `86:482` 재대조(2026-10-05).
 *
 * 규칙 (`rules/frontend.md` §8 · Design Spec §10)
 *  - **서버가 만든 문장은 여기에 없다.** 추천 이유 · 코칭 문장 · Prompt · 캐릭터 버블은
 *    API(Mock) 응답 값만 표시한다 (`AC-3-13`).
 *  - 진단·판정·비교 표현 금지. 개발 단계를 드러내는 문구도 금지한다.
 *
 * 1차 구현에서 **사라진 문구** (Figma 에 없다 — 최우선 규칙 2)
 *  - `Pick a time` · Reading Context 라벨 → 그 자리는 Figma 의 **`★ Save`** 다.
 *    Reading Context 진입점은 Stage 3 에서 **이월**되었다 (approvals §12.3 ⑧).
 *  - `Show all N prompts` / `Show fewer` → Figma 앞면은 pill 을 전부 노출한다 (`N-2` 폐기).
 *  - `This card was prepared for …` → 파란 안내 카드 삭제 (`AC-3-11` 폐기).
 *  - `No book tonight`(`conversation_only` 종류 표식) → 그 옵션 자체가 폐지되었다 (§12.12).
 */
import type { ActivityOptionKind } from '@haru/contracts';

/**
 * 대체 카드의 **종류 표식**. 색 단독으로 종류를 전달하지 않으므로 라벨 + 아이콘이다.
 * `book` 은 기본값이라 표식이 없다.
 *
 * ⚠ Figma 카드 앞면(`163:2649`)에는 이 표식 자리가 **없다** — Cardtitle 행은 역량 Tag 와
 * flip 버튼뿐이다. 그래서 Stage 3 Home 은 이 표식을 **렌더하지 않고**, 라벨만 보존해
 * 카드 접근성 이름에 쓴다 (`reread_book` 임이 전달되어야 하므로).
 */
const KIND_LABELS: Readonly<Record<ActivityOptionKind, string | null>> = {
  book: null,
  reread_book: 'Read again',
};

export const activityDeckCopy = {
  deck: {
    label: "Tonight's options",
    /** 트랙 위치 알림 (§2.3) — `aria-live="polite"`. */
    announcement: (position: number, total: number, title: string): string =>
      `Option ${String(position)} of ${String(total)}: ${title}`,
    /** 카드별 접근성 이름. 재독 카드는 그 사실을 이름에 담는다. */
    itemLabel: (
      position: number,
      total: number,
      title: string,
      kindLabel: string | null,
    ): string =>
      kindLabel === null
        ? `Option ${String(position)} of ${String(total)}: ${title}`
        : `Option ${String(position)} of ${String(total)}: ${title} (${kindLabel})`,
    kindLabel: (kind: ActivityOptionKind) => KIND_LABELS[kind],
  },

  card: {
    /** 앞면 flip 버튼 (Figma `flip_to_back`). */
    showBack: 'Show prompts and coaching notes',
    /** 뒷면 flip 버튼. */
    showFront: 'Show the book',
    /** 뒷면 제목 — Figma `86:482` 문구 그대로 (**단수형**). */
    backTitle: 'Prompt of this book',
    /** Prompt 목록 블록의 접근성 이름. */
    promptsLabel: "Tonight's prompts",
    /** `★ Save` (Figma `I86:373;117:973`). 저장됨 문구는 Figma 에 없다 (`D-REQ-1b`). */
    save: 'Save',
    saved: 'Saved',
    saveFailed: "We couldn't save that book. Try again.",
    /**
     * 주 CTA. **Stage 3 에서는 비활성**이다 (`CONFIRMED (D-3)`) — 실제 세션 시작은 Stage 4.
     *
     * `reason` 은 **의도적으로 비어 있다**: D-3 이 "설명 슬롯이 비면 설명 없이 `aria-disabled`
     * 만 적용한다" 로 확정했고, "곧 나옵니다" 류는 사용자 노출 문구에 개발 단계를 드러내므로
     * 기각되었다 (D-3 대안 ③). 운영 문구가 정해지면 **이 값만** 채운다.
     */
    startSession: { label: 'Start Session', reason: null as string | null },
  },

  states: {
    emptyTitle: 'No card for today yet.',
    emptyDescription: "It will appear here once today's options are ready.",
    errorTitle: "We couldn't load today's options.",
    retry: 'Try again',
    offlineTitle: "You're offline.",
    offlineDescription: "We'll load today's options when the connection is back.",
    /**
     * 오프라인 + 최근 카드 캐시 (`D-11`, AC-4-82) — TopBar 밑 Offline Banner (Stage 1 §5.4 패턴).
     * **제목 없이 1줄** — 본문(`description`) 없음 (`D4-32` · `D4-37`, 2026-10-18 사용자 결정,
     * `docs/design/stage-4a-visual-gap-s4j.md` §6.1). 320px 텍스트 자리 206px 에 1줄로 들어간다.
     */
    cachedTitle: 'Go online to start a session',
  },
} as const;
