/** QA probe 전용 설정 — 기존 playwright.config.ts 를 그대로 쓰고 testDir 만 이 폴더로 바꾼다. */
import base from '../../../playwright.config';

export default { ...base, testDir: '.', snapshotPathTemplate: undefined };
