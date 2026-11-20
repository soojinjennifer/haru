/**
 * 리포트 상세 ⑥ 하이라이트 클립 플레이어 — Stage 7 `S7-E` (`C13-S7-3`, Spec §2.5 · §9.1, FR-18).
 *
 * 실제 router + Mock Adapter(`highlight-clips` scenario) + **StrictMode**. jsdom 은 미디어를 재생하지 않으므로
 * `HTMLMediaElement.prototype.play/pause/load` 를 스텁하고 `timeupdate` · `ended` 이벤트를 직접 보낸다.
 * 실제 Chromium 재생은 `e2e/highlight-clip.spec.ts`.
 *
 * AC: 49(preload none · 탭 전 조회 0 · 진행 · 길이 · 라벨) · 50(동시 재생 1) · 51(재발급 1회) · 52(불가 · 재시도 0) ·
 *     53(이탈 · 숨김 → 정지 + src 제거 · 로그 0) · 54(버튼 이름 · live) · 65(로그아웃 시 URL 캐시 제거).
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type MockInstance,
} from 'vitest';

import { AppRoutes } from '../src/app/router';
import { clipKeys } from '../src/entities/highlight-clip';
import { highlightClipCopy as copy } from '../src/features/highlight-clip-player';
import { MOCK_HIGHLIGHT_CLIP_IDS } from '../src/mocks/fixtures/highlight-clips';
import { MOCK_REPORT_IDS } from '../src/mocks/fixtures/reports';
import { progressReportPath, ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { createHarness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const PLAYBACK_OPERATION = 'GET /v1/highlight-clips/:clipId/playback-url';
const FIRST = 'Talking about feelings';
const SECOND = 'Guessing what happens next';

let navigateFromTest: ((to: string) => void) | null = null;

function NavigateProbe() {
  const navigate = useNavigate();
  useEffect(() => {
    navigateFromTest = (to: string) => {
      void navigate(to);
    };
  }, [navigate]);
  return null;
}

/**
 * `HTMLMediaElement.prototype.play` 호출을 둘로 나눈다 (`VG7-E-10` ⓑ):
 * - `play` — src 가 붙은 **재생** 호출 (기존 단정 · `mockRejectedValueOnce` 대상)
 * - `unlock` — src 없는 **잠금 해제** 호출 (탭 핸들러 동기 구간 · iOS). 실제 브라우저처럼 빈 src 를 거절한다.
 * `mediaLog` 는 두 호출과 URL 조회 수를 **호출 순서대로** 남긴다.
 */
let play: Mock<() => Promise<void>>;
let unlock: Mock<() => Promise<void>>;
let mediaLog: string[];
let pause: MockInstance<HTMLMediaElement['pause']>;
let load: MockInstance<HTMLMediaElement['load']>;
let consoleCalls: unknown[][];

beforeEach(() => {
  play = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  unlock = vi.fn<() => Promise<void>>(() =>
    Promise.reject(new DOMException('The element has no supported sources.', 'NotSupportedError')),
  );
  mediaLog = [];
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    if (this.hasAttribute('src')) {
      mediaLog.push('play');
      return play();
    }
    mediaLog.push('unlock');
    return unlock();
  });
  pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  consoleCalls = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      consoleCalls.push(args);
    });
  }
});

afterEach(() => {
  // 스텁을 걷기 **전에** 언마운트한다 — 정리 경로(정지 + src 제거)가 jsdom 미구현 메서드를 부르지 않게.
  cleanup();
  vi.restoreAllMocks();
});

async function renderDetail(scenarios: readonly string[] = []) {
  const harness = createHarness({
    initialEntries: [progressReportPath(MOCK_REPORT_IDS.latest)],
    scenarios,
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <StrictMode>
      <Wrapper>
        <NavigateProbe />
        <AppRoutes />
      </Wrapper>
    </StrictMode>,
  );
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
  await screen.findByRole('heading', { level: 2, name: copy.title });
  return harness;
}

function playbackRequests(harness: Awaited<ReturnType<typeof renderDetail>>) {
  return harness.bundle.requestLog
    .entries()
    .filter((entry) => entry.operation === PLAYBACK_OPERATION);
}

function audio(): HTMLAudioElement {
  const element = document.querySelector('audio');
  if (element === null) throw new Error('no audio element');
  return element;
}

function clipsSection(): HTMLElement {
  const section = document.querySelector<HTMLElement>('[data-section="clips"]')?.parentElement;
  if (section === null || section === undefined) throw new Error('no clips section');
  return section;
}

function rowOf(label: string): HTMLElement {
  const row = within(clipsSection()).getByText(label).closest('li');
  if (row === null) throw new Error(`no row ${label}`);
  return row;
}

async function tap(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name }));
    await Promise.resolve();
  });
}

