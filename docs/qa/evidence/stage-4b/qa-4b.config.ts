/** Stage 4b QA probe 전용 Playwright 설정 — 기본 설정을 그대로 쓰고 testDir · testMatch 만 바꾼다. */
import base from '../../../../playwright.config';

export default {
  ...base,
  testDir: '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b',
  snapshotPathTemplate: undefined,
  testMatch: 'qa-4b.probe.spec.ts',
};
