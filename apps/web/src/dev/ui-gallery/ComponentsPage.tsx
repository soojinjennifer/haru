/**
 * `/__dev/ui/components` — Shared UI 22종 × variant × state 매트릭스 (Design Spec §11-5 · §4.23).
 *
 * dev 전용 화면이다. 제품 화면이 아니므로 도메인 데이터를 쓰지 않고, 문구는 `gallery-copy.ts` 에 모은다.
 * Figma 시각 비교 대상 블록에는 `data-demo` 로 §10.2 의 V-번호를 붙인다.
 */
import {
  AppBackground,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Chip,
  ConfirmDialog,
  Dialog,
  EmptyState,
  ErrorState,
  FieldGroup,
  Icon,
  IconButton,
  InlineAlert,
  PageIndicator,
  ProgressBar,
  RadioGroup,
  Scrim,
  Sheet,
  Skeleton,
  SpeechBubble,
  Spinner,
  Surface,
  Tag,
  Text,
  TextField,
  Toast,
  TopBar,
  useToast,
  type SurfaceFill,
  type SurfaceMaterial,
  type TextVariant,
} from '@haru/ui';
import { useState } from 'react';

import { galleryCopy } from './gallery-copy';
import { Stage2Section } from './Stage2Section';
import { Row, Section, Stack, Stage, SubHead } from './primitives';
import { TabBarDemo } from './TabBarDemo';

const copy = galleryCopy.components;

const TEXT_VARIANTS: readonly TextVariant[] = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption-1',
  'caption-2',
];

const SURFACE_MATERIALS: readonly SurfaceMaterial[] = ['rest', 'raised', 'pressed', 'none'];
const SURFACE_FILLS: readonly SurfaceFill[] = [
  'glass',
  'strong',
  'solid',
  'subtle',
  'tinted',
  'note',
  'none',
];

const RADIO_OPTIONS = [
  { value: 'always', label: 'Almost always' },
  { value: 'often', label: 'Often' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'not-observed', label: 'Not observed yet', variant: 'muted' as const },
  { value: 'na', label: 'Not applicable', disabled: true },
];

function TextSection() {
  return (
    <Section id="v9-text" title="1. Text" note="variant 11 · tone 8 · weight 5 · truncate">
      <Stage plain>
        <Stack>
          {TEXT_VARIANTS.map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}
            </Text>
          ))}
          <Row>
            <Text tone="primary">primary</Text>
            <Text tone="strong">strong</Text>
            <Text tone="secondary">secondary</Text>
            <Text tone="tertiary">tertiary</Text>
            <Text tone="link">link</Text>
            <Text tone="disabled">disabled</Text>
          </Row>
          <Row>
            <Text weight="regular">regular</Text>
            <Text weight="medium">medium</Text>
            <Text weight="semibold">semibold</Text>
            <Text weight="bold">bold</Text>
            <Text weight="heavy">heavy</Text>
          </Row>
          <Text truncate={1}>
            truncate=1 — this sentence is long enough that the single line has to end with an
            ellipsis instead of wrapping onto a second line.
          </Text>
          <Text numeric>0123456789 — tabular numerals</Text>
        </Stack>
      </Stage>
      <Stage>
        <Text tone="on-accent">on-accent (on app gradient)</Text>
      </Stage>
    </Section>
  );
}