describe('⑥ Highlight clips — idle (AC-7-49 · 54)', () => {
  it('섹션 h2 · 행 2 · 라벨 · 날짜 · 0:00 / 길이 · preload none · 탭 전 URL 조회 0', async () => {
    const harness = await renderDetail();
    const section = clipsSection();

    expect(within(section).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
    expect(screen.getByRole('button', { name: copy.play(SECOND) })).toBeDefined();
    expect(within(rowOf(FIRST)).getByText('May 5')).toBeDefined();
    expect(within(rowOf(SECOND)).getByText('Apr 22')).toBeDefined();
    expect(within(rowOf(FIRST)).getByText('0:00 / 0:12')).toBeDefined();
    expect(within(rowOf(SECOND)).getByText('0:00 / 0:15')).toBeDefined();

    const bar = within(rowOf(FIRST)).getByRole('progressbar', { name: copy.progressLabel(FIRST) });
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('12');
    // 퍼센트가 아니라 시간을 읽는다 (Plan §5.7 · H7-5 판단)
    expect(bar.getAttribute('aria-valuetext')).toBe('0:00 of 0:12');

    const element = audio();
    expect(element.getAttribute('preload')).toBe('none');
    expect(element.hasAttribute('src')).toBe(false);
    expect(element.hasAttribute('controls')).toBe(false);
    expect(playbackRequests(harness)).toHaveLength(0);
    expect(play).not.toHaveBeenCalled();

    // live region 은 행마다 1개 · 처음엔 비어 있다
    const live = rowOf(FIRST).querySelectorAll('[aria-live="polite"]');
    expect(live).toHaveLength(1);
    expect(live[0]?.textContent).toBe('');
  });
});

describe('클립 0개 + slot 있음 (VG7-D-11 · Spec §2.3 ⑥)', () => {
  it('첫 리포트(클립 0) → *Highlight clips* 섹션 · 오디오 요소 미렌더', async () => {
    const harness = createHarness({
      initialEntries: [progressReportPath(MOCK_REPORT_IDS.earlier)],
    });
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    const Wrapper = harness.wrapper;
    render(
      <StrictMode>
        <Wrapper>
          <AppRoutes />
        </Wrapper>
      </StrictMode>,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.haru-report-detail__body[data-state="ready"]'),
      ).not.toBeNull();
    });
    expect(screen.queryByRole('heading', { level: 2, name: copy.title })).toBeNull();
    expect(document.querySelector('audio')).toBeNull();
    expect(document.querySelector('[data-section="clips"]')).toBeNull();
  });
});

