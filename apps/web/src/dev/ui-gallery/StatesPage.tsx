/**
 * `/__dev/ui/states` — 공통 상태 6종을 **실제 화면 컨텍스트**(AppColumn + TopBar + 콘텐츠 영역)에서
 * §5.1–§5.6 레이아웃 그대로 보여 준다 (Design Spec §5, 가값 P-10 승인 자료).
 *
 * 두 종류의 블록이 있다.
 *  ① 정적 6종 — 결정적이라 Playwright 시각 baseline 대상이다 (`data-demo="v9-state-*"`).
 *  ② live 블록 — `useHealth` 를 통해 Mock scenario 5종이 만드는 실제 UI 전이를 확인한다 (AC-1-38).
 *
 * `?scenario=__states:<key>` 를 주면 해당 상태 하나만 렌더한다 (§5.7).
 */
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  InlineAlert,
  Skeleton,
  Surface,
  Text,
  TopBar,
  useToast,
} from '@haru/ui';
import { useState } from 'react';

import { useHealth } from '../../entities/health';
import { readScenarioPanelValue } from '../../mocks/scenarios';
import { errorCopyForCode, networkErrorCopy } from '../../shared/copy/error-copy';
import { env } from '../../shared/lib/env';
import { statesScenarioGroup, type StatesScenarioKey } from '../scenario-panel/devScenarios';
import { resolveSelection } from '../scenario-panel/scenario-selection';

import { galleryCopy } from './gallery-copy';
import { ScreenFrame, Section, Stack } from './primitives';

const copy = galleryCopy.states;

function DemoTopBar() {
  return (
    <TopBar
      variant="centered"
      title={copy.screenTitle}
      sticky={false}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={galleryCopy.components.iconButtonBack}
        />
      }
    />
  );
}

/** §5.1 — TopBar 는 즉시 실제 값, 콘텐츠 영역만 Skeleton. 레이아웃 점프 0. */
function LoadingState() {
  return (
    <ScreenFrame topBar={<DemoTopBar />}>
      <div aria-busy="true">
        <Stack>
          <Skeleton shape="text" lines={1} />
          <Skeleton shape="card" />
          <Skeleton shape="text" lines={3} />
          <Skeleton shape="card" />
        </Stack>
        <span className="haru-visually-hidden" role="status">
          {copy.loading.srLabel}
        </span>
      </div>
    </ScreenFrame>
  );
}

/** §5.2 — 콘텐츠 영역 세로 가운데. */
function EmptyStateDemo() {
  return (
    <ScreenFrame topBar={<DemoTopBar />} center>
      <EmptyState
        title={copy.empty.title}
        description={copy.empty.description}
        action={{ label: copy.empty.actionLabel, onPress: () => undefined }}
      />
    </ScreenFrame>
  );
}

/** §5.3 — 재시도 버튼은 카드 내부 하단. */
function ErrorStateDemo() {
  return (
    <ScreenFrame topBar={<DemoTopBar />} center>
      <ErrorState
        title={copy.error.title}
        description={copy.error.description}
        retryLabel={copy.error.retryLabel}
        onRetry={() => undefined}
      />
    </ScreenFrame>
  );
}

/** §5.4 — TopBar 바로 아래 sticky 배너. 수동 닫기 없음. */
function OfflineStateDemo() {
  return (
    <ScreenFrame
      topBar={
        <>
          <DemoTopBar />
          <InlineAlert
            tone="offline"
            placement="banner"
            title={copy.offline.title}
            description={copy.offline.description}
          />
        </>
      }
    >
      <Surface material="rest" fill="strong" radius="card" padding="6">
        <Text variant="subheadline" tone="secondary">
          Content stays on screen while the banner is shown.
        </Text>
      </Surface>
    </ScreenFrame>
  );
}

/** §5.5 — 되돌릴 필요 없는 짧은 확인. */
function ToastStateDemo() {
  const toast = useToast();

  return (
    <ScreenFrame topBar={<DemoTopBar />} center>
      <Button
        variant="glass"
        onPress={() => {
          toast.show({
            message: copy.toast.message,
            action: { label: copy.toast.actionLabel, onPress: () => undefined },
            dismissLabel: copy.toast.dismissLabel,
          });
        }}
      >
        {copy.toast.triggerLabel}
      </Button>
    </ScreenFrame>
  );
}

/** §5.6 — 되돌릴 수 없는 행동 확인만. */
function DialogStateDemo({ onOpen }: { onOpen: () => void }) {
  return (
    <ScreenFrame topBar={<DemoTopBar />} center>
      <Button variant="glass" onPress={onOpen}>
        {copy.dialog.triggerLabel}
      </Button>
    </ScreenFrame>
  );
}

/**
 * Mock scenario 가 만드는 실제 UI 전이 (AC-1-38).
 * Adapter 는 `ApiClientProvider` 가 주입한 것을 그대로 쓴다 — gallery 는 Mock 을 직접 만들지 않는다.
 */
