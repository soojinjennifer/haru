/**
 * 회고 카드 — Stage 5 Spec §2.2 `C13-S5-2` 상태 S0~S6 (AC-5-17 · 20~30 의 컴포넌트 부분).
 *
 * 실제 앱과 같은 조립(`createHarness` — Mock 번들 · Toast · Router)으로 완료 화면 route 를 띄운다.
 * 세션 = Mock 지난 세션 `analyzed`(`77777777-…0001`) — 직접 진입이라 상세를 조회한다.
 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { reflectionCopy } from '../src/features/reflection';
import { appCopy } from '../src/shared/copy/app-copy';
import { createHarness } from '../src/test/harness';

const SESSION = '77777777-7777-4777-8777-000000000001';
const PATH = `/session/${SESSION}/complete`;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

const pathname = () => screen.getByTestId('pathname').textContent ?? '';

/** Route Guard(`me` 조회) Spinner 가 끝날 때까지 — `session-recording.test.tsx` `waitForGuard` 와 같다. */
async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(
      screen
        .queryAllByRole('status', { name: appCopy.guard.loadingLabel })
        .filter((node) => node.closest('.haru-session') === null),
    ).toHaveLength(0);
  });
}

async function renderCard(scenarios: readonly string[] = []) {
  const harness = createHarness({ scenarios, initialEntries: [PATH] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  const submit = vi.spyOn(harness.bundle.clients.reflections, 'submit');
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  await waitFor(() => {
    expect(document.querySelector('.haru-session-complete')).not.toBeNull();
  });
  const card = await screen.findByRole('region', { name: 'How was storytime with Emma?' });
  return { harness, submit, card };
}

async function expectHome(): Promise<void> {
  await waitFor(() => {
    expect(pathname()).toBe('/');
  });
}

const save = () => screen.getByRole('button', { name: 'Save' });
const star = (name: string) => screen.getByRole('radio', { name });
const chip = (name: string) => screen.getByRole('button', { name });
const note = () => screen.getByRole('textbox', { name: reflectionCopy.notePlaceholder });

describe('ReflectionCard — 구성 (AC-5-17 · 20 · 21 · 22)', () => {
  it('제목 h2 · 별 5 · 칩 5(Figma 순서·라벨) · 입력 1 · Save — Figma 에 없는 요소 0', async () => {
    const { card } = await renderCard();
    const inCard = within(card);
    expect(inCard.getByRole('heading', { level: 2 }).textContent).toBe(
      'How was storytime with Emma?',
    );
    expect(inCard.getAllByRole('radio')).toHaveLength(5);
    const chips = within(inCard.getByRole('group')).getAllByRole('button');
    expect(chips.map((c) => c.textContent)).toEqual([
      'Engaged',
      'Big feelings',
      'Ask Questions',
      'Stay Focus',
      'Tricky today',
    ]);
    expect(chips.every((c) => c.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(chips.every((c) => c.querySelector('.haru-chip__check') === null)).toBe(true);
    expect(inCard.getAllByRole('textbox')).toHaveLength(1);
    expect((note() as HTMLInputElement).placeholder).toBe(
      'Anything to talk about this time? (optional)',
    );
    expect((note() as HTMLInputElement).maxLength).toBe(500);
    expect(inCard.getAllByRole('button', { name: 'Save' })).toHaveLength(1);
    expect(inCard.queryByRole('button', { name: /skip/i })).toBeNull();
  });
});

describe('S0 → S1 (AC-5-23)', () => {
  it('S0: 별 0 · Save 비활성(aria-disabled + 이유) · 눌러도 요청 0', async () => {
    const { submit } = await renderCard();
    expect(
      screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true'),
    ).toHaveLength(0);
    expect(save().getAttribute('aria-disabled')).toBe('true');
    const reasonId = save().getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(reasonId)?.textContent).toBe(reflectionCopy.saveReason);
    fireEvent.click(save());
    expect(submit).not.toHaveBeenCalled();
  });

  it.each([
    ['별', () => fireEvent.click(star('3 stars'))],
    ['칩', () => fireEvent.click(chip('Tricky today'))],
    ['입력', () => fireEvent.change(note(), { target: { value: 'moon' } })],
  ])('%s 하나만 있어도 Save 활성', async (_, act) => {
    await renderCard();
    act();
    expect(save().getAttribute('aria-disabled')).toBeNull();
  });

  it('공백만 입력하면 여전히 비활성 (빈 note = null)', async () => {
    await renderCard();
    fireEvent.change(note(), { target: { value: '   ' } });
    expect(save().getAttribute('aria-disabled')).toBe('true');
  });
});

describe('제출 (AC-5-24 · 25)', () => {
  it('body = 입력 그대로(칩은 Figma 순서 · note trim) · IK 있음 · 성공 Toast + 홈 replace', async () => {
    const { submit } = await renderCard();
    fireEvent.click(star('4 stars'));
    fireEvent.click(chip('Ask Questions'));
    fireEvent.click(chip('Engaged'));
    fireEvent.change(note(), { target: { value: '  Talk about the moon  ' } });
    fireEvent.click(save());

    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(1);
    });
    const [request, options] = submit.mock.calls[0] ?? [];
    expect(request).toEqual({
      sessionId: SESSION,
      body: { rating: 4, checks: ['engaged', 'asked_questions'], note: 'Talk about the moon' },
    });
    expect(options?.idempotencyKey.length).toBeGreaterThan(0);
    await expectHome();
    expect(await screen.findByText(reflectionCopy.saved)).toBeDefined();
  });

  it('note 를 비우면 null 로 보낸다', async () => {
    const { submit } = await renderCard();
    fireEvent.click(chip('Engaged'));
    fireEvent.click(save());
    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(1);
    });
    expect(submit.mock.calls[0]?.[0].body).toEqual({
      rating: null,
      checks: ['engaged'],
      note: null,
    });
  });

  it('S2 저장 중: 별·칩·입력 잠금(포커스 유지) · Save loading · 중복 탭 → 요청 1건', async () => {
    const { submit } = await renderCard();
    submit.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(star('2 stars'));
    fireEvent.click(save());
    await waitFor(() => {
      expect(save().classList.contains('haru-button--loading')).toBe(true);
    });
    fireEvent.click(save());
    await act(async () => {
      for (let i = 0; i < 10; i += 1) await Promise.resolve();
    });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(star('5 stars'));
    expect(star('2 stars').getAttribute('aria-checked')).toBe('true');
    expect(chip('Engaged').getAttribute('aria-disabled')).toBe('true');
    expect(chip('Engaged').hasAttribute('disabled')).toBe(false);
    expect((note() as HTMLInputElement).readOnly).toBe(true);
  });
});