describe('재생 · 일시정지 · 진행 (AC-7-49 · 54)', () => {
  it('탭 → URL 1회 · WAV src · play → Pause 이름 · live "Playing." · timeupdate 로 진행 · 일시정지 → 재개는 조회 0', async () => {
    const harness = await renderDetail();
    await tap(copy.play(FIRST));

    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(1);
    expect(playbackRequests(harness)[0]?.payload).toStrictEqual({
      clipId: MOCK_HIGHLIGHT_CLIP_IDS[0],
    });
    expect(audio().getAttribute('src')?.startsWith('data:audio/wav;base64,UklGR')).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
    expect(rowOf(FIRST).querySelector('[aria-live="polite"]')?.textContent).toBe(copy.playing);

    act(() => {
      audio().currentTime = 4.6;
      audio().dispatchEvent(new Event('timeupdate'));
    });
    const bar = within(rowOf(FIRST)).getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('4.6');
    expect(bar.getAttribute('aria-valuetext')).toBe('0:04 of 0:12');
    expect(within(rowOf(FIRST)).getByText('0:04 / 0:12')).toBeDefined();

    await tap(copy.pause(FIRST));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
    expect(rowOf(FIRST).querySelector('[aria-live="polite"]')?.textContent).toBe(copy.paused);
    expect(within(rowOf(FIRST)).getByText('0:04 / 0:12')).toBeDefined();

    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(play).toHaveBeenCalledTimes(2);
    expect(playbackRequests(harness)).toHaveLength(1);
  });

  it('ended → play 아이콘 · 위치 0 (Spec §2.5 ended = idle 표시)', async () => {
    await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    act(() => {
      audio().currentTime = 12;
      audio().dispatchEvent(new Event('timeupdate'));
      audio().dispatchEvent(new Event('ended'));
    });
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
    expect(within(rowOf(FIRST)).getByText('0:00 / 0:12')).toBeDefined();
  });

  it('재생 도중 미디어 오류(스트림 끊김) → error 문구 · src 제거 · 다시 탭 = 새 URL', async () => {
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    act(() => {
      audio().dispatchEvent(new Event('error'));
    });
    expect(within(rowOf(FIRST)).getByText(copy.error)).toBeDefined();
    expect(audio().hasAttribute('src')).toBe(false);
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(2);
  });

  it('외부 일시정지(OS 미디어 제어) → paused', async () => {
    await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    act(() => {
      audio().dispatchEvent(new Event('pause'));
    });
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
  });
});

describe('동시 재생 1개 (AC-7-50)', () => {
  it('둘째 클립 재생 → 첫 클립 정지(위치 유지) · src 교체 · 오디오 요소 1개', async () => {
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    act(() => {
      audio().currentTime = 3;
      audio().dispatchEvent(new Event('timeupdate'));
    });
    const firstSrc = audio().getAttribute('src');
    const pausesBefore = pause.mock.calls.length;

    await tap(copy.play(SECOND));
    await screen.findByRole('button', { name: copy.pause(SECOND) });
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
    expect(within(rowOf(FIRST)).getByText('0:03 / 0:12')).toBeDefined();
    expect(pause.mock.calls.length).toBeGreaterThan(pausesBefore);
    expect(audio().getAttribute('src')).not.toBe(firstSrc);
    expect(document.querySelectorAll('audio')).toHaveLength(1);
    expect(playbackRequests(harness).map((entry) => entry.payload)).toStrictEqual([
      { clipId: MOCK_HIGHLIGHT_CLIP_IDS[0] },
      { clipId: MOCK_HIGHLIGHT_CLIP_IDS[1] },
    ]);
    // 첫 클립 재개 — 캐시 URL(만료 2099) 재사용 · 위치 3 에서
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(2);
    expect(audio().currentTime).toBe(3);
  });
});

