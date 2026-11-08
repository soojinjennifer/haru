/** Stage 4b QA 2회차 probe — 기본 설정 상속, testDir·testMatch 만 변경. R6 는 클래식 스크롤바 project. */
import base from '../../../../../playwright.config';

export default {
  ...base,
  testDir: '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/r2',
  snapshotPathTemplate: undefined,
  testMatch: 'qa-4b-r2.probe.spec.ts',
  projects: [
    { name: 'chromium', grepInvert: /R6 / },
    {
      name: 'chromium-classic-scrollbar',
      grep: /R6 /,
      use: { launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } },
    },
  ],
};
