/** Stage 4b QA R2-9 probe — 기본 설정 상속, testDir·testMatch 만 변경. */
import base from '../../../../../playwright.config';

export default {
  ...base,
  testDir: '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/r2-9',
  snapshotPathTemplate: undefined,
  testMatch: /obs9-.*\.spec\.ts/,
  projects: [{ name: 'chromium' }],
};
