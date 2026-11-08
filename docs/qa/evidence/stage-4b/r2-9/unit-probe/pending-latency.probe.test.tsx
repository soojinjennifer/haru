/** R2-9 probe — openReady(session-recording.test.tsx 와 같은 절차)의 마지막 대기만 15s 로 늘려 실제 소요를 잰다. */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { appendFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../../../../../../apps/web/src/app/router';
import { activityDeckCopy } from '../../../../../../apps/web/src/features/activity-card-deck';
import { storytimeSessionCopy } from '../../../../../../apps/web/src/features/storytime-session';
import { ROUTES } from '../../../../../../apps/web/src/shared/config/routes';
import { createHarness } from '../../../../../../apps/web/src/test/harness';
import { createManualScheduler } from '../../../../../../apps/web/src/test/manual-scheduler';

const OUT = '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/r2-9/unit-probe/latency.txt';

describe('R2-9 pending latency', () => {
  it.each(Array.from({ length: 25 }, (_, i) => i))('run %i', async (i) => {
    const time = createManualScheduler(Date.now());
    const harness = createHarness({ initialEntries: [ROUTES.home], recorderTime: time });
    await harness.bundle.authGateway.signInWithEmail({ email: 'sam@example.com', password: 'sunny-evening-8' });
    const Wrapper = harness.wrapper;
    render(<Wrapper><AppRoutes /></Wrapper>);
    await waitFor(() => {
      expect(document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)')).not.toBeNull();
    }, { timeout: 15_000 });
    const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
    fireEvent.click(within(front).getByRole('button', { name: activityDeckCopy.card.startSession.label }));
    const sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title }, { timeout: 15_000 });
    fireEvent.click(within(sheet).getByRole('radio', { name: activityDeckCopy.readingContext.options.bedtime }));
    const t0 = performance.now();
    fireEvent.click(within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm }));
    let sawPending = false;
    await waitFor(() => {
      if (document.querySelector('.haru-session--pending')) sawPending = true;
      expect(screen.getByRole('button', { name: storytimeSessionCopy.record.start })).toBeTruthy();
    }, { timeout: 15_000, interval: 10 });
    const ms = Math.round(performance.now() - t0);
    appendFileSync(OUT, `${process.env.PROBE_TAG ?? ''} run${i} confirm→StartRecording ${ms}ms pendingSeen=${sawPending}\n`);
  });
});