describe('실패 · 오프라인 (AC-5-26 · 27 · 28)', () => {
  it('S3 error: 오류 Toast · 입력 보존 · 다시 누르면 같은 key', async () => {
    const { submit } = await renderCard(['reflections:error']);
    fireEvent.click(star('3 stars'));
    fireEvent.change(note(), { target: { value: 'moon' } });
    fireEvent.click(save());
    expect(
      await screen.findByText('Something went wrong. Please try again in a moment.'),
    ).toBeDefined();
    expect(star('3 stars').getAttribute('aria-checked')).toBe('true');
    expect((note() as HTMLInputElement).value).toBe('moon');
    await waitFor(() => {
      expect(save().classList.contains('haru-button--loading')).toBe(false);
    });
    fireEvent.click(save());
    await waitFor(() => {
      expect(submit).toHaveBeenCalledTimes(2);
    });
    const keys = submit.mock.calls.map(([, options]) => options.idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
  });

  it('S4 offline: 회고 전용 오프라인 Toast · 입력 보존 · 저장소 기록 0', async () => {
    await renderCard(['reflections:offline']);
    fireEvent.click(chip('Big feelings'));
    fireEvent.change(note(), { target: { value: 'secret-note-text' } });
    fireEvent.click(save());
    expect(await screen.findByText(reflectionCopy.offline)).toBeDefined();
    expect(chip('Big feelings').getAttribute('aria-pressed')).toBe('true');
    expect((note() as HTMLInputElement).value).toBe('secret-note-text');
    const stored = [
      ...Object.values({ ...window.localStorage }),
      ...Object.values({ ...window.sessionStorage }),
    ].join('\n');
    expect(stored).not.toContain('secret-note-text');
  });

  it('invalid-transition: 일반 실패 문구 · 다시 누르면 저장된다', async () => {
    await renderCard(['reflections:invalid-transition']);
    fireEvent.click(star('5 stars'));
    fireEvent.click(save());
    expect(
      await screen.findByText('Something went wrong. Please try again in a moment.'),
    ).toBeDefined();
    expect(screen.queryByText(/refreshed this storytime/)).toBeNull();
    await waitFor(() => {
      expect(save().classList.contains('haru-button--loading')).toBe(false);
    });
    fireEvent.click(save());
    await expectHome();
  });

  it('reflection-already-submitted: 저장된 결과로 다룬다 — 안내 Toast + 홈', async () => {
    await renderCard(['reflections:reflection-already-submitted']);
    fireEvent.click(star('1 star'));
    fireEvent.click(save());
    await expectHome();
    expect(
      await screen.findByText('Already noted. Your reflection for this storytime is saved.'),
    ).toBeDefined();
  });
});

describe('S6 재진입 읽기 전용 (AC-5-30)', () => {
  it('제출값 표시(별 4 · Engaged + Ask Questions · note) · 변경 불가 · Save 비활성 · SR 상태문', async () => {
    const { submit, card } = await renderCard(['session-completion:reflection-submitted']);
    await waitFor(() => {
      expect(card.getAttribute('data-state')).toBe('submitted');
    });
    expect(star('4 stars').getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radiogroup').getAttribute('aria-readonly')).toBe('true');
    const pressed = within(within(card).getByRole('group'))
      .getAllByRole('button')
      .filter((c) => c.getAttribute('aria-pressed') === 'true')
      .map((c) => c.textContent);
    expect(pressed).toEqual(['Engaged', 'Ask Questions']);
    expect((note() as HTMLInputElement).value).toBe('Talk about the moon again');
    expect((note() as HTMLInputElement).readOnly).toBe(true);

    fireEvent.click(chip('Tricky today'));
    fireEvent.click(star('1 star'));
    expect(chip('Tricky today').getAttribute('aria-pressed')).toBe('false');
    expect(star('4 stars').getAttribute('aria-checked')).toBe('true');

    expect((save() as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(save());
    expect(submit).not.toHaveBeenCalled();
    const describedBy = card.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe(
      'Your reflection for this storytime is saved.',
    );
  });
});

describe('Privacy (AC-5-22 · Plan §5.5)', () => {
  it('콘솔에 note 가 남지 않는다', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => {}),
    );
    await renderCard(['reflections:error']);
    fireEvent.change(note(), { target: { value: 'private-words-xyz' } });
    await act(async () => {
      fireEvent.click(save());
      await Promise.resolve();
    });
    await screen.findByText('Something went wrong. Please try again in a moment.');
    const logged = spies.flatMap((spy) => spy.mock.calls.flat().map(String)).join('\n');
    expect(logged).not.toContain('private-words-xyz');
    for (const spy of spies) spy.mockRestore();
  });
});
