/** Stage 4b QA — 클래식 스크롤바 재현 전용: headless 기본 인자 `--hide-scrollbars` 를 뺀다 (NV-4B-5 / VG-K1S-04). */
import base from '../../../../playwright.config';

export default {
  ...base,
  testDir: '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b',
  snapshotPathTemplate: undefined,
  testMatch: 'qa-4b.probe.spec.ts',
  grep: /P6 /,
  use: { ...base.use, launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } },
};
