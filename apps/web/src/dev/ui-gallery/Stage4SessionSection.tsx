/**
 * `/__dev/ui/components` — Stage 4b 세션 화면 Shared UI 확장 (4b Design Spec §2.5 · §4 #1 · #2).
 *
 * dev 전용이다. 시각 비교 블록 id 는 `s4-*` (영역 클립 baseline — `D-12`).
 *  - `s4-record-control` — RecordControl **5변형** (`163:1589` Record · `163:1588` Pause · `298:1227` Paused ·
 *    `298:1236` Disabled · `298:1245` PermissionDenied). AC-4-138 의 변형 대조 대상이다 — 세션 화면에서는
 *    `disabled`·`permission-denied` 연결이 `S4-H2` 이므로 5변형을 한 자리에서 본다.
 *  - `s4-button-sm` — `Button size="sm"` (Prompts 칩 `298:1314`).
 */
import { Button, Icon, RecordControl, type RecordControlState } from '@haru/ui';

import { galleryCopy } from './gallery-copy';
import { Row, Section, Stack, Stage, SubHead } from './primitives';

const copy = galleryCopy.stage4Session;

const VARIANTS: readonly { state: RecordControlState; label: string; caption?: string }[] = [
  { state: 'idle', label: copy.recordStart, caption: copy.captionRecord },
  { state: 'recording', label: copy.recordPause },
  { state: 'paused', label: copy.recordResume, caption: copy.captionResume },
  { state: 'disabled', label: copy.recordStart, caption: copy.captionRecord },
  { state: 'permission-denied', label: copy.micOff, caption: copy.captionMicOff },
];

function RecordControlSection() {
  return (
    <Section
      id="s4-record-control"
      title="33. RecordControl (5 states)"
      note="idle 163:1589 · recording 163:1588 · paused 298:1227 · disabled 298:1236 (opacity .5 + 코어 그림자 0) · permission-denied 298:1245 (gray-2 + mic-off)"
    >
      <Stage>
        <Row>
          {VARIANTS.map((variant) => (
            <Stack key={variant.state}>
              <SubHead>{variant.state}</SubHead>
              <RecordControl
                state={variant.state}
                label={variant.label}
                {...(variant.caption === undefined ? {} : { caption: variant.caption })}
              />
            </Stack>
          ))}
        </Row>
      </Stage>
    </Section>
  );
}

function ButtonSmSection() {
  return (
    <Section
      id="s4-button-sm"
      title="34. Button size=sm (Prompts chip)"
      note="117×36 · pad 14/16 · gap 6 · 아이콘 18 (stroke 1.5) · 15 Semibold · --shadow-bubble · hit 44 (Figma 298:1314)"
    >
      <Stage>
        <Row>
          <Button
            variant="glass"
            size="sm"
            leadingIcon={<Icon name="message-square-text" decorative />}
          >
            {copy.prompts}
          </Button>
        </Row>
      </Stage>
    </Section>
  );
}

export function Stage4SessionSection() {
  return (
    <>
      <RecordControlSection />
      <ButtonSmSection />
    </>
  );
}
