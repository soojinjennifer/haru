/** R2-9 관측 — 측정판 페이지의 모든 console 메시지를 location 과 함께 기록 (필터 없음). */
import { test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test('O1 console 전수 관측', async ({ page }, info) => {
  const all: string[] = [];
  page.on('console', (m) => {
    const l = m.location();
    all.push(`${m.type()} | url=${l.url} line=${l.lineNumber} col=${l.columnNumber} | doc=${page.url()} | ${m.text().slice(0, 160)}`);
  });
  await page.goto('/__dev/ui/recording-measure', { waitUntil: 'domcontentloaded' });
  await page.locator('#measure-start-latency-run').waitFor();
  await page.waitForTimeout(7000);
  const fonts = await page.evaluate(() => [...document.fonts].map((f) => `${f.family}:${f.status}`).join(','));
  all.push(`fonts=${fonts}`);
  writeFileSync(`/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/r2-9/observer-${process.env.OBS_TAG ?? 'x'}.txt`, all.join('\n') + '\n');
  info.annotations.push({ type: 'count', description: String(all.length) });
});