describe('URL 만료 → 재발급 1회 (AC-7-51 · C7-8)', () => {
  it('`clip-url-expired` — 첫 URL 만료 → 재발급 1회 → 재생 (빈 오디오 src 를 붙이지 않는다)', async () => {
    const harness = await renderDetail(['highlight-clips:clip-url-expired']);
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(2);
    expect(play).toHaveBeenCalledTimes(1);
    expect(audio().getAttribute('src')).not.toBe('data:audio/wav;base64,');
  });

  it('미디어 오류(403 류 — play 거절) → URL 버리고 재발급 1회 → 재생', async () => {
    play.mockRejectedValueOnce(new DOMException('no supported source', 'NotSupportedError'));
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(2);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('재발급 뒤에도 실패 → error 문구 · 요청 2회에서 멈춤 · 다시 탭하면 재시도', async () => {
    play.mockRejectedValue(new DOMException('no supported source', 'NotSupportedError'));
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await within(rowOf(FIRST)).findByText(copy.error);
    expect(playbackRequests(harness)).toHaveLength(2);
    expect(audio().hasAttribute('src')).toBe(false);
    // error 상태에서도 진행 행 유지 (Spec §2.5)
    expect(within(rowOf(FIRST)).getByRole('progressbar')).toBeDefined();

    play.mockResolvedValue(undefined);
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(3);
    expect(within(rowOf(FIRST)).queryByText(copy.error)).toBeNull();
  });

  it('자동재생 차단(NotAllowedError) → 재발급 없이 error · 요청 1회', async () => {
    play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'));
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await within(rowOf(FIRST)).findByText(copy.error);
    expect(playbackRequests(harness)).toHaveLength(1);
  });
});

describe('iOS 첫 탭 잠금 해제 — 조회 전 동기 `play()` (`VG7-E-10` ⓑ · `D7-6` ⑥)', () => {
  it('첫 탭: 탭 핸들러 안에서 unlock(src 없음 · 조회 0) → URL 조회 → src 설정 → play 순서', async () => {
    const harness = await renderDetail();
    const atUnlock: { requests: number; hasSrc: boolean; preload: string | null }[] = [];
    unlock.mockImplementation(() => {
      atUnlock.push({
        requests: playbackRequests(harness).length,
        hasSrc: audio().hasAttribute('src'),
        preload: audio().getAttribute('preload'),
      });
      return Promise.reject(new DOMException('no supported sources', 'NotSupportedError'));
    });
    const atPlay: { requests: number; wav: boolean }[] = [];
    play.mockImplementation(() => {
      atPlay.push({
        requests: playbackRequests(harness).length,
        wav: audio().getAttribute('src')?.startsWith('data:audio/wav;base64,UklGR') ?? false,
      });
      return Promise.resolve();
    });

    // 탭 전: 조회 0 · play 0 (AC-7-49)
    expect(playbackRequests(harness)).toHaveLength(0);
    expect(mediaLog).toStrictEqual([]);

    // click 디스패치 **동기 구간**이 끝난 시점 — 비동기(조회 응답)를 한 번도 돌리지 않았다
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: copy.play(FIRST) }));
      expect(mediaLog).toStrictEqual(['unlock']);
    });

    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(mediaLog).toStrictEqual(['unlock', 'play']);
    expect(atUnlock).toStrictEqual([{ requests: 0, hasSrc: false, preload: 'none' }]);
    expect(atPlay).toStrictEqual([{ requests: 1, wav: true }]);
    expect(audio().getAttribute('preload')).toBe('none');
  });

  it('잠금 해제 거절은 조용히 — 오류 문구 · 콘솔 출력 0 · 정상 재생', async () => {
    await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(unlock).toHaveBeenCalledTimes(1);
    expect(within(rowOf(FIRST)).queryByText(copy.error)).toBeNull();
    expect(consoleCalls).toStrictEqual([]);
  });

  it('잠금 해제가 동기 예외를 던져도 조용히 재생으로 이어진다', async () => {
    await renderDetail();
    unlock.mockImplementation(() => {
      throw new DOMException('blocked', 'NotAllowedError');
    });
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(mediaLog).toStrictEqual(['unlock', 'play']);
    expect(consoleCalls).toStrictEqual([]);
  });

  it('붙어 있는 클립 재개 · 캐시 URL 재생은 잠금 해제 없이 바로 play (이미 제스처 안 동기 호출)', async () => {
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    await tap(copy.pause(FIRST));
    await tap(copy.play(FIRST)); // 재개 — 붙어 있음
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    await tap(copy.play(SECOND)); // 둘째 — 조회 필요
    await screen.findByRole('button', { name: copy.pause(SECOND) });
    await tap(copy.play(FIRST)); // 첫째 — 캐시 URL
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(mediaLog).toStrictEqual(['unlock', 'play', 'play', 'unlock', 'play', 'play']);
    expect(playbackRequests(harness)).toHaveLength(2);
  });
});

