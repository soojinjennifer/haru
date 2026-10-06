/**
 * `CoachingNote` — Design Spec §5.5 (Figma `86:527` pink · `86:482` 설명 블록 beige).
 *
 * 문구는 **서버 값만** 표시한다. `eyebrow` 는 선택이며 **대문자 변환을 CSS 로 하지 않는다**
 * (스크린리더 철자 단위 발음 회피) — 대문자가 필요하면 copy 값 자체가 대문자다.
 */
import { Surface, Text } from '@haru/ui';

export type CoachingNoteTone = 'pink' | 'neutral';

export interface CoachingNoteProps {
  children: string;
  tone?: CoachingNoteTone;
  eyebrow?: string;
}

export function CoachingNote({ children, tone = 'neutral', eyebrow }: CoachingNoteProps) {
  return (
    <Surface
      fill={tone === 'pink' ? 'tinted' : 'note'}
      material="none"
      radius="control"
      padding="4"
    >
      <div className="haru-coaching-note">
        {eyebrow === undefined ? null : (
          <Text as="span" variant="caption-2" tone="secondary" weight="semibold">
            {eyebrow}
          </Text>
        )}
        <Text variant="footnote">{children}</Text>
      </div>
    </Surface>
  );
}
