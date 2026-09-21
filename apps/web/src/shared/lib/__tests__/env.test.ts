import { describe, expect, it } from 'vitest';

import { env, isDevOnlyFeatureEnabled, type AppEnv } from '../env';

describe('env', () => {
  it('Vite 실행 환경을 그대로 노출한다', () => {
    expect(typeof env.dev).toBe('boolean');
    expect(typeof env.prod).toBe('boolean');
    expect(env.dev).toBe(!env.prod);
    expect(env.mode.length).toBeGreaterThan(0);
  });

  it('dev 전용 기능은 dev 에서만 켜진다', () => {
    const base = { apiBaseUrl: '', mockScenario: '' } as const;
    const dev: AppEnv = { dev: true, prod: false, mode: 'development', ...base };
    const prod: AppEnv = { dev: false, prod: true, mode: 'production', ...base };

    expect(isDevOnlyFeatureEnabled(dev)).toBe(true);
    expect(isDevOnlyFeatureEnabled(prod)).toBe(false);
  });
});