function IconSection() {
  return (
    <Section id="v9-icon" title="2. Icon" note="size sm 16 / md 20 / lg 24 · Lucide + HARU SVG">
      <Stage plain>
        <Row>
          <Icon name="settings" size="sm" decorative />
          <Icon name="settings" size="md" decorative />
          <Icon name="settings" size="lg" decorative />
          <Icon name="book" size="lg" label="Library" />
          <Icon name="chart-no-axes-column-increasing" size="lg" label="Progress" />
          <Icon name="haru:tab-center-home" size="lg" label="Home" />
          <Icon name="check" size="md" decorative />
          <Icon name="chevron-left" size="md" decorative />
          <Icon name="chevron-right" size="md" decorative />
          <Icon name="chevron-down" size="md" decorative />
          <Icon name="x" size="md" decorative />
          <Icon name="rotate-ccw" size="md" decorative />
          <Icon name="info" size="md" decorative />
          <Icon name="circle-check" size="md" decorative />
          <Icon name="triangle-alert" size="md" decorative />
          <Icon name="octagon-alert" size="md" decorative />
          <Icon name="wifi-off" size="md" decorative />
        </Row>
        <SubHead>tone</SubHead>
        <Row>
          <Icon name="info" tone="primary" decorative />
          <Icon name="info" tone="secondary" decorative />
        </Row>
      </Stage>
    </Section>
  );
}

function SurfaceSection() {
  return (
    <Section
      id="v2-surface"
      title="3. Surface + AppBackground"
      note="material 4 · fill 7 · radius 6 · interactive (Figma 17:332 / 16:24)"
    >
      <Stage>
        <Stack>
          <Row top>
            {SURFACE_MATERIALS.map((material) => (
              <Surface key={material} material={material} fill="glass" radius="card" padding="4">
                <Text variant="footnote">{material}</Text>
              </Surface>
            ))}
          </Row>
          <Row top>
            {SURFACE_FILLS.map((fill) => (
              <Surface key={fill} material="rest" fill={fill} radius="surface" padding="4">
                <Text variant="footnote">{fill}</Text>
              </Surface>
            ))}
          </Row>
          <Row top>
            <Surface as="button" interactive material="rest" fill="glass" radius="card" padding="4">
              <Text variant="footnote">interactive</Text>
            </Surface>
          </Row>
        </Stack>
      </Stage>
      <SubHead>AppBackground</SubHead>
      <Row top>
        <div className="haru-dev-fixed-container">
          <AppBackground variant="gradient" />
        </div>
        <div className="haru-dev-fixed-container">
          <AppBackground variant="flat" />
        </div>
      </Row>
    </Section>
  );
}

function ButtonSection() {
  return (
    <Section
      id="v1-button"
      title="4. Button + ButtonGroup"
      note="variant accent/glass · size md 45 / lg 56 · rest · disabled · loading · fullWidth (Figma 17:20)"
    >
      <Stage>
        <Stack>
          <Row>
            <Button variant="accent" size="md">
              {copy.buttonLabel}
            </Button>
            <Button variant="accent" size="lg">
              {copy.buttonLabel}
            </Button>
            <Button variant="glass" size="md">
              {copy.secondaryLabel}
            </Button>
            <Button variant="glass" size="lg">
              {copy.secondaryLabel}
            </Button>
          </Row>
          <Row>
            <Button variant="accent" disabled>
              disabled
            </Button>
            <Button variant="glass" disabled>
              disabled
            </Button>
            <Button variant="accent" loading>
              {copy.buttonLabel}
            </Button>
            <Button variant="glass" loading>
              {copy.secondaryLabel}
            </Button>
          </Row>
          <Row>
            <Button leadingIcon={<Icon name="check" size="md" decorative />}>leadingIcon</Button>
            <Button
              variant="glass"
              trailingIcon={<Icon name="chevron-right" size="md" decorative />}
            >
              trailingIcon
            </Button>
          </Row>
          <Button fullWidth size="lg">
            fullWidth
          </Button>
          <SubHead>ButtonGroup</SubHead>
          <ButtonGroup
            layout="inline"
            primary={<Button fullWidth>{copy.buttonLabel}</Button>}
            secondary={
              <Button variant="glass" fullWidth>
                {copy.secondaryLabel}
              </Button>
            }
          />
          <ButtonGroup
            layout="stacked"
            primary={<Button fullWidth>{copy.buttonLabel}</Button>}
            secondary={
              <Button variant="glass" fullWidth>
                {copy.secondaryLabel}
              </Button>
            }
          />
        </Stack>
      </Stage>
    </Section>
  );
}

