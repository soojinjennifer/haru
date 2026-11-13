/**
 * Stage 5 QA probe config (stage-qa-agent, 2026-11-10). 저장소 `playwright.config.ts` 를 그대로 쓰고
 * testDir 만 이 폴더로 바꾼다. 제품 코드·e2e 코드를 수정하지 않는다.
 */
import { defineConfig } from '@playwright/test';

import base from '../../../../../playwright.config';

export default defineConfig({
  ...base,
  testDir: '.',
  testMatch: /qa5-.*\.spec\.ts/,
  outputDir: './out',
  projects: [{ name: 'chromium' }],
  webServer: { ...(base.webServer as object), cwd: '../../../../..' } as never,
});
