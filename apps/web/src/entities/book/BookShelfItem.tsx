/**
 * `BookShelfItem` — 캐러셀 한 칸 (Library Design Spec §3.3, Figma `113:1971` `[실측]`).
 *
 * ```
 * 표지 (BookCover size="lg" — 퍼센트 폭 · 비 107/151 · radius 12 · --shadow-cover)
 * ↓ gap 8   제목   12 / Semibold / fg-primary  — 1줄 + 말줄임
 * ↓ gap 8   캡션   11 / Regular  / fg-tertiary — 최대 2줄
 * ```
 *
 * **폭을 갖지 않는다.** 캐러셀의 퍼센트 그리드가 열 폭을 정하고 이 컴포넌트는 `100%` 를 받는다
 * (§10 — Figma 자신의 규칙이 `표지 폭 = content × 31.0145%` 다).
 *
 * ── 캡션 줄바꿈 (`AD-S3-5` 보완, §6.3 + 11px 렌더 폭 **실측**) ──
 * Figma 캡션은 `nowrap` 1줄이지만 4대 역량 **표시 라벨**은 더 길다. 11px 실측 폭:
 * `Emotion Regulation` 101.4 · `Cognitive Flexibility` 102.0 · `Intrinsic Motivation` 100.0 ·
 * `Self-Direction` 72.8 (SF Pro) / 100.1 · 101.0 · 98.8 · 71.6 (Inter).
 * → **열 폭 107(Figma 393) 에서는 네 라벨 모두 1줄에 들어간다** (여유 5~7px).
 *   320px 에서는 열 폭이 84.4 로 줄어 `Self-Direction` 을 뺀 셋이 2줄이 된다.
 * 그래서 `nowrap` 을 쓰지 않고 **최대 2줄 + 말줄임**으로 두며, 단어 중간은 끊지 않는다
 * (가장 긴 단어 `Regulation` 55.6 < 84.4 이므로 `break-word` 가 필요하지 않다).
 * 말줄임은 시각 축약일 뿐이고 DOM 에는 전체 라벨이 남으므로 보조기술은 전체를 읽는다.
 *
 * 제목은 **Figma 대로 1줄 + 말줄임**이다 (§6.3 ③) — 길이가 데이터 의존이고 Figma 가
 * `nowrap` 1줄을 명시한다.
 *
 * ── `onPress` (시트 라운드에서 연결) ──
 * §6.1 "캐러셀 항목 탭 → `BookDetailSheet`". 주면 root 가 `<button>` 이 된다. 2라운드-1 은
 * 열 대상이 없어 비대화형으로 뒀고, 시트가 생긴 지금 **같은 기하 그대로** 버튼이 된다 —
 * `book-shelf.css` 가 UA 기본값(면·테두리·padding·폰트·정렬)을 전부 되돌리므로 rest 상태의
 * 렌더 픽셀이 변하지 않는다 (`ListRow` 의 `__content` 선례와 같은 방식).
 *
 * 접근성 이름은 **제목 + 캡션**이다 (§6.3 ⑤ — 캡션은 `line-clamp` 로 시각만 줄어들고 DOM 에
 * 전체가 남으므로 별도 `aria-label` 을 만들지 않는다. 버튼 이름은 자식 텍스트로 계산된다).
 */
import { Text } from '@haru/ui';

import { BookCover } from './BookCover';

export interface BookShelfItemProps {
  title: string;
  author?: string | undefined;
  coverUrl?: string | undefined;
  /**
   * 캡션 2행 — 4대 역량 **표시 라벨**이고, 역량이 없으면 호출 측이 저자명을 넘긴다
   * (`L-OPEN-15`). 라벨 문구는 `shared/copy/capability-copy.ts` 가 소유한다.
   */
  caption?: string | undefined;
  /** 주면 칸 전체가 `<button>` 이 된다 (§6.1 — `BookDetailSheet` 열기). */
  onPress?: (() => void) | undefined;
}

export function BookShelfItem({ title, author, coverUrl, caption, onPress }: BookShelfItemProps) {
  const body = (
    <>
      <BookCover title={title} author={author} coverUrl={coverUrl} size="lg" decorative />
      <Text as="span" variant="caption-1" weight="semibold" tone="primary" truncate={1}>
        {title}
      </Text>
      {caption === undefined ? null : (
        <Text as="span" variant="caption-2" tone="tertiary" truncate={2}>
          {caption}
        </Text>
      )}
    </>
  );

  if (onPress === undefined) return <div className="haru-shelf-item">{body}</div>;

  return (
    <button
      type="button"
      className="haru-shelf-item haru-shelf-item--pressable haru-focus-ring"
      onClick={onPress}
    >
      {body}
    </button>
  );
}