function IconButtonSection() {
  return (
    <Section
      id="v9-icon-button"
      title="5. IconButton"
      note="variant glass/plain · rest · disabled · loading · 시각 38 / hit area 44 (Figma 78:158)"
    >
      <Stage>
        <Row>
          <IconButton
            icon={<Icon name="chevron-left" size="md" decorative />}
            label={copy.iconButtonBack}
          />
          <IconButton
            icon={<Icon name="settings" size="md" decorative />}
            label={copy.iconButtonSettings}
          />
          <IconButton
            variant="plain"
            icon={<Icon name="x" size="md" decorative />}
            label={copy.iconButtonClose}
          />
          <IconButton
            icon={<Icon name="settings" size="md" decorative />}
            label={copy.iconButtonSettings}
            disabled
          />
          <IconButton
            icon={<Icon name="settings" size="md" decorative />}
            label={copy.iconButtonSettings}
            loading
          />
        </Row>
      </Stage>
    </Section>
  );
}

function TopBarSection() {
  return (
    <Section
      id="v9-top-bar"
      title="6. TopBar"
      note="variant inline · centered · large · pill (Figma 139:2734)"
    >
      <Stage>
        <Stack>
          <TopBar variant="inline" title={copy.topBarTitle} sticky={false} />
          <TopBar
            variant="centered"
            title={copy.topBarTitle}
            sticky={false}
            leading={
              <IconButton
                icon={<Icon name="chevron-left" size="md" decorative />}
                label={copy.iconButtonBack}
              />
            }
            trailing={
              <IconButton
                icon={<Icon name="settings" size="md" decorative />}
                label={copy.iconButtonSettings}
              />
            }
          />
          <TopBar
            variant="large"
            title={copy.topBarTitle}
            subtitle={copy.topBarSubtitle}
            sticky={false}
          />
          <TopBar variant="pill" title={copy.topBarTitle} sticky={false} />
        </Stack>
      </Stage>
    </Section>
  );
}

function FeedbackSection() {
  return (
    <Section
      id="v9-spinner-skeleton"
      title="9. Spinner + Skeleton"
      note="Spinner size 3 · tone 3 / Skeleton shape 4 · lines 1–5 (Figma 없음 — 명세 P-10)"
    >
      <Stage>
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="md" tone="inherit" />
        </Row>
        <SubHead>Skeleton</SubHead>
        <Stack>
          <Skeleton shape="text" lines={1} />
          <Skeleton shape="text" lines={3} />
          <Skeleton shape="rect" />
          <Skeleton shape="circle" />
          <Skeleton shape="card" />
        </Stack>
      </Stage>
      <Stage>
        <Surface material="rest" fill="glass" radius="card" padding="4">
          <Spinner size="md" tone="on-accent" label={galleryCopy.states.loading.srLabel} />
        </Surface>
      </Stage>
    </Section>
  );
}

function StateComponentsSection() {
  return (
    <Section
      id="v9-state-cards"
      title="10–11. ErrorState · EmptyState · InlineAlert"
      note="tone 5 · placement inline/banner (Figma 없음 — 명세)"
    >
      <Stage>
        <Stack>
          <ErrorState
            title={galleryCopy.states.error.title}
            description={galleryCopy.states.error.description}
            retryLabel={galleryCopy.states.error.retryLabel}
            onRetry={() => undefined}
          />
          <ErrorState
            tone="offline"
            announce="status"
            title={galleryCopy.states.offline.title}
            description={galleryCopy.states.offline.description}
          />
          <EmptyState
            title={galleryCopy.states.empty.title}
            description={galleryCopy.states.empty.description}
            action={{ label: galleryCopy.states.empty.actionLabel, onPress: () => undefined }}
          />
          <SubHead>InlineAlert</SubHead>
          <InlineAlert tone="info" title="info" description="Inline placement." />
          <InlineAlert tone="success" title="success" />
          <InlineAlert tone="warning" title="warning" />
          <InlineAlert tone="error" title="error" />
          <InlineAlert
            tone="offline"
            placement="banner"
            title={galleryCopy.states.offline.title}
            description={galleryCopy.states.offline.description}
          />
          <InlineAlert
            tone="info"
            title="with action"
            action={{ label: 'Action', onPress: () => undefined }}
            onDismiss={() => undefined}
            dismissLabel="Dismiss"
          />
        </Stack>
      </Stage>
    </Section>
  );
}

