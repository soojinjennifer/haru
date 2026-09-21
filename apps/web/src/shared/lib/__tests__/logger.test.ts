import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '../env';
import { ALLOWED_CONTEXT_KEYS, createLogger, errorName, sanitizeContext } from '../logger';

const envBase = { apiBaseUrl: '', mockScenario: '' } as const;
const devEnv: AppEnv = { dev: true, prod: false, mode: 'development', ...envBase };
const prodEnv: AppEnv = { dev: false, prod: true, mode: 'production', ...envBase };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('logger — PII 금지 (Plan §5.6)', () => {
  it('화이트리스트 밖의 키를 버린다', () => {
    const safe = sanitizeContext({
      route: '/',
      childName: 'Mina',
      transcript: 'once upon a time',
      audioPath: '/recordings/abc.webm',
      email: 'parent@example.com',
      accessToken: 'secret',
    });

    expect(safe).toStrictEqual({ route: '/' });
  });

  it('primitive 가 아닌 값은 버린다 (객체 통째 로깅 방지)', () => {
    const safe = sanitizeContext({ route: { path: '/', childName: 'Mina' }, count: 2 });

    expect(safe).toStrictEqual({ count: 2 });
  });

  it('허용 키 목록에 PII 성 키가 들어 있지 않다', () => {
    const forbidden = ['name', 'childName', 'email', 'transcript', 'audioPath', 'token', 'title'];

    for (const key of forbidden) {
      expect(ALLOWED_CONTEXT_KEYS).not.toContain(key);
    }
  });

  it('dev 에서만 출력하고 production 에서는 no-op 이다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    createLogger(prodEnv).warn('ui_error_boundary', { boundary: 'route' });
    expect(warn).not.toHaveBeenCalled();

    createLogger(devEnv).warn('ui_error_boundary', { boundary: 'route' });
    expect(warn).toHaveBeenCalledWith('[haru] ui_error_boundary', { boundary: 'route' });
  });

  it('출력 직전에도 context 를 걸러 낸다', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    createLogger(devEnv).error('ui_error_boundary', {
      boundary: 'app',
      // @ts-expect-error 타입에 없는 키가 런타임으로 흘러들어온 상황을 재현한다
      childName: 'Mina',
    });

    expect(error).toHaveBeenCalledWith('[haru] ui_error_boundary', { boundary: 'app' });
  });

  it('이벤트 이름이 규격 밖이면 그대로 기록하지 않는다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    createLogger(devEnv).warn('child Mina failed at /recordings/abc.webm');

    expect(warn).toHaveBeenCalledWith('[haru] invalid_event_name', {});
  });

  it('errorName 은 이름만 남기고 message / stack 을 노출하지 않는다', () => {
    const error = new TypeError('child Mina transcript leaked');

    expect(errorName(error)).toBe('TypeError');
    expect(errorName('not an error')).toBe('UnknownError');
  });
});
