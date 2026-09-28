import { afterEach, describe, expect, it, vi } from 'vitest';

import { devWarn } from '../devWarn';

describe('devWarn — packages/ui 의 유일한 console 접근 지점 (QA-1-001)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('고정 문구와 식별자만 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    devWarn('Icon', 'missing-accessible-name', 'haru:tab-center-home');

    expect(warn).toHaveBeenCalledWith(
      '[haru/ui] Icon "haru:tab-center-home" needs either a `label` or `decorative` (Design Spec §4.2).',
    );
    warn.mockRestore();
  });

  it('자유 입력 형태의 값(공백·문장)은 살균되어 원형으로 남지 않는다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    devWarn('Icon', 'missing-accessible-name', 'Mia said she was scared');

    const output = String(warn.mock.calls[0]?.[0]);
    expect(output).not.toContain('Mia said she was scared');
    expect(output).toContain('Mia_said_she_was_scared');
    warn.mockRestore();
  });

  it('64자를 넘는 값은 잘라낸다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    devWarn('Icon', 'missing-accessible-name', 'a'.repeat(200));

    expect(String(warn.mock.calls[0]?.[0])).toContain(`"${'a'.repeat(64)}"`);
    warn.mockRestore();
  });

  it('subject 가 없으면 컴포넌트 이름만 붙는다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    devWarn('Icon', 'missing-accessible-name');

    expect(String(warn.mock.calls[0]?.[0])).toBe(
      '[haru/ui] Icon needs either a `label` or `decorative` (Design Spec §4.2).',
    );
    warn.mockRestore();
  });

  it('Production 빌드에서는 아무것도 출력하지 않는다 (QA-1-004)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('DEV', false);

    devWarn('Icon', 'missing-accessible-name', 'haru:tab-center-home');

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