function ToastSection() {
  const toast = useToast();

  return (
    <Section
      id="v9-toast"
      title="12. Toast + ToastProvider"
      note="tone neutral/success/error · action · 자동 해제 4s / 6s (Figma 없음 — 명세)"
    >
      <Stage>
        <Stack>
          <Toast message="neutral" />
          <Toast message="success" tone="success" />
          <Toast message="error" tone="error" />
          <Toast
            message="with action"
            action={{ label: galleryCopy.states.toast.actionLabel, onPress: () => undefined }}
            onDismiss={() => undefined}
            dismissLabel={galleryCopy.states.toast.dismissLabel}
          />
          <Button
            variant="glass"
            onPress={() => {
              toast.show({ message: galleryCopy.states.toast.message });
            }}
          >
            {galleryCopy.states.toast.triggerLabel}
          </Button>
        </Stack>
      </Stage>
    </Section>
  );
}

function FieldSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Sam');
  const [agreed, setAgreed] = useState(false);
  const [answer, setAnswer] = useState<string | null>('often');

  return (
    <Section
      id="v5-field"
      title="13–14 · 17. TextField · FieldGroup · Checkbox · RadioGroup"
      note="empty · filled · helper · error · disabled · trailing (Figma 76:417 · 179:1742 · 179:1788)"
    >
      <Stage>
        <Stack>
          <FieldGroup>
            <TextField
              label={copy.fieldEmailLabel}
              value={email}
              onChange={setEmail}
              type="email"
            />
            <TextField label={copy.fieldNameLabel} value={name} onChange={setName} />
            <TextField
              label={copy.fieldPasswordLabel}
              value="secret"
              onChange={() => undefined}
              type="password"
              trailingAction={{ label: copy.fieldShow, onPress: () => undefined }}
            />
            <TextField
              label="Trailing accessory"
              value=""
              onChange={() => undefined}
              trailingAccessory={<Tag label="Boy" tone="agency" size="xs" />}
            />
          </FieldGroup>
          <FieldGroup>
            <TextField
              label={copy.fieldEmailLabel}
              value=""
              onChange={() => undefined}
              helperText={copy.fieldHelper}
            />
            <TextField
              label={copy.fieldEmailLabel}
              value="not-an-email"
              onChange={() => undefined}
              errorText={copy.fieldError}
            />
            <TextField label="Disabled" value="value" onChange={() => undefined} disabled />
          </FieldGroup>
          <FieldGroup error={copy.fieldError}>
            <TextField label="Group error" value="" onChange={() => undefined} />
          </FieldGroup>

          <SubHead>Checkbox + CheckboxGroup</SubHead>
          <CheckboxGroup legend={copy.checkboxGroupLegend}>
            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              label={copy.checkboxLabel}
              description={copy.checkboxDescription}
            />
            <Checkbox checked onChange={() => undefined} label="checked" />
            <Checkbox checked={false} indeterminate onChange={() => undefined} label="mixed" />
            <Checkbox checked={false} onChange={() => undefined} label="disabled" disabled />
            <Checkbox
              checked={false}
              onChange={() => undefined}
              label="error"
              error="Select this to continue."
            />
          </CheckboxGroup>

          <SubHead>RadioGroup (variant=card)</SubHead>
          <RadioGroup
            legend={copy.radioLegend}
            name="gallery-radio-card"
            options={RADIO_OPTIONS}
            value={answer}
            onChange={setAnswer}
          />
          <SubHead>RadioGroup (variant=list · error)</SubHead>
          <RadioGroup
            legend={copy.radioLegend}
            name="gallery-radio-list"
            variant="list"
            options={RADIO_OPTIONS.slice(0, 3)}
            value={null}
            onChange={() => undefined}
            error="Choose one to continue."
          />
        </Stack>
      </Stage>
    </Section>
  );
}

