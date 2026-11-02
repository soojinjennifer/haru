/**
 * `AttendanceStickerChip` — 출석 스티커 칩 (Figma `29:79`, Stage 4 Spec §2.7.1, FR-19).
 *
 * 표시만 한다 — 제목·부제는 `StickerAward` 응답 값이다 (`D4-2`, `D4-10`, `AD-S4-1`). streak·일차 문구를 쓰지
 * 않으며 Frontend fallback 문구도 없다. 타일 아이콘은 장식이고, 지급 사실은 `role="status"` 로 알린다 (§9).
 */
import { Icon } from '@haru/ui';
import type { StickerAward } from '@haru/contracts';

export interface AttendanceStickerChipProps {
  sticker: Pick<StickerAward, 'title' | 'message'>;
}

export function AttendanceStickerChip({ sticker }: AttendanceStickerChipProps) {
  return (
    <div className="haru-attendance-sticker" role="status">
      <span className="haru-attendance-sticker__tile">
        <Icon name="haru:sticker-thumb" size="md" decorative />
      </span>
      <span className="haru-attendance-sticker__text">
        <span className="haru-attendance-sticker__title">{sticker.title}</span>
        <span className="haru-attendance-sticker__message">{sticker.message}</span>
      </span>
    </div>
  );
}