describe('불가 상태 — 재시도 0 (AC-7-52 · N7-17)', () => {
  it('`recording-deleted` → 불가 문구 · 버튼 aria-disabled + "Clip unavailable" · 진행 숨김 · 다시 눌러도 요청 0', async () => {
    const harness = await renderDetail(['highlight-clips:recording-deleted']);
    await tap(copy.play(FIRST));
    const button = await screen.findByRole('button', { name: copy.unavailableButton(FIRST) });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(within(rowOf(FIRST)).getByText(copy.unavailable)).toBeDefined();
    expect(within(rowOf(FIRST)).queryByRole('progressbar')).toBeNull();
    expect(playbackRequests(harness)).toHaveLength(1);

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });
    expect(playbackRequests(harness)).toHaveLength(1);
    // live region 안의 보이는 문구로 알림
    expect(rowOf(FIRST).querySelector('[aria-live="polite"]')?.textContent).toBe(copy.unavailable);
  });

  it('`clip-expired` → 둘째 클립은 조회 전부터 불가(expiresAt 경과) · 첫 클립은 재생', async () => {
    const harness = await renderDetail(['highlight-clips:clip-expired']);
    const second = screen.getByRole('button', { name: copy.unavailableButton(SECOND) });
    expect(second.getAttribute('aria-disabled')).toBe('true');
    expect(within(rowOf(SECOND)).getByText(copy.unavailable)).toBeDefined();
    expect(within(rowOf(SECOND)).queryByText(/\d{4}/)).toBeNull(); // 만료일 표시 0
    expect(playbackRequests(harness)).toHaveLength(0);

    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(playbackRequests(harness)).toHaveLength(1);
  });
});

describe('오류 · 오프라인 (Spec §2.5 error)', () => {
  it('`offline` → 오프라인 문구 · play 아이콘 · 다시 탭 = 재시도', async () => {
    const harness = await renderDetail(['highlight-clips:offline']);
    await tap(copy.play(FIRST));
    await within(rowOf(FIRST)).findByText(copy.offline);
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
    await tap(copy.play(FIRST));
    await waitFor(() => {
      expect(playbackRequests(harness)).toHaveLength(2);
    });
  });

  it('`error` → 일반 오류 문구', async () => {
    await renderDetail(['highlight-clips:error']);
    await tap(copy.play(FIRST));
    await within(rowOf(FIRST)).findByText(copy.error);
  });

  it('`retry` → 첫 탭 오류 · 다시 탭 재생', async () => {
    await renderDetail(['highlight-clips:retry']);
    await tap(copy.play(FIRST));
    await within(rowOf(FIRST)).findByText(copy.error);
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
  });
});

describe('이탈 · 숨김 · 로그아웃 (AC-7-53 · 65)', () => {
  it('문서 숨김(탭 전환) → 정지 + src 제거 · 행 paused · 다시 탭하면 위치부터', async () => {
    await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    act(() => {
      audio().currentTime = 5;
      audio().dispatchEvent(new Event('timeupdate'));
    });

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    visibility.mockRestore();
    expect(audio().hasAttribute('src')).toBe(false);
    expect(load).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: copy.play(FIRST) })).toBeDefined();
    expect(within(rowOf(FIRST)).getByText('0:05 / 0:12')).toBeDefined();

    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    expect(audio().currentTime).toBe(5);
  });

  it('화면 이탈 → 정지 + src 제거 · URL 캐시는 로그아웃(QueryClient.clear)에 지워진다', async () => {
    const harness = await renderDetail();
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    const element = audio();
    expect(
      harness.queryClient.getQueryData(clipKeys.playback(MOCK_HIGHLIGHT_CLIP_IDS[0])),
    ).toBeDefined();
    const pauses = pause.mock.calls.length;

    act(() => {
      navigateFromTest?.(ROUTES.progress);
    });
    await screen.findByRole('heading', { level: 1, name: 'Progress' });
    expect(pause.mock.calls.length).toBeGreaterThan(pauses);
    expect(element.hasAttribute('src')).toBe(false);

    act(() => {
      harness.queryClient.clear();
    });
    expect(
      harness.queryClient.getQueryData(clipKeys.playback(MOCK_HIGHLIGHT_CLIP_IDS[0])),
    ).toBeUndefined();
  });

  it('콘솔 출력 0 — URL · 클립 id · 라벨이 로그에 없다 (AC-7-53 · 64)', async () => {
    await renderDetail(['highlight-clips:clip-url-expired']);
    await tap(copy.play(FIRST));
    await screen.findByRole('button', { name: copy.pause(FIRST) });
    await tap(copy.play(SECOND));
    await screen.findByRole('button', { name: copy.pause(SECOND) });
    const text = JSON.stringify(consoleCalls);
    expect(text).not.toMatch(/data:audio|c1c1c1c1|Talking about feelings|Guessing what/);
  });
});