function TagChipSection() {
  return (
    <Section
      id="v4-tag-chip"
      title="15–16. Tag · Chip"
      note="Tag tone 5 × size 2 / Chip variant 3 × selected (Figma 76:440 · 90:626 · 40:316)"
    >
      <Stage>
        <Stack>
          <Row>
            <Tag label="Emotion Regulation" tone="emotion" />
            <Tag label="Self-Direction" tone="agency" />
            <Tag label="Cognitive Flexibility" tone="flexibility" />
            <Tag label="Intrinsic Motivation" tone="motivation" />
            <Tag label="Neutral" tone="neutral" />
          </Row>
          <Row>
            <Tag label="Emotion" tone="emotion" size="xs" />
            <Tag label="Agency" tone="agency" size="xs" />
            <Tag label="Flexibility" tone="flexibility" size="xs" />
            <Tag label="Motivation" tone="motivation" size="xs" />
            <Tag label="Neutral" tone="neutral" size="xs" />
          </Row>
          <Row>
            <Tag
              label="leadingIcon"
              tone="agency"
              leadingIcon={<Icon name="check" size="sm" decorative />}
            />
            <Tag
              label="trailingIcon"
              tone="flexibility"
              trailingIcon={<Icon name="chevron-down" size="sm" decorative />}
            />
          </Row>
          <SubHead>Chip</SubHead>
          <Row>
            <Chip label="filled" variant="filled" />
            <Chip label="filled selected" variant="filled" selected />
            <Chip label="outline" variant="outline" />
            <Chip label="outline selected" variant="outline" selected />
            <Chip label="glass" variant="glass" />
            <Chip label="glass selected" variant="glass" selected />
            <Chip label="disabled" variant="outline" disabled />
            <Chip
              label="leadingIcon"
              variant="outline"
              leadingIcon={<Icon name="chevron-down" size="sm" decorative />}
            />
          </Row>
        </Stack>
      </Stage>
    </Section>
  );
}

function ProgressSection() {
  return (
    <Section
      id="v7-progress"
      title="18–19. ProgressBar · PageIndicator"
      note="tone 2 × size 2 · indeterminate · dots(표시 전용, S1-G-1) (Figma 179:1779 · 88:789)"
    >
      <Stage>
        <Stack>
          <ProgressBar value={3} max={10} label={copy.progressLabel} />
          <ProgressBar value={3} max={10} label={copy.progressLabel} showValue />
          <ProgressBar value={7} max={10} label={copy.progressLabel} size="sm" tone="neutral" />
          <ProgressBar value={null} label={copy.progressLabel} />
          <SubHead>PageIndicator</SubHead>
          <PageIndicator count={3} index={1} label={copy.pageIndicatorLabel} />
        </Stack>
      </Stage>
    </Section>
  );
}

function BubbleSection() {
  return (
    <Section
      id="v6-bubble"
      title="20. SpeechBubble"
      note="tail bottom-right · top-center · none × align (Figma 88:721)"
    >
      <Stage>
        <Stack>
          <SpeechBubble tail="bottom-right">{copy.bubbleText}</SpeechBubble>
          <SpeechBubble tail="top-center" align="center">
            {copy.bubbleText}
          </SpeechBubble>
          <SpeechBubble>{copy.bubbleText}</SpeechBubble>
        </Stack>
      </Stage>
    </Section>
  );
}

