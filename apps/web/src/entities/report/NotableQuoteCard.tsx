/**
 * `NotableQuoteCard` — Stage 7 Spec §3.6 (Figma `163:2633` "Moment of the week", 리포트 상세 인용 `S7-D` 재사용).
 *
 * | 항목 | Figma | 구현 |
 * |---|---|---|
 * | 면 | teal 16% · border 1px teal 35% · **그림자 0** | `--color-surface-moment` · `--color-border-moment` (`T7-7`) |
 * | radius · pad · gap | 24 · 16 · 7 | `--radius-surface` 22 (`AD7-10`) · `--space-4` · `--moment-card-gap` |
 * | eyebrow | Semibold 11 · tracking 0.4 · `#6f8c88` | `caption-2` semibold · `--moment-eyebrow-tracking` · `--color-fg-secondary` (`N7-32` ⓐ, `AD7-8`) |
 * | 인용 | Medium 14/21 primary | `--moment-quote-size` / `--moment-quote-line` (`T7-7`) |
 * | 출처 | Regular 12 secondary | `Text caption-1 secondary` |
 *
 * 문구는 전부 prop — 인용·이름·책 제목은 **서버 값**이고 Frontend 가 가공하지 않는다 (`architecture.md` §8).
 * 바깥 따옴표와 ` — {이름}` 결합만 화면 포맷이다 (Spec §3.6). 대비는 가값 `P-37`.
 */
import { Text } from '@haru/ui';

export interface NotableQuoteCardProps {
  /** 대문자 eyebrow (copy 가 대문자로 준다 — 예 *"MOMENT OF THE WEEK"*). */
  eyebrow: string;
  quote: string;
  speakerName: string;
  /** 포맷된 출처 (예 *"Tue · The Most Magnificent Thing, p.14"*). */
  source: string;
}

export function NotableQuoteCard({ eyebrow, quote, speakerName, source }: NotableQuoteCardProps) {
  return (
    <figure className="haru-notable-quote">
      <Text as="p" variant="caption-2" weight="semibold" tone="secondary">
        <span className="haru-notable-quote__eyebrow">{eyebrow}</span>
      </Text>
      <blockquote className="haru-notable-quote__quote">
        <p>
          {'“'}
          {quote}
          {'”'} {'—'} {speakerName}
        </p>
      </blockquote>
      <figcaption>
        <Text as="span" variant="caption-1" tone="secondary">
          {source}
        </Text>
      </figcaption>
    </figure>
  );
}
