/**
 * `/__dev/ui/responsive` — 320 / 393 / 600 / 1024 프레임 (Design Spec §7.2 · AC-1-23).
 *
 * iframe 은 각자 독립된 viewport 를 가지므로 `@media` 조건이 실제로 적용된다.
 * (CSS 폭만 줄인 박스는 breakpoint 를 재현하지 못한다.)
 *
 * 기계적 검증은 Playwright 가 **진짜 viewport 4종**으로 `/__dev/ui/frame` 을 열어 수행한다.
 * 이 화면은 사람이 네 폭을 한 번에 훑기 위한 자료다.
 */
import { Text } from '@haru/ui';

import { galleryCopy } from './gallery-copy';
import { Section } from './primitives';

/** Design Spec §7.2 폭별 기대 레이아웃 표. */
const FRAMES = [
  { width: 320, expectation: 'column 320 / content 272 · 가로 스크롤 0' },
  { width: 393, expectation: 'column 393 / content 345 · Figma 기준값과 1:1' },
  { width: 600, expectation: 'column 480 / content 432 · 가운데 정렬' },
  { width: 1024, expectation: 'column 480 / content 432 · md 와 동일, 다단 없음' },
] as const;

const FRAME_SRC = '/__dev/ui/frame';

export function ResponsivePage() {
  return (
    <>
      <p className="haru-dev-lede">
        각 프레임은 독립 viewport 를 가진 iframe 이다. 앱 컬럼은 min 320 / max 480 / gutter 24 이며
        600px 이상에서 가운데 정렬된다. 다단 레이아웃은 없다 (Stage 0 #12).
      </p>

      {FRAMES.map((frame) => (
        <Section
          key={frame.width}
          id={`v9-responsive-${frame.width}`}
          title={galleryCopy.responsive.frameLabel(frame.width)}
          note={frame.expectation}
        >
          <div className="haru-dev-iframe-scroller">
            <iframe
              className="haru-dev-iframe"
              src={FRAME_SRC}
              width={frame.width}
              title={galleryCopy.responsive.frameLabel(frame.width)}
              loading="eager"
            />
          </div>
        </Section>
      ))}

      <Section
        id="v9-responsive-note"
        title="측정 기준"
        note="Playwright 가 같은 화면을 실제 viewport 4종으로 열어 폭을 측정한다 (AC-1-23)."
      >
        <Text variant="footnote" tone="secondary">
          `/__dev/ui/frame` 의 readout 요소가 `data-viewport` · `data-column-width` ·
          `data-content-width` 를 노출한다.
        </Text>
      </Section>
    </>
  );
}
