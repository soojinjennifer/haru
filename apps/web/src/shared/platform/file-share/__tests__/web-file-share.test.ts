/**
 * Web `FileSharePort` — Stage 7 `S7-A` (Plan §5.5 `N7-19`, AC-7-59 · AC-7-60 단위 부분).
 * 실제 navigator · document 대신 주입 환경으로 분기를 검증한다.
 */
import { describe, expect, it, vi } from 'vitest';

import { isFileShareRejectedError, type FileShareRejectedError } from '../file-share-port';
import { createWebFileSharePort, type WebFileShareEnvironment } from '../web-file-share';

const file = new File(['%PDF-1.4'], 'report.pdf', { type: 'application/pdf' });

function domError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

function environment(overrides: Partial<WebFileShareEnvironment> = {}) {
  const deferred: (() => void)[] = [];
  const env: WebFileShareEnvironment = {
    navigator: {
      share: vi.fn(() => Promise.resolve()),
      canShare: vi.fn(() => true),
    },
    document,
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
    defer: (task) => deferred.push(task),
    ...overrides,
  };
  return { env, flush: () => deferred.splice(0).forEach((task) => task()) };
}

describe('canShareFile', () => {
  it('navigator.canShare({ files }) 결과를 따른다', () => {
    const { env } = environment();
    expect(createWebFileSharePort(env).canShareFile(file)).toBe(true);
    expect(env.navigator?.canShare).toHaveBeenCalledWith({ files: [file] });
  });

  it('share · canShare 가 없거나 canShare 가 던지면 false', () => {
    expect(
      createWebFileSharePort(environment({ navigator: undefined }).env).canShareFile(file),
    ).toBe(false);
    const noCanShare = environment({
      navigator: { share: vi.fn(() => Promise.resolve()), canShare: undefined as never },
    });
    expect(createWebFileSharePort(noCanShare.env).canShareFile(file)).toBe(false);
    const throwing = environment({
      navigator: {
        share: vi.fn(() => Promise.resolve()),
        canShare: vi.fn(() => {
          throw new TypeError('bad');
        }),
      },
    });
    expect(createWebFileSharePort(throwing.env).canShareFile(file)).toBe(false);
  });
});

describe('shareFile', () => {
  it('성공 = shared · 호출 인자는 files + title', async () => {
    const { env } = environment();
    expect(await createWebFileSharePort(env).shareFile(file, 'HARU report')).toBe('shared');
    expect(env.navigator?.share).toHaveBeenCalledWith({ files: [file], title: 'HARU report' });
  });

  it('AbortError = cancelled (오류 아님)', async () => {
    const { env } = environment({
      navigator: {
        share: vi.fn(() => Promise.reject(domError('AbortError'))),
        canShare: vi.fn(() => true),
      },
    });
    expect(await createWebFileSharePort(env).shareFile(file, 't')).toBe('cancelled');
  });

  it('NotAllowedError = FileShareRejectedError(reason) — 메시지에 파일명 없음', async () => {
    const { env } = environment({
      navigator: {
        share: vi.fn(() => Promise.reject(domError('NotAllowedError'))),
        canShare: vi.fn(() => true),
      },
    });
    const error: unknown = await createWebFileSharePort(env)
      .shareFile(file, 't')
      .catch((caught: unknown) => caught);
    expect(isFileShareRejectedError(error)).toBe(true);
    expect((error as FileShareRejectedError).reason).toBe('NotAllowedError');
    expect((error as Error).message).not.toContain('report.pdf');
  });

  it('share API 없음 = NotSupportedError', async () => {
    await expect(
      createWebFileSharePort(environment({ navigator: undefined }).env).shareFile(file, 't'),
    ).rejects.toMatchObject({ reason: 'NotSupportedError' });
  });
});

describe('saveFile', () => {
  it('<a download> 를 클릭하고 즉시 제거 · blob URL 은 다음 task 에 revoke (영속 저장 0)', () => {
    const { env, flush } = environment();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    createWebFileSharePort(env).saveFile(file, 'haru-report.pdf');

    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('haru-report.pdf');
    expect(anchor.getAttribute('href')).toBe('blob:mock-url');
    expect(anchor.isConnected).toBe(false);
    expect(env.revokeObjectURL).not.toHaveBeenCalled();
    flush();
    expect(env.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    click.mockRestore();
  });

  it('document 가 없으면 아무 것도 하지 않는다', () => {
    const { env } = environment({ document: undefined });
    createWebFileSharePort(env).saveFile(file, 'x.pdf');
    expect(env.createObjectURL).not.toHaveBeenCalled();
  });
});