function OverlaySection() {
  const [sheet, setSheet] = useState<'bottom' | 'full' | null>(null);
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <Section
      id="v9-overlay"
      title="21–22. Sheet + Scrim · Dialog + ConfirmDialog"
      note="focus trap · Esc · scrim level 2 (Figma 부분 88:960 / Dialog 없음 — 명세)"
    >
      <Stage>
        <Stack>
          <Row>
            <Button
              variant="glass"
              onPress={() => {
                setSheet('bottom');
              }}
            >
              {copy.sheetTrigger}
            </Button>
            <Button
              variant="glass"
              onPress={() => {
                setSheet('full');
              }}
            >
              {copy.sheetTrigger} (full)
            </Button>
            <Button
              variant="glass"
              onPress={() => {
                setDialog(true);
              }}
            >
              {copy.dialogTrigger}
            </Button>
            <Button
              variant="glass"
              onPress={() => {
                setConfirm(true);
              }}
            >
              {galleryCopy.states.dialog.triggerLabel}
            </Button>
          </Row>
          <SubHead>Scrim (정적 렌더)</SubHead>
          <Row top>
            <div className="haru-dev-fixed-container">
              <Scrim level="sheet" />
            </div>
            <div className="haru-dev-fixed-container">
              <Scrim level="dialog" />
            </div>
          </Row>
        </Stack>
      </Stage>

      <Sheet
        open={sheet !== null}
        variant={sheet ?? 'bottom'}
        title={copy.sheetTitle}
        onClose={() => {
          setSheet(null);
        }}
      >
        <Text variant="body">{copy.sheetBody}</Text>
      </Sheet>

      <Dialog
        open={dialog}
        title={copy.dialogTitle}
        description={copy.dialogDescription}
        onClose={() => {
          setDialog(false);
        }}
      >
        <ButtonGroup
          primary={
            <Button
              fullWidth
              onPress={() => {
                setDialog(false);
              }}
            >
              {copy.dialogConfirm}
            </Button>
          }
          secondary={
            <Button
              variant="glass"
              fullWidth
              onPress={() => {
                setDialog(false);
              }}
            >
              {copy.dialogCancel}
            </Button>
          }
        />
      </Dialog>

      <ConfirmDialog
        open={confirm}
        destructive
        title={galleryCopy.states.dialog.title}
        description={galleryCopy.states.dialog.description}
        confirmLabel={galleryCopy.states.dialog.confirmLabel}
        cancelLabel={galleryCopy.states.dialog.cancelLabel}
        onConfirm={() => {
          setConfirm(false);
        }}
        onCancel={() => {
          setConfirm(false);
        }}
      />
    </Section>
  );
}

export function ComponentsPage() {
  return (
    <>
      <p className="haru-dev-lede">
        Stage 1 Design Spec §4.23 의 22종 + Stage 2 Design Spec §4 의 신규 6종을 variant · state
        별로 렌더한다. 시각 비교 대상은 `data-demo` 속성으로 §10.2 의 V-번호와 Stage 2 §11.2 의
        `s2-*` id 를 가진다.
      </p>
      <TextSection />
      <IconSection />
      <SurfaceSection />
      <ButtonSection />
      <IconButtonSection />
      <TopBarSection />
      <Section
        id="v9-app-column"
        title="7. AppColumn"
        note="min 320 / max 480 / gutter 24 — 실제 폭 검증은 /__dev/ui/responsive 와 Playwright viewport 4종"
      >
        <Stage plain>
          <Text variant="footnote">
            AppColumn 은 이 gallery 의 모든 Stage · ScreenFrame 이 이미 사용하고 있다.
          </Text>
        </Stage>
      </Section>
      <TabBarDemo />
      <FeedbackSection />
      <StateComponentsSection />
      <ToastSection />
      <FieldSection />
      <TagChipSection />
      <ProgressSection />
      <BubbleSection />
      <OverlaySection />
      <Stage2Section />
    </>
  );
}
