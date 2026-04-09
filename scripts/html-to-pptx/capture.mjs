#!/usr/bin/env node
// Capture each .slide in HTML lecture files:
// 1. Extract editable text elements (position + style) as JSON
// 2. Temporarily hide text, screenshot slide as PNG background
// 3. Restore text
//
// Output:
//   /tmp/pptx-work/slides/{prefix}_NN.png
//   /tmp/pptx-work/{prefix}.json

import { chromium } from '/Users/suni/marketing-ai-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const SLIDE_W = 1280;
const SLIDE_H = 720;
const SCALE = 2;

async function captureFile(htmlPath, outDir, prefix) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: SLIDE_W + 80, height: SLIDE_H + 80 },
    deviceScaleFactor: SCALE,
  });
  const page = await context.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  // Give fonts time to settle
  await page.waitForTimeout(1500);

  const slideCount = await page.locator('.slide').count();
  console.log(`[${prefix}] ${slideCount} slides`);

  const slidesMeta = [];

  for (let i = 0; i < slideCount; i++) {
    const slide = page.locator('.slide').nth(i);
    await slide.scrollIntoViewIfNeeded();
    await page.waitForTimeout(50);

    // 1. Extract text elements
    const texts = await slide.evaluate((el) => {
      const out = [];
      const slideRect = el.getBoundingClientRect();

      function hasDirectText(node) {
        for (const c of node.childNodes) {
          if (c.nodeType === 3 && c.textContent.trim()) return true;
        }
        return false;
      }

      function walk(node) {
        if (!node || node.nodeType !== 1) return;
        const tag = (node.tagName || '').toUpperCase();
        if (tag === 'SVG' || tag === 'SCRIPT' || tag === 'STYLE') return;

        if (hasDirectText(node)) {
          const rect = node.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) {
            for (const c of node.children) walk(c);
            return;
          }
          const cs = window.getComputedStyle(node);
          // Use innerText to preserve line breaks from <br>
          const text = (node.innerText || node.textContent || '').replace(/\u00a0/g, ' ');
          if (!text.trim()) return;
          out.push({
            x: rect.left - slideRect.left,
            y: rect.top - slideRect.top,
            w: rect.width,
            h: rect.height,
            text: text,
            fontSize: parseFloat(cs.fontSize) || 16,
            fontWeight: parseInt(cs.fontWeight) || 400,
            color: cs.color,
            textAlign: cs.textAlign,
            lineHeight: cs.lineHeight,
            letterSpacing: cs.letterSpacing,
          });
          // Don't recurse below text leaves
          return;
        }
        for (const c of node.children) walk(c);
      }
      walk(el);
      return out;
    });

    // 2. Hide all text (color: transparent) for non-SVG text parents
    await slide.evaluate((el) => {
      el.__origColors = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const parents = new Set();
      let t;
      while ((t = walker.nextNode())) {
        if (!t.textContent.trim()) continue;
        const p = t.parentElement;
        if (!p || p.closest('svg')) continue;
        parents.add(p);
      }
      for (const p of parents) {
        el.__origColors.push([p, p.style.color || '']);
        p.style.setProperty('color', 'transparent', 'important');
      }
    });
    // Let style apply
    await page.waitForTimeout(30);

    // 3. Screenshot
    const png = path.join(outDir, `${prefix}_${String(i + 1).padStart(2, '0')}.png`);
    await slide.screenshot({ path: png, type: 'png' });

    // 4. Restore
    await slide.evaluate((el) => {
      for (const [p, orig] of el.__origColors || []) {
        if (orig) p.style.color = orig;
        else p.style.removeProperty('color');
      }
      delete el.__origColors;
    });

    slidesMeta.push({
      index: i + 1,
      png: path.basename(png),
      texts,
    });
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${slideCount}`);
  }

  await browser.close();
  return slidesMeta;
}

const OUT_DIR = '/tmp/pptx-work';
const SLIDES_DIR = path.join(OUT_DIR, 'slides');
fs.mkdirSync(SLIDES_DIR, { recursive: true });

const tasks = [
  {
    html: '/Users/suni/eduzip/public/lectures/kkakdugi-marketing-day1/index.html',
    prefix: 'day1',
  },
  {
    html: '/Users/suni/eduzip/public/lectures/kkakdugi-marketing-day2/index.html',
    prefix: 'day2',
  },
];

for (const task of tasks) {
  console.time(task.prefix);
  const meta = await captureFile(task.html, SLIDES_DIR, task.prefix);
  fs.writeFileSync(
    path.join(OUT_DIR, `${task.prefix}.json`),
    JSON.stringify(meta, null, 2)
  );
  console.timeEnd(task.prefix);
  console.log(`  wrote ${task.prefix}.json (${meta.length} slides)`);
}
console.log('DONE');