function LiveHealthState() {
  const health = useHealth();

  if (health.isOffline) {
    return (
      <ScreenFrame
        topBar={
          <>
            <DemoTopBar />
            <InlineAlert
              tone="offline"
              placement="banner"
              title={networkErrorCopy.title}
              description={networkErrorCopy.description}
            />
          </>
        }
      >
        <div data-health-state="offline" />
      </ScreenFrame>
    );
  }

  if (health.isPending) {
    return (
      <ScreenFrame topBar={<DemoTopBar />}>
        <div aria-busy="true" data-health-state="loading">
          <Stack>
            <Skeleton shape="text" lines={1} />
            <Skeleton shape="card" />
          </Stack>
        </div>
      </ScreenFrame>
    );
  }

  if (health.isError) {
    const message = errorCopyForCode(health.errorCode);

    return (
      <ScreenFrame topBar={<DemoTopBar />} center>
        <div data-health-state="error">
          <ErrorState
            title={message.title}
            description={message.description}
            retryLabel={copy.live.retryLabel}
            retrying={health.isFetching}
            onRetry={health.refetch}
          />
        </div>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame topBar={<DemoTopBar />}>
      <Surface material="rest" fill="strong" radius="card" padding="6">
        <div data-health-state="success">
          <Stack>
            <Text variant="headline">{copy.live.okLabel}</Text>
            <Text variant="footnote" tone="secondary">
              {health.data?.status} · {health.data?.version}
            </Text>
            <Text variant="caption-1" tone="tertiary" numeric>
              {health.data?.serverTime}
            </Text>
          </Stack>
        </div>
      </Surface>
    </ScreenFrame>
  );
}

type StateSectionKey = StatesScenarioKey | 'toast' | 'dialog';

const STATE_SECTIONS: readonly {
  key: StateSectionKey;
  id: string;
  title: string;
  note: string;
}[] = [
  {
    key: 'loading',
    id: 'v9-state-loading',
    title: '§5.1 Loading (Skeleton)',
    note: 'TopBar 즉시 렌더 · 콘텐츠만 Skeleton',
  },
  { key: 'empty', id: 'v9-state-empty', title: '§5.2 Empty', note: '콘텐츠 영역 세로 가운데' },
  {
    key: 'error',
    id: 'v9-state-error',
    title: '§5.3 Error + Retry',
    note: '재시도 버튼은 카드 내부 하단',
  },
  {
    key: 'offline',
    id: 'v9-state-offline',
    title: '§5.4 Offline Banner',
    note: 'TopBar 바로 아래 sticky · 수동 닫기 없음',
  },
  { key: 'toast', id: 'v9-state-toast', title: '§5.5 Toast', note: '되돌릴 필요 없는 짧은 확인' },
  {
    key: 'dialog',
    id: 'v9-state-dialog',
    title: '§5.6 Dialog',
    note: '되돌릴 수 없는 행동 확인',
  },
];

function StateSectionBody({
  sectionKey,
  onOpenDialog,
}: {
  sectionKey: StateSectionKey;
  onOpenDialog: () => void;
}) {
  switch (sectionKey) {
    case 'loading':
      return <LoadingState />;
    case 'empty':
      return <EmptyStateDemo />;
    case 'error':
      return <ErrorStateDemo />;
    case 'offline':
      return <OfflineStateDemo />;
    case 'toast':
      return <ToastStateDemo />;
    case 'dialog':
      return <DialogStateDemo onOpen={onOpenDialog} />;
    case 'success':
    case 'retry':
      return <LiveHealthState />;
  }
}

export function StatesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const selection = resolveSelection([statesScenarioGroup], {
    search: globalThis.location?.search ?? '',
    panelValue: readScenarioPanelValue(),
    envValue: env.mockScenario,
  });

  const focus = selection[statesScenarioGroup.group];
  // 기본값(`success`)이면 전체를, 특정 key 를 지정하면 그 상태만 보여 준다 (§5.7).
  const visible =
    focus === undefined || focus === statesScenarioGroup.defaultKey
      ? STATE_SECTIONS
      : STATE_SECTIONS.filter((section) => section.key === focus);

  return (
    <>
      <p className="haru-dev-lede">
        Design Spec §5 의 공통 상태 6종. `?scenario=__states:empty` 처럼 지정하면 해당 상태만
        렌더한다. 아래 live 블록은 `?scenario=health:loading|error|retry|offline` 로 Mock 이 만드는
        실제 전이를 보여 준다.
      </p>

      {visible.map((section) => (
        <Section key={section.id} id={section.id} title={section.title} note={section.note}>
          <StateSectionBody
            sectionKey={section.key}
            onOpenDialog={() => {
              setDialogOpen(true);
            }}
          />
        </Section>
      ))}

      <Section
        id="v9-state-live"
        title={copy.live.title}
        note="useHealth → healthApi → Mock Adapter (Adapter 선택은 ApiClientProvider 한 곳)"
      >
        <LiveHealthState />
      </Section>

      <ConfirmDialog
        open={dialogOpen}
        destructive
        title={copy.dialog.title}
        description={copy.dialog.description}
        confirmLabel={copy.dialog.confirmLabel}
        cancelLabel={copy.dialog.cancelLabel}
        onConfirm={() => {
          setDialogOpen(false);
        }}
        onCancel={() => {
          setDialogOpen(false);
        }}
      />
    </>
  );
}
