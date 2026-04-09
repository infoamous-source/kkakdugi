#!/usr/bin/env node
// Capture reference HTML slides (view-only) at 1280x720 for SSIM comparison.

import { chromium } from '/Users/suni/marketing-ai-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const OUT_REF = '/tmp/pptx-work/v2/reference';
fs.mkdirSync(OUT_REF, { recursive: true });

async function run(htmlPath, prefix) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1360, height: 800 },
    deviceScaleFactor: 1,
  });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.classList.add('view-only');
    ['#edit-toolbar','#print-btn','#slide-modal','#btn-save-html',
     '[id*="toolbar" i]','[id*="editor" i]'].forEach(s =>
      document.querySelectorAll(s).forEach(e => e.remove()));
    const st = document.createElement('style');
    st.textContent = `#edit-toolbar,#print-btn,#slide-modal,#btn-save-html,[id*="toolbar" i],[id*="editor" i] {display:none !important;}`;
    document.head.appendChild(st);
  });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(600);
  const count = await page.locator('.slide').count();
  for (let i = 0; i < count; i++) {
    const slide = page.locator('.slide').nth(i);
    await slide.scrollIntoViewIfNeeded();
    await page.waitForTimeout(30);
    await slide.screenshot({
      path: path.join(OUT_REF, `${prefix}_${String(i+1).padStart(2,'0')}.png`),
      type: 'png',
    });
  }
  await browser.close();
  console.log(`${prefix}: ${count} reference PNGs`);
}

await run('/Users/suni/eduzip/public/lectures/kkakdugi-marketing-day1/index.html', 'day1');
await run('/Users/suni/eduzip/public/lectures/kkakdugi-marketing-day2/index.html', 'day2');
console.log('DONE reference capture');
